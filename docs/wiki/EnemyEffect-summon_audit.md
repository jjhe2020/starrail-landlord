# 追击登记

[首页](Home) › [敌方条款](Enemy-Effects)

> 角色技能造成的追加伤害降低 25%；普通攻击不受影响。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `summon_audit` |
| 来源 | 难度入关条款或首领分期追加 |
| 持续 | 当前遭遇；换关清空 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

编队至少一位角色的技能定义含 damage；只持有奇物或羁绊追加伤害不会因此入池。名称“追击登记”不是召唤被削弱。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

所有当前角色定义的 damage 技能伤害量乘 0.75。

只针对 character 来源的追加伤害；普通攻击、羁绊 damage、奇物 damage 不直接乘此系数。与虎克/黑塔/希儿专属追加税可乘算为 0.375。

## 关联条目

[战斗](Combat) · [鼹鼠追击税](EnemyEffect-consume_audit) · [黑塔转动折损](EnemyEffect-herta_audit) · [再现滞留](EnemyEffect-seele_audit) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L43)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L72-L194)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
