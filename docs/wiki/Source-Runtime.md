# 冻结实现：src/runtime.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/runtime.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：968
- SHA-256：`15e92774219913ded4aacf8d36ba84828472f5f965377c2293518909a13a0045`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/runtime.js#L1)

<!-- frozen-source:start -->
````````````````javascript
const portableConfig = globalThis.__ASTRAL_PORTABLE__;
export const IS_PORTABLE = globalThis.__ASTRAL_PORTABLE_BUILD__ === true || portableConfig?.format === 'astral-reels-single-file-v1';
let portableWorkerUrl;

export function assetUrl(path) {
  if (!IS_PORTABLE) return path;
  const embedded = portableConfig?.assets?.[path.replace(/^\.\//, '')];
  if (typeof embedded !== 'string' || !embedded.startsWith('data:')) throw new Error(`单文件资源缺失：${path}`);
  return embedded;
}

export function createAiWorker() {
  if (!IS_PORTABLE) return new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
  if (typeof portableConfig?.workerSource !== 'string') throw new Error('单文件 AI 未打包。');
  portableWorkerUrl ||= URL.createObjectURL(new Blob([portableConfig.workerSource], { type: 'text/javascript' }));
  // A classic bundled worker avoids module imports from local-file origins.
  return new Worker(portableWorkerUrl);
}
````````````````
<!-- frozen-source:end -->
