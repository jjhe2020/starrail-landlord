import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, BINDING_GROUPS, characterById } from '../src/content.js';
import { characterBindings, characterRole, effectFilterLabel, effectRows, trainingSummary } from '../src/effect-info.js';
import { mechanicExplanation } from '../src/mechanics.js';

test('binding recipients explain OR group membership together with exclusions and target limits', () => {
  const astra = characterById('1009');
  const row = effectRows(astra)[0];
  assert.match(row.target, /星穹远行或空间站实验/);
  assert.match(row.target, /非永久培养主职/);
  assert.match(row.target, /排除自身/);
  assert.match(row.target, /排除见习/);
  assert.match(row.target, /永久角色/);
  assert.match(row.target, /最多2名/);
  assert.match(row.trigger, /每 3 次/);
  assert.match(row.scaling, /培养量不被培养自身放大/);
  assert.match(row.scaling, /温和星级.*1 \/ 1\.5 \/ 2/);
  assert.doesNotMatch(row.target, /express|puppet|trainer|undefined/);
});

test('nonattacker training shows real support conversion and never implies attack power', () => {
  const defense = CHARACTERS.find(entry => entry.role === 'defense');
  const trainer = CHARACTERS.find(entry => entry.role === 'trainer');
  const attack = CHARACTERS.find(entry => entry.role === 'attack');
  assert.match(trainingSummary(defense, 5), /职能培养 \+5.*×1.4/);
  assert.match(trainingSummary(defense, 200), /×1.96/);
  assert.match(trainingSummary(trainer, 200), /不接受永久培养.*不自乘/);
  assert.equal(trainingSummary(attack, 5), '攻击成长 +5');
  assert.match(mechanicExplanation('power').description, /支援格显示主职，没有普通攻击/);
  assert.ok(effectRows(defense).some(row => row.scaling.includes('职能培养')));
});

test('limited vulnerability and conditional defense show matching attacker and cap rules', () => {
  const row = effectRows({ effects: [{ type: 'vulnerability', trigger: 'appearance', duration: 'spin', filter: { group: 'express', attack: 'single' }, condition: { metric: 'presentDistinct', value: 2, filter: { group: 'express' } } }] })[0];
  assert.match(row.target, /匹配攻击者/);
  assert.match(row.target, /单体.*星穹远行/);
  assert.match(row.conditions, /星穹远行的同场不同身份至少2/);
  assert.match(row.stacking, /75%/);
  const reduction = effectRows({ effects: [{ type: 'retaliationFlat', duration: 'spin' }, { type: 'retaliationMultiplier', duration: 'spin' }] });
  assert.match(reduction[0].stacking, /基础反击的45%/);
  assert.match(reduction[1].stacking, /最多减60%.*0.4/);
  const scaled = effectRows({ effects: [{ type: 'damage', duration: 'spin', scaleWithSourcePower: true }, { type: 'retaliationMultiplier', duration: 'spin', scaleWithTraining: true }] });
  assert.match(scaled[0].scaling, /来源最终攻击威力/);
  assert.match(scaled[1].scaling, /只放大倍率相对1的增益或减伤部分/);
});

test('all 90 characters expose Chinese roles, actual binding members and readable effect conditions', () => {
  for (const entry of CHARACTERS) {
    assert.match(characterRole(entry), /[\u3400-\u9fff]/u);
    assert.ok(characterBindings(entry).length > 0, entry.name);
    assert.ok(characterBindings(entry).every(group => group.memberIds.includes(entry.id)), entry.name);
    for (const row of effectRows(entry)) {
      const text = `${row.target} ${row.conditions} ${row.scaling}`;
      assert.doesNotMatch(text, /undefined|NaN|groupsAny|roleNot/, entry.name);
      for (const group of BINDING_GROUPS) assert.ok(!text.includes(group.id), `${entry.name} leaks group code ${group.id}`);
    }
  }
  assert.equal(effectFilterLabel({ ids: ['1001', '1002'] }), '三月七、丹恒');
});
