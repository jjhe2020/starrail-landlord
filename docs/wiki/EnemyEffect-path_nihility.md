# 虚无审查

[首页](Home) › [敌方条款](Enemy-Effects)

> 虚无角色威力、易伤与削弱反击的技能效果降低 20%。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `path_nihility` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

编队存在虚无角色。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

虚无角色本轮最终威力乘 0.8；虚无角色技能的 vulnerability、retaliationFlat 减益量乘 0.8；retaliationMultiplier 按 `1 + (原倍率−1) × 0.8` 缩小减伤部分。

可以同时降低输出和控制效果；如瓦尔特专属条款并存，其平减再乘 0.5。它不会直接把羁绊虚无的 damage 系数乘 0.8，但以最终威力为基数的伤害仍受来源威力下降影响。

## 关联条目

[虚无](Synergy-nihility) · [瓦尔特](Card-1004) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L33)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
