# 奇物完整非美术参数

[完整内容参数总入口](Data-Content) · [奇物百科](Relics) · [复原规格](Reproduction)

基线 **v0.7.0**、`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`，共64条。以下是整个库的显式定义；字段省略时使用[效果解释器](Effects-and-Timing)中的默认值。legacy专用规则见[数据总入口](Data-Content)。

```json
[
  {
    "id": "cosmic_lotto",
    "name": "银河大乐透",
    "rarity": "uncommon",
    "description": "持有期间，每次转动有20%概率使全队本次威力×1.5；下次转动重新判定。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "每次转动有20%概率使全队本次威力×1.5",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5,
        "chance": 0.2,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "fortune_glue",
    "name": "福灵胶",
    "rarity": "uncommon",
    "description": "持有期间，招募中的史诗、传说出现权重提高50%；不会永久叠乘。",
    "effects": [
      {
        "type": "rarityMultiplier",
        "summary": "持有时，史诗与传说招募权重各×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "unique",
        "value": 1.5,
        "rarity": [
          "rare",
          "legendary"
        ],
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "gold_coin",
    "name": "天外重声大碟",
    "rarity": "common",
    "description": "持有期间，所有登场角色的本次威力+0.3；每次重新计算，不永久叠加。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，每次登场角色威力+0.3；每次重新计算",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.3,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "faith_bond",
    "name": "信仰债券",
    "rarity": "common",
    "description": "每次转动获得3信用点，可保存后用于重掷或补给。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动获得3信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 3,
        "resource": "coins",
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "preservation_wax",
    "name": "存护火漆",
    "rarity": "uncommon",
    "description": "持有期间，护盾获取量×1.5；进入新关时获得8基础护盾。",
    "effects": [
      {
        "type": "shieldMultiplier",
        "summary": "持有时，护盾获取量×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5,
        "legacy": true
      },
      {
        "type": "shield",
        "summary": "进入新关时获得8基础护盾",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 8,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "abundance_wax",
    "name": "丰饶火漆",
    "rarity": "uncommon",
    "description": "持有期间，治疗量×1.5；取得时立即恢复20基础生命。",
    "effects": [
      {
        "type": "healMultiplier",
        "summary": "持有时，治疗量×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5,
        "legacy": true
      },
      {
        "type": "heal",
        "summary": "取得时立即恢复20基础生命，受治疗倍率影响",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 20,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "hunt_wax",
    "name": "巡猎火漆",
    "rarity": "uncommon",
    "description": "持有期间，单体攻击角色每次威力×1.3。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，单体角色每次威力×1.3",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.3,
        "filter": {
          "attack": "single"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "destruction_wax",
    "name": "毁灭火漆",
    "rarity": "uncommon",
    "description": "持有期间，扩散攻击角色每次威力×1.25。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，扩散角色每次威力×1.25",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.25,
        "filter": {
          "attack": "blast"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "erudition_wax",
    "name": "智识火漆",
    "rarity": "uncommon",
    "description": "持有期间，群体攻击角色每次威力×1.25。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，群体角色每次威力×1.25",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.25,
        "filter": {
          "attack": "aoe"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "harmony_wax",
    "name": "纯美骑士精神",
    "rarity": "rare",
    "description": "持有期间，相邻和定向辅助的威力平加增益×1.5；不永久叠加。",
    "effects": [
      {
        "type": "buffMultiplier",
        "summary": "持有时，相邻与定向辅助的威力平加增益×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "nihility_wax",
    "name": "虚无火漆",
    "rarity": "uncommon",
    "description": "持有期间，虚无角色的本次威力+1；每次重新计算。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，虚无角色每次威力+1",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "path": "虚无"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "dimension_dice",
    "name": "异木果实",
    "rarity": "rare",
    "description": "取得时，本局生命上限+15并恢复15基础生命；之后每次转动恢复2基础生命。",
    "effects": [
      {
        "type": "maxHp",
        "summary": "取得时，本局生命上限+15",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 15,
        "legacy": true
      },
      {
        "type": "heal",
        "summary": "取得时恢复15基础生命",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 15,
        "legacy": true
      },
      {
        "type": "heal",
        "summary": "每次转动恢复2基础生命",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "doctor_robe",
    "name": "博士之袍",
    "rarity": "rare",
    "description": "持有期间，二星和三星角色的本次威力×1.2。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，二星、三星角色每次威力×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2,
        "filter": {
          "starsMin": 2
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "chaos_trametes",
    "name": "混沌云芝",
    "rarity": "uncommon",
    "description": "每次转动有20%概率获得1次重掷；机会可保留至使用。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动有20%概率获得1次重掷",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "rerolls",
        "chance": 0.2,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "angel_debt",
    "name": "天使型谢债发行机",
    "rarity": "rare",
    "description": "每次完成一关后，额外获得8信用点和1次移除机会；资源可保留。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次过关后获得8信用点",
        "trigger": "clear",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 8,
        "resource": "coins",
        "legacy": true
      },
      {
        "type": "resource",
        "summary": "每次过关后获得1次移除机会",
        "trigger": "clear",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "removals",
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "insect_web",
    "name": "虫网",
    "rarity": "common",
    "description": "本次每有1位角色退场，获得4信用点并恢复2基础生命。",
    "effects": [
      {
        "type": "resource",
        "summary": "本次每退场1位角色，获得4信用点",
        "trigger": "retire",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 4,
        "resource": "coins",
        "per": {
          "metric": "retirements"
        },
        "legacy": true
      },
      {
        "type": "heal",
        "summary": "本次每退场1位角色，恢复2基础生命",
        "trigger": "retire",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "per": {
          "metric": "retirements"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "seal_stamp",
    "name": "公司咕咕钟",
    "rarity": "common",
    "description": "若取得时战斗尚未结束，本关立即多1次转动；持有期间每个新关也多1次转动。",
    "effects": [
      {
        "type": "extraSpin",
        "summary": "若取得时仍在战斗中，本关立即增加1次转动",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "legacy": true
      },
      {
        "type": "extraSpin",
        "summary": "持有期间，每个新关的转动上限+1",
        "trigger": "floor",
        "duration": "encounter",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "divination_candle",
    "name": "香涎干酪",
    "rarity": "rare",
    "description": "持有期间，羁绊的威力增益部分×1.5；不直接放大全队基础威力。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，羁绊的威力加成部分×1.5；不直接放大全队基础威力",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "matching",
        "stacking": "unique",
        "value": 1.5,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "broken_clock",
    "name": "碎星芳饵",
    "rarity": "legendary",
    "description": "持有期间，全队本次威力×1.2；取得时立即获得2次重掷。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，全队每次威力×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2,
        "legacy": true
      },
      {
        "type": "resource",
        "summary": "取得时立即获得2次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 2,
        "resource": "rerolls",
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "rubert_gear",
    "name": "鲁珀特帝国机械齿轮",
    "rarity": "rare",
    "description": "持有期间，角色的永久成长获取量×1.5；已获得的成长在之后保留。",
    "effects": [
      {
        "type": "growthMultiplier",
        "summary": "持有时，角色的永久成长获取量×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5,
        "legacy": true
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "dimensional_dice",
    "name": "降维骰子",
    "rarity": "rare",
    "description": "取得时获得2次重掷。每个新关开始时获得1信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "取得时获得2次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 2,
        "resource": "rerolls"
      },
      {
        "type": "resource",
        "summary": "每个新关开始时获得1信用点",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "compound_eye",
    "name": "跃迁复眼",
    "rarity": "uncommon",
    "description": "持有时，一星角色每次威力+0.4。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，一星角色每次威力+0.4",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.4,
        "filter": {
          "starsMin": 1,
          "starsMax": 1
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "uncertainty_box",
    "name": "测不准匣",
    "rarity": "uncommon",
    "description": "每第3次转动，获得1次重掷。",
    "effects": [
      {
        "type": "resource",
        "summary": "每第3次转动，获得1次重掷",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "every": 3,
        "resource": "rerolls"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "whispering_scroll",
    "name": "永不停嘴的羊皮卷",
    "rarity": "rare",
    "description": "每个新关开始时，对所有敌人各造成4伤害。",
    "effects": [
      {
        "type": "damage",
        "summary": "每个新关开始时，对所有敌人各造成4伤害",
        "trigger": "floor",
        "duration": "instant",
        "target": "team",
        "stacking": "additive",
        "value": 4
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "club_coupon",
    "name": "俱乐部券",
    "rarity": "common",
    "description": "取得时立即获得18信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "取得时立即获得18信用点",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 18,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "beauty_robe",
    "name": "纯美之袍",
    "rarity": "uncommon",
    "description": "持有时，按信用点÷30×0.12增加全队本次威力（最高+0.36，可为小数）。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，按信用点÷30×0.12增加全队本次威力（最高+0.36，可为小数）",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.12,
        "per": {
          "metric": "coins",
          "divisor": 30,
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "split_coin",
    "name": "分裂金币",
    "rarity": "common",
    "description": "每次转动，持有信用点≤12时获得2信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动，持有信用点≤12时获得2信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 2,
        "resource": "coins",
        "condition": {
          "metric": "coins",
          "op": "lte",
          "value": 12
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "invalid_printer",
    "name": "无效文字打印机",
    "rarity": "uncommon",
    "description": "每个新关开始时，获得1次重掷。",
    "effects": [
      {
        "type": "resource",
        "summary": "每个新关开始时，获得1次重掷",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "rerolls"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "void_wick",
    "name": "空无烛剪",
    "rarity": "uncommon",
    "description": "永久编队不多于16人时，全队每次威力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "永久编队不多于16人时，全队每次威力+0.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "condition": {
          "metric": "roster",
          "op": "lte",
          "value": 16,
          "filter": {
            "temporary": false
          }
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "omniscient_bag",
    "name": "万识囊",
    "rarity": "common",
    "description": "每次转动至少有4个生效羁绊时，获得2信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动至少有4个生效羁绊时，获得2信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 2,
        "resource": "coins",
        "condition": {
          "metric": "synergies",
          "op": "gte",
          "value": 4
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "impermanence_dice",
    "name": "万象无常骰",
    "rarity": "rare",
    "description": "持有时，角色永久成长获取量×1.2。取得时获得1次移除机会。",
    "effects": [
      {
        "type": "growthMultiplier",
        "summary": "持有时，角色永久成长获取量×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      },
      {
        "type": "resource",
        "summary": "取得时获得1次移除机会",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "resource": "removals"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "polyhedral_dice",
    "name": "闪耀的偏方三八面骰",
    "rarity": "uncommon",
    "description": "持有时，史诗角色招募权重×1.3。",
    "effects": [
      {
        "type": "rarityMultiplier",
        "summary": "持有时，史诗角色招募权重×1.3",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.3,
        "rarity": "rare"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "elation_wax",
    "name": "欢愉火漆",
    "rarity": "uncommon",
    "description": "持有时，临时角色每次威力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，临时角色每次威力+0.8",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "temporary": true
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "remembrance_wax",
    "name": "记忆火漆",
    "rarity": "uncommon",
    "description": "持有时，记忆角色每次威力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，记忆角色每次威力+0.8",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "path": "记忆"
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "propagation_wax",
    "name": "繁育火漆",
    "rarity": "rare",
    "description": "本次每登场1名临时角色，获得1护盾（最多5）。",
    "effects": [
      {
        "type": "shield",
        "summary": "本次每登场1名临时角色，获得1护盾（最多5）",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "present",
          "filter": {
            "temporary": true
          },
          "cap": 5
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "annihilation_wick",
    "name": "湮灭烛剪",
    "rarity": "uncommon",
    "description": "本次常规攻击后，按本次角色退场数量对所有存活敌人各追加1伤害（最多4名）。",
    "effects": [
      {
        "type": "damage",
        "summary": "本次常规攻击后，按本次角色退场数量对所有存活敌人各追加1伤害（最多4名）",
        "trigger": "retire",
        "duration": "instant",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "retirements",
          "cap": 4
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "realm_crown",
    "name": "换境桂冠",
    "rarity": "rare",
    "description": "每个新关开始时获得10护盾。",
    "effects": [
      {
        "type": "shield",
        "summary": "每个新关开始时获得10护盾",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 10
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "spacetime_prism",
    "name": "时空棱镜",
    "rarity": "rare",
    "description": "持有时，三星角色每次威力×1.3。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "持有时，三星角色每次威力×1.3",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.3,
        "filter": {
          "starsMin": 3
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "punklorde_spirit",
    "name": "朋克洛德精神",
    "rarity": "uncommon",
    "description": "每第3次转动，全队本次攻击无视装甲。",
    "effects": [
      {
        "type": "ignoreArmor",
        "summary": "每第3次转动，全队本次攻击无视装甲",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "every": 3
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "beacon_colorant",
    "name": "信标着色剂",
    "rarity": "uncommon",
    "description": "持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，每登场1名虚数角色，所有量子角色本次威力+0.2（最多4名）",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.2,
        "filter": {
          "element": "量子"
        },
        "per": {
          "metric": "present",
          "filter": {
            "element": "虚数"
          },
          "cap": 4
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "split_silver",
    "name": "分裂银币",
    "rarity": "common",
    "description": "每次转动获得1信用点。生命≤50%时，每次转动再获得1信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动获得1信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "coins"
      },
      {
        "type": "resource",
        "summary": "生命≤50%时，每次转动再获得1信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "coins",
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "family_ties",
    "name": "家族缘结",
    "rarity": "uncommon",
    "description": "持有时，匹诺康尼角色每次威力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，匹诺康尼角色每次威力+0.7",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "filter": {
          "faction": "匹诺康尼"
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "black_hole_trap",
    "name": "黑洞之阱",
    "rarity": "common",
    "description": "本次角色支援结算后生命满值，获得3信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "本次角色支援结算后生命满值，获得3信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 3,
        "resource": "coins",
        "condition": {
          "metric": "hpRatio",
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "interstellar_lotto",
    "name": "星际大乐透",
    "rarity": "rare",
    "description": "每次转动有12%概率获得10信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "每次转动有12%概率获得10信用点",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 10,
        "resource": "coins",
        "chance": 0.12
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "genius_gossip",
    "name": "天才俱乐部普通八卦",
    "rarity": "uncommon",
    "description": "持有时，至少登场3名智识角色则群体角色本次威力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，至少登场3名智识角色则群体角色本次威力+0.7",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "filter": {
          "attack": "aoe"
        },
        "condition": {
          "metric": "present",
          "op": "gte",
          "value": 3,
          "filter": {
            "path": "智识"
          }
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "chaos_medicine",
    "name": "混沌特效灵药",
    "rarity": "uncommon",
    "description": "每第3次转动恢复6基础生命。",
    "effects": [
      {
        "type": "heal",
        "summary": "每第3次转动恢复6基础生命",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 6,
        "every": 3
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "cavity_model",
    "name": "龋齿星系模型",
    "rarity": "rare",
    "description": "生命≤45%时，全队本次威力×1.15。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "生命≤45%时，全队本次威力×1.15",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.45
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "fools_mask",
    "name": "愚者面具",
    "rarity": "rare",
    "description": "每次转动有25%概率使全队本次威力×1.15。每次转动有25%概率获得6护盾，独立判定。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "每次转动有25%概率使全队本次威力×1.15",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "chance": 0.25
      },
      {
        "type": "shield",
        "summary": "每次转动有25%概率获得6护盾，独立判定",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 6,
        "chance": 0.25
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "fictional_machine",
    "name": "虚构机兵",
    "rarity": "uncommon",
    "description": "每次转动至少登场3名存护角色时，获得3护盾。",
    "effects": [
      {
        "type": "shield",
        "summary": "每次转动至少登场3名存护角色时，获得3护盾",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 3,
        "condition": {
          "metric": "present",
          "op": "gte",
          "value": 3,
          "filter": {
            "path": "存护"
          }
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "meteorite",
    "name": "人造陨石球",
    "rarity": "uncommon",
    "description": "每第4次转动，本次常规攻击后对所有存活敌人各追加2伤害。",
    "effects": [
      {
        "type": "damage",
        "summary": "每第4次转动，本次常规攻击后对所有存活敌人各追加2伤害",
        "trigger": "spin",
        "duration": "instant",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "every": 4
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "tala_flame",
    "name": "塔拉毒火焰",
    "rarity": "uncommon",
    "description": "持有时，火属性角色每次威力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，火属性角色每次威力+0.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "filter": {
          "element": "火"
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "pink_collision",
    "name": "粉红冲撞",
    "rarity": "common",
    "description": "每次转动生命≤50%时，获得3护盾。",
    "effects": [
      {
        "type": "shield",
        "summary": "每次转动生命≤50%时，获得3护盾",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 3,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "triangle_instrument",
    "name": "三角滚奏器",
    "rarity": "uncommon",
    "description": "持有时，辅助威力平加增益×1.2。",
    "effects": [
      {
        "type": "buffMultiplier",
        "summary": "持有时，辅助威力平加增益×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "evil_satellite",
    "name": "邪恶机械卫星#900",
    "rarity": "rare",
    "description": "每次转动敌人反击总伤害−1。",
    "effects": [
      {
        "type": "retaliationFlat",
        "summary": "每次转动敌人反击总伤害−1",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 1
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "whisker_powder",
    "name": "一撮胡须火药",
    "rarity": "uncommon",
    "description": "持有时，扩散角色每次威力+0.6。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，扩散角色每次威力+0.6",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.6,
        "filter": {
          "attack": "blast"
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "blood_badge",
    "name": "血锦之纪徽章",
    "rarity": "rare",
    "description": "持有时，毁灭角色每次威力+0.7。取得时恢复8基础生命。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，毁灭角色每次威力+0.7",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "filter": {
          "path": "毁灭"
        }
      },
      {
        "type": "heal",
        "summary": "取得时恢复8基础生命",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 8
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "wish_star",
    "name": "许愿星",
    "rarity": "uncommon",
    "description": "取得时获得3次重掷。",
    "effects": [
      {
        "type": "resource",
        "summary": "取得时获得3次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 3,
        "resource": "rerolls"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "mystery_box",
    "name": "猜不透匣",
    "rarity": "rare",
    "description": "取得时获得1次移除机会。取得时获得8信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "取得时获得1次移除机会",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "resource": "removals"
      },
      {
        "type": "resource",
        "summary": "取得时获得8信用点",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 8,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "sponge_king",
    "name": "海绵王",
    "rarity": "uncommon",
    "description": "取得时，本局生命上限+12。每次转动生命≤40%时，恢复2基础生命。",
    "effects": [
      {
        "type": "maxHp",
        "summary": "取得时，本局生命上限+12",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 12
      },
      {
        "type": "heal",
        "summary": "每次转动生命≤40%时，恢复2基础生命",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.4
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "peace_price",
    "name": "和平的代价",
    "rarity": "uncommon",
    "description": "持有时，护盾获取量×1.2。持有时，单体角色本次威力×0.95。",
    "effects": [
      {
        "type": "shieldMultiplier",
        "summary": "持有时，护盾获取量×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      },
      {
        "type": "powerMultiplier",
        "summary": "持有时，单体角色本次威力×0.95",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 0.95,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "corrupt_fruit",
    "name": "腐化异木果实",
    "rarity": "rare",
    "description": "取得时，本局生命上限+20。每次转动消耗1生命，最多降至1。持有时，治疗量×1.2。",
    "effects": [
      {
        "type": "maxHp",
        "summary": "取得时，本局生命上限+20",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 20
      },
      {
        "type": "selfDamage",
        "summary": "每次转动消耗1生命，最多降至1",
        "trigger": "spin",
        "duration": "instant",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "nonlethal": true
      },
      {
        "type": "healMultiplier",
        "summary": "持有时，治疗量×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "ruan_pouch",
    "name": "阿阮袋",
    "rarity": "uncommon",
    "description": "每个新关开始时获得4信用点。",
    "effects": [
      {
        "type": "resource",
        "summary": "每个新关开始时获得4信用点",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 4,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "stair_jellyfish",
    "name": "「楼梯上的水母」",
    "rarity": "uncommon",
    "description": "持有时，未触发精华的进度获取量×1.15。",
    "effects": [
      {
        "type": "essenceProgressMultiplier",
        "summary": "持有时，未触发精华的进度获取量×1.15",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15
      }
    ],
    "adaptation": "本作改编机制"
  },
  {
    "id": "organic_heart",
    "name": "「有机心脏」",
    "rarity": "rare",
    "description": "每次转动恢复1基础生命。每次转动获得1护盾。",
    "effects": [
      {
        "type": "heal",
        "summary": "每次转动恢复1基础生命",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 1
      },
      {
        "type": "shield",
        "summary": "每次转动获得1护盾",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 1
      }
    ],
    "adaptation": "本作改编机制"
  }
]
```
