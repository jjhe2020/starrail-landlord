import { getCharacterAttributes } from './attributes.js';
export { getCharacterAttributes } from './attributes.js';
import { getPassiveEffectSources } from './effect-rules.js';
import { CHARACTERS, CREATED_CHARACTERS, ITEMS, ESSENCES, SYNERGIES, characterById, itemById, essenceById } from './content.js';
import { DIFFICULTY, lateDifficultyMultiplier, normalizeDifficulty, difficultyHealthMultiplier } from './difficulty.js';
import { ENEMY_DEBUFFS, enemyDebuffById, hasDebuff, getEligibleDebuffs, publicDebuff, unitPowerMultiplier, utilityMultiplier, abilityEffectAmount, pollutionDescription, previousPollutionDescription, legacyPollutionDescription, isPolluted } from './enemy-effects.js';
import { getEffectSources, effectIsEligible, effectAmount, effectTargetIndexes, matchesEffectFilter, cumulativeProgressValue, PERSISTENT_PROGRESS_METRICS, setEffectDiagnostics, clearEffectDiagnostics } from './effect-rules.js';
import { getSynergiesFor, synergyOffenseScale } from './synergies.js';
import { RETIREMENT_RULES, retirementRuleById, retirementEligibility, newRetirementStats } from './retirements.js';

export const SAVE_VERSION = 3;
export const BOARD_COLUMNS = 5;
export const BOARD_ROWS = 4;
export const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;
export const STAR_MULTIPLIERS = [0, 1, 3, 9];
export const FINAL_FLOOR = 12;
const PHASES = ['ready', 'recruit', 'item', 'essence', 'victory', 'defeat'];
const ENEMY_SKILLS = [
  { id: 'pressure', name: '战意积蓄', description: '每第三次转动，存活敌人的攻击总和额外增加 3。' },
  { id: 'armor', name: '装甲校验', description: '每次命中减少 1 点伤害；无视装甲效果生效时可绕过。' },
  { id: 'jammer', name: '禁锢矩阵', description: '每第三次转动，中间列角色的攻击力降低 50%。' },
  { id: 'drain', name: '能量抽取', description: '每第二次转动，额外造成 3 点可被护盾抵挡的伤害。' },
];
const copy = value => structuredClone(value);
const rounded = value => Math.round(value * 100) / 100;
const spinObservers = new WeakMap();
const observeSpinStage = (state, stage) => { const observer = spinObservers.get(state); if (observer) observer.stage = stage; };
const spinModifiers = new WeakMap();
const attackGrowth = unit => getCharacterAttributes(unit).attackBonus;
const newSpinRecord = (floor = 1, round = 0) => ({ floor, round, total: 0, damage: 0, coins: 0, healing: 0, shield: 0, incoming: 0, events: [], hits: [], effects: [], powerBreakdown: Array(BOARD_SIZE).fill(null), values: Array(BOARD_SIZE).fill(0) });
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
const starMultiplier = (_state, instance) => STAR_MULTIPLIERS[instance.stars];

function effectEvent(state, source, type, amount, duration = 'spin', targetUid = null, label = '') {
  state.lastSpin.effects ||= [];
  if (state.lastSpin.effects.length >= 2000) return;
  const event = { sourceId: source?.sourceId || source?.id || 'system', type, label: label || source?.definition?.name || source?.name || type, duration, floor: state.floor, round: state.round };
  if (source?.sourceUid || source?.uid) event.sourceUid = source.sourceUid || source.uid;
  if (targetUid) event.targetUid = targetUid;
  if (Number.isFinite(amount)) event.amount = rounded(amount);
  state.lastSpin.effects.push(event);
  const observer = spinObservers.get(state);
  if (observer) observer.effects.push({ ...event, stage: observer.stage });
}

function passiveMultiplier(state, type, extras = {}) {
  let multiplier = 1;
  const synergies = getSynergies(state).filter(s => s.active);
  for (const source of getPassiveEffectSources(state, type, synergies)) {
    const context = { state, synergies, ...extras, unit: source.unit || extras.unit, index: source.index ?? extras.index, star: source.unit ? starMultiplier(state, source.unit) : 1, trigger: 'passive' };
    for (const effect of source.effects) {
      if (effect.trigger !== 'passive' || effect.type !== type || !effectIsEligible(effect, context)) continue;
      if (effect.filter && (!extras.unit || !matchesEffectFilter(extras.unit, effect.filter, source.unit))) continue;
      if (source.unit && extras.unit && (effect.target || effect.range) && !effectTargetIndexes(effect, context).some(i => state.board[i]?.uid === extras.unit.uid)) continue;
      const factor = effectAmount(effect, context);
      multiplier += factor - 1;
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
      const deferUtility = effect.attackRatio && ['heal','healOverflowShield','shield'].includes(effect.type) && !context.attacksReady && context.pendingUtilityEffects;
      if (!deferUtility && !effectIsEligible(effect, active)) continue;
      const useKey = `${source.sourceType}:${source.sourceId}:${source.sourceUid || 'global'}:${effect.id || effectIndex}${effect.scope === 'members' ? `:${active.unit?.uid}` : ''}`;
      if (effect.oncePerSpin && context.effectUses?.has(useKey)) continue;
      const eventKey = `${useKey}:${context.normalAttackEvent?.unit?.uid || ''}`;
      if (effect.oncePerTriggerUnit && context.effectUses?.has(eventKey)) continue;
      if (effect.maxTriggersPerSpin && (context.effectCounts?.get(useKey) || 0) >= effect.maxTriggersPerSpin) continue;
      if (Number.isFinite(effect.chance) && random(state) >= effect.chance) continue;
      if (effect.oncePerSpin) context.effectUses?.add(useKey);
      if (effect.oncePerTriggerUnit) context.effectUses?.add(eventKey);
      if (effect.maxTriggersPerSpin) context.effectCounts?.set(useKey, (context.effectCounts.get(useKey) || 0) + 1);
      let amount = effectAmount(effect, active);
      if (source.sourceType === 'character') amount = abilityEffectAmount(state, source.unit, effect, amount);
      if (source.sourceType === 'synergy' && ['power', 'damage'].includes(effect.type)) amount *= synergyOffenseScale(state);
      if (source.sourceType === 'synergy' && effect.type === 'powerMultiplier') amount = 1 + (amount - 1) * synergyOffenseScale(state);
      if (['power','powerMultiplier','attackPercent','damageBonus'].includes(effect.type)) {
        context.pendingPowerEffects?.push({ effect, source, context: active });
        continue;
      }
      if (['heal', 'healOverflowShield', 'shield'].includes(effect.type)) {
        if (effect.attackRatio && !context.attacksReady && context.pendingUtilityEffects) context.pendingUtilityEffects.push({ effect, source, active });
        else resolveUtilityEffect(state, effect, source, active, amount);
      }      else if (['growth','attackGrowth','normalAttackGrowth'].includes(effect.type)) {
        const targetIndexes = effectTargetIndexes(effect, active);
        let targets = targetIndexes.map(i => state.board[i]);
        if (!targets.length && active.unit && (!effect.target || effect.target === 'self')) targets = [active.unit];
        for (const target of targets) {
          const original = state.roster.find(u => u.uid === target.uid);
          if (!original) continue;
          const gained = amount * (hasDebuff(state, 'growth_audit') ? 0.5 : 1) * passiveMultiplier(state, 'attackGrowthMultiplier', { unit: target });
          if (effect.type === 'normalAttackGrowth') {
            original.normalAttackBonus ||= {};
            for (const key of effect.components || ['primary','adjacent','eachTarget']) original.normalAttackBonus[key] = rounded((original.normalAttackBonus[key] || 0) + gained);
            target.normalAttackBonus = { ...original.normalAttackBonus };
          } else { original.attackBonus = rounded(attackGrowth(original) + gained); original.growth = original.attackBonus; target.attackBonus = original.attackBonus; target.growth = original.attackBonus; }
          if (context.metrics) context.metrics.growth = rounded((context.metrics.growth || 0) + gained);
          effectEvent(state, source, effect.type === 'normalAttackGrowth' ? 'normalAttackGrowth' : 'attackGrowth', gained, 'run', target.uid, effect.summary);
        }
      } else if (effect.type === 'vulnerability') {
        context.vulnerabilities ||= [];
        const targetUids = effectTargetIndexes(effect, active).map(i => state.board[i].uid);
        context.vulnerabilities.push({ filter: effect.filter || {}, targetUids, amount, source });
        effectEvent(state, source, 'vulnerability', amount, 'spin', null, effect.summary);
      } else if (effect.type === 'enemyVulnerability') {
        context.enemyVulnerabilities ||= [];
        const targets = effect.target === 'occupiedColumns'
          ? state.enemies.filter(enemy => enemy.hp > 0 && state.board.some((u,i) => u && !context.consumed?.has(u.uid) && i % BOARD_COLUMNS === enemy.col && matchesEffectFilter(u, effect.filter)))
          : [nearestEnemy(state.enemies, Number.isInteger(active.index) ? active.index % BOARD_COLUMNS : 2)].filter(Boolean);
        for (const enemy of targets) context.enemyVulnerabilities.push({ enemyId:enemy.id, amount, attackType:effect.attackType, source });
        effectEvent(state, source, 'enemyVulnerability', amount, 'spin', null, effect.summary);
      } else if (effect.type === 'selfDelete') {
        if (active.unit?.ticks >= (effect.afterAppearances || effect.value)) context.deleting?.add(active.unit.uid);
      } else if (effect.type === 'resource') {
        const field = effect.resource || 'coins';
        if (!['coins', 'rerolls', 'removals'].includes(field)) continue;
        const gain = field === 'coins' ? rounded(Math.max(0, amount)) : Math.floor(Math.max(0, amount));
        state[field] = rounded(state[field] + gain);
        if (field === 'coins') { state.lastSpin.coins = rounded(state.lastSpin.coins + gain); if (!context.duringSpin) state.stats.coins = rounded(state.stats.coins + gain); }
        effectEvent(state, source, field, gain, 'resource', null, effect.summary);
      } else if (effect.type === 'retaliationFlat') context.incomingReduction = (context.incomingReduction || 0) + amount;
      else if (effect.type === 'retaliationMultiplier') context.incomingPercentReduction = (context.incomingPercentReduction || 0) + 1 - amount;
      else if (effect.type === 'ignoreArmor') context.ignoresArmor = true;
      else if (effect.type === 'summon') {
        if (characterById(effect.characterId) && state.roster.length + (context.generated?.length || 0) < 200 && (!effect.rosterLimit || [...state.roster,...(context.generated || [])].filter(u => u.id === effect.characterId).length < effect.rosterLimit)) {
          const reinforcement = unit(state, effect.characterId, { ...(effect.durationAppearances ? { deleteAfterAppearances: effect.durationAppearances } : {}), ...(active.unit ? { origin: active.unit.uid } : {}) });
          if (context.generated) context.generated.push(reinforcement); else state.roster.push(reinforcement);
          effectEvent(state, source, 'summon', 1, 'appearances', reinforcement.uid, effect.summary);
        }
      } else if (effect.type === 'selfDamage') {
        const before = state.hp; state.hp = rounded(Math.max(effect.nonlethal === false ? 0 : 1, state.hp - amount));
        state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + before - state.hp);
        effectEvent(state, source, 'selfDamage', before - state.hp, 'instant', active.unit?.uid, effect.summary);
      } else if (effect.type === 'maxHp') { state.maxHp = rounded(state.maxHp + amount); effectEvent(state, source, 'maxHp', amount, 'run', null, effect.summary); }
      else if (effect.type === 'extraSpin' && !(trigger === 'acquire' && state.pendingFloor)) { const gained = Math.max(0, Math.floor(amount)); state.spinsLeft += gained; state.encounter.deadline += gained; effectEvent(state, source, 'extraSpin', gained, 'encounter', null, effect.summary); }
      else if (effect.type === 'damage') {
        if (context.pendingDamageEffects && !['kill', 'retaliation', 'afterNormalAttack', 'afterEnemyAttack'].includes(trigger) && (options.stage || 'beforeAttacks') === 'beforeAttacks') context.pendingDamageEffects.push({ effect, source, active, amount });
        else resolveEffectDamage(state, effect, source, active, context, amount);
      } else if (effect.type === 'consume' && active.unit) {
        const targetIndex = effectTargetIndexes({ ...effect, target: effect.target || 'adjacent', filter: { ...effect.filter, excludeSelf: true } }, active)[0];
        const target = state.board[targetIndex];
        if (target && context.consumed) { context.consumed.add(target.uid); target.status = 'consumed'; context.retirements = (context.retirements || 0) + 1; context.pendingPowerEffects?.push({ effect: { type: 'power', value: amount, target: 'self', duration: 'spin', summary: effect.summary }, source, context: active }); effectEvent(state, source, 'consume', 1, 'instant', target.uid, effect.summary); }
      }
      if (['retaliationFlat', 'retaliationMultiplier', 'ignoreArmor'].includes(effect.type)) effectEvent(state, source, effect.type, amount, 'spin', active.unit?.uid, effect.summary);
    }
  }
  return context;
}

function resolveUtilityEffect(state, effect, source, active, amount) {
  const isCharacter = source.sourceType === 'character';
  if (effect.type === 'shield') {
    const before = state.shield;
    shield(state, amount * (isCharacter ? utilityMultiplier(state, active.unit, 'shield') : 1), false, active.unit);
    effectEvent(state, source, 'shield', state.shield - before, 'resource', null, effect.summary);
  } else {
    const result = heal(state, amount * (isCharacter ? utilityMultiplier(state, active.unit, 'heal') : 1), false, active.unit);
    effectEvent(state, source, 'heal', result.actual, 'resource', null, effect.summary);
    if (effect.type === 'healOverflowShield' && result.overflow > 0) {
      const before = state.shield; shield(state, result.overflow, false, active.unit);
      effectEvent(state, source, 'shield', state.shield - before, 'resource', null, effect.summary);
    }
  }
}

function resolveEffectDamage(state, effect, source, active, context, amount) {
  if (source.sourceUid && context.consumed?.has(source.sourceUid)) return;
  active = { ...active, powers:context.powers };
  if (effect.target === 'strongest') {
    const candidate = effectTargetIndexes(effect, active)[0];
    if (candidate === undefined) return;
    active.index = candidate; active.unit = state.board[candidate];
  }
  if (effect.per?.metric === 'sourcePower' || effect.scaleWithSourcePower || effect.target === 'strongest') {
    amount = effectAmount(effect, active) * (source.sourceType === 'synergy' ? synergyOffenseScale(state) : 1);
    if (source.sourceType === 'character') amount = abilityEffectAmount(state, source.unit, effect, amount);
  }
  const candidates = state.enemies.filter(e => e.hp > 0 && (!effect.excludeOriginColumn || e.col !== active.index % BOARD_COLUMNS));
  const targets = effect.target === 'team' || effect.target === 'all' ? candidates
    : effect.target === 'triggerEnemy' ? candidates.filter(e => e.col === active.index % BOARD_COLUMNS)
    : [nearestEnemy(candidates, Number.isInteger(active.index) ? active.index % BOARD_COLUMNS : 2)].filter(Boolean);
  if (!targets.length) return;
  const attackType = effect.attackType || (source.sourceType === 'character' || source.sourceType === 'synergy' ? 'followUp' : 'environmental');
  if (attackType === 'followUp') {
    context.metrics ||= {};
    context.metrics.followUpAttacks = (context.metrics.followUpAttacks || 0) + 1;
    state.lastSpin.followUpAttacks = (state.lastSpin.followUpAttacks || 0) + 1;
  }
  context.attackEvents ||= {value:0};
  context.metrics ||= {};
  const eventId = ++context.attackEvents.value;
  const before = state.lastSpin.damage;
  for (const enemy of targets) attackEnemy(state, active.index ?? 0, enemy, amount, Boolean(effect.ignoreArmor || context.ignoresArmor), null, source, active.unit, attackType, eventId);
  effectEvent(state, source, 'damage', state.lastSpin.damage - before, 'instant', null, effect.summary);
}

function applyPowerEffects(state, context) {
  for (const { effect, source, context: savedContext } of context.pendingPowerEffects || []) {
    if (source.sourceUid && context.consumed?.has(source.sourceUid)) continue;
    const active = { ...savedContext, powers:context.powers, consumed:context.consumed, metrics:context.metrics, retirements:context.retirements };
    let amount = effectAmount(effect, active);
    if (source.sourceType === 'character') amount = abilityEffectAmount(state, source.unit, effect, amount);
    if (source.sourceType === 'synergy') amount *= synergyOffenseScale(state);
    for (const index of effectTargetIndexes(effect, active)) {
      const isSupportBuff = source.sourceType === 'character' && source.definition.role === 'amplifier' || ['adjacent','strongest','row','column','aligned'].includes(effect.target);
      const scale = isSupportBuff ? passiveMultiplier(state,'buffMultiplier',{unit:active.unit,record:true,targetUid:state.board[index].uid}) * (source.sourceType === 'character' ? utilityMultiplier(state,active.unit,'buff') : 1) : 1;
      const gain = (effect.type === 'powerMultiplier' ? amount - 1 : amount) * scale * (source.sourceType === 'synergy' && ['damageBonus','powerMultiplier'].includes(effect.type) ? passiveMultiplier(state,'synergyDamageMultiplier',{unit:active.unit}) : 1);
      if (effect.type === 'power') context.powers[index] += gain;
      else if (effect.type === 'attackPercent') context.attackPercents[index] += gain;
      else context.damageBonuses[index].push({ amount:gain, attackType:effect.attackType, source });
      effectEvent(state,source,effect.type,gain,effect.duration || 'spin',state.board[index].uid,effect.summary);
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
  return { uid: `u${state.uidCounter++}`, id, stars: 1, attackBonus: 0, growth: 0, ticks: 0, ...extra };
}

export function getSynergies(state) {
  return getSynergiesFor(state, characterById);
}

function floorSpins(state) {
  return 5 + Math.floor((Math.min(state.floor, 12) - 1) / 4);
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
  const targets = state.roster.filter(instance => instance.stars === 1);
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
  state.activeDebuffs = state.activeDebuffs.filter(effect => effect.id !== 'rift_pollution' || state.roster.some(instance => instance.uid === effect.targetUid && instance.stars === 1));
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
    lastSpin: newSpinRecord(), lastTurnDeletions: 0,
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
  let multiplier = (!fixed ? passiveMultiplier(state, 'healMultiplier', { unit: sourceUnit }) : 1);
  if (!fixed && hasDebuff(state, 'healing_audit')) multiplier *= 0.75;
  const requested = rounded(amount * multiplier);
  const actual = Math.min(state.maxHp - state.hp, requested);
  state.hp = rounded(state.hp + actual);
  state.lastSpin.healing = rounded(state.lastSpin.healing + actual);
  state.resourceStats.healed = rounded(state.resourceStats.healed + actual);
  return { actual, overflow: requested - actual };
}

function shield(state, amount, fixed = false, sourceUnit = null) {
  let multiplier = (!fixed ? passiveMultiplier(state, 'shieldMultiplier', { unit: sourceUnit }) : 1);
  if (!fixed && hasDebuff(state, 'shield_audit')) multiplier *= 0.75;
  const nextShield = rounded(Math.min(state.maxHp * 2, state.shield + amount * multiplier));
  const actual = rounded(nextShield - state.shield);
  state.shield = nextShield;
  state.lastSpin.shield = rounded(state.lastSpin.shield + actual);
  state.resourceStats.shieldGained = rounded(state.resourceStats.shieldGained + actual);
}

function mergeRoster(state) {
  // Every character follows the same merge rules, including created characters.
  for (let stars = 1; stars < 3; stars++) {
    for (const c of [...CHARACTERS,...CREATED_CHARACTERS]) {
      let same = state.roster.filter(u => u.id === c.id && u.stars === stars);
      while (same.length >= 3) {
        const merging = same.slice(0, 3);
        const ids = new Set(merging.map(u => u.uid));
        const merged = unit(state, c.id, {
          stars: stars + 1,
          attackBonus: rounded(merging.reduce((sum,u) => sum + attackGrowth(u),0)),
          growth: rounded(merging.reduce((sum,u) => sum + attackGrowth(u),0)),
          attackPercentBonus: rounded(merging.reduce((sum,u)=>sum+(u.attackPercentBonus || 0),0)),
          normalAttackBonus: Object.fromEntries(['primary','adjacent','eachTarget'].map(key => [key,rounded(merging.reduce((sum,u) => sum + (u.normalAttackBonus?.[key] || 0),0))])),
          ...(merging.some(u => u.deleteAfterAppearances) ? {deleteAfterAppearances:Math.max(...merging.map(u=>u.ticks)) + Math.min(...merging.filter(u=>u.deleteAfterAppearances).map(u=>u.deleteAfterAppearances-u.ticks))} : {}),
          ticks: Math.max(...merging.map(u => u.ticks)),
        });
        state.roster = state.roster.filter(u => !ids.has(u.uid));
        state.roster.push(merged);
        state.stats.merges += 1;
        runEffects(state, 'merge', { unit: merged, effectUses: new Set() });
        const message = `升星：3 位 ${stars} 星${c.name} → ${stars + 1} 星${c.name}。`;
        state.history.push(message);
        state.lastSpin.events.push(message);
        same = state.roster.filter(u => u.id === c.id && u.stars === stars);
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
  const growthScale = (hasDebuff(state, 'growth_audit') ? 0.5 : 1);
  for (const [index, source] of state.board.entries()) {
    if (!source || consumed.has(source.uid)) continue;
    for (const rule of RETIREMENT_RULES.filter(entry => entry.sourceId === source.id)) {
      const nextTick = source.ticks + 1;
      const previous = state.retirementStats.byRule[rule.id];
      const unlocked = state.roster.some(u => u.id === rule.targetId) || previous?.completed > 0;
      if (nextTick % rule.supplyEvery === 0 && unlocked && state.roster.length + generated.length < 200 && ![...state.roster, ...generated].some(u => u.commission === rule.id && !consumed.has(u.uid))) {
        const trainee = unit(state, rule.targetId, { commission: rule.id, origin: source.uid });
        generated.push(trainee);
        const stats = state.retirementStats.byRule[rule.id] ||= { completed: 0, permanent: 0, supplied: 0 };
        stats.supplied += 1; state.retirementStats.supplied += 1;
        effectEvent(state, source, 'commission', 1, 'run', trainee.uid, `${rule.name}：创建角色，下轮起登场，正常计入羁绊`);
      }
      if (nextTick % rule.every !== 0) continue;
      const candidates = neighbors(index).map(i => state.board[i]).filter(target => retirementEligibility(state, source, target, { consumed }).eligible);
      // Prefer generated assignments; among ordinary extras, preserve the most trained.
      candidates.sort((a, b) => attackGrowth(a) - attackGrowth(b) || a.ticks - b.ticks || a.uid.localeCompare(b.uid));
      const target = candidates[0];
      if (!target) continue;
      consumed.add(target.uid); target.status = 'consumed'; target.dispatchRule = rule.id;
      const original = state.roster.find(u => u.uid === source.uid);
      const gained = rule.attackGrowth * growthScale;
      original.attackBonus = rounded(attackGrowth(original) + gained); original.growth = original.attackBonus; source.attackBonus = original.attackBonus; source.growth = original.attackBonus;
      source.consumptionBonus = (source.consumptionBonus || 0) + rule.power;
      state.coins = rounded(state.coins + rule.coins); state.lastSpin.coins = rounded(state.lastSpin.coins + rule.coins);
      const stats = state.retirementStats.byRule[rule.id] ||= { completed: 0, permanent: 0, supplied: 0 };
      stats.completed += 1; state.retirementStats.completed += 1;
      if (!target.commission) { stats.permanent += 1; state.retirementStats.permanent += 1; metrics.permanentRetirements = (metrics.permanentRetirements || 0) + 1; }
      metrics.growth = rounded((metrics.growth || 0) + gained); count += 1;
      effectEvent(state, source, 'retirement', 1, 'run', target.uid, `${rule.name}：${rule.targetName}完成委派并永久离队（非死亡）`);
      effectEvent(state, source, 'attackGrowth', gained, 'run', source.uid, `${rule.name}永久攻击力`);
      effectEvent(state, source, 'power', rule.power, 'spin', source.uid, `${rule.name}本次攻击力`);
      effectEvent(state, source, 'coins', rule.coins, 'resource', null, `${rule.name}结案报酬`);
      record(state, `${sourceName(source)}：额外一星${rule.targetName}完成「${rule.name}」并永久离队，永久攻击力+${rounded(gained)}、信用点+${rule.coins}。`);
    }
  }
  return count;
}

const sourceName = source => characterById(source.id).name;

function weightedChoice(state, pool, phase = 'recruit') {
  const floorBoost = Math.min(2.5, 1 + state.floor * 0.09);
  const weights = { common: 52, uncommon: 30, rare: 15 * floorBoost, legendary: 3 * floorBoost };
  if (phase === 'recruit') for (const source of getEffectSources(state, { trigger: 'passive' })) for (const effect of source.effects) {
    if (effect.trigger !== 'passive' || effect.type !== 'rarityMultiplier' || !effectIsEligible(effect, { state, trigger: 'passive' })) continue;
    for (const rarity of Array.isArray(effect.rarity) ? effect.rarity : [effect.rarity]) if (Object.hasOwn(weights,rarity)) weights[rarity] *= effectAmount(effect,{state});
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
  runEffects(state, 'clear', { effectUses:new Set() });
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
  const progressValues = { damage: state.lastSpin.damage, spins: 1, single: metrics.single, aoe: metrics.aoe, nihility: metrics.nihility, synergies: metrics.synergies, shield: state.lastSpin.shield, healing: state.lastSpin.healing, growth: metrics.growth || 0, attackGrowth:metrics.growth || 0, followUpAttacks:metrics.followUpAttacks || 0, retirements: metrics.retirements || 0, kills: metrics.kills || 0, credits: state.lastSpin.coins };
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
    runEffects(state, 'acquire', { metrics, effectUses: new Set() }, { acquired: { definition: data, sourceType: 'essence' } });
  }
}

// Exported for inspection/testing as well as combat preview. A tie selects the left column.
export function nearestEnemy(enemies, col) {
  return enemies.filter(e => e.hp > 0).sort((a, b) => Math.abs(a.col - col) - Math.abs(b.col - col) || a.col - b.col)[0] || null;
}

function attackEnemy(state, cell, enemy, amount, ignoresArmor, onKill = null, effectSource = null, actingUnit = null, attackType = 'normal', eventId = 0) {
  if (!enemy || enemy.hp <= 0) return false;
  const armor = state.enemySkill.id === 'armor' && !ignoresArmor ? 1 : 0;
  const attacker = effectSource ? actingUnit : state.board[cell];
  const modifiers = spinModifiers.get(state);
  const characterAttack = attacker && attackType !== 'environmental';
  const outgoing = characterAttack ? (modifiers?.damageBonuses[cell] || []).filter(entry => !entry.attackType || entry.attackType === attackType).reduce((sum,entry) => sum + entry.amount,0) : 0;
  const sourceVulnerability = characterAttack ? (modifiers?.vulnerabilities || []).filter(entry => entry.targetUids.includes(attacker.uid) && matchesEffectFilter(attacker,entry.filter)).reduce((sum,entry)=>sum+entry.amount,0) : 0;
  const enemyVulnerability = (modifiers?.enemyVulnerabilities || []).filter(entry=>entry.enemyId===enemy.id && (!entry.attackType || entry.attackType===attackType)).reduce((sum,entry)=>sum+entry.amount,0);
  const clause = characterAttack ? modifiers?.damageClauseMultipliers[cell] ?? 1 : 1;
  const damage = rounded(Math.min(enemy.hp,Math.max(0,amount * (1+outgoing) * (1+Math.min(.75,sourceVulnerability+enemyVulnerability)) * clause - armor)));
  enemy.hp = rounded(Math.max(0,enemy.hp-damage));
  state.lastSpin.damage = rounded(state.lastSpin.damage+damage);
  const sourceId = effectSource?.sourceId || effectSource?.id || attacker?.id || 'system';
  const sourceUid = effectSource ? effectSource.sourceUid || effectSource.uid : attacker?.uid;
  const hit = {cell,targetCol:enemy.col,amount:damage,attackType,eventId,sourceId,...(sourceUid?{sourceUid}:{})};
  state.lastSpin.hits.push(hit);
  const observer = spinObservers.get(state);
  if (observer) observer.hits.push({...hit,kind:effectSource?'effect':'attack',sourceType:effectSource?.sourceType || 'character',stage:observer.stage});
  if (enemy.hp === 0) onKill?.(cell,enemy);
  return enemy.hp === 0;
}

function combatAttacks(state, context, onKill = null) {
  state.board.forEach((u,cell)=>{
    if (!u || context.consumed.has(u.uid)) return;
    const primary = nearestEnemy(state.enemies,cell % BOARD_COLUMNS);
    if (!primary) return;
    const attack = getCharacterAttributes(u).normalAttack;
    const eventId = ++context.attackEvents.value;
    const hits = [];
    const targets = attack.pattern === 'aoe' ? state.enemies.filter(e=>e.hp>0).map(enemy=>({enemy,coefficient:attack.eachTarget}))
      : [{enemy:primary,coefficient:attack.primary},...(attack.pattern === 'blast' ? state.enemies.filter(e=>e.hp>0 && Math.abs(e.col-primary.col)===1).map(enemy=>({enemy,coefficient:attack.adjacent})) : [])];
    for (const {enemy,coefficient} of targets) if (enemy.hp>0) {
      hits.push(enemy.col);
      attackEnemy(state,cell,enemy,context.powers[cell]*coefficient,context.ignoresArmor,onKill,null,null,'normal',eventId);
    }
    if (hits.length) runEffects(state,'afterNormalAttack',{...context,normalAttackEvent:{unit:u,index:cell,hitColumns:hits,eventId}});
  });
}

function resolveSpin(previous, observer = null, diagnosticOptions = null) {
  if (previous?.phase !== 'ready') return previous;
  const state = copy(previous);
  for (const u of state.roster) { u.attackBonus ??= u.growth || 0; u.growth = u.attackBonus; }
  if (observer) { observer.stage = 'beforeAttacks'; spinObservers.set(state, observer); }
  if (diagnosticOptions) setEffectDiagnostics(state, diagnosticOptions);
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
  if (diagnosticOptions?.layoutUids) {
    const layout = diagnosticOptions.layoutUids, ids = layout.filter(uid => uid !== null);
    if (layout.length !== BOARD_SIZE || new Set(ids).size !== ids.length || ids.some(uid => !state.roster.some(u => u.uid === uid))) throw new RangeError('Diagnostic layout must contain 20 slots and unique permanent roster UIDs or null');
    state.board = layout.map(uid => uid === null ? null : copy(state.roster.find(u => u.uid === uid)));
  }
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
  const consumed = new Set(), generated = [], deleting = new Set();
  const metrics = { single:0,aoe:0,nihility:0,synergies:synergies.length,followUpAttacks:0 };
  const startingEnemyCount = state.enemies.filter(e=>e.hp>0).length;
  const selectionAttacks = state.board.map(u=>u ? getCharacterAttributes(u).attack : 0);
  const retirements = resolveCommissions(state,consumed,generated,metrics);
  const effectContext = { synergies,powers,selectionAttacks,attackPercents:Array(BOARD_SIZE).fill(0),damageBonuses:Array.from({length:BOARD_SIZE},()=>[]),damageClauseMultipliers:Array(BOARD_SIZE).fill(1),pendingPowerEffects:[],pendingDamageEffects:[],pendingUtilityEffects:[],consumed,generated,deleting,metrics,retirements,incomingReduction:0,incomingPercentReduction:0,ignoresArmor:false,effectUses:new Set(),effectCounts:new Map(),attackEvents:{value:0},vulnerabilities:[],enemyVulnerabilities:[],duringSpin:true };
  state.board.forEach((u,index)=>{
    if (!u || consumed.has(u.uid)) return;
    const original = state.roster.find(r=>r.uid===u.uid);
    original.ticks += 1;
    original.attackBonus = attackGrowth(original); original.growth = original.attackBonus;
    Object.assign(u,{ticks:original.ticks,attackBonus:original.attackBonus,growth:original.attackBonus});
    effectContext.unit=u; effectContext.index=index;
    runEffects(state,'appearance',effectContext);
  });
  delete effectContext.unit; delete effectContext.index;
  metrics.retirements = retirements;
  runEffects(state,'spin',effectContext);
  runEffects(state,'passive',effectContext);
  state.board.forEach((u,index)=>{
    if (!u || consumed.has(u.uid)) return;
    const attrs = getCharacterAttributes(u);
    const starPenalty = u.stars > 1 && hasDebuff(state,'star_audit') ? .8 : 1;
    powers[index] = attrs.starAttack * starPenalty + attrs.attackBonus + (u.consumptionBonus || 0);
    state.lastSpin.powerBreakdown[index] = {base:attrs.baseAttack,star:attrs.starAttack*starPenalty,permanent:attrs.attackBonus,permanentPercent:attrs.permanentPercent,attackPenalty:1,growth:attrs.attackBonus,beforeMultiplierBonus:0,baseMultiplier:1,flatBonus:u.consumptionBonus || 0,attackPercent:0,damageBonus:0,multiplier:1,final:0,normalAttack:attrs.normalAttack};
  });
  applyPowerEffects(state,effectContext);
  state.board.forEach((u,index)=>{
    if (!u || consumed.has(u.uid)) return;
    const c = characterById(u.id), breakdown = state.lastSpin.powerBreakdown[index];
    if (c.attack==='single') metrics.single++;
    if (c.attack==='aoe') metrics.aoe++;
    if (c.path==='虚无') metrics.nihility++;
    if (state.overclockReady) effectContext.damageBonuses[index].push({amount:SUPPLIES.overclock.multiplier-1});
    let clause = unitPowerMultiplier(state,c,u,Boolean(polluted));
    breakdown.attackPenalty = state.enemySkill.id==='jammer' && state.round%3===0 && index%BOARD_COLUMNS===2 ? .5 : 1;
    effectContext.damageClauseMultipliers[index] = clause;
    breakdown.flatBonus = rounded(powers[index] - (breakdown.star + breakdown.permanent));
    breakdown.attackPercent = effectContext.attackPercents[index];
    breakdown.damageBonus = effectContext.damageBonuses[index].filter(e=>!e.attackType).reduce((sum,e)=>sum+e.amount,0);
    breakdown.multiplier = 1+breakdown.permanentPercent+breakdown.attackPercent;
    powers[index] = rounded(powers[index]*breakdown.multiplier*breakdown.attackPenalty);
    breakdown.final = powers[index];
  });
  effectContext.attacksReady = true;
  for (const {effect,source,active} of effectContext.pendingUtilityEffects) {
    const current = {...active,powers};
    if (effectIsEligible(effect,current)) resolveUtilityEffect(state,effect,source,current,effectAmount(effect,current));
  }
  state.lastSpin.values = powers;
  state.lastSpin.total = rounded(powers.reduce((sum,power)=>sum+power,0));
  state.overclockReady = false;
  spinModifiers.set(state,effectContext);
  observeSpinStage(state,'attack');
  combatAttacks(state,effectContext,cell=>{
    metrics.kills = (metrics.kills || 0)+1;
    runEffects(state,'kill',{...effectContext,unit:state.board[cell],index:cell});
  });
  observeSpinStage(state, 'afterAttacks');
  state.board.forEach((unit, index) => {
    if (!unit || consumed.has(unit.uid)) return;
    runEffects(state, 'appearance', { ...effectContext, unit, index }, { stage: 'afterAttacks' });
  });
  for (const pending of effectContext.pendingDamageEffects) resolveEffectDamage(state, pending.effect, pending.source, pending.active, effectContext, pending.amount);
  runEffects(state, 'spin', effectContext, { stage: 'afterAttacks' });
  observeSpinStage(state, 'retaliation');
  let incoming = state.enemies.filter(e => e.hp > 0).reduce((sum, e) => sum + e.attack, 0);
  const alive = state.enemies.some(e => e.hp > 0);
  if (alive && state.enemySkill.id === 'pressure' && state.round % 3 === 0) incoming += 3;
  if (alive && state.enemySkill.id === 'drain' && state.round % 2 === 0) incoming += 3;
  const beforeEnemyShield = state.shield;
  const enemyAttacked = alive && incoming > 0;
  incoming = rounded(incoming * (1-Math.min(.6,effectContext.incomingPercentReduction)));
  incoming = rounded(Math.max(0,incoming-Math.min(incoming*.45,effectContext.incomingReduction)));
  state.lastSpin.incoming = incoming;
  const piercing = hasDebuff(state, 'shield_pierce') ? incoming * 0.25 : 0;
  const blocked = Math.min(state.shield, incoming - piercing);
  state.shield = rounded(state.shield - blocked);
  const beforeHp = state.hp;
  state.hp = rounded(Math.max(0, state.hp - incoming + blocked));
  state.resourceStats.shieldBlocked = rounded(state.resourceStats.shieldBlocked + blocked);
  state.resourceStats.hpLost = rounded(state.resourceStats.hpLost + beforeHp - state.hp);
  metrics.blocked = rounded(blocked); metrics.hpLost = rounded(beforeHp - state.hp);
  observeSpinStage(state, 'afterRetaliation');
  if (state.hp > 0 && enemyAttacked) {
    runEffects(state,'afterEnemyAttack',{...effectContext,metricOverrides:{shield:beforeEnemyShield}},{stage:'afterEnemyAttack'});
    runEffects(state,'retaliation',effectContext,{stage:'afterRetaliation'});
  }
  record(state, `造成 ${rounded(state.lastSpin.damage)} 伤害；敌方造成伤害 ${incoming}，护盾抵挡 ${rounded(blocked)}。`);
  state.enemyIntent = nextIntent(state);

  runEffects(state,'turnEnd',effectContext);
  for (const u of state.board.filter(Boolean)) if (u.deleteAfterAppearances && u.ticks >= u.deleteAfterAppearances) deleting.add(u.uid);
  const removed = new Set([...consumed,...deleting]);
  state.board.forEach(u => { if (u && deleting.has(u.uid)) u.status = 'expired'; });
  state.lastTurnDeletions = removed.size;
  effectContext.retirements = removed.size; metrics.retirements = removed.size;
  if (removed.size && state.hp > 0) {
    runEffects(state,'retire',effectContext);
    const queued = effectContext.pendingDamageEffects.splice(0);
    for (const pending of queued) if (pending.active.trigger === 'retire') resolveEffectDamage(state,pending.effect,pending.source,pending.active,effectContext,pending.amount);
  }
  state.roster = state.roster.filter(u => !removed.has(u.uid));
  state.roster.push(...generated);
  if (generated.length) mergeRoster(state);
  state.stats.destroyed += removed.size;
  if (removed.size) record(state, `${removed.size} 位角色完成委派、被消耗或自身技能到期而退场。`);
  clearMissingPollution(state);
  state.stats.damage = rounded(state.stats.damage + state.lastSpin.damage);
  state.stats.coins = rounded(state.stats.coins + state.lastSpin.coins);
  // A fatal retaliation ends the run; an essence cannot resurrect the train.
  metrics.kills = startingEnemyCount - state.enemies.filter(e => e.hp > 0).length;
  metrics.retirements = removed.size;
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
    observeSpinStage(state, 'arrival');
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

export function inspectSpin(previous, options = undefined) {
  const observer = { hits: [], effects: [], stage: 'beforeAttacks' };
  const state = resolveSpin(previous, observer, options);
  clearEffectDiagnostics(state);
  spinObservers.delete(state);
  spinModifiers.delete(state);
  return { state, hits: observer.hits, effects: observer.effects, ...(options ? { diagnostics: { protocol: 'spin-interventions-v1' } } : {}) };
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
      input.version = 2;
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
    if (input?.version === 2 && input.mode === 'combat') {
      input = copy(input);
      input.version = SAVE_VERSION;
      input.migratedFromVersion ||= 2;
      input.lastTurnDeletions = 0;
      for (const [u,board] of [...(input.roster || []).map(u=>[u,false]),...(input.board || []).filter(Boolean).map(u=>[u,true])]) {
        if (!finite(u.growth)) return null;
        u.attackBonus = u.growth;
        if (u.temporary !== undefined) {
          if (!Number.isInteger(u.temporary) || !finite(u.temporary,board?0:1,3)) return null;
          u.deleteAfterAppearances = u.ticks + u.temporary;
          delete u.temporary;
        }
      }
      for (const essence of input.essences || []) if (essence.id === 'essence_elation_wax') {
        if (!finite(essence.progress,0,4)) return null;
        essence.progress = essence.triggered ? 12 : essence.progress * 3;
        delete essence.baseline;
      }
    }
    if (!input || typeof input !== 'object' || input.version !== SAVE_VERSION) return null;
    if (input.mode !== 'combat' || !PHASES.includes(input.phase)) return null;
    if (!Number.isInteger(input.difficulty) || !finite(input.difficulty, 1, 20)) return null;
    if (!input.resourceAccess || Object.keys(DEFAULT_RESOURCE_ACCESS).some(key => typeof input.resourceAccess[key] !== 'boolean')) return null;
    if (!input.resourceStats || Object.keys(newResourceStats()).some(key => !finite(input.resourceStats[key]))) return null;
    if (!Number.isInteger(input.supplyPurchases) || !finite(input.supplyPurchases, 0, 2) || typeof input.overclockReady !== 'boolean') return null;
    if (!Array.isArray(input.activeDebuffs) || input.activeDebuffs.length > ENEMY_DEBUFFS.length || new Set(input.activeDebuffs.map(effect => effect?.id)).size !== input.activeDebuffs.length || input.activeDebuffs.some(effect => !effect || !enemyDebuffById(effect.id) || typeof effect.name !== 'string' || typeof effect.description !== 'string' || !['boss', 'difficulty'].includes(effect.source) || !Number.isInteger(effect.addedRound) || !finite(effect.addedRound, 0, input.round))) return null;
    if (!Number.isInteger(input.bossStage) || !finite(input.bossStage, 0, 3) || !input.bossStages || input.bossStages.maxStages !== 3 || JSON.stringify(input.bossStages.healthThresholds) !== '[0.7,0.35]' || JSON.stringify(input.bossStages.roundThresholds) !== '[3,5]') return null;
    if (input.migratedFromVersion !== undefined && ![1,2].includes(input.migratedFromVersion)) return null;
    if (typeof input.seed !== 'string' || input.seed.length > 200) return null;
    const integers = ['rngState', 'uidCounter', 'floor', 'round', 'spinsLeft', 'rerolls', 'removals'];
    if (integers.some(key => !Number.isInteger(input[key]) || !finite(input[key], key === 'rngState' || key === 'uidCounter' || key === 'floor' ? 1 : 0, key === 'rngState' ? 4294967295 : 1000000))) return null;
    if (!finite(input.coins) || !finite(input.maxHp, 1) || !finite(input.hp, 0, input.maxHp) || !finite(input.shield, 0, input.maxHp * 2)) return null;
    if (typeof input.endless !== 'boolean' || typeof input.pendingFloor !== 'boolean') return null;
    if ((!input.endless && input.floor > FINAL_FLOOR) || (input.endless && input.floor <= FINAL_FLOOR)) return null;
    if (!Array.isArray(input.roster) || input.roster.length > 200 || !Array.isArray(input.board) || input.board.length !== BOARD_SIZE) return null;
    const validUnit = (u, board = false) => {
      if (!u || typeof u.uid !== 'string' || !/^u[1-9]\d*$/.test(u.uid) || typeof u.id !== 'string' || !characterById(u.id)) return false;
      if (!Number.isInteger(u.stars) || !finite(u.stars,1,3) || !finite(u.growth) || !finite(u.attackBonus) || !Number.isInteger(u.ticks) || !finite(u.ticks)) return false;
      if (u.attackPercentBonus !== undefined && !finite(u.attackPercentBonus)) return false;
      if (u.normalAttackBonus !== undefined && (!u.normalAttackBonus || typeof u.normalAttackBonus !== 'object' || Object.keys(u.normalAttackBonus).some(key=>!['primary','adjacent','eachTarget'].includes(key) || !finite(u.normalAttackBonus[key])))) return false;
      if (u.deleteAfterAppearances !== undefined && (!Number.isInteger(u.deleteAfterAppearances) || !finite(u.deleteAfterAppearances,0,1000000))) return false;
      if (u.origin !== undefined && (typeof u.origin !== 'string' || !/^u[1-9]\d*$/.test(u.origin))) return false;
      if (u.temporary !== undefined) return false;
      if (u.commission !== undefined && (!retirementRuleById(u.commission) || retirementRuleById(u.commission).targetId !== u.id || !u.origin)) return false;
      if (u.dispatchRule !== undefined && (!board || u.status !== 'consumed' || !retirementRuleById(u.dispatchRule) || retirementRuleById(u.dispatchRule).targetId !== u.id || u.stars !== 1 || u.temporary !== undefined)) return false;
      if (!board) return u.status === undefined && u.consumptionBonus === undefined && u.dispatchRule === undefined;
      if (u.status !== undefined && !['consumed', 'expired'].includes(u.status)) return false;
      if (u.status === 'expired' && !(u.deleteAfterAppearances !== undefined && u.ticks >= u.deleteAfterAppearances) && !characterById(u.id).effects?.some(effect=>effect.type==='selfDelete' && u.ticks >= effect.afterAppearances)) return false;
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
        if (pending > (entry?.supplied || 0)) return null;
      }
    } else if ([...input.roster, ...input.board.filter(Boolean)].some(u => u.commission || u.dispatchRule)) return null;
    for (const effect of input.activeDebuffs) {
      if (effect.id !== 'rift_pollution') {
        if (effect.targetUid !== undefined || effect.targetId !== undefined || effect.targetName !== undefined) return null;
        continue;
      }
      const target = input.roster.find(instance => instance.uid === effect.targetUid);
      if (Object.keys(effect).some(key => !['id', 'name', 'description', 'source', 'addedRound', 'targetUid', 'targetId', 'targetName'].includes(key))) return null;
      if (typeof effect.targetUid !== 'string' || !/^u[1-9]\d*$/.test(effect.targetUid) || !target || target.temporary || target.stars !== 1 || effect.targetId !== target.id || effect.targetName !== characterById(target.id).name || effect.source !== 'difficulty' || effect.addedRound !== 0 || effect.name !== enemyDebuffById('rift_pollution').name || ![pollutionDescription(effect.targetName), previousPollutionDescription(effect.targetName), legacyPollutionDescription(effect.targetName)].includes(effect.description)) return null;
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
    if (last.followUpAttacks !== undefined && (!Number.isInteger(last.followUpAttacks) || !finite(last.followUpAttacks,0,2000))) return null;
    if (last.powerBreakdown !== undefined) {
      if (!Array.isArray(last.powerBreakdown) || last.powerBreakdown.length !== BOARD_SIZE) return null;
      for (const [index, entry] of last.powerBreakdown.entries()) {
        if (entry === null) continue;
        if (!entry || Object.keys(entry).some(key => !['base','growth','beforeMultiplierBonus','baseMultiplier','flatBonus','multiplier','final','star','permanent','attackPercent','damageBonus','normalAttack','permanentPercent','attackPenalty'].includes(key))) return null;
        if (['star','permanent','attackPercent','permanentPercent','attackPenalty'].some(key=>entry[key]!==undefined && !finite(entry[key])) || entry.damageBonus!==undefined && !finite(entry.damageBonus,-1)) return null;
        if (entry.normalAttack !== undefined && (!['single','blast','aoe'].includes(entry.normalAttack?.pattern) || ['primary','adjacent','eachTarget'].some(key=>!finite(entry.normalAttack[key])))) return null;
        if (['base', 'growth', 'baseMultiplier', 'multiplier', 'final'].some(key => !finite(entry[key])) || ['beforeMultiplierBonus', 'flatBonus'].some(key => !finite(entry[key], -1e12)) || entry.final !== last.values[index]) return null;
      }
    }
    if (!Number.isInteger(input.lastTurnDeletions) || !finite(input.lastTurnDeletions,0,200)) return null;
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
  return input.version < SAVE_VERSION ? 'migrated' : 'valid';
}
