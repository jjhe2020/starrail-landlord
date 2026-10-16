import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCHETYPES, getArchetypes, archetypesForCharacter, withoutArchetypeEffects } from '../src/archetypes.js';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { estimateEffectsForAi } from '../src/ai.js';

function fixture(ids) {
  const state = newGame({ seed: 'archetype-outcome-probe' });
  state.roster = ids.map((id, i) => ({ id, uid: `u${i + 1}`, stars: 1, ticks: 0, growth: 0 }));
  state.uidCounter = ids.length + 1;
  state.hp = 50;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `probe-${col}`, name: '训练靶', col, hp: 100000, maxHp: 100000, attack: 5, boss: false }));
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '每三轮增加反击' };
  return state;
}

test('every route has real members, a core gate, and overlapping mechanical partners', () => {
  assert.equal(ARCHETYPES.length, 8);
  assert.equal(new Set(ARCHETYPES.map(a => a.id)).size, ARCHETYPES.length);
  assert.ok(archetypesForCharacter('1305').length >= 2);
  for (const a of ARCHETYPES) {
    assert.ok(a.memberIds.length >= a.threshold + 3);
    for (const id of a.memberIds) assert.ok(characterById(id), `${a.id}: ${id}`);
    assert.ok(a.coreIds.every(id => a.memberIds.includes(id)));
    assert.ok(a.effects.length >= 2);
  }
});

test('formation counts distinct recruited identities and requires a core', () => {
  const a = ARCHETYPES.find(a => a.id === 'elation');
  const members = a.memberIds.filter(id => !a.coreIds.includes(id)).slice(0, a.threshold);
  assert.equal(getArchetypes(fixture(members)).find(x => x.id === a.id).formed, false);
  const state = fixture([a.coreIds[0], members[0], members[0]]);
  assert.equal(getArchetypes(state).find(x => x.id === a.id).count, 2);
  state.roster.push({ id: members[1], uid: 'u4', stars: 3, growth: 0, ticks: 0, temporary: 2 });
  state.roster.push({ id: members[2], uid: 'u5', stars: 1, growth: 0, ticks: 0, commission: 'ghost_hunt_wrap' });
  assert.equal(getArchetypes(state).find(x => x.id === a.id).formed, false);
  state.roster.push({ id: members[1], uid: 'u6', stars: 1, growth: 0, ticks: 0 });
  state.roster.push({ id: members[2], uid: 'u7', stars: 1, growth: 0, ticks: 0 });
  assert.equal(getArchetypes(state).find(x => x.id === a.id).formed, true);
  state.roster = state.roster.filter(u => u.id !== a.coreIds[0]);
  assert.equal(getArchetypes(state).find(x => x.id === a.id).formed, false);
});

for (const a of ARCHETYPES) test(`${a.name} produces a real payoff only after formation`, () => {
  const ids = [a.coreIds[0], ...a.memberIds.filter(id => !a.coreIds.includes(id)).slice(0, a.threshold - 1)];
  const before = fixture(ids.slice(0, -1));
  assert.equal(getArchetypes(before).find(x => x.id === a.id).effects.length, 0);
  const state = fixture(ids), saved = structuredClone(state);
  const enabled = spin(state);
  const disabled = withoutArchetypeEffects(() => spin(state));
  assert.deepEqual(state, saved, 'engine action preserves input');
  assert.ok(enabled.lastSpin.effects.some(e => e.sourceId === a.id), 'the named route actually executes');
  assert.ok(enabled.lastSpin.damage > disabled.lastSpin.damage * 1.12 || enabled.roster.reduce((s, u) => s + u.growth, 0) > disabled.roster.reduce((s, u) => s + u.growth, 0) + 0.2,
    'direct damage or future growth improves on exactly the same roster and draw');
  assert.ok(validateSave(JSON.parse(JSON.stringify(enabled))), 'route results round-trip');
  assert.deepEqual(spin(state), enabled, 'fixed seeds reproduce the outcome');
});

test('counterfactual suppression is scoped and restored after exceptions', () => {
  const a = ARCHETYPES[0], state = fixture([a.coreIds[0], ...a.memberIds.filter(id => !a.coreIds.includes(id)).slice(0, a.threshold - 1)]);
  assert.throws(() => withoutArchetypeEffects(() => { throw Error('probe'); }));
  assert.ok(getArchetypes(state).find(x => x.id === a.id).effects.length);
});

test('AI sees formed archetype effects using the same identity filters as combat', () => {
  const state = fixture(['1005', '1004', '1006', '1108', '1210', '1002']);
  const estimate = estimateEffectsForAi(state);
  const off = withoutArchetypeEffects(() => estimateEffectsForAi(state));
  assert.ok((estimate.powerMultipliers.get('u1') || 1) > (off.powerMultipliers.get('u1') || 1));
  assert.equal(estimate.powerMultipliers.get('u6') || 1, off.powerMultipliers.get('u6') || 1, 'unrelated Dan Heng receives no route multiplier');
});

test('break relay lets the strongest killer perform its own system follow-up once', () => {
  const state = fixture(['1310', '1317', '1315', 'fugue', '1301']);
  state.seed = 'review-break-killer';
  state.rngState = newGame({ seed: state.seed }).rngState;
  state.roster[0].growth = 1000;
  state.enemies[1].hp = 1000;
  const result = spin(state);
  const index = result.board.findIndex(u => u?.id === '1310');
  const followUps = result.lastSpin.effects.filter(e => e.sourceId === 'break' && e.type === 'damage');
  assert.equal(followUps.length, 1, 'system follow-up cannot recursively trigger itself');
  assert.equal(followUps[0].amount, Math.round(result.lastSpin.values[index] * 0.8 * 100) / 100);
});

test('overlapping archetypes take the highest multiplier per attacker in combat and AI', () => {
  const state = fixture(['1112', '1304', '1223', 'march_hunt', '1107', '1001', '1103', '1104']);
  assert.ok(getArchetypes(state).find(a => a.id === 'follow_up').formed);
  assert.ok(getArchetypes(state).find(a => a.id === 'frost').formed);
  const enabled = spin(state), disabled = withoutArchetypeEffects(() => spin(state));
  const index = enabled.board.findIndex(u => u?.id === '1304');
  const strongestFactor = Math.max(...ARCHETYPES.filter(a => a.memberIds.includes('1304')).flatMap(a => a.effects.filter(e => e.type === 'powerMultiplier').map(e => e.value)));
  assert.ok(Math.abs(enabled.lastSpin.values[index] / disabled.lastSpin.values[index] - strongestFactor) < 0.01);
  const estimate = estimateEffectsForAi(state), off = withoutArchetypeEffects(() => estimateEffectsForAi(state));
  assert.ok(Math.abs(estimate.powerMultipliers.get('u2') / (off.powerMultipliers.get('u2') || 1) - strongestFactor) < 1e-8);
});

test('memory performance boosts the real summoned Sushang rather than an unreachable temporary member', () => {
  const a = ARCHETYPES.find(a => a.id === 'recollection');
  const initial = fixture(a.memberIds.slice(0, a.threshold));
  initial.roster[0].ticks = 2;
  let state = spin(initial);
  while (['recruit', 'item', 'essence'].includes(state.phase)) state = skipReward(state);
  const summon = state.roster.find(u => u.id === '1206' && u.temporary === 2);
  assert.ok(summon, 'Aglaea really summons Sushang through the public spin action');
  const uid = summon.uid;
  const enabled = spin(state), disabled = withoutArchetypeEffects(() => spin(state), ['recollection']);
  const index = enabled.board.findIndex(u => u?.uid === uid);
  assert.ok(enabled.lastSpin.effects.some(e => e.sourceId === 'recollection' && e.type === 'power' && e.targetUid === uid && e.amount === 2));
  assert.equal(Math.round((enabled.lastSpin.values[index] - disabled.lastSpin.values[index]) * 100) / 100, 2);
  assert.equal(enabled.roster.find(u => u.uid === uid).temporary, 1, 'the buff does not extend the summon');
  assert.ok(validateSave(JSON.parse(JSON.stringify(enabled))));
});
