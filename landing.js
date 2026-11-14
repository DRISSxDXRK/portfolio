/* Stage 3 — niche landing pages (shared).
 * Renders only the videos a landing page asks for, from the same videos.js
 * data as the homepage. The homepage's app.js is NOT loaded on landing
 * pages (it renders the full grid), so this file duplicates its card
 * markup/logic in a small, self-contained form.
 * Asset paths in videos.js are relative ("videos/...", "thumbs/..."), so
 * they are prefixed with "/" here — landing pages live in subdirectories
 * (/real-estate-video-editor/, /youtube-editor/) and a relative path
 * would resolve inside the subdirectory and 404.
 * Filters:
 *   real-estate — v.format includes "real-estate" (7 Art Home Photo videos)
 *   youtube     — v.format includes "youtube" (3 long-form YouTube videos)
 *   shorts      — Charlie's Pokecards vertical MP4s (4 Shorts, not YouTube)
 * Also wires the contact form on landing pages to WhatsApp, exactly like
 * the homepage form (no backend). Progressive enhancement: if videos.js
 * fails, the grids stay empty and the rest of the page still works.
 */
(function () {
  'use strict';

  function abs(p) {
    if (!p) return p;
    if (p.indexOf('http') === 0 || p.charAt(0) === '/') return p;
    return '/' + p;
  }

  var players = [];
  function pauseAll(except) {
    players.forEach(function (p) {
      if (p !== except && !p.paused) p.pause();
    });
  }

  function clientLabel(key) {
    return { ahp: 'Art Home Photo', as: 'Art Social', charlie: "Charlie's Pokécards", hercules: 'Hercules Training' }[key] || key;
  }

  function makeCard(v) {
    var card = document.createElement('article');
    card.className = 'card';
    card.dataset.client = v.client;
    var player = document.createElement('div');
    player.className = 'player' + (v.vertical ? ' vertical' : '');
    if (v.youtube) {
      var img = document.createElement('img');
      img.src = abs(v.poster);
      img.alt = v.title;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.loading = 'lazy';
      player.appendChild(img);
      var overlay = document.createElement('div');
      overlay.className = 'play-overlay';
      overlay.innerHTML = '<div class="play-btn"></div>';
      overlay.addEventListener('click', function () {
        pauseAll();
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + v.youtube + '?autoplay=1&rel=0';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;
        frame.title = v.title;
        player.innerHTML = '';
        player.appendChild(frame);
      });
      player.appendChild(overlay);
    } else {
      var video = document.createElement('video');
      video.src = abs(v.src);
      video.poster = abs(v.poster);
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.controls = false; /* native controls only after tap-to-play, so the card shows one play button, not two */
      player.appendChild(video);
      players.push(video);
      var overlay2 = document.createElement('div');
      overlay2.className = 'play-overlay';
      overlay2.innerHTML = '<div class="play-btn"></div>';
      overlay2.addEventListener('click', function () {
        pauseAll(video);
        overlay2.classList.add('gone');
        video.controls = true;
        video.play().catch(function () { overlay2.classList.remove('gone'); });
      });
      video.addEventListener('pause', function () { video.controls = false; overlay2.classList.remove('gone'); });
      video.addEventListener('play', function () { video.controls = true; overlay2.classList.add('gone'); });
      player.appendChild(overlay2);
    }
    var body = document.createElement('div');
    body.className = 'card-body';
    var client = document.createElement('div');
    client.className = 'card-client';
    client.textContent = clientLabel(v.client);
    var title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = v.title;
    body.appendChild(client);
    body.appendChild(title);
    card.appendChild(player);
    card.appendChild(body);
    return card;
  }

  function matches(v, filter) {
    if (filter === 'real-estate') return (v.format || []).indexOf('real-estate') !== -1;
    if (filter === 'youtube') return (v.format || []).indexOf('youtube') !== -1;
    if (filter === 'shorts') return v.client === 'charlie' && (v.format || []).indexOf('reels') !== -1 && !v.youtube;
    return false;
  }

  var grids = document.querySelectorAll('[data-landing-grid]');
  if (grids.length && typeof VIDEOS !== 'undefined') {
    grids.forEach(function (grid) {
      var filter = grid.getAttribute('data-landing-grid');
      VIDEOS.forEach(function (v) {
        if (matches(v, filter)) grid.appendChild(makeCard(v));
      });
    });
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('portfolio:grid-rendered', { detail: { filter: 'landing' } }));
    }
  }

  /* Contact form: same email behaviour as the homepage form. */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('field-name').value.trim();
      var type = document.getElementById('field-type').value;
      var budget = document.getElementById('field-budget').value;
      var link = document.getElementById('field-link').value.trim();
      var message = document.getElementById('field-message').value.trim();
      if (!name || !message) return;
      var lines = [
        'Hi Driss, I want to book a project.',
        'Name: ' + name,
        'Project type: ' + type,
        'Budget: ' + budget
      ];
      if (link) lines.push('Link: ' + link);
      lines.push('Message: ' + message);
      var subject = 'New project enquiry - ' + name + ' - ' + type;
      var url = 'mailto:hello@drizoeditz.pro?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = url;
    });
  }
})();
