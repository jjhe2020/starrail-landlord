// Installation is independent of game state; background changes never redraw the game.
import { IS_PORTABLE } from './runtime.js';

export function createOfflineSupport(onChange = () => {}) {
  if (IS_PORTABLE) {
    const state = { phase: 'portable', ready: true, online: navigator.onLine, installed: false, installable: false, updateAvailable: false, checking: false, updating: false, updateError: false };
    return { state, start() {}, async install() {}, async check() {}, async update() {} };
  }
  let registration = null;
  let installPrompt = null;
  let reloadAfterUpdate = false;
  let checking = false;
  let controllerListenerAdded = false;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const state = {
    phase: !window.isSecureContext ? 'address' : !('serviceWorker' in navigator) ? 'unsupported' : 'preparing',
    ready: false, online: navigator.onLine, installed: standalone(), installable: false,
    updateAvailable: false, checking: false, updating: false, updateError: false,
  };
  const change = patch => { Object.assign(state, patch); onChange(); };
  const askWorker = (worker, type = 'GET_OFFLINE_STATUS', timeoutMs = 5000) => new Promise(resolve => {
    if (!worker) { resolve(null); return; }
    const channel = new MessageChannel();
    const finish = value => { clearTimeout(timeout); channel.port1.close(); resolve(value); };
    const timeout = setTimeout(() => finish(null), timeoutMs);
    channel.port1.onmessage = event => finish(event.data);
    try { worker.postMessage({ type }, [channel.port2]); }
    catch { finish(null); }
  });
  async function refreshStatus() {
    const worker = navigator.serviceWorker?.controller || registration?.active;
    const status = await askWorker(worker);
    if (status?.type === 'OFFLINE_STATUS') {
      change({ ready: status.ready === true, phase: status.ready ? 'ready' : 'error',
        updateAvailable: !!registration?.waiting || !!(status.latestVersion && status.version !== status.latestVersion) });
    } else if (!state.ready && !registration?.installing) change({ phase: 'error' });
  }
  function observeWorker(worker) {
    if (!worker) return;
    const observedRegistration = registration;
    worker.addEventListener('statechange', () => {
      if (observedRegistration !== registration) return;
      if (worker.state === 'installed') change({ updateAvailable: !!registration.waiting });
      if (worker.state === 'activated') refreshStatus();
      if (worker.state === 'redundant') change(state.ready ? { updateError: true } : { phase: 'error' });
    });
  }
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; change({ installable: true });
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; change({ installed: true, installable: false }); });
  window.addEventListener('online', () => change({ online: true }));
  window.addEventListener('offline', () => change({ online: false }));
  return {
    state,
    async start() {
      if (['address', 'unsupported'].includes(state.phase)) return;
      change({ phase: 'preparing' });
      if (!controllerListenerAdded) {
        controllerListenerAdded = true;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloadAfterUpdate) { location.reload(); return; }
          refreshStatus();
        });
      }
      try {
        registration = await navigator.serviceWorker.register(new URL('../service-worker.js', import.meta.url), {
          scope: new URL('../', import.meta.url).href, updateViaCache: 'none',
        });
        registration.addEventListener('updatefound', () => observeWorker(registration.installing));
        observeWorker(registration.installing);
        change({ updateAvailable: !!registration.waiting });
        if (registration.active) await refreshStatus();
        navigator.serviceWorker.ready.then(() => refreshStatus()).catch(() => change({ phase: 'error' }));
      } catch { change({ phase: 'error' }); }
    },
    async install() {
      if (!installPrompt) return;
      const prompt = installPrompt; installPrompt = null; change({ installable: false });
      try { await prompt.prompt(); await prompt.userChoice; }
      catch { /* Browser menu installation remains available. */ }
    },
    async check() {
      if (checking || !navigator.onLine) return;
      if (!registration || (!registration.active && !registration.installing && !registration.waiting)) { await this.start(); return; }
      checking = true; change({ checking: true, updateError: false });
      try {
        await registration.update(); await refreshStatus();
        if (!state.ready && registration.active && !registration.waiting && !registration.installing) {
          change({ phase: 'preparing' });
          await askWorker(registration.active, 'REPAIR_OFFLINE_CACHE', 45000);
          await refreshStatus();
        }
      }
      catch { change({ updateError: true }); }
      finally { checking = false; change({ checking: false }); }
    },
    async update(beforeReload) {
      if (!registration || !navigator.onLine || state.updating) return;
      // Keep an in-memory-only game open if saving failed.
      if (beforeReload() === false) return;
      change({ updating: true });
      if (registration.waiting) {
        reloadAfterUpdate = true;
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // Another tab may have already activated the downloaded version.
        location.reload();
      }
    },
  };
}
