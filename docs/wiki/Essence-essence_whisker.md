# 一撮胡须火药·精华

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:8443](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L8443)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

取得后累计造成伤害达到220：之后本局扩散角色每次威力+0.8。

## 基础数据

| 项目 | 内容 |
| --- | --- |
| ID | `essence_whisker` |
| 稀有度 | 史诗 |
| 取得 | 每3关过关后的精华三选一，已持有ID不重复进入候选 |
| 同名持有 | 正常流程最多一份；不同ID的效果可按各自规则叠加 |

## 取得、积累与解锁

| 字段 | 规则 |
| --- | --- |
| 进度指标 | `damage`：本轮累计对敌实际伤害 |
| 门槛 | 220 |
| 初始状态 | progress=0、triggered=false；取得前历史不追溯 |
| 触发 | 每次转动结算且列车仍存活时，进度=min(220, 旧进度+本轮指标×进度倍率)，四舍五入到两位小数；达到门槛后 triggered=true，仅一次 |

累计本轮对敌实际伤害；装甲减免、敌人残血截断后计数，不计空打威力。

进度统一读取当前完整转动的快照，先为全部未触发精华计算进度，再逐个发放解锁奖励；同轮新解锁的进度倍率不会加速其他精华的本轮进度，取得奖励也不会互相喂进度。进度倍率=精华缓释（有则0.75）×所有适用奇物/已解锁精华的进度倍率。致死转动不更新精华；达标不能复活列车。

达标的acquire效果立即执行；持续威力从后续转动开始使用。见[效果时序](Effects-and-Timing)与[src/engine.js:554–591](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L554-L591)。

## 效果明细

### 技能 1：威力平加

之后本局扩散角色每次威力+0.8

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 本次登场队伍 |
| 目标筛选 | 攻击形态为[扩散](Cards#attack) |
| 基础数值公式 | 0.8 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 攻击形态为[扩散](Cards#attack)：[姬子](Card-1003)、[阿兰](Card-1008)、[克拉拉](Card-1107)、[虎克](Card-1109)、[刃](Card-1205)、[青雀](Card-1201)、[镜流](Card-1212)、[雪衣](Card-1214)、[云璃](Card-1221)、[流萤](Card-1310)、[米沙](Card-1312)、[万敌](Card-1404)、[白厄](Card-1408)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[长夜月](Card-evernight)、[Saber](Card-saber)、[火花](Card-sparxie)、[千冶·刃](Card-mortenax_blade)、[吉尔伽美什](Card-announced_gilgamesh)。

## 精确数据

字段名和未默认化的参数保留如下；标记为legacy的项按上文专用实现执行。完整非美术快照另保存在来源仓库的`docs/wiki/data/content-v0.7.0.json`，各条目的数值亦完整保留在本页中。

```json
{
  "id": "essence_whisker",
  "name": "一撮胡须火药·精华",
  "rarity": "rare",
  "target": 220,
  "progress": {
    "metric": "damage"
  },
  "description": "取得后累计造成伤害达到220：之后本局扩散角色每次威力+0.8。",
  "effects": [
    {
      "type": "power",
      "summary": "之后本局扩散角色每次威力+0.8",
      "trigger": "passive",
      "duration": "run",
      "target": "team",
      "stacking": "additive",
      "value": 0.8,
      "filter": {
        "attack": "blast"
      }
    }
  ],
  "adaptation": "本作条件解锁改编"
}
```
