import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';
import { newGame, getSynergies, spin } from '../src/engine.js';
import { estimateEffectsForAi, forecastGrowthForAi, recommendRewards, POLICY_VERSION } from '../src/ai.js';

function stateFor(ids, { hp = 35, shield = 20, coins = 35, ticks = 2 } = {}) {
  const state = newGame({ seed: 'expanded-content-ai' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: index % 3 === 0 ? 2 : 1, growth: 0, ticks }));
  state.uidCounter = ids.length + 1;
  state.hp = hp; state.shield = shield; state.coins = coins;
  return state;
}
const estimate = state => estimateEffectsForAi(state, { horizon: 20, output: 60, threat: 18, healing: 4, shields: 5, retirementRate: 1, active: getSynergies(state).filter(s => s.active) });

test('bound healer, shield, permanent training, summon and credit mechanics are valued from shared declarations', () => {
  const healer = estimate(stateFor(['1110', '1103']));
  assert.ok(healer.healing > 0);
  assert.ok(healer.shields > 0);
  const grower = estimate(stateFor(['1303', '1008']));
  assert.ok(grower.growthRates.get('u2') > 0);
  assert.equal(grower.growthRates.get('u1') || 0, 0);
  assert.equal(estimate(stateFor(['1404'])).selfDrain, 0, 'the v0.6 attack kit no longer charges historical self harm');
  const summoner = estimate(stateFor(['1402']));
  assert.ok(summoner.damage > 0);
  const trader = estimate(stateFor(['1112']));
  assert.ok(trader.economy > 0);
});

test('new adjacency and directed support abilities improve actual attacker estimates instead of being invisible support bodies', () => {
  const state = stateFor(['1303', '1313', '1008', '1002']);
  const result = estimate(state);
  assert.ok(result.powerMultipliers.get('u4') > 1);
  assert.ok(result.growthRates.get('u3') > 0);
  assert.equal(result.growthRates.get('u1') || 0, 0, 'Ruan Mei teaches nearby permanent attackers rather than growing herself');
});

test('new passive items modify old character utilities and chance scales a multiplier delta, not its entire value', () => {
  const state = stateFor(['1001', '1105', '1002']);
  state.items = ['peace_price', 'corrupt_fruit', 'triangle_instrument', 'impermanence_dice'];
  const result = estimate(state);
  assert.equal(result.shieldMultiplier, 1.2);
  assert.equal(result.healMultiplier, 1.2);
  assert.equal(result.growthMultiplier, 1.2);
  assert.equal(result.buffMultipliers.get('u1'), 1.2);
  const mask = stateFor(['1002']);
  mask.items = ['fools_mask'];
  const randomBoost = estimate(mask);
  assert.ok(Math.abs(randomBoost.powerMultipliers.get('u1') - 1.0375) < 1e-12);
});

test('training gifts retain their bounded recipients and are not multiplied as immediate buffs', () => {
  const state = stateFor(['1207', '1002']);
  state.roster.forEach(unit => { unit.stars = 1; unit.ticks = 1; });
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 100000; });
  const expected = estimate(state).growthRates.get('u2');
  assert.ok(expected > 0);
  for (const items of [[], ['triangle_instrument'], ['harmony_wax'], ['triangle_instrument', 'harmony_wax']]) {
    const candidate = { ...structuredClone(state), items };
    assert.equal(estimate(candidate).growthRates.get('u2'), expected);
    const actual = spin(candidate);
    assert.equal(actual.roster.find(unit => unit.id === '1002').growth, 0.35);
    assert.equal(actual.lastSpin.effects.find(e => e.sourceId === '1207' && e.targetUid === 'u2' && e.type === 'growth').amount, 0.35);
  }
});

test('shared resonance model respects conditions, periodic bursts, resource gates and per-member value', () => {
  const station = stateFor(['1013', '1008'], { ticks: 2 });
  const burst = estimate(station);
  assert.ok(burst.powerAdds.get('u1') > 0);
  assert.ok(burst.powerAdds.get('u2') > 0);
  const trader = stateFor(['1112']);
  trader.resourceAccess.credits = false;
  assert.equal(estimate(trader).economy, 0);
  const low = stateFor(['1008', '1107'], { hp: 40 });
  const high = stateFor(['1008', '1107'], { hp: 90 });
  assert.ok(estimate(low).powerMultipliers.get('u1') > (estimate(high).powerMultipliers.get('u1') || 1));
});

test('expanded static estimates and no-lookahead advice cannot see hidden RNG, seed or a stale displayed board', () => {
  const state = stateFor(['1110', '1303', '1402', '1407', '1002', '1104']);
  state.items = ['fools_mask', 'beacon_colorant'];
  state.phase = 'recruit'; state.choices = ['1404', '1305', '1313'];
  const before = structuredClone(state);
  const result = estimate(state);
  const advice = recommendRewards(state, { lookahead: false });
  const hidden = structuredClone(state);
  hidden.rngState = 987654321;
  hidden.seed = 'another-unseen-seed';
  hidden.board = Array(20).fill(null);
  hidden.lastSpin = { ...hidden.lastSpin, healing: 9999, damage: 99999, values: Array(20).fill(999) };
  assert.deepEqual(estimate(hidden), result);
  assert.deepEqual(recommendRewards(hidden, { lookahead: false }), advice);
  assert.deepEqual(state, before);
});

test('all 40 new recruit choices and all 68 new rewards receive finite meaningful policy probabilities with a scored skip', () => {
  const roster = CHARACTERS.map(c => c.id);
  for (const [phase, entries] of [['recruit', CHARACTERS.slice(24)], ['item', ITEMS.slice(20)], ['essence', ESSENCES.slice(8)]]) {
    for (const definition of entries) {
      const state = stateFor(roster);
      state.phase = phase;
      state.choices = [definition.id];
      const result = recommendRewards(state, { lookahead: false });
      assert.equal(result.policyVersion, POLICY_VERSION);
      assert.equal(result.choices.length, 2);
      assert.equal(result.choices[1].id, 'skip');
      assert.ok(result.choices.every(c => Number.isFinite(c.score) && Number.isFinite(c.probability) && c.probability > 0 && c.probability < 1), definition.id);
      assert.ok(result.choices[0].reason.length > 0);
    }
  }
});

test('new essence progression is forecast from its declared metric and resource-dependent tasks can become unreachable', () => {
  const early = stateFor(['1002', '1105', '1112']);
  early.phase = 'essence'; early.choices = ['essence_dimensional_dice'];
  const late = structuredClone(early);
  late.floor = 12; late.spinsLeft = 1;
  const available = recommendRewards(early, { lookahead: false }).choices[0];
  const ending = recommendRewards(late, { lookahead: false }).choices[0];
  assert.ok(available.score > ending.score);
  const disabled = structuredClone(early);
  disabled.resourceAccess.rerolls = false;
  const impossible = recommendRewards(disabled, { lookahead: false }).choices[0];
  assert.ok(available.score > impossible.score);
});

test('temporary growth forecasts use the declared cadence and cannot outlive the instance', () => {
  const state = stateFor(['1002', '1001']);
  const unit = { ...state.roster[0], ticks: 0, temporary: 2 };
  assert.equal(forecastGrowthForAi(state, unit, { horizon: 24, draw: 1 }), 0, 'a fresh two-appearance modern Dan Heng cannot reach appearance four');
  unit.ticks = 3;
  const options = { horizon: 24, draw: 1, declaredRate: 0.15 / 4 };
  const temporary = forecastGrowthForAi(state, unit, options);
  assert.equal(temporary, 0.15);
  assert.equal(forecastGrowthForAi(state, unit, { ...options, horizon: 200 }), temporary);
  const permanent = { ...unit }; delete permanent.temporary;
  assert.ok(forecastGrowthForAi(state, permanent, options) > temporary);
  state.activeDebuffs.push({ id: 'growth_audit' });
  assert.equal(forecastGrowthForAi(state, permanent, options), 0.5 * forecastGrowthForAi({ ...state, activeDebuffs: [] }, permanent, options));
});
