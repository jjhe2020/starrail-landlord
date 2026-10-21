# 纯美骑士精神·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7711](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7711)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队威力×1.1，本局持续。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_harmony` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `synergies`：本轮激活的正式羁绊条目数 |
| 门槛 | 12 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(12, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

每轮按编队激活的羁绊条目数累计；高档仍只算该条1个，非本轮真正触发的技能条数。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：资源收入

达标时立即获得3次重掷

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 资源收入（`resource`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 重掷机会；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 3 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**解锁瞬间共享重掷加3；后续转动全队最终威力乘1.1。**

### 技能 2：威力倍率

达标后从下次转动起，本局全队威力×1.1

**此项带legacy标记，下表保留展示元数据，真实执行以表后专用规则为准。通用解释器不会执行此表一次。**

| 字段 | 展示元数据（专用规则见下） |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1.1 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

实际专用规则：**解锁瞬间共享重掷加3；后续转动全队最终威力乘1.1。**

## 专用实现与复原注意

解锁瞬间共享重掷加3；后续转动全队最终威力乘1.1。

此来源的legacy元数据供展示使用，通用解释器不会再次执行，复原时必须避免把专用分支与元数据都结算一遍。专用分支参见[src/engine.js:265–293](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L265-L293)、[src/engine.js:372–391](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L372-L391)、[src/engine.js:532–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L532-L591)、[src/engine.js:756–863](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L756-L863)与[src/engine.js:937–963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L937-L963)。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_harmony",
  "name": "纯美骑士精神·精华",
  "rarity": "rare",
  "target": 12,
  "description": "取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队威力×1.1，本局持续。",
  "progress": {
    "metric": "synergies"
  },
  "effects": [
    {
      "type": "resource",
      "summary": "达标时立即获得3次重掷",
      "trigger": "acquire",
      "duration": "resource",
      "target": "team",
      "stacking": "unique",
      "value": 3,
      "resource": "rerolls",
      "legacy": true
    },
    {
      "type": "powerMultiplier",
      "summary": "达标后从下次转动起，本局全队威力×1.1",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.1,
      "legacy": true
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
