/* ============================================================
   Artima Edu — i18n.js
   Loads content.json, renders active language into [data-i18n]
   elements, manages toggle + localStorage + <html lang>.
   Falls back to Indonesian if an EN key is missing.
   ============================================================ */

const DEFAULT_LANG = 'id';
const STORAGE_KEY = 'artima-lang';

let CONTENT = null;

async function loadContent() {
  const res = await fetch('assets/js/content.json');
  CONTENT = await res.json();
}

function getLang() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
}

function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  applyLang(lang);
}

/* Resolve a dotted key path like "hero.title" against a lang object */
function resolveKey(obj, path) {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

function applyLang(lang) {
  if (!CONTENT) return;
  document.documentElement.lang = lang;
  const dict = CONTENT[lang] || CONTENT[DEFAULT_LANG];
  const fallback = CONTENT[DEFAULT_LANG];

  document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach((el) => {
    const isHtml = el.hasAttribute('data-i18n-html');
    const key = el.getAttribute(isHtml ? 'data-i18n-html' : 'data-i18n');
    const value = resolveKey(dict, key) ?? resolveKey(fallback, key);
    if (value !== undefined) {
      if (isHtml) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // Re-render WhatsApp CTAs for the new language (if whatsapp.js is loaded)
  if (typeof window.renderWhatsAppLinks === 'function') {
    window.renderWhatsAppLinks(lang);
  }

  // Re-render JSON-driven merchandise (if products.js is loaded)
  if (typeof window.renderProducts === 'function') {
    window.renderProducts(lang);
  }

  // Update the toggle button label to the OTHER language
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.textContent = lang === 'id' ? 'EN' : 'ID';
  });
}

function initToggle() {
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    // Guard against double-binding if initToggle runs more than once
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const next = getLang() === 'id' ? 'en' : 'id';
      setLang(next);
    });
  });
}

async function initI18n() {
  // Wire the toggle BEFORE the async fetch, so a content-load failure
  // can never leave the button dead. (Also makes the click responsive ASAP.)
  initToggle();
  try {
    await loadContent();
  } catch (err) {
    // Most common cause: page opened via file:// instead of http(s)://,
    // which blocks fetch() on content.json. Serve the folder, e.g.
    //   python3 -m http.server 8000
    console.error('[Artima i18n] Could not load content.json:', err);
    return;
  }
  applyLang(getLang());
}

document.addEventListener('DOMContentLoaded', initI18n);
