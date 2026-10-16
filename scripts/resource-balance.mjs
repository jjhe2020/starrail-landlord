import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { runCampaign, summarizeCampaigns, validateResourceCalibration, ACTION_POLICIES } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';
import { POLICY_VERSION } from '../src/ai.js';
import { DIFFICULTY } from '../src/difficulty.js';

const RESOURCE_KEYS = ['rerolls', 'removals', 'credits', 'defense'];
const RESOURCE_LABELS = { rerolls: '重掷', removals: '移除', credits: '信用点消费', defense: '防御规划（自然效果保留）' };
const SOURCE_FILES = ['src/content.js', 'src/effect-rules.js', 'src/synergies.js', 'src/archetypes.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/simulation.js'];
async function sourceFingerprint() {
  return Object.fromEntries(await Promise.all(SOURCE_FILES.map(async path => [path,
    createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')])));
}
function variantsFor(scope) {
  const variants = [];
  for (let mask = 0; mask < 16; mask++) {
    const disabledResources = RESOURCE_KEYS.filter((key, index) => mask & (1 << index));
    const resourceAccess = Object.fromEntries(RESOURCE_KEYS.map(key => [key, !disabledResources.includes(key)]));
    const difficulty = 10 - disabledResources.length * 2;
    if (scope !== 'primary' || disabledResources.length <= 1) variants.push({
      id: mask ? `nominal-${mask}` : 'full-10', difficulty, disabledResources, resourceAccess,
      label: mask ? `禁用${disabledResources.map(key => RESOURCE_LABELS[key]).join('、')}` : '完整资源 AI',
      role: 'nominal',
    });
    if (disabledResources.length === 1) variants.push({
      id: `ablation-${mask}-10`, difficulty: 10, disabledResources, resourceAccess,
      label: `难度 10 禁用${RESOURCE_LABELS[disabledResources[0]]}`, role: 'ablation',
    });
  }
  return variants;
}

if (!isMainThread) {
  if (workerData.rules) Object.assign(DIFFICULTY, workerData.rules);
  parentPort.on('message', variant => {
    try {
      const results = [];
      for (let index = 0; index < workerData.runs; index++) {
        const seed = `${workerData.seed}:holdout:${index}`;
        results.push(runCampaign({ difficulty: variant.difficulty, resourceAccess: variant.resourceAccess,
          seed, policySeed: `${seed}:actions`, profile: workerData.profile, policy: 'ai', lookahead: true }));
        if ((index + 1) % 50 === 0) parentPort.postMessage({ type: 'progress', id: variant.id, done: index + 1 });
      }
      parentPort.postMessage({ type: 'result', variant: { ...variant, summary: summarizeCampaigns(results) },
        outcomes: results.map(result => ({ won: result.won, stopped: result.stopped })) });
    } catch (error) { parentPort.postMessage({ type: 'error', message: error.stack || error.message }); }
  });
} else {
  const args = process.argv.slice(2);
  const option = (key, fallback) => { const index = args.indexOf(`--${key}`); return index < 0 ? fallback : args[index + 1]; };
  const runs = Number(option('runs', '1000'));
  const scope = option('scope', 'all');
  if (!['all', 'primary'].includes(scope)) throw new Error('scope must be all or primary.');
  const concurrency = Number(option('workers', '4'));
  if (!Number.isInteger(runs) || runs < 1 || runs > 2000 || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error('runs must be 1–2000; workers must be 1–8.');
  const seed = option('seed', 'resources-release-v1-20261013');
  const samplePurpose = option('sample-purpose', 'release');
  if (!['calibration', 'release'].includes(samplePurpose)) throw new Error('sample-purpose must be calibration or release.');
  const output = resolve(option('output', 'docs/benchmarks/resource-balance-latest.json'));
  let profile = DEFAULT_PROFILE;
  if (option('profile')) { const value = JSON.parse(await readFile(resolve(option('profile')), 'utf8')); profile = validateProfile(value.profile || value); if (!profile) throw new Error('Invalid profile'); }
  let rules = null;
  if (option('rules')) { rules = JSON.parse(await readFile(resolve(option('rules')), 'utf8')); Object.assign(DIFFICULTY, rules); }
  const variants = variantsFor(scope);
  const results = new Map();
  const outcomeSets = new Map();
  const progress = new Map();
  const workers = [];
  let next = 0;
  let lastProgress = -1;
  const started = performance.now();
  const sourceHashes = await sourceFingerprint();
  try {
    await new Promise((resolveBatch, reject) => {
      const dispatch = worker => { if (next < variants.length) worker.postMessage(variants[next++]); };
      for (let i = 0; i < Math.min(concurrency, variants.length); i++) {
        const worker = new Worker(new URL(import.meta.url), { workerData: { runs, seed, profile, rules } });
        workers.push(worker);
        worker.on('error', reject);
        worker.on('message', message => {
          if (message.type === 'error') { reject(new Error(message.message)); return; }
          if (message.type === 'progress') progress.set(message.id, message.done);
          if (message.type === 'result') {
            const variant = message.variant;
            results.set(variant.id, variant); outcomeSets.set(variant.id, message.outcomes); progress.set(variant.id, runs);
            console.log(`${variant.id}: D${variant.difficulty}, ${variant.summary.wins}/${runs}, incomplete=${variant.summary.incomplete}`);
            if (results.size === variants.length) resolveBatch(); else dispatch(worker);
          }
          const completed = [...progress.values()].reduce((sum, n) => sum + n, 0);
          const percent = Math.floor(completed / (variants.length * runs) * 100);
          if (percent >= lastProgress + 5) { lastProgress = percent; console.log(`progress ${completed}/${variants.length * runs} (${percent}%)`); }
        });
        dispatch(worker);
      }
    });
  } finally { await Promise.all(workers.map(worker => worker.terminate())); }
  const validation = validateResourceCalibration(variants.map(variant => results.get(variant.id)),
    { target: { preferred: .95, min: .90, max: .98, minimumSingleResourceDrop: .05 } });
  const records = validation.variants;
  const full = results.get('full-10').summary;
  const target = { preferred: .95, min: .90, max: .98, minimumSingleResourceDrop: .05, fullDefenseMin: .5 };
  for (const variant of records) {
    const summary = variant.summary;
    variant.targetPassed = variant.passed;
    if (variant.role === 'ablation') {
      const base = outcomeSets.get('full-10'); const compared = outcomeSets.get(variant.id);
      variant.paired = { fullOnlyWins: base.filter((result, index) => result.won && !compared[index].won).length,
        ablationOnlyWins: compared.filter((result, index) => result.won && !base[index].won).length, seeds: runs };
      variant.winRateDrop = full.winRate - summary.winRate;
    }
  }
  target.passed = validation.passed;
  const sourceStable = JSON.stringify(sourceHashes) === JSON.stringify(await sourceFingerprint());
  target.passed &&= sourceStable;
  const report = { version: 3, kind: 'resource-calibration', seed, rules: structuredClone(DIFFICULTY), policyVersion: POLICY_VERSION,
    samplePurpose, sourceHashes, sourceStable,
    profileName: profile.version, profile, lookahead: true, runs, scope,
    resourceGroups: RESOURCE_KEYS.map(id => ({ id, label: RESOURCE_LABELS[id] })),
    variants: records, target, validation: { nominal: validation.nominal, singleD10: validation.singleD10 },
    pairedSeeds: runs, actionPolicies: structuredClone(ACTION_POLICIES),
    elapsedMs: performance.now() - started };
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Report: ${output}; target ${target.passed ? 'PASS' : 'NOT MET'}; ${Math.round(report.elapsedMs / 1000)} sec`);
  if (args.includes('--require-target') && !target.passed) process.exitCode = 1;
}
