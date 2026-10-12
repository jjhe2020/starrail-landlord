import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin } from '../src/engine.js';
import { recommendRewards } from '../src/ai.js';
import { DEFAULT_PROFILE } from '../src/ai-profile.js';
import { DIFFICULTY } from '../src/difficulty.js';
import { runCampaign, summarizeCampaigns, wilsonInterval, benchmarkPolicies, trainProfile } from '../src/simulation.js';

test('campaign sampling exactly uses the displayed probabilities without mutating input', () => {
  const state = spin(newGame({ seed: 'simulation-exact' }));
  const original = structuredClone(state);
  const recommendation = recommendRewards(state, { profile: DEFAULT_PROFILE, lookahead: false });
  const run = runCampaign({ initialState: state, seed: state.seed, maxActions: 1, trace: true, lookahead: false });
  assert.deepEqual(state, original);
  assert.equal(run.choices.length, 1);
  assert.deepEqual(run.choices[0].probabilities, recommendation.choices.map(choice => choice.probability));
  const selected = run.choices[0];
  const lower = selected.probabilities.slice(0, selected.index).reduce((sum, value) => sum + value, 0);
  const upper = lower + selected.probabilities[selected.index];
  assert.ok(selected.draw >= lower && selected.draw < upper);
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
  assert.deepEqual(report.rules, DIFFICULTY, 'saved evidence identifies the actual difficulty rules');
  assert.notEqual(report.rules, DIFFICULTY);
  assert.equal(progress.length, 8);
  assert.equal(progress.at(-1).completed, 8);
  for (const mode of report.modes) {
    assert.equal(mode.ai.runs, 2);
    assert.equal(mode.uniform.runs, 2);
    assert.equal(mode.difference.pairedSeeds, 2);
    assert.equal(mode.ai.incomplete + mode.uniform.incomplete, 0);
  }
});

test('training validates candidate on a separate split and only returns an accepted improvement', async () => {
  const profileSnapshot = structuredClone(DEFAULT_PROFILE);
  const stages = new Set();
  const report = await trainProfile({ mode: 'combat', runs: 1, generations: 1, candidates: 1, holdoutRuns: 1, lookahead: false, onProgress: progress => stages.add(progress.stage) });
  assert.deepEqual(DEFAULT_PROFILE, profileSnapshot);
  assert.deepEqual(report.rules, DIFFICULTY);
  assert.deepEqual([...stages].sort(), ['holdout', 'train', 'validation']);
  assert.equal(report.holdout.separateFromTraining, true);
  if (report.accepted) {
    assert.ok(report.trained.objective > report.baseline.objective);
    assert.ok(report.trained.summary.winRate >= report.baseline.summary.winRate);
  } else assert.deepEqual(report.profile, DEFAULT_PROFILE);
});
