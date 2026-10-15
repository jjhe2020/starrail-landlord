import { newGame, spin, chooseReward, skipReward, rerollRewards, removeSymbol, continueEndless, getSynergies, validateSave, purchaseSupply } from './engine.js';
import { createInspector } from './inspect.js';
import { mechanicExplanation } from './mechanics.js';
import { POLICY_VERSION, recommendRewards, sampleRecommendation, createPolicyRandom, recommendAction } from './ai.js';
import { BALANCE_REFERENCE } from './balance-reference.js';
import { DIFFICULTY } from './difficulty.js';
import { assessResourceVariant } from './simulation.js';
import { DEFAULT_PROFILE, validateProfile } from './ai-profile.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from './content.js';
import { createOfflineSupport } from './offline.js';
import { IS_PORTABLE, assetUrl, createAiWorker } from './runtime.js';
import { MAX_SAVE_BYTES, exportSave, importSave } from './save-transfer.js';
import { effectRows, effectBadges, durationInfo, snapshotTitle, unitBreakdown } from './effect-info.js';

const app = document.querySelector('#app');
const SAVE_KEY = 'astral-reels:v1';
const rarityNames = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };
const attackNames = { single: '单体', blast: '扩散', aoe: '群体', support: '辅助' };
const paths = {
  star: '<path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.2-5.5-2.9-5.5 2.9 1.1-6.2L3.6 9.5l6.2-.9Z"/>',
  cube: '<path d="m12 2 9 5v10l-9 5-9-5V7Z M3 7l9 5 9-5M12 12v10M12 2v10"/>',
  rotate: '<path d="M20 7v5h-5M4 17v-5h5M5.2 7a8 8 0 0 1 13-2L20 7M4 17l1.8 2a8 8 0 0 0 13-2"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
  shield: '<path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5Z"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  cross: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v15c3-2 7-2 10 0 3-2 7-2 10 0V4c-2-1-6-2-10 1Zm0 0v14"/>',
  users: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m-6 0 6-6"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  coins: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v5c0 4 16 4 16 0V5M4 10v5c0 4 16 4 16 0v-5M4 15v4c0 4 16 4 16 0v-4"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-5 3h10m-7-3h4"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};
const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = value => Number(value || 0).toLocaleString('zh-CN');
const freshSeed = () => `TRAIL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const portrait = char => assetUrl(`./public/assets/characters/${char.assetId}.png`);
let settings = { sound: false, animations: true };
let stats = { runs: 0, wins: 0, bestFloor: 1 };
let game;
let saveAvailable = true;
let removedModeNotice = false;
let migratedNotice = false;
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  removedModeNotice = saved?.game?.mode === 'classic';
  game = removedModeNotice ? null : validateSave(saved?.game);
  migratedNotice = saved?.game?.version === 1 && game?.migratedFromVersion === 1;
  if (saved?.settings) settings = { sound: !!saved.settings.sound, animations: saved.settings.animations !== false };
  if (saved?.stats) stats = { runs: Math.max(0, Number(saved.stats.runs) || 0), wins: Math.max(0, Number(saved.stats.wins) || 0), bestFloor: Math.max(1, Number(saved.stats.bestFloor) || 1) };
} catch { game = null; }
if (!game) { game = newGame({ difficulty: 10, seed: freshSeed() }); stats.runs++; }
let busy = false;
let dialog = removedModeNotice ? 'new' : null;
let detail = null;
let pendingDifficulty = 10;
let catalogTab = 'characters';
let catalogQuery = '';
let toastTimer;
let audioContext;
let lastBoard = null;

const AI_SAVE_KEY = 'astral-reels:ai-profile:v1';
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
let liveAiRandom = createPolicyRandom(`${game.seed}:policy`);
let labDifficulty = 10;
let labResourceAccess = { rerolls: true, removals: true, credits: true, defense: true };
let labRuns = 100;
const currentReference = BALANCE_REFERENCE?.version >= 3 && ['resource-calibration','combat-benchmark'].includes(BALANCE_REFERENCE.kind) && BALANCE_REFERENCE.samplePurpose === 'release' && BALANCE_REFERENCE.sourceStable === true && BALANCE_REFERENCE.lookahead === true && Object.entries(DIFFICULTY).every(([key, value]) => BALANCE_REFERENCE.rules?.[key] === value) && BALANCE_REFERENCE.policyVersion === POLICY_VERSION && validateProfile(BALANCE_REFERENCE.profile) ? BALANCE_REFERENCE : null;
let experiment = { running: false, result: currentReference, source: 'reference', type: 'benchmark', completed: 0, total: 0, difficulty: 10, seed: currentReference?.seed || '', error: null };
const RESOURCE_LABELS = { rerolls: '重掷', removals: '移除', credits: '信用点消费', defense: '防御规划（生命/护盾）' };
const SUPPLIES = { repair: { name: '医疗补给', cost: 12, description: '恢复 18 点生命', key: 'supplyRepair' }, barrier: { name: '护盾补给', cost: 10, description: '获得 20 点护盾', key: 'supplyBarrier' }, overclock: { name: '超频补给', cost: 16, description: '下一次转动威力 ×1.2', key: 'supplyOverclock' } };
const inspector = createInspector({ resolve: inspectionContent });
const offline = createOfflineSupport(refreshOfflineView);
const percentage = value => {
  const percent = Number(value || 0) * 100;
  return percent > 0 && percent < .01 ? '＜0.01%' : `${percent.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}%`;
};

function curioArt(content, essence = false) {
  return `<span class="curio-art ${essence ? 'essence-art' : ''}">${content.image ? `<img src="${assetUrl(content.image)}" alt="" loading="lazy"/>` : esc(content.icon || '✦')}${essence ? '<i>精华</i>' : ''}</span>`;
}
function effectBadgeMarkup(content) {
  const badges = effectBadges(content);
  return badges.length ? `<span class="effect-badges" aria-label="效果持续时间">${badges.map(badge => `<span class="effect-chip duration-${esc(badge.key)}">${esc(badge.label)}</span>`).join('')}</span>` : '';
}
function effectRulesMarkup(content) {
  const rows = effectRows(content);
  return rows.length ? `<section class="effect-rules" aria-label="生效与叠加规则">${rows.map(row => `<div class="effect-rule"><h4>${esc(row.label)}</h4><dl><div><dt>时点</dt><dd>${esc(row.trigger)}</dd></div><div><dt>对象</dt><dd>${esc(row.target)}</dd></div><div><dt>持续</dt><dd><span class="effect-chip duration-${esc(row.duration.key)}">${esc(row.duration.label)}</span></dd></div><div><dt>叠加</dt><dd>${esc(row.stacking)}</dd></div>${row.scaling ? `<div><dt>星级</dt><dd>${esc(row.scaling)}</dd></div>` : ''}</dl>${row.duration.note ? `<p class="effect-duration-note">${esc(row.duration.note)}</p>` : ''}</div>`).join('')}</section>` : '';
}
function synergyRulesMarkup(synergy) {
  return (synergy.tierEffects || [synergy.effects]).map((effects, index) => `<section class="synergy-tier-rules"><h4>${synergy.thresholds[index]} 人档${synergy.tier === index + 1 ? ' · 当前档位' : ''}</h4>${effectRulesMarkup({effects})}</section>`).join('');
}
function powerBreakdownMarkup(instance) {
  const part = unitBreakdown(game, instance?.uid);
  if (!part) return '';
  return `<section class="power-breakdown" aria-label="上次威力构成"><h4>${esc(snapshotTitle(game))}</h4><dl><div><dt>基础 · 含星级</dt><dd>${num(part.base)}</dd></div><div class="permanent"><dt>本局永久成长</dt><dd>+${num(part.growth)}</dd></div>${part.beforeMultiplierBonus ? `<div class="temporary"><dt>前置临时加成</dt><dd>+${num(part.beforeMultiplierBonus)}</dd></div>` : ''}${part.baseMultiplier && part.baseMultiplier !== 1 ? `<div class="temporary"><dt>自身条件倍率</dt><dd>×${Number(part.baseMultiplier).toLocaleString('zh-CN',{maximumFractionDigits:6})}</dd></div>` : ''}<div class="temporary"><dt>后置临时加成</dt><dd>${part.flatBonus >= 0 ? '+' : ''}${num(part.flatBonus)}</dd></div><div><dt>最终倍率</dt><dd>×${Number(part.multiplier).toLocaleString('zh-CN',{maximumFractionDigits:6})}</dd></div><div class="final"><dt>上次结算威力</dt><dd>${num(part.final)}</dd></div></dl><p>（基础＋成长＋前置加成）×自身倍率，再加后置加成、乘最终倍率。临时加成下次重算；显示值可能舍入。辅助的威力数值不等于治疗或护盾量。</p></section>`;
}
function effectEventMarkup(event) {
  const timing = durationInfo(event.duration);
  const target = game.board.find(unit => unit?.uid === event.targetUid) || game.roster.find(unit => unit.uid === event.targetUid);
  const time = Number.isInteger(event.floor) && Number.isInteger(event.round) ? `第 ${event.floor} 关 · ${event.round === 0 ? '入关' : `第 ${event.round} 次转动`}` : '';
  return `<li><div><b>${esc(event.label || '效果结算')}</b><span class="effect-chip duration-${esc(timing.key)}">${esc(timing.label)}</span></div>${time ? `<small>${time}</small>` : ''}${target || Number.isFinite(event.amount) ? `<p>${target ? `作用于 ${esc(char(target.id)?.name || '同行者')}` : ''}${target && Number.isFinite(event.amount) ? ' · ' : ''}${Number.isFinite(event.amount) ? `实际 ${num(event.amount)}` : ''}</p>` : ''}</li>`;
}
function unitEffectsMarkup(instance) {
  if (!instance) return '';
  const entries = (game.lastSpin.effects || []).filter(event => event.sourceUid === instance.uid || event.targetUid === instance.uid);
  return entries.length ? `<details class="unit-effect-details"><summary>上次的具体效果 · ${entries.length} 条</summary><ul class="effect-event-list">${entries.slice(0, 20).map(effectEventMarkup).join('')}</ul></details>` : '';
}

function inspectionContent(anchor) {
  const kind = anchor.dataset.inspect;
  if (kind === 'mechanic') {
    const info = mechanicExplanation(anchor.dataset.key, game);
    if (!info) return null;
    const choice = anchor.dataset.key === 'aiProbability' && recommendationKey === currentRecommendationKey()
      ? recommendation?.choices.find(c => c.index === Number(anchor.dataset.aiIndex)) : null;
    return { title: info.title, bodyHtml: `<p>${esc(info.description)}</p>${info.extra ? `<p class="inspect-note">${esc(info.extra)}</p>` : ''}${choice ? `<p class="inspect-note">当前推荐 ${percentage(choice.probability)}：${esc(choice.reason)}</p>` : ''}` };
  }
  if (kind === 'character') {
    const instance = game.board.find(s => s?.uid === anchor.dataset.id) || game.roster.find(s => s.uid === anchor.dataset.id);
    const c = instance ? char(instance.id) : char(anchor.dataset.characterId);
    if (!c) return null;
    const index = instance ? game.board.findIndex(s => s?.uid === instance.uid) : -1;
    const historical = index >= 0 && game.stats.spins > 0;
    const power = historical ? game.lastSpin.values[index] : c.power * [0, 1, 3, 9][instance?.stars || 1] + (instance?.growth || 0);
    const attack = mechanicExplanation(c.attack, game);
    const targeted = (game.activeDebuffs || []).filter(clause => clause.targetUid === instance?.uid && clause.targetUid);
    return { title: c.name, bodyHtml: `<div class="inspect-character"><img src="${portrait(c)}" alt=""/><div><span class="inspect-stars">${stars(instance?.stars)}</span><p>${esc(c.element)} · ${esc(c.path)} · ${esc(c.faction)}</p><b>${historical ? '上次结算威力' : '基础威力（含成长）'} ${num(power)}</b></div></div>${effectBadgeMarkup(c)}<p class="skill-rule-label">技能基础规则</p><p>${esc(c.description)}</p>${effectRulesMarkup(c)}<p class="inspect-note">${esc(attack.description)}</p>${targeted.map(clause => `<p class="inspect-affliction">本关负面 · ${esc(clause.name)}：${esc(clause.description)}</p>`).join('')}${instance?.growth ? `<p class="growth-label">本局永久成长 +${num(instance.growth)} · 随实例与合成保留。</p>` : ''}${instance?.temporary ? `<p>临时角色：再登场 ${instance.temporary} 次后退场，不计激活羁绊人数、不参与升星。</p>` : ''}${instance?.status ? `<p>上次状态：${instance.status === 'consumed' ? '被消耗，未参与攻击' : '结算后已退场'}。</p>` : ''}${powerBreakdownMarkup(instance)}${unitEffectsMarkup(instance)}` };
  }
  if (kind === 'synergy') {
    const s = getSynergies(game).find(entry => entry.id === anchor.dataset.id);
    if (!s) return null;
    const members = [...new Set(game.roster.filter(unit => !unit.temporary).map(unit => unit.id))].map(char).filter(c => c && c[s.kind] === s.tag);
    const seen = new Set(game.board.filter(unit => unit && !unit.temporary && !unit.origin && char(unit.id)?.[s.kind] === s.tag).map(unit => unit.id)).size;
    const traces = (game.lastSpin.effects || []).filter(event => event.sourceId === s.id);
    return { title: s.name, bodyHtml: `${s.style ? `<p class="synergy-style">${esc(s.style)}</p>` : ''}<p>${esc(s.description)}</p>${effectBadgeMarkup(s)}<div class="inspect-thresholds">${s.thresholds.map(t => `<span class="${s.count >= t ? 'active' : ''}">${t} 人 ${s.count >= t ? '✓ 已激活' : '未达成'}</span>`).join('')}</div><p>永久编队 ${s.count} 个不同身份 · ${s.active ? `第 ${s.tier} 档已激活，触发还需满足效果条件` : '尚未激活'}。</p><p class="inspect-note">${members.map(c => esc(c.name)).join('、') || '编队尚无符合条件的角色'}。重复副本与星级不重复计数；临时角色不凑激活人数。</p>${synergyRulesMarkup(s)}${game.stats.spins ? `<p class="inspect-note">${esc(snapshotTitle(game))}：匹配登场 ${seen} 个不同永久身份，${traces.length ? `${traces.length} 条效果记录` : '没有此羁绊的触发记录'}。这不是下一次的触发保证。</p>` : ''}` };
  }
  if (kind === 'item' || kind === 'essence') {
    const c = kind === 'item' ? item(anchor.dataset.id) : essence(anchor.dataset.id);
    if (!c) return null;
    const owned = kind === 'essence' ? game.essences.find(e => e.id === c.id) : null;
    return { title: c.name, bodyHtml: `${curioArt(c, kind === 'essence')}${effectBadgeMarkup(c)}<p>${esc(c.description)}</p>${effectRulesMarkup(c)}<p class="inspect-note">${kind === 'item' ? '取得时的即时奖励只领取一次；持有被动按各自条件触发，无需点击使用。' : owned ? owned.triggered ? '已达成条件。一次性奖励不会重复领取；本局持续效果继续按规则生效。' : `当前蓄能 ${num(owned.progress)} / ${c.target}，尚未解锁效果。` : '取得后开始积累对应条件；解锁前不会获得后续被动。'}</p>` };
  }
  if (kind === 'debuff') {
    const clause = (game.activeDebuffs || []).find(entry => entry.id === anchor.dataset.id);
    return clause ? { title: clause.name, bodyHtml: `<span class="effect-chip duration-encounter">本关负面</span><p>${esc(clause.description)}</p>${clause.id === 'synergy_audit' ? '<p class="inspect-note">征收作用于羁绊的额外威力与追加伤害，不放大或削减羁绊的资源、治疗、护盾、控制与触发次数。</p>' : ''}<dl class="debuff-lifetime"><div><dt>持续</dt><dd>当前关卡，过关后移除或重新配置</dd></div><div><dt>触发</dt><dd>每次转动按条款条件重新检查；不是永久削减角色属性</dd></div><div><dt>叠加</dt><dd>同名条款不重复追加；不同条款可共同作用</dd></div></dl><p class="inspect-note">${clause.source === 'boss' ? '首领阶段追加' : '难度条款'} · ${clause.addedRound === 0 ? '入场时配置' : `第 ${clause.addedRound} 次转动时追加`}。${clause.targetUid ? '污染还可通过移除或合成被标记实例提前解除。' : ''}</p>` } : null;
  }
  if (kind === 'enemy') {
    const enemy = game.enemies.find(e => e.col === Number(anchor.dataset.col));
    return enemy ? { title: enemy.name, bodyHtml: `<span class="effect-chip duration-encounter">当前遭遇</span><p>第 ${enemy.col + 1} 列 · 生命 ${num(enemy.hp)} / ${num(enemy.maxHp)} · 基础反击 ${enemy.attack}。</p><p>${enemy.boss ? '首领固定在中间列。' : ''}角色先行动，存活敌人再反击，已击破敌人不会反击。</p><p class="inspect-note">${esc(game.enemySkill.name)}：${esc(game.enemySkill.description)} 本关持续，按每次转动条件触发；过关后更换。</p>` } : null;
  }
  return null;
}
function decorateInspectors() {
  const mechanic = (selector, key, helpAt) => document.querySelectorAll(selector).forEach(anchor => {
    const info = mechanicExplanation(key, game);
    if (!info) return;
    anchor.dataset.inspect = 'mechanic'; anchor.dataset.key = key; anchor.dataset.inspectClick = 'true'; anchor.classList.add('has-explanation');
    if (helpAt) {
      anchor.tabIndex = -1;
      if (!anchor.querySelector('.mechanic-help')) {
        const target = helpAt === 'self' ? anchor : anchor.querySelector(helpAt);
        if (target) {
          const button = document.createElement('button');
          button.type = 'button'; button.className = 'mechanic-help';
          button.dataset.inspect = 'mechanic'; button.dataset.key = key; button.dataset.inspectClick = 'true';
          button.setAttribute('aria-label', `查看${info.title}说明`);
          button.setAttribute('aria-haspopup', 'dialog');
          button.innerHTML = '<span aria-hidden="true">?</span>';
          target.append(button);
        }
      }
    } else {
      anchor.tabIndex = 0;
      if (anchor.tagName !== 'BUTTON' && !anchor.dataset.action) {
        anchor.setAttribute('role', 'button'); anchor.setAttribute('aria-label', `查看${info.title}说明`);
        anchor.setAttribute('aria-haspopup', 'dialog');
      }
    }
  });
  mechanic('.health-stat', 'hp', ':scope > div:first-child > span');
  mechanic('.supply-credits', 'credits', ':scope > span');
  mechanic('.small-stats>div:nth-child(1)', 'shield', ':scope > b');
  mechanic('.small-stats>div:nth-child(2)', 'rerolls', ':scope > b');
  mechanic('.small-stats>div:nth-child(3)', 'removals', ':scope > b');
  mechanic('.mobile-combat-hud>span[data-key="hp"]', 'hp', 'self');
  mechanic('.mobile-combat-hud>span[data-key="shield"]', 'shield', 'self');
  mechanic('.floor-display', 'floor', '.orbital-ring'); mechanic('.segmented-progress', 'floor');
  mechanic('.arena-heading>span:first-child', 'floor', 'self'); mechanic('.arena-heading>.tiny-label', 'round', 'self');
  mechanic('.synergy-panel .panel-heading', 'synergy', 'h2'); mechanic('.synergy-panel .panel-intro', 'synergy');
  mechanic('.roster-link', 'roster'); mechanic('.difficulty-badge', 'difficulty');
  mechanic('.enemy-rule', 'intent'); mechanic('.last-total', 'damage', ':scope > span');
  mechanic('.curios-panel .panel-heading', 'items', 'h2'); mechanic('.essence-panel .panel-heading', 'essences', 'h2');
  mechanic('.seed-label', 'seed'); mechanic('.cell-stars', 'stars'); mechanic('.cell-power', 'power'); mechanic('.reel-cell.blank', 'roster');
  mechanic('.ai-panel .panel-heading', 'aiLab', 'h2');
  if (!document.querySelector('.mechanic-hint')) {
    const hint = document.createElement('p'); hint.className = 'mechanic-hint';
    hint.textContent = '点 ? 查看说明 · 也可悬停或长按';
    document.querySelector('.dossier .small-stats')?.after(hint);
  }
  for (const kind of ['character', 'synergy', 'item', 'essence']) document.querySelectorAll(`[data-action="${kind}"]`).forEach(anchor => { anchor.dataset.inspect = kind; anchor.dataset.inspectClick = 'true'; });
  document.querySelectorAll('.enemy-slot:not(.empty)').forEach((anchor, col) => { anchor.dataset.inspect = 'enemy'; anchor.dataset.inspectClick = 'true'; anchor.dataset.col = Array.from(anchor.parentElement.children).indexOf(anchor); anchor.tabIndex = 0; });
  document.querySelectorAll('.character-tags>span:last-child').forEach(anchor => { const text = anchor.textContent; const type = Object.keys(attackNames).find(key => text.startsWith(attackNames[key])); if (type) { anchor.dataset.inspect='mechanic';anchor.dataset.key=type;anchor.tabIndex=0; } });
}
function closeUtilityOnly() {
  if (!document.querySelector('.utility-panel')) return;
  document.querySelector('.utility-panel').remove(); dialog = null;
  document.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.action === 'play'));
}
function currentRecommendationKey() {
  return `${game.difficulty}:${JSON.stringify(game.resourceStats)}:${game.overclockReady}:${game.supplyPurchases}:${game.hp}:${game.shield}:${JSON.stringify(game.activeDebuffs)}:${game.seed}:${game.stats.spins}:${game.phase}:${game.choices.join(',')}:${game.uidCounter}:${game.coins}:${game.roster.map(u=>u.uid).join(',')}:${JSON.stringify(aiProfile)}`;
}
function recommendationMarkup(index) {
  const c = recommendationKey === currentRecommendationKey() ? recommendation?.choices.find(choice => choice.index === index) : null;
  const label = index === game.choices.length ? `${game.phase === 'recruit' ? '暂不招募' : '跳过奖励'} · ` : '';
  return c ? `<div class="ai-probability-heading"><span>${label}AI 推荐</span><strong>${percentage(c.probability)}</strong></div><div class="ai-probability-meter"><i style="width:${c.probability * 100}%"></i></div><p>${esc(c.reason)}</p>` : `<div class="ai-probability-heading"><span>${label}AI 正在分析</span><strong>…</strong></div><p>评估当前构筑与随机战场</p>`;
}
function applyRecommendation(result, key) {
  if (key !== currentRecommendationKey() || !isReward()) return;
  recommendation = result; recommendationKey = key;
  document.querySelectorAll('[data-ai-index]').forEach(node => { node.innerHTML = recommendationMarkup(Number(node.dataset.aiIndex)); });
  updateAiPanel();
}
function requestRecommendations() {
  if (!isReward() || busy) return;
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
    inferenceWorker.postMessage({ type: 'recommend', requestId: id, state: game, profile: aiProfile });
  } catch { fallbackRecommendation(key); }
}
function fallbackRecommendation(key) {
  setTimeout(() => { if (key === currentRecommendationKey() && isReward()) applyRecommendation(recommendRewards(game, { profile: aiProfile }), key); }, 0);
}
function aiPanel() {
  const progress = experiment.running ? Math.round(experiment.completed / Math.max(1, experiment.total) * 100) : 0;
  const status = aiAutoplay ? '统一决策：构筑、重掷、移除与补给 · 可随时停止' : isReward() ? `${game.choices.length} 张奖励与跳过都有推荐概率和理由` : '下一次招募时评估奖励与跳过';
  const experimentLabel = experiment.type === 'train' ? '训练与独立验证' : experiment.type === 'ablation' ? '20 组资源矩阵' : 'AI / 随机对照';
  return `<section class="panel ai-panel"><div class="panel-heading"><h2>AI 开拓助手</h2><span class="count-badge">${aiAutoplay ? '代打中' : '策略 AI'}</span></div><p class="panel-intro muted">看懂构筑，也验证每一种可能。</p><div class="ai-status">${status}</div><div class="ai-buttons"><button class="button ghost" data-action="aiAutoplay" ${['victory', 'defeat'].includes(game.phase) ? 'disabled' : ''}>${aiAutoplay ? '停止代打' : 'AI 代打'}</button><button class="button ghost" data-action="aiLab">自动测试</button></div>${experiment.running ? `<div class="ai-batch-progress"><div><span>${experimentLabel}</span><b>${progress}%</b></div><div class="meter gold"><i style="width:${progress}%"></i></div></div>` : experiment.result ? '<p class="ai-last-result">✓ 评测记录可用 · 点自动测试查看</p>' : ''}<small class="ai-model-version">策略 ${esc(POLICY_VERSION)} · 模型 ${esc(aiProfile.version)} · 本地运行</small></section>`;
}
function updateAiPanel() {
  const panel = document.querySelector('.ai-panel');
  if (panel) { const replacement = document.createElement('div'); replacement.innerHTML = aiPanel(); panel.replaceWith(replacement.firstElementChild); decorateInspectors(); }
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
  if (!experiment.running) return experiment.error ? `<p class="lab-error">${esc(experiment.error)}</p>` : '';
  const progress = Math.round(experiment.completed / Math.max(1, experiment.total) * 100);
  return `<div class="ai-batch-progress"><div><span>${experiment.type === 'train' ? '尝试参数 → 验证 → 留出测试' : '新建独立对局'}</span><b>${experiment.completed} / ${experiment.total} · ${progress}%</b></div><div class="meter gold"><i style="width:${progress}%"></i></div></div><button class="text-button" data-action="aiCancel">取消本次实验</button>`;
}
function labResultMarkup() {
  if (!experiment.result) return '<p class="lab-empty">当前战斗规则尚无发布评测记录。可运行新实验，当前旅程保持。</p>';
  const result = experiment.result;
  if (experiment.type === 'train') {
    const rows = result.holdout?.baseline?.modes || [];
    return `<div class="lab-training-result"><b>${result.accepted ? '独立验收通过，已采用新策略' : '未证明改进，保留当前策略'}</b><p>训练、验证和留出使用不同种子。</p></div>${rows.map(before => {
      const after = result.holdout.candidate.modes.find(row => row.difficulty === before.difficulty) || result.holdout.candidate.modes[0];
      return `<article class="lab-mode-result"><h3>难度 D${before.difficulty || labDifficulty} · 每模型 ${before.runs} 局</h3><p>原策略 ${percentage(before.winRate)} → 候选 ${percentage(after?.winRate)}</p></article>`;
    }).join('')}`;
  }
  const variants = result.variants || result.resourceScenarios || result.scenarios;
  const sameProfile = JSON.stringify(validateProfile(result.profile)) === JSON.stringify(validateProfile(aiProfile));
  const context = `<p class="lab-archive-label">${experiment.source === 'reference' ? '独立发布评测' : '本次独立实验'} · 种子 ${esc(result.seed || experiment.seed)}<br/>策略 ${esc(result.policyVersion || POLICY_VERSION)} · 评测模型 ${esc(result.profile?.version || '未记录')}<br/>仅适用于本批难度与资源配置，不能视为玩家通关率。${sameProfile ? '' : '<br/>当前模型档案与评测记录不同，运行新实验可验证当前档案。'}</p>`;
  if (!variants) return context + (result.calibrationTarget ? `<p class="lab-intro">本配置通关目标 ${percentage(result.calibrationTarget.min)}–${percentage(result.calibrationTarget.max)}：${result.calibrationTarget.passed ? '已通过' : '未通过'}。本次仅验证当前配置与随机基线；资源缺失的 D8 / D6 / D4 / D2 映射尚未在新版重新验收。</p>` : '') + benchmarkMarkup(result);
  const normalized = variants.map(row => ({ ...row, summary: row.summary || row.ai, disabledResources: row.disabledResources || Object.entries(row.resourceAccess || {}).filter(([, allowed]) => !allowed).map(([key]) => key) }));
  const full = normalized.find(row => row.difficulty === 10 && row.disabledResources.length === 0);
  const assessed = normalized.map(row => ({ ...row, ...assessResourceVariant(row, { full, target: result.target }) }));
  return `${context}${calibrationOverview(assessed, result.target)}<p class="lab-intro">D10 的主动资源对照衡量同难度影响；其他配置按开关数标记 D8 / D6 / D4 / D2，必须再核对实际消费才能验收。关闭防御规划保留自然防御，观察结果单独解释。点每行展开原始胜率、真实资源和原因。</p><div class="variant-matrix">${assessed.map((row, index) => {
    const summary = row.summary || row.ai;
    if (!summary) return '';
    const disabled = row.disabledResources || Object.entries(row.resourceAccess || {}).filter(([, allowed]) => !allowed).map(([key]) => key);
    const label = disabled.length ? `禁用 ${disabled.map(key => RESOURCE_LABELS[key] || key).join('、')}` : '全资源';
    return `<details class="variant-row" ${index === 0 ? 'open' : ''}><summary><span><b>D${row.difficulty} · ${row.passed ? '已通过' : row.verifiable ? '未通过' : '未能验收'}</b><small>${esc(label)}</small></span><strong>${percentage(summary.winRate)}</strong></summary>${variantAssessmentMarkup(row)}${benchmarkMarkup({ modes: [{ ...row, ai: summary }] })}</details>`;
  }).join('')}</div>`;
}
function calibrationOverview(variants, target) {
  const full = variants.find(row => row.difficulty === 10 && row.disabledResources.length === 0);
  const activeNominal = variants.filter(row => !row.isAblation && row.disabledResources.length > 0 && !row.disabledResources.includes('defense'));
  const activeControls = variants.filter(row => row.isAblation && !row.disabledResources.includes('defense'));
  const defenseRows = variants.filter(row => row.disabledResources.includes('defense'));
  const hasLowEvidence = defenseRows.some(row => (row.summary?.defenseUsage?.strata?.low?.n || 0) > 0);
  const allPassed = target?.passed ?? (variants.length > 0 && variants.every(row => row.passed));
  return `<section class="calibration-overview" aria-label="资源校准验收状态"><p><b>完整 D10 目标</b><span>${full ? full.passed ? '已通过' : '未通过，详见首行原因' : '未提供完整 D10 样本'}</span></p><p><b>主动资源档位验收</b><span>${activeNominal.filter(row => row.passed).length} / ${activeNominal.length} 组通过</span></p><p><b>同难度主动资源对照</b><span>${activeControls.filter(row => row.passed).length} / ${activeControls.length} 组通过</span></p><p><b>防御规划观察</b><span>${hasLowEvidence ? '已有低使用样本，按各行样本数解释' : '未提供低使用证据'}</span></p><small>完整映射${allPassed ? '通过' : '尚未全部证实'}；各行保留原始胜率，观察组不冒充移除防御的消融。</small></section>`;
}
function variantAssessmentMarkup(row) {
  const defense = row.actualDefensiveUse;
  const missing = row.actualMissingResources || [];
  const disabledPlanning = defense?.planningEnabled === false;
  const observation = disabledPlanning && !defense.lowUse ? `仅关闭防御规划；实际防御仍${defense.effective ? '有效' : '有参与'}，不作为缺防御的档位验收。` : disabledPlanning ? '仅关闭防御规划；低使用样本为赛后观察，不等于彻底移除生命与护盾。' : '';
  return `<section class="variant-assessment ${row.passed ? 'passed' : ''}"><b>${row.passed ? '验收通过' : row.verifiable ? '验收未通过' : '尚不能验收此映射'}</b><p>实际缺失：${missing.length ? esc(missing.map(key => RESOURCE_LABELS[key] || key).join('、')) : '无'}（${row.actualMissingResourceCount} 类） · 对应名义 D${row.nominalDifficulty}</p>${observation ? `<p class="planning-observation">${observation}</p>` : ''}${row.reasons?.length ? `<ul>${row.reasons.map(reason => `<li>${esc(reason)}</li>`).join('')}</ul>` : ''}</section>`;
}
function usageMarkup(usage) {
  if (!usage) return '';
  const fields = [['rerollsUsed', '重掷'], ['paidRerolls', '付费重掷'], ['removalsUsed', '移除'], ['supplyPurchases', '补给购买'], ['creditsSpent', '信用点消费'], ['initialHp', '初始生命'], ['healed', '实际治疗'], ['hpLost', '生命损失'], ['initialShield', '初始护盾'], ['shieldGained', '获得护盾'], ['shieldBlocked', '护盾抵挡'], ['shieldDecayed', '护盾衰减浪费']];
  return `<div class="usage-grid">${fields.map(([key, label]) => `<span>${label}<b>${num(Math.round((usage[key] || 0) * 100) / 100)}</b></span>`).join('')}</div>`;
}
function defenseUsageMarkup(usage) {
  if (!usage) return '';
  const labels = { low: '使用偏低', moderate: '部分使用', effective: '有效使用' };
  const generated = (usage.hpGenerated || 0) + (usage.shieldGenerated || 0);
  const rate = (value, denominator) => denominator > 0 && Number.isFinite(value) ? percentage(value) : '未生成';
  const low = usage.thresholds?.low ?? .2;
  const effective = usage.thresholds?.effective ?? .5;
  return `<section class="defense-efficiency"><button type="button" class="defense-efficiency-heading" data-inspect="mechanic" data-inspect-click="true" data-key="defenseUsage">防御有效消耗 <span>?</span></button><div class="defense-rates"><span>生命消耗 / 生成<b>${rate(usage.hpConsumptionRate, usage.hpGenerated)}</b></span><span>护盾抵伤 / 生成<b>${rate(usage.shieldConsumptionRate, usage.shieldGenerated)}</b></span><span>合计有效消耗<b>${rate(usage.combinedRate, generated)}</b></span></div><p class="defense-classification">${esc(labels[usage.classification] || '待判断')}（暂定）：＜${percentage(low)} 偏低，≥${percentage(effective)} 有效。</p><p class="lab-archive-label">本批生命 ${num(usage.hpConsumed)} / ${num(usage.hpGenerated)}，护盾 ${num(usage.shieldConsumed)} / ${num(usage.shieldGenerated)}（消耗 / 生成）；护盾衰减浪费 ${num(usage.shieldWasted)}。按总量归一，不平均逐局百分比；高效率不代表承伤越多越好。</p>${defenseStrataMarkup(usage.strata)}</section>`;
}
function defenseStrataMarkup(strata) {
  if (!strata) return '';
  const groups = [['low', '偏低'], ['moderate', '部分'], ['effective', '充分']].map(([key, label]) => ({ ...strata[key], label }));
  const interval = group => group.n > 0 && Array.isArray(group.winRateCI) ? `${percentage(group.winRateCI[0])} – ${percentage(group.winRateCI[1])}` : '—';
  return `<details class="defense-strata"><summary>防御使用分层 · 观察样本</summary><p>按赛后消费比例分层，不能作为因果消融。零样本不提供胜率证据；20% / 50% 为暂定观察分类。</p><table><thead><tr><th>分层</th><th>胜 / 样本</th><th>胜率 / 95% 区间</th></tr></thead><tbody>${groups.map(group => `<tr><th>${group.label}</th><td>${num(group.wins)} / ${num(group.n)}</td><td>${group.n > 0 ? percentage(group.winRate) : '—'}<small>${interval(group)}</small></td></tr>`).join('')}</tbody></table>${groups.map(group => {
    const joint = group.jointActiveFour || {};
    return `<div class="stratum-detail"><b>${group.label}组</b><p>生命 ${num(group.hpConsumed)} / ${num(group.hpGenerated)}，护盾 ${num(group.shieldConsumed)} / ${num(group.shieldGenerated)}（消耗 / 生成）。</p><p>四类均参与：${num(joint.wins)} 胜 / ${num(joint.n)} 局，${joint.n > 0 ? percentage(joint.winRate) : '胜率无样本'}；区间 ${interval(joint)}。</p></div>`;
  }).join('')}<p>四类参与中的防御按暂定 ≥20% 观察，充分使用按 ≥50%；这些赛后子组保留样本数，不能等同独立随机对照。</p></details>`;
}
function benchmarkMarkup(result) {
  return (result?.modes || []).map(row => {
    const { ai, uniform } = row;
    if (!ai) return '';
    const denied = Object.entries(row.resourceAccess || {}).filter(([, allowed]) => !allowed).map(([key]) => RESOURCE_LABELS[key]);
    return `<article class="lab-mode-result"><h3>难度 D${row.difficulty || result.difficulty || 10} · ${esc(denied.length ? '禁用 ' + denied.join('、') : '全资源')}</h3><p class="lab-archive-label">AI ${num(ai.runs)} 局 · ${num(ai.wins)} 胜${uniform ? ` · 随机 ${num(uniform.runs)} 局` : ''}</p><div class="lab-result-row"><span>AI 通关</span><b>${percentage(ai.winRate)}</b></div><div class="lab-chart"><i style="width:${Math.max(0, Math.min(100, ai.winRate * 100))}%"></i></div>${Array.isArray(ai.winRateCI) ? `<p class="lab-interval">95% 区间 ${percentage(ai.winRateCI[0])} – ${percentage(ai.winRateCI[1])}</p>` : ''}${uniform ? `<div class="lab-result-row"><span>随机选择</span><b>${percentage(uniform.winRate)}</b></div>` : ''}<div class="lab-summary"><span>平均抵达 <b>${Number(ai.avgFloor || 0).toFixed(2)} 关</b></span><span>平均合成 <b>${Number(ai.avgMerges || 0).toFixed(2)} 次</b></span><span>平均跳过 <b>${num(Math.round((ai.avgSkips || 0) * 100) / 100)} 次</b></span></div><p class="lab-archive-label">每局平均资源统计</p>${usageMarkup(ai.avgUsage)}${defenseUsageMarkup(ai.defenseUsage)}<p class="lab-failures">未完成 ${num(ai.incomplete)} 局${ai.failureByFloor?.filter(f => f.count > 0).map(f => ` · 第 ${f.floor} 关失败 ${f.count} 局`).join('') || (ai.wins === ai.runs ? ' · 本批全部通关' : '')}</p></article>`;
  }).join('');
}
function aiLabDialog() {
  return modal('AI 试验台', `<p class="lab-intro">统一 AI 决策同时考虑转动、招募、跳过、重掷、移除与补给。实验另建独立对局，不修改当前旅程。</p><div class="lab-controls"><label>实验难度<select id="lab-difficulty" ${experiment.running ? 'disabled' : ''}>${Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}" ${labDifficulty === i + 1 ? 'selected' : ''}>D${i + 1}${i === 9 ? ' · 默认' : ''}</option>`).join('')}</select></label><label>每策略局数<select id="lab-runs" ${experiment.running ? 'disabled' : ''}>${[30, 100, 300, 1000].map(n => `<option value="${n}" ${labRuns === n ? 'selected' : ''}>${num(n)} 局</option>`).join('')}</select></label></div><fieldset class="resource-access" ${experiment.running ? 'disabled' : ''}><legend>允许的资源 · 取消勾选即可禁用</legend>${Object.entries(RESOURCE_LABELS).map(([key, label]) => `<label><input type="checkbox" data-resource="${key}" ${labResourceAccess[key] ? 'checked' : ''}/><span>${label}</span></label>`).join('')}</fieldset><div class="lab-actions"><button class="button primary" data-action="aiBenchmark" ${experiment.running ? 'disabled' : ''}>运行当前配置</button><button class="button ghost" data-action="aiTrain" ${experiment.running ? 'disabled' : ''}>训练并验证</button></div><button class="button ghost full resource-ablation" data-action="aiAblation" ${experiment.running ? 'disabled' : ''}>资源矩阵 · D10 / D8 / D6 / D4 / D2</button><p class="lab-archive-label">资源矩阵固定运行 20 组：全资源 D10、四个单禁用 D10 对照，以及按禁用数降低难度的 15 组；每组使用上方局数，不采用上方开关。取消防御规划只禁用医疗/护盾补给，自然治疗、护盾增益与承伤均保留；效率按实际消耗量 / 生成量统计。训练每候选最多 60 局，留出每模型最多 100 局。</p><div class="lab-progress" aria-live="polite">${labProgressMarkup()}</div><div class="lab-result">${labResultMarkup()}</div>`, '', { eyebrow: 'RESOURCE & DIFFICULTY LAB' });
}
function startExperiment(type) {
  if (experiment.running) return;
  const difficulty = labDifficulty;
  const resourceAccess = { ...labResourceAccess };
  const runs = Number(document.querySelector('#lab-runs')?.value || 100);
  const seed = freshSeed();
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
      if (dialog === 'aiLab') render();
    };
    experimentWorker.onerror = () => { if (id !== experimentId) return; experiment.running = false; experiment.error = '实验线程未能完成，请重试。'; experimentWorker?.terminate(); experimentWorker = null; if (dialog === 'aiLab') render(); else updateAiPanel(); };
    experimentWorker.postMessage({ type, requestId: id, difficulty, resourceAccess, runs: type === 'train' ? Math.min(runs, 60) : runs, holdoutRuns: Math.min(runs, 100), generations: 2, candidates: 4, seed, profile: aiProfile });
    render();
  } catch (error) { experiment.running = false; experiment.error = error.message; render(); }
}
function toggleAutoplay() {
  aiAutoplay = !aiAutoplay;
  clearTimeout(aiAutoplayTimer);
  updateAiPanel();
  document.querySelectorAll('[data-action="aiAutoplay"]').forEach(button => { button.textContent = aiAutoplay ? '停止 AI' : 'AI 代打'; });
  if (aiAutoplay) { showToast('AI 开始接管当前旅程，可随时停止。'); scheduleAutoplay(); }
}
function scheduleAutoplay() {
  clearTimeout(aiAutoplayTimer);
  if (!aiAutoplay) return;
  aiAutoplayTimer = setTimeout(async () => {
    if (!aiAutoplay) return;
    if (busy || dialog || inspector.isOpen()) { scheduleAutoplay(); return; }
    try {
      const action = recommendAction(game, { profile: aiProfile });
      if (action.type === 'stop') { aiAutoplay = false; updateAiPanel(); return; }
      if (action.type === 'spin') await doSpin();
      else if (action.type === 'reroll') { adopt(rerollRewards(game)); render(); }
      else if (action.type === 'remove') { adopt(removeSymbol(game, action.uid)); render(); }
      else if (action.type === 'supply') { adopt(purchaseSupply(game, action.kind)); render(); }
      else if (action.type === 'reward') {
        const advice = action.recommendation;
        if (!advice) throw Error('奖励决策缺少推荐分布');
        applyRecommendation(advice, currentRecommendationKey());
        const index = sampleRecommendation(advice, liveAiRandom());
        const choice = advice.choices.find(candidate => candidate.index === index);
        if (!choice) throw Error('推荐动作已失效');
        adopt(choice.action === 'skip' ? skipReward(game) : chooseReward(game, index));
        if (choice.action !== 'skip') playTone('recruit');
        render();
      } else throw Error('未知推荐动作');
    } catch (error) {
      aiAutoplay = false; showToast(`AI 已停止：${error.message}`); updateAiPanel();
    }
    scheduleAutoplay();
  }, 650);
}
document.addEventListener('wheel', event => { if (!event.target.closest('.utility-panel') && !event.target.closest('.inspect-popover')) closeUtilityOnly(); }, {passive:true});
document.addEventListener('pointerdown', event => {
  if (dialog && document.querySelector('.utility-panel') && !event.target.closest('.utility-panel') && !event.target.closest('.inspect-popover')) closeUtilityOnly();
}, true);


function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ game, settings, stats })); saveAvailable = true; return true; }
  catch { if (saveAvailable) showToast('浏览器未允许保存，本次进度仅在当前页面保留。'); saveAvailable = false; return false; }
}
function adopt(next) {
  if (game.phase !== 'victory' && next.phase === 'victory') stats.wins++;
  const priorClauses = new Set((game.activeDebuffs || []).map(clause => clause.id));
  const newBossClauses = (next.activeDebuffs || []).filter(clause => clause.source === 'boss' && (next.floor !== game.floor || !priorClauses.has(clause.id)));
  game = next;
  stats.bestFloor = Math.max(stats.bestFloor, game.floor);
  persist();
  if (newBossClauses.length) showToast(`首领阶段 ${game.bossStage}：新增条款 ${newBossClauses.map(clause => clause.name).join('、')}，点条款查看效果。`);
}
function playTone(type = 'spin') {
  if (!settings.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(type === 'spin' ? 320 : 560, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(type === 'spin' ? 640 : 840, audioContext.currentTime + .12);
    gain.gain.setValueAtTime(.055, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .22);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + .24);
  } catch { /* The game remains playable when audio is unavailable. */ }
}
function showToast(message) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.textContent = message;
  document.body.append(toast); toastTimer = setTimeout(() => toast.remove(), 3800);
}
const isReward = () => ['recruit', 'item', 'essence'].includes(game.phase);
const modalOpen = () => !!document.querySelector('.modal-backdrop');
const char = id => characterById(id) || CHARACTERS.find(c => c.id === id);
const item = id => ITEMS.find(c => c.id === id);
const essence = id => ESSENCES.find(c => c.id === id);
const stars = count => '★'.repeat(Math.max(1, count || 1));
function enemyArt(enemy) {
  if (enemy.boss) return 'boss';
  const known = ['automaton', 'voidranger', 'frostspawn', 'mara'];
  const art = String(enemy.art || '').split('/').at(-1).replace(/\.svg$/, '');
  return known.includes(art) ? art : known[(game.floor - 1) % known.length];
}
function header() {
  return `<header class="site-header"><a class="brand" href="${IS_PORTABLE ? '#app' : './'}" aria-label="星穹转轮首页"><span class="brand-mark">${icon('cube')}</span><span><b>星穹转轮</b><small>ASTRAL REELS</small></span></a><nav aria-label="主导航"><button data-action="play" class="nav-button ${!dialog ? 'active' : ''}">转轮实验室</button><button data-action="catalog" class="nav-button ${dialog === 'catalog' ? 'active' : ''}">编队图鉴</button><button data-action="help" class="nav-button">玩法手册</button><button data-action="aiLab" class="nav-button">AI 试验台</button></nav><div class="header-actions"><span class="version-label">VERSION 0.4.0</span><button class="icon-button" data-action="sound" aria-label="${settings.sound ? '关闭音效' : '开启音效'}" title="${settings.sound ? '关闭音效' : '开启音效'}">${icon(settings.sound ? 'sound' : 'mute')}</button><button class="icon-button" data-action="settings" aria-label="游戏设置">${icon('settings')}</button></div></header>`;
}
function leftPanel() {
  const synergy = getSynergies(game);
  const active = synergy.filter(s => s.active);
  const preview = [...active, ...synergy.filter(s => !s.active && s.count > 0)].slice(0, 7);
  return `<aside class="left-panel"><section class="panel dossier"><div class="panel-heading"><h2>开拓档案</h2><span class="tiny-label">TRAILBLAZER</span></div><div class="difficulty-badge" data-inspect="mechanic" data-key="difficulty" data-inspect-click="true" tabindex="0">难度 <b>D${game.difficulty}</b> <span>?</span></div><div class="floor-display"><span class="orbital-ring">${icon('cube')}</span><div><span class="eyebrow">模拟宇宙 · 关卡进度</span><strong>第 ${String(game.floor).padStart(2, '0')} 关<small> / ${game.endless ? '∞' : '12'}</small></strong></div></div><div class="segmented-progress" aria-label="已到第 ${game.floor} 关">${Array.from({ length: 12 }, (_, i) => `<i class="${i < Math.min(game.floor, 12) ? 'filled' : ''}"></i>`).join('')}</div><div class="health-stat"><div><span>${icon('heart')}开拓生命</span><b>${num(game.hp)} <small>/ ${num(game.maxHp)}</small></b></div><div class="meter "><i style="width:${Math.min(100, Math.max(0, game.hp / game.maxHp * 100))}%"></i></div></div><div class="supply-credits"><span>${icon('coins')}补给信用点</span><b>${num(game.coins)}</b></div><div class="small-stats"><div><span>${icon('shield')}护盾</span><b>${num(game.shield)}</b></div><div><span>${icon('rotate')}重掷</span><b>${num(game.rerolls)}</b></div><div><span>${icon('trash')}移除</span><b>${num(game.removals)}</b></div></div><button class="button ghost full" data-action="new">${icon('rotate')}开启新旅程</button></section><section class="panel synergy-panel"><div class="panel-heading"><h2>羁绊共鸣</h2><span class="count-badge">${active.length} 激活</span></div><p class="muted panel-intro">激活门槛看编队，实际触发看登场与条件。</p><div class="synergy-list">${preview.map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon(s.kind === 'faction' ? 'users' : s.kind === 'element' ? 'bolt' : 'star')}</span><span class="synergy-name"><b>${esc(s.name)}</b>${s.style ? `<em class="synergy-style">${esc(s.style)}</em>` : ''}<small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.find(t => t > s.count) || s.thresholds.at(-1)}</small></span></button>`).join('') || '<p class="muted">招募角色后解锁羁绊。</p>'}</div><p class="panel-note">按不同永久身份激活 · 具体收益取决于触发条件</p><button class="all-synergies" data-action="synergies">查看全部羁绊 ${icon('chevron')}</button></section><button class="panel roster-link" data-action="roster"><span class="round-icon">${icon('users')}</span><span><b>我的编队</b><small>${game.roster.length} 位同行者 · 三合一自动升星</small></span>${icon('chevron')}</button></aside>`;
}
function debuffPanel() {
  const clauses = game.activeDebuffs || [];
  const recent = clauses.filter(clause => clause.source === 'boss' && clause.addedRound === game.round && game.round > 0);
  return `<div class="debuff-panel" aria-label="当前敌方负面条款"><div class="debuff-heading"><b>敌方条款</b><span>${game.bossStage ? `首领阶段 ${game.bossStage} / 3` : `难度 D${game.difficulty}`}</span></div>${recent.length ? `<p class="new-clause-notice" role="status">⚠ 首领阶段推进 · 新增 ${recent.map(clause => esc(clause.name)).join('、')}</p>` : ''}${clauses.length ? `<div class="debuff-list">${clauses.map(clause => `<button type="button" class="debuff-chip ${clause.source === 'boss' ? 'boss-clause' : ''}" data-inspect="debuff" data-inspect-click="true" data-id="${esc(clause.id)}" aria-label="查看${esc(clause.name)}条款说明">${clause.source === 'boss' ? '⚠ ' : ''}${esc(clause.name)}${clause.targetName ? ` · ${esc(clause.targetName)}` : ''} <span>?</span></button>`).join('')}</div>` : '<p>当前没有额外负面条款。</p>'}<small>点名称查看效果 · 首领阶段推进会追加条款</small></div>`;
}
function enemies() {
  const skill = game.enemySkill || game.modifier;
  const skillText = typeof skill === 'string' ? skill : skill?.description || skill?.name;
  return `<div class="enemy-formation" aria-label="五列敌方阵型">${Array.from({ length: 5 }, (_, col) => {
    const enemy = game.enemies.find(e => e.col === col && e.hp > 0);
    const hits = lastBoard ? game.lastSpin.hits.filter(hit => hit.targetCol === col) : [];
    const hitDamage = hits.reduce((sum, hit) => sum + hit.amount, 0);
    return `<div class="enemy-slot ${hits.length ? 'enemy-hit' : ''} ${enemy?.boss ? 'boss' : ''} ${enemy ? '' : 'empty'}"><span class="lane-label">${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][col]}${enemy?.boss ? ' · BOSS' : ''}</span>${enemy ? `<img class="enemy-art" src="${assetUrl(`./public/assets/enemies/${enemyArt(enemy)}.svg`)}" alt="${esc(enemy.name)}"/><span class="enemy-name">${esc(enemy.name)}</span><div class="enemy-health"><i style="width:${Math.max(0, enemy.hp / enemy.maxHp * 100)}%"></i></div><span class="enemy-hp">${num(enemy.hp)} <small>/ ${num(enemy.maxHp)}</small></span><span class="enemy-intent" title="敌方每回合伤害">${icon('bolt')} ${enemy.attack}</span>` : `<div class="clear-lane">${icon('star')}<span>空列</span></div>`}${hitDamage > 0 ? `<span class="enemy-damage-float">−${num(Math.round(hitDamage * 100) / 100)}</span>` : ''}</div>`;
  }).join('')}</div><div class="enemy-rule">${icon('shield')}<span>${esc(skillText || '敌方行动：转轮结算后反击，清空所有敌人即可进入下一层。')}</span><b>预计反击 ${num(game.enemyIntent?.damage)} · ${game.spinsLeft} 回合</b></div>${debuffPanel()}`;
}
function board() {
  return `<div class="reel-frame ${busy ? 'is-spinning' : ''}"><div class="frame-corner tl"></div><div class="frame-corner tr"></div><div class="frame-corner bl"></div><div class="frame-corner br"></div><div class="reel-grid" aria-label="五列四行转轮">${game.board.map((symbol, index) => {
    if (!symbol) return `<div class="reel-cell blank" style="--delay:${index % 5 * 55}ms"><span>✧</span><small>待同行</small></div>`;
    const c = char(symbol.id);
    const afflicted = (game.activeDebuffs || []).some(clause => clause.targetUid && clause.targetUid === symbol.uid);
    if (!c) return '<div class="reel-cell blank"></div>';
    const value = game.stats.spins > 0 ? game.lastSpin?.values?.[index] : c.power * [0, 1, 3, 9][symbol.stars] + symbol.growth;
    return `<button class="reel-cell rarity-${c.rarity} ${symbol.stars > 1 ? 'upgraded' : ''} ${afflicted ? 'afflicted' : ''}" data-action="character" data-id="${esc(symbol.uid)}" style="--char-color:${c.color || '#b1a2e7'};--delay:${index % 5 * 55}ms" aria-label="${esc(c.name)} ${symbol.stars}星 ${attackNames[c.attack]} ${game.stats.spins ? '上次结算威力' : '基础威力'}${num(value)}"><span class="cell-stars">${stars(symbol.stars)}</span>${afflicted ? '<span class="cell-affliction">污染</span>' : ''}<img src="${portrait(c)}" alt="" draggable="false"/><span class="cell-bottom"><b>${esc(c.name)}</b><span>${attackNames[c.attack]}</span></span><span class="cell-power">${num(value ?? c.power * [0, 1, 3, 9][symbol.stars || 1])}</span>${lastBoard && value > 0 ? `<span class="damage-float">+${num(value)}</span>` : ''}</button>`;
  }).join('')}</div></div>`;
}
function effectStatusPanel() {
  const growth = game.roster.reduce((sum, unit) => sum + (unit.growth || 0), 0);
  return `<section class="effect-status" aria-label="效果状态"><div><b>效果状态</b><button data-action="effects">查看明细 ${icon('chevron')}</button></div><p><span class="effect-chip duration-run">本局永久</span> 编队成长 +${num(growth)} <span class="effect-chip duration-whileOwned">持有来源</span> ${game.items.length} 奇物 · ${game.essences.filter(e => e.triggered).length} 已解锁精华</p>${game.overclockReady ? '<p><span class="effect-chip duration-nextSpin">待生效</span> 超频 ×1.2 · 下次转动后消耗</p>' : ''}<small>${esc(snapshotTitle(game))} · 格子威力是上次结果，临时加成下次重算</small></section>`;
}
function effectsDialog() {
  const growth = game.roster.filter(unit => unit.growth > 0);
  const sources = [...game.items.map(id => ({ kind: 'item', value: item(id) })), ...game.essences.filter(e => e.triggered).map(e => ({ kind: 'essence', value: essence(e.id) }))].filter(entry => entry.value);
  const events = game.lastSpin.effects || [];
  return modal('效果明细', `<div class="effect-ledger"><section><h3><span class="effect-chip duration-run">本局永久</span> 实例成长</h3>${growth.length ? `<ul>${growth.map(unit => `<li><b>${esc(char(unit.id)?.name)} ${stars(unit.stars)}</b><span>+${num(unit.growth)}</span></li>`).join('')}</ul>` : '<p>尚未积累永久成长。</p>'}<small>成长随该实例保留，合成时相加；移除该实例后失去。</small></section><section><h3><span class="effect-chip duration-whileOwned">持有期间</span> 奇物与已解锁精华</h3>${sources.length ? `<div class="effect-source-list">${sources.map(({kind,value}) => `<button data-action="${kind}" data-id="${esc(value.id)}">${curioArt(value, kind === 'essence')}<span>${esc(value.name)}${effectBadgeMarkup(value)}</span>${icon('chevron')}</button>`).join('')}</div>` : '<p>尚无持有来源。</p>'}<small>有些来源取得时只结算一次；点名称查看各条被动的生效条件。</small></section><section><h3><span class="effect-chip duration-nextSpin">待生效</span> 下一次转动</h3><p>${game.overclockReady ? '超频补给：角色威力 ×1.2，下一次转动结算后消耗。' : '当前没有等待消耗的超频。'}</p></section><section><h3><span class="effect-chip duration-encounter">本关负面</span> 敌方条款</h3>${debuffPanel()}</section><section class="historical-effects"><h3>${esc(snapshotTitle(game))}</h3><p>以下是历史结算记录（含紧随其后的入关事件，以各条时点为准）。标为“本次转动”的效果随该次结算结束，下次重新检查条件。</p>${events.length ? `<ul class="effect-event-list">${events.map(effectEventMarkup).join('')}</ul>` : '<p>尚无可展开的效果记录。旧版存档会在下次转动后生成新记录。</p>'}</section></div>`, '', {eyebrow:'EFFECT TIMELINE',subtitle:'持续中的来源、待用效果与上次结算分别查看。'});
}
function mainPanel() {
  const total = game.lastSpin?.damage || 0;
  return `<section class="main-panel"><div class="mission-heading"><div><span class="eyebrow"><i class="live-dot"></i>SIMULATED UNIVERSE</span><h1>让命运，再转一圈<span>。</span></h1><p>招募同行者 · 收集奇物 · 构筑你的开拓之路</p></div><button class="button ghost difficulty-change" data-action="new">难度 D${game.difficulty} · 新开局</button></div><section class="arena panel"><div class="arena-heading"><span>${icon('bolt')} 遭遇战<b>${String(game.floor).padStart(2, '0')}</b></span><span class="tiny-label">ROUND ${String(game.round).padStart(2, '0')} <i>·</i> 5 × 4 REELS</span><span class="mobile-combat-hud" role="group" aria-label="生命 ${num(game.hp)}，护盾 ${num(game.shield)}"><span data-inspect="mechanic" data-key="hp" data-inspect-click="true" tabindex="0">${icon('heart')}${num(game.hp)}</span><span data-inspect="mechanic" data-key="shield" data-inspect-click="true" tabindex="0">${icon('shield')}${num(game.shield)}</span></span></div>${enemies()}<div class="lane-connectors">${Array.from({ length: 5 }, () => '<span></span>').join('')}</div>${board()}<div class="board-caption"><span>${icon('users')}从 ${game.roster.length} 位编队成员中随机上场</span><button data-action="help">攻击规则 ${icon('chevron')}</button></div>${effectStatusPanel()}<div class="spin-controls"><div class="last-total"><span>上次总伤害</span><strong>${num(total)}<small> DMG</small></strong></div><button class="spin-button" data-action="spin" ${busy || game.phase !== 'ready' ? 'disabled' : ''}>${icon('rotate')}<span>${busy ? '命运转动中…' : game.phase === 'ready' ? '启动转轮' : isReward() ? '选择本轮奖励' : '旅程已结算'}<small>${busy ? '同行者正在行动' : 'SPIN THE REELS'}</small></span>${icon('arrow')}</button></div><div class="arena-footnote"><span class="keyboard-key">SPACE</span> 也可以按空格转动 <span class="save-status">${saveAvailable ? '✓ 自动保存' : '当前页面保存'}</span></div></section><div class="below-arena"><span>${icon('star')}每一次转动，都是一种可能。</span><button data-action="help">第一次开拓？阅读玩法手册 ${icon('arrow')}</button></div></section>`;
}
function supplyPanel() {
  const access = game.resourceAccess || {};
  const note = access.credits === false ? '本局信用点消费已禁用' : (game.supplyPurchases || 0) >= 2 ? '本关购买已用完 · 新关重置' : '准备转动时购买 · 超频不会叠加';
  return `<section class="panel supplies-panel"><div class="panel-heading"><h2>信用点补给</h2><span class="count-badge">${game.supplyPurchases || 0} / 2 本关</span></div><p class="panel-intro muted">${note}</p><div class="supply-options">${Object.entries(SUPPLIES).map(([kind, supply]) => {
    const benefit = kind === 'repair' ? game.hp < game.maxHp : kind === 'barrier' ? game.shield < game.maxHp * 2 : !game.overclockReady;
    const usable = game.phase === 'ready' && !busy && access.credits !== false && (kind === 'overclock' || access.defense !== false) && (game.supplyPurchases || 0) < 2 && game.coins >= supply.cost && benefit;
    return `<div class="supply-option"><button type="button" class="supply-description" data-inspect="mechanic" data-inspect-click="true" data-key="${supply.key}" aria-label="查看${supply.name}说明"><b>${supply.name} ?</b><small>${supply.description}</small></button><button class="button ghost supply-buy" data-action="supply" data-kind="${kind}" aria-label="花 ${supply.cost} 信用点购买${supply.name}" ${usable ? '' : 'disabled'}>${supply.cost} 信用点</button></div>`;
  }).join('')}</div>${game.overclockReady ? '<p class="overclock-status">✓ 超频就绪 · 下轮威力 ×1.2</p>' : ''}</section>`;
}
function rightPanel() {
  return `<aside class="right-panel">${aiPanel()}${supplyPanel()}<section class="panel curios-panel"><div class="panel-heading"><h2>奇物收藏</h2><span class="count-badge">${game.items.length}</span></div><p class="muted panel-intro">一些小小的东西，改变整个宇宙。</p>${game.items.length ? `<div class="curio-list">${game.items.map(id => { const c = item(id); return c ? `<button class="curio" data-action="item" data-id="${esc(id)}">${curioArt(c)}<span><b>${esc(c.name)}</b>${effectBadgeMarkup(c)}<small>${esc(c.description)}</small></span>${icon('chevron')}</button>` : ''; }).join('')}</div>` : `<div class="empty-collection"><div class="curio-orbit">${icon('cube')}<i>✧</i></div><b>等待一次奇遇</b><p>每完成两层后<br/>选择一件奇物，强化你的构筑</p></div>`}</section><section class="panel essence-panel"><div class="panel-heading"><h2>奇物精华</h2><span class="tiny-label">ESSENCE</span></div>${game.essences.length ? game.essences.map(e => { const c = essence(e.id); return c ? `<button class="essence ${e.triggered ? 'triggered' : ''}" data-action="essence" data-id="${esc(e.id)}">${curioArt(c, true)}<div><b>${esc(c.name)}</b>${effectBadgeMarkup(c)}<p>${e.triggered ? '已解锁 · 按各条效果规则生效' : esc(c.description)}</p><small>${e.triggered ? 'ACTIVATED' : `蓄能 ${e.progress || 0}${c.target ? ` / ${c.target}` : ''}`}</small></div></button>` : ''; }).join('') : `<div class="essence-empty"><span>✦</span><p>深入宇宙，发现精华<br/><small>达成条件后触发强力效果</small></p></div>`}</section><section class="panel log-panel"><div class="panel-heading"><h2>战斗记录</h2><span class="record-dot"></span></div><div class="combat-log" aria-live="polite">${(game.history?.length ? game.history : game.lastSpin?.events?.length ? game.lastSpin.events : ['列车已抵达。同行者集结完毕。', '启动转轮，开始你的第一场开拓。']).slice(-6).reverse().map((event, i) => `<p class="${i === 0 ? 'latest' : ''}"><span>${i === 0 ? '◆' : '·'}</span>${esc(event)}</p>`).join('')}</div></section><div class="seed-label">UNIVERSE SEED <b>${esc(game.seed)}</b></div></aside>`;
}
function modal(title, body, footer = '', options = {}) {
  const blocking = options.reward || options.blocking || options.close === false;
  const panel = `<section class="modal ${blocking ? '' : 'utility-panel'} ${options.wide ? 'wide' : ''} ${options.reward ? 'reward-modal' : ''}" role="dialog" ${blocking ? 'aria-modal="true"' : 'aria-modal="false"'} aria-labelledby="dialog-title">${options.close === false ? '' : `<button class="icon-button modal-close" data-action="close" aria-label="关闭面板">${icon('cross')}</button>`}<div class="modal-heading"><span class="eyebrow">${esc(options.eyebrow || 'ASTRAL ARCHIVE')}</span><h2 id="dialog-title">${title}</h2>${options.subtitle ? `<p>${options.subtitle}</p>` : ''}</div>${body}${footer ? `<div class="modal-footer">${footer}</div>` : ''}</section>`;
  return blocking ? `<div class="modal-backdrop">${panel}</div>` : panel;
}
function characterCard(c, symbol = null, button = '') {
  const targeted = (game.activeDebuffs || []).filter(clause => clause.targetUid && clause.targetUid === symbol?.uid);
  return `<article class="character-card rarity-${c.rarity} ${targeted.length ? 'afflicted-card' : ''}"><div class="portrait-stage" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}" tabindex="0" style="--char-color:${c.color || '#b6a0e6'}"><span class="rarity-label">${rarityNames[c.rarity]}</span><img src="${portrait(c)}" alt="${esc(c.name)}"/><span class="portrait-stars">${symbol ? stars(symbol.stars) : '★'}</span></div><div class="card-copy"><span class="eyebrow">${esc(c.enName || c.path)}</span><h3>${esc(c.name)}</h3><div class="character-tags"><span>${esc(c.element)}</span><span>${esc(c.path)}</span><span>${attackNames[c.attack]} · 1星基础 ${c.power}</span></div>${effectBadgeMarkup(c)}<button type="button" class="skill-description" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}">${esc(c.description)}<small>生效与叠加规则 ?</small></button>${targeted.length ? `<p class="affliction-label">⚠ ${targeted.map(clause => esc(clause.name)).join('、')} · 本实例</p>` : ''}${symbol?.growth ? `<p class="growth-label">本局永久成长 +${num(symbol.growth)}</p>` : ''}${button}</div></article>`;
}
function rewardDialog() {
  const recruit = game.phase === 'recruit';
  const collection = recruit ? CHARACTERS : game.phase === 'item' ? ITEMS : ESSENCES;
  const titles = { recruit: '下一位，同行者。', item: '宇宙赠予的小小奇迹。', essence: '把奇迹，凝成精华。' };
  const options = game.choices.map((id, index) => {
    const c = collection.find(c => c.id === id);
    if (!c) return '';
    const pick = `<div class="ai-recommendation" data-ai-index="${index}" data-inspect="mechanic" data-key="aiProbability" tabindex="0">${recommendationMarkup(index)}</div><button class="button primary full" data-action="choose" data-index="${index}">${recruit ? '邀请同行' : '收下奇物'} ${icon('arrow')}</button>`;
    return recruit ? characterCard(c, null, pick) : `<article class="item-card rarity-${c.rarity || 'rare'}"><div class="large-curio-icon" data-inspect="${game.phase === 'essence' ? 'essence' : 'item'}" data-inspect-click="true" data-id="${esc(c.id)}" tabindex="0">${curioArt(c, game.phase === 'essence')}</div><span class="eyebrow">${game.phase === 'essence' ? 'ESSENCE' : rarityNames[c.rarity]}</span><h3>${esc(c.name)}</h3>${effectBadgeMarkup(c)}<button type="button" class="skill-description" data-inspect="${game.phase === 'essence' ? 'essence' : 'item'}" data-inspect-click="true" data-id="${esc(c.id)}">${esc(c.description)}<small>生效与叠加规则 ?</small></button>${pick}</article>`;
  }).join('');
  const skipAdvice = `<div class="ai-recommendation ai-skip-recommendation" data-ai-index="${game.choices.length}" data-inspect="mechanic" data-key="aiProbability" data-inspect-click="true" tabindex="0" role="button" aria-label="查看${recruit ? '暂不招募' : '跳过奖励'}的 AI 推荐说明">${recommendationMarkup(game.choices.length)}</div>`;
  const rerollAllowed = game.resourceAccess?.rerolls !== false && (game.rerolls > 0 || (game.resourceAccess?.credits !== false && game.coins >= 8));
  return modal(titles[game.phase], `${rewardMechanics()}${game.activeDebuffs?.length ? debuffPanel() : ''}<div class="reward-cards">${options}</div>${skipAdvice}<p class="ai-choice-caption">${game.choices.length} 张奖励与跳过的推荐率合计 100% · 自动试玩按同一概率抽样</p>`, `<button class="button ghost reward-reroll-button" data-action="reroll" ${rerollAllowed ? '' : 'disabled'}>${icon('rotate')}重新发现 <span class="count-badge">${game.resourceAccess?.rerolls === false ? '已禁用' : game.rerolls > 0 ? `${game.rerolls} 次免费` : game.resourceAccess?.credits === false ? '付费禁用' : '8 信用点'}</span></button><button class="button ghost ai-autoplay-toggle" data-action="aiAutoplay">${aiAutoplay ? '停止 AI' : 'AI 代打'}</button><button class="button ghost reward-skip-button" data-action="skip">${recruit ? '暂不招募' : '跳过奖励'} ${icon('arrow')}</button>`, { close: false, wide: true, reward: true, eyebrow: `DISCOVERY · ${recruit ? '同行者招募' : game.phase === 'item' ? '奇物奖励' : '精华奖励'}`, subtitle: recruit ? '选择一位加入编队。同角色同星级凑齐 3 位后，自动升星。' : '选择一件，让你的构筑走向新的可能。' });
}
function rewardMechanics(){const entries=[['difficulty','难度',`D${game.difficulty}`],['floor','关卡',`第 ${String(game.floor).padStart(2,'0')} 关`],['hp','生命',num(game.hp)],['credits','信用点',num(game.coins)],['shield','护盾',num(game.shield)],['rerolls','重掷',num(game.rerolls)],['removals','移除',num(game.removals)],['synergy','羁绊',`${getSynergies(game).filter(x=>x.active).length} 激活`],['round','剩余回合',`${game.spinsLeft} 次`]];return `<div class="reward-mechanics" role="group" aria-label="当前状态与机制说明">${entries.map(([key,label,value])=>`<button type="button" class="reward-mechanic" data-inspect="mechanic" data-inspect-click="true" data-key="${key}" aria-label="查看${esc(mechanicExplanation(key,game)?.title||label)}说明"><span>${label}<i aria-hidden="true">?</i></span><b>${value}</b></button>`).join('')}</div>`;}
function helpDialog() {
  return modal('五列战斗，由你构筑。', `<div class="help-grid"><article><span class="step-number">01</span><h3>转动与招募</h3><p>编队随机填入 5 × 4 转轮，每轮最多抽取 20 位。结算后选一位同行者或跳过，也可消耗重掷刷新候选。</p></article><article><span class="step-number">02</span><h3>五列攻击</h3><p>角色优先攻击对应列；空列选最近敌人，同距离优先左侧。首领随生命降低或回合推进追加条款。</p><div class="attack-guide"><span><b>单体</b>主目标 ×3</span><span><b>扩散</b>主目标 ×2 · 相邻 ×1</span><span><b>群体</b>全部敌人 ×1</span></div></article><article><span class="step-number">03</span><h3>升星与羁绊</h3><p>同角色同星级 3 合 1，三星封顶。羁绊看永久编队的不同身份，重复副本不凑人数。激活后还需看登场、击破、承伤等具体触发条件。</p></article><article><span class="step-number">04</span><h3>资源与难度</h3><p>D1–D20 自由选择，默认 D10；关卡是本局进度。信用点可买医疗、护盾或下次超频，每关最多两次。生命与护盾会被消耗，资源获得不是永久属性加成。</p></article></div><section class="duration-guide"><h3>先看持续标签，再看触发规则</h3><p><span class="effect-chip duration-spin">本次转动</span> 艾丝妲的邻格增益、布洛妮娅的支援：本次结算使用，下次重新计算。</p><p><span class="effect-chip duration-run">本局永久</span> 丹恒、克拉拉的自身成长、阮·梅给予队友的成长：写入对应实例的成长值，跨关与合成保留，移除实例后失去。</p><p><span class="effect-chip duration-whileOwned">持有期间</span> 奇物被动：每次按条件生效；取得时的一次性奖励不会反复领取。</p><p><span class="effect-chip duration-resource">资源存量</span> 护盾、信用点等：进账后保留，消耗后减少。护盾仅在对应敌方条款下衰减。</p><p><span class="effect-chip duration-encounter">本关</span> 敌方负面条款：在当前关卡按条件作用，不会永久减掉角色成长。</p><p><span class="effect-chip duration-nextSpin">下次转动一次</span> 超频补给：等待下一次转动，用后消耗。</p></section><div class="help-note">格子右下是上次结算威力；辅助的威力数值不等于治疗量。点角色看威力构成，点“效果状态 → 查看明细”区分持续来源和历史记录。悬停、点击或手机长按可查看小说明，点击其他位置即可关闭。一局 12 关，通关可进入无尽；离线与存档在设置中。</div>`, '', {wide:true,eyebrow:'TRAILBLAZER HANDBOOK'});
}
function catalogDialog() {
  return modal('所有相遇，都有意义。', `<div class="catalog-tabs">${[['characters', '同行者', CHARACTERS.length], ['items', '奇物', ITEMS.length], ['essences', '精华', ESSENCES.length]].map(([id, label, count]) => `<button class="button ${catalogTab === id ? 'primary' : 'ghost'}" data-action="catalogTab" data-tab="${id}">${label} <small>${count}</small></button>`).join('')}</div><label class="catalog-search">搜索当前分类<input type="search" data-catalog-search value="${esc(catalogQuery)}" placeholder="名称、命途、属性或效果" autocomplete="off"/></label><p class="catalog-result-count" aria-live="polite">${catalogEntries().length} 条结果 · 点技能看生效与叠加</p><div class="catalog-grid ${catalogTab !== 'characters' ? 'item-grid' : ''}" data-catalog-results>${catalogCards()}</div>`, '', { wide: true, eyebrow: 'ASTRAL COMPENDIUM', subtitle: '64 位同行者 · 64 件奇物 · 32 种精华。' });
}
function catalogEntries() {
  const entries = {characters:CHARACTERS,items:ITEMS,essences:ESSENCES}[catalogTab] || [];
  const query = catalogQuery.trim().toLocaleLowerCase();
  return query ? entries.filter(c => [c.name,c.enName,c.path,c.element,c.faction,c.description,...effectRows(c).map(row=>`${row.label} ${row.duration.label} ${row.target}`)].join(' ').toLocaleLowerCase().includes(query)) : entries;
}
function catalogCards() {
  const entries = catalogEntries();
  if (!entries.length) return '<p class="catalog-no-results">没有匹配的条目，可换个关键词。</p>';
  return catalogTab === 'characters' ? entries.map(c => characterCard(c)).join('') : entries.map(c => `<button class="catalog-item" data-action="${catalogTab === 'essences' ? 'essence' : 'item'}" data-id="${esc(c.id)}" data-inspect="${catalogTab === 'essences' ? 'essence' : 'item'}" data-inspect-click="true">${curioArt(c,catalogTab === 'essences')}<span><h3>${esc(c.name)}</h3>${effectBadgeMarkup(c)}<p>${esc(c.description)}</p></span></button>`).join('');
}
function rosterDialog() {
  return modal('同行者，一个都不能少。', `<div class="roster-meta"><span>${game.roster.length} 位角色 · 上场最多 20 位</span><span>${game.resourceAccess?.removals === false ? '移除已禁用' : `可用移除 ${game.removals} 次`}</span></div><div class="roster-grid">${game.roster.map(symbol => { const c = char(symbol.id); return c ? characterCard(c, symbol, `<button class="button ghost full" data-action="removeAsk" data-id="${esc(symbol.uid)}" ${game.resourceAccess?.removals === false || game.removals <= 0 || game.phase !== 'ready' || busy ? 'disabled' : ''}>${icon('trash')}移出编队</button>`) : ''; }).join('')}</div>`, '', { wide: true, eyebrow: 'MY CREW', subtitle: '移除会消耗 1 次机会，角色会永久离开本次旅程。奖励选择期间暂时无法手动移除。' });
}
function newDialog(){return modal('下一段旅程，从这里开始。',`<form id="new-run-form"><p class="new-combat-note">五列战斗 · 一局 12 关 · 难度随时可选，无需解锁</p><label class="input-label">本次难度 <small>D10 为默认；难度不是当前关卡</small></label><div class="difficulty-grid" role="group" aria-label="选择难度 1 至 20">${Array.from({length:20},(_,i)=>`<label class="difficulty-option"><input type="radio" name="difficulty" value="${i+1}" ${pendingDifficulty===i+1?'checked':''}/><span>D${i+1}</span></label>`).join('')}</div><label class="input-label" for="seed-input">宇宙种子 <small>相同规则与操作可以复现旅程</small></label><input class="seed-input" id="seed-input" name="seed" maxlength="64" value="${esc(freshSeed())}" autocomplete="off"/><p class="muted">开启后会替换当前旅程的自动存档。</p><button class="button primary full" type="submit">开启五列战斗 ${icon('arrow')}</button></form>`,'',{eyebrow:'A NEW JOURNEY',blocking:removedModeNotice||['victory','defeat'].includes(game.phase),close:removedModeNotice?false:true});}
function offlineLabel() {
  const state = offline.state;
  if (IS_PORTABLE) return '单文件版 · 可直接离线玩';
  if (state.ready) return state.online ? '离线已准备好' : '正在离线游玩';
  return { preparing: '正在准备离线游戏…', address: '在线试玩', unsupported: '当前浏览器仅支持在线玩', error: '离线准备未完成' }[state.phase];
}
function offlineMarkup() {
  const state = offline.state;
  if (IS_PORTABLE) return `<div class="offline-heading"><h3>单文件离线版</h3><span class="offline-state ready" role="status">全部资源已内置</span></div><p>这个文件包含完整游戏、图片和 AI，不需要账号、网络或电脑开机。安卓文件管理器中选择「用浏览器打开」，不要使用文档预览。</p><p>${saveAvailable ? '当前浏览器可以自动保存进度。移动或更换文件、浏览器后，原进度可能无法读取。' : '当前浏览器不允许自动保存；关闭文件前，请导出存档。'}</p><p>更新游戏时传入新版 HTML。导入存档会替换当前旅程，建议先导出一份备份。</p><div class="offline-actions"><button class="button ghost" data-action="saveExport">导出存档</button><button class="button ghost" data-action="saveImport" ${experiment.running ? 'disabled' : ''}>导入存档</button><input data-save-file type="file" accept=".json,application/json,text/plain" hidden /></div>`;
  const explanation = state.phase === 'address' ? '请从正式安装网址打开，才能保存离线游戏。' : state.phase === 'unsupported' ? '请换用新版 Chrome 或 Safari，添加游戏到主屏幕。' : state.phase === 'error' ? '请联网后重试，并确认浏览器有可用存储空间。' : state.ready ? '游戏与全部素材已保存到这台设备，断网也可以继续玩。' : '首次加载请保持联网，等资源保存完成后再断网。';
  return `<div class="offline-heading"><h3>离线与安装</h3><span class="offline-state ${state.ready ? 'ready' : ''}" role="status">${offlineLabel()}</span></div><p>${explanation}</p><p>手机：浏览器菜单 → 添加到主屏幕。<br/>iPad：Safari 分享 → 添加到主屏幕。</p><p>添加后，先联网从主屏幕图标打开一次，等离线准备完成。存档各自保存在设备上；清除网站数据会删除存档和离线游戏。</p><div class="offline-actions">${state.installed ? '<span class="offline-installed">✓ 已从主屏幕打开</span>' : state.installable ? '<button class="button primary" data-action="offlineInstall">添加到主屏幕</button>' : ''}${!['address','unsupported'].includes(state.phase) ? `<button class="button ghost" data-action="offlineCheck" ${!state.online || state.checking || state.updating ? 'disabled' : ''}>${state.checking ? '正在检查…' : state.phase === 'error' ? '重新准备离线游戏' : '检查更新'}</button>` : ''}${state.updateAvailable ? `<button class="button primary" data-action="offlineUpdate" ${!state.online || state.updating || experiment.running ? 'disabled' : ''}>${state.updating ? '正在更新…' : '保存进度并更新'}</button>` : ''}</div>${state.updateAvailable ? `<p class="offline-notice">新版已下载，${experiment.running ? '等本次实验结束后再更新。' : '选择更新时才会重新打开游戏。'}</p>` : ''}${state.updateError ? '<p class="offline-notice">这次更新未完成，可联网后再试；已保存的离线游戏仍可使用。</p>' : ''}`;
}
function refreshOfflineView() {
  document.querySelectorAll('[data-offline-indicator]').forEach(element => { element.textContent = offlineLabel(); element.setAttribute('aria-label', `${offlineLabel()}，查看离线与安装设置`); element.classList.toggle('ready', offline.state.ready); });
  const panel = document.querySelector('[data-offline-panel]');
  if (panel) {
    const focusedAction = panel.contains(document.activeElement) ? document.activeElement.dataset.action : null;
    panel.innerHTML = offlineMarkup();
    if (focusedAction) panel.querySelector(`[data-action="${focusedAction}"]`)?.focus({ preventScroll: true });
  }
}
function settingsDialog() {
  return modal('按自己的节奏开拓。', `<div class="settings-list"><label><span><b>轻量音效</b><small>转动与招募时播放提示音</small></span><input type="checkbox" data-setting="sound" ${settings.sound ? 'checked' : ''}/></label><label><span><b>转轮动画</b><small>系统减少动态效果时自动关闭</small></span><input type="checkbox" data-setting="animations" ${settings.animations ? 'checked' : ''}/></label></div><section class="offline-panel" data-offline-panel>${offlineMarkup()}</section><div class="run-stats"><div><strong>${num(stats.runs)}</strong><span>开拓次数</span></div><div><strong>${num(stats.wins)}</strong><span>通关次数</span></div><div><strong>${num(stats.bestFloor)}</strong><span>最远关卡</span></div></div><div class="help-note">自动存档在当前浏览器中。宇宙种子：${esc(game.seed)}。所有素材均随游戏本地加载，无广告，无内购。</div>`, `<button class="button primary" data-action="close">完成</button>`, { eyebrow: 'PREFERENCES' });
}
function endDialog() {
  const win = game.phase === 'victory';
  return modal(win ? '群星，见证了你的胜利。' : '旅程暂停，开拓永不止步。', `<div class="end-emblem ${win ? 'win' : ''}">${icon(win ? 'trophy' : 'cube')}</div><p class="end-copy">${win ? '你与同行者穿越了 12 关宇宙。下一站，去更远的地方。' : '敌人的攻势或关卡期限终结了旅程。调整难度和构筑，再次出发。'}</p>${!win ? `<p class="help-note">${esc(game.history.at(-1))}</p>` : ''}<div class="run-stats"><div><strong>${game.floor}</strong><span>抵达关卡</span></div><div><strong>${game.stats.spins}</strong><span>转轮次数</span></div><div><strong>${game.roster.length}</strong><span>编队人数</span></div></div>`, `${win ? `<button class="button ghost" data-action="endless">继续无尽开拓 ${icon('arrow')}</button>` : ''}<button class="button primary" data-action="new">再次出发 ${icon('rotate')}</button>`, { close: false, eyebrow: win ? 'JOURNEY COMPLETE' : 'JOURNEY ENDED' });
}
function renderDialog() {
  if (dialog === 'help') return helpDialog();
  if (dialog === 'catalog') return catalogDialog();
  if (dialog === 'roster') return rosterDialog();
  if (dialog === 'effects') return effectsDialog();
  if (dialog === 'new') return newDialog();
  if (dialog === 'settings') return settingsDialog();
  if (dialog === 'aiLab') return aiLabDialog();
  if (dialog === 'synergies') return modal('羁绊一览', `<div class="all-synergy-grid">${getSynergies(game).map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon('star')}</span><span class="synergy-name"><b>${esc(s.name)}</b>${s.style ? `<em class="synergy-style">${esc(s.style)}</em>` : ''}<small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.join('/')}</small></span></button>`).join('')}</div>`, '', { eyebrow: 'RESONANCE ARCHIVE', subtitle: '点击查看说明；点击页面其他区域即可关闭。' });
  if (!busy && isReward()) return rewardDialog();
  if (!busy && ['victory', 'defeat'].includes(game.phase)) return endDialog();
  return '';
}
function render() {
  if (['victory', 'defeat'].includes(game.phase)) { aiAutoplay = false; clearTimeout(aiAutoplayTimer); }
  const focusAction = document.activeElement?.dataset?.action;
  const hadDialog = !!document.querySelector('.modal-backdrop');
  inspector.close();
  app.innerHTML = `${header()}<main class="game-layout">${leftPanel()}${mainPanel()}${rightPanel()}</main><footer class="site-footer"><span>星穹转轮 <i>✦</i> 一场与命运的游戏</span><span>同人实验项目 · 角色素材 © HoYoverse <a href="https://github.com/jjhe2020/starrail-landlord" target="_blank" rel="noreferrer">GITHUB ${icon('arrow')}</a></span></footer>${renderDialog()}`;
  const backdrop = document.querySelector('.modal-backdrop');
  const offlineEntry = document.createElement('button');
  offlineEntry.className = 'offline-indicator'; offlineEntry.dataset.action = 'settings'; offlineEntry.dataset.offlineIndicator = '';
  offlineEntry.setAttribute('aria-label', `${offlineLabel()}，查看离线与安装设置`);
  document.querySelector('.arena-footnote').append(offlineEntry);
  refreshOfflineView();
  document.body.style.overflow = backdrop ? 'hidden' : '';
  document.querySelector('.game-layout').inert = !!backdrop;
  document.querySelector('.site-header').inert = !!backdrop;
  document.querySelector('.site-footer').inert = !!backdrop;
  decorateInspectors();
  if (backdrop) (backdrop.querySelector(`[data-action="${focusAction || ''}"]`) || backdrop.querySelector('[data-action="choose"]') || backdrop.querySelector('button, input'))?.focus({ preventScroll: true });
  else if (focusAction && !hadDialog) document.querySelector(`[data-action="${focusAction}"]`)?.focus({ preventScroll: true });
  if (['victory', 'defeat'].includes(game.phase)) { aiAutoplay = false; clearTimeout(aiAutoplayTimer); }
  requestRecommendations();
}
async function doSpin() {
  if (busy || game.phase !== 'ready') return;
  closeUtilityOnly();
  busy = true; lastBoard = null; playTone(); render();
  const animate = settings.animations && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  await new Promise(resolve => setTimeout(resolve, animate ? 460 : 0));
  lastBoard = game.board;
  adopt(spin(game)); render();
  await new Promise(resolve => setTimeout(resolve, animate ? 750 : 0));
  lastBoard = null; busy = false; render();
}

document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled || (!app.contains(control) && !control.closest('.inspect-popover'))) return;
  const action = control.dataset.action;
  if (control.dataset.inspectClick === 'true' && ['character','synergy','item','essence'].includes(action)) return;
  if (action === 'aiAutoplay') { toggleAutoplay(); return; }
  if (action === 'aiCancel') { experimentId++; experimentWorker?.terminate(); experimentWorker = null; experiment.running = false; experiment.error = '本次实验已取消，当前旅程未改变。'; render(); return; }
  if (['aiBenchmark','aiTrain','aiAblation'].includes(action)) { startExperiment(action==='aiTrain'?'train':action==='aiAblation'?'ablation':'benchmark'); return; }
  if (action === 'spin') { try { await doSpin(); } catch (error) { busy = false; render(); showToast(`本轮未能结算：${error.message}`); } return; }
  if (busy) return;
  if (IS_PORTABLE && action === 'saveExport') {
    try {
      const url = URL.createObjectURL(new Blob([exportSave({ game, settings, stats, aiProfile })], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = '星穹转轮-存档.json'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      showToast('已发起存档导出，请确认浏览器保存了文件。');
    } catch (error) { showToast(`存档未能导出：${error.message}`); }
    return;
  }
  if (IS_PORTABLE && action === 'saveImport') { if (!experiment.running) document.querySelector('[data-save-file]')?.click(); return; }
  if (action === 'offlineInstall') { await offline.install(); return; }
  if (action === 'offlineCheck') { await offline.check(); return; }
  if (action === 'offlineUpdate') {
    if (experiment.running) return;
    await offline.update(() => { if (!persist()) { showToast('进度未能保存，请保留当前页面，稍后再更新。'); return false; } aiAutoplay = false; return true; }); return;
  }
  if (action === 'choose') { adopt(chooseReward(game, Number(control.dataset.index))); playTone('recruit'); }
  else if (action === 'skip') adopt(skipReward(game));
  else if (action === 'reroll') { adopt(rerollRewards(game)); playTone(); }
  else if (action === 'new') { aiAutoplay = false; pendingDifficulty = game.difficulty || 10; dialog = 'new'; }
  else if (action === 'supply') adopt(purchaseSupply(game, control.dataset.kind));
  else if (action === 'catalogTab') catalogTab = control.dataset.tab;
  else if (action === 'close' || action === 'play') dialog = null;
  else if (action === 'sound') { settings.sound = !settings.sound; persist(); playTone('recruit'); }
  else if (action === 'endless') { adopt(continueEndless(game)); dialog = null; }
  else if (action === 'removeAsk') {
    const instance = game.roster.find(s => s.uid === control.dataset.id);
    inspector.open(control, { title: `移除 ${char(instance.id).name}？`, bodyHtml: `<p>消耗 1 次移除机会，永久移出当前编队。</p><button class="button primary full" data-action="removeConfirm" data-id="${esc(instance.uid)}">确认移除</button>` }); return;
  }
  else if (action === 'removeConfirm') adopt(removeSymbol(game, control.dataset.id));
  else if (['roster','help','catalog','settings','synergies','aiLab','effects'].includes(action)) dialog = dialog === action ? null : action;
  render();
});
app.addEventListener('submit', event => {
  if (event.target.id !== 'new-run-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  game = newGame({ difficulty: Number(form.get('difficulty')) || 10, seed: String(form.get('seed') || '').trim().slice(0,64) || freshSeed() });
  liveAiRandom = createPolicyRandom(`${game.seed}:policy`); aiAutoplay = false; recommendationKey = ''; requestedKey = '';
  stats.runs++; removedModeNotice = false; dialog = null; busy = false; lastBoard = null; persist(); render(); showToast('新的宇宙，新的可能。');
});
app.addEventListener('change', event => {
  if (event.target.id === 'lab-difficulty') labDifficulty = Number(event.target.value);
  if (event.target.dataset.resource) labResourceAccess[event.target.dataset.resource] = event.target.checked;
  if (event.target.id === 'lab-runs') labRuns = Number(event.target.value);
  if (event.target.dataset.setting) { settings[event.target.dataset.setting] = event.target.checked; persist(); }
});
app.addEventListener('input', event => {
  if (!event.target.matches('[data-catalog-search]')) return;
  catalogQuery = event.target.value;
  inspector.close();
  document.querySelector('[data-catalog-results]').innerHTML = catalogCards();
  document.querySelector('.catalog-result-count').textContent = `${catalogEntries().length} 条结果 · 点技能看生效与叠加`;
  decorateInspectors();
});
app.addEventListener('change', async event => {
  if (!IS_PORTABLE || !event.target.matches('[data-save-file]')) return;
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_SAVE_BYTES) throw new Error('存档文件超过 2 MB，无法导入。');
    const importedText = await file.text();
    let decoded; try { decoded = JSON.parse(importedText); } catch {}
    if (decoded?.payload?.game?.mode === 'classic') throw Error('房租模式已移除，经营存档不能继续；请新开五列战斗。');
    const restored = importSave(importedText);
    if (busy || experiment.running) throw new Error('请等本轮转动或实验结束后再导入。');
    aiAutoplay = false; clearTimeout(aiAutoplayTimer);
    inferenceId++; inferenceWorker?.terminate(); inferenceWorker = null;
    game = restored.game; settings = restored.settings; stats = restored.stats; aiProfile = restored.aiProfile;
    liveAiRandom = createPolicyRandom(`${game.seed}:policy`); recommendation = null; recommendationKey = ''; requestedKey = ''; lastBoard = null; dialog = null;
    try { localStorage.setItem(AI_SAVE_KEY, JSON.stringify(aiProfile)); } catch {}
    const saved = persist(); render(); showToast(saved ? '已恢复存档，继续这段旅程。' : '已恢复当前旅程；关闭文件前请导出存档。');
  } catch (error) { showToast(`未导入存档：${error.message}`); }
  finally { input.value = ''; }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dialog && !inspector.isOpen()) { dialog = null; render(); return; }
  if (event.code === 'Space' && !modalOpen() && !['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement?.tagName)) { event.preventDefault(); doSpin(); }
  if (event.key === 'Tab' && document.querySelector('.modal-backdrop') && !document.activeElement?.closest('[data-inspector]')) {
    const focusable = [...document.querySelectorAll('.modal-backdrop button:not(:disabled), .modal-backdrop input')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
persist(); render(); offline.start();
if (removedModeNotice) showToast('房租模式已移除，旧经营存档无法继续。请新开五列战斗旅程。');
else if (migratedNotice) showToast('旧战斗存档已迁移为难度 D10，当前敌人与随机进度保持。');
