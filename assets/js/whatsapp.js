/* ============================================================
   Artima Edu — whatsapp.js
   Maps [data-cta] keys to pre-filled WhatsApp messages (ID + EN),
   builds wa.me URLs, attaches to every [data-cta] element.
   Exposes window.renderWhatsAppLinks(lang) so i18n.js can refresh
   messages when the language toggles.
   ============================================================ */

const WA_NUMBER = '6285117000603';

/* Pre-filled messages keyed by data-cta value, in both languages */
const CTA_MESSAGES = {
  hero: {
    id: 'Halo Artima Edu, saya ingin tahu lebih banyak tentang programnya.',
    en: 'Hi Artima Edu, I would like to know more about your programs.'
  },
  philosophy: {
    id: 'Halo Artima Edu, saya mau ngobrol dengan Miss & Team.',
    en: 'Hi Artima Edu, I would like to chat with Miss & Team.'
  },
  'coding.little-coder': {
    id: 'Halo Artima Edu, saya tertarik dengan program Little Coder (4-7). Boleh info lebih lanjut?',
    en: 'Hi Artima Edu, I am interested in the Little Coder program (4-7). Could you share more info?'
  },
  'coding.junior-tech': {
    id: 'Halo Artima Edu, saya tertarik dengan program Junior Tech Creator (8-12). Boleh info lebih lanjut?',
    en: 'Hi Artima Edu, I am interested in the Junior Tech Creator program (8-12). Could you share more info?'
  },
  'coding.tech-wizard': {
    id: 'Halo Artima Edu, saya tertarik dengan program Future-Ready Tech Wizard (13-17). Boleh info lebih lanjut?',
    en: 'Hi Artima Edu, I am interested in the Future-Ready Tech Wizard program (13-17). Could you share more info?'
  },
  english: {
    id: 'Halo Artima Edu, saya tertarik dengan English Broom Room. Boleh info lebih lanjut?',
    en: 'Hi Artima Edu, I am interested in English Broom Room. Could you share more info?'
  },
  support: {
    id: 'Halo Artima Edu, saya ingin bergabung dengan WhatsApp Group untuk diskusi.',
    en: 'Hi Artima Edu, I would like to join the WhatsApp Group for discussion.'
  },
  final: {
    id: 'Halo Artima Edu, saya siap memulai petualangan! Bagaimana cara daftarnya?',
    en: 'Hi Artima Edu, I am ready to start the adventure! How do I enroll?'
  },
  floating: {
    id: 'Halo Artima Edu, saya ingin bertanya tentang programnya.',
    en: 'Hi Artima Edu, I have a question about your programs.'
  }
};

function currentLang() {
  return localStorage.getItem('artima-lang') || 'id';
}

function buildUrl(ctaKey, lang) {
  const entry = CTA_MESSAGES[ctaKey];
  if (!entry) return `https://wa.me/${WA_NUMBER}`;
  const msg = entry[lang] || entry.id;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function renderWhatsAppLinks(lang) {
  const useLang = lang || currentLang();
  document.querySelectorAll('[data-cta]').forEach((el) => {
    const key = el.getAttribute('data-cta');
    el.setAttribute('href', buildUrl(key, useLang));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

document.addEventListener('DOMContentLoaded', () => renderWhatsAppLinks(currentLang()));
