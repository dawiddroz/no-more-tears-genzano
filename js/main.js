/* No More Tears — main.js (vanilla: nav, status live, carousel, sticky CTA, cookie) */
(function () {
  'use strict';

  /* Nav toggle */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Nav scrolled */
  var nav = document.getElementById('nav');
  if (nav) {
    var onNavScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* Status LIVE — orari reali (confermati dal titolare 06/08): Lun-Ven 09-19, Sab 11-19, Dom chiuso */
  var HOURS = [null, [9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [11, 19]]; // 0=Dom..6=Sab
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var pill = document.getElementById('statusPill');
  var pillText = document.getElementById('statusText');
  var heroStatus = document.getElementById('heroStatus');
  var heroText = document.getElementById('heroStatusText');

  function fmtHM(h) { return String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0'); }

  function updateStatus() {
    var now = new Date();
    var day = now.getDay();
    var mins = now.getHours() + now.getMinutes() / 60;
    var today = HOURS[day];
    var openNow = false, msg = '';

    if (today) {
      if (mins >= today[0] && mins < today[1]) {
        openNow = true;
        msg = 'Aperto ora — chiudiamo alle ' + fmtHM(today[1]);
      } else if (mins < today[0]) {
        msg = 'Apriamo oggi alle ' + fmtHM(today[0]);
      } else {
        var nx = (day + 1) % 7;
        while (!HOURS[nx]) nx = (nx + 1) % 7;
        msg = 'Chiuso — riapriamo ' + DAYS_IT[nx] + ' alle ' + fmtHM(HOURS[nx][0]);
      }
    } else {
      var next = (day + 1) % 7;
      while (!HOURS[next]) next = (next + 1) % 7;
      msg = 'Chiuso — riapriamo ' + DAYS_IT[next] + ' alle ' + fmtHM(HOURS[next][0]);
    }

    if (pill) {
      pill.classList.toggle('is-open', openNow);
      if (pillText) pillText.textContent = msg;
    }
    if (heroStatus) {
      heroStatus.classList.toggle('is-open', openNow);
      if (heroText) heroText.textContent = msg;
    }
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* Tabella orari: evidenzia oggi */
  var todayIdx = new Date().getDay();
  var todayRow = document.querySelector('.hours-table tr[data-day="' + (todayIdx === 0 ? 7 : todayIdx) + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  /* Autoplay carousel recensioni (5s, pausa hover, dots) */
  var carousel = document.getElementById('reviewCarousel');
  var track = document.getElementById('reviewTrack');
  var dotsWrap = document.getElementById('reviewDots');
  if (carousel && track && dotsWrap) {
    var slides = track.children;
    var total = slides.length;
    var idx = 0;
    var timer = null;

    for (var i = 0; i < total; i++) {
      (function (n) {
        var d = document.createElement('button');
        d.className = 'review-dot' + (n === 0 ? ' active' : '');
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', 'Recensione ' + (n + 1));
        d.addEventListener('click', function () { go(n); restart(); });
        dotsWrap.appendChild(d);
      })(i);
    }
    var dots = dotsWrap.children;

    function go(n) {
      idx = (n + total) % total;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === idx);
    }
    function next() { go(idx + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 5000);
    }
    carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    carousel.addEventListener('mouseleave', restart);
    var startX = 0;
    carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(dx < 0 ? idx + 1 : idx - 1); restart(); }
    }, { passive: true });
    restart();
  }

  /* Mobile sticky CTA: slide-in dopo 300px */
  var mCta = document.querySelector('.mobile-cta');
  if (mCta) {
    var onCtaScroll = function () { mCta.classList.toggle('visible', window.scrollY > 300); };
    window.addEventListener('scroll', onCtaScroll, { passive: true });
    onCtaScroll();
  }

  /* Cookie consent + deferred map */
  var mapWrap = document.getElementById('mapWrap');
  var banner = document.getElementById('cookieBanner');
  var ACCEPT = 'nmt_cookie_ok';
  var renderMap = function () {
    if (!mapWrap || mapWrap.querySelector('iframe')) return;
    var iframe = document.createElement('iframe');
    iframe.title = 'Mappa No More Tears';
    iframe.width = '600'; iframe.height = '280'; iframe.style.border = '0';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.src = 'https://www.google.com/maps?q=Via+Fratelli+Colabona+37+Genzano+di+Roma&output=embed';
    mapWrap.appendChild(iframe);
  };
  if (banner) {
    var decide = function (v) {
      try { localStorage.setItem(ACCEPT, v); } catch (e) {}
      banner.style.display = 'none';
      if (v === '1') renderMap();
    };
    var stored = null;
    try { stored = localStorage.getItem(ACCEPT); } catch (e) {}
    if (stored !== null) {
      banner.style.display = 'none';
      if (stored === '1') renderMap();
    } else {
      var showBanner = function () { banner.style.display = 'flex'; };
      window.addEventListener('scroll', showBanner, { passive: true, once: true });
      var t = setTimeout(showBanner, 3500);
      document.getElementById('cookieAccept').addEventListener('click', function () { clearTimeout(t); decide('1'); });
      document.getElementById('cookieDecline').addEventListener('click', function () { clearTimeout(t); decide('0'); });
    }
  }
})();
