import { RETIREMENT_RULES, retirementEligibility } from './retirements.js';
import { getArchetypes, isArchetypeCore } from './archetypes.js';
import { characterById, itemById, essenceById } from './content.js';
import { matchesSynergyFilter } from './synergies.js';
import { effectAmount, effectIsEligible } from './effect-rules.js';
import { abilityEffectAmount } from './enemy-effects.js';

const clamp = value => Math.max(0, Math.min(1, value));
const stars = unit => [0, 1, 3, 9][unit.stars] || 1;
const effectStars = (state, unit) => stars(unit) * (unit.stars > 1 && (state.activeDebuffs || []).some(effect => effect.id === 'star_audit') ? 0.8 : 1);
const add = (map, key, value) => map.set(key, (map.get(key) || 0) + value);

// Finite public-information forecast. Binomial appearance distributions respect
// cadence offsets without reading the seed, prior board, or next hidden draw.
export function estimateRetirementsForAi(state, { horizon = 24, growthRates = new Map(), growthMultiplier } = {}) {
  const result = { growthRates: new Map(), powerAdds: new Map(), availability: new Map(), economy: 0, flexibility: 0, expectedCompletions: 0, completionRate: 0, byRule: {} };
  const turns = Math.max(0, Math.min(96, Math.ceil(state.floor >= 12 && !state.endless ? Math.min(horizon, state.spinsLeft) : horizon)));
  if (!turns || !state.roster?.length) return result;
  const n = state.roster.length, draw = Math.min(1, 20 / n), adjacent = 5.5 / 19 * Math.min(1, 19 / Math.max(1, n - 1));
  const distributions = [[1]];
  for (let turn = 1; turn < turns; turn++) {
    const previous = distributions[turn - 1], next = Array(turn + 1).fill(0);
    previous.forEach((mass, appearances) => { next[appearances] += mass * (1 - draw); next[appearances + 1] += mass * draw; });
    distributions.push(next);
  }
  const cadence = (unit, turn, every) => distributions[turn - 1].reduce((sum, mass, appearances) => sum + (((unit.ticks || 0) + appearances + 1) % every === 0 ? mass * draw : 0), 0);
  const archetypeGrowth = new Map();
  for (const archetype of getArchetypes(state).filter(a => a.active)) for (const effect of archetype.effects.filter(e => e.type === 'growth')) {
    for (const unit of state.roster.filter(u => !u.temporary && !u.commission && matchesSynergyFilter(u, effect.filter, characterById))) add(archetypeGrowth, unit.uid, effect.value || 0);
  }
  let passiveGrowth = growthMultiplier ?? 1;
  if (growthMultiplier === undefined) {
    for (const definition of [...(state.items || []).map(itemById), ...(state.essences || []).filter(e => e.triggered).map(e => essenceById(e.id))]) {
      for (const effect of definition?.effects || []) if (!effect.legacy && effect.type === 'growthMultiplier') passiveGrowth *= effect.value || 1;
    }
  }
  const growthScale = ((state.items || []).includes('rubert_gear') ? 1.5 : 1) * ((state.activeDebuffs || []).some(d => d.id === 'growth_audit') ? 0.5 : 1) * passiveGrowth;
  const futureGrowth = (unit, turn) => {
    const appearances = Math.floor(Math.max(0, turn - 1) * draw);
    const interval = (state.activeDebuffs || []).some(d => d.id === 'danheng_audit') ? 4 : 3;
    let native = characterById(unit.id)?.kitVersion !== 6 && unit.id === '1002' ? Math.floor(((unit.ticks || 0) + appearances) / interval) - Math.floor((unit.ticks || 0) / interval) : 0;
    if (characterById(unit.id)?.kitVersion === 6) {
      for (let appearance = 1; appearance <= appearances; appearance++) {
        const appearing = { ...unit, ticks: (unit.ticks || 0) + appearance };
        const context = { state, unit: appearing, trigger: 'appearance', star: effectStars(state, unit), metricOverrides: (metric, filter = {}) => {
          const partners = state.roster.filter(other => (!filter.excludeSelf || other.uid !== unit.uid) && matchesSynergyFilter(other, filter, characterById));
          if (metric === 'present') return partners.reduce((sum, other) => sum + (other.uid === unit.uid ? 1 : n <= 20 ? 1 : 19 / (n - 1)), 0);
          if (metric === 'neighbors') return partners.filter(other => other.uid !== unit.uid).length * adjacent;
          if (metric === 'ticks') return appearing.ticks;
          return undefined;
        } };
        for (const effect of characterById(unit.id).effects || []) if (effect.type === 'growth' && effect.target === 'self' && effect.trigger === 'appearance' && effectIsEligible(effect, context)) native += abilityEffectAmount(state, appearing, effect, effectAmount(effect, context)) * (effect.chance ?? 1);
      }
    }
    const declared = Math.max(growthRates.get(unit.uid) || 0, archetypeGrowth.get(unit.uid) || 0);
    return unit.growth + (native + declared * Math.max(0, turn - 1) * draw) * growthScale;
  };
  for (const rule of RETIREMENT_RULES) {
    const hosts = state.roster.filter(u => u.id === rule.sourceId && !u.temporary && !u.commission);
    if (!hosts.length) continue;
    const normals = state.roster.filter(u => u.id === rule.targetId && !u.temporary && !u.commission);
    const existing = state.roster.find(u => u.commission === rule.id);
    const unlocked = normals.length > 0 || state.retirementStats?.byRule?.[rule.id]?.completed > 0;
    if (!unlocked && !existing) continue;
    const eligible = normals.filter(target => retirementEligibility(state, hosts[0], target, { isCore: isArchetypeCore }).eligible);
    const stock = eligible.map(unit => ({ unit, mass: 1, lostArea: 0 }));
    let ordinaryBudget = Math.max(0, Math.min(eligible.length, normals.length - 1));
    let pending = existing ? 1 : 0, existingMass = pending, existingLostArea = 0, total = 0, supplied = 0;
    const hostEvents = new Map(), hostGrowthArea = new Map();
    for (let turn = 1; turn <= turns; turn++) {
      const startPending = pending;
      for (const host of hosts) {
        const due = cadence(host, turn, rule.every);
        if (!due) continue;
        const generatedCompletion = pending * due * adjacent;
        // Existing assignments are consumed before normal extra copies. Newly
        // supplied assignments are deliberately unavailable until the next turn.
        pending = clamp(pending - generatedCompletion);
        if (existingMass) existingMass = Math.max(0, existingMass - Math.min(existingMass, generatedCompletion));
        const available = stock.filter(entry => entry.mass > 0 && futureGrowth(entry.unit, turn) <= 1);
        const material = available.reduce((sum, entry) => sum + entry.mass, 0);
        const normalCompletion = Math.min(ordinaryBudget, due * (1 - startPending * adjacent) * (1 - (1 - adjacent) ** material));
        if (normalCompletion > 0 && material > 0) {
          ordinaryBudget = Math.max(0, ordinaryBudget - normalCompletion);
          for (const entry of available) entry.mass = Math.max(0, entry.mass - normalCompletion * entry.mass / material);
        }
        const completed = generatedCompletion + normalCompletion;
        total += completed; add(hostEvents, host.uid, completed);
        add(hostGrowthArea, host.uid, completed * effectAmount({ type: 'growth', value: rule.growth, scaleWithStars: true, ...(characterById(host.id)?.kitVersion === 6 ? { starFactors: [0, 1, 1.5, 2] } : {}) }, { state, unit: host, star: effectStars(state, host) }) * (turns - turn + 1));
      }
      if (unlocked && n < 200) {
        const supplyChance = 1 - hosts.reduce((miss, host) => miss * (1 - cadence(host, turn, rule.supplyEvery)), 1);
        const created = (1 - startPending) * supplyChance;
        pending = clamp(pending + created); supplied += created;
      }
      for (const entry of stock) entry.lostArea += 1 - entry.mass;
      if (existing) existingLostArea += 1 - existingMass;
    }
    for (const host of hosts) {
      const completed = hostEvents.get(host.uid) || 0;
      // The caller applies all item, passive and audit training modifiers once.
      if (characterById(host.id)?.role !== 'trainer') add(result.growthRates, host.uid, 2 * (hostGrowthArea.get(host.uid) || 0) / Math.max(1e-9, turns * horizon * draw));
      const role = characterById(host.id)?.role;
      if (!role || role === 'attack') add(result.powerAdds, host.uid, completed * rule.power * effectStars(state, host) / Math.max(1e-9, turns * draw));
    }
    for (const entry of stock) {
      result.availability.set(entry.unit.uid, clamp(1 - entry.lostArea / turns));
      const polluted = (state.activeDebuffs || []).some(d => d.id === 'rift_pollution' && d.targetUid === entry.unit.uid);
      if (polluted) result.flexibility += (1 - entry.mass) * 0.1 / turns;
    }
    if (existing) result.availability.set(existing.uid, clamp(1 - existingLostArea / turns));
    result.expectedCompletions += total;
    result.economy += total * rule.coins / turns;
    result.byRule[rule.id] = { completed: total, supplied, ordinaryRemoved: Math.max(0, Math.min(eligible.length, normals.length - 1)) - ordinaryBudget, pending };
  }
  result.completionRate = result.expectedCompletions / turns;
  return result;
}
