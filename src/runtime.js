const portableConfig = globalThis.__ASTRAL_PORTABLE__;
export const IS_PORTABLE = globalThis.__ASTRAL_PORTABLE_BUILD__ === true || portableConfig?.format === 'astral-reels-single-file-v1';
// Both flags are replaced with literals by the release builders so development
// panels and their dependencies can be removed from the player application.
// The second flag is set only by development.html for unbundled local testing.
export const IS_DEVELOPMENT = globalThis.__ASTRAL_DEVELOPMENT_BUILD__ === true || globalThis.__ASTRAL_DEVELOPMENT__ === true;
let portableWorkerUrl;

export function assetUrl(path) {
  if (!IS_PORTABLE) return path;
  const embedded = portableConfig?.assets?.[path.replace(/^\.\//, '')];
  if (typeof embedded !== 'string' || !embedded.startsWith('data:')) throw new Error(`单文件资源缺失：${path}`);
  return embedded;
}

export function createAiWorker() {
  if (!IS_DEVELOPMENT) throw new Error('AI 测试工具仅在开发版提供。');
  if (!IS_PORTABLE) return new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
  if (typeof portableConfig?.workerSource !== 'string') throw new Error('单文件 AI 未打包。');
  portableWorkerUrl ||= URL.createObjectURL(new Blob([portableConfig.workerSource], { type: 'text/javascript' }));
  // A classic bundled worker avoids module imports from local-file origins.
  return new Worker(portableWorkerUrl);
}
