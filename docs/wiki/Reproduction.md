# 随机、状态与精确复原

> v0.7.0 · [状态流程](Run-Flow) · [结算时序](Effects-and-Timing) · [完整算法清单](Source-Manifest) · [存档](Saves-and-Offline)。

本 Wiki 正文用于理解、查询和重建机制；各内容条目给出完整非美术参数，[内容数据快照](Data-Content)提供三库完整 JSON，[冻结算法附录](Source-Manifest)保留全部 `src/` 模块及必要构建配置的精确实现。阅读时无需逐行读代码；需要实现相同种子、边界与 AI 行为时，可从附录还原原文件并校验 SHA-256。

## 版本边界

| 项目 | 本 Wiki 冻结值 |
| --- | --- |
| 游戏版本 | 0.7.0 |
| 基线提交 | `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229` |
| 规则 id | 见[难度配置](Difficulty) |
| 存档状态版本 | 2 |
| AI 算法 | `v070-spatial-tag-actions-v1` |
| 默认模型参数版本 | `context-v3-resources` |
| 内容 | 90 角色、64 奇物、32 精华、21 羁绊、32 条款、10 委派 |

以实际发布代码为规则真值。设计理由、平衡研究、旧版兼容分支和[路线图](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/docs/ROADMAP.md)不自动成为当前机制。全部当前角色 kitVersion=6；代码中为 kitVersion<6 保留的旧角色专用逻辑不在新版本 90 卡上执行。历史奇物/精华硬编码则有部分继续执行，单页已分开解释。

## 引擎随机数

种子输入到 `newGame` 时先取 `String(seed || '星穹房东').slice(0,200)`；界面另有限制：去首尾空白、最多 64 字符。哈希按 UTF-16 code unit 逐位处理：

```javascript
let h = 2166136261;
for (let i = 0; i < seed.length; i++)
  h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
rngState = (h >>> 0) || 1;
```

每次随机使用 xorshift32，并使用 JavaScript 32 位位运算语义：

```javascript
let x = rngState;
x ^= x << 13;
x ^= x >>> 17;
x ^= x << 5;
rngState = (x >>> 0) || 1;
return rngState / 4294967296; // [0,1)
```

洗牌为从尾到头的 Fisher–Yates：`i=N-1..1`，取 `j=floor(random×(i+1))`，交换 `i,j`。每轮先对**完整编队数组**洗牌，取前 20 个，再对 `0..19` 全部格位洗牌，按顺序配对。编队不足 20 时保留空位；没有独立“每张牌是否出现”的 Bernoulli 抽样。

奖励、概率技能、条款抽取与污染目标等也使用同一个状态 RNG。更改一次重掷、领取、合成效果或随机技能触发，都可能改变之后的随机消费顺序。保持同种子但改变操作，不能期待后续落位不变。

## 状态与实例身份

`uid` 由递增计数器分配为 `u1,u2,...`，角色 `id` 代表内容身份，不能混用。成长、登场次数、临时寿命、来源和污染绑定实例 uid；合成新建 uid、累加成长、取最大登场次数。正文中“角色种类/身份”通常按 id 去重，“实例/副本”按 uid 计数。委派的特殊口径见[委派](Assignments)。

编队 `roster` 是跨轮状态；棋盘 `board` 是当次实例副本。技能更新永久值时回写编队并同步棋盘；上一轮棋盘可以留有已退场的历史实例，所以不能仅凭快照还原当前编队。效果定义总是从内容库读取，不从存档中的任意对象执行。

引擎对有效动作 `structuredClone` 后计算，不修改传入状态。无效动作返回相同对象；所有输出必须是 JSON 可保存状态，诊断观察器与临时 modifier 放 WeakMap，不序列化。

## 数值语义

引擎使用 JavaScript IEEE-754 双精度数，不使用整型伤害或十进制定点。`round2(x)=Math.round(x×100)/100` 仅在代码标明的结算节点执行；不能把每个中间乘积都先四舍五入。星级本身为 1–3 整数，资源奖励中的重掷/移除整数化规则另见[经济](Economy)。

实际伤害由敌方剩余生命截断；记录、事件及最后威力有独立舍入节点。[战斗算例](Combat)用于解释计算，完全相等的确定性对照必须遵守[原始执行顺序](Source-Engine)。

## AI 随机数与可复现范围

策略抽样使用独立 `createPolicyRandom`，通常以 `seed + ':policy'` 初始化；不推进引擎 RNG。策略哈希用 `for...of` 遍历字符，再读取该字符 `charCodeAt(0)`，与引擎对 UTF-16 每个 code unit 遍历存在差别，含补充平面字符时应逐字复用[实现](Source-Ai)，不要凭通用库替换。

AI 反事实种子来自公开状态摘要，不使用真实未来随机流。中途刷新/导入重建策略抽样器，且闭包内部值没有写进存档；引擎后续相同操作可精确重演，继续代打则需要记录策略随机状态或完整选择/操作轨迹。

从起点复现需一起固定：游戏代码与内容、难度、资源开关、宇宙种子、动作序列；复现 AI 还要固定策略算法版本、模型参数、lookahead 开关、策略种子和是否中途重启。训练与实验还要固定校准/留出分区和样本数。

## 从 Wiki 重建

1. 从[机制索引](Mechanics)掌握状态机、棋盘、效果解释器、战斗乘区与成长，然后读取各分类内容条目。正文足以重新设计独立实现。
2. 要逐位复现，按[算法清单](Source-Manifest)从每页 `frozen-source:start/end` 之间提取代码围栏，按原路径保存，逐文件校验字节数及 SHA-256。附录包括完整 content.js，因此内容参数无需从人类表格反向猜测。
3. 美术可替换为占位图。`public/assets`、图标和头像图像文件不包含在 Wiki；根据配置中的路径提供自有占位资源即可。第三方角色头像归属 HoYoverse，来源记录见[素材归属](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/docs/ASSETS.md)。
4. Node.js ≥22，安装锁文件依赖后可运行构建。要比较玩法，优先直接导入 `src/engine.js`，避免 DOM/动画影响验证；要检验同源实现，从[基线仓库](https://github.com/jjhe2020/starrail-landlord/tree/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229)取得行为测试并运行 `npm run check`、`npm test`、`npm run build`。

以下示例展示接口及不可变状态约定，不预设该种子结果：

```javascript
import { newGame, spin, chooseReward, skipReward } from './src/engine.js';
const initial = newGame({ seed: 'wiki-v070', difficulty: 10 });
const next = spin(initial);
console.assert(initial.round === 0 && next.round === 1);
// 奖励阶段 chooseReward(next, 0) 领取第一项；skipReward(next) 跳过。
```

## Wiki 的维护和验证

主仓库 `docs/wiki/` 保存可审核镜像；`generate-wiki-catalog.mjs` 生成内容百科，`generate-wiki-world.mjs` 生成羁绊/条款/委派，`generate-wiki-sources.mjs` 冻结算法，`check-wiki.mjs` 校验条目覆盖、内部链接/锚点及原始源码字节哈希。GitHub Wiki 是独立 Git 仓库，发布后另行核验其远端提交。

Wiki 本次只记录现版，没有改角色规则、移动 v0.7.0 标签、更新离线 HTML 或重新发版。未来游戏升级时，应先确定新规则版本，再重写受影响正文并重新生成所有数据和互链。
