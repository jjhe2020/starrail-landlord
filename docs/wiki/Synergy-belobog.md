# 筑城誓约

[首页](Home) › [羁绊](Synergies)

> 有贝洛伯格角色登场时，本轮首次常规攻击击破获得 4 / 8 护盾；生成的护盾可保留。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：贝洛伯格 |
| 激活门槛 | 永久编队中 3 / 6 种不同角色身份 |
| 档位 | 3 身份为第 1 档；6 身份为第 2 档；高档替换低档 |
| 内部识别码 | `belobog` |

## 触发与计算

本轮有贝洛伯格角色未被消耗且实际在场时，全队首次普通攻击击破产生 `4 / 8` 基础护盾，每轮全局一次。

击破者可以不属于贝洛伯格；所需的是贝洛伯格同伴在场。羁绊/角色技能的追加伤害击破不会触发普通攻击的 kill 入口。该护盾再经过通用护盾增益、折价与 `2 × 生命上限` 总护盾上限，生成后可以跨轮保留。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[布洛妮娅](Card-1101) · [希儿](Card-1102) · [希露瓦](Card-1103) · [杰帕德](Card-1104) · [娜塔莎](Card-1105) · [佩拉](Card-1106) · [克拉拉](Card-1107) · [桑博](Card-1108) · [虎克](Card-1109) · [玲可](Card-1110) · [卢卡](Card-1111)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[护盾与反击](Combat) · [护盾折价](EnemyEffect-shield_audit) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L16)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
