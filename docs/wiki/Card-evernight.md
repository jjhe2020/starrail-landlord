# 长夜月

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4558](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4558)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名相邻的记忆或同谐非攻击伙伴贡献一次自身威力45%的忆幕追击，最多2名。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `evernight` |
| 英文名 | Evernight |
| 游戏稀有度 | 史诗 |
| 基础威力 | 3 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [扩散](Cards#attack) |
| 命途 | [记忆](Synergy-remembrance) |
| 属性 | [冰](Synergy-ice) |
| 阵营 | [翁法罗斯](Cards#faction) |
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

每名相邻的记忆或同谐非攻击伙伴贡献一次自身威力45%的忆幕追击，最多2名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 寻找来源格对应列；空列改找最近存活敌列；距离相同时取左侧 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.45 × min(2, max(0, 相邻八格中符合筛选的实例数（（命途为[记忆](Synergy-remembrance) 或 命途为[同谐](Synergy-harmony)），且主职能不为[攻击](Cards#role)，且排除来源同一 UID 实例）)) × 来源最终威力 |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[冻结编队](Synergy-ice)、[记忆](Synergy-remembrance)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[记忆](Synergy-remembrance) 或 命途为[同谐](Synergy-harmony)），且主职能不为[攻击](Cards#role)，且排除来源同一 UID 实例：[艾丝妲](Card-1009)、[布洛妮娅](Card-1101)、[停云](Card-1202)、[驭空](Card-1207)、[寒鸦](Card-1215)、[阮·梅](Card-1303)、[花火](Card-1306)、[知更鸟](Card-1309)、[星期日](Card-1313)、[缇宝](Card-1403)、[风堇](Card-1409)、[刻律德菈](Card-cerydra)、[昔涟](Card-cyrene)、[知更鸟·晴歌](Card-robin_summeretto)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[黑塔](Card-1013)、[杰帕德](Card-1104)、[佩拉](Card-1106)、[彦卿](Card-1209)、[镜流](Card-1212)、[阮·梅](Card-1303)、[米沙](Card-1312)、[阿格莱雅](Card-1402)、[缇宝](Card-1403)、[万敌](Card-1404)、[那刻夏](Card-1405)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[白厄](Card-1408)、[风堇](Card-1409)、[大黑塔](Card-the_herta)、[海瑟音](Card-hysilens)、[刻律德菈](Card-cerydra)、[昔涟](Card-cyrene)、[真珠](Card-pearl)、[知更鸟·晴歌](Card-robin_summeretto)。
- 有公开标签筛选可匹配本角色的奇物/精华：[毁灭火漆](Relic-destruction_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[记忆火漆](Relic-remembrance_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[一撮胡须火药](Relic-whisker_powder)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[记忆火漆·精华](Essence-essence_remembrance)、[一撮胡须火药·精华](Essence-essence_whisker)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "evernight",
  "name": "长夜月",
  "enName": "Evernight",
  "rarity": "rare",
  "attack": "blast",
  "power": 3,
  "path": "记忆",
  "element": "冰",
  "faction": "翁法罗斯",
  "description": "每名相邻的记忆或同谐非攻击伙伴贡献一次自身威力45%的忆幕追击，最多2名。",
  "effects": [
    {
      "type": "damage",
      "value": 0.45,
      "summary": "每名相邻的记忆或同谐非攻击伙伴贡献一次自身威力45%的忆幕追击，最多2名",
      "trigger": "appearance",
      "duration": "spin",
      "target": "column",
      "stacking": "additive",
      "stage": "afterAttacks",
      "per": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "path": "记忆"
            },
            {
              "path": "同谐"
            }
          ],
          "roleNot": "attack",
          "excludeSelf": true
        },
        "cap": 2
      },
      "scaleWithSourcePower": true
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Evernight",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
