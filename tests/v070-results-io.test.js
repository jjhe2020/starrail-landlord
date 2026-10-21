import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { writeV070Report, readV070Report, hashV070File, V070_RESULTS_FORMAT } from '../scripts/v070-results-io.mjs';

const fixture = { protocol: { version: 'roundtrip' }, cards: [{ id: '1001', name: '三月七' }], summary: [], rows: [{ sample: 1, value: '中文\n多行\r\n及 emoji 🚂' }, { sample: 2, value: 0 }], future: [{ sample: 1, padded: true }] };
async function temporary(t) { const dir = await mkdtemp(join(tmpdir(), 'v070-io-')); t.after(() => rm(dir, { recursive: true, force: true })); return dir; }
async function malformed(t, records) { const dir = await temporary(t), path = join(dir, 'input.jsonl.gz'); await writeFile(path, gzipSync(records.map(record => JSON.stringify(record)).join('\n') + '\n')); return path; }
const header = counts => ({ kind: 'header', format: V070_RESULTS_FORMAT, expectedCounts: counts, value: { protocol: { version: 'test' } } });

test('JSONL gzip and plain streaming preserve exact rows, future, and UTF-8 metadata', async t => {
  const dir = await temporary(t);
  for (const extension of ['jsonl.gz', 'jsonl']) { const path = join(dir, `report.${extension}`); await writeV070Report(path, fixture); assert.deepEqual(await readV070Report(path), fixture); assert.match(await hashV070File(path), /^[a-f0-9]{64}$/); }
});
test('historical JSON gzip and plain files remain readable', async t => {
  const dir = await temporary(t);
  for (const extension of ['json.gz', 'json']) { const path = join(dir, `report.${extension}`); await writeV070Report(path, fixture); assert.deepEqual(await readV070Report(path), fixture); }
});
test('missing footer rejects otherwise valid gzip instead of silently accepting partial data', async t => {
  const path = await malformed(t, [header({ rows: 1, future: 0 }), { kind: 'row', value: { sample: 0 } }]);
  await assert.rejects(readV070Report(path), /Truncated JSONL/);
});
test('truncated compressed bytes are rejected even if records were emitted before gzip failed', async t => {
  const dir = await temporary(t), path = join(dir, 'report.jsonl.gz'); await writeV070Report(path, fixture); const bytes = await readFile(path); await writeFile(path, bytes.subarray(0, bytes.length - 8));
  await assert.rejects(readV070Report(path));
});
test('header, footer and observed record counts must all agree', async t => {
  const path = await malformed(t, [header({ rows: 2, future: 0 }), { kind: 'row', value: {} }, { kind: 'end', counts: { rows: 1, future: 0 } }]);
  await assert.rejects(readV070Report(path), /counts do not match/);
  const excess = await malformed(t, [header({ rows: 0, future: 0 }), { kind: 'row', value: {} }]);
  await assert.rejects(readV070Report(excess), /exceeds header/);
});
test('unknown records, embedded raw data and records after footer are rejected', async t => {
  const unknown = await malformed(t, [header({ rows: 0, future: 0 }), { kind: 'mystery', value: {} }]); await assert.rejects(readV070Report(unknown), /Unknown JSONL/);
  const embedded = await malformed(t, [{ ...header({ rows: 0, future: 0 }), value: { rows: [] } }]); await assert.rejects(readV070Report(embedded), /must not embed/);
  const trailing = await malformed(t, [header({ rows: 0, future: 0 }), { kind: 'end', counts: { rows: 0, future: 0 } }, { kind: 'row', value: {} }]); await assert.rejects(readV070Report(trailing), /after JSONL footer/);
});
test('empty report still requires and roundtrips header/footer', async t => {
  const dir = await temporary(t), path = join(dir, 'empty.jsonl.gz'), value = { protocol: {}, rows: [], future: [] }; await writeV070Report(path, value); assert.deepEqual(await readV070Report(path), value);
});
test('optional streaming stress crosses V8 single-string limit without whole-report serialization', { skip: process.env.V070_IO_STRESS_TEST !== '1' }, async t => {
  const dir = await temporary(t), path = join(dir, 'large.jsonl.gz'), row = { payload: 'x'.repeat(4096) }, n = 140000;
  assert.ok(n * row.payload.length > 536870888);
  await writeV070Report(path, { protocol: { large: true }, rows: Array(n).fill(row), future: [] });
  const result = await readV070Report(path); assert.equal(result.rows.length, n); assert.equal(result.rows.at(-1).payload.length, 4096);
});
