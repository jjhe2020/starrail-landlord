# 信标着色剂

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:6872](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L6872)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `beacon_colorant` |
| 稀有度 | 稀有 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：威力平加

持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 属性为[量子](Synergy-quantum) |
| 基础数值公式 | 0.2 × min(4, max(0, 本轮尚未被消耗且符合筛选的登场实例数（属性为[虚数](Synergy-imaginary)）)) |
| 持续 | 持有来源时持续检查；本轮威力不会逐轮永久叠加 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 属性为[量子](Synergy-quantum)：[银狼](Card-1006)、[希儿](Card-1102)、[符玄](Card-1208)、[青雀](Card-1201)、[玲可](Card-1110)、[雪衣](Card-1214)、[花火](Card-1306)、[翡翠](Card-1314)、[缇宝](Card-1403)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[Archer](Card-archer)、[远坂凛](Card-announced_rin_tohsaka)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 属性为[虚数](Synergy-imaginary)：[瓦尔特](Card-1004)、[罗刹](Card-1203)、[驭空](Card-1207)、[砂金](Card-1304)、[真理医生](Card-1305)、[星期日](Card-1313)、[乱破](Card-1317)、[万敌](Card-1404)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[银狼LV.999](Card-silver_wolf_lv999)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "beacon_colorant",
  "name": "信标着色剂",
  "rarity": "uncommon",
  "description": "持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）。",
  "effects": [
    {
      "type": "power",
      "summary": "持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）",
      "trigger": "passive",
      "duration": "whileOwned",
      "target": "team",
      "stacking": "additive",
      "value": 0.2,
      "filter": {
        "element": "量子"
      },
      "per": {
        "metric": "present",
        "filter": {
          "element": "虚数"
        },
        "cap": 4
      }
    }
  ],
  "adaptation": "本作改编机制"
}
```
