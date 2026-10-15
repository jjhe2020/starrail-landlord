import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import vm from 'node:vm';
import { buildPortable, escapeInlineScript } from '../scripts/build-portable.mjs';
import { newGame, spin } from '../src/engine.js';
import { recommendRewards } from '../src/ai.js';
import { CHARACTERS } from '../src/content.js';
import { createPortableFixture } from './portable-fixture.js';

async function publicFiles(root, directory = 'public') {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await publicFiles(root, path));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

function embeddedConfig(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  assert.equal(scripts.length, 2, 'the portable shell contains only its configuration and bundled application');
  assert.ok(scripts.every(([, attributes]) => !/\bsrc\s*=|\btype\s*=\s*["']module/i.test(attributes)), 'boot scripts are inline classic scripts');
  const context = vm.createContext({});
  new vm.Script(scripts[0][2]).runInContext(context);
  return { config: context.__ASTRAL_PORTABLE__, application: scripts[1][2] };
}

test('inline script escaping preserves text without permitting extra HTML scripts', () => {
  const value = '</script><script>globalThis.injected = true;</script> | </ScRiPt> | \u2028 | \u2029';
  const source = `globalThis.fixtureValue = ${JSON.stringify(value)};`;
  const escaped = escapeInlineScript(source);
  assert.doesNotMatch(escaped, /<\/script/i);
  assert.doesNotMatch(escaped, /[\u2028\u2029]/);
  const context = vm.createContext({});
  new vm.Script(escaped).runInContext(context);
  assert.equal(context.fixtureValue, value, 'HTML-sensitive text retains its original JavaScript value');
  assert.equal(context.injected, undefined);
});

test('portable build carries complete resources and a self-contained classic AI worker', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'astral-portable-test-'));
  assert.ok(directory.startsWith(resolve(tmpdir()) + sep), 'fixture cleanup stays inside its dedicated temporary directory');
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { root, esbuild } = await createPortableFixture(directory);
  const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const build = await buildPortable({ root, esbuild });
  assert.equal(build.output, join(root, 'artifacts', `星穹转轮-v${version}.html`), 'the default release is one clearly versioned shareable HTML file');
  assert.equal(build.version, version);
  assert.match(build.html, new RegExp(`<title>星穹转轮 v${version.replace(/\./g, '\\.')} · 离线单文件版</title>`));
  assert.equal(await readFile(build.output, 'utf8'), build.html);
  assert.equal(build.bytes, Buffer.byteLength(build.html));
  const { config, application } = embeddedConfig(build.html);
  assert.equal(config.format, 'astral-reels-single-file-v1');
  assert.equal(config.version, version);
  assert.equal(config.workerSource, build.workerSource);
  const files = await publicFiles(root);
  assert.deepEqual(Object.keys(config.assets).sort(), files, 'every shipped public resource is embedded, including undisplayed portraits and provenance');
  assert.equal(build.assetCount, files.length);
  for (const path of files) {
    const dataUrl = config.assets[path];
    assert.match(dataUrl, /^data:[^,]+;base64,/);
    const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
    assert.deepEqual(bytes, await readFile(resolve(root, path)), `${path} retains its exact source bytes`);
  }
  for (const character of CHARACTERS) assert.ok(config.assets[`public/assets/characters/${character.assetId}.png`]);
  for (const enemy of ['automaton', 'voidranger', 'frostspawn', 'mara', 'boss']) assert.ok(config.assets[`public/assets/enemies/${enemy}.svg`]);
  const manifest = JSON.parse(Buffer.from(config.assets['public/assets/characters/source-manifest.json'].split(',')[1], 'base64'));
  assert.equal(manifest.assets.length, CHARACTERS.length);
  assert.equal(manifest.sourceRepository, 'https://github.com/Mar-7th/StarRailRes');
  assert.equal(manifest.commit, 'dbe8cdfcfb0bf657b9fe1cf92d5537f118ccb487');
  assert.match(Buffer.from(config.assets['public/assets/StarRailRes-LICENSE.txt'].split(',')[1], 'base64').toString('utf8'), /GNU AFFERO GENERAL PUBLIC LICENSE/);
  assert.match(application, /HoYoverse/, 'third-party portrait attribution remains visible in the game');

  const shell = build.html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
  assert.doesNotMatch(shell, /\b(?:src|href)\s*=\s*["'](?!data:|#)[^"']+["']/i, 'HTML boot contains no file-relative or network asset dependencies');
  assert.doesNotMatch(shell, /rel\s*=\s*["'](?:manifest|stylesheet)["']/i);
  const css = [...build.html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map(([, value]) => value).join('\n');
  assert.ok(css.length > 0, 'styles are actually embedded');
  assert.doesNotMatch(css, /@import\b/i);
  for (const [, quote, url] of css.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) assert.match(url, /^(?:data:|#)/i, 'CSS images/fonts require no other files');
  assert.doesNotMatch(application, /\bimport\s*(?:\(|["'{*])|\bimport\.meta/);
  assert.doesNotMatch(config.workerSource, /\bimport\s*(?:\(|["'{*])|\bimport\.meta/);
  new vm.Script(application); // Syntax check without needing a browser DOM.

  const messages = [];
  const self = { postMessage(message) { messages.push(structuredClone(message)); } };
  const worker = vm.createContext({ self, structuredClone, performance, setTimeout, clearTimeout });
  new vm.Script(config.workerSource).runInContext(worker);
  assert.equal(typeof self.onmessage, 'function', 'bundled worker installs a handler without imported modules or a server');
  const state = spin(newGame({ seed: 'portable-worker-fixture', mode: 'combat' }));
  await self.onmessage({ data: { type: 'recommend', requestId: 101, state } });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, 'recommend');
  assert.equal(messages[0].requestId, 101);
  assert.deepEqual(messages[0].result, recommendRewards(state), 'the embedded worker uses the real game policy');
  assert.deepEqual(state, spin(newGame({ seed: 'portable-worker-fixture', mode: 'combat' })), 'worker recommendations do not modify the live game');
  await self.onmessage({ data: { type: 'recommend', requestId: 102, state: null } });
  assert.equal(messages[1].type, 'error');
  assert.equal(messages[1].requestId, 102);
  assert.match(messages[1].message, /有效的奖励状态/);

  // Feed HTML-sensitive strings through the final document assembly as well as
  // the standalone escape helper. Both app code and nested worker code must be
  // protected from the HTML parser's case-insensitive closing-script token.
  const sensitiveText = '</ScRiPt><script>globalThis.injected = true;</script>\u2028\u2029';
  const fixtureApp = `globalThis.fixtureValue=${JSON.stringify(sensitiveText)};`;
  const fixtureWorker = `globalThis.workerFixtureValue=${JSON.stringify(sensitiveText)};`;
  const injected = await buildPortable({ root, out: join(directory, 'escaped.html'), esbuild: {
    async build({ entryPoints }) { return { outputFiles: [{ text: entryPoints[0] === 'src/app.js' ? fixtureApp : fixtureWorker }] }; },
  } });
  assert.equal(injected.output, join(directory, 'escaped.html'), 'an explicit output filename remains supported');
  const escaped = embeddedConfig(injected.html);
  assert.equal(escaped.config.workerSource, fixtureWorker, 'nested worker text survives document escaping exactly');
  const boot = vm.createContext({});
  new vm.Script(escaped.application).runInContext(boot);
  assert.equal(boot.fixtureValue, sensitiveText);
  assert.equal(boot.injected, undefined, 'the assembled document never turns a JavaScript string into a third script');
});
