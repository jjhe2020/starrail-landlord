# 海绵王

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7380](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7380)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得时，本局生命上限+12。每次转动生命≤40%时，恢复2基础生命。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `sponge_king` |
| 稀有度 | 稀有 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：提高生命上限

取得时，本局生命上限+12

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 提高生命上限（`maxHp`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 12 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

- 只改变生命上限，不自动等量回血；同一解锁/取得流程仅执行一次，另列治疗效果才恢复生命。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：恢复生命

每次转动生命≤40%时，恢复2基础生命

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 恢复生命（`heal`） |
| 触发 | 每次转动一次 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 当前生命÷生命上限≤0.4 |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 2 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 请求治疗先经过治疗倍率与折价并四舍五入到两位小数；实际恢复=min(缺失生命, 请求值)。溢出不计实际治疗进度。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "sponge_king",
  "name": "海绵王",
  "rarity": "uncommon",
  "description": "取得时，本局生命上限+12。每次转动生命≤40%时，恢复2基础生命。",
  "effects": [
    {
      "type": "maxHp",
      "summary": "取得时，本局生命上限+12",
      "trigger": "acquire",
      "duration": "run",
      "target": "team",
      "stacking": "unique",
      "value": 12
    },
    {
      "type": "heal",
      "summary": "每次转动生命≤40%时，恢复2基础生命",
      "trigger": "spin",
      "duration": "resource",
      "target": "team",
      "stacking": "additive",
      "value": 2,
      "condition": {
        "metric": "hpRatio",
        "op": "lte",
        "value": 0.4
      }
    }
  ],
  "adaptation": "本作改编机制"
}
```
