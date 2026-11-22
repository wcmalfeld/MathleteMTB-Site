// Organization page (organization.html), for a school's owners and admins,
// and for Mathlete's platform admins. Tabs:
//   Overview      — seats, licence, getting-started checklist, recent activity
//   Members       — invite one person; members (role, suspend, remove);
//                   invitations (re-send, revoke)
//   Import        — invite many from a CSV, with a preview before sending
//   Resources     — switch licensed labs, courses and sports on or off;
//                   recommended topics; curated collections (PRD 3)
//   Settings      — name, welcome message, logo and accent colour
//   Student preview — exactly what students see (js/org.js drawSchool)
//   Subscription  — the licence and its history (owner and Mathlete only)
//
// What this file does NOT do: decide who may do what. Every call below is a
// database function that checks the caller's role, the organization, the
// seat limit and the owner rules itself (supabase/organizations.sql). The
// page only hides buttons that would be refused anyway.
//
// Invitations go through the `invite` server function (it emails the link).
// If that isn't deployed yet, the page creates the invitation directly and
// shows the link to copy. Text from the database is always set as text.
(function () {
  'use strict';
  var A = window.MathleteAuth;
  var main = document.getElementById('student-main');
  var tabsHost = document.getElementById('student-tabs');
  var titleEl = document.getElementById('student-title');
  var ledeEl = document.getElementById('student-lede');
  var eyebrow = document.getElementById('org-eyebrow');
  var pickHost = document.getElementById('org-pick');

  // ---------- helpers ----------
  function el(tag, attrs) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(n, arguments[i]);
    return n;
  }
  function add(n, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) return c.forEach(function (x) { add(n, x); });
    n.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  function fmtDate(iso) { if (!iso) return '—'; var d = new Date(String(iso).length === 10 ? iso + 'T12:00:00' : iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function ago(iso) {
    var d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? d + ' days ago' : fmtDate(iso);
  }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function errText(err) {
    if (!err) return 'Something went wrong. Try again.';
    if (err.code === 'PGRST202' || err.code === '42883' || err.code === 'PGRST205' || err.code === '42P01') return 'This isn’t switched on yet (the database is missing the latest update).';
    if (err.message && (/^PT\d/.test(err.code || '') || err.fromServer)) return err.message;
    return 'Something went wrong. Check your connection and try again.';
  }
  function notice(kind, text) { return el('div', { class: 'notice notice--' + kind, role: kind === 'error' ? 'alert' : 'status', text: text }); }
  function section(title, intro) {
    var wrap = el('div', { class: 'wrap' });
    var s = el('section', { class: 'student-section' }, wrap);
    wrap.appendChild(el('div', { class: 'student-section-head' }, el('h2', { class: 'label', text: title }), intro ? el('p', { class: 'meta', text: intro }) : null));
    main.appendChild(s);
    return wrap;
  }
  function showState(title, text, actions) {
    clear(main).appendChild(el('section', { class: 'student-state', role: 'status' }, el('div', { class: 'wrap' },
      el('h2', { class: 'label', text: title }), text ? el('p', { text: text }) : null,
      actions ? el('p', null, actions.map(function (a) { return el('a', { class: a.primary ? 'button' : 'read-link', href: a.href, style: 'margin-right:22px', text: a.label }); })) : null)));
  }

  var ROLE_WORDS = { owner: 'Owner', admin: 'Admin', instructor: 'Instructor', student: 'Student' };
  var LICENSE_WORDS = { active: 'Active', trialing: 'Trial', grace: 'Payment overdue (grace period)', none: 'No licence yet', suspended: 'Paused', expired: 'Ended' };
  var ACTION_WORDS = {
    'member.added': 'Member added', 'member.invited': 'Invitation sent', 'member.reinvited': 'Invitation re-sent',
    'member.invitation_revoked': 'Invitation withdrawn', 'member.joined': 'Someone joined', 'member.reactivated': 'Member reactivated',
    'member.updated': 'Member changed', 'organization.created': 'Organization created', 'organization.settings_updated': 'Settings updated',
    'organization.setup_completed': 'Setup marked complete', 'organization.status_changed': 'Status changed by Mathlete',
    'subscription.activated': 'Licence set up', 'subscription.status_changed': 'Licence status changed', 'plan.saved': 'Plan updated'
  };

  // ---------- state ----------
  var S = { sb: null, user: null, orgId: null, ov: null, members: null, platform: false, tab: 'overview' };
  function myRole() { return S.ov ? S.ov.my_role : null; }
  function isOwner() { return myRole() === 'owner' || myRole() === 'platform' || S.platform; }
  function roleChoices() { return isOwner() ? ['student', 'instructor', 'admin', 'owner'] : ['student', 'instructor']; }

  var TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'import', label: 'Import' },
    { id: 'resources', label: 'Resources' },
    { id: 'settings', label: 'Settings' },
    { id: 'preview', label: 'Student preview' },
    { id: 'subscription', label: 'Subscription', owner: true }
  ];
  function drawTabs() {
    var ul = el('ul');
    TABS.forEach(function (t) {
      if (t.owner && !isOwner()) return;
      var a = el('a', { href: '#' + t.id, 'aria-current': t.id === S.tab ? 'page' : null, text: t.label });
      if (t.id === 'members' && S.ov && S.ov.seats && S.ov.seats.pending_invitations) a.appendChild(el('span', { class: 'tab-count', 'aria-label': S.ov.seats.pending_invitations + ' invitations pending', text: String(S.ov.seats.pending_invitations) }));
      ul.appendChild(el('li', null, a));
    });
    clear(tabsHost).appendChild(el('div', { class: 'wrap' }, ul));
  }

  // ---------- start ----------
  var params = new URLSearchParams(location.search);
  if (!A || !A.configured) return showState('Not set up yet', 'Accounts aren’t set up on this copy of the site.', [{ href: 'index.html', label: 'Back to the Lab' }]);
  if (!A.hasStoredSession()) return location.replace('login.html?reason=login&next=' + encodeURIComponent('organization.html' + location.search));

  A.status().then(function (st) {
    if (st.error) return showState('Couldn’t load your account', 'Check your connection and try again.', [{ href: location.href, label: 'Try again', primary: true }]);
    if (!st.user) return location.replace('login.html?reason=' + (st.expired ? 'expired' : 'login') + '&next=' + encodeURIComponent('organization.html' + location.search));
    S.user = st.user;
    return A.client().then(function (sb) {
      S.sb = sb;
      return Promise.all([sb.rpc('my_organizations'), sb.rpc('is_platform_admin')]);
    }).then(function (r) {
      if (r[0].error) throw r[0].error;
      S.platform = r[1] && r[1].data === true;
      var managed = (r[0].data || []).filter(function (o) { return o.can_manage; });
      var want = params.get('org');
      var list = managed.slice();
      var next = S.platform
        ? S.sb.from('organizations').select('id, name, status').neq('status', 'archived').order('name').then(function (x) { if (!x.error) list = (x.data || []).map(function (o) { return { id: o.id, name: o.name }; }); })
        : Promise.resolve();
      return next.then(function () {
        if (!list.length) {
          return showState('No organization to manage', 'This page is for a school’s Mathlete owners and administrators. Your account doesn’t manage an organization.', [{ href: 'dashboard.html', label: 'Go to your dashboard', primary: true }]);
        }
        S.orgId = want && list.some(function (o) { return o.id === want; }) ? want : (managed[0] || list[0]).id;
        drawPicker(list);
        return loadOverview().then(route);
      });
    });
  }).catch(function (err) {
    showState('Couldn’t load this page', errText(err), [{ href: location.href, label: 'Try again', primary: true }]);
  });

  function drawPicker(list) {
    if (list.length < 2) return;
    var sel = el('select', { id: 'org-select', class: 'org-switch' });
    list.forEach(function (o) { sel.appendChild(el('option', { value: o.id, selected: o.id === S.orgId ? true : null, text: o.name })); });
    sel.addEventListener('change', function () { location.search = '?org=' + encodeURIComponent(sel.value); });
    clear(pickHost).appendChild(el('p', { class: 'org-switch-row' }, el('label', { for: 'org-select', class: 'org-switch-label', text: 'Managing' }), sel));
    pickHost.hidden = false;
  }

  function loadOverview() {
    return S.sb.rpc('organization_overview', { p_org: S.orgId }).then(function (r) {
      if (r.error) throw r.error;
      S.ov = r.data;
      var o = S.ov.organization, lic = S.ov.license || {};
      titleEl.textContent = o.name;
      document.title = o.name + ' — Mathlete MTB';
      eyebrow.textContent = 'Organization · ' + (myRole() === 'platform' ? 'Mathlete admin' : ROLE_WORDS[myRole()] || 'Manager');
      ledeEl.textContent = o.status === 'pending' ? 'Being set up. Students can’t use Mathlete until Mathlete opens your organization and a licence is active.'
        : o.status === 'suspended' ? 'Access is paused. Get in touch with Mathlete.'
        : 'Licence: ' + (LICENSE_WORDS[lic.state] || lic.state) + (lic.ends_on ? ' · until ' + fmtDate(lic.ends_on) : '') + '.';
    });
  }

  window.addEventListener('hashchange', route);
  function route() {
    var h = (location.hash || '').slice(1);
    S.tab = TABS.some(function (t) { return t.id === h && (!t.owner || isOwner()); }) ? h : 'overview';
    drawTabs();
    clear(main);
    ({ overview: drawOverview, members: drawMembers, import: drawImport, resources: drawResources, settings: drawSettings, preview: drawPreview, subscription: drawSubscription })[S.tab]();
  }
  function refresh() { return loadOverview().then(function () { S.members = null; route(); }); }

  // ---------- Overview ----------
  function drawOverview() {
    var ov = S.ov, seats = ov.seats || {}, counts = ov.counts || {}, lic = ov.license || {};
    var w = section('At a glance');
    w.appendChild(el('ul', { class: 'stat-row' },
      el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Student seats in use' }),
        el('p', { class: 'stat-value' }, String(seats.active_students || 0), el('small', { text: ' / ' + (seats.licensed || 0) })),
        el('p', { class: 'stat-sub', text: plural(seats.pending_invitations || 0, 'invitation') + ' pending · ' + (seats.available || 0) + ' available' })),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Instructors' }), el('p', { class: 'stat-value', text: String(counts.instructor || 0) })),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Owners & admins' }), el('p', { class: 'stat-value', text: String((counts.owner || 0) + (counts.admin || 0)) })),
      el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Licence' }), el('p', { class: 'stat-value stat-value--word', text: LICENSE_WORDS[lic.state] || lic.state || '—' }),
        el('p', { class: 'stat-sub', text: lic.ends_on ? 'Until ' + fmtDate(lic.ends_on) : 'Mathlete sets this up with you.' }))));

    // Getting started
    var setup = ov.setup || {};
    var steps = [
      { k: 'owner', t: 'Your organization has an owner', d: 'The owner manages admins and the subscription.' },
      { k: 'license', t: 'Your licence is active', d: 'Mathlete sets this up with you. Students can practise once it’s active.' },
      { k: 'details', t: 'Add a welcome message', d: 'Shown to your members.', href: '#settings', go: 'Open settings' },
      { k: 'instructors', t: 'Invite your instructors', d: 'Teachers who will run classes (classes arrive in a later update).', href: '#members', go: 'Invite' },
      { k: 'students', t: 'Invite your students', d: 'One at a time, or many at once from a spreadsheet.', href: '#import', go: 'Import a list' }
    ];
    var g = section('Getting started', setup.completed_at ? 'Marked complete on ' + fmtDate(setup.completed_at) + '.' : 'Each step ticks itself off as you go.');
    var ol = el('ol', { class: 'org-checklist' });
    steps.forEach(function (s) {
      var done = !!setup[s.k];
      ol.appendChild(el('li', { class: 'org-check' + (done ? ' is-done' : '') },
        el('span', { class: 'org-check-mark', 'aria-hidden': 'true', text: done ? '✓' : '' }),
        el('div', null, el('p', { class: 'org-check-title' }, s.t, el('span', { class: 'sr-only', text: done ? ' (done)' : ' (to do)' })), el('p', { class: 'org-check-desc', text: s.d })),
        !done && s.href ? el('a', { class: 'read-link', href: s.href, text: s.go }) : null));
    });
    g.appendChild(ol);
    if (!setup.completed_at) {
      var allDone = steps.every(function (s) { return setup[s.k]; });
      var b = el('button', { class: 'button', type: 'button', text: 'Mark setup complete' });
      var msg = el('div');
      b.addEventListener('click', function () {
        b.disabled = true;
        S.sb.rpc('complete_setup', { p_org: S.orgId }).then(function (r) {
          if (r.error) { b.disabled = false; return clear(msg).appendChild(notice('error', errText(r.error))); }
          refresh();
        });
      });
      g.appendChild(el('div', { class: 'org-actions' }, b, allDone ? null : el('span', { class: 'meta', text: 'You can mark it complete before every step is done.' })));
      g.appendChild(msg);
    }

    var adm = section('Owners and admins');
    if ((ov.admins || []).length) adm.appendChild(el('ul', { class: 'org-people' }, ov.admins.map(function (a) { return el('li', null, el('span', { text: a.name || 'Unnamed' }), el('span', { class: 'org-role', text: ROLE_WORDS[a.role] })); })));
    else adm.appendChild(el('p', { class: 'meta', text: 'Nobody yet. Mathlete will invite your owner.' }));

    var rec = section('Recent activity');
    if ((ov.recent || []).length) rec.appendChild(el('ul', { class: 'org-activity' }, ov.recent.map(function (e) { return el('li', null, el('span', { text: ACTION_WORDS[e.action] || e.action }), el('span', { class: 'meta', text: ago(e.at) })); })));
    else rec.appendChild(el('p', { class: 'meta', text: 'Nothing yet.' }));

    var tc = section('Teacher Curriculum', 'Lesson plans for your instructors.');
    tc.appendChild(el('p', { text: 'Complete, ready-to-teach lesson plans for Algebra 1, Geometry, Algebra 2 and Precalculus, by quarter, unit and topic, each with an MTB activity, practice, an exit ticket and an answer key. Your owners, admins and instructors can open them when your licence includes the Teacher Curriculum.' }));
    tc.appendChild(el('a', { class: 'read-link', href: 'teacher-curriculum/', text: 'Open the Teacher Curriculum' }));

    var next = section('Coming next');
    next.appendChild(el('div', { class: 'student-empty' },
      el('p', { text: 'Classes (instructors with their groups of students, and assignments) and your organization’s learning resources will appear here in upcoming updates.' })));
  }

  // ---------- inviting ----------
  // -> Promise<{ emailed, link, resent }>, or rejects with { message }.
  function invite(p) {
    var body = { organization_id: S.orgId, email: p.email, role: p.role, first_name: p.first || null, last_name: p.last || null };
    function direct() {
      return S.sb.rpc('create_invitation', { p_org: S.orgId, p_email: p.email, p_role: p.role, p_first: p.first || null, p_last: p.last || null }).then(function (r) {
        if (r.error) throw r.error;
        return { emailed: false, resent: r.data.resent, link: new URL('join.html#t=' + r.data.token, location.href).href };
      });
    }
    if (!S.sb.functions || params.get('direct') === '1') return direct();
    return S.sb.functions.invoke('invite', { body: body }).then(function (r) {
      if (!r.error) return r.data;
      var ctx = r.error.context;
      if (!ctx || typeof ctx.json !== 'function') return direct();   // not deployed or unreachable
      return ctx.json().catch(function () { return {}; }).then(function (b) {
        if (ctx.status === 404 && !(b && b.error)) return direct();
        throw { message: (b && b.error) || 'Couldn’t send the invitation.', code: b && b.code, fromServer: true };
      });
    });
  }
  function linkBox(link, who) {
    var input = el('input', { class: 'input org-link', type: 'text', readonly: true, value: link, 'aria-label': 'Invitation link' + (who ? ' for ' + who : '') });
    var copy = el('button', { class: 'button button--quiet', type: 'button', text: 'Copy link' });
    copy.addEventListener('click', function () {
      input.select();
      var ok = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy link'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(ok, function () { document.execCommand('copy'); ok(); });
      else { document.execCommand('copy'); ok(); }
    });
    return el('div', { class: 'org-linkbox' }, input, copy);
  }
  function inviteResult(res, email) {
    var box = el('div');
    if (res.emailed) box.appendChild(notice('success', (res.resent ? 'A new invitation was emailed to ' : 'Invitation emailed to ') + email + '.'));
    else {
      box.appendChild(notice('info', 'Invitation ready' + (res.resent ? ' (it replaces the earlier one)' : '') + '. Email isn’t set up yet, so send this link to ' + email + ' yourself. It works once and only for that address.'));
      box.appendChild(linkBox(res.link, email));
    }
    return box;
  }

  // ---------- Members ----------
  function loadMembers() {
    if (S.members) return Promise.resolve(S.members);
    return S.sb.rpc('org_members', { p_org: S.orgId }).then(function (r) { if (r.error) throw r.error; S.members = r.data; return r.data; });
  }
  var filt = { role: '', status: 'current', q: '' };
  function drawMembers() {
    var w = section('Invite someone', 'They get an email with a link to join. Students each take a seat while invited.');
    var result = el('div', { 'aria-live': 'polite' });
    var roleSel = el('select', { class: 'input', id: 'inv-role', name: 'role' }, roleChoices().map(function (r) { return el('option', { value: r, text: ROLE_WORDS[r] }); }));
    var form = el('form', { class: 'form org-invite', novalidate: true },
      el('div', { class: 'org-grid' },
        el('div', { class: 'field' }, el('label', { for: 'inv-email', text: 'Email' }), el('input', { class: 'input', id: 'inv-email', name: 'email', type: 'email', autocomplete: 'off', required: true })),
        el('div', { class: 'field' }, el('label', { for: 'inv-first', text: 'First name' }), el('input', { class: 'input', id: 'inv-first', name: 'first', type: 'text', maxlength: '60', autocomplete: 'off' })),
        el('div', { class: 'field' }, el('label', { for: 'inv-last', text: 'Last name' }), el('input', { class: 'input', id: 'inv-last', name: 'last', type: 'text', maxlength: '60', autocomplete: 'off' })),
        el('div', { class: 'field' }, el('label', { for: 'inv-role', text: 'Role' }), roleSel)),
      el('div', { class: 'form-actions' }, el('button', { class: 'button', type: 'submit', text: 'Send invitation' })));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), btn = form.querySelector('button[type=submit]');
      if (!EMAIL.test(email)) return clear(result).appendChild(notice('error', 'Enter a valid email address.'));
      btn.disabled = true; btn.textContent = 'Sending…';
      invite({ email: email, role: roleSel.value, first: form.first.value.trim(), last: form.last.value.trim() }).then(function (res) {
        clear(result).appendChild(inviteResult(res, email));
        form.reset();
        S.members = null;
        return loadOverview().then(function () { drawTabs(); drawLists(); });
      }).catch(function (err) { clear(result).appendChild(notice('error', errText(err))); })
        .then(function () { btn.disabled = false; btn.textContent = 'Send invitation'; });
    });
    w.appendChild(form); w.appendChild(result);

    var listsWrap = el('div');
    main.appendChild(listsWrap);
    function drawLists() {
      clear(listsWrap);
      var holder = el('section', { class: 'student-section' }, el('div', { class: 'wrap' }, el('p', { class: 'meta', text: 'Loading members…' })));
      listsWrap.appendChild(holder);
      loadMembers().then(function (data) {
        clear(listsWrap);
        var hostSave = main; main = listsWrap;   // section() appends to `main`
        try { drawMemberTable(data); drawInvitations(data); } finally { main = hostSave; }
      }).catch(function (err) { clear(holder.firstChild).appendChild(notice('error', errText(err))); });
    }
    drawLists();
  }

  function drawMemberTable(data) {
    var seats = data.seats || {};
    var w = section('Members', (seats.active_students || 0) + ' of ' + (seats.licensed || 0) + ' student seats in use, ' + (seats.pending_invitations || 0) + ' held by invitations.');
    var roleF = el('select', { class: 'input', id: 'f-role', 'aria-label': 'Filter by role' }, el('option', { value: '', text: 'All roles' }), ['owner', 'admin', 'instructor', 'student'].map(function (r) { return el('option', { value: r, selected: filt.role === r ? true : null, text: ROLE_WORDS[r] + 's' }); }));
    var statF = el('select', { class: 'input', id: 'f-status', 'aria-label': 'Filter by status' }, [['current', 'Active and suspended'], ['active', 'Active'], ['suspended', 'Suspended'], ['removed', 'Removed'], ['', 'Everyone']].map(function (x) { return el('option', { value: x[0], selected: filt.status === x[0] ? true : null, text: x[1] }); }));
    var q = el('input', { class: 'input', id: 'f-q', type: 'search', placeholder: 'Search name or email', 'aria-label': 'Search members', value: filt.q });
    w.appendChild(el('div', { class: 'org-filters' }, roleF, statF, q));
    var tableHost = el('div');
    w.appendChild(tableHost);
    var msg = el('div', { 'aria-live': 'polite' });
    w.appendChild(msg);

    function rows() {
      var needle = filt.q.toLowerCase();
      return (data.members || []).filter(function (m) {
        if (filt.role && m.role !== filt.role) return false;
        if (filt.status === 'current' ? !(m.status === 'active' || m.status === 'suspended') : filt.status && m.status !== filt.status) return false;
        return !needle || (m.name || '').toLowerCase().indexOf(needle) !== -1 || (m.email || '').toLowerCase().indexOf(needle) !== -1;
      });
    }
    function act(m, changes, confirmText) {
      if (confirmText && !window.confirm(confirmText)) return;
      clear(msg);
      S.sb.rpc('update_member', { p_org: S.orgId, p_user: m.user_id, p_role: changes.role || null, p_status: changes.status || null }).then(function (r) {
        if (r.error) { clear(msg).appendChild(notice('error', errText(r.error))); return draw(); }
        S.members = null;
        return loadOverview().then(function () { drawTabs(); return loadMembers(); }).then(function (d) {
          data = d; draw();
          clear(msg).appendChild(notice('success', (m.name || m.email) + ': ' + (changes.role ? 'now ' + ROLE_WORDS[changes.role] : changes.status === 'active' ? 'active again' : changes.status) + '.'));
        });
      }).catch(function (err) { clear(msg).appendChild(notice('error', errText(err))); });
    }
    function draw() {
      var list = rows();
      clear(tableHost);
      if (!list.length) return tableHost.appendChild(el('p', { class: 'meta', text: (data.members || []).length ? 'Nobody matches.' : 'No members yet. Invite someone above.' }));
      var tbody = el('tbody');
      list.forEach(function (m) {
        var protectedRow = (m.role === 'owner' || m.role === 'admin') && !isOwner();
        var cell;
        if (m.is_me) cell = el('span', { class: 'meta', text: 'You' });
        else if (protectedRow) cell = el('span', { class: 'meta', text: 'Owner only' });
        else {
          var rs = el('select', { class: 'input input--small', 'aria-label': 'Role for ' + (m.name || m.email) }, roleChoices().map(function (r) { return el('option', { value: r, selected: r === m.role ? true : null, text: ROLE_WORDS[r] }); }));
          rs.addEventListener('change', function () { act(m, { role: rs.value }, 'Change ' + (m.name || m.email) + ' to ' + ROLE_WORDS[rs.value] + '?'); rs.value = m.role; });
          var btns = [];
          if (m.status === 'active') btns.push(el('button', { class: 'link-button', type: 'button', text: 'Suspend', onclick: function () { act(m, { status: 'suspended' }, 'Suspend ' + (m.name || m.email) + '? They keep their account and history but can’t use your organization’s access' + (m.role === 'student' ? ', and their seat is freed' : '') + '.'); } }));
          if (m.status === 'suspended' || m.status === 'removed') btns.push(el('button', { class: 'link-button', type: 'button', text: m.status === 'removed' ? 'Restore' : 'Reactivate', onclick: function () { act(m, { status: 'active' }); } }));
          if (m.status !== 'removed') btns.push(el('button', { class: 'link-button link-button--danger', type: 'button', text: 'Remove', onclick: function () { act(m, { status: 'removed' }, 'Remove ' + (m.name || m.email) + ' from your organization? Their account and past work are kept; you can restore them later.'); } }));
          cell = el('div', { class: 'org-row-actions' }, m.status === 'removed' ? el('span', { text: ROLE_WORDS[m.role] }) : rs, btns);
        }
        tbody.appendChild(el('tr', { class: m.status !== 'active' ? 'is-muted' : null },
          el('td', { 'data-label': 'Name', text: m.name || '—' }),
          el('td', { 'data-label': 'Email', class: 'org-email', text: m.email }),
          el('td', { 'data-label': 'Role', text: ROLE_WORDS[m.role] }),
          el('td', { 'data-label': 'Status' }, el('span', { class: 'org-status org-status--' + m.status, text: cap(m.status) })),
          el('td', { 'data-label': 'Joined', text: fmtDate(m.joined_at) }),
          el('td', { 'data-label': 'Actions' }, cell)));
      });
      tableHost.appendChild(el('div', { class: 'org-table-wrap' }, el('table', { class: 'org-table' },
        el('caption', { class: 'sr-only', text: 'Members' }),
        el('thead', null, el('tr', null, ['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(function (h) { return el('th', { scope: 'col', text: h }); }))), tbody)));
      tableHost.appendChild(el('p', { class: 'meta org-count', text: 'Showing ' + plural(list.length, 'person', 'people') + '.' }));
    }
    roleF.addEventListener('change', function () { filt.role = roleF.value; draw(); });
    statF.addEventListener('change', function () { filt.status = statF.value; draw(); });
    q.addEventListener('input', function () { filt.q = q.value.trim(); draw(); });
    draw();
  }

  function drawInvitations(data) {
    var inv = data.invitations || [];
    var w = section('Invitations', 'Pending invitations expire after 7 days. Re-sending makes a new link and cancels the old one.');
    var msg = el('div', { 'aria-live': 'polite' });
    if (!inv.length) { w.appendChild(el('p', { class: 'meta', text: 'No invitations in the last 30 days.' })); return; }
    var tbody = el('tbody');
    inv.forEach(function (i) {
      var mayTouch = isOwner() || !(i.role === 'owner' || i.role === 'admin');
      var who = [i.first_name, i.last_name].filter(Boolean).join(' ');
      var actions = el('div', { class: 'org-row-actions' });
      if (mayTouch && (i.status === 'pending' || i.status === 'expired')) {
        actions.appendChild(el('button', { class: 'link-button', type: 'button', text: 'Re-send', onclick: function (e) {
          var b = e.target; b.disabled = true;
          invite({ email: i.email, role: i.role, first: i.first_name, last: i.last_name }).then(function (res) {
            var told = inviteResult(res, i.email);
            S.members = null;
            return loadOverview().then(function () { drawTabs(); return loadMembers(); }).then(function (d) { redraw(d, told); });
          }).catch(function (err) { b.disabled = false; clear(msg).appendChild(notice('error', errText(err))); });
        } }));
      }
      if (mayTouch && i.status === 'pending') {
        actions.appendChild(el('button', { class: 'link-button link-button--danger', type: 'button', text: 'Withdraw', onclick: function (e) {
          if (!window.confirm('Withdraw the invitation to ' + i.email + '? The link will stop working.')) return;
          e.target.disabled = true;
          S.sb.rpc('revoke_invitation', { p_invitation: i.id }).then(function (r) {
            if (r.error) { e.target.disabled = false; return clear(msg).appendChild(notice('error', errText(r.error))); }
            S.members = null;
            return loadOverview().then(function () { drawTabs(); return loadMembers(); }).then(function (d) { redraw(d, notice('success', 'Invitation to ' + i.email + ' withdrawn.')); });
          });
        } }));
      }
      tbody.appendChild(el('tr', { class: i.status !== 'pending' ? 'is-muted' : null },
        el('td', { 'data-label': 'Email', class: 'org-email', text: i.email }),
        el('td', { 'data-label': 'Name', text: who || '—' }),
        el('td', { 'data-label': 'Role', text: ROLE_WORDS[i.role] }),
        el('td', { 'data-label': 'Status' }, el('span', { class: 'org-status org-status--' + i.status, text: i.status === 'revoked' ? 'Withdrawn' : cap(i.status) })),
        el('td', { 'data-label': 'Expires', text: i.status === 'pending' ? fmtDate(i.expires_at) : '—' }),
        el('td', { 'data-label': 'Invited by', text: i.invited_by || '—' }),
        el('td', { 'data-label': 'Actions' }, actions)));
    });
    w.appendChild(msg);
    w.appendChild(el('div', { class: 'org-table-wrap' }, el('table', { class: 'org-table' },
      el('caption', { class: 'sr-only', text: 'Invitations' }),
      el('thead', null, el('tr', null, ['Email', 'Name', 'Role', 'Status', 'Expires', 'Invited by', 'Actions'].map(function (h) { return el('th', { scope: 'col', text: h }); }))), tbody)));

    // Redraw both lists after a change, keeping a message on top.
    function redraw(d, message) {
      var host = w.parentNode.parentNode;   // the lists wrapper
      clear(host);
      var save = main; main = host;
      try { drawMemberTable(d); drawInvitations(d); } finally { main = save; }
      var invHead = host.lastChild.querySelector('.student-section-head');
      if (message && invHead) invHead.parentNode.insertBefore(message, invHead.nextSibling);
    }
  }

  // ---------- Import (CSV) ----------
  function parseCSV(text) {
    var rows = [], row = [], cell = '', q = false;
    text = String(text || '').replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',' || c === '\t' || c === ';') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.map(function (r) { return r.map(function (x) { return x.trim(); }); }).filter(function (r) { return r.some(function (x) { return x !== ''; }); });
  }
  // Rows -> [{ line, email, first, last, role, problem }]
  function readRows(rows) {
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.toLowerCase().replace(/[\s_-]+/g, ''); });
    var hasHead = head.some(function (h) { return h === 'email' || h === 'emailaddress'; });
    var idx = { email: 0, first: 1, last: 2, role: 3 };
    if (hasHead) {
      var find = function (names) { for (var i = 0; i < head.length; i++) if (names.indexOf(head[i]) !== -1) return i; return -1; };
      idx = { email: find(['email', 'emailaddress']), first: find(['firstname', 'first', 'givenname']), last: find(['lastname', 'last', 'surname', 'familyname']), role: find(['role']) };
    }
    var body = hasHead ? rows.slice(1) : rows;
    var seen = {}, allowed = roleChoices();
    return body.map(function (r, n) {
      var get = function (k) { return idx[k] >= 0 && r[idx[k]] !== undefined ? r[idx[k]] : ''; };
      var x = { line: n + (hasHead ? 2 : 1), email: get('email').toLowerCase(), first: get('first').slice(0, 60), last: get('last').slice(0, 60), role: (get('role') || 'student').toLowerCase(), problem: null };
      if (!EMAIL.test(x.email) || x.email.length > 254) x.problem = x.email ? 'Not a valid email address' : 'Missing email';
      else if (seen[x.email]) x.problem = 'Duplicate of line ' + seen[x.email];
      else if (allowed.indexOf(x.role) === -1) x.problem = ['owner', 'admin'].indexOf(x.role) !== -1 ? 'Only the owner can invite ' + x.role + 's' : 'Unknown role “' + x.role + '”';
      if (!x.problem || x.problem.indexOf('Duplicate') === -1) seen[x.email] = seen[x.email] || x.line;
      return x;
    });
  }
  function download(name, text) {
    var a = el('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvCell(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }

  function drawImport() {
    var w = section('Import from a spreadsheet', 'Invite many people at once. Nothing is sent until you check the preview.');
    var tpl = el('button', { class: 'link-button', type: 'button', text: 'Download a template', onclick: function () { download('mathlete-invitations.csv', 'email,first_name,last_name,role\nstudent@example.com,Sam,Rivera,student\n'); } });
    w.appendChild(el('div', { class: 'student-empty org-help' },
      el('p', { text: 'Save your list as a CSV file with the columns email, first_name, last_name and role (student or instructor' + (isOwner() ? ', or admin or owner' : '') + '). Role can be left blank for students. Up to 500 rows.' }),
      el('p', null, tpl)));
    var file = el('input', { type: 'file', id: 'csv-file', accept: '.csv,text/csv,text/plain', class: 'org-file' });
    var area = el('textarea', { class: 'input org-csv', id: 'csv-text', rows: '6', placeholder: 'email,first_name,last_name,role\nsam@example.com,Sam,Rivera,student', spellcheck: 'false' });
    var check = el('button', { class: 'button', type: 'button', text: 'Preview' });
    w.appendChild(el('div', { class: 'form' },
      el('div', { class: 'field' }, el('label', { for: 'csv-file', text: 'Choose a CSV file' }), file),
      el('div', { class: 'field' }, el('label', { for: 'csv-text', text: 'Or paste the rows' }), area),
      el('div', { class: 'form-actions' }, check)));
    var out = el('div', { 'aria-live': 'polite' });
    w.appendChild(out);

    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (f.size > 500000) return clear(out).appendChild(notice('error', 'That file is too big. Keep it under 500 rows.'));
      var rd = new FileReader();
      rd.onload = function () { area.value = String(rd.result || ''); preview(); };
      rd.readAsText(f);
    });
    check.addEventListener('click', preview);

    function preview() {
      clear(out);
      var rows = readRows(parseCSV(area.value));
      if (!rows.length) return out.appendChild(notice('error', 'There are no rows to import.'));
      if (rows.length > 500) return out.appendChild(notice('error', 'That’s ' + rows.length + ' rows. Import up to 500 at a time.'));
      check.disabled = true;
      var emails = rows.filter(function (r) { return !r.problem; }).map(function (r) { return r.email; });
      Promise.all([
        emails.length ? S.sb.rpc('check_invitees', { p_org: S.orgId, p_emails: emails }) : Promise.resolve({ data: {} }),
        S.sb.rpc('organization_overview', { p_org: S.orgId })
      ]).then(function (r) {
        check.disabled = false;
        if (r[0].error) throw r[0].error;
        if (!r[1].error) S.ov = r[1].data;
        var known = r[0].data || {}, free = (S.ov.seats || {}).available || 0;
        rows.forEach(function (x) {
          if (x.problem) return;
          if (known[x.email] === 'member') x.problem = 'Already a member';
          else if (known[x.email] === 'invited') x.problem = 'Already invited (re-send it from Members)';
          else if (x.role === 'student') { if (free > 0) free--; else x.problem = 'No student seat left'; }
        });
        showPreview(rows);
      }).catch(function (err) { check.disabled = false; out.appendChild(notice('error', errText(err))); });
    }

    function showPreview(rows) {
      var ready = rows.filter(function (r) { return !r.problem; });
      var tbody = el('tbody');
      rows.forEach(function (x) {
        x.cell = el('td', { 'data-label': 'Result' }, x.problem ? el('span', { class: 'org-status org-status--problem', text: x.problem }) : el('span', { class: 'org-status org-status--ready', text: 'Ready' }));
        tbody.appendChild(el('tr', { class: x.problem ? 'is-muted' : null },
          el('td', { 'data-label': 'Line', text: String(x.line) }),
          el('td', { 'data-label': 'Email', class: 'org-email', text: x.email || '—' }),
          el('td', { 'data-label': 'Name', text: [x.first, x.last].filter(Boolean).join(' ') || '—' }),
          el('td', { 'data-label': 'Role', text: ROLE_WORDS[x.role] || x.role }), x.cell));
      });
      var seats = S.ov.seats || {};
      out.appendChild(el('p', { class: 'org-summary' },
        el('strong', { text: plural(ready.length, 'invitation') + ' ready' }),
        ' · ' + plural(rows.length - ready.length, 'row') + ' skipped · ' + (seats.available || 0) + ' student seats available'));
      out.appendChild(el('div', { class: 'org-table-wrap' }, el('table', { class: 'org-table' },
        el('caption', { class: 'sr-only', text: 'Import preview' }),
        el('thead', null, el('tr', null, ['Line', 'Email', 'Name', 'Role', 'Result'].map(function (h) { return el('th', { scope: 'col', text: h }); }))), tbody)));
      if (!ready.length) return;
      var send = el('button', { class: 'button', type: 'button', text: 'Send ' + plural(ready.length, 'invitation') });
      var progress = el('p', { class: 'meta', 'aria-live': 'polite' });
      out.appendChild(el('div', { class: 'org-actions' }, send, progress));
      send.addEventListener('click', function () {
        send.disabled = true; check.disabled = true;
        var i = 0, sent = 0, failed = 0, links = 0;
        (function nextRow() {
          if (i >= ready.length) {
            progress.textContent = 'Done: ' + sent + ' sent' + (links ? ' (' + links + ' as links to copy)' : '') + (failed ? ', ' + failed + ' failed' : '') + '.';
            check.disabled = false;
            var dl = el('button', { class: 'link-button', type: 'button', text: 'Download results (with any links to send)', onclick: function () {
              download('mathlete-invitation-results.csv', 'line,email,role,result,link\n' + rows.map(function (x) { return [x.line, x.email, x.role, x.result || x.problem || '', x.link || ''].map(csvCell).join(','); }).join('\n') + '\n');
            } });
            out.appendChild(el('p', null, dl));
            S.members = null;
            loadOverview().then(drawTabs);
            return;
          }
          var x = ready[i++];
          progress.textContent = 'Sending ' + i + ' of ' + ready.length + '…';
          invite({ email: x.email, role: x.role, first: x.first, last: x.last }).then(function (res) {
            sent++;
            if (res.emailed) { x.result = 'Emailed'; clear(x.cell).appendChild(el('span', { class: 'org-status org-status--active', text: 'Emailed' })); }
            else { links++; x.result = 'Link to send'; x.link = res.link; clear(x.cell).appendChild(linkBox(res.link, x.email)); }
          }).catch(function (err) {
            failed++; x.result = 'Failed: ' + errText(err);
            clear(x.cell).appendChild(el('span', { class: 'org-status org-status--problem', text: x.result }));
          }).then(nextRow);
        })();
      });
    }
  }

  // ---------- Settings ----------
  function drawSettings() {
    var o = S.ov.organization;
    var w = section('Settings');
    var count = el('p', { class: 'field-hint' });
    var form = el('form', { class: 'form org-settings', novalidate: true },
      el('div', { class: 'field' }, el('label', { for: 'set-name', text: 'Organization name' }), el('input', { class: 'input', id: 'set-name', name: 'name', type: 'text', maxlength: '120', required: true, value: o.name })),
      el('div', { class: 'field' }, el('label', { for: 'set-welcome', text: 'Welcome message' }),
        el('textarea', { class: 'input', id: 'set-welcome', name: 'welcome', rows: '4', maxlength: '600' }), count),
      el('div', { class: 'form-actions' }, el('button', { class: 'button', type: 'submit', text: 'Save' })));
    form.welcome.value = o.welcome_message || '';
    var upd = function () { count.textContent = form.welcome.value.length + ' / 600 characters. Shown to your members.'; };
    form.welcome.addEventListener('input', upd); upd();
    var msg = el('div', { 'aria-live': 'polite' });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      if (name.length < 2) return clear(msg).appendChild(notice('error', 'The name needs at least 2 characters.'));
      var btn = form.querySelector('button'); btn.disabled = true;
      S.sb.rpc('update_organization_settings', { p_org: S.orgId, p_name: name, p_welcome: form.welcome.value }).then(function (r) {
        btn.disabled = false;
        if (r.error) return clear(msg).appendChild(notice('error', errText(r.error)));
        return loadOverview().then(function () { clear(msg).appendChild(notice('success', 'Saved.')); });
      });
    });
    w.appendChild(msg); w.appendChild(form);
    w.appendChild(el('dl', { class: 'join-facts org-facts' },
      el('dt', { text: 'Web address name' }), el('dd', { text: o.slug }),
      el('dt', { text: 'Type' }), el('dd', { text: cap(o.type) }),
      el('dt', { text: 'Status' }), el('dd', { text: cap(o.status) })));
    w.appendChild(el('p', { class: 'student-note', text: 'To change the web address name or type, contact Mathlete.' }));
    drawBranding();
  }

  // ---------- Branding (in Settings) ----------
  // WCAG contrast of a colour on the dark student pages (#131815); the
  // database checks the same rule (color_contrast_on_dark).
  function contrastOnDark(hex) {
    var lum = function (r, g, b) { return [r, g, b].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); };
    var n = parseInt(hex.slice(1), 16);
    return (lum(n >> 16 & 255, n >> 8 & 255, n & 255) + 0.05) / (lum(19, 24, 21) + 0.05);
  }
  function drawBranding() {
    var w = section('Logo and colour', 'Shown with your name on your members’ pages. Mathlete’s own branding stays.');
    var hold = el('p', { class: 'meta', text: 'Loading…' });
    w.appendChild(hold);
    S.sb.rpc('org_student_view', { p_org: S.orgId, p_preview: true }).then(function (r) {
      if (r.error) throw r.error;
      hold.remove();
      var o = r.data.organization, msg = el('div', { 'aria-live': 'polite' });
      var say = function (k, t) { clear(msg).appendChild(notice(k, t)); };
      var save = function (args, done) {
        return S.sb.rpc('set_organization_branding', Object.assign({ p_org: S.orgId }, args)).then(function (x) {
          if (x.error) { say('error', errText(x.error)); return null; }
          o.logo_path = x.data.logo_path; o.accent_color = x.data.accent_color; o.updated_at = new Date().toISOString();
          say('success', done); paint(); return x.data;
        });
      };
      // Logo
      var img = el('img', { class: 'org-logo-preview', alt: '', width: '96', height: '96' });
      img.addEventListener('error', function () { img.hidden = true; });
      var file = el('input', { type: 'file', id: 'logo-file', accept: 'image/png,image/jpeg,image/webp', class: 'org-file' });
      var removeLogo = el('button', { class: 'link-button link-button--danger', type: 'button', text: 'Remove logo' });
      // Colour
      var picker = el('input', { type: 'color', id: 'accent-pick', class: 'org-color', 'aria-label': 'Pick a colour' });
      var hex = el('input', { type: 'text', id: 'accent-hex', class: 'input input--small org-hex', maxlength: '7', placeholder: '#86B6D4', 'aria-label': 'Colour code' });
      var check = el('p', { class: 'field-hint', 'aria-live': 'polite' });
      var saveColor = el('button', { class: 'button', type: 'button', text: 'Save colour' });
      var removeColor = el('button', { class: 'link-button link-button--danger', type: 'button', text: 'Remove colour' });
      var swatch = el('span', { class: 'org-swatch', 'aria-hidden': 'true' });
      function paint() {
        var url = window.MathleteOrg ? window.MathleteOrg.logoUrl(o.logo_path, o.updated_at) : null;
        if (url) { img.src = url; img.alt = o.name + ' logo'; img.hidden = false; removeLogo.hidden = false; } else { img.hidden = true; removeLogo.hidden = true; }
        if (o.accent_color) { picker.value = o.accent_color; hex.value = o.accent_color; }
        removeColor.hidden = !o.accent_color;
        rate();
      }
      function rate() {
        var v = hex.value.trim();
        if (!/^#[0-9a-f]{6}$/i.test(v)) { check.textContent = 'Use a colour code like #86B6D4.'; saveColor.disabled = true; swatch.style.background = 'transparent'; return; }
        var c = contrastOnDark(v);
        swatch.style.background = v;
        saveColor.disabled = c < 3;
        check.textContent = c < 3 ? 'Too dark to read on Mathlete’s dark pages (contrast ' + c.toFixed(1) + ':1, needs 3:1). Choose a lighter shade.' : 'Readable (contrast ' + c.toFixed(1) + ':1).';
      }
      picker.addEventListener('input', function () { hex.value = picker.value; rate(); });
      hex.addEventListener('input', function () { if (/^#[0-9a-f]{6}$/i.test(hex.value.trim())) picker.value = hex.value.trim(); rate(); });
      saveColor.addEventListener('click', function () { saveColor.disabled = true; save({ p_accent: hex.value.trim() }, 'Colour saved.').then(rate); });
      removeColor.addEventListener('click', function () { save({ p_accent: '' }, 'Colour removed.'); hex.value = ''; });
      file.addEventListener('change', function () {
        var f = file.files && file.files[0];
        if (!f) return;
        var ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[f.type];
        if (!ext) return say('error', 'Use a PNG, JPEG or WebP image.');
        if (f.size > 524288) return say('error', 'That image is ' + Math.round(f.size / 1024) + ' KB. Keep it under 512 KB.');
        var probe = new Image(), url = URL.createObjectURL(f);
        probe.onload = function () {
          URL.revokeObjectURL(url);
          if (probe.naturalWidth < 64 || probe.naturalHeight < 64) return say('error', 'That image is too small. Use at least 64 × 64 pixels.');
          if (probe.naturalWidth > 2000 || probe.naturalHeight > 2000) return say('error', 'That image is too large. Keep it under 2000 × 2000 pixels.');
          var old = o.logo_path, path = S.orgId + '/logo-' + Date.now().toString(36) + '.' + ext;
          say('info', 'Uploading…');
          S.sb.storage.from('org-branding').upload(path, f, { contentType: f.type, upsert: false }).then(function (u) {
            if (u.error) return say('error', 'Couldn’t upload the logo: ' + (u.error.message || 'try again.'));
            return save({ p_logo_path: path }, 'Logo saved.').then(function (ok) {
              if (ok && old && old !== path) S.sb.storage.from('org-branding').remove([old]).catch(function () {});
              file.value = '';
            });
          });
        };
        probe.onerror = function () { URL.revokeObjectURL(url); say('error', 'That file isn’t an image we can read.'); };
        probe.src = url;
      });
      removeLogo.addEventListener('click', function () {
        var old = o.logo_path;
        save({ p_logo_path: '' }, 'Logo removed.').then(function (ok) { if (ok && old) S.sb.storage.from('org-branding').remove([old]).catch(function () {}); });
      });
      w.appendChild(msg);
      w.appendChild(el('div', { class: 'org-brand' },
        el('div', { class: 'field' }, el('label', { for: 'logo-file', text: 'Logo' }), el('div', { class: 'org-logo-row' }, img, el('div', null, file,
          el('p', { class: 'field-hint', text: 'PNG, JPEG or WebP, under 512 KB, 64 to 2000 pixels on each side. A square logo looks best.' }), removeLogo))),
        el('div', { class: 'field' }, el('label', { for: 'accent-hex', text: 'Accent colour' }),
          el('div', { class: 'org-color-row' }, picker, hex, swatch, saveColor, removeColor), check)));
      paint();
    }).catch(function (err) { hold.textContent = ''; w.appendChild(notice('error', errText(err))); });
  }

  // ---------- Resources (PRD 3) ----------
  var TYPE_GROUPS = [['feature', 'Platform features'], ['sport', 'Sports'], ['course', 'Courses'], ['lab', 'Learning labs'], ['module', 'Learning modules']];
  var STATE_WORDS = { enabled: 'On', disabled: 'Off', not_included: 'Not in your plan', unavailable: 'Unavailable', needs_context: 'On, but paused' };
  function drawResources() {
    var w = section('Learning resources', 'Choose what your students see. You can switch on anything your licence includes; to add more, contact Mathlete.');
    var hold = el('p', { class: 'meta', text: 'Loading…' });
    w.appendChild(hold);
    var msg = el('div', { 'aria-live': 'polite' });
    S.sb.rpc('org_resources', { p_org: S.orgId }).then(function (r) {
      if (r.error) throw r.error;
      hold.remove();
      w.appendChild(msg);
      var data = r.data, body = el('div');
      w.appendChild(body);
      function reload(note) {
        return S.sb.rpc('org_resources', { p_org: S.orgId }).then(function (x) { if (x.error) throw x.error; data = x.data; draw(); if (note) clear(msg).appendChild(notice('success', note)); });
      }
      function draw() {
        clear(body);
        var def = el('input', { type: 'checkbox', id: 'res-default', checked: data.new_resources_enabled ? true : null });
        def.addEventListener('change', function () {
          def.disabled = true;
          S.sb.rpc('set_new_resources_enabled', { p_org: S.orgId, p_enabled: def.checked }).then(function (x) {
            def.disabled = false;
            if (x.error) { def.checked = !def.checked; return clear(msg).appendChild(notice('error', errText(x.error))); }
            clear(msg).appendChild(notice('success', def.checked ? 'Resources added to your licence later will start switched on.' : 'Resources added to your licence later will start switched off.'));
          });
        });
        body.appendChild(el('p', { class: 'org-check-line' }, def, el('label', { for: 'res-default', text: ' Resources added to our licence later start switched on' })));
        var byName = {}; data.resources.forEach(function (x) { byName[x.id] = x.name; });
        var out = [];
        TYPE_GROUPS.forEach(function (g) {
          var list = data.resources.filter(function (x) { return x.type === g[0]; });
          var mine = list.filter(function (x) { return x.state !== 'not_included'; }), other = list.filter(function (x) { return x.state === 'not_included'; });
          if (!list.length) return;
          var ul = el('ul', { class: 'org-res-list' }, mine.map(row));
          var grp = el('div', { class: 'org-res-group' }, el('h3', { class: 'org-res-title', text: g[1] }), mine.length ? ul : el('p', { class: 'meta', text: 'None in your plan.' }));
          if (other.length) grp.appendChild(el('details', { class: 'org-res-more' }, el('summary', { text: 'Not in your plan (' + other.length + ')' }), el('ul', { class: 'org-res-list' }, other.map(row))));
          out.push(grp);
        });
        out.forEach(function (n) { body.appendChild(n); });
        function row(x) {
          var chip = el('span', { class: 'org-status org-status--' + (x.state === 'enabled' ? 'active' : x.state === 'disabled' ? 'pending' : x.state === 'not_included' ? 'revoked' : 'suspended'),
            text: x.state === 'unavailable' && x.status === 'coming_soon' ? 'Coming soon' : STATE_WORDS[x.state] || x.state });
          var control = null;
          if (x.entitled && x.status === 'available') {
            control = el('button', { class: 'org-switch-btn', type: 'button', role: 'switch', 'aria-checked': x.enabled ? 'true' : 'false', 'aria-label': (x.enabled ? 'Switch off ' : 'Switch on ') + x.name, text: x.enabled ? 'On' : 'Off' });
            control.addEventListener('click', function () {
              control.disabled = true;
              S.sb.rpc('set_resource_enabled', { p_org: S.orgId, p_resource: x.id, p_enabled: !x.enabled }).then(function (y) {
                if (y.error) { control.disabled = false; return clear(msg).appendChild(notice('error', errText(y.error))); }
                return reload(x.name + (x.enabled ? ' switched off.' : ' switched on.'));
              }).catch(function (e) { control.disabled = false; clear(msg).appendChild(notice('error', errText(e))); });
            });
          }
          var why = x.state === 'needs_context' ? 'Paused until ' + x.requires.map(function (q) { return q.name; }).join(' and ') + ' is switched on.'
            : x.state === 'not_included' ? 'Not included in your licence. Contact Mathlete to add it.'
            : x.state === 'unavailable' ? (x.status === 'coming_soon' ? 'Being built. It can be switched on once it’s ready.' : 'Temporarily unavailable from Mathlete.')
            : x.audience === 'staff' ? 'Staff only.' : null;
          var safe = window.MathleteOrg && window.MathleteOrg.safeHref(x.url);
          return el('li', { class: 'org-res' + (x.state === 'not_included' || x.state === 'unavailable' ? ' is-muted' : '') },
            el('div', { class: 'org-res-main' },
              el('p', { class: 'org-res-name' }, safe ? el('a', { href: safe, text: x.name }) : x.name, ' ', chip),
              x.description ? el('p', { class: 'org-res-desc', text: x.description }) : null,
              why ? el('p', { class: 'org-res-why', text: why }) : null),
            control);
        }
      }
      draw();
      drawTopics(data, reload);
      drawCollections(data, reload);
    }).catch(function (err) { hold.textContent = ''; w.appendChild(notice('error', errText(err))); });
  }

  // Recommended topics: pick topics from the courses your licence includes.
  function drawTopics(data) {
    var w = section('Recommended topics', 'Highlighted for your students on their dashboard and in Classes. Mathlete’s curriculum itself stays the same.');
    var courses = (window.MATHLETE_COURSE_TOPICS || []).filter(function (c) {
      var r = data.resources.filter(function (x) { return x.id === 'course.' + c.id; })[0];
      return r && r.entitled;
    });
    if (!courses.length) return w.appendChild(el('p', { class: 'meta', text: 'Your licence doesn’t include a course yet.' }));
    var chosen = {}; (data.recommended_topics || []).forEach(function (t) { chosen[t] = true; });
    var count = el('p', { class: 'meta org-count' });
    var upd = function () { count.textContent = Object.keys(chosen).filter(function (k) { return chosen[k]; }).length + ' chosen (up to 60).'; };
    courses.forEach(function (c) {
      var n = 0;
      var d = el('details', { class: 'org-topic-course' }, el('summary', { text: c.name }));
      c.units.forEach(function (u) {
        var ul = el('ul', { class: 'org-topic-list' });
        u.topics.forEach(function (t) {
          var id = 'rt-' + t[0].replace(/\./g, '-');
          var cb = el('input', { type: 'checkbox', id: id, value: t[0], checked: chosen[t[0]] ? true : null });
          if (chosen[t[0]]) n++;
          cb.addEventListener('change', function () { chosen[t[0]] = cb.checked; upd(); });
          ul.appendChild(el('li', null, cb, el('label', { for: id, text: ' ' + t[2] })));
        });
        d.appendChild(el('div', { class: 'org-topic-unit' }, el('p', { class: 'org-topic-unit-title', text: u.title }), ul));
      });
      if (n) d.querySelector('summary').textContent = c.name + ' (' + n + ' chosen)';
      w.appendChild(d);
    });
    var msg = el('div', { 'aria-live': 'polite' });
    var btn = el('button', { class: 'button', type: 'button', text: 'Save recommended topics' });
    btn.addEventListener('click', function () {
      // Keep the curriculum's order.
      var list = [];
      courses.forEach(function (c) { c.units.forEach(function (u) { u.topics.forEach(function (t) { if (chosen[t[0]]) list.push(t[0]); }); }); });
      btn.disabled = true;
      S.sb.rpc('set_recommended_topics', { p_org: S.orgId, p_topics: list }).then(function (r) {
        btn.disabled = false;
        clear(msg).appendChild(r.error ? notice('error', errText(r.error)) : notice('success', 'Saved: ' + plural(list.length, 'recommended topic') + '.'));
      });
    });
    w.appendChild(el('div', { class: 'org-actions' }, btn, count));
    w.appendChild(msg);
    upd();
  }

  // Collections: named lists of resources ("Quadratics week").
  function drawCollections(data, reload) {
    var w = section('Collections', 'Group resources for your students, like “Start here” or “Quadratics week”. Only switched-on resources show to students.');
    var choices = data.resources.filter(function (x) { return x.entitled && ['lab', 'module', 'course'].indexOf(x.type) !== -1; });
    var byId = {}; data.resources.forEach(function (x) { byId[x.id] = x; });
    var msg = el('div', { 'aria-live': 'polite' });
    w.appendChild(msg);
    var list = el('ul', { class: 'org-people' });
    (data.collections || []).forEach(function (c) {
      var names = c.items.map(function (i) { return byId[i] ? byId[i].name : i; }).join(', ');
      var edit = el('button', { class: 'link-button', type: 'button', text: 'Edit' });
      var del = el('button', { class: 'link-button link-button--danger', type: 'button', text: 'Delete' });
      edit.addEventListener('click', function () { form(c); });
      del.addEventListener('click', function () {
        if (!window.confirm('Delete the collection “' + c.title + '”? The resources themselves stay.')) return;
        S.sb.rpc('delete_collection', { p_org: S.orgId, p_id: c.id }).then(function (r) {
          if (r.error) return clear(msg).appendChild(notice('error', errText(r.error)));
          route();
        });
      });
      list.appendChild(el('li', null, el('span', null, el('strong', { text: c.title }), el('span', { class: 'org-res-desc', text: ' ' + (names || 'empty') })), el('span', { class: 'org-row-actions' }, edit, del)));
    });
    if ((data.collections || []).length) w.appendChild(list); else w.appendChild(el('p', { class: 'meta', text: 'No collections yet.' }));
    var formHost = el('div');
    var add = el('button', { class: 'button button--quiet', type: 'button', text: 'New collection' });
    add.addEventListener('click', function () { form(null); });
    w.appendChild(el('div', { class: 'org-actions' }, add));
    w.appendChild(formHost);
    function form(c) {
      clear(formHost);
      var picked = {}; (c ? c.items : []).forEach(function (i) { picked[i] = true; });
      var f = el('form', { class: 'form org-settings', novalidate: true },
        el('div', { class: 'field' }, el('label', { for: 'col-title', text: 'Title' }), el('input', { class: 'input', id: 'col-title', name: 'title', maxlength: '80', value: c ? c.title : '' })),
        el('div', { class: 'field' }, el('label', { for: 'col-desc', text: 'Description (optional)' }), el('input', { class: 'input', id: 'col-desc', name: 'desc', maxlength: '300', value: c && c.description ? c.description : '' })),
        el('fieldset', { class: 'org-col-items' }, el('legend', { text: 'Resources' }), choices.map(function (x) {
          var id = 'col-' + x.id.replace(/\./g, '-');
          var cb = el('input', { type: 'checkbox', id: id, checked: picked[x.id] ? true : null });
          cb.addEventListener('change', function () { picked[x.id] = cb.checked; });
          return el('p', { class: 'org-check-line' }, cb, el('label', { for: id, text: ' ' + x.name + (x.state === 'enabled' ? '' : ' (' + (STATE_WORDS[x.state] || x.state).toLowerCase() + ')') }));
        })),
        el('div', { class: 'form-actions' }, el('button', { class: 'button', type: 'submit', text: c ? 'Save collection' : 'Create collection' }),
          el('button', { class: 'link-button', type: 'button', text: 'Cancel', onclick: function () { clear(formHost); } })));
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = choices.filter(function (x) { return picked[x.id]; }).map(function (x) { return x.id; });
        if (!f.title.value.trim()) return clear(msg).appendChild(notice('error', 'Give the collection a title.'));
        S.sb.rpc('save_collection', { p_org: S.orgId, p_id: c ? c.id : null, p_title: f.title.value.trim(), p_description: f.desc.value.trim() || null, p_items: items }).then(function (r) {
          if (r.error) return clear(msg).appendChild(notice('error', errText(r.error)));
          route();
        });
      });
      formHost.appendChild(f);
      f.title.focus();
    }
  }

  // ---------- Student preview ----------
  function drawPreview() {
    var w = section('Student preview', 'What your students see on their dashboard: your branding, welcome message and everything switched on.');
    var hold = el('p', { class: 'meta', text: 'Loading…' });
    w.appendChild(hold);
    S.sb.rpc('org_student_view', { p_org: S.orgId, p_preview: true }).then(function (r) {
      if (r.error) throw r.error;
      hold.remove();
      if (!r.data.open) w.appendChild(notice('info', 'Students can’t use Mathlete here yet (the organization or its licence isn’t active). This is what they’ll see once it is.'));
      var frame = el('div', { class: 'org-preview' });
      w.appendChild(frame);
      if (window.MathleteOrg && window.MathleteOrg.drawSchool) window.MathleteOrg.drawSchool(frame, r.data, { preview: true });
      w.appendChild(el('p', { class: 'student-note' }, 'Change what’s here under ', el('a', { href: '#resources', text: 'Resources' }), ' and ', el('a', { href: '#settings', text: 'Settings' }), '.'));
    }).catch(function (err) { hold.textContent = ''; w.appendChild(notice('error', errText(err))); });
  }

  // ---------- Subscription ----------
  function drawSubscription() {
    var w = section('Subscription', 'Your licence is set up with Mathlete. To change your plan or seats, get in touch.');
    var hold = el('p', { class: 'meta', text: 'Loading…' });
    w.appendChild(hold);
    S.sb.rpc('org_subscription', { p_org: S.orgId }).then(function (r) {
      if (r.error) throw r.error;
      var d = r.data, s = d.seats || {};
      hold.remove();
      w.appendChild(el('ul', { class: 'stat-row' },
        el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Licence' }), el('p', { class: 'stat-value stat-value--word', text: LICENSE_WORDS[d.state] || d.state })),
        el('li', { class: 'stat' }, el('p', { class: 'stat-label', text: 'Student seats' }), el('p', { class: 'stat-value', text: String(s.licensed || 0) }),
          el('p', { class: 'stat-sub', text: (s.active_students || 0) + ' in use · ' + (s.pending_invitations || 0) + ' invited · ' + (s.available || 0) + ' free' }))));
      var h = d.history || [];
      if (!h.length) return w.appendChild(el('p', { class: 'meta org-gap', text: 'No licence yet. Mathlete will set it up with you.' }));
      var tbody = el('tbody');
      h.forEach(function (x) {
        tbody.appendChild(el('tr', { class: x.current ? null : 'is-muted' },
          el('td', { 'data-label': 'Plan', text: x.plan_name || x.plan }),
          el('td', { 'data-label': 'Status' }, el('span', { class: 'org-status org-status--' + x.status, text: cap(x.status.replace('_', ' ')) + (x.current ? '' : ' (earlier)') })),
          el('td', { 'data-label': 'Seats', text: String(x.seats) }),
          el('td', { 'data-label': 'Starts', text: fmtDate(x.starts_on) }),
          el('td', { 'data-label': 'Ends', text: fmtDate(x.ends_on) })));
      });
      w.appendChild(el('div', { class: 'org-table-wrap org-gap' }, el('table', { class: 'org-table' },
        el('caption', { class: 'sr-only', text: 'Licence history' }),
        el('thead', null, el('tr', null, ['Plan', 'Status', 'Seats', 'Starts', 'Ends'].map(function (t) { return el('th', { scope: 'col', text: t }); }))), tbody)));
      w.appendChild(el('p', { class: 'student-note' }, 'Questions about your licence? ', el('a', { href: 'index.html#contact', text: 'Contact Mathlete' }), '.'));
    }).catch(function (err) { hold.textContent = ''; w.appendChild(notice('error', errText(err))); });
  }
})();
