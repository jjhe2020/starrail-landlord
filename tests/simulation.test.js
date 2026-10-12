import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { recommendRewards, createPolicyRandom, POLICY_VERSION } from '../src/ai.js';
import { DEFAULT_PROFILE } from '../src/ai-profile.js';
import { DIFFICULTY } from '../src/difficulty.js';
import { runCampaign, summarizeCampaigns, wilsonInterval, benchmarkPolicies, trainProfile, ACTION_POLICIES } from '../src/simulation.js';

function earnedRewardState(phase) {
  let state = newGame({ mode: 'classic', seed: `skip-fixture-${phase}` });
  let actions = 0;
  while (state.phase !== phase && actions++ < 40) {
    if (state.phase === 'ready') {
      // Advance real reward queues quickly without changing the skip rules.
      state = spin({ ...state, coins: 1e6, spinsLeft: 1 });
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
  const original = structuredClone(state);
  const recommendation = recommendRewards(state, { profile: DEFAULT_PROFILE, lookahead: false });
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

test('both policies complete deterministically in each mode with a finite action bound', () => {
  for (const mode of ['combat', 'classic']) for (const policy of ['ai', 'uniform']) {
    const options = { mode, seed: 'simulation-terminal', policy, lookahead: false };
    const first = runCampaign(options);
    assert.deepEqual(first, runCampaign(options));
    assert.ok(['victory', 'defeat'].includes(first.phase));
    assert.equal(first.stopped, null);
    assert.ok(first.actions < 1000);
  }
  const limited = runCampaign({ maxActions: 1, policy: 'uniform' });
  assert.equal(limited.stopped, 'action-limit');
  assert.equal(limited.actions, 1);
});

test('Wilson intervals and aggregate bookkeeping handle zero and perfect wins', () => {
  assert.deepEqual(wilsonInterval(0, 0), [0, 1]);
  const zero = wilsonInterval(0, 100);
  const all = wilsonInterval(100, 100);
  assert.ok(zero[0] < 1e-15 && zero[1] > 0 && zero[1] < 0.05);
  assert.ok(all[0] > 0.95 && all[1] <= 1);
  const run = runCampaign({ mode: 'classic', policy: 'uniform', seed: 'summary' });
  const summary = summarizeCampaigns([run, run]);
  assert.equal(summary.runs, 2);
  assert.equal(summary.avgTurns, run.turns);
  assert.equal(summary.avgMerges, run.merges);
  assert.equal(summary.failureByFloor.reduce((sum, row) => sum + row.count, 0), run.won ? 0 : 2);
  for (const [id, count] of Object.entries(run.picks.recruit)) assert.equal(summary.picks.recruit[id], count * 2);
});

test('paired benchmark emits progress and keeps both modes and policies', async () => {
  const progress = [];
  const report = await benchmarkPolicies({ mode: 'both', runs: 2, lookahead: false, onProgress: value => progress.push(value) });
  assert.equal(report.modes.length, 2);
  assert.equal(report.version, 2);
  assert.equal(report.policyVersion, POLICY_VERSION);
  assert.deepEqual(report.actionPolicies, ACTION_POLICIES);
  assert.deepEqual(report.actionPolicies.ai.rewardActions, ['choose', 'skip']);
  assert.deepEqual(report.actionPolicies.uniform.rewardActions, ['choose']);
  assert.deepEqual(report.rules, DIFFICULTY, 'saved evidence identifies the actual difficulty rules');
  assert.notEqual(report.rules, DIFFICULTY);
  assert.equal(progress.length, 8);
  assert.equal(progress.at(-1).completed, 8);
  for (const mode of report.modes) {
    assert.equal(mode.ai.runs, 2);
    assert.equal(mode.uniform.runs, 2);
    assert.equal(mode.difference.pairedSeeds, 2);
    assert.equal(mode.ai.incomplete + mode.uniform.incomplete, 0);
    assert.equal(mode.uniform.avgSkips, 0);
  }
});

test('training validates candidate on a separate split and only returns an accepted improvement', async () => {
  const profileSnapshot = structuredClone(DEFAULT_PROFILE);
  const stages = new Set();
  const report = await trainProfile({ mode: 'combat', runs: 1, generations: 1, candidates: 1, holdoutRuns: 1, lookahead: false, onProgress: progress => stages.add(progress.stage) });
  assert.deepEqual(DEFAULT_PROFILE, profileSnapshot);
  assert.deepEqual(report.rules, DIFFICULTY);
  assert.equal(report.policyVersion, POLICY_VERSION);
  assert.deepEqual(report.actionPolicies, ACTION_POLICIES);
  assert.deepEqual([...stages].sort(), ['holdout', 'train', 'validation']);
  assert.equal(report.holdout.separateFromTraining, true);
  if (report.accepted) {
    assert.ok(report.trained.objective > report.baseline.objective);
    assert.ok(report.trained.summary.winRate >= report.baseline.summary.winRate);
  } else assert.deepEqual(report.profile, DEFAULT_PROFILE);
});
