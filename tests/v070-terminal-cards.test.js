import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTerminalCards } from '../scripts/v070-terminal-cards.mjs';

const cards = [{ id: 'attack', name: '测试攻击', role: 'attack' }, { id: 'defense', name: '测试防御', role: 'defense' }, { id: 'unseen', name: '未持有', role: 'trainer' }];
const row = (id, present, damage = 0, healing = 0, shield = 0, endGrowth = 0, extra = {}) => ({ id, held: 1, present, damage, healing, shield, endGrowth, ...extra });
const run = (seed, strategyId, won, floor, turns, difficulty = 10) => ({ seed, strategyId, won, floor, turns, difficulty, phase: won ? 'victory' : 'defeat', stopped: null });
function fixture() {
  return { gameVersion: 'test', sourceStable: true, sourceHashes: { rules: 'frozen' }, config: { mode: 'campaigns', split: 'holdout', difficulty: 10 }, cards, rows: [
    run('s1', 'p', true, 12, [{ floor: 11, sharedDamage: 0, cards: [row('attack', 1, 999)] }, { floor: 12, sharedDamage: 5000, cards: [row('attack', 1, 10, 0, 0, 2), row('attack', 1, 20, 0, 0, 4, { temporary: 2 }), row('defense', 1, 0, 8, 6, 1)] }, { floor: 12, cards: [row('attack', 0, 0, 0, 0, 2), row('defense', 0, 0, 0, 0, 1)] }]),
    run('s1', 'q', false, 4, [{ floor: 4, cards: [row('attack', 1, 90, 0, 0, 6), row('defense', 0)] }]),
    run('s2', 'p', true, 12, [{ floor: 12, cards: [row('attack', 1, 4, 0, 0, 2), row('defense', 1, 0, 4, 2)] }]),
    run('s2', 'q', false, 8, [{ floor: 8, cards: [row('attack', 0, 0, 0, 0, 1), row('defense', 1, 0, 2, 4, 0, { commission: 'test' })] }]),
  ] };
}
const panel = (result, outcome = 'all', difficulty = 10) => result.difficulties.find(value => value.difficulty === difficulty).outcomes.find(value => value.id === outcome);
const attack = result => panel(result).cards.find(value => value.id === 'attack');

test('actual terminal encounter includes early failed floor and excludes earlier successful floors', () => {
  const result = analyzeTerminalCards([fixture()]), all = panel(result), card = attack(result);
  assert.equal(result.validation.ready, true); assert.deepEqual(all.terminalFloors, { 4: 1, 8: 1, 12: 2 });
  assert.equal(all.campaigns, 4); assert.equal(all.seeds, 2); assert.equal(card.totals.damage, 124);
  assert.equal(card.heldCampaigns, 4); assert.equal(card.appearedCampaigns, 3); assert.equal(card.heldInstanceTurns, 6); assert.equal(card.presentInstanceTurns, 4);
});
test('shared-seed policies aggregate before rate and CI; instances and policies are not independent samples', () => {
  const card = attack(analyzeTerminalCards([fixture()]));
  assert.equal(card.perAppearance.damage.n, 2); assert.equal(card.perAppearance.damage.mean, 22); // (120/3 + 4/1)/2
  assert.equal(card.pooledPerAppearance.damage, 31); // 124/4, deliberately a different estimand
  assert.equal(card.perHeldInstanceTurn.damage.mean, 16); // (120/4 + 4/2)/2
  assert.equal(card.heldSeeds, 2); assert.equal(card.appearedSeeds, 2);
  assert.ok(Math.abs(card.perAppearance.damage.ci[0] - (22 - 12.706204736 * 18)) < .00001);
});
test('victory and defeat are separate observational subsets, preserving unexposed held turns', () => {
  const result = analyzeTerminalCards([fixture()]);
  const won = panel(result, 'victory').cards.find(value => value.id === 'attack'), lost = panel(result, 'defeat').cards.find(value => value.id === 'attack');
  assert.equal(won.perAppearance.damage.mean, 9.5); assert.equal(lost.perAppearance.damage.mean, 90);
  assert.equal(lost.perAppearance.damage.n, 1); assert.deepEqual(lost.perAppearance.damage.ci, [null, null]);
  assert.equal(lost.perHeldInstanceTurn.damage.n, 2); assert.equal(lost.perHeldInstanceTurn.damage.mean, 45);
});
test('temporary and normal recorded instances both count while shared sources stay excluded; support zero damage is valid', () => {
  const result = analyzeTerminalCards([fixture()]), card = attack(result), support = panel(result).cards.find(value => value.id === 'defense');
  assert.equal(card.totals.damage, 124); assert.equal(card.perAppearance.growthLevel.mean, 3); assert.equal(card.perHeldInstanceTurn.growthLevel.mean, 2.5);
  assert.equal(support.perAppearance.damage.mean, 0); assert.equal(support.perAppearance.healing.mean, 5.5); assert.equal(support.perAppearance.shieldGenerated.mean, 4.5);
  assert.match(result.definitions.instances, /temporary/); assert.match(result.definitions.damage, /Shared/);
});
test('unheld/unappeared cards retain null estimates rather than invented zeros', () => {
  const unseen = panel(analyzeTerminalCards([fixture()])).cards.find(value => value.id === 'unseen');
  assert.equal(unseen.heldCampaigns, 0); assert.equal(unseen.presentInstanceTurns, 0); assert.equal(unseen.perAppearance.damage.n, 0); assert.equal(unseen.perAppearance.damage.mean, null);
  assert.deepEqual(unseen.perAppearance.damage.ci, [null, null]); assert.equal(unseen.perCampaignAllSeeds.damage.mean, 0);
});
test('optional final12 retains non-reaching campaigns as zero in all-seed campaign totals', () => {
  const result = analyzeTerminalCards([fixture()], { final12: true }), all = result.difficulties[0].final12Outcomes.find(value => value.id === 'all');
  assert.equal(all.campaigns, 4); assert.equal(all.reachedCampaigns, 2); assert.equal(all.cards[0].perCampaignAllSeeds.damage.mean, 8.5);
});
test('difficulty panels stay separate and invalid mixed-source/duplicate campaigns cannot pass', () => {
  const first = fixture(), second = structuredClone(first); second.config.difficulty = 20; second.rows.forEach(value => { value.difficulty = 20; });
  const result = analyzeTerminalCards([first, second]); assert.deepEqual(result.difficulties.map(value => value.difficulty), [10, 20]); assert.equal(result.validation.ready, true);
  second.sourceHashes.rules = 'different'; assert.equal(analyzeTerminalCards([first, second]).validation.ready, false);
  assert.equal(analyzeTerminalCards([first, first]).validation.ready, false);
});
