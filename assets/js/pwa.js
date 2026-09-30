/* ============================================================
   Artima Edu — pwa.js
   Service Worker Registration & Offline / Online Connection UI
   ============================================================ */

(function () {
  'use strict';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Determine correct sw path (relative or absolute)
      const swPath = window.location.pathname.includes('/web-front/') 
        ? '/web-front/sw.js' 
        : './sw.js';

      navigator.serviceWorker
        .register(swPath)
        .then((reg) => {
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Artima PWA] New version available.');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[Artima PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 2. Toast UI for Online / Offline Status
  let toastEl = null;
  let toastTimer = null;

  function createToast() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.id = 'artima-pwa-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    toastEl.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(13, 10, 43, 0.95);
      color: #f5f5fa;
      border: 1px solid rgba(34, 211, 238, 0.4);
      border-radius: 999px;
      padding: 10px 22px;
      font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.7), 0 0 12px rgba(34, 211, 238, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
    `;
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(message, isOffline = false, duration = 4000) {
    const el = createToast();
    clearTimeout(toastTimer);

    el.innerHTML = `
      <span style="font-size: 1.1rem; line-height: 1;">${isOffline ? '🛰️' : '🚀'}</span>
      <span>${message}</span>
    `;

    if (isOffline) {
      el.style.borderColor = 'rgba(239, 68, 68, 0.6)';
      el.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.7), 0 0 12px rgba(239, 68, 68, 0.25)';
    } else {
      el.style.borderColor = 'rgba(34, 211, 238, 0.6)';
      el.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.7), 0 0 12px rgba(34, 211, 238, 0.25)';
    }

    // Trigger animation
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });

    if (duration > 0) {
      toastTimer = setTimeout(() => {
        hideToast();
      }, duration);
    }
  }

  function hideToast() {
    if (!toastEl) return;
    toastEl.style.opacity = '0';
    toastEl.style.pointerEvents = 'none';
    toastEl.style.transform = 'translateX(-50%) translateY(100px)';
  }

  window.addEventListener('offline', () => {
    showToast('Mode offline aktif — halaman tersimpan & Mini Games tetap dapat diakses.', true, 5000);
  });

  window.addEventListener('online', () => {
    showToast('Koneksi internet terhubung kembali.', false, 3000);
  });
})();
