/* ============ animations.js — GSAP + ScrollTrigger: reveal, parallax ============ */
(function () {
  'use strict';

  (function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      if (window.__gsapRetries === undefined) window.__gsapRetries = 0;
      if (++window.__gsapRetries > 32) return;
      setTimeout(initGSAP, 250);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    if (window.lenis && !window.__lenisSynced) {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }

    /* pre-hide: SEMPRE gsap.set prima dei trigger (anti-blink) */
    gsap.set('.reveal', { opacity: 0 });
    gsap.set('.reveal-line', { opacity: 0 });

    /* reveal generico */
    function reveal(selector, vars) {
      ScrollTrigger.create({
        trigger: selector,
        start: 'top 82%',
        onEnter: function () {
          gsap.fromTo(selector, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', ...vars });
        },
        onLeaveBack: function () { gsap.set(selector, { opacity: 1, y: 0 }); }
      });
    }
    reveal('.about__grid');
    reveal('.services__grid');
    reveal('.gallery__grid');
    reveal('.reviews__grid');
    reveal('.contact__grid');

    /* title reveal per riga (eyebrow + title) */
    document.querySelectorAll('.section-title').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function () {
          gsap.fromTo(el, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
        },
        onLeaveBack: function () { gsap.set(el, { opacity: 1, y: 0 }); }
      });
    });

    /* parallax sulle foto gallery */
    document.querySelectorAll('.g-item img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });

    /* parallax leggero hero (solo su schermi grandi, no mobile) */
    if (window.matchMedia('(min-width: 921px)').matches) {
      gsap.fromTo('.hero__bg', { yPercent: 0 }, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
      });
    }

    window.__gsapReady = true;
    ScrollTrigger.refresh();
  })();
})();
