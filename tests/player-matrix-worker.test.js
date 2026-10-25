import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,appendFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {executeMatrixPlan,sourceFingerprint} from '../scripts/player-matrix.mjs';
import {readMatrixShard} from '../scripts/player-matrix-io.mjs';
import {finishTask} from '../src/player-matrix-plan.js';
import {getPlayerPolicy} from '../src/player-policy.js';
import {analyzePlayerMatrixManifest} from '../scripts/analyze-player-matrix.mjs';

async function signatures(path){
 const manifest=JSON.parse(await readFile(path,'utf8')),rows=[];
 for(const shard of manifest.shards)for await(const row of readMatrixShard(resolve(dirname(path),shard.path)))if(row.kind==='run')rows.push([row.value.finalStateHash,row.value.actionTrace.map(a=>[a.type,a.uid,a.kind,a.draw,a.selected?.id,a.stateHash])]);
 return rows;
}
test('worker counts, shard sizes and resume preserve outcomes; altered plans and damaged shards are rejected',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'matrix-workers-'));
 const policies=[getPlayerPolicy('control:current-ai')],sourceHashes=await sourceFingerprint();
 const plan={stage:'integration',worlds:2,reps:2,contexts:[{strategyId:policies[0].id,difficulty:20}],count:4,task:index=>finishTask({stage:'integration',split:'integration-only',strategyId:policies[0].id,difficulty:20,worldIndex:Math.floor(index/2),behaviorRep:index%2})};
 try{
  const one=await executeMatrixPlan(plan,{directory:join(directory,'one'),workers:1,shardSize:1,policies,sourceHashes,log:false});
  const many=await executeMatrixPlan(plan,{directory:join(directory,'many'),workers:2,shardSize:3,policies,sourceHashes,log:false});
  assert.deepEqual(await signatures(one.path),await signatures(many.path));
  const before=await signatures(many.path),resumed=await executeMatrixPlan(plan,{directory:join(directory,'many'),workers:1,shardSize:3,policies,sourceHashes,log:false});
  assert.equal(resumed.completed,4);assert.deepEqual(await signatures(resumed.path),before);
  const analysis=await analyzePlayerMatrixManifest(many.path,{bootstrapResamples:100});
  assert.equal(analysis.description.attempts,4);assert.equal(analysis.description.cells[0].worlds,2);assert.equal(analysis.description.cells[0].incompleteTrajectories,0);
  const changed={...plan,task:index=>({...plan.task(index),behaviorSeed:'changed-same-count'})};
  await assert.rejects(executeMatrixPlan(changed,{directory:join(directory,'many'),workers:1,shardSize:3,policies,sourceHashes,log:false}),/task plan/);
  await appendFile(resolve(dirname(many.path),many.shards[0].path),'broken');
  await assert.rejects(executeMatrixPlan(plan,{directory:join(directory,'many'),workers:1,shardSize:3,policies,sourceHashes,log:false}),/damaged/);
  await assert.rejects(executeMatrixPlan(plan,{directory:join(directory,'bad'),workers:0,policies,sourceHashes}),/workers/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
