# 爻光

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4759](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4759)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每第2次登场，同列的其他欢愉或仙舟永久非培养伙伴中，威力最高1人永久成长+0.4。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `yao_guang` |
| 英文名 | Yao Guang |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [永久培养](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [欢愉](Cards#path) |
| 属性 | [物理](Synergy-physical) |
| 阵营 | [仙舟玉阙](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。永久培养主职能：基础威力不加成长；常规赠送培养的筛选排除培养主持，赠送量不自乘培养系数。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：永久成长

每第2次登场，同列的其他欢愉或仙舟永久非培养伙伴中，威力最高1人永久成长+0.4

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 永久成长（`growth`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源同列四格（再应用筛选）；范围内按当前威力降序选择，平手格号小者优先；最多1名 |
| 目标筛选 | （命途为[欢愉](Cards#path) 或 阵营为[仙舟罗浮](Synergy-xianzhou) 或 阵营为[仙舟曜青](Cards#faction) 或 阵营为[仙舟朱明](Cards#faction) 或 阵营为[仙舟玉阙](Cards#faction)），且主职能不为[永久培养](Cards#role)，且非临时实例（此字段本身不排除见习），且排除见习委派，且排除来源同一 UID 实例 |
| 基础数值公式 | 0.4 × 星级系数[1 / 1.5 / 2] |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 写入编队中同UID且非临时的原实例；通用入口本身不排除见习或培养主职，目标筛选另行决定是否排除它们。例如丹恒见习可以触发自身成长，但专业培养者的受体筛选排除见习。新成长再乘齿轮、成长折旧和适用成长倍率；两位小数保存，本轮攻击威力/可培养技能即可使用更新后的成长。成长赠送量不会被来源自己的培养倍率放大。
- every=2：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 无升星差额税时，1/2/3星技能系数分别为1 / 1.5 / 2；若星级审计生效，高星系数额外×0.8。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[坚韧编队](Synergy-physical)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[欢愉](Cards#path) 或 阵营为[仙舟罗浮](Synergy-xianzhou) 或 阵营为[仙舟曜青](Cards#faction) 或 阵营为[仙舟朱明](Cards#faction) 或 阵营为[仙舟玉阙](Cards#faction)），且主职能不为[永久培养](Cards#role)，且非临时实例（此字段本身不排除见习），且排除见习委派，且排除来源同一 UID 实例：[景元](Card-1204)、[罗刹](Card-1203)、[符玄](Card-1208)、[青雀](Card-1201)、[停云](Card-1202)、[素裳](Card-1206)、[彦卿](Card-1209)、[桂乃芬](Card-1210)、[白露](Card-1211)、[镜流](Card-1212)、[雪衣](Card-1214)、[藿藿](Card-1217)、[椒丘](Card-1218)、[飞霄](Card-1220)、[云璃](Card-1221)、[灵砂](Card-1222)、[貊泽](Card-1223)、[忘归人](Card-fugue)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 共享至少一个命途、属性或阵营标签：[娜塔莎](Card-1105)、[克拉拉](Card-1107)、[卢卡](Card-1111)、[素裳](Card-1206)、[寒鸦](Card-1215)、[云璃](Card-1221)、[银枝](Card-1302)、[知更鸟](Card-1309)、[波提欧](Card-1315)、[白厄](Card-1408)、[丹恒·腾荒](Card-dan_heng_pt)、[海瑟音](Card-hysilens)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[阿哈](Card-aha)、[真珠](Card-pearl)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "yao_guang",
  "name": "爻光",
  "enName": "Yao Guang",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "欢愉",
  "element": "物理",
  "faction": "仙舟玉阙",
  "description": "每第2次登场，同列的其他欢愉或仙舟永久非培养伙伴中，威力最高1人永久成长+0.4。",
  "effects": [
    {
      "type": "growth",
      "value": 0.4,
      "summary": "每第2次登场，同列的其他欢愉或仙舟永久非培养伙伴中，威力最高1人永久成长+0.4",
      "trigger": "appearance",
      "duration": "run",
      "target": "column",
      "stacking": "additive",
      "every": 2,
      "targetLimit": 1,
      "selection": "strongest",
      "scaleWithStars": true,
      "starFactors": [
        0,
        1,
        1.5,
        2
      ],
      "filter": {
        "anyOf": [
          {
            "path": "欢愉"
          },
          {
            "faction": "仙舟罗浮"
          },
          {
            "faction": "仙舟曜青"
          },
          {
            "faction": "仙舟朱明"
          },
          {
            "faction": "仙舟玉阙"
          }
        ],
        "excludeSelf": true,
        "roleNot": "trainer",
        "temporary": false,
        "commission": false
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yao_Guang",
  "kitVersion": 6,
  "role": "trainer",
  "roleLabel": "永久培养"
}
```
