import { execFileSync } from 'node:child_process';
import { mkdtemp,mkdir,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,dirname,resolve } from 'node:path';
import { pathToFileURL,fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as instrumented from '../src/engine.js';
const BASE='1b3a13b3eedf36ac1eb5f906332e62a4687ce93f';
const digest=value=>createHash('sha256').update(value).digest('hex');
export async function verifyEngineParity({output}={}) {
 const temporary=await mkdtemp(join(tmpdir(),'matrix-v081-engine-'));let report;
 try{
  const names=execFileSync('git',['ls-tree','-r','--name-only',BASE,'src'],{encoding:'utf8'}).trim().split('\n').filter(name=>name.endsWith('.js'));
  for(const name of names){await mkdir(dirname(join(temporary,name)),{recursive:true});await writeFile(join(temporary,name),execFileSync('git',['show',`${BASE}:${name}`]));}
  await writeFile(join(temporary,'package.json'),'{"type":"module"}\n');const baseline=await import(pathToFileURL(join(temporary,'src/engine.js')).href);const runs=[];let comparisons=0;
  for(const difficulty of [1,10,20])for(let world=0;world<16;world++){
   const seed=`observer-parity-v1:D${difficulty}:W${world}`;let old=baseline.newGame({seed,difficulty}),now=instrumented.newGame({seed,difficulty}),actions=0,value=world+41*difficulty+1,rollWindow='';
   const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
   const same=()=>{comparisons++;if(JSON.stringify(old)!==JSON.stringify(now))throw Error(`Released/instrumented engine differs at ${seed} action ${actions}`);};same();
   while(!['victory','defeat'].includes(old.phase)&&actions<1000){
    let action,args=[];
    if(old.phase==='ready'){
     const polluted=old.activeDebuffs.find(d=>d.targetUid&&old.roster.some(u=>u.uid===d.targetUid));
     if(polluted&&old.removals>0){action='removeSymbol';args=[polluted.targetUid];}
     else if(old.hp<65&&old.coins>=12&&old.supplyPurchases<2){action='purchaseSupply';args=['repair'];}
     else if(old.shield<10&&old.coins>=30&&old.supplyPurchases<2){action='purchaseSupply';args=['barrier'];}
     else if(old.spinsLeft<=2&&old.coins>=40&&old.supplyPurchases<2&&!old.overclockReady){action='purchaseSupply';args=['overclock'];}
     else{action='spin';}
    }else{
     const draw=random(),window=`${old.floor}:${old.round}:${old.phase}`;
     if(draw<.12&&old.rerolls>0&&rollWindow!==window){action='rerollRewards';rollWindow=window;}
     else if(draw<.25){action='skipReward';}
     else{action='chooseReward';args=[Math.floor(random()*old.choices.length)];}
    }
    const previous=old;old=baseline[action](old,...args);const observed=instrumented.observeEngineAction(()=>instrumented[action](now,...args));now=observed.state;
    if(old===previous)throw Error(`Parity fixture did not advance: ${action}`);actions++;same();
   }
   if(!['victory','defeat'].includes(old.phase))throw Error('Parity campaign exceeded its cap');runs.push({seed,difficulty,actions,phase:old.phase,floor:old.floor,finalStateHash:digest(JSON.stringify(old))});
  }
  const numericSources=['src/content.js','src/difficulty.js','src/ai.js','src/ai-profile.js','src/attributes.js','src/enemy-effects.js','src/effect-rules.js','src/synergies.js','src/retirements.js'];
  const unchanged={};for(const name of numericSources){const old=execFileSync('git',['show',`${BASE}:${name}`]);const current=await readFile(new URL(`../${name}`,import.meta.url));unchanged[name]=digest(old)===digest(current);if(!unchanged[name])throw Error(`Production numerical/AI source changed: ${name}`);}
  report={format:'matrix-engine-parity-v1',passed:true,baselineCommit:BASE,instrumentedEngineSha256:digest(await readFile(new URL('../src/engine.js',import.meta.url))),clientDate:'2026-10-26',campaigns:runs.length,stateComparisons:comparisons,numericSourcesUnchanged:unchanged,runs,scope:'Released v0.8.1 versus instrumented engine, identical explicit actions at each step; no balance inference'};
 } finally {await rm(temporary,{recursive:true,force:true});}
 if(output){await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');}return report;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const output=process.argv[2]==='--output'?process.argv[3]:undefined;const report=await verifyEngineParity({output});console.log(JSON.stringify({passed:report.passed,campaigns:report.campaigns,stateComparisons:report.stateComparisons},null,2));
}
