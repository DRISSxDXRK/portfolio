/* Stage 2 — Lead magnet: "10 reel hooks that work" email signup.
 * Hidden until BOTH config.js leadFormEndpoint and leadPdfUrl are set.
 * Uses the same form-service pattern as the contact form: POST the email
 * to leadFormEndpoint (Formspree / Web3Forms style), then show the PDF
 * link. No endpoint, no PDF, no signup — the whole section stays hidden. */
(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var endpoint = (cfg.leadFormEndpoint || '').trim();
  var pdfUrl = (cfg.leadPdfUrl || '').trim();
  var section = document.getElementById('lead-magnet');
  if (!section) return;
  if (!endpoint || !pdfUrl) return; // stays hidden until configured
  section.hidden = false;

  var form = document.getElementById('lead-form');
  var email = document.getElementById('lead-email');
  var status = document.getElementById('lead-status');
  var pdfLink = document.getElementById('lead-pdf-link');
  if (!form || !email) return;
  pdfLink.href = pdfUrl;

  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('ok', !!ok);
    status.classList.toggle('error', !ok);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!value || value.indexOf('@') < 1) {
      email.setAttribute('aria-invalid', 'true');
      setStatus('Add your email, then send again.', false);
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');
    var body = new FormData();
    body.append('email', value);
    body.append('_subject', 'Lead magnet: 10 reel hooks that work');
    if (cfg.formAccessKey) body.append('access_key', cfg.formAccessKey);
    fetch(endpoint, { method: 'POST', body: body, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('form failed');
        pdfLink.hidden = false;
        pdfLink.focus();
        setStatus('Done — your guide is ready below.', true);
      })
      .catch(function () {
        setStatus('That did not send. Try again, or email hello@drizoeditz.pro and I will send you the guide.', false);
      });
  });
})();
