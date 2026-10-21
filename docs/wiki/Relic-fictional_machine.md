# 虚构机兵

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7126](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7126)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每次转动至少登场3名存护角色时，获得3护盾。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `fictional_machine` |
| 稀有度 | 稀有 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：获得护盾

每次转动至少登场3名存护角色时，获得3护盾

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 获得护盾（`shield`） |
| 触发 | 每次转动一次 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 本轮尚未被消耗且符合筛选的登场实例数（命途为[存护](Synergy-preservation)）≥3 |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 3 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 经过护盾倍率与折价后加入护盾，存量上限为生命上限×2；实际获得量用于本轮护盾进度。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 命途为[存护](Synergy-preservation)：[三月七](Card-1001)、[杰帕德](Card-1104)、[符玄](Card-1208)、[砂金](Card-1304)、[丹恒·腾荒](Card-dan_heng_pt)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "fictional_machine",
  "name": "虚构机兵",
  "rarity": "uncommon",
  "description": "每次转动至少登场3名存护角色时，获得3护盾。",
  "effects": [
    {
      "type": "shield",
      "summary": "每次转动至少登场3名存护角色时，获得3护盾",
      "trigger": "spin",
      "duration": "resource",
      "target": "team",
      "stacking": "additive",
      "value": 3,
      "condition": {
        "metric": "present",
        "op": "gte",
        "value": 3,
        "filter": {
          "path": "存护"
        }
      }
    }
  ],
  "adaptation": "本作改编机制"
}
```
