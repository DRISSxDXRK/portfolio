/* Trial edit form (trial.html).
   - Validates the brief and says exactly what is missing, same style as
     the homepage contact form.
   - On submit, opens the visitor's email app (mailto) to
     hello@drizoeditz.pro with subject "Trial edit brief - <name>" and all
     answers in the body. Nothing is paid yet.
   - Then reveals Step 3, the $10 PayPal payment. The payment button only
     appears when config.js trialPaypalUrl is set; while it is empty the
     button stays hidden and the page says Driss will send the payment link
     after reviewing the brief. No payment URL is invented anywhere. */
(function () {
  var form = document.getElementById('trial-form');
  if (!form) return;

  var CFG = window.SITE_CONFIG || {};
  var EMAIL = CFG.email || 'hello@drizoeditz.pro';

  var nameEl = document.getElementById('trial-name');
  var emailEl = document.getElementById('trial-email');
  var typeEl = document.getElementById('trial-type');
  var footageEl = document.getElementById('trial-footage');
  var scopeEl = document.getElementById('trial-scope');
  var lookEl = document.getElementById('trial-look');
  var ex1El = document.getElementById('trial-example-1');
  var ex2El = document.getElementById('trial-example-2');
  var ex3El = document.getElementById('trial-example-3');
  var deadlineEl = document.getElementById('trial-deadline');
  var notesEl = document.getElementById('trial-notes');
  var statusEl = document.getElementById('trial-status');
  var paymentEl = document.getElementById('trial-payment');
  var payBtn = document.getElementById('trial-pay');
  var payNote = document.getElementById('trial-pay-note');

  function setStatus(text, kind) {
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    statusEl.textContent = text;
  }

  function normalizeLink(v) {
    v = v.trim();
    if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
    return v;
  }

  function isUrl(v) {
    return /^https?:\/\/[^\s\/.]+\.[^\s]{2,}$/i.test(v);
  }

  function readFields() {
    return {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      type: typeEl.value,
      footage: normalizeLink(footageEl.value),
      scope: scopeEl.value.trim(),
      look: lookEl.value.trim(),
      examples: [ex1El.value, ex2El.value, ex3El.value].map(normalizeLink).filter(Boolean),
      deadline: deadlineEl.value.trim(),
      notes: notesEl.value.trim()
    };
  }

  /* Returns true when valid; otherwise marks fields, explains, focuses the first. */
  function validate(d) {
    [nameEl, emailEl, footageEl, scopeEl, lookEl, ex1El, ex2El, ex3El].forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
    var bad = [];
    var parts = [];
    if (!d.name) { bad.push(nameEl); parts.push('your name'); }
    if (!d.email) { bad.push(emailEl); parts.push('your email'); }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) {
      bad.push(emailEl);
      setStatus('That email does not look right. Check it and send again.', 'error');
      bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
      bad[0].focus();
      return false;
    }
    if (!d.footage) { bad.push(footageEl); parts.push('your raw footage link'); }
    if (!d.scope) { bad.push(scopeEl); parts.push('what the video is about'); }
    if (!d.look) { bad.push(lookEl); parts.push('how the video should look'); }
    if (bad.length) {
      setStatus('Add ' + parts.join(' and ') + ', then send again.', 'error');
    } else {
      var badLinks = [];
      if (!isUrl(d.footage)) badLinks.push(footageEl);
      d.examples.forEach(function (link, i) {
        if (link && !isUrl(link)) badLinks.push([ex1El, ex2El, ex3El][i]);
      });
      if (badLinks.length) {
        bad = badLinks;
        setStatus('One of those links does not look right. Paste the full address, for example https://drive.google.com/...', 'error');
      }
    }
    bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
    if (bad.length) { bad[0].focus(); return false; }
    return true;
  }

  function textLines(d) {
    var lines = [
      'Hi Driss, I would like a $10 trial edit.',
      'Name: ' + d.name,
      'Email: ' + d.email,
      'Video type: ' + d.type,
      'Raw footage link: ' + d.footage,
      'Video scope: ' + d.scope,
      'How it should look: ' + d.look
    ];
    if (d.examples.length) lines.push('Example videos: ' + d.examples.join(', '));
    if (d.deadline) lines.push('Deadline for first cut: ' + d.deadline);
    if (d.notes) lines.push('Anything else: ' + d.notes);
    lines.push('Trial: 1 reel for $10, first cut in 48h, 3 revision rounds included.');
    return lines.join('\n');
  }

  function revealPayment() {
    paymentEl.hidden = false;
    paymentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (CFG.trialPaypalUrl) {
      payBtn.href = CFG.trialPaypalUrl;
      payBtn.hidden = false;
      payNote.hidden = true;
    } else {
      payBtn.hidden = true;
      payNote.hidden = false;
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = readFields();
    if (!validate(d)) return;
    var subject = 'Trial edit brief - ' + d.name;
    var url = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(textLines(d));
    setStatus('Brief ready. Your email app is opening — send it, then come back here to pay the $10.', 'ok');
    window.location.href = url;
    revealPayment();
  });
})();
