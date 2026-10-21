import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCampaignShards, REQUIRED_SOURCE_HASHES, runMergeCli } from '../scripts/merge-v070-campaign-shards.mjs';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeV070Report } from '../scripts/v070-results-io.mjs';
import { buildTagStrategies, summarizeTagCampaigns, V070_PROTOCOL } from '../src/balance-v070.js';

const strategies = buildTagStrategies(), sourceHashes = Object.fromEntries(REQUIRED_SOURCE_HASHES.map(file => [file, 'a'.repeat(64)]));
function shard(start, samples) {
  const rows = [];
  for (let sample = start; sample < start + samples; sample++) for (const [index, strategy] of strategies.entries()) {
    const won = (sample + index) % 7 < 4, floor = won ? 12 : 3 + sample % 10;
    rows.push({ seed: `test-freeze:holdout:campaign:${sample}`, strategyId: strategy.id, difficulty: 10, won, phase: won ? 'victory' : 'defeat', floor, stopped: null, death: won ? null : sample % 2 ? 'hp' : 'deadline', turns: [{ floor, stage: floor <= 4 ? 'early' : floor <= 8 ? 'mid' : 'late', damage: 25 + sample % 11 + index, cards: [] }] });
  }
  return { gameVersion: 'test', policyVersion: 'fixture', protocol: V070_PROTOCOL, cards: [], synergies: [], spatialDesign: {}, sourceHashes: { ...sourceHashes }, sourceStable: true, strategies: structuredClone(strategies), config: { mode: 'campaigns', seed: 'test-freeze', split: 'holdout', difficulty: 10, strength: 10, start, samples, future: true }, elapsedMs: samples * 2, summary: [], rows, future: [] };
}
function inputs() { return [{ path: '/original-0', sha256: 'first', report: shard(0, 100) }, { path: '/original-100', sha256: 'second', report: shard(100, 150) }, { path: '/original-250', sha256: 'third', report: shard(250, 150) }]; }

test('three original contiguous ranges give exactly the existing n400 statistics and raw ordering', () => {
  const parts = inputs(), result = mergeCampaignShards([parts[2], parts[0], parts[1]]), originalRows = parts.flatMap(input => input.report.rows);
  assert.equal(result.config.samples, 400); assert.equal(result.config.start, 0); assert.equal(result.rows.length, 400 * 29); assert.deepEqual(result.rows, originalRows);
  assert.deepEqual(result.summary, summarizeTagCampaigns(originalRows, strategies));
  assert.equal(result.sourceStable, true); assert.equal(result.derivation.newSampling, false); assert.deepEqual(result.derivation.sampleRange, [0, 399]);
  assert.deepEqual(result.provenanceInputs.map(input => input.sha256), ['first', 'second', 'third']); assert.deepEqual(result.provenanceInputs.map(input => input.config.start), [0, 100, 250]); assert.equal(result.elapsedMs, 800);
});
test('overlapping or missing sample ranges cannot merge', () => {
  assert.throws(() => mergeCampaignShards([shard(0, 100), shard(99, 100)]), /Overlapping/);
  assert.throws(() => mergeCampaignShards([shard(0, 100), shard(101, 100)]), /Missing\/noncontinuous/);
  assert.throws(() => mergeCampaignShards([shard(100, 100)]), /Missing\/noncontinuous/);
});
test('a missing or repeated seed/strategy cannot pass even with unchanged record count', () => {
  const missing = shard(0, 2); missing.rows.pop(); assert.throws(() => mergeCampaignShards([missing]), /row count/);
  const duplicate = shard(0, 2); duplicate.rows[1] = structuredClone(duplicate.rows[0]); assert.throws(() => mergeCampaignShards([duplicate]), /Duplicate seed\/strategy/);
  const outside = shard(0, 2); outside.rows[0].seed = 'test-freeze:holdout:campaign:2'; assert.throws(() => mergeCampaignShards([outside]), /outside shard/);
});
test('strategy metadata must be the complete frozen 29 policies', () => {
  const incomplete = shard(0, 1); incomplete.strategies.pop(); assert.throws(() => mergeCampaignShards([incomplete]), /complete frozen 29/);
  const altered = shard(0, 1); altered.strategies[1].filters = [{ path: 'unregistered' }]; assert.throws(() => mergeCampaignShards([altered]), /complete frozen 29/);
});
test('different rules/AI hashes, missing hashes or unstable sources are rejected', () => {
  const second = shard(1, 1); second.sourceHashes['src/ai.js'] = 'b'.repeat(64); assert.throws(() => mergeCampaignShards([shard(0, 1), second]), /source hashes differ/);
  const missing = shard(0, 1); delete missing.sourceHashes['src/engine.js']; assert.throws(() => mergeCampaignShards([missing]), /required source fingerprints/);
  const unstable = shard(0, 1); unstable.sourceStable = false; assert.throws(() => mergeCampaignShards([unstable]), /sourceStable/);
});
test('configuration and other metadata stay identical apart from the sample range', () => {
  for (const key of ['difficulty', 'strength', 'seed', 'split', 'future']) { const second = shard(1, 1); second.config[key] = key === 'strength' || key === 'difficulty' ? 20 : key === 'future' ? false : key === 'split' ? 'stress' : 'different'; assert.throws(() => mergeCampaignShards([shard(0, 1), second]), /configuration differs/); }
  const second = shard(1, 1); second.policyVersion = 'different-ai'; assert.throws(() => mergeCampaignShards([shard(0, 1), second]), /metadata\/source hashes differ/);
});
test('incomplete, contradictory or observation-free terminal outcomes cannot merge', () => {
  for (const mutate of [run => { run.stopped = 'action-limit'; }, run => { run.phase = 'ready'; }, run => { run.won = !run.won; }, run => { run.turns = []; }]) { const report = shard(0, 1); mutate(report.rows[0]); assert.throws(() => mergeCampaignShards([report]), /terminal/); }
});
test('previous merges are not recounted as fresh sampling shards', () => {
  const report = shard(0, 1); report.provenanceInputs = [{ path: 'earlier' }]; assert.throws(() => mergeCampaignShards([report]), /original sampling shards/);
});

test('CLI verifies current frozen source hashes before publishing any merged artifact', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'v070-merge-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, 'input.jsonl.gz'), output = join(directory, 'merged.jsonl.gz'); await writeV070Report(input, shard(0, 1));
  await assert.rejects(runMergeCli(['--inputs', input, '--output', output]), /Current frozen source differs/);
  await assert.rejects(access(output));
});
