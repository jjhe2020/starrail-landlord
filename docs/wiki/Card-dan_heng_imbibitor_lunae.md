# 丹恒·饮月

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4200)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名同行的其他虚数或毁灭伙伴使本次威力+0.5，最多3名。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `dan_heng_imbibitor_lunae` |
| 英文名 | Dan Heng • Imbibitor Lunae |
| 游戏稀有度 | 史诗 |
| 基础威力 | 3 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [扩散](Cards#attack) |
| 命途 | [毁灭](Synergy-destruction) |
| 属性 | [虚数](Synergy-imaginary) |
| 阵营 | [星穹列车](Synergy-astral) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**3 / 9 / 27**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击命中来源列最近存活敌列，系数2；再命中主目标左右紧邻列的存活敌人，各系数1，溅射不继续找远列。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：威力平加

每名同行的其他虚数或毁灭伙伴使本次威力+0.5，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源实例自身 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.5 × min(3, max(0, 同行其他格中符合筛选的实例数（（属性为[虚数](Synergy-imaginary) 或 命途为[毁灭](Synergy-destruction)），且排除来源同一 UID 实例）)) × 星级倍率[1 / 3 / 9] |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[星穹列车](Synergy-astral)、[毁灭](Synergy-destruction)、[虚数编队](Synergy-imaginary)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[虚数](Synergy-imaginary) 或 命途为[毁灭](Synergy-destruction)），且排除来源同一 UID 实例：[瓦尔特](Card-1004)、[阿兰](Card-1008)、[克拉拉](Card-1107)、[虎克](Card-1109)、[刃](Card-1205)、[罗刹](Card-1203)、[驭空](Card-1207)、[镜流](Card-1212)、[雪衣](Card-1214)、[云璃](Card-1221)、[砂金](Card-1304)、[真理医生](Card-1305)、[流萤](Card-1310)、[米沙](Card-1312)、[星期日](Card-1313)、[乱破](Card-1317)、[万敌](Card-1404)、[白厄](Card-1408)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[Saber](Card-saber)、[银狼LV.999](Card-silver_wolf_lv999)、[吉尔伽美什](Card-announced_gilgamesh)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[阿兰](Card-1008)、[克拉拉](Card-1107)、[虎克](Card-1109)、[刃](Card-1205)、[罗刹](Card-1203)、[驭空](Card-1207)、[镜流](Card-1212)、[雪衣](Card-1214)、[云璃](Card-1221)、[砂金](Card-1304)、[真理医生](Card-1305)、[流萤](Card-1310)、[米沙](Card-1312)、[星期日](Card-1313)、[乱破](Card-1317)、[万敌](Card-1404)、[白厄](Card-1408)、[三月七·巡猎](Card-march_hunt)、[丹恒·腾荒](Card-dan_heng_pt)、[Saber](Card-saber)、[银狼LV.999](Card-silver_wolf_lv999)、[姬子·启行](Card-announced_himeko_nova)、[吉尔伽美什](Card-announced_gilgamesh)。
- 有公开标签筛选可匹配本角色的奇物/精华：[毁灭火漆](Relic-destruction_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[信标着色剂](Relic-beacon_colorant)、[一撮胡须火药](Relic-whisker_powder)、[血锦之纪徽章](Relic-blood_badge)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[湮灭烛剪·精华](Essence-essence_annihilation)、[一撮胡须火药·精华](Essence-essence_whisker)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "dan_heng_imbibitor_lunae",
  "name": "丹恒·饮月",
  "enName": "Dan Heng • Imbibitor Lunae",
  "rarity": "rare",
  "attack": "blast",
  "power": 3,
  "path": "毁灭",
  "element": "虚数",
  "faction": "星穹列车",
  "description": "每名同行的其他虚数或毁灭伙伴使本次威力+0.5，最多3名。",
  "effects": [
    {
      "type": "power",
      "value": 0.5,
      "summary": "每名同行的其他虚数或毁灭伙伴使本次威力+0.5，最多3名",
      "trigger": "appearance",
      "duration": "spin",
      "target": "self",
      "stacking": "additive",
      "scaleWithStars": true,
      "per": {
        "metric": "row",
        "filter": {
          "anyOf": [
            {
              "element": "虚数"
            },
            {
              "path": "毁灭"
            }
          ],
          "excludeSelf": true
        },
        "cap": 3
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Imbibitor_Lunae",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
