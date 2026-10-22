import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { characterById } from '../src/content.js';
import { getCharacterAttributes } from '../src/engine.js';
import { characterAttributeRows, normalAttackSummary, effectRows } from '../src/effect-info.js';
import { mechanicExplanation } from '../src/mechanics.js';

test('card attributes expose real role-independent attack and configured target multipliers', () => {
  const unit = { id: '1001', stars: 2, attackBonus: 1.25, ticks: 0 };
  const attributes = getCharacterAttributes(unit);
  const rows = characterAttributeRows(attributes);
  assert.deepEqual(rows.map(row => row.label), ['当前攻击力','默认攻击方式','默认攻击倍率']);
  assert.equal(rows[0].value, attributes.attack);
  assert.equal(attributes.attack, characterById('1001').baseAttackByStar[2] + 1.25);
  assert.match(rows[2].value, /主目标 [0-9.]+%/);
  assert.equal(normalAttackSummary({pattern:'single',primary:.1}), '主目标 10%');
  assert.equal(normalAttackSummary({pattern:'blast',primary:2,adjacent:1}), '主目标 200% · 相邻各 100%');
  assert.equal(normalAttackSummary({pattern:'aoe',eachTarget:1}), '每个目标 100%');
});

test('follow-up and self-deletion explanations retain type and actual lifecycle', () => {
  const rows = effectRows({effects:[
    {type:'damageBonus',value:.3,target:'adjacent',attackType:'followUp',trigger:'appearance',duration:'spin'},
    {type:'selfDelete',afterAppearances:2,target:'self',trigger:'turnEnd',duration:'appearances'},
  ]});
  assert.match(rows[0].target,/仅追加攻击/);
  assert.match(rows[0].stacking,/同区增量相加/);
  assert.match(rows[1].trigger,/全部结算结束.*累计登场 2 次/);
  assert.match(rows[1].target,/参与本次全部结算后删除/);
});

test('live UI keeps solid card attributes outside the special skill description', () => {
  const source=readFileSync(new URL('../src/app.js', import.meta.url),'utf8');
  assert.match(source,/attributeMarkup\(c, symbol\)/);
  assert.match(source,/getCharacterAttributes\(symbol, view\)/);
  assert.match(source,/recruitable !== false/);
  assert.doesNotMatch(source,/支援格显示主职|不进行普通攻击|无普通攻击/);
  assert.match(mechanicExplanation('single').description,/直接读取该角色默认倍率/);
  assert.match(mechanicExplanation('synergy').description,/技能创建的角色同样参与/);
});
