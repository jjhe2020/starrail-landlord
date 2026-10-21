# 星穹列车

[首页](Home) › [羁绊](Synergies)

> 列车角色登场时，为相邻非列车攻击者提供本轮 0.35 / 0.6 点威力；按来源星级放大。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：星穹列车 |
| 激活门槛 | 永久编队中 2 / 4 种不同角色身份 |
| 档位 | 2 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `astral` |

## 触发与计算

每位登场列车来源，对八邻域内每位非列车攻击者加 `b × S × O` 威力；`b = 0.35 / 0.6`，`S = 来源的星级倍率`，`O = 羁绊进攻系数`。

来源不限攻击职能，列车辅助也能接力；受益者必须同时满足非列车、攻击职能、攻击方式不是辅助。邻接不跨行边界。多个列车来源的平加可累加，不会把目标变成列车成员。此效果属于相邻威力增益，还会经过通用辅助放大入口：纯美骑士精神可放大它；敌方“邻接隔断”只针对角色来源，不能直接削弱这项羁绊来源。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[三月七](Card-1001) · [丹恒](Card-1002) · [姬子](Card-1003) · [瓦尔特](Card-1004) · [三月七·巡猎](Card-march_hunt) · [丹恒·饮月](Card-dan_heng_imbibitor_lunae) · [丹恒·腾荒](Card-dan_heng_pt) · [姬子·启行](Card-announced_himeko_nova)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[相邻位置](Board-and-Targeting) · [纯美骑士精神](Relic-harmony_wax) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L15)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
