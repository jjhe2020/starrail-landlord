import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { writeV070Report } from './v070-results-io.mjs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { CHARACTERS } from '../src/content.js';
import { POLICY_VERSION } from '../src/ai.js';
import { BALANCE_CHARACTERS, V080_PROTOCOL, STAGES, ENEMY_SCENARIOS, buildTagStrategies, runCardSample, runLayerSample, runFutureSample, runTagCampaign, summarizeCardSamples, summarizeTagCampaigns, summarizeLayers, summarizeFuture, v080CardMetadata, formalSynergyMetadata, cardComparisons, aggregateCardPanels, summarizeLayerOverview, spatialDesignAudit } from '../src/balance-v080.js';

const SOURCES = [...(await readdir(new URL('../src/', import.meta.url))).filter(name => name.endsWith('.js')).sort().map(name => `src/${name}`), 'scripts/balance-v080.mjs', 'scripts/v070-results-io.mjs'];
async function fingerprint() { return Object.fromEntries(await Promise.all(SOURCES.map(async path => [path, createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')]))); }
function perform(task, config) {
  if (config.mode === 'campaigns') return runTagCampaign({ seed: `${config.seed}:${config.split}:campaign:${task.sample}`, difficulty: config.difficulty, strategy: task.strategy, strength: config.strength });
  const rows = [], future = [];
  for (const background of config.backgrounds) for (const stage of config.stages) for (const enemy of config.enemies) {
    const options = { seed: config.seed, split: config.split, sample: task.sample, focusId: task.focusId, background, stage, enemy };
    rows.push(config.mode === 'cards' ? runCardSample(options) : runLayerSample(options));
  }
  if (config.mode === 'cards' && config.future && CHARACTERS.find(c => c.id === task.focusId).effects.some(effect => ['attackGrowth','summon'].includes(effect.type))) {
    for (const background of config.backgrounds) for (const enemy of config.enemies) future.push(runFutureSample({ seed: config.seed, split: config.split, sample: task.sample, focusId: task.focusId, background, enemy }));
  }
  return { rows, future };
}
if (!isMainThread) {
  const sourceHashes = await fingerprint(); parentPort.postMessage({ ready: true, sourceHashes });
  parentPort.on('message', task => { try { parentPort.postMessage({ taskId: task.id, result: perform(task, workerData) }); } catch (error) { parentPort.postMessage({ error: error.stack || error.message }); } });
} else {
  const options = new Map(), valid = ['mode', 'samples', 'start', 'workers', 'difficulty', 'seed', 'split', 'output', 'cards', 'strategies', 'stages', 'enemies', 'backgrounds', 'future', 'strength'];
  const args = process.argv.slice(2); for (let i = 0; i < args.length; i += 2) { const key = args[i].slice(2), value = args[i + 1]; if (!valid.includes(key) || options.has(key) || !value || value.startsWith('--')) throw new Error('Use unique --name value options.'); options.set(key, value); }
  const option = (key, fallback) => options.get(key) ?? fallback;
  const integer = (key, fallback, min, max) => { const n = Number(option(key, fallback)); if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${key} must be an integer in [${min}, ${max}]`); return n; };
  const select = (key, all) => { const selected = option(key, 'all'); if (selected === 'all') return all; const ids = selected.split(','), values = all.filter(row => ids.includes(row.id)); if (!values.length || values.length !== ids.length) throw new Error(`Unknown ${key}`); return values; };
  const mode = option('mode', 'cards'); if (!['cards', 'layers', 'campaigns'].includes(mode)) throw new Error('mode: cards, layers, or campaigns');
  const split = option('split', 'calibration'); if (!['calibration', 'holdout', 'stress'].includes(split)) throw new Error('split: calibration, holdout, or stress');
  const samples = integer('samples', mode === 'campaigns' ? V080_PROTOCOL.campaignBatches[0] : V080_PROTOCOL.cardBatches[0], 1, 2000), start = integer('start', 0, 0, 100000), workers = integer('workers', 4, 1, 8), difficulty = integer('difficulty', 10, 1, 20), seed = option('seed', 'v080-migration1'), strength = Number(option('strength', V080_PROTOCOL.preferenceStrength));
  if (!Number.isFinite(strength) || strength < 0 || strength > 100) throw new Error('strength must be [0,100]'); if (!['true', 'false'].includes(option('future', 'true'))) throw new Error('future: true or false');
  const backgrounds = option('backgrounds', 'generic,compatible').split(','); if (backgrounds.some(id => !['generic', 'compatible'].includes(id)) || new Set(backgrounds).size !== backgrounds.length) throw new Error('Unknown backgrounds');
  const cards = select('cards', BALANCE_CHARACTERS), strategies = select('strategies', buildTagStrategies());
  const config = { mode, samples, start, difficulty, seed, split, strength, backgrounds, stages: select('stages', STAGES), enemies: select('enemies', ENEMY_SCENARIOS), future: option('future', 'true') === 'true' };
  const tasks = []; for (let sample = start; sample < start + samples; sample++) for (const row of mode === 'campaigns' ? strategies : cards) tasks.push({ id: tasks.length, sample, ...(mode === 'campaigns' ? { strategy: row } : { focusId: row.id }) });
  const output = resolve(option('output', `docs/benchmarks/v080-${mode}-${split}${mode === 'campaigns' ? `-d${difficulty}` : ''}.jsonl.gz`)), sourceHashes = await fingerprint(), results = new Array(tasks.length), workerHashes = [], pool = [];
  if (!/\.jsonl(?:\.gz)?$/.test(output)) throw new Error('New raw reports require .jsonl.gz (or .jsonl); historical .json.gz is read-only compatibility.');
  let dispatched = 0, completed = 0, finished = false, lastLog = -1; const started = performance.now();
  const dispatch = worker => { if (dispatched < tasks.length) { worker.task = tasks[dispatched++]; worker.postMessage(worker.task); } };
  try {
    await new Promise((resolveBatch, reject) => { for (let i = 0; i < Math.min(workers, tasks.length); i++) {
      const worker = new Worker(new URL(import.meta.url), { workerData: config }); pool.push(worker); worker.on('error', reject); worker.on('exit', code => { if (!finished) reject(new Error(`Worker exited prematurely (${code})`)); });
      worker.on('message', message => { if (message.error) { reject(new Error(message.error)); return; } if (message.ready) { workerHashes.push(message.sourceHashes); dispatch(worker); return; } if (message.taskId !== worker.task?.id) { reject(new Error('Unexpected result')); return; }
        results[message.taskId] = message.result; completed++; const percent = Math.floor(completed / tasks.length * 100); if (percent >= lastLog + 5) { lastLog = percent; console.log(`${percent}% ${completed}/${tasks.length}; ${Math.round((performance.now() - started) / 1000)}s`); } if (completed === tasks.length) { finished = true; resolveBatch(); } else dispatch(worker);
      });
    } });
  } finally { finished = true; await Promise.all(pool.map(worker => worker.terminate())); }
  const sourceStable = JSON.stringify(sourceHashes) === JSON.stringify(await fingerprint()) && workerHashes.every(hashes => JSON.stringify(hashes) === JSON.stringify(sourceHashes));
  const rows = mode === 'campaigns' ? results : results.flatMap(result => result.rows), future = mode === 'campaigns' ? [] : results.flatMap(result => result.future);
  const summary = mode === 'cards' ? summarizeCardSamples(rows) : mode === 'layers' ? summarizeLayers(rows) : summarizeTagCampaigns(rows, strategies);
  const aggregatePanels = mode === 'cards' ? aggregateCardPanels(rows) : [];
  const report = { gameVersion: JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version, protocol: V080_PROTOCOL, config, spatialDesign: spatialDesignAudit(), policyVersion: POLICY_VERSION, sourceHashes, sourceStable, elapsedMs: Math.round(performance.now() - started), cards: v080CardMetadata(), synergies: formalSynergyMetadata(), strategies: mode === 'campaigns' ? strategies : undefined, summary, layerOverview: mode === 'layers' ? summarizeLayerOverview(rows) : undefined, cardOverview: mode === 'cards' ? summarizeCardSamples(aggregatePanels) : undefined, overviewComparisons: mode === 'cards' ? cardComparisons(aggregatePanels) : undefined, cardComparisons: mode === 'cards' ? cardComparisons(rows) : undefined, futureSummary: summarizeFuture(future), rows, future };
  await writeV070Report(output, report);
  const summaryOutput = output.replace(/\.jsonl?(?:\.gz)?$/, '.summary.json.gz'); await writeFile(summaryOutput, gzipSync(JSON.stringify({ ...report, rows: undefined, future: undefined }, null, 2) + '\n', { level: 9 }));
  console.log(`${mode}: ${rows.length} observations; ${future.length} future traces; sourceStable=${sourceStable}; ${report.elapsedMs}ms; ${output}`);
  if (mode === 'campaigns') for (const row of summary) console.log(`${row.id}: ${row.wins}/${row.n}; paired=${row.pairedBaseline.ci95.mean}; ${row.pairedBaseline.status}`);
  if (!sourceStable || mode === 'campaigns' && summary.some(row => row.incomplete)) process.exitCode = 1;
}
