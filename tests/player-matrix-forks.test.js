import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { getPlayerPolicy, recommendPlayerAction } from '../src/player-policy.js';
import * as simulation from '../src/player-matrix-simulation.js';
import { buildForkPlan } from '../src/player-matrix-plan.js';
import { collectForkEntries, loadForkEntry, runForkTask, forkActionSignature } from '../scripts/player-matrix-forks.mjs';
import { writeMatrixShard, readMatrixShard } from '../scripts/player-matrix-io.mjs';
import { executeMatrixPlan } from '../scripts/player-matrix.mjs';

// These are legal, deliberately prepared engine states, not new balance data.
// We inspect real actions and ledgers; no fake policy chooses the branch result.
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const policyFor = horizon => getPlayerPolicy(`matrix:baseline|H:${horizon}|J:mixed|R:balanced`);
const roots = new Map(), branchRuns = new Map();
const stripTiming = rows => rows.map(({ decisionMs, actionMs, ...row }) => row);
function readyFloor(floor, seed, difficulty = 8) {
  let state = newGame({ seed, difficulty });
  while (state.floor < floor) state = state.phase === 'ready' ? spin({ ...state, enemies: state.enemies.map(enemy => ({ ...enemy, hp: .01 })) }) : skipReward(state);
  return state;
}
function preparedSupplyState(worldIndex = 0) {
  const seed = worldIndex === 0 ? 'matrix-fork-window-fixture' : `matrix-fork-window-fixture:${worldIndex}`;
  const state = readyFloor(2, seed);
  state.hp = 50; state.maxHp = 120; state.coins = 200; state.items = ['corrupt_fruit'];
  state.roster = ['1002', '1013', '1102', '1205', '1305'].map((id, index) => ({ uid: `u${index + 1}`, id, stars: 3, attackBonus: 50, growth: 50, ticks: 0 }));
  state.uidCounter = 6; state.board = Array(20).fill(null);
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 700; enemy.attack = 1; });
  assert.ok(validateSave(state));
  return state;
}
function rootFor(horizon = 'balanced', worldIndex = 0) {
  const key = `${horizon}:${worldIndex}`;
  if (!roots.has(key)) {
    const state = preparedSupplyState(worldIndex), policy = policyFor(horizon);
    assert.equal(recommendPlayerAction(state, policy).type, 'supply', 'the prepared entry is a real planned resource action');
    const run = simulation.runPlayerCampaign({ initialState: state, policy, seed: state.seed, behaviorSeed: worldIndex === 0 ? 'fork-window-behavior' : `${state.seed}:actions`, record: true, captureOpportunities: true });
    assert.equal(run.stopped, null); assert.ok(['victory', 'defeat'].includes(run.phase)); assert.deepEqual(run.errors, []); assert.equal(run.conservationPassed, true);
    roots.set(key, run);
  }
  return roots.get(key);
}
function entryFor(run, kind = 'supply', floor = 2, worldIndex = 0, rootTrialKey = 'controlled-root') {
  const op = run.opportunities.find(candidate => candidate.kind === kind && candidate.firstAffectedFloor === floor);
  assert.ok(op, `the real root must expose ${kind} at ${floor}`);
  const rootAction = run.actionTrace.find(row => row.index === op.actionIndex);
  assert.equal(rootAction.type, kind);
  const cellId = `D${run.difficulty}:F${floor}:${kind}`;
  return { id: `${cellId}:W${worldIndex}:${run.policy.H.id}`, cellId, strategyId: run.strategyId, worldIndex, difficulty: run.difficulty, affectedFloor: floor, kind, rootTrialKey, snapshot: op.snapshot, opportunity: { ...op, snapshot: undefined }, referenceFinalStateHash: run.finalStateHash, referenceActionHash: digest(forkActionSignature(run.actionTrace.filter(row => row.index >= op.actionIndex))) };
}
const withSnapshot = { runPlayerCampaign: options => simulation.runPlayerCampaign({ ...options, includeFinalSnapshot: true }) };
function taskFor(entry, branch = 'A', behaviorRep = 0) { return buildForkPlan('fork-screen', [entry]).task('ABCDE'.indexOf(branch) * 2 + behaviorRep); }
function branchFor(branch, behaviorRep = 0) {
  const key = `${branch}:${behaviorRep}`;
  if (!branchRuns.has(key)) {
    const entry = entryFor(rootFor());
    branchRuns.set(key, runForkTask(withSnapshot, entry, taskFor(entry, branch, behaviorRep), getPlayerPolicy));
  }
  return branchRuns.get(key);
}
function assertRealTerminal(run) {
  assert.equal(run.stopped, null); assert.deepEqual(run.errors, []); assert.equal(run.conservationPassed, true);
  assert.deepEqual(run.finalSnapshot.game.resourceAccess, { rerolls: true, removals: true, credits: true, defense: true });
  assert.ok(run.floors.every(floor => floor.conservation.total.passed === true));
}

function rewardRemovalRoot() {
  const state = readyFloor(4, 'matrix-fork-reward-remove');
  state.hp = state.maxHp = 120; state.shield = 100; state.coins = 200;
  const extra = ['1002', '1013', '1102', '1205', '1305'].map((id, index) => ({ uid: `u${index + 6}`, id, stars: 3, attackBonus: 50, growth: 50, ticks: 0 }));
  state.roster.push(...extra); state.uidCounter = 11;
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 1000000; enemy.attack = 1; });
  const reward = spin(state), policy = policyFor('balanced');
  assert.equal(reward.phase, 'recruit'); assert.equal(reward.pendingFloor, false); assert.ok(validateSave(reward));
  assert.equal(recommendPlayerAction(reward, policy).type, 'remove');
  const run = simulation.runPlayerCampaign({ initialState: reward, policy, seed: state.seed, behaviorSeed: 'remove-window-behavior', record: true, captureOpportunities: true });
  assert.equal(run.stopped, null);
  return run;
}
function rewardRerollRoot() {
  const state = readyFloor(2, 'fork-reroll-controlled');
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 10000; });
  const reward = spin(state); reward.coins = 100; reward.rerolls = 10; reward.choices = ['cyrene', 'aha', '1306'];
  const policy = policyFor('balanced'); assert.ok(validateSave(reward)); assert.equal(recommendPlayerAction(reward, policy).type, 'reroll');
  const run = simulation.runPlayerCampaign({ initialState: reward, policy, seed: state.seed, behaviorSeed: 'reroll-window-behavior', record: true, captureOpportunities: true });
  assert.equal(run.stopped, null);
  return run;
}

test('normal rep0 independently reproduces actual root actions, random draws, floors and resource ledgers', () => {
  const root = rootFor(), entry = entryFor(root), A = branchFor('A');
  assertRealTerminal(A);
  assert.equal(A.finalStateHash, root.finalStateHash);
  assert.deepEqual(A.finalSnapshot.game, root.finalSnapshot.game);
  assert.deepEqual(A.finalSnapshot.behaviorRandom, root.finalSnapshot.behaviorRandom);
  assert.deepEqual(A.floors, root.floors);
  assert.deepEqual(A.resourceOpportunitySummary, root.resourceOpportunitySummary);
  assert.deepEqual(stripTiming(A.actionTrace), stripTiming(root.actionTrace.filter(action => action.index >= entry.opportunity.actionIndex)));
  assert.equal(A.actionTrace[0].type, 'supply');
  assert.ok(A.actionTrace[0].ledger.coinsOut > 0, 'the control really pays for the proposed action');
  const broken = { ...entry, referenceFinalStateHash: '0'.repeat(64) };
  assert.throws(() => runForkTask({ runPlayerCampaign: () => A }, broken, taskFor(broken), getPlayerPolicy), /reproduce root state/);
});

test('B skips the real supply window, C ignores the affected floor, and D never re-enables it', () => {
  const B = branchFor('B'), C = branchFor('C'), D = branchFor('D');
  for (const run of [B, C, D]) assertRealTerminal(run);
  const firstBSpin = B.actionTrace.findIndex(action => action.type === 'spin');
  assert.ok(firstBSpin >= 0);
  assert.equal(B.actionTrace.slice(0, firstBSpin + 1).some(action => action.type === 'supply'), false);
  assert.ok(B.actionTrace.slice(firstBSpin + 1).some(action => action.type === 'supply' && action.firstAffectedFloor === 2), 'B can actually spend again after a real turn in the same floor');
  assert.equal(C.actionTrace.some(action => action.type === 'supply' && action.firstAffectedFloor <= 2), false);
  assert.ok(C.actionTrace.some(action => action.type === 'supply' && action.firstAffectedFloor > 2), 'C really resumes later spending');
  assert.equal(D.actionTrace.some(action => action.type === 'supply'), false);
  assert.equal(D.floors.reduce((sum, floor) => sum + floor.resources.supplyPurchases, 0), 0);
  assert.ok(B.floors.some(floor => floor.floor > 2) && C.floors.some(floor => floor.floor > 2));
});

test('reward-phase removal remains missed until the next actual spin, including E compensation', () => {
  const root = rewardRemovalRoot(), entry = entryFor(root, 'remove', 4);
  assert.ok(['recruit', 'item', 'essence'].includes(entry.snapshot.game.phase));
  for (const branch of ['B', 'E']) {
    const run = runForkTask(withSnapshot, entry, taskFor(entry, branch), getPlayerPolicy);
    assertRealTerminal(run);
    const firstReward = run.actionTrace.findIndex(action => action.type === 'reward'), firstSpin = run.actionTrace.findIndex(action => action.type === 'spin');
    assert.ok(firstReward >= 0 && firstSpin > firstReward, 'the reward is consumed before returning to a real turn');
    assert.equal(run.actionTrace.slice(0, firstSpin + 1).some(action => action.type === 'remove'), false, 'ready-phase remove cannot immediately undo the missed reward-phase removal');
    assert.equal(run.fork.missWindow, 'next-real-spin');
    assert.ok(run.actionTrace.some(action => action.type === 'spin'), 'natural combat still happens');
  }
});

test('reroll B remains missed through the selected reward rather than one planner call', () => {
  const root = rewardRerollRoot(), entry = entryFor(root, 'reroll', 2);
  const B = runForkTask(withSnapshot, entry, taskFor(entry, 'B'), getPlayerPolicy);
  assertRealTerminal(B);
  const consumed = B.actionTrace.findIndex(action => action.type === 'reward');
  assert.ok(consumed >= 0);
  assert.equal(B.actionTrace.slice(0, consumed + 1).some(action => action.type === 'reroll'), false);
  assert.ok(root.actionTrace[0].type === 'reroll' && root.actionTrace[0].ledger.freeRerolls === 1, 'the root really used a reroll at the omitted opportunity');
  assert.equal(B.fork.missWindow, 'current-reward-consumed');
});

test('E changes only R after the miss and restores R after f+2 using actual later actions', () => {
  const E = branchFor('E'), base = policyFor('balanced'); assertRealTerminal(E);
  const firstSpin = E.actionTrace.findIndex(action => action.type === 'spin');
  assert.ok(firstSpin >= 0);
  assert.ok(E.actionTrace.some(action => action.firstAffectedFloor === 4));
  assert.ok(E.actionTrace.some(action => action.firstAffectedFloor >= 5));
  for (const [index, action] of E.actionTrace.entries()) {
    assert.deepEqual(action.policyParameters.H, base.H); assert.deepEqual(action.policyParameters.J, base.J);
    assert.equal(action.policyId.split('|H:')[0], base.id.split('|H:')[0], 'team preference is unchanged');
    const expectedR = index > firstSpin && action.firstAffectedFloor <= 4 ? .5 : 1;
    assert.equal(action.policyParameters.R.lambdaR, expectedR);
  }
  assert.deepEqual(E.intervention.parametersChanged, ['R']);
  assert.equal(E.fork.compensationThroughFloor, 4);
});

test('rep1 explicitly restarts future behavior while using the same world entry and all permissions', () => {
  const entry = entryFor(rootFor()), run = branchFor('A', 1), task = taskFor(entry, 'A', 1);
  assertRealTerminal(run);
  assert.equal(run.seed, entry.snapshot.game.seed);
  assert.equal(run.behaviorSeed, task.behaviorSeed);
  assert.equal(run.continuation, 'resampled-behavior');
  assert.equal(run.fork.behaviorContinuation, 'independent-future-stream');
  assert.notDeepEqual(run.actionTrace[0].randomBefore, branchFor('A').actionTrace[0].randomBefore);
  assert.equal(run.actionTrace[0].before.hp, entry.snapshot.game.hp);
});

async function writeRootManifest(directory, suppliedRows = null, { reverse = false, sourceHashes = { engine: 'controlled-fixture-source' } } = {}) {
  const combinations = [['short', 0], ['balanced', 0], ['greedy', 0], ['balanced', 1], ['greedy', 2]];
  const rows = suppliedRows || combinations.map(([horizon, worldIndex], index) => {
    const run = rootFor(horizon, worldIndex), entry = entryFor(run, 'supply', 2, worldIndex);
    return { ...run, index, worldIndex, trialKey: `controlled-root:H:${horizon}:W${worldIndex}`, opportunities: [run.opportunities.find(op => op.kind === 'supply' && op.firstAffectedFloor === 2)] };
  });
  const stage = 'fork-roots', policyHash = 'controlled-policy-hash', shards = [];
  for (let start = 0; start < rows.length; start += 2) {
    const chunk = rows.slice(start, start + 2), name = `root-${start}.jsonl.gz`, path = join(directory, name);
    const saved = await writeMatrixShard(path, { stage, policyHash, sourceHashes, expected: { runs: chunk.length } }, chunk);
    shards.push({ path: name, sha256: saved.sha256, start, end: start + chunk.length, count: chunk.length });
  }
  const manifest = { complete: true, sourceStable: true, stage, policyHash, sourceHashes, count: rows.length, shards: reverse ? shards.reverse() : shards };
  const path = join(directory, 'root-manifest.json'); await writeFile(path, JSON.stringify(manifest)); return { path, manifest, rows };
}
async function temporary(t) { const directory = await mkdtemp(join(tmpdir(), 'matrix-fork-tests-')); t.after(() => rm(directory, { recursive: true, force: true })); return directory; }

test('collector chooses distinct worlds with horizon balance, independent of manifest shard order, and reports zero cells', async t => {
  const directory = await temporary(t), { path } = await writeRootManifest(directory, null, { reverse: true });
  const result = await collectForkEntries(path, { target: 3 });
  const chosen = result.entries.filter(entry => entry.cellId === 'D8:F2:supply');
  assert.equal(chosen.length, 3);
  assert.equal(new Set(chosen.map(entry => entry.worldIndex)).size, 3);
  assert.deepEqual(chosen.map(entry => entry.worldIndex), [0, 1, 2]);
  const cell = result.coverage.cells.find(entry => entry.cellId === 'D8:F2:supply');
  assert.deepEqual(cell.rootMix, { short: 1, balanced: 1, greedy: 1 });
  assert.equal(cell.missing, 0); assert.equal(cell.qualified, 5);
  assert.equal(result.coverage.cells.length, 75);
  assert.ok(result.coverage.cells.filter(entry => entry.actual === 0).every(entry => entry.missing === 3));
  assert.equal(result.coverage.cells.find(entry => entry.cellId === 'D20:F10:remove').actual, 0);
  const missingOnly = await collectForkEntries(path, { target: 2, cells: [{ id: 'D20:F10:remove', difficulty: 20, affectedFloor: 10, kind: 'remove' }] });
  assert.equal(missingOnly.entries.length, 0); assert.equal(missingOnly.coverage.cells[0].missing, 2);
});

test('compact index and per-entry gzip restore the same frozen entry, with byte/hash/identity checks', async t => {
  const directory = await temporary(t), { path } = await writeRootManifest(directory), output = join(directory, 'selected.json');
  const full = await collectForkEntries(path, { target: 3 }), compact = await collectForkEntries(path, { target: 3, output });
  assert.deepEqual(compact.coverage, full.coverage);
  assert.equal(compact.entries.length, 3);
  for (const indexed of compact.entries) {
    assert.equal('snapshot' in indexed, false); assert.equal('opportunity' in indexed, false);
    assert.ok(indexed.record.path.endsWith('.json.gz'));
    assert.equal((await stat(resolve(dirname(output), indexed.record.path))).size, indexed.record.bytes);
    const restored = await loadForkEntry(indexed, output), expected = full.entries.find(entry => entry.id === indexed.id);
    assert.deepEqual(restored, JSON.parse(JSON.stringify(expected)));
    assert.deepEqual(restored.snapshot, expected.snapshot);
  }
  assert.ok((await readFile(output)).length < 10000, 'the index is compact instead of duplicating full state snapshots');
  const indexed = compact.entries[0];
  for (const bad of [
    { ...indexed, record: { ...indexed.record, bytes: indexed.record.bytes + 1 } },
    { ...indexed, record: { ...indexed.record, sha256: '0'.repeat(64) } },
    { ...indexed, rootTrialKey: 'wrong-root' }, { ...indexed, referenceActionHash: 'wrong-actions' }, { ...indexed, referenceFinalStateHash: 'wrong-state' }, { ...indexed, worldIndex: 999 },
  ]) await assert.rejects(() => loadForkEntry(bad, output), /mismatch|differs/);
  const recordPath = resolve(dirname(output), indexed.record.path), bytes = await readFile(recordPath); bytes[bytes.length - 1] ^= 1; await writeFile(recordPath, bytes);
  await assert.rejects(() => loadForkEntry(indexed, output), /mismatch/);
});

test('incomplete roots, source drift, count/order corruption and inconsistent entry identities are rejected', { timeout: 30000 }, async t => {
  const directory = await temporary(t), good = await writeRootManifest(directory), cell = [{ id: 'D8:F2:supply', difficulty: 8, affectedFloor: 2, kind: 'supply' }];
  const writeManifest = async manifest => { const path = join(directory, 'bad-manifest.json'); await writeFile(path, JSON.stringify(manifest)); return path; };
  for (const mutate of [
    manifest => { manifest.complete = false; }, manifest => { manifest.sourceStable = false; },
    manifest => { manifest.count++; }, manifest => { manifest.shards[0].start++; }, manifest => { manifest.sourceHashes.engine = 'drifted'; }, manifest => { manifest.shards[0].sha256 = '0'.repeat(64); },
  ]) {
    const bad = structuredClone(good.manifest); mutate(bad);
    await assert.rejects(() => writeManifest(bad).then(path => collectForkEntries(path, { target: 3, cells: cell })));
  }
  const badRows = structuredClone(good.rows); badRows[0].phase = 'ready'; badRows[0].won = false; badRows[0].stopped = null;
  const incomplete = await writeRootManifest(join(directory, 'incomplete'), badRows);
  await assert.rejects(() => collectForkEntries(incomplete.path, { target: 3 }), /Incomplete|inconsistent/);
  const entry = entryFor(rootFor());
  for (const bad of [{ ...entry, strategyId: policyFor('greedy').id }, { ...entry, difficulty: 20 }, { ...entry, affectedFloor: 6 }]) await assert.rejects(() => loadForkEntry(bad), /identity/);
  for (const target of [0, -1, NaN, 1.5]) await assert.rejects(() => collectForkEntries(good.path, { target }), /positive integer/);
  for (const task of [{ ...taskFor(entry), branch: 'Z' }, { ...taskFor(entry), behaviorRep: 2 }, { ...taskFor(entry), worldIndex: 99 }]) assert.throws(() => runForkTask({ runPlayerCampaign() { assert.fail('invalid task reached gameplay'); } }, entry, task, getPlayerPolicy), /Unknown|differs/);
});

test('real worker fork rows preserve executed root seeds and separately record task-label seeds', { timeout: 60000 }, async t => {
  const directory = await temporary(t), entry = entryFor(rootFor()), entriesFile = join(directory, 'worker-entries.json');
  await writeFile(entriesFile, JSON.stringify([entry]));
  const sourcePlan = buildForkPlan('fork-screen', [entry]);
  const selected = [0, 1, 2, 3].map(index => sourcePlan.task(index)); // A/B, exact and independent future behavior.
  const plan = { stage: 'fork-tests', count: selected.length, task: index => ({ ...selected[index], stage: 'fork-tests', trialKey: `controlled-worker:${selected[index].trialKey}` }) };
  const result = await executeMatrixPlan(plan, { directory: join(directory, 'worker-output'), workers: 2, shardSize: 4, policies: [policyFor('balanced')], entriesFile, log: false });
  assert.equal(result.complete, true); assert.equal(result.completed, 4);
  const rows = [];
  for (const shard of result.shards) for await (const row of readMatrixShard(join(directory, 'worker-output', shard.path), { expectedSourceHashes: result.sourceHashes })) if (row.kind === 'run') rows.push(row.value);
  assert.equal(rows.length, 4);
  for (const row of rows) {
    const task = selected.find(candidate => candidate.branch === row.branch && candidate.behaviorRep === row.behaviorRep);
    assert.equal(row.seed, entry.snapshot.game.seed);
    assert.equal(row.taskSeed, task.seed); assert.notEqual(row.seed, row.taskSeed);
    assert.equal(row.behaviorSeed, row.behaviorRep === 0 ? entry.snapshot.behaviorSeed : task.behaviorSeed);
    assert.equal(row.taskBehaviorSeed, task.behaviorSeed);
    assert.equal(row.stopped, null); assert.equal(row.conservationPassed, true);
  }
});
