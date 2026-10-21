# 朋克洛德精神·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:7917](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L7917)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计消费信用点达到24：之后本局单体角色每次威力×1.15。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_punklorde` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `creditsSpent`：取得精华后实际消费信用点总量 |
| 门槛 | 24 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(24, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

取得时记录总消费信用点基线；之后付费重掷、补给等实际支出累计，在下一次存活转动末读取差值。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：威力倍率

之后本局单体角色每次威力×1.15

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 攻击形态为[单体](Cards#attack) |
| 基础数值公式 | 1.15 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 与其他适用威力倍率相乘；自身条件倍率不占即时增幅角色共同×2.2的上限。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 攻击形态为[单体](Cards#attack)：[丹恒](Card-1002)、[希儿](Card-1102)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[彦卿](Card-1209)、[飞霄](Card-1220)、[貊泽](Card-1223)、[真理医生](Card-1305)、[波提欧](Card-1315)、[阿格莱雅](Card-1402)、[三月七·巡猎](Card-march_hunt)、[Archer](Card-archer)、[不死途](Card-ashveil)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_punklorde",
  "name": "朋克洛德精神·精华",
  "rarity": "rare",
  "target": 24,
  "progress": {
    "metric": "creditsSpent"
  },
  "description": "取得后累计消费信用点达到24：之后本局单体角色每次威力×1.15。",
  "effects": [
    {
      "type": "powerMultiplier",
      "summary": "之后本局单体角色每次威力×1.15",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "multiplicative",
      "value": 1.15,
      "filter": {
        "attack": "single"
      }
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
