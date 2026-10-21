import { newGame, chooseReward, skipReward, removeSymbol, rerollRewards, purchaseSupply, FINAL_FLOOR } from './engine.js';
import { inspectSpin } from './growth-telemetry.js';
import { recommendAction, recommendRewards, createPolicyRandom, sampleRecommendation, DEFAULT_PROFILE } from './ai.js';
import { buildArchetypeStrategies, updateArchetypePlan, archetypeSurvivalMode, shouldKeepArchetypeOffer, biasArchetypeRecommendations } from './archetype-simulation.js';
import { CHARACTERS, characterById } from './content.js';
import { getArchetypes } from './archetypes.js';
import { isPolluted } from './enemy-effects.js';

export const GROWTH_PROTOCOL = Object.freeze({ version: 'card-growth-v1', difficulty: 10, probeSamples: 12, probeEnemyHp: 1e9, probeEnemyAttack: 5, hpFraction: 0.5, lookahead: false, strength: 24, coverageBonus: 80 });
const REWARDS = ['recruit', 'item', 'essence'];
const terminal = state => ['victory', 'defeat'].includes(state.phase);
const permanent = unit => unit && !unit.temporary && !unit.commission && !unit.origin;
const blank = () => ({ heldTurns: 0, instanceTurns: 0, appearances: 0, power: 0, normalDamage: 0, skillDamage: 0, growthReceived: 0, healing: 0, shield: 0, buff: 0 });
const hash = value => { let result = 2166136261; for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619); return (result >>> 0) || 1; };
const round = value => Math.round(value * 1e6) / 1e6;
export const growthStrategies = () => buildArchetypeStrategies();

function addObservation(table, before, after, hits) {
  const rows = new Map(), owners = new Map();
  for (const unit of before.roster.filter(permanent)) {
    owners.set(unit.uid, unit.id);
    if (!rows.has(unit.id)) rows.set(unit.id, blank());
    rows.get(unit.id).instanceTurns++;
  }
  for (const row of rows.values()) row.heldTurns = 1;
  const byUid = new Map(after.board.filter(Boolean).map(unit => [unit.uid, unit]));
  for (const [cell, unit] of after.board.entries()) {
    if (!unit || !owners.has(unit.uid)) continue;
    const row = rows.get(unit.id);
    // A consumed assignment has no action; a pollution death may stop before powers.
    if (unit.status !== 'consumed' && after.lastSpin.powerBreakdown[cell]) {
      row.appearances++;
      row.power += after.lastSpin.values[cell];
    }
  }
  for (const hit of hits) {
    const id = owners.get(hit.sourceUid);
    if (id && hit.sourceType === 'character') rows.get(id)[hit.kind === 'attack' ? 'normalDamage' : 'skillDamage'] += hit.amount;
  }
  for (const effect of after.lastSpin.effects || []) {
    const recipient = owners.get(effect.targetUid), source = owners.get(effect.sourceUid);
    if (effect.type === 'growth' && recipient) rows.get(recipient).growthReceived += effect.amount || 0;
    if (!source) continue;
    if (effect.type === 'heal') rows.get(source).healing += effect.amount || 0;
    if (effect.type === 'shield') rows.get(source).shield += effect.amount || 0;
    if (effect.type === 'power' && effect.targetUid && effect.targetUid !== effect.sourceUid && byUid.has(effect.targetUid)) rows.get(source).buff += effect.amount || 0;
  }
  for (const [id, row] of rows) {
    table[id] ||= blank();
    for (const key of Object.keys(row)) table[id][key] = round(table[id][key] + row[key]);
  }
}

export function makeGrowthProbe(state, sample, { withoutGrowth = false } = {}) {
  const probe = structuredClone(state);
  probe.phase = 'ready'; probe.pendingFloor = false; probe.pendingRewards = []; probe.choices = [];
  probe.spinsLeft = 100; probe.hp = probe.maxHp * GROWTH_PROTOCOL.hpFraction; probe.shield = 0;
  probe.activeDebuffs = []; delete probe.pollution;
  probe.enemySkill = { id: 'card-growth-probe', name: '五列高血标准靶' }; probe.overclockReady = false; probe.bossStage = 0;
  probe.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `probe-${col}`, col, hp: GROWTH_PROTOCOL.probeEnemyHp, maxHp: GROWTH_PROTOCOL.probeEnemyHp, attack: GROWTH_PROTOCOL.probeEnemyAttack, boss: false }));
  // Independent public experiment stream; never reads or advances campaign RNG.
  probe.rngState = hash(`${GROWTH_PROTOCOL.version}:${state.seed}:${sample}`);
  if (withoutGrowth) for (const unit of probe.roster) unit.growth = 0;
  return probe;
}

export function probeGrowthRoster(state, samples = GROWTH_PROTOCOL.probeSamples) {
  if (!Number.isInteger(samples) || samples < 1 || samples > 64) throw new Error('probeSamples must be 1–64.');
  const full = {}, noGrowth = {};
  for (let sample = 0; sample < samples; sample++) {
    for (const [table, withoutGrowth] of [[full, false], [noGrowth, true]]) {
      const before = makeGrowthProbe(state, sample, { withoutGrowth });
      const { state: after, hits } = inspectSpin(before);
      addObservation(table, before, after, hits);
    }
  }
  return { samples, full, noGrowth };
}

function coverageRecommendation(state, recommendation, targetId, temperature) {
  if (state.phase !== 'recruit') return recommendation;
  const scored = recommendation.choices.map(choice => ({ ...choice, score: choice.score + (choice.action === 'choose' && choice.id === targetId ? GROWTH_PROTOCOL.coverageBonus : 0) }));
  const max = Math.max(...scored.map(choice => choice.score));
  const masses = scored.map(choice => Math.exp(Math.max(-20, (choice.score - max) / temperature)));
  const sum = masses.reduce((a, b) => a + b, 0);
  return { ...recommendation, choices: scored.map((choice, index) => ({ ...choice, probability: masses[index] / sum })) };
}

/** Full legal campaigns. Coverage changes preference only for visible offers. */
export function runGrowthCampaign({ seed = 'growth', difficulty = 10, strategy = growthStrategies()[0], profile = DEFAULT_PROFILE, probeSamples = GROWTH_PROTOCOL.probeSamples, maxActions = 1000 } = {}) {
  if (strategy.kind === 'coverage' && !characterById(strategy.targetId)) throw new Error('Unknown target card.');
  let state = newGame({ seed, difficulty }), plan = null, actions = 0, stopped = null;
  const random = createPolicyRandom(`${seed}:actions`), windows = { early: {}, mid: {}, late: {}, terminal: {}, final12: {} }, seen = new Set(), offered = new Set();
  let terminalFloor = 1, sharedDamage = 0, allDamage = 0;
  const planStrategy = strategy.kind === 'coverage' ? { kind: 'baseline' } : strategy;
  const observeRoster = () => { for (const unit of state.roster.filter(permanent)) seen.add(unit.id); };
  observeRoster();
  while (!terminal(state) && actions < maxActions) {
    if (state.phase === 'recruit') for (const id of state.choices) offered.add(id);
    plan = updateArchetypePlan(state, planStrategy, plan);
    const survival = archetypeSurvivalMode(state);
    let action = recommendAction(state, { profile, lookahead: false });
    const targetVisible = strategy.kind === 'coverage' && state.phase === 'recruit' && state.choices.includes(strategy.targetId);
    if (action.type === 'reroll' && ((survival.scale === 1 && shouldKeepArchetypeOffer(state, plan)) || targetVisible)) action = { type: 'reward', recommendation: recommendRewards(state, { profile, lookahead: false }) };
    if (action.type === 'remove' && strategy.kind !== 'baseline') {
      const unit = state.roster.find(entry => entry.uid === action.uid);
      const finalIdentity = unit && state.roster.filter(entry => permanent(entry) && entry.id === unit.id).length === 1;
      const needed = strategy.kind === 'coverage' ? unit?.id === strategy.targetId : getArchetypes(state).some(status => plan.selected.includes(status.id) && status.memberIds.includes(unit?.id));
      if (finalIdentity && needed && survival.scale === 1 && !isPolluted(state, unit.uid)) action = REWARDS.includes(state.phase) ? { type: 'reward', recommendation: recommendRewards(state, { profile, lookahead: false }) } : { type: 'spin' };
    }
    let next;
    if (action.type === 'spin') {
      if (terminalFloor !== state.floor) { windows.terminal = {}; terminalFloor = state.floor; }
      const { state: after, hits } = inspectSpin(state);
      const stage = state.floor <= 4 ? 'early' : state.floor <= 8 ? 'mid' : 'late';
      addObservation(windows[stage], state, after, hits);
      addObservation(windows.terminal, state, after, hits);
      if (state.floor === FINAL_FLOOR) addObservation(windows.final12, state, after, hits);
      const sum = hits.reduce((total, hit) => total + hit.amount, 0);
      if (Math.abs(sum - after.lastSpin.damage) > 0.021) throw new Error('Damage ledger does not reconcile.');
      sharedDamage += hits.filter(hit => hit.sourceType !== 'character').reduce((total, hit) => total + hit.amount, 0);
      allDamage += sum;
      next = after;
    } else if (action.type === 'remove') next = removeSymbol(state, action.uid);
    else if (action.type === 'reroll') next = rerollRewards(state);
    else if (action.type === 'supply') next = purchaseSupply(state, action.kind);
    else if (action.type === 'reward' && REWARDS.includes(state.phase)) {
      if (state.phase === 'recruit') for (const id of state.choices) offered.add(id);
      let recommendation = biasArchetypeRecommendations(state, action.recommendation, plan, { strength: GROWTH_PROTOCOL.strength * survival.scale, temperature: profile.temperature });
      if (strategy.kind === 'coverage') recommendation = coverageRecommendation(state, recommendation, strategy.targetId, profile.temperature);
      const index = sampleRecommendation(recommendation, random()), choice = recommendation.choices.find(entry => entry.index === index);
      if (!choice) { stopped = 'invalid-choice'; break; }
      next = choice.action === 'skip' ? skipReward(state) : chooseReward(state, index);
    } else { stopped = 'unknown-action'; break; }
    if (next === state) { stopped = 'no-progress'; break; }
    state = next; actions++; observeRoster();
  }
  if (!terminal(state) && !stopped) stopped = 'action-limit';
  const probe = probeGrowthRoster(state, probeSamples);
  const ids = [...new Set([...seen, ...Object.keys(probe.full)])];
  const cards = ids.map(id => {
    const units = state.roster.filter(unit => permanent(unit) && unit.id === id), n = units.length;
    return { id, endCount: n, endGrowth: n ? round(units.reduce((sum, unit) => sum + unit.growth, 0) / n) : null, endStars: n ? round(units.reduce((sum, unit) => sum + unit.stars, 0) / n) : null, endTicks: n ? round(units.reduce((sum, unit) => sum + unit.ticks, 0) / n) : null,
      windows: Object.fromEntries(Object.entries(windows).filter(([, table]) => table[id]).map(([name, table]) => [name, table[id]])), probe: probe.full[id] || null, noGrowthProbe: probe.noGrowth[id] || null };
  });
  return { seed, strategyId: strategy.id, strategyKind: strategy.kind, targetId: strategy.targetId || null, difficulty, won: state.phase === 'victory', phase: state.phase, floor: state.floor, turns: state.stats.spins, actions, stopped, defeatCause: state.phase === 'defeat' ? state.hp <= 0 ? 'hp' : 'deadline' : null, finalFormed: getArchetypes(state).filter(status => status.formed).map(status => status.id), offered: [...offered], cards, allDamage: round(allDamage), sharedDamage: round(sharedDamage) };
}

export const cardMetadata = () => CHARACTERS.map(({ id, name, rarity, attack, power, path, description }) => ({ id, name, rarity, attack, basePower: power, path, description }));
