import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from '../src/content.js';
import { newGame, spin, skipReward, rerollRewards, chooseReward, validateSave } from '../src/engine.js';
import { EFFECT_TYPES, EFFECT_TRIGGERS, matchesEffectFilter } from '../src/effect-rules.js';

test('source-checked content pools contain 90 independent characters, 64 curios and 32 essences', () => {
  for (const [rows, count] of [[CHARACTERS, 90], [ITEMS, 64], [ESSENCES, 32]]) {
    assert.equal(rows.length, count);
    assert.equal(new Set(rows.map(row => row.id)).size, count);
    assert.equal(new Set(rows.map(row => row.name)).size, count);
    for (const row of rows) {
      assert.ok(row.description?.trim());
      assert.ok(row.effects.length);
      for (const effect of row.effects) {
        assert.ok(effect.summary?.trim(), row.id);
        assert.ok(effect.trigger && effect.target && effect.duration && effect.stacking, row.id);
        assert.ok(['instant', 'spin', 'encounter', 'run', 'nextSpin', 'resource', 'whileOwned', 'appearances'].includes(effect.duration), row.id);
        if (!effect.legacy) {
          assert.ok(EFFECT_TYPES.includes(effect.type), row.id + ': ' + effect.type);
          assert.ok(EFFECT_TRIGGERS.includes(effect.trigger), row.id + ': ' + effect.trigger);
          assert.ok(Number.isFinite(effect.value), row.id);
          if (effect.chance !== undefined) assert.ok(effect.chance >= 0 && effect.chance <= 1);
          if (effect.every !== undefined) assert.ok(Number.isInteger(effect.every) && effect.every > 0);
          if (effect.type === 'summon') assert.ok(characterById(effect.characterId), row.id);
        }
      }
    }
  }
  const previousIds = {
    characters: ['1001','1002','1003','1004','1005','1006','1008','1009','1013','1101','1102','1103','1104','1105','1106','1107','1108','1109','1201','1202','1203','1204','1205','1208'],
    items: ['cosmic_lotto','fortune_glue','gold_coin','faith_bond','preservation_wax','abundance_wax','hunt_wax','destruction_wax','erudition_wax','harmony_wax','nihility_wax','dimension_dice','doctor_robe','chaos_trametes','angel_debt','insect_web','seal_stamp','divination_candle','broken_clock','rubert_gear'],
    essences: ['essence_elation','essence_abundance','essence_hunt','essence_destruction','essence_erudition','essence_harmony','essence_preservation','essence_nihility'],
  };
  for (const [kind, rows] of [['characters', CHARACTERS], ['items', ITEMS], ['essences', ESSENCES]]) {
    for (const id of previousIds[kind]) assert.ok(rows.some(row => row.id === id), 'Stable save ID ' + id);
    for (const row of rows) {
      if (kind === 'characters') assert.ok(row.kitVersion === 6 && row.effects.every(effect => !effect.legacy), row.id);
      else assert.equal(row.effects.every(effect => effect.legacy), previousIds[kind].includes(row.id), row.id);
    }
  }
});

test('all character and curio images retain verified local source bytes and every reference resolves', () => {
  const revision = 'dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487';
  for (const [kind, rows, dimension] of [['characters', CHARACTERS, 256], ['curios', [...ITEMS, ...ESSENCES], 128]]) {
    const manifest = JSON.parse(readFileSync(new URL('../public/assets/' + kind + '/source-manifest.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
    assert.equal(manifest.commit, revision);
    const expectedImages = kind === 'characters' ? 90 : 64;
    assert.equal(manifest.assets.length, expectedImages);
    assert.equal(new Set(manifest.assets.map(asset => asset.id)).size, expectedImages);
    for (const asset of manifest.assets) {
      const image = readFileSync(new URL('../public/assets/' + kind + '/' + asset.id + '.png', import.meta.url));
      assert.equal(image.length, asset.bytes);
      assert.equal(createHash('sha256').update(image).digest('hex'), asset.sha256);
      assert.equal(image.subarray(1, 4).toString(), 'PNG');
      assert.equal(image.readUInt32BE(16), dimension);
      assert.equal(image.readUInt32BE(20), dimension);
      if (asset.kind === 'text-symbol') {
        const characterId = asset.id === 'aha-symbol' ? 'aha' : 'aeon_star_aha';
        assert.ok(['aha-symbol','aeon-star-aha'].includes(asset.id));
        assert.equal(asset.source, 'project:' + (characterId === 'aha' ? 'aha' : 'aeon-star-aha') + '-text-symbol-v1');
        assert.equal(characterById(characterId).portraitKind, 'text-symbol');
      } else assert.equal(asset.source, 'https://raw.githubusercontent.com/Mar-7th/StarRailRes/' + revision + '/icon/' + (kind === 'characters' ? 'character' : 'curio') + '/' + asset.id + '.png');
      assert.deepEqual(asset.contentIds.slice().sort(), rows.filter(row => String(row.assetId) === asset.id).map(row => row.id).sort());
      assert.ok(asset.contentIds.length);
    }
    for (const row of rows) {
      assert.ok(manifest.assets.some(asset => asset.id === String(row.assetId)), row.id);
      if (kind === 'curios') assert.equal(row.image, './public/assets/curios/' + row.assetId + '.png');
    }
  }
});

// Each new effect is exercised through real public engine actions, then the
// same seeded scenario is rerun with only that definition disabled. These
// fixtures deliberately observe game outcomes rather than effect log text.
// Definitions are restored in finally; tests in this file run sequentially.
const all=[...CHARACTERS.map(d=>({kind:'character',d})),...ITEMS.map(d=>({kind:'item',d})),...ESSENCES.map(d=>({kind:'essence',d}))];
const matches=(c,f={})=>matchesEffectFilter({id:c.id,uid:c.id,stars:f.starsMin||1,...(f.temporary?{temporary:2}:{})},f);
const safeIds=['1002','1103','1111','1206','1210','1109','1312','1405','1305','1001','1105'];
const pick=(f,excludedId)=>safeIds.map(characterById).find(c=>c.id!==excludedId&&matches(c,f)&&c.attack!=='support')||CHARACTERS.find(c=>c.id!==excludedId&&matches(c,f)&&c.attack!=='support')||CHARACTERS.find(c=>c.id!==excludedId&&matches(c,f))||characterById('1002');
function fixture(entry,effect,seed){
 const state=newGame({seed:`effect-probe:${entry.d.id}:${seed}`});
 let fillers=Array(19).fill('1002');
 const requests=[effect.filter,effect.per?.filter,...[effect.condition,...(effect.conditions||[])].filter(c=>['present','presentDistinct','neighbors','row','column','aligned'].includes(c?.metric)).map(c=>c.filter)].filter(f=>f&&Object.keys(f).length);
 if(requests.length)fillers=Array.from({length:19},(_,i)=>pick(requests[i%requests.length],entry.d.id).id);
 const first=entry.kind==='character'?entry.d.id:'1002';
 if(effect.type==='healMultiplier')fillers=['1105',...Array(18).fill('1102')];
 if(effect.type==='shieldMultiplier'){
  const defender=CHARACTERS.find(c=>matches(c,effect.filter)&&c.effects.some(e=>e.type==='shield'))||characterById('1001');
  const defenseEffect=defender.effects.find(e=>['shield','heal','healOverflowShield'].includes(e.type));
  const partner=pick(defenseEffect?.condition?.filter||defenseEffect?.per?.filter,defender.id);
  fillers=[defender.id,...Array(18).fill(partner.id)];
 }
 if(effect.type==='buffMultiplier')fillers=['1101',...Array(18).fill('1102')];
 if(effect.type==='growthMultiplier')fillers=['1207',...Array(18).fill('1002')];
 let ids=[first,...fillers];
 if([effect.condition,...(effect.conditions||[])].some(c=>c&&c.metric==='neighbors'&&((c.op==='eq'&&c.value===0)||(c.op==='lte'&&c.value<=1))))ids=[first];
 if([effect.condition,...(effect.conditions||[])].some(c=>c?.metric==='roster'&&c.op==='lte'))ids=ids.slice(0,8);
 if(effect.per?.metric==='emptyNeighbors'||[effect.condition,...(effect.conditions||[])].some(c=>c?.metric==='emptyNeighbors'))ids=ids.slice(0,4);
 if([effect.condition,...(effect.conditions||[])].some(c=>c?.metric==='synergies'))ids=CHARACTERS.slice(0,20).map(c=>c.id);
 if(effect.trigger==='kill') {
  const support=requests.map(f=>CHARACTERS.find(c=>c.id!==first&&c.role!=='attack'&&matches(c,f))).find(Boolean);
  ids=support?[first,support.id,support.id]:[first];
 }
 state.roster=ids.map((id,index)=>({uid:`u${index+1}`,id,stars:1,growth:0,ticks:effect.every&&entry.kind==='character'?effect.every-1:effect.type==='growthMultiplier'?1:0}));
 if(effect.filter?.starsMin>=2)state.roster.forEach(u=>{u.stars=effect.filter.starsMin;});
 state.uidCounter=ids.length+1;
 state.hp=30;state.shield=0;state.coins=60;state.rerolls=10;state.removals=10;
 state.round=entry.kind!=='character'&&effect.every?effect.every-1:0;state.spinsLeft=90;state.encounter.deadline=100;
 state.enemies=Array.from({length:5},(_,col)=>({id:`probe-${col}`,name:'训练靶',col,hp:100000,maxHp:100000,attack:2,boss:false}));
 state.enemySkill={id:'armor',name:'装甲校验',description:'每次命中减少1伤害'};
 for(const condition of [effect.condition,...(effect.conditions||[])].filter(Boolean)){
  if(condition.metric==='hpRatio')state.hp=condition.op==='gte'?100:20;
  if(condition.metric==='shield')state.shield=40;
  if(condition.metric==='coins')state.coins=condition.op==='lte'?0:90;
  if(condition.metric==='enemies'&&['eq','lte'].includes(condition.op))state.enemies=state.enemies.slice(0,condition.value);
 }
 if(effect.type==='damage'&&entry.kind==='character'&&entry.d.role==='attack')state.roster[0].growth=4;
 if(effect.per?.metric==='emptyColumns')state.enemies=state.enemies.slice(0,2);
 if(effect.per?.metric==='coins')state.coins=90;
 if(effect.per?.metric==='missingHp')state.hp=20;
 if(effect.per?.metric==='retirements'||effect.condition?.metric==='retirements'||effect.filter?.temporary||effect.per?.filter?.temporary||effect.type==='consume'){
  state.roster.slice(1,7).forEach(u=>{u.temporary=effect.per?.metric==='retirements'||effect.condition?.metric==='retirements'?1:2;});
 }
 if(effect.trigger==='kill')state.enemies.forEach(enemy=>{enemy.hp=1;});
 if(entry.kind==='item')state.items=[entry.d.id];
 if(entry.kind==='essence')state.essences=[{id:entry.d.id,progress:entry.d.target,triggered:true}];
 if(effect.type==='essenceProgressMultiplier')state.essences.push({id:'essence_destruction',progress:0,triggered:false});
 return state;
}
function perform(entry,effect,seed){
 const state=fixture(entry,effect,seed);
 if(effect.type==='rarityMultiplier'){
  state.phase='recruit';state.choices=['1001','1002','1105'];return rerollRewards(state);
 }
 if(effect.trigger==='acquire'&&entry.kind==='item'){
  state.items=[];state.phase='item';state.choices=[entry.d.id];return chooseReward(state,0);
 }
 if(effect.trigger==='acquire'&&entry.kind==='essence'){
  const metric=entry.d.progress.metric;
  state.essences=[{id:entry.d.id,progress:entry.d.target-.01,triggered:false,...(['rerolls','removals','creditsSpent','merges'].includes(metric)?{baseline:0}:{})}];
  if(metric==='rerolls')state.resourceStats.rerollsUsed=entry.d.target;
  if(metric==='removals')state.resourceStats.removalsUsed=entry.d.target;
  if(metric==='creditsSpent')state.resourceStats.creditsSpent=entry.d.target;
  if(metric==='merges')state.stats.merges=entry.d.target;
  if(metric==='healing'){state.roster.push({uid:`u${state.uidCounter++}`,id:'1105',stars:1,ticks:0,growth:0});state.roster.push({uid:`u${state.uidCounter++}`,id:'1102',stars:1,ticks:0,growth:0});}
  if(metric==='shield')state.roster.push({uid:`u${state.uidCounter++}`,id:'1001',stars:1,ticks:0,growth:0});
  if(metric==='retirements')state.roster.slice(1,4).forEach(u=>{u.temporary=1;});
  if(metric==='synergies'){state.roster=CHARACTERS.slice(0,20).map((c,i)=>({id:c.id,uid:`u${i+1}`,stars:1,ticks:0,growth:0}));state.uidCounter=21;}
  if(metric==='credits')state.items.push('faith_bond');
  return spin(state);
 }
 if(effect.trigger==='floor'){
  state.phase='recruit';state.choices=['1002'];state.pendingFloor=true;state.enemies.forEach(e=>{e.hp=0;});
  return skipReward(state);
 }
 return spin(state);
}
function measure(s,e){
 if(['power','powerMultiplier','damage','ignoreArmor','consume','vulnerability'].includes(e.type))return s.lastSpin.damage;
 if(['heal','healMultiplier'].includes(e.type))return s.resourceStats.healed;
 if(['shield','shieldMultiplier'].includes(e.type))return s.resourceStats.shieldGained;
 if(e.type==='growth'||e.type==='growthMultiplier')return s.roster.map(u=>`${u.uid}:${u.growth}`).join('|');
 if(e.type==='resource')return s[e.resource];
 if(e.type==='selfDamage')return s.resourceStats.hpLost;
 if(e.type==='maxHp')return s.maxHp;
 if(e.type==='extraSpin')return s.spinsLeft;
 if(['retaliationFlat','retaliationMultiplier'].includes(e.type))return s.lastSpin.incoming;
 if(e.type==='summon')return s.roster.filter(u=>u.temporary).length;
 if(e.type==='rarityMultiplier')return s.choices.join('|');
 if(e.type==='essenceProgressMultiplier')return s.essences.find(x=>x.id==='essence_destruction').progress;
 return JSON.stringify([s.hp,s.shield,s.coins,s.rerolls,s.removals,s.lastSpin.damage]);
}


for (const entry of all) {
  const effects = entry.d.effects;
  for (let index = 0; index < effects.length; index++) {
    const effect = effects[index];
    if (effect.legacy) continue;
    test('content ' + entry.kind + ' ' + entry.d.id + '[' + index + '] changes real ' + effect.type + ' outcomes', () => {
      let changed = false;
      const limit = effect.chance !== undefined || effect.type === 'rarityMultiplier' ? 128 : 48;
      for (let seed = 0; seed < limit && !changed; seed++) {
        let enabled, disabled;
        try {
          enabled = perform(entry, effect, seed);
          entry.d.effects = effects.filter((_, effectIndex) => effectIndex !== index);
          disabled = perform(entry, effect, seed);
        } finally { entry.d.effects = effects; }
        assert.ok(validateSave(JSON.parse(JSON.stringify(enabled))), 'Enabled effect state must round-trip');
        assert.ok(validateSave(JSON.parse(JSON.stringify(disabled))), 'Disabled control state must round-trip');
        changed = measure(enabled, effect) !== measure(disabled, effect);
      }
      assert.ok(changed, effect.summary + ' must affect an actual game outcome in a reachable scenario');
    });
  }
}
