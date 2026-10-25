import { readFile,mkdir } from 'node:fs/promises';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { buildPlayerPolicies } from '../src/player-policy.js';
import { buildCampaignPlan,buildForkPlan,STANDARD,MATRIX_PROTOCOL } from '../src/player-matrix-plan.js';
import { executeMatrixPlan,sourceFingerprint,atomicJson,matrixRuntime } from './player-matrix.mjs';
import { readMatrixShard } from './player-matrix-io.mjs';
import { collectForkEntries } from './player-matrix-forks.mjs';
import { analyzePlayerMatrixManifest,writeMatrixAnalysis,writeAnalysisJson } from './analyze-player-matrix.mjs';
import { selectP2Questions,selectP3Cells } from '../src/player-matrix-analysis.js';
import { runPreflight } from './verify-player-matrix-preflight.mjs';
import { acquireMatrixLock } from './player-matrix-lock.mjs';
const projectRoot=fileURLToPath(new URL('..',import.meta.url));
const sha=value=>createHash('sha256').update(value).digest('hex');
async function command(script,args){await new Promise((yes,no)=>{const child=spawn(process.execPath,[resolve(projectRoot,script),...args],{cwd:projectRoot,stdio:'inherit'});child.once('error',no);child.once('exit',code=>code===0?yes():no(Error(`${script} exited ${code}`)));});}
function percentile(xs,p){if(!xs.length)return null;const sorted=[...xs].sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*p)];}
async function pilotSummary(manifests){
 const base=new Map(),wall=[],cpu=[],bytes=[];let executions=0,replays=0,gzipBytes=0;
 for(const path of manifests){const manifest=JSON.parse(await readFile(path,'utf8'));
  for(const shard of manifest.shards){gzipBytes+=shard.bytes;
   for await(const row of readMatrixShard(resolve(dirname(path),shard.path),{expectedSourceHashes:manifest.sourceHashes}))if(row.kind==='run'){
    const r=row.value,key=`${r.strategyId}|${r.difficulty}|${r.worldIndex}`;
    const compact={finalStateHash:r.finalStateHash,actions:sha(JSON.stringify(r.actionTrace.map(a=>[a.type,a.uid,a.kind,a.selected?.action,a.selected?.id,a.draw,a.stateHash])))};
    if(r.replay){const original=base.get(key);if(!original||original.finalStateHash!==compact.finalStateHash||original.actions!==compact.actions)throw Error('Pilot worker configurations changed the result or action sequence');replays++;}else base.set(key,compact);
    wall.push(r.elapsedMs);if(r.cpuScope==='thread')cpu.push(r.cpuMs);bytes.push(Buffer.byteLength(JSON.stringify(r)));executions++;
   }
  }
 }
 const primary=JSON.parse(await readFile(manifests[0],'utf8'));
 return {format:'player-matrix-pilot-summary-v1',passed:true,executions,distinctPolicyDifficultyWorldTrajectories:base.size,independentWorldSeeds:18,workerReplays:replays,wallMs:{p50:percentile(wall,.5),p95:percentile(wall,.95)},threadCpuMs:{p50:percentile(cpu,.5),p95:percentile(cpu,.95)},jsonBytes:{p50:percentile(bytes,.5),p95:percentile(bytes,.95)},gzipBytes,meanGzipBytes:gzipBytes/executions,peakRssBytes:primary.peakRssBytes,measuredThroughputPerSecond:primary.count/(primary.elapsedMs/1000),screenEstimateSecondsAtMeasuredThroughput:503680/(primary.count/(primary.elapsedMs/1000)),screenEstimatedGzipBytes:503680*gzipBytes/executions,scope:'Timing and behavior qualification only; not formal balance evidence; shared worlds are not independent per strategy'};
}
export async function runStandard(options={}){
 const directory=resolve(options.directory||resolve(projectRoot,'.local/player-matrix-v1/standard-20261026')),reportDirectory=resolve(options.reportDirectory||resolve(projectRoot,'report/player-matrix-v1'));
 if(directory===reportDirectory)throw Error('Raw records and report directories must differ');
 await mkdir(directory,{recursive:true});await mkdir(reportDirectory,{recursive:true});const release=await acquireMatrixLock(directory);let releaseReport;
 try{releaseReport=await acquireMatrixLock(reportDirectory);return await runStandardUnlocked({...options,directory,reportDirectory},async()=>{await release.assertOwned();await releaseReport.assertOwned();});}finally{await releaseReport?.();await release();}
}
async function runStandardUnlocked({directory=resolve(projectRoot,'.local/player-matrix-v1/standard-20261026'),reportDirectory=resolve(projectRoot,'report/player-matrix-v1'),workers=8,stopAfter=null}={},assertOwned=async()=>{}){
 directory=resolve(directory);reportDirectory=resolve(reportDirectory);await mkdir(directory,{recursive:true});await mkdir(reportDirectory,{recursive:true});
 const sourceHashes=await sourceFingerprint(),policies=buildPlayerPolicies({includeControls:true}),policyHash=sha(JSON.stringify(policies));
 const bindingPath=resolve(reportDirectory,'experiment-binding.json');
 try{const bound=JSON.parse(await readFile(bindingPath,'utf8'));if(bound.rawDirectory!==directory||JSON.stringify(bound.sourceHashes)!==JSON.stringify(sourceHashes)||bound.policyHash!==policyHash)throw Error('Report directory belongs to a different frozen experiment; choose a fresh report directory');}
 catch(error){if(error.code!=='ENOENT')throw error;await assertOwned();await atomicJson(bindingPath,{protocol:MATRIX_PROTOCOL,rawDirectory:directory,sourceHashes,policyHash});}
 const statePath=resolve(directory,'experiment.json');let state;
 try{state=JSON.parse(await readFile(statePath,'utf8'));if(JSON.stringify(state.sourceHashes)!==JSON.stringify(sourceHashes)||JSON.stringify(state.runtime)!==JSON.stringify(matrixRuntime())||state.policyHash!==policyHash)throw Error('Existing standard run has different sources/runtime/policies: use a new experiment directory, never mix old trials');}
 catch(e){if(e.code!=='ENOENT')throw e;state={protocol:MATRIX_PROTOCOL,approvedOption:'1A',clientDate:'2026-10-26',sourceHashes,policyHash,runtime:matrixRuntime(),policies,stage:'preflight',status:'running',stages:{},startedAt:new Date().toISOString()};}
 const save=async()=>{await assertOwned();state.pid=process.pid;state.updatedAt=new Date().toISOString();await atomicJson(statePath,state);await atomicJson(resolve(reportDirectory,'execution-status.json'),{...state,policies:undefined,rawDirectory:directory});};
 const stage=async(name,plan,options={})=>{
  state.stage=name;state.status='running';await save();const result=await executeMatrixPlan(plan,{directory:resolve(directory,name),policies,sourceHashes,workers,shardSize:name.includes('fork')&&!name.includes('roots')?STANDARD.forkShardSize:STANDARD.shardSize,...options});state.stages[name]={complete:result.complete,manifest:result.path,count:result.completed,elapsedMs:result.elapsedMs};await save();return result.path;
 };
 const stop=name=>{if(stopAfter===name){state.status='stopped-at-requested-stage';return true;}return false;};
 try{
  state.stage='preflight';await save();
  const gateDirectory=resolve(reportDirectory,'validation');let gates;
  try{gates=JSON.parse(await readFile(resolve(gateDirectory,'preflight.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(gates?.passed!==true||JSON.stringify(gates.sourceHashes)!==JSON.stringify(sourceHashes))gates=await runPreflight({directory:gateDirectory});
  state.stages.preflight={complete:true,report:resolve(gateDirectory,'preflight.json'),runtime:gates.runtime};await save();
  state.stage='behavior-validation';await save();
  const validationPath=resolve(directory,'behavior-validation.json');
  await command('scripts/validate-player-policies.mjs',['--output',validationPath]);
  const validation=JSON.parse(await readFile(validationPath,'utf8'));if(validation.passed!==true)throw Error('Player behavior qualification failed');
  state.stages.behavior={complete:true,report:validationPath};await save();if(stop('behavior')){await save();return state;}
  const pilot=buildCampaignPlan('pilot',policies),pilotPaths=[];
  for(const count of [8,4,1]){const indices=Array.from({length:pilot.count},(_,i)=>i).filter(i=>pilot.task(i).workers===count);const subplan={...pilot,stage:`pilot-workers-${count}`,reps:1,count:indices.length,task:index=>({...pilot.task(indices[index]),stage:`pilot-workers-${count}`})};pilotPaths.push(await stage(subplan.stage,subplan,{workers:count}));}
  const timing=await pilotSummary(pilotPaths);await atomicJson(resolve(reportDirectory,'pilot-summary.json'),timing);state.stages.pilot={complete:true,...timing};await save();if(stop('pilot')){await save();return state;}
  const screen=await stage('screen',buildCampaignPlan('screen',policies));
  state.stage='screen-analysis';await save();let screenAnalysis=await analyzePlayerMatrixManifest(screen);await writeMatrixAnalysis(resolve(reportDirectory,'screen'),screenAnalysis);
  const p2={...selectP2Questions(screenAnalysis.description,{policies}),sourceHashes,policyHash,screeningInputIdentity:screenAnalysis.description.inputIdentity};
  const p2Path=resolve(reportDirectory,'p2-registration.json');await writeAnalysisJson(p2Path,p2);state.stages.screenAnalysis={complete:true,registration:p2Path,questions:p2.questions.length};await save();if(stop('screen')){await save();return state;}
  screenAnalysis=null;
  const confirmation=await stage('confirmation',buildCampaignPlan('confirmation',policies,{questions:p2.questions}));
  state.stage='confirmation-analysis';await save();let p2Result=await analyzePlayerMatrixManifest(confirmation,{registration:p2,family:'matrix'});await writeMatrixAnalysis(resolve(reportDirectory,'confirmation'),p2Result);p2Result=null;state.stages.confirmationAnalysis={complete:true};await save();
  const roots=await stage('fork-roots',buildCampaignPlan('fork-roots',policies));
  state.stage='fork-entry-selection';await save();const entryPath=resolve(directory,'fork-screen-entries.json');const entries=await collectForkEntries(roots,{target:STANDARD.forkScreenEntries,output:entryPath});await atomicJson(resolve(reportDirectory,'fork-screen-entry-coverage.json'),entries.coverage);
  const forks=await stage('fork-screen',buildForkPlan('fork-screen',entries.entries),{entriesFile:entryPath});
  state.stage='fork-screen-analysis';await save();let forkAnalysis=await analyzePlayerMatrixManifest(forks);await writeMatrixAnalysis(resolve(reportDirectory,'fork-screen'),forkAnalysis);
  const p3={...selectP3Cells(forkAnalysis.description),sourceHashes,policyHash,screeningInputIdentity:forkAnalysis.description.inputIdentity};const p3Path=resolve(reportDirectory,'p3-registration.json');await writeAnalysisJson(p3Path,p3);state.stages.forkScreenAnalysis={complete:true,registration:p3Path,cells:p3.cells.length};await save();if(stop('fork-screen')){await save();return state;}
  forkAnalysis=null;
  const confirmRoots=await stage('fork-confirm-roots',buildCampaignPlan('fork-confirm-roots',policies,{cells:p3.cells}));
  const confirmEntriesPath=resolve(directory,'fork-confirmation-entries.json'),confirmEntries=await collectForkEntries(confirmRoots,{target:STANDARD.forkConfirmEntries,cells:p3.cells,output:confirmEntriesPath});await atomicJson(resolve(reportDirectory,'fork-confirmation-entry-coverage.json'),confirmEntries.coverage);
  const confirmForks=await stage('fork-confirmation',buildForkPlan('fork-confirmation',confirmEntries.entries),{entriesFile:confirmEntriesPath});
  state.stage='fork-confirmation-analysis';await save();let p3Result=await analyzePlayerMatrixManifest(confirmForks,{registration:p3,family:'process'});await writeMatrixAnalysis(resolve(reportDirectory,'fork-confirmation'),p3Result);p3Result=null;
  state.stages.forkConfirmationAnalysis={complete:true};state.stage='report';state.status='analysis-complete-report-pending';await save();
  await command('scripts/render-player-matrix-report.mjs',['--directory',reportDirectory]);
  state.status='complete';state.stage='complete';state.completedAt=new Date().toISOString();await save();
  // Refresh the already-successful report once against the final, stable status snapshot.
  await command('scripts/render-player-matrix-report.mjs',['--directory',reportDirectory]);return state;
 }catch(error){state.status='failed';state.error=error.stack||String(error);await save();throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=new Map();for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i].replace(/^--/,'');if(!['directory','report-directory','workers','stop-after'].includes(key)||args.has(key)||!process.argv[i+1])throw Error('Use unique --name value options');args.set(key,process.argv[i+1]);}
 await runStandard({directory:args.get('directory'),reportDirectory:args.get('report-directory'),workers:Number(args.get('workers')||8),stopAfter:args.get('stop-after')||null});
}
