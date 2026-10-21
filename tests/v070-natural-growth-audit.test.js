import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { auditNaturalGrowthInputs } from '../scripts/v070-natural-growth-audit.mjs';

const cards = [
  { id: 'attacker', name: '攻击者', role: 'attack' },
  { id: 'defender', name: '防御者', role: 'defense' },
  { id: 'trainer', name: '培养者', role: 'trainer' },
];
const unit = (id, stars, growth, present = 1) => ({ id, stars, role: cards.find(card => card.id === id).role, growth: 0, endGrowth: growth, present, held: 1 });
const campaign = (strategyId, seed, overrides = {}) => ({
  seed, strategyId, difficulty: 10, phase: 'defeat', floor: 10, stopped: false,
  finalRoster: [{ id: 'attacker', stars: 1, growth: 0 }],
  turns: [{ floor: 10, cards: [unit('attacker', 1, 0)] }], ...overrides,
});

async function workspace(t) {
  const path = await mkdtemp(join(tmpdir(), 'v070-natural-audit-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}
async function report(directory, name, rows, options = {}) {
  const policies = options.policies || [...new Set(rows.map(row => row.strategyId))];
  const header = {
    sourceStable: true, gameVersion: '0.7.0', policyVersion: 'fixture-policy',
    sourceHashes: { 'src/engine.js': 'a'.repeat(64), 'src/content.js': 'b'.repeat(64) },
    config: { mode: 'campaigns', difficulty: 10 }, cards,
    strategies: policies.map(id => ({ id })), ...options.header,
  };
  const records = [
    { kind: 'header', format: 'v070-results-jsonl-v1', expectedCounts: { rows: rows.length, future: 0 }, value: header },
    ...rows.map(value => ({ kind: 'row', value })),
    { kind: 'end', counts: { rows: rows.length, future: 0 } },
  ];
  if (options.truncated) records.pop();
  const text = records.map(record => JSON.stringify(record)).join('\n') + '\n';
  const bytes = name.endsWith('.gz') ? gzipSync(text) : Buffer.from(text);
  const path = join(directory, name);
  await writeFile(path, bytes);
  return { path, sha256: createHash('sha256').update(bytes).digest('hex') };
}

test('natural audit distinguishes the final roster, actual terminal encounter and actual late appearances', async t => {
  const directory = await workspace(t);
  const first = campaign('baseline', 'shared-seed', {
    finalRoster: [{ id: 'attacker', stars: 2, growth: 2 }],
    turns: [
      { floor: 8, cards: [unit('defender', 3, 200)] },
      { floor: 9, cards: [unit('defender', 3, 18, 0), unit('attacker', 1, 2), unit('trainer', 1, 0, 0)] },
      { floor: 10, cards: [unit('attacker', 2, 4), unit('defender', 3, 20, 0), unit('trainer', 1, 0)] },
    ],
  });
  const second = campaign('tag-policy', 'shared-seed', {
    floor: 11, finalRoster: [{ id: 'attacker', stars: 1, growth: 4 }],
    turns: [
      { floor: 9, cards: [unit('attacker', 1, 10, 0), unit('defender', 1, 3)] },
      { floor: 11, cards: [unit('attacker', 1, 4)] },
    ],
  });
  const input = await report(directory, 'natural.jsonl.gz', [first, second]);
  const result = await auditNaturalGrowthInputs([input.path]), row = result.difficulties[0];
  assert.equal(result.sources[0].sha256, input.sha256, 'retain the compressed raw archive hash, rather than a derived JSON hash');
  assert.equal(result.frozenSourceHashes['src/engine.js'], 'a'.repeat(64));
  assert.equal(row.campaignCount, 2);
  assert.equal(row.sharedSeedBlockCount, 1, 'two policies on a common seed are one seed block');
  assert.equal(row.policyCount, 2);
  assert.deepEqual(row.samplesPerPolicy, { baseline: 1, 'tag-policy': 1 });
  assert.equal(row.finalRosterRunMaximumGrowth.median, 3);
  assert.equal(row.finalRosterRunMaximumGrowth.max, 4, 'earlier and departed-card snapshots are not final roster growth');
  assert.equal(row.finalRosterRunMaximumGrowth.campaignsAtLeast6, 0);
  assert.equal(row.finalRosterInstanceGrowth.n, 2);
  assert.deepEqual(row.lateObservedGrowth, {
    maxAllHeld: 20, maxActuallyPresent: 4, heldInstanceTurns: 9, presentInstanceTurns: 5,
    maxAllHeldByRole: { attack: 10, defense: 20, amplifier: null, trainer: 0, disruptor: null },
    maxActuallyPresentByRole: { attack: 4, defense: 3, amplifier: null, trainer: 0, disruptor: null },
  });
  assert.deepEqual(row.terminalEncounterStars.actualTerminalFloorCounts, { 10: 1, 11: 1 });
  assert.deepEqual(row.terminalEncounterStars.counts, { 1: 2, 2: 1, 3: 0 });
  assert.equal(row.terminalEncounterStars.shares[2], 1 / 3, 'holding an absent three-star card must not increase appearance shares');
  assert.equal(row.terminalEncounterStars.campaignsWithRecordedTerminalTurn, 2);
  assert.equal(row.terminalEncounterStars.sharedSeedsWithRecordedTerminalTurn, 1);
  assert.deepEqual(row.lateRoleAppearanceShares.counts, { attack: 3, defense: 1, amplifier: 0, trainer: 1, disruptor: 0 });
  assert.equal(row.lateRoleAppearanceShares.shares.attack, 3 / 5);
  assert.match(result.definitions.population, /No confidence intervals/);
});

test('natural audit counts growth thresholds per campaign and preserves missing late observations', async t => {
  const directory = await workspace(t);
  const input = await report(directory, 'early-end.jsonl', [6, 12].map((growth, index) => campaign('baseline', `seed-${index}`, {
    floor: 3, finalRoster: [{ id: 'attacker', stars: 1, growth }], turns: [{ floor: 2, cards: [unit('attacker', 1, growth)] }],
  })));
  const row = (await auditNaturalGrowthInputs([input.path])).difficulties[0];
  assert.equal(row.finalRosterRunMaximumGrowth.campaignsAtLeast6, 2);
  assert.equal(row.finalRosterRunMaximumGrowth.campaignsAtLeast12, 1);
  assert.equal(row.finalRosterRunMaximumGrowth.median, 9);
  assert.equal(row.lateObservedGrowth.maxAllHeld, null, 'unobserved late growth is missing, not a measured zero');
  assert.equal(row.lateRoleAppearanceShares.shares.attack, null);
  assert.equal(row.terminalEncounterStars.campaignsWithRecordedTerminalTurn, 0);
  assert.equal(row.terminalEncounterStars.shares[1], null);
});

test('natural audit rejects duplicate paths or campaign identities and different frozen sources', async t => {
  const directory = await workspace(t), rows = [campaign('baseline', 'seed')];
  const first = await report(directory, 'first.jsonl.gz', rows);
  const duplicate = await report(directory, 'duplicate.jsonl', rows);
  const changed = await report(directory, 'changed.jsonl', [campaign('baseline', 'other-seed')], {
    header: { sourceHashes: { 'src/engine.js': 'c'.repeat(64), 'src/content.js': 'b'.repeat(64) } },
  });
  await assert.rejects(auditNaturalGrowthInputs([first.path, first.path]), /Duplicate raw input path/);
  await assert.rejects(auditNaturalGrowthInputs([first.path, duplicate.path]), /Duplicate campaign sample\/policy/);
  await assert.rejects(auditNaturalGrowthInputs([first.path, changed.path]), /Different frozen source fingerprint/);
});

test('natural audit rejects an incomplete policy seed block and a truncated raw archive', async t => {
  const directory = await workspace(t);
  const incomplete = await report(directory, 'unbalanced.jsonl', [campaign('baseline', 'seed-a'), campaign('tag-policy', 'seed-b')]);
  await assert.rejects(auditNaturalGrowthInputs([incomplete.path]), /complete seed set/);
  const truncated = await report(directory, 'truncated.jsonl.gz', [campaign('baseline', 'seed')], { truncated: true });
  await assert.rejects(auditNaturalGrowthInputs([truncated.path]), /Truncated raw report/);
});
