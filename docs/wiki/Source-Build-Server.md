# 冻结实现：scripts/server.mjs

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`scripts/server.mjs`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：3167
- SHA-256：`ce97ebdeaafc6a405e7776f9b775a8a18f62a396ccef3074008b3445e0dc5feb`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/scripts/server.mjs#L1)

<!-- frozen-source:start -->
````````````````javascript
import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOfflineBuild } from './offline-assets.mjs';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const root = process.argv.includes('--dist') ? resolve(projectRoot, 'dist') : projectRoot;
const realRoot = await realpath(root);
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 5173);
const host = process.argv.includes('--host') ? '0.0.0.0' : '127.0.0.1';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain; charset=utf-8' };
const isServablePath = path => !path.includes('\\') && !path.includes('\0') &&
  /^(?:index\.html$|styles\.css$|manifest\.webmanifest$|service-worker\.js$|src\/.+|public\/.+)/.test(path) &&
  !path.split('/').some(part => part.startsWith('.'));
const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    // Decode once, then reject Windows separators before resolving a URL path.
    // Otherwise public/%5c..%5c.git%5cconfig can leave the public directory.
    if (!isServablePath(relativePath)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    if (relativePath === 'service-worker.js' && root === projectRoot) {
      const offline = await createOfflineBuild(root);
      res.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : offline.worker);
      return;
    }
    const file = resolve(root, relativePath);
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const realFile = await realpath(file);
    if (!realFile.startsWith(realRoot + sep) || !isServablePath(relative(realRoot, realFile).split(sep).join('/'))) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const body = await readFile(realFile);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, host, () => console.log(`Starrail Landlord · http://localhost:${server.address().port}\n${host === '0.0.0.0' ? 'LAN access enabled on this port.' : 'Use npm run dev -- --host for phone access on the same Wi-Fi.'}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
````````````````
<!-- frozen-source:end -->
