# 命运剧本

[首页](Home) › [羁绊](Synergies)

> 本轮至少两种永久猎手实际登场时，各登场猎手攻击者在攻击后追加自身威力 20% / 35% 的伤害。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：星核猎手 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `hunters` |

## 触发与计算

本轮至少有两种符合非临时筛选的星核猎手身份登场时，每位登场的猎手攻击者，在普通攻击后追加 `0.2 / 0.35 × P × O` 基础伤害。

两种身份可包括辅助职能；真正发动追击者仍须为攻击职能。同名重复实例不增加身份数，但达成门槛后，每个合格攻击实例各追击一次。追击以来源所在列选择最近的存活敌列，允许在原列已空时转向，不触发普通攻击击破追击。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[卡芙卡](Card-1005) · [银狼](Card-1006) · [刃](Card-1205) · [流萤](Card-1310) · [银狼LV.999](Card-silver_wolf_lv999) · [千冶·刃](Card-mortenax_blade)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[追击和易伤](Combat) · [不同身份同场](Synergies) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L18)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
