import { POLICY_VERSION, recommendRewards, sampleRecommendation, createPolicyRandom, recommendAction } from './ai.js';
import { BALANCE_REFERENCE } from './balance-reference.js';
import { DIFFICULTY } from './difficulty.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { ARCHETYPES } from './archetypes.js';
import { createAiWorker } from './runtime.js';
import { chooseReward, skipReward, rerollRewards, removeSymbol, purchaseSupply } from './engine.js';

// Loaded only by the development edition. Gameplay continues to use the shared engine.
export function createDeveloperTools(ctx) {
const AI_SAVE_KEY = 'astral-reels:development:ai-profile:v1';
let aiProfile = DEFAULT_PROFILE;
try { aiProfile = validateProfile(JSON.parse(localStorage.getItem(AI_SAVE_KEY) || 'null')) || DEFAULT_PROFILE; } catch {}
let recommendation = null;
let recommendationKey = '';
let requestedKey = '';
let inferenceWorker = null;
let inferenceId = 0;
let experimentWorker = null;
let experimentId = 0;
let aiAutoplay = false;
let aiAutoplayTimer = null;
let liveAiRandom = createPolicyRandom(`${ctx.game.seed}:policy`);
let labDifficulty = 10;
let labResourceAccess = { rerolls: true, removals: true, credits: true, defense: true };
let labRuns = 100;
const currentReference = BALANCE_REFERENCE?.version >= 3 && ['resource-calibration','combat-benchmark'].includes(BALANCE_REFERENCE.kind) && BALANCE_REFERENCE.samplePurpose === 'release' && BALANCE_REFERENCE.sourceStable === true && BALANCE_REFERENCE.lookahead === true && Object.entries(DIFFICULTY).every(([key, value]) => BALANCE_REFERENCE.rules?.[key] === value) && BALANCE_REFERENCE.policyVersion === POLICY_VERSION && validateProfile(BALANCE_REFERENCE.profile) ? BALANCE_REFERENCE : null;
let experiment = { running: false, result: currentReference, source: 'reference', type: 'benchmark', completed: 0, total: 0, difficulty: 10, seed: currentReference?.seed || '', error: null };
const RESOURCE_LABELS = { rerolls: '重掷', removals: '移除', credits: '信用点消费', defense: '防御规划（生命/护盾）' };
function currentRecommendationKey() {
  return `${ctx.game.difficulty}:${JSON.stringify(ctx.game.resourceStats)}:${ctx.game.overclockReady}:${ctx.game.supplyPurchases}:${ctx.game.hp}:${ctx.game.shield}:${JSON.stringify(ctx.game.activeDebuffs)}:${ctx.game.seed}:${ctx.game.stats.spins}:${ctx.game.phase}:${ctx.game.choices.join(',')}:${ctx.game.uidCounter}:${ctx.game.coins}:${ctx.game.roster.map(u=>u.uid).join(',')}:${JSON.stringify(aiProfile)}`;
}
function recommendationMarkup(index) {
  const c = recommendationKey === currentRecommendationKey() ? recommendation?.choices.find(choice => choice.index === index) : null;
  const label = index === ctx.game.choices.length ? `${ctx.game.phase === 'recruit' ? '暂不招募' : '跳过奖励'} · ` : '';
  return c ? `<div class="ai-probability-heading"><span>${label}AI 推荐</span><strong>${ctx.percentage(c.probability)}</strong></div><div class="ai-probability-meter"><i style="width:${c.probability * 100}%"></i></div><p>${ctx.esc(c.reason)}</p>` : `<div class="ai-probability-heading"><span>${label}AI 正在分析</span><strong>…</strong></div><p>评估当前构筑与随机战场</p>`;
}
function applyRecommendation(result, key) {
  if (key !== currentRecommendationKey() || !ctx.isReward()) return;
  recommendation = result; recommendationKey = key;
  document.querySelectorAll('[data-ai-index]').forEach(node => { node.innerHTML = recommendationMarkup(Number(node.dataset.aiIndex)); });
  updateAiPanel();
}
function requestRecommendations() {
  if (!ctx.isReward() || ctx.busy) return;
  const key = currentRecommendationKey();
  if (recommendationKey === key || requestedKey === key) return;
  requestedKey = key;
  const id = ++inferenceId;
  try {
    if (!inferenceWorker) {
      inferenceWorker = createAiWorker();
      const activeInferenceWorker = inferenceWorker;
      inferenceWorker.onmessage = ({ data }) => {
        if (data.requestId !== inferenceId) return;
        if (data.type === 'recommend') applyRecommendation(data.result, requestedKey);
        else if (data.type === 'error') fallbackRecommendation(requestedKey);
      };
      inferenceWorker.onerror = () => { if (inferenceWorker !== activeInferenceWorker) return; inferenceWorker?.terminate(); inferenceWorker = null; fallbackRecommendation(requestedKey); };
    }
    inferenceWorker.postMessage({ type: 'recommend', requestId: id, state: ctx.game, profile: aiProfile });
  } catch { fallbackRecommendation(key); }
}
function fallbackRecommendation(key) {
  setTimeout(() => { if (key === currentRecommendationKey() && ctx.isReward()) applyRecommendation(recommendRewards(ctx.game, { profile: aiProfile }), key); }, 0);
}
function aiPanel() {
  const progress = experiment.running ? Math.round(experiment.completed / Math.max(1, experiment.total) * 100) : 0;
  const status = aiAutoplay ? '统一决策：构筑、重掷、移除与补给 · 可随时停止' : ctx.isReward() ? `${ctx.game.choices.length} 张奖励与跳过都有推荐概率和理由` : '下一次招募时评估奖励与跳过';
  const experimentLabel = experiment.type === 'train' ? '训练与独立验证' : experiment.type === 'ablation' ? '20 组资源矩阵' : 'AI / 随机对照';
  return `<section class="panel ai-panel"><div class="panel-heading"><h2>AI 开拓助手</h2><span class="count-badge">${aiAutoplay ? '代打中' : '策略 AI'}</span></div><p class="panel-intro muted">看懂构筑，也验证每一种可能。</p><div class="ai-status">${status}</div><div class="ai-buttons"><button class="button ghost" data-action="aiAutoplay" ${['victory', 'defeat'].includes(ctx.game.phase) ? 'disabled' : ''}>${aiAutoplay ? '停止代打' : 'AI 代打'}</button><button class="button ghost" data-action="aiLab">自动测试</button></div>${experiment.running ? `<div class="ai-batch-progress"><div><span>${experimentLabel}</span><b>${progress}%</b></div><div class="meter gold"><i style="width:${progress}%"></i></div></div>` : experiment.result ? '<p class="ai-last-result">✓ 评测记录可用 · 点自动测试查看</p>' : ''}<small class="ai-model-version">策略 ${ctx.esc(POLICY_VERSION)} · 模型 ${ctx.esc(aiProfile.version)} · 本地运行</small></section>`;
}
function updateAiPanel() {
  const panel = document.querySelector('.ai-panel');
  if (panel) { const replacement = document.createElement('div'); replacement.innerHTML = aiPanel(); panel.replaceWith(replacement.firstElementChild); ctx.decorateInspectors(); }
  const progress = document.querySelector('.lab-progress');
  if (progress) {
    if (experiment.running && progress.querySelector('[data-action="aiCancel"]')) {
      const replacement = document.createElement('div');
      replacement.innerHTML = labProgressMarkup();
      progress.querySelector('.ai-batch-progress')?.replaceWith(replacement.querySelector('.ai-batch-progress'));
    } else progress.innerHTML = labProgressMarkup();
  }
  const result = document.querySelector('.lab-result');
  if (result) result.innerHTML = labResultMarkup();
}
function labProgressMarkup() {
  if (!experiment.running) return experiment.error ? `<p class="lab-error">${ctx.esc(experiment.error)}</p>` : '';
  const progress = Math.round(experiment.completed / Math.max(1, experiment.total) * 100);
  return `<div class="ai-batch-progress"><div><span>${experiment.type === 'train' ? '尝试参数 → 验证 → 留出测试' : '新建独立对局'}</span><b>${experiment.completed} / ${experiment.total} · ${progress}%</b></div><div class="meter gold"><i style="width:${progress}%"></i></div></div><button class="text-button" data-action="aiCancel">取消本次实验</button>`;
}
function archetypeBenchmarkMarkup() {
  return `<section class="archetype-benchmark-pending help-note"><b>0.8.1 开发观察</b><p>本版只调整界面，战斗规则沿用0.8.0。旧95%胜率与缺资源难度映射属于历史方案；多维玩家矩阵将另行设计。</p><details><summary>内部拿牌策略 · 仅用于测试</summary><p>以下名称只是公开候选的选择偏好，没有额外成型奖励。</p>${ARCHETYPES.map(route => `<p><b>${ctx.esc(route.name)}</b>：${ctx.esc(route.description)}</p>`).join('')}</details></section>`;
}
function labResultMarkup() {
  if (!experiment.result) return '<p class="lab-empty">当前资源配置尚无本版发布评测记录。可运行新实验，当前旅程保持；测试结论见本版随附报告。</p>';
  const result = experiment.result;
  if (experiment.type === 'train') {
    const rows = result.holdout?.baseline?.modes || [];
    return `<div class="lab-training-result"><b>${result.accepted ? '独立验收通过，已采用新策略' : '未证明改进，保留当前策略'}</b><p>训练、验证和留出使用不同种子。</p></div>${rows.map(before => {
      const after = result.holdout.candidate.modes.find(row => row.difficulty === before.difficulty) || result.holdout.candidate.modes[0];
      return `<article class="lab-mode-result"><h3>难度 D${before.difficulty || labDifficulty} · 每模型 ${before.runs} 局</h3><p>原策略 ${ctx.percentage(before.winRate)} → 候选 ${ctx.percentage(after?.winRate)}</p></article>`;
    }).join('')}`;
  }
  const variants = result.variants || result.resourceScenarios || result.scenarios;
  const sameProfile = JSON.stringify(validateProfile(result.profile)) === JSON.stringify(validateProfile(aiProfile));
  const context = `<p class="lab-archive-label">${experiment.source === 'reference' ? '独立发布评测' : '本次独立实验'} · 种子 ${ctx.esc(result.seed || experiment.seed)}<br/>策略 ${ctx.esc(result.policyVersion || POLICY_VERSION)} · 评测模型 ${ctx.esc(result.profile?.version || '未记录')}<br/>仅适用于本批难度与资源配置，不能视为玩家通关率。${sameProfile ? '' : '<br/>当前模型档案与评测记录不同，运行新实验可验证当前档案。'}</p>`;
  if (!variants) return context + '<p class="lab-intro">结果用于观察当前策略，历史目标不作为本版难度验收标准。</p>' + benchmarkMarkup(result);
  const normalized = variants.map(row => ({ ...row, summary: row.summary || row.ai, disabledResources: row.disabledResources || Object.entries(row.resourceAccess || {}).filter(([, allowed]) => !allowed).map(([key]) => key) }));
  return `${context}<p class="lab-intro">以下资源组合按历史实验配置运行，显示原始结果，不按旧95%目标判定当前难度是否通过。新的多维玩家偏好与难度矩阵尚未实施。</p><div class="variant-matrix">${normalized.map(row => {
    const summary = row.summary || row.ai;
    if (!summary) return '';
    const label = row.disabledResources.length ? `禁用 ${row.disabledResources.map(key => RESOURCE_LABELS[key] || key).join('、')}` : '全资源';
    return `<details class="variant-row"><summary><span><b>D${row.difficulty}</b><small>${ctx.esc(label)}</small></span><strong>${ctx.percentage(summary.winRate)}</strong></summary>${benchmarkMarkup({ modes: [{ ...row, ai: summary }] })}</details>`;
  }).join('')}</div>`;
}
function usageMarkup(usage) {
  if (!usage) return '';
  const fields = [['rerollsUsed', '重掷'], ['paidRerolls', '付费重掷'], ['removalsUsed', '移除'], ['supplyPurchases', '补给购买'], ['creditsSpent', '信用点消费'], ['initialHp', '初始生命'], ['healed', '实际治疗'], ['hpLost', '生命损失'], ['initialShield', '初始护盾'], ['shieldGained', '获得护盾'], ['shieldBlocked', '护盾抵挡'], ['shieldDecayed', '护盾衰减浪费']];
  return `<div class="usage-grid">${fields.map(([key, label]) => `<span>${label}<b>${ctx.num(Math.round((usage[key] || 0) * 100) / 100)}</b></span>`).join('')}</div>`;
}
function defenseUsageMarkup(usage) {
  if (!usage) return '';
  const labels = { low: '使用偏低', moderate: '部分使用', effective: '有效使用' };
  const generated = (usage.hpGenerated || 0) + (usage.shieldGenerated || 0);
  const rate = (value, denominator) => denominator > 0 && Number.isFinite(value) ? ctx.percentage(value) : '未生成';
  const low = usage.thresholds?.low ?? .2;
  const effective = usage.thresholds?.effective ?? .5;
  return `<section class="defense-efficiency"><button type="button" class="defense-efficiency-heading" data-inspect="mechanic" data-inspect-click="true" data-key="defenseUsage">防御有效消耗 <span>?</span></button><div class="defense-rates"><span>生命消耗 / 生成<b>${rate(usage.hpConsumptionRate, usage.hpGenerated)}</b></span><span>护盾抵伤 / 生成<b>${rate(usage.shieldConsumptionRate, usage.shieldGenerated)}</b></span><span>合计有效消耗<b>${rate(usage.combinedRate, generated)}</b></span></div><p class="defense-classification">${ctx.esc(labels[usage.classification] || '待判断')}（暂定）：＜${ctx.percentage(low)} 偏低，≥${ctx.percentage(effective)} 有效。</p><p class="lab-archive-label">本批生命 ${ctx.num(usage.hpConsumed)} / ${ctx.num(usage.hpGenerated)}，护盾 ${ctx.num(usage.shieldConsumed)} / ${ctx.num(usage.shieldGenerated)}（消耗 / 生成）；护盾衰减浪费 ${ctx.num(usage.shieldWasted)}。按总量归一，不平均逐局百分比；高效率不代表承伤越多越好。</p>${defenseStrataMarkup(usage.strata)}</section>`;
}
function defenseStrataMarkup(strata) {
  if (!strata) return '';
  const groups = [['low', '偏低'], ['moderate', '部分'], ['effective', '充分']].map(([key, label]) => ({ ...strata[key], label }));
  const interval = group => group.n > 0 && Array.isArray(group.winRateCI) ? `${ctx.percentage(group.winRateCI[0])} – ${ctx.percentage(group.winRateCI[1])}` : '—';
  return `<details class="defense-strata"><summary>防御使用分层 · 观察样本</summary><p>按赛后消费比例分层，不能作为因果消融。零样本不提供胜率证据；20% / 50% 为暂定观察分类。</p><table><thead><tr><th>分层</th><th>胜 / 样本</th><th>胜率 / 95% 区间</th></tr></thead><tbody>${groups.map(group => `<tr><th>${group.label}</th><td>${ctx.num(group.wins)} / ${ctx.num(group.n)}</td><td>${group.n > 0 ? ctx.percentage(group.winRate) : '—'}<small>${interval(group)}</small></td></tr>`).join('')}</tbody></table>${groups.map(group => {
    const joint = group.jointActiveFour || {};
    return `<div class="stratum-detail"><b>${group.label}组</b><p>生命 ${ctx.num(group.hpConsumed)} / ${ctx.num(group.hpGenerated)}，护盾 ${ctx.num(group.shieldConsumed)} / ${ctx.num(group.shieldGenerated)}（消耗 / 生成）。</p><p>四类均参与：${ctx.num(joint.wins)} 胜 / ${ctx.num(joint.n)} 局，${joint.n > 0 ? ctx.percentage(joint.winRate) : '胜率无样本'}；区间 ${interval(joint)}。</p></div>`;
  }).join('')}<p>四类参与中的防御按暂定 ≥20% 观察，充分使用按 ≥50%；这些赛后子组保留样本数，不能等同独立随机对照。</p></details>`;
}
function benchmarkMarkup(result) {
  return (result?.modes || []).map(row => {
    const { ai, uniform } = row;
    if (!ai) return '';
    const denied = Object.entries(row.resourceAccess || {}).filter(([, allowed]) => !allowed).map(([key]) => RESOURCE_LABELS[key]);
    return `<article class="lab-mode-result"><h3>难度 D${row.difficulty || result.difficulty || 10} · ${ctx.esc(denied.length ? '禁用 ' + denied.join('、') : '全资源')}</h3><p class="lab-archive-label">AI ${ctx.num(ai.runs)} 局 · ${ctx.num(ai.wins)} 胜${uniform ? ` · 随机 ${ctx.num(uniform.runs)} 局` : ''}</p><div class="lab-result-row"><span>AI 通关</span><b>${ctx.percentage(ai.winRate)}</b></div><div class="lab-chart"><i style="width:${Math.max(0, Math.min(100, ai.winRate * 100))}%"></i></div>${Array.isArray(ai.winRateCI) ? `<p class="lab-interval">95% 区间 ${ctx.percentage(ai.winRateCI[0])} – ${ctx.percentage(ai.winRateCI[1])}</p>` : ''}${uniform ? `<div class="lab-result-row"><span>随机选择</span><b>${ctx.percentage(uniform.winRate)}</b></div>` : ''}<div class="lab-summary"><span>平均抵达 <b>${Number(ai.avgFloor || 0).toFixed(2)} 关</b></span><span>平均合成 <b>${Number(ai.avgMerges || 0).toFixed(2)} 次</b></span><span>平均跳过 <b>${ctx.num(Math.round((ai.avgSkips || 0) * 100) / 100)} 次</b></span></div><p class="lab-archive-label">每局平均资源统计</p>${usageMarkup(ai.avgUsage)}${defenseUsageMarkup(ai.defenseUsage)}<p class="lab-failures">未完成 ${ctx.num(ai.incomplete)} 局${ai.failureByFloor?.filter(f => f.count > 0).map(f => ` · 第 ${f.floor} 关失败 ${f.count} 局`).join('') || (ai.wins === ai.runs ? ' · 本批全部通关' : '')}</p></article>`;
  }).join('');
}
function aiLabDialog() {
  return ctx.modal('AI 试验台', `${archetypeBenchmarkMarkup()}<p class="lab-intro">统一 AI 决策同时考虑转动、招募、跳过、重掷、移除与补给。实验另建独立对局，不修改当前旅程。</p><div class="lab-controls"><label>实验难度<select id="lab-difficulty" ${experiment.running ? 'disabled' : ''}>${Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}" ${labDifficulty === i + 1 ? 'selected' : ''}>D${i + 1}${i === 9 ? ' · 默认' : ''}</option>`).join('')}</select></label><label>每策略局数<select id="lab-runs" ${experiment.running ? 'disabled' : ''}>${[30, 100, 300, 1000].map(n => `<option value="${n}" ${labRuns === n ? 'selected' : ''}>${ctx.num(n)} 局</option>`).join('')}</select></label></div><fieldset class="resource-access" ${experiment.running ? 'disabled' : ''}><legend>允许的资源 · 取消勾选即可禁用</legend>${Object.entries(RESOURCE_LABELS).map(([key, label]) => `<label><input type="checkbox" data-resource="${key}" ${labResourceAccess[key] ? 'checked' : ''}/><span>${label}</span></label>`).join('')}</fieldset><div class="lab-actions"><button class="button primary" data-action="aiBenchmark" ${experiment.running ? 'disabled' : ''}>运行当前配置</button><button class="button ghost" data-action="aiTrain" ${experiment.running ? 'disabled' : ''}>训练并验证</button></div><button class="button ghost full resource-ablation" data-action="aiAblation" ${experiment.running ? 'disabled' : ''}>旧资源矩阵 · D10 / D8 / D6 / D4 / D2</button><p class="lab-archive-label">资源矩阵固定运行 20 组：全资源 D10、四个单禁用 D10 对照，以及按禁用数降低难度的 15 组；每组使用上方局数，不采用上方开关。取消防御规划只禁用医疗/护盾补给，自然治疗、护盾增益与承伤均保留；效率按实际消耗量 / 生成量统计。训练每候选最多 60 局，留出每模型最多 100 局。</p><div class="lab-progress" aria-live="polite">${labProgressMarkup()}</div><div class="lab-result">${labResultMarkup()}</div>`, '', { eyebrow: 'RESOURCE & DIFFICULTY LAB' });
}
function startExperiment(type) {
  if (experiment.running) return;
  const difficulty = labDifficulty;
  const resourceAccess = { ...labResourceAccess };
  const runs = Number(document.querySelector('#lab-runs')?.value || 100);
  const seed = ctx.freshSeed();
  experiment = { running: true, type, source: 'live', completed: 0, total: type === 'benchmark' ? runs * 2 : type === 'ablation' ? runs * 20 : 0, result: null, difficulty, resourceAccess, seed, error: null };
  const id = ++experimentId;
  try {
    experimentWorker = createAiWorker();
    experimentWorker.onmessage = ({ data }) => {
      if (data.requestId !== experimentId) return;
      if (data.type === 'progress') { experiment.completed = data.completed; experiment.total = data.total; updateAiPanel(); return; }
      if (data.type === 'error') { experiment.running = false; experiment.error = data.message; }
      else {
        experiment.running = false; experiment.result = data.result;
        if (type === 'train' && data.result.accepted) {
          const profile = validateProfile(data.result.profile);
          if (profile) { aiProfile = profile; try { localStorage.setItem(AI_SAVE_KEY, JSON.stringify(profile)); } catch {} requestedKey = ''; recommendationKey = ''; requestRecommendations(); }
        }
      }
      experimentWorker?.terminate(); experimentWorker = null; updateAiPanel();
      if (ctx.dialog === 'aiLab') ctx.render();
    };
    experimentWorker.onerror = () => { if (id !== experimentId) return; experiment.running = false; experiment.error = '实验线程未能完成，请重试。'; experimentWorker?.terminate(); experimentWorker = null; if (ctx.dialog === 'aiLab') ctx.render(); else updateAiPanel(); };
    experimentWorker.postMessage({ type, requestId: id, difficulty, resourceAccess, runs: type === 'train' ? Math.min(runs, 60) : runs, holdoutRuns: Math.min(runs, 100), generations: 2, candidates: 4, seed, profile: aiProfile });
    ctx.render();
  } catch (error) { experiment.running = false; experiment.error = error.message; ctx.render(); }
}
function toggleAutoplay() {
  aiAutoplay = !aiAutoplay;
  clearTimeout(aiAutoplayTimer);
  updateAiPanel();
  document.querySelectorAll('[data-action="aiAutoplay"]').forEach(button => { button.textContent = aiAutoplay ? '停止 AI' : 'AI 代打'; });
  if (aiAutoplay) { ctx.showToast('AI 开始接管当前旅程，可随时停止。'); scheduleAutoplay(); }
}
function scheduleAutoplay() {
  clearTimeout(aiAutoplayTimer);
  if (!aiAutoplay) return;
  aiAutoplayTimer = setTimeout(async () => {
    if (!aiAutoplay) return;
    if (ctx.busy || ctx.transitioning || ctx.dialog || ctx.inspector.isOpen()) { scheduleAutoplay(); return; }
    try {
      const action = recommendAction(ctx.game, { profile: aiProfile });
      if (action.type === 'stop') { aiAutoplay = false; updateAiPanel(); return; }
      if (action.type === 'spin') await ctx.doSpin();
      else if (action.type === 'reroll') { ctx.adopt(rerollRewards(ctx.game)); ctx.render(); }
      else if (action.type === 'remove') { ctx.adopt(removeSymbol(ctx.game, action.uid)); ctx.render(); }
      else if (action.type === 'supply') { ctx.adopt(purchaseSupply(ctx.game, action.kind)); ctx.render(); }
      else if (action.type === 'reward') {
        const advice = action.recommendation;
        if (!advice) throw Error('奖励决策缺少推荐分布');
        applyRecommendation(advice, currentRecommendationKey());
        const index = sampleRecommendation(advice, liveAiRandom());
        const choice = advice.choices.find(candidate => candidate.index === index);
        if (!choice) throw Error('推荐动作已失效');
        await ctx.transitionChoice(choice.action === 'skip' ? skipReward(ctx.game) : chooseReward(ctx.game, index));
      } else throw Error('未知推荐动作');
    } catch (error) {
      aiAutoplay = false; ctx.showToast(`AI 已停止：${error.message}`); updateAiPanel();
    }
    scheduleAutoplay();
  }, 650);
}

function stopAutoplay() { aiAutoplay = false; clearTimeout(aiAutoplayTimer); }
function reset(profile) {
  stopAutoplay(); inferenceId++; inferenceWorker?.terminate(); inferenceWorker = null;
  if (profile) { aiProfile = validateProfile(profile) || DEFAULT_PROFILE; try { localStorage.setItem(AI_SAVE_KEY, JSON.stringify(aiProfile)); } catch {} }
  liveAiRandom = createPolicyRandom(`${ctx.game.seed}:policy`);
  recommendation = null; recommendationKey = ''; requestedKey = '';
}
return {
  get running() { return experiment.running; },
  get autoplay() { return aiAutoplay; },
  get profile() { return aiProfile; },
  panel: aiPanel, labDialog: aiLabDialog, recommendationMarkup, requestRecommendations, stopAutoplay, reset,
  inspectorChoice(index) { return recommendationKey === currentRecommendationKey() ? recommendation?.choices.find(choice => choice.index === index) : null; },
  handleAction(action) {
    if (action === 'aiAutoplay') { toggleAutoplay(); return true; }
    if (ctx.busy || ctx.transitioning) return false;
    if (action === 'aiCancel') { experimentId++; experimentWorker?.terminate(); experimentWorker = null; experiment.running = false; experiment.error = '本次实验已取消，当前旅程未改变。'; ctx.render(); return true; }
    if (['aiBenchmark', 'aiTrain', 'aiAblation'].includes(action)) { startExperiment(action === 'aiTrain' ? 'train' : action === 'aiAblation' ? 'ablation' : 'benchmark'); return true; }
    return false;
  },
  handleChange(event) {
    if (event.target.id === 'lab-difficulty') labDifficulty = Number(event.target.value);
    if (event.target.dataset.resource) labResourceAccess[event.target.dataset.resource] = event.target.checked;
    if (event.target.id === 'lab-runs') labRuns = Number(event.target.value);
  },
};
}
