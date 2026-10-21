# 医疗折价

[首页](Home) › [敌方条款](Enemy-Effects)

> 角色、羁绊和奇物的治疗降低 25%；信用补给维修保持固定数值。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `healing_audit` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

持续效果中存在 heal 或 healOverflowShield，且其生成前提通过资格检查；仅有已经领取的 acquire 一次性治疗或治疗倍率不够。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

通用非固定治疗请求量乘 0.75。

角色、羁绊、奇物、精华调用非固定治疗入口均适用；信用补给的固定维修仍为原固定治疗量，但实际恢复不会超过缺失生命。余额生命不会即时减少。

## 关联条目

[战斗](Combat) · [经济](Economy) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L56)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
