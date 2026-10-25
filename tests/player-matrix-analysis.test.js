import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { createMatrixAggregator, summarizeMatrixRuns, bootstrapMeanInterval, centeredBootstrapTest, exactBinomialInterval, wilsonInterval, adjustHolm, adjustByFdr, analysisRandom, boundedMeanPValue, binomialCdf, exactCenteredBinaryBootstrapP, selectP2Questions, selectP3Cells, analyzeConfirmation, renderAnalysisMarkdown } from '../src/player-matrix-analysis.js';
import { writeMatrixShard } from '../scripts/player-matrix-io.mjs';
import { analyzePlayerMatrixManifest, writeAnalysisJson, writeMatrixAnalysis } from '../scripts/analyze-player-matrix.mjs';

function run({policy='p',world=0,rep=0,won=false,floor=3,split='screen',stopped=null,branch,cellId,affectedFloor=4,kind='reroll',...extra}={}) {
  if(won)floor=12;
  return {trialKey:`${split}:${policy}:${world}:${rep}:${cellId||''}:${branch||''}`,strategyId:policy,difficulty:10,worldIndex:world,behaviorRep:rep,split,stage:split,phase:won?'victory':stopped?'ready':'defeat',won,floor,death:won?null:'hp',stopped,clearedFloors:won?12:floor-1,
    floors:Array.from({length:floor},(_,i)=>({floor:i+1,reached:true,cleared:won||i+1<floor,failed:!won&&!stopped&&i+1===floor,cause:!won&&i+1===floor?'hp':null,turnsUsed:2,deadline:5,spinsLeft:won||i+1<floor?3:0,marginRatio:won||i+1<floor?.6:0,health:{netHp:-2,netShield:-1,healed:1,enemyHpLost:3,shieldBlocked:1},resources:{income:4,spending:2,freeRerolls:1,paidRerolls:0,removalsUsed:0},conservation:{passed:true}})),...(branch?{branch,cellId,affectedFloor,kind}:{}),...extra};
}
const repeat=(world,won,options={})=>[0,1].map(rep=>run({world,rep,won,...options}));

test('world blocks average behavior replicas without doubling independent N',()=>{
  const rows=[...repeat(0,true),run({world:1,rep:0,won:true}),run({world:1,rep:1}),...repeat(2,false),run({world:3,rep:0,won:false}),run({world:3,rep:1,won:true})];
  const result=summarizeMatrixRuns(rows,{bootstrapResamples:1000}),cell=result.cells[0];
  assert.equal(cell.worlds,4);assert.equal(cell.trajectories,8);assert.equal(cell.winRateInference.n,4);assert.equal(cell.winRate,.5);
  assert.deepEqual(cell.winRateInference.firstRepWilson95,wilsonInterval(2,4));
  assert.equal(cell.floors[2].failed,4);assert.equal(cell.floors[2].hpFailures,4);assert.equal(cell.floors[2].clearMargin.trajectories,4);
  assert.equal(cell.floors[2].metrics.spinsLeft.mean,3,'failed zero margins do not enter clear-only means');
  assert.equal(cell.floors[3].notReachedAfterFailure,4);assert.equal(cell.floors[3].metrics.netHp.worlds,3,'a mixed survival block contributes one conditional world mean');
  assert.match(renderAnalysisMarkdown(result),/独立单位为世界种子/);
});

test('conditional trajectory means and world means are distinguished when only one replica clears',()=>{
  const rows=[...repeat(0,true),run({world:1,rep:0,won:true}),run({world:1,rep:1,floor:3})];
  rows[0].floors[2].spinsLeft=1;rows[1].floors[2].spinsLeft=1;rows[2].floors[2].spinsLeft=5;
  const snapshot=JSON.stringify(rows),cell=summarizeMatrixRuns(rows,{bootstrapResamples:100}).cells[0],metric=cell.floors[2].metrics.spinsLeft;
  assert.equal(metric.observedTrajectories,3);assert.equal(metric.worlds,2);assert.equal(metric.mean,7/3);assert.equal(metric.worldMean,3);assert.equal(JSON.stringify(rows),snapshot,'aggregation must not mutate supplied telemetry');
});

test('incomplete behavior blocks and unfinished trajectories are disclosed, never counted as losses',()=>{
  const aggregator=createMatrixAggregator({bootstrapResamples:100});
  aggregator.add(run({world:0,rep:0,won:true}));aggregator.add(run({world:0,rep:1,stopped:'action-limit'}));aggregator.add(run({world:1,rep:0,won:true}));
  const cell=aggregator.summarize().cells[0];
  assert.equal(cell.winRate,null);assert.equal(cell.incompleteTrajectories,1);assert.equal(cell.incompleteBehaviorWorlds,1);assert.equal(cell.excludedPartialBehaviorTrajectories,1);
  assert.deepEqual(cell.winRateBoundsIncludingIncomplete,[.5,1]);assert.equal(cell.observedWins,1);
});

test('duplicate records, duplicate world replicas, bad floors and failed ledgers are rejected',()=>{
  const aggregator=createMatrixAggregator();const row=run();aggregator.add(row);
  assert.throws(()=>aggregator.add(row),/Duplicate trial/);
  assert.throws(()=>aggregator.add({...row,trialKey:'different'}),/Duplicate behavior/);
  assert.throws(()=>summarizeMatrixRuns([run({floors:[{floor:1,conservation:{passed:false}}]})]),/Unreconciled/);
  assert.throws(()=>summarizeMatrixRuns([run({worldIndex:undefined})]),/World index/);
  assert.throws(()=>summarizeMatrixRuns([run({conservationPassed:false})]),/Unreconciled run/);
  assert.throws(()=>summarizeMatrixRuns([run({floors:[{floor:1,conservation:{battle:{passed:false},total:{passed:true}}}]})]),/Unreconciled floor/);
  assert.throws(()=>summarizeMatrixRuns([run({phase:'defeat',won:true})]),/contradicts phase/);
});

test('pilot schedule replays remain executions without becoming new worlds',()=>{
  const aggregator=createMatrixAggregator({behaviorReps:1,bootstrapResamples:100});aggregator.add(run({won:true}));aggregator.add(run({won:true,replay:4,trialKey:'repeat:4'}));aggregator.add(run({won:true,replay:1,trialKey:'repeat:1'}));const report=aggregator.summarize();
  assert.equal(report.attempts,3);assert.equal(report.replayExecutions,2);assert.equal(report.cells[0].worlds,1);
});

test('bootstrap CI is reproducible and protects constant or all-zero data',()=>{
  const a=bootstrapMeanInterval([0,.5,1,1],{resamples:2000,seed:'same'}),b=bootstrapMeanInterval([1,0,1,.5],{resamples:2000,seed:'same'});assert.deepEqual(a,b);
  const zero=bootstrapMeanInterval(Array(100).fill(0));assert.equal(zero.degenerate,true);assert.equal(zero.ci95[0],0);assert.ok(zero.ci95[1]>0);
  assert.ok(Math.abs(exactBinomialInterval(0,1000)[1]-(1-.025**(1/1000)))<1e-12);
  const edge=exactBinomialInterval(1000,1000);assert.ok(edge[0]<1&&edge[1]===1);
  assert.throws(()=>exactBinomialInterval(2,1),/Invalid/);
});

test('centered bootstrap uses plus-one p and explicit MC uncertainty, and rejects degenerate tests',()=>{
  const result=centeredBootstrapTest([1,1,1,.5],{resamples:1000,seed:'p'});assert.equal(result.exceedances,0);assert.equal(result.p,1/1001);assert.ok(result.pUpper>result.p);
  assert.equal(centeredBootstrapTest([1,1,1]).p,null);assert.equal(centeredBootstrapTest([-1,1],{resamples:100}).p,1);
  assert.deepEqual(result,centeredBootstrapTest([1,1,1,.5],{resamples:1000,seed:'p'}));
});

test('Holm preserves the registered family including missing tests; BY is exploratory',()=>{
  const rows=adjustHolm([{id:'a',p:.001},{id:'b',p:.01},{id:'c',p:null}],{familySize:4,alpha:.025});
  assert.equal(rows[0].adjustedP,.004);assert.equal(rows[0].rejected,true);assert.equal(rows[1].adjustedP,.03);assert.equal(rows[1].rejected,false);assert.equal(rows[2].adjustedP,null);
  assert.throws(()=>adjustHolm(rows,{familySize:2}),/cannot omit/);
  const by=adjustByFdr([{p:.001},{p:.02},{p:.4}]);assert.ok(by[0].adjustedQ>=.003);assert.equal(by[0].method,'BY-exploratory');assert.equal(by[0].discovery,true);
});

test('bounded formal guard remains valid when skewed centered bootstrap is anti-conservative',()=>{
  assert.ok(Math.abs(binomialCdf(0,2,.5)-.25)<1e-12);
  let falsePositiveProbability=0,guardProbability=0;const n=1000,p0=.04,alpha=.025/72;
  for(let k=0;k<=n;k++){const mass=binomialCdf(k,n,p0)-binomialCdf(k-1,n,p0),p=exactCenteredBinaryBootstrapP(k,n,p0),delta=-.5+12.5*k/n;if(p!==null&&p<=alpha)falsePositiveProbability+=mass;const bounded=Math.min(1,2*Math.exp(-2*n*delta*delta/(24*24)));if(bounded<=alpha)guardProbability+=mass;}
  assert.ok(falsePositiveProbability>alpha*2,'exact finite-sample check must expose the failed original method');assert.ok(guardProbability<=alpha);
  assert.equal(boundedMeanPValue([0,0,0],[-1,1]),1);assert.throws(()=>boundedMeanPValue([1.1],[-1,1]),/theoretical range/);
});

test('fixed zero-effect synthetic samples calibrate the approximate test without running a game',()=>{
  const random=analysisRandom('null-calibration'),p=[];for(let trial=0;trial<128;trial++){const values=Array.from({length:32},()=>random()<.5?-1:1);p.push(centeredBootstrapTest(values,{resamples:1000,seed:`null:${trial}`}).p);}
  const rejects=p.filter(value=>value!==null&&value<.025).length;assert.ok(rejects<=12,`Unexpectedly inflated false positives: ${rejects}/128`);
});

function policyFixture(){const list=[];for(const T of ['baseline','tag'])for(const H of ['short','balanced','greedy'])for(const J of ['deterministic','mixed','random'])for(const R of ['active','balanced','reserve'])list.push({id:`${T}:${H}:${J}:${R}`,kind:'matrix',T:{id:T},H:{id:H},J:{id:J},R:{id:R}});return list;}
function screeningFixture(){const policies=policyFixture(),cells=[];for(const policy of policies){const t=Number(policy.T.id==='tag'),h=['short','balanced','greedy'].indexOf(policy.H.id),j=['deterministic','mixed','random'].indexOf(policy.J.id),r=['active','balanced','reserve'].indexOf(policy.R.id);for(let difficulty=1;difficulty<=20;difficulty++){const win=.5+((1-2*t)*h*.05+(1-Number(h===2)*2)*j*.04+(1-Number(j===2)*2)*r*.03+t*.04)*(1-Math.abs(difficulty-10)/25);cells.push({strategyId:policy.id,difficulty,split:'screen',winRate:win,clearedFloors:{estimate:6+Math.sin(t+h+j-r)*2}});}}return {policies,cells};}

test('P2 registers only single-axis pairs and complete four-corner interactions with frozen quotas',()=>{
  const summary=screeningFixture(),registration=selectP2Questions(summary),byId=new Map(summary.policies.map(p=>[p.id,p]));
  assert.ok(registration.questions.length<=24);assert.ok(registration.questions.some(q=>q.type==='interaction'));assert.match(registration.selectionRule,/never compare raw units/);
  assert.equal(new Set(registration.questions.map(q=>q.id)).size,registration.questions.length);
  for(const question of registration.questions){assert.ok(question.difficulties.length<=3);assert.ok(question.difficulties.every(d=>d>=1&&d<=20));const policies=question.policyIds.map(id=>byId.get(id));if(question.type==='pair'){const changed=['T','H','J','R'].filter(axis=>policies[0][axis].id!==policies[1][axis].id);assert.deepEqual(changed,[question.axis]);assert.deepEqual(question.coefficients,[-1,1]);}else{assert.equal(policies.length,4);assert.deepEqual(question.coefficients,[1,-1,-1,1]);for(const axis of question.axis)assert.equal(new Set(policies.map(p=>p[axis].id)).size,2);}}
  assert.deepEqual(registration,selectP2Questions(summary));
  const interaction=registration.questions.filter(q=>q.type==='interaction'),quotas={HR:3,HT:2,JT:2,JR:1};for(const [axis,max]of Object.entries(quotas))assert.ok(interaction.filter(q=>q.axis===axis).length<=max);
});

test('interaction selector prioritizes nonzero win effects without mixing raw floor units',()=>{
  const summary=screeningFixture();for(const cell of summary.cells){const p=summary.policies.find(p=>p.id===cell.strategyId),h=['short','balanced','greedy'].indexOf(p.H.id),j=['deterministic','mixed','random'].indexOf(p.J.id),r=['active','balanced','reserve'].indexOf(p.R.id),tag=p.T.id==='tag';cell.winRate=tag?.5:.2+.02*h*r*(j+1);cell.clearedFloors={estimate:tag?1+2.5*h*r:6};}
  const result=selectP2Questions(summary);assert.equal(result.questions.filter(q=>q.axis==='HR').length,3);assert.ok(result.questions.filter(q=>q.axis==='HR').every(q=>q.metric==='winRate'));
});

test('P2 does not replace missing directional signals with favorable comparisons',()=>{
  const summary=screeningFixture();summary.cells.forEach(cell=>{cell.winRate=.5;cell.clearedFloors={estimate:6};});const result=selectP2Questions(summary);assert.equal(result.questions.length,0);assert.ok(result.missingQuotas.length>0);
});

test('confirmation pairs use complete fresh world blocks and preserve incomplete plan status',()=>{
  const aggregator=createMatrixAggregator({bootstrapResamples:100});for(let world=0;world<4;world++)for(const rep of [0,1]){aggregator.add(run({policy:'a',world,rep,won:world===0,split:'confirmation'}));aggregator.add(run({policy:'b',world,rep,won:world<=2,split:'confirmation'}));}
  const registration={family:'matrix',familyAlpha:.025,confirmationSplit:'confirmation',targetWorlds:4,behaviorReps:2,questions:[{id:'q',type:'pair',policyIds:['a','b'],difficulties:[10],metric:'winRate'}]};
  const report=analyzeConfirmation(aggregator,registration,{bootstrapResamples:100,testResamples:1000,refineResamples:2000});assert.equal(report.tests[0].worlds,4);assert.equal(report.tests[0].estimate,.5);assert.equal(report.familySize,1);assert.equal(report.tests[0].complete,true);
  const missing=analyzeConfirmation(aggregator,{...registration,targetWorlds:5},{bootstrapResamples:100,testResamples:100});assert.equal(missing.tests[0].test.p,null);assert.equal(missing.tests[0].status,'未完成计划样本');
  assert.throws(()=>analyzeConfirmation(aggregator,{...registration,sourceHashes:{a:'old'}},{expectedSourceHashes:{a:'new'}}),/source identity/);
});

test('formal Monte Carlo refinement increases numerical precision without adding game worlds',()=>{
  const aggregator=createMatrixAggregator({bootstrapResamples:100});for(let world=0;world<500;world++)for(const rep of [0,1]){aggregator.add(run({policy:'a',world,rep,split:'confirmation'}));aggregator.add(run({policy:'b',world,rep,won:world<100,split:'confirmation'}));}
  const report=analyzeConfirmation(aggregator,{family:'matrix',confirmationSplit:'confirmation',targetWorlds:500,behaviorReps:2,questions:[{id:'mc',type:'pair',policyIds:['a','b'],difficulties:[10],metric:'winRate'}]},{bootstrapResamples:100,testResamples:100,refineResamples:1000});assert.equal(report.numericalRefinement,true);assert.equal(report.tests[0].test.resamples,1000);assert.equal(report.tests[0].worlds,500);
});

test('quad confirmation estimates a difference of differences rather than comparing p labels',()=>{
  const outcomes={a:[0,0,0,0],b:[1,1,0,0],c:[0,0,1,0],d:[1,0,1,1]},aggregator=createMatrixAggregator({bootstrapResamples:100});for(const [policy,values]of Object.entries(outcomes))for(let world=0;world<4;world++)for(const rep of [0,1])aggregator.add(run({policy,world,rep,won:Boolean(values[world]),split:'confirmation'}));
  const report=analyzeConfirmation(aggregator,{family:'matrix',confirmationSplit:'confirmation',targetWorlds:4,behaviorReps:2,questions:[{id:'quad',type:'interaction',policyIds:['a','b','c','d'],coefficients:[1,-1,-1,1],difficulties:[10],metric:'winRate'}]},{bootstrapResamples:100,testResamples:100});assert.equal(report.tests[0].estimate,0);assert.equal(report.tests[0].test.p,1);
});

function processAggregator(split='fork-screen'){const aggregator=createMatrixAggregator({bootstrapResamples:100});for(const kind of ['reroll','remove','supply'])for(const affectedFloor of [2,4,6]){const cellId=`${kind}:F${affectedFloor}`;for(const branch of ['A','B','C','D','E'])for(let world=0;world<2;world++)for(const rep of [0,1])aggregator.add(run({world,rep,branch,cellId,affectedFloor,kind,split,floor:branch==='A'?11:affectedFloor+Number(world===0)}));}return aggregator;}

test('P3 selects eight eligible cells with resource and stage coverage, then compares 96 registered risks',()=>{
  const aggregator=processAggregator(),selection=selectP3Cells(aggregator.summarize(),{targetWorlds:2});assert.equal(selection.cells.length,8);for(const kind of ['reroll','remove','supply'])assert.ok(selection.cells.filter(cell=>cell.kind===kind).length>=2);
  const confirmation=processAggregator('fork-confirmation'),report=analyzeConfirmation(confirmation,selection,{family:'process',bootstrapResamples:100,testResamples:100,refineResamples:200});assert.equal(report.tests.length,96);const risk=report.tests.find(row=>row.offset===2);assert.equal(risk.estimate,1);assert.equal(risk.test.p,null,'constant risk contrasts need conservative uncertainty, not tiny p');
});

async function manifestFixture(directory){const sourceHashes={'fixture.js':'a'.repeat(64)};for(const p of ['src/player-matrix-analysis.js','scripts/analyze-player-matrix.mjs'])sourceHashes[p]=createHash('sha256').update(await readFile(p)).digest('hex');const policyHash='p',rows=[...repeat(0,true),...repeat(1,false)].map((row,index)=>({...row,index,stage:'screen',split:'screen'}));const path=join(directory,'part-000000.jsonl.gz'),metadata={protocol:'player-matrix-v1',stage:'screen',split:'screen',sourceHashes,policyHash,taskStart:0,taskEnd:rows.length,expected:{runs:rows.length}},saved=await writeMatrixShard(path,metadata,rows);const manifest={format:'player-matrix-stage-v1',protocol:'player-matrix-v1',stage:'screen',split:'screen',sourceHashes,policyHash,count:rows.length,expected:{runs:rows.length},complete:true,sourceStable:true,completed:rows.length,policies:[{id:'p',kind:'matrix',T:{id:'baseline'},H:{id:'balanced'},J:{id:'mixed'},R:{id:'balanced'}}],plan:{worlds:2,reps:2,contexts:[{strategyId:'p',difficulty:10}]},shards:[{id:0,path:'part-000000.jsonl.gz',sha256:saved.sha256,count:rows.length,start:0,end:rows.length}]};const manifestPath=join(directory,'run-manifest.json');await writeFile(manifestPath,JSON.stringify(manifest));return {manifest,manifestPath,path};}

test('streaming manifest analysis verifies SHA, source, task counts and full world coverage',async t=>{
  const directory=await mkdtemp(join(tmpdir(),'matrix-analysis-'));t.after(()=>rm(directory,{recursive:true,force:true}));const fixture=await manifestFixture(directory),result=await analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100});
  assert.equal(result.report.attempts,4);assert.equal(result.report.cells[0].worlds,2);assert.equal(result.report.inputIdentity.shards.length,1);
  const output=join(directory,'summary.json');await writeAnalysisJson(output,result.report);assert.equal(JSON.parse(await readFile(output,'utf8')).cells[0].winRate,.5);
  const files=await writeMatrixAnalysis(join(directory,'overview'),result),overview=JSON.parse(await readFile(files.json,'utf8')),detail=gunzipSync(await readFile(files.details.path)).toString('utf8').trim().split('\n').map(JSON.parse);
  assert.equal(overview.cells[0].floors[0].metrics.netHp.mean,-2);assert.equal(overview.cells[0].floors[0].metrics.netHp.sd,undefined);assert.equal(detail[1].value.floors[0].metrics.netHp.sd,0);assert.equal(detail.at(-1).counts.cells,1);assert.equal(overview.details.sha256.length,64);
  const bad={...fixture.manifest,shards:[{...fixture.manifest.shards[0],sha256:'0'.repeat(64)}]};await writeFile(fixture.manifestPath,JSON.stringify(bad));await assert.rejects(analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100}),/SHA-256/);
  await writeFile(fixture.manifestPath,JSON.stringify({...fixture.manifest,sourceHashes:{'fixture.js':'b'.repeat(64)}}));await assert.rejects(analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100}),/source identity/);
  await assert.rejects(analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100,allowAnalyzerDrift:true}),/restricted/);
  await writeFile(fixture.manifestPath,JSON.stringify({...fixture.manifest,complete:false}));await assert.rejects(analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100}),/Incomplete stage/);
});
test('synthetic worker scope stays diagnostic even when its stage is named screen',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'matrix-synthetic-scope-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const fixture=await manifestFixture(directory);await writeFile(fixture.manifestPath,JSON.stringify({...fixture.manifest,scope:'synthetic-fixture-only-no-game-or-formal-evidence'}));
 const result=await analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100});
 assert.equal(result.report.inputIdentity.analyzerDrift.formalEligible,false);assert.match(result.report.scope,/diagnostic-not-formal/);
 await assert.rejects(analyzePlayerMatrixManifest(fixture.manifestPath,{bootstrapResamples:100,registration:{family:'matrix',questions:[]}}),/cannot enter formal/);
});
