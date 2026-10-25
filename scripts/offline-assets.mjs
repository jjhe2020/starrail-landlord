import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const marker = '/* OFFLINE_BUILD */ null';
const digest = value => createHash('sha256').update(value).digest('hex');

async function filesBelow(root, directory) {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await filesBelow(root, path));
    else if (entry.isFile()) result.push(path);
    // Symlinks are intentionally excluded, just like private server paths.
  }
  return result;
}

export async function createOfflineBuild(root = projectRoot, { templateRoot = projectRoot } = {}) {
  const template = await readFile(resolve(templateRoot, 'service-worker.js'), 'utf8');
  if (!template.includes(marker)) throw new Error('Offline worker template is missing its build marker.');
  const files = [
    'index.html', 'styles.css', 'manifest.webmanifest',
    ...(await filesBelow(root, 'src')).filter(path => path.endsWith('.js')),
    ...await filesBelow(root, 'public'),
  ].sort();
  // Local and static development entry points belong to the same exact cached
  // release, but older/minimal fixtures can still contain only the player shell.
  try { await readFile(resolve(root, 'development.html')); files.push('development.html'); files.sort(); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const required of ['src/app.js', 'src/offline.js', 'src/ai-worker.js', 'public/icons/icon-192.png', 'public/icons/icon-512.png', 'public/icons/maskable-512.png']) {
    if (!files.includes(required)) throw new Error(`Offline runtime asset is missing: ${required}`);
  }
  const contents = await Promise.all(files.map(path => readFile(resolve(root, path))));
  const assets = files.map((path, index) => ({ url: `./${path}`, sha256: digest(contents[index]) }));
  // Include worker behavior as well as every runtime asset. The package version
  // does not determine offline releases, and editing one portrait changes this ID.
  const version = digest(JSON.stringify({ template, assets }));
  // Hosting platforms can redirect index.html or inject scripts into HTML.
  // Carry the authored shell in this JavaScript response instead, preserving
  // the exact page body already covered by its asset digest.
  const indexHtml = contents[files.indexOf('index.html')].toString('utf8');
  const htmlPages = Object.fromEntries(files.filter(path => path.endsWith('.html')).map(path => [path, contents[files.indexOf(path)].toString('utf8')]));
  const build = { version, assets, indexHtml, htmlPages };
  return { ...build, worker: template.replace(marker, JSON.stringify(build)) };
}
