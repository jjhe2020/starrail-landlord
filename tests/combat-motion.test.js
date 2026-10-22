import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, inspectSpin } from '../src/engine.js';
import { createCombatPlan, COMBAT_TIMING } from '../src/combat-motion.js';

const unit = (uid, id = '1002') => ({ uid, id, stars: 1, growth: 0, ticks: 0 });
function fixture() {
  const before = newGame({ seed: 'combat-motion-fixture' });
  const after = structuredClone(before);
  after.round = 1;
  after.board = Array(20).fill(null);
  after.board[0] = unit('u1');
  after.board[6] = unit('u2', '1001');
  after.board[12] = unit('u3');
  after.lastSpin = { ...after.lastSpin, floor: 1, round: 1, incoming: 7, damage: 17,
    hits: [{ cell: 0, targetCol: 0, amount: 7 }, { cell: 0, targetCol: 0, amount: 3 }, { cell: 12, targetCol: 4, amount: 7 }],
    effects: [],
  };
  after.resourceStats.shieldBlocked += 5;
  after.resourceStats.hpLost += 2;
  return { before, after };
}

test('each hit survives cell/column aggregation, including killed enemies and duplicate character IDs', () => {
  const { before, after } = fixture();
  after.enemies.forEach(enemy => { enemy.hp = 0; });
  after.lastSpin.incoming = 0;
  after.phase = 'recruit';
  const plan = createCombatPlan(before, after);
  const attacks = plan.timeline.filter(action => action.kind === 'attack');
  assert.equal(attacks.length, 2);
  assert.deepEqual(attacks.map(({ sourceUid, sourceCell, amount, hitCount }) => ({ sourceUid, sourceCell, amount, hitCount })), [
    { sourceUid: 'u1', sourceCell: 0, amount: 10, hitCount: 2 },
    { sourceUid: 'u3', sourceCell: 12, amount: 7, hitCount: 1 },
  ]);
  assert.equal(plan.totals.damage, 17);
  assert.deepEqual(plan.enemies, before.enemies);
  assert.equal(plan.timeline.some(action => action.kind === 'retaliation'), false);
});

test('support effects require actual current positive records and use instance UIDs', () => {
  const { before, after } = fixture();
  const effect = overrides => ({ sourceId: '1001', sourceUid: 'u2', type: 'shield', amount: 3, floor: 1, round: 1, ...overrides });
  after.lastSpin.effects = [
    effect({}), effect({ amount: 2 }), effect({ amount: 0 }),
    effect({ type: 'heal', amount: 0 }), effect({ type: 'powerMultiplier', amount: 1 }),
    effect({ type: 'growth', amount: 1, targetUid: 'u1' }),
    effect({ type: 'growth', amount: 2, targetUid: 'u3' }),
    effect({ type: 'power', amount: 9, round: 0 }),
    effect({ type: 'heal', amount: 7, floor: 2 }),
    effect({ sourceUid: undefined, sourceId: 'relic', type: 'heal', amount: 4 }),
    effect({ type: 'retaliationMultiplier', amount: .8 }),
  ];
  const supports = createCombatPlan(before, after).timeline.filter(action => action.kind === 'support');
  assert.equal(supports.length, 4);
  assert.equal(supports.find(action => action.effect === 'shield').amount, 5);
  const growth = supports.find(action => action.effect === 'growth');
  assert.deepEqual(growth.targetCells, [0, 12]);
  assert.equal(growth.amount, 3);
  assert.equal(growth.sourceCell, 6);
  assert.equal(supports.find(action => action.effect === 'heal').sourceCell, -1);
  assert.equal(supports.find(action => action.effect === 'retaliationMultiplier').amount, .8);
});

test('diagnostic provenance distinguishes global cell-zero damage and real character sources', () => {
  const { before, after } = fixture();
  const plan = createCombatPlan(before, after, { hits: [
    { cell: 0, targetCol: 0, amount: 2, sourceType: 'item', sourceId: 'relic', kind: 'effect' },
    { cell: 0, targetCol: 0, amount: 5, sourceType: 'character', sourceUid: 'u3', sourceId: '1002', kind: 'attack' },
  ] });
  const attacks = plan.timeline.filter(action => action.kind === 'attack');
  assert.equal(attacks[0].sourceCell, -1);
  assert.equal(attacks[1].sourceCell, 12, 'the UID is authoritative when the source cell differs');
  assert.equal(plan.totals.damage, 7);
});

test('retaliation uses resource accounting so shield decay, healing and self damage are not called blocked attacks', () => {
  const { before, after } = fixture();
  before.shield = 100;
  after.shield = 75;
  after.resourceStats.shieldDecayed += 20;
  after.resourceStats.hpLost += 6;
  after.lastSpin.effects = [{ type: 'selfDamage', amount: 6, floor: 1, round: 1 }];
  const plan = createCombatPlan(before, after);
  const retaliation = plan.timeline.find(action => action.kind === 'retaliation');
  assert.equal(retaliation.blocked, 5);
  assert.equal(retaliation.hpLost, 2);
  assert.equal(plan.totals.hpLost, 8);
});

test('presentation is immutable and deterministic, bounded below three seconds with all positive hits retained', () => {
  const { before, after } = fixture();
  after.board = Array.from({ length: 20 }, (_, index) => unit(`u${index + 1}`));
  const hits = Array.from({ length: 1000 }, (_, index) => ({ cell: index % 20, targetCol: Math.floor(index / 20) % 5, amount: .1 }));
  after.lastSpin.hits = hits;
  const originalBefore = structuredClone(before), originalAfter = structuredClone(after);
  const plan = createCombatPlan(before, after);
  assert.deepEqual(plan, createCombatPlan(before, after));
  assert.deepEqual(before, originalBefore);
  assert.deepEqual(after, originalAfter);
  assert.equal(plan.timeline.filter(action => action.kind === 'attack').length, 100);
  assert.equal(plan.totals.damage, 100);
  assert.equal(plan.timeline.filter(action => action.kind === 'attack').reduce((sum, action) => sum + action.hitCount, 0), 1000);
  assert.ok(COMBAT_TIMING.roll > 0);
  assert.ok(plan.duration < 2700);
  assert.ok(Math.max(...plan.timeline.map(action => action.at + COMBAT_TIMING.effect)) <= COMBAT_TIMING.settle);
  assert.ok(COMBAT_TIMING.settle < plan.duration);
});

test('inspectSpin without interventions produces exactly the same gameplay result as spin', () => {
  for (const seed of ['motion-seed-a', 'motion-seed-b', 'motion-seed-c']) {
    const before = newGame({ seed });
    const original = structuredClone(before);
    const inspected = inspectSpin(before);
    assert.deepEqual(inspected.state, spin(before));
    assert.deepEqual(before, original);
    const plan = createCombatPlan(before, inspected.state, inspected);
    assert.equal(plan.totals.damage, inspected.state.lastSpin.damage);
  }
});

test('actual preservation counterattack follows incoming damage and keeps its attacker alive until then', () => {
  const before = newGame({ seed: 'review-preservation' });
  before.roster = ['1001', '1104', '1208', '1002'].map((id, index) => unit(`u${index + 1}`, id));
  before.uidCounter = 5;
  before.shield = 100;
  before.enemies = [{ ...before.enemies.find(enemy => enemy.col === 2), hp: 20, maxHp: 20, attack: 30 }];
  const original = structuredClone(before);
  const inspected = inspectSpin(before);
  assert.deepEqual(inspected.state, spin(before), 'trace instrumentation does not change rules or the result');
  assert.deepEqual(before, original);
  assert.equal(inspected.state.enemies[0].hp, 0, 'the counterattack finishes the last enemy');
  const counterHit = inspected.hits.find(hit => hit.sourceId === 'preservation');
  assert.equal(counterHit.stage, 'afterRetaliation');
  assert.equal(counterHit.attackType, 'environmental', 'blocked-damage reflection retains its environmental identity in animation input');
  assert.equal(counterHit.amount, Math.round((20-inspected.hits.filter(hit=>hit.stage!=='afterRetaliation').reduce((sum,hit)=>sum+hit.amount,0))*100)/100,'counter consumes exactly the HP remaining after all normal attacks, including supports');
  assert.ok(inspected.effects.some(event => event.sourceId === 'preservation' && event.stage === 'beforeAttacks' && event.type === 'shield'));
  assert.ok(inspected.state.lastSpin.effects.every(event => !('stage' in event)), 'save records do not gain transient trace fields');
  const plan = createCombatPlan(before, inspected.state, inspected);
  const counter = plan.timeline.find(action => action.kind === 'attack' && action.sourceId === 'preservation');
  const incoming = plan.timeline.find(action => action.kind === 'retaliation');
  assert.ok(counter.at > incoming.at);
  assert.deepEqual(incoming.targetCols, [2], 'the enemy was alive when it attacked, despite its final HP being zero');
  assert.equal(plan.totals.damage, inspected.state.lastSpin.damage);
  assert.ok(counter.at + 130 + COMBAT_TIMING.effect <= COMBAT_TIMING.settle);
});

test('the same source and target stay separate across normal, follow-up and counterattack phases', () => {
  const { before, after } = fixture();
  const hits = ['attack', 'afterAttacks', 'afterRetaliation'].map((stage, index) => ({
    cell: 0, targetCol: 0, amount: index + 1, sourceUid: 'u1', sourceType: 'character', stage,
  }));
  const effects = [
    { type: 'shield', sourceId: 'xianzhou', amount: 2, floor: 1, round: 1, stage: 'afterAttacks' },
    { type: 'heal', sourceId: 'essence', amount: 3, floor: 1, round: 1, stage: 'afterRetaliation' },
    { type: 'shield', sourceId: 'relic', amount: 8, floor: 1, round: 1, stage: 'arrival' },
  ];
  const plan = createCombatPlan(before, after, { hits, effects });
  const attacks = plan.timeline.filter(action => action.kind === 'attack');
  assert.equal(attacks.length, 3);
  assert.deepEqual(attacks.map(action => action.at), [COMBAT_TIMING.attackStart, COMBAT_TIMING.afterAttacks, COMBAT_TIMING.afterRetaliation]);
  assert.equal(plan.totals.damage, 6);
  const supports = plan.timeline.filter(action => action.kind === 'support');
  assert.deepEqual(supports.map(action => [action.sourceId, action.at]), [['xianzhou', COMBAT_TIMING.afterAttacks], ['essence', COMBAT_TIMING.afterRetaliation]]);
});

test('a front-row follow-up waits for its later normal-attack trigger and distinct events stay separate', () => {
  const before = newGame({ seed: 'v080-motion-event-order' });
  before.roster = [unit('u1', 'hysilens'), unit('u2', '1107')].map(entry => ({ ...entry, attackBonus: 0 }));
  before.uidCounter = 3;
  before.board = Array(20).fill(null);
  before.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `e${col}`, name: '靶标', col, hp: 10000, maxHp: 10000, attack: 0, boss: false }));
  const layoutUids = Array(20).fill(null); layoutUids[0] = 'u1'; layoutUids[15] = 'u2';
  const inspected = inspectSpin(before, { layoutUids });
  const plan = createCombatPlan(before, inspected.state, inspected);
  const trigger = plan.timeline.find(action => action.sourceId === '1107' && action.attackType === 'normal');
  const follow = plan.timeline.find(action => action.sourceId === 'hysilens' && action.attackType === 'followUp');
  assert.ok(trigger && follow);
  assert.ok(follow.eventId > trigger.eventId && follow.at > trigger.at, 'the follow-up animation retains its causal engine order');
  const repeated = createCombatPlan(before, inspected.state, { hits: [
    { ...inspected.hits.find(hit => hit.attackType === 'followUp'), eventId: 8 },
    { ...inspected.hits.find(hit => hit.attackType === 'followUp'), eventId: 9 },
  ] }).timeline.filter(action => action.kind === 'attack');
  assert.equal(repeated.length, 2);
  assert.ok(repeated[1].at > repeated[0].at, 'two distinct follow-up events are not merged by source or target');
});
