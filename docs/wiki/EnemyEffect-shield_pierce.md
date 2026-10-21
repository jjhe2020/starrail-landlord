# 贯穿反击

[首页](Home) › [敌方条款](Enemy-Effects)

> 敌人反击的 25% 直接损失生命，其余仍可由护盾抵挡。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `shield_pierce` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

与护盾折价相同：已有护盾或存在可用的持续护盾来源。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

设减伤后的反击为 I，直接贯穿部分 `0.25I`；可抵挡部分为 `0.75I`。实际盾挡 `B=min(已有护盾,0.75I)`，生命损失 `I−B`。

它不产生额外 25% 伤害，而是让原反击的一部分绕盾。存护羁绊反击只按 B 算；哪怕总盾足够，仍会损失贯穿部分生命。

## 关联条目

[战斗](Combat) · [存护](Synergy-preservation) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L58)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
