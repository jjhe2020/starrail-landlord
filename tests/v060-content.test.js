import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, BINDING_GROUPS, characterById } from '../src/content.js';
import { ARCHETYPES } from '../src/archetypes.js';
import { SYNERGIES, matchesSynergyFilter } from '../src/synergies.js';
import { RETIREMENT_RULES } from '../src/retirements.js';
import { matchesEffectFilter } from '../src/effect-rules.js';
import { newGame, spin, skipReward } from '../src/engine.js';

const roles = ['attack', 'defense', 'amplifier', 'trainer', 'disruptor'];
const utilityTypes = new Set(['heal', 'healOverflowShield', 'shield', 'power', 'powerMultiplier', 'healMultiplier', 'shieldMultiplier', 'vulnerability', 'retaliationFlat', 'retaliationMultiplier']);

test('v0.6 gives all 90 identities one clear role and 1–3 bounded groups', () => {
  assert.equal(CHARACTERS.length, 90);
  assert.equal(BINDING_GROUPS.length, 10);
  assert.equal(new Set(BINDING_GROUPS.map(g => g.id)).size, 10);
  for (const c of CHARACTERS) {
    assert.equal(c.kitVersion, 6, c.id);
    assert.ok(roles.includes(c.role), c.id);
    assert.ok(c.roleLabel && c.groups.length >= 1 && c.groups.length <= 3, c.id);
    assert.equal(new Set(c.groups).size, c.groups.length, c.id);
    assert.ok(c.effects.length && c.effects.every(e => !e.legacy), c.id);
    for (const group of c.groups) assert.ok(BINDING_GROUPS.find(g => g.id === group)?.memberIds.includes(c.id), c.id + '/' + group);
  }
});

test('each binding group contains all five jobs and membership is symmetric', () => {
  for (const group of BINDING_GROUPS) {
    assert.ok(group.name && group.description);
    assert.equal(new Set(group.memberIds).size, group.memberIds.length, group.id);
    const members = group.memberIds.map(characterById);
    assert.ok(members.every(Boolean), group.id);
    assert.deepEqual([...new Set(members.map(c => c.role))].sort(), [...roles].sort(), group.id);
    assert.ok(members.every(c => c.groups.includes(group.id)), group.id);
  }
});

test('only attack roles have damaging attacks; utility cannot become a substitute carry', () => {
  for (const c of CHARACTERS) {
    if (c.role === 'attack') {
      assert.ok(['single', 'blast', 'aoe'].includes(c.attack), c.id);
      assert.ok(c.power >= 2 && c.power <= 3.8, c.id);
    } else {
      assert.equal(c.attack, 'support', c.id);
      assert.ok(c.power < 1, c.id);
      assert.ok(c.effects.every(e => !['damage', 'selfDamage', 'consume'].includes(e.type)), c.id);
      for (const e of c.effects.filter(e => utilityTypes.has(e.type))) assert.equal(e.scaleWithTraining, true, c.id + '/' + e.type);
    }
  }
});

test('permanent training is bounded, excludes trainers and temporary units, and never amplifies itself', () => {
  let selfGrowers = 0;
  for (const c of CHARACTERS) {
    for (const e of c.effects.filter(e => e.type === 'growth')) {
      assert.equal(e.scaleWithTraining, undefined, c.id);
      if (e.target === 'self') {
        selfGrowers++;
        assert.equal(e.scaleWithStars,undefined,c.id);
        assert.equal(c.role, 'attack');
        assert.ok(e.every >= 4 && e.value <= .15 && e.condition, c.id);
      } else {
        assert.equal(c.role, 'trainer', c.id);
        assert.equal(e.scaleWithStars,true,c.id);
        assert.deepEqual(e.starFactors,[0,1,1.5,2],c.id);
        assert.ok(e.every >= 2 && e.value >= .25 && e.value <= .45, c.id);
        assert.ok(['strongest', 'adjacent'].includes(e.target), c.id);
        assert.ok(e.targetLimit >= 1 && e.targetLimit <= 2, c.id);
        assert.deepEqual(e.filter.groupsAny, c.groups, c.id);
        assert.equal(e.filter.excludeSelf, true, c.id);
        assert.equal(e.filter.roleNot, 'trainer', c.id);
        assert.equal(e.filter.temporary, false, c.id);
        assert.equal(e.filter.commission, false, c.id);
      }
    }
  }
  assert.equal(selfGrowers, 3);
  assert.equal(CHARACTERS.filter(c => c.role === 'trainer').length, 10);
});

test('instant amplifiers and vulnerability have explicit attack/group recipient limits', () => {
  for (const c of CHARACTERS) {
    for (const e of c.effects.filter(e => e.type === 'vulnerability' || c.role === 'amplifier' && ['power', 'powerMultiplier'].includes(e.type))) {
      assert.equal(e.filter.role, 'attack', c.id);
      assert.deepEqual(e.filter.groupsAny, c.groups, c.id);
      if (e.type === 'powerMultiplier') assert.ok(e.value >= 1.3 && e.value <= 1.6, c.id);
      if (e.type === 'vulnerability') assert.ok(e.value >= .15 && e.value <= .35, c.id);
    }
  }
});

test('every defensive resource needs another matching group member', () => {
  for (const c of CHARACTERS.filter(c => c.role === 'defense')) {
    for (const e of c.effects.filter(e => ['heal', 'shield', 'healOverflowShield'].includes(e.type))) {
      const gate = [e.condition, ...(e.conditions || [])].find(gate => ['present', 'neighbors'].includes(gate?.metric));
      assert.ok(gate && gate.value >= 1, c.id);
      assert.equal(gate.filter.excludeSelf, true, c.id);
      assert.deepEqual(gate.filter.groupsAny, c.groups, c.id);
      if (e.per?.metric === 'present' || e.per?.metric === 'neighbors') assert.ok(e.per.cap <= 3, c.id);
    }
  }
});

test('archetype completion rewards remain modest and cannot replace trainers', () => {
  assert.deepEqual(ARCHETYPES.map(a => a.id).sort(), ['ink_dot','follow_up','frost','mentorship','puppet','recollection','elation','break'].sort());
  for (const a of ARCHETYPES) {
    assert.deepEqual(a.memberIds, BINDING_GROUPS.find(g => g.id === a.id).memberIds, a.id);
    assert.ok(a.coreIds.every(id => a.memberIds.includes(id)), a.id);
    for (const e of a.effects) {
      assert.notEqual(e.type, 'growth', a.id);
      if (e.type === 'powerMultiplier') assert.ok(e.value <= 1.25, a.id);
      if (['power', 'powerMultiplier', 'damage'].includes(e.type)) assert.equal(e.filter.role, 'attack', a.id);
    }
  }
});

test('all offensive resonance tiers exclude utility sources or recipients', () => {
  assert.equal(SYNERGIES.length, 21);
  for (const s of SYNERGIES) for (const tier of s.tierEffects) for (const e of tier) {
    if (['power', 'powerMultiplier', 'damage'].includes(e.type)) {
      assert.equal(e.filter.role, 'attack', s.id);
      assert.equal(e.filter.attackNot, 'support', s.id);
    }
  }
});

test('AI and engine share group and job matching', () => {
  const filters = [
    ...roles.map(role => ({role})), ...roles.map(roleNot => ({roleNot})),
    ...BINDING_GROUPS.map(group => ({group:group.id})),
    ...BINDING_GROUPS.map(group => ({groupsAny:[group.id,'express'],role:'attack'})),
  ];
  for (const c of CHARACTERS) for (const filter of filters) {
    const u={id:c.id,uid:c.id,stars:1,ticks:0,growth:0};
    assert.equal(matchesSynergyFilter(u,filter,characterById),matchesEffectFilter(u,filter),c.id+'/'+JSON.stringify(filter));
  }
});

test('commissions retain ten relationships with modest host growth and no utility attack bonus', () => {
  assert.equal(RETIREMENT_RULES.length, 10);
  for (const rule of RETIREMENT_RULES) {
    const c=characterById(rule.sourceId);
    assert.ok(rule.every >= 3 && rule.growth <= .5, rule.id);
    if(c.role !== 'attack') assert.equal(rule.power,0,rule.id);
    if(c.role === 'trainer') assert.equal(rule.growth,0,rule.id);
    assert.ok(rule.relation && rule.source && characterById(rule.targetId),rule.id);
  }
});

function battle(ids, seed='v060', ticks=0, growth=0) {
  const s=newGame({seed});
  s.roster=ids.map((id,i)=>({id,uid:'u'+(i+1),stars:1,ticks,growth:i===0?growth:0}));
  s.uidCounter=ids.length+1;s.hp=20;s.shield=0;s.spinsLeft=50;s.encounter.deadline=50;
  s.enemies=Array.from({length:5},(_,col)=>({id:'target-'+col,name:'训练靶',col,hp:100000,maxHp:100000,attack:0,boss:false}));
  s.enemySkill={id:'none',name:'训练',description:'无词条'};
  s.items=[];s.essences=[];
  return s;
}

test('an off-group defender grants no shield while a matching defender scales its real duty', () => {
  const off=spin(battle(['1104','1404']));
  const base=spin(battle(['1104','1102']));
  const trained=spin(battle(['1104','1102'],'v060',0,8));
  assert.equal(off.lastSpin.shield,0);
  assert.equal(base.lastSpin.shield,4);
  assert.ok(trained.lastSpin.shield > base.lastSpin.shield);
  assert.equal(trained.lastSpin.damage,base.lastSpin.damage,'trained defender cannot add attacks');
});

test('a trainer selects its matching permanent carry ahead of a stronger off-group carry', () => {
  const result=spin(battle(['1207','1002','1102'],'v060-training',1));
  assert.equal(result.roster.find(u=>u.id==='1207').growth,0);
  assert.equal(result.roster.find(u=>u.id==='1002').growth,.35);
  assert.equal(result.roster.find(u=>u.id==='1102').growth,0);
});

test('an entire utility lineup cannot deal damage even with high accumulated training', () => {
  const ids=CHARACTERS.filter(c=>c.role!=='attack').slice(0,20).map(c=>c.id);
  const s=battle(ids,'v060-no-carry',8);
  s.roster.forEach(u=>{u.growth=12;u.stars=3;});
  const result=spin(s);
  assert.equal(result.lastSpin.damage,0);
});

test('adjacent training takes at most two recipients even on a full matching board', () => {
  const result=spin(battle(['1009',...Array(19).fill('1002')],'v060-target-limit',2));
  const grown=result.roster.filter(u=>u.growth>0);
  assert.equal(grown.length,2);
  assert.ok(grown.every(u=>u.id==='1002'&&u.growth===.3));
});

test('source-limited vulnerability amplifies matching blast damage and leaves a mismatched attack shape unchanged', () => {
  const source=characterById('1005'), original=source.effects;
  for(const [carry,expectedRatio] of [['1205',1.3],['1308',1]]) {
    const s=battle(['1005',carry],'v060-vulnerability-'+carry);
    let enabled,disabled;
    try {
      enabled=spin(s);source.effects=[];disabled=spin(s);
    } finally { source.effects=original; }
    assert.ok(Math.abs(enabled.lastSpin.damage-disabled.lastSpin.damage*expectedRatio)<.04,carry);
  }
});

test('a headcount-based follow-up scales with its own final attack power as well as partner count', () => {
  const result=spin(battle(['1314','1112','1112','1112'],'v060-counted-follow-up',0,4));
  const index=result.board.findIndex(u=>u?.id==='1314');
  const follow=result.lastSpin.effects.find(e=>e.sourceId==='1314'&&e.type==='damage');
  assert.ok(follow);
  assert.ok(Math.abs(follow.amount-result.lastSpin.values[index]*.25*3)<.02);
});

test('the real Aglaea summon joins recollection and receives Sunday support on its next appearance', () => {
  const initial=battle(['1402','1313'],'v060-real-reinforcement');
  initial.roster[0].ticks=3;
  const summoned=spin(initial), recruit=summoned.roster.find(u=>u.id==='1206'&&u.temporary===2);
  assert.ok(recruit,'Aglaea actually generated the temporary Sushang');
  assert.ok(characterById('1206').groups.includes('recollection'));
  assert.equal(summoned.board.some(u=>u?.uid===recruit.uid),false,'the summon cannot act before the next draw');
  const ready=skipReward(summoned), enhanced=spin(ready);
  const index=enhanced.board.findIndex(u=>u?.uid===recruit.uid);
  assert.ok(index>=0);
  assert.ok(enhanced.lastSpin.effects.some(e=>e.sourceId==='1313'&&e.type==='power'&&e.targetUid===recruit.uid&&e.amount===.6));
  const sunday=characterById('1313'), original=sunday.effects;
  let control;
  try { sunday.effects=original.filter(e=>e.type!=='power');control=spin(ready); }
  finally { sunday.effects=original; }
  assert.equal(Math.round((enhanced.lastSpin.values[index]-control.lastSpin.values[index])*100)/100,.6);
  assert.equal(enhanced.roster.find(u=>u.uid===recruit.uid).temporary,1,'support does not extend the reinforcement lifetime');
});

test('trainer stars scale permanent output gently rather than staying flat or growing ninefold', () => {
  const totals=[];
  for(const stars of[1,2,3]){
    const s=battle(['1303',...Array(19).fill('1310')],'v060-trainer-stars',2);
    s.roster[0].stars=stars;
    totals.push(spin(s).roster.reduce((total,u)=>total+u.growth,0));
  }
  assert.deepEqual(totals,[.8,1.2,1.6]);
});
