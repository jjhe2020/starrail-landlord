# 毁灭火漆

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:6027](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L6027)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

持有期间，扩散攻击角色每次威力×1.25。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `destruction_wax` |
| 稀有度 | 稀有 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：威力倍率

持有时，扩散角色每次威力×1.25

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 攻击形态为[扩散](Cards#attack) |
| 基础数值公式 | 1.25 |
| 持续 | 持有来源时持续检查；本轮威力不会逐轮永久叠加 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**扩散形态角色最终威力乘1.25；按攻击形态而非毁灭命途筛选。**

## 专用实现与复原注意

扩散形态角色最终威力乘1.25；按攻击形态而非毁灭命途筛选。

此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见[src/engine.js:265–293](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L293)、[src/engine.js:372–391](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L372-L391)、[src/engine.js:532–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L532-L591)、[src/engine.js:756–863](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L756-L863)与[src/engine.js:937–963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L937-L963)。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 攻击形态为[扩散](Cards#attack)：[姬子](Card-1003)、[阿兰](Card-1008)、[克拉拉](Card-1107)、[虎克](Card-1109)、[刃](Card-1205)、[青雀](Card-1201)、[镜流](Card-1212)、[雪衣](Card-1214)、[云璃](Card-1221)、[流萤](Card-1310)、[米沙](Card-1312)、[万敌](Card-1404)、[白厄](Card-1408)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[长夜月](Card-evernight)、[Saber](Card-saber)、[火花](Card-sparxie)、[千冶·刃](Card-mortenax_blade)、[吉尔伽美什](Card-announced_gilgamesh)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "destruction_wax",
  "name": "毁灭火漆",
  "rarity": "uncommon",
  "description": "持有期间，扩散攻击角色每次威力×1.25。",
  "effects": [
    {
      "type": "powerMultiplier",
      "summary": "持有时，扩散角色每次威力×1.25",
      "trigger": "passive",
      "duration": "whileOwned",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.25,
      "filter": {
        "attack": "blast"
      },
      "legacy": true
    }
  ],
  "adaptation": "本作改编机制"
}
```
