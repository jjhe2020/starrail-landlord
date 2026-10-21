import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '../docs/wiki');
const check = process.argv.includes('--check');
const files = [...new Set([...(await readdir(dir)).filter(x => x.endsWith('.md')), 'Home.md', 'All-Pages.md', '_Sidebar.md', '_Footer.md'])].sort();
const pageFiles = files.filter(x => !x.startsWith('_'));
const titles = new Map();
for (const f of pageFiles) titles.set(f.slice(0, -3), (await readFile(path.join(dir, f), 'utf8').catch(() => '')).match(/^# (.+)$/m)?.[1] || f.slice(0, -3));
titles.set('Home', '星穹转轮 · 机制百科');
titles.set('All-Pages', '全部页面索引');
const groups = [
 ['机制与工具', f => !/^(Card-|Relic-|Essence-|Synergy-|EnemyEffect-|Assignment-|Source-|Data-)/.test(f)],
 ['角色（90）', f => f.startsWith('Card-')], ['奇物（64）', f => f.startsWith('Relic-')],
 ['精华（32）', f => f.startsWith('Essence-')], ['羁绊（21）', f => f.startsWith('Synergy-')],
 ['敌方条款（32）', f => f.startsWith('EnemyEffect-')], ['剧情委派（10）', f => f.startsWith('Assignment-')],
 ['完整数据', f => f.startsWith('Data-')], ['冻结算法', f => f.startsWith('Source-')],
];
const pages = pageFiles.map(x => x.slice(0, -3));
const home = `# 星穹转轮 · 机制百科\n\n**当前规则：v0.7.0** · 2026-10-21 · 基线 [e5557f8](https://github.com/jjhe2020/starrail-landlord/tree/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229) · **${pages.length} 个正文与附录页面**\n\n五列转轮构筑：招募角色、随机落位、利用公开标签与空间配合，在有限转动次数内清除十二层敌阵，之后可继续无尽。本 Wiki 记录本版**实际已实现**的规则、公式、内容参数和边界，沿关键词互相引用；本作技能为改编设计。\n\n> [!TIP]\n> 第一次阅读：[单局流程](Run-Flow) → [棋盘与目标](Board-and-Targeting) → [战斗公式](Combat) → [角色图鉴](Cards)。\n> 查某个词：[术语索引](Glossary)；查某个角色、奇物或条款：[全部页面](All-Pages)。\n\n## 内容数据库\n\n| [角色](Cards) | [奇物](Relics) | [精华](Essences) | [羁绊](Synergies) | [敌方条款](Enemy-Effects) | [剧情委派](Assignments) |\n| :---: | :---: | :---: | :---: | :---: | :---: |\n| **90** 个条目 | **64** 件 | **32** 种 | **21** 种 | **32** 条 | **10** 组 |\n| 命途 · 属性 · 阵营 · 职能 | 取得 · 持有 · 周期 | 指标 · 阈值 · 解锁 | 激活 · 分档 · 登场 | 资格 · 作用 · 清除 | 主持 · 受体 · 见习 |\n\n每项均有独立页面、精确参数、实际生效解释、关联内容和固定源码出处。角色总览提供公开标签分类；相关角色互链只表示候选身份，最终仍需满足位置及实例条件。\n\n## 游戏机制\n\n| 基础与构筑 | 数值与结算 | 系统与复原 |\n| --- | --- | --- |\n| [局内流程与胜负](Run-Flow) | [威力、伤害与防御公式](Combat) | [AI 推荐、代打与训练](AI) |\n| [招募与稀有度权重](Draft-and-Rarity) | [完整结算时序与效果解释器](Effects-and-Timing) | [操作、图鉴与效果查询](Interface) |\n| [信用点、重掷、移除和补给](Economy) | [成长、职能培养与升星](Growth-and-Stars) | [存档、迁移与离线](Saves-and-Offline) |\n| [棋盘几何与目标选取](Board-and-Targeting) | [难度、敌阵与首领分期](Difficulty) | [随机与精确复原](Reproduction) |\n\n[进入完整机制百科](Mechanics) · [术语对照表](Glossary) · [完整数据快照](Data-Content) · [冻结算法清单](Source-Manifest)\n\n## 规则之间如何衔接\n\n\`\`\`mermaid\nflowchart LR\n  A[编队与公开标签] --> B[羁绊激活]\n  A --> C[随机抽取及落位]\n  C --> D[登场与空间条件]\n  B --> D\n  D --> E[培养／增幅／干扰／防御]\n  E --> F[威力、普通攻击与追加伤害]\n  F --> G[反击、退场、精华观察]\n  G --> H[胜负、奖励与下一关]\n  H --> A\n\`\`\`\n\n## 常见查阅入口\n\n- [相邻、同行同列与空位](Board-and-Targeting)：相邻包含对角；不跨行绕边；扩散根据实际主目标的相邻敌列结算。\n- [支援的培养](Growth-and-Stars)：支援不执行普攻；培养只放大明确标记的职能效果；培养主持不接受培养。\n- [乘区与上限](Combat)：现代角色增幅池最高×2.2；易伤增量最高75%；其余倍率各按来源处理。\n- [身份与临时状态](Assignments)：正式、temporary 与 commission 的排除条件不同，逐机制说明。\n- [抽卡概率](Draft-and-Rarity)与[AI 选择概率](AI)：前者逐条内容加权，后者候选加跳过共同 softmax，均不能当通关率。\n- [第十二关和无尽](Run-Flow)：第十二关先发赏金后胜利，不发本层奖励队列；继续后直接第十三关。\n\n## 版本、依据与取得游戏\n\n本次 Wiki 与 [v0.7.0 Release](https://github.com/jjhe2020/starrail-landlord/releases/tag/v0.7.0) 对齐；仓库及 Wiki 保持私有，需要仓库访问权限。游戏与报告均从该 Release 取得。\n\n规则依据优先级：冻结实现与内容定义 → 对应行为测试 → 本 Wiki 公式与条目。遇到表述省略，可沿页面出处查到准确语句；[39 份冻结源码/配置](Source-Manifest)提供完整非图像实现后备，并有逐文件 SHA-256，便于几乎完全复原。正文没有把历史研究、内部测试套路或未来路线图写成当前规则。\n\n平衡结论与机制规格分别阅读：[本版测试报告](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/docs/V070-BALANCE.md)。本版属于可玩测试版，功能检查通过不等于已证明全面平衡。角色头像归属 HoYoverse，来源见[素材记录](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/docs/ASSETS.md)。\n`;
const all = `# 全部页面索引\n\n> v0.7.0 · [首页](Home) · [机制百科](Mechanics) · [术语](Glossary)。共 ${pages.length} 页；可用浏览器查找搜索中文名称或内容 ID。\n\n${groups.map(([name, fn]) => `## ${name}\n\n${pages.filter(fn).map(p => `- [${titles.get(p)}](${p})${/^(Card-|Relic-|Essence-|Synergy-|EnemyEffect-|Assignment-)/.test(p) ? ` · \`${p.replace(/^[^-]+-/, '')}\`` : ''}`).join('\n')}`).join('\n\n')}\n`;
const sidebar = `**[星穹转轮 · v0.7.0](Home)**\n\n[机制百科](Mechanics) · [术语](Glossary) · [全部页面](All-Pages)\n\n### 基础规则\n\n- [流程与胜负](Run-Flow)\n- [棋盘与目标](Board-and-Targeting)\n- [战斗公式](Combat)\n- [效果与时序](Effects-and-Timing)\n- [成长与升星](Growth-and-Stars)\n- [资源与补给](Economy)\n- [招募与稀有度](Draft-and-Rarity)\n- [难度与敌阵](Difficulty)\n\n### 内容百科\n\n- [90 角色](Cards)\n- [64 奇物](Relics)\n- [32 精华](Essences)\n- [21 羁绊](Synergies)\n- [32 敌方条款](Enemy-Effects)\n- [10 剧情委派](Assignments)\n\n### 系统与资料\n\n- [AI 与自动测试](AI)\n- [操作与查询](Interface)\n- [存档与离线](Saves-and-Offline)\n- [随机与复原](Reproduction)\n- [完整数据](Data-Content)\n- [冻结算法](Source-Manifest)\n\n[下载 v0.7.0](https://github.com/jjhe2020/starrail-landlord/releases/tag/v0.7.0)\n`;
const footer = `**v0.7.0 规则快照** · [首页](Home) · [机制索引](Mechanics) · [术语](Glossary) · [全部页面](All-Pages) · [精确复原](Reproduction)\n\n基线 \`e5557f8\`。规则为本作改编；角色素材归属及来源见首页。\n`;
let failures = 0;
for (const [name, value] of Object.entries({ 'Home.md': home, 'All-Pages.md': all, '_Sidebar.md': sidebar, '_Footer.md': footer })) {
  if (check) { if (await readFile(path.join(dir, name), 'utf8').catch(() => null) !== value) { console.error(`Stale navigation: ${name}`); failures++; } }
  else await writeFile(path.join(dir, name), value);
}
if (failures) process.exitCode = 1;
else console.log(`${check ? 'Verified' : 'Generated'} wiki navigation for ${pages.length} pages.`);
