/* Hero showreel — Stage 1.
 * Reads window.SITE_CONFIG.showreel { src, poster }.
 * Empty src (default): the profile photo stays, nothing changes.
 * When set: the arch frame shows this muted, looping clip instead.
 * - Autoplays only when the hero is on screen (IntersectionObserver),
 *   paused off-screen, and paused when the tab is hidden.
 * - Reduced-motion or data-saver: no autoplay at all — the poster (or the
 *   profile photo, if no poster is set) is shown instead.
 * - Only one video plays at a time: playing any other video pauses this one. */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var reel = CFG.showreel || {};
  var video = document.getElementById('showreel-video');
  var photo = document.getElementById('hero-photo');
  if (!video || !photo) return;
  if (!reel.src) return; // no clip supplied yet — keep the profile photo

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  video.src = reel.src;
  if (reel.poster) video.poster = reel.poster;
  else video.poster = photo.getAttribute('src') || '';

  if (reduced || saveData) {
    // Poster only: show the video element paused on its poster frame.
    video.hidden = false;
    photo.hidden = true;
    return;
  }

  video.hidden = false;
  photo.hidden = true;

  function pauseOthers() {
    document.querySelectorAll('video').forEach(function (v) {
      if (v !== video && !v.paused) v.pause();
    });
  }
  // If a work / before-after video starts, this one stops.
  document.addEventListener('play', function (e) {
    if (e.target !== video && !video.paused) video.pause();
  }, true);

  var visible = false;
  function tryPlay() {
    if (!visible || document.hidden) return;
    pauseOthers();
    video.play().catch(function () { /* autoplay blocked: poster stays */ });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible = entry.isIntersecting;
        if (visible) tryPlay(); else video.pause();
      });
    }, { threshold: 0.25 });
    io.observe(video);
  } else {
    visible = true;
    tryPlay();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) video.pause(); else tryPlay();
  });
})();
