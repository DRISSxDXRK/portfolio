/* Stage 3 — cookie-free analytics (Plausible-style), OFF by default.
 * Loads the script from config.js analytics.scriptUrl only when
 * analytics.enabled is true and a domain + scriptUrl are set. Tracks
 * clicks on elements with data-track (WhatsApp, email, Hire me, quote
 * buttons) and form submits, via window.plausible when it exists.
 * No cookies are set by this file; no banner needed. */
(function () {
  'use strict';
  var cfg = (window.SITE_CONFIG || {}).analytics || {};
  if (!cfg.enabled || !cfg.domain || !cfg.scriptUrl) return;

  function track(name) {
    if (typeof window.plausible === 'function') {
      try { window.plausible(name); } catch (e) { /* analytics must never break the page */ }
    }
  }

  var s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', cfg.domain);
  s.src = cfg.scriptUrl;
  document.head.appendChild(s);

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
    if (el) track(el.getAttribute('data-track'));
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.id) track('form-submit-' + f.id);
  });
})();
