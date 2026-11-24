// Home page photo carousel (PRDs/photoCarousel.md). A small, self-contained
// component with no dependencies:
//   <div class="carousel" data-carousel aria-label="…"> + js/gallery-config.js
// The first photo is in the HTML already (no layout shift, works without
// JavaScript); this script adds the rest from window.MATHLETE_GALLERY.
//
//  - Crossfades every 5.5 s, looping. Prev / next arrows, dots, swipe, and
//    the arrow keys when the carousel has focus. (More than 10 photos: a
//    "7 / 27" counter in place of the dots.)
//  - Pauses while the pointer is over it, while anything in it has focus,
//    when the tab is hidden, and when the visitor presses Pause. Rotation
//    never steals focus, and it's silent for screen readers; manual moves
//    are announced.
//  - prefers-reduced-motion: no automatic rotation and no fade.
//  - Only the current and next photos are loaded.
(function () {
  'use strict';
  var INTERVAL = 5500, SWIPE = 40, MAX_DOTS = 10;
  var photos = window.MATHLETE_GALLERY || [];
  var root = document.querySelector('[data-carousel]');
  if (!root || photos.length < 2) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var make = function (tag, cls, attrs) { var n = document.createElement(tag); if (cls) n.className = cls; for (var k in (attrs || {})) n.setAttribute(k, attrs[k]); return n; };

  var track = root.querySelector('.carousel-track');
  var first = track.querySelector('.carousel-slide');
  var slides = [];
  photos.forEach(function (p, i) {
    var slide = i === 0 && first ? first : make('figure', 'carousel-slide');
    var img = slide.querySelector('img');
    if (!img) {
      img = make('img', null, { alt: p.alt || '', width: '900', height: '1200', decoding: 'async' });
      img.setAttribute('data-src', p.src);
      slide.appendChild(img);
      track.appendChild(slide);
    }
    if (p.position) img.style.objectPosition = p.position;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', (i + 1) + ' of ' + photos.length);
    slides.push(slide);
  });
  var load = function (i) { var img = slides[i].querySelector('img'); var s = img.getAttribute('data-src'); if (s) { img.src = s; img.removeAttribute('data-src'); } };

  // Controls
  var prev = make('button', 'carousel-btn carousel-prev', { type: 'button', 'aria-label': 'Previous photo' });
  var next = make('button', 'carousel-btn carousel-next', { type: 'button', 'aria-label': 'Next photo' });
  prev.textContent = '‹'; next.textContent = '›';
  // Dots for a short gallery; past MAX_DOTS they'd overflow (a phone fits about
  // 12), so a quiet "7 / 27" counter stands in and the arrows and swipe do the rest.
  var useDots = photos.length <= MAX_DOTS;
  var dots = useDots ? make('div', 'carousel-dots', { role: 'group', 'aria-label': 'Choose a photo' })
                     : make('p', 'carousel-count', { 'aria-hidden': 'true' });
  var dotBtns = !useDots ? [] : photos.map(function (p, i) {
    var d = make('button', 'carousel-dot', { type: 'button', 'aria-label': 'Photo ' + (i + 1) + ': ' + (p.alt || '') });
    d.addEventListener('click', function () { go(i, true); });
    dots.appendChild(d); return d;
  });
  var pauseBtn = make('button', 'carousel-btn carousel-pause', { type: 'button' });
  var live = make('p', 'visually-hidden', { 'aria-live': 'polite' });
  root.append(prev, next, dots, pauseBtn, live);
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.classList.add('is-ready');
  if (reduce) root.classList.add('is-still');

  var cur = 0, timer = null, hover = false, focusIn = false, stopped = reduce;
  function go(i, byUser) {
    cur = (i + slides.length) % slides.length;
    load(cur); load((cur + 1) % slides.length);
    slides.forEach(function (s, k) { s.classList.toggle('is-current', k === cur); s.setAttribute('aria-hidden', String(k !== cur)); });
    if (!useDots) dots.textContent = (cur + 1) + ' / ' + slides.length;
    dotBtns.forEach(function (d, k) { if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    if (byUser) live.textContent = 'Photo ' + (cur + 1) + ' of ' + slides.length + ': ' + (photos[cur].alt || '');
    schedule();
  }
  function playing() { return !stopped && !hover && !focusIn && !document.hidden; }
  function schedule() {
    clearTimeout(timer);
    if (playing()) timer = setTimeout(function () { go(cur + 1, false); }, INTERVAL);
    pauseBtn.textContent = stopped ? '▶' : '❚❚';
    pauseBtn.setAttribute('aria-label', stopped ? 'Play the slideshow' : 'Pause the slideshow');
  }
  prev.addEventListener('click', function () { go(cur - 1, true); });
  next.addEventListener('click', function () { go(cur + 1, true); });
  pauseBtn.addEventListener('click', function () { stopped = !stopped; schedule(); });
  root.addEventListener('mouseenter', function () { hover = true; schedule(); });
  root.addEventListener('mouseleave', function () { hover = false; schedule(); });
  root.addEventListener('focusin', function () { focusIn = true; schedule(); });
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { focusIn = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); }
  });
  // Swipe (touch and pen; mouse drags are left alone).
  var sx = null, sy = null;
  root.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
  root.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = sy = null;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1), true);
  });
  root.addEventListener('pointercancel', function () { sx = sy = null; });
  go(0, false);
})();
