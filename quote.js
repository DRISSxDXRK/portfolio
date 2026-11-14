/* Stage 2 — Instant quote calculator.
 * Pricing uses ONLY the site's existing published rates as the base:
 *   Reels / Shorts:  $10 per reel
 *   YouTube Edit:    $12 per minute
 *   Real Estate:     $80 per video (=$40 per 30s, the site's published rate)
 *   Ad Creative:     $10 per reel (same base as Reels, labelled as ad creative)
 * Turnaround modifiers (new assumptions — Driss to confirm):
 *   Standard 48h  x1.0, Rush 24h  x1.5, Flexible 3-5 days  x0.9
 * Total is rounded to the nearest whole dollar. Estimate only — the final
 * price is confirmed on WhatsApp. No backend, no submit needed to see the
 * price; the WhatsApp button just opens wa.me with the quote pre-filled.
 * Progressive enhancement: if this file fails, the form stays visible and
 * the WhatsApp button keeps its default $10 / 1 Reel / Standard quote.
 */
(function () {
  'use strict';

  var RATES = {
    reels: { label: 'Reels / Shorts', unit: 'reel', base: 10, per: 'video' },
    youtube: { label: 'YouTube Edit', unit: 'minute', base: 12, per: 'minute' },
    'real-estate': { label: 'Real Estate', unit: 'video', base: 80, per: 'video' },
    ad: { label: 'Ad Creative', unit: 'reel', base: 10, per: 'video' }
  };
  var TURNAROUNDS = {
    standard: { label: 'Standard — 48h', mult: 1.0 },
    rush: { label: 'Rush — 24h (+50%)', mult: 1.5 },
    flexible: { label: 'Flexible — 3-5 days (-10%)', mult: 0.9 }
  };
  var WA_NUMBER = '4917688649232';

  function clamp(n, min, max, fallback) {
    n = parseInt(n, 10);
    if (isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  /* Pure pricing function, also exposed for testing: window.__quoteCalc */
  function calcQuote(format, count, minutes, turnaround) {
    var rate = RATES[format] || RATES.reels;
    var turn = TURNAROUNDS[turnaround] || TURNAROUNDS.standard;
    var qty = rate.per === 'minute' ? clamp(minutes, 1, 30, 5) : clamp(count, 1, 10, 1);
    var base = rate.base * qty;
    var total = Math.round(base * turn.mult);
    return { format: format, rate: rate, turn: turn, qty: qty, base: base, adjustment: total - base, total: total };
  }
  window.__quoteCalc = calcQuote;

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
  var waBtn = document.getElementById('quote-whatsapp');

  function currentFormat() {
    var checked = form.querySelector('input[name="format"]:checked');
    return checked ? checked.value : 'reels';
  }

  function update() {
    var format = currentFormat();
    var isMinutes = format === 'youtube';
    if (countField) countField.hidden = isMinutes;
    if (minutesField) minutesField.hidden = !isMinutes;
    if (countInput) countInput.disabled = isMinutes;
    if (minutesInput) minutesInput.disabled = !isMinutes;

    var count = countInput ? parseInt(countInput.value, 10) : 1;
    var minutes = minutesInput ? parseInt(minutesInput.value, 10) : 5;
    if (minutesValue && minutesInput) minutesValue.textContent = clamp(minutes, 1, 30, 5) + ' min';
    var turnaround = turnaroundSelect ? turnaroundSelect.value : 'standard';
    var q = calcQuote(format, count, minutes, turnaround);

    var qtyText = q.rate.per === 'minute'
      ? q.qty + ' min x $' + q.rate.base + '/min'
      : q.qty + ' x $' + q.rate.base + ' per ' + q.rate.unit;
    if (baseLine) baseLine.textContent = q.rate.label + ' — ' + qtyText + ' = $' + q.base;
    if (adjLine) {
      var sign = q.adjustment > 0 ? '+' : '';
      adjLine.textContent = q.turn.label + ': ' + sign + '$' + q.adjustment;
    }
    if (totalEl) totalEl.textContent = 'from $' + q.total;

    if (waBtn) {
      var qtyLine = q.rate.per === 'minute'
        ? 'Length: ' + q.qty + ' minutes'
        : 'Quantity: ' + q.qty + (q.qty === 1 ? ' video' : ' videos');
      var lines = [
        'Hi Driss, I want an instant quote.',
        'Format: ' + q.rate.label,
        qtyLine,
        'Turnaround: ' + q.turn.label,
        'Estimated total: from $' + q.total + ' (estimate only — please confirm the final price.)'
      ];
      waBtn.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    }
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
