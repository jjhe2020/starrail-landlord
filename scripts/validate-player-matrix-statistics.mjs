// Statistical qualification only: synthetic bounded observations, never game campaigns.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analysisRandom, binomialCdf, exactCenteredBinaryBootstrapP, centeredBootstrapTest, exactBinomialInterval } from '../src/player-matrix-analysis.js';
const projectRoot=fileURLToPath(new URL('..',import.meta.url));
const THRESHOLDS=[.025,.025/72,.025/96];
const exactCases=[
  {id:'paired-symmetric',n:1000,low:-1,high:1,pHigh:.5,range:[-1,1],scope:'two-strategy binary win contrast'},
  {id:'paired-asymmetric',n:1000,low:-.5,high:1,pHigh:1/3,range:[-1,1],scope:'two behavior replicas averaged within a world'},
  {id:'cleared-floors-skewed',n:1000,low:-.5,high:12,pHigh:.04,range:[-12,12],scope:'legal half-step paired cleared-floor difference'},
  {id:'interaction-symmetric',n:1000,low:-2,high:2,pHigh:.5,range:[-2,2],scope:'four arms [1,0,0,1] versus [0,1,1,0]'},
  {id:'interaction-asymmetric',n:1000,low:-.5,high:2,pHigh:.2,range:[-2,2],scope:'four arms [0,0,.5,0] versus [1,0,0,1]'},
];
const sparseCases=[
  {id:'sparse-paired-win',n:1000,values:[-1,0,1],probabilities:[.01,.98,.01],range:[-1,1]},
  {id:'rare-skewed-cleared-floors',n:1000,values:[-.5,0,12],probabilities:[.024,.975,.001],range:[-12,12]},
  {id:'rare-four-arm-interaction',n:1000,values:[-.5,0,2],probabilities:[.004,.995,.001],range:[-2,2]},
];
const boundedP=(n,estimate,range)=>Math.min(1,2*Math.exp(-2*n*estimate*estimate/(range[1]-range[0])**2));
export function exactNullQualification(spec) {
  const results=THRESHOLDS.map(alpha=>({alpha,originalBootstrapTypeI:0,formalGuardTypeI:0}));let mass=0;
  for(let k=0;k<=spec.n;k++){
    const probability=Math.max(0,binomialCdf(k,spec.n,spec.pHigh)-binomialCdf(k-1,spec.n,spec.pHigh));mass+=probability;
    const estimate=spec.low+(spec.high-spec.low)*k/spec.n,bootstrap=exactCenteredBinaryBootstrapP(k,spec.n,spec.pHigh),guard=boundedP(spec.n,estimate,spec.range);
    for(const row of results){if(bootstrap!==null&&bootstrap<=row.alpha)row.originalBootstrapTypeI+=probability;if(guard<=row.alpha)row.formalGuardTypeI+=probability;}
  }
  return {...spec,meanUnderNull:spec.low*(1-spec.pHigh)+spec.high*spec.pHigh,enumeratedMass:mass,results:results.map(row=>({...row,originalPassed:row.originalBootstrapTypeI<=row.alpha+1e-10,formalGuardPassed:row.formalGuardTypeI<=row.alpha+1e-10})),method:'exact binomial enumeration over all empirical high-counts; no outer Monte Carlo and no game RNG'};
}
export function sparseNullQualification(spec,{worldSamples=100000,seed='matrix-statistics-qualification-v1'}={}) {
  const random=analysisRandom(`${seed}:${spec.id}`),counts=THRESHOLDS.map(()=>0),breaks=[];let sum=0;
  for(const probability of spec.probabilities){sum+=probability;breaks.push(sum);}
  if(Math.abs(sum-1)>1e-12)throw Error('Synthetic probabilities must sum to one');
  const nullMean=spec.values.reduce((s,v,i)=>s+v*spec.probabilities[i],0);if(Math.abs(nullMean)>1e-12)throw Error('Synthetic null is not mean zero');
  for(let trial=0;trial<worldSamples;trial++){
    let total=0;for(let i=0;i<spec.n;i++){const draw=random();let index=0;while(index<breaks.length-1&&draw>=breaks[index])index++;total+=spec.values[index];}
    const p=boundedP(spec.n,total/spec.n,spec.range);THRESHOLDS.forEach((alpha,i)=>{if(p<=alpha)counts[i]++;});
  }
  return {...spec,meanUnderNull:nullMean,syntheticDatasets:worldSamples,results:THRESHOLDS.map((alpha,i)=>{const interval=exactBinomialInterval(counts[i],worldSamples);return {alpha,rejections:counts[i],observedTypeI:counts[i]/worldSamples,mcExact95:interval,empiricalUpperBelowNominal:interval[1]<=alpha};}),method:'independent synthetic bounded null datasets; qualifier is the theoretical guard, MC rate estimates are an implementation cross-check'};
}
export async function validateMatrixStatistics({worldSamples=100000,bootstrapResamples=100000}={}) {
  if(!Number.isSafeInteger(worldSamples)||worldSamples<20000||!Number.isSafeInteger(bootstrapResamples)||bootstrapResamples<10000)throw Error('Qualification budgets cannot be below 20000 datasets and 10000 bootstrap checks');
  const started=performance.now(),exact=exactCases.map(exactNullQualification),sparse=sparseCases.map(spec=>sparseNullQualification(spec,{worldSamples})),checks=[];
  for(const [id,k]of [['paired-symmetric',450],['cleared-floors-skewed',20],['interaction-asymmetric',170]]){
    const spec=exactCases.find(row=>row.id===id),values=Array.from({length:spec.n},(_,i)=>i<k?spec.high:spec.low),expected=exactCenteredBinaryBootstrapP(k,spec.n,spec.pHigh),actual=centeredBootstrapTest(values,{resamples:bootstrapResamples,seed:`matrix-statistics-mc-check:${id}`,mcConfidence:.99999});
    checks.push({id,empiricalHighCount:k,expectedExactResamplingTail:expected,observed:actual,passed:expected>=actual.pLower-1/bootstrapResamples&&expected<=actual.pUpper+1/bootstrapResamples});
  }
  const originalFailures=exact.flatMap(row=>row.results.filter(result=>!result.originalPassed).map(result=>({case:row.id,...result}))),guardPassed=exact.every(row=>Math.abs(row.enumeratedMass-1)<1e-8&&Math.abs(row.meanUnderNull)<1e-12&&row.results.every(result=>result.formalGuardPassed)),sparsePassed=sparse.every(row=>row.results.every(result=>result.empiricalUpperBelowNominal)),implementationPassed=checks.every(check=>check.passed);
  const hashes={};for(const path of ['src/player-matrix-analysis.js','scripts/validate-player-matrix-statistics.mjs'])hashes[path]=createHash('sha256').update(await readFile(resolve(projectRoot,path))).digest('hex');
  return {format:'player-matrix-statistics-qualification-v1',clientDate:'2026-10-26',passed:guardPassed&&sparsePassed&&implementationPassed,scope:'synthetic statistics qualification only; no game campaigns, no tuning of game/strategy/sample counts',formalMethod:'max(centered bootstrap MC conservative upper, Hoeffding bounded independent-world mean p); degenerate samples use bounded p',proof:{formula:'p_H = min(1, 2 exp(-2 N mean(D)^2 / (b-a)^2))',assumptions:['independent world blocks','each contrast lies within its pre-registered theoretical [a,b]','null mean equals zero','world replicas are averaged before constructing contrasts'],domination:'p_formal >= p_H, so rejecting at alpha is a subset of the valid bounded test rejection event. Holm remains valid under arbitrary dependence across tests.',reference:'https://www.tandfonline.com/doi/abs/10.1080/01621459.1963.10500830',powerLimitation:'The guard can substantially reduce power; fixed N=1000 does not guarantee 10pp differences are detectable.'},originalCenteredBootstrap:{passed:false,role:'approximate descriptive/diagnostic only; not a standalone formal p',exactFailureCount:originalFailures.length,failures:originalFailures},exactNullCases:exact,sparseNullCases:sparse,bootstrapImplementationChecks:checks,sourceHashes:hashes,elapsedMs:performance.now()-started};
}
export function renderStatisticsQualification(report){const lines=['# 玩家矩阵统计资格验证','',`结果：${report.passed?'正式保守方法资格通过':'资格未通过，禁止作正式确认结论'}。本次仅构造已知零均值的统计数据，没有运行游戏或调整数值。`,'','原中心化bootstrap在偏斜、有界零均值数据上失准，已明确保留失败结果。正式p取其MC保守上界与Hoeffding有界世界均值p的较大者；退化样本也使用有界p和非零宽保守区间。','',`耗时 ${(report.elapsedMs/1000).toFixed(2)} 秒；稀疏校验每类 ${report.sparseNullCases[0].syntheticDatasets.toLocaleString()} 个独立合成数据集，每集1000世界。`,'','| 已知零均值场景 | 单项α | 原bootstrap真实错误率 | 正式护栏真实错误率 |','| --- | ---: | ---: | ---: |'];for(const row of report.exactNullCases)for(const result of row.results)lines.push(`| ${row.id} | ${result.alpha.toExponential(4)} | ${result.originalBootstrapTypeI.toExponential(4)} | ${result.formalGuardTypeI.toExponential(4)} |`);lines.push('','完整精确枚举、稀疏数据MC区间、实现与精确重抽样分布复核、源码SHA均在JSON中。精确枚举结果不是抽样误差；稀疏MC只是实现复核，理论界是正式错误率保证的依据。','',`方法参考：[Hoeffding 1963 原论文](${report.proof.reference})。正式护栏会降低检出力，不能把不显著解释为平衡，也不追加游戏样本补到显著。`,'');return lines.join('\n');}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=new Map();for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i].replace(/^--/,'');if(!['output','world-samples','bootstrap-checks'].includes(key)||args.has(key)||!process.argv[i+1])throw Error('Use known unique --name value options');args.set(key,process.argv[i+1]);}
  const output=args.get('output');if(!output)throw Error('--output is required');const report=await validateMatrixStatistics({worldSamples:Number(args.get('world-samples')||100000),bootstrapResamples:Number(args.get('bootstrap-checks')||100000)});await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,JSON.stringify(report,null,2)+'\n');await writeFile(output.replace(/\.json$/,'')+'.md',renderStatisticsQualification(report));console.log(JSON.stringify({passed:report.passed,originalBootstrapPassed:report.originalCenteredBootstrap.passed,exactFailures:report.originalCenteredBootstrap.exactFailureCount,elapsedMs:report.elapsedMs,output}));if(!report.passed)process.exitCode=1;
}
