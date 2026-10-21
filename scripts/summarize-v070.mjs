import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { readV070Report, hashV070File } from './v070-results-io.mjs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { interval as sampleInterval } from '../src/balance-v070.js';
import { CHARACTERS as currentCharacters } from '../src/content.js';

const args = process.argv.slice(2), options = new Map();
for (let i = 0; i < args.length; i += 2) { const key = args[i]?.slice(2), value = args[i + 1]; if (!['inputs', 'output', 'check-current'].includes(key) || options.has(key) || !value) throw new Error('Use --inputs file1,file2 --output basename [--check-current true|false]'); options.set(key, value); }
if (!options.has('inputs')) throw new Error('--inputs is required');
const paths = options.get('inputs').split(',').map(path => resolve(path)), checkCurrent = options.get('check-current') !== 'false', base = resolve(options.get('output') || 'docs/V070-TEST-RESULTS');
const reports = [], errors = [], warnings = [];
for (const path of paths) { const report = await readV070Report(path); reports.push({ path, sha256: await hashV070File(path), report }); }
const approximately = (actual, expected, label) => { if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual - expected) > .000003) errors.push(`${label}: ${actual} != ${expected}`); };
const roles = { attack: '攻击', defense: '防御', amplifier: '即时增幅', trainer: '永久培养', disruptor: '敌方干扰' }, statuses = { equivalent: '等价范围内', outside: '超出实践范围', insufficient: '区间不足', 'reference-insufficient': '参考不足', 'potential-description': '潜力描述' };
const round = (n, digits = 2) => n == null || !Number.isFinite(n) ? '—' : n.toFixed(digits), percent = n => n == null ? '—' : `${round(n * 100, 1)}%`, range = (entry, percentage = false) => entry?.ci ? `[${entry.ci.map(n => percentage ? percent(n) : round(n)).join(', ')}]` : '—';
const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
const metricKeys = ['damage', 'hpLost', 'healing', 'shieldGenerated', 'shieldBlocked', 'shieldRemaining', 'growth', 'retainedGrowthDelta', 'coins', 'directDamage'];
for (const { path, report } of reports) {
  const prefix = path.split('/').at(-1), config = report.config;
  if (!report.sourceStable) errors.push(`${prefix}: sourceStable is not true`);
  if (!Array.isArray(report.rows) || !report.rows.length) errors.push(`${prefix}: no raw records`);
  if (!config || !report.protocol || !report.sourceHashes) { errors.push(`${prefix}: missing provenance`); continue; }
  if (!report.sourceHashes['src/ai-spatial.js']) errors.push(`${prefix}: ai-spatial source not fingerprinted`);
  if (checkCurrent) for (const [file, sha] of Object.entries(report.sourceHashes)) { const bytes = await readFile(new URL(`../${file}`, import.meta.url)); if (createHash('sha256').update(bytes).digest('hex') !== sha) errors.push(`${prefix}: current source differs: ${file}`); }
  if (report.spatialDesign?.forbiddenStrategyReferences?.length) errors.push(`${prefix}: skills reference internal strategies`);
  const seen = new Set(), ids = new Set(report.cards.map(card => card.id));
  for (const row of report.rows) {
    const key = config.mode === 'campaigns' ? `${row.strategyId}|${row.seed}` : [row.focusId, row.background, row.stage, row.enemy, row.sample].join('|');
    if (seen.has(key)) errors.push(`${prefix}: duplicate ${key}`); seen.add(key);
    if (config.mode === 'cards') {
      if (!ids.has(row.focusId)) errors.push(`${prefix}: unknown card ${row.focusId}`);
      if (row.layoutUids?.length !== 20 || new Set(row.layoutUids.filter(Boolean)).size !== row.layoutUids.filter(Boolean).length) errors.push(`${prefix}: illegal layout ${key}`);
      for (const metric of metricKeys) { approximately(row.delta[metric], row.full[metric] - row.off[metric], `${prefix}/${key}/skill/${metric}`); approximately(row.presence[metric], row.full[metric] - row.absent[metric], `${prefix}/${key}/presence/${metric}`); if (row.moved && row.movedOff) approximately(row.spatial[metric], (row.full[metric] - row.off[metric]) - (row.moved[metric] - row.movedOff[metric]), `${prefix}/${key}/position/${metric}`); }
      if (row.full.directDamage > row.full.damage + .03 || row.full.directDamage < 0) errors.push(`${prefix}: invalid focal damage ${key}`);
    } else if (config.mode === 'campaigns') {
      if (row.stopped || !['victory', 'defeat'].includes(row.phase)) errors.push(`${prefix}: incomplete ${key}`);
      if (row.won !== (row.phase === 'victory')) errors.push(`${prefix}: incorrect won flag ${key}`);
      for (const turn of row.turns) if (turn.cards.some(card => !ids.has(card.id))) errors.push(`${prefix}: unknown observed character ${key}`);
    } else if (config.mode === 'layers') for (const layer of row.layers) for (const metric of metricKeys) approximately(layer.delta[metric], row.full[metric] - layer.off[metric], `${prefix}/${key}/${layer.id}/${metric}`);
  }
  if (config.mode === 'cards') {
    const covered = new Set(report.rows.map(row => row.focusId));
    if (covered.size !== report.cards.length) warnings.push(`${prefix}: only ${covered.size}/${report.cards.length} cards covered`);
    for (const row of report.summary) { const n = report.rows.filter(raw => raw.focusId === row.focusId && raw.background === row.background && raw.stage === row.stage && raw.enemy === row.enemy).length; if (n !== row.n) errors.push(`${prefix}: summary denominator mismatch`); }
  }
  if (config.mode === 'campaigns') for (const strategy of report.strategies) { const count = report.rows.filter(row => row.strategyId === strategy.id).length; if (count !== config.samples) errors.push(`${prefix}: unpaired strategy count ${strategy.id}`); }
}
const commonHashes = new Map();
for (const { path, report } of reports) for (const [file, sha] of Object.entries(report.sourceHashes || {})) { if (commonHashes.has(file) && commonHashes.get(file) !== sha) errors.push(`Input reports use different sources: ${file} (${path})`); commonHashes.set(file, sha); }
function campaignCardCoverage(report) {
  const campaigns = report.rows.map(run => {
    const cards = new Map();
    for (const turn of run.turns) for (const row of turn.cards) {
      if (!cards.has(row.id)) cards.set(row.id, {});
      const byStage = cards.get(row.id); if (!byStage[turn.stage]) byStage[turn.stage] = { held: 0, present: 0, damage: 0, healing: 0, shield: 0, retainedGrowthDelta: 0, triggered: 0, growthLevelSum: 0 };
      const value = byStage[turn.stage]; value.held += row.held; value.present += row.present; value.damage += row.damage; value.healing += row.healing; value.shield += row.shield; value.retainedGrowthDelta += row.growth; value.triggered += row.present ? row.triggered : 0; value.growthLevelSum += row.endGrowth;
    }
    return { run, cards };
  });
  const seedIds = [...new Set(report.rows.map(run => run.seed))];
  return { population: 'uniform mixture of included tag strategies; seed-clustered intervals, not human player averages', campaignCount: campaigns.length, nSeeds: seedIds.length, cards: report.cards.map(card => {
    const cardRuns = campaigns.filter(entry => entry.cards.has(card.id));
    return { id: card.id, name: card.name, role: card.role, offeredCampaigns: campaigns.filter(entry => (entry.run.offered[card.id] || 0) > 0).length, pickedCampaigns: campaigns.filter(entry => (entry.run.picks[card.id] || 0) > 0).length, heldCampaigns: cardRuns.length, appearedCampaigns: cardRuns.filter(entry => Object.values(entry.cards.get(card.id)).some(stage => stage.present > 0)).length,
      stages: Object.fromEntries(['early', 'mid', 'late'].map(stage => {
        const raw = cardRuns.map(entry => entry.cards.get(card.id)[stage]).filter(Boolean), clustered = seedIds.map(seed => {
          const matching = campaigns.filter(entry => entry.run.seed === seed), values = matching.map(entry => entry.cards.get(card.id)?.[stage]).filter(Boolean);
          const sum = key => values.reduce((total, value) => total + value[key], 0);
          return { held: sum('held'), present: sum('present'), damage: sum('damage') / matching.length, damagePerAppearance: sum('present') ? sum('damage') / sum('present') : null, healingPerAppearance: sum('present') ? sum('healing') / sum('present') : null, shieldPerAppearance: sum('present') ? sum('shield') / sum('present') : null, growthPerHeldTurn: sum('held') ? sum('retainedGrowthDelta') / sum('held') : null, retainedGrowthLevel: sum('held') ? sum('growthLevelSum') / sum('held') : null };
        });
        return [stage, { heldCampaigns: raw.length, appearedCampaigns: raw.filter(value => value.present > 0).length, heldInstanceTurns: raw.reduce((sum, value) => sum + value.held, 0), appearances: raw.reduce((sum, value) => sum + value.present, 0), zeroTriggerAppearances: raw.reduce((sum, value) => sum + value.present - value.triggered, 0), damageAllSeeds: sampleInterval(clustered.map(value => value.damage)), damagePerAppearance: sampleInterval(clustered.map(value => value.damagePerAppearance).filter(value => value !== null)), healingPerAppearance: sampleInterval(clustered.map(value => value.healingPerAppearance).filter(value => value !== null)), shieldPerAppearance: sampleInterval(clustered.map(value => value.shieldPerAppearance).filter(value => value !== null)), retainedGrowthPerHeldTurn: sampleInterval(clustered.map(value => value.growthPerHeldTurn).filter(value => value !== null)), retainedGrowthLevel: sampleInterval(clustered.map(value => value.retainedGrowthLevel).filter(value => value !== null)) }];
      })) };
  }) };
}
const cardReport = reports.find(entry => entry.report.config.mode === 'cards')?.report, layerReport = reports.find(entry => entry.report.config.mode === 'layers')?.report, campaignReports = reports.filter(entry => entry.report.config.mode === 'campaigns').map(entry => entry.report), comparisons = cardReport?.overviewComparisons || [];
const comparisonCounts = Object.fromEntries(['equivalent', 'outside', 'insufficient', 'reference-insufficient', 'potential-description'].map(status => [status, comparisons.filter(row => row.status === status).length]));
const rawMetadata = cardReport?.cards || reports[0].report.cards;
const currentContentHash = createHash('sha256').update(await readFile(new URL('../src/content.js', import.meta.url))).digest('hex');
const metadataContentHash = reports[0].report.sourceHashes['src/content.js'];
const metadataSupplement = currentContentHash === metadataContentHash ? { source: 'src/content.js', sha256: currentContentHash, reason: 'Frozen collector metadata omitted base power; exact source hash matches experiment snapshot' } : null;
const completeMetadata = rawMetadata.map(card => { const trusted = metadataSupplement ? currentCharacters.find(character => character.id === card.id) : null; return { ...card, power: card.power ?? trusted?.power ?? null, roleLabel: card.roleLabel ?? trusted?.roleLabel ?? null }; });
const compact = { generatedAt: new Date().toISOString(), gameVersion: reports[0].report.gameVersion, protocol: reports[0].report.protocol, cards: completeMetadata, metadataSupplement, synergies: cardReport?.synergies || reports[0].report.synergies, assessment: { phase: reports.every(entry => ['holdout', 'stress'].includes(entry.report.config.split)) ? 'holdout' : 'calibration', balanceConclusion: 'Pending human-readable interpretation of measured outliers and uncertainty; no all-card equivalence claim.' }, validation: { ready: errors.length === 0, errors: [...new Set(errors)], warnings: [...new Set(warnings)], checks: ['source stability and fingerprint equality', 'raw unique statistical units', 'legal 20-cell layouts', 'independently recomputed skill/presence/spatial and layer deltas', '90-card coverage and denominators', 'campaign completion and shared seed counts'] }, sources: reports.map(({ path, sha256, report }) => ({ path, sha256, mode: report.config.mode, split: report.config.split, config: report.config, sourceHashes: report.sourceHashes, rawCount: report.rows.length, elapsedMs: report.elapsedMs })), spatialDesign: cardReport?.spatialDesign, cardOverview: cardReport?.cardOverview, comparisons, comparisonCounts, cardDetails: cardReport?.summary, growth: cardReport?.futureSummary, layers: layerReport?.layerOverview, layerDetails: layerReport?.summary, campaigns: campaignReports.map(report => ({ difficulty: report.config.difficulty, split: report.config.split, strategies: report.summary, cardCoverage: campaignCardCoverage(report) })) };
const md = [`# ${compact.gameVersion} 候选版测试结论`, '', `数据状态：${compact.validation.ready ? '已通过本次数据一致性核验' : '需要修正数据问题'}。${reports.every(entry => ['holdout', 'stress'].includes(entry.report.config.split)) ? '本组为冻结规则后的独立留出与压力测量；各难度分别报告。' : '包含校准数据，不能当作独立留出验证。'}`, '', '这份实验区分角色职能，不把辅助的零直接伤害当作弱卡。受控战斗测合法组合的潜力及技能因果贡献，完整对局测真实拿牌策略；二者不能互相替代。', '', '## 位置与规则边界', '', compact.spatialDesign ? `共有 ${compact.spatialDesign.spatial}/${compact.spatialDesign.n} 张角色有显式空间目标/条件（${percent(compact.spatialDesign.fraction)}）；${compact.spatialDesign.globalExceptions.length} 张为全场例外。内部策略引用 ${compact.spatialDesign.forbiddenStrategyReferences.length} 张。是否有空间字段只是结构检查，实际收益见单卡位置干预。` : '未提供结构检查。', '', '## 单卡比较', '', `同职责、同稀有度、同背景的预设 ±35% 实践范围：等价 ${comparisonCounts.equivalent} 项、超界 ${comparisonCounts.outside} 项、区间不足 ${comparisonCounts.insufficient} 项、参考不足 ${comparisonCounts['reference-insufficient']} 项。适配背景另有 ${comparisonCounts['potential-description']} 项，仅作潜力描述。项目数包含干扰者两个职责指标，不能解释成角色数。`, '', '等价要求校正后的完整区间落在边界内。没有显著差异不等于平衡。以下离群比较需结合专长、敌阵和成长切片解释，不能直接理解为必须削弱/加强。', '', '|角色|职责/稀有度|背景|指标|相对同层参考差|95%区间|判定|', '|---|---|---|---|---:|---|---|'];
for (const row of comparisons.filter(row => row.status === 'outside').sort((a, b) => Math.abs(b.ci95.mean) - Math.abs(a.ci95.mean)).slice(0, 24)) md.push(`|${row.name}|${roles[row.role]}/${row.rarity}|${row.background}|${row.measure}|${percent(row.ci95.mean)}|${range(row.ci95, true)}|${statuses[row.status]}|`);
md.push('', '完整 90 卡表、未触发计零、各阶段/敌阵分量保存在配套结果 JSON。参考接近零或同层少于三卡的格不作比例等价结论。');
for (const report of campaignReports) {
  md.push('', `## D${report.config.difficulty} 完整对局（${report.config.split}）`, '', '|拿牌策略|胜/局|胜率及95%区间|相对基础AI的胜率差|配对95%区间|实践等价判定|', '|---|---:|---|---:|---|---|');
  for (const row of report.summary) md.push(`|${row.name}|${row.wins}/${row.n}|${percent(row.winRate)} [${row.winRateCI95.map(percent).join(', ')}]|${percent(row.pairedBaseline.ci95.mean)}|${range(row.pairedBaseline.ci95, true)}|${row.id === 'baseline' ? '对照' : statuses[row.pairedBaseline.status]}|`);
}
if (layerReport) {
  md.push('', '## 职能与乘区实际贡献', '', '同一合法状态逐项关闭角色效果；正式羁绊逐个关闭。以下边际贡献存在交互，不可相加。已有成长价值与本回合新增培养分别报告。数值是预设场景均匀加权，不能解释成自然玩家平均。', '', '|关闭项|伤害减少及95%区间|净生命收益减少及95%区间|本回合成长减少|', '|---|---|---|---:|');
  for (const row of layerReport.layerOverview || []) md.push(`|${row.id}|${round(row.delta.damage.mean)} ${range(row.delta.damage)}|${round(-row.delta.hpLost.mean)} [${row.delta.hpLost.ci.slice().reverse().map(n => round(-n)).join(', ')}]|${round(row.delta.growth.mean)}|`);
}
if (errors.length || warnings.length) { md.push('', '## 数据核验限制', ''); for (const issue of [...new Set(errors), ...new Set(warnings)]) md.push(`- ${issue}`); }
md.push('', '## 可复现数据', '', ...reports.map(({ path, sha256, report }) => `- ${path}；${report.rows.length} 条原始观察；SHA-256 ${sha256}`), '', '方法和预声明门槛见 `docs/V070-TEST-PROTOCOL.md`。完整源文件指纹、参数、种子与检验结果保存在配套 JSON。');
await mkdir(dirname(base), { recursive: true }); await writeFile(`${base}.json.tmp`, JSON.stringify(compact) + '\n'); await rename(`${base}.json.tmp`, `${base}.json`); await writeFile(`${base}.md.tmp`, md.join('\n') + '\n'); await rename(`${base}.md.tmp`, `${base}.md`);
console.log(JSON.stringify({ output: base, ready: compact.validation.ready, errors: compact.validation.errors, warnings: compact.validation.warnings, comparisonCounts }, null, 2));
if (errors.length) process.exitCode = 1;
