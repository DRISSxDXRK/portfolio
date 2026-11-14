/* Client testimonials. The Malek quote is rendered statically in index.html
   so the section is visible with no JS; this script only adds entries that
   are NOT already in the DOM. Add entries as reviews arrive.
   Entry shape: { text: "...", name: "Client Name", detail: "Brand / context" } */
var TESTIMONIALS = [
 { text: "He is good.", name: "Malek", detail: "5/5 — client review" }
];

(function () {
  var section = document.getElementById('testimonials');
  var wrap = document.getElementById('quotes');
  if (!section || !wrap) return;
  // Section is visible by default in the HTML; never hide it here.
  var existing = [];
  wrap.querySelectorAll('blockquote').forEach(function (b) {
    existing.push(b.textContent.replace(/[\u201C\u201D"]/g, '').trim());
  });
  TESTIMONIALS.forEach(function (t) {
    if (existing.indexOf(t.text.trim()) !== -1) return; // already rendered statically
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
