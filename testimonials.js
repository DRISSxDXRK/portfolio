/* Client testimonials. Add entries as reviews arrive — the section stays hidden while empty.
   Entry shape: { text: "…", name: "Client Name", detail: "Brand / context" } */
var TESTIMONIALS = [];

(function () {
  var section = document.getElementById('testimonials');
  var wrap = document.getElementById('quotes');
  if (!section || !wrap) return;
  if (!TESTIMONIALS.length) { section.hidden = true; return; }
  section.hidden = false;
  TESTIMONIALS.forEach(function (t) {
    var fig = document.createElement('figure');
    fig.className = 'quote';
    var q = document.createElement('blockquote');
    q.textContent = '\u201C' + t.text + '\u201D';
    var cap = document.createElement('figcaption');
    var strong = document.createElement('strong');
    strong.textContent = t.name;
    cap.appendChild(strong);
    if (t.detail) {
      var span = document.createElement('span');
      span.textContent = t.detail;
      cap.appendChild(span);
    }
    fig.appendChild(q);
    fig.appendChild(cap);
    wrap.appendChild(fig);
  });
})();
