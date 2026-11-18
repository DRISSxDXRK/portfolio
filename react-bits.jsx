/* Plain JavaScript hero and card effects, adapted from react-bits.dev
 * (DavidHdev/react-bits). No framework, no transpiler, no JSX.
 * This file is loaded as a normal deferred script. It is progressive
 * enhancement ONLY:
 * - The hero h1 and kicker already exist as static HTML. This script only
 *   enhances them in place. It does not add a second headline anywhere.
 * - Spotlight glow mounts an overlay inside existing .price-card /
 *   .contact-card elements. It does not duplicate card content.
 * - If this script fails to load, the original static hero and cards
 *   remain visible and unchanged.
 * - Respects prefers-reduced-motion: SplitText chars appear without stagger,
 *   ShinyText shine is disabled by CSS, Magnetic is skipped.
 */
(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* No per-character stagger on mobile: headline must read in full
     immediately on small screens, never as "Prop" / "Edi". */
  var NO_STAGGER = REDUCED || window.matchMedia('(max-width: 960px)').matches;

  /* ---------- 1. SplitText ----------
   * Splits text into words, then chars. Each char rises in with a
   * staggered delay. Words from an <em> keep the Fir italic from the
   * original <em> in the hero headline. */
  function mountSplitText() {
    var h1 = document.getElementById('hero-title');
    if (!h1) return;
    var words = [];
    var plain = '';
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      var isEm = node.nodeType === 1 && node.tagName === 'EM';
      var text = node.textContent || '';
      plain += text;
      text.split(' ').forEach(function (w) {
        if (w) words.push({ text: w, em: isEm });
      });
    });
    var root = document.createElement('span');
    root.className = 'split-text';
    root.setAttribute('aria-label', plain.trim());
    words.forEach(function (w, i) {
      var word = document.createElement('span');
      word.className = 'split-word' + (w.em ? ' split-em' : '');
      word.setAttribute('aria-hidden', 'true');
      w.text.split('').forEach(function (ch, ci) {
        var char = document.createElement('span');
        char.className = 'split-char';
        char.style.animationDelay = NO_STAGGER ? '0s' : (0.05 + i * 0.045 + ci * 0.012) + 's';
        char.textContent = ch;
        word.appendChild(char);
      });
      root.appendChild(word);
      root.appendChild(document.createTextNode(' '));
    });
    h1.textContent = '';
    h1.appendChild(root);
  }

  /* ---------- 2. ShinyText ----------
   * A Fir shine sweep across the text, via a background-clip gradient. */
  function mountShinyText() {
    var kicker = document.getElementById('hero-kicker');
    if (!kicker) return;
    var text = kicker.textContent;
    var shine = document.createElement('span');
    shine.className = 'shiny-text';
    shine.textContent = text;
    kicker.textContent = '';
    kicker.appendChild(shine);
  }

  /* ---------- 3. SpotlightCard ----------
   * A radial glow that follows the cursor inside the card. Mounted as an
   * overlay (pointer-events: none) so it never blocks links/buttons. */
  function mountSpotlights() {
    document.querySelectorAll('.price-card, .contact-card').forEach(function (card) {
      if (card.querySelector('.spotlight-mount')) return;
      var mount = document.createElement('div');
      mount.className = 'spotlight-mount';
      mount.setAttribute('aria-hidden', 'true');
      var layer = document.createElement('div');
      layer.className = 'spotlight-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.style.opacity = '0';
      layer.style.background = 'radial-gradient(240px circle at -400px -400px, var(--spot, rgba(80,84,87,0.16)), transparent 70%)';
      mount.appendChild(layer);
      card.insertBefore(mount, card.firstChild);
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        layer.style.opacity = '1';
        layer.style.background = 'radial-gradient(240px circle at ' + x + 'px ' + y + 'px, var(--spot, rgba(80,84,87,0.16)), transparent 70%)';
      });
      card.addEventListener('mouseleave', function () {
        layer.style.opacity = '0';
      });
    });
  }

  /* ---------- Magnetic hover on primary CTAs ---------- */
  function mountMagnetic() {
    if (REDUCED) return;
    document.querySelectorAll('.hero-cta .btn-primary, .nav .btn-primary').forEach(function (btn) {
      btn.classList.add('magnetic');
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = 'translate(' + (x * 5).toFixed(1) + 'px,' + (y * 4).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  function init() {
    try { mountSplitText(); } catch (e) {}
    try { mountShinyText(); } catch (e) {}
    try { mountSpotlights(); } catch (e) {}
    try { mountMagnetic(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
