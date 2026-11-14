// Invitation page (join.html#t=TOKEN): shows who invited you, then
//   - signed in with the invited address: one button to accept;
//   - signed in as someone else: says so, offers to log out;
//   - has an account but signed out: log in, then come back here;
//   - new to Mathlete: choose a password, and the `join` server function
//     (supabase/functions/join) creates the account and accepts in one step.
//
// What this file does NOT do: decide anything. The database checks the
// invitation (hash match, expiry, not used, the right email address) on
// every step; see supabase/organizations.sql, section 11b.
//
// The token is kept in sessionStorage (this tab only) so it survives the
// trip through the login page, and is removed from the address bar at once.
// Text from the database is put on the page as text, never as HTML.
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var KEY = 'mathlete-invite';
  var panel = document.getElementById('join-panel');
  var title = document.getElementById('join-title');
  var lede = document.getElementById('join-lede');

  var ROLE_WORDS = { owner: 'an owner', admin: 'an administrator', instructor: 'an instructor', student: 'a student' };

  function el(tag, attrs) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) n.appendChild(typeof arguments[i] === 'string' ? document.createTextNode(arguments[i]) : arguments[i]);
    return n;
  }
  function store(v) { try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch (e) { /* private mode */ } }
  function stored() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }

  // Draw a fresh panel: an optional notice, then the given nodes.
  function render(notice, nodes) {
    while (panel.firstChild) panel.removeChild(panel.firstChild);
    if (notice) {
      panel.appendChild(el('div', { class: 'notice notice--' + notice[0], role: notice[0] === 'error' ? 'alert' : 'status', text: notice[1] }));
    }
    (nodes || []).forEach(function (n) { if (n) panel.appendChild(n); });
  }
  function head(t, l) { title.textContent = t; lede.textContent = l; }
  function actions() {
    var p = el('p', { class: 'form-actions' });
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) p.appendChild(arguments[i]);
    return p;
  }
  function link(href, text, primary) { return el('a', { href: href, class: primary ? 'button' : 'read-link', text: text }); }

  // ---------- the token ----------
  var m = /(?:^#|&)t=([0-9a-f]{64})(?:&|$)/.exec(location.hash || '');
  var token = m ? m[1] : stored();
  if (m) {
    store(token);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* old browsers keep it */ }
  }

  if (!A || !A.configured) {
    head('Join Mathlete', 'Accounts aren’t set up on this copy of the site.');
    return render(['error', 'Member accounts aren’t switched on here.'], []);
  }
  if (!token) {
    head('Join Mathlete', 'This page opens from the invitation link in your email.');
    return render(['info', 'Open the link in your invitation email. If it doesn’t work, ask whoever invited you to send a new invitation.'], []);
  }

  var sb, preview, me = null;

  A.client().then(function (client) {
    sb = client;
    return Promise.all([
      sb.rpc('invitation_preview', { p_token: token }),
      A.hasStoredSession() ? A.status() : Promise.resolve({ user: null })
    ]);
  }).then(function (r) {
    var res = r[0];
    me = r[1] && r[1].user ? r[1].user : null;
    if (res.error) {
      var off = res.error.code === 'PGRST202' || res.error.code === '42883';
      head('Join Mathlete', off ? 'Invitations aren’t switched on yet.' : 'We couldn’t check your invitation.');
      return render(['error', off ? 'Invitations aren’t switched on yet. Please try again later.' : 'Check your connection and try again.'], [actions(link(location.pathname, 'Try again', true))]);
    }
    preview = res.data || {};
    show();
  }).catch(function () {
    head('Join Mathlete', 'We couldn’t check your invitation.');
    render(['error', 'Couldn’t reach Mathlete. Check your connection and try again.'], [actions(link(location.pathname, 'Try again', true))]);
  });

  function show() {
    var p = preview;
    if (p.status === 'not_found') {
      store(null);
      head('Join Mathlete', 'That invitation link isn’t valid.');
      return render(['error', 'This link doesn’t match an invitation. It may have been copied incompletely, or replaced by a newer invitation. Use the most recent email, or ask for a new invitation.'], []);
    }
    head('Join ' + p.organization, (p.organization || 'A school') + ' has invited you to Mathlete as ' + (ROLE_WORDS[p.role] || p.role) + '.');
    if (p.status === 'expired') {
      store(null);
      return render(['error', 'This invitation has expired. Ask ' + p.organization + ' to send you a new one.'], []);
    }
    if (p.status !== 'pending') {
      store(null);
      return render(['info', 'This invitation has already been used or was withdrawn.'], [
        me ? actions(link('dashboard.html', 'Go to your dashboard', true)) : actions(link('login.html', 'Log in', true))
      ]);
    }
    var who = el('dl', { class: 'join-facts' },
      el('dt', { text: 'Organization' }), el('dd', { text: p.organization }),
      el('dt', { text: 'Role' }), el('dd', { text: (p.role || '').charAt(0).toUpperCase() + (p.role || '').slice(1) }),
      el('dt', { text: 'Email' }), el('dd', { text: p.email }),
      el('dt', { text: 'Expires' }), el('dd', { text: new Date(p.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }));

    if (me) {
      if ((me.email || '').toLowerCase() === (p.email || '').toLowerCase()) return showAccept(who);
      var out = el('button', { class: 'button', type: 'button', text: 'Log out' });
      out.addEventListener('click', function () { out.disabled = true; A.signOut().then(function () { location.reload(); }); });
      return render(['error', 'You’re logged in as ' + me.email + ', but this invitation is for ' + p.email + '. Log out, then open the link again to accept it with the right account.'], [who, actions(out)]);
    }
    if (p.account_exists) {
      return render(['info', 'You already have a Mathlete account with ' + p.email + '. Log in to accept.'], [who, actions(link('login.html?reason=invite&next=join.html', 'Log in to accept', true))]);
    }
    showCreate(who);
  }

  function showAccept(who) {
    var btn = el('button', { class: 'button', type: 'button', text: 'Accept invitation' });
    btn.addEventListener('click', function () {
      btn.disabled = true; btn.textContent = 'Accepting…';
      sb.rpc('accept_invitation', { p_token: token }).then(function (r) {
        if (r.error) {
          btn.disabled = false; btn.textContent = 'Accept invitation';
          return render(['error', r.error.message || 'Couldn’t accept the invitation.'], [who, actions(btn)]);
        }
        done(r.data || {});
      }).catch(function () {
        btn.disabled = false; btn.textContent = 'Accept invitation';
        render(['error', 'Couldn’t reach Mathlete. Check your connection and try again.'], [who, actions(btn)]);
      });
    });
    render(null, [who, el('p', { class: 'form-note', text: 'You’re logged in as ' + me.email + '.' }), actions(btn)]);
  }

  function showCreate(who) {
    var form = el('form', { class: 'form', novalidate: true },
      el('div', { class: 'field' },
        el('label', { for: 'join-first', text: 'First name' }),
        el('input', { class: 'input', id: 'join-first', name: 'first', type: 'text', autocomplete: 'given-name', maxlength: '60', required: true, value: preview.first_name || '' })),
      el('div', { class: 'field' },
        el('label', { for: 'join-email', text: 'Email' }),
        el('input', { class: 'input', id: 'join-email', name: 'email', type: 'email', autocomplete: 'username', value: preview.email, readonly: true }),
        el('p', { class: 'field-hint', text: 'Your invitation is for this address; it will be your login.' })),
      el('div', { class: 'field' },
        el('label', { for: 'join-password', text: 'Choose a password' }),
        el('input', { class: 'input', id: 'join-password', name: 'password', type: 'password', autocomplete: 'new-password', minlength: '8', maxlength: '72', required: true }),
        el('p', { class: 'field-hint', text: 'At least 8 characters.' })),
      el('div', { class: 'field' },
        el('label', { for: 'join-confirm', text: 'Type it again' }),
        el('input', { class: 'input', id: 'join-confirm', name: 'confirm', type: 'password', autocomplete: 'new-password', maxlength: '72', required: true })));
    var btn = el('button', { class: 'button', type: 'submit', text: 'Create account and join' });
    form.appendChild(el('div', { class: 'form-actions' }, btn));
    var note = el('div', { class: 'notice', hidden: true });
    function say(kind, text) { note.className = 'notice notice--' + kind; note.textContent = text; note.setAttribute('role', kind === 'error' ? 'alert' : 'status'); note.hidden = false; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = form.first.value.trim(), pw = form.password.value;
      if (!first) return say('error', 'Enter your first name.');
      if (pw.length < 8) return say('error', 'Choose a password of at least 8 characters.');
      if (pw !== form.confirm.value) return say('error', 'The two passwords don’t match.');
      btn.disabled = true; btn.textContent = 'Creating your account…';
      var reset = function () { btn.disabled = false; btn.textContent = 'Create account and join'; };
      sb.functions.invoke('join', { body: { token: token, password: pw, first_name: first } }).then(function (r) {
        if (!r.error) return r.data;
        var ctx = r.error.context;
        // Not deployed yet, or unreachable: no response we can read.
        if (!ctx || typeof ctx.json !== 'function') throw { offline: true };
        return ctx.json().catch(function () { return {}; }).then(function (body) { throw { status: ctx.status, body: body || {} }; });
      }).then(function (data) {
        // Account made and invitation accepted: log in with it.
        return A.signIn(preview.email, pw).then(function (s) {
          if (s.error) {
            store(null);
            head('Welcome to ' + preview.organization, 'Your account is ready.');
            return render(['success', 'Your account is ready and you’ve joined ' + preview.organization + '. Log in with ' + preview.email + ' and the password you just chose.'], [actions(link('login.html', 'Log in', true))]);
          }
          done(data);
        });
      }).catch(function (err) {
        reset();
        form.password.value = ''; form.confirm.value = '';
        if (err && err.offline) return say('error', 'Account setup isn’t available right now. Please try again later, or ask whoever invited you for help.');
        if (err && err.status === 404 && !(err.body && err.body.error)) return say('error', 'Account setup isn’t switched on yet. Please ask whoever invited you for help.');
        if (err && err.body && err.body.code === 'account_exists') { preview.account_exists = true; return show(); }
        say('error', (err && err.body && err.body.error) || 'Couldn’t create your account just now. Try again in a moment.');
      });
    });
    render(null, [who, el('p', { class: 'form-note', text: 'New to Mathlete? Choose a password to finish setting up your account.' }), note, form]);
  }

  function done(result) {
    store(null);
    var manage = result.role === 'owner' || result.role === 'admin';
    var org = result.organization || preview.organization;
    head('Welcome to ' + org, 'You’ve joined ' + org + ' as ' + (ROLE_WORDS[result.role] || result.role) + '.');
    var notOpen = result.organization_status && result.organization_status !== 'active';
    render(['success', 'You’re in. ' + (manage ? 'You can now set up and manage ' + org + '.' : notOpen ? org + ' hasn’t opened Mathlete to students yet; your dashboard will show when it does.' : 'Your dashboard is ready.')],
      [actions(link(manage ? 'organization.html' : 'dashboard.html', manage ? 'Go to your organization' : 'Go to your dashboard', true),
               manage ? link('dashboard.html', 'Your dashboard') : null)]);
  }
})();
