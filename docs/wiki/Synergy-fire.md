# 烈焰编队

[首页](Home) › [羁绊](Synergies)

> 当前遭遇第一次转动，火属性攻击角色本轮增加 2 点威力；按星级放大。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：火 |
| 激活门槛 | 永久编队中 3 种不同角色身份 |
| 档位 | 3 身份为第 1 档；高档替换低档 |
| 内部识别码 | `fire` |

## 触发与计算

当前遭遇第 1 次转动，每位登场火攻击者加 `2 × S × O` 威力。

这不是角色第一次登场；第 1 次转动没抽中的火角色，在本关以后登场不会补领。新关 round 重置，重新获得首轮机会。不写入永久成长。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[姬子](Card-1003) · [艾丝妲](Card-1009) · [虎克](Card-1109) · [托帕&账账](Card-1112) · [桂乃芬](Card-1210) · [椒丘](Card-1218) · [灵砂](Card-1222) · [加拉赫](Card-1301) · [流萤](Card-1310) · [忘归人](Card-fugue) · [火花](Card-sparxie) · [千冶·刃](Card-mortenax_blade) · [大丽花](Card-the_dahlia) · [姬子·启行](Card-announced_himeko_nova)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[关卡流程](Run-Flow) · [星级倍率](Growth-and-Stars) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L29)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
