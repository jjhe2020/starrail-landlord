# 「楼梯上的水母」

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7510](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7510)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

持有时，未触发精华的进度获取量×1.15。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `stair_jellyfish` |
| 稀有度 | 稀有 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：未解锁精华进度倍率

持有时，未触发精华的进度获取量×1.15

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 未解锁精华进度倍率（`essenceProgressMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 尚未触发的精华，本次转动末统一快照计算 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1.15 |
| 持续 | 持有来源时持续检查；本轮威力不会逐轮永久叠加 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 不同已持有来源的适用倍率相乘；每次对应收益调用时重新求值，不把倍率本身逐轮再乘入存档。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "stair_jellyfish",
  "name": "「楼梯上的水母」",
  "rarity": "uncommon",
  "description": "持有时，未触发精华的进度获取量×1.15。",
  "effects": [
    {
      "type": "essenceProgressMultiplier",
      "summary": "持有时，未触发精华的进度获取量×1.15",
      "trigger": "passive",
      "duration": "whileOwned",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.15
    }
  ],
  "adaptation": "本作改编机制"
}
```
