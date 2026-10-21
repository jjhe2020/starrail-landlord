# 博士之袍

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:6166](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L6166)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

持有期间，二星和三星角色的本次威力×1.2。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `doctor_robe` |
| 稀有度 | 史诗 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：威力倍率

持有时，二星、三星角色每次威力×1.2

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 至少2星 |
| 基础数值公式 | 1.2 |
| 持续 | 持有来源时持续检查；本轮威力不会逐轮永久叠加 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**二星和三星角色最终威力乘1.2，不随星级再变为3倍或9倍。**

## 专用实现与复原注意

二星和三星角色最终威力乘1.2，不随星级再变为3倍或9倍。

此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见[src/engine.js:265–293](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L293)、[src/engine.js:372–391](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L372-L391)、[src/engine.js:532–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L532-L591)、[src/engine.js:756–863](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L756-L863)与[src/engine.js:937–963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L937-L963)。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 至少2星：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[卡芙卡](Card-1005)、[银狼](Card-1006)、[阿兰](Card-1008)、[艾丝妲](Card-1009)、[黑塔](Card-1013)、[布洛妮娅](Card-1101)、[希儿](Card-1102)、[希露瓦](Card-1103)、[杰帕德](Card-1104)、[娜塔莎](Card-1105)、[佩拉](Card-1106)、[克拉拉](Card-1107)、[桑博](Card-1108)、[虎克](Card-1109)、[刃](Card-1205)、[景元](Card-1204)、[罗刹](Card-1203)、[符玄](Card-1208)、[青雀](Card-1201)、[停云](Card-1202)、[玲可](Card-1110)、[卢卡](Card-1111)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[驭空](Card-1207)、[彦卿](Card-1209)、[桂乃芬](Card-1210)、[白露](Card-1211)、[镜流](Card-1212)、[雪衣](Card-1214)、[寒鸦](Card-1215)、[藿藿](Card-1217)、[椒丘](Card-1218)、[飞霄](Card-1220)、[云璃](Card-1221)、[灵砂](Card-1222)、[貊泽](Card-1223)、[加拉赫](Card-1301)、[银枝](Card-1302)、[阮·梅](Card-1303)、[砂金](Card-1304)、[真理医生](Card-1305)、[花火](Card-1306)、[黑天鹅](Card-1307)、[黄泉](Card-1308)、[知更鸟](Card-1309)、[流萤](Card-1310)、[米沙](Card-1312)、[星期日](Card-1313)、[翡翠](Card-1314)、[波提欧](Card-1315)、[乱破](Card-1317)、[阿格莱雅](Card-1402)、[缇宝](Card-1403)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[丹恒·腾荒](Card-dan_heng_pt)、[忘归人](Card-fugue)、[大黑塔](Card-the_herta)、[海瑟音](Card-hysilens)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[Saber](Card-saber)、[Archer](Card-archer)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[不死途](Card-ashveil)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[千冶·刃](Card-mortenax_blade)、[大丽花](Card-the_dahlia)、[姬子·启行](Card-announced_himeko_nova)、[吉尔伽美什](Card-announced_gilgamesh)、[远坂凛](Card-announced_rin_tohsaka)、[阿哈](Card-aha)、[真珠](Card-pearl)、[知更鸟·晴歌](Card-robin_summeretto)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "doctor_robe",
  "name": "博士之袍",
  "rarity": "rare",
  "description": "持有期间，二星和三星角色的本次威力×1.2。",
  "effects": [
    {
      "type": "powerMultiplier",
      "summary": "持有时，二星、三星角色每次威力×1.2",
      "trigger": "passive",
      "duration": "whileOwned",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.2,
      "filter": {
        "starsMin": 2
      },
      "legacy": true
    }
  ],
  "adaptation": "本作改编机制"
}
```
