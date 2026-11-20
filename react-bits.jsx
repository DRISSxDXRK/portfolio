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
    if (!h1 || h1.querySelector('.split-text')) return;
    var words = [];
    var plain = '';
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      var isEm = node.nodeType === 1 && node.tagName === 'EM';
      if (node.nodeType === 1 && node.querySelector) {
        /* An <em> may hold plain text plus a .rotator span. Keep the
           rotator as one unit, never split it into chars. */
        Array.prototype.forEach.call(node.childNodes, function (child) {
          if (child.nodeType === 1 && child.classList && child.classList.contains('rotator')) {
            plain += child.textContent || '';
            words.push({ rotator: true, node: child, em: isEm });
          } else {
            var text = child.textContent || '';
            plain += text;
            text.split(' ').forEach(function (w) {
              if (w) words.push({ text: w, em: isEm });
            });
          }
        });
        return;
      }
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
      if (w.rotator) {
        /* Rotator keeps its own word-swap animation; no char stagger. */
        word.appendChild(w.node);
        root.appendChild(word);
        root.appendChild(document.createTextNode(' '));
        return;
      }
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

  /* ---------- 1b. Marker highlight (PR #20, Midnight tint) ----------
   * .mark sweeps in when it scrolls into view. Without JS the keyword
   * stays readable with no highlight. */
  function mountMarkers() {
    var marks = document.querySelectorAll('.mark');
    if (!marks.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      marks.forEach(function (m) { m.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    marks.forEach(function (m) { io.observe(m); });
  }

  /* ---------- 1c. Strike-rotate (PR #20) ----------
   * Hero rotating word: strike line draws through it, it rotates out,
   * the next word rotates in. Static first word when reduced motion. */
  function mountRotator() {
    var rotator = document.querySelector('.rotator');
    if (!rotator || rotator.dataset.started) return;
    rotator.dataset.started = '1';
    var wordEl = rotator.querySelector('.rotator-word');
    if (!wordEl) return;
    if (REDUCED) return;
    var words = (rotator.getAttribute('data-words') || '').split('|').filter(function (w) { return w; });
    if (words.length < 2) return;
    var idx = 0;
    setInterval(function () {
      rotator.classList.add('is-out');
      setTimeout(function () {
        idx = (idx + 1) % words.length;
        wordEl.textContent = words[idx];
        rotator.classList.remove('is-out');
      }, 420);
    }, 3000);
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


  /* ---------- PR #21: Preferred Sources badge ----------
   * The badge is a real Google feature in the reader's own Google
   * account; this site cannot add itself for them. Clicking shows
   * where to pick drizoeditz.pro in Google Search preferences. No
   * ranking claim is made anywhere. */
  function mountPreferredSources() {
    var btns = document.querySelectorAll('[data-pref-source]');
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var toast = document.getElementById('pref-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'pref-toast';
          toast.className = 'pref-toast';
          toast.setAttribute('role', 'status');
          document.body.appendChild(toast);
        }
        toast.textContent = 'To add it: open Google Search, go to Preferences, then Sources, and select drizoeditz.pro as a preferred source. It is saved on your own Google account.';
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toast.classList.remove('show'); }, 5000);
      });
    });
  }

  function init() {
    try { mountSplitText(); } catch (e) {}
    try { mountMarkers(); } catch (e) {}
    try { mountRotator(); } catch (e) {}
    try { mountShinyText(); } catch (e) {}
    try { mountSpotlights(); } catch (e) {}
    try { mountMagnetic(); } catch (e) {}
    try { mountPreferredSources(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
