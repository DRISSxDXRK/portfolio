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
      video.preload = 'none'; // Stage 1: posters only on load, video loads on tap/hover
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.controls = false; // native controls only after a tap-to-play (see below)
      video.disablePictureInPicture = false;
      player.appendChild(video);
      players.push(video);

      var overlay2 = document.createElement('div');
      overlay2.className = 'play-overlay';
      overlay2.innerHTML = '<div class="play-btn"></div>';
      overlay2.addEventListener('click', function () {
        pauseAll(video);
        overlay2.classList.add('gone');
        video.controls = true;
        video.muted = false;
        video.loop = false;
        video.play().catch(function () { overlay2.classList.remove('gone'); });
      });
      video.addEventListener('pause', function () { overlay2.classList.remove('gone'); });
      // Only one video plays at a time anywhere on the page.
      video.addEventListener('play', function () {
        overlay2.classList.add('gone');
        pauseAll(video);
        var reel = document.getElementById('showreel-video');
        if (reel && !reel.paused) reel.pause();
      });
      player.appendChild(overlay2);

      /* Stage 1 hover preview: desktop only (hover + fine pointer), never
         on touch, never on reduced-motion. Muted looping preview of the same
         file; tap-to-play behaviour is unchanged. */
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var hovering = false;
        player.addEventListener('mouseenter', function () {
          if (video.controls) return; // already playing by tap — leave it alone
          hovering = true;
          pauseAll(video);
          video.muted = true;
          video.loop = true;
          video.play().catch(function () {});
        });
        player.addEventListener('mouseleave', function () {
          hovering = false;
          video.pause();
          video.muted = false;
          video.loop = false;
          video.currentTime = 0;
        });
        video.addEventListener('pause', function () { hovering = false; });
      }
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
    var shown = 0;
    VIDEOS.forEach(function (v) {
      if (currentFilter !== 'all' && !(v.format || []).includes(currentFilter)) return;
      grid.appendChild(makeCard(v));
      shown++;
    });
    if (!shown) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      var msg = currentFilter === 'ads'
        ? 'No ad creatives published yet \u2014 ask me for recent ad examples.'
        : 'No videos in this category yet.';
      var pEl = document.createElement('p');
      pEl.textContent = msg;
      var link = document.createElement('a');
      link.href = '#contact';
      link.className = 'btn btn-primary';
      link.textContent = 'Ask for examples';
      empty.appendChild(pEl);
      empty.appendChild(link);
      grid.appendChild(empty);
    }
    /* Hook for motion.js: re-animate freshly rendered work cards. */
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('portfolio:grid-rendered', { detail: { filter: currentFilter } }));
    }
  }

  /* Hide filter tabs that have no videos yet (e.g. Ads). They reappear
     automatically as soon as a video with that format is added to videos.js. */
  filtersEl.querySelectorAll('.filter').forEach(function (b) {
    var key = b.dataset.filter;
    if (key === 'all') return;
    var has = VIDEOS.some(function (v) { return (v.format || []).indexOf(key) !== -1; });
    if (!has) b.hidden = true;
  });

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

/* Stats ticker: scrolling tape + count-up numbers. Edit STATS to update. */
(function () {
  var STATS = [
    { value: 2300, suffix: '+', label: 'videos delivered' },
    { value: 1489, suffix: '+', label: 'reels cut' },
    { value: 118, suffix: 'K+', label: 'YouTube views generated' },
    { value: 6, suffix: '+', label: 'brands edited for' },
    { value: 8, suffix: '+', label: 'years editing' }
  ];
  var SPEED = 85; // px per second — scroll speed stays constant on any screen

  var track = document.getElementById('tickerTrack');
  if (!track) return;

  function finalText(s) { return Math.round(s.value).toLocaleString('en-US') + s.suffix; }

  function groupHTML(withFinal) {
    return '<div class="ticker-group">' + STATS.map(function (s) {
      return '<span class="tick-item"><span class="tick-num" data-value="' + s.value +
        '" data-suffix="' + s.suffix + '">' + (withFinal ? finalText(s) : '0') +
        '</span><span class="tick-label">' + s.label +
        '</span></span><span class="tick-sep">✦</span>';
    }).join('') + '</div>';
  }

  function countUp(el) {
    var target = parseInt(el.dataset.value, 10);
    var suffix = el.dataset.suffix || '';
    var dur = 1600, start = null;
    function fmt(n) { return Math.round(n).toLocaleString('en-US') + suffix; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Build enough copies that each identical half of the track is wider than
  // the viewport — that is what makes the -50% loop seamless on any screen.
  function layout(animate) {
    track.classList.remove('go');
    track.style.animationDuration = '';
    track.innerHTML = groupHTML(true); // single group, final widths, to measure
    var g = track.querySelector('.ticker-group');
    var W = g ? g.offsetWidth : 600;
    var V = (track.parentElement && track.parentElement.clientWidth) || window.innerWidth;
    var perHalf = Math.max(2, Math.ceil(V / W) + 1);
    var html = '';
    for (var i = 0; i < perHalf * 2; i++) html += groupHTML(true);
    track.innerHTML = html;
    var W2 = track.querySelector('.ticker-group').offsetWidth || W;
    track.style.animationDuration = ((perHalf * W2) / SPEED).toFixed(2) + 's';
    var nums = track.querySelectorAll('.tick-num');
    if (animate) {
      nums.forEach(function (el) { el.textContent = '0'; });
      nums.forEach(countUp);
      // Start scrolling only after the count-up settles, so the loop
      // distance is resolved against final item widths.
      setTimeout(function () { track.classList.add('go'); }, 1750);
    } else {
      track.classList.add('go');
    }
  }

  var started = false;
  function start() {
    if (started) return; started = true;
    layout(true);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } });
    });
    io.observe(track);
  } else { start(); }

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (started) layout(false); }, 250);
  });
})();

/* Mobile menu: toggle button under 720px. */
(function () {
  var nav = document.querySelector('.nav');
  var btn = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (!nav || !btn || !menu) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); }
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(min-width: 721px)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
  }
})();

/* Contact form.
   - Validates name + message and says exactly what is missing.
   - If config.js has a formEndpoint (Formspree / Web3Forms), sends the message
     there with a visible "sending / sent / failed" state.
   - Otherwise falls back to the visitor's email app (mailto).
   - "Send on WhatsApp instead" works either way. */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var CFG = window.SITE_CONFIG || {};
  var EMAIL = CFG.email || 'hello@drizoeditz.pro';
  var WA = CFG.whatsapp || '4917688649232';

  var nameEl = document.getElementById('field-name');
  var typeEl = document.getElementById('field-type');
  var budgetEl = document.getElementById('field-budget');
  var linkEl = document.getElementById('field-link');
  var messageEl = document.getElementById('field-message');
  var hpEl = document.getElementById('field-hp');
  var statusEl = document.getElementById('contact-status');
  var submitBtn = document.getElementById('contact-submit');
  var waBtn = document.getElementById('contact-wa');
  var submitLabel = submitBtn ? submitBtn.textContent : 'Send message';

  function waUrl(text) {
    return 'https://wa.me/' + WA + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* Status line: plain text, optionally followed by a WhatsApp link. */
  function setStatus(text, kind, withWhatsApp, waText) {
    statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    statusEl.textContent = text;
    if (withWhatsApp) {
      statusEl.appendChild(document.createTextNode(' '));
      var a = document.createElement('a');
      a.href = waUrl(waText);
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'message me on WhatsApp';
      statusEl.appendChild(a);
      statusEl.appendChild(document.createTextNode('.'));
    }
  }

  function normalizeLink(v) {
    v = v.trim();
    if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
    return v;
  }

  function readFields() {
    return {
      name: nameEl.value.trim(),
      type: typeEl.value,
      budget: budgetEl.value,
      link: normalizeLink(linkEl.value),
      message: messageEl.value.trim()
    };
  }

  /* Returns true when valid; otherwise marks fields, explains, focuses the first. */
  function validate(d) {
    [nameEl, messageEl, linkEl].forEach(function (el) { el.removeAttribute('aria-invalid'); });
    var bad = [];
    var parts = [];
    if (!d.name) { bad.push(nameEl); parts.push('your name'); }
    if (!d.message) { bad.push(messageEl); parts.push('a short message about your project'); }
    if (bad.length) {
      setStatus('Add ' + parts.join(' and ') + ', then send again.', 'error');
    } else if (d.link && !/^https?:\/\/[^\s\/.]+\.[^\s]{2,}$/i.test(d.link)) {
      bad.push(linkEl);
      setStatus('That link does not look right. Paste the full address, for example https://youtube.com/...', 'error');
    }
    bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
    if (bad.length) { bad[0].focus(); return false; }
    return true;
  }

  function textLines(d) {
    var lines = [
      'Hi Driss, I want to book a project.',
      'Name: ' + d.name,
      'Project type: ' + d.type,
      'Budget: ' + d.budget
    ];
    if (d.link) lines.push('Link: ' + d.link);
    lines.push('Message: ' + d.message);
    return lines.join('\n');
  }

  function busy(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Sending\u2026' : submitLabel;
  }

  function sendToEndpoint(d) {
    var subject = 'New project enquiry - ' + d.name + ' - ' + d.type;
    var payload = {
      name: d.name,
      'project-type': d.type,
      budget: d.budget,
      link: d.link,
      message: d.message,
      _subject: subject
    };
    if (CFG.formAccessKey) {
      payload.access_key = CFG.formAccessKey;
      payload.subject = subject;
      payload.from_name = d.name;
    }
    busy(true);
    setStatus('Sending your message\u2026', '');
    fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        var ok = res.ok && j.success !== false && j.ok !== false && !j.errors && !j.error;
        if (!ok) throw new Error('send failed');
        form.reset();
        setStatus('Message sent. Thanks, I will get back to you soon.', 'ok');
      });
    }).catch(function () {
      setStatus('Your message did not send. Check your connection and try again, or', 'error', true, textLines(d));
    }).then(function () { busy(false); });
  }

  function sendByMailto(d) {
    var subject = 'New project enquiry - ' + d.name + ' - ' + d.type;
    var url = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(textLines(d));
    setStatus('Opening your email app. If nothing happens,', '', true, textLines(d));
    window.location.href = url;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = readFields();
    if (!validate(d)) return;
    if (hpEl && hpEl.value) { form.reset(); setStatus('Message sent. Thanks, I will get back to you soon.', 'ok'); return; } /* bot */
    if (CFG.formEndpoint) sendToEndpoint(d); else sendByMailto(d);
  });

  if (waBtn) {
    waBtn.addEventListener('click', function () {
      var d = readFields();
      if (!validate(d)) return;
      window.open(waUrl(textLines(d)), '_blank', 'noopener');
      setStatus('WhatsApp is opening with your details filled in.', 'ok');
    });
  }
})();
