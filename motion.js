/* Premium motion — GSAP 3.12.5 + ScrollTrigger (cdnjs) + Lenis 1.1.14 (jsDelivr).
 * Progressive enhancement only: every step is guarded. If GSAP, ScrollTrigger
 * or Lenis fail to load, this file does nothing and the site stays fully
 * visible — no static CSS hides reveal targets, all animation uses
 * gsap.from() (element starts visible, GSAP animates from a hidden state).
 * Respects prefers-reduced-motion: no smooth scroll, no reveals.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  var lenis = null;

  /* ---------- Lenis smooth scroll, wired to GSAP ticker ---------- */
  if (typeof window.Lenis !== 'undefined' && hasGsap) {
    try {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      if (hasST) lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  /* ---------- Smooth anchor scrolling for #top #work #services #about #contact ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  if (!hasGsap || !hasST) return;
  window.gsap.registerPlugin(window.ScrollTrigger);

  function reveal(selector, opts) {
    var els = window.gsap.utils.toArray(selector);
    if (!els.length) return;
    els.forEach(function (el) {
      window.gsap.from(el, Object.assign({
        y: 32, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }, opts || {}));
    });
  }

  /* Hero: kicker + h1 are animated by React Bits (SplitText / ShinyText),
   * so they are deliberately NOT animated here — no double animation. */
  /* Hero entrance is desktop-only: on mobile the sub, CTAs and portrait
     must be visible immediately in the first viewport, not faded in. */
  if (!window.matchMedia('(max-width: 960px)').matches) {
    window.gsap.from('.hero-sub', { y: 24, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' });
    window.gsap.from('.hero-cta .btn', { y: 20, opacity: 0, duration: 0.8, delay: 0.3, stagger: 0.1, ease: 'power3.out' });
    window.gsap.from('.hero-visual', { y: 28, opacity: 0, scale: 0.97, duration: 1, delay: 0.2, ease: 'power3.out' });
    window.gsap.from('.chip', { y: 16, opacity: 0, duration: 0.7, delay: 0.55, stagger: 0.15, ease: 'power3.out' });
  }

  /* Sections */
  reveal('.sec-kicker');
  reveal('.sec-title', { y: 24 });
  reveal('.services-sub, .services-note, .contact-sub');
  reveal('.price-card', { y: 36, stagger: 0.12 });
  reveal('.contact-card', { y: 28, stagger: 0.1 });
  reveal('.about-copy > *', { y: 24, stagger: 0.08 });
  reveal('.about-visual', { y: 28 });
  reveal('.filters', { y: 16 });
  reveal('.quote', { y: 28, stagger: 0.1 });
  reveal('.contact-form', { y: 28 });
  reveal('.quote-form, .quote-result', { y: 28 });

  /* ---------- Work cards: re-run after app.js render / filter ---------- */
  var cardTriggers = [];
  function animateCards() {
    cardTriggers.forEach(function (t) { try { t.kill(); } catch (e) {} });
    cardTriggers = [];
    var cards = Array.prototype.slice.call(document.querySelectorAll('#grid .card'));
    cards.forEach(function (card, i) {
      var tween = window.gsap.from(card, {
        y: 28, opacity: 0, duration: 0.7, delay: Math.min(i * 0.05, 0.4),
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 94%', once: true },
        onComplete: function () { window.gsap.set(card, { clearProps: 'all' }); }
      });
      if (tween.scrollTrigger) cardTriggers.push(tween.scrollTrigger);
    });
    if (hasST) window.ScrollTrigger.refresh();
  }

  animateCards();
  window.addEventListener('portfolio:grid-rendered', animateCards);
})();
