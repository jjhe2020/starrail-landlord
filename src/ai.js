import { characterById, itemById, essenceById } from './content.js';
import * as engine from './engine.js';
import { getCharacterAttributes } from './attributes.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { unitPowerMultiplier, utilityMultiplier, abilityEffectAmount, isPolluted, POLLUTION_ATTACK_MULTIPLIER } from './enemy-effects.js';
import { effectAmount, matchesEffectFilter } from './effect-rules.js';
import { SPATIAL_METRICS, spatialMetricMean, spatialConditionProbability, effectRecipientChances, expectedEffectAmountForAi } from './ai-spatial.js';
import { distinctPresenceProbability, estimateSynergyContributions, synergyOffenseScale } from './synergies.js';
import { estimateRetirementsForAi } from './retirement-ai.js';
const { BOARD_SIZE, STAR_MULTIPLIERS, chooseReward, skipReward, spin, getSynergies, rerollRewards, removeSymbol } = engine;

export { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
// Algorithm version is independent from a saved profile's reusable model weights.
export const POLICY_VERSION = 'v080-explicit-attributes-v1';
export const RESOURCE_KEYS = Object.freeze(['rerolls', 'removals', 'credits', 'defense']);
export const SUPPLY_KINDS = Object.freeze(['repair', 'barrier', 'overclock']);
const REWARD_PHASES = ['recruit', 'item', 'essence'];
const rewardCache = new WeakMap();
const actionCache = new WeakMap();
const removalCache = new WeakMap();
const enabled = (state, key) => state?.resourceAccess?.[key] !== false;
// The defense switch controls planning, not natural character/item effects.
// Stored models remain intact; only this game's effective valuation is changed.
function policyFor(state, profile) {
  const validated = validateProfile(profile) || DEFAULT_PROFILE;
  return enabled(state, 'defense') ? validated : { ...validated, weights: { ...validated.weights, defense: 0 } };
}
const clamp = (number, low, high) => Math.min(high, Math.max(low, number));
const legacyHas = (state, id) => state.items.includes(id) && itemById(id)?.effects?.some(effect => effect.legacy);
const legacyEssenceValue = (activations, id) => essenceById(id)?.effects?.some(effect => effect.legacy) ? activations[id] || 0 : 0;
const star = unit => STAR_MULTIPLIERS[unit.stars] || 1;
const effectStar = (_state, unit) => star(unit);
const legacyKit = id => !(characterById(id)?.kitVersion >= 6);
const attacks = unit => { const attack = getCharacterAttributes(unit).normalAttack; return attack.primary > 0 || attack.eachTarget > 0; };
const basePower = unit => getCharacterAttributes(unit).attack;
// The published tax reduces only the star base. Card selection still compares
// permanent attributes; fixed skill values and permanent additions are intact.
const combatBasePower = (state, unit, encounterShare = 1) => {
  const attributes = getCharacterAttributes(unit);
  const tax = unit.stars > 1 && state.activeDebuffs.some(effect => effect.id === 'star_audit') ? .2 * encounterShare : 0;
  return attributes.starAttack * (1 - tax) + attributes.attackBonus;
};
const expectedAttackPenalty = (state, horizon = 1, encounterShare = 1) => state.enemySkill?.id === 'jammer'
  ? 1 - .5 * (1 / 5) * (horizon <= 1 ? (state.round + 1) % 3 === 0 ? 1 : 0 : 1 / 3) * encounterShare : 1;
const remainingAppearances = unit => unit.deleteAfterAppearances ? Math.max(0, unit.deleteAfterAppearances - (unit.ticks || 0)) : characterById(unit.id)?.effects?.find(effect => effect.type === 'selfDelete') ? Math.max(0, characterById(unit.id).effects.find(effect => effect.type === 'selfDelete').afterAppearances - (unit.ticks || 0)) : unit.temporary || Infinity;
const growthRate = id => !legacyKit(id) ? 0 : id === '1002' ? 1 / 3 : id === '1107' ? 0.5 : id === '1205' ? 0.5 : 0;
const count = (roster, predicate) => roster.reduce((sum, unit) => sum + (predicate(characterById(unit.id), unit) ? 1 : 0), 0);

export function forecastGrowthForAi(state, unit, { horizon = futureHorizon(state), draw = Math.min(1, BOARD_SIZE / Math.max(1, state.roster.length)), declaredRate = 0, growthMultiplier = 1, commissionRate = 0 } = {}) {
  const commissionGain = commissionRate * horizon * draw * .5 * (state.activeDebuffs.some(d => d.id === 'growth_audit') ? .5 : 1);
  const multiplier = (legacyHas(state, 'rubert_gear') ? 1.5 : 1) * growthMultiplier * (state.activeDebuffs.some(d => d.id === 'growth_audit') ? 0.5 : 1);
  if (remainingAppearances(unit) === Infinity) return (growthRate(unit.id) + declaredRate) * multiplier * horizon * draw * 0.5 + commissionGain;
  // A reinforcement's own growth disappears when that instance retires. In
  // particular a fresh two-appearance Dan Heng cannot ever reach appearance 3.
  // Average only the growth it can actually acquire during its finite lifetime.
  const appearances = Math.max(0, Math.min(remainingAppearances(unit), Math.ceil(horizon * draw)));
  if (!legacyKit(unit.id)) {
    const selfTraining = (characterById(unit.id).effects || []).filter(effect => !effect.legacy && ['growth', 'attackGrowth'].includes(effect.type) && effect.target === 'self' && effect.trigger === 'appearance');
    if (selfTraining.length) {
      let acquired = 0, area = 0;
      for (let appearance = 1; appearance <= appearances; appearance++) {
        const appearing = { ...unit, ticks: (unit.ticks || 0) + appearance };
        const context = { state, unit: appearing, trigger: 'appearance', star: effectStar(state, unit), metricOverrides: (metric, filter = {}) => {
          const partners = state.roster.filter(other => matchesEffectFilter(other, filter, unit));
          if (metric === 'present') return partners.reduce((sum, other) => sum + (other.uid === unit.uid ? 1 : state.roster.length <= BOARD_SIZE ? 1 : (BOARD_SIZE - 1) / (state.roster.length - 1)), 0);
          if (SPATIAL_METRICS.includes(metric)) return spatialMetricMean(state, unit, metric, filter);
          return undefined;
        } };
        for (const effect of selfTraining) acquired += abilityEffectAmount(state, appearing, effect, expectedEffectAmountForAi(effect, context)) * (effect.chance ?? 1);
        area += acquired;
      }
      return appearances ? area / appearances * multiplier + commissionGain * appearances / Math.max(1, horizon * draw) : 0;
    }
  }
  const interval = unit.id === '1002' ? state.activeDebuffs.some(d => d.id === 'danheng_audit') ? 4 : 3 : unit.id === '1107' ? 2 : 1;
  const amount = !legacyKit(unit.id) ? 0 : unit.id === '1002' || unit.id === '1107' ? 1 : unit.id === '1205' ? 0.5 : 0;
  let growth = 0, total = 0;
  for (let appearance = 1; appearance <= appearances; appearance++) {
    if (((unit.ticks || 0) + appearance) % interval === 0) growth += amount;
    total += growth + declaredRate * appearance;
  }
  return appearances ? total / appearances * multiplier + commissionGain * appearances / Math.max(1, horizon * draw) : 0;
}

function hash(value) {
  let result = 2166136261;
  for (const char of String(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  return (result >>> 0) || 1;
}

// Kept separate from state.rngState so AI choice sampling never changes a board draw.
export function createPolicyRandom(seed) {
  let value = hash(String(seed));
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    value = (value >>> 0) || 1;
    return value / 4294967296;
  };
}

function publicDigest(state) {
  // Deliberately exclude the engine seed/RNG and unrevealed rewards. These simulated
  // boards are counterfactual samples, not the next board secretly waiting in a save.
  return JSON.stringify([state.mode, state.difficulty, state.resourceAccess, state.activeDebuffs, state.bossStage, state.floor, state.round, state.spinsLeft, state.hp, state.maxHp, state.shield, state.rerolls, state.removals, state.supplyPurchases, state.overclockReady, state.resourceStats, state.coins, state.phase, state.choices,
    state.roster.map(unit => [unit.id, unit.stars, unit.attackBonus ?? unit.growth, unit.attackPercentBonus || 0, unit.normalAttackBonus || {}, unit.ticks, unit.deleteAfterAppearances || 0, unit.temporary || 0, unit.commission || '']), state.items, state.essences, state.retirementStats, state.lastTurnDeletions || 0,
    state.enemies.map(enemy => [enemy.col, enemy.hp, enemy.attack]), state.enemySkill?.id, state.pendingFloor]);
}

function futureHorizon(state) {
  return clamp(state.spinsLeft + Math.max(0, 12 - state.floor) * 3.2, 3, 24);
}

export function attackFactor(state, attack, future = false) {
  const normal = typeof attack === 'string' ? { pattern: attack, primary: attack === 'single' ? 3 : 2, adjacent: 1, eachTarget: 1 } : attack?.normalAttack || attack;
  if (!normal || normal.pattern === 'support') return 0;
  if (normal.pattern === 'single') return normal.primary || 0;
  const enemies = state.enemies.filter(enemy => enemy.hp > 0);
  const averageAlive = future ? Math.max(enemies.length, 4) : Math.max(1, enemies.length);
  if (normal.pattern === 'aoe') return averageAlive * (normal.eachTarget || 0);
  if (future) return (normal.primary || 0) + 1.6 * (normal.adjacent || 0);
  let total = 0;
  for (let col = 0; col < 5; col++) {
    const target = enemies.slice().sort((a, b) => Math.abs(a.col - col) - Math.abs(b.col - col) || a.col - b.col)[0];
    total += (normal.primary || 0) + (normal.adjacent || 0) * (target ? enemies.filter(enemy => Math.abs(enemy.col - target.col) === 1).length : 0);
  }
  return total / 5;
}

function declaredGlobalPower(state, unit, activations) {
  const c = characterById(unit.id);
  return (legacyHas(state, 'gold_coin') ? 0.3 : 0) + (c.path === '虚无' ? (legacyHas(state, 'nihility_wax') ? 1 : 0) + legacyEssenceValue(activations, 'essence_nihility') * 1.5 : 0)
    + legacyEssenceValue(activations, 'essence_destruction') + (c.attack === 'aoe' ? legacyEssenceValue(activations, 'essence_erudition') : 0);
}
function declaredGlobalMultiplier(state, unit, activations) {
  const c = characterById(unit.id);
  let value = (legacyHas(state, 'doctor_robe') && unit.stars > 1 ? 1.2 : 1) * (legacyHas(state, 'broken_clock') ? 1.2 : 1) * (legacyHas(state, 'cosmic_lotto') ? 1.1 : 1)
    * (1 + 0.15 * legacyEssenceValue(activations, 'essence_elation')) * (1 + 0.1 * legacyEssenceValue(activations, 'essence_harmony'));
  if (c.attack === 'single') value *= (legacyHas(state, 'hunt_wax') ? 1.3 : 1) * (1 + 0.35 * legacyEssenceValue(activations, 'essence_hunt'));
  if (c.attack === 'blast' && legacyHas(state, 'destruction_wax')) value *= 1.25;
  if (c.attack === 'aoe' && legacyHas(state, 'erudition_wax')) value *= 1.25;
  return value;
}

// Estimate data-driven skills using public roster and encounter information.
// Only public roster/enemy/resource information is read; the previous board is
// never used as a prediction of the next draw. Real counterfactual spin samples
// remain the final check on sequencing, caps, kills and lethal damage.
export function estimateEffectsForAi(state, { horizon = futureHorizon(state), activations = {}, active = getSynergies(state).filter(s => s.active), healing = 0, shields = 0, output = 0, threat = 0, retirementRate = 0, commissionForecast } = {}) {
  const roster = state.roster, n = roster.length, draw = Math.min(1, BOARD_SIZE / Math.max(1, n));
  const coDraw = n <= BOARD_SIZE ? 1 : (BOARD_SIZE - 1) / Math.max(1, n - 1);
  const alive = state.enemies.filter(e => e.hp > 0).length;
  const baseline = basePower;
  const result = { powerAdds: new Map(), powerMultipliers: new Map(), damageBonuses: new Map(), followUpBonuses: new Map(), enemyDamageBonus: 0, enemyFollowUpBonus: 0, growthRates: new Map(), buffMultipliers: new Map(), damage: 0, healing: 0, shields: 0, reduction: 0, selfDrain: 0, economy: 0, flexibility: 0, armorBreak: 0, tempo: 0, healMultiplier: 1, shieldMultiplier: 1, growthMultiplier: 1, essenceMultiplier: 1, utilityGrowth: 0, vulnerabilityMultipliers: new Map(), shieldSourceMultipliers: new Map(), healSourceMultipliers: new Map() };
  const utilityForecasts = [];
  const recordUtilityForecast = (source, effect, amount, weight) => {
    if (source && effect.scaleWithSourcePower && ['shield', 'heal', 'healOverflowShield'].includes(effect.type) && Number.isFinite(weight) && weight > 0) utilityForecasts.push({ source, effect, amount, weight });
  };
  const commissions = commissionForecast || estimateRetirementsForAi(state, { horizon });
  if (!commissionForecast) retirementRate += commissions.completionRate;
  const matching = (unit, filter, source) => matchesEffectFilter(unit, filter, source);
  const matched = (filter, source) => roster.filter(unit => matching(unit, filter, source));
  const metrics = (metric, filter = {}, source) => {
    const units = () => matched(filter, source);
    switch (metric) {
      case 'hpRatio': return state.hp / state.maxHp;
      case 'missingHp': return state.maxHp - state.hp;
      case 'shield': return state.shield;
      case 'coins': return state.coins;
      case 'ticks': return (source?.ticks || 0) + 1;
      case 'stars': return source?.stars || 1;
      case 'growth': case 'attackBonus': return source?.attackBonus ?? source?.growth ?? 0;
      case 'round': return state.round + 1;
      case 'floor': return state.floor;
      case 'roster': return units().length;
      case 'present': return units().reduce((sum, unit) => sum + (source?.uid === unit.uid ? 1 : source ? coDraw : draw), 0);
      case 'presentDistinct': return [...new Set(units().map(unit => unit.id))].reduce((sum, id) => sum + distinctPresenceProbability(state, { ...filter, id }, 1, key => key === id ? characterById(key) : null), 0);
      case 'neighbors': case 'row': case 'column': case 'aligned': case 'edge': case 'corner': case 'emptyNeighbors': return spatialMetricMean(state, source, metric, filter);
      case 'emptyColumns': return 5 - alive;
      case 'enemies': return alive;
      case 'synergies': return active.length;
      case 'retirements': return retirementRate;
      case 'lastTurnDeletions': return horizon <= 1 ? state.lastTurnDeletions || 0 : retirementRate;
      case 'damage': return output;
      case 'healing': return Math.min(healing + result.healing, Math.max(state.maxHp - state.hp, threat * 0.5));
      case 'blocked': return Math.min(Math.max(0, threat), shields + result.shields + state.shield / Math.max(1, Math.min(horizon, state.spinsLeft)));
      case 'sourcePower': {
        if (!source) return 0;
        // Enemy output penalties belong to damage, not the attack stat used by healing and shielding.
        return (combatBasePower(state, source) + declaredGlobalPower(state, source, activations) + (result.powerAdds.get(source.uid) || 0)) * ((result.powerMultipliers.get(source.uid) || 1) + (getCharacterAttributes(source).permanentPercent || 0)) * declaredGlobalMultiplier(state, source, activations) * expectedAttackPenalty(state, horizon);
      }
      case 'kills': return Math.min(alive, output / Math.max(1, state.enemies.filter(e => e.hp > 0).reduce((sum, e) => sum + e.hp, 0) / Math.max(1, alive)));
      default: return 0;
    }
  };
  const compare = (value, condition) => condition.op === 'lte' ? value <= condition.value : condition.op === 'lt' ? value < condition.value : condition.op === 'gt' ? value > condition.value : condition.op === 'eq' ? value === condition.value : condition.op === 'mod' ? value > 0 && value % condition.value === 0 : value >= condition.value;
  const choose = (population, count) => {
    if (count < 0 || count > population) return 0;
    let value = 1;
    for (let i = 1; i <= Math.min(count, population - count); i++) value *= (population - i + 1) / i;
    return value;
  };
  const conditionChance = (condition, source) => {
    if (!condition) return 1;
    if (condition.metric === 'presentDistinct' && (!condition.op || condition.op === 'gte')) {
      if (!source) return distinctPresenceProbability(state, condition.filter || {}, condition.value, characterById);
      // A member-scoped source is already known to be drawn. Remove its one
      // forced slot, and count its identity once; its duplicate copies may fill
      // other slots but cannot supply an additional distinct identity.
      const included = matching(source, condition.filter, source);
      const remaining = { roster: roster.filter(unit => unit.uid !== source.uid) };
      return distinctPresenceProbability(remaining, condition.filter || {}, condition.value - Number(included), included ? id => id === source.id ? null : characterById(id) : characterById, BOARD_SIZE - 1);
    }
    if (condition.metric === 'present') {
      const forced = source && matching(source, condition.filter, source) ? 1 : 0;
      const population = source ? roster.filter(unit => unit.uid !== source.uid) : roster;
      const successes = population.filter(unit => matching(unit, condition.filter, source)).length;
      const draws = Math.min(source ? BOARD_SIZE - 1 : BOARD_SIZE, population.length);
      const denominator = choose(population.length, draws);
      let probability = 0;
      for (let k = 0; k <= Math.min(successes, draws); k++) if (compare(k + forced, condition)) probability += choose(successes, k) * choose(population.length - successes, draws - k) / denominator;
      return clamp(probability, 0, 1);
    }
    if (condition.metric === 'ticks' && condition.op === 'mod') {
      const opportunities = Math.max(1, Math.min(8, Math.ceil(horizon * draw)));
      let successes = 0;
      for (let i = 1; i <= opportunities; i++) if (((source?.ticks || 0) + i) % condition.value === 0) successes++;
      return successes / opportunities;
    }
    if (SPATIAL_METRICS.includes(condition.metric)) return spatialConditionProbability(state, source, condition);
    return compare(metrics(condition.metric, condition.filter, source), condition) ? 1 : 0;
  };
  const frequency = (effect, source, sourceType) => {
    let rate = source ? draw : 1;
    if (effect.trigger === 'floor') rate = state.floor >= 12 && !state.endless ? 0 : 1 / 5.5;
    if (effect.trigger === 'kill') {
      const kills = metrics('kills');
      const share = source ? baseline(source) * attackFactor(state, getCharacterAttributes(source).normalAttack) / Math.max(1, output) : 1;
      rate = Math.min(effect.oncePerSpin ? 1 : alive, kills * share * (source ? draw : 1));
    }
    if (['retaliation', 'afterEnemyAttack'].includes(effect.trigger) && (state.hp <= 0 || threat <= 0)) rate = 0;
    if (effect.trigger === 'afterNormalAttack') {
      const range = effect.eventRange === 'enemyColumn' ? 'column' : effect.eventRange || 'team';
      const eventTargets = effectRecipientChances(state, source, {target: range, filter: effect.eventFilter || {excludeSelf:true}}, {power:baseline});
      const expectedEvents = [...eventTargets.values()].reduce((sum, chance) => sum + chance, 0);
      rate *= effect.oncePerSpin ? Math.min(1, expectedEvents) : expectedEvents;
    }
    if (effect.trigger === 'merge') rate *= 0.1;
    if (effect.trigger === 'acquire') rate = sourceType === 'essence' ? 1 / Math.max(3, horizon) : 0;
    if (effect.every) {
      const opportunities = Math.max(1, Math.min(8, Math.ceil(horizon * (source ? draw : 1))));
      const start = effect.trigger === 'appearance' ? source?.ticks || 0 : state.round;
      let successes = 0;
      for (let i = 1; i <= opportunities; i++) if ((start + i) % effect.every === 0) successes++;
      rate *= successes / opportunities;
    }
    rate *= conditionChance(effect.condition, source) * (effect.conditions || []).reduce((p, c) => p * conditionChance(c, source), 1);
    return rate;
  };
  const sources = [];
  const amplifierMultipliers = new Map();
  const vulnerabilityAdds = new Map();
  const attributedDamage = [];
  let retaliationFactor = 1;
  let flatReduction = 0;
  for (const unit of roster) sources.push({ definition: characterById(unit.id), unit, sourceType: 'character', activation: 1 });
  for (const id of state.items) sources.push({ definition: itemById(id), sourceType: 'item', activation: 1 });
  for (const entry of state.essences) sources.push({ definition: essenceById(entry.id), sourceType: 'essence', activation: entry.triggered ? 1 : activations[entry.id] || 0, triggered: entry.triggered });
  const apply = (effect, { unit: source, sourceType, activation = 1, synergy, triggered }) => {
    if (effect.legacy || !activation || triggered && effect.trigger === 'acquire') return;
    const rate = frequency(effect, source, sourceType) * activation * (effect.chance ?? 1);
    if (!rate) return;
    const context = { state, unit: source, star: source ? effectStar(state, source) : 1, trigger: effect.trigger, metricOverrides: (metric, filter) => metrics(metric, filter, source) };
    // Conditions and periodic chance were integrated above; values/per/star are
    // interpreted by the exact shared DSL helper used by the engine.
    const scalar = { ...effect, condition: undefined, conditions: undefined, every: undefined, chance: undefined };
    const spatialConditions = [effect.condition, ...(effect.conditions || [])].filter(condition => condition && SPATIAL_METRICS.includes(condition.metric));
    const spatialWeight = spatialConditions.reduce((weight, condition) => weight * conditionChance(condition, source), 1);
    let amount = expectedEffectAmountForAi({ ...scalar, conditions: spatialConditions }, context) / Math.max(1e-12, spatialWeight);
    if (sourceType === 'character') amount = abilityEffectAmount(state, source, effect, amount);
    if (!Number.isFinite(amount)) return;
    const offense = sourceType === 'synergy' ? synergyOffenseScale(state) : 1;
    const needsRecipients = ['power', 'powerMultiplier', 'growth', 'attackGrowth', 'attackPercent', 'damageBonus', 'vulnerability'].includes(effect.type);
    const recipientChances = needsRecipients ? effectRecipientChances(state, source, effect, { power: baseline }) : new Map();
    const targets = roster.filter(unit => (recipientChances.get(unit.uid) || 0) > 0);
    const targetChance = target => recipientChances.get(target.uid) || 0;
    if (effect.type === 'power' || effect.type === 'powerMultiplier') {
      const affected = targets;
      for (const target of affected) {
        const chance = rate / Math.max(draw, 1e-9) * targetChance(target) * (source ? 1 : draw);
        const isSupportBuff = sourceType === 'character' && characterById(source?.id)?.role === 'amplifier' || ['adjacent', 'row', 'column', 'aligned', 'strongest'].includes(effect.target) || effect.selection === 'strongest';
        const buff = isSupportBuff ? (sourceType === 'character' ? utilityMultiplier(state, source, 'buff') : 1) * (legacyHas(state, 'harmony_wax') ? 1.5 : 1) * (result.buffMultipliers.get(source?.uid) || 1) : 1;
        if (effect.type === 'power') {
          result.powerAdds.set(target.uid, (result.powerAdds.get(target.uid) || 0) + amount * chance * offense * buff);
          if (attacks(target)) recordUtilityForecast(source, scalar, amount, chance * offense * buff * attackFactor(state, getCharacterAttributes(target).normalAttack, true) * draw);
        } else if (sourceType === 'character' && characterById(source.id)?.role === 'amplifier') {
          const previous = amplifierMultipliers.get(target.uid) || 1;
          const next = Math.min(2.2, previous * Math.max(1, 1 + (amount - 1) * buff * chance));
          amplifierMultipliers.set(target.uid, next);
          result.powerMultipliers.set(target.uid, (result.powerMultipliers.get(target.uid) || 1) * next / previous);
          recordUtilityForecast(source, scalar, amount, Math.max(0, Math.min(2.2 - previous, 1)) * baseline(target) * attackFactor(state, getCharacterAttributes(target).normalAttack, true) * buff * chance * draw);
        } else result.powerMultipliers.set(target.uid, (result.powerMultipliers.get(target.uid) || 1) * (1 + (amount - 1) * buff * chance * offense));
      }
    } else if (effect.type === 'attackPercent' || effect.type === 'damageBonus') {
      const targetMap = effect.type === 'attackPercent' ? result.powerMultipliers : effect.attackType === 'followUp' ? result.followUpBonuses : result.damageBonuses;
      for (const target of targets) {
        const chance = rate / Math.max(draw, 1e-9) * targetChance(target) * (source ? 1 : draw);
        const initial = effect.type === 'attackPercent' ? 1 : 0;
        const isSupportBuff = sourceType === 'character' && characterById(source?.id)?.role === 'amplifier' || ['adjacent','row','column','aligned','strongest'].includes(effect.target);
        const buff = isSupportBuff ? (sourceType === 'character' ? utilityMultiplier(state, source, 'buff') : 1) * (result.buffMultipliers.get(source?.uid) || 1) : 1;
        targetMap.set(target.uid, (targetMap.get(target.uid) ?? initial) + amount * chance * buff);
      }
    } else if (effect.type === 'enemyVulnerability') {
      const affectedShare = ['team','all','enemies'].includes(effect.target) ? 1 : effect.target === 'occupiedColumns' ? Math.min(1, matched(effect.filter, source).length * draw / Math.max(1, alive)) : 1 / Math.max(1, alive);
      const key = effect.attackType === 'followUp' ? 'enemyFollowUpBonus' : 'enemyDamageBonus';
      result[key] = Math.min(.75, result[key] + amount * rate * affectedShare);
    } else if (effect.type === 'heal' || effect.type === 'healOverflowShield') {
      const weight = rate * (source ? utilityMultiplier(state, source, 'heal') * (result.healSourceMultipliers.get(source.uid) || 1) : 1);
      result.healing += amount * weight;
      if (effect.type === 'healOverflowShield') result.shields += Math.max(0, amount * weight * (legacyHas(state, 'abundance_wax') ? 1.5 : 1) * result.healMultiplier - Math.max(0, state.maxHp - state.hp) - threat * 0.3);
      recordUtilityForecast(source, scalar, amount, weight * 0.36);
    } else if (effect.type === 'shield') {
      const weight = rate * (source ? utilityMultiplier(state, source, 'shield') * (result.shieldSourceMultipliers.get(source.uid) || 1) : 1);
      result.shields += amount * weight;
      recordUtilityForecast(source, scalar, amount, weight * 0.36);
    } else if (effect.type === 'retaliationFlat') {
      flatReduction += amount * rate;
      recordUtilityForecast(source, scalar, amount, rate * 0.36);
    } else if (effect.type === 'retaliationMultiplier') {
      const previous = retaliationFactor;
      retaliationFactor = Math.max(0.4, previous - Math.max(0, 1 - amount) * rate);
      // Flat and proportional reductions are combined once after all sources.
      recordUtilityForecast(source, scalar, amount, threat * rate * 0.36);
    } else if (effect.type === 'vulnerability') {
      for (const target of targets.filter(attacks)) {
        const chance = rate / Math.max(draw, 1e-9) * targetChance(target) * (source ? 1 : draw);
        const previous = vulnerabilityAdds.get(target.uid) || 0;
        const next = Math.min(0.75, previous + amount * chance);
        vulnerabilityAdds.set(target.uid, next);
        recordUtilityForecast(source, scalar, amount, Math.max(0, Math.min(0.75 - previous, 1)) * baseline(target) * attackFactor(state, getCharacterAttributes(target).normalAttack, true) * chance * draw);
      }
    }
    else if (effect.type === 'selfDamage') result.selfDrain += amount * rate;
    else if (effect.type === 'damage') {
      attributedDamage.push({ effect: scalar, source, sourceType, amount, rate, offense });
    } else if (['growth', 'attackGrowth'].includes(effect.type)) {
      const affected = targets;
      for (const target of affected) {
        const chance = rate / Math.max(draw, 1e-9) * targetChance(target) * (source ? 1 : draw);
        result.growthRates.set(target.uid, (result.growthRates.get(target.uid) || 0) + amount * chance);
      }
    }
    else if (effect.type === 'resource') {
      if ((effect.resource || 'coins') === 'coins' && enabled(state, 'credits')) result.economy += amount * rate;
      if (effect.resource === 'rerolls' && enabled(state, 'rerolls')) result.flexibility += amount * rate * 3;
      if (effect.resource === 'removals' && enabled(state, 'removals')) result.flexibility += amount * rate * 4;
    } else if (effect.type === 'summon' && roster.length < 200) {
      const summoned = characterById(effect.characterId);
      const appearances = effect.durationAppearances || summoned?.effects?.find(entry => entry.type === 'selfDelete')?.afterAppearances || 3;
      if (summoned && (horizon > 1 || !effect.rosterLimit || roster.filter(unit => unit.id === summoned.id).length < effect.rosterLimit)) result.damage += amount * rate * summoned.baseAttack * attackFactor(state, summoned.normalAttack, true) * appearances * 0.65;
    } else if (effect.type === 'consume') {
      const chance = spatialConditionProbability(state, source, { metric: 'neighbors', value: 1, filter: { ...effect.filter, temporary: true } });
      if (source) result.powerAdds.set(source.uid, (result.powerAdds.get(source.uid) || 0) + amount * chance * rate / Math.max(draw, 1e-9));
    } else if (effect.type === 'ignoreArmor' && state.enemySkill?.id === 'armor') result.armorBreak += rate;
    else if (effect.type === 'rarityMultiplier') result.flexibility += Math.max(0, amount - 1) * activation * horizon * 0.25;
    else if (effect.type === 'extraSpin') result.tempo += amount * rate * output;
    else if (effect.type === 'maxHp' && sourceType === 'essence' && !triggered) result.healing += amount * rate * 0.4;
  };
  // Utility multipliers are evaluated first so they affect both old and new
  // character abilities; a new item never becomes invisible to the old roster.
  const allSources = [...sources, ...active.map(synergy => ({ definition: synergy, sourceType: 'synergy', activation: 1, synergy }))];
  for (const source of allSources) for (const effect of source.definition?.effects || []) {
    if (effect.legacy || effect.trigger !== 'passive' || !effect.type.endsWith('Multiplier') || !['healMultiplier', 'shieldMultiplier', 'buffMultiplier', 'growthMultiplier', 'attackGrowthMultiplier', 'essenceProgressMultiplier'].includes(effect.type)) continue;
    const rate = frequency(effect, source.unit, source.sourceType) * source.activation * (effect.chance ?? 1);
    const amount = effectAmount(effect, { state, unit: source.unit, star: source.unit ? effectStar(state, source.unit) : 1, trigger: 'passive', metricOverrides: (metric, filter) => metrics(metric, filter, source.unit) });
    if (effect.type === 'buffMultiplier') {
      for (const target of matched(effect.filter)) result.buffMultipliers.set(target.uid, (result.buffMultipliers.get(target.uid) || 1) + (amount - 1) * rate);
    } else if (effect.filter && ['healMultiplier', 'shieldMultiplier'].includes(effect.type)) {
      const targetMap = effect.type === 'healMultiplier' ? result.healSourceMultipliers : result.shieldSourceMultipliers;
      for (const target of matched(effect.filter, source.unit)) targetMap.set(target.uid, (targetMap.get(target.uid) || 1) + (amount - 1) * rate);
    } else {
      const key = effect.type === 'essenceProgressMultiplier' ? 'essenceMultiplier' : effect.type === 'attackGrowthMultiplier' ? 'growthMultiplier' : effect.type;
      result[key] += (amount - 1) * rate;
    }
  }
  const priority = effect => ['power', 'powerMultiplier', 'attackPercent', 'damageBonus', 'enemyVulnerability', 'vulnerability'].includes(effect.type);
  for (const pass of [true, false]) for (const source of sources) for (const effect of source.definition?.effects || []) if (priority(effect) === pass) apply(effect, source);
  // Shared helper enumerates exactly the same current-tier configurations as
  // the engine, with per-member sources only when that configuration requests it.
  estimateSynergyContributions(state, { characterById, estimateEffect(effect, { synergy }) {
    if (effect.scope === 'members') for (const unit of roster.filter(u => matching(u, synergy.filter))) apply(effect, { unit, synergy, sourceType: 'synergy' });
    else apply(effect, { synergy, sourceType: 'synergy' });
    return {};
  } });
  const appliedFlat = Math.min(threat * retaliationFactor * 0.45, flatReduction);
  result.reduction = Math.min(threat, appliedFlat + threat * (1 - retaliationFactor));
  for (const [uid, bonus] of vulnerabilityAdds) result.vulnerabilityMultipliers.set(uid, 1 + bonus);
  for (const [uid, rate] of commissions.growthRates) result.growthRates.set(uid, (result.growthRates.get(uid) || 0) + rate);
  for (const [uid, amount] of commissions.powerAdds) result.powerAdds.set(uid, (result.powerAdds.get(uid) || 0) + amount);
  for (const entry of attributedDamage) {
    const { effect, source, sourceType, rate, offense } = entry;
    const environmental = effect.attackType === 'environmental';
    const borrowed = effect.target === 'strongest' || effect.selection === 'strongest';
    const recipients = borrowed ? effectRecipientChances(state, source, effect, { power: baseline }) : new Map([[source?.uid, 1]]);
    for (const [uid, chance] of recipients) {
      if (!(chance > 0)) continue;
      const attacker = borrowed ? roster.find(unit => unit.uid === uid) : source;
      let amount = entry.amount;
      if (effect.per?.metric === 'sourcePower' || effect.scaleWithSourcePower || borrowed) {
        amount = expectedEffectAmountForAi(effect, { state, unit: attacker, star: source ? effectStar(state, source) : 1, trigger: effect.trigger, metricOverrides: (metric, filter) => metrics(metric, filter, attacker) });
        if (sourceType === 'character') amount = abilityEffectAmount(state, source, effect, amount);
      }
      const marked = roster.find(unit => isPolluted(state, unit.uid));
      const teamFactor = attacker && marked ? 1 - (1 - POLLUTION_ATTACK_MULTIPLIER) * (marked.uid === attacker.uid ? 1 : coDraw) : 1;
      const knownClause = attacker && !environmental ? unitPowerMultiplier(state, characterById(attacker.id), attacker, false) * teamFactor : 1;
      const encounterShare = Math.min(1, Math.max(1, state.spinsLeft) / Math.max(1, horizon));
      const damageClause = 1 - (1 - knownClause) * encounterShare;
      const attackerBonuses = environmental ? 1 : (result.vulnerabilityMultipliers.get(attacker?.uid) || 1) * (1 + (result.damageBonuses.get(attacker?.uid) || 0) + (effect.attackType === 'followUp' ? result.followUpBonuses.get(attacker?.uid) || 0 : 0));
      result.damage += amount * rate * chance * offense * damageClause * (effect.target === 'team' || effect.target === 'all' ? alive : 1) * attackerBonuses * (1 + Math.min(.75, result.enemyDamageBonus + (effect.attackType === 'followUp' ? result.enemyFollowUpBonus : 0)));
    }
  }
  if (enabled(state, 'credits')) result.economy += commissions.economy;
  result.flexibility += commissions.flexibility;
  result.commissionGrowthRates = commissions.growthRates;
  result.retirementAvailability = commissions.availability;
  result.retirementRate = commissions.completionRate;
  for (const { source, effect, amount, weight } of utilityForecasts) {
    const gained = forecastGrowthForAi(state, source, { horizon, draw, declaredRate: (result.growthRates.get(source.uid) || 0) - (commissions.growthRates.get(source.uid) || 0), commissionRate: commissions.growthRates.get(source.uid) || 0, growthMultiplier: result.growthMultiplier });
    if (!(gained > 0)) continue;
    if (effect.type === 'powerMultiplier' && [...amplifierMultipliers.values()].every(value => value >= 2.2 - 1e-9)) continue;
    if (effect.type === 'vulnerability' && [...vulnerabilityAdds.values()].every(value => value >= 0.75 - 1e-9)) continue;
    if (effect.type === 'retaliationMultiplier' && retaliationFactor <= 0.4 + 1e-9) continue;
    if (effect.type === 'retaliationFlat' && flatReduction >= threat * 0.45) continue;
    const trained = { ...source, attackBonus: (source.attackBonus ?? source.growth ?? 0) + gained };
    const futureAmount = amount * (combatBasePower(state, source) > 0 ? combatBasePower(state, trained) / combatBasePower(state, source) : 1);
    const delta = effect.type === 'retaliationMultiplier' ? amount - Math.max(0.05, futureAmount) : futureAmount - amount;
    result.utilityGrowth += Math.max(0, delta) * weight;
  }
  return result;
}

function rosterMetrics(state) {
  // A cleared encounter's clauses remain visible through its reward chain,
  // but cannot charge another pollution cost before the next floor resets them.
  if (state.pendingFloor) state = { ...state, activeDebuffs: [] };
  const roster = state.roster;
  const length = roster.length;
  const draw = Math.min(1, BOARD_SIZE / Math.max(1, length));
  const pair = 5.5 / 19 * Math.min(1, 19 / Math.max(1, length - 1));
  const horizon = futureHorizon(state);
  const commissionForecast = estimateRetirementsForAi(state, { horizon });
  const availability = unit => commissionForecast.availability.get(unit.uid) ?? 1;
  const encounterShare = Math.min(1, Math.max(1, state.spinsLeft) / horizon);
  const pollutionTarget = roster.find(unit => isPolluted(state, unit.uid));
  // Draws are without replacement. Given that another attacker is drawn,
  // 19 of the other N-1 instances fill the remaining board slots. For the
  // marked attacker itself, its appearance always triggers the team penalty.
  // Never use the previously displayed board as a prediction of the next one.
  const otherTriggerChance = length <= BOARD_SIZE ? 1 : (BOARD_SIZE - 1) / (length - 1);
  const expectedTeamFactor = unit => pollutionTarget ? 1 - (1 - POLLUTION_ATTACK_MULTIPLIER) * (unit.uid === pollutionTarget.uid ? 1 : otherTriggerChance) : 1;
  const synergies = getSynergies(state);
  const active = synergies.filter(synergy => synergy.active);
  const singles = count(roster, character => character.attack === 'single') * draw;
  const aoes = count(roster, character => character.attack === 'aoe') * draw;
  const nihility = count(roster, character => character.path === '虚无') * draw;
  const shieldSource = roster.reduce((sum, unit) => sum + (legacyKit(unit.id) ? ({ '1001': 3, '1104': 5, '1208': 6 }[unit.id] || 0) : 0) * star(unit) * utilityMultiplier(state, unit, 'shield') * availability(unit), 0) * draw;
  const baseOutput = roster.reduce((sum, unit) => sum + combatBasePower(state, unit, encounterShare) * (1 + (getCharacterAttributes(unit).permanentPercent || 0)) * attackFactor(state, getCharacterAttributes(unit).normalAttack, true), 0) * draw * expectedAttackPenalty(state, horizon, encounterShare);
  const declaredPotential = type => roster.reduce((sum, unit) => sum + (characterById(unit.id).effects || []).filter(e => !e.legacy && e.type === type).reduce((subtotal, e) => subtotal + (e.value || 0) * (e.scaleWithStars ? star(unit) : 1) * (e.chance ?? 1) / (e.every || 1), 0), 0) * draw;
  const temporary = roster.filter(unit => Number.isFinite(remainingAppearances(unit))).length;
  const retirementRate = temporary * draw / 3 + count(roster, (_, unit) => legacyKit(unit.id) && unit.id === '1108') * draw / 4 + declaredPotential('summon') + commissionForecast.completionRate;
  const progressRates = { damage: Math.max(1, baseOutput), spins: 1, single: singles, aoe: aoes, synergies: active.length,
    shield: shieldSource + declaredPotential('shield'), nihility, healing: declaredPotential('heal') + roster.reduce((sum, u) => sum + (legacyKit(u.id) ? ({ '1105': 3, '1203': 6 }[u.id] || 0) : 0) * star(u), 0) * draw,
    credits: (legacyHas(state, 'faith_bond') ? 3 : 0) + declaredPotential('resource') + (8 + state.floor * 3) / 5.5,
    rerolls: enabled(state, 'rerolls') ? Math.min(0.7, state.rerolls / horizon + 0.2) : 0,
    removals: enabled(state, 'removals') ? Math.min(0.25, state.removals / horizon + 0.08) : 0,
    creditsSpent: enabled(state, 'credits') ? Math.min(5, state.coins / horizon + 2) : 0,
    merges: Math.min(0.5, 0.05 + [...new Set(roster.map(u => `${u.id}:${u.stars}`))].filter(key => roster.filter(u => `${u.id}:${u.stars}` === key).length >= 2).length * 0.04),
    retirements: retirementRate, kills: Math.min(1, state.enemies.filter(e => e.hp > 0).length / Math.max(1, state.spinsLeft)) };
  let progressMultiplier = 1;
  for (const definition of [...state.items.map(itemById), ...state.essences.filter(entry => entry.triggered).map(entry => essenceById(entry.id))]) for (const e of definition.effects || []) if (!e.legacy && e.type === 'essenceProgressMultiplier') progressMultiplier *= e.value;
  const activations = {};
  for (const essence of state.essences) {
    const rates = { essence_elation: Math.max(1, baseOutput), essence_abundance: 1, essence_hunt: singles, essence_destruction: 1, essence_erudition: aoes,
      essence_harmony: active.length, essence_preservation: shieldSource, essence_nihility: nihility };
    const definition = essenceById(essence.id);
    const remaining = definition.target - essence.progress;
    const rate = (rates[essence.id] ?? progressRates[definition.progress?.metric] ?? 0) * progressMultiplier;
    const wait = rate > 0 ? remaining / rate : Infinity;
    activations[essence.id] = essence.triggered ? 1 : clamp((horizon - wait) / horizon, 0, 1);
  }
  const effect = id => legacyEssenceValue(activations, id);
  const harmonyWax = legacyHas(state, 'harmony_wax') ? 1.5 : 1;
  const kafkaBoost = roster.filter(unit => legacyKit(unit.id) && unit.id === '1005').reduce((sum, unit) => sum + star(unit), 0) * draw;
  const lightningCount = count(roster, character => character.element === '雷');
  const totalHp = state.enemies.filter(enemy => enemy.hp > 0).reduce((sum, enemy) => sum + enemy.hp, 0);
  const threat = Math.max(state.floor * 1.3 + 1.5, state.enemies.filter(enemy => enemy.hp > 0).reduce((sum, enemy) => sum + enemy.attack, 0) * 0.7, (state.enemyIntent?.damage || 0) * 0.7);
  let output = 0;
  let projected = 0;
  let shields = shieldSource;
  let healing = roster.reduce((sum, unit) => sum + (legacyKit(unit.id) ? ({ '1105': 3, '1203': 6 }[unit.id] || 0) : 0) * star(unit) * utilityMultiplier(state, unit, 'heal'), 0) * draw;
  let selfDrain = 0;
  let reduction = roster.filter(unit => legacyKit(unit.id) && unit.id === '1004').reduce((sum, unit) => sum + 2 * star(unit), 0) * draw;
  const declarative = estimateEffectsForAi(state, { horizon, activations, active, healing, shields, output: baseOutput, threat, retirementRate, commissionForecast });
  const armorBreaker = Math.min(1, count(roster, (_, unit) => legacyKit(unit.id) && ['1006', '1106'].includes(unit.id)) * draw + declarative.armorBreak);
  const buffs = roster.filter(unit => legacyKit(unit.id) && ['1009', '1101', '1106'].includes(unit.id));
  for (const unit of roster) {
    const character = characterById(unit.id);
    const multiplierStar = star(unit);
    const legacy = legacyKit(unit.id);
    let power = combatBasePower(state, unit, encounterShare);
    if (legacy && unit.id === '1013') power += 2 / 3 * multiplierStar;
    if (legacy && unit.id === '1204') power += multiplierStar;
    if (legacy && unit.id === '1003') power += retirementRate * 2 * multiplierStar;
    if (legacy && unit.id === '1006') power += multiplierStar;
    if (legacy && unit.id === '1103') power += Math.max(0, lightningCount - 1) * pair * multiplierStar;
    if (legacyHas(state, 'gold_coin')) power += 0.3;
    power += declarative.powerAdds.get(unit.uid) || 0;
    if (character.path === '虚无') power += kafkaBoost + (legacyHas(state, 'nihility_wax') ? 1 : 0) + effect('essence_nihility') * 1.5;
    power += effect('essence_destruction');
    if (character.attack === 'aoe') power += effect('essence_erudition');
    if (legacy && unit.id === '1109') power += Math.min(1, temporary * pair) * 4 * multiplierStar;
    if (legacy && unit.id === '1201') power *= 1.6;
    if (legacy && unit.id === '1008' && state.hp <= state.maxHp / 2) power *= 2;
    for (const buffer of buffs) {
      if (buffer.uid !== unit.uid && (buffer.id !== '1106' || character.element === '冰')) power += (buffer.id === '1009' ? 0.5 : 1) * star(buffer) * pair * harmonyWax * utilityMultiplier(state, buffer, 'buff') * (declarative.buffMultipliers.get(buffer.uid) || 1) * availability(buffer);
    }
    let multiplier = ((declarative.powerMultipliers.get(unit.uid) || 1) + (getCharacterAttributes(unit).permanentPercent || 0)) * (declarative.vulnerabilityMultipliers.get(unit.uid) || 1) * (1 + (declarative.damageBonuses.get(unit.uid) || 0)) * (1 + declarative.enemyDamageBonus) * expectedAttackPenalty(state, horizon, encounterShare);
    if (legacyHas(state, 'doctor_robe') && unit.stars > 1) multiplier *= 1.2;
    if (legacyHas(state, 'broken_clock')) multiplier *= 1.2;
    if (legacyHas(state, 'cosmic_lotto')) multiplier *= 1.1;
    multiplier *= 1 + 0.15 * effect('essence_elation');
    multiplier *= 1 + 0.1 * effect('essence_harmony');
    if (character.attack === 'single') multiplier *= (legacyHas(state, 'hunt_wax') ? 1.3 : 1) * (1 + 0.35 * effect('essence_hunt'));
    if (character.attack === 'blast' && legacyHas(state, 'destruction_wax')) multiplier *= 1.25;
    if (character.attack === 'aoe' && legacyHas(state, 'erudition_wax')) multiplier *= 1.25;
    // Published clauses last for the current encounter; future encounters are
    // unknown. Weight their known effect by the remaining encounter horizon.
    const knownEncounterMultiplier = unitPowerMultiplier(state, character, unit, false) * expectedTeamFactor(unit);
    multiplier *= 1 - (1 - knownEncounterMultiplier) * encounterShare;
    let factor = attackFactor(state, getCharacterAttributes(unit).normalAttack, true) * 0.7 + attackFactor(state, getCharacterAttributes(unit).normalAttack) * 0.3;
    if (legacy && unit.id === '1102') factor += 0.2;
    if (state.enemySkill?.id === 'armor' && armorBreaker < 1) power = Math.max(0, power - 0.3 * (1 - armorBreaker));
    if (legacy && unit.id === '1208') reduction += threat * 0.2 * draw;
    if (legacy && unit.id === '1205') selfDrain += 2 * multiplierStar * draw;
    // Pollution ends with this encounter; Blade's self-cost persists. The
    // next-spin simulation separately checks lethal pollution before healing.
    if (isPolluted(state, unit.uid)) selfDrain += 6 * draw * encounterShare;
    output += power * multiplier * factor * draw * availability(unit);
    projected += (power + forecastGrowthForAi(state, unit, { horizon, draw, declaredRate: (declarative.growthRates.get(unit.uid) || 0) - (declarative.commissionGrowthRates.get(unit.uid) || 0), commissionRate: declarative.commissionGrowthRates.get(unit.uid) || 0, growthMultiplier: declarative.growthMultiplier })) * multiplier * factor * draw * availability(unit);
  }
  // Tingyun's directed buff always finds another unit; it does not need adjacency.
  // The directed recipient varies by the future board. Its added attack power
  // uses the population trigger estimate; the natural buff itself is unchanged.
  const directedTeamFactor = pollutionTarget ? 1 - (1 - POLLUTION_ATTACK_MULTIPLIER) * draw * encounterShare : 1;
  const directed = roster.filter(unit => legacyKit(unit.id) && unit.id === '1202').reduce((sum, unit) => sum + 2 * star(unit) * utilityMultiplier(state, unit, 'buff') * (declarative.buffMultipliers.get(unit.uid) || 1), 0) * draw * harmonyWax * 3.7 * directedTeamFactor;
  if (roster.length > 1) { output += directed; projected += directed; }
  output += declarative.damage;
  projected += declarative.damage;
  shields += declarative.shields;
  healing += declarative.healing;
  reduction += declarative.reduction;
  selfDrain += declarative.selfDrain;
  if (legacyHas(state, 'dimension_dice')) healing += 2;
  if (legacyHas(state, 'insect_web')) healing += retirementRate * 2;
  healing *= (legacyHas(state, 'abundance_wax') ? 1.5 : 1) * declarative.healMultiplier;
  shields *= (legacyHas(state, 'preservation_wax') ? 1.5 : 1) * (1 + effect('essence_preservation') * 0.3) * declarative.shieldMultiplier;
  if (legacyHas(state, 'preservation_wax')) shields += 8 / 4;
  shields += effect('essence_preservation') * 12 / 4;
  const overflow = roster.filter(unit => legacyKit(unit.id) && unit.id === '1203').reduce((sum, unit) => sum + 6 * star(unit), 0) * draw;
  if (state.hp / state.maxHp > 0.8) shields += overflow * 0.6;
  const danger = 1 + (1 - state.hp / state.maxHp) * 1.7;
  const remainingThreat = Math.max(0, threat - reduction);
  const shieldUseful = Math.min(shields, remainingThreat + Math.max(0, 60 - state.shield) / 10);
  // Shielding cannot pay self-inflicted HP costs. Healers can replenish that
  // deficit (pollution is deducted before all utility; Blade and healers resolve
  // in board order). This is a sustained-turn estimate; shared spin trials keep
  // the real order, healing cap and pre-healing death behavior.
  const healUseful = Math.min(Math.max(0, healing), Math.max(0, remainingThreat - shields - state.shield / horizon) + selfDrain + (state.maxHp - state.hp) / 5);
  const defense = (shieldUseful + healUseful + Math.min(reduction, threat) - selfDrain) * danger
    + (state.hp + Math.min(state.shield, 60) + (state.maxHp - 100) * 0.4) * 0.08
    + effect('essence_abundance') * (20 + state.maxHp - state.hp) * 0.08;
  let synergyPotential = 0;
  for (const synergy of synergies) {
    const next = synergy.thresholds.find(threshold => threshold > synergy.count);
    if (!next || synergy.count === 0) continue;
    const remaining = next - synergy.count;
    const members = roster.filter(unit => characterById(unit.id)[synergy.kind] === synergy.tag);
    synergyPotential += members.reduce((sum, unit) => sum + characterById(unit.id).power * star(unit), 0) * draw * 0.12 / remaining;
  }
  const economy = enabled(state, 'credits') ? (((legacyHas(state, 'faith_bond') ? 3 : 0) + (legacyHas(state, 'angel_debt') ? 2 : 0) + (legacyHas(state, 'insect_web') ? retirementRate * 4 : 0) + declarative.economy) * Math.max(0.35, output / 80) + Math.log1p(state.coins) * 0.25) : 0;
  const flexibility = (legacyHas(state, 'fortune_glue') ? 3 * clamp(horizon / 15, 0, 1) : 0) + (enabled(state, 'rerolls') && legacyHas(state, 'chaos_trametes') ? 1.4 : 0)
    + (enabled(state, 'removals') && legacyHas(state, 'angel_debt') && length >= 18 ? 1.4 : 0) + (enabled(state, 'rerolls') ? effect('essence_harmony') * 0.6 + (legacyHas(state, 'broken_clock') ? 0.4 : 0) + Math.log1p(state.rerolls) * 0.2 : 0) + (enabled(state, 'removals') ? Math.log1p(state.removals) * 0.25 : 0) + declarative.flexibility;
  return { damage: output, defense, growth: projected - output + declarative.utilityGrowth, synergy: synergyPotential, economy,
    tempo: (legacyHas(state, 'seal_stamp') ? output / 5.5 : 0) + declarative.tempo, flexibility,
    dilution: -Math.max(0, length - BOARD_SIZE) * output / Math.max(length, 1) * 0.1,
    totalHp, shields, healing, reduction, selfDrain, threat, horizon, active, draw };
}

function value(metrics, profile) {
  return ['damage', 'defense', 'growth', 'synergy', 'economy', 'tempo', 'flexibility', 'dilution'].reduce((sum, key) => sum + metrics[key] * profile.weights[key], 0);
}

function safeReady(state) {
  let result = state;
  for (let guard = 0; guard < 4 && REWARD_PHASES.includes(result.phase); guard++) result = skipReward(result);
  return result;
}

function trialValue(state, profile, scale, resolved = null) {
  if (state.phase !== 'ready') return 0;
  const next = resolved || spin(state);
  let result = next.lastSpin.damage;
  result += ((next.hp - state.hp) + Math.min(50, next.shield) - Math.min(50, state.shield)) * profile.weights.defense * (1 + (1 - state.hp / state.maxHp) * 2);
  if (next.phase === 'defeat') result -= scale * 1.5;
  if (next.phase === 'victory' || next.pendingFloor) result += scale * 0.25;
  return result;
}

// A bounded budget for the remaining encounter, using already sampled public
// counterfactual outcomes. It does not predict rewards or inspect the real RNG.
export function forecastEncounterSurvival(state, metrics, outcomes, baselineDamage) {
  const cleared = next => next.hp > 0 && (next.phase === 'victory' || next.pendingFloor || next.floor > state.floor);
  if (outcomes.length && outcomes.every(cleared)) return { clearsNow: true, needsDefense: false, projectedHp: Math.min(...outcomes.map(next => next.hp)) };
  const average = selector => outcomes.reduce((sum, next) => sum + selector(next), 0) / Math.max(1, outcomes.length);
  const directHpCost = average(next => Math.max(0, next.resourceStats.hpLost - state.resourceStats.hpLost - Math.max(0, next.lastSpin.incoming - (next.resourceStats.shieldBlocked - state.resourceStats.shieldBlocked))));
  const selfCost = Math.max(metrics.selfDrain, directHpCost);
  const naturalHealing = Math.max(0, metrics.healing);
  const naturalShield = Math.max(0, (metrics.shields + average(next => next.lastSpin.shield)) / 2);
  const damage = Math.max(1, baselineDamage);
  const buffer = Math.max(1, selfCost + Math.min(5, metrics.threat * 0.15));
  let worst = state.maxHp;
  for (const next of outcomes) {
    if (cleared(next)) { worst = Math.min(worst, next.hp); continue; }
    let hp = next.hp, shield = next.shield;
    const remainingHp = next.enemies.reduce((sum, enemy) => sum + enemy.hp, 0);
    const turns = Math.min(Math.max(0, state.spinsLeft - 1), Math.ceil(remainingHp / damage));
    for (let turn = 1; turn <= turns && hp > 0; turn++) {
      if (state.activeDebuffs.some(effect => effect.id === 'shield_decay')) shield *= 0.8;
      hp -= selfCost; // Shields cannot pay poison or a character's life cost.
      if (hp <= 0) break;
      hp = Math.min(state.maxHp, hp + naturalHealing);
      shield = Math.min(state.maxHp * 2, shield + naturalShield);
      // Later kills reduce incoming pressure; retain at least half of the
      // sampled retaliation rather than assuming every column stays alive.
      const incoming = next.lastSpin.incoming * (1 - 0.5 * turn / Math.max(1, turns));
      const piercing = state.activeDebuffs.some(effect => effect.id === 'shield_pierce') ? incoming * 0.25 : 0;
      const blocked = Math.min(shield, incoming - piercing);
      shield -= blocked;
      hp -= incoming - blocked;
    }
    worst = Math.min(worst, hp);
  }
  return { clearsNow: false, needsDefense: worst <= buffer, projectedHp: worst, buffer, selfCost };
}

function mergeBonus(state, id, next) {
  if (state.phase !== 'recruit') return 0;
  const same = state.roster.filter(unit => unit.id === id);
  const ones = same.filter(unit => unit.stars === 1).length;
  const twos = same.filter(unit => unit.stars === 2).length;
  const power = characterById(id).power;
  const merges = next.stats.merges - state.stats.merges;
  if (merges) return (4 + power * 1.5) * merges + (state.roster.length > 17 ? 3 : 0);
  if (ones === 1) return 1.4 + power * 0.4 + (twos === 2 ? 3 : 0);
  if (ones === 0 && twos === 2) return 1;
  return 0;
}

function reasonFor(state, id, next, previousMetrics, nextMetrics) {
  if (state.phase === 'recruit') {
    const character = characterById(id);
    const explanations = [];
    const merges = next.stats.merges - state.stats.merges;
    if (merges) explanations.push(merges > 1 ? '可连锁合成三星，压缩编队' : '可立即三合一升星');
    const before = new Map(previousMetrics.active.map(synergy => [synergy.id, synergy.tier]));
    const unlocked = nextMetrics.active.filter(synergy => synergy.tier > (before.get(synergy.id) || 0));
    if (unlocked.length) explanations.push(`激活/升级${unlocked.slice(0, 2).map(synergy => synergy.name).join('、')}`);
    if (!explanations.length && state.roster.filter(unit => unit.id === id && unit.stars === 1).length === 1) explanations.push('凑成两张，为升星保留目标');
    if (growthRate(id) || character.effects?.some(e => !e.legacy && ['growth', 'attackGrowth'].includes(e.type))) explanations.push('永久提高攻击力，剩余轮次越多越有利');
    if (character.attack === 'aoe' && state.mode === 'combat') explanations.push('群体攻击覆盖多列');
    if (character.role && character.role !== 'attack') {
      const roleReasons = { defense: '按相邻角色与承伤缺口补足防御', amplifier: '按公开标签与位置提供攻击力或伤害增幅', trainer: '永久提高指定角色攻击力，收益随剩余轮次兑现', disruptor: '估算敌方受伤提高与减伤的实际覆盖' };
      explanations.push(roleReasons[character.role]);
    } else if (character.attack === 'support') explanations.push(character.path === '同谐' ? '提高角色攻击力' : nextMetrics.defense > previousMetrics.defense + 1 ? '补充治疗/防御，降低失守风险' : '治疗收益受当前生命与防御影响');
    if (next.roster.length > BOARD_SIZE) explanations.push('编队超过20人，考虑抽取稀释');
    if (!explanations.length) {
      const ability = character.effects?.find(e => !e.legacy);
      if (ability?.summary) explanations.push(ability.summary);
    }
    return explanations.slice(0, 2).join('；') || '比较实际攻击、羁绊与后续属性收益';
  }
  const explanations = {
    faith_bond: enabled(state, 'credits') ? '每轮信用点可用于补给或付费重掷' : '信用点消费已停用，本件的经济收益无法支出',
    seal_stamp: '后续每层多一轮，提高期限内输出空间',
    fortune_glue: '剩余招募越多，稀有角色权重提升越有价值',
    doctor_robe: '按当前升星角色占比估算增益',
    harmony_wax: '按辅助增益人数与棋盘相邻概率估算',
    abundance_wax: '按生命缺口与治疗来源估算，避免治疗溢出',
    preservation_wax: '按护盾来源和敌方威胁估算，考虑护盾上限',
    rubert_gear: '按永久攻击力提升来源和剩余轮次估算',
    essence_abundance: '累计六轮后提高生命上限并大幅治疗，仍受医疗条款影响',
    essence_destruction: '八轮后全队增益，考虑剩余轮次',
    essence_preservation: '按护盾获取速度估算触发时间与防御收益',
    essence_harmony: '生效羁绊越多，触发越快',
  };
  const definition = state.phase === 'essence' ? essenceById(id) : itemById(id);
  const ability = definition?.effects?.find(e => !e.legacy);
  return explanations[id] || (ability?.summary ? `${ability.summary}；结合触发条件与剩余轮次估值` : state.phase === 'essence' ? '估算触发速度、剩余轮次与当前编队增益' : '按当前编队、模式和剩余轮次比较收益');
}

function skipReasonFor(state, candidates, skip) {
  const bestRewardScore = Math.max(...candidates.filter(candidate => candidate.action === 'choose').map(candidate => candidate.score));
  if (state.phase === 'recruit') {
    if (skip.score >= bestRewardScore) return '保留现有阵容，避免低收益招募或上场稀释';
    return state.roster.length >= BOARD_SIZE ? '保留编队人数，与招募、合成和上场收益一起比较' : '本轮不新增角色，保留现有阵容继续下一轮';
  }
  if (state.phase === 'item') return skip.score >= bestRewardScore ? '当前奇物收益有限，暂时保留现有构筑' : '会放弃本次奇物，已与取得候选的收益一起比较';
  return skip.score >= bestRewardScore ? '本轮不追加精华，候选触发收益与剩余轮次有限' : '会放弃本次精华，已比较触发速度与后续收益';
}

export function recommendRewards(state, { profile = DEFAULT_PROFILE, lookahead = true } = {}) {
  const policy = policyFor(state, profile);
  const empty = { version: policy.version, policyVersion: POLICY_VERSION, phase: state?.phase || '', choices: [], entropy: 0 };
  if (!state || state.mode !== 'combat' || !REWARD_PHASES.includes(state.phase) || !Array.isArray(state.choices) || !state.choices.length) return empty;
  const digest = publicDigest(state);
  const cacheKey = `${digest}/${JSON.stringify(policy)}/${lookahead}`;
  const cached = rewardCache.get(state);
  if (cached?.key === cacheKey) return cached.result;
  const original = structuredClone(state);
  original.rngState = hash(`${digest}/counterfactual`);
  const baseline = safeReady(skipReward(original));
  const baseMetrics = rosterMetrics(baseline);
  const baseValue = value(baseMetrics, policy);
  const candidates = state.choices.map((id, index) => {
    const candidate = safeReady(chooseReward(original, index));
    const metrics = rosterMetrics(candidate);
    const score = value(metrics, policy) + mergeBonus(state, id, candidate) * policy.weights.merge;
    return { id, index, action: 'choose', candidate, metrics, score, reason: reasonFor(state, id, candidate, baseMetrics, metrics) };
  });
  // Skipping is the actual engine transition, valued in the same units as taking
  // a reward. It competes in the same softmax, without a fixed chance or penalty.
  const skip = { id: 'skip', index: state.choices.length, action: 'skip', candidate: baseline, metrics: baseMetrics, score: baseValue, reason: '' };
  candidates.push(skip);
  if (lookahead && policy.lookaheadSamples > 0 && policy.weights.lookahead > 0) {
    const scale = Math.max(12, baseMetrics.damage);
    for (let sample = 0; sample < policy.lookaheadSamples; sample++) {
      const trialSeed = hash(`${digest}/board/${sample}`);
      for (const candidate of candidates) candidate.score += trialValue({ ...candidate.candidate, rngState: trialSeed }, policy, scale) / policy.lookaheadSamples * policy.weights.lookahead;
    }
  }
  // Keep exported scores as marginal gains over skipping. This common shift
  // leaves softmax unchanged: zero gain is not zero selection probability.
  const skipValue = skip.score;
  for (const candidate of candidates) candidate.score -= skipValue;
  skip.reason = skipReasonFor(state, candidates, skip);
  const max = Math.max(...candidates.map(candidate => candidate.score));
  const masses = candidates.map(candidate => Math.exp(clamp((candidate.score - max) / policy.temperature, -20, 0)));
  const total = masses.reduce((sum, mass) => sum + mass, 0);
  const choices = candidates.map((candidate, index) => ({ index: candidate.index, id: candidate.id, action: candidate.action, score: candidate.score, probability: masses[index] / total, reason: candidate.reason }));
  choices.forEach(Object.freeze);
  Object.freeze(choices);
  const result = Object.freeze({ version: policy.version, policyVersion: POLICY_VERSION, phase: state.phase, choices, entropy: -choices.reduce((sum, choice) => sum + choice.probability * Math.log(choice.probability), 0) });
  rewardCache.set(state, { key: cacheKey, result });
  return result;
}

export function sampleRecommendation(recommendation, randomNumber) {
  const choices = recommendation?.choices || [];
  if (!choices.length) return -1;
  const pick = clamp(Number.isFinite(randomNumber) ? randomNumber : 0, 0, 1 - Number.EPSILON);
  let cumulative = 0;
  for (const choice of choices) {
    cumulative += choice.probability;
    if (pick < cumulative) return choice.index;
  }
  return choices[choices.length - 1].index;
}

export function recommendRemoval(state, { profile = DEFAULT_PROFILE, lookahead = true } = {}) {
  if (!state || state.mode !== 'combat' || !enabled(state, 'removals') || !['ready', ...REWARD_PHASES].includes(state.phase) || state.removals <= 0 || state.roster.length <= 1) return null;
  const policy = policyFor(state, profile);
  const digest = publicDigest(state);
  const cacheKey = `${digest}/${state.roster.map(unit => unit.uid).join(',')}/${JSON.stringify(policy)}/${lookahead}`;
  const cached = removalCache.get(state);
  if (cached?.key === cacheKey) return cached.uid;
  const currentMetrics = rosterMetrics(state);
  const originalValue = value(currentMetrics, policy);
  // A saved charge can repair a later draft. Removing a pair also sacrifices
  // a near-term merge target, even when its current output is modest.
  const minimumGain = 0.65 + Math.min(2.5, Math.max(0, 12 - state.floor) * 0.12) / state.removals;
  const pollution = !state.pendingFloor && state.activeDebuffs.find(effect => effect.id === 'rift_pollution');
  const threatened = pollution && state.hp <= 6;
  const proposals = [];
  for (const unit of state.roster) {
    if (unit.temporary) continue;
    const same = state.roster.filter(other => !other.temporary && other.id === unit.id && other.stars === unit.stars).length;
    const next = { ...state, roster: state.roster.filter(other => other.uid !== unit.uid) };
    // If this offer can resolve a polluted pair by merging, preserve that useful
    // option instead of automatically spending a removal on the marked unit.
    const immediateMerge = state.phase === 'recruit' && unit.stars === 1 && same === 2 && state.choices.includes(unit.id);
    const mergeOption = unit.stars < 3 && same === 2 ? policy.weights.merge * (immediateMerge ? 7 + characterById(unit.id).power : 2.5) * star(unit) : 0;
    const gain = value(rosterMetrics(next), policy) - originalValue - mergeOption;
    // Pollution kills before any character can heal. Its marked instance must
    // be considered even if a static long-term model likes its synergies.
    if (!immediateMerge && threatened && unit.uid === pollution.targetUid) proposals.push({ uid: unit.uid, gain, urgent: true });
    else if (gain > minimumGain) proposals.push({ uid: unit.uid, gain, urgent: false });
  }
  proposals.sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.gain - a.gain);
  const candidates = proposals.slice(0, 4);
  let best = { uid: null, gain: minimumGain };
  if (candidates.length) {
    const original = { ...structuredClone(state), rngState: hash(`${digest}/removal-future`) };
    const baseline = safeReady(original);
    const scale = Math.max(12, currentMetrics.damage);
    const samples = lookahead ? Math.max(3, policy.lookaheadSamples) : 1;
    const baselineTrials = Array.from({ length: samples }, (_, sample) => trialValue({ ...baseline, rngState: hash(`${digest}/removal-board/${sample}`) }, policy, scale));
    for (const candidate of candidates) {
      const after = safeReady(removeSymbol(original, candidate.uid));
      const differences = baselineTrials.map((before, sample) => trialValue({ ...after, rngState: hash(`${digest}/removal-board/${sample}`) }, policy, scale) - before);
      const mean = differences.reduce((sum, difference) => sum + difference, 0) / samples;
      const standardError = samples > 1 ? Math.sqrt(differences.reduce((sum, difference) => sum + (difference - mean) ** 2, 0) / (samples - 1) / samples) : 0;
      // A short sample is not a confidence guarantee. One standard error and a
      // saved-token cost make irreversible roster changes conservative; merely
      // winning an approximate static comparison is insufficient.
      if (mean - standardError <= 0) continue;
      const gain = candidate.gain + mean * policy.weights.lookahead - standardError;
      if ((candidate.urgent || gain > best.gain) && (best.uid === null || gain > best.gain)) best = { uid: candidate.uid, gain };
    }
  }
  removalCache.set(state, { key: cacheKey, uid: best.uid });
  return best.uid;
}

const expectedRewardGain = recommendation => recommendation.choices.reduce((sum, choice) => sum + choice.probability * choice.score, 0);

function rerollPlan(state, profile) {
  if (!REWARD_PHASES.includes(state.phase) || !enabled(state, 'rerolls')) return null;
  const free = state.rerolls > 0;
  if (!free && (!enabled(state, 'credits') || state.coins < 8)) return null;
  const digest = publicDigest(state);
  const current = expectedRewardGain(recommendRewards(state, { profile, lookahead: false }));
  const estimates = [];
  // Sample new offers with an independent observable-state seed. Never inspect
  // the real next reroll RNG, and do not nest Monte Carlo spin lookahead here.
  for (let sample = 0; sample < 3; sample++) {
    const counterfactual = { ...state, rngState: hash(`${digest}/unknown-offer/${sample}`) };
    const renewed = rerollRewards(counterfactual);
    if (renewed === counterfactual) return null;
    estimates.push(expectedRewardGain(recommendRewards(renewed, { profile, lookahead: false })));
  }
  const mean = estimates.reduce((sum, estimate) => sum + estimate, 0) / estimates.length;
  const standardError = Math.sqrt(estimates.reduce((sum, estimate) => sum + (estimate - mean) ** 2, 0) / estimates.length) / Math.sqrt(estimates.length);
  const metrics = rosterMetrics(state);
  const reserve = enabled(state, 'defense') && state.hp < state.maxHp * 0.55 ? 12 : state.floor >= 3 ? 16 : 8;
  if (!free && state.coins < 8 + reserve) return null;
  const futureValue = Math.max(1.2, Math.max(0, mean) * 0.22) * Math.min(1, metrics.horizon / 14) * (state.rerolls <= 1 ? 1.25 : state.rerolls > 3 ? 0.55 : 1);
  const creditValue = Math.max(0.25, metrics.damage / 100) * Math.max(0.25, profile.weights.economy);
  const opportunityCost = free ? futureValue : 8 * creditValue;
  const gain = mean - current - opportunityCost - standardError * 0.25;
  if (gain <= 0.35) return null;
  return { type: 'reroll', reason: `独立试算新候选的预计收益更高，${free ? '使用免费重掷' : '保留补给预算后支付 8 信用点'}`, estimatedGain: gain, cost: free ? 0 : 8 };
}

function supplyPlan(state, profile, lookahead) {
  if (state.phase !== 'ready' || !enabled(state, 'credits') || state.supplyPurchases >= 2 || state.coins < 10 || !engine.purchaseSupply) return null;
  const metrics = rosterMetrics(state);
  const danger = 1 + (1 - state.hp / state.maxHp) * 2;
  const creditValue = Math.max(0.25, metrics.damage / 100) * Math.max(0.25, profile.weights.economy);
  const digest = publicDigest(state);
  const samples = lookahead ? 2 : 1;
  const scale = Math.max(12, metrics.damage);
  let baseline = 0;
  const beforeTrials = [];
  for (let sample = 0; sample < samples; sample++) {
    const trial = { ...state, rngState: hash(`${digest}/supply-board/${sample}`) };
    const resolved = spin(trial);
    beforeTrials.push(resolved);
    baseline += trialValue(trial, profile, scale, resolved) / samples;
  }
  const baselineDamage = beforeTrials.reduce((sum, next) => sum + next.lastSpin.damage, 0) / samples;
  let best = null;
  for (const kind of SUPPLY_KINDS) {
    if (kind !== 'overclock' && !enabled(state, 'defense')) continue;
    const gap = state.maxHp - state.hp;
    if (kind === 'repair' && (gap < 8 || (state.hp > metrics.threat * 2 && metrics.healing >= metrics.threat + gap / 3))) continue;
    if (kind === 'barrier' && (state.shield >= metrics.threat * 2 || (state.hp > state.maxHp * 0.7 && metrics.threat * 2 <= state.shield + metrics.shields * 2 + state.hp * 0.15))) continue;
    const purchased = engine.purchaseSupply(state, kind);
    if (purchased === state) continue;
    let after = 0;
    const afterTrials = [];
    for (let sample = 0; sample < samples; sample++) {
      const trial = { ...purchased, rngState: hash(`${digest}/supply-board/${sample}`) };
      const resolved = spin(trial);
      afterTrials.push(resolved);
      after += trialValue(trial, profile, scale, resolved) / samples;
    }
    if (kind === 'overclock' && enabled(state, 'defense') && profile.weights.defense > 0 && state.supplyPurchases === 1 && state.spinsLeft > 1) {
      const survival = forecastEncounterSurvival(purchased, metrics, afterTrials, baselineDamage);
      if (!survival.clearsNow && survival.needsDefense) continue;
    }
    const acquiredDefense = purchased.hp - state.hp + Math.min(purchased.shield, metrics.threat * 2) - Math.min(state.shield, metrics.threat * 2);
    const cost = state.coins - purchased.coins;
    const gain = after - baseline + acquiredDefense * profile.weights.defense * danger - cost * creditValue;
    if (gain > 0.5 && (!best || gain > best.estimatedGain)) best = { type: 'supply', kind, cost, estimatedGain: gain, reason: kind === 'overclock' ? '试算超频能改善本轮输出，避免期限失守' : kind === 'repair' ? '补充当前生命缺口，收益高于保留这笔信用点' : '当前护盾不足以覆盖反击，补充实际防御' };
  }
  return best;
}

/** One shared planner for live autoplay and headless campaigns. Reward sampling
 * remains outside the planner and uses its returned, unrounded recommendation. */
export function recommendAction(state, { profile = DEFAULT_PROFILE, lookahead = true } = {}) {
  const policy = policyFor(state, profile);
  const metadata = { policyVersion: POLICY_VERSION, version: policy.version };
  if (!state || state.mode !== 'combat' || !['ready', ...REWARD_PHASES].includes(state.phase)) return { ...metadata, type: 'stop', reason: '当前旅程没有可执行的开拓动作' };
  const key = `${publicDigest(state)}/${state.roster.map(unit => unit.uid).join(',')}/${JSON.stringify(policy)}/${lookahead}`;
  const cached = actionCache.get(state);
  if (cached?.key === key) return cached.result;
  let action;
  const uid = recommendRemoval(state, { profile: policy, lookahead });
  if (uid) action = { type: 'remove', uid, reason: !state.pendingFloor && isPolluted(state, uid) ? '清理该污染实例的生命与本人/全队伤害损失更划算，已比较技能、羁绊和合成机会' : '精简后的预计整体收益更高，已保留合成目标与羁绊价值' };
  else if (REWARD_PHASES.includes(state.phase)) {
    action = rerollPlan(state, policy) || { type: 'reward', reason: '领取或跳过当前奖励，按完整推荐分布抽样', recommendation: recommendRewards(state, { profile: policy, lookahead }) };
  } else action = supplyPlan(state, policy, lookahead) || { type: 'spin', reason: '当前无需有效补给或移除，继续本层战斗' };
  const result = Object.freeze({ ...metadata, ...action });
  actionCache.set(state, { key, result });
  return result;
}

export function evaluateRun(state) {
  if (!state) return 0;
  const cleared = state.phase === 'victory' ? 12 : Math.max(0, state.floor - 1);
  const withinFloor = 1 - state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0) / Math.max(1, state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0));
  const win = state.phase === 'victory' ? 1800 : 0;
  const health = state.hp + Math.min(state.shield, 80) * 0.15;
  const bank = Math.log1p(Math.max(0, state.coins)) * 2;
  return cleared * 1000 + (state.phase === 'victory' ? 0 : clamp(withinFloor, 0, 1) * 700) + win + health + bank - state.stats.spins * 3;
}
