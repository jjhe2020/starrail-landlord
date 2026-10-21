# 毁灭

[首页](Home) › [羁绊](Synergies)

> 攻击阶段生命不高于上限一半时，毁灭角色本轮威力提高 20% / 35%；羁绊不消耗生命。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：毁灭 |
| 激活门槛 | 永久编队中 2 / 4 种不同角色身份 |
| 档位 | 2 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `destruction` |

## 触发与计算

效果收集阶段生命满足 `HP / 最大HP ≤ 0.5` 时，登场毁灭攻击者获得本轮倍率 `1 + (0.2 / 0.35) × O`。

条件在攻击前的羁绊 spin 阶段判断，此前的登场治疗、生命消耗会影响判定；不是看开轮前生命。倍率与其他倍率按各自规则合成，不主动消耗生命，也不会提高永久成长。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[阿兰](Card-1008) · [克拉拉](Card-1107) · [虎克](Card-1109) · [刃](Card-1205) · [镜流](Card-1212) · [雪衣](Card-1214) · [云璃](Card-1221) · [流萤](Card-1310) · [米沙](Card-1312) · [万敌](Card-1404) · [白厄](Card-1408) · [丹恒·饮月](Card-dan_heng_imbibitor_lunae) · [Saber](Card-saber) · [吉尔伽美什](Card-announced_gilgamesh)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[效果时序](Effects-and-Timing) · [满血溢价](EnemyEffect-healthy_audit) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L21)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
