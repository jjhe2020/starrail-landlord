import { characterById, essenceById, SYNERGIES } from './content.js';
import { BOARD_SIZE, STAR_MULTIPLIERS, chooseReward, skipReward, spin, getSynergies } from './engine.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';

export { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
// Algorithm version is independent from a saved profile's reusable model weights.
export const POLICY_VERSION = 'reward-actions-v2';
const REWARD_PHASES = ['recruit', 'item', 'essence'];
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
  return JSON.stringify([state.mode, state.floor, state.round, state.spinsLeft, state.hp, state.maxHp, state.shield, state.coins, state.rent, state.phase, state.choices,
    state.roster.map(unit => [unit.id, unit.stars, unit.growth, unit.ticks, unit.temporary || 0]), state.items, state.essences,
    state.enemies.map(enemy => [enemy.col, enemy.hp, enemy.attack]), state.enemySkill?.id, state.pendingFloor]);
}

function futureHorizon(state) {
  return clamp(state.spinsLeft + Math.max(0, 12 - state.floor) * (state.mode === 'combat' ? 3.2 : 6), 3, 24);
}

function attackFactor(state, attack, future = false) {
  if (state.mode === 'classic') return 1;
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
  const roster = state.roster;
  const length = roster.length;
  const draw = Math.min(1, BOARD_SIZE / Math.max(1, length));
  const pair = 5.5 / 19 * Math.min(1, 19 / Math.max(1, length - 1));
  const horizon = futureHorizon(state);
  const synergies = getSynergies(state);
  const active = synergies.filter(synergy => synergy.active);
  const singles = count(roster, character => character.attack === 'single') * draw;
  const aoes = count(roster, character => character.attack === 'aoe') * draw;
  const nihility = count(roster, character => character.path === '虚无') * draw;
  const shieldSource = roster.reduce((sum, unit) => sum + ({ '1001': 3, '1104': 5, '1208': 6 }[unit.id] || 0) * star(unit), 0) * draw;
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
  const threat = state.mode === 'combat' ? Math.max(state.floor * 1.3 + 1.5, state.enemies.filter(enemy => enemy.hp > 0).reduce((sum, enemy) => sum + enemy.attack, 0) * 0.6) : 0;
  let output = 0;
  let projected = 0;
  let shields = shieldSource;
  let healing = roster.reduce((sum, unit) => sum + ({ '1105': 3, '1203': 6 }[unit.id] || 0) * star(unit), 0) * draw;
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
    if (unit.id === '1004' && state.mode === 'classic') power += 2 * multiplierStar;
    if (unit.id === '1006') power += multiplierStar;
    if (unit.id === '1103') power += Math.max(0, lightningCount - 1) * pair * multiplierStar;
    if (has(state, 'gold_coin')) power += 0.3;
    if (character.path === '虚无') power += kafkaBoost + (has(state, 'nihility_wax') ? 1 : 0) + effect('essence_nihility') * 1.5;
    power += effect('essence_destruction');
    if (character.attack === 'aoe') power += effect('essence_erudition');
    if (unit.id === '1109') power += Math.min(1, temporary * pair) * 4 * multiplierStar;
    if (unit.id === '1201') power *= 1.6;
    if (unit.id === '1008' && (state.mode === 'combat' ? state.hp <= state.maxHp / 2 : state.coins < state.rent)) power *= 2;
    for (const buffer of buffs) {
      if (buffer.uid !== unit.uid && (buffer.id !== '1106' || character.element === '冰')) power += (buffer.id === '1009' ? 0.5 : 1) * star(buffer) * pair * harmonyWax;
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
    let factor = attackFactor(state, character.attack, true) * 0.7 + attackFactor(state, character.attack) * 0.3;
    if (unit.id === '1102') factor += state.mode === 'combat' ? 0.2 : 0;
    if (state.mode === 'combat' && state.enemySkill?.id === 'armor' && armorBreaker < 1) power = Math.max(0, power - 0.3 * (1 - armorBreaker));
    if (unit.id === '1208') reduction += threat * 0.2 * draw;
    if (unit.id === '1205' && state.mode === 'combat') healing -= 2 * multiplierStar * draw;
    output += power * multiplier * factor * draw;
    projected += (power + growthRate(unit.id) * (has(state, 'rubert_gear') ? 1.5 : 1) * horizon * draw * 0.5) * multiplier * factor * draw;
  }
  // Tingyun's directed buff always finds another unit; it does not need adjacency.
  const directed = roster.filter(unit => unit.id === '1202').reduce((sum, unit) => sum + 2 * star(unit), 0) * draw * harmonyWax * (state.mode === 'classic' ? 1 : 3.7);
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
  const healUseful = Math.min(Math.max(0, healing), Math.max(0, remainingThreat - shields) + (state.maxHp - state.hp) / 5);
  const defense = state.mode === 'classic' ? 0 : (shieldUseful + healUseful + Math.min(reduction, threat)) * danger
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
  const economy = (has(state, 'faith_bond') ? 3 : 0) + (has(state, 'angel_debt') ? 2 : 0) + (has(state, 'insect_web') ? retirementRate * 4 : 0);
  const flexibility = (has(state, 'fortune_glue') ? 3 * clamp(horizon / 15, 0, 1) : 0) + (has(state, 'chaos_trametes') ? 1.4 : 0)
    + (has(state, 'angel_debt') && length >= 18 ? 1.4 : 0) + effect('essence_harmony') * 0.6 + (has(state, 'broken_clock') ? 0.4 : 0);
  return { damage: output, defense, growth: projected - output, synergy: synergyPotential, economy: state.mode === 'classic' ? economy * 2 : economy * 0.28,
    tempo: has(state, 'seal_stamp') ? output / (state.mode === 'classic' ? 6 : 5.5) : 0, flexibility,
    dilution: -Math.max(0, length - BOARD_SIZE) * output / Math.max(length, 1) * 0.1,
    totalHp, shields, healing, horizon, active, draw };
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
  let result = state.mode === 'classic' ? next.lastSpin.coins : next.lastSpin.damage;
  if (state.mode === 'combat') result += ((next.hp - state.hp) + Math.min(30, next.shield) - Math.min(30, state.shield)) * profile.weights.defense;
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
    if (character.attack === 'support') explanations.push(nextMetrics.defense > previousMetrics.defense + 1 ? '补充治疗/防御，降低失守风险' : character.path === '同谐' ? '提高队友威力' : '治疗收益受当前生命与防御影响');
    if (next.roster.length > BOARD_SIZE) explanations.push('编队超过20人，考虑抽取稀释');
    return explanations.slice(0, 2).join('；') || '比较实际攻击、羁绊与后续成长收益';
  }
  const explanations = {
    faith_bond: state.mode === 'classic' ? '每轮补充交租收入' : '信用点用于重选，不直接造成伤害',
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
  const policy = validateProfile(profile) || DEFAULT_PROFILE;
  const empty = { version: policy.version, policyVersion: POLICY_VERSION, phase: state?.phase || '', choices: [], entropy: 0 };
  if (!state || !REWARD_PHASES.includes(state.phase) || !Array.isArray(state.choices) || !state.choices.length) return empty;
  const digest = publicDigest(state);
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
  return { version: policy.version, policyVersion: POLICY_VERSION, phase: state.phase, choices, entropy: -choices.reduce((sum, choice) => sum + choice.probability * Math.log(choice.probability), 0) };
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

export function recommendRemoval(state, { profile = DEFAULT_PROFILE } = {}) {
  if (!state || !['ready', ...REWARD_PHASES].includes(state.phase) || state.removals <= 0 || state.roster.length <= BOARD_SIZE) return null;
  const policy = validateProfile(profile) || DEFAULT_PROFILE;
  const originalValue = value(rosterMetrics(state), policy);
  let best = { uid: null, gain: 0.5 };
  for (const unit of state.roster) {
    if (unit.temporary || unit.stars > 1) continue;
    const same = state.roster.filter(other => !other.temporary && other.id === unit.id && other.stars === 1).length;
    const next = { ...state, roster: state.roster.filter(other => other.uid !== unit.uid) };
    const gain = value(rosterMetrics(next), policy) - originalValue - (same === 2 ? policy.weights.merge * 2.5 : 0);
    if (gain > best.gain) best = { uid: unit.uid, gain };
  }
  return best.uid;
}

export function evaluateRun(state) {
  if (!state) return 0;
  const cleared = state.phase === 'victory' ? 12 : Math.max(0, state.floor - 1);
  const withinFloor = state.mode === 'combat'
    ? 1 - state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0) / Math.max(1, state.enemies.reduce((sum, enemy) => sum + enemy.maxHp, 0))
    : clamp(state.coins / Math.max(1, state.rent), 0, 1);
  const win = state.phase === 'victory' ? 1800 : 0;
  const health = state.mode === 'combat' ? state.hp + Math.min(state.shield, 80) * 0.15 : 0;
  const bank = state.mode === 'classic' ? Math.log1p(Math.max(0, state.coins)) * 8 : Math.log1p(Math.max(0, state.coins)) * 2;
  return cleared * 1000 + (state.phase === 'victory' ? 0 : clamp(withinFloor, 0, 1) * 700) + win + health + bank - state.stats.spins * (state.mode === 'combat' ? 3 : 0.1);
}
