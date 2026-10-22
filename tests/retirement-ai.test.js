import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward } from '../src/engine.js';
import { estimateRetirementsForAi } from '../src/retirement-ai.js';
import { estimateEffectsForAi } from '../src/ai.js';

function fixture(ids, ticks = 0) {
  const state = newGame({ seed: 'commission-ai' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth:0,attackBonus: 0, ticks: index === 0 ? ticks : 0 }));
  state.uidCounter = ids.length + 1; state.board = Array(20).fill(null);
  return state;
}

test('no relationship creates no income, while origin history never disables a legitimate host', () => {
  assert.equal(estimateRetirementsForAi(fixture(['1003']), { horizon: 32 }).expectedCompletions, 0);
  assert.equal(estimateRetirementsForAi(fixture(['1001','1001']), { horizon: 32 }).expectedCompletions, 0);
  const state=fixture(['1003','1001','1001'],2),baseline=estimateRetirementsForAi(state,{horizon:32});
  state.roster[0].origin='u99';
  assert.deepEqual(estimateRetirementsForAi(state,{horizon:32}),baseline);
});

test('last normal identity enables later supply but is never treated as infinitely consumable stock', () => {
  const state = fixture(['1003', '1001']);
  const short = estimateRetirementsForAi(state, { horizon: 3 });
  assert.equal(short.expectedCompletions, 0, 'first supply appears only on appearance four');
  const long = estimateRetirementsForAi(state, { horizon: 32 });
  assert.ok(long.expectedCompletions > 2);
  assert.ok(long.byRule.express_photography.ordinaryRemoved>=0&&long.byRule.express_photography.ordinaryRemoved<=1);
  assert.ok(long.byRule.express_photography.retainedCopies>=1-1e-9);
  assert.ok(long.availability.get('u2')>0, 'an original copy may leave once another exists; final protection applies to either origin');
  assert.ok(long.byRule.express_photography.pending <= 1);
  assert.ok(long.byRule.express_photography.completed <= long.byRule.express_photography.supplied);
});

test('cadence offset and finite final encounter prevent rewards that cannot occur before the deadline', () => {
  const early = fixture(['1003', '1001', '1001']);
  assert.equal(estimateRetirementsForAi(early, { horizon: 1 }).expectedCompletions, 0);
  early.roster[0].ticks = 2;
  assert.ok(estimateRetirementsForAi(early, { horizon: 1 }).expectedCompletions > 0);
  const late = fixture(['1003', '1001']); late.floor = 12; late.spinsLeft = 1;
  assert.equal(estimateRetirementsForAi(late, { horizon: 24 }).expectedCompletions, 0);
  late.spinsLeft = 0;
  assert.equal(estimateRetirementsForAi(late, { horizon: 24 }).economy, 0);
});

test('normal material is capped by extra copies and future training closes eligibility windows', () => {
  const state = fixture(['1004', '1002', '1002']);
  state.roster.slice(1).forEach(u => { u.ticks = 2; u.attackBonus = 1; });
  const delayed = estimateRetirementsForAi(state, { horizon: 24 });
  assert.equal(delayed.byRule.express_archives.ordinaryRemoved, 0, 'Dan Heng grows beyond one before the first eligible host appearance');
  state.roster[0].ticks = 2;
  const immediate = estimateRetirementsForAi(state, { horizon: 24 });
  assert.ok(immediate.byRule.express_archives.ordinaryRemoved > 0);
  assert.ok(immediate.byRule.express_archives.ordinaryRemoved <= 1);
  state.roster.slice(1).forEach(u => { u.stars = 2; });
  assert.equal(estimateRetirementsForAi(state, { horizon: 24 }).byRule.express_archives.ordinaryRemoved, 0);
  const tutored = fixture(['1003', '1001', '1001']);
  const growing = new Map([['u2', 2], ['u3', 2]]);
  assert.equal(estimateRetirementsForAi(tutored, { horizon: 24, growthRates: growing }).byRule.express_photography.ordinaryRemoved, 0);
});

test('drawing and adjacency dilution materially lower completion rates in oversized rosters', () => {
  const compact = fixture(['1003', '1001'], 2);
  const large = fixture(['1003', '1001', ...Array(48).fill('1008')], 2);
  const small = estimateRetirementsForAi(compact, { horizon: 32 });
  const diluted = estimateRetirementsForAi(large, { horizon: 32 });
  assert.ok(diluted.completionRate < small.completionRate * 0.45);
  const twoHosts = fixture(['1003', '1003', '1001'], 2);
  const shared = estimateRetirementsForAi(twoHosts, { horizon: 32 });
  assert.ok(shared.byRule.express_photography.pending <= 1);
  assert.ok(shared.expectedCompletions <= shared.byRule.express_photography.supplied);
});

test('AI integrates permanent growth and spendable credits, and discounts retired material output', () => {
  const state = fixture(['1003', '1001', '1001'], 2);
  const result = estimateEffectsForAi(state, { horizon: 24 });
  assert.ok(result.growthRates.get('u1') > 0);
  assert.ok(result.powerAdds.get('u1') > 0);
  assert.ok(result.economy > 0);
  assert.ok(result.retirementAvailability.get('u2') < 1);
  assert.ok(result.retirementAvailability.get('u3') < 1);
  assert.ok(estimateRetirementsForAi(state,{horizon:24}).byRule.express_photography.retainedCopies>=1-1e-9,'at least one character remains, regardless of recruitment or creation origin');
  state.resourceAccess.credits = false;
  const disabled = estimateEffectsForAi(state, { horizon: 24 });
  assert.equal(disabled.economy, 0);
  assert.equal(disabled.growthRates.get('u1'), result.growthRates.get('u1'));
  const solo = estimateEffectsForAi(fixture(['1003']), { horizon: 24 });
  assert.equal(solo.growthRates.get('u1') || 0, 0);
});

test('forecast is pure and invariant to hidden seed, RNG and previous board', () => {
  const state = fixture(['1003', '1001', '1001'], 2), before = structuredClone(state);
  const result = estimateRetirementsForAi(state, { horizon: 24 });
  const hidden = structuredClone(state); hidden.rngState = 42; hidden.seed = 'unseen'; hidden.board = hidden.roster;
  hidden.lastSpin.damage = 1e8;
  assert.deepEqual(estimateRetirementsForAi(hidden, { horizon: 24 }), result);
  assert.deepEqual(state, before);
});

test('skill permanent-attack increments combine additively when forecasting eligibility', () => {
  const state = fixture(['1003', '1001', '1001']);
  state.items = ['rubert_gear', 'impermanence_dice'];
  const growthRates = new Map([['u2', .29], ['u3', .29]]);
  const detected = estimateRetirementsForAi(state, { horizon: 3, growthRates });
  const additive = estimateRetirementsForAi(state, { horizon: 3, growthRates, growthMultiplier: 1.7 });
  const compounded = estimateRetirementsForAi(state, { horizon: 3, growthRates, growthMultiplier: 1.8 });
  assert.deepEqual(detected, additive);
  assert.ok(detected.expectedCompletions > 0);
  assert.equal(compounded.expectedCompletions, 0);
});

test('commission permanent attack respects the enemy audit and excludes skill-only curios', () => {
  const state = fixture(['1003', '1001', '1001'], 2);
  const base = estimateRetirementsForAi(state, { horizon: 1 });
  state.items = ['rubert_gear', 'impermanence_dice'];
  assert.equal(estimateRetirementsForAi(state, { horizon: 1 }).growthRates.get('u1'), base.growthRates.get('u1'));
  state.activeDebuffs = [{ id: 'growth_audit' }];
  const audited = estimateRetirementsForAi(state, { horizon: 1 });
  assert.equal(audited.expectedCompletions, base.expectedCompletions);
  assert.equal(audited.growthRates.get('u1'), base.growthRates.get('u1') * .5);
});

test('finite loop forecast matches independent real-engine seeds within a useful tolerance', () => {
  let completed = 0;
  const state = fixture(['1003', '1001']);
  const expected = estimateRetirementsForAi(state, { horizon: 32 }).expectedCompletions;
  for (let index = 0; index < 100; index++) {
    let actual = newGame({ seed: `commission-probe-${index}` });
    actual.roster = structuredClone(state.roster); actual.uidCounter = 3;
    actual.enemies = [{ id: 'probe', name: 'test', col: 2, hp: 1e9, maxHp: 1e9, attack: 0, boss: false }];
    actual.enemySkill = { id: 'armor', name: 'test', description: 'test' }; actual.spinsLeft = 80; actual.encounter.deadline = 80;
    for (let turn = 0; turn < 32; turn++) {
      actual = spin(actual);
      while (['recruit', 'item', 'essence'].includes(actual.phase)) actual = skipReward(actual);
    }
    completed += actual.retirementStats.completed;
  }
  assert.ok(Math.abs(completed / 100 - expected) < 0.35, `observed=${completed / 100}, expected=${expected}`);
});


test('commission fixed attribute rewards stay fixed across stars and star audits', () => {
  const state = fixture(['1003', '1001', '1001'], 2);
  const base = estimateRetirementsForAi(state, { horizon: 20 });
  assert.ok(base.growthRates.get('u1') > 0);
  assert.ok(base.powerAdds.get('u1') > 0);
  for (const [stars, growthFactor, powerFactor] of [[2, 1, 1], [3, 1, 1]]) {
    const promoted = structuredClone(state); promoted.roster[0].stars = stars;
    const forecast = estimateRetirementsForAi(promoted, { horizon: 20 });
    assert.ok(Math.abs(forecast.growthRates.get('u1') / base.growthRates.get('u1') - growthFactor) < 1e-12);
    assert.ok(Math.abs(forecast.powerAdds.get('u1') / base.powerAdds.get('u1') - powerFactor) < 1e-12);
    const audited = structuredClone(promoted); audited.activeDebuffs = [{ id: 'star_audit' }];
    const penalized = estimateRetirementsForAi(audited, { horizon: 20 });
    assert.ok(Math.abs(penalized.growthRates.get('u1') / forecast.growthRates.get('u1') - 1) < 1e-12);
    assert.ok(Math.abs(penalized.powerAdds.get('u1') / forecast.powerAdds.get('u1') - 1) < 1e-12);
  }
  let matched = false;
  for (let seed = 0; seed < 32; seed++) {
    const ready = structuredClone(state); ready.rngState = newGame({ seed: `commission-star-${seed}` }).rngState;
    const ordinary = spin(ready);
    if (!ordinary.retirementStats.completed) continue;
    matched = true;
    assert.equal(ordinary.roster.find(unit => unit.id === '1003').attackBonus, 0.35);
    for (const [stars, expected] of [[2, 0.35], [3, 0.35]]) {
      const promoted = structuredClone(ready); promoted.roster[0].stars = stars;
      assert.ok(Math.abs(spin(promoted).roster.find(unit => unit.id === '1003').attackBonus - expected) <= 0.0051);
    }
    const audited = structuredClone(ready); audited.roster[0].stars = 3; audited.activeDebuffs = [{ id: 'star_audit' }];
    assert.equal(spin(audited).roster.find(unit => unit.id === '1003').attackBonus, 0.35);
    break;
  }
  assert.ok(matched, 'independent seeded adjacency probes must exercise an actual commission');
});
