import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin, validateSave } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { matchesEffectFilter, effectAmount, trainingMultiplier } from '../src/effect-rules.js';

const effect = (type, value, extra = {}) => ({ type, value, trigger: 'appearance', duration: 'spin', target: 'self', stacking: 'additive', summary: '受控机制探针', ...extra });
function withKits(specs, fn) {
  const snapshots = specs.map(([id, spec]) => { const c = characterById(id); const before = { ...c }; Object.assign(c, { kitVersion: 6, effects: [], power: 3, attack: 'support', groups: [], ...spec }); return [c, before]; });
  try { return fn(); } finally { for (const [c, before] of snapshots) { for (const key of Object.keys(c)) delete c[key]; Object.assign(c, before); } }
}
function fixture(ids, { enemyAttack = 0, growth = {}, seed = 'v060-roles' } = {}) {
  const state = newGame({ seed });
  state.roster = ids.map((id, i) => ({ id, uid: `u${i + 1}`, stars: 1, ticks: 0, growth: growth[id] || 0 }));
  state.uidCounter = ids.length + 1; state.hp = 40; state.shield = 0;
  state.enemies.forEach(enemy => { enemy.hp = 1e6; enemy.maxHp = 1e6; enemy.attack = enemyAttack; enemy.boss = false; });
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '受控探针' };
  state.bossStage = 0; state.activeDebuffs = []; state.spinsLeft = 5;
  return state;
}
const ownDamage = (result, id) => result.hits.filter(hit => hit.sourceType === 'character' && hit.sourceId === id).reduce((sum, hit) => sum + hit.amount, 0);

test('group and role filters read trusted definitions and training never amplifies training itself', () => withKits([
  ['1001', { role: 'defense', groups: ['guard'] }], ['1002', { role: 'attack', attack: 'single', groups: ['guard', 'express'] }],
], () => {
  assert.equal(matchesEffectFilter({ id: '1002' }, { groupsAny: ['express'], role: 'attack' }), true);
  assert.equal(matchesEffectFilter({ id: '1001', groups: ['express'] }, { group: 'express' }), false);
  assert.equal(matchesEffectFilter({ id: '1001' }, { group: 'guard', roleNot: 'attack' }), true);
  assert.equal(trainingMultiplier({ id: '1001', growth: 10 }), 1.8);
  assert.equal(effectAmount(effect('shield', 10, { scaleWithTraining: true }), { unit: { id: '1001', growth: 10 } }), 18);
  assert.equal(effectAmount(effect('growth', .3, { scaleWithTraining: true }), { unit: { id: '1001', growth: 10 } }), .3);
}));

test('conditional defense requires matching teammates and training increases shield rather than attacks', () => withKits([
  ['1001', { role: 'defense', groups: ['guard'], effects: [effect('shield', 5, { scaleWithTraining: true, condition: { metric: 'presentDistinct', value: 1, filter: { group: 'guard', excludeSelf: true } } })] }],
  ['1002', { role: 'attack', attack: 'single', groups: ['guard'] }], ['1013', { role: 'attack', attack: 'aoe', groups: ['lab'] }],
], () => {
  const matched = inspectSpin(fixture(['1001', '1002']));
  const wrong = inspectSpin(fixture(['1001', '1013']));
  const trained = inspectSpin(fixture(['1001', '1002'], { growth: { '1001': 10 } }));
  const amount = r => r.state.lastSpin.effects.filter(e => e.sourceId === '1001' && e.type === 'shield').reduce((s, e) => s + e.amount, 0);
  assert.equal(amount(matched), 5); assert.equal(amount(wrong), 0); assert.equal(amount(trained), 9);
  assert.equal(ownDamage(trained, '1001'), 0);
  const cell = trained.state.board.findIndex(u => u?.id === '1001');
  assert.equal(trained.state.lastSpin.powerBreakdown[cell].growth, 0);
}));

test('bound trainers grow the matching permanent teammate and cannot train themselves or another trainer', () => withKits([
  ['1009', { role: 'trainer', groups: ['lab'], effects: [effect('growth', .4, { duration: 'run', target: 'matching', filter: { group: 'lab', roleNot: 'trainer', excludeSelf: true, temporary: false, commission: false }, targetLimit: 1 })] }],
  ['1002', { role: 'attack', attack: 'single', groups: ['lab'] }], ['1013', { role: 'attack', attack: 'aoe', groups: ['guard'] }], ['1101', { role: 'trainer', groups: ['lab'] }],
], () => {
  const state = fixture(['1009', '1002', '1013', '1101']); const copy = structuredClone(state); const result = spin(state);
  assert.deepEqual(state, copy);
  assert.equal(result.roster.find(u => u.id === '1002').growth, .4);
  for (const id of ['1009', '1013', '1101']) assert.equal(result.roster.find(u => u.id === id).growth, 0);
  assert.ok(validateSave(result));
}));

test('vulnerability applies only to the specified attacking group and shape, including character extra attacks', () => withKits([
  ['1006', { role: 'disruptor', groups: ['lab'], effects: [effect('vulnerability', .25, { filter: { group: 'lab', role: 'attack', attack: 'single' } })] }],
  ['1002', { role: 'attack', attack: 'single', groups: ['lab'], effects: [effect('damage', .5, { per: { metric: 'sourcePower' }, stage: 'afterAttacks' })] }],
  ['1013', { role: 'attack', attack: 'aoe', groups: ['lab'] }],
], () => {
  const state = fixture(['1006', '1002', '1013']); const on = inspectSpin(state);
  const c = characterById('1006'), effects = c.effects; c.effects = []; const off = inspectSpin(state); c.effects = effects;
  assert.ok(Math.abs(ownDamage(on, '1002') / ownDamage(off, '1002') - 1.25) < .002);
  assert.equal(ownDamage(on, '1013'), ownDamage(off, '1013'));
  assert.equal(ownDamage(on, '1006'), 0);
  assert.deepEqual(on.state, spin(state));
  assert.equal(Math.round(on.hits.reduce((sum, hit) => sum + hit.amount, 0) * 100) / 100, on.state.lastSpin.damage);
}));

test('amplifiers cannot become attackers and their combined multiplier is bounded', () => withKits([
  ['1009', { role: 'amplifier', groups: ['lab'], effects: [effect('powerMultiplier', 1.8, { target: 'matching', filter: { group: 'lab', role: 'attack' }, scaleWithTraining: true })] }],
  ['1002', { role: 'attack', attack: 'single', groups: ['lab'] }],
], () => {
  const state = fixture(['1002', ...Array(8).fill('1009')], { growth: { '1009': 12 } });
  const result = inspectSpin(state); const row = result.state.lastSpin.powerBreakdown[result.state.board.findIndex(u => u?.id === '1002')];
  assert.ok(row.multiplier <= 2.2 + 1e-8);
  assert.equal(ownDamage(result, '1009'), 0);
  assert.ok(ownDamage(result, '1002') > 0);
}));

test('enemy weakening has a floor and expires rather than leaking to a later spin', () => withKits([
  ['1006', { role: 'disruptor', groups: ['lab'], effects: [effect('retaliationMultiplier', .1, { scaleWithTraining: true })] }],
  ['1002', { role: 'attack', attack: 'single', groups: ['lab'] }],
], () => {
  const state = fixture(['1006', '1002'], { enemyAttack: 10, growth: { '1006': 12 } });
  const on = spin(state); assert.ok(on.lastSpin.incoming >= 12);
  const c = characterById('1006'), effects = c.effects; c.effects = []; const next = spin({ ...on, phase: 'ready', pendingRewards: [], choices: [] }); c.effects = effects;
  assert.equal(next.lastSpin.incoming, 30);
  assert.equal(Object.hasOwn(on, 'vulnerabilities'), false);
}));
