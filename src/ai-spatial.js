import { characterById } from './content.js';
import { adjacentIndexes, matchesEffectFilter, effectAmount, effectIsEligible } from './effect-rules.js';

// Public-information forecasts average the twenty possible future source cells.
// Empty cells are failures in the same without-replacement population as units;
// an undersized roster therefore does not magically fill every adjacent cell.
export const SPATIAL_METRICS = Object.freeze(['neighbors', 'row', 'column', 'aligned', 'edge', 'corner', 'emptyNeighbors']);
const clamp = value => Math.max(0, Math.min(1, value));
const combinations = new Map();
const choose = (population, draws) => {
  if (draws < 0 || draws > population) return 0;
  const count = Math.min(draws, population - draws), key = population * 256 + count;
  if (combinations.has(key)) return combinations.get(key);
  let value = 1;
  for (let i = 1; i <= count; i++) value *= (population - i + 1) / i;
  combinations.set(key, value);
  return value;
};
const hypergeometric = (population, successes, draws, count) => choose(successes, count) * choose(population - successes, draws - count) / choose(population, draws);
export const conditionMatches = (value, condition) => condition.op === 'lte' ? value <= condition.value : condition.op === 'lt' ? value < condition.value : condition.op === 'gt' ? value > condition.value : condition.op === 'eq' ? value === condition.value : condition.op === 'mod' ? condition.value > 0 && value > 0 && value % condition.value === 0 : value >= condition.value;

function slotCount(metric, index) {
  if (metric === 'neighbors' || metric === 'adjacent' || metric === 'emptyNeighbors') return adjacentIndexes(index).length;
  if (metric === 'row') return 4;
  if (metric === 'column') return 3;
  if (metric === 'aligned') return 7;
  return 19;
}
const slotCases = metric => metric === 'neighbors' || metric === 'adjacent' || metric === 'emptyNeighbors' ? [[3, 0.2], [5, 0.5], [8, 0.3]] : [[slotCount(metric, 0), 1]];

export function spatialMetricDistribution(state, source, metric, filter = {}) {
  const distribution = new Map();
  if (!source) return new Map([[0, 1]]);
  const others = (state.roster || []).filter(unit => unit.uid !== source.uid);
  const population = Math.max(19, others.length);
  const successes = metric === 'emptyNeighbors' ? Math.max(0, 19 - others.length) : others.filter(unit => matchesEffectFilter(unit, filter, source)).length;
  if (metric === 'edge') return new Map([[0, 0.3], [1, 0.7]]);
  if (metric === 'corner') return new Map([[0, 0.8], [1, 0.2]]);
  for (const [draws, weight] of slotCases(metric)) {
    for (let count = Math.max(0, draws - population + successes); count <= Math.min(draws, successes); count++) {
      const mass = hypergeometric(population, successes, draws, count) * weight;
      if (mass) distribution.set(count, (distribution.get(count) || 0) + mass);
    }
  }
  return distribution;
}

export function spatialMetricMean(state, source, metric, filter) {
  return [...spatialMetricDistribution(state, source, metric, filter)].reduce((sum, [value, mass]) => sum + value * mass, 0);
}

export function spatialConditionProbability(state, source, condition) {
  return [...spatialMetricDistribution(state, source, condition.metric, condition.filter)].reduce((sum, [value, mass]) => sum + (conditionMatches(value, condition) ? mass : 0), 0);
}

export function expectedEffectAmountForAi(effect, context) {
  const spatialConditions = [effect.condition, ...(effect.conditions || [])].filter(condition => condition && SPATIAL_METRICS.includes(condition.metric));
  const local = { ...effect, condition: SPATIAL_METRICS.includes(effect.condition?.metric) ? undefined : effect.condition, conditions: (effect.conditions || []).filter(condition => !SPATIAL_METRICS.includes(condition.metric)) };
  if (!effectIsEligible(local, context)) return 0;
  const metric = SPATIAL_METRICS.includes(effect.per?.metric) ? effect.per.metric : null;
  const sameMetric = condition => condition.metric === metric && JSON.stringify(condition.filter || {}) === JSON.stringify(effect.per?.filter || {});
  const otherWeight = spatialConditions.filter(condition => !sameMetric(condition)).reduce((weight, condition) => weight * spatialConditionProbability(context.state, context.unit, condition), 1);
  if (!metric) return effectAmount(local, context) * otherWeight;
  const previousOverrides = context.metricOverrides;
  let amount = 0;
  for (const [value, mass] of spatialMetricDistribution(context.state, context.unit, metric, effect.per?.filter)) {
    if (!spatialConditions.filter(sameMetric).every(condition => conditionMatches(value, condition))) continue;
    amount += mass * effectAmount(local, { ...context, metricOverrides: (key, filter) => key === metric && JSON.stringify(filter || {}) === JSON.stringify(effect.per?.filter || {}) ? value : typeof previousOverrides === 'function' ? previousOverrides(key, filter) : previousOverrides?.[key] });
  }
  return amount * otherWeight;
}

const defaultPower = unit => {
  const c = characterById(unit.id);
  return c.power * ([0, 1, 3, 9][unit.stars] || 1) + (c.role === 'attack' ? unit.growth || 0 : 0);
};

// Chances are conditional on the source appearing. For a source-free passive,
// they are conditional on the recipient appearing, matching power estimates.
export function effectRecipientChances(state, source, effect, { power = defaultPower } = {}) {
  const roster = state.roster || [], target = effect.target || (source ? 'self' : 'team');
  const strongest = target === 'strongest' || effect.selection === 'strongest';
  const range = effect.range || (['adjacent', 'row', 'column', 'aligned'].includes(target) ? target : 'team');
  const includesSelf = !['adjacent'].includes(range);
  const candidates = roster.filter(unit => matchesEffectFilter(unit, effect.filter, source)
    && (target !== 'self' || unit.uid === source?.uid)
    && (!strongest || effect.includeSource || unit.uid !== source?.uid)
    && (includesSelf || unit.uid !== source?.uid));
  const chances = new Map(candidates.map(unit => [unit.uid, 0]));
  if (!candidates.length) return chances;
  if (target === 'self') return new Map(candidates.map(unit => [unit.uid, 1]));
  const population = Math.max(19, roster.length - 1);
  const strengths = strongest ? new Map(candidates.map(unit => [unit.uid, power(unit)])) : null;
  const ranked = strongest ? candidates.slice().sort((a, b) => strengths.get(b.uid) - strengths.get(a.uid) || a.uid.localeCompare(b.uid, 'en')) : candidates;
  const selfCandidate = source && candidates.some(unit => unit.uid === source.uid);
  for (const [slots, weight] of source ? slotCases(range) : [[19, 1]]) {
    for (let rank = 0; rank < ranked.length; rank++) {
      const unit = ranked[rank], self = unit.uid === source?.uid;
      let chance = source ? self ? 1 : slots / population : 1;
      if (strongest) {
        const forcedStronger = selfCandidate && !self && ranked.slice(0, rank).some(other => other.uid === source.uid);
        if (forcedStronger) chance = 0;
        else {
          const stronger = ranked.slice(0, rank).filter(other => other.uid !== source?.uid).length;
          const remainingPopulation = source && !self ? population - 1 : population;
          const remainingSlots = source && !self ? slots - 1 : slots;
          chance *= choose(remainingPopulation - stronger, remainingSlots) / choose(remainingPopulation, remainingSlots);
        }
      } else if (Number.isInteger(effect.targetLimit) && effect.targetLimit > 0) {
        const otherCandidates = candidates.filter(other => other.uid !== unit.uid && other.uid !== source?.uid).length;
        const remainingPopulation = source && !self ? population - 1 : population;
        const remainingSlots = source && !self ? slots - 1 : slots;
        let selection = 0;
        for (let count = Math.max(0, remainingSlots - remainingPopulation + otherCandidates); count <= Math.min(remainingSlots, otherCandidates); count++) {
          const forced = Number(selfCandidate && !self);
          selection += hypergeometric(remainingPopulation, otherCandidates, remainingSlots, count) * Math.min(1, effect.targetLimit / (1 + count + forced));
        }
        chance *= selection;
      }
      chances.set(unit.uid, chances.get(unit.uid) + clamp(chance) * weight);
    }
  }
  if (strongest && !selfCandidate) {
    const ties = new Map();
    for (const unit of ranked) {
      const strength = strengths.get(unit.uid);
      if (!ties.has(strength)) ties.set(strength, []);
      ties.get(strength).push(unit.uid);
    }
    for (const uids of ties.values()) if (uids.length > 1) {
      const mean = uids.reduce((sum, uid) => sum + chances.get(uid), 0) / uids.length;
      for (const uid of uids) chances.set(uid, mean);
    }
  }
  return chances;
}
