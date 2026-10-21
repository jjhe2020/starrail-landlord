# 刻律德菈

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4511](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4511)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

相邻的风或翁法罗斯攻击者中，威力最高1人本轮威力×1.6。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `cerydra` |
| 英文名 | Cerydra |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [即时增幅](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [同谐](Synergy-harmony) |
| 属性 | [风](Synergy-wind) |
| 阵营 | [翁法罗斯](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：威力倍率

相邻的风或翁法罗斯攻击者中，威力最高1人本轮威力×1.6

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源相邻八格；范围内按当前威力降序选择，平手格号小者优先；最多1名 |
| 目标筛选 | （属性为[风](Synergy-wind) 或 阵营为[翁法罗斯](Cards#faction)），且主职能为[攻击](Cards#role) |
| 基础数值公式 | max(0.05, 1 + (1.6 − 1) × T) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 只放大本轮威力；同一目标受到现代即时增幅者的倍率相乘后共同封顶×2.2，超出的部分不生效。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[同谐](Synergy-harmony)、[流风编队](Synergy-wind)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[风](Synergy-wind) 或 阵营为[翁法罗斯](Cards#faction)），且主职能为[攻击](Cards#role)：[丹恒](Card-1002)、[刃](Card-1205)、[飞霄](Card-1220)、[阿格莱雅](Card-1402)、[万敌](Card-1404)、[那刻夏](Card-1405)、[遐蝶](Card-1407)、[白厄](Card-1408)、[长夜月](Card-evernight)、[Saber](Card-saber)。
- 共享至少一个命途、属性或阵营标签：[丹恒](Card-1002)、[艾丝妲](Card-1009)、[布洛妮娅](Card-1101)、[桑博](Card-1108)、[刃](Card-1205)、[停云](Card-1202)、[驭空](Card-1207)、[寒鸦](Card-1215)、[藿藿](Card-1217)、[飞霄](Card-1220)、[阮·梅](Card-1303)、[花火](Card-1306)、[黑天鹅](Card-1307)、[知更鸟](Card-1309)、[星期日](Card-1313)、[阿格莱雅](Card-1402)、[缇宝](Card-1403)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[海瑟音](Card-hysilens)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[Saber](Card-saber)、[知更鸟·晴歌](Card-robin_summeretto)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "cerydra",
  "name": "刻律德菈",
  "enName": "Cerydra",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "同谐",
  "element": "风",
  "faction": "翁法罗斯",
  "description": "相邻的风或翁法罗斯攻击者中，威力最高1人本轮威力×1.6。",
  "effects": [
    {
      "type": "powerMultiplier",
      "value": 1.6,
      "summary": "相邻的风或翁法罗斯攻击者中，威力最高1人本轮威力×1.6",
      "trigger": "appearance",
      "duration": "spin",
      "target": "adjacent",
      "stacking": "multiplicative",
      "scaleWithTraining": true,
      "filter": {
        "role": "attack",
        "anyOf": [
          {
            "element": "风"
          },
          {
            "faction": "翁法罗斯"
          }
        ]
      },
      "selection": "strongest",
      "targetLimit": 1
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cerydra",
  "kitVersion": 6,
  "role": "amplifier",
  "roleLabel": "即时辅助"
}
```
