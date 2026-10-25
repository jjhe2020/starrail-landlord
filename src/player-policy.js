// Research-only player policies. This module is never imported by the game UI.
import { CHARACTERS, ITEMS, ESSENCES, characterById, essenceById } from './content.js';
import { spin, chooseReward, skipReward, rerollRewards, removeSymbol, purchaseSupply, getCharacterAttributes } from './engine.js';
import { recommendAction, recommendRewards, estimateEffectsForAi } from './ai.js';
import { DEFAULT_PROFILE } from './ai-profile.js';
import { buildTagStrategies, strategyMatches } from './balance-v080.js';

export const PLAYER_POLICY_VERSION = 'player-matrix-policies-v1';
export const FEATURE_BUDGET = Object.freeze({ boards: 4, rerollOffers: 3 });
export const POLICY_HORIZONS = Object.freeze([
  Object.freeze({ id: 'short', name: '短期战力', lambdaF: .35 }),
  Object.freeze({ id: 'balanced', name: '均衡', lambdaF: 1 }),
  Object.freeze({ id: 'greedy', name: '贪婪投资', lambdaF: 2 }),
]);
export const POLICY_RANDOMNESS = Object.freeze([
  Object.freeze({ id: 'deterministic', epsilon: 0 }), Object.freeze({ id: 'mixed', epsilon: .15 }), Object.freeze({ id: 'random', epsilon: .45 }),
]);
export const POLICY_RESOURCES = Object.freeze([
  Object.freeze({ id: 'active', name: '积极投入', lambdaR: .5 }), Object.freeze({ id: 'balanced', name: '均衡经营', lambdaR: 1 }), Object.freeze({ id: 'reserve', name: '偏重储备', lambdaR: 2 }),
]);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const round = x => Math.round(x * 1e9) / 1e9;
const average = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const hash = value => { let h = 2166136261; for (const c of String(value)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) || 1; };
const deepFreeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(deepFreeze); } return value; };
const canonicalJson = value => JSON.stringify((function ordered(input) { if (Array.isArray(input)) return input.map(ordered); if (!input || typeof input !== 'object') return input; return Object.fromEntries(Object.keys(input).sort().map(key => [key, ordered(input[key])])); })(value));
const PUBLIC_STATE_FIELDS = new Set(['version', 'mode', 'difficulty', 'resourceAccess', 'uidCounter', 'phase', 'floor', 'round', 'spinsLeft', 'coins', 'hp', 'maxHp', 'shield', 'rerolls', 'removals', 'resourceStats', 'supplyPurchases', 'overclockReady', 'activeDebuffs', 'bossStage', 'bossStages', 'roster', 'board', 'items', 'essences', 'enemies', 'choices', 'pendingRewards', 'pendingFloor', 'endless', 'lastSpin', 'lastTurnDeletions', 'history', 'stats', 'retirementStats', 'enemySkill', 'enemyIntent', 'encounter', 'migratedFromVersion']);
const isReward = state => ['recruit', 'item', 'essence'].includes(state?.phase);
const recruitableCharacters = CHARACTERS.filter(c => c.recruitable !== false);
const tags = buildTagStrategies().map(tag => ({ ...tag, memberIds: CHARACTERS.filter(c => c.recruitable !== false && strategyMatches(c, tag)).map(c => c.id) }));
function policy(T, H, J, R, { id, control = null } = {}) {
  return deepFreeze({ id: id || `matrix:${T.id}|H:${H.id}|J:${J.id}|R:${R.id}`, version: PLAYER_POLICY_VERSION, kind: control ? 'control' : 'matrix', control,
    T: structuredClone(T), H: { ...H }, J: { ...J }, R: { ...R }, teamId: T.id, horizonId: H.id, randomnessId: J.id, resourceId: R.id, budget: { ...FEATURE_BUDGET } });
}
const mainPolicies = tags.flatMap(T => POLICY_HORIZONS.flatMap(H => POLICY_RANDOMNESS.flatMap(J => POLICY_RESOURCES.map(R => policy(T, H, J, R)))));
const controls = POLICY_RESOURCES.map(R => policy(tags[0], POLICY_HORIZONS[1], { id: 'uniform', epsilon: 1 }, R, { id: `control:uniform:${R.id}`, control: 'uniform-reward' }));
controls.push(policy(tags[0], POLICY_HORIZONS[1], { id: 'current', epsilon: null }, POLICY_RESOURCES[1], { id: 'control:current-ai', control: 'current-ai' }));
const allPolicies = [...mainPolicies, ...controls], byId = new Map(allPolicies.map(p => [p.id, p]));
export function buildPlayerPolicies({ includeControls = true } = {}) { return includeControls ? allPolicies.slice() : mainPolicies.slice(); }
export function getPlayerPolicy(id) {
  const p = byId.get(typeof id === 'object' ? id?.id : id);
  if (!p) throw new Error(`Unknown player policy: ${typeof id === 'string' ? id : id?.id}`);
  if (id && typeof id === 'object') for (const key of ['version', 'T', 'H', 'J', 'R', 'budget']) if (Object.hasOwn(id, key) && canonicalJson(id[key]) !== canonicalJson(p[key])) throw new Error(`Policy metadata differs from its frozen ID: ${key}`);
  return p;
}
export const FEATURE_DEFINITION = deepFreeze({ version: 'public-four-board-features-v1', formula: 'U=N+lambdaF*F+T-lambdaR*C', currentWeights: { actualDamage: 1, netHp: .6, netShield: .35 }, tagIqrMultiplier: .75, futureHorizon: 'min(24,spinsLeft+3.2*(12-floor))-1; zero beyond terminal', futureCategories: ['new-permanent-growth', 'future-income', 'incomplete-merge', 'delayed-essence', 'trained-utility'], resourceCosts: ['credits', 'reroll-charges', 'removal-charges', 'purchase-slots'], continuation: 'skip-unselected-pending-rewards', noTerminalBankBonus: true, seedDerivation: 'canonical-public-state-v1' });
export function playerPolicyManifest() { return { version: PLAYER_POLICY_VERSION, featureDefinition: FEATURE_DEFINITION, budget: { ...FEATURE_BUDGET }, teams: structuredClone(tags), policies: buildPlayerPolicies() }; }

/** Never inspect or clone real hidden seeds. Even throwing getters for these keys are safe. */
export function publicPlayerState(state) {
  const copy = value => {
    if (Array.isArray(value)) return value.map(copy);
    if (!value || typeof value !== 'object') return value;
    const result = {};
    for (const key of Object.keys(value)) if (!['seed', 'rngState', 'policySeed', 'behaviorRng', 'behaviorRandom'].includes(key)) result[key] = copy(value[key]);
    return result;
  };
  const result = state && typeof state === 'object' ? Object.fromEntries(Object.keys(state).filter(key => PUBLIC_STATE_FIELDS.has(key)).map(key => [key, copy(state[key])])) : null;
  if (!result || typeof result !== 'object') return null;
  result.seed = 'public-counterfactual'; result.rngState = 1;
  return result;
}
export function createPlayerRandom(seedOrSnapshot = 'matrix-behavior') {
  const restored = seedOrSnapshot && typeof seedOrSnapshot === 'object';
  if (restored && (seedOrSnapshot.algorithm !== 'xorshift32-v1' || !Number.isSafeInteger(seedOrSnapshot.state) || seedOrSnapshot.state < 1 || seedOrSnapshot.state > 0xffffffff || !Number.isSafeInteger(seedOrSnapshot.count) || seedOrSnapshot.count < 0)) throw new Error('Invalid player RNG snapshot.');
  let state = restored ? seedOrSnapshot.state : hash(seedOrSnapshot), count = restored ? seedOrSnapshot.count : 0;
  const next = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state = (state >>> 0) || 1; count++; return state / 4294967296; };
  next.snapshot = () => ({ algorithm: 'xorshift32-v1', state, count });
  return next;
}
export function samplePlayerRecommendation(recommendation, randomNumber) {
  const choices = recommendation.choices || recommendation.recommendation?.choices;
  if (!Array.isArray(choices) || !choices.length || !Number.isFinite(randomNumber) || randomNumber < 0 || randomNumber >= 1) throw new Error('Cannot sample an invalid player recommendation.');
  const mass = choices.reduce((sum, choice) => sum + choice.probability, 0);
  if (choices.some(choice => !Number.isFinite(choice.probability) || choice.probability < 0 || choice.probability > 1) || Math.abs(mass - 1) > 1e-8) throw new Error('Player probabilities do not sum to one.');
  let total = 0;
  for (const choice of choices) { total += choice.probability; if (randomNumber < total) return choice; }
  if (Math.abs(total - 1) > 1e-8) throw new Error('Player probabilities do not sum to one.');
  return choices.at(-1);
}
export function applyPlayerRecommendation(state, action) {
  if (action.type === 'spin') return spin(state);
  if (action.type === 'remove') return removeSymbol(state, action.uid);
  if (action.type === 'reroll') return rerollRewards(state);
  if (action.type === 'supply') return purchaseSupply(state, action.kind || action.supplyKind);
  if (action.action === 'skip') return skipReward(state);
  if (action.action === 'choose') return chooseReward(state, action.index);
  return state;
}

const cache = new Map();
const CACHE_LIMIT = 256;
const counters = { states: 0, hits: 0, spins: 0, offerGroups: 0 };
export function clearPlayerPolicyCache() { cache.clear(); for (const k of Object.keys(counters)) counters[k] = 0; }
export function playerPolicyCacheStats() { return { ...counters, entries: cache.size, maxEntries: CACHE_LIMIT }; }
const stateKey = state => {
  const { history, lastSpin, seed, rngState, ...relevant } = state;
  // The visible board can affect acquisition/floor/passive rules before the
  // next layout is drawn. It belongs in both cache and counterfactual keys.
  // Narrative history and last-spin details are reset before trial spins.
  return canonicalJson({ ...relevant, lastSpin: { floor: lastSpin?.floor, round: lastSpin?.round } });
};
function ready(state) { let next = state; for (let i = 0; isReward(next) && i < 4; i++) next = skipReward(next); return next; }
function horizon(state) { return state.floor > 12 || state.phase === 'victory' || state.phase === 'defeat' ? 0 : Math.max(0, Math.min(24, state.spinsLeft + Math.max(0, 12 - state.floor) * 3.2)); }
const totalAttack = state => state.roster.reduce((sum, unit) => sum + getCharacterAttributes(unit, state).attack, 0);
const normalFactor = (unit, state) => { const a = getCharacterAttributes(unit, state).normalAttack, n = state.enemies.filter(e => e.hp > 0).length; return a.pattern === 'aoe' ? a.eachTarget * Math.max(1, n) : a.pattern === 'blast' ? a.primary + a.adjacent * Math.min(2, Math.max(0, n - 1)) : a.primary; };
function futureFeatures(state, samples) {
  const turns = Math.max(0, horizon(state) - 1), draw = Math.min(1, 20 / Math.max(1, state.roster.length));
  if (turns <= 0) return { total: 0, turns: 0, growth: 0, economy: 0, merge: 0, essence: 0, utilityGrowth: 0, estimated: [] };
  const threat = state.enemyIntent?.damage || state.enemies.reduce((a, e) => a + (e.hp > 0 ? e.attack : 0), 0);
  const outputs = average(samples.map(s => s.damage));
  const estimate = estimateEffectsForAi(state, { horizon: turns + 1, output: outputs, threat });
  const growthByUid = [...estimate.growthRates].map(([uid, rate]) => {
    const unit = state.roster.find(u => u.uid === uid);
    return Math.max(0, rate) * Math.max(0, estimate.growthMultiplier) * turns * .5 * draw * (unit ? Math.max(.3, normalFactor(unit, state)) : 0);
  });
  const growth = growthByUid.reduce((a, b) => a + b, 0), utilityGrowth = Math.max(0, estimate.utilityGrowth || 0);
  // New future income, rather than the current unspent bank. Bound its utility
  // by purchase opportunities remaining before floor 12.
  const creditUnit = .3 + Math.min(1.5, totalAttack(state) / 120);
  const futureSpendCap = Math.max(0, 2 * (13 - state.floor) - (state.supplyPurchases || 0)) * 16;
  const income = Math.max(0, estimate.economy || 0) * turns;
  const economy = Math.min(income, futureSpendCap) * creditUnit + Math.max(0, estimate.flexibility || 0) * Math.min(3, turns / 4);
  let merge = 0;
  const copies = new Map();
  for (const unit of state.roster) { const key = `${unit.id}:${unit.stars}`; copies.set(key, (copies.get(key) || 0) + 1); }
  for (const c of recruitableCharacters) for (const stars of [1, 2]) {
    const count = copies.get(`${c.id}:${stars}`) || 0;
    if (count === 1 || count === 2) {
      const neededBaseCopies = (3 - count) * (stars === 1 ? 1 : 3);
      // An explicitly approximate, public-pool future opportunity. Immediate
      // completed merges already changed N and never receive this pair bonus.
      const exposure = Math.min(1, turns * 3 / recruitableCharacters.length);
      merge += getCharacterAttributes({ id: c.id, stars }).starAttack * 2 * exposure ** neededBaseCopies * draw;
    }
  }
  let essence = 0;
  const delayed = [];
  for (const entry of state.essences.filter(e => !e.triggered)) {
    const definition = essenceById(entry.id);
    if (!definition) continue;
    const rate = average(samples.map(sample => Math.max(0, (sample.essences.find(e => e.id === entry.id)?.progress || entry.progress || 0) - (entry.progress || 0))));
    const remaining = Math.max(0, definition.target - (entry.progress || 0));
    const eta = rate > 0 ? remaining / rate : Infinity;
    if (!(eta <= turns + 1)) { delayed.push({ kind: 'essence', id: entry.id, eta: Number.isFinite(eta) ? eta : null, beforeEnd: false }); continue; }
    const activation = { [entry.id]: Math.max(0, 1 - eta / (turns + 1)) };
    const active = estimateEffectsForAi(state, { horizon: turns + 1, output: outputs, threat, activations: activation });
    const benefit = Math.max(0, active.damage - estimate.damage) + Math.max(0, active.healing - estimate.healing + active.shields - estimate.shields) * .4 + Math.max(0, active.economy - estimate.economy) * creditUnit * Math.max(0, turns - eta);
    const persistent = definition.effects.some(e => e.trigger === 'passive');
    essence += benefit * (persistent ? Math.min(3, Math.max(0, turns - eta) / 2) : 1);
    delayed.push({ kind: 'essence', id: entry.id, eta: round(eta), beforeEnd: true, value: round(benefit) });
  }
  return { total: growth + economy + merge + essence + utilityGrowth, turns: round(turns), growth, economy, merge, essence, utilityGrowth,
    estimated: [{ kind: 'permanent-growth', eta: 2, value: round(growth) }, { kind: 'future-income', eta: 2, value: round(economy) }, { kind: 'incomplete-merge', eta: round(turns / 2), value: round(merge) }, ...delayed] };
}
function resourceCost(before, after, action) {
  const turns = horizon(before), continuation = Math.min(1, Math.max(0, turns - 1) / 12);
  const creditUnit = (.3 + Math.min(1.5, totalAttack(before) / 120)) * continuation;
  const credits = Math.max(0, before.coins - after.coins), rerolls = Math.max(0, before.rerolls - after.rerolls), removals = Math.max(0, before.removals - after.removals);
  const creditCost = credits * creditUnit;
  const rerollCost = rerolls * (1 + continuation * 2) / Math.max(1, before.rerolls * .5);
  const removalCost = removals * (1.5 + continuation * 2) / Math.max(1, before.removals * .5);
  const slotCost = action.type === 'supply' ? .5 * Math.min(1, before.spinsLeft / 2) : 0;
  return { total: creditCost + rerollCost + removalCost + slotCost, credits, rerolls, removals, purchaseSlots: Number(action.type === 'supply'), creditCost, rerollCost, removalCost, slotCost };
}
function transition(state, action) { return applyPlayerRecommendation(state, action); }
function feature(state, action, key, baseline = null) {
  const candidateSeed = hash(`${key}/candidate-base`), original = { ...state, rngState: candidateSeed };
  const next = action.type === 'baseline' ? original : transition(original, action);
  if (next === original && action.type !== 'baseline') return null;
  const prepared = ready(next);
  if (prepared.phase !== 'ready') return { N: prepared.phase === 'victory' ? 1000 : -1000, F: 0, C: 0, breakdown: { terminal: prepared.phase, future: { turns: 0, estimated: [] } }, action };
  const samples = [], attack = totalAttack(state);
  for (let sample = 0; sample < FEATURE_BUDGET.boards; sample++) {
    // resolveSpin overwrites lastSpin before reading it; history is write-only.
    // Omit historical display ledgers from these private trial copies.
    const trial = { ...prepared, history: [], lastSpin: null, rngState: hash(`${key}/board/${sample}`) };
    const outcome = spin(trial); counters.spins++;
    const damage = outcome.lastSpin.damage, hp = outcome.hp - state.hp, shield = outcome.shield - state.shield;
    const survival = outcome.phase === 'defeat' ? -Math.max(30, attack * 3) : 0;
    const clear = outcome.phase === 'victory' || outcome.pendingFloor ? Math.max(1, attack * .08) : 0;
    samples.push({ damage, hp, shield, survival, clear, canContinue: !['victory', 'defeat'].includes(outcome.phase), N: damage + hp * .6 + shield * .35 + survival + clear, essences: outcome.essences });
  }
  const current = { damage: average(samples.map(s => s.damage)), hp: average(samples.map(s => s.hp)), shield: average(samples.map(s => s.shield)), survival: average(samples.map(s => s.survival)), clear: average(samples.map(s => s.clear)) };
  const future = futureFeatures(prepared, samples), cost = resourceCost(state, next, action);
  future.survivalProbability = average(samples.map(sample => Number(sample.canContinue)));
  future.unconditionalValue = future.total * future.survivalProbability;
  return { N: average(samples.map(s => s.N)), F: future.unconditionalValue, C: cost.total, breakdown: { current, future, cost, budget: { boards: FEATURE_BUDGET.boards } }, action };
}
function rewardActions(state) { return [...state.choices.map((id, index) => ({ type: 'reward', action: 'choose', id, index })), { type: 'reward', action: 'skip', id: 'skip', index: state.choices.length }]; }
function resourceActions(state) {
  const result = [];
  if (state.resourceAccess?.removals !== false && state.removals > 0) for (const unit of state.roster) result.push({ type: 'remove', uid: unit.uid });
  if (state.phase === 'ready') for (const kind of ['repair', 'barrier', 'overclock']) {
    const next = purchaseSupply(state, kind); if (next !== state) result.push({ type: 'supply', kind });
  }
  return result;
}
function addToCache(key, value) { cache.set(key, value); if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value); return value; }
function featuresFor(state) {
  const key = stateKey(state), cached = cache.get(key);
  if (cached) { counters.hits++; return cached; }
  counters.states++;
  const base = feature(state, { type: 'baseline' }, key);
  const evaluate = action => feature(state, action, key);
  const rewards = isReward(state) ? rewardActions(state).map(action => action.action === 'skip' ? { ...base, action } : evaluate(action)).filter(Boolean) : [];
  const resources = resourceActions(state).map(evaluate).filter(Boolean);
  const rerollGroups = [];
  if (isReward(state) && rerollRewards(state) !== state) {
    for (let sample = 0; sample < FEATURE_BUDGET.rerollOffers; sample++) {
      const hidden = { ...state, rngState: hash(`${key}/unknown-offer/${sample}`) }, renewed = rerollRewards(hidden); counters.offerGroups++;
      rerollGroups.push({ cost: resourceCost(state, renewed, { type: 'reroll' }), rows: rewardActions(renewed).map(action => feature(renewed, action, `${key}/reroll/${sample}`)).filter(Boolean) });
    }
  }
  return addToCache(key, { key, base, rewards, resources, rerollGroups, budget: { ...FEATURE_BUDGET } });
}
function quantile(values, q) { const a = values.slice().sort((x, y) => x - y), at = (a.length - 1) * q, i = Math.floor(at); return a[i] + (a[Math.ceil(at)] - a[i]) * (at - i); }
export function rewardProbabilities(scores, epsilon) {
  if (!scores.length || !scores.every(Number.isFinite) || !Number.isFinite(epsilon) || epsilon < 0 || epsilon > 1) throw new Error('Invalid reward probability input.');
  const max = Math.max(...scores), best = scores.map((v, i) => Math.abs(v - max) <= 1e-9 ? i : -1).filter(i => i >= 0);
  return scores.map((value, i) => epsilon / scores.length + (best.includes(i) ? (1 - epsilon) / best.length : 0));
}
function scoreRows(features, base, p, state) {
  if (!features.length) return [];
  const rows = features.map(row => ({ ...row, N: row.N - base.N, F: row.F - base.F, T: 0 }));
  const withoutTag = rows.map(row => row.N + p.H.lambdaF * row.F - p.R.lambdaR * row.C);
  const scale = Math.max(1, quantile(withoutTag, .75) - quantile(withoutTag, .25));
  return rows.map((row, i) => {
    const T = state.phase === 'recruit' && row.action.action === 'choose' && strategyMatches(characterById(row.action.id), p.T) ? .75 * scale : 0;
    const U = withoutTag[i] + T;
    return { ...row.action, N: round(row.N), F: round(row.F), T: round(T), C: round(row.C), U: round(U), score: round(U), breakdown: row.breakdown };
  });
}
function auditRow(row) { return { kind: row.type, key: row.type === 'remove' ? `remove:${row.uid}` : row.type === 'supply' ? `supply:${row.kind}` : 'reroll', ...(row.uid ? { uid: row.uid } : {}), ...(row.kind ? { supplyKind: row.kind } : {}), N: row.N, F: row.F, T: row.T, C: row.C, U: row.U, score: row.U, worthwhile: row.U > 1e-9 }; }
export function recommendPlayerAction(input, policyInput, { blockedKinds = [] } = {}) {
  const p = getPlayerPolicy(policyInput?.policy || policyInput), state = publicPlayerState(input);
  if (!state || !['ready', 'recruit', 'item', 'essence'].includes(state.phase)) return { type: 'stop', policyId: p.id, audit: { legalOpportunities: [], worthwhileOpportunities: [], blockedKinds } };
  if (p.control === 'current-ai') {
    const planned = recommendAction(state, { profile: DEFAULT_PROFILE, lookahead: true });
    // This anchor intentionally retains the original planner instead of claiming
    // an N/F decomposition it does not provide.
    if (blockedKinds.includes(planned.type)) {
      if (isReward(state)) { const recommendation = recommendRewards(state, { profile: DEFAULT_PROFILE, lookahead: true }); return { type: 'reward', policyId: p.id, recommendation, choices: recommendation.choices, audit: { legalOpportunities: [], worthwhileOpportunities: [], normalPlannedAction: planned, blockedKinds }, diagnostics: { anchor: true, decompositionUnavailable: true, blockedFallback: 'original-reward-planner' } }; }
      return { type: 'spin', policyId: p.id, audit: { legalOpportunities: [], worthwhileOpportunities: [], normalPlannedAction: planned, blockedKinds }, diagnostics: { anchor: true, decompositionUnavailable: true } };
    }
    return { ...planned, policyId: p.id, ...(planned.type === 'reward' ? { choices: planned.recommendation.choices } : {}), audit: { legalOpportunities: [], worthwhileOpportunities: [], normalPlannedAction: planned, blockedKinds }, diagnostics: { anchor: true, decompositionUnavailable: true } };
  }
  const f = featuresFor(state), choices = isReward(state) ? scoreRows(f.rewards, f.base, p, state) : [];
  const probabilities = choices.length ? rewardProbabilities(choices.map(c => c.U), p.J.epsilon) : [];
  choices.forEach((c, i) => { c.probability = probabilities[i]; });
  const rewardValue = choices.reduce((sum, c) => sum + c.probability * c.U, 0);
  let resources = scoreRows(f.resources, f.base, p, { ...state, phase: 'ready' });
  if (f.rerollGroups.length) {
    const groups = f.rerollGroups.map(group => {
      const rows = scoreRows(group.rows, f.base, p, state), probabilities = rewardProbabilities(rows.map(row => row.U), p.J.epsilon);
      return { N: rows.reduce((a, row, i) => a + row.N * probabilities[i], 0), F: rows.reduce((a, row, i) => a + row.F * probabilities[i], 0), T: rows.reduce((a, row, i) => a + row.T * probabilities[i], 0), C: group.cost.total };
    });
    const row = { type: 'reroll', N: average(groups.map(g => g.N)), F: average(groups.map(g => g.F)), T: average(groups.map(g => g.T)), C: average(groups.map(g => g.C)), breakdown: { expectedOffers: FEATURE_BUDGET.rerollOffers, groups } };
    row.U = row.N + p.H.lambdaF * row.F + row.T - p.R.lambdaR * row.C; row.score = row.U; resources.push(row);
  }
  const chooseResource = rows => rows.filter(row => row.U > Math.max(0, rewardValue) + 1e-9).sort((a, b) => b.U - a.U || auditRow(a).key.localeCompare(auditRow(b).key))[0];
  const normal = chooseResource(resources), allowed = chooseResource(resources.filter(row => !blockedKinds.includes(row.type)));
  const normalAction = normal || (isReward(state) ? { type: 'reward' } : { type: 'spin' });
  const audit = { legalOpportunities: resources.map(auditRow), worthwhileOpportunities: resources.filter(row => row.U > 1e-9).map(auditRow), normalPlannedAction: { type: normalAction.type, ...(normalAction.uid ? { uid: normalAction.uid } : {}), ...(normalAction.kind ? { kind: normalAction.kind } : {}) }, blockedKinds: blockedKinds.slice() };
  const diagnostics = { version: PLAYER_POLICY_VERSION, budget: { ...FEATURE_BUDGET }, stateDigest: hash(f.key).toString(16), N: 'four sampled immediate combat outcomes', F: 'new growth, future income, incomplete merges and delayed essence effects; capped at floor 12', C: 'resource opportunity cost independent of H', continuation: 'skip-unselected-pending-rewards', epsilon: p.J.epsilon };
  if (allowed) return { ...allowed, policyId: p.id, rewardChoices: choices, components: { N: allowed.N, F: allowed.F, T: allowed.T, C: allowed.C, U: allowed.U }, audit, diagnostics };
  if (isReward(state)) return { type: 'reward', choices, recommendation: { choices }, policyId: p.id, audit, diagnostics: { ...diagnostics, entropy: -choices.reduce((sum, c) => sum + (c.probability ? c.probability * Math.log(c.probability) : 0), 0) } };
  return { type: 'spin', policyId: p.id, components: { N: 0, F: 0, T: 0, C: 0, U: 0 }, audit, diagnostics };
}
