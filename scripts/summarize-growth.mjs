import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { summarizeGrowthCampaigns, renderGrowthMarkdown } from '../src/growth-report.js';

const args = process.argv.slice(2), inputs = [];
let output = 'docs/benchmarks/card-growth-v060-summary.json.gz', markdown = 'docs/CARD-GROWTH-V060.md';
for (let index = 0; index < args.length; index++) {
  const key = args[index], value = args[++index];
  if (!value || value.startsWith('--')) throw new Error('Use --input path (repeatable), --output path, --markdown path.');
  if (key === '--input') inputs.push(resolve(value));
  else if (key === '--output') output = value;
  else if (key === '--markdown') markdown = value;
  else throw new Error(`Unknown option ${key}`);
}
if (!inputs.length) throw new Error('At least one --input .campaigns.json.gz is required.');
const batches = await Promise.all(inputs.map(async path => ({ path, ...JSON.parse(gunzipSync(await readFile(path))) })));
const sourceHashes = batches[0].manifest.sourceHashes;
const measuredVersion = batches[0].manifest.measuredVersion;
if (!measuredVersion || batches.some(batch => batch.manifest.measuredVersion !== measuredVersion)) throw new Error('All batches must measure the same explicitly recorded game version.');
for (const batch of batches) {
  if (!batch.manifest.sourceStable || JSON.stringify(batch.manifest.sourceHashes) !== JSON.stringify(sourceHashes)) throw new Error('All batches must share stable frozen simulation sources.');
  if (batch.campaigns.some(campaign => campaign.stopped)) throw new Error('Incomplete campaigns require investigation before final report.');
  for (const [file, hash] of Object.entries(sourceHashes)) {
    const actual = createHash('sha256').update(await readFile(new URL(`../${file}`, import.meta.url))).digest('hex');
    if (actual !== hash) throw new Error(`Source drift: ${file}`);
  }
}
const aggregationSources = ['src/growth-report.js', 'scripts/summarize-growth.mjs'];
const aggregationHashes = Object.fromEntries(await Promise.all(aggregationSources.map(async path => [path, createHash('sha256').update(await readFile(new URL(`../${path}`, import.meta.url))).digest('hex')])));
const report = summarizeGrowthCampaigns(batches.flatMap(batch => batch.campaigns), { cards: batches[0].manifest.metadata, measuredVersion, date: '2026-10-21', sourceStable: true, sourceHashes, aggregationHashes, protocol: batches[0].manifest.protocol, batches: batches.map(({ path, manifest }) => ({ file: path, seed: manifest.seed, difficulty: manifest.difficulty, n: manifest.n, runsPerStrategy: manifest.runsPerStrategy, coverageRunsPerTarget: manifest.coverageRunsPerTarget, elapsedMs: manifest.elapsedMs })) });
for (const path of [output, markdown]) await mkdir(dirname(resolve(path)), { recursive: true });
await writeFile(output, output.endsWith('.gz') ? gzipSync(JSON.stringify(report)) : JSON.stringify(report, null, 2) + '\n');
const reproduction = `\n## 来源与复现\n\n测量版本 ${measuredVersion}；所有采样批次使用同一冻结引擎、内容和AI参数。采样默认关闭四棋盘前瞻，不能用本实验胜率代替页面完整代打的发行验收。每场使用独立种子；所有批次的 ${Object.keys(sourceHashes).length} 个模拟源码指纹一致，并与当前文件重新校验通过。\n\n原始逐局记录：\n\n${batches.map(batch => `- ${batch.path}`).join('\n')}\n\n复现各批次：\n\n\`\`\`sh\n${batches.map(({ manifest }) => `node scripts/growth-balance.mjs --runs ${manifest.runsPerStrategy} --coverage-runs ${manifest.coverageRunsPerTarget} --workers 8${manifest.coverageRunsPerTarget && manifest.targets.length < manifest.metadata.length ? ' --cards ' + manifest.targets.join(',') : ''} --difficulty ${manifest.difficulty} --seed ${manifest.seed} --output docs/benchmarks/REPRODUCE-${manifest.seed}-d${manifest.difficulty}.json`).join('\n')}\n\`\`\`\n\n本报告仅为冻结规则下的诊断结果；它不证明新的平衡变动已完成玩家体验验收。\n`;
await writeFile(markdown, renderGrowthMarkdown(report) + reproduction);
for (const group of report.groups) {
  const minimum = Math.min(...group.cards.map(card => card.endHeld));
  console.log(JSON.stringify({ difficulty: group.difficulty, cohort: group.cohort, n: group.n, wins: group.wins, defeats: group.defeats, minEndHeld: minimum, cardsAt100: group.cards.filter(card => card.endHeld >= 100).length, preciseDamage: group.cards.filter(card => card.precision.damagePerAppearance.precise).length, cardsBelow30: group.cards.filter(card => card.endHeld < 30).map(card => ({ id: card.id, name: card.name, n: card.endHeld })) }));
}
console.log(`Report ${resolve(output)}; Markdown ${resolve(markdown)}`);
