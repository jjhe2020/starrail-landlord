# 冻结实现：src/archetype-simulation.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/archetype-simulation.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：31232
- SHA-256：`3390a5972ad7af862f7150d1d7ecefc50791ec3fb3d87b3700d7fdef5dd24cc4`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/archetype-simulation.js#L1)

<!-- frozen-source:start -->
````````````````javascript
import { newGame, spin, chooseReward, skipReward, removeSymbol, rerollRewards, purchaseSupply } from './engine.js';
import { recommendAction, recommendRewards, createPolicyRandom, sampleRecommendation } from './ai.js';
import { DEFAULT_PROFILE } from './ai-profile.js';
import { wilsonInterval } from './simulation.js';
import { isPolluted } from './enemy-effects.js';
import * as archetypes from './archetypes.js';

export const ARCHETYPE_BENCHMARK_VERSION = 'tag-policy-campaign-v5-spatial';
export const PROBE_PROTOCOL = Object.freeze({ version: 'canonical-spin-v1', enemyCount: 5, enemyHp: 1000000, enemyAttack: 5, hpFraction: 0.5, defenseWeight: 0.36, activeDebuffs: false, overclock: false, samples: 3 });
const REWARDS = ['recruit', 'item', 'essence'];
const TERMINAL = ['victory', 'defeat'];
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
const rounded = value => Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null;
const hash = value => { let h = 2166136261; for (const character of String(value)) h = Math.imul(h ^ character.charCodeAt(0), 16777619); return (h >>> 0) || 1; };
const definitions = () => archetypes.ARCHETYPES;

export function meanInterval(values) {
  if (!values.length) return { n: 0, mean: null, ci95: [null, null] };
  const center = mean(values);
  if (values.length === 1) return { n: 1, mean: rounded(center), ci95: [null, null] };
  const variance = values.reduce((sum, value) => sum + (value - center) ** 2, 0) / (values.length - 1);
  const radius = 1.959963984540054 * Math.sqrt(variance / values.length);
  return { n: values.length, mean: rounded(center), ci95: [rounded(center - radius), rounded(center + radius)] };
}

export function buildArchetypeStrategies() {
  return [{ id: 'baseline', kind: 'baseline', name: '无套路偏好 AI' },
    ...definitions().map(definition => ({ id: `focus:${definition.id}`, kind: 'focus', focusId: definition.id, name: definition.name })),
    { id: 'adaptive:2', kind: 'adaptive', slots: 2, name: '同时准备 2 套路' },
    { id: 'adaptive:3', kind: 'adaptive', slots: 3, name: '同时准备 3 套路' }];
}

/** Public, deliberately conservative survival signal. The last observed damage
 * is a noisy deadline warning, not a prediction of the hidden next board. */
export function archetypeSurvivalMode(state) {
  const hpRatio = state.hp / Math.max(1, state.maxHp);
  const enemyHp = state.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0);
  const activeEncounter = !state.pendingFloor && enemyHp > 0;
  const healthCritical = hpRatio < 0.3 && state.shield < 10;
  const healthCaution = hpRatio < 0.55 && state.shield < 15;
  const lateDeadline = activeEncounter && state.spinsLeft <= 2;
  const deadlineBehind = lateDeadline && enemyHp > Math.max(1, state.lastSpin?.damage || 0) * Math.max(1, state.spinsLeft) * 0.9;
  const lastSpin = activeEncounter && state.spinsLeft <= 1;
  const urgent = healthCritical || deadlineBehind || lastSpin;
  return { scale: urgent ? 0 : healthCaution || lateDeadline ? 0.25 : 1, urgent, abandonWeak: healthCritical || deadlineBehind, healthCritical, healthCaution, lateDeadline, deadlineBehind, lastSpin, enemyHp };
}

/** Only current roster and currently visible offers enter planning. The memory
 * stores abandoned lines so a late tempting offer cannot restart a dead plan. */
export function updateArchetypePlan(state, strategy, previous = null) {
  const statuses = archetypes.getArchetypes(state);
  const memory = previous ? structuredClone(previous) : { selected: [], abandoned: [], changes: [], initialized: false };
  if (strategy.kind === 'baseline') return memory;
  if (strategy.kind === 'focus') {
    if (!definitions().some(definition => definition.id === strategy.focusId)) throw new Error(`Unknown archetype: ${strategy.focusId}`);
    if (!memory.initialized) memory.selected = [strategy.focusId];
    memory.initialized = true;
    return memory;
  }
  if (strategy.kind !== 'adaptive' || ![2, 3].includes(strategy.slots)) throw new Error('Adaptive planning requires 2 or 3 slots.');
  // The first recruit screen provides the same public information a player sees.
  if (!memory.initialized && state.phase !== 'recruit') return memory;
  const offers = state.phase === 'recruit' ? state.choices : [];
  const score = status => Number(status.formed) * 10 + status.progress * 3 + (status.coreCount > 0 ? 0.9 : 0)
    + offers.reduce((sum, id) => sum + (status.memberIds.includes(id) ? 0.45 : 0) + (status.coreIds.includes(id) ? 0.6 : 0), 0)
    + (hash(`${state.seed}:plan:${status.id}`) % 1000) / 100000;
  if (!memory.initialized) {
    memory.selected = statuses.slice().sort((a, b) => score(b) - score(a)).slice(0, strategy.slots).map(status => status.id);
    memory.initialized = true;
    memory.changes.push({ turn: state.stats.spins, selected: memory.selected.slice(), reason: 'visible-first-offer' });
  }
  const chosen = statuses.filter(status => memory.selected.includes(status.id)).sort((a, b) => score(b) - score(a));
  const formed = chosen.filter(status => status.formed);
  let keep = chosen;
  if (formed.length >= 2) keep = formed.slice(0, 2);
  else if (formed.length === 1 && state.stats.spins >= 12) keep = [formed[0], ...chosen.filter(status => !status.formed && status.progress >= 0.6).slice(0, 1)];
  else if (state.stats.spins >= 18) keep = chosen.slice(0, 1);
  else if (state.stats.spins >= 10) keep = chosen.slice(0, 2);
  const survival = archetypeSurvivalMode(state);
  if (survival.abandonWeak && state.stats.spins >= 6 && keep.length > 1) {
    const viable = keep.filter(status => status.formed || status.progress >= 0.7);
    keep = viable.length ? viable.slice(0, 2) : keep.slice(0, 1);
  }
  const next = keep.map(status => status.id);
  const dropped = memory.selected.filter(id => !next.includes(id));
  if (dropped.length) {
    memory.abandoned.push(...dropped);
    memory.selected = next;
    memory.changes.push({ turn: state.stats.spins, selected: next.slice(), abandoned: dropped, reason: survival.abandonWeak ? 'survival-abandon-low-progress' : formed.length ? 'commit-to-formed' : 'abandon-late-low-progress' });
  }
  return memory;
}

/** Reweights the shared AI's displayed marginal scores, retaining choose/skip
 * actions and a separate policy RNG. No reward, reroll or board is fabricated. */
export function biasArchetypeRecommendations(state, recommendation, plan, { strength = 10, temperature = DEFAULT_PROFILE.temperature } = {}) {
  if (state.phase !== 'recruit' || !plan?.selected?.length || strength === 0) return recommendation;
  const selected = archetypes.getArchetypes(state).filter(status => plan.selected.includes(status.id));
  const anyFormed = selected.some(status => status.formed);
  const scored = recommendation.choices.map(choice => {
    let bonus = 0;
    if (choice.action === 'choose') for (const status of selected) {
      if (!status.memberIds.includes(choice.id)) continue;
      const alreadyOwned = state.roster.some(unit => !unit.temporary && !unit.commission && unit.id === choice.id);
      const weight = status.formed ? 1.8 : anyFormed ? 0.5 : 1;
      const core = status.coreIds.includes(choice.id) && status.coreCount < (status.coreRequired ?? 0);
      bonus += strength * weight * (alreadyOwned ? 0.45 : 1) + (core ? strength * 0.6 : 0);
    }
    return { ...choice, score: choice.score + bonus, archetypeBonus: bonus };
  });
  const maximum = Math.max(...scored.map(choice => choice.score));
  const masses = scored.map(choice => Math.exp(Math.max(-20, (choice.score - maximum) / temperature)));
  const sum = masses.reduce((total, mass) => total + mass, 0);
  return { ...recommendation, choices: scored.map((choice, index) => ({ ...choice, probability: masses[index] / sum })) };
}

/** A player planning a line does not pay to discard a visible missing core or
 * the final distinct member needed to form it. This uses no unseen reward. */
export function shouldKeepArchetypeOffer(state, plan) {
  if (state.phase !== 'recruit' || !plan?.selected?.length) return false;
  const identities = new Set(state.roster.filter(unit => !unit.temporary && !unit.commission).map(unit => unit.id));
  return archetypes.getArchetypes(state).filter(status => plan.selected.includes(status.id) && !status.formed).some(status => state.choices.some(id => {
    if (identities.has(id) || !status.memberIds.includes(id)) return false;
    const isCore = status.coreIds.includes(id), requiredCores = status.coreRequired ?? 0;
    const missingCore = isCore && status.coreCount < requiredCores;
    const completesLine = status.count < status.threshold && status.count + 1 >= status.threshold && status.coreCount + Number(isCore) >= requiredCores;
    return missingCore || completesLine;
  }));
}

function canonicalProbe(state, sample) {
  const probe = structuredClone(state);
  probe.phase = 'ready'; probe.pendingFloor = false; probe.pendingRewards = []; probe.choices = [];
  probe.spinsLeft = 100; probe.hp = probe.maxHp * PROBE_PROTOCOL.hpFraction; probe.shield = 0;
  probe.activeDebuffs = []; probe.pollution = undefined; probe.enemySkill = { id: 'canonical', name: '标准探针' };
  probe.overclockReady = false; probe.bossStage = 0;
  probe.enemies = Array.from({ length: PROBE_PROTOCOL.enemyCount }, (_, col) => ({ id: `probe-${col}`, col, hp: PROBE_PROTOCOL.enemyHp, maxHp: PROBE_PROTOCOL.enemyHp, attack: PROBE_PROTOCOL.enemyAttack, boss: false }));
  // The same public protocol seed is used across every strategy at this turn.
  probe.rngState = hash(`${PROBE_PROTOCOL.version}:${state.stats.spins}:${sample}`);
  return probe;
}

function probeComponents(before, after) {
  const record = after.lastSpin;
  const blocked = after.resourceStats.shieldBlocked - before.resourceStats.shieldBlocked;
  const selfDamage = (record.effects || []).filter(effect => effect.type === 'selfDamage').reduce((sum, effect) => sum + (effect.amount || 0), 0);
  const defense = record.healing + Math.min(25, blocked + Math.max(0, 25 - record.incoming)) - selfDamage;
  const growth = (record.effects || []).filter(effect => effect.type === 'growth').reduce((sum, effect) => sum + (effect.amount || 0), 0);
  return { power: record.damage + PROBE_PROTOCOL.defenseWeight * defense, damage: record.damage, defense, growth };
}

/** A paired, same-state intervention isolates archetype effects from selecting
 * better characters. It is an immediate effect, not a campaign win-rate claim. */
export function probeArchetypePower(state, { samples = PROBE_PROTOCOL.samples, interventions = true, disabledIds } = {}) {
  if (!Number.isInteger(samples) || samples < 1 || samples > 32) throw new Error('Probe samples must be an integer from 1 to 32.');
  if (interventions && typeof archetypes.withoutArchetypeEffects !== 'function') throw new Error('The archetype effects intervention hook is unavailable.');
  const enabled = [], disabled = [];
  for (let sample = 0; sample < samples; sample++) {
    const probe = canonicalProbe(state, sample);
    enabled.push(probeComponents(probe, spin(probe)));
    if (interventions) disabled.push(probeComponents(probe, archetypes.withoutArchetypeEffects(() => spin(probe), disabledIds)));
  }
  const components = Object.fromEntries(['power', 'damage', 'defense', 'growth'].map(key => [key, rounded(mean(enabled.map(entry => entry[key])))]));
  const off = disabled.length ? Object.fromEntries(['power', 'damage', 'defense', 'growth'].map(key => [key, rounded(mean(disabled.map(entry => entry[key])))])) : null;
  return { ...components, withoutArchetypes: off, powerEffectRatio: off?.power > 0 ? rounded(components.power / off.power) : null, growthEffect: off ? rounded(components.growth - off.growth) : null };
}

export function runArchetypeCampaign({ seed = 'archetype', difficulty = 10, strategy = { id: 'baseline', kind: 'baseline' }, strength = 10, profile = DEFAULT_PROFILE, lookahead = false, maxActions = 1000, probeSamples = 3, initialState, trace = false } = {}) {
  let state = initialState ? structuredClone(initialState) : newGame({ seed, difficulty });
  const random = createPolicyRandom(`${state.seed}:actions`);
  let plan = null, actions = 0, stopped = null, protectedRerollOffers = 0, survivalRewardDecisions = 0, cautiousRewardDecisions = 0, releasedPollutedRemovals = 0;
  const snapshots = [], firstFormed = {}, firstPlannedFormed = {}, formationsLost = {}, choices = [], picks = {}, formationLast = new Set();
  const observeFormation = () => {
    for (const status of archetypes.getArchetypes(state)) {
      if (status.formed && firstFormed[status.id] === undefined) firstFormed[status.id] = state.stats.spins;
      if (status.formed && plan?.selected?.includes(status.id) && firstPlannedFormed[status.id] === undefined) firstPlannedFormed[status.id] = state.stats.spins;
      if (formationLast.has(status.id) && !status.formed) formationsLost[status.id] = (formationsLost[status.id] || 0) + 1;
      if (status.formed) formationLast.add(status.id); else formationLast.delete(status.id);
    }
  };
  const snapshot = () => {
    const statuses = archetypes.getArchetypes(state);
    snapshots.push({ turn: state.stats.spins, floor: state.floor, phase: state.phase, ...probeArchetypePower(state, { samples: probeSamples, disabledIds: strategy.focusId ? [strategy.focusId] : strategy.kind === 'adaptive' ? plan?.selected || [] : undefined }), formed: statuses.filter(status => status.formed).map(status => status.id), selected: plan?.selected?.slice() || [] });
  };
  observeFormation();
  while (!TERMINAL.includes(state.phase) && actions < maxActions) {
    plan = updateArchetypePlan(state, strategy, plan);
    const survival = archetypeSurvivalMode(state);
    let planned = recommendAction(state, { profile, lookahead });
    if (planned.type === 'reroll' && survival.scale === 1 && shouldKeepArchetypeOffer(state, plan)) {
      protectedRerollOffers++;
      planned = { type: 'reward', recommendation: recommendRewards(state, { profile, lookahead }), reason: '保留公开候选中的目标缺失核心或成型最后一位成员' };
    }
    // A deliberate planner keeps the final copy needed for a selected line.
    if (planned.type === 'remove' && strategy.kind !== 'baseline') {
      const unit = state.roster.find(entry => entry.uid === planned.uid);
      const isNeededMember = unit && !unit.temporary && !unit.commission && archetypes.getArchetypes(state).some(status => plan.selected.includes(status.id) && status.memberIds.includes(unit.id) && state.roster.filter(entry => !entry.temporary && !entry.commission && entry.id === unit.id).length === 1);
      const polluted = unit && isPolluted(state, unit.uid);
      if (isNeededMember && polluted) releasedPollutedRemovals++;
      const protectedMember = isNeededMember && survival.scale === 1 && !polluted;
      if (protectedMember) planned = REWARDS.includes(state.phase) ? { type: 'reward', recommendation: recommendRewards(state, { profile, lookahead }) } : { type: 'spin' };
    }
    let next;
    if (planned.type === 'spin') { snapshot(); next = spin(state); }
    else if (planned.type === 'remove') next = removeSymbol(state, planned.uid);
    else if (planned.type === 'reroll') next = rerollRewards(state);
    else if (planned.type === 'supply') next = purchaseSupply(state, planned.kind);
    else if (planned.type === 'reward' && REWARDS.includes(state.phase)) {
      const recommendation = biasArchetypeRecommendations(state, planned.recommendation, plan, { strength: strength * survival.scale, temperature: profile.temperature });
      if (strategy.kind !== 'baseline' && state.phase === 'recruit') {
        if (survival.urgent) survivalRewardDecisions++;
        else if (survival.scale < 1) cautiousRewardDecisions++;
      }
      const draw = random(), index = sampleRecommendation(recommendation, draw);
      const choice = recommendation.choices.find(entry => entry.index === index);
      if (!choice) { stopped = 'invalid-choice'; break; }
      picks[choice.id] = (picks[choice.id] || 0) + 1;
      if (trace) choices.push({ turn: state.stats.spins, phase: state.phase, selected: plan.selected.slice(), offered: state.choices.slice(), choices: recommendation.choices, draw, index, id: choice.id });
      next = choice.action === 'skip' ? skipReward(state) : chooseReward(state, index);
    } else { stopped = 'unknown-action'; break; }
    if (next === state) { stopped = 'no-progress'; break; }
    state = next; actions++; observeFormation();
  }
  if (!TERMINAL.includes(state.phase) && !stopped) stopped = 'action-limit';
  snapshot();
  return { seed: state.seed, strategyId: strategy.id, won: state.phase === 'victory', phase: state.phase, floor: state.floor, floorReached: state.floor, terminalHp: state.hp, terminalShield: state.shield, spinsLeft: state.spinsLeft, enemyHpRemaining: state.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0), defeatCause: state.phase === 'defeat' ? state.hp <= 0 ? 'hp' : 'deadline' : null,
    turns: state.stats.spins, actions, stopped, protectedRerollOffers, survivalRewardDecisions, cautiousRewardDecisions, releasedPollutedRemovals, firstFormed, firstPlannedFormed, formationsLost, finalFormed: archetypes.getArchetypes(state).filter(status => status.formed).map(status => status.id), finalSelected: plan?.selected || [], abandoned: plan?.abandoned || [], planChanges: plan?.changes || [], picks, snapshots, ...(trace ? { choices } : {}) };
}

function absorbingSnapshot(campaign, turn) {
  const exact = campaign.snapshots.find(snapshot => snapshot.turn === turn);
  if (exact) return campaign.phase === 'defeat' && turn === campaign.turns ? { ...exact, power: 0, damage: 0, growth: 0 } : exact;
  const last = campaign.snapshots.at(-1);
  if (turn > campaign.turns) return campaign.phase === 'victory' ? last : campaign.phase === 'defeat' ? { ...last, power: 0, damage: 0, growth: 0 } : null;
  return null;
}

function pairedWins(campaigns, baseline) {
  const bySeed = new Map(baseline.map(campaign => [campaign.seed, campaign]));
  const outcomes = { policyOnlyWins: 0, baselineOnlyWins: 0, bothWin: 0, bothLose: 0 };
  const differences = [];
  let incompletePairs = 0;
  for (const campaign of campaigns) {
    const base = bySeed.get(campaign.seed);
    if (!base) continue;
    if (!TERMINAL.includes(campaign.phase) || !TERMINAL.includes(base.phase)) { incompletePairs++; continue; }
    outcomes[campaign.won ? base.won ? 'bothWin' : 'policyOnlyWins' : base.won ? 'baselineOnlyWins' : 'bothLose']++;
    differences.push(Number(campaign.won) - Number(base.won));
  }
  const n = differences.length;
  // A normal CI collapses to [0,0] when no seed has discordant outcomes. Bound
  // the two discordant multinomial probabilities separately at 97.5%; their
  // difference uses a conservative Bonferroni-adjusted approximate 95% interval.
  const bounds = count => {
    const z = 2.241402727604947, p = count / n, denominator = 1 + z * z / n;
    const center = (p + z * z / (2 * n)) / denominator;
    const radius = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
    return [Math.max(0, center - radius), Math.min(1, center + radius)];
  };
  const a = n ? bounds(outcomes.policyOnlyWins) : null, b = n ? bounds(outcomes.baselineOnlyWins) : null;
  return { pairedSeeds: n, incompletePairs, difference: { n, mean: rounded(mean(differences)), ci95: n ? [rounded(a[0] - b[1]), rounded(a[1] - b[0])] : [null, null], intervalMethod: 'Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%' }, outcomes };
}

export function summarizeArchetypeBenchmark(results, strategies = buildArchetypeStrategies()) {
  const baseline = results.filter(result => result.strategyId === 'baseline');
  if (!baseline.length) throw new Error('A no-preference baseline is required.');
  const maxTurn = Math.max(...results.map(result => result.turns));
  const baselineByTurn = Array.from({ length: maxTurn + 1 }, (_, turn) => {
    const live = baseline.flatMap(campaign => campaign.snapshots.filter(snapshot => snapshot.turn === turn && snapshot.phase !== 'defeat'));
    const all = baseline.map(campaign => absorbingSnapshot(campaign, turn)).filter(Boolean);
    return { turn, survivingN: live.length, survivingMeanPower: mean(live.map(snapshot => snapshot.power)), allN: all.length, allMeanPower: mean(all.map(snapshot => snapshot.power)), allMeanGrowth: mean(all.map(snapshot => snapshot.growth)) };
  });
  const reports = strategies.map(strategy => {
    const campaigns = results.filter(result => result.strategyId === strategy.id);
    const n = campaigns.length, completedCampaigns = campaigns.filter(campaign => TERMINAL.includes(campaign.phase)), completed = completedCampaigns.length, wins = completedCampaigns.filter(campaign => campaign.phase === 'victory').length;
    const focusedIds = strategy.focusId ? [strategy.focusId] : definitions().map(definition => definition.id);
    const formationTimes = campaign => strategy.kind === 'adaptive' ? campaign.firstPlannedFormed || {} : campaign.firstFormed;
    const formed = completedCampaigns.filter(campaign => focusedIds.some(id => formationTimes(campaign)[id] !== undefined));
    const unformed = completedCampaigns.filter(campaign => !formed.includes(campaign));
    const perRun = { before: [], after: [], immediateRatio: [], growthEffect: [], finalProgress: [], formationTurn: [] };
    for (const campaign of campaigns) {
      const first = Math.min(...focusedIds.map(id => formationTimes(campaign)[id]).filter(Number.isFinite));
      if (Number.isFinite(first)) perRun.formationTurn.push(first);
      const before = [], after = [], immediate = [], growth = [];
      for (const snapshot of campaign.snapshots) {
        const denominator = baselineByTurn[snapshot.turn]?.survivingMeanPower;
        if (!denominator || snapshot.phase === 'defeat') continue;
        const progress = snapshot.power / denominator;
        // Initial identical boards are excluded; never-formed runs remain in pre.
        if (snapshot.turn >= 4 && snapshot.turn < first) before.push(progress);
        if (snapshot.turn >= first && focusedIds.some(id => snapshot.formed.includes(id) && (strategy.kind !== 'adaptive' || snapshot.selected?.includes(id)))) {
          after.push(progress);
          if (snapshot.powerEffectRatio !== null) immediate.push(snapshot.powerEffectRatio);
          growth.push(snapshot.growthEffect || 0);
        }
      }
      if (before.length) perRun.before.push(mean(before));
      if (after.length) perRun.after.push(mean(after));
      if (immediate.length) perRun.immediateRatio.push(mean(immediate));
      if (growth.length) perRun.growthEffect.push(mean(growth));
      const final = campaign.snapshots.at(-1), finalDenominator = baselineByTurn[campaign.turns]?.allMeanPower;
      if (finalDenominator && TERMINAL.includes(campaign.phase)) perRun.finalProgress.push(campaign.phase === 'victory' ? final.power / finalDenominator : 0);
    }
    const byTurn = baselineByTurn.map(base => {
      const live = campaigns.flatMap(campaign => campaign.snapshots.filter(snapshot => snapshot.turn === base.turn && snapshot.phase !== 'defeat'));
      const all = campaigns.map(campaign => absorbingSnapshot(campaign, base.turn)).filter(Boolean);
      return { turn: base.turn, survivingN: live.length, survivingPower: meanInterval(live.map(snapshot => snapshot.power)), survivingProgress: base.survivingMeanPower ? rounded(mean(live.map(snapshot => snapshot.power)) / base.survivingMeanPower) : null,
        allN: all.length, allPower: meanInterval(all.map(snapshot => snapshot.power)), allProgress: base.allMeanPower ? rounded(mean(all.map(snapshot => snapshot.power)) / base.allMeanPower) : null };
    });
    const formation = { n: completed, enrolledN: n, censoredIncomplete: n - completed, observedFormedIncludingIncomplete: campaigns.filter(campaign => focusedIds.some(id => formationTimes(campaign)[id] !== undefined)).length, formed: formed.length, neverFormed: unformed.length, rate: completed ? formed.length / completed : null, ci95: wilsonInterval(formed.length, completed), turn: meanInterval(perRun.formationTurn), formedWins: formed.filter(campaign => campaign.phase === 'victory').length, formedLosses: formed.filter(campaign => campaign.phase === 'defeat').length, unformedWins: unformed.filter(campaign => campaign.phase === 'victory').length, unformedLosses: unformed.filter(campaign => campaign.phase === 'defeat').length };
    const beforeFormation = meanInterval(perRun.before), afterFormation = meanInterval(perRun.after), effectsOnlyPowerRatio = meanInterval(perRun.immediateRatio), effectsOnlyGrowthPerSpin = meanInterval(perRun.growthEffect);
    // v0.6 deliberately removes archetype auto-growth. Report association and
    // mechanism sizes separately; the old v0.5 compensation targets do not apply.
    const checks = strategy.kind === 'baseline' ? null : {
      effectsOnlyNotNegative: effectsOnlyPowerRatio.mean !== null && effectsOnlyPowerRatio.mean >= 1 - 1e-6,
      noArchetypeAutoGrowth: effectsOnlyGrowthPerSpin.mean !== null && Math.abs(effectsOnlyGrowthPerSpin.mean) < 1e-6,
      statisticallyClearEffects: effectsOnlyPowerRatio.ci95[0] !== null && effectsOnlyPowerRatio.ci95[0] > 1,
      incompleteZero: campaigns.every(campaign => !campaign.stopped),
    };
    if (checks) checks.passesRulesRegression = checks.incompleteZero && checks.effectsOnlyNotNegative && checks.noArchetypeAutoGrowth;
    const formationEventWindow = Array.from({ length: 9 }, (_, index) => {
      const offset = index - 3, progress = [], effects = [];
      for (const campaign of campaigns) {
        const first = Math.min(...focusedIds.map(id => formationTimes(campaign)[id]).filter(Number.isFinite));
        const snapshot = campaign.snapshots.find(entry => entry.turn === first + offset && entry.phase !== 'defeat');
        const denominator = snapshot && baselineByTurn[snapshot.turn]?.survivingMeanPower;
        if (!denominator) continue;
        progress.push(snapshot.power / denominator);
        if (snapshot.powerEffectRatio !== null) effects.push(snapshot.powerEffectRatio);
      }
      return { offset, progress: meanInterval(progress), effectsOnlyPowerRatio: meanInterval(effects) };
    });
    return { ...strategy, n, completed, winRateDenominator: completed, wins, losses: completed - wins, winRate: completed ? wins / completed : null, winRateCI95: wilsonInterval(wins, completed), incomplete: n - completed, pairedBaseline: pairedWins(campaigns, baseline), formation,
      failureCauses: { hp: campaigns.filter(campaign => campaign.phase === 'defeat' && campaign.defeatCause === 'hp').length, deadline: campaigns.filter(campaign => campaign.phase === 'defeat' && campaign.defeatCause === 'deadline').length, other: campaigns.filter(campaign => campaign.phase === 'defeat' && !['hp', 'deadline'].includes(campaign.defeatCause)).length }, failureFloors: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, campaigns.filter(campaign => campaign.phase === 'defeat' && campaign.floor === index + 1).length])), survivalRewardDecisions: campaigns.reduce((sum, campaign) => sum + (campaign.survivalRewardDecisions || 0), 0), cautiousRewardDecisions: campaigns.reduce((sum, campaign) => sum + (campaign.cautiousRewardDecisions || 0), 0), releasedPollutedRemovals: campaigns.reduce((sum, campaign) => sum + (campaign.releasedPollutedRemovals || 0), 0),
      beforeFormation, afterFormation, effectsOnlyPowerRatio, effectsOnlyGrowthPerSpin, formationEventWindow, finalAllSampleProgress: meanInterval(perRun.finalProgress), finalFormedCounts: Object.fromEntries([0, 1, 2, 3].map(count => [count, campaigns.filter(campaign => Math.min(3, campaign.finalFormed.length) === count).length])), finalPlannedFormedCounts: Object.fromEntries([0, 1, 2].map(count => [count, campaigns.filter(campaign => Math.min(2, campaign.finalFormed.filter(id => campaign.finalSelected?.includes(id)).length) === count).length])), abandonedRuns: campaigns.filter(campaign => campaign.abandoned.length).length, checks, byTurn };
  });
  return { baselineByTurn: baselineByTurn.map(base => Object.fromEntries(Object.entries(base).map(([key, value]) => [key, typeof value === 'number' ? rounded(value) : value]))), strategies: reports,
    interpretation: { power: '真实引擎标准敌阵探针：实伤 + 0.36 ×（实治疗 + min(25,实格挡+减伤) − 自伤）', growth: '本次探针实际新增永久培养；攻击者转为威力，支援转为标记职能效能；不混入当前战力', progression: '成型前后摘要使用同转仍在对局基线均值作分母；byTurn另外并列全样本进度。v1历史校准的阶段摘要使用全样本基线分母，不能直接跨协议比较', allSample: '全样本平均：死亡当转及以后记0；胜利后保持终局战力；全样本进度与只统计仍在对局样本并列', intervention: '同一状态、同一探针种子，仅关闭目标套路效果；测即时机制贡献，不能推断通关率因果', conditional: '成型后表现、成型事件窗口和成型/未成型胜率属于观察性关联；同时报告未成型失败及各转幸存人数', intervals: '胜率与成型率为Wilson95%；战力/成型回合为以每局为单位的均值正态95%区间；小样本不保证正态近似，n<2不报区间', thresholds: '0.6规则检查要求无未完成局、同状态套路贡献不为负、无套路自动永久成长；它只验证规则边界，不代表通关难度或所有套路等强。0.5的成长补偿门槛已不适用' } };
}

export function compactArchetypeCampaign(campaign) {
  const { snapshots, ...rest } = campaign;
  return { ...rest, policySeed: `${campaign.seed}:actions`, snapshotSchema: ['turn', 'power', 'damage', 'defense', 'growth', 'effectsOffPower', 'effectsOffGrowth', 'formedIds', 'phase', 'selectedIds', 'powerEffectRatio', 'growthEffect'], snapshots: snapshots.map(snapshot => [snapshot.turn, snapshot.power, snapshot.damage, snapshot.defense, snapshot.growth, snapshot.withoutArchetypes?.power, snapshot.withoutArchetypes?.growth, snapshot.formed, snapshot.phase, snapshot.selected, snapshot.powerEffectRatio, snapshot.growthEffect]) };
}

/** Rehydrate the audit payload without rerunning any engine action. */
export function expandArchetypeCampaign(compact) {
  const { snapshotSchema, snapshots, policySeed, ...rest } = compact;
  if (!snapshotSchema?.includes('phase') || !snapshotSchema.includes('selectedIds')) throw new Error('This historical compact format lacks auditable stage-selection fields.');
  const index = name => snapshotSchema.indexOf(name);
  return { ...rest, snapshots: snapshots.map(values => ({ turn: values[index('turn')], power: values[index('power')], damage: values[index('damage')], defense: values[index('defense')], growth: values[index('growth')], withoutArchetypes: { power: values[index('effectsOffPower')], growth: values[index('effectsOffGrowth')] }, formed: values[index('formedIds')], phase: values[index('phase')], selected: values[index('selectedIds')], powerEffectRatio: values[index('powerEffectRatio')], growthEffect: values[index('growthEffect')] })) };
}
````````````````
<!-- frozen-source:end -->
