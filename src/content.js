// Content names and images reference HoYoverse material; all abilities are this game's adaptations.
import { SYNERGIES } from './synergies.js';
export { SYNERGIES };
export const RARITY_LABELS = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };

export const CHARACTERS = [
  {
    "id": "1001",
    "name": "三月七",
    "enName": "March 7th",
    "assetId": 1001,
    "rarity": "common",
    "attack": "single",
    "power": 1.5,
    "path": "存护",
    "element": "冰",
    "faction": "星穹列车",
    "description": "每有1名相邻的星穹列车或存护角色，获得等于自身攻击力200%的护盾，最多计3名。",
    "color": "#f9a8d4",
    "effects": [
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星穹列车"
              },
              {
                "path": "存护"
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
                "faction": "星穹列车"
              },
              {
                "path": "存护"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/March_7th",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.35,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
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
    "description": "相邻有星穹列车或同谐角色时，本次转动造成的伤害提高40%；每第4次实际登场且满足上述条件，自身攻击力永久增加0.15（仅本局）。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.4,
        "summary": "本次转动，符合条件的角色造成的伤害提高40%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "faction": "星穹列车"
                },
                {
                  "path": "同谐"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ]
      },
      {
        "type": "attackGrowth",
        "value": 0.15,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.15（仅本局）",
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
                  "path": "同谐"
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "同列有其他火或智识角色时，本次转动全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率50%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damage",
        "value": 0.5,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Himeko",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "1004",
    "name": "瓦尔特",
    "enName": "Welt",
    "assetId": 1004,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "虚数",
    "faction": "星穹列车",
    "description": "相邻有虚数或星穹列车角色时，使最近存活敌列本次转动受到的伤害提高24%。相邻有虚数或虚无角色时，敌人本次转动造成的总伤害降低1.1点。",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.24,
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星穹列车"
              },
              {
                "element": "虚数"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "summary": "本次转动，目标敌列受到的伤害提高24%"
      },
      {
        "type": "retaliationFlat",
        "value": 1.1,
        "summary": "符合技能条件时，敌方本次转动造成的总伤害降低1.1点",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "虚数"
              },
              {
                "path": "虚无"
              }
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
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "1005",
    "name": "卡芙卡",
    "enName": "Kafka",
    "assetId": 1005,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "雷",
    "faction": "星核猎手",
    "description": "本次转动，敌人受到来自相邻雷或虚无角色的伤害提高15%；来自其中常规攻击为扩散的角色的伤害改为提高30%。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.15,
        "summary": "相邻的雷或虚无攻击者本轮对敌伤害增加15%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "雷"
            },
            {
              "path": "虚无"
            }
          ]
        }
      },
      {
        "type": "vulnerability",
        "value": 0.15,
        "summary": "其中扩散攻击者对敌伤害再增加15%，合计30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "雷"
            },
            {
              "path": "虚无"
            }
          ],
          "attack": "blast"
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Kafka",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.35,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "1006",
    "name": "银狼",
    "enName": "Silver Wolf",
    "assetId": 1006,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "量子",
    "faction": "星核猎手",
    "description": "本次转动，敌人受到来自同行量子或星核猎手角色的伤害提高20%；来自其中常规攻击为单体的角色的伤害改为提高32%。相邻至少2名量子或虚无角色时，敌人本次转动造成的总伤害降低1点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.2,
        "summary": "同行的量子或星核猎手攻击者本轮对敌伤害增加20%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "row",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "星核猎手"
            }
          ]
        }
      },
      {
        "type": "vulnerability",
        "value": 0.12,
        "summary": "其中单体攻击者对敌伤害再增加12%，合计32%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "row",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "星核猎手"
            }
          ],
          "attack": "single"
        }
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "符合技能条件时，敌方本次转动造成的总伤害降低1点",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "量子"
              },
              {
                "path": "虚无"
              }
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
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "位于边缘且队伍生命不高于50%时，本次转动造成的伤害提高80%。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.8,
        "summary": "本次转动，符合条件的角色造成的伤害提高80%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          },
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.5
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Arlan",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1009",
    "name": "艾丝妲",
    "enName": "Asta",
    "assetId": 1009,
    "rarity": "common",
    "attack": "single",
    "power": 1.6,
    "path": "同谐",
    "element": "火",
    "faction": "黑塔空间站",
    "description": "每第3次实际登场，使至多2名相邻的火或巡猎角色攻击力永久增加0.35（仅本局）。",
    "color": "#fda4af",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.35,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.35（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "element": "火"
            },
            {
              "path": "巡猎"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Asta",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.6,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.6,
      4.8,
      14.4
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
    "description": "每第3次实际登场且位于角落时，本次转动全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为75%。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.75,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率75%",
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
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Herta",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1101",
    "name": "布洛妮娅",
    "enName": "Bronya",
    "assetId": 1101,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "相邻的风或贝洛伯格角色，本次转动造成的伤害提高50%。",
    "color": "#bae6fd",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.5,
        "summary": "本次转动，符合条件的角色造成的伤害提高50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "风"
            },
            {
              "faction": "贝洛伯格"
            }
          ]
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Bronya",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.25,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "相邻有量子或虚无角色时，本次转动造成的伤害提高30%；自身常规攻击击破敌列后，向最近存活敌列发动1次追加攻击，技能倍率90%，每次转动最多触发1次。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "damage",
        "value": 0.9,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率90%",
        "trigger": "kill",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "beforeAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "oncePerSpin": true,
        "attackType": "followUp",
        "normalAttackOnly": true,
        "globalException": "自身常规攻击击破触发，作用于最近存活敌列；不要求额外邻接条件"
      },
      {
        "type": "damageBonus",
        "value": 0.3,
        "summary": "本次转动，符合条件的角色造成的伤害提高30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "量子"
                },
                {
                  "path": "虚无"
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
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Seele",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "每名相邻的雷或贝洛伯格角色使自身本次转动攻击力增加0.55，最多计3名。",
    "color": "#fde68a",
    "effects": [
      {
        "type": "power",
        "value": 0.55,
        "summary": "每名相邻的雷或贝洛伯格角色使本次攻击力+0.55，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "雷"
              },
              {
                "faction": "贝洛伯格"
              }
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
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1104",
    "name": "杰帕德",
    "enName": "Gepard",
    "assetId": 1104,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2,
    "path": "存护",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "每有1名相邻的冰或贝洛伯格角色，获得等于自身攻击力200%的护盾，最多计3名。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "faction": "贝洛伯格"
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
                "element": "冰"
              },
              {
                "faction": "贝洛伯格"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gepard",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1105",
    "name": "娜塔莎",
    "enName": "Natasha",
    "assetId": 1105,
    "rarity": "common",
    "attack": "single",
    "power": 1.75,
    "path": "丰饶",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "每有1名相邻的巡猎或毁灭角色，恢复等于自身攻击力160%的队伍生命，最多计3名。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 1.6,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的160%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "巡猎"
              },
              {
                "path": "毁灭"
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
                "path": "巡猎"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Natasha",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.4,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
    ]
  },
  {
    "id": "1106",
    "name": "佩拉",
    "enName": "Pela",
    "assetId": 1106,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.6,
    "path": "虚无",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "同列有其他冰或贝洛伯格角色时，使最近存活敌列本次转动受到的伤害提高28%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.28,
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "condition": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "faction": "贝洛伯格"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "summary": "本次转动，目标敌列受到的伤害提高28%"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Pela",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.6,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.6,
      4.8,
      14.4
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
    "description": "本次转动结算敌方伤害前，若护盾至少为8且相邻有物理或存护角色，则在敌方实际发动攻击且队伍结算后仍存活时，向最近存活敌列发动1次追加攻击，技能倍率110%；每次转动最多1次。",
    "color": "#fca5a5",
    "effects": [
      {
        "type": "damage",
        "value": 1.1,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率110%",
        "trigger": "afterEnemyAttack",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterEnemyAttack",
        "per": {
          "metric": "sourcePower"
        },
        "conditions": [
          {
            "metric": "shield",
            "op": "gte",
            "value": 8
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "物理"
                },
                {
                  "path": "存护"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ],
        "attackType": "followUp",
        "oncePerSpin": true,
        "snapshotConditions": "beforeEnemyAttack"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Clara",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "1108",
    "name": "桑博",
    "enName": "Sampo",
    "assetId": 1108,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.75,
    "path": "虚无",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "本次转动，敌人受到来自相邻风或虚无角色的伤害提高22%。每有1名相邻的风或虚无角色，敌人本次转动造成的总伤害降低0.5点，最多计3名。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.22,
        "summary": "相邻的风或虚无攻击者本轮对敌伤害增加22%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "虚无"
            },
            {
              "element": "风"
            }
          ]
        }
      },
      {
        "type": "retaliationFlat",
        "value": 0.5,
        "summary": "符合技能条件时，敌方本次转动造成的总伤害降低0.5点，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "虚无"
              },
              {
                "element": "风"
              }
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
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
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
    "description": "每第3次实际登场且相邻有火或贝洛伯格角色时，自身本次转动攻击力增加1.5。位于边缘时，本次转动全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率35%。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "power",
        "value": 1.5,
        "summary": "每第3次登场且相邻有火或贝洛伯格角色，本次攻击力+1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "faction": "贝洛伯格"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      },
      {
        "type": "damage",
        "value": 0.35,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率35%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hook",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "相邻至少3格空位且队伍生命不高于55%时，本次转动造成的伤害提高65%。每第4次实际登场，若队伍生命不高于55%且相邻有风或星核猎手角色，自身攻击力永久增加0.15（仅本局）。",
    "color": "#f87171",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.65,
        "summary": "本次转动，符合条件的角色造成的伤害提高65%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "emptyNeighbors",
            "op": "gte",
            "value": 3
          },
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.55
          }
        ]
      },
      {
        "type": "attackGrowth",
        "value": 0.15,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.15（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.55
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "风"
                },
                {
                  "faction": "星核猎手"
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
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Blade",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
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
    "description": "每第2次实际登场且同列有其他雷或智识角色时，本次转动全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为85%。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.85,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率85%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2,
        "condition": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "雷"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jing_Yuan",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
    ]
  },
  {
    "id": "1203",
    "name": "罗刹",
    "enName": "Luocha",
    "assetId": 1203,
    "rarity": "rare",
    "attack": "single",
    "power": 2,
    "path": "丰饶",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "相邻有虚数或毁灭角色时，恢复等于自身攻击力300%的队伍生命；溢出的治疗量转为护盾。",
    "color": "#bef264",
    "effects": [
      {
        "type": "healOverflowShield",
        "value": 3,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的300%；溢出治疗转为护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "虚数"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Luocha",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1208",
    "name": "符玄",
    "enName": "Fu Xuan",
    "assetId": 1208,
    "rarity": "rare",
    "attack": "single",
    "power": 2,
    "path": "存护",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "相邻有量子或同谐角色时，获得等于自身攻击力250%的护盾。同行至少2名其他量子或存护角色时，敌人本次转动造成的伤害降低12%。",
    "color": "#f0abfc",
    "effects": [
      {
        "type": "shield",
        "value": 2.5,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的250%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "量子"
              },
              {
                "path": "同谐"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackRatio": true
      },
      {
        "type": "retaliationMultiplier",
        "value": 0.88,
        "summary": "符合技能条件时，敌方本次转动造成的伤害降低12%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "element": "量子"
              },
              {
                "path": "存护"
              }
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Fu_Xuan",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "每第3次实际登场且同行有其他量子或同谐角色时，本次转动造成的伤害提高135%。",
    "color": "#5eead4",
    "effects": [
      {
        "type": "damageBonus",
        "value": 1.35,
        "summary": "本次转动，符合条件的角色造成的伤害提高135%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [],
        "every": 3,
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "element": "量子"
              },
              {
                "path": "同谐"
              }
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Qingque",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1202",
    "name": "停云",
    "enName": "Tingyun",
    "assetId": 1202,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.75,
    "path": "同谐",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "相邻的雷或巡猎角色中，本次转动增益生效前攻击力最高的1名，本次转动攻击力提高60%。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "attackPercent",
        "value": 0.6,
        "summary": "本次转动，符合条件的角色攻击力提高60%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "雷"
            },
            {
              "path": "巡猎"
            }
          ]
        },
        "selection": "strongest",
        "targetLimit": 1
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Tingyun",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.4,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
    ]
  },
  {
    "id": "1110",
    "name": "玲可",
    "enName": "Lynx",
    "assetId": 1110,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "丰饶",
    "element": "量子",
    "faction": "贝洛伯格",
    "description": "相邻有量子或毁灭角色时，先恢复等于自身攻击力150%的队伍生命；随后若队伍生命仍不高于60%，再获得等于自身攻击力100%的护盾。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "heal",
        "value": 1.5,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的150%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "量子"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackRatio": true
      },
      {
        "type": "shield",
        "value": 1,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的100%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.6
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "量子"
                },
                {
                  "path": "毁灭"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ],
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Lynx",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.35,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1111",
    "name": "卢卡",
    "enName": "Luka",
    "assetId": 1111,
    "rarity": "common",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "本次转动，敌人受到来自相邻、常规攻击为单体且属于物理或巡猎的角色的伤害提高32%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.32,
        "summary": "相邻的物理或巡猎单体攻击者本轮对敌伤害增加32%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "物理"
            },
            {
              "path": "巡猎"
            }
          ],
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Luka",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.6,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "同列有其他巡猎或星际和平公司角色时，使最近存活敌列本次转动受到的追加攻击伤害提高25%。全部常规攻击结束后，若同列仍有上述角色，向最近存活敌列发动1次追加攻击，技能倍率为55%×符合条件的其他角色数（最多计2名）。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.25,
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "attackType": "followUp",
        "condition": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "faction": "星际和平公司"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "summary": "本次转动，目标敌列受到的追加攻击伤害提高25%"
      },
      {
        "type": "damage",
        "value": 0.55,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率55%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "faction": "星际和平公司"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "cap": 2
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Topaz_%26_Numby",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "位于边缘且存活敌列不多于2列时，本次转动造成的伤害提高50%。每第3次实际登场且相邻有物理或巡猎角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率50%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.5,
        "summary": "本次转动，符合条件的角色造成的伤害提高50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          },
          {
            "metric": "enemies",
            "op": "lte",
            "value": 2
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "物理"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sushang",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1207",
    "name": "驭空",
    "enName": "Yukong",
    "assetId": 1207,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.75,
    "path": "同谐",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "每第2次实际登场，从相邻的虚数或巡猎角色中选择本次转动增益生效前攻击力最高的1名，使其攻击力永久增加0.35（仅本局）。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.35,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.35（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "selection": "strongest",
        "filter": {
          "anyOf": [
            {
              "element": "虚数"
            },
            {
              "path": "巡猎"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yukong",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.45,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
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
    "description": "位于边缘且护盾至少为5时，本次转动造成的伤害提高70%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.7,
        "summary": "本次转动，符合条件的角色造成的伤害提高70%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          },
          {
            "metric": "shield",
            "op": "gte",
            "value": 5
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yanqing",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "1210",
    "name": "桂乃芬",
    "enName": "Guinaifen",
    "assetId": 1210,
    "rarity": "common",
    "attack": "single",
    "power": 1.6,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "相邻有火或虚无角色时，使最近存活敌列本次转动受到的伤害提高24%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.24,
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "虚无"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "summary": "本次转动，目标敌列受到的伤害提高24%"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Guinaifen",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.6,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.35,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.6,
      4.8,
      14.4
    ]
  },
  {
    "id": "1211",
    "name": "白露",
    "enName": "Bailu",
    "assetId": 1211,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.5,
    "path": "丰饶",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "每有1名相邻的雷或丰饶角色，恢复等于自身攻击力200%的队伍生命，最多计3名。治疗后，若队伍生命仍不高于35%且相邻有上述角色，再获得等于自身攻击力200%的护盾。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "heal",
        "value": 2,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "雷"
              },
              {
                "path": "丰饶"
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
                "element": "雷"
              },
              {
                "path": "丰饶"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      },
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.35
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "雷"
                },
                {
                  "path": "丰饶"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ],
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Bailu",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
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
    "description": "队伍生命不高于60%且相邻有冰或毁灭角色时，本次转动造成的伤害提高70%。每第3次实际登场，若同行有其他冰或毁灭角色，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率45%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.7,
        "summary": "本次转动，符合条件的角色造成的伤害提高70%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.6
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "冰"
                },
                {
                  "path": "毁灭"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.45,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率45%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jingliu",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "每第3次实际登场且位于角落时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率115%。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 1.15,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率115%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
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
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Xueyi",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
    ]
  },
  {
    "id": "1215",
    "name": "寒鸦",
    "enName": "Hanya",
    "assetId": 1215,
    "rarity": "common",
    "attack": "single",
    "power": 1.5,
    "path": "同谐",
    "element": "物理",
    "faction": "仙舟罗浮",
    "description": "每第3次实际登场，使至多2名相邻的物理或毁灭角色攻击力永久增加0.3（仅本局）；若相邻有物理或仙舟罗浮角色，再获得1信用点。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.3,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.3（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "element": "物理"
            },
            {
              "path": "毁灭"
            }
          ],
          "excludeSelf": true
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第3次登场且相邻有物理或仙舟罗浮角色，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "物理"
              },
              {
                "faction": "仙舟罗浮"
              }
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
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.25,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
    ]
  },
  {
    "id": "1217",
    "name": "藿藿",
    "enName": "Huohuo",
    "assetId": 1217,
    "rarity": "rare",
    "attack": "single",
    "power": 2,
    "path": "丰饶",
    "element": "风",
    "faction": "仙舟罗浮",
    "description": "每有1名相邻的同谐或仙舟罗浮角色，恢复等于自身攻击力200%的队伍生命，最多计2名。每第3次实际登场，若相邻有上述角色，再获得等于自身攻击力150%的护盾。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 2,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "同谐"
              },
              {
                "faction": "仙舟罗浮"
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
                "path": "同谐"
              },
              {
                "faction": "仙舟罗浮"
              }
            ],
            "excludeSelf": true
          },
          "cap": 2
        },
        "attackRatio": true
      },
      {
        "type": "shield",
        "value": 1.5,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的150%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "同谐"
              },
              {
                "faction": "仙舟罗浮"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Huohuo",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.25,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1218",
    "name": "椒丘",
    "enName": "Jiaoqiu",
    "assetId": 1218,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟曜青",
    "description": "本次转动，敌人受到来自同行火或虚无角色的伤害提高25%。相邻至少2名火或虚无角色时，敌人本次转动造成的总伤害降低1点。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.25,
        "summary": "同行的火或虚无攻击者本轮对敌伤害增加25%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "row",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "火"
            },
            {
              "path": "虚无"
            }
          ]
        }
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "符合技能条件时，敌方本次转动造成的总伤害降低1点",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "虚无"
              }
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
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "位于边缘时，本次转动造成的伤害提高25%。每第3次实际登场且相邻有风或巡猎角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率115%。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damage",
        "value": 1.15,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率115%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "风"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      },
      {
        "type": "damageBonus",
        "value": 0.25,
        "summary": "本次转动，符合条件的角色造成的伤害提高25%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Feixiao",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
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
    "description": "本次转动结算敌方伤害前，若护盾至少为6且相邻有物理或存护角色，则在敌方实际发动攻击且队伍结算后仍存活时，向最近存活敌列发动1次追加攻击，技能倍率125%；每次转动最多1次。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damage",
        "value": 1.25,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率125%",
        "trigger": "afterEnemyAttack",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterEnemyAttack",
        "per": {
          "metric": "sourcePower"
        },
        "conditions": [
          {
            "metric": "shield",
            "op": "gte",
            "value": 6
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "物理"
                },
                {
                  "path": "存护"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 1
          }
        ],
        "attackType": "followUp",
        "oncePerSpin": true,
        "snapshotConditions": "beforeEnemyAttack"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yunli",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "1222",
    "name": "灵砂",
    "enName": "Lingsha",
    "assetId": 1222,
    "rarity": "rare",
    "attack": "single",
    "power": 1.5,
    "path": "丰饶",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "每有1名相邻的火或毁灭角色，恢复等于自身攻击力200%的队伍生命，最多计3名。每第4次实际登场，若相邻有上述角色，再获得等于自身攻击力200%的护盾。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "value": 2,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "毁灭"
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
                "element": "火"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      },
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Lingsha",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
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
    "description": "相邻角色不超过1名时，首次有其他角色以常规攻击命中本列敌人后，貊泽向该敌列发动1次追加攻击，技能倍率90%；每次转动最多1次。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.9,
        "trigger": "afterNormalAttack",
        "duration": "spin",
        "target": "triggerEnemy",
        "stacking": "additive",
        "attackType": "followUp",
        "scaleWithSourcePower": true,
        "eventRange": "enemyColumn",
        "eventFilter": {
          "excludeSelf": true
        },
        "oncePerSpin": true,
        "condition": {
          "metric": "neighbors",
          "op": "lte",
          "value": 1
        },
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率90%"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Moze",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1301",
    "name": "加拉赫",
    "enName": "Gallagher",
    "assetId": 1301,
    "rarity": "common",
    "attack": "single",
    "power": 2,
    "path": "丰饶",
    "element": "火",
    "faction": "匹诺康尼",
    "description": "本次转动，首次有相邻火或虚无角色发动常规攻击后，恢复等于加拉赫攻击力140%的队伍生命；每次转动最多1次。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "value": 1.4,
        "trigger": "afterNormalAttack",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "attackRatio": true,
        "eventRange": "adjacent",
        "eventFilter": {
          "anyOf": [
            {
              "element": "火"
            },
            {
              "path": "虚无"
            }
          ],
          "excludeSelf": true
        },
        "oncePerSpin": true,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的140%"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 4,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gallagher",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.5,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "每第4次实际登场，在全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为85%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damage",
        "value": 0.85,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率85%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "all",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 4,
        "globalException": "长周期全列爆发，保留少量不依赖位置的技能",
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Argenti",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
    ]
  },
  {
    "id": "1303",
    "name": "阮·梅",
    "enName": "Ruan Mei",
    "assetId": 1303,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "每第3次实际登场，使至多2名相邻的冰或智识角色攻击力永久增加0.4（仅本局）。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.4,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.4（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "element": "冰"
            },
            {
              "path": "智识"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Ruan_Mei",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "1304",
    "name": "砂金",
    "enName": "Aventurine",
    "assetId": 1304,
    "rarity": "rare",
    "attack": "single",
    "power": 1.75,
    "path": "存护",
    "element": "虚数",
    "faction": "星际和平公司",
    "description": "每有1名相邻的巡猎或星际和平公司角色，获得等于自身攻击力200%的护盾，最多计3名。随后若护盾至少为18且相邻有星际和平公司或存护角色，获得1信用点。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星际和平公司"
              },
              {
                "path": "巡猎"
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
                "faction": "星际和平公司"
              },
              {
                "path": "巡猎"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "attackRatio": true
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "护盾达到18且相邻有星际和平公司或存护角色时，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "conditions": [
          {
            "metric": "shield",
            "op": "gte",
            "value": 18
          },
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "faction": "星际和平公司"
                },
                {
                  "path": "存护"
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
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aventurine",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
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
    "description": "全部常规攻击结束后，若相邻有虚无角色，向最近存活敌列发动1次追加攻击，技能倍率为38%×相邻虚无角色数（最多计3名）。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.38,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率38%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "neighbors",
          "filter": {
            "path": "虚无",
            "excludeSelf": true
          },
          "cap": 3
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dr._Ratio",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "1306",
    "name": "花火",
    "enName": "Sparkle",
    "assetId": 1306,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "量子",
    "faction": "假面愚者",
    "description": "相邻的量子或欢愉角色，本次转动造成的伤害提高50%。每第4次实际登场且位于角落时，获得1次重掷。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.5,
        "summary": "本次转动，符合条件的角色造成的伤害提高50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "path": "欢愉"
            }
          ]
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第4次登场且位于角落，获得1次重掷",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "rerolls",
        "every": 4,
        "condition": {
          "metric": "corner",
          "op": "eq",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sparkle",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "1307",
    "name": "黑天鹅",
    "enName": "Black Swan",
    "assetId": 1307,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.75,
    "path": "虚无",
    "element": "风",
    "faction": "流光忆庭",
    "description": "每第3次实际登场，使至多2名相邻的虚无或风角色攻击力永久增加0.35（仅本局）。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.35,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.35（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "path": "虚无"
            },
            {
              "element": "风"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Black_Swan",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
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
    "description": "每有1名相邻虚无角色，自身本次转动攻击力增加0.7，最多计2名。每第3次实际登场且相邻有虚无角色时，全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为70%。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.7,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率70%",
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
          "metric": "neighbors",
          "filter": {
            "path": "虚无",
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      },
      {
        "type": "power",
        "value": 0.7,
        "summary": "每名相邻的虚无角色使本次攻击力+0.7，最多2名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "neighbors",
          "filter": {
            "path": "虚无",
            "excludeSelf": true
          },
          "cap": 2
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Acheron",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
    ]
  },
  {
    "id": "1309",
    "name": "知更鸟",
    "enName": "Robin",
    "assetId": 1309,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "物理",
    "faction": "匹诺康尼",
    "description": "同行的物理或巡猎角色，本次转动攻击力提高40%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "attackPercent",
        "value": 0.4,
        "summary": "本次转动，符合条件的角色攻击力提高40%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "row",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "物理"
            },
            {
              "path": "巡猎"
            }
          ]
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Robin",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "相邻至少2名火或毁灭角色时，本次转动造成的伤害提高50%。每第3次实际登场且相邻有火或毁灭角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率55%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.5,
        "summary": "本次转动，符合条件的角色造成的伤害提高50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "neighbors",
            "filter": {
              "anyOf": [
                {
                  "element": "火"
                },
                {
                  "path": "毁灭"
                }
              ],
              "excludeSelf": true
            },
            "op": "gte",
            "value": 2
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.55,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率55%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Firefly",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "每第3次实际登场且同行有其他冰或记忆角色时，本次转动造成的伤害提高110%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "damageBonus",
        "value": 1.1,
        "summary": "本次转动，符合条件的角色造成的伤害提高110%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [],
        "every": 3,
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "path": "记忆"
              }
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Misha",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
    ]
  },
  {
    "id": "1313",
    "name": "星期日",
    "enName": "Sunday",
    "assetId": 1313,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "虚数",
    "faction": "匹诺康尼",
    "description": "同列的记忆或毁灭角色，本次转动攻击力提高45%。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "attackPercent",
        "value": 0.45,
        "summary": "本次转动，符合条件的角色攻击力提高45%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "记忆"
            },
            {
              "path": "毁灭"
            }
          ]
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sunday",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "全部常规攻击结束后，若相邻有其他星际和平公司或智识角色，向最近存活敌列发动1次追加攻击，技能倍率为30%×符合条件的相邻角色数（最多计3名）。登场时若位于边缘，获得1信用点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.3,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率30%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星际和平公司"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "位于边缘时，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Jade",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "位于边缘且仅剩1列存活敌人时，本次转动造成的伤害提高80%。位于边缘时，自身常规攻击击破敌列后，向最近存活敌列发动1次追加攻击，技能倍率40%；每次转动最多1次。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.8,
        "summary": "本次转动，符合条件的角色造成的伤害提高80%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          },
          {
            "metric": "enemies",
            "op": "lte",
            "value": 1
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.4,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率40%",
        "trigger": "kill",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "beforeAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "oncePerSpin": true,
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp",
        "normalAttackOnly": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Boothill",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
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
    "description": "相邻有虚数或智识角色时，每列存活敌人使自身本次转动攻击力增加0.35，最多计5列。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "value": 0.35,
        "summary": "相邻有虚数或智识角色时，每列存活敌人使本次攻击力+0.35，最多5列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "虚数"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
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
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
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
    "description": "每第2次实际登场且相邻有记忆或翁法罗斯角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率65%。每第4次实际登场且同行有其他记忆或翁法罗斯角色时，创建1名衣匠，下次转动起可登场。创建前衣匠少于3名时可创建，创建后正常参与合成。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.65,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率65%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "faction": "翁法罗斯"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      },
      {
        "type": "summon",
        "value": 1,
        "summary": "符合技能条件时，创建前衣匠少于3名时，创建1名衣匠，下次转动起可登场；创建后正常参与合成",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "every": 4,
        "characterId": "garmentmaker",
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "faction": "翁法罗斯"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "rosterLimit": 3
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aglaea",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
    ]
  },
  {
    "id": "1403",
    "name": "缇宝",
    "enName": "Tribbie",
    "assetId": 1403,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.5,
    "path": "同谐",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "每第2次实际登场，从相邻的量子或翁法罗斯角色中选择本次转动增益生效前攻击力最高的1名，使其攻击力永久增加0.3（仅本局）。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.3,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.3（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "selection": "strongest",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "翁法罗斯"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Tribbie",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.5,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
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
    "description": "位于边缘且队伍生命不高于55%时，本次转动造成的伤害提高65%。每第3次实际登场且相邻有虚数或毁灭角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率50%。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.65,
        "summary": "本次转动，符合条件的角色造成的伤害提高65%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          },
          {
            "metric": "hpRatio",
            "op": "lte",
            "value": 0.55
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.5,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "虚数"
              },
              {
                "path": "毁灭"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Mydei",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "每格相邻空位使自身本次转动攻击力增加0.22，最多计4格。每第3次实际登场且同列有其他风或智识角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率55%。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "power",
        "value": 0.22,
        "summary": "每格相邻空位使本次攻击力+0.22，最多4格",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "emptyNeighbors",
          "cap": 4
        }
      },
      {
        "type": "damage",
        "value": 0.55,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率55%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "风"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Anaxa",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
    ]
  },
  {
    "id": "1406",
    "name": "赛飞儿",
    "enName": "Cipher",
    "assetId": 1406,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "本次转动，敌人受到来自相邻、常规攻击为群体且属于量子或翁法罗斯的角色的伤害提高28%。每第2次实际登场且位于角落时，获得1信用点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.28,
        "summary": "相邻的量子或翁法罗斯群体攻击者本轮对敌伤害增加28%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "翁法罗斯"
            }
          ],
          "attack": "aoe"
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第2次登场且位于角落，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "every": 2,
        "condition": {
          "metric": "corner",
          "op": "eq",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cipher",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.5,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "每名相邻的其他记忆或翁法罗斯角色使自身本次转动攻击力增加0.5，最多计3名。每第3次实际登场且同列至少2名其他记忆或翁法罗斯角色时，全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为80%。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.5,
        "summary": "每名相邻的其他记忆或翁法罗斯角色使本次攻击力+0.5，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "faction": "翁法罗斯"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.8,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率80%",
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
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "faction": "翁法罗斯"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Castorice",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
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
    "description": "相邻角色不超过1名时，本次转动造成的伤害提高80%。每第4次实际登场且位于边缘时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率90%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.8,
        "summary": "本次转动，符合条件的角色造成的伤害提高80%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "neighbors",
            "op": "lte",
            "value": 1
          }
        ]
      },
      {
        "type": "damage",
        "value": 0.9,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率90%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 4,
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Phainon",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
    ]
  },
  {
    "id": "1409",
    "name": "风堇",
    "enName": "Hyacine",
    "assetId": 1409,
    "rarity": "rare",
    "attack": "single",
    "power": 2,
    "path": "记忆",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "相邻有记忆或风角色时，先恢复等于自身攻击力250%的队伍生命，再获得等于自身攻击力150%的护盾。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "value": 2.5,
        "summary": "符合技能条件时，恢复队伍生命，数值为自身攻击力的250%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
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
        "attackRatio": true
      },
      {
        "type": "shield",
        "value": 1.5,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的150%",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
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
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hyacine",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "相邻有巡猎或星穹列车角色时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率50%。每第4次实际登场且满足上述条件，自身攻击力永久增加0.15（仅本局）。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.5,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率50%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
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
        },
        "attackType": "followUp"
      },
      {
        "type": "attackGrowth",
        "value": 0.15,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.15（仅本局）",
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
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2,
      6,
      18
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
    "description": "每名同行的其他虚数或毁灭角色使自身本次转动攻击力增加0.5，最多计3名。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "value": 0.5,
        "summary": "每名同行的其他虚数或毁灭角色使本次攻击力+0.5，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "element": "虚数"
              },
              {
                "path": "毁灭"
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Imbibitor_Lunae",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "dan_heng_pt",
    "name": "丹恒·腾荒",
    "enName": "Dan Heng • Permansor Terrae",
    "assetId": 1414,
    "rarity": "rare",
    "attack": "single",
    "power": 1.75,
    "path": "存护",
    "element": "物理",
    "faction": "星穹列车",
    "description": "每有1名同列的其他星穹列车或物理角色，获得等于自身攻击力200%的护盾，最多计3名。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "shield",
        "value": 2,
        "summary": "符合技能条件时，获得护盾，数值为自身攻击力的200%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
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
        },
        "attackRatio": true
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Dan_Heng_%E2%80%A2_Permansor_Terrae",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "defense",
    "roleLabel": "防御",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.25,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
    ]
  },
  {
    "id": "fugue",
    "name": "忘归人",
    "enName": "Fugue",
    "assetId": 1225,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "本次转动，敌人受到来自相邻、常规攻击为扩散且属于火或毁灭的角色的伤害提高36%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.36,
        "summary": "相邻的火或毁灭扩散攻击者本轮对敌伤害增加36%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
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
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.6,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "每名相邻的其他冰或智识角色使自身本次转动攻击力增加0.5，最多计3名。每第3次实际登场且同列有其他冰或智识角色时，全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为55%。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.5,
        "summary": "每名相邻的其他冰或智识角色使本次攻击力+0.5，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.55,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率55%",
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
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "冰"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/The_Herta",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "hysilens",
    "name": "海瑟音",
    "enName": "Hysilens",
    "assetId": 1410,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "物理",
    "faction": "翁法罗斯",
    "description": "本次转动，首次有同列其他物理或翁法罗斯角色发动常规攻击后，海瑟音向最近存活敌列发动1次追加攻击，技能倍率70%；每次转动最多1次。相邻至少2名物理或虚无角色时，敌人本次转动造成的伤害降低10%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damage",
        "value": 0.7,
        "trigger": "afterNormalAttack",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "attackType": "followUp",
        "scaleWithSourcePower": true,
        "eventRange": "column",
        "eventFilter": {
          "anyOf": [
            {
              "element": "物理"
            },
            {
              "faction": "翁法罗斯"
            }
          ],
          "excludeSelf": true
        },
        "oncePerSpin": true,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率70%"
      },
      {
        "type": "retaliationMultiplier",
        "value": 0.9,
        "summary": "符合技能条件时，敌方本次转动造成的伤害降低10%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "物理"
              },
              {
                "path": "虚无"
              }
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
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Hysilens",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "cerydra",
    "name": "刻律德菈",
    "enName": "Cerydra",
    "assetId": 1412,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "同谐",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "相邻的风或翁法罗斯角色中，本次转动增益生效前攻击力最高的1名，本次转动造成的伤害提高60%。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.6,
        "summary": "本次转动，符合条件的角色造成的伤害提高60%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "风"
            },
            {
              "faction": "翁法罗斯"
            }
          ]
        },
        "selection": "strongest",
        "targetLimit": 1
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cerydra",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.45,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "全部常规攻击结束后，若相邻有记忆或同谐角色，向最近存活敌列发动1次追加攻击，技能倍率为45%×符合条件的相邻角色数（最多计2名）。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.45,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率45%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "path": "同谐"
              }
            ],
            "excludeSelf": true
          },
          "cap": 2
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Evernight",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "cyrene",
    "name": "昔涟",
    "enName": "Cyrene",
    "assetId": 1415,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "记忆",
    "element": "冰",
    "faction": "翁法罗斯",
    "description": "每第3次实际登场，使至多2名同行的其他记忆或翁法罗斯角色攻击力永久增加0.45（仅本局）。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.45,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.45（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "row",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "path": "记忆"
            },
            {
              "faction": "翁法罗斯"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Cyrene",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.1,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "每第3次实际登场且位于边缘时，全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为85%。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damage",
        "value": 0.85,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率85%",
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
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Saber",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "全部常规攻击结束后，若相邻有同谐或智识角色，向最近存活敌列发动1次追加攻击，技能倍率为45%×符合条件的相邻角色数（最多计3名）。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.45,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率45%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
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
            "excludeSelf": true
          },
          "cap": 3
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Archer",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "yao_guang",
    "name": "爻光",
    "enName": "Yao Guang",
    "assetId": 1502,
    "rarity": "rare",
    "attack": "single",
    "power": 1.75,
    "path": "欢愉",
    "element": "物理",
    "faction": "仙舟玉阙",
    "description": "每第2次实际登场，从同列其他欢愉角色或仙舟罗浮、仙舟曜青、仙舟朱明、仙舟玉阙角色中，选择本次转动增益生效前攻击力最高的1名，使其攻击力永久增加0.4（仅本局）。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.4,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.4（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "column",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "selection": "strongest",
        "filter": {
          "anyOf": [
            {
              "path": "欢愉"
            },
            {
              "faction": "仙舟罗浮"
            },
            {
              "faction": "仙舟曜青"
            },
            {
              "faction": "仙舟朱明"
            },
            {
              "faction": "仙舟玉阙"
            }
          ],
          "excludeSelf": true
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Yao_Guang",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.35,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
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
    "description": "相邻有欢愉或火角色时，上次转动每有1名角色被删除，自身本次转动攻击力增加0.8，最多计3名；首次转动计0名。每第2次实际登场且位于边缘时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率45%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "value": 0.8,
        "summary": "相邻有欢愉或火角色时，本轮每名删除角色使本次攻击力+0.8，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "path": "欢愉"
              },
              {
                "element": "火"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "lastTurnDeletions",
          "cap": 3
        }
      },
      {
        "type": "damage",
        "value": 0.45,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率45%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 2,
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Sparxie",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
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
    "description": "全部常规攻击结束后，若存活敌列不超过2列且相邻角色不超过1名，向最近存活敌列发动1次追加攻击，技能倍率70%。位于边缘时，本次转动造成的伤害提高30%。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "value": 0.7,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率70%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "conditions": [
          {
            "metric": "enemies",
            "op": "lte",
            "value": 2
          },
          {
            "metric": "neighbors",
            "op": "lte",
            "value": 1
          }
        ],
        "attackType": "followUp"
      },
      {
        "type": "damageBonus",
        "value": 0.3,
        "summary": "本次转动，符合条件的角色造成的伤害提高30%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "conditions": [
          {
            "metric": "edge",
            "op": "eq",
            "value": 1
          }
        ]
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Ashveil",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "每第3次实际登场且位于角落时，全部常规攻击结束后，发动1次群体追加攻击，对每个存活敌列的技能倍率为80%。相邻有量子或欢愉角色时，上次转动每有1名角色被删除，自身本次转动攻击力增加0.7，最多计3名；首次转动计0名。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "value": 0.8,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率80%",
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
        },
        "attackType": "followUp"
      },
      {
        "type": "power",
        "value": 0.7,
        "summary": "相邻有量子或欢愉角色时，本轮每名删除角色使本次攻击力+0.7，最多3名",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
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
          "metric": "lastTurnDeletions",
          "cap": 3
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Silver_Wolf_LV.999",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3.8,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3.8,
      11.4,
      34.2
    ]
  },
  {
    "id": "evanescia",
    "name": "绯英",
    "enName": "Evanescia",
    "assetId": 1505,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "欢愉",
    "element": "物理",
    "faction": "二相乐园",
    "description": "同行的欢愉或物理角色，本次转动造成的伤害提高45%。相邻的存护或欢愉角色，本次转动施加的护盾量提高20%。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.45,
        "summary": "本次转动，符合条件的角色造成的伤害提高45%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "row",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "欢愉"
            },
            {
              "element": "物理"
            }
          ]
        }
      },
      {
        "type": "shieldMultiplier",
        "value": 1.2,
        "summary": "相邻的存护或欢愉防御者护盾获取量×1.2",
        "trigger": "passive",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "存护"
            },
            {
              "path": "欢愉"
            }
          ]
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Evanescia",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "相邻有火或虚无角色时，自身本次转动攻击力增加队伍缺失生命值的3.5%，最多增加1.75。每第3次实际登场且位于边缘时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率55%。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "value": 0.35,
        "summary": "相邻有火或虚无角色时，每缺失10生命使本次攻击力+0.35，最多5份",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "虚无"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        },
        "per": {
          "metric": "missingHp",
          "divisor": 10,
          "cap": 5
        }
      },
      {
        "type": "damage",
        "value": 0.55,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率55%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "sourcePower"
        },
        "every": 3,
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Mortenax_Blade",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "the_dahlia",
    "name": "大丽花",
    "enName": "The Dahlia",
    "assetId": 1321,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "虚无",
    "element": "火",
    "faction": "焚化工",
    "description": "本次转动，敌人受到来自相邻火或毁灭角色的伤害提高34%。相邻有火或毁灭角色时，敌人本次转动造成的总伤害降低1点。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "vulnerability",
        "value": 0.34,
        "summary": "相邻的火或毁灭攻击者本轮对敌伤害增加34%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "火"
            },
            {
              "path": "毁灭"
            }
          ]
        }
      },
      {
        "type": "retaliationFlat",
        "value": 1,
        "summary": "符合技能条件时，敌方本次转动造成的总伤害降低1点",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "毁灭"
              }
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
    "kitVersion": 8,
    "role": "disruptor",
    "roleLabel": "敌方干扰",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.1,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
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
    "description": "全部常规攻击结束后，若同列有其他火或智识角色，向最近存活敌列发动1次追加攻击，技能倍率为35%×符合条件的其他角色数（最多计3名）。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "damage",
        "value": 0.35,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率35%，按技能指定人数计算",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "stage": "afterAttacks",
        "per": {
          "metric": "column",
          "filter": {
            "anyOf": [
              {
                "element": "火"
              },
              {
                "path": "智识"
              }
            ],
            "excludeSelf": true
          },
          "cap": 3
        },
        "scaleWithSourcePower": true,
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Himeko_%E2%80%A2_Nova",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "aoe",
      "primary": 0,
      "adjacent": 0,
      "eachTarget": 1
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
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
    "description": "位于边缘时，每列存活敌人使自身本次转动攻击力增加0.35，最多计5列。每第3次实际登场且位于角落时，全部常规攻击结束后，向最近存活敌列发动1次追加攻击，技能倍率65%。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "value": 0.35,
        "summary": "位于边缘时，每列存活敌人使本次攻击力+0.35，最多5列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "condition": {
          "metric": "edge",
          "op": "eq",
          "value": 1
        },
        "per": {
          "metric": "enemies",
          "cap": 5
        }
      },
      {
        "type": "damage",
        "value": 0.65,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率65%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "nearest",
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
        },
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Gilgamesh",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 3,
    "normalAttack": {
      "pattern": "blast",
      "primary": 2,
      "adjacent": 1,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      3,
      9,
      27
    ]
  },
  {
    "id": "announced_rin_tohsaka",
    "name": "远坂凛",
    "enName": "Rin Tohsaka",
    "assetId": 1508,
    "rarity": "uncommon",
    "attack": "single",
    "power": 1.8,
    "path": "智识",
    "element": "量子",
    "faction": "异世界",
    "description": "相邻的量子或异世界角色，本次转动攻击力提高40%。每第3次实际登场，这些角色本次转动攻击力再增加0.55。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "attackPercent",
        "value": 0.4,
        "summary": "本次转动，符合条件的角色攻击力提高40%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "异世界"
            }
          ]
        }
      },
      {
        "type": "power",
        "value": 0.55,
        "summary": "每第3次登场，相邻的量子或异世界攻击者本次攻击力再+0.55",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "filter": {
          "anyOf": [
            {
              "element": "量子"
            },
            {
              "faction": "异世界"
            }
          ]
        }
      }
    ],
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Rin_Tohsaka",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.2,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "aha",
    "name": "阿哈",
    "enName": "Aha",
    "assetId": "aha-symbol",
    "rarity": "legendary",
    "attack": "single",
    "power": 1.75,
    "path": "欢愉",
    "element": "无（改编）",
    "faction": "星神",
    "description": "每第3次实际登场，使至多2名相邻的欢愉或假面愚者角色攻击力永久增加0.4（仅本局）。每第4次实际登场且位于角落时，获得1次重掷。",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.4,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.4（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "every": 3,
        "targetLimit": 2,
        "filter": {
          "anyOf": [
            {
              "path": "欢愉"
            },
            {
              "faction": "假面愚者"
            }
          ],
          "excludeSelf": true
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第4次登场且位于角落，获得1次重掷",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "rerolls",
        "every": 4,
        "condition": {
          "metric": "corner",
          "op": "eq",
          "value": 1
        }
      }
    ],
    "adaptation": "星神角色为本作改编；无官方可玩星级或战斗属性；头像为文字标识",
    "officialRarity": null,
    "publicationStatus": "adapted-aeon",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aha",
    "portraitKind": "text-symbol",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.1,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
    ]
  },
  {
    "id": "pearl",
    "name": "真珠",
    "enName": "Pearl",
    "assetId": 1503,
    "rarity": "rare",
    "attack": "single",
    "power": 1.75,
    "path": "欢愉",
    "element": "冰",
    "faction": "星际和平公司",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "attackGrowth",
        "value": 0.4,
        "summary": "符合技能条件时，目标角色攻击力永久增加0.4（仅本局）",
        "trigger": "appearance",
        "duration": "run",
        "target": "column",
        "stacking": "additive",
        "every": 2,
        "targetLimit": 1,
        "selection": "strongest",
        "filter": {
          "anyOf": [
            {
              "faction": "星际和平公司"
            },
            {
              "path": "存护"
            }
          ],
          "excludeSelf": true
        }
      },
      {
        "type": "resource",
        "value": 1,
        "summary": "每第3次登场且相邻有星际和平公司或存护角色，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "resource": "coins",
        "every": 3,
        "condition": {
          "metric": "neighbors",
          "filter": {
            "anyOf": [
              {
                "faction": "星际和平公司"
              },
              {
                "path": "存护"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 1
        }
      }
    ],
    "description": "每第2次实际登场，从同列其他星际和平公司或存护角色中，选择本次转动增益生效前攻击力最高的1名，使其攻击力永久增加0.4（仅本局）。每第3次实际登场且相邻有星际和平公司或存护角色时，获得1信用点。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Pearl",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "trainer",
    "roleLabel": "永久强化",
    "baseAttack": 1.75,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.15,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.75,
      5.25,
      15.75
    ]
  },
  {
    "id": "robin_summeretto",
    "name": "知更鸟·晴歌",
    "enName": "Robin • Summeretto",
    "assetId": 1512,
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "记忆",
    "element": "风",
    "faction": "匹诺康尼",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "attackPercent",
        "value": 0.3,
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "记忆"
            },
            {
              "element": "风"
            }
          ],
          "excludeSelf": true
        },
        "summary": "本次转动，符合条件的角色攻击力提高30%"
      },
      {
        "type": "damageBonus",
        "value": 0.2,
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
          "anyOf": [
            {
              "path": "记忆"
            },
            {
              "element": "风"
            }
          ],
          "excludeSelf": true
        },
        "every": 2,
        "condition": {
          "metric": "row",
          "filter": {
            "anyOf": [
              {
                "path": "记忆"
              },
              {
                "element": "风"
              }
            ],
            "excludeSelf": true
          },
          "op": "gte",
          "value": 2
        },
        "summary": "本次转动，符合条件的角色造成的伤害提高20%"
      }
    ],
    "description": "相邻的记忆或风角色，本次转动攻击力提高30%。每第2次实际登场且同行至少2名其他记忆或风角色时，这些相邻角色本次转动造成的伤害再提高20%。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Robin_%E2%80%A2_Summeretto",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.1,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  },
  {
    "id": "aventurine_waveflair",
    "name": "砂金·戏浪",
    "enName": "Aventurine • Waveflair",
    "assetId": 1513,
    "rarity": "rare",
    "attack": "single",
    "power": 2.5,
    "path": "欢愉",
    "element": "量子",
    "faction": "星际和平公司",
    "color": "#e879f9",
    "effects": [
      {
        "type": "damage",
        "value": 0.45,
        "trigger": "afterNormalAttack",
        "duration": "spin",
        "target": "nearest",
        "stacking": "additive",
        "attackType": "followUp",
        "scaleWithSourcePower": true,
        "eventRange": "adjacent",
        "eventFilter": {
          "anyOf": [
            {
              "faction": "星际和平公司"
            },
            {
              "path": "欢愉"
            }
          ],
          "excludeSelf": true
        },
        "oncePerSpin": false,
        "maxTriggersPerSpin": 3,
        "oncePerTriggerUnit": true,
        "summary": "符合技能条件时，发动1次追加攻击，技能倍率45%"
      }
    ],
    "description": "本次转动，每有1名相邻的星际和平公司或欢愉角色完成常规攻击，砂金·戏浪向最近存活敌列发动1次追加攻击，技能倍率45%；同一角色每次转动最多触发1次，合计最多3次。",
    "adaptation": "本作改编能力",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aventurine_%E2%80%A2_Waveflair",
    "portraitKind": "game-art",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "baseAttack": 2.5,
    "normalAttack": {
      "pattern": "single",
      "primary": 3,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      2.5,
      7.5,
      22.5
    ]
  },
  {
    "id": "aeon_star_aha",
    "name": "星神★阿哈",
    "enName": "Aeon ★ Aha",
    "assetId": "aeon-star-aha",
    "rarity": "rare",
    "attack": "single",
    "power": 1.8,
    "path": "欢愉",
    "element": "量子",
    "faction": "假面愚者",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.55,
        "summary": "本次转动，符合条件的角色造成的伤害提高55%",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "filter": {
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
    "description": "相邻的量子、欢愉或假面愚者角色，本次转动造成的伤害提高55%。每第3次实际登场且位于角落时，获得1信用点。",
    "adaptation": "本作改编能力；公开名单标注已公布，非官方技能复刻；公开人物画像尚未离线收录，头像为文字标识",
    "officialRarity": 5,
    "publicationStatus": "announced",
    "sourceUrl": "https://honkai-star-rail.fandom.com/wiki/Aeon_%E2%98%85_Aha",
    "portraitKind": "text-symbol",
    "kitVersion": 8,
    "role": "amplifier",
    "roleLabel": "即时辅助",
    "baseAttack": 1.8,
    "normalAttack": {
      "pattern": "single",
      "primary": 0.1,
      "adjacent": 0,
      "eachTarget": 0
    },
    "recruitable": true,
    "baseAttackByStar": [
      0,
      1.8,
      5.4,
      16.2
    ]
  }
];

export const CREATED_CHARACTERS = [
  {
    "id": "garmentmaker",
    "name": "衣匠",
    "enName": "Garmentmaker",
    "assetId": 1402,
    "rarity": "common",
    "attack": "single",
    "power": 1.5,
    "baseAttack": 1.5,
    "baseAttackByStar": [
      0,
      1.5,
      4.5,
      13.5
    ],
    "normalAttack": {
      "pattern": "single",
      "primary": 1.5,
      "adjacent": 0,
      "eachTarget": 0
    },
    "path": "记忆",
    "element": "雷",
    "faction": "翁法罗斯",
    "description": "累计登场2次后，在第2次登场的本次转动全部结算结束时，删除自身。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "selfDelete",
        "value": 2,
        "trigger": "turnEnd",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "afterAppearances": 2,
        "summary": "累计登场2次后，在本次转动全部结算结束时删除自身",
        "globalException": "角色自身存续规则，不对其他角色提供全场增益"
      }
    ],
    "adaptation": "本作改编角色；借用阿格莱雅现有官方素材作来源标识，不宣称为衣匠独立官方立绘",
    "officialRarity": 5,
    "publicationStatus": "released",
    "sourceUrl": "https://wiki.hoyolab.com/pc/hsr/entry/3286?lang=en-us",
    "portraitKind": "shared-source",
    "kitVersion": 8,
    "role": "attack",
    "roleLabel": "攻击",
    "recruitable": false
  }
];

export const ITEMS = [
  {
    "id": "cosmic_lotto",
    "name": "银河大乐透",
    "rarity": "uncommon",
    "icon": "🎟️",
    "description": "持有期间，每次转动有20%概率使全队本次造成的伤害提高50%；下次转动重新判定。",
    "image": "./public/assets/curios/1026.png",
    "assetId": 1026,
    "effects": [
      {
        "type": "damageBonus",
        "summary": "每次转动有20%概率使全队本次造成的伤害提高50%",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "chance": 0.2
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        ]
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "gold_coin",
    "name": "天外重声大碟",
    "rarity": "common",
    "icon": "💿",
    "description": "持有期间，所有登场角色的攻击力增加0.3。每次转动重新计算，不累积。",
    "image": "./public/assets/curios/1031.png",
    "assetId": 1031,
    "effects": [
      {
        "type": "power",
        "value": 0.3,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "summary": "所有登场角色的攻击力增加0.3；每次转动重新计算"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "preservation_wax",
    "name": "存护火漆",
    "rarity": "uncommon",
    "icon": "🕯️",
    "description": "持有期间，获得的护盾量提高50%。每个新关开始时，获得8点基础护盾；该数值再按护盾量加成结算。",
    "image": "./public/assets/curios/1020.png",
    "assetId": 1020,
    "effects": [
      {
        "type": "shieldMultiplier",
        "summary": "持有时，护盾获取量×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 1.5
      },
      {
        "type": "shield",
        "summary": "进入新关时获得8基础护盾",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 8
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "abundance_wax",
    "name": "丰饶火漆",
    "rarity": "uncommon",
    "icon": "🌱",
    "description": "持有期间，提供的治疗量提高50%。取得时恢复20点基础生命；该数值再按治疗量加成结算。",
    "image": "./public/assets/curios/1025.png",
    "assetId": 1025,
    "effects": [
      {
        "type": "healMultiplier",
        "summary": "持有时，治疗量×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 1.5
      },
      {
        "type": "heal",
        "summary": "取得时立即恢复20基础生命，受治疗倍率影响",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 20
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "hunt_wax",
    "name": "巡猎火漆",
    "rarity": "uncommon",
    "icon": "🏹",
    "description": "持有期间，单体攻击角色每次造成的伤害提高30%。",
    "image": "./public/assets/curios/1022.png",
    "assetId": 1022,
    "effects": [
      {
        "type": "damageBonus",
        "summary": "持有时，单体角色每次造成的伤害提高30%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.3,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "destruction_wax",
    "name": "毁灭火漆",
    "rarity": "uncommon",
    "icon": "🔥",
    "description": "持有期间，扩散攻击角色每次造成的伤害提高25%。",
    "image": "./public/assets/curios/1023.png",
    "assetId": 1023,
    "effects": [
      {
        "type": "damageBonus",
        "summary": "持有时，扩散角色每次造成的伤害提高25%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.25,
        "filter": {
          "attack": "blast"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "erudition_wax",
    "name": "智识火漆",
    "rarity": "uncommon",
    "icon": "📚",
    "description": "持有期间，群体攻击角色每次造成的伤害提高25%。",
    "image": "./public/assets/curios/1082.png",
    "assetId": 1082,
    "effects": [
      {
        "type": "damageBonus",
        "summary": "持有时，群体角色每次造成的伤害提高25%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.25,
        "filter": {
          "attack": "aoe"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "harmony_wax",
    "name": "纯美骑士精神",
    "rarity": "rare",
    "icon": "🎼",
    "description": "持有期间，相邻和定向辅助的攻击力平加增益×1.5；不永久叠加。",
    "image": "./public/assets/curios/1051.png",
    "assetId": 1051,
    "effects": [
      {
        "type": "buffMultiplier",
        "summary": "持有时，相邻与定向辅助的攻击力平加增益×1.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.5
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "nihility_wax",
    "name": "虚无火漆",
    "rarity": "uncommon",
    "icon": "🌀",
    "description": "每次转动，有虚无角色登场的列，其对应敌人本次受到的伤害提高10%。同列有多名虚无角色时，该效果不重复叠加。",
    "image": "./public/assets/curios/1047.png",
    "assetId": 1047,
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.1,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "occupiedColumns",
        "stacking": "additive",
        "summary": "有虚无角色登场的敌列，本次转动受到的伤害提高10%；每列只生效一次",
        "filter": {
          "path": "虚无"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "value": 15
      },
      {
        "type": "heal",
        "summary": "取得时恢复15基础生命",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 15
      },
      {
        "type": "heal",
        "summary": "每次转动恢复2基础生命",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 2
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "doctor_robe",
    "name": "博士之袍",
    "rarity": "rare",
    "icon": "🥼",
    "description": "持有期间，二星和三星角色的本次造成的伤害提高20%。",
    "image": "./public/assets/curios/1011.png",
    "assetId": 1011,
    "effects": [
      {
        "type": "damageBonus",
        "summary": "持有时，二星、三星角色每次造成的伤害提高20%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.2,
        "filter": {
          "starsMin": 2
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "chance": 0.2
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "resource": "coins"
      },
      {
        "type": "resource",
        "summary": "每次过关后获得1次移除机会",
        "trigger": "clear",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 1,
        "resource": "removals"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "insect_web",
    "name": "虫网",
    "rarity": "common",
    "icon": "🕸️",
    "description": "本次每有1位角色删除，获得4信用点并恢复2基础生命。",
    "image": "./public/assets/curios/1019.png",
    "assetId": 1019,
    "effects": [
      {
        "type": "resource",
        "summary": "本次每删除1位角色，获得4信用点",
        "trigger": "retire",
        "duration": "resource",
        "target": "team",
        "stacking": "resource",
        "value": 4,
        "resource": "coins",
        "per": {
          "metric": "retirements"
        }
      },
      {
        "type": "heal",
        "summary": "本次每删除1位角色，恢复2基础生命",
        "trigger": "retire",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "per": {
          "metric": "retirements"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "value": 1
      },
      {
        "type": "extraSpin",
        "summary": "持有期间，每个新关的转动上限+1",
        "trigger": "floor",
        "duration": "encounter",
        "target": "team",
        "stacking": "unique",
        "value": 1
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "divination_candle",
    "name": "香涎干酪",
    "rarity": "rare",
    "icon": "🧀",
    "description": "持有期间，羁绊提供的伤害提高增量提高50%。",
    "image": "./public/assets/curios/1006.png",
    "assetId": 1006,
    "effects": [
      {
        "type": "synergyDamageMultiplier",
        "value": 1.5,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "summary": "羁绊提供的伤害提高增量提高50%"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "broken_clock",
    "name": "碎星芳饵",
    "rarity": "legendary",
    "icon": "✨",
    "description": "持有期间，我方角色造成的伤害提高20%。取得时获得2次重掷。",
    "image": "./public/assets/curios/1029.png",
    "assetId": 1029,
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.2,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "summary": "持有期间，我方角色造成的伤害提高20%"
      },
      {
        "type": "resource",
        "value": 2,
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "resource": "rerolls",
        "summary": "取得时获得2次重掷"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "rubert_gear",
    "name": "鲁珀特帝国机械齿轮",
    "rarity": "rare",
    "icon": "⚙️",
    "description": "持有期间，角色通过技能获得的本局永久攻击力固定增量提高50%。已经获得的攻击力保留至本局结束。",
    "image": "./public/assets/curios/1070.png",
    "assetId": 1070,
    "effects": [
      {
        "type": "attackGrowthMultiplier",
        "value": 1.5,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "summary": "角色通过技能获得的本局永久攻击力固定增量提高50%",
        "source": "skill"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "compound_eye",
    "name": "跃迁复眼",
    "rarity": "uncommon",
    "icon": "👁️",
    "image": "./public/assets/curios/1003.png",
    "assetId": 1003,
    "description": "持有时，一星角色每次攻击力+0.4。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，一星角色每次攻击力+0.4",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "beauty_robe",
    "name": "纯美之袍",
    "rarity": "uncommon",
    "icon": "👗",
    "image": "./public/assets/curios/1014.png",
    "assetId": 1014,
    "description": "持有时，按信用点÷30×0.12增加全队本次攻击力（最高+0.36，可为小数）。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，按信用点÷30×0.12增加全队本次攻击力（最高+0.36，可为小数）",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "void_wick",
    "name": "空无烛剪",
    "rarity": "uncommon",
    "icon": "✂️",
    "image": "./public/assets/curios/1017.png",
    "assetId": 1017,
    "description": "编队不多于16人时，全队每次攻击力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "编队不多于16人时，全队每次攻击力+0.5",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "condition": {
          "metric": "roster",
          "op": "lte",
          "value": 16,
          "filter": {}
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "impermanence_dice",
    "name": "万象无常骰",
    "rarity": "rare",
    "icon": "🎲",
    "image": "./public/assets/curios/1034.png",
    "assetId": 1034,
    "description": "持有期间，角色通过技能获得的本局永久攻击力固定增量提高20%。取得时获得1次移除机会。",
    "effects": [
      {
        "type": "attackGrowthMultiplier",
        "summary": "角色通过技能获得的本局永久攻击力固定增量提高20%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2,
        "source": "skill"
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "elation_wax",
    "name": "欢愉火漆",
    "rarity": "uncommon",
    "icon": "🎭",
    "image": "./public/assets/curios/1021.png",
    "assetId": 1021,
    "description": "持有期间，我方角色的追加攻击造成的伤害提高25%。",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.25,
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "summary": "持有期间，我方角色的追加攻击造成的伤害提高25%",
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "remembrance_wax",
    "name": "记忆火漆",
    "rarity": "uncommon",
    "icon": "❄️",
    "image": "./public/assets/curios/1024.png",
    "assetId": 1024,
    "description": "持有时，记忆角色每次攻击力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，记忆角色每次攻击力+0.8",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "propagation_wax",
    "name": "繁育火漆",
    "rarity": "rare",
    "icon": "🦋",
    "image": "./public/assets/curios/1052.png",
    "assetId": 1052,
    "description": "本次每登场1名角色，获得1护盾（最多5）。",
    "effects": [
      {
        "type": "shield",
        "summary": "本次每登场1名角色，获得1护盾（最多5）",
        "trigger": "spin",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "present",
          "filter": {
          },
          "cap": 5
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "annihilation_wick",
    "name": "湮灭烛剪",
    "rarity": "uncommon",
    "icon": "🕯️",
    "image": "./public/assets/curios/1046.png",
    "assetId": 1046,
    "description": "本次转动全部结算结束、角色被删除后，每删除1名角色，对所有存活敌人各造成1点奇物伤害（最多计4名）。",
    "effects": [
      {
        "type": "damage",
        "summary": "本次转动全部结算结束、角色被删除后，每删除1名角色，对所有存活敌人各造成1点奇物伤害（最多计4名）",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "spacetime_prism",
    "name": "时空棱镜",
    "rarity": "rare",
    "icon": "🔮",
    "image": "./public/assets/curios/1028.png",
    "assetId": 1028,
    "description": "持有时，三星角色每次造成的伤害提高30%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "持有时，三星角色每次造成的伤害提高30%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.3,
        "filter": {
          "starsMin": 3
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "beacon_colorant",
    "name": "信标着色剂",
    "rarity": "uncommon",
    "icon": "🖌️",
    "image": "./public/assets/curios/1036.png",
    "assetId": 1036,
    "description": "持有时，每登场1名虚数角色，所有量子角色本次攻击力+0.2（最多4名）。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，每登场1名虚数角色，所有量子角色本次攻击力+0.2（最多4名）",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "family_ties",
    "name": "家族缘结",
    "rarity": "uncommon",
    "icon": "🪢",
    "image": "./public/assets/curios/1057.png",
    "assetId": 1057,
    "description": "持有时，匹诺康尼角色每次攻击力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，匹诺康尼角色每次攻击力+0.7",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "genius_gossip",
    "name": "天才俱乐部普通八卦",
    "rarity": "uncommon",
    "icon": "📰",
    "image": "./public/assets/curios/1063.png",
    "assetId": 1063,
    "description": "持有时，至少登场3名智识角色则群体角色本次攻击力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，至少登场3名智识角色则群体角色本次攻击力+0.7",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "cavity_model",
    "name": "龋齿星系模型",
    "rarity": "rare",
    "icon": "🪐",
    "image": "./public/assets/curios/1065.png",
    "assetId": 1065,
    "description": "生命≤45%时，全队本次造成的伤害提高15%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "生命≤45%时，全队本次造成的伤害提高15%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 0.15,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.45
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "fools_mask",
    "name": "愚者面具",
    "rarity": "rare",
    "icon": "🤡",
    "image": "./public/assets/curios/1067.png",
    "assetId": 1067,
    "description": "每次转动有25%概率使全队本次造成的伤害提高15%。每次转动有25%概率获得6护盾，独立判定。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "每次转动有25%概率使全队本次造成的伤害提高15%",
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.15,
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "meteorite",
    "name": "人造陨石球",
    "rarity": "uncommon",
    "icon": "☄️",
    "image": "./public/assets/curios/1061.png",
    "assetId": 1061,
    "description": "每第4次转动，所有角色的常规攻击结算后，对所有存活敌人各造成2点伤害。",
    "effects": [
      {
        "type": "damage",
        "summary": "每第4次转动，常规攻击结算后对所有存活敌人各造成2点奇物伤害",
        "trigger": "spin",
        "duration": "instant",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "every": 4,
        "stage": "afterAttacks"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "tala_flame",
    "name": "塔拉毒火焰",
    "rarity": "uncommon",
    "icon": "🔥",
    "image": "./public/assets/curios/1062.png",
    "assetId": 1062,
    "description": "持有时，火属性角色每次攻击力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，火属性角色每次攻击力+0.5",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "triangle_instrument",
    "name": "三角滚奏器",
    "rarity": "uncommon",
    "icon": "🔺",
    "image": "./public/assets/curios/1033.png",
    "assetId": 1033,
    "description": "持有时，辅助攻击力平加增益×1.2。",
    "effects": [
      {
        "type": "buffMultiplier",
        "summary": "持有时，辅助攻击力平加增益×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "multiplicative",
        "value": 1.2
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "evil_satellite",
    "name": "邪恶机械卫星#900",
    "rarity": "rare",
    "icon": "🛰️",
    "image": "./public/assets/curios/1050.png",
    "assetId": 1050,
    "description": "每次转动，敌方在攻击阶段造成的总伤害降低1点。",
    "effects": [
      {
        "type": "retaliationFlat",
        "value": 1,
        "trigger": "spin",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "summary": "敌方本次转动在攻击阶段造成的总伤害降低1点"
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "whisker_powder",
    "name": "一撮胡须火药",
    "rarity": "uncommon",
    "icon": "🧨",
    "image": "./public/assets/curios/1066.png",
    "assetId": 1066,
    "description": "持有时，扩散角色每次攻击力+0.6。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，扩散角色每次攻击力+0.6",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "blood_badge",
    "name": "血锦之纪徽章",
    "rarity": "rare",
    "icon": "🎖️",
    "image": "./public/assets/curios/1069.png",
    "assetId": 1069,
    "description": "持有时，毁灭角色每次攻击力+0.7。取得时恢复8基础生命。",
    "effects": [
      {
        "type": "power",
        "summary": "持有时，毁灭角色每次攻击力+0.7",
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  },
  {
    "id": "peace_price",
    "name": "和平的代价",
    "rarity": "uncommon",
    "icon": "🕊️",
    "image": "./public/assets/curios/1074.png",
    "assetId": 1074,
    "description": "持有时，护盾获取量×1.2。持有时，单体角色本次造成的伤害降低5%。",
    "effects": [
      {
        "type": "shieldMultiplier",
        "summary": "持有时，护盾获取量×1.2",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": 1.2
      },
      {
        "type": "damageBonus",
        "summary": "持有时，单体角色本次造成的伤害降低5%",
        "trigger": "passive",
        "duration": "whileOwned",
        "target": "team",
        "stacking": "additive",
        "value": -0.05,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
        "stacking": "additive",
        "value": 1.2
      }
    ],
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
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
    "adaptation": "本作改编机制",
    "kitVersion": 8
  }
];

export const ESSENCES = [
  {
    "id": "essence_elation",
    "name": "银河大乐透·精华",
    "rarity": "rare",
    "icon": "🎭",
    "target": 100,
    "description": "取得后累计造成100伤害：结算达标后，从下次转动起全队造成的伤害提高15%，本局持续。",
    "image": "./public/assets/curios/1026.png",
    "assetId": 1026,
    "progress": {
      "metric": "damage"
    },
    "effects": [
      {
        "type": "damageBonus",
        "summary": "达标后从下次转动起，本局全队造成的伤害提高15%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.15
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
        "value": 20
      },
      {
        "type": "heal",
        "summary": "达标时按新生命上限进行一次治疗；治疗折价可能使实际生命未回满",
        "trigger": "acquire",
        "duration": "resource",
        "target": "team",
        "stacking": "unique",
        "value": 0,
        "fullRestore": true
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_hunt",
    "name": "巡猎火漆·精华",
    "rarity": "rare",
    "icon": "🎯",
    "target": 12,
    "description": "取得后单体角色累计登场12次：达标后从下次转动起单体造成的伤害提高35%，本局持续。",
    "image": "./public/assets/curios/1022.png",
    "assetId": 1022,
    "progress": {
      "metric": "single"
    },
    "effects": [
      {
        "type": "damageBonus",
        "summary": "达标后从下次转动起，本局单体造成的伤害提高35%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.35,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_destruction",
    "name": "毁灭火漆·精华",
    "rarity": "rare",
    "icon": "💥",
    "target": 8,
    "description": "取得后再转动8次：达标后从下次转动起所有角色每次攻击力+1，本局持续，不逐轮叠加。",
    "image": "./public/assets/curios/1023.png",
    "assetId": 1023,
    "progress": {
      "metric": "spins"
    },
    "effects": [
      {
        "type": "power",
        "summary": "达标后从下次转动起，本局所有角色每次攻击力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_erudition",
    "name": "智识火漆·精华",
    "rarity": "rare",
    "icon": "🧠",
    "target": 10,
    "description": "取得后群体角色累计登场10次：达标后从下次转动起群体角色每次攻击力+1，本局持续。",
    "image": "./public/assets/curios/1082.png",
    "assetId": 1082,
    "progress": {
      "metric": "aoe"
    },
    "effects": [
      {
        "type": "power",
        "summary": "达标后从下次转动起，本局群体角色每次攻击力+1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "attack": "aoe"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_harmony",
    "name": "纯美骑士精神·精华",
    "rarity": "rare",
    "icon": "🎵",
    "target": 12,
    "description": "取得后每次转动按生效羁绊数积累，达到12：立即获得3次重掷，之后全队造成的伤害提高10%，本局持续。",
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
        "resource": "rerolls"
      },
      {
        "type": "damageBonus",
        "summary": "达标后从下次转动起，本局全队造成的伤害提高10%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.1
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
        "stacking": "additive",
        "value": 1.3
      },
      {
        "type": "shield",
        "summary": "达标后每个新关获得12基础护盾",
        "trigger": "floor",
        "duration": "resource",
        "target": "team",
        "stacking": "additive",
        "value": 12
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_nihility",
    "name": "虚无火漆·精华",
    "rarity": "rare",
    "icon": "🌌",
    "target": 8,
    "description": "取得后虚无角色累计登场8次：达标后从下次转动起，有虚无角色登场的敌列受到的伤害提高15%，每列只生效一次，本局持续。",
    "image": "./public/assets/curios/1047.png",
    "assetId": 1047,
    "progress": {
      "metric": "nihility"
    },
    "effects": [
      {
        "type": "enemyVulnerability",
        "value": 0.15,
        "trigger": "passive",
        "duration": "run",
        "target": "occupiedColumns",
        "stacking": "additive",
        "summary": "有虚无角色登场的敌列，本次转动受到的伤害提高15%；每列只生效一次",
        "filter": {
          "path": "虚无"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计转动内获得信用点（不计取得/通关奖励）达到24：达标时立即获得12信用点。之后本局全队每次攻击力+0.25。",
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
        "summary": "之后本局全队每次攻击力+0.25",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.25
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计使用移除达到3：之后本局，编队≤18人时全队每次攻击力+0.7。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局，编队≤18人时全队每次攻击力+0.7",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "condition": {
          "metric": "roster",
          "op": "lte",
          "value": 18,
          "filter": {}
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计消费信用点达到24：之后本局单体角色每次造成的伤害提高15%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "之后本局单体角色每次造成的伤害提高15%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.15,
        "filter": {
          "attack": "single"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计完成合成达到2：之后本局二星、三星角色每次攻击力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局二星、三星角色每次攻击力+1",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计转动达到5：之后本局一星角色每次攻击力+0.5。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局一星角色每次攻击力+0.5",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计击破敌列达到8：之后本局群体角色每次攻击力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局群体角色每次攻击力+0.8",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计转动达到6：之后本局，持有信用点≥20时全队造成的伤害提高12%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "之后本局，持有信用点≥20时全队造成的伤害提高12%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.12,
        "condition": {
          "metric": "coins",
          "op": "gte",
          "value": 20
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  },
  {
    "id": "essence_elation_wax",
    "name": "欢愉火漆·精华",
    "rarity": "rare",
    "icon": "🎭",
    "image": "./public/assets/curios/1021.png",
    "assetId": 1021,
    "target": 12,
    "progress": {
      "metric": "followUpAttacks"
    },
    "description": "取得后累计发动12次追加攻击：达标后从下次转动起，角色追加攻击造成的伤害提高30%，本局持续。",
    "effects": [
      {
        "type": "damageBonus",
        "value": 0.3,
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "summary": "角色追加攻击造成的伤害提高30%",
        "attackType": "followUp"
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计转动达到6：之后本局记忆角色每次攻击力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局记忆角色每次攻击力+1",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计角色删除达到3：达标时立即获得1次移除机会。之后本局护盾获取量×1.1。",
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
        "stacking": "additive",
        "value": 1.1
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计角色删除达到5：之后本局毁灭角色每次攻击力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局毁灭角色每次攻击力+1",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
        "stacking": "additive",
        "value": 1.15,
        "filter": {
          "path": "存护"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计单体角色登场达到10：之后本局量子角色每次攻击力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局量子角色每次攻击力+0.8",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计生效羁绊数达到15：之后本局匹诺康尼角色每次攻击力+1。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局匹诺康尼角色每次攻击力+1",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计群体角色登场达到12：之后本局智识角色每次造成的伤害提高15%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "之后本局智识角色每次造成的伤害提高15%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.15,
        "filter": {
          "path": "智识"
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
        "stacking": "additive",
        "value": 1.2
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计造成伤害达到300：之后本局生命≤50%时，全队本次造成的伤害提高18%。",
    "effects": [
      {
        "type": "damageBonus",
        "summary": "之后本局生命≤50%时，全队本次造成的伤害提高18%",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.18,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计转动达到7：之后本局每次转动敌人造成的总伤害−1。",
    "effects": [
      {
        "type": "retaliationFlat",
        "summary": "之后本局每次转动敌人造成的总伤害−1",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 1
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计群体角色登场达到10：之后本局火属性角色每次攻击力+0.9。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局火属性角色每次攻击力+0.9",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "description": "取得后累计造成伤害达到220：之后本局扩散角色每次攻击力+0.8。",
    "effects": [
      {
        "type": "power",
        "summary": "之后本局扩散角色每次攻击力+0.8",
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
        "stacking": "additive",
        "value": 1.1
      }
    ],
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
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
    "adaptation": "本作条件解锁改编",
    "kitVersion": 8
  }
];

const characters = new Map([...CHARACTERS, ...CREATED_CHARACTERS].map(c => [c.id, c]));
export const characterById = id => characters.get(String(id));
export const itemById = id => ITEMS.find(item => item.id === id);
export const essenceById = id => ESSENCES.find(essence => essence.id === id);
