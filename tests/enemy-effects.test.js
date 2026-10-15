import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin, skipReward, validateSave } from '../src/engine.js';
import { CHARACTERS } from '../src/content.js';
import { ENEMY_DEBUFFS, enemyDebuffById, getEligibleDebuffs, publicDebuff } from '../src/enemy-effects.js';

function fixture(ids = ['1002'], extras = {}) {
  const state = newGame({ seed: 'effects' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 0 }));
  state.uidCounter = ids.length + 1;
  Object.assign(state.roster[0], extras);
  state.hp = 50;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target-${col}`, name: '靶子', col, hp: 1000, maxHp: 1000, attack: 0, boss: false }));
  state.enemySkill = { id: 'pressure', name: '战意积蓄', description: '测试' };
  return state;
}
const damage = state => state.lastSpin.damage;
const healed = state => state.lastSpin.healing;
const shielded = state => state.lastSpin.shield;
const adjacentBuild = () => fixture(['1009', ...Array(19).fill('1002')]);
const incomingBuild = id => { const state = fixture([id]); state.hp = 100; state.enemies.forEach(enemy => { enemy.attack = 10; }); return state; };
const withEffect = (state, id) => { const copy = structuredClone(state); copy.activeDebuffs = [publicDebuff(enemyDebuffById(id), 'boss', 0)]; return copy; };

test('a boss round threshold applies newly added shield decay at the start of the same spin', () => {
  const state = fixture(['1002']);
  state.floor = 3;
  state.round = 2;
  state.spinsLeft = 3;
  state.shield = 100;
  state.resourceStats.initialShield = 100;
  state.bossStage = 1;
  state.enemies[2].boss = true;
  state.activeDebuffs = getEligibleDebuffs(state).filter(effect => effect.id !== 'shield_decay')
    .map(effect => publicDebuff(effect, 'boss', 0));
  const before = structuredClone(state);
  const next = spin(state);
  assert.deepEqual(state, before);
  assert.equal(next.bossStage, 2);
  assert.equal(next.activeDebuffs.find(effect => effect.id === 'shield_decay').addedRound, 3);
  assert.equal(next.resourceStats.shieldDecayed, 20);
  assert.equal(next.shield, 80 - next.resourceStats.shieldBlocked);
});

const effects = [
  ['path_hunt', () => fixture(['1002']), damage],
  ['path_destruction', () => fixture(['1109']), damage],
  ['path_erudition', () => fixture(['1013']), damage],
  ['path_nihility', () => fixture(['1108']), damage],
  ['path_preservation', () => fixture(['1001']), shielded],
  ['path_abundance', () => fixture(['1105']), healed],
  ['path_harmony', adjacentBuild, damage],
  ['attack_single', () => fixture(['1002']), damage],
  ['attack_blast', () => fixture(['1109']), damage],
  ['attack_aoe', () => fixture(['1013']), damage],
  ['growth_audit', () => fixture(['1002'], { ticks: 2, growth: 4 }), s => s.roster[0].growth],
  ['adjacency_audit', adjacentBuild, damage],
  ['star_audit', () => fixture(['1002'], { stars: 2 }), damage],
  ['consume_audit', () => {
    const state = fixture(Array(20).fill('1109'));
    state.roster.forEach((u, index) => { if (index % 2) u.temporary = 3; });
    return state;
  }, damage],
  ['danheng_audit', () => fixture(['1002'], { ticks: 2 }), s => s.roster[0].growth],
  ['herta_audit', () => fixture(['1013'], { ticks: 2 }), damage],
  ['seele_audit', () => {
    const state = fixture(['1102']);
    const origin = spin(state).board.findIndex(Boolean) % 5;
    state.enemies[origin].hp = 1;
    return state;
  }, damage],
  ['kafka_audit', () => fixture(['1005', '1108']), damage],
  ['welt_audit', () => incomingBuild('1004'), s => s.lastSpin.incoming, 'increase'],
  ['fuxuan_audit', () => incomingBuild('1208'), s => s.lastSpin.incoming, 'increase'],
  ['march_audit', () => fixture(['1001']), shielded],
  ['natasha_audit', () => fixture(['1105']), healed],
  ['essence_audit', () => {
    const state = fixture(['1002']); state.essences = [{ id: 'essence_destruction', progress: 0, triggered: false }]; return state;
  }, s => s.essences[0].progress],
  ['synergy_audit', () => fixture(['1001', '1002']), damage],
  ['healing_audit', () => fixture(['1105']), healed],
  ['shield_audit', () => fixture(['1001']), shielded],
  ['shield_pierce', () => { const state = incomingBuild('1002'); state.shield = 100; return state; }, s => s.resourceStats.hpLost, 'increase'],
  ['shield_decay', () => { const state = fixture(['1001']); state.shield = 100; return state; }, s => s.shield],
  ['healthy_audit', () => { const state = fixture(['1002']); state.hp = 90; return state; }, damage],
];

for (const [id, build, measure, direction] of effects) {
  test(`enemy clause ${id} changes its actual targeted mechanic`, () => {
    const state = build();
    assert.ok(enemyDebuffById(id).eligible(state), `${id} has a relevant build`);
    const normal = spin(state);
    const penalized = spin(withEffect(state, id));
    assert.ok(direction === 'increase' ? measure(penalized) > measure(normal) : measure(penalized) < measure(normal), `${id}: ${measure(normal)} -> ${measure(penalized)}`);
    assert.ok(penalized.roster.some(u => u.id === state.roster[0].id), 'clauses never permanently ban a targeted character');
    if (id === 'shield_decay') {
      assert.equal(penalized.resourceStats.shieldDecayed, 20);
      assert.equal(penalized.resourceStats.shieldBlocked, 0, 'decay is waste rather than useful damage mitigation');
    }
  });
}

for (const [id, character, count] of [
  ['summon_audit', '1108', state => state.roster.length > 1],
  ['qingque_audit', '1201', state => state.lastSpin.values.some(value => value > 1)],
]) {
  test(`probability clause ${id} reduces triggers without disabling the mechanic`, () => {
    let normal = 0, penalized = 0;
    for (let index = 0; index < 256; index++) {
      const state = fixture([character]);
      state.seed = `chance-${index}`;
      state.rngState = newGame({ seed: state.seed }).rngState;
      normal += Number(count(spin(state)));
      penalized += Number(count(spin(withEffect(state, id))));
    }
    assert.ok(penalized > 0);
    assert.ok(penalized < normal, `${normal} -> ${penalized}`);
  });
}

test('catalogue has at least twenty distinct real effects and rejects irrelevant or duplicate choices', () => {
  assert.ok(ENEMY_DEBUFFS.length >= 20);
  assert.equal(new Set(ENEMY_DEBUFFS.map(effect => effect.id)).size, ENEMY_DEBUFFS.length);
  assert.equal(new Set([...effects.map(effect => effect[0]), 'summon_audit', 'qingque_audit', 'rift_pollution']).size, ENEMY_DEBUFFS.length, 'each catalog entry has a behavioral test, including fixed pollution in pollution.test.js');
  const state = fixture(['1002']);
  const ids = getEligibleDebuffs(state).map(effect => effect.id);
  assert.ok(ids.includes('path_hunt'));
  assert.equal(ids.includes('path_nihility'), false);
  assert.equal(ids.includes('star_audit'), false);
  assert.equal(ids.includes('consume_audit'), false);
  assert.equal(ids.includes('rift_pollution'), false, 'fixed pollution is never a random clause');
  const active = withEffect(state, 'path_hunt');
  assert.equal(getEligibleDebuffs(active).some(effect => effect.id === 'path_hunt'), false);
});

test('experimental masks do not change eligibility; clauses target build potentials', () => {
  const state = fixture(CHARACTERS.map(character => character.id));
  state.roster[0].stars = 2;
  state.roster.find(u => u.id === '1109').temporary = 3;
  state.essences = [{ id: 'essence_destruction', progress: 0, triggered: false }];
  state.hp = 100;
  const before = getEligibleDebuffs(state).map(effect => effect.id);
  const disabled = structuredClone(state);
  disabled.resourceAccess = { rerolls: false, removals: false, credits: false, defense: false };
  assert.deepEqual(getEligibleDebuffs(disabled).map(effect => effect.id), before);
});

function bossFixture() {
  const state = newGame({ seed: 'boss-phases' });
  state.floor = 2; state.phase = 'recruit'; state.choices = ['1002']; state.pendingFloor = true;
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  return skipReward(state);
}

test('boss stages append eligible clauses at round thresholds with public serializable text', () => {
  let state = bossFixture();
  state.enemies.forEach(enemy => { enemy.hp = enemy.maxHp = 10000; enemy.attack = 0; });
  assert.equal(state.bossStage, 1);
  assert.equal(state.activeDebuffs.filter(effect => effect.source === 'boss').length, 1);
  state.round = 2; state.spinsLeft = 3;
  state = spin(state);
  assert.equal(state.bossStage, 2);
  state = skipReward(state);
  state.round = 4; state.spinsLeft = 1;
  state = spin(state);
  assert.equal(state.bossStage, 3);
  assert.equal(state.activeDebuffs.filter(effect => effect.source === 'boss').length, 3);
  assert.equal(new Set(state.activeDebuffs.map(effect => effect.id)).size, state.activeDebuffs.length);
  assert.ok(state.activeDebuffs.every(effect => typeof effect.description === 'string' && enemyDebuffById(effect.id).eligible(state)));
  assert.notEqual(validateSave(JSON.parse(JSON.stringify(state))), null);
});

test('boss health crossings append clauses, while the next encounter resets them', () => {
  let state = bossFixture();
  state.roster = [{ uid: 'u1', id: '1002', stars: 1, growth: 2, ticks: 0 }];
  const boss = state.enemies.find(enemy => enemy.boss);
  boss.hp = 75; boss.maxHp = 100; boss.attack = 0;
  state.enemies = [boss];
  state = spin(state);
  assert.equal(state.bossStage, 2);
  state = skipReward(state);
  state.enemies[0].hp = 38;
  state = spin(state);
  assert.equal(state.bossStage, 3);
  state = skipReward(state);
  state.enemies.forEach(enemy => { enemy.hp = 0; });
  state = skipReward(spin(state));
  // Floor 3 ends with an essence reward after its recruit.
  if (state.phase === 'essence') state = skipReward(state);
  assert.equal(state.floor, 4);
  assert.equal(state.bossStage, 0);
  assert.ok(state.activeDebuffs.every(effect => effect.source === 'difficulty'));
});
