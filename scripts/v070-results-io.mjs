import { createReadStream, createWriteStream } from 'node:fs';
import { readFile, mkdir, rename, rm } from 'node:fs/promises';
import { createGzip, createGunzip, gzipSync, gunzipSync } from 'node:zlib';
import { Readable, PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { constants as bufferConstants } from 'node:buffer';

export const V070_RESULTS_FORMAT = 'v070-results-jsonl-v1';
const validCounts = value => value && ['rows', 'future'].every(key => Number.isSafeInteger(value[key]) && value[key] >= 0);
const objectRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Backpressure keeps serialization bounded by one header/record, not the full run. */
export async function writeV070Report(path, report) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  try {
    if (/\.jsonl(?:\.gz)?$/.test(path)) {
      const { rows = [], future = [], ...metadata } = report, counts = { rows: rows.length, future: future.length };
      async function* records() {
        yield JSON.stringify({ kind: 'header', format: V070_RESULTS_FORMAT, expectedCounts: counts, value: metadata }) + '\n';
        for (const value of rows) yield JSON.stringify({ kind: 'row', value }) + '\n';
        for (const value of future) yield JSON.stringify({ kind: 'future', value }) + '\n';
        yield JSON.stringify({ kind: 'end', counts }) + '\n';
      }
      const source = Readable.from(records());
      if (path.endsWith('.gz')) await pipeline(source, createGzip({ level: 9 }), createWriteStream(temporary));
      else await pipeline(source, createWriteStream(temporary));
    } else {
      // Compatibility for small historical JSON reports. New large runs use JSONL.
      const data = JSON.stringify(report) + '\n';
      const source = Readable.from([path.endsWith('.gz') ? gzipSync(data, { level: 9 }) : data]);
      await pipeline(source, createWriteStream(temporary));
    }
    await rename(temporary, path);
  } catch (error) { await rm(temporary, { force: true }); throw error; }
}

/** Read records without ever constructing the entire decompressed JSONL string. */
export async function readV070Report(path) {
  if (!/\.jsonl(?:\.gz)?$/.test(path)) {
    const bytes = await readFile(path), data = path.endsWith('.gz') ? gunzipSync(bytes) : bytes;
    if (data.length > bufferConstants.MAX_STRING_LENGTH) throw new Error('Legacy JSON exceeds the V8 string limit; use JSONL streaming format.');
    return JSON.parse(data.toString('utf8'));
  }
  const source = createReadStream(path), output = new PassThrough();
  const pumping = path.endsWith('.gz') ? pipeline(source, createGunzip(), output) : pipeline(source, output);
  // Keep early decompression failures handled while readline consumes prior bytes.
  pumping.catch(() => {});
  const lines = createInterface({ input: output, crlfDelay: Infinity });
  let header = null, ended = false, lineNumber = 0; const rows = [], future = [];
  try {
    for await (const line of lines) {
      lineNumber++;
      if (!line.trim()) throw new Error(`Blank JSONL record at line ${lineNumber}`);
      let record; try { record = JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL record at line ${lineNumber}: ${error.message}`); }
      if (!objectRecord(record)) throw new Error(`Invalid JSONL record at line ${lineNumber}`);
      if (ended) throw new Error('Unexpected records after JSONL footer');
      if (!header) {
        if (record.kind !== 'header' || record.format !== V070_RESULTS_FORMAT || !objectRecord(record.value) || !validCounts(record.expectedCounts)) throw new Error('Invalid or missing JSONL header');
        if ('rows' in record.value || 'future' in record.value) throw new Error('JSONL header must not embed raw rows/future');
        header = record; continue;
      }
      if (record.kind === 'row' || record.kind === 'future') {
        if (!objectRecord(record.value)) throw new Error(`Invalid ${record.kind} value at line ${lineNumber}`);
        (record.kind === 'row' ? rows : future).push(record.value);
        if (rows.length > header.expectedCounts.rows || future.length > header.expectedCounts.future) throw new Error('JSONL record count exceeds header');
      } else if (record.kind === 'end') {
        if (!validCounts(record.counts) || record.counts.rows !== rows.length || record.counts.future !== future.length || record.counts.rows !== header.expectedCounts.rows || record.counts.future !== header.expectedCounts.future) throw new Error('JSONL footer/header/observed counts do not match');
        ended = true;
      } else throw new Error(`Unknown JSONL record kind: ${String(record.kind)}`);
    }
    await pumping;
    if (!header || !ended) throw new Error('Truncated JSONL report: missing header/footer');
    return { ...header.value, rows, future };
  } finally { lines.close(); output.destroy(); source.destroy(); await pumping.catch(() => {}); }
}

export async function hashV070File(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
