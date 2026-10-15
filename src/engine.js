import { CHARACTERS, ITEMS, ESSENCES, SYNERGIES, characterById, itemById, essenceById } from './content.js';
import { DIFFICULTY, lateDifficultyMultiplier, normalizeDifficulty, difficultyHealthMultiplier } from './difficulty.js';
import { ENEMY_DEBUFFS, enemyDebuffById, hasDebuff, getEligibleDebuffs, publicDebuff, unitPowerMultiplier, utilityMultiplier, pollutionDescription, legacyPollutionDescription, isPolluted } from './enemy-effects.js';

export const SAVE_VERSION = 2;
export const BOARD_COLUMNS = 5;
export const BOARD_ROWS = 4;
export const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;
export const STAR_MULTIPLIERS = [0, 1, 3, 9];
export const FINAL_FLOOR = 12;
const PHASES = ['ready', 'recruit', 'item', 'essence', 'victory', 'defeat'];
const ENEMY_SKILLS = [
  { id: 'pressure', name: '战意积蓄', description: '每第三次转动，存活敌人的攻击总和额外增加 3。' },
  { id: 'armor', name: '装甲校验', description: '每次命中减少 1 点伤害；银狼或佩拉登场可解除。' },
  { id: 'jammer', name: '禁锢矩阵', description: '每第三次转动，中间列角色的威力降低 50%。' },
  { id: 'drain', name: '能量抽取', description: '每第二次转动，额外造成 3 点可被护盾抵挡的伤害。' },
];
const copy = value => structuredClone(value);
const rounded = value => Math.round(value * 100) / 100;
const hasItem = (state, id) => state.items.includes(id);
const hasEssence = (state, id) => state.essences.some(e => e.id === id && e.triggered);
const finite = (value, min = 0, max = 1e12) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
export const SUPPLIES = {
  repair: { id: 'repair', name: '列车维修', cost: 12, healing: 18 },
  barrier: { id: 'barrier', name: '护盾补给', cost: 10, shield: 20 },
  overclock: { id: 'overclock', name: '转轮超频', cost: 16, multiplier: 1.2 },
};
export const DEFAULT_RESOURCE_ACCESS = { rerolls: true, removals: true, credits: true, defense: true };
const resourceEnabled = (state, kind) => state.resourceAccess?.[kind] !== false;
const normalizeResources = access => Object.fromEntries(Object.keys(DEFAULT_RESOURCE_ACCESS).map(key => [key, access?.[key] !== false]));
const newResourceStats = (initialHp = 100, initialShield = 0) => ({ initialHp, initialShield, rerollsUsed: 0, paidRerolls: 0, removalsUsed: 0, supplyPurchases: 0, creditsSpent: 0, healed: 0, shieldGained: 0, shieldBlocked: 0, shieldDecayed: 0, hpLost: 0 });
const bossStageRules = () => ({ healthThresholds: [0.7, 0.35], roundThresholds: [3, 5], maxStages: 3 });
const starMultiplier = (state, instance) => STAR_MULTIPLIERS[instance.stars] * (instance.stars > 1 && hasDebuff(state, 'star_audit') ? 0.8 : 1);

function hashSeed(seed) {
  let result = 2166136261;
  for (let i = 0; i < seed.length; i++) result = Math.imul(result ^ seed.charCodeAt(i), 16777619);
  return (result >>> 0) || 1;
}

function random(state) {
  let x = state.rngState;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rngState = (x >>> 0) || 1;
  return state.rngState / 4294967296;
}

function shuffle(state, array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function unit(state, id, extra = {}) {
  return { uid: `u${state.uidCounter++}`, id, stars: 1, growth: 0, ticks: 0, ...extra };
}

export function getSynergies(state) {
  const roster = Array.isArray(state?.roster) ? state.roster : [];
  const distinct = [...new Set(roster.filter(u => !u.temporary).map(u => u.id))].map(characterById).filter(Boolean);
  return SYNERGIES.map(synergy => {
    const count = distinct.filter(c => c[synergy.kind] === synergy.tag).length;
    const tier = synergy.thresholds.filter(threshold => count >= threshold).length;
    return { ...synergy, count, active: tier > 0, tier };
  });
}

function synergyBonus(synergy) {
  if (!synergy.active) return 0;
  if (synergy.id === 'hunters') return synergy.tier === 2 ? 0.4 : 0.2;
  if (['hunt', 'abundance', 'fire', 'physical', 'imaginary'].includes(synergy.id)) return 0.25;
  if (['station', 'preservation', 'harmony', 'ice', 'lightning', 'wind', 'quantum'].includes(synergy.id)) return synergy.tier === 2 ? 0.3 : 0.15;
  return synergy.tier === 2 ? 0.35 : 0.15;
}

function floorSpins(state) {
  return 5 + Math.floor((Math.min(state.floor, 12) - 1) / 4) + (hasItem(state, 'seal_stamp') ? 1 : 0);
}

function makeEnemies(state) {
  const floor = state.floor;
  const columns = floor === 1 ? [0, 2, 4] : floor === 2 ? [0, 1, 2, 4] : [0, 1, 2, 3, 4];
  const bossFloor = floor % 3 === 0;
  const totalHp = Math.max(columns.length, Math.round((40 + floor * 20 + floor * floor * 3 + 5 * Math.max(0, floor - 2) ** 3) * (floor > 12 ? 1.12 ** (floor - 12) : 1) * lateDifficultyMultiplier(floor, DIFFICULTY.combatLateHealthMultiplier) * difficultyHealthMultiplier(state.difficulty)));
  const weights = columns.map(col => col === 2 && bossFloor ? 2.2 : 1);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const themes = [
    { id: 'automaton', name: '自动机兵' }, { id: 'voidranger', name: '虚卒' },
    { id: 'frostspawn', name: '永冬灾影' }, { id: 'mara', name: '魔阴身士卒' },
  ];
  const theme = themes[(floor - 1) % themes.length];
  const allocations = weights.map(weight => totalHp * weight / weightSum);
  const health = allocations.map(value => Math.floor(value));
  const remainderOrder = allocations.map((value, index) => ({ index, fraction: value - health[index] })).sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let remainder = totalHp - health.reduce((sum, hp) => sum + hp, 0), index = 0; remainder > 0; remainder--, index++) health[remainderOrder[index % health.length].index] += 1;
  return columns.map((col, index) => {
    const boss = col === 2 && bossFloor;
    const maxHp = health[index];
    return {
      id: `${floor}-${col}`, name: boss ? '裂界统御者' : theme.name, col, hp: maxHp, maxHp,
      attack: 1 + Math.floor(floor / 4) + (boss ? 2 : 0), boss,
      art: `/assets/enemies/${boss ? 'boss' : theme.id}.svg`,
    };
  });
}

function setupFloor(state, initial = false) {
  state.round = 0;
  state.spinsLeft = floorSpins(state);
  state.enemies = makeEnemies(state);
  state.enemySkill = copy(ENEMY_SKILLS[(state.floor - 1) % ENEMY_SKILLS.length]);
  state.activeDebuffs = [];
  state.bossStage = state.enemies.some(enemy => enemy.boss) ? 1 : 0;
  state.bossStages = bossStageRules();
  state.supplyPurchases = 0;
  if (state.floor >= DIFFICULTY.debuffStartFloor) {
    for (let count = 0; count < DIFFICULTY.ambientDebuffs; count++) appendDebuff(state, 'difficulty');
  }
  if (state.bossStage) appendDebuff(state, 'boss');
  if ([4, 6, 8, 10, 12].includes(state.floor)) appendPollution(state);
  state.encounter = {
    name: state.floor % 3 === 0 ? '裂界首领' : ['空间站警戒区', '贝洛伯格旧城区', '仙舟禁区', '模拟宇宙深层'][(state.floor - 1) % 4],
    deadline: state.spinsLeft,
  };
  state.enemyIntent = nextIntent(state);
  if (!initial) {
    state.rerolls += 1;
    if (state.floor % 2 === 0) state.removals += 1;
    if (hasItem(state, 'preservation_wax')) shield(state, 8);
    if (hasEssence(state, 'essence_preservation')) shield(state, 12);
    state.shield = rounded(Math.min(state.maxHp * 2, state.shield));
    state.history.push(`进入第 ${state.floor} 层。`);
  }
}

function appendDebuff(state, source) {
  const pool = getEligibleDebuffs(state);
  if (!pool.length) return false;
  const effect = pool[Math.floor(random(state) * pool.length)];
  state.activeDebuffs.push(publicDebuff(effect, source, state.round));
  record(state, `敌方条款：${effect.name} — ${effect.description}`);
  return true;
}

function appendPollution(state) {
  const targets = state.roster.filter(instance => !instance.temporary && instance.stars === 1);
  targets.sort((a, b) => characterById(a.id).power + a.growth - characterById(b.id).power - b.growth || a.uid.localeCompare(b.uid, 'en'));
  const target = targets[0];
  if (!target) return;
  const character = characterById(target.id);
  state.activeDebuffs.push({
    ...publicDebuff(enemyDebuffById('rift_pollution'), 'difficulty', 0),
    targetUid: target.uid, targetId: target.id, targetName: character.name,
    description: pollutionDescription(character.name),
  });
  record(state, `裂界污染标记了${character.name}的一星实例；可移除、合成或承担其登场代价。`);
}

function clearMissingPollution(state) {
  const before = state.activeDebuffs.length;
  state.activeDebuffs = state.activeDebuffs.filter(effect => effect.id !== 'rift_pollution' || state.roster.some(instance => instance.uid === effect.targetUid && !instance.temporary && instance.stars === 1));
  if (state.activeDebuffs.length < before) record(state, '裂界污染解除：被标记实例已移除或完成合成。');
}

function updateBossStages(state) {
  const boss = state.enemies.find(enemy => enemy.boss && enemy.hp > 0);
  if (!boss) return;
  const healthRatio = boss.hp / boss.maxHp;
  let target = 1;
  for (let index = 0; index < state.bossStages.healthThresholds.length; index++) {
    if (healthRatio <= state.bossStages.healthThresholds[index] || state.round >= state.bossStages.roundThresholds[index]) target = index + 2;
  }
  while (state.bossStage < target) {
    state.bossStage += 1;
    record(state, `首领进入第 ${state.bossStage} 阶段，追加针对当前编队的条款。`);
    appendDebuff(state, 'boss');
  }
}

function nextIntent(state) {
  let damage = state.enemies.filter(e => e.hp > 0).reduce((sum, e) => sum + e.attack, 0);
  const nextRound = state.round + 1;
  if (state.enemySkill?.id === 'pressure' && nextRound % 3 === 0) damage += 3;
  if (state.enemySkill?.id === 'drain' && nextRound % 2 === 0) damage += 3;
  return { damage, round: nextRound, name: state.enemySkill?.name || '', description: state.enemySkill?.description || '' };
}

export function newGame({ seed = '星穹房东', difficulty = 10, resourceAccess } = {}) {
  const safeSeed = String(seed || '星穹房东').slice(0, 200);
  const state = {
    version: SAVE_VERSION, mode: 'combat', seed: safeSeed, difficulty: normalizeDifficulty(difficulty), resourceAccess: normalizeResources(resourceAccess),
    rngState: hashSeed(safeSeed), uidCounter: 1, phase: 'ready', floor: 1, round: 0,
    spinsLeft: 5, coins: 0, hp: 100, maxHp: 100, shield: 0, rerolls: 2, removals: 2,
    resourceStats: newResourceStats(), supplyPurchases: 0, overclockReady: false, activeDebuffs: [], bossStage: 0, bossStages: bossStageRules(),
    roster: [], board: Array(BOARD_SIZE).fill(null), items: [], essences: [], enemies: [],
    choices: [], pendingRewards: [], pendingFloor: false, endless: false,
    lastSpin: { total: 0, damage: 0, coins: 0, healing: 0, shield: 0, incoming: 0, events: [], hits: [], values: Array(BOARD_SIZE).fill(0) },
    history: ['列车抵达：每次转动后可招募一名角色，三名相同一星角色会自动合成二星。'],
    stats: { spins: 0, damage: 0, coins: 0, merges: 0, destroyed: 0 },
  };
  state.roster = ['1001', '1002', '1009', '1013', '1105'].map(id => unit(state, id));
  state.roster.forEach((u, i) => { state.board[i + 10] = copy(u); });
  setupFloor(state, true);
  return state;
}

function record(state, message) {
  state.lastSpin.events.push(message);
  state.history.push(message);
}

function heal(state, amount, fixed = false) {
  let multiplier = !fixed && hasItem(state, 'abundance_wax') ? 1.5 : 1;
  if (!fixed && hasDebuff(state, 'healing_audit')) multiplier *= 0.75;
  const requested = rounded(amount * multiplier);
  const actual = Math.min(state.maxHp - state.hp, requested);
  state.hp = rounded(state.hp + actual);
  state.lastSpin.healing = rounded(state.lastSpin.healing + actual);
  state.resourceStats.healed = rounded(state.resourceStats.healed + actual);
  return { actual, overflow: requested - actual };
}

function shield(state, amount, fixed = false) {
  let multiplier = !fixed && hasItem(state, 'preservation_wax') ? 1.5 : 1;
  if (!fixed && hasEssence(state, 'essence_preservation')) multiplier *= 1.3;
  if (!fixed && hasDebuff(state, 'shield_audit')) multiplier *= 0.75;
  const nextShield = rounded(Math.min(state.maxHp * 2, state.shield + amount * multiplier));
  const actual = rounded(nextShield - state.shield);
  state.shield = nextShield;
  state.lastSpin.shield = rounded(state.lastSpin.shield + actual);
  state.resourceStats.shieldGained = rounded(state.resourceStats.shieldGained + actual);
}

function mergeRoster(state) {
  // Temporary reinforcements expire and never consume permanent recruits.
  for (let stars = 1; stars < 3; stars++) {
    for (const c of CHARACTERS) {
      let same = state.roster.filter(u => u.id === c.id && u.stars === stars && !u.temporary);
      while (same.length >= 3) {
        const merging = same.slice(0, 3);
        const ids = new Set(merging.map(u => u.uid));
        const merged = unit(state, c.id, {
          stars: stars + 1,
          growth: rounded(merging.reduce((sum, u) => sum + u.growth, 0)),
          ticks: Math.max(...merging.map(u => u.ticks)),
        });
        state.roster = state.roster.filter(u => !ids.has(u.uid));
        state.roster.push(merged);
        state.stats.merges += 1;
        const message = `升星：3 位 ${stars} 星${c.name} → ${stars + 1} 星${c.name}。`;
        state.history.push(message);
        state.lastSpin.events.push(message);
        same = state.roster.filter(u => u.id === c.id && u.stars === stars && !u.temporary);
      }
    }
  }
  clearMissingPollution(state);
}

function neighbors(index) {
  const row = Math.floor(index / BOARD_COLUMNS);
  const col = index % BOARD_COLUMNS;
  const result = [];
  for (let r = Math.max(0, row - 1); r <= Math.min(BOARD_ROWS - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(BOARD_COLUMNS - 1, col + 1); c++) {
      if (r !== row || c !== col) result.push(r * BOARD_COLUMNS + c);
    }
  }
  return result;
}

function drawBoard(state) {
  const selected = shuffle(state, state.roster).slice(0, BOARD_SIZE);
  const positions = shuffle(state, Array.from({ length: BOARD_SIZE }, (_, index) => index));
  state.board = Array(BOARD_SIZE).fill(null);
  selected.forEach((u, index) => { state.board[positions[index]] = copy(u); });
}

function weightedChoice(state, pool) {
  const floorBoost = Math.min(2.5, 1 + state.floor * 0.09);
  const weights = { common: 52, uncommon: 30, rare: 15 * floorBoost, legendary: 3 * floorBoost };
  if (hasItem(state, 'fortune_glue')) { weights.rare *= 1.5; weights.legendary *= 1.5; }
  const total = pool.reduce((sum, c) => sum + weights[c.rarity], 0);
  let pick = random(state) * total;
  for (const c of pool) { pick -= weights[c.rarity]; if (pick <= 0) return c; }
  return pool[pool.length - 1];
}

function rewardChoices(state, phase, exclusions = []) {
  const all = phase === 'recruit' ? CHARACTERS : phase === 'item' ? ITEMS : ESSENCES;
  const owned = phase === 'item' ? state.items : phase === 'essence' ? state.essences.map(e => e.id) : [];
  let pool = all.filter(c => !owned.includes(c.id) && !exclusions.includes(c.id));
  if (pool.length < Math.min(3, all.length - owned.length)) pool = all.filter(c => !owned.includes(c.id));
  const choices = [];
  while (pool.length && choices.length < 3) {
    const pick = weightedChoice(state, pool);
    choices.push(pick.id);
    pool = pool.filter(c => c.id !== pick.id);
  }
  return choices;
}

function advanceRewards(state) {
  state.choices = [];
  while (state.pendingRewards.length) {
    const phase = state.pendingRewards.shift();
    const choices = rewardChoices(state, phase);
    if (choices.length) { state.phase = phase; state.choices = choices; return; }
    state.history.push(`${phase === 'item' ? '奇物' : '余响'}已全部收集，获得 10 信用点。`);
    state.coins += 10;
    state.stats.coins += 10;
    state.lastSpin.coins += 10;
  }
  if (state.pendingFloor) {
    state.pendingFloor = false;
    state.floor += 1;
    setupFloor(state);
  }
  state.phase = 'ready';
}

function finishFloor(state) {
  state.pendingFloor = true;
  const bounty = 8 + state.floor * 3;
  state.coins += bounty;
  state.lastSpin.coins += bounty;
  state.stats.coins += bounty;
  record(state, `清除第 ${state.floor} 层，获得 ${bounty} 信用点补给。`);
  if (hasItem(state, 'angel_debt')) { state.coins += 8; state.lastSpin.coins += 8; state.stats.coins += 8; state.removals += 1; }
  if (state.floor >= FINAL_FLOOR && !state.endless) {
    state.phase = 'victory';
    state.pendingFloor = false;
    state.pendingRewards = [];
    state.choices = [];
    record(state, '十二层开拓完成！可以带着现有编队进入无尽开拓。');
    return;
  }
  state.pendingRewards = ['recruit'];
  if (state.floor % 2 === 0) state.pendingRewards.push('item');
  if (state.floor % 3 === 0) state.pendingRewards.push('essence');
  advanceRewards(state);
}

function updateEssences(state, metrics) {
  for (const essence of state.essences) {
    if (essence.triggered) continue;
    const amounts = {
      essence_elation: state.lastSpin.damage,
      essence_abundance: 1, essence_hunt: metrics.single, essence_destruction: 1,
      essence_erudition: metrics.aoe, essence_harmony: metrics.synergies,
      essence_preservation: state.lastSpin.shield, essence_nihility: metrics.nihility,
    };
    const data = essenceById(essence.id);
    essence.progress = rounded(Math.min(data.target, essence.progress + (amounts[essence.id] || 0) * (hasDebuff(state, 'essence_audit') ? 0.75 : 1)));
    if (essence.progress < data.target) continue;
    essence.triggered = true;
    record(state, `余响触发：${data.name}。`);
    if (essence.id === 'essence_abundance') {
      state.maxHp += 20;
      heal(state, state.maxHp);
    }
    if (essence.id === 'essence_harmony') state.rerolls += 3;
  }
}

// Exported for inspection/testing as well as combat preview. A tie selects the left column.
export function nearestEnemy(enemies, col) {
  return enemies.filter(e => e.hp > 0).sort((a, b) => Math.abs(a.col - col) - Math.abs(b.col - col) || a.col - b.col)[0] || null;
}

function attackEnemy(state, cell, enemy, amount, ignoresArmor) {
  if (!enemy || enemy.hp <= 0) return false;
  const armor = state.enemySkill.id === 'armor' && !ignoresArmor ? 1 : 0;
  const damage = rounded(Math.min(enemy.hp, Math.max(0, amount - armor)));
  enemy.hp = rounded(Math.max(0, enemy.hp - damage));
  state.lastSpin.damage = rounded(state.lastSpin.damage + damage);
  if (damage > 0) state.lastSpin.hits.push({ cell, targetCol: enemy.col, amount: damage });
  return enemy.hp === 0;
}

function combatAttacks(state, powers, ignoresArmor) {
  // Each unit retargets after previous units resolve. Blast adjacency follows its actual primary target.
  state.board.forEach((u, cell) => {
    if (!u || u.status === 'consumed') return;
    const c = characterById(u.id);
    const power = powers[cell];
    if (c.attack === 'support') return;
    const origin = cell % BOARD_COLUMNS;
    const primary = nearestEnemy(state.enemies, origin);
    if (!primary) return;
    if (c.attack === 'single') {
      const killed = attackEnemy(state, cell, primary, power * 3, ignoresArmor);
      if (killed && c.id === '1102') {
        const next = nearestEnemy(state.enemies, primary.col);
        if (next) { attackEnemy(state, cell, next, power * (hasDebuff(state, 'seele_audit') ? 0.5 : 1), ignoresArmor); record(state, '希儿：击破后触发再现追击。'); }
      }
    } else if (c.attack === 'blast') {
      const targetCol = primary.col;
      attackEnemy(state, cell, primary, power * 2, ignoresArmor);
      for (const enemy of state.enemies.filter(e => e.hp > 0 && Math.abs(e.col - targetCol) === 1)) {
        attackEnemy(state, cell, enemy, power, ignoresArmor);
      }
    } else {
      for (const enemy of state.enemies.filter(e => e.hp > 0)) attackEnemy(state, cell, enemy, power, ignoresArmor);
    }
  });
}

export function spin(previous) {
  if (previous?.phase !== 'ready') return previous;
  const state = copy(previous);
  state.round += 1;
  state.spinsLeft -= 1;
  state.stats.spins += 1;
  state.lastSpin = { total: 0, damage: 0, coins: 0, healing: 0, shield: 0, incoming: 0, events: [], hits: [], values: Array(BOARD_SIZE).fill(0) };
  updateBossStages(state);
  if (hasDebuff(state, 'shield_decay')) {
    const beforeShield = state.shield;
    state.shield = rounded(state.shield * 0.8);
    state.resourceStats.shieldDecayed = rounded(state.resourceStats.shieldDecayed + beforeShield - state.shield);
  }
  drawBoard(state);
  const polluted = state.board.find(instance => instance && isPolluted(state, instance.uid));
  if (polluted) {
    const beforeHp = state.hp;
    state.hp = rounded(Math.max(0, state.hp - 6));
    state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + beforeHp - state.hp);
    record(state, `裂界污染：${characterById(polluted.id).name}登场，直接消耗 ${rounded(beforeHp - state.hp)} 生命。`);
    if (state.hp === 0) {
      state.phase = 'defeat';
      state.choices = [];
      state.pendingRewards = [];
      record(state, '裂界污染耗尽列车生命，本次开拓结束。');
      state.history = state.history.slice(-100);
      return state;
    }
  }
  const synergies = getSynergies(state).filter(s => s.active);
  const powers = Array(BOARD_SIZE).fill(0);
  const consumed = new Set();
  const generated = [];
  let incomingReduction = 0;
  let incomingMultiplier = 1;
  let ignoresArmor = false;
  let retirements = 0;
  const metrics = { single: 0, aoe: 0, nihility: 0, synergies: synergies.length };
  const growthMultiplier = (hasItem(state, 'rubert_gear') ? 1.5 : 1) * (hasDebuff(state, 'growth_audit') ? 0.5 : 1);

  // Resolve growth, utility and consumption before powers and attacks.
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const original = state.roster.find(r => r.uid === u.uid);
    original.ticks += 1;
    if (u.id === '1002' && original.ticks % (hasDebuff(state, 'danheng_audit') ? 4 : 3) === 0) original.growth += growthMultiplier;
    if (u.id === '1107' && original.ticks % 2 === 0) original.growth += growthMultiplier;
    if (u.id === '1205') {
      original.growth += 0.5 * growthMultiplier;
      const before = state.hp;
      state.hp = Math.max(1, state.hp - 2 * starMultiplier(state, u));
      state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + before - state.hp);
    }
    original.growth = rounded(original.growth);
    Object.assign(u, { ticks: original.ticks, growth: original.growth });
    const star = starMultiplier(state, u);
    if (u.id === '1001') shield(state, 3 * star * utilityMultiplier(state, u, 'shield'));
    if (u.id === '1104') shield(state, 5 * star * utilityMultiplier(state, u, 'shield'));
    if (u.id === '1208') { shield(state, 6 * star * utilityMultiplier(state, u, 'shield')); incomingMultiplier *= hasDebuff(state, 'fuxuan_audit') ? 0.9 : 0.8; }
    if (u.id === '1105') heal(state, 3 * star * utilityMultiplier(state, u, 'heal'));
    if (u.id === '1203') { const result = heal(state, 6 * star * utilityMultiplier(state, u, 'heal')); if (result.overflow) shield(state, result.overflow); }
    if (u.id === '1004') incomingReduction += 2 * star * (hasDebuff(state, 'welt_audit') ? 0.5 : 1);
    if (u.id === '1006' || u.id === '1106') ignoresArmor = true;
    if (u.id === '1108' && random(state) < (hasDebuff(state, 'summon_audit') ? 0.125 : 0.25) && state.roster.length + generated.length < 200) {
      generated.push(unit(state, '1109', { temporary: 3, origin: u.uid }));
      record(state, '桑博：一位临时虎克加入编队（下轮起登场）。');
    }
    if (u.id === '1109') {
      const targetIndex = neighbors(index).find(i => state.board[i]?.temporary && !consumed.has(state.board[i].uid) && state.board[i].uid !== u.uid);
      if (targetIndex !== undefined) {
        const target = state.board[targetIndex];
        consumed.add(target.uid);
        target.status = 'consumed';
        u.consumptionBonus = (hasDebuff(state, 'consume_audit') ? 2 : 4) * star;
        retirements += 1;
        record(state, '虎克：消耗相邻临时角色，本轮威力提升。');
      }
    }
  });

  // Expiry happens after this spin's attack; consumed units never attack.
  state.board.forEach(u => {
    if (!u || consumed.has(u.uid)) return;
    const original = state.roster.find(r => r.uid === u.uid);
    if (original.temporary) {
      original.temporary -= 1;
      u.temporary = original.temporary;
      if (original.temporary === 0) { u.status = 'expired'; retirements += 1; }
    }
  });

  for (const synergy of synergies) {
    if (synergy.id === 'belobog') shield(state, synergy.tier === 2 ? 5 : 2);
    if (synergy.id === 'preservation') shield(state, synergy.tier === 2 ? 6 : 3);
    if (synergy.id === 'xianzhou') heal(state, synergy.tier === 2 ? 4 : 2);
    if (synergy.id === 'abundance') heal(state, 4);
  }
  if (hasItem(state, 'dimension_dice')) heal(state, 2);
  if (retirements && hasItem(state, 'insect_web')) {
    state.coins += 4 * retirements;
    state.lastSpin.coins += 4 * retirements;
    heal(state, 2 * retirements);
  }

  const lottery = hasItem(state, 'cosmic_lotto') && random(state) < 0.2;
  if (lottery) record(state, '银河大乐透：本轮威力增加 50%。');
  if (hasItem(state, 'chaos_trametes') && random(state) < 0.2) { state.rerolls += 1; record(state, '混沌云芝：获得 1 次重选。'); }
  if (hasItem(state, 'faith_bond')) { state.coins += 3; state.lastSpin.coins += 3; }

  const present = state.board.filter(u => u && !consumed.has(u.uid));
  const kafkaBoost = present.filter(u => u.id === '1005').reduce((sum, u) => sum + starMultiplier(state, u) * (hasDebuff(state, 'kafka_audit') ? 0.5 : 1), 0);
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const c = characterById(u.id);
    const star = starMultiplier(state, u);
    let power = c.power * star + u.growth + (u.consumptionBonus || 0);
    if (u.id === '1013' && u.ticks % 3 === 0) power += (hasDebuff(state, 'herta_audit') ? 1 : 2) * star;
    if (u.id === '1204' && u.ticks % 2 === 0) power += 2 * star;
    if (u.id === '1003') power += 2 * retirements * star;
    if (u.id === '1006') power += star;
    if (u.id === '1103') power += neighbors(index).filter(i => state.board[i] && !consumed.has(state.board[i].uid) && characterById(state.board[i].id).element === '雷').length * star;
    if (hasItem(state, 'gold_coin')) power += 0.3;
    if (c.path === '虚无') {
      power += kafkaBoost;
      if (hasItem(state, 'nihility_wax')) power += 1;
      if (hasEssence(state, 'essence_nihility')) power += 1.5;
    }
    if (hasEssence(state, 'essence_destruction')) power += 1;
    if (c.attack === 'aoe' && hasEssence(state, 'essence_erudition')) power += 1;
    if (u.id === '1008' && state.hp <= state.maxHp / 2) power *= 2;
    if (u.id === '1201' && random(state) < (hasDebuff(state, 'qingque_audit') ? 0.1 : 0.2)) { power *= 4; record(state, '青雀：暗杠！本轮威力变为 4 倍。'); }
    powers[index] = power;
  });

  // Adjacent supports are bounded by board coordinates (never wrap across rows).
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    let buff = u.id === '1009' ? 0.5 : u.id === '1101' || u.id === '1106' ? 1 : 0;
    buff *= starMultiplier(state, u) * (hasItem(state, 'harmony_wax') ? 1.5 : 1) * utilityMultiplier(state, u, 'buff');
    if (buff) {
      for (const targetIndex of neighbors(index)) {
        const target = state.board[targetIndex];
        if (target && !consumed.has(target.uid) && (u.id !== '1106' || characterById(target.id).element === '冰')) powers[targetIndex] += buff;
      }
    }
    if (u.id === '1202') {
      const candidates = state.board.map((target, i) => ({ target, i })).filter(({ target, i }) => target && i !== index && !consumed.has(target.uid));
      candidates.sort((a, b) => powers[b.i] - powers[a.i] || a.i - b.i);
      if (candidates.length) powers[candidates[0].i] += 2 * starMultiplier(state, u) * (hasItem(state, 'harmony_wax') ? 1.5 : 1) * utilityMultiplier(state, u, 'buff');
    }
  });

  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const c = characterById(u.id);
    let multiplier = 1;
    for (const synergy of synergies) {
      if (c[synergy.kind] === synergy.tag) multiplier += synergyBonus(synergy) * (hasItem(state, 'divination_candle') ? 1.5 : 1) * (hasDebuff(state, 'synergy_audit') ? 0.75 : 1);
    }
    if (hasItem(state, 'doctor_robe') && u.stars > 1) multiplier *= 1.2;
    if (hasItem(state, 'broken_clock')) multiplier *= 1.2;
    if (hasEssence(state, 'essence_elation')) multiplier *= 1.15;
    if (hasEssence(state, 'essence_harmony')) multiplier *= 1.1;
    if (c.attack === 'single') {
      metrics.single += 1;
      if (hasItem(state, 'hunt_wax')) multiplier *= 1.3;
      if (hasEssence(state, 'essence_hunt')) multiplier *= 1.35;
    }
    if (c.attack === 'blast' && hasItem(state, 'destruction_wax')) multiplier *= 1.25;
    if (c.attack === 'aoe') { metrics.aoe += 1; if (hasItem(state, 'erudition_wax')) multiplier *= 1.25; }
    if (c.path === '虚无') metrics.nihility += 1;
    if (lottery) multiplier *= 1.5;
    multiplier *= unitPowerMultiplier(state, c, u, Boolean(polluted));
    if (state.overclockReady) multiplier *= SUPPLIES.overclock.multiplier;
    if (state.enemySkill.id === 'jammer' && state.round % 3 === 0 && index % BOARD_COLUMNS === 2) multiplier *= 0.5;
    powers[index] = rounded(powers[index] * multiplier);
  });
  state.lastSpin.values = powers;
  state.lastSpin.total = rounded(powers.reduce((sum, power) => sum + power, 0));

  state.overclockReady = false;
  combatAttacks(state, powers, ignoresArmor);
  let incoming = state.enemies.filter(e => e.hp > 0).reduce((sum, e) => sum + e.attack, 0);
  const alive = state.enemies.some(e => e.hp > 0);
  if (alive && state.enemySkill.id === 'pressure' && state.round % 3 === 0) incoming += 3;
  if (alive && state.enemySkill.id === 'drain' && state.round % 2 === 0) incoming += 3;
  incoming = rounded(Math.max(0, incoming - incomingReduction) * incomingMultiplier);
  state.lastSpin.incoming = incoming;
  const piercing = hasDebuff(state, 'shield_pierce') ? incoming * 0.25 : 0;
  const blocked = Math.min(state.shield, incoming - piercing);
  state.shield = rounded(state.shield - blocked);
  const beforeHp = state.hp;
  state.hp = rounded(Math.max(0, state.hp - incoming + blocked));
  state.resourceStats.shieldBlocked = rounded(state.resourceStats.shieldBlocked + blocked);
  state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + beforeHp - state.hp);
  record(state, `造成 ${rounded(state.lastSpin.damage)} 伤害；敌方反击 ${incoming}，护盾抵挡 ${rounded(blocked)}。`);
  state.enemyIntent = nextIntent(state);

  const removed = new Set(consumed);
  state.board.forEach(u => { if (u?.status === 'expired') removed.add(u.uid); });
  state.roster = state.roster.filter(u => !removed.has(u.uid));
  state.roster.push(...generated);
  state.stats.destroyed += removed.size;
  if (removed.size) record(state, `${removed.size} 位临时角色退场。`);
  state.stats.damage = rounded(state.stats.damage + state.lastSpin.damage);
  state.stats.coins = rounded(state.stats.coins + state.lastSpin.coins);
  // A fatal retaliation ends the run; an essence cannot resurrect the train.
  if (state.hp > 0) updateEssences(state, metrics);
  // HP-triggered clauses start next turn; round-triggered clauses above take
  // effect before this turn's board and all utility/attack resolution.
  updateBossStages(state);

  const clear = state.enemies.every(e => e.hp <= 0);
  if (state.hp <= 0 || (!clear && state.spinsLeft <= 0)) {
    state.phase = 'defeat';
    state.pendingRewards = [];
    state.choices = [];
    record(state, state.hp <= 0 ? '列车护卫失守，本次开拓结束。' : '回合期限已到，裂界仍未清除。本次开拓结束。');
  } else if (clear) {
    finishFloor(state);
  } else {
    state.pendingRewards = ['recruit'];
    advanceRewards(state);
  }
  state.history = state.history.slice(-100);
  return state;
}

export function chooseReward(previous, index) {
  if (!['recruit', 'item', 'essence'].includes(previous?.phase) || !Number.isInteger(index) || index < 0 || index >= previous.choices.length) return previous;
  const state = copy(previous);
  const id = state.choices[index];
  if (state.phase === 'recruit') {
    if (state.roster.length >= 200) return previous;
    const c = characterById(id);
    state.roster.push(unit(state, id));
    state.history.push(`招募：${c.name}加入编队。`);
    mergeRoster(state);
  } else if (state.phase === 'item') {
    const item = itemById(id);
    state.items.push(id);
    state.history.push(`获得奇物：${item.name}。`);
    if (id === 'abundance_wax') heal(state, 20);
    if (id === 'dimension_dice') { state.maxHp += 15; heal(state, 15); }
    if (id === 'seal_stamp' && !state.pendingFloor) { state.spinsLeft += 1; state.encounter.deadline += 1; }
    if (id === 'broken_clock') state.rerolls += 2;
  } else {
    const essence = essenceById(id);
    state.essences.push({ id, progress: 0, triggered: false });
    state.history.push(`获得余响：${essence.name}，从下一轮开始积累。`);
  }
  advanceRewards(state);
  return state;
}

export function skipReward(previous) {
  if (!['recruit', 'item', 'essence'].includes(previous?.phase)) return previous;
  const state = copy(previous);
  state.history.push(`跳过${state.phase === 'recruit' ? '本次招募' : state.phase === 'item' ? '本次奇物' : '本次余响'}。`);
  advanceRewards(state);
  return state;
}

export function rerollRewards(previous) {
  if (!['recruit', 'item', 'essence'].includes(previous?.phase) || !resourceEnabled(previous, 'rerolls') || (previous.rerolls <= 0 && (!resourceEnabled(previous, 'credits') || previous.coins < 8))) return previous;
  const state = copy(previous);
  if (state.rerolls > 0) state.rerolls -= 1;
  else { state.coins -= 8; state.resourceStats.paidRerolls += 1; state.resourceStats.creditsSpent += 8; }
  state.resourceStats.rerollsUsed += 1;
  state.choices = rewardChoices(state, state.phase, previous.choices);
  state.history.push('重新抽取了本次奖励。');
  return state;
}

export function removeSymbol(previous, uid) {
  if (!['ready', 'recruit', 'item', 'essence'].includes(previous?.phase) || !resourceEnabled(previous, 'removals') || previous.removals <= 0 || !previous.roster.some(u => u.uid === uid)) return previous;
  const state = copy(previous);
  const removed = state.roster.find(u => u.uid === uid);
  state.roster = state.roster.filter(u => u.uid !== uid);
  state.board = state.board.map(u => u?.uid === uid ? null : u);
  state.removals -= 1;
  state.resourceStats.removalsUsed += 1;
  clearMissingPollution(state);
  state.history.push(`移除：${characterById(removed.id).name}。`);
  return state;
}

export function purchaseSupply(previous, kind) {
  const supply = typeof kind === 'string' && Object.hasOwn(SUPPLIES, kind) ? SUPPLIES[kind] : null;
  if (!supply || previous?.phase !== 'ready' || !resourceEnabled(previous, 'credits') || previous.supplyPurchases >= 2 || previous.coins < supply.cost) return previous;
  if ((kind === 'repair' || kind === 'barrier') && !resourceEnabled(previous, 'defense')) return previous;
  if (kind === 'repair' && previous.hp >= previous.maxHp) return previous;
  if (kind === 'barrier' && previous.shield >= previous.maxHp * 2) return previous;
  if (kind === 'overclock' && previous.overclockReady) return previous;
  const state = copy(previous);
  state.coins -= supply.cost;
  state.supplyPurchases += 1;
  state.resourceStats.supplyPurchases += 1;
  state.resourceStats.creditsSpent += supply.cost;
  if (kind === 'repair') heal(state, supply.healing, true);
  if (kind === 'barrier') shield(state, supply.shield, true);
  if (kind === 'overclock') state.overclockReady = true;
  state.history.push(`购买${supply.name}，花费 ${supply.cost} 信用点（本层 ${state.supplyPurchases}/2）。`);
  return state;
}

export function continueEndless(previous) {
  if (previous?.phase !== 'victory') return previous;
  const state = copy(previous);
  state.endless = true;
  state.floor += 1;
  state.phase = 'ready';
  state.pendingFloor = false;
  state.pendingRewards = [];
  setupFloor(state);
  state.history.push('无尽开拓开始：敌人生命将持续增长，首领条款继续追加。');
  return state;
}

export function validateSave(input) {
  // Treat local storage as untrusted. Never execute data or recover a partially invalid run.
  try {
    if (input?.version === 1 && input.mode === 'combat') {
      input = copy(input);
      input.version = SAVE_VERSION;
      input.difficulty = 10;
      input.resourceAccess = { ...DEFAULT_RESOURCE_ACCESS };
      input.resourceStats = newResourceStats(input.hp, input.shield);
      input.supplyPurchases = 0;
      input.overclockReady = false;
      input.activeDebuffs = [];
      input.bossStage = input.enemies?.some(enemy => enemy.boss) ? 1 : 0;
      input.bossStages = bossStageRules();
      input.migratedFromVersion = 1;
      delete input.rent;
    }
    if (!input || typeof input !== 'object' || input.version !== SAVE_VERSION) return null;
    if (input.mode !== 'combat' || !PHASES.includes(input.phase)) return null;
    if (!Number.isInteger(input.difficulty) || !finite(input.difficulty, 1, 20)) return null;
    if (!input.resourceAccess || Object.keys(DEFAULT_RESOURCE_ACCESS).some(key => typeof input.resourceAccess[key] !== 'boolean')) return null;
    if (!input.resourceStats || Object.keys(newResourceStats()).some(key => !finite(input.resourceStats[key]))) return null;
    if (!Number.isInteger(input.supplyPurchases) || !finite(input.supplyPurchases, 0, 2) || typeof input.overclockReady !== 'boolean') return null;
    if (!Array.isArray(input.activeDebuffs) || input.activeDebuffs.length > ENEMY_DEBUFFS.length || new Set(input.activeDebuffs.map(effect => effect?.id)).size !== input.activeDebuffs.length || input.activeDebuffs.some(effect => !effect || !enemyDebuffById(effect.id) || typeof effect.name !== 'string' || typeof effect.description !== 'string' || !['boss', 'difficulty'].includes(effect.source) || !Number.isInteger(effect.addedRound) || !finite(effect.addedRound, 0, input.round))) return null;
    if (!Number.isInteger(input.bossStage) || !finite(input.bossStage, 0, 3) || !input.bossStages || input.bossStages.maxStages !== 3 || JSON.stringify(input.bossStages.healthThresholds) !== '[0.7,0.35]' || JSON.stringify(input.bossStages.roundThresholds) !== '[3,5]') return null;
    if (input.migratedFromVersion !== undefined && input.migratedFromVersion !== 1) return null;
    if (typeof input.seed !== 'string' || input.seed.length > 200) return null;
    const integers = ['rngState', 'uidCounter', 'floor', 'round', 'spinsLeft', 'rerolls', 'removals'];
    if (integers.some(key => !Number.isInteger(input[key]) || !finite(input[key], key === 'rngState' || key === 'uidCounter' || key === 'floor' ? 1 : 0, key === 'rngState' ? 4294967295 : 1000000))) return null;
    if (!finite(input.coins) || !finite(input.maxHp, 1) || !finite(input.hp, 0, input.maxHp) || !finite(input.shield, 0, input.maxHp * 2)) return null;
    if (typeof input.endless !== 'boolean' || typeof input.pendingFloor !== 'boolean') return null;
    if ((!input.endless && input.floor > FINAL_FLOOR) || (input.endless && input.floor <= FINAL_FLOOR)) return null;
    if (!Array.isArray(input.roster) || input.roster.length > 200 || !Array.isArray(input.board) || input.board.length !== BOARD_SIZE) return null;
    const validUnit = (u, board = false) => {
      if (!u || typeof u.uid !== 'string' || !/^u[1-9]\d*$/.test(u.uid) || typeof u.id !== 'string' || !characterById(u.id)) return false;
      if (!Number.isInteger(u.stars) || !finite(u.stars, 1, 3) || !finite(u.growth) || !Number.isInteger(u.ticks) || !finite(u.ticks)) return false;
      if (u.origin !== undefined && (typeof u.origin !== 'string' || !/^u[1-9]\d*$/.test(u.origin))) return false;
      if (u.temporary !== undefined && (!Number.isInteger(u.temporary) || !finite(u.temporary, board ? 0 : 1, 3))) return false;
      if (!board) return u.status === undefined && u.consumptionBonus === undefined;
      if (u.status !== undefined && !['consumed', 'expired'].includes(u.status)) return false;
      if (u.status === 'consumed' && !(u.temporary > 0)) return false;
      if (u.status === 'expired' && u.temporary !== 0) return false;
      if (u.temporary === 0 && u.status !== 'expired') return false;
      return u.consumptionBonus === undefined || finite(u.consumptionBonus);
    };
    if (input.roster.some(u => !validUnit(u)) || new Set(input.roster.map(u => u.uid)).size !== input.roster.length) return null;
    for (const effect of input.activeDebuffs) {
      if (effect.id !== 'rift_pollution') {
        if (effect.targetUid !== undefined || effect.targetId !== undefined || effect.targetName !== undefined) return null;
        continue;
      }
      const target = input.roster.find(instance => instance.uid === effect.targetUid);
      if (Object.keys(effect).some(key => !['id', 'name', 'description', 'source', 'addedRound', 'targetUid', 'targetId', 'targetName'].includes(key))) return null;
      if (typeof effect.targetUid !== 'string' || !/^u[1-9]\d*$/.test(effect.targetUid) || !target || target.temporary || target.stars !== 1 || effect.targetId !== target.id || effect.targetName !== characterById(target.id).name || effect.source !== 'difficulty' || effect.addedRound !== 0 || effect.name !== enemyDebuffById('rift_pollution').name || ![pollutionDescription(effect.targetName), legacyPollutionDescription(effect.targetName)].includes(effect.description)) return null;
    }
    if (input.board.some(u => u !== null && !validUnit(u, true))) return null;
    const boardUnits = input.board.filter(Boolean);
    if (new Set(boardUnits.map(u => u.uid)).size !== boardUnits.length) return null;
    if ([...input.roster, ...boardUnits].some(u => Number(u.uid.slice(1)) >= input.uidCounter)) return null;
    if (!Array.isArray(input.items) || input.items.some(id => !itemById(id)) || new Set(input.items).size !== input.items.length) return null;
    if (!Array.isArray(input.essences) || input.essences.some(e => !essenceById(e.id) || !finite(e.progress, 0, essenceById(e.id).target) || typeof e.triggered !== 'boolean') || new Set(input.essences.map(e => e.id)).size !== input.essences.length) return null;
    if (!Array.isArray(input.enemies) || input.enemies.length > 5 || input.enemies.some(e => !e || typeof e.id !== 'string' || typeof e.name !== 'string' || !Number.isInteger(e.col) || !finite(e.col, 0, 4) || !finite(e.maxHp, 1) || !finite(e.hp, 0, e.maxHp) || !finite(e.attack) || typeof e.boss !== 'boolean' || (e.boss && e.col !== 2) || (e.art !== undefined && typeof e.art !== 'string'))) return null;
    if (new Set(input.enemies.map(e => e.col)).size !== input.enemies.length || new Set(input.enemies.map(e => e.id)).size !== input.enemies.length) return null;
    if (input.enemies.length === 0) return null;
    if (Boolean(input.bossStage) !== input.enemies.some(enemy => enemy.boss)) return null;
    if (!input.enemySkill || !ENEMY_SKILLS.some(skill => skill.id === input.enemySkill.id) || typeof input.enemySkill.name !== 'string' || typeof input.enemySkill.description !== 'string' || !input.enemyIntent || !finite(input.enemyIntent.damage) || !Number.isInteger(input.enemyIntent.round) || !finite(input.enemyIntent.round, 1) || typeof input.enemyIntent.name !== 'string' || typeof input.enemyIntent.description !== 'string') return null;
    if (!input.encounter || typeof input.encounter.name !== 'string' || !Number.isInteger(input.encounter.deadline) || !finite(input.encounter.deadline, 1, 100)) return null;
    if (input.spinsLeft > input.encounter.deadline || input.round > input.encounter.deadline) return null;
    if (!Array.isArray(input.pendingRewards) || input.pendingRewards.some(phase => !['recruit', 'item', 'essence'].includes(phase)) || input.pendingRewards.length > 3) return null;
    if (!Array.isArray(input.choices) || input.choices.length > 3 || new Set(input.choices).size !== input.choices.length) return null;
    const pool = input.phase === 'recruit' ? CHARACTERS : input.phase === 'item' ? ITEMS : input.phase === 'essence' ? ESSENCES : [];
    if (input.choices.some(id => !pool.some(c => c.id === id)) || (['recruit', 'item', 'essence'].includes(input.phase) && input.choices.length === 0)) return null;
    if (input.phase === 'item' && input.choices.some(id => input.items.includes(id))) return null;
    if (input.phase === 'essence' && input.choices.some(id => input.essences.some(e => e.id === id))) return null;
    const rewardPhase = ['recruit', 'item', 'essence'].includes(input.phase);
    const alive = input.enemies.some(e => e.hp > 0);
    if (input.phase === 'ready' && (input.spinsLeft === 0 || input.pendingFloor || input.pendingRewards.length || input.hp === 0)) return null;
    if ((input.phase === 'ready' || rewardPhase && !input.pendingFloor) && !alive) return null;
    if (input.pendingFloor && (!rewardPhase || alive)) return null;
    if (rewardPhase && (input.hp === 0 || (!input.pendingFloor && (input.spinsLeft === 0 || input.phase !== 'recruit')))) return null;
    if (rewardPhase) {
      const order = ['recruit', 'item', 'essence'];
      const ranks = [input.phase, ...input.pendingRewards].map(phase => order.indexOf(phase));
      if (ranks.some((rank, index) => index > 0 && rank <= ranks[index - 1])) return null;
    } else if (input.pendingRewards.length || input.pendingFloor) return null;
    if (input.phase === 'victory' && (input.floor !== FINAL_FLOOR || input.endless || alive)) return null;
    if (input.phase === 'defeat' && input.hp > 0 && input.spinsLeft > 0) return null;
    if (input.phase === 'defeat' && input.hp > 0 && !alive) return null;
    const last = input.lastSpin;
    if (!last || ['total', 'damage', 'coins', 'healing', 'shield', 'incoming'].some(key => !finite(last[key])) || !Array.isArray(last.values) || last.values.length !== BOARD_SIZE || last.values.some(value => !finite(value))) return null;
    if (!Array.isArray(last.hits) || last.hits.length > 120 || last.hits.some(hit => !Number.isInteger(hit.cell) || !finite(hit.cell, 0, 19) || !Number.isInteger(hit.targetCol) || !finite(hit.targetCol, 0, 4) || !finite(hit.amount))) return null;
    if (!Array.isArray(last.events) || last.events.some(event => typeof event !== 'string') || !Array.isArray(input.history) || input.history.length > 1000 || input.history.some(event => typeof event !== 'string')) return null;
    if (!input.stats || ['spins', 'damage', 'coins', 'merges', 'destroyed'].some(key => !finite(input.stats[key]))) return null;
    // The JSON round trip discards prototype properties and guarantees persistence compatibility.
    const restored = JSON.parse(JSON.stringify(input));
    for (const effect of restored.activeDebuffs) {
      if (effect.id === 'rift_pollution') effect.description = pollutionDescription(effect.targetName);
    }
    return restored;
  } catch { return null; }
}

export function getSaveStatus(input) {
  if (input?.version === 1 && input.mode === 'classic') return 'legacy-classic';
  if (!validateSave(input)) return 'invalid';
  return input.version === 1 ? 'migrated' : 'valid';
}
