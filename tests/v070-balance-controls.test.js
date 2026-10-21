import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/content.js';
import { referenceRoster, makeCardScenario, runFutureSample, cardComparisons, ENEMY_SCENARIOS, STAGES } from '../src/balance-v070.js';

test('generic peers are identical across every same-role rarity comparison, over four panels', () => {
  const strata = new Map(); for (const c of CHARACTERS) { const key = `${c.role}|${c.rarity}`; if (!strata.has(key)) strata.set(key, []); strata.get(key).push(c); }
  for (const group of strata.values()) for (let sample = 0; sample < 4; sample++) {
    const scenarios = group.map(c => makeCardScenario({ focusId: c.id, sample }));
    const first = scenarios[0]; for (const scenario of scenarios) {
      assert.deepEqual(scenario.state.roster.slice(1), first.state.roster.slice(1));
      assert.deepEqual(scenario.layoutUids, first.layoutUids);
      assert.ok(scenario.state.roster.slice(1).every(unit => !group.some(c => c.id === unit.id)));
    }
  }
});
test('cadence samples cover all 12 phases without biasing every4 by stage', () => {
  for (const stage of STAGES) {
    const ticks = Array.from({ length: 64 }, (_, sample) => makeCardScenario({ focusId: '1002', sample, stage }).state.roster[0].ticks + 1);
    assert.equal(ticks.filter(tick => tick % 4 === 0).length, 16);
    assert.equal(ticks.filter(tick => tick % 2 === 0).length, 32);
    assert.equal(new Set(ticks.slice(0, 12)).size, 12);
  }
});
test('same-encounter future probes stop after clear, and pad rather than farm empty-board training', () => {
  const trainer = CHARACTERS.find(c => c.role === 'trainer');
  const trace = runFutureSample({ focusId: trainer.id, enemy: { ...ENEMY_SCENARIOS.find(e => e.id === 'killable'), hp: .001 } });
  for (const branch of [trace.full, trace.off]) {
    assert.equal(branch.ended, 'clear'); assert.equal(branch.actualSpins, 1);
    assert.ok(branch.observations.slice(1).every(row => row.padded && row.ended === 'clear' && row.growth === 0 && row.damage === 0));
  }
});
test('future probes never revive a dead team under strong retaliation', () => {
  const trainer = CHARACTERS.find(c => c.role === 'trainer');
  const trace = runFutureSample({ focusId: trainer.id, enemy: { ...ENEMY_SCENARIOS.find(e => e.id === 'retaliation'), attack: 1000 } });
  for (const branch of [trace.full, trace.off]) {
    assert.equal(branch.ended, 'death'); assert.equal(branch.actualSpins, 1);
    assert.ok(branch.observations.slice(1).every(row => row.padded && row.growth === 0 && row.healing === 0));
  }
});
test('peer means stay linear when individual peers alternate between ninety and zero', () => {
  const strata = new Map(); for (const c of CHARACTERS.filter(c => c.role === 'attack')) { if (!strata.has(c.rarity)) strata.set(c.rarity, []); strata.get(c.rarity).push(c); }
  const cards = [...strata.values()].find(group => group.length >= 4).slice(0, 4), rows = [];
  for (let sample = 0; sample < 3; sample++) for (let i = 0; i < cards.length; i++) rows.push({ focusId: cards[i].id, sample, role: 'attack', rarity: cards[i].rarity, background: 'generic', stage: 'early', enemy: 'standard', presence: { damage: i === 0 ? 30 : i - 1 === sample ? 90 : 0 } });
  const focus = cardComparisons(rows).find(row => row.focusId === cards[0].id);
  assert.equal(focus.referenceMean, 30); assert.equal(focus.ci95.mean, 0); assert.equal(focus.status, 'equivalent');
  const compatible = cardComparisons(rows.map(row => ({ ...row, background: 'compatible' })));
  assert.ok(compatible.every(row => row.status === 'potential-description' && row.p === null));
});

test('controlled single target does not silently add random natural boss clauses', async () => {
  const { inspectSpin } = await import('../src/engine.js');
  const probe = makeCardScenario({ focusId: '1002', enemy: ENEMY_SCENARIOS.find(enemy => enemy.id === 'boss'), sample: 11 });
  assert.ok(probe.state.enemies.every(enemy => enemy.boss === false));
  const result = inspectSpin(probe.state, { layoutUids: probe.layoutUids });
  assert.deepEqual(result.state.activeDebuffs, []);
});

test('relative equivalence propagates the sampled reference through linear boundaries', async () => {
  const { assessRelativePerformance } = await import('../src/balance-v070.js');
  const result = assessRelativePerformance([1, 100, 1, 100], [1, 100, 1, 100]);
  assert.equal(result.ci95.mean, 0);
  assert.ok(result.decision.lowerBoundary.sd > 0 && result.decision.upperBoundary.sd > 0);
  assert.equal(result.status, 'insufficient');
  assert.equal(assessRelativePerformance(Array(64).fill(30), Array(64).fill(30)).status, 'equivalent');
  assert.equal(assessRelativePerformance(Array(64).fill(60), Array(64).fill(30)).status, 'outside');
});
