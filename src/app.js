import { newGame, spin, chooseReward, skipReward, rerollRewards, removeSymbol, continueEndless, getSynergies, validateSave } from './engine.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from './content.js';

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
const portrait = char => `./public/assets/characters/${char.assetId}.png`;
let settings = { sound: false, animations: true };
let stats = { runs: 0, wins: 0, bestFloor: 1 };
let game;
let saveAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  game = validateSave(saved?.game);
  if (saved?.settings) settings = { sound: !!saved.settings.sound, animations: saved.settings.animations !== false };
  if (saved?.stats) stats = { runs: Math.max(0, Number(saved.stats.runs) || 0), wins: Math.max(0, Number(saved.stats.wins) || 0), bestFloor: Math.max(1, Number(saved.stats.bestFloor) || 1) };
} catch { game = null; }
if (!game) { game = newGame({ mode: 'combat', seed: freshSeed() }); stats.runs++; }
let busy = false;
let dialog = null;
let detail = null;
let pendingMode = 'combat';
let catalogTab = 'characters';
let toastTimer;
let audioContext;
let lastBoard = null;

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ game, settings, stats })); }
  catch { if (saveAvailable) showToast('浏览器未允许保存，本次进度仅在当前页面保留。'); saveAvailable = false; }
}
function adopt(next) {
  if (game.phase !== 'victory' && next.phase === 'victory') stats.wins++;
  game = next;
  stats.bestFloor = Math.max(stats.bestFloor, game.floor);
  persist();
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
const modalOpen = () => dialog || (!busy && (isReward() || ['victory', 'defeat'].includes(game.phase)));
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
  return `<header class="site-header"><a class="brand" href="./" aria-label="星穹转轮首页"><span class="brand-mark">${icon('cube')}</span><span><b>星穹转轮</b><small>ASTRAL REELS</small></span></a><nav aria-label="主导航"><button data-action="play" class="nav-button ${!dialog ? 'active' : ''}">转轮实验室</button><button data-action="catalog" class="nav-button ${dialog === 'catalog' ? 'active' : ''}">编队图鉴</button><button data-action="help" class="nav-button">玩法手册</button></nav><div class="header-actions"><span class="version-label">PROTOTYPE 01</span><button class="icon-button" data-action="sound" aria-label="${settings.sound ? '关闭音效' : '开启音效'}" title="${settings.sound ? '关闭音效' : '开启音效'}">${icon(settings.sound ? 'sound' : 'mute')}</button><button class="icon-button" data-action="settings" aria-label="游戏设置">${icon('settings')}</button></div></header>`;
}
function leftPanel() {
  const synergy = getSynergies(game);
  const active = synergy.filter(s => s.active);
  const preview = [...active, ...synergy.filter(s => !s.active && s.count > 0)].slice(0, 7);
  return `<aside class="left-panel"><section class="panel dossier"><div class="panel-heading"><h2>开拓档案</h2><span class="tiny-label">TRAILBLAZER</span></div><div class="floor-display"><span class="orbital-ring">${icon('cube')}</span><div><span class="eyebrow">${game.mode === 'combat' ? '模拟宇宙 · 探索进度' : '星际公寓 · 生存进度'}</span><strong>第 ${String(game.floor).padStart(2, '0')} 层<small> / ${game.endless ? '∞' : '12'}</small></strong></div></div><div class="segmented-progress" aria-label="已到第 ${game.floor} 层">${Array.from({ length: 12 }, (_, i) => `<i class="${i < Math.min(game.floor, 12) ? 'filled' : ''}"></i>`).join('')}</div><div class="health-stat"><div><span>${icon(game.mode === 'combat' ? 'heart' : 'coins')}${game.mode === 'combat' ? '开拓生命' : '持有信用点'}</span><b>${game.mode === 'combat' ? `${num(game.hp)} <small>/ ${num(game.maxHp)}</small>` : num(game.coins)}</b></div><div class="meter ${game.mode === 'classic' ? 'gold' : ''}"><i style="width:${Math.min(100, Math.max(0, game.mode === 'combat' ? game.hp / game.maxHp * 100 : game.coins / Math.max(1, game.rent) * 100))}%"></i></div></div>${game.mode === 'combat' ? `<div class="supply-credits"><span>${icon('coins')}补给信用点</span><b>${num(game.coins)}</b></div>` : ''}<div class="small-stats"><div><span>${icon('shield')}护盾</span><b>${num(game.shield)}</b></div><div><span>${icon('rotate')}重掷</span><b>${num(game.rerolls)}</b></div><div><span>${icon('trash')}移除</span><b>${num(game.removals)}</b></div></div><button class="button ghost full" data-action="new">${icon('rotate')}开启新旅程</button></section><section class="panel synergy-panel"><div class="panel-heading"><h2>羁绊共鸣</h2><span class="count-badge">${active.length} 激活</span></div><p class="muted panel-intro">不同的同行者，带来相同的信念。</p><div class="synergy-list">${preview.map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon(s.kind === 'faction' ? 'users' : s.kind === 'element' ? 'bolt' : 'star')}</span><span class="synergy-name"><b>${esc(s.name)}</b><small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.find(t => t > s.count) || s.thresholds.at(-1)}</small></span></button>`).join('') || '<p class="muted">招募角色后解锁羁绊。</p>'}</div><p class="panel-note">按编队中的不同角色统计 · 升星不影响人数</p><button class="all-synergies" data-action="synergies">查看全部羁绊 ${icon('chevron')}</button></section><button class="panel roster-link" data-action="roster"><span class="round-icon">${icon('users')}</span><span><b>我的编队</b><small>${game.roster.length} 位同行者 · 三合一自动升星</small></span>${icon('chevron')}</button></aside>`;
}
function enemies() {
  if (game.mode === 'classic') return `<div class="rent-scene"><div class="rent-emblem">${icon('coins')}</div><div><span class="eyebrow">来自星际和平公司的账单</span><h3>下一期房租 <b>${num(game.rent)}</b><span>信用点</span></h3><p>剩余 ${game.spinsLeft} 次转动。让你的构筑为这段旅程买单。</p></div><span class="rent-stamp">IPC<br/>APPROVED</span></div>`;
  const skill = game.enemySkill || game.modifier;
  const skillText = typeof skill === 'string' ? skill : skill?.description || skill?.name;
  return `<div class="enemy-formation" aria-label="五列敌方阵型">${Array.from({ length: 5 }, (_, col) => {
    const enemy = game.enemies.find(e => e.col === col && e.hp > 0);
    const hits = lastBoard ? game.lastSpin.hits.filter(hit => hit.targetCol === col) : [];
    const hitDamage = hits.reduce((sum, hit) => sum + hit.amount, 0);
    return `<div class="enemy-slot ${hits.length ? 'enemy-hit' : ''} ${enemy?.boss ? 'boss' : ''} ${enemy ? '' : 'empty'}"><span class="lane-label">${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][col]}${enemy?.boss ? ' · BOSS' : ''}</span>${enemy ? `<img class="enemy-art" src="./public/assets/enemies/${enemyArt(enemy)}.svg" alt="${esc(enemy.name)}"/><span class="enemy-name">${esc(enemy.name)}</span><div class="enemy-health"><i style="width:${Math.max(0, enemy.hp / enemy.maxHp * 100)}%"></i></div><span class="enemy-hp">${num(enemy.hp)} <small>/ ${num(enemy.maxHp)}</small></span><span class="enemy-intent" title="敌方每回合伤害">${icon('bolt')} ${enemy.attack}</span>` : `<div class="clear-lane">${icon('star')}<span>空列</span></div>`}${hitDamage > 0 ? `<span class="enemy-damage-float">−${num(Math.round(hitDamage * 100) / 100)}</span>` : ''}</div>`;
  }).join('')}</div><div class="enemy-rule">${icon('shield')}<span>${esc(skillText || '敌方行动：转轮结算后反击，清空所有敌人即可进入下一层。')}</span><b>预计反击 ${num(game.enemyIntent?.damage)} · ${game.spinsLeft} 回合</b></div>`;
}
function board() {
  return `<div class="reel-frame ${busy ? 'is-spinning' : ''}"><div class="frame-corner tl"></div><div class="frame-corner tr"></div><div class="frame-corner bl"></div><div class="frame-corner br"></div><div class="reel-grid" aria-label="五列四行转轮">${game.board.map((symbol, index) => {
    if (!symbol) return `<div class="reel-cell blank" style="--delay:${index % 5 * 55}ms"><span>✧</span><small>待同行</small></div>`;
    const c = char(symbol.id);
    if (!c) return '<div class="reel-cell blank"></div>';
    const value = game.stats.spins > 0 ? game.lastSpin?.values?.[index] : (c.power + symbol.growth) * [0, 1, 3, 9][symbol.stars];
    return `<button class="reel-cell rarity-${c.rarity} ${symbol.stars > 1 ? 'upgraded' : ''}" data-action="character" data-id="${esc(symbol.uid)}" style="--char-color:${c.color || '#b1a2e7'};--delay:${index % 5 * 55}ms" aria-label="${esc(c.name)} ${symbol.stars}星 ${attackNames[c.attack]} 基础值${c.power}"><span class="cell-stars">${stars(symbol.stars)}</span><img src="${portrait(c)}" alt="" draggable="false"/><span class="cell-bottom"><b>${esc(c.name)}</b><span>${attackNames[c.attack]}</span></span><span class="cell-power">${num(value ?? c.power * (symbol.stars || 1))}</span>${lastBoard && value > 0 ? `<span class="damage-float">+${num(value)}</span>` : ''}</button>`;
  }).join('')}</div></div>`;
}
function mainPanel() {
  const total = game.mode === 'combat' ? game.lastSpin?.damage || 0 : game.lastSpin?.coins || 0;
  return `<section class="main-panel"><div class="mission-heading"><div><span class="eyebrow"><i class="live-dot"></i>${game.mode === 'combat' ? 'SIMULATED UNIVERSE' : 'INTERASTRAL APARTMENT'}</span><h1>让命运，再转一圈<span>。</span></h1><p>招募同行者 · 收集奇物 · 构筑你的开拓之路</p></div><div class="mode-switch" aria-label="游戏模式"><button data-action="mode" data-mode="combat" class="${game.mode === 'combat' ? 'selected' : ''}">五列战斗</button><button data-action="mode" data-mode="classic" class="${game.mode === 'classic' ? 'selected' : ''}">房租挑战</button></div></div><section class="arena panel"><div class="arena-heading"><span>${icon('bolt')} ${game.mode === 'combat' ? '遭遇战' : '房租挑战'}<b>${String(game.floor).padStart(2, '0')}</b></span><span class="tiny-label">ROUND ${String(game.round).padStart(2, '0')} <i>·</i> 5 × 4 REELS</span>${game.mode === 'combat' ? `<span class="mobile-combat-hud" role="group" aria-label="生命 ${num(game.hp)}，护盾 ${num(game.shield)}">${icon('heart')}${num(game.hp)} ${icon('shield')}${num(game.shield)}</span>` : ''}</div>${enemies()}<div class="lane-connectors">${Array.from({ length: 5 }, () => '<span></span>').join('')}</div>${board()}<div class="board-caption"><span>${icon('users')}从 ${game.roster.length} 位编队成员中随机上场</span><button data-action="help">攻击规则 ${icon('chevron')}</button></div><div class="spin-controls"><div class="last-total"><span>${game.mode === 'combat' ? '本轮总伤害' : '本轮信用点'}</span><strong>${num(total)}<small>${game.mode === 'combat' ? ' DMG' : ' CR'}</small></strong></div><button class="spin-button" data-action="spin" ${busy || game.phase !== 'ready' ? 'disabled' : ''}>${icon('rotate')}<span>${busy ? '命运转动中…' : game.phase === 'ready' ? '启动转轮' : isReward() ? '选择本轮奖励' : '旅程已结算'}<small>${busy ? '同行者正在行动' : 'SPIN THE REELS'}</small></span>${icon('arrow')}</button></div><div class="arena-footnote"><span class="keyboard-key">SPACE</span> 也可以按空格转动 <span class="save-status">${saveAvailable ? '✓ 自动保存' : '当前页面保存'}</span></div></section><div class="below-arena"><span>${icon('star')}每一次转动，都是一种可能。</span><button data-action="help">第一次开拓？阅读玩法手册 ${icon('arrow')}</button></div></section>`;
}
function rightPanel() {
  return `<aside class="right-panel"><section class="panel curios-panel"><div class="panel-heading"><h2>奇物收藏</h2><span class="count-badge">${game.items.length}</span></div><p class="muted panel-intro">一些小小的东西，改变整个宇宙。</p>${game.items.length ? `<div class="curio-list">${game.items.map(id => { const c = item(id); return c ? `<button class="curio" data-action="item" data-id="${esc(id)}"><span class="curio-icon">${esc(c.icon || '◈')}</span><span><b>${esc(c.name)}</b><small>${esc(c.description)}</small></span>${icon('chevron')}</button>` : ''; }).join('')}</div>` : `<div class="empty-collection"><div class="curio-orbit">${icon('cube')}<i>✧</i></div><b>等待一次奇遇</b><p>每完成两层后<br/>选择一件奇物，强化你的构筑</p></div>`}</section><section class="panel essence-panel"><div class="panel-heading"><h2>奇物精华</h2><span class="tiny-label">ESSENCE</span></div>${game.essences.length ? game.essences.map(e => { const c = essence(e.id); return c ? `<button class="essence ${e.triggered ? 'triggered' : ''}" data-action="essence" data-id="${esc(e.id)}"><span>${esc(c.icon || '✦')}</span><div><b>${esc(c.name)}</b><p>${e.triggered ? '已触发 · 永久效果生效' : esc(c.description)}</p><small>${e.triggered ? 'ACTIVATED' : `蓄能 ${e.progress || 0}${c.target ? ` / ${c.target}` : ''}`}</small></div></button>` : ''; }).join('') : `<div class="essence-empty"><span>✦</span><p>深入宇宙，发现精华<br/><small>达成条件后触发强力效果</small></p></div>`}</section><section class="panel log-panel"><div class="panel-heading"><h2>战斗记录</h2><span class="record-dot"></span></div><div class="combat-log" aria-live="polite">${(game.history?.length ? game.history : game.lastSpin?.events?.length ? game.lastSpin.events : ['列车已抵达。同行者集结完毕。', '启动转轮，开始你的第一场开拓。']).slice(-6).reverse().map((event, i) => `<p class="${i === 0 ? 'latest' : ''}"><span>${i === 0 ? '◆' : '·'}</span>${esc(event)}</p>`).join('')}</div></section><div class="seed-label">UNIVERSE SEED <b>${esc(game.seed)}</b></div></aside>`;
}
function modal(title, body, footer = '', options = {}) {
  return `<div class="modal-backdrop"><section class="modal ${options.wide ? 'wide' : ''} ${options.reward ? 'reward-modal' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title">${options.close === false ? '' : `<button class="icon-button modal-close" data-action="close" aria-label="关闭弹窗">${icon('cross')}</button>`}<div class="modal-heading"><span class="eyebrow">${esc(options.eyebrow || 'ASTRAL ARCHIVE')}</span><h2 id="dialog-title">${title}</h2>${options.subtitle ? `<p>${options.subtitle}</p>` : ''}</div>${body}${footer ? `<div class="modal-footer">${footer}</div>` : ''}</section></div>`;
}
function characterCard(c, symbol = null, button = '') {
  return `<article class="character-card rarity-${c.rarity}"><div class="portrait-stage" style="--char-color:${c.color || '#b6a0e6'}"><span class="rarity-label">${rarityNames[c.rarity]}</span><img src="${portrait(c)}" alt="${esc(c.name)}"/><span class="portrait-stars">${symbol ? stars(symbol.stars) : '★'}</span></div><div class="card-copy"><span class="eyebrow">${esc(c.enName || c.path)}</span><h3>${esc(c.name)}</h3><div class="character-tags"><span>${esc(c.element)}</span><span>${esc(c.path)}</span><span>${attackNames[c.attack]} · ${c.power}</span></div><p>${esc(c.description)}</p>${symbol?.growth ? `<p class="growth-label">永久成长 +${num(symbol.growth)}</p>` : ''}${button}</div></article>`;
}
function rewardDialog() {
  const recruit = game.phase === 'recruit';
  const collection = recruit ? CHARACTERS : game.phase === 'item' ? ITEMS : ESSENCES;
  const titles = { recruit: '下一位，同行者。', item: '宇宙赠予的小小奇迹。', essence: '把奇迹，凝成精华。' };
  const options = game.choices.map((choice, index) => {
    const id = typeof choice === 'string' ? choice : choice.id;
    const c = collection.find(c => c.id === id);
    if (!c) return '';
    const pick = `<button class="button primary full" data-action="choose" data-index="${index}">${recruit ? '邀请同行' : '收下奇物'} ${icon('arrow')}</button>`;
    return recruit ? characterCard(c, null, pick) : `<article class="item-card rarity-${c.rarity || 'rare'}"><div class="large-curio-icon">${esc(c.icon || '✦')}</div><span class="eyebrow">${game.phase === 'essence' ? 'ESSENCE' : rarityNames[c.rarity]}</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p>${pick}</article>`;
  }).join('');
  return modal(titles[game.phase], `<div class="reward-cards">${options}</div>`, `<button class="button ghost" data-action="reroll" ${game.rerolls <= 0 && game.coins < 8 ? 'disabled' : ''}>${icon('rotate')}重新发现 <span class="count-badge">${game.rerolls > 0 ? `${game.rerolls} 次免费` : '8 信用点'}</span></button><button class="text-button" data-action="skip">${recruit ? '暂不招募' : '跳过奖励'} ${icon('arrow')}</button>`, { close: false, wide: true, reward: true, eyebrow: `DISCOVERY · ${recruit ? '同行者招募' : game.phase === 'item' ? '奇物奖励' : '精华奖励'}`, subtitle: recruit ? '选择一位加入编队。同角色同星级凑齐 3 位后，自动升星。' : '选择一件，让你的构筑走向新的可能。' });
}
function helpDialog() {
  return modal('这次开拓，由你定义。', `<div class="help-grid"><article><span class="step-number">01</span><h3>转动 · 招募 · 构筑</h3><p>编队成员随机填入 5 × 4 转轮。每次转动后从三位角色中选一位，或跳过。编队超过 20 位后，每轮只会抽取其中 20 位。使用重掷寻找合适的同行者，使用移除精简编队。</p></article><article><span class="step-number">02</span><h3>五列战斗</h3><p>角色攻击对应列的敌人。空列寻找最近的存活敌人，距离相同优先左侧。敌人结算后反击，护盾优先抵挡伤害；清空所有敌人即可过关。Boss 固定在中间列。</p><div class="attack-guide"><span><b>单体</b>主目标 ×3</span><span><b>扩散</b>主目标 ×2 · 相邻 ×1</span><span><b>群体</b>所有敌人 ×1</span></div></article><article><span class="step-number">03</span><h3>同行，让可能变多</h3><p>羁绊按整个编队里的不同角色数量计算。同角色同星级自动 3 合 1：三位 1 星变 2 星，三位 2 星变 3 星。高星角色更强，重复角色不会重复计入羁绊。</p></article><article><span class="step-number">04</span><h3>奇物与精华</h3><p>过关后选择永久生效的奇物。深入关卡还会获得精华：满足条件后触发特殊效果。房租挑战中，每次转动赚取信用点，在期限内支付逐渐提高的房租。</p></article></div><div class="help-note">旅程共 12 层。通关后可继续无尽模式。进度保存在当前浏览器，刷新可以继续；切换设备不会同步。角色技能、羁绊及数值为本游戏改编设定。</div>`, `<button class="button primary" data-action="close">准备好了 ${icon('arrow')}</button>`, { wide: true, eyebrow: 'TRAILBLAZER HANDBOOK' });
}
function catalogDialog() {
  const collections = { characters: CHARACTERS, items: ITEMS, essences: ESSENCES };
  const cards = catalogTab === 'characters' ? collections.characters.map(c => characterCard(c)).join('') : collections[catalogTab].map(c => `<article class="catalog-item"><span>${esc(c.icon || '✦')}</span><div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p></div></article>`).join('');
  return modal('所有相遇，都有意义。', `<div class="catalog-tabs">${[['characters', '同行者', CHARACTERS.length], ['items', '奇物', ITEMS.length], ['essences', '精华', ESSENCES.length]].map(([id, label, count]) => `<button class="button ${catalogTab === id ? 'primary' : 'ghost'}" data-action="catalogTab" data-tab="${id}">${label} <small>${count}</small></button>`).join('')}</div><div class="catalog-grid ${catalogTab !== 'characters' ? 'item-grid' : ''}">${cards}</div>`, '', { wide: true, eyebrow: 'ASTRAL COMPENDIUM', subtitle: '查看角色技能和奇物效果，规划下一次构筑。' });
}
function rosterDialog() {
  return modal('同行者，一个都不能少。', `<div class="roster-meta"><span>${game.roster.length} 位角色 · 上场最多 20 位</span><span>可用移除 ${game.removals} 次</span></div><div class="roster-grid">${game.roster.map(symbol => { const c = char(symbol.id); return c ? characterCard(c, symbol, `<button class="button ghost full" data-action="removeAsk" data-id="${esc(symbol.uid)}" ${game.removals <= 0 || game.phase !== 'ready' || busy ? 'disabled' : ''}>${icon('trash')}移出编队</button>`) : ''; }).join('')}</div>`, '', { wide: true, eyebrow: 'MY CREW', subtitle: '移除会消耗 1 次机会，角色会永久离开本次旅程。奖励选择期间暂时无法移除。' });
}
function newDialog() {
  return modal('下一段旅程，从这里开始。', `<form id="new-run-form"><div class="mode-cards"><label class="mode-card"><input type="radio" name="mode" value="combat" ${pendingMode === 'combat' ? 'checked' : ''}/><span>${icon('bolt')}<b>五列战斗</b><small>转轮变战场，构筑变力量</small></span></label><label class="mode-card"><input type="radio" name="mode" value="classic" ${pendingMode === 'classic' ? 'checked' : ''}/><span>${icon('coins')}<b>房租挑战</b><small>赚取信用点，应对递增房租</small></span></label></div><label class="input-label" for="seed-input">宇宙种子 <small>相同种子与选择可以复现旅程</small></label><input class="seed-input" id="seed-input" name="seed" maxlength="64" value="${esc(freshSeed())}" autocomplete="off"/><p class="muted">开启后会替换当前旅程的自动存档。</p><button class="button primary full" type="submit">开启新旅程 ${icon('arrow')}</button></form>`, '', { eyebrow: 'A NEW JOURNEY' });
}
function settingsDialog() {
  return modal('按自己的节奏开拓。', `<div class="settings-list"><label><span><b>轻量音效</b><small>转动与招募时播放提示音</small></span><input type="checkbox" data-setting="sound" ${settings.sound ? 'checked' : ''}/></label><label><span><b>转轮动画</b><small>系统减少动态效果时自动关闭</small></span><input type="checkbox" data-setting="animations" ${settings.animations ? 'checked' : ''}/></label></div><div class="run-stats"><div><strong>${num(stats.runs)}</strong><span>开拓次数</span></div><div><strong>${num(stats.wins)}</strong><span>通关次数</span></div><div><strong>${num(stats.bestFloor)}</strong><span>最深层数</span></div></div><div class="help-note">自动存档在当前浏览器中。宇宙种子：${esc(game.seed)}。所有素材均随游戏本地加载，无广告，无内购。</div>`, `<button class="button primary" data-action="close">完成</button>`, { eyebrow: 'PREFERENCES' });
}
function endDialog() {
  const win = game.phase === 'victory';
  return modal(win ? '群星，见证了你的胜利。' : '旅程暂停，开拓永不止步。', `<div class="end-emblem ${win ? 'win' : ''}">${icon(win ? 'trophy' : 'cube')}</div><p class="end-copy">${win ? '你与同行者穿越了 12 层宇宙。下一站，去更远的地方。' : game.mode === 'combat' ? '敌人的攻势终结了这段旅程。新的构筑，或许就是下一次胜利。' : '这次的信用点没能支付房租。精简编队，寻找互相强化的角色，再试一次。'}</p>${!win ? `<p class="help-note">${esc(game.history.at(-1))}</p>` : ''}<div class="run-stats"><div><strong>${game.floor}</strong><span>抵达层数</span></div><div><strong>${game.stats.spins}</strong><span>转轮次数</span></div><div><strong>${game.roster.length}</strong><span>编队人数</span></div></div>`, `${win ? `<button class="button ghost" data-action="endless">继续无尽开拓 ${icon('arrow')}</button>` : ''}<button class="button primary" data-action="new">再次出发 ${icon('rotate')}</button>`, { close: false, eyebrow: win ? 'JOURNEY COMPLETE' : 'JOURNEY ENDED' });
}
function renderDialog() {
  if (dialog === 'help') return helpDialog();
  if (dialog === 'catalog') return catalogDialog();
  if (dialog === 'roster') return rosterDialog();
  if (dialog === 'new') return newDialog();
  if (dialog === 'settings') return settingsDialog();
  if (dialog === 'synergies') return modal('相同的信念，不同的同行者。', `<div class="all-synergy-grid">${getSynergies(game).map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon('star')}</span><span class="synergy-name"><b>${esc(s.name)}</b><small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.join('/')}</small></span></button>`).join('')}</div>`, '<button class="button primary" data-action="close">返回转轮</button>', { wide: true, eyebrow: 'RESONANCE ARCHIVE', subtitle: '羁绊按整个编队中的不同角色身份计算。角色命途、阵营和元素可同时生效。' });
  if (dialog === 'character') {
    const symbol = game.roster.find(s => s.uid === detail) || game.board.find(s => s?.uid === detail);
    const c = symbol && char(symbol.id);
    return c ? modal(esc(c.name), characterCard(c, symbol), '<button class="button primary" data-action="close">了解了</button>', { eyebrow: 'TRAILBLAZER PROFILE' }) : '';
  }
  if (dialog === 'synergy') {
    const s = getSynergies(game).find(s => s.id === detail);
    return s ? modal(esc(s.name), `<div class="synergy-detail"><span class="large-curio-icon">${icon('users')}</span><p>${esc(s.description)}</p><p>当前人数：<b>${s.count}</b> · 激活门槛：<b>${s.thresholds.join(' / ')}</b></p><p class="muted">每个不同角色最多计数一次。所有编队成员都参与羁绊，不限本次上场角色。</p></div>`, '<button class="button primary" data-action="close">了解了</button>', { eyebrow: 'RESONANCE' }) : '';
  }
  if (dialog === 'item' || dialog === 'essence') {
    const c = dialog === 'item' ? item(detail) : essence(detail);
    return c ? modal(esc(c.name), `<div class="synergy-detail"><span class="large-curio-icon">${esc(c.icon || '✦')}</span><p>${esc(c.description)}</p></div>`, '<button class="button primary" data-action="close">了解了</button>', { eyebrow: dialog === 'item' ? 'CURIO' : 'ESSENCE' }) : '';
  }
  if (dialog === 'confirmRemove') {
    const symbol = game.roster.find(s => s.uid === detail); const c = symbol && char(symbol.id);
    return modal('给编队留出新的可能。', `<p class="end-copy">移除 ${esc(c?.name)} ${stars(symbol?.stars)} 会消耗 1 次移除机会。此操作会永久改变当前编队。</p>`, '<button class="button ghost" data-action="roster">返回编队</button><button class="button primary" data-action="removeConfirm">确认移除</button>', { eyebrow: 'REFINE YOUR DECK' });
  }
  if (!busy && isReward()) return rewardDialog();
  if (!busy && ['victory', 'defeat'].includes(game.phase)) return endDialog();
  return '';
}
function render() {
  const focusAction = document.activeElement?.dataset?.action;
  app.innerHTML = `${header()}<main class="game-layout">${leftPanel()}${mainPanel()}${rightPanel()}</main><footer class="site-footer"><span>星穹转轮 <i>✦</i> 一场与命运的游戏</span><span>同人实验项目 · 角色素材 © HoYoverse <a href="https://github.com/jjhe2020/starrail-landlord" target="_blank" rel="noreferrer">GITHUB ${icon('arrow')}</a></span></footer>${renderDialog()}`;
  const backdrop = document.querySelector('.modal-backdrop');
  document.body.style.overflow = backdrop ? 'hidden' : '';
  document.querySelector('.game-layout').inert = !!backdrop;
  document.querySelector('.site-header').inert = !!backdrop;
  document.querySelector('.site-footer').inert = !!backdrop;
  if (backdrop) (backdrop.querySelector(`[data-action="${focusAction || ''}"]`) || backdrop.querySelector('button, input'))?.focus({ preventScroll: true });
  else if (focusAction) document.querySelector(`[data-action="${focusAction}"]`)?.focus({ preventScroll: true });
}
async function doSpin() {
  if (busy || game.phase !== 'ready' || dialog) return;
  busy = true; lastBoard = null; playTone(); render();
  const animate = settings.animations && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  await new Promise(resolve => setTimeout(resolve, animate ? 460 : 0));
  lastBoard = game.board;
  adopt(spin(game)); render();
  await new Promise(resolve => setTimeout(resolve, animate ? 750 : 0));
  lastBoard = null; busy = false; render();
}
app.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  const action = control.dataset.action;
  if (action === 'spin') { try { await doSpin(); } catch (error) { busy = false; render(); showToast(`本轮未能结算：${error.message}`); } return; }
  if (busy) return;
  if (action === 'choose') { adopt(chooseReward(game, Number(control.dataset.index))); playTone('recruit'); }
  else if (action === 'skip') adopt(skipReward(game));
  else if (action === 'reroll') { adopt(rerollRewards(game)); playTone(); }
  else if (action === 'new') { pendingMode = game.mode; dialog = 'new'; }
  else if (action === 'mode') { if (control.dataset.mode === game.mode) return; pendingMode = control.dataset.mode; dialog = 'new'; }
  else if (action === 'catalogTab') catalogTab = control.dataset.tab;
  else if (action === 'close' || action === 'play') dialog = null;
  else if (action === 'sound') { settings.sound = !settings.sound; persist(); playTone('recruit'); }
  else if (action === 'endless') { adopt(continueEndless(game)); dialog = null; }
  else if (action === 'removeAsk') { detail = control.dataset.id; dialog = 'confirmRemove'; }
  else if (action === 'removeConfirm') { adopt(removeSymbol(game, detail)); dialog = 'roster'; }
  else if (['character', 'item', 'essence', 'synergy'].includes(action)) { dialog = action; detail = control.dataset.id; }
  else if (['roster', 'help', 'catalog', 'settings', 'synergies'].includes(action)) dialog = action;
  render();
});
app.addEventListener('submit', event => {
  if (event.target.id !== 'new-run-form') return;
  event.preventDefault();
  const form = new FormData(event.target);
  game = newGame({ mode: form.get('mode') === 'classic' ? 'classic' : 'combat', seed: String(form.get('seed') || '').trim().slice(0, 64) || freshSeed() });
  stats.runs++; dialog = null; busy = false; lastBoard = null; persist(); render(); showToast('新的宇宙，新的可能。');
});
app.addEventListener('change', event => {
  if (event.target.dataset.setting) { settings[event.target.dataset.setting] = event.target.checked; persist(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dialog) { dialog = null; render(); return; }
  if (event.code === 'Space' && !modalOpen() && !['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement?.tagName)) { event.preventDefault(); doSpin(); }
  if (event.key === 'Tab' && modalOpen()) {
    const focusable = [...document.querySelectorAll('.modal button:not(:disabled), .modal input, .modal a')];
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});
persist(); render();
