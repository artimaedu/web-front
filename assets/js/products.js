/* ============================================================
   Artima Edu — products.js
   JSON-driven merchandise. Renders the product grid on
   merchandise.html and a single product on product.html?id=<slug>.

   Integration with the rest of the site:
   - Re-renders on language toggle: i18n.js calls
     window.renderProducts(lang) from applyLang(), mirroring how
     whatsapp.js exposes window.renderWhatsAppLinks.
   - Owns its [data-reveal] elements: scroll.js wires its
     IntersectionObserver on DOMContentLoaded, before this file's
     async fetch resolves — so we observe freshly rendered cards
     ourselves.
   - Builds product-specific WhatsApp URLs (name + price) directly,
     rather than going through whatsapp.js's static CTA_MESSAGES,
     because the message is dynamic per product.
   ============================================================ */

const PRODUCTS_FILE = 'assets/js/products.json';
/* WA_NUMBER is already declared in whatsapp.js (same value) */

/* ── Toggle: set to true when prices are confirmed ── */
const SHOW_PRICES = false;

let PRODUCTS = null;

/* --- helpers ------------------------------------------------ */

function currentLang() {
  return localStorage.getItem('artima-lang') || 'id';
}

/* A field in products.json is either a string or {id, en}. */
function pick(field, lang) {
  if (field === null || field === undefined) return '';
  return typeof field === 'object' ? (field[lang] || field.id || '') : field;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildProductWa(product, lang) {
  const name = pick(product.name, lang);
  const msg = lang === 'en'
    ? `Hi Artima Edu, I am interested in ${name}. Could you share more info?`
    : `Halo Artima Edu, saya tertarik dengan ${name}. Boleh info lebih lanjut?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* Observe [data-reveal] that scroll.js missed (rendered after load). */
function observeReveals(root) {
  const reveals = root.querySelectorAll('[data-reveal]:not(.visible)');
  if (!reveals.length) return;
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach(el => observer.observe(el));
}

/* --- listing page (merchandise.html) ------------------------ */

function renderProductCard(product, lang) {
  const name = escapeHtml(pick(product.name, lang));
  const tagline = escapeHtml(pick(product.tagline, lang));
  const wa = buildProductWa(product, lang);
  const priceHtml = SHOW_PRICES && product.price
    ? `<span class="price">${escapeHtml(product.price)}</span><span class="price-unit">${escapeHtml(pick(product.priceUnit, lang))}</span>`
    : '';
  return `
    <article class="card card-tier card-price-tier merch-card" data-reveal>
      <div class="merch-card-media">
        <img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy">
        <span class="age-badge age-cyan merch-age">${escapeHtml(product.age)}</span>
        <span class="merch-badge">${escapeHtml(product.badge)}</span>
      </div>
      <h3>${name}</h3>
      <p class="card-detail">${tagline}</p>
      ${priceHtml}
      <a class="btn btn-ghost btn-sm merch-view" href="product.html?id=${encodeURIComponent(product.slug)}">
        ${lang === 'en' ? 'View Details' : 'Lihat Detail'}
      </a>
    </article>
  `;
}

function renderProductList(lang) {
  const grid = document.getElementById('product-list');
  if (!grid || !PRODUCTS) return;
  const useLang = lang || currentLang();
  grid.innerHTML = PRODUCTS.map(p => renderProductCard(p, useLang)).join('');
  observeReveals(grid);
}

/* --- detail page (product.html?id=) ------------------------- */

function youtubeThumb(videoId) {
  return `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/* Facade: show thumbnail + play button; swap to iframe on first click. */
function attachVideoFacades(root) {
  root.querySelectorAll('[data-video]').forEach(facade => {
    if (facade.dataset.bound === '1') return;
    facade.dataset.bound = '1';
    facade.addEventListener('click', () => {
      const id = facade.getAttribute('data-video');
      const title = facade.getAttribute('data-title') || 'Product video';
      const wrap = facade.parentElement;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      wrap.replaceChild(iframe, facade);
    });
  });
}

function findProduct(slug) {
  return (PRODUCTS || []).find(p => p.slug === slug);
}

function renderProductDetail(lang) {
  const root = document.getElementById('product-detail');
  if (!root || !PRODUCTS) return;
  const useLang = lang || currentLang();
  const slug = new URLSearchParams(window.location.search).get('id');
  const product = findProduct(slug);

  if (!product) {
    root.innerHTML = `
      <div class="product-notfound" data-reveal>
        <h1>${useLang === 'en' ? 'Product Not Found' : 'Produk Tidak Ditemukan'}</h1>
        <p>${useLang === 'en'
          ? 'The product you are looking for is not in our galaxy.'
          : 'Produk yang Anda cari tidak ada di galaksi kami.'}</p>
        <a class="btn btn-ghost btn-sm" href="merchandise.html">
          ${useLang === 'en' ? '← Back to Merchandise' : '← Kembali ke Merchandise'}
        </a>
      </div>`;
    observeReveals(root);
    return;
  }

  const name = pick(product.name, useLang);
  const tagline = pick(product.tagline, useLang);
  const wa = buildProductWa(product, useLang);
  const askLabel = useLang === 'en' ? 'Ask on WhatsApp' : 'Tanya via WhatsApp';
  const backLabel = useLang === 'en' ? '← Back to Merchandise' : '← Kembali ke Merchandise';
  const featuresTitle = useLang === 'en' ? 'Highlights' : 'Keunggulan';
  const specsTitle = useLang === 'en' ? 'Specifications' : 'Spesifikasi';
  const descriptionTitle = useLang === 'en' ? 'Description' : 'Deskripsi';
  const priceHtml = SHOW_PRICES && product.price
    ? `<span class="price">${escapeHtml(product.price)}</span><span class="price-unit">${escapeHtml(pick(product.priceUnit, useLang))}</span>`
    : '';
  const featuresHtml = (product.features || [])
    .map(f => `<li>${escapeHtml(pick(f, useLang))}</li>`).join('');

  const specsHtml = Object.entries(product.specs || {})
    .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('');

  const descriptionHtml = (product.description || [])
    .map(p => `<p>${escapeHtml(pick(p, useLang))}</p>`).join('');

  root.innerHTML = `
    <article class="product" data-reveal>
      <a href="merchandise.html" class="blog-back product-back">${backLabel}</a>

      <div class="product-layout">
        <div class="product-gallery">
          <div class="product-hero-img">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(name)}">
          </div>
          <div class="product-badges">
            <span class="age-badge age-cyan">${escapeHtml(product.age)}</span>
            <span class="merch-badge">${escapeHtml(product.badge)}</span>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-title">${escapeHtml(name)}</h1>
          <p class="product-tagline">${escapeHtml(tagline)}</p>
          ${priceHtml}
          <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">${askLabel}</a>
        </div>
      </div>

      <div class="product-body">
        <aside class="product-specs" data-reveal>
          <h2>${specsTitle}</h2>
          <dl>${specsHtml}</dl>
        </aside>
        <section class="product-description" data-reveal>
          <h2>${descriptionTitle}</h2>
          ${descriptionHtml}
        </section>
        <section class="product-features" data-reveal>
          <h2>${featuresTitle}</h2>
          <ul>${featuresHtml}</ul>
        </section>
      </div>

      <div class="blog-cta product-cta" data-reveal>
        <p>${useLang === 'en' ? 'Interested in this product?' : 'Tertarik dengan produk ini?'}</p>
        <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener noreferrer">${askLabel}</a>
      </div>
    </article>
  `;

  document.title = `${name} — Artima Edu`;
  observeReveals(root);
}

/* --- public entry: re-render everything for a language ------ */

function renderProducts(lang) {
  renderProductList(lang);
  renderProductDetail(lang);
}
window.renderProducts = renderProducts;

/* --- init --------------------------------------------------- */

async function init() {
  const isListPage = !!document.getElementById('product-list');
  const isDetailPage = !!document.getElementById('product-detail');
  if (!isListPage && !isDetailPage) return;

  try {
    const res = await fetch(PRODUCTS_FILE);
    const data = await res.json();
    PRODUCTS = data.products;
  } catch (err) {
    // file:// access blocks fetch(); serve the folder, e.g.
    //   python3 -m http.server 8000
    console.error('[Artima products] Could not load products.json:', err);
    return;
  }
  renderProducts(currentLang());
}

document.addEventListener('DOMContentLoaded', init);
