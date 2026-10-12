/* Portfolio app: renders video cards, filters, inline playback. VIDEOS comes from videos.js */
(function () {
  var grid = document.getElementById('grid');
  var filtersEl = document.getElementById('filters');
  var currentFilter = 'all';
  var players = [];

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
      // YouTube: thumbnail + tap-to-load iframe (avoids broken embeds on page load)
      var img = document.createElement('img');
      img.src = v.poster;
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
      video.src = v.src;
      video.poster = v.poster;
      video.preload = 'metadata';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.controls = true;
      video.disablePictureInPicture = false;
      player.appendChild(video);
      players.push(video);

      var overlay2 = document.createElement('div');
      overlay2.className = 'play-overlay';
      overlay2.innerHTML = '<div class="play-btn"></div>';
      overlay2.addEventListener('click', function () {
        pauseAll(video);
        overlay2.classList.add('gone');
        video.play().catch(function () { overlay2.classList.remove('gone'); });
      });
      video.addEventListener('pause', function () { overlay2.classList.remove('gone'); });
      video.addEventListener('play', function () { overlay2.classList.add('gone'); });
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

  function pauseAll(except) {
    players.forEach(function (p) {
      if (p !== except && !p.paused) p.pause();
    });
  }

  function render() {
    grid.innerHTML = '';
    players = [];
    VIDEOS.forEach(function (v) {
      if (currentFilter !== 'all' && v.client !== currentFilter) return;
      grid.appendChild(makeCard(v));
    });
  }

  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    filtersEl.querySelectorAll('.filter').forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    render();
  });

  render();
})();
