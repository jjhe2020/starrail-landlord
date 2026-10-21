# 流风编队

[首页](Home) › [羁绊](Synergies)

> 本轮常规攻击后若仅剩 1–2 列敌人，登场风攻击者追加自身威力 25% / 45% 的伤害。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：风 |
| 激活门槛 | 永久编队中 3 / 4 种不同角色身份 |
| 档位 | 3 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `wind` |

## 触发与计算

普通攻击后，每位登场风攻击者在其羁绊效果执行时若敌人仅剩 1–2 列，追加 `0.25 / 0.45 × P × O` 基础伤害。

逐个来源重看当前存活列数：前一个来源清空最后敌列后，后续来源不再满足条件。向来源列最近存活敌人攻击；原列没有敌人也可转向。不跨轮积累收割次数。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[丹恒](Card-1002) · [布洛妮娅](Card-1101) · [桑博](Card-1108) · [刃](Card-1205) · [藿藿](Card-1217) · [飞霄](Card-1220) · [黑天鹅](Card-1307) · [那刻夏](Card-1405) · [风堇](Card-1409) · [刻律德菈](Card-cerydra) · [Saber](Card-saber) · [知更鸟·晴歌](Card-robin_summeretto)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[阶段与顺序](Effects-and-Timing) · [目标选择](Board-and-Targeting) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L30)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
