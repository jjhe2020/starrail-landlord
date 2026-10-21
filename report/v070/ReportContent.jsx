import React, { useState } from 'react';
import { DataComponent, DataTable, Dropdown, EvidenceChart, ReportSection, RichNarrative, SectionNavigator, useDataApp } from '../../data-app-public.jsx';
import { readableNarrativeTables } from './narrative-format.mjs';

const roleNames={attack:'攻击',defense:'防御',amplifier:'即时增幅',trainer:'永久培养',disruptor:'敌方干扰'};
const backgroundNames={generic:'通用队友',compatible:'适配队友'};
const stageNames={early:'前期',mid:'中期',late:'后期',all:'全部阶段'};
const enemyNames={standard:'五列高血靶',killable:'低血群怪',swarm:'低血群怪',armor:'带护甲群怪',boss:'单目标高血靶',retaliation:'强反击敌阵',pressure:'强反击敌阵',all:'全部敌阵'};
const metricNames={damage:'有效伤害',hpLost:'净生命损失',healing:'实际治疗',shieldGenerated:'护盾生成',shieldBlocked:'护盾抵伤',shieldRemaining:'剩余护盾',growth:'本回合成长',retainedGrowthDelta:'保留成长增量',coins:'信用点',directDamage:'焦点直接伤害'};
const effectTypeNames={power:'基础威力加成',powerMultiplier:'当轮威力倍率',damage:'追加伤害',growth:'永久培养',heal:'恢复生命',shield:'获得护盾',healOverflowShield:'恢复并溢出转盾',resource:'获得资源',vulnerability:'限定易伤',retaliationFlat:'固定反击削弱',retaliationMultiplier:'倍率反击削弱',summon:'临时召援',shieldMultiplier:'护盾效率倍率'};
const triggerNames={appearance:'登场时',passive:'条件满足时',kill:'常规击破时',retaliation:'敌方反击时',retire:'角色退场时',spin:'每次转动'};
const targetNames={self:'自身',adjacent:'相邻八格',row:'同行',column:'同列',all:'所有存活敌列',matching:'符合标签者',team:'本轮队伍'};
const outcomeNames={all:'全部终局',victory:'通关局',defeat:'失败局'};
const terminalMetricNames={damage:'角色实际伤害',healing:'实际治疗',shieldGenerated:'护盾生成',growthLevel:'记录成长水平'};
const terminalReading=value=>value&&value.n>0&&Number.isFinite(value.mean)?interval(value):'无有效样本';
const layerNames={growthGain:'本回合新增培养',investedGrowth:'已有永久成长',base:'临时基础威力',multiplier:'临时倍率',vulnerability:'限定易伤',extraAttack:'额外攻击',defense:'恢复与护盾',weakening:'敌方反击削弱'};
const layerChartNames={growthGain:'本轮培养',investedGrowth:'既有成长',base:'威力加成',multiplier:'当轮倍率',vulnerability:'限定易伤',extraAttack:'额外攻击',defense:'恢复护盾',weakening:'削弱反击'};
const layerMetricNames={damageDecrease:'有效伤害减少',hpProtection:'净生命保护减少',growthReduced:'成长减少',coinsGenerated:'信用点减少'};
const fmt=value=>Number.isFinite(value)?new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(value):'待测';
const pct=value=>Number.isFinite(value)?`${(value*100).toFixed(1)}%`:'待测';
const interval=(value,percentage=false)=>value&&Number.isFinite(value.mean)?`${percentage?pct(value.mean):fmt(value.mean)}${Array.isArray(value.ci)?` [${value.ci.map(percentage?pct:fmt).join('，')}]`:' [区间不足]'}`:'待测';
const negate=value=>value&&Number.isFinite(value.mean)?{...value,mean:-value.mean,ci:Array.isArray(value.ci)?[-value.ci[1],-value.ci[0]]:null}:null;
const unique=values=>[...new Set(values.filter(value=>value!==undefined&&value!==null))];
const lineSpec={type:'line',x:'stageLabel',y:'allCampaignMean',fields:['allCampaignMean','conditionalMean'],stackable:false,legend:{labels:{allCampaignMean:'全体对局（未到达计零）',conditionalMean:'仅到达该阶段者'}},valueDecimals:2};
function Pending({children='有效测试数据尚未提供；这里不会用零或示范数据替代。'}){return <p className="v070-pending" role="status">{children}</p>;}
function Status({label}){return <span className={`v070-status ${/超出|问题/.test(label)?'v070-status-warning':''}`}>{label||'待判定'}</span>;}
function Narrative({id,value,className}){return <RichNarrative id={id} value={readableNarrativeTables(value)} className={className} label="编辑报告说明"/>;}

export function ReportContent(){
 const {snapshot,reviewedRows,visible,appTitle,canEdit,mode,setAppTitle}=useDataApp();
 const state=snapshot.v070||{},ready=state.dataReady,assessment=state.assessment||{};
 const rows=id=>reviewedRows(id);
 const catalog=rows('catalog'),allOverview=rows('overview'),allComparisons=rows('comparisons'),allLayers=rows('layers'),allCampaigns=rows('campaigns'),allStages=rows('campaign_stages'),allCoverage=rows('coverage'),allTerminal=rows('terminal'),allTerminal12=rows('terminal12');
 const [role,setRole]=useState('all'),[background,setBackground]=useState('generic'),[selectedId,setSelectedId]=useState('1002');
 const [comparisonStatus,setComparisonStatus]=useState('all'),[layerMetric,setLayerMetric]=useState('damageDecrease'),[layerFamily,setLayerFamily]=useState('program');
 const difficulties=unique([...allCampaigns,...allTerminal].map(row=>String(row.difficulty))).sort((a,b)=>Number(a)-Number(b));
 const [difficulty,setDifficulty]=useState(difficulties[0]||'10'),[strategy,setStrategy]=useState('baseline');
 const [stage,setStage]=useState('all'),[enemy,setEnemy]=useState('all');
 const [terminalOutcome,setTerminalOutcome]=useState('all'),[terminalBasis,setTerminalBasis]=useState('perAppearance');
 const selected=catalog.find(row=>row.id===selectedId)||catalog[0];
 const roleRows=catalog.filter(row=>role==='all'||row.role===role),cardOverview=allOverview.filter(row=>(role==='all'||row.role===role)&&row.background===background);
 const comparisons=allComparisons.filter(row=>row.background===background&&(role==='all'||row.role===role)&&(comparisonStatus==='all'||row.status===comparisonStatus));
 const campaigns=allCampaigns.filter(row=>String(row.difficulty)===difficulty),strategies=unique(campaigns.map(row=>row.id));
 const phaseRows=allStages.filter(row=>String(row.difficulty)===difficulty&&row.strategyId===strategy);
 const layers=allLayers.filter(row=>layerFamily==='synergy'?row.id.startsWith('synergy:'):!row.id.startsWith('synergy:')).map(row=>({...row,label:layerNames[row.id]||`羁绊 · ${state.synergyNames?.[row.id.replace('synergy:','')]||row.id.replace('synergy:','')}`,chartLabel:layerChartNames[row.id]||state.synergyNames?.[row.id.replace('synergy:','')]||row.id.replace('synergy:',''),value:row[layerMetric]}));
 const details=rows('card_details').filter(row=>row.focusId===selected?.id&&row.background===background&&(stage==='all'||row.stage===stage)&&(enemy==='all'||row.enemy===enemy));
 const selectedOverview=allOverview.find(row=>row.focusId===selected?.id&&row.background===background);
 const future=rows('growth').filter(row=>row.focusId===selected?.id&&row.background===background);
 const coverage=allCoverage.filter(row=>row.focusId===selected?.id&&String(row.difficulty)===difficulty);
 const terminalCohortRows=allTerminal.filter(row=>String(row.difficulty)===difficulty&&row.outcome===terminalOutcome);
 const terminalRows=terminalCohortRows.filter(row=>row.focusId===selected?.id);
 const terminal12Rows=allTerminal12.filter(row=>row.focusId===selected?.id&&String(row.difficulty)===difficulty&&row.outcome===terminalOutcome);
 const terminal12Row=terminal12Rows[0];
 const terminalRow=terminalRows[0],terminalValues=terminalRow?.[terminalBasis]||{},terminalPooled=terminalBasis==='perAppearance'?terminalRow?.pooledPerAppearance:terminalRow?.pooledPerHeldInstanceTurn;
 const auditedEffects=(state.spatialDesign?.characters||[]).flatMap(card=>card.effects||[]),spatialEffects=auditedEffects.filter(effect=>effect.spatial).length;
 const counters=state.comparisonCounts||{},outsideCards=unique(allComparisons.filter(row=>row.background==='generic'&&row.status==='outside').map(row=>row.focusId));
 const pendingSummary='## 先看这三项结论\n\n- **卡牌强弱：待测。** 需要同职责、同稀有度的真实收益和不确定性，不能按支援卡的零直接伤害判弱。\n- **拿牌策略：待测。** 各种标签偏好的完整对局尚无有效正式结果，旧版本胜率不适用于本版。\n- **位置和乘区：待测。** 空间字段已经写入设计，是否实际产生足够收益要由配对干预验证。';
 const defaultSummary=`## 先看这三项结论\n\n- **卡牌差异：** 通用背景有 ${outsideCards.length} 张角色出现超出预设实践范围的比较；另有 ${counters.insufficient??0} 项区间不足、${counters['reference-insufficient']??0} 项参考不足。比较项目数与角色数不同。\n- **拿牌策略：** ${campaigns.length?`当前 D${difficulty} 展示 ${campaigns.length} 种策略，胜率、配对差异与等价判定见下表。`:'完整对局结果尚未提供。'}\n- **位置和乘区：** ${allLayers.length?'已提供关闭来源的配对边际差；各项存在交互，不能相加。':'配对干预结果尚未提供。'}\n\n${assessment.phase==='holdout'?'本页使用独立留出测量。':'这批包含校准或尚未明确为留出的数据，不能当成独立发布验收。'} 数据一致性核验通过，不等于已经证明全部卡牌或策略平衡。`;
 const conclusion=assessment.summaryMarkdown||(ready?defaultSummary:pendingSummary);
 const design=assessment.designMarkdown||'## 为什么这样改\n\n角色配合回到玩家能看懂的**命途、属性、正式阵营和职责**。内部“套路”只是一种测试拿牌偏好，不再决定卡牌受益名单，也不额外发放成型奖励。\n\n绝大多数技能以**相邻八格**为主，少量使用同行、同列、边缘、角落、孤立和空位。普通攻击提供底线，位置关系决定额外收益；因此抽到伙伴之后，还要碰到合适落位。\n\n攻击、防御、即时增幅、永久培养和敌方干扰各自有独立价值。培养有标签和距离限制，也不递归放大培养量；强组合应来自这些职能相互配合。';
 const overviewDisplay=cardOverview.map(row=>({...row,skillDamage:interval(row.delta?.damage),protection:interval(negate(row.delta?.hpLost)),growth:interval(row.delta?.growth),positionEffect:interval(row.spatialMagnitude?.damage),nonzeroRate:row.n?row.nonzeroMarginal/row.n:null}));
 const compareDisplay=comparisons.map(row=>({...row,relativeDifference:interval(row.ci95,true),reference:fmt(row.referenceMean),units:row.ci95?.n??null}));
 const layerDisplay=layers.map(row=>({...row,damageInterval:interval(row.delta?.damage),protectionInterval:interval(negate(row.delta?.hpLost)),growthInterval:interval(row.delta?.growth),coinsInterval:interval(row.delta?.coins)}));
 const strategyDisplay=campaigns.map(row=>({...row,winInterval:Array.isArray(row.winRateCI95)?`${pct(row.winRate)} [${row.winRateCI95.map(pct).join('，')}]`:pct(row.winRate),pairedDifference:interval(row.pairedBaseline?.ci95,true),result:`${row.wins}/${row.n}`}));
 const detailDisplay=details.map(row=>({...row,key:[row.focusId,row.stage,row.enemy].join(':'),stageLabel:stageNames[row.stage]||row.stage,enemyLabel:enemyNames[row.enemy]||row.enemy,damage:interval(row.delta?.damage),protection:interval(negate(row.delta?.hpLost)),growth:interval(row.delta?.growth),position:interval(row.spatialMagnitude?.damage),healing:interval(row.delta?.healing),shieldGenerated:interval(row.delta?.shieldGenerated),shieldBlocked:interval(row.delta?.shieldBlocked),shieldRemaining:interval(row.delta?.shieldRemaining),nonzeroRate:row.n?row.nonzeroMarginal/row.n:null}));
 const coverDisplay=coverage.map(row=>({...row,actualGrowth:interval(row.retainedGrowthLevel),appearanceDamage:interval(row.damagePerAppearance),appearanceHealing:interval(row.healingPerAppearance),appearanceShield:interval(row.shieldPerAppearance)}));
 const terminalOverviewDisplay=terminalCohortRows.map(row=>({...row,...Object.fromEntries(['damage','healing','shieldGenerated','growthLevel'].map(metric=>[`${metric}Mean`,row[terminalBasis]?.[metric]?.mean??null])),effectiveSeeds:row[terminalBasis]?.damage?.n??null}));
 const roleControl=<Dropdown label="职责" showLabel allLabel="全部职责" value={role} choices={['all',...Object.keys(roleNames)]} choiceLabels={{all:'全部职责',...roleNames}} onChange={setRole}/>;
 const backgroundControl=<Dropdown label="队友背景" showLabel value={background} choices={['generic','compatible']} choiceLabels={backgroundNames} onChange={setBackground}/>;
 const difficultyControl=difficulties.length?<Dropdown label="难度" showLabel value={difficulty} choices={difficulties} formatChoice={value=>`D${value}`} onChange={setDifficulty}/>:null;
 const terminalControls=<>{difficultyControl}<Dropdown label="终局结果" showLabel allLabel="全部终局" value={terminalOutcome} choices={['all','victory','defeat']} choiceLabels={outcomeNames} onChange={setTerminalOutcome}/><Dropdown label="产出口径" showLabel value={terminalBasis} choices={['perAppearance','perHeldInstanceTurn']} choiceLabels={{perAppearance:'每实例登场',perHeldInstanceTurn:'每持有实例回合'}} onChange={setTerminalBasis}/></>;
 return <article className="report-content v070-report" aria-label="0.7.0 设计与测试报告">
  <header className="report-hero">
   <h1 data-data-app-title contentEditable={canEdit&&mode==='edit'} suppressContentEditableWarning onBlur={canEdit&&mode==='edit'?event=>setAppTitle(event.currentTarget.textContent.trim()||appTitle):undefined}>{appTitle}</h1>
   <Narrative id="v070:deck" className="report-deck" value="设计、实测收益和已知不足放在一起看。先读结论，需要时再查具体卡牌。"/>
  </header>
  <SectionNavigator sections={[{id:'report-summary',label:'结论'},{id:'report-design',label:'设计思路'},{id:'layer-contribution',label:'乘区贡献'},{id:'card-comparisons',label:'卡牌差异'},{id:'strategy-table',label:'拿牌策略'},{id:'terminal-overview',label:'终局总表'},{id:'catalog-table',label:'90 卡索引'},{id:'terminal-card',label:'终止遭遇单卡'}]}/>
  {visible('report-summary')&&<ReportSection id="report-summary" title="测试结论" queryId="report_meta" sourceRows={rows('report_meta')} showHeading={false}>
   <Narrative id="v070:summary" value={conclusion}/>
   {!ready&&<Pending>正式结果尚未到位，以下测量区暂留空。90 卡设计表可以立即查询。</Pending>}
   {state.validation?.warnings?.length>0&&<details className="v070-disclosure"><summary>本批覆盖与解释限制（{state.validation.warnings.length}）</summary><ul>{state.validation.warnings.map((warning,index)=><li key={index}>{warning}</li>)}</ul></details>}
   {state.validation?.errors?.length>0&&<details className="v070-disclosure"><summary>数据需要修正的问题（{state.validation.errors.length}）</summary><ul>{state.validation.errors.map((error,index)=><li key={index}>{error}</li>)}</ul></details>}
  </ReportSection>}
  {visible('report-design')&&<ReportSection id="report-design" title="设计思路" queryId="catalog" sourceRows={catalog} showHeading={false}>
   <Narrative id="v070:design" value={design}/>
   <div className="v070-design-facts" data-reviewed-rows>{Object.entries(roleNames).map(([key,label])=><span key={key}>{label}<strong>{catalog.filter(c=>c.role===key).length}</strong></span>)}</div>
   <Narrative id="v070:space-note" value={`当前 ${state.spatialDesign?.spatial??'—'}/${state.spatialDesign?.n??catalog.length} 张卡具有显式空间条件或目标。${auditedEffects.length?`按额外技能条目计，为 ${spatialEffects}/${auditedEffects.length} 条；基础普攻不计入这一口径。`:''}这是设计结构检查，实际位置价值要看下方干预数据。`}/>
  </ReportSection>}
  <section className="v070-section" aria-label="乘区与职能">
   <Narrative id="v070:layers-intro" value="## 哪些职能和乘区实际带来收益\n\n同一状态逐项关闭来源，观察有效伤害、净承伤、成长与资源变化。已有永久成长是将全编队预置 0 / 2 / 6 成长与清零对照的受控效果，不能称为自然终局平均；本回合新增培养另列。各项存在交互，边际贡献不能相加成总分。"/>
   {visible('layer-contribution')&&<DataComponent id="layer-contribution" queryId="layers" title="同状态关闭后的边际贡献" kind="custom" sourceRows={layers} displayRows={layers}>
    {allLayers.length>0&&<div className="v070-local-controls"><Dropdown label="来源" showLabel value={layerFamily} choices={['program','synergy']} choiceLabels={{program:'角色职能与成长',synergy:'正式羁绊'}} onChange={setLayerFamily}/><Dropdown label="观察指标" showLabel value={layerMetric} choices={['damageDecrease','hpProtection','growthReduced','coinsGenerated']} choiceLabels={layerMetricNames} onChange={setLayerMetric}/></div>}
    {layers.length?<EvidenceChart id="layer-bars" queryId="layers" title={`${layerMetricNames[layerMetric]} · 配对均值`} spec={{type:'horizontalBar',x:'chartLabel',y:'value',stackable:false,valueDecimals:2,legend:{labels:{value:layerMetricNames[layerMetric]}}}} rows={layers} sourceRows={layers} height={Math.max(300,layers.length*34)}/>:<Pending/>}
   </DataComponent>}
   {layerFamily==='synergy'&&<Narrative id="v070:synergy-scope" value="本面板只观察一次转动，且当前受益者为永久实例。记忆羁绊需要临时受益者，公司羁绊的入关效果也不在本次动作内；这里的零表示适用场景未覆盖。其他羁绊也可能贡献金币等资源，不能仅凭零伤害判为无用。"/>}
   {visible('layer-table')&&<DataComponent id="layer-table" queryId="layers" title="边际贡献与 95% 区间" kind="table" sourceRows={layers} displayRows={layerDisplay}>
    {layers.length?<DataTable rows={layerDisplay} searchable={false} columns={[{field:'label',label:'关闭来源'},{field:'damageInterval',label:'有效伤害减少'},{field:'protectionInterval',label:'净生命保护减少'},{field:'growthInterval',label:'成长减少'},{field:'coinsInterval',label:'信用点减少'},{field:'n',label:'布局组数'}]} label="乘区边际贡献和区间"/>:<Pending/>}
   </DataComponent>}
  </section>
  <section className="v070-section" aria-label="角色差异">
   <Narrative id="v070:comparisons-intro" value="## 同层分量有哪些差异，需要怎样解释\n\n只在同职责、同稀有度内比较。通用队友用于预设实践范围判定，适配队友仅描述组合潜力；区间过宽和参考不足分别保留。辅助者直接伤害为零，不构成弱卡证据。相对差用观测同层均值作为显示单位，描述区间不是比值置信区间；正式判定另按校正线性边界计算。"/>
   {visible('card-comparisons')&&<DataComponent id="card-comparisons" queryId="comparisons" title="同层分量差异与不足" kind="table" sourceRows={comparisons} displayRows={compareDisplay}>
    <div className="v070-local-controls">{roleControl}{backgroundControl}{allComparisons.length?<Dropdown label="判定" showLabel allLabel="全部判定" value={comparisonStatus} choices={['all',...unique(allComparisons.map(row=>row.status))]} choiceLabels={{all:'全部判定',equivalent:'等价范围内',outside:'超出实践范围',insufficient:'区间不足','reference-insufficient':'参考不足','potential-description':'仅潜力描述'}} onChange={setComparisonStatus}/>:null}</div>
    {comparisons.length?<DataTable rows={compareDisplay} rowKey="key" onRowSelect={row=>setSelectedId(row.focusId)} rowActionLabel={row=>`查看${row.name}的技能与阶段`} columns={[{field:'name',label:'角色'},{field:'roleLabel',label:'职责'},{field:'rarityLabel',label:'稀有度'},{field:'measureLabel',label:'比较指标'},{field:'relativeDifference',label:'相对同层参考差 / 95%区间'},{field:'statusLabel',label:'判定',renderCell:value=><Status label={value}/>},{field:'reference',label:'同层参考均值'},{field:'units',label:'布局组数'}]} label="同职责同稀有度角色比较"/>:<Pending>{allComparisons.length?'此筛选没有可比结果，可换职责或判定查看。':'卡牌实践比较尚未提供。'}</Pending>}
   </DataComponent>}
   {visible('card-overview')&&<DataComponent id="card-overview" queryId="overview" title="单卡技能的实际职责收益" kind="table" sourceRows={cardOverview} displayRows={overviewDisplay}>
    {overviewDisplay.length?<DataTable rows={overviewDisplay} rowKey="key" onRowSelect={row=>setSelectedId(row.focusId)} rowActionLabel={row=>`查看${row.name}详情`} columns={[{field:'name',label:'角色'},{field:'roleLabel',label:'职责'},{field:'skillDamage',label:'队伍伤害增量 / 95%区间'},{field:'protection',label:'净生命保护增量 / 95%区间'},{field:'growth',label:'成长增量 / 95%区间'},{field:'nonzeroRate',label:'非零收益率',presentation:'percent'},{field:'n',label:'布局组数'}]} label="各职责收益不合并排名"/>:<Pending/>}
   </DataComponent>}
  </section>
  <section className="v070-section" aria-label="标签策略对局">
   <Narrative id="v070:strategy-intro" value="## 标签组合拿牌，能否形成多种可行选择\n\n内部策略只改变公开奖励中的拿牌偏好，不加战斗奖励。相同难度的策略共享对局种子；胜率区间和相对基础 AI 的配对差同时显示。难度 20 单列观察，不能与难度 10 混算。"/>
   {visible('strategy-table')&&<DataComponent id="strategy-table" queryId="campaigns" title="完整对局胜率与 95% 区间" kind="table" sourceRows={campaigns} displayRows={strategyDisplay} headerControls={difficultyControl}>
    {campaigns.length?<DataTable rows={strategyDisplay} rowKey="key" columns={[{field:'name',label:'拿牌偏好'},{field:'result',label:'胜 / 局'},{field:'winInterval',label:'胜率 / Wilson 95%区间'},{field:'pairedDifference',label:'相对基础 AI 差 / 配对95%区间'},{field:'statusLabel',label:'实践判定',renderCell:value=><Status label={value}/>},{field:'deathHp',label:'生命失败'},{field:'deathDeadline',label:'期限失败'}]} label="各标签拿牌策略的完整对局结果"/>:<Pending/>}
   </DataComponent>}
   {visible('campaign-stages')&&<DataComponent id="campaign-stages" queryId="campaign_stages" title="阶段能力同时看全体与到达者" kind="custom" sourceRows={phaseRows} displayRows={phaseRows} headerControls={strategies.length?<Dropdown label="拿牌策略" showLabel value={strategy} choices={strategies} choiceLabels={Object.fromEntries(campaigns.map(row=>[row.id,row.name]))} onChange={setStrategy}/>:null}>
    {phaseRows.length?<EvidenceChart id="stage-lines" queryId="campaign_stages" title="每局阶段平均有效伤害" spec={lineSpec} rows={phaseRows} sourceRows={phaseRows} height={310}/>:<Pending/>}
   </DataComponent>}
  </section>
  <section className="v070-section" aria-label="自然终止遭遇90卡总表">
   <Narrative id="v070:terminal-overview-intro" value="## 终局单卡平均输出，一张表看全 90 卡\n\n按相同难度、胜败和曝光口径比较，四项数值均显示**均值 [95% 区间]**，可搜索角色或职责，点行联动技能与单卡终局细节。支援增伤通常归到受益攻击者，防御、培养和干扰也各有职责，不能按直接伤害给所有卡排强弱。\n\n终止遭遇是每局最后实际战斗的楼层，并非固定第 12 层；自然输出受星级、奇物、队友和到达楼层影响，胜败切片不是因果效果。记录成长为每实例回合快照，当轮离队保留最后记录，不是结算后所有永久牌的成长库存。"/>
   {visible('terminal-overview')&&<DataComponent id="terminal-overview" queryId="terminal" title="90 卡终止遭遇产出总表" kind="table" sourceRows={terminalCohortRows} displayRows={terminalOverviewDisplay}>
    {allTerminal.length>0&&<div className="v070-local-controls">{terminalControls}</div>}
    {terminalOverviewDisplay.length?<DataTable rows={terminalOverviewDisplay} rowKey="focusId" selectedRowKey={selected?.id} onRowSelect={row=>setSelectedId(row.focusId)} rowActionLabel={row=>`查看${row.name}的终局与技能详情`} columns={[{field:'name',label:'角色'},{field:'roleLabel',label:'职责'},...['damage','healing','shieldGenerated','growthLevel'].map(metric=>({field:`${metric}Mean`,label:{damage:'直接伤害',healing:'治疗',shieldGenerated:'护盾生成',growthLevel:'记录成长'}[metric],renderCell:(_value,row)=>terminalReading(row[terminalBasis]?.[metric])})),{field:'effectiveSeeds',label:'有效种子组',renderCell:fmt},{field:'presentInstanceTurns',label:'登场实例回合',renderCell:fmt},{field:'heldInstanceTurns',label:'持有实例回合',renderCell:fmt}]} label="全部角色终止遭遇的均值与95%区间"/>:<Pending>90 卡终止遭遇产出总表尚无有效数据；未测不会记成零。</Pending>}
   </DataComponent>}
  </section>
  <section className="v070-section" aria-label="角色索引与阶段详情">
   <Narrative id="v070:catalog-intro" value="## 90 张卡，按职责和技能查询\n\n无需逐一阅读才能看懂结论。需要核对某张卡时，在这里搜索名称、公开标签或技能，选中后查看数值与测量切片。"/>
   {visible('catalog-table')&&<DataComponent id="catalog-table" queryId="catalog" title="角色规则索引" kind="table" sourceRows={roleRows} displayRows={roleRows} headerControls={roleControl}>
    <DataTable rows={roleRows} rowKey="id" selectedRowKey={selected?.id} onRowSelect={row=>setSelectedId(row.id)} rowActionLabel={row=>`查看${row.name}具体规则与测量`} columns={[{field:'name',label:'角色'},{field:'roleLabel',label:'职责'},{field:'path',label:'命途'},{field:'element',label:'属性'},{field:'faction',label:'阵营'},{field:'description',label:'技能'}]} label="全部当前角色可搜索实际规则"/>
   </DataComponent>}
   {selected&&visible('selected-card')&&<DataComponent id="selected-card" queryId="catalog" queryIds={['catalog','overview','card_details','growth']} sourceRowsByQuery={{catalog:[selected],overview:selectedOverview?[selectedOverview]:[],card_details:details,growth:future}} displayRows={detailDisplay} title={`${selected.name} · 技能与阶段`} kind="custom" headerControls={<Dropdown label="角色" showLabel value={selected.id} choices={catalog.map(c=>c.id)} choiceLabels={Object.fromEntries(catalog.map(c=>[c.id,c.name]))} onChange={setSelectedId}/>}>
    <div className="v070-card-identity" data-reviewed-rows><span>{selected.roleLabel}</span><span>{selected.rarityLabel}</span><span>{selected.path} · {selected.element} · {selected.faction}</span><strong>{selected.role==='attack'?`${selected.attackLabel} · 1星基础威力 ${Number.isFinite(selected.power)?fmt(selected.power):'未记录'}`:'不进行普通攻击'}</strong></div>
    <Narrative id={`v070:card:${selected.id}`} value={selected.description}/>
    <details className="v070-disclosure"><summary>逐条触发与精确数值</summary><div data-reviewed-rows>{(selected.effects||[]).map((effect,index)=><div className="v070-rule" key={index}><strong>{effect.summary}</strong><dl><div><dt>类型 / 基础值</dt><dd>{effectTypeNames[effect.type]||effect.type} / {effect.value}</dd></div><div><dt>触发 / 周期</dt><dd>{triggerNames[effect.trigger]||effect.trigger}{effect.every?` · 每 ${effect.every} 次`:''}</dd></div><div><dt>范围 / 限额</dt><dd>{targetNames[effect.target]||effect.target}{effect.targetLimit?` · 至多 ${effect.targetLimit} 人`:''}{effect.selection==='strongest'?' · 范围内最强':''}</dd></div>{effect.scaleWithStars&&<div><dt>星级影响</dt><dd>{effect.starFactors?'1 / 2 / 3 星按 1 / 1.5 / 2 倍发放':'基础数值按 1 / 3 / 9 倍'}</dd></div>}{effect.scaleWithTraining&&<div><dt>培养影响</dt><dd>支援每点 +8%，最多计 12 点；倍率只放大增益或减伤部分</dd></div>}</dl><details><summary>规则记录（复核用）</summary><pre>{JSON.stringify(effect,null,2)}</pre></details></div>)}</div></details>
    <div className="v070-local-controls">{backgroundControl}{details.length?<><Dropdown label="阶段" showLabel allLabel="全部阶段" value={stage} choices={['all',...unique(rows('card_details').map(r=>r.stage))]} choiceLabels={stageNames} onChange={setStage}/><Dropdown label="敌阵" showLabel allLabel="全部敌阵" value={enemy} choices={['all',...unique(rows('card_details').map(r=>r.enemy))]} choiceLabels={enemyNames} onChange={setEnemy}/></>:null}</div>
    {details.length?<DataTable rows={detailDisplay} rowKey="key" searchable={false} columns={[{field:'stageLabel',label:'阶段'},{field:'enemyLabel',label:'敌阵'},{field:'damage',label:'技能伤害增量 / 95%区间'},{field:'protection',label:'净生命保护 / 95%区间'},{field:'growth',label:'本轮成长 / 95%区间'},{field:'position',label:'位置扰动幅度 / 95%区间'},{field:'n',label:'布局组数'}]} label={`${selected.name}各阶段与敌阵`}/>:<Pending>这张卡的当前筛选尚无有效测量，技能定义不等于已验证收益。</Pending>}
    {details.length>0&&<details className="v070-disclosure"><summary>查看治疗、护盾生成、抵伤与剩盾分量</summary><Narrative id="v070:defense-components" value="生成护盾但本轮未抵伤，会留在剩余护盾中；这与真实保护为零不是同一含义。治疗也可能改变低血条件，从而同时减少某些攻击技能的伤害，需要结合敌阵解释。"/><DataTable rows={detailDisplay} rowKey="key" searchable={false} columns={[{field:'stageLabel',label:'阶段'},{field:'enemyLabel',label:'敌阵'},{field:'healing',label:'治疗增量 / 95%区间'},{field:'shieldGenerated',label:'盾生成增量 / 95%区间'},{field:'shieldBlocked',label:'盾抵伤增量 / 95%区间'},{field:'shieldRemaining',label:'剩余盾增量 / 95%区间'}]} label="治疗护盾分量与净保护的差异"/></details>}
   </DataComponent>}
   {visible('terminal-card')&&<DataComponent id="terminal-card" queryId="terminal" queryIds={['terminal','terminal12']} sourceRowsByQuery={{terminal:terminalRows,terminal12:terminal12Rows}} title={`${selected?.name||'角色'}在自然终止遭遇中的实际产出`} kind="custom" displayRows={terminalRows}>
    {allTerminal.length>0&&<div className="v070-local-controls">{terminalControls}</div>}
    <Narrative id="v070:terminal-scope" value="这里取每局**最后实际战斗的遭遇**，可以在任一楼层结束，并非只看第 12 层。伤害只计角色普通攻击和角色追击，独立奇物与羁绊伤害不归到该卡；自然输出仍受星级、奇物、队友和实际到达楼层影响，胜败切片不是技能或成长的因果效果。记录包含正式、临时和见习实例。成长水平是每实例回合的记录快照，不是本轮发放量；当轮离队实例沿用最后记录，因此也不是结算后所有永久牌的成长库存。"/>
    {terminalRow?<>
     <div className="v070-terminal-metrics" data-reviewed-rows>{Object.entries(terminalMetricNames).map(([metric,label])=><div key={metric}><span>{label}</span><strong>{terminalReading(terminalValues[metric])}</strong><small>{terminalValues[metric]?.n>0?`${terminalValues[metric].n} 个有效种子组 · 均值 [95%区间]`:'该口径没有可估计的曝光样本'}</small>{Number.isFinite(terminalPooled?.[metric])&&<small>总量比（描述）：{fmt(terminalPooled[metric])}</small>}</div>)}</div>
     <div className="v070-terminal-exposure" data-reviewed-rows>{[['持有对局','heldCampaigns'],['实际出场对局','appearedCampaigns'],['持有种子组','heldSeeds'],['出场种子组','appearedSeeds'],['持有实例回合','heldInstanceTurns'],['出场实例回合','presentInstanceTurns']].map(([label,field])=><span key={field}>{label}<strong>{fmt(terminalRow[field])}</strong></span>)}</div>
     <Narrative id="v070:terminal-units" value="展示种子组平均与区间：同一种子的多策略先合并分子和分母，再估计产出率。总量比是全部产出除以全部曝光的描述值，与种子组平均不是同一个口径。辅助增伤通常记在受益攻击者名下，因此支援直接伤害为零不能据此判弱。本页不把效果日志有无当成实际收益触发率；例如易伤声明也可能没有实际受益者。"/>
     <details className="v070-disclosure"><summary>此结果组的终止层分布与样本范围</summary><div className="v070-terminal-floors" data-reviewed-rows><p>{outcomeNames[terminalOutcome]} · 此结果组共 {fmt(terminalRow.campaigns)} 场对局，{fmt(terminalRow.seeds)} 个种子组</p><div>{Object.entries(terminalRow.terminalFloors||{}).sort(([a],[b])=>Number(a)-Number(b)).map(([floor,count])=><span key={floor}>第 {floor} 层：{fmt(count)} 局</span>)}</div></div></details>
     {terminal12Row&&<details className="v070-disclosure"><summary>补充：第 12 层产出，未到达或未持有计零</summary><Narrative id="v070:terminal-final12" value="此处使用该胜败组的全部对局作分母，包含未抵达第 12 层和未持有角色的零；不能与上方有曝光条件的每登场均值混用。"/><div data-reviewed-rows><p>{fmt(terminal12Row.reachedCampaigns)} / {fmt(terminal12Row.campaigns)} 场实际抵达第 12 层 · {fmt(terminal12Row.seeds)} 个种子组</p><dl className="v070-terminal-final12">{['damage','healing','shieldGenerated'].map(metric=><div key={metric}><dt>{terminalMetricNames[metric]}</dt><dd>{terminalReading(terminal12Row.perCampaignAllSeeds?.[metric])}</dd></div>)}</dl></div></details>}
    </>:<Pending>自然终止遭遇的单卡输出、治疗、护盾和记录成长水平尚无有效数据；未测不会记成零。</Pending>}
   </DataComponent>}
   {visible('natural-card-growth')&&<DataComponent id="natural-card-growth" queryId="coverage" title={`${selected?.name||'角色'}在真实对局中的成长与出场`} kind="table" sourceRows={coverage} displayRows={coverDisplay} headerControls={difficultyControl}>
    {coverage.length?<><Narrative id="v070:coverage-units" value="持有与出场次数统计多策略对局；区间先按共享种子组合并，再估计不确定性，不把各策略当成独立种子。自然输出受星级、奇物、队友和实际到达楼层影响，不等于卡牌或成长的因果效果。成长是每实例回合的记录快照：当轮离队实例沿用最后记录，并非结算后所有永久牌的成长库存。“无非零效果日志次数”只表示本轮没有记录非零效果数值，不是技能无收益次数；反过来，记录易伤等声明也不保证存在实际受益者。真正的非零配对收益另见上方受控卡牌测量。"/><DataTable rows={coverDisplay} searchable={false} columns={[{field:'stageLabel',label:'阶段'},{field:'heldCampaigns',label:'持有对局'},{field:'appearedCampaigns',label:'出场对局'},{field:'appearances',label:'出场次数'},{field:'zeroTriggerAppearances',label:'无非零效果日志次数'},{field:'actualGrowth',label:'记录成长快照 / 95%区间'},{field:'appearanceDamage',label:'每次出场伤害 / 95%区间'},{field:'nSeeds',label:'种子组数'}]} label="实际持有出场与成长覆盖"/></>:<Pending>自然对局出场、持有和成长分布尚未提供。</Pending>}
   </DataComponent>}
   {visible('growth-curve')&&selected?.role==='trainer'&&<DataComponent id="growth-curve" queryId="growth" title={`${selected.name}的六回合培养后续`} kind="custom" sourceRows={future} displayRows={future}>
    {future.length?future.map(row=><div className="v070-future" key={row.enemy}><strong>{enemyNames[row.enemy]||row.enemy} · {row.n} 个布局组</strong><DataTable rows={(row.curve||[]).map(point=>({turn:point.turn,growth:interval(point.delta?.growth),damage:interval(point.delta?.damage),protection:interval(negate(point.delta?.hpLost))}))} searchable={false} columns={[{field:'turn',label:'回合'},{field:'growth',label:'成长增量 / 95%区间'},{field:'damage',label:'伤害增量 / 95%区间'},{field:'protection',label:'净生命保护 / 95%区间'}]} label="最多六回合真实轨迹"/></div>):<Pending>六回合培养后续轨迹尚未提供。</Pending>}
   </DataComponent>}
  </section>
  {visible('report-methods')&&<ReportSection id="report-methods" queryId="sources" queryIds={['sources','report_meta']} sourceRowsByQuery={{sources:rows('sources'),report_meta:rows('report_meta')}} title="方法、来源与复现" showHeading={false}>
   <Narrative id="v070:methods" value="## 方法和来源可查\n\n受控实验的独立单位是布局组，同组的阶段、敌阵和开关属于重复测量；对局实验的独立单位是完整种子对局。通用与适配背景分开，零收益与提前失败保留。受控敌阵中的“单目标高血靶”不带首领标签（boss:false），只测试单目标高生命情形。\n\n同层卡牌以预声明 ±35% 实践范围观察，策略相对基础 AI 的胜率差以 ±10 个百分点观察。等价结论要求经过多次查看校正的完整区间落入边界；差异不显著不能写成已平衡。\n\n通过各节的来源菜单可查看本节数据、定义、参数和输入指纹。完整方法见随版本提供的预声明测试协议；历史版本数据不用于本页当前结论。"/>
   {state.natural?.ready&&<Narrative id="v070:natural-audit-methods" value="自然成长尾部分布使用最终编队实例的每局最大成长，按声明策略的均匀混合给出 R-7 描述分位，不生成置信区间，也不把各策略重复当成独立玩家。它与离队实例保留最后记录的回合快照不同。晚期职能份额只计第 9 层起的实际登场；终止星级份额只计实际最后遭遇中的登场实例。来源链同时保留审计 JSON、原始对局文件及分析源码的指纹。"/>}
   {rows('sources').length?<DataTable rows={rows('sources')} columns={[{field:'path',label:'原始数据'},{field:'mode',label:'实验'},{field:'split',label:'分区'},{field:'rawCount',label:'原始观察数'},{field:'sha256',label:'SHA-256'}]} label="实验输入来源与摘要"/>:<Pending>当前只有候选设计数据，没有正式测量输入。</Pending>}
  </ReportSection>}
 </article>;
}
