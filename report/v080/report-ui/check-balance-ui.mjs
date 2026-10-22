import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../..');
const report = path.join(root, 'report/v080-balance/index.html');
const game = path.join(root, 'artifacts/星穹转轮-v0.8.0.html');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const gameBefore = sha(await readFile(game));
assert.equal(gameBefore, '4febf00786db4eef0d357c1ccae141a707aa7ca3cdd65ff28708c329a5b52d9d');
const reportBefore = sha(await readFile(report));
const { chromium } = createRequire(import.meta.url)('/Users/hejiezhao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const result = {
  checkedAt: new Date().toISOString(),
  browser: `Chrome ${browser.version()}`,
  report: { path: path.relative(root, report), sha256: reportBefore },
  gameUnmodified: { path: path.relative(root, game), sha256: gameBefore },
  scope: 'Read-only offline report UI check in desktop browser at 1440 and 390 CSS px; not physical-device verification.',
  viewports: [],
};
let failure;
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 980 }, offline: true, hasTouch: width === 390 });
    const page = await context.newPage();
    const entry = { width, height: 980, checks: [], errors: [], httpRequests: [], screenshots: [] };
    result.viewports.push(entry);
    page.on('pageerror', error => entry.errors.push(error.message));
    page.on('request', request => { if (/^https?:/u.test(request.url())) entry.httpRequests.push(request.url()); });
    const check = (name, actual, expected) => { entry.checks.push({ name, actual, expected }); assert.deepEqual(actual, expected, `${width}px: ${name}`); };
    const shot = async name => {
      const filename = `balance-${width}-${name}.png`;
      const buffer = await page.screenshot({ path: path.join(out, filename) });
      entry.screenshots.push({ file: filename, sha256: sha(buffer) });
    };
    const visitSection = async id => {
      await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start' }));
      await page.evaluate(() => window.scrollBy(0, -100));
    };
    await page.goto(pathToFileURL(report).href);
    await page.locator('#cardRows tr').last().waitFor();
    check('initial character rows', await page.locator('#cardRows tr').count(), 90);
    check('initial character count', (await page.locator('#cardCount').textContent()).trim(), '90 / 90');
    check('initial stage rows', await page.locator('#stageRows tr').count(), 270);
    check('strategy rows', await page.locator('#policyRows tr').count(), 29);
    check('future trajectory rows', await page.locator('#futureRows tr').count(), 14);
    for (const id of ['tuning', 'layerRows', 'sources']) check(`${id} rows populated`, (await page.locator(`#${id} tr`).count()) > 0, true);
    check('populated table values contain no undefined or NaN', await page.locator('tbody').evaluateAll(elements => elements.every(element => !/undefined|NaN/u.test(element.textContent))), true);
    if (width === 1440) {
      const links = await page.locator('a[href]').evaluateAll(elements => [...new Set(elements.map(element => element.href))].filter(href => href.startsWith('file:') && !href.includes('#')));
      entry.evidenceLinks = await Promise.all(links.map(async href => {
        try { await access(fileURLToPath(href)); return { path: path.relative(root, fileURLToPath(href)), exists: true }; }
        catch { return { path: path.relative(root, fileURLToPath(href)), exists: false }; }
      }));
      check('all local evidence links resolve', entry.evidenceLinks.every(link => link.exists), true);
    }
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    entry.dimensions = dimensions;
    check('no page horizontal overflow', Math.max(dimensions.document, dimensions.body) <= width, true);
    entry.typography = await page.locator('#cardRows td').first().evaluate(element => ({ fontSize: getComputedStyle(element).fontSize, lineHeight: getComputedStyle(element).lineHeight }));
    check('table font at least 14px', Number.parseFloat(entry.typography.fontSize) >= 14, true);
    await shot('overview');
    await visitSection('characters');
    await shot('characters');

    const genericText = await page.locator('#cardRows').innerText();
    await page.locator('#background').selectOption('compatible');
    check('compatible background preserves 90 cards', await page.locator('#cardRows tr').count(), 90);
    check('compatible background updates values', (await page.locator('#cardRows').innerText()) !== genericText, true);
    await page.locator('#background').selectOption('generic');
    check('generic background restores values', await page.locator('#cardRows').innerText(), genericText);
    // Avoid duplicating large table content in evidence while retaining the assertion above.
    entry.checks[entry.checks.length - 1] = { name: 'generic background restores values', actual: true, expected: true };
    await page.locator('#role').selectOption('defense');
    const defenseCount = await page.locator('#cardRows tr').count();
    check('role filter narrows rows', defenseCount > 0 && defenseCount < 90, true);
    check('role filter contains only defense', await page.locator('#cardRows tr td:nth-child(2)').evaluateAll(elements => elements.every(element => element.textContent.startsWith('防御 /'))), true);
    check('stage table follows role filter', await page.locator('#stageRows tr').count(), defenseCount * 3);
    entry.defenseCount = defenseCount;
    await page.locator('#role').selectOption('all');
    await page.locator('#search').fill('阿格莱雅');
    check('name search finds one card', await page.locator('#cardRows tr').count(), 1);
    check('name search result', await page.locator('#cardRows tr td').first().evaluate(element => element.childNodes[0].textContent), '阿格莱雅');
    check('stage table follows name search', await page.locator('#stageRows tr').count(), 3);
    await visitSection('characters');
    await shot('aglaea');
    const cardTable = page.locator('#cardRows').locator('xpath=ancestor::div[contains(@class,"table-wrap")]');
    entry.characterTable = await cardTable.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
    if (entry.characterTable.scrollWidth > entry.characterTable.clientWidth) {
      await cardTable.evaluate(element => { element.scrollLeft = element.scrollWidth; });
      check('table scroll reaches final comparison column', await cardTable.evaluate(element => element.scrollLeft + element.clientWidth >= element.scrollWidth - 1), true);
      await shot('aglaea-last-columns');
      await cardTable.evaluate(element => { element.scrollLeft = 0; });
    }
    await page.locator('#search').fill('记忆');
    check('tag search finds matching cards', (await page.locator('#cardRows tr').count()) > 0, true);
    check('tag search excludes nonmatching cards', await page.locator('#cardRows tr td:first-child').evaluateAll(elements => elements.every(element => element.textContent.includes('记忆'))), true);
    await page.locator('#search').fill('无匹配测试词-v080');
    check('empty result count', (await page.locator('#cardCount').textContent()).trim(), '0 / 90');
    check('empty result rows', await page.locator('#cardRows tr').count(), 0);
    await page.locator('#search').fill('');
    check('clear search restores rows', await page.locator('#cardRows tr').count(), 90);

    check('D10 sample counts', await page.locator('#policyRows tr td:nth-child(2)').evaluateAll(elements => elements.every(element => / \/ 32$/u.test(element.textContent))), true);
    await page.locator('#difficulty').selectOption('stress');
    check('D20 sample counts', await page.locator('#policyRows tr td:nth-child(2)').evaluateAll(elements => elements.every(element => / \/ 8$/u.test(element.textContent))), true);
    check('D20 preserves strategy rows', await page.locator('#policyRows tr').count(), 29);
    await visitSection('policies');
    await shot('d20-strategies');
    await page.locator('#difficulty').selectOption('campaigns');
    const futureGeneric = await page.locator('#futureRows').innerText();
    await page.locator('#futureBackground').selectOption('compatible');
    check('future background updates values', (await page.locator('#futureRows').innerText()) !== futureGeneric, true);
    check('future background preserves rows', await page.locator('#futureRows tr').count(), 14);
    await page.locator('#futureBackground').selectOption('generic');
    await visitSection('layers');
    await shot('layers');
    await visitSection('evidence');
    await shot('evidence');
    check('no unhandled page errors', entry.errors, []);
    check('no network dependency', entry.httpRequests, []);
    check('no final page overflow', await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth), true);
    await context.close();
  }
} catch (error) {
  failure = error;
  result.error = error.stack;
} finally {
  result.reportUnmodified = sha(await readFile(report)) === reportBefore;
  result.gameUnmodified.verifiedAfter = sha(await readFile(game)) === gameBefore;
  result.passed = !failure && result.reportUnmodified && result.gameUnmodified.verifiedAfter;
  await browser.close();
  await writeFile(path.join(out, 'balance-browser-checks.json'), `${JSON.stringify(result, null, 2)}\n`);
}
if (failure) throw failure;
assert.equal(result.reportUnmodified, true);
assert.equal(result.gameUnmodified.verifiedAfter, true);
console.log(JSON.stringify({ passed: result.passed, reportSha256: reportBefore, gameSha256: gameBefore, viewports: result.viewports.map(entry => ({ width: entry.width, checks: entry.checks.length, screenshots: entry.screenshots.length, errors: entry.errors })) }));
