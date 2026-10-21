import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const scriptJson = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);

export function renderGrowthHtml(report, sourceName = 'summary.json') {
  if (!report || !Array.isArray(report.groups) || !report.groups.length || report.groups.some(group => !Array.isArray(group.cards))) {
    throw new Error('Input must be a summarizeGrowthCampaigns summary with nonempty groups and card arrays.');
  }
  const measuredVersion = escapeHtml(report.metadata?.measuredVersion || '未标版本');
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${measuredVersion} 卡牌成长诊断</title>
<style>
:root{--ink:#202c3a;--muted:#5e6e80;--line:#dbe3eb;--blue:#285e9c;--pale:#edf4fd;--warm:#fff5df;--green:#26745e;--bg:#f3f6fa}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}main{max-width:1560px;padding:36px 28px 64px;margin:auto}h1{font-size:clamp(25px,4vw,38px);line-height:1.25;margin:8px 0 14px;letter-spacing:-.6px}h2{font-size:19px;margin:0 0 12px}p{margin:8px 0}.eyebrow{font-size:12px;letter-spacing:1px;color:var(--blue);font-weight:750}.lede{color:var(--muted);max-width:1000px}.notice{background:var(--warm);border-left:4px solid #cfa149;padding:12px 16px;border-radius:6px;margin:20px 0}.small{font-size:12px;color:var(--muted)}.panel{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px;margin:18px 0;box-shadow:0 4px 18px #24374b04}.filters{display:grid;grid-template-columns:repeat(3,minmax(120px,1fr)) minmax(200px,1.5fr) minmax(130px,1fr);gap:12px}.filters label{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:650;color:var(--muted)}input,select,button{font:inherit;color:inherit}select,input{width:100%;min-height:42px;border:1px solid #bccbdb;border-radius:7px;background:white;padding:8px 10px}input:focus,select:focus,button:focus-visible,summary:focus-visible,a:focus-visible{outline:3px solid #a6c9f5;outline-offset:2px}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin:18px 0}.stat{background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px}.stat strong{display:block;font-size:25px;line-height:1.3;letter-spacing:-.5px}.stat span{font-size:12px;color:var(--muted)}.context{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.tag{font-size:12px;color:var(--blue);background:var(--pale);padding:3px 9px;border-radius:20px}.chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}.bars{display:grid;gap:8px}.bar-row{display:grid;grid-template-columns:110px minmax(50px,1fr) 74px;gap:10px;align-items:center;font-size:12px}.bar-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track{background:#edf1f6;border-radius:3px;min-height:17px;overflow:hidden}.bar{height:17px;background:#517faf;min-width:0;border-radius:3px}.bar.low{background:#a8b9cc}.bar-value{text-align:right;font-variant-numeric:tabular-nums}.chart-note{margin-top:12px}.table-head{display:flex;justify-content:space-between;align-items:baseline;gap:15px}.table-wrap{overflow:auto;max-height:73vh;border:1px solid var(--line);border-radius:9px;margin-top:12px;isolation:isolate}table{border-collapse:separate;border-spacing:0;width:100%;font-variant-numeric:tabular-nums;font-size:13px;white-space:nowrap}thead th{position:sticky;top:0;z-index:3;background:#edf2f8;color:#3c5068;font-weight:650;text-align:right;border-bottom:1px solid #b9c9da;padding:0}thead th:first-child{left:0;z-index:4;text-align:left;min-width:160px}thead button{border:0;background:transparent;width:100%;padding:13px 12px;cursor:pointer;text-align:inherit;font-size:12px;line-height:1.4;font-weight:650}thead button:hover{background:#dfeaf6}thead th.static{padding:13px 12px}tbody td{padding:12px;border-bottom:1px solid #e6ebf1;text-align:right;background:white;vertical-align:top}tbody tr:nth-child(even) td{background:#f8fafc}tbody tr:hover td{background:#edf4fd}tbody td:first-child{position:sticky;left:0;z-index:2;text-align:left;box-shadow:3px 0 7px #20384d07}tbody tr:last-child td{border-bottom:0}.card-name{font-weight:700;display:block}.card-role{font-size:11px;color:var(--muted)}.metric{display:block}.metric-sub{display:block;font-size:11px;color:var(--muted);line-height:1.5}.bad{color:#99612c}.good{color:var(--green)}.missing{color:#8290a0}.card-button{border:0;background:none;color:var(--blue);cursor:pointer;padding:0;text-align:left;line-height:1.5}.card-button:hover{text-decoration:underline}details{border-top:1px solid var(--line);margin-top:13px;padding-top:13px}details:first-child{border:0;padding-top:0;margin-top:0}summary{cursor:pointer;font-weight:650}li{margin:8px 0}ul,ol{padding-left:22px}.code{font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;word-break:break-all}pre{white-space:pre-wrap;max-height:350px;overflow:auto;font-size:11px;background:#f3f6fa;padding:12px;border-radius:6px}.strategy-wrap{overflow:auto}.strategy-table{min-width:880px;white-space:normal}.strategy-table th{position:static;padding:10px;text-align:left}.strategy-table td{position:static!important;text-align:left;box-shadow:none!important}.empty{padding:35px;text-align:center;color:var(--muted)}dialog{border:1px solid var(--line);border-radius:16px;width:min(900px,calc(100% - 24px));max-height:90vh;padding:24px;color:var(--ink)}dialog::backdrop{background:#16283d85}.dialog-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px}.close{background:#edf2f8;border:0;border-radius:7px;padding:6px 12px;cursor:pointer}.detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}.detail-item{border:1px solid var(--line);border-radius:8px;padding:10px}.detail-item>span{display:block;color:var(--muted);font-size:12px}.detail-item strong{font-size:18px}.footer{color:var(--muted);font-size:12px;margin-top:22px}.screen-reader{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(max-width:900px){.filters{grid-template-columns:repeat(3,minmax(0,1fr))}.filters label:nth-child(4){grid-column:span 2}.stats{grid-template-columns:repeat(3,minmax(0,1fr))}.chart-grid{grid-template-columns:1fr;gap:22px}.detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){main{padding:22px 12px 40px}h1{font-size:27px}.panel{padding:15px;border-radius:10px}.filters{grid-template-columns:1fr 1fr}.filters label:nth-child(4){grid-column:span 1}.filters label:last-child{grid-column:span 2}.stats{grid-template-columns:1fr 1fr;gap:8px}.stat{padding:12px}.stat strong{font-size:23px}.stats .stat:last-child{grid-column:span 2}.bar-row{grid-template-columns:98px minmax(30px,1fr) 69px;gap:7px}.table-head{display:block}thead th:first-child{min-width:125px}tbody td{padding:10px 8px}.table-wrap{max-height:75vh}.detail-grid{grid-template-columns:1fr 1fr}dialog{padding:18px}.notice{padding:10px 12px}}
</style>
</head>
<body>
<main>
<header><div class="eyebrow">STAR RAIL · GROWTH LAB / 离线诊断</div><h1>${measuredVersion} 卡牌成长诊断</h1><p class="lede">逐卡查看永久成长、标准高血靶的直接伤害与实际终止遭遇表现，比较不同难度及胜败样本。此页为冻结 ${measuredVersion} 规则下的 AI 实验报告，用于检查成长与构筑分工。</p><p class="small">全部批次共 ${escapeHtml(report.n?.toLocaleString("zh-CN") ?? "—")} 场；下方按难度与样本队列分别查看，每个数值均来自独立战役统计。</p></header>
<div class="notice"><strong>先看样本，再看数值。</strong> 终局持有的卡牌才进入标准靶测试；罕见卡牌与胜败子组可能样本不足。标准高血靶衡量同一终局编队的输出空间；实际终止遭遇会受到敌方剩余生命和出手顺序限制。数值高低不等同于卡牌的独立强弱。</div>
<section class="panel" aria-label="报告筛选"><div class="filters"><label>难度<select id="difficulty"></select></label><label>样本队列<select id="cohort"></select></label><label>胜败样本<select id="outcome"><option value="all">全部正常完成局</option><option value="victory">仅胜局</option><option value="defeat">仅败局</option></select></label><label>查找卡牌<input id="search" type="search" placeholder="卡名、编号或能力关键词" autocomplete="off"></label><label>卡牌类型<select id="role"><option value="all">全部类型</option><option value="attack">攻击型</option><option value="support">辅助型</option><option value="single">仅单体攻击</option><option value="blast">仅扩散攻击</option><option value="aoe">仅群体攻击</option><option value="zero">零直接伤害观测</option></select></label></div><div class="context" id="context"></div><p class="small">自然构筑和覆盖补测分别统计；覆盖补测改变公开奖励中的目标卡偏好，不代表自然抽取率。筛选不合并难度或队列。点击表头排序，点击卡名查看阶段与辅助明细。</p></section>
<section class="stats" id="stats" aria-label="样本覆盖概览"></section>
<div id="precision-note" class="notice" role="status" aria-live="polite"></div>
<section class="panel"><h2>永久成长分布</h2><p class="small" id="chart-caption"></p><div class="chart-grid"><div><p><strong>均值较高</strong><span class="small"> · 当前筛选前 10 张</span></p><div id="high-bars" class="bars"></div></div><div><p><strong>均值较低</strong><span class="small"> · 当前筛选后 10 张</span></p><div id="low-bars" class="bars"></div></div></div><p class="small chart-note">两侧共用同一比例尺。条长为终局每实例永久成长均值；n 为实际终局持有的独立战役数。“辅”标记辅助型卡牌。永久成长为 0 不代表无价值，星级、倍率、辅助与团队机制另计；小样本不能用于精细名次判断。</p></section>
<section class="panel"><div class="table-head"><h2>逐卡对照 <span id="row-count" class="small"></span></h2><span class="small">区间为逐卡 95% 区间 · 横向滑动查看全部指标 →</span></div><p class="small">威力与伤害分开计量。辅助产出为标准靶每登场数值；治疗、护盾和平加增益不折算为伤害。n=0 显示“—”，不会用 0 代替缺失。</p><div class="table-wrap" tabindex="0" aria-label="可横向滚动的逐卡指标表"><table id="card-table"><caption class="screen-reader">卡牌成长和战斗指标，可点击列标题排序</caption><thead><tr id="table-headers"></tr></thead><tbody id="table-body"></tbody></table></div></section>
<section class="panel"><details><summary>套路覆盖、成型与胜败</summary><p class="small">以下为当前难度和队列的全部策略配额，不随卡名、类型或胜败筛选改变。胜率与到达率区间采用 Wilson 95% 区间。</p><div class="strategy-wrap" id="strategies"></div></details><details><summary>统计口径与样本精度</summary><ul><li>终局按正常十二关单局定义，不进入无尽模式；测的是有限流程下的成长结果。独立样本单位是整场战役。每局先计算该卡每登场、每持有实例转的均值，再跨独立战役取平均。多张副本、战斗转数与探针重复次数都不当作新增独立样本。</li><li>主表的永久成长、实战成长速度、标准靶直伤、真实各阶段直伤与配对成长差展示 percentile bootstrap 95% 区间。以独立战役重采样 <span id="resamples">500</span> 次；这是逐卡区间，未做 90 卡多重比较校正，不能把细小名次差当成显著差异。其他指标未估计区间时只展示均值与 n。</li><li>全部完成局的主指标目标为至少 <span id="minimum">100</span> 个独立战役；胜败子组至少 <span id="outcome-minimum">30</span> 局。另要求相对区间半宽不超过 20%；均值绝对值小于 0.5 时改为绝对半宽 ≤0.1。“样本达数”并不保证区间精度达标。</li><li>动作上限等原因中断的未完成局单列，不算正常失败，也不进入卡牌终局指标。胜率分母只含正常完成局。不同指标可能有不同 n：终局未持有、阶段未到达或未登场时不补造观测。</li><li>终局保留成长均值衡量结束时持有实例的永久 growth；它不含星级基础威力、临时加成等完整卡面威力。实战成长 / 登场把同一战役早、中、晚期的原始记录累加，先以收到的永久 growth 增量除以该卡登场次数，再跨战役平均；可包含其他卡牌提供的成长。丹恒等初始 5 张卡与后期招募卡的培养时间不同，因此终局均值不是同龄卡的公平因果比较；应同时参考实战成长速度和阶段数据。</li></ul></details><details><summary>标准高血靶、实际终止遭遇与辅助卡的解释</summary><ul><li>标准靶使用真实终局编队、星级、永久成长和道具，以固定五列高血敌人、半血零盾、无敌方条款和超频测试。它降低敌方血量造成的输出截断，但仍受终局构筑选择影响。高血靶通常不发生击杀，会低估希儿、波提欧、不死途等角色的击杀触发收益，也不能完整反映“击破接力”等依赖击破敌列的体系价值。</li><li>“成长移除差”是完整终局状态与把测试前全队既有 growth 清零的配对伤害差；该次测试仍可新增成长。它包含全队成长交互，不能解释为某张卡自身成长的独立因果贡献。清除全队 growth 还可能让定向辅助重新选择目标；小幅负差不表示该卡的成长有害。</li><li>“终止遭遇”是每局最后一个实际遭遇，可早于第 12 层。第 12 层只统计实际到达并持有该卡的战役，存在幸存者偏差。早/中/晚期分别是第 1–4 / 5–8 / 9–12 层。</li><li>伤害账本仅累计每次转动内结算，不包括入关奇物的额外伤害；当前角色没有入关伤害技能。直接伤害合并角色普通攻击与自身技能伤害。奇物、羁绊、套路等公共来源的追加伤害单列，未分摊给单卡。卡牌间的增益、协同与队伍成型仍会影响最终输出。主表只统计正式永久实例；临时援军与委派见习的伤害不计入单卡表，也不回算给召唤者，但包含在全队转动内实伤中。临时援军 / 委派见习与公共来源分别展示，不能把全队与逐卡伤害的差额全部称为公共伤害。</li><li>辅助或零直接伤害卡必须同时查看治疗、护盾、给予他人的平加威力和团队表现。平加增益指标不完整表达倍率、减伤、经济、召援、保护和控制等价值；零直伤不表示无价值。</li><li>本实验描述本轮 AI 和冻结规则下的表现；AI 策略、难度和构筑路径都可能改变结果。结果支持定位成长失衡候选，不能替代玩家体验或调整后的复验。</li></ul></details><details><summary>数据来源、运行清单与复核</summary><p>本页全部数据、样式和交互均已内嵌，打开无需联网。输入文件：<span class="code">${escapeHtml(sourceName)}</span>。</p><p id="source-summary" class="small"></p><pre id="metadata"></pre></details></section>
<p class="footer">${measuredVersion} 卡牌成长诊断 · 此文件是实验报告，不是游戏成品。角色名称沿用游戏内容；本页不使用外部头像、字体或脚本。</p>
</main>
<dialog id="card-dialog" aria-labelledby="dialog-title"><div class="dialog-head"><h2 id="dialog-title"></h2><button class="close" id="close-dialog" type="button" aria-label="关闭卡牌明细">关闭</button></div><div id="dialog-content"></div></dialog>
<script id="report-data" type="application/json">${scriptJson(report)}</script>
<script>
${String.raw`
'use strict';
const report = JSON.parse(document.getElementById('report-data').textContent);
const $ = id => document.getElementById(id);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const num = value => finite(value) ? value.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '—';
const int = value => finite(value) ? value.toLocaleString('zh-CN') : '—';
const roleNames = { single:'单体', blast:'扩散', aoe:'群体', support:'辅助' };
const cohortName = cohort => cohort === 'coverage' ? '覆盖补测' : '自然构筑';
const outcomeNames = { all:'全部完成局', victory:'胜局', defeat:'败局' };
const get = (value, path) => path.split('.').reduce((item, key) => item == null ? null : item[key], value);
const definition = (card, outcome) => outcome === 'all' ? card : card.outcomes && card.outcomes[outcome] || {};
const minN = () => $('outcome').value === 'all' ? (report.method?.precision?.minimumCampaigns || 100) : (report.method?.precision?.outcomeMinimumCampaigns || 30);
let sort = { key:'endGrowth', direction:-1 };
let activeGroup;
const columns = [
  {key:'name', label:'角色 / 类型', text:true},
  {key:'probe.damagePerAppearance.n', label:'标准靶独立 n', raw:true},
  {key:'endGrowth', label:'永久成长 / 实例', interval:true},
  {key:'lifetime.growthPerAppearance', label:'实战成长 / 登场', interval:true},
  {key:'probe.powerPerAppearance', label:'标准靶威力 / 登场'},
  {key:'terminal.powerPerAppearance', label:'终止遭遇威力 / 登场'},
  {key:'probe.damagePerAppearance', label:'标准靶直伤 / 登场', interval:true},
  {key:'terminal.damagePerAppearance', label:'终止遭遇实伤 / 登场', interval:true},
  {key:'growthDelta.damagePerAppearance', label:'成长移除差 / 登场', interval:true},
  {key:'final12.damagePerAppearance', label:'第 12 层实伤 / 登场', interval:true},
  {key:'probe.damagePerInstanceTurn', label:'标准靶直伤 / 持有实例转'},
  {key:'probe.healingPerAppearance', label:'治疗 / 登场'},
  {key:'probe.shieldPerAppearance', label:'护盾生成 / 登场'},
  {key:'probe.buffPerAppearance', label:'给予他人平加威力 / 登场'},
  {key:'precision', label:'主指标精度', status:true}
];
function statusText(value) {
  if (!value || !value.n) return {text:'无观测', cls:'missing'};
  if (value.precise) return {text:'精度达标', cls:'good'};
  if (value.enoughCampaigns === false || value.n < minN()) return {text:'样本不足', cls:'bad'};
  return {text:value.status === 'interval-unavailable' ? '区间未估计' : '区间仍宽', cls:'bad'};
}
function metricHtml(value, interval) {
  if (!value || !value.n || !finite(value.mean)) return '<span class="missing">—</span><span class="metric-sub">n=0 · 无观测</span>';
  const ci = interval && value.ci95 && value.ci95.every(finite) ? '[' + num(value.ci95[0]) + ', ' + num(value.ci95[1]) + ']' : interval ? '区间未估计' : '';
  return '<span class="metric">' + num(value.mean) + '</span><span class="metric-sub">' + (ci ? ci + ' · ' : '') + 'n=' + int(value.n) + (value.n < minN() ? ' · 样本不足' : '') + '</span>';
}
function rate(value) {
  if (!value || !value.n) return '—（n=0）';
  const ci = value.ci95?.every(finite) ? ' [' + num(value.ci95[0] * 100) + ', ' + num(value.ci95[1] * 100) + ']%' : '';
  return num(value.rate * 100) + '%' + ci + '；' + int(value.count) + '/' + int(value.n);
}
function options(values, name) { return values.map(value => '<option value="' + esc(value) + '">' + esc(name(value)) + '</option>').join(''); }
function selectedRows() {
  const query = $('search').value.trim().toLocaleLowerCase('zh-CN'), role = $('role').value;
  return activeGroup.cards.map(card => ({card, data:definition(card, $('outcome').value)})).filter(({card,data}) => {
    if (query && ![card.name,card.id,card.description,card.path].some(text => String(text || '').toLocaleLowerCase('zh-CN').includes(query))) return false;
    if (role === 'attack' && card.attack === 'support') return false;
    if (role === 'support' && card.attack !== 'support') return false;
    if (['single','blast','aoe'].includes(role) && card.attack !== role) return false;
    if (role === 'zero' && !data.allDirectDamageZero) return false;
    return true;
  });
}
function sortValue(row, key) {
  if (key === 'name') return row.card.name;
  if (key === 'precision') return row.data.precision?.damagePerAppearance?.precise ? 1 : 0;
  const value = get(row.data, key);
  return finite(value) ? value : finite(value?.mean) ? value.mean : null;
}
function sortedRows(rows) {
  return rows.slice().sort((a,b) => {
    const x = sortValue(a, sort.key), y = sortValue(b, sort.key);
    if (x === null && y !== null) return 1;
    if (y === null && x !== null) return -1;
    const delta = typeof x === 'string' ? x.localeCompare(y,'zh-CN') : (x || 0) - (y || 0);
    return delta * sort.direction || String(a.card.id).localeCompare(String(b.card.id),'en');
  });
}
function renderHeaders() {
  $('table-headers').innerHTML = columns.map(column => '<th scope="col" aria-sort="' + (sort.key === column.key ? sort.direction === 1 ? 'ascending' : 'descending' : 'none') + '"><button type="button" data-sort="' + esc(column.key) + '">' + esc(column.label) + (sort.key === column.key ? sort.direction === 1 ? ' ↑' : ' ↓' : ' ↕') + '</button></th>').join('');
}
function renderRows(rows) {
  $('row-count').textContent = '显示 ' + rows.length + ' / ' + activeGroup.cards.length + ' 张';
  renderHeaders();
  $('table-body').innerHTML = rows.length ? sortedRows(rows).map(({card,data}) => '<tr>' + columns.map(column => {
    if (column.text) return '<td><button class="card-button" data-card="' + esc(card.id) + '" type="button"><span class="card-name">' + esc(card.name) + '</span></button><span class="card-role">' + esc(roleNames[card.attack] || card.attack || '未知类型') + ' · ' + esc(card.path || '') + (card.attack === 'support' || data.allDirectDamageZero ? ' · 看辅助' : '') + '</span></td>';
    if (column.status) {
      const damage = statusText(data.precision?.damagePerAppearance), growth = statusText(data.precision?.endGrowth);
      return '<td><span class="metric ' + damage.cls + '">直伤：' + damage.text + '</span><span class="metric-sub ' + growth.cls + '">成长：' + growth.text + '</span></td>';
    }
    const value = get(data,column.key);
    if (column.raw) return '<td><span class="metric">' + int(value || 0) + '</span><span class="metric-sub ' + ((value || 0) < minN() ? 'bad' : '') + '">' + ((value || 0) < minN() ? '低于 ' + minN() + ' 局' : '已达样本门槛') + '</span></td>';
    return '<td>' + metricHtml(value, column.interval) + '</td>';
  }).join('') + '</tr>').join('') : '<tr><td colspan="' + columns.length + '"><div class="empty">没有符合筛选条件的卡牌。清空卡名或切换类型后重试。</div></td></tr>';
}
function renderCharts(rows) {
  const observed = rows.filter(row => row.data.endGrowth?.n && finite(row.data.endGrowth.mean)).sort((a,b) => b.data.endGrowth.mean - a.data.endGrowth.mean || String(a.card.id).localeCompare(String(b.card.id)));
  const scale = Math.max(1, ...observed.map(row => Math.abs(row.data.endGrowth.mean)));
  const bars = (list,low) => list.length ? list.map(({card,data}) => '<div class="bar-row"><span class="bar-name" title="' + esc((card.attack === 'support' ? '辅助型 · ' : data.allDirectDamageZero ? '零直伤观测 · ' : '') + card.name) + '">' + esc((card.attack === 'support' ? '辅 · ' : data.allDirectDamageZero ? '零直伤 · ' : '') + card.name) + '</span><div class="track"><div class="bar' + (low ? ' low' : '') + '" style="width:' + Math.max(0,Math.min(100,Math.abs(data.endGrowth.mean) / scale * 100)) + '%"></div></div><span class="bar-value">' + num(data.endGrowth.mean) + '<span class="metric-sub">n=' + int(data.endGrowth.n) + '</span></span></div>').join('') : '<p class="small">当前没有终局持有观测。</p>';
  $('high-bars').innerHTML = bars(observed.slice(0,10),false);
  $('low-bars').innerHTML = bars(observed.slice(-10).reverse(),true);
  $('chart-caption').textContent = 'D' + activeGroup.difficulty + ' · ' + cohortName(activeGroup.cohort) + ' · ' + outcomeNames[$('outcome').value] + '。图表随卡名和类型筛选变化；零成长照常显示，未观测卡牌保留在下表。';
}
function renderStats() {
  const outcome = $('outcome').value, cards = activeGroup.cards.map(card => definition(card,outcome));
  const covered = cards.filter(card => card.probe?.damagePerAppearance?.n > 0).length;
  const enough = cards.filter(card => (card.probe?.damagePerAppearance?.n || 0) >= minN()).length;
  const precise = cards.filter(card => card.precision?.damagePerAppearance?.precise).length;
  const completed = outcome === 'all' ? activeGroup.completed : outcome === 'victory' ? activeGroup.wins : activeGroup.defeats;
  const stats = [
    [int(completed), outcomeNames[outcome] + ' · 当前队列'],
    [int(activeGroup.wins) + ' / ' + int(activeGroup.defeats),'当前队列胜 / 败'],
    [covered + ' / ' + activeGroup.cards.length,'标准靶有观测卡牌'],
    [enough + ' / ' + activeGroup.cards.length,'独立样本 ≥' + minN() + ' 局'],
    [precise + ' / ' + activeGroup.cards.length,'标准靶直伤精度达标']
  ];
  $('stats').innerHTML = stats.map(([value,label]) => '<div class="stat"><strong>' + esc(value) + '</strong><span>' + esc(label) + '</span></div>').join('');
  const missing = activeGroup.cards.length - covered, small = covered - enough;
  $('precision-note').innerHTML = '<strong>' + (small || missing ? '仍需谨慎：' : '样本覆盖：') + '</strong>当前胜败口径下，' + small + ' 张有观测卡牌不足 ' + minN() + ' 个独立战役，' + missing + ' 张没有标准靶观测；' + (enough - precise) + ' 张虽达到样本数量门槛，区间精度仍未达标。全 ' + activeGroup.cards.length + ' 张卡均保留在下表。';
  $('context').innerHTML = [
    '入组 ' + int(activeGroup.n) + ' 局',
    '正常完成 ' + int(activeGroup.completed) + ' 局',
    '未完成 ' + int(activeGroup.incomplete) + ' 局（不算失败）',
    '第 12 层到达 ' + int(activeGroup.reached12?.count) + ' / ' + int(activeGroup.reached12?.n),
    '胜率 ' + (finite(activeGroup.winRate?.rate) ? num(activeGroup.winRate.rate * 100) + '%' : '—'),
    '公共来源伤害 ' + num(activeGroup.sharedDamage?.mean) + ' / 完成局',
    ...(activeGroup.temporaryOrCommissionDamage?.n ? ['临时援军 / 见习伤害 ' + num(activeGroup.temporaryOrCommissionDamage.mean) + ' / 完成局'] : []),
    '全队转动内实伤 ' + num(activeGroup.allDamage?.mean) + ' / 完成局'
  ].map(label => '<span class="tag">' + esc(label) + '</span>').join('');
}
function renderStrategies() {
  const headers = ['策略 / 目标卡','完成 / 入组','胜 / 败','胜率及 95% 区间','第 12 层到达率','终局任一成型','目标终局成型','平均成型数'];
  $('strategies').innerHTML = '<table class="strategy-table"><thead><tr>' + headers.map(header => '<th>' + header + '</th>').join('') + '</tr></thead><tbody>' + (activeGroup.strategies || []).map(strategy => '<tr>' + [esc(strategy.name), int(strategy.completed) + ' / ' + int(strategy.n), int(strategy.wins) + ' / ' + int(strategy.defeats),rate(strategy.winRate),rate(strategy.reached12),rate(strategy.anyFinalFormation),strategy.targetFinalFormation ? rate(strategy.targetFinalFormation) : '未设固定套路',num(strategy.meanFinalFormationCount?.mean)].map(value => '<td>' + value + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
}
function render() {
  activeGroup = report.groups.find(group => String(group.difficulty) === $('difficulty').value && group.cohort === $('cohort').value);
  if (!activeGroup) return;
  renderStats();
  const rows = selectedRows();
  renderRows(rows);
  renderCharts(rows);
  renderStrategies();
}
function updateCohort() {
  const previous = $('cohort').value, cohorts = [...new Set(report.groups.filter(group => String(group.difficulty) === $('difficulty').value).map(group => group.cohort))];
  $('cohort').innerHTML = options(cohorts,cohortName);
  if (cohorts.includes(previous)) $('cohort').value = previous;
  else if (cohorts.includes('natural')) $('cohort').value = 'natural';
  render();
}
function showCard(id) {
  const card = activeGroup.cards.find(card => String(card.id) === String(id));
  if (!card) return;
  const data = definition(card,$('outcome').value);
  $('dialog-title').textContent = card.name + ' · ' + outcomeNames[$('outcome').value];
  const details = [
    ['永久成长 / 实例',data.endGrowth,true],['标准靶威力 / 登场',data.probe?.powerPerAppearance],['标准靶直伤 / 登场',data.probe?.damagePerAppearance,true],
    ['去既有成长直伤 / 登场',data.noGrowthProbe?.damagePerAppearance,true],['全队成长移除配对差 / 登场',data.growthDelta?.damagePerAppearance,true],['终局平均星级',data.endStars],
    ['终止遭遇威力 / 登场',data.terminal?.powerPerAppearance],['终止遭遇实伤 / 登场',data.terminal?.damagePerAppearance,true],['第 12 层实伤 / 登场',data.final12?.damagePerAppearance,true],['终止遭遇实伤 / 持有实例转',data.terminal?.damagePerInstanceTurn],
    ['早期实伤 / 登场（1–4 层）',data.early?.damagePerAppearance,true],['中期实伤 / 登场（5–8 层）',data.mid?.damagePerAppearance,true],['晚期实伤 / 登场（9–12 层）',data.late?.damagePerAppearance,true],
    ['治疗 / 登场',data.probe?.healingPerAppearance],['护盾生成 / 登场',data.probe?.shieldPerAppearance],['给予他人平加威力 / 登场',data.probe?.buffPerAppearance],
    ['全程实战成长 / 登场',data.lifetime?.growthPerAppearance,true],['全程成长 / 持有实例转',data.lifetime?.growthPerInstanceTurn],
    ['早期成长 / 持有实例转',data.early?.growthPerInstanceTurn],['中期成长 / 持有实例转',data.mid?.growthPerInstanceTurn],['晚期成长 / 持有实例转',data.late?.growthPerInstanceTurn]
  ];
  $('dialog-content').innerHTML = '<p class="small">' + esc(card.id) + ' · ' + esc(roleNames[card.attack] || card.attack) + ' · ' + esc(card.path || '') + ' · 基础威力 ' + num(card.basePower) + '</p><p>' + esc(card.description) + '</p><p class="notice"><strong>永久成长来源（静态规则）</strong><br>' + esc(card.growthSources?.summary || '本批数据未记录静态成长来源；请结合能力说明与实测指标判断。') + '</p>' + (card.roleCaution ? '<p class="notice">' + esc(card.roleCaution) + '</p>' : '') + '<p class="small">本口径曾持有 ' + int(data.everHeld) + ' 局，进入候选 ' + int(data.offered) + ' 局，终局持有 ' + int(data.endHeld) + ' 局。' + ($('outcome').value === 'all' ? '另有 ' + int(card.censoredEverHeld) + ' 局未完成战役曾持有此卡，已排除在终局统计外。' : '') + '</p><div class="detail-grid">' + details.map(([label,value,interval]) => '<div class="detail-item"><span>' + esc(label) + '</span>' + metricHtml(value,interval) + '</div>').join('') + '</div><p class="small">伤害为正式永久实例的角色来源直接伤害；团队公共追加不分摊给卡牌。临时援军与委派见习伤害未计入单卡，也不回算给召唤者。实际终止遭遇可早于第 12 层。辅助产出不折算为伤害。</p>';
  $('card-dialog').showModal();
}
$('difficulty').innerHTML = options([...new Set(report.groups.map(group => group.difficulty))].sort((a,b) => a-b),value => 'D' + value);
if (report.groups.some(group => group.difficulty === 10)) $('difficulty').value = '10';
$('difficulty').addEventListener('change',updateCohort);
for (const id of ['cohort','outcome','role']) $(id).addEventListener('change',render);
$('search').addEventListener('input',render);
$('table-headers').addEventListener('click',event => {
  const button = event.target.closest('[data-sort]');
  if (!button) return;
  sort = {key:button.dataset.sort,direction:sort.key === button.dataset.sort ? -sort.direction : button.dataset.sort === 'name' ? 1 : -1};
  renderRows(selectedRows());
});
$('table-body').addEventListener('click',event => {
  const button = event.target.closest('[data-card]');
  if (button) showCard(button.dataset.card);
});
$('close-dialog').addEventListener('click',() => $('card-dialog').close());
$('card-dialog').addEventListener('click',event => { if (event.target === $('card-dialog')) { const box = event.target.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) $('card-dialog').close(); } });
$('resamples').textContent = int(report.method?.bootstrapResamples || 500);
$('minimum').textContent = int(report.method?.precision?.minimumCampaigns || 100);
$('outcome-minimum').textContent = int(report.method?.precision?.outcomeMinimumCampaigns || 30);
$('source-summary').textContent = '报告格式：' + (report.version || '未记录') + '；总入组 ' + int(report.n) + ' 场，独立种子 ' + int(report.independentSeeds) + ' 个，分组 ' + report.groups.length + ' 个。各组独立展示，不汇总为一份卡牌排名。';
$('metadata').textContent = JSON.stringify({version:report.version,metadata:report.metadata,method:report.method},null,2);
updateCohort();
`}
</script>
</body>
</html>\n`;
}

async function main() {
  const args = process.argv.slice(2), options = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index], value = args[index + 1];
    if (!['--input', '--output'].includes(key) || options.has(key) || !value || value.startsWith('--')) throw new Error('Usage: node scripts/render-growth-report.mjs --input summary.json --output report.html');
    options.set(key, value);
  }
  if (!options.has('--input') || !options.has('--output')) throw new Error('Both --input and --output are required.');
  const input = resolve(options.get('--input')), output = resolve(options.get('--output'));
  if (input === output) throw new Error('Input and output paths must be different.');
  const report = JSON.parse(input.endsWith('.gz') ? gunzipSync(await readFile(input)).toString('utf8') : await readFile(input, 'utf8'));
  const html = renderGrowthHtml(report, options.get('--input'));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Saved offline growth report (${report.groups.length} groups) to ${output}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
