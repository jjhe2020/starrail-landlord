import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { trainProfile } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';
import { RESOURCE_KEYS } from '../src/ai.js';

const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : fallback; };
const integerOption = (name, fallback, max) => {
  const value = Number(option(name, String(fallback)));
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`--${name} must be an integer from 1 to ${max}.`);
  return value;
};
const runs = integerOption('runs', 100, 250);
const generations = integerOption('generations', 2, 4);
const candidates = integerOption('candidates', 4, 6);
const holdoutRuns = integerOption('holdout', 200, 500);
const output = resolve(option('output', 'docs/benchmarks/training-latest.json'));
const difficulty = Number(option('difficulty', '10'));
const disabledResources = String(option('disable', '')).split(',').filter(Boolean);
if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 20 || disabledResources.some(key => !RESOURCE_KEYS.includes(key))) throw new Error('Use difficulty 1..20 and --disable rerolls,removals,credits,defense.');
const resourceAccess = Object.fromEntries(RESOURCE_KEYS.map(key => [key, !disabledResources.includes(key)]));
let profile = DEFAULT_PROFILE;
if (option('profile')) {
  const saved = JSON.parse(await readFile(resolve(option('profile')), 'utf8'));
  profile = validateProfile(saved.profile ?? saved);
  if (!profile) throw new Error('Invalid --profile file.');
}
let lastPercent = -10;
const result = await trainProfile({
  mode: option('mode', 'combat'), difficulty, resourceAccess, runs, seed: option('seed', 'search-resources-v3'),
  generations, candidates, holdoutRuns, profile,
  explorationLookahead: args.includes('--full-training'),
  onProgress: progress => {
    const percent = Math.floor(progress.completed / progress.total * 100);
    if (percent >= lastPercent + 5) { console.log(`${percent}% ${progress.stage}/${progress.mode} ${progress.completed}/${progress.total}`); lastPercent = percent; }
  },
});
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(`Holdout before: ${result.baseline.summary.wins}/${result.baseline.summary.runs}; after: ${result.trained.summary.wins}/${result.trained.summary.runs}. Candidate accepted: ${result.accepted}.`);
console.log(`Objective ${result.baseline.objective.toFixed(3)} -> ${result.trained.objective.toFixed(3)}; report: ${output}`);
