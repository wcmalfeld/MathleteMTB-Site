// Shared by the student pages (dashboard.html, my-progress.html,
// review.html): checks who is signed in, draws the section tabs, and
// provides the small helpers the three pages use.
//
// What this file does NOT do: decide what a student may see. Every row
// these pages show comes from the database, whose row-level rules only
// hand a student their own records (see supabase/progress.sql). Nothing
// here can be edited in the browser to see someone else's.
//
// Text from the database (names, questions, answers) is always put on
// the page as plain text, never as HTML.
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var tools = window.MATHLETE_TOOLS || [];

  // ---------- small DOM helpers ----------

  // el('p', { class: 'meta' }, 'text', childNode, ...)
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }
  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) return child.forEach(function (c) { append(node, c); });
    node.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  // ---------- formatting ----------

  var timeZone;   // set from the dashboard's settings so dates match the weekly numbers
  function fmtDate(iso, opts) {
    if (!iso) return '';
    var o = opts || { weekday: 'short', month: 'short', day: 'numeric' };
    if (timeZone) o = Object.assign({ timeZone: timeZone }, o);
    try { return new Date(iso).toLocaleDateString('en-US', o); } catch (e) { return new Date(iso).toLocaleDateString(); }
  }
  function fmtDateTime(iso) { return fmtDate(iso, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
  function ago(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? d + ' days ago' : d < 60 ? Math.round(d / 7) + ' weeks ago' : Math.round(d / 30) + ' months ago';
  }
  function pct(part, whole) { return whole ? Math.round(100 * part / whole) + '%' : '—'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  // ---------- games ----------

  function tool(id) { for (var i = 0; i < tools.length; i++) if (tools[i].id === id) return tools[i]; return null; }
  function gameName(id) { var t = tool(id); return t ? t.name : id; }
  // Where to play it: public games at their address, members-only ones through the player.
  function gameUrl(id) {
    var t = tool(id);
    if (!t || t.status !== 'live') return 'index.html#tools';
    return t.access === 'public' ? t.url : 'tool.html?id=' + encodeURIComponent(t.id);
  }
  function gameMinutes(id) { var t = tool(id); return t && t.minutes ? t.minutes : null; }

  // ---------- skill status ----------

  var STATUS = {
    strong:          { label: 'Strong',          icon: '✓' },
    developing:      { label: 'Developing',      icon: '↗' },
    needs_practice:  { label: 'Needs practice',  icon: '!' },
    not_enough_data: { label: 'Not enough data', icon: '–' }
  };
  function statusChip(status) {
    var s = STATUS[status] || STATUS.not_enough_data;
    return el('span', { class: 'status status--' + status },
      el('span', { class: 'status-icon', 'aria-hidden': 'true' }, s.icon), s.label);
  }

  // One skill row: name, a meter of first-try accuracy, the numbers behind
  // it, and a status in words. Under the minimum sample there is no
  // percentage and no meter fill: a number would mislead.
  function skillRow(s, settings, detailed) {
    var enough = s.status !== 'not_enough_data';
    var figure = el('div', { class: 'skill-figure' },
      el('span', { class: 'skill-pct' }, enough ? pct(s.correct, s.n) : '—'),
      el('div', { class: 'meter' + (enough ? ' meter--' + s.status : ''), role: 'img',
                  'aria-label': enough ? pct(s.correct, s.n) + ' right on the first try' : 'Not enough data yet' },
        enough ? el('span', { style: 'width:' + Math.round(100 * s.correct / s.n) + '%' }) : null));
    var sample = enough
      ? s.correct + ' of ' + plural(s.n, 'first try', 'first tries') + ' right'
      : (s.n ? plural(s.n, 'first try', 'first tries') + ' so far' : 'Not practiced') + ' in the last ' + settings.window_days + ' days (needs ' + settings.min_sample + ')';
    var row = el('li', { class: 'skill' },
      el('p', { class: 'skill-name' }, s.name, el('small', null, sample)),
      figure,
      statusChip(s.status));
    if (detailed) {
      var bits = [];
      if (s.n) bits.push(s.eventually_correct + ' of ' + s.n + ' right in the end');
      if (s.n) bits.push(s.with_hints ? plural(s.with_hints, 'question') + ' with a hint' : 'no hints used');
      if (s.prev_n >= settings.min_sample && enough) {
        var now = s.correct / s.n, before = s.prev_correct / s.prev_n, diff = Math.round(100 * (now - before));
        bits.push((diff >= 5 ? '▲ up from ' : diff <= -5 ? '▼ down from ' : 'about the same as ') + pct(s.prev_correct, s.prev_n) +
                  ' in the ' + settings.window_days + ' days before (' + s.prev_n + ' first tries)');
      }
      if (s.last_at) bits.push('last practiced ' + ago(s.last_at));
      row.appendChild(el('p', { class: 'skill-detail' }, bits.join(' · ')));
    }
    return row;
  }

  // ---------- goals ----------

  // One goal: what it is, how far along (measured from real activity),
  // when it's due and who set it. `actions` are optional buttons.
  function goalRow(g, actions) {
    var done = g.status === 'completed', measured = g.kind !== 'custom';
    var facts = [];
    if (done) facts.push('Done ' + fmtDate(g.completed_at, { month: 'short', day: 'numeric' }));
    else if (g.due_on) facts.push((g.past_due ? 'Was due ' : 'Due ') + fmtDate(g.due_on + 'T12:00:00', { weekday: 'short', month: 'short', day: 'numeric' }));
    facts.push(g.set_by === 'student' ? 'Set by you' : 'Set by ' + (g.set_by_name || 'your tutor'));
    if (!measured && !done) facts.push('your tutor marks this one done');
    var figure = measured
      ? el('div', { class: 'skill-figure' },
          el('span', { class: 'skill-pct goal-count' }, g.progress + ' of ' + g.target),
          el('div', { class: 'meter meter--' + (done ? 'strong' : 'developing'), role: 'img', 'aria-label': g.progress + ' of ' + g.target + ' done' },
            g.progress ? el('span', { style: 'width:' + Math.round(100 * g.progress / g.target) + '%' }) : null))
      : el('div', { class: 'skill-figure' });
    var state = done ? { tone: 'strong', icon: '✓', label: 'Done' }
              : g.past_due ? { tone: 'needs_practice', icon: '!', label: 'Past due' }
              : { tone: 'developing', icon: '↗', label: !measured ? 'To do' : g.progress ? 'In progress' : 'Not started' };
    var row = el('li', { class: 'skill goal' },
      el('p', { class: 'skill-name' }, g.title, el('small', null, facts.join(' · '))),
      figure,
      el('span', { class: 'status status--' + state.tone }, el('span', { class: 'status-icon', 'aria-hidden': 'true' }, state.icon), state.label));
    if (actions && actions.length) row.appendChild(el('p', { class: 'skill-detail goal-actions' }, actions));
    return row;
  }

  // ---------- page shell ----------

  var TABS = [
    { id: 'dashboard', href: 'dashboard.html', label: 'Dashboard' },
    { id: 'play', href: 'index.html#tools', label: 'Play' },
    { id: 'progress', href: 'my-progress.html', label: 'My Progress' },
    { id: 'review', href: 'review.html', label: 'Review My Mistakes' },
    { id: 'goals', href: 'goals.html', label: 'My Goals' }
  ];
  function drawTabs(current, waiting) {
    var host = document.getElementById('student-tabs');
    if (!host) return;
    var ul = el('ul');
    TABS.forEach(function (t) {
      var a = el('a', { href: t.href, 'aria-current': t.id === current ? 'page' : null }, t.label);
      if (t.id === 'review' && waiting) a.appendChild(el('span', { class: 'tab-count', 'aria-label': waiting + ' waiting' }, String(waiting)));
      ul.appendChild(el('li', null, a));
    });
    clear(host).appendChild(el('div', { class: 'wrap' }, ul));
  }

  // Shows a message in place of the page's content.
  function showState(title, text, actions) {
    var main = document.getElementById('student-main');
    var box = el('section', { class: 'student-state', role: 'status' },
      el('div', { class: 'wrap' },
        el('h2', { class: 'label' }, title),
        text ? el('p', null, text) : null,
        actions && actions.length ? el('p', null, actions.map(function (a) {
          return el('a', { class: a.primary ? 'button' : 'read-link', href: a.href, style: 'margin-right:22px' }, a.label);
        })) : null));
    clear(main).appendChild(box);
    main.hidden = false;
  }

  // Resolves with { sb, user } once a member is signed in; otherwise it
  // shows why not (or goes to the login page) and never resolves.
  function ready(current) {
    drawTabs(current);
    var here = location.pathname.split('/').pop() || 'dashboard.html';
    return new Promise(function (resolve) {
      if (!A || !A.configured) return showState('Not set up yet', 'Student accounts aren’t set up on this copy of the site.', [{ href: 'index.html', label: 'Back to the Lab' }]);
      if (!A.hasStoredSession()) return location.replace('login.html?reason=login&next=' + encodeURIComponent(here + location.search));
      A.status().then(function (st) {
        if (st.error) return showState('Couldn’t load your account', 'Check your connection and try again.', [{ href: here, label: 'Try again', primary: true }]);
        if (!st.user) return location.replace('login.html?reason=' + (st.expired ? 'expired' : 'login') + '&next=' + encodeURIComponent(here + location.search));
        if (!st.member) return showState('No access right now', 'Your account doesn’t have access at the moment. If you think that’s a mistake, get in touch.', [{ href: 'index.html#contact', label: 'Get in touch', primary: true }]);
        A.client().then(function (sb) { resolve({ sb: sb, user: st.user }); });
      });
    });
  }

  // The dashboard document for the signed-in student (one request).
  function loadDashboard(sb) {
    return sb.rpc('student_dashboard').then(function (res) {
      if (res.error) throw res.error;
      if (res.data && res.data.settings) timeZone = res.data.settings.timezone;
      return res.data;
    });
  }

  function fail(err) {
    if (window.console) console.warn('[Mathlete]', err && err.message ? err.message : err);
    var missing = err && (err.code === 'PGRST202' || err.code === '42883' || err.code === '42P01' || err.code === 'PGRST205');
    showState('Couldn’t load this page',
      missing ? 'Progress pages aren’t switched on yet (the database is missing the latest update).' : 'Check your connection and try again.',
      [{ href: location.href, label: 'Try again', primary: true }, { href: 'index.html#tools', label: 'Go and play' }]);
  }

  window.MathleteStudent = {
    el: el, clear: clear, fmtDate: fmtDate, fmtDateTime: fmtDateTime, ago: ago, pct: pct, plural: plural,
    gameName: gameName, gameUrl: gameUrl, gameMinutes: gameMinutes,
    statusChip: statusChip, skillRow: skillRow, goalRow: goalRow, STATUS: STATUS,
    drawTabs: drawTabs, showState: showState, ready: ready, loadDashboard: loadDashboard, fail: fail
  };
})();
