# 冻结实现：src/mechanics.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/mechanics.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：12828
- SHA-256：`f1536e90fe005916beda0bb8ec63cc0845a24e967bf6a2c58a12fc751b429392`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/mechanics.js#L1)

<!-- frozen-source:start -->
````````````````javascript
import { getSynergies } from './engine.js';

const descriptions = {
  difficulty: ['旅程难度', 'D1–D20 均可直接选择，默认 D10。难度影响敌人强度；第几关表示本局进度，两者独立。新开旅程时设置难度，一局途中保持不变。'],
  hp: ['开拓生命', '敌人反击先扣护盾，剩余伤害再扣生命；生命归零，本次旅程结束。角色、羁绊和医疗补给可以治疗，普通治疗不超过生命上限。取消“防御规划”只停用主动医疗与护盾补给，自然治疗、护盾与生命上限增益、承伤均保留。使用效率按实际消耗量 / 生成量衡量。'],
  shield: ['护盾', '先消耗护盾，再扣生命。护盾可以跨回合、跨关卡保留，上限是生命上限的 2 倍。防御角色与护盾补给可以提供护盾；实验中取消“防御规划”只停用主动医疗与护盾购买，自然增益和护盾抵伤保留；条款衰减的护盾另算浪费。'],
  credits: ['补给信用点', '过关和部分奇物提供的资源。免费重掷用完后，每次刷新花 8 信用点；准备转动时，可买医疗补给（12 点，治疗 18）、护盾补给（10 点，护盾 20）或超频补给（16 点，下轮威力 ×1.2）。每关最多购买两次，超频不叠加。禁用信用点消费后不能付费重掷或购买补给。'],
  rerolls: ['重掷机会', '奖励选择时点“重新发现”，换一组角色、奇物或精华候选。先用 1 次免费机会，用完后每次花 8 信用点。只刷新候选，不重转角色，也不消耗回合；进入新关补 1 次免费机会。禁用重掷后，免费和付费刷新都不可用。'],
  removals: ['移除机会', '准备转动时到“我的编队”点“移出编队”并确认，每次花 1 次机会。只移走本局选中的棋子，同名其他副本保留。编队超过 20 人时，精简可提高核心上场概率；进入偶数关补 1 次机会。AI 也可在奖励阶段评估移除。禁用移除后不可使用。'],
  supplyRepair: ['医疗补给', '花 12 信用点恢复 18 点生命，不超过生命上限。仅能在准备转动时购买，生命已满时不可买。与其他补给共用每关两次的购买次数；禁用信用点消费或取消防御规划后不可买。'],
  supplyBarrier: ['护盾补给', '花 10 信用点获得 20 点护盾，不超过生命上限的 2 倍。仅能在准备转动时购买，护盾已满时不可买。与其他补给共用每关两次的购买次数；禁用信用点消费或取消防御规划后不可买。'],
  supplyOverclock: ['超频补给', '花 16 信用点，让下一次转动的角色威力乘 1.2；转动后消耗效果。仅能在准备转动时购买，已有待用超频时不可重复购买。与其他补给共用每关两次的购买次数；禁用信用点消费后不可买。'],
  floor: ['关卡进度', '第 01 关是第一场遭遇。在本关转动次数用完前消灭全部敌人即可过关；生命归零或到期仍有敌人则失败。一局共 12 关，第 3、6、9、12 关有中列首领，通关后可继续无尽。关卡与 D1–D20 难度分别计算。'],
  round: ['本关回合', '启动一次转轮，就消耗本关一个回合。奖励选择、重掷、移除与购买补给不额外扣回合。必须在次数用完前清空敌人，否则即使还有生命也会失败；过关后获得新关的转动次数。'],
  synergy: ['羁绊共鸣', '绑定组用于限定技能可配合范围，与羁绊人数分别计算。羁绊看整个永久编队中符合阵营、命途或属性的不同角色。同名重复副本与不同星级只算 1 个身份，临时角色不计。达到人数门槛后激活；实际收益还要满足该羁绊的登场、击破、承伤或回合条件。不同羁绊有各自的触发方式。'],
  roster: ['编队与上场', '每次转动从编队中随机抽取最多 20 个角色，不放回，再随机摆放到 5 列 × 4 行。编队超过 20 位后，部分角色本轮不会上场。临时角色也参与抽取。'],
  stars: ['三合一升星', '3 位相同角色、相同星级的永久角色自动合成：1 星 → 2 星 → 3 星，3 星封顶，星级倍率为 1 / 3 / 9。攻击威力和常规星级数值使用该倍率；培养发放量使用温和的1 / 1.5 / 2，详情逐条标明。合成保留培养，重复角色不增加羁绊人数。'],
  power: ['攻击威力与职能培养', '攻击格右下是上次结算威力，含当时星级、攻击成长与临时增益；下次重新检查条件。支援格显示主职，没有普通攻击。其永久培养仅放大标明可培养的支援效能：每点+8%，最多计12点（×1.96）；培养主持不接受培养。点角色查看适配对象与效果记录。'],
  damage: ['上次总伤害', '上次转动实际扣除的敌人生命之和，包含角色攻击与追加伤害。单体为威力 ×3；扩散为主目标 ×2、相邻列各 ×1；群体对每个敌人各 ×1。不统计超过敌人剩余生命的溢出伤害，也不是下次伤害预测。'],
  intent: ['预计反击与敌方条款', '预计反击基于现存敌人和当前条款，未计入接下来角色登场后的减伤或击破。首领会随生命降低或回合推进进入新阶段，追加针对编队的负面条款；点条款名称可查看效果。剩余回合用完仍有敌人存活，即使生命未归零也会失败。'],
  items: ['奇物收藏', '奇物无需装备或点击使用。取得时的即时收益只领取一次，持有期间的被动每次按条件生效；不会因为获得奇物就把所有收益写成永久成长。每完成 2 关选择一件，已拥有的不会重复出现。点具体奇物看时点、目标与叠加规则。'],
  essences: ['奇物精华', '每完成 3 关获得一次精华选择。取得后从下一轮开始积累条件，达到阈值后只触发一次；永久增益会保留。第 12 关直接结算胜利，不追加奖励。'],
  seed: ['宇宙种子', '同一规则版本、相同难度与资源开关下，相同种子和操作可复现随机过程。AI 抽样使用独立随机流，不会消耗转轮随机数。存档保存在当前浏览器；单文件版可从设置导出或导入。'],
  single: ['单体攻击', '对对应列的敌人造成威力 ×3 伤害。本列为空时寻找最近的存活敌人；距离相同优先左侧。'],
  blast: ['扩散攻击', '对实际主目标造成威力 ×2；对主目标左、右相邻列的存活敌人各造成威力 ×1。主目标改列后，扩散也跟着改列；相邻空列不会跳跃寻找目标。'],
  aoe: ['群体攻击', '对每个存活敌人各造成威力 ×1。敌人越多，总输出越高；同一次攻击不会重复命中同一个敌人。'],
  support: ['支援角色', '防御、即时增幅、永久培养和敌方干扰主职不进行普通攻击，各自技能有指定绑定组、攻击类型或同场条件。支援过多会占用攻击者上场名额。培养只放大标明可培养的支援效果；取消防御规划仍保留自然治疗与护盾。'],
  aiProbability: ['AI 推荐概率', '这是当前奖励决策选择此项的概率，现有奖励加跳过合计 100%，不是通关概率。根据编队、升星、羁绊、效果与随机试算计算，跳过也会评估保留构筑的收益。代打可能先重掷或移除，再按新候选概率抽样；自动试玩采用同一决策。显示值保留小数，抽样使用原始概率。'],
  aiLab: ['AI 试验台', '批量试玩新建独立对局，不改变当前旅程。可自由选择难度并禁用四类资源，对照 AI 与随机选择。资源矩阵分别报告全资源 D10、单禁用 D10 对照及按禁用数量降低难度的配置。训练、验证与留出使用不同种子；只有独立验收通过才采用候选参数。'],
  defenseUsage: ['防御有效消耗', '生命效率 = 实际生命损失 /（初始生命 + 实际治疗）；护盾效率 = 实际抵挡伤害 /（初始护盾 + 实际获得护盾）。合计按两者的总消耗 / 总生成计算，本批报告将全部对局总量相加后归一，不直接平均各局百分比。护盾条款衰减算浪费，不算有效抵伤。暂定低于 20% 为偏低、达到 50% 为有效；这些是报告阈值，不鼓励故意挨打。'],
  aiAutoplay: ['AI 自动代打', '统一 AI 接管当前旅程：考虑转动、招募、跳过、重掷、移除与补给。它与批量试玩共享决策函数，资源使用会修改并保存当前旅程。可随时停止；打开说明浮层时暂缓行动，关闭后继续。'],
};

export function mechanicExplanation(key, state = {}) {
  const value = descriptions[key];
  if (!value) return null;
  const num = number => String(Number.isFinite(number) ? Math.round(number * 100) / 100 : 0);
  const enabled = kind => state.resourceAccess?.[kind] !== false;
  const cleared = state.pendingFloor || state.phase === 'victory';
  const progress = `难度 D${state.difficulty || 10}，第 ${String(state.floor || 1).padStart(2, '0')} 关${state.endless ? '（无尽）' : ' / 12'}；已转动 ${num(state.round)} 次，${cleared ? '本关已完成' : `剩余 ${num(state.spinsLeft)} 次`}。`;
  const roster = state.roster || [];
  const rewardPhase = ['recruit', 'item', 'essence'].includes(state.phase);
  const supplyExtra = kind => {
    const cost = { repair: 12, barrier: 10, overclock: 16 }[kind];
    const unavailable = !enabled('credits') ? '信用点消费已禁用。' : kind !== 'overclock' && !enabled('defense') ? '本局不主动购买医疗或护盾补给。' : (state.supplyPurchases || 0) >= 2 ? '本关两次购买已用完。' : state.phase !== 'ready' ? '需等到准备转动阶段。' : (state.coins || 0) < cost ? `还需 ${num(cost - (state.coins || 0))} 信用点。` : kind === 'repair' && state.hp >= state.maxHp ? '生命已满。' : kind === 'barrier' && state.shield >= state.maxHp * 2 ? '护盾已满。' : kind === 'overclock' && state.overclockReady ? '超频已就绪，不能叠加。' : '当前可购买。';
    return `余额 ${num(state.coins)} 信用点，本关已买 ${num(state.supplyPurchases)} / 2 次。${unavailable}`;
  };
  const extras = {
    difficulty: () => progress,
    hp: () => `生命 ${num(state.hp)} / ${num(state.maxHp)}，护盾 ${num(state.shield)}。${enabled('defense') ? '' : '本局不主动购买医疗或护盾补给；自然增益保留。'}`,
    shield: () => `护盾 ${num(state.shield)} / ${num((state.maxHp || 0) * 2)}，生命 ${num(state.hp)} / ${num(state.maxHp)}。${enabled('defense') ? '' : '本局不主动购买医疗或护盾补给；自然增益保留。'}`,
    credits: () => `余额 ${num(state.coins)} 信用点，免费重掷 ${num(state.rerolls)} 次，本关补给购买 ${num(state.supplyPurchases)} / 2 次。${enabled('credits') ? '' : '本局信用点消费已禁用。'}`,
    rerolls: () => `免费重掷 ${num(state.rerolls)} 次，余额 ${num(state.coins)} 信用点。${!enabled('rerolls') ? '本局重掷已禁用。' : state.rerolls > 0 ? '下次使用 1 次免费机会。' : !enabled('credits') ? '信用点消费已禁用，不能付费刷新。' : state.coins >= 8 ? '下次花 8 信用点。' : '免费机会已用完，余额不足 8。'}${rewardPhase ? '' : '在奖励选择时使用。'}`,
    removals: () => `可用 ${num(state.removals)} 次，编队 ${roster.length} 人。${!enabled('removals') ? '本局移除已禁用。' : state.removals <= 0 ? '移除机会已用完。' : state.phase === 'ready' ? '可在“我的编队”移除。' : '手动移除要等到准备转动阶段。'}`,
    supplyRepair: () => supplyExtra('repair'),
    supplyBarrier: () => supplyExtra('barrier'),
    supplyOverclock: () => supplyExtra('overclock'),
    floor: () => `${progress}存活敌人 ${(state.enemies || []).filter(enemy => enemy.hp > 0).length} 个。${state.phase === 'defeat' ? '本次旅程已结束。' : state.pendingFloor ? '领取奖励后进入下一关。' : ''}`,
    round: () => `${progress}本关共 ${num(state.encounter?.deadline)} 次转动机会。`,
    synergy: () => `永久编队有 ${new Set(roster.filter(unit => !unit.temporary).map(unit => unit.id)).size} 个不同角色身份，当前激活 ${getSynergies(state).filter(synergy => synergy.active).length} 种羁绊。点具体羁绊查看门槛和成员。`,
    roster: () => `编队 ${roster.length} 人，每轮最多 ${Math.min(20, roster.length)} 人上场。`,
    intent: () => `预计反击 ${num(state.enemyIntent?.damage)}，剩余 ${num(state.spinsLeft)} 次转动，当前 ${(state.activeDebuffs || []).length} 条敌方条款${state.bossStage ? `，首领阶段 ${state.bossStage} / 3` : ''}。`,
  };
  return { title: value[0], description: value[1], extra: extras[key]?.() || '' };
}
````````````````
<!-- frozen-source:end -->
