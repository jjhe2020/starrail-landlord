import { newGame, inspectSpin, chooseReward, skipReward, rerollRewards, removeSymbol, continueEndless, getSynergies, validateSave, purchaseSupply, getCharacterAttributes } from './engine.js';
import { createInspector } from './inspect.js';
import { mechanicExplanation } from './mechanics.js';
import { CHARACTERS, ITEMS, ESSENCES, characterById } from './content.js';
import { createOfflineSupport } from './offline.js';
import { IS_PORTABLE, IS_DEVELOPMENT, assetUrl } from './runtime.js';
import { MAX_SAVE_BYTES, exportSave, importSave } from './save-transfer.js';
import { effectRows, effectBadges, durationInfo, snapshotTitle, unitBreakdown, characterRole, characterBindings, trainingSummary, normalAttackSummary, characterAttributeRows } from './effect-info.js';
import { retirementRulesFor, getRetirementPreview } from './retirements.js';
import { COMBAT_TIMING, createCombatPlan } from './combat-motion.js';
import { playCombat } from './combat-player.js';
import { motionEnabled, enterModal, leaveModal, purchaseFeedback } from './ui-motion.js';

const app = document.querySelector('#app');
const SAVE_KEY = IS_DEVELOPMENT ? 'astral-reels:development:v1' : 'astral-reels:v1';
const GAME_VERSION = '0.8.1';
const rarityNames = { common: '普通', uncommon: '稀有', rare: '史诗', legendary: '传说' };
const recruitableCharacters = CHARACTERS.filter(character => character.recruitable !== false);
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
let combatPreview = null;
let rolling = false;
let transitioning = false;

let developerTools = null;
const SUPPLIES = { repair: { name: '医疗补给', cost: 12, description: '恢复 18 点生命', key: 'supplyRepair' }, barrier: { name: '护盾补给', cost: 10, description: '获得 20 点护盾', key: 'supplyBarrier' }, overclock: { name: '超频补给', cost: 16, description: '下一次转动造成伤害提高20%', key: 'supplyOverclock' } };
const inspector = createInspector({ resolve: inspectionContent });
const offline = createOfflineSupport(refreshOfflineView);
// Decode the shared texture before the first impact without delaying input.
const combatTexture = new Image();
combatTexture.src = assetUrl('./public/assets/effects/astral-fx.webp');
combatTexture.decode?.().catch(() => {});
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
function advancedRules(body, title = '进阶规则与结算') {
  return IS_DEVELOPMENT ? body : `<details class="advanced-rules"><summary>${esc(title)}</summary>${body}</details>`;
}
function effectRulesMarkup(content) {
  const rows = effectRows(content);
  return rows.length ? `<section class="effect-rules" aria-label="生效与叠加规则">${rows.map(row => `<div class="effect-rule"><h4>${esc(row.label)}</h4><dl><div><dt>时点</dt><dd>${esc(row.trigger)}</dd></div><div><dt>对象</dt><dd>${esc(row.target)}</dd></div>${row.conditions ? `<div><dt>条件</dt><dd>${esc(row.conditions)}</dd></div>` : ''}<div><dt>持续</dt><dd><span class="effect-chip duration-${esc(row.duration.key)}">${esc(row.duration.label)}</span></dd></div><div><dt>叠加</dt><dd>${esc(row.stacking)}</dd></div>${row.scaling ? `<div><dt>属性/星级</dt><dd>${esc(row.scaling)}</dd></div>` : ''}</dl>${row.duration.note ? `<p class="effect-duration-note">${esc(row.duration.note)}</p>` : ''}</div>`).join('')}</section>` : '';
}
function synergyRulesMarkup(synergy) {
  return (synergy.tierEffects || [synergy.effects]).map((effects, index) => `<section class="synergy-tier-rules"><h4>${synergy.thresholds[index]} 人档${synergy.tier === index + 1 ? ' · 当前档位' : ''}</h4>${effectRulesMarkup({effects})}</section>`).join('');
}
function characterAttributes(c, instance) {
  return getCharacterAttributes(instance || { id: c.id, stars: 1, attackBonus: 0 }, game);
}
function attributeMarkup(c, instance, { detailed = false } = {}) {
  const attributes = characterAttributes(c, instance);
  const rows = characterAttributeRows(attributes);
  const attackBonus = attributes.attackBonus || 0;
  const starAttack = attributes.starAttack ?? attributes.breakdown?.starAttack ?? attributes.attack - attackBonus;
  return `<section class="card-attributes" aria-label="角色固有属性"><dl>${rows.map(row => `<div class="attribute-${row.key}"><dt>${esc(row.label)}</dt><dd>${row.key === 'attack' ? num(row.value) : esc(row.value)}</dd></div>`).join('')}</dl>${detailed ? `<p class="attribute-origin">一星基础攻击力 ${num(attributes.baseAttack)} · ${instance?.stars || 1}星基础 ${num(starAttack)}${attackBonus ? ` · 本局永久 +${num(attackBonus)}` : ''}${attributes.permanentPercent ? ` · 永久攻击力提高${percentage(attributes.permanentPercent)}` : ''}</p><p class="attribute-note">升星与本局永久提升计入卡面；本次转动的攻击力增益和伤害增益在结算记录中查看。默认倍率不用于治疗、护盾或追加攻击。</p>` : IS_DEVELOPMENT ? `<p class="attribute-origin">一星基础攻击力 ${num(attributes.baseAttack)}${attackBonus ? ` · 本局永久 +${num(attackBonus)}` : ''}${attributes.permanentPercent ? ` · 永久攻击力提高${percentage(attributes.permanentPercent)}` : ''}</p>` : ''}</section>`;
}
function powerBreakdownMarkup(instance) {
  const part = unitBreakdown(game, instance?.uid);
  if (!part) return '';
  const permanent = part.permanent ?? part.attackBonus ?? part.growth ?? 0;
  const flat = part.flatBonus ?? 0;
  const attackPercent = part.attackPercent ?? (part.multiplier ? part.multiplier - 1 : 0);
  return `<section class="power-breakdown" aria-label="上次攻击力构成"><h4>${esc(snapshotTitle(game))}</h4><dl><div><dt>星级基础攻击力</dt><dd>${num(part.star ?? part.base)}</dd></div><div class="permanent"><dt>本局永久攻击力</dt><dd>+${num(permanent)}</dd></div>${part.permanentPercent ? `<div><dt>本局永久攻击力提高</dt><dd>${percentage(part.permanentPercent)}</dd></div>` : ''}<div class="temporary"><dt>本次固定增加值</dt><dd>${flat >= 0 ? '+' : ''}${num(flat)}</dd></div><div><dt>本次攻击力提高</dt><dd>${percentage(attackPercent)}</dd></div>${Number.isFinite(part.attackPenalty) && part.attackPenalty !== 1 ? `<div><dt>本次攻击力降低</dt><dd>${percentage(1 - part.attackPenalty)}</dd></div>` : ''}<div class="final"><dt>上次结算攻击力</dt><dd>${num(part.final)}</dd></div>${Number.isFinite(part.damageBonus) ? `<div><dt>造成伤害提高</dt><dd>${percentage(part.damageBonus)}</dd></div>` : ''}${Number.isFinite(part.followUpBonus) ? `<div><dt>追加攻击额外增伤</dt><dd>${percentage(part.followUpBonus)}</dd></div>` : ''}</dl><p>伤害按攻击力 × 独立技能倍率 × 造成伤害增幅 × 敌方受到伤害增幅结算；治疗与护盾读取各自倍率。本次增益下次重新计算。</p></section>`;
}
function bindingTags(c) {
  return `<div class="binding-tags" aria-label="主职与阵营"><span class="role-tag role-${esc(c.role || 'attack')}">${esc(characterRole(c))}</span><span class="binding-tag">${esc(c.faction)}</span></div>`;
}
function bindingTargetsMarkup(c) {
  const rows = effectRows(c);
  return `<details class="binding-targets" aria-label="适配对象"><summary>适配对象与条件</summary>${rows.map(row => `<p>${esc(row.target)}${row.conditions ? `；${esc(row.conditions)}` : ''}</p>`).join('')}</details>`;
}
function effectEventMarkup(event) {
  const timing = durationInfo(event.duration);
  const target = game.board.find(unit => unit?.uid === event.targetUid) || game.roster.find(unit => unit.uid === event.targetUid);
  const time = Number.isInteger(event.floor) && Number.isInteger(event.round) ? `第 ${event.floor} 关 · ${event.round === 0 ? '入关' : `第 ${event.round} 次转动`}` : '';
  return `<li><div><b>${esc(event.label || '效果结算')}</b><span class="effect-chip duration-${esc(timing.key)}">${esc(timing.label)}</span></div>${time ? `<small>${time}</small>` : ''}${target || Number.isFinite(event.amount) ? `<p>${target ? `作用于 ${esc(char(target.id)?.name || '角色')}` : ''}${target && Number.isFinite(event.amount) ? ' · ' : ''}${Number.isFinite(event.amount) ? `实际 ${num(event.amount)}` : ''}</p>` : ''}</li>`;
}
function unitEffectsMarkup(instance) {
  if (!instance) return '';
  const entries = (game.lastSpin.effects || []).filter(event => event.sourceUid === instance.uid || event.targetUid === instance.uid);
  return entries.length ? `<details class="unit-effect-details"><summary>上次的具体效果 · ${entries.length} 条</summary><ul class="effect-event-list">${entries.slice(0, 20).map(effectEventMarkup).join('')}</ul></details>` : '';
}

function archetypeTags() { return ''; }
function retirementMarkup(c) {
  const rules = retirementRulesFor(c.id);
  if (!rules.length) return '';
  return `<details class="retirement-info"><summary>剧情委派 · ${rules.length} 组配合</summary>${rules.map(rule => `<p><b>${esc(rule.sourceName)} → ${esc(rule.targetName)}</b> · ${esc(rule.name)}</p><details class="advanced-rules"><summary>剧情来源与改编说明</summary><p>${esc(rule.relation)} <a class="rule-source" href="${esc(rule.source)}" target="_blank" rel="noreferrer">剧情来源 ↗</a></p><p>${esc(rule.adaptation)}</p></details><p>主持角色每第${rule.every}次实际登场，可将1名相邻的额外一星角色从本局删除，获得${rule.coins}信用点${rule.attackGrowth ? `，自身攻击力永久增加${rule.attackGrowth}（仅本局）` : ''}${rule.power ? `，本次转动攻击力增加${rule.power}` : ''}。保护二星、三星、永久攻击力增量超过1的角色和最后同名角色。拥有过对应角色后，每第${rule.supplyEvery}次登场创建1名角色，下次转动起可登场；同一委派同时最多保留1名由其创建的角色。创建的角色正常参与合成、羁绊和属性提升。</p>`).join('')}</details>`;
}
function publicationMarkup(c) {
  if (c.portraitKind === 'shared-source') return `<p class="publication-note">${esc(c.adaptation || '本作改编角色；头像借用官方角色素材，不代表独立官方立绘。')}</p>`;
  return `<p class="publication-note">${c.officialRarity ? `原作 ${c.officialRarity} 星 · ` : ''}${c.publicationStatus === 'announced' ? '已公布 · 本作改编能力' : c.publicationStatus === 'adapted-aeon' ? '星神 · 本作改编身份与能力，非官方可玩角色' : '本作改编能力'}${c.portraitKind === 'text-symbol' ? ' · 文字标识头像' : ''}</p>`;
}
function archetypePanel() {
  const commissions = getRetirementPreview(game);
  return commissions.length ? `<section class="panel"><h2>剧情委派</h2>${commissions.map(rule => `<p><b>${esc(rule.sourceName)} → ${esc(rule.targetName)}</b><br/>${rule.eligibleUids.length} 位可委派 · 再登场 ${rule.nextAppearance} 次时检查相邻条件</p>`).join('')}</section>` : '';
}
function inspectionContent(anchor) {
  const kind = anchor.dataset.inspect;
  if (kind === 'mechanic') {
    const info = mechanicExplanation(anchor.dataset.key, game);
    if (!info) return null;
    const choice = IS_DEVELOPMENT && anchor.dataset.key === 'aiProbability' ? developerTools?.inspectorChoice(Number(anchor.dataset.aiIndex)) : null;
    return { title: info.title, bodyHtml: `<p>${esc(info.description)}</p>${info.extra ? `<p class="inspect-note">${esc(info.extra)}</p>` : ''}${choice ? `<p class="inspect-note">当前推荐 ${percentage(choice.probability)}：${esc(choice.reason)}</p>` : ''}` };
  }
  if (kind === 'character') {
    const instance = game.board.find(s => s?.uid === anchor.dataset.id) || game.roster.find(s => s.uid === anchor.dataset.id);
    const c = instance ? char(instance.id) : char(anchor.dataset.characterId);
    if (!c) return null;
    const attributes = characterAttributes(c, instance);
    const attack = mechanicExplanation(attributes.normalAttack.pattern, game);
    const targeted = (game.activeDebuffs || []).filter(clause => clause.targetUid === instance?.uid && clause.targetUid);
    return { title: c.name, bodyHtml: `<div class="inspect-character"><img src="${portrait(c)}" alt=""/><div><span class="inspect-stars">${stars(instance?.stars)}</span><p>${esc(c.element)} · ${esc(c.path)} · ${esc(c.faction)}</p><b>${esc(characterRole(c))}</b></div></div>${attributeMarkup(c, instance, { detailed: IS_DEVELOPMENT })}${!IS_DEVELOPMENT && attributes.attackBonus ? `<p>本局永久攻击力 +${num(attributes.attackBonus)}</p>` : ''}${IS_DEVELOPMENT ? publicationMarkup(c) + bindingTags(c) : ''}${effectBadgeMarkup(c)}<p class="skill-rule-label">角色技能</p><p>${esc(c.description)}</p>${retirementMarkup(c)}${advancedRules(effectRulesMarkup(c) + `<p class="inspect-note">${esc(attack.description)}</p>`)}${targeted.map(clause => `<p class="inspect-affliction">本关负面 · ${esc(clause.name)}：${esc(clause.description)}</p>`).join('')}${(instance?.deleteAfterAppearances || c.effects?.find(effect => effect.type === 'selfDelete')?.afterAppearances) ? `<p>自身删除技能：已登场 ${instance?.ticks || 0} 次，共计 ${instance?.deleteAfterAppearances || c.effects.find(effect => effect.type === 'selfDelete').afterAppearances} 次后，在本次全部结算结束时删除自身。</p>` : ''}${instance?.status ? `<p>上次状态：${instance.status === 'consumed' ? '已删除，未参与攻击' : '结算后已删除'}。</p>` : ''}${advancedRules(powerBreakdownMarkup(instance) + unitEffectsMarkup(instance), '上次效果与攻击力构成')}` };
  }
  if (kind === 'synergy') {
    const s = getSynergies(game).find(entry => entry.id === anchor.dataset.id);
    if (!s) return null;
    const members = [...new Set(game.roster.map(unit => unit.id))].map(char).filter(c => c && c[s.kind] === s.tag);
    const seen = new Set(game.board.filter(unit => unit && char(unit.id)?.[s.kind] === s.tag).map(unit => unit.id)).size;
    const traces = (game.lastSpin.effects || []).filter(event => event.sourceId === s.id);
    return { title: s.name, bodyHtml: `${s.style ? `<p class="synergy-style">${esc(s.style)}</p>` : ''}<p>${esc(s.description)}</p>${effectBadgeMarkup(s)}<div class="inspect-thresholds">${s.thresholds.map(t => `<span class="${s.count >= t ? 'active' : ''}">${t} 人 ${s.count >= t ? '✓ 已激活' : '未达成'}</span>`).join('')}</div><p>编队 ${s.count} 个不同身份 · ${s.active ? `第 ${s.tier} 档已激活，触发还需满足效果条件` : '尚未激活'}。</p><p class="inspect-note">${members.map(c => esc(c.name)).join('、') || '编队尚无符合条件的角色'}。重复副本与星级不重复计数；技能创建的角色同样参与。</p>${advancedRules(synergyRulesMarkup(s), '各档效果与叠加')}${game.stats.spins ? `<p class="inspect-note">${esc(snapshotTitle(game))}：匹配登场 ${seen} 个不同角色身份，${traces.length ? `${traces.length} 条效果记录` : '没有此羁绊的触发记录'}。这不是下一次的触发保证。</p>` : ''}` };
  }
  if (kind === 'item' || kind === 'essence') {
    const c = kind === 'item' ? item(anchor.dataset.id) : essence(anchor.dataset.id);
    if (!c) return null;
    const owned = kind === 'essence' ? game.essences.find(e => e.id === c.id) : null;
    return { title: c.name, bodyHtml: `${curioArt(c, kind === 'essence')}${effectBadgeMarkup(c)}<p>${esc(c.description)}</p>${advancedRules(effectRulesMarkup(c), '生效与叠加规则')}<p class="inspect-note">${kind === 'item' ? '取得时的即时奖励只领取一次；持有被动按各自条件触发，无需点击使用。' : owned ? owned.triggered ? '已达成条件。一次性奖励不会重复领取；本局持续效果继续按规则生效。' : `当前蓄能 ${num(owned.progress)} / ${c.target}，尚未解锁效果。` : '取得后开始积累对应条件；解锁前不会获得后续被动。'}</p>` };
  }
  if (kind === 'debuff') {
    const clause = (game.activeDebuffs || []).find(entry => entry.id === anchor.dataset.id);
    return clause ? { title: clause.name, bodyHtml: `<span class="effect-chip duration-encounter">本关负面</span><p>${esc(clause.description)}</p>${clause.id === 'synergy_audit' ? '<p class="inspect-note">征收作用于羁绊的攻击力加值与追加攻击伤害，不放大或削减羁绊的资源、治疗、护盾、控制与触发次数。</p>' : ''}<dl class="debuff-lifetime"><div><dt>持续</dt><dd>当前关卡，过关后移除或重新配置</dd></div><div><dt>触发</dt><dd>每次转动按条款条件重新检查；不是永久削减角色属性</dd></div><div><dt>叠加</dt><dd>同名条款不重复追加；不同条款可共同作用</dd></div></dl><p class="inspect-note">${clause.source === 'boss' ? '首领阶段追加' : '难度条款'} · ${clause.addedRound === 0 ? '入场时配置' : `第 ${clause.addedRound} 次转动时追加`}。${clause.targetUid ? '污染还可通过移除或合成被标记实例提前解除。' : ''}</p>` } : null;
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
  if (IS_DEVELOPMENT && !document.querySelector('.mechanic-hint')) {
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
  return `<header class="site-header"><a class="brand" href="${IS_PORTABLE ? '#app' : './'}" aria-label="星穹转轮首页"><span class="brand-mark">${icon('cube')}</span><span><b>星穹转轮</b><small>ASTRAL REELS</small></span></a><nav aria-label="主导航"><button data-action="play" class="nav-button ${!dialog ? 'active' : ''}">${IS_DEVELOPMENT ? '转轮实验室' : '游戏'}</button><button data-action="catalog" class="nav-button ${dialog === 'catalog' ? 'active' : ''}">图鉴</button><button data-action="help" class="nav-button">帮助</button>${IS_DEVELOPMENT ? '<button data-action="aiLab" class="nav-button">AI 试验台</button>' : ''}</nav><div class="header-actions"><span class="version-label">${IS_DEVELOPMENT ? '开发版 · ' : ''}v${GAME_VERSION}</span><button class="icon-button" data-action="sound" aria-label="${settings.sound ? '关闭音效' : '开启音效'}" title="${settings.sound ? '关闭音效' : '开启音效'}">${icon(settings.sound ? 'sound' : 'mute')}</button><button class="icon-button" data-action="settings" aria-label="游戏设置">${icon('settings')}</button></div></header>`;
}
function leftPanel() {
  const synergy = getSynergies(game);
  const active = synergy.filter(s => s.active);
  const preview = [...active, ...synergy.filter(s => !s.active && s.count > 0)].slice(0, 7);
  if (!IS_DEVELOPMENT) return `<aside class="left-panel"><section class="panel dossier"><div class="panel-heading"><h2>旅程</h2><span class="difficulty-badge" data-inspect="mechanic" data-key="difficulty" data-inspect-click="true" tabindex="0">D${game.difficulty}</span></div><p>第 ${game.floor} 关 / ${game.endless ? '无尽' : '12'}</p><div class="player-toolbar"><button class="button ghost" data-action="roster">编队 · ${game.roster.length}</button><button class="button ghost" data-action="new">新旅程</button></div></section><section class="panel synergy-panel"><div class="panel-heading"><h2>羁绊</h2><span class="count-badge">${active.length} 激活</span></div><div class="synergy-list">${preview.slice(0, 4).map(entry => `<button class="synergy ${entry.active ? 'on' : ''}" data-action="synergy" data-id="${esc(entry.id)}"><span class="synergy-name"><b>${esc(entry.name)}</b></span><span class="synergy-count">${entry.count}<small>/${entry.thresholds.find(value => value > entry.count) || entry.thresholds.at(-1)}</small></span></button>`).join('')}</div><button class="all-synergies" data-action="synergies">全部羁绊 ${icon('chevron')}</button></section>${archetypePanel()}</aside>`;
  return `<aside class="left-panel"><section class="panel dossier"><div class="panel-heading"><h2>开拓档案</h2><span class="tiny-label">TRAILBLAZER</span></div><div class="difficulty-badge" data-inspect="mechanic" data-key="difficulty" data-inspect-click="true" tabindex="0">难度 <b>D${game.difficulty}</b> <span>?</span></div><div class="floor-display"><span class="orbital-ring">${icon('cube')}</span><div><span class="eyebrow">模拟宇宙 · 关卡进度</span><strong>第 ${String(game.floor).padStart(2, '0')} 关<small> / ${game.endless ? '∞' : '12'}</small></strong></div></div><div class="segmented-progress" aria-label="已到第 ${game.floor} 关">${Array.from({ length: 12 }, (_, i) => `<i class="${i < Math.min(game.floor, 12) ? 'filled' : ''}"></i>`).join('')}</div><div class="health-stat"><div><span>${icon('heart')}开拓生命</span><b>${num(game.hp)} <small>/ ${num(game.maxHp)}</small></b></div><div class="meter "><i style="width:${Math.min(100, Math.max(0, game.hp / game.maxHp * 100))}%"></i></div></div><div class="supply-credits"><span>${icon('coins')}补给信用点</span><b>${num(game.coins)}</b></div><div class="small-stats"><div><span>${icon('shield')}护盾</span><b>${num(game.shield)}</b></div><div><span>${icon('rotate')}重掷</span><b>${num(game.rerolls)}</b></div><div><span>${icon('trash')}移除</span><b>${num(game.removals)}</b></div></div><button class="button ghost full" data-action="new">${icon('rotate')}开启新旅程</button></section><section class="panel synergy-panel"><div class="panel-heading"><h2>羁绊共鸣</h2><span class="count-badge">${active.length} 激活</span></div><p class="muted panel-intro">激活门槛看编队，实际触发看登场与条件。</p><div class="synergy-list">${preview.map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon(s.kind === 'faction' ? 'users' : s.kind === 'element' ? 'bolt' : 'star')}</span><span class="synergy-name"><b>${esc(s.name)}</b>${s.style ? `<em class="synergy-style">${esc(s.style)}</em>` : ''}<small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.find(t => t > s.count) || s.thresholds.at(-1)}</small></span></button>`).join('') || '<p class="muted">招募角色后解锁羁绊。</p>'}</div><p class="panel-note">按不同角色身份激活 · 具体收益取决于触发条件</p><button class="all-synergies" data-action="synergies">查看全部羁绊 ${icon('chevron')}</button></section>${archetypePanel()}<button class="panel roster-link" data-action="roster"><span class="round-icon">${icon('users')}</span><span><b>我的编队</b><small>${game.roster.length} 位角色 · 三合一自动升星</small></span>${icon('chevron')}</button></aside>`;
}
function debuffPanel() {
  const clauses = game.activeDebuffs || [];
  if (!IS_DEVELOPMENT && !clauses.length) return '';
  const recent = clauses.filter(clause => clause.source === 'boss' && clause.addedRound === game.round && game.round > 0);
  return `<div class="debuff-panel" aria-label="当前敌方负面条款"><div class="debuff-heading"><b>敌方条款</b><span>${game.bossStage ? `首领阶段 ${game.bossStage} / 3` : `难度 D${game.difficulty}`}</span></div>${recent.length ? `<p class="new-clause-notice" role="status">⚠ 首领阶段推进 · 新增 ${recent.map(clause => esc(clause.name)).join('、')}</p>` : ''}${clauses.length ? `<div class="debuff-list">${clauses.map(clause => `<button type="button" class="debuff-chip ${clause.source === 'boss' ? 'boss-clause' : ''}" data-inspect="debuff" data-inspect-click="true" data-id="${esc(clause.id)}" aria-label="查看${esc(clause.name)}条款说明">${clause.source === 'boss' ? '⚠ ' : ''}${esc(clause.name)}${clause.targetName ? ` · ${esc(clause.targetName)}` : ''} <span>?</span></button>`).join('')}</div>` : '<p>当前没有额外负面条款。</p>'}${IS_DEVELOPMENT ? '<small>点名称查看效果 · 首领阶段推进会追加条款</small>' : ''}</div>`;
}
function enemies() {
  const view = combatPreview || game;
  const skill = view.enemySkill || view.modifier;
  const skillText = typeof skill === 'string' ? skill : skill?.description || skill?.name;
  return `<div class="enemy-formation" aria-label="五列敌方阵型">${Array.from({ length: 5 }, (_, col) => {
    const enemy = view.enemies.find(e => e.col === col && e.hp > 0);
    return `<div data-enemy-col="${col}" class="enemy-slot ${enemy?.boss ? 'boss' : ''} ${enemy ? '' : 'empty'}"><span class="lane-label">${['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][col]}${enemy?.boss ? ' · BOSS' : ''}</span>${enemy ? `<img class="enemy-art" src="${assetUrl(`./public/assets/enemies/${enemyArt(enemy)}.svg`)}" alt="${esc(enemy.name)}"/><span class="enemy-name">${esc(enemy.name)}</span><div class="enemy-health"><i style="width:${Math.max(0, enemy.hp / enemy.maxHp * 100)}%"></i></div><span class="enemy-hp">${num(enemy.hp)} <small>/ ${num(enemy.maxHp)}</small></span><span class="enemy-intent" title="敌方每回合伤害">${icon('bolt')} ${enemy.attack}</span>` : `<div class="clear-lane">${icon('star')}<span>空列</span></div>`}</div>`;
  }).join('')}</div><div class="enemy-rule">${icon('shield')}<span>${esc(skillText || '敌方行动：转轮结算后反击，清空所有敌人即可进入下一层。')}</span><b>预计反击 ${num(view.enemyIntent?.damage)} · ${view.spinsLeft} 回合</b></div>${debuffPanel()}`;
}
function board() {
  const view = combatPreview || game;
  return `<div class="reel-frame ${rolling ? 'is-spinning' : ''}"><div class="frame-corner tl"></div><div class="frame-corner tr"></div><div class="frame-corner bl"></div><div class="frame-corner br"></div><div class="reel-grid" aria-label="五列四行转轮">${view.board.map((symbol, index) => {
    if (!symbol) return `<div class="reel-cell blank" data-cell="${index}" style="--delay:${index % 5 * 55}ms"><span>✧</span><small>待同行</small></div>`;
    const c = char(symbol.id);
    const afflicted = (view.activeDebuffs || []).some(clause => clause.targetUid && clause.targetUid === symbol.uid);
    if (!c) return `<div class="reel-cell blank" data-cell="${index}"></div>`;
    const attributes = getCharacterAttributes(symbol, view);
    const role = characterRole(c);
    const display = num(attributes.attack);
    return `<button data-cell="${index}" class="reel-cell rarity-${c.rarity} ${symbol.stars > 1 ? 'upgraded' : ''} ${afflicted ? 'afflicted' : ''}" data-action="character" data-id="${esc(symbol.uid)}" style="--char-color:${c.color || '#b1a2e7'};--delay:${index % 5 * 55}ms" aria-label="${esc(c.name)} ${symbol.stars}星 ${esc(role)} 当前攻击力${display} 默认${attackNames[attributes.normalAttack.pattern]} ${esc(normalAttackSummary(attributes.normalAttack))}"><span class="cell-stars">${stars(symbol.stars)}</span>${afflicted ? '<span class="cell-affliction">污染</span>' : ''}<img src="${portrait(c)}" alt="" draggable="false"/><span class="cell-bottom"><b>${esc(c.name)}</b><span>${attackNames[attributes.normalAttack.pattern]} · ${esc(role)}</span></span><span class="cell-power">${display}</span></button>`;
  }).join('')}</div></div>`;
}
function effectStatusPanel() {
  const growth = game.roster.reduce((sum, unit) => sum + getCharacterAttributes(unit, game).attackBonus, 0);
  if (!IS_DEVELOPMENT) return `<section class="player-summary" aria-label="上次转动结果">${game.stats.spins ? `<span>伤害 <b>${num(game.lastSpin.damage)}</b></span><span>治疗 <b>${num(game.lastSpin.healing)}</b></span><span>获得护盾 <b>${num(game.lastSpin.shield)}</b></span>` : '<span>选择补给或启动转轮，开始战斗。</span>'}${game.overclockReady ? '<span>超频就绪 · 下次伤害 +20%</span>' : ''}<button class="text-button" data-action="effects">效果与记录</button></section>`;
  return `<section class="effect-status" aria-label="效果状态"><div><b>效果状态</b><button data-action="effects">查看明细 ${icon('chevron')}</button></div><p><span class="effect-chip duration-run">本局永久</span> 编队本局永久攻击力合计 +${num(growth)} <span class="effect-chip duration-whileOwned">持有来源</span> ${game.items.length} 奇物 · ${game.essences.filter(e => e.triggered).length} 已解锁精华</p>${game.overclockReady ? '<p><span class="effect-chip duration-nextSpin">待生效</span> 超频：造成伤害提高20% · 下次转动后消耗</p>' : ''}<small>${esc(snapshotTitle(game))} · 格中数字为当前卡面攻击力；所有角色均有默认攻击，结算增益另列</small></section>`;
}
function effectsDialog() {
  const growth = game.roster.filter(unit => getCharacterAttributes(unit, game).attackBonus > 0);
  const sources = [...game.items.map(id => ({ kind: 'item', value: item(id) })), ...game.essences.filter(e => e.triggered).map(e => ({ kind: 'essence', value: essence(e.id) }))].filter(entry => entry.value);
  const events = game.lastSpin.effects || [];
  return modal('效果明细', `<div class="effect-ledger"><section><h3><span class="effect-chip duration-run">本局永久</span> 本局永久属性</h3>${growth.length ? `<ul>${growth.map(unit => `<li><b>${esc(char(unit.id)?.name)} ${stars(unit.stars)}</b><span>${esc(trainingSummary(char(unit.id), getCharacterAttributes(unit, game).attackBonus))}</span></li>`).join('')}</ul>` : '<p>尚未获得本局永久攻击力提升。</p>'}<small>永久攻击力随具体实例保留，合成时相加且不再乘星级；所有角色直接获得同一属性加值。默认攻击倍率、治疗、护盾和追加攻击倍率分别配置。移除实例后失去。</small></section><section><h3><span class="effect-chip duration-whileOwned">持有期间</span> 奇物与已解锁精华</h3>${sources.length ? `<div class="effect-source-list">${sources.map(({kind,value}) => `<button data-action="${kind}" data-id="${esc(value.id)}">${curioArt(value, kind === 'essence')}<span>${esc(value.name)}${effectBadgeMarkup(value)}</span>${icon('chevron')}</button>`).join('')}</div>` : '<p>尚无持有来源。</p>'}<small>有些来源取得时只结算一次；点名称查看各条被动的生效条件。</small></section><section><h3><span class="effect-chip duration-nextSpin">待生效</span> 下一次转动</h3><p>${game.overclockReady ? '超频补给：角色造成伤害提高20%，下一次转动结算后消耗。' : '当前没有等待消耗的超频。'}</p></section><section><h3><span class="effect-chip duration-encounter">本关负面</span> 敌方条款</h3>${debuffPanel()}</section><section class="historical-effects"><h3>${esc(snapshotTitle(game))}</h3><p>以下是历史结算记录（含紧随其后的入关事件，以各条时点为准）。标为“本次转动”的效果随该次结算结束，下次重新检查条件。</p>${events.length ? `<ul class="effect-event-list">${events.map(effectEventMarkup).join('')}</ul>` : '<p>尚无可展开的效果记录。旧版存档会在下次转动后生成新记录。</p>'}</section></div>`, '', {eyebrow:'EFFECT TIMELINE',subtitle:'持续中的来源、待用效果与上次结算分别查看。'});
}
function mainPanel() {
  const view = combatPreview || game;
  const total = view.lastSpin?.damage || 0;
  return `<section class="main-panel">${IS_DEVELOPMENT ? `<div class="mission-heading"><div><span class="eyebrow"><i class="live-dot"></i>SIMULATED UNIVERSE</span><h1>让命运，再转一圈<span>。</span></h1><p>招募角色 · 收集奇物 · 构筑你的开拓之路</p></div><button class="button ghost difficulty-change" data-action="new">难度 D${view.difficulty} · 新开局</button></div>` : `<div class="player-header"><h1>第 ${view.floor} 关${view.enemies.some(enemy => enemy.boss) ? ' · 首领' : ''}</h1><span>D${view.difficulty} · 剩余 ${view.spinsLeft} 次转动</span></div><div class="player-status" role="group" aria-label="当前资源">${[['hp','生命',`${num(view.hp)} / ${num(view.maxHp)}`],['shield','护盾',num(view.shield)],['credits','信用点',num(view.coins)],['rerolls','重掷',num(view.rerolls)],['removals','移除',num(view.removals)]].map(([key,label,value]) => `<button data-inspect="mechanic" data-inspect-click="true" data-key="${key}"><span>${label}</span><b>${value}</b></button>`).join('')}</div><div class="player-toolbar"><button class="button ghost" data-action="roster">编队 · ${view.roster.length}</button><button class="button ghost" data-action="synergies">羁绊</button><button class="button ghost" data-action="supplies">补给</button><button class="button ghost" data-action="inventory">奇物与精华</button></div>`}<section class="arena panel" aria-busy="${busy}" data-combat-stage="${rolling ? 'rolling' : combatPreview ? 'landed' : 'idle'}"><div class="arena-heading"><span>${icon('bolt')} 遭遇战<b>${String(view.floor).padStart(2, '0')}</b></span><span class="tiny-label">ROUND ${String(view.round).padStart(2, '0')} <i>·</i> 5 × 4 REELS</span><span class="mobile-combat-hud" role="group" aria-label="生命 ${num(view.hp)}，护盾 ${num(view.shield)}"><span data-inspect="mechanic" data-key="hp" data-inspect-click="true" tabindex="0">${icon('heart')}${num(view.hp)}</span><span data-inspect="mechanic" data-key="shield" data-inspect-click="true" tabindex="0">${icon('shield')}${num(view.shield)}</span></span></div>${enemies()}${IS_DEVELOPMENT || busy ? `<div class="combat-status" role="status">${busy ? rolling ? '转轮启动 · 命运交汇' : '转轮落位 · 战技准备' : '战技待命 · 星轨已连接'}</div>` : ''}<div class="lane-connectors">${Array.from({ length: 5 }, () => '<span></span>').join('')}</div>${board()}<div class="board-caption"><span>${icon('users')}从 ${view.roster.length} 位编队成员中随机上场</span><button data-action="help">攻击规则 ${icon('chevron')}</button></div>${effectStatusPanel()}<div class="spin-controls"><div class="last-total"><span>上次总伤害</span><strong data-combat-total>${num(total)}<small> DMG</small></strong></div><button class="spin-button" data-action="spin" ${busy || view.phase !== 'ready' ? 'disabled' : ''}>${icon('rotate')}<span>${busy ? '命运转动中…' : view.phase === 'ready' ? '启动转轮' : isReward() ? '选择本轮奖励' : '旅程已结算'}<small>${busy ? '角色正在行动' : IS_DEVELOPMENT ? 'SPIN THE REELS' : `剩余 ${view.spinsLeft} 次转动`}</small></span>${icon('arrow')}</button></div><div class="arena-footnote"><span class="keyboard-key">SPACE</span> 也可以按空格转动 <span class="save-status">${saveAvailable ? '✓ 自动保存' : '当前页面保存'}</span></div><div class="combat-fx-layer" aria-hidden="true"></div></section>${IS_DEVELOPMENT ? `<div class="below-arena"><span>${icon('star')}每一次转动，都是一种可能。</span><button data-action="help">第一次开拓？阅读玩法手册 ${icon('arrow')}</button></div>` : ''}</section>`;
}
function supplyPanel() {
  const access = game.resourceAccess || {};
  const note = access.credits === false ? '本局信用点消费已禁用' : (game.supplyPurchases || 0) >= 2 ? '本关购买已用完 · 新关重置' : '准备转动时购买 · 超频不会叠加';
  return `<section class="panel supplies-panel"><div class="panel-heading"><h2>信用点补给</h2><span class="count-badge">${game.supplyPurchases || 0} / 2 本关</span></div><p class="panel-intro muted">${note}</p><div class="supply-options">${Object.entries(SUPPLIES).map(([kind, supply]) => {
    const benefit = kind === 'repair' ? game.hp < game.maxHp : kind === 'barrier' ? game.shield < game.maxHp * 2 : !game.overclockReady;
    const usable = game.phase === 'ready' && !busy && access.credits !== false && (kind === 'overclock' || access.defense !== false) && (game.supplyPurchases || 0) < 2 && game.coins >= supply.cost && benefit;
    return `<div class="supply-option"><button type="button" class="supply-description" data-inspect="mechanic" data-inspect-click="true" data-key="${supply.key}" aria-label="查看${supply.name}说明"><b>${supply.name} ?</b><small>${supply.description}</small></button><button class="button ghost supply-buy" data-action="supply" data-kind="${kind}" aria-label="花 ${supply.cost} 信用点购买${supply.name}" ${usable ? '' : 'disabled'}>${supply.cost} 信用点</button></div>`;
  }).join('')}</div>${game.overclockReady ? '<p class="overclock-status">✓ 超频就绪 · 下轮造成伤害提高20%</p>' : ''}</section>`;
}
function rightPanel() {
  if (!IS_DEVELOPMENT) return '';
  return `<aside class="right-panel">${IS_DEVELOPMENT ? developerTools?.panel() || '' : ''}${supplyPanel()}<section class="panel curios-panel"><div class="panel-heading"><h2>奇物收藏</h2><span class="count-badge">${game.items.length}</span></div><p class="muted panel-intro">一些小小的东西，改变整个宇宙。</p>${game.items.length ? `<div class="curio-list">${game.items.map(id => { const c = item(id); return c ? `<button class="curio" data-action="item" data-id="${esc(id)}">${curioArt(c)}<span><b>${esc(c.name)}</b>${effectBadgeMarkup(c)}<small>${esc(c.description)}</small></span>${icon('chevron')}</button>` : ''; }).join('')}</div>` : `<div class="empty-collection"><div class="curio-orbit">${icon('cube')}<i>✧</i></div><b>等待一次奇遇</b><p>每完成两层后<br/>选择一件奇物，强化你的构筑</p></div>`}</section><section class="panel essence-panel"><div class="panel-heading"><h2>奇物精华</h2><span class="tiny-label">ESSENCE</span></div>${game.essences.length ? game.essences.map(e => { const c = essence(e.id); return c ? `<button class="essence ${e.triggered ? 'triggered' : ''}" data-action="essence" data-id="${esc(e.id)}">${curioArt(c, true)}<div><b>${esc(c.name)}</b>${effectBadgeMarkup(c)}<p>${e.triggered ? '已解锁 · 按各条效果规则生效' : esc(c.description)}</p><small>${e.triggered ? 'ACTIVATED' : `蓄能 ${e.progress || 0}${c.target ? ` / ${c.target}` : ''}`}</small></div></button>` : ''; }).join('') : `<div class="essence-empty"><span>✦</span><p>深入宇宙，发现精华<br/><small>达成条件后触发强力效果</small></p></div>`}</section><section class="panel log-panel"><div class="panel-heading"><h2>战斗记录</h2><span class="record-dot"></span></div><div class="combat-log" aria-live="polite">${(game.history?.length ? game.history : game.lastSpin?.events?.length ? game.lastSpin.events : ['列车已抵达。角色集结完毕。', '启动转轮，开始你的第一场开拓。']).slice(-6).reverse().map((event, i) => `<p class="${i === 0 ? 'latest' : ''}"><span>${i === 0 ? '◆' : '·'}</span>${esc(event)}</p>`).join('')}</div></section><div class="seed-label">UNIVERSE SEED <b>${esc(game.seed)}</b></div></aside>`;
}
function modal(title, body, footer = '', options = {}) {
  const blocking = options.reward || options.blocking || options.close === false;
  const panel = `<section data-modal-key="${esc(options.key || dialog || game.phase)}" class="modal ${blocking ? '' : 'utility-panel'} ${options.wide ? 'wide' : ''} ${options.reward ? 'reward-modal' : ''}" role="dialog" ${blocking ? 'aria-modal="true"' : 'aria-modal="false"'} aria-labelledby="dialog-title">${options.close === false ? '' : `<button class="icon-button modal-close" data-action="close" aria-label="关闭面板">${icon('cross')}</button>`}<div class="modal-heading"><span class="eyebrow">${IS_DEVELOPMENT ? esc(options.eyebrow || 'ASTRAL ARCHIVE') : ''}</span><h2 id="dialog-title">${title}</h2>${options.subtitle ? `<p>${options.subtitle}</p>` : ''}</div>${body}${footer ? `<div class="modal-footer">${footer}</div>` : ''}</section>`;
  return blocking ? `<div class="modal-backdrop">${panel}</div>` : panel;
}
function characterCard(c, symbol = null, button = '') {
  const targeted = (game.activeDebuffs || []).filter(clause => clause.targetUid && clause.targetUid === symbol?.uid);
  if (!IS_DEVELOPMENT) return `<article class="character-card player-card rarity-${c.rarity} ${targeted.length ? 'afflicted-card' : ''}"><div class="portrait-stage" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}" tabindex="0" style="--char-color:${c.color || '#b6a0e6'}"><span class="rarity-label">${rarityNames[c.rarity]}</span><img src="${portrait(c)}" alt="${esc(c.name)}"/><span class="portrait-stars">${stars(symbol?.stars || 1)}</span></div><div class="card-copy"><h3>${esc(c.name)}</h3><div class="character-tags"><span>${esc(c.element)}</span><span>${esc(c.path)}</span><span>${esc(c.faction)}</span><span>${esc(characterRole(c))}</span></div>${attributeMarkup(c, symbol)}${effectBadgeMarkup(c)}<button type="button" class="skill-description" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}"><span>${esc(c.description)}</span><small>技能详情</small></button>${retirementRulesFor(c.id).length ? '<p class="commission-label">有剧情委派 · 详情查看规则</p>' : ''}${targeted.length ? `<p class="affliction-label">⚠ ${targeted.map(clause => esc(clause.name)).join('、')}</p>` : ''}${button}</div></article>`;
  return `<article class="character-card rarity-${c.rarity} ${targeted.length ? 'afflicted-card' : ''}"><div class="portrait-stage" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}" tabindex="0" style="--char-color:${c.color || '#b6a0e6'}"><span class="rarity-label">${rarityNames[c.rarity]}</span><img src="${portrait(c)}" alt="${esc(c.name)}"/><span class="portrait-stars">${symbol ? stars(symbol.stars) : '★'}</span></div><div class="card-copy"><span class="eyebrow">${esc(c.enName || c.path)}</span><h3>${esc(c.name)}</h3><div class="character-tags"><span>${esc(c.element)}</span><span>${esc(c.path)}</span><span>${esc(characterRole(c))}</span></div>${attributeMarkup(c, symbol)}${publicationMarkup(c)}${bindingTags(c)}${archetypeTags(c)}${retirementRulesFor(c.id).length ? '<p class="commission-label">剧情委派配合 · 点技能查看</p>' : ''}${effectBadgeMarkup(c)}<button type="button" class="skill-description" data-inspect="character" data-inspect-click="true" data-id="${esc(symbol?.uid || '')}" data-character-id="${esc(c.id)}"><span>${esc(c.description)}</span><small>生效与叠加规则 ?</small></button>${bindingTargetsMarkup(c)}${targeted.length ? `<p class="affliction-label">⚠ ${targeted.map(clause => esc(clause.name)).join('、')} · 本实例</p>` : ''}${button}</div></article>`;
}
function rewardDialog() {
  const recruit = game.phase === 'recruit';
  const collection = recruit ? CHARACTERS : game.phase === 'item' ? ITEMS : ESSENCES;
  const titles = { recruit: '选择角色', item: '选择奇物', essence: '选择精华' };
  const options = game.choices.map((id, index) => {
    const c = collection.find(c => c.id === id);
    if (!c) return '';
    const pick = `${IS_DEVELOPMENT ? `<div class="ai-recommendation" data-ai-index="${index}" data-inspect="mechanic" data-key="aiProbability" tabindex="0">${developerTools?.recommendationMarkup(index) || ''}</div>` : ''}<button class="button primary full" data-action="choose" data-index="${index}">${recruit ? '招募' : game.phase === 'essence' ? '选择精华' : '选择奇物'} ${icon('arrow')}</button>`;
    return recruit ? characterCard(c, null, pick) : `<article class="item-card rarity-${c.rarity || 'rare'}"><div class="large-curio-icon" data-inspect="${game.phase === 'essence' ? 'essence' : 'item'}" data-inspect-click="true" data-id="${esc(c.id)}" tabindex="0">${curioArt(c, game.phase === 'essence')}</div><span class="eyebrow">${game.phase === 'essence' ? 'ESSENCE' : rarityNames[c.rarity]}</span><h3>${esc(c.name)}</h3>${effectBadgeMarkup(c)}<button type="button" class="skill-description" data-inspect="${game.phase === 'essence' ? 'essence' : 'item'}" data-inspect-click="true" data-id="${esc(c.id)}"><span>${esc(c.description)}</span><small>生效与叠加规则 ?</small></button>${pick}</article>`;
  }).join('');
  const skipAdvice = IS_DEVELOPMENT ? `<div class="ai-recommendation ai-skip-recommendation" data-ai-index="${game.choices.length}" data-inspect="mechanic" data-key="aiProbability" data-inspect-click="true" tabindex="0" role="button" aria-label="查看${recruit ? '暂不招募' : '跳过奖励'}的 AI 推荐说明">${developerTools?.recommendationMarkup(game.choices.length) || ''}</div>` : '';
  const rerollAllowed = game.resourceAccess?.rerolls !== false && (game.rerolls > 0 || (game.resourceAccess?.credits !== false && game.coins >= 8));
  return modal(titles[game.phase], `${rewardMechanics()}${game.activeDebuffs?.length ? debuffPanel() : ''}<div class="reward-cards">${options}</div>${skipAdvice}${IS_DEVELOPMENT ? `<p class="ai-choice-caption">${game.choices.length} 张奖励与跳过的推荐率合计 100% · 自动试玩按同一概率抽样</p>` : ''}`, `<button class="button ghost reward-reroll-button" data-action="reroll" ${rerollAllowed ? '' : 'disabled'}>${icon('rotate')}重新发现 <span class="count-badge">${game.resourceAccess?.rerolls === false ? '已禁用' : game.rerolls > 0 ? `${game.rerolls} 次免费` : game.resourceAccess?.credits === false ? '付费禁用' : '8 信用点'}</span></button>${IS_DEVELOPMENT ? `<button class="button ghost ai-autoplay-toggle" data-action="aiAutoplay">${developerTools?.autoplay ? '停止 AI' : 'AI 代打'}</button>` : ''}<button class="button ghost reward-skip-button" data-action="skip">${recruit ? '暂不招募' : '跳过奖励'} ${icon('arrow')}</button>`, { close: false, wide: true, reward: true, eyebrow: `DISCOVERY · ${recruit ? '角色招募' : game.phase === 'item' ? '奇物奖励' : '精华奖励'}`, subtitle: recruit ? '选择一位加入编队。同角色同星级凑齐 3 位后，自动升星。' : '选择一件，让你的构筑走向新的可能。' });
}
function rewardMechanics() {
  const entries = [
    ...(IS_DEVELOPMENT ? [['difficulty', '难度', `D${game.difficulty}`], ['floor', '关卡', `第 ${game.floor} 关`]] : []),
    ['hp', '生命', num(game.hp)], ['credits', '信用点', num(game.coins)], ['shield', '护盾', num(game.shield)],
    ['rerolls', '重掷', num(game.rerolls)], ['removals', '移除', num(game.removals)],
    ...(IS_DEVELOPMENT ? [['synergy', '羁绊', `${getSynergies(game).filter(entry => entry.active).length} 激活`]] : []),
    ['round', '剩余转动', `${game.spinsLeft} 次`],
  ];
  return `<div class="reward-mechanics" role="group" aria-label="当前状态与机制说明">${entries.map(([key,label,value]) => `<button type="button" class="reward-mechanic" data-inspect="mechanic" data-inspect-click="true" data-key="${key}" aria-label="查看${esc(mechanicExplanation(key,game)?.title || label)}说明"><span>${label}<i aria-hidden="true">?</i></span><b>${value}</b></button>`).join('')}</div>`;
}
function helpDialog() {
  return modal('找到配合，构筑你的队伍。', `<div class="help-grid"><article><span class="step-number">01</span><h3>转动与招募</h3><p>编队随机填入5×4转轮，每轮最多抽取20名角色。结算后选择角色或跳过，也可重掷候选。编队越大，关键成员越难同时登场。</p></article><article><span class="step-number">02</span><h3>每张卡都有默认攻击</h3><p>默认攻击方式、攻击力、默认攻击倍率独立写在卡面。攻击角色通常有较高倍率；辅助角色逐人配置攻击倍率，并通过治疗、护盾和增幅支持队伍。</p><div class="attack-guide"><span><b>单体</b>主目标倍率</span><span><b>扩散</b>主目标与相邻倍率</span><span><b>群体</b>每个目标倍率</span></div></article><article><span class="step-number">03</span><h3>按正式标签寻找配合</h3><p>技能按命途、属性、阵营与职能寻找角色。相邻指周围八格；同行、同列、角落、边缘和空位各有玩法。</p></article><article><span class="step-number">04</span><h3>组合不同增幅</h3><p>攻击力提高、造成伤害提高、敌方受到伤害提高各自计算。同区百分比相加，跨区相乘。攻击力还能增强按自身攻击力计算的治疗与护盾；伤害增幅只增强伤害。</p></article></div><details class="advanced-rules"><summary>进阶战斗规则</summary><section class="duration-guide"><h3>卡面属性与特殊技能</h3><p>默认攻击伤害 = 当前攻击力 × 卡面对应目标倍率 × 造成伤害增幅 × 敌方受到伤害增幅，再处理敌方装甲。默认倍率已经是最终目标倍率，不会因为单体再乘300%。</p><p>追加攻击使用技能内的独立倍率；普通增伤与追加攻击专属增伤在同一造成伤害区相加。治疗与护盾分别使用自身攻击力 × 各自技能倍率 × 专用增幅，不受伤害增幅影响。</p><h3>升星与本局永久提升</h3><p>同角色同星级3合1，三星封顶。星级基础攻击力为一星的1 / 3 / 9倍；默认攻击倍率保持角色卡面配置。永久攻击力加值随实例保留，合成时三份相加，不再次乘星级。技能如提升默认倍率，会明确对应目标与百分点。</p><p>技能创建的角色遵守相同属性、强化、羁绊与合成规则。衣匠自己的技能决定它累计登场2次后，在本次全部结算结束时删除自身；合成保留最高已登场次数。相同身份只计1次羁绊人数。</p><h3>受到伤害与减伤</h3><p>敌方伤害先计算适用的比例降低，同区相加且最多降低60%；再减本次固定总减伤，固定总值最多为比例减伤后剩余伤害的45%，伤害不低于0。最后处理穿盾、护盾与生命。角色自损不属于敌方伤害。</p><h3>分清持续时间</h3><p><span class="effect-chip duration-spin">本次转动</span> 属性增幅、伤害增幅、易伤与减伤下次重新检查条件。</p><p><span class="effect-chip duration-run">本局永久</span> 指定角色的属性增加随实例与合成保留，移除后失去。</p><p><span class="effect-chip duration-whileOwned">持有期间</span> 奇物被动按条件生效；取得时的一次性奖励不会重复领取。</p><p><span class="effect-chip duration-resource">资源存量</span> 治疗、护盾与信用点获得后按资源规则使用。</p><p><span class="effect-chip duration-encounter">本关</span> 敌方条款过关后移除。<span class="effect-chip duration-nextSpin">下次转动一次</span> 超频用后消耗。</p><h3>资源与难度</h3><p>D1–D20直接选择，默认D10，一局12关。信用点可买医疗、护盾或下次超频，每关最多两次。生命归零或期限内未清场均会失败；通关可继续无尽。</p></section></details><div class="help-note">点角色、羁绊或敌人可查看完整规则。相邻指周围八格；每次转动的位置随机。</div>`, '', {wide:true,eyebrow:'TRAILBLAZER HANDBOOK'});
}
function catalogDialog() {
  return modal('图鉴', `<div class="catalog-tabs">${[['characters', '角色', recruitableCharacters.length], ['items', '奇物', ITEMS.length], ['essences', '精华', ESSENCES.length]].map(([id, label, count]) => `<button class="button ${catalogTab === id ? 'primary' : 'ghost'}" data-action="catalogTab" data-tab="${id}">${label} <small>${count}</small></button>`).join('')}</div><label class="catalog-search">搜索当前分类<input type="search" data-catalog-search value="${esc(catalogQuery)}" placeholder="名称、主职、阵营、命途或效果" autocomplete="off"/></label><p class="catalog-result-count" aria-live="polite">${catalogEntries().length} 条结果 · 点技能看生效与叠加</p><div class="catalog-grid ${catalogTab !== 'characters' ? 'item-grid' : ''}" data-catalog-results>${catalogCards()}</div>`, '', { wide: true, eyebrow: 'ASTRAL COMPENDIUM', subtitle: `${recruitableCharacters.length} 位可招募角色 · ${ITEMS.length} 件奇物 · ${ESSENCES.length} 种精华 · 位置决定技能配合。` });
}
function catalogEntries() {
  const entries = {characters:recruitableCharacters,items:ITEMS,essences:ESSENCES}[catalogTab] || [];
  const query = catalogQuery.trim().toLocaleLowerCase();
  return query ? entries.filter(c => [c.name,c.enName,c.path,c.element,c.faction,c.description,characterRole(c),c.role === 'amplifier' ? '即时增幅 即时辅助' : '',...characterBindings(c).map(group => group.name),...retirementRulesFor(c.id).map(r => `${r.name} ${r.sourceName} ${r.targetName}`),...effectRows(c).map(row=>`${row.label} ${row.duration.label} ${row.target}`)].join(' ').toLocaleLowerCase().includes(query)) : entries;
}
function catalogCards() {
  const entries = catalogEntries();
  if (!entries.length) return '<p class="catalog-no-results">没有匹配的条目，可换个关键词。</p>';
  return catalogTab === 'characters' ? entries.map(c => characterCard(c)).join('') : entries.map(c => `<button class="catalog-item" data-action="${catalogTab === 'essences' ? 'essence' : 'item'}" data-id="${esc(c.id)}" data-inspect="${catalogTab === 'essences' ? 'essence' : 'item'}" data-inspect-click="true">${curioArt(c,catalogTab === 'essences')}<span><h3>${esc(c.name)}</h3>${effectBadgeMarkup(c)}<p>${esc(c.description)}</p></span></button>`).join('');
}
function rosterDialog() {
  return modal('我的编队', `<div class="roster-meta"><span>${game.roster.length} 位角色 · 上场最多 20 位</span><span>${game.resourceAccess?.removals === false ? '移除已禁用' : `可用移除 ${game.removals} 次`}</span></div><div class="roster-grid">${game.roster.map(symbol => { const c = char(symbol.id); return c ? characterCard(c, symbol, `<button class="button ghost full" data-action="removeAsk" data-id="${esc(symbol.uid)}" ${game.resourceAccess?.removals === false || game.removals <= 0 || game.phase !== 'ready' || busy ? 'disabled' : ''}>${icon('trash')}移出编队</button>`) : ''; }).join('')}</div>`, '', { wide: true, eyebrow: 'MY CREW', subtitle: '移除会消耗 1 次机会，角色会永久离开本次旅程。奖励选择期间暂时无法手动移除。' });
}
function newDialog(){return modal('下一段旅程，从这里开始。',`<form id="new-run-form"><p class="new-combat-note">五列战斗 · 一局 12 关 · 难度随时可选，无需解锁</p><label class="input-label">本次难度 <small>D10 为默认；难度不是当前关卡</small></label><div class="difficulty-grid" role="group" aria-label="选择难度 1 至 20">${Array.from({length:20},(_,i)=>`<label class="difficulty-option"><input type="radio" name="difficulty" value="${i+1}" ${pendingDifficulty===i+1?'checked':''}/><span>D${i+1}</span></label>`).join('')}</div><details class="advanced-rules"><summary>设置宇宙种子</summary><label class="input-label" for="seed-input">宇宙种子 <small>相同规则与操作可以复现旅程</small></label><input class="seed-input" id="seed-input" name="seed" maxlength="64" value="${esc(freshSeed())}" autocomplete="off"/></details><p class="muted">开启后会替换当前旅程的自动存档。</p><button class="button primary full" type="submit">开启五列战斗 ${icon('arrow')}</button></form>`,'',{eyebrow:'A NEW JOURNEY',blocking:removedModeNotice||['victory','defeat'].includes(game.phase),close:removedModeNotice?false:true});}
function offlineLabel() {
  const state = offline.state;
  if (IS_PORTABLE) return '单文件版 · 可直接离线玩';
  if (state.ready) return state.online ? '离线已准备好' : '正在离线游玩';
  return { preparing: '正在准备离线游戏…', address: '在线试玩', unsupported: '当前浏览器仅支持在线玩', error: '离线准备未完成' }[state.phase];
}
function offlineMarkup() {
  const state = offline.state;
  if (IS_PORTABLE) return `<div class="offline-heading"><h3>单文件离线版</h3><span class="offline-state ready" role="status">全部资源已内置</span></div><p>这个文件包含完整游戏与图片${IS_DEVELOPMENT ? '，以及本地 AI 工具' : ''}，不需要账号、网络或电脑开机。安卓文件管理器中选择「用浏览器打开」，不要使用文档预览。</p><p>${saveAvailable ? '当前浏览器可以自动保存进度。移动或更换文件、浏览器后，原进度可能无法读取。' : '当前浏览器不允许自动保存；关闭文件前，请导出存档。'}</p><p>更新 HTML 前请先导出存档，再打开新版文件。导入会替换当前旅程。</p><div class="offline-actions"><button class="button ghost" data-action="saveExport">导出存档</button><button class="button ghost" data-action="saveImport" ${(IS_DEVELOPMENT && developerTools?.running) ? 'disabled' : ''}>导入存档</button><input data-save-file type="file" accept=".json,application/json,text/plain" hidden /></div>`;
  const explanation = state.phase === 'address' ? '请从正式安装网址打开，才能保存离线游戏。' : state.phase === 'unsupported' ? '请换用新版 Chrome 或 Safari，添加游戏到主屏幕。' : state.phase === 'error' ? '请联网后重试，并确认浏览器有可用存储空间。' : state.ready ? '游戏与全部素材已保存到这台设备，断网也可以继续玩。' : '首次加载请保持联网，等资源保存完成后再断网。';
  return `<div class="offline-heading"><h3>离线与安装</h3><span class="offline-state ${state.ready ? 'ready' : ''}" role="status">${offlineLabel()}</span></div><p>${explanation}</p><p>手机：浏览器菜单 → 添加到主屏幕。<br/>iPad：Safari 分享 → 添加到主屏幕。</p><p>添加后，先联网从主屏幕图标打开一次，等离线准备完成。存档各自保存在设备上；清除网站数据会删除存档和离线游戏。</p><div class="offline-actions"><button class="button ghost" data-action="saveExport">导出存档</button><button class="button ghost" data-action="saveImport">导入存档</button><input data-save-file type="file" accept=".json,application/json,text/plain" hidden/>${state.installed ? '<span class="offline-installed">✓ 已从主屏幕打开</span>' : state.installable ? '<button class="button primary" data-action="offlineInstall">添加到主屏幕</button>' : ''}${!['address','unsupported'].includes(state.phase) ? `<button class="button ghost" data-action="offlineCheck" ${!state.online || state.checking || state.updating ? 'disabled' : ''}>${state.checking ? '正在检查…' : state.phase === 'error' ? '重新准备离线游戏' : '检查更新'}</button>` : ''}${state.updateAvailable ? `<button class="button primary" data-action="offlineUpdate" ${!state.online || state.updating || (IS_DEVELOPMENT && developerTools?.running) ? 'disabled' : ''}>${state.updating ? '正在更新…' : '保存进度并更新'}</button>` : ''}</div>${state.updateAvailable ? `<p class="offline-notice">新版已下载，${(IS_DEVELOPMENT && developerTools?.running) ? '等本次实验结束后再更新。' : '选择更新时才会重新打开游戏。'}</p>` : ''}${state.updateError ? '<p class="offline-notice">这次更新未完成，可联网后再试；已保存的离线游戏仍可使用。</p>' : ''}`;
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
  return modal('按自己的节奏开拓。', `<p>更新、移动或更换 HTML 前请先导出存档；不同路径、版本或浏览器可能使用独立存储。</p><div class="settings-list"><label><span><b>轻量音效</b><small>转动与招募时播放提示音</small></span><input type="checkbox" data-setting="sound" ${settings.sound ? 'checked' : ''}/></label><label><span><b>战斗与界面动效</b><small>完整战斗少于3秒；跟随系统减少动态效果</small></span><input type="checkbox" data-setting="animations" ${settings.animations ? 'checked' : ''}/></label></div><section class="offline-panel" data-offline-panel>${offlineMarkup()}</section><div class="run-stats"><div><strong>${num(stats.runs)}</strong><span>开拓次数</span></div><div><strong>${num(stats.wins)}</strong><span>通关次数</span></div><div><strong>${num(stats.bestFloor)}</strong><span>最远关卡</span></div></div><details class="advanced-rules"><summary>旅程与版本信息</summary><p>v${GAME_VERSION} · ${IS_DEVELOPMENT ? '开发版' : '玩家版'}。宇宙种子：${esc(game.seed)}。</p><p>两版规则一致，自动存档独立；可导出后在另一版导入。</p></details><button class="button ghost full" data-action="about">关于与素材来源</button>`, `<button class="button primary" data-action="close">完成</button>`, { eyebrow: 'PREFERENCES' });
}
function endDialog() {
  const win = game.phase === 'victory';
  return modal(win ? '群星，见证了你的胜利。' : '旅程暂停，开拓永不止步。', `<div class="end-emblem ${win ? 'win' : ''}">${icon(win ? 'trophy' : 'cube')}</div><p class="end-copy">${win ? '你与角色完成了 12 关战斗，可继续挑战无尽。' : game.hp <= 0 ? `第 ${game.floor} 关生命耗尽。` : `第 ${game.floor} 关转动次数耗尽，尚余 ${game.enemies.filter(enemy => enemy.hp > 0).length} 名敌人、${num(game.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0))} 点生命。`}</p>${!win ? `<p class="help-note">${esc(game.history.at(-1))}</p>` : ''}<div class="run-stats"><div><strong>${game.floor}</strong><span>抵达关卡</span></div><div><strong>${game.stats.spins}</strong><span>转轮次数</span></div><div><strong>${game.roster.length}</strong><span>编队人数</span></div></div>`, `${win ? `<button class="button ghost" data-action="endless">继续无尽开拓 ${icon('arrow')}</button>` : ''}<button class="button primary" data-action="new">再次出发 ${icon('rotate')}</button>`, { close: false, eyebrow: win ? 'JOURNEY COMPLETE' : 'JOURNEY ENDED' });
}
function renderDialog() {
  if (dialog === 'about') return aboutDialog();
  if (dialog === 'supplies') return modal('补给', supplyPanel());
  if (dialog === 'inventory') return inventoryDialog();
  if (dialog === 'help') return helpDialog();
  if (dialog === 'catalog') return catalogDialog();
  if (dialog === 'roster') return rosterDialog();
  if (dialog === 'effects') return effectsDialog();
  if (dialog === 'new') return newDialog();
  if (dialog === 'settings') return settingsDialog();
  if (IS_DEVELOPMENT && dialog === 'aiLab') return developerTools?.labDialog() || '';
  if (dialog === 'synergies') return modal('羁绊一览', `<div class="all-synergy-grid">${getSynergies(game).map(s => `<button class="synergy ${s.active ? 'on' : ''}" data-action="synergy" data-id="${esc(s.id)}"><span class="synergy-icon">${icon('star')}</span><span class="synergy-name"><b>${esc(s.name)}</b>${s.style ? `<em class="synergy-style">${esc(s.style)}</em>` : ''}<small>${esc(s.description)}</small></span><span class="synergy-count">${s.count}<small>/${s.thresholds.join('/')}</small></span></button>`).join('')}</div>`, '', { eyebrow: 'RESONANCE ARCHIVE', subtitle: '点击查看说明；点击页面其他区域即可关闭。' });
  if (!busy && isReward()) return rewardDialog();
  if (!busy && ['victory', 'defeat'].includes(game.phase)) return endDialog();
  return '';
}
function render() {
  if (IS_DEVELOPMENT && ['victory', 'defeat'].includes(game.phase)) developerTools?.stopAutoplay();
  const previousModalKey = document.querySelector('[data-modal-key]')?.dataset.modalKey;
  app.className = IS_DEVELOPMENT ? 'development-edition' : 'play-edition';
  document.body.classList.toggle('play-edition', !IS_DEVELOPMENT);
  document.body.classList.toggle('development-edition', IS_DEVELOPMENT);
  document.body.classList.toggle('motion-disabled', !motionEnabled(settings));
  const focusAction = document.activeElement?.dataset?.action;
  const hadDialog = !!document.querySelector('.modal-backdrop');
  inspector.close();
  app.innerHTML = `${header()}<main class="game-layout">${leftPanel()}${mainPanel()}${rightPanel()}</main><footer class="site-footer"><span>星穹转轮 <i>✦</i> 一场与命运的游戏</span><span>同人游戏 · 角色素材 © HoYoverse <button class="text-button" data-action="about">关于与来源</button></span></footer>${renderDialog()}`;
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
  if (IS_DEVELOPMENT && ['victory', 'defeat'].includes(game.phase)) developerTools?.stopAutoplay();
  enterModal(previousModalKey, motionEnabled(settings));
  if (IS_DEVELOPMENT) developerTools?.requestRecommendations();
}
async function doSpin() {
  if (busy || transitioning || game.phase !== 'ready') return;
  closeUtilityOnly();
  busy = true; rolling = true; combatPreview = null;
  const before = game;
  let resolved;
  try {
    playTone(); render();
    // Tapping the lower control can leave the enemies above a phone's viewport.
    const arena = document.querySelector('.arena');
    const enemyBounds = arena.querySelector('.enemy-formation').getBoundingClientRect();
    if (enemyBounds.top < 0 || enemyBounds.bottom > innerHeight * .72) {
      arena.scrollIntoView({ block: 'start', behavior: motionEnabled(settings) ? 'smooth' : 'instant' });
    }
    const started = performance.now();
    resolved = inspectSpin(before);
    const animate = motionEnabled(settings);
    if (animate) {
      const remaining = Math.max(0, COMBAT_TIMING.roll - (performance.now() - started));
      await new Promise(resolve => setTimeout(resolve, remaining));
      rolling = false;
      combatPreview = { ...before, board: resolved.state.board, round: resolved.state.lastSpin.round,
        stats: resolved.state.stats, lastSpin: { ...resolved.state.lastSpin, damage: 0 } };
      render();
      if (motionEnabled(settings)) await playCombat({ arena: document.querySelector('.arena'),
        plan: createCombatPlan(before, resolved.state, { hits: resolved.hits, effects: resolved.effects }), elapsed: performance.now() - started });
    }
  } catch (error) {
    showToast(resolved ? '动效已跳过，本轮已正常结算。' : `本轮未能结算：${error.message}`);
  } finally {
    // A rendering failure must not strand a resolved battle or leave input locked.
    combatPreview = null; rolling = false; busy = false;
    if (resolved) adopt(resolved.state);
    render();
  }
}
async function transitionChoice(next, control) {
  if (busy || transitioning || next === game) return;
  transitioning = true;
  try {
    await leaveModal(control, motionEnabled(settings));
    adopt(next); playTone('recruit');
    // The next reward can use the same modal kind, but is a new choice screen.
    document.querySelector('[data-modal-key]')?.removeAttribute('data-modal-key');
  } finally { transitioning = false; render(); }
}

document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled || (!app.contains(control) && !control.closest('.inspect-popover'))) return;
  const action = control.dataset.action;
  if (control.dataset.inspectClick === 'true' && ['character','synergy','item','essence'].includes(action)) return;
  if (IS_DEVELOPMENT && developerTools?.handleAction(action)) return;
  if (busy || transitioning) return;
  if (action === 'spin') { try { await doSpin(); } catch (error) { busy = false; render(); showToast(`本轮未能结算：${error.message}`); } return; }
  if (action === 'saveExport') {
    try {
      const url = URL.createObjectURL(new Blob([exportSave({ game, settings, stats, ...(IS_DEVELOPMENT ? { aiProfile: developerTools?.profile } : {}) })], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = '星穹转轮-存档.json'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      showToast('已发起存档导出，请确认浏览器保存了文件。');
    } catch (error) { showToast(`存档未能导出：${error.message}`); }
    return;
  }
  if (action === 'saveImport') { if (!(IS_DEVELOPMENT && developerTools?.running)) document.querySelector('[data-save-file]')?.click(); return; }
  if (action === 'offlineInstall') { await offline.install(); return; }
  if (action === 'offlineCheck') { await offline.check(); return; }
  if (action === 'offlineUpdate') {
    if ((IS_DEVELOPMENT && developerTools?.running)) return;
    await offline.update(() => { if (!persist()) { showToast('进度未能保存，请保留当前页面，稍后再更新。'); return false; } if (IS_DEVELOPMENT) developerTools?.stopAutoplay(); return true; }); return;
  }
  if (action === 'choose' || action === 'skip') { await transitionChoice(action === 'choose' ? chooseReward(game, Number(control.dataset.index)) : skipReward(game), control); return; }
  else if (action === 'reroll') { adopt(rerollRewards(game)); playTone(); }
  else if (action === 'new') { if (IS_DEVELOPMENT) developerTools?.stopAutoplay(); pendingDifficulty = game.difficulty || 10; dialog = 'new'; }
  else if (action === 'supply') adopt(purchaseSupply(game, control.dataset.kind));
  else if (action === 'catalogTab') catalogTab = control.dataset.tab;
  else if (action === 'close' || action === 'play') { transitioning = true; try { await leaveModal(control, motionEnabled(settings)); dialog = null; } finally { transitioning = false; } }
  else if (action === 'sound') { settings.sound = !settings.sound; persist(); playTone('recruit'); }
  else if (action === 'endless') { adopt(continueEndless(game)); dialog = null; }
  else if (action === 'removeAsk') {
    const instance = game.roster.find(s => s.uid === control.dataset.id);
    inspector.open(control, { title: `移除 ${char(instance.id).name}？`, bodyHtml: `<p>消耗 1 次移除机会，永久移出当前编队。</p><button class="button primary full" data-action="removeConfirm" data-id="${esc(instance.uid)}">确认移除</button>` }); return;
  }
  else if (action === 'removeConfirm') adopt(removeSymbol(game, control.dataset.id));
  else if (['roster','help','catalog','settings','synergies','effects','about','supplies','inventory', ...(IS_DEVELOPMENT ? ['aiLab'] : [])].includes(action)) dialog = dialog === action ? null : action;
  render();
  if (action === 'supply') purchaseFeedback(control.dataset.kind, motionEnabled(settings));
});
app.addEventListener('submit', event => {
  if (event.target.id !== 'new-run-form') return;
  if (busy || transitioning) { event.preventDefault(); return; }
  event.preventDefault();
  const form = new FormData(event.target);
  game = newGame({ difficulty: Number(form.get('difficulty')) || 10, seed: String(form.get('seed') || '').trim().slice(0,64) || freshSeed() });
  if (IS_DEVELOPMENT) developerTools?.reset();
  stats.runs++; removedModeNotice = false; dialog = null; busy = false; combatPreview = null; rolling = false; persist(); render(); showToast('新的宇宙，新的可能。');
});
app.addEventListener('change', event => {
  if (IS_DEVELOPMENT) developerTools?.handleChange(event);
  if (event.target.dataset.setting) { settings[event.target.dataset.setting] = event.target.checked; document.body.classList.toggle('motion-disabled', !motionEnabled(settings)); persist(); }
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
  if (!event.target.matches('[data-save-file]')) return;
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_SAVE_BYTES) throw new Error('存档文件超过 2 MB，无法导入。');
    const importedText = await file.text();
    let decoded; try { decoded = JSON.parse(importedText); } catch {}
    if (decoded?.payload?.game?.mode === 'classic') throw Error('房租模式已移除，经营存档不能继续；请新开五列战斗。');
    const restored = importSave(importedText);
    if (busy || (IS_DEVELOPMENT && developerTools?.running)) throw new Error('请等本轮转动或实验结束后再导入。');
    if (IS_DEVELOPMENT) developerTools?.stopAutoplay();
    game = restored.game; settings = restored.settings; stats = restored.stats;
    if (IS_DEVELOPMENT) developerTools?.reset(restored.aiProfile);
    combatPreview = null; rolling = false; dialog = null;
    const saved = persist(); render(); showToast(saved ? '已恢复存档，继续这段旅程。' : '已恢复当前旅程；关闭文件前请导出存档。');
  } catch (error) { showToast(`未导入存档：${error.message}`); }
  finally { input.value = ''; }
});
document.addEventListener('keydown', event => {
  if (busy || transitioning) return;
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

if (globalThis.__ASTRAL_DEVELOPMENT_BUILD__ ?? IS_DEVELOPMENT) import('./developer-tools.js').then(({ createDeveloperTools }) => {
  developerTools = createDeveloperTools({
    get game() { return game; }, get busy() { return busy; }, get transitioning() { return transitioning; }, get dialog() { return dialog; },
    inspector, freshSeed, percentage, num, esc, modal, decorateInspectors, render, showToast, isReward, doSpin, adopt, transitionChoice,
  });
  render();
}).catch(() => showToast('开发工具未能加载，请重新打开开发版。'));

function aboutDialog() {
  return modal('关于与素材来源', `<p>星穹转轮 v${GAME_VERSION} · ${IS_DEVELOPMENT ? '开发版' : '玩家版'}。星穹铁道主题的转轮构筑同人游戏，非官方作品。</p><p>角色名称与形象归原权利方所有，角色素材 © HoYoverse；第三方头像不属于本项目原创素材。技能、奇物与剧情委派规则为本作改编。</p><p>角色头像与奇物图片来自开源资料项目 StarRailRes，采用固定来源快照；完整逐文件来源、许可与校验记录保存在项目 docs/ASSETS.md 及 public 素材清单。</p><p><a href="https://github.com/Mar-7th/StarRailRes" target="_blank" rel="noreferrer">StarRailRes 素材来源 ↗</a> · <a href="https://github.com/jjhe2020/starrail-landlord" target="_blank" rel="noreferrer">项目与详细归属记录 ↗</a></p><details class="advanced-rules"><summary>角色改编说明</summary>${CHARACTERS.filter(c => c.publicationStatus === 'announced' || c.publicationStatus === 'adapted-aeon' || c.portraitKind === 'shared-source').map(c => `<div><b>${esc(c.name)}</b>${publicationMarkup(c)}</div>`).join('')}</details>`, '', { wide: true });
}
function inventoryDialog() {
  return modal('奇物与精华', `<h3>奇物 · ${game.items.length}</h3><div class="curio-list">${game.items.map(id => { const c = item(id); return c ? `<button class="curio" data-action="item" data-id="${esc(id)}">${curioArt(c)}<span><b>${esc(c.name)}</b><small>${esc(c.description)}</small></span></button>` : ''; }).join('') || '<p>每完成两关可选择一件奇物。</p>'}</div><h3>精华 · ${game.essences.length}</h3>${game.essences.map(entry => { const c = essence(entry.id); return c ? `<button class="essence" data-action="essence" data-id="${esc(c.id)}">${curioArt(c, true)}<span><b>${esc(c.name)}</b><p>${entry.triggered ? '已解锁' : `蓄能 ${num(entry.progress)} / ${c.target}`}</p></span></button>` : ''; }).join('') || '<p>每完成三关可选择一种精华。</p>'}`, '', { wide: true });
}
