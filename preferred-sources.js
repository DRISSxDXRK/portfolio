/* Google Preferred Sources — official manual-mode integration (PR #24).
 * The site's own buttons (topbar badge, Preferred Sources panel, Contact
 * badge) keep their Combination A / 3D look, but clicking one now opens
 * Google's real add-as-preferred-source dialog for drizoeditz.pro instead
 * of showing an instructions toast. Google's library is loaded in manual
 * mode from the <head> of every page:
 *   <script async preferred-sources-control="manual"
 *           src="https://news.google.com/swg/js/v1/publisher.js"></script>
 * If the Google library fails to load (blocked, offline), the click falls
 * back to Google's deeplink, which opens the same source-preferences page
 * with drizoeditz.pro prefilled. Either way the reader picks the site in
 * their own Google account; this site cannot add itself for them.
 * Progressive enhancement only: if this file fails, the buttons simply
 * do nothing instead of breaking the page.
 */
(function () {
  'use strict';
  var DEEPLINK = 'https://www.google.com/preferences/source?q=drizoeditz.pro';

  function openFlow() {
    var ps = window.__prefSource;
    if (ps && typeof ps.addPreferredSource === 'function') {
      try {
        ps.addPreferredSource();
        return;
      } catch (e) { /* fall through to the deeplink */ }
    }
    window.open(DEEPLINK, '_blank', 'noopener');
  }

  function bind() {
    var btns = document.querySelectorAll('[data-pref-source]');
    btns.forEach(function (btn) {
      if (btn.dataset.prefBound) return;
      btn.dataset.prefBound = '1';
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        openFlow();
      });
    });
  }

  /* Register with Google's library (documented PREFERRED_SOURCE queue).
   * Runs when publisher.js loads; if it never loads, clicks use the
   * deeplink fallback above. */
  (self.PREFERRED_SOURCE = self.PREFERRED_SOURCE || []).push(
    function (preferredSource) {
      try {
        preferredSource.init({ theme: 'light', lang: 'en' });
      } catch (e) { /* init is best-effort; the dialog still works */ }
      window.__prefSource = preferredSource;
    }
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
