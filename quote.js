/* Quote calculator — custom quote per brief, no fixed prices.
 * Driss does not have a fixed rate. The calculator only collects
 * the pack (Short-form or Long-form), a quantity and a turnaround,
 * and shows "Custom quote". Price is confirmed on the brief.
 * Turnaround options carry no price modifiers.
 * Preview layout: type buttons, a quantity stepper, speed buttons,
 * and a result card with a "Request this quote" button linking to
 * the contact / brief form (#contact on the homepage).
 */
(function () {
  'use strict';

  var TYPES = {
    shortform: { label: 'Short-form pack', unit: 'video', units: 'videos' },
    longform: { label: 'Long-form pack', unit: 'minute', units: 'minutes' }
  };
  var SPEEDS = {
    standard: { label: 'Standard 48h' },
    rush: { label: 'Rush 24h' },
    flexible: { label: 'Flexible 4–7 days' }
  };

  function calcQuote(type, qty, speed) {
    var t = TYPES[type] || TYPES.shortform;
    var s = SPEEDS[speed] || SPEEDS.standard;
    var q = Math.min(200, Math.max(1, parseInt(qty, 10) || 1));
    return { type: type, pack: t, speed: s, qty: q, total: 'Custom quote' };
  }
  window.__quoteCalc = calcQuote;

  var state = { type: 'shortform', qty: 1, speed: 'standard' };
  var qQty = document.getElementById('qQty');
  var qUnit = document.getElementById('qUnit');
  var qTotal = document.getElementById('qTotal');
  var qBreak = document.getElementById('qBreak');
  var qMailto = document.getElementById('qMailto');
  if (!qQty || !qTotal) {
    /* Fallback: the landing pages still use the old quote form
       (radio pills, count/minutes, select). Same rule applies there:
       no rates, no dollar totals — show "Custom quote" and a
       summary of the brief for WhatsApp / email. */
    (function () {
      var OLD_FORMATS = {
        reels: { label: 'Short-form pack', unit: 'video', per: 'video' },
        youtube: { label: 'Long-form pack', unit: 'minute', per: 'minute' },
        ad: { label: 'Short-form pack', unit: 'video', per: 'video' }
      };
      var OLD_TURNS = {
        standard: { label: 'Standard — 48h' },
        rush: { label: 'Rush — 24h' },
        flexible: { label: 'Flexible — 4-7 days' }
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
        var pack = OLD_FORMATS[format] || OLD_FORMATS.reels;
        var isMinutes = format === 'youtube';
        if (countField) countField.hidden = isMinutes;
        if (minutesField) minutesField.hidden = !isMinutes;
        if (countInput) countInput.disabled = isMinutes;
        if (minutesInput) minutesInput.disabled = !isMinutes;
        var count = countInput ? parseInt(countInput.value, 10) : 1;
        var minutes = minutesInput ? parseInt(minutesInput.value, 10) : 5;
        if (minutesValue && minutesInput) minutesValue.textContent = clamp(minutes, 1, 30, 5) + ' min';
        var turn = OLD_TURNS[turnaroundSelect ? turnaroundSelect.value : 'standard'] || OLD_TURNS.standard;
        var qty = pack.per === 'minute' ? clamp(minutes, 1, 30, 5) : clamp(count, 1, 10, 1);
        var qtyText = pack.per === 'minute' ? qty + ' min' : qty + (qty === 1 ? ' video' : ' videos');
        if (baseLine) baseLine.textContent = pack.label + ' — ' + qtyText;
        if (adjLine) adjLine.textContent = turn.label;
        if (totalEl) totalEl.textContent = 'Custom quote';
        if (waBtn || emailBtn) {
          var lines = ['Hi Driss, I want a custom quote.', 'Pack: ' + pack.label,
            pack.per === 'minute' ? 'Length: ' + qty + ' minutes' : 'Quantity: ' + qty + (qty === 1 ? ' video' : ' videos'),
            'Turnaround: ' + turn.label, 'Price: custom quote, confirmed on my brief.'];
          var text = lines.join('\n');
          if (waBtn) waBtn.href = 'https://wa.me/4917688649232?text=' + encodeURIComponent(text);
          if (emailBtn) emailBtn.href = 'mailto:hello@drizoeditz.pro?subject=' + encodeURIComponent('Custom quote - ' + pack.label) + '&body=' + encodeURIComponent(text);
        }
      }
      form.addEventListener('input', update);
      form.addEventListener('change', update);
      update();
    })();
    return;
  }

  function renderQuote() {
    var q = calcQuote(state.type, state.qty, state.speed);
    qQty.textContent = q.qty;
    if (qUnit) qUnit.textContent = q.qty === 1 ? q.pack.unit : q.pack.units;
    qTotal.textContent = 'Custom quote';
    if (qBreak) {
      qBreak.innerHTML =
        '<span>' + q.pack.label + ' — ' + q.qty + ' ' + (q.qty === 1 ? q.pack.unit : q.pack.units) + '</span>' +
        '<span>' + q.speed.label + '</span>' +
        '<span>Price confirmed on your brief. 3 revision rounds included.</span>';
    }
    if (qMailto) qMailto.href = '#contact';
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

  /* Trial links jump to the quote with Short-form preselected. */
  document.querySelectorAll('[data-trial-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      state.type = 'shortform'; state.qty = 1;
      document.querySelectorAll('.q-type').forEach(function (x) {
        x.setAttribute('aria-pressed', x.dataset.type === 'shortform' ? 'true' : 'false');
      });
      renderQuote();
    });
  });

  renderQuote();
})();
