# 冻结实现：src/balance-reference.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/balance-reference.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：28127
- SHA-256：`85dc73e0089bdda139a951ccf1315fce18f2c6d3b7614e62681b370889bb580c`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/balance-reference.js#L1)

<!-- frozen-source:start -->
````````````````javascript
// Independent v0.4.0 release holdout; not a prediction for a live run or a resource-mapping claim.
export const BALANCE_REFERENCE = {
  "version": 3,
  "kind": "combat-benchmark",
  "mode": "combat",
  "difficulty": 10,
  "resourceAccess": {
    "rerolls": true,
    "removals": true,
    "credits": true,
    "defense": true
  },
  "seed": "content-release-v040-20261016-f381a7",
  "rules": {
    "version": "difficulty-v6",
    "min": 1,
    "max": 20,
    "default": 10,
    "baseHealthScale": 0.25,
    "difficulty10HealthMultiplier": 1,
    "difficultyStepMultiplier": 1.235,
    "lowerDifficultyPivot": 6,
    "lowerDifficultyStepMultiplier": 1.22,
    "combatLateHealthMultiplier": 1.5,
    "debuffStartFloor": 4,
    "ambientDebuffs": 1
  },
  "policyVersion": "resource-actions-v6",
  "actionPolicies": {
    "ai": {
      "selection": "shared-resource-planner",
      "rewardActions": [
        "choose",
        "skip"
      ],
      "resourceActions": [
        "reroll",
        "remove",
        "supply"
      ],
      "removals": "marginal-value-and-future-options"
    },
    "uniform": {
      "selection": "uniform-choose-only",
      "rewardActions": [
        "choose"
      ],
      "resourceActions": [],
      "removals": "none"
    }
  },
  "profileName": "context-v3-resources",
  "profile": {
    "version": "context-v3-resources",
    "weights": {
      "damage": 1,
      "defense": 0.36,
      "growth": 0.7,
      "synergy": 0.9,
      "merge": 0.85,
      "economy": 0.32,
      "tempo": 1.1,
      "lookahead": 0.55,
      "dilution": 1.1,
      "flexibility": 0.7
    },
    "temperature": 5,
    "lookaheadSamples": 4
  },
  "lookahead": true,
  "runs": 1000,
  "modes": [
    {
      "mode": "combat",
      "difficulty": 10,
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": true,
        "defense": true
      },
      "ai": {
        "runs": 1000,
        "wins": 977,
        "winRate": 0.977,
        "winRateCI": [
          0.9657235493377733,
          0.9846257230670071
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.977,
        "avgHp": 53.976210000000016,
        "avgTurns": 26.971,
        "avgDamage": 6628.162230000001,
        "avgCoins": 393.471,
        "avgMerges": 1.212,
        "avgRemovals": 5.004,
        "avgRosterSize": 19.68,
        "avgItems": 4.691,
        "avgEssences": 2.886,
        "avgActivatedEssences": 2.787,
        "avgScore": 13739.29217901728,
        "avgSkips": 4.453,
        "skipsByPhase": {
          "recruit": 4030,
          "item": 309,
          "essence": 114
        },
        "failureByFloor": [
          {
            "floor": 1,
            "count": 0
          },
          {
            "floor": 2,
            "count": 0
          },
          {
            "floor": 3,
            "count": 0
          },
          {
            "floor": 4,
            "count": 0
          },
          {
            "floor": 5,
            "count": 0
          },
          {
            "floor": 6,
            "count": 0
          },
          {
            "floor": 7,
            "count": 0
          },
          {
            "floor": 8,
            "count": 0
          },
          {
            "floor": 9,
            "count": 0
          },
          {
            "floor": 10,
            "count": 0
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 23
          }
        ],
        "picks": {
          "recruit": {
            "1001": 300,
            "1002": 648,
            "1003": 695,
            "1004": 610,
            "1005": 1026,
            "1006": 624,
            "1008": 311,
            "1009": 71,
            "1013": 655,
            "1101": 383,
            "1102": 272,
            "1103": 477,
            "1104": 260,
            "1105": 28,
            "1106": 543,
            "1107": 704,
            "1108": 233,
            "1109": 246,
            "1110": 25,
            "1111": 223,
            "1112": 386,
            "1201": 634,
            "1202": 125,
            "1203": 18,
            "1204": 206,
            "1205": 176,
            "1206": 81,
            "1207": 20,
            "1208": 432,
            "1209": 400,
            "1210": 973,
            "1211": 22,
            "1212": 269,
            "1214": 199,
            "1215": 28,
            "1217": 14,
            "1218": 381,
            "1220": 94,
            "1221": 323,
            "1222": 28,
            "1223": 98,
            "1301": 40,
            "1302": 780,
            "1303": 445,
            "1304": 406,
            "1305": 365,
            "1306": 112,
            "1307": 459,
            "1308": 214,
            "1309": 581,
            "1310": 367,
            "1312": 172,
            "1313": 25,
            "1314": 737,
            "1315": 250,
            "1317": 908,
            "1402": 13,
            "1403": 979,
            "1404": 504,
            "1405": 650,
            "1406": 376,
            "1407": 177,
            "1408": 130,
            "1409": 10,
            "skip": 4030
          },
          "item": {
            "fortune_glue": 27,
            "uncertainty_box": 20,
            "skip": 309,
            "whisker_powder": 141,
            "destruction_wax": 210,
            "void_wick": 196,
            "divination_candle": 168,
            "compound_eye": 298,
            "cosmic_lotto": 286,
            "genius_gossip": 153,
            "club_coupon": 38,
            "triangle_instrument": 64,
            "harmony_wax": 154,
            "insect_web": 30,
            "gold_coin": 375,
            "seal_stamp": 479,
            "erudition_wax": 223,
            "fools_mask": 95,
            "faith_bond": 36,
            "beauty_robe": 204,
            "chaos_medicine": 18,
            "hunt_wax": 248,
            "whispering_scroll": 24,
            "organic_heart": 26,
            "doctor_robe": 22,
            "black_hole_trap": 41,
            "spacetime_prism": 18,
            "invalid_printer": 18,
            "corrupt_fruit": 29,
            "interstellar_lotto": 24,
            "nihility_wax": 118,
            "fictional_machine": 12,
            "rubert_gear": 104,
            "omniscient_bag": 41,
            "cavity_model": 19,
            "beacon_colorant": 39,
            "pink_collision": 24,
            "blood_badge": 53,
            "wish_star": 16,
            "meteorite": 29,
            "angel_debt": 16,
            "broken_clock": 72,
            "sponge_king": 28,
            "chaos_trametes": 23,
            "tala_flame": 47,
            "preservation_wax": 27,
            "split_silver": 39,
            "dimension_dice": 27,
            "impermanence_dice": 28,
            "stair_jellyfish": 26,
            "ruan_pouch": 20,
            "propagation_wax": 16,
            "remembrance_wax": 21,
            "abundance_wax": 11,
            "annihilation_wick": 17,
            "family_ties": 12,
            "realm_crown": 9,
            "mystery_box": 9,
            "split_coin": 26,
            "punklorde_spirit": 23,
            "evil_satellite": 11,
            "dimensional_dice": 12,
            "elation_wax": 17,
            "polyhedral_dice": 27,
            "peace_price": 7
          },
          "essence": {
            "essence_beauty_robe": 256,
            "essence_compound_eye": 230,
            "essence_annihilation": 15,
            "essence_hunt": 209,
            "essence_harmony": 287,
            "essence_split_coin": 88,
            "essence_dimensional_dice": 21,
            "essence_genius": 100,
            "essence_destruction": 334,
            "essence_void_wick": 150,
            "essence_whisker": 153,
            "essence_elation": 360,
            "essence_colorant": 41,
            "essence_scroll": 56,
            "essence_punklorde": 70,
            "essence_erudition": 175,
            "essence_jellyfish": 8,
            "essence_realm_crown": 17,
            "essence_medicine": 8,
            "essence_preservation": 15,
            "essence_nihility": 129,
            "essence_tala": 23,
            "skip": 114,
            "essence_heart": 14,
            "essence_prism": 11,
            "essence_propagation": 17,
            "essence_cavity": 31,
            "essence_family": 7,
            "essence_elation_wax": 12,
            "essence_remembrance": 16,
            "essence_satellite": 10,
            "essence_abundance": 17,
            "essence_trap": 6
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 16.307,
          "paidRerolls": 2.348,
          "removalsUsed": 5.004,
          "supplyPurchases": 13.096,
          "creditsSpent": 225.91,
          "healed": 50.508320000000005,
          "shieldGained": 219.34594000000058,
          "shieldBlocked": 107.52930000000028,
          "shieldDecayed": 19.65819,
          "hpLost": 96.53210999999996,
          "freeRerolls": 13.959,
          "paidRerollCredits": 18.784,
          "supplyCredits": 207.126,
          "supplyKinds": {
            "repair": 0.433,
            "barrier": 0.113,
            "overclock": 12.55
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 1,
          "defense": 0.599
        },
        "defenseUsage": {
          "hpGenerated": 150508.32,
          "shieldGenerated": 219345.94000000058,
          "hpConsumed": 96532.10999999996,
          "shieldConsumed": 107529.30000000028,
          "shieldWasted": 19658.190000000002,
          "hpConsumptionRate": 0.6413739120867202,
          "shieldConsumptionRate": 0.49022699029669753,
          "combinedRate": 0.5517346481286978,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.599,
          "observational": true,
          "strata": {
            "low": {
              "n": 0,
              "wins": 0,
              "winRate": 0,
              "winRateCI": [
                0,
                1
              ],
              "hpGenerated": 0,
              "shieldGenerated": 0,
              "hpConsumed": 0,
              "shieldConsumed": 0,
              "shieldWasted": 0,
              "hpConsumptionRate": 0,
              "shieldConsumptionRate": 0,
              "combinedRate": 0,
              "classification": "low",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 0
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 0
              },
              "jointActiveFour": {
                "n": 0,
                "wins": 0,
                "winRate": 0,
                "winRateCI": [
                  0,
                  1
                ]
              },
              "observational": true
            },
            "moderate": {
              "n": 401,
              "wins": 401,
              "winRate": 1,
              "winRateCI": [
                0.9905112020100799,
                1
              ],
              "hpGenerated": 57479.51,
              "shieldGenerated": 114950.37000000002,
              "hpConsumed": 24843.52999999999,
              "shieldConsumed": 42745.29000000002,
              "shieldWasted": 13402.489999999994,
              "hpConsumptionRate": 0.4322154103262187,
              "shieldConsumptionRate": 0.37185865517440275,
              "combinedRate": 0.39197858283030756,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 401,
                "removals": 401,
                "credits": 401,
                "defense": 401
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 401,
                "wins": 401,
                "winRate": 1,
                "winRateCI": [
                  0.9905112020100799,
                  1
                ]
              },
              "observational": true
            },
            "effective": {
              "n": 599,
              "wins": 576,
              "winRate": 0.9616026711185309,
              "winRateCI": [
                0.9430428130585354,
                0.9742796303610061
              ],
              "hpGenerated": 93028.81000000003,
              "shieldGenerated": 104395.56999999999,
              "hpConsumed": 71688.57999999996,
              "shieldConsumed": 64784.009999999966,
              "shieldWasted": 6255.7,
              "hpConsumptionRate": 0.7706062240288781,
              "shieldConsumptionRate": 0.6205628265643837,
              "combinedRate": 0.6912651314898388,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 599,
                "removals": 599,
                "credits": 599,
                "defense": 599
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 599,
                "wins": 576,
                "winRate": 0.9616026711185309,
                "winRateCI": [
                  0.9430428130585354,
                  0.9742796303610061
                ]
              },
              "observational": true
            }
          }
        },
        "incomplete": 0
      },
      "uniform": {
        "runs": 1000,
        "wins": 47,
        "winRate": 0.047,
        "winRateCI": [
          0.0355271051063845,
          0.06193993808152845
        ],
        "avgFloor": 11.563,
        "avgClearedFloors": 10.61,
        "avgHp": 97.16470000000002,
        "avgTurns": 39.52,
        "avgDamage": 5483.606170000005,
        "avgCoins": 406.349,
        "avgMerges": 2.817,
        "avgRemovals": 0,
        "avgRosterSize": 38.713,
        "avgItems": 4.851,
        "avgEssences": 2.999,
        "avgActivatedEssences": 2.49,
        "avgScore": 11255.087906766257,
        "avgSkips": 0,
        "skipsByPhase": {
          "recruit": 0,
          "item": 0,
          "essence": 0
        },
        "failureByFloor": [
          {
            "floor": 1,
            "count": 0
          },
          {
            "floor": 2,
            "count": 0
          },
          {
            "floor": 3,
            "count": 0
          },
          {
            "floor": 4,
            "count": 0
          },
          {
            "floor": 5,
            "count": 0
          },
          {
            "floor": 6,
            "count": 0
          },
          {
            "floor": 7,
            "count": 0
          },
          {
            "floor": 8,
            "count": 1
          },
          {
            "floor": 9,
            "count": 0
          },
          {
            "floor": 10,
            "count": 147
          },
          {
            "floor": 11,
            "count": 139
          },
          {
            "floor": 12,
            "count": 666
          }
        ],
        "picks": {
          "recruit": {
            "1001": 959,
            "1002": 929,
            "1003": 485,
            "1004": 470,
            "1005": 478,
            "1006": 509,
            "1008": 991,
            "1009": 941,
            "1013": 965,
            "1101": 546,
            "1102": 468,
            "1103": 944,
            "1104": 531,
            "1105": 945,
            "1106": 593,
            "1107": 493,
            "1108": 586,
            "1109": 1033,
            "1110": 963,
            "1111": 977,
            "1112": 445,
            "1201": 1009,
            "1202": 552,
            "1203": 502,
            "1204": 94,
            "1205": 100,
            "1206": 953,
            "1207": 531,
            "1208": 484,
            "1209": 499,
            "1210": 947,
            "1211": 524,
            "1212": 532,
            "1214": 599,
            "1215": 1032,
            "1217": 474,
            "1218": 594,
            "1220": 113,
            "1221": 476,
            "1222": 484,
            "1223": 962,
            "1301": 980,
            "1302": 549,
            "1303": 501,
            "1304": 492,
            "1305": 479,
            "1306": 497,
            "1307": 549,
            "1308": 102,
            "1309": 450,
            "1310": 551,
            "1312": 1010,
            "1313": 505,
            "1314": 471,
            "1315": 553,
            "1317": 617,
            "1402": 598,
            "1403": 633,
            "1404": 513,
            "1405": 560,
            "1406": 546,
            "1407": 81,
            "1408": 86,
            "1409": 485
          },
          "item": {
            "tala_flame": 69,
            "faith_bond": 126,
            "triangle_instrument": 62,
            "broken_clock": 11,
            "destruction_wax": 62,
            "pink_collision": 127,
            "omniscient_bag": 134,
            "organic_heart": 45,
            "black_hole_trap": 114,
            "meteorite": 84,
            "impermanence_dice": 66,
            "whispering_scroll": 52,
            "harmony_wax": 65,
            "punklorde_spirit": 84,
            "abundance_wax": 66,
            "rubert_gear": 47,
            "fools_mask": 52,
            "chaos_trametes": 77,
            "club_coupon": 131,
            "whisker_powder": 69,
            "evil_satellite": 61,
            "realm_crown": 59,
            "annihilation_wick": 69,
            "split_silver": 111,
            "preservation_wax": 80,
            "erudition_wax": 82,
            "dimensional_dice": 66,
            "hunt_wax": 74,
            "nihility_wax": 81,
            "fortune_glue": 88,
            "fictional_machine": 80,
            "beauty_robe": 65,
            "insect_web": 132,
            "divination_candle": 63,
            "angel_debt": 42,
            "remembrance_wax": 83,
            "dimension_dice": 54,
            "seal_stamp": 137,
            "invalid_printer": 71,
            "beacon_colorant": 59,
            "polyhedral_dice": 66,
            "genius_gossip": 74,
            "doctor_robe": 45,
            "void_wick": 72,
            "elation_wax": 85,
            "split_coin": 115,
            "spacetime_prism": 63,
            "wish_star": 73,
            "cavity_model": 64,
            "compound_eye": 70,
            "gold_coin": 115,
            "sponge_king": 81,
            "propagation_wax": 54,
            "family_ties": 84,
            "uncertainty_box": 70,
            "mystery_box": 73,
            "ruan_pouch": 71,
            "stair_jellyfish": 96,
            "blood_badge": 58,
            "corrupt_fruit": 55,
            "interstellar_lotto": 54,
            "cosmic_lotto": 59,
            "peace_price": 77,
            "chaos_medicine": 77
          },
          "essence": {
            "essence_destruction": 90,
            "essence_elation": 100,
            "essence_scroll": 88,
            "essence_cavity": 82,
            "essence_beauty_robe": 106,
            "essence_jellyfish": 104,
            "essence_dimensional_dice": 92,
            "essence_realm_crown": 98,
            "essence_void_wick": 81,
            "essence_elation_wax": 93,
            "essence_satellite": 91,
            "essence_medicine": 81,
            "essence_whisker": 98,
            "essence_erudition": 89,
            "essence_compound_eye": 94,
            "essence_heart": 94,
            "essence_preservation": 105,
            "essence_family": 87,
            "essence_harmony": 90,
            "essence_colorant": 111,
            "essence_prism": 110,
            "essence_hunt": 97,
            "essence_punklorde": 88,
            "essence_nihility": 107,
            "essence_split_coin": 92,
            "essence_genius": 96,
            "essence_propagation": 87,
            "essence_abundance": 83,
            "essence_remembrance": 88,
            "essence_trap": 82,
            "essence_tala": 108,
            "essence_annihilation": 87
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 0,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 154.65161000000006,
          "shieldGained": 423.2502500000004,
          "shieldBlocked": 225.35968000000003,
          "shieldDecayed": 41.109600000000015,
          "hpLost": 157.4869099999999,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 0,
          "credits": 0,
          "defense": 0.748
        },
        "defenseUsage": {
          "hpGenerated": 254651.61000000007,
          "shieldGenerated": 423250.2500000004,
          "hpConsumed": 157486.90999999992,
          "shieldConsumed": 225359.68000000002,
          "shieldWasted": 41109.60000000001,
          "hpConsumptionRate": 0.6184406609485008,
          "shieldConsumptionRate": 0.532450199379681,
          "combinedRate": 0.564752234195079,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.748,
          "observational": true,
          "strata": {
            "low": {
              "n": 0,
              "wins": 0,
              "winRate": 0,
              "winRateCI": [
                0,
                1
              ],
              "hpGenerated": 0,
              "shieldGenerated": 0,
              "hpConsumed": 0,
              "shieldConsumed": 0,
              "shieldWasted": 0,
              "hpConsumptionRate": 0,
              "shieldConsumptionRate": 0,
              "combinedRate": 0,
              "classification": "low",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 0
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 0
              },
              "jointActiveFour": {
                "n": 0,
                "wins": 0,
                "winRate": 0,
                "winRateCI": [
                  0,
                  1
                ]
              },
              "observational": true
            },
            "moderate": {
              "n": 252,
              "wins": 6,
              "winRate": 0.023809523809523808,
              "winRateCI": [
                0.01095675985436672,
                0.05096228522032767
              ],
              "hpGenerated": 56724.729999999996,
              "shieldGenerated": 112663.09000000003,
              "hpConsumed": 30336.87,
              "shieldConsumed": 45912.13999999999,
              "shieldWasted": 19099.659999999996,
              "hpConsumptionRate": 0.5348085394148197,
              "shieldConsumptionRate": 0.4075171380440567,
              "combinedRate": 0.4501445853662913,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 252
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 0,
                "wins": 0,
                "winRate": 0,
                "winRateCI": [
                  0,
                  1
                ]
              },
              "observational": true
            },
            "effective": {
              "n": 748,
              "wins": 41,
              "winRate": 0.05481283422459893,
              "winRateCI": [
                0.04065933418259969,
                0.07351561296030103
              ],
              "hpGenerated": 197926.87999999995,
              "shieldGenerated": 310587.1599999999,
              "hpConsumed": 127150.03999999992,
              "shieldConsumed": 179447.5400000002,
              "shieldWasted": 22009.940000000002,
              "hpConsumptionRate": 0.6424091563510724,
              "shieldConsumptionRate": 0.5777687010628523,
              "combinedRate": 0.6029284461841018,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 748
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 0,
                "wins": 0,
                "winRate": 0,
                "winRateCI": [
                  0,
                  1
                ]
              },
              "observational": true
            }
          }
        },
        "incomplete": 0
      },
      "difference": {
        "winRate": 0.93,
        "avgFloor": 0.437,
        "pairedSeeds": 1000,
        "outcomes": {
          "aiOnlyWins": 930,
          "uniformOnlyWins": 0,
          "bothWin": 47,
          "bothLoss": 23
        }
      }
    }
  ],
  "samplePurpose": "release",
  "sourceHashes": {
    "src/content.js": "031223016283c523735f68ed7258dfeb8d11b740983371e0ff5800cc179b0a47",
    "src/effect-rules.js": "b837b0786bccf88062f35489ab61566be64ad8f9de77f461fedffd233866b902",
    "src/synergies.js": "065b087daa81d927714077a16768c829441e53981be73b3a1fc9f223f285bdd3",
    "src/difficulty.js": "9d0ae20a3b982a7c926a27aba5889f29f761ddb4c68472e3f64afebad175ff5d",
    "src/enemy-effects.js": "7f11e1043c613da1bae7d7022acf9d17c464400688486f532c155835bd09ea01",
    "src/engine.js": "a48bf861f3b2e587945dea7ed35c240a3708462b74eada9c1a3f120be401a2fb",
    "src/ai-profile.js": "2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206",
    "src/ai.js": "490af465629a74ba8e3a87e129b04f32e0be42cf02f6ebb30575bab4af208232",
    "src/simulation.js": "fb59f4744192e62d6ed2bf363f89e6576b9ac7481f8c3550f7a92ec0cac47e95"
  },
  "sourceStable": true,
  "parallel": {
    "workers": 8,
    "workersUsed": 8,
    "chunkSize": 50,
    "chunks": 40,
    "resultOrder": "original-seed-index"
  },
  "elapsedMs": 224099.5281,
  "calibrationTarget": {
    "min": 0.9,
    "max": 0.98,
    "preferred": 0.95,
    "passed": true
  }
};
````````````````
<!-- frozen-source:end -->
