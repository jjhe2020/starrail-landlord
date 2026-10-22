import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('.', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = portIndex === -1 ? 5178 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('端口必须是1至65535的整数');
const url = `http://127.0.0.1:${port}/#reviews`;
const healthPath = '/__skill_review_health';
const openRequested = process.argv.includes('--open');

function ready(reused = false) {
  console.log(`技能评审${reused ? '已在运行' : '已启动'}：${url}`);
  console.log('此入口仅本机可访问。关闭服务后，可双击“打开评审.command”重新开启。');
  if (openRequested && process.platform === 'darwin') {
    const opener = spawn('open', [url], { stdio: 'ignore' });
    opener.on('error', () => console.log(`请在浏览器打开：${url}`));
  }
}

// Serve only the report, never the surrounding private repository or arbitrary files.
const server = http.createServer(async (request, response) => {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { ...headers, Allow: 'GET, HEAD' }); response.end(); return;
  }
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === healthPath) {
    response.writeHead(200, { ...headers, 'Content-Type': 'application/json; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : JSON.stringify({ report: 'skill-aesthetics-20261023', root })); return;
  }
  if (pathname === '/favicon.ico') { response.writeHead(204, headers); response.end(); return; }
  if (!['/', '/index.html'].includes(pathname)) { response.writeHead(404, headers); response.end('Not found'); return; }
  try {
    const body = await readFile(new URL('index.html', import.meta.url));
    response.writeHead(200, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('评审文件读取失败，请确认 index.html 仍在本目录。');
  }
});

server.on('error', async error => {
  if (error.code === 'EADDRINUSE') {
    try {
      const response = await fetch(`http://127.0.0.1:${port}${healthPath}`, { signal: AbortSignal.timeout(1500) });
      const existing = await response.json();
      if (response.ok && existing.report === 'skill-aesthetics-20261023' && existing.root === root) { ready(true); return; }
    } catch { /* An unrelated process owns this port. Do not stop it. */ }
    console.error(`端口${port}已被其他服务使用。可运行 node preview.mjs --port 5179 另选端口。`);
  } else console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => ready());
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
