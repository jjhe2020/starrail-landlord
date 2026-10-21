import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, ITEMS, ESSENCES } from '../src/content.js';
import { durationInfo, effectRows, effectBadges, snapshotTitle, unitBreakdown } from '../src/effect-info.js';
import { newGame, spin } from '../src/engine.js';

test('all content entries explain lifetime, trigger, recipient and stacking without untranslated DSL', () => {
  for (const entry of [...CHARACTERS, ...ITEMS, ...ESSENCES]) {
    const rows = effectRows(entry);
    assert.ok(rows.length > 0, entry.name);
    assert.equal(rows.length, entry.effects.length, entry.name);
    for (const row of rows) {
      assert.notEqual(row.duration.key, 'unknown', `${entry.name}: ${row.label}`);
      for (const field of ['label','trigger','target','stacking']) assert.match(row[field], /[\u3400-\u9fff]/u, `${entry.name}: ${field}`);
    }
    assert.equal(effectBadges(entry).length, new Set(entry.effects.map(e => durationInfo(e.duration).key)).size);
  }
});

test('resource outcomes identify shared train pools rather than implying personal unit HP or shields', () => {
  const shield = effectRows(CHARACTERS.find(c => c.id === '1001'))[0];
  assert.equal(shield.target, '列车护盾');
  assert.equal(shield.duration.key, 'resource');
  const support = effectRows(CHARACTERS.find(c => c.id === '1008'));
  assert.ok(support.every(row => row.duration.key === 'spin'));
  const growth = effectRows(CHARACTERS.find(c => c.role === 'trainer'));
  assert.ok(growth.some(row => row.duration.key === 'run'));
  const damage = effectRows({effects:[{type:'damage',trigger:'spin',target:'team',duration:'spin'}]})[0];
  assert.equal(damage.target,'所有存活敌人');
  assert.match(damage.trigger,/常规攻击后/);
});

test('displayed power is a historical snapshot with a precise encounter and round, while old saves remain readable', () => {
  const state = newGame({seed:'effect-history-ui'});
  assert.equal(snapshotTitle(state), '尚未转动结算');
  const next = spin(state);
  const uid = next.board.find(Boolean).uid;
  assert.equal(snapshotTitle(next), '上次结算 · 第 01 关第 1 次转动');
  assert.ok(unitBreakdown(next, uid));
  const old = structuredClone(next);
  delete old.lastSpin.floor; delete old.lastSpin.round; delete old.lastSpin.powerBreakdown;
  assert.equal(snapshotTitle(old), '上次结算');
  assert.equal(unitBreakdown(old, uid), null);
  assert.equal(unitBreakdown(next, 'missing'), null);
  assert.equal(durationInfo('nextSpin').key, 'nextSpin');
  assert.notEqual(durationInfo('nextSpin').label, durationInfo('run').label);
});
