# 裂界污染

[首页](Home) › [敌方条款](Enemy-Effects)

> 指定一星实例实际登场时直接消耗 6 生命，自身威力降低 50%，本轮全队攻击角色最终威力降低 15%；辅助治疗和护盾不受此影响。移除或合成该实例可解除，仅本关有效。

| 项目 | 规则 |
| --- | --- |
| 识别码 | `rift_pollution` |
| 来源 | 固定污染层，source=difficulty，addedRound=0 |
| 持续 | 当前遭遇；换关清空；指定实例消失/完成合成可提前解除 |
| 重复 | 同 id 不重复随机选中 |

## 获得资格

固定出现在第 4、6、8、10、12 层入关；必须存在非临时一星实例。它不进入随机条款池。

除固定污染外，资格只决定选取时的候选池，条款出现后仍按自身实际触发条件运作。完整抽选和资格口径见[敌方条款通则](Enemy-Effects)。

## 实际效果与公式

被标记 UID 真正抽中时，先直接消耗 6 生命（不经护盾），最低可到 0；该实例本轮威力乘 0.5，同时全部非辅助攻击方式角色本轮最终威力统一乘 0.85。

目标按非临时一星实例的“角色基础威力＋永久成长”升序取最低，平手按英文 locale 的 UID 字符串排序；不是按数值 UID 排序。代码未排除 commission，所以见习委派也可能被标记。只标记一个实例，其他同名副本不支付 6 生命也不承担个人 0.5，但仍承担当轮全队 0.85。没有抽中目标时，扣血与全队税都不触发。个人威力税即便目标为辅助也保留，辅助治疗、护盾量不受个人或全队威力税直接影响。若扣血致死，在治疗、技能、普通攻击之前立即败北。移除、合成或委派离队后解除标记，不转移目标；换关清空。

## 关联条目

[成长与星级](Growth-and-Stars) · [委派](Assignments) · [经济](Economy) · [存档与离线](Saves-and-Offline) · [敌方条款通则](Enemy-Effects) · [难度与首领分期](Difficulty) · [效果时序](Effects-and-Timing)。

---

本页基线：**v0.7.0**，提交 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。规则来源：[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L61)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L6-L25)；[src/enemy-effects.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/enemy-effects.js#L64-L131)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L344)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L650-L684)；[src/engine.js](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L845-L886)。
