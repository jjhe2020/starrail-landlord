# 空间站科员

[首页](Home) › [羁绊](Synergies)

> 空间站攻击者每第 3 次实际登场，本轮增加 1 / 2 点威力；按星级放大，不增加永久成长。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：黑塔空间站 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `station` |

## 触发与计算

每位登场的空间站攻击者，在自己的累计实际登场计数 `ticks = 3, 6, 9, …` 时，本轮加 `1 / 2 × S × O` 威力。

每个实例单独计数；不是本关第 3 轮，也不是空间站全队共享计数。登场计数先递增，再检查周期；本关以外累积的计数仍保留。平加只持续本轮，永久成长不变。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[阿兰](Card-1008) · [艾丝妲](Card-1009) · [黑塔](Card-1013) · [阮·梅](Card-1303) · [大黑塔](Card-the_herta)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[登场计数与星级](Growth-and-Stars) · [黑塔](Card-1013) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L17)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
