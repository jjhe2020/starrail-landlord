# 术语与关键词索引

> v0.7.0 · [首页](Home) · [机制百科](Mechanics) · [完整页面](All-Pages)。同一规则的中文词与实现字段在此对应，便于从技能文本跳到准确公式。

| 关键词 | 定义/实现字段 | 规则入口 |
| --- | --- | --- |
| 关、层 | `floor`，当前敌阵；与难度无关 | [流程](Run-Flow) |
| 难度 D1–D20 | `difficulty`，全局生命倍率条件 | [难度](Difficulty) |
| 回合、轮次 | `round`，本关已转动次数 | [时序](Effects-and-Timing) |
| 剩余转动、期限 | `spinsLeft` / `encounter.deadline` | [流程](Run-Flow) |
| 编队 | `roster`，永久和特殊实例容器 | [空间](Board-and-Targeting) |
| 登场、棋盘 | `board`，当次最多20个实例副本 | [空间](Board-and-Targeting) |
| 角色身份 | 内容 `id`，去重羁绊用 | [角色](Cards)、[羁绊](Synergies) |
| 实例 | `uid`，同角色也各不相同 | [复原](Reproduction) |
| 正式角色 | 通常指非临时且非见习的编队实例；具体过滤以各机制为准 | [委派](Assignments) |
| 临时角色、召援 | `temporary`，按实际登场次数倒计时 | [时序](Effects-and-Timing) |
| 委派见习 | `commission`，独立特殊实例，不等同 temporary | [委派](Assignments) |
| 退场 | 被消耗、临时到期或完成委派；手动移除另计 | [委派](Assignments)、[经济](Economy) |
| 成长、培养 | `growth`，整局持久 | [成长](Growth-and-Stars) |
| 升星、合成 | 3 个同角色同星实例变为一个更高星实例 | [升星](Growth-and-Stars) |
| 登场计数 | `ticks`，只在实例登场时增加；层间不重置 | [成长](Growth-and-Stars) |
| 命途 | `path`，公开技能过滤标签 | [角色](Cards) |
| 属性 | `element`，公开过滤标签 | [角色](Cards) |
| 阵营 | `faction`，公开过滤标签 | [角色](Cards) |
| 主职、职责 | `role`，attack/defense/amplifier/trainer/disruptor | [角色](Cards)、[成长](Growth-and-Stars) |
| 单体 | `single`，基础普攻主目标 ×3 | [战斗](Combat) |
| 扩散 | `blast`，主目标 ×2、邻列各 ×1 | [战斗](Combat) |
| 群体 | `aoe`，所有活敌各 ×1 | [战斗](Combat) |
| 支援、辅助 | `support`，不执行普通攻击 | [战斗](Combat) |
| 威力 | 计算出的单格 power，非最终伤害 | [战斗](Combat) |
| 平加 | `power`，加值进入规定层级 | [战斗](Combat) |
| 倍率增幅 | `powerMultiplier`，通常乘威力 | [战斗](Combat) |
| 直接/追加伤害 | `damage`，技能独立命中，仍检查目标/装甲等 | [战斗](Combat) |
| 易伤 | `vulnerability`，按合格攻击实例放大命中 | [战斗](Combat) |
| 装甲、破甲 | 每次命中平减 / `ignoreArmor` 绕过 | [战斗](Combat) |
| 治疗 | `heal`，增加生命，受缺口上限 | [经济](Economy) |
| 溢出转盾 | `healOverflowShield`，溢出治疗另做护盾结算 | [经济](Economy) |
| 护盾 | `shield`，跨轮保留，上限2倍生命上限 | [经济](Economy) |
| 平减、反击减免 | `retaliationFlat`，先平减最多45% | [战斗](Combat) |
| 倍率减伤 | `retaliationMultiplier`，合乘后最低0.4 | [战斗](Combat) |
| 贯穿 | 反击25%绕过护盾 | [条款](Enemy-Effects) |
| 生命代价 | `selfDamage`，直接扣血，通常最低留1 | [经济](Economy) |
| 相邻 | `adjacent`，周围八格，不含自身 | [空间](Board-and-Targeting) |
| 同行、同列、十字 | `row/column/aligned` | [空间](Board-and-Targeting) |
| 边缘、角落 | `edge/corner`，棋盘位置条件 | [空间](Board-and-Targeting) |
| 孤立、空位 | 相邻实例数为0 / `emptyNeighbors` | [空间](Board-and-Targeting) |
| 最强目标 | `strongest`，按当前威力及实现排序选取 | [空间](Board-and-Targeting) |
| 羁绊共鸣 | `SYNERGIES`，21种正式编队组合 | [羁绊](Synergies) |
| 奇物 | `ITEMS`，64种不可重复持有的奖励 | [奇物](Relics) |
| 奇物精华、余响 | `ESSENCES`，32种先积累再解锁的奖励 | [精华](Essences) |
| 条款、审计 | `activeDebuffs`，32种敌方约束 | [条款](Enemy-Effects) |
| 裂界污染 | 指定一星实例登场扣6生命并施加威力惩罚 | [污染](EnemyEffect-rift_pollution) |
| 剧情委派 | 10组指定来源和目标角色互动 | [委派](Assignments) |
| 稀有度 | common/uncommon/rare/legendary；逐条加权抽样 | [奖励](Draft-and-Rarity) |
| 重掷、重新发现 | 重新抽取当前奖励组，先免费后8信用点 | [经济](Economy) |
| 移除 | 消费次数删除一个实例，不是自动退场事件 | [经济](Economy) |
| 超频 | 下一轮最终威力×1.2，待用状态不可重复购买 | [经济](Economy) |
| 内部套路 | 仅测试拿牌偏好，不是角色技能规则 | [AI](AI) |
| 反事实试算 | 用独立公开状态种子试转副本 | [AI](AI) |
| 推荐概率 | 候选和跳过的 softmax 选择概率 | [AI](AI) |
| 种子、随机状态 | `seed/rngState`，决定规则随机序列 | [复原](Reproduction) |
| 效果快照 | `lastSpin`，已发生历史，不预测下一轮 | [查询](Interface) |

各角色、奇物、精华、羁绊、条款和委派名称均可从[全部页面索引](All-Pages)按浏览器查找进入独立条目。
