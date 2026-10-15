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
