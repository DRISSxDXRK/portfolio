/* PR #22 — Instant quote calculator, preview layout.
 * Pricing uses ONLY the site's existing published rates:
 *   Reels:        $10 per reel
 *   YouTube Edit: $12 per minute
 *   Real Estate:  $80 per video (=$40 per 30s)
 *   Ad Creative:  $10 per reel
 * Turnaround modifiers (confirmed by Driss 2026-11-14):
 *   Standard 48h  x1.0, Rush 24h  x1.5, Flexible 4-7 days  x0.9
 * Preview layout: type buttons, a quantity stepper (for YouTube the
 * quantity is minutes), speed buttons, and a result card with a
 * mailto "Start with this quote" button. Estimate only.
 */
(function () {
  'use strict';

  var RATES = {
    reels: { rate: 10, unit: 'reel', units: 'reels', label: 'Reels', rateLbl: '$10 per reel' },
    youtube: { rate: 12, unit: 'minute', units: 'minutes', label: 'YouTube', rateLbl: '$12 per minute' },
    realestate: { rate: 80, unit: 'video', units: 'videos', label: 'Real Estate', rateLbl: '$80 per video' },
    ad: { rate: 10, unit: 'reel', units: 'reels', label: 'Ad Creative', rateLbl: '$10 per reel' }
  };
  var SPEEDS = {
    standard: { mult: 1, label: 'Standard 48h', note: 'standard price' },
    rush: { mult: 1.5, label: 'Rush 24h', note: '+50%' },
    flexible: { mult: 0.9, label: 'Flexible 4–7 days', note: '−10%' }
  };

  function calcQuote(type, qty, speed) {
    var r = RATES[type] || RATES.reels;
    var s = SPEEDS[speed] || SPEEDS.standard;
    var q = Math.min(200, Math.max(1, parseInt(qty, 10) || 1));
    var base = r.rate * q;
    var total = Math.round(base * s.mult * 100) / 100;
    return { type: type, rate: r, speed: s, qty: q, base: base, total: total };
  }
  window.__quoteCalc = calcQuote;

  var state = { type: 'reels', qty: 1, speed: 'standard' };
  var qQty = document.getElementById('qQty');
  var qUnit = document.getElementById('qUnit');
  var qTotal = document.getElementById('qTotal');
  var qBreak = document.getElementById('qBreak');
  var qMailto = document.getElementById('qMailto');
  if (!qQty || !qTotal) {
    /* Fallback: the real-estate and youtube-editor landing pages still
       use the old quote form (radio pills, count/minutes, select).
       Keep that calculator working exactly as before. */
    (function () {
      var OLD_RATES = {
        reels: { label: 'Reels / Shorts', unit: 'reel', base: 10, per: 'video' },
        youtube: { label: 'YouTube Edit', unit: 'minute', base: 12, per: 'minute' },
        'real-estate': { label: 'Real Estate', unit: 'video', base: 80, per: 'video' },
        ad: { label: 'Ad Creative', unit: 'reel', base: 10, per: 'video' }
      };
      var OLD_TURNS = {
        standard: { label: 'Standard — 48h', mult: 1.0 },
        rush: { label: 'Rush — 24h (+50%)', mult: 1.5 },
        flexible: { label: 'Flexible — 4-7 days (-10%)', mult: 0.9 }
      };
      var form = document.getElementById('quote-form');
      if (!form) return;
      var countField = document.getElementById('quote-count-field');
      var minutesField = document.getElementById('quote-minutes-field');
      var countInput = document.getElementById('quote-count');
      var minutesInput = document.getElementById('quote-minutes');
      var minutesValue = document.getElementById('quote-minutes-value');
      var turnaroundSelect = document.getElementById('quote-turnaround');
      var baseLine = document.getElementById('quote-base');
      var adjLine = document.getElementById('quote-adjustment');
      var totalEl = document.getElementById('quote-total');
      var waBtn = document.getElementById('quote-wa');
      var emailBtn = document.getElementById('quote-email');
      function clamp(n, min, max, fb) { n = parseInt(n, 10); if (isNaN(n)) return fb; return Math.min(max, Math.max(min, n)); }
      function currentFormat() {
        var c = form.querySelector('input[name="format"]:checked');
        return c ? c.value : 'reels';
      }
      function update() {
        var format = currentFormat();
        var rate = OLD_RATES[format] || OLD_RATES.reels;
        var isMinutes = format === 'youtube';
        if (countField) countField.hidden = isMinutes;
        if (minutesField) minutesField.hidden = !isMinutes;
        if (countInput) countInput.disabled = isMinutes;
        if (minutesInput) minutesInput.disabled = !isMinutes;
        var count = countInput ? parseInt(countInput.value, 10) : 1;
        var minutes = minutesInput ? parseInt(minutesInput.value, 10) : 5;
        if (minutesValue && minutesInput) minutesValue.textContent = clamp(minutes, 1, 30, 5) + ' min';
        var turn = OLD_TURNS[turnaroundSelect ? turnaroundSelect.value : 'standard'] || OLD_TURNS.standard;
        var qty = rate.per === 'minute' ? clamp(minutes, 1, 30, 5) : clamp(count, 1, 10, 1);
        var base = rate.base * qty;
        var total = Math.round(base * turn.mult);
        var qtyText = rate.per === 'minute' ? qty + ' min x $' + rate.base + '/min' : qty + ' x $' + rate.base + ' per ' + rate.unit;
        if (baseLine) baseLine.textContent = rate.label + ' — ' + qtyText + ' = $' + base;
        if (adjLine) adjLine.textContent = turn.label + ': ' + (total - base > 0 ? '+' : '') + '$' + (total - base);
        if (totalEl) totalEl.textContent = 'from $' + total;
        if (waBtn || emailBtn) {
          var lines = ['Hi Driss, I want an instant quote.', 'Format: ' + rate.label,
            rate.per === 'minute' ? 'Length: ' + qty + ' minutes' : 'Quantity: ' + qty + (qty === 1 ? ' video' : ' videos'),
            'Turnaround: ' + turn.label, 'Estimated total: from $' + total + ' (estimate only — please confirm the final price.)'];
          var text = lines.join('\n');
          if (waBtn) waBtn.href = 'https://wa.me/4917688649232?text=' + encodeURIComponent(text);
          if (emailBtn) emailBtn.href = 'mailto:hello@drizoeditz.pro?subject=' + encodeURIComponent('Instant quote - ' + rate.label) + '&body=' + encodeURIComponent(text);
        }
      }
      form.addEventListener('input', update);
      form.addEventListener('change', update);
      update();
    })();
    return;
  }

  function money(n) { return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US'); }

  function renderQuote() {
    var r = RATES[state.type], s = SPEEDS[state.speed];
    var q = calcQuote(state.type, state.qty, state.speed);
    qQty.textContent = q.qty;
    if (qUnit) qUnit.textContent = q.qty === 1 ? r.unit : r.units;
    qTotal.textContent = money(q.total);
    if (qBreak) {
      qBreak.innerHTML =
        '<span>' + r.label + ' — ' + q.qty + ' ' + (q.qty === 1 ? r.unit : r.units) + ' × ' + r.rateLbl.replace(' per ', '/') + ' = ' + money(q.base) + '</span>' +
        '<span>' + s.label + ' (' + s.note + ')' + (s.mult !== 1 ? ' → ' + money(q.total) : '') + '</span>' +
        '<span>3 revision rounds included</span>';
    }
    if (qMailto) {
      var subject = 'Quote request — ' + q.qty + ' ' + (q.qty === 1 ? r.unit : r.units) + ' (' + r.label + ', ' + s.label + ') — est. ' + money(q.total);
      qMailto.href = 'mailto:hello@drizoeditz.pro?subject=' + encodeURIComponent(subject);
    }
  }

  document.querySelectorAll('.q-type').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.q-type').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      state.type = btn.dataset.type;
      renderQuote();
    });
  });
  document.querySelectorAll('.q-speed').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.q-speed').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      state.speed = btn.dataset.speed;
      renderQuote();
    });
  });
  var plus = document.getElementById('qPlus');
  var minus = document.getElementById('qMinus');
  if (plus) plus.addEventListener('click', function () { state.qty = Math.min(200, state.qty + 1); renderQuote(); });
  if (minus) minus.addEventListener('click', function () { state.qty = Math.max(1, state.qty - 1); renderQuote(); });

  /* Trial links jump to the quote with Reels preselected. */
  document.querySelectorAll('[data-trial-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      state.type = 'reels'; state.qty = 1;
      document.querySelectorAll('.q-type').forEach(function (x) {
        x.setAttribute('aria-pressed', x.dataset.type === 'reels' ? 'true' : 'false');
      });
      renderQuote();
    });
  });

  renderQuote();
})();
