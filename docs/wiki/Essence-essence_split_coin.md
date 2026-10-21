# 分裂金币·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7813](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7813)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计转动内获得信用点（不计取得/通关奖励）达到24：达标时立即获得12信用点。之后本局全队每次威力+0.25。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_split_coin` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `credits`：本轮转动结算内获得信用点 |
| 门槛 | 24 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(24, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

只累计本轮转动内部取得的信用点；取得奖励与过关赏金发生在进度快照之后，不算下一轮收入。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：资源收入

达标时立即获得12信用点

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 资源收入（`resource`） |
| 触发 | 取得奇物时；精华则在达标解锁时 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 信用点；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 12 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `unique`；实际加法、乘法与上限见下列结算规则 |

- 信用点收入先取max(0, 数值)；信用点保留两位小数，重掷/移除向下取整。资源存量跨轮、跨关保留。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：威力平加

之后本局全队每次威力+0.25

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.25 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

此项收益作用于共享资源或全体队伍，见[经济与补给](Economy)、[战斗公式](Combat)及[成长与星级](Growth-and-Stars)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_split_coin",
  "name": "分裂金币·精华",
  "rarity": "rare",
  "target": 24,
  "progress": {
    "metric": "credits"
  },
  "description": "取得后累计转动内获得信用点（不计取得/通关奖励）达到24：达标时立即获得12信用点。之后本局全队每次威力+0.25。",
  "effects": [
    {
      "type": "resource",
      "summary": "达标时立即获得12信用点",
      "trigger": "acquire",
      "duration": "resource",
      "target": "team",
      "stacking": "unique",
      "value": 12,
      "resource": "coins"
    },
    {
      "type": "power",
      "summary": "之后本局全队每次威力+0.25",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "additive",
      "value": 0.25
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
