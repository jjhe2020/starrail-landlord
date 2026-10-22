import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { termReview } from './review-additions.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const snapshot = read('current-skills.json');
const report = read('review-data.json');
const manifest = read('source-manifest.json');
const { CHARACTERS } = await import(path.join(root, 'src/content.js'));
assert.deepEqual(CHARACTERS, snapshot.characters, '角色定义已漂移');
assert.equal(report.rows.length, 90);
assert.equal(new Set(report.rows.map(r => r.id)).size, 90);
const allReviews = ['review-01-30.json','review-31-60.json','review-61-90.json'].flatMap(read);
const allLore = ['lore-01-45.json','lore-46-90.json'].flatMap(read);
assert.equal(allLore.length,90);
assert.equal(new Set(allLore.map(r=>r.id)).size,90);
for (const [i, row] of report.rows.entries()) {
  assert.equal(row.id, CHARACTERS[i].id);
  assert.equal(row.description, CHARACTERS[i].description);
  for (const key of ['identity','critique','copy','proposal','caution','copyBasis']) assert.ok(row[key]?.trim(), `${row.name}: ${key}`);
  for (const key of ['elegance','clarity']) assert.ok(Number.isInteger(row[key]) && row[key] >= 1 && row[key] <= 5);
  assert.ok(['保留打磨','优先润色','建议精简','建议重构'].includes(row.verdict));
  assert.ok(['仅文案','机制候选'].includes(row.changeKind));
  const review = allReviews.find(r => r.id === row.id);
  for (const key of Object.keys(review)) assert.deepEqual(row[key], review[key], `${row.name}: 评审数据陈旧`);
  if (row.mismatch) assert.notEqual(row.copyBasis, '等义润色');
  const lore = allLore.find(r=>r.id===row.id);
  for (const key of Object.keys(lore)) assert.deepEqual(row[key],lore[key],`${row.name}: 剧情数据陈旧`);
  assert.ok(['有依据','可接受改编','联系偏弱','需重构','身份待核实'].includes(row.loreStatus));
  assert.ok(['较高','中等','待核实'].includes(row.loreConfidence));
  for(const key of ['loreComment','loreProposal','termCopy','termNote','termStatus']) assert.ok(row[key]?.trim(),`${row.name}: ${key}`);
  assert.ok(row.loreSources.length>0,`${row.name}: 缺少剧情来源`);
  for(const source of row.loreSources){
    for(const key of ['title','url','kind','supports']) assert.ok(source[key]?.trim(),`${row.name}: source.${key}`);
    assert.equal(new URL(source.url).protocol,'https:');
    assert.ok(['官方','游戏文本转载','第三方资料'].includes(source.kind));
  }
  const term = termReview(CHARACTERS[i],review);
  for(const key of Object.keys(term)) assert.deepEqual(row[key],term[key],`${row.name}: 术语草案陈旧`);
  assert.ok(!/伙伴|成长|临时角色|临时攻击/.test(row.termCopy),`${row.name}: 仍含撤回术语`);
  if(row.role==='trainer'){
    const effect=row.effects.find(e=>e.type==='growth');
    for(const filter of effect.filter.anyOf){
      const tag=filter.element||filter.path||filter.faction;
      if(row.id==='yao_guang' && tag.startsWith('仙舟')) continue;
      assert.ok(row.termCopy.includes(tag),`${row.name}: 新草案丢失公开标签${tag}`);
    }
    assert.ok(row.termCopy.includes('攻击角色'));
    assert.equal(row.termRuleChange,true);
  }
}
assert.equal(report.rows.filter(r=>r.termRuleChange).length,12);
assert.equal(report.rows.filter(r=>r.createdCharacter).length,1);
assert.ok(report.rows.find(r=>r.id==='1402').createdCharacter.skill.includes('删除自身'));
for (const entry of manifest.files) {
  const body = execFileSync('git', ['show', `${snapshot.commit}:${entry.file}`], {cwd:root});
  assert.equal(crypto.createHash('sha256').update(body).digest('hex'), entry.snapshotCommitSha256);
}
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script);
const embedded = JSON.parse(script.match(/const REPORT = (.+);\n/)[1]);
assert.deepEqual(embedded, report);
assert.ok(!/<script[^>]+src=|<link[^>]+(?:stylesheet|preload)|<img\b|\bfetch\(/i.test(html), '不应依赖外部加载');
const summary = {date: snapshot.date, revision:report.revision, reviewedSnapshotVersion: snapshot.version, workspaceVersionAtBuild:report.workspaceVersionAtBuild, characters:90, descriptionMatches:90, loreReviews:90, loreReferences:report.rows.reduce((sum,r)=>sum+r.loreSources.length,0), terminologyRuleCandidates:12, newCopyUsesUnifiedTerms:true, fieldsAndRanges:'pass', standaloneScript:'syntax passed; embedded dataset identical', baselineHashes:'all pass', semanticReviewCount:report.rows.filter(r=>r.mismatch).length, sourceEffectsRemainUnchanged:true};
fs.writeFileSync(path.join(dir, 'integrity-verification.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary));
