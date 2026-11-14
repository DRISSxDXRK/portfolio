/* Floating bottom pill nav — iOS 26 Liquid Glass shrink-on-scroll.
 *
 * Behaviour: scroll down > 10px (cumulative, jitter ignored) and the pill
 * morphs to a compact mini pill showing only the active tab; scroll up,
 * reach the top, or tap the compact pill and it springs back to full.
 *
 * Fixed technique (from the preview repair): NO scaleX/scaleY transform
 * on the skin — non-uniform scaling flattens border-radius and turns the
 * pill into a flat-sided rounded rectangle. The skin and the bar morph
 * with real geometry (left / width / height, border-radius: 999px, so the
 * ends stay perfect semicircles at every width). Labels fade/scale with
 * transform + opacity only. The inner row slides with transform only.
 * prefers-reduced-motion: the pill stays expanded, no shrink at all.
 */
(function () {
  var nav = document.getElementById('pillnav');
  if (!nav) return;
  var row = document.getElementById('pillnav-row');
  var skin = document.getElementById('pillnav-skin');
  var links = Array.prototype.slice.call(row.querySelectorAll('.pillnav-link'));
  if (!row || !skin || !links.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Active page from the URL, not from per-page markup, so every page
   * carries identical HTML and behaves identically. */
  var file = (window.location.pathname.split('/').pop() || 'index.html').split(/[?#]/)[0];
  var active = links[0];
  links.forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === file) active = a;
    if (file === '' && href === 'index.html') active = a;
  });
  links.forEach(function (a) {
    var on = a === active;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  var PAD = 8; /* row horizontal padding, px — read live below, must match style.css */
  var compact = false;
  var anchorY = window.scrollY || 0;

  function geometry() {
    /* Read the row's real padding (8px desktop, 6px on mobile) so the
     * compact skin and row shift line up exactly on every viewport. */
    var pad = PAD;
    try {
      var cs = window.getComputedStyle(row);
      var pl = parseFloat(cs.paddingLeft);
      if (!isNaN(pl)) pad = pl;
    } catch (e) { /* keep PAD */ }
    var rowW = row.scrollWidth;
    var activeW = active.offsetWidth;
    var activeL = active.offsetLeft;
    var height = nav.offsetHeight || 52;
    return {
      expanded: {
        width: rowW,
        left: Math.max(8, (window.innerWidth - rowW) / 2),
        skinLeft: activeL,
        skinWidth: activeW,
        shift: 0
      },
      compact: {
        width: activeW + pad * 2,
        left: Math.max(8, (window.innerWidth - (activeW + pad * 2)) / 2),
        skinLeft: pad,
        skinWidth: activeW,
        shift: activeL - pad
      },
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
    if (snap) {
      /* Force the snap layout before transitions are re-enabled. */
      void nav.offsetWidth;
      nav.classList.remove('pillnav-snap');
    }
  }

  function setCompact(next, snap) {
    if (reduceMotion) next = false;
    if (next === compact && !snap) return;
    compact = next;
    nav.classList.toggle('is-compact', compact);
    nav.setAttribute('aria-label', compact ? 'Site pages — tap to expand' : 'Site pages');
    apply(geometry()[compact ? 'compact' : 'expanded'], snap);
  }

  /* Initial layout: snap, no animation on load. */
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

    /* Tap the compact pill to expand it (the active link points at the
     * current page anyway, so expanding instead of navigating is right). */
    nav.addEventListener('click', function (e) {
      if (!compact) return;
      var link = e.target.closest('a');
      if (link && link === active) { e.preventDefault(); setCompact(false); }
    });
  }

  /* Re-measure on resize / font load, snapped so it does not trail. */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { setCompact(compact, true); }, 120);
  });
})();
