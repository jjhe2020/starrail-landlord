import test from 'node:test';
import assert from 'node:assert/strict';
import { characterById } from '../src/content.js';
import { newGame } from '../src/engine.js';
import { attackFactor, estimateEffectsForAi, forecastGrowthForAi } from '../src/ai.js';
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('AI reads each configured normal multiplier without applying the range baseline twice', () => {
  const state = newGame({seed:'v080-ai-range'});
  state.enemies = [{col:0,hp:100},{col:1,hp:100},{col:2,hp:100}];
  close(attackFactor(state,{pattern:'single',primary:.1}), .1);
  close(attackFactor(state,{pattern:'single',primary:.25}), .25);
  close(attackFactor(state,{pattern:'aoe',eachTarget:.15}), .45);
  close(attackFactor(state,{pattern:'blast',primary:2,adjacent:1},true), 3.6);
});

test('AI separates attack, generic damage, follow-up-only damage and enemy vulnerability', () => {
  const ids=['1006','1008','1106'];
  const originals=ids.map(id=>[characterById(id),structuredClone(characterById(id))]);
  const effect=(type,value,extra={})=>({type,value,trigger:'appearance',target:'self',duration:'spin',...extra});
  try {
    for(const [definition] of originals) Object.assign(definition,{kitVersion:8,baseAttack:10,baseAttackByStar:[0,10,30,90],normalAttack:{pattern:'single',primary:.1,adjacent:0,eachTarget:0},effects:[]});
    characterById('1006').effects=[effect('damage',.5,{attackType:'followUp',scaleWithSourcePower:true,stage:'afterAttacks'}),effect('heal',.5,{scaleWithSourcePower:true})];
    characterById('1008').role='amplifier';
    characterById('1008').effects=[effect('attackPercent',.2,{target:'team'}),effect('damageBonus',.3,{target:'team'}),effect('damageBonus',.4,{target:'team',attackType:'followUp'})];
    characterById('1106').effects=[effect('enemyVulnerability',.5,{target:'nearest'})];
    const state=newGame({seed:'v080-ai-zones'});
    state.roster=ids.map((id,index)=>({id,uid:`u${index+1}`,stars:1,attackBonus:0,ticks:0}));
    state.items=[];state.essences=[];state.activeDebuffs=[];state.hp=50;
    state.enemies=[{id:'target',col:0,hp:10000,maxHp:10000,attack:1}];
    const result=estimateEffectsForAi(state,{horizon:1,active:[],threat:1});
    close(result.powerMultipliers.get('u1'),1.2);
    close(result.damageBonuses.get('u1'),.3);
    close(result.followUpBonuses.get('u1'),.4);
    close(result.enemyDamageBonus,.5);
    close(result.healing,6);
    close(result.damage,15.3);
    state.roster[0].attackPercentBonus = .1;
    const permanentlyRaised = estimateEffectsForAi(state, { horizon: 1, active: [], threat: 1 });
    close(permanentlyRaised.healing, 10 * (1 + .1 + .2) * .5);
    close(permanentlyRaised.damage, 10 * (1 + .1 + .2) * .5 * 1.7 * 1.5);
    state.enemySkill = { id: 'jammer' }; state.round = 2;
    const jammed = estimateEffectsForAi(state, { horizon: 1, active: [], threat: 1 });
    // The next public round is jammed, but its board is unknown: each source
    // has a 1/5 chance of the middle column's 50% attack penalty.
    close(jammed.healing, 6.5 * .9);
    close(jammed.damage, 16.575 * .9);
    const trainer={...state.roster[0],id:'1207'};
    close(forecastGrowthForAi(state,trainer,{horizon:10,draw:1,declaredRate:.2}),1);
  } finally {
    for(const [definition,original] of originals){ for(const key of Object.keys(definition)) delete definition[key];Object.assign(definition,original); }
  }
});

test('star audit reduces the attack base but preserves permanent attack and star-scaled train gifts', () => {
  const ids = ['1001', '1002', '1105'];
  const originals = ids.map(id => [characterById(id), structuredClone(characterById(id))]);
  try {
    for (const [definition] of originals) Object.assign(definition, { kitVersion: 8, baseAttack: 10, baseAttackByStar: [0,10,30,90], effects: [] });
    characterById('1001').effects = [{ type: 'heal', value: 1, trigger: 'appearance', target: 'self', scaleWithSourcePower: true }];
    const state = newGame({ seed: 'v080-ai-star-audit' });
    state.roster = ids.map((id, i) => ({ id, uid: `u${i+1}`, stars: i === 0 ? 2 : 1, attackBonus: i === 0 ? 2 : 0, ticks: 0 }));
    state.items = []; state.essences = []; state.activeDebuffs = [{ id: 'star_audit' }]; state.hp = 10;
    const taxed = estimateEffectsForAi(state, { horizon: 1 });
    const untaxed = estimateEffectsForAi({ ...state, activeDebuffs: [] }, { horizon: 1 });
    close(taxed.healing, 30 * .8 + 2);
    close(untaxed.healing, 30 + 2);
    // Two astral members have 1.05 and 0.35 fixed gifts; the recipient is
    // adjacent to each independently with the board's public 5.5/19 mean.
    close(taxed.powerAdds.get('u3'), (1.05 + .35) * 5.5 / 19);
    close(taxed.powerAdds.get('u3'), untaxed.powerAdds.get('u3'));
  } finally {
    for (const [definition, original] of originals) { for (const key of Object.keys(definition)) delete definition[key]; Object.assign(definition, original); }
  }
});

test('environmental shield reflection ignores attacker damage bonuses and only uses enemy vulnerability', () => {
  const ids = ['1001', '1104'];
  const originals = ids.map(id => [characterById(id), structuredClone(characterById(id))]);
  try {
    for (const [definition] of originals) definition.effects = [];
    characterById('1001').effects = [
      { type: 'damageBonus', value: 4, trigger: 'appearance', target: 'team' },
      { type: 'damageBonus', value: 5, trigger: 'appearance', target: 'team', attackType: 'followUp' },
      { type: 'enemyVulnerability', value: .5, trigger: 'appearance', target: 'nearest' },
    ];
    const state = newGame({ seed: 'v080-ai-reflection' });
    state.roster = ids.map((id, i) => ({ id, uid: `u${i+1}`, stars: 1, attackBonus: 0, ticks: 0 }));
    state.items = []; state.essences = []; state.activeDebuffs = []; state.shield = 100;
    state.enemies = [{ id: 'target', col: 0, hp: 10000, maxHp: 10000, attack: 10 }];
    const result = estimateEffectsForAi(state, { horizon: 1, threat: 10 });
    close(result.damage, 10 * .25 * 1.5);
  } finally {
    for (const [definition, original] of originals) { for (const key of Object.keys(definition)) delete definition[key]; Object.assign(definition, original); }
  }
});
