import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, inspectSpin, spin, skipReward, chooseReward, validateSave, getCharacterAttributes } from '../src/engine.js';
import { CHARACTERS, characterById } from '../src/content.js';
import { enemyDebuffById, publicDebuff } from '../src/enemy-effects.js';
import { trainingMultiplier } from '../src/effect-rules.js';
const fx = (type,value,extra={})=>({type,value,trigger:'appearance',target:'self',summary:'测试规则',...extra});
function withKits(specs,fn) {
 const copies=specs.map(([id,kit])=>{const c=characterById(id),old=structuredClone(c); Object.assign(c,{kitVersion:8,baseAttack:10,baseAttackByStar:[0,10,30,90],normalAttack:{pattern:'single',primary:1,adjacent:0,eachTarget:0},path:'测试',faction:'测试',element:'测试',role:'attack',effects:[],...kit}); return[c,old];});
 try{return fn();}finally{for(const[c,old]of copies){for(const k of Object.keys(c))delete c[k];Object.assign(c,old);}}
}
function fixture(ids,slots=ids.map((_,i)=>i+5)) {
 const s=newGame({seed:'v080-fixed'});s.roster=ids.map((id,i)=>({id,uid:`u${i+1}`,stars:1,ticks:0,attackBonus:0,growth:0}));s.uidCounter=ids.length+1;s.board=Array(20).fill(null);s.activeDebuffs=[];s.bossStage=0;s.hp=20;
 s.enemies=Array.from({length:5},(_,col)=>({id:`e${col}`,name:'测试敌人',col,hp:10000,maxHp:10000,attack:0,boss:false}));
 s.enemySkill={id:'pressure',name:'测试',description:'测试'};
 const layoutUids=Array(20).fill(null);slots.forEach((slot,i)=>layoutUids[slot]=s.roster[i].uid);return{s,layoutUids};
}
const run=({s,layoutUids},options={})=>inspectSpin(s,{layoutUids,...options});
const damage=(r,id,type='normal')=>r.hits.filter(h=>h.sourceId===id&&h.attackType===type).reduce((sum,h)=>sum+h.amount,0);

test('card intrinsic coefficients apply to all roles and stay outside skill effects',()=>withKits([
 ['1001',{role:'defense',normalAttack:{pattern:'single',primary:.1}}],['1002',{}]
],()=>{const f=fixture(['1001','1002']);const r=run(f);assert.equal(damage(r,'1001'),1);assert.equal(damage(r,'1002'),10);assert.equal(trainingMultiplier({...f.s.roster[0],attackBonus:30,growth:30}),1);assert.ok(validateSave(r.state));}));

test('same-axis sums and cross-axis products apply independently to normal and follow-up damage',()=>withKits([
 ['1001',{effects:[fx('attackPercent',.2),fx('attackPercent',.3),fx('damageBonus',.2),fx('damageBonus',.3),fx('damageBonus',.25,{attackType:'followUp'}),fx('enemyVulnerability',.2,{target:'nearest'}),fx('damage',1,{scaleWithSourcePower:true,attackType:'followUp',stage:'afterAttacks'})]}]
],()=>{const r=run(fixture(['1001']));assert.equal(r.state.lastSpin.values[5],15);assert.equal(damage(r,'1001'),27);assert.equal(damage(r,'1001','followUp'),31.5);assert.equal(r.state.lastSpin.followUpAttacks,1);}));

test('healing and shields use ATK and their own coefficients, excluding damage and vulnerability',()=>withKits([
 ['1001',{effects:[fx('heal',.5,{attackRatio:true}),fx('shield',.8,{attackRatio:true}),fx('damageBonus',2),fx('enemyVulnerability',.5,{target:'nearest'})]}],
 ['1002',{effects:[fx('attackPercent',.5,{target:'adjacent'})]}]
],()=>{const r=run(fixture(['1001','1002']));assert.equal(r.state.lastSpin.healing,7.5);assert.equal(r.state.lastSpin.shield,12);assert.equal(r.state.lastSpin.values[5],15);}));

test('permanent ATK is direct and applies equally to attack, healing and shield with no hidden training cap',()=>withKits([
 ['1001',{role:'healer',effects:[fx('heal',1,{attackRatio:true}),fx('shield',1,{attackRatio:true})]}],
 ['1002',{effects:[fx('attackGrowth',2,{target:'adjacent'})]}]
],()=>{const f=fixture(['1001','1002']);f.s.roster[0].attackBonus=20;f.s.roster[0].growth=20;const r=run(f);assert.equal(r.state.roster[0].attackBonus,22);assert.equal(r.state.lastSpin.healing,32);assert.equal(r.state.lastSpin.shield,32);assert.equal(damage(r,'1001'),32);}));

test('star and permanent default attack coefficient changes are intrinsic and do not multiply healing twice',()=>withKits([
 ['1001',{effects:[fx('heal',1,{attackRatio:true})]}]
],()=>{const f=fixture(['1001']);Object.assign(f.s.roster[0],{stars:2,attackBonus:2,growth:2,normalAttackBonus:{primary:.25}});assert.equal(getCharacterAttributes(f.s.roster[0]).normalAttack.primary,1.25);const r=run(f);assert.equal(damage(r,'1001'),40);assert.equal(r.state.lastSpin.healing,32);}));

test('normal-attack links require the public filter and range, are capped and never trigger each other',()=>withKits([
 ['1001',{effects:[fx('damage',.5,{trigger:'afterNormalAttack',scaleWithSourcePower:true,attackType:'followUp',eventRange:'adjacent',eventFilter:{excludeSelf:true,element:'测试'},maxTriggersPerSpin:2,oncePerTriggerUnit:true})]}],
 ['1002',{}],['1013',{}]
],()=>{const f=fixture(['1001','1002','1013','1002'],[6,5,7,1]);const r=run(f);const hits=r.hits.filter(h=>h.sourceId==='1001'&&h.attackType==='followUp');assert.equal(hits.length,2);assert.equal(damage(r,'1001','followUp'),10);assert.equal(new Set(r.hits.map(h=>h.eventId)).size,6);assert.deepEqual(r.state,run(f).state);}));

test('enemy-column link observes actual normal hit columns and does not retarget a dead column',()=>withKits([
 ['1001',{effects:[fx('damage',.5,{trigger:'afterNormalAttack',target:'triggerEnemy',scaleWithSourcePower:true,attackType:'followUp',eventRange:'enemyColumn',eventFilter:{excludeSelf:true},oncePerSpin:true})]}],['1002',{}]
],()=>{const f=fixture(['1001','1002'],[10,5]);let r=run(f);assert.equal(damage(r,'1001','followUp'),5);f.s.enemies[0].hp=5;r=run(f);assert.equal(damage(r,'1001','followUp'),0);}));

test('counterattack checks pre-enemy shield, triggers after full shield block, and never resurrects a fatal hit',()=>withKits([
 ['1001',{effects:[fx('damage',1,{trigger:'afterEnemyAttack',stage:'afterEnemyAttack',per:{metric:'sourcePower'},attackType:'followUp',condition:{metric:'shield',value:8},oncePerSpin:true,snapshotConditions:'beforeEnemyAttack'})]}]
],()=>{const f=fixture(['1001']);f.s.shield=10;f.s.enemies[0].attack=10;let r=run(f);assert.equal(r.state.hp,20);assert.equal(r.state.shield,0);assert.equal(damage(r,'1001','followUp'),10);assert.equal(r.hits.at(-1).stage,'afterRetaliation');f.s.enemies[0].attack=50;r=run(f);assert.equal(r.state.hp,0);assert.equal(damage(r,'1001','followUp'),0);f.s.enemies[0].attack=0;r=run(f);assert.equal(damage(r,'1001','followUp'),0);}));

test('target vulnerability benefits every matching attack source and keeps the original enemy identity',()=>withKits([
 ['1001',{effects:[fx('enemyVulnerability',.25,{target:'nearest',attackType:'followUp'})]}],
 ['1002',{effects:[fx('damage',1,{attackType:'followUp',scaleWithSourcePower:true,stage:'afterAttacks'})]}]
],()=>{const f=fixture(['1001','1002'],[5,10]);const r=run(f);assert.equal(damage(r,'1002'),10);assert.equal(damage(r,'1002','followUp'),12.5);f.s.enemies[0].hp=5;const dead=run(f);assert.equal(damage(dead,'1002','followUp'),10);}));

test('one AoE follow-up is one event even when it hits five enemies',()=>withKits([
 ['1001',{effects:[fx('damage',.5,{attackType:'followUp',scaleWithSourcePower:true,stage:'afterAttacks',target:'all'})]}]
],()=>{const r=run(fixture(['1001']));const hits=r.hits.filter(h=>h.attackType==='followUp');assert.equal(hits.length,5);assert.equal(new Set(hits.map(h=>h.eventId)).size,1);assert.equal(r.state.lastSpin.followUpAttacks,1);}));

test('percentage enemy reduction adds before fixed reduction and both documented caps apply',()=>withKits([
 ['1001',{effects:[fx('retaliationMultiplier',.6),fx('retaliationMultiplier',.6),fx('retaliationFlat',100)]}]
],()=>{const f=fixture(['1001']);f.s.enemies[0].attack=100;const r=run(f);assert.equal(r.state.lastSpin.incoming,22);}));

test('created characters receive normal permanent buffs, act on their final appearance and then delete',()=>withKits([
 ['1001',{effects:[fx('attackGrowth',2,{target:'adjacent'})]}]
],()=>{const f=fixture(['garmentmaker','1001']);f.s.roster[0].ticks=1;const r=run(f);assert.equal(r.state.roster.some(u=>u.id==='garmentmaker'),false);assert.equal(r.state.lastTurnDeletions,1);assert.ok(damage(r,'garmentmaker')>0);assert.ok(r.state.lastSpin.effects.some(e=>e.type==='attackGrowth'&&e.targetUid==='u1'));assert.ok(validateSave(r.state));}));

test('previous-turn deletions cannot be borrowed from the current turn',()=>withKits([
 ['1001',{effects:[fx('power',2,{per:{metric:'lastTurnDeletions',cap:3}})]}]
],()=>{const f=fixture(['1001','garmentmaker']);f.s.roster[1].ticks=1;const first=run(f);assert.equal(first.state.lastSpin.values[5],10);const s=skipReward(first.state);const second=inspectSpin(s,{layoutUids:Array.from({length:20},(_,i)=>i===5?'u1':null)});assert.equal(second.state.lastSpin.values[5],12);assert.equal(second.state.lastTurnDeletions,0);}));

test('a real Aglaea creation can merge three characters without resetting their appearances',()=>{
 const ids=['1402','1407',...CHARACTERS.slice(0,18).map(c=>c.id),'garmentmaker','garmentmaker'];
 const f=fixture(ids,Array.from({length:20},(_,i)=>i));f.s.roster[0].ticks=3;
 for(const u of f.s.roster.filter(u=>u.id==='garmentmaker'))Object.assign(u,{ticks:1,origin:'u1',attackPercentBonus:.1,normalAttackBonus:{primary:.1}});
 assert.ok(validateSave(f.s));
 const r=run(f).state,created=r.roster.filter(u=>u.id==='garmentmaker');assert.equal(created.length,1);
 const u=created[0];assert.equal(u.stars,2);assert.equal(u.ticks,1);assert.equal(u.attackPercentBonus,.2);assert.equal(u.normalAttackBonus.primary,.2);assert.ok(validateSave(r));
 const next=inspectSpin(skipReward(r),{layoutUids:Array.from({length:20},(_,i)=>i===5?u.uid:null)});assert.equal(next.state.roster.some(u=>u.id==='garmentmaker'),false);
});

test('version-two saves migrate direct attributes and explicit deletion rules without rerolling',()=>{
 const s=newGame({seed:'migration'});s.version=2;delete s.lastTurnDeletions;for(const u of [...s.roster,...s.board.filter(Boolean)]){delete u.attackBonus;u.growth=2;}
 s.roster[0].temporary=2;s.roster[0].ticks=1;const before=structuredClone(s);const r=validateSave(s);assert.ok(r);assert.equal(r.version,3);assert.equal(r.roster[0].attackBonus,2);assert.equal(r.roster[0].deleteAfterAppearances,3);assert.equal(r.roster[0].temporary,undefined);assert.equal(r.rngState,s.rngState);assert.deepEqual(s,before);assert.deepEqual(r.enemies,s.enemies);
});

test('diagnostic and real spins are byte-identical and do not mutate input',()=>{const s=newGame({seed:'immutability'});const old=structuredClone(s);assert.deepEqual(inspectSpin(s).state,spin(s));assert.deepEqual(s,old);});


test('strongest selection uses a single pre-turn permanent-attribute snapshot regardless of source order',()=>withKits([
 ['1001',{baseAttack:9,baseAttackByStar:[0,9,27,81],effects:[fx('attackGrowth',5)]}],
 ['1002',{}],
 ['1003',{baseAttack:1,baseAttackByStar:[0,1,3,9],effects:[fx('attackPercent',.5,{target:'strongest',range:'adjacent'})]}]
],()=>{
 for(const slots of [[5,7,6],[7,5,6]]){
  const r=run(fixture(['1001','1002','1003'],slots));
  assert.equal(r.state.roster[0].attackBonus,5);
  const chosen=r.state.lastSpin.effects.find(e=>e.sourceId==='1003'&&e.type==='attackPercent');
  assert.equal(chosen.targetUid,'u2','A becomes 14 ATK this turn but B was highest at the pre-turn checkpoint');
 }
}));

test('jammer reduces actual attack after buffs, including attack-ratio healing and shield',()=>withKits([
 ['1001',{effects:[fx('attackPercent',.5),fx('heal',1,{attackRatio:true}),fx('shield',1,{attackRatio:true})]}]
],()=>{
 const f=fixture(['1001'],[7]);f.s.round=2;f.s.enemySkill={id:'jammer',name:'禁锢矩阵',description:'测试'};
 const r=run(f);assert.equal(r.state.lastSpin.values[7],7.5);assert.equal(r.state.lastSpin.healing,7.5);assert.equal(r.state.lastSpin.shield,7.5);assert.equal(damage(r,'1001'),7.5);
 const p=r.state.lastSpin.powerBreakdown[7];assert.equal(p.attackPenalty,.5);assert.equal(p.flatBonus,0);assert.ok(validateSave(r.state));
}));

test('star audit breakdown preserves permanent percent without duplicating the base penalty',()=>withKits([
 ['1001',{}]
],()=>{
 const f=fixture(['1001']);Object.assign(f.s.roster[0],{stars:2,attackBonus:2,growth:2,attackPercentBonus:.25});f.s.activeDebuffs=[publicDebuff(enemyDebuffById('star_audit'),'difficulty',0)];
 const r=run(f),p=r.state.lastSpin.powerBreakdown[5];assert.equal(p.star,24);assert.equal(p.permanent,2);assert.equal(p.permanentPercent,.25);assert.equal(p.flatBonus,0);assert.equal(p.final,32.5);
 assert.equal((p.star+p.permanent+p.flatBonus)*(1+p.permanentPercent+p.attackPercent)*p.attackPenalty,p.final);assert.ok(validateSave(r.state));
}));


test('version-two essence migration preserves unchanged progress and rescales changed progress proportionally',()=>{
 const s=newGame({seed:'essence-migration'});s.version=2;delete s.lastTurnDeletions;
 for(const u of s.roster)delete u.attackBonus;
 s.essences=[{id:'essence_elation',progress:80,triggered:false},{id:'essence_elation_wax',progress:2,triggered:false,baseline:1}];
 const r=validateSave(s);assert.ok(r);assert.equal(r.essences[0].progress,80);assert.equal(r.essences[1].progress,6);assert.equal(r.essences[1].baseline,undefined);assert.ok(validateSave(r));
 s.essences[1]={id:'essence_elation_wax',progress:4,triggered:true};
 assert.deepEqual(validateSave(s).essences[1],{id:'essence_elation_wax',progress:12,triggered:true});
 s.essences[1].progress=5;assert.equal(validateSave(s),null);
});


test('permanent and turn attack percentages add in the same attack zone after fixed bonuses',()=>withKits([
 ['1001',{effects:[fx('attackPercent',.5),fx('power',2),fx('heal',1,{attackRatio:true})]}]
],()=>{
 const f=fixture(['1001']);f.s.roster[0].attackPercentBonus=.25;
 assert.equal(getCharacterAttributes(f.s.roster[0]).attack,12.5);
 const r=run(f);assert.equal(r.state.lastSpin.values[5],21);assert.equal(r.state.lastSpin.healing,21);assert.equal(damage(r,'1001'),21);
 const p=r.state.lastSpin.powerBreakdown[5];assert.equal(p.flatBonus,2);assert.equal(p.permanentPercent,.25);assert.equal(p.attackPercent,.5);assert.equal(p.multiplier,1.75);assert.ok(validateSave(r.state));
}));
