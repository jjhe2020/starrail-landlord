import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
export async function matrixStatus(directory=resolve(root,'.local/player-matrix-v1/standard-20261026-r2')){
 const state=JSON.parse(await readFile(resolve(directory,'experiment.json'),'utf8'));
 let alive=false;try{process.kill(state.pid,0);alive=true;}catch(error){if(error.code==='EPERM')alive=true;}
 let progress=null;try{progress=JSON.parse(await readFile(resolve(directory,state.stage,'progress.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const rate=progress?.completed&&progress.elapsedMs?progress.completed/(progress.elapsedMs/1000):null;
 return {protocol:state.protocol,stage:state.stage,status:state.status,pid:state.pid,processAlive:alive,sourceIdentityFiles:Object.keys(state.sourceHashes).length,updatedAt:state.updatedAt,progress,remainingSecondsAtCurrentStageRate:rate?(progress.total-progress.completed)/rate:null,completedStages:state.stages,error:state.error||null,interpretation:state.status==='complete'?'All registered stages and report finished':alive?'Experiment is still in progress; no final balance conclusion':'Process is not running; resume with the same frozen sources and directory'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length>4||process.argv[2]&&process.argv[2]!=='--directory')throw Error('Use --directory path');
 console.log(JSON.stringify(await matrixStatus(process.argv[3]),null,2));
}
