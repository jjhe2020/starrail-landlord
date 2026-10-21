import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, chooseReward, getSynergies, validateSave } from '../src/engine.js';
import { RETIREMENT_RULES, retirementEligibility, getRetirementPreview, newRetirementStats } from '../src/retirements.js';
import { getArchetypes, isArchetypeCore } from '../src/archetypes.js';
import { adjacentIndexes } from '../src/effect-rules.js';

function fixture(ids, seed = 'commission-0') {
  const state = newGame({ seed });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: index === 0 ? 2 : 0 }));
  state.uidCounter = ids.length + 1;
  state.board = Array(20).fill(null);
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `test-${col}`, name: '委派测试靶', col, hp: 100000, maxHp: 100000, attack: 0, boss: false }));
  state.enemySkill = { id: 'armor', name: '测试装甲', description: '测试' };
  return state;
}

function adjacentTurn(rule, mutate = () => {}) {
  for (let index = 0; index < 100; index++) {
    const state = fixture([rule.sourceId, rule.targetId, rule.targetId], `commission-${rule.id}-${index}`);
    mutate(state);
    const next = spin(state);
    const sourceIndex = next.board.findIndex(u => u?.uid === 'u1');
    if (adjacentIndexes(sourceIndex).some(i => next.board[i]?.id === rule.targetId)) return { state, next };
  }
  throw new Error('Could not find deterministic adjacent fixture');
}

const ready = state => { while (['recruit', 'item', 'essence'].includes(state.phase)) state = skipReward(state); return state; };

test('ten researched commissions use ten distinct original four-star targets', () => {
  assert.equal(RETIREMENT_RULES.length, 10);
  assert.equal(new Set(RETIREMENT_RULES.map(rule => rule.targetId)).size, 10);
  for (const rule of RETIREMENT_RULES) {
    assert.equal(rule.targetOriginalRarity, 4);
    assert.match(rule.source, /^https:\/\/honkai-star-rail\.fandom\.com\/wiki\//);
    assert.ok(rule.relation.length > 10);
  }
});

test('all ten pairs remove only an adjacent eligible instance before its utility and attack', () => {
  for (const rule of RETIREMENT_RULES) {
    const { state, next } = adjacentTurn(rule);
    const before = structuredClone(state), event = next.lastSpin.effects.find(e => e.type === 'retirement');
    assert.ok(event, rule.name);
    assert.deepEqual(state, before);
    assert.deepEqual(next, spin(state), rule.name);
    assert.equal(next.roster.length, 2, rule.name);
    assert.equal(next.roster.filter(u => u.id === rule.targetId).length, 1, rule.name);
    assert.equal(next.roster.some(u => u.uid === event.targetUid), false, rule.name);
    const targetIndex = next.board.findIndex(u => u?.uid === event.targetUid);
    assert.equal(next.lastSpin.values[targetIndex], 0, rule.name);
    assert.equal(next.lastSpin.hits.some(hit => hit.cell === targetIndex), false, rule.name);
    assert.equal(next.lastSpin.effects.some(e => e.sourceUid === event.targetUid), false, 'retired recipient must not provide an appearance effect');
    assert.equal(next.retirementStats.completed, 1);
    assert.equal(next.retirementStats.permanent, 1);
    assert.equal(next.stats.destroyed, 1);
    assert.equal(next.lastSpin.effects.some(e => e.type === 'growth' && e.sourceUid === 'u1' && e.amount === rule.growth && e.amount > 0), rule.growth > 0, rule.name);
    assert.notEqual(validateSave(next), null, rule.name);
  }
});

test('last ordinary copy, high stars, trained characters and cores are protected', () => {
  const rule = RETIREMENT_RULES[0], state = fixture([rule.sourceId, rule.targetId, rule.targetId]);
  const [source, target] = state.roster;
  const eligible = () => retirementEligibility(state, source, target, { isCore: isArchetypeCore }).eligible;
  assert.equal(eligible(), true);
  target.stars = 2; assert.equal(eligible(), false);
  target.stars = 1; target.growth = 1.01; assert.equal(eligible(), false);
  target.growth = 0; target.temporary = 2; assert.equal(eligible(), false);
  delete target.temporary;
  assert.equal(retirementEligibility(state, source, target, { isCore: () => true }).eligible, false);
  state.roster.pop(); assert.equal(eligible(), false);
  target.commission = rule.id; target.origin = source.uid;
  assert.equal(retirementEligibility(state, source, target, { isCore: () => true }).eligible, true);
  source.temporary = 2; assert.equal(eligible(), false);
});

test('cadence and eight-neighbor adjacency are real gates, not roster-wide removal', () => {
  const rule = RETIREMENT_RULES[0];
  const { next } = adjacentTurn(rule, state => { state.roster[0].ticks = 0; });
  assert.equal(next.retirementStats.completed, 0);
  let checked = false;
  for (let index = 0; index < 100 && !checked; index++) {
    const state = fixture([rule.sourceId, rule.targetId, rule.targetId], `separate-${index}`), result = spin(state);
    const sourceIndex = result.board.findIndex(u => u?.uid === 'u1');
    if (!adjacentIndexes(sourceIndex).some(i => result.board[i]?.id === rule.targetId)) {
      assert.equal(result.retirementStats.completed, 0); checked = true;
    }
  }
  assert.equal(checked, true);
  assert.equal(adjacentIndexes(4).includes(5), false, 'row ends do not wrap');
});

test('commission generation needs a real relationship and cannot multiply supply or free merges', () => {
  const rule = RETIREMENT_RULES[0];
  const absent = fixture([rule.sourceId]); absent.roster[0].ticks = 3;
  assert.equal(spin(absent).roster.some(u => u.commission), false);
  const state = fixture([rule.sourceId, rule.sourceId, rule.targetId]);
  state.roster[0].ticks = 3; state.roster[1].ticks = 3;
  const first = spin(state), trainee = first.roster.find(u => u.commission);
  assert.ok(trainee);
  assert.equal(first.roster.filter(u => u.commission).length, 1, 'all matching hosts share one pending commission cap');
  assert.equal(first.board.some(u => u?.uid === trainee.uid), false, 'new assignments enter the next draw');
  assert.equal(first.retirementStats.supplied, 1);
  first.choices = [rule.targetId]; first.phase = 'recruit'; first.pendingRewards = []; first.pendingFloor = false;
  const recruited = chooseReward(first, 0);
  assert.equal(recruited.roster.filter(u => u.id === rule.targetId && !u.commission).length, 2);
  assert.equal(recruited.stats.merges, 0, 'one assignment plus two ordinary copies cannot merge');
  assert.notEqual(validateSave(recruited), null);
});

test('automatic supply supports repeated completed assignments without erasing the last recruit', () => {
  const rule = RETIREMENT_RULES[0];
  let state = fixture([rule.sourceId, rule.targetId]); state.roster[0].ticks = 0;
  // Long, nonlethal fixture; every action still goes through the real seeded engine.
  state.spinsLeft = 80; state.encounter.deadline = 80;
  for (let index = 0; index < 32; index++) state = ready(spin(state));
  assert.ok(state.retirementStats.supplied >= 3);
  assert.ok(state.retirementStats.completed >= 2);
  assert.equal(state.retirementStats.permanent, 0);
  assert.equal(state.roster.filter(u => u.id === rule.targetId && !u.commission).length, 1);
  assert.ok(state.roster.filter(u => u.commission === rule.id).length <= 1);
  assert.ok(state.roster.find(u => u.id === rule.sourceId).growth >= 0.7);
  assert.notEqual(validateSave(state), null);
});

test('generated and already departed identities never create archetype or resonance membership', () => {
  const rule = RETIREMENT_RULES[0], state = fixture(['1104', '1103', '1106', rule.sourceId]);
  const prior = getArchetypes(state).map(a => ({ id: a.id, count: a.count, active: a.active }));
  const synergies = getSynergies(state).map(s => ({ id: s.id, count: s.count, active: s.active }));
  state.roster.push({ uid: 'u5', id: rule.targetId, stars: 1, growth: 0, ticks: 0, commission: rule.id, origin: 'u4' }); state.uidCounter = 6;
  state.roster[3].ticks = 2;
  state.retirementStats.supplied = 1; state.retirementStats.byRule[rule.id] = { completed: 0, permanent: 0, supplied: 1 };
  assert.deepEqual(getArchetypes(state).map(a => ({ id: a.id, count: a.count, active: a.active })), prior);
  assert.deepEqual(getSynergies(state).map(s => ({ id: s.id, count: s.count, active: s.active })), synergies);
  let next;
  for (let index = 1; index < 100; index++) {
    state.rngState = index;
    next = spin(state);
    if (next.retirementStats.completed) break;
  }
  assert.equal(next.retirementStats.completed, 1);
  assert.equal(next.roster.some(u => u.uid === 'u5'), false);
  assert.deepEqual(getArchetypes(next).map(a => ({ id: a.id, count: a.count, active: a.active })), prior);
});

test('save validation migrates old v2 counters and rejects forged assignment capabilities', () => {
  const state = fixture(['1003', '1001']); delete state.retirementStats;
  assert.deepEqual(validateSave(state).retirementStats, newRetirementStats());
  const bad = structuredClone(state); bad.roster[1].commission = RETIREMENT_RULES[0].id;
  assert.equal(validateSave(bad), null, 'commission needs a legal source marker and counters');
  const counters = structuredClone(state); counters.retirementStats = { ...newRetirementStats(), completed: 2 };
  assert.equal(validateSave(counters), null, 'aggregate counters must reconcile');
  const wrong = structuredClone(state); wrong.retirementStats = newRetirementStats(); wrong.roster[0].commission = RETIREMENT_RULES[0].id; wrong.roster[0].origin = 'u2';
  assert.equal(validateSave(wrong), null, 'assignment marker cannot grant an unrelated character a role');
  const injected = structuredClone(state); injected.retirementStats = { completed: 1, permanent: 0, supplied: 0, byRule: { [RETIREMENT_RULES[0].id]: { completed: 1, permanent: 0, supplied: 0 } } };
  assert.equal(validateSave(injected), null, 'completed generated work cannot exceed generated assignments');
  const inventory = fixture(['1003', '1001', '1001']);
  inventory.roster.slice(1).forEach(u => { u.commission = RETIREMENT_RULES[0].id; u.origin = 'u1'; });
  inventory.retirementStats = { completed: 0, permanent: 0, supplied: 2, byRule: { [RETIREMENT_RULES[0].id]: { completed: 0, permanent: 0, supplied: 2 } } };
  assert.equal(validateSave(inventory), null, 'balanced totals cannot smuggle two pending assignments through the one-person cap');
  inventory.roster.pop(); inventory.retirementStats.supplied = 0; inventory.retirementStats.byRule[RETIREMENT_RULES[0].id].supplied = 0;
  assert.equal(validateSave(inventory), null, 'an existing pending assignment needs an unspent supply record');
});

test('previews reveal cadence, protected targets, relationship and actual eligible instances', () => {
  const state = fixture(['1003', '1001', '1001']);
  const preview = getRetirementPreview(state, { isCore: isArchetypeCore })[0];
  assert.equal(preview.nextAppearance, 1);
  assert.deepEqual(preview.eligibleUids, ['u2', 'u3']);
  assert.match(preview.summary, /永久离队/);
  assert.match(preview.summary, /核心/);
  state.roster.pop(); assert.deepEqual(getRetirementPreview(state)[0].eligibleUids, []);
});
