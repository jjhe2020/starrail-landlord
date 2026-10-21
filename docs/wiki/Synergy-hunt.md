# 巡猎

[首页](Home) › [羁绊](Synergies)

> 巡猎角色本轮首次常规击破后，追加自身威力 60% 的追击；每个来源每轮一次。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：巡猎 |
| 激活门槛 | 永久编队中 2 种不同角色身份 |
| 档位 | 2 身份为第 1 档；高档替换低档 |
| 内部识别码 | `hunt` |

## 触发与计算

每位登场巡猎攻击者首次通过普通攻击击破时，向来源列最近存活敌人追加 `0.6 × P × O` 基础伤害；每来源每轮一次。

来源实例必须亲自完成普通攻击击破；编队里有巡猎但没有登场，或由其他角色击破，都不满足。追加伤害仍受装甲和适用易伤影响，击破后不递归触发本羁绊。若已无敌人，追击没有伤害目标。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[丹恒](Card-1002) · [希儿](Card-1102) · [托帕&账账](Card-1112) · [素裳](Card-1206) · [彦卿](Card-1209) · [飞霄](Card-1220) · [貊泽](Card-1223) · [真理医生](Card-1305) · [波提欧](Card-1315) · [三月七·巡猎](Card-march_hunt) · [Archer](Card-archer) · [不死途](Card-ashveil)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[普通攻击击破](Combat) · [希儿](Card-1102) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L20)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
