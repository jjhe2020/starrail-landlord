# 冻结实现：service-worker.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`service-worker.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：8656
- SHA-256：`aa708641cf25160e0989a7815c9254ebb26e284d0fbc791e2d4ae068782f89a1`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/service-worker.js#L1)

<!-- frozen-source:start -->
````````````````javascript
// The development server and build script embed the exact complete asset list.
const BUILD = /* OFFLINE_BUILD */ null;
if (!BUILD) throw new Error('Serve this worker through the project server or build the static site first.');

const scope = self.registration.scope;
const projectPrefix = `astral-reels:offline:${encodeURIComponent(scope)}:`;
const cacheName = `${projectPrefix}app:${BUILD.version}`;
const metadataName = `${projectPrefix}clients`;
const indexUrl = new URL('./index.html', scope).href;
const markerUrl = new URL('./__offline_complete__', scope).href;
const activatedUrl = new URL('./__offline_activated__', scope).href;
const assetRecords = BUILD.assets.map(asset => ({ url: new URL(asset.url, scope).href, sha256: asset.sha256 }));
const assetUrls = assetRecords.map(asset => asset.url);
const pinUrl = id => new URL(`./__offline_client__/${encodeURIComponent(id)}`, scope).href;
const indexResponse = () => new Response(BUILD.indexHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

async function readPin(id) {
  if (!id) return cacheName;
  const metadata = await caches.open(metadataName);
  const record = await metadata.match(pinUrl(id));
  return record ? await record.text() : cacheName;
}

async function writePin(id, name) {
  if (!id) return;
  const metadata = await caches.open(metadataName);
  await metadata.put(pinUrl(id), new Response(name));
}

async function cacheReady(name) {
  if (!(await caches.keys()).includes(name)) return false;
  const cache = await caches.open(name);
  const marker = await cache.match(markerUrl);
  if (!marker) return false;
  try {
    const assets = await marker.json();
    if (!Array.isArray(assets) || !assets.length) return false;
    return (await Promise.all(assets.map(asset => cache.match(asset.url)))).every(Boolean);
  } catch { return false; }
}

async function installCompleteVersion() {
  if (await cacheReady(cacheName)) return;
  const existed = (await caches.keys()).includes(cacheName);
  const stagingName = `${projectPrefix}staging:${BUILD.version}:${crypto.randomUUID()}`;
  const staging = await caches.open(stagingName);
  try {
    const downloads = await Promise.allSettled(BUILD.assets.map(async (asset, index) => {
      const url = assetUrls[index];
      // Some hosts redirect index.html or rewrite network HTML. The authored
      // page is delivered inside this worker and verified with the same digest.
      const response = url === indexUrl ? indexResponse() : await fetch(new Request(url, { cache: 'no-store', credentials: 'same-origin', redirect: 'error' }));
      if (!response.ok || response.type === 'opaque') throw new Error(`Unable to cache ${asset.url}`);
      const hash = await responseHash(response);
      if (hash !== asset.sha256) throw new Error(`Offline asset changed during install: ${asset.url}`);
      await staging.put(url, response);
    }));
    const failure = downloads.find(result => result.status === 'rejected');
    if (failure) throw failure.reason;
    const cache = await caches.open(cacheName);
    try {
      for (const url of assetUrls) await cache.put(url, await staging.match(url));
      // A complete marker is committed last. Failed installations never activate.
      await cache.put(markerUrl, new Response(JSON.stringify(assetRecords), { headers: { 'Content-Type': 'application/json' } }));
    } catch (error) {
      // A failed repair retains the previously available entries. Every entry
      // belongs to the same content digest, so replacement cannot mix releases.
      if (!existed) await caches.delete(cacheName);
      throw error;
    }
  } finally { await caches.delete(stagingName); }
}

async function responseHash(response) {
  const bytes = await response.clone().arrayBuffer();
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function cleanUnusedVersions() {
  const clients = await self.clients.matchAll({ type: 'all', includeUncontrolled: true });
  const metadata = await caches.open(metadataName);
  const retained = new Set([cacheName]);
  const liveIds = new Set(clients.map(client => client.id));
  for (const client of clients) retained.add(await readPin(client.id));
  for (const request of await metadata.keys()) {
    if (request.url === activatedUrl) continue;
    const id = decodeURIComponent(new URL(request.url).pathname.split('/').at(-1));
    if (!liveIds.has(id)) await metadata.delete(request);
  }
  for (const name of await caches.keys()) {
    if (name.startsWith(`${projectPrefix}app:`) && !retained.has(name)) await caches.delete(name);
    if (name.startsWith(`${projectPrefix}staging:`)) await caches.delete(name);
  }
}

self.addEventListener('install', event => event.waitUntil(installCompleteVersion()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const metadata = await caches.open(metadataName);
  const firstInstall = !(await metadata.match(activatedUrl));
  await metadata.put(activatedUrl, new Response(BUILD.version));
  await cleanUnusedVersions();
  // Claim only the initial uncontrolled installation. Updates wait naturally,
  // or are activated by the user's explicit SKIP_WAITING message.
  if (firstInstall) {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) await writePin(client.id, cacheName);
    await self.clients.claim();
  }
})()));

function runtimeUrl(request) {
  const url = new URL(request.url);
  const base = new URL(scope);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
  const path = url.pathname.slice(base.pathname.length);
  if (path === '' || path === 'index.html') return indexUrl;
  if (!/^(?:styles\.css$|manifest\.webmanifest$|src\/[^\\]+|public\/[^\\]+)/.test(path) || path.split('/').some(part => part.startsWith('.'))) return null;
  url.search = '';
  url.hash = '';
  return url.href;
}

async function serveRuntime(event, url) {
  // A navigation deliberately enters this worker's version. Other requests
  // stay with the version of the document or worker that started them.
  const name = event.request.mode === 'navigate' ? cacheName : await readPin(event.clientId);
  await writePin(event.resultingClientId, name);
  if (event.request.mode === 'navigate' && !event.resultingClientId) await writePin(event.clientId, name);
  let expected = name === cacheName ? assetRecords.find(asset => asset.url === url)?.sha256 : null;
  if ((await caches.keys()).includes(name)) {
    const cached = await (await caches.open(name)).match(url);
    if (cached) return cached;
    if (!expected) {
      const marker = await (await caches.open(name)).match(markerUrl);
      if (marker) expected = (await marker.json()).find(asset => asset.url === url)?.sha256;
    }
  }
  // Cache eviction can require reconnection. Do not mix a newer network asset
  // into a saved app cache or write arbitrary requests into the offline bundle.
  const response = name === cacheName && url === indexUrl ? indexResponse() : await fetch(event.request);
  if (!expected || !response.ok || await responseHash(response) !== expected) {
    return new Response('游戏资源版本已变化，请联网后重新打开游戏。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return response;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = runtimeUrl(event.request);
  if (url) event.respondWith(serveRuntime(event, url));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  } else if (event.data?.type === 'GET_OFFLINE_STATUS' || event.data?.type === 'REPAIR_OFFLINE_CACHE') {
    event.waitUntil((async () => {
      let error = null;
      if (event.data.type === 'REPAIR_OFFLINE_CACHE') {
        try { await installCompleteVersion(); }
        catch { error = '离线资源下载失败，请保持联网后重试。'; }
      }
      const name = await readPin(event.source?.id);
      await writePin(event.source?.id, name);
      const ready = await cacheReady(name);
      const cache = ready ? await caches.open(name) : null;
      const entries = cache ? await (await cache.match(markerUrl)).json() : [];
      const status = { type: 'OFFLINE_STATUS', ready, version: name.slice(`${projectPrefix}app:`.length), latestVersion: BUILD.version, assetCount: entries.length, ...(error ? { error } : {}) };
      (event.ports?.[0] || event.source)?.postMessage(status);
    })());
  }
});
````````````````
<!-- frozen-source:end -->
