// Save v2 and role semantics introduced in 0.6 remain supported after the
// position/label redesign. Current card rules are covered in v070-content.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, characterById } from '../src/content.js';
import { RETIREMENT_RULES } from '../src/retirements.js';
import { matchesEffectFilter, trainingMultiplier } from '../src/effect-rules.js';
import { matchesSynergyFilter } from '../src/synergies.js';
import { newGame, validateSave } from '../src/engine.js';

test('save v2 carries old accumulated growth forward through the new role rules',()=>{
  const s=newGame({seed:'v060-save-v070-kit'});
  s.version=2;for(const u of s.roster){u.growth=u.attackBonus;delete u.attackBonus;}s.roster[0].growth=8;
  const saved=validateSave(JSON.parse(JSON.stringify(s)));
  assert.ok(saved);
  assert.equal(saved.roster[0].attackBonus,8);
  assert.equal(trainingMultiplier(saved.roster[0]),1);
  assert.equal(characterById(saved.roster[0].id).attack,'single');
});

test('AI and engine agree on current public identity and professional role filters',()=>{
  const roles=['attack','defense','amplifier','trainer','disruptor'];
  const filters=[...roles.map(role=>({role})),...roles.map(roleNot=>({roleNot})),
    {anyOf:[{path:'巡猎'},{element:'火'}]},
    {role:'attack',anyOf:[{path:'记忆'},{faction:'星穹列车'}]},
    {faction:'仙舟罗浮',pathNot:'同谐'},
  ];
  for(const c of CHARACTERS)for(const filter of filters){
    const u={id:c.id,uid:c.id,stars:1,ticks:0,growth:0};
    assert.equal(matchesSynergyFilter(u,filter,characterById),matchesEffectFilter(u,filter),c.id+'/'+JSON.stringify(filter));
  }
});

test('adapted commissions preserve ten relationship references and explicit fixed attribute rewards',()=>{
  assert.equal(RETIREMENT_RULES.length,10);
  for(const rule of RETIREMENT_RULES){
    const c=characterById(rule.sourceId);
    assert.ok(rule.every>=3 && rule.attackGrowth<=.5,rule.id);
    if(c.role!=='attack')assert.equal(rule.power,0,rule.id);
    if(c.role==='trainer')assert.equal(rule.attackGrowth,0,rule.id);
    assert.ok(rule.relation&&rule.source&&characterById(rule.targetId),rule.id);
  }
});
