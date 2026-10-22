// Report integrity and interaction logic only; this does not render a browser.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { CHARACTERS, ITEMS } from '../../src/content.js';

const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const report=read('review-data.json');
const candidates=read('combat-per-character.json');
const cards=read('card-attributes.json');
const equipment=read('combat-equipment.json');
assert.equal(candidates.length,90);
assert.equal(new Set(candidates.map(r=>r.id)).size,90);
assert.equal(cards.length,90);
assert.equal(new Set(cards.map(r=>r.id)).size,90);
const forbidden=/伙伴|成长|临时角色|威力|轨道追击|旋转追击|反击[－−-]/;
for(const row of report.rows){
  const current=CHARACTERS.find(c=>c.id===row.id);
  assert.equal(row.description,current.description);
  const candidate=candidates.find(c=>c.id===row.id);
  for(const [key,value] of Object.entries(candidate)) assert.deepEqual(row[key],value,`${row.name}: stale ${key}`);
  assert.equal(row.name,current.name);
  for(const key of ['combatCopy','combatNote']) assert.ok(row[key]?.trim(),`${row.name}: ${key}`);
  assert.ok(!forbidden.test(row.combatCopy),`${row.name}: old rule terminology in latest draft`);
  assert.ok(row.combatTags.length>0);
  for(const key of ['pattern','coefficients','reason']) assert.ok(row.attackProfile[key],`${row.name}: attackProfile.${key}`);
  assert.equal(row.combatRuleChange,true,'Shared combat model is a rule change');
  const card=cards.find(c=>c.id===row.id);
  assert.deepEqual(row.cardAttributes,card);
  assert.ok(row.skillCopy?.trim());
  assert.ok(!/^常规攻击为|其攻击力、攻击方式与技能倍率待定|衣匠自身技能：/.test(row.skillCopy),`${row.name}: intrinsic properties in skill text`);
  assert.ok(!forbidden.test(row.skillCopy));
  for(const key of ['attackPattern','attributeRationale','balanceStatus']) assert.ok(card[key]);
  for(const key of ['label','basis']) assert.ok(card.baseAttack[key]);
  assert.ok(card.attackMultiplier.label);
  if(current.role==='attack') assert.equal(card.baseAttack.value,current.power);
  else {assert.equal(card.baseAttack.value,null);assert.ok(card.attackMultiplier.primary>0);}
}
assert.ok(report.rows.filter(r=>r.role!=='attack').some(r=>r.cardAttributes.attackMultiplier.primary<.2));
assert.ok(report.rows.filter(r=>r.role!=='attack').some(r=>r.cardAttributes.attackMultiplier.primary>.25));
assert.ok(report.rows.find(r=>r.id==='1402').skillCopy.endsWith('下次转动起可登场。'));
assert.equal(equipment.rows.length,10);
for(const row of equipment.rows){
  const current=ITEMS.find(item=>item.id===row.id);
  assert.ok(current, row.id);
  assert.equal(row.current,current.description);
  assert.deepEqual(row.currentEffects,current.effects);
  assert.ok(!forbidden.test(row.proposal),row.name);
}
for(const source of equipment.sources){
  assert.equal(new URL(source.url).protocol,'https:');
  for(const key of ['title','kind','supports','access']) assert.ok(source[key]);
}

const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const markup=html.slice(0,html.indexOf('<script>'));
const tags=[...markup.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)];
assert.equal(new Set(tags.map(m=>m[1])).size,tags.length,'Duplicate static ids');
const elements=new Map(tags.map(([tag,id])=>[id,{
  value:tag.match(/\bvalue="([^"]*)"/)?.[1]||'',
  max:tag.match(/\bmax="([^"]*)"/)?.[1]||'',
  checked:false,innerHTML:'',textContent:'',listeners:{},
  addEventListener(event,handler){this.listeners[event]=handler;}
}]));
elements.get('sort').value='roster';
elements.get('calc-kind').value='ordinary';
let exportedBlob;
const context=vm.createContext({
  document:{getElementById(id){assert.ok(elements.has(id),`Unknown DOM target ${id}`);return elements.get(id);},createElement(){return {click(){}};}},
  location:{hash:''},requestAnimationFrame:fn=>fn(),setTimeout:fn=>fn(),Blob,
  URL:{createObjectURL(blob){exportedBlob=blob;return 'blob:report-verification';},revokeObjectURL(){}},Intl,console
});
vm.runInContext(script,context);
const evaluate=expression=>vm.runInContext(expression,context);
assert.equal(evaluate('filteredRows.length'),90);
assert.equal((elements.get('rows').innerHTML.match(/id="character-/g)||[]).length,90);
elements.get('follow-up').checked=true;
evaluate('render()');
assert.equal(evaluate('filteredRows.length'),report.rows.filter(r=>r.combatTags.some(tag=>tag.includes('追加攻击'))).length);
assert.ok(evaluate('filteredRows.length')>0);
elements.get('reset').listeners.click();
assert.equal(evaluate('filteredRows.length'),90);
elements.get('search').value='1112';
elements.get('search').listeners.input();
assert.equal(evaluate('filteredRows.length'),1);
elements.get('export').listeners.click();
assert.ok((await exportedBlob.text()).includes('托帕'));
assert.ok((await exportedBlob.text()).includes('技能正文候选'));
assert.ok((await exportedBlob.text()).includes('一星基础攻击力候选'));
elements.get('reset').listeners.click();
const result=evaluate("calculateCombat({base:10,flat:2,atk:20,skill:300,damage:30,follow:40,vulnerable:10,kind:'ordinary'})");
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} vs ${b}`);
near(result.atk,14.4);near(result.damage,61.776);near(result.heal,11.52);near(result.shield,17.28);
const follow=evaluate("calculateCombat({base:10,flat:2,atk:20,skill:300,damage:30,follow:40,vulnerable:10,kind:'followUp'})");
near(follow.damage,80.784);near(follow.heal,result.heal);near(follow.shield,result.shield);
const support=evaluate("calculateCombat({base:10,flat:0,atk:0,skill:20,damage:0,follow:0,vulnerable:0,kind:'ordinary'})");
near(support.damage,2);
const summary={revision:report.revision,characters:90,equipment:10,originalDescriptions:'exact match',latestTerminology:'passed',htmlIds:'unique',reportInteractions:'90 rows; follow-up filter; search; reset; CSV export passed in isolated JS harness',calculator:'three independent axes; follow-up only bonus; support 20% final multiplier; healing and shield unaffected by damage bonuses passed',browserRendering:'not performed this round; no desktop or mobile visual acceptance claimed',gameChanges:false};
summary.intrinsicAttributes='90 profiles match source; all latest skill text excludes default attack description; child attributes separated';
summary.supportMultipliers='46 individually proposed values and reasons; values below 20% and above 25%; no uniform range asserted; not balance-tested';
fs.writeFileSync(path.join(dir,'combat-verification.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
