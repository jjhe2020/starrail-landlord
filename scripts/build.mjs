import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
await mkdir(output, { recursive: true });
for (const entry of ['index.html', 'styles.css', 'src', 'public']) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
console.log('Built static game to dist/ — compatible with subdirectory hosting.');
