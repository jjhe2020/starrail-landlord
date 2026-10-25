import { Worker,isMainThread,parentPort,workerData } from 'node:worker_threads';
import { readFile,writeFile,mkdir,rename,stat,statfs } from 'node:fs/promises';
import { resolve,dirname,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { getHeapStatistics } from 'node:v8';
import { buildCampaignPlan,buildForkPlan,describePlan,MATRIX_PROTOCOL } from '../src/player-matrix-plan.js';
import { writeMatrixShard,hashFile } from './player-matrix-io.mjs';
import { acquireMatrixLock } from './player-matrix-lock.mjs';
const projectRoot=fileURLToPath(new URL('..',import.meta.url));
const SOURCE_FILES=['package.json','VERSION','src/engine.js','src/content.js','src/attributes.js','src/difficulty.js','src/effect-rules.js','src/enemy-effects.js','src/synergies.js','src/retirements.js','src/retirement-ai.js','src/ai.js','src/ai-profile.js','src/ai-spatial.js','src/archetypes.js','src/balance-v080.js','src/player-policy.js','src/player-policy-fixtures.js','src/player-matrix-simulation.js','src/player-matrix-analysis.js','src/player-matrix-plan.js','scripts/player-matrix-forks.mjs','scripts/player-matrix.mjs','scripts/player-matrix-io.mjs','scripts/player-matrix-lock.mjs','scripts/validate-player-policies.mjs','scripts/validate-player-matrix-statistics.mjs','scripts/verify-player-matrix-engine-parity.mjs','scripts/verify-player-matrix-preflight.mjs','scripts/analyze-player-matrix.mjs','scripts/run-player-matrix-standard.mjs','scripts/render-player-matrix-report.mjs','docs/PLAYER-MATRIX-PROTOCOL-DRAFT.md'];
const hash=value=>createHash('sha256').update(value).digest('hex');
export async function sourceFingerprint(){return Object.fromEntries(await Promise.all(SOURCE_FILES.map(async name=>[name,hash(await readFile(resolve(projectRoot,name)))])));}
export async function atomicJson(path,value){await mkdir(dirname(path),{recursive:true});const temporary=`${path}.${process.pid}.tmp`;await writeFile(temporary,JSON.stringify(value,null,2)+'\n');await rename(temporary,path);}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const matrixRuntime=()=>({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch});
if(!isMainThread){
  const {getPlayerPolicy}=await import('../src/player-policy.js');
  const simulation=await import('../src/player-matrix-simulation.js');
  const entries=workerData.entriesFile?JSON.parse(await readFile(workerData.entriesFile,'utf8')):null;
  const entryCache=new Map();
  parentPort.on('message',async task=>{
    try{
      const started=performance.now(),threadCpu=typeof process.threadCpuUsage==='function',cpu=threadCpu?process.threadCpuUsage():process.cpuUsage();let result;
      if(task.entryIndex!==undefined){
        const {runForkTask,loadForkEntry}=awaitableForkAdapter;
        let entry=entryCache.get(task.entryIndex);if(!entry){entry=await loadForkEntry(entries[task.entryIndex],workerData.entriesFile);entryCache.set(task.entryIndex,entry);if(entryCache.size>16)entryCache.delete(entryCache.keys().next().value);}
        result=runForkTask(simulation,entry,task,getPlayerPolicy);
      }else result=simulation.runPlayerCampaign({policy:getPlayerPolicy(task.strategyId),difficulty:task.difficulty,seed:task.seed,behaviorSeed:task.behaviorSeed,maxActions:1000,record:true,captureOpportunities:task.stage.includes('roots'),includeFinalSnapshot:false,includeHits:Number.parseInt(hash(task.trialKey).slice(0,8),16)%20===0});
      const elapsedMs=performance.now()-started,usage=threadCpu?process.threadCpuUsage(cpu):process.cpuUsage(cpu);
      if(result.stopped||!['victory','defeat'].includes(result.phase)||result.errors?.length||result.conservationPassed!==true)throw Error(`Invalid or nonterminal trial ${task.trialKey}: ${result.stopped||result.errors?.[0]?.message||result.phase}`);
      parentPort.postMessage({type:'result',id:task.index,value:{...task,...result,taskSeed:task.seed,taskBehaviorSeed:task.behaviorSeed,strategy:getPlayerPolicy(task.strategyId),elapsedMs,cpuMs:(usage.user+usage.system)/1000,cpuScope:threadCpu?'thread':'process-overlap-possible'}});
    }catch(error){parentPort.postMessage({type:'error',id:task.index,error:error.stack||String(error)});}
  });
  // Loaded synchronously before dispatch; the adapter can be changed only before freezing a batch.
  const awaitableForkAdapter=await import('./player-matrix-forks.mjs');
  parentPort.postMessage({type:'ready',sourceHashes:await sourceFingerprint()});
}
export class MatrixWorkerPool {
 constructor(workers,options={}){this.workers=workers;this.options=options;this.pool=[];}
 async start(sourceHashes){
  this.sourceHashes=sourceHashes;
  try{await Promise.all(Array.from({length:this.workers},async()=>{
   const worker=new Worker(new URL(import.meta.url),{workerData:this.options,execArgv:[],resourceLimits:{maxOldGenerationSizeMb:512}});this.pool.push(worker);
   await new Promise((yes,no)=>{worker.once('error',no);worker.once('message',message=>{if(message.type!=='ready'||!same(message.sourceHashes,sourceHashes))no(Error('Worker source fingerprint mismatch'));else yes();});});
  }));return this;}catch(error){await this.close();throw error;}
 }
 async batch(tasks,onProgress=()=>{}){
  let next=0,completed=0;const results=new Array(tasks.length);
  await Promise.all(this.pool.map(async worker=>{
   while(next<tasks.length){const localIndex=next++,task=tasks[localIndex];
    const value=await new Promise((yes,no)=>{
     const message=m=>{cleanup();if(m.type==='error')no(Error(m.error));else if(m.type!=='result'||m.id!==task.index)no(Error('Unexpected matrix worker response'));else yes(m.value);};
     const failed=e=>{cleanup();no(e);};const exited=code=>{cleanup();no(Error(`Matrix worker exited ${code}`));};
     const cleanup=()=>{worker.off('message',message);worker.off('error',failed);worker.off('exit',exited);};
     worker.once('message',message);worker.once('error',failed);worker.once('exit',exited);worker.postMessage(task);
    });results[localIndex]=value;completed++;await onProgress(completed,tasks.length);
   }
  }));return results;
 }
 async close(){await Promise.all(this.pool.map(w=>w.terminate()));this.pool=[];}
}
export async function executeMatrixPlan(plan,{directory,workers=8,shardSize=500,policies=[],sourceHashes,entriesFile,log=true}={}){
 directory=resolve(directory);await mkdir(directory,{recursive:true});const release=await acquireMatrixLock(directory);
 try{return await executeUnlocked(plan,{directory,workers,shardSize,policies,sourceHashes,entriesFile,log},release.assertOwned);}finally{await release();}
}
async function executeUnlocked(plan,{directory,workers=8,shardSize=500,policies=[],sourceHashes,entriesFile,log=true}={},assertOwned=async()=>{}){
 if(!Number.isSafeInteger(workers)||workers<1||workers>8)throw Error('workers must be an integer from 1 to 8');
 if(!Number.isSafeInteger(shardSize)||shardSize<1||shardSize>1000)throw Error('shardSize must be an integer from 1 to 1000');
 if(!Number.isSafeInteger(plan.count)||plan.count<0)throw Error('Task count must be a nonnegative integer');
 directory=resolve(directory);await mkdir(directory,{recursive:true});sourceHashes??=await sourceFingerprint();
 const manifestPath=resolve(directory,'run-manifest.json'),policyHash=hash(JSON.stringify(policies));
 const taskHash=createHash('sha256');for(let index=0;index<plan.count;index++)taskHash.update(JSON.stringify(plan.task(index))+'\n');
 const planHash=taskHash.digest('hex'),entriesHash=entriesFile?await hashFile(entriesFile):null;let manifest;
 const runtime=matrixRuntime();
 try{manifest=JSON.parse(await readFile(manifestPath,'utf8'));if(!same(manifest.sourceHashes,sourceHashes)||!same(manifest.runtime,runtime)||manifest.policyHash!==policyHash||manifest.count!==plan.count||manifest.stage!==plan.stage||manifest.planHash!==planHash||manifest.entriesHash!==entriesHash||manifest.shardSize!==shardSize)throw Error('Existing stage does not match frozen sources, runtime, policies, entry index or task plan');}
 catch(error){if(error.code!=='ENOENT')throw error;manifest={format:'player-matrix-stage-v1',protocol:MATRIX_PROTOCOL,stage:plan.stage,split:plan.count?plan.task(0).split:plan.stage,sourceHashes,policyHash,planHash,entriesHash,runtime,policies,count:plan.count,expected:{count:plan.count,runs:plan.count},plan:describePlan(plan),workers,shardSize,shards:[],completed:0,complete:false,startedAt:new Date().toISOString(),elapsedMs:0,sourceStable:true};}
 manifest.sessions??=[];manifest.sessions.push({pid:process.pid,workers,workerOldGenerationMb:512,coordinatorHeapLimitBytes:getHeapStatistics().heap_size_limit,startedAt:new Date().toISOString(),previousCompleted:manifest.completed});
 delete manifest.error;
 if(plan.count===0){manifest.complete=true;manifest.reason='No eligible registered tasks';await assertOwned();await atomicJson(manifestPath,manifest);return {...manifest,path:manifestPath};}
 const started=performance.now(),previousMs=manifest.elapsedMs,cpuStarted=process.cpuUsage(),previousCpuMs=manifest.processCpuMs||0;let lastProgress=0;
 const pool=new MatrixWorkerPool(workers,{entriesFile});
 try{
  await pool.start(sourceHashes);
  for(let start=0;start<plan.count;start+=shardSize){
   const count=Math.min(shardSize,plan.count-start),id=Math.floor(start/shardSize),name=`part-${String(id).padStart(6,'0')}.jsonl.gz`,path=resolve(directory,name),existing=manifest.shards.find(s=>s.id===id);
   if(existing){if(existing.count!==count||await hashFile(path)!==existing.sha256)throw Error(`Previously committed shard is damaged: ${name}`);continue;}
   const disk=await statfs(directory);if(disk.bavail*disk.bsize<2*1024**3)throw Error('Less than 2 GiB available for raw records; preserve completed shards and free storage before resuming');
   const tasks=Array.from({length:count},(_,offset)=>({...plan.task(start+offset),index:start+offset}));
   const results=await pool.batch(tasks,async completed=>{
    manifest.peakRssBytes=Math.max(manifest.peakRssBytes||0,process.memoryUsage().rss);
    if(performance.now()-lastProgress<2000&&completed<count)return;lastProgress=performance.now();await atomicJson(resolve(directory,'progress.json'),{stage:plan.stage,completed:start+completed,total:plan.count,shard:id,elapsedMs:previousMs+performance.now()-started,rssBytes:process.memoryUsage().rss,peakRssBytes:manifest.peakRssBytes,updatedAt:new Date().toISOString()});
   });
   await assertOwned();
   if(!same(await sourceFingerprint(),sourceHashes))throw Error('Source drift during simulation; this uncommitted shard is rejected');
   const meta={protocol:MATRIX_PROTOCOL,stage:plan.stage,split:manifest.split,sourceHashes,policyHash,taskStart:start,taskEnd:start+count,expected:{runs:count}};
   const saved=await writeMatrixShard(path,meta,results);
   manifest.shards.push({id,path:name,sha256:saved.sha256,count,start,end:start+count,bytes:(await stat(path)).size});manifest.shards.sort((a,b)=>a.id-b.id);manifest.completed=manifest.shards.reduce((sum,s)=>sum+s.count,0);manifest.elapsedMs=previousMs+performance.now()-started;
   const usage=process.cpuUsage(cpuStarted);manifest.processCpuMs=previousCpuMs+(usage.user+usage.system)/1000;
   await atomicJson(manifestPath,manifest);if(log)console.log(`${plan.stage}: ${manifest.completed}/${plan.count} (${(manifest.completed/plan.count*100).toFixed(1)}%) ${Math.round(manifest.elapsedMs/1000)}s`);
  }
  manifest.sourceStable=same(await sourceFingerprint(),sourceHashes);if(!manifest.sourceStable)throw Error('Final source fingerprint mismatch');manifest.complete=true;manifest.completedAt=new Date().toISOString();manifest.elapsedMs=previousMs+performance.now()-started;await assertOwned();await atomicJson(manifestPath,manifest);return {...manifest,path:manifestPath};
 }catch(error){manifest.complete=false;manifest.error=error.stack||String(error);manifest.elapsedMs=previousMs+performance.now()-started;await assertOwned();await atomicJson(manifestPath,manifest);throw error;}
 finally{await pool.close();}
}
const isEntrypoint=isMainThread&&process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isEntrypoint){
 const args=new Map();for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i].replace(/^--/,'');if(!['stage','directory','workers','questions','cells','entries','limit','purpose'].includes(key)||args.has(key)||!process.argv[i+1])throw Error('Use unique --name value options');args.set(key,process.argv[i+1]);}
 const {buildPlayerPolicies}=await import('../src/player-policy.js');const policies=buildPlayerPolicies({includeControls:true}),stage=args.get('stage')||'pilot';
 const questions=args.has('questions')?JSON.parse(await readFile(args.get('questions'),'utf8')).questions:[];
 const cells=args.has('cells')?JSON.parse(await readFile(args.get('cells'),'utf8')).cells:[];
 let plan=args.has('entries')?buildForkPlan(stage,JSON.parse(await readFile(args.get('entries'),'utf8'))):buildCampaignPlan(stage,policies,{questions,cells});
 if(args.has('limit')){if(args.get('purpose')!=='smoke')throw Error('A partial plan requires --purpose smoke and is never a completed standard stage');const limit=Number(args.get('limit'));if(!Number.isSafeInteger(limit)||limit<1)throw Error('smoke limit must be a positive integer');const full=plan;plan={...full,stage:`${stage}-smoke`,count:Math.min(limit,full.count),task:index=>{const task=full.task(index),split=`${task.split}-smoke`;return {...task,stage:`${stage}-smoke`,split,seed:`matrix-v1:${split}:world:${task.worldIndex}`,behaviorSeed:`matrix-v1:${split}:world:${task.worldIndex}:behavior:${task.behaviorRep}`,trialKey:`smoke:${task.trialKey}`};}};}
 const directory=args.get('directory')||resolve(projectRoot,'.local/player-matrix-v1',plan.stage);
 const result=await executeMatrixPlan(plan,{directory,policies,workers:Number(args.get('workers')||8),entriesFile:args.get('entries')});console.log(`Complete ${result.stage}: ${result.completed} records; ${result.path}`);
}
