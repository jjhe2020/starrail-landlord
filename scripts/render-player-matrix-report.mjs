import { readFile, writeFile, mkdir, stat, realpath } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, relative, dirname, basename, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { createGunzip } from 'node:zlib';
import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

export const REPORT_VERSION = 'player-matrix-offline-report-v1';
export const FLOOR_REPORT_METRICS = ['spinsUsed', 'spinsLeft', 'netHp', 'netShield', 'income', 'spending', 'rosterSize', 'permanentAttackRetained', 'freeRerolls', 'paidRerolls', 'removalsUsed', 'repairPurchases', 'barrierPurchases', 'overclockPurchases', 'permanentAttackIssued'];
const INPUTS = ['screen.json', 'confirmation.json', 'fork-screen.json', 'fork-confirmation.json', 'fork-screen-entry-coverage.json', 'fork-confirmation-entry-coverage.json', 'p2-registration.json', 'p3-registration.json', 'execution-status.json', 'pilot-summary.json'];
const round = value => typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(6)) : null;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const scriptJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
async function digestFile(path) { const hash = createHash('sha256'); for await (const bytes of createReadStream(path)) hash.update(bytes); return hash.digest('hex'); }
const inside = (directory, path) => { const name = relative(directory, path); return name === '' || (!isAbsolute(name) && name !== '..' && !name.startsWith('..' + sep)); };
function policySummary(p) {
  const fallback = axis => String(p.id || '').match(new RegExp('\\|' + axis + ':([^|]+)'))?.[1] || '';
  return { id: p.id, T: { id: p.T?.id || p.teamId || String(p.id).split('|H:')[0].replace(/^matrix:/, ''), name: p.T?.name || p.T?.id || p.teamId || '' }, H: { id: p.H?.id || p.horizonId || fallback('H'), name: p.H?.name || '', lambdaF: p.H?.lambdaF ?? null }, J: { id: p.J?.id || p.randomnessId || fallback('J'), epsilon: p.J?.epsilon ?? null }, R: { id: p.R?.id || p.resourceId || fallback('R'), name: p.R?.name || '', lambdaR: p.R?.lambdaR ?? null }, control: p.control || (String(p.id).startsWith('control:') ? 'control' : null) };
}
function packCell(cell, policyIndex) {
  if (!Number.isInteger(policyIndex)) throw new Error('Detailed analysis contains an unregistered strategy.');
  if (!Number.isInteger(cell.difficulty) || cell.difficulty < 1 || cell.difficulty > 20 || typeof cell.strategyId !== 'string') throw new Error('Invalid report cell identity.');
  for (const key of ['trajectories', 'worlds', 'completeBehaviorWorlds', 'incompleteBehaviorWorlds', 'summaryDenominatorTrajectories', 'terminalTrajectories', 'incompleteTrajectories', 'observedWins']) if (cell[key] !== undefined && (!Number.isFinite(cell[key]) || cell[key] < 0)) throw new Error(`Invalid report count: ${key}`);
  if (cell.winRate !== null && cell.winRate !== undefined && (!Number.isFinite(cell.winRate) || cell.winRate < 0 || cell.winRate > 1)) throw new Error('Invalid report win rate.');
  const seen = new Set();
  const floors = (cell.floors || []).map(f => {
    if (!Number.isInteger(f.floor) || f.floor < 1 || f.floor > 12 || seen.has(f.floor)) throw new Error('Invalid/duplicate report floor.'); seen.add(f.floor);
    const metrics = FLOOR_REPORT_METRICS.map(name => { const v = f.metrics?.[name]; return [round(v?.mean), v?.observedTrajectories ?? null]; });
    // No-data trailing metric entries are omitted rather than embedding a large
    // rectangle of nulls. The metric dictionary remains fixed for all cells.
    while (metrics.length && metrics.at(-1)[0] === null && metrics.at(-1)[1] === null) metrics.pop();
    return [f.floor, f.reached ?? 0, f.cleared ?? 0, f.failed ?? 0, f.hpFailures ?? 0, f.deadlineFailures ?? 0, f.notReachedAfterFailure ?? 0, f.notReachedIncomplete ?? 0, f.unfinishedAfterArrival ?? 0, round(f.clearMargin?.p10), round(f.clearMargin?.p50), round(f.clearMargin?.p90), metrics, f.cumulativeArrivalIsLowerBound === true, f.cumulativeClearIsLowerBound === true, f.failureGivenArrivalIsLowerBound === true];
  });
  return [policyIndex, cell.difficulty, cell.worlds ?? 0, cell.trajectories ?? 0, round(cell.winRate), round(cell.clearedFloors?.estimate), cell.incompleteTrajectories ?? 0, cell.summaryDenominatorTrajectories ?? cell.terminalTrajectories ?? 0, cell.terminalTrajectories ?? 0, cell.observedWins ?? 0, cell.completeBehaviorWorlds ?? 0, cell.incompleteBehaviorWorlds ?? 0, cell.cellId || null, cell.branch || null, cell.kind || null, cell.affectedFloor ?? null, floors, cell.winRateInference?.ci95?.map(round) || null, cell.winRateInference?.firstRepWilson95?.map(round) || null, cell.sourcePolicyIds || [cell.strategyId]];
}
function packConfirmation(report) {
  if (!report) return null;
  if (!Array.isArray(report.tests)) throw new Error('Confirmation report has no tests array.');
  return { family: report.family, alpha: report.alpha, familySize: report.familySize, targetWorlds: report.targetWorlds, methodNote: report.methodNote || '', inputIdentity: report.inputIdentity || null,
    tests: report.tests.map(t => ({ id: t.id, questionId: t.questionId, cellId: t.cellId, difficulty: t.difficulty, affectedFloor: t.affectedFloor, branch: t.branch, offset: t.offset, metric: t.metric, type: t.type, worlds: t.worlds, expectedWorlds: t.expectedWorlds, missingArms: t.missingArms, missingWorlds: t.missingWorlds, complete: t.complete, estimate: round(t.estimate), armMeans: t.armMeans?.map(round), ci95: t.ci95?.map(round), formalCi95: t.formalCi95?.map(round), formalP: t.formalP ?? null, adjustedP: t.adjustedP ?? null, conservativeAdjustedP: t.conservativeAdjustedP ?? null, rejected: t.rejected === true, status: t.status, interpretation: t.interpretation, formalMethod: t.formalMethod, bootstrapDiagnosticP: t.test?.p ?? null, numericalUncertain: t.monteCarloUncertain === true })) };
}

export async function loadPlayerMatrixReport(directory) {
  directory = resolve(directory);
  const physicalDirectory = await realpath(directory);
  const inputs = {}, sources = [];
  for (const name of INPUTS) {
    const path = resolve(directory, name);
    try {
      const info = await stat(path);
      if (info.size > 256 * 1024 * 1024) throw new Error(`Overview JSON too large; use compact analysis output: ${name}`);
      inputs[name] = JSON.parse(await readFile(path, 'utf8'));
      sources.push({ name, bytes: info.size, sha256: await digestFile(path) });
    } catch (error) { if (error.code === 'ENOENT') inputs[name] = null; else throw error; }
  }
  const definitions = new Map();
  for (const name of ['screen.json', 'fork-screen.json']) for (const p of inputs[name]?.policies || []) if (!definitions.has(p.id)) definitions.set(p.id, policySummary(p));
  for (const name of ['screen.json', 'fork-screen.json']) for (const cell of inputs[name]?.cells || []) if (!definitions.has(cell.strategyId)) definitions.set(cell.strategyId, policySummary({ id: cell.strategyId }));
  const policies = [...definitions.values()], indices = new Map(policies.map((p, i) => [p.id, i]));
  async function stage(name) {
    const report = inputs[name]; if (!report) return null;
    if (!Array.isArray(report.cells)) throw new Error(`No cells in ${name}`);
    const cells = [], notes = [], detail = report.details;
    const identity = c => JSON.stringify([c.key, c.split, c.strategyId, c.difficulty, c.cellId, c.branch, c.kind, c.affectedFloor]);
    const identities = new Set(report.cells.map(identity));
    if (identities.size !== report.cells.length) throw new Error('Duplicate analysis cell identity.');
    if (detail?.path) {
      const path = isAbsolute(detail.path) ? resolve(detail.path) : resolve(directory, detail.path);
      if (!inside(directory, path) || !inside(physicalDirectory, await realpath(path))) throw new Error('Detailed analysis must stay in the report directory.');
      const sha256 = await digestFile(path);
      if (detail.sha256 && sha256 !== detail.sha256) throw new Error(`Detail SHA-256 mismatch: ${name}`);
      let header = null, footer = null, count = 0;
      const source = createReadStream(path), output = new PassThrough(), gunzip = path.endsWith('.gz') ? createGunzip() : null, controller = new AbortController();
      const pumping = gunzip ? pipeline(source, gunzip, output, { signal: controller.signal }) : pipeline(source, output, { signal: controller.signal });
      pumping.catch(() => {});
      const lines = createInterface({ input: output, crlfDelay: Infinity });
      try {
        for await (const line of lines) {
          if (!line.trim()) continue;
          const row = JSON.parse(line);
          if (row.kind === 'header') {
            if (header || row.format !== 'player-matrix-analysis-cells-v1') throw new Error('Invalid detailed-analysis header.');
            header = row;
            if (report.inputIdentity?.manifestSha256 && row.value?.inputIdentity?.manifestSha256 !== report.inputIdentity.manifestSha256) throw new Error('Detailed/overview identity mismatch.');
          } else if (row.kind === 'cell') {
            if (!header || footer) throw new Error('Detailed cell outside header/footer.');
            if (!identities.delete(identity(row.value))) throw new Error('Detailed/overview cell identity mismatch.');
            cells.push(packCell(row.value, indices.get(row.value.strategyId))); count++;
          } else if (row.kind === 'end') { if (footer) throw new Error('Duplicate detail footer.'); footer = row; }
          else throw new Error('Unknown detailed-analysis row.');
        }
        await pumping;
      } finally {
        // A rejected early row must not wait behind backpressure from unread
        // large records. Abort and destroy every pipeline stage before awaiting.
        controller.abort(); lines.close(); gunzip?.destroy(); output.destroy(); source.destroy(); await pumping.catch(() => {});
      }
      if (!header || !footer || header.expected?.cells !== count || footer.counts?.cells !== count || detail.cells !== undefined && detail.cells !== count || report.cells.length !== count) throw new Error('Detailed analysis count mismatch.');
      sources.push({ name: relative(directory, path).split(sep).join('/'), bytes: (await stat(path)).size, sha256 });
    } else {
      cells.push(...report.cells.map(cell => packCell(cell, indices.get(cell.strategyId))));
      notes.push('仅有概览，部分条件指标的精确观测分母未载入；缺失值不补零，完整指标见原始分析。');
    }
    return { inputName: name, attempts: report.attempts ?? null, behaviorReps: report.behaviorReps ?? null, independentUnit: report.independentUnit || 'world seed', identity: report.inputIdentity || null, detailLevel: report.detailLevel || null, notes, cells };
  }
  return { version: REPORT_VERSION, generatedAt: new Date().toISOString(), directory, metricNames: FLOOR_REPORT_METRICS, policies, screen: await stage('screen.json'), forks: await stage('fork-screen.json'), confirmation: packConfirmation(inputs['confirmation.json']), forkConfirmation: packConfirmation(inputs['fork-confirmation.json']), coverage: { screen: inputs['fork-screen-entry-coverage.json'], confirmation: inputs['fork-confirmation-entry-coverage.json'] }, registrations: { matrix: inputs['p2-registration.json'], process: inputs['p3-registration.json'] }, status: inputs['execution-status.json'], pilot: inputs['pilot-summary.json'], sources };
}

function reportClient() {
  const data = JSON.parse(document.getElementById('matrix-data').textContent), $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const finite = Number.isFinite, mean = xs => { const a = xs.filter(finite); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; };
  const number = (v, digits = 1) => finite(v) ? v.toLocaleString('zh-CN', { maximumFractionDigits: digits }) : '—';
  const percentage = v => finite(v) ? `${number(v * 100, 1)}%` : '—';
  const labels = { T: '队伍偏好', H: '长短期', J: '奖励随机性', R: '资源经营' }, axisNames = { short: '短期', balanced: '均衡', greedy: '贪婪', deterministic: '确定取优', mixed: 'ε=0.15', random: 'ε=0.45', active: '积极投入', reserve: '偏重储备', uniform: '纯均匀', current: '原版AI' };
  const metricLabels = { spinsUsed: '使用转动', spinsLeft: '清关剩余转动', netHp: '净生命变化', netShield: '净护盾变化', income: '信用点收入', spending: '信用点消费', rosterSize: '结束编队人数', permanentAttackRetained: '留存永久攻击力', freeRerolls: '免费重掷', paidRerolls: '付费重掷', removalsUsed: '移除次数', repairPurchases: '医疗补给次数', barrierPurchases: '护盾补给次数', overclockPurchases: '超频补给次数', permanentAttackIssued: '本关发放永久攻击力' };
  function options(element, values, selected = 'all') { element.innerHTML = `<option value="all">全部</option>` + values.map(([id, label]) => `<option value="${esc(id)}">${esc(label || id)}</option>`).join(''); element.value = selected; }
  const mainCells = data.screen?.cells || [], policies = data.policies;
  const mainPolicyIndices = new Set(mainCells.map(cell => cell[0])), mainPolicies = policies.filter((p, index) => mainPolicyIndices.has(index));
  const difficulties = [...new Set(mainCells.map(c => c[1]))].sort((a, b) => a - b);
  options($('difficulty'), difficulties.map(d => [String(d), `D${d}`]), String(difficulties.includes(10) ? 10 : difficulties[0] || 'all'));
  for (const axis of ['T', 'H', 'J', 'R']) {
    const choices = [...new Map(mainPolicies.filter(p => !p.control).map(p => [p[axis].id, p[axis].name || axisNames[p[axis].id] || p[axis].id])).entries()];
    options($(axis), choices, axis === 'T' && choices.some(([id]) => id === 'baseline') ? 'baseline' : 'all');
  }
  options($('metric'), data.metricNames.map(name => [name, metricLabels[name]]), 'spending'); $('metric').querySelector('[value="all"]').remove();
  options($('fork-difficulty'), [...new Set((data.forks?.cells || []).map(c => c[1]))].sort((a, b) => a - b).map(d => [String(d), `D${d}`]));
  let page = 0, focusedPolicy = null;
  const policyOf = c => policies[c[0]] || { id: '未知策略', T: {}, H: {}, J: {}, R: {} };
  const titleOf = p => p.control ? p.id : [p.T.name || p.T.id, axisNames[p.H.id] || p.H.id, axisNames[p.J.id] || p.J.id, axisNames[p.R.id] || p.R.id].join(' · ');
  function selectedCells(includeDifficulty = true) {
    return mainCells.filter(c => {
      const p = policyOf(c);
      if (!p || (p.control && !$('controls').checked)) return false;
      if (includeDifficulty && $('difficulty').value !== 'all' && c[1] !== Number($('difficulty').value)) return false;
      return ['T', 'H', 'J', 'R'].every(axis => $(axis).value === 'all' || p[axis]?.id === $(axis).value);
    });
  }
  function chart(id, series, { percent = false, minimum = null, maximum = null, xLabel = '关卡' } = {}) {
    const element = $(id), all = series.flatMap(s => s.points).filter(p => finite(p.y));
    if (!all.length) { element.innerHTML = '<p class="empty">当前筛选没有可显示的数据。</p>'; return; }
    const W = Math.max(250, Math.min(800, element.clientWidth || 800)), H = 260, L = 55, R = 18, T = 18, B = 42, xs = all.map(p => p.x), ys = all.map(p => p.y), xmin = Math.min(...xs), xmax = Math.max(...xs);
    let lo = minimum ?? Math.min(0, ...ys), hi = maximum ?? Math.max(0, ...ys); if (hi === lo) hi = lo + 1;
    const x = n => L + (n - xmin) / Math.max(1, xmax - xmin) * (W - L - R), y = n => T + (hi - n) / (hi - lo) * (H - T - B);
    let body = '';
    for (let i = 0; i <= 4; i++) { const v = lo + (hi - lo) * i / 4; body += `<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="#28394b"/><text x="${L-7}" y="${y(v)+4}" text-anchor="end">${percent ? percentage(v) : number(v, 1)}</text>`; }
    const ticks = [...new Set(xs)].sort((a,b) => a-b), tickStride = Math.max(1, Math.ceil(ticks.length / Math.max(2, Math.floor((W-L-R)/32))));
    for (const [index,v] of ticks.entries()) if (index % tickStride === 0 || index === ticks.length - 1) body += `<text x="${x(v)}" y="${H-17}" text-anchor="middle">${xLabel === '难度' ? 'D' : ''}${v}</text>`;
    for (const s of series) {
      const points = s.points.filter(p => finite(p.y));
      body += `<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${points.map(p => `${x(p.x)},${y(p.y)}`).join(' ')}"/>`;
      for (const p of points) body += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="3.7" fill="${s.color}"><title>${esc(s.name)} · ${xLabel}${p.x}：${percent ? percentage(p.y) : number(p.y, 3)}${p.note ? '\n'+esc(p.note) : ''}</title></circle>`;
    }
    element.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s=>s.name).join('、'))}">${body}</svg><div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
  }
  function table(headers, rows) { return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${headers.length}">尚无结果或当前筛选无数据。</td></tr>`}</tbody></table></div>`; }
  function cellRow(values, attr = '') { return `<tr ${attr}>${values.map(v=>`<td>${v}</td>`).join('')}</tr>`; }
  function floorRows(cells, floor) { return cells.map(c => ({ cell: c, floor: c[16].find(f => f[0] === floor) })).filter(row => row.floor); }
  function metricAt(f, metric) { return f[12]?.[data.metricNames.indexOf(metric)] || [null, null]; }
  function drawPressure(cells) {
    if ($('difficulty').value === 'all') { $('pressure-chart').innerHTML = '<p class="empty">请选择单一难度查看逐关压力，避免把不同难度合并成一条体验曲线。</p>'; $('resource-chart').innerHTML = ''; $('floor-table').innerHTML = ''; return; }
    const focused = focusedPolicy ? cells.filter(c => policyOf(c).id === focusedPolicy) : cells;
    if (!focused.length) { $('pressure-label').textContent = '当前筛选尚无观测结果'; $('pressure-chart').innerHTML = '<p class="empty">尚无可显示的逐关数据。</p>'; $('resource-chart').innerHTML = ''; $('floor-table').innerHTML = ''; return; }
    $('pressure-label').textContent = focusedPolicy ? titleOf(policyOf(focused[0] || cells[0] || [])) : '已筛选策略等权描述；非玩家人口分布，也不是配对因果效应';
    const floors = Array.from({ length: 12 }, (_, i) => i + 1), arrival = [], clear = [], fail = [], resource = [], rows = [];
    for (const f of floors) {
      const all = floorRows(focused, f), sum = index => all.reduce((a, row) => a + row.floor[index], 0), denominator = all.reduce((a, row) => a + row.cell[7], 0);
      arrival.push({ x:f, y:mean(all.map(row=>row.cell[7] ? row.floor[1]/row.cell[7] : null)), note:`观察到达 ${sum(1)}/${denominator} 条轨迹` });
      clear.push({ x:f, y:mean(all.map(row=>row.cell[7] ? row.floor[2]/row.cell[7] : null)), note:`观察清除 ${sum(2)}/${denominator}` });
      fail.push({ x:f, y:mean(all.map(row=>row.floor[1] ? row.floor[3]/row.floor[1] : null)), note:`本关失败 ${sum(3)}/${sum(1)} 条到达轨迹；生命 ${sum(4)}，期限 ${sum(5)}` });
      const values = all.map(row => metricAt(row.floor, $('metric').value)), value = mean(values.map(v=>v[0])), knownN = values.every(v=>v[1] !== null), observedN = knownN ? values.reduce((a,v)=>a+v[1],0) : null;
      resource.push({x:f,y:value,note:`${values.filter(v=>finite(v[0])).length}个有观测策略格；条件观测轨迹 ${observedN===null?'概览未给出':observedN}`});
      const clearN = sum(2), p50 = mean(all.map(row=>row.floor[10])), hp = mean(all.map(row=>metricAt(row.floor,'netHp')[0])), shield = mean(all.map(row=>metricAt(row.floor,'netShield')[0]));
      const lowerBound = index => all.some(row=>row.floor[index]) ? '<small>含未完成：当前观察下界</small>' : '';
      rows.push(cellRow([f, `${sum(1)} / ${denominator}`+lowerBound(13), `${sum(2)} / ${denominator}`+lowerBound(14), `${sum(3)} / ${sum(1)}`+lowerBound(15), `${sum(4)} / ${sum(5)}`, `${sum(6)} / ${sum(7)} / ${sum(8)}`, number(p50,2)+`<small>${clearN}条清关轨迹；${focused.length>1?'各策略P50均值':'清关者P50'}</small>`, `${number(hp,2)} / ${number(shield,2)}`, number(value,2)+`<small>条件N=${observedN===null?'未载入':observedN}</small>`]));
    }
    chart('pressure-chart',[{name:'到达 / 全部开局',color:'#74b9ff',points:arrival},{name:'清除 / 全部开局',color:'#4fd1a5',points:clear},{name:'本关失败 / 到达本关',color:'#ffb86b',points:fail}],{percent:true,minimum:0,maximum:1});
    chart('resource-chart',[{name:metricLabels[$('metric').value],color:'#c5a2ff',points:resource}]);
    $('floor-table').innerHTML = table(['关','到达/全部','清除/全部','失败/到达','生命败/期限败','前败未到/未完未到/到达未完','清场余裕（条件）','净HP/净盾均值',metricLabels[$('metric').value]],rows);
  }
  function refresh() {
    const cells = selectedCells(), across = selectedCells(false);
    if (focusedPolicy && !cells.some(c=>policyOf(c).id===focusedPolicy)) focusedPolicy=null;
    $('counts').textContent = `${cells.length} 个已观测策略—难度格 · 格内世界数 ${[...new Set(cells.map(c=>c[2]))].sort((a,b)=>a-b).join('/') || '—'} · ${cells.reduce((n,c)=>n+c[3],0).toLocaleString('zh-CN')} 条相关轨迹 · 完整行为组内未终局 ${cells.reduce((n,c)=>n+c[6],0)} · 另有 ${cells.reduce((n,c)=>n+c[11],0)} 个不全行为组（格内合计），不进入摘要分母。世界索引跨策略共享，不能把世界数简单相加。`;
    const ds=[...new Set(across.map(c=>c[1]))].sort((a,b)=>a-b);
    chart('difficulty-chart',[{name:'所选策略等权通关率（探索）',color:'#74b9ff',points:ds.map(d=>{const rows=across.filter(c=>c[1]===d);return {x:d,y:mean(rows.map(c=>c[4])),note:`${rows.length}策略格；缺格不补0`};})}],{percent:true,minimum:0,maximum:1,xLabel:'难度'});
    const groupRows=[];
    for(const axis of ['T','H','J','R'])for(const value of [...new Set(cells.map(c=>policyOf(c)[axis].id))]){const group=cells.filter(c=>policyOf(c)[axis].id===value),name=policyOf(group[0])[axis].name||axisNames[value]||value;groupRows.push(cellRow([labels[axis],esc(name),group.length,percentage(mean(group.map(c=>c[4]))),number(mean(group.map(c=>c[5])),2)]));}
    $('axis-table').innerHTML=table(['分组轴','档位','已观测格','策略等权通关率','平均清除关数'],groupRows);
    const sorted=cells.slice().sort((a,b)=>a[1]-b[1]||policyOf(a).id.localeCompare(policyOf(b).id)),pages=Math.max(1,Math.ceil(sorted.length/60));page=Math.min(page,pages-1);
    $('page-label').textContent=`${page+1}/${pages} · 按难度和ID排列，不按胜率排名`;
    $('cell-table').innerHTML=table(['策略（点击看逐关）','难度','世界/轨迹','终局/未完成','通关率及描述区间','清除关数'],sorted.slice(page*60,page*60+60).map(c=>cellRow([`<button class="row-button" data-focus="${esc(policyOf(c).id)}">${esc(titleOf(policyOf(c)))}</button>`,`D${c[1]}`,`${c[2]} / ${c[3]}`,`${c[8]} / ${c[6]}`,`${percentage(c[4])}<small>块描述CI ${c[17]?c[17].map(percentage).join(' – '):'未提供'}；首复本Wilson ${c[18]?c[18].map(percentage).join(' – '):'未提供'}</small>`,number(c[5],2)])));
    $('cell-table').querySelectorAll('[data-focus]').forEach(button=>button.addEventListener('click',()=>{focusedPolicy=button.dataset.focus;drawPressure(cells);$('pressure').scrollIntoView({block:'start',behavior:'smooth'});}));
    drawPressure(cells);
  }
  function confirmation(id, report) {
    if(!report){$(id).innerHTML='<p class="empty">本阶段尚未生成结果，不作确认结论。</p>';return;}
    const rows=report.tests.map(t=>{const percent=t.metric!=='clearedFloors',format=v=>percent?percentage(v):number(v,3),ci=t.formalCi95?.map(format).join(' – ')||'未提供',p=finite(t.formalP)?t.formalP.toExponential(3):'—';return cellRow([esc(t.id),`D${t.difficulty}${t.offset!==undefined?` · 后${t.offset}关`:''}`,`${t.worlds??0} / ${t.expectedWorlds??report.targetWorlds??'—'}`,format(t.estimate)+`<small>正式保守区间 ${ci}</small>`,`${p}<small>Holm ${finite(t.conservativeAdjustedP)?t.conservativeAdjustedP.toExponential(3):'—'}</small>`,esc(t.status||(!t.complete?'未完成':'未提供结论')),`<details><summary>方法</summary><p>${esc(t.formalMethod||report.methodNote||'未提供正式方法')}</p><p>bootstrap诊断p=${finite(t.bootstrapDiagnosticP)?t.bootstrapDiagnosticP.toExponential(3):'—'}，不是正式判定。</p><p>${esc(t.interpretation||'不显著不代表等价或平衡。')}</p></details>`]);});
    $(id).innerHTML=`<p class="note">family=${esc(report.family)}，计划${report.familySize??'—'}项，α=${report.alpha??'—'}。正式结论采用formalP/formalCi95及保守Holm；bootstrap只作诊断。保守护栏降低检出力，未拒绝不能写成已经平衡。</p><p>${esc(report.methodNote)}</p>`+table(['登记问题','难度/响应','世界/计划','估计差','正式p/保守调整','状态','方法'],rows);
  }
  function refreshForks(){
    const cells=(data.forks?.cells||[]).filter(c=>$('fork-difficulty').value==='all'||c[1]===Number($('fork-difficulty').value));
    const groups=new Map();for(const c of cells){if(!groups.has(c[12]))groups.set(c[12],[]);groups.get(c[12]).push(c);}
    const rows=[];
    for(const [cellId,group]of[...groups].sort((a,b)=>String(a[0]).localeCompare(String(b[0])))){
      const control=group.find(c=>c[13]==='A');
      for(const c of group.filter(c=>c[13]!=='A').sort((a,b)=>a[13].localeCompare(b[13]))){const risks=[0,1,2].map(offset=>{const target=c[15]+offset,fail=r=>r[7]&&!r[6]&&!r[11]?r[16].filter(f=>f[0]<=target).reduce((s,f)=>s+f[3],0)/r[7]:null,a=control?fail(control):null,b=fail(c);return finite(a)&&finite(b)?b-a:null;});rows.push(cellRow([esc(cellId),esc(c[14]),`${c[13]} − A`,`${c[2]}世界 / ${c[3]}轨迹<small>${c[6]||c[11]||control?.[6]||control?.[11]?'存在未完成/不全组，风险差不计算':'完整终局组'}</small>`,...risks.map(percentage)]));}
    }
    $('fork-table').innerHTML=table(['入口问题','动作类','分支对照','条件样本','本关风险差','后1关风险差','后2关风险差'],rows);
  }
  function coverage(){
    const rows=[];for(const [stage,report]of Object.entries(data.coverage)){for(const c of report?.cells||[])rows.push(cellRow([stage==='screen'?'过程筛查':'过程确认',esc(c.cellId),`${c.actual??0} / ${c.target??'—'}`,c.missing??'—',c.qualified??'—',esc(JSON.stringify(c.rootMix||{}))]));}
    $('coverage-table').innerHTML=table(['阶段','入口格','实际/目标世界','缺口','合格曝光','H构成'],rows);
    const missing=[...(data.registrations.matrix?.missingQuotas||[]),...(data.registrations.process?.missingQuotas||[])];
    $('quotas').innerHTML=missing.length?`<p>登记名额缺口：</p><pre>${esc(JSON.stringify(missing,null,2))}</pre>`:'<p>名额不足信息以登记文件为准；未载入不等于没有缺口。</p>';
  }
  $('status').textContent=data.status?`${data.status.status||'未知状态'} · ${data.status.stage||''} · 快照 ${data.status.updatedAt||data.generatedAt}`:'尚无执行状态文件；页面不代表实验已完成。';
  $('status').classList.toggle('warning',data.status?.status!=='complete');
  $('source-list').innerHTML=data.sources.map(source=>`<li><a href="${source.name.split('/').map(encodeURIComponent).join('/')}">${esc(source.name)}</a> · ${number(source.bytes/1024,1)} KiB <code>${esc(source.sha256)}</code></li>`).join('')||'<li>尚无阶段文件。</li>';
  $('metadata').textContent=JSON.stringify({version:data.version,generatedAt:data.generatedAt,screenIdentity:data.screen?.identity,forkIdentity:data.forks?.identity,pilot:data.pilot,notes:[...(data.screen?.notes||[]),...(data.forks?.notes||[])]},null,2);
  $('findings').innerHTML='<li>先看哪些关卡开始清场余裕下降、失血或应急消费上升，再看其后的失败；不能只靠终局胜率解释过程压力。</li><li>同T/H/R下奖励随机性更强若表现更好，应先核对估值、合法动作与计算预算；广筛线索需独立确认，不能直接证明游戏设计错误。</li><li>长期投资需要同时观察当前代价和未来兑现；角色高曝光或高胜率关联不等于单卡因果贡献。</li><li>资源错失结果只适用于本来会投入且有合格入口的状态；自然治疗保留，缺样不补零。</li><li>本页不设目标胜率，不调整游戏数值。真人可玩性仍需试玩。</li>';
  for(const id of ['difficulty','T','H','J','R','controls'])$(id).addEventListener('change',()=>{page=0;focusedPolicy=null;refresh();});
  $('metric').addEventListener('change',()=>drawPressure(selectedCells()));$('fork-difficulty').addEventListener('change',refreshForks);
  $('previous').addEventListener('click',()=>{page=Math.max(0,page-1);refresh();});$('next').addEventListener('click',()=>{page++;refresh();});
  $('clear-focus').addEventListener('click',()=>{focusedPolicy=null;drawPressure(selectedCells());});
  let resizeTimer; globalThis.addEventListener?.('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{refresh();refreshForks();},100);});
  confirmation('confirmation',data.confirmation);confirmation('process-confirmation',data.forkConfirmation);coverage();refreshForks();refresh();
}

export function buildPlayerMatrixHtml(bundle) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>多维玩家矩阵 · 离线观察报告</title><style>
:root{color-scheme:dark;font-family:system-ui,-apple-system,"PingFang SC",sans-serif;background:#0b1420;color:#e0e8f0;line-height:1.7}*{box-sizing:border-box}body{margin:0}main{max-width:1240px;margin:auto;padding:32px 24px 64px}h1{font-size:30px;margin:0 0 8px}h2{font-size:21px;margin:0 0 12px}h3{font-size:16px;margin:20px 0 8px}p{margin:8px 0 14px;color:#b9c9d9}header{margin-bottom:24px}.eyebrow{color:#82cfbb;font-size:12px;letter-spacing:2px}section{background:#121f2e;border:1px solid #2c4055;border-radius:12px;padding:22px;margin:18px 0}.note,.warning{border-left:3px solid #d6aa69;background:#28251f;padding:10px 14px;color:#ecd3ac;border-radius:4px}.filters{display:flex;flex-wrap:wrap;gap:12px}.filters label{display:grid;gap:4px;min-width:110px;font-size:12px;color:#9fb4ca}select,button{font:inherit;border:1px solid #40546a;background:#172b3e;color:#e1eaf3;border-radius:6px;padding:7px 10px;min-height:38px}select{max-width:230px}button{cursor:pointer}a{color:#8fc7ff}small{display:block;color:#a2b6c9;font-size:11px}.table-wrap{overflow:auto;margin:12px 0}table{border-collapse:collapse;width:100%;font-size:12px;min-width:600px}th,td{text-align:left;border-bottom:1px solid #2b4054;padding:9px 10px;vertical-align:top}th{background:#172a3b;white-space:nowrap}td{overflow-wrap:anywhere}tr:hover td{background:#172a3b}.row-button{background:transparent;border:0;text-align:left;padding:0;color:#b5d8fb;max-width:360px;line-height:1.5}.chart svg{width:100%;height:auto;min-width:0}.chart text{font-family:inherit;font-size:11px;fill:#a4b9ce}.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#c0d0e0}.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}.empty{padding:24px;color:#adbdcd;background:#0f1b28;border-radius:6px}.toolbar{display:flex;align-items:center;gap:10px;margin:12px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0c1825;padding:12px;border-radius:6px;font-size:11px}code{font-family:ui-monospace,monospace;font-size:10px;overflow-wrap:anywhere}summary{cursor:pointer;color:#a7d0f7}li{margin:8px 0}.two{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media(max-width:760px){main{padding:20px 10px 40px}section{padding:15px 12px}.two{grid-template-columns:1fr}h1{font-size:25px}.filters label{flex:1 1 130px}select{max-width:100%}.toolbar{flex-wrap:wrap}}
</style></head><body><main><header><div class="eyebrow">PLAYER MATRIX · OFFLINE EVIDENCE</div><h1>不同选择，怎样承受十二关压力</h1><p>策略偏好 × 长短期取向 × 奖励随机性 × 资源经营 × D1–D20</p><p id="status" class="note"></p><p class="note">世界种子是独立单位，世界内行为复本先平均。P1是探索，不能给最终排名；策略等权不是玩家人口分布。不显著不代表等价或已经平衡。</p></header>
<section><h2>选择观察范围</h2><div class="filters"><label>难度<select id="difficulty"></select></label><label>队伍偏好<select id="T"></select></label><label>长短期<select id="H"></select></label><label>奖励随机性<select id="J"></select></label><label>资源经营<select id="R"></select></label><label>控制策略<input id="controls" type="checkbox"></label></div><p id="counts"></p><h3>不同难度下的已选策略</h3><div id="difficulty-chart" class="chart"></div><p>曲线对已观测策略格等权；缺失格不补零。不是人口胜率，也没有在此图进行合并推断。</p><div id="axis-table"></div><p>其他轴未固定时，分组均值只是描述，不能当作单因素效应。</p></section>
<section id="pressure"><h2>逐关压力与投入</h2><p id="pressure-label"></p><button id="clear-focus">恢复当前筛选的策略等权视图</button><div id="pressure-chart" class="chart"></div><div class="filters"><label>逐关指标<select id="metric"></select></label></div><div id="resource-chart" class="chart"></div><p>余裕只描述清关者；净生命变化不是敌方伤害。表内轨迹合计用于解释条件分母，不能当独立世界数。多策略时余裕列是各策略P50的均值，不是合并样本P50；未完成/未到达单列。</p><div id="floor-table"></div></section>
<section><h2>策略格明细</h2><p>点击策略可查看该难度的逐关条件分布。显示值适度舍入，准确数值与全部指标保留在分析文件。</p><div class="toolbar"><button id="previous">上一页</button><span id="page-label"></span><button id="next">下一页</button></div><div id="cell-table"></div></section>
<section><h2>独立策略确认</h2><div id="confirmation"></div></section>
<section><h2>错失资源后一两关的变化</h2><p>A正常；B错失一次后恢复；C本关忽略后恢复；D持续忽略；E恢复后本关余下及后两关积极补救。下面广筛风险差为描述，不替代独立确认；E是整套补救策略的总效果。</p><label>过程难度 <select id="fork-difficulty"></select></label><div id="fork-table"></div><h3>独立过程确认</h3><div id="process-confirmation"></div></section>
<section><h2>覆盖、缺样与登记</h2><p>有资格但未达到目标、没有资格、没有到达和未完成是不同状态；高难晚期不能通过人工增强队伍凑样本。</p><div id="coverage-table"></div><div id="quotas"></div></section>
<section><h2>需要继续查明的线索</h2><ul id="findings"></ul><p>本页提供观察与核查入口，不自动给出角色削弱、敌人加强或目标胜率。</p></section>
<section><h2>原始分析与身份</h2><ul id="source-list"></ul><details><summary>源码、样本身份、计时及渲染边界</summary><pre id="metadata"></pre></details><p>所有图表和脚本内嵌，无外部依赖。只使用已经保存的阶段结果；缺阶段保持未完成。原始大批轨迹留在实验目录，不嵌入本页。</p></section></main><script id="matrix-data" type="application/json">${scriptJson(bundle)}</script><script>(${reportClient.toString()})();</script></body></html>`;
}
export async function renderPlayerMatrixReport({ directory, output } = {}) {
  directory = resolve(directory || 'report/player-matrix-v1');
  const bundle = await loadPlayerMatrixReport(directory), html = buildPlayerMatrixHtml(bundle), path = resolve(output || resolve(directory, 'index.html'));
  await mkdir(dirname(path), { recursive: true }); await writeFile(path, html);
  return { version: REPORT_VERSION, output: path, bytes: Buffer.byteLength(html), sha256: createHash('sha256').update(html).digest('hex'), inputs: bundle.sources.length, cells: (bundle.screen?.cells.length || 0) + (bundle.forks?.cells.length || 0), status: bundle.status?.status || 'missing-status', scope: 'Offline saved-analysis view; no new simulations or numerical changes.' };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), options = {};
  while (args.length) { const flag = args.shift(), value = args.shift(); if (!['--directory','--output'].includes(flag) || !value) throw new Error('Use --directory path and optional --output path.'); options[flag.slice(2)] = value; }
  console.log(JSON.stringify(await renderPlayerMatrixReport(options), null, 2));
}
