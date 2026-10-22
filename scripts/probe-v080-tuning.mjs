import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {characterById} from '../src/content.js';
import {inspectSpin} from '../src/engine.js';
import {runCardSample,makeCardScenario,STAGES,ENEMY_SCENARIOS,interval} from '../src/balance-v080.js';
import {writeV070Report} from './v070-results-io.mjs';

// A declared parameter intervention inside a private process. The production
// source files remain unchanged; each arm and its exact values are retained.
const output=resolve(process.argv[2]||'docs/benchmarks/v080-final-tuning-probe.jsonl.gz');
const files=[...(await readdir(new URL('../src/',import.meta.url))).filter(f=>f.endsWith('.js')).sort().map(f=>`src/${f}`),'scripts/probe-v080-tuning.mjs'];
const fingerprint=async()=>Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(new URL(`../${f}`,import.meta.url))).digest('hex')])));
const sourceHashes=await fingerprint(),rows=[],started=performance.now(),summary=[];
const changes=[{id:'aventurine_waveflair',before:{baseAttack:2,primary:.1},after:{baseAttack:2.5,primary:3}},{id:'1110',before:{heal:2,shield:1.25},after:{heal:1.5,shield:1}}];
function setValues(character,values){
  if(values.baseAttack!==undefined){character.baseAttack=values.baseAttack;character.power=values.baseAttack;character.baseAttackByStar=[0,values.baseAttack,3*values.baseAttack,9*values.baseAttack];character.normalAttack.primary=values.primary;}
  for(const type of ['heal','shield'])if(values[type]!==undefined)character.effects.find(e=>e.type===type).value=values[type];
}
for(const change of changes){
  const character=characterById(change.id),original=structuredClone(character),pairs=[];
  try{
    for(let sample=0;sample<32;sample++)for(const background of ['generic','compatible'])for(const stage of STAGES)for(const enemy of ENEMY_SCENARIOS){
      const pair={sample,background,stage:stage.id,enemy:enemy.id,focusId:change.id};
      for(const arm of ['before','after']){setValues(character,change[arm]);pair[arm]=runCardSample({seed:'v080-migration1',split:'calibration',sample,background,stage,enemy,focusId:change.id});}
      pairs.push(pair);rows.push({kind:'parameter-pair',...pair});
    }
  }finally{Object.assign(character,original);}
  for(const background of ['generic','compatible']){
    const bySample=Array.from({length:32},(_,sample)=>pairs.filter(r=>r.sample===sample&&r.background===background));
    const mean=(rs,get)=>rs.reduce((n,r)=>n+get(r),0)/rs.length;
    const metrics={presenceDamage:r=>r.presence.damage,skillDamage:r=>r.delta.damage,netHpSaved:r=>-r.delta.hpLost,shieldRemaining:r=>r.delta.shieldRemaining,healing:r=>r.delta.healing};
    summary.push({focusId:change.id,name:character.name,background,n:32,metrics:Object.fromEntries(Object.entries(metrics).map(([key,get])=>[key,{before:interval(bySample.map(rs=>mean(rs,r=>get(r.before)))),after:interval(bySample.map(rs=>mean(rs,r=>get(r.after)))),pairedChange:interval(bySample.map(rs=>mean(rs,r=>get(r.after)-get(r.before))))}]))});
  }
}
// The standard card panel intentionally starts at half HP. Its zero Yanqing
// full-HP proc is a fixture limitation, not a claim that the skill is inactive.
const fullHp=[];
for(let sample=0;sample<128;sample++)for(const background of ['generic','compatible'])for(const stage of STAGES){
  const {state,layoutUids}=makeCardScenario({focusId:'1209',sample,background,stage,enemy:ENEMY_SCENARIOS[0],seed:'v080-full-hp-probe',split:'calibration'});state.hp=state.maxHp;
  const full=inspectSpin(state,{layoutUids}),off=inspectSpin(state,{layoutUids,suppressSkillUids:['focus']});
  const row={kind:'full-hp-condition',focusId:'1209',sample,background,stage:stage.id,rosterIds:state.roster.map(u=>u.id),layoutUids,damageAdded:full.state.lastSpin.damage-off.state.lastSpin.damage,focusDamageAdded:full.hits.filter(h=>h.sourceUid==='focus').reduce((s,h)=>s+h.amount,0)-off.hits.filter(h=>h.sourceUid==='focus').reduce((s,h)=>s+h.amount,0)};
  rows.push(row);fullHp.push(row);
}
const conditionSummary=[];for(const background of ['generic','compatible'])for(const stage of STAGES)conditionSummary.push({focusId:'1209',background,stage:stage.id,damageAdded:interval(fullHp.filter(r=>r.background===background&&r.stage===stage.id).map(r=>r.damageAdded))});
const sourceStable=JSON.stringify(sourceHashes)===JSON.stringify(await fingerprint());
const report={gameVersion:JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version,protocol:{version:'v080-declared-parameter-probe-v1',independentUnit:'layout group',samples:32,conditionSamples:128,note:'Before/after parameter values on the SAME final engine. One focus character parameter intervention at a time; other characters retain final values. This is calibration evidence, not holdout.'},config:{mode:'parameter-probe',seed:'v080-migration1',split:'calibration'},sourceHashes,sourceStable,changes,summary,conditionSummary,elapsedMs:Math.round(performance.now()-started),rows,future:[]};
await writeV070Report(output,report);await writeFile(output.replace(/\.jsonl\.gz$/,'.summary.json'),JSON.stringify({...report,rows:undefined,future:undefined},null,2)+'\n');
console.log(JSON.stringify({output,rows:rows.length,sourceStable,elapsedMs:report.elapsedMs,summary,conditionSummary}));
if(!sourceStable)process.exitCode=1;
