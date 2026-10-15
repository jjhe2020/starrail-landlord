// Gameplay data is deliberately separate from the engine and UI.
export const RARITY_LABELS = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };
const character = (id, name, enName, rarity, attack, power, path, element, faction, description, color) => ({
  id, name, enName, assetId: Number(id), rarity, attack, power, path, element, faction, description, color,
});

export const CHARACTERS = [
  character('1001', '三月七', 'March 7th', 'common', 'single', 1, '存护', '冰', '星穹列车', '每次登场获得 3 点护盾。', '#f9a8d4'),
  character('1002', '丹恒', 'Dan Heng', 'common', 'single', 1, '巡猎', '风', '星穹列车', '每登场 3 次，永久增加 1 点威力。', '#6ee7b7'),
  character('1003', '姬子', 'Himeko', 'rare', 'blast', 3, '智识', '火', '星穹列车', '本轮每有一个临时角色退场，自身增加 2 点威力。', '#fb923c'),
  character('1004', '瓦尔特', 'Welt', 'rare', 'single', 3, '虚无', '虚数', '星穹列车', '本轮敌人反击减少 2 点伤害。', '#fbbf24'),
  character('1005', '卡芙卡', 'Kafka', 'rare', 'blast', 3, '虚无', '雷', '星核猎手', '所有登场的虚无角色增加 1 点威力。', '#e879f9'),
  character('1006', '银狼', 'Silver Wolf', 'rare', 'single', 3, '虚无', '量子', '星核猎手', '本轮攻击无视敌人装甲；自身增加 1 点威力。', '#c4b5fd'),
  character('1008', '阿兰', 'Arlan', 'common', 'blast', 1, '毁灭', '雷', '黑塔空间站', '生命不高于上限一半时，威力翻倍。', '#a78bfa'),
  character('1009', '艾丝妲', 'Asta', 'common', 'support', 1, '同谐', '火', '黑塔空间站', '相邻八格的角色增加 0.5 点威力。', '#fda4af'),
  character('1013', '黑塔', 'Herta', 'common', 'aoe', 1, '智识', '冰', '黑塔空间站', '每第 3 次登场，本轮增加 2 点威力。', '#c4b5fd'),
  character('1101', '布洛妮娅', 'Bronya', 'uncommon', 'support', 2, '同谐', '风', '贝洛伯格', '相邻八格的角色增加 1 点威力。', '#bae6fd'),
  character('1102', '希儿', 'Seele', 'rare', 'single', 3, '巡猎', '量子', '贝洛伯格', '击破敌人后，向最近存活列追加一次 1 倍威力攻击。', '#a78bfa'),
  character('1103', '希露瓦', 'Serval', 'common', 'aoe', 1, '智识', '雷', '贝洛伯格', '每个相邻雷属性角色使自身增加 1 点威力。', '#fde68a'),
  character('1104', '杰帕德', 'Gepard', 'uncommon', 'blast', 2, '存护', '冰', '贝洛伯格', '每次登场获得 5 点护盾。', '#93c5fd'),
  character('1105', '娜塔莎', 'Natasha', 'common', 'support', 1, '丰饶', '物理', '贝洛伯格', '每次登场恢复 3 点生命。', '#6ee7b7'),
  character('1106', '佩拉', 'Pela', 'uncommon', 'blast', 2, '虚无', '冰', '贝洛伯格', '相邻冰属性角色增加 1 点威力；本轮攻击无视装甲。', '#93c5fd'),
  character('1107', '克拉拉', 'Clara', 'rare', 'blast', 3, '毁灭', '物理', '贝洛伯格', '每登场 2 次，永久增加 1 点威力。', '#fca5a5'),
  character('1108', '桑博', 'Sampo', 'uncommon', 'single', 2, '虚无', '风', '贝洛伯格', '每次登场有 25% 概率召来临时虎克；临时角色登场 3 次后退场。', '#6ee7b7'),
  character('1109', '虎克', 'Hook', 'common', 'blast', 1, '毁灭', '火', '贝洛伯格', '消耗一个相邻临时角色，本轮增加 4 点威力。', '#fdba74'),
  character('1205', '刃', 'Blade', 'legendary', 'blast', 4, '毁灭', '风', '星核猎手', '每次登场永久增加 0.5 点威力，并消耗 2 点生命（不会致死）。', '#f87171'),
  character('1204', '景元', 'Jing Yuan', 'legendary', 'aoe', 4, '智识', '雷', '仙舟罗浮', '每第 2 次登场，本轮增加 2 点威力。', '#fcd34d'),
  character('1203', '罗刹', 'Luocha', 'rare', 'support', 3, '丰饶', '虚数', '仙舟罗浮', '每次登场恢复 6 点生命；溢出的治疗转为护盾。', '#bef264'),
  character('1208', '符玄', 'Fu Xuan', 'rare', 'blast', 3, '存护', '量子', '仙舟罗浮', '每次登场获得 6 点护盾；本轮敌人攻击降低 20%。', '#f0abfc'),
  character('1201', '青雀', 'Qingque', 'common', 'blast', 1, '智识', '量子', '仙舟罗浮', '每次登场有 20% 概率威力变为 4 倍。', '#5eead4'),
  character('1202', '停云', 'Tingyun', 'uncommon', 'support', 2, '同谐', '雷', '仙舟罗浮', '使本轮基础威力最高的一位其他角色增加 2 点威力。', '#fdba74'),
];

export const ITEMS = [
  { id: 'cosmic_lotto', name: '银河大乐透', rarity: 'uncommon', icon: '🎟️', description: '每次转动有 20% 概率：本轮威力增加 50%。' },
  { id: 'fortune_glue', name: '福灵胶', rarity: 'uncommon', icon: '🧪', description: '招募中的史诗、传说角色出现权重提高 50%。' },
  { id: 'gold_coin', name: '天外重声大碟', rarity: 'common', icon: '💿', description: '所有登场角色增加 0.3 点威力。' },
  { id: 'faith_bond', name: '信仰债券', rarity: 'common', icon: '📜', description: '每次转动获得 3 信用点，可用于重掷或购买补给。' },
  { id: 'preservation_wax', name: '存护火漆', rarity: 'uncommon', icon: '🕯️', description: '护盾获取量增加 50%；每个新层数获得 8 护盾。' },
  { id: 'abundance_wax', name: '丰饶火漆', rarity: 'uncommon', icon: '🌱', description: '治疗量增加 50%；取得时恢复 20 生命。' },
  { id: 'hunt_wax', name: '巡猎火漆', rarity: 'uncommon', icon: '🏹', description: '单体攻击角色的威力增加 30%。' },
  { id: 'destruction_wax', name: '毁灭火漆', rarity: 'uncommon', icon: '🔥', description: '扩散攻击角色的威力增加 25%。' },
  { id: 'erudition_wax', name: '智识火漆', rarity: 'uncommon', icon: '📚', description: '群体攻击角色的威力增加 25%。' },
  { id: 'harmony_wax', name: '同谐火漆', rarity: 'rare', icon: '🎼', description: '辅助角色的相邻增益、定向增益增加 50%。' },
  { id: 'nihility_wax', name: '虚无火漆', rarity: 'uncommon', icon: '🌀', description: '虚无角色增加 1 点威力。' },
  { id: 'dimension_dice', name: '异木果实', rarity: 'rare', icon: '🍎', description: '每次转动恢复 2 生命；生命上限增加 15。' },
  { id: 'doctor_robe', name: '博士之袍', rarity: 'rare', icon: '🥼', description: '二星、三星角色的威力额外增加 20%。' },
  { id: 'chaos_trametes', name: '混沌云芝', rarity: 'uncommon', icon: '🍄', description: '每次转动有 20% 概率获得 1 次重选机会。' },
  { id: 'angel_debt', name: '天使型谢债发行机', rarity: 'rare', icon: '👼', description: '完成每层后额外获得 8 信用点与 1 次移除机会。' },
  { id: 'insect_web', name: '虫网', rarity: 'common', icon: '🕸️', description: '临时角色退场时，获得 4 信用点并恢复 2 生命。' },
  { id: 'seal_stamp', name: '公司时刻', rarity: 'common', icon: '⌛', description: '从下一层起，每层额外获得 1 次转动。' },
  { id: 'divination_candle', name: '香涎干酪', rarity: 'rare', icon: '🧀', description: '所有羁绊的威力增益增加 50%。' },
  { id: 'broken_clock', name: '碎星芳饵', rarity: 'legendary', icon: '✨', description: '所有角色威力增加 20%；取得时获得 2 次重选。' },
  { id: 'rubert_gear', name: '鲁珀特帝国机械齿轮', rarity: 'rare', icon: '⚙️', description: '所有成长型角色的永久成长增加 50%。' },
];

export const ESSENCES = [
  { id: 'essence_elation', name: '银河大乐透·精华', rarity: 'rare', icon: '🎭', target: 100, description: '累计造成 100 点伤害，触发后所有威力增加 15%。' },
  { id: 'essence_abundance', name: '异木果实·精华', rarity: 'rare', icon: '🌿', target: 6, description: '再转动 6 次后，生命上限增加 20 并完全恢复生命。' },
  { id: 'essence_hunt', name: '巡猎火漆·精华', rarity: 'rare', icon: '🎯', target: 12, description: '单体角色累计登场 12 次后，单体威力增加 35%。' },
  { id: 'essence_destruction', name: '毁灭火漆·精华', rarity: 'rare', icon: '💥', target: 8, description: '再转动 8 次后，所有角色增加 1 点威力。' },
  { id: 'essence_erudition', name: '智识火漆·精华', rarity: 'rare', icon: '🧠', target: 10, description: '群体角色累计登场 10 次后，群体角色增加 1 点威力。' },
  { id: 'essence_harmony', name: '同谐火漆·精华', rarity: 'rare', icon: '🎵', target: 12, description: '每轮每种生效羁绊积累 1 层；12 层后获得 3 次重选，所有威力增加 10%。' },
  { id: 'essence_preservation', name: '存护火漆·精华', rarity: 'rare', icon: '🛡️', target: 30, description: '累计获得 30 护盾后，护盾获取量增加 30%，每个新层数获得 12 护盾。' },
  { id: 'essence_nihility', name: '虚无火漆·精华', rarity: 'rare', icon: '🌌', target: 8, description: '虚无角色累计登场 8 次后，虚无角色增加 1.5 点威力。' },
];

export const SYNERGIES = [
  { id: 'astral', name: '星穹列车', kind: 'faction', tag: '星穹列车', thresholds: [2, 4], description: '列车组威力增加 15% / 35%。' },
  { id: 'belobog', name: '筑城誓约', kind: 'faction', tag: '贝洛伯格', thresholds: [3, 6], description: '贝洛伯格角色威力增加 15% / 35%；每轮获得 2 / 5 护盾。' },
  { id: 'station', name: '空间站科员', kind: 'faction', tag: '黑塔空间站', thresholds: [2, 3], description: '空间站角色威力增加 15% / 30%。' },
  { id: 'hunters', name: '命运剧本', kind: 'faction', tag: '星核猎手', thresholds: [2, 3], description: '星核猎手威力增加 20% / 40%。' },
  { id: 'xianzhou', name: '仙舟同盟', kind: 'faction', tag: '仙舟罗浮', thresholds: [2, 4], description: '仙舟角色威力增加 15% / 35%；每轮治疗 2 / 4。' },
  { id: 'hunt', name: '巡猎', kind: 'path', tag: '巡猎', thresholds: [2], description: '巡猎角色威力增加 25%。' },
  { id: 'destruction', name: '毁灭', kind: 'path', tag: '毁灭', thresholds: [2, 4], description: '毁灭角色威力增加 15% / 35%。' },
  { id: 'erudition', name: '智识', kind: 'path', tag: '智识', thresholds: [2, 4], description: '智识角色威力增加 15% / 35%。' },
  { id: 'nihility', name: '虚无', kind: 'path', tag: '虚无', thresholds: [2, 4], description: '虚无角色威力增加 15% / 35%。' },
  { id: 'preservation', name: '存护', kind: 'path', tag: '存护', thresholds: [2, 3], description: '存护角色威力增加 15% / 30%；每轮获得 3 / 6 护盾。' },
  { id: 'abundance', name: '丰饶', kind: 'path', tag: '丰饶', thresholds: [2], description: '丰饶角色威力增加 25%；每轮治疗 4。' },
  { id: 'harmony', name: '同谐', kind: 'path', tag: '同谐', thresholds: [2, 3], description: '同谐角色威力增加 15% / 30%。' },
  { id: 'ice', name: '冻结编队', kind: 'element', tag: '冰', thresholds: [3, 4], description: '冰属性角色威力增加 15% / 30%。' },
  { id: 'lightning', name: '雷霆编队', kind: 'element', tag: '雷', thresholds: [3, 4], description: '雷属性角色威力增加 15% / 30%。' },
  { id: 'fire', name: '烈焰编队', kind: 'element', tag: '火', thresholds: [3], description: '火属性角色威力增加 25%。' },
  { id: 'wind', name: '流风编队', kind: 'element', tag: '风', thresholds: [3, 4], description: '风属性角色威力增加 15% / 30%。' },
  { id: 'quantum', name: '量子编队', kind: 'element', tag: '量子', thresholds: [3, 4], description: '量子角色威力增加 15% / 30%。' },
  { id: 'physical', name: '坚韧编队', kind: 'element', tag: '物理', thresholds: [2], description: '物理属性角色威力增加 25%。' },
  { id: 'imaginary', name: '虚数编队', kind: 'element', tag: '虚数', thresholds: [2], description: '虚数属性角色威力增加 25%。' },
];

const characters = new Map(CHARACTERS.map(c => [c.id, c]));
export const characterById = id => characters.get(String(id));
export const itemById = id => ITEMS.find(item => item.id === id);
export const essenceById = id => ESSENCES.find(essence => essence.id === id);
