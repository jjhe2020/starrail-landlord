import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const saveKey = 'astral-reels:v1';

// Opt in so the ordinary engine suite never loads Playwright. Each viewport
// uses a fresh context and a generated fixture, never an existing player's save.
// Narrow Chromium viewports cover responsive UI; they are not Android hardware
// or content:// document-provider compatibility evidence.
test('effect explanations, expanded catalog and reward inspection in real browsers', {
  skip: process.env.EFFECT_BROWSER_TESTS !== '1', timeout: 180000,
}, async t => {
  const { newGame, spin, skipReward, validateSave } = await import('../src/engine.js');
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

  let fixture = newGame({ seed: 'ui-v040-semantics' });
  fixture.roster = ['1001', '1002', '1008', '1107', '1217', '1310', '1312', '1402'].map((id, i) => ({
    uid: `u${i + 1}`, id, stars: 1, growth: i === 1 ? 2 : 0, ticks: 3,
  }));
  fixture.uidCounter = 9;
  fixture.hp = 50;
  fixture.coins = 100;
  fixture.items = ['faith_bond', 'rubert_gear', 'compound_eye'];
  fixture.essences = [{ id: 'essence_elation', progress: 100, triggered: true }];
  fixture.enemies.forEach(enemy => { enemy.hp = 10000; enemy.maxHp = 10000; enemy.attack = 1; });
  fixture = spin(fixture);
  while (['recruit', 'item', 'essence'].includes(fixture.phase)) fixture = skipReward(fixture);
  assert.ok(validateSave(fixture), 'the display fixture is a valid current-engine save');

  // The display fixture only establishes inspectable effects, not AI strength or
  // difficulty balance. Start our own production static server on an OS-chosen
  // port unless explicitly reviewing a final portable file.
  let url;
  if (process.env.EFFECT_TEST_URL) {
    url = new URL(process.env.EFFECT_TEST_URL);
    assert.equal(url.protocol, 'file:', 'EFFECT_TEST_URL points to a final file:// HTML artifact');
  } else {
    const child = spawn(process.execPath, ['scripts/server.mjs', '--port', '0'], {
      cwd: projectRoot, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
    t.after(async () => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    });
    const origin = await new Promise((resolveStartup, rejectStartup) => {
      let output = '';
      let errors = '';
      const timer = setTimeout(() => finish(new Error(`Effect test server startup timed out: ${errors}`)), 10000);
      const onData = data => {
        output += data;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) finish(null, `http://127.0.0.1:${match[1]}/`);
      };
      const onError = error => finish(error);
      const onExit = code => finish(new Error(`Effect test server exited with ${code}: ${errors}`));
      const onStderr = data => { errors += data; };
      function finish(error, value) {
        clearTimeout(timer);
        child.stdout.off('data', onData);
        child.stderr.off('data', onStderr);
        child.off('error', onError);
        child.off('exit', onExit);
        if (error) rejectStartup(error); else resolveStartup(value);
      }
      child.stdout.on('data', onData);
      child.stderr.on('data', onStderr);
      child.once('error', onError);
      child.once('exit', onExit);
    });
    url = new URL(origin);
  }

  const screenshotDirectory = process.env.EFFECT_SCREENSHOT_DIR ? resolve(process.env.EFFECT_SCREENSHOT_DIR) : null;
  if (screenshotDirectory) await mkdir(screenshotDirectory, { recursive: true });
  const browser = await playwright.chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  t.after(() => browser.close());
  const errors = [];
  let checkCount = 0;
  const check = (name, value) => { assert.ok(value, name); checkCount++; };

  async function fits(page, label) {
    const info = await page.evaluate(() => ({
      width: innerWidth,
      page: document.documentElement.scrollWidth,
      panels: [...document.querySelectorAll('.utility-panel,.inspect-popover')].map(element => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, width: element.clientWidth, scroll: element.scrollWidth };
      }),
    }));
    check(`${label}: no horizontal overflow (${JSON.stringify(info)})`, info.page <= info.width + 1 &&
      info.panels.every(panel => panel.left >= -1 && panel.right <= info.width + 1 && panel.scroll <= panel.width + 1));
  }

  async function screenshot(page, name) {
    if (screenshotDirectory) await page.screenshot({ path: join(screenshotDirectory, `${name}.png`), fullPage: false });
  }

  async function longPress(context, page, locator) {
    const point = await locator.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      // The power/star badges have their own explanations. Hold a visible part
      // of the character itself, avoiding those nested inspector anchors.
      for (const yFraction of [0.35, 0.5, 0.2]) {
        for (const xFraction of [0.5, 0.75, 0.25]) {
          const x = bounds.x + bounds.width * xFraction;
          const y = bounds.y + bounds.height * yFraction;
          if (document.elementFromPoint(x, y)?.closest('[data-inspect]') === element) return { x, y };
        }
      }
      return null;
    });
    assert.ok(point, 'the held character has a visible touch target');
    const session = await context.newCDPSession(page);
    // The isolated context owns this session and closes it at the end. Detaching
    // a CDP session during the flow can reset Chromium's offline emulation.
    // Dispatch trusted touch input, holding beyond the UI's 450 ms threshold.
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await page.waitForTimeout(500);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.locator('.inspect-popover').waitFor();
  }

  for (const width of [1440, 390, 320]) {
    await t.test(`${width}px: duration rules, nonblocking details and catalog`, async () => {
      const context = await browser.newContext({
        viewport: { width, height: width === 1440 ? 1000 : 844 }, hasTouch: width < 600,
        reducedMotion: 'reduce', serviceWorkers: 'block', offline: url.protocol === 'file:',
      });
      const httpRequests = [];
      context.on('request', request => { if (/^https?:/.test(request.url())) httpRequests.push(request.url()); });
      if (url.protocol === 'file:') await context.route(/^https?:\/\//, route => route.abort());
      try {
        await context.addInitScript(({ key, game }) => {
          localStorage.setItem(key, JSON.stringify({ game, settings: { sound: false, animations: false }, stats: { runs: 1, wins: 0, bestFloor: 1 } }));
        }, { key: saveKey, game: fixture });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
        await page.goto(url.href);
        await page.locator('[data-action="spin"]').waitFor();
        const firstLoadOffline = await page.evaluate(() => navigator.onLine === false);
        await fits(page, `${width}px base`);
        check(`${width}px effect status visible`, await page.locator('.effect-status').count() === 1);
        check(`${width}px historical damage label`, (await page.locator('.last-total').innerText()).includes('上次总伤害'));
        await page.locator('[data-action="effects"]').click();
        await fits(page, `${width}px ledger`);
        check(`${width}px ledger is nonblocking`, await page.locator('.modal-backdrop').count() === 0 && await page.locator('.effect-ledger').count() === 1);
        const ledgerText = await page.locator('.effect-ledger').innerText();
        check(`${width}px separates history from persistent sources`, ledgerText.includes('历史结算记录') && ledgerText.includes('实例成长') && ledgerText.includes('本关负面'));
        await page.locator('.mission-heading h1').click();
        check(`${width}px outside closes ledger`, await page.locator('.utility-panel').count() === 0);

        const unit = page.locator('.reel-cell[data-action="character"]').filter({ has: page.locator('b', { hasText: '丹恒' }) }).first();
        await unit.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        if (width === 1440) {
          await page.mouse.move(0, 0);
          await unit.locator('img').hover();
          await page.locator('.inspect-popover').waitFor();
        } else await longPress(context, page, unit);
        await fits(page, `${width}px inspector`);
        const characterText = await page.locator('.inspect-popover').innerText();
        check(`${width}px precise power and duration rules: ${characterText}`, ['本局永久', '后置临时加成', '时点', '叠加'].every(text => characterText.includes(text)));
        await screenshot(page, `effects-${width}`);
        await page.locator('.mission-heading h1').click();
        check(`${width}px outside closes inspector`, await page.locator('.inspect-popover').count() === 0);

        await page.locator('[data-action="catalog"]').first().click();
        check(`${width}px 64 characters displayed`, await page.locator('[data-catalog-results] .character-card').count() === 64);
        await page.locator('[data-catalog-search]').fill('阮·梅');
        check(`${width}px catalog search retains input focus`, await page.locator('[data-catalog-results] .character-card').count() === 1 &&
          await page.locator('[data-catalog-search]').evaluate(element => element === document.activeElement));
        await page.locator('.skill-description').click();
        const growthText = await page.locator('.inspect-popover').innerText();
        check(`${width}px permanent team growth explained`, growthText.includes('本局永久') && growthText.includes('0.25'));
        await fits(page, `${width}px catalog info`);
        await page.keyboard.press('Escape');
        await page.locator('[data-catalog-search]').fill('');
        await page.locator('[data-action="catalogTab"][data-tab="items"]').click();
        check(`${width}px 64 unique item cards`, await page.locator('[data-catalog-results] .catalog-item').count() === 64);
        check(`${width}px item descriptions use available card width`, await page.locator('[data-catalog-results] .catalog-item').evaluateAll(cards => cards.every(card => card.children[1].getBoundingClientRect().width > card.getBoundingClientRect().width / 2)));
        await page.locator('[data-catalog-results] .catalog-item').first().click();
        const itemText = await page.locator('.inspect-popover').innerText();
        check(`${width}px item trigger and duration explained`, itemText.includes('持续') && itemText.includes('叠加'));
        await page.keyboard.press('Escape');
        await page.locator('[data-action="catalogTab"][data-tab="essences"]').click();
        check(`${width}px 32 essence cards and local art`, await page.locator('[data-catalog-results] .catalog-item').count() === 32 &&
          await page.locator('[data-catalog-results] .curio-art img').count() === 32);
        check(`${width}px essence descriptions use available card width`, await page.locator('[data-catalog-results] .catalog-item').evaluateAll(cards => cards.every(card => card.children[1].getBoundingClientRect().width > card.getBoundingClientRect().width / 2)));
        await fits(page, `${width}px expanded catalog`);
        await screenshot(page, `catalog-${width}`);
        await page.locator('.utility-panel [data-action="close"]').click();
        await page.locator('.all-synergies').click();
        check(`${width}px all 21 resonances`, await page.locator('.all-synergy-grid .synergy').count() === 21);
        await fits(page, `${width}px resonance`);
        await page.locator('.utility-panel [data-action="close"]').click();

        await page.locator('[data-action="spin"]').click();
        await page.locator('.reward-modal').waitFor();
        await page.waitForFunction(() => {
          const rates = [...document.querySelectorAll('.ai-probability-heading strong')];
          return rates.length === 4 && rates.every(element => element.textContent.includes('%'));
        });
        check(`${width}px all 4 choices have recommendation`, await page.locator('.ai-probability-heading strong').count() === 4);
        const skill = page.locator('.reward-cards .skill-description').first();
        await skill.scrollIntoViewIfNeeded();
        if (width === 1440) await skill.click(); else await skill.tap();
        await screenshot(page, `reward-${width}`);
        check(`${width}px skill inspection preserves the pending reward`, await page.locator('.inspect-popover').count() === 1 && await page.locator('.reward-modal').count() === 1);
        await fits(page, `${width}px reward inspector`);
        const candidateText = await page.locator('.inspect-character').innerText();
        check(`${width}px unrecruited candidate shows base instead of historical empty-cell zero`, candidateText.includes('基础威力（含成长）') && !candidateText.includes('上次结算威力'));
        await page.waitForFunction(() => [...document.images].filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0));
        check(`${width}px displayed images decode`, await page.evaluate(() => [...document.images].filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0)));
        if (url.protocol === 'file:') {
          check(`${width}px first file load stays offline with zero HTTP requests: ${JSON.stringify(httpRequests)}`, firstLoadOffline && await page.evaluate(() => navigator.onLine === false) && httpRequests.length === 0);
        }
      } finally { await context.close(); }
    });
  }
  check('no browser page errors', errors.length === 0);
  t.diagnostic(`${checkCount} UI checks passed; ${errors.length} uncaught page errors; ${url.protocol === 'file:' ? 'file:// offline' : 'isolated localhost server'}.`);
});
