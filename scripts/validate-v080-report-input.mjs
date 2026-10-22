import {readFile} from 'node:fs/promises';
export async function validateFinalReport(report){
 const require=(ok,message)=>{if(!ok)throw new Error(message)};
 const specifications=[['cards','holdout',128,345600,17920],['layers','holdout',64,9600,0],['campaigns','holdout',32,928,0],['campaigns','stress',8,232,0]];
 require(report.batches?.length===4,'Final report must contain exactly four declared final batches');
 const selected={};
 for(const [mode,split,samples,rows,future] of specifications){
  const matches=report.batches.filter(b=>b.config.mode===mode&&b.config.split===split&&b.config.samples===samples&&b.gameVersion==='0.8.0');
  require(matches.length===1,`Missing or ambiguous final ${mode}/${split}/${samples}`);const b=matches[0];
  require(b.config.start===0&&b.config.seed==='v080-final2-unseen-20261023',`Wrong final namespace/range for ${mode}/${split}`);
  require(b.sourceStable===true&&b.counts.rows===rows&&b.counts.future===future,`Wrong completeness/count for ${mode}/${split}`);
  require(b.cards?.length===90&&new Set(b.cards.map(c=>c.id)).size===90,`Wrong recruitable card population in ${mode}/${split}`);
  if(mode==='campaigns'){require(b.config.difficulty===(split==='stress'?20:10),'Wrong difficulty');require(b.summary?.length===29&&b.summary.every(r=>r.n===samples&&r.incomplete===0),'Wrong policy population or incomplete outcomes');}
  if(mode==='cards')require(b.cardOverview?.length===180&&b.cardOverview.every(r=>r.n===128),'Wrong independent card sample groups');
  selected[mode==='campaigns'?(split==='stress'?'stress':'campaigns'):mode]=b;
 }
 const snapshot=JSON.parse(await readFile('report/v080-balance/final2-snapshot.json','utf8'));
 for(const b of report.batches)for(const [file,hash] of Object.entries(b.sourceHashes))require(snapshot.hashes[file]===hash,`Final2 source mismatch: ${file}`);
 const canonical=value=>JSON.stringify(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
 require(report.batches.every(b=>canonical(b.sourceHashes)===canonical(selected.cards.sourceHashes)),'Final batches do not have identical source hashes');
 return selected;
}
