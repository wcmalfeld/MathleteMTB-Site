// Opens one learning tool: tool.html?id=<id>.
// Public tools are simply forwarded to where they are hosted. Private tools
// are downloaded from the private Storage bucket using the member's own
// session; the database's row-level security decides whether to hand the
// file over, so nothing on this page can be edited to get around it.
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var RECHECK_MS = 5 * 60 * 1000;

  var main = document.getElementById('main');
  var state = document.getElementById('player-state');
  var titleEl = document.getElementById('state-title');
  var textEl = document.getElementById('state-text');
  var actionsEl = document.getElementById('state-actions');
  var barTitle = document.getElementById('player-title');

  var id = new URLSearchParams(location.search).get('id') || '';
  var tool = A.toolById(id);
  var here = 'tool.html?id=' + encodeURIComponent(id);

  function showState(title, text, actions) {
    var frame = document.getElementById('tool-frame');
    if (frame) frame.remove();
    state.hidden = false;
    titleEl.textContent = title;
    textEl.textContent = text || '';
    actionsEl.innerHTML = '';
    (actions || []).forEach(function (a) {
      var link = document.createElement('a');
      link.className = a.primary ? 'button' : 'read-link';
      link.href = a.href;
      link.textContent = a.label;
      if (a.logout) link.setAttribute('data-logout', '');
      actionsEl.appendChild(link);
    });
    actionsEl.hidden = !actions || !actions.length;
  }

  function toLogin(reason) {
    location.replace('login.html?reason=' + reason + '&next=' + encodeURIComponent(here));
  }

  var BACK = { href: 'index.html#tools', label: 'Back to learning tools' };

  if (!tool) {
    return showState('Tool not found', 'That learning tool doesn’t exist. It may have moved.', [BACK]);
  }

  if (tool.access === 'public') {
    if (tool.status === 'live' && tool.url) return location.replace(tool.url);
    return showState('Coming soon', 'This learning tool is still being built.', [BACK]);
  }

  // ----- private tool -----
  if (!A.configured) {
    return showState('Members only', 'Member login isn’t set up yet.', [BACK]);
  }
  if (!A.hasStoredSession()) return toLogin('login');

  function denied() {
    showState('Members only',
      'Your account doesn’t have access to this tool right now. If you think that’s a mistake, get in touch.',
      [{ href: 'index.html#contact', label: 'Get in touch', primary: true },
       { href: '#', label: 'Log out', logout: true }]);
  }

  // true = has access, false = handled (redirected / denied),
  // null = couldn't reach the server (don't punish a flaky connection).
  function check() {
    return A.status().then(function (st) {
      if (st.error) return null;
      if (!st.user) { toLogin(st.expired ? 'expired' : 'login'); return false; }
      if (!st.member) { denied(); return false; }
      return true;
    });
  }

  check().then(function (ok) {
    if (ok === null) {
      return showState('Couldn\u2019t check your access', 'Check your connection and try again.', [BACK]);
    }
    if (!ok) return;
    if (tool.status !== 'live' || !tool.file) {
      return showState('Coming soon', 'This learning tool is still being built.', [BACK]);
    }
    barTitle.textContent = tool.name;
    titleEl.textContent = 'Loading ' + tool.name + '…';

    return A.client().then(function (sb) {
      return sb.storage.from(A.bucket).download(tool.file);
    }).then(function (res) {
      if (res.error || !res.data) {
        // Find out whether access changed or the file is just missing.
        return check().then(function (stillOk) {
          if (stillOk !== false) showState('Couldn’t load this tool', 'Try again in a moment.', [BACK]);
        });
      }
      return res.data.text().then(function (html) {
        var frame = document.createElement('iframe');
        frame.id = 'tool-frame';
        frame.className = 'player-frame';
        frame.title = tool.name;
        frame.setAttribute('allow', 'fullscreen');
        frame.srcdoc = html;
        state.hidden = true;
        main.appendChild(frame);
        document.title = tool.name + ' — Mathlete MTB';
        startRechecks();
      });
    }).catch(function () {
      showState('Couldn’t load this tool', 'Check your connection and try again.', [BACK]);
    });
  });

  // Access can be revoked while the tool is open; keep checking.
  function startRechecks() {
    var busy = false;
    function recheck() {
      if (busy) return;
      busy = true;
      check().then(function () { busy = false; }, function () { busy = false; });
    }
    setInterval(recheck, RECHECK_MS);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') recheck();
    });
  }
})();
