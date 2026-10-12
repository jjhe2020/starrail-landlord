import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { trainProfile } from '../src/simulation.js';
import { DEFAULT_PROFILE, validateProfile } from '../src/ai-profile.js';

const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : fallback; };
const output = resolve(option('output', 'docs/benchmarks/training-latest.json'));
let profile = DEFAULT_PROFILE;
if (option('profile')) {
  const saved = JSON.parse(await readFile(resolve(option('profile')), 'utf8'));
  profile = validateProfile(saved.profile ?? saved);
  if (!profile) throw new Error('Invalid --profile file.');
}
let lastPercent = -10;
const result = await trainProfile({
  mode: option('mode', 'both'), runs: Number(option('runs', '100')), seed: option('seed', 'search-2026-10-12'),
  generations: Number(option('generations', '2')), candidates: Number(option('candidates', '4')),
  holdoutRuns: Number(option('holdout', '200')), profile,
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
