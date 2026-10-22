import { getCharacterAttributes } from './attributes.js';
import { characterById, itemById, essenceById } from './content.js';

// Data-only effects are interpreted by the engine, never read back from saves.
export const EFFECT_TYPES = Object.freeze(['power', 'powerMultiplier', 'heal', 'shield', 'growth', 'resource', 'retaliationFlat', 'retaliationMultiplier', 'ignoreArmor', 'summon', 'selfDamage', 'maxHp', 'extraSpin', 'healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier', 'rarityMultiplier', 'essenceProgressMultiplier', 'damage', 'consume', 'healOverflowShield', 'vulnerability', 'attackPercent', 'damageBonus', 'attackGrowth', 'attackGrowthMultiplier', 'enemyVulnerability', 'synergyDamageMultiplier', 'selfDelete', 'normalAttackGrowth']);
export const EFFECT_TRIGGERS = Object.freeze(['appearance', 'spin', 'floor', 'acquire', 'retire', 'kill', 'merge', 'passive', 'retaliation', 'afterNormalAttack', 'afterEnemyAttack', 'turnEnd', 'clear']);
export const PERSISTENT_PROGRESS_METRICS = Object.freeze(['rerolls', 'removals', 'creditsSpent', 'merges']);

export function matchesEffectFilter(unit, filter = {}, source = null) {
  if (!unit) return false;
  const c = characterById(unit.id);
  if (!c) return false;
  if (filter.id !== undefined && unit.id !== filter.id) return false;
  if (filter.ids && !filter.ids.includes(unit.id)) return false;
  if (filter.group || filter.groupsAny) return false; // Obsolete internal testing labels cannot grant mechanics.
  if (filter.anyOf && !filter.anyOf.some(part => matchesEffectFilter(unit, part, source))) return false;
  if (filter.commission !== undefined && Boolean(unit.commission) !== filter.commission) return false;
  for (const key of ['path', 'element', 'faction', 'attack', 'role']) if (filter[key] !== undefined && c[key] !== filter[key]) return false;
  for (const key of ['path', 'element', 'faction', 'attack', 'role']) if (filter[`${key}Not`] !== undefined && c[key] === filter[`${key}Not`]) return false;
  if (filter.temporary !== undefined && Boolean(unit.temporary || unit.status === 'expired') !== filter.temporary) return false;
  if (filter.starsMin !== undefined && unit.stars < filter.starsMin) return false;
  if (filter.starsMax !== undefined && unit.stars > filter.starsMax) return false;
  if (filter.excludeSelf && unit.uid === source?.uid) return false;
  return true;
}

export function adjacentIndexes(index) {
  if (!Number.isInteger(index) || index < 0 || index >= 20) return [];
  const result = [], row = Math.floor(index / 5), col = index % 5;
  for (let r = Math.max(0, row - 1); r <= Math.min(3, row + 1); r++) for (let c = Math.max(0, col - 1); c <= Math.min(4, col + 1); c++) if (r !== row || c !== col) result.push(r * 5 + c);
  return result;
}

// All spatial domains use the same 5 x 4 board and never wrap across an edge.
export function spatialIndexes(range, index, { includeSelf = true } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= 20) return [];
  const row = Math.floor(index / 5), column = index % 5;
  let indexes = range === 'adjacent' ? adjacentIndexes(index) : Array.from({ length: 20 }, (_, i) => i).filter(i =>
    range === 'self' ? i === index : range === 'row' ? Math.floor(i / 5) === row :
    range === 'column' ? i % 5 === column : range === 'aligned' ? Math.floor(i / 5) === row || i % 5 === column : true);
  return includeSelf ? indexes : indexes.filter(i => i !== index);
}

// Ephemeral diagnostic switches are never serialized or read from a save.
const diagnostics = new WeakMap();
export function setEffectDiagnostics(state, options) { diagnostics.set(state, options); }
export function clearEffectDiagnostics(state) { diagnostics.delete(state); }
function diagnosticSources(state, sources) {
  const options = diagnostics.get(state);
  if (!options) return sources;
  return sources.filter(source => source.sourceType !== 'synergy' || !options.suppressSynergyIds?.includes(source.sourceId)).map(source => {
    if (source.sourceType !== 'character') return source;
    const effects = options.suppressSkillUids?.includes(source.sourceUid) ? [] : source.effects.filter(effect => !options.suppressCharacterEffectTypes?.includes(effect.type));
    return { ...source, effects };
  }).filter(source => source.effects.length);
}

export function effectMetric(metric, context, filter = {}) {
  if (typeof context.metricOverrides === 'function') {
    const overridden = context.metricOverrides(metric, filter);
    if (Number.isFinite(overridden)) return overridden;
  }
  if (context.metricOverrides && typeof context.metricOverrides === 'object' && Number.isFinite(context.metricOverrides[metric])) return context.metricOverrides[metric];
  const { state, unit, index, consumed = new Set(), metrics = {} } = context;
  const present = (state.board || []).filter(u => u && u.status !== 'consumed' && !consumed.has(u.uid));
  const filtered = units => units.filter(u => matchesEffectFilter(u, filter, unit));
  switch (metric) {
    case 'hpRatio': return state.hp / state.maxHp;
    case 'missingHp': return Math.max(0, state.maxHp - state.hp);
    case 'shield': return state.shield;
    case 'coins': return state.coins;
    case 'ticks': return unit?.ticks || 0;
    case 'stars': return unit?.stars || 1;
    case 'growth': case 'attackBonus': return getCharacterAttributes(unit).attackBonus;
    case 'lastTurnDeletions': return state.lastTurnDeletions || 0;
    case 'round': return state.round;
    case 'floor': return state.floor;
    case 'neighbors': return filtered(adjacentIndexes(index).map(i => state.board[i]).filter(u => u && u.status !== 'consumed' && !consumed.has(u.uid))).length;
    case 'row': case 'column': case 'aligned': return filtered(spatialIndexes(metric, index, { includeSelf: false }).map(i => state.board[i]).filter(u => u && u.status !== 'consumed' && !consumed.has(u.uid))).length;
    case 'edge': return Number(Number.isInteger(index) && (index < 5 || index >= 15 || index % 5 === 0 || index % 5 === 4));
    case 'corner': return Number([0, 4, 15, 19].includes(index));
    case 'emptyNeighbors': return adjacentIndexes(index).filter(i => !state.board[i] || state.board[i].status === 'consumed' || consumed.has(state.board[i].uid)).length;
    case 'present': return filtered(present).length;
    case 'presentDistinct': return new Set(filtered(present).map(u => u.id)).size;
    case 'roster': return filtered(state.roster || []).length;
    case 'enemies': return (state.enemies || []).filter(e => e.hp > 0).length;
    case 'emptyColumns': return 5 - (state.enemies || []).filter(e => e.hp > 0).length;
    case 'synergies': return context.synergies?.length ?? metrics.synergies ?? 0;
    case 'retirements': return context.retirements ?? metrics.retirements ?? 0;
    case 'damage': return state.lastSpin?.damage || 0;
    case 'healing': return state.lastSpin?.healing || 0;
    case 'blocked': return metrics.blocked || 0;
    case 'hpLost': return metrics.hpLost || 0;
    case 'sourcePower': return context.powers?.[index] ?? getCharacterAttributes(unit).attack;
    case 'kills': return metrics.kills || 0;
    default: return metrics[metric] || 0;
  }
}

export function effectConditionMet(condition, context) {
  if (!condition) return true;
  const value = effectMetric(condition.metric, context, condition.filter);
  switch (condition.op || 'gte') {
    case 'lte': return value <= condition.value;
    case 'lt': return value < condition.value;
    case 'gt': return value > condition.value;
    case 'eq': return value === condition.value;
    case 'mod': return condition.value > 0 && value > 0 && value % condition.value === 0;
    default: return value >= condition.value;
  }
}

export function effectIsEligible(effect, context) {
  if (!effect || effect.legacy || !EFFECT_TYPES.includes(effect.type)) return false;
  if (context.trigger === 'afterNormalAttack') {
    const event = context.normalAttackEvent;
    if (!event || !matchesEffectFilter(event.unit, effect.eventFilter || {}, context.unit)) return false;
    if (effect.eventRange === 'enemyColumn' && !event.hitColumns.includes(context.index % 5)) return false;
    if (effect.eventRange && effect.eventRange !== 'enemyColumn' && !spatialIndexes(effect.eventRange, context.index).includes(event.index)) return false;
    if (effect.target === 'triggerEnemy' && !context.state.enemies.some(enemy => enemy.col === context.index % 5 && enemy.hp > 0)) return false;
  }
  if (!effectConditionMet(effect.condition, context) || !(effect.conditions || []).every(c => effectConditionMet(c, context))) return false;
  const counter = ['appearance','afterNormalAttack','afterEnemyAttack','turnEnd'].includes(context.trigger) ? context.unit?.ticks || 0 : context.state.round;
  if (effect.every && (!(counter > 0) || counter % effect.every !== 0)) return false;
  return true;
}

export function trainingMultiplier(unit) {
  const definition = characterById(unit?.id);
  return definition?.kitVersion >= 6 && definition.kitVersion < 8 && definition.role !== 'attack' ? 1 + Math.min(12, Math.max(0, unit?.growth || 0)) * 0.08 : 1;
}

export function effectAmount(effect, context) {
  let amount = Number.isFinite(effect.value) ? effect.value : 0;
  if (effect.per) {
    let count = effectMetric(effect.per.metric, context, effect.per.filter);
    if (Number.isFinite(effect.per.divisor) && effect.per.divisor > 0) count /= effect.per.divisor;
    if (effect.per.floor) count = Math.floor(count);
    if (Number.isFinite(effect.per.cap)) count = Math.min(count, effect.per.cap);
    amount *= Math.max(0, count);
  }
  if (effect.scaleWithStars) {
    const stars = context.unit?.stars || 1;
    const standard = [0, 1, 3, 9][stars];
    const actual = context.star ?? standard;
    amount *= effect.starFactors ? effect.starFactors[stars] * actual / standard : actual;
  }
  if (effect.fullRestore) amount = context.state.maxHp;
  if (effect.attackRatio) amount *= effectMetric('sourcePower', context);
  if (effect.scaleWithSourcePower) amount *= effectMetric('sourcePower', context);
  if (effect.scaleWithTraining && effect.type !== 'growth') {
    const training = trainingMultiplier(context.unit);
    if (['powerMultiplier', 'retaliationMultiplier', 'healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier'].includes(effect.type)) amount = Math.max(0.05, 1 + (amount - 1) * training);
    else amount *= training;
  }
  return amount;
}

export function effectTargetIndexes(effect, context) {
  const { state, unit, index, consumed = new Set(), powers = [] } = context;
  let indexes = state.board.map((u, i) => u && u.status !== 'consumed' && !consumed.has(u.uid) ? i : -1).filter(i => i >= 0);
  const target = effect.target || (unit ? 'self' : 'team');
  if (target === 'self') indexes = Number.isInteger(index) ? [index] : [];
  else if (['adjacent', 'row', 'column', 'aligned'].includes(target)) indexes = indexes.filter(i => spatialIndexes(target, index).includes(i));
  if (effect.range) indexes = indexes.filter(i => spatialIndexes(effect.range, index).includes(i));
  indexes = indexes.filter(i => matchesEffectFilter(state.board[i], effect.filter, unit));
  if (target === 'strongest' || effect.selection === 'strongest') {
    if (!effect.includeSource) indexes = indexes.filter(i => state.board[i].uid !== unit?.uid);
    const strength = i => context.selectionAttacks?.[i] ?? getCharacterAttributes(state.board[i]).attack;
    indexes.sort((a, b) => strength(b) - strength(a) || a - b);
    if (target === 'strongest') indexes = indexes.slice(0, 1);
  }
  if (Number.isInteger(effect.targetLimit) && effect.targetLimit > 0) indexes = indexes.slice(0, effect.targetLimit);
  return indexes;
}

const source = (definition, sourceType, unit = null, index = null) => ({ definition, sourceType, sourceId: definition.id, sourceUid: unit?.uid, unit, index, effects: (definition.effects || []).filter(e => !e.legacy) });

// Only content definitions grant mechanics. Save-supplied effect records are
// presentation snapshots and can never create an executable source.
export function getEffectSources(state, { trigger = 'passive', unit = null, index = null, synergies = [], acquired = null, consumed = new Set() } = {}) {
  if (acquired) return [source(acquired.definition, acquired.sourceType)];
  const result = [];
  if (unit) {
    const definition = characterById(unit.id);
    if (definition) result.push(source(definition, 'character', unit, index));
  } else if (['spin', 'passive', 'retire', 'afterNormalAttack', 'afterEnemyAttack', 'retaliation', 'turnEnd', 'clear'].includes(trigger)) {
    state.board.forEach((u, i) => { if (u && u.status !== 'consumed' && !consumed.has(u.uid)) result.push(source(characterById(u.id), 'character', u, i)); });
  } else if (trigger === 'floor') {
    for (const u of state.roster) result.push(source(characterById(u.id), 'character', u));
  }
  for (const id of state.items) result.push(source(itemById(id), 'item'));
  for (const entry of state.essences) if (entry.triggered) result.push(source(essenceById(entry.id), 'essence'));
  for (const synergy of synergies) result.push({ definition: synergy, sourceType: 'synergy', sourceId: synergy.id, unit: null, index: null, effects: synergy.effects || [] });
  return diagnosticSources(state, result.filter(entry => entry.effects.length));
}

export function cumulativeProgressValue(state, metric) {
  if (metric === 'rerolls') return state.resourceStats?.rerollsUsed || 0;
  if (metric === 'removals') return state.resourceStats?.removalsUsed || 0;
  if (metric === 'creditsSpent') return state.resourceStats?.creditsSpent || 0;
  if (metric === 'merges') return state.stats?.merges || 0;
  return 0;
}

// Small shared estimate for AI callers. This never touches the seeded RNG.
export function estimatedEffectContribution(effect, context) {
  if (!effectIsEligible(effect, context)) return 0;
  return effectAmount(effect, context) * (effect.chance ?? 1);
}

// Index static effect definitions only; every mutable run condition is re-evaluated.
const passiveEffectIndex = new WeakMap();
function indexedPassiveEffects(definition, type) {
  const all = definition.effects || [];
  let byType = passiveEffectIndex.get(all);
  if (!byType) {
    byType = new Map();
    for (const effect of all) if (!effect.legacy && effect.trigger === 'passive') {
      if (!byType.has(effect.type)) byType.set(effect.type, []);
      byType.get(effect.type).push(effect);
    }
    passiveEffectIndex.set(all, byType);
  }
  return byType.get(type) || [];
}
export function getPassiveEffectSources(state, type, synergies) {
  const result = [];
  const add = (definition, sourceType, unit = null, index = null) => {
    const effects = indexedPassiveEffects(definition, type);
    if (effects.length) result.push({ definition, sourceType, sourceId:definition.id, sourceUid:unit?.uid, unit, index, effects });
  };
  state.board.forEach((unit,index) => { if (unit && unit.status !== 'consumed') add(characterById(unit.id),'character',unit,index); });
  for (const id of state.items) add(itemById(id),'item');
  for (const entry of state.essences) if (entry.triggered) add(essenceById(entry.id),'essence');
  for (const synergy of synergies) add(synergy,'synergy');
  return diagnosticSources(state, result);
}
