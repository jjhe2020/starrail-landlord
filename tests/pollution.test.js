import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, chooseReward, removeSymbol, validateSave } from '../src/engine.js';
import { CHARACTERS, characterById } from '../src/content.js';
import { adjacentIndexes } from '../src/effect-rules.js';
import { getEligibleDebuffs, unitPowerMultiplier, POLLUTION_ATTACK_MULTIPLIER } from '../src/enemy-effects.js';

const pollution = state => state.activeDebuffs.find(effect => effect.id === 'rift_pollution');
const instance = (uid, id, extra = {}) => ({ uid, id, stars: 1, growth: 0, ticks: 0, ...extra });

function encounter(floor = 4, { roster = [instance('u1', '1002'), instance('u2', '1102')], seed = 'pollution', difficulty = 10, resourceAccess } = {}) {
  const state = newGame({ seed, difficulty, resourceAccess });
  state.roster = structuredClone(roster);
  state.uidCounter = Math.max(...roster.map(unit => Number(unit.uid.slice(1))), 5) + 1;
  state.board = Array(20).fill(null);
  state.floor = floor - 1;
  state.phase = 'recruit'; state.choices = ['1002']; state.pendingFloor = true;
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  const next = skipReward(state);
  // Isolate pollution from the independent random clauses and retaliation.
  next.activeDebuffs = next.activeDebuffs.filter(effect => effect.id === 'rift_pollution');
  next.enemySkill = { id: 'pressure', name: '战意积蓄', description: '每第三次转动，存活敌人的攻击总和额外增加 3。' };
  next.enemyIntent={...next.enemyIntent,name:next.enemySkill.name,description:next.enemySkill.description};
  next.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 10000; enemy.attack = 0; });
  return next;
}

test('pollution selects the lowest base-plus-growth permanent one-star instance only once on fixed encounters', () => {
  const roster = [
    instance('u1', '1002', { growth: 5 }), instance('u2', '1201'), instance('u3', '1009'),
    instance('u4', '1001', { temporary: 3 }), instance('u5', '1013', { stars: 2 }),
  ];
  for (const floor of [4, 6, 8, 10, 12]) {
    const state = encounter(floor, { roster });
    assert.equal(pollution(state).targetUid, 'u3');
    assert.equal(pollution(state).targetName, '艾丝妲');
    assert.equal(state.activeDebuffs.filter(effect => effect.id === 'rift_pollution').length, 1);
    assert.equal(getEligibleDebuffs(state).some(effect => effect.id === 'rift_pollution'), false);
    assert.notEqual(validateSave(state), null);
  }
  for (const floor of [2, 3, 5, 7, 9, 11]) assert.equal(pollution(encounter(floor, { roster })), undefined);
  const noTarget = encounter(4, { roster: [instance('u1', '1002', { stars: 2 }), instance('u2', '1109', { temporary: 2 })] });
  assert.equal(pollution(noTarget), undefined);
  assert.equal(noTarget.roster[0].stars, 2, 'no forced downgrades to create a target');
});

test('pollution and all other enemy rules are identical for every resource mask', () => {
  const full = encounter();
  const disabled = encounter(4, { resourceAccess: { rerolls: false, removals: false, credits: false, defense: false } });
  assert.deepEqual(disabled.activeDebuffs, full.activeDebuffs);
  assert.deepEqual(disabled.enemies, full.enemies);
  const normalSpin = spin(full);
  const disabledSpin = spin(disabled);
  for (const key of ['lastSpin', 'board', 'enemies', 'hp', 'shield', 'resourceStats']) assert.deepEqual(disabledSpin[key], normalSpin[key]);
});

test('the marked instance pays six health, personal half power and one shared attack penalty, with immutable actions', () => {
  const state = encounter(4, { roster: [instance('u1', '1002'), instance('u2', '1002'), instance('u3', '1102')] });
  const before = structuredClone(state);
  const control = structuredClone(state); control.activeDebuffs = [];
  const next = spin(state);
  const plain = spin(control);
  assert.deepEqual(state, before);
  assert.equal(next.hp, 94);
  assert.equal(next.resourceStats.hpLost, 6);
  const target = pollution(state).targetUid;
  const cell = next.board.findIndex(unit => unit?.uid === target);
  assert.ok(Math.abs(next.lastSpin.values[cell] - plain.lastSpin.values[cell] * 0.5 * POLLUTION_ATTACK_MULTIPLIER) <= 0.01);
  for (const [index, unit] of next.board.entries()) {
    if (unit && unit.uid !== target) assert.ok(Math.abs(next.lastSpin.values[index] - plain.lastSpin.values[index] * POLLUTION_ATTACK_MULTIPLIER) <= 0.01, 'all other attackers pay the shared penalty once, including a same-character copy');
  }
  assert.notEqual(validateSave(next), null);
});

test('an instance not drawn onto the twenty-cell board pays no pollution health', () => {
  const characters = CHARACTERS.filter(character => !character.effects.some(effect => effect.type === 'selfDamage'));
  const roster = Array.from({ length: 35 }, (_, index) => instance(`u${index + 1}`, characters[index % characters.length].id));
  let observed = false;
  for (let index = 0; index < 20; index++) {
    const state = encounter(4, { roster, seed: `not-drawn-${index}` });
    const target = pollution(state).targetUid;
    const next = spin(state);
    if (next.board.some(unit => unit?.uid === target)) continue;
    assert.equal(next.resourceStats.hpLost, 0);
    assert.equal(next.lastSpin.events.some(event => event.startsWith('裂界污染：')), false);
    const control = structuredClone(state); control.activeDebuffs = [];
    const normal = spin(control);
    assert.deepEqual(next.lastSpin.values, normal.lastSpin.values, 'an absent target cannot penalize any attacker');
    assert.equal(next.lastSpin.damage, normal.lastSpin.damage);
    observed = true;
    break;
  }
  assert.equal(observed, true);
});

test('removal clears the targeted clause and future cost while disabled removal leaves the real penalty', () => {
  const state = encounter();
  const before = structuredClone(state);
  const target = pollution(state).targetUid;
  const removed = removeSymbol(state, target);
  assert.deepEqual(state, before);
  assert.equal(pollution(removed), undefined);
  assert.equal(removed.resourceStats.removalsUsed, 1);
  assert.equal(spin(removed).resourceStats.hpLost, 0);
  const control = structuredClone(state); control.activeDebuffs = [];
  assert.deepEqual(spin(removed).lastSpin.values, spin(removeSymbol(control, target)).lastSpin.values, 'clearing the marked instance restores the team immediately');
  const disabled = encounter(4, { resourceAccess: { removals: false } });
  assert.equal(removeSymbol(disabled, pollution(disabled).targetUid), disabled);
  assert.equal(spin(disabled).resourceStats.hpLost, 6);
});

test('merging the targeted instance also clears pollution and preserves the character identity', () => {
  const state = encounter(4, { roster: [instance('u1', '1002'), instance('u2', '1002'), instance('u3', '1102')] });
  state.phase = 'recruit'; state.choices = ['1002'];
  const before = structuredClone(state);
  const merged = chooseReward(state, 0);
  assert.deepEqual(state, before);
  assert.equal(pollution(merged), undefined);
  assert.ok(merged.roster.some(unit => unit.id === '1002' && unit.stars === 2));
  assert.equal(merged.resourceStats.removalsUsed, 0);
  const control = structuredClone(state); control.activeDebuffs = [];
  assert.deepEqual(spin(merged).lastSpin.values, spin(chooseReward(control, 0)).lastSpin.values);
  assert.notEqual(validateSave(merged), null);
});

test('pollution reaching zero health fails before any same-turn character or essence healing', () => {
  const state = encounter(4, { roster: [instance('u1', '1002'), instance('u2', '1105'), instance('u3', '1203')] });
  state.hp = 4;
  state.essences = [{ id: 'essence_abundance', progress: 5, triggered: false }];
  const next = spin(state);
  assert.equal(next.phase, 'defeat');
  assert.equal(next.hp, 0);
  assert.equal(next.lastSpin.healing, 0);
  assert.equal(next.lastSpin.damage, 0);
  assert.equal(next.resourceStats.hpLost, 4, 'only actual remaining health is counted as consumed');
  assert.equal(next.essences[0].triggered, false);
  assert.notEqual(validateSave(next), null);
});

test('the next encounter clears pollution instead of permanently disabling its character', () => {
  let state = encounter();
  state.enemies = [{ ...state.enemies[2], hp: 1 }];
  state = spin(state);
  assert.equal(state.pendingFloor, true);
  while (['recruit', 'item', 'essence'].includes(state.phase)) state = skipReward(state);
  assert.equal(state.floor, 5);
  assert.equal(pollution(state), undefined);
  assert.ok(state.roster.some(unit => unit.uid === 'u1'));
  assert.notEqual(validateSave(state), null);
});

test('pollution save roundtrip is deterministic and rejects forged or dangling instance fields', () => {
  const state = encounter();
  const saved = validateSave(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(saved, state);
  assert.deepEqual(spin(saved), spin(state));
  const forged = [
    effect => { effect.targetUid = 'u99999'; }, effect => { effect.targetUid = { uid: 'u1' }; },
    effect => { effect.targetId = '1102'; }, effect => { effect.targetName = '<script>'; },
    effect => { effect.source = 'boss'; }, effect => { effect.addedRound = 1; },
    effect => { effect.description = '假称没有伤害'; },
  ];
  for (const mutate of forged) {
    const value = structuredClone(state); mutate(pollution(value));
    assert.equal(validateSave(value), null);
  }
  const promoted = structuredClone(state); promoted.roster[0].stars = 2;
  assert.equal(validateSave(promoted), null);
  const injected = structuredClone(state);
  injected.activeDebuffs = [{ id: 'path_hunt', name: '巡猎征税', description: '测试', source: 'difficulty', addedRound: 0, targetUid: 'u1' }];
  assert.equal(validateSave(injected), null);
  assert.equal(unitPowerMultiplier(state, CHARACTERS.find(c => c.id === '1002'), state.roster[0]), 0.5);
});

test('the shared pollution penalty changes attack power without reducing support healing or shield generation', () => {
  const state = encounter(4, { roster: [instance('u1', '1002'), instance('u2', '1105'), instance('u3', '1001'), instance('u4', '1009')] });
  state.hp = 50;
  const control = structuredClone(state);
  control.activeDebuffs = [];
  control.hp = 44; // Match health at the utility checkpoint after the six-point cost.
  const polluted = spin(state);
  const normal = spin(control);
  assert.equal(polluted.lastSpin.healing, normal.lastSpin.healing);
  assert.equal(polluted.lastSpin.shield, normal.lastSpin.shield);
  assert.equal(polluted.lastSpin.healing, 2.5);
  const protectorIndex=polluted.board.findIndex(u=>u?.id==='1001');
  const protector=characterById('1001');
  const matchingNeighbors=adjacentIndexes(protectorIndex).map(i=>polluted.board[i]).filter(u=>u&&characterById(u.id).groups.some(g=>protector.groups.includes(g))).length;
  assert.equal(polluted.lastSpin.shield,Math.min(3,matchingNeighbors)*3);
  for (const id of ['1105', '1009']) {
    const cell = polluted.board.findIndex(unit => unit?.id === id);
    const marked=pollution(state).targetUid===polluted.board[cell].uid;
    assert.equal(polluted.lastSpin.values[cell],marked?Math.round(normal.lastSpin.values[cell]*.5*100)/100:normal.lastSpin.values[cell]);
  }
});

test('public power helpers require an explicit real trigger instead of guessing from old board snapshots', () => {
  const state = encounter();
  state.board[0] = structuredClone(state.roster[0]);
  const other = state.roster[1];
  const character = CHARACTERS.find(c => c.id === other.id);
  assert.equal(unitPowerMultiplier(state, character, other), 1, 'a previous board is not a next-turn trigger');
  assert.equal(unitPowerMultiplier(state, character, other, true), POLLUTION_ATTACK_MULTIPLIER);
  const removed = removeSymbol(state, pollution(state).targetUid);
  assert.equal(unitPowerMultiplier(removed, character, other, true), 1, 'a cleared clause has no group effect');
});

test('the exact old version-two preview description migrates text without changing the journey or weakening field validation', () => {
  const current = encounter(4, { difficulty: 7, resourceAccess: { credits: false } });
  current.coins = 39;
  current.rerolls = 7;
  current.removals = 4;
  const legacy = structuredClone(current);
  const name = pollution(legacy).targetName;
  pollution(legacy).description = `${name}（一星）的被标记实例：实际登场时直接消耗 6 生命，威力降低 50%；移除或合成该实例解除污染，仅本关生效。`;
  const snapshot = structuredClone(legacy);
  const restored = validateSave(legacy);
  assert.deepEqual(legacy, snapshot, 'text migration is immutable');
  assert.deepEqual(restored, current, 'only the known legacy description is normalized');
  assert.equal(restored.difficulty, 7);
  assert.equal(restored.rngState, legacy.rngState);
  assert.deepEqual(restored.enemies, legacy.enemies);
  assert.deepEqual(restored.resourceStats, legacy.resourceStats);
  assert.deepEqual(spin(restored), spin(current), 'resumed gameplay uses the real shared attack penalty');
  for (const mutate of [
    effect => { effect.description += ' '; },
    effect => { effect.targetUid = 'u99999'; },
    effect => { effect.targetName = '错名'; },
    effect => { effect.attackMultiplier = 1; },
  ]) {
    const value = structuredClone(legacy); mutate(pollution(value));
    assert.equal(validateSave(value), null, 'legacy text does not excuse forged fields or unknown descriptions');
  }
});
