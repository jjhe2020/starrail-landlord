import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cpus,totalmem,platform,arch} from 'node:os';
import {sourceFingerprint,atomicJson} from './player-matrix.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
async function execute(command,args,logPath){
 await new Promise((yes,no)=>{const log=createWriteStream(logPath),child=spawn(command,args,{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
  child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
  child.once('error',error=>{log.end();no(error);});
  child.once('close',code=>log.end(()=>code===0?yes():no(Error(`${command} ${args.join(' ')} failed (${code}); inspect ${logPath}`))));
 });
}
export async function runPreflight({directory=resolve(root,'report/player-matrix-v1/revision-2/validation')}={}){
 directory=resolve(directory);await mkdir(directory,{recursive:true});
 const sourceHashes=await sourceFingerprint();
 const report={format:'player-matrix-preflight-v1',passed:false,sourceHashes,startedAt:new Date().toISOString(),runtime:{node:process.version,v8:process.versions.v8,platform:platform(),arch:arch(),logicalCpus:cpus().length,memoryBytes:totalmem()},gates:[]};
 const stages=[
  ['syntax-and-assets','npm',['run','check']],
  ['behavior-tests','npm',['test']],
  ['production-build','npm',['run','build']],
  ['released-engine-parity',process.execPath,['scripts/verify-player-matrix-engine-parity.mjs','--output',resolve(directory,'engine-parity.json')]],
  ['policy-qualification',process.execPath,['scripts/validate-player-policies.mjs','--output',resolve(directory,'policy-qualification.json'),'--policies-output',resolve(directory,'policy-manifest.json'),'--fixtures-output',resolve(directory,'policy-fixtures.json')]],
  ['statistical-calibration',process.execPath,['scripts/validate-player-matrix-statistics.mjs','--output',resolve(directory,'statistical-calibration.json')]],
 ];
 try{
  for(const [name,command,args] of stages){
   const started=Date.now(),logPath=resolve(directory,`${name}.log`);console.log(`Preflight: ${name}`);
   await execute(command,args,logPath);report.gates.push({name,passed:true,elapsedMs:Date.now()-started,logPath});await atomicJson(resolve(directory,'preflight.json'),report);
  }
  for(const name of ['engine-parity','policy-qualification','statistical-calibration'])if(JSON.parse(await readFile(resolve(directory,`${name}.json`),'utf8')).passed!==true)throw Error(`${name} did not qualify`);
  if(JSON.stringify(sourceHashes)!==JSON.stringify(await sourceFingerprint()))throw Error('Sources changed during preflight; do not start a formal experiment');
  report.passed=true;report.completedAt=new Date().toISOString();await atomicJson(resolve(directory,'preflight.json'),report);return report;
 }catch(error){report.error=error.stack||String(error);await atomicJson(resolve(directory,'preflight.json'),report);throw error;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length>4||process.argv[2]&&process.argv[2]!=='--directory')throw Error('Use --directory path');
 const result=await runPreflight({directory:process.argv[3]});console.log(`All ${result.gates.length} preflight gates passed.`);
}
