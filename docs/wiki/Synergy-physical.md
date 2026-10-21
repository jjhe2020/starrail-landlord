# 坚韧编队

[首页](Home) › [羁绊](Synergies)

> 物理角色本轮首次常规击破，获得 2 信用点；每个来源每轮一次。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 属性：物理 |
| 激活门槛 | 永久编队中 2 种不同角色身份 |
| 档位 | 2 身份为第 1 档；高档替换低档 |
| 内部识别码 | `physical` |

## 触发与计算

每位登场物理角色首次通过普通攻击击破时，产生 `2` 信用点；每来源每轮一次。

本条是资源效果，不受羁绊进攻系数 O 放大或征收。其成员筛选本身不限制攻击职能，但当前辅助角色不执行普通攻击，通常不能亲自完成该击破。追加伤害的击破不进入这项普通攻击 kill 触发。信用点保留至消费。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[娜塔莎](Card-1105) · [克拉拉](Card-1107) · [卢卡](Card-1111) · [素裳](Card-1206) · [寒鸦](Card-1215) · [云璃](Card-1221) · [银枝](Card-1302) · [知更鸟](Card-1309) · [波提欧](Card-1315) · [白厄](Card-1408) · [丹恒·腾荒](Card-dan_heng_pt) · [海瑟音](Card-hysilens) · [爻光](Card-yao_guang) · [绯英](Card-evanescia)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[信用点](Economy) · [击破判定](Combat) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L32)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
