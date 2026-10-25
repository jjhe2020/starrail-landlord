import test from 'node:test';
import { resolve } from 'node:path';

test('player/development editions preserve manual game rules, isolate saves, and expose appropriate UI', {
  skip: process.env.EDITION_BROWSER_TESTS !== '1', timeout: 240000,
}, async t => {
  const { checkEditionUi } = await import('../scripts/check-v081-ui.mjs');
  const report = await checkEditionUi({
    outputDirectory: process.env.EDITION_SCREENSHOT_DIR ? resolve(process.env.EDITION_SCREENSHOT_DIR) : null,
    playerFile: process.env.EDITION_PLAYER_FILE,
    developmentFile: process.env.EDITION_DEVELOPMENT_FILE,
  });
  t.diagnostic(`${report.browser}: ${report.viewports.length} fresh-context widths; ${report.viewports.reduce((sum, viewport) => sum + viewport.checks.length, 0)} checks. Responsive-browser coverage only; no real-device or balance claims.`);
});
