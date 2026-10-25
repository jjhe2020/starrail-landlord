import { createWriteStream } from 'node:fs';
import { readFile, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { hashFile, readMatrixShard } from './player-matrix-io.mjs';
import { ANALYSIS_VERSION, canonicalStringify, createMatrixAggregator, selectP2Questions, selectP3Cells, analyzeConfirmation, renderAnalysisMarkdown } from '../src/player-matrix-analysis.js';
const implementationFiles = ['src/player-matrix-analysis.js', 'scripts/analyze-player-matrix.mjs'];
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const equal = (a,b) => canonicalStringify(a) === canonicalStringify(b);

export async function analyzePlayerMatrixManifest(manifestPath, { allowIncomplete = false, allowAnalyzerDrift = false, bootstrapResamples = 10000, analysisSeed = 'matrix-analysis-v1', registration = null, family, testResamples = 100000, refineResamples = 1000000 } = {}) {
  manifestPath = resolve(manifestPath);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.format !== 'player-matrix-stage-v1') throw Error('Unsupported matrix stage manifest');
  if (manifest.sourceStable !== true) throw Error('Source stability was not verified');
  if (!manifest.complete && !allowIncomplete) throw Error('Incomplete stage: use --allow-incomplete true only for a labelled progress report');
  if (!manifest.sourceHashes || !Object.keys(manifest.sourceHashes).length) throw Error('Missing frozen source identity');
  if (!Array.isArray(manifest.shards)) throw Error('Missing matrix shards');
  const analyzerHashes=Object.fromEntries(await Promise.all(implementationFiles.map(async path=>[path,await hashFile(resolve(projectRoot,path))])));
  const analyzerDrift=implementationFiles.filter(path=>manifest.sourceHashes[path]!==analyzerHashes[path]);
  if(analyzerDrift.length&&!allowAnalyzerDrift)throw Error('Analyzer source identity drift: '+analyzerDrift.join(', '));
  const diagnosticScope=/synthetic|fixture|smoke|diagnostic/i.test(`${manifest.scope||''} ${manifest.stage} ${manifest.split}`);
  if(registration&&(diagnosticScope||analyzerDrift.length))throw Error('Diagnostic or synthetic execution cannot enter formal confirmation');
  if(allowAnalyzerDrift&&(!/smoke|diagnostic/.test(manifest.stage+' '+manifest.split)||registration))throw Error('Analyzer drift override is restricted to non-confirmatory smoke diagnostics');

  const expectedReps = manifest.plan?.reps || (manifest.stage === 'pilot' || manifest.stage.includes('roots') ? 1 : 2);
  const aggregator = createMatrixAggregator({ behaviorReps: expectedReps, bootstrapResamples, analysisSeed });
  const policiesById=new Map((manifest.policies||[]).map(policy=>[policy.id,policy]));
  const sourceFiles = [], sorted = [...manifest.shards].sort((a,b) => a.start-b.start || a.id-b.id), indices = new Set();
  const contexts = manifest.plan?.contexts;
  const allowed = contexts?.length ? new Set(contexts.filter(c => c.strategyId).map(c => `${c.strategyId}|${c.difficulty}`)) : null;
  let observed = 0, nextStart = 0;
  for (const shard of sorted) {
    if (indices.has(shard.id)) throw Error('Duplicate shard identity'); indices.add(shard.id);
    if (shard.start !== nextStart || shard.end !== shard.start + shard.count) throw Error('Shard task index gap or overlap');
    const path = resolve(dirname(manifestPath), shard.path);
    const sha256 = await hashFile(path);
    if (sha256 !== shard.sha256) throw Error(`Shard SHA-256 mismatch: ${shard.path}`);
    let count = 0, header;
    for await (const row of readMatrixShard(path)) {
      if (row.kind === 'header') {
        header = row.value;
        if (!equal(header.sourceHashes, manifest.sourceHashes)) throw Error('Shard source identity differs from manifest');
        if (header.protocol !== manifest.protocol || header.stage !== manifest.stage || header.split !== manifest.split || header.policyHash !== manifest.policyHash) throw Error('Shard experiment identity differs from manifest');
        if (header.expected?.runs !== shard.count || header.taskStart !== shard.start || header.taskEnd !== shard.end) throw Error('Shard task/count identity differs from manifest');
      } else if (row.kind === 'run') {
        const run = row.value;
        if(policiesById.size&&!policiesById.has(run.strategyId))throw Error('Run strategy is not registered');
        if(run.strategy&&policiesById.has(run.strategyId)&&!equal(run.strategy,policiesById.get(run.strategyId)))throw Error('Run strategy parameters differ from frozen registry');
        if (run.split !== manifest.split || run.stage !== manifest.stage) throw Error('Run split/stage differs from frozen manifest');
        if (run.index !== undefined && run.index !== shard.start + count) throw Error('Run task index is missing or out of order');
        if (allowed?.size && !allowed.has(`${run.strategyId}|${run.difficulty}`)) throw Error('Run lies outside registered strategy/difficulty contexts');
        if (manifest.plan?.worlds && run.worldIndex >= manifest.plan.worlds) throw Error('Run world index outside registered range');
        aggregator.add(run); count++; observed++;
      }
    }
    if (!header || count !== shard.count) throw Error('Observed shard count mismatch');
    sourceFiles.push({ path, sha256, count, start: shard.start, end: shard.end }); nextStart = shard.end;
  }
  if (manifest.completed !== observed) throw Error('Manifest observed count does not match raw shards');
  if (manifest.complete && observed !== manifest.count) throw Error('Completed stage is missing planned trials');
  if (allowed?.size && manifest.complete && !manifest.stage.includes('roots')) {
    for (const context of contexts) {
      const cell = [...aggregator.cells.values()].find(c => c.strategyId === context.strategyId && c.difficulty === context.difficulty && !c.cellId);
      if (!cell || cell.worlds.size !== manifest.plan.worlds || [...cell.worlds.values()].some(block => block.reps.size !== expectedReps)) throw Error('Completed matrix lacks a registered world/behavior block');
    }
  }
  const description = aggregator.summarize();
  const identity = { sourceHashes: manifest.sourceHashes, policyHash: manifest.policyHash, manifestPath, manifestSha256: await hashFile(manifestPath), shards: sourceFiles, stage: manifest.stage, split: manifest.split, scope:manifest.scope||null,complete: manifest.complete === true, plannedExecutions: manifest.count, observedExecutions: observed, analyzerHashes,analyzerDrift:{files:analyzerDrift,explicitlyAllowed:allowAnalyzerDrift,formalEligible:analyzerDrift.length===0&&!diagnosticScope} };
  const report = registration ? { ...analyzeConfirmation(aggregator, registration, { family, bootstrapResamples, testResamples, refineResamples, analysisSeed, expectedSourceHashes: manifest.sourceHashes }), inputIdentity: identity } : { ...description, policies: manifest.policies || [], inputIdentity: identity };
  if(analyzerDrift.length||diagnosticScope)report.scope='infrastructure-diagnostic-not-formal-matrix-evidence';
  return { report, description: { ...description, policies: manifest.policies || [], inputIdentity: identity }, aggregator, manifest };
}

// The report may contain many cells, but only one reduced cell is serialized at a time.
export async function writeAnalysisJson(path, report) {
  await mkdir(dirname(resolve(path)), { recursive:true });
  const temporary = `${path}.${process.pid}.tmp`;
  async function* pieces() {
    yield '{\n'; const entries = Object.entries(report);
    for (let i=0;i<entries.length;i++) {
      const [key,value] = entries[i]; yield JSON.stringify(key)+':';
      if (key === 'cells' && Array.isArray(value)) {
        yield '['; for(let n=0;n<value.length;n++){ if(n)yield ',';yield JSON.stringify(value[n]); } yield ']';
      } else yield JSON.stringify(value);
      yield i===entries.length-1?'\n':',\n';
    }
    yield '}\n';
  }
  try { await pipeline(Readable.from(pieces()), createWriteStream(temporary)); await rename(temporary,path); }
  catch(error) { await rm(temporary,{force:true}); throw error; }
}
const OVERVIEW_METRICS = ['spinsUsed','spinsLeft','netHp','netShield','income','spending','rosterSize','permanentAttackRetained'];
const shortNumber = value => typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(8)) : value;
export function compactAnalysisReport(report, details = null) {
  if (!report.cells) return report;
  return { ...report, detailLevel: 'compact-overview; complete metrics are in details JSONL.gz', details, cells: report.cells.map(cell => ({
    key:cell.key,split:cell.split,strategyId:cell.strategyId,sourcePolicyIds:cell.sourcePolicyIds,difficulty:cell.difficulty,cellId:cell.cellId,branch:cell.branch,kind:cell.kind,affectedFloor:cell.affectedFloor,
    trajectories:cell.trajectories,worlds:cell.worlds,completeBehaviorWorlds:cell.completeBehaviorWorlds,incompleteBehaviorWorlds:cell.incompleteBehaviorWorlds,summaryDenominatorTrajectories:cell.summaryDenominatorTrajectories,excludedPartialBehaviorTrajectories:cell.excludedPartialBehaviorTrajectories,terminalTrajectories:cell.terminalTrajectories,incompleteTrajectories:cell.incompleteTrajectories,observedWins:cell.observedWins,winRate:cell.winRate,winRateBoundsIncludingIncomplete:cell.winRateBoundsIncludingIncomplete,winRateInference:cell.winRateInference,clearedFloors:cell.clearedFloors,
    floors:cell.floors.map(floor => ({floor:floor.floor,reached:floor.reached,cleared:floor.cleared,failed:floor.failed,hpFailures:floor.hpFailures,deadlineFailures:floor.deadlineFailures,unfinishedAfterArrival:floor.unfinishedAfterArrival,notReachedAfterFailure:floor.notReachedAfterFailure,notReachedIncomplete:floor.notReachedIncomplete,cumulativeArrival:floor.cumulativeArrival,cumulativeClear:floor.cumulativeClear,failureGivenArrival:floor.failureGivenArrival,cumulativeArrivalIsLowerBound:floor.cumulativeArrivalIsLowerBound,cumulativeClearIsLowerBound:floor.cumulativeClearIsLowerBound,clearMargin:{trajectories:floor.clearMargin.trajectories,p10:floor.clearMargin.p10,p50:floor.clearMargin.p50,p90:floor.clearMargin.p90,lastSpinClearRate:floor.clearMargin.lastSpinClearRate},clearSpinsUsed:floor.clearSpinsUsed,failedSpinsUsed:floor.failedSpinsUsed,metrics:Object.fromEntries(OVERVIEW_METRICS.filter(key=>floor.metrics[key]).map(key=>[key,{mean:shortNumber(floor.metrics[key].mean)}]))}))
  })) };
}
export async function writeDetailedAnalysisCells(path, report) {
  await mkdir(dirname(resolve(path)), {recursive:true});const temporary=`${path}.${process.pid}.tmp`;
  const {cells,...metadata}=report;
  async function* lines(){
    yield JSON.stringify({kind:'header',format:'player-matrix-analysis-cells-v1',value:metadata,expected:{cells:cells.length}})+'\n';
    for(const value of cells)yield JSON.stringify({kind:'cell',value})+'\n';
    yield JSON.stringify({kind:'end',counts:{cells:cells.length}})+'\n';
  }
  try{await pipeline(Readable.from(lines()),createGzip({level:3}),createWriteStream(temporary));await rename(temporary,path);}
  catch(error){await rm(temporary,{force:true});throw error;}
  return {path,format:'player-matrix-analysis-cells-v1',sha256:await hashFile(path),cells:cells.length};
}
export async function writeMatrixAnalysis(prefix, result) {
  const details=result.report.cells?await writeDetailedAnalysisCells(`${prefix}.details.jsonl.gz`,result.report):null;
  const overview=compactAnalysisReport(result.report,details);
  await writeAnalysisJson(`${prefix}.json`,overview);
  await writeFile(`${prefix}.md`,renderAnalysisMarkdown(overview));
  return {json:`${prefix}.json`,markdown:`${prefix}.md`,details};
}
function registrationIdentity(value, description) {
  return { ...value, sourceHashes: description.inputIdentity.sourceHashes, policyHash: description.inputIdentity.policyHash, screeningInputIdentity: description.inputIdentity, selectionRule: value.selectionRule || 'Protocol v1: frozen factor quotas, stable IDs and independent confirmation seeds.' };
}
const isEntrypoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const args = new Map(), allowed = ['manifest','output','bootstrap','test-bootstrap','refine-bootstrap','analysis-seed','allow-incomplete','allow-analyzer-drift','select-p2','select-p3','questions','family'];
  for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i].replace(/^--/,'');if(!allowed.includes(key)||args.has(key)||process.argv[i+1]===undefined)throw Error('Use known unique --name value options');args.set(key,process.argv[i+1]);}
  if(!args.has('manifest')||!args.has('output'))throw Error('--manifest and --output are required');
  const positive=(key,fallback)=>{const n=Number(args.get(key)??fallback);if(!Number.isSafeInteger(n)||n<1)throw Error(`Invalid ${key}`);return n;};
  const registration = args.has('questions') ? JSON.parse(await readFile(args.get('questions'),'utf8')) : null;
  const result = await analyzePlayerMatrixManifest(args.get('manifest'), { registration, family: args.get('family'), bootstrapResamples:positive('bootstrap',10000),testResamples:positive('test-bootstrap',100000),refineResamples:positive('refine-bootstrap',1000000),analysisSeed:args.get('analysis-seed')||'matrix-analysis-v1',allowIncomplete:args.get('allow-incomplete')==='true',allowAnalyzerDrift:args.get('allow-analyzer-drift')==='true' });
  await writeMatrixAnalysis(args.get('output'),result);
  if((args.has('select-p2')||args.has('select-p3'))&&!result.description.inputIdentity.analyzerDrift.formalEligible)throw Error('Diagnostic analyzer output cannot register formal confirmation questions');
  if(args.has('select-p2')) await writeAnalysisJson(args.get('select-p2'),registrationIdentity(selectP2Questions(result.description),result.description));
  if(args.has('select-p3')) await writeAnalysisJson(args.get('select-p3'),registrationIdentity(selectP3Cells(result.description),result.description));
  console.log(`${ANALYSIS_VERSION}: ${result.manifest.stage}; ${result.aggregator.attempts} records; ${args.get('output')}.json/.md`);
}
