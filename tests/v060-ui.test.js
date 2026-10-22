// Historical file name retained: presentation contracts now follow 0.8 rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterById } from '../src/content.js';
import { characterBindings, characterRole, effectFilterLabel, effectRows, trainingSummary } from '../src/effect-info.js';
import { mechanicExplanation } from '../src/mechanics.js';

test('permanent attribute recipients explain public OR labels, local range and limits',()=>{
  const row=effectRows(characterById('1009'))[0];
  assert.match(row.target,/相邻八格/);
  assert.match(row.target,/火或巡猎/);
  assert.match(row.target,/排除自身/);
  assert.match(row.target,/最多2名/);
  assert.match(row.trigger,/每 3 次/);
  assert.match(row.scaling,/直接增加目标攻击力/);
  assert.doesNotMatch(row.scaling,/培养效能|8%/);
  assert.doesNotMatch(row.target,/express|puppet|trainer|undefined|绑定组|临时角色|见习/);
  const targeted=effectRows(characterById('1207'))[0];
  assert.match(targeted.target,/相邻八格.*范围内优先攻击力最高者.*最多1名/);
});

test('every profession uses explicit permanent attack rather than hidden utility conversion',()=>{
  for(const role of ['attack','defense','trainer']){
    const character=CHARACTERS.find(c=>c.role===role);
    assert.equal(trainingSummary(character,5),'本局永久攻击力 +5');
    assert.equal(trainingSummary(character,200),'本局永久攻击力 +200');
  }
  assert.match(mechanicExplanation('power').description,/每名角色都有默认攻击/);
  assert.doesNotMatch(mechanicExplanation('support').description,/没有普通攻击|8%|12点/);
});

test('enemy vulnerability and spatial defense explain actual targets and reduction order',()=>{
  const row=effectRows(characterById('1106'))[0];
  assert.match(row.target,/最近存活敌人/);
  assert.match(row.conditions,/同列|同行|冰或贝洛伯格/);
  assert.match(row.stacking,/75%/);
  const reduction=effectRows({effects:[{type:'retaliationFlat',duration:'spin'},{type:'retaliationMultiplier',duration:'spin'}]});
  assert.match(reduction[0].stacking,/比例减伤后剩余伤害的45%/);
  assert.match(reduction[1].stacking,/最多降低60%.*先比例降低，再固定/);
  const scaled=effectRows({effects:[{type:'damage',duration:'spin',scaleWithSourcePower:true}]});
  assert.match(scaled[0].scaling,/来源当前攻击力.*独立倍率/);
});

test('all recruitable characters expose readable professions and public position rules',()=>{
  for(const c of CHARACTERS){
    assert.match(characterRole(c),/[\u3400-\u9fff]/u);
    assert.deepEqual(characterBindings(c),[],c.name+' has no invented mechanical group');
    for(const row of effectRows(c)){
      const text=`${row.target} ${row.conditions} ${row.scaling}`;
      assert.doesNotMatch(text,/undefined|NaN|groupsAny|roleNot|anyOf|emptyNeighbors/,c.name);
      assert.doesNotMatch(text,/星穹远行|筑城守望|仙舟授业|追加投资|虚无引爆|忆灵共演|击破接力/,c.name);
    }
  }
  assert.equal(effectFilterLabel({ids:['1001','1002']}),'三月七、丹恒');
  assert.match(effectFilterLabel({role:'attack',anyOf:[{path:'巡猎'},{element:'火'}]}),/攻击.*巡猎或火/);
});
