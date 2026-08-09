/* No More Tears — animations.js (GSAP + Lenis self-hosted) */
(function () {
  'use strict';

  /* Lenis — UNA istanza, retry-loop */
  (function initLenis() {
    if (typeof Lenis === 'undefined') {
      if (window.__lenisRetries === undefined) window.__lenisRetries = 0;
      if (++window.__lenisRetries > 40) return;
      setTimeout(initLenis, 250);
      return;
    }
    if (window.lenis) return;
    window.lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true
    });
    function raf(time) { window.lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.__lenisSynced !== true && typeof ScrollTrigger !== 'undefined') {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }
  })();

  /* GSAP init retry-loop */
  (function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      if (window.__gsapRetries === undefined) window.__gsapRetries = 0;
      if (++window.__gsapRetries > 32) return;
      setTimeout(initGSAP, 250);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    if (window.lenis && window.__lenisSynced !== true) {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }
    window.__gsapReady = true;

    /* Pre-hide sotto la fold (anti-flash senza blink) */
    gsap.set('.section-head, .review-score, .contact-card, .hours-card, .artist-card', { opacity: 0, y: 30 });

    /* Reveal con scrub (movimento legato allo scroll = VIVO) */
    gsap.utils.toArray('.section-head, .review-score, .contact-card, .hours-card, .artist-card').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 30%', scrub: 0.6 }
        }
      );
    });

    /* Gallery figures: reveal con stagger scrub */
    gsap.utils.toArray('.gallery-scroll').forEach(function (g) {
      gsap.fromTo(g.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'none',
          scrollTrigger: { trigger: g, start: 'top 88%', end: 'top 25%', scrub: 0.6 }
        }
      );
    });

    /* Studio split: parallax sottile sulla foto */
    var splitImg = document.querySelector('.split-media img');
    if (splitImg) {
      gsap.fromTo(splitImg,
        { yPercent: -5 },
        {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: '.split-media', start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    }

    ScrollTrigger.refresh();
  })();

  /* Safety net: se GSAP non parte, mostra tutto */
  setTimeout(function () {
    if (window.__gsapReady) return;
    var els = document.querySelectorAll('.section-head, .review-score, .contact-card, .hours-card, .artist-card, .gallery-scroll figure');
    for (var i = 0; i < els.length; i++) {
      els[i].style.opacity = '1';
      els[i].style.transform = 'none';
    }
  }, 4000);
})();
