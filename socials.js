/* Stage 3 — extra profiles + About photo, both driven by config.js.
 * Social links render ONLY for profiles Driss fills in (empty = hidden).
 * aboutPhoto swaps the About image only when set; otherwise profile.jpg
 * stays. Nothing here invents a link or a photo. */
(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var socials = cfg.socials || {};
  var labels = { youtube: 'YouTube', tiktok: 'TikTok', behance: 'Behance', vimeo: 'Vimeo' };
  var mount = document.getElementById('social-links');
  if (mount) {
    var links = [];
    Object.keys(labels).forEach(function (key) {
      var url = (socials[key] || '').trim();
      if (url) links.push('<a href="' + url.replace(/"/g, '') + '" target="_blank" rel="noopener">' + labels[key] + '</a>');
    });
    if (links.length) mount.innerHTML = links.join(' &middot; ');
    else mount.remove();
  }
  var photo = (cfg.aboutPhoto || '').trim();
  var img = document.getElementById('about-photo');
  if (photo && img) img.src = photo;
})();
