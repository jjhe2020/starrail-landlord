import { CHARACTERS } from './content.js';

// Presentation of explicit rule metadata. Never infer duration from prose.
const durations = {
  instant: ['即时结算', '当次修改生命、护盾或其他资源；已经获得的资源按各自规则保留。'],
  spin: ['本次转动', '只参与这一次结算，下次重新计算，不写入永久成长。'],
  encounter: ['本关', '在当前关卡生效，过关后移除或重新配置。'],
  run: ['本局永久', '在这段旅程中保留；开启新旅程不会继承。'],
  nextSpin: ['下次转动一次', '等待下一次转动，结算后消耗，不会一直叠加。'],
  resource: ['资源存量', '获得后保留，直到被消耗或按规则衰减；不是永久属性。'],
  whileOwned: ['持有期间', '持有此来源时检查条件并提供被动；触发收益不等于每次永久加属性。'],
  appearances: ['限次登场', '按该实例实际登场次数倒计时，次数用完后退场。'],
};
const triggerNames = {
  appear: '登场时', appearance: '登场时', spin: '每次转动', spinStart: '转动开始时',
  floorStart: '进入新关时', acquire: '取得时', retire: '角色退场时',
  merge: '合成时', unlock: '达到精华条件后', trigger: '达到精华条件后',
  passive: '条件满足时', attack: '攻击时', kill: '击破时', afterAttack: '攻击结算后',
  afterDamage: '承伤后', retaliation: '敌人反击时', floorClear: '过关时', floor: '进入新关时', clear: '过关时',
};
const targetNames = {
  self: '自身', adjacent: '相邻八格', team: '本次登场队伍', all: '本次登场队伍',
  allies: '其他登场角色', highest: '威力最高的其他登场角色', highestAlly: '威力最高的其他登场角色',
  lowest: '威力最低的其他登场角色', lowestAlly: '威力最低的其他登场角色', strongest: '当前威力最高的其他登场角色', matching: '符合条件的登场角色',
  roster: '永久编队', resource: '列车资源', train: '列车资源', enemy: '敌人',
  enemies: '存活敌人', row: '同行五格', column: '同列四格', aligned: '同行或同列', summon: '新召唤的临时实例',
};
const typeNames = {
  growth: '永久成长', power: '威力修正', powerAdd: '威力加成', powerMultiplier: '条件倍率',
  shield: '获得护盾', heal: '恢复生命', credits: '获得信用点', reroll: '获得重掷',
  rerolls: '获得重掷', removal: '获得移除', summon: '召唤临时角色', consume: '消耗临时角色',
  buff: '提供支援', armorIgnore: '无视装甲', incomingReduction: '降低反击',
  incomingMultiplier: '反击减伤', maxHp: '生命上限', followUp: '追加攻击',
  vulnerability: '限定易伤', retaliationFlat: '固定反击减伤', retaliationMultiplier: '倍率反击减伤',
};
const stackingNames = {
  add: '同类数值相加', additive: '同类数值相加', multiply: '按倍率相乘', multiplicative: '按倍率相乘', once: '单个来源只结算一次', unique: '同名来源只生效一份',
  refresh: '刷新期限，不累加时长', recompute: '每次重新计算，不跨转动累积',
  accumulate: '永久累计，随实例与合成保留', none: '不叠加', resource: '进账后保留，消耗后减少', counter: '累计计数，达到条件后结算',
};
const readable = value => typeof value === 'string' && /[\u3400-\u9fff]/u.test(value);
const roleNames = { attack: '攻击', defense: '防御', amplifier: '即时增幅', trainer: '永久培养', disruptor: '敌方干扰' };
export function characterRole(entry) {
  return entry?.roleLabel || roleNames[entry?.role] || (entry?.attack === 'support' ? '支援' : '攻击');
}
export function characterBindings() { return []; }
export function trainingSummary(entry, growth = 0) {
  if (entry?.role === 'attack' || (!entry?.role && entry?.attack !== 'support')) return `攻击成长 +${Math.round(growth * 100) / 100}`;
  if (entry?.role === 'trainer') return '培养主持 · 不接受永久培养，培养量不自乘';
  const multiplier = 1 + Math.min(Math.max(0, growth), 12) * .08;
  return `职能培养 +${Math.round(growth * 100) / 100} · 可培养支援效能 ×${Math.round(multiplier * 100) / 100}`;
}
export function effectFilterLabel(filter) {
  if (!filter || typeof filter !== 'object') return '';
  const roles = filter.roles || (filter.role ? [filter.role] : []);
  const tags = [filter.path, filter.element, filter.faction, filter.factionNot && `非${filter.factionNot}`, filter.pathNot && `非${filter.pathNot}`, filter.elementNot && `非${filter.elementNot}`, filter.attack && ({ single: '单体', blast: '扩散', aoe: '群体', support: '支援' }[filter.attack]), filter.attackNot === 'support' && '攻击角色', ...roles.map(role => roleNames[role] || role), filter.roleNot && `非${roleNames[filter.roleNot] || filter.roleNot}主职`, filter.anyOf && `（${filter.anyOf.map(effectFilterLabel).join('或')}）`, filter.temporary === true && '临时角色', filter.temporary === false && '永久角色', filter.commission === true && '见习委派', filter.commission === false && '排除见习', filter.starsMin && `至少${filter.starsMin}星`, filter.starsMax && `至多${filter.starsMax}星`, filter.excludeSelf && '排除自身'].filter(Boolean);
  const ids = filter.ids || (filter.id ? [filter.id] : []);
  if (ids.length) {
    tags.push(ids.map(id => CHARACTERS.find(entry => entry.id === id)?.name || id).join('、'));
  }
  return tags.join('／');
}
function conditionLabel(condition) {
  if (!condition) return '';
  const metrics = { present: '同场人数', presentDistinct: '同场不同身份', neighbors: '相邻八格人数', row: '同行其他人数', column: '同列其他人数', aligned: '同行或同列其他人数', edge: '处于棋盘边缘', corner: '处于四角', emptyNeighbors: '相邻空格数', roster: '编队人数', hpRatio: '生命比例', missingHp: '已损生命', shield: '现有护盾', coins: '信用点', ticks: '自身累计登场', stars: '自身星级', growth: '自身培养', round: '本关转动次数', floor: '关卡', enemies: '存活敌人数', emptyColumns: '空敌列数', blocked: '本轮真实抵伤', hpLost: '本轮损失生命', kills: '本轮击破', retirements: '本轮退场', sourcePower: '来源最终攻击威力' };
  const filter = effectFilterLabel(condition.filter);
  const op = { gte: '至少', lte: '至多', lt: '小于', gt: '大于', eq: '等于', mod: '为非零的倍数：' }[condition.op || 'gte'] || '至少';
  const value = condition.metric === 'hpRatio' ? `${Math.round(condition.value * 100)}%` : condition.value;
  return `${filter ? `${filter}的` : ''}${metrics[condition.metric] || '技能计数'}${condition.value === undefined ? '' : `${op}${value}`}`;
}
export function durationInfo(value) {
  const aliases = { permanent: 'run', turn: 'spin', floor: 'encounter', owned: 'whileOwned', next: 'nextSpin' };
  const key = aliases[value] || value;
  const info = durations[key];
  return { key: info ? key : 'unknown', label: info?.[0] || (readable(value) ? value : '见具体效果'), note: info?.[1] || '' };
}
function labelFor(value, names, fallback) {
  if (names[value]) return names[value];
  if (typeof value === 'string' && value.startsWith('on')) {
    const normalized = value.slice(2).replace(/^./, char => char.toLowerCase());
    if (names[normalized]) return names[normalized];
  }
  return readable(value) ? value : fallback;
}
export function effectRows(entry) {
  return (entry?.effects || []).filter(effect => effect && typeof effect === 'object').map(effect => {
    const duration = durationInfo(effect.duration);
    const resourceTargets = { shield: '列车护盾', shieldMultiplier: '自然护盾生成量', heal: '列车生命', healMultiplier: '自然治疗量', healOverflowShield: '列车护盾', maxHp: '列车生命上限', selfDamage: '列车生命', resource: '列车资源', retaliationFlat: '敌方反击', retaliationMultiplier: '敌方反击', rarityMultiplier: '招募候选池', extraSpin: '关卡转动次数', buffMultiplier: '原生辅助技能的增益量', growthMultiplier: '永久成长获得量' };
    let target = resourceTargets[effect.type] || labelFor(effect.target, targetNames, '按技能指定目标');
    if (!resourceTargets[effect.type] && effect.scope === 'members' && effect.target === 'self') target = '本次登场的本羁绊成员';
    if (effect.type === 'damage') target = ['team','all','enemies'].includes(effect.target) ? '所有存活敌人' : effect.excludeOriginColumn ? '来源格以外的最近存活敌列' : '来源对应列的敌人；空列找最近存活敌人';
    if (effect.type === 'vulnerability') target = `本轮敌人 · 仅${targetNames[effect.target] || '匹配'}的攻击者伤害受益`;
    if (effect.range) target += ` · 范围限${targetNames[effect.range] || effect.range}`;
    if (effect.selection === 'strongest') target += ' · 范围内优先威力最高者';
    const filter = effect.filter;
    if (filter && typeof filter === 'object') {
      const tags = effectFilterLabel(filter);
      if (tags) target += ` · ${effect.type === 'damage' ? '来源角色：' : effect.type === 'vulnerability' ? '攻击者：' : ''}${tags}`;
    }
    if (Number.isInteger(effect.targetLimit)) target += ` · 最多${effect.targetLimit}名（按目标选择规则）`;
    let trigger = labelFor(effect.trigger || effect.timing, triggerNames, '按说明条件触发');
    if (effect.stage === 'afterAttacks' || (effect.type === 'damage' && ['appearance','spin','retire'].includes(effect.trigger))) trigger += '，常规攻击后结算';
    if (effect.stage === 'afterRetaliation') trigger = '反击后仍存活时';
    const repeat = Number.isFinite(effect.every) && effect.every > 1 ? `（每 ${effect.every} 次）` : '';
    const conditions = [effect.condition, ...(effect.conditions || [])].filter(Boolean).map(conditionLabel);
    if (effect.per) conditions.push(`效果按${conditionLabel(effect.per)}计算${Number.isFinite(effect.per.cap) ? `，最多计 ${effect.per.cap}` : ''}`);
    let stacking = labelFor(effect.stacking, stackingNames, duration.key === 'spin' ? '同次可叠加，下次重新计算' : duration.key === 'resource' ? '资源累加，消耗后减少' : '按来源规则结算');
    if (effect.type === 'vulnerability') stacking += '；同次匹配易伤总增量上限75%';
    if (entry.role === 'amplifier' && effect.type === 'powerMultiplier') stacking += '；角色即时增幅同类总倍率上限×2.2';
    if (effect.type === 'retaliationFlat') stacking += '；本轮总平减最多为基础反击的45%';
    if (effect.type === 'retaliationMultiplier') stacking += '；平减后应用倍率减伤，合计最多减60%（倍率保底×0.4）';
    const scales = effect.scaleWithStars ?? effect.starScale;
    let scaling = scales === true && Array.isArray(effect.starFactors) ? `温和星级：1 / 2 / 3 星分别 ×${effect.starFactors.slice(1, 4).join(' / ')}` : scales === true ? '数值随星级倍率变化' : scales === false ? '固定数值，不随星级倍增' : '';
    if (effect.scaleWithSourcePower) scaling += `${scaling ? '；' : ''}再乘来源最终攻击威力，可与人数条件同时生效`;
    if (effect.scaleWithTraining) scaling += `${scaling ? '；' : ''}职能培养：每点 +8%，最多计 12 点（×1.96）`;
    if (effect.scaleWithTraining && ['powerMultiplier', 'retaliationMultiplier', 'healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier'].includes(effect.type)) scaling += '；只放大倍率相对1的增益或减伤部分';
    if (effect.type === 'growth') scaling += `${scaling ? '；' : ''}培养量不被培养自身放大；培养主持不接受培养`;
    return { label: effect.label || effect.summary || typeNames[effect.type] || '机制效果', duration, trigger: trigger + repeat, target, stacking, scaling, conditions: conditions.join('；') };
  });
}
export function effectBadges(entry) {
  return [...new Map(effectRows(entry).map(row => [row.duration.key, row.duration])).values()];
}
export function snapshotTitle(state) {
  if (!state?.stats?.spins) return '尚未转动结算';
  const last = state.lastSpin;
  return Number.isInteger(last?.floor) && Number.isInteger(last?.round)
    ? `上次结算 · 第 ${String(last.floor).padStart(2, '0')} 关第 ${last.round} 次转动`
    : '上次结算';
}
export function unitBreakdown(state, uid) {
  const index = (state?.board || []).findIndex(unit => unit?.uid === uid);
  if (index < 0 || !state?.stats?.spins) return null;
  const value = state.lastSpin?.powerBreakdown?.[index];
  return value && ['base', 'growth', 'flatBonus', 'multiplier', 'final'].every(key => Number.isFinite(value[key])) ? value : null;
}
