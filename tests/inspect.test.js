import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';

// Opt in to actual browser coverage, using an existing installation only.
// Normal engine CI does not need a browser or any additional dependencies.
test('inspector keeps explanations local and preserves page interactions', { skip: process.env.INSPECT_BROWSER_TESTS !== '1' }, async t => {
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
  const browser = await playwright.chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}), ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 320, height: 640 }, hasTouch: true });
  await page.setContent(`<style>
    body { margin: 0; height: 1000px; }
    button { position: absolute; width: 65px; height: 35px; }
    #first { left: 12px; top: 60px; } #second { left: 100px; top: 60px; }
    #resource { left: 240px; top: 10px; } #outside { left: 220px; top: 400px; } #tall { left: 12px; top: 300px; }
    .inspect-popover { box-sizing: border-box; width: 300px; padding: 12px; background: white; border: 1px solid black; overflow-y: auto; z-index: 10; }
    .inspect-popover button { position: static; } .inspect-title { margin: 0; }
  </style><button id="first" data-inspect="character" data-inspect-click="true">First</button>
  <button id="second" data-inspect="character" data-inspect-click="true">Second</button>
  <button id="resource" data-inspect="shield">Shield</button><button id="outside">Action</button>
  <button id="tall" data-inspect="character" data-inspect-click="true">Long rules</button>
  <div id="status" data-inspect="mechanic" data-inspect-click="true" tabindex="0">Rerolls</div>`);
  const source = await readFile(new URL('../src/inspect.js', import.meta.url), 'utf8');
  await page.evaluate(async code => {
    const { createInspector } = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    window.actions = 0;
    window.escapes = 0;
    window.spins = 0;
    document.addEventListener('click', event => { if (event.target.closest('#resource, #outside')) window.actions++; });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') window.escapes++; if (event.code === 'Space') window.spins++; });
    window.inspector = createInspector({ resolve: anchor => ({ title: anchor.id, bodyHtml: anchor.id === 'tall' ? '<p>Detailed effect lifetime and stacking</p>'.repeat(35) : '<p>Explanation</p><button id="inside">Read more</button>' }) });
  }, source);
  const popup = page.locator('[data-inspector]');
  const touch = (selector, type, x = 250, y = 25) => page.evaluate(({ selector, type, x, y }) => {
    document.querySelector(selector).dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', pointerId: 21, clientX: x, clientY: y, isPrimary: true }));
  }, { selector, type, x, y });

  await t.test('hover crosses into the explanation, then dismisses on leave', async () => {
    await page.locator('#first').hover();
    await popup.waitFor();
    assert.equal(await popup.getAttribute('role'), 'tooltip');
    await popup.hover();
    await page.waitForTimeout(200);
    assert.equal(await popup.count(), 1);
    await page.mouse.move(300, 570);
    await popup.waitFor({ state: 'detached' });
  });

  await t.test('clicking another detail switches immediately; outside click still acts', async () => {
    await page.locator('#first').click();
    assert.equal(await page.locator('.inspect-title').textContent(), 'first');
    assert.equal(await popup.getAttribute('role'), 'dialog');
    await page.locator('#second').click();
    assert.equal(await page.locator('.inspect-title').textContent(), 'second');
    assert.equal(await popup.count(), 1);
    await page.locator('#inside').click();
    assert.equal(await popup.count(), 1);
    await page.locator('#outside').click();
    assert.equal(await popup.count(), 0);
    assert.equal(await page.evaluate(() => window.actions), 1);
    assert.equal(await page.locator('#first').getAttribute('aria-describedby'), null);
  });

  await t.test('long press explains a resource and suppresses only its generated click', async () => {
    await touch('#resource', 'pointerdown');
    await page.waitForTimeout(280);
    assert.equal(await popup.count(), 0);
    await popup.waitFor();
    await touch('#resource', 'pointerup');
    await page.locator('#resource').dispatchEvent('click', { bubbles: true, detail: 1 });
    assert.equal(await popup.count(), 1);
    assert.equal(await page.evaluate(() => window.actions), 1);
    const bounds = await popup.boundingBox();
    assert.ok(bounds.x >= 12 && bounds.x + bounds.width <= 308, 'explanation stays within a phone screen');
    await page.locator('#outside').click();
    assert.equal(await popup.count(), 0);
    assert.equal(await page.evaluate(() => window.actions), 2);
  });

  await t.test('scrolling and moving a touch cancel the pending hold', async () => {
    await touch('#resource', 'pointerdown');
    await touch('#resource', 'pointermove', 263, 25);
    await page.waitForTimeout(500);
    assert.equal(await popup.count(), 0);
    await touch('#resource', 'pointerdown');
    await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
    await page.waitForTimeout(500);
    assert.equal(await popup.count(), 0);
  });

  await t.test('a partial render removes the explanation only when its anchor disappears', async () => {
    await page.locator('#first').click();
    await page.evaluate(() => document.querySelector('#outside').textContent = 'Updated action');
    assert.equal(await popup.count(), 1, 'unrelated updates do not interrupt reading');
    await page.evaluate(() => {
      window.removedAnchor = document.querySelector('#first');
      window.removedAnchor.remove();
    });
    await popup.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.removedAnchor.getAttribute('aria-describedby')), null);
    await page.evaluate(() => document.body.append(window.removedAnchor));
  });

  await t.test('a tall explanation opens after pointer click without stealing its pointerup', async () => {
    await page.locator('#tall').click();
    assert.equal(await popup.count(), 1);
    assert.equal(await page.locator('.inspect-title').textContent(), 'tall');
    assert.equal(await popup.getAttribute('role'), 'dialog');
    await page.keyboard.press('Escape');
    await page.locator('#outside').focus();
    await page.locator('#tall').tap();
    assert.equal(await popup.count(), 1, 'native touch tap can also open rules taller than the screen');
    assert.equal(await popup.getAttribute('role'), 'dialog');
    await page.keyboard.press('Escape');
  });

  await t.test('keyboard focus is described and Escape closes only this explanation', async () => {
    await page.locator('#resource').focus();
    await popup.waitFor();
    assert.ok(await page.locator('#resource').getAttribute('aria-describedby'));
    await page.keyboard.press('Escape');
    assert.equal(await popup.count(), 0);
    assert.equal(await page.evaluate(() => window.escapes), 0);
    assert.equal(await page.locator('#resource').getAttribute('aria-describedby'), null);
    await page.locator('#status').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.inspect-title').textContent(), 'status');
    assert.equal(await popup.getAttribute('role'), 'dialog');
    await page.keyboard.press('Space');
    assert.equal(await popup.count(), 1);
    assert.equal(await page.evaluate(() => window.spins), 0, 'reading a mechanic never reaches the global spin shortcut');
    await page.evaluate(() => window.inspector.destroy());
    await page.locator('#first').click();
    assert.equal(await popup.count(), 0);
  });
});
