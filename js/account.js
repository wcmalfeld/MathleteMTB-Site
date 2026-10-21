// Account page: set a password from an invite or reset link, or change it
// while signed in. Supabase reads the one-time token from the link itself.
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var notice = document.getElementById('notice');
  var form = document.getElementById('password-form');
  var button = document.getElementById('password-button');
  var hash = new URLSearchParams((location.hash || '').replace(/^#/, ''));
  var linkType = hash.get('type');

  function show(kind, text) {
    notice.className = 'notice notice--' + kind;
    notice.textContent = text;
    notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    notice.hidden = false;
  }

  if (hash.get('error') || hash.get('error_code')) {
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    show('error', 'This link has expired or was already used. Use “Forgot your password?” on the login page to get a new one, or ask me to resend your invite.');
    return;
  }

  if (!A.configured) {
    show('error', 'Member accounts aren’t set up yet.');
    return;
  }

  if (linkType === 'invite') {
    document.getElementById('account-heading').textContent = 'Welcome Aboard';
    document.getElementById('account-lede').textContent = 'You’ve been invited to Mathlete MTB. Choose a password to finish setting up your account.';
  }

  A.client().then(function (sb) {
    return sb.auth.getUser().then(function (res) {
      var user = res.data && res.data.user;
      if (!user) {
        show('info', 'Open the link from your email to set a password, or log in first to change it.');
        return;
      }
      document.getElementById('account-email').textContent = 'Account: ' + user.email;
      form.hidden = false;
      form.password.focus();

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var pw = form.password.value, confirm = form.confirm.value;
        if (pw.length < 8) return show('error', 'Use at least 8 characters.');
        if (pw !== confirm) return show('error', 'Those passwords don’t match.');
        button.disabled = true;
        sb.auth.updateUser({ password: pw }).then(function (r) {
          if (r.error) {
            show('error', r.error.status === 422
              ? 'Choose a different password (it may be too weak or the same as your current one).'
              : 'Couldn’t save your password. The link may have expired; request a new one from the login page.');
            button.disabled = false;
            return;
          }
          form.reset();
          form.hidden = true;
          return A.status({ force: true }).then(function (st) {
            if (st.member) {
              show('success', 'Password saved. Taking you to the learning tools…');
              setTimeout(function () { location.replace('index.html#tools'); }, 1200);
            } else if (st.error) {
              show('success', 'Password saved. You can now log in.');
            } else {
              return A.signOut().then(function () { location.replace('login.html?reason=password'); });
            }
          });
        });
      });
    });
  }).catch(function () {
    show('error', 'Couldn’t reach the login service. Check your connection and try again.');
  });
})();
