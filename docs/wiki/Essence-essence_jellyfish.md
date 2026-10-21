# 「楼梯上的水母」·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:8505](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L8505)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计生效羁绊数达到16：达标时立即获得2次重掷。之后本局其余未触发精华的进度获取量×1.1。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_jellyfish` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `synergies`：本轮激活的正式羁绊条目数 |
| 门槛 | 16 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(16, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

每轮按编队激活的羁绊条目数累计；高档仍只算该条1个，非本轮真正触发的技能条数。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：资源收入

达标时立即获得2次重掷

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 资源收入（`resource`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 重掷机会；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 2 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

- 重掷机会收入先取max(0, 数值)；信用点保留两位小数，重掷/移除向下取整。资源存量跨轮、跨关保留。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：未解锁精华进度倍率

之后本局其余未触发精华的进度获取量×1.1

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 未解锁精华进度倍率（`essenceProgressMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 尚未触发的精华，本次转动末统一快照计算 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1.1 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 不同已持有来源的适用倍率相乘；每次对应收益调用时重新求值，不把倍率本身逐轮再乘入存档。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_jellyfish",
  "name": "「楼梯上的水母」·精华",
  "rarity": "rare",
  "target": 16,
  "progress": {
    "metric": "synergies"
  },
  "description": "取得后累计生效羁绊数达到16：达标时立即获得2次重掷。之后本局其余未触发精华的进度获取量×1.1。",
  "effects": [
    {
      "type": "resource",
      "summary": "达标时立即获得2次重掷",
      "trigger": "acquire",
      "duration": "resource",
      "target": "team",
      "stacking": "unique",
      "value": 2,
      "resource": "rerolls"
    },
    {
      "type": "essenceProgressMultiplier",
      "summary": "之后本局其余未触发精华的进度获取量×1.1",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.1
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
