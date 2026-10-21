import test from 'node:test';
import assert from 'node:assert/strict';
import { runGrowthCampaign, growthStrategies, probeGrowthRoster, makeGrowthProbe } from '../src/growth-simulation.js';
import { runArchetypeCampaign } from '../src/archetype-simulation.js';
import { newGame } from '../src/engine.js';

test('growth observation preserves legal baseline and focused campaign outcomes', () => {
  for (const strategy of [growthStrategies()[0], growthStrategies()[4]]) {
    const seed = `growth-policy-parity:${strategy.id}`;
    const observed = runGrowthCampaign({ seed, strategy, probeSamples: 1 });
    const original = runArchetypeCampaign({ seed, strategy, strength: 24, probeSamples: 1 });
    for (const key of ['phase', 'floor', 'turns', 'actions', 'stopped', 'finalFormed']) assert.deepEqual(observed[key], original[key], key);
    assert.equal(observed.stopped, null);
  }
});

test('probe clones inputs and zeros only existing growth in its counterfactual', () => {
  const state = newGame({ seed: 'growth-probe-purity' }); state.roster[1].growth = 10;
  const copy = structuredClone(state), full = makeGrowthProbe(state, 0), off = makeGrowthProbe(state, 0, { withoutGrowth: true });
  assert.equal(full.rngState, off.rngState);
  assert.equal(full.roster[1].growth, 10); assert.equal(off.roster[1].growth, 0);
  const result = probeGrowthRoster(state, 3);
  assert.deepEqual(state, copy);
  assert.equal(result.full['1002'].heldTurns, 3);
  assert.equal(result.full['1002'].instanceTurns, 3);
  assert.ok(result.full['1002'].normalDamage > result.noGrowth['1002'].normalDamage);
  assert.equal(result.full['1009'].normalDamage, 0);
});

test('coverage preference stays a legal seeded campaign and validates target', () => {
  const config = { seed: 'growth-coverage', strategy: { id: 'card:1303', kind: 'coverage', targetId: '1303' }, probeSamples: 1 };
  assert.deepEqual(runGrowthCampaign(config), runGrowthCampaign(config));
  assert.throws(() => runGrowthCampaign({ strategy: { kind: 'coverage', targetId: 'invalid' } }), /Unknown target/);
});
