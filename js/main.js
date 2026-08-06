/* ============ main.js — non-GSAP: hero delays, Lenis, navbar, burger, counters, map, sticky CTA, safety net ============ */
(function () {
  'use strict';

  /* ---------- Lenis — UNA istanza, own rAF loop, retry-loop ---------- */
  (function initLenis() {
    if (typeof Lenis === 'undefined') {
      if (window.__lenisRetries === undefined) window.__lenisRetries = 0;
      if (++window.__lenisRetries > 40) return;
      setTimeout(initLenis, 250);
      return;
    }
    window.lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); },
      smoothWheel: true
    });
    function raf(time) { window.lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (typeof ScrollTrigger !== 'undefined' && !window.__lenisSynced) {
      window.lenis.on('scroll', ScrollTrigger.update);
      window.__lenisSynced = true;
    }
  })();

  /* ---------- navbar scrolled state ---------- */
  var nav = document.querySelector('.nav');
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle('nav--scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- burger menu ---------- */
  var burger = document.querySelector('.nav__burger');
  var menu = document.querySelector('.nav__menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- anchor smooth scroll (Lenis aware) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.lenis) { window.lenis.scrollTo(target, { offset: -70, duration: 1.1 }); }
      else { target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ---------- counters (IntersectionObserver + rAF, zero GSAP) ---------- */
  function initCounters() {
    document.querySelectorAll('.counter').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
      var animated = false;
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !animated) {
            animated = true;
            obs.disconnect();
            var start = performance.now();
            function tick() {
              var p = Math.min((performance.now() - start) / 1800, 1);
              var v = target * (1 - Math.pow(1 - p, 3));
              el.textContent = v.toFixed(decimals) + suffix;
              if (p < 1) requestAnimationFrame(tick);
              else el.textContent = target.toFixed(decimals) + suffix;
            }
            requestAnimationFrame(tick);
          }
        });
      }, { threshold: 0.3 }).observe(el);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else { initCounters(); }

  /* ---------- today highlight in hours table ---------- */
  var dayMap = { 1: 'lunedì', 2: 'martedì', 3: 'mercoledì', 4: 'giovedì', 5: 'venerdì', 6: 'sabato', 0: 'domenica' };
  var today = dayMap[new Date().getDay()];
  document.querySelectorAll('.hours-table tr').forEach(function (tr) {
    if (tr.dataset.day === today) tr.classList.add('is-today');
  });

  /* ---------- Leaflet map ---------- */
  function initMap() {
    if (typeof L === 'undefined' || !document.getElementById('map')) return;
    var map = L.map('map', { scrollWheelZoom: false }).setView([41.7082, 12.6858], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var svgIcon = L.divIcon({
      className: '',
      html: '<svg width="34" height="44" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#E11D2E"/><circle cx="12" cy="12" r="5" fill="#0A0A0C"/></svg>',
      iconSize: [34, 44],
      iconAnchor: [17, 42]
    });
    L.marker([41.7082, 12.6858], { icon: svgIcon }).addTo(map)
      .bindPopup('<strong>No More Tears</strong><br>Tattoo &amp; Barber shop<br>Via Fratelli Colabona 37/41<br>00045 Genzano di Roma');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else { initMap(); }

  /* ---------- sticky CTA ---------- */
  var sticky = document.querySelector('.sticky-cta');
  var heroEnd = document.querySelector('.hero');
  if (sticky && heroEnd) {
    var shown = false;
    function onScrollSticky() {
      var heroBottom = heroEnd.getBoundingClientRect().bottom;
      if (heroBottom < 0 && !shown) { shown = true; sticky.classList.add('is-visible'); }
      else if (heroBottom >= 0 && shown) { shown = false; sticky.classList.remove('is-visible'); }
    }
    window.addEventListener('scroll', onScrollSticky, { passive: true });
    onScrollSticky();
  }

  /* ---------- safety net: solo se GSAP non è mai arrivato ---------- */
  setTimeout(function () {
    if (window.__gsapReady) return;
    document.querySelectorAll('.reveal, .reveal-line, .hero__badge, .hero__title .word > span, .hero__subtitle, .hero__cta, .hero__stats').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }, 4000);
})();
