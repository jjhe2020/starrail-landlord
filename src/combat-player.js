// Presentation only: authoritative results come from the engine, never from animation.
export const MAX_FX_NODES = 48;

export function playCombat({ arena, plan, elapsed = 0 }) {
  if (!arena || document.hidden || typeof arena.animate !== 'function') return Promise.resolve();
  const layer = arena.querySelector('.combat-fx-layer');
  if (!layer) return Promise.resolve();
  const status = arena.querySelector('.combat-status');
  const sprites = { attack: [0, 0], shield: [100, 0], heal: [0, 100], resonance: [100, 100] };
  const nodes = new Set(), animations = new Set(), queue = [];
  const health = new Map(plan.enemies.map(enemy => [enemy.col, enemy.hp]));
  let raf, cursor = 0, ended = false, geometry, totalDamage = 0;
  const start = performance.now() - elapsed;
  const format = value => Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  const measure = () => {
    const bounds = arena.getBoundingClientRect();
    const point = element => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, width: rect.width };
    };
    geometry = {
      cells: [...arena.querySelectorAll('[data-cell]')].map(point),
      enemies: [...arena.querySelectorAll('[data-enemy-col]')].map(element => point(element.querySelector('.enemy-art') || element)),
      center: point(arena.querySelector('.reel-grid')),
      hud: point(arena.querySelector('.mobile-combat-hud')),
    };
  };
  measure();
  const resize = () => { geometry = null; };
  const setStatus = (phase, message) => {
    arena.dataset.combatStage = phase;
    if (status && status.textContent !== message) status.textContent = message;
  };
  const animate = (element, frames, duration) => {
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.18,.7,.28,1)', fill: 'both' });
    animations.add(animation);
    animation.onfinish = () => { animations.delete(animation); animation.cancel(); nodes.delete(element); element.remove(); };
    return animation;
  };
  const node = (className, point, color) => {
    if (!point || nodes.size >= MAX_FX_NODES) return null;
    const element = document.createElement('span');
    element.className = className;
    element.style.left = `${point.x}px`; element.style.top = `${point.y}px`;
    if (color) element.style.setProperty('--fx-color', color);
    layer.append(element); nodes.add(element);
    return element;
  };
  const sprite = (kind, point, size = 116) => {
    const element = node(`fx-sprite fx-${kind}`, point);
    if (!element) return;
    const [x, y] = sprites[kind] || sprites.resonance;
    element.style.backgroundPosition = `${x}% ${y}%`;
    element.style.width = element.style.height = `${size}px`;
    animate(element, [
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.35) rotate(-14deg)' },
      { opacity: .95, transform: 'translate(-50%,-50%) scale(.95) rotate(0deg)', offset: .24 },
      { opacity: 0, transform: 'translate(-50%,-50%) scale(1.18) rotate(12deg)' },
    ], 420);
  };
  const number = (text, point, color, kind = '') => {
    const element = node(`fx-number ${kind}`, point, color);
    if (!element) return;
    element.textContent = text;
    animate(element, [
      { opacity: 0, transform: 'translate(-50%,-30%) scale(.7)' },
      { opacity: 1, transform: 'translate(-50%,-70%) scale(1.08)', offset: .18 },
      { opacity: 1, transform: 'translate(-50%,-95%) scale(1)', offset: .65 },
      { opacity: 0, transform: 'translate(-50%,-140%) scale(.95)' },
    ], 420);
  };
  const beam = (from, to, color, reverse = false) => {
    if (!from || !to) return;
    const dx = to.x - from.x, dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const element = node(`fx-beam ${reverse ? 'fx-hostile' : ''}`, from, color);
    if (!element) return;
    element.style.width = `${Math.hypot(dx, dy)}px`;
    animate(element, [
      { opacity: 0, transform: `rotate(${angle}rad) scaleX(.04)` },
      { opacity: .95, transform: `rotate(${angle}rad) scaleX(.8)`, offset: .45 },
      { opacity: 0, transform: `rotate(${angle}rad) scaleX(1)` },
    ], 210);
  };
  const pulse = cell => {
    const element = arena.querySelector(`[data-cell="${cell}"]`);
    if (!element) return;
    const animation = element.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-4px) scale(1.035)', offset: .35 },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 300, easing: 'ease-out' });
    animations.add(animation);
    animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
  };
  const damage = action => {
    const hp = Math.max(0, (health.get(action.targetCol) || 0) - action.amount);
    health.set(action.targetCol, hp);
    totalDamage += action.amount;
    const total = arena.querySelector('[data-combat-total]');
    if (total) total.firstChild.textContent = format(totalDamage);
    const target = arena.querySelector(`[data-enemy-col="${action.targetCol}"]`);
    const enemy = plan.enemies.find(candidate => candidate.col === action.targetCol);
    if (target && enemy) {
      target.querySelector('.enemy-health i').style.width = `${hp / enemy.maxHp * 100}%`;
      target.querySelector('.enemy-hp').firstChild.textContent = `${format(hp)} `;
      if (hp <= .001) target.classList.add('enemy-defeated');
    }
    sprite('attack', geometry.enemies[action.targetCol], 122);
    number(`−${format(action.amount)}`, geometry.enemies[action.targetCol], action.color);
  };
  const flushImpacts = until => {
    queue.sort((a, b) => a.at - b.at);
    while (queue.length && queue[0].at <= until) queue.shift().run();
  };
  const play = action => {
    if (action.kind === 'attack') {
      setStatus('attack', action.stage === 'afterRetaliation' ? '存护反击 · 余波追击' : action.stage === 'afterAttacks' ? '追加攻击 · 星芒追击' : '协同出击 · 属性共鸣');
      const from = geometry.cells[action.sourceCell] || geometry.center;
      pulse(action.sourceCell);
      beam(from, geometry.enemies[action.targetCol], action.color);
      queue.push({ at: action.at + 130, run: () => damage(action) });
    } else if (action.kind === 'support') {
      setStatus('support', '支援展开 · 战技生效');
      const from = geometry.cells[action.sourceCell] || geometry.center;
      const to = geometry.cells[action.targetCell] || from;
      const kind = action.effect === 'shield' || action.effect === 'healOverflowShield' ? 'shield' : action.effect === 'heal' ? 'heal' : 'resonance';
      pulse(action.sourceCell);
      if (from !== to) beam(from, to, action.color);
      sprite(kind, to, Math.min(138, (to.width || 90) * 1.65));
      // Keep the source aura readable while lighting its actual recipients.
      for (const cell of action.targetCells || []) if (cell !== action.sourceCell && cell !== action.targetCell) {
        const recipient = geometry.cells[cell];
        if (recipient) { beam(from, recipient, action.color); sprite(kind, recipient, Math.min(95, recipient.width * 1.25)); }
      }
      const labels = { shield: '护盾', heal: '治疗', growth: '培养', power: '增幅', powerMultiplier: '增幅', vulnerability: '易伤', retaliationFlat: '减伤', retaliationMultiplier: '减伤', healOverflowShield: '护盾' };
      const label = labels[action.effect] || '共鸣';
      const amount = ['shield', 'heal', 'growth', 'power'].includes(action.effect) ? `${(action.targetCells?.length || 0) > 1 ? ' 合计' : ''} +${format(action.amount)}` : '';
      number(`${label}${amount}`, to, kind === 'heal' ? '#94f2c4' : kind === 'shield' ? '#a3eaff' : '#e3c2ff', 'fx-support-number');
    } else if (action.kind === 'retaliation') {
      setStatus('retaliation', plan.totals.blocked > 0 ? '敌方反击 · 护盾抵挡' : '敌方反击');
      // Incoming is already reduced by all relevant abilities in the engine.
      const surviving = plan.enemies.filter(enemy => action.targetCols.includes(enemy.col));
      for (const enemy of surviving) beam(geometry.enemies[enemy.col], geometry.center, '#ee9cab', true);
      sprite(plan.totals.blocked > 0 ? 'shield' : 'attack', geometry.center, 194);
      number(action.blocked > 0 ? `护盾抵挡 ${format(action.blocked)}` : `生命 −${format(action.hpLost)}`, geometry.center, action.blocked > 0 ? '#b9eaff' : '#ffb6c5', 'fx-support-number');
      if (action.blocked > 0 && action.hpLost > 0) number(`生命 −${format(action.hpLost)}`, { ...geometry.center, y: geometry.center.y + 32 }, '#ffb6c5', 'fx-support-number');
    }
  };
  return new Promise((resolve, reject) => {
    const finish = error => {
      if (ended) return;
      ended = true; cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('resize', resize);
      media.removeEventListener('change', preference);
      for (const animation of animations) animation.cancel();
      for (const element of nodes) element.remove();
      layer.replaceChildren();
      if (error) reject(error); else resolve();
    };
    const visibility = () => { if (document.hidden) finish(); };
    const preference = () => { if (media.matches) finish(); };
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const tick = now => {
      if (ended) return;
      try {
        const time = now - start;
        if (!geometry) measure();
        while (cursor < plan.timeline.length && plan.timeline[cursor].at <= time) {
          const action = plan.timeline[cursor++];
          flushImpacts(action.at); play(action);
        }
        flushImpacts(time);
        if (time >= plan.duration) { finish(); return; }
        raf = requestAnimationFrame(tick);
      } catch (error) { finish(error); }
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('resize', resize);
    media.addEventListener('change', preference);
    setStatus('landed', '转轮落位 · 战技准备');
    raf = requestAnimationFrame(tick);
  });
}
