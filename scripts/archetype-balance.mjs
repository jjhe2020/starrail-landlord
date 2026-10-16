import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { ARCHETYPES } from '../src/archetypes.js';
import { CHARACTERS } from '../src/content.js';
import { DEFAULT_PROFILE, POLICY_VERSION } from '../src/ai.js';
import { runArchetypeCampaign, buildArchetypeStrategies, summarizeArchetypeBenchmark, compactArchetypeCampaign, ARCHETYPE_BENCHMARK_VERSION, PROBE_PROTOCOL } from '../src/archetype-simulation.js';

const SOURCES = ['src/content.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/archetypes.js', 'src/effect-rules.js', 'src/synergies.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/simulation.js', 'src/archetype-simulation.js', 'scripts/archetype-balance.mjs'];
async function fingerprint() {
  return Object.fromEntries(await Promise.all(SOURCES.map(async path => [path, createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')])));
}

if (!isMainThread) {
  const sourceHashes = await fingerprint();
  parentPort.on('message', task => {
    try {
      const seed = `${workerData.seed}:${workerData.split}:combat:${task.index}`;
      const result = runArchetypeCampaign({ seed, difficulty: workerData.difficulty, strategy: task.strategy, strength: workerData.strength, lookahead: workerData.lookahead, probeSamples: workerData.probeSamples });
      parentPort.postMessage({ taskId: task.id, result });
    } catch (error) { parentPort.postMessage({ error: error.stack || error.message }); }
  });
  parentPort.postMessage({ ready: true, sourceHashes });
} else {
  const args = process.argv.slice(2), options = new Map();
  const valid = ['runs', 'workers', 'difficulty', 'seed', 'split', 'output', 'strength', 'probe-samples', 'strategies', 'lookahead'];
  for (let i = 0; i < args.length; i++) {
    const key = args[i].slice(2), value = args[++i];
    if (!valid.includes(key) || options.has(key) || value === undefined || value.startsWith('--')) throw new Error('Use unique --name value options.');
    options.set(key, value);
  }
  const option = (name, fallback) => options.get(name) ?? fallback;
  const integer = (name, fallback, low, high) => { const value = Number(option(name, fallback)); if (!Number.isInteger(value) || value < low || value > high) throw new Error(`${name} must be ${low}–${high}.`); return value; };
  const runs = integer('runs', 100, 1, 2000), workers = integer('workers', 4, 1, 8), difficulty = integer('difficulty', 10, 1, 20), probeSamples = integer('probe-samples', 3, 1, 32);
  const seed = option('seed', 'archetype-v050-fixed'), split = option('split', 'holdout'), strength = Number(option('strength', 10));
  if (!['calibration', 'holdout', 'stress'].includes(split)) throw new Error('split must be calibration, holdout, or stress.');
  if (!Number.isFinite(strength) || strength < 0 || strength > 100) throw new Error('strength must be in [0,100].');
  if (!['true', 'false'].includes(option('lookahead', 'false'))) throw new Error('lookahead must be true or false.');
  const lookahead = option('lookahead', 'false') === 'true';
  let strategies = buildArchetypeStrategies();
  if (options.has('strategies')) {
    const requested = option('strategies').split(',');
    if (requested.some(id => !strategies.some(strategy => strategy.id === id))) throw new Error('Unknown strategy.');
    strategies = strategies.filter(strategy => strategy.id === 'baseline' || requested.includes(strategy.id));
  }
  const output = resolve(option('output', `docs/benchmarks/archetype-${split}-d${difficulty}.json`));
  const sourceHashes = await fingerprint(), start = performance.now(), tasks = [];
  for (let index = 0; index < runs; index++) for (const strategy of strategies) tasks.push({ id: tasks.length, index, strategy });
  const pool = [], workerHashes = [], results = new Array(tasks.length);
  let nextTask = 0, completed = 0, finished = false, lastLog = -1;
  const dispatch = worker => { if (nextTask < tasks.length) { worker.task = tasks[nextTask++]; worker.postMessage(worker.task); } };
  try {
    await new Promise((resolveBatch, reject) => {
      for (let i = 0; i < Math.min(workers, tasks.length); i++) {
        const worker = new Worker(new URL(import.meta.url), { workerData: { seed, split, difficulty, strength, lookahead, probeSamples } });
        pool.push(worker);
        worker.on('error', reject);
        worker.on('exit', code => { if (!finished) reject(new Error(`Worker exited prematurely (${code}).`)); });
        worker.on('message', message => {
          if (message.error) { reject(new Error(message.error)); return; }
          if (message.ready) { workerHashes.push(message.sourceHashes); dispatch(worker); return; }
          if (message.taskId !== worker.task?.id) { reject(new Error('Unexpected task result.')); return; }
          results[message.taskId] = message.result; completed++;
          const percentage = Math.floor(completed / tasks.length * 100);
          if (percentage >= lastLog + 5) { lastLog = percentage; console.log(`${percentage}% ${completed}/${tasks.length} campaigns; ${Math.round((performance.now() - start) / 1000)}s`); }
          if (completed === tasks.length) { finished = true; resolveBatch(); } else dispatch(worker);
        });
      }
    });
  } finally { finished = true; await Promise.all(pool.map(worker => worker.terminate())); }
  const sourceStable = JSON.stringify(sourceHashes) === JSON.stringify(await fingerprint()) && workerHashes.every(hashes => JSON.stringify(hashes) === JSON.stringify(sourceHashes));
  const report = { version: ARCHETYPE_BENCHMARK_VERSION, samplePurpose: split, seed, difficulty, contentCount: CHARACTERS.length, runsPerStrategy: runs, strength, lookahead, policyVersion: POLICY_VERSION, profile: structuredClone(DEFAULT_PROFILE),
    planning: { source: 'shared-AI-marginal-reward-scores', knownFutureRewards: false, actions: 'same real engine resource actions; selected lines protect their final recruited identity only while safe; polluted units are never protected; visible missing required core or last forming identity cancels reroll only while safe', baseStrength: strength, newIdentityBonus: 'strength × lineWeight × survivalScale', alreadyOwnedIdentityBonus: 'strength × lineWeight × 0.45 × survivalScale', missingCoreBonus: 'strength × 0.6 × survivalScale', lineWeight: { formed: 1.8, unformedWithOtherFormed: 0.5, unformed: 1 }, survivalScale: '0 if hp/maxHp<.3 with shield<10, or <=2 encounter spins remain and enemy HP exceeds .9 × last observed damage × remaining spins, or last encounter spin; .25 if hp/maxHp<.55 with shield<15 or <=2 encounter spins; otherwise1. No hidden RNG or future board used.', temperature: DEFAULT_PROFILE.temperature, skip: 'retained as a real competing action', adaptive: 'first visible offer chooses 2/3 lines; >=10 spins retain at most2; >=12 with a formed line retain only formed plus one >=0.6-progress backup; >=18 with no formed retain one; >=2 formed retain two; >=6 spins under critical health or trailing deadline drop unformed lines below .7 progress, retaining at least one' },
    probeProtocol: { ...PROBE_PROTOCOL, samples: probeSamples }, sourceHashes, sourceStable, elapsedMs: Math.round(performance.now() - start),
    archetypes: ARCHETYPES.map(({ id, name, threshold, coreRequired, memberIds, coreIds, effects }) => ({ id, name, threshold, coreRequired, memberIds, coreIds, effects })),
    ...summarizeArchetypeBenchmark(results, strategies), campaigns: results.map(compactArchetypeCampaign) };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
  for (const entry of report.strategies) console.log(`${entry.id}: wins ${entry.wins}/${entry.n}, formed ${entry.formation.formed}/${entry.n}; pre=${entry.beforeFormation.mean?.toFixed(3) ?? 'n/a'} post=${entry.afterFormation.mean?.toFixed(3) ?? 'n/a'} effect=${entry.effectsOnlyPowerRatio.mean?.toFixed(3) ?? 'n/a'} growth=${entry.effectsOnlyGrowthPerSpin.mean?.toFixed(3) ?? 'n/a'}; incomplete=${entry.incomplete}`);
  console.log(`Report ${output}; sourceStable=${sourceStable}; ${report.elapsedMs}ms`);
  if (!sourceStable || report.strategies.some(strategy => strategy.incomplete)) process.exitCode = 1;
}
