# 升星差额税

[首页](Home) › [敌方条款](Enemy-Effects)

> 二星、三星的基础威力和角色技能倍率降低 20%；不会降星。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `star_audit` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

编队存在星级大于 1 的实例。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

二星/三星有效标准星级倍率由 3/9 变为 2.4/7.2，即乘 0.8；一星仍为 1。

凡通过 starMultiplier 的基础威力或 scaleWithStars 技能都受影响；自定义星级因子也通过实际/标准倍率换算而乘 0.8。永久成长余额不直接减为 80%，没有 scaleWithStars 的固定倍率技能不因这条款自动降低。羁绊按星级的威力平加与委派当轮奖励也会使用此有效倍率。

## 关联条目

[成长与星级](Growth-and-Stars) · [委派](Assignments) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L42)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
