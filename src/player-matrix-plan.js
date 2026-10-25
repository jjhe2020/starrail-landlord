// Experimental task plans. No value here enters production game rules.
export const MATRIX_PROTOCOL = 'player-matrix-v1';
export const STANDARD = Object.freeze({ worldSeeds:16, behaviorReps:2, difficulties:20, shardSize:500, forkShardSize:1000, maxActions:1000, confirmationWorlds:1000, forkScreenEntries:128, forkConfirmEntries:1000, forkScreenSearch:512, forkConfirmSearch:4096, forkDifficulties:[4,8,12,16,20], affectedFloors:[2,4,6,8,10], kinds:['reroll','remove','supply'], branches:['A','B','C','D','E'] });
export const REFERENCE_POLICY = 'matrix:baseline|H:balanced|J:mixed|R:balanced';
export const rootPolicy = horizon => `matrix:baseline|H:${horizon}|J:mixed|R:balanced`;
export const HORIZONS = ['short','balanced','greedy'];
const taskKey = task => `${task.split}|${task.strategyId}|D${task.difficulty}|W${task.worldIndex}|B${task.behaviorRep}${task.replay ? `|repeat:${task.replay}` : ''}${task.cellId ? `|cell:${task.cellId}` : ''}${task.branch ? `|branch:${task.branch}` : ''}`;
export function finishTask(task) {
  const value={ ...task, seed:`matrix-v1:${task.split}:world:${task.worldIndex}`, behaviorSeed:`matrix-v1:${task.split}:world:${task.worldIndex}:behavior:${task.behaviorRep}` };
  value.trialKey=taskKey(value); return value;
}
export function pilotPolicies(policies) {
  const ids=policies.filter(p=>p.id.startsWith('matrix:baseline|')).map(p=>p.id);
  const teams=['path:巡猎','path:丰饶','path:记忆','element:冰','element:虚数','faction:星核猎手','faction:星穹列车','mixed:path:智识+faction:黑塔空间站'];
  ids.push('control:current-ai',...teams.map(team=>`matrix:${team}|H:balanced|J:mixed|R:balanced`));
  if(new Set(ids).size!==36 || ids.some(id=>!policies.some(p=>p.id===id))) throw Error('Pilot must contain the frozen 36 policies.');
  return ids;
}
export function buildCampaignPlan(stage, policies, {questions=[], cells=[], small=false}={}) {
  if(stage==='pilot') {
    const ids=pilotPolicies(policies), tasks=[];
    for(const difficulty of [2,10,18]) for(const strategyId of ids) {
      for(let worldIndex=0;worldIndex<18;worldIndex++) tasks.push(finishTask({split:'pilot',stage,strategyId,difficulty,worldIndex,behaviorRep:0,workers:8}));
      for(const replay of [4,1]) tasks.push(finishTask({split:'pilot',stage,strategyId,difficulty,worldIndex:0,behaviorRep:0,replay,workers:replay}));
    }
    return {stage,count:tasks.length,task:i=>tasks[i],worlds:18,reps:1,groups:[8,4,1],protocol:MATRIX_PROTOCOL};
  }
  if(stage==='screen') {
    const contexts=[]; for(let difficulty=1;difficulty<=20;difficulty++) for(const p of policies) contexts.push({strategyId:p.id,difficulty});
    const worlds=small?1:STANDARD.worldSeeds, reps=STANDARD.behaviorReps;
    return indexedPlan(stage,'screen',contexts,worlds,reps);
  }
  if(stage==='confirmation') {
    const map=new Map();
    for(const q of questions) for(const difficulty of q.difficulties || []) for(const strategyId of q.policyIds || q.strategies || q.profiles || []) {
      const key=`${strategyId}|${difficulty}`;if(!map.has(key))map.set(key,{strategyId,difficulty,questionIds:[]});map.get(key).questionIds.push(q.id);
    }
    return indexedPlan(stage,'confirmation',[...map.values()].sort((a,b)=>a.difficulty-b.difficulty || a.strategyId.localeCompare(b.strategyId)),small?2:STANDARD.confirmationWorlds,STANDARD.behaviorReps);
  }
  if(stage==='fork-roots') {
    const contexts=[];for(const difficulty of STANDARD.forkDifficulties)for(const h of HORIZONS)contexts.push({strategyId:rootPolicy(h),difficulty});
    return indexedPlan(stage,'fork-roots',contexts,small?2:STANDARD.forkScreenSearch,1);
  }
  if(stage==='fork-confirm-roots') {
    const contexts=cells.map(cell=>({cellId:cell.id || cell.cellId,difficulty:cell.difficulty,targetFloor:cell.affectedFloor || cell.floor,targetKind:cell.kind}));
    const worlds=small?2:STANDARD.forkConfirmSearch;
    return {stage,protocol:MATRIX_PROTOCOL,count:contexts.length*worlds, task(index){const c=contexts[index%contexts.length], worldIndex=Math.floor(index/contexts.length);return finishTask({...c,stage,split:'fork-confirm-roots',worldIndex,behaviorRep:0,strategyId:rootPolicy(HORIZONS[worldIndex%3])});}};
  }
  throw Error(`Unknown campaign stage ${stage}`);
}
function indexedPlan(stage,split,contexts,worlds,reps) {
  return {stage,protocol:MATRIX_PROTOCOL,contexts,worlds,reps,count:contexts.length*worlds*reps,task(index){if(index<0||index>=this.count)throw Error('Task index outside plan');const behaviorRep=index%reps, c=contexts[Math.floor(index/reps)%contexts.length],worldIndex=Math.floor(index/(reps*contexts.length));return finishTask({...c,stage,split,worldIndex,behaviorRep});}};
}
export function buildForkPlan(stage,entries) {
  const split=stage==='fork-confirmation'?'fork-confirmation':'fork-screen';
  return {stage,protocol:MATRIX_PROTOCOL,count:entries.length*10,task(index){const behaviorRep=index%2,branch=STANDARD.branches[Math.floor(index/2)%5],entry=entries[Math.floor(index/10)];return finishTask({stage,split,strategyId:entry.strategyId || entry.policyId || entry.snapshot?.policy?.id,difficulty:entry.difficulty,worldIndex:entry.worldIndex,behaviorRep,branch,cellId:entry.cellId,entryId:entry.id,entryIndex:Math.floor(index/10),affectedFloor:entry.affectedFloor,kind:entry.kind});}};
}
export function describePlan(plan) {return {protocol:MATRIX_PROTOCOL,stage:plan.stage,count:plan.count,worlds:plan.worlds,reps:plan.reps,contexts:plan.contexts};}
