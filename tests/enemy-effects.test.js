import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, spin as randomSpin, inspectSpin, skipReward, validateSave } from '../src/engine.js';
import { CHARACTERS } from '../src/content.js';
import { ENEMY_DEBUFFS, enemyDebuffById, getEligibleDebuffs, publicDebuff } from '../src/enemy-effects.js';

// Clause comparisons hold a legal board layout fixed so the matching spatial
// skill actually fires in both arms; cadence, damage and clauses are real engine rules.
function spin(state) {
  if (state.roster.length > 20 || false) return randomSpin(state);
  const layoutUids = state.roster.map(unit => unit.uid);
  while (layoutUids.length < 20) layoutUids.push(null);
  return inspectSpin(state, { layoutUids }).state;
}

function fixture(ids = ['1002'], extras = {}) {
  const state = newGame({ seed: 'effects' });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth:0,attackBonus: 0, ticks: 0 }));
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
const adjacentBuild = () => fixture(['1101', ...Array(19).fill('1103')]);
const shieldBuild = () => fixture(['1001', ...Array(19).fill('1002')]);
const healBuild = () => fixture(['1105', '1109']);
const incomingBuild = (id, partners = []) => { const state = fixture([id, ...partners]); state.hp = 100; state.enemies.forEach(enemy => { enemy.attack = 10; }); return state; };
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
  ['path_nihility', () => fixture(['1308', '1109']), damage],
  ['path_preservation', shieldBuild, shielded],
  ['path_abundance', healBuild, healed],
  ['path_harmony', adjacentBuild, damage],
  ['attack_single', () => fixture(['1002']), damage],
  ['attack_blast', () => fixture(['1109']), damage],
  ['attack_aoe', () => fixture(['1013']), damage],
  ['growth_audit', () => fixture(['1002', '1001'], { ticks: 3, growth:0,attackBonus: 4 }), s => s.roster[0].attackBonus],
  ['adjacency_audit', adjacentBuild, damage],
  ['star_audit', () => fixture(['1002'], { stars: 2 }), damage],
  ['consume_audit', () => {
    const state = fixture(Array(20).fill('1109'));
    state.roster.forEach(u => {u.ticks=2;});
    return state;
  }, damage],
  ['danheng_audit', () => fixture(['1002', '1001'], { ticks: 3 }), s => s.roster[0].attackBonus],
  ['summon_audit', () => fixture(['1013'], { ticks: 2 }), damage],
  ['qingque_audit', () => fixture(['1201', '1202'], { ticks: 2 }), damage],
  ['herta_audit', () => fixture(['1013'], { ticks: 2 }), damage],
  ['seele_audit', () => {
    const state = fixture(['1102', '1201']);
    const origin = spin(state).board.findIndex(Boolean) % 5;
    state.enemies[origin].hp = 1;
    return state;
  }, damage],
  ['kafka_audit', () => fixture(['1005', '1008']), damage],
  ['welt_audit', () => incomingBuild('1004', ['1006']), s => s.lastSpin.incoming, 'increase'],
  ['fuxuan_audit', () => incomingBuild('1208', ['1201', '1102']), s => s.lastSpin.incoming, 'increase'],
  ['march_audit', shieldBuild, shielded],
  ['natasha_audit', healBuild, healed],
  ['essence_audit', () => {
    const state = fixture(['1002']); state.essences = [{ id: 'essence_destruction', progress: 0, triggered: false }]; return state;
  }, s => s.essences[0].progress],
  ['synergy_audit', () => fixture(['1001', '1002', ...Array(18).fill('1103')]), damage],
  ['healing_audit', healBuild, healed],
  ['shield_audit', shieldBuild, shielded],
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

test('catalogue has at least twenty distinct real effects and rejects irrelevant or duplicate choices', () => {
  assert.ok(ENEMY_DEBUFFS.length >= 20);
  assert.equal(new Set(ENEMY_DEBUFFS.map(effect => effect.id)).size, ENEMY_DEBUFFS.length);
  assert.equal(new Set([...effects.map(effect => effect[0]), 'rift_pollution']).size, ENEMY_DEBUFFS.length, 'each catalog entry has a behavioral test, including fixed pollution in pollution.test.js');
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
  state.roster = [{ uid: 'u1', id: '1002', stars: 1, growth:0,attackBonus: 2, ticks: 0 }];
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

test('expanded healing, shielding, growth and directed support remain eligible for their real clauses', () => {
  for (const [id, build, measure] of [
    ['healing_audit', () => fixture(['1110', '1109']), healed],
    ['shield_audit', () => fixture(['1304', '1112']), shielded],
    ['growth_audit', () => fixture(['1303', ...Array(19).fill('1013')], { ticks: 2 }), state => state.roster.reduce((sum, unit) => sum + unit.attackBonus, 0)],
    ['adjacency_audit', () => fixture(['1313', ...Array(19).fill('1008')]), damage],
    ['path_harmony', () => fixture(['1313', ...Array(19).fill('1008')]), damage],
  ]) {
    const state = build();
    assert.ok(getEligibleDebuffs(state).some(effect => effect.id === id), id);
    assert.ok(measure(spin(withEffect(state, id))) < measure(spin(state)), id + ' must change the newly covered mechanic');
  }
});

test('owned natural resource sources include curios and unlocked essences without replaying acquisition rewards', () => {
  const owned = fixture();
  owned.items = ['organic_heart'];
  for (const id of ['healing_audit', 'shield_audit']) assert.ok(enemyDebuffById(id).eligible(owned), id);
  assert.ok(healed(spin(withEffect(owned, 'healing_audit'))) < healed(spin(owned)));
  assert.ok(shielded(spin(withEffect(owned, 'shield_audit'))) < shielded(spin(owned)));
  const unlocked = fixture();
  unlocked.essences = [{ id: 'essence_preservation', progress: 30, triggered: false }];
  assert.equal(enemyDebuffById('shield_audit').eligible(unlocked), false);
  unlocked.essences[0].triggered = true;
  assert.equal(enemyDebuffById('shield_audit').eligible(unlocked), true, 'the unlocked essence will generate shields on entry');
  const oneTime = fixture();
  oneTime.items = ['abundance_wax', 'blood_badge'];
  assert.equal(enemyDebuffById('healing_audit').eligible(oneTime), false, 'already claimed acquisition heals and multipliers alone cannot generate future healing');
  oneTime.items = ['insect_web'];
  assert.equal(enemyDebuffById('healing_audit').eligible(oneTime), false, 'retirement healing needs a temporary source');
  oneTime.roster.push({ uid: 'u2', id: 'garmentmaker', stars: 1, growth:0,attackBonus: 0, ticks: 0 });
  assert.equal(enemyDebuffById('healing_audit').eligible(oneTime), true);
});

test('natural shields generated by an active resonance qualify while an unfunded healing conversion does not', () => {
  const belobog = fixture(['1102', '1103', '1109']);
  belobog.enemies.forEach(enemy => { enemy.hp = 1; });
  assert.equal(enemyDebuffById('shield_audit').eligible(belobog), true);
  assert.ok(shielded(spin(belobog)) > shielded(spin(withEffect(belobog, 'shield_audit'))));
  const xianzhou = fixture(['1201', '1202']);
  assert.equal(enemyDebuffById('shield_audit').eligible(xianzhou), false, 'actual-healing conversion cannot produce shields without a heal source');
  xianzhou.items = ['organic_heart'];
  assert.equal(enemyDebuffById('shield_audit').eligible(xianzhou), true);
});

test('global buffs do not attract directed-support clauses or unrelated character-specific clauses', () => {
  const team = fixture(['1207', '1004']);
  assert.equal(enemyDebuffById('path_harmony').eligible(team), false);
  assert.equal(enemyDebuffById('adjacency_audit').eligible(team), false);
  const newSources = fixture(['1402', '1314', '1303', '1404', '1110']);
  assert.equal(enemyDebuffById('summon_audit').eligible(newSources), true, 'v0.6 extra attacks qualify for the follow-up registration clause');
  for (const id of ['consume_audit', 'danheng_audit', 'march_audit', 'natasha_audit']) assert.equal(enemyDebuffById(id).eligible(newSources), false, id);
});

test('resonance tax selects power and additional damage but excludes purely economic, mitigation and support tiers', () => {
  for (const ids of [['1112', '1304'], ['1004', '1207'], ['1202', '1313']]) {
    assert.equal(enemyDebuffById('synergy_audit').eligible(fixture(ids)), false, ids.join(','));
  }
  const pursuit = fixture(['1002', '1102']);
  pursuit.enemies[0].hp = 1;
  assert.equal(enemyDebuffById('synergy_audit').eligible(pursuit), true, 'a damage-only hunt resonance is taxable');
  assert.ok(damage(spin(withEffect(pursuit, 'synergy_audit'))) < damage(spin(pursuit)));
  assert.equal(enemyDebuffById('synergy_audit').description, '已激活羁绊提供的攻击力加值、伤害提高增量和羁绊造成的伤害降低 25%。', 'public description names the actual affected attributes');
});
