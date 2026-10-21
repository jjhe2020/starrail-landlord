import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { newGame, spin, validateSave } from '../src/engine.js';
import { characterById } from '../src/content.js';
import { inspectSpin } from '../src/growth-telemetry.js';

const root = new URL('../', import.meta.url);
const output = new URL('../docs/benchmarks/support-growth-mechanism-v050.json', import.meta.url);
const seed = 'support-growth-proof';
const sources = ['src/engine.js', 'src/content.js', 'src/synergies.js', 'src/effect-rules.js', 'src/difficulty.js', 'src/enemy-effects.js', 'src/retirements.js', 'src/archetypes.js', 'src/growth-telemetry.js', 'scripts/probe-support-growth.mjs'];
const hash = value => createHash('sha256').update(value).digest('hex');
const fingerprints = () => Object.fromEntries(sources.map(path => [path, hash(readFileSync(new URL(path, root)))]));
const sourceHashes = fingerprints();
const round = value => Math.round(value * 1e6) / 1e6;
const sum = values => round(values.reduce((total, value) => total + value, 0));

function differences(before, after, path = '') {
  if (Object.is(before, after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object') {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(key => differences(before[key], after[key], path + (Array.isArray(before) ? `[${key}]` : `${path ? '.' : ''}${key}`)));
  }
  return [{ path, before: before ?? null, after: after ?? null }];
}

function fixture(ids, columns) {
  const state = newGame({ seed, difficulty: 10 });
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, growth: 0, ticks: 1 }));
  state.uidCounter = ids.length + 1;
  state.board = Array(20).fill(null);
  state.hp = 50;
  state.resourceStats.hpLost = 50;
  state.round = 1;
  state.stats.spins = 1;
  state.spinsLeft = 4;
  state.enemies = Array.from({ length: columns }, (_, col) => ({ id: `support-probe-${col}`, name: '高血机制靶', col, hp: 1000, maxHp: 1000, attack: 0, boss: false }));
  state.enemyIntent.damage = 0;
  state.enemyIntent.round = 2;
  assert.ok(validateSave(state), 'Controlled starting fixture must pass production save validation.');
  return state;
}

function observe(result, subjectUid) {
  const { state, hits } = result;
  const cell = state.board.findIndex(unit => unit?.uid === subjectUid);
  assert.ok(cell >= 0);
  const ownEffects = state.lastSpin.effects.filter(effect => effect.sourceUid === subjectUid);
  return {
    selfPower: state.lastSpin.values[cell],
    selfCharacterDamage: sum(hits.filter(hit => hit.sourceType === 'character' && hit.sourceUid === subjectUid).map(hit => hit.amount)),
    teamCharacterDamage: sum(hits.filter(hit => hit.sourceType === 'character').map(hit => hit.amount)),
    teamSharedDamage: sum(hits.filter(hit => hit.sourceType !== 'character').map(hit => hit.amount)),
    teamDamage: state.lastSpin.damage,
    selfHealing: sum(ownEffects.filter(effect => effect.type === 'heal').map(effect => effect.amount || 0)),
    selfShield: sum(ownEffects.filter(effect => effect.type === 'shield').map(effect => effect.amount || 0)),
    teamHealing: state.lastSpin.healing,
    teamShield: state.lastSpin.shield,
    sentFlatPower: sum(ownEffects.filter(effect => effect.type === 'power' && effect.targetUid && effect.targetUid !== subjectUid).map(effect => effect.amount || 0)),
    sentGrowth: sum(ownEffects.filter(effect => effect.type === 'growth' && effect.targetUid && effect.targetUid !== subjectUid).map(effect => effect.amount || 0)),
    growthGrants: ownEffects.filter(effect => effect.type === 'growth').map(effect => ({ targetUid: effect.targetUid, targetId: state.board.find(unit => unit?.uid === effect.targetUid)?.id, amount: effect.amount })),
    sharedDamageBySource: Object.fromEntries([...new Set(hits.filter(hit => hit.sourceType !== 'character').map(hit => hit.sourceId))].map(id => [id, sum(hits.filter(hit => hit.sourceId === id).map(hit => hit.amount))])),
  };
}

const cases = [
  { id: 'cyrene-self-growth', ids: ['cyrene', '1407', '1409'], subjectId: 'cyrene', columns: 5, expectedSharedDamageDelta: 0,
    interpretation: '昔涟自身成长提高自身结算威力；给遐蝶和风堇的永久成长仍各为0.1，治疗、护盾及本次团队伤害均不增加。昔涟给攻击型记忆队友的成长有效，不能据此将她自身的成长解释为支援强度成长。' },
  { id: 'lightning-support-growth', ids: ['1211', '1202', '1103'], subjectId: '1211', columns: 5, expectedSharedDamageDelta: 2,
    interpretation: '三种雷身份激活雷羁绊，常规攻击后仍至少两列存活；白露成长+10使20%威力电弧增加2点团队来源伤害，但治疗和护盾不增加。' },
  { id: 'wind-support-growth', ids: ['1101', '1217', '1002'], subjectId: '1101', columns: 2, expectedSharedDamageDelta: 2.5,
    interpretation: '三种风身份激活风羁绊，常规攻击后只剩两列；布洛妮娅成长+10使25%威力追击增加2.5点团队来源伤害，但邻接平加增益和治疗不增加。' },
].map(definition => {
  const baselineInput = fixture(definition.ids, definition.columns);
  const boostedInput = structuredClone(baselineInput);
  const subject = boostedInput.roster.find(unit => unit.id === definition.subjectId);
  subject.growth = 10;
  assert.ok(validateSave(boostedInput));
  const snapshots = [structuredClone(baselineInput), structuredClone(boostedInput)];
  const baselineResult = inspectSpin(baselineInput), boostedResult = inspectSpin(boostedInput);
  assert.deepEqual(baselineInput, snapshots[0]);
  assert.deepEqual(boostedInput, snapshots[1]);
  assert.deepEqual(baselineResult.state, spin(baselineInput));
  assert.deepEqual(boostedResult.state, spin(boostedInput));
  assert.ok(validateSave(baselineResult.state));
  assert.ok(validateSave(boostedResult.state));
  for (const result of [baselineResult, boostedResult]) assert.equal(sum(result.hits.map(hit => hit.amount)), result.state.lastSpin.damage);
  const baseline = observe(baselineResult, subject.uid), boosted = observe(boostedResult, subject.uid);
  const delta = Object.fromEntries(Object.entries(baseline).filter(([, value]) => typeof value === 'number').map(([key, value]) => [key, round(boosted[key] - value)]));
  assert.equal(delta.selfPower, 10);
  assert.equal(delta.selfCharacterDamage, 0);
  assert.equal(delta.teamCharacterDamage, 0);
  assert.equal(delta.teamSharedDamage, definition.expectedSharedDamageDelta);
  assert.equal(delta.teamDamage, definition.expectedSharedDamageDelta);
  for (const key of ['selfHealing', 'selfShield', 'teamHealing', 'teamShield', 'sentFlatPower', 'sentGrowth']) assert.equal(delta[key], 0, `${definition.id}: ${key}`);
  assert.deepEqual(baseline.growthGrants, boosted.growthGrants);
  const inputDifferences = differences(baselineInput, boostedInput);
  assert.equal(inputDifferences.length, 1);
  assert.equal(inputDifferences[0].path, `roster[${definition.ids.indexOf(definition.subjectId)}].growth`);
  assert.equal(baselineResult.state.rngState, boostedResult.state.rngState);
  assert.deepEqual(baselineResult.state.board.map(unit => unit?.uid), boostedResult.state.board.map(unit => unit?.uid));
  assert.deepEqual(baselineResult.state.choices, boostedResult.state.choices);
  return {
    id: definition.id, seed, subjectId: definition.subjectId, subjectName: characterById(definition.subjectId).name,
    roster: definition.ids.map(id => ({ id, name: characterById(id).name, stars: 1, ticksBefore: 1 })),
    fixture: { difficulty: 10, floor: 1, roundBefore: 1, hpBefore: 50, shieldBefore: 0, enemyColumns: definition.columns, enemyHpEach: 1000, enemyAttackEach: 0, items: [], essences: [], activeDebuffs: [] },
    intervention: { field: `roster.${subject.uid}.growth`, baseline: 0, boosted: 10, inputDifferences },
    baseline, boosted, delta,
    checks: { inputSaveValid: true, resultSaveValid: true, inputsImmutable: true, officialSpinDeepEqual: true, damageLedgerReconciles: true, sameRngAfter: true, sameBoardPositions: true, sameRewardChoices: true, expectedMetricBoundaries: true },
    resultStateDifferences: differences(baselineResult.state, boostedResult.state),
    interpretation: definition.interpretation,
  };
});

assert.deepEqual(fingerprints(), sourceHashes, 'Probe sources changed during execution.');
const report = {
  version: 'support-growth-mechanism-v050', measuredVersion: '0.5.0', date: '2026-10-21', nodeVersion: process.version,
  experimentType: 'single-turn-controlled-mechanism-experiment',
  sampling: { artificialFixtures: true, naturalCampaigns: 0, includedIn5700CampaignSample: false, pairedFixtures: 3, singleTurnResolutions: 6 },
  scope: '人工构造并通过正式存档校验的同状态单次转动；只改变指定辅助自身的永久growth。用于验证当前公式与条件，不代表自然构筑频率、通关率或完整卡牌价值。',
  attribution: 'selfCharacterDamage只含角色原始来源；风雷追击保留synergy原始来源，计teamSharedDamage。辅助不普遍按自身永久growth增加治疗、护盾或平加支援；特定属性羁绊可将其威力转为团队追加伤害。',
  sourceStable: true, sourceHashes, cases,
};
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(`Saved ${cases.length} paired mechanism fixtures to ${fileURLToPath(output)}; all checks passed.`);
