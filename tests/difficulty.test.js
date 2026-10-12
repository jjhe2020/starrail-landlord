import test from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTY, lateDifficultyMultiplier } from '../src/difficulty.js';
import { newGame, chooseReward, spin, continueEndless, validateSave } from '../src/engine.js';
import { recommendRewards } from '../src/ai.js';

function arrive(mode, floor) {
  const state = newGame({ mode, seed: 'difficulty-lifecycle' });
  if (floor === 1) return state;
  state.floor = floor - 1;
  state.phase = 'recruit';
  state.spinsLeft = 0;
  state.pendingFloor = true;
  state.choices = ['1002', '1013', '1009'];
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  return chooseReward(state, 0);
}

function withRules(values, run) {
  const original = { ...DIFFICULTY };
  Object.assign(DIFFICULTY, values);
  try { return run(); } finally { Object.assign(DIFFICULTY, original); }
}

const baseline = { combatLateHealthMultiplier: 1, classicLateRentMultiplier: 1 };
const harder = { combatLateHealthMultiplier: 1.5, classicLateRentMultiplier: 1.3 };

test('difficulty preserves the first three floors and ramps monotonically to a capped end value', () => {
  const values = Array.from({ length: 15 }, (_, floor) => lateDifficultyMultiplier(floor, 1.5));
  assert.deepEqual(values.slice(0, 4), [1, 1, 1, 1]);
  assert.equal(values[12], 1.5);
  assert.equal(values[13], values[12]);
  assert.equal(values[14], values[12]);
  for (let floor = 4; floor <= 12; floor++) assert.ok(values[floor] > values[floor - 1]);
  for (const mode of ['combat', 'classic']) for (const floor of [1, 2, 3]) {
    assert.deepEqual(withRules(harder, () => arrive(mode, floor)), withRules(baseline, () => arrive(mode, floor)));
  }
});

test('production floor transitions raise health and rent while preserving attack, deadlines, bosses and RNG', () => {
  for (const mode of ['combat', 'classic']) for (const floor of [4, 6, 9, 12]) {
    const old = withRules(baseline, () => arrive(mode, floor));
    const next = withRules(harder, () => arrive(mode, floor));
    assert.notEqual(validateSave(next), null);
    assert.equal(next.rngState, old.rngState);
    assert.equal(next.spinsLeft, old.spinsLeft);
    assert.deepEqual(next.encounter, old.encounter);
    assert.ok(next.rent > old.rent);
    for (const enemy of next.enemies) {
      const original = old.enemies.find(value => value.col === enemy.col);
      assert.ok(enemy.maxHp > original.maxHp);
      assert.equal(enemy.hp, enemy.maxHp);
      assert.equal(enemy.attack, original.attack);
      assert.equal(enemy.boss, original.boss);
      if (enemy.boss) assert.equal(enemy.col, 2);
    }
  }
});

test('calibrated production checkpoints match the published health and rounded rent values', () => {
  assert.deepEqual(arrive('combat', 6).enemies.map(enemy => enemy.maxHp), [111, 111, 243, 111, 111]);
  assert.deepEqual(arrive('combat', 12).enemies.map(enemy => enemy.maxHp), [1382, 1382, 3040, 1382, 1382]);
  assert.equal(arrive('classic', 6).rent, 547);
  assert.equal(arrive('classic', 12).rent, 7168);
});

test('existing saves retain an encounter and deterministic actions, then adopt new difficulty on the next floor', () => {
  for (const mode of ['combat', 'classic']) {
    const previous = withRules(baseline, () => arrive(mode, 11));
    const encoded = JSON.stringify(previous);
    withRules(harder, () => {
      const resumed = validateSave(JSON.parse(encoded));
      assert.deepEqual(resumed, previous);
      assert.deepEqual(spin(resumed), spin(previous));
      resumed.phase = 'recruit';
      resumed.pendingFloor = true;
      resumed.spinsLeft = 0;
      resumed.choices = ['1002', '1013', '1009'];
      resumed.enemies.forEach(enemy => { enemy.hp = 0; });
      const next = chooseReward(resumed, 0);
      const old = withRules(baseline, () => arrive(mode, 12));
      assert.equal(next.floor, 12);
      assert.ok(next.rent > old.rent);
      if (mode === 'combat') assert.ok(next.enemies[0].maxHp > old.enemies[0].maxHp);
      assert.notEqual(validateSave(next), null);
    });
  }
});

test('endless retains the full late multiplier and continues increasing beyond floor thirteen', () => {
  for (const mode of ['combat', 'classic']) {
    const victory = arrive(mode, 12);
    victory.phase = 'victory';
    victory.spinsLeft = 0;
    victory.enemies.forEach(enemy => { enemy.hp = 0; });
    const old = withRules(baseline, () => continueEndless(victory));
    const next = withRules(harder, () => continueEndless(victory));
    assert.equal(next.floor, 13);
    assert.equal(next.endless, true);
    assert.ok(next.rent > old.rent);
    if (mode === 'combat') assert.ok(next.enemies.every((enemy, index) => enemy.maxHp > old.enemies[index].maxHp));
    assert.notEqual(validateSave(next), null);
    const later = withRules(harder, () => { victory.floor = 13; return continueEndless(victory); });
    assert.equal(later.floor, 14);
    assert.ok(later.rent > next.rent);
    if (mode === 'combat') assert.ok(later.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0) > next.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0));
  }
});

test('AI lookahead on a harder late encounter is deterministic and cannot mutate the player state', () => {
  withRules(harder, () => {
    const state = arrive('combat', 9);
    state.phase = 'recruit';
    state.choices = ['1102', '1104', '1005'];
    const before = structuredClone(state);
    const recommendation = recommendRewards(state, { lookahead: true });
    assert.deepEqual(state, before);
    assert.deepEqual(recommendation, recommendRewards(state, { lookahead: true }));
    assert.ok(Math.abs(recommendation.choices.reduce((sum, choice) => sum + choice.probability, 0) - 1) < 1e-12);
  });
});
