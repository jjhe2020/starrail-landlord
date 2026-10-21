# 大黑塔

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4361](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4361)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名相邻的其他冰或智识伙伴使本次威力+0.5，最多3名。每第3次登场且同列有其他冰或智识伙伴，向所有存活敌列追加自身威力55%的解题攻击。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `the_herta` |
| 英文名 | The Herta |
| 游戏稀有度 | 史诗 |
| 基础威力 | 3 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [群体](Cards#attack) |
| 命途 | [智识](Synergy-erudition) |
| 属性 | [冰](Synergy-ice) |
| 阵营 | [黑塔空间站](Synergy-station) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**3 / 9 / 27**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击命中所有存活敌列，每列系数1。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：威力平加

每名相邻的其他冰或智识伙伴使本次威力+0.5，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源实例自身 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.5 × min(3, max(0, 相邻八格中符合筛选的实例数（（属性为[冰](Synergy-ice) 或 命途为[智识](Synergy-erudition)），且排除来源同一 UID 实例）)) × 星级倍率[1 / 3 / 9] |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。

### 技能 2：独立追加伤害

每第3次登场且同列有其他冰或智识伙伴，向所有存活敌列追加自身威力55%的解题攻击

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 同列其他格中符合筛选的实例数（（属性为[冰](Synergy-ice) 或 命途为[智识](Synergy-erudition)），且排除来源同一 UID 实例）≥1 |
| 目标 | 所有当时存活敌列，各吃一份数值 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.55 × max(0, 所选来源格的最终威力) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- every=3：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[空间站科员](Synergy-station)、[智识](Synergy-erudition)、[冻结编队](Synergy-ice)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[冰](Synergy-ice) 或 命途为[智识](Synergy-erudition)），且排除来源同一 UID 实例：[三月七](Card-1001)、[姬子](Card-1003)、[黑塔](Card-1013)、[希露瓦](Card-1103)、[杰帕德](Card-1104)、[佩拉](Card-1106)、[景元](Card-1204)、[青雀](Card-1201)、[彦卿](Card-1209)、[镜流](Card-1212)、[银枝](Card-1302)、[阮·梅](Card-1303)、[米沙](Card-1312)、[翡翠](Card-1314)、[乱破](Card-1317)、[那刻夏](Card-1405)、[大黑塔](Card-the_herta)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[姬子·启行](Card-announced_himeko_nova)、[远坂凛](Card-announced_rin_tohsaka)、[真珠](Card-pearl)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[姬子](Card-1003)、[阿兰](Card-1008)、[艾丝妲](Card-1009)、[黑塔](Card-1013)、[希露瓦](Card-1103)、[杰帕德](Card-1104)、[佩拉](Card-1106)、[景元](Card-1204)、[青雀](Card-1201)、[彦卿](Card-1209)、[镜流](Card-1212)、[银枝](Card-1302)、[阮·梅](Card-1303)、[米沙](Card-1312)、[翡翠](Card-1314)、[乱破](Card-1317)、[那刻夏](Card-1405)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[姬子·启行](Card-announced_himeko_nova)、[远坂凛](Card-announced_rin_tohsaka)、[真珠](Card-pearl)。
- 有公开标签筛选可匹配本角色的奇物/精华：[智识火漆](Relic-erudition_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[天才俱乐部普通八卦](Relic-genius_gossip)、[智识火漆·精华](Essence-essence_erudition)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[永不停嘴的羊皮卷·精华](Essence-essence_scroll)、[欢愉火漆·精华](Essence-essence_elation_wax)、[天才俱乐部普通八卦·精华](Essence-essence_genius)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "the_herta",
  "name": "大黑塔",
  "enName": "The Herta",
  "rarity": "rare",
  "attack": "aoe",
  "power": 3,
  "path": "智识",
  "element": "冰",
  "faction": "黑塔空间站",
  "description": "每名相邻的其他冰或智识伙伴使本次威力+0.5，最多3名。每第3次登场且同列有其他冰或智识伙伴，向所有存活敌列追加自身威力55%的解题攻击。",
  "effects": [
    {
      "type": "power",
      "value": 0.5,
      "summary": "每名相邻的其他冰或智识伙伴使本次威力+0.5，最多3名",
      "trigger": "appearance",
      "duration": "spin",
      "target": "self",
      "stacking": "additive",
      "scaleWithStars": true,
      "per": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "element": "冰"
            },
            {
              "path": "智识"
            }
          ],
          "excludeSelf": true
        },
        "cap": 3
      }
    },
    {
      "type": "damage",
      "value": 0.55,
      "summary": "每第3次登场且同列有其他冰或智识伙伴，向所有存活敌列追加自身威力55%的解题攻击",
      "trigger": "appearance",
      "duration": "spin",
      "target": "all",
      "stacking": "additive",
      "stage": "afterAttacks",
      "per": {
        "metric": "sourcePower"
      },
      "every": 3,
      "condition": {
        "metric": "column",
        "filter": {
          "anyOf": [
            {
              "element": "冰"
            },
            {
              "path": "智识"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 1
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/The_Herta",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
