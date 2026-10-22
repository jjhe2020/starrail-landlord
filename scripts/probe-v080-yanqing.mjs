import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {characterById} from '../src/content.js';
import {inspectSpin} from '../src/engine.js';
import {makeCardScenario,STAGES,ENEMY_SCENARIOS,interval} from '../src/balance-v080.js';
import {writeV070Report} from './v070-results-io.mjs';
const output=resolve(process.argv[2]||'docs/benchmarks/v080-final1-yanqing-condition.jsonl.gz');
const files=[...(await readdir(new URL('../src/',import.meta.url))).filter(f=>f.endsWith('.js')).sort().map(f=>`src/${f}`),'scripts/probe-v080-yanqing.mjs'];
const fingerprint=async()=>Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(new URL(`../${f}`,import.meta.url))).digest('hex')])));
const sourceHashes=await fingerprint(),rows=[],started=performance.now();
const scenarios=[{id:'edge-shield5',index:0,shield:5},{id:'edge-shield0',index:0,shield:0},{id:'interior-shield5',index:6,shield:5}];
for(let sample=0;sample<128;sample++)for(const background of ['generic','compatible'])for(const stage of STAGES)for(const scenario of scenarios){
 const {state,layoutUids}=makeCardScenario({focusId:'1209',sample,background,stage,enemy:ENEMY_SCENARIOS[0],seed:'v080-yanqing-shield-condition',split:'calibration'});
 state.shield=scenario.shield;const original=layoutUids.indexOf('focus');[layoutUids[original],layoutUids[scenario.index]]=[layoutUids[scenario.index],layoutUids[original]];
 state.board=layoutUids.map(uid=>uid?{...state.roster.find(u=>u.uid===uid)}:null);
 const full=inspectSpin(state,{layoutUids}),off=inspectSpin(state,{layoutUids,suppressSkillUids:['focus']});
 const focusDamage=result=>result.hits.filter(h=>h.sourceUid==='focus').reduce((n,h)=>n+h.amount,0);
 rows.push({sample,background,stage:stage.id,scenario:scenario.id,initialShield:state.shield,index:scenario.index,rosterIds:state.roster.map(u=>u.id),layoutUids,fullDamage:full.state.lastSpin.damage,offDamage:off.state.lastSpin.damage,damageAdded:full.state.lastSpin.damage-off.state.lastSpin.damage,focusDamageAdded:focusDamage(full)-focusDamage(off)});
}
const summary=[];for(const background of ['generic','compatible'])for(const stage of STAGES)for(const scenario of scenarios){const rs=rows.filter(r=>r.background===background&&r.stage===stage.id&&r.scenario===scenario.id);summary.push({background,stage:stage.id,scenario:scenario.id,n:rs.length,damageAdded:interval(rs.map(r=>r.damageAdded)),focusDamageAdded:interval(rs.map(r=>r.focusDamageAdded))});}
const sourceStable=JSON.stringify(sourceHashes)===JSON.stringify(await fingerprint());const report={gameVersion:'0.8.0',protocol:{version:'v080-yanqing-current-condition-v1',description:characterById('1209').description,correction:'Earlier full-HP probe used an obsolete assumption and does not cover the current skill. Its raw records remain retained; this probe supplies actual edge + shield>=5 conditions.',independentUnit:'layout group'},config:{mode:'condition-probe',samples:128,seed:'v080-yanqing-shield-condition',split:'calibration'},sourceHashes,sourceStable,scenarios,summary,elapsedMs:Math.round(performance.now()-started),rows,future:[]};
await writeV070Report(output,report);await writeFile(output.replace(/\.jsonl\.gz$/,'.summary.json'),JSON.stringify({...report,rows:undefined,future:undefined},null,2)+'\n');console.log(JSON.stringify({output,sourceStable,rows:rows.length,elapsedMs:report.elapsedMs,summary}));if(!sourceStable)process.exitCode=1;
