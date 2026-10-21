# 冻结实现：src/offline.js

> v0.7.0 · [复原指南](Reproduction) · [源码清单](Source-Manifest) · [机制索引](Mechanics)

本版运行、展示、构建或评测所用的精确实现。

本页是技术附录，供实现细节、遍历顺序和数值舍入的最终核对；阅读规则优先从[机制百科](Mechanics)进入。历史测量模块只是随包展示的证据/实验数据，不给角色附加技能规则。素材路径为引用及归属线索，不包含第三方图片。

- 原文件：`src/offline.js`
- 固定提交：`e5557f8d6b3ee0a0c308c5a3ca0481d3701db229`
- 原始 UTF-8 字节数：5642
- SHA-256：`1cd1be89d902d19a2b8bb5596f04660e4bf8bbecdf1885561f514c817345abb4`
- [版本源码](https://github.com/jjhe2020/starrail-landlord/blob/e5557f8d6b3ee0a0c308c5a3ca0481d3701db229/src/offline.js#L1)

<!-- frozen-source:start -->
````````````````javascript
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
````````````````
<!-- frozen-source:end -->
