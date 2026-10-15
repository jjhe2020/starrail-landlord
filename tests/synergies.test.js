import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterById } from '../src/content.js';
import { newGame, spin, skipReward } from '../src/engine.js';
import { SYNERGIES, getSynergiesFor, distinctPresenceProbability, synergyOffenseScale } from '../src/synergies.js';

function fixture(ids, { hp = 45, shield = 100, round = 0, ticks = 0, alive = 5, weak = false, seed = 'resonance-behavior' } = {}) {
  const state = newGame({ seed });
  state.roster = ids.map((entry, i) => ({ uid: `u${i + 1}`, id: typeof entry === 'string' ? entry : entry.id, stars: 1, growth: 0, ticks, ...(typeof entry === 'object' ? entry : {}) }));
  state.uidCounter = ids.length + 1;
  state.hp = hp;
  state.shield = shield;
  state.round = round;
  state.spinsLeft = 6;
  state.encounter.deadline = 8;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `1-${col}`, name: '训练目标', col, hp: col < alive ? weak ? 1 : 100000 : 0, maxHp: weak ? 1 : 100000, attack: 10, boss: false }));
  state.enemySkill = { id: 'pressure', name: '训练', description: '测试' };
  return state;
}

function without(id, operation) {
  const definition = SYNERGIES.find(s => s.id === id), original = definition.tierEffects;
  try { definition.tierEffects = original.map(() => []); return operation(); }
  finally { definition.tierEffects = original; }
}

const observed = state => ({ damage: state.lastSpin.damage, hp: state.hp, shield: state.shield, incoming: state.lastSpin.incoming, coins: state.coins, healing: state.lastSpin.healing, generatedShield: state.resourceStats.shieldGained });
const cases = [
  ['astral', ['1001', '1002', '1109'], {}],
  ['belobog', ['1102', '1103', '1105'], { weak: true }],
  ['station', ['1009', '1013'], { ticks: 2 }],
  ['hunters', ['1005', '1006'], {}],
  ['xianzhou', ['1201', '1202', '1203'], {}],
  ['hunt', ['1002', '1102'], { weak: true }],
  ['destruction', ['1008', '1107'], {}],
  ['erudition', ['1013', '1201'], { alive: 2 }],
  ['nihility', ['1005', '1006'], { round: 1 }],
  ['preservation', ['1001', '1104'], {}],
  ['abundance', ['1105', '1203'], { hp: 10 }],
  ['harmony', ['1101', '1202', '1205'], {}],
  ['ice', ['1001', '1013', '1104'], {}],
  ['lightning', ['1103', '1008', '1202'], {}],
  ['fire', ['1009', '1003', '1109'], {}],
  ['wind', ['1002', '1108', '1205'], { alive: 2 }],
  ['quantum', ['1006', '1102', '1201'], {}],
  ['physical', ['1105', '1107'], { weak: true }],
  ['imaginary', ['1004', '1203'], {}],
  ['remembrance', ['1402', '1407', { id: '1002', temporary: 2 }], {}],
];

for (const [id, ids, options] of cases) test(`${id} resonance changes real spin results and reports its own actual source`, () => {
  let matched = false;
  // Placement is part of the real seeded rule; adjacency effects need a
  // placement that actually satisfies their condition, not a forged board.
  for (let seed = 0; seed < 20 && !matched; seed++) {
    const state = fixture(ids, { ...options, seed: `resonance-${id}-${seed}` });
    const before = structuredClone(state);
    const baseline = without(id, () => spin(state));
    const actual = spin(state);
    assert.deepEqual(state, before);
    const events = (actual.lastSpin.effects || []).filter(e => e.sourceId === id && e.amount > 0);
    if (events.length && JSON.stringify(observed(actual)) !== JSON.stringify(observed(baseline))) matched = true;
  }
  assert.ok(matched, `${id} must produce a real, attributable combat/resource difference`);
});

test('company economy triggers on entering a new encounter and cannot be reclaimed by reading state', () => {
  const state = fixture(['1112', '1304']);
  state.phase = 'recruit';
  state.pendingFloor = true;
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  state.choices = ['1001'];
  const baseline = without('ipc', () => skipReward(state));
  const actual = skipReward(state);
  assert.equal(actual.floor, 2);
  assert.equal(actual.coins - baseline.coins, 5);
  const saved = JSON.stringify(actual);
  getSynergiesFor(actual, characterById);
  getSynergiesFor(actual, characterById);
  assert.equal(JSON.stringify(actual), saved);
});

test('resonance thresholds are reachable in the 64-character pool and describe materially different styles', () => {
  assert.equal(SYNERGIES.length, 21);
  assert.equal(new Set(SYNERGIES.map(s => s.style)).size, 21);
  for (const definition of SYNERGIES) {
    assert.ok(CHARACTERS.filter(c => c[definition.kind] === definition.tag).length >= definition.thresholds.at(-1), definition.id);
    assert.equal(definition.tierEffects.length, definition.thresholds.length);
    for (const effects of definition.tierEffects) for (const effect of effects) {
      assert.ok(effect.summary && effect.trigger && effect.duration && effect.stacking);
    }
  }
});

test('duplicate, starred and temporary copies never add permanent resonance identities', () => {
  const state = fixture(['1001', { id: '1001', stars: 3 }, { id: '1002', temporary: 2 }]);
  const synergy = getSynergiesFor(state, characterById).find(s => s.id === 'astral');
  assert.equal(synergy.count, 1);
  assert.equal(synergy.active, false);
  assert.deepEqual(synergy.effects, []);
  state.roster.push({ uid: 'u4', id: '1002', stars: 1, growth: 0, ticks: 0 });
  assert.equal(getSynergiesFor(state, characterById).find(s => s.id === 'astral').count, 2);
});

function combinations(values, size) {
  if (!size) return [[]];
  return values.flatMap((value, index) => combinations(values.slice(index + 1), size - 1).map(tail => [value, ...tail]));
}

test('distinct same-board probability matches exhaustive without-replacement draws including duplicate identities', () => {
  const identities = ['1001', '1001', '1013', '1104', '1002', '1002', '1105'];
  const state = fixture(identities), draws = combinations(state.roster, 3);
  for (const threshold of [1, 2, 3]) {
    const probability = distinctPresenceProbability(state, { element: '冰', temporary: false }, threshold, characterById, 3);
    const truth = draws.filter(board => new Set(board.filter(u => characterById(u.id).element === '冰').map(u => u.id)).size >= threshold).length / draws.length;
    assert.ok(Math.abs(probability - truth) < 1e-12, `${threshold}: ${probability} vs ${truth}`);
  }
});

test('offense amplifier and tax combine once without affecting resource quantities', () => {
  const state = fixture(['1001', '1002', '1109']);
  assert.equal(synergyOffenseScale(state), 1);
  state.items.push('divination_candle');
  assert.equal(synergyOffenseScale(state), 1.5);
  state.activeDebuffs.push({ id: 'synergy_audit' });
  assert.equal(synergyOffenseScale(state), 1.125);
  const resource = fixture(['1112', '1304']);
  resource.phase = 'recruit'; resource.pendingFloor = true; resource.enemies.forEach(e => { e.hp = 0; }); resource.choices = ['1001'];
  const plain = skipReward(resource);
  resource.items.push('divination_candle');
  const amplified = skipReward(resource);
  assert.equal(amplified.coins, plain.coins);
});
