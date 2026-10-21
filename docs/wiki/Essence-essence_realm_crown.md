# 换境桂冠·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:8179](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L8179)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计实际获得护盾达到35：达标时立即获得12基础护盾。之后本局存护防御者的护盾获取量×1.15。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_realm_crown` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `shield`：本轮转动内实际新增护盾 |
| 门槛 | 35 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(35, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

累计本轮转动内实际获得护盾，受护盾上限截断；补给与入关赠盾不作为下一轮进度，衰减和抵挡量不会倒扣此项。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：获得护盾

达标时立即获得12基础护盾

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 获得护盾（`shield`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 12 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

- 经过护盾倍率与折价后加入护盾，存量上限为生命上限×2；入关或解锁奖励发生于转动进度观察之外，不反向推进当轮或下一轮的精华护盾进度。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：护盾量倍率

之后本局存护防御者的护盾获取量×1.15

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 护盾量倍率（`shieldMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 匹配的收益来源/成长受体，按调用点检查；目标域为本次登场队伍；命途为[存护](Synergy-preservation)，且主职能为[防御](Cards#role) |
| 目标筛选 | 命途为[存护](Synergy-preservation)，且主职能为[防御](Cards#role) |
| 基础数值公式 | 1.15 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 不同已持有来源的适用倍率相乘；每次对应收益调用时重新求值，不把倍率本身逐轮再乘入存档。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 命途为[存护](Synergy-preservation)，且主职能为[防御](Cards#role)：[三月七](Card-1001)、[杰帕德](Card-1104)、[符玄](Card-1208)、[砂金](Card-1304)、[丹恒·腾荒](Card-dan_heng_pt)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_realm_crown",
  "name": "换境桂冠·精华",
  "rarity": "rare",
  "target": 35,
  "progress": {
    "metric": "shield"
  },
  "description": "取得后累计实际获得护盾达到35：达标时立即获得12基础护盾。之后本局存护防御者的护盾获取量×1.15。",
  "effects": [
    {
      "type": "shield",
      "summary": "达标时立即获得12基础护盾",
      "trigger": "acquire",
      "duration": "resource",
      "target": "team",
      "stacking": "unique",
      "value": 12
    },
    {
      "type": "shieldMultiplier",
      "summary": "之后本局存护防御者的护盾获取量×1.15",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.15,
      "filter": {
        "path": "存护",
        "role": "defense"
      }
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
