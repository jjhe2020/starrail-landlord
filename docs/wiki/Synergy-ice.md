# 冻结编队

[首页](Home) › [羁绊](Synergies)

> 每种本轮实际登场的永久冰角色使敌方反击减少 0.5 / 1，最多按 3 种计算。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：冰 |
| 激活门槛 | 永久编队中 3 / 4 种不同角色身份 |
| 档位 | 3 身份为第 1 档；4 身份为第 2 档；高档替换低档 |
| 内部识别码 | `ice` |

## 触发与计算

本轮反击平减增加 `0.5 / 1 × min(N, 3)`；N 是实际登场、符合非临时筛选的冰属性不同身份数。基础平减上限 `1.5 / 3`。

重复冰实例、升星均不增加 N。身份计数还与编队激活数分开：前者看本轮棋盘，后者看永久编队。名称“冻结”不代表冻结敌人或跳过反击，仍按通用反击减伤公式计算。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[三月七](Card-1001) · [黑塔](Card-1013) · [杰帕德](Card-1104) · [佩拉](Card-1106) · [彦卿](Card-1209) · [镜流](Card-1212) · [阮·梅](Card-1303) · [米沙](Card-1312) · [大黑塔](Card-the_herta) · [长夜月](Card-evernight) · [昔涟](Card-cyrene) · [真珠](Card-pearl)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[身份计数口径](Synergies) · [反击公式](Combat) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L27)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
