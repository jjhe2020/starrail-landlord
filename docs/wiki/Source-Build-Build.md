# 冻结实现：scripts/build.mjs

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`scripts/build.mjs`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：968
- SHA-256：`d26e9cab3b515b4959abf6876f442d6aae5472a9c2d7c02fe2c68f195234ad5b`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/scripts/build.mjs#L1)

<!-- frozen-source:start -->
````````````````javascript
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOfflineBuild } from './offline-assets.mjs';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
if (!output.startsWith(root + sep)) throw new Error('Build output must stay inside the project workspace.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'styles.css', 'manifest.webmanifest', 'src', 'public']) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
const offline = await createOfflineBuild(output);
await writeFile(resolve(output, 'service-worker.js'), offline.worker);
console.log(`Built static game to dist/ with ${offline.assets.length} offline assets · ${offline.version.slice(0, 12)} — compatible with subdirectory hosting.`);
````````````````
<!-- frozen-source:end -->
