import { readFile,writeFile,mkdir,rename } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync,gunzipSync } from 'node:zlib';
import { readMatrixShard,hashFile } from './player-matrix-io.mjs';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const REWARDS=new Set(['recruit','item','essence']);
const affected=state=>state.floor+Number(Boolean(state.pendingFloor));
const signature=trace=>(trace||[]).map(row=>({index:row.index,type:row.type,kind:row.kind||null,uid:row.uid||null,selected:row.selected?{id:row.selected.id,index:row.selected.index,action:row.selected.action}:null,draw:row.draw,randomBefore:row.randomBefore,randomAfter:row.randomAfter,stateHash:row.stateHash}));
export async function loadForkEntry(entry,indexPath){
 if(entry.snapshot){validateEntryIdentity(entry);return entry;}
 if(!entry.record?.path||!indexPath)throw Error('Fork index has no snapshot record');
 const bytes=await readFile(resolve(dirname(indexPath),entry.record.path));
 if(bytes.length!==entry.record.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.record.sha256)throw Error(`Fork entry checksum/size mismatch: ${entry.id}`);
 const restored=JSON.parse(gunzipSync(bytes));
 for(const key of ['id','cellId','strategyId','worldIndex','difficulty','affectedFloor','kind','rootTrialKey','referenceFinalStateHash','referenceActionHash'])if(restored[key]!==entry[key])throw Error(`Fork entry index differs: ${entry.id} ${key}`);
 validateEntryIdentity(restored);
 return restored;
}
function validateEntryIdentity(entry){
 if(!['reroll','remove','supply'].includes(entry.kind)||entry.snapshot?.policy?.id!==entry.strategyId||entry.snapshot?.game?.difficulty!==entry.difficulty||affected(entry.snapshot.game)!==entry.affectedFloor)throw Error(`Fork entry snapshot identity differs: ${entry.id}`);
}
export function runForkTask(simulation,entry,task,getPlayerPolicy){
 if(!entry?.snapshot)throw Error('Process fork is missing its entry snapshot');
 if(!['A','B','C','D','E'].includes(task.branch)||![0,1].includes(task.behaviorRep))throw Error('Unknown fork branch or behavior replicate');
 validateEntryIdentity(entry);
 for(const [taskKey,entryKey] of [['entryId','id'],['cellId','cellId'],['strategyId','strategyId'],['worldIndex','worldIndex'],['difficulty','difficulty'],['affectedFloor','affectedFloor'],['kind','kind']])if(task[taskKey]!==undefined&&task[taskKey]!==entry[entryKey])throw Error(`Fork task differs from frozen entry: ${taskKey}`);
 const f=entry.affectedFloor,kind=entry.kind,branch=task.branch;let released=false;
 const blockOnce=branch==='B'||branch==='E',blockFloor=branch==='C',blockForever=branch==='D';
 const plannerOptions=({state})=>({blockedKinds:blockForever || blockOnce&&!released || blockFloor&&affected(state)<=f ? [kind]:[]});
 const policyTransform=({state,policy})=>branch==='E'&&released&&affected(state)<=f+2 ? getPlayerPolicy(policy.id.replace(/\|R:[^|]+$/,'|R:active')):policy;
 const onAction=context=>{
   const action=context.action||context.planned||context;
   if(blockOnce&&!released && (kind==='reroll'?action.type==='reward':action.type==='spin'))released=true;
 };
 const result=simulation.runPlayerCampaign({initialSnapshot:entry.snapshot,record:true,captureOpportunities:false,includeFinalSnapshot:false,includeHits:false,maxActions:1000,plannerOptions,policyTransform,onAction,
   ...(task.behaviorRep===1?{behaviorSeedOverride:task.behaviorSeed}:{})});
 if(branch==='A'&&task.behaviorRep===0){
   if(entry.referenceFinalStateHash&&result.finalStateHash!==entry.referenceFinalStateHash)throw Error(`Normal fork did not reproduce root state: ${entry.id}`);
   if(entry.referenceActionHash&&hash(signature(result.actionTrace))!==entry.referenceActionHash)throw Error(`Normal fork did not reproduce root actions: ${entry.id}`);
 }
 return {...result,fork:{cellId:entry.cellId,entryId:entry.id,entryWorldIndex:entry.worldIndex,branch,kind,affectedFloor:f,rootTrialKey:entry.rootTrialKey,rootStrategyId:entry.strategyId,behaviorContinuation:task.behaviorRep===0?'restored-root-stream':'independent-future-stream',missWindow:kind==='reroll'?'current-reward-consumed':'next-real-spin',compensationThroughFloor:branch==='E'?f+2:null},intervention:{branch,kind,released,parametersChanged:branch==='E'?['R']:[]}};
}
export async function collectForkEntries(manifestPath,{target=128,cells=null,output}={}){
 if(!Number.isSafeInteger(target)||target<1)throw Error('Entry sample target must be a positive integer');
 const manifest=JSON.parse(await readFile(manifestPath,'utf8'));if(!manifest.complete||!manifest.sourceStable)throw Error('Root stage is incomplete or unstable');
 const groups=new Map(),allowed=cells?new Set(cells.map(c=>c.id||c.cellId)):null;
 if(output)await mkdir(`${output}.entries`,{recursive:true});
 let nextStart=0;
 for(const shard of [...manifest.shards].sort((a,b)=>a.start-b.start)){
  if(shard.start!==nextStart||shard.end!==shard.start+shard.count)throw Error('Root shard order/count is incomplete');let count=0;
  const path=resolve(dirname(manifestPath),shard.path);if(await hashFile(path)!==shard.sha256)throw Error('Root shard hash mismatch');
  for await(const row of readMatrixShard(path,{expectedSourceHashes:manifest.sourceHashes})){
   if(row.kind==='header'&&(row.value.stage!==manifest.stage||row.value.policyHash!==manifest.policyHash))throw Error('Root shard experiment identity mismatch');
   if(row.kind!=='run')continue;const run=row.value;
   if(run.index!==undefined&&run.index!==shard.start+count)throw Error('Root task index out of order');count++;
   if(run.stopped||!['victory','defeat'].includes(run.phase)||run.won!==(run.phase==='victory')||run.clearedFloors!==(run.phase==='victory'?12:run.floor-1))throw Error('Incomplete or inconsistent root cannot supply formal entries');
   for(const op of run.opportunities||[]){
    const f=op.firstAffectedFloor??op.affectedFloor,cellId=`D${run.difficulty}:F${f}:${op.kind}`;
    if(allowed&&!allowed.has(cellId))continue;
    if(run.targetFloor&&run.targetFloor!==f||run.targetKind&&run.targetKind!==op.kind)continue;
    const cell=groups.get(cellId)||{cellId,difficulty:run.difficulty,affectedFloor:f,kind:op.kind,byH:new Map(),qualified:0};groups.set(cellId,cell);cell.qualified++;
    const h=run.strategy?.H?.id||run.policy?.H?.id||run.strategyId.match(/H:([^|]+)/)?.[1]||'unknown';
    if(!cell.byH.has(h))cell.byH.set(h,[]);const list=cell.byH.get(h);
    // More than target entries in a stratum cannot be selected by the stable round-robin, so bound retained snapshots.
    if(list.length<target){
     const entry={id:`${cellId}:W${run.worldIndex}:${h}`,cellId,difficulty:run.difficulty,worldIndex:run.worldIndex,affectedFloor:f,kind:op.kind,strategyId:run.strategyId,rootTrialKey:run.trialKey,snapshot:op.snapshot,opportunity:{...op,snapshot:undefined},referenceFinalStateHash:run.finalStateHash,referenceActionHash:hash(signature(run.actionTrace?.filter(action=>action.index>=op.actionIndex)))};
     if(output){
      const filename=`${hash(entry.id)}.json.gz`,bytes=gzipSync(JSON.stringify(entry),{level:3});
      const path=resolve(`${output}.entries`,filename),temporary=`${path}.${process.pid}.tmp`;await writeFile(temporary,bytes);await rename(temporary,path);
      const {snapshot,opportunity,...identity}=entry;
      list.push({...identity,record:{path:`${output.split('/').at(-1)}.entries/${filename}`,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}});
     }else list.push(entry);
    }
   }
  }
  if(count!==shard.count)throw Error('Root observed shard count mismatch');nextStart=shard.end;
 }
 if(nextStart!==manifest.count)throw Error('Root planned count mismatch');
 const entries=[],coverage=[];
 for(const cell of [...groups.values()].sort((a,b)=>a.cellId.localeCompare(b.cellId))){
  const queues=['short','balanced','greedy'].map(h=>({h,rows:(cell.byH.get(h)||[]).sort((a,b)=>a.worldIndex-b.worldIndex)})),used=new Set(),selected=[];let progress=true;
  while(selected.length<target&&progress){progress=false;for(const queue of queues){while(queue.rows.length&&used.has(queue.rows[0].worldIndex))queue.rows.shift();if(!queue.rows.length)continue;const entry=queue.rows.shift();selected.push(entry);used.add(entry.worldIndex);progress=true;if(selected.length===target)break;}}
  entries.push(...selected);coverage.push({cellId:cell.cellId,difficulty:cell.difficulty,affectedFloor:cell.affectedFloor,kind:cell.kind,target,actual:selected.length,qualified:cell.qualified,missing:target-selected.length,rootMix:Object.fromEntries(['short','balanced','greedy'].map(h=>[h,selected.filter(e=>e.strategyId.includes(`H:${h}|`)).length]))});
 }
 if(cells)for(const cell of cells){const id=cell.id||cell.cellId;if(!coverage.some(c=>c.cellId===id))coverage.push({cellId:id,difficulty:cell.difficulty,affectedFloor:cell.affectedFloor,kind:cell.kind,target,actual:0,qualified:0,missing:target,rootMix:{short:0,balanced:0,greedy:0}});}
 if(!cells)for(const difficulty of [4,8,12,16,20])for(const affectedFloor of [2,4,6,8,10])for(const kind of ['reroll','remove','supply']){const cellId=`D${difficulty}:F${affectedFloor}:${kind}`;if(!coverage.some(c=>c.cellId===cellId))coverage.push({cellId,difficulty,affectedFloor,kind,target,actual:0,qualified:0,missing:target,rootMix:{short:0,balanced:0,greedy:0}});}
 const result={format:'player-matrix-entry-coverage-v1',sourceManifest:manifestPath,target,entries:entries.length,cells:coverage,selectionRule:'first qualified public-state opportunity; independent world within cell; stable horizon round-robin; no continuation outcomes used'};
 if(output){await mkdir(dirname(output),{recursive:true});const temp=`${output}.${process.pid}.tmp`;await writeFile(temp,JSON.stringify(entries));await rename(temp,output);await writeFile(`${output}.coverage.json`,JSON.stringify(result,null,2)+'\n');}
 return {entries,coverage:result};
}
export {signature as forkActionSignature};
