# 公司筹策

[首页](Home) › [羁绊](Synergies)

> 进入新关时获得 5 / 8 信用点；每关一次，不受是否当轮抽中影响。

| 项目 | 规则 |
| --- | --- |
| 公开标签 | 阵营：星际和平公司 |
| 激活门槛 | 永久编队中 2 / 3 种不同角色身份 |
| 档位 | 2 身份为第 1 档；3 身份为第 2 档；高档替换低档 |
| 内部识别码 | `ipc` |

## 触发与计算

进入新遭遇的 floor 触发时，编队达到门槛即获得 `5 / 8` 信用点，每关一次。

无需公司角色在当轮棋盘出现；在关内刚凑出公司羁绊不会立刻补领当前关预算，需等下次入关。读取说明、保存或重载不触发 floor，也不能重复领取。资源不受香涎干酪或羁绊征收影响。

本页 S、P、O 的定义及见习/临时角色口径见[羁绊通则](Synergies)。先达到编队激活门槛，再检查本项登场条件；重复和星级均不额外增加激活身份数。

## 可提供该标签的角色

[托帕&账账](Card-1112) · [砂金](Card-1304) · [翡翠](Card-1314) · [真珠](Card-pearl) · [砂金·戏浪](Card-aventurine_waveflair)。以上是标签成员索引，不意味着所有成员都能发动受攻击职能限制的伤害或威力效果。

## 关联机制

[入关时序](Run-Flow) · [信用点](Economy) · [伤害与防御](Combat) · [效果与时序](Effects-and-Timing) · [羁绊征收](EnemyEffect-synergy_audit)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L35)；[src/synergies.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/synergies.js#L38-L50)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/effect-rules.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L57-L163)。
