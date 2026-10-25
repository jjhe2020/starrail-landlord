import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync,gunzipSync } from 'node:zlib';
import { writeMatrixShard,inspectMatrixShard,readMatrixShard } from '../scripts/player-matrix-io.mjs';
test('streaming matrix shards reconcile count and reject corruption, duplicates and source drift',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'matrix-io-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'one.jsonl.gz'),meta={expected:{runs:2},sourceHashes:{engine:'frozen'}};
 async function* rows(){yield {trialKey:'one',won:true};yield {trialKey:'two',won:false};}
 await writeMatrixShard(path,meta,rows());assert.equal((await inspectMatrixShard(path,{expectedSourceHashes:meta.sourceHashes})).count,2);await assert.rejects(()=>inspectMatrixShard(path,{expectedSourceHashes:{engine:'changed'}}),/hash/);
 const original=gunzipSync(await readFile(path)).toString();for(const invalid of [original.replace('"two"','"one"'),original.split('\n').slice(0,-2).join('\n')+'\n',original.replace('"runs":2','"runs":3')]){const bad=join(dir,'bad.jsonl.gz');await writeFile(bad,gzipSync(invalid));await assert.rejects(()=>inspectMatrixShard(bad));}
});
test('early consumer rejection or break cancels a compressed stream with large unread records',{timeout:3000},async t=>{
 const dir=await mkdtemp(join(tmpdir(),'matrix-io-cancel-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'large.jsonl.gz');
 const rows=Array.from({length:12},(_,i)=>({trialKey:String(i),payload:'unread-data-'.repeat(12000)}));
 await writeMatrixShard(path,{expected:{runs:rows.length}},rows);
 let seen=0;for await(const row of readMatrixShard(path))if(row.kind==='run'){seen++;break;}
 assert.equal(seen,1);
 await assert.rejects(async()=>{for await(const row of readMatrixShard(path))if(row.kind==='run')throw Error('consumer found an invalid root');},/invalid root/);
});
