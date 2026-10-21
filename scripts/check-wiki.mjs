import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { CHARACTERS, ITEMS, ESSENCES } from '../src/content.js';
import { SYNERGIES } from '../src/synergies.js';
import { ENEMY_DEBUFFS } from '../src/enemy-effects.js';
import { RETIREMENT_RULES } from '../src/retirements.js';
const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'docs/wiki');
const baseline = 'e5557f8d6b3ee0a0c308c5a3ca0481d3701db229';
const errors = [];
const files = (await readdir(dir)).filter(x => x.endsWith('.md'));
const pages = new Map();
const stripCode = text => text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '');
const slug = s => s.toLowerCase().replace(/<[^>]*>/g, '').replace(/[\p{P}\p{S}]/gu, c => c === '-' || c === '_' ? c : '').replace(/\s/g, '-');
for (const file of files) {
  const source = await readFile(path.join(dir, file), 'utf8');
  const prose = stripCode(source);
  const anchors = new Set();
  const seen = new Map();
  for (const m of prose.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const name = slug(m[1]);
    const count = seen.get(name) || 0;
    seen.set(name, count + 1);
    anchors.add(count ? `${name}-${count}` : name);
  }
  for (const m of prose.matchAll(/<(?:a|span)\s+id=["']([^"']+)["']/g)) anchors.add(m[1]);
  pages.set(file.slice(0, -3), { source, prose, anchors });
  if (!file.startsWith('_') && !/^# /m.test(prose)) errors.push(`${file}: missing title`);
}
let links = 0, sourceLinks = 0;
const lineCounts = new Map();
const edges = new Map([...pages].map(([p]) => [p, []]));
for (const [name, page] of pages) {
  for (const m of page.prose.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g)) {
    const target = m[1].replace(/^<|>$/g, '');
    if (/^https?:/.test(target)) {
      const match = target.match(/github\.com\/jjhe2020\/starrail-landlord\/blob\/([a-f0-9]{40})\/([^#]+)#L(\d+)(?:-L(\d+))?/);
      if (match) {
        sourceLinks++;
        if (match[1] !== baseline) errors.push(`${name}: unexpected source revision`);
        if (!lineCounts.has(match[2])) {
          try { lineCounts.set(match[2], execFileSync('git', ['show', `${baseline}:${match[2]}`], { cwd: root, encoding: 'utf8' }).split('\n').length); }
          catch { errors.push(`${name}: missing source ${match[2]}`); continue; }
        }
        if (+match[3] < 1 || +(match[4] || match[3]) > lineCounts.get(match[2])) errors.push(`${name}: invalid source line ${target}`);
      }
      continue;
    }
    if (/^[a-z]+:/i.test(target)) continue;
    links++;
    const [rawPage, rawAnchor] = target.split('#');
    const to = decodeURIComponent(rawPage || name).replace(/\.md$/, '');
    if (!pages.has(to)) { errors.push(`${name}: missing page ${target}`); continue; }
    edges.get(name).push(to);
    if (rawAnchor && !pages.get(to).anchors.has(decodeURIComponent(rawAnchor))) errors.push(`${name}: missing anchor ${target}`);
  }
}
for (const [prefix, content] of [['Card', CHARACTERS], ['Relic', ITEMS], ['Essence', ESSENCES], ['Synergy', SYNERGIES], ['EnemyEffect', ENEMY_DEBUFFS], ['Assignment', RETIREMENT_RULES]]) {
  const actual = [...pages.keys()].filter(x => x.startsWith(`${prefix}-`));
  if (actual.length !== content.length) errors.push(`${prefix}: expected ${content.length}, found ${actual.length}`);
  for (const item of content) if (!pages.has(`${prefix}-${item.id}`)) errors.push(`${prefix}: missing ${item.id}`);
}
const reached = new Set();
function visit(p) { if (reached.has(p)) return; reached.add(p); for (const to of edges.get(p) || []) visit(to); }
visit('Home');
for (const page of pages.keys()) if (!page.startsWith('_') && !reached.has(page)) errors.push(`Orphan page: ${page}`);
const manifest = JSON.parse(await readFile(path.join(dir, 'data/source-manifest.json'), 'utf8'));
for (const entry of manifest.sources) {
  const page = pages.get(entry.page)?.source || '';
  const source = page.match(/<!-- frozen-source:start -->\n(`{16})[^\n]*\n([\s\S]*?)\1\n<!-- frozen-source:end -->/)?.[2];
  if (source === undefined) { errors.push(`Cannot extract frozen source: ${entry.path}`); continue; }
  const bytes = Buffer.from(source);
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== entry.sha256 || bytes.length !== entry.bytes) errors.push(`Frozen source mismatch: ${entry.path}`);
  const original = execFileSync('git', ['show', `${baseline}:${entry.path}`], { cwd: root });
  if (!original.equals(bytes)) errors.push(`Frozen source differs from release: ${entry.path}`);
}
for (const script of ['generate-wiki-catalog.mjs', 'generate-wiki-world.mjs', 'generate-wiki-sources.mjs', 'generate-wiki-navigation.mjs']) {
  try { execFileSync(process.execPath, [path.join(root, 'scripts', script), '--check'], { cwd: root, stdio: 'pipe' }); }
  catch (error) { errors.push(`${script} verification failed:\n${String(error.stdout || '')}${String(error.stderr || '')}`); }
}
const bytes = (await Promise.all(files.map(async f => (await stat(path.join(dir, f))).size))).reduce((a, b) => a + b, 0);
const summary = { version: '0.7.0', baselineCommit: baseline, pages: files.filter(f => !f.startsWith('_')).length, navigationFiles: files.filter(f => f.startsWith('_')).length, internalLinks: links, checkedSourceLinks: sourceLinks, frozenSources: manifest.sources.length, markdownBytes: bytes, content: { cards: CHARACTERS.length, relics: ITEMS.length, essences: ESSENCES.length, synergies: SYNERGIES.length, enemyEffects: ENEMY_DEBUFFS.length, assignments: RETIREMENT_RULES.length }, errors };
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;
