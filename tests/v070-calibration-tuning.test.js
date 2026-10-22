import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,inspectSpin} from '../src/engine.js';
import {characterById} from '../src/content.js';
import {matchesEffectFilter} from '../src/effect-rules.js';
function probe(ids,cells,growth=0,ticks=0){const s=newGame({seed:'v070-specialization-check'});s.roster=ids.map((id,i)=>({id,uid:`x${i}`,stars:1,growth:i?0:growth,attackBonus:i?0:growth,ticks:i?0:ticks}));s.uidCounter=99;s.hp=50;s.enemies=Array.from({length:5},(_,col)=>({id:`t${col}`,col,hp:1e6,maxHp:1e6,attack:5,boss:false}));s.enemySkill={id:'none',name:'靶'};const layoutUids=Array(20).fill(null);cells.forEach((cell,i)=>layoutUids[cell]=`x${i}`);return inspectSpin(s,{layoutUids});}
for(const [id,special,other,cells,total,base] of [['1005','1008','1103',[6,7,11],.30,.15],['1006','1102','1201',[6,7,8],.32,.20]])test(`${id} preserves its narrow bonus and adds a lower same-tag base layer`,()=>{
 const on=probe([id,special,other],cells);
 const effects=characterById(id).effects.filter(e=>e.type==='vulnerability');
 const sum=unit=>effects.filter(e=>matchesEffectFilter(unit,e.filter)).reduce((n,e)=>n+e.value,0);
 assert.ok(Math.abs(sum({id:special,uid:'special'})-total)<1e-12);
 assert.ok(Math.abs(sum({id:other,uid:'other'})-base)<1e-12);
 assert.ok(on.state.lastSpin.effects.filter(e=>e.sourceUid==='x0'&&e.type==='vulnerability').length===2);
 const trained=probe([id,special,other],cells,12);const amount=trained.state.lastSpin.effects.filter(e=>e.sourceUid==='x0'&&e.type==='vulnerability').reduce((n,e)=>n+e.amount,0);
 assert.ok(Math.abs(amount-total)<.011,'permanent attack no longer silently scales vulnerability percentages');
});
test('Aeon Aha includes its own quantum tag but still requires adjacent matching-tag recipients',()=>{
 const on=probe(['aeon_star_aha','1201','1001'],[6,7,11]);
 assert.ok(on.state.lastSpin.effects.some(e=>e.sourceUid==='x0'&&e.targetUid==='x1'&&e.type==='damageBonus'));
 assert.ok(!on.state.lastSpin.effects.some(e=>e.sourceUid==='x0'&&e.targetUid==='x2'&&e.type==='damageBonus'));
});
test('Pearl trains on every second appearance without accelerating its third-appearance credit',()=>{
 const second=probe(['pearl','1304'],[6,11],0,1);
 assert.equal(second.state.roster.find(u=>u.uid==='x1').attackBonus,.4);
 assert.ok(!second.state.lastSpin.effects.some(e=>e.sourceUid==='x0'&&e.type==='coins'));
 const third=probe(['pearl','1304'],[6,11],0,2);
 assert.ok(third.state.lastSpin.effects.some(e=>e.sourceUid==='x0'&&e.type==='coins'&&e.amount===1));
 assert.equal(third.state.roster.find(u=>u.uid==='x1').attackBonus,0);
});
test('Fugue trades narrower attack shape for higher vulnerability than Dahlia',()=>{
 const narrow=characterById('fugue').effects.find(e=>e.type==='vulnerability');
 const broad=characterById('the_dahlia').effects.find(e=>e.type==='vulnerability');
 assert.equal(narrow.filter.attack,'blast');assert.ok(narrow.value>broad.value);
});
