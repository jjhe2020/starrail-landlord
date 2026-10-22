export const motionEnabled = settings => settings.animations && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden;

export function enterModal(previousKey, enabled) {
  const panel = document.querySelector('[data-modal-key]');
  if (!panel || !enabled || panel.dataset.modalKey === previousKey) return;
  panel.classList.add('modal-enter');
  const entered = event => {
    if (event.target !== panel) return;
    panel.classList.remove('modal-enter');
    panel.removeEventListener('animationend', entered);
  };
  panel.addEventListener('animationend', entered);
}

export async function leaveModal(control, enabled) {
  const panel = document.querySelector('[data-modal-key]');
  if (!panel || !enabled) return;
  // The live panel remains visible and inert until its exit finishes.
  panel.inert = true;
  panel.classList.remove('modal-enter');
  control?.closest('.character-card, .item-card')?.classList.add('choice-confirmed');
  panel.classList.add('modal-leaving');
  panel.closest('.modal-backdrop')?.classList.add('backdrop-leaving');
  await new Promise(resolve => setTimeout(resolve, 180));
}

export function purchaseFeedback(kind, enabled) {
  if (!enabled) return;
  const panel = document.querySelector('.supplies-panel');
  if (!panel) return;
  const label = document.createElement('span');
  label.className = 'purchase-feedback'; label.setAttribute('role', 'status');
  label.textContent = kind === 'barrier' ? '护盾已展开' : kind === 'repair' ? '生命已恢复' : '超频已就绪';
  panel.append(label);
  label.addEventListener('animationend', () => label.remove(), { once: true });
}
