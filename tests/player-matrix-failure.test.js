import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, readFile, rm, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { matrixWorkerReply, MatrixWorkerPool, executeMatrixPlan, sourceFingerprint } from '../scripts/player-matrix.mjs';
import { readMatrixShard } from '../scripts/player-matrix-io.mjs';

const valid = () => ({ phase: 'victory', won: true, floor: 12, clearedFloors: 12, stopped: null, errors: [], conservationPassed: true, floors: [], actionTrace: [] });
const invalid = () => ({ ...valid(), conservationPassed: false, floors: [{ floor: 2, conservation: { total: { passed: false, residuals: { hp: 17 } } } }], actionTrace: [{ type: 'fixture-action', before: { hp: 20 }, after: { hp: 37 } }], extraFullResult: { retained: [1, 2, 3] } });
const task = index => ({ index, trialKey: `fixture:${index}`, strategyId: 'fixture-policy', difficulty: 1, worldIndex: index, behaviorRep: 0, stage: 'failure-fixture', split: 'failure-fixture', seed: `fixture-world:${index}`, behaviorSeed: `fixture-behavior:${index}` });

// A real worker protocol without a game import, execution, or mock production state.
class FixtureWorker extends EventEmitter {
  constructor(sourceHashes, run, delay = () => 0) { super(); this.run = run; this.delay = delay; this.closed = false; setImmediate(() => this.emit('message', { type: 'ready', sourceHashes })); }
  postMessage(value) {
    this.timer = setTimeout(async () => {
      const reply = await matrixWorkerReply(value, { runTask: this.run, getStrategy: id => ({ id, fixture: true }) });
      if (!this.closed) this.emit('message', reply);
    }, this.delay(value));
  }
  async terminate() { if (!this.closed) { this.closed = true; clearTimeout(this.timer); this.emit('exit', 1); } return 1; }
}

test('worker failure transport preserves complete anomalous result, task and trial identity', async () => {
  const original = invalid(), current = task(7);
  const reply = await matrixWorkerReply(current, { runTask: () => original, getStrategy: id => ({ id }) });
  assert.equal(reply.type, 'error'); assert.equal(reply.trialKey, current.trialKey); assert.deepEqual(reply.task, current);
  assert.deepEqual(reply.result, original); assert.deepEqual(reply.record.extraFullResult, original.extraFullResult);
  assert.deepEqual(reply.record.actionTrace, original.actionTrace); assert.match(reply.error, /Invalid or nonterminal/);
  const thrown = await matrixWorkerReply(current, { runTask: () => { throw Error('fixture executor exception'); } });
  assert.equal(thrown.result, null); assert.deepEqual(thrown.task, current); assert.match(thrown.error, /fixture executor exception/);
});

test('pool stops dispatch, retains failed result and distinguishes cancelled from unstarted tasks', async () => {
  const pool = new MatrixWorkerPool(2, { workerFactory: ({ sourceHashes }) => new FixtureWorker(sourceHashes, t => t.index === 2 ? invalid() : valid(), t => t.index === 1 ? 1000 : 0) });
  await pool.start({ fixture: 'only' });
  let failure;
  try { await pool.batch(Array.from({ length: 5 }, (_, i) => task(i))); } catch (error) { failure = error; }
  assert.ok(failure); assert.deepEqual(failure.matrixBatch.counts, { planned: 5, attempted: 3, completedValid: 1, failed: 1, aborted: 1, notStarted: 2, uncommittedAttempts: 3 });
  assert.deepEqual(failure.matrixFailure.result, invalid()); assert.deepEqual(failure.matrixBatch.completedTrialKeys, ['fixture:0']);
  assert.equal(failure.matrixBatch.abortedTasks[0].trialKey, 'fixture:1'); assert.deepEqual(failure.matrixBatch.notStartedTasks.map(t => t.index), [3, 4]);
  assert.equal(pool.pool.length, 0, 'all workers have exited before failure counts are final');
});

test('failed fixture batch is atomically archived while committed data and resume counts remain honest', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'matrix-failure-'));
  const sourceHashes = await sourceFingerprint();
  const plan = { stage: 'failure-fixture', count: 10, task: i => task(i) };
  const workerFactory = ({ sourceHashes }) => new FixtureWorker(sourceHashes, t => t.index === 7 ? invalid() : valid(), t => t.index === 6 ? 1000 : 0);
  try {
    let failure; try { await executeMatrixPlan(plan, { directory, workers: 2, shardSize: 5, sourceHashes, policies: [], workerFactory, log: false }); } catch (error) { failure = error; }
    assert.ok(failure); assert.deepEqual(failure.matrixFailure.result, invalid());
    const manifest = JSON.parse(await readFile(join(directory, 'run-manifest.json'), 'utf8'));
    assert.equal(manifest.complete, false); assert.equal(manifest.completed, 5); assert.equal(manifest.shards.length, 1);
    assert.deepEqual(manifest.executionCounts, { attempted: 8, completedValid: 6, failed: 1, aborted: 1, committed: 5 });
    assert.equal(manifest.failure.excludedFromFormalData, true); assert.equal(manifest.failure.counts.notStarted, 2);
    const latest = JSON.parse(await readFile(join(directory, 'failed-trial.json'), 'utf8'));
    const archivedBytes = await readFile(resolve(directory, manifest.failure.path));
    assert.deepEqual(JSON.parse(archivedBytes), latest);
    assert.equal(createHash('sha256').update(archivedBytes).digest('hex'), manifest.failure.sha256);
    assert.deepEqual(latest.primaryFailure.result, invalid()); assert.deepEqual(latest.failures[0].result, invalid());
    assert.equal(latest.counts.stageCommittedRuns, 5); assert.equal(latest.counts.stageUncommittedPlannedRuns, 5);
    assert.deepEqual(latest.completedUncommittedTrialKeys, ['fixture:5']);
    await assert.rejects(stat(join(directory, '.matrix-lock.json')), { code: 'ENOENT' });
    const committed = []; for await (const row of readMatrixShard(resolve(directory, manifest.shards[0].path))) if (row.kind === 'run') committed.push(row.value.trialKey);
    assert.deepEqual(committed, ['fixture:0', 'fixture:1', 'fixture:2', 'fixture:3', 'fixture:4']);
    const resumed = await executeMatrixPlan(plan, { directory, workers: 2, shardSize: 5, sourceHashes, policies: [], workerFactory: ({ sourceHashes }) => new FixtureWorker(sourceHashes, valid), log: false });
    assert.equal(resumed.completed, 10); assert.equal(resumed.complete, true);
    assert.deepEqual(resumed.executionCounts, { attempted: 13, completedValid: 11, failed: 1, aborted: 1, committed: 10 });
    assert.equal(resumed.failures.length, 1); assert.deepEqual(await readFile(resolve(directory, manifest.failure.path)), archivedBytes);
    assert.equal((await readdir(directory)).filter(name => name.endsWith('.jsonl.gz')).length, 2);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('source fingerprint covers every src/*.js including transitive simulation', async () => {
  const hashes = await sourceFingerprint();
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const files = (await readdir(join(root, 'src'))).filter(name => name.endsWith('.js'));
  for (const name of files) assert.equal(hashes[`src/${name}`], createHash('sha256').update(await readFile(join(root, 'src', name))).digest('hex'));
  assert.ok(hashes['src/simulation.js']); assert.ok(hashes['scripts/verify-player-matrix-preflight.mjs']); assert.ok(hashes['scripts/validate-player-matrix-statistics.mjs']);
});

test('worker startup failure preserves an empty-attempt failure record instead of inventing losses', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'matrix-start-failure-'));
  const workerFactory = () => { const worker = new EventEmitter(); worker.terminate = async () => 1; setImmediate(() => worker.emit('error', Error('fixture startup exception'))); return worker; };
  try {
    await assert.rejects(executeMatrixPlan({ stage: 'startup-fixture', count: 2, task }, { directory, workers: 1, workerFactory, log: false }), /fixture startup exception/);
    const manifest = JSON.parse(await readFile(join(directory, 'run-manifest.json'), 'utf8'));
    const evidence = JSON.parse(await readFile(join(directory, 'failed-trial.json'), 'utf8'));
    assert.equal(manifest.completed, 0); assert.equal(manifest.complete, false);
    assert.deepEqual(manifest.executionCounts, { attempted: 0, completedValid: 0, failed: 0, aborted: 0, committed: 0 });
    assert.equal(evidence.counts.stageUncommittedPlannedRuns, 2); assert.equal(evidence.primaryFailure, null); assert.deepEqual(evidence.batch, { id: null, start: null, end: null });
  } finally { await rm(directory, { recursive: true, force: true }); }
});
