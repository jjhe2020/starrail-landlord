import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newGame, spin, chooseReward, skipReward, rerollRewards, removeSymbol, continueEndless, purchaseSupply, getSynergies, validateSave, getSaveStatus, nearestEnemy, SAVE_VERSION } from '../src/engine.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';

export function arrive(floor, options = {}) {
  if (floor === 1) return newGame(options);
  const state = newGame(options);
  state.floor = floor - 1;
  state.phase = 'recruit';
  state.choices = ['1002'];
  state.pendingFloor = true;
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  return skipReward(state);
}

function singleUnit(id, extra = {}) {
  const state = newGame({ seed: 'attack-test' });
  state.roster = [{ uid: 'u1', id, stars: 1, growth: 0, ticks: 0, ...extra }];
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `test-${col}`, col, hp: 1000, maxHp: 1000, attack: 0, boss: false, name: '靶子' }));
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '测试' };
  return state;
}
function acceptAllRewards(state) {
  while (['recruit', 'item', 'essence'].includes(state.phase)) state = chooseReward(state, 0);
  return state;
}

test('combat-only new games and action sequences are seeded and immutable', () => {
  const first = newGame({ seed: 'same' });
  const second = newGame({ seed: 'same' });
  assert.equal(first.version, SAVE_VERSION);
  assert.equal(first.mode, 'combat');
  assert.equal(first.difficulty, 10);
  assert.equal('rent' in first, false);
  assert.deepEqual(first, second);
  const snapshot = structuredClone(first);
  const next = spin(first);
  assert.deepEqual(first, snapshot);
  assert.deepEqual(next, spin(second));
  assert.equal(next.phase, 'recruit');
  assert.equal(next.choices.length, 3);
  assert.equal(new Set(next.choices).size, 3);
  assert.equal(next.board.length, 20);
});

test('board samples twenty unique instances without replacement', () => {
  const state = newGame({ seed: 'large' });
  state.roster = Array.from({ length: 35 }, (_, index) => ({ uid: `u${index + 1}`, id: '1002', stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = 36;
  const next = spin(state);
  assert.equal(next.board.filter(Boolean).length, 20);
  assert.equal(new Set(next.board.filter(Boolean).map(u => u.uid)).size, 20);
  assert.equal(next.roster.length, 35);
});

test('single attacks use three times power and their own column', () => {
  const next = spin(singleUnit('1002'));
  const cell = next.board.findIndex(Boolean);
  assert.deepEqual(next.lastSpin.hits, [{ cell, targetCol: cell % 5, amount: characterById('1002').power * 3 }]);
});

test('nearest fallback chooses left on ties and ignores dead enemies', () => {
  assert.equal(nearestEnemy([{ col: 0, hp: 0 }, { col: 1, hp: 10 }, { col: 3, hp: 10 }], 2).col, 1);
  assert.equal(nearestEnemy([], 2), null);
  const state = singleUnit('1002');
  state.enemies = [state.enemies[2]];
  assert.equal(spin(state).lastSpin.hits[0].targetCol, 2);
});

test('blast targets primary for two times and only immediate occupied neighbors', () => {
  const next = spin(singleUnit('1109'));
  const primary = next.board.findIndex(Boolean) % 5;
  assert.equal(next.lastSpin.hits.find(hit => hit.targetCol === primary).amount, characterById('1109').power * 2);
  assert.equal(next.lastSpin.hits.length, primary === 0 || primary === 4 ? 2 : 3);
  for (const hit of next.lastSpin.hits.filter(hit => hit.targetCol !== primary)) {
    assert.equal(Math.abs(hit.targetCol - primary), 1);
    assert.equal(hit.amount, characterById('1109').power);
  }
  const state = singleUnit('1109');
  state.enemies = [state.enemies[0], state.enemies[4]];
  assert.equal(spin(state).lastSpin.hits.length, 1);
});

test('AOE attacks hit each living enemy once at standard power', () => {
  const state = singleUnit('1013');
  state.enemies[1].hp = 0;
  const next = spin(state);
  assert.deepEqual(next.lastSpin.hits.map(h => h.amount), Array(4).fill(characterById('1013').power));
});

test('support heal and overflow shield count actual gains', () => {
  const state = singleUnit('1203');
  state.roster.push({uid:'u2',id:'1207',stars:1,growth:0,ticks:0});state.uidCounter=3;
  state.hp = 98;
  const next = spin(state);
  assert.equal(next.lastSpin.damage, 0);
  assert.equal(next.lastSpin.healing, 2);
  assert.equal(next.lastSpin.shield, 4);
  assert.equal(next.resourceStats.healed, 2);
  assert.equal(next.resourceStats.shieldGained, 4);
  assert.ok(next.lastSpin.effects.some(e=>e.sourceId==='1203'&&e.type==='shield'&&e.amount===3),'three overflow healing becomes shield before the independent one-point medical resonance');
});

test('capped shield grants do not advance essence progress', () => {
  const state = singleUnit('1104');
  state.roster.push({uid:'u2',id:'1102',stars:1,growth:0,ticks:0});state.uidCounter=3;
  state.shield = 199;
  state.essences = [{ id: 'essence_preservation', progress: 28, triggered: false }];
  let next = spin(state);
  assert.equal(next.shield, 200);
  assert.equal(next.lastSpin.shield, 1);
  assert.equal(next.essences[0].progress, 29);
  next = spin(skipReward(next));
  assert.equal(next.lastSpin.shield, 0);
  assert.equal(next.essences[0].progress, 29);
});

test('base armor reduces each hit and an explicit ignore-armor effect bypasses it', () => {
  const armored = singleUnit('1002');
  armored.enemySkill.id = 'armor';
  assert.equal(spin(armored).lastSpin.damage, characterById('1002').power * 3 - 1);
  const bypassed = singleUnit('1002');
  bypassed.items=['punklorde_spirit'];bypassed.round=2;
  bypassed.enemySkill.id = 'armor';
  assert.equal(spin(bypassed).lastSpin.damage, characterById('1002').power * 3);
});

test('nine copies auto merge to three stars while preserving permanent growth', () => {
  let state = newGame();
  state.phase = 'recruit';
  state.choices = ['1002'];
  state.roster = Array.from({ length: 8 }, (_, index) => ({ uid: `u${index + 1}`, id: '1002', stars: 1, growth: 1, ticks: 2 }));
  state.uidCounter = 9;
  state = chooseReward(state, 0);
  assert.equal(state.roster.length, 1);
  assert.equal(state.roster[0].stars, 3);
  assert.equal(state.roster[0].growth, 8);
  assert.equal(state.stats.merges, 4);
});

test('synergies count distinct permanent identities, not copies, stars or reinforcements', () => {
  const state = newGame();
  state.roster = [{ uid: 'u1', id: '1001', stars: 1 }, { uid: 'u2', id: '1001', stars: 3 }, { uid: 'u3', id: '1003', stars: 1, temporary: 3 }];
  assert.equal(getSynergies(state).find(s => s.id === 'astral').count, 1);
  state.roster.push({ uid: 'u4', id: '1002', stars: 1 });
  assert.equal(getSynergies(state).find(s => s.id === 'astral').count, 2);
});

test('floor-end rewards occur recruit then item then essence, and advance exactly once', () => {
  let state = arrive(6, { seed: 'reward-order' });
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  state = spin(state);
  assert.equal(state.phase, 'recruit');
  assert.deepEqual(state.pendingRewards, ['item', 'essence']);
  const coins = state.coins;
  state = skipReward(state);
  assert.equal(state.phase, 'item');
  state = chooseReward(state, 0);
  assert.equal(state.phase, 'essence');
  state = chooseReward(state, 0);
  assert.equal(state.floor, 7);
  assert.equal(state.phase, 'ready');
  assert.equal(state.coins, coins);
  assert.notEqual(validateSave(state), null);
});

test('extra-spin item extends the next encounter without reopening a settled encounter', () => {
  let state = arrive(6);
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  state = skipReward(spin(state));
  state.choices = ['seal_stamp'];
  const settledSpins = state.spinsLeft;
  state = chooseReward(state, 0);
  assert.equal(state.phase, 'essence');
  assert.equal(state.spinsLeft, settledSpins);
  assert.notEqual(validateSave(state), null);
  state = skipReward(state);
  assert.equal(state.floor, 7);
  assert.equal(state.spinsLeft, 7);
});

test('combat clear gives credits and boss is fixed in the center', () => {
  let state = singleUnit('1002');
  state.enemies = [{ ...state.enemies[2], hp: 1 }];
  state = spin(state);
  assert.equal(state.coins, 11);
  assert.equal(state.pendingFloor, true);
  assert.equal(skipReward(state).floor, 2);
  const boss = arrive(3).enemies.find(enemy => enemy.boss);
  assert.equal(boss.col, 2);
});

test('deadline and actual depleted health end a run', () => {
  const state = singleUnit('1002');
  state.spinsLeft = 1;
  assert.equal(spin(state).phase, 'defeat');
  const lethal = singleUnit('1002');
  lethal.hp = 1;
  lethal.enemies.forEach(enemy => { enemy.attack = 10; });
  assert.equal(spin(lethal).phase, 'defeat');
});

test('fatal health loss cannot be resurrected by a same-turn abundance essence', () => {
  const state = singleUnit('1002');
  state.hp = 1;
  state.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  state.enemies.forEach(enemy => { enemy.attack = 10; });
  const next = spin(state);
  assert.equal(next.phase, 'defeat');
  assert.equal(next.hp, 0);
  assert.equal(next.maxHp, 100);
  assert.equal(next.essences[0].triggered, false);
  assert.notEqual(validateSave(next), null);
});

test('rerolls use free charges then eight credits, and track actual use', () => {
  let state = spin(newGame({ seed: 'reroll' }));
  const oldChoices = state.choices;
  state.rerolls = 1;
  state.coins = 20;
  state = rerollRewards(state);
  assert.equal(state.coins, 20);
  assert.equal(state.choices.some(id => oldChoices.includes(id)), false);
  state = rerollRewards(state);
  assert.equal(state.coins, 12);
  assert.equal(state.resourceStats.rerollsUsed, 2);
  assert.equal(state.resourceStats.paidRerolls, 1);
  assert.equal(state.resourceStats.creditsSpent, 8);
});

test('disabled resource actions return the original state without artificial damage penalties', () => {
  const state = newGame({ resourceAccess: { rerolls: false, removals: false, credits: false } });
  state.coins = 100;
  assert.equal(removeSymbol(state, state.roster[0].uid), state);
  assert.equal(purchaseSupply(state, 'overclock'), state);
  const reward = spin(state);
  assert.equal(rerollRewards(reward), reward);
  const free = spin(newGame({ resourceAccess: { credits: false } }));
  assert.notEqual(rerollRewards(free), free);
  free.rerolls = 0;
  free.coins = 100;
  assert.equal(rerollRewards(free), free);
});

test('removal consumes a resource and invalid actions have no side effects', () => {
  const state = newGame();
  const next = removeSymbol(state, state.roster[0].uid);
  assert.equal(next.roster.length, 4);
  assert.equal(next.resourceStats.removalsUsed, 1);
  assert.equal(next.removals, 1);
  assert.equal(chooseReward(state, 0), state);
  assert.equal(skipReward(state), state);
  assert.equal(continueEndless(state), state);
  const recruit = spin(state);
  assert.equal(spin(recruit), recruit);
  assert.equal(chooseReward(recruit, 99), recruit);
});

test('growth stays with the sampled instance and temporary units retire after attacking', () => {
  const growing = singleUnit('1002', {ticks:3});
  growing.roster.push({uid:'u2',id:'1207',stars:1,growth:0,ticks:0});growing.uidCounter=3;
  const growth = spin(growing);
  assert.equal(growth.roster[0].growth, .15);
  assert.equal(growth.board.find(u=>u?.uid==='u1').growth, .15);
  const state = singleUnit('1109', { temporary: 1 });
  state.items.push('insect_web');
  state.hp = 90;
  const next = spin(state);
  assert.equal(next.board.find(Boolean).status, 'expired');
  assert.equal(next.roster.length, 0);
  assert.equal(next.lastSpin.coins, 4);
  assert.equal(next.lastSpin.healing, 2);
  assert.ok(next.lastSpin.damage > 0);
  assert.notEqual(validateSave(next), null);
});

test('essences activate once, while defense experiments retain natural healing and max-health effects', () => {
  let state = singleUnit('1002');
  state.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  state.hp = 50;
  state = spin(state);
  assert.equal(state.essences[0].triggered, true);
  assert.equal(state.maxHp, 120);
  assert.equal(state.hp, 120);
  state = spin(skipReward(state));
  assert.equal(state.maxHp, 120);
  const disabled = newGame({ resourceAccess: { defense: false } });
  disabled.hp = 50;
  disabled.items.push('dimension_dice', 'preservation_wax');
  disabled.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  const next = spin(disabled);
  assert.equal(next.maxHp, 120);
  assert.equal(next.hp, 120);
  assert.ok(next.lastSpin.healing > 0);
  assert.ok(next.lastSpin.shield > 0);
  assert.ok(next.resourceStats.shieldBlocked > 0);
  assert.notEqual(validateSave(next), null);
});

test('supplies have fixed benefits, two purchases per encounter, and no overclock stacking', () => {
  let state = newGame();
  state.coins = 100;
  state.hp = 50;
  const before = structuredClone(state);
  state = purchaseSupply(state, 'repair');
  assert.equal(state.hp, 68);
  assert.equal(state.coins, 88);
  assert.equal(before.hp, 50);
  state = purchaseSupply(state, 'barrier');
  assert.equal(state.shield, 20);
  assert.equal(state.coins, 78);
  assert.equal(state.supplyPurchases, 2);
  assert.equal(state.resourceStats.creditsSpent, 22);
  assert.equal(purchaseSupply(state, 'overclock'), state);
  let boosted = singleUnit('1002');
  boosted.coins = 100;
  boosted = purchaseSupply(boosted, 'overclock');
  assert.equal(purchaseSupply(boosted, 'overclock'), boosted);
  const next = spin(boosted);
  assert.equal(next.lastSpin.damage, Math.round(characterById('1002').power * 3 * 1.2 * 100)/100);
  assert.equal(next.overclockReady, false);
  assert.equal(purchaseSupply(next, 'barrier'), next, 'supplies require ready phase');
});

test('defense and credit masks block only their actual supply actions', () => {
  let state = newGame({ resourceAccess: { defense: false } });
  state.coins = 100;
  state.hp = 50;
  assert.equal(purchaseSupply(state, 'repair'), state);
  assert.equal(purchaseSupply(state, 'barrier'), state);
  assert.notEqual(purchaseSupply(state, 'overclock'), state);
  state = newGame();
  assert.equal(purchaseSupply(state, 'barrier'), state, 'insufficient credits');
  assert.equal(purchaseSupply(state, 'fake'), state);
  assert.equal(purchaseSupply(state, 'constructor'), state);
  assert.equal(purchaseSupply(state, 'toString'), state);
});

test('actual life and shield generation balance remaining resource, use, and shield waste', () => {
  let state = newGame({ seed: 'accounting' });
  state.coins = 100;
  state = purchaseSupply(state, 'barrier');
  state.activeDebuffs = [{ id: 'shield_decay', name: '护盾滞纳金', description: '测试', source: 'difficulty', addedRound: 0 }];
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 1000; enemy.attack = 5; });
  for (let index = 0; index < 3; index++) {
    if (state.phase === 'recruit') state = skipReward(state);
    state = spin(state);
    const stats = state.resourceStats;
    assert.ok(Math.abs(stats.initialHp + stats.healed - state.hp - stats.hpLost) < 1e-8);
    assert.ok(Math.abs(stats.initialShield + stats.shieldGained - state.shield - stats.shieldBlocked - stats.shieldDecayed) < 1e-8);
    assert.notEqual(validateSave(state), null);
  }
  assert.ok(state.resourceStats.shieldDecayed > 0);
  assert.ok(state.resourceStats.shieldBlocked > 0);
});

test('new resource and debuff save fields reject corruption and resume deterministically', () => {
  const original = spin(newGame({ seed: 'save' }));
  const saved = validateSave(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(saved, original);
  assert.deepEqual(chooseReward(saved, 0), chooseReward(original, 0));
  const edits = [
    s => { s.difficulty = 21; }, s => { s.resourceAccess.defense = 'false'; },
    s => { s.resourceStats.hpLost = NaN; }, s => { s.supplyPurchases = 3; },
    s => { s.roster[0].consumptionBonus = 'foo'; }, s => { s.roster[0].status = 'consumed'; },
    s => { s.activeDebuffs = [{ id: 'fake', name: '', description: '', source: 'boss', addedRound: 0 }]; },
    s => { s.bossStage = 4; }, s => { s.mode = 'classic'; },
  ];
  for (const edit of edits) { const value = structuredClone(original); edit(value); assert.equal(validateSave(value), null); }
});

test('authentic version-one combat migrates without rerolling its encounter; classic is explicitly rejected', () => {
  const legacy = JSON.parse(readFileSync(new URL('./fixtures/legacy-combat-v1.json', import.meta.url), 'utf8'));
  const migrated = validateSave(legacy);
  assert.equal(getSaveStatus(legacy), 'migrated');
  assert.equal(migrated.version, 2);
  assert.equal(migrated.difficulty, 10);
  assert.equal(migrated.migratedFromVersion, 1);
  assert.equal(migrated.resourceStats.initialHp, legacy.hp);
  assert.equal(migrated.resourceStats.initialShield, legacy.shield);
  assert.deepEqual(migrated.enemies, legacy.enemies);
  assert.equal(migrated.rngState, legacy.rngState);
  assert.equal('rent' in migrated, false);
  assert.deepEqual(validateSave(migrated), migrated);
  const classic = JSON.parse(readFileSync(new URL('./fixtures/legacy-classic-v1.json', import.meta.url), 'utf8'));
  assert.equal(getSaveStatus(classic), 'legacy-classic');
  assert.equal(validateSave(classic), null);
});

test('all content remains unique', () => {
  for (const list of [CHARACTERS, ITEMS, ESSENCES]) assert.equal(new Set(list.map(c => c.id)).size, list.length);
  assert.equal(characterById(1001).name, '三月七');
});

test('a full combat campaign validates every action and carries its build into endless', () => {
  let state = newGame({ seed: 'campaign', difficulty: 10 });
  state.roster = CHARACTERS.map((c, index) => ({ uid: `u${index + 1}`, id: c.id, stars: 3, growth: 100, ticks: 0 }));
  state.uidCounter = state.roster.length + 1;
  let actions = 0;
  while (!['victory', 'defeat'].includes(state.phase) && actions++ < 300) {
    state = state.phase === 'ready' ? spin(state) : chooseReward(state, 0);
    assert.notEqual(validateSave(state), null, `invalid floor ${state.floor}/${state.phase}`);
  }
  assert.equal(state.phase, 'victory');
  assert.equal(state.floor, 12);
  const next = continueEndless(state);
  assert.equal(next.floor, 13);
  assert.equal(next.difficulty, 10);
  assert.notEqual(validateSave(next), null);
  assert.notEqual(validateSave(spin(next)), null);
});
