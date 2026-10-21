# 冻结实现：scripts/build-portable.mjs

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`scripts/build-portable.mjs`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：6541
- SHA-256：`6cf9b0a1390ca2dddd8a23974f974a37d4585c36949c70310b764222697a44f3`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/scripts/build-portable.mjs#L1)

<!-- frozen-source:start -->
````````````````javascript
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mimeTypes = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.json': 'application/json', '.txt': 'text/plain;charset=utf-8',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
};

// An inline script must never contain an HTML closing-script token, even inside a JS string.
export function escapeInlineScript(source) {
  return String(source)
    .replace(/<\/script/gi, match => `<\\/${match.slice(2)}`)
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

async function loadEsbuild(root, provided) {
  if (provided?.build) return provided;
  const require = createRequire(resolve(root, 'package.json'));
  try {
    const module = require('esbuild');
    if (typeof module.build === 'function') return module;
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  throw new Error('离线单文件构建需要 esbuild。请先运行 npm ci 安装项目开发依赖，再运行 npm run build:portable。');
}

async function publicAssets(root) {
  const assets = {};
  async function visit(directory, prefix) {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      const key = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) await visit(path, key);
      else if (entry.isFile()) {
        const mime = mimeTypes[extname(entry.name).toLowerCase()] || 'application/octet-stream';
        assets[key] = `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
      } else throw new Error(`离线资源必须是普通文件，不能使用链接：${key}`);
    }
  }
  await visit(resolve(root, 'public'), 'public');
  return assets;
}

function embeddedAsset(reference, assets) {
  const key = reference.trim().replace(/^\.\//, '').replace(/^\//, '');
  const asset = assets[key];
  if (!asset) throw new Error(`离线单文件缺少资源：${reference}`);
  return asset;
}

function inlineStyles(css, assets) {
  if (/@import\b/i.test(css)) throw new Error('离线单文件样式不能包含 @import，请将样式合并后再构建。');
  return css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi, (match, double, single, plain) => {
    const reference = double ?? single ?? plain;
    if (/^(?:data:|#)/i.test(reference)) return match;
    return `url("${embeddedAsset(reference, assets)}")`;
  }).replace(/<\/style/gi, '<\\/style');
}

function inlineDocument(index, css, config, application) {
  let html = index
    .replace(/<link\b[^>]*\brel\s*=\s*["']manifest["'][^>]*>\s*/gi, '')
    .replace(/<meta\b[^>]*\bname\s*=\s*["'](?:apple-mobile-web-app-[^"']*|mobile-web-app-capable)["'][^>]*>\s*/gi, '')
    .replace(/<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*>/gi, () => `<style>${css}</style>`)
    .replace(/<script\b[^>]*\bsrc\s*=\s*["'][^"']*["'][^>]*>\s*<\/script>\s*/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>星穹转轮 v${config.version} · 离线单文件版</title>`);
  html = html.replace(/(<link\b[^>]*\bhref\s*=\s*)(["'])([^"']+)\2/gi, (match, prefix, quote, reference) => {
    return `${prefix}${quote}${embeddedAsset(reference, config.assets)}${quote}`;
  });
  const boot = `<script>globalThis.__ASTRAL_PORTABLE__=${escapeInlineScript(JSON.stringify(config))};</script>\n<script>${escapeInlineScript(application)}</script>`;
  if (!/<\/body>/i.test(html)) throw new Error('离线单文件入口缺少 </body>。');
  return html.replace(/<\/body>/i, () => `${boot}\n  </body>`);
}

/** Build the file-transfer edition; does not alter the normal website/PWA output. */
export async function buildPortable({ root = projectRoot, out, esbuild: providedEsbuild } = {}) {
  root = resolve(root);
  const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('离线单文件构建需要有效的 package.json 版本号。');
  }
  const output = resolve(out ?? resolve(root, 'artifacts', `星穹转轮-v${version}.html`));
  if (extname(output).toLowerCase() !== '.html') throw new Error('离线单文件输出路径必须以 .html 结尾。');
  const esbuild = await loadEsbuild(root, providedEsbuild);
  const options = {
    absWorkingDir: root, bundle: true, write: false, format: 'iife', platform: 'browser',
    target: ['es2020'], charset: 'ascii', sourcemap: false, minifySyntax: true,
    legalComments: 'inline', logLevel: 'silent',
  };
  const [appBundle, workerBundle, index, stylesheet, assets] = await Promise.all([
    esbuild.build({
      ...options, entryPoints: ['src/app.js'],
      // The true flag removes website-only worker creation; the fixed URL avoids a pre-removal import.meta warning.
      define: { 'globalThis.__ASTRAL_PORTABLE_BUILD__': 'true', 'import.meta.url': '"file:///astral-reels-portable.js"' },
    }),
    esbuild.build({ ...options, entryPoints: ['src/ai-worker.js'] }),
    readFile(resolve(root, 'index.html'), 'utf8'),
    readFile(resolve(root, 'styles.css'), 'utf8'),
    publicAssets(root),
  ]);
  const application = appBundle.outputFiles[0].text;
  const workerSource = workerBundle.outputFiles[0].text;
  const config = { format: 'astral-reels-single-file-v1', version, assets, workerSource };
  const html = inlineDocument(index, inlineStyles(stylesheet, assets), config, application);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, 'utf8');
  return { output, version, assetCount: Object.keys(assets).length, bytes: Buffer.byteLength(html), html, assets, workerSource };
}

const isEntrypoint = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const result = await buildPortable({ out: process.argv[2] });
  console.log(`离线单文件已生成：${result.output} · ${(result.bytes / 1024 / 1024).toFixed(2)} MB · ${result.assetCount} 个内嵌资源（含来源和许可记录）。`);
}
````````````````
<!-- frozen-source:end -->
