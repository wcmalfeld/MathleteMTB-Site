// Tutoring booking page (book.html).
//
// Step 1 picks the subject (preselected from ?subject=math|physics|sat).
// Step 2 loads the Calendly scheduler for that subject, with the subject
// already filled in. Calendly takes it from there: date, time, length,
// student and parent details, payment, Zoom link and confirmations.
// Settings live in js/booking-config.js.
//
// If Calendly isn't set up yet, or doesn't load, the visitor gets an
// email link with the subject filled in instead. Nothing a visitor types
// on this page is stored by this site.
(function () {
  'use strict';

  var cfg = window.MATHLETE_BOOKING || {};

  // ---------- prices (tutoring.html and book.html; only when set) ----------
  var priceBox = document.querySelector('[data-booking-prices]');
  if (priceBox && cfg.prices && cfg.prices.length) {
    var dl = priceBox.querySelector('dl');
    cfg.prices.forEach(function (p) {
      var dt = document.createElement('dt');
      dt.textContent = p.label;
      var dd = document.createElement('dd');
      dd.textContent = p.price;
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    priceBox.hidden = false;
  }

  var form = document.getElementById('book-subjects');
  if (!form) return;

  var subjects = cfg.subjects || [];
  var track = window.mathleteTrack || function () {};
  var OWNER_EMAIL = 'wcmalfeld@gmail.com';
  var WIDGET = 'https://assets.calendly.com/assets/external/widget.js';

  var step2 = document.getElementById('book-step-time');
  var calendar = document.getElementById('book-calendar');
  var fallback = document.getElementById('book-fallback');
  var fallbackLink = document.getElementById('book-fallback-link');
  var done = document.getElementById('book-done');
  var hint = document.getElementById('book-pick-hint');
  var current = null;

  function byId(id) {
    for (var i = 0; i < subjects.length; i++) if (subjects[i].id === id) return subjects[i];
    return null;
  }

  function schedulerUrl(subject) {
    var url = (subject.calendlyUrl || cfg.calendlyUrl || '').trim();
    return /^https:\/\/calendly\.com\//.test(url) ? url : '';
  }

  // ---------- email fallback ----------
  function showFallback(subject, reason) {
    calendar.hidden = true;
    calendar.replaceChildren();
    var body = [
      'Subject: ' + subject.name,
      'Student grade: ',
      'Preferred session length: ',
      'Days and times that work: ',
      'What the student needs help with: ',
      '',
      'Parent/guardian name and phone: '
    ].join('\n');
    fallbackLink.href = 'mailto:' + OWNER_EMAIL +
      '?subject=' + encodeURIComponent('Tutoring session request: ' + subject.name) +
      '&body=' + encodeURIComponent(body);
    document.getElementById('book-fallback-reason').textContent = reason;
    fallback.hidden = false;
  }

  // ---------- Calendly ----------
  var widgetLoading = null;
  function loadWidget() {
    if (window.Calendly) return Promise.resolve();
    if (widgetLoading) return widgetLoading;
    widgetLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = WIDGET;
      s.async = true;
      s.onload = function () { window.Calendly ? resolve() : reject(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    widgetLoading.catch(function () { widgetLoading = null; });
    return widgetLoading;
  }

  function showCalendar(subject) {
    var url = schedulerUrl(subject);
    fallback.hidden = true;
    if (!url) return showFallback(subject, 'Online booking is still being set up.');

    calendar.hidden = false;
    calendar.replaceChildren();
    calendar.setAttribute('aria-busy', 'true');
    var loading = document.createElement('p');
    loading.className = 'book-loading';
    loading.textContent = 'Loading available times…';
    calendar.appendChild(loading);

    loadWidget().then(function () {
      if (current !== subject) return; // the subject changed while loading
      calendar.replaceChildren();
      var answers = {};
      answers[cfg.subjectAnswer || 'a1'] = subject.name;
      window.Calendly.initInlineWidget({
        url: url + (url.indexOf('?') === -1 ? '?' : '&') +
          'hide_gdpr_banner=1&primary_color=c1502e&text_color=1f2b24&background_color=f7f5ee',
        parentElement: calendar,
        prefill: { customAnswers: answers },
        utm: { utmSource: 'mathletemtb.com', utmContent: subject.id }
      });
      calendar.removeAttribute('aria-busy');
      track('booking_calendar_loaded');
    }).catch(function () {
      calendar.removeAttribute('aria-busy');
      track('booking_calendar_error');
      showFallback(subject, 'The booking calendar didn’t load. It may be blocked by a browser extension or your connection.');
    });
  }

  // Calendly reports progress to the page it's embedded in.
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calendly.com' || !e.data || typeof e.data.event !== 'string') return;
    if (e.data.event === 'calendly.date_and_time_selected') track('booking_time_selected');
    if (e.data.event === 'calendly.event_scheduled') {
      track('booking_completed');
      if (current) track('booking_completed_' + current.id);
      done.hidden = false;
      done.focus();
    }
  });

  // ---------- subject choice ----------
  function choose(id, fromLink) {
    var subject = byId(id);
    if (!subject) return;
    current = subject;
    hint.hidden = true;
    step2.hidden = false;
    document.getElementById('book-subject-name').textContent = subject.name;
    try { history.replaceState(null, '', '?subject=' + encodeURIComponent(id) + '#book'); } catch (e) {}
    track('booking_subject_' + id);
    showCalendar(subject);
    if (!fromLink) step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'subject') choose(e.target.value, false);
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  var wanted = new URLSearchParams(location.search).get('subject');
  var radio = wanted && form.querySelector('input[name="subject"][value="' + wanted.replace(/[^a-z]/g, '') + '"]');
  if (radio) {
    radio.checked = true;
    choose(radio.value, true);
  }
})();
