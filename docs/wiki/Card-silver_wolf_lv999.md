# 银狼LV.999

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4963](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4963)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每第3次登场且位于角落，向所有存活列追加自身威力80%的满级连段。相邻有量子或欢愉伙伴时，本轮每名退场角色使本次威力+0.7，最多3名。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `silver_wolf_lv999` |
| 英文名 | Silver Wolf LV.999 |
| 游戏稀有度 | 传说 |
| 基础威力 | 3.8 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [群体](Cards#attack) |
| 命途 | [欢愉](Cards#path) |
| 属性 | [虚数](Synergy-imaginary) |
| 阵营 | [星核猎手](Synergy-hunters) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**3.8 / 11.4 / 34.2**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击命中所有存活敌列，每列系数1。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：独立追加伤害

每第3次登场且位于角落，向所有存活列追加自身威力80%的满级连段

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 位于角落时为1，否则为0=1 |
| 目标 | 所有当时存活敌列，各吃一份数值 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.8 × max(0, 所选来源格的最终威力) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- every=3：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：威力平加

相邻有量子或欢愉伙伴时，本轮每名退场角色使本次威力+0.7，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力平加（`power`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 相邻八格中符合筛选的实例数（（属性为[量子](Synergy-quantum) 或 命途为[欢愉](Cards#path)），且排除来源同一 UID 实例）≥1 |
| 目标 | 来源实例自身 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.7 × min(3, max(0, 本轮已经计入的退场数)) × 星级倍率[1 / 3 / 9] |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 在本次威力平加段结算，再经过适用最终乘区；不会增加永久成长。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[命运剧本](Synergy-hunters)、[虚数编队](Synergy-imaginary)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[量子](Synergy-quantum) 或 命途为[欢愉](Cards#path)），且排除来源同一 UID 实例：[银狼](Card-1006)、[希儿](Card-1102)、[符玄](Card-1208)、[青雀](Card-1201)、[玲可](Card-1110)、[雪衣](Card-1214)、[花火](Card-1306)、[翡翠](Card-1314)、[缇宝](Card-1403)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[Archer](Card-archer)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[远坂凛](Card-announced_rin_tohsaka)、[阿哈](Card-aha)、[真珠](Card-pearl)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 共享至少一个命途、属性或阵营标签：[瓦尔特](Card-1004)、[卡芙卡](Card-1005)、[银狼](Card-1006)、[刃](Card-1205)、[罗刹](Card-1203)、[驭空](Card-1207)、[砂金](Card-1304)、[真理医生](Card-1305)、[流萤](Card-1310)、[星期日](Card-1313)、[乱破](Card-1317)、[万敌](Card-1404)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[绯英](Card-evanescia)、[千冶·刃](Card-mortenax_blade)、[阿哈](Card-aha)、[真珠](Card-pearl)、[砂金·戏浪](Card-aventurine_waveflair)、[星神★阿哈](Card-aeon_star_aha)。
- 有公开标签筛选可匹配本角色的奇物/精华：[智识火漆](Relic-erudition_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[信标着色剂](Relic-beacon_colorant)、[天才俱乐部普通八卦](Relic-genius_gossip)、[智识火漆·精华](Essence-essence_erudition)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[永不停嘴的羊皮卷·精华](Essence-essence_scroll)、[欢愉火漆·精华](Essence-essence_elation_wax)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "silver_wolf_lv999",
  "name": "银狼LV.999",
  "enName": "Silver Wolf LV.999",
  "rarity": "legendary",
  "attack": "aoe",
  "power": 3.8,
  "path": "欢愉",
  "element": "虚数",
  "faction": "星核猎手",
  "description": "每第3次登场且位于角落，向所有存活列追加自身威力80%的满级连段。相邻有量子或欢愉伙伴时，本轮每名退场角色使本次威力+0.7，最多3名。",
  "effects": [
    {
      "type": "damage",
      "value": 0.8,
      "summary": "每第3次登场且位于角落，向所有存活列追加自身威力80%的满级连段",
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
        "metric": "corner",
        "op": "eq",
        "value": 1
      }
    },
    {
      "type": "power",
      "value": 0.7,
      "summary": "相邻有量子或欢愉伙伴时，本轮每名退场角色使本次威力+0.7，最多3名",
      "trigger": "appearance",
      "duration": "spin",
      "target": "self",
      "stacking": "additive",
      "scaleWithStars": true,
      "condition": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "path": "欢愉"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 1
      },
      "per": {
        "metric": "retirements",
        "cap": 3
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Silver_Wolf_LV.999",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
