import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin, validateSave } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { matchesEffectFilter, effectAmount, trainingMultiplier } from '../src/effect-rules.js';

const effect = (type, value, extra = {}) => ({ type, value, trigger: 'appearance', duration: 'spin', target: 'self', stacking: 'additive', summary: '受控机制探针', ...extra });
function withKits(specs, fn) {
  const snapshots = specs.map(([id, spec]) => { const c = characterById(id); const before = { ...c }; Object.assign(c, { kitVersion:8,effects:[],power:3,baseAttack:3,baseAttackByStar:[0,3,9,27],attack:spec.attack || 'single',normalAttack:{pattern:spec.attack || 'single',primary:spec.attack==='single'?3:.1,adjacent:1,eachTarget:1},element:'量子',faction:'测试',path:'测试',...spec }); return [c, before]; });
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

test('formal tag and role filters read trusted definitions and permanent ATK never creates an extra hidden training multiplier', () => withKits([
  ['1001', { role: 'defense', element: '冰', faction: '贝洛伯格' }], ['1002', { role: 'attack', attack: 'single', element: '冰', faction: '星穹列车' }],
], () => {
  assert.equal(matchesEffectFilter({ id: '1002' }, { faction: '星穹列车', role: 'attack' }), true);
  assert.equal(matchesEffectFilter({ id: '1001', faction: '星穹列车' }, { faction: '星穹列车' }), false);
  assert.equal(matchesEffectFilter({ id: '1001' }, { element: '冰', roleNot: 'attack' }), true);
  assert.equal(trainingMultiplier({ id: '1001', attackBonus:10, growth:10 }), 1);
  assert.equal(effectAmount(effect('shield', 10, { scaleWithTraining: true }), { unit: { id:'1001',attackBonus:10,growth:10 } }), 10);
  assert.equal(effectAmount(effect('growth', .3, { scaleWithTraining: true }), { unit: { id: '1001', growth: 10 } }), .3);
}));

test('conditional flat defense requires matching characters and permanent ATK changes normal attacks', () => withKits([
  ['1001', { role: 'defense', element: '冰', effects: [effect('shield', 5, { scaleWithTraining: true, condition: { metric: 'presentDistinct', value: 1, filter: { element: '冰', excludeSelf: true } } })] }],
  ['1002', { role: 'attack', attack: 'single', element: '冰' }], ['1013', { role: 'attack', attack: 'aoe', element: '火' }],
], () => {
  const matched = inspectSpin(fixture(['1001', '1002']));
  const wrong = inspectSpin(fixture(['1001', '1013']));
  const trained = inspectSpin(fixture(['1001', '1002'], { growth: { '1001': 10 } }));
  const amount = r => r.state.lastSpin.effects.filter(e => e.sourceId === '1001' && e.type === 'shield').reduce((s, e) => s + e.amount, 0);
  assert.equal(amount(matched), 5); assert.equal(amount(wrong), 0); assert.equal(amount(trained),5,'flat effects without ATK coefficient do not scale with permanent ATK');
  assert.equal(ownDamage(trained,'1001'),1.3);
  const cell = trained.state.board.findIndex(u => u?.id === '1001');
  assert.equal(trained.state.lastSpin.powerBreakdown[cell].permanent, 10);
}));

test('bound trainers grow the matching permanent teammate and cannot train themselves or another trainer', () => withKits([
  ['1009', { role: 'trainer', element: '火', effects: [effect('growth', .4, { duration: 'run', target: 'matching', filter: { element: '火', roleNot: 'trainer', excludeSelf: true, temporary: false, commission: false }, targetLimit: 1 })] }],
  ['1002', { role: 'attack', attack: 'single', element: '火' }], ['1013', { role: 'attack', attack: 'aoe', element: '冰' }], ['1101', { role: 'trainer', element: '火' }],
], () => {
  const state = fixture(['1009', '1002', '1013', '1101']); const copy = structuredClone(state); const result = spin(state);
  assert.deepEqual(state, copy);
  assert.equal(result.roster.find(u => u.id === '1002').growth, .4);
  for (const id of ['1009', '1013', '1101']) assert.equal(result.roster.find(u => u.id === id).growth, 0);
  assert.ok(validateSave(result));
}));

test('vulnerability applies only to the specified attacking element and shape, including character extra attacks', () => withKits([
  ['1006', { role: 'disruptor', element: '火', effects: [effect('vulnerability', .25, { target: 'matching', filter: { element: '火', role: 'attack', attack: 'single' } })] }],
  ['1002', { role: 'attack', attack: 'single', element: '火', effects: [effect('damage', .5, { per: { metric: 'sourcePower' }, stage: 'afterAttacks' })] }],
  ['1013', { role: 'attack', attack: 'aoe', element: '火' }],
], () => {
  const state = fixture(['1006', '1002', '1013']); const on = inspectSpin(state);
  const c = characterById('1006'), effects = c.effects; c.effects = []; const off = inspectSpin(state); c.effects = effects;
  assert.ok(Math.abs(ownDamage(on, '1002') / ownDamage(off, '1002') - 1.25) < .002);
  assert.equal(ownDamage(on, '1013'), ownDamage(off, '1013'));
  assert.equal(ownDamage(on,'1006'),ownDamage(off,'1006'),'unmatched support damage is unchanged by the source-filtered vulnerability');
  assert.ok(ownDamage(on,'1006')>0);
  assert.deepEqual(on.state, spin(state));
  assert.equal(Math.round(on.hits.reduce((sum, hit) => sum + hit.amount, 0) * 100) / 100, on.state.lastSpin.damage);
}));

test('amplifiers have a low normal coefficient and same-zone damage bonuses add without an arbitrary cap', () => withKits([
  ['1009', { role: 'amplifier', element: '火', effects: [effect('damageBonus', .8, { target: 'matching', filter: { element: '火', role: 'attack' }, scaleWithTraining: true })] }],
  ['1002', { role: 'attack', attack: 'single', element: '火' }],
], () => {
  const state = fixture(['1002', ...Array(8).fill('1009')], { growth: { '1009': 12 } });
  const result = inspectSpin(state); const row = result.state.lastSpin.powerBreakdown[result.state.board.findIndex(u => u?.id === '1002')];
  assert.ok(Math.abs(row.damageBonus-6.4)<1e-8);
  assert.equal(row.multiplier,1,'damage bonuses do not change ATK');
  assert.equal(ownDamage(result,'1009'),12);
  assert.ok(ownDamage(result, '1002') > 0);
}));

test('enemy weakening has a floor and expires rather than leaking to a later spin', () => withKits([
  ['1006', { role: 'disruptor', element: '火', effects: [effect('retaliationMultiplier', .1, { scaleWithTraining: true })] }],
  ['1002', { role: 'attack', attack: 'single', element: '火' }],
], () => {
  const state = fixture(['1006', '1002'], { enemyAttack: 10, growth: { '1006': 12 } });
  const on = spin(state); assert.ok(on.lastSpin.incoming >= 12);
  const c = characterById('1006'), effects = c.effects; c.effects = []; const next = spin({ ...on, phase: 'ready', pendingRewards: [], choices: [] }); c.effects = effects;
  assert.equal(next.lastSpin.incoming, 30);
  assert.equal(Object.hasOwn(on, 'vulnerabilities'), false);
}));
