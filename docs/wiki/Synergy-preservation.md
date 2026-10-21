# 存护

[首页](Home) › [羁绊](Synergies)

> 有存护角色登场时，每轮获得 3 / 6 护盾；本轮真正抵伤的 25% / 50% 反击敌人，致死时不反击。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：存护 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `preservation` |

## 触发与计算

只要有存护角色实际在场，攻击前产生 `3 / 6` 基础护盾。反击后仍存活时，再造成 `0.25 / 0.5 × round2(实际护盾抵伤) × O` 基础追击伤害，每轮全局一次。

反击来源格取本轮最终威力最高的攻击职能实例（同威力取较小格索引），从其列寻找最近存活敌人。伤害基于真正消耗的护盾值，不按生成护盾、反击总额或生命损失计算。没有攻击者则无追击；生命降为 0 时也不执行。最强来源可以不是存护。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[三月七](Card-1001) · [杰帕德](Card-1104) · [符玄](Card-1208) · [砂金](Card-1304) · [丹恒·腾荒](Card-dan_heng_pt)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[反击结算](Combat) · [贯穿反击](EnemyEffect-shield_pierce) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L24)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
