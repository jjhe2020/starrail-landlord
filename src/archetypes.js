// Membership describes this game's mechanical fit, not an official faction.
import { BINDING_GROUPS } from './content.js';
const effect = (type, value, extra = {}) => ({ type, value, trigger: 'spin', duration: 'spin', target: 'matching', stacking: type === 'powerMultiplier' ? '同一角色的套路倍率只取最高，与其他类别倍率按规则合成' : '不同套路功能可叠加，同套路每轮一次', ...extra });
const define = (id, name, threshold, coreIds, description, effects) => {
  const memberIds = BINDING_GROUPS.find(group => group.id === id).memberIds;
  return { id, name, threshold, coreRequired: 1, coreIds, memberIds,
    description, activation: `${threshold} 个不同永久成员 + 至少 1 个核心；重复、临时与见习副本不计人数`,
    effects: effects.map(e => ({ ...e, filter: { ids: memberIds, ...e.filter } })),
  };
};
const attack = { role: 'attack', attackNot: 'support' };

export const ARCHETYPES = [
  define('ink_dot', '虚无引爆', 5, ['1005', '1307', '1308'],
    '干扰者制造受限易伤，由引爆攻击者兑现；成型不再自动产生永久成长。', [
      effect('powerMultiplier', 1.2, { filter: attack, summary: '成型：引爆攻击者本轮威力×1.2' }),
      effect('damage', 0.25, { target: 'strongest', stage: 'afterAttacks', per: { metric: 'sourcePower' }, filter: attack, condition: { metric: 'present', filter: { group: 'ink_dot', role: 'disruptor' }, op: 'gte', value: 1 }, summary: '有引爆干扰者同场时，最强引爆攻击者追加自身威力25%的震荡' }),
    ]),
  define('follow_up', '追加投资', 5, ['1112', '1305', '1220'],
    '追击攻击者配合投资增幅、护盾风控与培养；成型提供有限的额外追击。', [
      effect('powerMultiplier', 1.25, { filter: attack, summary: '成型：追加投资攻击者本轮威力×1.25' }),
      effect('damage', 0.4, { target: 'strongest', stage: 'afterAttacks', per: { metric: 'sourcePower' }, filter: attack, summary: '最强追加投资攻击者追加自身威力40%的攻击，不递归' }),
    ]),
  define('frost', '冰盾反击', 4, ['1104', 'dan_heng_pt'],
    '守望伙伴提供生存，攻击者兑现真实抵伤产生的反击；防御者本身不转为攻击者。', [
      effect('powerMultiplier', 1.15, { filter: attack, summary: '成型：守望攻击者本轮威力×1.15' }),
      effect('damage', 0.35, { trigger: 'retaliation', stage: 'afterRetaliation', target: 'strongest', per: { metric: 'blocked' }, filter: attack, summary: '仍存活时，最强守望攻击者反击本轮真实抵伤的35%' }),
    ]),
  define('mentorship', '仙舟授业', 5, ['1204', '1212', '1220'],
    '导师提供永久培养，医护维持授业时间；套路奖励依赖导师同场，但不代替导师成长技能。', [
      effect('powerMultiplier', 1.2, { filter: attack, summary: '成型：授业攻击者本轮威力×1.2' }),
      effect('power', 0.3, { filter: attack, per: { metric: 'present', filter: { group: 'mentorship', role: 'trainer' }, cap: 2 }, summary: '每名同场授业培养者使授业攻击者本次威力+0.3，最多2名' }),
    ]),
  define('puppet', '空间站实验', 4, ['1303', 'the_herta'],
    '实验培养交给科员，智识与单体程序完成周期爆发；成型不再自动累积永久成长。', [
      effect('powerMultiplier', 1.2, { filter: attack, summary: '成型：实验攻击者本轮威力×1.2' }),
      effect('damage', 0.4, { every: 3, target: 'strongest', stage: 'afterAttacks', per: { metric: 'sourcePower' }, filter: attack, summary: '本关每第3次转动，最强实验攻击者追加自身威力40%的验算' }),
    ]),
  define('recollection', '忆灵共演', 5, ['1402', '1407', 'evernight', 'cyrene'],
    '培养、援护与忆灵攻击共同搭台，有限成型增幅不替代各自职责。', [
      effect('powerMultiplier', 1.25, { filter: attack, summary: '成型：共演攻击者本轮威力×1.25' }),
      effect('power', 0.6, { filter: { ids: ['1206', '1002', '1109'], temporary: true, role: 'attack' }, summary: '成型：本轮临时素裳、丹恒或虎克威力+0.6，不延长期限' }),
    ]),
  define('elation', '欢愉谢幕', 4, ['1306', 'aha', 'aeon_star_aha'],
    '舞台培养与即时增幅支援专职攻击者，退场事件兑换当轮火力。', [
      effect('powerMultiplier', 1.25, { filter: attack, summary: '成型：欢愉攻击者本轮威力×1.25' }),
      effect('power', 0.5, { per: { metric: 'retirements', cap: 3 }, filter: attack, summary: '本轮每名角色退场使欢愉攻击者威力+0.5，最多3名，不写入成长' }),
    ]),
  define('break', '击破接力', 5, ['1310', '1317', '1315'],
    '击破攻击、定向弱化和医护培养形成接力，首次击破带来有限追击。', [
      effect('powerMultiplier', 1.25, { filter: attack, summary: '成型：击破接力攻击者本轮威力×1.25' }),
      effect('damage', 0.5, { trigger: 'kill', oncePerSpin: true, target: 'strongest', includeSource: true, per: { metric: 'sourcePower' }, filter: attack, summary: '本轮首次常规击破后，最强击破攻击者追加自身威力50%的攻击' }),
    ]),
];

let effectsSuppressed = 0;
const suppressedIds = new Map();
// Synchronous counterfactual probe only. This switch is never stored in a save.
export function withoutArchetypeEffects(callback, ids = null) {
  if (ids === null) effectsSuppressed++;
  else for (const id of ids) suppressedIds.set(id, (suppressedIds.get(id) || 0) + 1);
  try { return callback(); } finally {
    if (ids === null) effectsSuppressed--;
    else for (const id of ids) { const count = suppressedIds.get(id) - 1; if (count) suppressedIds.set(id, count); else suppressedIds.delete(id); }
  }
}

export function getArchetypes(state) {
  const identities = new Set((state?.roster || []).filter(u => !u.temporary && !u.commission).map(u => u.id));
  return ARCHETYPES.map(definition => {
    const members = definition.memberIds.filter(id => identities.has(id));
    const cores = definition.coreIds.filter(id => identities.has(id));
    const formed = members.length >= definition.threshold && cores.length >= definition.coreRequired;
    return { ...definition, count: members.length, coreCount: cores.length, members, cores,
      formed, active: formed, progress: Math.min(1, members.length / definition.threshold) * (cores.length ? 1 : 0.65),
      effects: formed && !effectsSuppressed && !suppressedIds.has(definition.id) ? definition.effects : [] };
  });
}

export const archetypesForCharacter = id => ARCHETYPES.filter(a => a.memberIds.includes(String(id)));
export const isArchetypeCore = id => ARCHETYPES.some(a => a.coreIds.includes(String(id)));
