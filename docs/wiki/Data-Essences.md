# 精华完整非美术参数

[完整内容参数总入口](Data-Content) · [精华百科](Essences) · [复原规格](Reproduction)

基线 **v0.7.0**、`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`，共32条。以下是整个库的显式定义；字段省略时使用[效果解释器](Effects-and-Timing)中的默认值。legacy专用规则见[数据总入口](Data-Content)。

```json
[
  {
    "id": "essence_elation",
    "name": "银河大乐透·精华",
    "rarity": "rare",
    "target": 100,
    "description": "取得后累计造成100伤害：结算达标后，从下次转动起全队威力×1.15，本局持续。",
    "progress": {
      "metric": "damage"
    },
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "达标后从下次转动起，本局全队威力×1.15",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_abundance",
    "name": "异木果实·精华",
    "rarity": "rare",
    "target": 6,
    "description": "取得后再转动6次：达标时生命上限永久+20，并按新上限治疗一次；治疗折价可能使实际生命未回满。",
    "progress": {
      "metric": "spins"
    },
    "effects": [
      {
        "type": "maxHp",
        "summary": "达标时立即使本局生命上限+20",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 20,
        "legacy": true
      },
      {
        "type": "heal",
        "summary": "达标时按新生命上限进行一次治疗；治疗折价可能使实际生命未回满",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 0,
        "fullRestore": true,
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_hunt",
    "name": "巡猎火漆·精华",
    "rarity": "rare",
    "target": 12,
    "description": "取得后单体角色累计登场12次：达标后从下次转动起单体威力×1.35，本局持续。",
    "progress": {
      "metric": "single"
    },
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "达标后从下次转动起，本局单体威力×1.35",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.35,
        "filter": {
          "attack": "single"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_destruction",
    "name": "毁灭火漆·精华",
    "rarity": "rare",
    "target": 8,
    "description": "取得后再转动8次：达标后从下次转动起所有角色每次威力+1，本局持续，不逐轮叠加。",
    "progress": {
      "metric": "spins"
    },
    "effects": [
      {
        "type": "power",
        "summary": "达标后从下次转动起，本局所有角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_erudition",
    "name": "智识火漆·精华",
    "rarity": "rare",
    "target": 10,
    "description": "取得后群体角色累计登场10次：达标后从下次转动起群体角色每次威力+1，本局持续。",
    "progress": {
      "metric": "aoe"
    },
    "effects": [
      {
        "type": "power",
        "summary": "达标后从下次转动起，本局群体角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "attack": "aoe"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_harmony",
    "name": "纯美骑士精神·精华",
    "rarity": "rare",
    "target": 12,
    "description": "取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队威力×1.1，本局持续。",
    "progress": {
      "metric": "synergies"
    },
    "effects": [
      {
        "type": "resource",
        "summary": "达标时立即获得3次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 3,
        "resource": "rerolls",
        "legacy": true
      },
      {
        "type": "powerMultiplier",
        "summary": "达标后从下次转动起，本局全队威力×1.1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.1,
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_preservation",
    "name": "存护火漆·精华",
    "rarity": "rare",
    "target": 30,
    "description": "取得后转动内累计实际自然获得30护盾（不计补给、入关赠盾）：之后护盾获取量×1.3，每个新关获得12基础护盾。",
    "progress": {
      "metric": "shield"
    },
    "effects": [
      {
        "type": "shieldMultiplier",
        "summary": "达标后从下次转动起，本局护盾获取量×1.3",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.3,
        "legacy": true
      },
      {
        "type": "shield",
        "summary": "达标后每个新关获得12基础护盾",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 12,
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_nihility",
    "name": "虚无火漆·精华",
    "rarity": "rare",
    "target": 8,
    "description": "取得后虚无角色累计登场8次：达标后从下次转动起虚无角色每次威力+1.5，本局持续。",
    "progress": {
      "metric": "nihility"
    },
    "effects": [
      {
        "type": "power",
        "summary": "达标后从下次转动起，本局虚无角色每次威力+1.5",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1.5,
        "filter": {
          "path": "虚无"
        },
        "legacy": true
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_split_coin",
    "name": "分裂金币·精华",
    "rarity": "rare",
    "target": 24,
    "progress": {
      "metric": "credits"
    },
    "description": "取得后累计转动内获得信用点（不计取得/通关奖励）达到24：达标时立即获得12信用点。之后本局全队每次威力+0.25。",
    "effects": [
      {
        "type": "resource",
        "summary": "达标时立即获得12信用点",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 12,
        "resource": "coins"
      },
      {
        "type": "power",
        "summary": "之后本局全队每次威力+0.25",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.25
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_dimensional_dice",
    "name": "降维骰子·精华",
    "rarity": "rare",
    "target": 4,
    "progress": {
      "metric": "rerolls"
    },
    "description": "取得后累计使用重掷达到4：达标时立即返还2次重掷。之后本局传说招募权重×1.2。",
    "effects": [
      {
        "type": "resource",
        "summary": "达标时立即返还2次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 2,
        "resource": "rerolls"
      },
      {
        "type": "rarityMultiplier",
        "summary": "之后本局传说招募权重×1.2",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2,
        "rarity": "legendary"
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_void_wick",
    "name": "空无烛剪·精华",
    "rarity": "rare",
    "target": 3,
    "progress": {
      "metric": "removals"
    },
    "description": "取得后累计使用移除达到3：之后本局，永久编队≤18人时全队每次威力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局，永久编队≤18人时全队每次威力+0.7",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "condition": {
          "metric": "roster",
          "op": "lte",
          "value": 18,
          "filter": {
            "temporary": false
          }
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_punklorde",
    "name": "朋克洛德精神·精华",
    "rarity": "rare",
    "target": 24,
    "progress": {
      "metric": "creditsSpent"
    },
    "description": "取得后累计消费信用点达到24：之后本局单体角色每次威力×1.15。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "之后本局单体角色每次威力×1.15",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_prism",
    "name": "时空棱镜·精华",
    "rarity": "rare",
    "target": 2,
    "progress": {
      "metric": "merges"
    },
    "description": "取得后累计完成合成达到2：之后本局二星、三星角色每次威力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局二星、三星角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "starsMin": 2
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_compound_eye",
    "name": "跃迁复眼·精华",
    "rarity": "rare",
    "target": 5,
    "progress": {
      "metric": "spins"
    },
    "description": "取得后累计转动达到5：之后本局一星角色每次威力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局一星角色每次威力+0.5",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "filter": {
          "starsMin": 1,
          "starsMax": 1
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_scroll",
    "name": "永不停嘴的羊皮卷·精华",
    "rarity": "rare",
    "target": 8,
    "progress": {
      "metric": "kills"
    },
    "description": "取得后累计击破敌列达到8：之后本局群体角色每次威力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局群体角色每次威力+0.8",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "attack": "aoe"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_beauty_robe",
    "name": "纯美之袍·精华",
    "rarity": "rare",
    "target": 6,
    "progress": {
      "metric": "spins"
    },
    "description": "取得后累计转动达到6：之后本局，持有信用点≥20时全队威力×1.12。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "之后本局，持有信用点≥20时全队威力×1.12",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.12,
        "condition": {
          "metric": "coins",
          "op": "gte",
          "value": 20
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_elation_wax",
    "name": "欢愉火漆·精华",
    "rarity": "rare",
    "target": 4,
    "progress": {
      "metric": "retirements"
    },
    "description": "取得后累计角色退场达到4：之后本局临时角色每次威力+1.2。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局临时角色每次威力+1.2",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1.2,
        "filter": {
          "temporary": true
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_remembrance",
    "name": "记忆火漆·精华",
    "rarity": "rare",
    "target": 6,
    "progress": {
      "metric": "spins"
    },
    "description": "取得后累计转动达到6：之后本局记忆角色每次威力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局记忆角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "path": "记忆"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_propagation",
    "name": "繁育火漆·精华",
    "rarity": "rare",
    "target": 3,
    "progress": {
      "metric": "retirements"
    },
    "description": "取得后累计角色退场达到3：达标时立即获得1次移除机会。之后本局护盾获取量×1.1。",
    "effects": [
      {
        "type": "resource",
        "summary": "达标时立即获得1次移除机会",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "resource": "removals"
      },
      {
        "type": "shieldMultiplier",
        "summary": "之后本局护盾获取量×1.1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.1
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_annihilation",
    "name": "湮灭烛剪·精华",
    "rarity": "rare",
    "target": 5,
    "progress": {
      "metric": "retirements"
    },
    "description": "取得后累计角色退场达到5：之后本局毁灭角色每次威力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局毁灭角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "path": "毁灭"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_realm_crown",
    "name": "换境桂冠·精华",
    "rarity": "rare",
    "target": 35,
    "progress": {
      "metric": "shield"
    },
    "description": "取得后累计实际获得护盾达到35：达标时立即获得12基础护盾。之后本局存护防御者的护盾获取量×1.15。",
    "effects": [
      {
        "type": "shield",
        "summary": "达标时立即获得12基础护盾",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 12
      },
      {
        "type": "shieldMultiplier",
        "summary": "之后本局存护防御者的护盾获取量×1.15",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "filter": {
          "path": "存护",
          "role": "defense"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_colorant",
    "name": "信标着色剂·精华",
    "rarity": "rare",
    "target": 10,
    "progress": {
      "metric": "single"
    },
    "description": "取得后累计单体角色登场达到10：之后本局量子角色每次威力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局量子角色每次威力+0.8",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "element": "量子"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_family",
    "name": "家族缘结·精华",
    "rarity": "rare",
    "target": 15,
    "progress": {
      "metric": "synergies"
    },
    "description": "取得后累计生效羁绊数达到15：之后本局匹诺康尼角色每次威力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局匹诺康尼角色每次威力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "faction": "匹诺康尼"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_trap",
    "name": "黑洞之阱·精华",
    "rarity": "rare",
    "target": 30,
    "progress": {
      "metric": "credits"
    },
    "description": "取得后累计转动内获得信用点（不计取得/通关奖励）达到30：达标时本局生命上限+8。达标时恢复8基础生命。",
    "effects": [
      {
        "type": "maxHp",
        "summary": "达标时本局生命上限+8",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 8
      },
      {
        "type": "heal",
        "summary": "达标时恢复8基础生命",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 8
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_genius",
    "name": "天才俱乐部普通八卦·精华",
    "rarity": "rare",
    "target": 12,
    "progress": {
      "metric": "aoe"
    },
    "description": "取得后累计群体角色登场达到12：之后本局智识角色每次威力×1.15。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "之后本局智识角色每次威力×1.15",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.15,
        "filter": {
          "path": "智识"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_medicine",
    "name": "混沌特效灵药·精华",
    "rarity": "rare",
    "target": 25,
    "progress": {
      "metric": "healing"
    },
    "description": "取得后累计实际恢复生命达到25：之后本局治疗量×1.2。",
    "effects": [
      {
        "type": "healMultiplier",
        "summary": "之后本局治疗量×1.2",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_cavity",
    "name": "龋齿星系模型·精华",
    "rarity": "rare",
    "target": 300,
    "progress": {
      "metric": "damage"
    },
    "description": "取得后累计造成伤害达到300：之后本局生命≤50%时，全队本次威力×1.18。",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "之后本局生命≤50%时，全队本次威力×1.18",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.18,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_satellite",
    "name": "邪恶机械卫星#900·精华",
    "rarity": "rare",
    "target": 7,
    "progress": {
      "metric": "spins"
    },
    "description": "取得后累计转动达到7：之后本局每次转动敌人反击总伤害−1。",
    "effects": [
      {
        "type": "retaliationFlat",
        "summary": "之后本局每次转动敌人反击总伤害−1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_tala",
    "name": "塔拉毒火焰·精华",
    "rarity": "rare",
    "target": 10,
    "progress": {
      "metric": "aoe"
    },
    "description": "取得后累计群体角色登场达到10：之后本局火属性角色每次威力+0.9。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局火属性角色每次威力+0.9",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.9,
        "filter": {
          "element": "火"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_whisker",
    "name": "一撮胡须火药·精华",
    "rarity": "rare",
    "target": 220,
    "progress": {
      "metric": "damage"
    },
    "description": "取得后累计造成伤害达到220：之后本局扩散角色每次威力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局扩散角色每次威力+0.8",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "attack": "blast"
        }
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_heart",
    "name": "「有机心脏」·精华",
    "rarity": "rare",
    "target": 30,
    "progress": {
      "metric": "healing"
    },
    "description": "取得后累计实际恢复生命达到30：达标时本局生命上限+10。之后本局治疗量×1.1。",
    "effects": [
      {
        "type": "maxHp",
        "summary": "达标时本局生命上限+10",
        "trigger": "acquire",
        "duration": "run",
        "target": "team",
        "stacking": "unique",
        "value": 10
      },
      {
        "type": "healMultiplier",
        "summary": "之后本局治疗量×1.1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.1
      }
    ],
    "adaptation": "本作条件解锁改编"
  },
  {
    "id": "essence_jellyfish",
    "name": "「楼梯上的水母」·精华",
    "rarity": "rare",
    "target": 16,
    "progress": {
      "metric": "synergies"
    },
    "description": "取得后累计生效羁绊数达到16：达标时立即获得2次重掷。之后本局其余未触发精华的进度获取量×1.1。",
    "effects": [
      {
        "type": "resource",
        "summary": "达标时立即获得2次重掷",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 2,
        "resource": "rerolls"
      },
      {
        "type": "essenceProgressMultiplier",
        "summary": "之后本局其余未触发精华的进度获取量×1.1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.1
      }
    ],
    "adaptation": "本作条件解锁改编"
  }
]
```
