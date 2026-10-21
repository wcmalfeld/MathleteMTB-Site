// Small enhancements. Everything here is optional: the page is fully
// readable without JavaScript.
(function () {
  'use strict';

  // ---------- broken images → a quiet placeholder instead of a broken icon ----------
  function replaceBroken(img) {
    if (img.dataset.broken) return;
    img.dataset.broken = '1';
    var box = document.createElement('div');
    box.className = 'img-missing';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', img.alt || 'Image unavailable');
    box.textContent = img.alt || 'Image unavailable';
    var frame = img.closest('.fig-frame');
    if (frame) frame.removeAttribute('data-lightbox');
    img.replaceWith(box);
  }
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG') replaceBroken(e.target);
  }, true);
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) replaceBroken(img);
  });

  // ---------- nav: highlight the section currently on screen ----------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // ---------- learning tools: open a card's full description in a pop-up ----------
  // Without JavaScript each card is a plain <details> that opens in place.
  var toolCards = Array.prototype.slice.call(document.querySelectorAll('details.tool-card'));
  if (toolCards.length && typeof HTMLDialogElement === 'function') setupToolDialog(toolCards);

  function setupToolDialog(cards) {
    var dlg = document.createElement('dialog');
    dlg.className = 'tool-dialog';
    dlg.setAttribute('aria-labelledby', 'tool-dialog-title');
    dlg.innerHTML =
      '<div class="tool-dialog-head"><div class="tool-dialog-title"></div>' +
      '<button type="button" class="tool-dialog-close" aria-label="Close">' + icon('M6 6l12 12M18 6L6 18') + '</button></div>' +
      '<div class="tool-dialog-body"></div>';
    document.body.appendChild(dlg);

    // Keep the address in sync (so a tool can be linked to) without
    // scrolling. Some browsers refuse this on local files; that's fine.
    function setHash(h) {
      try { history.replaceState(null, '', h); } catch (e) {}
    }

    var titleBox = dlg.querySelector('.tool-dialog-title');
    var body = dlg.querySelector('.tool-dialog-body');
    var current = null;

    function open(card) {
      current = card;
      var kicker = card.querySelector('.kicker').cloneNode(true);
      var title = document.createElement('h3');
      title.className = 'service-title';
      title.id = 'tool-dialog-title';
      title.textContent = card.querySelector('.tool-card-title').textContent;
      titleBox.replaceChildren(kicker, title);
      body.appendChild(card.querySelector('.tool-detail')); // move, so the photo viewer keeps working
      dlg.showModal();
      dlg.scrollTop = 0;
      document.body.classList.add('dialog-open');
      setHash('#' + card.id);
    }

    dlg.addEventListener('close', function () {
      if (current) {
        current.appendChild(body.firstElementChild);
        current.querySelector('summary').focus();
      }
      current = null;
      document.body.classList.remove('dialog-open');
      setHash('#tools');
    });

    cards.forEach(function (card) {
      card.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        open(card);
      });
    });

    dlg.querySelector('.tool-dialog-close').addEventListener('click', function () { dlg.close(); });
    // Click on the dimmed background closes.
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

    // A link straight to a tool (e.g. #tool-trailbuilder) opens it.
    var linked = location.hash && document.getElementById(location.hash.slice(1));
    if (linked && cards.indexOf(linked) !== -1) open(linked);
  }

  // ---------- accessible lightbox for photographs ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (links.length && typeof HTMLDialogElement === 'function') setupLightbox(links);

  function setupLightbox(links) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Photo viewer');
    dlg.innerHTML =
      '<figure class="lb-stage"><img class="lb-img" alt=""><figcaption class="lb-caption"></figcaption></figure>' +
      '<p class="lb-count" aria-live="polite"></p>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close photo viewer">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">' + icon('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">' + icon('M9 5l7 7-7 7') + '</button>';
    document.body.appendChild(dlg);

    var img = dlg.querySelector('.lb-img');
    var cap = dlg.querySelector('.lb-caption');
    var count = dlg.querySelector('.lb-count');
    var index = 0;
    var opener = null;
    var active = links;

    function show(i) {
      index = (i + active.length) % active.length;
      var link = active[index];
      var thumb = link.querySelector('img');
      img.src = link.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      cap.textContent = link.dataset.caption || '';
      count.textContent = (index + 1) + ' / ' + active.length;
    }

    function open(from) {
      // Step through the photos in the same gallery. Re-read the list in
      // case a broken image removed itself from the set.
      var group = from.closest('[data-gallery]');
      active = links.filter(function (l) { return l.hasAttribute('data-lightbox') && l.closest('[data-gallery]') === group; });
      opener = from;
      dlg.toggleAttribute('data-single', active.length < 2);
      show(Math.max(0, active.indexOf(from)));
      dlg.showModal();
      document.body.classList.add('lb-open');
      dlg.querySelector('.lb-close').focus();
    }

    dlg.addEventListener('close', function () {
      document.body.classList.remove('lb-open');
      img.removeAttribute('src');
      if (opener) opener.focus();
    });

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
        if (!link.hasAttribute('data-lightbox')) return;
        e.preventDefault();
        open(link);
      });
    });

    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    // Click on the dark background (not the photo or a button) closes.
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.classList.contains('lb-stage')) dlg.close();
    });

    var startX = null;
    dlg.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (startX === null || active.length < 2) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  function icon(d) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
})();
