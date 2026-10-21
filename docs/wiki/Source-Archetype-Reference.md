# 冻结实现：src/archetype-reference.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/archetype-reference.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：187818
- SHA-256：`119f3287a651cd70ef74656a760654acd1b415b29c77c994770ed1693697a26a`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/archetype-reference.js#L1)

<!-- frozen-source:start -->
````````````````javascript
// Current v0.6 independent holdout and stress evidence; generated only from validated complete reports.
export const ARCHETYPE_REFERENCE = Object.freeze({
  "gameVersion": "0.6.0",
  "version": "archetype-campaign-v4-bound-roles",
  "samplePurpose": "holdout",
  "seed": "v060-release-20261021-bound-r1",
  "difficulty": 10,
  "contentCount": 90,
  "runsPerStrategy": 100,
  "strength": 24,
  "lookahead": false,
  "policyVersion": "v060-bound-role-actions-v1",
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
  "planning": {
    "source": "shared-AI-marginal-reward-scores",
    "knownFutureRewards": false,
    "actions": "same real engine resource actions; selected lines protect their final recruited identity only while safe; polluted units are never protected; visible missing required core or last forming identity cancels reroll only while safe",
    "baseStrength": 24,
    "newIdentityBonus": "strength × lineWeight × survivalScale",
    "alreadyOwnedIdentityBonus": "strength × lineWeight × 0.45 × survivalScale",
    "missingCoreBonus": "strength × 0.6 × survivalScale",
    "lineWeight": {
      "formed": 1.8,
      "unformedWithOtherFormed": 0.5,
      "unformed": 1
    },
    "survivalScale": "0 if hp/maxHp<.3 with shield<10, or <=2 encounter spins remain and enemy HP exceeds .9 × last observed damage × remaining spins, or last encounter spin; .25 if hp/maxHp<.55 with shield<15 or <=2 encounter spins; otherwise1. No hidden RNG or future board used.",
    "temperature": 5,
    "skip": "retained as a real competing action",
    "adaptive": "first visible offer chooses 2/3 lines; >=10 spins retain at most2; >=12 with a formed line retain only formed plus one >=0.6-progress backup; >=18 with no formed retain one; >=2 formed retain two; >=6 spins under critical health or trailing deadline drop unformed lines below .7 progress, retaining at least one"
  },
  "probeProtocol": {
    "version": "canonical-spin-v1",
    "enemyCount": 5,
    "enemyHp": 1000000,
    "enemyAttack": 5,
    "hpFraction": 0.5,
    "defenseWeight": 0.36,
    "activeDebuffs": false,
    "overclock": false,
    "samples": 3
  },
  "sourceHashes": {
    "src/content.js": "feaba9615a5a17afb3aa882c5457301ff0352936dae59483ad9768526a2ed1cc",
    "src/retirements.js": "f6cfe52e5b4f92770902c346ab392077bf35188563ac3b649774c2af58de2671",
    "src/retirement-ai.js": "0047d32d02cb2ba4b1f5fa81fa7b0186749029ee189f33230959fc58e136773e",
    "src/archetypes.js": "6216691ddc609495588e8d0417cb4dd837e842b34307a39cf36b7d1944680bba",
    "src/effect-rules.js": "338aceed777f1d70fe66b2e51eeb2d58335d9fcda688ef94c3b48e9025310196",
    "src/synergies.js": "c0fd8e9466ffb0b57c1c4ebfd4da99c1b5ab758b8755598c4a679ad0ab61c0d4",
    "src/difficulty.js": "ad084791166970c7abcfc1f76783d424d6d98ba0c35f9bcb913a745040798943",
    "src/enemy-effects.js": "0cb8d0a134e6b87d413ef4a43b99c783f1a3699d448491b8598f700f2927bb6e",
    "src/engine.js": "c9df216d093ee665160045d922fb4e11bf80565797a34ec7d4684673313e7529",
    "src/ai-profile.js": "2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206",
    "src/ai.js": "733007793545ae32ef24466fc00364524e3d4291db4c4cdc1c8d27cc3ddbd631",
    "src/simulation.js": "fb59f4744192e62d6ed2bf363f89e6576b9ac7481f8c3550f7a92ec0cac47e95",
    "src/archetype-simulation.js": "1222070fe1b0896181a01b323598e8f5b4ef25bad95b38d9499d038d02a0776f",
    "scripts/archetype-balance.mjs": "54043a23adbc4f7353cade37e19f75f5290db9b620a6318dc194c450062f2f21"
  },
  "sourceStable": true,
  "elapsedMs": 744079,
  "interpretation": {
    "power": "真实引擎标准敌阵探针：实伤 + 0.36 ×（实治疗 + min(25,实格挡+减伤) − 自伤）",
    "growth": "本次探针实际新增永久培养；攻击者转为威力，支援转为标记职能效能；不混入当前战力",
    "progression": "成型前后摘要使用同转仍在对局基线均值作分母；byTurn另外并列全样本进度。v1历史校准的阶段摘要使用全样本基线分母，不能直接跨协议比较",
    "allSample": "全样本平均：死亡当转及以后记0；胜利后保持终局战力；全样本进度与只统计仍在对局样本并列",
    "intervention": "同一状态、同一探针种子，仅关闭目标套路效果；测即时机制贡献，不能推断通关率因果",
    "conditional": "成型后表现、成型事件窗口和成型/未成型胜率属于观察性关联；同时报告未成型失败及各转幸存人数",
    "intervals": "胜率与成型率为Wilson95%；战力/成型回合为以每局为单位的均值正态95%区间；小样本不保证正态近似，n<2不报区间",
    "thresholds": "0.6规则检查要求无未完成局、同状态套路贡献不为负、无套路自动永久成长；它只验证规则边界，不代表通关难度或所有套路等强。0.5的成长补偿门槛已不适用"
  },
  "reportPath": "docs/benchmarks/archetype-v060-holdout-d10.json",
  "strategies": [
    {
      "id": "baseline",
      "kind": "baseline",
      "name": "无套路偏好 AI",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 97,
      "losses": 3,
      "winRate": 0.97,
      "winRateCI95": [
        0.9154806357094724,
        0.9897454759759611
      ],
      "incomplete": 0,
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
          "bothWin": 97,
          "bothLose": 3
        }
      },
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
          "mean": 12.050505,
          "ci95": [
            10.9244,
            13.17661
          ]
        },
        "formedWins": 96,
        "formedLosses": 3,
        "unformedWins": 1,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 3,
        "deadline": 0,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 3
      },
      "survivalRewardDecisions": 0,
      "cautiousRewardDecisions": 0,
      "releasedPollutedRemovals": 0,
      "beforeFormation": {
        "n": 94,
        "mean": 0.955347,
        "ci95": [
          0.923351,
          0.987343
        ]
      },
      "afterFormation": {
        "n": 99,
        "mean": 1.03944,
        "ci95": [
          1.005247,
          1.073633
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 99,
        "mean": 1.120128,
        "ci95": [
          1.11326,
          1.126996
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 99,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 98,
            "mean": 0.944914,
            "ci95": [
              0.909638,
              0.980191
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 99,
            "mean": 0.948295,
            "ci95": [
              0.911591,
              0.985
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 99,
            "mean": 0.958109,
            "ci95": [
              0.918235,
              0.997984
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 99,
            "mean": 1.051342,
            "ci95": [
              1.003735,
              1.098948
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1.092286,
            "ci95": [
              1.085368,
              1.099204
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 99,
            "mean": 1.051216,
            "ci95": [
              1.008815,
              1.093617
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1.095652,
            "ci95": [
              1.088465,
              1.10284
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 99,
            "mean": 1.058592,
            "ci95": [
              1.009608,
              1.107577
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1.100894,
            "ci95": [
              1.092818,
              1.10897
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 99,
            "mean": 1.040462,
            "ci95": [
              0.992826,
              1.088099
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1.10258,
            "ci95": [
              1.09365,
              1.11151
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 99,
            "mean": 1.056313,
            "ci95": [
              1.011501,
              1.101125
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 99,
            "mean": 1.105514,
            "ci95": [
              1.096692,
              1.114337
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 98,
            "mean": 1.060652,
            "ci95": [
              1.017701,
              1.103602
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.109592,
            "ci95": [
              1.100775,
              1.11841
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 1.007091,
        "ci95": [
          0.952889,
          1.061294
        ]
      },
      "finalFormedCounts": {
        "0": 3,
        "1": 28,
        "2": 57,
        "3": 12
      },
      "finalPlannedFormedCounts": {
        "0": 100,
        "1": 0,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": null
    },
    {
      "id": "focus:ink_dot",
      "kind": "focus",
      "focusId": "ink_dot",
      "name": "虚无引爆",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 95,
      "losses": 5,
      "winRate": 0.95,
      "winRateCI95": [
        0.8882495307680808,
        0.9784563208456319
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.02,
          "ci95": [
            -0.114906,
            0.07682
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 5,
          "bothWin": 92,
          "bothLose": 0
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 64,
        "formed": 64,
        "neverFormed": 36,
        "rate": 0.64,
        "ci95": [
          0.5423540245160874,
          0.7272877959859567
        ],
        "turn": {
          "n": 64,
          "mean": 16.03125,
          "ci95": [
            14.71881,
            17.34369
          ]
        },
        "formedWins": 61,
        "formedLosses": 3,
        "unformedWins": 34,
        "unformedLosses": 2
      },
      "failureCauses": {
        "hp": 4,
        "deadline": 1,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 5
      },
      "survivalRewardDecisions": 44,
      "cautiousRewardDecisions": 88,
      "releasedPollutedRemovals": 130,
      "beforeFormation": {
        "n": 100,
        "mean": 0.896179,
        "ci95": [
          0.857749,
          0.93461
        ]
      },
      "afterFormation": {
        "n": 63,
        "mean": 0.914381,
        "ci95": [
          0.869891,
          0.958871
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 63,
        "mean": 1.04906,
        "ci95": [
          1.040935,
          1.057186
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 63,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 64,
            "mean": 0.870104,
            "ci95": [
              0.807604,
              0.932604
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 64,
            "mean": 0.829587,
            "ci95": [
              0.775697,
              0.883476
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 64,
            "mean": 0.852975,
            "ci95": [
              0.800565,
              0.905385
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 64,
            "mean": 0.882454,
            "ci95": [
              0.810769,
              0.954139
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1.045615,
            "ci95": [
              1.036053,
              1.055176
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 64,
            "mean": 0.88702,
            "ci95": [
              0.815752,
              0.958288
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1.044495,
            "ci95": [
              1.034679,
              1.05431
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 64,
            "mean": 0.905983,
            "ci95": [
              0.841593,
              0.970373
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1.047343,
            "ci95": [
              1.037078,
              1.057608
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 64,
            "mean": 0.893759,
            "ci95": [
              0.830194,
              0.957324
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1.045614,
            "ci95": [
              1.035963,
              1.055265
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 64,
            "mean": 0.900861,
            "ci95": [
              0.836194,
              0.965527
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 64,
            "mean": 1.045657,
            "ci95": [
              1.036774,
              1.05454
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 63,
            "mean": 0.92595,
            "ci95": [
              0.870176,
              0.981725
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 63,
            "mean": 1.047972,
            "ci95": [
              1.037978,
              1.057965
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.922342,
        "ci95": [
          0.86183,
          0.982853
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 16,
        "2": 48,
        "3": 36
      },
      "finalPlannedFormedCounts": {
        "0": 46,
        "1": 54,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:follow_up",
      "kind": "focus",
      "focusId": "follow_up",
      "name": "追加投资",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 94,
      "losses": 6,
      "winRate": 0.94,
      "winRateCI95": [
        0.8752318455410406,
        0.9722138760368118
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.03,
          "ci95": [
            -0.11914,
            0.06201
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 2,
          "baselineOnlyWins": 5,
          "bothWin": 92,
          "bothLose": 1
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 90,
        "formed": 90,
        "neverFormed": 10,
        "rate": 0.9,
        "ci95": [
          0.8256343384950865,
          0.9447708629393249
        ],
        "turn": {
          "n": 90,
          "mean": 16.455556,
          "ci95": [
            15.153265,
            17.757846
          ]
        },
        "formedWins": 86,
        "formedLosses": 4,
        "unformedWins": 8,
        "unformedLosses": 2
      },
      "failureCauses": {
        "hp": 5,
        "deadline": 1,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 6
      },
      "survivalRewardDecisions": 44,
      "cautiousRewardDecisions": 76,
      "releasedPollutedRemovals": 66,
      "beforeFormation": {
        "n": 100,
        "mean": 0.932129,
        "ci95": [
          0.898665,
          0.965593
        ]
      },
      "afterFormation": {
        "n": 90,
        "mean": 1.007218,
        "ci95": [
          0.966498,
          1.047938
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 90,
        "mean": 1.092317,
        "ci95": [
          1.083661,
          1.100974
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 90,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 90,
            "mean": 0.930353,
            "ci95": [
              0.885392,
              0.975315
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 90,
            "mean": 0.932933,
            "ci95": [
              0.883688,
              0.982177
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 90,
            "mean": 0.931782,
            "ci95": [
              0.88458,
              0.978984
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 90,
            "mean": 0.979866,
            "ci95": [
              0.931863,
              1.027869
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1.083516,
            "ci95": [
              1.075112,
              1.091921
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 90,
            "mean": 0.991826,
            "ci95": [
              0.941886,
              1.041766
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1.087563,
            "ci95": [
              1.078257,
              1.096869
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 89,
            "mean": 0.991149,
            "ci95": [
              0.941261,
              1.041037
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 89,
            "mean": 1.087889,
            "ci95": [
              1.079453,
              1.096325
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 86,
            "mean": 0.978064,
            "ci95": [
              0.926867,
              1.02926
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 86,
            "mean": 1.088653,
            "ci95": [
              1.080151,
              1.097154
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 85,
            "mean": 0.992858,
            "ci95": [
              0.940394,
              1.045322
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 85,
            "mean": 1.093364,
            "ci95": [
              1.083845,
              1.102883
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 85,
            "mean": 0.974736,
            "ci95": [
              0.925342,
              1.024131
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 85,
            "mean": 1.092984,
            "ci95": [
              1.08388,
              1.102089
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.920669,
        "ci95": [
          0.860374,
          0.980965
        ]
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 21,
        "2": 53,
        "3": 25
      },
      "finalPlannedFormedCounts": {
        "0": 12,
        "1": 88,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:frost",
      "kind": "focus",
      "focusId": "frost",
      "name": "冰盾反击",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 96,
      "losses": 4,
      "winRate": 0.96,
      "winRateCI95": [
        0.9016292856411208,
        0.9843366960084523
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.101259,
            0.082216
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 4,
          "bothWin": 93,
          "bothLose": 0
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 95,
        "formed": 95,
        "neverFormed": 5,
        "rate": 0.95,
        "ci95": [
          0.8882495307680808,
          0.9784563208456319
        ],
        "turn": {
          "n": 95,
          "mean": 10.094737,
          "ci95": [
            8.683435,
            11.506038
          ]
        },
        "formedWins": 91,
        "formedLosses": 4,
        "unformedWins": 5,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 0,
        "deadline": 4,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 4
      },
      "survivalRewardDecisions": 22,
      "cautiousRewardDecisions": 67,
      "releasedPollutedRemovals": 150,
      "beforeFormation": {
        "n": 77,
        "mean": 0.906175,
        "ci95": [
          0.865027,
          0.947323
        ]
      },
      "afterFormation": {
        "n": 94,
        "mean": 0.856737,
        "ci95": [
          0.824144,
          0.889331
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 94,
        "mean": 1.063297,
        "ci95": [
          1.058276,
          1.068319
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 94,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 86,
            "mean": 0.911673,
            "ci95": [
              0.877208,
              0.946137
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 86,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 95,
            "mean": 0.913853,
            "ci95": [
              0.877085,
              0.950621
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 95,
            "mean": 0.908357,
            "ci95": [
              0.866828,
              0.949885
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 95,
            "mean": 0.950963,
            "ci95": [
              0.909795,
              0.992131
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.073453,
            "ci95": [
              1.063929,
              1.082977
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 95,
            "mean": 0.914438,
            "ci95": [
              0.875529,
              0.953348
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.080612,
            "ci95": [
              1.070806,
              1.090417
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 95,
            "mean": 0.932851,
            "ci95": [
              0.88438,
              0.981321
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.075152,
            "ci95": [
              1.065966,
              1.084339
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 95,
            "mean": 0.922569,
            "ci95": [
              0.876089,
              0.969049
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.073815,
            "ci95": [
              1.065782,
              1.081847
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 93,
            "mean": 0.917831,
            "ci95": [
              0.873879,
              0.961783
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 93,
            "mean": 1.075512,
            "ci95": [
              1.067355,
              1.083668
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 92,
            "mean": 0.891172,
            "ci95": [
              0.839349,
              0.942995
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 92,
            "mean": 1.07027,
            "ci95": [
              1.062297,
              1.078243
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.791754,
        "ci95": [
          0.747507,
          0.836001
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 17,
        "2": 43,
        "3": 40
      },
      "finalPlannedFormedCounts": {
        "0": 17,
        "1": 83,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:mentorship",
      "kind": "focus",
      "focusId": "mentorship",
      "name": "仙舟授业",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 97,
      "losses": 3,
      "winRate": 0.97,
      "winRateCI95": [
        0.9154806357094724,
        0.9897454759759611
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0,
          "ci95": [
            -0.076545,
            0.076545
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 2,
          "baselineOnlyWins": 2,
          "bothWin": 95,
          "bothLose": 1
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 84,
        "formed": 84,
        "neverFormed": 16,
        "rate": 0.84,
        "ci95": [
          0.7557973061072976,
          0.8990471151119521
        ],
        "turn": {
          "n": 84,
          "mean": 16.107143,
          "ci95": [
            14.512006,
            17.70228
          ]
        },
        "formedWins": 82,
        "formedLosses": 2,
        "unformedWins": 15,
        "unformedLosses": 1
      },
      "failureCauses": {
        "hp": 1,
        "deadline": 2,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 3
      },
      "survivalRewardDecisions": 30,
      "cautiousRewardDecisions": 70,
      "releasedPollutedRemovals": 126,
      "beforeFormation": {
        "n": 100,
        "mean": 0.883499,
        "ci95": [
          0.848969,
          0.91803
        ]
      },
      "afterFormation": {
        "n": 84,
        "mean": 0.956676,
        "ci95": [
          0.913858,
          0.999495
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 84,
        "mean": 1.076991,
        "ci95": [
          1.068679,
          1.085302
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 84,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 84,
            "mean": 0.890269,
            "ci95": [
              0.843745,
              0.936793
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 84,
            "mean": 0.892152,
            "ci95": [
              0.840935,
              0.943368
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 84,
            "mean": 0.890055,
            "ci95": [
              0.842731,
              0.937379
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 84,
            "mean": 0.931652,
            "ci95": [
              0.885668,
              0.977635
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1.072734,
            "ci95": [
              1.064312,
              1.081157
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 84,
            "mean": 0.94671,
            "ci95": [
              0.900958,
              0.992461
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1.072343,
            "ci95": [
              1.064659,
              1.080027
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 83,
            "mean": 0.954138,
            "ci95": [
              0.899819,
              1.008456
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 83,
            "mean": 1.075658,
            "ci95": [
              1.066573,
              1.084743
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 81,
            "mean": 0.942462,
            "ci95": [
              0.886099,
              0.998825
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 81,
            "mean": 1.075347,
            "ci95": [
              1.065699,
              1.084995
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 81,
            "mean": 0.952549,
            "ci95": [
              0.897111,
              1.007987
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 81,
            "mean": 1.075326,
            "ci95": [
              1.065418,
              1.085233
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 77,
            "mean": 0.93732,
            "ci95": [
              0.882866,
              0.991775
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 77,
            "mean": 1.077705,
            "ci95": [
              1.068034,
              1.087377
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.914355,
        "ci95": [
          0.860995,
          0.967715
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 19,
        "2": 38,
        "3": 43
      },
      "finalPlannedFormedCounts": {
        "0": 16,
        "1": 84,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:puppet",
      "kind": "focus",
      "focusId": "puppet",
      "name": "空间站实验",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 97,
      "losses": 3,
      "winRate": 0.97,
      "winRateCI95": [
        0.9154806357094724,
        0.9897454759759611
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0,
          "ci95": [
            -0.08712,
            0.08712
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 3,
          "bothWin": 94,
          "bothLose": 0
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 90,
        "formed": 90,
        "neverFormed": 10,
        "rate": 0.9,
        "ci95": [
          0.8256343384950865,
          0.9447708629393249
        ],
        "turn": {
          "n": 90,
          "mean": 11.6,
          "ci95": [
            10.054332,
            13.145668
          ]
        },
        "formedWins": 89,
        "formedLosses": 1,
        "unformedWins": 8,
        "unformedLosses": 2
      },
      "failureCauses": {
        "hp": 3,
        "deadline": 0,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 3
      },
      "survivalRewardDecisions": 51,
      "cautiousRewardDecisions": 91,
      "releasedPollutedRemovals": 94,
      "beforeFormation": {
        "n": 84,
        "mean": 0.948305,
        "ci95": [
          0.907413,
          0.989196
        ]
      },
      "afterFormation": {
        "n": 90,
        "mean": 1.018872,
        "ci95": [
          0.983413,
          1.054331
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 90,
        "mean": 1.104025,
        "ci95": [
          1.098198,
          1.109852
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 90,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 88,
            "mean": 0.948441,
            "ci95": [
              0.902733,
              0.994149
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 90,
            "mean": 0.943846,
            "ci95": [
              0.898351,
              0.98934
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 90,
            "mean": 0.925091,
            "ci95": [
              0.878042,
              0.97214
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 90,
            "mean": 1.050978,
            "ci95": [
              0.996243,
              1.105713
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1.104682,
            "ci95": [
              1.096874,
              1.112489
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 90,
            "mean": 1.037696,
            "ci95": [
              0.985122,
              1.09027
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1.105619,
            "ci95": [
              1.098442,
              1.112796
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 89,
            "mean": 1.055644,
            "ci95": [
              1.001416,
              1.109873
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 89,
            "mean": 1.107999,
            "ci95": [
              1.100493,
              1.115504
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 87,
            "mean": 1.036784,
            "ci95": [
              0.979337,
              1.094231
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.104879,
            "ci95": [
              1.096926,
              1.112833
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 87,
            "mean": 1.027325,
            "ci95": [
              0.969016,
              1.085634
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.103755,
            "ci95": [
              1.095598,
              1.111912
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 87,
            "mean": 1.02482,
            "ci95": [
              0.964971,
              1.084669
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.105424,
            "ci95": [
              1.09672,
              1.114128
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.967326,
        "ci95": [
          0.912835,
          1.021817
        ]
      },
      "finalFormedCounts": {
        "0": 3,
        "1": 45,
        "2": 37,
        "3": 15
      },
      "finalPlannedFormedCounts": {
        "0": 14,
        "1": 86,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:recollection",
      "kind": "focus",
      "focusId": "recollection",
      "name": "忆灵共演",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 94,
      "losses": 6,
      "winRate": 0.94,
      "winRateCI95": [
        0.8752318455410406,
        0.9722138760368118
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.03,
          "ci95": [
            -0.11914,
            0.06201
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 2,
          "baselineOnlyWins": 5,
          "bothWin": 92,
          "bothLose": 1
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 88,
        "formed": 88,
        "neverFormed": 12,
        "rate": 0.88,
        "ci95": [
          0.8018790057328857,
          0.9300059356298052
        ],
        "turn": {
          "n": 88,
          "mean": 13.193182,
          "ci95": [
            11.999511,
            14.386853
          ]
        },
        "formedWins": 82,
        "formedLosses": 6,
        "unformedWins": 12,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 4,
        "deadline": 2,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 6
      },
      "survivalRewardDecisions": 54,
      "cautiousRewardDecisions": 92,
      "releasedPollutedRemovals": 125,
      "beforeFormation": {
        "n": 100,
        "mean": 0.910609,
        "ci95": [
          0.875106,
          0.946112
        ]
      },
      "afterFormation": {
        "n": 88,
        "mean": 0.914933,
        "ci95": [
          0.881958,
          0.947908
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 88,
        "mean": 1.077124,
        "ci95": [
          1.069377,
          1.084871
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 88,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 88,
            "mean": 0.906849,
            "ci95": [
              0.858568,
              0.95513
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.001783,
            "ci95": [
              0.999106,
              1.004459
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 88,
            "mean": 0.906204,
            "ci95": [
              0.862373,
              0.950035
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.003336,
            "ci95": [
              0.999461,
              1.007211
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 88,
            "mean": 0.894133,
            "ci95": [
              0.850339,
              0.937927
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.002383,
            "ci95": [
              0.999681,
              1.005085
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 88,
            "mean": 0.934662,
            "ci95": [
              0.891554,
              0.97777
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.07711,
            "ci95": [
              1.068154,
              1.086066
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 88,
            "mean": 0.937985,
            "ci95": [
              0.896409,
              0.979562
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.076506,
            "ci95": [
              1.068018,
              1.084993
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 88,
            "mean": 0.932511,
            "ci95": [
              0.890058,
              0.974963
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.076397,
            "ci95": [
              1.067707,
              1.085086
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 88,
            "mean": 0.919797,
            "ci95": [
              0.877037,
              0.962556
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.076385,
            "ci95": [
              1.066926,
              1.085845
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 88,
            "mean": 0.938908,
            "ci95": [
              0.896459,
              0.981357
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 88,
            "mean": 1.075477,
            "ci95": [
              1.066584,
              1.084371
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 87,
            "mean": 0.922302,
            "ci95": [
              0.877629,
              0.966975
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.077192,
            "ci95": [
              1.068719,
              1.085666
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.87492,
        "ci95": [
          0.81669,
          0.93315
        ]
      },
      "finalFormedCounts": {
        "0": 2,
        "1": 16,
        "2": 47,
        "3": 35
      },
      "finalPlannedFormedCounts": {
        "0": 13,
        "1": 87,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:elation",
      "kind": "focus",
      "focusId": "elation",
      "name": "欢愉谢幕",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 94,
      "losses": 6,
      "winRate": 0.94,
      "winRateCI95": [
        0.8752318455410406,
        0.9722138760368118
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.03,
          "ci95": [
            -0.128169,
            0.071039
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 6,
          "bothWin": 91,
          "bothLose": 0
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 84,
        "formed": 84,
        "neverFormed": 16,
        "rate": 0.84,
        "ci95": [
          0.7557973061072976,
          0.8990471151119521
        ],
        "turn": {
          "n": 84,
          "mean": 11.714286,
          "ci95": [
            10.053638,
            13.374934
          ]
        },
        "formedWins": 79,
        "formedLosses": 5,
        "unformedWins": 15,
        "unformedLosses": 1
      },
      "failureCauses": {
        "hp": 0,
        "deadline": 6,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 6
      },
      "survivalRewardDecisions": 34,
      "cautiousRewardDecisions": 66,
      "releasedPollutedRemovals": 128,
      "beforeFormation": {
        "n": 88,
        "mean": 0.917119,
        "ci95": [
          0.872739,
          0.961499
        ]
      },
      "afterFormation": {
        "n": 84,
        "mean": 0.870494,
        "ci95": [
          0.831101,
          0.909886
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 84,
        "mean": 1.077819,
        "ci95": [
          1.070266,
          1.085372
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 84,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 84,
            "mean": 0.925327,
            "ci95": [
              0.868219,
              0.982435
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 84,
            "mean": 0.915614,
            "ci95": [
              0.862597,
              0.968631
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 84,
            "mean": 0.880613,
            "ci95": [
              0.831942,
              0.929283
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 84,
            "mean": 0.902187,
            "ci95": [
              0.838398,
              0.965977
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1.06073,
            "ci95": [
              1.051834,
              1.069625
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 84,
            "mean": 0.894815,
            "ci95": [
              0.838922,
              0.950707
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1.066618,
            "ci95": [
              1.056884,
              1.076353
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 84,
            "mean": 0.881673,
            "ci95": [
              0.828391,
              0.934955
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 84,
            "mean": 1.06788,
            "ci95": [
              1.059386,
              1.076374
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 83,
            "mean": 0.885683,
            "ci95": [
              0.8262,
              0.945166
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 83,
            "mean": 1.067484,
            "ci95": [
              1.058659,
              1.076308
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 80,
            "mean": 0.904104,
            "ci95": [
              0.837055,
              0.971154
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 80,
            "mean": 1.071382,
            "ci95": [
              1.061901,
              1.080864
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 80,
            "mean": 0.856459,
            "ci95": [
              0.808455,
              0.904463
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 80,
            "mean": 1.072376,
            "ci95": [
              1.062273,
              1.082479
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.828296,
        "ci95": [
          0.773687,
          0.882906
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 18,
        "2": 45,
        "3": 37
      },
      "finalPlannedFormedCounts": {
        "0": 27,
        "1": 73,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "focus:break",
      "kind": "focus",
      "focusId": "break",
      "name": "击破接力",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 96,
      "losses": 4,
      "winRate": 0.96,
      "winRateCI95": [
        0.9016292856411208,
        0.9843366960084523
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.01,
          "ci95": [
            -0.101259,
            0.082216
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 4,
          "bothWin": 93,
          "bothLose": 0
        }
      },
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
          "mean": 13.011494,
          "ci95": [
            11.999934,
            14.023054
          ]
        },
        "formedWins": 83,
        "formedLosses": 4,
        "unformedWins": 13,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 2,
        "deadline": 2,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 1,
        "12": 3
      },
      "survivalRewardDecisions": 40,
      "cautiousRewardDecisions": 64,
      "releasedPollutedRemovals": 159,
      "beforeFormation": {
        "n": 100,
        "mean": 0.900412,
        "ci95": [
          0.863523,
          0.9373
        ]
      },
      "afterFormation": {
        "n": 87,
        "mean": 0.940777,
        "ci95": [
          0.903847,
          0.977706
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 87,
        "mean": 1.081986,
        "ci95": [
          1.074802,
          1.08917
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
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 87,
            "mean": 0.867903,
            "ci95": [
              0.827168,
              0.908638
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 87,
            "mean": 0.869904,
            "ci95": [
              0.820843,
              0.918965
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 87,
            "mean": 0.904111,
            "ci95": [
              0.852531,
              0.95569
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.000926,
            "ci95": [
              0.999111,
              1.00274
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 87,
            "mean": 0.942325,
            "ci95": [
              0.894358,
              0.990291
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.076833,
            "ci95": [
              1.069007,
              1.084658
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 87,
            "mean": 0.929765,
            "ci95": [
              0.876949,
              0.982581
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.078833,
            "ci95": [
              1.070979,
              1.086686
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 87,
            "mean": 0.952666,
            "ci95": [
              0.90121,
              1.004122
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.081419,
            "ci95": [
              1.073213,
              1.089625
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 87,
            "mean": 0.969396,
            "ci95": [
              0.916957,
              1.021835
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.079703,
            "ci95": [
              1.071476,
              1.08793
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 87,
            "mean": 0.938654,
            "ci95": [
              0.888856,
              0.988452
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.08039,
            "ci95": [
              1.072313,
              1.088467
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 87,
            "mean": 0.924981,
            "ci95": [
              0.875811,
              0.974151
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 87,
            "mean": 1.082607,
            "ci95": [
              1.074545,
              1.090668
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.919372,
        "ci95": [
          0.86409,
          0.974654
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 15,
        "2": 49,
        "3": 36
      },
      "finalPlannedFormedCounts": {
        "0": 14,
        "1": 86,
        "2": 0
      },
      "abandonedRuns": 0,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "adaptive:2",
      "kind": "adaptive",
      "slots": 2,
      "name": "同时准备 2 套路",
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
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": 0.01,
          "ci95": [
            -0.072311,
            0.091354
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 3,
          "baselineOnlyWins": 2,
          "bothWin": 95,
          "bothLose": 0
        }
      },
      "formation": {
        "n": 100,
        "enrolledN": 100,
        "censoredIncomplete": 0,
        "observedFormedIncludingIncomplete": 96,
        "formed": 96,
        "neverFormed": 4,
        "rate": 0.96,
        "ci95": [
          0.9016292856411208,
          0.9843366960084523
        ],
        "turn": {
          "n": 96,
          "mean": 7.958333,
          "ci95": [
            6.918332,
            8.998335
          ]
        },
        "formedWins": 94,
        "formedLosses": 2,
        "unformedWins": 4,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 0,
        "deadline": 2,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 2
      },
      "survivalRewardDecisions": 40,
      "cautiousRewardDecisions": 82,
      "releasedPollutedRemovals": 179,
      "beforeFormation": {
        "n": 74,
        "mean": 0.891528,
        "ci95": [
          0.844801,
          0.938254
        ]
      },
      "afterFormation": {
        "n": 96,
        "mean": 0.925212,
        "ci95": [
          0.886411,
          0.964013
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 96,
        "mean": 1.1143,
        "ci95": [
          1.106237,
          1.122363
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 96,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 90,
            "mean": 0.903733,
            "ci95": [
              0.864898,
              0.942567
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 90,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 96,
            "mean": 0.92029,
            "ci95": [
              0.877289,
              0.963292
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 96,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 96,
            "mean": 0.923307,
            "ci95": [
              0.869457,
              0.977157
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 96,
            "mean": 1.001493,
            "ci95": [
              0.998566,
              1.00442
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 96,
            "mean": 1.00755,
            "ci95": [
              0.952861,
              1.06224
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 96,
            "mean": 1.093037,
            "ci95": [
              1.083084,
              1.102991
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 96,
            "mean": 0.9877,
            "ci95": [
              0.929884,
              1.045516
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 96,
            "mean": 1.103009,
            "ci95": [
              1.093376,
              1.112642
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 95,
            "mean": 0.99764,
            "ci95": [
              0.931069,
              1.064211
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.103874,
            "ci95": [
              1.094581,
              1.113167
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 95,
            "mean": 1.01868,
            "ci95": [
              0.956276,
              1.081084
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.105157,
            "ci95": [
              1.096047,
              1.114267
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 95,
            "mean": 0.998484,
            "ci95": [
              0.935848,
              1.061119
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.107224,
            "ci95": [
              1.097966,
              1.116482
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 95,
            "mean": 1.004852,
            "ci95": [
              0.940036,
              1.069668
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 95,
            "mean": 1.108843,
            "ci95": [
              1.099321,
              1.118364
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.853074,
        "ci95": [
          0.812523,
          0.893625
        ]
      },
      "finalFormedCounts": {
        "0": 1,
        "1": 25,
        "2": 40,
        "3": 34
      },
      "finalPlannedFormedCounts": {
        "0": 8,
        "1": 50,
        "2": 42
      },
      "abandonedRuns": 44,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    },
    {
      "id": "adaptive:3",
      "kind": "adaptive",
      "slots": 3,
      "name": "同时准备 3 套路",
      "n": 100,
      "completed": 100,
      "winRateDenominator": 100,
      "wins": 93,
      "losses": 7,
      "winRate": 0.93,
      "winRateCI95": [
        0.8625048526092651,
        0.9656807389327273
      ],
      "incomplete": 0,
      "pairedBaseline": {
        "pairedSeeds": 100,
        "incompletePairs": 0,
        "difference": {
          "n": 100,
          "mean": -0.04,
          "ci95": [
            -0.132403,
            0.05623
          ],
          "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
        },
        "outcomes": {
          "policyOnlyWins": 2,
          "baselineOnlyWins": 6,
          "bothWin": 91,
          "bothLose": 1
        }
      },
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
          "mean": 6.877551,
          "ci95": [
            6.116166,
            7.638936
          ]
        },
        "formedWins": 91,
        "formedLosses": 7,
        "unformedWins": 2,
        "unformedLosses": 0
      },
      "failureCauses": {
        "hp": 0,
        "deadline": 7,
        "other": 0
      },
      "failureFloors": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 7
      },
      "survivalRewardDecisions": 36,
      "cautiousRewardDecisions": 77,
      "releasedPollutedRemovals": 182,
      "beforeFormation": {
        "n": 73,
        "mean": 0.906968,
        "ci95": [
          0.854564,
          0.959372
        ]
      },
      "afterFormation": {
        "n": 98,
        "mean": 0.889768,
        "ci95": [
          0.853792,
          0.925745
        ]
      },
      "effectsOnlyPowerRatio": {
        "n": 98,
        "mean": 1.120061,
        "ci95": [
          1.112441,
          1.12768
        ]
      },
      "effectsOnlyGrowthPerSpin": {
        "n": 98,
        "mean": 0,
        "ci95": [
          0,
          0
        ]
      },
      "formationEventWindow": [
        {
          "offset": -3,
          "progress": {
            "n": 94,
            "mean": 0.921309,
            "ci95": [
              0.877003,
              0.965615
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 94,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": -2,
          "progress": {
            "n": 98,
            "mean": 0.922517,
            "ci95": [
              0.876047,
              0.968987
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.001544,
            "ci95": [
              0.998518,
              1.004571
            ]
          }
        },
        {
          "offset": -1,
          "progress": {
            "n": 98,
            "mean": 0.895351,
            "ci95": [
              0.848841,
              0.941862
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1,
            "ci95": [
              1,
              1
            ]
          }
        },
        {
          "offset": 0,
          "progress": {
            "n": 98,
            "mean": 0.991831,
            "ci95": [
              0.935723,
              1.047939
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.092537,
            "ci95": [
              1.082392,
              1.102682
            ]
          }
        },
        {
          "offset": 1,
          "progress": {
            "n": 98,
            "mean": 0.991223,
            "ci95": [
              0.929758,
              1.052689
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.092794,
            "ci95": [
              1.083362,
              1.102227
            ]
          }
        },
        {
          "offset": 2,
          "progress": {
            "n": 98,
            "mean": 0.97601,
            "ci95": [
              0.918898,
              1.033123
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.103682,
            "ci95": [
              1.094482,
              1.112881
            ]
          }
        },
        {
          "offset": 3,
          "progress": {
            "n": 98,
            "mean": 0.99595,
            "ci95": [
              0.942122,
              1.049779
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.103257,
            "ci95": [
              1.09382,
              1.112695
            ]
          }
        },
        {
          "offset": 4,
          "progress": {
            "n": 98,
            "mean": 0.969634,
            "ci95": [
              0.916806,
              1.022463
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.106825,
            "ci95": [
              1.097419,
              1.116231
            ]
          }
        },
        {
          "offset": 5,
          "progress": {
            "n": 98,
            "mean": 0.972781,
            "ci95": [
              0.921179,
              1.024382
            ]
          },
          "effectsOnlyPowerRatio": {
            "n": 98,
            "mean": 1.109555,
            "ci95": [
              1.099953,
              1.119157
            ]
          }
        }
      ],
      "finalAllSampleProgress": {
        "n": 100,
        "mean": 0.812166,
        "ci95": [
          0.755693,
          0.86864
        ]
      },
      "finalFormedCounts": {
        "0": 0,
        "1": 12,
        "2": 49,
        "3": 39
      },
      "finalPlannedFormedCounts": {
        "0": 4,
        "1": 34,
        "2": 62
      },
      "abandonedRuns": 100,
      "checks": {
        "effectsOnlyNotNegative": true,
        "noArchetypeAutoGrowth": true,
        "statisticallyClearEffects": true,
        "incompleteZero": true,
        "passesRulesRegression": true
      }
    }
  ],
  "recruitmentCoverage": {
    "terminalCampaigns": 1100,
    "pairedSeedBlocks": 100,
    "recruitedCardIds": 90,
    "totalCharacterPicks": 29502,
    "roles": [
      {
        "role": "attack",
        "name": "攻击",
        "distinctCardIds": 44,
        "totalCardIds": 44,
        "picks": 20944
      },
      {
        "role": "defense",
        "name": "防御",
        "distinctCardIds": 15,
        "totalCardIds": 15,
        "picks": 1795
      },
      {
        "role": "amplifier",
        "name": "即时增幅",
        "distinctCardIds": 9,
        "totalCardIds": 9,
        "picks": 2256
      },
      {
        "role": "trainer",
        "name": "永久培养",
        "distinctCardIds": 10,
        "totalCardIds": 10,
        "picks": 1320
      },
      {
        "role": "disruptor",
        "name": "敌方干扰",
        "distinctCardIds": 12,
        "totalCardIds": 12,
        "picks": 3187
      }
    ],
    "zeroPickCards": [],
    "cards": [
      {
        "id": "1001",
        "name": "三月七",
        "role": "defense",
        "picks": 190
      },
      {
        "id": "1002",
        "name": "丹恒",
        "role": "attack",
        "picks": 656
      },
      {
        "id": "1003",
        "name": "姬子",
        "role": "attack",
        "picks": 812
      },
      {
        "id": "1004",
        "name": "瓦尔特",
        "role": "disruptor",
        "picks": 272
      },
      {
        "id": "1005",
        "name": "卡芙卡",
        "role": "disruptor",
        "picks": 85
      },
      {
        "id": "1006",
        "name": "银狼",
        "role": "disruptor",
        "picks": 109
      },
      {
        "id": "1008",
        "name": "阿兰",
        "role": "attack",
        "picks": 529
      },
      {
        "id": "1009",
        "name": "艾丝妲",
        "role": "trainer",
        "picks": 60
      },
      {
        "id": "1013",
        "name": "黑塔",
        "role": "attack",
        "picks": 1084
      },
      {
        "id": "1101",
        "name": "布洛妮娅",
        "role": "amplifier",
        "picks": 158
      },
      {
        "id": "1102",
        "name": "希儿",
        "role": "attack",
        "picks": 406
      },
      {
        "id": "1103",
        "name": "希露瓦",
        "role": "attack",
        "picks": 958
      },
      {
        "id": "1104",
        "name": "杰帕德",
        "role": "defense",
        "picks": 168
      },
      {
        "id": "1105",
        "name": "娜塔莎",
        "role": "defense",
        "picks": 74
      },
      {
        "id": "1106",
        "name": "佩拉",
        "role": "disruptor",
        "picks": 266
      },
      {
        "id": "1107",
        "name": "克拉拉",
        "role": "attack",
        "picks": 421
      },
      {
        "id": "1108",
        "name": "桑博",
        "role": "disruptor",
        "picks": 387
      },
      {
        "id": "1109",
        "name": "虎克",
        "role": "attack",
        "picks": 794
      },
      {
        "id": "1205",
        "name": "刃",
        "role": "attack",
        "picks": 81
      },
      {
        "id": "1204",
        "name": "景元",
        "role": "attack",
        "picks": 170
      },
      {
        "id": "1203",
        "name": "罗刹",
        "role": "defense",
        "picks": 150
      },
      {
        "id": "1208",
        "name": "符玄",
        "role": "defense",
        "picks": 111
      },
      {
        "id": "1201",
        "name": "青雀",
        "role": "attack",
        "picks": 731
      },
      {
        "id": "1202",
        "name": "停云",
        "role": "amplifier",
        "picks": 255
      },
      {
        "id": "1110",
        "name": "玲可",
        "role": "defense",
        "picks": 154
      },
      {
        "id": "1111",
        "name": "卢卡",
        "role": "disruptor",
        "picks": 339
      },
      {
        "id": "1112",
        "name": "托帕&账账",
        "role": "attack",
        "picks": 320
      },
      {
        "id": "1206",
        "name": "素裳",
        "role": "attack",
        "picks": 499
      },
      {
        "id": "1207",
        "name": "驭空",
        "role": "trainer",
        "picks": 78
      },
      {
        "id": "1209",
        "name": "彦卿",
        "role": "attack",
        "picks": 554
      },
      {
        "id": "1210",
        "name": "桂乃芬",
        "role": "disruptor",
        "picks": 654
      },
      {
        "id": "1211",
        "name": "白露",
        "role": "defense",
        "picks": 53
      },
      {
        "id": "1212",
        "name": "镜流",
        "role": "attack",
        "picks": 271
      },
      {
        "id": "1214",
        "name": "雪衣",
        "role": "attack",
        "picks": 286
      },
      {
        "id": "1215",
        "name": "寒鸦",
        "role": "trainer",
        "picks": 169
      },
      {
        "id": "1217",
        "name": "藿藿",
        "role": "defense",
        "picks": 28
      },
      {
        "id": "1218",
        "name": "椒丘",
        "role": "disruptor",
        "picks": 388
      },
      {
        "id": "1220",
        "name": "飞霄",
        "role": "attack",
        "picks": 107
      },
      {
        "id": "1221",
        "name": "云璃",
        "role": "attack",
        "picks": 372
      },
      {
        "id": "1222",
        "name": "灵砂",
        "role": "defense",
        "picks": 95
      },
      {
        "id": "1223",
        "name": "貊泽",
        "role": "attack",
        "picks": 356
      },
      {
        "id": "1301",
        "name": "加拉赫",
        "role": "defense",
        "picks": 156
      },
      {
        "id": "1302",
        "name": "银枝",
        "role": "attack",
        "picks": 821
      },
      {
        "id": "1303",
        "name": "阮·梅",
        "role": "trainer",
        "picks": 327
      },
      {
        "id": "1304",
        "name": "砂金",
        "role": "defense",
        "picks": 38
      },
      {
        "id": "1305",
        "name": "真理医生",
        "role": "attack",
        "picks": 350
      },
      {
        "id": "1306",
        "name": "花火",
        "role": "amplifier",
        "picks": 294
      },
      {
        "id": "1307",
        "name": "黑天鹅",
        "role": "trainer",
        "picks": 118
      },
      {
        "id": "1308",
        "name": "黄泉",
        "role": "attack",
        "picks": 187
      },
      {
        "id": "1309",
        "name": "知更鸟",
        "role": "amplifier",
        "picks": 274
      },
      {
        "id": "1310",
        "name": "流萤",
        "role": "attack",
        "picks": 464
      },
      {
        "id": "1312",
        "name": "米沙",
        "role": "attack",
        "picks": 791
      },
      {
        "id": "1313",
        "name": "星期日",
        "role": "amplifier",
        "picks": 244
      },
      {
        "id": "1314",
        "name": "翡翠",
        "role": "attack",
        "picks": 667
      },
      {
        "id": "1315",
        "name": "波提欧",
        "role": "attack",
        "picks": 217
      },
      {
        "id": "1317",
        "name": "乱破",
        "role": "attack",
        "picks": 697
      },
      {
        "id": "1402",
        "name": "阿格莱雅",
        "role": "attack",
        "picks": 272
      },
      {
        "id": "1403",
        "name": "缇宝",
        "role": "trainer",
        "picks": 168
      },
      {
        "id": "1404",
        "name": "万敌",
        "role": "attack",
        "picks": 172
      },
      {
        "id": "1405",
        "name": "那刻夏",
        "role": "attack",
        "picks": 784
      },
      {
        "id": "1406",
        "name": "赛飞儿",
        "role": "disruptor",
        "picks": 168
      },
      {
        "id": "1407",
        "name": "遐蝶",
        "role": "attack",
        "picks": 155
      },
      {
        "id": "1408",
        "name": "白厄",
        "role": "attack",
        "picks": 61
      },
      {
        "id": "1409",
        "name": "风堇",
        "role": "defense",
        "picks": 46
      },
      {
        "id": "march_hunt",
        "name": "三月七·巡猎",
        "role": "attack",
        "picks": 761
      },
      {
        "id": "dan_heng_imbibitor_lunae",
        "name": "丹恒·饮月",
        "role": "attack",
        "picks": 522
      },
      {
        "id": "dan_heng_pt",
        "name": "丹恒·腾荒",
        "role": "defense",
        "picks": 351
      },
      {
        "id": "fugue",
        "name": "忘归人",
        "role": "disruptor",
        "picks": 110
      },
      {
        "id": "the_herta",
        "name": "大黑塔",
        "role": "attack",
        "picks": 1103
      },
      {
        "id": "hysilens",
        "name": "海瑟音",
        "role": "disruptor",
        "picks": 221
      },
      {
        "id": "cerydra",
        "name": "刻律德菈",
        "role": "amplifier",
        "picks": 371
      },
      {
        "id": "evernight",
        "name": "长夜月",
        "role": "attack",
        "picks": 233
      },
      {
        "id": "cyrene",
        "name": "昔涟",
        "role": "trainer",
        "picks": 81
      },
      {
        "id": "saber",
        "name": "Saber",
        "role": "attack",
        "picks": 346
      },
      {
        "id": "archer",
        "name": "Archer",
        "role": "attack",
        "picks": 182
      },
      {
        "id": "yao_guang",
        "name": "爻光",
        "role": "trainer",
        "picks": 121
      },
      {
        "id": "sparxie",
        "name": "火花",
        "role": "attack",
        "picks": 340
      },
      {
        "id": "ashveil",
        "name": "不死途",
        "role": "attack",
        "picks": 297
      },
      {
        "id": "silver_wolf_lv999",
        "name": "银狼LV.999",
        "role": "attack",
        "picks": 157
      },
      {
        "id": "evanescia",
        "name": "绯英",
        "role": "amplifier",
        "picks": 116
      },
      {
        "id": "mortenax_blade",
        "name": "千冶·刃",
        "role": "attack",
        "picks": 400
      },
      {
        "id": "the_dahlia",
        "name": "大丽花",
        "role": "disruptor",
        "picks": 188
      },
      {
        "id": "announced_himeko_nova",
        "name": "姬子·启行",
        "role": "attack",
        "picks": 997
      },
      {
        "id": "announced_gilgamesh",
        "name": "吉尔伽美什",
        "role": "attack",
        "picks": 561
      },
      {
        "id": "announced_rin_tohsaka",
        "name": "远坂凛",
        "role": "amplifier",
        "picks": 430
      },
      {
        "id": "aha",
        "name": "阿哈",
        "role": "trainer",
        "picks": 28
      },
      {
        "id": "pearl",
        "name": "真珠",
        "role": "trainer",
        "picks": 170
      },
      {
        "id": "robin_summeretto",
        "name": "知更鸟·晴歌",
        "role": "defense",
        "picks": 93
      },
      {
        "id": "aventurine_waveflair",
        "name": "砂金·戏浪",
        "role": "defense",
        "picks": 88
      },
      {
        "id": "aeon_star_aha",
        "name": "星神★阿哈",
        "role": "amplifier",
        "picks": 114
      }
    ]
  },
  "stress": {
    "gameVersion": "0.6.0",
    "version": "archetype-campaign-v4-bound-roles",
    "samplePurpose": "stress",
    "seed": "v060-release-20261021-bound-r1",
    "difficulty": 20,
    "contentCount": 90,
    "runsPerStrategy": 100,
    "strength": 24,
    "lookahead": false,
    "policyVersion": "v060-bound-role-actions-v1",
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
    "planning": {
      "source": "shared-AI-marginal-reward-scores",
      "knownFutureRewards": false,
      "actions": "same real engine resource actions; selected lines protect their final recruited identity only while safe; polluted units are never protected; visible missing required core or last forming identity cancels reroll only while safe",
      "baseStrength": 24,
      "newIdentityBonus": "strength × lineWeight × survivalScale",
      "alreadyOwnedIdentityBonus": "strength × lineWeight × 0.45 × survivalScale",
      "missingCoreBonus": "strength × 0.6 × survivalScale",
      "lineWeight": {
        "formed": 1.8,
        "unformedWithOtherFormed": 0.5,
        "unformed": 1
      },
      "survivalScale": "0 if hp/maxHp<.3 with shield<10, or <=2 encounter spins remain and enemy HP exceeds .9 × last observed damage × remaining spins, or last encounter spin; .25 if hp/maxHp<.55 with shield<15 or <=2 encounter spins; otherwise1. No hidden RNG or future board used.",
      "temperature": 5,
      "skip": "retained as a real competing action",
      "adaptive": "first visible offer chooses 2/3 lines; >=10 spins retain at most2; >=12 with a formed line retain only formed plus one >=0.6-progress backup; >=18 with no formed retain one; >=2 formed retain two; >=6 spins under critical health or trailing deadline drop unformed lines below .7 progress, retaining at least one"
    },
    "probeProtocol": {
      "version": "canonical-spin-v1",
      "enemyCount": 5,
      "enemyHp": 1000000,
      "enemyAttack": 5,
      "hpFraction": 0.5,
      "defenseWeight": 0.36,
      "activeDebuffs": false,
      "overclock": false,
      "samples": 3
    },
    "sourceHashes": {
      "src/content.js": "feaba9615a5a17afb3aa882c5457301ff0352936dae59483ad9768526a2ed1cc",
      "src/retirements.js": "f6cfe52e5b4f92770902c346ab392077bf35188563ac3b649774c2af58de2671",
      "src/retirement-ai.js": "0047d32d02cb2ba4b1f5fa81fa7b0186749029ee189f33230959fc58e136773e",
      "src/archetypes.js": "6216691ddc609495588e8d0417cb4dd837e842b34307a39cf36b7d1944680bba",
      "src/effect-rules.js": "338aceed777f1d70fe66b2e51eeb2d58335d9fcda688ef94c3b48e9025310196",
      "src/synergies.js": "c0fd8e9466ffb0b57c1c4ebfd4da99c1b5ab758b8755598c4a679ad0ab61c0d4",
      "src/difficulty.js": "ad084791166970c7abcfc1f76783d424d6d98ba0c35f9bcb913a745040798943",
      "src/enemy-effects.js": "0cb8d0a134e6b87d413ef4a43b99c783f1a3699d448491b8598f700f2927bb6e",
      "src/engine.js": "c9df216d093ee665160045d922fb4e11bf80565797a34ec7d4684673313e7529",
      "src/ai-profile.js": "2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206",
      "src/ai.js": "733007793545ae32ef24466fc00364524e3d4291db4c4cdc1c8d27cc3ddbd631",
      "src/simulation.js": "fb59f4744192e62d6ed2bf363f89e6576b9ac7481f8c3550f7a92ec0cac47e95",
      "src/archetype-simulation.js": "1222070fe1b0896181a01b323598e8f5b4ef25bad95b38d9499d038d02a0776f",
      "scripts/archetype-balance.mjs": "54043a23adbc4f7353cade37e19f75f5290db9b620a6318dc194c450062f2f21"
    },
    "sourceStable": true,
    "elapsedMs": 838830,
    "interpretation": {
      "power": "真实引擎标准敌阵探针：实伤 + 0.36 ×（实治疗 + min(25,实格挡+减伤) − 自伤）",
      "growth": "本次探针实际新增永久培养；攻击者转为威力，支援转为标记职能效能；不混入当前战力",
      "progression": "成型前后摘要使用同转仍在对局基线均值作分母；byTurn另外并列全样本进度。v1历史校准的阶段摘要使用全样本基线分母，不能直接跨协议比较",
      "allSample": "全样本平均：死亡当转及以后记0；胜利后保持终局战力；全样本进度与只统计仍在对局样本并列",
      "intervention": "同一状态、同一探针种子，仅关闭目标套路效果；测即时机制贡献，不能推断通关率因果",
      "conditional": "成型后表现、成型事件窗口和成型/未成型胜率属于观察性关联；同时报告未成型失败及各转幸存人数",
      "intervals": "胜率与成型率为Wilson95%；战力/成型回合为以每局为单位的均值正态95%区间；小样本不保证正态近似，n<2不报区间",
      "thresholds": "0.6规则检查要求无未完成局、同状态套路贡献不为负、无套路自动永久成长；它只验证规则边界，不代表通关难度或所有套路等强。0.5的成长补偿门槛已不适用"
    },
    "reportPath": "docs/benchmarks/archetype-v060-stress-d20.json",
    "strategies": [
      {
        "id": "baseline",
        "kind": "baseline",
        "name": "无套路偏好 AI",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 15,
        "losses": 85,
        "winRate": 0.15,
        "winRateCI95": [
          0.0930598528365663,
          0.23283559590832364
        ],
        "incomplete": 0,
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
            "bothWin": 15,
            "bothLose": 85
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 100,
          "formed": 100,
          "neverFormed": 0,
          "rate": 1,
          "ci95": [
            0.9630065017930143,
            1
          ],
          "turn": {
            "n": 100,
            "mean": 12.26,
            "ci95": [
              10.90192,
              13.61808
            ]
          },
          "formedWins": 15,
          "formedLosses": 85,
          "unformedWins": 0,
          "unformedLosses": 0
        },
        "failureCauses": {
          "hp": 31,
          "deadline": 54,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 1,
          "10": 5,
          "11": 11,
          "12": 68
        },
        "survivalRewardDecisions": 0,
        "cautiousRewardDecisions": 0,
        "releasedPollutedRemovals": 0,
        "beforeFormation": {
          "n": 87,
          "mean": 0.919662,
          "ci95": [
            0.888821,
            0.950503
          ]
        },
        "afterFormation": {
          "n": 100,
          "mean": 1.031389,
          "ci95": [
            0.998543,
            1.064234
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 100,
          "mean": 1.137014,
          "ci95": [
            1.130306,
            1.143723
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 100,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 100,
              "mean": 0.91623,
              "ci95": [
                0.880063,
                0.952396
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 100,
              "mean": 0.932873,
              "ci95": [
                0.893706,
                0.97204
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.00065,
              "ci95": [
                0.999376,
                1.001923
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 100,
              "mean": 0.928058,
              "ci95": [
                0.889564,
                0.966551
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 100,
              "mean": 1.027923,
              "ci95": [
                0.970043,
                1.085802
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.091631,
              "ci95": [
                1.08472,
                1.098541
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 100,
              "mean": 1.009719,
              "ci95": [
                0.959992,
                1.059447
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.097374,
              "ci95": [
                1.089697,
                1.105052
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 100,
              "mean": 1.079762,
              "ci95": [
                1.023677,
                1.135847
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.105722,
              "ci95": [
                1.097326,
                1.114117
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 100,
              "mean": 1.045135,
              "ci95": [
                0.991176,
                1.099094
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.10604,
              "ci95": [
                1.097987,
                1.114094
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 100,
              "mean": 1.036784,
              "ci95": [
                0.989535,
                1.084033
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.111053,
              "ci95": [
                1.10291,
                1.119196
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 100,
              "mean": 1.05238,
              "ci95": [
                1.000759,
                1.104001
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.116445,
              "ci95": [
                1.108125,
                1.124765
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.362707,
          "ci95": [
            0.182407,
            0.543006
          ]
        },
        "finalFormedCounts": {
          "0": 2,
          "1": 23,
          "2": 45,
          "3": 30
        },
        "finalPlannedFormedCounts": {
          "0": 100,
          "1": 0,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": null
      },
      {
        "id": "focus:ink_dot",
        "kind": "focus",
        "focusId": "ink_dot",
        "name": "虚无引爆",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 17,
        "losses": 83,
        "winRate": 0.17,
        "winRateCI95": [
          0.10893566114059931,
          0.25548004767601123
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.02,
            "ci95": [
              -0.140591,
              0.178678
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 16,
            "baselineOnlyWins": 14,
            "bothWin": 1,
            "bothLose": 69
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 80,
          "formed": 80,
          "neverFormed": 20,
          "rate": 0.8,
          "ci95": [
            0.7111708344068411,
            0.8666330666689676
          ],
          "turn": {
            "n": 80,
            "mean": 19.95,
            "ci95": [
              18.055992,
              21.844008
            ]
          },
          "formedWins": 12,
          "formedLosses": 68,
          "unformedWins": 5,
          "unformedLosses": 15
        },
        "failureCauses": {
          "hp": 22,
          "deadline": 61,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 1,
          "10": 8,
          "11": 15,
          "12": 59
        },
        "survivalRewardDecisions": 315,
        "cautiousRewardDecisions": 258,
        "releasedPollutedRemovals": 173,
        "beforeFormation": {
          "n": 100,
          "mean": 0.886496,
          "ci95": [
            0.850818,
            0.922173
          ]
        },
        "afterFormation": {
          "n": 79,
          "mean": 0.893384,
          "ci95": [
            0.847321,
            0.939446
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 79,
          "mean": 1.038359,
          "ci95": [
            1.032451,
            1.044268
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 79,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 80,
              "mean": 0.862467,
              "ci95": [
                0.809965,
                0.91497
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 80,
              "mean": 0.882008,
              "ci95": [
                0.824701,
                0.939315
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 80,
              "mean": 0.892443,
              "ci95": [
                0.840506,
                0.94438
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 80,
              "mean": 0.893386,
              "ci95": [
                0.833387,
                0.953386
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1.034667,
              "ci95": [
                1.027395,
                1.041939
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 80,
              "mean": 0.907622,
              "ci95": [
                0.846041,
                0.969203
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1.037288,
              "ci95": [
                1.029896,
                1.04468
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 80,
              "mean": 0.9123,
              "ci95": [
                0.850312,
                0.974288
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1.036131,
              "ci95": [
                1.029202,
                1.043059
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 80,
              "mean": 0.906102,
              "ci95": [
                0.850143,
                0.962062
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1.035401,
              "ci95": [
                1.028341,
                1.042461
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 80,
              "mean": 0.910115,
              "ci95": [
                0.851236,
                0.968993
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 80,
              "mean": 1.034163,
              "ci95": [
                1.026919,
                1.041407
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 78,
              "mean": 0.907313,
              "ci95": [
                0.855787,
                0.95884
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 78,
              "mean": 1.035571,
              "ci95": [
                1.02856,
                1.042581
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.584532,
          "ci95": [
            0.301972,
            0.867093
          ]
        },
        "finalFormedCounts": {
          "0": 1,
          "1": 9,
          "2": 25,
          "3": 65
        },
        "finalPlannedFormedCounts": {
          "0": 41,
          "1": 59,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:follow_up",
        "kind": "focus",
        "focusId": "follow_up",
        "name": "追加投资",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 19,
        "losses": 81,
        "winRate": 0.19,
        "winRateCI95": [
          0.12514751509768735,
          0.27778845379064376
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.04,
            "ci95": [
              -0.121226,
              0.197399
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 17,
            "baselineOnlyWins": 13,
            "bothWin": 2,
            "bothLose": 68
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 88,
          "formed": 88,
          "neverFormed": 12,
          "rate": 0.88,
          "ci95": [
            0.8018790057328857,
            0.9300059356298052
          ],
          "turn": {
            "n": 88,
            "mean": 17,
            "ci95": [
              15.550046,
              18.449954
            ]
          },
          "formedWins": 19,
          "formedLosses": 69,
          "unformedWins": 0,
          "unformedLosses": 12
        },
        "failureCauses": {
          "hp": 31,
          "deadline": 50,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 1,
          "10": 6,
          "11": 4,
          "12": 70
        },
        "survivalRewardDecisions": 299,
        "cautiousRewardDecisions": 246,
        "releasedPollutedRemovals": 64,
        "beforeFormation": {
          "n": 100,
          "mean": 0.94682,
          "ci95": [
            0.914209,
            0.979431
          ]
        },
        "afterFormation": {
          "n": 88,
          "mean": 1.02414,
          "ci95": [
            0.987015,
            1.061265
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 88,
          "mean": 1.095228,
          "ci95": [
            1.086728,
            1.103728
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 88,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 88,
              "mean": 0.934774,
              "ci95": [
                0.89614,
                0.973408
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 88,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 88,
              "mean": 0.960855,
              "ci95": [
                0.914252,
                1.007458
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 88,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 88,
              "mean": 0.933624,
              "ci95": [
                0.899299,
                0.967949
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 88,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 88,
              "mean": 1.01833,
              "ci95": [
                0.978772,
                1.057889
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 88,
              "mean": 1.082728,
              "ci95": [
                1.074749,
                1.090707
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 88,
              "mean": 0.999157,
              "ci95": [
                0.955864,
                1.042449
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 88,
              "mean": 1.085168,
              "ci95": [
                1.077192,
                1.093144
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 87,
              "mean": 0.995549,
              "ci95": [
                0.949359,
                1.041738
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 87,
              "mean": 1.085948,
              "ci95": [
                1.077661,
                1.094234
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 87,
              "mean": 0.992552,
              "ci95": [
                0.949507,
                1.035597
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 87,
              "mean": 1.084179,
              "ci95": [
                1.076512,
                1.091846
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 87,
              "mean": 1.007913,
              "ci95": [
                0.958669,
                1.057157
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 87,
              "mean": 1.086053,
              "ci95": [
                1.077917,
                1.094188
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 87,
              "mean": 0.990183,
              "ci95": [
                0.94894,
                1.031426
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 87,
              "mean": 1.088025,
              "ci95": [
                1.079583,
                1.096467
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.520931,
          "ci95": [
            0.283226,
            0.758636
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 20,
          "2": 35,
          "3": 45
        },
        "finalPlannedFormedCounts": {
          "0": 12,
          "1": 88,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:frost",
        "kind": "focus",
        "focusId": "frost",
        "name": "冰盾反击",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 6,
        "losses": 94,
        "winRate": 0.06,
        "winRateCI95": [
          0.027786123963188192,
          0.1247681544589592
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.09,
            "ci95": [
              -0.22161,
              0.05022
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 6,
            "baselineOnlyWins": 15,
            "bothWin": 0,
            "bothLose": 79
          }
        },
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
            "mean": 11.206522,
            "ci95": [
              9.404753,
              13.00829
            ]
          },
          "formedWins": 5,
          "formedLosses": 87,
          "unformedWins": 1,
          "unformedLosses": 7
        },
        "failureCauses": {
          "hp": 0,
          "deadline": 94,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 2,
          "10": 20,
          "11": 23,
          "12": 49
        },
        "survivalRewardDecisions": 245,
        "cautiousRewardDecisions": 206,
        "releasedPollutedRemovals": 128,
        "beforeFormation": {
          "n": 75,
          "mean": 0.893401,
          "ci95": [
            0.849644,
            0.937158
          ]
        },
        "afterFormation": {
          "n": 92,
          "mean": 0.825961,
          "ci95": [
            0.794261,
            0.857661
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 92,
          "mean": 1.064024,
          "ci95": [
            1.059321,
            1.068726
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
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 87,
              "mean": 0.887852,
              "ci95": [
                0.851829,
                0.923875
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 87,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 92,
              "mean": 0.896652,
              "ci95": [
                0.853369,
                0.939936
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 92,
              "mean": 0.878342,
              "ci95": [
                0.834563,
                0.922121
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 92,
              "mean": 0.942115,
              "ci95": [
                0.890946,
                0.993284
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1.074658,
              "ci95": [
                1.064562,
                1.084755
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 92,
              "mean": 0.898655,
              "ci95": [
                0.859451,
                0.937859
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1.078899,
              "ci95": [
                1.068693,
                1.089106
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 92,
              "mean": 0.882322,
              "ci95": [
                0.839797,
                0.924848
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1.080745,
              "ci95": [
                1.071389,
                1.090101
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 91,
              "mean": 0.889982,
              "ci95": [
                0.838555,
                0.941409
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 91,
              "mean": 1.078912,
              "ci95": [
                1.070326,
                1.087499
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 91,
              "mean": 0.914836,
              "ci95": [
                0.863825,
                0.965847
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 91,
              "mean": 1.076182,
              "ci95": [
                1.068597,
                1.083768
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 90,
              "mean": 0.865513,
              "ci95": [
                0.817494,
                0.913532
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 90,
              "mean": 1.074046,
              "ci95": [
                1.066716,
                1.081376
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.14894,
          "ci95": [
            0.027299,
            0.270582
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 12,
          "2": 37,
          "3": 51
        },
        "finalPlannedFormedCounts": {
          "0": 14,
          "1": 86,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:mentorship",
        "kind": "focus",
        "focusId": "mentorship",
        "name": "仙舟授业",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 17,
        "losses": 83,
        "winRate": 0.17,
        "winRateCI95": [
          0.10893566114059931,
          0.25548004767601123
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.02,
            "ci95": [
              -0.127541,
              0.165628
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 13,
            "baselineOnlyWins": 11,
            "bothWin": 4,
            "bothLose": 72
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 94,
          "formed": 94,
          "neverFormed": 6,
          "rate": 0.94,
          "ci95": [
            0.8752318455410406,
            0.9722138760368118
          ],
          "turn": {
            "n": 94,
            "mean": 17.297872,
            "ci95": [
              15.470927,
              19.124817
            ]
          },
          "formedWins": 16,
          "formedLosses": 78,
          "unformedWins": 1,
          "unformedLosses": 5
        },
        "failureCauses": {
          "hp": 8,
          "deadline": 75,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 9,
          "11": 12,
          "12": 62
        },
        "survivalRewardDecisions": 247,
        "cautiousRewardDecisions": 222,
        "releasedPollutedRemovals": 144,
        "beforeFormation": {
          "n": 100,
          "mean": 0.886498,
          "ci95": [
            0.850729,
            0.922267
          ]
        },
        "afterFormation": {
          "n": 94,
          "mean": 0.940171,
          "ci95": [
            0.905742,
            0.974599
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 94,
          "mean": 1.077438,
          "ci95": [
            1.069064,
            1.085813
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 94,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 94,
              "mean": 0.87526,
              "ci95": [
                0.829907,
                0.920613
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 94,
              "mean": 0.880105,
              "ci95": [
                0.836954,
                0.923256
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 94,
              "mean": 0.877853,
              "ci95": [
                0.840157,
                0.915549
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 94,
              "mean": 0.918775,
              "ci95": [
                0.878731,
                0.958818
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.074283,
              "ci95": [
                1.066321,
                1.082245
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 94,
              "mean": 0.957439,
              "ci95": [
                0.908399,
                1.006478
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.079557,
              "ci95": [
                1.070214,
                1.0889
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 94,
              "mean": 0.942901,
              "ci95": [
                0.899774,
                0.986029
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.080623,
              "ci95": [
                1.07232,
                1.088926
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 94,
              "mean": 0.928752,
              "ci95": [
                0.887305,
                0.970198
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.081012,
              "ci95": [
                1.071933,
                1.090091
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 93,
              "mean": 0.931394,
              "ci95": [
                0.884824,
                0.977963
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 93,
              "mean": 1.082031,
              "ci95": [
                1.072492,
                1.091571
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 92,
              "mean": 0.945682,
              "ci95": [
                0.897914,
                0.99345
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 92,
              "mean": 1.083978,
              "ci95": [
                1.073991,
                1.093964
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.467689,
          "ci95": [
            0.248376,
            0.687001
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 3,
          "2": 30,
          "3": 67
        },
        "finalPlannedFormedCounts": {
          "0": 6,
          "1": 94,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:puppet",
        "kind": "focus",
        "focusId": "puppet",
        "name": "空间站实验",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 25,
        "losses": 75,
        "winRate": 0.25,
        "winRateCI95": [
          0.17545211362287672,
          0.34304463548061603
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.1,
            "ci95": [
              -0.061785,
              0.252218
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 20,
            "baselineOnlyWins": 10,
            "bothWin": 5,
            "bothLose": 65
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 96,
          "formed": 96,
          "neverFormed": 4,
          "rate": 0.96,
          "ci95": [
            0.9016292856411208,
            0.9843366960084523
          ],
          "turn": {
            "n": 96,
            "mean": 13.083333,
            "ci95": [
              11.398992,
              14.767675
            ]
          },
          "formedWins": 24,
          "formedLosses": 72,
          "unformedWins": 1,
          "unformedLosses": 3
        },
        "failureCauses": {
          "hp": 25,
          "deadline": 50,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 13,
          "11": 11,
          "12": 51
        },
        "survivalRewardDecisions": 259,
        "cautiousRewardDecisions": 272,
        "releasedPollutedRemovals": 98,
        "beforeFormation": {
          "n": 87,
          "mean": 0.932323,
          "ci95": [
            0.898345,
            0.966302
          ]
        },
        "afterFormation": {
          "n": 96,
          "mean": 1.049934,
          "ci95": [
            1.01058,
            1.089288
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 96,
          "mean": 1.098571,
          "ci95": [
            1.092938,
            1.104205
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 96,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 94,
              "mean": 0.940423,
              "ci95": [
                0.903415,
                0.977432
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 96,
              "mean": 0.939459,
              "ci95": [
                0.894607,
                0.984311
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 96,
              "mean": 0.96623,
              "ci95": [
                0.924968,
                1.007492
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 96,
              "mean": 1.071912,
              "ci95": [
                1.009835,
                1.13399
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1.097646,
              "ci95": [
                1.090188,
                1.105103
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 96,
              "mean": 1.048383,
              "ci95": [
                0.991996,
                1.104771
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1.095314,
              "ci95": [
                1.088571,
                1.102057
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 96,
              "mean": 1.082743,
              "ci95": [
                1.026229,
                1.139257
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1.098886,
              "ci95": [
                1.092282,
                1.10549
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 94,
              "mean": 1.052705,
              "ci95": [
                0.997306,
                1.108104
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.094745,
              "ci95": [
                1.088206,
                1.101285
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 94,
              "mean": 1.012264,
              "ci95": [
                0.962255,
                1.062273
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.093195,
              "ci95": [
                1.086529,
                1.099862
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 94,
              "mean": 1.073391,
              "ci95": [
                1.023023,
                1.12376
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.099639,
              "ci95": [
                1.092813,
                1.106466
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.624175,
          "ci95": [
            0.393347,
            0.855003
          ]
        },
        "finalFormedCounts": {
          "0": 2,
          "1": 31,
          "2": 46,
          "3": 21
        },
        "finalPlannedFormedCounts": {
          "0": 7,
          "1": 93,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:recollection",
        "kind": "focus",
        "focusId": "recollection",
        "name": "忆灵共演",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 16,
        "losses": 84,
        "winRate": 0.16,
        "winRateCI95": [
          0.10095288488804782,
          0.24420269389270244
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.01,
            "ci95": [
              -0.143952,
              0.162995
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 14,
            "baselineOnlyWins": 13,
            "bothWin": 2,
            "bothLose": 71
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 94,
          "formed": 94,
          "neverFormed": 6,
          "rate": 0.94,
          "ci95": [
            0.8752318455410406,
            0.9722138760368118
          ],
          "turn": {
            "n": 94,
            "mean": 14.914894,
            "ci95": [
              13.40453,
              16.425257
            ]
          },
          "formedWins": 13,
          "formedLosses": 81,
          "unformedWins": 3,
          "unformedLosses": 3
        },
        "failureCauses": {
          "hp": 24,
          "deadline": 60,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 1,
          "10": 5,
          "11": 14,
          "12": 64
        },
        "survivalRewardDecisions": 323,
        "cautiousRewardDecisions": 296,
        "releasedPollutedRemovals": 144,
        "beforeFormation": {
          "n": 100,
          "mean": 0.904229,
          "ci95": [
            0.864743,
            0.943716
          ]
        },
        "afterFormation": {
          "n": 94,
          "mean": 0.919104,
          "ci95": [
            0.886241,
            0.951966
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 94,
          "mean": 1.072219,
          "ci95": [
            1.065348,
            1.07909
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 94,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 94,
              "mean": 0.884306,
              "ci95": [
                0.837198,
                0.931415
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.001646,
              "ci95": [
                0.999291,
                1.004001
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 94,
              "mean": 0.869471,
              "ci95": [
                0.825334,
                0.913608
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.00093,
              "ci95": [
                0.999108,
                1.002751
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 94,
              "mean": 0.885103,
              "ci95": [
                0.839606,
                0.9306
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.002936,
              "ci95": [
                1.000259,
                1.005613
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 94,
              "mean": 0.940843,
              "ci95": [
                0.892105,
                0.989582
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.072177,
              "ci95": [
                1.063962,
                1.080391
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 94,
              "mean": 0.914406,
              "ci95": [
                0.872959,
                0.955852
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.069554,
              "ci95": [
                1.0616,
                1.077508
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 94,
              "mean": 0.90816,
              "ci95": [
                0.862853,
                0.953467
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.07311,
              "ci95": [
                1.065217,
                1.081002
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 94,
              "mean": 0.919714,
              "ci95": [
                0.876159,
                0.963269
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.073379,
              "ci95": [
                1.065289,
                1.081469
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 94,
              "mean": 0.907011,
              "ci95": [
                0.865879,
                0.948143
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.07641,
              "ci95": [
                1.067842,
                1.084979
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 94,
              "mean": 0.912093,
              "ci95": [
                0.862134,
                0.962051
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.077861,
              "ci95": [
                1.069562,
                1.086161
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.556031,
          "ci95": [
            0.284027,
            0.828035
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 10,
          "2": 31,
          "3": 59
        },
        "finalPlannedFormedCounts": {
          "0": 8,
          "1": 92,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:elation",
        "kind": "focus",
        "focusId": "elation",
        "name": "欢愉谢幕",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 11,
        "losses": 89,
        "winRate": 0.11,
        "winRateCI95": [
          0.06254196357064568,
          0.18631296503080313
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.04,
            "ci95": [
              -0.184254,
              0.108081
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 10,
            "baselineOnlyWins": 14,
            "bothWin": 1,
            "bothLose": 75
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 95,
          "formed": 95,
          "neverFormed": 5,
          "rate": 0.95,
          "ci95": [
            0.8882495307680808,
            0.9784563208456319
          ],
          "turn": {
            "n": 95,
            "mean": 14.652632,
            "ci95": [
              12.703503,
              16.60176
            ]
          },
          "formedWins": 10,
          "formedLosses": 85,
          "unformedWins": 1,
          "unformedLosses": 4
        },
        "failureCauses": {
          "hp": 1,
          "deadline": 88,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 21,
          "11": 11,
          "12": 57
        },
        "survivalRewardDecisions": 250,
        "cautiousRewardDecisions": 178,
        "releasedPollutedRemovals": 131,
        "beforeFormation": {
          "n": 87,
          "mean": 0.856596,
          "ci95": [
            0.817351,
            0.895842
          ]
        },
        "afterFormation": {
          "n": 95,
          "mean": 0.830994,
          "ci95": [
            0.797986,
            0.864002
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 95,
          "mean": 1.079077,
          "ci95": [
            1.071808,
            1.086347
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 95,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 95,
              "mean": 0.835545,
              "ci95": [
                0.788287,
                0.882803
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 95,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 95,
              "mean": 0.836982,
              "ci95": [
                0.795453,
                0.878511
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 95,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 95,
              "mean": 0.823617,
              "ci95": [
                0.783276,
                0.863958
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 95,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 95,
              "mean": 0.825752,
              "ci95": [
                0.783183,
                0.868322
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 95,
              "mean": 1.055443,
              "ci95": [
                1.048221,
                1.062665
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 95,
              "mean": 0.832556,
              "ci95": [
                0.791737,
                0.873375
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 95,
              "mean": 1.055138,
              "ci95": [
                1.048557,
                1.061719
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 94,
              "mean": 0.817183,
              "ci95": [
                0.772032,
                0.862335
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.059352,
              "ci95": [
                1.052487,
                1.066217
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 94,
              "mean": 0.813752,
              "ci95": [
                0.773703,
                0.853801
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 94,
              "mean": 1.063935,
              "ci95": [
                1.056778,
                1.071092
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 93,
              "mean": 0.825825,
              "ci95": [
                0.784558,
                0.867092
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 93,
              "mean": 1.062699,
              "ci95": [
                1.055948,
                1.06945
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 93,
              "mean": 0.815721,
              "ci95": [
                0.773718,
                0.857724
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 93,
              "mean": 1.068978,
              "ci95": [
                1.062222,
                1.075734
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.314955,
          "ci95": [
            0.121021,
            0.508888
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 6,
          "2": 39,
          "3": 55
        },
        "finalPlannedFormedCounts": {
          "0": 9,
          "1": 91,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "focus:break",
        "kind": "focus",
        "focusId": "break",
        "name": "击破接力",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 17,
        "losses": 83,
        "winRate": 0.17,
        "winRateCI95": [
          0.10893566114059931,
          0.25548004767601123
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": 0.02,
            "ci95": [
              -0.132138,
              0.170225
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 14,
            "baselineOnlyWins": 12,
            "bothWin": 3,
            "bothLose": 71
          }
        },
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
            "mean": 13.434343,
            "ci95": [
              12.19483,
              14.673857
            ]
          },
          "formedWins": 16,
          "formedLosses": 83,
          "unformedWins": 1,
          "unformedLosses": 0
        },
        "failureCauses": {
          "hp": 20,
          "deadline": 63,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 3,
          "11": 16,
          "12": 64
        },
        "survivalRewardDecisions": 294,
        "cautiousRewardDecisions": 265,
        "releasedPollutedRemovals": 157,
        "beforeFormation": {
          "n": 100,
          "mean": 0.904688,
          "ci95": [
            0.871232,
            0.938144
          ]
        },
        "afterFormation": {
          "n": 99,
          "mean": 0.915377,
          "ci95": [
            0.882483,
            0.948271
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 99,
          "mean": 1.08334,
          "ci95": [
            1.076748,
            1.089933
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 99,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 99,
              "mean": 0.905356,
              "ci95": [
                0.868408,
                0.942304
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 99,
              "mean": 0.889138,
              "ci95": [
                0.853042,
                0.925234
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 99,
              "mean": 0.912252,
              "ci95": [
                0.870261,
                0.954243
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.000981,
              "ci95": [
                0.999058,
                1.002904
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 99,
              "mean": 0.905271,
              "ci95": [
                0.86506,
                0.945482
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.075955,
              "ci95": [
                1.069158,
                1.082753
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 99,
              "mean": 0.926184,
              "ci95": [
                0.886691,
                0.965676
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.076853,
              "ci95": [
                1.069622,
                1.084084
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 99,
              "mean": 0.918115,
              "ci95": [
                0.874572,
                0.961658
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.073289,
              "ci95": [
                1.065678,
                1.080899
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 99,
              "mean": 0.907518,
              "ci95": [
                0.866556,
                0.948481
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.076193,
              "ci95": [
                1.068941,
                1.083445
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 99,
              "mean": 0.922222,
              "ci95": [
                0.884499,
                0.959945
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.076019,
              "ci95": [
                1.069099,
                1.08294
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 99,
              "mean": 0.92145,
              "ci95": [
                0.879685,
                0.963215
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 99,
              "mean": 1.076435,
              "ci95": [
                1.06911,
                1.083759
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.47295,
          "ci95": [
            0.244583,
            0.701318
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 4,
          "2": 35,
          "3": 61
        },
        "finalPlannedFormedCounts": {
          "0": 2,
          "1": 98,
          "2": 0
        },
        "abandonedRuns": 0,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "adaptive:2",
        "kind": "adaptive",
        "slots": 2,
        "name": "同时准备 2 套路",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 6,
        "losses": 94,
        "winRate": 0.06,
        "winRateCI95": [
          0.027786123963188192,
          0.1247681544589592
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.09,
            "ci95": [
              -0.22161,
              0.05022
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 6,
            "baselineOnlyWins": 15,
            "bothWin": 0,
            "bothLose": 79
          }
        },
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
            "mean": 7.175258,
            "ci95": [
              6.381311,
              7.969204
            ]
          },
          "formedWins": 6,
          "formedLosses": 91,
          "unformedWins": 0,
          "unformedLosses": 3
        },
        "failureCauses": {
          "hp": 3,
          "deadline": 91,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 1,
          "10": 14,
          "11": 26,
          "12": 53
        },
        "survivalRewardDecisions": 257,
        "cautiousRewardDecisions": 210,
        "releasedPollutedRemovals": 158,
        "beforeFormation": {
          "n": 72,
          "mean": 0.87027,
          "ci95": [
            0.832338,
            0.908202
          ]
        },
        "afterFormation": {
          "n": 97,
          "mean": 0.863324,
          "ci95": [
            0.830505,
            0.896143
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 97,
          "mean": 1.124457,
          "ci95": [
            1.117301,
            1.131614
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 97,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 93,
              "mean": 0.874834,
              "ci95": [
                0.839061,
                0.910607
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 93,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 97,
              "mean": 0.909884,
              "ci95": [
                0.873137,
                0.946632
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 97,
              "mean": 0.899433,
              "ci95": [
                0.863044,
                0.935822
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 97,
              "mean": 0.963393,
              "ci95": [
                0.919125,
                1.007661
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.091735,
              "ci95": [
                1.08174,
                1.101729
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 97,
              "mean": 0.981024,
              "ci95": [
                0.930491,
                1.031558
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.107096,
              "ci95": [
                1.096726,
                1.117466
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 97,
              "mean": 0.956273,
              "ci95": [
                0.907734,
                1.004811
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.111578,
              "ci95": [
                1.101093,
                1.122064
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 97,
              "mean": 0.965145,
              "ci95": [
                0.915604,
                1.014686
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.113091,
              "ci95": [
                1.103028,
                1.123154
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 97,
              "mean": 0.963506,
              "ci95": [
                0.916897,
                1.010115
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.115337,
              "ci95": [
                1.105144,
                1.125531
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 97,
              "mean": 0.95,
              "ci95": [
                0.905454,
                0.994545
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 97,
              "mean": 1.116068,
              "ci95": [
                1.105766,
                1.126371
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.160295,
          "ci95": [
            0.032251,
            0.288339
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 8,
          "2": 42,
          "3": 50
        },
        "finalPlannedFormedCounts": {
          "0": 5,
          "1": 30,
          "2": 65
        },
        "abandonedRuns": 32,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      },
      {
        "id": "adaptive:3",
        "kind": "adaptive",
        "slots": 3,
        "name": "同时准备 3 套路",
        "n": 100,
        "completed": 100,
        "winRateDenominator": 100,
        "wins": 10,
        "losses": 90,
        "winRate": 0.1,
        "winRateCI95": [
          0.0552291370606751,
          0.17436566150491345
        ],
        "incomplete": 0,
        "pairedBaseline": {
          "pairedSeeds": 100,
          "incompletePairs": 0,
          "difference": {
            "n": 100,
            "mean": -0.05,
            "ci95": [
              -0.180444,
              0.085227
            ],
            "intervalMethod": "Bonferroni-Wilson97.5%-discordant-outcome-bounds; conservative approximate 95%"
          },
          "outcomes": {
            "policyOnlyWins": 7,
            "baselineOnlyWins": 12,
            "bothWin": 3,
            "bothLose": 78
          }
        },
        "formation": {
          "n": 100,
          "enrolledN": 100,
          "censoredIncomplete": 0,
          "observedFormedIncludingIncomplete": 100,
          "formed": 100,
          "neverFormed": 0,
          "rate": 1,
          "ci95": [
            0.9630065017930143,
            1
          ],
          "turn": {
            "n": 100,
            "mean": 7.23,
            "ci95": [
              6.245138,
              8.214862
            ]
          },
          "formedWins": 10,
          "formedLosses": 90,
          "unformedWins": 0,
          "unformedLosses": 0
        },
        "failureCauses": {
          "hp": 6,
          "deadline": 84,
          "other": 0
        },
        "failureFloors": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 10,
          "11": 22,
          "12": 58
        },
        "survivalRewardDecisions": 265,
        "cautiousRewardDecisions": 256,
        "releasedPollutedRemovals": 181,
        "beforeFormation": {
          "n": 71,
          "mean": 0.846066,
          "ci95": [
            0.808109,
            0.884024
          ]
        },
        "afterFormation": {
          "n": 100,
          "mean": 0.876875,
          "ci95": [
            0.840328,
            0.913422
          ]
        },
        "effectsOnlyPowerRatio": {
          "n": 100,
          "mean": 1.121795,
          "ci95": [
            1.114351,
            1.129239
          ]
        },
        "effectsOnlyGrowthPerSpin": {
          "n": 100,
          "mean": 0,
          "ci95": [
            0,
            0
          ]
        },
        "formationEventWindow": [
          {
            "offset": -3,
            "progress": {
              "n": 96,
              "mean": 0.873959,
              "ci95": [
                0.837317,
                0.910602
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 96,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": -2,
            "progress": {
              "n": 100,
              "mean": 0.88468,
              "ci95": [
                0.847536,
                0.921823
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.001076,
              "ci95": [
                0.998967,
                1.003186
              ]
            }
          },
          {
            "offset": -1,
            "progress": {
              "n": 100,
              "mean": 0.858291,
              "ci95": [
                0.819417,
                0.897164
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1,
              "ci95": [
                1,
                1
              ]
            }
          },
          {
            "offset": 0,
            "progress": {
              "n": 100,
              "mean": 0.921375,
              "ci95": [
                0.870698,
                0.972051
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.086987,
              "ci95": [
                1.076439,
                1.097536
              ]
            }
          },
          {
            "offset": 1,
            "progress": {
              "n": 100,
              "mean": 0.935048,
              "ci95": [
                0.887118,
                0.982977
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.095955,
              "ci95": [
                1.085735,
                1.106175
              ]
            }
          },
          {
            "offset": 2,
            "progress": {
              "n": 100,
              "mean": 0.912361,
              "ci95": [
                0.86498,
                0.959743
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.103382,
              "ci95": [
                1.092707,
                1.114058
              ]
            }
          },
          {
            "offset": 3,
            "progress": {
              "n": 100,
              "mean": 0.942559,
              "ci95": [
                0.887287,
                0.997831
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.104855,
              "ci95": [
                1.094107,
                1.115603
              ]
            }
          },
          {
            "offset": 4,
            "progress": {
              "n": 100,
              "mean": 0.932021,
              "ci95": [
                0.884668,
                0.979374
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.102445,
              "ci95": [
                1.092526,
                1.112363
              ]
            }
          },
          {
            "offset": 5,
            "progress": {
              "n": 100,
              "mean": 0.938217,
              "ci95": [
                0.886074,
                0.990359
              ]
            },
            "effectsOnlyPowerRatio": {
              "n": 100,
              "mean": 1.109832,
              "ci95": [
                1.100206,
                1.119458
              ]
            }
          }
        ],
        "finalAllSampleProgress": {
          "n": 100,
          "mean": 0.333671,
          "ci95": [
            0.114204,
            0.553139
          ]
        },
        "finalFormedCounts": {
          "0": 0,
          "1": 10,
          "2": 40,
          "3": 50
        },
        "finalPlannedFormedCounts": {
          "0": 1,
          "1": 36,
          "2": 63
        },
        "abandonedRuns": 100,
        "checks": {
          "effectsOnlyNotNegative": true,
          "noArchetypeAutoGrowth": true,
          "statisticallyClearEffects": true,
          "incompleteZero": true,
          "passesRulesRegression": true
        }
      }
    ],
    "recruitmentCoverage": {
      "terminalCampaigns": 1100,
      "pairedSeedBlocks": 100,
      "recruitedCardIds": 90,
      "totalCharacterPicks": 35847,
      "roles": [
        {
          "role": "attack",
          "name": "攻击",
          "distinctCardIds": 44,
          "totalCardIds": 44,
          "picks": 24686
        },
        {
          "role": "defense",
          "name": "防御",
          "distinctCardIds": 15,
          "totalCardIds": 15,
          "picks": 2259
        },
        {
          "role": "amplifier",
          "name": "即时增幅",
          "distinctCardIds": 9,
          "totalCardIds": 9,
          "picks": 3060
        },
        {
          "role": "trainer",
          "name": "永久培养",
          "distinctCardIds": 10,
          "totalCardIds": 10,
          "picks": 1608
        },
        {
          "role": "disruptor",
          "name": "敌方干扰",
          "distinctCardIds": 12,
          "totalCardIds": 12,
          "picks": 4234
        }
      ],
      "zeroPickCards": [],
      "cards": [
        {
          "id": "1001",
          "name": "三月七",
          "role": "defense",
          "picks": 243
        },
        {
          "id": "1002",
          "name": "丹恒",
          "role": "attack",
          "picks": 611
        },
        {
          "id": "1003",
          "name": "姬子",
          "role": "attack",
          "picks": 817
        },
        {
          "id": "1004",
          "name": "瓦尔特",
          "role": "disruptor",
          "picks": 380
        },
        {
          "id": "1005",
          "name": "卡芙卡",
          "role": "disruptor",
          "picks": 118
        },
        {
          "id": "1006",
          "name": "银狼",
          "role": "disruptor",
          "picks": 142
        },
        {
          "id": "1008",
          "name": "阿兰",
          "role": "attack",
          "picks": 683
        },
        {
          "id": "1009",
          "name": "艾丝妲",
          "role": "trainer",
          "picks": 111
        },
        {
          "id": "1013",
          "name": "黑塔",
          "role": "attack",
          "picks": 1366
        },
        {
          "id": "1101",
          "name": "布洛妮娅",
          "role": "amplifier",
          "picks": 284
        },
        {
          "id": "1102",
          "name": "希儿",
          "role": "attack",
          "picks": 481
        },
        {
          "id": "1103",
          "name": "希露瓦",
          "role": "attack",
          "picks": 1223
        },
        {
          "id": "1104",
          "name": "杰帕德",
          "role": "defense",
          "picks": 223
        },
        {
          "id": "1105",
          "name": "娜塔莎",
          "role": "defense",
          "picks": 146
        },
        {
          "id": "1106",
          "name": "佩拉",
          "role": "disruptor",
          "picks": 370
        },
        {
          "id": "1107",
          "name": "克拉拉",
          "role": "attack",
          "picks": 480
        },
        {
          "id": "1108",
          "name": "桑博",
          "role": "disruptor",
          "picks": 538
        },
        {
          "id": "1109",
          "name": "虎克",
          "role": "attack",
          "picks": 1005
        },
        {
          "id": "1205",
          "name": "刃",
          "role": "attack",
          "picks": 68
        },
        {
          "id": "1204",
          "name": "景元",
          "role": "attack",
          "picks": 253
        },
        {
          "id": "1203",
          "name": "罗刹",
          "role": "defense",
          "picks": 146
        },
        {
          "id": "1208",
          "name": "符玄",
          "role": "defense",
          "picks": 130
        },
        {
          "id": "1201",
          "name": "青雀",
          "role": "attack",
          "picks": 940
        },
        {
          "id": "1202",
          "name": "停云",
          "role": "amplifier",
          "picks": 388
        },
        {
          "id": "1110",
          "name": "玲可",
          "role": "defense",
          "picks": 187
        },
        {
          "id": "1111",
          "name": "卢卡",
          "role": "disruptor",
          "picks": 479
        },
        {
          "id": "1112",
          "name": "托帕&账账",
          "role": "attack",
          "picks": 373
        },
        {
          "id": "1206",
          "name": "素裳",
          "role": "attack",
          "picks": 579
        },
        {
          "id": "1207",
          "name": "驭空",
          "role": "trainer",
          "picks": 110
        },
        {
          "id": "1209",
          "name": "彦卿",
          "role": "attack",
          "picks": 618
        },
        {
          "id": "1210",
          "name": "桂乃芬",
          "role": "disruptor",
          "picks": 806
        },
        {
          "id": "1211",
          "name": "白露",
          "role": "defense",
          "picks": 73
        },
        {
          "id": "1212",
          "name": "镜流",
          "role": "attack",
          "picks": 308
        },
        {
          "id": "1214",
          "name": "雪衣",
          "role": "attack",
          "picks": 380
        },
        {
          "id": "1215",
          "name": "寒鸦",
          "role": "trainer",
          "picks": 242
        },
        {
          "id": "1217",
          "name": "藿藿",
          "role": "defense",
          "picks": 43
        },
        {
          "id": "1218",
          "name": "椒丘",
          "role": "disruptor",
          "picks": 496
        },
        {
          "id": "1220",
          "name": "飞霄",
          "role": "attack",
          "picks": 165
        },
        {
          "id": "1221",
          "name": "云璃",
          "role": "attack",
          "picks": 404
        },
        {
          "id": "1222",
          "name": "灵砂",
          "role": "defense",
          "picks": 113
        },
        {
          "id": "1223",
          "name": "貊泽",
          "role": "attack",
          "picks": 423
        },
        {
          "id": "1301",
          "name": "加拉赫",
          "role": "defense",
          "picks": 218
        },
        {
          "id": "1302",
          "name": "银枝",
          "role": "attack",
          "picks": 875
        },
        {
          "id": "1303",
          "name": "阮·梅",
          "role": "trainer",
          "picks": 389
        },
        {
          "id": "1304",
          "name": "砂金",
          "role": "defense",
          "picks": 54
        },
        {
          "id": "1305",
          "name": "真理医生",
          "role": "attack",
          "picks": 436
        },
        {
          "id": "1306",
          "name": "花火",
          "role": "amplifier",
          "picks": 363
        },
        {
          "id": "1307",
          "name": "黑天鹅",
          "role": "trainer",
          "picks": 154
        },
        {
          "id": "1308",
          "name": "黄泉",
          "role": "attack",
          "picks": 193
        },
        {
          "id": "1309",
          "name": "知更鸟",
          "role": "amplifier",
          "picks": 347
        },
        {
          "id": "1310",
          "name": "流萤",
          "role": "attack",
          "picks": 560
        },
        {
          "id": "1312",
          "name": "米沙",
          "role": "attack",
          "picks": 1013
        },
        {
          "id": "1313",
          "name": "星期日",
          "role": "amplifier",
          "picks": 351
        },
        {
          "id": "1314",
          "name": "翡翠",
          "role": "attack",
          "picks": 657
        },
        {
          "id": "1315",
          "name": "波提欧",
          "role": "attack",
          "picks": 276
        },
        {
          "id": "1317",
          "name": "乱破",
          "role": "attack",
          "picks": 884
        },
        {
          "id": "1402",
          "name": "阿格莱雅",
          "role": "attack",
          "picks": 297
        },
        {
          "id": "1403",
          "name": "缇宝",
          "role": "trainer",
          "picks": 161
        },
        {
          "id": "1404",
          "name": "万敌",
          "role": "attack",
          "picks": 199
        },
        {
          "id": "1405",
          "name": "那刻夏",
          "role": "attack",
          "picks": 988
        },
        {
          "id": "1406",
          "name": "赛飞儿",
          "role": "disruptor",
          "picks": 160
        },
        {
          "id": "1407",
          "name": "遐蝶",
          "role": "attack",
          "picks": 174
        },
        {
          "id": "1408",
          "name": "白厄",
          "role": "attack",
          "picks": 55
        },
        {
          "id": "1409",
          "name": "风堇",
          "role": "defense",
          "picks": 47
        },
        {
          "id": "march_hunt",
          "name": "三月七·巡猎",
          "role": "attack",
          "picks": 948
        },
        {
          "id": "dan_heng_imbibitor_lunae",
          "name": "丹恒·饮月",
          "role": "attack",
          "picks": 612
        },
        {
          "id": "dan_heng_pt",
          "name": "丹恒·腾荒",
          "role": "defense",
          "picks": 408
        },
        {
          "id": "fugue",
          "name": "忘归人",
          "role": "disruptor",
          "picks": 190
        },
        {
          "id": "the_herta",
          "name": "大黑塔",
          "role": "attack",
          "picks": 1229
        },
        {
          "id": "hysilens",
          "name": "海瑟音",
          "role": "disruptor",
          "picks": 304
        },
        {
          "id": "cerydra",
          "name": "刻律德菈",
          "role": "amplifier",
          "picks": 479
        },
        {
          "id": "evernight",
          "name": "长夜月",
          "role": "attack",
          "picks": 247
        },
        {
          "id": "cyrene",
          "name": "昔涟",
          "role": "trainer",
          "picks": 73
        },
        {
          "id": "saber",
          "name": "Saber",
          "role": "attack",
          "picks": 459
        },
        {
          "id": "archer",
          "name": "Archer",
          "role": "attack",
          "picks": 201
        },
        {
          "id": "yao_guang",
          "name": "爻光",
          "role": "trainer",
          "picks": 154
        },
        {
          "id": "sparxie",
          "name": "火花",
          "role": "attack",
          "picks": 318
        },
        {
          "id": "ashveil",
          "name": "不死途",
          "role": "attack",
          "picks": 330
        },
        {
          "id": "silver_wolf_lv999",
          "name": "银狼LV.999",
          "role": "attack",
          "picks": 202
        },
        {
          "id": "evanescia",
          "name": "绯英",
          "role": "amplifier",
          "picks": 136
        },
        {
          "id": "mortenax_blade",
          "name": "千冶·刃",
          "role": "attack",
          "picks": 402
        },
        {
          "id": "the_dahlia",
          "name": "大丽花",
          "role": "disruptor",
          "picks": 251
        },
        {
          "id": "announced_himeko_nova",
          "name": "姬子·启行",
          "role": "attack",
          "picks": 1286
        },
        {
          "id": "announced_gilgamesh",
          "name": "吉尔伽美什",
          "role": "attack",
          "picks": 668
        },
        {
          "id": "announced_rin_tohsaka",
          "name": "远坂凛",
          "role": "amplifier",
          "picks": 581
        },
        {
          "id": "aha",
          "name": "阿哈",
          "role": "trainer",
          "picks": 24
        },
        {
          "id": "pearl",
          "name": "真珠",
          "role": "trainer",
          "picks": 190
        },
        {
          "id": "robin_summeretto",
          "name": "知更鸟·晴歌",
          "role": "defense",
          "picks": 104
        },
        {
          "id": "aventurine_waveflair",
          "name": "砂金·戏浪",
          "role": "defense",
          "picks": 124
        },
        {
          "id": "aeon_star_aha",
          "name": "星神★阿哈",
          "role": "amplifier",
          "picks": 131
        }
      ]
    }
  },
  "releaseAggregation": {
    "script": "scripts/summarize-v060-release.mjs",
    "scriptSha256": "3580d2d0b232f4456a15c9926ee96c067375ba498fa86667f74cd83dbf01a064",
    "inputs": {
      "d10": {
        "path": "docs/benchmarks/archetype-v060-holdout-d10.json",
        "sha256": "ff2c73dc7ac8cc8eb33d1c674c89c456f0d39ae51f3705d612f691bee5408531",
        "bytes": 13484396
      },
      "d20": {
        "path": "docs/benchmarks/archetype-v060-stress-d20.json",
        "sha256": "c65fe88c574444cef083a61309bc521333a77520ecf71619c51e602210bc1348",
        "bytes": 17602024
      }
    },
    "rebuiltStrategySummaries": 22,
    "pairedSeedBlocksPerDifficulty": 100,
    "terminalCampaignsPerDifficulty": 1100,
    "incomplete": 0,
    "d10BaselineTarget": {
      "min": 0.9,
      "max": 0.98,
      "pointEstimatePassed": true
    }
  }
});
````````````````
<!-- frozen-source:end -->
