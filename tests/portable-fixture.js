import { cp, mkdir, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

// Server-security tests temporarily add private symlinks to the live public
// directory. Snapshot authored resources before bundling so parallel tests
// never see another fixture, and keep the production builder's link refusal.
export async function createPortableFixture(directory) {
  const root = resolve(directory, 'project');
  await mkdir(join(root, 'public'), { recursive: true });
  const publicEntries = (await readdir(join(projectRoot, 'public'), { withFileTypes: true }))
    .filter(entry => !entry.name.startsWith('.') && !entry.name.startsWith('server-security-'));
  const filter = source => !relative(projectRoot, source).split(/[\\/]/).some(part => part.startsWith('.') || part.startsWith('server-security-'));
  await Promise.all([
    ...['index.html', 'development.html', 'styles.css', 'package.json', 'src'].map(entry => cp(join(projectRoot, entry), join(root, entry), { recursive: true, filter })),
    ...publicEntries.map(entry => cp(join(projectRoot, 'public', entry.name), join(root, 'public', entry.name), { recursive: true, filter })),
  ]);
  const require = createRequire(import.meta.url);
  return { root, esbuild: require('esbuild') };
}
