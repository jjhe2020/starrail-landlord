import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, unlink, rmdir, symlink } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('static server serves the game and refuses private files and traversal', { timeout: 15000 }, async t => {
  const publicFixture = await mkdtemp(resolve(root, 'public', 'server-security-'));
  const privateFixture = await mkdtemp(resolve(tmpdir(), 'starrail-server-secret-'));
  const suffixFile = resolve(root, `index.html.${basename(publicFixture)}`);
  const secretFile = resolve(privateFixture, 'secret.txt');
  const linkFile = resolve(publicFixture, 'outside.txt');
  const internalLink = resolve(publicFixture, 'private-package.json');
  await writeFile(secretFile, 'PRIVATE TEST FIXTURE');
  await writeFile(suffixFile, 'PRIVATE TOP-LEVEL FIXTURE');
  const links = [];
  let hasSymlink = false;
  try {
    await symlink(secretFile, linkFile, 'file');
    links.push(linkFile);
    await symlink(resolve(root, 'package.json'), internalLink, 'file');
    links.push(internalLink);
    hasSymlink = true;
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
  }
  const child = spawn(process.execPath, ['scripts/server.mjs', '--port', '0'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const base = await new Promise((resolveStartup, rejectStartup) => {
      const timeout = setTimeout(() => rejectStartup(new Error('Server startup timed out')), 5000);
      let output = '';
      child.stdout.on('data', data => {
        output += data;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) { clearTimeout(timeout); resolveStartup(`http://127.0.0.1:${match[1]}`); }
      });
      child.once('error', error => { clearTimeout(timeout); rejectStartup(error); });
      child.once('exit', code => { clearTimeout(timeout); rejectStartup(new Error(`Server exited with ${code}`)); });
    });
    const home = await fetch(`${base}/`);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /星穹转轮/);
    for (const path of ['/development.html', '/styles.css', '/src/engine.js', '/public/favicon.svg', '/manifest.webmanifest', '/service-worker.js']) {
      assert.equal((await fetch(base + path)).status, 200, path);
    }
    const manifest = await fetch(`${base}/manifest.webmanifest`);
    assert.match(manifest.headers.get('content-type'), /application\/manifest\+json/);
    assert.equal((await manifest.json()).scope, './');
    const worker = await fetch(`${base}/service-worker.js`);
    assert.match(worker.headers.get('content-type'), /text\/javascript/);
    const workerSource = await worker.text();
    assert.match(workerSource, /src\/offline\.js/);
    assert.match(workerSource, /src\/ai-worker\.js/);
    assert.ok(!workerSource.includes('/* OFFLINE_BUILD */ null'));
    const head = await fetch(`${base}/index.html`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.match(head.headers.get('content-type'), /text\/html/);
    assert.equal(await head.text(), '');
    assert.equal((await fetch(`${base}/`, { method: 'POST' })).status, 405);
    for (const path of [
      '/README.md', '/package.json', '/.git/config', `/${basename(suffixFile)}`,
      '/scripts/offline-assets.mjs', '/service-worker.js.txt', '/manifest.webmanifest.txt',
      '/public/%5c..%5cREADME.md', '/src/%5c..%5c.git%5cconfig',
      '/public/%2f..%2fpackage.json', '/public/%2e%2e/README.md',
      '/src/%00engine.js', '/public/%', '/public/%E0%A4',
    ]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 404, `Must reject ${path}`);
      assert.equal(await response.text(), 'Not found');
    }
    if (hasSymlink) {
      assert.equal((await fetch(`${base}/public/${basename(publicFixture)}/outside.txt`)).status, 404);
      assert.equal((await fetch(`${base}/public/${basename(publicFixture)}/private-package.json`)).status, 404);
    } else {
      t.diagnostic('Symlink traversal check skipped: host does not permit creating symlinks.');
    }
  } finally {
    child.kill();
    for (const link of links) await unlink(link);
    await unlink(secretFile);
    await unlink(suffixFile);
    await rmdir(publicFixture);
    await rmdir(privateFixture);
  }
});
