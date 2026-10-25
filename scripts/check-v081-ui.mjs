import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { newGame, purchaseSupply, validateSave } from '../src/engine.js';
import { CHARACTERS, ITEMS, ESSENCES } from '../src/content.js';
import { exportSave, importSave } from '../src/save-transfer.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const keys = { player: 'astral-reels:v1', development: 'astral-reels:development:v1' };
const digest = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');

function displayFixture() {
  const game = newGame({ seed: 'v081-editions-browser-fixture', difficulty: 10 });
  game.roster = ['1001', '1002', '1008', '1107', '1217', '1310', '1312', '1402'].map((id, i) => ({ uid: `u${i + 1}`, id, stars: 1, attackBonus: i === 1 ? 2 : 0, growth: i === 1 ? 2 : 0, ticks: 0 }));
  game.uidCounter = 9;
  game.hp = 50;
  game.coins = 100;
  game.items = ['faith_bond'];
  game.essences = [{ id: 'essence_elation', progress: 100, triggered: true }];
  game.enemies.forEach(enemy => { enemy.hp = 10000; enemy.maxHp = 10000; enemy.attack = 1; });
  assert.ok(validateSave(game), 'the generated display fixture is a valid current-engine save');
  return game;
}

async function staticServer() {
  const child = spawn(process.execPath, ['scripts/server.mjs', '--port', '0'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const origin = await new Promise((resolveStartup, rejectStartup) => {
    let stdout = '', stderr = '';
    const timer = setTimeout(() => finish(new Error(`UI server startup timed out: ${stderr}`)), 10000);
    const onData = chunk => { stdout += chunk; const match = stdout.match(/http:\/\/localhost:(\d+)/); if (match) finish(null, `http://127.0.0.1:${match[1]}/`); };
    const onError = error => finish(error);
    const onExit = code => finish(new Error(`UI server exited ${code}: ${stderr}`));
    const onStderr = chunk => { stderr += chunk; };
    function finish(error, value) { clearTimeout(timer); child.stdout.off('data', onData); child.stderr.off('data', onStderr); child.off('error', onError); child.off('exit', onExit); error ? rejectStartup(error) : resolveStartup(value); }
    child.stdout.on('data', onData); child.stderr.on('data', onStderr); child.once('error', onError); child.once('exit', onExit);
  });
  return { origin, async close() { if (child.exitCode !== null || child.signalCode !== null) return; const closed = once(child, 'exit'); child.kill(); await closed; } };
}

/** UI/functional evidence only: generated fixtures do not establish difficulty balance or physical-device compatibility. */
export async function checkEditionUi({ outputDirectory = null, playerFile, developmentFile, executablePath = process.env.BROWSER_EXECUTABLE_PATH, widths = [1440, 320, 390, 820] } = {}) {
  assert.equal(Boolean(playerFile), Boolean(developmentFile), 'provide both final edition files or neither');
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
  if (outputDirectory) await mkdir(outputDirectory, { recursive: true });
  const site = playerFile ? null : await staticServer();
  const urls = playerFile ? { player: pathToFileURL(resolve(playerFile)).href, development: pathToFileURL(resolve(developmentFile)).href } : { player: site.origin, development: new URL('development.html', site.origin).href };
  const browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}), ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  const report = { checkedAt: new Date().toISOString(), browser: browser.version(), scope: 'Isolated Chromium browser UI and manual-action equivalence; generated saves only. Responsive CSS widths are not physical Android/iPad verification. No pressure-curve or balance claims.', sources: urls, artifacts: {}, viewports: [], passed: false };
  if (playerFile) for (const edition of ['player', 'development']) { const file = resolve(edition === 'player' ? playerFile : developmentFile); const bytes = await readFile(file); report.artifacts[edition] = { file, bytes: bytes.length, sha256: digest(bytes) }; }
  const fixture = displayFixture();
  const payload = { game: fixture, settings: { sound: false, animations: false }, stats: { runs: 1, wins: 0, bestFloor: 1 } };
  let activeEntry;
  try {
    for (const width of widths) {
      const entry = { width, height: width === 1440 ? 1000 : 900, checks: [], screenshots: [], errors: [], requests: {} };
      activeEntry = entry;
      report.viewports.push(entry);
      const context = await browser.newContext({ viewport: { width, height: entry.height }, hasTouch: width <= 820, reducedMotion: 'reduce', serviceWorkers: 'block', offline: Boolean(playerFile), acceptDownloads: true });
      try {
        if (playerFile) await context.route(/^https?:\/\//, route => route.abort());
        await context.addInitScript(({ storageKeys, initial }) => {
          for (const key of Object.values(storageKeys)) if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(initial));
          window.editionFixtureWorkers = [];
          window.editionFixtureWorkerMessages = [];
          const NativeWorker = window.Worker;
          window.Worker = class extends NativeWorker {
            constructor(url, options) { super(url, options); window.editionFixtureWorkers.push(String(url)); this.addEventListener('message', ({ data }) => window.editionFixtureWorkerMessages.push(data.type)); }
          };
        }, { storageKeys: keys, initial: payload });
        const pages = {};
        const check = (name, value) => { entry.checks.push(name); assert.ok(value, `${width}px: ${name}`); };
        const saved = (page, edition) => page.evaluate(key => JSON.parse(localStorage.getItem(key)).game, keys[edition]);
        const raw = (page, edition) => page.evaluate(key => localStorage.getItem(key), keys[edition]);
        const closeInspector = async page => { if (await page.locator('.inspect-popover').count()) await page.keyboard.press('Escape'); };
        const closePanel = async page => { await closeInspector(page); await page.locator('.utility-panel [data-action="close"]').last().click(); await page.locator('.utility-panel').waitFor({ state: 'detached' }); };
        const activateInspector = async (page, locator) => {
          // Finish ordinary page scrolling before the click. The inspector
          // intentionally dismisses on page motion, including focus scroll.
          await locator.scrollIntoViewIfNeeded();
          await page.mouse.move(0, 0);
          await page.waitForTimeout(150);
          const bounds = await locator.boundingBox();
          check('inspection anchor has a visible pointer target', bounds && bounds.y >= 0 && bounds.y + bounds.height <= entry.height);
          await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          await page.locator('.inspect-popover').waitFor();
        };
        const fits = async (page, label) => {
          const info = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth, panels: [...document.querySelectorAll('.modal,.inspect-popover')].map(element => { const rect = element.getBoundingClientRect(); return { left: rect.left, right: rect.right, client: element.clientWidth, scroll: element.scrollWidth }; }) }));
          check(`${label}: no horizontal overflow ${JSON.stringify(info)}`, info.page <= info.width + 1 && info.panels.every(panel => panel.left >= -1 && panel.right <= info.width + 1 && panel.scroll <= panel.client + 1));
        };
        const shot = async (page, edition, label) => { if (!outputDirectory) return; const filename = `${edition}-${width}-${label}.png`; const bytes = await page.screenshot({ path: join(outputDirectory, filename) }); entry.screenshots.push({ file: filename, sha256: digest(bytes) }); };
        const checkNoAi = async page => {
          check('player has no AI or experiment controls', await page.locator('.ai-panel,.ai-recommendation,[data-ai-index],[data-action="aiLab"],[data-action="aiAutoplay"],[data-action="aiTrain"]').count() === 0);
          check('player creates no Worker', (await page.evaluate(() => window.editionFixtureWorkers)).length === 0);
        };
        for (const edition of ['player', 'development']) {
          const page = await context.newPage(); pages[edition] = page;
          entry.requests[edition] = [];
          page.on('pageerror', error => entry.errors.push(`${edition}: ${error.message}`));
          page.on('request', request => { if (/^https?:/.test(request.url())) entry.requests[edition].push(request.url()); });
          await page.goto(urls[edition]);
          await page.locator('[data-action="spin"]').waitFor();
          if (edition === 'development') await page.locator('.ai-panel [data-action="aiAutoplay"]').waitFor();
          check(`${edition}: exact generated fixture restored`, digest(await saved(page, edition)) === digest(validateSave(fixture)));
          if (edition === 'player') await checkNoAi(page);
          else check('development exposes AI lab and autoplay', await page.locator('.site-header [data-action="aiLab"]').count() === 1 && await page.locator('.ai-panel [data-action="aiAutoplay"]').isEnabled());
          await fits(page, `${edition} main`); await shot(page, edition, 'main');

          await page.locator('.site-header [data-action="help"]').click();
          const advanced = page.locator('.utility-panel .advanced-rules').filter({ hasText: '进阶战斗规则' });
          check(`${edition}: advanced combat rules start folded`, !(await advanced.getAttribute('open')) && !(await advanced.evaluate(element => element.open)));
          await advanced.locator('summary').click();
          check(`${edition}: precise formula remains readable`, (await advanced.innerText()).includes('同区相加') || (await advanced.innerText()).includes('同区百分比相加') || (await advanced.innerText()).includes('最多降低60%'));
          await fits(page, `${edition} advanced help`); await closePanel(page);

          await page.locator('.site-header [data-action="catalog"]').click();
          check(`${edition}: all recruitable characters in catalog`, await page.locator('[data-catalog-results] .character-card').count() === CHARACTERS.filter(character => character.recruitable !== false).length);
          const longCard = CHARACTERS.find(character => character.id === '1402');
          await page.locator('[data-catalog-search]').fill(longCard.name);
          check(`${edition}: complete long skill preserved on card`, await page.locator('.skill-description > span').first().textContent() === longCard.description);
          await activateInspector(page, page.locator('.skill-description').first());
          check(`${edition}: full skill is inspectable`, (await page.locator('.inspect-popover').textContent()).includes(longCard.description));
          if (edition === 'player') {
            const rules = page.locator('.inspect-popover > .inspect-body > .advanced-rules').filter({ hasText: '进阶规则与结算' });
            check('player character technical detail starts folded', !(await rules.evaluate(element => element.open)));
            await rules.locator(':scope > summary').click();
          }
          const detail = await page.locator('.inspect-popover').innerText();
          check(`${edition}: precise skill rule text is visible`, ['时点', '对象', '持续', '叠加'].every(text => detail.includes(text)));
          await fits(page, `${edition} skill details`); await shot(page, edition, 'skill');
          await closeInspector(page);
          for (const [tab, count] of [['items', ITEMS.length], ['essences', ESSENCES.length]]) {
            await page.locator(`[data-action="catalogTab"][data-tab="${tab}"]`).click();
            await page.locator('[data-catalog-search]').fill('');
            check(`${edition}: ${tab} catalog available`, await page.locator('.catalog-item').count() === count);
            await fits(page, `${edition} ${tab} catalog`);
          }
          await closePanel(page);
          await page.locator('[data-action="roster"]').first().click();
          check(`${edition}: roster and removal controls available`, await page.locator('.roster-grid .character-card').count() === fixture.roster.length && await page.locator('[data-action="removeAsk"]:not(:disabled)').count() === fixture.roster.length);
          await fits(page, `${edition} roster`); await closePanel(page);
          if (edition === 'player') {
            await page.locator('.main-panel [data-action="inventory"]').click();
            check('player inventory includes owned curios and essences', await page.locator('.utility-panel [data-action="item"]').count() === 1 && await page.locator('.utility-panel [data-action="essence"]').count() === 1);
            await activateInspector(page, page.locator('.utility-panel [data-action="item"]').first());
          } else await activateInspector(page, page.locator('.curios-panel [data-action="item"]').first());
          check(`${edition}: owned curio rules inspectable`, (await page.locator('.inspect-popover').innerText()).includes(ITEMS.find(item => item.id === fixture.items[0]).description));
          await fits(page, `${edition} curio`); await closeInspector(page);
          if (edition === 'player') await closePanel(page);
          await page.locator('.site-header [data-action="settings"]').click();
          check(`${edition}: manual save controls available`, await page.locator('[data-action="saveExport"]').count() === 1 && await page.locator('[data-action="saveImport"]').count() === 1);
          await fits(page, `${edition} settings`); await shot(page, edition, 'settings');
          await page.locator('.utility-panel [data-action="about"]').click();
          check(`${edition}: third-party attribution retained`, (await page.locator('.utility-panel').innerText()).includes('HoYoverse') && (await page.locator('.utility-panel').innerText()).includes('StarRailRes'));
          await fits(page, `${edition} about`); await closePanel(page);
          if (edition === 'development') { await page.locator('.site-header [data-action="aiLab"]').click(); await page.locator('[data-action="aiTrain"]').waitFor(); await fits(page, 'development AI lab'); await shot(page, edition, 'lab'); await closePanel(page); }
        }

        const otherBefore = await raw(pages.development, 'development');
        for (const edition of ['player', 'development']) {
          const page = pages[edition];
          if (edition === 'player') await page.locator('.main-panel [data-action="supplies"]').click();
          await page.locator('[data-action="supply"][data-kind="repair"]').click();
          await page.waitForFunction(({ key, hp }) => JSON.parse(localStorage.getItem(key)).game.hp === hp, { key: keys[edition], hp: purchaseSupply(fixture, 'repair').hp });
          check(`${edition}: supply updates real game state`, digest(await saved(page, edition)) === digest(purchaseSupply(fixture, 'repair')));
          if (edition === 'player') { await fits(page, 'player supplies'); await shot(page, edition, 'supplies'); await closePanel(page); check('player supply leaves development save unchanged', await raw(pages.development, 'development') === otherBefore); }
        }
        const equivalent = async label => check(`${label}: same game state across editions`, digest(await saved(pages.player, 'player')) === digest(await saved(pages.development, 'development')));
        await equivalent('manual supply');
        for (const edition of ['player', 'development']) {
          const page = pages[edition];
          await page.locator('[data-action="spin"]').click();
          await page.locator('[data-action="choose"]').first().waitFor();
          if (edition === 'player') await checkNoAi(page);
          else { await page.waitForFunction(() => window.editionFixtureWorkerMessages.includes('recommend')); check('development receives recommendation in a real Worker', (await page.evaluate(() => window.editionFixtureWorkers)).length > 0); check('development reward has recommendation probabilities', await page.locator('[data-ai-index] strong').count() > 0); }
          for (const card of await page.locator('.reward-cards .character-card').all()) { const id = await card.locator('.skill-description').getAttribute('data-character-id'); check(`${edition}: reward ${id} retains its complete skill`, await card.locator('.skill-description > span').textContent() === CHARACTERS.find(character => character.id === id).description); }
          await fits(page, `${edition} reward`); await shot(page, edition, 'reward');
        }
        await equivalent('manual spin');
        for (const edition of ['player', 'development']) await pages[edition].locator('[data-action="reroll"]').click();
        await equivalent('manual reroll');
        for (const edition of ['player', 'development']) { await pages[edition].locator('[data-action="choose"][data-index="0"]').click(); await pages[edition].waitForFunction(key => JSON.parse(localStorage.getItem(key)).game.phase === 'ready', keys[edition]); }
        await equivalent('manual recruitment');
        for (const edition of ['player', 'development']) {
          const page = pages[edition];
          await page.locator('[data-action="roster"]').first().click();
          await activateInspector(page, page.locator('[data-action="removeAsk"][data-id="u8"]'));
          const confirmBounds = await page.locator('.inspect-popover [data-action="removeConfirm"]').boundingBox();
          check(`${edition}: removal confirmation is reachable`, confirmBounds && confirmBounds.y >= 0 && confirmBounds.y + confirmBounds.height <= entry.height);
          await page.mouse.click(confirmBounds.x + confirmBounds.width / 2, confirmBounds.y + confirmBounds.height / 2);
          check(`${edition}: removal consumes a chance and removes the instance`, !(await saved(page, edition)).roster.some(unit => unit.uid === 'u8'));
          await closePanel(page);
          const beforeReload = await saved(page, edition); await page.reload(); await page.locator('[data-action="spin"]').waitFor();
          if (edition === 'development') await page.locator('.ai-panel').waitFor();
          check(`${edition}: refresh restores exact progress`, digest(await saved(page, edition)) === digest(beforeReload));
          await fits(page, `${edition} post-action restore`);
        }
        await equivalent('manual removal and refresh');
        entry.manualGameSha256 = digest(await saved(pages.player, 'player'));
        const player = pages.player, development = pages.development;
        await player.locator('.site-header [data-action="settings"]').click();
        const pendingDownload = player.waitForEvent('download'); await player.locator('[data-action="saveExport"]').click();
        const download = await pendingDownload; const stream = await download.createReadStream(); const chunks = []; for await (const chunk of stream) chunks.push(chunk); const archive = Buffer.concat(chunks).toString('utf8');
        check('player export contains its exact current game', digest(importSave(archive).game) === entry.manualGameSha256);
        await closePanel(player);
        const playerBeforeImport = await raw(player, 'player');
        const importArchive = async text => { await development.locator('.site-header [data-action="settings"]').click(); const chooser = development.waitForEvent('filechooser'); await development.locator('[data-action="saveImport"]').click(); await (await chooser).setFiles({ name: 'fixture-save.json', mimeType: 'application/json', buffer: Buffer.from(text) }); await development.locator('.utility-panel').waitFor({ state: 'detached' }); };
        const separate = newGame({ seed: 'v081-developer-independent-import', difficulty: 10 });
        await importArchive(exportSave({ ...payload, game: separate }));
        check('development import uses its own save namespace', (await saved(development, 'development')).seed === separate.seed && await raw(player, 'player') === playerBeforeImport);
        await importArchive(archive);
        check('player export imports into development without game changes', digest(await saved(development, 'development')) === entry.manualGameSha256);
        await checkNoAi(player);
        check('all pages have no uncaught errors', entry.errors.length === 0);
        if (playerFile) check('both final files make no HTTP requests', Object.values(entry.requests).every(requests => requests.length === 0));
      } catch (error) { entry.failure = error.stack; throw error; }
      finally { await context.close(); }
    }
    report.passed = true;
    return report;
  } catch (error) { report.failure = error.stack; if (activeEntry) activeEntry.passed = false; throw error; }
  finally { await browser.close(); await site?.close(); if (outputDirectory) await writeFile(join(outputDirectory, 'edition-ui-checks.json'), `${JSON.stringify(report, null, 2)}\n`); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  const result = await checkEditionUi({ outputDirectory: resolve(option('--out') || 'report/v081/ui'), playerFile: option('--player'), developmentFile: option('--development') });
  console.log(`Edition UI passed: ${result.viewports.length} widths, ${result.viewports.reduce((sum, viewport) => sum + viewport.checks.length, 0)} checks; ${result.browser}.`);
}
