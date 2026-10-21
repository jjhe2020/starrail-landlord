import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTERS } from '../src/content.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const options=new Map();
for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i]?.replace(/^--/,''),value=process.argv[i+1];if(!['input','output','project-dir','data-plugin-root','status','narrative','terminal'].includes(key)||!value||options.has(key))throw new Error('Use unique --input file --output html --project-dir directory --data-plugin-root directory --status creating|updating|paused|complete --narrative json [--terminal json]');options.set(key,value);}
const input=resolve(root,options.get('input')||'docs/V070-TEST-RESULTS.json');
const terminalPath=resolve(root,options.get('terminal')||'docs/V070-TERMINAL-CARDS.json');
const project=resolve(root,options.get('project-dir')||'.local/v070-report-app');
const output=resolve(root,options.get('output')||'artifacts/星穹转轮-v0.7.0-测试报告.html');
const plugin=resolve(options.get('data-plugin-root')||process.env.DATA_ANALYTICS_PLUGIN_ROOT||join(process.env.HOME||'','/.codex/plugins/cache/openai-curated-remote/data-analytics/1.0.11'));
const exists=async path=>{try{await access(path);return true;}catch{return false;}};
const run=(script,args)=>{const result=spawnSync(process.execPath,[join(plugin,'scripts',script),...args],{encoding:'utf8',cwd:root});if(result.status!==0)throw new Error(result.stderr||result.stdout||`Data runtime failed: ${script}`);if(result.stdout.trim())console.log(result.stdout.trim());};
const raw=await exists(input)?await readFile(input):null;
const measured=raw?JSON.parse(raw):null;
const terminalRaw=await exists(terminalPath)?await readFile(terminalPath):null;
const terminalData=terminalRaw?JSON.parse(terminalRaw):null;
if(terminalData&&!terminalData.validation?.ready)throw new Error('Terminal observation JSON has not passed validation; rejected results are not rendered.');
if(terminalData&&(!Array.isArray(terminalData.difficulties)||!terminalData.difficulties.length||!terminalData.sources?.length))throw new Error('Terminal observation JSON is missing difficulty panels or source provenance.');
if(terminalData&&terminalData.protocol!=='v070-terminal-card-observation-v1')throw new Error('Unsupported terminal observation protocol.');
if(terminalData&&measured&&terminalData.gameVersion!==measured.gameVersion)throw new Error('Terminal observations and compact report have different game versions.');
if(terminalData&&measured){
 const expected=new Map((measured.sources||[]).flatMap(source=>Object.entries(source.sourceHashes||{})));
 let matched=0;
 for(const source of terminalData.sources||[])for(const [path,sha]of expected){if(source.sourceHashes?.[path]!==sha)throw new Error('Terminal observations are missing or mismatch a frozen source: '+path);}
 for(const source of terminalData.sources||[])for(const [path,sha]of Object.entries(source.sourceHashes||{})){if(expected.has(path)){if(expected.get(path)!==sha)throw new Error('Terminal observations use a different source freeze: '+path);matched++;}}
 if(!matched)throw new Error('Terminal observations have no matching frozen source fingerprints.');
}
if(measured&&!measured.validation?.ready)throw new Error('Input compact JSON has not passed validation; rejected results are not rendered.');
const narrative=options.has('narrative')?JSON.parse(await readFile(resolve(root,options.get('narrative')),'utf8')):{};
const packageInfo=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
const roles={attack:'攻击',defense:'防御',amplifier:'即时增幅',trainer:'永久培养',disruptor:'敌方干扰'};
const rarity={common:'普通',uncommon:'稀有',rare:'史诗',legendary:'传说'};
const attacks={single:'单体',blast:'扩散',aoe:'群体',support:'支援'};
const statusLabels={equivalent:'等价范围内',outside:'超出实践范围',insufficient:'区间不足','reference-insufficient':'参考不足','potential-description':'仅潜力描述'};
const stageLabels={early:'前期',mid:'中期',late:'后期'};
const metricLabels={netHpSaved:'净生命保护',effectiveDamage:'登场有效伤害增量',teamDamageAdded:'队伍伤害增量',growthCreated:'发放成长',damage:'有效伤害',hpLost:'净生命损失',healing:'实际治疗',shieldGenerated:'护盾生成',shieldBlocked:'护盾抵伤',shieldRemaining:'剩余护盾',growth:'本回合成长',retainedGrowthDelta:'保留成长增量',coins:'信用点',directDamage:'焦点直接伤害'};
const relativePath=path=>{if(!path)return '';const value=relative(root,resolve(path));return value.startsWith('..')?String(path).split('/').at(-1):value;};
const cards=(measured?.cards?.length?measured.cards:CHARACTERS).map(c=>({...c,roleLabel:c.roleLabel||roles[c.role],rarityLabel:rarity[c.rarity]||c.rarity,attackLabel:attacks[c.attack]||c.attack,description:c.description||(c.effects||[]).map(e=>e.summary+'。').join(''),effectsJson:JSON.stringify(c.effects||[])}));
const sourceFiles=(measured?.sources||[]).map(source=>({...source,path:relativePath(source.path)}));
const dataReady=Boolean(measured?.validation?.ready&&sourceFiles.length);
const measureSource={label:dataReady?'冻结规则实验的核验后汇总':'尚无有效测量结果',files:[relativePath(input),...sourceFiles.map(s=>s.path)].filter(Boolean),evidenceFlow:sourceFiles.map(source=>({title:`${source.mode} · ${source.split}`,detail:`${source.path}; SHA-256 ${source.sha256}; ${source.rawCount} 条原始观察；参数 ${JSON.stringify(source.config)}`}))};
const query=(rows,componentIds,definition,source=measureSource)=>({rows,source:{...source,metricDefinitions:[{label:'口径与范围',definition,componentIds}]},methods:[{language:'JavaScript',code:'从 scripts/summarize-v070.mjs 的 compact JSON 选择对应已核验汇总；界面格式化均值和区间，不重新计算推断统计。'}]});
const overview=(measured?.cardOverview||[]).map(row=>({...row,roleLabel:roles[row.role],rarityLabel:rarity[row.rarity],backgroundLabel:row.background==='generic'?'通用队友':'适配队友',key:`${row.focusId}:${row.background}`}));
const comparisons=(measured?.comparisons||[]).map((row,index)=>({...row,key:`${row.focusId}:${row.background}:${row.measure}:${index}`,roleLabel:roles[row.role],rarityLabel:rarity[row.rarity],backgroundLabel:row.background==='generic'?'通用队友':'适配队友',measureLabel:metricLabels[row.measure]||row.measure,statusLabel:statusLabels[row.status]||row.status}));
const campaigns=(measured?.campaigns||[]).flatMap(report=>(report.strategies||[]).map(row=>({...row,key:`${report.difficulty}:${row.id}`,difficulty:report.difficulty,split:report.split,statusLabel:row.id==='baseline'?'基础 AI 对照':statusLabels[row.pairedBaseline?.status]||'待判定'})));
const stages=campaigns.flatMap(row=>Object.entries(row.stages||{}).map(([stage,value])=>({...value,stage,stageLabel:stageLabels[stage]||stage,strategyId:row.id,strategyName:row.name,difficulty:row.difficulty,n:row.n,conditionalMean:value.conditionalDamage?.mean??null,allCampaignMean:value.allCampaignDamage?.mean??null})));
const coverage=(measured?.campaigns||[]).flatMap(report=>(report.cardCoverage?.cards||[]).flatMap(card=>Object.entries(card.stages||{}).map(([stage,value])=>({...value,focusId:card.id,name:card.name,role:card.role,roleLabel:roles[card.role],difficulty:report.difficulty,stage,stageLabel:stageLabels[stage]||stage,nSeeds:report.cardCoverage.nSeeds,population:report.cardCoverage.population,offeredCampaigns:card.offeredCampaigns,pickedCampaigns:card.pickedCampaigns,heldCampaignsAll:card.heldCampaigns,appearedCampaignsAll:card.appearedCampaigns}))));
const terminal=(terminalData?.difficulties||[]).flatMap(group=>(group.outcomes||[]).flatMap(outcome=>(outcome.cards||[]).map(card=>({...card,focusId:card.id,roleLabel:roles[card.role],difficulty:group.difficulty,outcome:outcome.id,outcomeLabel:{all:'全部终局',victory:'通关局',defeat:'失败局'}[outcome.id]||outcome.id,campaigns:outcome.campaigns,seeds:outcome.seeds,terminalFloors:outcome.terminalFloors,key:`${group.difficulty}:${outcome.id}:${card.id}`}))));
const terminal12=(terminalData?.difficulties||[]).flatMap(group=>(group.final12Outcomes||[]).flatMap(outcome=>(outcome.cards||[]).map(card=>({...card,focusId:card.id,roleLabel:roles[card.role],difficulty:group.difficulty,outcome:outcome.id,campaigns:outcome.campaigns,seeds:outcome.seeds,reachedCampaigns:outcome.reachedCampaigns,key:`${group.difficulty}:${outcome.id}:${card.id}`}))));
const terminalSource={label:terminalData?'自然对局的终止遭遇观测':'终止遭遇数据尚未提供',files:terminalData?[relativePath(terminalPath),...(terminalData.sources||[]).map(source=>relativePath(source.path))]:[],evidenceFlow:(terminalData?.sources||[]).map(source=>({title:`D${source.difficulty||source.config?.difficulty||''} 终止遭遇来源`,detail:`${relativePath(source.path)}; SHA-256 ${source.sha256}; 冻结生产源指纹 ${JSON.stringify(source.sourceHashes||{})}`}))};
const terminalQuery=query(terminal,['terminal-card'],'终止遭遇指本局最后实际战斗的楼层，失败可以发生在任意楼层。按原记录的全部实例（正式、临时和见习均可能包含）统计，不能分离永久卡；同一seed的多策略先合并分子分母，再估每实例登场/每持有实例回合产出率的均值和95%区间。伤害、治疗和护盾按角色归属记录，辅助增伤通常记在受益攻击者名下；这是自然观测，不是卡牌因果贡献。胜败分组是赛后条件切片。缺失与无曝光不记为零。效果日志中的非零声明不等于实际收益触发，例如易伤声明可能没有实际受益者；本页不据此估计有效触发率。',terminalSource);
const terminal12Query=query(terminal12,['terminal-card'],'第12层补充观察的 perCampaignAllSeeds 使用全部种子对局作分母，未抵达第12层或未持有该角色的产出计零；胜败仍是赛后分组，不能把到达者的条件每登场均值当成全体均值。展示区间来自种子聚类，不把同seed多策略当独立样本。',terminalSource);
terminal12Query.methods=[{language:'JavaScript',code:'读取终止遭遇附加JSON的 difficulties[].final12Outcomes[].cards[].perCampaignAllSeeds，不重新汇总或推断。'}];
terminalQuery.methods=[{language:'JavaScript',code:'读取 scripts/v070-terminal-cards.mjs 输出；按 difficulty / outcome / card 展开已核验的 seed 聚类区间、曝光分母和终止层分布。界面不重新估计区间，也不合并不同冻结源码的批次。'}];
const layers=(measured?.layers||[]).map(row=>({...row,damageDecrease:row.delta?.damage?.mean??null,hpProtection:row.delta?.hpLost?.mean==null?null:-row.delta.hpLost.mean,growthReduced:row.delta?.growth?.mean??null,coinsGenerated:row.delta?.coins?.mean??null}));
const spatialMetrics=new Set(['neighbors','row','column','aligned','edge','corner','emptyNeighbors']);
const spatialTargets=new Set(['adjacent','row','column','aligned']);
const spatialEffect=effect=>spatialTargets.has(effect.target)||spatialTargets.has(effect.range)||spatialMetrics.has(effect.per?.metric)||[effect.condition,...(effect.conditions||[])].some(c=>spatialMetrics.has(c?.metric));
const design=measured?.spatialDesign||{n:cards.length,spatial:cards.filter(c=>(c.effects||[]).some(spatialEffect)).length,fraction:cards.length?cards.filter(c=>(c.effects||[]).some(spatialEffect)).length/cards.length:null,globalExceptions:cards.filter(c=>!(c.effects||[]).some(spatialEffect)).map(c=>({id:c.id,name:c.name})),forbiddenStrategyReferences:[]};
const state={dataReady,inputExists:Boolean(raw),gameVersion:measured?.gameVersion||packageInfo.version,assessment:{...measured?.assessment,...narrative},validation:measured?.validation||{ready:false,errors:[],warnings:['正式结果尚未提供，页面只显示当前设计与待测状态。']},comparisonCounts:measured?.comparisonCounts||{},protocol:measured?.protocol||null,metadataSupplement:measured?.metadataSupplement||null,terminal:{ready:Boolean(terminalData?.validation?.ready),inputFile:relativePath(terminalPath),inputSha256:terminalRaw?createHash('sha256').update(terminalRaw).digest('hex'):null,protocol:terminalData?.protocol||null,definitions:terminalData?.definitions||null,warnings:terminalData?.validation?.warnings||[],final12Available:terminal12.length>0},synergyNames:Object.fromEntries((measured?.synergies||[]).map(row=>[row.id,row.name])),spatialDesign:design,sourceCount:sourceFiles.length,inputFile:relativePath(input),inputSha256:raw?createHash('sha256').update(raw).digest('hex'):null,metricLabels,stageLabels};
const snapshot={surface:'report',title:narrative.title||(dataReady?(measured?.assessment?.phase==='calibration'?'0.7 校准：先看职能分量与空间收益':'0.7 的组合收益与差异，按数据逐项判断'):'0.7 的空间与标签设计，还需要数据验证'),generatedAt:new Date().toISOString(),status:dataReady?'reviewed':'draft',buildStatus:options.get('status')||(dataReady?'complete':'paused'),filters:[],report:{},v070:state,queries:{
 report_meta:query([state],['report-summary','report-design','report-methods'],'设计状态、数据核验状态与统计结论分开记录。数据一致性通过不代表角色实践等价通过。'),
 catalog:query(cards,['catalog-table','selected-card','report-design'],'90 张候选角色的实际身份、职责、基础数值与技能定义；这是设计数据，不能解释成实测平衡结果。',{label:'当前角色规则定义',files:['src/content.js','docs/CARD-ROLES-V070.md']}),
 overview:query(overview,['card-overview','selected-card'],'每卡分别报告通用与适配背景。按独立布局组均匀平均预声明阶段和敌阵；技能关闭差为配对贡献，零收益保留。适配背景只描述潜力。'),
 comparisons:query(comparisons,['card-comparisons'],'同职责同稀有度的通用队友比较，参考不足不判等价；95%相对差区间是以观测同层均值为单位的配对差，不是比值置信区间。正式判定使用 decision 的校正线性边界。'),
 card_details:query(measured?.cardDetails||[],['selected-card'],'每卡、队友背景、阶段、敌阵的分层测量。相同布局组的重复 spin 不计作独立样本。'),
 growth:query(measured?.growth||[],['growth-curve','selected-card'],'培养者在无前置成长下最多六回合的配对未来轨迹；清场或死亡后停止，后续计零，不追加招募。'),
 layers:query(layers,['layer-contribution','layer-bars','layer-table'],'同状态逐项关闭来源的配对边际贡献。分量存在交互，不可相加；净生命保护为净生命损失差的相反数。'),
 layer_details:query(measured?.layerDetails||[],['layer-contribution'],'按阶段与敌阵分层的同状态关闭边际差，统计单位为布局组。'),
 campaigns:query(campaigns,['strategy-table'],'策略只改变公开候选拿牌偏好。同一难度共用 campaign 种子；不同策略对局不视为独立种子。胜率区间为 Wilson，差异和等价使用配对判定。'),
 campaign_stages:query(stages,['campaign-stages','stage-lines'],'到达者均值与全体 campaign 均值同时保留；未到达阶段在全体样本中计零，不能只保留成功到达者。'),
 terminal:terminalQuery,
 terminal12:terminal12Query,
 coverage:query(coverage,['natural-card-growth'],'实际对局的持有、出场及成长覆盖。先按共享种子合并策略，再估区间；缺失与无样本不转换成零。zeroTriggerAppearances仅计该次登场没有非零效果日志声明，不是实际收益触发率；易伤等非零声明可能没有受益者。实际配对非零收益来自受控card测量的nonzeroMarginal。角色直接伤害为零不能单独判弱。'),
 sources:query(sourceFiles,['report-methods'],'记录每批真实输入文件、SHA-256、实验配置、原始观察数及生产源指纹；不是新增实验。'),
}};
if(!['creating','updating','paused','complete'].includes(snapshot.buildStatus))throw new Error('Invalid --status');
await mkdir(dirname(project),{recursive:true});
const oldPath=join(project,'src/data.json');
if(await exists(oldPath))snapshot.id=JSON.parse(await readFile(oldPath,'utf8')).id;
else{const prepared=join(dirname(project),'v070-report-prepared-snapshot.json');await writeFile(prepared,JSON.stringify(snapshot));run('prepare-data-app.mjs',['--surface','report','--output',project,'--snapshot',prepared]);snapshot.id=JSON.parse(await readFile(oldPath,'utf8')).id;}
await writeFile(oldPath,JSON.stringify(snapshot));
await cp(join(root,'report/v070/ReportContent.jsx'),join(project,'src/content/report/ReportContent.jsx'));
await cp(join(root,'report/v070/report.css'),join(project,'src/content/report/report.css'));
run('data-app.mjs',['build','--project-dir',project,'--separate-data']);
const exported=join(project,'.data-app-offline/exports/星穹转轮-v0.7.0-测试报告.html');
run('data-app.mjs',['export-offline','--project-dir',project,'--output',exported]);
await mkdir(dirname(output),{recursive:true});await cp(exported,output);
console.log(JSON.stringify({output,project,previewDirectory:join(project,'dist'),dataReady,buildStatus:snapshot.buildStatus,cards:cards.length,strategies:campaigns.length,terminalRows:terminal.length,terminal12Rows:terminal12.length,terminalReady:Boolean(terminalData?.validation?.ready),pending:!dataReady},null,2));
