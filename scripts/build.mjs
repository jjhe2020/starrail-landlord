import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createOfflineBuild } from './offline-assets.mjs';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
if (!output.startsWith(root + sep)) throw new Error('Build output must stay inside the project workspace.');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'development.html', 'styles.css', 'manifest.webmanifest', 'src', 'public']) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
// Both editions use the same application and rules. Literal build flags remove
// the development import from the player bundle rather than hiding it with CSS.
for (const development of [false, true]) {
  await build({
    absWorkingDir: root, entryPoints: ['src/app.js'],
    outfile: resolve(output, 'src', development ? 'development-app.js' : 'app.js'),
    bundle: true, format: 'esm', platform: 'browser', target: ['es2020'],
    charset: 'ascii', minifySyntax: true, legalComments: 'inline',
    define: { 'globalThis.__ASTRAL_DEVELOPMENT_BUILD__': String(development), 'globalThis.__ASTRAL_DEVELOPMENT__': 'false' },
  });
}
await writeFile(resolve(output, 'development.html'), (await readFile(resolve(root, 'development.html'), 'utf8')).replace('./src/app.js', './src/development-app.js'));
const offline = await createOfflineBuild(output);
await writeFile(resolve(output, 'service-worker.js'), offline.worker);
console.log(`Built static game to dist/ with ${offline.assets.length} offline assets · ${offline.version.slice(0, 12)} — compatible with subdirectory hosting.`);
