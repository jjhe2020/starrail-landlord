import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { recommendAction } from '../src/ai.js';
import { buildPlayerPolicies, getPlayerPolicy, playerPolicyManifest, FEATURE_BUDGET, publicPlayerState, createPlayerRandom, samplePlayerRecommendation, rewardProbabilities, recommendPlayerAction, clearPlayerPolicyCache, playerPolicyCacheStats, applyPlayerRecommendation } from '../src/player-policy.js';
import { createPlayerPolicyFixtures, validatePlayerPolicyBehavior } from '../src/player-policy-fixtures.js';

const id = (H = 'balanced', J = 'mixed', R = 'balanced', T = 'baseline') => `matrix:${T}|H:${H}|J:${J}|R:${R}`;
const fixtures = createPlayerPolicyFixtures();
const rewardFixture = () => structuredClone(fixtures.find(f => f.id === 'early:safe:growth').state);
const blocked = { blockedKinds: ['reroll', 'remove', 'supply'] };

test('matrix dictionary serializes exactly 783 distinct combinations and four genuine controls', () => {
  const ps = buildPlayerPolicies(), manifest = JSON.parse(JSON.stringify(playerPolicyManifest()));
  assert.equal(ps.length, 787); assert.equal(new Set(ps.map(p => p.id)).size, 787);
  assert.equal(buildPlayerPolicies({ includeControls: false }).length, 783);
  assert.equal(manifest.teams.length, 29); assert.equal(manifest.policies.length, 787);
  assert.deepEqual(manifest.teams.filter(t => t.id.startsWith('mixed:')).map(t => t.mode), ['any', 'any', 'any', 'any']);
  assert.equal(ps.filter(p => p.control === 'uniform-reward').length, 3);
  assert.ok(ps.filter(p => p.control === 'uniform-reward').every(p => p.T.id === 'baseline' && p.H.id === 'balanced' && p.J.epsilon === 1));
  assert.ok(ps.every(p => JSON.stringify(p.budget) === JSON.stringify(FEATURE_BUDGET)));
  assert.throws(() => getPlayerPolicy('missing'));
});

test('xorshift behavior stream resumes exactly, with explicit count and boundary validation', () => {
  const a = createPlayerRandom('resume'); for (let i = 0; i < 7; i++) a();
  const saved = a.snapshot(), b = createPlayerRandom(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(Array.from({ length: 20 }, () => a()), Array.from({ length: 20 }, () => b()));
  assert.equal(b.snapshot().count, 27); assert.equal(saved.count, 7);
  assert.throws(() => createPlayerRandom({ algorithm: 'xorshift32-v1', state: 0, count: 1 }));
  const choices = [{ probability: .25, id: 'a' }, { probability: .75, id: 'b' }];
  assert.equal(samplePlayerRecommendation({ choices }, 0).id, 'a');
  assert.equal(samplePlayerRecommendation({ choices }, .25).id, 'b');
  assert.throws(() => samplePlayerRecommendation({ choices }, 1));
  assert.throws(() => samplePlayerRecommendation({ choices: [{ probability: 2 }] }, .5));
});

test('epsilon mixture handles exact ties, legal skip, and measured draw frequencies', () => {
  assert.deepEqual(rewardProbabilities([1, 1, 0, 0], 0), [.5, .5, 0, 0]);
  assert.deepEqual(rewardProbabilities([1, 2, 3, 4], 1), [.25, .25, .25, .25]);
  const expected = rewardProbabilities([0, 1, 2, 3], .45), choices = expected.map((probability, index) => ({ probability, index }));
  const random = createPlayerRandom('distribution'), counts = [0, 0, 0, 0];
  for (let i = 0; i < 40000; i++) counts[samplePlayerRecommendation({ choices }, random()).index]++;
  assert.ok(counts.every((count, i) => Math.abs(count / 40000 - expected[i]) < .012));
});

test('research planner cannot read real seeds, hidden RNG getters, or mutate its input', () => {
  const input = rewardFixture(), before = structuredClone(input);
  Object.defineProperty(input, 'seed', { enumerable: true, get() { throw new Error('seed leaked'); } });
  Object.defineProperty(input, 'rngState', { enumerable: true, get() { throw new Error('rng leaked'); } });
  const view = publicPlayerState(input); assert.equal(view.seed, 'public-counterfactual');
  const a = recommendPlayerAction(input, getPlayerPolicy(id()), blocked);
  const other = { ...before, seed: 'different-world', rngState: 123456 };
  const b = recommendPlayerAction(other, getPlayerPolicy(id()), blocked);
  assert.deepEqual(a, b);
  const clean = rewardFixture(), snapshot = structuredClone(clean);
  recommendPlayerAction(clean, getPlayerPolicy(id())); assert.deepEqual(clean, snapshot);
});

test('N/F/C feature budgets and components stay independent of horizon and reward randomness', () => {
  clearPlayerPolicyCache();
  const s = rewardFixture(), a = recommendPlayerAction(s, getPlayerPolicy(id('short', 'deterministic')), blocked);
  const afterFirst = playerPolicyCacheStats();
  const b = recommendPlayerAction(s, getPlayerPolicy(id('greedy', 'random')), blocked);
  assert.equal(playerPolicyCacheStats().spins, afterFirst.spins);
  assert.deepEqual(a.diagnostics.budget, { boards: 4, rerollOffers: 3 });
  assert.equal(a.choices.length, 4); assert.equal(a.choices.at(-1).action, 'skip');
  assert.deepEqual(a.choices.map(c => [c.N, c.F, c.C]), b.choices.map(c => [c.N, c.F, c.C]));
  assert.ok(a.choices.every(c => Math.abs(c.U - (c.N + .35 * c.F + c.T - c.C)) < 1e-7));
});

test('all resources remain legal and lambdaR changes only the price term on matched opportunities', () => {
  const s = structuredClone(fixtures.find(f => f.id === 'early:safe:abundant').state), before = structuredClone(s.resourceAccess);
  const a = recommendPlayerAction(s, getPlayerPolicy(id('balanced', 'mixed', 'active'))), b = recommendPlayerAction(s, getPlayerPolicy(id('balanced', 'mixed', 'reserve')));
  assert.deepEqual(s.resourceAccess, before);
  assert.deepEqual(a.audit.legalOpportunities.map(o => o.key), b.audit.legalOpportunities.map(o => o.key));
  for (const row of a.audit.legalOpportunities) {
    const reserve = b.audit.legalOpportunities.find(r => r.key === row.key);
    assert.equal(row.N, reserve.N); assert.equal(row.F, reserve.F); assert.equal(row.C, reserve.C);
    assert.ok(row.U >= reserve.U - 1e-8);
  }
  const stopped = recommendPlayerAction(s, getPlayerPolicy(id()), blocked);
  assert.equal(stopped.type, 'spin'); assert.deepEqual(stopped.audit.legalOpportunities, recommendPlayerAction(s, getPlayerPolicy(id())).audit.legalOpportunities);
});

test('the floor-12 last-spin estimate gives no imaginary future growth or terminal cash reward', () => {
  const s = rewardFixture(); s.floor = 12; s.round = 6; s.spinsLeft = 1; s.encounter.deadline = 7;
  const rec = recommendPlayerAction(s, getPlayerPolicy(id('greedy')), blocked);
  assert.ok(rec.choices.every(c => c.F === 0 && c.breakdown.future.turns === 0));
});

test('current-AI control calls the unchanged original planner instead of the new balanced scoring', () => {
  const s = rewardFixture(), expected = recommendAction(s), actual = recommendPlayerAction(s, getPlayerPolicy('control:current-ai'));
  for (const key of ['type', 'uid', 'kind', 'reason']) assert.deepEqual(actual[key], expected[key]);
  if (expected.type === 'reward') assert.deepEqual(actual.choices, expected.recommendation.choices);
  assert.equal(actual.diagnostics.decompositionUnavailable, true);
});

test('96-state bank is legal and produces real horizon and resource behavior contrasts', () => {
  assert.equal(fixtures.length, 96); assert.ok(fixtures.every(f => validateSave(f.state)));
  const result = validatePlayerPolicyBehavior({ fixtures, includeAllPolicies: false });
  assert.equal(result.passed, true, JSON.stringify(result.failures));
  assert.ok(result.stats.horizonContrasts > 0 && result.stats.resourceContrasts > 0);
  assert.equal(result.stats.anchorComparisons, 96);
  assert.equal(result.stats.tagProbes, 28);
  assert.equal(result.stats.tagProbabilityContrasts, 28);
  for (const contrast of result.contrasts.filter(c => c.contrast === 'short-greedy')) {
    assert.ok(contrast.greedyComponents.F >= contrast.shortComponents.F);
    assert.ok(contrast.greedyComponents.N <= contrast.shortComponents.N);
  }
});


test('public-state key ordering and unrecognized hidden fields cannot alter decisions', () => {
  const state = rewardFixture();
  const reverse = value => Array.isArray(value) ? value.map(reverse) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).reverse().map(key => [key, reverse(value[key])])) : value;
  const reordered = reverse(state);
  Object.defineProperty(reordered, 'unrevealedNextOffers', { enumerable: true, get() { throw new Error('hidden offer leaked'); } });
  assert.deepEqual(recommendPlayerAction(state, getPlayerPolicy(id()), blocked), recommendPlayerAction(reordered, getPlayerPolicy(id()), blocked));
  const policy = structuredClone(getPlayerPolicy(id())); policy.budget.boards = 1;
  assert.throws(() => recommendPlayerAction(state, policy));
  assert.throws(() => rewardProbabilities([NaN, 0], .15));
});

test('feature cache is bounded across arbitrarily many distinct public states', () => {
  clearPlayerPolicyCache(); const state = newGame({ seed: 'cache-bound' });
  state.roster = []; state.board = Array(20).fill(null); state.rerolls = 0; state.removals = 0; state.coins = 0;
  for (let i = 0; i < 270; i++) recommendPlayerAction({ ...state, hp: 20 + i / 10 }, getPlayerPolicy(id()));
  assert.equal(playerPolicyCacheStats().entries, playerPolicyCacheStats().maxEntries);
});

test('different visible previous boards keep distinct cached features and match cold recommendations', () => {
  const a = rewardFixture(), b = structuredClone(a);
  [b.board[0], b.board[19]] = [b.board[19], b.board[0]];
  assert.ok(validateSave(a)); assert.ok(validateSave(b));
  assert.notDeepEqual(a.board, b.board);
  clearPlayerPolicyCache();
  const warmA = recommendPlayerAction(a, getPlayerPolicy(id()), blocked);
  const afterA = playerPolicyCacheStats();
  const warmB = recommendPlayerAction(b, getPlayerPolicy(id()), blocked);
  assert.equal(playerPolicyCacheStats().entries, afterA.entries + 1);
  assert.ok(playerPolicyCacheStats().spins > afterA.spins);
  clearPlayerPolicyCache();
  const coldB = recommendPlayerAction(b, getPlayerPolicy(id()), blocked);
  clearPlayerPolicyCache();
  const coldA = recommendPlayerAction(a, getPlayerPolicy(id()), blocked);
  assert.deepEqual(warmA, coldA); assert.deepEqual(warmB, coldB);
});
