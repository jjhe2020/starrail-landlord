import test from 'node:test';
import assert from 'node:assert/strict';
import { characterById } from '../src/content.js';
import { newGame, spin, inspectSpin, chooseReward } from '../src/engine.js';
import { estimateEffectsForAi, forecastGrowthForAi, recommendRewards, POLICY_VERSION } from '../src/ai.js';
import { estimateRetirementsForAi } from '../src/retirement-ai.js';
import { enemyDebuffById, publicDebuff } from '../src/enemy-effects.js';

const effect = (type, value, extra = {}) => ({ type, value, trigger: 'appearance', duration: 'spin', target: 'self', summary: 'AI behavior fixture', stacking: 'additive', ...extra });
function withKits(specs, run) {
  const originals = specs.map(spec => [characterById(spec.id), structuredClone(characterById(spec.id))]);
  try {
    for (const spec of specs) Object.assign(characterById(spec.id), { kitVersion: 6, role: 'attack', attack: 'single', power: 3, path: '测试命途', element: '测试属性', faction: '测试阵营', effects: [], ...spec });
    return run();
  } finally {
    for (const [definition, original] of originals) { for (const key of Object.keys(definition)) delete definition[key]; Object.assign(definition, original); }
  }
}
function fixture(ids) {
  const state = newGame({ seed: 'v060-ai-observation' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  state.board = Array(20).fill(null); state.hp = 40; state.shield = 0;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target${col}`, name: 'AI fixture', col, hp: 100000, maxHp: 100000, attack: 4, boss: false }));
  return state;
}
const estimate = state => estimateEffectsForAi(state, { horizon: 20, output: 60, threat: 20, active: [] });

test('bound amplifiers and trainers receive no value from an unrelated roster', () => withKits([
  { id: '1009', role: 'amplifier', attack: 'support', effects: [effect('powerMultiplier', 1.8, { target: 'matching', filter: { faction: '测试阵营', role: 'attack' }, scaleWithTraining: true })] },
  { id: '1101', role: 'trainer', attack: 'support', effects: [effect('growth', 0.4, { duration: 'run', target: 'matching', filter: { faction: '测试阵营', roleNot: 'trainer', temporary: false } })] },
  { id: '1002', faction: '其他阵营' }, { id: '1103' },
], () => {
  const unrelated = estimate(fixture(['1009', '1101', '1002']));
  assert.equal(unrelated.powerMultipliers.size, 0);
  assert.equal(unrelated.growthRates.get('u3') || 0, 0);
  assert.equal(unrelated.growthRates.get('u2') || 0, 0, 'a trainer never grows itself');
  const linked = estimate(fixture(['1009', '1101', '1103']));
  assert.equal(linked.powerMultipliers.get('u3'), 1.8);
  assert.ok(linked.growthRates.get('u3') > 0);
  assert.ok(linked.growthRates.get('u1') > 0, 'the same program can train its amplifier');
}));

test('vulnerability evaluates matching attack tags and shapes, including attributed extra attacks', () => withKits([
  { id: '1004', role: 'disruptor', attack: 'support', effects: [effect('vulnerability', 0.25, { target: 'enemies', filter: { faction: '测试阵营', attack: 'single', role: 'attack' }, scaleWithTraining: true })] },
  { id: '1002', effects: [effect('damage', 2, { per: { metric: 'sourcePower' } })] },
  { id: '1103', attack: 'aoe' }, { id: '1102', faction: '其他阵营' },
], () => {
  const linked = estimate(fixture(['1004', '1002', '1103', '1102']));
  const bare = estimate(fixture(['1002', '1103', '1102']));
  assert.equal(linked.vulnerabilityMultipliers.get('u2'), 1.25);
  assert.equal(linked.vulnerabilityMultipliers.has('u3'), false);
  assert.equal(linked.vulnerabilityMultipliers.has('u4'), false);
  assert.equal(linked.damage, bare.damage * 1.25);
  assert.equal(estimate(fixture(['1004'])).vulnerabilityMultipliers.size, 0);
}));

test('tag-scaled defense and its training are valued through the shared role effect formula', () => withKits([
  { id: '1001', role: 'defense', attack: 'support', effects: [effect('shield', 5, { per: { metric: 'neighbors', filter: { faction: '测试阵营', excludeSelf: true }, cap: 3 }, scaleWithTraining: true })] },
  { id: '1101', role: 'trainer', attack: 'support', effects: [effect('growth', 0.4, { target: 'matching', duration: 'run', filter: { faction: '测试阵营', roleNot: 'trainer', temporary: false } })] },
  { id: '1002' }, { id: '1103', faction: '其他阵营' },
], () => {
  assert.equal(estimate(fixture(['1001', '1103'])).shields, 0);
  const plain = fixture(['1001', '1002']);
  const trained = structuredClone(plain); trained.roster[0].growth = 10;
  assert.ok(Math.abs(estimate(trained).shields / estimate(plain).shields - 1.8) < 1e-12);
  assert.ok(estimate(fixture(['1001', '1101', '1002'])).utilityGrowth > 0, 'future defense training has real support value');
  const capped = structuredClone(trained); capped.roster[0].growth = 12;
  const enormous = structuredClone(trained); enormous.roster[0].growth = 1000;
  assert.equal(estimate(capped).shields, estimate(enormous).shields);
}));

test('modern cards cannot inherit historical Dan Heng growth or Blade self damage', () => withKits([
  { id: '1002' }, { id: '1205' }, { id: '1009', role: 'trainer', attack: 'support' },
], () => {
  const state = fixture(['1002', '1205', '1009']);
  assert.equal(forecastGrowthForAi(state, { ...state.roster[0], ticks: 2 }, { horizon: 24, draw: 1 }), 0);
  assert.equal(forecastGrowthForAi(state, state.roster[1], { horizon: 24, draw: 1 }), 0);
  assert.equal(forecastGrowthForAi(state, state.roster[2], { horizon: 24, draw: 1, declaredRate: 5 }), 0);
  assert.equal(estimate(state).selfDrain, 0);
}));

test('amplifier and vulnerability caps stay independent of an attacker own multiplier', () => withKits([
  { id: '1009', role: 'amplifier', attack: 'support', effects: [effect('powerMultiplier', 1.8, { target: 'matching', filter: { role: 'attack', faction: '测试阵营' } })] },
  { id: '1004', role: 'disruptor', attack: 'support', effects: [effect('vulnerability', 0.5, { target: 'enemies', filter: { role: 'attack', faction: '测试阵营' } }), effect('retaliationMultiplier', 0.1)] },
  { id: '1002', effects: [effect('powerMultiplier', 1.5)] },
], () => {
  const result = estimate(fixture(['1002', '1009', '1009', '1009', '1004', '1004', '1004']));
  assert.ok(Math.abs(result.powerMultipliers.get('u1') - 2.2 * 1.5) < 1e-12);
  assert.equal(result.vulnerabilityMultipliers.get('u1'), 1.75);
  assert.equal(result.reduction, 12, 'retaliation cannot fall below 40 percent');
}));

test('bound assistance changes real engine output and AI advice without reading hidden draws', () => withKits([
  { id: '1009', role: 'amplifier', attack: 'support', effects: [effect('powerMultiplier', 1.8, { target: 'matching', filter: { role: 'attack', faction: '测试阵营' }, scaleWithTraining: true })] },
  { id: '1002' }, { id: '1103', faction: '其他阵营' },
], () => {
  const plain = fixture(['1002']); const linked = fixture(['1002', '1009']);
  const unrelated = fixture(['1103', '1009']);
  assert.equal(spin(linked).lastSpin.damage, spin(plain).lastSpin.damage * 1.8);
  assert.equal(spin(unrelated).lastSpin.damage, spin(fixture(['1103'])).lastSpin.damage);
  linked.phase = 'recruit'; linked.choices = ['1002', '1103'];
  const before = structuredClone(linked);
  const advice = recommendRewards(linked, { lookahead: false });
  assert.equal(advice.policyVersion, POLICY_VERSION);
  const hidden = structuredClone(linked); hidden.seed = 'other'; hidden.rngState = 987654; hidden.board = hidden.roster;
  hidden.lastSpin.damage = 1e8;
  assert.deepEqual(recommendRewards(hidden, { lookahead: false }), advice);
  assert.deepEqual(linked, before);
}));

test('a utility commission host gains training value without imaginary attack additions', () => withKits([
  { id: '1104', role: 'defense', attack: 'support', effects: [effect('shield', 5, { scaleWithTraining: true })] },
  { id: '1103' },
], () => {
  const state = fixture(['1104', '1103', '1103']); state.roster[0].ticks = 2;
  const forecast = estimateRetirementsForAi(state, { horizon: 20 });
  assert.ok(forecast.growthRates.get('u1') > 0);
  assert.equal(forecast.powerAdds.has('u1'), false);
  assert.ok(estimate(state).utilityGrowth > 0);
}));

test('limited neighbor training cannot count every candidate in a large matching team', () => withKits([
  { id: '1101', role: 'trainer', attack: 'support', effects: [effect('growth', 0.4, { target: 'adjacent', targetLimit: 2, duration: 'run', filter: { faction: '测试阵营', roleNot: 'trainer', excludeSelf: true } })] },
  { id: '1002' },
], () => {
  const result = estimate(fixture(['1101', ...Array(19).fill('1002')]));
  const totalTraining = [...result.growthRates.values()].reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(totalTraining - 0.8) < 1e-12);
  assert.equal(result.growthRates.has('u1'), false);
}));

test('tag utility passives do not leak to unrelated defenders and reduction caps compose in engine order', () => withKits([
  { id: '1101', role: 'amplifier', attack: 'support', effects: [effect('shieldMultiplier', 1.5, { trigger: 'passive', target: 'matching', filter: { faction: '测试阵营', role: 'defense' } }), effect('retaliationFlat', 100), effect('retaliationMultiplier', 0.1)] },
  { id: '1001', role: 'defense', attack: 'support', effects: [effect('shield', 5)] },
  { id: '1104', role: 'defense', attack: 'support', faction: '其他阵营', effects: [effect('shield', 5)] },
], () => {
  const result = estimate(fixture(['1101', '1001', '1104']));
  assert.equal(result.shieldMultiplier, 1);
  assert.equal(result.shieldSourceMultipliers.get('u2'), 1.5);
  assert.equal(result.shieldSourceMultipliers.has('u3'), false);
  assert.equal(result.shields, 12.5);
  assert.ok(Math.abs(result.reduction - (9 + 11 * 0.6)) < 1e-12);
}));


test('AI shares encounter clause scaling and resolves extra attacks after later amplifier sources', () => withKits([
  { id: '1101', role: 'amplifier', path: '同谐', attack: 'support', effects: [effect('powerMultiplier', 1.4, { target: 'matching', filter: { role: 'attack', faction: '测试阵营' }, scaleWithTraining: true })] },
  { id: '1002', effects: [effect('damage', 0.5, { per: { metric: 'sourcePower' }, stage: 'afterAttacks' })] },
], () => {
  for (const clauses of [[], ['path_harmony', 'adjacency_audit', 'summon_audit']]) {
    const state = fixture(['1002', '1101']); state.roster[1].growth = 5;
    state.items = ['harmony_wax', 'triangle_instrument'];
    state.activeDebuffs = clauses.map(id => publicDebuff(enemyDebuffById(id), 'boss', 0));
    const result = estimate(state), actual = spin(state);
    const multiplier = result.powerMultipliers.get('u1');
    assert.ok(multiplier > 1 && multiplier <= 2.2);
    const hit = actual.lastSpin.hits[0];
    assert.ok(Math.abs(hit.amount - Math.round(3 * multiplier * 100) / 100 * 3) < 1e-9);
    assert.equal(actual.lastSpin.hits.at(-1).amount, Math.round(result.damage * 100) / 100);
  }
}));

test('a Dan Heng specific clause scales only newly declared self training and keeps accumulated growth', () => withKits([
  { id: '1002', effects: [effect('growth', 0.4, { duration: 'run' })] },
], () => {
  const state = fixture(['1002']); state.roster[0].growth = 3;
  const penalized = structuredClone(state); penalized.activeDebuffs = [publicDebuff(enemyDebuffById('danheng_audit'), 'boss', 0)];
  assert.equal(estimate(state).growthRates.get('u1'), 0.4);
  assert.equal(estimate(penalized).growthRates.get('u1'), 0.2);
  assert.equal(spin(state).roster[0].growth, 3.4);
  assert.equal(spin(penalized).roster[0].growth, 3.2);
}));


test('merging a bound trainer raises per-source training gently and the AI applies the same audited star factors', () => {
  const plain = fixture(['1207', '1206']); plain.roster[0].ticks = 1;
  const tierTwo = fixture(['1207', '1207', '1206']); tierTwo.roster.slice(0, 2).forEach(unit => { unit.ticks = 1; });
  tierTwo.phase = 'recruit'; tierTwo.choices = ['1207'];
  const mergedTwo = chooseReward(tierTwo, 0);
  const second = mergedTwo.roster.find(unit => unit.id === '1207');
  assert.equal(second.stars, 2);
  const tierThree = fixture(['1207', '1207', '1207', '1207', '1206']);
  tierThree.roster.slice(0, 4).forEach((unit, index) => { unit.stars = index < 2 ? 2 : 1; unit.ticks = 1; });
  tierThree.phase = 'recruit'; tierThree.choices = ['1207'];
  const mergedThree = chooseReward(tierThree, 0);
  assert.equal(mergedThree.roster.find(unit => unit.id === '1207').stars, 3);
  const trainingRate = state => estimate(state).growthRates.get(state.roster.find(unit => unit.id === '1206').uid);
  assert.ok(Math.abs(trainingRate(mergedTwo) / trainingRate(plain) - 1.5) < 1e-12);
  assert.ok(Math.abs(trainingRate(mergedThree) / trainingRate(plain) - 2) < 1e-12);
  const actualGrowth = state => inspectSpin(state, { layoutUids: [state.roster[0].uid, state.roster[1].uid, ...Array(18).fill(null)] }).state.roster.find(unit => unit.id === '1206').growth;
  assert.equal(actualGrowth(plain), 0.35);
  assert.ok(Math.abs(actualGrowth(mergedTwo) - 0.525) <= 0.0051, 'display rounding is applied after the gentle training factor');
  assert.equal(actualGrowth(mergedThree), 0.7);
  const audited = structuredClone(mergedThree); audited.activeDebuffs = [publicDebuff(enemyDebuffById('star_audit'), 'boss', 0)];
  assert.ok(Math.abs(trainingRate(audited) / trainingRate(mergedThree) - 0.8) < 1e-12);
  assert.equal(actualGrowth(audited), 0.56);
});
