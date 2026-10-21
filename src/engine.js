import { getPassiveEffectSources } from './effect-rules.js';
import { CHARACTERS, ITEMS, ESSENCES, SYNERGIES, characterById, itemById, essenceById } from './content.js';
import { DIFFICULTY, lateDifficultyMultiplier, normalizeDifficulty, difficultyHealthMultiplier } from './difficulty.js';
import { ENEMY_DEBUFFS, enemyDebuffById, hasDebuff, getEligibleDebuffs, publicDebuff, unitPowerMultiplier, utilityMultiplier, abilityEffectAmount, pollutionDescription, legacyPollutionDescription, isPolluted } from './enemy-effects.js';
import { getEffectSources, effectIsEligible, effectAmount, effectTargetIndexes, matchesEffectFilter, cumulativeProgressValue, PERSISTENT_PROGRESS_METRICS } from './effect-rules.js';
import { getSynergiesFor, synergyOffenseScale } from './synergies.js';
import { RETIREMENT_RULES, retirementRuleById, retirementEligibility, newRetirementStats } from './retirements.js';
import { isArchetypeCore } from './archetypes.js';

export const SAVE_VERSION = 2;
export const BOARD_COLUMNS = 5;
export const BOARD_ROWS = 4;
export const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;
export const STAR_MULTIPLIERS = [0, 1, 3, 9];
export const FINAL_FLOOR = 12;
const PHASES = ['ready', 'recruit', 'item', 'essence', 'victory', 'defeat'];
const ENEMY_SKILLS = [
  { id: 'pressure', name: '战意积蓄', description: '每第三次转动，存活敌人的攻击总和额外增加 3。' },
  { id: 'armor', name: '装甲校验', description: '每次命中减少 1 点伤害；无视装甲效果生效时可绕过。' },
  { id: 'jammer', name: '禁锢矩阵', description: '每第三次转动，中间列角色的威力降低 50%。' },
  { id: 'drain', name: '能量抽取', description: '每第二次转动，额外造成 3 点可被护盾抵挡的伤害。' },
];
const copy = value => structuredClone(value);
const rounded = value => Math.round(value * 100) / 100;
const spinHitObservers = new WeakMap();
const spinModifiers = new WeakMap();
const isLegacyUnit = unit => characterById(unit.id).kitVersion !== 6;
const attackGrowth = unit => characterById(unit.id).kitVersion !== 6 || characterById(unit.id).role === 'attack' ? unit.growth : 0;
const newSpinRecord = (floor = 1, round = 0) => ({ floor, round, total: 0, damage: 0, coins: 0, healing: 0, shield: 0, incoming: 0, events: [], hits: [], effects: [], powerBreakdown: Array(BOARD_SIZE).fill(null), values: Array(BOARD_SIZE).fill(0) });
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

function effectEvent(state, source, type, amount, duration = 'spin', targetUid = null, label = '') {
  state.lastSpin.effects ||= [];
  if (state.lastSpin.effects.length >= 2000) return;
  const event = { sourceId: source?.sourceId || source?.id || 'system', type, label: label || source?.definition?.name || source?.name || type, duration, floor: state.floor, round: state.round };
  if (source?.sourceUid || source?.uid) event.sourceUid = source.sourceUid || source.uid;
  if (targetUid) event.targetUid = targetUid;
  if (Number.isFinite(amount)) event.amount = rounded(amount);
  state.lastSpin.effects.push(event);
}

function passiveMultiplier(state, type, extras = {}) {
  let multiplier = 1;
  const synergies = getSynergies(state).filter(s => s.active);
  for (const source of getPassiveEffectSources(state, type, synergies)) {
    const context = { state, synergies, ...extras, unit: source.unit || extras.unit, index: source.index ?? extras.index, star: source.unit ? starMultiplier(state, source.unit) : 1, trigger: 'passive' };
    for (const effect of source.effects) {
      if (effect.trigger !== 'passive' || effect.type !== type || !effectIsEligible(effect, context)) continue;
      if (effect.filter && (!extras.unit || !matchesEffectFilter(extras.unit, effect.filter, source.unit))) continue;
      if (effect.target === 'self' && source.unit && source.unit.uid !== extras.unit?.uid) continue;
      const factor = effectAmount(effect, context);
      multiplier *= factor;
      if (extras.record && factor !== 1) effectEvent(state, source, type, factor, 'spin', extras.targetUid || extras.unit?.uid, effect.summary || source.definition.name);
    }
  }
  return multiplier;
}

function runEffects(state, trigger, context = {}, options = {}) {
  const synergies = context.synergies || getSynergies(state).filter(s => s.active);
  const sources = getEffectSources(state, { trigger, unit: context.unit, index: context.index, synergies, acquired: options.acquired, consumed: context.consumed });
  for (const source of sources) for (let effectIndex = 0; effectIndex < source.effects.length; effectIndex++) {
    const effect = source.effects[effectIndex];
    if (effect.trigger !== trigger) continue;
    if ((effect.stage || 'beforeAttacks') !== (options.stage || 'beforeAttacks')) continue;
    const members = effect.scope === 'members' && !context.unit
      ? state.board.map((u, index) => ({ unit: u, index })).filter(({ unit }) => unit && !context.consumed?.has(unit.uid) && matchesEffectFilter(unit, source.definition.filter || { [source.definition.kind]: source.definition.tag }))
      : [{ unit: source.unit || context.unit, index: source.index ?? context.index }];
    for (const member of members) {
      const active = { ...context, ...member, state, synergies, trigger, star: member.unit ? starMultiplier(state, member.unit) : 1 };
      if (effect.scope === 'members' && !matchesEffectFilter(active.unit, source.definition.filter || { [source.definition.kind]: source.definition.tag })) continue;
      if (effect.scope === 'members' && effect.filter && (effect.type === 'damage' || effect.target === 'self') && !matchesEffectFilter(active.unit, effect.filter, source.unit)) continue;
      if (!effectIsEligible(effect, active)) continue;
      const useKey = `${source.sourceType}:${source.sourceId}:${effect.id || effectIndex}${effect.scope === 'members' ? `:${active.unit?.uid}` : ''}`;
      if (effect.oncePerSpin && context.effectUses?.has(useKey)) continue;
      if (Number.isFinite(effect.chance) && random(state) >= effect.chance) continue;
      if (effect.oncePerSpin) context.effectUses?.add(useKey);
      let amount = effectAmount(effect, active);
      if (source.sourceType === 'character') amount = abilityEffectAmount(state, source.unit, effect, amount);
      if (source.sourceType === 'synergy' && ['power', 'damage'].includes(effect.type)) amount *= synergyOffenseScale(state);
      if (source.sourceType === 'synergy' && effect.type === 'powerMultiplier') amount = 1 + (amount - 1) * synergyOffenseScale(state);
      if (effect.type === 'power' || effect.type === 'powerMultiplier') {
        context.pendingPowerEffects?.push({ effect, source, context: active });
        continue;
      }
      if (effect.type === 'heal' || effect.type === 'healOverflowShield') {
        const result = heal(state, amount * (source.sourceType === 'character' ? utilityMultiplier(state, active.unit, 'heal') : 1), false, active.unit);
        effectEvent(state, source, 'heal', result.actual, 'resource', null, effect.summary);
        if (effect.type === 'healOverflowShield' && result.overflow > 0) { const before = state.shield; shield(state, result.overflow, false, active.unit); effectEvent(state, source, 'shield', state.shield - before, 'resource', null, effect.summary); }
      } else if (effect.type === 'shield') { const before = state.shield; shield(state, amount * (source.sourceType === 'character' ? utilityMultiplier(state, active.unit, 'shield') : 1), false, active.unit); effectEvent(state, source, 'shield', state.shield - before, 'resource', null, effect.summary); }
      else if (effect.type === 'growth') {
        const targetIndexes = effectTargetIndexes(effect, active);
        let targets = targetIndexes.map(i => state.board[i]);
        if (!targets.length && active.unit && (!effect.target || effect.target === 'self')) targets = [active.unit];
        for (const target of targets) {
          const original = state.roster.find(u => u.uid === target.uid);
          if (!original || original.temporary) continue;
          const gained = amount * (hasItem(state, 'rubert_gear') ? 1.5 : 1) * (hasDebuff(state, 'growth_audit') ? 0.5 : 1) * passiveMultiplier(state, 'growthMultiplier', { unit: target });
          original.growth = rounded(original.growth + gained); target.growth = original.growth;
          if (context.metrics) context.metrics.growth = rounded((context.metrics.growth || 0) + gained);
          effectEvent(state, source, 'growth', gained, 'run', target.uid, effect.summary);
        }
      } else if (effect.type === 'vulnerability') {
        context.vulnerabilities ||= [];
        context.vulnerabilities.push({ filter: effect.filter || {}, amount, source });
        effectEvent(state, source, 'vulnerability', amount, 'spin', null, effect.summary);
      } else if (effect.type === 'resource') {
        const field = effect.resource || 'coins';
        if (!['coins', 'rerolls', 'removals'].includes(field)) continue;
        const gain = field === 'coins' ? rounded(Math.max(0, amount)) : Math.floor(Math.max(0, amount));
        state[field] = rounded(state[field] + gain);
        if (field === 'coins') { state.lastSpin.coins = rounded(state.lastSpin.coins + gain); if (!context.duringSpin) state.stats.coins = rounded(state.stats.coins + gain); }
        effectEvent(state, source, field, gain, 'resource', null, effect.summary);
      } else if (effect.type === 'retaliationFlat') context.incomingReduction = (context.incomingReduction || 0) + amount;
      else if (effect.type === 'retaliationMultiplier') context.incomingMultiplier = (context.incomingMultiplier ?? 1) * amount;
      else if (effect.type === 'ignoreArmor') context.ignoresArmor = true;
      else if (effect.type === 'summon') {
        if (characterById(effect.characterId) && state.roster.length + (context.generated?.length || 0) < 200) {
          const reinforcement = unit(state, effect.characterId, { temporary: Math.max(1, Math.min(3, effect.durationAppearances || 3)), ...(active.unit ? { origin: active.unit.uid } : {}) });
          if (context.generated) context.generated.push(reinforcement); else state.roster.push(reinforcement);
          effectEvent(state, source, 'summon', 1, 'appearances', reinforcement.uid, effect.summary);
        }
      } else if (effect.type === 'selfDamage') {
        const before = state.hp; state.hp = rounded(Math.max(effect.nonlethal === false ? 0 : 1, state.hp - amount));
        state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + before - state.hp);
        effectEvent(state, source, 'selfDamage', before - state.hp, 'instant', active.unit?.uid, effect.summary);
      } else if (effect.type === 'maxHp') { state.maxHp = rounded(state.maxHp + amount); effectEvent(state, source, 'maxHp', amount, 'run', null, effect.summary); }
      else if (effect.type === 'extraSpin') { const gained = Math.max(0, Math.floor(amount)); state.spinsLeft += gained; state.encounter.deadline += gained; effectEvent(state, source, 'extraSpin', gained, 'encounter', null, effect.summary); }
      else if (effect.type === 'damage') {
        if (context.pendingDamageEffects && !['kill', 'retaliation'].includes(trigger) && (options.stage || 'beforeAttacks') === 'beforeAttacks') context.pendingDamageEffects.push({ effect, source, active, amount });
        else resolveEffectDamage(state, effect, source, active, context, amount);
      } else if (effect.type === 'consume' && active.unit) {
        const targetIndex = effectTargetIndexes({ ...effect, target: effect.target || 'adjacent', filter: { ...effect.filter, temporary: true, excludeSelf: true } }, active)[0];
        const target = state.board[targetIndex];
        if (target && context.consumed) { context.consumed.add(target.uid); target.status = 'consumed'; context.retirements = (context.retirements || 0) + 1; context.pendingPowerEffects?.push({ effect: { type: 'power', value: amount, target: 'self', duration: 'spin', summary: effect.summary }, source, context: active }); effectEvent(state, source, 'consume', 1, 'instant', target.uid, effect.summary); }
      }
      if (['retaliationFlat', 'retaliationMultiplier', 'ignoreArmor'].includes(effect.type)) effectEvent(state, source, effect.type, amount, 'spin', active.unit?.uid, effect.summary);
    }
  }
  return context;
}

function resolveEffectDamage(state, effect, source, active, context, amount) {
  if (source.sourceUid && context.consumed?.has(source.sourceUid)) return;
  if (effect.target === 'strongest') {
    const candidate = effectTargetIndexes(effect, { ...active, powers: context.powers })[0];
    if (candidate === undefined) return;
    active.index = candidate; active.unit = state.board[candidate];
  }
  if (effect.per?.metric === 'sourcePower' || effect.scaleWithSourcePower || effect.target === 'strongest') amount = effectAmount(effect, { ...active, powers: context.powers }) * (source.sourceType === 'synergy' ? synergyOffenseScale(state) : 1);
  if (source.sourceType === 'character' && (effect.per?.metric === 'sourcePower' || effect.scaleWithSourcePower || effect.target === 'strongest')) amount = abilityEffectAmount(state, source.unit, effect, amount);
  const candidates = state.enemies.filter(e => e.hp > 0 && (!effect.excludeOriginColumn || e.col !== active.index % BOARD_COLUMNS));
  const targets = effect.target === 'team' || effect.target === 'all' ? candidates : [nearestEnemy(candidates, Number.isInteger(active.index) ? active.index % BOARD_COLUMNS : 2)].filter(Boolean);
  const before = state.lastSpin.damage;
  for (const enemy of targets) attackEnemy(state, active.index ?? 0, enemy, amount, Boolean(effect.ignoreArmor || context.ignoresArmor), null, source, active.unit);
  effectEvent(state, source, 'damage', state.lastSpin.damage - before, 'instant', null, effect.summary);
}

function applyPowerEffects(state, context) {
  const archetypeMultipliers = new Map();
  const supportMultipliers = new Map();
  for (const { effect, source, context: savedContext } of context.pendingPowerEffects || []) {
    if (source.sourceUid && context.consumed?.has(source.sourceUid)) continue;
    const active = { ...savedContext, powers: context.powers, consumed: context.consumed, metrics: context.metrics };
    let amount = effectAmount(effect, active);
    if (source.sourceType === 'character') amount = abilityEffectAmount(state, source.unit, effect, amount);
    if (source.sourceType === 'synergy' && effect.type === 'power') amount *= synergyOffenseScale(state);
    if (source.sourceType === 'synergy' && effect.type === 'powerMultiplier') amount = 1 + (amount - 1) * synergyOffenseScale(state);
    for (const index of effectTargetIndexes(effect, active)) {
      let appliedAmount = amount;
      const isSupportBuff = source.sourceType === 'character' && source.definition.role === 'amplifier' || ['adjacent', 'strongest'].includes(effect.target);
      const buffScale = isSupportBuff ? passiveMultiplier(state, 'buffMultiplier', { unit: active.unit, record: true, targetUid: state.board[index].uid }) * (hasItem(state, 'harmony_wax') ? 1.5 : 1) * (source.sourceType === 'character' ? utilityMultiplier(state, active.unit, 'buff') : 1) : 1;
      if (effect.type === 'power') {
        appliedAmount *= buffScale;
        context.powers[index] += appliedAmount;
      }
      else if (source.sourceType === 'archetype') {
        const previous = archetypeMultipliers.get(index) || 1;
        const next = Math.max(previous, amount);
        if (next === previous) continue;
        appliedAmount = next / previous;
        archetypeMultipliers.set(index, next);
        context.powerMultipliers[index] *= appliedAmount;
      } else if (source.sourceType === 'character' && source.definition.kitVersion === 6 && source.definition.role === 'amplifier') {
        const previous = supportMultipliers.get(index) || 1;
        const next = Math.min(2.2, previous * Math.max(1, 1 + (amount - 1) * buffScale));
        appliedAmount = next / previous;
        supportMultipliers.set(index, next);
        context.powerMultipliers[index] *= appliedAmount;
      } else { appliedAmount = 1 + (amount - 1) * buffScale; context.powerMultipliers[index] *= appliedAmount; }
      const label = source.sourceType === 'archetype' && effect.type === 'powerMultiplier' ? `${effect.summary}（套路倍率取最高，本步×${rounded(appliedAmount)}）` : effect.summary;
      effectEvent(state, source, effect.type, appliedAmount, effect.duration || 'spin', state.board[index].uid, label);
    }
  }
}

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
  return getSynergiesFor(state, characterById);
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
  runEffects(state, 'floor', { synergies: getSynergies(state).filter(s => s.active), effectUses: new Set() });
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
    lastSpin: newSpinRecord(),
    history: ['列车抵达：每次转动后可招募一名角色，三名相同一星角色会自动合成二星。'],
    stats: { spins: 0, damage: 0, coins: 0, merges: 0, destroyed: 0 },
    retirementStats: newRetirementStats(),
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

function heal(state, amount, fixed = false, sourceUnit = null) {
  let multiplier = (!fixed && hasItem(state, 'abundance_wax') ? 1.5 : 1) * (!fixed ? passiveMultiplier(state, 'healMultiplier', { unit: sourceUnit }) : 1);
  if (!fixed && hasDebuff(state, 'healing_audit')) multiplier *= 0.75;
  const requested = rounded(amount * multiplier);
  const actual = Math.min(state.maxHp - state.hp, requested);
  state.hp = rounded(state.hp + actual);
  state.lastSpin.healing = rounded(state.lastSpin.healing + actual);
  state.resourceStats.healed = rounded(state.resourceStats.healed + actual);
  return { actual, overflow: requested - actual };
}

function shield(state, amount, fixed = false, sourceUnit = null) {
  let multiplier = (!fixed && hasItem(state, 'preservation_wax') ? 1.5 : 1) * (!fixed ? passiveMultiplier(state, 'shieldMultiplier', { unit: sourceUnit }) : 1);
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
      let same = state.roster.filter(u => u.id === c.id && u.stars === stars && !u.temporary && !u.commission);
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
        runEffects(state, 'merge', { unit: merged, effectUses: new Set() });
        const message = `升星：3 位 ${stars} 星${c.name} → ${stars + 1} 星${c.name}。`;
        state.history.push(message);
        state.lastSpin.events.push(message);
        same = state.roster.filter(u => u.id === c.id && u.stars === stars && !u.temporary && !u.commission);
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

function resolveCommissions(state, consumed, generated, metrics) {
  state.retirementStats ||= newRetirementStats();
  let count = 0;
  const growthScale = (hasItem(state, 'rubert_gear') ? 1.5 : 1) * (hasDebuff(state, 'growth_audit') ? 0.5 : 1);
  for (const [index, source] of state.board.entries()) {
    if (!source || source.temporary || source.commission || consumed.has(source.uid)) continue;
    for (const rule of RETIREMENT_RULES.filter(entry => entry.sourceId === source.id)) {
      const nextTick = source.ticks + 1;
      const previous = state.retirementStats.byRule[rule.id];
      const unlocked = state.roster.some(u => u.id === rule.targetId && !u.temporary && !u.commission) || previous?.completed > 0;
      if (nextTick % rule.supplyEvery === 0 && unlocked && state.roster.length + generated.length < 200 && ![...state.roster, ...generated].some(u => u.commission === rule.id && !consumed.has(u.uid))) {
        const trainee = unit(state, rule.targetId, { commission: rule.id, origin: source.uid });
        generated.push(trainee);
        const stats = state.retirementStats.byRule[rule.id] ||= { completed: 0, permanent: 0, supplied: 0 };
        stats.supplied += 1; state.retirementStats.supplied += 1;
        effectEvent(state, source, 'commission', 1, 'run', trainee.uid, `${rule.name}：补充见习委派，下轮起登场，不计羁绊和套路身份`);
      }
      if (nextTick % rule.every !== 0) continue;
      const candidates = neighbors(index).map(i => state.board[i]).filter(target => retirementEligibility(state, source, target, { consumed, isCore: isArchetypeCore }).eligible);
      // Prefer generated assignments; among ordinary extras, preserve the most trained.
      candidates.sort((a, b) => Number(Boolean(b.commission)) - Number(Boolean(a.commission)) || a.growth - b.growth || a.ticks - b.ticks || a.uid.localeCompare(b.uid));
      const target = candidates[0];
      if (!target) continue;
      consumed.add(target.uid); target.status = 'consumed'; target.dispatchRule = rule.id;
      const original = state.roster.find(u => u.uid === source.uid);
      const gained = effectAmount({ type: 'growth', value: rule.growth, scaleWithStars: true, ...(!isLegacyUnit(source) ? { starFactors: [0, 1, 1.5, 2] } : {}) }, { unit: source, star: starMultiplier(state, source) }) * growthScale * passiveMultiplier(state, 'growthMultiplier', { unit: source });
      original.growth = rounded(original.growth + gained); source.growth = original.growth;
      if (characterById(source.id).role === 'attack' || isLegacyUnit(source)) source.consumptionBonus = (source.consumptionBonus || 0) + rule.power * starMultiplier(state, source);
      state.coins = rounded(state.coins + rule.coins); state.lastSpin.coins = rounded(state.lastSpin.coins + rule.coins);
      const stats = state.retirementStats.byRule[rule.id] ||= { completed: 0, permanent: 0, supplied: 0 };
      stats.completed += 1; state.retirementStats.completed += 1;
      if (!target.commission) { stats.permanent += 1; state.retirementStats.permanent += 1; metrics.permanentRetirements = (metrics.permanentRetirements || 0) + 1; }
      metrics.growth = rounded((metrics.growth || 0) + gained); count += 1;
      effectEvent(state, source, 'retirement', 1, 'run', target.uid, `${rule.name}：${rule.targetName}完成委派并永久离队（非死亡）`);
      effectEvent(state, source, 'growth', gained, 'run', source.uid, `${rule.name}永久成长`);
      if (characterById(source.id).role === 'attack' || isLegacyUnit(source)) effectEvent(state, source, 'power', rule.power * starMultiplier(state, source), 'spin', source.uid, `${rule.name}本次威力`);
      effectEvent(state, source, 'coins', rule.coins, 'resource', null, `${rule.name}结案报酬`);
      record(state, `${sourceName(source)}：${target.commission ? '见习' : '额外一星'}${rule.targetName}完成「${rule.name}」并永久离队，永久威力+${rounded(gained)}、信用点+${rule.coins}。`);
    }
  }
  return count;
}

const sourceName = source => characterById(source.id).name;

function weightedChoice(state, pool, phase = 'recruit') {
  const floorBoost = Math.min(2.5, 1 + state.floor * 0.09);
  const weights = { common: 52, uncommon: 30, rare: 15 * floorBoost, legendary: 3 * floorBoost };
  if (phase === 'recruit' && hasItem(state, 'fortune_glue')) { weights.rare *= 1.5; weights.legendary *= 1.5; }
  if (phase === 'recruit') for (const source of getEffectSources(state, { trigger: 'passive' })) for (const effect of source.effects) {
    if (effect.trigger !== 'passive' || effect.type !== 'rarityMultiplier' || !effectIsEligible(effect, { state, trigger: 'passive' })) continue;
    if (Object.hasOwn(weights, effect.rarity)) weights[effect.rarity] *= effectAmount(effect, { state });
  }
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
    const pick = weightedChoice(state, pool, phase);
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
  // Every essence observes the completed spin, before any threshold reward is
  // granted. Claim order must not turn one essence's acquisition reward into
  // another essence's same-spin progress or progress multiplier.
  const amounts = {
    essence_elation: state.lastSpin.damage,
    essence_abundance: 1, essence_hunt: metrics.single, essence_destruction: 1,
    essence_erudition: metrics.aoe, essence_harmony: metrics.synergies,
    essence_preservation: state.lastSpin.shield, essence_nihility: metrics.nihility,
  };
  const progressValues = { damage: state.lastSpin.damage, spins: 1, single: metrics.single, aoe: metrics.aoe, nihility: metrics.nihility, synergies: metrics.synergies, shield: state.lastSpin.shield, healing: state.lastSpin.healing, growth: metrics.growth || 0, retirements: metrics.retirements || 0, kills: metrics.kills || 0, credits: state.lastSpin.coins };
  const progressMultiplier = (hasDebuff(state, 'essence_audit') ? 0.75 : 1) * passiveMultiplier(state, 'essenceProgressMultiplier');
  for (const essence of state.essences) {
    if (essence.triggered) continue;
    const data = essenceById(essence.id);
    let gain = amounts[essence.id] || 0;
    if (data.progress) {
      const metric = data.progress.metric;
      if (PERSISTENT_PROGRESS_METRICS.includes(metric)) {
        const current = cumulativeProgressValue(state, metric);
        gain = Math.max(0, current - (essence.baseline ?? current));
        essence.baseline = current;
      } else {
        gain = progressValues[metric] || 0;
      }
    }
    essence.progress = rounded(Math.min(data.target, essence.progress + gain * progressMultiplier));
    if (essence.progress < data.target) continue;
    essence.triggered = true;
    record(state, `余响触发：${data.name}。`);
    if (essence.id === 'essence_abundance') {
      state.maxHp += 20;
      heal(state, state.maxHp);
    }
    if (essence.id === 'essence_harmony') state.rerolls += 3;
    runEffects(state, 'acquire', { metrics, effectUses: new Set() }, { acquired: { definition: data, sourceType: 'essence' } });
  }
}

// Exported for inspection/testing as well as combat preview. A tie selects the left column.
export function nearestEnemy(enemies, col) {
  return enemies.filter(e => e.hp > 0).sort((a, b) => Math.abs(a.col - col) - Math.abs(b.col - col) || a.col - b.col)[0] || null;
}

function attackEnemy(state, cell, enemy, amount, ignoresArmor, onKill = null, effectSource = null, actingUnit = null) {
  if (!enemy || enemy.hp <= 0) return false;
  const armor = state.enemySkill.id === 'armor' && !ignoresArmor ? 1 : 0;
  const attacker = effectSource ? actingUnit : state.board[cell];
  const canExploit = attacker && characterById(attacker.id).role === 'attack' && (!effectSource || ['character', 'archetype', 'synergy'].includes(effectSource.sourceType));
  const extra = canExploit ? (spinModifiers.get(state)?.vulnerabilities || []).filter(entry => matchesEffectFilter(attacker, entry.filter)).reduce((sum, entry) => sum + entry.amount, 0) : 0;
  const damage = rounded(Math.min(enemy.hp, Math.max(0, amount * (1 + Math.min(.75, extra)) - armor)));
  enemy.hp = rounded(Math.max(0, enemy.hp - damage));
  state.lastSpin.damage = rounded(state.lastSpin.damage + damage);
  if (damage > 0) state.lastSpin.hits.push({ cell, targetCol: enemy.col, amount: damage });
  const observer = spinHitObservers.get(state);
  if (damage > 0 && observer) {
    const sourceId = effectSource?.sourceId || effectSource?.id || attacker?.id || 'system';
    const sourceUid = effectSource ? effectSource.sourceUid || effectSource.uid : attacker?.uid;
    observer.push({ cell, targetCol: enemy.col, amount: damage, kind: effectSource ? 'effect' : 'attack', sourceType: effectSource?.sourceType || (effectSource ? 'system' : 'character'), sourceId, ...(sourceUid ? { sourceUid } : {}) });
  }
  if (enemy.hp === 0) onKill?.(cell, enemy);
  return enemy.hp === 0;
}

function combatAttacks(state, powers, ignoresArmor, onKill = null) {
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
      const killed = attackEnemy(state, cell, primary, power * 3, ignoresArmor, onKill);
      if (killed && c.kitVersion !== 6 && c.id === '1102') {
        const next = nearestEnemy(state.enemies, primary.col);
        if (next) { attackEnemy(state, cell, next, power * (hasDebuff(state, 'seele_audit') ? 0.5 : 1), ignoresArmor, onKill); record(state, '希儿：击破后触发再现追击。'); }
      }
    } else if (c.attack === 'blast') {
      const targetCol = primary.col;
      attackEnemy(state, cell, primary, power * 2, ignoresArmor, onKill);
      for (const enemy of state.enemies.filter(e => e.hp > 0 && Math.abs(e.col - targetCol) === 1)) {
        attackEnemy(state, cell, enemy, power, ignoresArmor, onKill);
      }
    } else {
      for (const enemy of state.enemies.filter(e => e.hp > 0)) attackEnemy(state, cell, enemy, power, ignoresArmor, onKill);
    }
  });
}

function resolveSpin(previous, diagnosticHits = null) {
  if (previous?.phase !== 'ready') return previous;
  const state = copy(previous);
  if (diagnosticHits) spinHitObservers.set(state, diagnosticHits);
  state.round += 1;
  state.spinsLeft -= 1;
  state.stats.spins += 1;
  state.lastSpin = newSpinRecord(state.floor, state.round);
  updateBossStages(state);
  if (hasDebuff(state, 'shield_decay')) {
    const beforeShield = state.shield;
    state.shield = rounded(state.shield * 0.8);
    state.resourceStats.shieldDecayed = rounded(state.resourceStats.shieldDecayed + beforeShield - state.shield);
    effectEvent(state, { id: 'shield_decay', name: '护盾滞纳金' }, 'shieldLoss', beforeShield - state.shield, 'instant', null, '本次开始已有护盾衰减20%');
  }
  drawBoard(state);
  const polluted = state.board.find(instance => instance && isPolluted(state, instance.uid));
  if (polluted) {
    const beforeHp = state.hp;
    state.hp = rounded(Math.max(0, state.hp - 6));
    state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + beforeHp - state.hp);
    effectEvent(state, { id: 'rift_pollution', name: '裂界污染' }, 'selfDamage', beforeHp - state.hp, 'instant', polluted.uid, '污染实例登场直接消耗生命');
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
  const startingEnemyCount = state.enemies.filter(e => e.hp > 0).length;
  retirements = resolveCommissions(state, consumed, generated, metrics);
  const effectContext = { synergies, powers, powerMultipliers: Array(BOARD_SIZE).fill(1), pendingPowerEffects: [], pendingDamageEffects: [], consumed, generated, metrics, retirements, incomingReduction: 0, incomingMultiplier: 1, ignoresArmor: false, effectUses: new Set(), duringSpin: true };
  const growthMultiplier = (hasItem(state, 'rubert_gear') ? 1.5 : 1) * (hasDebuff(state, 'growth_audit') ? 0.5 : 1);

  // Resolve growth, utility and consumption before powers and attacks.
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const original = state.roster.find(r => r.uid === u.uid);
    original.ticks += 1;
    const previousGrowth = original.growth;
    const instanceGrowthMultiplier = growthMultiplier * passiveMultiplier(state, 'growthMultiplier', { unit: u });
    if (isLegacyUnit(u) && u.id === '1002' && original.ticks % (hasDebuff(state, 'danheng_audit') ? 4 : 3) === 0) original.growth += instanceGrowthMultiplier;
    if (isLegacyUnit(u) && u.id === '1107' && original.ticks % 2 === 0) original.growth += instanceGrowthMultiplier;
    if (isLegacyUnit(u) && u.id === '1205') {
      original.growth += 0.5 * instanceGrowthMultiplier;
      const before = state.hp;
      state.hp = Math.max(1, state.hp - 2 * starMultiplier(state, u));
      state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + before - state.hp);
      effectEvent(state, u, 'selfDamage', before - state.hp, 'instant', u.uid, '刃登场消耗生命，最低留1');
    }
    original.growth = rounded(original.growth);
    if (original.growth !== previousGrowth) { metrics.growth = rounded((metrics.growth || 0) + original.growth - previousGrowth); effectEvent(state, u, 'growth', original.growth - previousGrowth, 'run', u.uid, `${characterById(u.id).name}永久成长`); }
    Object.assign(u, { ticks: original.ticks, growth: original.growth });
    const star = starMultiplier(state, u);
    const beforeShield = state.shield, beforeHealing = state.lastSpin.healing;
    if (isLegacyUnit(u) && u.id === '1001') shield(state, 3 * star * utilityMultiplier(state, u, 'shield'), false, u);
    if (isLegacyUnit(u) && u.id === '1104') shield(state, 5 * star * utilityMultiplier(state, u, 'shield'), false, u);
    if (isLegacyUnit(u) && u.id === '1208') { shield(state, 6 * star * utilityMultiplier(state, u, 'shield'), false, u); incomingMultiplier *= hasDebuff(state, 'fuxuan_audit') ? 0.9 : 0.8; }
    if (isLegacyUnit(u) && u.id === '1105') heal(state, 3 * star * utilityMultiplier(state, u, 'heal'), false, u);
    if (isLegacyUnit(u) && u.id === '1203') { const result = heal(state, 6 * star * utilityMultiplier(state, u, 'heal'), false, u); if (result.overflow) shield(state, result.overflow, false, u); }
    if (state.shield !== beforeShield) effectEvent(state, u, 'shield', state.shield - beforeShield, 'resource', null, `${characterById(u.id).name}生成护盾`);
    if (state.lastSpin.healing !== beforeHealing) effectEvent(state, u, 'heal', state.lastSpin.healing - beforeHealing, 'resource', null, `${characterById(u.id).name}治疗`);
    if (isLegacyUnit(u) && u.id === '1004') incomingReduction += 2 * star * (hasDebuff(state, 'welt_audit') ? 0.5 : 1);
    if (isLegacyUnit(u) && (u.id === '1006' || u.id === '1106')) ignoresArmor = true;
    if (isLegacyUnit(u) && u.id === '1108' && random(state) < (hasDebuff(state, 'summon_audit') ? 0.125 : 0.25) && state.roster.length + generated.length < 200) {
      generated.push(unit(state, '1109', { temporary: 3, origin: u.uid }));
      record(state, '桑博：一位临时虎克加入编队（下轮起登场）。');
    }
    if (isLegacyUnit(u) && u.id === '1109') {
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
    effectContext.unit = u; effectContext.index = index; effectContext.retirements = retirements;
    runEffects(state, 'appearance', effectContext);
    retirements = effectContext.retirements;
  });
  delete effectContext.unit; delete effectContext.index;

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
  effectContext.retirements = retirements;
  metrics.retirements = retirements;
  if (retirements) runEffects(state, 'retire', effectContext);
  runEffects(state, 'spin', effectContext);

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
  runEffects(state, 'passive', effectContext);

  const present = state.board.filter(u => u && !consumed.has(u.uid));
  const kafkaBoost = present.filter(u => isLegacyUnit(u) && u.id === '1005').reduce((sum, u) => sum + starMultiplier(state, u) * (hasDebuff(state, 'kafka_audit') ? 0.5 : 1), 0);
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const c = characterById(u.id);
    const star = starMultiplier(state, u);
    const appliedGrowth = attackGrowth(u);
    let power = c.power * star + appliedGrowth + (u.consumptionBonus || 0);
    if (isLegacyUnit(u) && u.id === '1013' && u.ticks % 3 === 0) power += (hasDebuff(state, 'herta_audit') ? 1 : 2) * star;
    if (isLegacyUnit(u) && u.id === '1204' && u.ticks % 2 === 0) power += 2 * star;
    if (isLegacyUnit(u) && u.id === '1003') power += 2 * retirements * star;
    if (isLegacyUnit(u) && u.id === '1006') power += star;
    if (isLegacyUnit(u) && u.id === '1103') power += neighbors(index).filter(i => state.board[i] && !consumed.has(state.board[i].uid) && characterById(state.board[i].id).element === '雷').length * star;
    if (hasItem(state, 'gold_coin')) power += 0.3;
    if (c.path === '虚无') {
      power += kafkaBoost;
      if (kafkaBoost) for (const kafka of present.filter(v => v.id === '1005')) effectEvent(state, kafka, 'power', starMultiplier(state, kafka) * (hasDebuff(state, 'kafka_audit') ? 0.5 : 1), 'spin', u.uid, '卡芙卡本次虚无增益');
      if (hasItem(state, 'nihility_wax')) power += 1;
      if (hasEssence(state, 'essence_nihility')) power += 1.5;
    }
    if (hasEssence(state, 'essence_destruction')) power += 1;
    if (c.attack === 'aoe' && hasEssence(state, 'essence_erudition')) power += 1;
    const beforeMultiplierBonus = power - c.power * star - appliedGrowth;
    let baseMultiplier = 1;
    if (isLegacyUnit(u) && u.id === '1008' && state.hp <= state.maxHp / 2) baseMultiplier *= 2;
    if (isLegacyUnit(u) && u.id === '1201' && random(state) < (hasDebuff(state, 'qingque_audit') ? 0.1 : 0.2)) { baseMultiplier *= 4; record(state, '青雀：暗杠！本轮威力变为 4 倍。'); }
    power *= baseMultiplier;
    if (baseMultiplier !== 1) effectEvent(state, u, 'powerMultiplier', baseMultiplier, 'spin', u.uid, `${c.name}本次条件倍率`);
    state.lastSpin.powerBreakdown[index] = { base: rounded(c.power * star), growth: appliedGrowth, beforeMultiplierBonus: rounded(beforeMultiplierBonus), baseMultiplier, flatBonus: 0, multiplier: 1, final: 0 };
    powers[index] = power;
  });

  // Adjacent supports are bounded by board coordinates (never wrap across rows).
  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    let buff = !isLegacyUnit(u) ? 0 : u.id === '1009' ? 0.5 : u.id === '1101' || u.id === '1106' ? 1 : 0;
    buff *= starMultiplier(state, u) * (hasItem(state, 'harmony_wax') ? 1.5 : 1) * utilityMultiplier(state, u, 'buff') * passiveMultiplier(state, 'buffMultiplier', { unit: u, index });
    if (buff) {
      for (const targetIndex of neighbors(index)) {
        const target = state.board[targetIndex];
        if (target && !consumed.has(target.uid) && (u.id !== '1106' || characterById(target.id).element === '冰')) { powers[targetIndex] += buff; passiveMultiplier(state, 'buffMultiplier', { unit: u, index, record: true, targetUid: target.uid }); effectEvent(state, u, 'power', buff, 'spin', target.uid, `${characterById(u.id).name}本次邻接增益`); }
      }
    }
    if (isLegacyUnit(u) && u.id === '1202') {
      const candidates = state.board.map((target, i) => ({ target, i })).filter(({ target, i }) => target && i !== index && !consumed.has(target.uid));
      candidates.sort((a, b) => powers[b.i] - powers[a.i] || a.i - b.i);
      if (candidates.length) { const amount = 2 * starMultiplier(state, u) * (hasItem(state, 'harmony_wax') ? 1.5 : 1) * utilityMultiplier(state, u, 'buff') * passiveMultiplier(state, 'buffMultiplier', { unit: u, index, record: true, targetUid: candidates[0].target.uid }); powers[candidates[0].i] += amount; effectEvent(state, u, 'power', amount, 'spin', candidates[0].target.uid, '停云本次定向增益'); }
    }
  });
  applyPowerEffects(state, effectContext);

  state.board.forEach((u, index) => {
    if (!u || consumed.has(u.uid)) return;
    const c = characterById(u.id);
    let multiplier = effectContext.powerMultipliers[index];
    if (hasItem(state, 'doctor_robe') && u.stars > 1) { multiplier *= 1.2; effectEvent(state, { id: 'doctor_robe', name: '博士之袍' }, 'powerMultiplier', 1.2, 'spin', u.uid, '高星角色本次威力×1.2'); }
    if (hasItem(state, 'broken_clock')) { multiplier *= 1.2; effectEvent(state, { id: 'broken_clock', name: '碎星芳饵' }, 'powerMultiplier', 1.2, 'spin', u.uid, '持有奇物使本次威力×1.2'); }
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
    const enemyMultiplier = unitPowerMultiplier(state, c, u, Boolean(polluted));
    multiplier *= enemyMultiplier;
    if (enemyMultiplier !== 1) effectEvent(state, { id: 'enemy_clauses', name: '当前关敌方条款' }, 'powerMultiplier', enemyMultiplier, 'spin', u.uid, '本关条款对该实例的本次威力修正');
    if (state.overclockReady) { multiplier *= SUPPLIES.overclock.multiplier; effectEvent(state, { id: 'overclock', name: '待用超频' }, 'powerMultiplier', SUPPLIES.overclock.multiplier, 'spin', u.uid, '消耗待用超频，本次威力×1.2'); }
    if (state.enemySkill.id === 'jammer' && state.round % 3 === 0 && index % BOARD_COLUMNS === 2) { multiplier *= 0.5; effectEvent(state, { id: 'jammer', name: '禁锢矩阵' }, 'powerMultiplier', 0.5, 'spin', u.uid, '本关第3次转动中列威力减半'); }
    const preMultiplierPower = powers[index];
    powers[index] = rounded(powers[index] * multiplier);
    const breakdown = state.lastSpin.powerBreakdown[index];
    breakdown.flatBonus = rounded(preMultiplierPower - (breakdown.base + breakdown.growth + breakdown.beforeMultiplierBonus) * breakdown.baseMultiplier);
    breakdown.multiplier = multiplier; breakdown.final = powers[index];
  });
  state.lastSpin.values = powers;
  state.lastSpin.total = rounded(powers.reduce((sum, power) => sum + power, 0));

  state.overclockReady = false;
  effectContext.ignoresArmor ||= ignoresArmor;
  spinModifiers.set(state, effectContext);
  combatAttacks(state, powers, effectContext.ignoresArmor, cell => {
    metrics.kills = (metrics.kills || 0) + 1;
    runEffects(state, 'kill', { ...effectContext, unit: state.board[cell], index: cell });
  });
  state.board.forEach((unit, index) => {
    if (!unit || consumed.has(unit.uid)) return;
    runEffects(state, 'appearance', { ...effectContext, unit, index }, { stage: 'afterAttacks' });
  });
  for (const pending of effectContext.pendingDamageEffects) resolveEffectDamage(state, pending.effect, pending.source, pending.active, effectContext, pending.amount);
  runEffects(state, 'spin', effectContext, { stage: 'afterAttacks' });
  let incoming = state.enemies.filter(e => e.hp > 0).reduce((sum, e) => sum + e.attack, 0);
  const alive = state.enemies.some(e => e.hp > 0);
  if (alive && state.enemySkill.id === 'pressure' && state.round % 3 === 0) incoming += 3;
  if (alive && state.enemySkill.id === 'drain' && state.round % 2 === 0) incoming += 3;
  incoming = rounded(Math.max(0, incoming - Math.min(incoming * .45, incomingReduction + effectContext.incomingReduction)) * Math.max(.4, incomingMultiplier * effectContext.incomingMultiplier));
  state.lastSpin.incoming = incoming;
  const piercing = hasDebuff(state, 'shield_pierce') ? incoming * 0.25 : 0;
  const blocked = Math.min(state.shield, incoming - piercing);
  state.shield = rounded(state.shield - blocked);
  const beforeHp = state.hp;
  state.hp = rounded(Math.max(0, state.hp - incoming + blocked));
  state.resourceStats.shieldBlocked = rounded(state.resourceStats.shieldBlocked + blocked);
  state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + beforeHp - state.hp);
  metrics.blocked = rounded(blocked); metrics.hpLost = rounded(beforeHp - state.hp);
  if (state.hp > 0) runEffects(state, 'retaliation', effectContext, { stage: 'afterRetaliation' });
  record(state, `造成 ${rounded(state.lastSpin.damage)} 伤害；敌方反击 ${incoming}，护盾抵挡 ${rounded(blocked)}。`);
  state.enemyIntent = nextIntent(state);

  const removed = new Set(consumed);
  state.board.forEach(u => { if (u?.status === 'expired') removed.add(u.uid); });
  state.roster = state.roster.filter(u => !removed.has(u.uid));
  state.roster.push(...generated);
  state.stats.destroyed += removed.size;
  if (removed.size) record(state, `${removed.size} 位角色完成委派、被消耗或临时登场结束而退场。`);
  clearMissingPollution(state);
  state.stats.damage = rounded(state.stats.damage + state.lastSpin.damage);
  state.stats.coins = rounded(state.stats.coins + state.lastSpin.coins);
  // A fatal retaliation ends the run; an essence cannot resurrect the train.
  metrics.kills = startingEnemyCount - state.enemies.filter(e => e.hp > 0).length;
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

export function spin(previous) {
  const state = resolveSpin(previous);
  spinModifiers.delete(state);
  return state;
}

export function inspectSpin(previous) {
  const hits = [];
  const state = resolveSpin(previous, hits);
  spinHitObservers.delete(state);
  spinModifiers.delete(state);
  return { state, hits };
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
    runEffects(state, 'acquire', { effectUses: new Set() }, { acquired: { definition: item, sourceType: 'item' } });
  } else {
    const essence = essenceById(id);
    state.essences.push({ id, progress: 0, triggered: false, ...(PERSISTENT_PROGRESS_METRICS.includes(essence.progress?.metric) ? { baseline: cumulativeProgressValue(state, essence.progress.metric) } : {}) });
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
      if (u.commission !== undefined && (!retirementRuleById(u.commission) || retirementRuleById(u.commission).targetId !== u.id || u.stars !== 1 || u.temporary !== undefined || !u.origin)) return false;
      if (u.dispatchRule !== undefined && (!board || u.status !== 'consumed' || !retirementRuleById(u.dispatchRule) || retirementRuleById(u.dispatchRule).targetId !== u.id || u.stars !== 1 || u.temporary !== undefined)) return false;
      if (!board) return u.status === undefined && u.consumptionBonus === undefined && u.dispatchRule === undefined;
      if (u.status !== undefined && !['consumed', 'expired'].includes(u.status)) return false;
      if (u.status === 'consumed' && !(u.temporary > 0) && !u.dispatchRule) return false;
      if (u.status === 'expired' && u.temporary !== 0) return false;
      if (u.temporary === 0 && u.status !== 'expired') return false;
      return u.consumptionBonus === undefined || finite(u.consumptionBonus);
    };
    if (input.roster.some(u => !validUnit(u)) || new Set(input.roster.map(u => u.uid)).size !== input.roster.length) return null;
    if (input.retirementStats !== undefined) {
      const stats = input.retirementStats;
      if (!stats || Object.keys(stats).some(key => !['completed', 'permanent', 'supplied', 'byRule'].includes(key)) || ['completed', 'permanent', 'supplied'].some(key => !Number.isInteger(stats[key]) || !finite(stats[key], 0, 1e9)) || !stats.byRule || typeof stats.byRule !== 'object' || Array.isArray(stats.byRule)) return null;
      for (const [id, entry] of Object.entries(stats.byRule)) {
        if (!retirementRuleById(id) || !entry || Object.keys(entry).some(key => !['completed', 'permanent', 'supplied'].includes(key)) || ['completed', 'permanent', 'supplied'].some(key => !Number.isInteger(entry[key]) || !finite(entry[key], 0, 1e9)) || entry.permanent > entry.completed || entry.completed - entry.permanent > entry.supplied) return null;
      }
      if (['completed', 'permanent', 'supplied'].some(key => Object.values(stats.byRule).reduce((sum, entry) => sum + entry[key], 0) !== stats[key])) return null;
      for (const rule of RETIREMENT_RULES) {
        const pending = input.roster.filter(u => u.commission === rule.id).length;
        const entry = stats.byRule[rule.id];
        if (pending > 1 || pending > (entry?.supplied || 0) - ((entry?.completed || 0) - (entry?.permanent || 0))) return null;
      }
    } else if ([...input.roster, ...input.board.filter(Boolean)].some(u => u.commission || u.dispatchRule)) return null;
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
    if (!Array.isArray(input.essences) || input.essences.some(e => !essenceById(e.id) || !finite(e.progress, 0, essenceById(e.id).target) || typeof e.triggered !== 'boolean' || Object.keys(e).some(key => !['id', 'progress', 'triggered', 'baseline'].includes(key)) || (e.baseline !== undefined && (!PERSISTENT_PROGRESS_METRICS.includes(essenceById(e.id).progress?.metric) || !finite(e.baseline, 0, cumulativeProgressValue(input, essenceById(e.id).progress.metric))))) || new Set(input.essences.map(e => e.id)).size !== input.essences.length) return null;
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
    if (!Array.isArray(last.hits) || last.hits.length > 1024 || last.hits.some(hit => !Number.isInteger(hit.cell) || !finite(hit.cell, 0, 19) || !Number.isInteger(hit.targetCol) || !finite(hit.targetCol, 0, 4) || !finite(hit.amount))) return null;
    if (!Array.isArray(last.events) || last.events.some(event => typeof event !== 'string') || !Array.isArray(input.history) || input.history.length > 1000 || input.history.some(event => typeof event !== 'string')) return null;
    if (last.floor !== undefined && (!Number.isInteger(last.floor) || !finite(last.floor, 1, input.floor))) return null;
    if (last.round !== undefined && (!Number.isInteger(last.round) || !finite(last.round, 0, 100))) return null;
    if (last.effects !== undefined && (!Array.isArray(last.effects) || last.effects.length > 2000 || last.effects.some(effect => !effect || typeof effect !== 'object' || Object.keys(effect).some(key => !['sourceId', 'sourceUid', 'targetUid', 'type', 'label', 'duration', 'amount', 'floor', 'round'].includes(key)) || ['sourceId', 'type', 'label', 'duration'].some(key => typeof effect[key] !== 'string' || effect[key].length > 500) || ['sourceUid', 'targetUid'].some(key => effect[key] !== undefined && (typeof effect[key] !== 'string' || !/^u[1-9]\d*$/.test(effect[key]))) || effect.amount !== undefined && !finite(effect.amount, -1e12) || effect.floor !== undefined && (!Number.isInteger(effect.floor) || !finite(effect.floor, 1, input.floor)) || effect.round !== undefined && (!Number.isInteger(effect.round) || !finite(effect.round, 0, 100))))) return null;
    if (last.powerBreakdown !== undefined) {
      if (!Array.isArray(last.powerBreakdown) || last.powerBreakdown.length !== BOARD_SIZE) return null;
      for (const [index, entry] of last.powerBreakdown.entries()) {
        if (entry === null) continue;
        if (!entry || Object.keys(entry).some(key => !['base', 'growth', 'beforeMultiplierBonus', 'baseMultiplier', 'flatBonus', 'multiplier', 'final'].includes(key))) return null;
        if (['base', 'growth', 'baseMultiplier', 'multiplier', 'final'].some(key => !finite(entry[key])) || ['beforeMultiplierBonus', 'flatBonus'].some(key => !finite(entry[key], -1e12)) || entry.final !== last.values[index]) return null;
      }
    }
    if (!input.stats || ['spins', 'damage', 'coins', 'merges', 'destroyed'].some(key => !finite(input.stats[key]))) return null;
    if ((input.retirementStats?.completed || 0) > input.stats.destroyed) return null;
    // The JSON round trip discards prototype properties and guarantees persistence compatibility.
    const restored = JSON.parse(JSON.stringify(input));
    restored.enemySkill = { ...ENEMY_SKILLS.find(skill => skill.id === restored.enemySkill.id) };
    restored.enemyIntent = { ...restored.enemyIntent, name: restored.enemySkill.name, description: restored.enemySkill.description };
    restored.retirementStats ||= newRetirementStats();
    for (const essence of restored.essences) if (PERSISTENT_PROGRESS_METRICS.includes(essenceById(essence.id).progress?.metric) && essence.baseline === undefined) essence.baseline = cumulativeProgressValue(restored, essenceById(essence.id).progress.metric);
    for (const effect of restored.activeDebuffs) {
      if (effect.id === 'rift_pollution') effect.description = pollutionDescription(effect.targetName);
      else { const definition = enemyDebuffById(effect.id); effect.name = definition.name; effect.description = definition.description; }
    }
    return restored;
  } catch { return null; }
}

export function getSaveStatus(input) {
  if (input?.version === 1 && input.mode === 'classic') return 'legacy-classic';
  if (!validateSave(input)) return 'invalid';
  return input.version === 1 ? 'migrated' : 'valid';
}
