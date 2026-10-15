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
