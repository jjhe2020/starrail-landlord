# 鲁珀特帝国机械齿轮

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:6375](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L6375)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

持有期间，角色的永久成长获取量×1.5；已获得的成长在之后保留。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `rubert_gear` |
| 稀有度 | 史诗 |
| 取得 | 每2关过关后的奇物三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得与持续生效

取得时执行acquire一次，其余收益在持有期间的对应阶段检查。候选权重按当前关数与稀有度计算，见[招募与稀有度](Draft-and-Rarity)。奇物本身不升星，数值不会继承某名角色的星级；带筛选的效果按各自来源或受体筛选。

## 效果明细

### 技能 1：成长获取倍率

持有时，角色的永久成长获取量×1.5

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 成长获取倍率（`growthMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 匹配的收益来源/成长受体，按调用点检查；目标域为本次登场队伍 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1.5 |
| 持续 | 持有来源时持续检查；本轮威力不会逐轮永久叠加 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**角色新获得的永久成长及正式委派成长乘1.5；不追溯修改已持有成长，不把成长赠送的主持者培养量自乘。**

## 专用实现与复原注意

角色新获得的永久成长及正式委派成长乘1.5；不追溯修改已持有成长，不把成长赠送的主持者培养量自乘。

此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见[src/engine.js:265–293](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L293)、[src/engine.js:372–391](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L372-L391)、[src/engine.js:532–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L532-L591)、[src/engine.js:756–863](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L756-L863)与[src/engine.js:937–963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L937-L963)。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "rubert_gear",
  "name": "鲁珀特帝国机械齿轮",
  "rarity": "rare",
  "description": "持有期间，角色的永久成长获取量×1.5；已获得的成长在之后保留。",
  "effects": [
    {
      "type": "growthMultiplier",
      "summary": "持有时，角色的永久成长获取量×1.5",
      "trigger": "passive",
      "duration": "whileOwned",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.5,
      "legacy": true
    }
  ],
  "adaptation": "本作改编机制"
}
```
