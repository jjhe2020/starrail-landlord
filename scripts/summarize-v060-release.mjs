import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CHARACTERS } from '../src/content.js';
import { ARCHETYPES } from '../src/archetypes.js';
import { DEFAULT_PROFILE, POLICY_VERSION } from '../src/ai.js';
import { ARCHETYPE_BENCHMARK_VERSION, PROBE_PROTOCOL, buildArchetypeStrategies, expandArchetypeCampaign, summarizeArchetypeBenchmark } from '../src/archetype-simulation.js';

const root = new URL('../', import.meta.url);
const inputPaths = { d10: 'docs/benchmarks/archetype-v060-holdout-d10.json', d20: 'docs/benchmarks/archetype-v060-stress-d20.json' };
const sourcePaths = ['src/content.js', 'src/retirements.js', 'src/retirement-ai.js', 'src/archetypes.js', 'src/effect-rules.js', 'src/synergies.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/engine.js', 'src/ai-profile.js', 'src/ai.js', 'src/simulation.js', 'src/archetype-simulation.js', 'scripts/archetype-balance.mjs'];
const snapshotSchema = ['turn', 'power', 'damage', 'defense', 'growth', 'effectsOffPower', 'effectsOffGrowth', 'formedIds', 'phase', 'selectedIds', 'powerEffectRatio', 'growthEffect'];
const expectedStrategies = buildArchetypeStrategies();
const archetypeIds = new Set(ARCHETYPES.map(entry => entry.id));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFileSync(new URL(path, root));
const currentHashes = () => Object.fromEntries(sourcePaths.map(path => [path, sha256(read(path))]));
const sameKeys = (actual, expected, label) => assert.deepEqual(Object.keys(actual).sort(), expected.slice().sort(), label);
const finite = value => Number.isFinite(value);
const nonnegativeInteger = value => Number.isInteger(value) && value >= 0;
const percentage = value => `${(value * 100).toFixed(2).replace(/\.?0+$/, '')}%`;
const ci = values => values.map(percentage).join('–');
const roleNames = { attack: '攻击', defense: '防御', amplifier: '即时增幅', trainer: '永久培养', disruptor: '敌方干扰' };

/** Validate raw terminal campaigns and reconstruct every published statistic. */
export function validateReport(report, { difficulty, purpose }) {
  assert.equal(ARCHETYPE_BENCHMARK_VERSION, 'archetype-campaign-v4-bound-roles', 'This publisher requires the reviewed v4 protocol.');
  assert.equal(report.version, ARCHETYPE_BENCHMARK_VERSION, 'Wrong campaign protocol.');
  assert.equal(report.gameVersion, '0.6.0', 'Wrong game version.');
  assert.equal(JSON.parse(read('package.json')).version, '0.6.0');
  assert.equal(report.sourceStable, true, 'Sources changed during sampling.');
  assert.equal(report.difficulty, difficulty);
  assert.equal(report.samplePurpose, purpose);
  assert.equal(report.policyVersion, POLICY_VERSION, 'Wrong AI version.');
  assert.equal(report.lookahead, false, 'This release evidence measures fast planning only.');
  assert.equal(report.runsPerStrategy, 100);
  assert.equal(report.contentCount, 90);
  assert.equal(CHARACTERS.length, 90);
  assert.equal(typeof report.seed, 'string'); assert.ok(report.seed.length > 0);
  assert.ok(finite(report.strength) && report.strength >= 0 && report.strength <= 100);
  assert.deepEqual(report.profile, DEFAULT_PROFILE, 'The default profile must be recorded exactly.');
  assert.deepEqual(report.probeProtocol, PROBE_PROTOCOL, 'The actual canonical probe protocol must match.');
  assert.equal(report.planning?.knownFutureRewards, false);
  sameKeys(report.sourceHashes, sourcePaths, 'The complete source manifest is required.');
  for (const [path, expected] of Object.entries(report.sourceHashes)) {
    assert.match(expected, /^[a-f0-9]{64}$/u, path);
    assert.equal(sha256(read(path)), expected, `Source drift: ${path}`);
  }
  assert.deepEqual(report.archetypes, ARCHETYPES.map(({ id, name, threshold, coreRequired, memberIds, coreIds, effects }) => ({ id, name, threshold, coreRequired, memberIds, coreIds, effects })), 'The reported archetypes must equal current definitions.');
  assert.ok(Array.isArray(report.strategies) && report.strategies.length === 11);
  assert.deepEqual(report.strategies.map(row => row.id), expectedStrategies.map(row => row.id));
  assert.ok(Array.isArray(report.campaigns) && report.campaigns.length === 1100, 'Exactly 1,100 terminal campaigns are required.');
  const expectedSeeds = new Set(Array.from({ length: 100 }, (_, index) => `${report.seed}:${purpose}:combat:${index}`));
  const seen = new Set();
  for (const campaign of report.campaigns) {
    assert.ok(expectedStrategies.some(strategy => strategy.id === campaign.strategyId), 'Unknown strategy.');
    assert.ok(expectedSeeds.has(campaign.seed), 'Unknown or nonindependent seed block.');
    const key = `${campaign.strategyId}\n${campaign.seed}`;
    assert.ok(!seen.has(key), 'Duplicate strategy/seed campaign.'); seen.add(key);
    assert.ok(['victory', 'defeat'].includes(campaign.phase), 'A campaign has not reached a real terminal state.');
    assert.ok(campaign.stopped === null || campaign.stopped === undefined, 'A campaign stopped early.');
    assert.equal(campaign.won, campaign.phase === 'victory');
    assert.ok(Number.isInteger(campaign.floor) && campaign.floor >= 1 && campaign.floor <= 12);
    assert.ok(Number.isInteger(campaign.turns) && campaign.turns > 0);
    assert.ok(Number.isInteger(campaign.actions) && campaign.actions >= campaign.turns);
    for (const name of ['terminalHp', 'terminalShield', 'enemyHpRemaining', 'spinsLeft']) assert.ok(finite(campaign[name]) && campaign[name] >= 0, name);
    if (campaign.won) { assert.equal(campaign.floor, 12); assert.equal(campaign.enemyHpRemaining, 0); assert.ok(campaign.terminalHp > 0); }
    else if (campaign.defeatCause === 'hp') assert.equal(campaign.terminalHp, 0);
    else { assert.equal(campaign.defeatCause, 'deadline'); assert.equal(campaign.spinsLeft, 0); assert.ok(campaign.enemyHpRemaining > 0); }
    assert.equal(campaign.policySeed, `${campaign.seed}:actions`);
    assert.deepEqual(campaign.snapshotSchema, snapshotSchema);
    assert.equal(campaign.snapshots.length, campaign.turns + 1, 'Every actual turn and terminal observation must be retained.');
    campaign.snapshots.forEach((snapshot, index) => {
      assert.ok(Array.isArray(snapshot) && snapshot.length === snapshotSchema.length);
      assert.equal(snapshot[0], index, 'Turns must be contiguous and unique.');
      for (const position of [1, 2, 3, 4, 5, 6, 10, 11]) assert.ok(snapshot[position] === null || finite(snapshot[position]), 'Nonfinite probe value.');
      assert.ok(['ready', 'victory', 'defeat'].includes(snapshot[8]));
      for (const position of [7, 9]) assert.ok(Array.isArray(snapshot[position]) && snapshot[position].every(id => archetypeIds.has(id)));
    });
    assert.equal(campaign.snapshots.at(-1)[8], campaign.phase);
    assert.ok(campaign.picks && typeof campaign.picks === 'object' && !Array.isArray(campaign.picks));
    assert.ok(Object.values(campaign.picks).every(nonnegativeInteger));
    for (const field of ['firstFormed', 'firstPlannedFormed']) {
      assert.ok(campaign[field] && typeof campaign[field] === 'object');
      for (const [id, turn] of Object.entries(campaign[field])) assert.ok(archetypeIds.has(id) && nonnegativeInteger(turn) && turn <= campaign.turns);
    }
  }
  for (const strategy of expectedStrategies) {
    const campaigns = report.campaigns.filter(row => row.strategyId === strategy.id);
    assert.equal(campaigns.length, 100);
    assert.deepEqual(new Set(campaigns.map(row => row.seed)), expectedSeeds, 'Each strategy must use the same 100 seed blocks.');
    const row = report.strategies.find(row => row.id === strategy.id);
    assert.equal(row.n, 100); assert.equal(row.completed, 100); assert.equal(row.winRateDenominator, 100); assert.equal(row.incomplete, 0);
    assert.equal(row.wins + row.losses, 100);
  }
  const expanded = report.campaigns.map(expandArchetypeCampaign);
  const rebuilt = summarizeArchetypeBenchmark(expanded, expectedStrategies);
  assert.deepEqual(report.strategies, rebuilt.strategies, 'Strategy statistics do not match compact raw campaigns.');
  assert.deepEqual(report.baselineByTurn, rebuilt.baselineByTurn, 'Baseline time series does not match raw campaigns.');
  assert.deepEqual(report.interpretation, rebuilt.interpretation, 'Protocol interpretation changed.');
  return { pairedSeeds: expectedSeeds, terminalCampaigns: report.campaigns.length, incomplete: 0, rebuiltStrategySummaries: rebuilt.strategies.length };
}

export function compactReference(report, reportPath) {
  const { campaigns, baselineByTurn, archetypes, strategies, ...metadata } = report;
  return { ...metadata, reportPath, strategies: strategies.map(({ byTurn, ...row }) => row) };
}

function recruitmentCoverage(report) {
  const counts = new Map(CHARACTERS.map(character => [character.id, 0]));
  for (const campaign of report.campaigns) for (const [id, count] of Object.entries(campaign.picks)) if (counts.has(id)) counts.set(id, counts.get(id) + count);
  const cards = CHARACTERS.map(character => ({ id: character.id, name: character.name, role: character.role, picks: counts.get(character.id) }));
  return { terminalCampaigns: report.campaigns.length, pairedSeedBlocks: 100, recruitedCardIds: cards.filter(card => card.picks > 0).length, totalCharacterPicks: cards.reduce((total, card) => total + card.picks, 0),
    roles: Object.keys(roleNames).map(role => ({ role, name: roleNames[role], distinctCardIds: cards.filter(card => card.role === role && card.picks > 0).length, totalCardIds: cards.filter(card => card.role === role).length, picks: cards.filter(card => card.role === role).reduce((total, card) => total + card.picks, 0) })),
    zeroPickCards: cards.filter(card => card.picks === 0), cards };
}

function campaignSection(d10, d20, coverage, provenance) {
  const baseline = d10.strategies.find(row => row.kind === 'baseline');
  const targetPassed = baseline.winRate >= .9 && baseline.winRate <= .98;
  const targetReason = targetPassed ? '点估计达到本轮90%–98%目标' : `${baseline.winRate < .9 ? '低于' : '高于'}本轮90%–98%目标，点估计未达标`;
  const rows = d10.strategies.map(row => {
    const pressure = d20.strategies.find(entry => entry.id === row.id);
    return `| ${row.name} | ${row.wins}/100 | ${ci(row.winRateCI95)} | ${row.formation.formed}/100 | ${pressure.wins}/100 | ${ci(pressure.winRateCI95)} | ${pressure.formation.formed}/100 |`;
  });
  const roleRows = Object.keys(roleNames).map(role => {
    const a = coverage.d10.roles.find(row => row.role === role), b = coverage.d20.roles.find(row => row.role === role);
    return `| ${roleNames[role]} | ${a.picks} | ${a.distinctCardIds}/${a.totalCardIds} | ${b.picks} | ${b.distinctCardIds}/${b.totalCardIds} |`;
  });
  const failures = report => ({ hp: report.strategies.reduce((sum, row) => sum + row.failureCauses.hp, 0), deadline: report.strategies.reduce((sum, row) => sum + row.failureCauses.deadline, 0), other: report.strategies.reduce((sum, row) => sum + row.failureCauses.other, 0) });
  const a = failures(d10), b = failures(d20);
  const rulesChecks = report => report.strategies.filter(row => row.kind !== 'baseline' && row.checks?.passesRulesRegression).length;
  const zero = item => item.zeroPickCards.length ? item.zeroPickCards.map(card => card.name).join('、') : '无';
  return `## 完整对局评测\n\n冻结0.6规则后，D10与D20各运行11种策略×100局，共2200局，全部到达真实胜利或失败终局，0未完成。每个难度内11种策略使用相同的100个配对种子块，**每难度是100个种子块，不是1100个独立种子**；D10与D20种子块不重叠。基线、八个定向套路和同时筹备2/3套路均保留，未成型与提前失败均进入各自策略的100局分母。\n\n本批使用策略 \`${d10.policyVersion}\`、协议 \`${d10.version}\`、难度规则 \`difficulty-v7-bound-roles\`；公开规划、默认模型、lookahead=false（不做页面默认的4棋盘前瞻）。这些成绩仅适用于本次快速规划策略和配置，不能称为完整页面默认AI或真人胜率。\n\nD10无偏好基线为 **${baseline.wins}/100（${percentage(baseline.winRate)}，Wilson 95%：${ci(baseline.winRateCI95)}）**：${targetReason}。目标仅判断点估计，不要求整个区间落在目标带。D20单独作为压力观察，不设置通过胜率，不以较高或较低胜率直接宣称路线均衡。\n\n| 策略 | D10胜/100 | D10 Wilson 95% | D10成型 | D20胜/100 | D20 Wilson 95% | D20成型 |\n| --- | ---: | --- | ---: | ---: | --- | ---: |\n${rows.join('\n')}\n\n成型口径：基线统计任一套路成型，单方向统计目标套路，2/3方向策略统计其计划中的成型路线；不同策略的成型数含义不同。成型后样本是被选择出的子集，成型前后关联不能当作通关因果。固定敌阵的同状态关闭套路对照只衡量即时规则贡献，不能代替胜率消融；失败与未成型样本保留在整局结果中。\n\n两档全部策略合计，D10失败原因：生命耗尽${a.hp}、期限${a.deadline}、其他${a.other}；D20：生命耗尽${b.hp}、期限${b.deadline}、其他${b.other}。规则边界检查（未完成为零、同状态贡献不负、无套路自动永久成长）D10为${rulesChecks(d10)}/10个非基线策略通过，D20为${rulesChecks(d20)}/10；该检查不是“所有路线等强”验收，原始检查和小样本区间原样保留。\n\n### 招募获得次数覆盖\n\n从逐局 \`picks\` 统计实际选择角色奖励的次数：D10共${coverage.d10.totalCharacterPicks}次，覆盖${coverage.d10.recruitedCardIds}/90张卡；D20共${coverage.d20.totalCharacterPicks}次，覆盖${coverage.d20.recruitedCardIds}/90张卡。这是各策略选择的获得次数，会重复计算同卡和配对种子下的不同策略；**不是独立持有局数、出场数、终局持有率或候选曝光数**。初始编队、临时召唤及剧情见习未计为招募选择。\n\n| 主职 | D10获得次数 | D10有获得记录卡数 | D20获得次数 | D20有获得记录卡数 |\n| --- | ---: | ---: | ---: | ---: |\n${roleRows.join('\n')}\n\nD10零招募记录角色：${zero(coverage.d10)}。D20零招募记录角色：${zero(coverage.d20)}。低频或零记录不能直接证明卡无用，角色强弱和自然构筑覆盖需另做逐卡实验。90卡逐项次数随嵌入参考数据的 \`recruitmentCoverage.cards\` 保存，可按难度复核。\n\n[完整D10报告](benchmarks/archetype-v060-holdout-d10.json)、[完整D20报告](benchmarks/archetype-v060-stress-d20.json)保留全部2200局及逐转样本。发布汇总脚本严格核对v4协议、全部14个当前生产/模拟源SHA、11种策略各100配对种子和1100个真实终局，并从压缩逐转字段重建两份全部策略摘要与基线曲线后才生成参考数据。输入报告SHA-256分别为 \`${provenance.d10.sha256}\`、\`${provenance.d20.sha256}\`；采样前后源码摘要一致。0.5历史报告不用于本版结论。\n`;
}

export function summarizeV060Release({ checkOnly = false } = {}) {
  const bytes = { d10: read(inputPaths.d10), d20: read(inputPaths.d20) };
  const reports = Object.fromEntries(Object.entries(bytes).map(([key, value]) => [key, JSON.parse(value)]));
  const validation = { d10: validateReport(reports.d10, { difficulty: 10, purpose: 'holdout' }), d20: validateReport(reports.d20, { difficulty: 20, purpose: 'stress' }) };
  assert.deepEqual(reports.d10.sourceHashes, reports.d20.sourceHashes, 'The two difficulties must use the same frozen sources.');
  assert.deepEqual(reports.d10.profile, reports.d20.profile);
  assert.equal(reports.d10.strength, reports.d20.strength);
  assert.ok([...validation.d10.pairedSeeds].every(seed => !validation.d20.pairedSeeds.has(seed)), 'Holdout and stress seed blocks overlap.');
  const provenance = Object.fromEntries(Object.entries(bytes).map(([key, value]) => [key, { path: inputPaths[key], sha256: sha256(value), bytes: value.length }]));
  const coverage = { d10: recruitmentCoverage(reports.d10), d20: recruitmentCoverage(reports.d20) };
  const d10 = compactReference(reports.d10, inputPaths.d10), stress = compactReference(reports.d20, inputPaths.d20);
  d10.recruitmentCoverage = coverage.d10; stress.recruitmentCoverage = coverage.d20;
  const reference = { ...d10, stress, releaseAggregation: { script: 'scripts/summarize-v060-release.mjs', scriptSha256: sha256(read('scripts/summarize-v060-release.mjs')), inputs: provenance, rebuiltStrategySummaries: 22, pairedSeedBlocksPerDifficulty: 100, terminalCampaignsPerDifficulty: 1100, incomplete: 0, d10BaselineTarget: { min: .9, max: .98, pointEstimatePassed: reports.d10.strategies[0].winRate >= .9 && reports.d10.strategies[0].winRate <= .98 } } };
  const documentPath = 'docs/V060-BALANCE.md', document = read(documentPath).toString('utf8'), heading = '## 完整对局评测';
  assert.ok(document.includes(heading), 'Preserve the existing mechanism/calibration sections; the campaign heading is required.');
  const updatedDocument = document.slice(0, document.indexOf(heading)) + campaignSection(reports.d10, reports.d20, coverage, provenance);
  const code = `// Current v0.6 independent holdout and stress evidence; generated only from validated complete reports.\nexport const ARCHETYPE_REFERENCE = Object.freeze(${JSON.stringify(reference, null, 2)});\n`;
  // Validate all inputs and recheck frozen sources before either output changes.
  assert.deepEqual(currentHashes(), reports.d10.sourceHashes);
  for (const [key, path] of Object.entries(inputPaths)) assert.equal(sha256(read(path)), provenance[key].sha256, 'An input report changed during aggregation.');
  if (!checkOnly) {
    const outputs = [['src/archetype-reference.js', code], [documentPath, updatedDocument]];
    const temporary = outputs.map(([path]) => new URL(`${path}.tmp-${process.pid}`, root));
    try {
      outputs.forEach(([, value], index) => writeFileSync(temporary[index], value));
      outputs.forEach(([path], index) => renameSync(temporary[index], new URL(path, root)));
    } finally { temporary.forEach(path => { if (existsSync(path)) unlinkSync(path); }); }
  }
  return { checkOnly, sourceStable: true, protocol: ARCHETYPE_BENCHMARK_VERSION, terminalCampaigns: 2200, independentPairedSeedBlocks: 200, summariesRebuilt: 22, referenceBytes: Buffer.byteLength(code), cardCoverage: { d10: coverage.d10.recruitedCardIds, d20: coverage.d20.recruitedCardIds }, d10BaselineTarget: reference.releaseAggregation.d10BaselineTarget };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert.ok(process.argv.slice(2).every(value => value === '--check-only') && process.argv.slice(2).length <= 1, 'Usage: node scripts/summarize-v060-release.mjs [--check-only]');
  console.log(JSON.stringify(summarizeV060Release({ checkOnly: process.argv.includes('--check-only') })));
}
