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
    // On mobile, move .nav-actions inside .nav-links so the drawer is one
    // continuous panel. Restore on desktop. matchMedia keeps DOM in sync.
    const navParent = navActions.parentElement;
    const navAnchor = navActions.nextSibling; // remember original slot
    const mobileMq = window.matchMedia('(max-width: 768px)');

    const syncActionsLocation = () => {
      if (mobileMq.matches) {
        if (navActions.parentElement !== navLinks) navLinks.appendChild(navActions);
      } else {
        if (navActions.parentElement !== navParent) {
          navParent.insertBefore(navActions, navAnchor);
        }
      }
    };
    syncActionsLocation();
    mobileMq.addEventListener('change', syncActionsLocation);

    const setMenu = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navLinks.classList.toggle('active', open);
      navActions.classList.toggle('active', open);
      document.body.classList.toggle('nav-open', open);
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Close when clicking a link inside the drawer
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
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
