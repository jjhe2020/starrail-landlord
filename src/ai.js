import { characterById, essenceById } from './content.js';
import * as engine from './engine.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { unitPowerMultiplier, utilityMultiplier, isPolluted, POLLUTION_ATTACK_MULTIPLIER } from './enemy-effects.js';
const { BOARD_SIZE, STAR_MULTIPLIERS, chooseReward, skipReward, spin, getSynergies, rerollRewards, removeSymbol } = engine;

export { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
// Algorithm version is independent from a saved profile's reusable model weights.
export const POLICY_VERSION = 'resource-actions-v5';
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
const has = (state, id) => state.items.includes(id);
const star = unit => STAR_MULTIPLIERS[unit.stars] || 1;
const growthRate = id => id === '1002' ? 1 / 3 : id === '1107' ? 0.5 : id === '1205' ? 0.5 : 0;
const count = (roster, predicate) => roster.reduce((sum, unit) => sum + (predicate(characterById(unit.id), unit) ? 1 : 0), 0);

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
    state.roster.map(unit => [unit.id, unit.stars, unit.growth, unit.ticks, unit.temporary || 0]), state.items, state.essences,
    state.enemies.map(enemy => [enemy.col, enemy.hp, enemy.attack]), state.enemySkill?.id, state.pendingFloor]);
}

function futureHorizon(state) {
  return clamp(state.spinsLeft + Math.max(0, 12 - state.floor) * 3.2, 3, 24);
}

function attackFactor(state, attack, future = false) {
  if (attack === 'support') return 0;
  if (attack === 'single') return 3;
  const enemies = state.enemies.filter(enemy => enemy.hp > 0);
  const averageAlive = future ? Math.max(enemies.length, 4) : Math.max(1, enemies.length);
  if (attack === 'aoe') return averageAlive;
  if (future) return 3.6;
  let total = 0;
  for (let col = 0; col < 5; col++) {
    const target = enemies.slice().sort((a, b) => Math.abs(a.col - col) - Math.abs(b.col - col) || a.col - b.col)[0];
    total += 2 + (target ? enemies.filter(enemy => Math.abs(enemy.col - target.col) === 1).length : 0);
  }
  return total / 5;
}

function bonus(synergy) {
  if (!synergy.active) return 0;
  if (synergy.id === 'hunters') return synergy.tier === 2 ? 0.4 : 0.2;
  if (['hunt', 'abundance', 'fire', 'physical', 'imaginary'].includes(synergy.id)) return 0.25;
  if (['station', 'preservation', 'harmony', 'ice', 'lightning', 'wind', 'quantum'].includes(synergy.id)) return synergy.tier === 2 ? 0.3 : 0.15;
  return synergy.tier === 2 ? 0.35 : 0.15;
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
  const shieldSource = roster.reduce((sum, unit) => sum + ({ '1001': 3, '1104': 5, '1208': 6 }[unit.id] || 0) * star(unit) * utilityMultiplier(state, unit, 'shield'), 0) * draw;
  const baseOutput = roster.reduce((sum, unit) => sum + (characterById(unit.id).power * star(unit) + unit.growth) * attackFactor(state, characterById(unit.id).attack, true), 0) * draw;
  const activations = {};
  for (const essence of state.essences) {
    const rates = { essence_elation: Math.max(1, baseOutput), essence_abundance: 1, essence_hunt: singles, essence_destruction: 1, essence_erudition: aoes,
      essence_harmony: active.length, essence_preservation: shieldSource, essence_nihility: nihility };
    const remaining = essenceById(essence.id).target - essence.progress;
    const wait = remaining / Math.max(0.01, rates[essence.id]);
    activations[essence.id] = essence.triggered ? 1 : clamp((horizon - wait) / horizon, 0, 1);
  }
  const effect = id => activations[id] || 0;
  const harmonyWax = has(state, 'harmony_wax') ? 1.5 : 1;
  const kafkaBoost = roster.filter(unit => unit.id === '1005').reduce((sum, unit) => sum + star(unit), 0) * draw;
  const lightningCount = count(roster, character => character.element === '雷');
  const temporary = roster.filter(unit => unit.temporary).length;
  const retirementRate = temporary * draw / 3 + count(roster, (_, unit) => unit.id === '1108') * draw / 4;
  const totalHp = state.enemies.filter(enemy => enemy.hp > 0).reduce((sum, enemy) => sum + enemy.hp, 0);
  const threat = Math.max(state.floor * 1.3 + 1.5, state.enemies.filter(enemy => enemy.hp > 0).reduce((sum, enemy) => sum + enemy.attack, 0) * 0.7, (state.enemyIntent?.damage || 0) * 0.7);
  let output = 0;
  let projected = 0;
  let shields = shieldSource;
  let healing = roster.reduce((sum, unit) => sum + ({ '1105': 3, '1203': 6 }[unit.id] || 0) * star(unit) * utilityMultiplier(state, unit, 'heal'), 0) * draw;
  let selfDrain = 0;
  let reduction = roster.filter(unit => unit.id === '1004').reduce((sum, unit) => sum + 2 * star(unit), 0) * draw;
  const armorBreaker = count(roster, (_, unit) => ['1006', '1106'].includes(unit.id)) * draw;
  const buffs = roster.filter(unit => ['1009', '1101', '1106'].includes(unit.id));
  for (const unit of roster) {
    const character = characterById(unit.id);
    const multiplierStar = star(unit);
    let power = character.power * multiplierStar + unit.growth;
    if (unit.id === '1013') power += 2 / 3 * multiplierStar;
    if (unit.id === '1204') power += multiplierStar;
    if (unit.id === '1003') power += retirementRate * 2 * multiplierStar;
    if (unit.id === '1006') power += multiplierStar;
    if (unit.id === '1103') power += Math.max(0, lightningCount - 1) * pair * multiplierStar;
    if (has(state, 'gold_coin')) power += 0.3;
    if (character.path === '虚无') power += kafkaBoost + (has(state, 'nihility_wax') ? 1 : 0) + effect('essence_nihility') * 1.5;
    power += effect('essence_destruction');
    if (character.attack === 'aoe') power += effect('essence_erudition');
    if (unit.id === '1109') power += Math.min(1, temporary * pair) * 4 * multiplierStar;
    if (unit.id === '1201') power *= 1.6;
    if (unit.id === '1008' && state.hp <= state.maxHp / 2) power *= 2;
    for (const buffer of buffs) {
      if (buffer.uid !== unit.uid && (buffer.id !== '1106' || character.element === '冰')) power += (buffer.id === '1009' ? 0.5 : 1) * star(buffer) * pair * harmonyWax * utilityMultiplier(state, buffer, 'buff');
    }
    let multiplier = 1 + active.filter(synergy => character[synergy.kind] === synergy.tag).reduce((sum, synergy) => sum + bonus(synergy) * (has(state, 'divination_candle') ? 1.5 : 1), 0);
    if (has(state, 'doctor_robe') && unit.stars > 1) multiplier *= 1.2;
    if (has(state, 'broken_clock')) multiplier *= 1.2;
    if (has(state, 'cosmic_lotto')) multiplier *= 1.1;
    multiplier *= 1 + 0.15 * effect('essence_elation');
    multiplier *= 1 + 0.1 * effect('essence_harmony');
    if (character.attack === 'single') multiplier *= (has(state, 'hunt_wax') ? 1.3 : 1) * (1 + 0.35 * effect('essence_hunt'));
    if (character.attack === 'blast' && has(state, 'destruction_wax')) multiplier *= 1.25;
    if (character.attack === 'aoe' && has(state, 'erudition_wax')) multiplier *= 1.25;
    // Published clauses last for the current encounter; future encounters are
    // unknown. Weight their known effect by the remaining encounter horizon.
    const knownEncounterMultiplier = unitPowerMultiplier(state, character, unit, false) * expectedTeamFactor(unit);
    multiplier *= 1 - (1 - knownEncounterMultiplier) * encounterShare;
    let factor = attackFactor(state, character.attack, true) * 0.7 + attackFactor(state, character.attack) * 0.3;
    if (unit.id === '1102') factor += 0.2;
    if (state.enemySkill?.id === 'armor' && armorBreaker < 1) power = Math.max(0, power - 0.3 * (1 - armorBreaker));
    if (unit.id === '1208') reduction += threat * 0.2 * draw;
    if (unit.id === '1205') selfDrain += 2 * multiplierStar * draw;
    // Pollution ends with this encounter; Blade's self-cost persists. The
    // next-spin simulation separately checks lethal pollution before healing.
    if (isPolluted(state, unit.uid)) selfDrain += 6 * draw * encounterShare;
    output += power * multiplier * factor * draw;
    projected += (power + growthRate(unit.id) * (has(state, 'rubert_gear') ? 1.5 : 1) * horizon * draw * 0.5) * multiplier * factor * draw;
  }
  // Tingyun's directed buff always finds another unit; it does not need adjacency.
  // The directed recipient varies by the future board. Its added attack power
  // uses the population trigger estimate; the natural buff itself is unchanged.
  const directedTeamFactor = pollutionTarget ? 1 - (1 - POLLUTION_ATTACK_MULTIPLIER) * draw * encounterShare : 1;
  const directed = roster.filter(unit => unit.id === '1202').reduce((sum, unit) => sum + 2 * star(unit) * utilityMultiplier(state, unit, 'buff'), 0) * draw * harmonyWax * 3.7 * directedTeamFactor;
  if (roster.length > 1) { output += directed; projected += directed; }
  for (const synergy of active) {
    if (synergy.id === 'belobog') shields += synergy.tier === 2 ? 5 : 2;
    if (synergy.id === 'preservation') shields += synergy.tier === 2 ? 6 : 3;
    if (synergy.id === 'xianzhou') healing += synergy.tier === 2 ? 4 : 2;
    if (synergy.id === 'abundance') healing += 4;
  }
  if (has(state, 'dimension_dice')) healing += 2;
  if (has(state, 'insect_web')) healing += retirementRate * 2;
  healing *= has(state, 'abundance_wax') ? 1.5 : 1;
  shields *= (has(state, 'preservation_wax') ? 1.5 : 1) * (1 + effect('essence_preservation') * 0.3);
  if (has(state, 'preservation_wax')) shields += 8 / 4;
  shields += effect('essence_preservation') * 12 / 4;
  const overflow = roster.filter(unit => unit.id === '1203').reduce((sum, unit) => sum + 6 * star(unit), 0) * draw;
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
    const members = roster.filter(unit => !unit.temporary && characterById(unit.id)[synergy.kind] === synergy.tag);
    synergyPotential += members.reduce((sum, unit) => sum + characterById(unit.id).power * star(unit), 0) * draw * 0.12 / remaining;
  }
  const economy = enabled(state, 'credits') ? ((has(state, 'faith_bond') ? 3 : 0) + (has(state, 'angel_debt') ? 2 : 0) + (has(state, 'insect_web') ? retirementRate * 4 : 0)) * Math.max(0.35, output / 80) : 0;
  const flexibility = (has(state, 'fortune_glue') ? 3 * clamp(horizon / 15, 0, 1) : 0) + (enabled(state, 'rerolls') && has(state, 'chaos_trametes') ? 1.4 : 0)
    + (enabled(state, 'removals') && has(state, 'angel_debt') && length >= 18 ? 1.4 : 0) + (enabled(state, 'rerolls') ? effect('essence_harmony') * 0.6 + (has(state, 'broken_clock') ? 0.4 : 0) : 0);
  return { damage: output, defense, growth: projected - output, synergy: synergyPotential, economy,
    tempo: has(state, 'seal_stamp') ? output / 5.5 : 0, flexibility,
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

function trialValue(state, profile, scale) {
  if (state.phase !== 'ready') return 0;
  const next = spin(state);
  let result = next.lastSpin.damage;
  result += ((next.hp - state.hp) + Math.min(50, next.shield) - Math.min(50, state.shield)) * profile.weights.defense * (1 + (1 - state.hp / state.maxHp) * 2);
  if (next.phase === 'defeat') result -= scale * 1.5;
  if (next.phase === 'victory' || next.pendingFloor) result += scale * 0.25;
  return result;
}

function mergeBonus(state, id, next) {
  if (state.phase !== 'recruit') return 0;
  const same = state.roster.filter(unit => unit.id === id && !unit.temporary);
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
    if (!explanations.length && state.roster.filter(unit => unit.id === id && unit.stars === 1 && !unit.temporary).length === 1) explanations.push('凑成两张，为升星保留目标');
    if (growthRate(id)) explanations.push('永久成长，剩余轮次越多越有利');
    if (character.attack === 'aoe' && state.mode === 'combat') explanations.push('群体攻击覆盖多列');
    if (character.attack === 'support') explanations.push(character.path === '同谐' ? '提高队友威力' : !enabled(state, 'defense') ? '自然治疗仍生效，当前策略不主动评估防御收益' : nextMetrics.defense > previousMetrics.defense + 1 ? '补充治疗/防御，降低失守风险' : '治疗收益受当前生命与防御影响');
    if (next.roster.length > BOARD_SIZE) explanations.push('编队超过20人，考虑抽取稀释');
    return explanations.slice(0, 2).join('；') || '比较实际攻击、羁绊与后续成长收益';
  }
  const explanations = {
    faith_bond: enabled(state, 'credits') ? '每轮信用点可用于补给或付费重掷' : '信用点消费已停用，本件的经济收益无法支出',
    seal_stamp: '后续每层多一轮，提高期限内输出空间',
    fortune_glue: '剩余招募越多，稀有角色权重提升越有价值',
    doctor_robe: '按当前升星角色占比估算增益',
    harmony_wax: '按辅助增益人数与棋盘相邻概率估算',
    abundance_wax: '按生命缺口与治疗来源估算，避免治疗溢出',
    preservation_wax: '按护盾来源和敌方威胁估算，考虑护盾上限',
    rubert_gear: '按成长角色数量和剩余轮次估算',
    essence_abundance: '六轮后完全治疗，考虑触发前能否存活',
    essence_destruction: '八轮后全队增益，考虑剩余轮次',
    essence_preservation: '按护盾获取速度估算触发时间与防御收益',
    essence_harmony: '生效羁绊越多，触发越快',
  };
  return explanations[id] || (state.phase === 'essence' ? '估算触发速度、剩余轮次与当前编队增益' : '按当前编队、模式和剩余轮次比较收益');
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
  for (let sample = 0; sample < samples; sample++) baseline += trialValue({ ...state, rngState: hash(`${digest}/supply-board/${sample}`) }, profile, scale) / samples;
  let best = null;
  for (const kind of SUPPLY_KINDS) {
    if (kind !== 'overclock' && !enabled(state, 'defense')) continue;
    const gap = state.maxHp - state.hp;
    if (kind === 'repair' && (gap < 8 || (state.hp > metrics.threat * 2 && metrics.healing >= metrics.threat + gap / 3))) continue;
    if (kind === 'barrier' && (state.shield >= metrics.threat * 2 || (state.hp > state.maxHp * 0.7 && metrics.threat * 2 <= state.shield + metrics.shields * 2 + state.hp * 0.15))) continue;
    const purchased = engine.purchaseSupply(state, kind);
    if (purchased === state) continue;
    let after = 0;
    for (let sample = 0; sample < samples; sample++) after += trialValue({ ...purchased, rngState: hash(`${digest}/supply-board/${sample}`) }, profile, scale) / samples;
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
  if (uid) action = { type: 'remove', uid, reason: !state.pendingFloor && isPolluted(state, uid) ? '清理该污染实例的生命与本人/全队威力损失更划算，已比较技能、羁绊和合成机会' : '精简后的预计整体收益更高，已保留合成目标与羁绊价值' };
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
