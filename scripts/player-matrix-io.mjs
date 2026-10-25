import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { createGzip, createGunzip } from 'node:zlib';
import { Readable, PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
export const FORMAT='player-matrix-jsonl-v1';
export async function hashFile(path){const hash=createHash('sha256');for await(const bytes of createReadStream(path))hash.update(bytes);return hash.digest('hex');}
export async function writeMatrixShard(path,metadata,records) {
  await mkdir(dirname(path),{recursive:true});const temporary=`${path}.${process.pid}.tmp`;let count=0;
  async function* lines(){
    yield JSON.stringify({kind:'header',format:FORMAT,value:metadata})+'\n';
    for await(const value of records){count++;yield JSON.stringify({kind:'run',value})+'\n';}
    if(count!==metadata.expected.runs)throw Error(`Shard expected ${metadata.expected.runs} records, got ${count}`);
    yield JSON.stringify({kind:'end',counts:{runs:count}})+'\n';
  }
  try{await pipeline(Readable.from(lines()),createGzip({level:3}),createWriteStream(temporary,{flags:'wx'}));await rename(temporary,path);return {path,count,sha256:await hashFile(path)};}
  catch(error){await rm(temporary,{force:true});throw error;}
}
export async function* readMatrixShard(path,{expectedSourceHashes}={}) {
  const source=createReadStream(path),output=new PassThrough(),gunzip=path.endsWith('.gz')?createGunzip():null,controller=new AbortController();
  const pumping=gunzip?pipeline(source,gunzip,output,{signal:controller.signal}):pipeline(source,output,{signal:controller.signal});pumping.catch(()=>{});
  const lines=createInterface({input:output,crlfDelay:Infinity});let header=null,ended=false,count=0;const keys=new Set();
  try{
    for await(const line of lines){
      if(!line.trim())throw Error('Blank matrix record');const row=JSON.parse(line);if(ended)throw Error('Records after matrix footer');
      if(!header){if(row.kind!=='header'||row.format!==FORMAT||!Number.isSafeInteger(row.value?.expected?.runs))throw Error('Missing or invalid matrix header');header=row.value;if(expectedSourceHashes&&JSON.stringify(header.sourceHashes)!==JSON.stringify(expectedSourceHashes))throw Error('Matrix source hash mismatch');yield {kind:'header',value:header};continue;}
      if(row.kind==='run'){
        if(!row.value?.trialKey||keys.has(row.value.trialKey))throw Error('Missing/duplicate trial key');keys.add(row.value.trialKey);count++;if(count>header.expected.runs)throw Error('Too many matrix records');yield row;
      }else if(row.kind==='end'){
        if(row.counts?.runs!==count||count!==header.expected.runs)throw Error('Matrix header/footer count mismatch');ended=true;yield row;
      }else throw Error(`Unknown matrix record ${row.kind}`);
    }
    await pumping;if(!header||!ended)throw Error('Truncated matrix shard');
  } finally{
    // A consumer may stop at the first invalid row while gunzip is blocked by
    // backpressure from later large records. Abort every pipeline stage before
    // awaiting cleanup, so rejection cannot hang on an unread transform.
    controller.abort();lines.close();gunzip?.destroy();output.destroy();source.destroy();await pumping.catch(()=>{});
  }
}
export async function inspectMatrixShard(path,options={}) {let header,count=0;for await(const row of readMatrixShard(path,options)){if(row.kind==='header')header=row.value;else if(row.kind==='run')count++;}return {header,count,sha256:await hashFile(path)};}
