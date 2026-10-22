import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { homedir, tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { newGame, spin, inspectSpin, chooseReward, purchaseSupply, validateSave } from '../src/engine.js';
import { createPortableFixture } from './portable-fixture.js';

const saveKey = 'astral-reels:v1';
// Saves use JSON; its canonical representation intentionally normalizes -0.
const savedForm = state => JSON.parse(JSON.stringify(state));
const transientSelector = '.combat-fx-layer .fx-sprite, .combat-fx-layer .fx-number, .combat-fx-layer .fx-beam';

function fixture(clear = false) {
  const state = newGame({ seed: `motion-v080-${clear ? 'clear' : 'mixed'}`, mode: 'combat' });
  const ids = ['1001','1002','1003','1004','1005','1006','1008','1009','1101','1102','1103','1104','1105','1106','1107','1203','1207','1211','1217','1002'];
  state.roster = ids.map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, attackBonus: 0, growth: 0, ticks: 3 }));
  state.uidCounter = 21;
  state.board = structuredClone(state.roster);
  state.hp = 30;
  state.coins = 100;
  state.enemies = Array.from({ length: 5 }, (_, col) => ({ id: `target-${col}`, name: `动效靶标 ${col + 1}`, col, hp: clear ? 1 : 10000, maxHp: clear ? 1 : 10000, attack: 7, boss: false }));
  state.enemySkill = { id: 'pressure', name: '动效验证', description: '独立动效验证靶标，每列反击 7 点。' };
  const canonical = validateSave(state);
  assert.ok(canonical, 'the browser fixture is a valid current-engine save');
  const after = spin(canonical);
  assert.equal(after.board.filter(Boolean).length, 20, 'all 20 cells take part in this stress fixture');
  assert.ok(after.lastSpin.healing > 0 && after.lastSpin.shield > 0, 'healing and shield effects actually resolve');
  assert.ok(after.lastSpin.effects.some(effect => effect.type === 'attackGrowth') && after.lastSpin.effects.some(effect => ['attackPercent','damageBonus'].includes(effect.type)), 'training and amplification actually resolve');
  assert.ok(after.lastSpin.hits.length > 0, 'attacks actually resolve');
  if (clear) assert.ok(after.enemies.every(enemy => enemy.hp === 0) && after.pendingFloor, 'the clear fixture kills all five enemies and waits for reward choice');
  return canonical;
}

// This suite is opt-in: normal engine CI needs no browser. It opens a freshly
// bundled HTML directly from file:// with networking disabled, so the evidence
// covers first-load Chromium file use, not Android hardware or content://.
test('V0.8.0 combat motion: bounded playback, exact rules and responsive offline UI', {
  skip: process.env.MOTION_BROWSER_TESTS !== '1', timeout: 180000,
}, async t => {
  const { buildPortable } = await import('../scripts/build-portable.mjs');
  const directory = await mkdtemp(join(tmpdir(), 'astral-motion-browser-'));
  assert.ok(directory.startsWith(resolve(tmpdir()) + sep));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let root, build;
  if (process.env.MOTION_TEST_FILE) {
    root = fileURLToPath(new URL('..', import.meta.url));
    const sourceOutput = resolve(process.env.MOTION_TEST_FILE);
    assert.ok(sourceOutput.endsWith('.html'), 'the explicit release artifact is an HTML file');
    const html = await readFile(sourceOutput, 'utf8');
    const output = join(directory, basename(sourceOutput));
    await writeFile(output, html);
    build = { output, sourceOutput, html, version: (await readFile(join(root, 'VERSION'), 'utf8')).trim() };
  } else {
    const fixture = await createPortableFixture(directory);
    root = fixture.root;
    build = await buildPortable({ root, esbuild: fixture.esbuild });
  }
  const evidenceDirectory = process.env.MOTION_EVIDENCE_DIR ? resolve(process.env.MOTION_EVIDENCE_DIR) : null;
  if (evidenceDirectory) await mkdir(evidenceDirectory, { recursive: true });
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require(join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
  const browser = await playwright.chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}), ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
  t.after(() => browser.close());
  const sourceSha256 = Object.fromEntries(await Promise.all(['src/app.js','src/engine.js','src/combat-motion.js','src/combat-player.js','src/ui-motion.js','styles.css','public/assets/effects/astral-fx.webp'].map(async path => [path, createHash('sha256').update(await readFile(join(root, path))).digest('hex')])));
  const evidence = { version: build.version, artifactPath: build.sourceOutput || build.output, artifactKind: process.env.MOTION_TEST_FILE ? 'release-artifact-immutable-copy' : 'independent-test-bundle', portableSha256: createHash('sha256').update(build.html).digest('hex'), sourceSha256, browser: browser.version(), protocol: 'file:', offline: true, deviceScope: 'Chromium desktop and narrow touch viewports; no physical mobile-device claim', fixtures: [] };

  async function openPage({ width = 1265, animations = true, reduced = false, clear = false, video = false, customGame = null } = {}) {
    const game = customGame || fixture(clear);
    const context = await browser.newContext({
      viewport: { width, height: width === 1265 ? 900 : 844 }, hasTouch: width < 600,
      reducedMotion: reduced ? 'reduce' : 'no-preference', offline: true, serviceWorkers: 'block',
      ...(video && evidenceDirectory ? { recordVideo: { dir: join(evidenceDirectory, 'raw-video'), size: { width, height: width === 1265 ? 900 : 844 } } } : {}),
    });
    const requests = [], errors = [];
    context.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await context.route(/^https?:\/\//, route => route.abort());
    await context.addInitScript(({ key, game, animations }) => {
      localStorage.setItem(key, JSON.stringify({ game, settings: { sound: false, animations }, stats: { runs: 1, wins: 0, bestFloor: 1 } }));
      window.__motionClasses = [];
      const recordClasses = node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const nodes = [node, ...node.querySelectorAll('.modal-enter,.modal-leaving,.fx-sprite,.fx-beam,.fx-number')];
        for (const element of nodes) {
          if (element.matches('.modal-enter,.modal-leaving')) window.__motionClasses.push(element.className);
          const trial = window.__motionTrial;
          if (trial && element.matches('.fx-sprite,.fx-beam,.fx-number')) trial.classes.push(element.className);
        }
      };
      const sample = timestamp => {
        const trial = window.__motionTrial;
        if (!trial || trial.done) return;
        const now = performance.now();
        if (timestamp !== undefined) {
          if (trial.lastFrame !== null) trial.frames.push(timestamp - trial.lastFrame);
          trial.lastFrame = timestamp;
        }
        const layer = document.querySelector('.combat-fx-layer');
        const fxCount = document.querySelectorAll('.combat-fx-layer .fx-sprite,.combat-fx-layer .fx-number,.combat-fx-layer .fx-beam').length;
        const subtreeCount = layer?.querySelectorAll('*').length || 0;
        trial.peakFxNodes = Math.max(trial.peakFxNodes, fxCount);
        trial.peakSubtreeNodes = Math.max(trial.peakSubtreeNodes, subtreeCount);
        if (fxCount && trial.firstFxAt === null) trial.firstFxAt = now - trial.start;
        if (document.querySelector('.arena[data-combat-stage="attack"]') && trial.firstAttackAt === null) trial.firstAttackAt = now - trial.start;
        if (document.querySelector('.enemy-defeated') && trial.firstDefeatedAt === null) trial.firstDefeatedAt = now - trial.start;
        if (document.querySelector('.arena[data-combat-stage="retaliation"]') && trial.firstRetaliationAt === null) trial.firstRetaliationAt = now - trial.start;
        if (document.querySelector('.reward-modal') && trial.rewardAt === null) trial.rewardAt = now - trial.start;
        const emptyCount = document.querySelectorAll('.enemy-slot.empty').length;
        if (emptyCount && trial.firstEmptyAt === null) trial.firstEmptyAt = now - trial.start;
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved.game.stats.spins > trial.beforeSpins) {
          trial.durationMs = now - trial.start;
          trial.effectsAtCommit = fxCount;
          trial.done = true;
          requestAnimationFrame(function waitForRewardEntry() {
            const panel = document.querySelector('.reward-modal');
            const active = panel?.getAnimations({ subtree: true }).some(animation => ['astralPanelIn','astralCardIn'].includes(animation.animationName) && ['running','pending'].includes(animation.playState));
            if (!active) trial.rewardEntryCompleteMs = performance.now() - trial.start;
            else requestAnimationFrame(waitForRewardEntry);
          });
        }
      };
      const observer = new MutationObserver(records => {
        for (const record of records) {
          if (record.type === 'attributes') recordClasses(record.target);
          else record.addedNodes.forEach(recordClasses);
        }
        sample();
      });
      document.addEventListener('DOMContentLoaded', () => observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }));
      try { new PerformanceObserver(list => {
        const trial = window.__motionTrial;
        if (trial) trial.longtasks.push(...list.getEntries().filter(entry => entry.startTime >= trial.start).map(entry => ({ start: entry.startTime - trial.start, duration: entry.duration })));
      }).observe({ type: 'longtask', buffered: true }); } catch { /* Older Chromium may omit Long Tasks. */ }
      document.addEventListener('click', event => {
        if (event.target.closest('[data-action="spin"]')?.disabled !== false || window.__motionTrial && !window.__motionTrial.done) return;
        window.__motionTrial = { start: performance.now(), beforeSpins: JSON.parse(localStorage.getItem(key)).game.stats.spins, classes: [], frames: [], longtasks: [], peakFxNodes: 0, peakSubtreeNodes: 0, firstFxAt: null, firstAttackAt: null, firstDefeatedAt: null, firstRetaliationAt: null, firstEmptyAt: null, rewardAt: null, lastFrame: null, done: false };
        requestAnimationFrame(function frame(timestamp) { sample(timestamp); if (!window.__motionTrial.done) requestAnimationFrame(frame); });
      }, true);
    }, { key: saveKey, game, animations });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(build.output).href);
    await page.locator('[data-action="spin"]:not(:disabled)').waitFor();
    await page.waitForFunction(() => [...document.images].filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0));
    assert.equal(await page.evaluate(() => location.protocol), 'file:');
    assert.equal(await page.evaluate(() => navigator.onLine), false);
    assert.deepEqual((await saved(page)).game, game, 'the fixture starts without changing game state');
    return { context, page, game, errors, requests };
  }
  async function saved(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey); }
  async function fits(page, label) {
    const sizes = await page.evaluate(() => ({ width: innerWidth, page: document.documentElement.scrollWidth, panels: [...document.querySelectorAll('.modal,.combat-fx-layer')].map(element => { const box = element.getBoundingClientRect(); return { left: box.left, right: box.right }; }) }));
    assert.ok(sizes.page <= sizes.width + 1 && sizes.panels.every(panel => panel.left >= -1 && panel.right <= sizes.width + 1), `${label} fits the viewport: ${JSON.stringify(sizes)}`);
  }
  async function startSpin(page) {
    await page.locator('.arena').evaluate(element => element.scrollIntoView({ block: 'start' }));
    await page.locator('[data-action="spin"]').evaluate(element => element.click());
  }
  async function finishSpin(page) {
    await page.waitForFunction(() => window.__motionTrial?.done, null, { timeout: 5000 });
    await page.locator('[data-action="choose"]').first().waitFor();
    await page.waitForFunction(() => window.__motionTrial.rewardEntryCompleteMs !== undefined, null, { timeout: 1000 });
    await page.waitForTimeout(80); // Let the Long Tasks observer deliver its last entry.
    return page.evaluate(() => {
      const trial = window.__motionTrial;
      const frames = [...trial.frames].sort((a, b) => a - b);
      return { durationMs: trial.durationMs, firstFxAt: trial.firstFxAt, firstAttackAt: trial.firstAttackAt, firstDefeatedAt: trial.firstDefeatedAt, firstRetaliationAt: trial.firstRetaliationAt, rewardEntryCompleteMs: trial.rewardEntryCompleteMs, rewardAt: trial.rewardAt, firstEmptyAt: trial.firstEmptyAt, peakFxNodes: trial.peakFxNodes, peakSubtreeNodes: trial.peakSubtreeNodes, effectsAtCommit: trial.effectsAtCommit, classes: [...new Set(trial.classes)], frameCount: frames.length, frameGapP95Ms: frames[Math.floor(frames.length * .95)] || 0, frameGapMaxMs: frames.at(-1) || 0, longtasks: trial.longtasks };
    });
  }
  async function checkClean(opened) {
    assert.deepEqual(opened.errors, [], 'there are no uncaught browser errors');
    assert.deepEqual(opened.requests, [], 'first-load offline play attempts no HTTP or HTTPS requests');
    assert.equal(await opened.page.locator(transientSelector).count(), 0, 'transient effect nodes are removed after playback');
    assert.equal(await opened.page.locator('.reel-frame.is-spinning').count(), 0, 'the spinning state is cleared');
    assert.equal(await opened.page.locator('.arena[aria-busy="true"]').count(), 0, 'the arena releases its busy state');
  }

  for (const width of [1265, 390, 320]) {
    await t.test(`${width}px: 20 active cells, support VFX, attacks, one reward and cleanup`, async () => {
      const opened = await openPage({ width, video: width === 1265 });
      const { context, page, game } = opened;
      const video = page.video();
      try {
        await fits(page, `${width}px before combat`);
        assert.equal(await page.locator('body.motion-disabled').count(), 0, 'enabled animations remain enabled');
        await startSpin(page);
        await page.waitForTimeout(150);
        assert.deepEqual((await saved(page)).game, game, 'the result is not committed before its playback');
        assert.equal(await page.locator('.reward-modal').count(), 0, 'reward does not cover combat before its completion');
        assert.equal(await page.locator('.enemy-art').count(), 5, 'all pre-hit enemies remain visible during reel entry');
        await page.evaluate(() => {
          document.querySelector('[data-action="spin"]').click();
          document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
          document.querySelector('[data-action="supply"][data-kind="repair"]').click();
        });
        await page.waitForFunction(() => document.querySelector('.combat-fx-layer .fx-sprite,.combat-fx-layer .fx-beam'));
        await page.waitForTimeout(180);
        await fits(page, `${width}px during combat`);
        assert.equal(await page.locator('.combat-status[role="status"]').count(), 1, 'combat offers a live text status');
        assert.match(await page.locator('.fx-sprite').first().evaluate(element => getComputedStyle(element).backgroundImage), /^url\(["']?data:image\/webp;base64,/, 'the live effect uses the embedded AI-art atlas offline');
        if (evidenceDirectory) await page.screenshot({ path: join(evidenceDirectory, `motion-${width}-support.png`) });
        await page.waitForFunction(() => [...document.querySelectorAll('.fx-attack')].some(element => Number(getComputedStyle(element).opacity) > .5));
        if (evidenceDirectory) await page.screenshot({ path: join(evidenceDirectory, `motion-${width}-combat.png`) });
        const metrics = await finishSpin(page);
        assert.ok(metrics.rewardEntryCompleteMs <= 3000, `combat and reward entrance finish within 3 s (${metrics.rewardEntryCompleteMs.toFixed(1)} ms)`);
        assert.ok(metrics.durationMs <= 3000, `the full 20-cell spin finishes within 3 s (${metrics.durationMs.toFixed(1)} ms)`);
        assert.ok(metrics.peakFxNodes > 0 && metrics.peakFxNodes <= 48, `effect nodes stay bounded (${metrics.peakFxNodes})`);
        assert.ok(metrics.peakSubtreeNodes <= 48, `effect subtree stays bounded (${metrics.peakSubtreeNodes})`);
        assert.ok(metrics.classes.some(name => /fx-beam/.test(name)) && metrics.classes.some(name => /fx-sprite/.test(name)), 'visible beams and AI-art sprites are both used');
        for (const kind of ['attack', 'shield', 'heal', 'resonance']) assert.ok(metrics.classes.some(name => name.split(/\s+/).includes(`fx-${kind}`)), `${kind} has its own actual visual`);
        assert.equal(metrics.effectsAtCommit, 0, 'no combat nodes survive the state commit');
        const result = spin(game);
        assert.deepEqual((await saved(page)).game, savedForm(result), 'animated combat produces exactly the engine result and ignores repeated actions');
        await checkClean(opened);
        await fits(page, `${width}px reward`);

        await page.locator('[data-action="choose"]').first().evaluate(element => { element.click(); element.click(); });
        await page.waitForFunction(() => !document.querySelector('.reward-modal'), null, { timeout: 1000 });
        assert.deepEqual((await saved(page)).game, savedForm(chooseReward(result, 0)), 'the reward leave animation commits only one selection');
        const modalClasses = await page.evaluate(() => window.__motionClasses);
        assert.ok(modalClasses.some(name => name.includes('modal-enter')), 'reward has an entrance transition');
        assert.ok(modalClasses.some(name => name.includes('modal-leaving')), 'reward has an exit transition');
        assert.equal(await page.locator('[data-action="spin"]').isEnabled(), true, 'controls settle ready for the next turn');
        const beforeSupply = (await saved(page)).game;
        await page.locator('[data-action="supply"][data-kind="repair"]').evaluate(element => element.click());
        assert.match(await page.locator('.purchase-feedback[role="status"]').textContent(), /生命已恢复/, 'a purchase gives animated, readable feedback');
        await page.waitForFunction(() => !document.querySelector('.purchase-feedback'), null, { timeout: 1200 });
        assert.deepEqual((await saved(page)).game, savedForm(purchaseSupply(beforeSupply, 'repair')), 'supply feedback preserves the engine purchase result');

        if (width === 1265) {
          await page.locator('.site-header [data-action="settings"]').click();
          await page.locator('.utility-panel').waitFor();
          await fits(page, 'desktop settings entrance');
          await page.locator('.utility-panel [data-action="close"]').first().evaluate(element => element.click());
          await page.waitForFunction(() => !document.querySelector('.utility-panel'));
          await startSpin(page);
          await finishSpin(page);
          await page.locator('[data-action="choose"]').first().evaluate(element => element.click());
          await page.waitForTimeout(500);
        }
        await checkClean(opened);
        evidence.fixtures.push({ width, mode: 'motion-enabled', boardCells: 20, healing: result.lastSpin.healing, shield: result.lastSpin.shield, hitCount: result.lastSpin.hits.length, ...metrics });
      } finally {
        await context.close();
        if (evidenceDirectory && width === 1265 && video) await video.saveAs(join(evidenceDirectory, 'motion-desktop-proof.webm'));
      }
    });
  }

  await t.test('clear turn retains enemies until impact, then offers the floor reward', async () => {
    const opened = await openPage({ clear: true });
    try {
      await startSpin(opened.page);
      await opened.page.waitForTimeout(150);
      assert.equal(await opened.page.locator('.enemy-art').count(), 5, 'lethal turn still begins with five visible enemies');
      assert.equal(await opened.page.locator('.enemy-slot.empty').count(), 0, 'dead state is not rendered before the attacks');
      assert.equal(await opened.page.locator('.reward-modal').count(), 0);
      await opened.page.waitForFunction(() => document.querySelectorAll('.enemy-defeated').length === 5, null, { timeout: 2300 });
      assert.equal(await opened.page.locator('.reward-modal').count(), 0, 'reward waits until the remaining playback finishes');
      assert.deepEqual((await saved(opened.page)).game, opened.game, 'lethal impacts animate before committing the authoritative result');
      const metrics = await finishSpin(opened.page);
      assert.ok(metrics.firstDefeatedAt >= metrics.firstAttackAt, 'lethal enemies disappear only after an actual attack starts');
      assert.ok(metrics.durationMs <= 3000, `clear playback is also within 3 s (${metrics.durationMs.toFixed(1)} ms)`);
      assert.ok(metrics.firstEmptyAt !== null && metrics.firstEmptyAt >= metrics.firstFxAt, 'a lane clears only after VFX begin');
      assert.deepEqual((await saved(opened.page)).game, savedForm(spin(opened.game)));
      assert.equal(await opened.page.locator('.enemy-art').count(), 0, 'all defeated enemies disappear after impact');
      await checkClean(opened);
      evidence.fixtures.push({ width: 1265, mode: 'floor-clear', ...metrics });
    } finally { await opened.context.close(); }
  });

  await t.test('390px actual tap keeps the enemy and attack effects visible', async () => {
    const opened = await openPage({ width: 390, video: true });
    const video = opened.page.video();
    try {
      await opened.page.locator('[data-action="spin"]').tap();
      await opened.page.waitForFunction(() => [...document.querySelectorAll('.fx-attack')].some(element => Number(getComputedStyle(element).opacity) > .5));
      const visible = await opened.page.evaluate(() => {
        const enemy = document.querySelector('.enemy-formation').getBoundingClientRect();
        const board = document.querySelector('.reel-grid').getBoundingClientRect();
        return { viewport: innerHeight, enemyTop: enemy.top, enemyBottom: enemy.bottom, boardTop: board.top, boardBottom: board.bottom };
      });
      if (evidenceDirectory) await opened.page.screenshot({ path: join(evidenceDirectory, 'motion-390-actual-tap.png') });
      assert.ok(visible.enemyTop >= 0 && visible.enemyBottom <= visible.viewport && visible.boardTop < visible.viewport, `an actual tap presents the attack target on screen: ${JSON.stringify(visible)}`);
      const metrics = await finishSpin(opened.page);
      assert.ok(metrics.durationMs <= 3000);
      assert.deepEqual((await saved(opened.page)).game, savedForm(spin(opened.game)));
      await opened.page.locator('[data-action="choose"]').first().tap();
      await opened.page.waitForFunction(() => !document.querySelector('.reward-modal'));
      await opened.page.waitForTimeout(300);
      await opened.page.locator('[data-action="spin"]').tap();
      await finishSpin(opened.page);
      await opened.page.locator('[data-action="choose"]').first().tap();
      await opened.page.waitForFunction(() => !document.querySelector('.reward-modal'));
      await opened.page.waitForTimeout(300);
      await checkClean(opened);
      evidence.fixtures.push({ width: 390, mode: 'actual-tap', visible, ...metrics });
    } finally {
      await opened.context.close();
      if (evidenceDirectory && video) await video.saveAs(join(evidenceDirectory, 'motion-mobile-proof.webm'));
    }
  });

  await t.test('one failed animation still commits its exact result and unlocks controls', async () => {
    const opened = await openPage();
    try {
      await opened.page.evaluate(() => {
        const nativeAnimate = Element.prototype.animate;
        window.__motionFaultInjected = false;
        Element.prototype.animate = function (...args) {
          if (!window.__motionFaultInjected && this.matches('.fx-sprite')) {
            window.__motionFaultInjected = true;
            throw new Error('motion-fixture-animation-failure');
          }
          return nativeAnimate.apply(this, args);
        };
      });
      await startSpin(opened.page);
      await opened.page.waitForFunction(() => window.__motionTrial?.done && !document.querySelector('.arena[aria-busy="true"]'), null, { timeout: 3500 });
      assert.equal(await opened.page.evaluate(() => window.__motionFaultInjected), true, 'the failure really occurs inside animated playback');
      assert.deepEqual((await saved(opened.page)).game, savedForm(spin(opened.game)), 'a presentation fault cannot lose or duplicate an already resolved turn');
      await checkClean(opened);
      await opened.page.locator('[data-action="choose"]').first().evaluate(element => element.click());
      await opened.page.waitForFunction(() => !document.querySelector('.reward-modal'));
      assert.equal(await opened.page.locator('[data-action="spin"]').isEnabled(), true, 'the next turn remains playable');
      evidence.fixtures.push({ width: 1265, mode: 'injected-animation-failure', completed: true, uncaughtErrors: [...opened.errors] });
    } finally { await opened.context.close(); }
  });

  await t.test('preservation counterattack keeps its enemy alive through incoming damage', async () => {
    const state = newGame({ seed: 'review-preservation' });
    state.roster = ['1001','1104','1208','1002'].map((id, index) => ({ uid: `u${index + 1}`, id, stars: 1, attackBonus: 0, growth: 0, ticks: 0 }));
    state.uidCounter = 5;
    state.board = Array(20).fill(null);
    state.shield = 100;
    state.enemies = [{ ...state.enemies.find(enemy => enemy.col === 2), hp: 20, maxHp: 20, attack: 30 }];
    const game = validateSave(state);
    assert.ok(game, 'the causal browser fixture is a valid portable save');
    const inspected = inspectSpin(game);
    const remainingBeforeCounter = Math.round((20 - inspected.hits.filter(hit => hit.stage !== 'afterRetaliation').reduce((sum, hit) => sum + hit.amount, 0)) * 100) / 100;
    assert.ok(remainingBeforeCounter > 0 && inspected.hits.some(hit => hit.sourceId === 'preservation' && hit.stage === 'afterRetaliation' && hit.amount === remainingBeforeCounter), 'the fixture needs a real lethal post-retaliation counterattack');
    const opened = await openPage({ customGame: game });
    try {
      await startSpin(opened.page);
      await opened.page.waitForFunction(() => document.querySelector('.arena[data-combat-stage="retaliation"]'));
      assert.equal(await opened.page.locator('.enemy-defeated').count(), 0, 'the enemy remains alive while it retaliates');
      assert.ok(await opened.page.locator('.fx-hostile').count() > 0, 'incoming damage has its actual enemy-origin beam');
      assert.equal(await opened.page.locator('[data-enemy-col="2"] .enemy-hp').evaluate(element => Number(element.firstChild.textContent.replaceAll(',', ''))), remainingBeforeCounter, 'all default attacks including supports have landed; the later counterattack has not');
      const metrics = await finishSpin(opened.page);
      assert.ok(metrics.firstDefeatedAt > metrics.firstRetaliationAt, 'the lethal counterattack follows incoming damage');
      assert.ok(metrics.rewardEntryCompleteMs <= 3000);
      assert.deepEqual((await saved(opened.page)).game, savedForm(inspected.state));
      await checkClean(opened);
      evidence.fixtures.push({ width: 1265, mode: 'preservation-counterattack', ...metrics });
    } finally { await opened.context.close(); }
  });

  for (const interruption of ['preference-change', 'synthetic-visibility-change']) {
    await t.test(`${interruption}: active combat settles early and cleans up`, async () => {
      const opened = await openPage({ width: 390 });
      try {
        await startSpin(opened.page);
        await opened.page.waitForFunction(() => document.querySelector('.fx-sprite'));
        if (interruption === 'preference-change') await opened.page.emulateMedia({ reducedMotion: 'reduce' });
        else await opened.page.evaluate(() => {
          // Exercise the visibility handler deterministically. This simulates
          // the browser event; it does not claim a physical OS background test.
          Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        const metrics = await finishSpin(opened.page);
        assert.ok(metrics.durationMs < 1000, 'an interrupted presentation immediately settles its already resolved turn');
        assert.deepEqual((await saved(opened.page)).game, savedForm(spin(opened.game)));
        assert.equal(await opened.page.locator('body.motion-disabled').count(), 1);
        await checkClean(opened);
        evidence.fixtures.push({ width: 390, mode: interruption, ...metrics });
      } finally { await opened.context.close(); }
    });
  }

  for (const mode of ['setting-off', 'reduced-motion']) {
    await t.test(`${mode}: instant exact settlement without transient combat or modal effects`, async () => {
      const opened = await openPage({ width: 390, animations: mode !== 'setting-off', reduced: mode === 'reduced-motion' });
      try {
        assert.equal(await opened.page.locator('body.motion-disabled').count(), 1);
        await startSpin(opened.page);
        const metrics = await finishSpin(opened.page);
        assert.ok(metrics.durationMs < 600, `motion-disabled settlement is fast (${metrics.durationMs.toFixed(1)} ms)`);
        assert.equal(metrics.peakFxNodes, 0, 'disabled motion creates no transient VFX nodes');
        assert.equal(metrics.classes.length, 0);
        assert.deepEqual((await saved(opened.page)).game, savedForm(spin(opened.game)));
        await checkClean(opened);
        const classes = await opened.page.evaluate(() => window.__motionClasses);
        assert.equal(classes.length, 0, 'reduced or disabled motion does not add modal transition classes');
        evidence.fixtures.push({ width: 390, mode, ...metrics });
      } finally { await opened.context.close(); }
    });
  }

  if (evidenceDirectory) {
    await writeFile(join(evidenceDirectory, 'browser-metrics.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    await rm(join(evidenceDirectory, 'raw-video'), { recursive: true, force: true });
  }
  t.diagnostic(`${evidence.fixtures.length} offline Chromium scenarios; ${evidence.fixtures.filter(value => value.mode === 'motion-enabled').map(value => `${value.width}px ${value.durationMs.toFixed(0)} ms, peak ${value.peakFxNodes} effect nodes`).join('; ')}. Narrow viewports are not physical-device validation.`);
});
