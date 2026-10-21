import test from 'node:test';
import assert from 'node:assert/strict';
import { characterById, itemById } from '../src/content.js';
import { newGame, inspectSpin } from '../src/engine.js';

const effect = (type, value, extra = {}) => ({ type, value, trigger: 'appearance', target: 'self', duration: 'spin', ...extra });
function fixture(ids, positions) {
  const state = newGame({ seed: 'independent-intervention-audit' });
  state.roster = ids.map((id, index) => ({ id, uid: `u${index + 1}`, stars: 1, ticks: 0, growth: 0 }));
  state.uidCounter = ids.length + 1; state.hp = 50; state.shield = 0;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ col, hp: 1e6, maxHp: 1e6, attack: 0 }));
  state.enemySkill = { id: 'none' };
  const layoutUids = Array(20).fill(null);
  positions.forEach((position, index) => { layoutUids[position] = state.roster[index].uid; });
  return { state, layoutUids };
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

test('two real Seele instances each receive their own once-per-spin kill ability', () => {
  const { state, layoutUids } = fixture(['1102', '1102', '1006', '1006'], [0, 4, 1, 3]);
  state.enemies = [{ col: 0, hp: 1, maxHp: 1, attack: 0 }, { col: 2, hp: 10000, maxHp: 10000, attack: 0 }, { col: 4, hp: 1, maxHp: 1, attack: 0 }];
  const result = inspectSpin(state, { layoutUids });
  const sources = result.state.lastSpin.effects.filter(entry => entry.sourceId === '1102' && entry.type === 'damage' && entry.amount > 0).map(entry => entry.sourceUid);
  assert.deepEqual(sources, ['u1', 'u2']);
});

test('passive spatial multipliers respect recipient range and suppress only the selected source instance', () => withKits([
  { id: '1009', role: 'amplifier', attack: 'support', effects: [effect('shieldMultiplier', 2, { trigger: 'passive', target: 'adjacent', filter: { role: 'defense' } })] },
  { id: '1001', role: 'defense', attack: 'support', effects: [effect('shield', 2)] },
], () => {
  const { state, layoutUids } = fixture(['1009', '1009', '1001', '1001'], [0, 19, 1, 17]);
  // First defender neighbors only the first provider; second defender is far
  // from either provider. Identical character IDs must not share suppression.
  const full = inspectSpin(state, { layoutUids }).state;
  const withoutFirst = inspectSpin(state, { layoutUids, suppressSkillUids: ['u1'] }).state;
  const withoutSecond = inspectSpin(state, { layoutUids, suppressSkillUids: ['u2'] }).state;
  const withoutLayer = inspectSpin(state, { layoutUids, suppressCharacterEffectTypes: ['shieldMultiplier'] }).state;
  assert.equal(full.lastSpin.shield, 6);
  assert.equal(withoutFirst.lastSpin.shield, 4);
  assert.equal(withoutSecond.lastSpin.shield, 6);
  assert.equal(withoutLayer.lastSpin.shield, 4);
}));

test('vulnerability reaches only matching ranged attackers and their extra attacks, leaving item damage intact', () => withKits([
  { id: '1004', role: 'disruptor', attack: 'support', effects: [effect('vulnerability', 0.5, { target: 'column', filter: { role: 'attack', path: '巡猎' } })] },
  { id: '1002', path: '巡猎', effects: [effect('damage', 0.5, { per: { metric: 'sourcePower' }, stage: 'afterAttacks' })] },
  { id: '1008', path: '其他命途' },
], () => {
  const item = itemById('peace_price'), originalEffects = item.effects;
  try {
    item.effects = [effect('damage', 2, { trigger: 'spin', target: 'all' })];
    const { state, layoutUids } = fixture(['1004', '1002', '1002', '1008'], [0, 5, 19, 10]);
    state.items = ['peace_price'];
    const full = inspectSpin(state, { layoutUids }), off = inspectSpin(state, { layoutUids, suppressSkillUids: ['u1'] });
    const sum = (result, uid) => result.hits.filter(hit => hit.sourceUid === uid).reduce((total, hit) => total + hit.amount, 0);
    assert.equal(sum(full, 'u2'), sum(off, 'u2') * 1.5);
    assert.equal(sum(full, 'u3'), sum(off, 'u3'));
    assert.equal(sum(full, 'u4'), sum(off, 'u4'));
    assert.deepEqual(full.hits.filter(hit => hit.sourceType === 'item'), off.hits.filter(hit => hit.sourceType === 'item'));
  } finally { item.effects = originalEffects; }
}));
