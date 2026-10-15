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
    "power": 1,
    "path": "存护",
    "element": "冰",
    "faction": "星穹列车",
    "description": "登场时获得3护盾，保留至抵挡伤害；上限为生命上限的2倍。存在衰减条款时按条款扣除。",
    "color": "#f9a8d4",
    "effects": [
      {
        "type": "shield",
        "summary": "每次登场获得3护盾；保留至抵挡伤害，存在衰减条款时按条款扣除",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1002",
    "name": "丹恒",
    "enName": "Dan Heng",
    "assetId": 1002,
    "rarity": "common",
    "attack": "single",
    "power": 1,
    "path": "巡猎",
    "element": "风",
    "faction": "星穹列车",
    "description": "每累计登场3次，本实例永久威力+1；跨关保留，合成时继承。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "growth",
        "summary": "每累计登场3次，本实例永久威力+1",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "every": 3,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "本次转动每有1位临时角色退场，自身本次威力+2；下次转动重新计算。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "summary": "本次转动每有1位临时角色退场，自身威力+2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "per": {
          "metric": "retirements"
        },
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1004",
    "name": "瓦尔特",
    "enName": "Welt",
    "assetId": 1004,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "虚无",
    "element": "虚数",
    "faction": "星穹列车",
    "description": "登场时，使本次转动敌人的反击总伤害−2；下次转动失效。",
    "color": "#fbbf24",
    "effects": [
      {
        "type": "retaliationFlat",
        "summary": "本次转动敌人反击总伤害−2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 2,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1005",
    "name": "卡芙卡",
    "enName": "Kafka",
    "assetId": 1005,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "虚无",
    "element": "雷",
    "faction": "星核猎手",
    "description": "登场时，本次登场的虚无角色威力+1；下次转动重新计算，不永久叠加。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "power",
        "summary": "本次登场的所有虚无角色威力+1；不同卡芙卡实例可相加",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "path": "虚无"
        },
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1006",
    "name": "银狼",
    "enName": "Silver Wolf",
    "assetId": 1006,
    "rarity": "rare",
    "attack": "single",
    "power": 3,
    "path": "虚无",
    "element": "量子",
    "faction": "星核猎手",
    "description": "登场时，本次全队攻击无视装甲，自身本次威力+1；下次转动失效。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "ignoreArmor",
        "summary": "本次转动全队攻击无视装甲",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "legacy": true
      },
      {
        "type": "power",
        "summary": "本次转动自身威力+1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1008",
    "name": "阿兰",
    "enName": "Arlan",
    "assetId": 1008,
    "rarity": "common",
    "attack": "blast",
    "power": 1,
    "path": "毁灭",
    "element": "雷",
    "faction": "黑塔空间站",
    "description": "本次威力结算时，生命不高于上限一半则自身威力×2；生命变化后重新判断。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "结算威力时，生命≤50%则自身本次威力×2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 2,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        },
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1009",
    "name": "艾丝妲",
    "enName": "Asta",
    "assetId": 1009,
    "rarity": "common",
    "attack": "support",
    "power": 1,
    "path": "同谐",
    "element": "火",
    "faction": "黑塔空间站",
    "description": "登场时，相邻八格角色本次威力+0.5；不会永久叠加。",
    "color": "#fda4af",
    "effects": [
      {
        "type": "power",
        "summary": "本次转动相邻八格角色威力+0.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 0.5,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1013",
    "name": "黑塔",
    "enName": "Herta",
    "assetId": 1013,
    "rarity": "common",
    "attack": "aoe",
    "power": 1,
    "path": "智识",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "每第3次登场，自身本次威力+2；其他登场次数不生效。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "summary": "每第3次登场，自身本次威力+2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "every": 3,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1101",
    "name": "布洛妮娅",
    "enName": "Bronya",
    "assetId": 1101,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "同谐",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "登场时，相邻八格角色本次威力+1；不会永久叠加。",
    "color": "#bae6fd",
    "effects": [
      {
        "type": "power",
        "summary": "本次转动相邻八格角色威力+1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 1,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "自身击破敌人后，向最近存活列追加1倍自身本次威力攻击；只在本次转动结算。",
    "color": "#a78bfa",
    "effects": [
      {
        "type": "damage",
        "summary": "自身击破敌人后，向最近存活列追加1倍自身本次威力攻击",
        "trigger": "kill",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "value": 1,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1103",
    "name": "希露瓦",
    "enName": "Serval",
    "assetId": 1103,
    "rarity": "common",
    "attack": "aoe",
    "power": 1,
    "path": "智识",
    "element": "雷",
    "faction": "贝洛伯格",
    "description": "本次每有1名相邻雷属性角色，自身本次威力+1；下次转动重新计算。",
    "color": "#fde68a",
    "effects": [
      {
        "type": "power",
        "summary": "每有1名相邻雷属性角色，自身本次威力+1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "neighbors",
          "filter": {
            "element": "雷"
          }
        },
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1104",
    "name": "杰帕德",
    "enName": "Gepard",
    "assetId": 1104,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2,
    "path": "存护",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "每次登场获得5护盾，保留至抵挡伤害；存在衰减条款时按条款扣除。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "shield",
        "summary": "每次登场获得5护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 5,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1105",
    "name": "娜塔莎",
    "enName": "Natasha",
    "assetId": 1105,
    "rarity": "common",
    "attack": "support",
    "power": 1,
    "path": "丰饶",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "每次登场恢复3生命，不能超过生命上限；不产生永久威力。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "summary": "每次登场恢复3生命，不叠成永久威力",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1106",
    "name": "佩拉",
    "enName": "Pela",
    "assetId": 1106,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2,
    "path": "虚无",
    "element": "冰",
    "faction": "贝洛伯格",
    "description": "登场时，相邻冰属性角色本次威力+1，且本次全队攻击无视装甲；下次转动失效。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "power",
        "summary": "本次转动相邻冰属性角色威力+1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "element": "冰"
        },
        "scaleWithStars": true,
        "legacy": true
      },
      {
        "type": "ignoreArmor",
        "summary": "本次转动全队攻击无视装甲",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每累计登场2次，本实例永久威力+1；跨关保留，合成时继承。",
    "color": "#fca5a5",
    "effects": [
      {
        "type": "growth",
        "summary": "每累计登场2次，本实例永久威力+1",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "every": 2,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1108",
    "name": "桑博",
    "enName": "Sampo",
    "assetId": 1108,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2,
    "path": "虚无",
    "element": "风",
    "faction": "贝洛伯格",
    "description": "每次登场有25%概率加入临时虎克；从下次转动起可抽到，累计登场3次后退场。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "summon",
        "summary": "每次登场有25%概率加入一位临时虎克；下次转动起可抽到，登场3次后退场",
        "trigger": "appearance",
        "duration": "appearances",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "chance": 0.25,
        "characterId": "1109",
        "durationAppearances": 3,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1109",
    "name": "虎克",
    "enName": "Hook",
    "assetId": 1109,
    "rarity": "common",
    "attack": "blast",
    "power": 1,
    "path": "毁灭",
    "element": "火",
    "faction": "贝洛伯格",
    "description": "消耗1位相邻临时角色，使自身本次威力+4；被消耗者本次不再攻击。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "consume",
        "summary": "消耗1位相邻临时角色，使自身本次威力+4；目标不再攻击",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 4,
        "filter": {
          "temporary": true
        },
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1205",
    "name": "刃",
    "enName": "Blade",
    "assetId": 1205,
    "rarity": "legendary",
    "attack": "blast",
    "power": 4,
    "path": "毁灭",
    "element": "风",
    "faction": "星核猎手",
    "description": "每次登场永久威力+0.5，并消耗2生命（不会致死）；星级放大生命消耗，成长跨关保留。",
    "color": "#f87171",
    "effects": [
      {
        "type": "growth",
        "summary": "每次登场，本实例永久威力+0.5",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "value": 0.5,
        "legacy": true
      },
      {
        "type": "selfDamage",
        "summary": "每次登场消耗2生命，最多降至1；星级放大消耗",
        "trigger": "appearance",
        "duration": "instant",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "nonlethal": true,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1204",
    "name": "景元",
    "enName": "Jing Yuan",
    "assetId": 1204,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 4,
    "path": "智识",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "每第2次登场，自身本次威力+2；下次转动按登场计数重新判断。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "summary": "每第2次登场，自身本次威力+2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "every": 2,
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1203",
    "name": "罗刹",
    "enName": "Luocha",
    "assetId": 1203,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "丰饶",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "每次登场恢复6生命；自身本次治疗溢出的实际数值转为护盾。",
    "color": "#bef264",
    "effects": [
      {
        "type": "heal",
        "summary": "每次登场恢复6生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 6,
        "scaleWithStars": true,
        "legacy": true
      },
      {
        "type": "healOverflowShield",
        "summary": "自身本次治疗溢出的实际数值转为护盾",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "unique",
        "value": 1,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1208",
    "name": "符玄",
    "enName": "Fu Xuan",
    "assetId": 1208,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "存护",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "每次登场获得6护盾，并使本次敌人反击伤害×0.8；减伤只在本次有效。",
    "color": "#f0abfc",
    "effects": [
      {
        "type": "shield",
        "summary": "每次登场获得6护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 6,
        "scaleWithStars": true,
        "legacy": true
      },
      {
        "type": "retaliationMultiplier",
        "summary": "本次转动敌人反击伤害×0.8；多个符玄倍率相乘",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "multiplicative",
        "value": 0.8,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1201",
    "name": "青雀",
    "enName": "Qingque",
    "assetId": 1201,
    "rarity": "common",
    "attack": "blast",
    "power": 1,
    "path": "智识",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "每次登场有20%概率使自身本次威力×4；不改变基础或永久威力。",
    "color": "#5eead4",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "每次登场有20%概率使自身本次威力×4",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 4,
        "chance": 0.2,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1202",
    "name": "停云",
    "enName": "Tingyun",
    "assetId": 1202,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "同谐",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "本次使当前威力最高的其他角色威力+2；并列取格位靠前者，下次转动失效。",
    "color": "#fdba74",
    "effects": [
      {
        "type": "power",
        "summary": "本次转动使当前威力最高的其他角色威力+2；并列取格位靠前者",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "additive",
        "value": 2,
        "filter": {
          "excludeSelf": true
        },
        "scaleWithStars": true,
        "legacy": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1110",
    "name": "玲可",
    "enName": "Lynx",
    "assetId": 1110,
    "rarity": "common",
    "attack": "support",
    "power": 1,
    "path": "丰饶",
    "element": "量子",
    "faction": "贝洛伯格",
    "description": "登场时恢复2生命。登场时生命≤60%，再获得2护盾。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "heal",
        "summary": "登场时恢复2生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "scaleWithStars": true
      },
      {
        "type": "shield",
        "summary": "登场时生命≤60%，再获得2护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.6
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1111",
    "name": "卢卡",
    "enName": "Luka",
    "assetId": 1111,
    "rarity": "common",
    "attack": "single",
    "power": 1,
    "path": "虚无",
    "element": "物理",
    "faction": "贝洛伯格",
    "description": "每名相邻物理角色使自身本次威力+0.8。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "power",
        "summary": "每名相邻物理角色使自身本次威力+0.8",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 0.8,
        "per": {
          "metric": "neighbors",
          "filter": {
            "element": "物理"
          }
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每次登场获得2信用点。自身常规攻击每击破一列敌人，另获2信用点。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "resource",
        "summary": "每次登场获得2信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 2,
        "resource": "coins"
      },
      {
        "type": "resource",
        "summary": "自身常规攻击每击破一列敌人，另获2信用点",
        "trigger": "kill",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 2,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1206",
    "name": "素裳",
    "enName": "Sushang",
    "assetId": 1206,
    "rarity": "common",
    "attack": "single",
    "power": 1,
    "path": "巡猎",
    "element": "物理",
    "faction": "仙舟罗浮",
    "description": "存活敌人不多于2列时，自身本次威力+1.5。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "power",
        "summary": "存活敌人不多于2列时，自身本次威力+1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 1.5,
        "condition": {
          "metric": "enemies",
          "op": "lte",
          "value": 2
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1207",
    "name": "驭空",
    "enName": "Yukong",
    "assetId": 1207,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "同谐",
    "element": "虚数",
    "faction": "仙舟罗浮",
    "description": "本次所有登场的虚数角色威力+0.8。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "summary": "本次所有登场的虚数角色威力+0.8",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.8,
        "filter": {
          "element": "虚数"
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "轮到自身登场结算时已持有护盾，则自身本次威力×1.35。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "轮到自身登场结算时已持有护盾，则自身本次威力×1.35",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.35,
        "condition": {
          "metric": "shield",
          "op": "gte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1210",
    "name": "桂乃芬",
    "enName": "Guinaifen",
    "assetId": 1210,
    "rarity": "common",
    "attack": "blast",
    "power": 1,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "本次每存活1列敌人，所有虚无角色威力+0.15（最多5列）。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "power",
        "summary": "本次每存活1列敌人，所有虚无角色威力+0.15（最多5列）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.15,
        "filter": {
          "path": "虚无"
        },
        "per": {
          "metric": "enemies",
          "cap": 5
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1211",
    "name": "白露",
    "enName": "Bailu",
    "assetId": 1211,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "丰饶",
    "element": "雷",
    "faction": "仙舟罗浮",
    "description": "登场时恢复3生命。治疗后生命仍≤35%，获得4护盾。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "heal",
        "summary": "登场时恢复3生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true
      },
      {
        "type": "shield",
        "summary": "治疗后生命仍≤35%，获得4护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.35
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每次登场消耗2生命，最多降至1。生命≤50%时，自身本次威力×1.5。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "selfDamage",
        "summary": "每次登场消耗2生命，最多降至1",
        "trigger": "appearance",
        "duration": "instant",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "nonlethal": true
      },
      {
        "type": "powerMultiplier",
        "summary": "生命≤50%时，自身本次威力×1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.5,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.5
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1214",
    "name": "雪衣",
    "enName": "Xueyi",
    "assetId": 1214,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2,
    "path": "毁灭",
    "element": "量子",
    "faction": "仙舟罗浮",
    "description": "每第3次登场，本次常规攻击后向对应列追加6伤害；空列转向最近存活列。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "damage",
        "summary": "每第3次登场，本次常规攻击后向对应列追加6伤害；空列转向最近存活列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "value": 6,
        "every": 3,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1215",
    "name": "寒鸦",
    "enName": "Hanya",
    "assetId": 1215,
    "rarity": "common",
    "attack": "support",
    "power": 1,
    "path": "同谐",
    "element": "物理",
    "faction": "仙舟罗浮",
    "description": "本次每登场1名单体角色，获得1信用点（最多4）。本次威力最高的其他攻击角色威力+0.5。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "resource",
        "summary": "本次每登场1名单体角色，获得1信用点（最多4）",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 1,
        "resource": "coins",
        "per": {
          "metric": "present",
          "filter": {
            "attack": "single"
          },
          "cap": 4
        }
      },
      {
        "type": "power",
        "summary": "本次威力最高的其他攻击角色威力+0.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "additive",
        "value": 0.5,
        "filter": {
          "excludeSelf": true,
          "attackNot": "support"
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1217",
    "name": "藿藿",
    "enName": "Huohuo",
    "assetId": 1217,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "丰饶",
    "element": "风",
    "faction": "仙舟罗浮",
    "description": "每次登场恢复4生命。每第3次登场，额外获得4护盾。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "summary": "每次登场恢复4生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "scaleWithStars": true
      },
      {
        "type": "shield",
        "summary": "每第3次登场，额外获得4护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "every": 3,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1218",
    "name": "椒丘",
    "enName": "Jiaoqiu",
    "assetId": 1218,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2,
    "path": "虚无",
    "element": "火",
    "faction": "仙舟曜青",
    "description": "本次登场至少2名虚无角色时，敌人反击总伤害−1.5。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "retaliationFlat",
        "summary": "本次登场至少2名虚无角色时，敌人反击总伤害−1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 1.5,
        "condition": {
          "metric": "present",
          "op": "gte",
          "value": 2,
          "filter": {
            "path": "虚无"
          }
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1220",
    "name": "飞霄",
    "enName": "Feixiao",
    "assetId": 1220,
    "rarity": "legendary",
    "attack": "single",
    "power": 4,
    "path": "巡猎",
    "element": "风",
    "faction": "仙舟曜青",
    "description": "每第3次登场，本次常规攻击后向对应列追加15伤害；空列取最近存活列。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "damage",
        "summary": "每第3次登场，本次常规攻击后向对应列追加15伤害；空列取最近存活列",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "value": 15,
        "every": 3,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每次登场获得3护盾。生命≤70%时，自身本次威力×1.3。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "shield",
        "summary": "每次登场获得3护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true
      },
      {
        "type": "powerMultiplier",
        "summary": "生命≤70%时，自身本次威力×1.3",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.3,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.7
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1222",
    "name": "灵砂",
    "enName": "Lingsha",
    "assetId": 1222,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "丰饶",
    "element": "火",
    "faction": "仙舟罗浮",
    "description": "每次登场恢复3生命。每第4次登场加入临时桂乃芬，下次起可抽到，登场2次后退场。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "summary": "每次登场恢复3生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true
      },
      {
        "type": "summon",
        "summary": "每第4次登场加入临时桂乃芬，下次起可抽到，登场2次后退场",
        "trigger": "appearance",
        "duration": "appearances",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "every": 4,
        "characterId": "1210",
        "durationAppearances": 2
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1223",
    "name": "貊泽",
    "enName": "Moze",
    "assetId": 1223,
    "rarity": "common",
    "attack": "single",
    "power": 1,
    "path": "巡猎",
    "element": "雷",
    "faction": "仙舟曜青",
    "description": "相邻其他角色不多于1名时，自身本次威力×1.6。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "相邻其他角色不多于1名时，自身本次威力×1.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.6,
        "condition": {
          "metric": "neighbors",
          "op": "lte",
          "value": 1
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1301",
    "name": "加拉赫",
    "enName": "Gallagher",
    "assetId": 1301,
    "rarity": "common",
    "attack": "support",
    "power": 1,
    "path": "丰饶",
    "element": "火",
    "faction": "匹诺康尼",
    "description": "本次每登场1名火属性角色，恢复1生命（最多4）。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "heal",
        "summary": "本次每登场1名火属性角色，恢复1生命（最多4）",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "present",
          "filter": {
            "element": "火"
          },
          "cap": 4
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1302",
    "name": "银枝",
    "enName": "Argenti",
    "assetId": 1302,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2,
    "path": "智识",
    "element": "物理",
    "faction": "纯美骑士",
    "description": "每第4次登场，自身本次威力+4。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "power",
        "summary": "每第4次登场，自身本次威力+4",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "every": 4,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1303",
    "name": "阮·梅",
    "enName": "Ruan Mei",
    "assetId": 1303,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "同谐",
    "element": "冰",
    "faction": "黑塔空间站",
    "description": "相邻其他角色本次威力+0.8。每第4次登场，使相邻非临时攻击角色各永久威力+0.25。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "power",
        "summary": "相邻其他角色本次威力+0.8",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 0.8,
        "scaleWithStars": true
      },
      {
        "type": "growth",
        "summary": "每第4次登场，使相邻非临时攻击角色各永久威力+0.25",
        "trigger": "appearance",
        "duration": "run",
        "target": "adjacent",
        "stacking": "additive",
        "value": 0.25,
        "every": 4,
        "filter": {
          "attackNot": "support",
          "temporary": false
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1304",
    "name": "砂金",
    "enName": "Aventurine",
    "assetId": 1304,
    "rarity": "rare",
    "attack": "blast",
    "power": 3,
    "path": "存护",
    "element": "虚数",
    "faction": "星际和平公司",
    "description": "每次登场获得4护盾。获得护盾后当前护盾≥20时，获得1信用点。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "shield",
        "summary": "每次登场获得4护盾",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "scaleWithStars": true
      },
      {
        "type": "resource",
        "summary": "获得护盾后当前护盾≥20时，获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 1,
        "resource": "coins",
        "condition": {
          "metric": "shield",
          "op": "gte",
          "value": 20
        }
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "本次常规攻击后，每登场1名虚无角色向对应列追加2伤害（最多4名）。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "damage",
        "summary": "本次常规攻击后，每登场1名虚无角色向对应列追加2伤害（最多4名）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "value": 2,
        "per": {
          "metric": "present",
          "filter": {
            "path": "虚无"
          },
          "cap": 4
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1306",
    "name": "花火",
    "enName": "Sparkle",
    "assetId": 1306,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "同谐",
    "element": "量子",
    "faction": "假面愚者",
    "description": "每第3次登场获得1次重掷。相邻其他角色本次威力+0.6。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "resource",
        "summary": "每第3次登场获得1次重掷",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 1,
        "every": 3,
        "resource": "rerolls"
      },
      {
        "type": "power",
        "summary": "相邻其他角色本次威力+0.6",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 0.6,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1307",
    "name": "黑天鹅",
    "enName": "Black Swan",
    "assetId": 1307,
    "rarity": "uncommon",
    "attack": "blast",
    "power": 2,
    "path": "虚无",
    "element": "风",
    "faction": "流光忆庭",
    "description": "本次每登场1名虚无角色，自身本次威力+0.35（最多5名）。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "power",
        "summary": "本次每登场1名虚无角色，自身本次威力+0.35（最多5名）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 0.35,
        "per": {
          "metric": "present",
          "filter": {
            "path": "虚无"
          },
          "cap": 5
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1308",
    "name": "黄泉",
    "enName": "Acheron",
    "assetId": 1308,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 4,
    "path": "虚无",
    "element": "雷",
    "faction": "自灭者",
    "description": "每第3次登场，本次全队无视装甲。每第3次登场，自身本次威力+2。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "ignoreArmor",
        "summary": "每第3次登场，本次全队无视装甲",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "every": 3
      },
      {
        "type": "power",
        "summary": "每第3次登场，自身本次威力+2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "every": 3,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1309",
    "name": "知更鸟",
    "enName": "Robin",
    "assetId": 1309,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "同谐",
    "element": "物理",
    "faction": "匹诺康尼",
    "description": "相邻至少2名角色时，所有登场角色本次威力+0.5。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "power",
        "summary": "相邻至少2名角色时，所有登场角色本次威力+0.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.5,
        "condition": {
          "metric": "neighbors",
          "op": "gte",
          "value": 2
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每次登场消耗3生命，最多降至1。生命≤55%时，自身本次威力+2。",
    "color": "#fb923c",
    "effects": [
      {
        "type": "selfDamage",
        "summary": "每次登场消耗3生命，最多降至1",
        "trigger": "appearance",
        "duration": "instant",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "nonlethal": true
      },
      {
        "type": "power",
        "summary": "生命≤55%时，自身本次威力+2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 2,
        "condition": {
          "metric": "hpRatio",
          "op": "lte",
          "value": 0.55
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1312",
    "name": "米沙",
    "enName": "Misha",
    "assetId": 1312,
    "rarity": "common",
    "attack": "blast",
    "power": 1,
    "path": "毁灭",
    "element": "冰",
    "faction": "匹诺康尼",
    "description": "每第3次登场，自身本次威力×2.5。",
    "color": "#93c5fd",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "每第3次登场，自身本次威力×2.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 2.5,
        "every": 3
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1313",
    "name": "星期日",
    "enName": "Sunday",
    "assetId": 1313,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "同谐",
    "element": "虚数",
    "faction": "匹诺康尼",
    "description": "所有本次登场的临时角色威力+1.2。本次威力最高的其他攻击角色威力+1。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "summary": "所有本次登场的临时角色威力+1.2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 1.2,
        "filter": {
          "temporary": true
        },
        "scaleWithStars": true
      },
      {
        "type": "power",
        "summary": "本次威力最高的其他攻击角色威力+1",
        "trigger": "appearance",
        "duration": "spin",
        "target": "strongest",
        "stacking": "additive",
        "value": 1,
        "filter": {
          "excludeSelf": true,
          "attackNot": "support"
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "消耗1位相邻临时角色，自身本次威力+3。每次登场获得1信用点。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "consume",
        "summary": "消耗1位相邻临时角色，自身本次威力+3",
        "trigger": "appearance",
        "duration": "spin",
        "target": "adjacent",
        "stacking": "additive",
        "value": 3,
        "filter": {
          "temporary": true
        },
        "scaleWithStars": true
      },
      {
        "type": "resource",
        "summary": "每次登场获得1信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 1,
        "resource": "coins"
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1315",
    "name": "波提欧",
    "enName": "Boothill",
    "assetId": 1315,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2,
    "path": "巡猎",
    "element": "物理",
    "faction": "巡海游侠",
    "description": "只剩1列敌人时，自身本次威力×1.7。自身常规攻击每击破1列敌人，本实例永久威力+0.25。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "只剩1列敌人时，自身本次威力×1.7",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.7,
        "condition": {
          "metric": "enemies",
          "op": "eq",
          "value": 1
        }
      },
      {
        "type": "growth",
        "summary": "自身常规攻击每击破1列敌人，本实例永久威力+0.25",
        "trigger": "kill",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "value": 0.25
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1317",
    "name": "乱破",
    "enName": "Rappa",
    "assetId": 1317,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2,
    "path": "智识",
    "element": "虚数",
    "faction": "巡海游侠",
    "description": "本次每有1列存活敌人，自身本次威力+0.3（最多5列）。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "power",
        "summary": "本次每有1列存活敌人，自身本次威力+0.3（最多5列）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 0.3,
        "per": {
          "metric": "enemies",
          "cap": 5
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1402",
    "name": "阿格莱雅",
    "enName": "Aglaea",
    "assetId": 1402,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "记忆",
    "element": "雷",
    "faction": "翁法罗斯",
    "description": "每第3次登场加入临时素裳；下次起可抽到，登场2次后退场。",
    "color": "#e879f9",
    "effects": [
      {
        "type": "summon",
        "summary": "每第3次登场加入临时素裳；下次起可抽到，登场2次后退场",
        "trigger": "appearance",
        "duration": "appearances",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "every": 3,
        "characterId": "1206",
        "durationAppearances": 2
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1403",
    "name": "缇宝",
    "enName": "Tribbie",
    "assetId": 1403,
    "rarity": "uncommon",
    "attack": "support",
    "power": 2,
    "path": "同谐",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "本次每登场1名群体角色，全队本次威力+0.2（最多4名）。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "summary": "本次每登场1名群体角色，全队本次威力+0.2（最多4名）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "additive",
        "value": 0.2,
        "per": {
          "metric": "present",
          "filter": {
            "attack": "aoe"
          },
          "cap": 4
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "每次登场消耗4生命，最多降至1。每次登场，本实例永久威力+0.35。",
    "color": "#fcd34d",
    "effects": [
      {
        "type": "selfDamage",
        "summary": "每次登场消耗4生命，最多降至1",
        "trigger": "appearance",
        "duration": "instant",
        "target": "self",
        "stacking": "additive",
        "value": 4,
        "nonlethal": true
      },
      {
        "type": "growth",
        "summary": "每次登场，本实例永久威力+0.35",
        "trigger": "appearance",
        "duration": "run",
        "target": "self",
        "stacking": "additive",
        "value": 0.35
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1405",
    "name": "那刻夏",
    "enName": "Anaxa",
    "assetId": 1405,
    "rarity": "uncommon",
    "attack": "aoe",
    "power": 2,
    "path": "智识",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "至少4列敌人存活时，本次全队攻击无视装甲。每第3次登场，自身本次威力+1.5。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "ignoreArmor",
        "summary": "至少4列敌人存活时，本次全队攻击无视装甲",
        "trigger": "appearance",
        "duration": "spin",
        "target": "team",
        "stacking": "unique",
        "value": 1,
        "condition": {
          "metric": "enemies",
          "op": "gte",
          "value": 4
        }
      },
      {
        "type": "power",
        "summary": "每第3次登场，自身本次威力+1.5",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 1.5,
        "every": 3,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1406",
    "name": "赛飞儿",
    "enName": "Cipher",
    "assetId": 1406,
    "rarity": "uncommon",
    "attack": "single",
    "power": 2,
    "path": "虚无",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "每次登场有35%概率获得4信用点。持有至少30信用点时，自身本次威力×1.2。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "resource",
        "summary": "每次登场有35%概率获得4信用点",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "resource",
        "value": 4,
        "chance": 0.35,
        "resource": "coins"
      },
      {
        "type": "powerMultiplier",
        "summary": "持有至少30信用点时，自身本次威力×1.2",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.2,
        "condition": {
          "metric": "coins",
          "op": "gte",
          "value": 30
        }
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1407",
    "name": "遐蝶",
    "enName": "Castorice",
    "assetId": 1407,
    "rarity": "legendary",
    "attack": "aoe",
    "power": 4,
    "path": "记忆",
    "element": "量子",
    "faction": "翁法罗斯",
    "description": "本次每登场1名临时角色，自身本次威力+0.5（最多4名）。每第4次登场加入临时丹恒；下次起可抽到，登场2次后退场。",
    "color": "#c4b5fd",
    "effects": [
      {
        "type": "power",
        "summary": "本次每登场1名临时角色，自身本次威力+0.5（最多4名）",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "additive",
        "value": 0.5,
        "per": {
          "metric": "present",
          "filter": {
            "temporary": true
          },
          "cap": 4
        },
        "scaleWithStars": true
      },
      {
        "type": "summon",
        "summary": "每第4次登场加入临时丹恒；下次起可抽到，登场2次后退场",
        "trigger": "appearance",
        "duration": "appearances",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "every": 4,
        "characterId": "1002",
        "durationAppearances": 2
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1408",
    "name": "白厄",
    "enName": "Phainon",
    "assetId": 1408,
    "rarity": "legendary",
    "attack": "blast",
    "power": 4,
    "path": "毁灭",
    "element": "物理",
    "faction": "翁法罗斯",
    "description": "没有相邻其他角色时，自身本次威力×1.8。每第4次登场，本次常规攻击后向对应列追加12伤害。",
    "color": "#e2e8f0",
    "effects": [
      {
        "type": "powerMultiplier",
        "summary": "没有相邻其他角色时，自身本次威力×1.8",
        "trigger": "appearance",
        "duration": "spin",
        "target": "self",
        "stacking": "multiplicative",
        "value": 1.8,
        "condition": {
          "metric": "neighbors",
          "op": "eq",
          "value": 0
        }
      },
      {
        "type": "damage",
        "summary": "每第4次登场，本次常规攻击后向对应列追加12伤害",
        "trigger": "appearance",
        "duration": "spin",
        "target": "column",
        "stacking": "additive",
        "value": 12,
        "every": 4,
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
  },
  {
    "id": "1409",
    "name": "风堇",
    "enName": "Hyacine",
    "assetId": 1409,
    "rarity": "rare",
    "attack": "support",
    "power": 3,
    "path": "记忆",
    "element": "风",
    "faction": "翁法罗斯",
    "description": "每次登场恢复3生命。治疗后按缺失生命÷15获得护盾（最高5，可为小数）。",
    "color": "#6ee7b7",
    "effects": [
      {
        "type": "heal",
        "summary": "每次登场恢复3生命",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 3,
        "scaleWithStars": true
      },
      {
        "type": "shield",
        "summary": "治疗后按缺失生命÷15获得护盾（最高5，可为小数）",
        "trigger": "appearance",
        "duration": "resource",
        "target": "self",
        "stacking": "additive",
        "value": 1,
        "per": {
          "metric": "missingHp",
          "divisor": 15,
          "cap": 5
        },
        "scaleWithStars": true
      }
    ],
    "adaptation": "本作改编能力"
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
    "description": "本次每有1位临时角色退场，获得4信用点并恢复2基础生命。",
    "image": "./public/assets/curios/1019.png",
    "assetId": 1019,
    "effects": [
      {
        "type": "resource",
        "summary": "本次每退场1位临时角色，获得4信用点",
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
        "summary": "本次每退场1位临时角色，恢复2基础生命",
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
    "description": "本次常规攻击后，按本次临时角色退场数量对所有存活敌人各追加1伤害（最多4名）。",
    "effects": [
      {
        "type": "damage",
        "summary": "本次常规攻击后，按本次临时角色退场数量对所有存活敌人各追加1伤害（最多4名）",
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
    "description": "取得后累计临时角色退场达到4：之后本局临时角色每次威力+1.2。",
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
    "description": "取得后累计临时角色退场达到3：达标时立即获得1次移除机会。之后本局护盾获取量×1.1。",
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
    "description": "取得后累计临时角色退场达到5：之后本局毁灭角色每次威力+1。",
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
    "description": "取得后累计实际获得护盾达到35：达标时立即获得12基础护盾。之后本局存护角色每次威力+0.7。",
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
        "type": "power",
        "summary": "之后本局存护角色每次威力+0.7",
        "trigger": "passive",
        "duration": "run",
        "target": "team",
        "stacking": "additive",
        "value": 0.7,
        "filter": {
          "path": "存护"
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
