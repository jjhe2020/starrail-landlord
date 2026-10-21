// Content names and images reference HoYoverse material; all abilities are this game's adaptations.
import { SYNERGIES } from './synergies.js';
export { SYNERGIES };
export const RARITY_LABELS = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };

export const BINDING_GROUPS = [
  {
    "id": "express",
    "name": "星穹远行",
    "memberIds": [
      "1001",
      "1002",
      "1003",
      "1004",
      "1009",
      "1207",
      "1313",
      "cyrene",
      "march_hunt",
      "dan_heng_imbibitor_lunae",
      "dan_heng_pt",
      "announced_himeko_nova"
    ],
    "description": "列车远行与智库接续：以同行伙伴作为保护、增幅和培养的边界。"
  },
  {
    "id": "hunters",
    "name": "猎手剧本",
    "memberIds": [
      "1005",
      "1006",
      "1205",
      "1310",
      "1301",
      "1303",
      "1306",
      "fugue",
      "silver_wolf_lv999",
      "mortenax_blade"
    ],
    "description": "猎手与击破协作者依剧本配合，外援不会自动适配所有攻击。"
  },
  {
    "id": "frost",
    "name": "筑城守望",
    "memberIds": [
      "1001",
      "1101",
      "1102",
      "1103",
      "1104",
      "1105",
      "1106",
      "1107",
      "1108",
      "1109",
      "1110",
      "1111",
      "1209",
      "1312",
      "dan_heng_pt",
      "pearl"
    ],
    "description": "城防、地下救护与护盾反击；保护和培养需要守望伙伴。"
  },
  {
    "id": "mentorship",
    "name": "仙舟授业",
    "memberIds": [
      "1204",
      "1202",
      "1203",
      "1208",
      "1206",
      "1207",
      "1209",
      "1210",
      "1211",
      "1212",
      "1214",
      "1215",
      "1217",
      "1218",
      "1220",
      "1221",
      "1222",
      "1223",
      "march_hunt",
      "dan_heng_imbibitor_lunae",
      "yao_guang"
    ],
    "description": "师承、军阵与医护接续，靠导师培养专职弟子。"
  },
  {
    "id": "puppet",
    "name": "空间站实验",
    "memberIds": [
      "1008",
      "1009",
      "1013",
      "1302",
      "1303",
      "1305",
      "1006",
      "1003",
      "the_herta",
      "announced_rin_tohsaka",
      "silver_wolf_lv999",
      "announced_himeko_nova",
      "1203",
      "1405"
    ],
    "description": "科员开题、周期实验与智识火力，实验培养有自己的受益名单。"
  },
  {
    "id": "follow_up",
    "name": "追加投资",
    "memberIds": [
      "1112",
      "1304",
      "1305",
      "1220",
      "1223",
      "march_hunt",
      "1107",
      "1221",
      "1309",
      "1314",
      "archer",
      "ashveil",
      "aventurine_waveflair",
      "pearl",
      "1218"
    ],
    "description": "追击攻击者、护盾风控、投资增幅和定向培养构成闭环。"
  },
  {
    "id": "ink_dot",
    "name": "虚无引爆",
    "memberIds": [
      "1004",
      "1005",
      "1106",
      "1108",
      "1111",
      "1210",
      "1218",
      "hysilens",
      "mortenax_blade",
      "1205",
      "1307",
      "1308",
      "1203",
      "1202"
    ],
    "description": "先施加来源受限的弱化，再由引爆攻击者兑现；持续记录提供培养。"
  },
  {
    "id": "recollection",
    "name": "忆灵共演",
    "memberIds": [
      "1402",
      "1403",
      "1404",
      "1405",
      "1406",
      "1407",
      "1408",
      "1409",
      "1312",
      "1313",
      "1307",
      "hysilens",
      "cyrene",
      "cerydra",
      "evernight",
      "robin_summeretto",
      "saber",
      "1206"
    ],
    "description": "记忆、召援与黄金裔共演；培养、援护和攻击各有职能。"
  },
  {
    "id": "elation",
    "name": "欢愉谢幕",
    "memberIds": [
      "1306",
      "aha",
      "aeon_star_aha",
      "1108",
      "1210",
      "1201",
      "1406",
      "1301",
      "1312",
      "sparxie",
      "yao_guang",
      "evanescia",
      "pearl",
      "aventurine_waveflair",
      "1208",
      "1105",
      "1109",
      "announced_gilgamesh",
      "announced_rin_tohsaka",
      "robin_summeretto"
    ],
    "description": "谢幕、周期爆发与舞台协作；热闹本身不会让全部角色永久成长。"
  },
  {
    "id": "break",
    "name": "击破接力",
    "memberIds": [
      "1310",
      "1317",
      "1315",
      "fugue",
      "1301",
      "1303",
      "1222",
      "1206",
      "1111",
      "1214",
      "the_dahlia",
      "saber",
      "announced_gilgamesh",
      "1403",
      "1215",
      "cerydra"
    ],
    "description": "击破攻击者配合火力弱化、医护、接力培养与定向号令。"
  }
];

export const CHARACTERS = [
  {
    "id": "1001",
    "name": "三月七",
    "enName": "March 7th",
    "assetId": 1001,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "存护",
    "element": "冰",
    "faction": "星穹列车",
    "description": "每名相邻远行或守望伙伴提供3护盾，最多3名。",
    "color": "#f9a8d4",
    "effects": [
      {
        "type": "shield",
        "value": 3,
        "summary": "每名相邻远行或守望伙伴提供3护盾，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "frost"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "express",
              "frost"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/March_7th",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "express",
      "frost"
    ]
  },
  {
    "id": "1002",
    "name": "丹恒",
    "enName": "Dan Heng",
    "assetId": 1002,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "巡猎",
    "element": "风",
    "faction": "星穹列车",
    "description": "同场有远行伙伴时，本次威力×1.3。每第4次登场且同场有远行伙伴，自身永久成长+0.15。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.3,
        "summary": "同场有远行伙伴时，本次威力×1.3",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express"
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
        "summary": "每第4次登场且同场有远行伙伴，自身永久成长+0.15",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "express"
    ]
  },
  {
    "id": "1003",
    "name": "姬子",
    "enName": "Himeko",
    "assetId": 1003,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "智识",
    "element": "火",
    "faction": "星穹列车",
    "description": "有实验或远行伙伴时，常规攻击后追加自身威力45%的轨道追击。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damage",
        "value": 0.45,
        "summary": "有实验或远行伙伴时，常规攻击后追加自身威力45%的轨道追击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "puppet"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Himeko",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "express",
      "puppet"
    ]
  },
  {
    "id": "1004",
    "name": "瓦尔特",
    "enName": "Welt",
    "assetId": 1004,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "虚数",
    "faction": "星穹列车",
    "description": "本轮远行或虚无引爆攻击者对敌伤害增加20%。有远行或引爆伙伴同场时，本轮敌人反击−1.2。",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.2,
        "summary": "本轮远行或虚无引爆攻击者对敌伤害增加20%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "express",
            "ink_dot"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationFlat",
        "value": 1.2,
        "summary": "有远行或引爆伙伴同场时，本轮敌人反击−1.2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "ink_dot"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Welt",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "express",
      "ink_dot"
    ]
  },
  {
    "id": "1005",
    "name": "卡芙卡",
    "enName": "Kafka",
    "assetId": 1005,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "雷",
    "faction": "星核猎手",
    "description": "本轮猎手或虚无引爆的扩散攻击者对敌伤害增加30%。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.3,
        "summary": "本轮猎手或虚无引爆的扩散攻击者对敌伤害增加30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "hunters",
            "ink_dot"
          ],
          "role": "attack",
          "attack": "blast"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Kafka",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "hunters",
      "ink_dot"
    ]
  },
  {
    "id": "1006",
    "name": "银狼",
    "enName": "Silver Wolf",
    "assetId": 1006,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "量子",
    "faction": "星核猎手",
    "description": "本轮猎手或实验的单体攻击者对敌伤害增加32%。至少2名猎手或实验伙伴同场时，本轮反击−1。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.32,
        "summary": "本轮猎手或实验的单体攻击者对敌伤害增加32%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "hunters",
            "puppet"
          ],
          "role": "attack",
          "attack": "single"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "至少2名猎手或实验伙伴同场时，本轮反击−1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "hunters",
              "puppet"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Silver_Wolf",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "hunters",
      "puppet"
    ]
  },
  {
    "id": "1008",
    "name": "阿兰",
    "enName": "Arlan",
    "assetId": 1008,
    "rarity": "common",
    "attack": "blast",
    "power": 2,
    "path": "毁灭",
    "element": "雷",
    "faction": "黑塔空间站",
    "description": "生命不高于50%时，自身本次威力×1.7。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.7,
        "summary": "生命不高于50%时，自身本次威力×1.7",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Arlan",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet"
    ]
  },
  {
    "id": "1009",
    "name": "艾丝妲",
    "enName": "Asta",
    "assetId": 1009,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "火",
    "faction": "黑塔空间站",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#fda4af",
    "effects": [
      {
        "type": "growth",
        "value": 0.3,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "express",
            "puppet"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Asta",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "express",
      "puppet"
    ]
  },
  {
    "id": "1013",
    "name": "黑塔",
    "enName": "Herta",
    "assetId": 1013,
    "rarity": "common",
    "attack": "aoe",
    "power": 2,
    "path": "智识",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "每第3次登场，向所有存活敌列追加自身威力65%的旋转追击。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.65,
        "summary": "每第3次登场，向所有存活敌列追加自身威力65%的旋转追击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Herta",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet"
    ]
  },
  {
    "id": "1101",
    "name": "布洛妮娅",
    "enName": "Bronya",
    "assetId": 1101,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "相邻同组攻击者本轮威力×1.45。",
    "color": "#bae6fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.45,
        "summary": "相邻同组攻击者本轮威力×1.45",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "frost"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Bronya",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "frost"
    ]
  },
  {
    "id": "1102",
    "name": "希儿",
    "enName": "Seele",
    "assetId": 1102,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "量子",
    "faction": "贝洛伯格",
    "description": "自身常规攻击击破后，向最近存活列追加自身威力90%的再现。单体突袭：本次威力×1.25。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "damage",
        "value": 0.9,
        "summary": "自身常规攻击击破后，向最近存活列追加自身威力90%的再现",
        "trigger": "kill",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "beforeAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "oncePerSpin": true
      },
      {
        "type": "powerMultiplier",
        "value": 1.25,
        "summary": "单体突袭：本次威力×1.25",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Seele",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost"
    ]
  },
  {
    "id": "1103",
    "name": "希露瓦",
    "enName": "Serval",
    "assetId": 1103,
    "rarity": "common",
    "attack": "aoe",
    "power": 2,
    "path": "智识",
    "element": "雷",
    "faction": "贝洛伯格",
    "description": "每名相邻守望伙伴使自身本次威力+0.45，最多3名。",
    "color": "#fde68a",
    "effects": [
      {
        "type": "power",
        "value": 0.45,
        "summary": "每名相邻守望伙伴使自身本次威力+0.45，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "frost"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Serval",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost"
    ]
  },
  {
    "id": "1104",
    "name": "杰帕德",
    "enName": "Gepard",
    "assetId": 1104,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "存护",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "每名同场守望伙伴提供4护盾，最多3名。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "shield",
        "value": 4,
        "summary": "每名同场守望伙伴提供4护盾，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost"
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gepard",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "frost"
    ]
  },
  {
    "id": "1105",
    "name": "娜塔莎",
    "enName": "Natasha",
    "assetId": 1105,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "每名同场守望或欢愉伙伴恢复2.5生命，最多3名。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 2.5,
        "summary": "每名同场守望或欢愉伙伴恢复2.5生命，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost",
              "elation"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Natasha",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "frost",
      "elation"
    ]
  },
  {
    "id": "1106",
    "name": "佩拉",
    "enName": "Pela",
    "assetId": 1106,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "本轮守望或引爆攻击者对敌伤害增加25%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.25,
        "summary": "本轮守望或引爆攻击者对敌伤害增加25%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "frost",
            "ink_dot"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Pela",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "frost",
      "ink_dot"
    ]
  },
  {
    "id": "1107",
    "name": "克拉拉",
    "enName": "Clara",
    "assetId": 1107,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "护盾达到8时，常规攻击后追加自身威力80%的史瓦罗反击。",
    "color": "#fca5a5",
    "effects": [
      {
        "type": "damage",
        "value": 0.8,
        "summary": "护盾达到8时，常规攻击后追加自身威力80%的史瓦罗反击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "shield",
          "op": "gte",
          "value": 8
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Clara",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost",
      "follow_up"
    ]
  },
  {
    "id": "1108",
    "name": "桑博",
    "enName": "Sampo",
    "assetId": 1108,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "本轮守望、引爆或欢愉攻击者对敌伤害增加20%。每名相邻同组伙伴令敌人本轮反击−0.5，最多3名。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.2,
        "summary": "本轮守望、引爆或欢愉攻击者对敌伤害增加20%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "frost",
            "ink_dot",
            "elation"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationFlat",
        "value": 0.5,
        "summary": "每名相邻同组伙伴令敌人本轮反击−0.5，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost",
              "ink_dot",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "frost",
              "ink_dot",
              "elation"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sampo",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "frost",
      "ink_dot",
      "elation"
    ]
  },
  {
    "id": "1109",
    "name": "虎克",
    "enName": "Hook",
    "assetId": 1109,
    "rarity": "common",
    "attack": "blast",
    "power": 2,
    "path": "毁灭",
    "element": "火",
    "faction": "贝洛伯格",
    "description": "每第3次登场，引燃自身本次威力+1.3。同场有守望或欢愉伙伴时追加自身威力35%的爆破。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "power",
        "value": 1.3,
        "summary": "每第3次登场，引燃自身本次威力+1.3",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "every": 3
      },
      {
        "type": "damage",
        "value": 0.35,
        "summary": "同场有守望或欢愉伙伴时追加自身威力35%的爆破",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hook",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost",
      "elation"
    ]
  },
  {
    "id": "1205",
    "name": "刃",
    "enName": "Blade",
    "assetId": 1205,
    "rarity": "legendary",
    "attack": "blast",
    "power": 3.8,
    "path": "毁灭",
    "element": "风",
    "faction": "星核猎手",
    "description": "生命不高于55%时，自身本次威力×1.6。每第4次登场且生命不高于55%，自身永久成长+0.15。",
    "color": "#f87171",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.6,
        "summary": "生命不高于55%时，自身本次威力×1.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.55
        }
      },
      {
        "type": "growth",
        "value": 0.15,
        "summary": "每第4次登场且生命不高于55%，自身永久成长+0.15",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.55
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Blade",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "hunters",
      "ink_dot"
    ]
  },
  {
    "id": "1204",
    "name": "景元",
    "enName": "Jing Yuan",
    "assetId": 1204,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 3.8,
    "path": "智识",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "每第2次登场，神君向所有存活列追加自身威力80%的攻击。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.8,
        "summary": "每第2次登场，神君向所有存活列追加自身威力80%的攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jing_Yuan",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship"
    ]
  },
  {
    "id": "1203",
    "name": "罗刹",
    "enName": "Luocha",
    "assetId": 1203,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "有授业、引爆或实验伙伴同场时恢复5生命，溢出部分转为护盾。",
    "color": "#bef264",
    "effects": [
      {
        "type": "healOverflowShield",
        "value": 5,
        "summary": "有授业、引爆或实验伙伴同场时恢复5生命，溢出部分转为护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "puppet",
              "ink_dot"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "scaleWithStars": true,
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Luocha",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "mentorship",
      "puppet",
      "ink_dot"
    ]
  },
  {
    "id": "1208",
    "name": "符玄",
    "enName": "Fu Xuan",
    "assetId": 1208,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "存护",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "有授业或欢愉伙伴同场时获得5护盾。至少2名授业或欢愉伙伴同场时，敌人本轮反击×0.9。",
    "color": "#f0abfc",
    "effects": [
      {
        "type": "shield",
        "value": 5,
        "summary": "有授业或欢愉伙伴同场时获得5护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      },
      {
        "type": "retaliationMultiplier",
        "value": 0.9,
        "summary": "至少2名授业或欢愉伙伴同场时，敌人本轮反击×0.9",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Fu_Xuan",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "mentorship",
      "elation"
    ]
  },
  {
    "id": "1201",
    "name": "青雀",
    "enName": "Qingque",
    "assetId": 1201,
    "rarity": "common",
    "attack": "blast",
    "power": 2,
    "path": "智识",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "每第3次登场，凑齐牌面使本次威力×2.2。",
    "color": "#5eead4",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 2.2,
        "summary": "每第3次登场，凑齐牌面使本次威力×2.2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Qingque",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "elation"
    ]
  },
  {
    "id": "1202",
    "name": "停云",
    "enName": "Tingyun",
    "assetId": 1202,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "威力最高的1名其他同组攻击者本轮威力×1.55。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.55,
        "summary": "威力最高的1名其他同组攻击者本轮威力×1.55",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "mentorship",
            "ink_dot"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Tingyun",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "mentorship",
      "ink_dot"
    ]
  },
  {
    "id": "1110",
    "name": "玲可",
    "enName": "Lynx",
    "assetId": 1110,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "量子",
    "faction": "贝洛伯格",
    "description": "有守望伙伴同场时恢复3生命。有守望伙伴同场且生命不高于60%时，获得2护盾。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "heal",
        "value": 3,
        "summary": "有守望伙伴同场时恢复3生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      },
      {
        "type": "shield",
        "value": 2,
        "summary": "有守望伙伴同场且生命不高于60%时，获得2护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.6
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Lynx",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "frost"
    ]
  },
  {
    "id": "1111",
    "name": "卢卡",
    "enName": "Luka",
    "assetId": 1111,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "本轮守望或击破的单体攻击者对敌伤害增加30%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.3,
        "summary": "本轮守望或击破的单体攻击者对敌伤害增加30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "frost",
            "ink_dot",
            "break"
          ],
          "role": "attack",
          "attack": "single"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Luka",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "frost",
      "ink_dot",
      "break"
    ]
  },
  {
    "id": "1112",
    "name": "托帕&账账",
    "enName": "Topaz & Numby",
    "assetId": 1112,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "火",
    "faction": "星际和平公司",
    "description": "同场至少2名追加投资伙伴时，账账追加自身威力55%的攻击。自身常规击破后获得2信用点。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damage",
        "value": 0.55,
        "summary": "同场至少2名追加投资伙伴时，账账追加自身威力55%的攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      },
      {
        "type": "resource",
        "value": 2,
        "summary": "自身常规击破后获得2信用点",
        "trigger": "kill",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "oncePerSpin": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Topaz_%26_Numby",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "1206",
    "name": "素裳",
    "enName": "Sushang",
    "assetId": 1206,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "巡猎",
    "element": "物理",
    "faction": "仙舟罗浮",
    "description": "剩余不多于2列敌人时，自身本次威力×1.45。每第3次登场，剑势追加自身威力45%的攻击。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.45,
        "summary": "剩余不多于2列敌人时，自身本次威力×1.45",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "enemies",
          "op": "lte",
          "value": 2
        }
      },
      {
        "type": "damage",
        "value": 0.45,
        "summary": "每第3次登场，剑势追加自身威力45%的攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sushang",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship",
      "break",
      "recollection"
    ]
  },
  {
    "id": "1207",
    "name": "驭空",
    "enName": "Yukong",
    "assetId": 1207,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.35；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "growth",
        "value": 0.35,
        "summary": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.35；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "strongest",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "filter": {
          "groupsAny": [
            "express",
            "mentorship"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yukong",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "express",
      "mentorship"
    ]
  },
  {
    "id": "1209",
    "name": "彦卿",
    "enName": "Yanqing",
    "assetId": 1209,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "冰",
    "faction": "仙舟罗浮",
    "description": "持有至少5护盾时，自身本次威力×1.65。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.65,
        "summary": "持有至少5护盾时，自身本次威力×1.65",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "shield",
          "op": "gte",
          "value": 5
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yanqing",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost",
      "mentorship"
    ]
  },
  {
    "id": "1210",
    "name": "桂乃芬",
    "enName": "Guinaifen",
    "assetId": 1210,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "本轮授业、引爆或欢愉攻击者对敌伤害增加22%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.22,
        "summary": "本轮授业、引爆或欢愉攻击者对敌伤害增加22%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "mentorship",
            "ink_dot",
            "elation"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Guinaifen",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "mentorship",
      "ink_dot",
      "elation"
    ]
  },
  {
    "id": "1211",
    "name": "白露",
    "enName": "Bailu",
    "assetId": 1211,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "每名同场授业伙伴恢复3生命，最多3名。有授业伙伴同场且生命不高于35%时，获得3护盾。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "heal",
        "value": 3,
        "summary": "每名同场授业伙伴恢复3生命，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "shield",
        "value": 3,
        "summary": "有授业伙伴同场且生命不高于35%时，获得3护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.35
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Bailu",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "mentorship"
    ]
  },
  {
    "id": "1212",
    "name": "镜流",
    "enName": "Jingliu",
    "assetId": 1212,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "冰",
    "faction": "仙舟罗浮",
    "description": "生命不高于60%时，转魄使本次威力×1.65。每第3次登场追加自身威力40%的剑光。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.65,
        "summary": "生命不高于60%时，转魄使本次威力×1.65",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.6
        }
      },
      {
        "type": "damage",
        "value": 0.4,
        "summary": "每第3次登场追加自身威力40%的剑光",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jingliu",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship"
    ]
  },
  {
    "id": "1214",
    "name": "雪衣",
    "enName": "Xueyi",
    "assetId": 1214,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2.5,
    "path": "毁灭",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "每第3次登场，向最近存活列追加自身威力100%的天罚。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 1,
        "summary": "每第3次登场，向最近存活列追加自身威力100%的天罚",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Xueyi",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship",
      "break"
    ]
  },
  {
    "id": "1215",
    "name": "寒鸦",
    "enName": "Hanya",
    "assetId": 1215,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "物理",
    "faction": "仙舟罗浮",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2。有授业或击破伙伴同场时获得1信用点。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "growth",
        "value": 0.3,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "mentorship",
            "break"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "有授业或击破伙伴同场时获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hanya",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "mentorship",
      "break"
    ]
  },
  {
    "id": "1217",
    "name": "藿藿",
    "enName": "Huohuo",
    "assetId": 1217,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "风",
    "faction": "仙舟罗浮",
    "description": "每名同场授业伙伴恢复4生命，最多2名。每第3次登场且有授业伙伴同场，获得3护盾。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 4,
        "summary": "每名同场授业伙伴恢复4生命，最多2名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "cap": 2
        }
      },
      {
        "type": "shield",
        "value": 3,
        "summary": "每第3次登场且有授业伙伴同场，获得3护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Huohuo",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "mentorship"
    ]
  },
  {
    "id": "1218",
    "name": "椒丘",
    "enName": "Jiaoqiu",
    "assetId": 1218,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟曜青",
    "description": "本轮授业、引爆或追加投资攻击者对敌伤害增加24%。至少2名同组伙伴同场时，敌人本轮反击−1。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.24,
        "summary": "本轮授业、引爆或追加投资攻击者对敌伤害增加24%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "mentorship",
            "follow_up",
            "ink_dot"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "至少2名同组伙伴同场时，敌人本轮反击−1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "follow_up",
              "ink_dot"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jiaoqiu",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "mentorship",
      "follow_up",
      "ink_dot"
    ]
  },
  {
    "id": "1220",
    "name": "飞霄",
    "enName": "Feixiao",
    "assetId": 1220,
    "rarity": "legendary",
    "attack": "single",
    "power": 3.8,
    "path": "巡猎",
    "element": "风",
    "faction": "仙舟曜青",
    "description": "每第3次登场，向最近存活列追加自身威力115%的飞黄追击。同场有授业或追加投资伙伴时，本次威力×1.2。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damage",
        "value": 1.15,
        "summary": "每第3次登场，向最近存活列追加自身威力115%的飞黄追击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      },
      {
        "type": "powerMultiplier",
        "value": 1.2,
        "summary": "同场有授业或追加投资伙伴时，本次威力×1.2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Feixiao",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship",
      "follow_up"
    ]
  },
  {
    "id": "1221",
    "name": "云璃",
    "enName": "Yunli",
    "assetId": 1221,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "物理",
    "faction": "仙舟朱明",
    "description": "持有至少6护盾时，常规攻击后追加自身威力80%的看破。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damage",
        "value": 0.8,
        "summary": "持有至少6护盾时，常规攻击后追加自身威力80%的看破",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "shield",
          "op": "gte",
          "value": 6
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yunli",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship",
      "follow_up"
    ]
  },
  {
    "id": "1222",
    "name": "灵砂",
    "enName": "Lingsha",
    "assetId": 1222,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "每名同场授业或击破伙伴恢复3生命，最多3名。每第4次登场且有同组伙伴，浮元提供3护盾。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "value": 3,
        "summary": "每名同场授业或击破伙伴恢复3生命，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "break"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "shield",
        "value": 3,
        "summary": "每第4次登场且有同组伙伴，浮元提供3护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "mentorship",
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "every": 4
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Lingsha",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "mentorship",
      "break"
    ]
  },
  {
    "id": "1223",
    "name": "貊泽",
    "enName": "Moze",
    "assetId": 1223,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "巡猎",
    "element": "雷",
    "faction": "仙舟曜青",
    "description": "相邻角色不多于1名时，隐匿使本次威力×1.7。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.7,
        "summary": "相邻角色不多于1名时，隐匿使本次威力×1.7",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "neighbors",
          "op": "lte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Moze",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "mentorship",
      "follow_up"
    ]
  },
  {
    "id": "1301",
    "name": "加拉赫",
    "enName": "Gallagher",
    "assetId": 1301,
    "rarity": "common",
    "attack": "support",
    "power": 0.35,
    "path": "丰饶",
    "element": "火",
    "faction": "匹诺康尼",
    "description": "每名同场猎手、击破或欢愉伙伴恢复2生命，最多3名。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "value": 2,
        "summary": "每名同场猎手、击破或欢愉伙伴恢复2生命，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "hunters",
              "elation",
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "hunters",
              "elation",
              "break"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gallagher",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "hunters",
      "elation",
      "break"
    ]
  },
  {
    "id": "1302",
    "name": "银枝",
    "enName": "Argenti",
    "assetId": 1302,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2.5,
    "path": "智识",
    "element": "物理",
    "faction": "纯美骑士",
    "description": "每第4次登场，向所有存活列追加自身威力85%的纯美礼赞。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damage",
        "value": 0.85,
        "summary": "每第4次登场，向所有存活列追加自身威力85%的纯美礼赞",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 4
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Argenti",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet"
    ]
  },
  {
    "id": "1303",
    "name": "阮·梅",
    "enName": "Ruan Mei",
    "assetId": 1303,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "growth",
        "value": 0.4,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "hunters",
            "puppet",
            "break"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Ruan_Mei",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "hunters",
      "puppet",
      "break"
    ]
  },
  {
    "id": "1304",
    "name": "砂金",
    "enName": "Aventurine",
    "assetId": 1304,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "存护",
    "element": "虚数",
    "faction": "星际和平公司",
    "description": "每名同场追加投资伙伴提供3.5护盾，最多3名。有追加投资伙伴同场且护盾达到18时，获得1信用点。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "shield",
        "value": 3.5,
        "summary": "每名同场追加投资伙伴提供3.5护盾，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "有追加投资伙伴同场且护盾达到18时，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "conditions": [
          {
            "metric": "shield",
            "op": "gte",
            "value": 18
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aventurine",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "1305",
    "name": "真理医生",
    "enName": "Dr. Ratio",
    "assetId": 1305,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "虚数",
    "faction": "博识学会",
    "description": "每名同场追加投资或实验干扰者提供一次威力35%的追击，最多3名。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.35,
        "summary": "每名同场追加投资或实验干扰者提供一次威力35%的追击，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "puppet",
              "follow_up"
            ],
            "excludeSelf": true,
            "role": "disruptor"
          },
          "cap": 3
        },
        "scaleWithSourcePower": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dr._Ratio",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet",
      "follow_up"
    ]
  },
  {
    "id": "1306",
    "name": "花火",
    "enName": "Sparkle",
    "assetId": 1306,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "量子",
    "faction": "假面愚者",
    "description": "相邻同组攻击者本轮威力×1.45。每第4次登场且有同组伙伴同场，获得1次重掷。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.45,
        "summary": "相邻同组攻击者本轮威力×1.45",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "hunters",
            "elation"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第4次登场且有同组伙伴同场，获得1次重掷",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "resource": "rerolls",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "hunters",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sparkle",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "hunters",
      "elation"
    ]
  },
  {
    "id": "1307",
    "name": "黑天鹅",
    "enName": "Black Swan",
    "assetId": 1307,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "风",
    "faction": "流光忆庭",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.35；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "growth",
        "value": 0.35,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.35；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "ink_dot",
            "recollection"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Black_Swan",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "ink_dot",
      "recollection"
    ]
  },
  {
    "id": "1308",
    "name": "黄泉",
    "enName": "Acheron",
    "assetId": 1308,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 3.8,
    "path": "虚无",
    "element": "雷",
    "faction": "自灭者",
    "description": "每第3次登场，向所有存活列追加自身威力65%的终结斩。每名同场虚无引爆干扰者使自身本次威力+0.65，最多3名。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.65,
        "summary": "每第3次登场，向所有存活列追加自身威力65%的终结斩",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      },
      {
        "type": "power",
        "value": 0.65,
        "summary": "每名同场虚无引爆干扰者使自身本次威力+0.65，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "ink_dot"
            ],
            "excludeSelf": true,
            "role": "disruptor"
          },
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Acheron",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "ink_dot"
    ]
  },
  {
    "id": "1309",
    "name": "知更鸟",
    "enName": "Robin",
    "assetId": 1309,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "物理",
    "faction": "匹诺康尼",
    "description": "同场同组攻击者本轮威力×1.35。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.35,
        "summary": "同场同组攻击者本轮威力×1.35",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "follow_up"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Robin",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "1310",
    "name": "流萤",
    "enName": "Firefly",
    "assetId": 1310,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "火",
    "faction": "星核猎手",
    "description": "至少2名猎手或击破伙伴同场时，完全燃烧使本次威力×1.45。每第3次登场追加自身威力50%的超击破。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.45,
        "summary": "至少2名猎手或击破伙伴同场时，完全燃烧使本次威力×1.45",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "hunters",
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "每第3次登场追加自身威力50%的超击破",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Firefly",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "hunters",
      "break"
    ]
  },
  {
    "id": "1312",
    "name": "米沙",
    "enName": "Misha",
    "assetId": 1312,
    "rarity": "common",
    "attack": "blast",
    "power": 2,
    "path": "毁灭",
    "element": "冰",
    "faction": "匹诺康尼",
    "description": "每第3次登场，行李连击使自身本次威力×2。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 2,
        "summary": "每第3次登场，行李连击使自身本次威力×2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Misha",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "frost",
      "recollection",
      "elation"
    ]
  },
  {
    "id": "1313",
    "name": "星期日",
    "enName": "Sunday",
    "assetId": 1313,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "虚数",
    "faction": "匹诺康尼",
    "description": "威力最高的1名其他同组攻击者本轮威力×1.5。同场远行或共演临时攻击者本次威力+0.6。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.5,
        "summary": "威力最高的1名其他同组攻击者本轮威力×1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "express",
            "recollection"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      },
      {
        "type": "power",
        "value": 0.6,
        "summary": "同场远行或共演临时攻击者本次威力+0.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "scaleWithStars": true,
        "filter": {
          "groupsAny": [
            "express",
            "recollection"
          ],
          "role": "attack",
          "temporary": true
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sunday",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "express",
      "recollection"
    ]
  },
  {
    "id": "1314",
    "name": "翡翠",
    "enName": "Jade",
    "assetId": 1314,
    "rarity": "rare",
    "attack": "aoe",
    "power": 3,
    "path": "智识",
    "element": "量子",
    "faction": "星际和平公司",
    "description": "每名同场追加投资攻击者使翡翠追加自身威力25%的清算，最多3名。有追加投资伙伴同场时获得1信用点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.25,
        "summary": "每名同场追加投资攻击者使翡翠追加自身威力25%的清算，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true,
            "role": "attack"
          },
          "cap": 3
        },
        "scaleWithSourcePower": true
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "有追加投资伙伴同场时获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jade",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "1315",
    "name": "波提欧",
    "enName": "Boothill",
    "assetId": 1315,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2.5,
    "path": "巡猎",
    "element": "物理",
    "faction": "巡海游侠",
    "description": "仅剩1列敌人时，本次威力×1.75。自身常规击破后追加自身威力35%的决斗追击。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.75,
        "summary": "仅剩1列敌人时，本次威力×1.75",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "enemies",
          "op": "eq",
          "value": 1
        }
      },
      {
        "type": "damage",
        "value": 0.35,
        "summary": "自身常规击破后追加自身威力35%的决斗追击",
        "trigger": "kill",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "beforeAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "oncePerSpin": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Boothill",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "break"
    ]
  },
  {
    "id": "1317",
    "name": "乱破",
    "enName": "Rappa",
    "assetId": 1317,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2.5,
    "path": "智识",
    "element": "虚数",
    "faction": "巡海游侠",
    "description": "每列存活敌人使本次威力+0.35，最多5列。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "value": 0.35,
        "summary": "每列存活敌人使本次威力+0.35，最多5列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "enemies",
          "cap": 5
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Rappa",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "break"
    ]
  },
  {
    "id": "1402",
    "name": "阿格莱雅",
    "enName": "Aglaea",
    "assetId": 1402,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2.5,
    "path": "记忆",
    "element": "雷",
    "faction": "翁法罗斯",
    "description": "每第2次登场，衣匠追加自身威力60%的双人攻击。每第4次登场召来临时素裳，下次起可抽中，登场2次后离队。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.6,
        "summary": "每第2次登场，衣匠追加自身威力60%的双人攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2
      },
      {
        "type": "summon",
        "value": 1,
        "summary": "每第4次登场召来临时素裳，下次起可抽中，登场2次后离队",
        "trigger": "appearance",
        "duration": "appearances",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "characterId": "1206",
        "durationAppearances": 2
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aglaea",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "1403",
    "name": "缇宝",
    "enName": "Tribbie",
    "assetId": 1403,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "growth",
        "value": 0.3,
        "summary": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.3；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "strongest",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "filter": {
          "groupsAny": [
            "recollection",
            "break"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Tribbie",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "recollection",
      "break"
    ]
  },
  {
    "id": "1404",
    "name": "万敌",
    "enName": "Mydei",
    "assetId": 1404,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "虚数",
    "faction": "翁法罗斯",
    "description": "生命不高于55%时，战意使本次威力×1.6。每第3次登场追加自身威力45%的决战攻击。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.6,
        "summary": "生命不高于55%时，战意使本次威力×1.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.55
        }
      },
      {
        "type": "damage",
        "value": 0.45,
        "summary": "每第3次登场追加自身威力45%的决战攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Mydei",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "1405",
    "name": "那刻夏",
    "enName": "Anaxa",
    "assetId": 1405,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2.5,
    "path": "智识",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "每列空列使自身本次威力+0.45，最多4列。每第3次登场追加自身威力50%的演算追击。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "power",
        "value": 0.45,
        "summary": "每列空列使自身本次威力+0.45，最多4列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "emptyColumns",
          "cap": 4
        }
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "每第3次登场追加自身威力50%的演算追击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Anaxa",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet",
      "recollection"
    ]
  },
  {
    "id": "1406",
    "name": "赛飞儿",
    "enName": "Cipher",
    "assetId": 1406,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "本轮欢愉或共演的群体攻击者对敌伤害增加25%。每第2次登场且有同组伙伴同场，获得1信用点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.25,
        "summary": "本轮欢愉或共演的群体攻击者对敌伤害增加25%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "recollection",
            "elation"
          ],
          "role": "attack",
          "attack": "aoe"
        },
        "scaleWithTraining": true
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第2次登场且有同组伙伴同场，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "every": 2,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cipher",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "recollection",
      "elation"
    ]
  },
  {
    "id": "1407",
    "name": "遐蝶",
    "enName": "Castorice",
    "assetId": 1407,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 3.8,
    "path": "记忆",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "每名同场忆灵共演伙伴使自身本次威力+0.4，最多3名。每第3次登场，向所有存活敌列追加自身威力75%的死龙吐息。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.4,
        "summary": "每名同场忆灵共演伙伴使自身本次威力+0.4，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.75,
        "summary": "每第3次登场，向所有存活敌列追加自身威力75%的死龙吐息",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Castorice",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "1408",
    "name": "白厄",
    "enName": "Phainon",
    "assetId": 1408,
    "rarity": "legendary",
    "attack": "blast",
    "power": 3.8,
    "path": "毁灭",
    "element": "物理",
    "faction": "翁法罗斯",
    "description": "相邻角色不多于1名时，负世使本次威力×1.8。每第4次登场追加自身威力80%的黎明斩击。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.8,
        "summary": "相邻角色不多于1名时，负世使本次威力×1.8",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "neighbors",
          "op": "lte",
          "value": 1
        }
      },
      {
        "type": "damage",
        "value": 0.8,
        "summary": "每第4次登场追加自身威力80%的黎明斩击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 4
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Phainon",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "1409",
    "name": "风堇",
    "enName": "Hyacine",
    "assetId": 1409,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "记忆",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "有忆灵共演伙伴同场时恢复5生命。有忆灵共演伙伴同场时，按缺失生命的12%获得护盾，最多4.8。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 5,
        "summary": "有忆灵共演伙伴同场时恢复5生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      },
      {
        "type": "shield",
        "value": 0.12,
        "summary": "有忆灵共演伙伴同场时，按缺失生命的12%获得护盾，最多4.8",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "missingHp",
          "cap": 40
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hyacine",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "march_hunt",
    "name": "三月七·巡猎",
    "enName": "March 7th (The Hunt)",
    "assetId": 1224,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "巡猎",
    "element": "虚数",
    "faction": "星穹列车",
    "description": "至少1名相邻同组伙伴时，剑花追加自身威力45%的攻击。每第4次登场且相邻有同组伙伴，自身永久成长+0.15。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.45,
        "summary": "至少1名相邻同组伙伴时，剑花追加自身威力45%的攻击",
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
            "groupsAny": [
              "express",
              "mentorship",
              "follow_up"
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
        "summary": "每第4次登场且相邻有同组伙伴，自身永久成长+0.15",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "express",
              "mentorship",
              "follow_up"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/March_7th",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "express",
      "mentorship",
      "follow_up"
    ]
  },
  {
    "id": "dan_heng_imbibitor_lunae",
    "name": "丹恒·饮月",
    "enName": "Dan Heng • Imbibitor Lunae",
    "assetId": 1213,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "虚数",
    "faction": "星穹列车",
    "description": "每名同场远行或授业伙伴使自身本次威力+0.4，最多3名。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "value": 0.4,
        "summary": "每名同场远行或授业伙伴使自身本次威力+0.4，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "mentorship"
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Imbibitor_Lunae",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "express",
      "mentorship"
    ]
  },
  {
    "id": "dan_heng_pt",
    "name": "丹恒·腾荒",
    "enName": "Dan Heng • Permansor Terrae",
    "assetId": 1414,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "存护",
    "element": "物理",
    "faction": "星穹列车",
    "description": "每名同场远行或守望伙伴提供3.5护盾，最多3名。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "shield",
        "value": 3.5,
        "summary": "每名同场远行或守望伙伴提供3.5护盾，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "frost"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "frost"
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
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "express",
      "frost"
    ]
  },
  {
    "id": "fugue",
    "name": "忘归人",
    "enName": "Fugue",
    "assetId": 1225,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "本轮猎手或击破的扩散攻击者对敌伤害增加30%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.3,
        "summary": "本轮猎手或击破的扩散攻击者对敌伤害增加30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "hunters",
            "break"
          ],
          "role": "attack",
          "attack": "blast"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Fugue",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "hunters",
      "break"
    ]
  },
  {
    "id": "the_herta",
    "name": "大黑塔",
    "enName": "The Herta",
    "assetId": 1401,
    "rarity": "rare",
    "attack": "aoe",
    "power": 3,
    "path": "智识",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "每名同场实验攻击者使本次威力+0.5，最多3名。每第3次登场，向所有存活敌列追加自身威力50%的解题攻击。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.5,
        "summary": "每名同场实验攻击者使本次威力+0.5，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "puppet"
            ],
            "excludeSelf": true,
            "role": "attack"
          },
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "每第3次登场，向所有存活敌列追加自身威力50%的解题攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/The_Herta",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "puppet"
    ]
  },
  {
    "id": "hysilens",
    "name": "海瑟音",
    "enName": "Hysilens",
    "assetId": 1410,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "物理",
    "faction": "翁法罗斯",
    "description": "本轮引爆或共演攻击者对敌伤害增加28%。至少2名引爆或共演伙伴同场时，敌人本轮反击×0.9。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.28,
        "summary": "本轮引爆或共演攻击者对敌伤害增加28%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "ink_dot",
            "recollection"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationMultiplier",
        "value": 0.9,
        "summary": "至少2名引爆或共演伙伴同场时，敌人本轮反击×0.9",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "ink_dot",
              "recollection"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hysilens",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "ink_dot",
      "recollection"
    ]
  },
  {
    "id": "cerydra",
    "name": "刻律德菈",
    "enName": "Cerydra",
    "assetId": 1412,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "同谐",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "威力最高的1名其他同组攻击者本轮威力×1.6。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.6,
        "summary": "威力最高的1名其他同组攻击者本轮威力×1.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "recollection",
            "break"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cerydra",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "recollection",
      "break"
    ]
  },
  {
    "id": "evernight",
    "name": "长夜月",
    "enName": "Evernight",
    "assetId": 1413,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "记忆",
    "element": "冰",
    "faction": "翁法罗斯",
    "description": "每名同场忆灵共演辅助角色贡献一次自身威力40%的忆幕追击，最多2名。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.4,
        "summary": "每名同场忆灵共演辅助角色贡献一次自身威力40%的忆幕追击，最多2名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection"
            ],
            "excludeSelf": true,
            "roleNot": "attack"
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
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection"
    ]
  },
  {
    "id": "cyrene",
    "name": "昔涟",
    "enName": "Cyrene",
    "assetId": 1415,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "记忆",
    "element": "冰",
    "faction": "翁法罗斯",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.45；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "growth",
        "value": 0.45,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.45；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "express",
            "recollection"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cyrene",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "express",
      "recollection"
    ]
  },
  {
    "id": "saber",
    "name": "Saber",
    "enName": "Saber",
    "assetId": 1014,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "风",
    "faction": "异世界",
    "description": "每第3次登场，向所有存活敌列追加自身威力80%的誓约胜利之剑。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damage",
        "value": 0.8,
        "summary": "每第3次登场，向所有存活敌列追加自身威力80%的誓约胜利之剑",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Saber",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "recollection",
      "break"
    ]
  },
  {
    "id": "archer",
    "name": "Archer",
    "enName": "Archer",
    "assetId": 1015,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "量子",
    "faction": "异世界",
    "description": "每名相邻追加投资辅助角色贡献一次自身威力40%的投影追击，最多3名。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.4,
        "summary": "每名相邻追加投资辅助角色贡献一次自身威力40%的投影追击，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "follow_up"
            ],
            "excludeSelf": true,
            "roleNot": "attack"
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
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "yao_guang",
    "name": "爻光",
    "enName": "Yao Guang",
    "assetId": 1502,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "物理",
    "faction": "仙舟玉阙",
    "description": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "growth",
        "value": 0.4,
        "summary": "每第2次登场，威力最高的1名其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "strongest",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "filter": {
          "groupsAny": [
            "mentorship",
            "elation"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yao_Guang",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "mentorship",
      "elation"
    ]
  },
  {
    "id": "sparxie",
    "name": "火花",
    "enName": "Sparxie",
    "assetId": 1501,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2.5,
    "path": "欢愉",
    "element": "火",
    "faction": "假面愚者",
    "description": "本轮每名退场角色使自身本次威力+0.7，最多3名。每第2次登场追加自身威力40%的舞台爆破。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "value": 0.7,
        "summary": "本轮每名退场角色使自身本次威力+0.7，最多3名",
        "trigger": "spin",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "retirements",
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.4,
        "summary": "每第2次登场追加自身威力40%的舞台爆破",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sparxie",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "elation"
    ]
  },
  {
    "id": "ashveil",
    "name": "不死途",
    "enName": "Ashveil",
    "assetId": 1504,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "巡猎",
    "element": "雷",
    "faction": "巡海游侠",
    "description": "仅剩不多于2列敌人时，追猎追加自身威力65%的攻击。本次威力×1.25。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.65,
        "summary": "仅剩不多于2列敌人时，追猎追加自身威力65%的攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "enemies",
          "op": "lte",
          "value": 2
        }
      },
      {
        "type": "powerMultiplier",
        "value": 1.25,
        "summary": "本次威力×1.25",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Ashveil",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "follow_up"
    ]
  },
  {
    "id": "silver_wolf_lv999",
    "name": "银狼LV.999",
    "enName": "Silver Wolf LV.999",
    "assetId": 1506,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 3.8,
    "path": "欢愉",
    "element": "虚数",
    "faction": "星核猎手",
    "description": "每第3次登场，向所有存活列追加自身威力75%的满级连段。本轮每名退场角色使自身本次威力+0.6，最多3名。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.75,
        "summary": "每第3次登场，向所有存活列追加自身威力75%的满级连段",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      },
      {
        "type": "power",
        "value": 0.6,
        "summary": "本轮每名退场角色使自身本次威力+0.6，最多3名",
        "trigger": "spin",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
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
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "hunters",
      "puppet"
    ]
  },
  {
    "id": "evanescia",
    "name": "绯英",
    "enName": "Evanescia",
    "assetId": 1505,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "物理",
    "faction": "二相乐园",
    "description": "同场同组攻击者本轮威力×1.4。登场期间，同组防御者的护盾获取量×1.15。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.4,
        "summary": "同场同组攻击者本轮威力×1.4",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "elation"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true,
        "every": 2
      },
      {
        "type": "shieldMultiplier",
        "value": 1.15,
        "summary": "登场期间，同组防御者的护盾获取量×1.15",
        "trigger": "passive",
        "duration": "spin",
        "target": "matching",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "elation"
          ],
          "role": "defense"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Evanescia",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "elation"
    ]
  },
  {
    "id": "mortenax_blade",
    "name": "千冶·刃",
    "enName": "Mortenax Blade",
    "assetId": 1507,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "虚无",
    "element": "火",
    "faction": "星核猎手",
    "description": "每缺失10生命，本次威力+0.32，最多5份。每第3次登场追加自身威力50%的锻焰追击。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "value": 0.32,
        "summary": "每缺失10生命，本次威力+0.32，最多5份",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "missingHp",
          "divisor": 10,
          "cap": 5
        }
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "每第3次登场追加自身威力50%的锻焰追击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Mortenax_Blade",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "hunters",
      "ink_dot"
    ]
  },
  {
    "id": "the_dahlia",
    "name": "大丽花",
    "enName": "The Dahlia",
    "assetId": 1321,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "虚无",
    "element": "火",
    "faction": "焚化工",
    "description": "本轮击破接力攻击者对敌伤害增加32%。有击破伙伴相邻时，敌人本轮反击−1。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.32,
        "summary": "本轮击破接力攻击者对敌伤害增加32%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "matching",
        "stacking": "additive",
        "filter": {
          "groupsAny": [
            "break"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "有击破伙伴相邻时，敌人本轮反击−1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithTraining": true,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "break"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/The_Dahlia",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "groups": [
      "break"
    ]
  },
  {
    "id": "announced_himeko_nova",
    "name": "姬子·启行",
    "enName": "Himeko • Nova",
    "assetId": 1510,
    "rarity": "rare",
    "attack": "aoe",
    "power": 3,
    "path": "智识",
    "element": "火",
    "faction": "星穹列车",
    "description": "每名同场远行或实验伙伴贡献一次自身威力30%的启行追击，最多3名。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damage",
        "value": 0.3,
        "summary": "每名同场远行或实验伙伴贡献一次自身威力30%的启行追击，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "express",
              "puppet"
            ],
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Himeko_%E2%80%A2_Nova",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "express",
      "puppet"
    ]
  },
  {
    "id": "announced_gilgamesh",
    "name": "吉尔伽美什",
    "enName": "Gilgamesh",
    "assetId": 1509,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "毁灭",
    "element": "雷",
    "faction": "异世界",
    "description": "每列存活敌人使本次威力+0.35，最多5列。每第3次登场追加自身威力60%的王之财宝。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.35,
        "summary": "每列存活敌人使本次威力+0.35，最多5列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "per": {
          "metric": "enemies",
          "cap": 5
        }
      },
      {
        "type": "damage",
        "value": 0.6,
        "summary": "每第3次登场追加自身威力60%的王之财宝",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gilgamesh",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "attack",
    "roleLabel": "攻击",
    "groups": [
      "elation",
      "break"
    ]
  },
  {
    "id": "announced_rin_tohsaka",
    "name": "远坂凛",
    "enName": "Rin Tohsaka",
    "assetId": 1508,
    "rarity": "uncommon",
    "attack": "support",
    "power": 0.35,
    "path": "智识",
    "element": "量子",
    "faction": "异世界",
    "description": "相邻同组攻击者本轮威力×1.35。每第3次登场，相邻同组攻击者本次威力再+0.5。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.35,
        "summary": "相邻同组攻击者本轮威力×1.35",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "puppet",
            "elation"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true
      },
      {
        "type": "power",
        "value": 0.5,
        "summary": "每第3次登场，相邻同组攻击者本次威力再+0.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "scaleWithStars": true,
        "every": 3,
        "filter": {
          "groupsAny": [
            "puppet",
            "elation"
          ],
          "role": "attack"
        },
        "scaleWithTraining": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Rin_Tohsaka",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "puppet",
      "elation"
    ]
  },
  {
    "id": "aha",
    "name": "阿哈",
    "enName": "Aha",
    "assetId": "aha-symbol",
    "rarity": "legendary",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "无（改编）",
    "faction": "星神",
    "description": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2。每第4次登场且有欢愉伙伴同场，获得1次重掷。",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "growth",
        "value": 0.4,
        "summary": "每第3次登场，按格位顺序选择至多2名相邻其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "groupsAny": [
            "elation"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第4次登场且有欢愉伙伴同场，获得1次重掷",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "resource": "rerolls",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "星神同行者为本作改编；无官方可玩星级或战斗属性；头像为文字标识",
    "officialRarity": null,
    "publicationStatus": "adapted-aeon",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aha",
    "portraitKind": "text-symbol",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "elation"
    ]
  },
  {
    "id": "pearl",
    "name": "真珠",
    "enName": "Pearl",
    "assetId": 1503,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "冰",
    "faction": "星际和平公司",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "growth",
        "value": 0.4,
        "summary": "每第3次登场，威力最高的1名其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2",
        "trigger": "appearance",
        "duration": "run",
        "target": "strongest",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 1,
        "filter": {
          "groupsAny": [
            "frost",
            "follow_up",
            "elation"
          ],
          "excludeSelf": true,
          "roleNot": "trainer",
          "temporary": false,
          "commission": false
        },
        "scaleWithStars": true,
        "starFactors": [
          0,
          1,
          1.5,
          2
        ]
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第3次登场且有守望、投资或欢愉伙伴同场，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 3,
        "resource": "coins",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "frost",
              "follow_up",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "description": "每第3次登场，威力最高的1名其他同组永久非培养角色永久成长+0.4；不培养临时、见习及培养者；培养量按星级×1/1.5/2。每第3次登场且有守望、投资或欢愉伙伴同场，获得1信用点。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Pearl",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "trainer",
    "roleLabel": "永久培养",
    "groups": [
      "frost",
      "follow_up",
      "elation"
    ]
  },
  {
    "id": "robin_summeretto",
    "name": "知更鸟·晴歌",
    "enName": "Robin • Summeretto",
    "assetId": 1512,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "记忆",
    "element": "风",
    "faction": "匹诺康尼",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 3,
        "summary": "每名相邻共演或欢愉伙伴恢复3生命，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "neighbors",
          "filter": {
            "groupsAny": [
              "recollection",
              "elation"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "shield",
        "value": 3,
        "summary": "每第2次登场且有同组伙伴，获得3护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "recollection",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "every": 2
      }
    ],
    "description": "每名相邻共演或欢愉伙伴恢复3生命，最多3名。每第2次登场且有同组伙伴，获得3护盾。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Robin_%E2%80%A2_Summeretto",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "recollection",
      "elation"
    ]
  },
  {
    "id": "aventurine_waveflair",
    "name": "砂金·戏浪",
    "enName": "Aventurine • Waveflair",
    "assetId": 1513,
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "量子",
    "faction": "星际和平公司",
    "color": "#e879f9",
    "effects": [
      {
        "type": "shield",
        "value": 2.8,
        "summary": "每名同场追加投资或欢愉伙伴提供2.8护盾，最多3名",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "scaleWithStars": true,
        "scaleWithTraining": true,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up",
              "elation"
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第3次登场且至少2名同组伙伴同场时，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "every": 3,
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "follow_up",
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        }
      }
    ],
    "description": "每名同场追加投资或欢愉伙伴提供2.8护盾，最多3名。每第3次登场且至少2名同组伙伴同场时，获得1信用点。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aventurine_%E2%80%A2_Waveflair",
    "portraitKind": "game-art",
    "kitVersion": 6,
    "role": "defense",
    "roleLabel": "防御",
    "groups": [
      "follow_up",
      "elation"
    ]
  },
  {
    "id": "aeon_star_aha",
    "name": "星神★阿哈",
    "enName": "Aeon ★ Aha",
    "assetId": "aeon-star-aha",
    "rarity": "rare",
    "attack": "support",
    "power": 0.35,
    "path": "欢愉",
    "element": "量子",
    "faction": "假面愚者",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "powerMultiplier",
        "value": 1.45,
        "summary": "同场同组攻击者本轮威力×1.45",
        "trigger": "spin",
        "duration": "spin",
        "target": "matching",
        "stacking": "multiplicative",
        "filter": {
          "groupsAny": [
            "elation"
          ],
          "role": "attack",
          "excludeSelf": true
        },
        "scaleWithTraining": true,
        "condition": {
          "metric": "retirements",
          "op": "gte",
          "value": 1
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第3次登场且有欢愉伙伴同场，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 3,
        "resource": "coins",
        "condition": {
          "metric": "present",
          "filter": {
            "groupsAny": [
              "elation"
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "description": "同场同组攻击者本轮威力×1.45。每第3次登场且有欢愉伙伴同场，获得1信用点。",
    "adaptation": "本作改编能力；公开名单标注已公布，非官方技能复刻；公开人物画像尚未离线收录，头像为文字标识",
    "officialRarity": 5,
    "publicationStatus": "announced",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aeon_%E2%98%85_Aha",
    "portraitKind": "text-symbol",
    "kitVersion": 6,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "groups": [
      "elation"
    ]
  }
];

export const ITEMS = [
  {
    "id": "cosmic_lotto",
    "name": "银河大乐透",
    "rarity": "uncommon",
    "icon": "🎟️",
    "description": "持有期间，每次转动有20%概率使全队本次威力×1.5；下次转动重新判定。",
    "image": "./public/assets/curios/1026.png",
    "assetId": 1026,
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
    "icon": "🧪",
    "description": "持有期间，招募中的史诗、传说出现权重提高50%；不会永久叠乘。",
    "image": "./public/assets/curios/1007.png",
    "assetId": 1007,
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
    "icon": "💿",
    "description": "持有期间，所有登场角色的本次威力+0.3；每次重新计算，不永久叠加。",
    "image": "./public/assets/curios/1031.png",
    "assetId": 1031,
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
    "icon": "📜",
    "description": "每次转动获得3信用点，可保存后用于重掷或补给。",
    "image": "./public/assets/curios/1013.png",
    "assetId": 1013,
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
    "icon": "🕯️",
    "description": "持有期间，护盾获取量×1.5；进入新关时获得8基础护盾。",
    "image": "./public/assets/curios/1020.png",
    "assetId": 1020,
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
    "icon": "🌱",
    "description": "持有期间，治疗量×1.5；取得时立即恢复20基础生命。",
    "image": "./public/assets/curios/1025.png",
    "assetId": 1025,
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
    "icon": "🏹",
    "description": "持有期间，单体攻击角色每次威力×1.3。",
    "image": "./public/assets/curios/1022.png",
    "assetId": 1022,
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
    "icon": "🔥",
    "description": "持有期间，扩散攻击角色每次威力×1.25。",
    "image": "./public/assets/curios/1023.png",
    "assetId": 1023,
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
    "icon": "📚",
    "description": "持有期间，群体攻击角色每次威力×1.25。",
    "image": "./public/assets/curios/1082.png",
    "assetId": 1082,
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
    "icon": "🎼",
    "description": "持有期间，相邻和定向辅助的威力平加增益×1.5；不永久叠加。",
    "image": "./public/assets/curios/1051.png",
    "assetId": 1051,
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
    "icon": "🌀",
    "description": "持有期间，虚无角色的本次威力+1；每次重新计算。",
    "image": "./public/assets/curios/1047.png",
    "assetId": 1047,
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
    "icon": "🍎",
    "description": "取得时，本局生命上限+15并恢复15基础生命；之后每次转动恢复2基础生命。",
    "image": "./public/assets/curios/1004.png",
    "assetId": 1004,
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
    "icon": "🥼",
    "description": "持有期间，二星和三星角色的本次威力×1.2。",
    "image": "./public/assets/curios/1011.png",
    "assetId": 1011,
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
    "icon": "🍄",
    "description": "每次转动有20%概率获得1次重掷；机会可保留至使用。",
    "image": "./public/assets/curios/1002.png",
    "assetId": 1002,
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
    "icon": "👼",
    "description": "每次完成一关后，额外获得8信用点和1次移除机会；资源可保留。",
    "image": "./public/assets/curios/1044.png",
    "assetId": 1044,
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
    "icon": "🕸️",
    "description": "本次每有1位角色退场，获得4信用点并恢复2基础生命。",
    "image": "./public/assets/curios/1019.png",
    "assetId": 1019,
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
    "icon": "⌛",
    "description": "若取得时战斗尚未结束，本关立即多1次转动；持有期间每个新关也多1次转动。",
    "image": "./public/assets/curios/1039.png",
    "assetId": 1039,
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
    "icon": "🧀",
    "description": "持有期间，羁绊的威力增益部分×1.5；不直接放大全队基础威力。",
    "image": "./public/assets/curios/1006.png",
    "assetId": 1006,
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
    "icon": "✨",
    "description": "持有期间，全队本次威力×1.2；取得时立即获得2次重掷。",
    "image": "./public/assets/curios/1029.png",
    "assetId": 1029,
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
    "icon": "⚙️",
    "description": "持有期间，角色的永久成长获取量×1.5；已获得的成长在之后保留。",
    "image": "./public/assets/curios/1070.png",
    "assetId": 1070,
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
    "icon": "🎲",
    "image": "./public/assets/curios/1001.png",
    "assetId": 1001,
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
    "icon": "👁️",
    "image": "./public/assets/curios/1003.png",
    "assetId": 1003,
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
    "icon": "📦",
    "image": "./public/assets/curios/1005.png",
    "assetId": 1005,
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
    "icon": "📜",
    "image": "./public/assets/curios/1008.png",
    "assetId": 1008,
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
    "icon": "🎫",
    "image": "./public/assets/curios/1012.png",
    "assetId": 1012,
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
    "icon": "👗",
    "image": "./public/assets/curios/1014.png",
    "assetId": 1014,
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
    "icon": "🪙",
    "image": "./public/assets/curios/1015.png",
    "assetId": 1015,
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
    "icon": "🖨️",
    "image": "./public/assets/curios/1016.png",
    "assetId": 1016,
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
    "icon": "✂️",
    "image": "./public/assets/curios/1017.png",
    "assetId": 1017,
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
    "icon": "🎒",
    "image": "./public/assets/curios/1030.png",
    "assetId": 1030,
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
    "icon": "🎲",
    "image": "./public/assets/curios/1034.png",
    "assetId": 1034,
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
    "icon": "🔷",
    "image": "./public/assets/curios/1035.png",
    "assetId": 1035,
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
    "icon": "🎭",
    "image": "./public/assets/curios/1021.png",
    "assetId": 1021,
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
    "icon": "❄️",
    "image": "./public/assets/curios/1024.png",
    "assetId": 1024,
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
    "icon": "🦋",
    "image": "./public/assets/curios/1052.png",
    "assetId": 1052,
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
    "icon": "🕯️",
    "image": "./public/assets/curios/1046.png",
    "assetId": 1046,
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
    "icon": "👑",
    "image": "./public/assets/curios/1032.png",
    "assetId": 1032,
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
    "icon": "🔮",
    "image": "./public/assets/curios/1028.png",
    "assetId": 1028,
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
    "icon": "💾",
    "image": "./public/assets/curios/1048.png",
    "assetId": 1048,
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
    "icon": "🖌️",
    "image": "./public/assets/curios/1036.png",
    "assetId": 1036,
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
    "icon": "🥈",
    "image": "./public/assets/curios/1045.png",
    "assetId": 1045,
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
    "icon": "🪢",
    "image": "./public/assets/curios/1057.png",
    "assetId": 1057,
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
    "icon": "🕳️",
    "image": "./public/assets/curios/1043.png",
    "assetId": 1043,
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
    "icon": "🎰",
    "image": "./public/assets/curios/1068.png",
    "assetId": 1068,
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
    "icon": "📰",
    "image": "./public/assets/curios/1063.png",
    "assetId": 1063,
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
    "icon": "💊",
    "image": "./public/assets/curios/1056.png",
    "assetId": 1056,
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
    "icon": "🪐",
    "image": "./public/assets/curios/1065.png",
    "assetId": 1065,
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
    "icon": "🤡",
    "image": "./public/assets/curios/1067.png",
    "assetId": 1067,
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
    "icon": "🤖",
    "image": "./public/assets/curios/1064.png",
    "assetId": 1064,
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
    "icon": "☄️",
    "image": "./public/assets/curios/1061.png",
    "assetId": 1061,
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
    "icon": "🔥",
    "image": "./public/assets/curios/1062.png",
    "assetId": 1062,
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
    "icon": "💗",
    "image": "./public/assets/curios/1060.png",
    "assetId": 1060,
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
    "icon": "🔺",
    "image": "./public/assets/curios/1033.png",
    "assetId": 1033,
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
    "icon": "🛰️",
    "image": "./public/assets/curios/1050.png",
    "assetId": 1050,
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
    "icon": "🧨",
    "image": "./public/assets/curios/1066.png",
    "assetId": 1066,
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
    "icon": "🎖️",
    "image": "./public/assets/curios/1069.png",
    "assetId": 1069,
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
    "icon": "⭐",
    "image": "./public/assets/curios/1042.png",
    "assetId": 1042,
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
    "icon": "🎁",
    "image": "./public/assets/curios/1037.png",
    "assetId": 1037,
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
    "icon": "🧽",
    "image": "./public/assets/curios/1072.png",
    "assetId": 1072,
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
    "icon": "🕊️",
    "image": "./public/assets/curios/1074.png",
    "assetId": 1074,
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
    "icon": "🍇",
    "image": "./public/assets/curios/1073.png",
    "assetId": 1073,
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
    "icon": "👜",
    "image": "./public/assets/curios/1078.png",
    "assetId": 1078,
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
    "icon": "🪼",
    "image": "./public/assets/curios/1081.png",
    "assetId": 1081,
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
    "icon": "🫀",
    "image": "./public/assets/curios/1077.png",
    "assetId": 1077,
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
];

export const ESSENCES = [
  {
    "id": "essence_elation",
    "name": "银河大乐透·精华",
    "rarity": "rare",
    "icon": "🎭",
    "target": 100,
    "description": "取得后累计造成100伤害：结算达标后，从下次转动起全队威力×1.15，本局持续。",
    "image": "./public/assets/curios/1026.png",
    "assetId": 1026,
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
    "icon": "🌿",
    "target": 6,
    "description": "取得后再转动6次：达标时生命上限永久+20，并按新上限治疗一次；治疗折价可能使实际生命未回满。",
    "image": "./public/assets/curios/1004.png",
    "assetId": 1004,
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
    "icon": "🎯",
    "target": 12,
    "description": "取得后单体角色累计登场12次：达标后从下次转动起单体威力×1.35，本局持续。",
    "image": "./public/assets/curios/1022.png",
    "assetId": 1022,
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
    "icon": "💥",
    "target": 8,
    "description": "取得后再转动8次：达标后从下次转动起所有角色每次威力+1，本局持续，不逐轮叠加。",
    "image": "./public/assets/curios/1023.png",
    "assetId": 1023,
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
    "icon": "🧠",
    "target": 10,
    "description": "取得后群体角色累计登场10次：达标后从下次转动起群体角色每次威力+1，本局持续。",
    "image": "./public/assets/curios/1082.png",
    "assetId": 1082,
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
    "icon": "🎵",
    "target": 12,
    "description": "取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队威力×1.1，本局持续。",
    "image": "./public/assets/curios/1051.png",
    "assetId": 1051,
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
    "icon": "🛡️",
    "target": 30,
    "description": "取得后转动内累计实际自然获得30护盾（不计补给、入关赠盾）：之后护盾获取量×1.3，每个新关获得12基础护盾。",
    "image": "./public/assets/curios/1020.png",
    "assetId": 1020,
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
    "icon": "🌌",
    "target": 8,
    "description": "取得后虚无角色累计登场8次：达标后从下次转动起虚无角色每次威力+1.5，本局持续。",
    "image": "./public/assets/curios/1047.png",
    "assetId": 1047,
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
    "icon": "🪙",
    "image": "./public/assets/curios/1015.png",
    "assetId": 1015,
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
    "icon": "🎲",
    "image": "./public/assets/curios/1001.png",
    "assetId": 1001,
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
    "icon": "✂️",
    "image": "./public/assets/curios/1017.png",
    "assetId": 1017,
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
    "icon": "💾",
    "image": "./public/assets/curios/1048.png",
    "assetId": 1048,
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
    "icon": "🔮",
    "image": "./public/assets/curios/1028.png",
    "assetId": 1028,
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
    "icon": "👁️",
    "image": "./public/assets/curios/1003.png",
    "assetId": 1003,
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
    "icon": "📜",
    "image": "./public/assets/curios/1008.png",
    "assetId": 1008,
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
    "icon": "👗",
    "image": "./public/assets/curios/1014.png",
    "assetId": 1014,
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
    "icon": "🎭",
    "image": "./public/assets/curios/1021.png",
    "assetId": 1021,
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
    "icon": "❄️",
    "image": "./public/assets/curios/1024.png",
    "assetId": 1024,
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
    "icon": "🦋",
    "image": "./public/assets/curios/1052.png",
    "assetId": 1052,
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
    "icon": "🕯️",
    "image": "./public/assets/curios/1046.png",
    "assetId": 1046,
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
    "icon": "👑",
    "image": "./public/assets/curios/1032.png",
    "assetId": 1032,
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
    "icon": "🖌️",
    "image": "./public/assets/curios/1036.png",
    "assetId": 1036,
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
    "icon": "🪢",
    "image": "./public/assets/curios/1057.png",
    "assetId": 1057,
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
    "icon": "🕳️",
    "image": "./public/assets/curios/1043.png",
    "assetId": 1043,
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
    "icon": "📰",
    "image": "./public/assets/curios/1063.png",
    "assetId": 1063,
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
    "icon": "💊",
    "image": "./public/assets/curios/1056.png",
    "assetId": 1056,
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
    "icon": "🪐",
    "image": "./public/assets/curios/1065.png",
    "assetId": 1065,
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
    "icon": "🛰️",
    "image": "./public/assets/curios/1050.png",
    "assetId": 1050,
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
    "icon": "🔥",
    "image": "./public/assets/curios/1062.png",
    "assetId": 1062,
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
    "icon": "🧨",
    "image": "./public/assets/curios/1066.png",
    "assetId": 1066,
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
    "icon": "🫀",
    "image": "./public/assets/curios/1077.png",
    "assetId": 1077,
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
    "icon": "🪼",
    "image": "./public/assets/curios/1081.png",
    "assetId": 1081,
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
];

const characters = new Map(CHARACTERS.map(c => [c.id, c]));
export const characterById = id => characters.get(String(id));
export const itemById = id => ITEMS.find(item => item.id === id);
export const essenceById = id => ESSENCES.find(essence => essence.id === id);
