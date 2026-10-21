import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { recommendRewards, recommendAction, createPolicyRandom, POLICY_VERSION } from '../src/ai.js';
import { DEFAULT_PROFILE } from '../src/ai-profile.js';
import { DIFFICULTY } from '../src/difficulty.js';
import { runCampaign, summarizeCampaigns, calculateDefenseUsage, assessResourceVariant, validateResourceCalibration, wilsonInterval, benchmarkPolicies, benchmarkResources, buildResourceScenarios, trainProfile, ACTION_POLICIES } from '../src/simulation.js';

function earnedRewardState(phase) {
  let state = newGame({ seed: `skip-fixture-${phase}` });
  let actions = 0;
  while (state.phase !== phase && actions++ < 40) {
    if (state.phase === 'ready') {
      // Advance real reward queues quickly without changing the skip rules.
      state = spin({ ...state, enemies: state.enemies.map(enemy => ({ ...enemy, hp: 1 })) });
    } else state = skipReward(state);
  }
  assert.equal(state.phase, phase);
  assert.notEqual(validateSave(state), null);
  return state;
}

const neutralProfile = () => ({ ...DEFAULT_PROFILE, weights: Object.fromEntries(Object.keys(DEFAULT_PROFILE.weights).map(key => [key, 0])), lookaheadSamples: 0 });

function policySeedForSkip(recommendation) {
  const skipIndex = recommendation.choices.findIndex(choice => choice.action === 'skip');
  const lower = recommendation.choices.slice(0, skipIndex).reduce((sum, choice) => sum + choice.probability, 0);
  for (let index = 0; index < 1000; index++) {
    const seed = `select-skip-${index}`;
    const draw = createPolicyRandom(seed)();
    if (draw >= lower) return seed;
  }
  assert.fail('A neutral four-action policy must give skip a reachable interval');
}

test('campaign sampling exactly uses the displayed probabilities without mutating input', () => {
  const state = spin(newGame({ seed: 'simulation-exact' }));
  state.resourceAccess = { rerolls: false, removals: false, credits: false, defense: true };
  const original = structuredClone(state);
  const recommendation = recommendRewards(state, { profile: DEFAULT_PROFILE, lookahead: false });
  assert.equal(recommendAction(state, { lookahead: false }).type, 'reward');
  const run = runCampaign({ initialState: state, seed: state.seed, maxActions: 1, trace: true, lookahead: false });
  assert.deepEqual(state, original);
  assert.equal(run.choices.length, 1);
  assert.deepEqual(run.choices[0].options, recommendation.choices.map(choice => choice.id));
  assert.deepEqual(run.choices[0].optionActions, recommendation.choices.map(choice => choice.action));
  assert.equal(run.choices[0].options.length, state.choices.length + 1);
  assert.deepEqual(run.choices[0].probabilities, recommendation.choices.map(choice => choice.probability));
  const selected = run.choices[0];
  const lower = selected.probabilities.slice(0, selected.index).reduce((sum, value) => sum + value, 0);
  const upper = lower + selected.probabilities[selected.index];
  assert.ok(selected.draw >= lower && selected.draw < upper);
});

test('AI skip is a real action in recruit, item and essence and is audited without taking the reward', () => {
  for (const phase of ['recruit', 'item', 'essence']) {
    const state = earnedRewardState(phase);
    const snapshot = structuredClone(state);
    const profile = neutralProfile();
    const recommendation = recommendRewards(state, { profile, lookahead: false });
    const run = runCampaign({ initialState: state, profile, policySeed: policySeedForSkip(recommendation), maxActions: 1, lookahead: false, trace: true });
    const expected = skipReward(state);
    assert.deepEqual(state, snapshot);
    assert.equal(run.phase, expected.phase);
    assert.equal(run.floor, expected.floor);
    assert.equal(run.rosterSize, expected.roster.length);
    assert.equal(run.itemCount, expected.items.length);
    assert.equal(run.essenceCount, expected.essences.length);
    assert.equal(run.stopped, 'action-limit');
    assert.equal(run.skipped, 1);
    assert.equal(run.skips[phase], 1);
    assert.equal(run.picks[phase].skip, 1);
    assert.deepEqual(run.choices[0].offeredRewards, state.choices);
    assert.equal(run.choices[0].index, state.choices.length);
    assert.equal(run.choices[0].id, 'skip');
    assert.equal(run.choices[0].action, 'skip');
    assert.equal(run.choices[0].probabilities.length, run.choices[0].options.length);
    const summary = summarizeCampaigns([run, run]);
    assert.equal(summary.avgSkips, 1);
    assert.equal(summary.skipsByPhase[phase], 2);
    assert.equal(summary.picks[phase].skip, 2);
  }
});

test('uniform baseline retains three offered choices and never samples skip', () => {
  for (const phase of ['recruit', 'item', 'essence']) {
    const state = earnedRewardState(phase);
    for (let index = 0; index < 10; index++) {
      const run = runCampaign({ initialState: state, policy: 'uniform', policySeed: `baseline-${index}`, maxActions: 1, trace: true });
      assert.deepEqual(run.choices[0].options, state.choices);
      assert.deepEqual(run.choices[0].optionActions, state.choices.map(() => 'choose'));
      assert.ok(run.choices[0].index < state.choices.length);
      assert.equal(run.choices[0].action, 'choose');
      assert.equal(run.skipped, 0);
      assert.equal(run.picks[phase].skip, undefined);
      assert.equal(run.actionPolicy, 'uniform-choose-only');
    }
  }
});

test('both policies complete combat deterministically with a finite action bound', () => {
  for (const policy of ['ai', 'uniform']) {
    const options = { difficulty: 8, resourceAccess: { removals: false }, seed: 'simulation-terminal', policy, lookahead: false };
    const first = runCampaign(options);
    assert.deepEqual(first, runCampaign(options));
    assert.ok(['victory', 'defeat'].includes(first.phase));
    assert.equal(first.stopped, null);
    assert.ok(first.actions < 1000);
    assert.equal(first.difficulty, 8);
    assert.equal(first.resourceAccess.removals, false);
    assert.equal(first.usage.removalsUsed, 0);
  }
  const limited = runCampaign({ maxActions: 1, policy: 'uniform' });
  assert.equal(limited.stopped, 'action-limit');
  assert.equal(limited.actions, 1);
  for (const mode of ['classic', 'both']) assert.throws(() => runCampaign({ mode }), /Only combat/);
  assert.throws(() => runCampaign({ initialState: { mode: 'classic' } }), /Legacy classic/);
});

test('Wilson intervals and aggregate bookkeeping handle zero and perfect wins', () => {
  assert.deepEqual(wilsonInterval(0, 0), [0, 1]);
  const zero = wilsonInterval(0, 100);
  const all = wilsonInterval(100, 100);
  assert.ok(zero[0] < 1e-15 && zero[1] > 0 && zero[1] < 0.05);
  assert.ok(all[0] > 0.95 && all[1] <= 1);
  const run = runCampaign({ policy: 'uniform', seed: 'summary' });
  const summary = summarizeCampaigns([run, run]);
  assert.equal(summary.runs, 2);
  assert.equal(summary.avgTurns, run.turns);
  assert.equal(summary.avgMerges, run.merges);
  assert.equal(summary.failureByFloor.reduce((sum, row) => sum + row.count, 0), run.won ? 0 : 2);
  for (const [id, count] of Object.entries(run.picks.recruit)) assert.equal(summary.picks.recruit[id], count * 2);
});

test('paired benchmark emits actual combat settings, shared resource policy and progress', async () => {
  const progress = [];
  const report = await benchmarkPolicies({ difficulty: 8, resourceAccess: { credits: false }, runs: 2, lookahead: false, onProgress: value => progress.push(value) });
  assert.equal(report.modes.length, 1);
  assert.equal(report.version, 3);
  assert.equal(report.difficulty, 8);
  assert.equal(report.resourceAccess.credits, false);
  assert.equal(report.policyVersion, POLICY_VERSION);
  assert.deepEqual(report.actionPolicies, ACTION_POLICIES);
  assert.deepEqual(report.actionPolicies.ai.rewardActions, ['choose', 'skip']);
  assert.deepEqual(report.actionPolicies.uniform.rewardActions, ['choose']);
  assert.deepEqual(report.rules, DIFFICULTY, 'saved evidence identifies the actual difficulty rules');
  assert.notEqual(report.rules, DIFFICULTY);
  assert.equal(progress.length, 4);
  assert.equal(progress.at(-1).completed, 4);
  for (const mode of report.modes) {
    assert.equal(mode.ai.runs, 2);
    assert.equal(mode.uniform.runs, 2);
    assert.equal(mode.difference.pairedSeeds, 2);
    assert.equal(mode.ai.incomplete + mode.uniform.incomplete, 0);
    assert.equal(mode.uniform.avgSkips, 0);
    assert.equal(mode.ai.avgUsage.creditsSpent, 0);
    assert.equal(mode.ai.resourceUsageRates.credits, 0);
    assert.ok(Number.isFinite(mode.ai.defenseUsage.combinedRate));
  }
});

test('training validates candidate on a separate split and only returns an accepted improvement', async () => {
  const profileSnapshot = structuredClone(DEFAULT_PROFILE);
  const stages = new Set();
  const report = await trainProfile({ mode: 'combat', runs: 1, generations: 1, candidates: 1, holdoutRuns: 1, lookahead: false, onProgress: progress => stages.add(progress.stage) });
  assert.deepEqual(DEFAULT_PROFILE, profileSnapshot);
  assert.deepEqual(report.rules, DIFFICULTY);
  assert.equal(report.policyVersion, POLICY_VERSION);
  assert.equal(report.mode, 'combat');
  assert.equal(report.version, 3);
  assert.deepEqual(report.actionPolicies, ACTION_POLICIES);
  assert.deepEqual([...stages].sort(), ['holdout', 'train', 'validation']);
  assert.equal(report.holdout.separateFromTraining, true);
  if (report.accepted) {
    assert.ok(report.trained.objective > report.baseline.objective);
    assert.ok(report.trained.summary.winRate >= report.baseline.summary.winRate);
  } else assert.deepEqual(report.profile, DEFAULT_PROFILE);
});

test('headless campaigns dispatch the same shared reroll and supply decisions used by live autoplay', () => {
  for (const phase of ['recruit', 'ready']) {
    const state = newGame({ seed: 'resource-fixture' });
    state.resourceAccess.removals = false;
    state.floor = 5;
    state.coins = 80;
    state.phase = phase;
    if (phase === 'recruit') state.choices = ['1208', '1005', '1303'];
    else {
      state.hp = 15;
      state.roster = [{ uid: 'u1', id: '1002', stars: 1, growth: 0, ticks: 0 }];
      state.enemies = state.enemies.map(enemy => ({ ...enemy, hp: 400, maxHp: 400, attack: 10 }));
    }
    const planned = recommendAction(state, { lookahead: false });
    assert.equal(planned.type, phase === 'recruit' ? 'reroll' : 'supply');
    const result = runCampaign({ initialState: state, maxActions: 1, lookahead: false, trace: true });
    assert.equal(result.actionTrace[0].type, planned.type);
    assert.equal(result.actionTrace[0].kind, planned.kind);
    assert.equal(result.actionTrace[0].coinsSpent, planned.cost);
    assert.equal(result.stopped, 'action-limit');
    assert.equal(result.usage.rerollsUsed, phase === 'recruit' ? 1 : 0);
    assert.equal(result.usage.supplyKinds.repair, phase === 'ready' ? 1 : 0);
  }
});

test('defense efficiency uses actual aggregate consumed over generated amounts, including shield waste', () => {
  const run = runCampaign({ policy: 'uniform', seed: 'usage-summary' });
  const firstStats = { initialHp: 100, initialShield: 0, healed: 0, hpLost: 50, shieldGained: 50, shieldBlocked: 10, shieldDecayed: 20 };
  const secondStats = { initialHp: 100, initialShield: 0, healed: 100, hpLost: 100, shieldGained: 0, shieldBlocked: 0, shieldDecayed: 0 };
  const first = { ...run, resourceStats: firstStats, usage: firstStats };
  const second = { ...run, resourceStats: secondStats, usage: secondStats };
  const summary = summarizeCampaigns([first, second]);
  assert.equal(summary.defenseUsage.hpGenerated, 300);
  assert.equal(summary.defenseUsage.hpConsumptionRate, 0.5);
  assert.equal(summary.defenseUsage.shieldConsumptionRate, 0.2);
  assert.equal(summary.defenseUsage.combinedRate, 160 / 350);
  assert.equal(summary.defenseUsage.shieldWasted, 20);
  assert.equal(summary.defenseUsage.effectiveRate, 0.5);
  assert.equal(summary.resourceUsageRates.defense, 0.5);
  assert.equal(summary.defenseUsage.method, 'aggregate-consumed-over-generated');
  assert.equal(summary.defenseUsage.observational, true);
  assert.equal(summary.defenseUsage.strata.moderate.n, 1);
  assert.equal(summary.defenseUsage.strata.effective.n, 1);
  assert.equal(summary.defenseUsage.strata.low.n, 0);
  assert.equal(summary.defenseUsage.strata.moderate.shieldWasted, 20);
  assert.equal(summary.defenseUsage.strata.effective.hpGenerated, 200);
  assert.equal(summary.defenseUsage.strata.effective.wins, Number(second.won));
  assert.equal(summary.defenseUsage.strata.effective.jointActiveFour.n, 0);
  assert.equal(calculateDefenseUsage().combinedRate, 0);
  assert.ok(Number.isFinite(summarizeCampaigns([]).defenseUsage.combinedRate));
});

test('actual natural defense prevents a disabled planning switch from passing a resource mapping or causal ablation', () => {
  const summary = {
    runs: 100, wins: 95, winRate: 0.95, incomplete: 0,
    avgUsage: { rerollsUsed: 4, removalsUsed: 1, creditsSpent: 16 },
    defenseUsage: { combinedRate: 0.6, hpConsumptionRate: 0.7, shieldConsumptionRate: 0.5 },
  };
  const full = { id: 'full', difficulty: 10, disabledResources: [], resourceAccess: { rerolls: true, removals: true, credits: true, defense: true }, summary };
  const disabled = { id: 'no-defense-D8', difficulty: 8, disabledResources: ['defense'], resourceAccess: { ...full.resourceAccess, defense: false }, summary };
  const snapshot = structuredClone([full, disabled]);
  const assessment = assessResourceVariant(disabled, { full });
  assert.equal(assessment.actualDefensiveUse.effective, true);
  assert.equal(assessment.actualMissingResourceCount, 0);
  assert.equal(assessment.nominalDifficulty, 10);
  assert.equal(assessment.nominalMappingEligible, false);
  assert.equal(assessment.passed, false);
  const control = assessResourceVariant({ ...disabled, difficulty: 10 }, { full });
  assert.equal(control.verifiable, false);
  assert.equal(control.passed, false);
  assert.match(control.reasons.join(';'), /自然生命与护盾/);
  const low = assessResourceVariant({ ...disabled, summary: { ...summary, defenseUsage: { ...summary.defenseUsage, combinedRate: 0.1 } } }, { full });
  assert.equal(low.actualDefensiveUse.lowUse, true);
  assert.equal(low.actualMissingResourceCount, 1);
  assert.equal(low.nominalMappingEligible, true);
  assert.equal(low.nominalDifficulty, 8);
  assert.equal(low.passed, true);
  assert.deepEqual([full, disabled], snapshot);
  const report = validateResourceCalibration([full, disabled]);
  assert.equal(report.passed, false);
  assert.equal(report.variants[0].passed, true);
  assert.equal(report.variants[1].passed, false);
});

test('actual resource assessment rejects consumption through a disabled action gate and inactive full resources', () => {
  const summary = { winRate: 0.95, incomplete: 0, avgUsage: { rerollsUsed: 3, removalsUsed: 0, creditsSpent: 16 }, defenseUsage: { combinedRate: 0.7 } };
  const full = { difficulty: 10, disabledResources: [], resourceAccess: { rerolls: true, removals: true, credits: true, defense: true }, summary };
  const result = assessResourceVariant(full, { full });
  assert.equal(result.fullResourcesUsed, false);
  assert.equal(result.passed, false);
  assert.deepEqual(result.actualMissingResources, ['removals']);
  const noCredits = { difficulty: 8, disabledResources: ['credits'], resourceAccess: { ...full.resourceAccess, credits: false }, summary };
  assert.equal(assessResourceVariant(noCredits, { full }).resourceGatesValid, false);
});

test('resource matrix reports all nominal combinations and paired control differences without claiming target success', async () => {
  const variants = buildResourceScenarios();
  assert.equal(variants.length, 20);
  assert.equal(new Set(variants.map(variant => variant.id)).size, 20);
  assert.equal(variants.filter(variant => variant.difficulty === 10 && variant.disabledResources.length === 1).length, 4);
  for (const variant of buildResourceScenarios({ includeControls: false })) assert.equal(variant.difficulty, 10 - 2 * variant.disabledResources.length);
  const scenarios = [variants[0], variants.find(variant => variant.id === 'no-credits-D10')];
  const report = await benchmarkResources({ runs: 1, scenarios, maxActions: 1, lookahead: false });
  assert.equal(report.kind, 'resource-calibration');
  assert.equal(report.variants.length, 2);
  assert.equal(report.variants[1].difference.pairedSeeds, 1);
  assert.equal(report.variants[1].summary.avgUsage.creditsSpent, 0);
  assert.equal(report.validation.nominal[0].passed, false);
  assert.equal(report.validation.singleD10[0].passed, false);
  assert.equal(report.variants[0].summary.incomplete, 1);
});
