import { getSynergies } from './engine.js';

const descriptions = {
  hp: ['开拓生命', '队伍的生命。敌人反击先扣护盾，剩余伤害再扣生命；生命归零，本次旅程结束。娜塔莎、罗刹与部分羁绊可以治疗，普通治疗不会超过生命上限。'],
  shield: ['护盾', '抵挡敌人反击的防御值：先消耗护盾，再扣生命。护盾不会每轮清空，可以跨回合、跨关卡保留，上限是生命上限的 2 倍。三月七、杰帕德、符玄登场时可以提供护盾。'],
  credits: ['补给信用点', '过关补给和部分奇物给出的资源。目前可用于付费重掷：在奖励三选一中点“重新发现”，免费机会用完后每次花 8 信用点。信用点不会直接变成伤害，也没有购买角色的商店。'],
  classicCredits: ['持有信用点', '支付房租的预算。每次转动按所有上场角色的总威力向上取整，赚取信用点；本层转动次数用完时自动交租，余额保留到下一层。付费重掷也会消耗这笔余额。'],
  rerolls: ['重掷机会', '在奖励三选一中点“重新发现”，换一组角色、奇物或精华候选。每次先花 1 次免费机会，用完后花 8 信用点。只刷新候选，不重转场上角色，也不消耗本层回合；进入新层补 1 次免费机会。'],
  removals: ['移除机会', '准备转动时到“我的编队”点“移出编队”并确认，每次花 1 次机会。只移走本局选中的一个棋子，同名其他副本保留，不是永久删除角色。编队超过 20 人时，精简可提高核心上场概率；进入偶数层补 1 次机会。'],
  floor: ['关卡进度', '战斗模式的一层就是一场遭遇。“第 01 层”是第一场：在本层转动次数用完前消灭全部敌人，即可过层；生命归零或到期仍有敌人则失败。一局共 12 层，第 3、6、9、12 层有中列首领，通关后可继续无尽。'],
  round: ['本层回合', '启动一次转轮，就消耗本层一个回合。之后的奖励选择和重掷候选不再扣回合。必须在次数用完前清空敌人，否则即使还有生命也会失败；过层后获得下一层的转动次数。'],
  synergy: ['羁绊共鸣', '看整个永久编队中符合阵营、命途或属性的不同角色，不是本轮场上人数。同名重复副本与不同星级只算 1 个身份，临时角色不计。达到人数门槛后，相应效果生效；成员本轮没上场也不会让羁绊失效。'],
  roster: ['编队与上场', '每次转动从编队中随机抽取最多 20 个角色，不放回，再随机摆放到 5 列 × 4 行。编队超过 20 位后，部分角色本轮不会上场。临时角色也参与抽取。'],
  stars: ['三合一升星', '3 位相同角色、相同星级的永久角色会自动合成：1 星 → 2 星 → 3 星，3 星封顶。威力倍率为 1 / 3 / 9，合成保留成长；重复角色不增加羁绊人数。'],
  power: ['角色威力', '格子右下角是这个角色本轮的威力，不一定等于最终伤害。角色成长、星级、相邻增益、羁绊和奇物先修正威力，再按攻击类型乘倍率；辅助角色不直接攻击。'],
  damage: ['本轮总伤害', '所有角色本轮实际扣除的敌人生命之和。单体为威力 ×3；扩散为主目标 ×2、相邻列各 ×1；群体对每个敌人各 ×1。不统计超过敌人剩余生命的溢出伤害。'],
  income: ['本轮信用点', '本次转动赚取的信用点，包括角色威力结算和奇物额外收入。到期房租会另外从持有余额中扣除。这个数字不会直接表示扣租后的余额。'],
  intent: ['预计反击与期限', '预计反击是现存敌人下一轮的基础攻击总和及周期技能额外伤害，未计入角色登场后的减伤和击破。剩余回合为本层转动次数；到期仍有敌人存活，即使生命未归零也会失败。'],
  rent: ['房租账单', '剩余转动次数变成 0 时，自动从持有信用点中扣除本层房租。不足则失败，成功后进入下一层。租金会逐层提高；最后一轮不能靠下一层的奖励补交。'],
  items: ['奇物收藏', '奇物是本局永久生效的被动效果，无需装备或点击使用。每完成 2 层选择一件，已拥有的不会重复出现。点击具体奇物可查看规则。'],
  essences: ['奇物精华', '每完成 3 层获得一次精华选择。取得后从下一轮开始积累条件，达到阈值后只触发一次；已触发的永久增益会保留。第 12 层直接结算胜利，不追加奖励。'],
  seed: ['宇宙种子', '在同一规则版本中，相同种子、相同选择与操作可以复现游戏的随机过程；更新难度后，新关卡的结果可能改变。AI 抽样使用独立随机流，不会消耗转轮的随机数。存档只保存在当前浏览器。'],
  single: ['单体攻击', '对对应列的敌人造成威力 ×3 伤害。本列为空时寻找最近的存活敌人；距离相同优先左侧。'],
  blast: ['扩散攻击', '对实际主目标造成威力 ×2；对主目标左、右相邻列的存活敌人各造成威力 ×1。主目标改列后，扩散也跟着改列；相邻空列不会跳跃寻找目标。'],
  aoe: ['群体攻击', '对每个存活敌人各造成威力 ×1。敌人越多，总输出越高；同一次攻击不会重复命中同一个敌人。'],
  support: ['辅助角色', '战斗中提供增益、治疗或其他支援，本身不直接攻击。房租模式仍按威力产出信用点。辅助过多会占用攻击角色的上场名额。'],
  aiProbability: ['AI 推荐概率', '这是 AI 选择这个选项的概率，三项合计 100%；不是通关概率。根据当前编队、升星、羁绊、角色效果和随机试算计算。自动代打与批量测试按同一分布抽样，显示值保留小数，抽样使用未四舍五入的原始概率。'],
  aiLab: ['AI 试验台', '批量试玩会新建独立对局，不改变你的旅程。用相同游戏种子对照 AI 与随机选择，统计通关率、失败层数和平均成绩。训练会尝试策略参数，并用独立验证对局决定是否采用改良结果。'],
  aiAutoplay: ['AI 自动代打', '让 AI 接管当前旅程：启动转轮，按当前推荐概率选择奖励，并在有收益时消耗移除机会精简编队。会正常修改和保存这局的进度。可随时停止；打开信息浮层时暂缓行动，关闭后继续。'],
};

export function mechanicExplanation(key, state = {}) {
  const value = descriptions[key];
  if (!value) return null;
  const classicDescriptions = {
    hp: '房租模式没有敌人反击，胜负看是否按时付清租金。生命和治疗仍会记录，但治疗不能代替信用点交租；余额不够会直接结束旅程，不是先扣生命。',
    shield: '房租模式没有敌人反击，护盾不能抵扣租金或兑换信用点。角色仍会积累护盾，也能推进护盾相关精华；护盾可以跨回合、跨层保留，上限是生命上限的 2 倍。',
    credits: descriptions.classicCredits[1],
    floor: '房租模式的一层就是一张租金账单。“第 01 层”是第一张：每层有一定转动次数，次数用完时自动扣除本层租金；余额够就过层，不够就失败。一局共 12 层，付清全部账单后可保留构筑继续无尽。',
    round: '启动一次转轮，就消耗本层一个回合。之后的奖励选择和重掷候选不再扣回合。次数用完时自动支付本层租金，余额不足就失败；缴租成功后，下一层重新获得转动次数。',
    power: '格子右下角是角色本轮威力，已包含成长、星级、相邻增益、羁绊和奇物。房租模式将全部上场角色的威力相加、向上取整后产出信用点，辅助角色也计入；不套用战斗的单体 ×3 或扩散 ×2 攻击倍率。',
  };
  const num = number => String(Number.isFinite(number) ? Math.round(number * 100) / 100 : 0);
  const classic = state.mode === 'classic';
  const cleared = state.pendingFloor || state.phase === 'victory';
  const balance = `当前余额 ${num(state.coins)} 信用点。`;
  const budget = cleared ? '本层租金已支付。' : `本层租金 ${num(state.rent)}，${state.coins >= state.rent ? '当前余额够付' : `还差 ${num(Math.max(0, (state.rent || 0) - (state.coins || 0)))} 信用点`}。`;
  const progress = `当前第 ${String(state.floor || 1).padStart(2, '0')} 层${state.endless ? '（无尽）' : ' / 12'}，已转动 ${num(state.round)} 次，${cleared ? '本层已完成' : `剩余 ${num(state.spinsLeft)} 次`}。`;
  const roster = state.roster || [];
  const rewardPhase = ['recruit', 'item', 'essence'].includes(state.phase);
  const creditExtra = () => `${balance}${classic ? budget : `当前免费重掷 ${num(state.rerolls)} 次；${state.rerolls > 0 ? '先用免费机会' : state.coins >= 8 ? '余额可支付重掷' : '付费重掷还需攒到 8 信用点'}。`}`;
  const extras = {
    hp: () => `当前生命 ${num(state.hp)} / ${num(state.maxHp)}${classic ? '；本模式按租金结算胜负' : `，护盾 ${num(state.shield)}`}。`,
    shield: () => `当前护盾 ${num(state.shield)} / ${num((state.maxHp || 0) * 2)}${classic ? '；本模式不用于挡伤或交租' : `，生命 ${num(state.hp)} / ${num(state.maxHp)}`}。`,
    credits: creditExtra,
    classicCredits: creditExtra,
    rerolls: () => `当前免费 ${num(state.rerolls)} 次，余额 ${num(state.coins)} 信用点。${state.rerolls > 0 ? '下次刷新使用 1 次免费机会。' : state.coins >= 8 ? '下次刷新花 8 信用点。' : '免费机会已用完，余额不足 8，暂时不能刷新。'}${rewardPhase ? '' : '在奖励三选一时使用。'}`,
    removals: () => `当前可用 ${num(state.removals)} 次，编队 ${roster.length} 人。${state.removals <= 0 ? '移除机会已用完。' : state.phase === 'ready' ? '可在“我的编队”移除。' : '手动移除要等到准备转动阶段。'}`,
    floor: () => `${progress}${classic ? `${budget}${balance}` : `存活敌人 ${(state.enemies || []).filter(enemy => enemy.hp > 0).length} 个。`}${state.phase === 'defeat' ? '本次旅程已结束。' : state.pendingFloor ? '领取本层奖励后进入下一层。' : ''}`,
    round: () => `${progress}本层共 ${num(state.encounter?.deadline)} 次转动机会。`,
    synergy: () => `永久编队共有 ${new Set(roster.filter(unit => !unit.temporary).map(unit => unit.id)).size} 个不同角色身份，当前激活 ${getSynergies(state).filter(synergy => synergy.active).length} 种羁绊。点具体羁绊查看门槛和成员。`,
    roster: () => `当前编队 ${roster.length} 人，每轮最多 ${Math.min(20, roster.length)} 人上场。`,
    rent: () => `${progress}${budget}${balance}`,
    intent: () => `预计反击 ${num(state.enemyIntent?.damage)}，本层剩余 ${num(state.spinsLeft)} 次转动。`,
  };
  const creditKey = key === 'credits' || key === 'classicCredits';
  return { title: creditKey ? descriptions[classic ? 'classicCredits' : 'credits'][0] : value[0], description: creditKey ? descriptions[classic ? 'classicCredits' : 'credits'][1] : classic ? classicDescriptions[key] || value[1] : value[1], extra: extras[key]?.() || '' };
}
