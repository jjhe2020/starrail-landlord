# 冻结实现：src/save-transfer.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/save-transfer.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：1739
- SHA-256：`14b87c2380d9042876886538beed6f3f88ed92b76bdd8a28c03271f1f8350071`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/save-transfer.js#L1)

<!-- frozen-source:start -->
````````````````javascript
import { validateSave } from './engine.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';

export const MAX_SAVE_BYTES = 2 * 1024 * 1024;

function validatedPayload(payload) {
  if (payload?.game?.mode === 'classic') throw new Error('交租模式已移除，这份存档不能导入；请开始新的战斗旅程。');
  const game = validateSave(payload?.game);
  if (!game) throw new Error('存档与当前版本不兼容，或数据不完整。');
  const stats = payload.stats;
  if (!stats || !['runs', 'wins', 'bestFloor'].every(key => Number.isSafeInteger(stats[key]) && stats[key] >= (key === 'bestFloor' ? 1 : 0))) throw new Error('存档统计数据无效。');
  const profile = payload.aiProfile === undefined ? DEFAULT_PROFILE : validateProfile(payload.aiProfile);
  if (!profile) throw new Error('存档中的 AI 参数无效。');
  return {
    game,
    settings: { sound: payload.settings?.sound === true, animations: payload.settings?.animations !== false },
    stats: { runs: stats.runs, wins: stats.wins, bestFloor: stats.bestFloor },
    aiProfile: profile,
  };
}

export function exportSave(payload) {
  return JSON.stringify({ format: 'astral-reels-save', version: 1, payload: validatedPayload(payload) }, null, 2);
}

export function importSave(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > MAX_SAVE_BYTES) throw new Error('存档文件过大，无法导入。');
  let file;
  try { file = JSON.parse(text); } catch { throw new Error('这不是有效的存档文件。'); }
  if (file?.format !== 'astral-reels-save' || file.version !== 1) throw new Error('请选择星穹转轮导出的存档文件。');
  return validatedPayload(file.payload);
}
````````````````
<!-- frozen-source:end -->
