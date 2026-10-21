# 绯英

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:5036](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L5036)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

同行的欢愉或物理攻击者本轮威力×1.45。相邻的存护或欢愉防御者护盾获取量×1.2。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `evanescia` |
| 英文名 | Evanescia |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [即时增幅](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [欢愉](Cards#path) |
| 属性 | [物理](Synergy-physical) |
| 阵营 | [二相乐园](Cards#faction) |
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

同行的欢愉或物理攻击者本轮威力×1.45

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源同行五格（再应用筛选） |
| 目标筛选 | （命途为[欢愉](Cards#path) 或 属性为[物理](Synergy-physical)），且主职能为[攻击](Cards#role) |
| 基础数值公式 | max(0.05, 1 + (1.45 − 1) × T) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 只放大本轮威力；同一目标受到现代即时增幅者的倍率相乘后共同封顶×2.2，超出的部分不生效。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

### 技能 2：护盾量倍率

相邻的存护或欢愉防御者护盾获取量×1.2

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 护盾量倍率（`shieldMultiplier`） |
| 触发 | 持有并满足条件时参与相应计算 |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 匹配的收益来源/成长受体，按调用点检查；目标域为来源相邻八格；（命途为[存护](Synergy-preservation) 或 命途为[欢愉](Cards#path)），且主职能为[防御](Cards#role) |
| 目标筛选 | （命途为[存护](Synergy-preservation) 或 命途为[欢愉](Cards#path)），且主职能为[防御](Cards#role) |
| 基础数值公式 | max(0.05, 1 + (1.2 − 1) × T) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 不同已持有来源的适用倍率相乘；每次对应收益调用时重新求值，不把倍率本身逐轮再乘入存档。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[坚韧编队](Synergy-physical)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[欢愉](Cards#path) 或 属性为[物理](Synergy-physical)），且主职能为[攻击](Cards#role)：[克拉拉](Card-1107)、[素裳](Card-1206)、[云璃](Card-1221)、[银枝](Card-1302)、[波提欧](Card-1315)、[白厄](Card-1408)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)。
- （命途为[存护](Synergy-preservation) 或 命途为[欢愉](Cards#path)），且主职能为[防御](Cards#role)：[三月七](Card-1001)、[杰帕德](Card-1104)、[符玄](Card-1208)、[砂金](Card-1304)、[丹恒·腾荒](Card-dan_heng_pt)、[砂金·戏浪](Card-aventurine_waveflair)。
- 共享至少一个命途、属性或阵营标签：[娜塔莎](Card-1105)、[克拉拉](Card-1107)、[卢卡](Card-1111)、[素裳](Card-1206)、[寒鸦](Card-1215)、[云璃](Card-1221)、[银枝](Card-1302)、[知更鸟](Card-1309)、[波提欧](Card-1315)、[白厄](Card-1408)、[丹恒·腾荒](Card-dan_heng_pt)、[海瑟音](Card-hysilens)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)、[阿哈](Card-aha)、[真珠](Card-pearl)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "evanescia",
  "name": "绯英",
  "enName": "Evanescia",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "欢愉",
  "element": "物理",
  "faction": "二相乐园",
  "description": "同行的欢愉或物理攻击者本轮威力×1.45。相邻的存护或欢愉防御者护盾获取量×1.2。",
  "effects": [
    {
      "type": "powerMultiplier",
      "value": 1.45,
      "summary": "同行的欢愉或物理攻击者本轮威力×1.45",
      "trigger": "appearance",
      "duration": "spin",
      "target": "row",
      "stacking": "multiplicative",
      "scaleWithTraining": true,
      "filter": {
        "role": "attack",
        "anyOf": [
          {
            "path": "欢愉"
          },
          {
            "element": "物理"
          }
        ]
      }
    },
    {
      "type": "shieldMultiplier",
      "value": 1.2,
      "summary": "相邻的存护或欢愉防御者护盾获取量×1.2",
      "trigger": "passive",
      "duration": "spin",
      "target": "adjacent",
      "stacking": "multiplicative",
      "scaleWithTraining": true,
      "filter": {
        "role": "defense",
        "anyOf": [
          {
            "path": "存护"
          },
          {
            "path": "欢愉"
          }
        ]
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Evanescia",
  "kitVersion": 6,
  "role": "amplifier",
  "roleLabel": "即时辅助"
}
```
