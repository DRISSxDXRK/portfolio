/* Trial edit form (trial.html).
   - Validates the brief and says exactly what is missing, same style as
     the homepage contact form.
   - On submit, the website sends the brief itself: it POSTs the answers
     directly to FormSubmit AJAX (https://formsubmit.co/ajax/hello@drizoeditz.pro)
     in the background. NO email-app redirect.
   - On success it instantly redirects the browser to the PayPal payment
     link from config.js trialPaypalUrl. No intermediate payment step.
   - On POST failure it shows a clear error with a WhatsApp link and keeps
     the form data so the client can retry. It never falls back to opening an email app.
   NOTE: FormSubmit sends an activation email to hello@drizoeditz.pro on
   the FIRST submission — Driss must click "Activate" in that email once,
   or the first brief will not arrive. */
(function () {
  var form = document.getElementById('trial-form');
  if (!form) return;

  var CFG = window.SITE_CONFIG || {};
  var EMAIL = CFG.email || 'hello@drizoeditz.pro';
  var FORM_URL = 'https://formsubmit.co/ajax/' + EMAIL;
  var WHATSAPP_URL = 'https://wa.me/' + (CFG.whatsapp || '4917688649232');

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
  var readyNote = document.getElementById('trial-ready-note');
  var submitBtn = document.getElementById('trial-submit');

  function setStatus(text, kind) {
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    statusEl.textContent = text;
  }

  function setStatusHtml(html, kind) {
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    statusEl.innerHTML = html;
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

  /* Pure readiness check, used only for the glowing note. No focusing, no status. */
  function isReady(d) {
    if (!d.name || !d.email || !d.footage || !d.scope || !d.look) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return false;
    if (!isUrl(d.footage)) return false;
    return d.examples.every(function (link) { return !link || isUrl(link); });
  }

  function updateReadyNote() {
    if (!readyNote) return;
    readyNote.hidden = !isReady(readFields());
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

  form.addEventListener('input', updateReadyNote);
  form.addEventListener('change', updateReadyNote);
  updateReadyNote();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = readFields();
    if (!validate(d)) return;
    if (!CFG.trialPaypalUrl) {
      setStatus('Payment link coming soon — your brief is ready, please message me on WhatsApp to pay the $10.', 'error');
      return;
    }
    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending brief…';
    setStatus('Sending your brief…', 'ok');
    var payload = {
      name: d.name,
      email: d.email,
      'video-type': d.type,
      'footage-link': d.footage,
      scope: d.scope,
      look: d.look,
      'example-videos': d.examples.join(', '),
      deadline: d.deadline,
      notes: d.notes,
      _subject: 'Trial edit brief - ' + d.name,
      _template: 'table',
      _captcha: 'false'
    };
    fetch(FORM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('FormSubmit returned ' + res.status);
      return res.json().catch(function () { return {}; });
    }).then(function () {
      setStatus('Brief sent. Taking you to PayPal to pay the $10…', 'ok');
      window.location.href = CFG.trialPaypalUrl;
    }).catch(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      setStatusHtml('Could not send your brief, please try again or message me on <a href="' + WHATSAPP_URL + '">WhatsApp</a>.', 'error');
    });
  });
})();
