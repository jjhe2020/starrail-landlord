import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, CREATED_CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';
import { getSynergiesFor } from '../src/synergies.js';
import { retirementEligibility, getRetirementPreview } from '../src/retirements.js';

const instance = (id, uid, extra={}) => ({id,uid,stars:1,ticks:0,attackGrowth:0,...extra});

test('all recruitable characters have explicit card attributes and resolved skill parameters',()=>{
  assert.equal(CHARACTERS.length,90);
  for(const c of [...CHARACTERS,...CREATED_CHARACTERS]) {
    assert.equal(c.kitVersion,8,c.id);
    assert.ok(Number.isFinite(c.baseAttack)&&c.baseAttack>0,c.id);
    assert.equal(c.power,c.baseAttack,c.id);
    assert.equal(c.attack,c.normalAttack.pattern,c.id);
    for(const key of ['primary','adjacent','eachTarget'])assert.ok(Number.isFinite(c.normalAttack[key])&&c.normalAttack[key]>=0,c.id+'/'+key);
    assert.ok(c.normalAttack.primary+c.normalAttack.eachTarget>0,c.id+' can attack');
    assert.ok(!/常规攻击为(?:单体|扩散|群体)[，。]|待定|一定比例|伙伴|成长|临时角色|威力/.test(c.description),c.id);
  }
  const supportMultipliers=new Set(CHARACTERS.filter(c=>c.role!=='attack').map(c=>c.normalAttack.primary));
  assert.ok(supportMultipliers.has(.1)&&supportMultipliers.size>=7,'support ratios are individually designed, not restricted to 20-25%');
});

test('character healing and shielding have one attack coefficient and no hidden growth or star scaling',()=>{
  for(const c of CHARACTERS)for(const e of c.effects) {
    assert.equal(e.scaleWithTraining,undefined,c.id);
    if(['heal','shield','healOverflowShield'].includes(e.type)) {
      assert.equal(e.attackRatio,true,c.id);
      assert.ok(Number.isFinite(e.value)&&e.value>0,c.id);
      assert.equal(e.scaleWithStars,undefined,c.id);
    }
    if(e.type==='attackGrowth') {
      assert.ok(e.value>0&&e.duration==='run',c.id);
      for(const key of ['role','roleNot','temporary','commission'])assert.equal(e.filter?.[key],undefined,c.id+'/'+key);
    }
  }
});

test('follow-up attacks, buffs, linked events and enemy marks have explicit independent semantics',()=>{
  for(const c of CHARACTERS)for(const e of c.effects.filter(e=>e.type==='damage'))assert.equal(e.attackType,'followUp',c.id);
  for(const id of ['1107','1221']) {
    const e=characterById(id).effects[0];
    assert.equal(e.trigger,'afterEnemyAttack');assert.equal(e.snapshotConditions,'beforeEnemyAttack');assert.equal(e.oncePerSpin,true);
  }
  assert.equal(characterById('1223').effects[0].eventRange,'enemyColumn');
  assert.equal(characterById('1223').effects[0].target,'triggerEnemy');
  assert.equal(characterById('1301').effects[0].trigger,'afterNormalAttack');
  assert.equal(characterById('hysilens').effects[0].eventRange,'column');
  const wave=characterById('aventurine_waveflair').effects[0];
  assert.equal(wave.maxTriggersPerSpin,3);assert.equal(wave.oncePerTriggerUnit,true);
  assert.equal(characterById('1112').effects[0].type,'enemyVulnerability');
  assert.equal(characterById('1112').effects[0].attackType,'followUp');
  for(const id of ['sparxie','silver_wolf_lv999'])assert.equal(characterById(id).effects.find(e=>e.type==='power').per.metric,'lastTurnDeletions');
  for(const row of [...ITEMS,...ESSENCES])for(const e of row.effects)assert.equal(e.legacy,undefined,row.id+' is data-driven');
  const curio=ITEMS.find(c=>c.id==='elation_wax').effects[0];assert.equal(curio.type,'damageBonus');assert.equal(curio.attackType,'followUp');
  const essence=ESSENCES.find(c=>c.id==='essence_elation_wax');assert.equal(essence.progress.metric,'followUpAttacks');
});

test('Garmentmaker is a normal created character with a self-deletion skill and participates in identity counts',()=>{
  const g=characterById('garmentmaker');assert.ok(g);assert.equal(g.recruitable,false);
  assert.ok(!CHARACTERS.includes(g));assert.ok(CREATED_CHARACTERS.includes(g));
  assert.equal(g.effects[0].type,'selfDelete');assert.equal(g.effects[0].afterAppearances,2);
  const summon=characterById('1402').effects.find(e=>e.type==='summon');assert.equal(summon.characterId,'garmentmaker');assert.equal(summon.durationAppearances,undefined);
  const state={roster:[instance('1402','u1'),instance('garmentmaker','u2'),instance('garmentmaker','u3'),instance('1001','u4',{commission:'express_photography'})]};
  const memory=getSynergiesFor(state,characterById).find(s=>s.id==='remembrance');assert.equal(memory.count,2);assert.equal(memory.active,true);
  const astral=getSynergiesFor({...state,roster:[...state.roster,instance('1002','u5')]},characterById).find(s=>s.id==='astral');assert.equal(astral.count,2);
});

test('commission origin never removes investment protection or the last-copy protection',()=>{
  const source=instance('1003','u1',{commission:'express_photography'}),target=instance('1001','u2',{commission:'express_photography'});
  let state={roster:[source,target]};assert.equal(retirementEligibility(state,source,target).eligible,false);
  state.roster.push(instance('1001','u3'));
  assert.equal(retirementEligibility(state,source,target).eligible,true);
  assert.equal(retirementEligibility(state,source,{...target,attackGrowth:1.1}).eligible,false);
  assert.equal(retirementEligibility(state,source,{...target,attackGrowth:undefined,growth:1.1}).eligible,false);
  assert.equal(retirementEligibility(state,source,{...target,stars:2}).eligible,false);
  const preview=getRetirementPreview(state)[0];assert.match(preview.summary,/正常参与合成、羁绊和属性提升/);
  assert.ok(!/成长|临时角色|见习|威力/.test(preview.summary));
});
