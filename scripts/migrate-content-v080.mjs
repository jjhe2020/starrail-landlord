// One-time reviewed-content migration. Running after v0.8.0 refuses to overwrite tuning.
import fs from 'node:fs';
import { CHARACTERS, ITEMS, ESSENCES } from '../src/content.js';
if (CHARACTERS.some(c => c.kitVersion >= 8)) throw new Error('v0.8.0 content already applied; tune the explicit content data instead.');
const report = JSON.parse(fs.readFileSync(new URL('../report/skill-aesthetics-20261023/review-data.json', import.meta.url)));
const byId = new Map(report.rows.map(c => [c.id,c]));
const clone = value => structuredClone(value);
const round = value => Math.round(value * 1e6) / 1e6;
const pct = value => `${round(value * 100)}%`;
const basic = (type,value,extra={}) => ({type,value,trigger:'appearance',duration:'spin',target:'self',stacking:'additive',...extra});
const neighbor = anyOf => ({metric:'neighbors',filter:{anyOf,excludeSelf:true},op:'gte',value:1});
const baseAttacks = {
  '1001':1.5,'1004':1.8,'1005':1.8,'1006':1.8,'1009':1.6,'1101':1.8,'1104':2,'1105':1.75,'1106':1.6,'1108':1.75,
  '1203':2,'1208':2,'1202':1.75,'1110':2,'1111':1.8,'1207':1.75,'1210':1.6,'1211':1.5,'1215':1.5,'1217':2,
  '1218':1.8,'1222':1.5,'1301':2,'1303':1.8,'1304':1.75,'1306':1.8,'1307':1.75,'1309':1.8,'1313':1.8,
  '1403':1.5,'1406':1.8,'1409':2,dan_heng_pt:1.75,fugue:1.8,hysilens:1.8,cerydra:1.8,cyrene:1.8,yao_guang:1.75,
  evanescia:1.8,the_dahlia:1.8,announced_rin_tohsaka:1.8,aha:1.75,pearl:1.75,robin_summeretto:1.8,aventurine_waveflair:2,aeon_star_aha:1.8,
};
const attackPercentIds = new Set(['1202','1309','1313','announced_rin_tohsaka']);
function cleanFilter(object) {
  if (!object || typeof object !== 'object') return;
  for (const key of ['role','roleNot','temporary','commission']) delete object[key];
  for (const child of object.anyOf || []) cleanFilter(child);
}
function cleanText(text) {
  return text.replaceAll('伙伴','角色').replaceAll('威力','攻击力').replaceAll('永久成长','本局永久攻击力固定增加量')
    .replaceAll('成长','攻击力增加').replaceAll('永久编队','编队').replaceAll('临时角色','角色')
    .replaceAll('反击总伤害','造成的总伤害').replaceAll('敌人反击','敌方造成的伤害').replaceAll('退场','删除')
    .replace(/永久非培养角色/g,'角色').replace(/永久攻击力固定增加量\+/g,'攻击力永久增加');
}
function translateEffect(old,c) {
  const e=clone(old); delete e.scaleWithTraining;
  for (const filter of [e.filter,e.per?.filter,e.condition?.filter,...(e.conditions||[]).map(x=>x.filter)]) cleanFilter(filter);
  if(e.type==='powerMultiplier') {e.type=attackPercentIds.has(c.id)?'attackPercent':'damageBonus';e.value=round(e.value-1);e.stacking='additive';}
  if(e.type==='growth') e.type='attackGrowth';
  if(['heal','shield','healOverflowShield'].includes(e.type)) {e.attackRatio=true;e.value=round(e.value/c.baseAttack);delete e.scaleWithStars;}
  if(e.type==='damage') {e.attackType='followUp';if(e.target==='column')e.target='nearest';}
  if(e.per?.metric==='retirements') e.per.metric='lastTurnDeletions';
  // Attribute amounts printed on the skill are literal; stars already increase base attack.
  delete e.scaleWithStars; delete e.starFactors;
  e.summary=cleanText(e.summary);
  return e;
}
const characters=CHARACTERS.map(original=>{
  const c=clone(original), row=byId.get(c.id), attrs=row.cardAttributes;
  c.baseAttack=baseAttacks[c.id] ?? attrs.baseAttack.value;
  const m=attrs.attackMultiplier;
  c.normalAttack={pattern:({单体:'single',扩散:'blast',群体:'aoe'})[attrs.attackPattern],primary:m.primary||0,adjacent:m.adjacent||0,eachTarget:m.eachTarget||0};
  c.power=c.baseAttack;c.attack=c.normalAttack.pattern;c.kitVersion=8;c.recruitable=true;if(c.role==='trainer')c.roleLabel='永久强化';
  c.baseAttackByStar=[0,c.baseAttack,round(c.baseAttack*3),round(c.baseAttack*9)];
  c.effects=c.effects.map(e=>translateEffect(e,c));
  c.description=row.skillCopy;
  // Convert candidate holes into explicit initial coefficients, retaining one-star healing/shield starting amounts.
  let resources=c.effects.filter(e=>['heal','shield','healOverflowShield'].includes(e.type));
  let i=0;
  c.description=c.description.replace(/一定比例/g,()=>resources[i]?pct(resources[i++].value):'30%')
    .replace(/（(?:治疗与护盾技能倍率分别|护盾技能倍率|治疗技能倍率|比例)待定）/g,'');
  return c;
});
const get=id=>characters.find(c=>c.id===id);
function replace(id,effects,description) {const c=get(id);c.effects=effects;c.description=description;}
for(const id of ['1004','1106','1210']) {
  const c=get(id),old=c.effects[0], range=old.target==='column'?'column':'neighbors';
  c.effects[0]=basic('enemyVulnerability',old.value,{target:'nearest',condition:{metric:range,filter:{...old.filter,excludeSelf:true},op:'gte',value:1}});
}
for(const [id,multiplier] of [['1107',1.1],['1221',1.25]]) {
  const c=get(id),e=c.effects[0];e.trigger='afterEnemyAttack';e.stage='afterEnemyAttack';e.value=multiplier;e.oncePerSpin=true;e.snapshotConditions='beforeEnemyAttack';
  c.description=c.description.replace('技能倍率待定',`技能倍率${pct(multiplier)}`);
}
// Seele's extra attack is caused only by a normal-attack defeat. Her damage bonus keeps its neighbor condition.
delete get('1102').effects.find(e=>e.type==='damage').condition;
get('1102').effects.find(e=>e.type==='damage').normalAttackOnly=true;
get('1315').effects.find(e=>e.type==='damage').normalAttackOnly=true;
{
  const c=get('1112'),attack=c.effects[0],filter=clone(attack.per.filter);
  c.effects=[basic('enemyVulnerability',.25,{target:'nearest',attackType:'followUp',condition:{metric:'column',filter,op:'gte',value:1}}),attack];
  c.description=c.description.replace('受到的追加攻击伤害提高30%','受到的追加攻击伤害提高25%');
}
function linked(id,type,value,eventRange,eventFilter,extra={}) {
  return basic(type,value,{trigger:'afterNormalAttack',target:type==='heal'?'self':'nearest',duration:type==='heal'?'resource':'spin',
    ...(type==='heal'?{attackRatio:true}:{attackType:'followUp',scaleWithSourcePower:true}),eventRange,eventFilter,oncePerSpin:true,...extra});
}
replace('1223',[linked('1223','damage',.9,'enemyColumn',{excludeSelf:true},{target:'triggerEnemy',condition:{metric:'neighbors',op:'lte',value:1}})],
  '相邻角色不超过1名时，首次有其他角色以常规攻击命中本列敌人后，貊泽向该敌列发动1次追加攻击，技能倍率90%；每次转动最多1次。');
replace('1301',[linked('1301','heal',1.4,'adjacent',{anyOf:[{element:'火'},{path:'虚无'}],excludeSelf:true})],
  '本次转动，首次有相邻火或虚无角色发动常规攻击后，恢复等于加拉赫攻击力140%的队伍生命；每次转动最多1次。');
{
  const c=get('hysilens');c.effects[0]=linked(c.id,'damage',.7,'column',{anyOf:[{element:'物理'},{faction:'翁法罗斯'}],excludeSelf:true});
  c.description=c.description.replace('技能倍率待定','技能倍率70%');
}
{
  const c=get('aventurine_waveflair');
  replace(c.id,[linked(c.id,'damage',.45,'adjacent',{anyOf:[{faction:'星际和平公司'},{path:'欢愉'}],excludeSelf:true},{oncePerSpin:false,maxTriggersPerSpin:3,oncePerTriggerUnit:true})],
    c.description.replace('技能倍率待定','技能倍率45%'));
  c.role='attack';c.roleLabel='攻击';
}
{
  const c=get('robin_summeretto'),filter={anyOf:[{path:'记忆'},{element:'风'}],excludeSelf:true};
  c.effects=[basic('attackPercent',.3,{target:'adjacent',filter}),basic('damageBonus',.2,{target:'adjacent',filter:clone(filter),every:2,condition:{metric:'row',filter:clone(filter),op:'gte',value:2}})];
  c.description='相邻的记忆或风角色，本次转动攻击力提高30%。每第2次实际登场且同行至少2名其他记忆或风角色时，这些相邻角色本次转动造成的伤害再提高20%。';
  c.role='amplifier';c.roleLabel='即时辅助';
}
{
  const c=get('1409');c.effects[1].value=1.5;delete c.effects[1].per;
  c.description='相邻有记忆或风角色时，先恢复等于自身攻击力250%的队伍生命，再获得等于自身攻击力150%的护盾。';
}
get('1313').effects=get('1313').effects.slice(0,1);
{
  const c=get('1402'),e=c.effects.find(e=>e.type==='summon');e.characterId='garmentmaker';e.duration='run';e.rosterLimit=2;delete e.durationAppearances;
  c.description+='衣匠最多同时在册2名。';
}
// All current public labels remain eligible, including support characters and created characters.
for(const c of characters)for(const e of c.effects) {
  if(e.type==='attackGrowth' && e.target!=='self') e.filter.excludeSelf=true;
  if(e.type==='shieldMultiplier')e.stacking='additive';
  // The full canonical text lives on the character; each effect retains an independently readable diagnostic summary.
  if(e.type==='attackPercent')e.summary=`本次转动，符合条件的角色攻击力提高${pct(e.value)}`;
  if(e.type==='damageBonus')e.summary=`本次转动，符合条件的角色造成的伤害提高${pct(e.value)}`;
  if(e.type==='enemyVulnerability')e.summary=`本次转动，目标敌列受到的${e.attackType==='followUp'?'追加攻击':''}伤害提高${pct(e.value)}`;
  if(e.type==='attackGrowth')e.summary=`符合技能条件时，目标角色攻击力永久增加${e.value}（仅本局）`;
  if(e.type==='damage')e.summary=`符合技能条件时，发动1次追加攻击，技能倍率${pct(e.value)}${e.per&&e.per.metric!=='sourcePower'?'，按技能指定人数计算':''}`;
  if(e.attackRatio)e.summary=`符合技能条件时，${e.type==='shield'?'获得护盾':'恢复队伍生命'}，数值为自身攻击力的${pct(e.value)}${e.per?'，按技能指定人数计算':''}${e.type==='healOverflowShield'?'；溢出治疗转为护盾':''}`;
  if(e.type==='retaliationFlat')e.summary=`符合技能条件时，敌方本次转动造成的总伤害降低${e.value}点${e.per?'，按技能指定人数计算':''}`;
  if(e.type==='retaliationMultiplier')e.summary=`符合技能条件时，敌方本次转动造成的伤害降低${pct(1-e.value)}`;
  if(e.type==='summon')e.summary='符合技能条件时，创建1名衣匠，下次转动起可登场；最多同时在册2名';
}
const createdCharacters=[{
  id:'garmentmaker',name:'衣匠',enName:'Garmentmaker',assetId:1402,rarity:'common',attack:'single',power:1.5,baseAttack:1.5,
  baseAttackByStar:[0,1.5,4.5,13.5],normalAttack:{pattern:'single',primary:1.5,adjacent:0,eachTarget:0},
  path:'记忆',element:'雷',faction:'翁法罗斯',description:'累计登场2次后，在第2次登场的本次转动全部结算结束时，删除自身。',color:'#e879f9',
  effects:[basic('selfDelete',2,{trigger:'turnEnd',duration:'run',afterAppearances:2,summary:'累计登场2次后，在本次转动全部结算结束时删除自身',globalException:'角色自身存续规则，不对其他角色提供全场增益'})],
  adaptation:'本作改编角色；借用阿格莱雅现有官方素材作来源标识，不宣称为衣匠独立官方立绘',officialRarity:5,publicationStatus:'released',
  sourceUrl:'https://wiki.hoyolab.com/pc/hsr/entry/3286?lang=en-us',portraitKind:'shared-source',kitVersion:8,role:'attack',roleLabel:'攻击',recruitable:false,
}];

const items=clone(ITEMS),essences=clone(ESSENCES);
for(const row of [...items,...essences]) {
  row.kitVersion=8;row.description=cleanText(row.description);
  for(const e of row.effects) {
    delete e.legacy;
    if(e.type==='powerMultiplier') {e.type='damageBonus';e.value=round(e.value-1);e.stacking='additive';}
    if(e.type==='growthMultiplier') e.type='attackGrowthMultiplier';
    cleanFilter(e.filter);cleanFilter(e.condition?.filter);cleanFilter(e.per?.filter);
    e.summary=cleanText(e.summary);
  }
  // Conversion is expression-aware: a damage percentage is not an attack percentage.
  row.description=row.description.replace(/攻击力×([\d.]+)/g,(_,n)=>`造成的伤害${Number(n)>=1?'提高':'降低'}${pct(Math.abs(Number(n)-1))}`);
  for(const e of row.effects) {
    e.summary=e.summary.replace(/攻击力×([\d.]+)/g,(_,n)=>`造成的伤害${Number(n)>=1?'提高':'降低'}${pct(Math.abs(Number(n)-1))}`);
    if(['shieldMultiplier','healMultiplier'].includes(e.type))e.stacking='additive';
  }
}
const item=id=>items.find(x=>x.id===id),essence=id=>essences.find(x=>x.id===id);
function equipment(id,effects,description,isEssence=false){const row=(isEssence?essence:item)(id);row.effects=effects;row.description=description;}
const passive=(type,value,summary,extra={})=>basic(type,value,{trigger:'passive',duration:'whileOwned',target:'team',summary,...extra});
equipment('elation_wax',[passive('damageBonus',.25,'持有期间，我方角色的追加攻击造成的伤害提高25%',{attackType:'followUp'})],'持有期间，我方角色的追加攻击造成的伤害提高25%。');
equipment('nihility_wax',[passive('enemyVulnerability',.1,'有虚无角色登场的敌列，本次转动受到的伤害提高10%；每列只生效一次',{target:'occupiedColumns',filter:{path:'虚无'}})],'每次转动，有虚无角色登场的列，其对应敌人本次受到的伤害提高10%。同列有多名虚无角色时，该效果不重复叠加。');
equipment('gold_coin',[passive('power',.3,'所有登场角色的攻击力增加0.3；每次转动重新计算')],'持有期间，所有登场角色的攻击力增加0.3。每次转动重新计算，不累积。');
equipment('broken_clock',[passive('damageBonus',.2,'持有期间，我方角色造成的伤害提高20%'),basic('resource',2,{trigger:'acquire',duration:'resource',target:'team',resource:'rerolls',summary:'取得时获得2次重掷'})],'持有期间，我方角色造成的伤害提高20%。取得时获得2次重掷。');
equipment('rubert_gear',[passive('attackGrowthMultiplier',1.5,'角色通过技能获得的本局永久攻击力固定增量提高50%',{stacking:'multiplicative',source:'skill'})],'持有期间，角色通过技能获得的本局永久攻击力固定增量提高50%。已经获得的攻击力保留至本局结束。');
item('preservation_wax').description='持有期间，获得的护盾量提高50%。每个新关开始时，获得8点基础护盾；该数值再按护盾量加成结算。';
item('abundance_wax').description='持有期间，提供的治疗量提高50%。取得时恢复20点基础生命；该数值再按治疗量加成结算。';
equipment('evil_satellite',[basic('retaliationFlat',1,{trigger:'spin',target:'team',summary:'敌方本次转动在攻击阶段造成的总伤害降低1点'})],'每次转动，敌方在攻击阶段造成的总伤害降低1点。');
item('meteorite').description='每第4次转动，所有角色的常规攻击结算后，对所有存活敌人各造成2点伤害。';
item('meteorite').effects[0].summary='每第4次转动，常规攻击结算后对所有存活敌人各造成2点奇物伤害';
item('meteorite').effects[0].stage='afterAttacks';
equipment('divination_candle',[passive('synergyDamageMultiplier',1.5,'羁绊提供的伤害提高增量提高50%',{stacking:'multiplicative'})],'持有期间，羁绊提供的伤害提高增量提高50%。');
equipment('essence_nihility',[passive('enemyVulnerability',.15,'有虚无角色登场的敌列，本次转动受到的伤害提高15%；每列只生效一次',{target:'occupiedColumns',filter:{path:'虚无'},duration:'run'})],'取得后虚无角色累计登场8次：达标后从下次转动起，有虚无角色登场的敌列受到的伤害提高15%，每列只生效一次，本局持续。',true);
equipment('essence_elation_wax',[passive('damageBonus',.3,'角色追加攻击造成的伤害提高30%',{attackType:'followUp',duration:'run'})],'取得后累计发动12次追加攻击：达标后从下次转动起，角色追加攻击造成的伤害提高30%，本局持续。',true);
essence('essence_elation_wax').target=12;essence('essence_elation_wax').progress={metric:'followUpAttacks'};
for(const row of [...characters,...createdCharacters,...items,...essences]) {
  if(/待定|一定比例|伙伴|成长|临时角色|威力|反击[−-]/.test(row.description))throw new Error('Unresolved copy '+row.id+': '+row.description);
  for(const e of row.effects)if(/伙伴|成长|临时角色|威力|反击[−-]/.test(e.summary||''))throw new Error('Unresolved summary '+row.id+': '+e.summary);
}
const output=`// Content names and images reference HoYoverse material; all abilities are this game's adaptations.\nimport { SYNERGIES } from './synergies.js';\nexport { SYNERGIES };\nexport const RARITY_LABELS = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };\n\nexport const CHARACTERS = ${JSON.stringify(characters,null,2)};\n\nexport const CREATED_CHARACTERS = ${JSON.stringify(createdCharacters,null,2)};\n\nexport const ITEMS = ${JSON.stringify(items,null,2)};\n\nexport const ESSENCES = ${JSON.stringify(essences,null,2)};\n\nconst characters = new Map([...CHARACTERS, ...CREATED_CHARACTERS].map(c => [c.id, c]));\nexport const characterById = id => characters.get(String(id));\nexport const itemById = id => ITEMS.find(item => item.id === id);\nexport const essenceById = id => ESSENCES.find(essence => essence.id === id);\n`;
fs.writeFileSync(new URL('../src/content.js',import.meta.url),output);
console.log(`Applied ${characters.length} character kits, ${createdCharacters.length} created character, ${items.length} curios and ${essences.length} essences.`);
