// Experiment-only campaign recording. No UI imports this module.
import { createHash } from 'node:crypto';
import { newGame, SUPPLIES, inspectSpin, chooseReward, skipReward, rerollRewards, removeSymbol, purchaseSupply, validateSave, observeEngineAction, getCharacterAttributes } from './engine.js';
import { characterById } from './content.js';
import { recommendPlayerAction, getPlayerPolicy, createPlayerRandom, samplePlayerRecommendation } from './player-policy.js';

export const PLAYER_CAMPAIGN_VERSION = 'player-matrix-campaign-v2';
export const PLAYER_SNAPSHOT_FORMAT = 'player-matrix-snapshot-v1';
export const RESOURCE_OPPORTUNITY_KINDS = Object.freeze(['reroll', 'remove', 'supply']);
export const OPPORTUNITY_FLOORS = Object.freeze([2, 4, 6, 8, 10]);
const TERMINAL = new Set(['victory', 'defeat']);
const REWARDS = new Set(['recruit', 'item', 'essence']);
const DEFAULT_POLICY = 'matrix:baseline|H:balanced|J:mixed|R:balanced';
const copy = value => structuredClone(value);
const round = value => Math.round(value * 100) / 100;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const finite = value => typeof value === 'number' && Number.isFinite(value);
const resolvePolicy = value => typeof value === 'string' || !value ? getPlayerPolicy(value || DEFAULT_POLICY) : value;
const firstAffectedFloor = state => state.floor + Number(Boolean(state.pendingFloor));
const resourceKind = action => RESOURCE_OPPORTUNITY_KINDS.includes(action?.type) ? action.type : null;
const emptyFlows = () => ({ healed: 0, shieldGained: 0, enemyHpLost: 0, selfDamage: 0, pollutionHpLost: 0, shieldBlocked: 0, shieldBlockedRecorded: 0, shieldDecayed: 0, shieldOtherLoss: 0, maxHpChange: 0, coinsIn: 0, coinsOut: 0, rerollsIn: 0, rerollsOut: 0, removalsIn: 0, removalsOut: 0, freeRerolls: 0, paidRerolls: 0, removalsUsed: 0, supplyPurchases: 0, supplies: { repair: 0, barrier: 0, overclock: 0 }, supplyCosts: { repair: 0, barrier: 0, overclock: 0 }, permanentAttackIssued: 0 });
function addFlow(flows, key, value) { flows[key] = round(flows[key] + value); }
function sumFlows(a, b) {
  const result = emptyFlows();
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'object') for (const sub of Object.keys(result[key])) result[key][sub] = round((a[key]?.[sub] || 0) + (b[key]?.[sub] || 0));
    else result[key] = round((a[key] || 0) + (b[key] || 0));
  }
  return result;
}
function flowEvent(flows, event) {
  if (event.type === 'hpLoss') addFlow(flows, event.origin === 'enemy' ? 'enemyHpLost' : event.origin === 'pollution' ? 'pollutionHpLost' : 'selfDamage', event.amount);
  else if (event.type === 'heal') addFlow(flows, 'healed', event.amount);
  else if (event.type === 'shieldGain') addFlow(flows, 'shieldGained', event.amount);
  else if (event.type === 'shieldLoss') {
    addFlow(flows, event.origin === 'blocked' ? 'shieldBlocked' : event.origin === 'decay' ? 'shieldDecayed' : 'shieldOtherLoss', event.amount);
    if (event.origin === 'blocked') addFlow(flows, 'shieldBlockedRecorded', event.ledgerAmount);
  } else if (event.type === 'resourceGain') {
    const key = { coins: 'coinsIn', rerolls: 'rerollsIn', removals: 'removalsIn' }[event.resource];
    if (key) addFlow(flows, key, event.amount);
  } else if (event.type === 'resourceSpend') {
    const key = { coins: 'coinsOut', rerolls: 'rerollsOut', removals: 'removalsOut' }[event.resource];
    if (key) addFlow(flows, key, event.amount);
    if (event.origin === 'freeReroll') flows.freeRerolls++;
    if (event.origin === 'paidReroll') flows.paidRerolls++;
    if (event.origin === 'remove') flows.removalsUsed++;
    if (event.origin === 'supply') { flows.supplyPurchases++; flows.supplies[event.kind]++; flows.supplyCosts[event.kind] = round(flows.supplyCosts[event.kind] + event.amount); }
  } else if (event.type === 'effect') {
    if (event.effect.type === 'maxHp') addFlow(flows, 'maxHpChange', event.effect.amount || 0);
    if (event.effect.type === 'attackGrowth' || event.effect.type === 'growth') addFlow(flows, 'permanentAttackIssued', event.effect.amount || 0);
  }
}
export function playerBoundaryState(state) {
  return {
    floor: state.floor, round: state.round, phase: state.phase, pendingFloor: state.pendingFloor,
    hp: state.hp, maxHp: state.maxHp, shield: state.shield, coins: state.coins, rerolls: state.rerolls, removals: state.removals,
    spinsLeft: state.spinsLeft, deadline: state.encounter.deadline, supplyPurchases: state.supplyPurchases,
    enemyHp: round(state.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0)), enemyCount: state.enemies.filter(enemy => enemy.hp > 0).length,
    rosterSize: state.roster.length, distinctCharacters: new Set(state.roster.map(unit => unit.id)).size,
    permanentAttackPercentRetained: round(state.roster.reduce((sum, unit) => sum + (unit.attackPercentBonus || 0), 0)),
    normalAttackBonusesRetained: Object.fromEntries(['primary', 'adjacent', 'eachTarget'].map(key => [key, round(state.roster.reduce((sum, unit) => sum + (unit.normalAttackBonus?.[key] || 0), 0))])),
    permanentAttackRetained: round(state.roster.reduce((sum, unit) => sum + getCharacterAttributes(unit, state).attackBonus, 0)),
    stars: [1, 2, 3].map(star => state.roster.filter(unit => unit.stars === star).length),
    items: state.items.slice(), essences: state.essences.map(entry => ({ id: entry.id, progress: entry.progress, triggered: entry.triggered })),
    stats: copy(state.stats), resourceStats: copy(state.resourceStats),
  };
}
function actionState(state) {
  return { floor: state.floor, phase: state.phase, round: state.round, pendingFloor: state.pendingFloor,
    hp: state.hp, maxHp: state.maxHp, shield: state.shield, coins: state.coins, rerolls: state.rerolls, removals: state.removals,
    spinsLeft: state.spinsLeft, deadline: state.encounter.deadline, supplyPurchases: state.supplyPurchases,
    rosterSize: state.roster.length, enemyHp: round(state.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0)) };
}
export function checkPlayerConservation(A, end, flows, tolerance = .021) {
  if (!A || !end) return { passed: null, residuals: null, reason: 'boundary-unavailable' };
  const residuals = {
    maxHp: round(end.maxHp - (A.maxHp + flows.maxHpChange)),
    hp: round(end.hp - (A.hp + flows.healed - flows.enemyHpLost - flows.selfDamage - flows.pollutionHpLost)),
    shield: round(end.shield - (A.shield + flows.shieldGained - flows.shieldBlocked - flows.shieldDecayed - flows.shieldOtherLoss)),
    coins: round(end.coins - (A.coins + flows.coinsIn - flows.coinsOut)),
    rerolls: round(end.rerolls - (A.rerolls + flows.rerollsIn - flows.rerollsOut)),
    removals: round(end.removals - (A.removals + flows.removalsIn - flows.removalsOut)),
    hpLossLedger: round(end.resourceStats.hpLost - A.resourceStats.hpLost - flows.enemyHpLost - flows.selfDamage - flows.pollutionHpLost),
    healLedger: round(end.resourceStats.healed - A.resourceStats.healed - flows.healed),
    shieldGainLedger: round(end.resourceStats.shieldGained - A.resourceStats.shieldGained - flows.shieldGained),
    shieldBlockLedger: round(end.resourceStats.shieldBlocked - A.resourceStats.shieldBlocked - flows.shieldBlockedRecorded),
    shieldDecayLedger: round(end.resourceStats.shieldDecayed - A.resourceStats.shieldDecayed - flows.shieldDecayed),
    creditsLedger: round(end.resourceStats.creditsSpent - A.resourceStats.creditsSpent - flows.coinsOut),
  };
  return { passed: Object.values(residuals).every(value => finite(value) && Math.abs(value) <= tolerance), residuals, tolerance };
}
function newFloor(floor) {
  return { floor, reached: false, cleared: false, failed: false, cause: null, A: null, B: null, C: null, stage: 'entry', flows: { entry: emptyFlows(), battle: emptyFlows(), rewards: emptyFlows() }, actionCounts: {}, rewards: { recruit: 0, item: 0, essence: 0, skipped: 0 }, offeredCharacters: {}, selectedCharacters: {}, spinCount: 0 };
}
function newTelemetry() { return { pendingExposureActionIndex: null, floors: [], opportunitySummary: {}, seenOpportunityKeys: [], legalWindowKeys: [], offerSequence: 0 }; }
function getFloor(telemetry, floor) { let row = telemetry.floors.find(entry => entry.floor === floor); if (!row) { row = newFloor(floor); telemetry.floors.push(row); } return row; }
function collectEvents(telemetry, events, boundaries, record) {
  for (const event of events) {
    const row = getFloor(telemetry, event.floor);
    if (event.type === 'boundary') {
      row[event.boundary] = playerBoundaryState(event.state);
      if (event.boundary === 'A') { row.reached = true; row.stage = 'battle'; }
      if (event.boundary === 'B') { row.cleared = event.reason === 'clear'; row.failed = !row.cleared; row.cause = row.failed ? event.reason : null; row.stage = 'rewards'; }
      if (event.boundary === 'C') row.stage = 'complete';
      if (record) boundaries.push({ boundary: event.boundary, reason: event.reason, floor: event.floor, state: copy(row[event.boundary]) });
    } else {
      const stage = row.stage === 'entry' ? 'entry' : row.stage === 'battle' ? 'battle' : 'rewards';
      flowEvent(row.flows[stage], event);
    }
  }
}
function summarizeFloor(row, terminalState) {
  const total = sumFlows(row.flows.battle, row.flows.rewards);
  const end = row.C || (terminalState.floor === row.floor ? playerBoundaryState(terminalState) : row.B);
  const turnsUsed = row.B && row.A ? row.B.stats.spins - row.A.stats.spins : row.spinCount;
  const deadline = row.B?.deadline ?? end?.deadline ?? row.A?.deadline ?? null;
  const spinsLeft = row.B?.spinsLeft ?? end?.spinsLeft ?? null;
  return {
    ...copy(row), turnsUsed, deadline, spinsLeft, marginRatio: row.cleared && deadline > 0 ? spinsLeft / deadline : null,
    lastTurnClear: row.cleared ? spinsLeft === 0 : null,
    damage: row.A && row.B ? round(row.B.stats.damage - row.A.stats.damage) : null,
    resources: { income: total.coinsIn, spending: total.coinsOut, freeRerolls: total.freeRerolls, paidRerolls: total.paidRerolls, removalsUsed: total.removalsUsed, supplyPurchases: total.supplyPurchases, supplies: total.supplies, supplyCosts: total.supplyCosts },
    health: { netHp: row.A && row.B ? round(row.B.hp - row.A.hp) : null, netShield: row.A && row.B ? round(row.B.shield - row.A.shield) : null, ...row.flows.battle },
    permanentAttackIssued: total.permanentAttackIssued,
    conservation: { battle: checkPlayerConservation(row.A, row.B, row.flows.battle), total: checkPlayerConservation(row.A, end, total) },
  };
}
function safePolicy(policy) { const result = resolvePolicy(policy); if (!result || typeof result.id !== 'string' || typeof result.version !== 'string') throw new TypeError('A versioned player policy is required.'); return result; }
function validFlows(flows) {
  const shape = emptyFlows();
  return flows && Object.keys(shape).every(key => typeof shape[key] === 'object'
    ? flows[key] && Object.keys(shape[key]).every(sub => finite(flows[key][sub]) && flows[key][sub] >= 0)
    : finite(flows[key]) && (key === 'maxHpChange' || flows[key] >= 0));
}
export function validatePlayerSnapshot(snapshot) {
  try {
    if (snapshot?.format !== PLAYER_SNAPSHOT_FORMAT || snapshot.version !== PLAYER_CAMPAIGN_VERSION) return null;
    const { sha256, ...payload } = snapshot;
    if (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(sha256) || hash(payload) !== sha256) return null;
    if (!validateSave(snapshot.game) || !Number.isSafeInteger(snapshot.cursor?.actions) || snapshot.cursor.actions < 0 || !snapshot.telemetry || !Array.isArray(snapshot.telemetry.floors)) return null;
    safePolicy(snapshot.policy); createPlayerRandom(snapshot.behaviorRandom);
    const telemetry = snapshot.telemetry;
    if (typeof snapshot.behaviorSeed !== 'string' || !Array.isArray(telemetry.seenOpportunityKeys) || !Array.isArray(telemetry.legalWindowKeys) || !Number.isSafeInteger(telemetry.offerSequence) || telemetry.offerSequence < 0) return null;
    if (telemetry.pendingExposureActionIndex !== null && telemetry.pendingExposureActionIndex !== snapshot.cursor.actions) return null;
    const seen = new Set();
    for (const row of telemetry.floors) {
      if (!Number.isSafeInteger(row.floor) || row.floor < 1 || row.floor > snapshot.game.floor || seen.has(row.floor) || !['entry','battle','rewards','complete'].includes(row.stage)) return null;
      seen.add(row.floor);
      if (!['entry','battle','rewards'].every(stage => validFlows(row.flows?.[stage]))) return null;
      if (row.reached && (!row.A || row.A.floor !== row.floor)) return null;
      for (const boundary of ['A','B','C']) if (row[boundary] && (!['hp','maxHp','shield','coins','rerolls','removals','spinsLeft','deadline'].every(key => finite(row[boundary][key])) || row[boundary].floor !== row.floor)) return null;
    }
    return copy(snapshot);
  } catch { return null; }
}
export function resumePlayerCampaign(snapshot, options = {}) { return runPlayerCampaign({ ...options, initialSnapshot: snapshot }); }
function snapshotOf(state, policy, behaviorSeed, random, actions, telemetry, policyMemory) {
  const payload = { format: PLAYER_SNAPSHOT_FORMAT, version: PLAYER_CAMPAIGN_VERSION, game: copy(state), policy: copy(policy), policyMemory: copy(policyMemory), behaviorSeed, behaviorRandom: random.snapshot(), cursor: { actions }, telemetry: copy(telemetry) };
  return { ...payload, sha256: hash(payload) };
}
export function listLegalPlayerResourceOpportunities(state) {
  const result = [], access = state.resourceAccess || {}, reward = REWARDS.has(state.phase), ready = state.phase === 'ready';
  if (reward && access.rerolls !== false && (state.rerolls > 0 || (access.credits !== false && state.coins >= 8))) result.push({ kind: 'reroll', key: 'reroll', worthwhile: null });
  if ((ready || reward) && access.removals !== false && state.removals > 0) for (const unit of state.roster) result.push({ kind: 'remove', key: `remove:${unit.uid}`, uid: unit.uid, worthwhile: null });
  if (ready && access.credits !== false && state.supplyPurchases < 2) for (const [kind, supply] of Object.entries(SUPPLIES)) {
    const benefit = kind === 'repair' ? state.hp < state.maxHp : kind === 'barrier' ? state.shield < state.maxHp * 2 : !state.overclockReady;
    if (state.coins >= supply.cost && benefit && (kind === 'overclock' || access.defense !== false)) result.push({ kind: 'supply', key: `supply:${kind}`, supplyKind: kind, worthwhile: null });
  }
  return result;
}
function exposure(telemetry, state, planned, actions) {
  const floor = firstAffectedFloor(state), audit = planned.audit || {};
  const legal = planned.diagnostics?.decompositionUnavailable ? listLegalPlayerResourceOpportunities(state) : audit.legalOpportunities || [];

  for (const kind of RESOURCE_OPPORTUNITY_KINDS) {
    const rows = legal.filter(entry => entry.kind === kind);
    const key = `${floor}:${kind}`;
    const stats = telemetry.opportunitySummary[key] ||= { floor, kind, decisionStates: 0, legalActions: 0, legalWindows: 0, worthwhileDecisionStates: 0, unknownValueDecisionStates: 0, selectedActions: 0, blockedActions: 0 };
    if (!rows.length) continue;
    stats.decisionStates++; stats.legalActions += rows.length;
    if (rows.some(entry => entry.worthwhile === true)) stats.worthwhileDecisionStates++;
    if (rows.some(entry => entry.worthwhile === null || entry.worthwhile === undefined)) stats.unknownValueDecisionStates++;
    const window = `${key}:${REWARDS.has(state.phase) ? `reward:${telemetry.offerSequence}` : `ready:${state.floor}:${state.round}`}`;
    if (!telemetry.legalWindowKeys.includes(window)) { telemetry.legalWindowKeys.push(window); stats.legalWindows++; }
    const normal = audit.normalPlannedAction || planned;
    if (resourceKind(normal) === kind) {
      stats.selectedActions++;
      if ((audit.blockedKinds || []).includes(kind)) stats.blockedActions++;
    }
  }
  const normal = audit.normalPlannedAction || planned, kind = resourceKind(normal);
  if (!kind || !OPPORTUNITY_FLOORS.includes(floor)) return null;
  const key = `${floor}:${kind}`;
  if (telemetry.seenOpportunityKeys.includes(key)) return null;
  const matching = legal.find(entry => entry.kind === kind && (kind !== 'remove' || entry.uid === normal.uid) && (kind !== 'supply' || entry.supplyKind === normal.kind));
  // Anchor policies may not provide decomposition; selected real actions still
  // have auditable engine legality, but are not called model-valued evidence.
  if (!matching && !isLegalResourceAction(state, normal)) return null;
  return { key, firstAffectedFloor: floor, floor: state.floor, phase: state.phase, round: state.round, actionIndex: actions, kind, action: copy(normal), audit: matching ? copy(matching) : { kind, worthwhile: null, reason: 'decomposition-unavailable' }, offerSequence: telemetry.offerSequence };
}
function isLegalResourceAction(state, action) {
  if (!resourceKind(action)) return false;
  const next = action.type === 'reroll' ? rerollRewards(state) : action.type === 'remove' ? removeSymbol(state, action.uid) : purchaseSupply(state, action.kind);
  return next !== state;
}
function execute(state, action, selected) {
  if (action.type === 'spin') return inspectSpin(state);
  if (action.type === 'remove') return { state: removeSymbol(state, action.uid) };
  if (action.type === 'reroll') return { state: rerollRewards(state) };
  if (action.type === 'supply') return { state: purchaseSupply(state, action.kind) };
  if (action.type === 'reward' && selected) return { state: selected.action === 'skip' ? skipReward(state) : chooseReward(state, selected.index) };
  return { state };
}
/**
 * record controls detailed output only; compact floor ledgers are always kept.
 * maxActions is a cumulative cap, including the snapshot's existing actions.
 * Callback inputs are detached copies. plannerOptions supports blockedKinds
 * without changing any engine resource permission.
 */
export function runPlayerCampaign({ policy, difficulty = 10, seed = 'matrix-v1:diagnostic:world:0', behaviorSeed, initialState, initialSnapshot, maxActions = 1000, pauseAfterActions = null, record = true, captureOpportunities = false, includeFinalSnapshot = true, includeHits = false, behaviorSeedOverride = null, onAction = null, actionTransform = null, stopOnOpportunity = false, onOpportunity = null, plannerOptions = {}, policyTransform = null, policyMemory = null } = {}) {
  if (!Number.isSafeInteger(maxActions) || maxActions < 1 || maxActions > 100000) throw new RangeError('maxActions must be an integer in 1..100000.');
  if (pauseAfterActions !== null && (!Number.isSafeInteger(pauseAfterActions) || pauseAfterActions < 0)) throw new RangeError('pauseAfterActions must be a nonnegative integer.');
  if (initialSnapshot && initialState) throw new Error('Choose an initialState or initialSnapshot, not both.');
  const started = performance.now();
  const cpuClock = typeof process.threadCpuUsage === 'function' ? process.threadCpuUsage.bind(process) : process.cpuUsage.bind(process);
  const cpuScope = typeof process.threadCpuUsage === 'function' ? 'thread' : 'process-overlap-possible';
  const cpu = cpuClock();
  const restored = initialSnapshot ? validatePlayerSnapshot(initialSnapshot) : null;
  if (initialSnapshot && !restored) throw new Error('Invalid player campaign snapshot.');
  let config = safePolicy(policy || restored?.policy), state, telemetry, actions = restored?.cursor.actions || 0;
  policyMemory = copy(restored?.policyMemory ?? policyMemory);
  if (restored && behaviorSeed && behaviorSeed !== restored.behaviorSeed && behaviorSeedOverride === null) throw new Error('Use behaviorSeedOverride to label a resampled continuation explicitly.');
  behaviorSeed = String(behaviorSeedOverride ?? behaviorSeed ?? restored?.behaviorSeed ?? `${initialState?.seed || seed}:behavior:0`);
  const random = createPlayerRandom(behaviorSeedOverride === null && restored ? restored.behaviorRandom : behaviorSeed);
  const continuation = restored ? behaviorSeedOverride === null ? 'snapshot-exact' : 'resampled-behavior' : 'new-campaign';
  const actionTrace = [], turns = [], boundaries = [], opportunities = [];
  if (restored) { state = copy(restored.game); telemetry = copy(restored.telemetry); }
  else if (initialState) {
    if (!validateSave(initialState)) throw new Error('Invalid initial campaign state.');
    state = copy(initialState); telemetry = newTelemetry();
    const row = getFloor(telemetry, state.floor); row.A = playerBoundaryState(state); row.reached = true; row.stage = state.pendingFloor ? 'rewards' : 'battle';
    row.partialEntry = state.round !== 0 || state.phase !== 'ready';
    if (REWARDS.has(state.phase)) telemetry.offerSequence = 1;
  } else {
    telemetry = newTelemetry();
    const result = observeEngineAction(() => newGame({ seed, difficulty })); state = result.state;
    collectEvents(telemetry, result.events, boundaries, record);
  }
  const initialActionIndex = actions;
  let stopped = null, errors = [];
  try {
    while (!TERMINAL.has(state.phase) && actions < maxActions) {
      if (pauseAfterActions !== null && actions - initialActionIndex >= pauseAfterActions) { stopped = 'paused'; break; }
      const effective = policyTransform ? safePolicy(policyTransform({ state: copy(state), policy: copy(config), actions, memory: copy(policyMemory) }) || config) : config;
      const options = typeof plannerOptions === 'function' ? plannerOptions({ state: copy(state), policy: copy(effective), actions, memory: copy(policyMemory) }) : plannerOptions;
      const decisionStart = performance.now();
      let planned = recommendPlayerAction(state, effective, options || {});
      if (actionTransform) planned = actionTransform({ state: copy(state), planned: copy(planned), policy: copy(effective), actions }) || planned;
      const decisionMs = performance.now() - decisionStart;
      const alreadyExposed = telemetry.pendingExposureActionIndex === actions;
      const opportunity = alreadyExposed ? null : exposure(telemetry, state, planned, actions);
      telemetry.pendingExposureActionIndex = actions;
      if (opportunity) {
        telemetry.seenOpportunityKeys.push(opportunity.key);
        if (captureOpportunities || onOpportunity || stopOnOpportunity) {
          const entry = { ...opportunity, snapshot: snapshotOf(state, config, behaviorSeed, random, actions, telemetry, policyMemory) };
          if (captureOpportunities) opportunities.push(copy(entry));
          const requestedStop = onOpportunity?.(copy(entry)) === 'stop';
          if (stopOnOpportunity === true || requestedStop) { stopped = 'opportunity'; break; }
        }
      }
      if (planned.type === 'stop') { stopped = 'policy-stop'; break; }
      const before = state, randomBefore = random.snapshot();
      let selected = null, draw = null;
      if (planned.type === 'reward') { draw = random(); selected = samplePlayerRecommendation(planned.recommendation || planned, draw); }
      const actionStart = performance.now(); let result;
      const observed = observeEngineAction(() => { result = execute(before, planned, selected); return result.state; });
      const next = observed.state;
      if (next === before) { stopped = 'no-progress'; break; }
      if (observed.observerErrors.length) throw new Error(`Engine observer failed: ${observed.observerErrors.join('; ')}`);
      const row = getFloor(telemetry, before.floor);
      row.actionCounts[planned.type] = (row.actionCounts[planned.type] || 0) + 1;
      if (planned.type === 'spin') row.spinCount++;
      if (planned.type === 'reward' && selected) {
        if (selected.action === 'skip') row.rewards.skipped++;
        else { row.rewards[before.phase]++; if (before.phase === 'recruit') row.selectedCharacters[selected.id] = (row.selectedCharacters[selected.id] || 0) + 1; }
      }
      collectEvents(telemetry, observed.events, boundaries, record);
      if (next.choices.length && (planned.type === 'reroll' || planned.type === 'spin' || planned.type === 'reward')) {
        telemetry.offerSequence++;
        if (next.phase === 'recruit') {
          const owner = getFloor(telemetry, next.floor);
          for (const id of next.choices) owner.offeredCharacters[id] = (owner.offeredCharacters[id] || 0) + 1;
        }
      }
      const actionFlows = emptyFlows();
      for (const event of observed.events) flowEvent(actionFlows, event);
      if (record) {
        actionTrace.push({ index: actions, floor: before.floor, firstAffectedFloor: firstAffectedFloor(before), phase: before.phase, round: before.round, type: planned.type, ...(planned.uid ? { uid: planned.uid } : {}), ...(planned.kind ? { kind: planned.kind } : {}), selected: selected ? copy(selected) : null, draw, choices: planned.type === 'reward' ? copy(planned.choices || planned.recommendation?.choices || []) : [], diagnostics: copy(planned.diagnostics || {}), audit: copy(planned.audit || {}), policyId: effective.id, policyParameters: { H: copy(effective.H), J: copy(effective.J), R: copy(effective.R) }, randomBefore, randomAfter: random.snapshot(), before: actionState(before), after: actionState(next), ledger: actionFlows, stateHash: hash(next), decisionMs, actionMs: performance.now() - actionStart });
        if (planned.type === 'spin') turns.push({ floor: before.floor, round: next.lastSpin.round, turn: next.stats.spins, damage: next.lastSpin.damage, incoming: next.lastSpin.incoming, before: actionState(before), after: actionState(next), ledger: actionFlows, ...(includeHits ? { hits: copy(result.hits || []), effects: copy(result.effects || []), events: copy(observed.events.filter(event => event.type !== 'boundary')), roster: before.roster.map(unit => ({ uid: unit.uid, id: unit.id, role: characterById(unit.id)?.role, stars: unit.stars, present: Number(next.board.some(entry => entry?.uid === unit.uid)) })) } : {}) });
      }
      state = next; actions++; telemetry.pendingExposureActionIndex = null;
      if (onAction) { const updated = onAction({ before: copy(before), after: copy(state), action: copy(planned), selected: copy(selected), actions, memory: copy(policyMemory) }); if (updated?.memory !== undefined) policyMemory = copy(updated.memory); }
    }
  } catch (error) { stopped = 'exception'; errors.push({ name: error.name, message: error.message, stack: error.stack }); }
  if (!TERMINAL.has(state.phase) && !stopped) stopped = 'action-limit';
  const floors = telemetry.floors.filter(row => row.reached).sort((a, b) => a.floor - b.floor).map(row => summarizeFloor(row, state));
  const bad = floors.filter(row => row.conservation.battle.passed === false || row.conservation.total.passed === false);
  if (bad.length) { errors.push({ name: 'ConservationError', message: `Resource conservation failed on floors ${bad.map(row => row.floor).join(',')}` }); stopped = 'conservation-failed'; }
  const usedCpu = cpuClock(cpu), won = state.phase === 'victory';
  return {
    version: PLAYER_CAMPAIGN_VERSION, strategyId: config.id, policy: copy(config), seed: state.seed, behaviorSeed, difficulty: state.difficulty,
    phase: state.phase, won, floor: state.floor, clearedFloors: won ? 12 : Math.max(0, state.floor - 1), observedClearedFloors: floors.filter(row => row.cleared).length, death: state.phase === 'defeat' ? state.hp <= 0 ? 'hp' : 'deadline' : null,
    stopped, errors, actions, actionsExecuted: actions - initialActionIndex, turnCount: state.stats.spins, hp: state.hp, maxHp: state.maxHp, shield: state.shield, coins: state.coins,
    continuation, resourceAccess: copy(state.resourceAccess), finalStateHash: hash(state), floors, conservationPassed: bad.length === 0,
    resourceOpportunitySummary: Object.values(telemetry.opportunitySummary),
    ...(record ? { actionTrace, turns, boundaries } : {}), ...(captureOpportunities ? { opportunities } : {}),
    ...(includeFinalSnapshot ? { finalSnapshot: snapshotOf(state, config, behaviorSeed, random, actions, telemetry, policyMemory) } : {}),
    timing: { wallMs: performance.now() - started, cpuScope, cpuUserMs: usedCpu.user / 1000, cpuSystemMs: usedCpu.system / 1000 },
  };
}
