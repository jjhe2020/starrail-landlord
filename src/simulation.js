import { newGame, spin, chooseReward, skipReward, removeSymbol, rerollRewards, purchaseSupply, FINAL_FLOOR } from './engine.js';
import { recommendAction, sampleRecommendation, createPolicyRandom, evaluateRun, POLICY_VERSION, RESOURCE_KEYS } from './ai.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { DIFFICULTY, normalizeDifficulty } from './difficulty.js';

const REWARD_PHASES = ['recruit', 'item', 'essence'];
const TERMINAL_PHASES = ['victory', 'defeat'];
const boundedInt = (value, fallback, max = 1000) => Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;
const requireCombat = mode => { if (mode !== undefined && mode !== 'combat') throw new Error('Only combat mode is supported by the current simulator.'); };
export const normalizeResourceAccess = access => Object.fromEntries(RESOURCE_KEYS.map(key => [key, access?.[key] !== false]));
const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));
export const ACTION_POLICIES = Object.freeze({
  ai: Object.freeze({ selection: 'shared-resource-planner', rewardActions: Object.freeze(['choose', 'skip']), resourceActions: Object.freeze(['reroll', 'remove', 'supply']), removals: 'marginal-value-and-future-options' }),
  uniform: Object.freeze({ selection: 'uniform-choose-only', rewardActions: Object.freeze(['choose']), resourceActions: Object.freeze([]), removals: 'none' }),
});
const USAGE_KEYS = ['initialHp', 'initialShield', 'rerollsUsed', 'paidRerolls', 'removalsUsed', 'supplyPurchases', 'creditsSpent', 'healed', 'shieldGained', 'shieldBlocked', 'shieldDecayed', 'hpLost'];
// These are reporting thresholds, never targets used by the action planner.
export const DEFENSE_USAGE_THRESHOLDS = Object.freeze({ low: 0.2, effective: 0.5 });

/** Actual consumed / generated amounts. Natural defense can be effective even
 * when its planning switch is disabled; deliberate damage is never rewarded. */
export function calculateDefenseUsage(stats = {}) {
  const hpGenerated = (stats.initialHp || 0) + (stats.healed || 0);
  const shieldGenerated = (stats.initialShield || 0) + (stats.shieldGained || 0);
  const hpConsumed = stats.hpLost || 0;
  const shieldConsumed = stats.shieldBlocked || 0;
  const combinedRate = hpGenerated + shieldGenerated > 0 ? (hpConsumed + shieldConsumed) / (hpGenerated + shieldGenerated) : 0;
  return {
    hpGenerated, shieldGenerated, hpConsumed, shieldConsumed, shieldWasted: stats.shieldDecayed || 0,
    hpConsumptionRate: hpGenerated > 0 ? hpConsumed / hpGenerated : 0,
    shieldConsumptionRate: shieldGenerated > 0 ? shieldConsumed / shieldGenerated : 0,
    combinedRate, classification: combinedRate < DEFENSE_USAGE_THRESHOLDS.low ? 'low' : combinedRate >= DEFENSE_USAGE_THRESHOLDS.effective ? 'effective' : 'moderate',
    thresholds: { ...DEFENSE_USAGE_THRESHOLDS },
  };
}

/** Pure report assessment. A planning toggle is not evidence that natural
 * defense was absent; actual consumption governs the temporary resource map. */
export function assessResourceVariant(variant, { full, target = {} } = {}) {
  const limits = { preferred: 0.95, min: 0.9, max: 0.98, minimumSingleResourceDrop: target.minAblationDrop ?? 0.05, fullDefenseMin: 0.5, ...target };
  const summary = variant.summary;
  const declaredMissing = variant.disabledResources || RESOURCE_KEYS.filter(key => variant.resourceAccess?.[key] === false);
  const usage = summary.avgUsage || {};
  const defense = summary.defenseUsage || calculateDefenseUsage(usage);
  const rate = Number.isFinite(defense.combinedRate) ? defense.combinedRate : 0;
  const used = { rerolls: (usage.rerollsUsed || 0) > 0, removals: (usage.removalsUsed || 0) > 0, credits: (usage.creditsSpent || 0) > 0, defense: rate >= DEFENSE_USAGE_THRESHOLDS.low };
  const actualMissingResources = RESOURCE_KEYS.filter(key => !used[key]);
  const actualDefensiveUse = { combinedRate: rate, hpConsumptionRate: defense.hpConsumptionRate || 0, shieldConsumptionRate: defense.shieldConsumptionRate || 0, planningEnabled: variant.resourceAccess?.defense !== false, lowUse: rate < DEFENSE_USAGE_THRESHOLDS.low, effective: rate >= DEFENSE_USAGE_THRESHOLDS.effective, thresholds: { ...DEFENSE_USAGE_THRESHOLDS } };
  const resourceGatesValid = declaredMissing.filter(key => key !== 'defense').every(key => !used[key]);
  const nominalMappingEligible = resourceGatesValid && actualMissingResources.length === declaredMissing.length && actualMissingResources.every(key => declaredMissing.includes(key));
  const nominalDifficulty = 10 - actualMissingResources.length * 2;
  const isAblation = variant.role === 'ablation' || (variant.difficulty === 10 && declaredMissing.length === 1);
  const fullSummary = full?.summary || full;
  const baseUsage = fullSummary?.avgUsage || {};
  const baseDefense = fullSummary?.defenseUsage || calculateDefenseUsage(baseUsage);
  const fullResourcesUsed = ['rerollsUsed', 'removalsUsed', 'creditsSpent'].every(key => (baseUsage[key] || 0) > 0) && (baseDefense.combinedRate || 0) >= limits.fullDefenseMin;
  const winRateDrop = fullSummary ? fullSummary.winRate - summary.winRate : null;
  const reasons = [];
  if (summary.incomplete) reasons.push('存在未完成的对局');
  if (!resourceGatesValid) reasons.push('被禁用的动作仍有实际消耗');
  if (!nominalMappingEligible) reasons.push('实际缺失资源与开关不一致，不能验证名义难度映射');
  let verifiable = nominalMappingEligible && resourceGatesValid;
  if (isAblation && declaredMissing.includes('defense')) {
    verifiable = false;
    reasons.push('关闭防御规划保留自然生命与护盾，不能作为彻底移除防御的消融或要求固定胜率下降');
  }
  if (isAblation && !fullResourcesUsed) reasons.push('完整 D10 基线没有实际使用全部四类资源');
  if (isAblation && !fullSummary) reasons.push('缺少同种子完整 D10 基线');
  if (!isAblation && variant.difficulty !== nominalDifficulty) reasons.push(`实际缺资源对应 D${nominalDifficulty}，当前为 D${variant.difficulty}`);
  if (!isAblation && declaredMissing.length === 0 && !fullResourcesUsed) reasons.push('完整 D10 需实际使用重掷、移除、信用点，且综合防御消耗率至少 50%');
  if (isAblation && !declaredMissing.includes('defense') && fullSummary && winRateDrop < limits.minimumSingleResourceDrop) reasons.push('同难度实际资源消融胜率下降未达到目标');
  if (!isAblation && (summary.winRate < limits.min || summary.winRate > limits.max)) reasons.push('通关率不在目标范围');
  const passed = reasons.length === 0 && verifiable;
  return { actualDefensiveUse, actualMissingResources, actualMissingResourceCount: actualMissingResources.length, nominalMappingEligible, nominalDifficulty, resourceGatesValid, fullResourcesUsed, isAblation, verifiable, winRateDrop, passed, reasons };
}

export function validateResourceCalibration(reports, { target = {} } = {}) {
  const full = reports.find(variant => variant.difficulty === 10 && variant.disabledResources.length === 0);
  const variants = reports.map(variant => ({ ...variant, ...assessResourceVariant(variant, { full, target }) }));
  return {
    variants,
    nominal: variants.filter(variant => !variant.isAblation).map(({ id, passed, verifiable, nominalMappingEligible, nominalDifficulty, actualMissingResourceCount, reasons }) => ({ id, passed, verifiable, nominalMappingEligible, nominalDifficulty, actualMissingResourceCount, reasons })),
    singleD10: variants.filter(variant => variant.isAblation).map(variant => ({ id: variant.id, resource: variant.disabledResources[0], drop: variant.winRateDrop, passed: variant.passed, verifiable: variant.verifiable, reasons: variant.reasons })),
    passed: variants.length > 0 && variants.every(variant => variant.passed),
  };
}

/** Policy draws never consume or inspect the engine's seeded random stream. */
export function runCampaign({ mode = 'combat', difficulty = 10, resourceAccess, seed = 'simulation', profile = DEFAULT_PROFILE, policy = 'ai', maxActions = 1000, lookahead = true, policySeed, initialState, trace = false } = {}) {
  requireCombat(mode);
  if (!['ai', 'uniform'].includes(policy)) throw new Error('Unknown campaign policy.');
  let state = initialState ? structuredClone(initialState) : newGame({ difficulty, resourceAccess, seed });
  if (state.mode !== 'combat') throw new Error('Legacy classic states cannot be simulated.');
  const random = createPolicyRandom(policySeed ?? `${state.seed}:policy`);
  const limit = boundedInt(maxActions, 1000, 5000);
  const picks = { recruit: {}, item: {}, essence: {} };
  const skips = { recruit: 0, item: 0, essence: 0 };
  const choices = [];
  const actionTrace = [];
  const supplyKinds = { repair: 0, barrier: 0, overclock: 0 };
  let actions = 0;
  let stopped = null;
  while (!TERMINAL_PHASES.includes(state.phase) && actions < limit) {
    const planned = policy === 'ai' ? recommendAction(state, { profile, lookahead }) : { type: state.phase === 'ready' ? 'spin' : REWARD_PHASES.includes(state.phase) ? 'reward' : 'stop', reason: 'uniform baseline' };
    let next;
    if (planned.type === 'remove') next = removeSymbol(state, planned.uid);
    else if (planned.type === 'reroll') next = rerollRewards(state);
    else if (planned.type === 'supply') { next = purchaseSupply(state, planned.kind); if (next !== state) supplyKinds[planned.kind] += 1; }
    else if (planned.type === 'spin') next = spin(state);
    else if (planned.type === 'reward' && REWARD_PHASES.includes(state.phase) && state.choices.length) {
      const recommendation = policy === 'ai' ? planned.recommendation : {
        choices: state.choices.map((id, index) => ({ id, index, action: 'choose', probability: 1 / state.choices.length })),
      };
      const draw = random();
      const index = sampleRecommendation(recommendation, draw);
      const selected = recommendation.choices.find(choice => choice.index === index);
      const isSkip = index === state.choices.length && selected?.id === 'skip' && selected.action === 'skip';
      const id = isSkip ? 'skip' : state.choices[index];
      if (!selected || (!isSkip && (!id || selected.id !== id || selected.action !== 'choose'))) { stopped = 'invalid-policy-choice'; break; }
      const action = isSkip ? 'skip' : 'choose';
      picks[state.phase][id] = (picks[state.phase][id] || 0) + 1;
      if (isSkip) skips[state.phase] += 1;
      if (trace) choices.push({ floor: state.floor, phase: state.phase, offeredRewards: state.choices.slice(), options: recommendation.choices.map(choice => choice.id), optionActions: recommendation.choices.map(choice => choice.action), probabilities: recommendation.choices.map(choice => choice.probability), draw, index, id, action });
      next = isSkip ? skipReward(state) : chooseReward(state, index);
    } else { stopped = 'unknown-phase'; break; }
    if (next === state) { stopped = 'no-progress'; break; }
    if (trace) actionTrace.push({ floor: state.floor, phase: state.phase, type: planned.type, uid: planned.uid, kind: planned.kind, reason: planned.reason, coinsSpent: Math.max(0, state.coins - next.coins), before: { hp: state.hp, shield: state.shield }, after: { hp: next.hp, shield: next.shield } });
    state = next;
    actions += 1;
  }
  if (!TERMINAL_PHASES.includes(state.phase) && !stopped) stopped = 'action-limit';
  const won = state.phase === 'victory';
  const resourceStats = structuredClone(state.resourceStats);
  const defenseUsage = calculateDefenseUsage(resourceStats);
  const usage = { ...resourceStats, freeRerolls: resourceStats.rerollsUsed - resourceStats.paidRerolls, paidRerollCredits: resourceStats.paidRerolls * 8, supplyCredits: resourceStats.creditsSpent - resourceStats.paidRerolls * 8, supplyKinds };
  return {
    mode: state.mode, difficulty: state.difficulty, resourceAccess: structuredClone(state.resourceAccess), seed: state.seed, policy, actionPolicy: ACTION_POLICIES[policy]?.selection, policyVersion: policy === 'ai' ? POLICY_VERSION : 'uniform-choose-only-v1', won, phase: state.phase,
    floor: state.floor, clearedFloors: won ? FINAL_FLOOR : Math.max(0, state.floor - 1),
    hp: state.hp, maxHp: state.maxHp, shield: state.shield, turns: state.stats.spins,
    damage: state.stats.damage, coins: state.stats.coins, merges: state.stats.merges,
    removed: resourceStats.removalsUsed, destroyed: state.stats.destroyed, actions, stopped, resourceStats, usage, defenseUsage,
    resourceUsed: { rerolls: resourceStats.rerollsUsed > 0, removals: resourceStats.removalsUsed > 0, credits: resourceStats.creditsSpent > 0, defense: defenseUsage.classification === 'effective' },
    score: evaluateRun(state), picks, skips, skipped: Object.values(skips).reduce((sum, count) => sum + count, 0), rosterSize: state.roster.length,
    itemCount: state.items.length, essenceCount: state.essences.length,
    activatedEssences: state.essences.filter(essence => essence.triggered).length,
    ...(trace ? { choices, actionTrace } : {}),
  };
}

/** Wilson's binomial interval remains useful at 0 / n and n / n wins. */
export function wilsonInterval(wins, runs) {
  if (runs <= 0) return [0, 1];
  const z = 1.959963984540054;
  const p = wins / runs;
  const denominator = 1 + z * z / runs;
  const center = (p + z * z / (2 * runs)) / denominator;
  const radius = z * Math.sqrt(p * (1 - p) / runs + z * z / (4 * runs * runs)) / denominator;
  return [Math.max(0, center - radius), Math.min(1, center + radius)];
}

export function summarizeCampaigns(results) {
  const n = results.length;
  const total = key => results.reduce((sum, result) => sum + result[key], 0);
  const avg = key => n ? total(key) / n : 0;
  const wins = results.filter(result => result.won).length;
  const failureByFloor = Array.from({ length: FINAL_FLOOR }, (_, index) => ({ floor: index + 1, count: results.filter(result => !result.won && result.floor === index + 1 && !result.stopped).length }));
  const picks = { recruit: {}, item: {}, essence: {} };
  const skipsByPhase = { recruit: 0, item: 0, essence: 0 };
  for (const result of results) for (const phase of REWARD_PHASES) for (const [id, count] of Object.entries(result.picks[phase])) picks[phase][id] = (picks[phase][id] || 0) + count;
  for (const phase of REWARD_PHASES) skipsByPhase[phase] = results.reduce((sum, result) => sum + (result.skips?.[phase] ?? result.picks[phase].skip ?? 0), 0);
  const usageKeys = [...USAGE_KEYS, 'freeRerolls', 'paidRerollCredits', 'supplyCredits'];
  const avgUsage = Object.fromEntries(usageKeys.map(key => [key, n ? results.reduce((sum, result) => sum + (result.usage?.[key] ?? result.resourceStats?.[key] ?? 0), 0) / n : 0]));
  avgUsage.supplyKinds = Object.fromEntries(['repair', 'barrier', 'overclock'].map(key => [key, n ? results.reduce((sum, result) => sum + (result.usage?.supplyKinds?.[key] || 0), 0) / n : 0]));
  const resourceUsageRates = Object.fromEntries(RESOURCE_KEYS.map(key => [key, n ? results.filter(result => result.resourceUsed?.[key]).length / n : 0]));
  const defenseTotals = Object.fromEntries(USAGE_KEYS.map(key => [key, results.reduce((sum, result) => sum + (result.resourceStats?.[key] ?? result.usage?.[key] ?? 0), 0)]));
  const defenseUsage = {
    ...calculateDefenseUsage(defenseTotals), method: 'aggregate-consumed-over-generated',
    lowRate: n ? results.filter(result => calculateDefenseUsage(result.resourceStats ?? result.usage).classification === 'low').length / n : 0,
    effectiveRate: n ? results.filter(result => calculateDefenseUsage(result.resourceStats ?? result.usage).classification === 'effective').length / n : 0,
  };
  defenseUsage.observational = true;
  defenseUsage.strata = Object.fromEntries(['low', 'moderate', 'effective'].map(classification => {
    const group = results.filter(result => calculateDefenseUsage(result.resourceStats ?? result.usage).classification === classification);
    const count = group.length;
    const groupWins = group.filter(result => result.won).length;
    const totals = Object.fromEntries(USAGE_KEYS.map(key => [key, group.reduce((sum, result) => sum + (result.resourceStats?.[key] ?? result.usage?.[key] ?? 0), 0)]));
    const actualUsed = result => {
      const usage = result.resourceStats ?? result.usage ?? {};
      return { rerolls: (usage.rerollsUsed || 0) > 0, removals: (usage.removalsUsed || 0) > 0, credits: (usage.creditsSpent || 0) > 0, defense: calculateDefenseUsage(usage).combinedRate >= DEFENSE_USAGE_THRESHOLDS.low };
    };
    const resourceUsageCounts = Object.fromEntries(RESOURCE_KEYS.map(key => [key, group.filter(result => actualUsed(result)[key]).length]));
    const jointlyActive = group.filter(result => RESOURCE_KEYS.every(key => actualUsed(result)[key]));
    const jointlyActiveWins = jointlyActive.filter(result => result.won).length;
    return [classification, {
      n: count, wins: groupWins, winRate: count ? groupWins / count : 0, winRateCI: wilsonInterval(groupWins, count),
      ...calculateDefenseUsage(totals),
      resourceUsageCounts, resourceUsageRates: Object.fromEntries(RESOURCE_KEYS.map(key => [key, count ? resourceUsageCounts[key] / count : 0])),
      jointActiveFour: { n: jointlyActive.length, wins: jointlyActiveWins, winRate: jointlyActive.length ? jointlyActiveWins / jointlyActive.length : 0, winRateCI: wilsonInterval(jointlyActiveWins, jointlyActive.length) },
      observational: true,
    }];
  }));
  resourceUsageRates.defense = defenseUsage.effectiveRate;
  return {
    runs: n, wins, winRate: n ? wins / n : 0, winRateCI: wilsonInterval(wins, n),
    avgFloor: avg('floor'), avgClearedFloors: avg('clearedFloors'), avgHp: avg('hp'),
    avgTurns: avg('turns'), avgDamage: avg('damage'), avgCoins: avg('coins'),
    avgMerges: avg('merges'), avgRemovals: avg('removed'), avgRosterSize: avg('rosterSize'),
    avgItems: avg('itemCount'), avgEssences: avg('essenceCount'), avgActivatedEssences: avg('activatedEssences'),
    avgScore: avg('score'), avgSkips: n ? Object.values(skipsByPhase).reduce((sum, count) => sum + count, 0) / n : 0, skipsByPhase, failureByFloor, picks, avgUsage, resourceUsageRates, defenseUsage, incomplete: results.filter(result => result.stopped).length,
  };
}

export function pairedDifference(ai, uniform) {
  const n = ai.length;
  const differences = ai.map((result, index) => Number(result.won) - Number(uniform[index].won));
  const winRate = n ? differences.reduce((sum, value) => sum + value, 0) / n : 0;
  // Do not put a normal CI on paired differences: with no discordant outcomes it
  // degenerates to [0, 0], even though a small sample cannot establish equivalence.
  const outcomes = { aiOnlyWins: 0, uniformOnlyWins: 0, bothWin: 0, bothLoss: 0 };
  for (let index = 0; index < n; index++) outcomes[ai[index].won ? uniform[index].won ? 'bothWin' : 'aiOnlyWins' : uniform[index].won ? 'uniformOnlyWins' : 'bothLoss'] += 1;
  return { winRate, avgFloor: n ? ai.reduce((sum, result, index) => sum + result.floor - uniform[index].floor, 0) / n : 0, pairedSeeds: n, outcomes };
}

/** Async batches let the browser worker emit progress and process cancellation. */
export async function benchmarkPolicies({ mode = 'combat', difficulty = 10, resourceAccess, runs = 100, seed = 'balance-v1', profile = DEFAULT_PROFILE, lookahead = true, onProgress, maxActions } = {}) {
  requireCombat(mode);
  profile = validateProfile(profile) || DEFAULT_PROFILE;
  const started = performance.now();
  const count = boundedInt(runs, 100, 2000);
  const modes = ['combat'];
  const level = normalizeDifficulty(difficulty);
  const access = normalizeResourceAccess(resourceAccess);
  const reports = [];
  const total = count * modes.length * 2;
  let completed = 0;
  for (const currentMode of modes) {
    const ai = [];
    const uniform = [];
    for (let index = 0; index < count; index++) {
      const gameSeed = `${seed}:holdout:${currentMode}:${index}`;
      for (const policy of ['ai', 'uniform']) {
        const result = runCampaign({ difficulty: level, resourceAccess: access, seed: gameSeed, policySeed: `${gameSeed}:actions`, profile, policy, lookahead, maxActions });
        (policy === 'ai' ? ai : uniform).push(result);
        completed += 1;
        onProgress?.({ completed, total, mode: currentMode, policy, wins: (policy === 'ai' ? ai : uniform).filter(run => run.won).length, floor: result.floor, stage: 'benchmark', elapsedMs: performance.now() - started });
      }
      if (index % 2 === 0) await yieldToEventLoop();
    }
    reports.push({ mode: currentMode, difficulty: level, resourceAccess: access, ai: summarizeCampaigns(ai), uniform: summarizeCampaigns(uniform), difference: pairedDifference(ai, uniform) });
  }
  return { version: 3, kind: 'combat-benchmark', mode: 'combat', difficulty: level, resourceAccess: access, seed, rules: structuredClone(DIFFICULTY), policyVersion: POLICY_VERSION, actionPolicies: structuredClone(ACTION_POLICIES), profileName: profile.name ?? profile.version, profile: structuredClone(profile), lookahead, runs: count, modes: reports, elapsedMs: performance.now() - started };
}

export function buildResourceScenarios({ includeControls = true } = {}) {
  const variants = [];
  for (let mask = 0; mask < 16; mask++) {
    const disabledResources = RESOURCE_KEYS.filter((_, index) => mask & (1 << index));
    const difficulty = 10 - 2 * disabledResources.length;
    const resourceAccess = Object.fromEntries(RESOURCE_KEYS.map(key => [key, !disabledResources.includes(key)]));
    const name = disabledResources.length ? `no-${disabledResources.join('-')}` : 'full';
    variants.push({ id: `${name}-D${difficulty}`, label: `${disabledResources.length ? disabledResources.join(' + ') : '完整资源'} · D${difficulty}`, difficulty, disabledResources, resourceAccess });
  }
  if (includeControls) for (const resource of RESOURCE_KEYS) variants.splice(1, 0, { id: `no-${resource}-D10`, label: `禁用 ${resource} · D10`, difficulty: 10, disabledResources: [resource], resourceAccess: normalizeResourceAccess({ [resource]: false }) });
  return variants;
}

/** Matched seeds vary only publicly chosen difficulty and actual resource gates. */
export async function benchmarkResources({ runs = 100, seed = 'resource-ablation-v1', profile = DEFAULT_PROFILE, lookahead = true, scenarios, includeControls = true, onProgress, maxActions } = {}) {
  profile = validateProfile(profile) || DEFAULT_PROFILE;
  const started = performance.now();
  const count = boundedInt(runs, 100, 2000);
  const variants = scenarios || buildResourceScenarios({ includeControls });
  const outcomes = new Map();
  const reports = [];
  let completed = 0;
  const total = count * variants.length;
  for (const variant of variants) {
    const results = [];
    for (let index = 0; index < count; index++) {
      const gameSeed = `${seed}:paired:combat:${index}`;
      results.push(runCampaign({ difficulty: variant.difficulty, resourceAccess: variant.resourceAccess, seed: gameSeed, policySeed: `${gameSeed}:actions`, profile, lookahead, maxActions }));
      completed += 1;
      onProgress?.({ completed, total, mode: 'combat', stage: 'ablation', variant: variant.id, difficulty: variant.difficulty });
      if (index % 2 === 0) await yieldToEventLoop();
    }
    outcomes.set(variant.id, results);
    reports.push({ ...variant, summary: summarizeCampaigns(results) });
  }
  const full = reports.find(variant => variant.disabledResources.length === 0 && variant.difficulty === 10);
  for (const variant of reports) if (full && variant !== full) variant.difference = pairedDifference(outcomes.get(variant.id), outcomes.get(full.id));
  const target = { preferred: 0.95, min: 0.9, max: 0.98, minimumSingleResourceDrop: 0.05, fullDefenseMin: 0.5 };
  const validation = validateResourceCalibration(reports, { target });
  return { version: 3, kind: 'resource-calibration', mode: 'combat', rules: structuredClone(DIFFICULTY), policyVersion: POLICY_VERSION, actionPolicies: structuredClone(ACTION_POLICIES), profile: structuredClone(profile), profileName: profile.version, seed, runs: count, lookahead, variants: validation.variants, target: { ...target, passed: validation.passed }, validation: { nominal: validation.nominal, singleD10: validation.singleD10 }, pairedSeeds: count, elapsedMs: performance.now() - started };
}

const campaignObjective = result => Number(result.won) * 1000 + result.clearedFloors * 50 + Math.min(1, Math.max(0, result.hp / result.maxHp)) * 2 + result.score * 0.0001;

async function evaluateProfile({ profile, difficulty, resourceAccess, runs, seed, split, lookahead, onProgress, progress, maxActions }) {
  const results = [];
  for (let index = 0; index < runs; index++) {
    const gameSeed = `${seed}:${split}:combat:${index}`;
    const result = runCampaign({ difficulty, resourceAccess, seed: gameSeed, policySeed: `${gameSeed}:actions`, profile, lookahead, maxActions });
    results.push(result);
    progress.completed += 1;
    onProgress?.({ ...progress, stage: split, mode: 'combat', difficulty, floor: result.floor });
    if (index % 2 === 0) await yieldToEventLoop();
  }
  return { objective: results.reduce((sum, result) => sum + campaignObjective(result), 0) / results.length, summary: summarizeCampaigns(results), modes: [{ mode: 'combat', difficulty, resourceAccess, ...summarizeCampaigns(results) }] };
}

function perturbProfile(base, random, generation) {
  const candidate = structuredClone(base);
  const keys = Object.keys(candidate.weights);
  // Preserve every profile field and let the same validator as the UI enforce bounds.
  const changes = Math.min(keys.length, 2 + Math.floor(random() * 3));
  for (let index = 0; index < changes; index++) {
    const key = keys[Math.floor(random() * keys.length)];
    const scale = Math.max(0.2, Math.abs(candidate.weights[key]));
    candidate.weights[key] = Math.max(0, Math.min(5, candidate.weights[key] + (random() * 2 - 1) * scale * (0.5 / (generation + 1))));
  }
  candidate.temperature = Math.max(0.25, Math.min(20, candidate.temperature * (0.65 + random() * 0.7)));
  const valid = validateProfile(candidate);
  return valid && typeof valid === 'object' ? valid : valid === true ? candidate : structuredClone(base);
}

/** Disjoint train / validation / holdout seeds; a failed holdout never replaces the profile. */
export async function trainProfile({ mode = 'combat', difficulty = 10, resourceAccess, runs = 40, seed = 'training-v1', profile = DEFAULT_PROFILE, generations = 2, candidates = 4, holdoutRuns, lookahead = true, explorationLookahead = false, onProgress, maxActions } = {}) {
  requireCombat(mode);
  profile = validateProfile(profile) || DEFAULT_PROFILE;
  difficulty = normalizeDifficulty(difficulty);
  resourceAccess = normalizeResourceAccess(resourceAccess);
  const started = performance.now();
  const count = boundedInt(runs, 40, 250);
  const generationCount = boundedInt(generations, 2, 4);
  const candidateCount = boundedInt(candidates, 4, 6);
  const holdoutCount = boundedInt(holdoutRuns, Math.max(60, count), 500);
  const progress = { completed: 0, total: count * (1 + generationCount * candidateCount + generationCount + 1) + holdoutCount * 2 };
  const random = createPolicyRandom(`${seed}:mutation`);
  const training = [];
  let best = structuredClone(profile);
  let bestTraining = await evaluateProfile({ profile: best, difficulty, resourceAccess, runs: count, seed, split: 'train', lookahead: explorationLookahead, onProgress, progress, maxActions });
  let bestValidation = await evaluateProfile({ profile: best, difficulty, resourceAccess, runs: count, seed, split: 'validation', lookahead: explorationLookahead, onProgress, progress, maxActions });
  const baselineTraining = bestTraining;
  const baselineValidation = bestValidation;
  for (let generation = 0; generation < generationCount; generation++) {
    let candidateBest = best;
    let candidateEvaluation = bestTraining;
    for (let index = 0; index < candidateCount; index++) {
      const candidate = perturbProfile(best, random, generation);
      const evaluation = await evaluateProfile({ profile: candidate, difficulty, resourceAccess, runs: count, seed, split: 'train', lookahead: explorationLookahead, onProgress, progress, maxActions });
      training.push({ generation: generation + 1, candidate: index + 1, objective: evaluation.objective, winRate: evaluation.summary.winRate, avgFloor: evaluation.summary.avgFloor });
      if (evaluation.objective > candidateEvaluation.objective) { candidateBest = candidate; candidateEvaluation = evaluation; }
    }
    const validation = await evaluateProfile({ profile: candidateBest, difficulty, resourceAccess, runs: count, seed, split: 'validation', lookahead: explorationLookahead, onProgress, progress, maxActions });
    if (validation.objective > bestValidation.objective) { best = candidateBest; bestTraining = candidateEvaluation; bestValidation = validation; }
  }
  const baselineHoldout = await evaluateProfile({ profile, difficulty, resourceAccess, runs: holdoutCount, seed, split: 'holdout', lookahead, onProgress, progress, maxActions });
  const candidateHoldout = await evaluateProfile({ profile: best, difficulty, resourceAccess, runs: holdoutCount, seed, split: 'holdout', lookahead, onProgress, progress, maxActions });
  const changed = JSON.stringify(best.weights) !== JSON.stringify(profile.weights) || best.temperature !== profile.temperature;
  const accepted = changed && candidateHoldout.objective > baselineHoldout.objective && candidateHoldout.summary.winRate >= baselineHoldout.summary.winRate && candidateHoldout.summary.avgClearedFloors >= baselineHoldout.summary.avgClearedFloors;
  return {
    version: 3, kind: 'combat-training', seed, difficulty, resourceAccess, rules: structuredClone(DIFFICULTY), policyVersion: POLICY_VERSION, actionPolicies: structuredClone(ACTION_POLICIES), mode: 'combat', runs: count, holdoutRuns: holdoutCount, generations: generationCount, candidates: candidateCount,
    accepted, baselineProfile: structuredClone(profile), profile: accepted ? best : structuredClone(profile), candidateProfile: best,
    baseline: baselineHoldout, trained: candidateHoldout,
    holdout: { baseline: baselineHoldout, candidate: candidateHoldout, separateFromTraining: true, lookahead },
    training: { baseline: baselineTraining, best: bestTraining, evaluations: training, lookahead: explorationLookahead },
    validation: { baseline: baselineValidation, best: bestValidation },
    completed: progress.completed, elapsedMs: performance.now() - started,
  };
}
