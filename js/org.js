// Organization context in the browser: which organization the signed-in
// person is working in ("Working in" switcher), for people who belong to
// one or more schools or academies.
//
// What this file does NOT do: decide access. The choice is only a hint the
// server re-checks on every request (record_attempt and friends verify the
// membership, the organization's status and its licence). Picking another
// organization's id here gets you nothing.
//
// The choice is kept in localStorage ('mathlete-org'), where js/progress.js
// reads it to tag each answer. Load after js/auth.js. Text is set as text.
(function () {
  'use strict';
  var KEY = 'mathlete-org';
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } };

  var LICENSE_WORDS = { none: 'no active licence yet', expired: 'its licence has ended', suspended: 'access is paused' };

  // -> { orgs, individual, current (id or null), choices }
  function load(sb, status) {
    return sb.rpc('my_organizations').then(function (res) {
      var orgs = res.error ? [] : (res.data || []);
      var individual = !status || status.individual !== false;
      var learnable = orgs.filter(function (o) { return o.can_learn; });
      var stored = read(), current = null;
      if (stored && learnable.some(function (o) { return o.id === stored; })) current = stored;
      else if (!individual && learnable.length) current = learnable[0].id;   // no own account: work in an organization
      write(current);
      return { orgs: orgs, individual: individual, current: current, choices: learnable.length + (individual ? 1 : 0) };
    });
  }

  function set(id) { write(id || null); }
  function current() { var v = read(); return v && /^[0-9a-f-]{36}$/i.test(v) ? v : null; }

  // Draw the switcher (only when there's a real choice) and any access notes.
  function draw(host, state, onChange) {
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    var el = function (tag, attrs, text) { var n = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text) n.textContent = text; return n; };
    if (state.choices > 1) {
      var label = el('label', { for: 'org-switch', class: 'org-switch-label' }, 'Working in');
      var select = el('select', { id: 'org-switch', class: 'org-switch' });
      if (state.individual) select.appendChild(el('option', { value: '' }, 'My own account'));
      state.orgs.forEach(function (o) {
        var opt = el('option', { value: o.id }, o.name + (o.role !== 'student' ? ' (' + o.role + ')' : '') + (o.can_learn ? '' : ' — unavailable'));
        if (!o.can_learn) opt.disabled = true;
        if (o.id === state.current) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', function () { set(select.value); if (onChange) onChange(select.value || null); });
      host.appendChild(el('p', { class: 'org-switch-row' })).append(label, select);
    } else if (state.current) {
      var o = state.orgs.filter(function (x) { return x.id === state.current; })[0];
      if (o) host.appendChild(el('p', { class: 'org-switch-row org-switch-row--one' }, 'Working in ' + o.name));
    }
    state.orgs.filter(function (o) { return !o.can_learn; }).forEach(function (o) {
      var why = o.status !== 'active' ? (o.status === 'pending' ? 'it isn’t open yet' : 'access is paused') : (LICENSE_WORDS[o.license] || 'access isn’t active');
      host.appendChild(el('p', { class: 'org-note', role: 'status' }, o.name + ': ' + why + '. ' + (o.can_manage ? 'You can still manage it.' : 'Ask your school’s Mathlete administrator.')));
    });
    // Owners and admins: a way into the organization's page.
    var managed = state.orgs.filter(function (o) { return o.can_manage; });
    if (managed.length) {
      var row = el('p', { class: 'org-manage' });
      managed.forEach(function (o) {
        var a = el('a', { href: 'organization.html' + (managed.length > 1 ? '?org=' + encodeURIComponent(o.id) : ''), class: 'read-link' }, 'Manage ' + o.name);
        row.appendChild(a);
      });
      host.appendChild(row);
    }
    host.hidden = !host.firstChild;
  }

  window.MathleteOrg = { load: load, draw: draw, set: set, current: current, KEY: KEY };
})();
