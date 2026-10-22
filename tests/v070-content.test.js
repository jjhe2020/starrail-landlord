import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterById } from '../src/content.js';
import { effectIsEligible, effectTargetIndexes, matchesEffectFilter, adjacentIndexes } from '../src/effect-rules.js';
import { newGame, spin, validateSave } from '../src/engine.js';

const roles = ['attack','defense','amplifier','trainer','disruptor'];
const spatialMetrics = new Set(['neighbors','row','column','aligned','emptyNeighbors','edge','corner']);
const spatialTargets = new Set(['adjacent','row','column','aligned']);
const spatial = effect => spatialTargets.has(effect.target) || spatialTargets.has(effect.range) || ['adjacent','column','enemyColumn'].includes(effect.eventRange) || spatialMetrics.has(effect.per?.metric) || [effect.condition,...(effect.conditions || [])].some(condition => spatialMetrics.has(condition?.metric));
const instance = (id,index=0) => ({id,uid:'u'+(index+1),stars:1,ticks:4,growth:0});
function filters(effect) { return [effect.filter,effect.per?.filter,...[effect.condition,...(effect.conditions || [])].map(c=>c?.filter)].filter(Boolean); }
function inspectFilter(filter) {
  assert.ok(!('group' in filter) && !('groupsAny' in filter), JSON.stringify(filter));
  for (const child of filter.anyOf || []) inspectFilter(child);
  const valid=new Set(['path','pathNot','element','elementNot','faction','factionNot','attack','attackNot','role','roleNot','temporary','commission','excludeSelf','starsMin','starsMax','anyOf']);
  for(const key of Object.keys(filter)) assert.ok(valid.has(key),'unknown role filter '+key);
}
function fixture(ids,seed='v070-content',ticks=0) {
  const s=newGame({seed});
  s.roster=ids.map((id,index)=>({...instance(id,index),ticks}));s.uidCounter=ids.length+1;
  s.hp=20;s.shield=0;s.spinsLeft=80;s.encounter.deadline=80;
  s.items=[];s.essences=[];s.activeDebuffs=[];
  s.enemies=Array.from({length:5},(_,col)=>({id:'target-'+col,name:'训练靶',col,hp:100000,maxHp:100000,attack:0,boss:false}));
  s.enemySkill={id:'armor',name:'训练',description:'无词条'};
  return s;
}

// This is a design contract, not a claim that the numerical budgets are balanced.
test('all 90 kits retain public identities and five complementary roles without test strategy groups',()=>{
  assert.equal(CHARACTERS.length,90);
  assert.equal(new Set(CHARACTERS.map(c=>c.id)).size,90);
  assert.equal(new Set(CHARACTERS.map(c=>JSON.stringify(c.effects))).size,90,'each identity has a distinct kit');
  for(const c of CHARACTERS){
    assert.equal(c.kitVersion,8,c.id);
    assert.ok(roles.includes(c.role) && c.roleLabel,c.id);
    assert.ok(c.path && c.element && c.faction && c.sourceUrl,c.id);
    assert.equal(c.groups,undefined,c.id);
    assert.ok(c.effects.length && c.effects.every(e=>!e.legacy),c.id);
    assert.ok(c.description && !/待定|伙伴|成长|临时角色|威力/.test(c.description),c.id);
    for(const e of c.effects) for(const f of filters(e)){
      inspectFilter(f);
      assert.ok(CHARACTERS.some(other=>matchesEffectFilter({...instance(other.id,1),...(f.temporary?{temporary:2}:{})},f,instance(c.id))),c.id+': reachable public label filter');
    }
  }
  for(const role of roles) assert.ok(CHARACTERS.some(c=>c.role===role),role);
});

test('at least 90 percent of skill entries use actual spatial rules and every exception is explained',()=>{
  const all=CHARACTERS.flatMap(c=>c.effects.map(e=>({c,e})));
  const local=all.filter(({e})=>spatial(e));
  assert.ok(local.length/all.length>=.9,local.length+'/'+all.length);
  for(const {c,e} of all.filter(({e})=>!spatial(e))) assert.ok(e.globalException,c.id+'/'+e.summary);
  for(const c of CHARACTERS.filter(c=>c.role!=='attack')) assert.ok(c.effects.every(spatial),c.id+' utility must depend on position');
  assert.ok(all.some(({e})=>e.condition?.metric==='corner'),'corners have gameplay');
  assert.ok(all.some(({e})=>e.conditions?.some(c=>c.metric==='neighbors'&&c.op==='lte')),'isolation has gameplay');
  assert.ok(all.some(({e})=>e.per?.metric==='emptyNeighbors'),'empty neighboring cells have gameplay');
});

test('all roles have intrinsic attacks and support multipliers are individually smaller than carry baselines',()=>{
  const scalable=new Set(['heal','healOverflowShield','shield']);
  for(const c of CHARACTERS){
    if(c.role==='attack'){
      assert.ok(['single','blast','aoe'].includes(c.attack),c.id);
      assert.ok(c.baseAttack>=1.5&&c.baseAttack<=4,c.id);
    }else{
      assert.ok(['single','blast','aoe'].includes(c.attack),c.id);
      assert.ok(c.baseAttack>=1,c.id);
      assert.ok(c.normalAttack.primary<=.6,c.id);
      for(const e of c.effects){
        if(scalable.has(e.type))assert.equal(e.attackRatio,true,c.id+'/'+e.type);
        assert.equal(e.scaleWithTraining,undefined,c.id);
      }
    }
  }
  const s=fixture(CHARACTERS.filter(c=>c.role!=='attack').slice(0,20).map(c=>c.id));
  s.roster.forEach(u=>{u.growth=12;u.stars=3;});
  const result=spin(s);
  assert.ok(result.lastSpin.damage>0);
  assert.ok(validateSave(result));
});

test('all ten permanent attribute supports use public tags and a local range with equal character eligibility',()=>{
  const trainers=CHARACTERS.filter(c=>c.role==='trainer');
  assert.equal(trainers.length,10);
  const selfGrowers=[];
  for(const c of CHARACTERS) for(const e of c.effects.filter(e=>e.type==='attackGrowth')){
    assert.equal(e.scaleWithTraining,undefined,c.id);
    if(e.target==='self'){
      selfGrowers.push(c.id);
      assert.equal(c.role,'attack',c.id);
      assert.ok(e.every>=4 && e.value<=.15 && spatial(e),c.id);
      continue;
    }
    assert.equal(c.role,'trainer',c.id);
    assert.ok(spatialTargets.has(e.target),c.id);
    assert.ok(e.every>=2 && e.targetLimit>=1 && e.targetLimit<=2,c.id);
    assert.equal(e.filter.excludeSelf,true,c.id);
    assert.equal(e.filter.roleNot,undefined,c.id);
    assert.equal(e.filter.temporary,undefined,c.id);
    assert.equal(e.filter.commission,undefined,c.id);
    assert.equal(e.starFactors,undefined,c.id);
    assert.ok(e.filter.anyOf?.some(f=>f.path||f.element||f.faction),c.id);
  }
  assert.deepEqual(selfGrowers.sort(),['1002','1205','march_hunt'].sort());
});

test('amplifiers and enemy vulnerability act only on position-limited matching attacks',()=>{
  for(const c of CHARACTERS) for(const e of c.effects.filter(e=>e.type==='vulnerability'||c.role==='amplifier'&&['power','attackPercent','damageBonus'].includes(e.type))){
    assert.equal(e.filter.role,undefined,c.id);
    assert.ok(spatialTargets.has(e.target),c.id);
    if(e.selection==='strongest') assert.equal(e.targetLimit,1,c.id);
    if(e.type==='vulnerability')assert.ok(e.value>0&&e.value<=.4,c.id);
  }
  const source=instance('1101'), right=instance('1002',1), wrong=instance('1404',2);
  const state=fixture([]);state.board=Array(20).fill(null);
  state.board[6]=source;state.board[7]=right;state.board[5]=wrong;state.board[19]=instance('1002',3);
  const effect=characterById('1101').effects[0];
  assert.deepEqual(effectTargetIndexes(effect,{state,unit:source,index:6}),[7],'matching label outside adjacency gets no buff');
});

test('a real defender gains value from a matching adjacent cell and no value from a distant copy',()=>{
  let adjacent,distant;
  for(let i=0;i<200&&(!adjacent||!distant);i++){
    const result=spin(fixture(['1104','1102'],'v070-defender-'+i));
    const a=result.board.findIndex(u=>u?.id==='1104'),b=result.board.findIndex(u=>u?.id==='1102');
    if(adjacentIndexes(a).includes(b))adjacent=result;else distant=result;
  }
  assert.ok(adjacent&&distant);
  assert.equal(adjacent.lastSpin.shield,4);
  assert.equal(distant.lastSpin.shield,0);
});

test('a corner attack has a real corner gate rather than a roster-wide named partner check',()=>{
  const c=characterById('1013'),e=c.effects[0],unit={...instance(c.id),ticks:3};
  const state=fixture([]);state.board=Array(20).fill(null);
  state.board[0]=unit;
  assert.equal(effectIsEligible(e,{state,unit,index:0,trigger:'appearance'}),true);
  state.board[0]=null;state.board[6]=unit;
  assert.equal(effectIsEligible(e,{state,unit,index:6,trigger:'appearance'}),false);
});
