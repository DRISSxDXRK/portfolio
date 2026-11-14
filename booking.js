/* Stage 2 — Booking link.
 * Reads config.js bookingUrl (a Cal.com or Calendly link). Plain link,
 * no embed. While bookingUrl is empty, both "Book a 15-min call"
 * buttons stay hidden — nothing is shown and no link is invented. */
(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var url = (cfg.bookingUrl || '').trim();
  if (!url) return; // hidden by default; nothing to wire up
  ['hero-booking', 'contact-booking'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.href = url;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.hidden = false;
  });
})();
