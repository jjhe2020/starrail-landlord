import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOfflineBuild } from '../scripts/offline-assets.mjs';
import { newGame } from '../src/engine.js';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const runtimeRoot = process.env.OFFLINE_TEST_ROOT ? resolve(process.env.OFFLINE_TEST_ROOT) : projectRoot;
const saveKey = 'astral-reels:v1';
const developmentSaveKey = 'astral-reels:development:v1';
const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };

// Real browser coverage is opt in. The normal rule-engine suite remains free of
// browser dependencies, and every fixture/context is separate from user data.
test('offline app works in real browser contexts, subdirectories and safe updates', {
  skip: process.env.OFFLINE_BROWSER_TESTS !== '1', timeout: 180000,
}, async t => {
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
  const browser = await playwright.chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}), ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  t.after(() => browser.close());

  async function fixture(scope = '/') {
    const directory = await mkdtemp(join(tmpdir(), 'astral-offline-browser-'));
    assert.ok(directory.startsWith(join(resolve(tmpdir()), 'astral-offline-browser-')), 'fixture cleanup stays within its dedicated temporary directory');
    t.after(() => rm(directory, { recursive: true, force: true }));
    for (const entry of ['index.html', 'development.html', 'styles.css', 'manifest.webmanifest', 'src', 'public']) {
      await cp(join(runtimeRoot, entry), join(directory, entry), { recursive: true });
    }
    const originalCss = await readFile(join(directory, 'styles.css'), 'utf8');
    let build;
    async function release(label) {
      await writeFile(join(directory, 'styles.css'), `${originalCss}\n:root { --offline-fixture-release: ${label}; }\n`);
      build = await createOfflineBuild(directory);
      await writeFile(join(directory, 'service-worker.js'), build.worker);
      return build;
    }
    await release('first');
    let failedPath = null;
    const server = createServer(async (request, response) => {
      try {
        const url = new URL(request.url, 'http://localhost');
        const pathname = decodeURIComponent(url.pathname);
        if (!pathname.startsWith(scope) || pathname === failedPath) { response.writeHead(404); response.end('Missing fixture asset'); return; }
        const relative = pathname.slice(scope.length) || 'index.html';
        const filename = resolve(directory, relative);
        if (!filename.startsWith(directory + sep) || relative.split('/').some(part => part.startsWith('.'))) {
          response.writeHead(404); response.end(); return;
        }
        const bytes = await readFile(filename);
        response.writeHead(200, { 'Content-Type': `${mimeTypes[extname(filename)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
        response.end(bytes);
      } catch { response.writeHead(404); response.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    return { url: `http://127.0.0.1:${server.address().port}${scope}`, release, get build() { return build; }, fail(path) { failedPath = path === null ? null : `${scope}${path}`; } };
  }

  async function pageFor(site, viewport, { development = false } = {}) {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 1000, reducedMotion: 'reduce' });
    t.after(() => context.close());
    await context.addInitScript(({ keys, game }) => {
      try {
        for (const key of keys) if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ game, settings: { sound: false, animations: false }, stats: { runs: 1, wins: 0, bestFloor: 1 } }));
      } catch { /* Only actual fixture pages have a storage origin. */ }
    }, { keys: [saveKey, developmentSaveKey], game: newGame({ seed: 'offline-browser-fixture', mode: 'combat' }) });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${site.url}${development ? 'development.html' : ''}`);
    await page.locator('[data-action="spin"]').waitFor();
    return { context, page, errors };
  }

  async function ready(page) {
    await page.waitForFunction(() => navigator.serviceWorker.controller && document.querySelector('[data-offline-indicator]')?.classList.contains('ready'), null, { timeout: 30000 });
  }
  const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), page.url().includes('/development.html') ? developmentSaveKey : saveKey);
  async function status(page) {
    return page.evaluate(() => new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timeout = setTimeout(() => reject(new Error('Offline status timed out')), 5000);
      channel.port1.onmessage = event => { clearTimeout(timeout); channel.port1.close(); resolve(event.data); };
      navigator.serviceWorker.controller.postMessage({ type: 'GET_OFFLINE_STATUS' }, [channel.port2]);
    }));
  }
  async function settings(page) {
    await page.locator('[data-offline-indicator]').click();
    await page.locator('[data-offline-panel]').waitFor();
  }
  async function fitsScreen(page) {
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('[data-offline-panel]');
      const bounds = panel?.getBoundingClientRect();
      return { width: innerWidth, pageWidth: document.documentElement.scrollWidth, panelWidth: panel?.clientWidth, panelScroll: panel?.scrollWidth, left: bounds?.left, right: bounds?.right };
    });
    assert.ok(metrics.pageWidth <= metrics.width + 1, `document fits ${metrics.width}px: ${JSON.stringify(metrics)}`);
    if (metrics.panelWidth !== undefined) {
      assert.ok(metrics.left >= -1 && metrics.right <= metrics.width + 1, 'offline settings stay inside the viewport');
      assert.ok(metrics.panelScroll <= metrics.panelWidth + 1, 'offline controls and instructions do not overflow');
    }
  }

  for (const viewport of [{ width: 1265, height: 900 }, { width: 320, height: 740 }, { width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    await t.test(`${viewport.width}px: complete install, offline images, real AI worker, play and restore`, async () => {
      const site = await fixture(viewport.width === 1265 ? '/' : '/game/');
      const { context, page, errors } = await pageFor(site, viewport, { development: true });
      await ready(page);
      const firstStatus = await status(page);
      assert.equal(firstStatus.ready, true);
      assert.equal(firstStatus.assetCount, site.build.assets.length, 'readiness requires the full versioned asset set');
      await fitsScreen(page);
      await settings(page);
      await fitsScreen(page);
      await page.locator('[data-action="close"]').last().click();
      const before = await saved(page);
      await context.setOffline(true);
      await page.reload();
      await ready(page);
      assert.match(await page.locator('[data-offline-indicator]').textContent(), /离线游玩/);
      assert.deepEqual((await saved(page)).game, before.game, 'offline reload restores the exact saved journey');
      await page.waitForFunction(() => [...document.images].filter(image => image.src.includes('/public/')).every(image => image.complete && image.naturalWidth > 0));
      assert.ok(await page.locator('img[src*="characters"]').count() > 0, 'offline play actually renders saved character portraits');
      await page.locator('[data-action="spin"]').click();
      await page.locator('[data-action="choose"]').first().waitFor();
      await page.waitForFunction(() => [...document.querySelectorAll('[data-ai-index] strong')].some(element => element.textContent.includes('%')));
      // A successful native module Worker proves that fallback main-thread AI
      // is not concealing a missing offline worker or imported dependency.
      const advice = await page.evaluate(key => new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./src/ai-worker.js', location.href), { type: 'module' });
        const timeout = setTimeout(() => { worker.terminate(); reject(new Error('Offline AI worker timed out')); }, 10000);
        worker.onerror = event => { clearTimeout(timeout); worker.terminate(); reject(new Error(event.message)); };
        worker.onmessage = ({ data }) => { clearTimeout(timeout); worker.terminate(); data.type === 'error' ? reject(new Error(data.message)) : resolve(data); };
        worker.postMessage({ type: 'recommend', requestId: 71, state: JSON.parse(localStorage.getItem(key)).game });
      }), developmentSaveKey);
      assert.equal(advice.type, 'recommend');
      assert.equal(advice.requestId, 71);
      assert.ok(advice.result.choices.length > 0);
      const spun = await saved(page);
      assert.equal(spun.game.stats.spins, before.game.stats.spins + 1);
      await page.locator('[data-action="choose"]').first().click();
      await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).game.phase === 'ready', developmentSaveKey);
      const chosen = await saved(page);
      assert.notDeepEqual(chosen.game, spun.game);
      await page.reload();
      await ready(page);
      assert.deepEqual((await saved(page)).game, chosen.game, 'offline choices persist across another cold page load');
      await fitsScreen(page);
      assert.deepEqual(errors, [], 'offline play has no uncaught page errors');
      await context.close();
    });
  }

  await t.test('both static entries and development bundle are cached and reopen offline with separate saves', async () => {
    const site = await fixture('/game/');
    const { context, page, errors } = await pageFor(site, { width: 390, height: 844 });
    await ready(page);
    const records = site.build.assets.map(asset => asset.url);
    assert.ok(records.includes('./development.html'));
    const developmentEntry = await readFile(join(runtimeRoot, 'development.html'), 'utf8');
    const developmentBundle = developmentEntry.includes('./src/development-app.js') ? './src/development-app.js' : './src/developer-tools.js';
    assert.ok(records.includes(developmentBundle), 'the development application belongs to the exact offline asset set');
    const cached = await page.evaluate(async paths => {
      const name = (await caches.keys()).find(name => name.includes(':app:'));
      const cache = await caches.open(name);
      return Promise.all(paths.map(async path => !!await cache.match(new URL(path, location.href))));
    }, ['./development.html', developmentBundle]);
    assert.deepEqual(cached, [true, true]);
    assert.equal(await page.locator('[data-action="aiLab"]').count(), 0, 'player entry has no AI laboratory');
    const playerSave = await saved(page);
    await context.setOffline(true);
    const developer = await context.newPage();
    developer.on('pageerror', error => errors.push(error.message));
    await developer.goto(`${site.url}development.html`);
    await ready(developer);
    await developer.locator('[data-action="aiLab"]').first().waitFor();
    assert.match(await developer.title(), /开发版/);
    await developer.locator('[data-action="spin"]').click();
    await developer.locator('[data-action="choose"]').first().waitFor();
    await developer.waitForFunction(() => [...document.querySelectorAll('[data-ai-index] strong')].some(element => element.textContent.includes('%')));
    assert.equal((await saved(developer)).game.stats.spins, playerSave.game.stats.spins + 1);
    assert.deepEqual((await saved(page)).game, playerSave.game, 'developer actions do not overwrite the player save');
    await page.reload();
    await ready(page);
    assert.equal(await page.locator('[data-action="aiLab"]').count(), 0);
    assert.deepEqual((await saved(page)).game, playerSave.game);
    assert.deepEqual(errors, []);
    await context.close();
  });

  await t.test('a waiting update preserves gameplay and old tabs until explicit save and reload', async () => {
    const site = await fixture('/game/');
    const { context, page, errors } = await pageFor(site, { width: 390, height: 844 });
    await ready(page);
    await page.locator('[data-action="spin"]').click();
    await page.locator('[data-action="choose"]').first().waitFor();
    await page.locator('[data-action="choose"]').first().click();
    const progress = await saved(page);
    const sibling = await context.newPage();
    await sibling.goto(site.url);
    await ready(sibling);
    const firstVersion = (await status(page)).version;
    const epoch = await page.evaluate(() => performance.timeOrigin);
    const secondBuild = await site.release('second');
    assert.notEqual(firstVersion, secondBuild.version);
    await settings(page);
    await page.locator('[data-action="offlineCheck"]').click();
    await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting, null, { timeout: 30000 });
    await page.locator('[data-action="offlineUpdate"]').waitFor();
    assert.equal(await page.evaluate(() => performance.timeOrigin), epoch, 'background download does not reload the open game');
    assert.deepEqual((await saved(page)).game, progress.game, 'background installation does not change the save');
    assert.equal((await status(page)).version, firstVersion, 'active page remains on its original assets');
    await page.evaluate(key => {
      window.restoreFixtureSave = Storage.prototype.setItem;
      Storage.prototype.setItem = function(name, value) {
        if (name === key) throw new DOMException('Fixture storage is full', 'QuotaExceededError');
        return window.restoreFixtureSave.call(this, name, value);
      };
    }, saveKey);
    await page.locator('[data-action="offlineUpdate"]').click();
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('进度未能保存'));
    assert.equal(await page.evaluate(() => performance.timeOrigin), epoch, 'a failed save prevents an update reload');
    assert.equal(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting), true, 'save failure leaves the downloaded update waiting');
    assert.deepEqual((await saved(page)).game, progress.game);
    await page.evaluate(() => { Storage.prototype.setItem = window.restoreFixtureSave; });
    await page.locator('[data-action="offlineUpdate"]').click();
    await page.waitForFunction(previous => performance.timeOrigin !== previous, epoch);
    await ready(page);
    assert.deepEqual((await saved(page)).game, progress.game, 'manual update saves and resumes the exact journey');
    assert.equal((await status(page)).version, secondBuild.version);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--offline-fixture-release').trim()), 'second');
    assert.equal((await status(sibling)).version, firstVersion, 'another open tab keeps its old asset version');
    const siblingCss = await sibling.evaluate(async () => (await fetch('./styles.css')).text());
    assert.match(siblingCss, /--offline-fixture-release: first/);
    assert.doesNotMatch(siblingCss, /--offline-fixture-release: second/);
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    assert.equal((await status(page)).version, secondBuild.version, 'the new complete version also restarts offline');
    assert.deepEqual(errors, []);
    await context.close();
  });

  await t.test('a missing portrait prevents readiness and can be retried after reconnection', async () => {
    const site = await fixture('/game/');
    const portrait = site.build.assets.find(asset => /characters\/\d+\.png$/.test(asset.url));
    assert.ok(portrait);
    site.fail(portrait.url.slice(2));
    const { context, page } = await pageFor(site, { width: 320, height: 740 });
    await page.waitForFunction(() => document.querySelector('[data-offline-indicator]')?.textContent === '离线准备未完成', null, { timeout: 30000 });
    assert.equal(await page.locator('[data-offline-indicator].ready').count(), 0);
    assert.equal(await page.evaluate(() => navigator.serviceWorker.controller), null, 'incomplete first installation never controls the game');
    await settings(page);
    await fitsScreen(page);
    site.fail(null);
    await page.locator('[data-action="offlineCheck"]').click();
    await ready(page);
    assert.equal((await status(page)).assetCount, site.build.assets.length);
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await context.close();
  });

  await t.test('a worker registration fetch failure can be retried without reloading the game', async () => {
    const site = await fixture('/game/');
    site.fail('service-worker.js');
    const { context, page } = await pageFor(site, { width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('[data-offline-indicator]')?.textContent === '离线准备未完成');
    const epoch = await page.evaluate(() => performance.timeOrigin);
    const before = await saved(page);
    await settings(page);
    site.fail(null);
    await page.locator('[data-action="offlineCheck"]').click();
    await ready(page);
    assert.equal(await page.evaluate(() => performance.timeOrigin), epoch);
    assert.deepEqual((await saved(page)).game, before.game);
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await context.close();
  });

  await t.test('evicted assets remove the ready claim, then retry repairs them without losing the save', async () => {
    const site = await fixture('/game/');
    const { context, page } = await pageFor(site, { width: 820, height: 1180 });
    await ready(page);
    const before = await saved(page);
    const portrait = site.build.assets.find(asset => /characters\/\d+\.png$/.test(asset.url));
    await page.evaluate(async url => {
      const name = (await caches.keys()).find(name => name.includes(':app:'));
      const cache = await caches.open(name);
      if (!await cache.delete(new URL(url, location.href))) throw new Error('Fixture asset was not cached');
    }, portrait.url);
    assert.equal((await status(page)).ready, false);
    await settings(page);
    site.fail(portrait.url.slice(2));
    await page.locator('[data-action="offlineCheck"]').click();
    await page.waitForFunction(() => document.querySelector('.offline-state')?.textContent === '离线准备未完成');
    assert.equal(await page.locator('[data-offline-indicator].ready').count(), 0);
    assert.deepEqual((await saved(page)).game, before.game);
    site.fail(null);
    await page.locator('[data-action="offlineCheck"]').click();
    await ready(page);
    assert.equal((await status(page)).ready, true);
    await context.setOffline(true);
    await page.reload();
    await ready(page);
    await page.waitForFunction(() => [...document.images].filter(image => image.src.includes('/public/')).every(image => image.complete && image.naturalWidth > 0));
    assert.deepEqual((await saved(page)).game, before.game);
    await context.close();
  });
});
