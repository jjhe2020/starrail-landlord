import { readFile, access, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const version = (await readFile(resolve(root, 'VERSION'), 'utf8')).trim();
if (pkg.version !== version) throw new Error('package.json and VERSION must match.');
for (const folder of ['src', 'scripts', 'tests']) {
  for (const file of await readdir(resolve(root, folder))) {
    if (!/\.(js|mjs)$/.test(file)) continue;
    const checked = spawnSync(process.execPath, ['--check', resolve(root, folder, file)], { encoding: 'utf8' });
    if (checked.status !== 0) throw new Error(checked.stderr);
  }
}
const { CHARACTERS } = await import('../src/content.js');
for (const character of CHARACTERS) await access(resolve(root, `public/assets/characters/${character.assetId}.png`));
for (const enemy of ['automaton', 'voidranger', 'frostspawn', 'mara', 'boss']) await access(resolve(root, `public/assets/enemies/${enemy}.svg`));
console.log(`Syntax, version and ${CHARACTERS.length} character portraits verified.`);
