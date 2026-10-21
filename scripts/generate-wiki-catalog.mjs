import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS, ITEMS, ESSENCES, SYNERGIES, RARITY_LABELS } from '../src/content.js';
import { RETIREMENT_RULES } from '../src/retirements.js';

// This is a versioned rules reference, not a second source of game mechanics.
// Re-run against the documented content baseline and review the prose overrides
// whenever implementation changes; legacy effects intentionally use engine code.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/wiki');
const VERSION = '0.7.0';
const COMMIT = 'e5557f8d6b3ee0a0c308c5a3ca0481d3701db229';
const REPO = 'https://github.com/jjhe2020/starrail-landlord';
const content = await fs.readFile(path.join(ROOT, 'src/content.js'), 'utf8');
const CHECK = process.argv.includes('--check');
let generated = 0;
const source = (file, start, end) => `[${file}:${start}${end ? `–${end}` : ''}](${REPO}/blob/${COMMIT}/${file}#L${start}${end ? `-L${end}` : ''})`;
const contentLine = id => content.slice(0, content.indexOf(`"id": "${id}"`)).split('\n').length;
const link = (name, page) => `[${name}](${page})`;
const cardLink = c => link(c.name, `Card-${c.id}`);
const entryLink = (e, kind) => link(e.name, `${kind}-${e.id}`);
const fmt = value => Number.isFinite(value) ? String(Math.round(value * 1e8) / 1e8) : String(value);
const cell = value => String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const table = (headers, rows) => `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
const nav = kind => `${link('首页', 'Home')} · ${link('角色', 'Cards')} · ${link('奇物', 'Relics')} · ${link('精华', 'Essences')} · ${link('机制时序', 'Effects-and-Timing')}${kind === 'Card' ? ` · ${link('羁绊', 'Synergies')}` : ''}\n`;
const provenance = e => `版本 **v${VERSION}** · 内容基线 \`${COMMIT}\`。数据：${source('src/content.js', contentLine(e.id))}；执行：${source('src/effect-rules.js', 98, 174)}、${source('src/engine.js', 71, 200)}。`;
const attacks = { single: '单体', blast: '扩散', aoe: '群体', support: '支援' };
const roles = { attack: '攻击', defense: '防御', amplifier: '即时增幅', trainer: '永久培养', disruptor: '敌方干扰' };
const kinds = { path: '命途', element: '属性', faction: '阵营', attack: '攻击形态', role: '主职能' };
const metrics = {
  hpRatio: '当前生命÷生命上限', missingHp: '缺失生命 max(0, 生命上限−当前生命)', shield: '当前护盾存量', coins: '当前信用点',
  ticks: '来源实例累计实际登场次数', stars: '来源实例星级', growth: '来源实例永久成长', round: '本关转动序号', floor: '当前关卡数',
  neighbors: '相邻八格中符合筛选的实例数', row: '同行其他格中符合筛选的实例数', column: '同列其他格中符合筛选的实例数', aligned: '同行或同列其他格中符合筛选的实例数',
  edge: '位于边缘时为1，否则为0', corner: '位于角落时为1，否则为0', emptyNeighbors: '相邻八格中的空格数',
  present: '本轮尚未被消耗且符合筛选的登场实例数', presentDistinct: '本轮符合筛选的不同角色 ID 数', roster: '编队中符合筛选的实例数',
  enemies: '当时存活敌列数', emptyColumns: '5−当时存活敌列数', synergies: '本轮激活的正式羁绊条目数', retirements: '本轮已经计入的退场数',
  damage: '本轮累计对敌实际伤害', healing: '本轮实际恢复生命量', blocked: '本轮护盾实际抵挡反击量', hpLost: '本轮反击实际造成生命损失',
  sourcePower: '所选来源格的最终威力', kills: '本轮击破敌列数', rerolls: '取得精华后实际使用重掷次数', removals: '取得精华后实际使用移除次数',
  creditsSpent: '取得精华后实际消费信用点总量', merges: '取得精华后完成的三合一合成次数', spins: '已完成转动次数', single: '本轮单体攻击实例登场数',
  aoe: '本轮群体攻击实例登场数', nihility: '本轮虚无实例登场数', credits: '本轮转动结算内获得信用点',
};
// Identical metric tokens are read from different contexts: a skill's shield
// metric is the current stock; essence progress uses this spin's actual gain.
const progressMetricLabel = key => ({ shield: '本轮转动内实际新增护盾', growth: '本轮新增永久成长' })[key] || metrics[key];
const triggers = { appearance: '来源实例实际登场时（登场计数已先加1）', spin: '每次转动一次', passive: '持有并满足条件时参与相应计算', floor: '新关初始化时', acquire: '取得奇物时；精华则在达标解锁时', retire: '本轮有退场后统一结算一次', kill: '该来源常规攻击实际击破敌列后', merge: '来源实例完成合成后', retaliation: '敌人反击已结算且列车仍有生命时', clear: '过关后一次' };
const targets = { self: '来源实例自身', adjacent: '来源相邻八格', team: '本次登场队伍', all: '本次登场队伍', matching: '本次登场的匹配角色', strongest: '威力最高的匹配角色，默认排除来源', row: '来源同行五格（再应用筛选）', column: '来源同列四格（再应用筛选）', aligned: '来源同行或同列', allies: '按筛选匹配的登场队伍', resource: '列车共享资源', roster: '编队' };
const durations = { spin: '本次转动；下次重算', resource: '进入共享资源存量，保留至消耗、衰减或上限截断', run: '本局；新局不继承', whileOwned: '持有来源时持续检查；本轮威力不会逐轮永久叠加', instant: '当次即时修改或造成伤害', encounter: '本关', appearances: '临时实例的实际登场次数', nextSpin: '下一次转动一次' };
const typeNames = { power: '威力平加', powerMultiplier: '威力倍率', heal: '恢复生命', healOverflowShield: '治疗并将溢出转为护盾', shield: '获得护盾', growth: '永久成长', vulnerability: '限定攻击者的对敌易伤', retaliationFlat: '固定反击削减', retaliationMultiplier: '反击倍率削减', resource: '资源收入', summon: '召唤临时角色', maxHp: '提高生命上限', selfDamage: '直接消耗生命', extraSpin: '增加本关转动次数', damage: '独立追加伤害', ignoreArmor: '本轮无视装甲', healMultiplier: '治疗量倍率', shieldMultiplier: '护盾量倍率', buffMultiplier: '支援增益量倍率', growthMultiplier: '成长获取倍率', rarityMultiplier: '招募权重倍率', essenceProgressMultiplier: '未解锁精华进度倍率', consume: '消耗临时角色换取威力' };
const resources = { coins: '信用点', rerolls: '重掷机会', removals: '移除机会' };
function publicTag(kind, value) {
  const s = SYNERGIES.find(s => s.kind === kind && s.tag === value);
  const label = kind === 'role' ? roles[value] : kind === 'attack' ? attacks[value] : value;
  return link(label || value, s ? `Synergy-${s.id}` : `Cards#${kind}`);
}
function filterText(filter) {
  if (!filter || !Object.keys(filter).length) return '无额外筛选';
  const parts = [];
  if (filter.anyOf) parts.push(`（${filter.anyOf.map(filterText).join(' 或 ')}）`);
  for (const kind of Object.keys(kinds)) {
    if (filter[kind] !== undefined) parts.push(`${kinds[kind]}为${publicTag(kind, filter[kind])}`);
    if (filter[`${kind}Not`] !== undefined) parts.push(`${kinds[kind]}不为${publicTag(kind, filter[`${kind}Not`])}`);
  }
  if (filter.id) parts.push(`角色为${cardLink(CHARACTERS.find(c => c.id === filter.id))}`);
  if (filter.ids) parts.push(`角色为${filter.ids.map(id => cardLink(CHARACTERS.find(c => c.id === id))).join('、')}`);
  if (filter.temporary !== undefined) parts.push(filter.temporary ? '临时或本轮到期实例' : '非临时实例（此字段本身不排除见习）');
  if (filter.commission !== undefined) parts.push(filter.commission ? '见习委派实例' : '排除见习委派');
  if (filter.starsMin !== undefined) parts.push(`至少${filter.starsMin}星`);
  if (filter.starsMax !== undefined) parts.push(`至多${filter.starsMax}星`);
  if (filter.excludeSelf) parts.push('排除来源同一 UID 实例');
  if (filter.group || filter.groupsAny) parts.push('已废弃的内部条件，永不匹配');
  return parts.join('，且');
}
const metricText = rule => `${metrics[rule.metric] || rule.metric}${rule.filter ? `（${filterText(rule.filter)}）` : ''}`;
function conditionText(c) {
  const op = c.op || 'gte';
  return op === 'mod' ? `${metricText(c)}为正且可被${c.value}整除` : `${metricText(c)}${({ gte: '≥', lte: '≤', gt: '>', lt: '<', eq: '=' })[op] || '≥'}${c.value}`;
}
function amountFormula(e) {
  let formula = fmt(e.value ?? 0);
  if (e.per) {
    let count = `max(0, ${metricText(e.per)}${e.per.divisor ? `÷${e.per.divisor}` : ''})`;
    if (e.per.floor) count = `floor(${count})`;
    if (Number.isFinite(e.per.cap)) count = `min(${e.per.cap}, ${count})`;
    formula += ` × ${count}`;
  }
  if (e.scaleWithStars) formula += e.starFactors ? ` × 星级系数[${e.starFactors.slice(1, 4).join(' / ')}]` : ' × 星级倍率[1 / 3 / 9]';
  if (e.scaleWithSourcePower) formula += ' × 来源最终威力';
  if (e.scaleWithTraining && e.type !== 'growth') formula = ['powerMultiplier', 'retaliationMultiplier', 'healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier'].includes(e.type) ? `max(0.05, 1 + (${formula} − 1) × T)` : `${formula} × T`;
  return formula;
}
function targetText(e) {
  if (['heal','shield','healOverflowShield','resource','maxHp','extraSpin','selfDamage'].includes(e.type)) return `${e.type === 'resource' ? resources[e.resource || 'coins'] : '列车共享生命、护盾或转动资源'}；\`target\` 元数据不将共享资源复制为每位队友一份`;
  if (['retaliationFlat','retaliationMultiplier','ignoreArmor'].includes(e.type)) return '本轮共享战斗上下文（敌方反击或装甲规则）';
  if (['healMultiplier','shieldMultiplier','buffMultiplier','growthMultiplier'].includes(e.type)) return `匹配的收益来源/成长受体，按调用点检查；目标域为${targets[e.target || 'team'] || e.target}${e.range ? `，再限于${targets[e.range] || e.range}` : ''}${e.filter ? `；${filterText(e.filter)}` : ''}`;
  if (e.type === 'rarityMultiplier') return `招募候选池的${Array.isArray(e.rarity) ? e.rarity.map(r => RARITY_LABELS[r]).join('、') : RARITY_LABELS[e.rarity]}权重`;
  if (e.type === 'essenceProgressMultiplier') return '尚未触发的精华，本次转动末统一快照计算';
  if (e.type === 'summon') return `${cardLink(CHARACTERS.find(c => c.id === e.characterId))}的新一星临时实例，加入编队，下一轮起可能抽中`;
  if (e.type === 'damage') return ['team','all'].includes(e.target) ? '所有当时存活敌列，各吃一份数值' : `${e.target === 'strongest' ? '先选最强匹配角色作为来源，再寻找' : '寻找来源格对应列；空列改找'}最近存活敌列${e.excludeOriginColumn ? '（排除来源列）' : ''}；距离相同时取左侧`;
  return `${targets[e.target || 'self'] || e.target}${e.range ? `；再限制在${targets[e.range] || e.range}` : ''}${e.selection === 'strongest' ? '；范围内按当前威力降序选择，平手格号小者优先' : ''}${e.targetLimit ? `；最多${e.targetLimit}名` : ''}${e.includeSource ? '；允许来源参加最强选择' : ''}`;
}
const LEGACY = {
  cosmic_lotto: '在退场/每轮效果后独立抽取一次随机数，概率0.2；命中时所有未消耗角色最终威力乘1.5。本轮全队共享同一次结果。',
  fortune_glue: '只在招募阶段将史诗与传说的每卡基础权重各乘1.5；是候选抽样权重，非最终出现概率直接加50%，不影响奇物或精华抽样。',
  gold_coin: '每位未被消耗的登场角色，在技能待处理平加与最终乘区之前加0.3；包括支援形态角色，支援仍不进行常规攻击。',
  faith_bond: '每次转动在退场结算后获得3信用点；记入本轮收入，因此能推进按转动收入累计的精华。',
  preservation_wax: '所有非固定护盾入口乘1.5。非首次进入新关时请求8基础护盾，该入关赠盾同样享受1.5、其他护盾倍率、折价和上限。',
  abundance_wax: '所有非固定治疗入口乘1.5；取得本物后请求20基础治疗，已持有本物，因此这20同样先乘1.5及其他适用治疗修正，再受缺失生命截断。',
  hunt_wax: '单体形态角色最终威力乘1.3；按攻击形态而非巡猎命途筛选。',
  destruction_wax: '扩散形态角色最终威力乘1.25；按攻击形态而非毁灭命途筛选。',
  erudition_wax: '群体形态角色最终威力乘1.25；按攻击形态而非智识命途筛选。',
  harmony_wax: '实际 buffScale 乘1.5：适用于即时增幅主职能来源，或 target=adjacent/strongest 的威力平加和威力倍率技能。平加乘1.5，倍率只放大相对1的增益，例如1.5→1.75。现代即时增幅共同上限×2.2仍适用；不限于同谐命途。',
  nihility_wax: '虚无命途登场角色本次基础加成段加1；不是永久成长。',
  dimension_dice: '取得时先将生命上限加15，再请求15基础治疗；每次转动在每轮技能后请求2基础治疗。均经过治疗倍率、折价、实际缺失生命截断。',
  doctor_robe: '二星和三星角色最终威力乘1.2，不随星级再变为3倍或9倍。',
  chaos_trametes: '每轮以0.2概率获得1次重掷；独立于银河大乐透，消耗独立的种子随机抽取。',
  angel_debt: '每次过关在基础过关赏金后额外获得8信用点与1次移除；包括第12关最终胜利的那次过关。不用于当轮精华进度。',
  insect_web: '统一退场阶段结束后，按本轮退场数 R 获得4R信用点并请求2R基础治疗；R包含正式委派、被消耗与临时到期。治疗经过倍率，不为每位再次逐条发放。',
  seal_stamp: '取得时若 pendingFloor=false，spinsLeft 与 encounter.deadline 各加1；若正在领取过关奖励，仅由下一关初始期限公式获得额外1次。未来每关初始化转动期限加1，不跨关累加。',
  divination_candle: '羁绊进攻系数乘1.5：power平加与damage追加伤害系数直接乘1.5，powerMultiplier改为1+(原倍率−1)×1.5。不会增强护盾、治疗、减伤、信用点、持续时长或触发次数；可与羁绊征收的×0.75相乘。',
  broken_clock: '取得时立即获得2次重掷；每个未消耗登场角色最终威力固定乘1.2。',
  rubert_gear: '角色新获得的永久成长及正式委派成长乘1.5；不追溯修改已持有成长，不把成长赠送的主持者培养量自乘。',
  essence_elation: '达标后的后续转动，所有登场角色最终威力乘1.15；解锁当次的伤害已结束，不补算。',
  essence_abundance: '达标时先将生命上限加20，再按新的生命上限请求一次治疗；并非直接将 hp 赋为 maxHp，治疗折价或倍率仍适用。',
  essence_hunt: '后续转动中单体攻击形态角色最终威力乘1.35，按形态而非命途筛选。',
  essence_destruction: '后续转动每位登场角色的基础加成段加1；不反复写入永久成长。',
  essence_erudition: '后续转动群体攻击形态角色的基础加成段加1；非所有智识命途。',
  essence_harmony: '解锁瞬间共享重掷加3；后续转动全队最终威力乘1.1。',
  essence_preservation: '后续所有非固定护盾入口乘1.3；非首次新关赠12基础护盾，12本身也受1.3和其余适用护盾倍率修正。',
  essence_nihility: '后续转动虚无命途登场角色的基础加成段加1.5；不写入永久成长。',
};
function effectRules(e, owner) {
  const lines = [];
  if (e.type === 'power') lines.push('在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。');
  if (e.type === 'powerMultiplier') lines.push(owner.role === 'amplifier' ? '只放大本轮威力；同一目标受到现代即时增幅者的倍率相乘后共同封顶×2.2，超出的部分不生效。' : '与其他适用威力倍率相乘；自身条件倍率不占即时增幅角色共同×2.2的上限。');
  if (['heal','healOverflowShield'].includes(e.type)) lines.push('请求治疗先经过治疗倍率与折价并四舍五入到两位小数；实际恢复=min(缺失生命, 请求值)。' + (e.type === 'healOverflowShield' ? '溢出=请求值−实际恢复，随后按护盾入口再应用护盾倍率与上限。' : '溢出不计实际治疗进度。'));
  if (e.type === 'shield') lines.push('经过护盾倍率与折价后加入护盾，存量上限为生命上限×2；'+ (['floor','acquire'].includes(e.trigger) ? '入关或解锁奖励发生于转动进度观察之外，不反向推进当轮或下一轮的精华护盾进度。' : '实际获得量用于本轮护盾进度。'));
  if (e.type === 'growth') lines.push('写入编队中同UID且非临时的原实例；通用入口本身不排除见习或培养主职，目标筛选另行决定是否排除它们。例如丹恒见习可以触发自身成长，但专业培养者的受体筛选排除见习。新成长再乘齿轮、成长折旧和适用成长倍率；两位小数保存，本轮攻击威力/可培养技能即可使用更新后的成长。成长赠送量不会被来源自己的培养倍率放大。');
  if (e.type === 'vulnerability') lines.push('为选出的攻击者 UID 登记本轮易伤增量；命中时还检查公开标签。只有攻击主职能的常规攻击，或以该攻击者为行动者的角色/羁绊追加伤害可以受益，奇物追加伤害不受益。同次匹配增量相加，上限75%，伤害乘1+min(0.75, 合计增量)，在装甲与实际剩余生命截断前生效。');
  if (e.type === 'retaliationFlat') lines.push('本轮平减同类相加；实际最多减去存活敌人基础反击的45%，再进入倍率减伤。');
  if (e.type === 'retaliationMultiplier') lines.push('反击倍率同类相乘，平减后应用；最终倍率保底0.4，即倍率阶段最多减伤60%。');
  if (e.type === 'damage') lines.push('每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。'+ (e.trigger === 'floor' ? '入关立即造成伤害，记录可能追加到上一轮lastSpin展示快照；下一轮清空本轮记录后才开始，入关伤害或入关击破不推进下一轮精华指标。' : '转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。')+'读取 sourcePower 的效果会在真正追加结算时重读最终威力。');
  if (e.type === 'resource') lines.push(`${resources[e.resource || 'coins']}收入先取max(0, 数值)；信用点保留两位小数，重掷/移除向下取整。资源存量跨轮、跨关保留。`);
  if (e.type === 'summon') lines.push(`新实例为一星、成长0，实际登场寿命=${Math.max(1,Math.min(3,e.durationAppearances || 3))}次；编队加本轮待生成实例达到200时不生成。其出生当轮不能加入已抽好的棋盘；临时身份不计正式羁绊，不参与普通三合一。`);
  if (e.type === 'selfDamage') lines.push(`直接扣生命、绕过护盾；最低保留${e.nonlethal === false ? '0（可以致死）' : '1'}生命。`);
  if (e.type === 'maxHp') lines.push('只改变生命上限，不自动等量回血；同一解锁/取得流程仅执行一次，另列治疗效果才恢复生命。');
  if (e.type === 'rarityMultiplier') lines.push('将指定稀有度的每张招募卡权重相乘；最终概率仍需除以当前剩余候选池的总权重。');
  if (['healMultiplier','shieldMultiplier','buffMultiplier','growthMultiplier','essenceProgressMultiplier'].includes(e.type)) lines.push('不同已持有来源的适用倍率相乘；每次对应收益调用时重新求值，不把倍率本身逐轮再乘入存档。');
  if (e.type === 'ignoreArmor') lines.push('将本轮共享无视装甲标记设为true；之后常规攻击和适用追加伤害都能绕过每次命中的装甲。');
  if (e.every) lines.push(`every=${e.every}：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。`);
  if (e.oncePerSpin) lines.push('同一来源、同一效果每轮最多一次；不是整队只触发一次。');
  if (e.per && !e.per.floor) lines.push('份数不向下取整；除法结果可为小数，再受cap截断。');
  if (e.globalException) lines.push(`全场例外标记：${typeof e.globalException === 'string' ? e.globalException : JSON.stringify(e.globalException)}。`);
  if (e.scaleWithStars) lines.push(`无升星差额税时，1/2/3星技能系数分别为${(e.starFactors || [0,1,3,9]).slice(1,4).join(' / ')}；若星级审计生效，高星系数额外×0.8。`);
  else lines.push('此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。');
  if (e.scaleWithTraining && e.type !== 'growth') lines.push('T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。');
  return lines;
}
function effectSection(e, owner, i) {
  const conditions = [e.condition, ...(e.conditions || [])].filter(Boolean).map(conditionText);
  const rows = [
    ['类型', `${typeNames[e.type] || e.type}（\`${e.type}\`）`],
    ['触发', `${triggers[e.trigger] || e.trigger}${e.chance !== undefined ? `；成功概率${fmt(e.chance * 100)}%，通过条件后才消耗随机判定` : ''}`],
    ['阶段', e.stage === 'afterRetaliation' ? '反击后且列车仍存活' : e.stage === 'afterAttacks' || e.type === 'damage' && ['appearance','spin','retire'].includes(e.trigger) ? '常规攻击之后；按统一时序结算' : '默认 beforeAttacks；被动倍率在实际收益调用处使用'],
    ['门槛', conditions.length ? conditions.join('；并且') : '无额外数值门槛（仍需来源与触发成立）'],
    ['目标', targetText(e)],
    ['目标筛选', e.filter ? filterText(e.filter) : '无额外公开标签筛选'],
    ['基础数值公式', amountFormula(e)],
    ['持续', durations[e.duration] || e.duration || '按所属收益规则'],
    ['叠加元数据', `\`${e.stacking || '未指定'}\`；实际加法、乘法与上限见下列结算规则`],
  ];
  return `### 技能 ${i + 1}：${typeNames[e.type] || e.type}\n\n${e.summary || owner.description}\n\n${e.legacy ? '**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**\n\n' : ''}${table(['字段', e.legacy ? '展示元数据（专用规则见下）' : '精确口径'], rows)}\n${e.legacy ? `实际专用规则：**${LEGACY[owner.id]}**\n` : effectRules(e, owner).map(line => `- ${line}`).join('\n')+'\n'}`;
}
function identityMatches(c, f) {
  if (!f) return true;
  if (f.id && f.id !== c.id || f.ids && !f.ids.includes(c.id)) return false;
  if (f.anyOf && !f.anyOf.some(part => identityMatches(c, part))) return false;
  return Object.keys(kinds).every(k => (f[k] === undefined || c[k] === f[k]) && (f[`${k}Not`] === undefined || c[k] !== f[`${k}Not`]));
}
function collectFilters(effects) {
  const all = effects.flatMap(e => [e.filter, e.condition?.filter, ...(e.conditions || []).map(c => c.filter), e.per?.filter]).filter(Boolean);
  return [...new Map(all.map(f => [JSON.stringify(f),f])).values()];
}
function associated(e, kind) {
  const chunks = [];
  for (const f of collectFilters(e.effects || [])) {
    const matching = CHARACTERS.filter(c => identityMatches(c, f));
    chunks.push(`- ${filterText(f)}：${matching.length ? matching.map(cardLink).join('、') : '当前无对应角色定义'}。`);
  }
  if (kind === 'Essence' && !chunks.length) {
    const metric = e.progress?.metric;
    const match = metric === 'single' ? CHARACTERS.filter(c => c.attack === 'single') : metric === 'aoe' ? CHARACTERS.filter(c => c.attack === 'aoe') : metric === 'nihility' ? CHARACTERS.filter(c => c.path === '虚无') : metric === 'healing' ? CHARACTERS.filter(c => c.effects.some(e => ['heal','healOverflowShield'].includes(e.type))) : metric === 'shield' ? CHARACTERS.filter(c => c.effects.some(e => ['shield','healOverflowShield'].includes(e.type))) : [];
    if (match.length) chunks.push(`- 能直接提供此项进度的角色类别：${match.map(cardLink).join('、')}。`);
  }
  if (kind === 'Card') {
    const synergies = SYNERGIES.filter(s => e[s.kind] === s.tag);
    chunks.unshift(`- 正式羁绊：${synergies.length ? synergies.map(s => link(s.name, `Synergy-${s.id}`)).join('、') : '没有匹配的正式羁绊条目'}。身份计数、不同ID与临时/见习排除规则见${link('正式羁绊', 'Synergies')}。`);
    const sameTags = CHARACTERS.filter(c => c.id !== e.id && (c.path === e.path || c.faction === e.faction || c.element === e.element));
    chunks.push(`- 共享至少一个命途、属性或阵营标签：${sameTags.map(cardLink).join('、')}。`);
    const interactions = [...ITEMS.map(x => [x,'Relic']), ...ESSENCES.map(x => [x,'Essence'])].filter(([x]) => collectFilters(x.effects || []).some(f => identityMatches(e, f)));
    if (interactions.length) chunks.push(`- 有公开标签筛选可匹配本角色的奇物/精华：${interactions.map(([x,k]) => entryLink(x,k)).join('、')}。`);
  }
  return chunks.length ? `\n## 关联与互引\n\n以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。\n\n${chunks.join('\n')}\n` : `\n## 关联与互引\n\n此项收益作用于共享资源或全体队伍，见${link('经济与补给','Economy')}、${link('战斗公式','Combat')}及${link('成长与星级','Growth-and-Stars')}。\n`;
}
function assignments(c) {
  const rules = RETIREMENT_RULES.filter(r => r.sourceId === c.id || r.targetId === c.id);
  if (!rules.length) return '';
  return `\n## 正式委派关系\n\n${rules.map(r => `- **${r.name}**：主持${cardLink(CHARACTERS.find(c => c.id === r.sourceId))} → 受体${cardLink(CHARACTERS.find(c => c.id === r.targetId))}。主持者每${r.every}次登场可结案一名合格相邻受体；永久成长+${r.growth}（1/2/3星×1/1.5/2）、信用点+${r.coins}${r.power ? `，攻击主持者本轮额外威力+${r.power}×星级倍率` : ''}。每${r.supplyEvery}次登场在已解锁该受体身份后补充见习。`).join('\n')}\n\n受体保护、选择顺序和完整条件见${link('委派系统','Assignments')}，以${source('src/retirements.js', 3, 37)}及${source('src/engine.js', 440, 482)}为准。\n`;
}
function cardPage(c) {
  const rows = [['角色ID', `\`${c.id}\``], ['英文名', c.enName], ['游戏稀有度', RARITY_LABELS[c.rarity]], ['基础威力', c.power], ['主职能', publicTag('role',c.role)], ['攻击形态', publicTag('attack',c.attack)], ['命途', publicTag('path',c.path)], ['属性', publicTag('element',c.element)], ['阵营', publicTag('faction',c.faction)], ['技能规则版', `kitVersion=${c.kitVersion}`], ['资料状态', `\`${c.publicationStatus}\`（不是招募资格门槛）`], ['原作星级', `${c.officialRarity}（资料归属；不是本游戏稀有度或合成星级）`]];
  const growth = c.role === 'attack' ? '攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。' : c.role === 'trainer' ? '永久培养主职能：基础威力不加成长；常规赠送培养的筛选排除培养主持，赠送量不自乘培养系数。' : '非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。';
  return `# ${c.name}\n\n${nav('Card')}\n${provenance(c)}\n\n${c.description}\n\n## 基础数据与公开标签\n\n${table(['项目','内容'],rows)}\n招募池包括当前全部90个定义，\`publicationStatus\` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。\n\n## 常规攻击与成长\n\n- 无修正的1/2/3星基础威力：**${[1,3,9].map(s => fmt(c.power*s)).join(' / ')}**。${growth}\n- ${c.attack === 'support' ? '支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。' : c.attack === 'single' ? '常规攻击向来源列最近存活敌列命中1次，系数3。' : c.attack === 'blast' ? '常规攻击命中来源列最近存活敌列，系数2；再命中主目标左右紧邻列的存活敌人，各系数1，溅射不继续找远列。' : '常规攻击命中所有存活敌列，每列系数1。'}完整命中、装甲、易伤、四舍五入见${link('战斗','Combat')}。\n\n## 技能明细\n\n条件在该技能实际阶段读取。位置与人数定义见${link('棋盘与目标','Board-and-Targeting')}；未标记星级/培养缩放的字段保持固定值。\n\n${c.effects.map((e,i) => effectSection(e,c,i)).join('\n')}${assignments(c)}${associated(c,'Card')}\n## 精确数据与来源\n\n下列为不含美术字段的当前角色定义；与${link('效果时序','Effects-and-Timing')}和${link('复原规格','Reproduction')}一起使用。技能为本作改编，不是原作战斗技能。\n\n\`\`\`json\n${JSON.stringify(stripArt(c),null,2)}\n\`\`\`\n`;
}
const progressNotes = {
  damage: '累计本轮对敌实际伤害；装甲减免、敌人残血截断后计数，不计空打威力。', spins: '每次完成且列车仍存活的转动计1；不是取得前全局历史转动。',
  single: '按本轮实际进入攻击威力阶段的单体形态实例数累计，不按巡猎命途、不按击中次数。', aoe: '按本轮群体形态实例数累计，不按智识命途、不按命中敌列数量。',
  nihility: '按本轮虚无命途实例登场数累计。', synergies: '每轮按编队激活的羁绊条目数累计；高档仍只算该条1个，非本轮真正触发的技能条数。',
  shield: '累计本轮转动内实际获得护盾，受护盾上限截断；补给与入关赠盾不作为下一轮进度，衰减和抵挡量不会倒扣此项。',
  credits: '只累计本轮转动内部取得的信用点；取得奖励与过关赏金发生在进度快照之后，不算下一轮收入。',
  healing: '累计转动内实际恢复生命，满血溢出不算；维修补给不计入后续转动进度。', growth: '累计本轮新增永久成长，使用倍率与折旧后的实获量。',
  retirements: '累计本轮委派结案、消耗临时角色、临时到期的退场数量；不等于角色死亡。',
  kills: '以本轮开始存活敌列数减结算后存活敌列数，包括常规攻击、追加伤害与反击伤害造成的实际击破。',
  rerolls: '取得时记录重掷使用总计基线，每轮末读取新增已使用次数并更新基线。取得前用量不算；免费与信用点付费重掷都算。',
  removals: '取得时记录移除使用总计基线，每轮末读取新增使用次数；拥有但没使用的机会不算。',
  creditsSpent: '取得时记录总消费信用点基线；之后付费重掷、补给等实际支出累计，在下一次存活转动末读取差值。',
  merges: '取得时记录合成总次数基线；之后每次三合一加1，连锁一星→二星与二星→三星分别计1，在转动末读取差值。',
};
function collectiblePage(e, kind) {
  const essence = kind === 'Essence';
  const rows = [['ID',`\`${e.id}\``],['稀有度', RARITY_LABELS[e.rarity]],['取得',essence ? '每3关过关后的精华三选一，已持有ID不重复进入候选' : '每2关过关后的奇物三选一，已持有ID不重复进入候选'],['同名持有', '正常流程最多一份；不同ID的效果可按各自规则叠加']];
  const unlock = essence ? `\n## 取得、积累与解锁\n\n${table(['字段','规则'], [['进度指标', `\`${e.progress?.metric}\`：${progressMetricLabel(e.progress?.metric)}`],['门槛', e.target],['初始状态', 'progress=0、triggered=false；取得前历史不追溯'],['触发', `每次转动结算且列车仍存活时，进度=min(${e.target}, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次`]])}\n${progressNotes[e.progress?.metric] || ''}\n\n进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。\n\n达标的acquire效果立即执行；持续威力从后续转动开始使用。见${link('效果时序','Effects-and-Timing')}与${source('src/engine.js', 554, 591)}。\n` : `\n## 取得与持续生效\n\n取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见${link('招募与稀有度','Draft-and-Rarity')}。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。\n`;
  return `# ${e.name}\n\n${nav(kind)}\n${provenance(e)}\n\n${e.description}\n\n## 基础数据\n\n${table(['项目','内容'],rows)}${unlock}\n## 效果明细\n\n${e.effects.map((effect,i) => effectSection(effect,e,i)).join('\n')}${LEGACY[e.id] ? `\n## 专用实现与复原注意\n\n${LEGACY[e.id]}\n\n此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见${source('src/engine.js', 265, 293)}、${source('src/engine.js', 372, 391)}、${source('src/engine.js', 532, 591)}、${source('src/engine.js', 756, 863)}与${source('src/engine.js', 937, 963)}${e.id === 'divination_candle' ? `；进攻羁绊缩放见${source('src/synergies.js', 49, 51)}` : ''}。\n` : ''}${associated(e,kind)}\n## 精确数据\n\n字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的\`docs/wiki/data/content-v0.7.0.json\`，各条目的数值亦完整保留在本页中。\n\n\`\`\`json\n${JSON.stringify(stripArt(e),null,2)}\n\`\`\`\n`;
}
function stripArt(e) { return Object.fromEntries(Object.entries(e).filter(([key]) => !['image','icon','color','assetId','portraitKind'].includes(key))); }
function cardIndex() {
  let text = `# 角色百科\n\n${nav('Card')}\n本页与90份角色条目固定描述 **v${VERSION}** 的当前可抽取内容。来源为${source('src/content.js', 6)}及候选池${source('src/engine.js', 499, 511)}；不根据原作发布状态增删角色。原作角色身份与图片归HoYoverse等权利人，规则为本作改编。\n\n## 全角色一览\n\n基础威力为一星、成长0、无装备无羁绊值。稀有度为本游戏抽样稀有度；单体/扩散/群体是攻击形态，命途是独立标签。\n\n${table(['角色','稀有度','威力','形态','职能','命途','属性','阵营'], CHARACTERS.map(c => [cardLink(c), RARITY_LABELS[c.rarity],c.power, attacks[c.attack],roles[c.role],publicTag('path',c.path),publicTag('element',c.element),publicTag('faction',c.faction)]))}`;
  for (const kind of Object.keys(kinds)) {
    text += `\n<a id="${kind}"></a>\n\n## ${kinds[kind]}索引\n\n`;
    for (const value of [...new Set(CHARACTERS.map(c => c[kind]))]) text += `- **${publicTag(kind,value)}**：${CHARACTERS.filter(c => c[kind] === value).map(cardLink).join('、')}。\n`;
  }
  return text + `\n## 怎样读角色条目\n\n每份条目依次给出静态数据、常规攻击、逐技能的触发/阶段/筛选/数值公式/持续/叠加、正式委派和关联身份。\`anyOf\`组内为“或”，外层字段为“且”；同一角色不同实例具有不同UID。完整通则见${link('棋盘','Board-and-Targeting')}、${link('战斗','Combat')}、${link('成长','Growth-and-Stars')}、${link('羁绊','Synergies')}。\n`;
}
function collectibleIndex(entries, kind) {
  const essence = kind === 'Essence';
  return `# ${essence ? '精华' : '奇物'}百科\n\n${nav(kind)}\n当前 **v${VERSION}** 共${entries.length}${essence ? '份精华' : '件奇物'}。每个ID正常只取得一份；各自效果按机制叠加。来源${source('src/content.js', contentLine(entries[0].id))}。\n\n${essence ? `精华取得时不立即提供持续能力；先从取得后的行为积累进度，转动末达标后执行一次解锁奖励，并激活持续效果。完整快照、计数与进度修正见各精华条目和${link('效果时序','Effects-and-Timing')}。` : `奇物持有时提供被动或定时收益，部分有一次性取得效果。基础恢复与护盾不是固定补给：均须经过治疗/护盾倍率、折价和截断。详细公式见${link('经济与补给','Economy')}、${link('战斗','Combat')}。`}\n\n## 全部${essence ? '精华' : '奇物'}\n\n${table(essence ? ['精华','稀有度','进度指标','门槛','解锁收益'] : ['奇物','稀有度','效果'], entries.map(e => essence ? [entryLink(e,kind),RARITY_LABELS[e.rarity],`\`${e.progress.metric}\`：${progressMetricLabel(e.progress.metric)}`,e.target,e.description] : [entryLink(e,kind),RARITY_LABELS[e.rarity],e.description]))}\n## 按效果类型查阅\n\n${[...new Set(entries.flatMap(e => e.effects.map(e => e.type)))].map(type => `- **${typeNames[type]}**：${entries.filter(e => e.effects.some(e => e.type === type)).map(e => entryLink(e,kind)).join('、')}。`).join('\n')}\n\n## 复原与边界\n\n当前部分早期条目保留\`legacy:true\`的展示元数据，通用解释器跳过；它们有实际专用分支，每份条目已标出，复原时只执行一次。不要将\`stacking:unique\`当作通用解释器的额外去重逻辑；正常流程的单份持有由奖励候选排除提供。各条目的JSON保留参数，可与${link('效果时序','Effects-and-Timing')}、${link('复原规格','Reproduction')}一起交叉核对。\n`;
}
async function write(name, body) {
  const target = path.join(OUT, name);
  if (CHECK) {
    const existing = await fs.readFile(target,'utf8').catch(() => null);
    if (existing !== body) throw new Error(`Wiki catalog differs: ${name}; run node scripts/generate-wiki-catalog.mjs`);
  } else { await fs.mkdir(path.dirname(target), { recursive:true }); await fs.writeFile(target,body); }
  generated += 1;
}
await write('Cards.md',cardIndex());
await write('Relics.md',collectibleIndex(ITEMS,'Relic'));
await write('Essences.md',collectibleIndex(ESSENCES,'Essence'));
await write('Data-Content.md', `# 完整内容参数快照\n\n${nav()}\n本组是 **v${VERSION}**、引擎基线 \`${COMMIT}\` 的完整非美术内容定义。无需访问外部源代码即可取得下列三个库的所有显式字段；未默认化字段的解释与执行顺序见${link('效果与时序','Effects-and-Timing')}和${link('复原规格','Reproduction')}。\n\n- ${link('90份角色完整JSON','Data-Cards')}：公开标签、基础威力、攻击形态、职能和所有技能参数。\n- ${link('64件奇物完整JSON','Data-Relics')}：取得、每轮、每关与持有被动参数。\n- ${link('32份精华完整JSON','Data-Essences')}：进度指标、阈值及解锁后的全部参数。\n\n美术路径、图标、颜色和素材ID已剔除；角色ID、名字和原资料归属链接保留，内部拿牌偏好不在本快照中赋予任何规则。以下专用实现补充必须与三个库一起使用：\`legacy:true\`为展示元数据，通用解释器跳过，由专用分支执行一次。\n\n\`\`\`json\n${JSON.stringify({ version: VERSION, commit: COMMIT, rarityLabels: RARITY_LABELS, legacyImplementationNotes: LEGACY },null,2)}\n\`\`\`\n\n同一快照也作为来源仓库的\`docs/wiki/data/content-v0.7.0.json\`保存；生成脚本为\`scripts/generate-wiki-catalog.mjs\`，可用\`--check\`核验页面与本地基线数据一致。\n`);
for (const [name,label,entries] of [['Data-Cards','角色',CHARACTERS],['Data-Relics','奇物',ITEMS],['Data-Essences','精华',ESSENCES]]) {
  await write(`${name}.md`, `# ${label}完整非美术参数\n\n${link('完整内容参数总入口','Data-Content')} · ${link(`${label}百科`, label === '角色' ? 'Cards' : label === '奇物' ? 'Relics' : 'Essences')} · ${link('复原规格','Reproduction')}\n\n基线 **v${VERSION}**、\`${COMMIT}\`，共${entries.length}条。以下是整个库的显式定义；字段省略时使用${link('效果解释器','Effects-and-Timing')}中的默认值。legacy专用规则见${link('数据总入口','Data-Content')}。\n\n\`\`\`json\n${JSON.stringify(entries.map(stripArt),null,2)}\n\`\`\`\n`);
}
for (const c of CHARACTERS) await write(`Card-${c.id}.md`,cardPage(c));
for (const e of ITEMS) await write(`Relic-${e.id}.md`,collectiblePage(e,'Relic'));
for (const e of ESSENCES) await write(`Essence-${e.id}.md`,collectiblePage(e,'Essence'));
await write('data/content-v0.7.0.json', JSON.stringify({ version:VERSION, commit:COMMIT, note:'Non-art definitions. Effects tagged legacy are display metadata and use the documented engine branches; internal archetype labels are not mechanics.', characters:CHARACTERS.map(stripArt), items:ITEMS.map(stripArt), essences:ESSENCES.map(stripArt), legacyImplementationNotes:LEGACY },null,2)+'\n');
console.log(`${CHECK ? 'Verified' : 'Generated'} ${generated} files: 90 characters, 64 relics, 32 essences, 3 indexes, 4 data pages, 1 data snapshot.`);
