# 虚数编队

[首页](Home) › [羁绊](Synergies)

> 有虚数角色实际登场时，本轮敌方反击降低 15%；不跳过敌人整轮。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：虚数 |
| 激活门槛 | 永久编队中 2 种不同角色身份 |
| 档位 | 2 身份为第 1 档；高档替换低档 |
| 内部识别码 | `imaginary` |

## 触发与计算

有任意虚数角色实际在场时，本轮反击倍率乘 `0.85`，每轮全局一次。

不同虚数来源不重复乘 0.85。该倍率与其他反击倍率相乘后受最低 0.4 的乘区下限约束；平减在倍率前执行。不会让敌人跳过整轮，也没有可叠层的禁锢状态。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[瓦尔特](Card-1004) · [罗刹](Card-1203) · [驭空](Card-1207) · [砂金](Card-1304) · [真理医生](Card-1305) · [星期日](Card-1313) · [乱破](Card-1317) · [万敌](Card-1404) · [三月七·巡猎](Card-march_hunt) · [丹恒·饮月](Card-dan_heng_imbibitor_lunae) · [银狼LV.999](Card-silver_wolf_lv999)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[反击公式](Combat) · [瓦尔特](Card-1004) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L33)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
