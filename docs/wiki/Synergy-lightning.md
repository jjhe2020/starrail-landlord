# 雷霆编队

[首页](Home) › [羁绊](Synergies)

> 登场雷攻击者在攻击后向最近的另一存活列追加自身威力 20% / 35% 的电弧；只剩一列时不触发。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：雷 |
| 激活门槛 | 永久编队中 3 / 4 种不同角色身份 |
| 档位 | 3 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `lightning` |

## 触发与计算

每位登场雷攻击者在其效果执行时若至少仍有两列敌人，向来源格以外最近的存活敌列追加 `0.2 / 0.35 × P × O` 基础伤害。

排除的是来源棋盘列，不一定等于普通攻击最终攻击过的列。其他列距离相同则取左列；若前面来源的追加伤害已使敌列数降到 1，后面来源不再触发。没有连锁电弧，也不触发普通攻击击破回调。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[卡芙卡](Card-1005) · [阿兰](Card-1008) · [希露瓦](Card-1103) · [景元](Card-1204) · [停云](Card-1202) · [白露](Card-1211) · [貊泽](Card-1223) · [黄泉](Card-1308) · [阿格莱雅](Card-1402) · [不死途](Card-ashveil) · [吉尔伽美什](Card-announced_gilgamesh)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[目标与距离](Board-and-Targeting) · [追加伤害](Combat) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L28)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
