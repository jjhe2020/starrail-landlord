import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, unlink } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { createOfflineBuild } from '../scripts/offline-assets.mjs';

async function fixture(t) {
  const root = await mkdtemp(resolve(tmpdir(), 'astral-offline-test-'));
  assert.ok(root.startsWith(resolve(tmpdir()) + sep));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const folder of ['src', 'public/icons', 'public/assets', 'scripts', 'tests']) await mkdir(resolve(root, folder), { recursive: true });
  const files = {
    'index.html': '<html>offline fixture</html>',
    'development.html': '<html>development fixture</html>',
    'styles.css': 'body{background:#10131d}',
    'manifest.webmanifest': '{"scope":"./"}',
    'src/app.js': 'export const app = 1;',
    'src/offline.js': 'export const offline = 1;',
    'src/ai-worker.js': 'import "./ai.js"; // old worker',
    'src/ai.js': 'export const policy = "old";',
    'public/icons/icon-192.png': '192 icon',
    'public/icons/icon-512.png': '512 icon',
    'public/icons/maskable-512.png': 'maskable icon',
    'public/assets/unseen-character.png': 'unseen portrait',
    'public/assets/enemy.svg': '<svg/>',
    'public/assets/.private': 'not public',
    'scripts/secret.mjs': 'private script',
    'tests/private.js': 'private test',
    'package.json': '{"version":"1"}',
  };
  for (const [path, content] of Object.entries(files)) await writeFile(resolve(root, path), content);
  return root;
}

class MemoryCaches {
  stores = new Map();
  async open(name) {
    if (!this.stores.has(name)) this.stores.set(name, new Map());
    const store = this.stores.get(name);
    const key = request => typeof request === 'string' ? request : request.url;
    return {
      async match(request) { return store.get(key(request))?.clone(); },
      async put(request, response) { store.set(key(request), response.clone()); },
      async delete(request) { return store.delete(key(request)); },
      async keys() { return [...store.keys()].map(url => new Request(url)); },
    };
  }
  async keys() { return [...this.stores.keys()]; }
  async delete(name) { return this.stores.delete(name); }
}

async function runtime(root, build, { scope = 'https://example.test/game/', caches = new MemoryCaches(), clients = [], failPath = null, tamperPath = null, redirectPath = null, injectedHtmlPath = null } = {}) {
  const network = new Map();
  for (const asset of build.assets) network.set(new URL(asset.url, scope).href, await readFile(resolve(root, asset.url.slice(2))));
  const listeners = new Map();
  const state = { requests: [], claims: 0, skips: 0, offline: false };
  const self = {
    registration: { scope },
    clients: { async matchAll() { return clients; }, async claim() { state.claims++; } },
    async skipWaiting() { state.skips++; },
    addEventListener(type, listener) { listeners.set(type, listener); },
  };
  vm.runInNewContext(build.worker, {
    self, caches, URL, Request, Response, Uint8Array,
    crypto: { subtle: webcrypto.subtle, randomUUID },
    fetch: async request => {
      const url = typeof request === 'string' ? request : request.url;
      state.requests.push(url);
      if (state.offline) throw new TypeError('Network is offline');
      if (url.endsWith(redirectPath || '/never-redirected')) {
        if (request.redirect === 'error') throw new TypeError('Hosting platform redirects index.html');
        return new Response('', { status: 307, headers: { Location: scope } });
      }
      if (url.endsWith(injectedHtmlPath || '/never-injected')) return new Response('<html>offline fixture<script src="/cdn-cgi/challenge-platform.js"></script></html>', { headers: { 'Content-Type': 'text/html' } });
      if (url.endsWith(failPath || '/never-missing')) return new Response('missing', { status: 404 });
      if (url.endsWith(tamperPath || '/never-tampered')) return new Response('changed while installing');
      return new Response(network.get(url) || 'not found', { status: network.has(url) ? 200 : 404 });
    },
  });
  const lifecycle = async type => {
    let work;
    listeners.get(type)({ waitUntil(promise) { work = promise; } });
    await work;
  };
  const fetchAsset = async (path, options = {}) => {
    let response;
    const request = { url: new URL(path, scope).href, method: 'GET', mode: options.mode || 'cors' };
    listeners.get('fetch')({ request, clientId: options.clientId || '', resultingClientId: options.resultingClientId || '', respondWith(promise) { response = promise; } });
    return response ? await response : null;
  };
  const message = async (type, sourceId = 'tab') => {
    let work, reply;
    listeners.get('message')({ data: { type }, source: { id: sourceId }, ports: [{ postMessage(value) { reply = value; } }], waitUntil(promise) { work = promise; } });
    await work;
    return reply;
  };
  return { state, caches, lifecycle, fetchAsset, message, scope };
}

test('offline build includes every runtime asset and hashes content independently of package version', async t => {
  const root = await fixture(t);
  const first = await createOfflineBuild(root);
  const paths = first.assets.map(asset => asset.url);
  for (const path of ['development.html', 'src/offline.js', 'src/ai-worker.js', 'src/ai.js', 'public/assets/unseen-character.png', 'public/assets/enemy.svg', 'public/icons/maskable-512.png', 'manifest.webmanifest']) assert.ok(paths.includes(`./${path}`), path);
  assert.ok(paths.every(path => !path.includes('scripts/') && !path.includes('tests/') && !path.includes('.private')));
  assert.equal(first.version, (await createOfflineBuild(root)).version);
  await writeFile(resolve(root, 'package.json'), '{"version":"999"}');
  assert.equal(first.version, (await createOfflineBuild(root)).version);
  await writeFile(resolve(root, 'public/assets/unseen-character.png'), 'updated portrait');
  assert.notEqual(first.version, (await createOfflineBuild(root)).version);
  assert.match(first.worker, new RegExp(first.version));
  assert.ok(!first.worker.includes('/* OFFLINE_BUILD */ null'));
});

test('offline build rejects missing installation icons or worker code', async t => {
  const root = await fixture(t);
  await unlink(resolve(root, 'public/icons/icon-192.png'));
  await assert.rejects(createOfflineBuild(root), /icon-192\.png/);
});

test('offline manifest keeps installation URLs relative for subdirectory hosting', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  for (const field of ['id', 'start_url', 'scope']) assert.equal(manifest[field], './');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'any');
  for (const icon of manifest.icons) assert.equal(new URL(icon.src, 'https://example.test/game/manifest.webmanifest').pathname.startsWith('/game/public/icons/'), true);
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
});

test('worker installs atomically, caches unseen art and AI code, and does not skip waiting automatically', async t => {
  const root = await fixture(t);
  const build = await createOfflineBuild(root);
  const worker = await runtime(root, build);
  await worker.lifecycle('install');
  assert.equal(worker.state.skips, 0);
  await worker.lifecycle('activate');
  assert.equal(worker.state.claims, 1);
  const ready = await worker.message('GET_OFFLINE_STATUS');
  assert.equal(ready.ready, true);
  assert.equal(ready.assetCount, build.assets.length);
  worker.state.offline = true;
  const requestsBefore = worker.state.requests.length;
  assert.equal(await (await worker.fetchAsset('./?launch=home', { mode: 'navigate', resultingClientId: 'tab' })).text(), '<html>offline fixture</html>');
  assert.equal(await (await worker.fetchAsset('./development.html', { mode: 'navigate', resultingClientId: 'dev-tab' })).text(), '<html>development fixture</html>', 'the offline development entry never becomes the player shell');
  assert.equal(await (await worker.fetchAsset('./public/assets/unseen-character.png', { clientId: 'tab' })).text(), 'unseen portrait');
  assert.match(await (await worker.fetchAsset('./src/ai-worker.js', { clientId: 'tab', resultingClientId: 'worker' })).text(), /old worker/);
  assert.equal(await (await worker.fetchAsset('./src/ai.js', { clientId: 'worker' })).text(), 'export const policy = "old";');
  assert.equal(worker.state.requests.length, requestsBefore);
  assert.equal(await worker.fetchAsset('../src/app.js'), null, 'Parent directory is outside the worker scope');
  assert.equal(await worker.fetchAsset('./scripts/secret.mjs'), null, 'Private scripts are not in the offline request handler');
  await worker.message('SKIP_WAITING');
  assert.equal(worker.state.skips, 1);
});

test('offline page keeps the authored HTML when the host redirects or injects scripts into network HTML', async t => {
  const root = await fixture(t);
  const build = await createOfflineBuild(root);
  assert.equal(build.indexHtml, '<html>offline fixture</html>');
  for (const platform of [{ redirectPath: 'index.html' }, { injectedHtmlPath: 'index.html' }]) {
    const worker = await runtime(root, build, platform);
    await worker.lifecycle('install');
    await worker.lifecycle('activate');
    assert.equal(worker.state.requests.some(url => url.endsWith('/index.html')), false, 'HTML is reconstructed from the verified worker rather than a platform response');
    worker.state.offline = true;
    const page = await worker.fetchAsset('./', { mode: 'navigate', resultingClientId: 'tab' });
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.equal(await page.text(), '<html>offline fixture</html>');
    assert.equal((await worker.message('GET_OFFLINE_STATUS')).ready, true);
    const cacheName = (await worker.caches.keys()).find(name => name.endsWith(`app:${build.version}`));
    await (await worker.caches.open(cacheName)).delete(new URL('./index.html', worker.scope).href);
    assert.equal(await (await worker.fetchAsset('./', { mode: 'navigate', resultingClientId: 'tab' })).text(), '<html>offline fixture</html>', 'An evicted page shell can also be reconstructed without a network HTML request');
  }
});

test('failed downloads and changed assets remove staging caches without touching an older version', async t => {
  const root = await fixture(t);
  const build = await createOfflineBuild(root);
  for (const failure of [{ failPath: 'public/assets/unseen-character.png' }, { tamperPath: 'src/app.js' }]) {
    const caches = new MemoryCaches();
    await (await caches.open('unrelated-app-cache')).put('https://other.test/', new Response('unrelated'));
    const worker = await runtime(root, build, { caches, ...failure });
    await assert.rejects(worker.lifecycle('install'), /Unable to cache|changed during install/);
    assert.deepEqual(await caches.keys(), ['unrelated-app-cache']);
  }
});

test('accepted updates keep existing windows and AI workers on their complete older version', async t => {
  const root = await fixture(t);
  const first = await createOfflineBuild(root);
  const caches = new MemoryCaches();
  const clients = [{ id: 'old-tab' }];
  const oldWorker = await runtime(root, first, { caches, clients });
  await oldWorker.lifecycle('install');
  await oldWorker.lifecycle('activate');
  await oldWorker.fetchAsset('./', { mode: 'navigate', resultingClientId: 'old-tab' });
  await writeFile(resolve(root, 'src/ai-worker.js'), 'import "./ai.js"; // new worker');
  await writeFile(resolve(root, 'src/ai.js'), 'export const policy = "new";');
  const second = await createOfflineBuild(root);
  const newerWorker = await runtime(root, second, { caches, clients });
  await newerWorker.lifecycle('install');
  await newerWorker.lifecycle('activate');
  assert.equal(newerWorker.state.claims, 0, 'An update does not claim unrelated uncontrolled windows');
  const oldStatus = await newerWorker.message('GET_OFFLINE_STATUS', 'old-tab');
  assert.equal(oldStatus.version, first.version);
  assert.equal(oldStatus.latestVersion, second.version);
  newerWorker.state.offline = true;
  assert.match(await (await newerWorker.fetchAsset('./src/ai-worker.js', { clientId: 'old-tab', resultingClientId: 'old-worker-client' })).text(), /old worker/);
  assert.match(await (await newerWorker.fetchAsset('./src/ai.js', { clientId: 'old-worker-client' })).text(), /"old"/);
  assert.equal((await newerWorker.message('GET_OFFLINE_STATUS', 'old-worker-client')).version, first.version);
  await newerWorker.fetchAsset('./', { mode: 'navigate', resultingClientId: 'fresh-tab' });
  assert.match(await (await newerWorker.fetchAsset('./src/ai.js', { clientId: 'fresh-tab' })).text(), /"new"/);
});

test('ready status detects browser cache eviction and cleanup is restricted to the current project scope', async t => {
  const root = await fixture(t);
  const build = await createOfflineBuild(root);
  const caches = new MemoryCaches();
  await caches.open('another-project:app:old');
  await caches.open('astral-reels:offline:https%3A%2F%2Fexample.test%2Fother%2F:app:old');
  await caches.open('astral-reels:offline:https%3A%2F%2Fexample.test%2Fgame%2F:app:unused');
  const worker = await runtime(root, build, { caches });
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  const keys = await caches.keys();
  assert.ok(keys.includes('another-project:app:old'));
  assert.ok(keys.includes('astral-reels:offline:https%3A%2F%2Fexample.test%2Fother%2F:app:old'));
  assert.ok(!keys.includes('astral-reels:offline:https%3A%2F%2Fexample.test%2Fgame%2F:app:unused'));
  const name = keys.find(key => key.endsWith(`app:${build.version}`));
  await (await caches.open(name)).delete(new URL('./src/ai-worker.js', worker.scope).href);
  assert.equal((await worker.message('GET_OFFLINE_STATUS')).ready, false);
  await caches.delete(name);
  assert.equal((await worker.message('GET_OFFLINE_STATUS')).ready, false);
  const repaired = await worker.message('REPAIR_OFFLINE_CACHE');
  assert.equal(repaired.ready, true, 'An unchanged active worker can explicitly restore an evicted bundle');
  assert.equal(repaired.version, build.version);
});

test('failed cache repair preserves remaining assets and can be retried after reconnecting', async t => {
  const root = await fixture(t);
  const build = await createOfflineBuild(root);
  const worker = await runtime(root, build);
  await worker.lifecycle('install');
  await worker.lifecycle('activate');
  const name = (await worker.caches.keys()).find(key => key.endsWith(`app:${build.version}`));
  await (await worker.caches.open(name)).delete(new URL('./src/ai-worker.js', worker.scope).href);
  worker.state.offline = true;
  const failed = await worker.message('REPAIR_OFFLINE_CACHE');
  assert.equal(failed.ready, false);
  assert.match(failed.error, /下载失败/);
  assert.equal(await (await worker.fetchAsset('./public/assets/unseen-character.png')).text(), 'unseen portrait');
  worker.state.offline = false;
  assert.equal((await worker.message('REPAIR_OFFLINE_CACHE')).ready, true);
});

test('cache eviction never mixes a newer network module into an older open game', async t => {
  const root = await fixture(t);
  const oldBuild = await createOfflineBuild(root);
  const caches = new MemoryCaches();
  const clients = [{ id: 'old-tab' }];
  const oldWorker = await runtime(root, oldBuild, { caches, clients });
  await oldWorker.lifecycle('install');
  await oldWorker.lifecycle('activate');
  await writeFile(resolve(root, 'src/ai.js'), 'export const policy = "new";');
  const newBuild = await createOfflineBuild(root);
  const newWorker = await runtime(root, newBuild, { caches, clients });
  await newWorker.lifecycle('install');
  await newWorker.lifecycle('activate');
  const oldName = (await caches.keys()).find(name => name.endsWith(`app:${oldBuild.version}`));
  await (await caches.open(oldName)).delete(new URL('./src/ai.js', newWorker.scope).href);
  assert.equal((await newWorker.fetchAsset('./src/ai.js', { clientId: 'old-tab' })).status, 503);
});
