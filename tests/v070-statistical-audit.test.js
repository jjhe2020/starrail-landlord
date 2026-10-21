import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/content.js';
import { cardComparisons, makeCardScenario, referenceRoster, runFutureSample, STAGES, ENEMY_SCENARIOS } from '../src/balance-v070.js';

test('card league compares mean card value rather than the median of each individual layout', () => {
  // All four cards have the same expected contribution, but three are bursty
  // and take turns activating. The typical card mean is 30, whereas the median
  // card on any single layout is zero. These are different estimands.
  const ids = ['1002', '1109', '1008', '1103'], rows = [];
  for (let sample = 0; sample < 120; sample++) for (let index = 0; index < ids.length; index++) {
    const damage = index === 0 ? 30 : sample % 3 === index - 1 ? 90 : 0;
    rows.push({ sample, focusId: ids[index], background: 'generic', stage: 'early', enemy: 'standard', role: 'attack', rarity: 4, presence: { damage } });
  }
  const comparison = cardComparisons(rows).find(row => row.focusId === ids[0]);
  assert.equal(comparison.referenceMean ?? comparison.referenceMedian, 30);
  assert.ok(Math.abs(comparison.ci95.mean) < 1e-10, 'equal card means must yield a zero estimated difference');
  assert.notEqual(comparison.status, 'outside', 'steady output alone cannot create a spurious superiority finding');
});

test('each controlled stage samples the full cadence cycle used by period two, three and four cards', () => {
  for (const stage of STAGES) {
    const counters = Array.from({ length: 120 }, (_, sample) => makeCardScenario({ focusId: '1002', stage, sample }).state.roster[0].ticks + 1);
    for (const period of [2, 3, 4]) {
      const activations = counters.filter(counter => counter % period === 0).length;
      assert.equal(activations, counters.length / period, `${stage.id}: period ${period} cadence must not depend on an arbitrary six-offset sampling window`);
    }
  }
});

test('same role and rarity replacements share every non-focus teammate in the common background', () => {
  const strata = new Map();
  for (const character of CHARACTERS) {
    const key = `${character.role}|${character.rarity}`;
    if (!strata.has(key)) strata.set(key, []);
    strata.get(key).push(character);
  }
  for (const members of strata.values()) for (const panel of [0, 1, 2, 3]) {
    const expectedPeers = referenceRoster(members[0].id, 'generic', `audit:panel:${panel}`).slice(1);
    for (const member of members.slice(1)) assert.deepEqual(referenceRoster(member.id, 'generic', `audit:panel:${panel}`).slice(1), expectedPeers, `${member.name}: replacement must not also replace its supporting cast`);
  }
});

test('future training traces stop after a real clear or death and retain explicit zero padding', () => {
  const row = runFutureSample({ focusId: '1207', background: 'compatible', enemy: ENEMY_SCENARIOS.find(enemy => enemy.id === 'killable'), sample: 0 });
  for (const arm of [row.full, row.off]) {
    const end = arm.observations.findIndex(observation => observation.ended);
    assert.ok(end >= 0, 'this low-health fixture must actually end its encounter');
    assert.equal(arm.actualSpins, end + 1);
    for (const observation of arm.observations.slice(end + 1)) {
      assert.equal(observation.padded, true);
      for (const metric of ['damage', 'hpLost', 'healing', 'growth', 'shieldGenerated', 'shieldBlocked', 'coins']) assert.equal(observation[metric], 0, `a completed encounter cannot generate more ${metric}`);
    }
  }
});
