// Cited relationships are narrative context; all assignments, deletions and rewards are adaptations.
// Definitions are trusted content. Saves only hold counters and unit markers.
export const RETIREMENT_RULES = Object.freeze([
  { id: 'express_photography', sourceId: '1003', targetId: '1001', sourceName: '姬子', targetName: '三月七', name: '巡航摄影委派', relation: '姬子照顾并指导三月七，三月七的弓亦由姬子制作。', source: 'https://honkai-star-rail.fandom.com/wiki/March_7th/Lore' },
  { id: 'express_archives', sourceId: '1004', targetId: '1002', sourceName: '瓦尔特', targetName: '丹恒', name: '智库外勤归档', relation: '瓦尔特与丹恒同属列车，明确承诺保护丹恒。', source: 'https://honkai-star-rail.fandom.com/wiki/Welt/Dialogue' },
  { id: 'guardian_report', sourceId: '1101', targetId: '1106', sourceName: '布洛妮娅', targetName: '佩拉', name: '银鬃情报交接', relation: '布洛妮娅的组队语音直接要求佩拉提交战斗报告。', source: 'https://honkai-star-rail.fandom.com/wiki/Pela/Lore' },
  { id: 'landau_maintenance', sourceId: '1104', targetId: '1103', sourceName: '杰帕德', targetName: '希露瓦', name: '朗道装备检修', relation: '希露瓦是杰帕德的姐姐，两人共同支援贝洛伯格。', source: 'https://honkai-star-rail.fandom.com/wiki/Not_Good_With_Farewells' },
  { id: 'wildfire_training', sourceId: '1102', targetId: '1111', sourceName: '希儿', targetName: '卢卡', name: '地火拳术集训', relation: '希儿与卢卡同为地火成员，卢卡会向希儿约战。', source: 'https://honkai-star-rail.fandom.com/wiki/Luka/Dialogue' },
  { id: 'moles_expedition', sourceId: '1107', targetId: '1109', sourceName: '克拉拉', targetName: '虎克', name: '鼹鼠队探险收工', relation: '虎克是克拉拉的第一位朋友，并邀请她成为鼹鼠党荣誉成员。', source: 'https://honkai-star-rail.fandom.com/wiki/Clara/Lore' },
  { id: 'ipc_settlement', sourceId: '1112', targetId: '1009', sourceName: '托帕&账账', targetName: '艾丝妲', name: '空间站账目结清', relation: '托帕熟识艾丝妲及其母亲；黑塔亦曾让艾丝妲代付欠款。', source: 'https://honkai-star-rail.fandom.com/wiki/Asta/Lore' },
  { id: 'divination_shift', sourceId: '1208', targetId: '1201', sourceName: '符玄', targetName: '青雀', name: '太卜司轮值交接', relation: '符玄与青雀是太卜司的上下级，并共同经历岁阳事件。', source: 'https://honkai-star-rail.fandom.com/wiki/Percipient' },
  { id: 'ten_lords_leave', sourceId: '1215', targetId: '1214', sourceName: '寒鸦', targetName: '雪衣', name: '十王司结案休假', relation: '寒鸦与雪衣是姐妹及十王司同僚；寒鸦邀请判决后的姐姐散步。', source: 'https://honkai-star-rail.fandom.com/wiki/Xueyi/Lore' },
  { id: 'ghost_hunt_wrap', sourceId: '1217', targetId: '1210', sourceName: '藿藿', targetName: '桂乃芬', name: '捉鬼直播收工', relation: '藿藿与桂乃芬共同捉鬼，组队语音中互相照应。', source: 'https://honkai-star-rail.fandom.com/wiki/Guinaifen/Lore' },
].map(rule => Object.freeze({ ...rule, adaptation: '本作协作委派：创建、删除角色及属性奖励均为游戏规则，并非原作剧情或召唤能力', targetOriginalRarity: 4, every: 3, supplyEvery: 4, attackGrowth: rule.sourceId === '1215' ? 0 : 0.35, coins: rule.sourceId === '1215' ? 3 : 2, power: ['1003', '1102', '1107', '1112'].includes(rule.sourceId) ? 1.5 : 0 })));

export const retirementRulesFor = id => RETIREMENT_RULES.filter(rule => rule.sourceId === id || rule.targetId === id);
export const retirementRuleById = id => RETIREMENT_RULES.find(rule => rule.id === id);
export const newRetirementStats = () => ({ completed: 0, permanent: 0, supplied: 0, byRule: {} });

// Protect investment and the last copy equally, regardless of how a character was created.
export function retirementEligibility(state, source, target, { consumed = new Set() } = {}) {
  const rule = RETIREMENT_RULES.find(entry => entry.sourceId === source?.id && entry.targetId === target?.id);
  if (!rule || source?.uid === target?.uid) return { eligible: false, reason: '没有对应委派关系' };
  if (source.status || consumed.has(source.uid)) return { eligible: false, reason: '主持角色已被删除' };
  if (target.status || consumed.has(target.uid)) return { eligible: false, reason: '该角色已被删除' };
  if (target.stars !== 1) return { eligible: false, reason: '保护所有二星及三星角色' };
  if ((target.attackBonus ?? target.attackGrowth ?? target.growth ?? 0) > 1) return { eligible: false, reason: '保护永久攻击力增量超过1的角色' };
  const copies = state.roster.filter(u => u.id === target.id && !u.status && !consumed.has(u.uid));
  if (copies.length < 2) return { eligible: false, reason: '保留最后一名同名角色' };
  return { eligible: true, reason: '额外的一星角色可委派，永久攻击力增量不超过1', rule };
}

export function getRetirementPreview(state) {
  return RETIREMENT_RULES.filter(rule => state.roster.some(u => u.id === rule.sourceId && !u.status)).map(rule => {
    const hosts = state.roster.filter(u => u.id === rule.sourceId && !u.status);
    const targets = state.roster.filter(u => u.id === rule.targetId);
    const eligible = targets.filter(target => hosts.some(source => retirementEligibility(state, source, target, {}).eligible));
    return { ...rule, sourceUids: hosts.map(u => u.uid), eligibleUids: eligible.map(u => u.uid), targetUids: targets.map(u => u.uid), nextAppearance: Math.min(...hosts.map(u => rule.every - u.ticks % rule.every)),
      summary: `每第${rule.every}次实际登场，若相邻有符合条件的${rule.targetName}，将其从本局删除，获得${rule.coins}信用点${rule.attackGrowth ? `，主持角色攻击力永久增加${rule.attackGrowth}（仅本局）` : ''}${rule.power ? `，本次转动攻击力增加${rule.power}` : ''}。可选目标须为一星、永久攻击力增量不超过1，且保留最后一名同名角色。拥有过${rule.targetName}后，每第${rule.supplyEvery}次登场创建1名该角色，下次转动起可登场；同一委派同时最多保留1名由其创建的角色。创建的角色正常参与合成、羁绊和属性提升。` };
  });
}
