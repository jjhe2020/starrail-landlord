# 三月七·巡猎

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4119](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4119)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

相邻有巡猎或星穹列车伙伴时，剑花追加自身威力50%的攻击。每第4次登场且相邻有巡猎或星穹列车伙伴，自身永久成长+0.15。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `march_hunt` |
| 英文名 | March 7th (The Hunt) |
| 游戏稀有度 | 普通 |
| 基础威力 | 2 |
| 主职能 | [攻击](Cards#role) |
| 攻击形态 | [单体](Cards#attack) |
| 命途 | [巡猎](Synergy-hunt) |
| 属性 | [虚数](Synergy-imaginary) |
| 阵营 | [星穹列车](Synergy-astral) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 4（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**2 / 6 / 18**。攻击主职能：成长直接加入基础威力，不被1/3/9星级再乘。
- 常规攻击向来源列最近存活敌列命中1次，系数3。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：独立追加伤害

相邻有巡猎或星穹列车伙伴时，剑花追加自身威力50%的攻击

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 独立追加伤害（`damage`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 常规攻击之后；按统一时序结算 |
| 门槛 | 相邻八格中符合筛选的实例数（（阵营为[星穹列车](Synergy-astral) 或 命途为[巡猎](Synergy-hunt)），且排除来源同一 UID 实例）≥1 |
| 目标 | 寻找来源格对应列；空列改找最近存活敌列；距离相同时取左侧 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.5 × max(0, 所选来源格的最终威力) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 每个目标敌列独立执行命中、易伤、装甲和剩余生命截断；追加伤害不递归触发常规击破追击。转动内造成的伤害与实际击破计入本轮总伤害和最终击破敌列数。读取 sourcePower 的效果会在真正追加结算时重读最终威力。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

### 技能 2：永久成长

每第4次登场且相邻有巡猎或星穹列车伙伴，自身永久成长+0.15

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 永久成长（`growth`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 相邻八格中符合筛选的实例数（（阵营为[星穹列车](Synergy-astral) 或 命途为[巡猎](Synergy-hunt)），且排除来源同一 UID 实例）≥1 |
| 目标 | 来源实例自身 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 0.15 |
| 持续 | 本局；新局不继承 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 写入编队中同UID且非临时的原实例；通用入口本身不排除见习或培养主职，目标筛选另行决定是否排除它们。例如丹恒见习可以触发自身成长，但专业培养者的受体筛选排除见习。新成长再乘齿轮、成长折旧和适用成长倍率；两位小数保存，本轮攻击威力/可培养技能即可使用更新后的成长。成长赠送量不会被来源自己的培养倍率放大。
- every=4：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[星穹列车](Synergy-astral)、[巡猎](Synergy-hunt)、[虚数编队](Synergy-imaginary)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （阵营为[星穹列车](Synergy-astral) 或 命途为[巡猎](Synergy-hunt)），且排除来源同一 UID 实例：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[希儿](Card-1102)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[彦卿](Card-1209)、[飞霄](Card-1220)、[貊泽](Card-1223)、[真理医生](Card-1305)、[波提欧](Card-1315)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[丹恒·腾荒](Card-dan_heng_pt)、[Archer](Card-archer)、[不死途](Card-ashveil)、[姬子·启行](Card-announced_himeko_nova)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[希儿](Card-1102)、[罗刹](Card-1203)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[驭空](Card-1207)、[彦卿](Card-1209)、[飞霄](Card-1220)、[貊泽](Card-1223)、[砂金](Card-1304)、[真理医生](Card-1305)、[星期日](Card-1313)、[波提欧](Card-1315)、[乱破](Card-1317)、[万敌](Card-1404)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[丹恒·腾荒](Card-dan_heng_pt)、[Archer](Card-archer)、[不死途](Card-ashveil)、[银狼LV.999](Card-silver_wolf_lv999)、[姬子·启行](Card-announced_himeko_nova)。
- 有公开标签筛选可匹配本角色的奇物/精华：[巡猎火漆](Relic-hunt_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[信标着色剂](Relic-beacon_colorant)、[和平的代价](Relic-peace_price)、[巡猎火漆·精华](Essence-essence_hunt)、[空无烛剪·精华](Essence-essence_void_wick)、[朋克洛德精神·精华](Essence-essence_punklorde)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "march_hunt",
  "name": "三月七·巡猎",
  "enName": "March 7th (The Hunt)",
  "rarity": "common",
  "attack": "single",
  "power": 2,
  "path": "巡猎",
  "element": "虚数",
  "faction": "星穹列车",
  "description": "相邻有巡猎或星穹列车伙伴时，剑花追加自身威力50%的攻击。每第4次登场且相邻有巡猎或星穹列车伙伴，自身永久成长+0.15。",
  "effects": [
    {
      "type": "damage",
      "value": 0.5,
      "summary": "相邻有巡猎或星穹列车伙伴时，剑花追加自身威力50%的攻击",
      "trigger": "appearance",
      "duration": "spin",
      "target": "column",
      "stacking": "additive",
      "stage": "afterAttacks",
      "per": {
        "metric": "sourcePower"
      },
      "condition": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "faction": "星穹列车"
            },
            {
              "path": "巡猎"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 1
      }
    },
    {
      "type": "growth",
      "value": 0.15,
      "summary": "每第4次登场且相邻有巡猎或星穹列车伙伴，自身永久成长+0.15",
      "trigger": "appearance",
      "duration": "run",
      "target": "self",
      "stacking": "additive",
      "every": 4,
      "conditions": [
        {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星穹列车"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      ]
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 4,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/March_7th",
  "kitVersion": 6,
  "role": "attack",
  "roleLabel": "攻击"
}
```
