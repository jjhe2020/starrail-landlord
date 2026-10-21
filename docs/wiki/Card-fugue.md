# 忘归人

[首页](Home) · [角色](Cards) · [奇物](Relics) · [精华](Essences) · [机制时序](Effects-and-Timing) · [羁绊](Synergies)

版本 **v0.7.0** · 内容基线 `e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`。数据：[src/content.js:4315](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/content.js#L4315)；执行：[src/effect-rules.js:98–174](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/effect-rules.js#L98-L174)、[src/engine.js:71–200](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/engine.js#L71-L200)。

相邻的火或毁灭扩散攻击者本轮对敌伤害增加36%。

## 基础数据与公开标签

| 项目 | 内容 |
| --- | --- |
| 角色ID | `fugue` |
| 英文名 | Fugue |
| 游戏稀有度 | 史诗 |
| 基础威力 | 0.35 |
| 主职能 | [敌方干扰](Cards#role) |
| 攻击形态 | [支援](Cards#attack) |
| 命途 | [虚无](Synergy-nihility) |
| 属性 | [火](Synergy-fire) |
| 阵营 | [仙舟罗浮](Synergy-xianzhou) |
| 技能规则版 | kitVersion=6 |
| 资料状态 | `released`（不是招募资格门槛） |
| 原作星级 | 5（资料归属；不是本游戏稀有度或合成星级） |

招募池包括当前全部90个定义，`publicationStatus` 不作为过滤条件。内部拿牌偏好代号不提供任何技能条件。

## 常规攻击与成长

- 无修正的1/2/3星基础威力：**0.35 / 1.05 / 3.15**。非攻击主职能：成长不加入攻击威力；仅 scaleWithTraining=true 的专职技能按每点8%、最多12点增强。
- 支援形态不执行常规攻击；它仍有威力数值，供最强目标、技能或机制读取。完整命中、装甲、易伤、四舍五入见[战斗](Combat)。

## 技能明细

条件在该技能实际阶段读取。位置与人数定义见[棋盘与目标](Board-and-Targeting)；未标记星级/培养缩放的字段保持固定值。

### 技能 1：限定攻击者的对敌易伤

相邻的火或毁灭扩散攻击者本轮对敌伤害增加36%

| 字段 | 精确口径 |
| --- | --- |
| 类型 | 限定攻击者的对敌易伤（`vulnerability`） |
| 触发 | 来源实例实际登场时（登场计数已先加1） |
| 阶段 | 默认 beforeAttacks；被动倍率在实际收益调用处使用 |
| 门槛 | 无额外数值门槛（仍需来源与触发成立） |
| 目标 | 来源相邻八格 |
| 目标筛选 | （属性为[火](Synergy-fire) 或 命途为[毁灭](Synergy-destruction)），且攻击形态为[扩散](Cards#attack)，且主职能为[攻击](Cards#role) |
| 基础数值公式 | 0.36 × T |
| 持续 | 本次转动；下次重算 |
| 叠加元数据 | `additive`；实际加法、乘法与上限见下列结算规则 |

- 为选出的攻击者 UID 登记本轮易伤增量；命中时还检查公开标签。只有攻击主职能的常规攻击，或以该攻击者为行动者的角色/羁绊追加伤害可以受益，奇物追加伤害不受益。同次匹配增量相加，上限75%，伤害乘1+min(0.75, 合计增量)，在装甲与实际剩余生命截断前生效。
- 此效果数值不随1/3/9星级倍率自动放大；来源最终威力参与的追击仍间接受星级影响。
- T=1+0.08×min(12,max(0,来源成长))，最大1.96；攻击主职能的T恒为1。倍率效果只放大相对1的部分。

## 关联与互引

以下按角色定义的公开标签列出候选身份；仍须满足当前实例的位置、星级、临时/见习身份和触发条件。同名另一实例仍是独立UID。

- 正式羁绊：[仙舟同盟](Synergy-xianzhou)、[虚无](Synergy-nihility)、[烈焰编队](Synergy-fire)。身份计数、不同ID与临时/见习排除规则见[正式羁绊](Synergies)。
- （属性为[火](Synergy-fire) 或 命途为[毁灭](Synergy-destruction)），且攻击形态为[扩散](Cards#attack)，且主职能为[攻击](Cards#role)：[姬子](Card-1003)、[阿兰](Card-1008)、[克拉拉](Card-1107)、[虎克](Card-1109)、[刃](Card-1205)、[镜流](Card-1212)、[雪衣](Card-1214)、[云璃](Card-1221)、[流萤](Card-1310)、[米沙](Card-1312)、[万敌](Card-1404)、[白厄](Card-1408)、[丹恒·饮月](Card-dan_heng_imbibitor_lunae)、[Saber](Card-saber)、[火花](Card-sparxie)、[千冶·刃](Card-mortenax_blade)、[吉尔伽美什](Card-announced_gilgamesh)。
- 共享至少一个命途、属性或阵营标签：[姬子](Card-1003)、[瓦尔特](Card-1004)、[卡芙卡](Card-1005)、[银狼](Card-1006)、[艾丝妲](Card-1009)、[佩拉](Card-1106)、[桑博](Card-1108)、[虎克](Card-1109)、[景元](Card-1204)、[罗刹](Card-1203)、[符玄](Card-1208)、[青雀](Card-1201)、[停云](Card-1202)、[卢卡](Card-1111)、[托帕&账账](Card-1112)、[素裳](Card-1206)、[驭空](Card-1207)、[彦卿](Card-1209)、[桂乃芬](Card-1210)、[白露](Card-1211)、[镜流](Card-1212)、[雪衣](Card-1214)、[寒鸦](Card-1215)、[藿藿](Card-1217)、[椒丘](Card-1218)、[灵砂](Card-1222)、[加拉赫](Card-1301)、[黑天鹅](Card-1307)、[黄泉](Card-1308)、[流萤](Card-1310)、[赛飞儿](Card-1406)、[海瑟音](Card-hysilens)、[火花](Card-sparxie)、[千冶·刃](Card-mortenax_blade)、[大丽花](Card-the_dahlia)、[姬子·启行](Card-announced_himeko_nova)。
- 有公开标签筛选可匹配本角色的奇物/精华：[虚无火漆](Relic-nihility_wax)、[博士之袍](Relic-doctor_robe)、[跃迁复眼](Relic-compound_eye)、[空无烛剪](Relic-void_wick)、[欢愉火漆](Relic-elation_wax)、[繁育火漆](Relic-propagation_wax)、[时空棱镜](Relic-spacetime_prism)、[塔拉毒火焰](Relic-tala_flame)、[虚无火漆·精华](Essence-essence_nihility)、[空无烛剪·精华](Essence-essence_void_wick)、[时空棱镜·精华](Essence-essence_prism)、[跃迁复眼·精华](Essence-essence_compound_eye)、[欢愉火漆·精华](Essence-essence_elation_wax)、[塔拉毒火焰·精华](Essence-essence_tala)。

## 精确数据与来源

下列为不含美术字段的当前角色定义；与[效果时序](Effects-and-Timing)和[复原规格](Reproduction)一起使用。技能为本作改编，不是原作战斗技能。

```json
{
  "id": "fugue",
  "name": "忘归人",
  "enName": "Fugue",
  "rarity": "rare",
  "attack": "support",
  "power": 0.35,
  "path": "虚无",
  "element": "火",
  "faction": "仙舟罗浮",
  "description": "相邻的火或毁灭扩散攻击者本轮对敌伤害增加36%。",
  "effects": [
    {
      "type": "vulnerability",
      "value": 0.36,
      "summary": "相邻的火或毁灭扩散攻击者本轮对敌伤害增加36%",
      "trigger": "appearance",
      "duration": "spin",
      "target": "adjacent",
      "stacking": "additive",
      "scaleWithTraining": true,
      "filter": {
        "role": "attack",
        "anyOf": [
          {
            "element": "火"
          },
          {
            "path": "毁灭"
          }
        ],
        "attack": "blast"
      }
    }
  ],
  "adaptation": "本作改编能力",
  "officialRarity": 5,
  "publicationStatus": "released",
  "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Fugue",
  "kitVersion": 6,
  "role": "disruptor",
  "roleLabel": "敌方干扰"
}
```
