# 丹恒·腾荒

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4249](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4249)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名同列的其他星穹列车或物理伙伴提供3.5护盾，最多3名。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `dan_heng_pt` |
| 英文名 | Dan Heng • Permansor Terrae |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [防御](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [存护](Synergy-preservation) |
| 属性 | [物理](Synergy-physical) |
| 阵营 | [星穹列车](Synergy-astral) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：获得护盾

每名同列的其他星穹列车或物理伙伴提供3.5护盾，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 获得护盾（`shield`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 同列其他格中符合筛选的实例数（（阵营为[星穹列车](Synergy-astral) 或 属性为[物理](Synergy-physical)），且排除来源同一 UID 实例）≥1 |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 3.5 × min(3, max(0, 同列其他格中符合筛选的实例数（（阵营为[星穹列车](Synergy-astral) 或 属性为[物理](Synergy-physical)），且排除来源同一 UID 实例）)) × 星级倍率[1 / 3 / 9] × T |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 经过护盾倍率与折价后加入护盾，存量上限为生命上限×2；实际获得量用于本轮护盾进度。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[星穹列车](Synergy-astral)、[存护](Synergy-preservation)、[坚韧编队](Synergy-physical)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （阵营为[星穹列车](Synergy-astral) 或 属性为[物理](Synergy-physical)），且排除来源同一 UID 实例：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[娜塔莎](Card-1105)、[克拉拉](Card-1107)、[卢卡](Card-1111)、[素裳](Card-1206)、[寒鸦](Card-1215)、[云璃](Card-1221)、[银枝](Card-1302)、[知更鸟](Card-1309)、[波提欧](Card-1315)、[白厄](Card-1408)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[丹恒·腾荒](Card-dan_heng_pt)、[海瑟音](Card-hysilens)、[爻光](Card-yao_guang)、[绯英](Card-evanescia)、[姬子·启行](Card-announced_himeko_nova)。
- 共享至少一个命途、属性或阵营标签：[三月七](Card-1001)、[丹恒](Card-1002)、[姬子](Card-1003)、[瓦尔特](Card-1004)、[杰帕德](Card-1104)、[娜塔莎](Card-1105)、[克拉拉](Card-1107)、[符玄](Card-1208)、[卢卡](Card-1111)、[素裳](Card-1206)、[寒鸦](Card-1215)、[云璃](Card-1221)、[银枝](Card-1302)、[砂金](Card-1304)、[知更鸟](Card-1309)、[波提欧](Card-1315)、[白厄](Card-1408)、[三月七·巡猎](Card-march_hunt)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[海瑟音](Card-hysilens)、[爻光](Card-yao_guang)、[绯英](Card-evanescia)、[姬子·启行](Card-announced_himeko_nova)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[虚构机兵](Relic-fictional_machine)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[换境桂冠·精华](Essence-essence_realm_crown)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "dan_heng_pt",
  "name": "丹恒·腾荒",
  "enName": "Dan Heng • Permansor Terrae",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "存护",
  "element": "物理",
  "faction": "星穹列车",
  "description": "每名同列的其他星穹列车或物理伙伴提供3.5护盾，最多3名。",
  "effects": [
    {
      "type": "shield",
      "value": 3.5,
      "summary": "每名同列的其他星穹列车或物理伙伴提供3.5护盾，最多3名",
      "trigger": "appearance",
      "duration": "resource",
      "target": "self",
      "stacking": "additive",
      "scaleWithTraining": true,
      "scaleWithStars": true,
      "condition": {
        "metric": "column",
        "filter": {
          "anyOf": [
            {
              "faction": "星穹列车"
            },
            {
              "element": "物理"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 1
      },
      "per": {
        "metric": "column",
        "filter": {
          "anyOf": [
            {
              "faction": "星穹列车"
            },
            {
              "element": "物理"
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
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Permansor_Terrae",
  "kitVersion": 6,
  "role": "defense",
  "roleLabel": "防御"
}
```
