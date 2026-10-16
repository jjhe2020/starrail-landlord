import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { runCampaign, summarizeCampaigns, pairedDifference, normalizeResourceAccess, ACTION_POLICIES } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';
import { POLICY_VERSION, RESOURCE_KEYS } from '../src/ai.js';
import { DIFFICULTY } from '../src/difficulty.js';

const CHUNK_SIZE = 50;
const SOURCE_FILES = ['src/content.js', 'src/effect-rules.js', 'src/synergies.js', 'src/archetypes.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/simulation.js'];
async function sourceFingerprint() {
  return Object.fromEntries(await Promise.all(SOURCE_FILES.map(async path => [path,
    createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')])));
}
const sameHashes = (left, right) => SOURCE_FILES.every(path => left[path] === right[path]);

if (!isMainThread) {
  parentPort.on('message', task => {
    try {
      const results = [];
      for (let offset = 0; offset < task.count; offset++) {
        // Chunk boundaries and worker assignment must never enter a game seed.
        const index = task.start + offset;
        const gameSeed = `${workerData.seed}:holdout:combat:${index}`;
        results.push(runCampaign({ difficulty: workerData.difficulty, resourceAccess: workerData.resourceAccess,
          seed: gameSeed, policySeed: `${gameSeed}:actions`, profile: workerData.profile,
          policy: task.policy, lookahead: workerData.lookahead }));
        if ((offset + 1) % 10 === 0) parentPort.postMessage({ type: 'progress', taskId: task.id, completed: offset + 1 });
      }
      parentPort.postMessage({ type: 'result', taskId: task.id, results });
    } catch (error) { parentPort.postMessage({ type: 'error', message: error.stack || error.message }); }
  });
  parentPort.postMessage({ type: 'ready', sourceHashes: await sourceFingerprint() });
} else {
  const args = process.argv.slice(2);
  const values = new Map();
  const valuedFlags = new Set(['runs', 'workers', 'difficulty', 'disable', 'profile', 'seed', 'output', 'target-min', 'target-max', 'target-rate', 'sample-purpose', 'mode']);
  let lookahead = true;
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--fast' && !values.has('fast')) { lookahead = false; values.set('fast', true); continue; }
    const key = flag.startsWith('--') ? flag.slice(2) : '';
    if (!valuedFlags.has(key) || values.has(key)) throw new Error('Arguments must be known, unique CLI options.');
    const value = args[++index];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} must be followed by a value.`);
    values.set(key, value);
  }
  const option = (name, fallback) => values.has(name) ? values.get(name) : fallback;
  const runs = Number(option('runs', '1000'));
  const requestedWorkers = Number(option('workers', '8'));
  const difficulty = Number(option('difficulty', '10'));
  if (!Number.isInteger(runs) || runs < 1 || runs > 2000) throw new Error('runs must be an integer from 1 to 2000.');
  if (!Number.isInteger(requestedWorkers) || requestedWorkers < 1 || requestedWorkers > 8) throw new Error('workers must be an integer from 1 to 8.');
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 20) throw new Error('difficulty must be an integer from 1 to 20.');
  if (option('mode', 'combat') !== 'combat') throw new Error('mode must be combat.');
  const disabledResources = option('disable', '').split(',').filter(Boolean);
  if (disabledResources.some(key => !RESOURCE_KEYS.includes(key))) throw new Error('disable must be a comma-separated subset of rerolls,removals,credits,defense.');
  const resourceAccess = normalizeResourceAccess(Object.fromEntries(disabledResources.map(key => [key, false])));
  const seed = option('seed', 'release-holdout-v040');
  if (!seed.trim()) throw new Error('seed must be nonempty.');
  const samplePurpose = option('sample-purpose', 'release');
  if (!['release', 'calibration'].includes(samplePurpose)) throw new Error('sample-purpose must be release or calibration.');
  const outputName = option('output', 'docs/benchmarks/balance-parallel-latest.json');
  if (!outputName.trim()) throw new Error('output must be nonempty.');
  const output = resolve(outputName);
  const hasTarget = ['target-min', 'target-max', 'target-rate'].some(key => values.has(key));
  const target = hasTarget ? { min: Number(option('target-min')), max: Number(option('target-max')), preferred: Number(option('target-rate', '0.95')) } : null;
  if (target && (!values.has('target-min') || !values.has('target-max') || !Number.isFinite(target.min) || !Number.isFinite(target.max) || !Number.isFinite(target.preferred) || target.min < 0 || target.max > 1 || target.min > target.preferred || target.preferred > target.max)) {
    throw new Error('target-min and target-max must be in [0, 1], enclosing target-rate.');
  }
  let profile = DEFAULT_PROFILE;
  if (values.has('profile')) {
    const saved = JSON.parse(await readFile(resolve(option('profile')), 'utf8'));
    profile = validateProfile(saved.profile ?? saved);
    if (!profile) throw new Error('profile must be a valid AI profile.');
  }
  // Match benchmarkPolicies: profiles are normalized even when using defaults.
  profile = validateProfile(profile);
  const sourceHashes = await sourceFingerprint();
  const started = performance.now();
  const tasks = [];
  for (let start = 0; start < runs; start += CHUNK_SIZE) for (const policy of ['ai', 'uniform']) {
    tasks.push({ id: tasks.length, policy, start, count: Math.min(CHUNK_SIZE, runs - start) });
  }
  const workersUsed = Math.min(requestedWorkers, tasks.length);
  const results = { ai: Array(runs), uniform: Array(runs) };
  const taskProgress = Array(tasks.length).fill(0);
  const workerSourceHashes = [];
  const workers = [];
  let nextTask = 0, finishedTasks = 0, lastPercent = -10, batchFinished = false;
  const logProgress = () => {
    const completed = taskProgress.reduce((sum, count) => sum + count, 0);
    const percent = Math.floor(completed / (runs * 2) * 100);
    if (percent >= lastPercent + 10) { lastPercent = percent; console.log(`${percent}% combat ${completed}/${runs * 2}`); }
  };
  try {
    await new Promise((resolveBatch, reject) => {
      const dispatch = worker => {
        if (nextTask >= tasks.length) return;
        worker.currentTask = tasks[nextTask++];
        worker.postMessage(worker.currentTask);
      };
      for (let index = 0; index < workersUsed; index++) {
        const worker = new Worker(new URL(import.meta.url), { workerData: { seed, difficulty, resourceAccess, profile, lookahead } });
        workers.push(worker);
        worker.on('error', reject);
        worker.on('exit', code => { if (!batchFinished) reject(new Error(`Benchmark worker exited before completion with code ${code}.`)); });
        worker.on('message', message => {
          if (message.type === 'error') { reject(new Error(message.message)); return; }
          if (message.type === 'ready') { workerSourceHashes[index] = message.sourceHashes; dispatch(worker); return; }
          const task = worker.currentTask;
          if (!task || task.id !== message.taskId) { reject(new Error('Unexpected benchmark worker task.')); return; }
          if (message.type === 'progress') { taskProgress[task.id] = message.completed; logProgress(); return; }
          if (message.type !== 'result' || message.results.length !== task.count) { reject(new Error('Incomplete benchmark worker result.')); return; }
          for (let offset = 0; offset < task.count; offset++) results[task.policy][task.start + offset] = message.results[offset];
          taskProgress[task.id] = task.count;
          finishedTasks++;
          logProgress();
          if (finishedTasks === tasks.length) { batchFinished = true; resolveBatch(); } else dispatch(worker);
        });
      }
    });
  } finally {
    batchFinished = true;
    await Promise.all(workers.map(worker => worker.terminate()));
  }
  // Summarize complete, original-index-ordered campaigns. Chunk averages would
  // corrupt pooled defense usage, confidence intervals and paired comparisons.
  const modes = [{ mode: 'combat', difficulty, resourceAccess,
    ai: summarizeCampaigns(results.ai), uniform: summarizeCampaigns(results.uniform), difference: pairedDifference(results.ai, results.uniform) }];
  const sourceStable = sameHashes(sourceHashes, await sourceFingerprint()) && workerSourceHashes.every(hashes => sameHashes(sourceHashes, hashes));
  const report = { version: 3, kind: 'combat-benchmark', mode: 'combat', difficulty, resourceAccess, seed,
    rules: structuredClone(DIFFICULTY), policyVersion: POLICY_VERSION, actionPolicies: structuredClone(ACTION_POLICIES),
    profileName: profile.name ?? profile.version, profile: structuredClone(profile), lookahead, runs, modes,
    samplePurpose, sourceHashes, sourceStable,
    parallel: { workers: requestedWorkers, workersUsed, chunkSize: CHUNK_SIZE, chunks: tasks.length, resultOrder: 'original-seed-index' },
    elapsedMs: performance.now() - started };
  if (target) report.calibrationTarget = { ...target, passed: sourceStable && modes.every(({ ai }) => ai.winRate >= target.min && ai.winRate <= target.max && ai.incomplete === 0) };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  for (const result of modes) console.log(`${result.mode}: AI ${result.ai.wins}/${runs} (${(result.ai.winRate * 100).toFixed(1)}%), uniform ${result.uniform.wins}/${runs}; incomplete ${result.ai.incomplete}/${result.uniform.incomplete}`);
  console.log(`Report: ${output}; ${Math.round(report.elapsedMs)} ms; workers=${workersUsed}; lookahead=${lookahead}; sourceStable=${sourceStable}`);
  if (target) console.log(`Difficulty target ${(target.min * 100).toFixed(0)}%–${(target.max * 100).toFixed(0)}%: ${report.calibrationTarget.passed ? 'PASS' : 'FAIL'}`);
  if (!sourceStable || target && !report.calibrationTarget.passed) process.exitCode = 1;
}
