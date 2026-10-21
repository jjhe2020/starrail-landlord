# 同谐隔离

[首页](Home) › [敌方条款](Enemy-Effects)

> 同谐角色提供的平加和倍率增益效果降低 30%（仅削减倍率高于 1 的部分）。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `path_harmony` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

编队至少有两个实例，且有同谐角色定义了定向威力增益。定向包括相邻、同行、同列、同行同列、最强、匹配筛选或 strongest 选择，不检查本轮是否真的相邻。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

同谐角色适用的威力平加增益乘 0.7；倍率增益按 `1 + (原倍率−1) × 0.7`。

实际削减发生在通用辅助增益入口：现行放大器角色的威力增益，或相邻/最强定向效果。资格是定义检查，不保证选中后本轮一定触发；不会削减同谐羁绊提供的 buffMultiplier 本身。

## 关联条目

[同谐](Synergy-harmony) · [邻接隔断](EnemyEffect-adjacency_audit) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L36)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
