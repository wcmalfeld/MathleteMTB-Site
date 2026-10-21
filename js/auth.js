// Member sign-in for Mathlete MTB (Supabase Auth).
//
// What this file does NOT do: decide who may use a private tool. That
// decision is made by the database: private tool files live in a private
// Storage bucket whose row-level-security policy only serves them to a
// signed-in user with an active row in public.members and a live session
// (see supabase/setup.sql). Everything here only shapes what the page
// shows; changing it in the browser cannot unlock anything.
(function () {
  'use strict';

  var SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  var SUPABASE_JS_SRI = 'sha384-0w2KAL2YHP6wKOkUDzkCDGgVvfmHnj02DHeQ6XcHOgTfFsGyonKOpShMH1x6nk9o';
  var STORAGE_KEY = 'mathlete-auth';
  var BUCKET = 'private-tools';

  var cfg = window.MATHLETE_SUPABASE || {};
  var configured = !!(cfg.url && cfg.anonKey);
  var tools = window.MATHLETE_TOOLS || [];

  // Invite, password-reset and expired-link redirects can land on any page
  // (Supabase falls back to the Site URL). Send them to the account page.
  (function forwardAuthLinks() {
    var h = location.hash || '';
    var isAccountPage = /\/account\.html$/.test(location.pathname);
    if (!isAccountPage && /(^|[#&])(type=(invite|recovery|signup|magiclink)|error_code=)/.test(h)) {
      location.replace('account.html' + h);
    }
  })();

  function hasStoredSession() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
  }

  var clientPromise = null;
  function client() {
    if (!configured) return Promise.reject(new Error('not-configured'));
    if (clientPromise) return clientPromise;
    clientPromise = new Promise(function (resolve, reject) {
      function make() {
        resolve(window.supabase.createClient(cfg.url, cfg.anonKey, {
          auth: {
            storageKey: STORAGE_KEY,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'implicit'
          }
        }));
      }
      if (window.supabase && window.supabase.createClient) return make();
      var s = document.createElement('script');
      s.src = SUPABASE_JS;
      s.integrity = SUPABASE_JS_SRI;
      s.crossOrigin = 'anonymous';
      s.onload = make;
      s.onerror = function () { reject(new Error('library-failed')); };
      document.head.appendChild(s);
    });
    return clientPromise;
  }

  // Ask the server who this is and whether they currently have access.
  // Returns { configured, user, member, expired }.
  function status(opts) {
    opts = opts || {};
    if (!configured) return Promise.resolve({ configured: false, user: null, member: false });
    var hadSession = hasStoredSession();
    if (!hadSession && !opts.force) return Promise.resolve({ configured: true, user: null, member: false });
    return client().then(function (sb) {
      return sb.auth.getUser().then(function (res) {
        var user = res.data && res.data.user;
        // A network failure isn't the same as "signed out".
        if (res.error && !res.error.status) return { configured: true, user: null, member: false, error: true };
        if (!user) return { configured: true, user: null, member: false, expired: hadSession };
        return sb.rpc('has_tool_access').then(function (r) {
          if (r.error) return { configured: true, user: user, member: false, error: true };
          return { configured: true, user: user, member: r.data === true };
        });
      });
    }).catch(function () {
      return { configured: configured, user: null, member: false, error: true };
    });
  }

  function signIn(email, password) {
    return client().then(function (sb) {
      return sb.auth.signInWithPassword({ email: email, password: password });
    });
  }

  // 'global' ends every session for this user on the server, so a copied
  // token stops working too. Fall back to a local sign-out if offline.
  function signOut() {
    return client().then(function (sb) {
      return sb.auth.signOut({ scope: 'global' }).then(function (r) {
        if (r && r.error) return sb.auth.signOut({ scope: 'local' });
      });
    }).catch(function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    });
  }

  // Only allow same-site relative destinations after login.
  function safeNext(next) {
    if (!next || typeof next !== 'string') return null;
    if (!/^[a-zA-Z0-9_\-./?=&#%]+$/.test(next)) return null;
    if (/^\/\//.test(next) || /^[a-z]+:/i.test(next) || next.indexOf('..') !== -1) return null;
    return next.replace(/^\//, '');
  }

  function toolById(id) {
    for (var i = 0; i < tools.length; i++) if (tools[i].id === id) return tools[i];
    return null;
  }

  function launchUrl(tool) {
    return tool.access === 'public' ? tool.url : 'tool.html?id=' + encodeURIComponent(tool.id);
  }

  // ---------- page wiring ----------

  // Cards: show public tools to everyone, private tools only to members.
  // Cards for unknown tools are hidden (fail closed).
  function applyToolAccess(member) {
    document.querySelectorAll('[data-tool]').forEach(function (card) {
      var t = toolById(card.getAttribute('data-tool'));
      var allowed = !!t && (t.access === 'public' || (t.access === 'private' && member));
      card.hidden = !allowed;
      if (allowed && t.status === 'live') {
        card.querySelectorAll('[data-tool-launch]').forEach(function (a) { a.href = launchUrl(t); });
      }
    });
  }

  function applyNav(st) {
    var signedIn = !!st.user;
    document.querySelectorAll('[data-auth-show]').forEach(function (el) {
      var want = el.getAttribute('data-auth-show');
      el.hidden = !((want === 'member' && st.member) ||
                    (want === 'signed-in' && signedIn) ||
                    (want === 'guest' && !signedIn));
    });
  }

  function wireLogout() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-logout]');
      if (!a) return;
      e.preventDefault();
      signOut().then(function () { location.href = 'login.html?reason=signedout'; });
    });
  }

  function checkConfig() {
    var n = tools.filter(function (t) { return t.access === 'public'; }).length;
    var want = window.MATHLETE_PUBLIC_TOOL_COUNT;
    if (want && n !== want && window.console) {
      console.warn('[Mathlete] ' + n + ' tools are public in js/tools-config.js; expected ' + want + '.');
    }
  }

  window.MathleteAuth = {
    configured: configured,
    bucket: BUCKET,
    client: client,
    status: status,
    signIn: signIn,
    signOut: signOut,
    safeNext: safeNext,
    toolById: toolById,
    hasStoredSession: hasStoredSession
  };

  // Pages that show tool cards or the account menu update themselves.
  if (document.querySelector('[data-tool], [data-auth-show], [data-logout]')) {
    checkConfig();
    wireLogout();
    applyToolAccess(false);
    applyNav({ user: null, member: false });
    status().then(function (st) {
      applyToolAccess(st.member);
      applyNav(st);
    });
  }
})();
