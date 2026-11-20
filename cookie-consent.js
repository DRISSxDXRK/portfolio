/* Cookie consent — PR #26.
 * The site uses Google Analytics 4 (G-3NFKERL15E) and Microsoft Clarity
 * (zfaspp2gkl, including session recordings). Neither is loaded until the
 * visitor clicks Accept. This file is loaded synchronously in the <head> of
 * every page so the consent defaults are set before any tracking could run.
 *
 * How it works:
 *  - Google Consent Mode v2 defaults are set to denied for every storage
 *    type before anything else. No GA4 or Clarity script is in the page
 *    HTML any more; both are injected from here, only on Accept.
 *  - The choice is remembered in localStorage ('drizo-cookie-consent'):
 *    'accepted' or 'declined'. The banner only appears when there is no
 *    stored choice, or when the visitor re-opens it via the "Cookie
 *    settings" link in the footer.
 *  - Accept: consent updated to granted (analytics only; ad storage stays
 *    denied), then the GA4 and Clarity scripts are injected.
 *  - Decline: nothing is loaded, ever, for that visit. If tracking was
 *    already loaded in this session (visitor accepted, then changed their
 *    mind via Cookie settings), consent is set back to denied, Clarity is
 *    told to stop, and the analytics cookies are deleted as far as the
 *    browser allows. The already-injected script tags cannot be unloaded,
 *    but they stop sending further data.
 * If this file fails to load, no tracking loads at all — the page still
 * works, the banner just never appears.
 */
(function () {
  'use strict';

  var GA_ID = 'G-3NFKERL15E';
  var CLARITY_ID = 'zfaspp2gkl';
  var STORE_KEY = 'drizo-cookie-consent';
  var trackingLoaded = false;

  /* --- Google Consent Mode v2: everything denied by default --- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function storeRead() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function storeWrite(value) {
    try { window.localStorage.setItem(STORE_KEY, value); } catch (e) { /* private mode: choice lasts for this visit only */ }
  }

  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
    return s;
  }

  function loadTracking() {
    if (trackingLoaded) return;
    trackingLoaded = true;
    /* Consent Mode: grant analytics storage only. Ad storage stays denied. */
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID, function () {
      gtag('js', new Date());
      gtag('config', GA_ID);
    });
    /* Microsoft Clarity (includes session recordings). */
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function deleteCookie(name, domain) {
    var expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = name + '=;' + expires + ';path=/';
    if (domain) document.cookie = name + '=;' + expires + ';path=/;domain=' + domain;
  }
  function revokeTracking() {
    /* Stop any further GA4 collection. */
    try { gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (e) { /* never break the page */ }
    /* Tell Clarity to stop recording. */
    try { if (typeof window.clarity === 'function') window.clarity('consent', false); } catch (e) { /* never break the page */ }
    /* Delete the analytics cookies this site can delete. HttpOnly or
       third-party cookies set by Google/Microsoft themselves cannot be
       removed from here; denying consent stops them being used further. */
    var host = '';
    try { host = (window.location && window.location.hostname) || ''; } catch (e) { host = ''; }
    var parentDomain = host.indexOf('.') !== -1 ? '.' + host.split('.').slice(-2).join('.') : '';
    var names = ['_ga', '_gid', '_gat', '_gac', '_gcl_au', '_clck', '_clsk', 'CLID', '_cltk'];
    names.forEach(function (n) { deleteCookie(n); if (parentDomain) deleteCookie(n, parentDomain); });
    try {
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('_ga_') === 0 || name.indexOf('_cl') === 0) {
          deleteCookie(name);
          if (parentDomain) deleteCookie(name, parentDomain);
        }
      });
    } catch (e) { /* never break the page */ }
  }

  function banner() { return document.getElementById('cookieBanner'); }
  function showBanner() {
    var b = banner();
    if (!b) return;
    b.hidden = false;
    document.body.classList.add('cookie-banner-visible');
  }
  function hideBanner() {
    var b = banner();
    if (b) b.hidden = true;
    document.body.classList.remove('cookie-banner-visible');
  }

  function accept() {
    storeWrite('accepted');
    hideBanner();
    loadTracking();
  }
  function decline() {
    storeWrite('declined');
    hideBanner();
    if (trackingLoaded) revokeTracking();
  }

  /* Public handle, used by the footer "Cookie settings" link. */
  window.DrizoCookieConsent = { accept: accept, decline: decline, show: showBanner };

  /* If the visitor already accepted on an earlier visit, load tracking
     straight away and never show the banner. If they declined, load
     nothing. If there is no stored choice, the banner appears once the
     page body exists. */
  if (storeRead() === 'accepted') {
    loadTracking();
  }

  function bind() {
    var b = banner();
    if (!b) return;
    var acceptBtn = b.querySelector('[data-cookie-accept]');
    var declineBtn = b.querySelector('[data-cookie-decline]');
    if (acceptBtn) acceptBtn.addEventListener('click', accept);
    if (declineBtn) declineBtn.addEventListener('click', decline);
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        showBanner();
      });
    });
    if (storeRead() !== 'accepted' && storeRead() !== 'declined') showBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
