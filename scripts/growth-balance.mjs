import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { runGrowthCampaign, growthStrategies, cardMetadata, GROWTH_PROTOCOL } from '../src/growth-simulation.js';
import { POLICY_VERSION, DEFAULT_PROFILE } from '../src/ai.js';

const SOURCES = ['src/attributes.js', 'src/content.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/archetypes.js', 'src/effect-rules.js', 'src/synergies.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/simulation.js', 'src/archetype-simulation.js', 'src/growth-simulation.js', 'src/growth-telemetry.js', 'scripts/growth-balance.mjs'];
const fingerprint = async () => Object.fromEntries(await Promise.all(SOURCES.map(async path => [path, createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')])));
if (!isMainThread) {
  const sourceHashes = await fingerprint();
  parentPort.on('message', task => {
    try { parentPort.postMessage({ taskId: task.id, result: runGrowthCampaign({ seed: task.seed, strategy: task.strategy, difficulty: workerData.difficulty, probeSamples: workerData.probeSamples }) }); }
    catch (error) { parentPort.postMessage({ error: error.stack || error.message }); }
  });
  parentPort.postMessage({ ready: true, sourceHashes });
} else {
  const args = process.argv.slice(2), options = new Map(), valid = ['runs', 'workers', 'difficulty', 'seed', 'output', 'coverage-runs', 'probe-samples', 'cards'];
  for (let i = 0; i < args.length; i++) {
    const key = args[i].slice(2), value = args[++i];
    if (!valid.includes(key) || options.has(key) || value === undefined || value.startsWith('--')) throw new Error('Use unique --name value options.');
    options.set(key, value);
  }
  const opt = (key, fallback) => options.get(key) ?? fallback;
  const integer = (key, fallback, low, high) => { const value = Number(opt(key, fallback)); if (!Number.isInteger(value) || value < low || value > high) throw new Error(`${key} must be ${low}–${high}.`); return value; };
  const runs = integer('runs', 100, 0, 5000), coverageRuns = integer('coverage-runs', 0, 0, 5000), workers = integer('workers', 4, 1, 8), difficulty = integer('difficulty', 10, 1, 20), probeSamples = integer('probe-samples', 12, 1, 64);
  const seed = opt('seed', 'growth-v060-20261021'), output = resolve(opt('output', `docs/benchmarks/growth-d${difficulty}.json`)), metadata = cardMetadata();
  const targets = opt('cards', metadata.map(card => card.id).join(',')).split(',');
  if (targets.some(id => !metadata.some(card => card.id === id)) || new Set(targets).size !== targets.length) throw new Error('Unknown or duplicate target cards.');
  const tasks = [];
  for (const strategy of growthStrategies()) for (let index = 0; index < runs; index++) tasks.push({ id: tasks.length, strategy, seed: `${seed}:d${difficulty}:${strategy.id}:${index}` });
  for (const targetId of targets) for (let index = 0; index < coverageRuns; index++) {
    const strategy = { id: `card:${targetId}`, kind: 'coverage', targetId, name: metadata.find(card => card.id === targetId).name };
    tasks.push({ id: tasks.length, strategy, seed: `${seed}:d${difficulty}:${strategy.id}:${index}` });
  }
  if (!tasks.length) throw new Error('At least one campaign is required.');
  const sourceHashes = await fingerprint(), start = performance.now(), pool = [], workerHashes = [], campaigns = new Array(tasks.length);
  let nextTask = 0, completed = 0, finished = false, lastLog = -1;
  const dispatch = worker => { if (nextTask < tasks.length) { worker.task = tasks[nextTask++]; worker.postMessage(worker.task); } };
  try {
    await new Promise((resolveBatch, reject) => {
      for (let i = 0; i < Math.min(workers, tasks.length); i++) {
        const worker = new Worker(new URL(import.meta.url), { workerData: { difficulty, probeSamples } }); pool.push(worker);
        worker.on('error', reject); worker.on('exit', code => { if (!finished) reject(new Error(`Worker exited prematurely (${code}).`)); });
        worker.on('message', message => {
          if (message.error) { reject(new Error(message.error)); return; }
          if (message.ready) { workerHashes.push(message.sourceHashes); dispatch(worker); return; }
          if (message.taskId !== worker.task?.id) { reject(new Error('Unexpected result.')); return; }
          campaigns[message.taskId] = message.result; completed++;
          const percent = Math.floor(completed / tasks.length * 100);
          if (percent >= lastLog + 5) { lastLog = percent; console.log(`${percent}% ${completed}/${tasks.length} campaigns; ${Math.round((performance.now() - start) / 1000)}s`); }
          if (completed === tasks.length) { finished = true; resolveBatch(); } else dispatch(worker);
        });
      }
    });
  } finally { finished = true; await Promise.all(pool.map(worker => worker.terminate())); }
  const sourceStable = JSON.stringify(sourceHashes) === JSON.stringify(await fingerprint()) && workerHashes.every(hashes => JSON.stringify(hashes) === JSON.stringify(sourceHashes));
  const manifest = { version: GROWTH_PROTOCOL.version, measuredVersion: JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version, seed, difficulty, runsPerStrategy: runs, coverageRunsPerTarget: coverageRuns, targets: coverageRuns ? targets : [], n: campaigns.length, protocol: { ...GROWTH_PROTOCOL, probeSamples }, policyVersion: POLICY_VERSION, profile: DEFAULT_PROFILE, sourceHashes, sourceStable, elapsedMs: Math.round(performance.now() - start), metadata };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output.replace(/\.json$/, '') + '.campaigns.json.gz', gzipSync(JSON.stringify({ manifest, campaigns })));
  await writeFile(output, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Saved ${campaigns.length} campaigns to ${output}; sourceStable=${sourceStable}; incomplete=${campaigns.filter(c => c.stopped).length}; ${manifest.elapsedMs}ms`);
  if (!sourceStable || campaigns.some(c => c.stopped)) process.exitCode = 1;
}
