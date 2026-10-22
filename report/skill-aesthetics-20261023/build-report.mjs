import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { termReview, userDirections as previousDirections, relationshipNotes } from './review-additions.mjs';
import { RETIREMENT_RULES } from '../../src/retirements.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const snapshot = JSON.parse(fs.readFileSync(path.join(dir, 'current-skills.json'), 'utf8'));
const sourceRoot = path.resolve(dir, '../..');
const workspaceVersion = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'package.json'), 'utf8')).version;
const reviews = ['review-01-30.json', 'review-31-60.json', 'review-61-90.json'].flatMap(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
const model = JSON.parse(fs.readFileSync(path.join(dir, 'terminology-model.json'), 'utf8'));
const combatModel = JSON.parse(fs.readFileSync(path.join(dir, 'combat-model.json'), 'utf8'));
const combatCharacters = JSON.parse(fs.readFileSync(path.join(dir, 'combat-per-character.json'), 'utf8'));
const cardAttributes = JSON.parse(fs.readFileSync(path.join(dir, 'card-attributes.json'), 'utf8'));
const cardsById = new Map(cardAttributes.map(row=>[row.id,row]));
if(cardAttributes.length!==90 || cardsById.size!==90) throw new Error('卡面属性必须覆盖90人');
const equipment = JSON.parse(fs.readFileSync(path.join(dir, 'combat-equipment.json'), 'utf8'));
const combatById = new Map(combatCharacters.map(row => [row.id, row]));
if (combatCharacters.length !== 90 || combatById.size !== 90) throw new Error('新战斗方案必须覆盖90个不同角色');
const userDirections = {
  ...previousDirections,
  title:'卡面固有属性与技能正文分离：第四轮补充',
  confirmed:[...previousDirections.confirmed.map(s=>s.replaceAll('威力、倍率','攻击力、技能倍率')), ...combatModel.confirmed],
  notYetDecided:[...combatModel.pending, '创建衣匠的攻击力、标签、合成后删除技能及创建上限仍需单独确定。', '互动关系不等于恋爱关系，也不能自动推出召唤另一名人物的能力。'],
  superseded:'上一轮“导师只给攻击角色增加威力”的讨论基线已被本轮全角色攻击力模型替代。历史草案保留供对照。'
};
const lore = ['lore-01-45.json', 'lore-46-90.json'].flatMap(file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
if (lore.length !== 90 || new Set(lore.map(r => r.id)).size !== 90) throw new Error('剧情复核必须覆盖90个不同角色');
const loreById = new Map(lore.map(row => [row.id, row]));
const byId = new Map(reviews.map(row => [row.id, row]));
if (reviews.length !== 90 || byId.size !== 90) throw new Error('评审必须恰好覆盖90个不同角色');
const required = ['id', 'elegance', 'clarity', 'verdict', 'identity', 'critique', 'copy', 'proposal', 'changeKind', 'caution'];
const rows = snapshot.characters.map((c, index) => {
  const review = byId.get(c.id);
  if (!review || required.some(key => review[key] === undefined || review[key] === '')) throw new Error(`缺少评审字段: ${c.name}`);
  if (![review.elegance, review.clarity].every(n => Number.isInteger(n) && n >= 1 && n <= 5)) throw new Error(`评分无效: ${c.name}`);
  if (!loreById.has(c.id)) throw new Error(`缺少剧情复核: ${c.name}`);
  if (!combatById.has(c.id)) throw new Error(`缺少战斗方案: ${c.name}`);
  const combat = combatById.get(c.id);
  let skillCopy = combat.combatCopy.replace(/^常规攻击[^。]+。\s*/, '');
  if(skillCopy===combat.combatCopy || !skillCopy) throw new Error(`未能分离卡面属性: ${c.name}`);
  skillCopy = skillCopy.replace(/攻击力最高（计星级及已有本局永久固定加值，不计本次转动增益）/g,'本次转动增益生效前攻击力最高');
  if(c.id==='1402') skillCopy=skillCopy.split('衣匠自身技能：')[0].trim();
  const card = cardsById.get(c.id);
  if(!card || card.name!==c.name) throw new Error(`卡面身份不匹配: ${c.name}`);
  return { index: index + 1, ...c, ...review, copyBasis: review.copyBasis || '等义润色', mismatch: Boolean(review.mismatch), ...termReview(c, review), ...loreById.get(c.id), ...combat, skillCopy, cardAttributes:card };
});

const sources = [
  {title:'《炉石传说》开发者谈职业特色', author:'Blizzard · 2019-06-24', url:'https://hearthstone.blizzard.com/en-us/news/23014810/developer-insights-class-identity-hall-of-fame-and-new-cards', idea:'特色来自玩法意象、擅长的事与做不到的事。借用到本作：一张卡应有一个可复述的核心，副能力应服务这个核心。'},
  {title:'Lenticular Design', author:'Mark Rosewater · Wizards of the Coast · 2014-12-15', url:'https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15', idea:'表面容易理解，熟悉系统后发现更多策略。借用到本作：把深度放在拿牌、编队规模和资源取舍里，减少逐卡背诵的例外。'},
  {title:'New World Order', author:'Mark Rosewater · Wizards of the Coast · 2011-12-05', url:'https://magic.wizards.com/en/news/making-magic/new-world-order-2011-12-05', idea:'阅读复杂度、棋盘复杂度和策略复杂度不同。借用到本作：文字短不代表易读，若每轮仍需追踪多套范围和计数，就没有真正减负。'},
  {title:'Behind the Design: MARVEL SNAP', author:'Apple Developer · Ben Brode 团队访谈', url:'https://developer.apple.com/news/?id=sosm2p7q', idea:'Ben Brode强调为引入的复杂度争取更多深度。本文据此评估“条件成本是否换来有趣选择”，不是用字数决定好坏。'},
  {title:'《炉石传说》特效如何传达规则', author:'Blizzard · 2018-10-26', url:'https://hearthstone.blizzard.com/en-us/news/22552047/developer-insights-the-art-behind-the-science', idea:'特效帮助读懂棋盘、理解事件并强化特色。借用到本作：周期进度、触发原因和实际受益者应能追溯。'}
];
const methodology = {
  definition:'优雅，是用少量、统一、可预期的规则，产生鲜明体验和足够多的有意义选择。',
  conclusion:'默认攻击方式、默认攻击倍率和基础攻击力独立写在卡面；90人的技能正文只描述特殊条件与效果。固有属性可以通过升星或明确的辅助技能提升。辅助倍率逐角色提出起测候选，20%、25%不构成共同范围或固定档位；具体参数未完成平衡验证，仍只供评审。',
  principles:[
    ['一个核心','能用一句话讲出“这张卡有趣在哪里”；两个效果可以并存，但应相互解释。'],
    ['复杂度换深度','条件应影响拿牌、留牌或资源取舍。只降低随机触发率的门槛，其审美价值需要说明。'],
    ['少算、好预期','读完能判断大致做什么；空间、标签、周期和阈值不要毫无关联地叠满。'],
    ['词义稳定','攻击力、技能倍率、造成伤害提高与敌方受到伤害提高各有固定含义；追加攻击统一命名，范围与计数不混用。'],
    ['有特色也有边界','保留专长、代价和少量全场大招；不为每名角色附送经济、永久加值和防御。'],
    ['称谓与剧情一致','所有出场者统一称角色；创建对象和协作应有能力或故事依据，不能只为补机制随意拉来另一名人物。']
  ],
  issues:[
    ['先处理语义分歧','“每人一次追击”与“按人数合并的一次伤害”对装甲并不等价；连续比例与每满一个阈值也应区分。先确认设计原意，再改文案或规则。'],
    ['让副能力服务主能力','若主能力是授业，角落周期发信用点需要解释它如何服务授业；否则更像补偿条款。删副业是待测提案，不是免费优化。'],
    ['减少互不相关的门槛','标签配合是构筑入口，空间是转轮特色，两者可以共存；再叠角落、周期、人数、血线时，要问每层是否带来新的取舍。'],
    ['从卡组层面补辨识度','多张卡只更换属性、阵营和系数时，单卡都能读懂，整个卡池仍难记。未来可围绕护盾储备、受伤投资、定向授业等体验分工；不必90人90个新关键词。'],
    ['把节奏做成可见信息','棋盘由系统随机分配，不能把空间门槛当成玩家自由摆位的战术。可先展示本实例登场进度和上次未触发原因，再评估是否删掉随机门槛。']
  ],
  limits:[
    '评审对象为0.7.0工作区的全部90个CHARACTERS身份条目，包含变体与已收录的预告身份；不等于星铁官方现行实装名单。',
    '当前技能逐字保留src/content.js的description；effects、effect-rules.js与engine.js用于核对语义。基础文案数值不代替星级、职能培养、上限或敌方条款后的结算值。',
    '1—5分是设计判断的讨论量尺：1根本不清、2负担明显、3可用但可优化、4清楚且有特色、5简明并有深度。不是强度、胜率或已平衡证明；不同评审的边界分数不宜过度解读。',
    '文案草案尽量保留现有参数；标记“需先确认语义”或“按当前实现澄清”的条目不是无争议的等义改写。所有机制候选都未采纳，实施前仍需功能、单卡、拿牌策略、职能乘区、成长与阶段实测。',
    `本评审仅新增独立报告文件；制作期间工作区有并行的${workspaceVersion}动效工作。本报告锁定0.7.0技能快照，与当前90个角色定义完全一致，不包含对并行改动的验收或发布。`,
    '本报告没有开展新的平衡试验。桌面和窄屏浏览器检查仅验证报告布局，不是移动端实机兼容验收。'
  ],
  glossary:[
    ['相邻','5×4棋盘的八邻，包含斜角；同行/同列是另外的作用范围。位置每次转动随机生成。'],
    ['每第N次登场','按该实例累计实际登场数，在N、2N、3N…次检查；当次位置条件不满足不会顺延，也不是累计成功N次。'],
    ['本轮 / 本次','文案统一建议写“本次转动”，仅覆盖相同有效期；本局永久属性提升与当次增益分开。'],
    ['三个独立增幅区','攻击力提高影响以攻击力为基准的攻击、治疗和护盾；造成伤害提高作用于角色伤害；敌方受到伤害提高作用于指定敌人。候选采用同区相加、跨区相乘。'],
    ['统一称角色','撤回首轮草案中的“可受培养伙伴”等压缩术语。当前原文保留以供对照；本轮新草案不再使用伙伴、成长或临时角色作为规则名。'],
    ['永久 / 本次转动','“攻击力永久增加0.35（本局）”跨转动保留；“本次转动攻击力增加0.35”在本次结算后失效。永久绑定具体角色，不代表跨新局保留。'],
    ['卡面属性与技能分开','默认攻击方式、默认攻击倍率、基础攻击力写在卡面。默认倍率是最终倍率，不再乘一次攻击方式倍率；技能只写特殊触发与效果。辅助倍率逐角色设计，无统一区间。'],
    ['固有属性可以提升','当前星级基础值、本局永久增加、本次转动增益分别记录。升星与辅助可以明确改变攻击力或默认倍率；默认倍率的提升不自动强化治疗、护盾或追加攻击倍率。'],
    ['追加攻击','每次追加攻击有来源角色、目标、独立技能倍率与明确触发时点，统一接受追加攻击增幅；不再借用普通攻击的最终伤害。追加攻击增伤属于造成伤害提高区的限定子项。'],
    ['随机空间的价值','它能产生构筑概率与编队规模取舍，但不能自动等同于可主动操作的摆位深度。']
  ]
};

const currentContent = await import(path.join(sourceRoot, 'src/content.js'));
if (JSON.stringify(currentContent.CHARACTERS) !== JSON.stringify(snapshot.characters)) throw new Error('当前技能定义已偏离快照，需重新评审');
const relationships = RETIREMENT_RULES.map(rule => ({id:rule.id, sourceName:rule.sourceName, targetName:rule.targetName, relation:rule.relation, source:rule.source, assessment:relationshipNotes[rule.id], evidenceBoundary:'现有项目关系来源线索；关系存在与本作委派/删除/奖励的叙事合理性分开判断。'}));
const payload = { ...snapshot, revision:'卡面固有属性与技能分离', workspaceVersionAtBuild: workspaceVersion, characters: undefined, rows, sources, methodology, model, userDirections, relationships, combatModel, equipment };
fs.writeFileSync(path.join(dir, 'review-data.json'), JSON.stringify(payload, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'terminology-per-character.json'), JSON.stringify(rows.map(r=>({id:r.id,name:r.name,termCopy:r.termCopy,termStatus:r.termStatus,termNote:r.termNote,termRuleChange:r.termRuleChange,createdCharacter:r.createdCharacter})),null,2)+'\n');
fs.writeFileSync(path.join(dir,'user-directions.json'),JSON.stringify(userDirections,null,2)+'\n');
fs.writeFileSync(path.join(dir,'relationship-audit.json'),JSON.stringify(relationships,null,2)+'\n');
const safeJson = JSON.stringify(payload).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const template = fs.readFileSync(path.join(dir, 'report-template.html'), 'utf8');
fs.writeFileSync(path.join(dir, 'index.html'), template.replace('/*__REVIEW_DATA__*/null', safeJson));

const escapeCell = s => String(s).replaceAll('|', '\\|').replaceAll('\n', '<br>');
const modelLines = ['以下是上一轮历史分析；只给攻击角色加值的建议已被全角色攻击力模型替代。', model.summary.conclusion, '', '| 当前属性 | 旧点数0 | 旧点数0.35 | 旧点数12 |', '| --- | --- | --- | --- |', ...model.exampleRows.map(r=>`| ${r.attribute} | ${r.zero} | ${r.point035} | ${r.point12} |`), '', '一星且无其他修正；护盾基础3、威力增幅基础50%。这些是当前公式算例，不是新数值。', '', '### 推荐起点（未采纳）', '', model.recommendedBaseline.assessment, '', ...model.recommendedBaseline.rules.map(r=>`- ${r}`), '', '### 创建角色与删除', '', ...model.creationRules.map(r=>`- ${r.proposal}`)];
const combatLines = [combatModel.summary, '', '### 卡面属性与技能分别展示', '', ...combatModel.cardFace.layers.map(r=>`- **${r.title}**：${r.detail}`), '', ...combatModel.cardFace.templates.map(r=>`- **${r.title}**：${r.detail}`), '', ...combatModel.formulas.flatMap(f=>[`### ${f.name}`, '', f.formula, '', f.explanation, '']), ...combatModel.rules.map(r=>`- **${r.title}**：${r.detail}`), '', '### 追加攻击事件', '', ...combatModel.followUpRules.map(r=>`- **${r.title}**：${r.detail}`), '', '### 计算示例', '', ...combatModel.examples.map(r=>`- **${r.title}**：${r.detail}`)];
const equipmentLines = ['| 仪器 | 当前状态 | 点评 | 候选建议 |', '| --- | --- | --- | --- |', ...equipment.rows.map(r=>`| ${escapeCell(r.name)} | ${escapeCell(r.current)} | ${escapeCell(r.critique)} | ${escapeCell(r.proposal)}<br>${escapeCell(r.changeKind)} |`)];
const md = [`# 星穹转轮 · 全角色技能设计评审（卡面属性与技能）`, ``, `日期：${snapshot.date}；技能快照：${snapshot.version}；源码提交：${snapshot.commit}。`, ``, methodology.definition, ``, methodology.conclusion, ``, `## 用户补充方向`, ``, ...userDirections.confirmed.map(s=>`- ${s}`), ``, `### 尚未确定的具体设计`, ``, ...userDirections.notYetDecided.map(s=>`- ${s}`), ``, `## 攻击力、技能倍率与独立增幅`, ``, ...combatLines, ``, `## 仪器改造建议`, ``, ...equipmentLines, ``, '### 术语参考与支持范围', '', ...equipment.sources.map(s=>`- [${s.title}](${s.url})：${s.supports}（${s.access}）`), '', `## 上一轮属性模型（历史对照）`, ``, ...modelLines, ``, `## 评审边界`, ``, ...methodology.limits.map(s => `- ${s}`), ``, `## 标尺`, ``, ...methodology.principles.map(([a,b])=>`- **${a}**：${b}`), ``, `## 全部90个角色`, ``, `| 角色 | 当前技能状态 | 美学、术语与剧情点评 | 修改建议（未应用） |`, `| --- | --- | --- | --- |`, ...rows.map(r => `| ${escapeCell(r.name)}<br>${r.roleLabel} · ${r.path} · ${r.element}<br>ID ${r.id} | ${escapeCell(r.description)} | 首轮优雅 ${r.elegance}/5；表达 ${r.clarity}/5；${r.verdict}<br>${escapeCell(r.critique)}<br>**本轮战斗模型**：${escapeCell(r.combatNote)}<br>**剧情 · ${r.loreStatus} · ${r.loreConfidence}**：${escapeCell(r.loreComment)}<br>${r.loreSources.map(s=>`[${escapeCell(s.title)}](${s.url})（${s.kind}）：${escapeCell(s.supports)}`).join('<br>')} | **卡面属性候选**：默认攻击方式 ${escapeCell(r.cardAttributes.attackPattern)}；默认攻击倍率 ${escapeCell(r.cardAttributes.attackMultiplier.label)}；一星基础攻击力 ${escapeCell(r.cardAttributes.baseAttack.label)}<br>**属性设计理由**：${escapeCell(r.cardAttributes.attributeRationale)}<br>**技能正文候选**：${escapeCell(r.skillCopy)}${r.createdCharacter ? `<br>**衣匠自己的技能**：${escapeCell(r.createdCharacter.skill)}<br>${escapeCell(r.createdCharacter.pending.replaceAll('威力','攻击力'))}` : ''}<br>**剧情建议**：${escapeCell(r.loreProposal)}<br>**首轮机制建议（历史）**：${escapeCell(r.proposal)}<br>**核对/验证**：${escapeCell(r.caution)} |`), ``, `## 额外人物委派审查`, ``, `关系有依据，不代表当前复制、删除和属性奖励就是官方剧情。以下保留现有来源作为核查线索。`, ``, ...relationships.map(r=>`- **${r.sourceName} → ${r.targetName}**：${r.assessment} [现有关系来源](${r.source})`), ``, `## 共性问题`, ``, ...methodology.issues.map(([a,b])=>`- **${a}**：${b}`), ``, `## 术语与计数`, ``, ...methodology.glossary.map(([a,b])=>`- **${a}**：${b}`), ``, `## 参考与借用范围`, ``, `以下为理论依据；逐卡评分、批评和提案是结合本作规则的评审判断，不是这些作者对本作的评价。`, ``, ...sources.map(s=>`- [${s.title}](${s.url})（${s.author}）：${s.idea}`), ``].join('\n');
fs.writeFileSync(path.join(dir, '角色技能点评-v0.7.0-20261023.md'), md);
const manifest = {
  date: snapshot.date, version: snapshot.version, commit: snapshot.commit, count: rows.length,
  workspaceVersionAtBuild: workspaceVersion, currentCharacterDefinitionsMatchSnapshot: true,
  files: ['src/content.js','src/effect-rules.js','src/engine.js','src/app.js','docs/DESIGN.md','docs/ENGINE.md','package.json','VERSION'].map(file => ({file, snapshotCommitSha256:crypto.createHash('sha256').update(execFileSync('git', ['show', `${snapshot.commit}:${file}`], {cwd:sourceRoot})).digest('hex')})),
  reviewCounts: Object.fromEntries(['保留打磨','优先润色','建议精简','建议重构'].map(key=>[key,rows.filter(r=>r.verdict===key).length])),
  semanticReviewIds: rows.filter(r=>r.mismatch).map(r=>r.id),
  supplementaryReview:{loreCharacters:rows.length,loreReferenceCount:rows.reduce((sum,r)=>sum+r.loreSources.length,0),terminologyRuleCandidates:rows.filter(r=>r.termRuleChange).length,combatModelCharacters:rows.length,cardAttributeProfiles:rows.length,equipmentCandidates:equipment.rows.length,evidenceAccess:'官方域名与游戏文本资料包含原页读取和搜索索引核对；未逐一记录全部访问方式，不声称全部原页直读；视频账号未直接核实时在来源说明中降级。'},
  notes:'摘要指向锁定的0.7.0提交，不声称当前工作区所有文件仍匹配。制作期间有并行0.7.1动效改动；当前全部90个角色定义已与快照逐字比对一致。原文快照current-skills.json；逐卡评审见review-data.json。'
};
fs.writeFileSync(path.join(dir, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({count:rows.length,reviewCounts:manifest.reviewCounts,semanticReviewIds:manifest.semanticReviewIds,bytes:fs.statSync(path.join(dir,'index.html')).size}));
const csvColumns = ['角色','当前技能原文','首轮优雅评分','首轮表达评分','首轮美学点评','术语状态','术语点评','本轮草案','创建角色自己的技能','涉及规则重构','剧情状态','剧情置信度','剧情点评','剧情建议','剧情来源'];
const csvCell = value => '"' + (/^[=+\-@\t\r]/.test(String(value)) ? "'" : '') + String(value).replaceAll('"','""') + '"';
const csvRows = rows.map(r=>[r.name,r.description,r.elegance,r.clarity,r.critique,r.termStatus,r.termNote,r.termCopy,r.createdCharacter?.skill || '',r.termRuleChange ? '是，未采纳':'否或语义待确认',r.loreStatus,r.loreConfidence,r.loreComment,r.loreProposal,r.loreSources.map(s=>`${s.kind} ${s.title} ${s.url} ${s.supports}`).join('\n')]);
fs.writeFileSync(path.join(dir,'星穹转轮-术语与剧情复核-90角色.csv'),'\ufeff'+[csvColumns,...csvRows].map(row=>row.map(csvCell).join(',')).join('\r\n'));

const combatCsvColumns=['角色','当前技能原文','当前职能','默认攻击方式候选','一星基础攻击力候选','默认攻击倍率候选','卡面属性设计理由','技能正文候选','战斗点评','效果标签','需个体重构','首轮美学点评','剧情状态','剧情点评','剧情建议','数值验证状态'];
const combatCsvRows=rows.map(r=>[r.name,r.description,r.roleLabel,r.cardAttributes.attackPattern,r.cardAttributes.baseAttack.label,r.cardAttributes.attackMultiplier.label,r.cardAttributes.attributeRationale,r.skillCopy,r.combatNote,r.combatTags.join(' / '),r.individualRebuild?'是':'共享架构变更',r.critique,r.loreStatus,r.loreComment,r.loreProposal,r.cardAttributes.balanceStatus]);
fs.writeFileSync(path.join(dir,'星穹转轮-卡面属性与技能-90角色.csv'),'\ufeff'+[combatCsvColumns,...combatCsvRows].map(row=>row.map(csvCell).join(',')).join('\r\n'));
fs.writeFileSync(path.join(dir,'仪器改造建议.csv'),'\ufeff'+[['仪器','当前状态','点评','候选建议','改动性质'],...equipment.rows.map(r=>[r.name,r.current,r.critique,r.proposal,r.changeKind])].map(row=>row.map(csvCell).join(',')).join('\r\n'));
