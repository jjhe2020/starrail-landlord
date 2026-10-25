import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTagStrategies } from '../src/balance-v080.js';
import { buildCampaignPlan,buildForkPlan,pilotPolicies,finishTask } from '../src/player-matrix-plan.js';
const policies=[];
for(const t of buildTagStrategies())for(const h of ['short','balanced','greedy'])for(const j of ['deterministic','mixed','random'])for(const r of ['active','balanced','reserve'])policies.push({id:`matrix:${t.id}|H:${h}|J:${j}|R:${r}`});
policies.push(...['active','balanced','reserve'].map(r=>({id:`control:uniform:${r}`})),{id:'control:current-ai'});
test('standard matrix has exact coverage and seed identities do not depend on workers or policy',()=>{
 const p=buildCampaignPlan('screen',policies);assert.equal(p.count,503680);const a=p.task(0),b=p.task(2);assert.notEqual(a.strategyId,b.strategyId);assert.equal(a.seed,b.seed);assert.equal(a.behaviorSeed,b.behaviorSeed);assert.notEqual(a.trialKey,b.trialKey);assert.equal(p.task(p.count-1).worldIndex,15);assert.equal(p.task(p.count-1).difficulty,20);
});
test('pilot includes 36 policies, 1944 independent trajectories and 216 explicit replays',()=>{
 assert.equal(pilotPolicies(policies).length,36);const p=buildCampaignPlan('pilot',policies);assert.equal(p.count,2160);const all=Array.from({length:p.count},(_,i)=>p.task(i));assert.equal(new Set(all.map(x=>x.trialKey)).size,2160);assert.equal(all.filter(x=>x.replay).length,216);const root=all.find(x=>x.worldIndex===0&&!x.replay),repeat=all.find(x=>x.worldIndex===0&&x.replay&&x.strategyId===root.strategyId&&x.difficulty===root.difficulty);assert.equal(root.behaviorSeed,repeat.behaviorSeed);
});
test('confirmation reuses exact policy-difficulty trajectories across question memberships',()=>{
 const p=buildCampaignPlan('confirmation',policies,{questions:[{id:'q1',policyIds:['p1','p2'],difficulties:[4,6]},{id:'q2',policyIds:['p2','p3'],difficulties:[6]}]});assert.equal(p.contexts.length,5);assert.equal(p.count,10000);assert.deepEqual(p.contexts.find(x=>x.strategyId==='p2'&&x.difficulty===6).questionIds,['q1','q2']);
});
test('fork plan gives five branches and two continuations without treating them as independent entries',()=>{
 const p=buildForkPlan('fork-screen',[{id:'e',cellId:'c',strategyId:'p',difficulty:8,worldIndex:42,affectedFloor:6,kind:'remove'}]);assert.equal(p.count,10);assert.equal(new Set(Array.from({length:10},(_,i)=>p.task(i).trialKey)).size,10);assert.equal(p.task(9).branch,'E');assert.equal(p.task(9).worldIndex,42);assert.equal(p.task(9).entryId,'e');
});
