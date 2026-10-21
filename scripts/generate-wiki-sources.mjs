import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'docs/wiki');
const baseline = 'e5557f8d6b3ee0a0c308c5a3ca0481d3701db229';
const check = process.argv.includes('--check');
const sources = [
  ...(await readdir(path.join(root, 'src'))).filter(f => f.endsWith('.js')).map(f => `src/${f}`),
  'index.html', 'styles.css', 'service-worker.js', 'manifest.webmanifest', 'VERSION',
  'package.json', 'package-lock.json', 'scripts/build.mjs', 'scripts/build-portable.mjs',
  'scripts/offline-assets.mjs', 'scripts/server.mjs',
].sort();
const slug = file => file === 'manifest.webmanifest' ? 'Source-App-Manifest' : `Source-${file.replace(/^src\//, '').replace(/^scripts\//, 'Build-').replace(/\.(js|mjs|html|css|json|webmanifest)$/, '').split(/[-_]/).map(s => s[0].toUpperCase() + s.slice(1)).join('-')}`;
const descriptions = {
  'src/engine.js': '战斗、资源、奖励、敌人、状态与存档校验的最终执行算法',
  'src/content.js': '完整内容定义（含非执行的说明元数据和素材路径引用，不含图片文件）',
  'src/effect-rules.js': '条件、筛选、指标、目标、效果数值和来源顺序',
  'src/synergies.js': '正式羁绊激活、分档与公开概率估算',
  'src/enemy-effects.js': '全部条款、适用性、培养与职能修正',
  'src/ai.js': '静态评估、反事实试算、softmax 与动作规划完整公式',
  'src/app.js': 'DOM、面板、输入、当前旅程代打与持久化',
};
let failures = 0;
async function output(name, value) {
  const dest = path.join(out, name);
  if (check) {
    if (await readFile(dest, 'utf8').catch(() => null) !== value) { console.error(`Stale wiki source: ${name}`); failures++; }
  } else { await mkdir(path.dirname(dest), { recursive: true }); await writeFile(dest, value); }
}
const manifest = { version: '0.7.0', baselineCommit: baseline, sources: [] };
for (const file of sources) {
  // Freeze the released implementation, rather than silently snapshotting a later checkout.
  const raw = execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root });
  const source = raw.toString('utf8');
  const sha256 = createHash('sha256').update(raw).digest('hex');
  const page = slug(file);
  const lang = file.endsWith('.css') ? 'css' : file.endsWith('.html') ? 'html' : /\.(json|webmanifest)$/.test(file) ? 'json' : /\.(js|mjs)$/.test(file) ? 'javascript' : 'text';
  manifest.sources.push({ path: file, page, bytes: raw.length, sha256 });
  await output(`${page}.md`, `# 冻结实现：${file}\n\n> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)\n\n${descriptions[file] || '本版运行、展示、构建或评测所用的精确实现。'}\n\n本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。\n\n- 原文件：\`${file}\`\n- 固定提交：\`${baseline}\`\n- 原始 UTF-8 字节数：${raw.length}\n- SHA-256：\`${sha256}\`\n- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/${baseline}/${file}#L1)\n\n<!-- frozen-source:start -->\n\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`${lang}\n${source}${source.endsWith('\n') ? '' : '\n'}\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`\n<!-- frozen-source:end -->\n`);
}
await output('data/source-manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
await output('Source-Manifest.md', `# 冻结算法与复原清单\n\n> v0.7.0 · [复原指南](Reproduction) · [机制百科](Mechanics) · [内容库](Cards)\n\n以下 ${sources.length} 个文件均逐字取自发布基线 \`${baseline}\`。代码与配置可从每页标记的围栏中提取，按“原文件”路径保存；恢复时校验 UTF-8 字节数与 SHA-256。美术文件不在此附录，允许替换为占位图。正文机制页解释规则，附录冻结准确遍历、异常校验和策略估算的细节。\n\n| 原文件 | Wiki 附录 | 字节 | SHA-256 |\n| --- | --- | ---: | --- |\n${manifest.sources.map(x => `| \`${x.path}\` | [读取](${x.page}) | ${x.bytes} | \`${x.sha256}\` |`).join('\n')}\n\n## 机器可读清单\n\n\`\`\`json\n${JSON.stringify(manifest, null, 2)}\n\`\`\`\n`);
if (failures) process.exitCode = 1;
else console.log(`${check ? 'Verified' : 'Generated'} ${sources.length} frozen source pages and manifest at v${manifest.version}.`);
