// Independent r6 holdout and stress evidence. Raw per-turn campaigns remain in the linked reports.
export const ARCHETYPE_REFERENCE = Object.freeze({
  "version": "archetype-campaign-v3-survival",
  "seed": "archetype-release-v050-20261016-r6-summon-fix",
  "samplePurpose": "holdout",
  "difficulty": 10,
  "contentCount": 90,
  "runsPerStrategy": 100,
  "sourceStable": true,
  "policyVersion": "archetype-actions-v7",
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
  "strength": 24,
  "lookahead": false,
  "sourceHashes": {
    "src/content.js": "8a147df0e927a62b2616f5a97a780dde8eabc8af9a45a846f3450c4e57d78a81",
    "src/retirements.js": "22cc5bd413d0a40a1efde600150ed8ad9bb41598373046cfe4a89dbb098c99d2",
    "src/retirement-ai.js": "218f9c1c1ebda049f69f32dd4e4afb745f916e848165cb4724f65682b75ab639",
    "src/archetypes.js": "cca33f55a43aec0c3b5fcc77dab56d264e39711e9a5146a94bbe34ca862ba029",
    "src/effect-rules.js": "ec2da53e5b0595f1ca3a72a256f7ddc2058e125f7ad06dfa9b69f16e10f7236a",
    "src/synergies.js": "e4833d6b03c58ebbc14ef45f52f7cd55477eb97b04631f9c318212d3d2bd4c01",
    "src/difficulty.js": "9d0ae20a3b982a7c926a27aba5889f29f761ddb4c68472e3f64afebad175ff5d",
    "src/enemy-effects.js": "7f11e1043c613da1bae7d7022acf9d17c464400688486f532c155835bd09ea01",
    "src/engine.js": "dbda782db44f0c2cb73851db2093c0e5122ac17629c8a0b4aede108ba2dd4fc5",
    "src/ai-profile.js": "2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206",
    "src/ai.js": "b0231a39f271d35d3a8c74df5e93bbdcc206c24e6780809e3cc681f43e74829c",
    "src/simulation.js": "fb59f4744192e62d6ed2bf363f89e6576b9ac7481f8c3550f7a92ec0cac47e95",
    "src/archetype-simulation.js": "10249d780e26d0f8cc8fa4cd6b5965a78cf15f1c418adb482220e5f7b414c53d",
    "scripts/archetype-balance.mjs": "b09ea6dc15647cc8888ae32f7343a24d63953967d2e112ee7102ac4ea52fd4c0"
  },
  "reportPath": "docs/benchmarks/archetype-holdout-d10.json",
  "strategies": [
    {
      "id": "baseline",
      "name": "无套路偏好 AI",
      "kind": "baseline",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 99,
      "losses": 1,
      "winRate": 0.99,
      "winRateCI95": [
        0.9455138038212946,
        0.9982325679358593
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 97,
        "formed": 97,
        "neverFormed": 3,
        "rate": 0.97,
        "ci95": [
          0.9154806357094724,
          0.9897454759759611
        ],
        "turn": {
          "n": 97,
          "mean": 8.597938,
          "ci95": [
            7.697522,
            9.498354
          ]
        },
        "formedWins": 96,
        "formedLosses": 1,
        "unformedWins": 3,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 78,
        "mean": 0.830277,
        "ci95": [
          0.79294,
          0.867613
        ]
      },
      "afterFormation": {
        "n": 97,
        "mean": 1.060527,
        "ci95": [
          1.022704,
          1.098351
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 97,
        "mean": 1.406853,
        "ci95": [
          1.37015,
          1.443557
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 97,
        "mean": 0.785475,
        "ci95": [
          0.653977,
          0.916973
        ]
      },
      "checks": null,
      "finalPlannedFormedCounts": {
        "0": 100,
        "1": 0,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 4,
        "1": 35,
        "2": 50,
        "3": 11
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 1,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0,
          "ci95": [
            -0.047836,
            0.047836
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 0,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 1
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 0,
      "cautiousRewardDecisions": 0,
      "releasedPollutedRemovals": 0
    },
    {
      "id": "focus:ink_dot",
      "name": "虚无引爆",
      "kind": "focus",
      "focusId": "ink_dot",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 98,
      "losses": 2,
      "winRate": 0.98,
      "winRateCI95": [
        0.929988209271456,
        0.9944980324498376
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 68,
        "formed": 68,
        "neverFormed": 32,
        "rate": 0.68,
        "ci95": [
          0.5833738138954762,
          0.7633085267500092
        ],
        "turn": {
          "n": 68,
          "mean": 14.264706,
          "ci95": [
            13.132908,
            15.396503
          ]
        },
        "formedWins": 67,
        "formedLosses": 1,
        "unformedWins": 31,
        "unformedLosses": 1
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.99599,
        "ci95": [
          0.95434,
          1.03764
        ]
      },
      "afterFormation": {
        "n": 68,
        "mean": 1.147894,
        "ci95": [
          1.10236,
          1.193428
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 68,
        "mean": 1.203639,
        "ci95": [
          1.182269,
          1.225009
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 68,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": true,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 32,
        "1": 68,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 3,
        "1": 17,
        "2": 52,
        "3": 28
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 2,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.079778,
            0.060735
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 2,
          "bothWin": 97,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 12,
      "cautiousRewardDecisions": 31,
      "releasedPollutedRemovals": 25
    },
    {
      "id": "focus:follow_up",
      "name": "追加投资",
      "kind": "focus",
      "focusId": "follow_up",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 98,
      "losses": 2,
      "winRate": 0.98,
      "winRateCI95": [
        0.929988209271456,
        0.9944980324498376
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 67,
        "formed": 67,
        "neverFormed": 33,
        "rate": 0.67,
        "ci95": [
          0.5730534379509052,
          0.7543687726587197
        ],
        "turn": {
          "n": 67,
          "mean": 14.522388,
          "ci95": [
            13.48504,
            15.559737
          ]
        },
        "formedWins": 67,
        "formedLosses": 0,
        "unformedWins": 31,
        "unformedLosses": 2
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.955466,
        "ci95": [
          0.914454,
          0.996478
        ]
      },
      "afterFormation": {
        "n": 67,
        "mean": 1.138367,
        "ci95": [
          1.091722,
          1.185013
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 67,
        "mean": 1.270164,
        "ci95": [
          1.243786,
          1.296542
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 67,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": true,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 34,
        "1": 66,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 25,
        "2": 48,
        "3": 26
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 2,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.079778,
            0.060735
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 2,
          "bothWin": 97,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 21,
      "cautiousRewardDecisions": 20,
      "releasedPollutedRemovals": 15
    },
    {
      "id": "focus:frost",
      "name": "冰盾反击",
      "kind": "focus",
      "focusId": "frost",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 100,
      "losses": 0,
      "winRate": 1,
      "winRateCI95": [
        0.9630065017930143,
        1
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 89,
        "formed": 89,
        "neverFormed": 11,
        "rate": 0.89,
        "ci95": [
          0.8136870349691969,
          0.9374580364293543
        ],
        "turn": {
          "n": 89,
          "mean": 8.966292,
          "ci95": [
            7.701225,
            10.231359
          ]
        },
        "formedWins": 89,
        "formedLosses": 0,
        "unformedWins": 11,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 71,
        "mean": 0.838552,
        "ci95": [
          0.795565,
          0.881539
        ]
      },
      "afterFormation": {
        "n": 89,
        "mean": 1.053433,
        "ci95": [
          1.015364,
          1.091502
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 89,
        "mean": 1.402544,
        "ci95": [
          1.36398,
          1.441108
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 89,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": false,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": false
      },
      "finalPlannedFormedCounts": {
        "0": 11,
        "1": 89,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 2,
        "1": 21,
        "2": 48,
        "3": 29
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 0,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.04638,
            0.065424
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 2,
      "cautiousRewardDecisions": 5,
      "releasedPollutedRemovals": 104
    },
    {
      "id": "focus:mentorship",
      "name": "仙舟授业",
      "kind": "focus",
      "focusId": "mentorship",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 99,
      "losses": 1,
      "winRate": 0.99,
      "winRateCI95": [
        0.9455138038212946,
        0.9982325679358593
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 52,
        "formed": 52,
        "neverFormed": 48,
        "rate": 0.52,
        "ci95": [
          0.4231657776522397,
          0.615354482419481
        ],
        "turn": {
          "n": 52,
          "mean": 15.346154,
          "ci95": [
            13.81535,
            16.876958
          ]
        },
        "formedWins": 52,
        "formedLosses": 0,
        "unformedWins": 47,
        "unformedLosses": 1
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.884864,
        "ci95": [
          0.838801,
          0.930927
        ]
      },
      "afterFormation": {
        "n": 52,
        "mean": 1.071293,
        "ci95": [
          1.012448,
          1.130137
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 52,
        "mean": 1.170957,
        "ci95": [
          1.147165,
          1.19475
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 52,
        "mean": 2.805339,
        "ci95": [
          2.531198,
          3.07948
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": false,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 48,
        "1": 52,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 22,
        "2": 55,
        "3": 22
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 1,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0,
          "ci95": [
            -0.063968,
            0.063968
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 1,
          "bothWin": 98,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 13,
      "cautiousRewardDecisions": 13,
      "releasedPollutedRemovals": 28
    },
    {
      "id": "focus:puppet",
      "name": "空间站实验",
      "kind": "focus",
      "focusId": "puppet",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 100,
      "losses": 0,
      "winRate": 1,
      "winRateCI95": [
        0.9630065017930143,
        1
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 89,
        "formed": 89,
        "neverFormed": 11,
        "rate": 0.89,
        "ci95": [
          0.8136870349691969,
          0.9374580364293543
        ],
        "turn": {
          "n": 89,
          "mean": 10.539326,
          "ci95": [
            9.440407,
            11.638245
          ]
        },
        "formedWins": 89,
        "formedLosses": 0,
        "unformedWins": 11,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 88,
        "mean": 0.921768,
        "ci95": [
          0.867559,
          0.975977
        ]
      },
      "afterFormation": {
        "n": 89,
        "mean": 1.069635,
        "ci95": [
          1.031782,
          1.107488
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 89,
        "mean": 1.141511,
        "ci95": [
          1.12912,
          1.153901
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 89,
        "mean": 1.304337,
        "ci95": [
          1.22273,
          1.385944
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": false,
        "effectsOnlyPowerAtLeast115": false,
        "effectsOnlyGrowthAtLeast05": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 12,
        "1": 88,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 34,
        "2": 49,
        "3": 17
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 0,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.04638,
            0.065424
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 16,
      "cautiousRewardDecisions": 25,
      "releasedPollutedRemovals": 32
    },
    {
      "id": "focus:recollection",
      "name": "忆灵共演",
      "kind": "focus",
      "focusId": "recollection",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 98,
      "losses": 2,
      "winRate": 0.98,
      "winRateCI95": [
        0.929988209271456,
        0.9944980324498376
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 44,
        "formed": 44,
        "neverFormed": 56,
        "rate": 0.44,
        "ci95": [
          0.34672026630160796,
          0.5377189534832302
        ],
        "turn": {
          "n": 44,
          "mean": 15.954545,
          "ci95": [
            14.38203,
            17.527061
          ]
        },
        "formedWins": 44,
        "formedLosses": 0,
        "unformedWins": 54,
        "unformedLosses": 2
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.893645,
        "ci95": [
          0.84991,
          0.93738
        ]
      },
      "afterFormation": {
        "n": 43,
        "mean": 1.168043,
        "ci95": [
          1.095654,
          1.240432
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 43,
        "mean": 1.571747,
        "ci95": [
          1.467314,
          1.676181
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 43,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": true,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 57,
        "1": 43,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 28,
        "2": 53,
        "3": 18
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 2,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.079778,
            0.060735
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 2,
          "bothWin": 97,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 24,
      "cautiousRewardDecisions": 44,
      "releasedPollutedRemovals": 10
    },
    {
      "id": "focus:elation",
      "name": "欢愉谢幕",
      "kind": "focus",
      "focusId": "elation",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 100,
      "losses": 0,
      "winRate": 1,
      "winRateCI95": [
        0.9630065017930143,
        1
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 82,
        "formed": 82,
        "neverFormed": 18,
        "rate": 0.82,
        "ci95": [
          0.7333264161369926,
          0.8829977450105364
        ],
        "turn": {
          "n": 82,
          "mean": 11.865854,
          "ci95": [
            10.932103,
            12.799604
          ]
        },
        "formedWins": 82,
        "formedLosses": 0,
        "unformedWins": 18,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.876533,
        "ci95": [
          0.828747,
          0.924318
        ]
      },
      "afterFormation": {
        "n": 82,
        "mean": 1.088237,
        "ci95": [
          1.043556,
          1.132918
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 82,
        "mean": 1.431321,
        "ci95": [
          1.387307,
          1.475336
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 82,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": false,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": false
      },
      "finalPlannedFormedCounts": {
        "0": 19,
        "1": 81,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 3,
        "1": 21,
        "2": 53,
        "3": 23
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 0,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.04638,
            0.065424
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 8,
      "cautiousRewardDecisions": 19,
      "releasedPollutedRemovals": 49
    },
    {
      "id": "focus:break",
      "name": "击破接力",
      "kind": "focus",
      "focusId": "break",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 98,
      "losses": 2,
      "winRate": 0.98,
      "winRateCI95": [
        0.929988209271456,
        0.9944980324498376
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 69,
        "formed": 69,
        "neverFormed": 31,
        "rate": 0.69,
        "ci95": [
          0.5937394428051057,
          0.7722030278762395
        ],
        "turn": {
          "n": 69,
          "mean": 14.362319,
          "ci95": [
            13.123673,
            15.600965
          ]
        },
        "formedWins": 69,
        "formedLosses": 0,
        "unformedWins": 29,
        "unformedLosses": 2
      },
      "beforeFormation": {
        "n": 100,
        "mean": 0.909253,
        "ci95": [
          0.86868,
          0.949825
        ]
      },
      "afterFormation": {
        "n": 69,
        "mean": 1.12727,
        "ci95": [
          1.085256,
          1.169284
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 69,
        "mean": 1.338003,
        "ci95": [
          1.307854,
          1.368152
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 69,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": true,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": false,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 31,
        "1": 69,
        "2": 0
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 19,
        "2": 52,
        "3": 28
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 2,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.079778,
            0.060735
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 2,
          "bothWin": 97,
          "bothLose": 0
        }
      },
      "abandonedRuns": 0,
      "survivalRewardDecisions": 24,
      "cautiousRewardDecisions": 29,
      "releasedPollutedRemovals": 30
    },
    {
      "id": "adaptive:2",
      "name": "同时准备 2 套路",
      "kind": "adaptive",
      "slots": 2,
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 100,
      "losses": 0,
      "winRate": 1,
      "winRateCI95": [
        0.9630065017930143,
        1
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 97,
        "formed": 97,
        "neverFormed": 3,
        "rate": 0.97,
        "ci95": [
          0.9154806357094724,
          0.9897454759759611
        ],
        "turn": {
          "n": 97,
          "mean": 7.721649,
          "ci95": [
            6.745995,
            8.697304
          ]
        },
        "formedWins": 97,
        "formedLosses": 0,
        "unformedWins": 3,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 68,
        "mean": 0.805887,
        "ci95": [
          0.762874,
          0.8489
        ]
      },
      "afterFormation": {
        "n": 97,
        "mean": 1.101135,
        "ci95": [
          1.059269,
          1.143
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 97,
        "mean": 1.425423,
        "ci95": [
          1.381082,
          1.469765
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 97,
        "mean": 0.616473,
        "ci95": [
          0.475357,
          0.757588
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": true,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 3,
        "1": 61,
        "2": 36
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 25,
        "2": 55,
        "3": 20
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 0,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.04638,
            0.065424
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 0
        }
      },
      "abandonedRuns": 53,
      "survivalRewardDecisions": 10,
      "cautiousRewardDecisions": 15,
      "releasedPollutedRemovals": 92
    },
    {
      "id": "adaptive:3",
      "name": "同时准备 3 套路",
      "kind": "adaptive",
      "slots": 3,
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 100,
      "losses": 0,
      "winRate": 1,
      "winRateCI95": [
        0.9630065017930143,
        1
      ],
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 98,
        "formed": 98,
        "neverFormed": 2,
        "rate": 0.98,
        "ci95": [
          0.929988209271456,
          0.9944980324498376
        ],
        "turn": {
          "n": 98,
          "mean": 7.285714,
          "ci95": [
            6.322473,
            8.248956
          ]
        },
        "formedWins": 98,
        "formedLosses": 0,
        "unformedWins": 2,
        "unformedLosses": 0
      },
      "beforeFormation": {
        "n": 67,
        "mean": 0.785709,
        "ci95": [
          0.743116,
          0.828302
        ]
      },
      "afterFormation": {
        "n": 98,
        "mean": 1.082825,
        "ci95": [
          1.044228,
          1.121421
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 98,
        "mean": 1.470035,
        "ci95": [
          1.429298,
          1.510771
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 98,
        "mean": 0.656914,
        "ci95": [
          0.521542,
          0.792286
        ]
      },
      "checks": {
        "preFormationBelowBaseline": true,
        "formedProgressAtLeast110": false,
        "effectsOnlyPowerAtLeast115": true,
        "effectsOnlyGrowthAtLeast05": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesDesignPointEstimate": true
      },
      "finalPlannedFormedCounts": {
        "0": 2,
        "1": 45,
        "2": 53
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 14,
        "2": 65,
        "3": 21
      },
      "incomplete": 0,
      "failureCauses": {
        "hp": 0,
        "deadline": 0,
        "other": 0
      },
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.04638,
            0.065424
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 1,
          "baselineOnlyWins": 0,
          "bothWin": 99,
          "bothLose": 0
        }
      },
      "abandonedRuns": 100,
      "survivalRewardDecisions": 4,
      "cautiousRewardDecisions": 12,
      "releasedPollutedRemovals": 102
    }
  ],
  "interpretation": {
    "power": "真实引擎标准敌阵探针：实伤 + 0.36 ×（实治疗 + min(25,实格挡+减伤) − 自伤）",
    "growth": "本次探针实际新增永久威力；保留为独立指标，未把未来威力混进当前战力",
    "progression": "成型前后摘要使用同转仍在对局基线均值作分母；byTurn另外并列全样本进度。v1历史校准的阶段摘要使用全样本基线分母，不能直接跨协议比较",
    "allSample": "全样本平均：死亡当转及以后记0；胜利后保持终局战力；全样本进度与只统计仍在对局样本并列",
    "intervention": "同一状态、同一探针种子，仅关闭目标套路效果；测即时机制贡献，不能推断通关率因果",
    "conditional": "成型后表现、成型事件窗口和成型/未成型胜率属于观察性关联；同时报告未成型失败及各转幸存人数",
    "intervals": "胜率与成型率为Wilson95%；战力/成型回合为以每局为单位的均值正态95%区间；小样本不保证正态近似，n<2不报区间",
    "thresholds": "成型后进度110%、同状态效果115%或每转额外0.5永久威力是预先声明的测试版点估计门槛；checks忠实报告，未通过不宣称平衡完成"
  },
  "stress": {
    "version": "archetype-campaign-v3-survival",
    "seed": "archetype-release-v050-20261016-r6-summon-fix",
    "samplePurpose": "stress",
    "difficulty": 20,
    "contentCount": 90,
    "runsPerStrategy": 100,
    "sourceStable": true,
    "policyVersion": "archetype-actions-v7",
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
    "strength": 24,
    "lookahead": false,
    "sourceHashes": {
      "src/content.js": "8a147df0e927a62b2616f5a97a780dde8eabc8af9a45a846f3450c4e57d78a81",
      "src/retirements.js": "22cc5bd413d0a40a1efde600150ed8ad9bb41598373046cfe4a89dbb098c99d2",
      "src/retirement-ai.js": "218f9c1c1ebda049f69f32dd4e4afb745f916e848165cb4724f65682b75ab639",
      "src/archetypes.js": "cca33f55a43aec0c3b5fcc77dab56d264e39711e9a5146a94bbe34ca862ba029",
      "src/effect-rules.js": "ec2da53e5b0595f1ca3a72a256f7ddc2058e125f7ad06dfa9b69f16e10f7236a",
      "src/synergies.js": "e4833d6b03c58ebbc14ef45f52f7cd55477eb97b04631f9c318212d3d2bd4c01",
      "src/difficulty.js": "9d0ae20a3b982a7c926a27aba5889f29f761ddb4c68472e3f64afebad175ff5d",
      "src/enemy-effects.js": "7f11e1043c613da1bae7d7022acf9d17c464400688486f532c155835bd09ea01",
      "src/engine.js": "dbda782db44f0c2cb73851db2093c0e5122ac17629c8a0b4aede108ba2dd4fc5",
      "src/ai-profile.js": "2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206",
      "src/ai.js": "b0231a39f271d35d3a8c74df5e93bbdcc206c24e6780809e3cc681f43e74829c",
      "src/simulation.js": "fb59f4744192e62d6ed2bf363f89e6576b9ac7481f8c3550f7a92ec0cac47e95",
      "src/archetype-simulation.js": "10249d780e26d0f8cc8fa4cd6b5965a78cf15f1c418adb482220e5f7b414c53d",
      "scripts/archetype-balance.mjs": "b09ea6dc15647cc8888ae32f7343a24d63953967d2e112ee7102ac4ea52fd4c0"
    },
    "reportPath": "docs/benchmarks/archetype-stress-d20.json",
    "strategies": [
      {
        "id": "baseline",
        "name": "无套路偏好 AI",
        "kind": "baseline",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 71,
        "losses": 29,
        "winRate": 0.71,
        "winRateCI95": [
          0.6146110882442888,
          0.7898516425087772
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 97,
          "formed": 97,
          "neverFormed": 3,
          "rate": 0.97,
          "ci95": [
            0.9154806357094724,
            0.9897454759759611
          ],
          "turn": {
            "n": 97,
            "mean": 9.835052,
            "ci95": [
              8.727535,
              10.942569
            ]
          },
          "formedWins": 71,
          "formedLosses": 26,
          "unformedWins": 0,
          "unformedLosses": 3
        },
        "beforeFormation": {
          "n": 79,
          "mean": 0.849072,
          "ci95": [
            0.819075,
            0.87907
          ]
        },
        "afterFormation": {
          "n": 97,
          "mean": 1.044616,
          "ci95": [
            1.006809,
            1.082423
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 97,
          "mean": 1.398442,
          "ci95": [
            1.364381,
            1.432503
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 97,
          "mean": 1.033997,
          "ci95": [
            0.89103,
            1.176964
          ]
        },
        "checks": null,
        "finalPlannedFormedCounts": {
          "0": 100,
          "1": 0,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 4,
          "1": 27,
          "2": 54,
          "3": 15
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 27,
          "deadline": 2,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0,
            "ci95": [
              -0.047836,
              0.047836
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 0,
            "baselineOnlyWins": 0,
            "bothWin": 71,
            "bothLose": 29
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 0,
        "cautiousRewardDecisions": 0,
        "releasedPollutedRemovals": 0
      },
      {
        "id": "focus:ink_dot",
        "name": "虚无引爆",
        "kind": "focus",
        "focusId": "ink_dot",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 71,
        "losses": 29,
        "winRate": 0.71,
        "winRateCI95": [
          0.6146110882442888,
          0.7898516425087772
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 87,
          "formed": 87,
          "neverFormed": 13,
          "rate": 0.87,
          "ci95": [
            0.7901964855992357,
            0.9224283257275948
          ],
          "turn": {
            "n": 87,
            "mean": 15.931034,
            "ci95": [
              14.652544,
              17.209525
            ]
          },
          "formedWins": 65,
          "formedLosses": 22,
          "unformedWins": 6,
          "unformedLosses": 7
        },
        "beforeFormation": {
          "n": 100,
          "mean": 1.002222,
          "ci95": [
            0.9622,
            1.042243
          ]
        },
        "afterFormation": {
          "n": 87,
          "mean": 1.081866,
          "ci95": [
            1.041967,
            1.121766
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 87,
          "mean": 1.18636,
          "ci95": [
            1.169136,
            1.203585
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 87,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": false,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": false
        },
        "finalPlannedFormedCounts": {
          "0": 14,
          "1": 86,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 13,
          "2": 52,
          "3": 35
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 26,
          "deadline": 3,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0,
            "ci95": [
              -0.167318,
              0.167318
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 17,
            "baselineOnlyWins": 17,
            "bothWin": 54,
            "bothLose": 12
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 170,
        "cautiousRewardDecisions": 169,
        "releasedPollutedRemovals": 46
      },
      {
        "id": "focus:follow_up",
        "name": "追加投资",
        "kind": "focus",
        "focusId": "follow_up",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 82,
        "losses": 18,
        "winRate": 0.82,
        "winRateCI95": [
          0.7333264161369926,
          0.8829977450105364
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 86,
          "formed": 86,
          "neverFormed": 14,
          "rate": 0.86,
          "ci95": [
            0.7786281178903616,
            0.9147365634006086
          ],
          "turn": {
            "n": 86,
            "mean": 17.651163,
            "ci95": [
              16.128568,
              19.173757
            ]
          },
          "formedWins": 74,
          "formedLosses": 12,
          "unformedWins": 8,
          "unformedLosses": 6
        },
        "beforeFormation": {
          "n": 100,
          "mean": 0.956788,
          "ci95": [
            0.914039,
            0.999538
          ]
        },
        "afterFormation": {
          "n": 86,
          "mean": 1.08211,
          "ci95": [
            1.043037,
            1.121184
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 86,
          "mean": 1.272124,
          "ci95": [
            1.246941,
            1.297307
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 86,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": false
        },
        "finalPlannedFormedCounts": {
          "0": 14,
          "1": 86,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 9,
          "2": 44,
          "3": 47
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 16,
          "deadline": 2,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.11,
            "ci95": [
              -0.053767,
              0.263243
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 21,
            "baselineOnlyWins": 10,
            "bothWin": 61,
            "bothLose": 8
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 157,
        "cautiousRewardDecisions": 152,
        "releasedPollutedRemovals": 12
      },
      {
        "id": "focus:frost",
        "name": "冰盾反击",
        "kind": "focus",
        "focusId": "frost",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 90,
        "losses": 10,
        "winRate": 0.9,
        "winRateCI95": [
          0.8256343384950865,
          0.9447708629393249
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 92,
          "formed": 92,
          "neverFormed": 8,
          "rate": 0.92,
          "ci95": [
            0.8500189229905127,
            0.9589065385156194
          ],
          "turn": {
            "n": 92,
            "mean": 9.673913,
            "ci95": [
              8.274793,
              11.073033
            ]
          },
          "formedWins": 85,
          "formedLosses": 7,
          "unformedWins": 5,
          "unformedLosses": 3
        },
        "beforeFormation": {
          "n": 76,
          "mean": 0.880218,
          "ci95": [
            0.837098,
            0.923338
          ]
        },
        "afterFormation": {
          "n": 92,
          "mean": 1.030741,
          "ci95": [
            0.99505,
            1.066431
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 92,
          "mean": 1.384555,
          "ci95": [
            1.3505,
            1.418611
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 92,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": false
        },
        "finalPlannedFormedCounts": {
          "0": 8,
          "1": 92,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 1,
          "1": 11,
          "2": 50,
          "3": 38
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 2,
          "deadline": 8,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.19,
            "ci95": [
              0.020545,
              0.341277
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 27,
            "baselineOnlyWins": 8,
            "bothWin": 63,
            "bothLose": 2
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 61,
        "cautiousRewardDecisions": 109,
        "releasedPollutedRemovals": 124
      },
      {
        "id": "focus:mentorship",
        "name": "仙舟授业",
        "kind": "focus",
        "focusId": "mentorship",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 83,
        "losses": 17,
        "winRate": 0.83,
        "winRateCI95": [
          0.7445199523239887,
          0.8910643388594006
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 71,
          "formed": 71,
          "neverFormed": 29,
          "rate": 0.71,
          "ci95": [
            0.6146110882442888,
            0.7898516425087772
          ],
          "turn": {
            "n": 71,
            "mean": 17.746479,
            "ci95": [
              15.808438,
              19.684519
            ]
          },
          "formedWins": 64,
          "formedLosses": 7,
          "unformedWins": 19,
          "unformedLosses": 10
        },
        "beforeFormation": {
          "n": 100,
          "mean": 0.867402,
          "ci95": [
            0.821027,
            0.913778
          ]
        },
        "afterFormation": {
          "n": 71,
          "mean": 1.100562,
          "ci95": [
            1.054351,
            1.146773
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 71,
          "mean": 1.165604,
          "ci95": [
            1.143617,
            1.187591
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 71,
          "mean": 3.070544,
          "ci95": [
            2.861569,
            3.279518
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": true,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": true
        },
        "finalPlannedFormedCounts": {
          "0": 29,
          "1": 71,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 1,
          "1": 9,
          "2": 55,
          "3": 35
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 13,
          "deadline": 4,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.12,
            "ci95": [
              -0.056852,
              0.285371
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 25,
            "baselineOnlyWins": 13,
            "bothWin": 58,
            "bothLose": 4
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 147,
        "cautiousRewardDecisions": 161,
        "releasedPollutedRemovals": 48
      },
      {
        "id": "focus:puppet",
        "name": "空间站实验",
        "kind": "focus",
        "focusId": "puppet",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 67,
        "losses": 33,
        "winRate": 0.67,
        "winRateCI95": [
          0.5730534379509052,
          0.7543687726587197
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 93,
          "formed": 93,
          "neverFormed": 7,
          "rate": 0.93,
          "ci95": [
            0.8625048526092651,
            0.9656807389327273
          ],
          "turn": {
            "n": 93,
            "mean": 12.462366,
            "ci95": [
              10.913513,
              14.011218
            ]
          },
          "formedWins": 65,
          "formedLosses": 28,
          "unformedWins": 2,
          "unformedLosses": 5
        },
        "beforeFormation": {
          "n": 85,
          "mean": 0.933979,
          "ci95": [
            0.892115,
            0.975844
          ]
        },
        "afterFormation": {
          "n": 93,
          "mean": 1.082601,
          "ci95": [
            1.045138,
            1.120063
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 93,
          "mean": 1.136251,
          "ci95": [
            1.122914,
            1.149588
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 93,
          "mean": 1.403623,
          "ci95": [
            1.310289,
            1.496958
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": false,
          "effectsOnlyGrowthAtLeast05": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": true
        },
        "finalPlannedFormedCounts": {
          "0": 11,
          "1": 89,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 1,
          "1": 19,
          "2": 60,
          "3": 20
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 31,
          "deadline": 2,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.04,
            "ci95": [
              -0.188888,
              0.112715
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 11,
            "baselineOnlyWins": 15,
            "bothWin": 56,
            "bothLose": 18
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 261,
        "cautiousRewardDecisions": 201,
        "releasedPollutedRemovals": 53
      },
      {
        "id": "focus:recollection",
        "name": "忆灵共演",
        "kind": "focus",
        "focusId": "recollection",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 74,
        "losses": 26,
        "winRate": 0.74,
        "winRateCI95": [
          0.6462901055081282,
          0.8159530153525186
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 50,
          "formed": 50,
          "neverFormed": 50,
          "rate": 0.5,
          "ci95": [
            0.4038315303659956,
            0.5961684696340044
          ],
          "turn": {
            "n": 50,
            "mean": 18.76,
            "ci95": [
              17.024429,
              20.495571
            ]
          },
          "formedWins": 40,
          "formedLosses": 10,
          "unformedWins": 34,
          "unformedLosses": 16
        },
        "beforeFormation": {
          "n": 100,
          "mean": 0.901692,
          "ci95": [
            0.866811,
            0.936572
          ]
        },
        "afterFormation": {
          "n": 50,
          "mean": 1.142378,
          "ci95": [
            1.076052,
            1.208705
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 50,
          "mean": 1.549001,
          "ci95": [
            1.486175,
            1.611828
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 50,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": true,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": true
        },
        "finalPlannedFormedCounts": {
          "0": 52,
          "1": 48,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 2,
          "1": 20,
          "2": 55,
          "3": 23
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 22,
          "deadline": 4,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.03,
            "ci95": [
              -0.128903,
              0.186033
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 16,
            "baselineOnlyWins": 13,
            "bothWin": 58,
            "bothLose": 13
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 196,
        "cautiousRewardDecisions": 229,
        "releasedPollutedRemovals": 22
      },
      {
        "id": "focus:elation",
        "name": "欢愉谢幕",
        "kind": "focus",
        "focusId": "elation",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 86,
        "losses": 14,
        "winRate": 0.86,
        "winRateCI95": [
          0.7786281178903616,
          0.9147365634006086
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 93,
          "formed": 93,
          "neverFormed": 7,
          "rate": 0.93,
          "ci95": [
            0.8625048526092651,
            0.9656807389327273
          ],
          "turn": {
            "n": 93,
            "mean": 12.763441,
            "ci95": [
              11.465395,
              14.061487
            ]
          },
          "formedWins": 82,
          "formedLosses": 11,
          "unformedWins": 4,
          "unformedLosses": 3
        },
        "beforeFormation": {
          "n": 97,
          "mean": 0.895458,
          "ci95": [
            0.855079,
            0.935838
          ]
        },
        "afterFormation": {
          "n": 93,
          "mean": 1.055815,
          "ci95": [
            1.012394,
            1.099235
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 93,
          "mean": 1.450861,
          "ci95": [
            1.404137,
            1.497585
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 93,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": false
        },
        "finalPlannedFormedCounts": {
          "0": 8,
          "1": 92,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 18,
          "2": 43,
          "3": 39
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 12,
          "deadline": 2,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.15,
            "ci95": [
              -0.012764,
              0.298413
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 23,
            "baselineOnlyWins": 8,
            "bothWin": 63,
            "bothLose": 6
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 133,
        "cautiousRewardDecisions": 162,
        "releasedPollutedRemovals": 73
      },
      {
        "id": "focus:break",
        "name": "击破接力",
        "kind": "focus",
        "focusId": "break",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 61,
        "losses": 39,
        "winRate": 0.61,
        "winRateCI95": [
          0.5120301704584073,
          0.6998312599360558
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 77,
          "formed": 77,
          "neverFormed": 23,
          "rate": 0.77,
          "ci95": [
            0.6784561697712622,
            0.8415673411969654
          ],
          "turn": {
            "n": 77,
            "mean": 14.662338,
            "ci95": [
              13.246162,
              16.078514
            ]
          },
          "formedWins": 47,
          "formedLosses": 30,
          "unformedWins": 14,
          "unformedLosses": 9
        },
        "beforeFormation": {
          "n": 100,
          "mean": 0.925364,
          "ci95": [
            0.883596,
            0.967132
          ]
        },
        "afterFormation": {
          "n": 77,
          "mean": 1.073231,
          "ci95": [
            1.024102,
            1.122361
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 77,
          "mean": 1.344243,
          "ci95": [
            1.314949,
            1.373536
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 77,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": false,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": false
        },
        "finalPlannedFormedCounts": {
          "0": 24,
          "1": 76,
          "2": 0
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 13,
          "2": 41,
          "3": 46
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 32,
          "deadline": 7,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.1,
            "ci95": [
              -0.270545,
              0.080112
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 15,
            "baselineOnlyWins": 25,
            "bothWin": 46,
            "bothLose": 14
          }
        },
        "abandonedRuns": 0,
        "survivalRewardDecisions": 194,
        "cautiousRewardDecisions": 186,
        "releasedPollutedRemovals": 63
      },
      {
        "id": "adaptive:2",
        "name": "同时准备 2 套路",
        "kind": "adaptive",
        "slots": 2,
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 86,
        "losses": 14,
        "winRate": 0.86,
        "winRateCI95": [
          0.7786281178903616,
          0.9147365634006086
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 97,
          "formed": 97,
          "neverFormed": 3,
          "rate": 0.97,
          "ci95": [
            0.9154806357094724,
            0.9897454759759611
          ],
          "turn": {
            "n": 97,
            "mean": 7.474227,
            "ci95": [
              6.511619,
              8.436835
            ]
          },
          "formedWins": 84,
          "formedLosses": 13,
          "unformedWins": 2,
          "unformedLosses": 1
        },
        "beforeFormation": {
          "n": 71,
          "mean": 0.832073,
          "ci95": [
            0.789262,
            0.874884
          ]
        },
        "afterFormation": {
          "n": 97,
          "mean": 1.072926,
          "ci95": [
            1.031091,
            1.114761
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 97,
          "mean": 1.440904,
          "ci95": [
            1.395502,
            1.486307
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 97,
          "mean": 0.697114,
          "ci95": [
            0.552341,
            0.841887
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": true
        },
        "finalPlannedFormedCounts": {
          "0": 3,
          "1": 54,
          "2": 43
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 13,
          "2": 46,
          "3": 41
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 8,
          "deadline": 6,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.15,
            "ci95": [
              -0.028258,
              0.313907
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 27,
            "baselineOnlyWins": 12,
            "bothWin": 59,
            "bothLose": 2
          }
        },
        "abandonedRuns": 56,
        "survivalRewardDecisions": 125,
        "cautiousRewardDecisions": 162,
        "releasedPollutedRemovals": 122
      },
      {
        "id": "adaptive:3",
        "name": "同时准备 3 套路",
        "kind": "adaptive",
        "slots": 3,
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 83,
        "losses": 17,
        "winRate": 0.83,
        "winRateCI95": [
          0.7445199523239887,
          0.8910643388594006
        ],
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 99,
          "formed": 99,
          "neverFormed": 1,
          "rate": 0.99,
          "ci95": [
            0.9455138038212946,
            0.9982325679358593
          ],
          "turn": {
            "n": 99,
            "mean": 7.151515,
            "ci95": [
              6.241238,
              8.061793
            ]
          },
          "formedWins": 82,
          "formedLosses": 17,
          "unformedWins": 1,
          "unformedLosses": 0
        },
        "beforeFormation": {
          "n": 70,
          "mean": 0.825491,
          "ci95": [
            0.783548,
            0.867435
          ]
        },
        "afterFormation": {
          "n": 99,
          "mean": 1.084413,
          "ci95": [
            1.044387,
            1.124439
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 99,
          "mean": 1.474067,
          "ci95": [
            1.42466,
            1.523474
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 99,
          "mean": 0.766558,
          "ci95": [
            0.613918,
            0.919199
          ]
        },
        "checks": {
          "preFormationBelowBaseline": true,
          "formedProgressAtLeast110": false,
          "effectsOnlyPowerAtLeast115": true,
          "effectsOnlyGrowthAtLeast05": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesDesignPointEstimate": true
        },
        "finalPlannedFormedCounts": {
          "0": 1,
          "1": 46,
          "2": 53
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 8,
          "2": 53,
          "3": 39
        },
        "incomplete": 0,
        "failureCauses": {
          "hp": 10,
          "deadline": 7,
          "other": 0
        },
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.12,
            "ci95": [
              -0.053335,
              0.281854
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 24,
            "baselineOnlyWins": 12,
            "bothWin": 59,
            "bothLose": 5
          }
        },
        "abandonedRuns": 100,
        "survivalRewardDecisions": 87,
        "cautiousRewardDecisions": 117,
        "releasedPollutedRemovals": 114
      }
    ],
    "interpretation": {
      "power": "真实引擎标准敌阵探针：实伤 + 0.36 ×（实治疗 + min(25,实格挡+减伤) − 自伤）",
      "growth": "本次探针实际新增永久威力；保留为独立指标，未把未来威力混进当前战力",
      "progression": "成型前后摘要使用同转仍在对局基线均值作分母；byTurn另外并列全样本进度。v1历史校准的阶段摘要使用全样本基线分母，不能直接跨协议比较",
      "allSample": "全样本平均：死亡当转及以后记0；胜利后保持终局战力；全样本进度与只统计仍在对局样本并列",
      "intervention": "同一状态、同一探针种子，仅关闭目标套路效果；测即时机制贡献，不能推断通关率因果",
      "conditional": "成型后表现、成型事件窗口和成型/未成型胜率属于观察性关联；同时报告未成型失败及各转幸存人数",
      "intervals": "胜率与成型率为Wilson95%；战力/成型回合为以每局为单位的均值正态95%区间；小样本不保证正态近似，n<2不报区间",
      "thresholds": "成型后进度110%、同状态效果115%或每转额外0.5永久威力是预先声明的测试版点估计门槛；checks忠实报告，未通过不宣称平衡完成"
    }
  }
});
