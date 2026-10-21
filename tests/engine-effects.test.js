import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, chooseReward, purchaseSupply, rerollRewards, removeSymbol, validateSave } from '../src/engine.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';
import { publicDebuff, enemyDebuffById } from '../src/enemy-effects.js';
import { effectAmount, effectIsEligible, effectTargetIndexes } from '../src/effect-rules.js';

function fixture(ids = ['1002'], extras = {}) {
  const state = newGame({ seed: 'expanded-effects' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target-${col}`, name: 'Test target', col, hp: 10000, maxHp: 10000, attack: 0, boss: false }));
  state.enemySkill = { id: 'pressure', name: 'Test pressure', description: 'Test' };
  state.board = Array(20).fill(null);
  Object.assign(state, extras);
  return state;
}
const powerOf = (state, uid = 'u1') => state.lastSpin.values[state.board.findIndex(u => u?.uid === uid)];
const ready = state => { while (['recruit', 'item', 'essence'].includes(state.phase)) state = skipReward(state); return state; };

test('expanded content executes deterministic immutable turns and saves cleanly', () => {
  for (const character of CHARACTERS.filter(c => c.effects.some(e => !e.legacy))) {
    const state = fixture([character.id]); state.roster[0].ticks = 11; state.hp = 40; state.shield = 25; state.coins = 40;
    const before = structuredClone(state), next = spin(state);
    assert.deepEqual(state, before, character.name);
    assert.deepEqual(next, spin(before), character.name);
    assert.notEqual(validateSave(next), null, character.name);
    assert.ok(Number.isFinite(next.lastSpin.damage), character.name);
  }
});

test('temporary support power is recalculated while permanent growth is stored per instance', () => {
  const state = fixture(['1005', '1004']);
  const first = spin(state), second = spin(ready(first));
  assert.equal(powerOf(first, 'u2'), powerOf(second, 'u2'));
  assert.equal(second.roster[1].growth, 0);
  const growth = fixture(['1207','1002']);growth.roster[0].ticks=1;
  const next = spin(growth);
  assert.equal(next.roster[1].growth, 0.35);
  assert.equal(next.roster[0].growth, 0);
  assert.ok(next.lastSpin.effects.some(e => e.type === 'growth' && e.duration === 'run' && e.targetUid === 'u2'));
});

test('star scaling enlarges numeric healing and shields, not conditional multiplier values', () => {
  const healer = fixture(['1217','1206']); healer.hp = 1; healer.roster[0].stars = 2; healer.roster[0].ticks = 2;
  const healed = spin(healer);
  assert.equal(healed.lastSpin.healing, 12);
  assert.equal(healed.lastSpin.shield, 12);
  const attacker = fixture(['1312']); attacker.roster[0].ticks = 2; attacker.roster[0].stars = 2;
  const next = spin(attacker);
  assert.equal(powerOf(next), characterById('1312').power * 3 * 2);
  assert.equal(next.lastSpin.powerBreakdown.find(Boolean).multiplier, 2);
});

test('appearance effects check sequential conditions after their own earlier healing', () => {
  const below = spin(fixture(['1110','1102'], { hp: 50 }));
  const above = spin(fixture(['1110','1102'], { hp: 59 }));
  assert.equal(below.hp, 53); assert.equal(below.shield, 2);
  assert.equal(above.hp, 62); assert.equal(above.shield, 0);
});

test('growth modifiers change new increments while preserving previous investment', () => {
  const original = fixture(['1002','1207']); original.roster[0].ticks = 3; original.roster[0].growth = 4; original.items = ['impermanence_dice'];
  assert.equal(spin(original).roster[0].growth, 4.18);
  const expanded = fixture(['1207','1002']);expanded.roster[0].ticks=1;expanded.roster[0].growth=4;expanded.roster[1].growth=4; expanded.items = ['impermanence_dice', 'rubert_gear'];
  expanded.activeDebuffs = [publicDebuff(enemyDebuffById('growth_audit'), 'difficulty', 0)];
  assert.ok(Math.abs(spin(expanded).roster[1].growth - 4.315) <= 0.0051, 'new increment uses all three modifiers and rounds once to displayed precision');
});

test('summons join after the board draw and count actual future appearances', () => {
  const state = fixture(['1402']); state.roster[0].ticks = 3;
  const first = spin(state), reinforcement = first.roster.find(u => u.temporary);
  assert.equal(reinforcement.id, '1206'); assert.equal(reinforcement.temporary, 2);
  assert.equal(first.board.some(u => u?.uid === reinforcement.uid), false);
  const second = spin(ready(first));
  assert.equal(second.roster.find(u => u.uid === reinforcement.uid).temporary, 1);
  const third = spin(ready(second));
  assert.equal(third.roster.some(u => u.uid === reinforcement.uid), false);
  assert.ok(third.lastSpin.hits.some(h => third.board[h.cell]?.uid === reinforcement.uid), 'last appearance still attacks');
});

test('declarative consumption requires a real adjacent temporary target before granting power', () => {
  const definition=characterById('1314'), original=definition.effects;
  try {
    definition.effects=[{type:'consume',value:3,summary:'消耗临时角色后获得3本次威力',trigger:'appearance',duration:'spin',target:'adjacent',stacking:'additive',filter:{temporary:true,excludeSelf:true}}];
    const noTarget = spin(fixture(['1314']));
    assert.equal(noTarget.lastSpin.effects.some(e => e.type === 'consume'), false);
    const state = fixture(['1314', ...Array(19).fill('1002')]); state.roster.slice(1).forEach(u => { u.temporary = 2; });
    const next = spin(state), sacrificed = next.board.find(u => u?.status === 'consumed');
    assert.ok(sacrificed);
    assert.equal(next.lastSpin.hits.some(h => next.board[h.cell]?.uid === sacrificed.uid), false);
    assert.equal(next.roster.some(u => u.uid === sacrificed.uid), false);
    assert.ok(next.lastSpin.effects.some(e => e.sourceId === '1314' && e.type === 'power' && e.amount === 3));
  } finally { definition.effects=original; }
});

test('new natural multipliers affect old generation but fixed supplies stay fixed', () => {
  const shielded = fixture(['1104','1102']); shielded.items = ['peace_price'];
  assert.equal(spin(shielded).lastSpin.shield, 4.8);
  shielded.coins = 100;
  assert.equal(purchaseSupply(shielded, 'barrier').shield, 20);
  const healer = fixture(['1105','1102']); healer.hp = 30; healer.items = ['corrupt_fruit'];
  assert.equal(spin(healer).lastSpin.healing, 3);
  healer.coins = 100;
  assert.equal(purchaseSupply(healer, 'repair').hp, 48);
});

test('passive recipient filters affect one-star instances and do not grow every turn', () => {
  const state = fixture(['1002']); state.items = ['compound_eye'];
  const first = spin(state), second = spin(ready(first));
  assert.equal(powerOf(first), 2.4); assert.equal(powerOf(second), 2.4);
  assert.equal(second.roster[0].growth, 0);
  state.roster[0].stars = 2;
  assert.equal(powerOf(spin(state)), 6);
});

test('a temporary unit receives temporary-only bonuses on its final attacking appearance', () => {
  const state = fixture(['1002']); state.roster[0].temporary = 1; state.items = ['elation_wax'];
  const next = spin(state);
  assert.equal(powerOf(next), 2.8);
  assert.equal(next.board.find(Boolean).status, 'expired');
  assert.equal(next.roster.length, 0);
});

test('acquisition hooks are immediate and cannot repeat from saving or opening the game', () => {
  const state = fixture(); state.phase = 'item'; state.choices = ['mystery_box'];
  const next = chooseReward(state, 0);
  assert.equal(next.removals, state.removals + 1); assert.equal(next.coins, state.coins + 8);
  const saved = validateSave(next);
  assert.equal(saved.removals, next.removals); assert.equal(saved.coins, next.coins);
  assert.equal(spin(saved).removals, next.removals);
});

test('cumulative resource essences start at acquisition and count only new use once', () => {
  let state = fixture(); state.phase = 'essence'; state.choices = ['essence_dimensional_dice']; state.resourceStats.rerollsUsed = 20;
  state = chooseReward(state, 0);
  assert.equal(state.essences[0].baseline, 20);
  state = spin(state); assert.equal(state.essences[0].progress, 0);
  state = rerollRewards(state); state = spin(ready(state));
  assert.equal(state.essences[0].progress, 1);
  state = spin(ready(state)); assert.equal(state.essences[0].progress, 1);
  assert.notEqual(validateSave(state), null);
});

test('new essence one-time grants occur at the threshold and passive power starts next turn', () => {
  const data = ESSENCES.find(e => e.id === 'essence_split_coin');
  const state = fixture(); state.items = ['faith_bond']; state.essences = [{ id: data.id, progress: data.target - 3, triggered: false }];
  const first = spin(state);
  assert.equal(first.essences[0].triggered, true);
  assert.equal(first.coins, 15); assert.equal(powerOf(first), 2);
  const second = spin(ready(first));
  assert.equal(second.coins, 18); assert.equal(powerOf(second), 2.25);
});

test('original abundance remains natural healing and preservation excludes between-spin shield purchases', () => {
  const abundance = fixture(); abundance.hp = 10; abundance.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  abundance.activeDebuffs = [publicDebuff(enemyDebuffById('healing_audit'), 'difficulty', 0)];
  const next = spin(abundance);
  assert.equal(next.maxHp, 120); assert.equal(next.hp, 100);
  const preservation = fixture(); preservation.coins = 100; preservation.essences = [{ id: 'essence_preservation', progress: 0, triggered: false }];
  assert.equal(spin(purchaseSupply(preservation, 'barrier')).essences[0].progress, 0);
});

test('recorded power decomposes exactly and old v2 snapshots remain importable', () => {
  const state = fixture(['1008', '1009']); state.hp = 30; state.items = ['gold_coin', 'broken_clock'];
  const next = spin(state);
  assert.equal(next.lastSpin.floor, 1); assert.equal(next.lastSpin.round, 1);
  for (const entry of next.lastSpin.powerBreakdown.filter(Boolean)) {
    const value = ((entry.base + entry.growth + entry.beforeMultiplierBonus) * entry.baseMultiplier + entry.flatBonus) * entry.multiplier;
    assert.ok(Math.abs(value - entry.final) < 0.03);
  }
  assert.notEqual(validateSave(next), null);
  const legacy = structuredClone(next); delete legacy.lastSpin.effects; delete legacy.lastSpin.powerBreakdown; delete legacy.lastSpin.floor; delete legacy.lastSpin.round;
  assert.notEqual(validateSave(legacy), null);
  const corrupt = structuredClone(next); corrupt.lastSpin.effects.push({ sourceId: 'fake', type: 'growth', label: 'fake', duration: 'run', value: 999 });
  assert.equal(validateSave(corrupt), null);
  const altered = structuredClone(next); altered.lastSpin.powerBreakdown.find(Boolean).final = 999;
  assert.equal(validateSave(altered), null);
});

test('presentation snapshots never grant mechanics and cumulative baselines reject impossible counters', () => {
  const state = spin(fixture());
  const forged = structuredClone(state); forged.lastSpin.effects = [{ sourceId: 'fake', type: 'growth', label: 'Display only', duration: 'run', amount: 999 }];
  const resumed = validateSave(forged);
  assert.notEqual(resumed, null);
  assert.deepEqual(spin(ready(resumed)).roster, spin(ready(state)).roster);
  const baseline = fixture(); baseline.essences = [{ id: 'essence_void_wick', progress: 0, triggered: false, baseline: 1 }];
  assert.equal(validateSave(baseline), null);
});

test('shared effect helpers support public expected metrics without accessing hidden RNG', () => {
  const state = fixture();
  const context = { state, trigger: 'spin', metricOverrides: (metric) => metric === 'present' ? 2.5 : undefined };
  assert.equal(effectAmount({ value: 2, per: { metric: 'present' } }, context), 5);
  assert.equal(effectIsEligible({ type: 'power', condition: { metric: 'present', op: 'gte', value: 2 } }, context), true);
  assert.equal(state.rngState, fixture().rngState);
});

test('effect records report the multiplier actually applied after support-source bonuses', () => {
  const state = fixture(['1101', '1102']);state.items=['harmony_wax'];
  let next,event;
  for(let seed=1;seed<=64&&!event;seed++){
    state.rngState=seed;next=spin(state);
    event=next.lastSpin.effects.find(entry=>entry.sourceId==='1101'&&entry.type==='powerMultiplier'&&entry.targetUid==='u2');
  }
  assert.ok(event);
  const breakdown=next.lastSpin.powerBreakdown[next.board.findIndex(u=>u?.uid==='u2')];
  const expected=1+(1.45-1)*1.5;
  assert.equal(event.amount,Math.round(expected*100)/100);
  assert.ok(Math.abs(breakdown.multiplier-expected*1.25)<1e-12,'source amplification multiplies the buff bonus, while the carry keeps its own attack program');
});

test('essence threshold credit rewards do not feed another essence progress in either claim order', () => {
  for (const reverse of [false, true]) {
    const state = fixture();
    state.items = ['faith_bond'];
    state.essences = [{ id: 'essence_split_coin', progress: 21, triggered: false }, { id: 'essence_trap', progress: 0, triggered: false }];
    if (reverse) state.essences.reverse();
    const next = spin(state);
    assert.equal(next.essences.find(entry => entry.id === 'essence_split_coin').triggered, true);
    assert.equal(next.essences.find(entry => entry.id === 'essence_trap').progress, 3, 'only the three spin-earned credits count');
    assert.equal(next.coins - state.coins, 15, 'the threshold reward still reaches the real balance');
    assert.equal(next.stats.coins - state.stats.coins, 15, 'the real reward is counted once in lifetime earnings');
    assert.notEqual(validateSave(next), null);
  }
});

test('same-spin essence healing and shield rewards do not cascade into progress by claim order', () => {
  for (const reverse of [false, true]) {
    const healing = fixture(['1105','1102'], { hp: 30 });
    healing.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }, { id: 'essence_medicine', progress: 0, triggered: false }];
    const shielding = fixture(['1104','1102']);
    shielding.essences = [{ id: 'essence_realm_crown', progress: 32, triggered: false }, { id: 'essence_preservation', progress: 0, triggered: false }];
    if (reverse) { healing.essences.reverse(); shielding.essences.reverse(); }
    const healed = spin(healing), shielded = spin(shielding);
    assert.equal(healed.essences.find(entry => entry.id === 'essence_medicine').progress, 2.5);
    assert.equal(healed.hp, 120, 'the one-time abundant heal is still granted');
    assert.equal(shielded.essences.find(entry => entry.id === 'essence_preservation').progress, 4);
    assert.equal(shielded.shield, 16, 'the one-time twelve shield is still granted');
  }
});

test('an essence progress multiplier unlocked at turn end starts with the next spin for every claim order', () => {
  for (const reverse of [false, true]) {
    const state = fixture(['1001', '1002']);
    state.essences = [{ id: 'essence_jellyfish', progress: 15, triggered: false }, { id: 'essence_destruction', progress: 0, triggered: false }];
    if (reverse) state.essences.reverse();
    const first = spin(state);
    assert.equal(first.essences.find(entry => entry.id === 'essence_jellyfish').triggered, true);
    assert.equal(first.essences.find(entry => entry.id === 'essence_destruction').progress, 1);
    const second = spin(ready(first));
    assert.equal(second.essences.find(entry => entry.id === 'essence_destruction').progress, 2.1);
  }
});

test('power breakdown retains the full composite multiplier for large accumulated growth', () => {
  const state = fixture();
  state.roster[0].growth = 1000;
  state.items = ['hunt_wax', 'broken_clock', 'peace_price'];
  const next = spin(state), part = next.lastSpin.powerBreakdown.find(Boolean);
  assert.ok(Math.abs(part.multiplier - 1.482) < 1e-12);
  const recomputed = Math.round(((part.base + part.growth + part.beforeMultiplierBonus) * part.baseMultiplier + part.flatBonus) * part.multiplier * 100) / 100;
  assert.equal(recomputed, part.final, 'intermediate multiplier display rounding cannot change the recorded construction');
  assert.notEqual(validateSave(next), null);
});
