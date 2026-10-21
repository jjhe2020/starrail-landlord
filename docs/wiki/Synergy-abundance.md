# 丰饶

[首页](Home) › [羁绊](Synergies)

> 有丰饶角色登场时，按本轮实际治疗量÷3减少反击（可为小数），最多减少 3；溢出和维修补给不算。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：丰饶 |
| 激活门槛 | 永久编队中 2 种不同角色身份 |
| 档位 | 2 身份为第 1 档；高档替换低档 |
| 内部识别码 | `abundance` |

## 触发与计算

本轮有丰饶角色实际在场时，攻击后增加反击平减 `min(H / 3, 3)`，允许小数。

H 为截至该阶段的本轮实际恢复生命；满血溢出无效，补给界面的维修不计入这次转动。每轮只产生一份平减，不按丰饶人数复制。该平减与其他平减相加后，受敌方原始反击 45% 的通用上限约束。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[娜塔莎](Card-1105) · [罗刹](Card-1203) · [玲可](Card-1110) · [白露](Card-1211) · [藿藿](Card-1217) · [灵砂](Card-1222) · [加拉赫](Card-1301)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[反击公式](Combat) · [仙舟同盟](Synergy-xianzhou) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L25)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
