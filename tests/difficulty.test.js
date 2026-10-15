import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, skipReward, continueEndless, validateSave } from '../src/engine.js';
import { DIFFICULTY, difficultyHealthMultiplier, lateDifficultyMultiplier } from '../src/difficulty.js';
function arrive(floor, options = {}) {
  const state = newGame(options);
  if (floor === 1) return state;
  state.floor = floor - 1; state.phase = 'recruit'; state.choices = ['1002']; state.pendingFloor = true;
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  return skipReward(state);
}
const total = state => state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0);

test('difficulty is freely chosen 1 to 20, defaults to 10, and is independent of encounter count', () => {
  assert.equal(newGame().difficulty, 10);
  assert.equal(newGame({ difficulty: 1 }).difficulty, 1);
  assert.equal(newGame({ difficulty: 20 }).difficulty, 20);
  assert.equal(newGame({ difficulty: 99 }).difficulty, 20);
  assert.equal(newGame({ difficulty: NaN }).difficulty, 10);
  const state = arrive(6, { difficulty: 4 });
  assert.equal(state.floor, 6);
  assert.equal(state.difficulty, 4);
  assert.notEqual(validateSave(state), null);
});

test('higher public difficulty monotonically raises the enemy health budget', () => {
  for (const floor of [1, 3, 6, 12]) {
    let previous = 0;
    for (let difficulty = 1; difficulty <= 20; difficulty++) {
      const state = arrive(floor, { seed: 'difficulty-order', difficulty });
      assert.ok(total(state) > previous, `floor ${floor}, difficulty ${difficulty}`);
      previous = total(state);
    }
  }
});

test('the curve has an explicit calibration scale and grows every two difficulty levels', () => {
  const at10 = difficultyHealthMultiplier(10);
  assert.equal(at10, DIFFICULTY.baseHealthScale * DIFFICULTY.difficulty10HealthMultiplier);
  assert.ok(Math.abs(difficultyHealthMultiplier(12) / at10 - DIFFICULTY.difficultyStepMultiplier) < 1e-12);
  const pivot = DIFFICULTY.lowerDifficultyPivot;
  const atPivot = difficultyHealthMultiplier(pivot);
  assert.ok(Math.abs(atPivot / at10 - DIFFICULTY.difficultyStepMultiplier ** ((pivot - 10) / 2)) < 1e-12);
  assert.ok(Math.abs(atPivot / difficultyHealthMultiplier(pivot - 2) - DIFFICULTY.lowerDifficultyStepMultiplier) < 1e-12);
  assert.ok(Math.abs(difficultyHealthMultiplier(pivot + 1) / atPivot - Math.sqrt(DIFFICULTY.difficultyStepMultiplier)) < 1e-12);
  assert.ok(Math.abs(atPivot / difficultyHealthMultiplier(pivot - 1) - Math.sqrt(DIFFICULTY.lowerDifficultyStepMultiplier)) < 1e-12);
  assert.equal(lateDifficultyMultiplier(1, 1.5), 1);
  assert.equal(lateDifficultyMultiplier(3, 1.5), 1);
  assert.equal(lateDifficultyMultiplier(12, 1.5), 1.5);
  assert.equal(lateDifficultyMultiplier(30, 1.5), 1.5);
});

test('resource masks never change the enemy health, attack values, or initial clause distribution', () => {
  for (const floor of [1, 3, 6, 12]) {
    const all = arrive(floor, { seed: 'control', difficulty: 10 });
    const disabled = arrive(floor, { seed: 'control', difficulty: 10, resourceAccess: { rerolls: false, removals: false, credits: false, defense: false } });
    assert.deepEqual(disabled.enemies, all.enemies);
    assert.deepEqual(disabled.activeDebuffs, all.activeDebuffs);
  }
});

test('endless preserves chosen difficulty and increases real enemy health after victory', () => {
  const state = arrive(12, { difficulty: 7 });
  state.phase = 'victory'; state.enemies.forEach(enemy => { enemy.hp = 0; });
  const next = continueEndless(state);
  assert.equal(next.floor, 13);
  assert.equal(next.difficulty, 7);
  assert.equal(next.endless, true);
  assert.ok(total(next) > total(state));
  assert.notEqual(validateSave(next), null);
});
