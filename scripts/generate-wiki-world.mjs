import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS, characterById } from '../src/content.js';
import { SYNERGIES } from '../src/synergies.js';
import { ENEMY_DEBUFFS } from '../src/enemy-effects.js';
import { RETIREMENT_RULES } from '../src/retirements.js';
import { difficultyHealthMultiplier } from '../src/difficulty.js';

// Version-pinned prose plus live, audited content indexes. This script writes
// only its own Wiki pages and does not change game content or rules.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs/wiki');
const check = process.argv.includes('--check');
const mismatches = [];
const revision = 'e5557f8d6b3ee0a0c308c5a3ca0481d3701db229';
const sourceRoot = `https://github.com/jjhe2020/starrail-landlord/blob/${revision}/`;
const link = (name, page) => `[${name}](${page})`;
const card = id => link(characterById(id).name, `Card-${id}`);
const source = (file, lines, label = file) => `[${label}](${sourceRoot}${file}#L${lines.replace('-', '-L')})`;
const nav = (name, page) => `${link('首页', 'Home')} › ${link(name, page)}`;
const footer = (...refs) => `\n\n---\n\n本页基线：**v0.7.0**，提交 \`${revision}\`。规则来源：${refs.join('；')}。\n`;
const save = async (name, text) => {
  const filename = path.join(out, `${name}.md`);
  const expected = text.trim() + '\n';
  if (!check) return fs.writeFile(filename, expected);
  let actual;
  try { actual = await fs.readFile(filename, 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    mismatches.push(`${name}.md (missing)`);
    return;
  }
  if (actual !== expected) mismatches.push(`${name}.md (out of date)`);
};
if (!check) await fs.mkdir(out, { recursive: true });

const synergyDetails = {
  astral: {
    formula: '每位登场列车来源，对八邻域内每位非列车攻击者加 `b × S × O` 威力；`b = 0.35 / 0.6`，`S = 来源的星级倍率`，`O = 羁绊进攻系数`。',
    detail: '来源不限攻击职能，列车辅助也能接力；受益者必须同时满足非列车、攻击职能、攻击方式不是辅助。邻接不跨行边界。多个列车来源的平加可累加，不会把目标变成列车成员。此效果属于相邻威力增益，还会经过通用辅助放大入口：纯美骑士精神可放大它；敌方“邻接隔断”只针对角色来源，不能直接削弱这项羁绊来源。',
    related: [['相邻位置', 'Board-and-Targeting'], ['纯美骑士精神', 'Relic-harmony_wax']],
  },
  belobog: {
    formula: '本轮有贝洛伯格角色未被消耗且实际在场时，全队首次普通攻击击破产生 `4 / 8` 基础护盾，每轮全局一次。',
    detail: '击破者可以不属于贝洛伯格；所需的是贝洛伯格同伴在场。羁绊/角色技能的追加伤害击破不会触发普通攻击的 kill 入口。该护盾再经过通用护盾增益、折价与 `2 × 生命上限` 总护盾上限，生成后可以跨轮保留。',
    related: [['护盾与反击', 'Combat'], ['护盾折价', 'EnemyEffect-shield_audit']],
  },
  station: {
    formula: '每位登场的空间站攻击者，在自己的累计实际登场计数 `ticks = 3, 6, 9, …` 时，本轮加 `1 / 2 × S × O` 威力。',
    detail: '每个实例单独计数；不是本关第 3 轮，也不是空间站全队共享计数。登场计数先递增，再检查周期；本关以外累积的计数仍保留。平加只持续本轮，永久成长不变。',
    related: [['登场计数与星级', 'Growth-and-Stars'], ['黑塔', 'Card-1013']],
  },
  hunters: {
    formula: '本轮至少有两种符合非临时筛选的星核猎手身份登场时，每位登场的猎手攻击者，在普通攻击后追加 `0.2 / 0.35 × P × O` 基础伤害。',
    detail: '两种身份可包括辅助职能；真正发动追击者仍须为攻击职能。同名重复实例不增加身份数，但达成门槛后，每个合格攻击实例各追击一次。追击以来源所在列选择最近的存活敌列，允许在原列已空时转向，不触发普通攻击击破追击。',
    related: [['追击和易伤', 'Combat'], ['不同身份同场', 'Synergies']],
  },
  xianzhou: {
    formula: '本轮有仙舟角色实际在场时，在攻击后产生 `0.5 / 1 × min(H, 6)` 基础护盾；`H` 为此时已累计的本轮实际治疗量。基础上限为 `3 / 6`。',
    detail: '治疗溢出不计入 H；此前在补给界面使用的固定维修也不属于这次转动的 H。转换产生的基础护盾仍经过通用护盾倍率，故最终实际生成量可以高于 3 / 6，也可能被总护盾上限截断。多名仙舟角色不会重复执行本效果。',
    related: [['实际治疗和溢出', 'Combat'], ['丰饶', 'Synergy-abundance']],
  },
  hunt: {
    formula: '每位登场巡猎攻击者首次通过普通攻击击破时，向来源列最近存活敌人追加 `0.6 × P × O` 基础伤害；每来源每轮一次。',
    detail: '来源实例必须亲自完成普通攻击击破；编队里有巡猎但没有登场，或由其他角色击破，都不满足。追加伤害仍受装甲和适用易伤影响，击破后不递归触发本羁绊。若已无敌人，追击没有伤害目标。',
    related: [['普通攻击击破', 'Combat'], ['希儿', 'Card-1102']],
  },
  destruction: {
    formula: '效果收集阶段生命满足 `HP / 最大HP ≤ 0.5` 时，登场毁灭攻击者获得本轮倍率 `1 + (0.2 / 0.35) × O`。',
    detail: '条件在攻击前的羁绊 spin 阶段判断，此前的登场治疗、生命消耗会影响判定；不是看开轮前生命。倍率与其他倍率按各自规则合成，不主动消耗生命，也不会提高永久成长。',
    related: [['效果时序', 'Effects-and-Timing'], ['满血溢价', 'EnemyEffect-healthy_audit']],
  },
  erudition: {
    formula: '每位登场智识攻击者本轮加 `0.4 / 0.8 × min(5 − 存活敌列数, 4) × S × O` 威力。',
    detail: '使用攻击前的空敌列数量。第 1 层原本只有三列敌人，因此开场已有两列可计；不是统计己方空格，也不是随着本轮每次击破即时追加。没有永久成长。',
    related: [['敌阵列数', 'Difficulty'], ['群体攻击', 'Combat']],
  },
  nihility: {
    formula: '在当前遭遇第 `2, 4, 6, …` 次转动，登场虚无攻击者于普通攻击后追加 `0.25 / 0.45 × P × O` 基础伤害。',
    detail: '这是当前关的 round 周期，不是来源实例的 ticks 周期；换关从第 1 次转动重置。追加伤害向来源列最近存活敌人结算，无跨轮持续伤害状态，也不再次触发击破技能。',
    related: [['转动与登场计数', 'Effects-and-Timing'], ['虚无审查', 'EnemyEffect-path_nihility']],
  },
  preservation: {
    formula: '只要有存护角色实际在场，攻击前产生 `3 / 6` 基础护盾。反击后仍存活时，再造成 `0.25 / 0.5 × round2(实际护盾抵伤) × O` 基础追击伤害，每轮全局一次。',
    detail: '反击来源格取本轮最终威力最高的攻击职能实例（同威力取较小格索引），从其列寻找最近存活敌人。伤害基于真正消耗的护盾值，不按生成护盾、反击总额或生命损失计算。没有攻击者则无追击；生命降为 0 时也不执行。最强来源可以不是存护。',
    related: [['反击结算', 'Combat'], ['贯穿反击', 'EnemyEffect-shield_pierce']],
  },
  abundance: {
    formula: '本轮有丰饶角色实际在场时，攻击后增加反击平减 `min(H / 3, 3)`，允许小数。',
    detail: 'H 为截至该阶段的本轮实际恢复生命；满血溢出无效，补给界面的维修不计入这次转动。每轮只产生一份平减，不按丰饶人数复制。该平减与其他平减相加后，受敌方原始反击 45% 的通用上限约束。',
    related: [['反击公式', 'Combat'], ['仙舟同盟', 'Synergy-xianzhou']],
  },
  harmony: {
    formula: '同谐来源适用的辅助增益系数乘 `1.25 / 1.45`；平加直接放大，倍率只放大超出 1 的增益部分。',
    detail: '本效果提供被动 buffMultiplier，目标筛选依据增益来源的命途。对现行角色，放大器职能提供的威力增益会进入该辅助入口；相邻、最强定向效果也会进入。它不会额外增加登场人数、治疗、护盾或永久成长。多个角色技能的倍率仍受放大器合成 2.2 上限，详见战斗公式。',
    related: [['辅助乘区', 'Combat'], ['同谐隔离', 'EnemyEffect-path_harmony']],
  },
  ice: {
    formula: '本轮反击平减增加 `0.5 / 1 × min(N, 3)`；N 是实际登场、符合非临时筛选的冰属性不同身份数。基础平减上限 `1.5 / 3`。',
    detail: '重复冰实例、升星均不增加 N。身份计数还与编队激活数分开：前者看本轮棋盘，后者看永久编队。名称“冻结”不代表冻结敌人或跳过反击，仍按通用反击减伤公式计算。',
    related: [['身份计数口径', 'Synergies'], ['反击公式', 'Combat']],
  },
  lightning: {
    formula: '每位登场雷攻击者在其效果执行时若至少仍有两列敌人，向来源格以外最近的存活敌列追加 `0.2 / 0.35 × P × O` 基础伤害。',
    detail: '排除的是来源棋盘列，不一定等于普通攻击最终攻击过的列。其他列距离相同则取左列；若前面来源的追加伤害已使敌列数降到 1，后面来源不再触发。没有连锁电弧，也不触发普通攻击击破回调。',
    related: [['目标与距离', 'Board-and-Targeting'], ['追加伤害', 'Combat']],
  },
  fire: {
    formula: '当前遭遇第 1 次转动，每位登场火攻击者加 `2 × S × O` 威力。',
    detail: '这不是角色第一次登场；第 1 次转动没抽中的火角色，在本关以后登场不会补领。新关 round 重置，重新获得首轮机会。不写入永久成长。',
    related: [['关卡流程', 'Run-Flow'], ['星级倍率', 'Growth-and-Stars']],
  },
  wind: {
    formula: '普通攻击后，每位登场风攻击者在其羁绊效果执行时若敌人仅剩 1–2 列，追加 `0.25 / 0.45 × P × O` 基础伤害。',
    detail: '逐个来源重看当前存活列数：前一个来源清空最后敌列后，后续来源不再满足条件。向来源列最近存活敌人攻击；原列没有敌人也可转向。不跨轮积累收割次数。',
    related: [['阶段与顺序', 'Effects-and-Timing'], ['目标选择', 'Board-and-Targeting']],
  },
  quantum: {
    formula: '本轮至少三种符合非临时筛选的量子身份登场时，选择本轮最终威力最高的量子攻击者，追加 `0.7 / 1.2 × P × O` 基础伤害，每轮全局一次。',
    detail: '满足三身份条件的角色可以有辅助职能，但发动者必须为量子攻击职能；同威力取棋盘索引较小者。该来源的普通攻击即使没有击破也能合击。按本次棋盘重新判断，不跨轮积攒量子身份或进度。',
    related: [['最强目标', 'Board-and-Targeting'], ['同场概率', 'Synergies']],
  },
  physical: {
    formula: '每位登场物理角色首次通过普通攻击击破时，产生 `2` 信用点；每来源每轮一次。',
    detail: '本条是资源效果，不受羁绊进攻系数 O 放大或征收。其成员筛选本身不限制攻击职能，但当前辅助角色不执行普通攻击，通常不能亲自完成该击破。追加伤害的击破不进入这项普通攻击 kill 触发。信用点保留至消费。',
    related: [['信用点', 'Economy'], ['击破判定', 'Combat']],
  },
  imaginary: {
    formula: '有任意虚数角色实际在场时，本轮反击倍率乘 `0.85`，每轮全局一次。',
    detail: '不同虚数来源不重复乘 0.85。该倍率与其他反击倍率相乘后受最低 0.4 的乘区下限约束；平减在倍率前执行。不会让敌人跳过整轮，也没有可叠层的禁锢状态。',
    related: [['反击公式', 'Combat'], ['瓦尔特', 'Card-1004']],
  },
  remembrance: {
    formula: '有任意记忆角色实际在场时，本轮全部临时攻击者加 `1 / 2 × O` 威力，每轮全局一份。',
    detail: '受益者须为 temporary 筛选下的攻击职能，包括本轮完成最后一次登场、已标记 expired 但尚未离场的临时角色。见习委派 commission 不属于临时角色。没有按记忆来源人数或星级放大，也不延长临时登场期限。',
    related: [['临时角色', 'Growth-and-Stars'], ['委派', 'Assignments']],
  },
  ipc: {
    formula: '进入新遭遇的 floor 触发时，编队达到门槛即获得 `5 / 8` 信用点，每关一次。',
    detail: '无需公司角色在当轮棋盘出现；在关内刚凑出公司羁绊不会立刻补领当前关预算，需等下次入关。读取说明、保存或重载不触发 floor，也不能重复领取。资源不受香涎干酪或羁绊征收影响。',
    related: [['入关时序', 'Run-Flow'], ['信用点', 'Economy']],
  },
};

const synergyRows = SYNERGIES.map(s => `| ${link(s.name, `Synergy-${s.id}`)} | ${s.kind === 'faction' ? '阵营' : s.kind === 'path' ? '命途' : '属性'}：${s.tag} | ${s.thresholds.join(' / ')} | ${s.description} |`).join('\n');
await save('Synergies', `# 羁绊\n\n${nav('机制索引', 'Mechanics')}\n\n羁绊由公开的阵营、命途、属性激活。当前共有 **21** 项；没有隐藏“套路”成型奖励。它们先检查编队身份，再按各条规则检查实际登场、位置、轮次或击破。\n\n## 激活人数与实际登场\n\n编队计数的算法是：筛掉 temporary 与 commission 实例，再按角色 id 去重，最后统计公开标签相符的身份数。重复副本、二星/三星不额外加人数；见习委派和临时援军不增加激活人数。达到高档门槛后直接使用高档效果，低档不会继续叠加。\n\n羁绊激活不代表每次都有效。除公司入关预算等明确例外，仍要实际抽中相应来源或满足同场条件。每次转动抽出棋盘后、委派消耗前，先固定本次使用的激活羁绊列表；即便某个普通受体随后被委派离队，本次转动仍沿用该列表，下次再重新计算。被消耗者不继续贡献本轮登场条件或技能。\n\n“不同身份同场”按 id 去重。“非临时”筛选在当前实现中是排除 temporary 和 expired，**没有自动排除 commission**。因此见习不增加编队激活人数，但可作为已激活羁绊的同场身份，或作为成员触发来源。普通 present 条件未排临时；如仙舟、存护、丰饶、虚数、记忆，只要相符的未消耗角色确实在场即可。各条目说明具体筛选。\n\n## 共用公式与作用范围\n\n各条目使用：\n\n- \`S\`：来源当前星级倍率，通常一星/二星/三星为 \`1 / 3 / 9\`；升星差额税使高星有效倍率再乘 0.8。\n- \`P\`：来源本轮已算出的最终威力，包含其适用成长、平加、倍率与条款；追加伤害随后仍走命中装甲/易伤公式。\n- \`O\`：羁绊进攻系数，\`(持有香涎干酪 ? 1.5 : 1) × (有羁绊征收 ? 0.75 : 1)\`。二者并存为 1.125。\n\nO 只修正羁绊 power、damage，以及 powerMultiplier 超过 1 的部分；护盾、治疗、减伤、信用点、次数与持续时间不会随之放大。直接增加威力或伤害的羁绊效果统一限制受益者/发动者为攻击职能且非辅助攻击方式；没有把辅助转为直接输出的隐藏机制。\n\n本轮威力、减伤在轮末清空；护盾和信用点是可保留资源，仍受自身上限与消耗规则约束。普通攻击触发的击破效果不被角色或羁绊追加伤害递归触发。位置、最强目标、伤害与辅助乘区分别见[棋盘与目标](Board-and-Targeting)、[战斗](Combat)、[效果时序](Effects-and-Timing)。\n\n## 完整列表\n\n| 羁绊 | 标签 | 激活身份数 | 机制摘要 |\n| --- | --- | --- | --- |\n${synergyRows}\n\n## 同场概率的复原方法\n\nAI 可计算“至少 1–3 种不同身份被抽中”的精确无放回概率；这不消耗种子随机数，也不把上一轮棋盘当下一轮结果。设编队总实例 N，抽取 d=min(20,N)，匹配标签的身份 j 拥有 n_j 份，非匹配实例 B=N−Σn_j。定义 \`Q(a)=C(a,d)/C(N,d)\`，a<d 时为 0。\n\n无匹配身份概率为 \`p0=Q(B)\`；恰有一种为 \`p1=Σj[Q(B+n_j)−Q(B)]\`；恰有两种为 \`p2=Σj<k[Q(B+n_j+n_k)−Q(B+n_j)−Q(B+n_k)+Q(B)]\`。至少 1/2/3 种分别是 \`1−p0\`、\`1−p0−p1\`、\`1−p0−p1−p2\`，结果夹在 0–1。正式羁绊最多使用三身份同场门槛；函数对更高门槛的备用近似不是本版新增规则。\n\n重复副本只提高对应身份被抽中的概率，不增加不同身份数。条件还可能要求位置或敌人状态；满足同场身份概率不等于完整技能触发概率。\n\n相关：[角色总览](Cards) · [招募与稀有度](Draft-and-Rarity) · [成长与星级](Growth-and-Stars) · [敌方条款](Enemy-Effects) · [委派](Assignments)。${footer(source('src/synergies.js', '3-50'), source('src/synergies.js', '71-100'), source('src/engine.js', '72-194'), source('src/effect-rules.js', '57-163'), source('tests/synergies.test.js', '1-133'))}`);

for (const s of SYNERGIES) {
  const detail = synergyDetails[s.id];
  const members = CHARACTERS.filter(c => c[s.kind] === s.tag);
  await save(`Synergy-${s.id}`, `# ${s.name}\n\n${nav('羁绊', 'Synergies')}\n\n> ${s.description}\n\n| 项目 | 规则 |\n| --- | --- |\n| 公开标签 | ${s.kind === 'faction' ? '阵营' : s.kind === 'path' ? '命途' : '属性'}：${s.tag} |\n| 激活门槛 | 永久编队中 ${s.thresholds.join(' / ')} 种不同角色身份 |\n| 档位 | ${s.thresholds.map((n,i) => `${n} 身份为第 ${i+1} 档`).join('；')}；高档替换低档 |\n| 内部识别码 | \`${s.id}\` |\n\n## 触发与计算\n\n${detail.formula}\n\n${detail.detail}\n\n本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。\n\n## 可提供该标签的角色\n\n${members.map(c => card(c.id)).join(' · ')}。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。\n\n## 关联机制\n\n${detail.related.map(([n,p])=>link(n,p)).join(' · ')} · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。${footer(source('src/synergies.js', `${15 + SYNERGIES.indexOf(s)}`), source('src/synergies.js', '38-50'), source('src/engine.js', '72-194'), source('src/effect-rules.js', '57-163'))}`);
}

const eligibility = {
  path_hunt:'编队存在巡猎角色。', path_destruction:'编队存在毁灭角色。', path_erudition:'编队存在智识角色。', path_nihility:'编队存在虚无角色。', path_preservation:'编队存在存护角色。', path_abundance:'编队存在丰饶角色。',
  path_harmony:'编队至少有两个实例，且有同谐角色定义了定向威力增益。定向包括相邻、同行、同列、同行同列、最强、匹配筛选或 strongest 选择，不检查本轮是否真的相邻。',
  attack_single:'编队存在单体攻击方式角色。', attack_blast:'编队存在扩散攻击方式角色。', attack_aoe:'编队存在群体攻击方式角色。',
  growth_audit:'可用的持续效果定义中存在 growth。来源可为编队角色、持有奇物、已触发精华、已激活羁绊；只靠委派增长本身不会额外被本资格函数识别。',
  adjacency_audit:'编队至少有两个实例，且有任意角色定义定向威力增益。定向口径与同谐隔离相同，不要求当前棋盘已经摆出相邻。',
  star_audit:'编队存在星级大于 1 的实例。',
  summon_audit:'编队至少一位角色的技能定义含 damage；只持有奇物或羁绊追加伤害不会因此入池。名称“追击登记”不是召唤被削弱。',
  consume_audit:`编队存在 ${card('1109')}。`, danheng_audit:`编队存在 ${card('1002')}。`, herta_audit:`编队存在 ${card('1013')}。`, qingque_audit:`编队存在 ${card('1201')}。`, seele_audit:`编队存在 ${card('1102')}。`, kafka_audit:`编队存在 ${card('1005')}。`, welt_audit:`编队存在 ${card('1004')}。`, fuxuan_audit:`编队存在 ${card('1208')}。`, march_audit:`编队存在 ${card('1001')}。`, natasha_audit:`编队存在 ${card('1105')}。`,
  essence_audit:'已持有至少一个尚未触发的精华。',
  synergy_audit:'至少一项已激活羁绊的当前档位含 power、powerMultiplier 或 damage。只有经营、治疗、防护、辅助倍率的羁绊不因此入池。',
  healing_audit:'持续效果中存在 heal 或 healOverflowShield，且其生成前提通过资格检查；仅有已经领取的 acquire 一次性治疗或治疗倍率不够。',
  shield_audit:'目前护盾大于 0，或持续效果中存在可用 shield / healOverflowShield；按治疗量转盾还须存在可用治疗来源。',
  shield_pierce:'与护盾折价相同：已有护盾或存在可用的持续护盾来源。',
  shield_decay:'与护盾折价相同：已有护盾或存在可用的持续护盾来源。',
  healthy_audit:'编队存在非辅助攻击方式角色，并且选取时生命严格高于上限一半。',
  rift_pollution:'固定出现在第 4、6、8、10、12 层入关；必须存在非临时一星实例。它不进入随机条款池。',
};
const clauses = {
  path_hunt:['巡猎角色本轮最终威力乘 0.8。','与攻击方式税、满血溢价、污染和其他威力倍率相乘；技能引用最终威力的追击也随来源威力变化。', ['Synergy-hunt']],
  path_destruction:['毁灭角色本轮最终威力乘 0.8。','不直接削减永久成长数值，也不等于生命消耗变少。', ['Synergy-destruction']],
  path_erudition:['智识角色本轮最终威力乘 0.8。','先计算适用的平加与其他倍率，再在最终威力乘区应用；装甲仍按每次命中另扣。', ['Synergy-erudition']],
  path_nihility:['虚无角色本轮最终威力乘 0.8；虚无角色技能的 vulnerability、retaliationFlat 减益量乘 0.8；retaliationMultiplier 按 `1 + (原倍率−1) × 0.8` 缩小减伤部分。','可以同时降低输出和控制效果；如瓦尔特专属条款并存，其平减再乘 0.5。它不会直接把羁绊虚无的 damage 系数乘 0.8，但以最终威力为基数的伤害仍受来源威力下降影响。',['Synergy-nihility','Card-1004']],
  path_preservation:['存护角色来源的新护盾量乘 0.75。','与角色专属护盾税及全局护盾折价相乘；不把已有护盾余额立即乘 0.75。羁绊、奇物护盾没有存护角色来源身份，不直接受这项命途税。',['Synergy-preservation','EnemyEffect-shield_audit']],
  path_abundance:['丰饶角色来源的治疗请求量乘 0.75。','最终仍只记实际恢复生命，溢出另按具体技能处理；与娜塔莎专属税、全局医疗折价乘算。',['Synergy-abundance','EnemyEffect-healing_audit']],
  path_harmony:['同谐角色适用的威力平加增益乘 0.7；倍率增益按 `1 + (原倍率−1) × 0.7`。','实际削减发生在通用辅助增益入口：现行放大器角色的威力增益，或相邻/最强定向效果。资格是定义检查，不保证选中后本轮一定触发；不会削减同谐羁绊提供的 buffMultiplier 本身。',['Synergy-harmony','EnemyEffect-adjacency_audit']],
  attack_single:['单体攻击方式角色本轮最终威力乘 0.8。','与巡猎征税可同时存在，此时相应单体巡猎为 0.8 × 0.8 = 0.64；不直接改变目标数量。',['Combat','EnemyEffect-path_hunt']],
  attack_blast:['扩散攻击方式角色本轮最终威力乘 0.8。','主目标和两侧扩散都使用被削减的威力；不会删除扩散侧击。',['Combat']],
  attack_aoe:['群体攻击方式角色本轮最终威力乘 0.8。','仍对所有存活敌列分别命中；每列按自己的剩余生命与装甲结算。',['Combat']],
  growth_audit:['本关新增永久成长乘 0.5。包括角色 growth 效果和委派成长；已有成长不变。','与鲁珀特帝国机械齿轮 1.5、成长被动和丹恒自身成长审计乘算。条款清除后此前少获得的成长不补发。',['Growth-and-Stars','Assignments','Relic-rubert_gear']],
  adjacency_audit:['适用的角色来源辅助威力平加乘 0.6；倍率增益按 `1 + (原倍率−1) × 0.6`。','不是阻断相邻格，也不删除角色。与同谐隔离相乘时，增益部分系数为 0.6 × 0.7 = 0.42；来源为羁绊的列车接力不走角色 utilityMultiplier，因此不直接受此税。',['Board-and-Targeting','EnemyEffect-path_harmony']],
  star_audit:['二星/三星有效标准星级倍率由 3/9 变为 2.4/7.2，即乘 0.8；一星仍为 1。','凡通过 starMultiplier 的基础威力或 scaleWithStars 技能都受影响；自定义星级因子也通过实际/标准倍率换算而乘 0.8。永久成长余额不直接减为 80%，没有 scaleWithStars 的固定倍率技能不因这条款自动降低。羁绊按星级的威力平加与委派当轮奖励也会使用此有效倍率。',['Growth-and-Stars','Assignments']],
  summon_audit:['所有当前角色定义的 damage 技能伤害量乘 0.75。','只针对 character 来源的追加伤害；普通攻击、羁绊 damage、奇物 damage 不直接乘此系数。与虎克/黑塔/希儿专属追加税可乘算为 0.375。',['Combat','EnemyEffect-consume_audit','EnemyEffect-herta_audit','EnemyEffect-seele_audit']],
  consume_audit:[`${card('1109')} 的角色 damage 技能伤害乘 0.5。`,'当前实现按虎克来源的 damage 效果类型应用，普通攻击与委派当轮平加不直接削减；与追击登记并存为 0.375。',['Card-1109','EnemyEffect-summon_audit']],
  danheng_audit:[`${card('1002')} 的角色技能中，target=self 的新增 growth 量乘 0.5。`,'已有成长不变；与全局成长折旧并存时对应新增自身技能成长为原值 25%。委派主持者瓦尔特的成长不是丹恒自身技能，不受此专属税。',['Card-1002','EnemyEffect-growth_audit','Assignment-express_archives']],
  herta_audit:[`${card('1013')} 的角色 damage 技能伤害乘 0.5。`,'当前黑塔周期追击受此税，普通攻击不直接乘 0.5；若追击登记同时存在则伤害量乘 0.375。',['Card-1013','EnemyEffect-summon_audit']],
  qingque_audit:[`${card('1201')} 自身 powerMultiplier 技能把倍率变为 \`1 + (M−1) × 0.5\`。`,'未培养的 M=2.35 时为 1.675；培养先扩大倍率增益部分，再折半该部分。不是整体倍率乘 0.5，也不是随机触发概率降低。',['Card-1201','Growth-and-Stars']],
  seele_audit:[`${card('1102')} 的角色 damage 技能伤害乘 0.5。`,'专属击破追击被削减；巡猎羁绊的追加属于 synergy 来源，不直接受此专属税，仍可能因来源最终威力税间接受影响。',['Card-1102','Synergy-hunt']],
  kafka_audit:[`${card('1005')} 的 vulnerability 技能量乘 0.5。`,'若同时有虚无审查，易伤量为原量 0.5 × 0.8 = 0.4；仍汇入每个适用攻击实例合计最高 75% 的易伤增伤。',['Card-1005','EnemyEffect-path_nihility','Combat']],
  welt_audit:[`${card('1004')} 的 retaliationFlat 技能平减量乘 0.5。`,'与虚无审查可乘算为 0.4；所有平减相加后仍受原始反击 45% 的上限约束。',['Card-1004','EnemyEffect-path_nihility','Combat']],
  fuxuan_audit:[`${card('1208')} 的 retaliationMultiplier 技能按 \`1+(原倍率−1)×0.5\`。`,'未培养时原倍率 0.88 变 0.94，即 12% 减伤变 6%；不是最终伤害或护盾直接减半。',['Card-1208','Combat']],
  march_audit:[`${card('1001')} 的新护盾量乘 0.5。`,'若同时有存护折旧与护盾折价，三项相乘为 0.5 × 0.75 × 0.75 = 0.28125，然后叠适用正面倍率与总盾上限。',['Card-1001','EnemyEffect-path_preservation','EnemyEffect-shield_audit']],
  natasha_audit:[`${card('1105')} 的治疗请求量乘 0.5。`,'若同时有丰饶限流与医疗折价，三项相乘为 0.5 × 0.75 × 0.75 = 0.28125；记录的实际治疗仍受缺失生命限制。',['Card-1105','EnemyEffect-path_abundance','EnemyEffect-healing_audit']],
  essence_audit:['本轮未触发精华的新进度获取量乘 0.75。','已有进度保留；与 essenceProgressMultiplier 被动相乘。先对全部精华用本轮完成时的快照结算进度，再领取触发奖励；不让同轮刚解锁的奖励反过来放大本轮其他精华进度。',['Essences','Effects-and-Timing']],
  synergy_audit:['羁绊 power 与 damage 的效果量乘 0.75；powerMultiplier 按 `1+(M−1)×0.75`。','描述里的“威力加成”覆盖羁绊追加伤害。资源、护盾、减伤、buffMultiplier 不直接受税。与香涎干酪 1.5 相乘的净进攻系数为 1.125。',['Synergies','Relic-divination_candle']],
  healing_audit:['通用非固定治疗请求量乘 0.75。','角色、羁绊、奇物、精华调用非固定治疗入口均适用；信用补给的固定维修仍为原固定治疗量，但实际恢复不会超过缺失生命。余额生命不会即时减少。',['Combat','Economy']],
  shield_audit:['通用非固定新护盾生成量乘 0.75。','已有护盾余额不即时减少。信用补给的固定护盾仍按固定生成量，仍受 2×最大生命的总盾上限。角色专属、命途护盾税可继续乘算。',['Combat','Economy']],
  shield_pierce:['设减伤后的反击为 I，直接贯穿部分 `0.25I`；可抵挡部分为 `0.75I`。实际盾挡 `B=min(已有护盾,0.75I)`，生命损失 `I−B`。','它不产生额外 25% 伤害，而是让原反击的一部分绕盾。存护羁绊反击只按 B 算；哪怕总盾足够，仍会损失贯穿部分生命。',['Combat','Synergy-preservation']],
  shield_decay:['每次转动开始、抽棋盘之前，已有护盾改为 `round2(护盾 × 0.8)`。','本轮随后新生成护盾不会在同一开轮再衰减；这一损失不算护盾抵挡，不触发存护抵伤反击。若首领轮数分期在本轮开始新增此条款，会立即衰减。',['Effects-and-Timing','Difficulty']],
  healthy_audit:['最终威力结算时，若生命严格高于最大生命一半，非辅助攻击方式角色威力乘 0.85；等于半血时不生效。','选取资格和每轮生效判定分开：条款留到关末，但跌到半血时暂时无惩罚，治疗回半血以上又恢复。以攻击前完成登场治疗/自伤后的生命判断。',['Combat','Synergy-destruction']],
  rift_pollution:['被标记 UID 真正抽中时，先直接消耗 6 生命（不经护盾），最低可到 0；该实例本轮威力乘 0.5，同时全部非辅助攻击方式角色本轮最终威力统一乘 0.85。','目标按非临时一星实例的“角色基础威力＋永久成长”升序取最低，平手按英文 locale 的 UID 字符串排序；不是按数值 UID 排序。代码未排除 commission，所以见习委派也可能被标记。只标记一个实例，其他同名副本不支付 6 生命也不承担个人 0.5，但仍承担当轮全队 0.85。没有抽中目标时，扣血与全队税都不触发。个人威力税即便目标为辅助也保留，辅助治疗、护盾量不受个人或全队威力税直接影响。若扣血致死，在治疗、技能、普通攻击之前立即败北。移除、合成或委派离队后解除标记，不转移目标；换关清空。',['Growth-and-Stars','Assignments','Economy','Saves-and-Offline']],
};

const relatedName = page => page.startsWith('Card-') ? characterById(page.slice(5)).name : page.startsWith('EnemyEffect-') ? ENEMY_DEBUFFS.find(e=>e.id === page.slice(12))?.name || page : page.startsWith('Synergy-') ? SYNERGIES.find(s=>s.id === page.slice(8))?.name || page : ({Combat:'战斗', 'Growth-and-Stars':'成长与星级', Assignments:'委派', Economy:'经济', Synergies:'羁绊', Difficulty:'难度与敌阵', 'Board-and-Targeting':'棋盘与目标', 'Effects-and-Timing':'效果与时序', Essences:'精华', 'Saves-and-Offline':'存档与离线', 'Relic-rubert_gear':'鲁珀特帝国机械齿轮', 'Relic-divination_candle':'香涎干酪', 'Assignment-express_archives':'智库外勤归档'}[page] || page);
const enemyRows = ENEMY_DEBUFFS.map(e=>`| ${link(e.name, `EnemyEffect-${e.id}`)} | ${e.fixed ? '固定指定实例' : '随机，须通过资格筛选'} | ${e.description} |`).join('\n');
await save('Enemy-Effects', `# 敌方条款\n\n${nav('难度与敌阵', 'Difficulty')}\n\n条款是当前遭遇对已有机制的定向削弱。当前有 **31 项随机条款＋1 项固定裂界污染**。它们与每关自带的四种[敌阵技能](Difficulty)是两个独立系统。随机条款不永久禁用角色，也不把职业或技能从存档里删除。\n\n## 选取、持续与新增时点\n\n每次需要追加随机条款时，重新建立符合资格的池子，排除固定污染和已存在的同 id 条款，再用种子随机数从余下项目中等概率取一个。没有合格项则此次不追加。不是从全部 31 项盲抽后再改成相关条款，也没有按稀有度赋权。\n\n第 4 层起入关追加一项来源为 difficulty 的随机条款；每逢 3 的倍数首领层，阶段 1 入关另加一项来源为 boss 的条款，升到阶段 2、3 各再尝试加一项。两种来源共用去重池。首领生命与轮数阈值、同轮生效时点见[难度与敌阵](Difficulty)。污染另在固定层数指定 UID。所有条款在下一关 setupFloor 时清空并重新选取。\n\n资格只影响抽选时能否进入池子。选中后不会因条件暂时消失自动重抽；例如满血溢价的生命条件是每轮动态判定，角色已离队的专属条款则暂时没有受影响对象。持有新角色也不会自动加一个新条款。\n\n## 资格筛选的准确口径\n\n命途、攻击方式、指定角色检查的是当前 roster，包含临时援军和见习实例，**不同于羁绊的永久身份计数**。技能来源检查读取角色、持有奇物、已触发精华、已激活羁绊的真实定义；跳过 acquire 一次性效果，不从存档中的文字说明执行规则。\n\n判断治疗/护盾可用性时，若效果依赖退场计数或 temporary 受体，资格函数要求现有临时实例或持续召唤来源；它不会仅因正式委派未来可能发生就推断这些来源可用。治疗转盾还要求有可用治疗来源，单独持有仙舟同盟不保证进入护盾条款池。已有护盾大于 0 本身足以让护盾三类条款入池。\n\n定向增益资格读取技能 target 为 adjacent、row、column、aligned、strongest、matching，或 selection=strongest；不做本轮摆位模拟。实际生效仍须通过技能本身的位置和公开标签条件。\n\n## 完整条款列表\n\n| 条款 | 获得方式 | 游戏内摘要 |\n| --- | --- | --- |\n${enemyRows}\n\n## 叠加原则\n\n不同威力税相乘；不同护盾/治疗税也在相应生成入口相乘。倍率技能被削弱时通常只压缩距离 1 的增益/减伤部分，不能把“增益降低 50%”误读为所有最终伤害乘 0.5。例：2.35 倍青雀技能变 1.675；符玄 0.88 反击倍率变 0.94。\n\n这些条款不会把已有永久成长、已有精华进度或已有护盾即时扣回；护盾滞纳金和污染扣血是另外明确规定的持续损失。反击贯穿仍用同一份反击总额，不额外增加伤害。各入口与舍入见[战斗](Combat)、[效果时序](Effects-and-Timing)。\n\n相关：[羁绊](Synergies) · [角色](Cards) · [难度与敌阵](Difficulty) · [成长](Growth-and-Stars) · [经济补给](Economy)。${footer(source('src/enemy-effects.js', '4-131'), source('src/engine.js', '265-344'), source('src/engine.js', '650-684'), source('tests/enemy-effects.test.js', '1-251'), source('tests/pollution.test.js', '1-237'))}`);
for (const e of ENEMY_DEBUFFS) {
  const [formula, detail, related] = clauses[e.id];
  await save(`EnemyEffect-${e.id}`, `# ${e.name}\n\n${nav('敌方条款', 'Enemy-Effects')}\n\n> ${e.description}\n\n| 项目 | 规则 |\n| --- | --- |\n| 识别码 | \`${e.id}\` |\n| 来源 | ${e.fixed ? '固定污染层，source=difficulty，addedRound=0' : '难度入关条款或首领分期追加'} |\n| 持续 | 当前遭遇；换关清空${e.fixed ? '；指定实例消失/完成合成可提前解除' : ''} |\n| 重复 | 同 id 不重复随机选中 |\n\n## 获得资格\n\n${eligibility[e.id]}\n\n除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。\n\n## 实际效果与公式\n\n${formula}\n\n${detail}\n\n## 关联条目\n\n${related.map(p=>link(relatedName(p),p)).join(' · ')} · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。${footer(source('src/enemy-effects.js', `${30+ENEMY_DEBUFFS.indexOf(e)}`), source('src/enemy-effects.js', '6-25'), source('src/enemy-effects.js', '64-131'), source('src/engine.js', '265-344'), source('src/engine.js', e.fixed ? '650-684' : '72-194'), source('src/engine.js', '845-886'))}`);
}

const assignmentRows = RETIREMENT_RULES.map(r=>`| ${link(r.name, `Assignment-${r.id}`)} | ${card(r.sourceId)} → ${card(r.targetId)} | ${r.growth} | ${r.power} | ${r.coins} |`).join('\n');
await save('Assignments', `# 委派\n\n${nav('成长与星级', 'Growth-and-Stars')}\n\n委派是 **10 组固定角色关系**的自动结案机制：主持者在规定登场周期，派走一位相邻且合格的受体，换取永久成长、当轮威力和信用点。受体永久离队，语义是完成工作，不是死亡。角色关系借用原作背景，委派条件与收益是本游戏改编。十名受体的原作稀有度均为四星，这不是本游戏招募品质或实例星级的额外限制。\n\n## 触发时序\n\n转动抽出 5×4 棋盘后，按格索引从小到大处理主持者；本次普通登场技能和攻击尚未执行。主持者须为非 temporary、非 commission 且未被消耗的实例。对每个主持者，以 \`nextTick = 旧 ticks + 1\` 判断节奏：每第 3 次实际登场尝试结案，每第 4 次尝试补充见习。这些计数跨关保留，未抽中不前进；不是每关第三轮。补充见习先检查，随后检查结案。\n\n当次结案要求受体位于[八邻域](Board-and-Targeting)，并通过下列保护条件；每个主持者本次最多派走一个。受体立即标记 consumed，从本次技能、威力、攻击、同场条件中排除，轮末从 roster 真正移除。不相邻或周期不到则不结案，不从整支编队远程找人。\n\n## 受体保护与候选排序\n\n- 必须是该关系指定的目标角色 id；不能是主持者自身 UID。\n- 不能是临时角色、已有 status 或本轮已被消耗实例；所有二星/三星都受保护。\n- 普通正式一星实例永久成长必须 \`≤1\`；成长恰为 1 仍可，超过 1 则保护。\n- 普通受体需要编队里仍有至少两位未消耗的普通正式同名实例，保证保留最后一位；见习不算这份保底副本。\n- 见习受体仅可由相同关系 id 结案，不受“最后普通副本”限制；其 commission 必须匹配。\n\n多个候选时先选见习，再按永久成长升序、ticks 升序、UID 字符串升序选择。多名主持者按棋盘顺序先后处理，同一受体不能重复结案。内部测试“核心”或“套路”标记不会赋予额外保护。\n\n## 见习补充\n\n每逢主持者第 4、8、12…次登场，若该关系已解锁，且 roster 加待生成实例尚未达到 200，且该关系没有未消耗的见习等待中，则补充一个一星见习受体。解锁指当前拥有至少一位该受体的普通正式实例，或这组关系历史结案数大于 0。多个主持者共享**每关系最多一个待结案见习**，不能倍增供给。见习的 origin 记录创建者，但结案资格只检查关系 id；同关系的另一位正式主持者也能结案它，不要求 origin 等于自己的 UID。\n\n新见习在轮末加入 roster，下次抽取起才可登场；当轮生成的见习不能立刻被主持者结案。见习带 commission 与 origin 标记，不带 temporary，因而没有 1–3 次登场的过期计数。它会参与抽取、能使用自己的角色技能与攻击，也可作为下一次相邻结案受体；不参加自动合成，不增加羁绊编队身份数。现有技能筛选若没有明确排除 commission，仍可能让它受益或成为同场身份。\n\n## 收益与公式\n\n所有关系基本周期均为结案 3、供给 4。结案即时获得信用点，不要求主持者为攻击者。令 \`g\`、\`p\`、\`c\` 为下表数值，\`F星 = 1 / 1.5 / 2\`，\`T星 = 1 / 3 / 9\`：\n\n\`永久成长增加 = g × F星 × 高星税系数 × 齿轮系数 × 成长折旧系数 × 主持者适用成长被动\`\n\n高星税系数仅二/三星且有[升星差额税](EnemyEffect-star_audit)时为 0.8；齿轮为 1.5 或 1；成长折旧为 0.5 或 1。结果保留两位小数后写入主持者永久成长，攻击职能会在本轮基础威力阶段使用这份新成长；非攻击职能按通用培养公式增强专职技能，growth 技能本身不吃培养递归放大。\n\n只有攻击职能主持者获得 \`p × T星 × 高星税系数\` 当轮平加威力；不把这个平加留到下一轮。信用点增加固定 c，不按星级、培养或羁绊进攻增幅放大。寒鸦关系特例 g=0、p=0、c=3。\n\n| 关系 | 主持者 → 受体 | g：基础成长 | p：当轮威力 | c：信用点 |\n| --- | --- | --- | --- | --- |\n${assignmentRows}\n\n## 统计与其他系统\n\n每次结案增加本轮 retirements 和总退场数；普通受体另计 permanentRetirements，见习结案不增加该项。轮末 stats.destroyed 同时包含委派、临时消耗和临时过期，不能把这个字段当作死亡人数。每关系保存 completed、permanent、supplied，并校验总数与见习库存；存档不能靠伪造标记获得免费见习。界面预览中的 nextAppearance 取所有正式主持者到下一次三登场周期的最小距离，eligibleUids 只列资格合格受体，不保证它们下次会被抽中或相邻。\n\n本轮激活羁绊列表在委派前取得，所以本次普通受体离队不会追溯取消已取得的激活档位；下一次转动再重算。若受体是污染指定 UID，离队会清除污染，后续转动不再支付其污染代价；本轮污染在委派前已经扣掉的生命不会退还。\n\n相关：[成长与星级](Growth-and-Stars) · [效果时序](Effects-and-Timing) · [棋盘与目标](Board-and-Targeting) · [羁绊](Synergies) · [裂界污染](EnemyEffect-rift_pollution) · [信用点](Economy)。${footer(source('src/retirements.js', '1-43'), source('src/engine.js', '396-418'), source('src/engine.js', '439-480'), source('src/engine.js', '684-699'), source('src/engine.js', '890-898'), source('src/effect-rules.js', '119-145'), source('tests/retirements.test.js', '1-176'))}`);
for (const r of RETIREMENT_RULES) {
  await save(`Assignment-${r.id}`, `# ${r.name}\n\n${nav('委派', 'Assignments')}\n\n${card(r.sourceId)} 主持，派遣 ${card(r.targetId)} 结案。该关系使用全部[委派通则](Assignments)：每第三次实际登场、八邻域、目标保护、见习优先与候选排序均适用。\n\n| 项目 | 本关系 |\n| --- | --- |\n| 识别码 | \`${r.id}\` |\n| 主持者 | ${card(r.sourceId)}，正式实例 |\n| 受体 | ${card(r.targetId)}，合格普通一星或本关系见习 |\n| 结案周期 | 主持者第 3、6、9…次登场 |\n| 供给周期 | 已解锁后第 4、8、12…次登场；每关系最多 1 位待结案见习 |\n| 基础永久成长 | ${r.growth}，按一/二/三星 1 / 1.5 / 2 倍，再过成长修正 |\n| 当轮威力 | ${r.power ? `${r.power} × 有效标准星级倍率，仅攻击职能主持者` : '无'} |\n| 信用点 | ${r.coins}，固定，不按星级放大 |\n\n## 结案实例与效果\n\n必须在同一次棋盘抽取中抽到主持者与合格受体，并摆在八邻域；不能直接从编队移走未登场副本。普通受体须一星、永久成长不超过 1，且结案后仍保留至少一位普通正式同名角色。见习需 commission=${r.id}，不受最后普通副本保护。受体在普通技能与攻击之前离队，当轮不会贡献自己的技能、攻击或同场条件。\n\n${r.growth ? `成长在结案时写入主持者实例，基础 ${r.growth} 按 1 / 1.5 / 2 的专用星级因子计算；其余倍率与舍入详见[委派公式](Assignments)。` : '本关系不奖励永久成长，也不奖励当轮威力，以固定信用点结案。'}${r.power ? ` 攻击主持者还获得 ${r.power} × 1 / 3 / 9 的本轮平加威力，升星差额税会修正高星值。` : ''}\n\n补充见习需要当前拥有受体普通正式角色，或这组关系已有历史结案；见习轮末加入，下轮才能抽中。多个 ${card(r.sourceId)} 实例仍共享这组关系的一位见习上限。\n\n## 角色关系资料\n\n游戏定义采用的背景说明：${r.relation} 该说明为角色关系引用，委派节奏与收益属于本游戏改编；游戏登记的资料来源为[对应原作条目](${r.source})。\n\n## 关联机制\n\n[委派完整规则](Assignments) · [培养与永久成长](Growth-and-Stars) · [相邻与棋盘](Board-and-Targeting) · [信用点](Economy) · [升星差额税](EnemyEffect-star_audit) · [成长折旧](EnemyEffect-growth_audit)。${footer(source('src/retirements.js', `${4+RETIREMENT_RULES.indexOf(r)}`), source('src/retirements.js', '14-43'), source('src/engine.js', '439-480'), source('src/effect-rules.js', '124-145'))}`);
}

const budget = (f,d=10) => Math.max(f===1?3:f===2?4:5, Math.round((40+20*f+3*f*f+5*Math.max(0,f-2)**3)*(f>12?1.12**(f-12):1)*(1+0.5*Math.max(0,Math.min(1,(f-3)/9)))*difficultyHealthMultiplier(d)));
const floorTable = Array.from({length:12},(_,i)=>i+1).map(f=>`| ${f} | ${budget(f)} | ${f===1?'0、2、4':f===2?'0、1、2、4':'0–4'} | ${5+Math.floor((Math.min(f,12)-1)/4)} | ${1+Math.floor(f/4)}${f%3===0?` / 首领 ${3+Math.floor(f/4)}`:''} | ${['战意积蓄','装甲校验','禁锢矩阵','能量抽取'][(f-1)%4]} | ${f>=4?'1':'0'}${f%3===0?'＋首领 1–3':''}${[4,6,8,10,12].includes(f)?'＋污染':''} |`).join('\n');
await save('Difficulty', `# 难度与敌阵\n\n${nav('关卡流程', 'Run-Flow')}\n\n公开难度是开局选择的 **1–20**，默认 10，与当前第几层、资源功能是否启用相互独立。难度只进入敌人生命系数；敌方攻击、技能循环、条款起始层、首领阈值和污染层不随所选难度更改。第 12 层完成标准旅程，之后可保留编队与难度进入无尽。\n\n## 难度生命系数\n\n非有限输入归为 10；有限输入先四舍五入，再夹到 1–20。设 d 为归一化难度：\n\n\`D(d) = 0.25 × 1.4 × 1.155^((max(d,6)−10)/2) × 1.22^((min(d,6)−6)/2)\`\n\n难度 10 的 D=0.35。难度 6 以上每升两级生命系数乘 1.155，难度 6 以下每升两级乘 1.22，交界连续。整数生命舍入会让早期相邻难度出现相同总生命；系数本身严格上升，不能把“相邻一级相同整数”理解成难度失效。\n\n| 难度 | D(d) | 相对难度 10 |\n| --- | --- | --- |\n${Array.from({length:20},(_,i)=>i+1).map(d=>`| ${d} | ${difficultyHealthMultiplier(d).toFixed(6)} | ${(difficultyHealthMultiplier(d)/0.35).toFixed(4)} |`).join('\n')}\n\n## 每层生命总预算\n\n设 f 为层数，n 为本层敌列数。后期系数 \`L(f)=1+0.5×clamp((f−3)/9,0,1)\`：前 3 层为 1，到第 12 层为 1.5，以后保持 1.5。无尽额外系数 \`E(f)=f>12 ? 1.12^(f−12) : 1\`。\n\n\`总生命 T = max(n, round((40+20f+3f²+5×max(0,f−2)³) × E(f) × L(f) × D(d)))\`\n\nround 使用 JavaScript Math.round。第 1 层敌列为 0、2、4，第 2 层为 0、1、2、4；第 3 层起为 0–4 五列。列号从左到右 0–4。每逢 f 为 3 的倍数，中列（2）为裂界统御者，其他列是普通敌人。\n\n分配 T 时，普通列权重为 1，首领中列权重为 2.2。先算各列实数配额 \`T×权重/权重和\`，向下取整；剩余生命依小数余数从大到小逐点分配，余数相同则较左列优先。各列整数生命之和必须严格等于 T。\n\n敌人攻击值 \`A=1+floor(f/4)+(首领?2:0)\`，不乘 D 或 L。普通敌人主题按层轮换自动机兵、虚卒、永冬灾影、魔阴身士卒；主题名称不额外附带另一套属性抗性。首领列仅使用首领名与权重/攻击差异及分期系统。\n\n## 敌阵技能循环\n\n技能依 \`(f−1) mod 4\` 固定选择，全关共用，不由每只敌人单独抽取。\n\n| f 余数序列 | 技能 | 精确效果 |\n| --- | --- | --- |\n| 1、5、9… | 战意积蓄 pressure | 当前关第 3、6、9…次转动，若仍有敌人，存活敌人攻击总和加 3，再进入减伤公式 |\n| 2、6、10… | 装甲校验 armor | 每次命中扣 1 伤害，最低 0；普通与追加均适用，无视装甲可绕过 |\n| 3、7、11… | 禁锢矩阵 jammer | 当前关第 3、6、9…次转动，己方中间棋盘列（索引 mod 5=2）最终威力乘 0.5；不直接降低其治疗/护盾 |\n| 4、8、12… | 能量抽取 drain | 当前关第 2、4、6…次转动，若仍有敌人，存活敌人攻击总和加 3；可按常规被盾挡 |\n\n战意积蓄与能量抽取不是每个存活敌人各加 3。全灭后没有额外 3 点反击。显示的敌方意图是下一转动的存活敌人基础攻击与技能额外量，尚未扣未来击杀、减伤或护盾；不等于下一轮必定损失生命。完整命中和反击公式见[战斗](Combat)。\n\n## 首领三阶段\n\n首领层入关阶段为 1，并尝试追加一项随机相关条款。若首领仍存活，阶段 2 条件是其当前生命比例 \`≤0.7\` **或** 本关 round \`≥3\`；阶段 3 条件是生命比例 \`≤0.35\` **或** round \`≥5\`。每升一阶段再尝试加一条不同 id 的合格条款，合格池耗尽可没有新条款。阈值可一次跨过两档，此时依次进入 2、3，各尝试一次。\n\n每次转动先 round+1，然后在抽牌前检查阶段，因此第 3/5 次转动的轮数条款立即影响这次棋盘、护盾衰减、技能和攻击。本次攻击后再次检查生命阈值，本轮攻击与防御入口已完成，新增条款不会倒扣本轮伤害，后续入口才会使用它。如果首领已死亡，不再因为护卫仍活着而升阶段。达到阶段后不会因治疗或状态变化退阶段。\n\n第 4 层起额外固定一次难度随机条款；与首领条款共用去重与动态资格池。固定污染出现于第 4、6、8、10、12 层，不会在无尽每个偶数层自动延续。详见[敌方条款](Enemy-Effects)、[裂界污染](EnemyEffect-rift_pollution)。\n\n## 转动期限与标准旅程数值\n\n基本期限 \`5+floor((min(f,12)−1)/4)\`，即 1–4 层 5 次、5–8 层 6 次、9 层以后 7 次。持有[公司咕咕钟](Relic-seal_stamp)时入关期限再加 1。角色 extraSpin 效果可在关内同时提高剩余次数与截止期限。剩余次数耗尽且仍有敌人时败北；最后一次刚好全灭仍可清关。\n\n| 层 | 难度 10 总生命 | 敌列 | 基础转动数 | 每列攻击 | 敌阵技能 | 入关/首领条款 |\n| --- | --- | --- | --- | --- | --- | --- |\n${floorTable}\n\n上表不含奇物加轮、战斗造成的伤害或生成资源。生命、技能、条款不因关闭重选/移除/信用点/防御的实验资源开关而改变。无尽第 13 层之后 f 持续增大，生命预算继续增长、每 3 层仍有首领，但基础期限仍为 7。\n\n相关：[流程与胜负](Run-Flow) · [战斗](Combat) · [敌方条款](Enemy-Effects) · [资源实验与 AI](AI) · [精确复原](Reproduction)。${footer(source('src/difficulty.js', '1-33'), source('src/engine.js', '16-21'), source('src/engine.js', '230-344'), source('src/engine.js', '650-684'), source('src/engine.js', '870-915'), source('tests/difficulty.test.js', '1-76'), source('tests/enemy-effects.test.js', '149-187'))}`);

const count = 4 + SYNERGIES.length + ENEMY_DEBUFFS.length + RETIREMENT_RULES.length;
if (check && mismatches.length) {
  console.error(`World-rule Wiki check failed for ${mismatches.length}/${count} pages:\n${mismatches.join('\n')}`);
  process.exitCode = 1;
} else console.log(`${check ? 'Checked' : 'Generated'} ${count} world-rule Wiki pages for v0.7.0.`);
