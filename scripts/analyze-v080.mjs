import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2), opts = new Map();
for (let i = 0; i < args.length; i += 2) { if (!['--inputs','--output'].includes(args[i]) || !args[i + 1]) throw new Error('Use --inputs comma-separated-paths --output path.json'); opts.set(args[i], args[i + 1]); }
const inputs = (opts.get('--inputs') || '').split(',').filter(Boolean); if (!inputs.length) throw new Error('At least one raw input required');
const output = resolve(opts.get('--output') || 'report/v080-balance/analysis.json');
const round = n => Number.isFinite(n) ? Math.round(n * 1e6) / 1e6 : null;
const mean = xs => xs.length ? xs.reduce((s,x)=>s+x,0)/xs.length : null;
const quantile = (values, p) => { if (!values.length) return null; const xs = [...values].sort((a,b)=>a-b), i = (xs.length-1)*p; return round(xs[Math.floor(i)] + (xs[Math.ceil(i)]-xs[Math.floor(i)])*(i-Math.floor(i))); };
const describe = xs => ({n:xs.length, mean:round(mean(xs)), median:quantile(xs,.5), p95:quantile(xs,.95), p99:quantile(xs,.99), min:xs.length?Math.min(...xs):null, max:xs.length?Math.max(...xs):null});
const sha256 = async path => { const hash = createHash('sha256'); for await (const bytes of createReadStream(path)) hash.update(bytes); return hash.digest('hex'); };
const batches = [];
for (const input of inputs) {
  const path = resolve(input), raw = createReadStream(path), stream = path.endsWith('.gz') ? raw.pipe(createGunzip()) : raw;
  const lines = createInterface({input:stream, crlfDelay:Infinity}); let header = null, ended = false, rows = 0, future = 0;
  const campaign = [], maxAttack = [], maxMultiplier = [], instanceAttack = [], roleExposure = {}, natural = new Map();
  for await (const line of lines) {
    const record = JSON.parse(line); if (ended) throw new Error(`Records after footer: ${input}`);
    if (!header) { if (record.kind !== 'header') throw new Error(`Missing header: ${input}`); header=record; continue; }
    if (record.kind === 'row') {
      rows++; const run = record.value;
      if (header.value.config.mode !== 'campaigns') continue;
      const attackValues = run.finalRoster.map(u=>u.attackBonus ?? u.permanentAttack ?? u.growth ?? 0), ratioValues = run.finalRoster.map(u=>Math.max(0, ...Object.values(u.normalAttackBonus || {})));
      maxAttack.push(Math.max(0,...attackValues)); maxMultiplier.push(Math.max(0,...ratioValues)); instanceAttack.push(...attackValues);
      const stage = {};
      for (const id of ['early','mid','late']) { const ts=run.turns.filter(t=>t.stage===id); stage[id]={reached:ts.length>0, turns:ts.length, damage:ts.length?mean(ts.map(t=>t.damage)):0, hpLost:ts.length?mean(ts.map(t=>t.hpLost)):0}; }
      campaign.push({seed:run.seed,strategyId:run.strategyId,won:run.won,floor:run.floor,stopped:run.stopped,death:run.death,stage});
      for(const turn of run.turns) for(const card of turn.cards) {
        roleExposure[card.role]=(roleExposure[card.role]||0)+card.present;
        if(!natural.has(card.id))natural.set(card.id,{id:card.id,role:card.role,held:0,present:0,damage:0,normalDamage:0,followUpDamage:0,healing:0,shield:0,attackBonusGained:0,triggered:0,seeds:new Set()});
        const a=natural.get(card.id); for(const k of ['held','present','damage','normalDamage','followUpDamage','healing','shield','triggered'])a[k]+=card[k]||0;
        a.attackBonusGained+=card.attackBonusGained??card.growth??0;if(card.present)a.seeds.add(run.seed);
      }
    } else if (record.kind === 'future') future++;
    else if (record.kind === 'end') { if(record.counts.rows!==rows||record.counts.future!==future||header.expectedCounts.rows!==rows||header.expectedCounts.future!==future)throw new Error(`Count mismatch: ${input}`);ended=true; }
    else throw new Error(`Unknown record ${record.kind}`);
  }
  if(!ended)throw new Error(`Truncated raw: ${input}`); if(!header.value.sourceStable)throw new Error(`Unstable source: ${input}`);
  const h=header.value;
  const compactInterval = value => value ? {n:value.n,mean:value.mean,ci:value.ci} : undefined;
  const compactMetrics = value => Object.fromEntries(Object.entries(value || {}).map(([key,metric])=>[key,compactInterval(metric)]));
  const overview = (h.cardOverview || []).map(row=>({focusId:row.focusId,name:row.name,role:row.role,rarity:row.rarity,background:row.background,n:row.n,triggered:row.triggered,present:row.present,nonzeroMarginal:row.nonzeroMarginal,delta:compactMetrics(row.delta),full:compactMetrics(row.full),presence:compactMetrics(row.presence)}));
  const stageMeans = (h.config.mode==='cards' ? [...new Set(h.summary.map(row=>`${row.focusId}|${row.background}|${row.stage}`))] : []).map(key=>{const rs=h.summary.filter(row=>`${row.focusId}|${row.background}|${row.stage}`===key);return{focusId:rs[0].focusId,background:rs[0].background,stage:rs[0].stage,n:rs[0].n,scope:'equal-weight descriptive mean across five enemy scenarios; not independent samples or a CI',fullDamage:round(mean(rs.map(r=>r.full.damage.mean))),skillDamageAdded:round(mean(rs.map(r=>r.delta.damage.mean))),netHpSaved:round(-mean(rs.map(r=>r.delta.hpLost.mean)))};});
  const batch={input,sha256:await sha256(path),gameVersion:h.gameVersion,protocol:h.protocol,policyVersion:h.policyVersion,config:h.config,sourceHashes:h.sourceHashes,sourceStable:h.sourceStable,elapsedMs:h.elapsedMs,derivation:h.derivation,provenanceInputs:h.provenanceInputs,counts:{rows,future},cards:h.cards?.map(({effects,...card})=>card),synergies:h.synergies,summary:h.config.mode==='campaigns'?h.summary:undefined,cardOverview:overview.length?overview:undefined,stageMeans:stageMeans.length?stageMeans:undefined,overviewComparisons:h.overviewComparisons?.map(({focusId,name,role,rarity,background,measure,status,referenceMean,ci95,q})=>({focusId,name,role,rarity,background,measure,status,referenceMean,ci95:compactInterval(ci95),q})),layerOverview:h.layerOverview?.map(row=>({...row,delta:compactMetrics(row.delta)})),futureSummary:h.futureSummary?.map(row=>({...row,delta:compactMetrics(row.delta),curve:row.curve.map(turn=>({...turn,delta:compactMetrics(turn.delta)}))}))};
  if(campaign.length) {
    const totalExposure=Object.values(roleExposure).reduce((a,b)=>a+b,0);
    batch.natural={scope:'descriptive mixture of public-tag policies; correlated policies share seeds, no independent-sample CI on mixture',campaigns:campaign.length,uniqueSeeds:new Set(campaign.map(c=>c.seed)).size,maxAttackBonus:describe(maxAttack),instanceAttackBonus:describe(instanceAttack),maxAttackMultiplierBonus:describe(maxMultiplier),roleExposure:Object.fromEntries(Object.entries(roleExposure).map(([role,n])=>[role,{n,share:round(n/totalExposure)}])),cards:[...natural.values()].map(row=>({...row,seeds:row.seeds.size,damagePerAppearance:round(row.damage/row.present),healingPerAppearance:round(row.healing/row.present),shieldPerAppearance:round(row.shield/row.present)})),campaign};
  }
  batches.push(batch);
}
// Cross-version pairs are descriptive seed matches. Tag/content/AI changes can alter
// choices and teammate panels, so these are not one-mechanism causal effects.
const crossVersion=[];
for(let i=0;i<batches.length;i++)for(let j=i+1;j<batches.length;j++) {
  const a=batches[i], b=batches[j]; if(!a.natural||!b.natural||a.gameVersion===b.gameVersion||a.config.difficulty!==b.config.difficulty)continue;
  const map=new Map(a.natural.campaign.map(r=>[`${r.strategyId}|${r.seed}`,r])); const matched=b.natural.campaign.filter(r=>map.has(`${r.strategyId}|${r.seed}`));
  crossVersion.push({a:a.input,b:b.input,paired:matched.length,strategies:[...new Set(matched.map(r=>r.strategyId))].map(id=>{const rs=matched.filter(r=>r.strategyId===id);return{id,n:rs.length,oldWins:rs.filter(r=>map.get(`${r.strategyId}|${r.seed}`).won).length,newWins:rs.filter(r=>r.won).length,meanWinDelta:round(mean(rs.map(r=>Number(r.won)-Number(map.get(`${r.strategyId}|${r.seed}`).won)))),meanFloorDelta:round(mean(rs.map(r=>r.floor-map.get(`${r.strategyId}|${r.seed}`).floor)))}}),note:'Common initial seeds; rules and AI may produce divergent choices. No significance claim from this descriptive cross-version table.'});
}
const report={generatedAt:new Date().toISOString(),analysisScript:{path:'scripts/analyze-v080.mjs',sha256:await sha256(new URL(import.meta.url))},scope:'Actual engine balance evidence, separate from functionality checks; values and conclusions remain conditional on AI and declared scenarios.',batches,crossVersion};
await mkdir(dirname(output),{recursive:true}); await writeFile(output,JSON.stringify(report,null,2)+'\n');
const md=['# 0.8 平衡测量数据摘要','','统计口径、预设样本与独立种子规则见同目录 `PROTOCOL.md`。未达等价范围、区间不足和低曝光需保留，不能用功能测试通过代替。',''];
for(const b of batches){md.push(`## ${b.gameVersion} · ${b.config.mode} · ${b.config.split}`,`原始文件：\`${b.input}\`；SHA-256：\`${b.sha256}\`。`,`种子：\`${b.config.seed}\`；样本起点 ${b.config.start}；每目标 ${b.config.samples} 组；${b.counts.rows} 条观察，${b.counts.future} 条未来轨迹。来源稳定：${b.sourceStable}。`,'');
if(b.config.mode==='campaigns'){md.push('| 公开拿牌偏好 | 通关/局数 | 胜率 | 95% Wilson区间 | 比无偏好实践判断 |','|---|---:|---:|---|---|');for(const s of b.summary)md.push(`| ${s.name} | ${s.wins}/${s.n} | ${(s.winRate*100).toFixed(1)}% | ${(s.winRateCI95[0]*100).toFixed(1)}–${(s.winRateCI95[1]*100).toFixed(1)}% | ${s.pairedBaseline.status} |`);md.push('','自然属性分布是全部策略混合描述，不把共享种子的策略当作独立样本。',`每局最终最高永久属性值：中位 ${b.natural.maxAttackBonus.median}，95分位 ${b.natural.maxAttackBonus.p95}；旧版该字段是 growth，新版应按数据定义读取为永久攻击力，不能据相同数值认定收益相同。`,'');}
if(b.config.mode==='cards'){const cs=b.overviewComparisons||[];md.push('| 比较背景 | 等价 | 超界 | 区间不足 | 参考不足 |','|---|---:|---:|---:|---:|');for(const bg of ['generic','compatible']){const rs=cs.filter(r=>r.background===bg);const counts={};for(const r of rs){const st=r.status??r.equivalence?.status??'unknown';counts[st]=(counts[st]||0)+1;}md.push(`| ${bg} | ${counts.equivalent||0} | ${counts.outside||0} | ${counts.insufficient||0} | ${counts['reference-insufficient']||counts['not-comparable']||0} |`);}md.push('统计单位为指标比较项，同一角色可能计入两项；合计非角色人数。适配背景只描述组合潜力；具体判据按原始元数据，不作所有角色同时等价的声明。','');}}
await writeFile(output.replace(/\.json$/,'.md'),md.join('\n')+'\n'); console.log(`Read and verified ${batches.length} raw reports; wrote ${output}`);
