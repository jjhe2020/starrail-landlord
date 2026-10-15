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
  floorStart: '进入新关时', acquire: '取得时', retire: '临时角色退场时',
  merge: '合成时', unlock: '达到精华条件后', trigger: '达到精华条件后',
  passive: '条件满足时', attack: '攻击时', kill: '击破时', afterAttack: '攻击结算后',
  afterDamage: '承伤后', retaliation: '敌人反击时', floorClear: '过关时', floor: '进入新关时', clear: '过关时',
};
const targetNames = {
  self: '自身', adjacent: '相邻八格', team: '本次登场队伍', all: '本次登场队伍',
  allies: '其他登场角色', highest: '威力最高的其他登场角色', highestAlly: '威力最高的其他登场角色',
  lowest: '威力最低的其他登场角色', lowestAlly: '威力最低的其他登场角色', strongest: '当前威力最高的其他登场角色', matching: '符合条件的登场角色',
  roster: '永久编队', resource: '列车资源', train: '列车资源', enemy: '敌人',
  enemies: '存活敌人', column: '对应列', summon: '新召唤的临时实例',
};
const typeNames = {
  growth: '永久成长', power: '威力修正', powerAdd: '威力加成', powerMultiplier: '条件倍率',
  shield: '获得护盾', heal: '恢复生命', credits: '获得信用点', reroll: '获得重掷',
  rerolls: '获得重掷', removal: '获得移除', summon: '召唤临时角色', consume: '消耗临时角色',
  buff: '提供支援', armorIgnore: '无视装甲', incomingReduction: '降低反击',
  incomingMultiplier: '反击减伤', maxHp: '生命上限', followUp: '追加攻击',
};
const stackingNames = {
  add: '同类数值相加', additive: '同类数值相加', multiply: '按倍率相乘', multiplicative: '按倍率相乘', once: '单个来源只结算一次', unique: '同名来源只生效一份',
  refresh: '刷新期限，不累加时长', recompute: '每次重新计算，不跨转动累积',
  accumulate: '永久累计，随实例与合成保留', none: '不叠加', resource: '进账后保留，消耗后减少', counter: '累计计数，达到条件后结算',
};
const readable = value => typeof value === 'string' && /[\u3400-\u9fff]/u.test(value);
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
    const filter = effect.filter;
    if (filter && typeof filter === 'object') {
      const tags = [filter.path, filter.element, filter.faction, filter.factionNot && `非${filter.factionNot}`, filter.pathNot && `非${filter.pathNot}`, filter.elementNot && `非${filter.elementNot}`, filter.attack && ({ single: '单体', blast: '扩散', aoe: '群体', support: '辅助' }[filter.attack]), filter.attackNot === 'support' && '攻击角色', filter.temporary === true && '临时角色', filter.temporary === false && '永久角色', filter.starsMin && `至少${filter.starsMin}星`, filter.starsMax && `至多${filter.starsMax}星`].filter(Boolean);
      if (tags.length) target += ` · ${effect.type === 'damage' ? '来源角色：' : ''}${tags.join('／')}`;
    }
    let trigger = labelFor(effect.trigger || effect.timing, triggerNames, '按说明条件触发');
    if (effect.stage === 'afterAttacks' || (effect.type === 'damage' && ['appearance','spin','retire'].includes(effect.trigger))) trigger += '，常规攻击后结算';
    if (effect.stage === 'afterRetaliation') trigger = '反击后仍存活时';
    const repeat = Number.isFinite(effect.every) && effect.every > 1 ? `（每 ${effect.every} 次）` : '';
    const stacking = labelFor(effect.stacking, stackingNames, duration.key === 'spin' ? '同次可叠加，下次重新计算' : duration.key === 'resource' ? '资源累加，消耗后减少' : '按来源规则结算');
    const scales = effect.scaleWithStars ?? effect.starScale;
    const scaling = scales === true ? '数值随星级倍率变化' : scales === false ? '固定数值，不随星级倍增' : '';
    return { label: effect.label || effect.summary || typeNames[effect.type] || '机制效果', duration, trigger: trigger + repeat, target, stacking, scaling };
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
