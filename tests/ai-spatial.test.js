import test from 'node:test';
import assert from 'node:assert/strict';
import { characterById } from '../src/content.js';
import { newGame, inspectSpin } from '../src/engine.js';
import { estimateEffectsForAi } from '../src/ai.js';
import { spatialMetricMean, spatialConditionProbability, effectRecipientChances, expectedEffectAmountForAi } from '../src/ai-spatial.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-11, `${actual} != ${expected}`);
const effect = (type, value, extra = {}) => ({ type, value, trigger: 'appearance', target: 'self', duration: 'spin', ...extra });
function fixture(ids) {
  const state = newGame({ seed: 'spatial-ai-public-information' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  state.hp = 40; state.shield = 0;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target${col}`, name: 'test', col, hp: 1e6, maxHp: 1e6, attack: 0, boss: false }));
  return state;
}
function withKits(specs, run) {
  const originals = specs.map(spec => [characterById(spec.id), structuredClone(characterById(spec.id))]);
  try {
    for (const spec of specs) Object.assign(characterById(spec.id), { kitVersion: 6, role: 'attack', attack: 'single', power: 3, path: '测试命途', faction: '测试阵营', element: '测试属性', effects: [], ...spec });
    return run();
  } finally {
    for (const [definition, original] of originals) {
      for (const key of Object.keys(definition)) delete definition[key];
      Object.assign(definition, original);
    }
  }
}

test('future spatial means use actual 5 by 4 geometry, padding empty cells and oversized draw dilution', () => {
  const compact = fixture(['1009', '1002']), source = compact.roster[0];
  for (const [metric, count] of [['neighbors', 5.5], ['row', 4], ['column', 3], ['aligned', 7]]) close(spatialMetricMean(compact, source, metric), count / 19);
  close(spatialMetricMean(compact, source, 'corner'), 4 / 20);
  close(spatialMetricMean(compact, source, 'edge'), 14 / 20);
  close(spatialMetricMean(compact, source, 'emptyNeighbors'), 5.5 * 18 / 19);
  const crowded = fixture(['1009', '1002', ...Array(38).fill('1103')]);
  close(spatialMetricMean(crowded, crowded.roster[0], 'neighbors', { id: '1002' }), 5.5 / 39);
  close(spatialMetricMean(crowded, crowded.roster[0], 'emptyNeighbors'), 0);
});

test('spatial threshold gates use without replacement probabilities rather than testing a mean count', () => {
  const state = fixture(['1009', '1002', '1002']);
  const expected = [[3, 0.2], [5, 0.5], [8, 0.3]].reduce((sum, [slots, weight]) => sum + weight * (1 - (19 - slots) * (18 - slots) / (19 * 18)), 0);
  close(spatialConditionProbability(state, state.roster[0], { metric: 'neighbors', filter: { id: '1002' }, value: 1 }), expected);
  close(spatialConditionProbability(state, state.roster[0], { metric: 'neighbors', filter: { id: '1002' }, op: 'eq', value: 0 }), 1 - expected);
});

test('ranged strongest assistance can miss and falls back to a weaker eligible neighbor', () => withKits([
  { id: '1009', role: 'amplifier', attack: 'support' }, { id: '1002', power: 5 }, { id: '1103', power: 2 },
], () => {
  const state = fixture(['1009', '1002', '1103']);
  const chances = effectRecipientChances(state, state.roster[0], effect('powerMultiplier', 1.5, { target: 'adjacent', selection: 'strongest', filter: { role: 'attack' } }));
  close(chances.get('u2'), 5.5 / 19);
  const weaker = [[3, 0.2], [5, 0.5], [8, 0.3]].reduce((sum, [slots, weight]) => sum + weight * slots / 19 * (19 - slots) / 18, 0);
  close(chances.get('u3'), weaker);
  assert.ok(chances.get('u2') + chances.get('u3') < 1);
  const limited = fixture(['1009', ...Array(19).fill('1002')]);
  const allocations = effectRecipientChances(limited, limited.roster[0], effect('growth', 1, { target: 'adjacent', targetLimit: 2, filter: { role: 'attack' } }));
  close([...allocations.values()].reduce((sum, value) => sum + value, 0), 2);
}));

test('capped per-neighbor amounts and matching gates are integrated before taking the expectation', () => withKits([
  { id: '1009', role: 'defense', attack: 'support' }, { id: '1002' },
], () => {
  const state = fixture(['1009', '1002', '1002']);
  const declaration = effect('shield', 3, { condition: { metric: 'neighbors', filter: { id: '1002' }, value: 1 }, per: { metric: 'neighbors', filter: { id: '1002' }, cap: 1 } });
  const chance = spatialConditionProbability(state, state.roster[0], declaration.condition);
  close(expectedEffectAmountForAi(declaration, { state, unit: state.roster[0], trigger: 'appearance' }), 3 * chance);
  characterById('1009').effects = [declaration];
  close(estimateEffectsForAi(state, { active: [], horizon: 20 }).shields, 3 * chance);
}));

test('formal OR tags and spatial vulnerability jointly change advice while ignoring hidden draws', () => withKits([
  { id: '1009', role: 'disruptor', attack: 'support', effects: [effect('vulnerability', 0.4, { target: 'adjacent', filter: { role: 'attack', anyOf: [{ path: '巡猎' }, { element: '火' }] } })] },
  { id: '1002', path: '巡猎' }, { id: '1103', element: '火' }, { id: '1109' },
], () => {
  const state = fixture(['1009', '1002', '1103', '1109']);
  const before = structuredClone(state), result = estimateEffectsForAi(state, { active: [] });
  close(result.vulnerabilityMultipliers.get('u2'), 1 + 0.4 * 5.5 / 19);
  close(result.vulnerabilityMultipliers.get('u3'), 1 + 0.4 * 5.5 / 19);
  assert.equal(result.vulnerabilityMultipliers.has('u4'), false);
  const hidden = structuredClone(state); hidden.seed = 'hidden'; hidden.rngState = 123; hidden.board = hidden.roster;
  assert.deepEqual(estimateEffectsForAi(hidden, { active: [] }), result);
  assert.deepEqual(state, before);
  const layoutUids = Array(20).fill(null);
  layoutUids[0] = 'u1'; layoutUids[1] = 'u2'; layoutUids[10] = 'u3'; layoutUids[11] = 'u4';
  const near = inspectSpin(state, { layoutUids }).state;
  const distantUids = layoutUids.slice(); distantUids[1] = null; distantUids[19] = 'u2';
  const far = inspectSpin(state, { layoutUids: distantUids }).state;
  assert.ok(near.lastSpin.damage > far.lastSpin.damage, 'the estimated range corresponds to a real positional mechanic');
}));
