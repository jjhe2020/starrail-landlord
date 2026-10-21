import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { ARCHETYPES, getArchetypes } from '../src/archetypes.js';
import { probeArchetypePower, updateArchetypePlan, biasArchetypeRecommendations, shouldKeepArchetypeOffer, archetypeSurvivalMode, runArchetypeCampaign, summarizeArchetypeBenchmark, meanInterval, compactArchetypeCampaign, expandArchetypeCampaign } from '../src/archetype-simulation.js';

function formedState(id = ARCHETYPES[0].id) {
  const state = newGame({ seed: 'archetype-probe' }), definition = ARCHETYPES.find(entry => entry.id === id);
  const attackId = definition.memberIds.find(id => characterById(id).role === 'attack');
  const ids = [...new Set([...definition.coreIds.slice(0, definition.coreRequired), attackId, ...definition.memberIds])].slice(0, definition.threshold);
  state.roster = ids.map((characterId, index) => ({ id: characterId, uid: `fixture-${index}`, stars: 1, growth: 0, ticks: 0 }));
  return state;
}

test('canonical power probes use real effects, do not mutate the campaign, and isolate an identical-state intervention', () => {
  const state = formedState(), original = structuredClone(state);
  assert.equal(getArchetypes(state)[0].formed, true);
  const first = probeArchetypePower(state, { samples: 2 });
  assert.deepEqual(first, probeArchetypePower(state, { samples: 2 }));
  assert.deepEqual(state, original);
  assert.ok(first.damage > first.withoutArchetypes.damage);
  assert.ok(first.powerEffectRatio > 1);
  assert.ok(first.power >= first.damage);
});

test('adaptive planner retains at most two formed lines and records abandoned candidates without mutating memory', () => {
  const state = newGame({ seed: 'archetype-adaptive' });
  const ids = [...new Set(ARCHETYPES.flatMap(definition => definition.memberIds))];
  state.roster = ids.map((id, index) => ({ id, uid: `fixture-${index}`, stars: 1, growth: 0, ticks: 0 }));
  state.stats.spins = 20;
  const previous = { selected: ARCHETYPES.slice(0, 3).map(definition => definition.id), abandoned: [], changes: [], initialized: true };
  const original = structuredClone(previous), next = updateArchetypePlan(state, { kind: 'adaptive', slots: 3 }, previous);
  assert.deepEqual(previous, original);
  assert.equal(next.selected.length, 2);
  assert.equal(next.abandoned.length, 1);
  assert.ok(next.selected.every(id => getArchetypes(state).find(status => status.id === id).formed));
});

test('planning preferences normalize real reward action probabilities and keep skip available', () => {
  const state = newGame(), id = ARCHETYPES[0].coreIds[0];
  state.phase = 'recruit'; state.choices = [id, '1002'];
  const recommendation = { choices: [{ id, index: 0, action: 'choose', score: 0, probability: 1 / 3 }, { id: '1002', index: 1, action: 'choose', score: 0, probability: 1 / 3 }, { id: 'skip', index: 2, action: 'skip', score: 0, probability: 1 / 3 }] };
  const biased = biasArchetypeRecommendations(state, recommendation, { selected: [ARCHETYPES[0].id] });
  assert.ok(biased.choices[0].probability > recommendation.choices[0].probability);
  assert.ok(biased.choices.find(choice => choice.action === 'skip').probability > 0);
  assert.ok(Math.abs(biased.choices.reduce((sum, choice) => sum + choice.probability, 0) - 1) < 1e-12);
  assert.equal(recommendation.choices[0].score, 0);
});

test('a public missing core and a final forming identity are protected from reroll, while duplicates and unrelated offers are not', () => {
  const definition = ARCHETYPES[0], state = formedState(definition.id), plan = { selected: [definition.id] };
  state.phase = 'recruit';
  const missing = state.roster.pop().id;
  state.choices = [missing];
  assert.equal(shouldKeepArchetypeOffer(state, plan), true);
  state.choices = [state.roster[0].id];
  assert.equal(shouldKeepArchetypeOffer(state, plan), false);
  const core = state.roster.find(unit => definition.coreIds.includes(unit.id)).id;
  state.roster = state.roster.filter(unit => !definition.coreIds.includes(unit.id));
  state.choices = [core];
  assert.equal(shouldKeepArchetypeOffer(state, plan), true);
  assert.equal(shouldKeepArchetypeOffer(state, { selected: [] }), false);
  state.choices = ['1002'];
  assert.equal(shouldKeepArchetypeOffer(state, plan), false);
});

test('survival priority suppresses preference using only public HP and deadline pressure, and early weak lines are abandoned', () => {
  const state = newGame({ seed: 'survival-plans' }), original = structuredClone(state);
  assert.equal(archetypeSurvivalMode(state).scale, 1);
  assert.deepEqual(state, original);
  state.hp = 20; state.shield = 0;
  assert.equal(archetypeSurvivalMode(state).scale, 0);
  state.phase = 'recruit'; state.choices = [ARCHETYPES[0].coreIds[0]];
  const recommendation = { choices: [{ id: state.choices[0], index: 0, action: 'choose', score: 0, probability: 0.5 }, { id: 'skip', index: 1, action: 'skip', score: 0, probability: 0.5 }] };
  assert.equal(biasArchetypeRecommendations(state, recommendation, { selected: [ARCHETYPES[0].id] }, { strength: 0 }), recommendation);
  state.stats.spins = 6;
  const previous = { selected: ARCHETYPES.slice(0, 3).map(definition => definition.id), abandoned: [], changes: [], initialized: true };
  const next = updateArchetypePlan(state, { kind: 'adaptive', slots: 3 }, previous);
  assert.equal(next.selected.length, 1);
  assert.equal(next.changes.at(-1).reason, 'survival-abandon-low-progress');
  state.hp = 100; state.spinsLeft = 2; state.lastSpin.damage = 1;
  assert.equal(archetypeSurvivalMode(state).deadlineBehind, true);
  state.pendingFloor = true;
  assert.equal(archetypeSurvivalMode(state).scale, 1);
});

test('real-engine archetype campaigns are reproducible and audit finite action bounds', () => {
  const options = { seed: 'archetype-determinism', strategy: { id: 'adaptive:2', kind: 'adaptive', slots: 2 }, maxActions: 12, probeSamples: 1, trace: true };
  const first = runArchetypeCampaign(options);
  assert.deepEqual(first, runArchetypeCampaign(options));
  assert.equal(first.actions, 12);
  assert.equal(first.stopped, 'action-limit');
  assert.equal(first.defeatCause, null);
  assert.ok(Number.isFinite(first.terminalHp) && Number.isFinite(first.enemyHpRemaining));
  assert.ok(first.snapshots.length > 1);
  const compact = compactArchetypeCampaign(first);
  const replayed = expandArchetypeCampaign(compact);
  assert.deepEqual(replayed.snapshots.map(({ turn, phase, selected, formed, powerEffectRatio, growthEffect }) => ({ turn, phase, selected, formed, powerEffectRatio, growthEffect })), first.snapshots.map(({ turn, phase, selected, formed, powerEffectRatio, growthEffect }) => ({ turn, phase, selected, formed, powerEffectRatio, growthEffect })));
  const strategies = [{ id: 'baseline', kind: 'baseline' }];
  const asBaseline = { ...first, strategyId: 'baseline' };
  assert.deepEqual(summarizeArchetypeBenchmark([asBaseline], strategies), summarizeArchetypeBenchmark([expandArchetypeCampaign(compactArchetypeCampaign(asBaseline))], strategies));
});

test('summary includes never-formed losses, uncertainty, and zero-filled defeated campaigns', () => {
  const snapshot = (turn, phase, power, formed = []) => ({ turn, phase, power, damage: power, defense: 0, growth: 0, withoutArchetypes: { power, growth: 0 }, powerEffectRatio: 1, growthEffect: 0, formed });
  const campaign = (strategyId, won) => ({ strategyId, seed: 'paired', won, phase: won ? 'victory' : 'defeat', turns: 5, firstFormed: {}, finalFormed: [], abandoned: [], stopped: null, snapshots: [snapshot(0, 'ready', 10), snapshot(4, 'ready', 20), snapshot(5, won ? 'victory' : 'defeat', 30)] });
  const baseline = campaign('baseline', true), failed = campaign('focus:ink_dot', false);
  const summary = summarizeArchetypeBenchmark([baseline, failed], [{ id: 'baseline', kind: 'baseline' }, { id: 'focus:ink_dot', kind: 'focus', focusId: 'ink_dot' }]);
  const report = summary.strategies[1];
  const concordant = summary.strategies[0].pairedBaseline.difference;
  assert.equal(concordant.mean, 0);
  assert.ok(concordant.ci95[0] < 0 && concordant.ci95[1] > 0, 'no discordant seeds must not produce a false [0,0] equivalence interval');
  assert.equal(report.formation.neverFormed, 1);
  assert.equal(report.formation.unformedLosses, 1);
  assert.equal(report.losses, 1);
  assert.equal(report.byTurn.at(-1).allProgress, 0);
  assert.equal(report.byTurn.at(-1).survivingN, 0);
  assert.equal(report.pairedBaseline.outcomes.baselineOnlyWins, 1);
  assert.ok(report.winRateCI95[1] > 0);
  assert.deepEqual(meanInterval([]), { n: 0, mean: null, ci95: [null, null] });
});

test('incomplete campaigns are censored and never counted as defeated, a lost pair, or a future zero', () => {
  const snapshot = (turn, phase, power) => ({ turn, phase, power, damage: power, defense: 0, growth: 0, withoutArchetypes: { power, growth: 0 }, powerEffectRatio: 1, growthEffect: 0, formed: [], selected: [] });
  const partial = { strategyId: 'baseline', seed: 'partial', won: false, phase: 'recruit', turns: 1, stopped: 'action-limit', firstFormed: {}, finalFormed: [], abandoned: [], snapshots: [snapshot(0, 'ready', 10), snapshot(1, 'recruit', 12)] };
  const complete = { ...partial, seed: 'complete', won: true, phase: 'victory', turns: 3, stopped: null, snapshots: [snapshot(0, 'ready', 10), snapshot(1, 'ready', 12), snapshot(3, 'victory', 20)] };
  const report = summarizeArchetypeBenchmark([partial, complete], [{ id: 'baseline', kind: 'baseline' }]).strategies[0];
  assert.equal(report.n, 2);
  assert.equal(report.completed, 1);
  assert.equal(report.incomplete, 1);
  assert.equal(report.wins, 1);
  assert.equal(report.losses, 0);
  assert.equal(report.winRate, 1);
  assert.equal(report.formation.censoredIncomplete, 1);
  assert.equal(report.formation.unformedLosses, 0);
  assert.equal(report.pairedBaseline.incompletePairs, 1);
  assert.equal(report.pairedBaseline.outcomes.bothLose, 0);
  assert.equal(report.byTurn.at(-1).allN, 1);
  const onlyPartial = summarizeArchetypeBenchmark([partial], [{ id: 'baseline', kind: 'baseline' }]).strategies[0];
  assert.equal(onlyPartial.winRate, null);
  assert.equal(onlyPartial.losses, 0);
});
