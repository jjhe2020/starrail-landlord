# 量子编队

[首页](Home) › [羁绊](Synergies)

> 至少三种永久量子身份本轮实际登场时，威力最高的量子角色在攻击后追加自身威力 70% / 120% 的合击。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：量子 |
| 激活门槛 | 永久编队中 3 / 4 种不同角色身份 |
| 档位 | 3 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `quantum` |

## 触发与计算

本轮至少三种符合非临时筛选的量子身份登场时，选择本轮最终威力最高的量子攻击者，追加 `0.7 / 1.2 × P × O` 基础伤害，每轮全局一次。

满足三身份条件的角色可以有辅助职能，但发动者必须为量子攻击职能；同威力取棋盘索引较小者。该来源的普通攻击即使没有击破也能合击。按本次棋盘重新判断，不跨轮积攒量子身份或进度。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[银狼](Card-1006) · [希儿](Card-1102) · [符玄](Card-1208) · [青雀](Card-1201) · [玲可](Card-1110) · [雪衣](Card-1214) · [花火](Card-1306) · [翡翠](Card-1314) · [缇宝](Card-1403) · [赛飞儿](Card-1406) · [遐蝶](Card-1407) · [Archer](Card-archer) · [远坂凛](Card-announced_rin_tohsaka) · [砂金·戏浪](Card-aventurine_waveflair) · [星神★阿哈](Card-aeon_star_aha)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[最强目标](Board-and-Targeting) · [同场概率](Synergies) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L31)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
