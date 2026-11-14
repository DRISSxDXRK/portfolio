/* React Bits — adapted from react-bits.dev (DavidHdev/react-bits).
 * React Bits is a copy-paste component library, not an npm package, so the
 * three components below are real React implementations in that style,
 * written for this site. They are progressive enhancement ONLY:
 * - The hero h1 and kicker already exist as static HTML. React only
 *   enhances them in place (createRoot on the existing element) — it does
 *   not add a second headline anywhere.
 * - SpotlightCard mounts a glow overlay inside existing .price-card /
 *   .contact-card elements — it does not duplicate card content.
 * - If React / ReactDOM / Babel fail to load, this file never runs and the
 *   original static hero and cards remain visible and unchanged.
 * - Respects prefers-reduced-motion: SplitText chars appear without stagger,
 *   ShinyText shine is disabled by CSS, Magnetic is skipped.
 */
(function () {
  'use strict';
  if (!window.React || !window.ReactDOM) return;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Stage 2: no per-character stagger on mobile — headline must read in
     full immediately on small screens, never as "Prop" / "Edi". */
  var NO_STAGGER = REDUCED || window.matchMedia('(max-width: 960px)').matches;
  var React = window.React;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  /* ---------- 1. SplitText (react-bits.dev/text-animations/split-text) ----------
   * Splits text into words > chars, each char rises in with a staggered delay.
   * props.words: [{ text, em }] — em words keep the gold italic from the
   * original <em> in the hero headline. */
  function SplitText(props) {
    return (
      <span className="split-text" aria-label={props.plainText}>
        {props.words.map(function (w, i) {
          return (
            <React.Fragment key={i}>
              <span className={'split-word' + (w.em ? ' split-em' : '')} aria-hidden="true">
                {w.text.split('').map(function (ch, ci) {
                  return (
                    <span
                      key={ci}
                      className="split-char"
                      style={{ animationDelay: NO_STAGGER ? '0s' : (0.05 + i * 0.045 + ci * 0.012) + 's' }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
              {' '}
            </React.Fragment>
          );
        })}
      </span>
    );
  }

  /* ---------- 2. ShinyText (react-bits.dev/text-animations/shiny-text) ----------
   * A gold shine sweep across the text, via a background-clip gradient. */
  function ShinyText(props) {
    return <span className="shiny-text">{props.text}</span>;
  }

  /* ---------- 3. SpotlightCard (react-bits.dev/components/spotlight-card) ----------
   * A radial glow that follows the cursor inside the card. Mounted as an
   * overlay (pointer-events: none) so it never blocks links/buttons. */
  function SpotlightCard() {
    var ref = useRef(null);
    var pos = useState({ x: -400, y: -400, on: false });
    var state = pos[0];
    var setState = pos[1];
    useEffect(function () {
      var card = ref.current && ref.current.parentElement;
      if (!card) return;
      function move(e) {
        var r = card.getBoundingClientRect();
        setState({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
      }
      function leave() { setState(function (s) { return { x: s.x, y: s.y, on: false }; }); }
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      return function () {
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
      };
    }, []);
    return (
      <div
        ref={ref}
        className="spotlight-layer"
        aria-hidden="true"
        style={{
          opacity: state.on ? 1 : 0,
          background:
            'radial-gradient(240px circle at ' + state.x + 'px ' + state.y + 'px, var(--spot, rgba(224,197,143,0.16)), transparent 70%)'
        }}
      />
    );
  }

  /* ---------- Mount: hero headline (in place, no duplicate) ---------- */
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
    window.ReactDOM.createRoot(h1).render(
      <SplitText words={words} plainText={plain.trim()} />
    );
  }

  /* ---------- Mount: hero kicker (in place) ---------- */
  function mountShinyText() {
    var kicker = document.getElementById('hero-kicker');
    if (!kicker) return;
    var text = kicker.textContent;
    window.ReactDOM.createRoot(kicker).render(<ShinyText text={text} />);
  }

  /* ---------- Mount: SpotlightCard overlays on pricing + contact cards ---------- */
  function mountSpotlights() {
    document.querySelectorAll('.price-card, .contact-card').forEach(function (card) {
      if (card.querySelector('.spotlight-mount')) return;
      var mount = document.createElement('div');
      mount.className = 'spotlight-mount';
      mount.setAttribute('aria-hidden', 'true');
      card.insertBefore(mount, card.firstChild);
      window.ReactDOM.createRoot(mount).render(<SpotlightCard />);
    });
  }

  /* ---------- Magnetic hover on primary CTAs (React Bits-style micro-interaction) ---------- */
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
