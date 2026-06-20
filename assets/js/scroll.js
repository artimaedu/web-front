/* ============================================================
   Artima Edu — scroll.js
   IntersectionObserver that adds .visible to [data-reveal]
   elements as they enter the viewport. CSS handles the transition.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
});
