# 星神★阿哈

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:5777](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L5777)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

相邻的量子、欢愉或假面愚者攻击者本轮威力×1.55。每第3次登场且位于角落，获得1信用点。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `aeon_star_aha` |
| 英文名 | Aeon ★ Aha |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [即时增幅](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [欢愉](Cards#path) |
| 属性 | [量子](Synergy-quantum) |
| 阵营 | [假面愚者](Cards#faction) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `announced`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：威力倍率

相邻的量子、欢愉或假面愚者攻击者本轮威力×1.55

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 威力倍率（`powerMultiplier`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源相邻八格 |
| 目标筛选 | （命途为[欢愉](Cards#path) 或 阵营为[假面愚者](Cards#faction) 或 属性为[量子](Synergy-quantum)），且主职能为[攻击](Cards#role) |
| 基础数值公式 | max(0.05, 1 + (1.55 − 1) × T) |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `multiplicative`；实际加法、乘法与上限见下列结算规则 |

- 只放大本轮威力；同一目标受到现代即时增幅者的倍率相乘后共同封顶×2.2，超出的部分不生效。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

### 技能 2：资源收入

每第3次登场且位于角落，获得1信用点

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 资源收入（`resource`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 位于角落时为1，否则为0=1 |
| 目标 | 信用点；`target` 元数据不将共享资源复制为每位队友一份 |
| 目标筛选 | 无额外公开标签筛选 |
| 基础数值公式 | 1 |
| 持续 | 进入共享资源存量，保留至消耗、衰减或上限截断 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 信用点收入先取max(0, 数值)；信用点保留两位小数，重掷/移除向下取整。资源存量跨轮、跨关保留。
- every=3：appearance使用该实例已加1后的ticks，其余触发使用本关round；计数必须>0且整除。不会按全局总转动数计算。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[量子编队](Synergy-quantum)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （命途为[欢愉](Cards#path) 或 阵营为[假面愚者](Cards#faction) 或 属性为[量子](Synergy-quantum)），且主职能为[攻击](Cards#role)：[希儿](Card-1102)、[青雀](Card-1201)、[雪衣](Card-1214)、[翡翠](Card-1314)、[遐蝶](Card-1407)、[Archer](Card-archer)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)。
- 共享至少一个命途、属性或阵营标签：[银狼](Card-1006)、[希儿](Card-1102)、[符玄](Card-1208)、[青雀](Card-1201)、[玲可](Card-1110)、[雪衣](Card-1214)、[花火](Card-1306)、[翡翠](Card-1314)、[缇宝](Card-1403)、[赛飞儿](Card-1406)、[遐蝶](Card-1407)、[Archer](Card-archer)、[爻光](Card-yao_guang)、[火花](Card-sparxie)、[银狼LV.999](Card-silver_wolf_lv999)、[绯英](Card-evanescia)、[远坂凛](Card-announced_rin_tohsaka)、[阿哈](Card-aha)、[真珠](Card-pearl)、[砂金·戏浪](Card-aventurine_waveflair)。
- 有公开标签筛选可匹配本角色的奇物/精华：[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[信标着色剂](Relic-beacon_colorant)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[信标着色剂·精华](Essence-essence_colorant)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "aeon_star_aha",
  "name": "星神★阿哈",
  "enName": "Aeon ★ Aha",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "欢愉",
  "element": "量子",
  "faction": "假面愚者",
  "effects": [
    {
      "type": "powerMultiplier",
      "value": 1.55,
      "summary": "相邻的量子、欢愉或假面愚者攻击者本轮威力×1.55",
      "trigger": "appearance",
      "duration": "spin",
      "target": "adjacent",
      "stacking": "multiplicative",
      "scaleWithTraining": true,
      "filter": {
        "role": "attack",
        "anyOf": [
          {
            "path": "欢愉"
          },
          {
            "faction": "假面愚者"
          },
          {
            "element": "量子"
          }
        ]
      }
    },
    {
      "type": "resource",
      "value": 1,
      "summary": "每第3次登场且位于角落，获得1信用点",
      "trigger": "appearance",
      "duration": "resource",
      "target": "self",
      "stacking": "additive",
      "resource": "coins",
      "every": 3,
      "condition": {
        "metric": "corner",
        "op": "eq",
        "value": 1
      }
    }
  ],
  "description": "相邻的量子、欢愉或假面愚者攻击者本轮威力×1.55。每第3次登场且位于角落，获得1信用点。",
  "adaptation": "本作改编能力；公开名单标注已公布，非官方技能复刻；公开人物画像尚未离线收录，头像为文字标识",
  "officialRarity": 5,
  "publicationStatus": "announced",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aeon_%E2%98%85_Aha",
  "kitVersion": 6,
  "role": "amplifier",
  "roleLabel": "即时辅助"
}
```
