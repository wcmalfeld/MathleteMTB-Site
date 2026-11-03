// College & Beyond inquiry form (college-beyond.html).
//
// Sends the form to the Supabase table public.inquiries with the public
// anon key. That key can only add a row: it can't read, change or delete
// inquiries (see section 4 of supabase/setup.sql), and the database
// rejects anything outside the form's own options.
//
// If sending isn't possible (not configured, offline, rate-limited), the
// visitor keeps everything they typed and gets an email link with their
// answers already filled in.
(function () {
  'use strict';

  var form = document.getElementById('inquiry-form');
  if (!form) return;

  var cfg = window.MATHLETE_SUPABASE || {};
  var configured = !!(cfg.url && cfg.anonKey);
  var OWNER_EMAIL = 'wcmalfeld@gmail.com';
  var notice = document.getElementById('inquiry-notice');
  var button = document.getElementById('inquiry-button');
  var buttonText = button.textContent;
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function field(name) { return form.elements.namedItem(name); }

  // ---------- analytics ----------
  // js/track.js sends events (and handles data-track clicks).
  var track = window.mathleteTrack || function () {};
  track('college_beyond_page_view');
  var started = false;
  form.addEventListener('input', function () {
    if (started) return;
    started = true;
    track('college_beyond_form_start');
  });

  // ---------- validation ----------
  var rules = [
    { el: 'inq-name', error: 'inq-name-error', focus: 'inq-name',
      check: function () { return field('name').value.trim() ? '' : 'Enter your name.'; } },
    { el: 'inq-email', error: 'inq-email-error', focus: 'inq-email',
      check: function () {
        var v = field('email').value.trim();
        if (!v) return 'Enter your email address.';
        return EMAIL_RE.test(v) ? '' : 'Enter an email address like name@example.com.';
      } },
    { el: 'inq-role', error: 'inq-role-error', focus: function () { return form.querySelector('[name="reaching_out_as"]'); },
      check: function () { return checked('reaching_out_as').length ? '' : 'Choose who is reaching out.'; } },
    { el: 'inq-grade', error: 'inq-grade-error', focus: 'inq-grade',
      check: function () { return field('grade').value ? '' : 'Choose the student’s current grade.'; } },
    { el: 'inq-help', error: 'inq-help-error', focus: function () { return form.querySelector('[name="help_with"]'); },
      check: function () { return checked('help_with').length ? '' : 'Choose at least one thing you’d like help with (“Not sure yet” is fine).'; } },
    { el: 'inq-consent', error: 'inq-consent-error', focus: 'inq-consent',
      check: function () { return field('consent').checked ? '' : 'Please agree to be contacted so I can reply.'; } }
  ];

  function checked(name) {
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]:checked'))
      .map(function (i) { return i.value; });
  }

  function setError(rule, msg) {
    var el = document.getElementById(rule.el);
    var err = document.getElementById(rule.error);
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function focusTarget(rule) {
    return typeof rule.focus === 'function' ? rule.focus() : document.getElementById(rule.focus);
  }

  function validate() {
    var failed = [];
    rules.forEach(function (rule) {
      var msg = rule.check();
      setError(rule, msg);
      if (msg) failed.push(rule);
    });
    return failed;
  }

  // Once a field has shown an error, re-check it as the visitor fixes it.
  form.addEventListener('change', recheck);
  form.addEventListener('input', recheck);
  function recheck(e) {
    rules.forEach(function (rule) {
      var box = document.getElementById(rule.el);
      if (box.getAttribute('aria-invalid') === 'true' && (box === e.target || box.contains(e.target))) {
        setError(rule, rule.check());
      }
    });
  }

  // ---------- messages ----------
  function show(kind, nodes) {
    notice.className = 'notice notice--' + kind;
    notice.replaceChildren.apply(notice, nodes);
    notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    notice.hidden = false;
  }

  function text(s) { return document.createTextNode(s); }

  function mailtoLink(label) {
    var d = collect();
    var lines = [
      'Service: College & Beyond Mentorship',
      'Name: ' + d.name,
      'Email: ' + d.email,
      'Reaching out as: ' + (d.reaching_out_as || ''),
      'Grade: ' + (d.grade || ''),
      'Help with: ' + labelsFor('help_with').join('; ')
    ];
    if (d.student_first_name) lines.push('Student first name: ' + d.student_first_name);
    if (d.timeline) lines.push('Timeline: ' + field('timeline').options[field('timeline').selectedIndex].text);
    if (d.message) lines.push('', d.message);
    var a = document.createElement('a');
    a.href = 'mailto:' + OWNER_EMAIL +
      '?subject=' + encodeURIComponent('College & Beyond Mentorship inquiry') +
      '&body=' + encodeURIComponent(lines.join('\n'));
    a.textContent = label;
    return a;
  }

  function labelsFor(name) {
    return Array.prototype.slice.call(form.querySelectorAll('[name="' + name + '"]:checked'))
      .map(function (i) { return i.parentNode.textContent.trim(); });
  }

  function showFailure(intro) {
    show('error', [
      text(intro + ' Everything you entered is still here. You can try again, or '),
      mailtoLink('send it by email instead'),
      text(' (your answers are filled in), or write to ' + OWNER_EMAIL + '.')
    ]);
    notice.focus();
  }

  // ---------- sending ----------
  function collect() {
    var str = function (v) { v = (v || '').trim(); return v || null; };
    return {
      service: 'college-beyond',
      name: field('name').value.trim(),
      email: field('email').value.trim(),
      reaching_out_as: checked('reaching_out_as')[0] || null,
      grade: field('grade').value || null,
      help_with: checked('help_with'),
      student_first_name: str(field('student_first_name').value),
      timeline: field('timeline').value || null,
      message: str(field('message').value),
      consent: field('consent').checked,
      source_page: location.pathname.slice(0, 200)
    };
  }

  function send(data) {
    var url = cfg.url.replace(/\/+$/, '') + '/rest/v1/inquiries';
    var headers = { 'Content-Type': 'application/json', apikey: cfg.anonKey, Prefer: 'return=minimal' };
    // Legacy anon keys are JWTs and go in Authorization too; the newer
    // publishable keys only go in apikey.
    if (/^eyJ/.test(cfg.anonKey)) headers.Authorization = 'Bearer ' + cfg.anonKey;
    return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) });
  }

  function succeed() {
    form.hidden = true;
    show('success', [text('Thanks for reaching out. Your inquiry has been sent. I’ll follow up using the contact details you provided.')]);
    notice.focus();
    track('college_beyond_form_submit_success');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    notice.hidden = true;

    // Spam trap filled in: act as if it worked, send nothing.
    if (field('website').value) return succeed();

    var failed = validate();
    if (failed.length) {
      show('error', [text(failed.length === 1
        ? 'One thing needs fixing before this can be sent: ' + document.getElementById(failed[0].error).textContent
        : failed.length + ' things need fixing before this can be sent. They’re marked below.')]);
      var target = focusTarget(failed[0]);
      if (target) target.focus();
      return;
    }

    if (!configured || typeof fetch !== 'function') {
      track('college_beyond_form_submit_error');
      return showFailure('The form can’t send messages from here right now.');
    }

    button.disabled = true;
    button.textContent = 'Sending…';
    send(collect()).then(function (res) {
      if (res.ok) return succeed();
      track('college_beyond_form_submit_error');
      showFailure(res.status === 429 || res.status >= 500
        ? 'The form is busy right now, so your inquiry wasn’t sent.'
        : 'Something went wrong and your inquiry wasn’t sent.');
    }).catch(function () {
      track('college_beyond_form_submit_error');
      showFailure('Your inquiry couldn’t be sent. Check your connection.');
    }).then(function () {
      button.disabled = false;
      button.textContent = buttonText;
    });
  });
})();
