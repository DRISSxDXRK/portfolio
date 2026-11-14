/* Case study — Stage 1.
 *
 * Data: replace null with real, supplied numbers only. Never invent a
 * client, a result, or a number.
 * Shape:
 *   window.CASE_STUDY = {
 *     client: 'Client / brand name',
 *     title: 'Short headline',
 *     problem: 'What was wrong before.',
 *     changed: 'What Driss changed.',
 *     result: 'The measured result, with real numbers.'
 *   };
 * Null by default: nothing is rendered at all (no section, no heading)
 * until Driss supplies a real case study. */
window.CASE_STUDY = null;

(function () {
  'use strict';
  var cs = window.CASE_STUDY;
  if (!cs || typeof cs !== 'object') return;
  if (!cs.problem && !cs.changed && !cs.result) return;
  var mount = document.getElementById('case-study-mount');
  if (!mount) return;

  var section = document.createElement('section');
  section.className = 'case-study';
  section.setAttribute('aria-labelledby', 'case-study-title');
  var kicker = document.createElement('p');
  kicker.className = 'sec-kicker';
  kicker.innerHTML = '<span>03</span>Case Study';
  var title = document.createElement('h2');
  title.className = 'sec-title';
  title.id = 'case-study-title';
  title.textContent = cs.title || (cs.client ? 'One project, in detail.' : 'Case study.');
  section.appendChild(kicker);
  section.appendChild(title);
  if (cs.client) {
    var client = document.createElement('p');
    client.className = 'case-client';
    client.textContent = cs.client;
    section.appendChild(client);
  }

  var grid = document.createElement('div');
  grid.className = 'case-grid';
  [['Problem', cs.problem], ['What I changed', cs.changed], ['Result', cs.result]].forEach(function (pair) {
    if (!pair[1]) return; // omit any step Driss has not supplied
    var card = document.createElement('div');
    card.className = 'case-card';
    var h = document.createElement('h3');
    h.textContent = pair[0];
    var p = document.createElement('p');
    p.textContent = pair[1];
    card.appendChild(h);
    card.appendChild(p);
    grid.appendChild(card);
  });
  if (!grid.children.length) return;
  section.appendChild(grid);
  mount.appendChild(section);
})();
