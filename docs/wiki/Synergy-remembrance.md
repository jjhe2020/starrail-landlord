# 记忆

[首页](Home) › [羁绊](Synergies)

> 有记忆角色登场时，本轮临时攻击者增加 1 / 2 点威力；临时角色仍不增加羁绊人数。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：记忆 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `remembrance` |

## 触发与计算

有任意记忆角色实际在场时，本轮全部临时攻击者加 `1 / 2 × O` 威力，每轮全局一份。

受益者须为 temporary 筛选下的攻击职能，包括本轮完成最后一次登场、已标记 expired 但尚未离场的临时角色。见习委派 commission 不属于临时角色。没有按记忆来源人数或星级放大，也不延长临时登场期限。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[阿格莱雅](Card-1402) · [遐蝶](Card-1407) · [风堇](Card-1409) · [长夜月](Card-evernight) · [昔涟](Card-cyrene) · [知更鸟·晴歌](Card-robin_summeretto)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[临时角色](Growth-and-Stars) · [委派](Assignments) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L34)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
