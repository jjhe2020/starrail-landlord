import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { benchmarkPolicies } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';

const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : fallback; };
const runs = Number(option('runs', '200'));
const mode = option('mode', 'both');
const seed = option('seed', 'release-holdout-2026-10-12');
const output = resolve(option('output', 'docs/benchmarks/balance-latest.json'));
let profile = DEFAULT_PROFILE;
if (option('profile')) {
  const saved = JSON.parse(await readFile(resolve(option('profile')), 'utf8'));
  profile = validateProfile(saved.profile ?? saved);
  if (!profile) throw new Error('Invalid --profile file.');
}
let lastPercent = -10;
const report = await benchmarkPolicies({ mode, runs, seed, profile, lookahead: !args.includes('--fast'), onProgress: progress => {
  const percent = Math.floor(progress.completed / progress.total * 100);
  if (percent >= lastPercent + 10) { console.log(`${percent}% ${progress.mode}/${progress.policy} ${progress.completed}/${progress.total}`); lastPercent = percent; }
} });
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of report.modes) console.log(`${result.mode}: AI ${result.ai.wins}/${result.ai.runs} (${(result.ai.winRate * 100).toFixed(1)}%), uniform ${result.uniform.wins}/${result.uniform.runs}; AI mean floor ${result.ai.avgFloor.toFixed(2)}, merges ${result.ai.avgMerges.toFixed(2)}`);
console.log(`Report: ${output}; ${Math.round(report.elapsedMs)} ms; lookahead=${report.lookahead}`);
