# 同谐

[首页](Home) › [羁绊](Synergies)

> 登场同谐角色提供的相邻、定向威力增益提高 25% / 45%；增益仅对本轮有效。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 命途：同谐 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `harmony` |

## 触发与计算

同谐来源适用的辅助增益系数乘 `1.25 / 1.45`；平加直接放大，倍率只放大超出 1 的增益部分。

本效果提供被动 buffMultiplier，目标筛选依据增益来源的命途。对现行角色，放大器职能提供的威力增益会进入该辅助入口；相邻、最强定向效果也会进入。它不会额外增加登场人数、治疗、护盾或永久成长。多个角色技能的倍率仍受放大器合成 2.2 上限，详见战斗公式。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[艾丝妲](Card-1009) · [布洛妮娅](Card-1101) · [停云](Card-1202) · [驭空](Card-1207) · [寒鸦](Card-1215) · [阮·梅](Card-1303) · [花火](Card-1306) · [知更鸟](Card-1309) · [星期日](Card-1313) · [缇宝](Card-1403) · [刻律德菈](Card-cerydra)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[辅助乘区](Combat) · [同谐隔离](EnemyEffect-path_harmony) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L26)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
