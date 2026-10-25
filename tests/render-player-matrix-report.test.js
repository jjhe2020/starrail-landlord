import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash, randomBytes } from 'node:crypto';
import { Script } from 'node:vm';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { loadPlayerMatrixReport, buildPlayerMatrixHtml, renderPlayerMatrixReport, FLOOR_REPORT_METRICS } from '../scripts/render-player-matrix-report.mjs';

const policy = { id: 'matrix:baseline|H:balanced|J:mixed|R:balanced', T: { id: 'baseline', name: '合成测试' }, H: { id: 'balanced', lambdaF: 1 }, J: { id: 'mixed', epsilon: .15 }, R: { id: 'balanced', lambdaR: 1 } };
const syntheticCell = () => ({ key: 'synthetic-cell', split: 'synthetic-render-only', strategyId: policy.id, difficulty: 10, trajectories: 4, worlds: 2, completeBehaviorWorlds: 2, incompleteBehaviorWorlds: 0, summaryDenominatorTrajectories: 4, terminalTrajectories: 4, incompleteTrajectories: 0, observedWins: 3, winRate: .75, clearedFloors: { estimate: 9.5 }, winRateInference: { ci95: [.5, 1], firstRepWilson95: [.1, 1] }, floors: Array.from({ length: 12 }, (_, i) => ({ floor: i + 1, reached: i < 2 ? 4 : 3, cleared: i === 0 ? 4 : 3, failed: i === 1 ? 1 : 0, hpFailures: 0, deadlineFailures: i === 1 ? 1 : 0, notReachedAfterFailure: i > 1 ? 1 : 0, notReachedIncomplete: 0, unfinishedAfterArrival: 0, clearMargin: { p10: 0, p50: 1, p90: 2 }, metrics: { spending: { mean: 12.3456789, observedTrajectories: i < 2 ? 4 : 3 }, netHp: { mean: -2, observedTrajectories: i < 2 ? 4 : 3 } } })) });
const json = (directory, name, value) => writeFile(join(directory, name), JSON.stringify(value));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function detailBytes(cells, footerCount = cells.length) { return gzipSync([{ kind: 'header', format: 'player-matrix-analysis-cells-v1', value: { inputIdentity: { manifestSha256: 'synthetic' } }, expected: { cells: cells.length } }, ...cells.map(value => ({ kind: 'cell', value })), { kind: 'end', counts: { cells: footerCount } }].map(row => JSON.stringify(row)).join('\n')); }
async function fixtureDirectory(t) { const directory = await mkdtemp(join(tmpdir(), 'matrix-report-')); t.after(() => rm(directory, { recursive: true, force: true })); return directory; }
async function saveSynthetic(directory, cell = syntheticCell(), bytes = detailBytes([cell])) {
  await writeFile(join(directory, 'screen.cells.jsonl.gz'), bytes);
  await json(directory, 'screen.json', { inputIdentity: { manifestSha256: 'synthetic' }, policies: [policy], cells: [cell], details: { path: 'screen.cells.jsonl.gz', cells: 1, sha256: hash(bytes) } });
  await json(directory, 'execution-status.json', { status: 'SYNTHETIC_RENDER_TEST_ONLY', stage: 'Not game evidence' });
}
function clientSource(html) { const match = html.match(/<script>\(([^]*?)\)\(\);<\/script>/); assert.ok(match); return `(${match[1]})();`; }
function runClient(bundle, viewportWidth = 1200) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, { id, clientWidth: viewportWidth - 48, innerHTML: '', textContent: '', value: '', checked: false, classList: { toggle() {} }, listeners: {}, addEventListener(type, callback) { this.listeners[type] = callback; }, querySelector() { return { remove() {} }; }, querySelectorAll() { return []; }, scrollIntoView() {} });
    return elements.get(id);
  }
  element('matrix-data').textContent = JSON.stringify(bundle);
  new Script(clientSource(buildPlayerMatrixHtml(bundle))).runInNewContext({ document: { getElementById: element } });
  return { elements, element };
}

test('missing phases render a pending offline view without fabricated observations', async t => {
  const directory = await fixtureDirectory(t), result = await renderPlayerMatrixReport({ directory });
  assert.equal(result.cells, 0); assert.equal(result.status, 'missing-status');
  const html = await readFile(result.output, 'utf8');
  assert.ok(html.includes('本阶段尚未生成结果')); assert.ok(!/<(?:script|link)[^>]+(?:src|href)=/.test(html));
  const bundle = await loadPlayerMatrixReport(directory), { element } = runClient(bundle);
  assert.match(element('confirmation').innerHTML, /尚未生成结果/);
  assert.match(element('counts').textContent, /0 个已观测/);
  assert.match(element('pressure-chart').innerHTML, /选择单一难度/);
});

test('detail stream preserves conditional denominators and formal inference fields', async t => {
  const directory = await fixtureDirectory(t); await saveSynthetic(directory);
  await json(directory, 'confirmation.json', { family: 'P2', alpha: .05, familySize: 72, targetWorlds: 2, methodNote: 'Hoeffding guard; lower power', tests: [{ id: 'synthetic-confirmation', difficulty: 10, metric: 'winRate', worlds: 2, expectedWorlds: 2, complete: true, estimate: .1, formalP: .8, conservativeAdjustedP: 1, formalCi95: [-1, 1], ci95: [.01, .2], test: { p: .0001 }, rejected: false, status: '未排除实质差异' }] });
  const bundle = await loadPlayerMatrixReport(directory), f = bundle.screen.cells[0][16][0], spending = FLOOR_REPORT_METRICS.indexOf('spending');
  assert.deepEqual(f[12][spending], [12.345679, 4]);
  assert.equal(bundle.confirmation.tests[0].formalP, .8); assert.equal(bundle.confirmation.tests[0].bootstrapDiagnosticP, .0001);
  const { element } = runClient(bundle);
  assert.match(element('floor-table').innerHTML, /条件N=4/);
  assert.match(element('axis-table').innerHTML, /队伍偏好/);
  assert.match(element('confirmation').innerHTML, /8\.000e-1/);
  assert.match(element('confirmation').innerHTML, /1\.000e-4，不是正式判定/);
  assert.match(element('confirmation').innerHTML, /保守护栏降低检出力/);
  assert.match(element('status').textContent, /SYNTHETIC_RENDER_TEST_ONLY/);
});

test('tampered detail digest, footer count, and cell identity are rejected', async t => {
  const directory = await fixtureDirectory(t); await saveSynthetic(directory);
  await writeFile(join(directory, 'screen.cells.jsonl.gz'), detailBytes([syntheticCell()], 8));
  await assert.rejects(loadPlayerMatrixReport(directory), /SHA-256 mismatch/);
  await saveSynthetic(directory, syntheticCell(), detailBytes([syntheticCell()], 8));
  await assert.rejects(loadPlayerMatrixReport(directory), /count mismatch/);
  const other = { ...syntheticCell(), difficulty: 20 };
  await saveSynthetic(directory, syntheticCell(), detailBytes([other]));
  await assert.rejects(loadPlayerMatrixReport(directory), /cell identity mismatch/);
});

test('untrusted source labels stay inert and incomplete fork comparisons stay missing', async t => {
  const directory = await fixtureDirectory(t), cell = syntheticCell(); await saveSynthetic(directory, cell);
  const badLabel = '</script><img src=x onerror=alert(1)>';
  const overview = JSON.parse(await readFile(join(directory, 'screen.json'), 'utf8')); overview.policies[0].T.name = badLabel;
  await json(directory, 'screen.json', overview);
  const fork = branch => ({ ...cell, key: `fork-${branch}`, cellId: 'D10:F2:supply', affectedFloor: 2, kind: 'supply', branch, incompleteTrajectories: branch === 'B' ? 1 : 0 });
  await json(directory, 'fork-screen.json', { policies: [policy], cells: [fork('A'), fork('B')] });
  const bundle = await loadPlayerMatrixReport(directory), html = buildPlayerMatrixHtml(bundle);
  assert.ok(!html.includes(badLabel)); assert.ok(html.includes('\\u003c/script>'));
  const { element } = runClient(bundle);
  assert.match(element('axis-table').innerHTML, /&lt;\/script&gt;/);
  assert.match(element('fork-table').innerHTML, /存在未完成\/不全组，风险差不计算/);
  assert.equal((element('fork-table').innerHTML.match(/<td>—<\/td>/g) || []).length, 3);
});

test('1200/390/320 static CSS and DOM contracts preserve scrollable tables and reachable controls (not screenshots)', async t => {
  const directory = await fixtureDirectory(t); await saveSynthetic(directory);
  const bundle = await loadPlayerMatrixReport(directory), html = buildPlayerMatrixHtml(bundle);
  assert.match(html, /name="viewport" content="width=device-width,initial-scale=1"/);
  assert.match(html, /\.table-wrap\{overflow:auto/);
  assert.match(html, /\.filters\{display:flex;flex-wrap:wrap/);
  assert.match(html, /@media\(max-width:760px\)/);
  assert.match(html, /select\{max-width:100%\}/);
  assert.match(html, /\.chart svg\{width:100%;height:auto;min-width:0\}/);
  for (const id of ['difficulty', 'T', 'H', 'J', 'R', 'controls', 'metric', 'fork-difficulty']) assert.match(html, new RegExp(`<label>[^<]*(?:<select|<input) id="${id}"`));
  for (const width of [1200, 390, 320]) {
    const { element } = runClient(bundle, width);
    for (const id of ['difficulty', 'T', 'H', 'J', 'R', 'controls', 'metric', 'fork-difficulty']) assert.equal(typeof element(id).listeners.change, 'function');
    for (const id of ['previous', 'next', 'clear-focus']) assert.equal(typeof element(id).listeners.click, 'function');
    const chart = element('pressure-chart').innerHTML, chartWidth = Number(chart.match(/viewBox="0 0 ([\d.]+) 260"/)?.[1]);
    assert.ok(Number.isFinite(chartWidth) && chartWidth <= width - 48, `chart width at ${width}`);
    assert.match(element('floor-table').innerHTML, /^<div class="table-wrap"><table>/);
    assert.match(element('cell-table').innerHTML, /^<div class="table-wrap"><table>/);
  }
});

test('main axis options exclude unused manifest policies and fork mixed-root placeholders', async t => {
  const directory = await fixtureDirectory(t); await saveSynthetic(directory);
  const overview = JSON.parse(await readFile(join(directory, 'screen.json'), 'utf8'));
  overview.policies.push({ ...policy, id: 'matrix:unused|H:unused|J:unused|R:unused', T: { id: 'unused', name: 'unused' }, H: { id: 'unused' }, J: { id: 'unused' }, R: { id: 'unused' } });
  await json(directory, 'screen.json', overview);
  await json(directory, 'fork-screen.json', { cells: [{ ...syntheticCell(), key: 'fork-mixed-root', strategyId: 'mixed-root-policies', sourcePolicyIds: [policy.id], cellId: 'D10:F2:remove', branch: 'A', kind: 'remove', affectedFloor: 2 }] });
  const bundle = await loadPlayerMatrixReport(directory), { element } = runClient(bundle);
  assert.ok(bundle.policies.some(p => p.id === 'mixed-root-policies'));
  for (const axis of ['T', 'H', 'J', 'R']) {
    assert.ok(!element(axis).innerHTML.includes('unused'));
    assert.ok(!element(axis).innerHTML.includes('mixed-root'));
    assert.ok(!element(axis).innerHTML.includes('value=""'));
  }
  assert.match(buildPlayerMatrixHtml(bundle), /E恢复后本关余下及后两关积极补救/);
});

test('large unread detail tails do not hang header or identity rejection', { timeout: 15000 }, async t => {
  const directory = await fixtureDirectory(t), run = promisify(execFile), renderer = fileURLToPath(new URL('../scripts/render-player-matrix-report.mjs', import.meta.url));
  const payload = randomBytes(32768).toString('hex'), tail = Array.from({ length: 32 }, (_, i) => JSON.stringify({ kind: 'unused-after-rejection', i, payload })).join('\n');
  assert.ok(Buffer.byteLength(tail) > 1024 * 1024);
  const header = { kind: 'header', format: 'player-matrix-analysis-cells-v1', value: { inputIdentity: { manifestSha256: 'synthetic' } }, expected: { cells: 1 } };
  for (const [firstRows, errorPattern] of [
    [[{ ...header, format: 'wrong' }], /Invalid detailed-analysis header/],
    [[{ ...header, value: { inputIdentity: { manifestSha256: 'wrong' } } }], /Detailed\/overview identity mismatch/],
    [[header, { kind: 'cell', value: { ...syntheticCell(), difficulty: 20 } }], /cell identity mismatch/]
  ]) {
    const bytes = gzipSync(firstRows.map(row => JSON.stringify(row)).join('\n') + '\n' + tail + '\n', { level: 1 });
    await saveSynthetic(directory, syntheticCell(), bytes);
    await assert.rejects(run(process.execPath, [renderer, '--directory', directory], { timeout: 3000, maxBuffer: 128 * 1024 }), error => {
      assert.equal(error.killed, false, 'rejection process must exit before its timeout');
      assert.equal(error.signal, null);
      assert.match(error.stderr, errorPattern);
      return true;
    });
  }
});
