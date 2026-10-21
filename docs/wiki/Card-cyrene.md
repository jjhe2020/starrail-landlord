# 昔涟

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4609](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4609)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每第3次登场，至多2名同行的其他记忆或翁法罗斯永久非培养伙伴各永久成长+0.45。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `cyrene` |
| 英文名 | Cyrene |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [永久培养](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [记忆](Synergy-remembrance) |
| 属性 | [冰](Synergy-ice) |
| 阵营 | [翁法罗斯](Cards#faction) |
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

每第3次登场，至多2名同行的其他记忆或翁法罗斯永久非培养伙伴各永久成长+0.45

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 永久成长（`growth`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源同行五格（再应用筛选）；最多2名 |
| 目标筛选 | （命途为[记忆](Synergy-remembrance) 或 阵营为[翁法罗斯](Cards#faction)），且主职能不为[永久培养](Cards#role)，且非临时实例（此字段本身不排除见习），且排除见习委派，且排除来源同一 UID 实例 |
| 基础数值公式 | 0.45 × 星级系数[1 / 1.5 / 2] |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 写入编队中同UID且非临时的原实例；通用入口本身不排除见习或培养主职，目标筛选另行决定是否排除它们。例如丹恒见习可以触发自身成长，但专业培养者的受体筛选排除见习。新成长再乘齿轮、成长折旧和适用成长倍率；两位小数保存，本轮攻击威力/可培养技能即可使用更新后的成长。成长赠送量不会被来源自己的培养倍率放大。
- every=3：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 无升星差额税时，1/2/3星技能系数分别为1 / 1.5 / 2；若星级审计生效，高星系数额外×0.8。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[冻结编队](Synergy-ice)、[记忆](Synergy-remembrance)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[记忆](Synergy-remembrance) 或 阵营为[翁法罗斯](Cards#faction)），且主职能不为[永久培养](Cards#role)，且非临时实例（此字段本身不排除见习），且排除见习委派，且排除来源同一 UID 实例：[阿格莱雅](Card-1402)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[海瑟音](Card-hysilens)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[知更鸟·晴歌](Card-robin_summeretto)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[黑塔](Card-1013)、[杰帕德](Card-1104)、[佩拉](Card-1106)、[彦卿](Card-1209)、[镜流](Card-1212)、[阮·梅](Card-1303)、[米沙](Card-1312)、[阿格莱雅](Card-1402)、[缇宝](Card-1403)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[大黑塔](Card-the_herta)、[海瑟音](Card-hysilens)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[真珠](Card-pearl)、[知更鸟·晴歌](Card-robin_summeretto)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[记忆火漆](Relic-remembrance_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[记忆火漆·精华](Essence-essence_remembrance)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "cyrene",
  "name": "昔涟",
  "enName": "Cyrene",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "记忆",
  "element": "冰",
  "faction": "翁法罗斯",
  "description": "每第3次登场，至多2名同行的其他记忆或翁法罗斯永久非培养伙伴各永久成长+0.45。",
  "effects": [
    {
      "type": "growth",
      "value": 0.45,
      "summary": "每第3次登场，至多2名同行的其他记忆或翁法罗斯永久非培养伙伴各永久成长+0.45",
      "trigger": "appearance",
      "duration": "run",
      "target": "row",
      "stacking": "additive",
      "every": 3,
      "targetLimit": 2,
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
            "path": "记忆"
          },
          {
            "faction": "翁法罗斯"
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
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cyrene",
  "kitVersion": 6,
  "role": "trainer",
  "roleLabel": "永久培养"
}
```
