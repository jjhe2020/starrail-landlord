# 空无烛剪·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7884](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7884)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计使用移除达到3：之后本局，永久编队≤18人时全队每次威力+0.7。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_void_wick` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `removals`：取得精华后实际使用移除次数 |
| 门槛 | 3 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(3, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

取得时记录移除使用总计基线，每轮末读取新增使用次数；拥有但没使用的机会不算。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：威力平加

之后本局，永久编队≤18人时全队每次威力+0.7

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 编队中符合筛选的实例数（非临时实例（此字段本身不排除见习））≤18 |
| 目标 | 本次登场队伍 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.7 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 非临时实例（此字段本身不排除见习）：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[卡芙卡](Card-1005)、[银狼](Card-1006)、[阿兰](Card-1008)、[艾丝妲](Card-1009)、[黑塔](Card-1013)、[布洛妮娅](Card-1101)、[希儿](Card-1102)、[希露瓦](Card-1103)、[杰帕德](Card-1104)、[娜塔莎](Card-1105)、[佩拉](Card-1106)、[克拉拉](Card-1107)、[桑博](Card-1108)、[虎克](Card-1109)、[刃](Card-1205)、[景元](Card-1204)、[罗刹](Card-1203)、[符玄](Card-1208)、[青雀](Card-1201)、[停云](Card-1202)、[玲可](Card-1110)、[卢卡](Card-1111)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[驭空](Card-1207)、[彦卿](Card-1209)、[桂乃芬](Card-1210)、[白露](Card-1211)、[镜流](Card-1212)、[雪衣](Card-1214)、[寒鸦](Card-1215)、[藿藿](Card-1217)、[椒丘](Card-1218)、[飞霄](Card-1220)、[云璃](Card-1221)、[灵砂](Card-1222)、[貊泽](Card-1223)、[加拉赫](Card-1301)、[银枝](Card-1302)、[阮·梅](Card-1303)、[砂金](Card-1304)、[真理医生](Card-1305)、[花火](Card-1306)、[黑天鹅](Card-1307)、[黄泉](Card-1308)、[知更鸟](Card-1309)、[流萤](Card-1310)、[米沙](Card-1312)、[星期日](Card-1313)、[翡翠](Card-1314)、[波提欧](Card-1315)、[乱破](Card-1317)、[阿格莱雅](Card-1402)、[缇宝](Card-1403)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[丹恒·腾荒](Card-dan_heng_pt)、[忘归人](Card-fugue)、[大黑塔](Card-the_herta)、[海瑟音](Card-hysilens)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[Saber](Card-saber)、[Archer](Card-archer)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[不死途](Card-ashveil)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[千冶·刃](Card-mortenax_blade)、[大丽花](Card-the_dahlia)、[姬子·启行](Card-announced_himeko_nova)、[吉尔伽美什](Card-announced_gilgamesh)、[远坂凛](Card-announced_rin_tohsaka)、[阿哈](Card-aha)、[真珠](Card-pearl)、[知更鸟·晴歌](Card-robin_summeretto)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_void_wick",
  "name": "空无烛剪·精华",
  "rarity": "rare",
  "target": 3,
  "progress": {
    "metric": "removals"
  },
  "description": "取得后累计使用移除达到3：之后本局，永久编队≤18人时全队每次威力+0.7。",
  "effects": [
    {
      "type": "power",
      "summary": "之后本局，永久编队≤18人时全队每次威力+0.7",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "additive",
      "value": 0.7,
      "condition": {
        "metric": "roster",
        "op": "lte",
        "value": 18,
        "filter": {
          "temporary": false
        }
      }
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
