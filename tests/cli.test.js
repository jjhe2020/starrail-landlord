import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { benchmarkPolicies } from '../src/simulation.js';

test('experiment CLIs reject invalid sample counts before silently substituting or running a batch', () => {
  const cases = [
    ['balance.mjs', '--runs', '0'], ['balance.mjs', '--runs', '2001'],
    ['balance.mjs', '--runs', 'NaN'], ['train-ai.mjs', '--runs', '251'],
    ['train-ai.mjs', '--generations', '0'], ['train-ai.mjs', '--candidates', '7'],
    ['train-ai.mjs', '--holdout', '1.5'], ['resource-balance.mjs', '--scope', 'invalid'],
    ['balance-parallel.mjs', '--runs', '0'], ['balance-parallel.mjs', '--runs', '2001'],
    ['balance-parallel.mjs', '--runs', 'NaN'], ['balance-parallel.mjs', '--workers', '0'],
    ['balance-parallel.mjs', '--workers', '9'], ['balance-parallel.mjs', '--workers', '1.5'],
    ['balance-parallel.mjs', '--difficulty', '21'], ['balance-parallel.mjs', '--disable', 'unknown'],
    ['balance-parallel.mjs', '--sample-purpose', 'unknown'], ['balance-parallel.mjs', '--target-min', '0.9'],
  ];
  for (const [script, flag, value] of cases) {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL(`../scripts/${script}`, import.meta.url)), flag, value],
      { encoding: 'utf8', timeout: 5000 });
    assert.equal(result.error, undefined, `${script} should fail before starting a batch`);
    assert.notEqual(result.status, 0, `${script} ${flag} ${value}`);
    assert.match(result.stderr, /must be/);
    assert.equal(result.stdout, '', 'no batch progress or report was written');
  }
});

test('parallel combat CLI preserves serial holdout results and paired seed ordering across chunk boundaries', { timeout: 180000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'starrail-parallel-balance-'));
  assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep), 'recursive cleanup remains in the dedicated temporary fixture');
  try {
    for (const runs of [2, 51]) {
      const seed = `parallel-equivalence-${runs}`;
      const resourceAccess = Object.fromEntries(['rerolls', 'removals', 'credits', 'defense'].map(key => [key, runs === 2]));
      const workers = runs === 2 ? 3 : 1;
      const lookahead = runs === 2;
      const serial = await benchmarkPolicies({ runs, seed, difficulty: 10, resourceAccess, lookahead });
      const output = join(directory, `report-${runs}.json`);
      const result = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/balance-parallel.mjs', import.meta.url)),
        '--runs', String(runs), '--workers', String(workers), '--difficulty', '10',
        ...(runs !== 2 ? ['--disable', 'rerolls,removals,credits,defense', '--fast'] : []),
        '--seed', seed, '--sample-purpose', 'calibration', '--output', output], { encoding: 'utf8', timeout: 90000 });
      assert.equal(result.error, undefined, result.error?.message);
      assert.equal(result.status, 0, result.stderr);
      const parallel = JSON.parse(await readFile(output, 'utf8'));
      assert.equal(parallel.samplePurpose, 'calibration');
      assert.equal(parallel.sourceStable, true);
      assert.equal(Object.keys(parallel.sourceHashes).length, 12);
      assert.ok(Object.values(parallel.sourceHashes).every(hash => /^[a-f0-9]{64}$/.test(hash)));
      const chunks = Math.ceil(runs / 50) * 2;
      assert.deepEqual(parallel.parallel, { workers, workersUsed: Math.min(workers, chunks), chunkSize: 50, chunks, resultOrder: 'original-seed-index' });
      for (const key of ['elapsedMs', 'samplePurpose', 'sourceHashes', 'sourceStable', 'parallel']) delete parallel[key];
      delete serial.elapsedMs;
      assert.deepEqual(parallel, serial, `${runs} complete campaigns per policy must match the serial reference`);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
