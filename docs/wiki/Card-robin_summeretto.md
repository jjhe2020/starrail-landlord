# 知更鸟·晴歌

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:5583](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L5583)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

每名相邻的记忆或风伙伴恢复3生命，最多3名。每第2次登场且同行至少2名其他记忆或风伙伴，获得3护盾。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `robin_summeretto` |
| 英文名 | Robin • Summeretto |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [防御](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [记忆](Synergy-remembrance) |
| 属性 | [风](Synergy-wind) |
| 阵营 | [匹诺康尼](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：恢复生命

每名相邻的记忆或风伙伴恢复3生命，最多3名

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 恢复生命（`heal`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 相邻八格中符合筛选的实例数（（属性为[风](Synergy-wind) 或 命途为[记忆](Synergy-remembrance)），且排除来源同一 UID 实例）≥1 |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 3 × min(3, max(0, 相邻八格中符合筛选的实例数（（属性为[风](Synergy-wind) 或 命途为[记忆](Synergy-remembrance)），且排除来源同一 UID 实例）)) × 星级倍率[1 / 3 / 9] × T |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 请求治疗先经过治疗倍率与折价并四舍五入到两位小数；实际恢复=min(缺失生命, 请求值)。溢出不计实际治疗进度。
- 份数不向下取整；除法结果可为小数，再受cap截断。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

### 技能 2：获得护盾

每第2次登场且同行至少2名其他记忆或风伙伴，获得3护盾

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 获得护盾（`shield`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 同行其他格中符合筛选的实例数（（属性为[风](Synergy-wind) 或 命途为[记忆](Synergy-remembrance)），且排除来源同一 UID 实例）≥2 |
| 目标 | 列车共享生命、护盾或转动资源；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 3 × 星级倍率[1 / 3 / 9] × T |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 经过护盾倍率与折价后加入护盾，存量上限为生命上限×2；实际获得量用于本轮护盾进度。
- every=2：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 无升星差额税时，1/2/3星技能系数分别为1 / 3 / 9；若星级审计生效，高星系数额外×0.8。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[流风编队](Synergy-wind)、[记忆](Synergy-remembrance)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[风](Synergy-wind) 或 命途为[记忆](Synergy-remembrance)），且排除来源同一 UID 实例：[丹恒](Card-1002)、[布洛妮娅](Card-1101)、[桑博](Card-1108)、[刃](Card-1205)、[藿藿](Card-1217)、[飞霄](Card-1220)、[黑天鹅](Card-1307)、[阿格莱雅](Card-1402)、[那刻夏](Card-1405)、[遐蝶](Card-1407)、[风堇](Card-1409)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[Saber](Card-saber)、[知更鸟·晴歌](Card-robin_summeretto)。
- 共享至少一个命途、属性或阵营标签：[丹恒](Card-1002)、[布洛妮娅](Card-1101)、[桑博](Card-1108)、[刃](Card-1205)、[藿藿](Card-1217)、[飞霄](Card-1220)、[加拉赫](Card-1301)、[黑天鹅](Card-1307)、[知更鸟](Card-1309)、[米沙](Card-1312)、[星期日](Card-1313)、[阿格莱雅](Card-1402)、[那刻夏](Card-1405)、[遐蝶](Card-1407)、[风堇](Card-1409)、[刻律德菈](Card-cerydra)、[长夜月](Card-evernight)、[昔涟](Card-cyrene)、[Saber](Card-saber)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[记忆火漆](Relic-remembrance_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[家族缘结](Relic-family_ties)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[记忆火漆·精华](Essence-essence_remembrance)、[家族缘结·精华](Essence-essence_family)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "robin_summeretto",
  "name": "知更鸟·晴歌",
  "enName": "Robin • Summeretto",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "记忆",
  "element": "风",
  "faction": "匹诺康尼",
  "effects": [
    {
      "type": "heal",
      "value": 3,
      "summary": "每名相邻的记忆或风伙伴恢复3生命，最多3名",
      "trigger": "appearance",
      "duration": "resource",
      "target": "self",
      "stacking": "additive",
      "scaleWithTraining": true,
      "scaleWithStars": true,
      "condition": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "element": "风"
            },
            {
              "path": "记忆"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 1
      },
      "per": {
        "metric": "neighbors",
        "filter": {
          "anyOf": [
            {
              "element": "风"
            },
            {
              "path": "记忆"
            }
          ],
          "excludeSelf": true
        },
        "cap": 3
      }
    },
    {
      "type": "shield",
      "value": 3,
      "summary": "每第2次登场且同行至少2名其他记忆或风伙伴，获得3护盾",
      "trigger": "appearance",
      "duration": "resource",
      "target": "self",
      "stacking": "additive",
      "scaleWithTraining": true,
      "every": 2,
      "scaleWithStars": true,
      "condition": {
        "metric": "row",
        "filter": {
          "anyOf": [
            {
              "element": "风"
            },
            {
              "path": "记忆"
            }
          ],
          "excludeSelf": true
        },
        "op": "gte",
        "value": 2
      }
    }
  ],
  "description": "每名相邻的记忆或风伙伴恢复3生命，最多3名。每第2次登场且同行至少2名其他记忆或风伙伴，获得3护盾。",
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Robin_%E2%80%A2_Summeretto",
  "kitVersion": 6,
  "role": "defense",
  "roleLabel": "防御"
}
```
