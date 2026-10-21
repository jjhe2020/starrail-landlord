import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { newGame, spin, chooseReward } from '../src/engine.js';
import { CHARACTERS, ITEMS, ESSENCES } from '../src/content.js';
import { DEFAULT_PROFILE } from '../src/ai-profile.js';
import { exportSave, importSave } from '../src/save-transfer.js';
import { createPortableFixture } from './portable-fixture.js';

const saveKey = 'astral-reels:v1';

// Opt in because the ordinary engine suite does not require a browser. No web
// server is used: every page first opens a new self-contained file while offline.
// This tests Chromium file:// support; Android content:// file handoff still
// needs a real device because its document provider belongs to the Android OS.
test('portable HTML plays from file:// on its first offline load', {
  skip: process.env.PORTABLE_BROWSER_TESTS !== '1', timeout: 180000,
}, async t => {
  const { buildPortable } = await import('../scripts/build-portable.mjs');
  const directory = await mkdtemp(join(tmpdir(), 'astral-portable-browser-'));
  assert.ok(directory.startsWith(resolve(tmpdir()) + sep), 'cleanup stays in a dedicated temporary fixture');
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { root, esbuild } = await createPortableFixture(directory);
  const build = await buildPortable({ root, esbuild });
  if (process.env.PORTABLE_SCREENSHOT_DIR) await mkdir(resolve(process.env.PORTABLE_SCREENSHOT_DIR), { recursive: true });
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
  const browser = await playwright.chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}), ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  t.after(() => browser.close());

  const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
  async function fitsScreen(page) {
    const metrics = await page.evaluate(() => {
      const panel = document.querySelector('.utility-panel');
      const bounds = panel?.getBoundingClientRect();
      return { width: innerWidth, pageWidth: document.documentElement.scrollWidth,
        panelWidth: panel?.clientWidth, panelScroll: panel?.scrollWidth, left: bounds?.left, right: bounds?.right };
    });
    assert.ok(metrics.pageWidth <= metrics.width + 1, `page fits ${metrics.width}px: ${JSON.stringify(metrics)}`);
    if (metrics.panelWidth !== undefined) {
      assert.ok(metrics.left >= -1 && metrics.right <= metrics.width + 1, 'utility panel stays in the viewport');
      assert.ok(metrics.panelScroll <= metrics.panelWidth + 1, 'instructions and controls fit the utility panel');
    }
  }
  async function closePanel(page) { await page.locator('.utility-panel [data-action="close"]').last().click(); }

  for (const viewport of [{ width: 1265, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 740 }, { width: 820, height: 1180 }]) {
    await t.test(`${viewport.width}px: embedded images, classic Blob Worker, gameplay and refresh`, async () => {
      const context = await browser.newContext({ viewport, hasTouch: viewport.width < 1000, reducedMotion: 'reduce', offline: true, acceptDownloads: true });
      t.after(() => context.close());
      const networkAttempts = [];
      context.on('request', request => { if (/^https?:/.test(request.url())) networkAttempts.push(request.url()); });
      await context.route(/^https?:\/\//, route => route.abort());
      await context.addInitScript(({ key, game }) => {
        window.portableFixtureWorkers = [];
        window.portableFixtureWorkerMessages = [];
        window.portableFixtureWorkerErrors = [];
        const NativeWorker = window.Worker;
        window.Worker = class extends NativeWorker {
          constructor(url, options) {
            super(url, options);
            window.portableFixtureWorkers.push({ url: String(url), type: options?.type || 'classic' });
            this.addEventListener('message', ({ data }) => window.portableFixtureWorkerMessages.push({ type: data.type, requestId: data.requestId }));
            this.addEventListener('error', event => window.portableFixtureWorkerErrors.push(event.message));
          }
        };
        try {
          if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ game, settings: { sound: false, animations: false }, stats: { runs: 1, wins: 0, bestFloor: 1 } }));
        } catch (error) { window.portableFixtureStorageError = error.message; }
      }, { key: saveKey, game: newGame({ seed: 'portable-browser-fixture', mode: 'combat' }) });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(build.output).href);
      await page.locator('[data-action="spin"]').waitFor();
      assert.equal(await page.evaluate(() => location.protocol), 'file:');
      assert.equal(await page.evaluate(() => navigator.onLine), false, 'no first online visit is needed');
      assert.equal(await page.evaluate(() => window.portableFixtureStorageError), undefined, 'this browser supports file-origin local storage');
      const before = await saved(page);
      assert.equal(before.game.seed, 'portable-browser-fixture');
      await fitsScreen(page);

      await page.locator('.site-header [data-action="catalog"]').click();
      await page.waitForFunction(() => [...document.querySelectorAll('.catalog-grid img')].every(image => image.complete && image.naturalWidth > 0));
      const portraits = await page.locator('.catalog-grid img').evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight })));
      assert.equal(portraits.length, CHARACTERS.length, 'the entire character catalog is available from the one file');
      assert.ok(portraits.every(image => image.src.startsWith('data:image/png;base64,') && image.width === 256 && image.height === 256));
      await fitsScreen(page);
      for (const [tab, count] of [['items', ITEMS.length], ['essences', ESSENCES.length]]) {
        await page.locator(`[data-action="catalogTab"][data-tab="${tab}"]`).click();
        assert.equal(await page.locator('.catalog-grid .catalog-item').count(), count);
        await fitsScreen(page);
      }
      await closePanel(page);

      await page.locator('[data-action="spin"]').click();
      await page.locator('[data-action="choose"]').first().waitFor();
      await page.waitForFunction(() => window.portableFixtureWorkerMessages.some(message => message.type === 'recommend'));
      const appWorkers = await page.evaluate(() => window.portableFixtureWorkers);
      assert.ok(appWorkers.length > 0, 'game recommendations use a real worker rather than the main-thread fallback');
      assert.ok(appWorkers.every(worker => worker.type === 'classic' && worker.url.startsWith('blob:')));
      await page.waitForFunction(() => [...document.querySelectorAll('[data-ai-index] strong')].some(element => element.textContent.includes('%')));
      // Independently exercise the bundled worker code in the native browser.
      const advice = await page.evaluate(key => new Promise((resolve, reject) => {
        const url = URL.createObjectURL(new Blob([globalThis.__ASTRAL_PORTABLE__.workerSource], { type: 'text/javascript' }));
        const worker = new Worker(url);
        const finish = callback => value => { clearTimeout(timeout); worker.terminate(); URL.revokeObjectURL(url); callback(value); };
        const timeout = setTimeout(finish(reject), 10000, new Error('Portable worker timed out'));
        worker.onerror = event => finish(reject)(new Error(event.message));
        worker.onmessage = ({ data }) => data.type === 'error' ? finish(reject)(new Error(data.message)) : finish(resolve)(data);
        worker.postMessage({ type: 'recommend', requestId: 91, state: JSON.parse(localStorage.getItem(key)).game });
      }), saveKey);
      assert.equal(advice.type, 'recommend');
      assert.equal(advice.requestId, 91);
      assert.ok(advice.result.choices.length > 0);
      const spun = await saved(page);
      assert.equal(spun.game.stats.spins, before.game.stats.spins + 1);
      await page.locator('[data-action="choose"]').first().click();
      await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).game.phase === 'ready', saveKey);
      const chosen = await saved(page);
      assert.notDeepEqual(chosen.game, spun.game);
      await page.reload();
      await page.locator('[data-action="spin"]').waitFor();
      assert.deepEqual((await saved(page)).game, chosen.game, 'a fresh offline load restores the exact progress');
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert.ok(await page.locator('.reel-cell img').count() > 0);
      await fitsScreen(page);
      await page.locator('.site-header [data-action="settings"]').click();
      const instructions = await page.locator('[data-offline-panel]').textContent();
      assert.match(instructions, /单文件|本地文件|文件版/);
      assert.doesNotMatch(instructions, /离线准备未完成|首次加载请保持联网|请从正式安装网址打开/);
      assert.equal(await page.locator('[data-action="offlineCheck"], [data-action="offlineInstall"], [data-action="offlineUpdate"]').count(), 0, 'local-file settings do not offer impossible PWA preparation');
      await fitsScreen(page);
      if (process.env.PORTABLE_SCREENSHOT_DIR) await page.screenshot({ path: join(resolve(process.env.PORTABLE_SCREENSHOT_DIR), `portable-file-${viewport.width}-settings.png`), fullPage: true });
      await closePanel(page);
      assert.deepEqual(await page.evaluate(() => window.portableFixtureWorkerErrors), []);
      assert.deepEqual(errors, [], 'local-file gameplay has no uncaught errors');
      assert.deepEqual(networkAttempts, [], 'playing, the complete catalog, and settings attempt no HTTP or HTTPS requests');
      await context.close();
    });
  }

  await t.test('blocked local storage still allows offline gameplay and portable save files', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce', offline: true, acceptDownloads: true });
    t.after(() => context.close());
    const requests = [];
    context.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await context.route(/^https?:\/\//, route => route.abort());
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('File storage blocked by fixture', 'SecurityError'); } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(build.output).href);
    await page.locator('[data-action="spin"]').waitFor();
    assert.match(await page.locator('.save-status').textContent(), /当前页面保存/);
    const game = newGame({ seed: 'blocked-storage-browser-fixture', mode: 'combat' });
    const payload = { game, settings: { sound: false, animations: false }, stats: { runs: 1, wins: 0, bestFloor: 1 }, aiProfile: DEFAULT_PROFILE };

    async function importThroughPicker(text) {
      const chooser = page.waitForEvent('filechooser');
      await page.locator('[data-action="saveImport"]').click();
      await (await chooser).setFiles({ name: '星穹转轮-存档.json', mimeType: 'application/json', buffer: Buffer.from(text) });
    }
    let exportCount = 0;
    async function exportThroughDownload() {
      const pending = page.waitForEvent('download');
      await page.locator('[data-action="saveExport"]').click();
      const download = await pending;
      assert.equal(download.suggestedFilename(), '星穹转轮-存档.json');
      const filename = join(directory, `saved-${++exportCount}.json`);
      await download.saveAs(filename);
      return await readFile(filename, 'utf8');
    }
    async function openSettings() {
      await page.locator('.site-header [data-action="settings"]').click();
      await page.locator('[data-action="saveExport"]').waitFor();
      assert.match(await page.locator('[data-offline-panel]').textContent(), /不允许自动保存.*导出存档/);
    }

    await openSettings();
    await importThroughPicker(exportSave(payload));
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('已恢复当前旅程'));
    await openSettings();
    assert.deepEqual(importSave(await exportThroughDownload()), payload, 'the picker and download retain a game even when browser storage is unavailable');
    await closePanel(page);
    await page.locator('[data-action="spin"]').click();
    await page.locator('[data-action="choose"]').first().waitFor();
    await page.locator('[data-action="choose"]').first().click();
    await page.locator('[data-action="spin"]:not(:disabled)').waitFor();
    await openSettings();
    const progressText = await exportThroughDownload();
    const progress = importSave(progressText);
    assert.deepEqual(progress.game, chooseReward(spin(game), 0), 'actual in-memory play exports its new progress');
    await page.reload();
    await page.locator('[data-action="spin"]').waitFor();
    await openSettings();
    assert.notEqual(importSave(await exportThroughDownload()).game.seed, game.seed, 'unavailable browser storage cannot silently claim refresh persistence');
    await importThroughPicker(progressText);
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('已恢复当前旅程'));
    await openSettings();
    assert.deepEqual(importSave(await exportThroughDownload()), progress, 'manual import after a cold offline load restores the exact progress');
    await importThroughPicker('{invalid save');
    await page.waitForFunction(() => document.querySelector('.toast')?.textContent.includes('未导入存档'));
    assert.deepEqual(importSave(await exportThroughDownload()), progress, 'an invalid import leaves the current in-memory game intact');
    await fitsScreen(page);
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    await context.close();
  });
});
