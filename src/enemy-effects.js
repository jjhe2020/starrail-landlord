import { characterById, SYNERGIES } from './content.js';

export const POLLUTION_ATTACK_MULTIPLIER = 0.85;

const characters = state => state.roster.map(u => characterById(u.id)).filter(Boolean);
const hasCharacter = (state, id) => state.roster.some(u => u.id === id);
const hasPath = (state, path) => characters(state).some(c => c.path === path);
const hasAttack = (state, attack) => characters(state).some(c => c.attack === attack);
const adjacency = state => state.roster.length > 1 && ['1009', '1101', '1106', '1202'].some(id => hasCharacter(state, id));
const healing = state => ['1105', '1203'].some(id => hasCharacter(state, id)) || state.items.includes('dimension_dice') || state.items.includes('insect_web') && state.roster.some(u => u.temporary || u.id === '1108');
const shielding = state => ['1001', '1104', '1208', '1203'].some(id => hasCharacter(state, id)) || state.shield > 0 || state.items.includes('preservation_wax');
const clause = (id, name, description, eligible) => ({ id, name, description, eligible });

// Each clause softens a relevant mechanic for this encounter. No permanent bans.
export const ENEMY_DEBUFFS = [
  clause('path_hunt', '巡猎征税', '巡猎角色威力降低 20%。', s => hasPath(s, '巡猎')),
  clause('path_destruction', '毁灭限额', '毁灭角色威力降低 20%。', s => hasPath(s, '毁灭')),
  clause('path_erudition', '智识稽核', '智识角色威力降低 20%。', s => hasPath(s, '智识')),
  clause('path_nihility', '虚无审查', '虚无角色威力降低 20%。', s => hasPath(s, '虚无')),
  clause('path_preservation', '存护折旧', '存护角色产生的护盾降低 25%。', s => hasPath(s, '存护')),
  clause('path_abundance', '丰饶限流', '丰饶角色的治疗降低 25%。', s => hasPath(s, '丰饶')),
  clause('path_harmony', '同谐隔离', '同谐角色提供的相邻和定向威力增益降低 30%。', s => adjacency(s) && hasPath(s, '同谐')),
  clause('attack_single', '单体附加税', '单体攻击角色威力降低 20%。', s => hasAttack(s, 'single')),
  clause('attack_blast', '扩散限额', '扩散攻击角色威力降低 20%。', s => hasAttack(s, 'blast')),
  clause('attack_aoe', '群攻摊销', '群体攻击角色威力降低 20%。', s => hasAttack(s, 'aoe')),
  clause('growth_audit', '成长折旧', '本层新增永久成长降低 50%；已有成长保留。', s => ['1002', '1107', '1205'].some(id => hasCharacter(s, id))),
  clause('adjacency_audit', '邻接隔断', '相邻角色与定向威力增益降低 40%。', adjacency),
  clause('star_audit', '升星差额税', '二星、三星的基础威力和角色技能倍率降低 20%；不会降星。', s => s.roster.some(u => u.stars > 1)),
  clause('summon_audit', '召援登记', '桑博召来临时虎克的概率由 25% 降至 12.5%。', s => hasCharacter(s, '1108')),
  clause('consume_audit', '消耗手续费', '虎克消耗临时角色的威力奖励由 4 降至 2。', s => hasCharacter(s, '1109') && s.roster.some(u => u.temporary)),
  clause('danheng_audit', '丹恒成长审计', '丹恒每 4 次登场才成长一次，原为每 3 次。', s => hasCharacter(s, '1002')),
  clause('herta_audit', '黑塔转动折损', '黑塔第 3 次登场的额外威力由 2 降至 1。', s => hasCharacter(s, '1013')),
  clause('qingque_audit', '暗杠限额', '青雀四倍威力的触发概率由 20% 降至 10%。', s => hasCharacter(s, '1201')),
  clause('seele_audit', '再现滞留', '希儿击破追击的威力降低 50%。', s => hasCharacter(s, '1102')),
  clause('kafka_audit', '感电稽核', '卡芙卡为虚无角色提供的威力增益降低 50%。', s => hasCharacter(s, '1005')),
  clause('welt_audit', '禁锢抵抗', '瓦尔特降低敌人反击伤害的效果降低 50%。', s => hasCharacter(s, '1004')),
  clause('fuxuan_audit', '穷观阵裂隙', '符玄的反击减伤由 20% 降至 10%。', s => hasCharacter(s, '1208')),
  clause('march_audit', '六相冰折损', '三月七产生的护盾降低 50%。', s => hasCharacter(s, '1001')),
  clause('natasha_audit', '急救限流', '娜塔莎的治疗降低 50%。', s => hasCharacter(s, '1105')),
  clause('essence_audit', '精华缓释', '尚未触发的精华进度获取降低 25%。', s => s.essences.some(e => !e.triggered)),
  clause('synergy_audit', '羁绊征收', '已激活羁绊的威力加成降低 25%。', s => {
    const unique = [...new Set(s.roster.filter(u => !u.temporary).map(u => u.id))].map(characterById);
    return SYNERGIES.some(effect => unique.filter(c => c[effect.kind] === effect.tag).length >= effect.thresholds[0] && unique.some(c => c[effect.kind] === effect.tag && c.attack !== 'support'));
  }),
  clause('healing_audit', '医疗折价', '角色、羁绊和奇物的治疗降低 25%；信用补给维修保持固定数值。', healing),
  clause('shield_audit', '护盾折价', '角色、羁绊和奇物产生的护盾降低 25%；信用补给护盾保持固定数值。', shielding),
  clause('shield_pierce', '贯穿反击', '敌人反击的 25% 直接损失生命，其余仍可由护盾抵挡。', shielding),
  clause('shield_decay', '护盾滞纳金', '每次转动开始时，已有护盾减少 20%。', shielding),
  clause('healthy_audit', '满血溢价', '生命高于上限一半时，攻击角色的威力降低 15%。', s => characters(s).some(c => c.attack !== 'support') && s.hp > s.maxHp / 2),
  { ...clause('rift_pollution', '裂界污染', '指定一星实例实际登场时直接消耗 6 生命，自身威力降低 50%，本轮全队攻击角色最终威力降低 15%；辅助治疗和护盾不受此影响。移除或合成该实例可解除，仅本关有效。', s => s.roster.some(u => !u.temporary && u.stars === 1)), fixed: true },
];

export const enemyDebuffById = id => ENEMY_DEBUFFS.find(effect => effect.id === id);
export const hasDebuff = (state, id) => state.activeDebuffs?.some(effect => effect.id === id) || false;
export function getEligibleDebuffs(state) {
  return ENEMY_DEBUFFS.filter(effect => !effect.fixed && !hasDebuff(state, effect.id) && effect.eligible(state));
}
export function publicDebuff(effect, source, addedRound) {
  return { id: effect.id, name: effect.name, description: effect.description, source, addedRound };
}

export function pollutionDescription(name) {
  return `${name}（一星）的被标记实例：实际登场时直接消耗 6 生命，自身威力降低 50%，并使本轮全队攻击角色最终威力降低 15%；辅助治疗和护盾保持正常。移除或合成该实例解除污染，仅本关生效。`;
}
// Exact text from the unpublished version-two preview. Accept only this known
// description after the target and every other save field have been validated.
export function legacyPollutionDescription(name) {
  return `${name}（一星）的被标记实例：实际登场时直接消耗 6 生命，威力降低 50%；移除或合成该实例解除污染，仅本关生效。`;
}
export const isPolluted = (state, uid) => state.activeDebuffs?.some(effect => effect.id === 'rift_pollution' && effect.targetUid === uid) || false;

export function unitPowerMultiplier(state, character, instance = null, pollutionTriggered = false) {
  let multiplier = 1;
  const paths = { '巡猎': 'path_hunt', '毁灭': 'path_destruction', '智识': 'path_erudition', '虚无': 'path_nihility' };
  if (paths[character.path] && hasDebuff(state, paths[character.path])) multiplier *= 0.8;
  if (hasDebuff(state, `attack_${character.attack}`)) multiplier *= 0.8;
  if (character.attack !== 'support' && hasDebuff(state, 'healthy_audit') && state.hp > state.maxHp / 2) multiplier *= 0.85;
  if (instance && isPolluted(state, instance.uid)) multiplier *= 0.5;
  // Only the real board draw establishes this flag. Static callers must not
  // infer next-turn pollution from a previous spin's persisted board snapshot.
  if (pollutionTriggered && hasDebuff(state, 'rift_pollution') && character.attack !== 'support') multiplier *= POLLUTION_ATTACK_MULTIPLIER;
  return multiplier;
}

export function utilityMultiplier(state, instance, kind) {
  const character = characterById(instance.id);
  let multiplier = 1;
  if (kind === 'heal' && character.path === '丰饶' && hasDebuff(state, 'path_abundance')) multiplier *= 0.75;
  if (kind === 'shield' && character.path === '存护' && hasDebuff(state, 'path_preservation')) multiplier *= 0.75;
  if (kind === 'shield' && instance.id === '1001' && hasDebuff(state, 'march_audit')) multiplier *= 0.5;
  if (kind === 'heal' && instance.id === '1105' && hasDebuff(state, 'natasha_audit')) multiplier *= 0.5;
  if (kind === 'buff') {
    if (character.path === '同谐' && hasDebuff(state, 'path_harmony')) multiplier *= 0.7;
    if (hasDebuff(state, 'adjacency_audit')) multiplier *= 0.6;
  }
  return multiplier;
}
