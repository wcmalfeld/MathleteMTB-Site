// Analytics hook shared by every page.
//
// There's no analytics on the site yet. If one is added later
// (Plausible, Google Analytics / Tag Manager), these events reach it
// automatically. Event names only: never personal details.
//
// Any link or button with data-track="event_name" sends that event when
// it's clicked, e.g. the "Book a Session" buttons (book_cta_*).
(function () {
  'use strict';

  function track(name) {
    try {
      if (typeof window.plausible === 'function') window.plausible(name);
      else if (typeof window.gtag === 'function') window.gtag('event', name);
      else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name });
    } catch (e) {}
  }
  window.mathleteTrack = track;

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'));
  });
})();
