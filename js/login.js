// Login page: email + password sign-in, and "forgot password".
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var params = new URLSearchParams(location.search);
  var next = A.safeNext(params.get('next')) || 'index.html#tools';

  var notice = document.getElementById('notice');
  var form = document.getElementById('login-form');
  var button = document.getElementById('login-button');
  var forgotToggle = document.getElementById('forgot-toggle');
  var forgotForm = document.getElementById('forgot-form');
  var forgotButton = document.getElementById('forgot-button');

  var MESSAGES = {
    login:        ['info', 'Please log in to open that tool.'],
    expired:      ['info', 'Your session has ended. Please log in again.'],
    unauthorized: ['error', 'That account doesn’t have access to member tools right now. If you think that’s a mistake, get in touch.'],
    signedout:    ['success', 'You’ve been logged out.'],
    password:     ['success', 'Your password is set. Log in with your new password.']
  };

  function show(kind, text) {
    notice.className = 'notice notice--' + kind;
    notice.textContent = text;
    notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    notice.hidden = false;
  }

  var reason = params.get('reason');
  if (MESSAGES[reason]) show(MESSAGES[reason][0], MESSAGES[reason][1]);

  if (!A.configured) {
    show('error', 'Member login isn’t set up yet. The public learning tools still work without an account.');
    form.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });
    forgotToggle.hidden = true;
    return;
  }

  // Already signed in with access? Go straight on.
  if (A.hasStoredSession() && reason !== 'unauthorized') {
    A.status().then(function (st) { if (st.member) location.replace(next); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.email.value.trim();
    var password = form.password.value;
    if (!email || !password) return show('error', 'Enter your email and password.');
    button.disabled = true;
    button.textContent = 'Logging in…';

    A.signIn(email, password).then(function (res) {
      if (res.error) {
        var s = res.error.status;
        if (s === 400) show('error', 'That email and password don’t match an account.');
        else if (s === 429) show('error', 'Too many attempts. Wait a minute and try again.');
        else show('error', 'Couldn’t log in right now. Try again in a moment.');
        return;
      }
      // Signed in. Now ask the server whether this account has access.
      return A.status({ force: true }).then(function (st) {
        if (st.member) { location.replace(next); return; }
        if (st.error) { show('error', 'Couldn\u2019t check your access just now. Try again in a moment.'); return A.signOut(); }
        return A.signOut().then(function () { show(MESSAGES.unauthorized[0], MESSAGES.unauthorized[1]); });
      });
    }).catch(function () {
      show('error', 'Couldn’t reach the login service. Check your connection and try again.');
    }).then(function () {
      button.disabled = false;
      button.textContent = 'Log in';
      form.password.value = '';
    });
  });

  forgotToggle.addEventListener('click', function () {
    var open = forgotForm.hidden;
    forgotForm.hidden = !open;
    forgotToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      forgotForm.email.value = form.email.value;
      forgotForm.email.focus();
    }
  });

  forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = forgotForm.email.value.trim();
    if (!email) return show('error', 'Enter your email.');
    forgotButton.disabled = true;
    A.client().then(function (sb) {
      return sb.auth.resetPasswordForEmail(email, {
        redirectTo: new URL('account.html', location.href).href
      });
    }).catch(function () {}).then(function () {
      // Same message either way, so the form can't be used to find accounts.
      show('success', 'If that email has an account, a link to set a new password is on its way.');
      forgotButton.disabled = false;
    });
  });
})();
