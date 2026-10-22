import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin as inspectControlled } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { inspectSpin } from '../src/growth-telemetry.js';

function fixture(ids, seed = 'growth-telemetry') {
  const state = newGame({ seed });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target-${col}`, col, hp: 1000, maxHp: 1000, attack: 0, boss: false, name: '诊断靶子' }));
  state.enemySkill = { id: 'pressure', name: '诊断靶子', description: '无装甲' };
  return state;
}

function assertDamageLedger(result) {
  assert.deepEqual(result.hits.map(({kind,sourceType,stage,...hit}) => hit), result.state.lastSpin.hits);
  assert.equal(Math.round(result.hits.reduce((sum, hit) => sum + hit.amount, 0) * 100) / 100, result.state.lastSpin.damage);
}

test('diagnostic spins preserve exact game state, seeded RNG and immutable input', () => {
  const ids = ['1002', '1003', '1005', '1006', '1102', '1107', '1108', '1109', '1205', '1204', '1202', '1214', '1220', '1303', '1305', '1315', '1404', '1407', '1408', 'cyrene', 'ashveil'];
  for (let index = 0; index < 12; index++) {
    const state = fixture(ids, `diagnostic-${index}`);
    state.items = ['meteorite', 'rubert_gear', 'annihilation_wick'];
    state.round = 3;
    state.hp = 60;
    state.roster.forEach((unit, position) => { unit.ticks = position % 4; });
    state.roster.find(unit => unit.id === '1109').temporary = 1;
    const before = structuredClone(state);
    const result = inspectSpin(state);
    assert.deepEqual(state, before);
    assert.deepEqual(result.state, spin(state));
    assertDamageLedger(result);
    assert.equal(Object.hasOwn(result.state, 'diagnostics'), false);
  }
});

test('global item damage keeps its item source even when legacy hits use cell zero', () => {
  const state = fixture(['1105']);
  state.items = ['meteorite'];
  state.round = 3;
  const result = inspectSpin(state);
  assertDamageLedger(result);
  const itemHits = result.hits.filter(hit=>hit.sourceType==='item');
  assert.equal(itemHits.length, 5);
  assert.equal(result.hits.filter(hit=>hit.sourceType==='character' && hit.attackType==='normal').length,1);
  for (const hit of itemHits) {
    assert.deepEqual(hit, { cell: 0, targetCol: hit.targetCol, amount: 2, kind: 'effect', sourceType: 'item', sourceId: 'meteorite', stage: 'afterAttacks', attackType:'environmental', eventId:hit.eventId });
  }
});

test('character ability damage is separate from its normal attack and keeps the instance', () => {
  const state = fixture(['1220','1002']);
  state.roster[0].ticks = 2;
  const layoutUids=Array(20).fill(null);layoutUids[6]='u1';layoutUids[7]='u2';
  const result = inspectControlled(state,{layoutUids});
  assertDamageLedger(result);
  result.hits=result.hits.filter(h=>h.sourceUid==='u1');
  const power = result.state.lastSpin.values[result.hits[0].cell];
  const extra = characterById('1220').effects.find(e => e.type === 'damage').value;
  assert.deepEqual(result.hits.map(({ amount, kind, sourceType, sourceId, sourceUid }) => ({ amount, kind, sourceType, sourceId, sourceUid })), [
    { amount: Math.round(power * 3 * 100) / 100, kind: 'attack', sourceType: 'character', sourceId: '1220', sourceUid: 'u1' },
    { amount: Math.round(power * extra * 100) / 100, kind: 'effect', sourceType: 'character', sourceId: '1220', sourceUid: 'u1' },
  ]);
});

test('Seele resurgence remains attributed character skill damage and records actual capped loss', () => {
  const state = fixture(['1102','1006']);
  state.enemies.forEach(enemy => { enemy.hp = 1; });
  const layoutUids=Array(20).fill(null);layoutUids[6]='u1';layoutUids[7]='u2';
  const result = inspectControlled(state,{layoutUids});
  assertDamageLedger(result);
  result.hits=result.hits.filter(hit=>hit.sourceUid==='u1');
  assert.equal(result.hits.length, 2);
  assert.equal(new Set(result.hits.map(hit => hit.targetCol)).size, 2);
  for (const hit of result.hits) {
    assert.equal(hit.amount, 1);
    assert.equal(hit.kind, hit === result.hits[0] ? 'attack' : 'effect');
    assert.equal(hit.sourceType, 'character');
    assert.equal(hit.sourceId, '1102');
    assert.equal(hit.sourceUid, 'u1');
  }
});

test('strongest-member synergy damage keeps the synergy source', () => {
  const result = inspectSpin(fixture(['1102', '1110', '1306']));
  assertDamageLedger(result);
  const synergyHits = result.hits.filter(hit => hit.sourceId === 'quantum');
  assert.equal(synergyHits.length, 1);
  assert.equal(synergyHits[0].kind, 'effect');
  assert.equal(synergyHits[0].sourceType, 'synergy');
  assert.equal(Object.hasOwn(synergyHits[0], 'sourceUid'), false);
  assert.equal(result.state.board[synergyHits[0].cell].id, '1102');
});

test('a rejected diagnostic spin returns the original state and an empty ledger', () => {
  const state = newGame();
  state.phase = 'defeat';
  const result = inspectSpin(state);
  assert.equal(result.state, state);
  assert.deepEqual(result.hits, []);
});
