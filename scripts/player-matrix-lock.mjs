import {open,readFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';

function validOwner(owner){return Number.isSafeInteger(owner?.pid)&&owner.pid>0&&typeof owner.token==='string'&&owner.token.length>0;}
async function ownerAt(path){
 let owner;try{owner=JSON.parse(await readFile(path,'utf8'));}
 catch{throw Error(`Unverifiable experiment lock; inspect ${path} before resuming`);}
 if(!validOwner(owner))throw Error(`Invalid experiment lock: ${path}`);
 return owner;
}
function alive(pid){try{process.kill(pid,0);return true;}catch(error){if(error.code==='ESRCH')return false;if(error.code==='EPERM')return true;throw error;}}
async function createOwner(path,token){
 const handle=await open(path,'wx');
 try{await handle.writeFile(JSON.stringify({pid:process.pid,token,startedAt:new Date().toISOString()})+'\n');}
 finally{await handle.close();}
}
function releaseFor(path,token,directory){
 const release=async()=>{let owner;try{owner=JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code==='ENOENT')return;throw error;}if(owner.token===token)await unlink(path);};
 release.assertOwned=async()=>{const owner=await ownerAt(path);if(owner.token!==token||owner.pid!==process.pid)throw Error(`Experiment lock ownership changed: ${directory}`);};
 return release;
}

// A second local invocation must never write a stage or experiment in parallel.
export async function acquireMatrixLock(directory){
 const path=resolve(directory,'.matrix-lock.json'),token=randomUUID();
 try{await createOwner(path,token);return releaseFor(path,token,directory);}
 catch(error){if(error.code!=='EEXIST')throw error;}
 const observed=await ownerAt(path);
 if(alive(observed.pid))throw Error(`Experiment directory is already locked by process ${observed.pid}: ${directory}`);

 // Only one process may inspect and remove a dead owner's lock. Two token reads
 // alone are not a compare-and-swap: another reclaimer could publish between
 // the second read and unlink. A crashed/untrusted reclaim lock is deliberately
 // left for explicit inspection rather than recovered recursively.
 const reclaimPath=resolve(directory,'.matrix-lock.reclaim.json'),reclaimToken=randomUUID();
 try{await createOwner(reclaimPath,reclaimToken);}
 catch(error){if(error.code==='EEXIST')throw Error(`Stale-lock recovery is already locked or unverifiable; inspect ${reclaimPath} before resuming`);throw error;}
 const releaseReclaim=releaseFor(reclaimPath,reclaimToken,directory);
 try{
  await releaseReclaim.assertOwned();
  const latest=await ownerAt(path);
  if(latest.token!==observed.token||latest.pid!==observed.pid)throw Error(`Experiment lock ownership changed during stale recovery: ${directory}`);
  if(alive(latest.pid))throw Error(`Experiment directory is already locked by process ${latest.pid}: ${directory}`);
  await unlink(path);
  try{await createOwner(path,token);}
  catch(error){if(error.code==='EEXIST')throw Error(`Experiment directory was claimed by another writer during stale recovery: ${directory}`);throw error;}
  return releaseFor(path,token,directory);
 }finally{await releaseReclaim();}
}
