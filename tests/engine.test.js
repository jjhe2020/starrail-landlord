import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, chooseReward, skipReward, rerollRewards, removeSymbol, continueEndless, getSynergies, validateSave, nearestEnemy } from '../src/engine.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';

function singleUnit(id, extra = {}) {
  const state = newGame({ seed: 'attack-test' });
  state.roster = [{ uid: 'u1', id, stars: 1, growth: 0, ticks: 0, ...extra }];
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `test-${col}`, col, hp: 1000, maxHp: 1000, attack: 0, boss: col === 2, name: '靶子' }));
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '测试' };
  return state;
}

function acceptAllRewards(state) {
  while (['recruit', 'item', 'essence'].includes(state.phase)) state = chooseReward(state, 0);
  return state;
}

function playDraft(state) {
  let actions = 0;
  while (!['victory', 'defeat'].includes(state.phase) && actions++ < 600) {
    if (state.phase === 'ready') { state = spin(state); }
    else {
      let choice = 0;
      if (state.phase === 'recruit') {
        const scores = state.choices.map(id => {
          const c = characterById(id);
          const same = state.roster.filter(u => u.id === id && u.stars === 1 && !u.temporary).length;
          const unique = new Set(state.roster.filter(u => !u.temporary).map(u => u.id));
          const supports = state.roster.filter(u => characterById(u.id).attack === 'support').length;
          return c.power * 2 + (same === 2 ? 8 : same === 1 ? 3 : 0) + (unique.has(id) ? 0 : 1) + (c.attack === 'support' ? (supports < 3 ? 0 : -5) : 2);
        });
        choice = scores.indexOf(Math.max(...scores));
      }
      state = chooseReward(state, choice);
    }
    assert.notEqual(validateSave(state), null, `save invalid at floor ${state.floor}/${state.phase}`);
  }
  assert.ok(actions < 600, 'run must terminate without a phase loop');
  return state;
}

test('new games and action sequences are deterministic and immutable', () => {
  const first = newGame({ seed: 'same', mode: 'classic' });
  const second = newGame({ seed: 'same', mode: 'classic' });
  assert.deepEqual(first, second);
  const snapshot = structuredClone(first);
  const next = spin(first);
  assert.deepEqual(first, snapshot);
  assert.deepEqual(next, spin(second));
  assert.equal(next.phase, 'recruit');
  assert.equal(next.choices.length, 3);
  assert.equal(new Set(next.choices).size, 3);
  assert.equal(next.board.length, 20);
  assert.equal(new Set(next.board.filter(Boolean).map(u => u.uid)).size, first.roster.length);
});

test('board samples twenty unique instances without replacement from a larger roster', () => {
  const state = newGame({ seed: 'large' });
  state.roster = Array.from({ length: 35 }, (_, index) => ({ uid: `u${index + 1}`, id: '1002', stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = 36;
  const next = spin(state);
  assert.equal(next.board.filter(Boolean).length, 20);
  assert.equal(new Set(next.board.filter(Boolean).map(u => u.uid)).size, 20);
  assert.equal(next.roster.length, 35);
});

test('single attacks use three times power and select their own column', () => {
  const next = spin(singleUnit('1002'));
  const cell = next.board.findIndex(Boolean);
  assert.deepEqual(next.lastSpin.hits, [{ cell, targetCol: cell % 5, amount: 3 }]);
  assert.equal(next.lastSpin.damage, 3);
});

test('nearest column fallback resolves equal distances to the left', () => {
  const enemies = [{ col: 0, hp: 0 }, { col: 1, hp: 10 }, { col: 3, hp: 10 }];
  assert.equal(nearestEnemy(enemies, 2).col, 1);
  assert.equal(nearestEnemy(enemies, 4).col, 3);
  assert.equal(nearestEnemy([], 2), null);
  const state = singleUnit('1002');
  state.enemies = [state.enemies[2]];
  const next = spin(state);
  assert.equal(next.lastSpin.hits[0].targetCol, 2);
});

test('blast attacks hit primary for two times and only immediate neighboring columns', () => {
  const next = spin(singleUnit('1109'));
  const cell = next.board.findIndex(Boolean);
  const primary = cell % 5;
  assert.equal(next.lastSpin.hits.find(hit => hit.targetCol === primary).amount, 2);
  assert.equal(next.lastSpin.hits.length, primary === 0 || primary === 4 ? 2 : 3);
  for (const hit of next.lastSpin.hits.filter(hit => hit.targetCol !== primary)) {
    assert.equal(Math.abs(hit.targetCol - primary), 1);
    assert.equal(hit.amount, 1);
  }
  const state = singleUnit('1109');
  state.enemies = [state.enemies[0], state.enemies[4]];
  const sparse = spin(state);
  assert.equal(sparse.lastSpin.hits.length, 1, 'blast does not jump over empty adjacent columns');
});

test('AOE attacks hit each living enemy exactly once with standard power', () => {
  const state = singleUnit('1013');
  state.enemies[1].hp = 0;
  const next = spin(state);
  assert.equal(next.lastSpin.hits.length, 4);
  assert.deepEqual(next.lastSpin.hits.map(h => h.amount), [1, 1, 1, 1]);
});

test('supports provide healing and shield instead of direct damage', () => {
  const state = singleUnit('1203');
  state.hp = 98;
  const next = spin(state);
  assert.equal(next.lastSpin.damage, 0);
  assert.equal(next.lastSpin.healing, 2);
  assert.equal(next.lastSpin.shield, 4);
});

test('shield cap counts only actual gained shield toward summaries and essence progress', () => {
  const state = singleUnit('1001');
  state.shield = 199;
  state.essences = [{ id: 'essence_preservation', progress: 28, triggered: false }];
  let next = spin(state);
  assert.equal(next.shield, 200);
  assert.equal(next.lastSpin.shield, 1);
  assert.equal(next.essences[0].progress, 29);
  assert.equal(next.essences[0].triggered, false);
  next = spin(skipReward(next));
  assert.equal(next.lastSpin.shield, 0);
  assert.equal(next.essences[0].progress, 29);
  assert.equal(next.essences[0].triggered, false);
});

test('armor reduces each hit, and Silver Wolf bypasses it', () => {
  const armored = singleUnit('1002');
  armored.enemySkill.id = 'armor';
  assert.equal(spin(armored).lastSpin.damage, 2);
  const bypassed = singleUnit('1006');
  bypassed.enemySkill.id = 'armor';
  assert.equal(spin(bypassed).lastSpin.damage, 12);
});

test('three copies auto merge and growth survives; nine copies produce a three-star unit', () => {
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

test('synergies count unique permanent identities rather than duplicates or star levels', () => {
  const state = newGame();
  state.roster = [
    { uid: 'u1', id: '1001', stars: 1 }, { uid: 'u2', id: '1001', stars: 3 },
    { uid: 'u3', id: '1003', stars: 1, temporary: 3 },
  ];
  assert.equal(getSynergies(state).find(s => s.id === 'astral').count, 1);
  state.roster.push({ uid: 'u4', id: '1002', stars: 1 });
  assert.equal(getSynergies(state).find(s => s.id === 'astral').count, 2);
  assert.equal(getSynergies(state).find(s => s.id === 'astral').active, true);
});

test('classic rent is deducted once and floor-end rewards occur recruit → item → essence', () => {
  let state = newGame({ mode: 'classic', seed: 'reward-order' });
  state.floor = 6;
  state.spinsLeft = 1;
  state.rent = 1;
  state.coins = 100;
  state = spin(state);
  const coins = state.coins;
  assert.equal(state.phase, 'recruit');
  assert.deepEqual(state.pendingRewards, ['item', 'essence']);
  assert.equal(state.floor, 6);
  state = skipReward(state);
  assert.equal(state.phase, 'item');
  state = chooseReward(state, 0);
  assert.equal(state.phase, 'essence');
  state = chooseReward(state, 0);
  assert.equal(state.phase, 'ready');
  assert.equal(state.floor, 7);
  assert.equal(state.coins, coins);
  assert.equal(state.items.length, 1);
  assert.equal(state.essences.length, 1);
});

test('extra-spin item extends the next floor rather than reopening a settled rent floor', () => {
  let state = newGame({ mode: 'classic' });
  state.floor = 6;
  state.spinsLeft = 1;
  state.coins = 1000;
  state = skipReward(spin(state));
  assert.equal(state.phase, 'item');
  state.choices = ['seal_stamp'];
  state = chooseReward(state, 0);
  assert.equal(state.phase, 'essence');
  assert.equal(state.spinsLeft, 0);
  assert.notEqual(validateSave(state), null);
  state = skipReward(state);
  assert.equal(state.floor, 7);
  assert.equal(state.spinsLeft, 7);
  assert.equal(state.encounter.deadline, 7);
  assert.notEqual(validateSave(state), null);
});

test('combat floor clear gives bounty, defers advancing until rewards and fixes boss in center', () => {
  let state = singleUnit('1002');
  state.enemies = [{ ...state.enemies[2], hp: 1 }];
  state = spin(state);
  assert.equal(state.phase, 'recruit');
  assert.equal(state.pendingFloor, true);
  assert.equal(state.coins, 11);
  state = skipReward(state);
  assert.equal(state.floor, 2);
  assert.equal(state.phase, 'ready');
  state.floor = 2;
  state.enemies.forEach(e => { e.hp = 0; });
  state.phase = 'ready';
  state = spin(state);
  state = acceptAllRewards(state);
  const boss = state.enemies.find(e => e.boss);
  assert.equal(state.floor, 3);
  assert.equal(boss.col, 2);
});

test('classic insufficient rent and combat deadline both end the run', () => {
  const classic = newGame({ mode: 'classic' });
  classic.spinsLeft = 1;
  classic.rent = 10000;
  assert.equal(spin(classic).phase, 'defeat');
  const combat = singleUnit('1002');
  combat.spinsLeft = 1;
  assert.equal(spin(combat).phase, 'defeat');
});

test('rerolls spend free charges first, then eight coins, and alternatives remain distinct', () => {
  let state = spin(newGame({ seed: 'reroll' }));
  const prior = state.choices;
  state.rerolls = 1;
  state.coins = 20;
  state = rerollRewards(state);
  assert.equal(state.rerolls, 0);
  assert.equal(state.coins, 20);
  assert.equal(state.choices.some(id => prior.includes(id)), false);
  state = rerollRewards(state);
  assert.equal(state.coins, 12);
  state.coins = 0;
  assert.equal(rerollRewards(state), state);
});

test('removal consumes a charge and unsupported actions have no side effects', () => {
  const state = newGame();
  const next = removeSymbol(state, state.roster[0].uid);
  assert.equal(next.roster.length, 4);
  assert.equal(next.removals, 1);
  assert.equal(next.board.filter(Boolean).length, 4);
  assert.equal(chooseReward(state, 0), state);
  assert.equal(skipReward(state), state);
  assert.equal(continueEndless(state), state);
  const recruit = spin(state);
  assert.equal(spin(recruit), recruit);
  assert.equal(chooseReward(recruit, -1), recruit);
  assert.equal(chooseReward(recruit, 99), recruit);
});

test('per-instance growth stays synchronized with the sampled board', () => {
  let state = singleUnit('1002', { ticks: 2 });
  state = spin(state);
  assert.equal(state.roster[0].growth, 1);
  assert.equal(state.board.find(Boolean).growth, 1);
  assert.equal(state.lastSpin.damage, 6);
});

test('temporary reinforcements expire after three appearances and trigger retirement items', () => {
  const state = singleUnit('1109', { temporary: 1 });
  state.items.push('insect_web');
  state.hp = 90;
  const next = spin(state);
  assert.equal(next.board.find(Boolean).status, 'expired');
  assert.equal(next.roster.length, 0);
  assert.equal(next.stats.destroyed, 1);
  assert.equal(next.lastSpin.coins, 4);
  assert.equal(next.lastSpin.healing, 2);
  assert.equal(next.lastSpin.damage > 0, true);
  assert.notEqual(validateSave(next), null);
});

test('consumption prevents a temporary unit from attacking or being consumed twice', () => {
  // A full board ensures at least one adjacent temporary reinforcement for each Hook.
  const state = singleUnit('1109');
  state.roster = Array.from({ length: 20 }, (_, index) => ({ uid: `u${index + 1}`, id: '1109', stars: 1, growth: 0, ticks: 0, ...(index % 2 ? { temporary: 3 } : {}) }));
  state.uidCounter = 21;
  const next = spin(state);
  const consumed = next.board.filter(u => u?.status === 'consumed');
  assert.ok(consumed.length > 0);
  assert.equal(new Set(consumed.map(u => u.uid)).size, consumed.length);
  next.board.forEach((u, i) => { if (u?.status === 'consumed') assert.equal(next.lastSpin.values[i], 0); });
});

test('essences progress after acquisition, activate once, and stay bounded', () => {
  let state = singleUnit('1002');
  state.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  state.hp = 50;
  state = spin(state);
  assert.equal(state.essences[0].triggered, true);
  assert.equal(state.essences[0].progress, 6);
  assert.equal(state.maxHp, 120);
  assert.equal(state.hp, 120);
  state = skipReward(state);
  state = spin(state);
  assert.equal(state.maxHp, 120);
});

test('all content IDs are unique and every rarity and effect has sufficient content', () => {
  assert.ok(CHARACTERS.length >= 24);
  assert.ok(ITEMS.length >= 16);
  assert.ok(ESSENCES.length >= 8);
  for (const content of [CHARACTERS, ITEMS, ESSENCES]) assert.equal(new Set(content.map(c => c.id)).size, content.length);
  assert.equal(characterById(1001).name, '三月七');
});

test('valid save resumes deterministically and rejects malformed or impossible fields', () => {
  const original = spin(newGame({ mode: 'classic', seed: 'save' }));
  const saved = validateSave(JSON.parse(JSON.stringify(original)));
  assert.notEqual(saved, original);
  assert.deepEqual(saved, original);
  assert.deepEqual(chooseReward(saved, 0), chooseReward(original, 0));
  const invalids = [
    null, {}, { ...original, version: 99 }, { ...original, rngState: 0 },
    { ...original, hp: Infinity }, { ...original, hp: original.maxHp + 1 },
    { ...original, board: [] }, { ...original, roster: [{ ...original.roster[0], id: 'missing' }] },
    { ...original, roster: [...original.roster, original.roster[0]] },
    { ...original, choices: ['missing'] }, { ...original, items: ['fake'] },
    { ...original, essences: [{ id: 'essence_elation', progress: 101, triggered: false }] },
  ];
  for (const invalid of invalids) assert.equal(validateSave(invalid), null);
});

test('save validation rejects transient-field injection and impossible phase transitions', () => {
  const base = newGame({ seed: 'adversarial' });
  const corruptions = [
    s => { s.roster[0].consumptionBonus = 'foo'; },
    s => { s.roster[0].consumptionBonus = 100; },
    s => { s.roster[0].status = 'consumed'; },
    s => { s.roster[0].temporary = 0; },
    s => { s.board.find(Boolean).consumptionBonus = 'foo'; },
    s => { s.board.find(Boolean).status = 'expired'; },
    s => { s.spinsLeft = 0; },
    s => { s.pendingFloor = true; },
    s => { s.phase = 'victory'; },
    s => { s.floor = 13; },
    s => { s.endless = true; },
    s => { s.enemies[1].id = s.enemies[0].id; },
    s => { s.enemies.forEach(e => { e.hp = 0; }); },
  ];
  for (const corrupt of corruptions) {
    const state = structuredClone(base);
    corrupt(state);
    assert.equal(validateSave(state), null);
  }
  const wrongMode = newGame({ mode: 'classic' });
  wrongMode.enemies = base.enemies;
  assert.equal(validateSave(wrongMode), null);

  for (const floor of [2, 3]) {
    let state = newGame({ mode: 'classic', seed: 'owned-reward' });
    state.floor = floor;
    state.spinsLeft = 1;
    state.coins = 1000;
    state = skipReward(spin(state));
    assert.notEqual(validateSave(state), null);
    const ownedId = state.choices[0];
    if (state.phase === 'item') state.items.push(ownedId);
    else state.essences.push({ id: ownedId, progress: 0, triggered: false });
    assert.equal(validateSave(state), null, 'owned items and essences cannot reappear in choices');
  }
});

test('floor twelve victory can continue into scaling endless encounters', () => {
  let state = newGame({ mode: 'classic' });
  state.floor = 12;
  state.coins = 10000;
  state.spinsLeft = 1;
  state = spin(state);
  assert.equal(state.phase, 'victory');
  const next = continueEndless(state);
  assert.equal(next.endless, true);
  assert.equal(next.floor, 13);
  assert.equal(next.phase, 'ready');
  assert.ok(next.rent > state.rent);
  assert.notEqual(validateSave(next), null);
});

test('complete twelve-floor combat and classic campaigns persist through every action', () => {
  for (const mode of ['combat', 'classic']) {
    const final = playDraft(newGame({ mode, seed: 'balance-0' }));
    assert.equal(final.phase, 'victory');
    assert.equal(final.floor, 12);
    assert.ok(final.items.length >= 5);
    assert.equal(final.essences.length, 3);
    assert.ok(final.stats.merges > 0);
    assert.ok(final.shield <= final.maxHp * 2, 'floor gifts respect the shield cap');
    const endless = continueEndless(final);
    assert.equal(endless.floor, 13);
    assert.notEqual(validateSave(endless), null);
    assert.notEqual(validateSave(spin(endless)), null);
  }
});
