// A single, nonblocking explanation attached to the control being inspected.
// The caller owns the content and must escape any untrusted bodyHtml values.
let inspectorSequence = 0;

export function createInspector({ root = document, resolve, onOpen, onClose } = {}) {
  if (typeof resolve !== 'function') throw new TypeError('createInspector requires a content resolver.');
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const view = doc.defaultView;
  const id = `inspect-popover-${++inspectorSequence}`;
  let popup = null;
  let current = null;
  let pinned = false;
  let hoverTimer = null;
  let closeTimer = null;
  let holdTimer = null;
  let hold = null;
  let suppressedClick = null;
  let destroyed = false;
  const listeners = [];
  const anchorObserver = new view.MutationObserver(() => {
    if (current && !current.anchor.isConnected) close();
  });

  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    listeners.push(() => target.removeEventListener(name, handler, options));
  };
  const element = target => target?.nodeType === 1 ? target : target?.parentElement;
  const anchorFor = target => {
    const anchor = element(target)?.closest('[data-inspect]');
    return anchor && root.contains(anchor) ? anchor : null;
  };
  const insidePopup = target => !!popup && popup.contains(element(target));
  const cancelHover = () => { view.clearTimeout(hoverTimer); hoverTimer = null; };
  const cancelClose = () => { view.clearTimeout(closeTimer); closeTimer = null; };
  const cancelHold = () => { view.clearTimeout(holdTimer); holdTimer = null; hold = null; };
  const cancelTimers = () => { cancelHover(); cancelClose(); cancelHold(); };

  function close() {
    cancelTimers();
    anchorObserver.disconnect();
    if (!popup) return;
    const anchor = current.anchor;
    const descriptions = (anchor.getAttribute('aria-describedby') || '').split(/\s+/).filter(value => value && value !== id);
    if (descriptions.length) anchor.setAttribute('aria-describedby', descriptions.join(' '));
    else anchor.removeAttribute('aria-describedby');
    anchor.removeAttribute('data-inspect-open');
    if (current.expanded === null) anchor.removeAttribute('aria-expanded');
    else anchor.setAttribute('aria-expanded', current.expanded);
    popup.remove();
    popup = null;
    current = null;
    pinned = false;
    onClose?.(anchor);
  }

  function position(anchor) {
    const viewport = view.visualViewport;
    const leftEdge = viewport?.offsetLeft || 0;
    const topEdge = viewport?.offsetTop || 0;
    const width = viewport?.width || view.innerWidth;
    const height = viewport?.height || view.innerHeight;
    const margin = 12;
    const gap = 9;
    const rect = anchor.getBoundingClientRect();
    popup.style.maxWidth = `${Math.max(1, width - margin * 2)}px`;
    popup.style.maxHeight = `${Math.max(1, height - margin * 2)}px`;
    const box = popup.getBoundingClientRect();
    const minLeft = leftEdge + margin;
    const maxLeft = Math.max(minLeft, leftEdge + width - margin - box.width);
    const minTop = topEdge + margin;
    const maxTop = Math.max(minTop, topEdge + height - margin - box.height);
    const below = rect.bottom + gap;
    const above = rect.top - gap - box.height;
    // Prefer below the control, moving above when it would hide the screen edge.
    const top = below + box.height <= topEdge + height - margin ? below : above >= minTop ? above : Math.min(below, maxTop);
    popup.style.left = `${Math.min(maxLeft, Math.max(minLeft, rect.left + rect.width / 2 - box.width / 2))}px`;
    popup.style.top = `${Math.min(maxTop, Math.max(minTop, top))}px`;
    popup.dataset.placement = top === below ? 'bottom' : 'top';
    popup.style.visibility = 'visible';
  }

  function open(anchor, content, { pinned: keepOpen = true } = {}) {
    if (destroyed || !anchor?.isConnected) return false;
    const explanation = content || resolve(anchor);
    if (!explanation) return false;
    close();
    pinned = keepOpen;
    current = { anchor, expanded: anchor.getAttribute('aria-expanded') };
    popup = doc.createElement('section');
    popup.id = id;
    popup.className = 'inspect-popover';
    popup.dataset.inspector = '';
    popup.dataset.state = 'open';
    popup.dataset.kind = explanation.kind || anchor.dataset.inspect;
    popup.dataset.pinned = String(pinned);
    popup.setAttribute('role', pinned ? 'dialog' : 'tooltip');
    popup.setAttribute('aria-labelledby', `${id}-title`);
    popup.style.position = 'fixed';
    popup.style.visibility = 'hidden';
    const heading = doc.createElement('div');
    heading.className = 'inspect-heading';
    const title = doc.createElement('h3');
    title.id = `${id}-title`;
    title.className = 'inspect-title';
    title.textContent = explanation.title || '机制说明';
    heading.append(title);
    if (pinned) {
      const dismiss = doc.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'inspect-close';
      dismiss.setAttribute('aria-label', '关闭说明');
      dismiss.textContent = '×';
      dismiss.addEventListener('click', close);
      heading.append(dismiss);
    }
    const body = doc.createElement('div');
    body.className = 'inspect-body';
    body.innerHTML = explanation.bodyHtml || '';
    popup.append(heading, body);
    doc.body.append(popup);
    const describedBy = (anchor.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    describedBy.push(id);
    anchor.setAttribute('aria-describedby', describedBy.join(' '));
    anchor.setAttribute('data-inspect-open', 'true');
    if (anchor.dataset.inspectClick === 'true') anchor.setAttribute('aria-expanded', 'true');
    popup.addEventListener('pointerenter', () => { cancelClose(); cancelHover(); });
    popup.addEventListener('pointerleave', scheduleClose);
    position(anchor);
    anchorObserver.observe(doc.body, { childList: true, subtree: true });
    onOpen?.(anchor, explanation);
    return true;
  }

  function scheduleClose() {
    if (pinned) return;
    cancelClose();
    closeTimer = view.setTimeout(close, 140);
  }

  function onPointerOver(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const anchor = anchorFor(event.target);
    if (!anchor || anchor.contains(element(event.relatedTarget))) return;
    cancelClose();
    cancelHover();
    if (current?.anchor === anchor) return;
    hoverTimer = view.setTimeout(() => open(anchor, undefined, { pinned: false }), 160);
  }

  function onPointerOut(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const anchor = anchorFor(event.target);
    if (!anchor || anchor.contains(element(event.relatedTarget))) return;
    cancelHover();
    if (insidePopup(event.relatedTarget)) return;
    if (current?.anchor === anchor) scheduleClose();
  }

  function onPointerDown(event) {
    // A fresh interaction cannot accidentally inherit a previous long press.
    suppressedClick = null;
    cancelTimers();
    if (insidePopup(event.target)) return;
    close();
    const anchor = anchorFor(event.target);
    if (!anchor || !['touch', 'pen'].includes(event.pointerType) || event.isPrimary === false) return;
    hold = { anchor, pointerId: event.pointerId, x: event.clientX, y: event.clientY, shown: false };
    holdTimer = view.setTimeout(() => {
      const pressed = hold;
      if (!pressed || !pressed.anchor.isConnected) return;
      // open() cleans all timers; restore just the active gesture for pointerup.
      if (open(pressed.anchor, undefined, { pinned: true })) {
        pressed.shown = true;
        hold = pressed;
        suppressedClick = { anchor: pressed.anchor, until: Date.now() + 1500 };
      }
    }, 450);
  }

  function onPointerMove(event) {
    if (!hold || event.pointerId !== hold.pointerId) return;
    if (Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 10) {
      const shown = hold.shown;
      if (shown) close();
      cancelHold();
      if (!shown) suppressedClick = null;
    }
  }

  function onPointerUp(event) {
    if (!hold || event.pointerId !== hold.pointerId) return;
    if (hold.shown) suppressedClick = { anchor: hold.anchor, until: Date.now() + 900 };
    cancelHold();
  }

  function onClickCapture(event) {
    const target = element(event.target);
    if (suppressedClick && suppressedClick.until >= Date.now() && suppressedClick.anchor.contains(target) && event.detail !== 0) {
      suppressedClick = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    suppressedClick = null;
    if (!insidePopup(target)) close();
  }

  function onClick(event) {
    const anchor = anchorFor(event.target);
    if (anchor?.dataset.inspectClick === 'true') open(anchor);
  }

  function onFocusIn(event) {
    if (insidePopup(event.target)) { cancelClose(); return; }
    const anchor = anchorFor(event.target);
    // Touch focus must not open a tooltip before the long-press threshold.
    if (hold || current?.anchor === anchor) return;
    if (!anchor) { close(); return; }
    open(anchor, undefined, { pinned: false });
  }

  function onFocusOut(event) {
    if (insidePopup(event.relatedTarget) || current?.anchor?.contains(element(event.relatedTarget))) return;
    if (!pinned) scheduleClose();
  }

  function onPageMotion(event) {
    if (insidePopup(event.target)) return;
    suppressedClick = null;
    close();
  }

  listen(root, 'pointerover', onPointerOver);
  listen(root, 'pointerout', onPointerOut);
  listen(doc, 'pointerdown', onPointerDown, true);
  listen(doc, 'pointermove', onPointerMove, { passive: true });
  listen(doc, 'pointerup', onPointerUp, true);
  listen(doc, 'pointercancel', () => { cancelHold(); suppressedClick = null; }, true);
  listen(doc, 'click', onClickCapture, true);
  listen(root, 'click', onClick);
  listen(root, 'focusin', onFocusIn);
  listen(root, 'focusout', onFocusOut);
  listen(doc, 'keydown', event => {
    const anchor = anchorFor(event.target);
    const nativeControl = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element(event.target)?.tagName);
    if ((event.key === 'Enter' || event.code === 'Space') && anchor?.dataset.inspectClick === 'true' && !nativeControl && !anchor.dataset.action) {
      event.preventDefault();
      event.stopPropagation();
      open(anchor);
    }
    else if (event.key === 'Escape' && popup) {
      close();
      event.preventDefault();
      event.stopPropagation();
    }
    else if (!insidePopup(event.target) && event.key !== 'Tab') close();
  }, true);
  listen(root, 'contextmenu', event => { if (anchorFor(event.target)) event.preventDefault(); });
  listen(doc, 'scroll', onPageMotion, true);
  listen(doc, 'wheel', onPageMotion, { passive: true });
  listen(view, 'resize', close);
  listen(view, 'blur', close);
  if (view.visualViewport) {
    listen(view.visualViewport, 'resize', close);
    listen(view.visualViewport, 'scroll', close);
  }

  return {
    open,
    close,
    isOpen: () => !!popup,
    destroy() {
      close();
      suppressedClick = null;
      destroyed = true;
      listeners.forEach(remove => remove());
    },
  };
}
