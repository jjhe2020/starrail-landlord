import { CHARACTERS } from './content.js';
// Internal draft-policy metadata only. Neither formation nor membership grants
// combat effects, protects a card from retirement, or creates a gameplay tag.
const define = (id, name, filters, threshold = 5) => ({
  id, name, filters, threshold, coreRequired: 0, coreIds: [], effects: [],
  memberIds: CHARACTERS.filter(c => filters.some(filter => Object.entries(filter).every(([key, value]) => c[key] === value))).map(c => c.id),
  description: `测试拿牌偏好：${filters.map(f => Object.values(f).join('＋')).join('或')}。仅用于比较选择策略，没有成型奖励。`,
  activation: '仅统计正式标签覆盖；不会激活额外技能或倍率',
});
export const ARCHETYPES = [
  define('ink_dot', '虚无＋雷', [{ path: '虚无' }, { element: '雷' }]),
  define('follow_up', '公司＋巡猎', [{ faction: '星际和平公司' }, { path: '巡猎' }]),
  define('frost', '冰＋存护', [{ element: '冰' }, { path: '存护' }]),
  define('mentorship', '仙舟＋巡猎', [{ faction: '仙舟罗浮' }, { faction: '仙舟曜青' }, { faction: '仙舟朱明' }, { path: '巡猎' }]),
  define('puppet', '空间站＋智识', [{ faction: '黑塔空间站' }, { path: '智识' }]),
  define('recollection', '翁法罗斯＋记忆', [{ faction: '翁法罗斯' }, { path: '记忆' }]),
  define('elation', '欢愉＋量子', [{ path: '欢愉' }, { element: '量子' }]),
  define('break', '火＋毁灭', [{ element: '火' }, { path: '毁灭' }]),
];
export function getArchetypes(state) {
  const identities = new Set((state?.roster || []).filter(u => !u.temporary && !u.commission).map(u => u.id));
  return ARCHETYPES.map(definition => {
    const members = definition.memberIds.filter(id => identities.has(id));
    const formed = members.length >= definition.threshold;
    return { ...definition, count: members.length, coreCount: 0, members, cores: [], formed, active: formed, progress: Math.min(1, members.length / definition.threshold), effects: [] };
  });
}
// Retained for historical diagnostic readers; there are no route effects left.
export const withoutArchetypeEffects = callback => callback();
export const archetypesForCharacter = id => ARCHETYPES.filter(a => a.memberIds.includes(String(id)));
export const isArchetypeCore = () => false;
