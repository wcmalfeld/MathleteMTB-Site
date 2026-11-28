// Organization context in the browser: which organization the signed-in
// person is working in ("Working in" switcher), for people who belong to
// one or more schools or academies.
//
// What this file does NOT do: decide access. The choice is only a hint the
// server re-checks on every request (record_attempt and friends verify the
// membership, the organization's status and its license). Picking another
// organization's id here gets you nothing.
//
// The choice is kept in localStorage ('mathlete-org'), where js/progress.js
// reads it to tag each answer. Load after js/auth.js. Text is set as text.
(function () {
  'use strict';
  var KEY = 'mathlete-org';
  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var write = function (v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } };

  var LICENSE_WORDS = { none: 'no active license yet', expired: 'its license has ended', suspended: 'access is paused' };

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

  // ---------- "Your school": what the organization has switched on ----------
  // Used by the student dashboard and, unchanged, by the organization page's
  // student preview, so the two can't drift apart. The list comes from the
  // database (org_student_view in supabase/resources.sql), which only
  // returns resources the license includes and the school has switched on.

  // Public address of a logo in the org-branding bucket.
  function logoUrl(path, version) {
    var cfg = window.MATHLETE_SUPABASE || {};
    if (!path || !cfg.url || !/^[0-9a-f-]{36}\/logo-[a-z0-9-]+\.(png|jpe?g|webp)$/.test(path)) return null;
    return cfg.url.replace(/\/+$/, '') + '/storage/v1/object/public/org-branding/' + path + (version ? '?v=' + encodeURIComponent(version) : '');
  }
  function safeColor(c) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : null; }
  // Only addresses on this site (relative), never another site.
  function safeHref(u) { return typeof u === 'string' && /^[a-z0-9][a-z0-9\-/.#?=&]*$/i.test(u) && u.indexOf('//') === -1 && u.indexOf('..') === -1 ? u : null; }
  // Topic id -> { title, href } from js/course-topics.js.
  function topicInfo(id) {
    var courses = window.MATHLETE_COURSE_TOPICS || [];
    for (var i = 0; i < courses.length; i++) {
      for (var u = 0; u < courses[i].units.length; u++) {
        var t = courses[i].units[u].topics;
        for (var k = 0; k < t.length; k++) if (t[k][0] === id) return { title: t[k][2], course: courses[i].name, href: 'classes/' + courses[i].slug + '/' + t[k][1] + '/' };
      }
    }
    return null;
  }

  function schoolView(sb, orgId, preview) {
    return sb.rpc('org_student_view', { p_org: orgId, p_preview: !!preview }).then(function (r) { if (r.error) throw r.error; return r.data; });
  }

  // Draw the "Your school" section into `host` (a wrap element).
  function drawSchool(host, view, opts) {
    opts = opts || {};
    var el = function (tag, attrs) {
      var n = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] !== null && attrs[k] !== undefined) { if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); } });
      for (var i = 2; i < arguments.length; i++) if (arguments[i]) n.appendChild(arguments[i]);
      return n;
    };
    var o = view.organization || {};
    var box = el('div', { class: 'school' });
    var accent = safeColor(o.accent_color);
    if (accent) box.style.setProperty('--org-accent', accent);
    var logo = logoUrl(o.logo_path, o.updated_at), img = null;
    if (logo) {
      img = el('img', { class: 'school-logo', src: logo, alt: o.name + ' logo', width: '64', height: '64', loading: 'lazy' });
      img.addEventListener('error', function () { img.hidden = true; });   // a missing file shouldn't leave a broken box
    }
    box.appendChild(el('div', { class: 'school-head' }, img,
      el('div', null, el('p', { class: 'school-eyebrow', text: opts.eyebrow || 'Your school' }), el('h2', { class: 'school-name', text: o.name }))));
    if (o.welcome_message) box.appendChild(el('p', { class: 'school-welcome', text: o.welcome_message }));
    if (!view.open && !opts.preview) {
      box.appendChild(el('p', { class: 'school-empty', text: o.name + ' hasn’t opened Mathlete to students yet. Your activities will appear here when it does.' }));
      return host.appendChild(box);
    }
    var res = view.resources || [];
    var link = function (r) { var href = safeHref(r.url); return href ? el('a', { href: href, text: r.name }) : el('span', { text: r.name }); };
    var group = function (title, list, describe) {
      if (!list.length) return;
      var ul = el('ul', { class: 'school-list' });
      list.forEach(function (r) { ul.appendChild(el('li', null, link(r), describe && r.description ? el('span', { class: 'school-desc', text: r.description }) : null)); });
      box.appendChild(el('div', { class: 'school-group' }, el('h3', { class: 'school-group-title', text: title }), ul));
    };
    (view.collections || []).forEach(function (c) {
      var ul = el('ul', { class: 'school-list' });
      c.items.forEach(function (r) { ul.appendChild(el('li', null, link(r))); });
      box.appendChild(el('div', { class: 'school-group school-group--collection' },
        el('h3', { class: 'school-group-title', text: c.title }), c.description ? el('p', { class: 'school-desc', text: c.description }) : null, ul));
    });
    var topics = (view.recommended_topics || []).map(topicInfo).filter(Boolean);
    if (topics.length) {
      var tl = el('ul', { class: 'school-list' });
      topics.forEach(function (t) { tl.appendChild(el('li', null, el('a', { href: t.href, text: t.title }), el('span', { class: 'school-desc', text: t.course }))); });
      box.appendChild(el('div', { class: 'school-group' }, el('h3', { class: 'school-group-title', text: 'Recommended topics' }), tl));
    }
    group('Learning labs', res.filter(function (r) { return r.type === 'lab' || r.type === 'module'; }), true);
    group('Courses', res.filter(function (r) { return r.type === 'course'; }), false);
    if (!res.some(function (r) { return r.type === 'lab' || r.type === 'module' || r.type === 'course'; })) {
      box.appendChild(el('p', { class: 'school-empty', text: 'Nothing is switched on yet.' }));
    }
    host.appendChild(box);
    return box;
  }

  // Student dashboard: a "Your school" section at the top, for the
  // organization the student is working in. Optional: nothing if none.
  function mountSchool(sb, main) {
    var id = current();
    if (!id || !main) return Promise.resolve(null);
    return schoolView(sb, id, false).then(function (view) {
      var wrap = document.createElement('div'); wrap.className = 'wrap';
      var sec = document.createElement('section'); sec.className = 'student-section school-section'; sec.setAttribute('aria-label', 'Your school');
      sec.appendChild(wrap);
      drawSchool(wrap, view);
      main.insertBefore(sec, main.firstChild);
      return view;
    }).catch(function () { return null; });
  }

  window.MathleteOrg = { load: load, draw: draw, set: set, current: current, KEY: KEY,
    logoUrl: logoUrl, schoolView: schoolView, drawSchool: drawSchool, mountSchool: mountSchool, topicInfo: topicInfo, safeHref: safeHref };
})();
