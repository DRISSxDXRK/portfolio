/* Before / after slider — Stage 1.
 *
 * Data file: add entries here when Driss supplies a raw + edited pair.
 * Entry shape:
 *   { title: '...', before: { src: 'videos/raw.mp4', poster: 'thumbs/raw.jpg', label: 'Raw footage' },
 *     after:  { src: 'videos/edited.mp4', poster: 'thumbs/edited.jpg', label: 'Finished edit' } }
 * Empty by default: nothing is rendered at all (no section, no heading)
 * until at least one entry with both src values exists. */
window.BEFORE_AFTER = [];

(function () {
  'use strict';
  var items = (window.BEFORE_AFTER || []).filter(function (it) {
    return it && it.before && it.before.src && it.after && it.after.src;
  });
  if (!items.length) return;
  var mount = document.getElementById('before-after-mount');
  if (!mount) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeVideo(spec) {
    var v = document.createElement('video');
    v.src = spec.src;
    if (spec.poster) v.poster = spec.poster;
    v.preload = 'none';
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-label', spec.label || 'Video');
    return v;
  }

  var section = document.createElement('section');
  section.className = 'before-after';
  section.setAttribute('aria-labelledby', 'before-after-title');
  var kicker = document.createElement('p');
  kicker.className = 'sec-kicker';
  kicker.innerHTML = '<span>02</span>Before &amp; After';
  var title = document.createElement('h2');
  title.className = 'sec-title';
  title.id = 'before-after-title';
  title.innerHTML = 'Raw footage, <em>finished edit.</em>';
  section.appendChild(kicker);
  section.appendChild(title);

  items.forEach(function (item, idx) {
    var wrap = document.createElement('div');
    wrap.className = 'ba-item';
    if (item.title) {
      var h = document.createElement('h3');
      h.className = 'ba-title';
      h.textContent = item.title;
      wrap.appendChild(h);
    }

    var stage = document.createElement('div');
    stage.className = 'ba-stage';
    var beforeVideo = makeVideo(item.before);
    var afterVideo = makeVideo(item.after);
    afterVideo.className = 'ba-after';
    stage.appendChild(beforeVideo);
    stage.appendChild(afterVideo);

    var divider = document.createElement('div');
    divider.className = 'ba-divider';
    divider.setAttribute('aria-hidden', 'true');
    stage.appendChild(divider);

    function tag(text, cls) {
      var s = document.createElement('span');
      s.className = 'ba-tag ' + cls;
      s.textContent = text;
      return s;
    }
    stage.appendChild(tag(item.before.label || 'Before', 'ba-tag-before'));
    stage.appendChild(tag(item.after.label || 'After', 'ba-tag-after'));

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'ba-slider';
    slider.min = '0'; slider.max = '100'; slider.step = '1'; slider.value = '50';
    slider.setAttribute('aria-label', 'Drag to compare raw footage with the finished edit');
    stage.appendChild(slider);

    function setSplit(pct) {
      afterVideo.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      divider.style.left = pct + '%';
    }
    slider.addEventListener('input', function () { setSplit(Number(slider.value)); });
    setSplit(50);

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'btn btn-ghost ba-play';
    playBtn.textContent = 'Play both';
    playBtn.setAttribute('aria-label', 'Play or pause both videos');
    var playing = false;
    function pauseBoth() {
      beforeVideo.pause(); afterVideo.pause();
      playing = false; playBtn.textContent = 'Play both';
    }
    playBtn.addEventListener('click', function () {
      if (playing) { pauseBoth(); return; }
      // One video at a time across the site: pause everything else first.
      document.querySelectorAll('video').forEach(function (v) {
        if (v !== beforeVideo && v !== afterVideo && !v.paused) v.pause();
      });
      beforeVideo.currentTime = afterVideo.currentTime = 0;
      var p1 = beforeVideo.play(), p2 = afterVideo.play();
      playing = true; playBtn.textContent = 'Pause';
      if (p1 && p1.catch) p1.catch(pauseBoth);
      if (p2 && p2.catch) p2.catch(pauseBoth);
    });
    beforeVideo.addEventListener('pause', function () { if (playing) pauseBoth(); });
    afterVideo.addEventListener('pause', function () { if (playing) pauseBoth(); });

    wrap.appendChild(stage);
    wrap.appendChild(playBtn);
    section.appendChild(wrap);
  });

  // Reduced motion: no autoplay anywhere here; playback is tap-only anyway.
  if (reduced) { /* nothing to disable: videos only play on button tap */ }
  mount.appendChild(section);
})();
