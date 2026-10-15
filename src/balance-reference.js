// Saved independent benchmark; not a prediction for the live run.
export const BALANCE_REFERENCE = {
  "version": 3,
  "kind": "resource-calibration",
  "seed": "resources-release-v6-20261015-c9d438",
  "rules": {
    "version": "difficulty-v5",
    "min": 1,
    "max": 20,
    "default": 10,
    "baseHealthScale": 1.12,
    "difficulty10HealthMultiplier": 1,
    "difficultyStepMultiplier": 1.235,
    "lowerDifficultyPivot": 6,
    "lowerDifficultyStepMultiplier": 1.22,
    "combatLateHealthMultiplier": 1.5,
    "debuffStartFloor": 4,
    "ambientDebuffs": 1
  },
  "policyVersion": "resource-actions-v5",
  "samplePurpose": "release",
  "sourceHashes": {
    "src/content.js": "eebf7286fc0cbc6bf404f5044846e9c0a13d9bf9eb79d7f828a47a8dcb516994",
    "src/difficulty.js": "5979c2c38ac9f45bdade456bdaf9ee60631a4cd5efd049008c95be03c89c0832",
    "src/enemy-effects.js": "85e6399b62a91fbb27c68934eb71a71ae734f76ed517927c13fe1481a1884099",
    "src/engine.js": "333d845edf9475566fc8d7ca7fa905a8470d15f210139ec66371cc0d405f94f7",
    "src/ai-profile.js": "24cedd0a45d9768dd709801185caa6274893278f3b0fc9ffe4a711c514e24824",
    "src/ai.js": "f78a21ec8e510a1f2d471c830ff7ad4945b241b67cf42c57bc4f1fe5a25279b0",
    "src/simulation.js": "7866fef8474dcddfe4ba74f1c6a136fc4f8fa23d90e7eb4f96dcac8cbcded57b"
  },
  "sourceStable": true,
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
  "scope": "all",
  "resourceGroups": [
    {
      "id": "rerolls",
      "label": "重掷"
    },
    {
      "id": "removals",
      "label": "移除"
    },
    {
      "id": "credits",
      "label": "信用点消费"
    },
    {
      "id": "defense",
      "label": "防御规划（自然效果保留）"
    }
  ],
  "variants": [
    {
      "id": "full-10",
      "difficulty": 10,
      "disabledResources": [],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": true,
        "defense": true
      },
      "label": "完整资源 AI",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 969,
        "winRate": 0.969,
        "winRateCI": [
          0.9563345039877078,
          0.9780759965528414
        ],
        "avgFloor": 11.998,
        "avgClearedFloors": 11.967,
        "avgHp": 84.93610999999996,
        "avgTurns": 40.826,
        "avgDamage": 29714.57635,
        "avgCoins": 331.832,
        "avgMerges": 4.983,
        "avgRemovals": 6.847,
        "avgRosterSize": 20.415,
        "avgItems": 4.969,
        "avgEssences": 2.991,
        "avgActivatedEssences": 2.99,
        "avgScore": 13712.911854402715,
        "avgSkips": 8.462,
        "skipsByPhase": {
          "recruit": 8422,
          "item": 31,
          "essence": 9
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
            "count": 2
          },
          {
            "floor": 12,
            "count": 29
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1040,
            "1002": 1279,
            "1003": 1428,
            "1004": 1588,
            "1005": 4199,
            "1006": 2264,
            "1008": 898,
            "1009": 341,
            "1013": 1121,
            "1101": 1545,
            "1102": 1530,
            "1103": 1433,
            "1104": 1411,
            "1105": 190,
            "1106": 2535,
            "1107": 2089,
            "1108": 1754,
            "1109": 949,
            "1201": 1075,
            "1202": 269,
            "1203": 100,
            "1204": 528,
            "1205": 715,
            "1208": 1123,
            "skip": 8422
          },
          "item": {
            "harmony_wax": 141,
            "seal_stamp": 907,
            "hunt_wax": 567,
            "divination_candle": 711,
            "gold_coin": 412,
            "cosmic_lotto": 579,
            "destruction_wax": 664,
            "nihility_wax": 276,
            "chaos_trametes": 12,
            "doctor_robe": 159,
            "insect_web": 28,
            "broken_clock": 209,
            "rubert_gear": 143,
            "erudition_wax": 87,
            "skip": 31,
            "fortune_glue": 13,
            "angel_debt": 18,
            "preservation_wax": 6,
            "faith_bond": 23,
            "dimension_dice": 9,
            "abundance_wax": 5
          },
          "essence": {
            "essence_destruction": 716,
            "essence_elation": 987,
            "essence_hunt": 546,
            "essence_harmony": 519,
            "essence_nihility": 196,
            "essence_erudition": 23,
            "skip": 9,
            "essence_preservation": 2,
            "essence_abundance": 2
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 18.563,
          "paidRerolls": 3.661,
          "removalsUsed": 6.847,
          "supplyPurchases": 14.803,
          "creditsSpent": 266.13,
          "healed": 60.72162999999994,
          "shieldGained": 452.3705000000002,
          "shieldBlocked": 241.57920000000001,
          "shieldDecayed": 52.364689999999975,
          "hpLost": 75.78551999999998,
          "freeRerolls": 14.902,
          "paidRerollCredits": 29.288,
          "supplyCredits": 236.842,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0.001,
            "overclock": 14.802
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 1,
          "defense": 0.532
        },
        "defenseUsage": {
          "hpGenerated": 160721.62999999995,
          "shieldGenerated": 452370.50000000023,
          "hpConsumed": 75785.51999999997,
          "shieldConsumed": 241579.2,
          "shieldWasted": 52364.68999999997,
          "hpConsumptionRate": 0.4715327986656183,
          "shieldConsumptionRate": 0.5340295178399119,
          "combinedRate": 0.5176460510103105,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.532,
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
              "n": 468,
              "wins": 463,
              "winRate": 0.9893162393162394,
              "winRateCI": [
                0.9752368794985775,
                0.9954281424872202
              ],
              "hpGenerated": 72511.44,
              "shieldGenerated": 228680.1399999998,
              "hpConsumed": 27635.88,
              "shieldConsumed": 104534.60999999996,
              "shieldWasted": 39056.75000000001,
              "hpConsumptionRate": 0.38112441292022337,
              "shieldConsumptionRate": 0.4571215060477051,
              "combinedRate": 0.43882531510343026,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 468,
                "removals": 468,
                "credits": 468,
                "defense": 468
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 468,
                "wins": 463,
                "winRate": 0.9893162393162394,
                "winRateCI": [
                  0.9752368794985775,
                  0.9954281424872202
                ]
              },
              "observational": true
            },
            "effective": {
              "n": 532,
              "wins": 506,
              "winRate": 0.9511278195488722,
              "winRateCI": [
                0.9293544659083055,
                0.9664328833132483
              ],
              "hpGenerated": 88210.18999999999,
              "shieldGenerated": 223690.36,
              "hpConsumed": 48149.63999999998,
              "shieldConsumed": 137044.58999999994,
              "shieldWasted": 13307.939999999999,
              "hpConsumptionRate": 0.545851221950661,
              "shieldConsumptionRate": 0.6126530888501407,
              "combinedRate": 0.5937605111629329,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 532,
                "removals": 532,
                "credits": 532,
                "defense": 532
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 532,
                "wins": 506,
                "winRate": 0.9511278195488722,
                "winRateCI": [
                  0.9293544659083055,
                  0.9664328833132483
                ]
              },
              "observational": true
            }
          }
        },
        "incomplete": 0
      },
      "actualDefensiveUse": {
        "combinedRate": 0.5176460510103105,
        "hpConsumptionRate": 0.4715327986656183,
        "shieldConsumptionRate": 0.5340295178399119,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [],
      "actualMissingResourceCount": 0,
      "nominalMappingEligible": true,
      "nominalDifficulty": 10,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "nominal-1",
      "difficulty": 8,
      "disabledResources": [
        "rerolls"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": true,
        "credits": true,
        "defense": true
      },
      "label": "禁用重掷",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 941,
        "winRate": 0.941,
        "winRateCI": [
          0.9246390972285408,
          0.9539857017871995
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.941,
        "avgHp": 90.16094,
        "avgTurns": 41.232,
        "avgDamage": 24056.754039999996,
        "avgCoins": 341.073,
        "avgMerges": 4.933,
        "avgRemovals": 6.998,
        "avgRosterSize": 20.426,
        "avgItems": 4.842,
        "avgEssences": 2.963,
        "avgActivatedEssences": 2.962,
        "avgScore": 13659.05841090712,
        "avgSkips": 8.802,
        "skipsByPhase": {
          "recruit": 8607,
          "item": 158,
          "essence": 37
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
            "count": 59
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1204,
            "1002": 1359,
            "1003": 1358,
            "1004": 1462,
            "1005": 3008,
            "1006": 2017,
            "1008": 1168,
            "1009": 750,
            "1013": 1586,
            "1101": 1600,
            "1102": 1527,
            "1103": 1944,
            "1104": 1459,
            "1105": 282,
            "1106": 2231,
            "1107": 1740,
            "1108": 1618,
            "1109": 1040,
            "1201": 1360,
            "1202": 554,
            "1203": 128,
            "1204": 473,
            "1205": 577,
            "1208": 1180,
            "skip": 8607
          },
          "item": {
            "harmony_wax": 270,
            "erudition_wax": 218,
            "destruction_wax": 453,
            "divination_candle": 480,
            "nihility_wax": 273,
            "hunt_wax": 478,
            "seal_stamp": 726,
            "rubert_gear": 169,
            "gold_coin": 534,
            "fortune_glue": 61,
            "dimension_dice": 34,
            "cosmic_lotto": 452,
            "broken_clock": 130,
            "doctor_robe": 168,
            "chaos_trametes": 34,
            "angel_debt": 55,
            "abundance_wax": 38,
            "skip": 158,
            "insect_web": 113,
            "preservation_wax": 32,
            "faith_bond": 124
          },
          "essence": {
            "essence_hunt": 537,
            "essence_erudition": 144,
            "essence_nihility": 284,
            "essence_harmony": 522,
            "essence_destruction": 670,
            "essence_elation": 778,
            "essence_preservation": 15,
            "essence_abundance": 13,
            "skip": 37
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 6.998,
          "supplyPurchases": 15.994,
          "creditsSpent": 255.882,
          "healed": 57.46888,
          "shieldGained": 465.00174000000027,
          "shieldBlocked": 247.6301599999998,
          "shieldDecayed": 54.31700000000005,
          "hpLost": 67.30794000000002,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 255.882,
          "supplyKinds": {
            "repair": 0.001,
            "barrier": 0.003,
            "overclock": 15.99
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 1,
          "credits": 1,
          "defense": 0.518
        },
        "defenseUsage": {
          "hpGenerated": 157468.88,
          "shieldGenerated": 465001.7400000003,
          "hpConsumed": 67307.94000000002,
          "shieldConsumed": 247630.1599999998,
          "shieldWasted": 54317.00000000005,
          "hpConsumptionRate": 0.4274364560159443,
          "shieldConsumptionRate": 0.5325359857793213,
          "combinedRate": 0.5059485377799833,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.518,
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
              "n": 482,
              "wins": 463,
              "winRate": 0.9605809128630706,
              "winRateCI": [
                0.9392571168105256,
                0.9746212522313881
              ],
              "hpGenerated": 72224.31,
              "shieldGenerated": 239950.83000000007,
              "hpConsumed": 25153.26999999999,
              "shieldConsumed": 109183.87000000002,
              "shieldWasted": 42921.54000000003,
              "hpConsumptionRate": 0.34826597858809577,
              "shieldConsumptionRate": 0.45502601512151464,
              "combinedRate": 0.43032619445609915,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 482,
                "credits": 482,
                "defense": 482
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
              "n": 518,
              "wins": 478,
              "winRate": 0.9227799227799228,
              "winRateCI": [
                0.8965541693282686,
                0.9427812123216164
              ],
              "hpGenerated": 85244.57,
              "shieldGenerated": 225050.91000000006,
              "hpConsumed": 42154.67,
              "shieldConsumed": 138446.29,
              "shieldWasted": 11395.460000000005,
              "hpConsumptionRate": 0.4945144306552311,
              "shieldConsumptionRate": 0.6151776502481149,
              "combinedRate": 0.5820289744471946,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 518,
                "credits": 518,
                "defense": 518
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5059485377799833,
        "hpConsumptionRate": 0.4274364560159443,
        "shieldConsumptionRate": 0.5325359857793213,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0.028000000000000025,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "ablation-1-10",
      "difficulty": 10,
      "disabledResources": [
        "rerolls"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": true,
        "credits": true,
        "defense": true
      },
      "label": "难度 10 禁用重掷",
      "role": "ablation",
      "summary": {
        "runs": 1000,
        "wins": 712,
        "winRate": 0.712,
        "winRateCI": [
          0.6831644885571975,
          0.7392129658449271
        ],
        "avgFloor": 11.991,
        "avgClearedFloors": 11.703,
        "avgHp": 88.2007,
        "avgTurns": 45.467,
        "avgDamage": 29479.09714999998,
        "avgCoins": 335.666,
        "avgMerges": 5.64,
        "avgRemovals": 7.47,
        "avgRosterSize": 20.635,
        "avgItems": 4.872,
        "avgEssences": 2.965,
        "avgActivatedEssences": 2.965,
        "avgScore": 13141.958346747193,
        "avgSkips": 10.977,
        "skipsByPhase": {
          "recruit": 10819,
          "item": 125,
          "essence": 33
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
            "count": 1
          },
          {
            "floor": 10,
            "count": 0
          },
          {
            "floor": 11,
            "count": 2
          },
          {
            "floor": 12,
            "count": 284
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1293,
            "1002": 1428,
            "1003": 1415,
            "1004": 1634,
            "1005": 3406,
            "1006": 2127,
            "1008": 1265,
            "1009": 798,
            "1013": 1696,
            "1101": 1640,
            "1102": 1613,
            "1103": 2042,
            "1104": 1477,
            "1105": 262,
            "1106": 2502,
            "1107": 1839,
            "1108": 1780,
            "1109": 1099,
            "1201": 1390,
            "1202": 545,
            "1203": 123,
            "1204": 508,
            "1205": 586,
            "1208": 1180,
            "skip": 10819
          },
          "item": {
            "nihility_wax": 252,
            "broken_clock": 131,
            "hunt_wax": 442,
            "harmony_wax": 240,
            "gold_coin": 527,
            "rubert_gear": 181,
            "erudition_wax": 258,
            "divination_candle": 481,
            "seal_stamp": 724,
            "cosmic_lotto": 443,
            "doctor_robe": 202,
            "skip": 125,
            "preservation_wax": 44,
            "faith_bond": 169,
            "destruction_wax": 464,
            "dimension_dice": 37,
            "chaos_trametes": 42,
            "abundance_wax": 26,
            "insect_web": 112,
            "angel_debt": 55,
            "fortune_glue": 42
          },
          "essence": {
            "essence_elation": 770,
            "essence_hunt": 532,
            "essence_harmony": 528,
            "essence_destruction": 635,
            "essence_nihility": 332,
            "essence_preservation": 14,
            "skip": 33,
            "essence_erudition": 139,
            "essence_abundance": 15
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 7.47,
          "supplyPurchases": 16.136,
          "creditsSpent": 258.164,
          "healed": 61.233670000000004,
          "shieldGained": 511.74279000000007,
          "shieldBlocked": 291.71583000000004,
          "shieldDecayed": 59.27683000000002,
          "hpLost": 73.03296999999999,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 258.164,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0.002,
            "overclock": 16.134
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 1,
          "credits": 1,
          "defense": 0.682
        },
        "defenseUsage": {
          "hpGenerated": 161233.67,
          "shieldGenerated": 511742.7900000001,
          "hpConsumed": 73032.96999999999,
          "shieldConsumed": 291715.83,
          "shieldWasted": 59276.830000000016,
          "hpConsumptionRate": 0.4529635156230084,
          "shieldConsumptionRate": 0.570043849567475,
          "combinedRate": 0.5419934004823883,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.682,
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
              "n": 318,
              "wins": 244,
              "winRate": 0.7672955974842768,
              "winRateCI": [
                0.7178303015557116,
                0.8103800807328899
              ],
              "hpGenerated": 48797.74,
              "shieldGenerated": 177497.14000000007,
              "hpConsumed": 17907.699999999997,
              "shieldConsumed": 80547.61000000003,
              "shieldWasted": 40014.34000000003,
              "hpConsumptionRate": 0.36697806086921236,
              "shieldConsumptionRate": 0.4537966639913184,
              "combinedRate": 0.43507528760703734,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 318,
                "credits": 318,
                "defense": 318
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
              "n": 682,
              "wins": 468,
              "winRate": 0.6862170087976539,
              "winRateCI": [
                0.6504301803671406,
                0.7199178012739131
              ],
              "hpGenerated": 112435.93000000002,
              "shieldGenerated": 334245.64999999973,
              "hpConsumed": 55125.27,
              "shieldConsumed": 211168.21999999977,
              "shieldWasted": 19262.49,
              "hpConsumptionRate": 0.4902816208306365,
              "shieldConsumptionRate": 0.6317755219851027,
              "combinedRate": 0.5961595506132129,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 682,
                "credits": 682,
                "defense": 682
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5419934004823883,
        "hpConsumptionRate": 0.4529635156230084,
        "shieldConsumptionRate": 0.570043849567475,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": true,
      "verifiable": true,
      "winRateDrop": 0.257,
      "passed": true,
      "reasons": [],
      "targetPassed": true,
      "paired": {
        "fullOnlyWins": 279,
        "ablationOnlyWins": 22,
        "seeds": 1000
      }
    },
    {
      "id": "nominal-2",
      "difficulty": 8,
      "disabledResources": [
        "removals"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": false,
        "credits": true,
        "defense": true
      },
      "label": "禁用移除",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 932,
        "winRate": 0.932,
        "winRateCI": [
          0.9146861384770105,
          0.9460075421914699
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.932,
        "avgHp": 71.84544999999996,
        "avgTurns": 37.997,
        "avgDamage": 24004.51955999999,
        "avgCoins": 330.387,
        "avgMerges": 6.226,
        "avgRemovals": 0,
        "avgRosterSize": 22.454,
        "avgItems": 4.958,
        "avgEssences": 2.993,
        "avgActivatedEssences": 2.993,
        "avgScore": 13626.6398863537,
        "avgSkips": 7.776,
        "skipsByPhase": {
          "recruit": 7727,
          "item": 42,
          "essence": 7
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
            "count": 68
          }
        ],
        "picks": {
          "recruit": {
            "1001": 454,
            "1002": 1369,
            "1003": 1361,
            "1004": 1601,
            "1005": 4029,
            "1006": 2303,
            "1008": 690,
            "1009": 251,
            "1013": 1244,
            "1101": 1274,
            "1102": 1447,
            "1103": 1197,
            "1104": 1379,
            "1105": 84,
            "1106": 2759,
            "1107": 2046,
            "1108": 1663,
            "1109": 764,
            "1201": 819,
            "1202": 221,
            "1203": 54,
            "1204": 538,
            "1205": 689,
            "1208": 1034,
            "skip": 7727
          },
          "item": {
            "divination_candle": 716,
            "cosmic_lotto": 620,
            "destruction_wax": 668,
            "gold_coin": 424,
            "hunt_wax": 529,
            "nihility_wax": 238,
            "seal_stamp": 908,
            "broken_clock": 185,
            "faith_bond": 30,
            "rubert_gear": 124,
            "doctor_robe": 200,
            "erudition_wax": 109,
            "angel_debt": 12,
            "harmony_wax": 131,
            "preservation_wax": 7,
            "skip": 42,
            "abundance_wax": 10,
            "insect_web": 26,
            "fortune_glue": 9,
            "dimension_dice": 7,
            "chaos_trametes": 5
          },
          "essence": {
            "essence_destruction": 714,
            "essence_elation": 987,
            "essence_hunt": 534,
            "essence_nihility": 192,
            "essence_harmony": 535,
            "skip": 7,
            "essence_erudition": 25,
            "essence_abundance": 2,
            "essence_preservation": 4
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 18.738,
          "paidRerolls": 3.807,
          "removalsUsed": 0,
          "supplyPurchases": 14.744,
          "creditsSpent": 266.296,
          "healed": 105.24239999999995,
          "shieldGained": 442.9760000000005,
          "shieldBlocked": 218.22055999999995,
          "shieldDecayed": 49.2059,
          "hpLost": 133.39694999999995,
          "freeRerolls": 14.931,
          "paidRerollCredits": 30.456,
          "supplyCredits": 235.84,
          "supplyKinds": {
            "repair": 0.016,
            "barrier": 0,
            "overclock": 14.728
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 0,
          "credits": 1,
          "defense": 0.732
        },
        "defenseUsage": {
          "hpGenerated": 205242.39999999997,
          "shieldGenerated": 442976.0000000005,
          "hpConsumed": 133396.94999999995,
          "shieldConsumed": 218220.55999999994,
          "shieldWasted": 49205.9,
          "hpConsumptionRate": 0.6499483050285905,
          "shieldConsumptionRate": 0.49262388933034673,
          "combinedRate": 0.5424367929080687,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.732,
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
              "n": 268,
              "wins": 264,
              "winRate": 0.9850746268656716,
              "winRateCI": [
                0.9622589273821288,
                0.9941809075420033
              ],
              "hpGenerated": 54460.56,
              "shieldGenerated": 132161.37000000005,
              "hpConsumed": 31143.840000000004,
              "shieldConsumed": 52104.410000000025,
              "shieldWasted": 30662.24000000001,
              "hpConsumptionRate": 0.5718604435944105,
              "shieldConsumptionRate": 0.3942484101065236,
              "combinedRate": 0.4460796756308329,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 268,
                "removals": 0,
                "credits": 268,
                "defense": 268
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
              "n": 732,
              "wins": 668,
              "winRate": 0.912568306010929,
              "winRateCI": [
                0.8898920958568038,
                0.9309368921809299
              ],
              "hpGenerated": 150781.83999999997,
              "shieldGenerated": 310814.63000000006,
              "hpConsumed": 102253.11000000002,
              "shieldConsumed": 166116.15000000008,
              "shieldWasted": 18543.660000000003,
              "hpConsumptionRate": 0.6781526873528009,
              "shieldConsumptionRate": 0.5344540892428392,
              "combinedRate": 0.5813936575381525,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 732,
                "removals": 0,
                "credits": 732,
                "defense": 732
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5424367929080687,
        "hpConsumptionRate": 0.6499483050285905,
        "shieldConsumptionRate": 0.49262388933034673,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "removals"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0.03699999999999992,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "ablation-2-10",
      "difficulty": 10,
      "disabledResources": [
        "removals"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": false,
        "credits": true,
        "defense": true
      },
      "label": "难度 10 禁用移除",
      "role": "ablation",
      "summary": {
        "runs": 1000,
        "wins": 802,
        "winRate": 0.802,
        "winRateCI": [
          0.776166200305855,
          0.8255224375688698
        ],
        "avgFloor": 11.988,
        "avgClearedFloors": 11.79,
        "avgHp": 68.31583000000005,
        "avgTurns": 42.023,
        "avgDamage": 29411.04396000001,
        "avgCoins": 324.099,
        "avgMerges": 6.982,
        "avgRemovals": 0,
        "avgRosterSize": 22.785,
        "avgItems": 4.961,
        "avgEssences": 2.996,
        "avgActivatedEssences": 2.996,
        "avgScore": 13315.468039650366,
        "avgSkips": 9.951,
        "skipsByPhase": {
          "recruit": 9914,
          "item": 33,
          "essence": 4
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
            "count": 6
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 192
          }
        ],
        "picks": {
          "recruit": {
            "1001": 493,
            "1002": 1433,
            "1003": 1446,
            "1004": 1682,
            "1005": 4286,
            "1006": 2466,
            "1008": 714,
            "1009": 331,
            "1013": 1277,
            "1101": 1344,
            "1102": 1478,
            "1103": 1244,
            "1104": 1550,
            "1105": 92,
            "1106": 2998,
            "1107": 2178,
            "1108": 1791,
            "1109": 797,
            "1201": 857,
            "1202": 228,
            "1203": 68,
            "1204": 573,
            "1205": 729,
            "1208": 1054,
            "skip": 9914
          },
          "item": {
            "gold_coin": 372,
            "destruction_wax": 680,
            "divination_candle": 716,
            "seal_stamp": 900,
            "doctor_robe": 241,
            "rubert_gear": 112,
            "broken_clock": 213,
            "hunt_wax": 564,
            "nihility_wax": 222,
            "cosmic_lotto": 591,
            "harmony_wax": 149,
            "erudition_wax": 98,
            "fortune_glue": 15,
            "faith_bond": 29,
            "preservation_wax": 15,
            "angel_debt": 10,
            "skip": 33,
            "abundance_wax": 7,
            "chaos_trametes": 7,
            "insect_web": 16,
            "dimension_dice": 4
          },
          "essence": {
            "essence_harmony": 556,
            "essence_destruction": 724,
            "essence_elation": 981,
            "essence_hunt": 552,
            "essence_nihility": 157,
            "essence_erudition": 23,
            "skip": 4,
            "essence_abundance": 3
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 19.052,
          "paidRerolls": 4.014,
          "removalsUsed": 0,
          "supplyPurchases": 14.717,
          "creditsSpent": 267.484,
          "healed": 117.35521000000004,
          "shieldGained": 485.40110000000027,
          "shieldBlocked": 258.04623999999984,
          "shieldDecayed": 51.884959999999936,
          "hpLost": 149.03938000000014,
          "freeRerolls": 15.038,
          "paidRerollCredits": 32.112,
          "supplyCredits": 235.372,
          "supplyKinds": {
            "repair": 0.022,
            "barrier": 0.002,
            "overclock": 14.693
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 0,
          "credits": 1,
          "defense": 0.854
        },
        "defenseUsage": {
          "hpGenerated": 217355.21000000002,
          "shieldGenerated": 485401.10000000027,
          "hpConsumed": 149039.38000000015,
          "shieldConsumed": 258046.23999999985,
          "shieldWasted": 51884.959999999934,
          "hpConsumptionRate": 0.6856949966830799,
          "shieldConsumptionRate": 0.531614452460037,
          "combinedRate": 0.5792699605927406,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.854,
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
              "n": 146,
              "wins": 123,
              "winRate": 0.8424657534246576,
              "winRateCI": [
                0.7746984689092298,
                0.8926735707588018
              ],
              "hpGenerated": 30999.949999999997,
              "shieldGenerated": 81996.44999999997,
              "hpConsumed": 18683.630000000005,
              "shieldConsumed": 32887.5,
              "shieldWasted": 22548.23,
              "hpConsumptionRate": 0.6026987140301842,
              "shieldConsumptionRate": 0.40108443719209813,
              "combinedRate": 0.45639622147254266,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 146,
                "removals": 0,
                "credits": 146,
                "defense": 146
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
              "n": 854,
              "wins": 679,
              "winRate": 0.7950819672131147,
              "winRateCI": [
                0.7667172753811528,
                0.8208038741478839
              ],
              "hpGenerated": 186355.26,
              "shieldGenerated": 403404.65000000026,
              "hpConsumed": 130355.75000000009,
              "shieldConsumed": 225158.73999999996,
              "shieldWasted": 29336.730000000014,
              "hpConsumptionRate": 0.6995013180738772,
              "shieldConsumptionRate": 0.5581461195353098,
              "combinedRate": 0.6028122359147808,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 854,
                "removals": 0,
                "credits": 854,
                "defense": 854
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5792699605927406,
        "hpConsumptionRate": 0.6856949966830799,
        "shieldConsumptionRate": 0.531614452460037,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "removals"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": true,
      "verifiable": true,
      "winRateDrop": 0.16699999999999993,
      "passed": true,
      "reasons": [],
      "targetPassed": true,
      "paired": {
        "fullOnlyWins": 193,
        "ablationOnlyWins": 26,
        "seeds": 1000
      }
    },
    {
      "id": "nominal-3",
      "difficulty": 6,
      "disabledResources": [
        "rerolls",
        "removals"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": false,
        "credits": true,
        "defense": true
      },
      "label": "禁用重掷、移除",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 905,
        "winRate": 0.905,
        "winRateCI": [
          0.8852455602057479,
          0.9216547654209526
        ],
        "avgFloor": 11.998,
        "avgClearedFloors": 11.903,
        "avgHp": 82.38040999999997,
        "avgTurns": 38.822,
        "avgDamage": 19453.312000000005,
        "avgCoins": 338.662,
        "avgMerges": 6.422,
        "avgRemovals": 0,
        "avgRosterSize": 22.732,
        "avgItems": 4.863,
        "avgEssences": 2.959,
        "avgActivatedEssences": 2.959,
        "avgScore": 13579.745849546061,
        "avgSkips": 8.012,
        "skipsByPhase": {
          "recruit": 7835,
          "item": 136,
          "essence": 41
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
            "count": 1
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 94
          }
        ],
        "picks": {
          "recruit": {
            "1001": 904,
            "1002": 1415,
            "1003": 1327,
            "1004": 1421,
            "1005": 2861,
            "1006": 1928,
            "1008": 1029,
            "1009": 790,
            "1013": 1736,
            "1101": 1340,
            "1102": 1412,
            "1103": 1828,
            "1104": 1447,
            "1105": 201,
            "1106": 2286,
            "1107": 1755,
            "1108": 1587,
            "1109": 887,
            "1201": 1202,
            "1202": 471,
            "1203": 91,
            "1204": 464,
            "1205": 493,
            "1208": 1112,
            "skip": 7835
          },
          "item": {
            "cosmic_lotto": 457,
            "seal_stamp": 716,
            "faith_bond": 134,
            "hunt_wax": 439,
            "fortune_glue": 63,
            "erudition_wax": 256,
            "gold_coin": 560,
            "doctor_robe": 184,
            "destruction_wax": 449,
            "divination_candle": 454,
            "dimension_dice": 35,
            "rubert_gear": 200,
            "chaos_trametes": 37,
            "insect_web": 90,
            "harmony_wax": 237,
            "nihility_wax": 290,
            "abundance_wax": 38,
            "skip": 136,
            "broken_clock": 126,
            "angel_debt": 63,
            "preservation_wax": 35
          },
          "essence": {
            "essence_hunt": 532,
            "essence_harmony": 504,
            "essence_nihility": 326,
            "essence_elation": 727,
            "essence_destruction": 696,
            "skip": 41,
            "essence_erudition": 145,
            "essence_preservation": 18,
            "essence_abundance": 11
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 0,
          "supplyPurchases": 15.805,
          "creditsSpent": 252.868,
          "healed": 108.25258999999994,
          "shieldGained": 466.9250600000003,
          "shieldBlocked": 235.27033000000003,
          "shieldDecayed": 54.069609999999955,
          "hpLost": 125.87218000000001,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 252.868,
          "supplyKinds": {
            "repair": 0.003,
            "barrier": 0,
            "overclock": 15.802
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 0,
          "credits": 1,
          "defense": 0.707
        },
        "defenseUsage": {
          "hpGenerated": 208252.58999999994,
          "shieldGenerated": 466925.0600000003,
          "hpConsumed": 125872.18000000001,
          "shieldConsumed": 235270.33000000002,
          "shieldWasted": 54069.60999999996,
          "hpConsumptionRate": 0.604420718128884,
          "shieldConsumptionRate": 0.503871713375161,
          "combinedRate": 0.5348851668890401,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.707,
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
              "n": 293,
              "wins": 278,
              "winRate": 0.9488054607508533,
              "winRateCI": [
                0.9172616352003818,
                0.9687332020600835
              ],
              "hpGenerated": 59706.03,
              "shieldGenerated": 149827.55000000002,
              "hpConsumed": 33059.450000000004,
              "shieldConsumed": 60275.02,
              "shieldWasted": 35427.38,
              "hpConsumptionRate": 0.5537037046341886,
              "shieldConsumptionRate": 0.40229597293688635,
              "combinedRate": 0.44543919881481525,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 293,
                "defense": 293
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 1,
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
              "n": 707,
              "wins": 627,
              "winRate": 0.8868458274398868,
              "winRateCI": [
                0.8613742220690856,
                0.9081363252018746
              ],
              "hpGenerated": 148546.55999999994,
              "shieldGenerated": 317097.5100000001,
              "hpConsumed": 92812.73000000001,
              "shieldConsumed": 174995.31000000003,
              "shieldWasted": 18642.230000000018,
              "hpConsumptionRate": 0.624805650161135,
              "shieldConsumptionRate": 0.551865922882838,
              "combinedRate": 0.5751346516664542,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 707,
                "defense": 707
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5348851668890401,
        "hpConsumptionRate": 0.604420718128884,
        "shieldConsumptionRate": 0.503871713375161,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "removals"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": true,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0.06399999999999995,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "nominal-4",
      "difficulty": 8,
      "disabledResources": [
        "credits"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": false,
        "defense": true
      },
      "label": "禁用信用点消费",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 961,
        "winRate": 0.961,
        "winRateCI": [
          0.9471306895804986,
          0.9713410390958196
        ],
        "avgFloor": 11.998,
        "avgClearedFloors": 11.959,
        "avgHp": 85.68702999999998,
        "avgTurns": 39.666,
        "avgDamage": 24017.709210000008,
        "avgCoins": 334.072,
        "avgMerges": 4.795,
        "avgRemovals": 6.656,
        "avgRosterSize": 20.324,
        "avgItems": 4.887,
        "avgEssences": 2.978,
        "avgActivatedEssences": 2.976,
        "avgScore": 13699.585224859735,
        "avgSkips": 8.026,
        "skipsByPhase": {
          "recruit": 7891,
          "item": 113,
          "essence": 22
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
            "count": 2
          },
          {
            "floor": 12,
            "count": 37
          }
        ],
        "picks": {
          "recruit": {
            "1001": 927,
            "1002": 1231,
            "1003": 1349,
            "1004": 1568,
            "1005": 3956,
            "1006": 2257,
            "1008": 889,
            "1009": 370,
            "1013": 1202,
            "1101": 1488,
            "1102": 1506,
            "1103": 1489,
            "1104": 1435,
            "1105": 162,
            "1106": 2465,
            "1107": 2056,
            "1108": 1675,
            "1109": 918,
            "1201": 1087,
            "1202": 279,
            "1203": 80,
            "1204": 526,
            "1205": 727,
            "1208": 1133,
            "skip": 7891
          },
          "item": {
            "divination_candle": 596,
            "cosmic_lotto": 499,
            "gold_coin": 489,
            "nihility_wax": 311,
            "harmony_wax": 181,
            "hunt_wax": 486,
            "seal_stamp": 815,
            "destruction_wax": 594,
            "doctor_robe": 162,
            "insect_web": 50,
            "rubert_gear": 158,
            "skip": 113,
            "broken_clock": 148,
            "dimension_dice": 30,
            "fortune_glue": 41,
            "erudition_wax": 144,
            "chaos_trametes": 48,
            "faith_bond": 47,
            "preservation_wax": 37,
            "abundance_wax": 30,
            "angel_debt": 21
          },
          "essence": {
            "essence_destruction": 690,
            "essence_elation": 854,
            "essence_hunt": 524,
            "essence_nihility": 289,
            "essence_harmony": 518,
            "essence_erudition": 87,
            "skip": 22,
            "essence_preservation": 8,
            "essence_abundance": 8
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 14.86,
          "paidRerolls": 0,
          "removalsUsed": 6.656,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 62.86526999999996,
          "shieldGained": 443.2261199999995,
          "shieldBlocked": 235.22886999999986,
          "shieldDecayed": 49.214769999999994,
          "hpLost": 77.17823999999997,
          "freeRerolls": 14.86,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 0,
          "defense": 0.534
        },
        "defenseUsage": {
          "hpGenerated": 162865.26999999996,
          "shieldGenerated": 443226.11999999953,
          "hpConsumed": 77178.23999999998,
          "shieldConsumed": 235228.86999999985,
          "shieldWasted": 49214.77,
          "hpConsumptionRate": 0.47387782551798796,
          "shieldConsumptionRate": 0.5307197824893535,
          "combinedRate": 0.5154455502164452,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.534,
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
              "n": 466,
              "wins": 456,
              "winRate": 0.9785407725321889,
              "winRateCI": [
                0.9609535577896544,
                0.9883028171574684
              ],
              "hpGenerated": 73318,
              "shieldGenerated": 223407.10999999996,
              "hpConsumed": 28614.21999999999,
              "shieldConsumed": 101215.92999999998,
              "shieldWasted": 37696.13,
              "hpConsumptionRate": 0.39027551215254086,
              "shieldConsumptionRate": 0.4530559927121388,
              "combinedRate": 0.43754352302708716,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 466,
                "removals": 466,
                "credits": 0,
                "defense": 466
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
              "n": 534,
              "wins": 505,
              "winRate": 0.9456928838951311,
              "winRateCI": [
                0.9230943880206126,
                0.9619247792330765
              ],
              "hpGenerated": 89547.26999999996,
              "shieldGenerated": 219819.0100000001,
              "hpConsumed": 48564.01999999998,
              "shieldConsumed": 134012.94000000003,
              "shieldWasted": 11518.64,
              "hpConsumptionRate": 0.542328314419859,
              "shieldConsumptionRate": 0.6096512762931648,
              "combinedRate": 0.5901643837848133,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 534,
                "removals": 534,
                "credits": 0,
                "defense": 534
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5154455502164452,
        "hpConsumptionRate": 0.47387782551798796,
        "shieldConsumptionRate": 0.5307197824893535,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "credits"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0.008000000000000007,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "ablation-4-10",
      "difficulty": 10,
      "disabledResources": [
        "credits"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": false,
        "defense": true
      },
      "label": "难度 10 禁用信用点消费",
      "role": "ablation",
      "summary": {
        "runs": 1000,
        "wins": 880,
        "winRate": 0.88,
        "winRateCI": [
          0.8583909241522872,
          0.8987007393986909
        ],
        "avgFloor": 11.985,
        "avgClearedFloors": 11.865,
        "avgHp": 81.68555,
        "avgTurns": 43.443,
        "avgDamage": 29481.096699999995,
        "avgCoins": 329.644,
        "avgMerges": 5.391,
        "avgRemovals": 7.169,
        "avgRosterSize": 20.436,
        "avgItems": 4.894,
        "avgEssences": 2.988,
        "avgActivatedEssences": 2.986,
        "avgScore": 13494.349675204796,
        "avgSkips": 9.987,
        "skipsByPhase": {
          "recruit": 9876,
          "item": 100,
          "essence": 11
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
            "count": 4
          },
          {
            "floor": 11,
            "count": 3
          },
          {
            "floor": 12,
            "count": 112
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1124,
            "1002": 1320,
            "1003": 1333,
            "1004": 1672,
            "1005": 4293,
            "1006": 2371,
            "1008": 937,
            "1009": 435,
            "1013": 1228,
            "1101": 1610,
            "1102": 1566,
            "1103": 1541,
            "1104": 1466,
            "1105": 196,
            "1106": 2690,
            "1107": 2094,
            "1108": 1854,
            "1109": 880,
            "1201": 1109,
            "1202": 292,
            "1203": 85,
            "1204": 591,
            "1205": 780,
            "1208": 1100,
            "skip": 9876
          },
          "item": {
            "harmony_wax": 209,
            "seal_stamp": 781,
            "nihility_wax": 310,
            "hunt_wax": 494,
            "fortune_glue": 40,
            "rubert_gear": 194,
            "divination_candle": 583,
            "destruction_wax": 541,
            "cosmic_lotto": 522,
            "gold_coin": 464,
            "doctor_robe": 173,
            "preservation_wax": 30,
            "skip": 100,
            "erudition_wax": 179,
            "broken_clock": 145,
            "angel_debt": 36,
            "insect_web": 42,
            "abundance_wax": 35,
            "dimension_dice": 36,
            "faith_bond": 37,
            "chaos_trametes": 43
          },
          "essence": {
            "essence_destruction": 678,
            "essence_elation": 859,
            "essence_hunt": 567,
            "essence_harmony": 510,
            "essence_nihility": 293,
            "essence_erudition": 66,
            "skip": 11,
            "essence_preservation": 5,
            "essence_abundance": 10
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 14.93,
          "paidRerolls": 0,
          "removalsUsed": 7.169,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 67.89735999999998,
          "shieldGained": 485.19964000000004,
          "shieldBlocked": 273.4568599999997,
          "shieldDecayed": 54.35464000000001,
          "hpLost": 86.21180999999997,
          "freeRerolls": 14.93,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 0,
          "defense": 0.704
        },
        "defenseUsage": {
          "hpGenerated": 167897.36,
          "shieldGenerated": 485199.6400000001,
          "hpConsumed": 86211.80999999997,
          "shieldConsumed": 273456.8599999997,
          "shieldWasted": 54354.640000000014,
          "hpConsumptionRate": 0.5134792470828605,
          "shieldConsumptionRate": 0.5635965846965584,
          "combinedRate": 0.550712482219333,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.704,
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
              "n": 296,
              "wins": 277,
              "winRate": 0.9358108108108109,
              "winRateCI": [
                0.9019297284898427,
                0.9585249965329723
              ],
              "hpGenerated": 47455.71,
              "shieldGenerated": 160339.70999999985,
              "hpConsumed": 18683.050000000003,
              "shieldConsumed": 73793.87000000004,
              "shieldWasted": 33361.29999999999,
              "hpConsumptionRate": 0.3936944574214568,
              "shieldConsumptionRate": 0.460234523313034,
              "combinedRate": 0.445038297764215,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 296,
                "removals": 296,
                "credits": 0,
                "defense": 296
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
              "n": 704,
              "wins": 603,
              "winRate": 0.8565340909090909,
              "winRateCI": [
                0.8287025982188109,
                0.8804957593291657
              ],
              "hpGenerated": 120441.65,
              "shieldGenerated": 324859.93000000005,
              "hpConsumed": 67528.75999999998,
              "shieldConsumed": 199662.9899999998,
              "shieldWasted": 20993.34000000001,
              "hpConsumptionRate": 0.5606761448386002,
              "shieldConsumptionRate": 0.6146125500919727,
              "combinedRate": 0.6000242577176567,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 704,
                "removals": 704,
                "credits": 0,
                "defense": 704
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.550712482219333,
        "hpConsumptionRate": 0.5134792470828605,
        "shieldConsumptionRate": 0.5635965846965584,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "credits"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": true,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": true,
      "verifiable": true,
      "winRateDrop": 0.08899999999999997,
      "passed": true,
      "reasons": [],
      "targetPassed": true,
      "paired": {
        "fullOnlyWins": 115,
        "ablationOnlyWins": 26,
        "seeds": 1000
      }
    },
    {
      "id": "nominal-5",
      "difficulty": 6,
      "disabledResources": [
        "rerolls",
        "credits"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": true,
        "credits": false,
        "defense": true
      },
      "label": "禁用重掷、信用点消费",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 978,
        "winRate": 0.978,
        "winRateCI": [
          0.9669143266526004,
          0.985427292235209
        ],
        "avgFloor": 11.996,
        "avgClearedFloors": 11.974,
        "avgHp": 91.40661999999999,
        "avgTurns": 39.155,
        "avgDamage": 19466.89893,
        "avgCoins": 336.357,
        "avgMerges": 4.617,
        "avgRemovals": 6.607,
        "avgRosterSize": 20.396,
        "avgItems": 4.825,
        "avgEssences": 2.964,
        "avgActivatedEssences": 2.963,
        "avgScore": 13743.961466301615,
        "avgSkips": 7.868,
        "skipsByPhase": {
          "recruit": 7659,
          "item": 173,
          "essence": 36
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
            "count": 2
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 20
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1136,
            "1002": 1328,
            "1003": 1330,
            "1004": 1373,
            "1005": 3024,
            "1006": 1954,
            "1008": 1117,
            "1009": 681,
            "1013": 1578,
            "1101": 1516,
            "1102": 1450,
            "1103": 1800,
            "1104": 1396,
            "1105": 230,
            "1106": 2149,
            "1107": 1736,
            "1108": 1595,
            "1109": 1014,
            "1201": 1324,
            "1202": 489,
            "1203": 109,
            "1204": 494,
            "1205": 562,
            "1208": 1111,
            "skip": 7659
          },
          "item": {
            "cosmic_lotto": 443,
            "erudition_wax": 267,
            "gold_coin": 539,
            "rubert_gear": 222,
            "destruction_wax": 471,
            "hunt_wax": 453,
            "seal_stamp": 712,
            "harmony_wax": 249,
            "doctor_robe": 177,
            "nihility_wax": 295,
            "divination_candle": 459,
            "dimension_dice": 50,
            "fortune_glue": 76,
            "skip": 173,
            "angel_debt": 29,
            "chaos_trametes": 44,
            "broken_clock": 109,
            "abundance_wax": 48,
            "faith_bond": 68,
            "preservation_wax": 47,
            "insect_web": 67
          },
          "essence": {
            "essence_harmony": 501,
            "essence_elation": 722,
            "essence_destruction": 682,
            "essence_hunt": 556,
            "essence_nihility": 304,
            "essence_erudition": 164,
            "essence_preservation": 18,
            "skip": 36,
            "essence_abundance": 17
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 6.607,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 58.19383000000002,
          "shieldGained": 448.0021400000003,
          "shieldBlocked": 236.35936000000024,
          "shieldDecayed": 49.01077999999994,
          "hpLost": 66.78720999999999,
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
          "removals": 1,
          "credits": 0,
          "defense": 0.467
        },
        "defenseUsage": {
          "hpGenerated": 158193.83000000002,
          "shieldGenerated": 448002.1400000003,
          "hpConsumed": 66787.20999999999,
          "shieldConsumed": 236359.36000000025,
          "shieldWasted": 49010.77999999994,
          "hpConsumptionRate": 0.4221859348117432,
          "shieldConsumptionRate": 0.5275853369807566,
          "combinedRate": 0.5000801473490496,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.467,
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
              "n": 533,
              "wins": 529,
              "winRate": 0.9924953095684803,
              "winRateCI": [
                0.9808645397877577,
                0.9970778142794806
              ],
              "hpGenerated": 81302.90999999999,
              "shieldGenerated": 257575.04000000018,
              "hpConsumed": 28831.929999999997,
              "shieldConsumed": 118694.45000000001,
              "shieldWasted": 39301.409999999996,
              "hpConsumptionRate": 0.35462359219368655,
              "shieldConsumptionRate": 0.46081503083528563,
              "combinedRate": 0.4353377963954277,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 533,
                "credits": 0,
                "defense": 533
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
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
              "n": 467,
              "wins": 449,
              "winRate": 0.961456102783726,
              "winRateCI": [
                0.9399001511580874,
                0.975482281560382
              ],
              "hpGenerated": 76890.91999999998,
              "shieldGenerated": 190427.1000000001,
              "hpConsumed": 37955.280000000006,
              "shieldConsumed": 117664.91000000002,
              "shieldWasted": 9709.369999999997,
              "hpConsumptionRate": 0.493624994992907,
              "shieldConsumptionRate": 0.617900025784145,
              "combinedRate": 0.5821537582838597,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 467,
                "credits": 0,
                "defense": 467
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5000801473490496,
        "hpConsumptionRate": 0.4221859348117432,
        "shieldConsumptionRate": 0.5275853369807566,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "credits"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": true,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": -0.009000000000000008,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "nominal-6",
      "difficulty": 6,
      "disabledResources": [
        "removals",
        "credits"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": false,
        "credits": false,
        "defense": true
      },
      "label": "禁用移除、信用点消费",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 946,
        "winRate": 0.946,
        "winRateCI": [
          0.9302078451539475,
          0.9583786862769372
        ],
        "avgFloor": 11.996,
        "avgClearedFloors": 11.942,
        "avgHp": 72.89367999999996,
        "avgTurns": 37.048,
        "avgDamage": 19374.51148,
        "avgCoins": 331.659,
        "avgMerges": 6.1,
        "avgRemovals": 0,
        "avgRosterSize": 22.278,
        "avgItems": 4.9,
        "avgEssences": 2.981,
        "avgActivatedEssences": 2.98,
        "avgScore": 13654.674627724744,
        "avgSkips": 7.32,
        "skipsByPhase": {
          "recruit": 7203,
          "item": 98,
          "essence": 19
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
            "count": 2
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 52
          }
        ],
        "picks": {
          "recruit": {
            "1001": 478,
            "1002": 1384,
            "1003": 1316,
            "1004": 1535,
            "1005": 3817,
            "1006": 2193,
            "1008": 685,
            "1009": 322,
            "1013": 1256,
            "1101": 1341,
            "1102": 1377,
            "1103": 1194,
            "1104": 1447,
            "1105": 91,
            "1106": 2658,
            "1107": 2001,
            "1108": 1632,
            "1109": 739,
            "1201": 851,
            "1202": 238,
            "1203": 48,
            "1204": 511,
            "1205": 694,
            "1208": 1037,
            "skip": 7203
          },
          "item": {
            "seal_stamp": 842,
            "divination_candle": 580,
            "hunt_wax": 503,
            "cosmic_lotto": 551,
            "destruction_wax": 570,
            "erudition_wax": 178,
            "broken_clock": 140,
            "gold_coin": 488,
            "harmony_wax": 196,
            "doctor_robe": 174,
            "rubert_gear": 182,
            "skip": 98,
            "nihility_wax": 261,
            "insect_web": 41,
            "faith_bond": 44,
            "fortune_glue": 33,
            "chaos_trametes": 45,
            "abundance_wax": 13,
            "angel_debt": 19,
            "dimension_dice": 19,
            "preservation_wax": 21
          },
          "essence": {
            "essence_nihility": 288,
            "essence_elation": 871,
            "essence_destruction": 703,
            "essence_hunt": 527,
            "essence_harmony": 519,
            "essence_erudition": 63,
            "skip": 19,
            "essence_preservation": 3,
            "essence_abundance": 7
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 14.885,
          "paidRerolls": 0,
          "removalsUsed": 0,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 104.18684000000005,
          "shieldGained": 440.7262400000002,
          "shieldBlocked": 216.16681999999994,
          "shieldDecayed": 48.08412999999998,
          "hpLost": 131.29315999999997,
          "freeRerolls": 14.885,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 0,
          "credits": 0,
          "defense": 0.675
        },
        "defenseUsage": {
          "hpGenerated": 204186.84000000003,
          "shieldGenerated": 440726.24000000017,
          "hpConsumed": 131293.15999999997,
          "shieldConsumed": 216166.81999999995,
          "shieldWasted": 48084.12999999998,
          "hpConsumptionRate": 0.6430050046320319,
          "shieldConsumptionRate": 0.4904786699335167,
          "combinedRate": 0.5387702479224019,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.675,
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
              "n": 325,
              "wins": 322,
              "winRate": 0.9907692307692307,
              "winRateCI": [
                0.9732164931682213,
                0.9968558363489021
              ],
              "hpGenerated": 65525.23,
              "shieldGenerated": 155443.06000000003,
              "hpConsumed": 36913.00000000001,
              "shieldConsumed": 62613.709999999985,
              "shieldWasted": 32795.77,
              "hpConsumptionRate": 0.5633402584012297,
              "shieldConsumptionRate": 0.4028080121428385,
              "combinedRate": 0.45041173102258236,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 325,
                "removals": 0,
                "credits": 0,
                "defense": 325
              },
              "resourceUsageRates": {
                "rerolls": 1,
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
              "n": 675,
              "wins": 624,
              "winRate": 0.9244444444444444,
              "winRateCI": [
                0.9020170493102173,
                0.9420681086520475
              ],
              "hpGenerated": 138661.61,
              "shieldGenerated": 285283.17999999993,
              "hpConsumed": 94380.16000000002,
              "shieldConsumed": 153553.11,
              "shieldWasted": 15288.359999999993,
              "hpConsumptionRate": 0.6806509747002074,
              "shieldConsumptionRate": 0.5382480313069983,
              "combinedRate": 0.5848244296149979,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 675,
                "removals": 0,
                "credits": 0,
                "defense": 675
              },
              "resourceUsageRates": {
                "rerolls": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5387702479224019,
        "hpConsumptionRate": 0.6430050046320319,
        "shieldConsumptionRate": 0.4904786699335167,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "removals",
        "credits"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": true,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": 0.02300000000000002,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "nominal-7",
      "difficulty": 4,
      "disabledResources": [
        "rerolls",
        "removals",
        "credits"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": false,
        "credits": false,
        "defense": true
      },
      "label": "禁用重掷、移除、信用点消费",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 973,
        "winRate": 0.973,
        "winRateCI": [
          0.9610012692469598,
          0.9813786172257051
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.973,
        "avgHp": 83.69457999999999,
        "avgTurns": 37.169,
        "avgDamage": 15959.883909999999,
        "avgCoins": 337.128,
        "avgMerges": 6.144,
        "avgRemovals": 0,
        "avgRosterSize": 22.506,
        "avgItems": 4.825,
        "avgEssences": 2.965,
        "avgActivatedEssences": 2.965,
        "avgScore": 13734.556043049382,
        "avgSkips": 7.191,
        "skipsByPhase": {
          "recruit": 6981,
          "item": 175,
          "essence": 35
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
            "count": 27
          }
        ],
        "picks": {
          "recruit": {
            "1001": 880,
            "1002": 1408,
            "1003": 1292,
            "1004": 1373,
            "1005": 2705,
            "1006": 1860,
            "1008": 982,
            "1009": 748,
            "1013": 1641,
            "1101": 1344,
            "1102": 1349,
            "1103": 1761,
            "1104": 1511,
            "1105": 167,
            "1106": 2273,
            "1107": 1699,
            "1108": 1512,
            "1109": 964,
            "1201": 1198,
            "1202": 464,
            "1203": 103,
            "1204": 438,
            "1205": 471,
            "1208": 1045,
            "skip": 6981
          },
          "item": {
            "cosmic_lotto": 452,
            "seal_stamp": 693,
            "faith_bond": 78,
            "hunt_wax": 440,
            "destruction_wax": 478,
            "erudition_wax": 262,
            "nihility_wax": 271,
            "doctor_robe": 179,
            "gold_coin": 553,
            "divination_candle": 476,
            "dimension_dice": 47,
            "preservation_wax": 53,
            "broken_clock": 115,
            "rubert_gear": 204,
            "insect_web": 67,
            "harmony_wax": 249,
            "fortune_glue": 83,
            "chaos_trametes": 44,
            "abundance_wax": 46,
            "skip": 175,
            "angel_debt": 35
          },
          "essence": {
            "essence_hunt": 543,
            "essence_harmony": 533,
            "essence_elation": 750,
            "essence_destruction": 666,
            "essence_erudition": 148,
            "essence_nihility": 297,
            "skip": 35,
            "essence_preservation": 14,
            "essence_abundance": 14
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
          "healed": 103.14791999999998,
          "shieldGained": 451.66881000000063,
          "shieldBlocked": 222.5724700000002,
          "shieldDecayed": 50.26930000000001,
          "hpLost": 119.45334000000003,
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
          "defense": 0.616
        },
        "defenseUsage": {
          "hpGenerated": 203147.91999999998,
          "shieldGenerated": 451668.81000000064,
          "hpConsumed": 119453.34000000003,
          "shieldConsumed": 222572.4700000002,
          "shieldWasted": 50269.30000000001,
          "hpConsumptionRate": 0.5880116321151604,
          "shieldConsumptionRate": 0.4927780379610447,
          "combinedRate": 0.5223229559208115,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.616,
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
              "n": 384,
              "wins": 379,
              "winRate": 0.9869791666666666,
              "winRateCI": [
                0.969885754626481,
                0.9944257997318855
              ],
              "hpGenerated": 77144.65999999997,
              "shieldGenerated": 185403.02,
              "hpConsumed": 41890.23999999996,
              "shieldConsumed": 75994.51999999997,
              "shieldWasted": 37758.08000000001,
              "hpConsumptionRate": 0.5430089393096033,
              "shieldConsumptionRate": 0.40988825316869154,
              "combinedRate": 0.44900324390602103,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 384
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
              "n": 616,
              "wins": 594,
              "winRate": 0.9642857142857143,
              "winRateCI": [
                0.9465182701516112,
                0.9762983499052064
              ],
              "hpGenerated": 126003.25999999995,
              "shieldGenerated": 266265.7900000002,
              "hpConsumed": 77563.09999999999,
              "shieldConsumed": 146577.95000000004,
              "shieldWasted": 12511.219999999996,
              "hpConsumptionRate": 0.6155642322270076,
              "shieldConsumptionRate": 0.5504948645486899,
              "combinedRate": 0.571396213899618,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 616
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
      "actualDefensiveUse": {
        "combinedRate": 0.5223229559208115,
        "hpConsumptionRate": 0.5880116321151604,
        "shieldConsumptionRate": 0.4927780379610447,
        "planningEnabled": true,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "removals",
        "credits"
      ],
      "actualMissingResourceCount": 3,
      "nominalMappingEligible": true,
      "nominalDifficulty": 4,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": true,
      "winRateDrop": -0.0040000000000000036,
      "passed": true,
      "reasons": [],
      "targetPassed": true
    },
    {
      "id": "nominal-8",
      "difficulty": 8,
      "disabledResources": [
        "defense"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": true,
        "defense": false
      },
      "label": "禁用防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 989,
        "winRate": 0.989,
        "winRateCI": [
          0.9804106042992137,
          0.9938468259019134
        ],
        "avgFloor": 11.996,
        "avgClearedFloors": 11.985,
        "avgHp": 84.57278999999998,
        "avgTurns": 36.623,
        "avgDamage": 24051.59125,
        "avgCoins": 332.542,
        "avgMerges": 4.414,
        "avgRemovals": 6.204,
        "avgRosterSize": 20.224,
        "avgItems": 4.965,
        "avgEssences": 2.993,
        "avgActivatedEssences": 2.993,
        "avgScore": 13765.012211483516,
        "avgSkips": 6.21,
        "skipsByPhase": {
          "recruit": 6170,
          "item": 33,
          "essence": 7
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
            "count": 2
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 9
          }
        ],
        "picks": {
          "recruit": {
            "1001": 924,
            "1002": 1264,
            "1003": 1354,
            "1004": 1584,
            "1005": 3961,
            "1006": 2223,
            "1008": 777,
            "1009": 305,
            "1013": 1073,
            "1101": 1415,
            "1102": 1542,
            "1103": 1254,
            "1104": 1278,
            "1105": 153,
            "1106": 2391,
            "1107": 2044,
            "1108": 1687,
            "1109": 838,
            "1201": 941,
            "1202": 242,
            "1203": 68,
            "1204": 518,
            "1205": 692,
            "1208": 925,
            "skip": 6170
          },
          "item": {
            "divination_candle": 713,
            "gold_coin": 414,
            "broken_clock": 208,
            "cosmic_lotto": 594,
            "destruction_wax": 654,
            "hunt_wax": 571,
            "seal_stamp": 904,
            "nihility_wax": 258,
            "faith_bond": 27,
            "doctor_robe": 142,
            "chaos_trametes": 9,
            "erudition_wax": 128,
            "harmony_wax": 146,
            "rubert_gear": 129,
            "angel_debt": 11,
            "dimension_dice": 8,
            "skip": 33,
            "fortune_glue": 12,
            "abundance_wax": 9,
            "insect_web": 21,
            "preservation_wax": 7
          },
          "essence": {
            "essence_destruction": 712,
            "essence_elation": 990,
            "essence_hunt": 575,
            "essence_harmony": 485,
            "essence_erudition": 22,
            "essence_nihility": 202,
            "skip": 7,
            "essence_preservation": 4,
            "essence_abundance": 3
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 18.195,
          "paidRerolls": 3.493,
          "removalsUsed": 6.204,
          "supplyPurchases": 14.748,
          "creditsSpent": 263.912,
          "healed": 54.516589999999994,
          "shieldGained": 386.15274000000045,
          "shieldBlocked": 199.4262599999999,
          "shieldDecayed": 37.94729999999998,
          "hpLost": 69.94380000000002,
          "freeRerolls": 14.702,
          "paidRerollCredits": 27.944,
          "supplyCredits": 235.968,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 14.748
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 1,
          "defense": 0.434
        },
        "defenseUsage": {
          "hpGenerated": 154516.59,
          "shieldGenerated": 386152.74000000046,
          "hpConsumed": 69943.80000000002,
          "shieldConsumed": 199426.2599999999,
          "shieldWasted": 37947.299999999974,
          "hpConsumptionRate": 0.4526620733734806,
          "shieldConsumptionRate": 0.516443985351495,
          "combinedRate": 0.4982159058291687,
          "classification": "moderate",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.434,
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
              "n": 566,
              "wins": 565,
              "winRate": 0.9982332155477032,
              "winRateCI": [
                0.9900609243360708,
                0.9996880510494984
              ],
              "hpGenerated": 85205.81,
              "shieldGenerated": 241544.8700000002,
              "hpConsumed": 31827.04,
              "shieldConsumed": 107458.69000000016,
              "shieldWasted": 31269.249999999996,
              "hpConsumptionRate": 0.3735313354805265,
              "shieldConsumptionRate": 0.44488086209407,
              "combinedRate": 0.4262752567186703,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 566,
                "removals": 566,
                "credits": 566,
                "defense": 566
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 566,
                "wins": 565,
                "winRate": 0.9982332155477032,
                "winRateCI": [
                  0.9900609243360708,
                  0.9996880510494984
                ]
              },
              "observational": true
            },
            "effective": {
              "n": 434,
              "wins": 424,
              "winRate": 0.9769585253456221,
              "winRateCI": [
                0.9581106240121893,
                0.9874371117255136
              ],
              "hpGenerated": 69310.78,
              "shieldGenerated": 144607.86999999994,
              "hpConsumed": 38116.75999999999,
              "shieldConsumed": 91967.56999999992,
              "shieldWasted": 6678.050000000002,
              "hpConsumptionRate": 0.5499398506264104,
              "shieldConsumptionRate": 0.6359790099944074,
              "combinedRate": 0.6081018648911628,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 434,
                "removals": 434,
                "credits": 434,
                "defense": 434
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
                "credits": 1,
                "defense": 1
              },
              "jointActiveFour": {
                "n": 434,
                "wins": 424,
                "winRate": 0.9769585253456221,
                "winRateCI": [
                  0.9581106240121893,
                  0.9874371117255136
                ]
              },
              "observational": true
            }
          }
        },
        "incomplete": 0
      },
      "actualDefensiveUse": {
        "combinedRate": 0.4982159058291687,
        "hpConsumptionRate": 0.4526620733734806,
        "shieldConsumptionRate": 0.516443985351495,
        "planningEnabled": false,
        "lowUse": false,
        "effective": false,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [],
      "actualMissingResourceCount": 0,
      "nominalMappingEligible": false,
      "nominalDifficulty": 10,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.020000000000000018,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D10，当前为 D8",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    },
    {
      "id": "ablation-8-10",
      "difficulty": 10,
      "disabledResources": [
        "defense"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": true,
        "defense": false
      },
      "label": "难度 10 禁用防御规划（自然效果保留）",
      "role": "ablation",
      "summary": {
        "runs": 1000,
        "wins": 942,
        "winRate": 0.942,
        "winRateCI": [
          0.9257504237337675,
          0.9548667217650018
        ],
        "avgFloor": 11.994,
        "avgClearedFloors": 11.936,
        "avgHp": 81.12181000000005,
        "avgTurns": 40.626,
        "avgDamage": 29561.889079999994,
        "avgCoins": 329.32,
        "avgMerges": 4.975,
        "avgRemovals": 6.775,
        "avgRosterSize": 20.366,
        "avgItems": 4.977,
        "avgEssences": 2.998,
        "avgActivatedEssences": 2.998,
        "avgScore": 13639.431966657858,
        "avgSkips": 8.363,
        "skipsByPhase": {
          "recruit": 8339,
          "item": 22,
          "essence": 2
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
            "count": 1
          },
          {
            "floor": 11,
            "count": 4
          },
          {
            "floor": 12,
            "count": 53
          }
        ],
        "picks": {
          "recruit": {
            "1001": 995,
            "1002": 1344,
            "1003": 1420,
            "1004": 1603,
            "1005": 4242,
            "1006": 2324,
            "1008": 898,
            "1009": 348,
            "1013": 1108,
            "1101": 1518,
            "1102": 1493,
            "1103": 1493,
            "1104": 1275,
            "1105": 209,
            "1106": 2475,
            "1107": 2137,
            "1108": 1810,
            "1109": 921,
            "1201": 1078,
            "1202": 293,
            "1203": 82,
            "1204": 520,
            "1205": 722,
            "1208": 979,
            "skip": 8339
          },
          "item": {
            "gold_coin": 397,
            "seal_stamp": 895,
            "divination_candle": 695,
            "cosmic_lotto": 642,
            "erudition_wax": 120,
            "hunt_wax": 562,
            "destruction_wax": 659,
            "faith_bond": 16,
            "nihility_wax": 260,
            "harmony_wax": 150,
            "broken_clock": 195,
            "doctor_robe": 186,
            "rubert_gear": 133,
            "preservation_wax": 7,
            "insect_web": 24,
            "dimension_dice": 6,
            "angel_debt": 7,
            "fortune_glue": 11,
            "skip": 22,
            "abundance_wax": 7,
            "chaos_trametes": 5
          },
          "essence": {
            "essence_destruction": 663,
            "essence_elation": 983,
            "essence_harmony": 512,
            "essence_hunt": 581,
            "essence_nihility": 221,
            "essence_erudition": 28,
            "essence_abundance": 8,
            "skip": 2,
            "essence_preservation": 2
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 18.39,
          "paidRerolls": 3.604,
          "removalsUsed": 6.775,
          "supplyPurchases": 14.765,
          "creditsSpent": 265.072,
          "healed": 60.379869999999926,
          "shieldGained": 428.1167100000002,
          "shieldBlocked": 237.75165999999976,
          "shieldDecayed": 43.11928000000002,
          "hpLost": 79.25805999999997,
          "freeRerolls": 14.786,
          "paidRerollCredits": 28.832,
          "supplyCredits": 236.24,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 14.765
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 1,
          "defense": 0.599
        },
        "defenseUsage": {
          "hpGenerated": 160379.86999999994,
          "shieldGenerated": 428116.7100000002,
          "hpConsumed": 79258.05999999997,
          "shieldConsumed": 237751.65999999977,
          "shieldWasted": 43119.28000000002,
          "hpConsumptionRate": 0.49418957628535304,
          "shieldConsumptionRate": 0.5553430979136499,
          "combinedRate": 0.5386772511065395,
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
              "wins": 390,
              "winRate": 0.972568578553616,
              "winRateCI": [
                0.9515539450370324,
                0.9846149965136416
              ],
              "hpGenerated": 61398.48000000001,
              "shieldGenerated": 193016.83999999997,
              "hpConsumed": 23038.130000000005,
              "shieldConsumed": 89301.83,
              "shieldWasted": 31593.4,
              "hpConsumptionRate": 0.3752231325596334,
              "shieldConsumptionRate": 0.46266341320270304,
              "combinedRate": 0.4415613022046,
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
                "wins": 390,
                "winRate": 0.972568578553616,
                "winRateCI": [
                  0.9515539450370324,
                  0.9846149965136416
                ]
              },
              "observational": true
            },
            "effective": {
              "n": 599,
              "wins": 552,
              "winRate": 0.9215358931552587,
              "winRateCI": [
                0.8972169833094757,
                0.9404825355456209
              ],
              "hpGenerated": 98981.38999999998,
              "shieldGenerated": 235099.86999999997,
              "hpConsumed": 56219.92999999999,
              "shieldConsumed": 148449.83000000002,
              "shieldWasted": 11525.880000000003,
              "hpConsumptionRate": 0.5679848504855307,
              "shieldConsumptionRate": 0.6314330586401432,
              "combinedRate": 0.6126346625967588,
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
                "wins": 552,
                "winRate": 0.9215358931552587,
                "winRateCI": [
                  0.8972169833094757,
                  0.9404825355456209
                ]
              },
              "observational": true
            }
          }
        },
        "incomplete": 0
      },
      "actualDefensiveUse": {
        "combinedRate": 0.5386772511065395,
        "hpConsumptionRate": 0.49418957628535304,
        "shieldConsumptionRate": 0.5553430979136499,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [],
      "actualMissingResourceCount": 0,
      "nominalMappingEligible": false,
      "nominalDifficulty": 10,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": true,
      "verifiable": false,
      "winRateDrop": 0.027000000000000024,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "关闭防御规划保留自然生命与护盾，不能作为彻底移除防御的消融或要求固定胜率下降"
      ],
      "targetPassed": false,
      "paired": {
        "fullOnlyWins": 58,
        "ablationOnlyWins": 31,
        "seeds": 1000
      }
    },
    {
      "id": "nominal-9",
      "difficulty": 6,
      "disabledResources": [
        "rerolls",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": true,
        "credits": true,
        "defense": false
      },
      "label": "禁用重掷、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 982,
        "winRate": 0.982,
        "winRateCI": [
          0.9717267448294926,
          0.9885842599904322
        ],
        "avgFloor": 11.999,
        "avgClearedFloors": 11.981,
        "avgHp": 90.67904000000007,
        "avgTurns": 37.432,
        "avgDamage": 19481.7404,
        "avgCoins": 342.489,
        "avgMerges": 4.338,
        "avgRemovals": 6.381,
        "avgRosterSize": 20.296,
        "avgItems": 4.846,
        "avgEssences": 2.968,
        "avgActivatedEssences": 2.967,
        "avgScore": 13756.86551848059,
        "avgSkips": 6.879,
        "skipsByPhase": {
          "recruit": 6693,
          "item": 154,
          "essence": 32
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
            "count": 1
          },
          {
            "floor": 12,
            "count": 17
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1078,
            "1002": 1275,
            "1003": 1324,
            "1004": 1416,
            "1005": 2825,
            "1006": 1906,
            "1008": 1105,
            "1009": 752,
            "1013": 1538,
            "1101": 1431,
            "1102": 1494,
            "1103": 1856,
            "1104": 1342,
            "1105": 226,
            "1106": 2097,
            "1107": 1673,
            "1108": 1475,
            "1109": 1017,
            "1201": 1319,
            "1202": 495,
            "1203": 103,
            "1204": 474,
            "1205": 500,
            "1208": 1018,
            "skip": 6693
          },
          "item": {
            "cosmic_lotto": 461,
            "seal_stamp": 718,
            "faith_bond": 159,
            "divination_candle": 472,
            "dimension_dice": 25,
            "hunt_wax": 441,
            "erudition_wax": 241,
            "abundance_wax": 40,
            "harmony_wax": 234,
            "nihility_wax": 278,
            "destruction_wax": 461,
            "gold_coin": 556,
            "doctor_robe": 161,
            "broken_clock": 120,
            "insect_web": 96,
            "rubert_gear": 201,
            "preservation_wax": 32,
            "skip": 154,
            "angel_debt": 46,
            "fortune_glue": 62,
            "chaos_trametes": 42
          },
          "essence": {
            "essence_hunt": 531,
            "essence_harmony": 495,
            "essence_nihility": 329,
            "essence_destruction": 668,
            "essence_elation": 749,
            "skip": 32,
            "essence_erudition": 172,
            "essence_abundance": 15,
            "essence_preservation": 9
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 6.381,
          "supplyPurchases": 15.744,
          "creditsSpent": 251.904,
          "healed": 52.98773999999998,
          "shieldGained": 406.67682000000025,
          "shieldBlocked": 211.4283399999998,
          "shieldDecayed": 39.89374999999999,
          "hpLost": 62.308699999999966,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 251.904,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 15.744
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 1,
          "credits": 1,
          "defense": 0.385
        },
        "defenseUsage": {
          "hpGenerated": 152987.74,
          "shieldGenerated": 406676.82000000024,
          "hpConsumed": 62308.69999999997,
          "shieldConsumed": 211428.3399999998,
          "shieldWasted": 39893.74999999999,
          "hpConsumptionRate": 0.40727904079111155,
          "shieldConsumptionRate": 0.5198927738246789,
          "combinedRate": 0.4891091192195547,
          "classification": "moderate",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.385,
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
              "n": 615,
              "wins": 607,
              "winRate": 0.9869918699186991,
              "winRateCI": [
                0.9745435749218357,
                0.9933941601185649
              ],
              "hpGenerated": 91916.99999999999,
              "shieldGenerated": 269609.7800000001,
              "hpConsumed": 31491.119999999988,
              "shieldConsumed": 123517.56000000003,
              "shieldWasted": 33304.679999999964,
              "hpConsumptionRate": 0.3426038708835144,
              "shieldConsumptionRate": 0.4581345676703567,
              "combinedRate": 0.42876126631614947,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 615,
                "credits": 615,
                "defense": 615
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
              "n": 385,
              "wins": 375,
              "winRate": 0.974025974025974,
              "winRateCI": [
                0.9528544970324188,
                0.9858314165195924
              ],
              "hpGenerated": 61070.740000000005,
              "shieldGenerated": 137067.04000000004,
              "hpConsumed": 30817.579999999998,
              "shieldConsumed": 87910.78,
              "shieldWasted": 6589.069999999995,
              "hpConsumptionRate": 0.5046210345576293,
              "shieldConsumptionRate": 0.6413706752549699,
              "combinedRate": 0.5992212085953521,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 385,
                "credits": 385,
                "defense": 385
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.4891091192195547,
        "hpConsumptionRate": 0.40727904079111155,
        "shieldConsumptionRate": 0.5198927738246789,
        "planningEnabled": false,
        "lowUse": false,
        "effective": false,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": false,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.013000000000000012,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D8，当前为 D6",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-10",
      "difficulty": 6,
      "disabledResources": [
        "removals",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": false,
        "credits": true,
        "defense": false
      },
      "label": "禁用移除、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 958,
        "winRate": 0.958,
        "winRateCI": [
          0.9437155747733968,
          0.9687791144538346
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.958,
        "avgHp": 70.98129000000003,
        "avgTurns": 34.118,
        "avgDamage": 19436.20138,
        "avgCoins": 329.972,
        "avgMerges": 5.562,
        "avgRemovals": 0,
        "avgRosterSize": 21.816,
        "avgItems": 4.961,
        "avgEssences": 2.998,
        "avgActivatedEssences": 2.998,
        "avgScore": 13691.766566690943,
        "avgSkips": 5.863,
        "skipsByPhase": {
          "recruit": 5822,
          "item": 39,
          "essence": 2
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
            "count": 42
          }
        ],
        "picks": {
          "recruit": {
            "1001": 376,
            "1002": 1359,
            "1003": 1278,
            "1004": 1467,
            "1005": 3689,
            "1006": 2160,
            "1008": 698,
            "1009": 275,
            "1013": 1161,
            "1101": 1164,
            "1102": 1341,
            "1103": 1131,
            "1104": 1253,
            "1105": 86,
            "1106": 2543,
            "1107": 2067,
            "1108": 1532,
            "1109": 711,
            "1201": 753,
            "1202": 226,
            "1203": 37,
            "1204": 475,
            "1205": 658,
            "1208": 856,
            "skip": 5822
          },
          "item": {
            "broken_clock": 215,
            "divination_candle": 689,
            "gold_coin": 420,
            "seal_stamp": 910,
            "harmony_wax": 137,
            "hunt_wax": 519,
            "cosmic_lotto": 613,
            "destruction_wax": 686,
            "doctor_robe": 176,
            "nihility_wax": 262,
            "insect_web": 10,
            "erudition_wax": 105,
            "rubert_gear": 156,
            "abundance_wax": 4,
            "faith_bond": 21,
            "skip": 39,
            "preservation_wax": 8,
            "dimension_dice": 6,
            "angel_debt": 4,
            "fortune_glue": 13,
            "chaos_trametes": 7
          },
          "essence": {
            "essence_destruction": 728,
            "essence_elation": 988,
            "essence_harmony": 528,
            "essence_nihility": 185,
            "essence_hunt": 531,
            "skip": 2,
            "essence_erudition": 35,
            "essence_abundance": 2,
            "essence_preservation": 1
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 18.866,
          "paidRerolls": 3.986,
          "removalsUsed": 0,
          "supplyPurchases": 14.282,
          "creditsSpent": 260.4,
          "healed": 90.40145000000003,
          "shieldGained": 384.08307000000053,
          "shieldBlocked": 182.25840999999986,
          "shieldDecayed": 35.97810000000001,
          "hpLost": 119.42016000000004,
          "freeRerolls": 14.88,
          "paidRerollCredits": 31.888,
          "supplyCredits": 228.512,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 14.282
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 0,
          "credits": 1,
          "defense": 0.581
        },
        "defenseUsage": {
          "hpGenerated": 190401.45,
          "shieldGenerated": 384083.07000000053,
          "hpConsumed": 119420.16000000003,
          "shieldConsumed": 182258.40999999986,
          "shieldWasted": 35978.10000000001,
          "hpConsumptionRate": 0.6272019462036661,
          "shieldConsumptionRate": 0.4745286221545761,
          "combinedRate": 0.5251291540457864,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.581,
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
              "n": 419,
              "wins": 417,
              "winRate": 0.9952267303102625,
              "winRateCI": [
                0.9827653018937343,
                0.9986900198181812
              ],
              "hpGenerated": 79800.63,
              "shieldGenerated": 174601.37,
              "hpConsumed": 43791.91000000001,
              "shieldConsumed": 69618.51000000005,
              "shieldWasted": 26805.19000000001,
              "hpConsumptionRate": 0.5487664696381471,
              "shieldConsumptionRate": 0.39872831467473624,
              "combinedRate": 0.44579217144519334,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 419,
                "removals": 0,
                "credits": 419,
                "defense": 419
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
              "n": 581,
              "wins": 541,
              "winRate": 0.9311531841652324,
              "winRateCI": [
                0.9076065138033914,
                0.9490359017501221
              ],
              "hpGenerated": 110600.81999999998,
              "shieldGenerated": 209481.7,
              "hpConsumed": 75628.25000000001,
              "shieldConsumed": 112639.89999999995,
              "shieldWasted": 9172.909999999996,
              "hpConsumptionRate": 0.6837946590269406,
              "shieldConsumptionRate": 0.5377075897321816,
              "combinedRate": 0.5881862902104118,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 581,
                "removals": 0,
                "credits": 581,
                "defense": 581
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 0,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5251291540457864,
        "hpConsumptionRate": 0.6272019462036661,
        "shieldConsumptionRate": 0.4745286221545761,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "removals"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": false,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": 0.01100000000000001,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D8，当前为 D6"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-11",
      "difficulty": 4,
      "disabledResources": [
        "rerolls",
        "removals",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": false,
        "credits": true,
        "defense": false
      },
      "label": "禁用重掷、移除、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 984,
        "winRate": 0.984,
        "winRateCI": [
          0.97416793978826,
          0.9901277579977227
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.984,
        "avgHp": 82.61045000000004,
        "avgTurns": 35.521,
        "avgDamage": 15965.049859999997,
        "avgCoins": 341.389,
        "avgMerges": 5.778,
        "avgRemovals": 0,
        "avgRosterSize": 22.381,
        "avgItems": 4.858,
        "avgEssences": 2.961,
        "avgActivatedEssences": 2.961,
        "avgScore": 13759.273909457905,
        "avgSkips": 6.358,
        "skipsByPhase": {
          "recruit": 6177,
          "item": 142,
          "essence": 39
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
            "count": 16
          }
        ],
        "picks": {
          "recruit": {
            "1001": 746,
            "1002": 1431,
            "1003": 1306,
            "1004": 1372,
            "1005": 2622,
            "1006": 1767,
            "1008": 1043,
            "1009": 732,
            "1013": 1612,
            "1101": 1264,
            "1102": 1312,
            "1103": 1735,
            "1104": 1316,
            "1105": 233,
            "1106": 2153,
            "1107": 1682,
            "1108": 1425,
            "1109": 961,
            "1201": 1185,
            "1202": 489,
            "1203": 77,
            "1204": 423,
            "1205": 470,
            "1208": 988,
            "skip": 6177
          },
          "item": {
            "cosmic_lotto": 470,
            "seal_stamp": 703,
            "abundance_wax": 40,
            "rubert_gear": 180,
            "doctor_robe": 172,
            "hunt_wax": 431,
            "gold_coin": 567,
            "harmony_wax": 249,
            "erudition_wax": 264,
            "destruction_wax": 453,
            "divination_candle": 446,
            "faith_bond": 145,
            "dimension_dice": 24,
            "broken_clock": 123,
            "nihility_wax": 314,
            "insect_web": 80,
            "skip": 142,
            "chaos_trametes": 40,
            "angel_debt": 50,
            "fortune_glue": 69,
            "preservation_wax": 38
          },
          "essence": {
            "essence_hunt": 537,
            "essence_harmony": 492,
            "essence_nihility": 300,
            "essence_elation": 749,
            "skip": 39,
            "essence_destruction": 675,
            "essence_erudition": 173,
            "essence_abundance": 19,
            "essence_preservation": 16
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 0,
          "supplyPurchases": 15.304,
          "creditsSpent": 244.864,
          "healed": 98.48994000000005,
          "shieldGained": 409.68711000000036,
          "shieldBlocked": 199.97748999999996,
          "shieldDecayed": 39.57378000000005,
          "hpLost": 115.87949000000002,
          "freeRerolls": 0,
          "paidRerollCredits": 0,
          "supplyCredits": 244.864,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 15.304
          }
        },
        "resourceUsageRates": {
          "rerolls": 0,
          "removals": 0,
          "credits": 1,
          "defense": 0.562
        },
        "defenseUsage": {
          "hpGenerated": 198489.94000000006,
          "shieldGenerated": 409687.11000000034,
          "hpConsumed": 115879.49000000002,
          "shieldConsumed": 199977.48999999996,
          "shieldWasted": 39573.78000000005,
          "hpConsumptionRate": 0.5838053555762069,
          "shieldConsumptionRate": 0.4881224844979863,
          "combinedRate": 0.5193503766707405,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.562,
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
              "n": 438,
              "wins": 434,
              "winRate": 0.9908675799086758,
              "winRateCI": [
                0.9767567446377996,
                0.9964430115546143
              ],
              "hpGenerated": 84910.53,
              "shieldGenerated": 192298.80000000002,
              "hpConsumed": 44951.79000000005,
              "shieldConsumed": 79143.61000000003,
              "shieldWasted": 30972.370000000006,
              "hpConsumptionRate": 0.5294018303736893,
              "shieldConsumptionRate": 0.4115658028027217,
              "combinedRate": 0.4476595358460701,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 438,
                "defense": 438
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 1,
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
              "n": 562,
              "wins": 550,
              "winRate": 0.9786476868327402,
              "winRateCI": [
                0.9630521908642529,
                0.9877441702247343
              ],
              "hpGenerated": 113579.40999999997,
              "shieldGenerated": 217388.31000000017,
              "hpConsumed": 70927.7,
              "shieldConsumed": 120833.88000000003,
              "shieldWasted": 8601.410000000003,
              "hpConsumptionRate": 0.6244767427476513,
              "shieldConsumptionRate": 0.5558435041884264,
              "combinedRate": 0.5793966251451952,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 562,
                "defense": 562
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 0,
                "credits": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5193503766707405,
        "hpConsumptionRate": 0.5838053555762069,
        "shieldConsumptionRate": 0.4881224844979863,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "removals"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": false,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.015000000000000013,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D6，当前为 D4",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-12",
      "difficulty": 6,
      "disabledResources": [
        "credits",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": true,
        "credits": false,
        "defense": false
      },
      "label": "禁用信用点消费、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 985,
        "winRate": 0.985,
        "winRateCI": [
          0.9753990230730932,
          0.9908890211959184
        ],
        "avgFloor": 11.998,
        "avgClearedFloors": 11.983,
        "avgHp": 85.44955000000003,
        "avgTurns": 35.832,
        "avgDamage": 19466.977519999997,
        "avgCoins": 334.413,
        "avgMerges": 4.25,
        "avgRemovals": 5.909,
        "avgRosterSize": 20.192,
        "avgItems": 4.91,
        "avgEssences": 2.987,
        "avgActivatedEssences": 2.985,
        "avgScore": 13763.050579587389,
        "avgSkips": 6.067,
        "skipsByPhase": {
          "recruit": 5964,
          "item": 90,
          "essence": 13
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
            "count": 2
          },
          {
            "floor": 12,
            "count": 13
          }
        ],
        "picks": {
          "recruit": {
            "1001": 890,
            "1002": 1227,
            "1003": 1306,
            "1004": 1434,
            "1005": 3634,
            "1006": 2138,
            "1008": 812,
            "1009": 360,
            "1013": 1204,
            "1101": 1436,
            "1102": 1480,
            "1103": 1348,
            "1104": 1282,
            "1105": 144,
            "1106": 2304,
            "1107": 1994,
            "1108": 1600,
            "1109": 873,
            "1201": 973,
            "1202": 266,
            "1203": 61,
            "1204": 523,
            "1205": 680,
            "1208": 899,
            "skip": 5964
          },
          "item": {
            "harmony_wax": 191,
            "seal_stamp": 815,
            "cosmic_lotto": 536,
            "destruction_wax": 551,
            "divination_candle": 596,
            "faith_bond": 52,
            "hunt_wax": 500,
            "dimension_dice": 24,
            "preservation_wax": 40,
            "gold_coin": 471,
            "skip": 90,
            "nihility_wax": 285,
            "rubert_gear": 201,
            "doctor_robe": 138,
            "broken_clock": 153,
            "erudition_wax": 199,
            "chaos_trametes": 36,
            "abundance_wax": 31,
            "insect_web": 45,
            "fortune_glue": 29,
            "angel_debt": 17
          },
          "essence": {
            "essence_destruction": 710,
            "essence_elation": 865,
            "essence_nihility": 290,
            "essence_hunt": 548,
            "essence_harmony": 480,
            "essence_abundance": 7,
            "essence_erudition": 82,
            "skip": 13,
            "essence_preservation": 5
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 14.68,
          "paidRerolls": 0,
          "removalsUsed": 5.909,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 56.52648999999993,
          "shieldGained": 386.3544299999997,
          "shieldBlocked": 201.36860000000001,
          "shieldDecayed": 37.702459999999995,
          "hpLost": 71.07693999999995,
          "freeRerolls": 14.68,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 1,
          "credits": 0,
          "defense": 0.452
        },
        "defenseUsage": {
          "hpGenerated": 156526.48999999993,
          "shieldGenerated": 386354.4299999997,
          "hpConsumed": 71076.93999999994,
          "shieldConsumed": 201368.6,
          "shieldWasted": 37702.45999999999,
          "hpConsumptionRate": 0.45408888936307185,
          "shieldConsumptionRate": 0.5212017369646833,
          "combinedRate": 0.5018513820673604,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.452,
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
              "n": 548,
              "wins": 547,
              "winRate": 0.9981751824817519,
              "winRateCI": [
                0.989736804569689,
                0.9996778022393433
              ],
              "hpGenerated": 83680.65,
              "shieldGenerated": 235696.67999999996,
              "hpConsumed": 31296.69999999999,
              "shieldConsumed": 105305.89999999995,
              "shieldWasted": 30663.259999999984,
              "hpConsumptionRate": 0.374001635981556,
              "shieldConsumptionRate": 0.4467856738584522,
              "combinedRate": 0.42771539232293027,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 548,
                "removals": 548,
                "credits": 0,
                "defense": 548
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
              "n": 452,
              "wins": 438,
              "winRate": 0.9690265486725663,
              "winRateCI": [
                0.9486862656828474,
                0.9814616877238675
              ],
              "hpGenerated": 72845.84,
              "shieldGenerated": 150657.75000000003,
              "hpConsumed": 39780.23999999998,
              "shieldConsumed": 96062.69999999994,
              "shieldWasted": 7039.199999999997,
              "hpConsumptionRate": 0.546088012712874,
              "shieldConsumptionRate": 0.6376220274098074,
              "combinedRate": 0.6077886265719485,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 452,
                "removals": 452,
                "credits": 0,
                "defense": 452
              },
              "resourceUsageRates": {
                "rerolls": 1,
                "removals": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5018513820673604,
        "hpConsumptionRate": 0.45408888936307185,
        "shieldConsumptionRate": 0.5212017369646833,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "credits"
      ],
      "actualMissingResourceCount": 1,
      "nominalMappingEligible": false,
      "nominalDifficulty": 8,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.016000000000000014,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D8，当前为 D6",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-13",
      "difficulty": 4,
      "disabledResources": [
        "rerolls",
        "credits",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": true,
        "credits": false,
        "defense": false
      },
      "label": "禁用重掷、信用点消费、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 993,
        "winRate": 0.993,
        "winRateCI": [
          0.9856216845342334,
          0.9966051315990092
        ],
        "avgFloor": 11.999,
        "avgClearedFloors": 11.992,
        "avgHp": 90.37528000000002,
        "avgTurns": 35.945,
        "avgDamage": 15969.118430000002,
        "avgCoins": 336.828,
        "avgMerges": 4.096,
        "avgRemovals": 6.005,
        "avgRosterSize": 20.343,
        "avgItems": 4.813,
        "avgEssences": 2.955,
        "avgActivatedEssences": 2.955,
        "avgScore": 13786.840890194722,
        "avgSkips": 6.346,
        "skipsByPhase": {
          "recruit": 6114,
          "item": 187,
          "essence": 45
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
            "count": 1
          },
          {
            "floor": 12,
            "count": 6
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1019,
            "1002": 1240,
            "1003": 1279,
            "1004": 1331,
            "1005": 2602,
            "1006": 1835,
            "1008": 1091,
            "1009": 819,
            "1013": 1525,
            "1101": 1428,
            "1102": 1421,
            "1103": 1767,
            "1104": 1344,
            "1105": 219,
            "1106": 1999,
            "1107": 1660,
            "1108": 1463,
            "1109": 1020,
            "1201": 1239,
            "1202": 475,
            "1203": 91,
            "1204": 465,
            "1205": 481,
            "1208": 1018,
            "skip": 6114
          },
          "item": {
            "cosmic_lotto": 455,
            "erudition_wax": 248,
            "divination_candle": 479,
            "gold_coin": 561,
            "nihility_wax": 266,
            "hunt_wax": 441,
            "abundance_wax": 50,
            "harmony_wax": 272,
            "seal_stamp": 720,
            "destruction_wax": 455,
            "fortune_glue": 78,
            "skip": 187,
            "dimension_dice": 34,
            "preservation_wax": 56,
            "broken_clock": 123,
            "rubert_gear": 219,
            "insect_web": 61,
            "angel_debt": 32,
            "chaos_trametes": 45,
            "doctor_robe": 151,
            "faith_bond": 67
          },
          "essence": {
            "essence_harmony": 480,
            "essence_hunt": 557,
            "essence_elation": 754,
            "essence_destruction": 668,
            "skip": 45,
            "essence_nihility": 304,
            "essence_erudition": 166,
            "essence_preservation": 11,
            "essence_abundance": 15
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 0,
          "paidRerolls": 0,
          "removalsUsed": 6.005,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 53.787899999999986,
          "shieldGained": 399.29714,
          "shieldBlocked": 203.6690899999999,
          "shieldDecayed": 39.18108,
          "hpLost": 63.41262000000001,
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
          "removals": 1,
          "credits": 0,
          "defense": 0.358
        },
        "defenseUsage": {
          "hpGenerated": 153787.9,
          "shieldGenerated": 399297.14,
          "hpConsumed": 63412.62000000001,
          "shieldConsumed": 203669.0899999999,
          "shieldWasted": 39181.08,
          "hpConsumptionRate": 0.4123381618449827,
          "shieldConsumptionRate": 0.5100689927305763,
          "combinedRate": 0.48289447496175253,
          "classification": "moderate",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.358,
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
              "n": 642,
              "wins": 642,
              "winRate": 1,
              "winRateCI": [
                0.9940520095632935,
                1
              ],
              "hpGenerated": 96587.32,
              "shieldGenerated": 279183.79999999964,
              "hpConsumed": 33430.05,
              "shieldConsumed": 125518.9299999999,
              "shieldWasted": 34601.76,
              "hpConsumptionRate": 0.3461122018915112,
              "shieldConsumptionRate": 0.4495924548630689,
              "combinedRate": 0.4229941353662306,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 642,
                "credits": 0,
                "defense": 642
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
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
              "n": 358,
              "wins": 351,
              "winRate": 0.9804469273743017,
              "winRateCI": [
                0.9601956937304009,
                0.9904969138031786
              ],
              "hpGenerated": 57200.58000000001,
              "shieldGenerated": 120113.34000000004,
              "hpConsumed": 29982.570000000007,
              "shieldConsumed": 78150.16,
              "shieldWasted": 4579.320000000001,
              "hpConsumptionRate": 0.5241654892310533,
              "shieldConsumptionRate": 0.6506368068692452,
              "combinedRate": 0.6098377950247785,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 358,
                "credits": 0,
                "defense": 358
              },
              "resourceUsageRates": {
                "rerolls": 0,
                "removals": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.48289447496175253,
        "hpConsumptionRate": 0.4123381618449827,
        "shieldConsumptionRate": 0.5100689927305763,
        "planningEnabled": false,
        "lowUse": false,
        "effective": false,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "credits"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": false,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.02400000000000002,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D6，当前为 D4",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-14",
      "difficulty": 4,
      "disabledResources": [
        "removals",
        "credits",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": true,
        "removals": false,
        "credits": false,
        "defense": false
      },
      "label": "禁用移除、信用点消费、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 970,
        "winRate": 0.97,
        "winRateCI": [
          0.9574965858524128,
          0.9789062611711653
        ],
        "avgFloor": 11.996,
        "avgClearedFloors": 11.966,
        "avgHp": 73.74022999999998,
        "avgTurns": 33.7,
        "avgDamage": 15927.783730000001,
        "avgCoins": 332.955,
        "avgMerges": 5.453,
        "avgRemovals": 0,
        "avgRosterSize": 21.908,
        "avgItems": 4.894,
        "avgEssences": 2.984,
        "avgActivatedEssences": 2.984,
        "avgScore": 13722.118846571555,
        "avgSkips": 5.656,
        "skipsByPhase": {
          "recruit": 5536,
          "item": 104,
          "essence": 16
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
            "count": 2
          },
          {
            "floor": 11,
            "count": 0
          },
          {
            "floor": 12,
            "count": 28
          }
        ],
        "picks": {
          "recruit": {
            "1001": 410,
            "1002": 1289,
            "1003": 1261,
            "1004": 1391,
            "1005": 3513,
            "1006": 2095,
            "1008": 730,
            "1009": 276,
            "1013": 1247,
            "1101": 1221,
            "1102": 1287,
            "1103": 1176,
            "1104": 1267,
            "1105": 79,
            "1106": 2461,
            "1107": 1993,
            "1108": 1566,
            "1109": 743,
            "1201": 810,
            "1202": 243,
            "1203": 36,
            "1204": 516,
            "1205": 657,
            "1208": 897,
            "skip": 5536
          },
          "item": {
            "divination_candle": 597,
            "gold_coin": 464,
            "erudition_wax": 182,
            "broken_clock": 162,
            "destruction_wax": 581,
            "hunt_wax": 465,
            "cosmic_lotto": 529,
            "seal_stamp": 848,
            "angel_debt": 25,
            "doctor_robe": 157,
            "rubert_gear": 205,
            "nihility_wax": 277,
            "preservation_wax": 29,
            "abundance_wax": 26,
            "insect_web": 42,
            "chaos_trametes": 39,
            "harmony_wax": 172,
            "dimension_dice": 18,
            "skip": 104,
            "fortune_glue": 39,
            "faith_bond": 37
          },
          "essence": {
            "essence_elation": 878,
            "essence_hunt": 505,
            "essence_destruction": 724,
            "essence_harmony": 513,
            "essence_nihility": 278,
            "essence_erudition": 70,
            "skip": 16,
            "essence_abundance": 9,
            "essence_preservation": 7
          }
        },
        "avgUsage": {
          "initialHp": 100,
          "initialShield": 0,
          "rerollsUsed": 14.81,
          "paidRerolls": 0,
          "removalsUsed": 0,
          "supplyPurchases": 0,
          "creditsSpent": 0,
          "healed": 92.10445999999995,
          "shieldGained": 388.4002000000001,
          "shieldBlocked": 185.02899000000014,
          "shieldDecayed": 36.15471000000002,
          "hpLost": 118.36422999999999,
          "freeRerolls": 14.81,
          "paidRerollCredits": 0,
          "supplyCredits": 0,
          "supplyKinds": {
            "repair": 0,
            "barrier": 0,
            "overclock": 0
          }
        },
        "resourceUsageRates": {
          "rerolls": 1,
          "removals": 0,
          "credits": 0,
          "defense": 0.575
        },
        "defenseUsage": {
          "hpGenerated": 192104.45999999996,
          "shieldGenerated": 388400.20000000007,
          "hpConsumed": 118364.23,
          "shieldConsumed": 185028.99000000014,
          "shieldWasted": 36154.71000000002,
          "hpConsumptionRate": 0.6161451431164067,
          "shieldConsumptionRate": 0.4763874735388913,
          "combinedRate": 0.5226370103557827,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.575,
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
              "n": 425,
              "wins": 425,
              "winRate": 1,
              "winRateCI": [
                0.9910422401060335,
                1
              ],
              "hpGenerated": 80919.21999999997,
              "shieldGenerated": 180014.25000000006,
              "hpConsumed": 44236.019999999975,
              "shieldConsumed": 71451.1399999999,
              "shieldWasted": 29391.13,
              "hpConsumptionRate": 0.5466688878118201,
              "shieldConsumptionRate": 0.3969193549955066,
              "combinedRate": 0.44335883779110385,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 425,
                "removals": 0,
                "credits": 0,
                "defense": 425
              },
              "resourceUsageRates": {
                "rerolls": 1,
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
              "n": 575,
              "wins": 545,
              "winRate": 0.9478260869565217,
              "winRateCI": [
                0.9264960678075149,
                0.9632121453001607
              ],
              "hpGenerated": 111185.23999999999,
              "shieldGenerated": 208385.95,
              "hpConsumed": 74128.21,
              "shieldConsumed": 113577.84999999998,
              "shieldWasted": 6763.580000000004,
              "hpConsumptionRate": 0.6667090883646067,
              "shieldConsumptionRate": 0.5450360257013487,
              "combinedRate": 0.5873685296850445,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 575,
                "removals": 0,
                "credits": 0,
                "defense": 575
              },
              "resourceUsageRates": {
                "rerolls": 1,
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
      "actualDefensiveUse": {
        "combinedRate": 0.5226370103557827,
        "hpConsumptionRate": 0.6161451431164067,
        "shieldConsumptionRate": 0.4763874735388913,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "removals",
        "credits"
      ],
      "actualMissingResourceCount": 2,
      "nominalMappingEligible": false,
      "nominalDifficulty": 6,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.0010000000000000009,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D6，当前为 D4"
      ],
      "targetPassed": false
    },
    {
      "id": "nominal-15",
      "difficulty": 2,
      "disabledResources": [
        "rerolls",
        "removals",
        "credits",
        "defense"
      ],
      "resourceAccess": {
        "rerolls": false,
        "removals": false,
        "credits": false,
        "defense": false
      },
      "label": "禁用重掷、移除、信用点消费、防御规划（自然效果保留）",
      "role": "nominal",
      "summary": {
        "runs": 1000,
        "wins": 990,
        "winRate": 0.99,
        "winRateCI": [
          0.9816905311296853,
          0.9945592455544707
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.99,
        "avgHp": 83.65329000000006,
        "avgTurns": 34.015,
        "avgDamage": 13094.17485,
        "avgCoins": 337.257,
        "avgMerges": 5.473,
        "avgRemovals": 0,
        "avgRosterSize": 22.144,
        "avgItems": 4.817,
        "avgEssences": 2.954,
        "avgActivatedEssences": 2.954,
        "avgScore": 13781.36454825598,
        "avgSkips": 5.734,
        "skipsByPhase": {
          "recruit": 5505,
          "item": 183,
          "essence": 46
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
            "count": 10
          }
        ],
        "picks": {
          "recruit": {
            "1001": 782,
            "1002": 1424,
            "1003": 1230,
            "1004": 1317,
            "1005": 2493,
            "1006": 1755,
            "1008": 966,
            "1009": 742,
            "1013": 1550,
            "1101": 1271,
            "1102": 1295,
            "1103": 1621,
            "1104": 1271,
            "1105": 212,
            "1106": 2124,
            "1107": 1618,
            "1108": 1439,
            "1109": 914,
            "1201": 1124,
            "1202": 438,
            "1203": 73,
            "1204": 444,
            "1205": 475,
            "1208": 932,
            "skip": 5505
          },
          "item": {
            "cosmic_lotto": 410,
            "seal_stamp": 701,
            "abundance_wax": 44,
            "gold_coin": 560,
            "hunt_wax": 456,
            "harmony_wax": 260,
            "broken_clock": 123,
            "erudition_wax": 254,
            "destruction_wax": 470,
            "skip": 183,
            "nihility_wax": 295,
            "divination_candle": 471,
            "faith_bond": 72,
            "chaos_trametes": 59,
            "doctor_robe": 167,
            "insect_web": 74,
            "preservation_wax": 55,
            "rubert_gear": 201,
            "fortune_glue": 67,
            "angel_debt": 42,
            "dimension_dice": 36
          },
          "essence": {
            "essence_hunt": 525,
            "essence_harmony": 503,
            "essence_nihility": 304,
            "essence_elation": 738,
            "essence_destruction": 677,
            "essence_erudition": 176,
            "essence_preservation": 18,
            "skip": 46,
            "essence_abundance": 13
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
          "healed": 94.05287000000008,
          "shieldGained": 396.3148800000002,
          "shieldBlocked": 188.90842999999998,
          "shieldDecayed": 38.52622999999998,
          "hpLost": 110.39958000000006,
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
          "defense": 0.48
        },
        "defenseUsage": {
          "hpGenerated": 194052.87000000008,
          "shieldGenerated": 396314.8800000002,
          "hpConsumed": 110399.58000000006,
          "shieldConsumed": 188908.43,
          "shieldWasted": 38526.229999999974,
          "hpConsumptionRate": 0.5689149560117303,
          "shieldConsumptionRate": 0.47666247101294784,
          "combinedRate": 0.5069857050965266,
          "classification": "effective",
          "thresholds": {
            "low": 0.2,
            "effective": 0.5
          },
          "method": "aggregate-consumed-over-generated",
          "lowRate": 0,
          "effectiveRate": 0.48,
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
              "n": 520,
              "wins": 520,
              "winRate": 1,
              "winRateCI": [
                0.9926667529726603,
                1
              ],
              "hpGenerated": 99410.34999999998,
              "shieldGenerated": 220692,
              "hpConsumed": 51689.37999999998,
              "shieldConsumed": 90369.01000000005,
              "shieldWasted": 31720.829999999998,
              "hpConsumptionRate": 0.5199597426223728,
              "shieldConsumptionRate": 0.40948022583510074,
              "combinedRate": 0.44379052512422995,
              "classification": "moderate",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 520
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
              "n": 480,
              "wins": 470,
              "winRate": 0.9791666666666666,
              "winRateCI": [
                0.9620795037783362,
                0.9886451429296891
              ],
              "hpGenerated": 94642.51999999999,
              "shieldGenerated": 175622.87999999995,
              "hpConsumed": 58710.2,
              "shieldConsumed": 98539.41999999991,
              "shieldWasted": 6805.4,
              "hpConsumptionRate": 0.6203363984813591,
              "shieldConsumptionRate": 0.5610853210014546,
              "combinedRate": 0.5818340786500972,
              "classification": "effective",
              "thresholds": {
                "low": 0.2,
                "effective": 0.5
              },
              "resourceUsageCounts": {
                "rerolls": 0,
                "removals": 0,
                "credits": 0,
                "defense": 480
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
      "actualDefensiveUse": {
        "combinedRate": 0.5069857050965266,
        "hpConsumptionRate": 0.5689149560117303,
        "shieldConsumptionRate": 0.47666247101294784,
        "planningEnabled": false,
        "lowUse": false,
        "effective": true,
        "thresholds": {
          "low": 0.2,
          "effective": 0.5
        }
      },
      "actualMissingResources": [
        "rerolls",
        "removals",
        "credits"
      ],
      "actualMissingResourceCount": 3,
      "nominalMappingEligible": false,
      "nominalDifficulty": 4,
      "resourceGatesValid": true,
      "fullResourcesUsed": true,
      "isAblation": false,
      "verifiable": false,
      "winRateDrop": -0.02100000000000002,
      "passed": false,
      "reasons": [
        "实际缺失资源与开关不一致，不能验证名义难度映射",
        "实际缺资源对应 D4，当前为 D2",
        "通关率不在目标范围"
      ],
      "targetPassed": false
    }
  ],
  "target": {
    "preferred": 0.95,
    "min": 0.9,
    "max": 0.98,
    "minimumSingleResourceDrop": 0.05,
    "fullDefenseMin": 0.5,
    "passed": false
  },
  "validation": {
    "nominal": [
      {
        "id": "full-10",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 10,
        "actualMissingResourceCount": 0,
        "reasons": []
      },
      {
        "id": "nominal-1",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": []
      },
      {
        "id": "nominal-2",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": []
      },
      {
        "id": "nominal-3",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": []
      },
      {
        "id": "nominal-4",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": []
      },
      {
        "id": "nominal-5",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": []
      },
      {
        "id": "nominal-6",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": []
      },
      {
        "id": "nominal-7",
        "passed": true,
        "verifiable": true,
        "nominalMappingEligible": true,
        "nominalDifficulty": 4,
        "actualMissingResourceCount": 3,
        "reasons": []
      },
      {
        "id": "nominal-8",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 10,
        "actualMissingResourceCount": 0,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D10，当前为 D8",
          "通关率不在目标范围"
        ]
      },
      {
        "id": "nominal-9",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D8，当前为 D6",
          "通关率不在目标范围"
        ]
      },
      {
        "id": "nominal-10",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D8，当前为 D6"
        ]
      },
      {
        "id": "nominal-11",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D6，当前为 D4",
          "通关率不在目标范围"
        ]
      },
      {
        "id": "nominal-12",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 8,
        "actualMissingResourceCount": 1,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D8，当前为 D6",
          "通关率不在目标范围"
        ]
      },
      {
        "id": "nominal-13",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D6，当前为 D4",
          "通关率不在目标范围"
        ]
      },
      {
        "id": "nominal-14",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 6,
        "actualMissingResourceCount": 2,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D6，当前为 D4"
        ]
      },
      {
        "id": "nominal-15",
        "passed": false,
        "verifiable": false,
        "nominalMappingEligible": false,
        "nominalDifficulty": 4,
        "actualMissingResourceCount": 3,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "实际缺资源对应 D4，当前为 D2",
          "通关率不在目标范围"
        ]
      }
    ],
    "singleD10": [
      {
        "id": "ablation-1-10",
        "resource": "rerolls",
        "drop": 0.257,
        "passed": true,
        "verifiable": true,
        "reasons": []
      },
      {
        "id": "ablation-2-10",
        "resource": "removals",
        "drop": 0.16699999999999993,
        "passed": true,
        "verifiable": true,
        "reasons": []
      },
      {
        "id": "ablation-4-10",
        "resource": "credits",
        "drop": 0.08899999999999997,
        "passed": true,
        "verifiable": true,
        "reasons": []
      },
      {
        "id": "ablation-8-10",
        "resource": "defense",
        "drop": 0.027000000000000024,
        "passed": false,
        "verifiable": false,
        "reasons": [
          "实际缺失资源与开关不一致，不能验证名义难度映射",
          "关闭防御规划保留自然生命与护盾，不能作为彻底移除防御的消融或要求固定胜率下降"
        ]
      }
    ]
  },
  "pairedSeeds": 1000,
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
  "elapsedMs": 710143.5246
};
