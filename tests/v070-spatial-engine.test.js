import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin } from '../src/engine.js';
import { spatialIndexes, effectMetric, effectTargetIndexes, matchesEffectFilter } from '../src/effect-rules.js';
import { ARCHETYPES, getArchetypes, withoutArchetypeEffects } from '../src/archetypes.js';

function fixture(ids) {
  const s = newGame({ seed: 'v070-intervention', difficulty: 10 });
  s.roster = ids.map((id,i) => ({ id, uid:`p${i}`, stars:1, ticks:0, growth:0 }));
  s.uidCounter = 100; s.hp = 50; s.shield = 0;
  s.enemies = Array.from({length:5},(_,col)=>({id:`e${col}`,col,hp:100000,maxHp:100000,attack:5,boss:false}));
  s.enemySkill={id:'canonical',name:'训练靶'};
  return s;
}
const layout = entries => { const a=Array(20).fill(null); for(const [index,uid] of entries)a[index]=uid;return a; };
test('spatial domains respect all edges and exclude the source from count metrics',()=>{
  assert.deepEqual(spatialIndexes('adjacent',4),[3,8,9]);
  assert.equal(spatialIndexes('row',6,{includeSelf:false}).length,4);
  assert.equal(spatialIndexes('column',6,{includeSelf:false}).length,3);
  assert.equal(spatialIndexes('aligned',6,{includeSelf:false}).length,7);
  const s=fixture(['1002','1202']);s.board=Array(20).fill(null);s.board[0]=s.roster[0];s.board[1]=s.roster[1];
  const ctx={state:s,unit:s.board[0],index:0};
  assert.equal(effectMetric('row',ctx),1);assert.equal(effectMetric('column',ctx),0);
  assert.equal(effectMetric('emptyNeighbors',ctx),2);assert.equal(effectMetric('corner',ctx),1);
  assert.equal(effectMetric('edge',{...ctx,index:6}),0);
});
test('anyOf is OR inside the outer AND, and strongest selection stays in its spatial range',()=>{
  const s=fixture(['1202','1002','1004','1102']);s.board=layout([]).map(()=>null);
  [0,1,19,6].forEach((index,j)=>s.board[index]=s.roster[j]);
  assert.equal(matchesEffectFilter(s.roster[1],{role:'attack',anyOf:[{path:'巡猎'},{element:'雷'}]}),true);
  assert.equal(matchesEffectFilter(s.roster[0],{role:'attack',anyOf:[{path:'同谐'},{element:'雷'}]}),false);
  const targets=effectTargetIndexes({target:'adjacent',selection:'strongest',targetLimit:1,filter:{role:'attack'}},{state:s,unit:s.roster[0],index:0,powers:Array(20).fill(0).map((_,i)=>i===19?999:i)});
  assert.deepEqual(targets,[6]);
});
test('diagnostic spin is immutable, seeded, and identical to public spin without interventions',()=>{
  const s=fixture(['1002','1001','1202']);const saved=structuredClone(s);
  assert.deepEqual(inspectSpin(s).state,spin(s));assert.deepEqual(s,saved);
  const options={layoutUids:layout([[0,'p0'],[1,'p1'],[19,'p2']])};
  const out=inspectSpin(s,options);assert.equal(out.diagnostics.protocol,'spin-interventions-v1');
  assert.deepEqual(out,inspectSpin(s,options));assert.deepEqual(s,saved);
  assert.equal(out.state.board[19].uid,'p2');assert.equal(out.state.roster[2].ticks,1);
  assert.equal(out.state.rngState,inspectSpin(s,{...options,suppressSkillUids:['p2']}).state.rngState);
  assert.throws(()=>inspectSpin(s,{layoutUids:layout([[0,'p0'],[1,'p0']])}),RangeError);
});
test('the same legal roster gives local amplifier benefit only to an adjacent matching attacker',()=>{
  const s=fixture(['1202','1002']);
  const near=inspectSpin(s,{layoutUids:layout([[0,'p0'],[1,'p1']])}).state;
  const far=inspectSpin(s,{layoutUids:layout([[0,'p0'],[19,'p1']])}).state;
  assert.ok(near.lastSpin.effects.some(e=>e.sourceUid==='p0'&&e.targetUid==='p1'&&e.type==='powerMultiplier'));
  assert.ok(!far.lastSpin.effects.some(e=>e.sourceUid==='p0'&&e.type==='powerMultiplier'));
  const off=inspectSpin(s,{layoutUids:layout([[0,'p0'],[1,'p1']]),suppressSkillUids:['p0']}).state;
  assert.ok(near.lastSpin.damage>off.lastSpin.damage);
});
test('vulnerability follows only matching attackers in the disruptor column',()=>{
  const s=fixture(['1106','1107','1107']);
  const options={layoutUids:layout([[0,'p0'],[5,'p1'],[19,'p2']])};
  const on=inspectSpin(s,options),off=inspectSpin(s,{...options,suppressSkillUids:['p0']});
  const damage=(result,uid)=>result.hits.filter(h=>h.sourceUid===uid).reduce((a,h)=>a+h.damage,0);
  assert.ok(on.state.lastSpin.effects.some(e=>e.sourceId==='1106'&&e.type==='vulnerability'));
  assert.ok(on.state.lastSpin.damage>off.state.lastSpin.damage);
  // A second identical attacker outside the source column receives no extra damage.
  assert.deepEqual(on.hits.filter(h=>h.cell===19),off.hits.filter(h=>h.cell===19));
});
test('internal routes grant no effects or special core status at any coverage threshold',()=>{
  for(const route of ARCHETYPES){
    assert.equal(route.coreRequired,0);assert.deepEqual(route.coreIds,[]);assert.deepEqual(route.effects,[]);
    const s=fixture(route.memberIds.slice(0,route.threshold));
    assert.ok(getArchetypes(s).find(r=>r.id===route.id).formed);
    assert.deepEqual(spin(s),withoutArchetypeEffects(()=>spin(s)));
    assert.ok(!spin(s).lastSpin.effects.some(e=>e.sourceId===route.id));
  }
});
