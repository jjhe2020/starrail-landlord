# 仙舟同盟

[首页](Home) › [羁绊](Synergies)

> 有仙舟角色登场时，本轮实际治疗的 50% / 100% 转为护盾，最多 3 / 6；溢出治疗不算。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：仙舟罗浮 |
| 激活门槛 | 永久编队中 2 / 4 种不同角色身份 |
| 档位 | 2 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `xianzhou` |

## 触发与计算

本轮有仙舟角色实际在场时，在攻击后产生 `0.5 / 1 × min(H, 6)` 基础护盾；`H` 为此时已累计的本轮实际治疗量。基础上限为 `3 / 6`。

治疗溢出不计入 H；此前在补给界面使用的固定维修也不属于这次转动的 H。转换产生的基础护盾仍经过通用护盾倍率，故最终实际生成量可以高于 3 / 6，也可能被总护盾上限截断。多名仙舟角色不会重复执行本效果。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[景元](Card-1204) · [罗刹](Card-1203) · [符玄](Card-1208) · [青雀](Card-1201) · [停云](Card-1202) · [素裳](Card-1206) · [驭空](Card-1207) · [彦卿](Card-1209) · [桂乃芬](Card-1210) · [白露](Card-1211) · [镜流](Card-1212) · [雪衣](Card-1214) · [寒鸦](Card-1215) · [藿藿](Card-1217) · [灵砂](Card-1222) · [忘归人](Card-fugue)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[实际治疗和溢出](Combat) · [丰饶](Synergy-abundance) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L19)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
