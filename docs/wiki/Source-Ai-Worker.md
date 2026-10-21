# 冻结实现：src/ai-worker.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/ai-worker.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：2091
- SHA-256：`36ab3c392271674757822c92f414d7f18776236b88f8bdc6c1d4df79b9106e58`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/ai-worker.js#L1)

<!-- frozen-source:start -->
````````````````javascript
import { recommendRewards, recommendAction } from './ai.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { benchmarkPolicies, benchmarkResources, trainProfile } from './simulation.js';

// The worker owns its own simulations; no action ever touches the live game state.
self.onmessage = async ({ data }) => {
  const { type, requestId } = data ?? {};
  try {
    let profile = DEFAULT_PROFILE;
    if (data.profile !== undefined) {
      const validated = validateProfile(data.profile);
      if (!validated) throw new Error('AI 配置格式无效，请重置配置后重试。');
      profile = typeof validated === 'object' ? validated : data.profile;
    }
    const onProgress = progress => self.postMessage({ type: 'progress', requestId, ...progress });
    let result;
    if (type === 'recommend') {
      if (!data.state || !Array.isArray(data.state.choices)) throw new Error('缺少有效的奖励状态。');
      result = recommendRewards(data.state, { profile });
    } else if (type === 'action') {
      if (!data.state || data.state.mode !== 'combat') throw new Error('缺少有效的战斗状态。');
      result = recommendAction(data.state, { profile });
    } else if (type === 'benchmark') {
      result = await benchmarkPolicies({ difficulty: data.difficulty, resourceAccess: data.resourceAccess, runs: data.runs, seed: data.seed, profile, onProgress });
    } else if (type === 'ablation') {
      result = await benchmarkResources({ runs: data.runs, seed: data.seed, profile, onProgress });
    } else if (type === 'train') {
      result = await trainProfile({ difficulty: data.difficulty, resourceAccess: data.resourceAccess, runs: data.runs, seed: data.seed, profile, generations: data.generations, candidates: data.candidates, holdoutRuns: data.holdoutRuns, onProgress });
    } else throw new Error('未知的 AI 工作任务。');
    self.postMessage({ type, requestId, result });
  } catch (error) {
    self.postMessage({ type: 'error', requestId, message: error instanceof Error ? error.message : String(error) });
  }
};
````````````````
<!-- frozen-source:end -->
