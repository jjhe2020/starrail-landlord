# 智识

[首页](Home) › [羁绊](Synergies)

> 每空出一列，登场智识角色本轮增加 0.4 / 0.8 点威力，最多按 4 列计算；按星级放大。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：智识 |
| 激活门槛 | 永久编队中 2 / 4 种不同角色身份 |
| 档位 | 2 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `erudition` |

## 触发与计算

每位登场智识攻击者本轮加 `0.4 / 0.8 × min(5 − 存活敌列数, 4) × S × O` 威力。

使用攻击前的空敌列数量。第 1 层原本只有三列敌人，因此开场已有两列可计；不是统计己方空格，也不是随着本轮每次击破即时追加。没有永久成长。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[姬子](Card-1003) · [黑塔](Card-1013) · [希露瓦](Card-1103) · [景元](Card-1204) · [青雀](Card-1201) · [银枝](Card-1302) · [翡翠](Card-1314) · [乱破](Card-1317) · [那刻夏](Card-1405) · [大黑塔](Card-the_herta) · [姬子·启行](Card-announced_himeko_nova) · [远坂凛](Card-announced_rin_tohsaka)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[敌阵列数](Difficulty) · [群体攻击](Combat) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L22)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
