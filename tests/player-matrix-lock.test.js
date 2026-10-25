import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {acquireMatrixLock} from '../scripts/player-matrix-lock.mjs';

test('experiment locks reject duplicate writers and release without deleting another owner',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'matrix-lock-'));
 try{
  const release=await acquireMatrixLock(directory);
  await release.assertOwned();
  await assert.rejects(acquireMatrixLock(directory),/already locked/);
  await release();const releaseAgain=await acquireMatrixLock(directory);
  await writeFile(join(directory,'.matrix-lock.json'),JSON.stringify({pid:process.pid,token:'replaced-owner'}));
  await assert.rejects(releaseAgain.assertOwned(),/ownership changed/);
  await releaseAgain();await assert.rejects(acquireMatrixLock(directory),/already locked/);
 }finally{await rm(directory,{recursive:true,force:true});}
});

async function deadPid(){
 const child=spawn(process.execPath,['-e','process.exit(0)']);
 await new Promise((yes,no)=>{child.once('error',no);child.once('exit',code=>code===0?yes():no(Error('dead-pid helper failed')));});
 return child.pid;
}

test('stale lock recovery refuses an existing reclaim lock without removing either owner',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'matrix-lock-reclaim-'));
 try{
  const old={pid:await deadPid(),token:'dead-writer'};
  const reclaim={pid:await deadPid(),token:'dead-reclaimer-needs-inspection'};
  await writeFile(join(directory,'.matrix-lock.json'),JSON.stringify(old));
  await writeFile(join(directory,'.matrix-lock.reclaim.json'),JSON.stringify(reclaim));
  await assert.rejects(acquireMatrixLock(directory),/recovery is already locked or unverifiable/);
  assert.deepEqual(JSON.parse(await readFile(join(directory,'.matrix-lock.json'),'utf8')),old);
  assert.deepEqual(JSON.parse(await readFile(join(directory,'.matrix-lock.reclaim.json'),'utf8')),reclaim);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('concurrent child processes recover one dead pid with at most one live writer',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'matrix-lock-race-'));
 const moduleUrl=new URL('../scripts/player-matrix-lock.mjs',import.meta.url).href;
 const children=[];
 const code=`
  import {acquireMatrixLock} from ${JSON.stringify(moduleUrl)};
  let release;
  process.send({type:'ready'});
  process.on('message',async message=>{
   if(message==='go'){
    try{release=await acquireMatrixLock(process.argv[1]);await release.assertOwned();process.send({type:'acquired'});}
    catch(error){process.send({type:'rejected',message:error.message});process.disconnect();}
   }else if(message==='probe'){
    try{await release.assertOwned();process.send({type:'owned'});}
    catch(error){process.send({type:'lost',message:error.message});}
   }else if(message==='release'){
    await release();process.send({type:'released'});process.disconnect();
   }
  });`;
 function worker(){
  const child=spawn(process.execPath,['--input-type=module','-e',code,directory],{stdio:['ignore','ignore','pipe','ipc']});children.push(child);
  child.stderr.on('data',()=>{});
  const queue=[],waiters=[];
  child.on('message',value=>{if(waiters.length)waiters.shift()(value);else queue.push(value);});
  return {child,next:()=>queue.length?Promise.resolve(queue.shift()):new Promise(yes=>waiters.push(yes))};
 }
 try{
  await writeFile(join(directory,'.matrix-lock.json'),JSON.stringify({pid:await deadPid(),token:'one-shared-dead-owner'}));
  const racers=Array.from({length:8},worker);
  assert.ok((await Promise.all(racers.map(w=>w.next()))).every(m=>m.type==='ready'));
  for(const w of racers)w.child.send('go');
  const outcomes=await Promise.all(racers.map(w=>w.next()));
  assert.equal(outcomes.filter(m=>m.type==='acquired').length,1,'only one child may become a live writer');
  assert.equal(outcomes.filter(m=>m.type==='rejected').length,7);
  const winner=racers[outcomes.findIndex(m=>m.type==='acquired')];
  const current=JSON.parse(await readFile(join(directory,'.matrix-lock.json'),'utf8'));
  assert.equal(current.pid,winner.child.pid);
  winner.child.send('probe');assert.equal((await winner.next()).type,'owned');
  // A fresh late contender must be refused throughout the winner's held period.
  const late=worker();assert.equal((await late.next()).type,'ready');late.child.send('go');
  const refused=await late.next();assert.equal(refused.type,'rejected');assert.match(refused.message,/already locked/);
  winner.child.send('probe');assert.equal((await winner.next()).type,'owned');
  winner.child.send('release');assert.equal((await winner.next()).type,'released');
  const after=await acquireMatrixLock(directory);await after.assertOwned();await after();
 }finally{
  await Promise.all(children.map(child=>new Promise(yes=>{if(child.exitCode!==null||child.signalCode!==null)return yes();child.once('exit',yes);child.kill('SIGTERM');})));
  await rm(directory,{recursive:true,force:true});
 }
});
