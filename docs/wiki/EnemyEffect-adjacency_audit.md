# 邻接隔断

[首页](Home) › [敌方条款](Enemy-Effects)

> 相邻与定向的平加和倍率增益效果降低 40%（仅削减倍率高于 1 的部分）。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `adjacency_audit` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

编队至少有两个实例，且有任意角色定义定向威力增益。定向口径与同谐隔离相同，不要求当前棋盘已经摆出相邻。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

适用的角色来源辅助威力平加乘 0.6；倍率增益按 `1 + (原倍率−1) × 0.6`。

不是阻断相邻格，也不删除角色。与同谐隔离相乘时，增益部分系数为 0.6 × 0.7 = 0.42；来源为羁绊的列车接力不走角色 utilityMultiplier，因此不直接受此税。

## 关联条目

[棋盘与目标](Board-and-Targeting) · [同谐隔离](EnemyEffect-path_harmony) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L41)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
