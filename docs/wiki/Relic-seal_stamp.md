# 公司咕咕钟

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:6288](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L6288)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

若取得时战斗尚未结束，本关立即多1次转动；持有期间每个新关也多1次转动。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `seal_stamp` |
| 稀有度 | 普通 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：增加本关转动次数

若取得时仍在战斗中，本关立即增加1次转动

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 增加本关转动次数（`extraSpin`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**取得时若 pendingFloor=false，spinsLeft 与 encounter.deadline 各加1；若正在领取过关奖励，仅由下一关初始期限公式获得额外1次。未来每关初始化转动期限加1，不跨关累加。**

### 技能 2：增加本关转动次数

持有期间，每个新关的转动上限+1

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 增加本关转动次数（`extraSpin`） |
| 触发 | 新关初始化时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1 |
| 持续 | 本关 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**取得时若 pendingFloor=false，spinsLeft 与 encounter.deadline 各加1；若正在领取过关奖励，仅由下一关初始期限公式获得额外1次。未来每关初始化转动期限加1，不跨关累加。**

## 专用实现与复原注意

取得时若 pendingFloor=false，spinsLeft 与 encounter.deadline 各加1；若正在领取过关奖励，仅由下一关初始期限公式获得额外1次。未来每关初始化转动期限加1，不跨关累加。

此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见[src/engine.js:265–293](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L293)、[src/engine.js:372–391](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L372-L391)、[src/engine.js:532–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L532-L591)、[src/engine.js:756–863](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L756-L863)与[src/engine.js:937–963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L937-L963)。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "seal_stamp",
  "name": "公司咕咕钟",
  "rarity": "common",
  "description": "若取得时战斗尚未结束，本关立即多1次转动；持有期间每个新关也多1次转动。",
  "effects": [
    {
      "type": "extraSpin",
      "summary": "若取得时仍在战斗中，本关立即增加1次转动",
      "trigger": "acquire",
      "duration": "resource",
      "target": "team",
      "stacking": "unique",
      "value": 1,
      "legacy": true
    },
    {
      "type": "extraSpin",
      "summary": "持有期间，每个新关的转动上限+1",
      "trigger": "floor",
      "duration": "encounter",
      "target": "team",
      "stacking": "unique",
      "value": 1,
      "legacy": true
    }
  ],
  "adaptation": "本作改编机制"
}
```
