// Shared, data-only resonance definitions. This module deliberately has no
// content/engine imports; callers supply the identity lookup used by the run.
const present = (kind, tag, minimum = 1, distinct = false) => ({ metric: distinct ? 'presentDistinct' : 'present', filter: { [kind]: tag, ...(distinct ? { temporary: false } : {}) }, op: 'gte', value: minimum });
const e = (type, value, extra = {}) => ({ type, value, trigger: 'spin', duration: 'spin', stacking: '每次转动重新计算，不写入永久成长', ...extra, ...(['power', 'powerMultiplier', 'damage'].includes(type) ? { filter: { ...extra.filter, role: 'attack', attackNot: 'support' } } : {}) });
const row = (id, name, kind, tag, thresholds, style, description, tierEffects) => ({
  id, name, kind, tag, filter: { [kind]: tag }, thresholds, style, archetype: style,
  description, activation: '永久编队中的不同角色身份达到门槛；重复、星级和临时副本不增加人数',
  timing: '编队激活，登场触发', duration: '满足编队人数期间；具体触发效果按下列时限结算',
  stacking: '高档替换低档，不把两档相加', effects: tierEffects[0], tierEffects,
});
const members = extra => ({ scope: 'members', target: 'self', ...extra });
const matching = (kind, tag, extra = {}) => ({ target: 'matching', filter: { [kind]: tag }, ...extra });

export const SYNERGIES = [
  row('astral', '星穹列车', 'faction', '星穹列车', [2, 4], '相邻混编', '列车角色登场时，为相邻非列车攻击者提供本轮 0.35 / 0.6 点威力；按来源星级放大。', [0.35, 0.6].map(value => [e('power', value, members({ target: 'adjacent', filter: { factionNot: '星穹列车', attackNot: 'support' }, scaleWithStars: true, label: '列车接力', summary: '相邻非列车攻击者获得本轮威力；不同来源可以叠加' }))])),
  row('belobog', '筑城誓约', 'faction', '贝洛伯格', [3, 6], '击破回盾', '有贝洛伯格角色登场时，本轮首次常规攻击击破获得 4 / 8 护盾；生成的护盾可保留。', [4, 8].map(value => [e('shield', value, { trigger: 'kill', condition: present('faction', '贝洛伯格'), oncePerSpin: true, duration: 'resource', label: '筑城回收', summary: '本轮第一次常规攻击击破产生护盾；护盾保留至抵伤、衰减或截断', stacking: '每轮一次；护盾按上限累加' })])),
  row('station', '空间站科员', 'faction', '黑塔空间站', [2, 3], '周期实验', '空间站攻击者每第 3 次实际登场，本轮增加 1 / 2 点威力；按星级放大，不增加永久成长。', [1, 2].map(value => [e('power', value, members({ condition: { metric: 'ticks', op: 'mod', value: 3 }, scaleWithStars: true, label: '周期实验', summary: '每个实例第 3、6、9…次登场获得本轮威力' }))])),
  row('hunters', '命运剧本', 'faction', '星核猎手', [2, 3], '同场追击', '本轮至少两种永久猎手实际登场时，各登场猎手攻击者在攻击后追加自身威力 20% / 35% 的伤害。', [0.2, 0.35].map(value => [e('damage', value, members({ stage: 'afterAttacks', per: { metric: 'sourcePower' }, condition: present('faction', '星核猎手', 2, true), label: '剧本追击', summary: '两种猎手同场，向本列最近存活敌人追击；不再触发追击' }))])),
  row('xianzhou', '仙舟同盟', 'faction', '仙舟罗浮', [2, 4], '医护接续', '有仙舟角色登场时，本轮实际治疗的 50% / 100% 转为护盾，最多 3 / 6；溢出治疗不算。', [0.5, 1].map(value => [e('shield', value, { stage: 'afterAttacks', per: { metric: 'healing', cap: 6 }, condition: present('faction', '仙舟罗浮'), duration: 'resource', label: '医护接续', summary: '按本轮实际生命恢复生成护盾，满血溢出不算', stacking: '每轮一次，护盾保留至抵伤、衰减或上限' })])),
  row('hunt', '巡猎', 'path', '巡猎', [2], '击破追猎', '巡猎角色本轮首次常规击破后，追加自身威力 60% 的追击；每个来源每轮一次。', [[e('damage', 0.6, members({ trigger: 'kill', oncePerSpin: true, per: { metric: 'sourcePower' }, label: '追猎', summary: '常规击破后向本列最近存活敌人追加伤害，不递归触发' }))]]),
  row('destruction', '毁灭', 'path', '毁灭', [2, 4], '半血爆发', '攻击阶段生命不高于上限一半时，毁灭角色本轮威力提高 20% / 35%；羁绊不消耗生命。', [1.2, 1.35].map(value => [e('powerMultiplier', value, members({ condition: { metric: 'hpRatio', op: 'lte', value: 0.5 }, label: '逆境爆发', summary: '半血条件下的本轮增幅，不增加永久成长', stacking: '同羁绊只取当前一档，其他来源按规则合成' }))])),
  row('erudition', '智识', 'path', '智识', [2, 4], '残局集火', '每空出一列，登场智识角色本轮增加 0.4 / 0.8 点威力，最多按 4 列计算；按星级放大。', [0.4, 0.8].map(value => [e('power', value, members({ per: { metric: 'emptyColumns', cap: 4 }, scaleWithStars: true, label: '空列火力', summary: '按攻击前空列数汇聚火力；下轮重新计算' }))])),
  row('nihility', '虚无', 'path', '虚无', [2, 4], '偶数轮震荡', '每逢当前遭遇的偶数次转动，登场虚无攻击者在攻击后追加自身威力 25% / 45% 的伤害。', [0.25, 0.45].map(value => [e('damage', value, members({ every: 2, stage: 'afterAttacks', per: { metric: 'sourcePower' }, label: '虚无震荡', summary: '本关第 2、4、6…次转动追加伤害；不是永久或持续伤害' }))])),
  row('preservation', '存护', 'path', '存护', [2, 3], '抵伤反击', '有存护角色登场时，每轮获得 3 / 6 护盾；本轮真正抵伤的 25% / 50% 反击敌人，致死时不反击。', [0.25, 0.5].map((value, i) => [e('shield', [3, 6][i], { condition: present('path', '存护'), duration: 'resource', label: '盾阵', summary: '有存护登场时生成护盾；可跨轮保留', stacking: '每轮一次，受护盾上限限制' }), e('damage', value, { trigger: 'retaliation', stage: 'afterRetaliation', target: 'strongest', filter: { role: 'attack' }, per: { metric: 'blocked' }, condition: present('path', '存护'), oncePerSpin: true, label: '盾阵反击', summary: '仍存活时，把本轮真实抵伤的一部分反击给最近敌人，不递归' })])),
  row('abundance', '丰饶', 'path', '丰饶', [2], '实际治疗减伤', '有丰饶角色登场时，按本轮实际治疗量÷3减少反击（可为小数），最多减少 3；溢出和维修补给不算。', [[e('retaliationFlat', 1, { stage: 'afterAttacks', per: { metric: 'healing', divisor: 3, cap: 3 }, condition: present('path', '丰饶'), label: '康复防线', summary: '反击减少本轮实际治疗量÷3（可为小数），最多 3；回合结束清空' })]]),
  row('harmony', '同谐', 'path', '同谐', [2, 3], '辅助放大', '登场同谐角色提供的相邻、定向威力增益提高 25% / 45%；增益仅对本轮有效。', [1.25, 1.45].map(value => [e('buffMultiplier', value, { trigger: 'passive', filter: { path: '同谐' }, label: '协奏', summary: '只放大同谐来源的本轮辅助增益，不把增益写入永久成长', stacking: '同一羁绊只取一档；其他增益来源仍按规则计算' })])),
  row('ice', '冻结编队', 'element', '冰', [3, 4], '寒霜减伤', '每种本轮实际登场的永久冰角色使敌方反击减少 0.5 / 1，最多按 3 种计算。', [0.5, 1].map(value => [e('retaliationFlat', value, { per: { metric: 'presentDistinct', filter: { element: '冰', temporary: false }, cap: 3 }, label: '寒霜防线', summary: '按本轮不同冰身份减伤；不会冻结跳过整轮' })])),
  row('lightning', '雷霆编队', 'element', '雷', [3, 4], '跨列电弧', '登场雷攻击者在攻击后向最近的另一存活列追加自身威力 20% / 35% 的电弧；只剩一列时不触发。', [0.2, 0.35].map(value => [e('damage', value, members({ stage: 'afterAttacks', excludeOriginColumn: true, per: { metric: 'sourcePower' }, condition: { metric: 'enemies', op: 'gte', value: 2 }, label: '跨列电弧', summary: '向来源格以外最近的存活列追加伤害；电弧不递归' }))])),
  row('fire', '烈焰编队', 'element', '火', [3], '首轮爆发', '当前遭遇第一次转动，火属性攻击角色本轮增加 2 点威力；按星级放大。', [[e('power', 2, members({ filter: { attackNot: 'support' }, condition: { metric: 'round', op: 'eq', value: 1 }, scaleWithStars: true, label: '点燃开局', summary: '仅本关第一次转动；换关重新获得开局机会' }))]]),
  row('wind', '流风编队', 'element', '风', [3, 4], '残敌收割', '本轮常规攻击后若仅剩 1–2 列敌人，登场风攻击者追加自身威力 25% / 45% 的伤害。', [0.25, 0.45].map(value => [e('damage', value, members({ stage: 'afterAttacks', per: { metric: 'sourcePower' }, conditions: [{ metric: 'enemies', op: 'gte', value: 1 }, { metric: 'enemies', op: 'lte', value: 2 }], label: '流风收割', summary: '残局才触发；仍沿来源格寻找最近存活列' }))])),
  row('quantum', '量子编队', 'element', '量子', [3, 4], '三身份合击', '至少三种永久量子身份本轮实际登场时，威力最高的量子角色在攻击后追加自身威力 70% / 120% 的合击。', [0.7, 1.2].map(value => [e('damage', value, { target: 'strongest', filter: { element: '量子', attackNot: 'support' }, stage: 'afterAttacks', per: { metric: 'sourcePower' }, condition: present('element', '量子', 3, true), oncePerSpin: true, label: '量子合击', summary: '不同身份同场后，由最强量子攻击者合击一次；不跨轮攒进度' })])),
  row('physical', '坚韧编队', 'element', '物理', [2], '击破经营', '物理角色本轮首次常规击破，获得 2 信用点；每个来源每轮一次。', [[e('resource', 2, members({ trigger: 'kill', resource: 'coins', oncePerSpin: true, duration: 'resource', label: '击破战利品', summary: '物理角色的实际常规击破产生信用点', stacking: '每位来源每轮一次，信用点保留至消费' }))]]),
  row('imaginary', '虚数编队', 'element', '虚数', [2], '禁锢减压', '有虚数角色实际登场时，本轮敌方反击降低 15%；不跳过敌人整轮。', [[e('retaliationMultiplier', 0.85, { condition: present('element', '虚数'), label: '虚数禁锢', summary: '有虚数登场才生效；仅本轮反击减伤', stacking: '同羁绊不重复；不同减伤来源按规则合成' })]]),
  row('remembrance', '记忆', 'path', '记忆', [2, 3], '召援协作', '有记忆角色登场时，本轮临时攻击者增加 1 / 2 点威力；临时角色仍不增加羁绊人数。', [1, 2].map(value => [e('power', value, { target: 'matching', filter: { temporary: true }, condition: present('path', '记忆'), label: '记忆共演', summary: '强化本轮实际抽中的临时角色，不延长其存在期限' })])),
  row('ipc', '公司筹策', 'faction', '星际和平公司', [2, 3], '入关经营', '进入新关时获得 5 / 8 信用点；每关一次，不受是否当轮抽中影响。', [5, 8].map(value => [e('resource', value, { trigger: 'floor', resource: 'coins', duration: 'resource', label: '公司预算', summary: '进入新关时补给信用点；不能靠重载或打开说明重复领取', stacking: '每关入场一次，信用点保留至消费' })])),
];

export function getSynergiesFor(state, characterById) {
  const permanent = [...new Set((state?.roster || []).filter(u => !u.temporary && !u.commission).map(u => u.id))].map(characterById).filter(Boolean);
  return SYNERGIES.map(synergy => {
    const count = permanent.filter(c => c[synergy.kind] === synergy.tag).length;
    const tier = synergy.thresholds.filter(threshold => count >= threshold).length;
    return { ...synergy, count, tier, active: tier > 0, effects: tier ? synergy.tierEffects[tier - 1] : [] };
  });
}

// These modifiers change offensive resonance outcomes only; resource generation,
// healing, control, durations and trigger counts are deliberately not amplified.
export function synergyOffenseScale(state) {
  return ((state.items || []).includes('divination_candle') ? 1.5 : 1) * ((state.activeDebuffs || []).some(d => d.id === 'synergy_audit') ? 0.75 : 1);
}

export function matchesSynergyFilter(unit, filter, characterById) {
  const c = characterById(unit?.id);
  if (!c) return false;
  if (filter?.id !== undefined && unit.id !== filter.id) return false;
  if (filter?.ids && !filter.ids.includes(unit.id)) return false;
  if (filter?.commission !== undefined && Boolean(unit.commission) !== filter.commission) return false;
  if (filter?.group || filter?.groupsAny) return false;
  if (filter?.anyOf && !filter.anyOf.some(part => matchesSynergyFilter(unit, part, characterById))) return false;
  for (const key of ['path', 'element', 'faction', 'attack', 'role']) {
    if (filter?.[key] !== undefined && c[key] !== filter[key]) return false;
    if (filter?.[`${key}Not`] !== undefined && c[key] === filter[`${key}Not`]) return false;
  }
  if (filter?.temporary !== undefined && Boolean(unit.temporary || unit.status === 'expired') !== filter.temporary) return false;
  if (filter?.starsMin !== undefined && unit.stars < filter.starsMin) return false;
  if (filter?.starsMax !== undefined && unit.stars > filter.starsMax) return false;
  return true;
}

const chooseRatio = (available, population, draws) => {
  if (available < draws) return 0;
  let result = 1;
  for (let i = 0; i < draws; i++) result *= (available - i) / (population - i);
  return result;
};

// Exact probability for the 1–3 distinct-identity gates used by this ruleset.
// Nonmatching units may still fill slots. Repeated copies are one identity, but
// improve its chance of being drawn; no previous board or hidden RNG is read.
export function distinctPresenceProbability(state, filter, minimum, characterById, boardSize = 20) {
  const roster = state.roster || [], n = roster.length, draws = Math.min(boardSize, n);
  const groups = new Map();
  for (const unit of roster) if (matchesSynergyFilter(unit, filter, characterById)) groups.set(unit.id, (groups.get(unit.id) || 0) + 1);
  if (minimum <= 0) return 1;
  if (groups.size < minimum || !n) return 0;
  if (draws === n) return 1;
  const counts = [...groups.values()], outside = n - counts.reduce((sum, count) => sum + count, 0);
  const none = chooseRatio(outside, n, draws);
  if (minimum === 1) return 1 - none;
  let exactlyOne = 0;
  for (const count of counts) exactlyOne += chooseRatio(outside + count, n, draws) - none;
  if (minimum === 2) return Math.max(0, Math.min(1, 1 - none - exactlyOne));
  let exactlyTwo = 0;
  for (let a = 0; a < counts.length; a++) for (let b = a + 1; b < counts.length; b++) exactlyTwo += chooseRatio(outside + counts[a] + counts[b], n, draws) - chooseRatio(outside + counts[a], n, draws) - chooseRatio(outside + counts[b], n, draws) + none;
  if (minimum === 3) return Math.max(0, Math.min(1, 1 - none - exactlyOne - exactlyTwo));
  return Math.max(0, Math.min(1, (draws / n) ** minimum));
}

// The caller supplies the generic shared-DSL estimator. Every coefficient and
// threshold remains in the same tierEffects consumed by the real engine.
export function estimateSynergyContributions(state, { characterById, estimateEffect, ...context }) {
  const total = { damage: 0, power: 0, healing: 0, shields: 0, reduction: 0, economy: 0, growth: 0, flexibility: 0 };
  for (const synergy of getSynergiesFor(state, characterById).filter(s => s.active)) {
    for (const effect of synergy.effects) {
      const delta = estimateEffect(effect, { ...context, state, synergy, sourceType: 'synergy', filter: synergy.filter });
      for (const key of Object.keys(total)) total[key] += Number.isFinite(delta?.[key]) ? delta[key] : 0;
    }
  }
  return total;
}
