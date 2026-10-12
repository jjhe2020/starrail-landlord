// Saved independent benchmark; not a prediction for the live run.
export const BALANCE_REFERENCE = {
  "version": 2,
  "seed": "skip-policy-release-v3-20261012-4f913b",
  "rules": {
    "version": "difficulty-v2",
    "combatLateHealthMultiplier": 1.5,
    "classicLateRentMultiplier": 1.28
  },
  "policyVersion": "reward-actions-v2",
  "actionPolicies": {
    "ai": {
      "selection": "weighted-choose-or-skip",
      "rewardActions": [
        "choose",
        "skip"
      ],
      "removals": "recommended-over-20"
    },
    "uniform": {
      "selection": "uniform-choose-only",
      "rewardActions": [
        "choose"
      ],
      "removals": "none"
    }
  },
  "profileName": "context-v2-skip",
  "profile": {
    "version": "context-v2-skip",
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
      "ai": {
        "runs": 1000,
        "wins": 948,
        "winRate": 0.948,
        "winRateCI": [
          0.93244426068072,
          0.9601269637162226
        ],
        "avgFloor": 11.999,
        "avgClearedFloors": 11.947,
        "avgHp": 91.71039999999999,
        "avgTurns": 42.977,
        "avgDamage": 26506.172059999994,
        "avgCoins": 338.424,
        "avgMerges": 4.813,
        "avgRemovals": 7.153,
        "avgRosterSize": 20.298,
        "avgItems": 4.846,
        "avgEssences": 2.974,
        "avgActivatedEssences": 2.973,
        "avgScore": 13671.236656024244,
        "avgSkips": 10.826,
        "skipsByPhase": {
          "recruit": 10646,
          "item": 154,
          "essence": 26
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
            "count": 51
          }
        ],
        "picks": {
          "recruit": {
            "1001": 693,
            "1002": 1296,
            "1003": 1434,
            "1004": 1468,
            "1005": 3283,
            "1006": 2062,
            "1008": 1082,
            "1009": 805,
            "1013": 1646,
            "1101": 1702,
            "1102": 1467,
            "1103": 1967,
            "1104": 1453,
            "1105": 268,
            "1106": 2253,
            "1107": 1731,
            "1108": 1627,
            "1109": 979,
            "1201": 1233,
            "1202": 546,
            "1203": 109,
            "1204": 505,
            "1205": 583,
            "1208": 1139,
            "skip": 10646
          },
          "item": {
            "hunt_wax": 441,
            "divination_candle": 464,
            "fortune_glue": 59,
            "broken_clock": 129,
            "seal_stamp": 700,
            "gold_coin": 575,
            "cosmic_lotto": 429,
            "destruction_wax": 471,
            "rubert_gear": 204,
            "erudition_wax": 251,
            "skip": 154,
            "harmony_wax": 260,
            "doctor_robe": 180,
            "angel_debt": 41,
            "nihility_wax": 308,
            "abundance_wax": 31,
            "chaos_trametes": 62,
            "faith_bond": 81,
            "dimension_dice": 32,
            "preservation_wax": 48,
            "insect_web": 80
          },
          "essence": {
            "essence_destruction": 678,
            "essence_hunt": 549,
            "essence_nihility": 299,
            "essence_harmony": 543,
            "essence_elation": 720,
            "essence_erudition": 165,
            "essence_preservation": 9,
            "skip": 26,
            "essence_abundance": 11
          }
        },
        "incomplete": 0
      },
      "uniform": {
        "runs": 1000,
        "wins": 13,
        "winRate": 0.013,
        "winRateCI": [
          0.0076128203893510256,
          0.022114442375579666
        ],
        "avgFloor": 10.57,
        "avgClearedFloors": 9.583,
        "avgHp": 110.082,
        "avgTurns": 45.4,
        "avgDamage": 15497.208920000026,
        "avgCoins": 269.659,
        "avgMerges": 9.242,
        "avgRemovals": 0,
        "avgRosterSize": 31.627,
        "avgItems": 4.538,
        "avgEssences": 2.873,
        "avgActivatedEssences": 2.828,
        "avgScore": 10232.692579385372,
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
            "count": 20
          },
          {
            "floor": 9,
            "count": 107
          },
          {
            "floor": 10,
            "count": 315
          },
          {
            "floor": 11,
            "count": 399
          },
          {
            "floor": 12,
            "count": 146
          }
        ],
        "picks": {
          "recruit": {
            "1001": 2695,
            "1002": 2718,
            "1003": 1389,
            "1004": 1343,
            "1005": 1391,
            "1006": 1364,
            "1008": 2755,
            "1009": 2670,
            "1013": 2786,
            "1101": 1587,
            "1102": 1392,
            "1103": 2759,
            "1104": 1550,
            "1105": 2781,
            "1106": 1603,
            "1107": 1349,
            "1108": 1652,
            "1109": 2759,
            "1201": 2769,
            "1202": 1642,
            "1203": 1408,
            "1204": 264,
            "1205": 309,
            "1208": 1465
          },
          "item": {
            "angel_debt": 178,
            "dimension_dice": 189,
            "destruction_wax": 213,
            "abundance_wax": 215,
            "faith_bond": 343,
            "gold_coin": 355,
            "nihility_wax": 232,
            "rubert_gear": 199,
            "insect_web": 349,
            "cosmic_lotto": 224,
            "preservation_wax": 239,
            "chaos_trametes": 226,
            "doctor_robe": 172,
            "harmony_wax": 173,
            "erudition_wax": 243,
            "seal_stamp": 341,
            "hunt_wax": 238,
            "divination_candle": 166,
            "fortune_glue": 206,
            "broken_clock": 37
          },
          "essence": {
            "essence_abundance": 363,
            "essence_nihility": 347,
            "essence_erudition": 355,
            "essence_harmony": 372,
            "essence_hunt": 383,
            "essence_destruction": 355,
            "essence_elation": 314,
            "essence_preservation": 384
          }
        },
        "incomplete": 0
      },
      "difference": {
        "winRate": 0.935,
        "avgFloor": 1.429,
        "pairedSeeds": 1000,
        "outcomes": {
          "aiOnlyWins": 936,
          "uniformOnlyWins": 1,
          "bothWin": 12,
          "bothLoss": 51
        }
      }
    },
    {
      "mode": "classic",
      "ai": {
        "runs": 1000,
        "wins": 937,
        "winRate": 0.937,
        "winRateCI": [
          0.920205076295354,
          0.9504503367882711
        ],
        "avgFloor": 11.995,
        "avgClearedFloors": 11.932,
        "avgHp": 101.435,
        "avgTurns": 76.094,
        "avgDamage": 0,
        "avgCoins": 28305.886,
        "avgMerges": 10.624,
        "avgRemovals": 8.216,
        "avgRosterSize": 22.539,
        "avgItems": 4.776,
        "avgEssences": 2.93,
        "avgActivatedEssences": 2.904,
        "avgScore": 13717.090972394542,
        "avgSkips": 29.262,
        "skipsByPhase": {
          "recruit": 28968,
          "item": 224,
          "essence": 70
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
            "count": 5
          },
          {
            "floor": 12,
            "count": 58
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1411,
            "1002": 2039,
            "1003": 1519,
            "1004": 3275,
            "1005": 4545,
            "1006": 2636,
            "1008": 1366,
            "1009": 2498,
            "1013": 1484,
            "1101": 4039,
            "1102": 1630,
            "1103": 1654,
            "1104": 1367,
            "1105": 1174,
            "1106": 2643,
            "1107": 2110,
            "1108": 2630,
            "1109": 1424,
            "1201": 1449,
            "1202": 1775,
            "1203": 1178,
            "1204": 399,
            "1205": 749,
            "1208": 1132,
            "skip": 28968
          },
          "item": {
            "doctor_robe": 295,
            "seal_stamp": 653,
            "faith_bond": 138,
            "erudition_wax": 136,
            "hunt_wax": 455,
            "rubert_gear": 140,
            "destruction_wax": 420,
            "gold_coin": 458,
            "harmony_wax": 317,
            "divination_candle": 473,
            "cosmic_lotto": 432,
            "dimension_dice": 45,
            "nihility_wax": 255,
            "chaos_trametes": 76,
            "skip": 224,
            "insect_web": 104,
            "fortune_glue": 80,
            "broken_clock": 129,
            "angel_debt": 56,
            "preservation_wax": 50,
            "abundance_wax": 64
          },
          "essence": {
            "essence_erudition": 69,
            "essence_destruction": 550,
            "essence_hunt": 651,
            "skip": 70,
            "essence_elation": 742,
            "essence_preservation": 37,
            "essence_harmony": 548,
            "essence_nihility": 295,
            "essence_abundance": 38
          }
        },
        "incomplete": 0
      },
      "uniform": {
        "runs": 1000,
        "wins": 7,
        "winRate": 0.007,
        "winRateCI": [
          0.0033948684009907646,
          0.014378315465766588
        ],
        "avgFloor": 10.471,
        "avgClearedFloors": 9.478,
        "avgHp": 110.195,
        "avgTurns": 63.2,
        "avgDamage": 0,
        "avgCoins": 10672.035,
        "avgMerges": 15.144,
        "avgRemovals": 0,
        "avgRosterSize": 37.711,
        "avgItems": 4.485,
        "avgEssences": 2.909,
        "avgActivatedEssences": 2.623,
        "avgScore": 10057.027551434185,
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
            "count": 0
          },
          {
            "floor": 9,
            "count": 91
          },
          {
            "floor": 10,
            "count": 424
          },
          {
            "floor": 11,
            "count": 408
          },
          {
            "floor": 12,
            "count": 70
          }
        ],
        "picks": {
          "recruit": {
            "1001": 3847,
            "1002": 3863,
            "1003": 1832,
            "1004": 1961,
            "1005": 1899,
            "1006": 1818,
            "1008": 3864,
            "1009": 3849,
            "1013": 3850,
            "1101": 2328,
            "1102": 1979,
            "1103": 3831,
            "1104": 2338,
            "1105": 3907,
            "1106": 2322,
            "1107": 1800,
            "1108": 2294,
            "1109": 3884,
            "1201": 3865,
            "1202": 2304,
            "1203": 1912,
            "1204": 372,
            "1205": 386,
            "1208": 1895
          },
          "item": {
            "dimension_dice": 181,
            "seal_stamp": 334,
            "hunt_wax": 215,
            "harmony_wax": 201,
            "insect_web": 334,
            "destruction_wax": 208,
            "nihility_wax": 251,
            "doctor_robe": 180,
            "gold_coin": 366,
            "divination_candle": 166,
            "angel_debt": 173,
            "chaos_trametes": 211,
            "fortune_glue": 228,
            "erudition_wax": 223,
            "faith_bond": 349,
            "cosmic_lotto": 213,
            "preservation_wax": 214,
            "abundance_wax": 230,
            "rubert_gear": 180,
            "broken_clock": 28
          },
          "essence": {
            "essence_destruction": 334,
            "essence_nihility": 358,
            "essence_preservation": 359,
            "essence_elation": 388,
            "essence_harmony": 357,
            "essence_abundance": 374,
            "essence_hunt": 355,
            "essence_erudition": 384
          }
        },
        "incomplete": 0
      },
      "difference": {
        "winRate": 0.93,
        "avgFloor": 1.524,
        "pairedSeeds": 1000,
        "outcomes": {
          "aiOnlyWins": 932,
          "uniformOnlyWins": 2,
          "bothWin": 5,
          "bothLoss": 61
        }
      }
    }
  ],
  "elapsedMs": 272162.8569,
  "calibrationTarget": {
    "min": 0.9,
    "max": 0.98,
    "preferred": 0.95,
    "passed": true
  }
};
