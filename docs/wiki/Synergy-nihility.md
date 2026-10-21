# 虚无

[首页](Home) › [羁绊](Synergies)

> 每逢当前遭遇的偶数次转动，登场虚无攻击者在攻击后追加自身威力 25% / 45% 的伤害。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：虚无 |
| 激活门槛 | 永久编队中 2 / 4 种不同角色身份 |
| 档位 | 2 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `nihility` |

## 触发与计算

在当前遭遇第 `2, 4, 6, …` 次转动，登场虚无攻击者于普通攻击后追加 `0.25 / 0.45 × P × O` 基础伤害。

这是当前关的 round 周期，不是来源实例的 ticks 周期；换关从第 1 次转动重置。追加伤害向来源列最近存活敌人结算，无跨轮持续伤害状态，也不再次触发击破技能。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[瓦尔特](Card-1004) · [卡芙卡](Card-1005) · [银狼](Card-1006) · [佩拉](Card-1106) · [桑博](Card-1108) · [卢卡](Card-1111) · [桂乃芬](Card-1210) · [椒丘](Card-1218) · [黑天鹅](Card-1307) · [黄泉](Card-1308) · [赛飞儿](Card-1406) · [忘归人](Card-fugue) · [海瑟音](Card-hysilens) · [千冶·刃](Card-mortenax_blade) · [大丽花](Card-the_dahlia)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[转动与登场计数](Effects-and-Timing) · [虚无审查](EnemyEffect-path_nihility) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L23)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
