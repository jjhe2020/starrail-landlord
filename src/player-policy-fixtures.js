// Controlled legal decision states, never natural-campaign evidence.
import { newGame, validateSave } from './engine.js';
import { CHARACTERS, characterById } from './content.js';
import { enemyDebuffById, pollutionDescription } from './enemy-effects.js';
import { recommendAction } from './ai.js';
import { DEFAULT_PROFILE } from './ai-profile.js';
import { buildPlayerPolicies, getPlayerPolicy, recommendPlayerAction, rewardProbabilities, clearPlayerPolicyCache } from './player-policy.js';

export const PLAYER_FIXTURE_VERSION = 'player-matrix-state-bank-v1';
export const FIXTURE_STAGES = Object.freeze([{ id: 'early', floor: 2, stars: 1 }, { id: 'mid', floor: 6, stars: 1 }, { id: 'late', floor: 10, stars: 2 }]);
export const FIXTURE_RISKS = Object.freeze(['safe', 'health', 'deadline', 'combined']);
export const FIXTURE_DECISIONS = Object.freeze(['tag', 'merge', 'growth', 'economy', 'essence', 'pollution', 'scarce', 'abundant']);
const baseIds = ['1001', '1002', '1009', '1013', '1105', '1106', '1215', '1304'];
const unit = (id, index, stars, ticks) => ({ uid: `u${index + 1}`, id, stars, attackBonus: 0, growth: 0, ticks });
export function createPlayerPolicyFixtures() {
  const fixtures = [];
  for (const [stageIndex, stage] of FIXTURE_STAGES.entries()) for (const [riskIndex, risk] of FIXTURE_RISKS.entries()) for (const [decisionIndex, decision] of FIXTURE_DECISIONS.entries()) {
    const id = `${stage.id}:${risk}:${decision}`, state = newGame({ seed: `policy-fixture-v1:${id}`, difficulty: 10 });
    state.floor = stage.floor;
    state.encounter = { name: '策略行为验证场景', deadline: 5 + Math.floor((stage.floor - 1) / 4) };
    state.round = ['deadline', 'combined'].includes(risk) ? state.encounter.deadline - 1 : 0;
    state.spinsLeft = state.encounter.deadline - state.round;
    state.hp = ['health', 'combined'].includes(risk) ? 24 : 100;
    state.shield = risk === 'safe' ? 8 : 0;
    state.coins = decision === 'scarce' ? 10 : decision === 'abundant' ? 120 : 40;
    state.rerolls = decision === 'scarce' ? 0 : 3;
    state.removals = decision === 'scarce' ? 0 : 3;
    state.resourceStats.hpLost = state.maxHp - state.hp;
    state.resourceStats.shieldGained = state.shield;
    state.stats.coins = state.coins;
    state.stats.spins = stageIndex * 10 + state.round;
    state.activeDebuffs = [];
    state.bossStage = stage.floor % 3 === 0 ? 1 : 0;
    const hp = [40, 160, 500][stageIndex];
    state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `fixture-${stage.floor}-${col}`, name: '受控敌人', col, hp, maxHp: hp, attack: [2, 5, 9][stageIndex], boss: state.bossStage > 0 && col === 2 }));
    state.enemyIntent = { damage: state.enemies.reduce((sum, e) => sum + e.attack, 0), round: state.round + 1, name: state.enemySkill.name, description: state.enemySkill.description };
    state.phase = ['pollution', 'scarce', 'abundant'].includes(decision) ? 'ready' : 'recruit';
    state.pendingFloor = false; state.pendingRewards = [];
    const ids = [...baseIds];
    if (decision === 'merge') ids.push('1002');
    if (decision === 'pollution') ids.push(...CHARACTERS.filter(c => c.recruitable !== false).slice(0, 15).map(c => c.id));
    state.roster = ids.map((id, index) => unit(id, index, decision === 'merge' && id === '1002' ? 1 : stage.stars, (stageIndex * 2 + riskIndex) % 4));
    state.uidCounter = state.roster.length + 1;
    state.board = Array.from({ length: 20 }, (_, i) => state.roster[i] ? { ...state.roster[i] } : null);
    state.choices = state.phase === 'ready' ? [] : decision === 'growth' ? ['1009', '1207', '1003'] : decision === 'economy' ? ['1406', '1314', '1003'] : decision === 'merge' ? ['1002', '1003', '1304'] : decision === 'essence' ? ['1105', '1009', '1003'] : ['1003', '1304', '1205'];
    if (decision === 'economy') state.items = ['faith_bond'];
    if (decision === 'essence') state.essences = [{ id: 'essence_abundance', progress: 4, triggered: false }, { id: 'essence_elation', progress: 60, triggered: false }];
    if (decision === 'pollution') {
      const target = state.roster.find(u => u.stars === 1) || state.roster[0];
      target.stars = 1;
      const def = enemyDebuffById('rift_pollution');
      state.activeDebuffs.push({ id: def.id, name: def.name, description: pollutionDescription(CHARACTERS.find(c => c.id === target.id).name), source: 'difficulty', addedRound: 0, targetUid: target.uid, targetId: target.id, targetName: CHARACTERS.find(c => c.id === target.id).name });
      state.board = Array.from({ length: 20 }, (_, i) => state.roster[i] ? { ...state.roster[i] } : null);
    }
    const valid = validateSave(state);
    if (!valid) throw new Error(`Invalid policy fixture: ${id}`);
    fixtures.push({ id, version: PLAYER_FIXTURE_VERSION, stage: stage.id, risk, decision, state: valid, scope: 'generated legal decision state; not a natural run or balance result' });
  }
  return fixtures;
}
export function createTagPreferenceProbes() {
  const template = createPlayerPolicyFixtures()[0].state;
  const policies = buildPlayerPolicies().filter(p => p.kind === 'matrix' && p.H.id === 'balanced' && p.J.id === 'mixed' && p.R.id === 'balanced' && p.T.id !== 'baseline');
  return policies.map(p => {
    const state = structuredClone(template), members = new Set(p.T.memberIds);
    const safe = c => c.recruitable !== false && !(c.effects || []).some(e => ['selfDamage', 'maxHp'].includes(e.type));
    const member = CHARACTERS.find(c => members.has(c.id) && safe(c)), outside = CHARACTERS.filter(c => !members.has(c.id) && safe(c)).slice(0, 2);
    state.seed = `tag-probe:${p.T.id}`; state.floor = 12; state.round = 6; state.spinsLeft = 1; state.encounter.deadline = 7;
    state.hp = 100; state.shield = 200; state.coins = 0; state.removals = 0; state.rerolls = 0; state.bossStage = 0;
    state.roster = [{ uid: 'u1', id: '1013', stars: 3, growth: 0, attackBonus: 10000, ticks: 0 }];
    state.board = Array.from({ length: 20 }, (_, i) => i === 0 ? { ...state.roster[0] } : null); state.uidCounter = 2;
    state.enemies = state.enemies.map(e => ({ ...e, hp: 1, maxHp: 1, attack: 0, boss: false }));
    state.enemyIntent = { ...state.enemyIntent, damage: 0, round: 7 };
    state.choices = [member.id, ...outside.map(c => c.id)];
    const valid = validateSave(state); if (!valid) throw new Error(`Invalid tag probe: ${p.T.id}`);
    return { id: `tag-probe:${p.T.id}`, policyId: p.id, tagId: p.T.id, memberId: member.id, state: valid, scope: 'Equal immediate-outcome tag probe; high attack only in test state, never game content.' };
  });
}
export function validatePlayerPolicyBehavior({ fixtures = createPlayerPolicyFixtures(), includeAllPolicies = true } = {}) {
  const policies = buildPlayerPolicies(), rows = [], failures = [], stats = { states: fixtures.length, policies: policies.length, recommendations: 0, algebra: 0, randomFormula: 0, tagBonuses: 0, noTagBonuses: 0, horizonContrasts: 0, resourceContrasts: 0, finite: 0, anchorComparisons: 0, tagProbes: 0, tagProbabilityContrasts: 0 };
  clearPlayerPolicyCache();
  const main = includeAllPolicies ? policies.filter(p => p.kind === 'matrix') : policies.filter(p => p.teamId === 'baseline' && p.kind === 'matrix');
  for (const fixture of fixtures) {
    const contrasts = new Map();
    for (const p of main) {
      const rec = recommendPlayerAction(fixture.state, p); stats.recommendations++;
      const candidates = rec.rewardChoices || rec.choices || [];
      for (const c of candidates) {
        const correct = Math.abs(c.U - (c.N + p.H.lambdaF * c.F + c.T - p.R.lambdaR * c.C)) < 1e-7;
        if (!correct) failures.push({ fixture: fixture.id, policy: p.id, type: 'algebra' }); else stats.algebra++;
        if (![c.N, c.F, c.T, c.C, c.U, c.probability].every(Number.isFinite)) failures.push({ fixture: fixture.id, policy: p.id, type: 'non-finite' }); else stats.finite++;
        if (c.T > 0) stats.tagBonuses++; else stats.noTagBonuses++;
      }
      if (candidates.length) {
        const expected = rewardProbabilities(candidates.map(c => c.U), p.J.epsilon);
        if (!candidates.every((c, i) => Math.abs(c.probability - expected[i]) < 1e-12)) failures.push({ fixture: fixture.id, policy: p.id, type: 'probabilities' }); else stats.randomFormula++;
      }
      if (p.teamId === 'baseline' && p.J.id === 'deterministic') contrasts.set(`${p.H.id}:${p.R.id}`, { rec, candidates });
    }
    const short = contrasts.get('short:balanced'), long = contrasts.get('greedy:balanced');
    if (short?.candidates.length && long?.candidates.length) {
      const scoreDiff = short.candidates.some((c, i) => Math.abs(c.N - long.candidates[i].N) > 1e-8 || Math.abs(c.F - long.candidates[i].F) > 1e-8 || Math.abs(c.C - long.candidates[i].C) > 1e-8);
      if (scoreDiff) failures.push({ fixture: fixture.id, type: 'horizon-contaminates-features' });
      const a = short.candidates.reduce((best, c) => c.U > best.U ? c : best), b = long.candidates.reduce((best, c) => c.U > best.U ? c : best);
      if (a.id !== b.id) { stats.horizonContrasts++; rows.push({ fixture: fixture.id, contrast: 'short-greedy', short: a.id, greedy: b.id, shortComponents: { N: a.N, F: a.F }, greedyComponents: { N: b.N, F: b.F } }); }
    }
    const active = contrasts.get('balanced:active')?.rec, reserve = contrasts.get('balanced:reserve')?.rec;
    if (active && reserve) {
      const activeRows = active.audit.legalOpportunities, reserveRows = reserve.audit.legalOpportunities;
      for (const a of activeRows) {
        const b = reserveRows.find(row => row.key === a.key);
        if (!b || a.U + 1e-8 < b.U) failures.push({ fixture: fixture.id, type: 'resource-price-nonmonotonic', key: a.key });
      }
      if (JSON.stringify(active.audit.normalPlannedAction) !== JSON.stringify(reserve.audit.normalPlannedAction)) { stats.resourceContrasts++; rows.push({ fixture: fixture.id, contrast: 'resource', active: active.audit.normalPlannedAction, reserve: reserve.audit.normalPlannedAction }); }
    }
  }
  for (const fixture of fixtures) {
    const expected = recommendAction(fixture.state, { profile: DEFAULT_PROFILE, lookahead: true }), actual = recommendPlayerAction(fixture.state, 'control:current-ai');
    const projection = (action, choices) => ({ type: action.type, uid: action.uid, kind: action.kind, reason: action.reason, choices });
    if (JSON.stringify(projection(expected, expected.recommendation?.choices)) !== JSON.stringify(projection(actual, actual.choices))) failures.push({ fixture: fixture.id, type: 'current-ai-anchor-drift' });
    else stats.anchorComparisons++;
  }
  const tagProbeResults = [];
  for (const fixture of createTagPreferenceProbes()) {
    const p = getPlayerPolicy(fixture.policyId), tagged = recommendPlayerAction(fixture.state, p), neutral = recommendPlayerAction(fixture.state, 'matrix:baseline|H:balanced|J:mixed|R:balanced');
    const matched = tagged.choices.find(c => c.id === fixture.memberId), original = neutral.choices.find(c => c.id === fixture.memberId);
    stats.tagProbes++;
    const passed = matched.T > 0 && matched.probability > original.probability && tagged.choices.filter(c => c.id !== fixture.memberId).every(c => c.T === 0);
    if (!passed) failures.push({ fixture: fixture.id, type: 'tag-probability-not-expressed', tagged: matched, neutral: original }); else stats.tagProbabilityContrasts++;
    tagProbeResults.push({ tagId: fixture.tagId, memberId: fixture.memberId, matched: { N: matched.N, F: matched.F, T: matched.T, probability: matched.probability }, neutralProbability: original.probability, passed });
  }
  if (!stats.horizonContrasts) failures.push({ type: 'no-real-horizon-ranking-change' });
  if (!stats.resourceContrasts) failures.push({ type: 'no-real-resource-action-change' });
  return { version: PLAYER_FIXTURE_VERSION, passed: failures.length === 0, stats, contrasts: rows, tagProbeResults, failures, parameters: { lambdaF: [.35, 1, 2], epsilon: [0, .15, .45], lambdaR: [.5, 1, 2] }, scope: 'State-bank qualification only, no natural-campaign win measurements.' };
}
