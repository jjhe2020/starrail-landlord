// Synthetic infrastructure capacity check. Never imports or runs the game engine.
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, stat, statfs } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import os from 'node:os';
import v8 from 'node:v8';
import { performance } from 'node:perf_hooks';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const file = fileURLToPath(import.meta.url);
const GiB = 1024 ** 3;
const defaults = {
  cells: 15740, worlds: 16, reps: 2, floors: 12, heapMiB: 8192,
  rssStopBytes: 6 * GiB, minimumSystemFreePercent: 12,
};
function options(args) {
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--output', '--artifact-prefix'].includes(args[i]) || !args[i + 1]) throw Error('Use --output path and/or --artifact-prefix path');
    out[args[i] === '--output' ? 'output' : 'artifactPrefix'] = resolve(args[i + 1]);
  }
  return out;
}
async function digest(path) { return createHash('sha256').update(await readFile(path)).digest('hex'); }
function mix(value) { value = Math.imul(value ^ (value >>> 16), 0x7feb352d); value = Math.imul(value ^ (value >>> 15), 0x846ca68b); return (value ^ (value >>> 16)) >>> 0; }
async function childRun(artifactPrefix) {
  const { createMatrixAggregator } = await import('../src/player-matrix-analysis.js');
  const { writeMatrixAnalysis } = await import('./analyze-player-matrix.mjs');
  const aggregator = createMatrixAggregator();
  const started = performance.now();
  let rows = 0;
  function point(stage) {
    const memory = process.memoryUsage();
    const value = { stage, rows, elapsedMs: performance.now() - started, ...memory, maxRssBytes: process.resourceUsage().maxRSS * 1024 };
    process.send?.({ type: 'point', value });
    if (memory.rss >= defaults.rssStopBytes) throw Error('Synthetic capacity RSS guard reached');
  }
  point('start');
  // World-major ordering matches the real screen plan. Each raw row is discarded
  // after add(); nothing retains a raw run array or action trace.
  for (let worldIndex = 0; worldIndex < defaults.worlds; worldIndex++) {
    for (let cellIndex = 0; cellIndex < defaults.cells; cellIndex++) {
      const difficulty = Math.floor(cellIndex / 787) + 1;
      const strategyId = `synthetic-policy:${cellIndex % 787}`;
      for (let behaviorRep = 0; behaviorRep < defaults.reps; behaviorRep++) {
        const key = mix(cellIndex * 257 + worldIndex * 17 + behaviorRep * 7919);
        const won = key % 4 !== 0;
        const floors = Array.from({ length: defaults.floors }, (_, i) => ({
          floor: i + 1, reached: true, cleared: i < 11 || won, failed: i === 11 && !won,
          cause: i === 11 && !won ? 'deadline' : null,
          turnsUsed: 2 + key % 4, deadline: 8, spinsLeft: i === 11 && !won ? 0 : 3, marginRatio: .375,
          A: { deadline: 8 }, B: { rosterSize: 10, distinctCharacters: 8, permanentAttackRetained: 20 },
          C: { rosterSize: 10 + i, distinctCharacters: 8, permanentAttackRetained: 20 + i },
          health: { netHp: -2, netShield: -1, healed: 2, shieldGained: 2, enemyHpLost: 40, selfDamage: 1, pollutionHpLost: 0, shieldBlocked: 3, shieldDecayed: 1, maxHpChange: 0, shieldOtherLoss: 0 },
          resources: { income: 12, spending: 8, freeRerolls: 1, paidRerolls: 1, removalsUsed: 1, supplies: { repair: 1, barrier: 0, overclock: 0 } },
          damage: 40, permanentAttackIssued: 1,
          rewards: { recruit: 1, item: 0, essence: 0, skipped: 0 },
          conservation: { battle: { passed: true }, total: { passed: true } },
        }));
        aggregator.add({ trialKey: `synthetic|${cellIndex}|${worldIndex}|${behaviorRep}`, split: 'synthetic-capacity', strategyId, difficulty, worldIndex, behaviorRep,
          phase: won ? 'victory' : 'defeat', won, floor: 12, clearedFloors: won ? 12 : 11, death: won ? null : 'deadline', stopped: null, conservationPassed: true, floors });
        rows++;
      }
      if (rows % 2048 === 0) { point('ingest'); await new Promise(resolve => setImmediate(resolve)); }
    }
  }
  point('ingest-complete');
  const report = aggregator.summarize();
  report.scope = 'synthetic-infrastructure-capacity-only-no-game-or-balance-evidence';
  report.inputIdentity = { stage: 'synthetic-capacity', split: 'synthetic-capacity', complete: true, formalEligible: false };
  point('summarize-complete');
  const artifacts = await writeMatrixAnalysis(artifactPrefix, { report, description: report, aggregator });
  point('write-complete');
  const files = {};
  for (const [kind, path] of Object.entries({ json: artifacts.json, markdown: artifacts.markdown, details: artifacts.details?.path })) {
    if (path) files[kind] = { path, bytes: (await stat(path)).size };
  }
  process.send?.({ type: 'result', value: { cells: report.cells.length, rows, elapsedMs: performance.now() - started, files, memory: process.memoryUsage(), maxRssBytes: process.resourceUsage().maxRSS * 1024, heapLimitBytes: v8.getHeapStatistics().heap_size_limit } });
}
export async function measurePlayerMatrixCapacity({ output = resolve(root, 'report/player-matrix-v1/validation/analysis-capacity.json'), artifactPrefix = resolve(root, '.local/player-matrix-v1/capacity-analysis-output/synthetic-screen') } = {}) {
  await mkdir(dirname(output), { recursive: true }); await mkdir(dirname(artifactPrefix), { recursive: true });
  const disk = await statfs(dirname(artifactPrefix)); if (disk.bavail * disk.bsize < 3 * GiB) throw Error('Synthetic output needs at least 3 GiB free disk before measurement');
  const started = Date.now(), points = [], system = [];
  const sourceHashes = Object.fromEntries(await Promise.all(['src/player-matrix-analysis.js', 'scripts/analyze-player-matrix.mjs', 'scripts/measure-player-matrix-capacity.mjs'].map(async name => [name, await digest(resolve(root, name))])));
  const report = { format: 'player-matrix-synthetic-capacity-v1', passed: false, scope: 'synthetic capacity only; no game execution, balance conclusion, or formal statistical sample', configuration: defaults, sourceHashes,
    runtime: { node: process.version, v8: process.versions.v8, platform: process.platform, architecture: process.arch, totalMemoryBytes: os.totalmem() }, startedAt: new Date(started).toISOString(), points, system,
    assumptions: ['15740 cells = 787 synthetic strategies times 20 difficulties', 'Every trajectory reaches all 12 floors; final-floor wins and failures mixed', 'World-major ingestion, two behavior replicas, all 32 metric moments populated', 'Real default bootstrap settings, summarize, details gzip and compact overview writer', 'No action trace or raw-run array retained', 'Workers absent from this measurement; worker memory is not qualified by this result'] };
  let abortReason = null, result = null, busy = false, stderr = '';
  const child = spawn(process.execPath, [`--max-old-space-size=${defaults.heapMiB}`, file, '--child', artifactPrefix], { cwd: root, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-6000); });
  const abort = reason => { if (!abortReason) { abortReason = reason; child.kill('SIGTERM'); } };
  child.on('message', message => {
    if (message.type === 'point') { points.push(message.value); if (message.value.stage !== 'ingest' || points.length % 16 === 0) console.log(`Synthetic capacity ${message.value.stage}: ${message.value.rows} rows, RSS ${(message.value.rss / GiB).toFixed(2)} GiB, heap ${(message.value.heapUsed / GiB).toFixed(2)} GiB`); }
    else if (message.type === 'result') result = message.value;
  });
  const monitor = setInterval(async () => {
    if (busy || child.exitCode !== null) return; busy = true;
    try {
      const { stdout } = await execute('ps', ['-o', 'rss=', '-p', String(child.pid)]);
      const rssBytes = Number(stdout.trim()) * 1024;
      if (Number.isFinite(rssBytes) && rssBytes >= defaults.rssStopBytes) abort('Child RSS reached conservative 6 GiB hard stop');
      if (process.platform === 'darwin' && system.length * 2000 < Date.now() - started) {
        const { stdout: pressure } = await execute('memory_pressure', []);
        const freePercent = Number(pressure.match(/System-wide memory free percentage:\s*(\d+)%/)?.[1]);
        system.push({ elapsedMs: Date.now() - started, rssBytes, freePercent: Number.isFinite(freePercent) ? freePercent : null });
        if (Number.isFinite(freePercent) && freePercent < defaults.minimumSystemFreePercent) abort('System memory headroom fell below conservative 12% stop');
      }
    } catch (error) { if (child.exitCode === null && error.code !== 1) abort('Capacity monitor failed: ' + error.message); }
    finally { busy = false; }
  }, 500);
  const exit = await new Promise(resolve => { child.once('error', error => resolve({ error: error.message })); child.once('exit', (code, signal) => resolve({ code, signal })); });
  clearInterval(monitor);
  const sourceStable = (await Promise.all(Object.entries(sourceHashes).map(async ([name, value]) => value === await digest(resolve(root, name))))).every(Boolean);
  Object.assign(report, { passed: exit.code === 0 && Boolean(result) && !abortReason && sourceStable, sourceStable, abortReason, exit, result, elapsedMs: Date.now() - started,
    peakObservedRssBytes: Math.max(0, ...points.map(p => p.maxRssBytes || p.rss), ...system.map(p => p.rssBytes || 0)),
    peakObservedHeapUsedBytes: Math.max(0, ...points.map(p => p.heapUsed)), stderr: stderr || null, completedAt: new Date().toISOString() });
  report.interpretation = report.passed ? 'This exact worst-arrival synthetic aggregator and writer workload completed under an 8 GiB Node heap. It does not qualify game worker heaps, other applications, formal inference cost, or arbitrary data growth.' : 'Capacity was not qualified. Preserve the measured stopping point; do not infer that an 8 GiB heap is sufficient.';
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  const markdown = `# 玩家矩阵合成容量检查\n\n${report.passed ? '通过此合成容量负载。' : '未取得容量通过资格。'} **仅基础设施容量，不运行游戏，不产生胜率或平衡证据。**\n\n- 负载：15,740格 ×16世界 ×2行为复本，503,680条轨迹，每条到达全部12关。\n- Node heap上限：8 GiB；子进程RSS保护：6 GiB；macOS系统free保护：12%。\n- 峰值观察RSS：${(report.peakObservedRssBytes / GiB).toFixed(3)} GiB；采样heapUsed峰值：${(report.peakObservedHeapUsedBytes / GiB).toFixed(3)} GiB。\n- 总耗时：${(report.elapsedMs / 1000).toFixed(2)}秒；退出：${JSON.stringify(exit)}。\n- 终止原因：${abortReason || '无'}；源文件身份一致：${sourceStable}。\n\n${report.interpretation}\n\n完整阶段测量、运行环境、产物字节数及SHA身份见同名JSON。\n`;
  await writeFile(output.replace(/\.json$/, '.md'), markdown);
  console.log(JSON.stringify({ passed: report.passed, output, elapsedMs: report.elapsedMs, peakRssGiB: report.peakObservedRssBytes / GiB, abortReason }));
  return report;
}
if (process.argv[2] === '--child') {
  try { await childRun(resolve(process.argv[3])); process.disconnect?.(); }
  catch (error) { console.error(error.stack || String(error)); process.exitCode = 1; process.disconnect?.(); }
} else if (process.argv[1] && resolve(process.argv[1]) === file) {
  const report = await measurePlayerMatrixCapacity(options(process.argv.slice(2))); if (!report.passed) process.exitCode = 1;
}
