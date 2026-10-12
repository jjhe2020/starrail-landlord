import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, getSynergies } from '../src/engine.js';
import { recommendRewards, sampleRecommendation, createPolicyRandom, recommendRemoval, evaluateRun, DEFAULT_PROFILE, validateProfile } from '../src/ai.js';

function offer(ids, choices, { mode = 'combat', phase = 'recruit', hp = 100 } = {}) {
  const state = newGame({ mode, seed: 'policy-fixture' });
  state.phase = phase;
  state.hp = hp;
  state.choices = choices;
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  return state;
}

test('reward policy produces deterministic positive probabilities and never modifies the game', () => {
  const state = spin(newGame({ seed: 'ai-policy-determinism' }));
  const before = structuredClone(state);
  const result = recommendRewards(state);
  assert.deepEqual(recommendRewards(state), result);
  assert.deepEqual(state, before);
  assert.equal(result.choices.length, 3);
  assert.ok(Math.abs(result.choices.reduce((sum, choice) => sum + choice.probability, 0) - 1) < 1e-12);
  for (const choice of result.choices) {
    assert.ok(Number.isFinite(choice.score));
    assert.ok(choice.probability > 0 && choice.probability < 1);
    assert.ok(choice.reason.length > 0);
    assert.equal(state.choices[choice.index], choice.id);
  }
});

test('counterfactual lookahead cannot see the engine seed or future random state', () => {
  const first = spin(newGame({ seed: 'ai-observed-board' }));
  const second = structuredClone(first);
  second.seed = 'different-hidden-seed';
  second.rngState = 987654;
  assert.deepEqual(recommendRewards(first), recommendRewards(second));
});

test('sampling follows exact unrounded probabilities, including interval boundaries', () => {
  const recommendation = { choices: [{ index: 2, probability: 0.123456789 }, { index: 0, probability: 0.234567891 }, { index: 1, probability: 0.64197532 }] };
  assert.equal(sampleRecommendation(recommendation, 0), 2);
  assert.equal(sampleRecommendation(recommendation, 0.123456789 - 1e-10), 2);
  assert.equal(sampleRecommendation(recommendation, 0.123456789), 0);
  assert.equal(sampleRecommendation(recommendation, recommendation.choices[0].probability + recommendation.choices[1].probability), 1);
  assert.equal(sampleRecommendation(recommendation, 1), 1);
  const draws = createPolicyRandom('sampling-statistical-check');
  const counts = [0, 0, 0];
  const samples = 30_000;
  for (let sample = 0; sample < samples; sample++) counts[sampleRecommendation(recommendation, draws())] += 1;
  for (const choice of recommendation.choices) assert.ok(Math.abs(counts[choice.index] / samples - choice.probability) < 0.01);
});

test('policy RNG is reproducible and separate from all engine actions', () => {
  const first = createPolicyRandom('policy-seed');
  const second = createPolicyRandom('policy-seed');
  const state = newGame({ seed: 'untouched-engine' });
  const savedRandom = state.rngState;
  for (let sample = 0; sample < 100; sample++) assert.equal(first(), second());
  assert.equal(state.rngState, savedRandom);
  assert.notEqual(createPolicyRandom('other-policy-seed')(), createPolicyRandom('policy-seed')());
});

test('a useful immediate merge is preferred over equivalent unconnected common characters', () => {
  const state = offer(['1001', '1001'], ['1001', '1109', '1008']);
  const recommendation = recommendRewards(state, { lookahead: false });
  const preferred = recommendation.choices.reduce((best, choice) => choice.probability > best.probability ? choice : best);
  assert.equal(preferred.id, '1001');
  assert.match(preferred.reason, /三合一/);
});

test('policy detects chained third-star merges', () => {
  const state = offer(['1001', '1001', '1001', '1001'], ['1001', '1109', '1008']);
  state.roster[0].stars = 2;
  state.roster[1].stars = 2;
  const recommendation = recommendRewards(state, { lookahead: false });
  assert.ok(recommendation.choices[0].probability > recommendation.choices[1].probability);
  assert.match(recommendation.choices[0].reason, /三星/);
});

test('completing distinct-character synergies improves a supporting recruitment', () => {
  const state = offer(['1008', '1013'], ['1009', '1105', '1001'], { mode: 'classic' });
  const recommendation = recommendRewards(state, { lookahead: false });
  assert.ok(recommendation.choices[0].probability > recommendation.choices[1].probability);
  assert.match(recommendation.choices[0].reason, /空间站/);
});

test('temporary reinforcements do not supply permanent synergy identities or merge targets', () => {
  const state = offer(['1002', '1002'], ['1102', '1109', '1008']);
  state.roster.forEach(unit => { unit.temporary = 2; });
  assert.equal(getSynergies(state).find(synergy => synergy.id === 'hunt').count, 0);
  assert.doesNotMatch(recommendRewards(state, { lookahead: false }).choices[0].reason, /激活.*巡猎/);
  const duplicate = offer(['1001', '1001'], ['1001', '1109', '1008']);
  duplicate.roster.forEach(unit => { unit.temporary = 2; });
  assert.doesNotMatch(recommendRewards(duplicate, { lookahead: false }).choices[0].reason, /三合一/);
});

test('credit income and defensive items have different values in classic and combat', () => {
  const choices = ['faith_bond', 'preservation_wax', 'dimension_dice'];
  const classic = newGame({ mode: 'classic' });
  classic.phase = 'item';
  classic.choices = choices;
  const combat = newGame({ mode: 'combat' });
  combat.phase = 'item';
  combat.choices = choices;
  const classicAdvice = recommendRewards(classic, { lookahead: false }).choices;
  const combatAdvice = recommendRewards(combat, { lookahead: false }).choices;
  assert.ok(classicAdvice[0].probability > classicAdvice[1].probability);
  assert.ok(combatAdvice[0].probability < combatAdvice[1].probability);
  assert.match(combatAdvice[0].reason, /重选/);
});

test('essence triggering horizon lowers late untriggerable rewards', () => {
  const state = offer(['1204', '1204', '1204'], ['essence_elation', 'essence_destruction', 'essence_nihility'], { phase: 'essence' });
  state.floor = 11;
  state.spinsLeft = 1;
  const choices = recommendRewards(state, { lookahead: false }).choices;
  assert.ok(choices[0].probability > choices[1].probability);
  assert.ok(choices[0].probability > choices[2].probability);
});

test('removal preserves early rosters and trims dilution only when the team improves', () => {
  assert.equal(recommendRemoval(newGame()), null);
  const state = offer([...Array(20).fill('1204'), '1105'], ['1001', '1002', '1008']);
  state.shield = 200;
  const original = structuredClone(state);
  assert.equal(recommendRemoval(state), 'u21');
  assert.deepEqual(state, original);
});

test('profile validation rejects unsafe bounds and unknown weights, preserving a safe policy', () => {
  assert.deepEqual(validateProfile(DEFAULT_PROFILE), DEFAULT_PROFILE);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, temperature: 0 }), null);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, lookaheadSamples: 99 }), null);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, weights: { ...DEFAULT_PROFILE.weights, damage: NaN } }), null);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, weights: { ...DEFAULT_PROFILE.weights, unknown: 1 } }), null);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, version: '<script>' }), null);
  const state = spin(newGame());
  assert.deepEqual(recommendRewards(state, { profile: { unsafe: true } }), recommendRewards(state));
});

test('nonreward phases have empty advice and terminal objectives prioritize actual wins', () => {
  for (const phase of ['ready', 'victory', 'defeat', 'unknown']) assert.deepEqual(recommendRewards({ phase }).choices, []);
  assert.equal(sampleRecommendation({ choices: [] }, 0), -1);
  const lost = newGame();
  lost.floor = 12;
  lost.phase = 'defeat';
  lost.enemies.forEach(enemy => { enemy.hp = 1; });
  const won = structuredClone(lost);
  won.phase = 'victory';
  assert.ok(evaluateRun(won) > evaluateRun(lost));
});
