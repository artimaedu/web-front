/* ============================================================
   Artima Edu — scroll.js
   IntersectionObserver that adds .visible to [data-reveal]
   elements as they enter the viewport. CSS handles the transition.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* Hamburger menu toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navActions = document.querySelector('.nav-actions');

  if (navToggle && navLinks && navActions) {
    const setMenu = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navLinks.classList.toggle('active', open);
      navActions.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
      if (!open) {
        navLinks.querySelectorAll('.nav-dropdown').forEach(dropdown => {
          dropdown.classList.remove('open');
          dropdown.classList.remove('is-open');
          const toggle = dropdown.querySelector('.nav-dropdown-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      }
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Close when clicking a navigation link inside the drawer (except dropdown toggle)
    navLinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });
    // Also close after using the WhatsApp CTA inside the action row
    navActions.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Mobile dropdown accordion toggle
    navLinks.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.addEventListener('click', (e) => {
          // On mobile viewports (<= 768px), intercept click to toggle accordion
          if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');
            dropdown.classList.toggle('open', !isOpen);
            dropdown.classList.toggle('is-open', !isOpen);
            toggle.setAttribute('aria-expanded', String(!isOpen));
          }
        });
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
      }
    });

    // Close if viewport grows back to desktop
    const desktopMq = window.matchMedia('(min-width: 769px)');
    desktopMq.addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

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

  /* Back-to-top button visibility */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
 