# 冻结实现：src/ai-profile.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/ai-profile.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：1535
- SHA-256：`2c39190c2d7dd11a84008b5389dd8364fffd464302960a4921abd1fb42c0e206`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/ai-profile.js#L1)

<!-- frozen-source:start -->
````````````````javascript
// This is an inspectable local policy, not a remote model or a win predictor.
export const DEFAULT_PROFILE = Object.freeze({
  version: 'context-v3-resources',
  weights: Object.freeze({ damage: 1, defense: 0.36, growth: 0.7, synergy: 0.9, merge: 0.85, economy: 0.32, tempo: 1.1, lookahead: 0.55, dilution: 1.1, flexibility: 0.7 }),
  temperature: 5,
  lookaheadSamples: 4,
});

export const PROFILE_WEIGHT_KEYS = Object.freeze(Object.keys(DEFAULT_PROFILE.weights));

export function validateProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (typeof input.version !== 'string' || !/^[a-zA-Z0-9._-]{1,80}$/.test(input.version)) return null;
  if (!input.weights || typeof input.weights !== 'object' || Array.isArray(input.weights)) return null;
  if (Object.keys(input.weights).length !== PROFILE_WEIGHT_KEYS.length || Object.keys(input.weights).some(key => !PROFILE_WEIGHT_KEYS.includes(key))) return null;
  if (PROFILE_WEIGHT_KEYS.some(key => !Number.isFinite(input.weights[key]) || input.weights[key] < 0 || input.weights[key] > 5)) return null;
  if (!Number.isFinite(input.temperature) || input.temperature < 0.25 || input.temperature > 20) return null;
  if (!Number.isInteger(input.lookaheadSamples) || input.lookaheadSamples < 0 || input.lookaheadSamples > 8) return null;
  return { version: input.version, weights: Object.fromEntries(PROFILE_WEIGHT_KEYS.map(key => [key, input.weights[key]])), temperature: input.temperature, lookaheadSamples: input.lookaheadSamples };
}
````````````````
<!-- frozen-source:end -->
