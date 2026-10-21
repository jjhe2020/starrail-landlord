# 羁绊征收

[首页](Home) › [敌方条款](Enemy-Effects)

> 已激活羁绊的威力加成降低 25%。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `synergy_audit` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

至少一项已激活羁绊的当前档位含 power、powerMultiplier 或 damage。只有经营、治疗、防护、辅助倍率的羁绊不因此入池。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

羁绊 power 与 damage 的效果量乘 0.75；powerMultiplier 按 `1+(M−1)×0.75`。

描述里的“威力加成”覆盖羁绊追加伤害。资源、护盾、减伤、buffMultiplier 不直接受税。与香涎干酪 1.5 相乘的净进攻系数为 1.125。

## 关联条目

[羁绊](Synergies) · [香涎干酪](Relic-divination_candle) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L55)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
