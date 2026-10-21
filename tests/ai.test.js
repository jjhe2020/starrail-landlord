import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, getSynergies, chooseReward } from '../src/engine.js';
import { recommendRewards, sampleRecommendation, createPolicyRandom, recommendRemoval, evaluateRun, DEFAULT_PROFILE, validateProfile, POLICY_VERSION } from '../src/ai.js';

function offer(ids, choices, { phase = 'recruit', hp = 100 } = {}) {
  const state = newGame({ seed: 'policy-fixture' });
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
  assert.equal(result.choices.length, 4);
  assert.equal(result.policyVersion, POLICY_VERSION);
  assert.ok(Math.abs(result.choices.reduce((sum, choice) => sum + choice.probability, 0) - 1) < 1e-12);
  for (const choice of result.choices) {
    assert.ok(Number.isFinite(choice.score));
    assert.ok(choice.probability > 0 && choice.probability < 1);
    assert.ok(choice.reason.length > 0);
    if (choice.action === 'choose') assert.equal(state.choices[choice.index], choice.id);
    else {
      assert.equal(choice.action, 'skip');
      assert.equal(choice.index, state.choices.length);
      assert.equal(choice.id, 'skip');
    }
  }
});

test('recruit, item and essence rewards all include a scored skip action at the appended index', () => {
  const phases = { recruit: ['1001', '1105', '1109'], item: ['faith_bond', 'gold_coin', 'seal_stamp'], essence: ['essence_elation', 'essence_destruction', 'essence_abundance'] };
  for (const [phase, ids] of Object.entries(phases)) {
    const state = newGame({ seed: `skip-contract-${phase}` });
    state.phase = phase;
    state.choices = ids;
    const recommendation = recommendRewards(state);
    assert.equal(recommendation.choices.length, ids.length + 1);
    assert.deepEqual(recommendation.choices.slice(0, ids.length).map(choice => [choice.index, choice.id, choice.action]), ids.map((id, index) => [index, id, 'choose']));
    const skip = recommendation.choices.at(-1);
    assert.equal(skip.action, 'skip');
    assert.equal(skip.id, 'skip');
    assert.equal(skip.index, ids.length);
    assert.equal(skip.score, 0, 'exported score is a marginal gain over the genuinely evaluated skip state');
    assert.ok(skip.probability > 0 && skip.probability < 1);
    assert.ok(skip.reason.length > 0);
    assert.ok(Math.abs(recommendation.choices.reduce((sum, choice) => sum + choice.probability, 0) - 1) < 1e-12);
    assert.equal(sampleRecommendation(recommendation, 1), ids.length);
  }
  const partial = offer(['1001'], ['1002', '1109']);
  const advice = recommendRewards(partial);
  assert.equal(advice.choices.length, 3);
  assert.equal(advice.choices.at(-1).index, 2);
  assert.equal(advice.choices.at(-1).action, 'skip');
});

test('skipping has a dynamic real probability and can prevent dilution of a strong full board', () => {
  const ids = ['1001', '1105', '1109'];
  const sparse = offer(['1001'], ids);
  const crowded = offer(Array(20).fill('1204'), ids);
  crowded.roster.forEach(unit => { unit.stars = 3; });
  const sparseAdvice = recommendRewards(sparse, { lookahead: false });
  const crowdedAdvice = recommendRewards(crowded, { lookahead: false });
  const sparseSkip = sparseAdvice.choices.at(-1);
  const crowdedSkip = crowdedAdvice.choices.at(-1);
  assert.ok(crowdedSkip.probability > sparseSkip.probability + 0.25);
  assert.ok(crowdedAdvice.choices.every(choice => choice.action === 'skip' || choice.score < 0), 'weak additions reduce expected output after the 20-slot board is full');
  assert.ok(crowdedSkip.probability > Math.max(...crowdedAdvice.choices.slice(0, -1).map(choice => choice.probability)));
  assert.match(crowdedSkip.reason, /保留|稀释/);
});

test('neutral free rewards share softmax equally with skip, and useful rewards lower skip preference', () => {
  const neutral = newGame();
  neutral.phase = 'item';
  neutral.choices = ['preservation_wax', 'abundance_wax', 'dimension_dice'];
  const useful = structuredClone(neutral);
  useful.choices = ['broken_clock', 'gold_coin', 'seal_stamp'];
  const neutralProfile = { ...DEFAULT_PROFILE, weights: Object.fromEntries(Object.keys(DEFAULT_PROFILE.weights).map(key => [key, 0])) };
  const neutralAdvice = recommendRewards(neutral, { profile: neutralProfile, lookahead: false });
  assert.deepEqual(neutralAdvice.choices.map(choice => choice.probability), [0.25, 0.25, 0.25, 0.25]);
  assert.ok(recommendRewards(useful, { lookahead: false }).choices.at(-1).probability < 0.25);
});

test('exact four-action sampling includes the unrounded skip probability, not a forced maximum', () => {
  const state = offer(['1001'], ['1002', '1105', '1109']);
  const recommendation = recommendRewards(state, { lookahead: false });
  const skip = recommendation.choices.at(-1);
  const boundary = recommendation.choices.slice(0, -1).reduce((sum, choice) => sum + choice.probability, 0);
  assert.equal(sampleRecommendation(recommendation, boundary - 1e-10), state.choices.length - 1);
  assert.equal(sampleRecommendation(recommendation, boundary), state.choices.length);
  const random = createPolicyRandom('four-action-frequency-check');
  const observed = [0, 0, 0, 0];
  const draws = 40_000;
  for (let sample = 0; sample < draws; sample++) observed[sampleRecommendation(recommendation, random())] += 1;
  for (const choice of recommendation.choices) assert.ok(Math.abs(observed[choice.index] / draws - choice.probability) < 0.01);
  assert.ok(observed[skip.index] > 0);
});

test('saved legacy model weights remain reusable while recommendations identify the current policy algorithm', () => {
  const oldProfile = { ...DEFAULT_PROFILE, version: 'context-v1' };
  const validated = validateProfile(oldProfile);
  assert.equal(validated.version, 'context-v1');
  assert.deepEqual(validated.weights, DEFAULT_PROFILE.weights);
  const advice = recommendRewards(spin(newGame()), { profile: oldProfile });
  assert.equal(advice.version, 'context-v1');
  assert.equal(advice.policyVersion, POLICY_VERSION);
  assert.equal(DEFAULT_PROFILE.version, 'context-v3-resources');
  assert.equal(advice.choices.at(-1).action, 'skip');
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
  const state = offer(['1002', '1002', '1001'], ['1002', '1109', '1008']);
  const recommendation = recommendRewards(state, { lookahead: false });
  const preferred = recommendation.choices.reduce((best, choice) => choice.probability > best.probability ? choice : best);
  assert.equal(preferred.id, '1002');
  assert.match(preferred.reason, /三合一/);
});

test('policy detects chained third-star merges', () => {
  const state = offer(['1002', '1002', '1002', '1002', '1001'], ['1002', '1109', '1008']);
  state.roster[0].stars = 2;
  state.roster[1].stars = 2;
  const recommendation = recommendRewards(state, { lookahead: false });
  assert.ok(recommendation.choices[0].score > recommendation.choices.at(-1).score, 'a real chain merge gains value over skipping');
  assert.match(recommendation.choices[0].reason, /三星/);
  assert.equal(chooseReward(state, 0).roster.find(unit => unit.id === '1002').stars, 3);
});

test('completing distinct-character synergies improves a supporting recruitment', () => {
  const state = offer(['1008', '1013'], ['1009', '1105', '1001']);
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

test('credit income and defensive planning respect their independently disabled resources', () => {
  const choices = ['faith_bond', 'preservation_wax', 'dimension_dice'];
  const combat = newGame();
  combat.phase = 'item';
  combat.choices = choices;
  const noCredits = { ...combat, resourceAccess: { ...combat.resourceAccess, credits: false } };
  const noDefense = { ...combat, resourceAccess: { ...combat.resourceAccess, defense: false } };
  const noCreditsAdvice = recommendRewards(noCredits, { lookahead: false }).choices;
  const noDefenseAdvice = recommendRewards(noDefense, { lookahead: false }).choices;
  const combatAdvice = recommendRewards(combat, { lookahead: false }).choices;
  assert.equal(noCreditsAdvice[0].score, 0);
  assert.ok(combatAdvice[0].score > 0);
  assert.ok(noDefenseAdvice[1].score < combatAdvice[1].score);
  assert.match(combatAdvice[0].reason, /补给|重掷/);
  assert.match(noCreditsAdvice[0].reason, /无法支出/);
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
  assert.equal(recommendRemoval(state), null, 'do not spend a token when both rosters already clear the current encounter');
  state.enemies.forEach(enemy => { enemy.hp = 3500; enemy.maxHp = 3500; });
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
