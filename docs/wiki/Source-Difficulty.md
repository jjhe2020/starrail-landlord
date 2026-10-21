# 冻结实现：src/difficulty.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/difficulty.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：1354
- SHA-256：`ad084791166970c7abcfc1f76783d424d6d98ba0c35f9bcb913a745040798943`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/difficulty.js#L1)

<!-- frozen-source:start -->
````````````````javascript
// Public difficulty is independent of encounter number and resource experiments.
export const DIFFICULTY = {
  version: 'difficulty-v7-bound-roles',
  min: 1,
  max: 20,
  default: 10,
  baseHealthScale: 0.25,
  difficulty10HealthMultiplier: 1.4,
  // Two continuous public slopes keep the lower resource bands independently tunable.
  difficultyStepMultiplier: 1.155,
  lowerDifficultyPivot: 6,
  lowerDifficultyStepMultiplier: 1.22,
  combatLateHealthMultiplier: 1.5,
  debuffStartFloor: 4,
  ambientDebuffs: 1,
};

export function normalizeDifficulty(value = DIFFICULTY.default) {
  return Number.isFinite(value) ? Math.max(DIFFICULTY.min, Math.min(DIFFICULTY.max, Math.round(value))) : DIFFICULTY.default;
}

export function difficultyHealthMultiplier(difficulty = DIFFICULTY.default) {
  const level = normalizeDifficulty(difficulty);
  const pivot = DIFFICULTY.lowerDifficultyPivot;
  const upper = DIFFICULTY.difficultyStepMultiplier ** ((Math.max(level, pivot) - 10) / 2);
  const lower = DIFFICULTY.lowerDifficultyStepMultiplier ** ((Math.min(level, pivot) - pivot) / 2);
  return DIFFICULTY.baseHealthScale * DIFFICULTY.difficulty10HealthMultiplier * upper * lower;
}

export function lateDifficultyMultiplier(floor, endMultiplier) {
  const progress = Math.max(0, Math.min(1, (floor - 3) / 9));
  return 1 + (endMultiplier - 1) * progress;
}
````````````````
<!-- frozen-source:end -->
