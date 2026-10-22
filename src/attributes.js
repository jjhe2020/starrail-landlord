import { characterById } from './content.js';

const rounded = value => Math.round(value * 1000000) / 1000000;
/** Permanent card attributes. Spin buffs and outgoing damage never enter this value. */
export function getCharacterAttributes(instance, state = null) {
  const c = characterById(instance?.id);
  if (!c) return { baseAttack:0, starAttack:0, attackBonus:0, attack:0, normalAttack:{pattern:'single',primary:0,adjacent:0,eachTarget:0} };
  const stars = instance.stars || 1;
  const baseAttack = c.baseAttack ?? c.power;
  const starAttack = c.baseAttackByStar?.[stars] ?? baseAttack * [0,1,3,9][stars];
  const attackBonus = instance.attackBonus ?? instance.growth ?? 0;
  const permanentPercent = instance.attackPercentBonus || 0;
  const normalAttack = { ...(c.normalAttackByStar?.[stars] || c.normalAttack || { pattern:c.attack, primary:c.attack === 'single' ? 3 : 2, adjacent:1, eachTarget:1 }) };
  for (const key of ['primary','adjacent','eachTarget']) normalAttack[key] = rounded((normalAttack[key] || 0) + (instance.normalAttackBonus?.[key] || 0));
  return { baseAttack, starAttack, attackBonus, permanentPercent, attack:rounded((starAttack + attackBonus) * (1 + permanentPercent)), normalAttack };
}
