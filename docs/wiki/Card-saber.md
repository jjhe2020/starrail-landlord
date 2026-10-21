# Saber

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4665](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4665)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每第3次登场且位于边缘，向所有存活敌列追加自身威力85%的誓约胜利之剑。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `saber` |
| 英文名 | Saber |
| 游戏稀有度 | 史诗 |
| 基础威力 | 3 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [扩散](Cards#attack) |
| 命途 | [毁灭](Synergy-destruction) |
| 属性 | [风](Synergy-wind) |
| 阵营 | [异世界](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**3 / 9 / 27**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击命中来源列最近存活敌列，系数2；再命中主目标左右紧邻列的存活敌人，各系数1，溅射不继续找远列。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：独立追加伤害

每第3次登场且位于边缘，向所有存活敌列追加自身威力85%的誓约胜利之剑

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 位于边缘时为1，否则为0=1 |
| 目标 | 所有当时存活敌列，各吃一份数值 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.85 × max(0, 所选来源格的最终威力) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- every=3：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[毁灭](Synergy-destruction)、[流风编队](Synergy-wind)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- 共享至少一个命途、属性或阵营标签：[丹恒](Card-1002)、[阿兰](Card-1008)、[布洛妮娅](Card-1101)、[克拉拉](Card-1107)、[桑博](Card-1108)、[虎克](Card-1109)、[刃](Card-1205)、[镜流](Card-1212)、[雪衣](Card-1214)、[藿藿](Card-1217)、[飞霄](Card-1220)、[云璃](Card-1221)、[黑天鹅](Card-1307)、[流萤](Card-1310)、[米沙](Card-1312)、[万敌](Card-1404)、[那刻夏](Card-1405)、[白厄](Card-1408)、[风堇](Card-1409)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[刻律德菈](Card-cerydra)、[Archer](Card-archer)、[吉尔伽美什](Card-announced_gilgamesh)、[远坂凛](Card-announced_rin_tohsaka)、[知更鸟·晴歌](Card-robin_summeretto)。
- 有公开标签筛选可匹配本角色的奇物/精华：[毁灭火漆](Relic-destruction_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[一撮胡须火药](Relic-whisker_powder)、[血锦之纪徽章](Relic-blood_badge)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[湮灭烛剪·精华](Essence-essence_annihilation)、[一撮胡须火药·精华](Essence-essence_whisker)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "saber",
  "name": "Saber",
  "enName": "Saber",
  "rarity": "rare",
  "attack": "blast",
  "power": 3,
  "path": "毁灭",
  "element": "风",
  "faction": "异世界",
  "description": "每第3次登场且位于边缘，向所有存活敌列追加自身威力85%的誓约胜利之剑。",
  "effects": [
    {
      "type": "damage",
      "value": 0.85,
      "summary": "每第3次登场且位于边缘，向所有存活敌列追加自身威力85%的誓约胜利之剑",
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
        "metric": "edge",
        "op": "eq",
        "value": 1
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Saber",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
