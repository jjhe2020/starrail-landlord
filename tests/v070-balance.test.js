import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/content.js';
import { newGame } from '../src/engine.js';
import { studentTCdf, studentTQuantile, interval, pairedInterval, adjustFdr, assessEquivalence, buildTagStrategies, strategyMatches, biasTagRecommendation, referenceRoster, makeCardScenario, layoutForRoster } from '../src/balance-v070.js';

test('Student-t intervals match known df 1, 10, and large df reference quantiles', () => {
  assert.ok(Math.abs(studentTQuantile(.975, 1) - 12.706204736) < 1e-6);
  assert.ok(Math.abs(studentTQuantile(.975, 10) - 2.228138852) < 1e-6);
  assert.ok(Math.abs(studentTCdf(0, 12) - .5) < 1e-12);
  assert.ok(Math.abs(studentTQuantile(.975, 100000) - 1.9599877) < 1e-5);
});
test('paired estimates preserve covariance, zeros, and insufficient samples', () => {
  assert.deepEqual(pairedInterval([1, 100, 900], [0, 99, 899]).ci, [1, 1]);
  assert.equal(interval([0, 0, 0]).mean, 0);
  assert.deepEqual(interval([]).ci, [null, null]);
  assert.throws(() => pairedInterval([1], []), /Pair lengths/);
  assert.throws(() => interval([NaN]), /Nonfinite/);
});
test('equivalence requires the full corrected interval within margin; no difference is insufficient', () => {
  assert.equal(assessEquivalence([0, 0, 0], .1).status, 'equivalent');
  assert.equal(assessEquivalence([-.9, .9], .1).status, 'insufficient');
  assert.equal(assessEquivalence([.3, .3, .3], .1).status, 'outside');
  const adjusted = adjustFdr([{ p: .01 }, { p: .04 }, { p: .03 }, { p: null }]);
  assert.deepEqual(adjusted.map(row => row.q), [.03, .04, .04, null]);
});
test('strategy membership is computed from formal tags, with no fixed core or battle effects', () => {
  for (const strategy of buildTagStrategies()) {
    assert.ok(!('memberIds' in strategy) && !('effects' in strategy) && !('coreIds' in strategy));
    if (strategy.id !== 'baseline') assert.ok(CHARACTERS.some(character => strategyMatches(character, strategy)));
    for (const filter of strategy.filters) assert.ok(Object.keys(filter).every(key => ['path', 'element', 'faction'].includes(key)));
  }
  const state = newGame(), strategy = { filters: [{ path: '巡猎' }], mode: 'any' };
  state.phase = 'recruit'; const original = { choices: [{ action: 'choose', id: '1002', score: 1, index: 0 }, { action: 'choose', id: '1001', score: 1, index: 1 }, { action: 'skip', id: null, score: 1, index: -1 }] };
  const biased = biasTagRecommendation(state, original, strategy);
  assert.ok(biased.choices[0].probability > biased.choices[1].probability);
  assert.equal(biased.choices[2].tagBonus, 0); assert.equal(original.choices[0].score, 1);
});
test('each card has deterministic lawful reference backgrounds and equal stage budgets', () => {
  for (const character of CHARACTERS) for (const background of ['generic', 'compatible']) {
    const roster = referenceRoster(character.id, background), layout = layoutForRoster(roster, 'same');
    assert.equal(roster.length, 12); assert.equal(new Set(roster.map(unit => unit.id)).size, roster.length);
    assert.equal(layout.length, 20); assert.equal(new Set(layout.filter(Boolean)).size, roster.length);
    assert.deepEqual(layout, layoutForRoster(roster, 'same'));
    const probe = makeCardScenario({ focusId: character.id, background });
    assert.ok(probe.state.roster.every(unit => unit.stars === 1 && unit.growth === 0));
    assert.equal(probe.state.roster[0].id, character.id); assert.equal(probe.state.activeDebuffs.length, 0);
  }
});

test('paired binary intervals retain finite-sample uncertainty with no discordance', async () => {
  const { pairedWinInterval, assessPairedWins } = await import('../src/balance-v070.js');
  const result = pairedWinInterval(Array(100).fill(0));
  assert.ok(result.ci[0] < 0 && result.ci[1] > 0); assert.equal(result.p, 1);
  assert.equal(assessPairedWins(Array(100).fill(0)).status, 'equivalent');
  assert.equal(assessPairedWins([0, 0, 0]).status, 'insufficient');
  assert.equal(pairedWinInterval([1, 1, 1, 1]).p, .125);
});
