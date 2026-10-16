import { characterById, itemById, essenceById } from './content.js';
import { getArchetypes } from './archetypes.js';

// Data-only effects are interpreted by the engine, never read back from saves.
export const EFFECT_TYPES = Object.freeze(['power', 'powerMultiplier', 'heal', 'shield', 'growth', 'resource', 'retaliationFlat', 'retaliationMultiplier', 'ignoreArmor', 'summon', 'selfDamage', 'maxHp', 'extraSpin', 'healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier', 'rarityMultiplier', 'essenceProgressMultiplier', 'damage', 'consume', 'healOverflowShield']);
export const EFFECT_TRIGGERS = Object.freeze(['appearance', 'spin', 'floor', 'acquire', 'retire', 'kill', 'merge', 'passive', 'retaliation']);
export const PERSISTENT_PROGRESS_METRICS = Object.freeze(['rerolls', 'removals', 'creditsSpent', 'merges']);

export function matchesEffectFilter(unit, filter = {}, source = null) {
  if (!unit) return false;
  const c = characterById(unit.id);
  if (!c) return false;
  if (filter.id !== undefined && unit.id !== filter.id) return false;
  if (filter.ids && !filter.ids.includes(unit.id)) return false;
  if (filter.commission !== undefined && Boolean(unit.commission) !== filter.commission) return false;
  for (const key of ['path', 'element', 'faction', 'attack']) if (filter[key] !== undefined && c[key] !== filter[key]) return false;
  for (const key of ['path', 'element', 'faction', 'attack']) if (filter[`${key}Not`] !== undefined && c[key] === filter[`${key}Not`]) return false;
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
    case 'growth': return unit?.growth || 0;
    case 'round': return state.round;
    case 'floor': return state.floor;
    case 'neighbors': return filtered(adjacentIndexes(index).map(i => state.board[i]).filter(u => u && u.status !== 'consumed' && !consumed.has(u.uid))).length;
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
    case 'sourcePower': return context.powers?.[index] || 0;
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
  if (!effectConditionMet(effect.condition, context) || !(effect.conditions || []).every(c => effectConditionMet(c, context))) return false;
  const counter = context.trigger === 'appearance' ? context.unit?.ticks || 0 : context.state.round;
  if (effect.every && (!(counter > 0) || counter % effect.every !== 0)) return false;
  return true;
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
  if (effect.scaleWithStars) amount *= context.star ?? [0, 1, 3, 9][context.unit?.stars || 1];
  return amount;
}

export function effectTargetIndexes(effect, context) {
  const { state, unit, index, consumed = new Set(), powers = [] } = context;
  let indexes = state.board.map((u, i) => u && u.status !== 'consumed' && !consumed.has(u.uid) ? i : -1).filter(i => i >= 0);
  const target = effect.target || (unit ? 'self' : 'team');
  if (target === 'self') indexes = Number.isInteger(index) ? [index] : [];
  else if (target === 'adjacent') indexes = indexes.filter(i => adjacentIndexes(index).includes(i));
  else if (target === 'column') indexes = indexes.filter(i => i % 5 === index % 5);
  indexes = indexes.filter(i => matchesEffectFilter(state.board[i], effect.filter, unit));
  if (target === 'strongest') {
    if (!effect.includeSource) indexes = indexes.filter(i => state.board[i].uid !== unit?.uid);
    indexes.sort((a, b) => (powers[b] || 0) - (powers[a] || 0) || a - b);
    indexes = indexes.slice(0, 1);
  }
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
  } else if (['spin', 'passive', 'retire'].includes(trigger)) {
    state.board.forEach((u, i) => { if (u && u.status !== 'consumed' && !consumed.has(u.uid)) result.push(source(characterById(u.id), 'character', u, i)); });
  } else if (trigger === 'floor') {
    for (const u of state.roster) if (!u.temporary) result.push(source(characterById(u.id), 'character', u));
  }
  for (const id of state.items) result.push(source(itemById(id), 'item'));
  for (const entry of state.essences) if (entry.triggered) result.push(source(essenceById(entry.id), 'essence'));
  for (const synergy of synergies) result.push({ definition: synergy, sourceType: 'synergy', sourceId: synergy.id, unit: null, index: null, effects: synergy.effects || [] });
  for (const archetype of getArchetypes(state)) if (archetype.effects.length) result.push(source(archetype, 'archetype'));
  return result.filter(entry => entry.effects.length);
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
  for (const archetype of getArchetypes(state)) if (archetype.effects.length) add(archetype, 'archetype');
  return result;
}
