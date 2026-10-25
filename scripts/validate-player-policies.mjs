import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createPlayerPolicyFixtures, createTagPreferenceProbes, validatePlayerPolicyBehavior } from '../src/player-policy-fixtures.js';
import { playerPolicyManifest, playerPolicyCacheStats } from '../src/player-policy.js';

export async function validatePlayerPolicies({ output, policiesOutput, fixturesOutput, quick = false } = {}) {
  const started = performance.now(), fixtures = createPlayerPolicyFixtures(), manifest = playerPolicyManifest();
  const result = validatePlayerPolicyBehavior({ fixtures, includeAllPolicies: !quick });
  result.elapsedMs = Math.round(performance.now() - started);
  result.cache = playerPolicyCacheStats();
  result.sourceHashes = {};
  for (const file of ['src/player-policy.js', 'src/player-policy-fixtures.js', 'src/engine.js', 'src/ai.js', 'src/content.js', 'docs/PLAYER-MATRIX-PROTOCOL-DRAFT.md']) result.sourceHashes[file] = createHash('sha256').update(await readFile(new URL(`../${file}`, import.meta.url))).digest('hex');
  result.counts = { main: manifest.policies.filter(p => p.kind === 'matrix').length, controls: manifest.policies.filter(p => p.kind === 'control').length, fixtures: fixtures.length };
  async function save(path, value) { if (path) { await mkdir(dirname(resolve(path)), { recursive: true }); await writeFile(path, JSON.stringify(value, null, 2) + '\n'); } }
  await save(output, result); await save(policiesOutput, manifest); await save(fixturesOutput, { version: manifest.version, fixtures, tagProbes: createTagPreferenceProbes() });
  return result;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), options = {};
  while (args.length) {
    const flag = args.shift();
    if (flag === '--quick') options.quick = true;
    else if (['--output', '--policies-output', '--fixtures-output'].includes(flag)) {
      const value = args.shift(); if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
      options[{ '--output': 'output', '--policies-output': 'policiesOutput', '--fixtures-output': 'fixturesOutput' }[flag]] = value;
    } else throw new Error(`Unknown option: ${flag}`);
  }
  const result = await validatePlayerPolicies(options);
  console.log(JSON.stringify({ passed: result.passed, counts: result.counts, stats: result.stats, elapsedMs: result.elapsedMs, cache: result.cache, failures: result.failures.slice(0, 20) }, null, 2));
  if (!result.passed) process.exitCode = 1;
}
