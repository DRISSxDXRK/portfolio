/* Motion loader: GSAP + ScrollTrigger + Lenis + motion.js load ONLY after
 * the first paint, so they never block the hero. Progressive enhancement:
 * the site is fully visible without them, motion.js guards every call.
 * Skipped entirely when the user prefers reduced motion.
 * Loads in order: gsap, ScrollTrigger, Lenis, then motion.js.
 */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js',
    'motion.js'
  ];
  function load(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }
  function start() {
    var chain = Promise.resolve();
    SOURCES.forEach(function (src) {
      chain = chain.then(function () { return load(src); });
    });
  }
  function afterPaint() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      setTimeout(start, 0);
    }
  }
  if (document.readyState === 'complete') {
    afterPaint();
  } else {
    window.addEventListener('load', afterPaint);
  }
})();
