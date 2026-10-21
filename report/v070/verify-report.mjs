import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const args=new Map();for(let i=2;i<process.argv.length;i+=2)args.set(process.argv[i].replace(/^--/,''),process.argv[i+1]);
const project=resolve(args.get('project-dir')||'.local/v070-report-app'),screens=resolve(args.get('screenshots')||'artifacts/v070-report-qa');
const snapshot=JSON.parse(await readFile(join(project,'src/data.json'),'utf8'));
const modulePath=process.env.PLAYWRIGHT_MODULE||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=createRequire(import.meta.url)(modulePath);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const server=createServer(async(req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname;const bytes=await readFile(join(project,'dist',file==='/'?'index.html':file));res.setHeader('Content-Type',extname(file)==='.json'?'application/json':'text/html; charset=utf-8');res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(resolveReady=>server.listen(0,'127.0.0.1',resolveReady));
const url=`http://127.0.0.1:${server.address().port}`;
await mkdir(screens,{recursive:true});const errors=[],checks=[],query=id=>snapshot.queries[id]?.rows||[];
const check=(label,condition)=>{assert.ok(condition,label);checks.push(label);};
async function fit(page,label){const info=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,content:[...document.querySelectorAll('.v070-report [data-component-id]')].map(el=>{const b=el.getBoundingClientRect();return{left:b.left,right:b.right};})}));check(label+' no horizontal overflow',info.scroll<=info.width+1&&info.content.every(b=>b.left>=-1&&b.right<=info.width+1));}
async function selectDropdown(page,scope,label,value,display){const native=scope.locator(`select[aria-label="${label}"]`);if(await native.isVisible())await native.selectOption(value);else{await scope.locator(`:is(.component-header-controls,.v070-local-controls) button[aria-label="${label}"]`).click();await page.getByRole('menuitemradio',{name:display,exact:true}).click();}}
const format=value=>Number.isFinite(value)?new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(value):'待测';
const reading=value=>value?.n>0&&Number.isFinite(value.mean)?`${format(value.mean)}${Array.isArray(value.ci)?` [${value.ci.map(format).join('，')}]`:' [区间不足]'}`:'无有效样本';
async function verifyTerminal(page,width){
 const panel=page.locator('[data-component-id="terminal-card"]'),rows=query('terminal');
 await panel.scrollIntoViewIfNeeded();
 if(!rows.length){check(width+' terminal missing data is pending',(await panel.innerText()).includes('尚无有效数据'));return;}
 const chosen=rows.find(row=>row.perAppearance?.damage?.n>0)||rows[0];
 await selectDropdown(page,page.locator('[data-component-id="selected-card"]'),'角色',chosen.focusId,chosen.name);
 const difficulties=[...new Set(rows.map(row=>String(row.difficulty)))].sort((a,b)=>Number(a)-Number(b));
 for(const difficulty of difficulties){
  await selectDropdown(page,panel,'难度',difficulty,`D${difficulty}`);
  for(const[outcome,label]of[['all','全部终局'],['victory','通关局'],['defeat','失败局']]){
   await selectDropdown(page,panel,'终局结果',outcome,label);
   const expected=rows.find(row=>String(row.difficulty)===difficulty&&row.outcome===outcome&&row.focusId===chosen.focusId);
   if(!expected){check(`${width} terminal ${difficulty}/${outcome} missing panel remains pending`,(await panel.innerText()).includes('尚无有效数据'));continue;}
   for(const[basis,basisLabel]of[['perAppearance','每实例登场'],['perHeldInstanceTurn','每持有实例回合']]){
    await selectDropdown(page,panel,'产出口径',basis,basisLabel);
    for(const[metricIndex,metric]of['damage','healing','shieldGenerated','growthLevel'].entries())check(`${width} terminal ${difficulty}/${outcome}/${basis}/${metric} matches source`,await panel.locator('.v070-terminal-metrics > div').nth(metricIndex).locator('strong').innerText()===reading(expected[basis]?.[metric]));
   }
   for(const[fieldIndex,field]of['heldCampaigns','appearedCampaigns','heldSeeds','appearedSeeds','heldInstanceTurns','presentInstanceTurns'].entries())check(`${width} terminal ${difficulty}/${outcome}/${field} exposure`,await panel.locator('.v070-terminal-exposure > span').nth(fieldIndex).locator('strong').innerText()===format(expected[field]));
   const final12=query('terminal12').find(row=>String(row.difficulty)===difficulty&&row.outcome===outcome&&row.focusId===chosen.focusId);
   if(final12){const disclosure=panel.getByText('补充：第 12 层产出，未到达或未持有计零',{exact:true});if(!(await panel.locator('.v070-terminal-final12').isVisible()))await disclosure.click();for(const[index,metric]of['damage','healing','shieldGenerated'].entries())check(`${width} final12 ${difficulty}/${outcome}/${metric} includes all campaigns`,await panel.locator('.v070-terminal-final12 dd').nth(index).innerText()===reading(final12.perCampaignAllSeeds?.[metric]));}
  }
 }
 if(width===1440){await panel.getByRole('button',{name:`${chosen.name}在自然终止遭遇中的实际产出 actions`,exact:true}).click();await page.getByRole('menuitem',{name:'View data source',exact:true}).click();await page.locator('.source-inspector').waitFor();check('terminal source definitions inspectable',(await page.locator('.source-inspector').innerText()).includes('终止遭遇指本局最后实际战斗的楼层'));await page.keyboard.press('Escape');}
 await fit(page,width+' terminal controls');await page.screenshot({path:join(screens,`terminal-${width}.png`),fullPage:false});
}
async function verifyLayers(page,width){
 if(!query('layers').length)return;
 const panel=page.locator('[data-component-id="layer-contribution"]');await panel.scrollIntoViewIfNeeded();
 const heading=await panel.locator(':scope > .component-header .component-title').boundingBox();check(width+' layer heading stays readable',heading.width>=160&&heading.height<=90);
 check(width+' program bars visibly painted',await panel.locator('.recharts-bar-rectangle path').evaluateAll(nodes=>nodes.some(node=>node.getBBox().width>0&&node.getBBox().height>0)));
 await selectDropdown(page,panel,'来源','synergy','正式羁绊');await selectDropdown(page,panel,'观察指标','coinsGenerated','信用点减少');
 check(width+' synergy scope limitations visible',(await page.locator('.v070-report').innerText()).includes('这里的零表示适用场景未覆盖'));
 const physical=query('layers').find(row=>row.id==='synergy:physical');
 if(physical?.coinsGenerated>0)check(width+' zero-damage physical resource contribution painted',await panel.locator('path[id="synergy:physical"]').evaluate(node=>node.getBBox().width>0&&node.getBBox().height>0));
 check(width+' coin component table retained',(await page.locator('[data-component-id="layer-table"]').innerText()).includes('信用点减少'));
 await fit(page,width+' layer controls');await panel.screenshot({path:join(screens,`layers-${width}.png`)});
 await selectDropdown(page,panel,'来源','program','角色职能与成长');await selectDropdown(page,panel,'观察指标','damageDecrease','有效伤害减少');
}
try{
 for(const width of[1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:980},hasTouch:width<600,reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('.v070-report h1').waitFor();check(width+' correct title',await page.locator('.v070-report h1').innerText()===snapshot.title);
  await fit(page,width+' initial');await page.screenshot({path:join(screens,`overview-${width}.png`),fullPage:false});await page.screenshot({path:join(screens,`report-${width}.png`),fullPage:true});
  const catalog=page.locator('[data-component-id="catalog-table"]');await catalog.scrollIntoViewIfNeeded();
  check(width+' initial catalog has rows',await catalog.locator('tbody tr').count()>0);
  const search=catalog.getByRole('textbox',{name:'Search data',exact:true});await search.fill('昔涟');
  check(width+' catalog search uses real rows',await catalog.locator('tbody tr').count()===1&&(await catalog.locator('tbody tr').innerText()).includes('昔涟'));
  await catalog.getByRole('button',{name:'查看昔涟具体规则与测量',exact:true}).click();check(width+' selected card changes',await page.locator('[data-component-id="selected-card"] h2').innerText()==='昔涟 · 技能与阶段');
  await search.fill('');
  if(await catalog.locator('select[aria-label="职责"]').isVisible())await catalog.locator('select[aria-label="职责"]').selectOption('defense');
  else{await catalog.locator('.component-header-controls button[aria-label="职责"]').click();await page.getByRole('menuitemradio',{name:'防御',exact:true}).click();}
  check(width+' professional filter',await catalog.locator('tbody tr').evaluateAll(rows=>rows.length>0&&rows.every(row=>row.children[1].textContent==='防御')));
  if(await catalog.locator('select[aria-label="职责"]').isVisible())await catalog.locator('select[aria-label="职责"]').selectOption('all');
  else{await catalog.locator('.component-header-controls button[aria-label="职责"]').click();await page.getByRole('menuitemradio',{name:'All',exact:true}).click();}
  check(width+' reset restores mixed roles',await catalog.locator('tbody tr').evaluateAll(rows=>new Set(rows.map(row=>row.children[1].textContent)).size>1));
  const detail=page.locator('[data-component-id="selected-card"]');await detail.scrollIntoViewIfNeeded();await detail.getByText('逐条触发与精确数值',{exact:true}).click();
  await detail.getByText('规则记录（复核用）',{exact:true}).first().click();check(width+' exact skill source visible',(await detail.locator('pre').first().innerText()).includes('growth'));
  await fit(page,width+' controls and details');await page.screenshot({path:join(screens,`card-${width}.png`),fullPage:false});
  if(query('card_details').length){check(width+' measured card slices rendered',await detail.locator('tbody tr').count()>0);await detail.getByText('查看治疗、护盾生成、抵伤与剩盾分量',{exact:true}).click();await fit(page,width+' defense components');}
  if(width===1440){await catalog.scrollIntoViewIfNeeded();await catalog.getByRole('button',{name:'角色规则索引 actions',exact:true}).click();await page.getByRole('menuitem',{name:'View data source',exact:true}).click();await page.locator('.source-inspector').waitFor();check('source inspector opens',(await page.locator('.source-inspector').innerText()).includes('90 张候选角色'));await page.screenshot({path:join(screens,'source-1440.png'),fullPage:false});await page.keyboard.press('Escape');}
  await verifyLayers(page,width);
  if(query('campaign_stages').length)check(width+' stage lines visibly painted',await page.locator('[data-component-id="stage-lines"] .recharts-line-curve').evaluateAll(nodes=>nodes.some(n=>n.getBBox().width>0&&n.getBBox().height>0)));
  if(query('campaigns').length)check(width+' strategy intervals present',(await page.locator('[data-component-id="strategy-table"]').innerText()).includes('%'));
  await verifyTerminal(page,width);
  await context.close();
 }
 if(args.has('file')){
  const context=await browser.newContext({viewport:{width:390,height:844},offline:true,serviceWorkers:'block'});const requests=[];context.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await context.route(/^https?:\/\//,r=>r.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(resolve(args.get('file'))).href);await page.locator('.v070-report h1').waitFor();
  check('offline file title',await page.locator('.v070-report h1').innerText()===snapshot.title);check('offline navigator',await page.evaluate(()=>!navigator.onLine));await verifyTerminal(page,'offline 390');await fit(page,'offline 390');check('offline file no HTTP requests',requests.length===0);await context.close();
 }
 check('no uncaught page errors',errors.length===0);console.log(JSON.stringify({checks:checks.length,errors,source:snapshot.v070.inputFile,dataReady:snapshot.v070.dataReady,chartChecks:query('layers').length?'performed':'no layer data; not claimed',campaignChecks:query('campaigns').length?'performed':'no campaign data; not claimed',terminalChecks:query('terminal').length?'source values, exposure denominators, difficulty/outcome/basis switching performed':'pending state only; no terminal result claimed'},null,2));
}finally{await browser.close();await new Promise(resolveDone=>server.close(resolveDone));}
