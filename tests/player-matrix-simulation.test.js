import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin, skipReward, chooseReward, rerollRewards, removeSymbol, purchaseSupply, validateSave, observeEngineAction } from '../src/engine.js';
import { publicDebuff, enemyDebuffById } from '../src/enemy-effects.js';
import { RETIREMENT_RULES } from '../src/retirements.js';
import { getPlayerPolicy, recommendPlayerAction } from '../src/player-policy.js';
import { runPlayerCampaign, resumePlayerCampaign, validatePlayerSnapshot, checkPlayerConservation } from '../src/player-matrix-simulation.js';

const deepFreeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(deepFreeze); } return value; };
function readyFloor(floor = 2, seed = 'matrix-ledger-fixture') {
  let state = newGame({ seed });
  while (state.floor < floor) {
    if (state.phase === 'ready') state = spin({ ...state, enemies: state.enemies.map(enemy => ({ ...enemy, hp: .01 })) });
    else state = skipReward(state);
  }
  assert.equal(state.phase, 'ready');
  return state;
}
function supplyOpportunity() {
  const state = readyFloor(2, 'matrix-supply-opportunity');
  state.hp = 10; state.shield = 0; state.coins = 100; state.items = ['organic_heart'];
  state.enemies = state.enemies.map(enemy => ({ ...enemy, hp: 100000, maxHp: 100000, attack: 4 }));
  assert.ok(validateSave(state));
  return state;
}
const active = getPlayerPolicy('matrix:baseline|H:balanced|J:mixed|R:active');
const plainActionTrace = run => run.actionTrace.map(({ decisionMs, actionMs, ...entry }) => entry);

test('engine observations are opt-in detached snapshots and cannot change settlement or RNG', () => {
  const state = newGame({ seed: 'observation-isolation' }), frozen = deepFreeze(structuredClone(state));
  const expected = spin(frozen);
  const result = observeEngineAction(() => spin(frozen), event => {
    if (event.state) { event.state.hp = -1000; event.state.rngState = 1; event.state.roster.length = 0; }
    throw new Error('observer failure is diagnostic only');
  });
  assert.deepEqual(result.state, expected);
  assert.deepEqual(frozen, state);
  assert.ok(result.events.length > 0);
  assert.ok(result.observerErrors.length > 0);
  for (const event of result.events) if (event.state) event.state.hp = -999;
  assert.deepEqual(result.state, expected);
  assert.deepEqual(observeEngineAction(() => spin(state)).state, expected, 'observation scope is cleaned up');
  assert.throws(() => observeEngineAction(() => Promise.resolve(state)), /synchronous/);
});

test('B precedes clear bounty, C precedes next-floor grants, and A includes those grants', () => {
  const state = newGame({ seed: 'boundary-order' });
  state.enemies.forEach(enemy => { enemy.hp = .01; });
  const cleared = observeEngineAction(() => spin(state));
  assert.equal(cleared.state.phase, 'recruit');
  const B = cleared.events.find(event => event.boundary === 'B');
  assert.equal(B.reason, 'clear');
  assert.equal(B.state.coins, 0);
  assert.equal(cleared.state.coins, 11);
  const next = observeEngineAction(() => skipReward(cleared.state));
  assert.deepEqual(next.events.filter(event => event.type === 'boundary').map(event => event.boundary), ['C', 'A']);
  const C = next.events.find(event => event.boundary === 'C').state, A = next.events.find(event => event.boundary === 'A').state;
  assert.equal(C.floor, 1); assert.equal(A.floor, 2);
  assert.equal(C.rerolls, 2); assert.equal(A.rerolls, 3);
  assert.equal(C.removals, 2); assert.equal(A.removals, 3);
  assert.deepEqual(next.state, skipReward(cleared.state));
});

test('actual HP loss separates enemy, self-damage and pollution while shield decay remains separate', () => {
  const state = readyFloor(4, 'matrix-loss-source');
  state.hp = 50; state.maxHp = 120; state.shield = 80;
  state.items = ['corrupt_fruit'];
  state.activeDebuffs = [state.activeDebuffs.find(clause => clause.id === 'rift_pollution'), publicDebuff(enemyDebuffById('shield_decay'), 'difficulty', 0)].filter(Boolean);
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 100000; enemy.attack = 1; });
  assert.ok(validateSave(state));
  const original = structuredClone(state);
  const result = runPlayerCampaign({ initialState: state, policy: active, maxActions: 1, includeHits: true, actionTransform: () => ({ type: 'spin' }) });
  assert.deepEqual(state, original);
  assert.equal(result.errors.length, 0);
  assert.equal(result.conservationPassed, true);
  const ledger = result.actionTrace[0].ledger;
  assert.equal(ledger.pollutionHpLost, 6);
  assert.equal(ledger.selfDamage, 1);
  assert.equal(ledger.shieldDecayed, 16);
  assert.ok(ledger.shieldBlocked > 0);
  assert.ok(ledger.healed > 0);
  assert.equal(result.turns[0].hits.reduce((sum, hit) => sum + hit.amount, 0).toFixed(2), result.turns[0].damage.toFixed(2));
  assert.deepEqual(result.finalSnapshot.game, spin(state));
});

test('piercing observes shield balance loss separately from the existing rounded block counter', () => {
  const state = newGame({ seed: 'matrix-subcent-shield-block', difficulty: 2 });
  state.shield = 134.97; state.resourceStats.shieldBlocked = 117.5;
  state.activeDebuffs = [publicDebuff(enemyDebuffById('shield_pierce'), 'difficulty', 0)];
  state.enemies.forEach((enemy, index) => { enemy.hp = enemy.maxHp = 100000; enemy.attack = index === 0 ? 20.5 : 0; });
  const options = { layoutUids: Array(20).fill(null) }, original = structuredClone(state);
  assert.ok(validateSave(state));
  const expected = inspectSpin(state, options).state, observed = observeEngineAction(() => inspectSpin(state, options).state);
  const loss = observed.events.find(event => event.type === 'shieldLoss' && event.origin === 'blocked');
  assert.equal(observed.protocol, 'engine-observation-v2');
  assert.equal(observed.state.shield, 119.6);
  assert.equal(loss.amount, 15.37);
  assert.equal(loss.ledgerAmount, 15.38);
  assert.equal(observed.state.resourceStats.shieldBlocked, 132.88);
  assert.deepEqual(observed.state, expected);
  assert.deepEqual(state, original);
});

test('P0 D2 world11 keeps the frozen game result while reconciling all half-cent piercing blocks', () => {
  const run = runPlayerCampaign({ policy: 'matrix:baseline|H:short|J:deterministic|R:active', difficulty: 2, seed: 'matrix-v1:pilot:world:11', behaviorSeed: 'matrix-v1:pilot:world:11:behavior:0' });
  assert.equal(run.version, 'player-matrix-campaign-v2');
  assert.equal(run.phase, 'victory'); assert.equal(run.stopped, null); assert.deepEqual(run.errors, []);
  assert.equal(run.actions, 112);
  // The immutable failed P0 recorder already produced this exact game state.
  assert.equal(run.finalStateHash, '49fedaae8d0abb6b5a30082768591eb84870e0f83df49b7683e652d9fd4f724e');
  assert.equal(run.conservationPassed, true);
  const floor = run.floors.find(row => row.floor === 12);
  assert.equal(floor.flows.battle.shieldBlocked, 36.36);
  assert.equal(floor.flows.battle.shieldBlockedRecorded, 36.39);
  assert.ok(Object.values(floor.conservation.battle.residuals).every(value => value === 0));
  assert.ok(Object.values(floor.conservation.total.residuals).every(value => value === 0));
  const damagedCounter = checkPlayerConservation(floor.A, floor.B, { ...floor.flows.battle, shieldBlockedRecorded: 37.39 });
  assert.equal(damagedCounter.passed, false);
  assert.equal(damagedCounter.residuals.shield, 0);
  assert.equal(damagedCounter.residuals.shieldBlockLedger, -1, 'the original counter is checked independently of shield balance');
});

test('commission income is an actual ledger source, not a missing cash residual', () => {
  const rule = RETIREMENT_RULES[0], state = newGame({ seed: 'matrix-commission-ledger' });
  state.roster = [rule.sourceId, rule.targetId, rule.targetId].map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, attackBonus: 0, ticks: index === 0 ? 2 : 0 }));
  state.uidCounter = 4; state.board = Array(20).fill(null);
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 100000; enemy.attack = 0; });
  const layout = ['u1', 'u2', 'u3', ...Array(17).fill(null)];
  const observed = observeEngineAction(() => inspectSpin(state, { layoutUids: layout }).state);
  assert.equal(observed.events.filter(event => event.type === 'resourceGain' && event.origin === 'commission').reduce((sum, event) => sum + event.amount, 0), rule.coins);
  assert.equal(observed.state.coins - state.coins, rule.coins);
});

test('all engine action kinds preserve exact observed/unobserved results and input immutability', () => {
  const ready = supplyOpportunity(), reward = spin(ready);
  const cases = [[ready, state => purchaseSupply(state, 'repair')], [ready, state => purchaseSupply(state, 'barrier')], [ready, state => removeSymbol(state, state.roster[0].uid)], [ready, state => spin(state)], [reward, state => rerollRewards(state)], [reward, state => chooseReward(state, 0)], [reward, state => skipReward(state)]];
  for (const [state, action] of cases) {
    const snapshot = structuredClone(state), expected = action(state), actual = observeEngineAction(() => action(state));
    assert.deepEqual(actual.state, expected); assert.deepEqual(state, snapshot);
  }
});

test('recording detail and hit switches leave actions, world RNG and final state unchanged', () => {
  const options = { seed: 'matrix-record-toggle', maxActions: 24, includeHits: false };
  const detailed = runPlayerCampaign({ ...options, record: true });
  const compact = runPlayerCampaign({ ...options, record: false });
  assert.deepEqual(compact.finalSnapshot, detailed.finalSnapshot);
  assert.equal(compact.finalStateHash, detailed.finalStateHash);
  assert.deepEqual(compact.floors, detailed.floors);
  assert.equal(compact.conservationPassed, true);
  assert.equal('actionTrace' in compact, false);
  assert.ok(detailed.actionTrace.every(entry => entry.ledger && entry.stateHash));
  assert.ok(detailed.turns.every(turn => !('hits' in turn) && turn.ledger));
  const hits = runPlayerCampaign({ ...options, record: true, includeHits: true });
  assert.deepEqual(hits.finalSnapshot, detailed.finalSnapshot);
  assert.ok(hits.turns.every(turn => Array.isArray(turn.hits) && Array.isArray(turn.effects)));
});

test('pause/resume restores the behavior RNG position and complete compact floor ledgers', () => {
  const options = { seed: 'matrix-exact-resume', behaviorSeed: 'matrix-actions-exact', maxActions: 30 };
  const full = runPlayerCampaign(options), prefix = runPlayerCampaign({ ...options, pauseAfterActions: 9 });
  assert.equal(prefix.stopped, 'paused'); assert.equal(prefix.actions, 9);
  assert.ok(prefix.finalSnapshot.behaviorRandom.count > 0);
  const resumed = resumePlayerCampaign(prefix.finalSnapshot, { maxActions: 30 });
  assert.equal(resumed.continuation, 'snapshot-exact');
  assert.equal(resumed.finalStateHash, full.finalStateHash);
  assert.deepEqual(resumed.finalSnapshot, full.finalSnapshot);
  assert.deepEqual(resumed.floors, full.floors);
  assert.deepEqual(resumed.resourceOpportunitySummary, full.resourceOpportunitySummary);
  assert.deepEqual(plainActionTrace(resumed), plainActionTrace(full).slice(9));
});

test('first eligible resource opportunity is captured before action and exact replay does not double-count exposure', () => {
  const state = supplyOpportunity();
  assert.equal(recommendPlayerAction(state, active).type, 'supply');
  const options = { initialState: state, policy: active, seed: state.seed, behaviorSeed: 'matrix-opportunity-actions', maxActions: 12 };
  const full = runPlayerCampaign({ ...options, captureOpportunities: true });
  const opportunity = full.opportunities.find(entry => entry.kind === 'supply');
  assert.ok(opportunity); assert.equal(opportunity.firstAffectedFloor, 2); assert.equal(opportunity.actionIndex, 0);
  assert.deepEqual(opportunity.snapshot.game, state);
  const resumed = resumePlayerCampaign(opportunity.snapshot, { maxActions: 12 });
  assert.equal(resumed.finalStateHash, full.finalStateHash);
  assert.deepEqual(resumed.floors, full.floors);
  assert.deepEqual(resumed.resourceOpportunitySummary, full.resourceOpportunitySummary);
  assert.deepEqual(plainActionTrace(resumed), plainActionTrace(full));
  const stopped = runPlayerCampaign({ ...options, captureOpportunities: true, stopOnOpportunity: true });
  assert.equal(stopped.stopped, 'opportunity'); assert.equal(stopped.actionsExecuted, 0);
  assert.deepEqual(stopped.finalSnapshot.game, state);
});

test('resampled future behavior is explicit and never changes the entry world state', () => {
  const prefix = runPlayerCampaign({ seed: 'matrix-new-future', pauseAfterActions: 5 });
  const branch = resumePlayerCampaign(prefix.finalSnapshot, { pauseAfterActions: 0, behaviorSeedOverride: 'matrix-fork:rep:1' });
  assert.equal(branch.continuation, 'resampled-behavior');
  assert.deepEqual(branch.finalSnapshot.game, prefix.finalSnapshot.game);
  assert.equal(branch.finalSnapshot.behaviorRandom.count, 0);
  assert.notEqual(branch.finalSnapshot.behaviorRandom.state, prefix.finalSnapshot.behaviorRandom.state);
  assert.throws(() => resumePlayerCampaign(prefix.finalSnapshot, { behaviorSeed: 'unlabelled-restart' }), /behaviorSeedOverride/);
});

test('blocked resource planning keeps every permission and natural defense active', () => {
  const state = supplyOpportunity(), original = structuredClone(state);
  const branch = runPlayerCampaign({ initialState: state, policy: active, maxActions: 1, plannerOptions: { blockedKinds: ['supply', 'remove', 'reroll'] } });
  assert.equal(branch.actionTrace[0].type, 'spin');
  assert.deepEqual(branch.resourceAccess, { rerolls: true, removals: true, credits: true, defense: true });
  assert.deepEqual(branch.finalSnapshot.game, spin(state));
  assert.deepEqual(state, original);
  assert.ok(branch.actionTrace[0].ledger.healed > 0 || branch.actionTrace[0].ledger.shieldGained > 0);
});

test('snapshot corruption is rejected and detached callbacks cannot mutate the real campaign', () => {
  const run = runPlayerCampaign({ seed: 'matrix-snapshot-corruption', maxActions: 4 });
  assert.ok(validatePlayerSnapshot(run.finalSnapshot));
  for (const mutate of [snapshot => { snapshot.game.hp = -1; }, snapshot => { snapshot.behaviorRandom.count = 0; }, snapshot => { snapshot.telemetry.floors[0].flows.battle.coinsOut += 1; }]) {
    const broken = structuredClone(run.finalSnapshot); mutate(broken);
    assert.equal(validatePlayerSnapshot(broken), null);
    assert.throws(() => resumePlayerCampaign(broken), /Invalid.*snapshot/);
  }
  const callbacks = runPlayerCampaign({ seed: 'matrix-snapshot-corruption', maxActions: 4, onAction: context => { context.after.hp = -1; context.before.rngState = 1; } });
  assert.equal(callbacks.finalStateHash, run.finalStateHash);
  assert.equal(checkPlayerConservation(run.floors[0].A, run.floors[0].A, { ...run.floors[0].flows.battle, coinsOut: 10 }).passed, false);
});


test('bridge AI resource opportunities have honest legal exposure and unknown value instead of fake zero opportunity', () => {
  const state = supplyOpportunity();
  const run = runPlayerCampaign({ initialState: state, policy: 'control:current-ai', maxActions: 1 });
  assert.equal(run.errors.length, 0);
  const supply = run.resourceOpportunitySummary.find(entry => entry.kind === 'supply');
  assert.ok(supply.legalActions >= 2);
  assert.equal(supply.unknownValueDecisionStates, 1);
  assert.equal(supply.worthwhileDecisionStates, 0);
});


test('pausing after clear but before rewards complete reconciles current rewards while battle still ends at B', () => {
  const state = newGame({ seed: 'matrix-partial-clear-ledger' });
  state.coins = 100; state.rerolls = 0;
  state.enemies.forEach(enemy => { enemy.hp = .01; });
  const run = runPlayerCampaign({ initialState: state, maxActions: 2, actionTransform: ({ state }) => ({ type: state.phase === 'ready' ? 'spin' : 'reroll' }) });
  assert.equal(run.phase, 'recruit');
  assert.equal(run.finalSnapshot.game.pendingFloor, true);
  const floor = run.floors[0];
  assert.equal(floor.B.coins, 100); assert.equal(floor.C, null);
  assert.equal(run.finalSnapshot.game.coins, 103);
  assert.equal(floor.flows.rewards.coinsIn, 11); assert.equal(floor.flows.rewards.coinsOut, 8);
  assert.equal(floor.conservation.battle.passed, true);
  assert.equal(floor.conservation.total.passed, true);
  assert.equal(run.conservationPassed, true);
  assert.equal(run.stopped, 'action-limit');
});
