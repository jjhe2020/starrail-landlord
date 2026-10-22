import {execFileSync,spawn} from 'node:child_process';
import {mkdtemp,cp,readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),name=process.argv[2]||'calibration1';
if(!/^[a-z0-9-]+$/.test(name))throw new Error('Snapshot name must be lowercase alphanumeric/hyphen');
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const path=await mkdtemp(join(tmpdir(),`starrail-v080-${name}-`));
await new Promise((yes,no)=>{const archive=spawn('git',['archive',sha],{cwd:root}),tar=spawn('tar',['-xf','-','-C',path]);archive.stdout.pipe(tar.stdin);archive.on('error',no);tar.on('error',no);tar.on('close',code=>code?no(Error(`tar ${code}`)):yes());});
for(const entry of ['src','scripts','package.json','VERSION'])await cp(join(root,entry),join(path,entry),{recursive:true});
const files=[];async function walk(folder){for(const e of await readdir(folder,{withFileTypes:true})){const p=join(folder,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
for(const entry of ['src','scripts'])await walk(join(path,entry));files.push(join(path,'package.json'),join(path,'VERSION'));
const hashes={};for(const f of files.sort())hashes[relative(path,f)]=createHash('sha256').update(await readFile(f)).digest('hex');
const manifest={name,path,baseCommit:sha,createdAt:new Date().toISOString(),method:'git archive HEAD then explicit src/scripts/package.json/VERSION overlay; no report or other untracked files copied',hashes};
await mkdir(join(root,'report/v080-balance'),{recursive:true});await writeFile(join(root,'report/v080-balance',`${name}-snapshot.json`),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({name,path,baseCommit:sha,files:Object.keys(hashes).length}));
