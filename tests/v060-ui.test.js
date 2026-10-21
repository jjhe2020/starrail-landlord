// Role/training presentation introduced in 0.6 now explains the public-tag,
// position-limited rules used by the current version.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterById } from '../src/content.js';
import { characterBindings, characterRole, effectFilterLabel, effectRows, trainingSummary } from '../src/effect-info.js';
import { mechanicExplanation } from '../src/mechanics.js';

test('training recipients explain public OR labels, local range, exclusions and limits',()=>{
  const row=effectRows(characterById('1009'))[0];
  assert.match(row.target,/相邻八格/);
  assert.match(row.target,/火或巡猎/);
  assert.match(row.target,/非永久培养主职/);
  assert.match(row.target,/排除自身/);
  assert.match(row.target,/排除见习/);
  assert.match(row.target,/永久角色/);
  assert.match(row.target,/最多2名/);
  assert.match(row.trigger,/每 3 次/);
  assert.match(row.scaling,/培养量不被培养自身放大/);
  assert.match(row.scaling,/温和星级.*1 \/ 1\.5 \/ 2/);
  assert.doesNotMatch(row.target,/express|puppet|trainer|undefined|绑定组/);
  const targeted=effectRows(characterById('1207'))[0];
  assert.match(targeted.target,/相邻八格.*范围内优先威力最高者.*最多1名/);
});

test('nonattacker training shows real support conversion and never implies attack power',()=>{
  const defense=CHARACTERS.find(c=>c.role==='defense'),trainer=CHARACTERS.find(c=>c.role==='trainer'),attack=CHARACTERS.find(c=>c.role==='attack');
  assert.match(trainingSummary(defense,5),/职能培养 \+5.*×1.4/);
  assert.match(trainingSummary(defense,200),/×1.96/);
  assert.match(trainingSummary(trainer,200),/不接受永久培养.*不自乘/);
  assert.equal(trainingSummary(attack,5),'攻击成长 +5');
  assert.match(mechanicExplanation('power').description,/支援格显示主职，没有普通攻击/);
  assert.ok(effectRows(defense).some(row=>row.scaling.includes('职能培养')));
});

test('vulnerability and spatial defense explain actual attacker range and reduction caps',()=>{
  const row=effectRows(characterById('1106'))[0];
  assert.match(row.target,/仅同列四格的攻击者伤害受益/);
  assert.match(row.target,/冰或贝洛伯格/);
  assert.match(row.stacking,/75%/);
  const gate=effectRows(characterById('1208'))[1];
  assert.match(gate.conditions,/同行其他人数至少2/);
  const reduction=effectRows({effects:[{type:'retaliationFlat',duration:'spin'},{type:'retaliationMultiplier',duration:'spin'}]});
  assert.match(reduction[0].stacking,/基础反击的45%/);
  assert.match(reduction[1].stacking,/最多减60%.*0.4/);
  const scaled=effectRows({effects:[{type:'damage',duration:'spin',scaleWithSourcePower:true},{type:'retaliationMultiplier',duration:'spin',scaleWithTraining:true}]});
  assert.match(scaled[0].scaling,/来源最终攻击威力/);
  assert.match(scaled[1].scaling,/只放大倍率相对1的增益或减伤部分/);
});

test('all 90 characters expose readable professions and position rules without test strategy groups',()=>{
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
