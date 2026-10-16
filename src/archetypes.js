// Gameplay adaptations: membership means mechanical fit, not an official faction.
// Formation only counts independently recruited permanent identities.
const effect = (type, value, extra = {}) => ({ type, value, trigger: 'spin', duration: 'spin', target: 'matching', stacking: type === 'powerMultiplier' ? '同一角色的套路倍率只取最高，与其他类别倍率按规则合成' : '不同套路功能可叠加，同套路每轮一次', ...extra });
const define = (id, name, threshold, coreIds, memberIds, description, effects) => ({
  id, name, threshold, coreRequired: 1, coreIds, memberIds: [...new Set([...coreIds, ...memberIds])],
  description, activation: `${threshold} 个不同永久成员 + 至少 1 个核心；重复、临时与见习副本不计人数`,
  effects: effects.map(e => ({ ...e, filter: { ids: [...new Set([...coreIds, ...memberIds])], ...e.filter } })),
});

export const ARCHETYPES = [
  define('ink_dot', '虚无引爆', 5, ['1005', '1307', '1308'],
    ['1004', '1006', '1106', '1108', '1111', '1210', '1218', 'hysilens', 'mortenax_blade'],
    '先积累虚无伙伴，成型后以持续增幅和最强成员的震荡集中火力。', [
      effect('powerMultiplier', 1.55, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×1.55' }),
      effect('damage', 0.7, { target: 'strongest', stage: 'afterAttacks', per: { metric: 'sourcePower' }, filter: { attackNot: 'support' }, summary: '成型：常规攻击后，最强套路攻击者追加自身威力70%的震荡伤害' }),
    ]),
  define('follow_up', '追加投资', 5, ['1112', '1305', '1220'],
    ['1304', '1223', 'march_hunt', '1107', '1221', '1309', '1314', 'archer', 'ashveil', 'aventurine_waveflair'],
    '前期同时准备巡猎与追击伙伴，成型后强者带队追加投资。', [
      effect('powerMultiplier', 1.9, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×1.9' }),
      effect('damage', 1.25, { target: 'strongest', stage: 'afterAttacks', per: { metric: 'sourcePower' }, filter: { attackNot: 'support' }, summary: '成型：最强套路攻击者追加自身威力125%的伤害，不再触发追加' }),
    ]),
  define('frost', '冰盾反击', 4, ['1104', '1304'],
    ['1001', '1103', '1106', '1101', '1110', '1105', '1208', 'dan_heng_pt', 'pearl'],
    '防御角色会挤占前期输出位置；成型后将真实抵伤转为反击，补回输出缺口。', [
      effect('powerMultiplier', 2.6, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×2.6' }),
      effect('damage', 1.5, { trigger: 'retaliation', stage: 'afterRetaliation', target: 'strongest', per: { metric: 'blocked' }, filter: { attackNot: 'support' }, summary: '成型：仍存活时向最近敌列反击本轮真实抵伤的150%' }),
    ]),
  define('mentorship', '仙舟授业', 5, ['1204', '1212', '1220'],
    ['1209', '1206', 'march_hunt', '1221', '1207', '1202', '1217', '1214', '1215', '1211', '1223', 'dan_heng_imbibitor_lunae'],
    '前期为导师与弟子保留位置；成型后每次登场积累永久成长，擅长较长的战斗。', [
      effect('powerMultiplier', 1.5, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×1.5' }),
      effect('growth', 0.5, { duration: 'run', filter: { temporary: false, commission: false, attackNot: 'support' }, summary: '成型：本轮登场的永久套路攻击成员各永久成长+0.5（见习除外）' }),
    ]),
  define('puppet', '空间站实验', 4, ['1303', 'the_herta'],
    ['1013', '1009', '1008', '1305', '1006', '1003', 'silver_wolf_lv999'],
    '开局科员可以积累开题条件，但须找到核心；成型后实验者逐轮成长。', [
      effect('powerMultiplier', 1.4, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×1.4' }),
      effect('growth', 0.28, { duration: 'run', filter: { temporary: false, commission: false, attackNot: 'support' }, summary: '成型：登场的永久套路攻击成员各永久成长+0.28（见习除外）' }),
    ]),
  define('recollection', '忆灵共演', 5, ['1402', '1407', 'evernight', 'cyrene'],
    ['1409', '1312', '1313', '1403', '1405', '1408', 'cerydra', 'robin_summeretto'],
    '需要五种身份串起记忆舞台；成型后登场者放大火力，临时召援也可共享本轮加成。', [
      effect('powerMultiplier', 4.6, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×4.6' }),
      effect('power', 2, { filter: { temporary: true, ids: ['1206', '1002', '1109', '1210'] }, summary: '成型：本轮登场的临时援军（素裳、丹恒、虎克、桂乃芬）额外威力+2，不延长期限' }),
    ]),
  define('elation', '欢愉谢幕', 4, ['1306', 'aha', 'aeon_star_aha'],
    ['1108', '1210', '1201', '1406', '1301', '1312', 'sparxie', 'yao_guang', 'evanescia', 'pearl', 'aventurine_waveflair'],
    '四身份与欢愉核心开演；委派、召援退场能转为当轮谢幕火力。', [
      effect('powerMultiplier', 2.6, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×2.6' }),
      effect('power', 1.4, { per: { metric: 'retirements', cap: 3 }, filter: { attackNot: 'support' }, summary: '成型：本轮每位角色退场使套路攻击成员威力+1.4，最多3位；不写入成长' }),
    ]),
  define('break', '击破接力', 5, ['1310', '1317', '1315'],
    ['fugue', '1301', '1303', '1222', '1206', '1111', '1214', 'the_dahlia', 'saber'],
    '先分散准备击破与辅助成员，成型后提升基础火力，并把首个击破接成追击。', [
      effect('powerMultiplier', 2.35, { filter: { attackNot: 'support' }, summary: '成型：套路攻击成员本轮威力×2.35' }),
      effect('damage', 0.8, { trigger: 'kill', oncePerSpin: true, target: 'strongest', includeSource: true, per: { metric: 'sourcePower' }, filter: { attackNot: 'support' }, summary: '成型：本轮首次常规击破后，由最强套路攻击者（可为击破者）追加自身威力80%的伤害' }),
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
