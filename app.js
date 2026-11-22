/* Portfolio app: renders all video cards, inline playback. VIDEOS comes from videos.js */
(function () {
  var grid = document.getElementById('workGrid') || document.getElementById('grid');
  var workCountEl = document.getElementById('workCount');
  var players = [];

  function clientLabel(key) {
    return { ahp: 'Art Home Photo', as: 'Art Social', charlie: "Charlie's Pokécards", hercules: 'Hercules Training' }[key] || key;
  }

  var CATLBL = { reels: 'Reels', youtube: 'YouTube' };
  var modal = document.getElementById('playerModal');
  var modalVideo = document.getElementById('modalVideo');
  var modalTitle = document.getElementById('modalTitle');
  var modalMeta = document.getElementById('modalMeta');
  var modalScreen = document.getElementById('modalScreen');
  var modalCard = modal ? modal.querySelector('.modal-card') : null;
  var modalPlayBtn = document.getElementById('modalPlayBtn');
  var modalFrame = null;
  var lastFocused = null;
  var prevBodyOverflow = '';
  var prevDocOverflow = '';

  /* Big centre play button: shown whenever the MP4 is paused (autoplay
     blocked, video ended, user paused). Tapping it plays with sound;
     if the browser still refuses, it retries muted so the video at
     least plays, and the visitor can unmute from the native controls. */
  function showPlayBtn(show) {
    if (!modalPlayBtn) return;
    modalPlayBtn.hidden = !show;
  }
  function tryPlay() {
    if (!modalVideo) return;
    var p = null;
    try { p = modalVideo.play(); } catch (e) { p = null; }
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        modalVideo.muted = true;
        var p2 = null;
        try { p2 = modalVideo.play(); } catch (e) { p2 = null; }
        if (p2 && typeof p2.catch === 'function') p2.catch(function () { showPlayBtn(true); });
      });
    }
  }
  if (modalVideo) {
    /* PR #28: match the screen to the file's REAL aspect ratio (720x1280
       for Isabelle Reel 1 and 2, but other files may differ slightly).
       With the CSS width derived from the viewport height, this makes
       the video fill the screen edge to edge with no dark side bar. */
    modalVideo.addEventListener('loadedmetadata', function () {
      if (modalVideo.videoWidth && modalVideo.videoHeight && modalScreen) {
        modalScreen.style.aspectRatio = modalVideo.videoWidth + ' / ' + modalVideo.videoHeight;
      }
    });
    modalVideo.addEventListener('playing', function () { showPlayBtn(false); });
    modalVideo.addEventListener('pause', function () {
      if (modal && modal.classList.contains('open') && !modalVideo.ended) showPlayBtn(true);
    });
    modalVideo.addEventListener('ended', function () { showPlayBtn(true); });
  }
  if (modalPlayBtn) modalPlayBtn.addEventListener('click', function () {
    if (!modalVideo) return;
    if (modalVideo.muted) modalVideo.muted = false;
    tryPlay();
  });

  function lockScroll() {
    prevBodyOverflow = document.body.style.overflow;
    prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
  function unlockScroll() {
    document.body.style.overflow = prevBodyOverflow;
    document.documentElement.style.overflow = prevDocOverflow;
  }

  function openPlayer(v) {
    if (!modal) return;
    pauseAll();
    lastFocused = document.activeElement;
    if (modalTitle) modalTitle.textContent = v.title;
    if (modalMeta) modalMeta.textContent = clientLabel(v.client) + ' \u00b7 ' + (CATLBL[(v.format || ['reels'])[0]] || 'Reels');
    if (modalFrame) { modalFrame.remove(); modalFrame = null; }
    /* Size the modal to the video's real shape BEFORE showing it.
       22 of the 25 videos are vertical 9:16 reels: a fixed 16:9 modal
       showed them as a tiny pillarboxed strip (~213px wide on desktop)
       with the controls hard to reach — that was the reported bug.
       Vertical reels get a tall narrow card; YouTube gets a wide one. */
    /* PR #28: clear any per-video aspect ratio from the previous open,
       so a YouTube 16:9 embed never inherits a reel's 9:16 ratio. */
    if (modalScreen) modalScreen.style.aspectRatio = '';
    var vertical = !!v.vertical && !v.youtube;
    if (modalCard) {
      modalCard.classList.toggle('modal-card--vertical', vertical);
      modalCard.classList.toggle('modal-card--wide', !vertical);
    }
    /* Open first, then load and play: calling play() while the modal
       is still display:none can fail silently, notably on iOS Safari. */
    lockScroll();
    modal.classList.add('open');
    showPlayBtn(false);
    if (v.youtube) {
      if (modalVideo) { modalVideo.pause(); modalVideo.style.display = 'none'; }
      modalFrame = document.createElement('iframe');
      modalFrame.src = 'https://www.youtube-nocookie.com/embed/' + v.youtube + '?autoplay=1&rel=0';
      modalFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      modalFrame.allowFullscreen = true;
      modalFrame.title = v.title;
      modalFrame.style.cssText = 'width:100%;height:100%;border:0;position:absolute;inset:0';
      modalScreen.appendChild(modalFrame);
    } else if (modalVideo) {
      modalVideo.style.display = '';
      modalVideo.muted = false;
      modalVideo.src = v.src;
      modalVideo.poster = v.poster;
      tryPlay();
      /* If autoplay is still blocked, the pause handler shows the
         big play button; also show it after a short grace period
         when the video never starts, so a visitor is never left
         staring at a still poster with no obvious way to play. */
      setTimeout(function () {
        if (modal.classList.contains('open') && modalVideo.paused && !modalVideo.ended) showPlayBtn(true);
      }, 900);
    }
    var modalCloseBtn = document.getElementById('modalClose');
    if (modalCloseBtn) modalCloseBtn.focus();
  }
  function closePlayer() {
    if (!modal) return;
    modal.classList.remove('open');
    unlockScroll();
    showPlayBtn(false);
    if (modalScreen) modalScreen.style.aspectRatio = '';
    if (modalVideo) { modalVideo.pause(); modalVideo.removeAttribute('src'); modalVideo.load(); }
    if (modalFrame) { modalFrame.remove(); modalFrame = null; }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  var modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closePlayer);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closePlayer(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && modal.classList.contains('open')) closePlayer(); });

  function makeCard(v) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.client = v.client;
    var cat = (v.format || ['reels'])[0];
    var label = CATLBL[cat] || 'Reels';
    card.setAttribute('aria-label', 'Play: ' + v.title);
    var tile = document.createElement('span');
    tile.className = 'tile';
    var img = document.createElement('img');
    img.src = v.poster;
    img.alt = v.title;
    img.loading = 'lazy';
    tile.appendChild(img);
    card.appendChild(tile);
    var meta = document.createElement('span');
    meta.className = 'meta-top';
    var chip = document.createElement('span');
    chip.className = 'chip liquid-glass';
    chip.textContent = label;
    var dur = document.createElement('span');
    dur.className = 'chip dur';
    /* The old chip showed the aspect ratio ("9:16") which reads as a
       duration (9 minutes 16 seconds). Say what it actually is. */
    dur.textContent = v.vertical ? 'Vertical' : 'Widescreen';
    meta.appendChild(chip);
    meta.appendChild(dur);
    card.appendChild(meta);
    var ring = document.createElement('span');
    ring.className = 'play-ring liquid-glass';
    ring.textContent = '\u25b6';
    card.appendChild(ring);
    var bar = document.createElement('span');
    bar.className = 'glass-bar liquid-glass';
    var t = document.createElement('span');
    t.className = 't';
    t.textContent = v.title;
    var c = document.createElement('span');
    c.className = 'c';
    c.textContent = clientLabel(v.client);
    bar.appendChild(t);
    bar.appendChild(c);
    card.appendChild(bar);
    card.addEventListener('click', function () { openPlayer(v); });
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
      grid.appendChild(makeCard(v));
      shown++;
    });
    if (workCountEl) workCountEl.textContent = shown + (shown === 1 ? ' project' : ' projects');
    if (!shown) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      var msg = 'No videos published yet.';
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
      window.dispatchEvent(new CustomEvent('portfolio:grid-rendered', { detail: { shown: shown } }));
    }
  }

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
  var formatEl = document.getElementById('field-format');
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
      format: formatEl ? formatEl.value : '',
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
      'Format: ' + d.format,
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
      format: d.format,
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
