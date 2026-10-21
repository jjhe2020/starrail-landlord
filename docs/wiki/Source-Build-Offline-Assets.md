# 冻结实现：scripts/offline-assets.mjs

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`scripts/offline-assets.mjs`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：2458
- SHA-256：`57aab813915a9bd40455010c0cee3078806f103f948acf000fc8b2c7d41e0a21`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/scripts/offline-assets.mjs#L1)

<!-- frozen-source:start -->
````````````````javascript
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const marker = '/* OFFLINE_BUILD */ null';
const digest = value => createHash('sha256').update(value).digest('hex');

async function filesBelow(root, directory) {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await filesBelow(root, path));
    else if (entry.isFile()) result.push(path);
    // Symlinks are intentionally excluded, just like private server paths.
  }
  return result;
}

export async function createOfflineBuild(root = projectRoot, { templateRoot = projectRoot } = {}) {
  const template = await readFile(resolve(templateRoot, 'service-worker.js'), 'utf8');
  if (!template.includes(marker)) throw new Error('Offline worker template is missing its build marker.');
  const files = [
    'index.html', 'styles.css', 'manifest.webmanifest',
    ...(await filesBelow(root, 'src')).filter(path => path.endsWith('.js')),
    ...await filesBelow(root, 'public'),
  ].sort();
  for (const required of ['src/app.js', 'src/offline.js', 'src/ai-worker.js', 'public/icons/icon-192.png', 'public/icons/icon-512.png', 'public/icons/maskable-512.png']) {
    if (!files.includes(required)) throw new Error(`Offline runtime asset is missing: ${required}`);
  }
  const contents = await Promise.all(files.map(path => readFile(resolve(root, path))));
  const assets = files.map((path, index) => ({ url: `./${path}`, sha256: digest(contents[index]) }));
  // Include worker behavior as well as every runtime asset. The package version
  // does not determine offline releases, and editing one portrait changes this ID.
  const version = digest(JSON.stringify({ template, assets }));
  // Hosting platforms can redirect index.html or inject scripts into HTML.
  // Carry the authored shell in this JavaScript response instead, preserving
  // the exact page body already covered by its asset digest.
  const indexHtml = contents[files.indexOf('index.html')].toString('utf8');
  const build = { version, assets, indexHtml };
  return { ...build, worker: template.replace(marker, JSON.stringify(build)) };
}
````````````````
<!-- frozen-source:end -->
