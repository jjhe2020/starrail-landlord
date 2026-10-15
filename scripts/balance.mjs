import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { benchmarkPolicies } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';
import { RESOURCE_KEYS } from '../src/ai.js';

const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : fallback; };
const runs = Number(option('runs', '200'));
if (!Number.isInteger(runs) || runs < 1 || runs > 2000) throw new Error('--runs must be an integer from 1 to 2000.');
const mode = option('mode', 'combat');
const difficulty = Number(option('difficulty', '10'));
const disabledResources = String(option('disable', '')).split(',').filter(Boolean);
if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 20 || disabledResources.some(key => !RESOURCE_KEYS.includes(key))) throw new Error('Use difficulty 1..20 and --disable rerolls,removals,credits,defense.');
const resourceAccess = Object.fromEntries(RESOURCE_KEYS.map(key => [key, !disabledResources.includes(key)]));
const seed = option('seed', 'release-holdout-2026-10-12');
const output = resolve(option('output', 'docs/benchmarks/balance-latest.json'));
const targetMin = option('target-min');
const targetMax = option('target-max');
const target = targetMin === undefined && targetMax === undefined ? null : {
  min: Number(targetMin), max: Number(targetMax), preferred: Number(option('target-rate', '0.95')),
};
if (target && (!Number.isFinite(target.min) || !Number.isFinite(target.max) || !Number.isFinite(target.preferred) || target.min < 0 || target.max > 1 || target.min > target.preferred || target.preferred > target.max)) {
  throw new Error('Provide --target-min and --target-max in [0, 1], enclosing --target-rate.');
}
let profile = DEFAULT_PROFILE;
if (option('profile')) {
  const saved = JSON.parse(await readFile(resolve(option('profile')), 'utf8'));
  profile = validateProfile(saved.profile ?? saved);
  if (!profile) throw new Error('Invalid --profile file.');
}
let lastPercent = -10;
const report = await benchmarkPolicies({ mode, difficulty, resourceAccess, runs, seed, profile, lookahead: !args.includes('--fast'), onProgress: progress => {
  const percent = Math.floor(progress.completed / progress.total * 100);
  if (percent >= lastPercent + 10) { console.log(`${percent}% ${progress.mode}/${progress.policy} ${progress.completed}/${progress.total}`); lastPercent = percent; }
} });
if (target) {
  report.calibrationTarget = { ...target, passed: report.modes.every(({ ai }) => ai.winRate >= target.min && ai.winRate <= target.max && ai.incomplete === 0) };
  if (!report.calibrationTarget.passed) process.exitCode = 1;
}
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of report.modes) console.log(`${result.mode}: AI ${result.ai.wins}/${result.ai.runs} (${(result.ai.winRate * 100).toFixed(1)}%), uniform ${result.uniform.wins}/${result.uniform.runs}; AI mean floor ${result.ai.avgFloor.toFixed(2)}, merges ${result.ai.avgMerges.toFixed(2)}`);
console.log(`Report: ${output}; ${Math.round(report.elapsedMs)} ms; lookahead=${report.lookahead}`);
if (target) console.log(`Difficulty target ${(target.min * 100).toFixed(0)}%–${(target.max * 100).toFixed(0)}%: ${report.calibrationTarget.passed ? 'PASS' : 'FAIL'}`);
