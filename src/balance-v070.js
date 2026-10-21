import { CHARACTERS, characterById, SYNERGIES } from './content.js';
import { newGame, spin, inspectSpin, chooseReward, skipReward, removeSymbol, rerollRewards, purchaseSupply } from './engine.js';
import { recommendAction, createPolicyRandom, sampleRecommendation, DEFAULT_PROFILE } from './ai.js';
import { matchesEffectFilter } from './effect-rules.js';
import { wilsonInterval } from './simulation.js';

export const V070_PROTOCOL = Object.freeze({ version: 'v070-spatial-balance-v3', cardBatches: [128, 256, 384, 512], campaignBatches: [100, 200, 300, 400], cardMargin: .35, strategyMargin: .10, alpha: .05, looks: 4, futureSpins: 6, preferenceStrength: 10, rosterSize: 12 });
export const STAGES = Object.freeze([{ id: 'early', stars: 1, growth: 0, ticks: 0 }, { id: 'mid', stars: 2, growth: 2, ticks: 6 }, { id: 'late', stars: 2, growth: 6, ticks: 12 }]);
export const ENEMY_SCENARIOS = Object.freeze([
  { id: 'standard', count: 5, hp: 1e7, attack: 5, skill: 'none', boss: false },
  { id: 'killable', count: 5, hp: 18, attack: 5, skill: 'none', boss: false },
  { id: 'armor', count: 5, hp: 1e7, attack: 5, skill: 'armor', boss: false },
  { id: 'boss', count: 1, hp: 1e7, attack: 25, skill: 'none', boss: false, description: '单目标高血靶；不触发自然首领阶段条款' },
  { id: 'retaliation', count: 5, hp: 1e7, attack: 14, skill: 'pressure', boss: false },
]);
const ROLES = ['attack', 'defense', 'amplifier', 'trainer', 'disruptor'];
const METRICS = ['damage', 'hpLost', 'healing', 'shieldGenerated', 'shieldBlocked', 'shieldRemaining', 'growth', 'retainedGrowthDelta', 'coins', 'directDamage'];
const round = value => Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null;
export const hashSeed = value => { let h = 2166136261; for (const c of String(value)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) || 1; };
function randomFor(seed) { let state = hashSeed(seed); return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; }; }
function shuffled(values, seed) { const result = [...values], random = randomFor(seed); for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
export function mean(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; }
export function median(values) { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; }

// Student-t intervals, implemented independently of the simulation reporting helpers.
function logGamma(z) {
  const p = [676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905, -.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7];
  if (z < .5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  z--; let x = .99999999999980993; for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1); const t = z + p.length - .5;
  return .5 * Math.log(2 * Math.PI) + (z + .5) * Math.log(t) - t + Math.log(x);
}
function betaFraction(a, b, x) {
  let c = 1, d = 1 - (a + b) * x / (a + 1); if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const delta = d * c; h *= delta; if (Math.abs(delta - 1) < 3e-14) break;
  } return h;
}
function incompleteBeta(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const factor = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
  return x < (a + 1) / (a + b + 2) ? factor * betaFraction(a, b, x) / a : 1 - factor * betaFraction(b, a, 1 - x) / b;
}
export function studentTCdf(t, df) { if (!(df > 0)) throw new Error('df must be positive'); const tail = .5 * incompleteBeta(df / (df + t * t), df / 2, .5); return t < 0 ? tail : 1 - tail; }
function calculateStudentTQuantile(probability, df) {
  if (!(probability > 0 && probability < 1 && df > 0)) throw new Error('Invalid Student-t quantile');
  if (probability < .5) return -studentTQuantile(1 - probability, df); let low = 0, high = 1; while (studentTCdf(high, df) < probability) high *= 2;
  for (let i = 0; i < 90; i++) { const middle = (low + high) / 2; if (studentTCdf(middle, df) < probability) low = middle; else high = middle; } return (low + high) / 2;
}
const studentTQuantiles = new Map();
export function studentTQuantile(probability, df) {
  const key = `${probability}:${df}`;
  if (studentTQuantiles.has(key)) return studentTQuantiles.get(key);
  const value = calculateStudentTQuantile(probability, df);
  studentTQuantiles.set(key, value);
  return value;
}
export function interval(values, confidence = .95) {
  if (values.some(value => !Number.isFinite(value))) throw new Error('Nonfinite observation');
  const n = values.length, center = mean(values); if (n < 2) return { n, mean: round(center), sd: null, se: null, ci: [null, null], confidence, p: null };
  const sd = Math.sqrt(values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (n - 1)), se = sd / Math.sqrt(n), radius = studentTQuantile((1 + confidence) / 2, n - 1) * se;
  const p = se ? 2 * (1 - studentTCdf(Math.abs(center / se), n - 1)) : center ? 0 : 1;
  return { n, mean: round(center), sd: round(sd), se: round(se), ci: [round(center - radius), round(center + radius)], confidence, p: round(p) };
}
export function pairedInterval(a, b, confidence = .95) { if (a.length !== b.length) throw new Error('Pair lengths differ'); return interval(a.map((value, i) => value - b[i]), confidence); }
export function adjustFdr(tests) { const sorted = tests.map((test, index) => ({ ...test, index })).filter(test => Number.isFinite(test.p)).sort((a, b) => a.p - b.p); let adjusted = 1; for (let i = sorted.length - 1; i >= 0; i--) { adjusted = Math.min(adjusted, sorted[i].p * sorted.length / (i + 1)); sorted[i].q = round(adjusted); } const map = new Map(sorted.map(test => [test.index, test.q])); return tests.map((test, index) => ({ ...test, q: map.get(index) ?? null })); }
export function assessEquivalence(values, margin, { looks = V070_PROTOCOL.looks, family = 1 } = {}) {
  const ci95 = interval(values, .95), ci90 = interval(values, .90), decision = interval(values, 1 - 2 * V070_PROTOCOL.alpha / (looks * family));
  const [lo, hi] = decision.ci; let status = 'insufficient';
  if (Number.isFinite(lo) && lo > -margin && hi < margin) status = 'equivalent';
  else if (Number.isFinite(lo) && (lo > margin || hi < -margin)) status = 'outside';
  return { margin, ci95, ci90, decision, status, method: 'paired Student-t; alpha-spending across predeclared looks; optional Bonferroni family' };
}

/** Only public content tags determine preferences; no core roster or battle buff. */
export function buildTagStrategies() {
  const strategies = [{ id: 'baseline', name: '无标签偏好', filters: [], mode: 'any' }];
  for (const key of ['path', 'element', 'faction']) {
    const tags = [...new Set(CHARACTERS.map(c => c[key]))].filter(tag => CHARACTERS.filter(c => c[key] === tag).length >= 5).sort();
    for (const tag of tags) strategies.push({ id: `${key}:${tag}`, name: `${key === 'path' ? '命途' : key === 'element' ? '属性' : '阵营'}：${tag}`, filters: [{ [key]: tag }], mode: 'any' });
  }
  // Predeclared combinations are rule tags, recalculated against each content freeze.
  for (const filters of [[{ path: '巡猎' }, { faction: '仙舟罗浮' }], [{ path: '智识' }, { faction: '黑塔空间站' }], [{ element: '冰' }, { faction: '贝洛伯格' }], [{ path: '虚无' }, { faction: '星核猎手' }]]) {
    if (filters.every(filter => CHARACTERS.some(c => matchesTag(c, filter)))) strategies.push({ id: `mixed:${filters.map(filter => Object.entries(filter).flat().join(':')).join('+')}`, name: filters.map(filter => Object.values(filter)[0]).join('＋'), filters, mode: 'any' });
  }
  return strategies;
}
function matchesTag(character, filter) { return ['path', 'element', 'faction', 'role', 'attack'].every(key => filter[key] === undefined || character[key] === filter[key]); }
export function strategyMatches(character, strategy) { return strategy.filters.length > 0 && (strategy.mode === 'all' ? strategy.filters.every(filter => matchesTag(character, filter)) : strategy.filters.some(filter => matchesTag(character, filter))); }
export function biasTagRecommendation(state, recommendation, strategy, strength = V070_PROTOCOL.preferenceStrength) {
  if (state.phase !== 'recruit' || !strategy.filters.length || !strength) return recommendation;
  const scored = recommendation.choices.map(choice => ({ ...choice, tagBonus: choice.action === 'choose' && strategyMatches(characterById(choice.id), strategy) ? strength : 0 })).map(choice => ({ ...choice, score: choice.score + choice.tagBonus }));
  const max = Math.max(...scored.map(choice => choice.score)), masses = scored.map(choice => Math.exp(Math.max(-20, (choice.score - max) / DEFAULT_PROFILE.temperature))), total = masses.reduce((sum, mass) => sum + mass, 0);
  return { ...recommendation, choices: scored.map((choice, index) => ({ ...choice, probability: masses[index] / total })) };
}
function metrics(before, result, focusUid) {
  const after = result.state, record = after.lastSpin, effectRows = record.effects || [];
  if (Math.abs(result.hits.reduce((sum, hit) => sum + hit.amount, 0) - record.damage) > .03) throw new Error('Damage ledger does not reconcile');
  return { damage: record.damage, hpLost: before.hp - after.hp, healing: record.healing, shieldGenerated: record.shield, shieldBlocked: after.resourceStats.shieldBlocked - before.resourceStats.shieldBlocked, shieldRemaining: after.shield, growth: effectRows.filter(effect => effect.type === 'growth').reduce((sum, effect) => sum + (effect.amount || 0), 0), retainedGrowthDelta: after.roster.reduce((sum, unit) => sum + unit.growth, 0) - before.roster.reduce((sum, unit) => sum + unit.growth, 0), coins: record.coins, directDamage: result.hits.filter(hit => hit.sourceUid === focusUid && hit.sourceType === 'character').reduce((sum, hit) => sum + hit.amount, 0), triggered: effectRows.some(effect => effect.sourceUid === focusUid && effect.amount !== 0), focusPresent: after.board.some(unit => unit?.uid === focusUid), phase: after.phase };
}
function filterReferences(value, out = []) { if (!value || typeof value !== 'object') return out; if (value.filter && typeof value.filter === 'object') out.push(value.filter); for (const [key, nested] of Object.entries(value)) if (key !== 'filter' && nested && typeof nested === 'object') { if (Array.isArray(nested)) nested.forEach(entry => filterReferences(entry, out)); else filterReferences(nested, out); } return out; }
export function referenceRoster(focusId, background = 'generic', seed = 'reference') {
  const focus = characterById(focusId); if (!focus) throw new Error('Unknown focus');
  if (!['generic', 'compatible'].includes(background)) throw new Error('Unknown background');
  const source = { uid: 'focus', id: focus.id, stars: 1, growth: 0, ticks: 0 }, references = filterReferences(focus.effects);
  // Every member of a role/rarity comparison receives exactly the same peers.
  // The entire comparison stratum is excluded before deterministic shuffling.
  const pool = CHARACTERS.filter(c => background === 'generic' ? !(c.role === focus.role && c.rarity === focus.rarity) : c.id !== focusId);
  const candidates = shuffled(pool, seed);
  const score = character => references.reduce((sum, filter) => sum + Number(matchesEffectFilter({ uid: 'candidate', id: character.id, stars: 1 }, filter, source)), 0) + Number(character.path === focus.path) * .1 + Number(character.faction === focus.faction) * .1 + Number(character.element === focus.element) * .05;
  if (background === 'compatible') candidates.sort((a, b) => score(b) - score(a));
  const quotas = { attack: 5, defense: 2, amplifier: 1, trainer: 1, disruptor: 2 }, chosen = [focus]; quotas[focus.role] = Math.max(0, quotas[focus.role] - 1);
  for (const role of ROLES) chosen.push(...candidates.filter(c => c.role === role).slice(0, quotas[role]));
  for (const candidate of candidates) { if (chosen.length >= V070_PROTOCOL.rosterSize) break; if (!chosen.includes(candidate)) chosen.push(candidate); }
  return chosen.map((c, index) => ({ uid: index ? `peer${index}` : 'focus', id: c.id, stars: 1, growth: 0, ticks: 0 }));
}
export function layoutForRoster(roster, seed) { const cells = shuffled(Array.from({ length: 20 }, (_, i) => i), seed), layout = Array(20).fill(null); roster.forEach((unit, index) => { layout[cells[index]] = unit.uid; }); return layout; }
export function makeCardScenario({ focusId, background = 'generic', sample = 0, stage = STAGES[0], enemy = ENEMY_SCENARIOS[0], split = 'calibration', seed = 'v070' } = {}) {
  const state = newGame({ seed: `${seed}:${split}:card:${sample}` }), roster = referenceRoster(focusId, background, `${seed}:reference:${background}:sample:${sample}`);
  state.roster = roster.map(unit => ({ ...unit, stars: stage.stars, growth: stage.growth, ticks: stage.ticks + sample % 12 })); state.uidCounter = 100;
  state.phase = 'ready'; state.floor = stage.id === 'early' ? 2 : stage.id === 'mid' ? 6 : 10; state.round = sample % 12; state.spinsLeft = 100; state.hp = 300; state.maxHp = 600; state.shield = 0; state.items = []; state.essences = []; state.pendingFloor = false; state.pendingRewards = []; state.choices = []; state.activeDebuffs = []; state.overclockReady = false; state.bossStage = 0; delete state.pollution;
  state.enemySkill = { id: enemy.skill, name: enemy.id, description: '受控敌阵' };
  state.enemies = Array.from({ length: enemy.count }, (_, col) => ({ id: `probe${col}`, col: enemy.count === 1 ? 2 : col, hp: enemy.hp, maxHp: enemy.hp, attack: enemy.attack, boss: enemy.boss }));
  const layoutUids = layoutForRoster(state.roster, `${seed}:${split}:layout:${sample}`); state.board = layoutUids.map(uid => uid ? { ...state.roster.find(unit => unit.uid === uid) } : null);
  return { state, layoutUids };
}
/** Uses diagnostic engine hooks; never edits content or monkey-patches the spin. */
export function runCardSample(options = {}) {
  const { state, layoutUids } = makeCardScenario(options), focusUid = 'focus';
  const fullResult = inspectSpin(state, { layoutUids }), offResult = inspectSpin(state, { layoutUids, suppressSkillUids: [focusUid] });
  const absentLayout = layoutUids.map(uid => uid === focusUid ? null : uid), absentResult = inspectSpin(state, { layoutUids: absentLayout });
  // Fail closed on an older engine, which would silently ignore the intervention.
  if (fullResult.diagnostics?.protocol !== 'spin-interventions-v1') throw new Error('inspectSpin intervention interface is not available.');
  const permuted = layoutForRoster(state.roster, `${options.seed || 'v070'}:${options.split || 'calibration'}:permuted:${options.sample || 0}`), movedResult = inspectSpin(state, { layoutUids: permuted }), movedOffResult = inspectSpin(state, { layoutUids: permuted, suppressSkillUids: [focusUid] });
  const full = metrics(state, fullResult, focusUid), off = metrics(state, offResult, focusUid), moved = metrics(state, movedResult, focusUid), absent = metrics(state, absentResult, focusUid), movedOff = metrics(state, movedOffResult, focusUid);
  const presence = Object.fromEntries(METRICS.map(key => [key, round(full[key] - absent[key])])), delta = Object.fromEntries(METRICS.map(key => [key, round(full[key] - off[key])])), spatialTeam = Object.fromEntries(METRICS.map(key => [key, round(full[key] - moved[key])])), spatial = Object.fromEntries(METRICS.map(key => [key, round((full[key] - off[key]) - (moved[key] - movedOff[key]))]));
  return { sample: options.sample || 0, focusId: options.focusId, role: characterById(options.focusId).role, rarity: characterById(options.focusId).rarity, background: options.background || 'generic', stage: options.stage?.id || 'early', enemy: options.enemy?.id || 'standard', rosterIds: state.roster.map(unit => unit.id), layoutUids, permuted, full, off, absent, moved, movedOff, presence, delta, spatial, spatialTeam };
}
export function runTagCampaign({ seed = 'v070:calibration:campaign:0', difficulty = 10, strategy = buildTagStrategies()[0], maxActions = 1000, strength = V070_PROTOCOL.preferenceStrength } = {}) {
  let state = newGame({ seed, difficulty }), actions = 0, stopped = null; const random = createPolicyRandom(`${seed}:actions`), turns = [], picks = {}, offered = {};
  while (!['victory', 'defeat'].includes(state.phase) && actions < maxActions) {
    if (state.phase === 'recruit') for (const id of state.choices) offered[id] = (offered[id] || 0) + 1;
    const planned = recommendAction(state, { profile: DEFAULT_PROFILE, lookahead: false }); let next;
    if (planned.type === 'spin') {
      const before = state, result = inspectSpin(before); next = result.state;
      const byUid = new Map(before.roster.map(unit => [unit.uid, unit])), cards = [];
      for (const unit of before.roster) {
        const effects = (next.lastSpin.effects || []).filter(effect => effect.sourceUid === unit.uid), row = next.board.find(entry => entry?.uid === unit.uid), nextUnit = next.roster.find(entry => entry.uid === unit.uid);
        cards.push({ id: unit.id, role: characterById(unit.id).role, stars: unit.stars, held: 1, present: Number(Boolean(row)), damage: result.hits.filter(hit => hit.sourceType === 'character' && hit.sourceUid === unit.uid).reduce((sum, hit) => sum + hit.amount, 0), growth: nextUnit ? nextUnit.growth - unit.growth : 0, endGrowth: nextUnit?.growth ?? unit.growth, healing: effects.filter(effect => effect.type === 'heal').reduce((sum, effect) => sum + (effect.amount || 0), 0), shield: effects.filter(effect => effect.type === 'shield').reduce((sum, effect) => sum + (effect.amount || 0), 0), triggered: Number(effects.some(effect => effect.amount !== 0)) });
      }
      const damageSum = result.hits.reduce((sum, hit) => sum + hit.amount, 0); if (Math.abs(damageSum - next.lastSpin.damage) > .03) throw new Error('Damage ledger does not reconcile');
      turns.push({ floor: before.floor, turn: next.stats.spins, stage: before.floor <= 4 ? 'early' : before.floor <= 8 ? 'mid' : 'late', damage: next.lastSpin.damage, hpLost: before.hp - next.hp, incoming: next.lastSpin.incoming, healing: next.lastSpin.healing, shield: next.lastSpin.shield, cards, sharedDamage: result.hits.filter(hit => !byUid.has(hit.sourceUid)).reduce((sum, hit) => sum + hit.amount, 0) });
    } else if (planned.type === 'remove') next = removeSymbol(state, planned.uid);
    else if (planned.type === 'reroll') next = rerollRewards(state);
    else if (planned.type === 'supply') next = purchaseSupply(state, planned.kind);
    else if (planned.type === 'reward' && ['recruit', 'item', 'essence'].includes(state.phase)) {
      const recommendation = biasTagRecommendation(state, planned.recommendation, strategy, strength), index = sampleRecommendation(recommendation, random()), choice = recommendation.choices.find(entry => entry.index === index); if (!choice) { stopped = 'invalid-choice'; break; }
      if (state.phase === 'recruit' && choice.action === 'choose') picks[choice.id] = (picks[choice.id] || 0) + 1;
      next = choice.action === 'skip' ? skipReward(state) : chooseReward(state, index);
    } else { stopped = 'unknown-action'; break; }
    if (next === state) { stopped = 'no-progress'; break; } state = next; actions++;
  }
  if (!['victory', 'defeat'].includes(state.phase) && !stopped) stopped = 'action-limit';
  return { seed, strategyId: strategy.id, difficulty, won: state.phase === 'victory', phase: state.phase, floor: state.floor, actions, stopped, turns, picks, offered, death: state.phase === 'defeat' ? state.hp <= 0 ? 'hp' : 'deadline' : null, finalRoster: state.roster.map(unit => ({ id: unit.id, stars: unit.stars, growth: unit.growth, ticks: unit.ticks })) };
}
export function summarizeTagCampaigns(campaigns, strategies = buildTagStrategies()) {
  const baseline = new Map(campaigns.filter(run => run.strategyId === 'baseline').map(run => [run.seed, run])), grouped = strategies.map(strategy => {
    const runs = campaigns.filter(run => run.strategyId === strategy.id), wins = runs.filter(run => run.won).length, paired = runs.filter(run => baseline.has(run.seed));
    return { ...strategy, n: runs.length, wins, winRate: runs.length ? wins / runs.length : null, winRateCI95: wilsonInterval(wins, runs.length), incomplete: runs.filter(run => run.stopped).length, deathHp: runs.filter(run => run.death === 'hp').length, deathDeadline: runs.filter(run => run.death === 'deadline').length, reachedFloor: Array.from({ length: 12 }, (_, i) => runs.filter(run => run.floor >= i + 1).length), pairedBaseline: assessPairedWins(paired.map(run => Number(run.won) - Number(baseline.get(run.seed).won)), V070_PROTOCOL.strategyMargin), stages: Object.fromEntries(['early', 'mid', 'late'].map(stage => { const reached = runs.filter(run => run.turns.some(turn => turn.stage === stage)); const score = run => mean(run.turns.filter(turn => turn.stage === stage).map(turn => turn.damage)) || 0; return [stage, { reached: reached.length, conditionalDamage: interval(reached.map(score)), allCampaignDamage: interval(runs.map(score)) }]; })) };
  });
  return adjustFdr(grouped.map(row => ({ ...row, p: row.pairedBaseline.ci95.p })));
}
export function summarizeCardSamples(rows) {
  const keys = [...new Set(rows.map(row => [row.focusId, row.background, row.stage, row.enemy].join('|')))];
  return keys.map(key => { const selected = rows.filter(row => [row.focusId, row.background, row.stage, row.enemy].join('|') === key), first = selected[0]; return { focusId: first.focusId, name: characterById(first.focusId).name, role: first.role, rarity: first.rarity, background: first.background, stage: first.stage, enemy: first.enemy, n: selected.length, triggered: selected.filter(row => row.full.triggered).length, present: selected.filter(row => row.full.focusPresent).length, nonzeroMarginal: selected.filter(row => METRICS.some(metric => Math.abs(row.delta[metric]) > 1e-6)).length, delta: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.delta[metric]))])), full: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.full[metric]))])), presence: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.presence[metric]))])), spatial: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.spatial[metric]))])), spatialMagnitude: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => (row.spatialAbsolute?.[metric] ?? Math.abs(row.spatial[metric]))))])), spatialChanged: selected.filter(row => METRICS.some(metric => Math.abs(row.spatial[metric]) > 1e-6)).length }; });
}
export const v070CardMetadata = () => CHARACTERS.map(({ id, name, role, rarity, path, element, faction, attack, description, effects }) => ({ id, name, role, rarity, path, element, faction, attack, description, effects }));
export const formalSynergyMetadata = () => SYNERGIES.map(({ id, name, kind, tag, thresholds }) => ({ id, name, kind, tag, thresholds }));

export const EFFECT_LAYERS = Object.freeze([
  { id: 'growthGain', types: ['growth'] },
  { id: 'base', types: ['power'] },
  { id: 'multiplier', types: ['powerMultiplier'] },
  { id: 'vulnerability', types: ['vulnerability'] },
  { id: 'extraAttack', types: ['damage'] },
  { id: 'defense', types: ['heal', 'shield', 'healOverflowShield', 'healMultiplier', 'shieldMultiplier'] },
  { id: 'weakening', types: ['retaliationFlat', 'retaliationMultiplier'] },
]);
export function runLayerSample(options = {}) {
  const { state, layoutUids } = makeCardScenario(options), fullResult = inspectSpin(state, { layoutUids });
  if (fullResult.diagnostics?.protocol !== 'spin-interventions-v1') throw new Error('inspectSpin intervention interface is not available.');
  const full = metrics(state, fullResult, 'focus'), layers = [];
  for (const layer of EFFECT_LAYERS) {
    const result = inspectSpin(state, { layoutUids, suppressCharacterEffectTypes: layer.types }), off = metrics(state, result, 'focus');
    layers.push({ id: layer.id, off, delta: Object.fromEntries(METRICS.map(key => [key, round(full[key] - off[key])])) });
  }
  const zeroGrowth = structuredClone(state); for (const unit of zeroGrowth.roster) unit.growth = 0;
  const zeroResult = inspectSpin(zeroGrowth, { layoutUids }), zero = metrics(zeroGrowth, zeroResult, 'focus');
  layers.push({ id: 'investedGrowth', off: zero, delta: Object.fromEntries(METRICS.map(key => [key, round(full[key] - zero[key])])) });
  for (const synergy of SYNERGIES) {
    const result = inspectSpin(state, { layoutUids, suppressSynergyIds: [synergy.id] }), off = metrics(state, result, 'focus');
    layers.push({ id: `synergy:${synergy.id}`, off, delta: Object.fromEntries(METRICS.map(key => [key, round(full[key] - off[key])])) });
  }
  return { sample: options.sample || 0, focusId: options.focusId, background: options.background || 'generic', stage: options.stage?.id || 'early', enemy: options.enemy?.id || 'standard', full, layers };
}
export function runFutureSample(options = {}) {
  const initial = makeCardScenario({ ...options, stage: STAGES[0] }), traces = [];
  for (const suppressed of [false, true]) {
    let state = structuredClone(initial.state), ended = null; const observations = [];
    for (let turn = 0; turn < V070_PROTOCOL.futureSpins; turn++) {
      if (ended) { observations.push({ ...Object.fromEntries(METRICS.map(key => [key, 0])), triggered: false, focusPresent: false, phase: state.phase, ended, padded: true }); continue; }
      // Bypass reward selection without adding recruits or starting a new floor.
      // A clear/death ends this encounter permanently, never an empty-board spin.
      state.phase = 'ready'; state.pendingFloor = false; state.pendingRewards = []; state.choices = [];
      const layoutUids = layoutForRoster(state.roster.filter(unit => !unit.temporary), `${options.seed || 'v070'}:${options.split || 'calibration'}:future:${options.sample || 0}:${turn}`), before = state;
      const result = inspectSpin(before, { layoutUids, ...(suppressed ? { suppressSkillUids: ['focus'] } : {}) });
      if (result.diagnostics?.protocol !== 'spin-interventions-v1') throw new Error('inspectSpin intervention interface is not available.');
      state = result.state;
      ended = state.hp <= 0 || state.phase === 'defeat' ? 'death' : state.enemies.every(enemy => enemy.hp <= 0) || state.phase === 'victory' ? 'clear' : null;
      observations.push({ ...metrics(before, result, 'focus'), ended, padded: false });
    }
    traces.push({ suppressed, observations, ended, actualSpins: observations.filter(row => !row.padded).length, endShield: state.shield, endGrowth: state.roster.map(unit => ({ id: unit.id, growth: unit.growth })) });
  }
  const [full, off] = traces;
  return { sample: options.sample || 0, focusId: options.focusId, role: characterById(options.focusId).role, rarity: characterById(options.focusId).rarity, background: options.background || 'generic', enemy: options.enemy?.id || 'standard', rosterIds: initial.state.roster.map(unit => unit.id), full, off, delta: Object.fromEntries(METRICS.map(key => [key, round(key === 'shieldRemaining' ? full.endShield - off.endShield : full.observations.reduce((sum, row) => sum + row[key], 0) - off.observations.reduce((sum, row) => sum + row[key], 0))])) };
}
export function summarizeLayers(rows) {
  const result = [];
  for (const stage of STAGES) for (const enemy of ENEMY_SCENARIOS) {
    const selected = rows.filter(row => row.stage === stage.id && row.enemy === enemy.id), ids = [...new Set(selected.flatMap(row => row.layers.map(layer => layer.id)))];
    for (const id of ids) {
      // The same layout sample can contain several focus contexts. Average within
      // sample before intervals: those contexts are repeated measurements.
      const groups = new Map();
      for (const row of selected) { const layer = row.layers.find(entry => entry.id === id); if (!layer) continue; if (!groups.has(row.sample)) groups.set(row.sample, []); groups.get(row.sample).push(layer.delta); }
      const clustered = [...groups.values()].map(group => Object.fromEntries(METRICS.map(metric => [metric, mean(group.map(row => row[metric]))])));
      result.push({ id, stage: stage.id, enemy: enemy.id, n: clustered.length, nonzero: clustered.filter(row => METRICS.some(metric => Math.abs(row[metric]) > 1e-6)).length, delta: Object.fromEntries(METRICS.map(metric => [metric, interval(clustered.map(row => row[metric]))])) });
    }
  } return result;
}
export function summarizeFuture(rows) {
  return [...new Set(rows.map(row => `${row.focusId}|${row.background}|${row.enemy}`))].map(key => {
    const selected = rows.filter(row => `${row.focusId}|${row.background}|${row.enemy}` === key), first = selected[0];
    return { focusId: first.focusId, name: characterById(first.focusId).name, role: first.role, rarity: first.rarity, background: first.background, enemy: first.enemy, n: selected.length, delta: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.delta[metric]))])), curve: Array.from({ length: V070_PROTOCOL.futureSpins }, (_, turn) => ({ turn: turn + 1, delta: Object.fromEntries(METRICS.map(metric => [metric, interval(selected.map(row => row.full.observations[turn][metric] - row.off.observations[turn][metric]))])) })) };
  });
}

const roleMeasures = role => role === 'attack' ? [{ id: 'effectiveDamage', metric: 'damage', source: 'presence', sign: 1 }] : role === 'defense' ? [{ id: 'netHpSaved', metric: 'hpLost', source: 'delta', sign: -1 }] : role === 'amplifier' ? [{ id: 'teamDamageAdded', metric: 'damage', source: 'delta', sign: 1 }] : role === 'disruptor' ? [{ id: 'teamDamageAdded', metric: 'damage', source: 'delta', sign: 1 }, { id: 'netHpSaved', metric: 'hpLost', source: 'delta', sign: -1 }] : [{ id: 'growthCreated', metric: 'growth', source: 'delta', sign: 1 }];
/** A descriptive same-role/rarity league; never combines duties into one score. */
export function cardComparisons(rows) {
  const partitions = new Map();
  for (const row of rows) { const key = [row.background, row.stage, row.enemy, row.role, row.rarity].join('|'); if (!partitions.has(key)) partitions.set(key, []); partitions.get(key).push(row); }
  const tests = [];
  for (const partition of partitions.values()) {
    const ids = [...new Set(partition.map(row => row.focusId))], first = partition[0];
    for (const measure of roleMeasures(first.role)) for (const id of ids) {
      const selected = partition.filter(row => row.focusId === id), peers = ids.filter(peer => peer !== id), peerMeans = peers.map(peer => mean(partition.filter(row => row.focusId === peer).map(row => row[measure.source][measure.metric] * measure.sign))), scale = mean(peerMeans);
      const metadata = { focusId: id, name: characterById(id).name, role: first.role, rarity: first.rarity, background: first.background, stage: first.stage, enemy: first.enemy, measure: measure.id, peerCount: peers.length, referenceMean: round(scale) };
      if (first.background === 'compatible') { tests.push({ ...metadata, status: 'potential-description', p: null }); continue; }
      if (ids.length < 3 || !(scale > .01)) { tests.push({ ...metadata, status: 'reference-insufficient', p: null }); continue; }
      const pairs = selected.map(row => { const matched = peers.map(peer => partition.find(other => other.focusId === peer && other.sample === row.sample)).filter(Boolean); return matched.length === peers.length ? { x: row[measure.source][measure.metric] * measure.sign, y: mean(matched.map(other => other[measure.source][measure.metric] * measure.sign)) } : null; }).filter(Boolean);
      const assessment = assessRelativePerformance(pairs.map(pair => pair.x), pairs.map(pair => pair.y), V070_PROTOCOL.cardMargin);
      tests.push({ ...metadata, ...assessment, p: assessment.ci95.p });
    }
  }
  return adjustFdr(tests);
}

function wilsonWithConfidence(wins, n, confidence) {
  if (!n) return [null, null];
  const z = studentTQuantile((1 + confidence) / 2, 1e8), z2 = z * z, p = wins / n, divisor = 1 + z2 / n, center = (p + z2 / (2 * n)) / divisor, radius = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / divisor;
  return [Math.max(0, center - radius), Math.min(1, center + radius)];
}
export function pairedWinInterval(differences, confidence = .95) {
  if (differences.some(value => ![-1, 0, 1].includes(value))) throw new Error('Paired wins must be -1, 0, or 1');
  const n = differences.length, positive = differences.filter(value => value === 1).length, negative = differences.filter(value => value === -1).length;
  if (!n) return { n, mean: null, ci: [null, null], confidence, positive, negative, p: null };
  // Bound the two discordant probabilities separately with a Bonferroni
  // allocation. Unlike a t/bootstrap interval this remains nonzero when no
  // discordant outcomes happened to be observed.
  const plus = wilsonWithConfidence(positive, n, 1 - (1 - confidence) / 2), minus = wilsonWithConfidence(negative, n, 1 - (1 - confidence) / 2);
  const discordant = positive + negative;
  let p = 1;
  if (discordant) {
    const k = Math.min(positive, negative); let term = Math.exp(logGamma(discordant + 1) - logGamma(k + 1) - logGamma(discordant - k + 1) - discordant * Math.log(2)), tail = term;
    for (let i = k; i > 0; i--) { term *= i / (discordant - i + 1); tail += term; }
    p = Math.min(1, 2 * tail);
  }
  return { n, mean: round((positive - negative) / n), ci: [round(plus[0] - minus[1]), round(plus[1] - minus[0])], confidence, positive, negative, p: round(p), method: 'paired discordant-probability Wilson bounds; Bonferroni; exact McNemar p' };
}
export function assessPairedWins(differences, margin = V070_PROTOCOL.strategyMargin, { looks = V070_PROTOCOL.looks, family = 1 } = {}) {
  const ci95 = pairedWinInterval(differences, .95), ci90 = pairedWinInterval(differences, .90), decision = pairedWinInterval(differences, 1 - 2 * V070_PROTOCOL.alpha / (looks * family)), [lo, hi] = decision.ci;
  let status = 'insufficient'; if (lo !== null && lo > -margin && hi < margin) status = 'equivalent'; else if (lo !== null && (lo > margin || hi < -margin)) status = 'outside';
  return { margin, ci95, ci90, decision, status };
}

export function aggregateCardPanels(rows) {
  const groups = new Map();
  for (const row of rows) { const key = `${row.focusId}|${row.background}|${row.sample}`; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(row); }
  return [...groups.values()].map(group => {
    const first = group[0], average = key => Object.fromEntries(METRICS.map(metric => [metric, mean(group.map(row => row[key][metric]))]));
    return { sample: first.sample, focusId: first.focusId, role: first.role, rarity: first.rarity, background: first.background, stage: 'balanced-panel', enemy: 'balanced-panel', panelCount: group.length, full: { ...average('full'), triggered: group.some(row => row.full.triggered), focusPresent: group.some(row => row.full.focusPresent) }, off: average('off'), presence: average('presence'), delta: average('delta'), spatial: average('spatial'), spatialAbsolute: Object.fromEntries(METRICS.map(metric => [metric, mean(group.map(row => Math.abs(row.spatial[metric])))])) };
  });
}

export function summarizeLayerOverview(rows) {
  const ids = [...new Set(rows.flatMap(row => row.layers.map(layer => layer.id)))];
  return ids.map(id => {
    const groups = new Map(); for (const row of rows) { const layer = row.layers.find(entry => entry.id === id); if (!layer) continue; if (!groups.has(row.sample)) groups.set(row.sample, []); groups.get(row.sample).push(layer.delta); }
    const samples = [...groups.values()].map(group => Object.fromEntries(METRICS.map(metric => [metric, mean(group.map(row => row[metric]))])));
    return { id, n: samples.length, nonzero: samples.filter(row => METRICS.some(metric => Math.abs(row[metric]) > 1e-6)).length, delta: Object.fromEntries(METRICS.map(metric => [metric, interval(samples.map(row => row[metric]))])) };
  });
}
export function spatialDesignAudit() {
  const spatial = effect => {
    if (!effect || typeof effect !== 'object') return false;
    if (['adjacent', 'row', 'column', 'aligned'].includes(effect.target) || ['neighbors', 'row', 'column', 'aligned', 'edge', 'corner', 'emptyNeighbors'].includes(effect.metric)) return true;
    return Object.values(effect).some(value => Array.isArray(value) ? value.some(spatial) : value && typeof value === 'object' && spatial(value));
  };
  const characters = CHARACTERS.map(character => ({ id: character.id, name: character.name, role: character.role, spatial: character.effects.some(spatial), effects: character.effects.map(effect => ({ type: effect.type, spatial: spatial(effect), summary: effect.summary })) }));
  return { n: characters.length, spatial: characters.filter(character => character.spatial).length, globalExceptions: characters.filter(character => !character.spatial), characters, fraction: characters.filter(character => character.spatial).length / characters.length, forbiddenStrategyReferences: CHARACTERS.filter(character => /"(?:group|groupsAny|archetype|archetypeId)"/.test(JSON.stringify(character.effects))).map(character => character.id) };
}

export function assessRelativePerformance(x, y, margin = V070_PROTOCOL.cardMargin, { looks = V070_PROTOCOL.looks, family = 1 } = {}) {
  if (x.length !== y.length) throw new Error('Pair lengths differ');
  const reference = mean(y), confidence = 1 - 2 * V070_PROTOCOL.alpha / (looks * family);
  if (!(reference > .01)) return { status: 'reference-insufficient', p: null };
  // The denominator is estimated from these same paired layouts. Make the
  // actual decision on linear boundaries, carrying y's variation/covariance.
  // Relative descriptive CIs below use the observed mean only as a display unit.
  const lowerBoundary = interval(x.map((value, i) => value - (1 - margin) * y[i]), confidence), upperBoundary = interval(x.map((value, i) => value - (1 + margin) * y[i]), confidence);
  const relative = x.map((value, i) => (value - y[i]) / reference), ci95 = interval(relative, .95), ci90 = interval(relative, .90);
  let status = 'insufficient';
  if (lowerBoundary.ci[0] !== null && lowerBoundary.ci[0] > 0 && upperBoundary.ci[1] < 0) status = 'equivalent';
  else if (lowerBoundary.ci[1] !== null && (lowerBoundary.ci[1] < 0 || upperBoundary.ci[0] > 0)) status = 'outside';
  return { margin, ci95, ci90, decision: { confidence, lowerBoundary, upperBoundary, family }, status, relativeIntervalScope: 'descriptive paired difference in units of observed peer mean; not a ratio confidence interval', method: 'paired linear TOST boundaries x-(1-margin)y and x-(1+margin)y; alpha-spending; no all-card equivalence claim' };
}
