import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { buildTagStrategies, summarizeTagCampaigns } from '../src/balance-v070.js';
import { readV070Report, writeV070Report, hashV070File } from './v070-results-io.mjs';

const canonical = value => JSON.stringify(sortObject(value));
function sortObject(value) { if (Array.isArray(value)) return value.map(sortObject); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])])); return value; }
const withoutRange = config => Object.fromEntries(Object.entries(config).filter(([key]) => !['start', 'samples'].includes(key)));
const strategySet = strategies => [...strategies].sort((a, b) => a.id.localeCompare(b.id));
const require = (condition, message) => { if (!condition) throw new Error(message); };
const sameMetadata = ['gameVersion', 'protocol', 'policyVersion', 'cards', 'synergies', 'spatialDesign', 'sourceHashes'];
export const REQUIRED_SOURCE_HASHES = ['src/content.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/archetypes.js', 'src/effect-rules.js', 'src/synergies.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/ai-spatial.js', 'src/simulation.js', 'src/balance-v070.js', 'scripts/balance-v070.mjs', 'scripts/v070-results-io.mjs'];

/** Combine observations, never simulate new campaigns or alter the decision rule. */
export function mergeCampaignShards(inputs) {
  require(inputs.length > 0, 'No campaign shards supplied');
  for (const input of inputs) { const report = input.report || input; require(report.config && report.sourceHashes && REQUIRED_SOURCE_HASHES.every(file => /^[a-f0-9]{64}$/.test(report.sourceHashes[file] || '')), 'Missing or invalid required source fingerprints'); }
  const shards = inputs.map(entry => entry.report ? entry : { report: entry }).sort((a, b) => a.report.config.start - b.report.config.start), base = shards[0].report, expectedStrategies = buildTagStrategies();
  require(expectedStrategies.length === 29, 'Frozen strategy population must contain all 29 strategies');
  require(Array.isArray(base.strategies) && canonical(strategySet(base.strategies)) === canonical(strategySet(expectedStrategies)), 'Shard must contain the complete frozen 29-strategy metadata');
  const strategyIds = new Set(expectedStrategies.map(strategy => strategy.id)), records = new Map(), provenanceInputs = []; let expectedStart = 0, totalSamples = 0, elapsedMs = 0;
  for (const input of shards) {
    const report = input.report, config = report.config;
    require(config?.mode === 'campaigns', 'Only campaign shards may be merged');
    require(typeof config.seed === 'string' && config.seed.length > 0 && ['calibration', 'holdout', 'stress'].includes(config.split), 'Invalid campaign seed/split metadata');
    require(!report.derivation?.kind && !report.provenanceInputs, 'Merge original sampling shards rather than a previously merged report');
    require(Number.isSafeInteger(config.start) && config.start >= 0 && Number.isSafeInteger(config.samples) && config.samples > 0, 'Invalid shard sample range');
    require(config.start === expectedStart, config.start < expectedStart ? 'Overlapping shard sample ranges' : 'Missing/noncontinuous shard sample range');
    require(canonical(withoutRange(config)) === canonical(withoutRange(base.config)), 'Shard seed/split/difficulty/strength or other configuration differs');
    require(report.sourceStable === true, 'Every sampling shard must confirm sourceStable=true');
    for (const key of sameMetadata) require(canonical(report[key]) === canonical(base[key]), `Shard metadata/source hashes differ: ${key}`);
    require(Array.isArray(report.strategies) && canonical(strategySet(report.strategies)) === canonical(strategySet(expectedStrategies)), 'Shard does not contain the complete frozen 29-strategy metadata');
    require(Array.isArray(report.rows) && report.rows.length === config.samples * expectedStrategies.length, 'Shard row count does not equal samples x 29 strategies');
    require(Array.isArray(report.future) && report.future.length === 0, 'Campaign shard must not contain card future traces');
    require(Number.isFinite(report.elapsedMs) && report.elapsedMs >= 0, 'Invalid sampling elapsedMs');
    const prefix = `${config.seed}:${config.split}:campaign:`, end = config.start + config.samples;
    for (const run of report.rows) {
      require(typeof run.seed === 'string' && run.seed.startsWith(prefix), 'Campaign seed does not match shard namespace');
      const suffix = run.seed.slice(prefix.length); require(/^(?:0|[1-9]\d*)$/.test(suffix), 'Campaign seed does not contain an exact sample index');
      const sample = Number(suffix); require(Number.isSafeInteger(sample) && sample >= config.start && sample < end, 'Campaign seed falls outside shard sample range');
      require(strategyIds.has(run.strategyId), 'Unknown campaign strategy');
      require(run.difficulty === config.difficulty, 'Campaign difficulty differs from shard');
      require(run.stopped === null && ['victory', 'defeat'].includes(run.phase) && typeof run.won === 'boolean' && run.won === (run.phase === 'victory'), 'Campaign has no completed, consistent terminal outcome');
      require(Number.isInteger(run.floor) && run.floor >= 1 && run.floor <= 12 && (!run.won || run.floor === 12), 'Invalid campaign terminal floor');
      require(Array.isArray(run.turns) && run.turns.length > 0 && run.turns.at(-1)?.floor === run.floor, 'Campaign has no terminal-encounter observations');
      const key = `${sample}|${run.strategyId}`; require(!records.has(key), 'Duplicate seed/strategy observation'); records.set(key, run);
    }
    for (let sample = config.start; sample < end; sample++) for (const id of strategyIds) require(records.has(`${sample}|${id}`), 'Missing seed/strategy observation');
    expectedStart = end; totalSamples += config.samples; elapsedMs += report.elapsedMs;
    provenanceInputs.push({ path: input.path || null, sha256: input.sha256 || null, config: structuredClone(config), elapsedMs: report.elapsedMs, sourceStable: report.sourceStable, rows: report.rows.length });
  }
  const rows = []; for (let sample = 0; sample < totalSamples; sample++) for (const strategy of expectedStrategies) rows.push(records.get(`${sample}|${strategy.id}`));
  const summary = summarizeTagCampaigns(rows, expectedStrategies);
  return { ...base, config: { ...base.config, start: 0, samples: totalSamples }, strategies: expectedStrategies, elapsedMs,
    sourceStable: shards.every(input => input.report.sourceStable === true), summary, rows, future: [], provenanceInputs,
    derivation: { kind: 'campaign-shard-merge', version: 1, newSampling: false, independentSeeds: totalSamples, sampleRange: [0, totalSamples - 1], method: 'Exact union of disjoint continuous original sample ranges; summarizeTagCampaigns is rerun unchanged on the full seed-by-policy matrix.', elapsedMeaning: 'Sum of original shard wall times; overlapping concurrent runs make this a workload figure, not total elapsed calendar time.' } };
}

async function currentFingerprintsMatch(report) {
  for (const [file, sha] of Object.entries(report.sourceHashes)) {
    const actual = createHash('sha256').update(await readFile(new URL(`../${file}`, import.meta.url))).digest('hex');
    require(actual === sha, `Current frozen source differs: ${file}`);
  }
}
export async function runMergeCli(args) {
  const options = new Map(); for (let i = 0; i < args.length; i += 2) { const key = args[i]?.slice(2), value = args[i + 1]; require(['inputs', 'output'].includes(key) && !options.has(key) && value, 'Use --inputs shard1,shard2,shard3 --output merged.jsonl.gz'); options.set(key, value); }
  require(options.has('inputs') && options.has('output'), '--inputs and --output are required');
  const paths = options.get('inputs').split(',').map(path => resolve(path)), output = resolve(options.get('output')); require(/\.jsonl(?:\.gz)?$/.test(output), 'Merged raw output must use .jsonl.gz or .jsonl'); require(!paths.includes(output), 'Do not overwrite an original sampling shard');
  const inputs = []; for (const path of paths) inputs.push({ path, sha256: await hashV070File(path), report: await readV070Report(path) });
  for (const { report } of inputs) await currentFingerprintsMatch(report);
  const merged = mergeCampaignShards(inputs); merged.derivation.sourceHashes = { 'scripts/merge-v070-campaign-shards.mjs': createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex') };
  await currentFingerprintsMatch(merged); await writeV070Report(output, merged);
  console.log(JSON.stringify({ output, samples: merged.config.samples, strategies: merged.strategies.length, rows: merged.rows.length, sourceStable: merged.sourceStable, newSampling: false, inputCount: inputs.length }, null, 2));
  return merged;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await runMergeCli(process.argv.slice(2));
