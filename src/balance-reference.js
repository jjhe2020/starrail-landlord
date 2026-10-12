// Saved independent benchmark; not a prediction for the live run.
export const BALANCE_REFERENCE = {
  "version": 1,
  "seed": "difficulty-release-v2-20261012-7c924e",
  "rules": {
    "version": "difficulty-v2",
    "combatLateHealthMultiplier": 1.5,
    "classicLateRentMultiplier": 1.28
  },
  "profileName": "context-v1",
  "profile": {
    "version": "context-v1",
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
        "wins": 967,
        "winRate": 0.967,
        "winRateCI": [
          0.9540187355329184,
          0.9764070720415732
        ],
        "avgFloor": 12,
        "avgClearedFloors": 11.967,
        "avgHp": 95.276,
        "avgTurns": 42.311,
        "avgDamage": 26557.056009999997,
        "avgCoins": 339.828,
        "avgMerges": 7.407,
        "avgRemovals": 8.216,
        "avgRosterSize": 24.088,
        "avgItems": 5,
        "avgEssences": 3,
        "avgActivatedEssences": 2.999,
        "avgScore": 13721.515561262193,
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
            "count": 33
          }
        ],
        "picks": {
          "recruit": {
            "1001": 1148,
            "1002": 1676,
            "1003": 1977,
            "1004": 2227,
            "1005": 3277,
            "1006": 2554,
            "1008": 1406,
            "1009": 1192,
            "1013": 2378,
            "1101": 2319,
            "1102": 1992,
            "1103": 2736,
            "1104": 1898,
            "1105": 409,
            "1106": 2929,
            "1107": 2258,
            "1108": 2254,
            "1109": 1295,
            "1201": 1751,
            "1202": 706,
            "1203": 181,
            "1204": 565,
            "1205": 599,
            "1208": 1584
          },
          "item": {
            "seal_stamp": 739,
            "nihility_wax": 300,
            "cosmic_lotto": 437,
            "erudition_wax": 242,
            "broken_clock": 117,
            "hunt_wax": 480,
            "harmony_wax": 241,
            "faith_bond": 83,
            "rubert_gear": 218,
            "gold_coin": 521,
            "divination_candle": 481,
            "fortune_glue": 80,
            "abundance_wax": 53,
            "angel_debt": 49,
            "destruction_wax": 471,
            "doctor_robe": 198,
            "insect_web": 93,
            "chaos_trametes": 78,
            "preservation_wax": 66,
            "dimension_dice": 53
          },
          "essence": {
            "essence_destruction": 663,
            "essence_elation": 737,
            "essence_hunt": 592,
            "essence_harmony": 504,
            "essence_nihility": 330,
            "essence_erudition": 145,
            "essence_abundance": 13,
            "essence_preservation": 16
          }
        },
        "incomplete": 0
      },
      "uniform": {
        "runs": 1000,
        "wins": 11,
        "winRate": 0.011,
        "winRateCI": [
          0.006153174098086638,
          0.019589395700786275
        ],
        "avgFloor": 10.626,
        "avgClearedFloors": 9.637,
        "avgHp": 110.205,
        "avgTurns": 45.681,
        "avgDamage": 15858.224890000014,
        "avgCoins": 273.163,
        "avgMerges": 9.341,
        "avgRemovals": 0,
        "avgRosterSize": 31.627,
        "avgItems": 4.546,
        "avgEssences": 2.894,
        "avgActivatedEssences": 2.846,
        "avgScore": 10283.75270852419,
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
            "count": 21
          },
          {
            "floor": 9,
            "count": 85
          },
          {
            "floor": 10,
            "count": 327
          },
          {
            "floor": 11,
            "count": 381
          },
          {
            "floor": 12,
            "count": 175
          }
        ],
        "picks": {
          "recruit": {
            "1001": 2801,
            "1002": 2842,
            "1003": 1423,
            "1004": 1398,
            "1005": 1392,
            "1006": 1385,
            "1008": 2726,
            "1009": 2762,
            "1013": 2750,
            "1101": 1647,
            "1102": 1433,
            "1103": 2728,
            "1104": 1644,
            "1105": 2671,
            "1106": 1650,
            "1107": 1415,
            "1108": 1599,
            "1109": 2688,
            "1201": 2711,
            "1202": 1611,
            "1203": 1406,
            "1204": 304,
            "1205": 297,
            "1208": 1398
          },
          "item": {
            "preservation_wax": 215,
            "seal_stamp": 348,
            "hunt_wax": 233,
            "gold_coin": 334,
            "nihility_wax": 193,
            "destruction_wax": 234,
            "doctor_robe": 202,
            "cosmic_lotto": 228,
            "divination_candle": 178,
            "insect_web": 320,
            "abundance_wax": 208,
            "dimension_dice": 195,
            "chaos_trametes": 240,
            "harmony_wax": 185,
            "faith_bond": 374,
            "fortune_glue": 243,
            "rubert_gear": 167,
            "broken_clock": 36,
            "erudition_wax": 232,
            "angel_debt": 181
          },
          "essence": {
            "essence_elation": 352,
            "essence_abundance": 365,
            "essence_destruction": 355,
            "essence_preservation": 384,
            "essence_nihility": 379,
            "essence_erudition": 349,
            "essence_harmony": 344,
            "essence_hunt": 366
          }
        },
        "incomplete": 0
      },
      "difference": {
        "winRate": 0.956,
        "avgFloor": 1.374,
        "pairedSeeds": 1000,
        "outcomes": {
          "aiOnlyWins": 956,
          "uniformOnlyWins": 0,
          "bothWin": 11,
          "bothLoss": 33
        }
      }
    },
    {
      "mode": "classic",
      "ai": {
        "runs": 1000,
        "wins": 946,
        "winRate": 0.946,
        "winRateCI": [
          0.9302078451539475,
          0.9583786862769372
        ],
        "avgFloor": 11.996,
        "avgClearedFloors": 11.942,
        "avgHp": 101.915,
        "avgTurns": 76.191,
        "avgDamage": 0,
        "avgCoins": 27353.374,
        "avgMerges": 19.001,
        "avgRemovals": 8.429,
        "avgRosterSize": 34.905,
        "avgItems": 5,
        "avgEssences": 3,
        "avgActivatedEssences": 2.964,
        "avgScore": 13738.329151925063,
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
            "count": 4
          },
          {
            "floor": 12,
            "count": 50
          }
        ],
        "picks": {
          "recruit": {
            "1001": 2890,
            "1002": 3199,
            "1003": 2755,
            "1004": 4771,
            "1005": 5233,
            "1006": 4130,
            "1008": 2609,
            "1009": 4781,
            "1013": 2626,
            "1101": 5707,
            "1102": 2969,
            "1103": 3247,
            "1104": 2401,
            "1105": 1884,
            "1106": 4167,
            "1107": 3290,
            "1108": 3933,
            "1109": 2560,
            "1201": 2830,
            "1202": 3158,
            "1203": 2154,
            "1204": 687,
            "1205": 991,
            "1208": 2219
          },
          "item": {
            "seal_stamp": 667,
            "divination_candle": 488,
            "destruction_wax": 401,
            "gold_coin": 430,
            "hunt_wax": 473,
            "harmony_wax": 340,
            "doctor_robe": 344,
            "chaos_trametes": 92,
            "cosmic_lotto": 420,
            "abundance_wax": 76,
            "nihility_wax": 268,
            "preservation_wax": 66,
            "broken_clock": 123,
            "erudition_wax": 142,
            "fortune_glue": 99,
            "rubert_gear": 132,
            "insect_web": 115,
            "faith_bond": 191,
            "angel_debt": 76,
            "dimension_dice": 57
          },
          "essence": {
            "essence_erudition": 93,
            "essence_destruction": 564,
            "essence_hunt": 636,
            "essence_elation": 755,
            "essence_harmony": 576,
            "essence_abundance": 53,
            "essence_nihility": 274,
            "essence_preservation": 49
          }
        },
        "incomplete": 0
      },
      "uniform": {
        "runs": 1000,
        "wins": 4,
        "winRate": 0.004,
        "winRateCI": [
          0.0015565881404084308,
          0.010239556277262253
        ],
        "avgFloor": 10.479,
        "avgClearedFloors": 9.483,
        "avgHp": 110.45,
        "avgTurns": 63.094,
        "avgDamage": 0,
        "avgCoins": 10618.71,
        "avgMerges": 15.14,
        "avgRemovals": 0,
        "avgRosterSize": 37.654,
        "avgItems": 4.475,
        "avgEssences": 2.928,
        "avgActivatedEssences": 2.633,
        "avgScore": 10047.518152733948,
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
            "count": 71
          },
          {
            "floor": 10,
            "count": 452
          },
          {
            "floor": 11,
            "count": 400
          },
          {
            "floor": 12,
            "count": 72
          }
        ],
        "picks": {
          "recruit": {
            "1001": 3816,
            "1002": 3881,
            "1003": 1882,
            "1004": 1827,
            "1005": 1870,
            "1006": 1860,
            "1008": 3892,
            "1009": 3875,
            "1013": 3829,
            "1101": 2346,
            "1102": 1868,
            "1103": 3942,
            "1104": 2355,
            "1105": 3820,
            "1106": 2319,
            "1107": 1897,
            "1108": 2296,
            "1109": 3937,
            "1201": 3814,
            "1202": 2284,
            "1203": 1901,
            "1204": 373,
            "1205": 367,
            "1208": 1843
          },
          "item": {
            "cosmic_lotto": 221,
            "faith_bond": 341,
            "angel_debt": 167,
            "nihility_wax": 198,
            "chaos_trametes": 233,
            "gold_coin": 362,
            "doctor_robe": 190,
            "divination_candle": 207,
            "seal_stamp": 310,
            "destruction_wax": 206,
            "insect_web": 358,
            "rubert_gear": 178,
            "erudition_wax": 240,
            "harmony_wax": 179,
            "preservation_wax": 229,
            "hunt_wax": 214,
            "broken_clock": 46,
            "abundance_wax": 204,
            "fortune_glue": 202,
            "dimension_dice": 190
          },
          "essence": {
            "essence_erudition": 379,
            "essence_abundance": 380,
            "essence_preservation": 358,
            "essence_destruction": 376,
            "essence_harmony": 372,
            "essence_hunt": 366,
            "essence_elation": 361,
            "essence_nihility": 336
          }
        },
        "incomplete": 0
      },
      "difference": {
        "winRate": 0.942,
        "avgFloor": 1.517,
        "pairedSeeds": 1000,
        "outcomes": {
          "aiOnlyWins": 942,
          "uniformOnlyWins": 0,
          "bothWin": 4,
          "bothLoss": 54
        }
      }
    }
  ],
  "elapsedMs": 263387.4117,
  "calibrationTarget": {
    "min": 0.9,
    "max": 0.98,
    "preferred": 0.95,
    "passed": true
  }
};
