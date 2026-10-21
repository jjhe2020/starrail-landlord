# Archer

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4708](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4708)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名相邻的同谐或智识非攻击伙伴贡献一次自身威力45%的投影追击，最多3名。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `archer` |
| 英文名 | Archer |
| 游戏稀有度 | 史诗 |
| 基础威力 | 3 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [单体](Cards#attack) |
| 命途 | [巡猎](Synergy-hunt) |
| 属性 | [量子](Synergy-quantum) |
| 阵营 | [异世界](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**3 / 9 / 27**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击向来源列最近存活敌列命中1次，系数3。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：独立追加伤害

每名相邻的同谐或智识非攻击伙伴贡献一次自身威力45%的投影追击，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 寻找来源格对应列；空列改找最近存活敌列；距离相同时取左侧 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.45 × min(3, max(0, 相邻八格中符合筛选的实例数（（命途为[同谐](Synergy-harmony) 或 命途为[智识](Synergy-erudition)），且主职能不为[攻击](Cards#role)，且排除来源同一 UID 实例）)) × 来源最终威力 |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[巡猎](Synergy-hunt)、[量子编队](Synergy-quantum)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[同谐](Synergy-harmony) 或 命途为[智识](Synergy-erudition)），且主职能不为[攻击](Cards#role)，且排除来源同一 UID 实例：[艾丝妲](Card-1009)、[布洛妮娅](Card-1101)、[停云](Card-1202)、[驭空](Card-1207)、[寒鸦](Card-1215)、[阮·梅](Card-1303)、[花火](Card-1306)、[知更鸟](Card-1309)、[星期日](Card-1313)、[缇宝](Card-1403)、[刻律德菈](Card-cerydra)、[远坂凛](Card-announced_rin_tohsaka)。
- 共享至少一个命途、属性或阵营标签：[丹恒](Card-1002)、[银狼](Card-1006)、[希儿](Card-1102)、[符玄](Card-1208)、[青雀](Card-1201)、[玲可](Card-1110)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[彦卿](Card-1209)、[雪衣](Card-1214)、[飞霄](Card-1220)、[貊泽](Card-1223)、[真理医生](Card-1305)、[花火](Card-1306)、[翡翠](Card-1314)、[波提欧](Card-1315)、[缇宝](Card-1403)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[三月七·巡猎](Card-march_hunt)、[Saber](Card-saber)、[不死途](Card-ashveil)、[吉尔伽美什](Card-announced_gilgamesh)、[远坂凛](Card-announced_rin_tohsaka)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 有公开标签筛选可匹配本角色的奇物/精华：[巡猎火漆](Relic-hunt_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[信标着色剂](Relic-beacon_colorant)、[和平的代价](Relic-peace_price)、[巡猎火漆·精华](Essence-essence_hunt)、[空无烛剪·精华](Essence-essence_void_wick)、[朋克洛德精神·精华](Essence-essence_punklorde)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[信标着色剂·精华](Essence-essence_colorant)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "archer",
  "name": "Archer",
  "enName": "Archer",
  "rarity": "rare",
  "attack": "single",
  "power": 3,
  "path": "巡猎",
  "element": "量子",
  "faction": "异世界",
  "description": "每名相邻的同谐或智识非攻击伙伴贡献一次自身威力45%的投影追击，最多3名。",
  "effects": [
    {
      "type": "damage",
      "value": 0.45,
      "summary": "每名相邻的同谐或智识非攻击伙伴贡献一次自身威力45%的投影追击，最多3名",
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
              "path": "同谐"
            },
            {
              "path": "智识"
            }
          ],
          "roleNot": "attack",
          "excludeSelf": true
        },
        "cap": 3
      },
      "scaleWithSourcePower": true
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Archer",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
