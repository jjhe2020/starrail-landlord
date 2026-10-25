// Statistics for the experimental player matrix. This module never imports game rules.
export const ANALYSIS_VERSION = 'player-matrix-analysis-v1';
export const AXES = Object.freeze(['T', 'H', 'J', 'R']);
const finite = Number.isFinite;
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const canonical = value => Array.isArray(value) ? value.map(canonical) : object(value) ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const canonicalStringify = value => JSON.stringify(canonical(value));
function hash(text) { let value = 2166136261; for (const char of String(text)) { value ^= char.charCodeAt(0); value = Math.imul(value, 16777619); } return value >>> 0 || 1; }
export function analysisRandom(seed = 'matrix-analysis-v1') { let value = hash(seed); return () => { value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return (value >>> 0) / 4294967296; }; }
export function quantile(values, probability) { if (!values.length) return null; const sorted = [...values].sort((a,b) => a-b), at = (sorted.length-1)*probability, lo = Math.floor(at), hi = Math.ceil(at); return sorted[lo] + (sorted[hi]-sorted[lo])*(at-lo); }
export function wilsonInterval(wins, n, z = 1.959963984540054) { if (!n) return null; const p=wins/n, den=1+z*z/n, center=(p+z*z/(2*n))/den, radius=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den; return [Math.max(0,center-radius),Math.min(1,center+radius)]; }

// Continued-fraction incomplete beta, used only for finite Monte Carlo/binomial bounds.
function logGamma(z) { const c=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7]; if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z--;let x=.99999999999980993;for(let i=0;i<c.length;i++)x+=c[i]/(z+i+1);const t=z+c.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x); }
function betaFraction(a,b,x) { const tiny=1e-300;let c=1,d=1-(a+b)*x/(a+1);d=1/(Math.abs(d)<tiny?tiny:d);let h=d;for(let m=1;m<=500;m++){const m2=2*m;let aa=m*(b-m)*x/((a+m2-1)*(a+m2));d=1+aa*d;if(Math.abs(d)<tiny)d=tiny;c=1+aa/c;if(Math.abs(c)<tiny)c=tiny;d=1/d;h*=d*c;aa=-(a+m)*(a+b+m)*x/((a+m2)*(a+m2+1));d=1+aa*d;if(Math.abs(d)<tiny)d=tiny;c=1+aa/c;if(Math.abs(c)<tiny)c=tiny;d=1/d;const delta=d*c;h*=delta;if(Math.abs(delta-1)<3e-13)break;}return h; }
function regularizedBeta(x,a,b) { if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b; }
function betaQuantile(p,a,b) { let lo=0,hi=1;for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(regularizedBeta(mid,a,b)<p)lo=mid;else hi=mid;}return (lo+hi)/2; }
export function exactBinomialInterval(wins,n,confidence=.95) { if(!Number.isSafeInteger(wins)||!Number.isSafeInteger(n)||n<0||wins<0||wins>n)throw Error('Invalid binomial counts');if(!n)return null;const alpha=1-confidence;return [wins===0?0:betaQuantile(alpha/2,wins,n-wins+1),wins===n?1:betaQuantile(1-alpha/2,wins+1,n-wins)]; }
export function binomialCdf(k,n,p) { if(k<0)return 0;if(k>=n)return 1;if(p===0)return 1;if(p===1)return 0;return clamp(regularizedBeta(1-p,n-k,k+1),0,1); }
export function exactCenteredBinaryBootstrapP(k,n,p0) {
  if(k===0||k===n)return null;
  const distance=Math.abs(k-n*p0);if(distance<1e-12)return 1;
  const lo=Math.floor(k-distance+1e-10),hi=Math.ceil(k+distance-1e-10),p=k/n;
  return Math.min(1,binomialCdf(lo,n,p)+1-binomialCdf(hi-1,n,p));
}
export function boundedMeanPValue(values,range=[-1,1]) {
  if(!values.length)return null;if(values.some(value=>!finite(value)||value<range[0]-1e-12||value>range[1]+1e-12))throw Error('World contrast exceeds declared theoretical range');
  const estimate=mean(values),width=range[1]-range[0];if(!(width>0))throw Error('Invalid theoretical range');
  return Math.min(1,2*Math.exp(-2*values.length*estimate*estimate/(width*width)));
}
export function conservativeMeanInterval(values,range,confidence=.95) { if(!values.length)return null;const center=mean(values), radius=(range[1]-range[0])*Math.sqrt(Math.log(2/(1-confidence))/(2*values.length));return [clamp(center-radius,...range),clamp(center+radius,...range)]; }
const bootstrapCache=new Map();
export function bootstrapMeanInterval(values,{resamples=10000,seed='matrix-ci-v1',confidence=.95,range=[0,1]}={}) {
  if(!Number.isSafeInteger(resamples)||resamples<1)throw Error('Invalid bootstrap count');
  if(!values.length)return {n:0,estimate:null,ci95:null,method:'no-data',degenerate:true};
  if(values.some(value=>!finite(value)))throw Error('Nonfinite bootstrap sample');
  const sorted=[...values].sort((a,b)=>a-b),estimate=mean(sorted),degenerate=sorted[0]===sorted.at(-1);
  if(sorted.length<2||degenerate)return {n:sorted.length,estimate,ci95:conservativeMeanInterval(sorted,range,confidence),method:'bounded-mean-conservative',degenerate:true,resamples:0};
  const key=canonicalStringify([sorted,confidence,resamples,range,seed]);
  if(bootstrapCache.has(key))return {...bootstrapCache.get(key)};
  const random=analysisRandom(seed+':'+canonicalStringify(sorted)),samples=new Float64Array(resamples);
  for(let b=0;b<resamples;b++){let sum=0;for(let i=0;i<sorted.length;i++)sum+=sorted[Math.floor(random()*sorted.length)];samples[b]=sum/sorted.length;}
  samples.sort();const alpha=1-confidence,at=p=>{const index=(samples.length-1)*p,lo=Math.floor(index),hi=Math.ceil(index);return samples[lo]+(samples[hi]-samples[lo])*(index-lo);};
  const result={n:sorted.length,estimate,ci95:[at(alpha/2),at(1-alpha/2)],method:'world-block-percentile-bootstrap',degenerate:false,resamples};
  if(bootstrapCache.size<20000)bootstrapCache.set(key,result);return {...result};
}
export function centeredBootstrapTest(values,{resamples=100000,seed='matrix-null-v1',mcConfidence=.99999}={}) {
  if(!Number.isSafeInteger(resamples)||resamples<1)throw Error('Invalid bootstrap count');
  if(values.length<2||values.some(value=>!finite(value)))return {p:null,reason:'insufficient-worlds',n:values.length,resamples:0};
  const estimate=mean(values);if(values.every(value=>value===values[0]))return {p:null,reason:'degenerate-differences',n:values.length,estimate,resamples:0};
  if(Math.abs(estimate)<1e-15)return {p:1,pLower:1,pUpper:1,exceedances:resamples,resamples,n:values.length,estimate,mcConfidence};
  const centered=values.map(value=>value-estimate),random=analysisRandom(seed),threshold=Math.abs(estimate)-1e-12*(1+Math.abs(estimate));let exceedances=0;
  for(let b=0;b<resamples;b++){let sum=0;for(let i=0;i<centered.length;i++)sum+=centered[Math.floor(random()*centered.length)];if(Math.abs(sum/centered.length)>=threshold)exceedances++;}
  const bounds=exactBinomialInterval(exceedances,resamples,mcConfidence),plus=value=>(value*resamples+1)/(resamples+1);
  return {p:(exceedances+1)/(resamples+1),pLower:plus(bounds[0]),pUpper:plus(bounds[1]),exceedances,resamples,n:values.length,estimate,mcConfidence,method:'centered-world-block-bootstrap-plus-one'};
}
export function adjustHolm(tests,{alpha=.025,familySize=tests.length,pField='p'}={}) {
  if(familySize<tests.length)throw Error('Family size cannot omit registered tests');
  const sorted=tests.map((test,index)=>({...test,_index:index})).filter(test=>finite(test[pField])).sort((a,b)=>a[pField]-b[pField]||a._index-b._index);let adjusted=0;
  const byIndex=new Map();for(let rank=0;rank<sorted.length;rank++){const row=sorted[rank];adjusted=Math.max(adjusted,Math.min(1,row[pField]*(familySize-rank)));byIndex.set(row._index,{adjustedP:adjusted,rejected:adjusted<=alpha});}
  return tests.map((test,index)=>({...test,...(byIndex.get(index)||{adjustedP:null,rejected:false}),alpha,familySize}));
}
export function adjustByFdr(tests,{q=.10}={}) { const sorted=tests.map((test,index)=>({...test,_index:index})).filter(test=>finite(test.p)).sort((a,b)=>a.p-b.p||a._index-b._index),m=sorted.length,harmonic=Array.from({length:m},(_,i)=>1/(i+1)).reduce((a,b)=>a+b,0),out=new Map();let previous=1;for(let i=m-1;i>=0;i--){previous=Math.min(previous,sorted[i].p*m*harmonic/(i+1));out.set(sorted[i]._index,previous);}return tests.map((test,i)=>({...test,adjustedQ:out.get(i)??null,discovery:out.has(i)&&out.get(i)<=q,q,method:'BY-exploratory'})); }

function moment(){return {n:0,sum:0,sumSquares:0,min:Infinity,max:-Infinity,trajectoryN:0,trajectorySum:0};}
function addMoment(target,value){if(!finite(value))return;target.n++;target.sum+=value;target.sumSquares+=value*value;target.min=Math.min(target.min,value);target.max=Math.max(target.max,value);}
function describeMoment(target){return {worlds:target.n,observedTrajectories:target.trajectoryN,mean:target.trajectoryN?target.trajectorySum/target.trajectoryN:null,worldMean:target.n?target.sum/target.n:null,sd:target.n>1?Math.sqrt(Math.max(0,(target.sumSquares-target.sum*target.sum/target.n)/(target.n-1))):null};}
const FLOOR_METRICS=['spinsUsed','deadline','spinsLeft','marginRatio','netHp','netShield','healed','shieldGained','enemyHpLost','selfDamage','pollutionHpLost','shieldBlocked','shieldDecayed','income','spending','freeRerolls','paidRerolls','removalsUsed','repairPurchases','barrierPurchases','overclockPurchases','maxHpChange','shieldOtherLoss','damage','rosterSize','distinctCharacters','permanentAttackIssued','permanentAttackRetained','recruitRewards','itemRewards','essenceRewards','skippedRewards'];
function floorMeasures(row){const end=row.C||row.B;return {spinsUsed:row.turnsUsed??row.spinsUsed,deadline:row.deadline??row.A?.deadline,spinsLeft:row.spinsLeft,marginRatio:row.marginRatio,...row.health,...Object.fromEntries(Object.entries(row.resources||{}).filter(([,v])=>finite(v))),repairPurchases:row.resources?.supplies?.repair,barrierPurchases:row.resources?.supplies?.barrier,overclockPurchases:row.resources?.supplies?.overclock,maxHpChange:row.health?.maxHpChange,shieldOtherLoss:row.health?.shieldOtherLoss,damage:row.damage,rosterSize:end?.rosterSize,distinctCharacters:end?.distinctCharacters,permanentAttackIssued:row.permanentAttackIssued,permanentAttackRetained:end?.permanentAttackRetained,recruitRewards:row.rewards?.recruit,itemRewards:row.rewards?.item,essenceRewards:row.rewards?.essence,skippedRewards:row.rewards?.skipped};}
function compactRun(run){
  if(run.conservationPassed===false)throw Error('Unreconciled run cannot enter analysis');
  if(run.won!==undefined&&run.won!==(run.phase==='victory'))throw Error('Terminal win flag contradicts phase');
  const clearedCount=run.clearedFloors??(run.phase==='victory'?12:Math.max(0,(run.floor||1)-1));
  if(!Number.isInteger(clearedCount)||clearedCount<0||clearedCount>12)throw Error('Invalid cleared floor count');
  const floors=run.floors||[];
  if(!Array.isArray(floors)||floors.some(row=>!Number.isInteger(row.floor)||row.floor<1||row.floor>12))throw Error('Invalid floor telemetry');
  if(new Set(floors.map(row=>row.floor)).size!==floors.length)throw Error('Duplicate floor telemetry');
  if(floors.some(row=>row.conservation?.passed===false||row.conservation?.battle?.passed===false||row.conservation?.total?.passed===false))throw Error('Unreconciled floor cannot enter analysis');
  return {phase:run.phase,won:run.phase==='victory'||run.won===true,stopped:run.stopped||null,clearedFloors:run.clearedFloors??(run.phase==='victory'?12:Math.max(0,(run.floor||1)-1)),floor:run.floor||1,death:run.death||null,floors:floors.map(row=>({floor:row.floor,reached:row.reached!==false,cleared:row.cleared===true,failed:row.failed===true,cause:row.cause||null,values:floorMeasures(row)}))};
}
const terminal = run=>!run.stopped&&['victory','defeat'].includes(run.phase);
function newFloorSummary(floor){return {floor,reached:0,cleared:0,failed:0,hpFailures:0,deadlineFailures:0,unfinishedAfterArrival:0,notReachedAfterFailure:0,notReachedIncomplete:0,lastSpinClears:0,clearTrajectories:0,clearMargins:[],clearSpins:[],failedSpins:[],metrics:Object.fromEntries(FLOOR_METRICS.map(key=>[key,moment()]))};}
function newCell(meta){return {...meta,trajectories:0,sourcePolicyIds:new Set([meta.strategyId]),worlds:new Map(),floors:Array.from({length:12},(_,i)=>newFloorSummary(i+1))};}
function normalizeMeta(run){
  const fork=run.fork||{},cellId=fork.cellId||run.cellId,branch=fork.branch||run.branch;
  const world=run.worldIndex??run.entryWorldIndex??fork.entryWorldIndex;
  if(!Number.isSafeInteger(world)||world<0||!Number.isInteger(run.behaviorRep)||run.behaviorRep<0)throw Error('World index and behavior replicate are required');
  if(typeof run.strategyId!=='string'||!run.strategyId||!Number.isInteger(run.difficulty)||run.difficulty<1||run.difficulty>20)throw Error('Invalid matrix cell identity');
  const split=String(run.split||'unspecified');
  if(cellId&&(!['A','B','C','D','E'].includes(branch)||!Number.isInteger(fork.affectedFloor??run.affectedFloor)))throw Error('Invalid process branch identity');
  return {split,strategyId:run.strategyId,difficulty:run.difficulty,worldKey:String(world),worldIndex:world,behaviorRep:run.behaviorRep,cellId:cellId||null,branch:branch||null,affectedFloor:fork.affectedFloor??run.affectedFloor??null,kind:fork.kind||run.kind||null};
}
function cellKey(meta){return meta.cellId?`${meta.split}|fork:${meta.cellId}|${meta.branch}`:`${meta.split}|${meta.strategyId}|D${meta.difficulty}`;}
export function createMatrixAggregator({behaviorReps=2,bootstrapResamples=10000,analysisSeed='matrix-analysis-v1'}={}) {
  const cells=new Map(),trialKeys=new Set();let attempts=0,replays=0;
  function add(run){
    if(!object(run)||typeof run.trialKey!=='string'||!run.trialKey)throw Error('Missing trial key');
    if(trialKeys.has(run.trialKey))throw Error('Duplicate trial key across input shards');trialKeys.add(run.trialKey);attempts++;
    if(run.replay){replays++;return;}
    const meta=normalizeMeta(run),key=cellKey(meta);if(!cells.has(key))cells.set(key,newCell({...meta,key,worldKey:undefined,worldIndex:undefined,behaviorRep:undefined}));
    const cell=cells.get(key);cell.sourcePolicyIds.add(meta.strategyId);if(cell.difficulty!==meta.difficulty||cell.affectedFloor!==meta.affectedFloor||cell.kind!==meta.kind)throw Error('Inconsistent process cell metadata');
    if(!cell.worlds.has(meta.worldKey))cell.worlds.set(meta.worldKey,{worldKey:meta.worldKey,reps:new Map(),committed:false});
    const block=cell.worlds.get(meta.worldKey);if(block.reps.has(meta.behaviorRep))throw Error('Duplicate behavior replicate within a world');
    if(meta.behaviorRep>=behaviorReps)throw Error('Unexpected behavior replicate');
    block.reps.set(meta.behaviorRep,compactRun(run));cell.trajectories++;
    if(block.reps.size===behaviorReps)commitFloorMetrics(cell,block);
  }
  function commitFloorMetrics(cell,block){
    if(block.committed)return;block.committed=true;
    for(const target of cell.floors){const values=Object.fromEntries(FLOOR_METRICS.map(key=>[key,[]]));
      for(const row of block.reps.values()){
        const floor=row.floors.find(entry=>entry.floor===target.floor);
        if(!floor){if(row.phase==='defeat')target.notReachedAfterFailure++;else target.notReachedIncomplete++;continue;}
        if(floor.reached)target.reached++;
        if(floor.cleared){target.cleared++;target.clearTrajectories++;if(floor.values.spinsLeft===0)target.lastSpinClears++;if(finite(floor.values.spinsLeft))target.clearMargins.push(floor.values.spinsLeft);if(finite(floor.values.spinsUsed))target.clearSpins.push(floor.values.spinsUsed);}
        if(floor.failed){target.failed++;if(finite(floor.values.spinsUsed))target.failedSpins.push(floor.values.spinsUsed);if((floor.cause||row.death)==='hp')target.hpFailures++;if((floor.cause||row.death)==='deadline')target.deadlineFailures++;}
        if(floor.reached&&!floor.cleared&&!floor.failed)target.unfinishedAfterArrival++;
        for(const key of FLOOR_METRICS){if(['spinsLeft','marginRatio'].includes(key)&&!floor.cleared)continue;if(finite(floor.values[key]))values[key].push(floor.values[key]);}
      }
      for(const key of FLOOR_METRICS)if(values[key].length){const measure=target.metrics[key];addMoment(measure,mean(values[key]));measure.trajectoryN+=values[key].length;measure.trajectorySum+=values[key].reduce((sum,value)=>sum+value,0);}
    }
    // Keep only block outcomes after the behavior replicas have been folded.
    for(const row of block.reps.values())for(const floor of row.floors)delete floor.values;
  }
  function summarize(){
    const summaries=[];
    for(const cell of cells.values()){
      // A partial world remains visible but never masquerades as a complete block.
      const blocks=[...cell.worlds.values()],completeBlocks=blocks.filter(block=>block.reps.size===behaviorReps),rows=completeBlocks.flatMap(block=>[...block.reps.values()]),finished=rows.filter(terminal),worldWins=[],worldClears=[],firstWins=[];
      for(const block of completeBlocks){const reps=[...block.reps.values()];if(reps.every(terminal)){worldWins.push(mean(reps.map(row=>Number(row.won))));worldClears.push(mean(reps.map(row=>row.clearedFloors)));firstWins.push(Number(block.reps.get(0).won));}}
      const n=rows.length,wins=finished.filter(row=>row.won).length,incomplete=rows.length-finished.length;
      summaries.push({key:cell.key,split:cell.split,strategyId:cell.cellId&&cell.sourcePolicyIds.size>1?'mixed-root-policies':cell.strategyId,sourcePolicyIds:[...cell.sourcePolicyIds].sort(),difficulty:cell.difficulty,cellId:cell.cellId,branch:cell.branch,kind:cell.kind,affectedFloor:cell.affectedFloor,trajectories:cell.trajectories,worlds:blocks.length,completeBehaviorWorlds:completeBlocks.length,incompleteBehaviorWorlds:blocks.length-completeBlocks.length,summaryDenominatorTrajectories:rows.length,excludedPartialBehaviorTrajectories:cell.trajectories-rows.length,terminalTrajectories:finished.length,incompleteTrajectories:incomplete,observedWins:wins,winRate:worldWins.length?mean(worldWins):null,winRateBoundsIncludingIncomplete:n?[wins/n,(wins+incomplete)/n]:null,winRateInference:{...bootstrapMeanInterval(worldWins,{resamples:bootstrapResamples,seed:analysisSeed,range:[0,1]}),firstRepWilson95:wilsonInterval(firstWins.reduce((a,b)=>a+b,0),firstWins.length),firstRepExact95:(!firstWins.includes(0)||!firstWins.includes(1))&&firstWins.length?exactBinomialInterval(firstWins.reduce((a,b)=>a+b,0),firstWins.length):null},clearedFloors:bootstrapMeanInterval(worldClears,{resamples:bootstrapResamples,seed:analysisSeed,range:[0,12]}),floors:cell.floors.map(target=>({floor:target.floor,reached:target.reached,cleared:target.cleared,failed:target.failed,hpFailures:target.hpFailures,deadlineFailures:target.deadlineFailures,unfinishedAfterArrival:target.unfinishedAfterArrival,notReachedAfterFailure:target.notReachedAfterFailure,notReachedIncomplete:target.notReachedIncomplete,cumulativeArrival:n?target.reached/n:null,cumulativeArrivalIsLowerBound:target.notReachedIncomplete>0,cumulativeClear:n?target.cleared/n:null,cumulativeClearIsLowerBound:incomplete>0,failureGivenArrival:target.reached?target.failed/target.reached:null,failureGivenArrivalIsLowerBound:target.unfinishedAfterArrival>0,clearMargin:{distributionUnit:'cleared trajectories, descriptive only; independent inference uses worlds',trajectories:target.clearTrajectories,p10:quantile(target.clearMargins,.1),p50:quantile(target.clearMargins,.5),p90:quantile(target.clearMargins,.9),lastSpinClears:target.lastSpinClears,lastSpinClearRate:target.clearTrajectories?target.lastSpinClears/target.clearTrajectories:null},clearSpinsUsed:{trajectories:target.clearSpins.length,p10:quantile(target.clearSpins,.1),p50:quantile(target.clearSpins,.5),p90:quantile(target.clearSpins,.9)},failedSpinsUsed:{trajectories:target.failedSpins.length,p10:quantile(target.failedSpins,.1),p50:quantile(target.failedSpins,.5),p90:quantile(target.failedSpins,.9)},metrics:Object.fromEntries(Object.entries(target.metrics).filter(([,value])=>value.n>0).map(([key,value])=>[key,describeMoment(value)]))}))});
    }
    return {version:ANALYSIS_VERSION,scope:'description-only-unless-independent-confirmation-is-registered',independentUnit:'world seed; behavior replicas averaged within world',conditionalMetricMethod:'mean is the observed conditional trajectory ratio; worldMean and sd describe within-world conditional averages. No trajectory-level independence is assumed.',attempts,replayExecutions:replays,behaviorReps,cells:summaries.sort((a,b)=>a.split.localeCompare(b.split)||a.difficulty-b.difficulty||a.key.localeCompare(b.key)),warnings:['宽区间和不显著不能解释为平衡。','条件余裕只包含清关者；未到达和未完成单列。','世界内行为复本不增加独立样本数。']};
  }
  return {add,summarize,cells,get attempts(){return attempts;},get replayExecutions(){return replays;},behaviorReps};
}
export function summarizeMatrixRuns(runs,options={}) {const aggregator=createMatrixAggregator(options);for(const run of runs)aggregator.add(run);return aggregator.summarize();}

export function policyAxes(policy){return Object.fromEntries(AXES.map(axis=>{const fallback={T:'teamId',H:'horizonId',J:'randomnessId',R:'resourceId'}[axis];return [axis,String(policy[axis]?.id??policy[axis]??policy[fallback]??'')];}));}
const axisOrder={H:['short','balanced','greedy'],J:['deterministic','mixed','random','uniform'],R:['active','balanced','reserve']};
const compareAxis=(axis,a,b)=>axisOrder[axis] ? axisOrder[axis].indexOf(a)-axisOrder[axis].indexOf(b) || a.localeCompare(b) : a.localeCompare(b);
const mainPolicy=policy=>policy.kind!=='control'&&!policy.id.startsWith('control:');
const rate=cell=>cell?.winRate;
const cleared=cell=>typeof cell?.clearedFloors==='number'?cell.clearedFloors:cell?.clearedFloors?.estimate;
function indexedSummary(summary){const map=new Map();for(const cell of summary.cells||[])if(!cell.cellId){const key=`${cell.strategyId}|${cell.difficulty}`;if(map.has(key)&&map.get(key).split!==cell.split)throw Error('Select questions from one screening split only');map.set(key,cell);}return map;}
function neighboringDifficulties(center){return [...new Set([Math.max(1,center-2),center,Math.min(20,center+2)])].sort((a,b)=>a-b);}
function scoreContrast(ids,coefficients,index,metric){const out=[];for(let difficulty=1;difficulty<=20;difficulty++){const cells=ids.map(id=>index.get(`${id}|${difficulty}`));if(cells.some(cell=>!cell))continue;const values=cells.map(metric==='winRate'?rate:cleared);if(values.some(value=>!finite(value)))continue;out.push({difficulty,effect:values.reduce((sum,value,i)=>sum+value*coefficients[i],0),values});}return out;}
function bestSignal(rows,direction=0){return rows.filter(row=>Math.abs(row.effect)>1e-12&&(!direction||Math.sign(row.effect)===direction)).sort((a,b)=>Math.abs(b.effect)-Math.abs(a.effect)||a.difficulty-b.difficulty)[0];}
export function selectP2Questions(summary,{policies=summary.policies||[],confirmationSplit='confirmation',targetWorlds=1000,behaviorReps=2}={}) {
  const definitions=policies.filter(mainPolicy).map(policy=>({...policy,axes:policyAxes(policy)})),index=indexedSummary(summary),questions=[],missingQuotas=[],used=new Set();
  const make=(candidate,metric,signal)=>({...candidate,metric,screeningEffect:signal.effect,centerDifficulty:signal.difficulty,difficulties:neighboringDifficulties(signal.difficulty)});
  for(const axis of AXES){const groups=new Map();for(const policy of definitions){const key=AXES.filter(a=>a!==axis).map(a=>policy.axes[a]).join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(policy);}
    const candidates=[];for(const group of groups.values()){group.sort((a,b)=>compareAxis(axis,a.axes[axis],b.axes[axis])||a.id.localeCompare(b.id));for(let a=0;a<group.length;a++)for(let b=a+1;b<group.length;b++){const ids=[group[a].id,group[b].id];candidates.push({id:`pair:${axis}:${ids.join('>')}`,type:'pair',axis,policyIds:ids,coefficients:[-1,1]});}}
    for(const metric of ['winRate','clearedFloors'])for(const direction of [1,-1]){const choices=candidates.filter(c=>!used.has(c.id)).map(c=>({candidate:c,signal:bestSignal(scoreContrast(c.policyIds,c.coefficients,index,metric),direction)})).filter(c=>c.signal).sort((a,b)=>Math.abs(b.signal.effect)-Math.abs(a.signal.effect)||a.candidate.id.localeCompare(b.candidate.id));if(!choices.length){missingQuotas.push({axis,metric,direction,reason:'no-eligible-distinct-screening-signal'});continue;}const selected=choices[0];used.add(selected.candidate.id);questions.push(make(selected.candidate,metric,selected.signal));}
  }
  for(const [pair,quota] of [[['H','R'],3],[['H','T'],2],[['J','T'],2],[['J','R'],1]]){
    const [x,y]=pair,groups=new Map();for(const policy of definitions){const key=AXES.filter(a=>!pair.includes(a)).map(a=>policy.axes[a]).join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(policy);}
    const candidates=[];for(const group of groups.values()){const xs=[...new Set(group.map(p=>p.axes[x]))].sort((a,b)=>compareAxis(x,a,b)),ys=[...new Set(group.map(p=>p.axes[y]))].sort((a,b)=>compareAxis(y,a,b)),map=new Map(group.map(p=>[`${p.axes[x]}|${p.axes[y]}`,p]));for(let a=0;a<xs.length;a++)for(let b=a+1;b<xs.length;b++)for(let c=0;c<ys.length;c++)for(let d=c+1;d<ys.length;d++){const corners=[[xs[a],ys[c]],[xs[b],ys[c]],[xs[a],ys[d]],[xs[b],ys[d]]].map(([xx,yy])=>map.get(`${xx}|${yy}`));if(corners.some(p=>!p))continue;const ids=corners.map(p=>p.id),candidate={id:`interaction:${pair.join('')}:${ids.join('>')}`,type:'interaction',axis:pair.join(''),policyIds:ids,coefficients:[1,-1,-1,1]};let metric='winRate',rows=scoreContrast(ids,candidate.coefficients,index,metric);if(rows.length&&rows.every(row=>Math.abs(row.effect)<=1e-12)){metric='clearedFloors';rows=scoreContrast(ids,candidate.coefficients,index,metric);}const signal=bestSignal(rows);if(signal&&Math.abs(signal.effect)>1e-12)candidates.push({candidate,metric,signal});}}
    candidates.sort((a,b)=>Number(a.metric!=='winRate')-Number(b.metric!=='winRate')||Math.abs(b.signal.effect)-Math.abs(a.signal.effect)||a.candidate.id.localeCompare(b.candidate.id));let count=0;for(const choice of candidates){if(used.has(choice.candidate.id))continue;used.add(choice.candidate.id);questions.push(make(choice.candidate,choice.metric,choice.signal));if(++count===quota)break;}if(count<quota)missingQuotas.push({axis:pair.join(''),type:'interaction',requested:quota,actual:count,reason:'no-eligible-distinct-screening-signal'});
  }
  return {format:'player-matrix-confirmation-registration-v1',analysisVersion:ANALYSIS_VERSION,status:'frozen-before-independent-confirmation',selectionRule:'Pairs: four per axis, positive/negative winRate and clearedFloors slots, stable IDs. Interactions: nonzero winRate signals first; clearedFloors fallback only after winRate candidates, never compare raw units. Difficulty: strongest center plus clipped ±2.',screeningSplit:[...new Set((summary.cells||[]).map(c=>c.split))],confirmationSplit,targetWorlds,behaviorReps,family:'matrix',familyAlpha:.025,maxComparisons:72,questions,missingQuotas,budgetUpperRuns:questions.reduce((sum,q)=>sum+q.policyIds.length*q.difficulties.length*targetWorlds*behaviorReps,0),coverageNote:'Only registered questions receive confirmation; screening is not equivalence evidence.'};
}

function blockOutcome(block,metric){const rows=[...block.reps.values()];if(!rows.length||rows.some(row=>!terminal(row)))return null;return mean(rows.map(row=>metric==='winRate'?Number(row.won):row.clearedFloors));}
function riskOutcome(block,targetFloor){const values=[];for(const row of block.reps.values()){if(row.phase==='defeat'&&row.floor<=targetFloor)values.push(1);else if(row.clearedFloors>=targetFloor||(terminal(row)&&row.floor>targetFloor))values.push(0);else return null;}return mean(values);}
function hypothesisDefinitions(registration,family){if(family==='matrix')return registration.questions.flatMap(q=>q.difficulties.map(difficulty=>({id:`${q.id}|D${difficulty}`,questionId:q.id,difficulty,policyIds:q.policyIds,coefficients:q.coefficients||(q.type==='interaction'?[1,-1,-1,1]:[-1,1]),metric:q.metric||'winRate',type:q.type,range:q.metric==='clearedFloors'?(q.type==='interaction'?[-24,24]:[-12,12]):q.type==='interaction'?[-2,2]:[-1,1]})));return registration.cells.flatMap(cell=>['B','C','D','E'].flatMap(branch=>[0,1,2].map(offset=>({id:`${cell.id}|${branch}-A|F+${offset}`,cellId:cell.id,branch,offset,difficulty:cell.difficulty,affectedFloor:cell.affectedFloor,metric:'failureRisk',coefficients:[-1,1],range:[-1,1]}))));}
export function analyzeConfirmation(aggregator,registration,{family=registration.family||'matrix',bootstrapResamples=10000,testResamples=100000,refineResamples=1000000,analysisSeed='matrix-confirm-v1',mcConfidence=.99999,expectedSourceHashes}={}) {
  if(expectedSourceHashes&&canonicalStringify(registration.sourceHashes)!==canonicalStringify(expectedSourceHashes))throw Error('Registration source identity mismatch');
  const split=registration.confirmationSplit||(family==='matrix'?'confirmation':'fork-confirmation'),definitions=hypothesisDefinitions(registration,family),allCells=[...aggregator.cells.values()],rows=[];
  for(const definition of definitions){
    const arms=family==='matrix'?definition.policyIds.map(id=>allCells.find(cell=>!cell.cellId&&cell.split===split&&cell.strategyId===id&&cell.difficulty===definition.difficulty)):['A',definition.branch].map(branch=>allCells.find(cell=>cell.cellId===definition.cellId&&cell.branch===branch&&cell.split===split));
    const missingArms=arms.filter(cell=>!cell).length,worldKeys=arms[0]?[...arms[0].worlds.keys()].sort((a,b)=>Number(a)-Number(b)):[],values=[],armValues=arms.map(()=>[]);let missingWorlds=0;
    for(const worldKey of worldKeys){const blocks=arms.map(cell=>cell?.worlds.get(worldKey));if(blocks.some(block=>!block||block.reps.size!==registration.behaviorReps)){missingWorlds++;continue;}const outcomes=blocks.map(block=>family==='matrix'?blockOutcome(block,definition.metric):riskOutcome(block,definition.affectedFloor+definition.offset));if(outcomes.some(value=>!finite(value))){missingWorlds++;continue;}outcomes.forEach((value,i)=>armValues[i].push(value));values.push(outcomes.reduce((sum,value,i)=>sum+value*definition.coefficients[i],0));}
    const complete=missingArms===0&&missingWorlds===0&&values.length===registration.targetWorlds&&arms.every(cell=>cell.worlds.size===registration.targetWorlds),estimate=bootstrapMeanInterval(values,{resamples:bootstrapResamples,seed:analysisSeed+':'+definition.id,range:definition.range});
    const test=complete?centeredBootstrapTest(values,{resamples:testResamples,seed:analysisSeed+':'+definition.id,mcConfidence}):{p:null,reason:'registered-sample-incomplete',resamples:0};
    rows.push({...definition,formalCi95:conservativeMeanInterval(values,definition.range),boundedP:boundedMeanPValue(values,definition.range),worlds:values.length,expectedWorlds:registration.targetWorlds,missingArms,missingWorlds,complete,armMeans:armValues.map(mean),...estimate,test,values});
  }
  const alpha=registration.familyAlpha??.025,familySize=definitions.length,adjust=field=>adjustHolm(rows.map(row=>({id:row.id,p:row.complete&&finite(row.boundedP)?Math.max(row.boundedP,row.test[field]??row.boundedP):null})),{alpha,familySize});let lower=adjust('pLower'),upper=adjust('pUpper');const refine=rows.some((row,i)=>row.test.p!==null&&lower[i].rejected!==upper[i].rejected);
  if(refine){for(const row of rows)if(row.test.p!==null&&row.test.resamples>0)row.test=centeredBootstrapTest(row.values,{resamples:refineResamples,seed:analysisSeed+':'+row.id,mcConfidence});lower=adjust('pLower');upper=adjust('pUpper');}
  const bootstrapAdjusted=adjustHolm(rows.map(row=>({p:row.test.p})),{alpha,familySize});
  return {version:ANALYSIS_VERSION,family,alpha,familySize,independentUnit:'world seed',split,targetWorlds:registration.targetWorlds,numericalRefinement:refine,tests:rows.map((row,i)=>{const {values,...without}=row;return {...without,formalMethod:'max(centered-bootstrap MC upper, Hoeffding independent bounded-world mean p)',formalP:row.complete&&finite(row.boundedP)?Math.max(row.boundedP,row.test.pUpper??row.boundedP):null,bootstrapAdjustedPDiagnostic:bootstrapAdjusted[i].adjustedP,adjustedP:upper[i].adjustedP,conservativeAdjustedP:upper[i].adjustedP,rejected:upper[i].rejected,monteCarloUncertain:lower[i].rejected!==upper[i].rejected,status:!row.complete?'未完成计划样本':lower[i].rejected!==upper[i].rejected?'Monte Carlo边界未确定':upper[i].rejected?'独立确认存在差异（保守有界护栏）':row.test.p===null?'退化；保守界未排除差异':'未排除实质差异',interpretation:'不显著不代表等价或平衡；效应为登记策略的总效果。'};}),methodNote:'Centered bootstrap failed skewed bounded zero-mean calibration and is diagnostic only. Formal p is at least the valid Hoeffding bounded-independent-world mean p, then Holm uses its MC-conservative upper. Conservative formal CI is separate from the approximate descriptive bootstrap CI. This guard reduces power; fixed samples do not guarantee 10pp detection.'};
}
export function selectP3Cells(summary,{targetWorlds=1000,behaviorReps=2,confirmationSplit='fork-confirmation'}={}) {
  const groups=new Map();for(const cell of summary.cells||[])if(cell.cellId){const key=cell.cellId;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(cell);}
  const candidates=[];for(const [id,group] of groups){const control=group.find(cell=>cell.branch==='A');if(!control)continue;let score=0;for(const branch of group.filter(cell=>cell.branch!=='A'))for(let offset=0;offset<3;offset++){const floor=control.affectedFloor+offset,a=control.floors.filter(f=>f.floor<=floor).reduce((sum,f)=>sum+f.failed,0),b=branch.floors.filter(f=>f.floor<=floor).reduce((sum,f)=>sum+f.failed,0);if(control.trajectories&&branch.trajectories)score=Math.max(score,Math.abs(b/branch.trajectories-a/control.trajectories));}if(group.length===5&&control.completeBehaviorWorlds>0)candidates.push({id,difficulty:control.difficulty,affectedFloor:control.affectedFloor,kind:control.kind,screeningRiskDifference:score,screeningWorlds:Math.min(...group.map(c=>c.completeBehaviorWorlds))});}
  const selected=[],missingQuotas=[],used=new Set(),stage=floor=>floor<=4?'early':floor<=6?'mid':'late';
  function pick(list){const stages=new Set(selected.map(c=>stage(c.affectedFloor)));return [...list].sort((a,b)=>Number(stages.has(stage(a.affectedFloor)))-Number(stages.has(stage(b.affectedFloor)))||b.screeningRiskDifference-a.screeningRiskDifference||a.id.localeCompare(b.id))[0];}
  for(const kind of ['reroll','remove','supply'])for(let i=0;i<2;i++){const chosen=pick(candidates.filter(c=>c.kind===kind&&!used.has(c.id)));if(chosen){selected.push(chosen);used.add(chosen.id);}else missingQuotas.push({kind,requested:2,actual:selected.filter(c=>c.kind===kind).length});}
  for(let i=0;i<2;i++){const chosen=pick(candidates.filter(c=>!used.has(c.id)));if(chosen){selected.push(chosen);used.add(chosen.id);}}
  return {format:'player-matrix-process-registration-v1',analysisVersion:ANALYSIS_VERSION,status:'frozen-before-independent-confirmation',family:'process',familyAlpha:.025,maxComparisons:96,confirmationSplit,targetWorlds,behaviorReps,cells:selected,missingQuotas,budgetUpperContinuations:selected.length*5*targetWorlds*behaviorReps,coverageNote:'Conditional on eligible intended-resource opportunities; not all legal actions, all players, or unconditional population effects.'};
}
export function renderAnalysisMarkdown(report){
  const lines=['# 多维玩家矩阵统计摘要','',`分析版本：${ANALYSIS_VERSION}。独立单位为世界种子；行为复本先在世界内平均。`,'','本报告不设置目标胜率，不以不显著宣称平衡。'];
  if(report.inputIdentity?.analyzerDrift?.formalEligible===false||/smoke|diagnostic/.test(report.inputIdentity?.stage||''))lines.push('','**仅设施smoke诊断：不属于正式矩阵、胜率或平衡证据；显式放行的分析器漂移已记录，禁止据此登记正式确认问题。**');
  if(report.cells){lines.push('',`尝试 ${report.attempts} 条记录，调度重演 ${report.replayExecutions} 次；${report.cells.length} 个策略—难度/过程分支格。`,'','| 分区 | 难度 | 策略 | 世界 | 完整终局轨迹 | 未完成 | 通关率 |','| --- | ---: | --- | ---: | ---: | ---: | ---: |');for(const cell of report.cells.slice(0,80))lines.push(`| ${cell.split} | D${cell.difficulty} | ${cell.strategyId.replaceAll('|',' / ')}${cell.branch?' / '+cell.branch:''} | ${cell.worlds} | ${cell.terminalTrajectories} | ${cell.incompleteTrajectories} | ${cell.winRate===null?'—':(cell.winRate*100).toFixed(1)+'%'} |`);if(report.cells.length>80)lines.push('',`这里只预览前80格，全部${report.cells.length}格及逐关分母见JSON。`);}
  if(report.tests){lines.push('',`确认family：${report.family}，计划 ${report.familySize} 个比较，Holm α=${report.alpha}。`,'','| 比较 | 世界/计划 | 估计差 | 状态 |','| --- | ---: | ---: | --- |');for(const row of report.tests)lines.push(`| ${row.id.replaceAll('|',' / ')} | ${row.worlds}/${row.expectedWorlds} | ${row.estimate===null?'—':row.estimate.toFixed(4)} | ${row.status} |`);}
  lines.push('','条件余裕只描述到达/清关者；提前失败和未完成不能被静默删除。0胜、全胜或退化数据使用保守边界。统计显著性不是可玩性或平衡验收。','');return lines.join('\n');
}
