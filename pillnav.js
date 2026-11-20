/* Floating bottom pill nav.
 *
 * PR #22: the preview pill nav is STATIC — it never shrinks on scroll
 * and its white Watch my work CTA is always visible, on desktop and on
 * phones (only the non-CTA links hide under 720px, in CSS). The old
 * shrink-on-scroll morph from PR #21 is what hid the CTA, so it is
 * gone for the preview nav (#pillNav). The other pages still use the
 * old morphing nav (#pillnav); that behaviour is kept below for them.
 *
 * Glass fallback (both navs): Safari / iOS ignore url() in
 * backdrop-filter, so feature-detect and fall back to plain blur. */
(function () {
  /* Liquid-glass fallback — shared by both nav variants. */
  (function () {
    try {
      var ua = navigator.userAgent || '';
      var isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR/.test(ua);
      var ok = CSS.supports('backdrop-filter', 'url(#liquid-distort)') ||
               CSS.supports('-webkit-backdrop-filter', 'url(#liquid-distort)');
      if (isSafari || !ok) document.body.classList.add('glass-fallback');
    } catch (e) { document.body.classList.add('glass-fallback'); }
  })();

  /* --- Preview nav (#pillNav): static, CTA always visible, scroll-spy. --- */
  var previewNav = document.getElementById('pillNav');
  if (previewNav) {
    var links = Array.prototype.slice.call(previewNav.querySelectorAll('a:not(.cta)'));
    var sections = links.map(function (a) {
      return { link: a, el: document.querySelector(a.getAttribute('href')) };
    }).filter(function (s) { return s.el; });
    if ('IntersectionObserver' in window && sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          sections.forEach(function (s) {
            var on = s.el === entry.target;
            s.link.style.background = on ? 'rgba(18,20,41,.08)' : '';
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(function (s) { io.observe(s.el); });
    }
    return;
  }

  /* --- Old morphing nav (#pillnav), kept for the other 4 pages. --- */
  var nav = document.getElementById('pillnav');
  if (!nav) return;
  var row = document.getElementById('pillnav-row');
  var skin = document.getElementById('pillnav-skin');
  var navLinks = Array.prototype.slice.call(row.querySelectorAll('.pillnav-link'));
  if (!row || !skin || !navLinks.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var file = (window.location.pathname.split('/').pop() || 'index.html').split(/[?#]/)[0];
  var active = navLinks[0];
  navLinks.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === file) active = a;
    if (file === '' && href === 'index.html') active = a;
  });
  navLinks.forEach(function (a) {
    var on = a === active;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  var PAD = 8;
  var compact = false;
  var anchorY = window.scrollY || 0;

  function geometry() {
    var pad = PAD;
    try {
      var cs = window.getComputedStyle(row);
      var pl = parseFloat(cs.paddingLeft);
      if (!isNaN(pl)) pad = pl;
    } catch (e) {}
    var rowW = row.scrollWidth;
    var activeW = active.offsetWidth;
    var activeL = active.offsetLeft;
    var height = nav.offsetHeight || 52;
    var maxW = Math.max(0, window.innerWidth - 16);
    rowW = Math.min(rowW, maxW);
    return {
      expanded: { width: rowW, left: Math.max(8, (window.innerWidth - rowW) / 2), skinLeft: activeL, skinWidth: activeW, shift: 0 },
      compact: { width: activeW + pad * 2, left: Math.max(8, (window.innerWidth - (activeW + pad * 2)) / 2), skinLeft: pad, skinWidth: activeW, shift: activeL - pad },
      height: height
    };
  }

  function apply(g, snap) {
    if (snap) nav.classList.add('pillnav-snap');
    nav.style.width = g.width + 'px';
    nav.style.left = g.left + 'px';
    nav.style.height = g.height + 'px';
    nav.style.transform = 'none';
    skin.style.left = g.skinLeft + 'px';
    skin.style.width = g.skinWidth + 'px';
    row.style.transform = g.shift ? 'translateX(' + (-g.shift) + 'px)' : 'translateX(0)';
    if (snap) { void nav.offsetWidth; nav.classList.remove('pillnav-snap'); }
  }

  function setCompact(next, snap) {
    if (reduceMotion) next = false;
    if (next === compact && !snap) return;
    compact = next;
    nav.classList.toggle('is-compact', compact);
    nav.setAttribute('aria-label', compact ? 'Site pages — tap to expand' : 'Site pages');
    apply(geometry()[compact ? 'compact' : 'expanded'], snap);
  }

  setCompact(false, true);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setCompact(compact, true); });
  }
  window.addEventListener('load', function () { setCompact(compact, true); });

  if (!reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY || 0;
        if (y <= 10) { anchorY = y; setCompact(false); return; }
        if (y > anchorY + 10) { anchorY = y; setCompact(true); }
        else if (y < anchorY - 10) { anchorY = y; setCompact(false); }
      });
    }, { passive: true });
    nav.addEventListener('click', function (e) {
      if (!compact) return;
      var link = e.target.closest('a');
      if (link && link === active) { e.preventDefault(); setCompact(false); }
    });
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { setCompact(compact, true); }, 120);
  });
})();
