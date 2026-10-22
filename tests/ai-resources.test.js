import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, purchaseSupply, rerollRewards, removeSymbol, skipReward, spin } from '../src/engine.js';
import { recommendAction, recommendRewards, recommendRemoval, forecastEncounterSurvival, DEFAULT_PROFILE, POLICY_VERSION } from '../src/ai.js';
import { enemyDebuffById, pollutionDescription, POLLUTION_ATTACK_MULTIPLIER } from '../src/enemy-effects.js';
import { characterById } from '../src/content.js';

function fixture({ phase = 'ready', ids = ['1001', '1002', '1003', '1004', '1008'], choices = ['1409', '1403', 'cerydra'], hp = 100, coins = 80, rerolls = 3, floor = 5 } = {}) {
  const state = newGame({ seed: 'resource-fixture' });
  Object.assign(state, { phase, choices: phase === 'ready' ? [] : choices, hp, coins, rerolls, floor });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  state.resourceAccess.removals = false;
  return state;
}

test('shared resource planning is immutable, deterministic and independent of unrevealed RNG', () => {
  const first = fixture({ phase: 'recruit' });
  const saved = structuredClone(first);
  const second = structuredClone(first);
  second.seed = 'unrevealed-other-seed';
  second.rngState = 87654321;
  const action = recommendAction(first);
  assert.equal(action.policyVersion, POLICY_VERSION);
  assert.equal(action.type, 'reroll');
  assert.deepEqual(recommendAction(first), action);
  assert.deepEqual(recommendAction(second), action);
  assert.deepEqual(first, saved);
  assert.ok(Object.isFrozen(action));
});

test('rerolls replace weak offers but keep strong offers, with real free and paid costs', () => {
  const weak = fixture({ phase: 'recruit' });
  const free = recommendAction(weak, { lookahead: false });
  assert.equal(free.type, 'reroll');
  assert.equal(free.cost, 0);
  assert.equal(rerollRewards(weak).rerolls, weak.rerolls - 1);
  const paidState = { ...weak, rerolls: 0 };
  const paid = recommendAction(paidState, { lookahead: false });
  assert.equal(paid.type, 'reroll');
  assert.equal(paid.cost, 8);
  assert.equal(rerollRewards(paidState).coins, paidState.coins - paid.cost);
  const strong = fixture({ phase: 'recruit', choices: ['1204', '1201', '1205'] });
  const retained = recommendAction(strong, { lookahead: false });
  assert.equal(retained.type, 'reward');
  assert.deepEqual(retained.recommendation, recommendRewards(strong, { lookahead: false }));
});

test('paid rerolls preserve future supply budget and resource gates leave free rerolls legal', () => {
  const weak = fixture({ phase: 'recruit', rerolls: 0, coins: 20 });
  assert.equal(recommendAction(weak, { lookahead: false }).type, 'reward');
  const disabled = { ...weak, coins: 80, resourceAccess: { ...weak.resourceAccess, rerolls: false } };
  assert.equal(recommendAction(disabled, { lookahead: false }).type, 'reward');
  const noCredits = { ...weak, coins: 80, resourceAccess: { ...weak.resourceAccess, credits: false } };
  assert.equal(recommendAction(noCredits, { lookahead: false }).type, 'reward');
  const stillFree = { ...noCredits, rerolls: 3 };
  assert.equal(recommendAction(stillFree, { lookahead: false }).type, 'reroll');
});

test('supply planning purchases actual repair or shielding only when it can help', () => {
  const endangered = fixture({ hp: 15, coins: 12, ids: ['1002'] });
  endangered.enemies = endangered.enemies.map(enemy => ({ ...enemy, hp: 400, maxHp: 400, attack: 10 }));
  const repair = recommendAction(endangered, { lookahead: false });
  assert.equal(repair.type, 'supply');
  assert.equal(repair.kind, 'repair');
  assert.equal(repair.cost, 12);
  const repaired = purchaseSupply(endangered, repair.kind);
  assert.equal(repaired.hp, 33);
  assert.equal(repaired.resourceStats.healed, 18);
  const almostFull = { ...endangered, hp: 95 };
  const barrier = recommendAction(almostFull, { lookahead: false });
  assert.equal(barrier.kind, 'barrier');
  assert.equal(purchaseSupply(almostFull, barrier.kind).resourceStats.shieldGained, 20);
  for (const state of [
    { ...endangered, supplyPurchases: 2 },
    { ...endangered, coins: 9 },
    { ...endangered, resourceAccess: { ...endangered.resourceAccess, credits: false } },
    { ...endangered, resourceAccess: { ...endangered.resourceAccess, defense: false } },
  ]) assert.equal(recommendAction(state, { lookahead: false }).type, 'spin');
});

test('overclock is not stacked or bought for an already finished output task', () => {
  const state = fixture({ ids: ['1204'], coins: 80 });
  state.resourceAccess.defense = false;
  state.enemies = state.enemies.map(enemy => ({ ...enemy, hp: 1, maxHp: 1, attack: 1 }));
  assert.equal(recommendAction(state).type, 'spin');
  state.enemies = state.enemies.map(enemy => ({ ...enemy, hp: 500, maxHp: 500 }));
  state.overclockReady = true;
  assert.equal(recommendAction(state).type, 'spin');
});

function budgetFixture(ids = ['1404', '1013', '1204', '1001']) {
  const state = fixture({ ids, floor: 12, hp: 29, coins: 80 });
  state.shield = 39;
  state.spinsLeft = 6;
  state.encounter.deadline = 7;
  state.supplyPurchases = 1;
  state.bossStage = 1;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `budget-${col}`, name: '训练敌人', col, hp: 500, maxHp: 500, attack: col === 2 ? 7 : 4, boss: col === 2 }));
  return state;
}

test('the last supply opportunity protects a multi-turn life budget instead of repeating a greedy overclock', () => {
  const state = budgetFixture();
  const saved = structuredClone(state);
  const action = recommendAction(state);
  assert.equal(action.type, 'supply');
  assert.equal(action.kind, 'repair');
  assert.ok(purchaseSupply(state, action.kind).hp > state.hp);
  const noDefense = { ...structuredClone(state), resourceAccess: { ...state.resourceAccess, defense: false } };
  assert.equal(recommendAction(noDefense).kind, 'overclock', 'disabling defense planning preserves its original output-oriented boundary');
  assert.deepEqual(state, saved);
});

test('a sampled immediate clear still permits the final overclock despite a low life budget', () => {
  const state = budgetFixture(['1204']);
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 4.5; enemy.attack = 1; });
  const purchased = purchaseSupply(state, 'overclock');
  const resolved = spin(purchased);
  assert.equal(resolved.phase, 'victory');
  const budget = forecastEncounterSurvival(purchased, { selfDrain: 20, healing: 0, shields: 0, threat: 20 }, [resolved], 20);
  assert.equal(budget.clearsNow, true);
  assert.equal(budget.needsDefense, false);
  const lightDefense = { ...DEFAULT_PROFILE, weights: { ...DEFAULT_PROFILE.weights, defense: 0.05 } };
  assert.equal(recommendAction(state, { profile: lightDefense }).kind, 'overclock');
});

test('removal can precede board dilution when an instance is harmful to a survival build', () => {
  const state = fixture({ ids: ['1204', '1205'], hp: 10, floor: 11 });
  state.resourceAccess.removals = true;
  pollute(state, 'u2');
  const survival = { ...DEFAULT_PROFILE, weights: { ...DEFAULT_PROFILE.weights, damage: 0.1, defense: 5, growth: 0, synergy: 0 } };
  assert.equal(recommendRemoval(state, { profile: survival }), 'u2');
  assert.equal(recommendAction(state, { profile: survival }).type, 'remove');
  const removed = removeSymbol(state, 'u2');
  assert.equal(removed.roster.length, 1);
  assert.equal(removed.resourceStats.removalsUsed, 1);
  assert.equal(recommendRemoval({ ...state, resourceAccess: { ...state.resourceAccess, removals: false } }, { profile: survival }), null);
  assert.equal(recommendRemoval({ ...state, resourceAccess: { ...state.resourceAccess, defense: false } }, { profile: survival }), null);
});

test('disabled defense planning equals a zero defense weight without altering saved weights', () => {
  const enabled = fixture({ phase: 'item', choices: ['preservation_wax', 'dimension_dice', 'gold_coin'], hp: 40 });
  const disabled = { ...enabled, resourceAccess: { ...enabled.resourceAccess, defense: false } };
  const original = structuredClone(DEFAULT_PROFILE);
  const manual = { ...DEFAULT_PROFILE, weights: { ...DEFAULT_PROFILE.weights, defense: 0 } };
  const actual = recommendRewards(disabled, { lookahead: false });
  const equivalent = recommendRewards({ ...disabled, resourceAccess: { ...disabled.resourceAccess, defense: true } }, { profile: manual, lookahead: false });
  assert.deepEqual(actual.choices.map(choice => [choice.score, choice.probability]), equivalent.choices.map(choice => [choice.score, choice.probability]));
  assert.deepEqual(DEFAULT_PROFILE, original);
});

test('cached recommendations react to changed visible choices and resource configuration', () => {
  const state = fixture({ phase: 'recruit' });
  assert.equal(recommendAction(state, { lookahead: false }).type, 'reroll');
  state.resourceAccess.rerolls = false;
  assert.equal(recommendAction(state, { lookahead: false }).type, 'reward');
  state.choices = ['1204', '1201', '1205'];
  assert.equal(recommendAction(state, { lookahead: false }).recommendation.choices[0].id, '1204');
  for (const phase of ['victory', 'defeat', 'unknown']) assert.equal(recommendAction({ ...state, phase }).type, 'stop');
  assert.equal(recommendAction(null).type, 'stop');
});

function pollute(state, uid) {
  const target = state.roster.find(unit => unit.uid === uid);
  const character = characterById(target.id);
  const effect = enemyDebuffById('rift_pollution');
  state.activeDebuffs = [{ id: effect.id, name: effect.name, description: pollutionDescription(character.name), source: 'difficulty', addedRound: 0, targetUid: uid, targetId: target.id, targetName: character.name }];
  return state;
}

test('pollution removal weighs actual instance cost while retaining a productive core', () => {
  const expendable = fixture({ ids: ['1204', '1105'], hp: 10, floor: 12, coins: 0 });
  expendable.resourceAccess.removals = true;
  assert.equal(recommendRemoval(expendable), null);
  pollute(expendable, 'u2');
  assert.equal(recommendRemoval(expendable), 'u2');
  const action = recommendAction(expendable);
  assert.equal(action.type, 'remove');
  assert.match(action.reason, /污染/);
  assert.equal(removeSymbol(expendable, action.uid).activeDebuffs.length, 0);
  const cleared = { ...expendable, pendingFloor: true, phase: 'recruit', choices: ['1001', '1002', '1109'], enemies: expendable.enemies.map(enemy => ({ ...enemy, hp: 0 })) };
  assert.equal(recommendRemoval(cleared), null, 'an already cleared encounter cannot charge future pollution damage');
  const core = fixture({ ids: ['1105', '1204'], hp: 50, floor: 8, coins: 0 });
  core.resourceAccess.removals = true;
  pollute(core, 'u2');
  assert.equal(recommendRemoval(core), null, 'a valuable attack instance can still outweigh the pollution cost');
});

test('an offered merge can resolve pollution without automatically spending a removal', () => {
  const state = fixture({ ids: ['1204', '1001', '1001'], phase: 'recruit', choices: ['1001', '1002', '1109'], hp: 10, floor: 8, coins: 0 });
  state.resourceAccess.removals = true;
  state.resourceAccess.rerolls = false;
  pollute(state, 'u2');
  assert.equal(recommendRemoval(state), null);
  const action = recommendAction(state, { lookahead: false });
  assert.equal(action.type, 'reward');
  assert.match(action.recommendation.choices[0].reason, /三合一/);
  assert.ok(action.recommendation.choices[0].probability > action.recommendation.choices.at(-1).probability);
});

test('removal clears lethal pollution before healing instead of making its draw certain', () => {
  const ids = ['1001', '1002', '1005', '1013', '1205', '1006', '1003', '1005', '1108', '1106', '1008', '1004', '1106', '1107', '1204', '1103', '1109', '1008', '1109', '1101', '1109'];
  const state = fixture({ ids, phase: 'recruit', choices: ['1105', '1109', '1013'], hp: 1, coins: 7, floor: 10 });
  state.resourceAccess.removals = true;
  state.supplyPurchases = 2;
  for (const unit of state.roster) {
    unit.growth = unit.id === '1205' ? 12.75 : unit.id === '1002' ? 8 : unit.id === '1107' ? 7 : 0;
    unit.ticks = 10;
  }
  state.roster[18].temporary = 2;
  state.roster[20].temporary = 2;
  pollute(state, 'u1');
  const saved = structuredClone(state);
  const action = recommendAction(state);
  assert.equal(action.type, 'remove');
  assert.equal(action.uid, 'u1');
  assert.deepEqual(state, saved);
  const hiddenOther = { ...structuredClone(state), seed: 'unrevealed-other', rngState: 7654321 };
  assert.deepEqual(recommendAction(hiddenOther), action);
  // Removing the ordinary low-output Arlan instead shrinks the bag to 20:
  // pollution is guaranteed to draw and kills before any recruited healer.
  const unsafe = skipReward(removeSymbol(state, 'u11'));
  const safe = skipReward(removeSymbol(state, action.uid));
  for (let sample = 0; sample < 16; sample++) {
    const rngState = 10001 + sample * 6571;
    assert.equal(spin({ ...unsafe, rngState }).phase, 'defeat');
    assert.notEqual(spin({ ...safe, rngState }).phase, 'defeat');
  }
});

test('healing valuation replenishes direct pollution HP costs behind a full shield', () => {
  const state = fixture({ ids: ['1109', '1204'], phase: 'recruit', choices: ['1105', '1109', '1008'] });
  pollute(state, 'u1');
  state.shield = 200;
  state.enemies = state.enemies.map(enemy => ({ ...enemy, hp: 400, maxHp: 400, attack: 0 }));
  const defenseOnly = { ...DEFAULT_PROFILE, weights: Object.fromEntries(Object.keys(DEFAULT_PROFILE.weights).map(key => [key, key === 'defense' ? 1 : 0])) };
  const withDrain = recommendRewards(state, { profile: defenseOnly, lookahead: false });
  const noDrain = { ...state, activeDebuffs: [] };
  const withoutDrain = recommendRewards(noDrain, { profile: defenseOnly, lookahead: false });
  assert.ok(withDrain.choices[0].score > withoutDrain.choices[0].score);
  let healedHp = 0;
  let baselineHp = 0;
  const healer = { uid: 'u3', id: '1105', stars: 1, growth: 0, ticks: 0 };
  const ready = { ...state, phase: 'ready', choices: [] };
  for (let sample = 0; sample < 16; sample++) {
    const rngState = 20001 + sample * 7919;
    const baseline = spin({ ...ready, rngState });
    const healed = spin({ ...ready, rngState, roster: [...ready.roster, healer] });
    baselineHp += baseline.hp;
    healedHp += healed.hp;
  }
  assert.ok(healedHp > baselineHp, 'healing replenishes pollution damage even when shields absorb all retaliation');
});

test('temporary pollution is valued over this encounter rather than the entire remaining run', () => {
  const early = fixture({ ids: ['1002', '1109'], phase: 'recruit', choices: ['1105', '1109', '1008'], floor: 4 });
  early.shield = 200;
  early.spinsLeft = 1;
  pollute(early, 'u2');
  const final = { ...structuredClone(early), floor: 12 };
  const defenseOnly = { ...DEFAULT_PROFILE, weights: Object.fromEntries(Object.keys(DEFAULT_PROFILE.weights).map(key => [key, key === 'defense' ? 1 : 0])) };
  const earlyHealing = recommendRewards(early, { profile: defenseOnly, lookahead: false }).choices[0].score;
  const finalHealing = recommendRewards(final, { profile: defenseOnly, lookahead: false }).choices[0].score;
  assert.ok(earlyHealing > 0);
  assert.ok(finalHealing > earlyHealing, 'one known polluted spin is a smaller share of an early permanent draft');
});

test('static cleanup proposals recognize temporary team output loss without forcing every polluted removal', () => {
  const state = fixture({ ids: ['1001', '1204', '1204', '1204', '1204'], floor: 8, coins: 0 });
  state.roster.filter(unit => unit.id === '1204').forEach(unit => { unit.stars = 3; });
  state.enemies.forEach(enemy => { enemy.hp = 400; enemy.maxHp = 400; });
  state.resourceAccess.removals = true;
  assert.equal(recommendRemoval(state), null);
  pollute(state, 'u1');
  assert.equal(recommendRemoval(state), 'u1', 'below 20 slots, removal must recognize actual team suppression rather than dilution');
  assert.equal(recommendAction(state).uid, 'u1');
  const cleared = { ...state, pendingFloor: true, phase: 'recruit', choices: ['1001', '1002', '1109'], enemies: state.enemies.map(enemy => ({ ...enemy, hp: 0 })) };
  assert.equal(recommendRemoval(cleared), null, 'the team penalty expires before the next encounter');
  assert.equal(recommendRemoval({ ...state, resourceAccess: { ...state.resourceAccess, removals: false } }), null);
  const cleaned = removeSymbol(state, 'u1');
  for (let sample = 0; sample < 16; sample++) {
    const rngState = 31001 + sample * 1237;
    assert.ok(spin({ ...cleaned, rngState }).lastSpin.damage > spin({ ...state, rngState }).lastSpin.damage);
  }
});

test('pollution forecasts ignore the old displayed board and the hidden next random state', () => {
  const state = fixture({ ids: ['1001', '1204', '1204', '1204', '1204'], phase: 'item', choices: ['gold_coin', 'faith_bond', 'dimension_dice'], floor: 8 });
  pollute(state, 'u1');
  const displayed = { ...structuredClone(state), board: [structuredClone(state.roster[0]), ...Array(19).fill(null)] };
  const absent = { ...structuredClone(state), board: Array(20).fill(null), seed: 'unknown-other-seed', rngState: 1987654321 };
  assert.deepEqual(recommendRewards(displayed), recommendRewards(absent));
});

test('temporary team loss uses without-replacement conditional draw probability and combines target effects before horizon mixing', () => {
  const damageOnly = { ...DEFAULT_PROFILE, weights: Object.fromEntries(Object.keys(DEFAULT_PROFILE.weights).map(key => [key, key === 'damage' ? 1 : 0])) };
  const originals = ['1001','1204'].map(id => [characterById(id), characterById(id).effects]);
  try {
    for (const [definition] of originals) definition.effects = []; // Isolate the marginal default-attack bonus from character-specific skills.
  for (const size of [20, 21, 35]) {
    const state = fixture({ ids: ['1001', ...Array(size - 1).fill('1204')], phase: 'item', choices: ['gold_coin', 'faith_bond', 'dimension_dice'], floor: 8 });
    const cleanScore = recommendRewards(state, { profile: damageOnly, lookahead: false }).choices[0].score;
    pollute(state, 'u1');
    const actualScore = recommendRewards(state, { profile: damageOnly, lookahead: false }).choices[0].score;
    const horizon = Math.min(24, Math.max(3, state.spinsLeft + (12 - state.floor) * 3.2));
    const encounterShare = Math.min(1, state.spinsLeft / horizon);
    const otherChance = size <= 20 ? 1 : 19 / (size - 1);
    const targetFactor = 1 - (1 - 0.5 * POLLUTION_ATTACK_MULTIPLIER) * encounterShare;
    const otherFactor = 1 - (1 - POLLUTION_ATTACK_MULTIPLIER) * otherChance * encounterShare;
    // Each gold_coin adds .3 power. Singles have factor3; aoe factors blend
    // current3 and future4 into3.7. No distinct synergy threshold is reached.
    const supportFactor = characterById('1001').normalAttack.primary;
    const attackerFactor = characterById('1204').normalAttack.eachTarget * 3.7;
    const expectedRatio = (supportFactor * targetFactor + (size - 1) * attackerFactor * otherFactor) / (supportFactor + (size - 1) * attackerFactor);
    assert.ok(Math.abs(actualScore / cleanScore - expectedRatio) < 1e-10);
  }
  } finally { for (const [definition, effects] of originals) definition.effects = effects; }
});
