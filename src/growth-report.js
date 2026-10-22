import { CHARACTERS } from './content.js';
import { ARCHETYPES } from './archetypes.js';
import { RETIREMENT_RULES } from './retirements.js';
import { matchesEffectFilter } from './effect-rules.js';
import { wilsonInterval } from './simulation.js';

export const GROWTH_REPORT_VERSION = 'card-growth-report-v1';
export const BOOTSTRAP_RESAMPLES = 500;
export const GROWTH_PRECISION = Object.freeze({ minimumCampaigns: 100, outcomeMinimumCampaigns: 30, relativeHalfWidth: 0.2, nearZeroMean: 0.5, absoluteHalfWidth: 0.1 });
const WINDOW_NAMES = ['terminal', 'final12', 'early', 'mid', 'late'];
const finite = value => typeof value === 'number' && Number.isFinite(value);
const rounded = value => finite(value) ? Math.round(value * 1e6) / 1e6 : null;
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const ratio = (numerator, denominator) => finite(numerator) && finite(denominator) && denominator > 0 ? numerator / denominator : null;
const defaultCards = () => CHARACTERS.map(({ id, name, rarity, role, attack, baseAttack, power, path, description }) => ({ id, name, rarity, role, attack, baseAttack:baseAttack ?? power, basePower:baseAttack ?? power, path, description }));

function randomFor(key) {
  let state = 2166136261;
  for (const char of key) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  state = (state >>> 0) || 1;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state = (state >>> 0) || 1; return state / 4294967296; };
}

function quantile(sorted, probability) {
  const index = (sorted.length - 1) * probability, lower = Math.floor(index), fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[Math.ceil(index)] * fraction;
}

/** Observations are already one normalized value per independent campaign. */
function metric(input, key, bootstrap = false) {
  const values = input.filter(finite), n = values.length, center = mean(values);
  let ci95 = [null, null];
  if (n > 1 && values.every(value => value === values[0])) ci95 = [rounded(center), rounded(center)];
  else if (bootstrap && n > 1) {
    const random = randomFor(key), samples = [];
    for (let sample = 0; sample < BOOTSTRAP_RESAMPLES; sample++) {
      let sum = 0;
      for (let index = 0; index < n; index++) sum += values[Math.floor(random() * n)];
      samples.push(sum / n);
    }
    samples.sort((a, b) => a - b);
    ci95 = [rounded(quantile(samples, 0.025)), rounded(quantile(samples, 0.975))];
  }
  return { n, mean: rounded(center), ci95 };
}

function precision(value, minN = GROWTH_PRECISION.minimumCampaigns) {
  const available = value.ci95.every(finite), halfWidth = available ? (value.ci95[1] - value.ci95[0]) / 2 : null;
  const relativeHalfWidth = available && value.mean !== 0 ? halfWidth / Math.abs(value.mean) : null;
  const nearZero = finite(value.mean) && Math.abs(value.mean) < GROWTH_PRECISION.nearZeroMean;
  const enough = value.n >= minN;
  const widthPassed = available && (nearZero ? halfWidth <= GROWTH_PRECISION.absoluteHalfWidth : relativeHalfWidth <= GROWTH_PRECISION.relativeHalfWidth);
  return { n: value.n, minimumCampaigns: minN, enoughCampaigns: enough, halfWidth: rounded(halfWidth), relativeHalfWidth: rounded(relativeHalfWidth), criterion: nearZero ? 'absolute-half-width' : 'relative-half-width', precise: enough && widthPassed, status: !enough ? 'insufficient-campaigns' : !available ? 'interval-unavailable' : widthPassed ? 'precision-target-met' : 'wide-interval' };
}

function observation(row) {
  if (!row) return null;
  const damage = finite(row.normalDamage) && finite(row.skillDamage) ? row.normalDamage + row.skillDamage : null;
  return {
    powerPerAppearance: ratio(row.power, row.appearances),
    damagePerAppearance: ratio(damage, row.appearances),
    damagePerInstanceTurn: ratio(damage, row.instanceTurns),
    normalDamagePerAppearance: ratio(row.normalDamage, row.appearances),
    skillDamagePerAppearance: ratio(row.skillDamage, row.appearances),
    growthPerAppearance: ratio(row.growthReceived, row.appearances),
    growthPerInstanceTurn: ratio(row.growthReceived, row.instanceTurns),
    healingPerAppearance: ratio(row.healing, row.appearances),
    shieldPerAppearance: ratio(row.shield, row.appearances),
    buffPerAppearance: ratio(row.buff, row.appearances),
    appearanceRate: ratio(row.appearances, row.instanceTurns),
    heldTurns: row.heldTurns, instanceTurns: row.instanceTurns, appearances: row.appearances,
  };
}

const OBSERVATION_METRICS = Object.keys(observation({}));
const RAW_OBSERVATION_KEYS = ['heldTurns', 'instanceTurns', 'appearances', 'power', 'normalDamage', 'skillDamage', 'growthReceived', 'healing', 'shield', 'buff'];
function lifetimeObservation(card) {
  const stages = ['early', 'mid', 'late'].map(name => card.windows?.[name]).filter(Boolean);
  if (!stages.length) return null;
  return Object.fromEntries(RAW_OBSERVATION_KEYS.map(key => [key, stages.reduce((sum, row) => sum + (finite(row[key]) ? row[key] : 0), 0)]));
}

function summarizeObservations(rows, key) {
  const observations = rows.map(observation).filter(Boolean);
  const summary = { n: observations.length };
  for (const name of OBSERVATION_METRICS) summary[name] = metric(observations.map(row => row[name]), `${key}:${name}`, ['damagePerAppearance', 'growthPerAppearance'].includes(name));
  summary.precision = precision(summary.damagePerAppearance);
  return summary;
}

function summarizeCardObservations(campaigns, id, key, minimumCampaigns = GROWTH_PRECISION.minimumCampaigns) {
  const rows = campaigns.map(campaign => campaign.cards?.find(card => card.id === id)).filter(Boolean);
  const held = rows.filter(card => card.endCount > 0);
  const endGrowth = metric(held.map(card => card.endGrowth), `${key}:endGrowth`, true);
  const probe = summarizeObservations(held.map(card => card.probe).filter(Boolean), `${key}:probe`);
  const noGrowthProbe = summarizeObservations(held.map(card => card.noGrowthProbe).filter(Boolean), `${key}:noGrowthProbe`);
  const paired = held.map(card => {
    const full = observation(card.probe), without = observation(card.noGrowthProbe);
    if (!full || !without) return null;
    return Object.fromEntries(['damagePerAppearance', 'damagePerInstanceTurn', 'powerPerAppearance'].map(name => [name, finite(full[name]) && finite(without[name]) ? full[name] - without[name] : null]));
  }).filter(Boolean);
  const growthDelta = Object.fromEntries(['damagePerAppearance', 'damagePerInstanceTurn', 'powerPerAppearance'].map(name => [name, metric(paired.map(row => row[name]), `${key}:growthDelta:${name}`, name === 'damagePerAppearance')]));
  const result = { campaigns: campaigns.length, everHeld: rows.length, offered: campaigns.filter(campaign => campaign.offered?.includes(id)).length, endHeld: held.length,
    endCount: metric(held.map(card => card.endCount), `${key}:endCount`), endGrowth,
    endStars: metric(held.map(card => card.endStars), `${key}:endStars`), endTicks: metric(held.map(card => card.endTicks), `${key}:endTicks`),
    probe, noGrowthProbe, growthDelta,
    lifetime: summarizeObservations(rows.map(lifetimeObservation).filter(Boolean), `${key}:lifetime`),
    ...Object.fromEntries(WINDOW_NAMES.map(name => [name, summarizeObservations(rows.map(card => card.windows?.[name]).filter(Boolean), `${key}:${name}`)])),
    precision: { damagePerAppearance: precision(probe.damagePerAppearance, minimumCampaigns), endGrowth: precision(endGrowth, minimumCampaigns) },
  };
  result.allDirectDamageZero = probe.damagePerAppearance.n > 0 && probe.damagePerAppearance.mean === 0;
  return result;
}

function binomial(count, n) { return { n, count, rate: n ? rounded(count / n) : null, ci95: n ? wilsonInterval(count, n).map(rounded) : [null, null] }; }

function temporaryOrCommissionDamage(campaign) {
  if (!finite(campaign.allDamage) || !finite(campaign.sharedDamage)) return null;
  const permanentDamage = (campaign.cards || []).reduce((total, card) => total + ['early', 'mid', 'late'].reduce((subtotal, name) => {
    const row = card.windows?.[name];
    return subtotal + (finite(row?.normalDamage) ? row.normalDamage : 0) + (finite(row?.skillDamage) ? row.skillDamage : 0);
  }, 0), 0);
  const residual = campaign.allDamage - campaign.sharedDamage - permanentDamage;
  if (residual < -0.021) throw new Error(`Campaign damage components exceed total damage: ${campaign.seed}`);
  return Math.max(0, rounded(residual));
}

/** A static audit of potential permanent-growth routes, not sampled attribution. */
export function classifyGrowthMechanisms(definitions = CHARACTERS) {
  return definitions.map(definition => {
    const character = CHARACTERS.find(card => card.id === definition.id), sources = [];
    if (!character) return { id: definition.id, name: definition.name, sources, hasIntrinsicGrowth: false, hasExternalGrowth: false, summary: '无已识别永久成长来源' };
    const target = { id: character.id, uid: `target:${character.id}`, stars: 1, growth: 0, ticks: 0 };
    for (const source of CHARACTERS) for (const effect of source.effects || []) {
      if (!['growth','attackGrowth'].includes(effect.type) || effect.legacy && !['1002', '1107', '1205'].includes(source.id)) continue;
      const sourceUnit = source.id === character.id ? target : { id: source.id, uid: `source:${source.id}`, stars: 1 };
      const scope = effect.target || 'self';
      if (scope === 'self' && source.id !== character.id || scope === 'adjacent' && source.id === character.id) continue;
      if (!matchesEffectFilter(target, effect.filter, sourceUnit)) continue;
      const self = source.id === character.id;
      sources.push({ kind: self ? 'intrinsic' : 'external-character', sourceId: source.id, sourceName: source.name, trigger: effect.trigger, target: scope, value: effect.value, every: effect.every || 1, legacy: Boolean(effect.legacy), description: effect.summary,
        label: self ? `自身：${effect.summary}` : `${source.name}：${effect.summary}` });
    }
    for (const rule of RETIREMENT_RULES.filter(rule => rule.sourceId === character.id && (rule.attackGrowth ?? rule.growth ?? 0) > 0)) sources.push({ kind: 'commission', sourceId: rule.id, sourceName: rule.name, targetId: rule.targetId, every: rule.every, value: rule.attackGrowth ?? rule.growth, description: '主持者满足相邻委派与保护规则时获得永久攻击力固定加值（仅本局）', label: `委派主持：${rule.name}（攻击力永久+${rule.attackGrowth ?? rule.growth}）` });
    for (const archetype of ARCHETYPES) for (const effect of archetype.effects) {
      if (!['growth','attackGrowth'].includes(effect.type) || !archetype.memberIds.includes(character.id) || !matchesEffectFilter(target, effect.filter)) continue;
      sources.push({ kind: 'archetype', sourceId: archetype.id, sourceName: archetype.name, value: effect.value, description: effect.summary, label: `成型套路：${archetype.name}（登场+${effect.value}）` });
    }
    return { id: character.id, name: character.name, sources, hasIntrinsicGrowth: sources.some(source => source.kind === 'intrinsic'), hasExternalGrowth: sources.some(source => source.kind !== 'intrinsic'), summary: sources.length ? sources.map(source => source.label).join('；') : '无已识别永久成长来源' };
  });
}

function strategyName(id) {
  if (id.startsWith('card:')) return `定向覆盖：${CHARACTERS.find(card => card.id === id.slice(5))?.name || id.slice(5)}`;
  if (id === 'baseline') return '无套路偏好 AI';
  if (id === 'adaptive:2') return '同时准备 2 套路';
  if (id === 'adaptive:3') return '同时准备 3 套路';
  if (id.startsWith('focus:')) return ARCHETYPES.find(archetype => archetype.id === id.slice(6))?.name || id;
  if (id.startsWith('coverage:')) return `${CHARACTERS.find(card => card.id === id.slice(9))?.name || id.slice(9)}覆盖偏好`;
  return id;
}

function summarizeStrategies(campaigns) {
  return [...new Set(campaigns.map(campaign => campaign.strategyId))].sort().map(id => {
    const rows = campaigns.filter(campaign => campaign.strategyId === id), completed = rows.filter(campaign => !campaign.stopped && ['victory', 'defeat'].includes(campaign.phase));
    const wins = completed.filter(campaign => campaign.phase === 'victory').length, defeats = completed.length - wins;
    const target = id.startsWith('focus:') ? id.slice(6) : null;
    return { id, name: strategyName(id), kind: rows[0]?.strategyKind, targetId: rows[0]?.targetId || null, n: rows.length, completed: completed.length, incomplete: rows.length - completed.length, wins, defeats,
      winRate: binomial(wins, completed.length), reached12: binomial(completed.filter(campaign => campaign.floor >= 12).length, completed.length),
      anyFinalFormation: binomial(completed.filter(campaign => campaign.finalFormed?.length > 0).length, completed.length),
      targetFinalFormation: target ? binomial(completed.filter(campaign => campaign.finalFormed?.includes(target)).length, completed.length) : null,
      meanFinalFormationCount: metric(completed.map(campaign => campaign.finalFormed?.length || 0), `${id}:formations`),
      formations: ARCHETYPES.map(archetype => ({ id: archetype.id, name: archetype.name, ...binomial(completed.filter(campaign => campaign.finalFormed?.includes(archetype.id)).length, completed.length) })),
      floor: metric(completed.map(campaign => campaign.floor), `${id}:floor`), turns: metric(completed.map(campaign => campaign.turns), `${id}:turns`),
      defeatCauses: { hp: completed.filter(campaign => campaign.defeatCause === 'hp').length, deadline: completed.filter(campaign => campaign.defeatCause === 'deadline').length },
    };
  });
}

/** Natural and coverage cohorts are intentionally never pooled. */
export function summarizeGrowthCampaigns(campaigns, metadata = {}) {
  if (!Array.isArray(campaigns)) throw new Error('Campaigns must be an array.');
  const seeds = new Set();
  for (const campaign of campaigns) {
    if (typeof campaign.seed !== 'string' || !campaign.seed) throw new Error('Every campaign requires an independent, nonempty seed.');
    if (seeds.has(campaign.seed)) throw new Error(`Duplicate campaign seed: ${campaign.seed}`);
    seeds.add(campaign.seed);
    const ids = (campaign.cards || []).map(card => card.id);
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate card row in campaign ${campaign.seed}`);
  }
  const definitions = Array.isArray(metadata) ? metadata : metadata.cards || defaultCards();
  if (new Set(definitions.map(card => card.id)).size !== definitions.length) throw new Error('Card metadata IDs must be unique.');
  const growthMechanisms = new Map(classifyGrowthMechanisms(definitions).map(card => [card.id, card]));
  const rows = campaigns.slice().sort((a, b) => a.seed.localeCompare(b.seed, 'en'));
  const groupKeys = [...new Set(rows.map(campaign => `${campaign.difficulty}:${campaign.strategyKind === 'coverage' ? 'coverage' : 'natural'}`))].sort((a, b) => Number(a.split(':')[0]) - Number(b.split(':')[0]) || a.localeCompare(b, 'en'));
  const groups = groupKeys.map(key => {
    const [difficulty, cohort] = key.split(':'), enrolled = rows.filter(campaign => campaign.difficulty === Number(difficulty) && (campaign.strategyKind === 'coverage' ? 'coverage' : 'natural') === cohort);
    const completed = enrolled.filter(campaign => !campaign.stopped && ['victory', 'defeat'].includes(campaign.phase));
    const victory = completed.filter(campaign => campaign.phase === 'victory'), defeat = completed.filter(campaign => campaign.phase === 'defeat');
    return { difficulty: Number(difficulty), cohort, n: enrolled.length, independentSeeds: enrolled.length, completed: completed.length, incomplete: enrolled.length - completed.length, wins: victory.length, defeats: defeat.length,
      winRate: binomial(victory.length, completed.length), reached12: binomial(completed.filter(campaign => campaign.floor >= 12).length, completed.length),
      strategies: summarizeStrategies(enrolled),
      sharedDamage: metric(completed.map(campaign => campaign.sharedDamage), `${key}:sharedDamage`), allDamage: metric(completed.map(campaign => campaign.allDamage), `${key}:allDamage`),
      temporaryOrCommissionDamage: metric(completed.map(temporaryOrCommissionDamage), `${key}:temporaryOrCommissionDamage`),
      cards: definitions.map(definition => {
        const card = { ...definition, growthSources: growthMechanisms.get(definition.id), ...summarizeCardObservations(completed, definition.id, `${key}:${definition.id}`),
          censoredEverHeld: enrolled.filter(campaign => !completed.includes(campaign) && campaign.cards?.some(row => row.id === definition.id)).length,
          outcomes: { victory: summarizeCardObservations(victory, definition.id, `${key}:${definition.id}:victory`, GROWTH_PRECISION.outcomeMinimumCampaigns), defeat: summarizeCardObservations(defeat, definition.id, `${key}:${definition.id}:defeat`, GROWTH_PRECISION.outcomeMinimumCampaigns) } };
        card.roleCaution = definition.attack === 'support' || definition.role && definition.role !== 'attack' || card.allDirectDamageZero ? '辅助或零直接伤害：须同时查看治疗、护盾、增益与团队表现，不能按直接伤害判定强弱。' : null;
        return card;
      }),
    };
  });
  return { version: GROWTH_REPORT_VERSION, metadata: Array.isArray(metadata) ? {} : Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== 'cards')), method: { bootstrapResamples: BOOTSTRAP_RESAMPLES, confidence: 0.95, bootstrap: 'deterministic-campaign-percentile', statisticalUnit: 'independent-campaign', normalization: 'within-campaign-first', terminalOnly: true, precision: GROWTH_PRECISION }, n: campaigns.length, independentSeeds: seeds.size, groups };
}

const escapeCell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const number = value => finite(value) ? value.toFixed(2) : '—';
const valueCell = value => value?.n ? `${number(value.mean)}（n=${value.n}）` : '—（n=0）';
const intervalCell = value => value?.n ? `${number(value.mean)} [${value.ci95.map(number).join(', ')}]；n=${value.n}` : '—；n=0';
const rateCell = value => value?.n ? `${value.count}/${value.n}；${number(value.rate * 100)}% [${value.ci95.map(rate => number(rate * 100)).join(', ')}]%` : '—；n=0';
function markdownTable(headers, rows) { return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`)].join('\n'); }

export function renderGrowthMarkdown(report) {
  const lines = [`# ${report.metadata?.measuredVersion || '未标版本'} 卡牌成长诊断`, '', `共 ${report.n} 场，${report.independentSeeds} 个独立战役种子。以下统计描述冻结规则与本轮 AI 策略下的表现，不是卡牌独立因果强度排名。`, '',
    '## 统计方法与解释边界', '',
    '- 终局按正常十二关的一局结束定义，不进入无尽模式；这些是有限流程下的成长结果，不是无限回合的理论上限。',
    '- 伤害账本只累计转动内的结算；永不停嘴的羊皮卷等入关奇物伤害不在此账本中。当前角色没有入关伤害技能，单卡输出口径不受影响。',
    '- 每张卡每局先求每登场、每持有实例转的平均值，再跨独立战役求平均。副本数、探针棋盘数、战斗转数不作为独立样本；持有但没有登场的转会进入每持有实例转分母。',
    '- 丹恒等初始 5 张卡与后期招募卡的培养时长不同，平均终局属性是实际招募与培养路径的结果，不能直接视为成长速度或同龄卡的公平因果比较。全程实战成长率先在每局内累加早/中/晚三个不重叠窗口的原始新增成长、登场数与持有实例转数，再分别相除，最后跨局平均；不会直接平均三个阶段的已归一化成长率。',
    '- 单卡均值只统计正式永久实例，临时援军与委派见习不计入同名卡均值，也不把其伤害回算给召唤者。全队转动内实伤包含这些实例；临时/见习伤害按“全队转动内实伤−公共来源直接伤害−全部正式卡早中晚窗口直接伤害”逐局对账后单列。',
    '- 普通攻击与该角色来源的技能伤害合并为卡牌直接伤害，只计 sourceType=character 的真实伤害记录。角色自身攻击已享受队友、套路、奇物等对威力的增益，因此该数字不是角色对全队的独立因果贡献。奇物、羁绊、套路等公共来源直接追加伤害在转动内 sharedDamage / allDamage 中单列，不随意分摊给某张卡。',
    '- 治疗、护盾、提供给他人的平铺威力另列，不折算为伤害。buff 字段只覆盖平加威力，未涵盖倍率增益、减伤、经济、召援等全部辅助价值；不能据此给辅助卡作完整强弱排名。',
    '- 终局探针保留真实编队、星级、成长与道具，用固定五列高血敌人、半血零盾、无敌方条款和超频进行配对测试。去既有成长探针把全队本次测试前的 growth 清零；该次探针仍能新增长期成长。差值表示这组状态下既有成长的即时效果，包含全队成长交互，不是某张卡单独成长的因果贡献。清零会改变辅助技能最强者等目标选择，个别单卡差值可呈微小负数，不能将其解释为永久成长削弱该卡。',
    '- 真实终止遭遇是每局最后一个遭遇中的全部实际转数；第 12 层只包含到达且实际持有该卡的战役。早/中/晚期分别为第 1–4 / 5–8 / 9–12 层。真实伤害受到剩余敌血、出手顺序与过量伤害截断影响。',
    '- 五列高血探针不触发正常击杀，会低估希儿、波提欧、不死途及击破套路等依赖击杀的效果；这些角色与路线必须结合真实战斗窗口和整局胜败解释。',
    '- 成长来源列是当前规则的静态机制清单，不是本批样本发生过的事件归因；“自身”表示自身技能可产生永久 growth，“委派主持/成型套路/队友”都依赖条件与构筑。昔涟的群体成长可覆盖自身与其他记忆角色。升星、当轮平加与倍率也能提高输出，但不混入永久 growth 来源。',
    '- 胜败与第 12 层到达率均剔除动作上限等未完成局，未完成数单列；未完成局不算正常失败，也不进入终局卡牌指标。未到第 12 层的卡牌观测不补造第 12 层输出；到达率与各窗口 n 用于显示幸存者偏差。',
    '- 关键均值区间是按独立战役确定性重采样 500 次的 percentile 95% 区间。主表至少 100 局且相对半宽不超过 20% 才满足精度目标；均值绝对值小于 0.5 时改用绝对半宽 ≤0.1。胜败子组少于 30 局标为不足。零输出可有 [0,0] 区间，但不能据此判辅助卡强弱。90 张卡的区间是逐卡区间，未做多重比较校正，不能将细微名次差宣称为显著。',
    '- 自然构筑与覆盖补测、不同难度分别展示；覆盖补测只调整公开奖励的目标卡偏好，不能当作自然构筑的抽取率或构筑强度。各策略构成是实验配额，不代表真实玩家流行度。', ''];
  for (const group of report.groups) {
    lines.push(`## D${group.difficulty} · ${group.cohort === 'coverage' ? '覆盖补测' : '自然构筑'}`, '',
      `入组 ${group.n} 场；正常完成 ${group.completed} 场，胜 ${group.wins} / 败 ${group.defeats}，未完成 ${group.incomplete} 场；第 12 层到达 ${group.reached12.count}/${group.reached12.n}。公共来源伤害每局平均 ${number(group.sharedDamage.mean)}，临时援军/委派见习伤害每局平均 ${number(group.temporaryOrCommissionDamage.mean)}，全队转动内实伤每局平均 ${number(group.allDamage.mean)}。`, '',
      '### 套路策略', '', markdownTable(['策略', '正常 / 入组', '胜 / 败', '胜率及 Wilson 95%', '第12层到达率及 Wilson 95%', '终局任一成型', '目标套路终局成型', '终局平均成型数'], group.strategies.map(strategy => [strategy.name, `${strategy.completed}/${strategy.n}`, `${strategy.wins}/${strategy.defeats}`, rateCell(strategy.winRate), rateCell(strategy.reached12), rateCell(strategy.anyFinalFormation), strategy.targetFinalFormation ? rateCell(strategy.targetFinalFormation) : '不设固定套路', valueCell(strategy.meanFinalFormationCount)])), '',
      '### 全卡终局探针与成长', '', '表内 n 均为实际进入该指标的独立战役数。无观测用“—”，不会用 0 假装缺失数据。威力是最终卡面威力，伤害是普通攻击加角色自身技能；两者单位不同。', '',
      markdownTable(['角色', '永久成长来源（静态规则）', '曾持有 / 见候选 / 终局持有', '星级 / 登场刻数', '永久成长及95%区间', '全程实战成长/登场；成长/持有实例转', '探针威力/登场', '探针伤害/登场及95%区间', '伤害/持有实例转', '去成长伤害/登场', '配对成长伤害差/登场', '精度'], group.cards.map(card => [card.name, card.growthSources.summary, `${card.everHeld}/${card.offered}/${card.endHeld}`, `${number(card.endStars.mean)} / ${number(card.endTicks.mean)}`, intervalCell(card.endGrowth), `${intervalCell(card.lifetime.growthPerAppearance)}；${valueCell(card.lifetime.growthPerInstanceTurn)}`, valueCell(card.probe.powerPerAppearance), intervalCell(card.probe.damagePerAppearance), valueCell(card.probe.damagePerInstanceTurn), valueCell(card.noGrowthProbe.damagePerAppearance), valueCell(card.growthDelta.damagePerAppearance), `${card.precision.damagePerAppearance.precise ? '伤害达标' : '伤害待补'}；${card.precision.endGrowth.precise ? '成长达标' : '成长待补'}${card.roleCaution ? '；辅助/零直伤' : ''}`])), '',
      '### 胜败终局单卡对照', '', markdownTable(['角色', '胜局终局持有n', '胜局威力/登场', '胜局伤害/登场', '胜局永久成长', '败局终局持有n', '败局威力/登场', '败局伤害/登场', '败局永久成长', '胜 / 败样本判断'], group.cards.map(card => { const win = card.outcomes.victory, loss = card.outcomes.defeat; return [card.name, win.endHeld, valueCell(win.probe.powerPerAppearance), intervalCell(win.probe.damagePerAppearance), intervalCell(win.endGrowth), loss.endHeld, valueCell(loss.probe.powerPerAppearance), intervalCell(loss.probe.damagePerAppearance), intervalCell(loss.endGrowth), `${win.probe.damagePerAppearance.n < 30 ? '胜局不足' : '胜局≥30'} / ${loss.probe.damagePerAppearance.n < 30 ? '败局不足' : '败局≥30'}`]; })), '',
      '### 真实战斗分阶段', '', '下表分别显示结算威力和每登场直接实伤，先局内平均再跨局平均；每格带独立战役 n。终止遭遇与第 12 层不能混为一谈。', '', markdownTable(['角色', '终止遭遇威力/登场', '终止遭遇伤害/登场', '第12层伤害/登场', '早期伤害/登场', '中期伤害/登场', '晚期伤害/登场', '终止遭遇伤害/持有实例转'], group.cards.map(card => [card.name, valueCell(card.terminal.powerPerAppearance), valueCell(card.terminal.damagePerAppearance), valueCell(card.final12.damagePerAppearance), valueCell(card.early.damagePerAppearance), valueCell(card.mid.damagePerAppearance), valueCell(card.late.damagePerAppearance), valueCell(card.terminal.damagePerInstanceTurn)])), '',
      '### 辅助产出与成长速度', '', '以下是终局标准探针的每登场辅助产出，平铺增益不包含倍率效果的完整价值；成长速度按每持有实例转归一化。', '', markdownTable(['角色', '治疗/登场', '护盾生成/登场', '给予他人威力/登场', '探针新增成长/持有实例转', '真实早期成长/持有实例转', '真实中期成长/持有实例转', '真实晚期成长/持有实例转'], group.cards.map(card => [card.name, valueCell(card.probe.healingPerAppearance), valueCell(card.probe.shieldPerAppearance), valueCell(card.probe.buffPerAppearance), valueCell(card.probe.growthPerInstanceTurn), valueCell(card.early.growthPerInstanceTurn), valueCell(card.mid.growthPerInstanceTurn), valueCell(card.late.growthPerInstanceTurn)])), '');
  }
  const rendered = `${lines.join('\n')}\n`;
  return report.metadata?.protocol?.attributeUnit === 'attackBonus' ? translateAttributeReport(rendered) : rendered;
}

/** Legacy field names remain readable; new measurements have an explicit unit. */
export function translateAttributeReport(text) {
  return text.replaceAll('临时援军/委派见习','不在90名招募角色表内的创建角色').replaceAll('临时援军 / 委派见习','不在90名招募角色表内的创建角色')
    .replaceAll('临时援军与委派见习','不在90名招募角色表内的创建角色').replaceAll('正式永久实例','90名可招募身份的角色实例')
    .replaceAll('永久 growth','永久攻击力固定加值').replaceAll('全队 growth','全队永久属性').replaceAll('growth 清零','attackBonus、attackPercentBonus、normalAttackBonus及growth兼容镜像清零')
    .replaceAll('昔涟的群体成长可覆盖自身与其他记忆角色。','昔涟的效果按公开标签和位置选择其他角色。')
    .replaceAll('成长','永久属性提升').replaceAll('威力','攻击力');
}
