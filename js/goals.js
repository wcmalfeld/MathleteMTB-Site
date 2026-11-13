// My Goals (goals.html): the student's learning goals with progress
// measured from what they have actually done, and a form to set one.
// Who may set, change or finish a goal is decided by the database
// (save_goal and set_goal_status in supabase/progress.sql): a student
// can change only goals they set themselves; tutor-set goals are the
// tutor's to change.
(function () {
  'use strict';
  var S = window.MathleteStudent, el = S.el;

  // The kinds a student can pick, and how each reads as a sentence.
  var KINDS = [
    { id: 'sessions',    label: 'Practice sessions',        n: 3,  title: function (n) { return 'Complete ' + S.plural(n, 'practice session'); } },
    { id: 'questions',   label: 'Questions answered',       n: 20, title: function (n) { return 'Answer ' + S.plural(n, 'question'); } },
    { id: 'corrections', label: 'Mistakes corrected',       n: 5,  title: function (n) { return 'Correct ' + S.plural(n, 'missed question'); } },
    { id: 'skill',       label: 'Practice one skill',       n: 10, title: function (n, x) { return 'Answer ' + n + ' ' + (x || 'skill') + ' question' + (n === 1 ? '' : 's'); } },
    { id: 'game',        label: 'Finish rounds of a game',  n: 2,  title: function (n, x) { return 'Finish ' + S.plural(n, 'round') + ' of ' + (x || 'a game'); } },
    { id: 'custom',      label: 'Something else', n: null, title: function (n, x) { return x || ''; } }
  ];
  function kind(id) { return KINDS.filter(function (k) { return k.id === id; })[0]; }

  // This coming Sunday, as YYYY-MM-DD in the visitor's own calendar.
  function endOfWeek() {
    var d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function section(id, title, note) {
    var body = el('div');
    var sec = el('section', { class: 'student-section', 'aria-labelledby': id },
      el('div', { class: 'wrap' },
        el('div', { class: 'student-section-head' }, el('h2', { class: 'label', id: id }, title), note ? el('p', { class: 'meta' }, note) : null),
        body));
    sec.body = body;
    return sec;
  }

  function page(ctx, d, skills) {
    var main = document.getElementById('student-main'), lede = document.getElementById('student-lede');
    var notice = el('div', { class: 'feedback', role: 'status', hidden: true });
    function say(tone, text) { notice.className = 'feedback' + (tone ? ' feedback--' + tone : ''); notice.textContent = text; notice.hidden = false; }

    var activeSec = section('active-title', 'On the go');
    var doneSec = section('done-title', 'Done');
    var addSec = section('add-title', 'Set a goal', 'Progress is counted from now, from what you actually do');

    function reload() {
      return ctx.sb.rpc('student_goals').then(function (res) {
        if (res.error) throw res.error;
        draw(res.data || []);
      });
    }
    function act(promise, okText) {
      return promise.then(function (res) {
        if (res.error) return say('wrong', res.error.message || 'That didn’t work. Try again.');
        if (okText) say('right', okText);
        return reload();
      }, function () { say('wrong', 'Couldn’t reach the server. Check your connection and try again.'); });
    }

    function draw(goals) {
      var active = goals.filter(function (g) { return g.status === 'active'; });
      var done = goals.filter(function (g) { return g.status === 'completed'; });
      lede.textContent = !goals.length ? 'No goals yet. Set one below, or ask your tutor to set one with you.'
        : active.length ? S.plural(active.length, 'goal') + ' on the go' + (done.length ? ', ' + done.length + ' done.' : '.')
        : 'Every goal is done. Set the next one below.';

      S.clear(activeSec.body);
      if (active.length) {
        activeSec.body.appendChild(el('ul', { class: 'skill-list' }, active.map(function (g) {
          var actions = [];
          if (g.can_complete) actions.push(el('button', { type: 'button', onclick: function () {
            act(ctx.sb.rpc('set_goal_status', { p_goal_id: g.id, p_status: 'completed' }), 'Nice work. Marked done.'); } }, 'Mark done'));
          if (g.can_edit) actions.push(el('button', { type: 'button', onclick: function () {
            act(ctx.sb.rpc('set_goal_status', { p_goal_id: g.id, p_status: 'archived' }), 'Goal removed.'); } }, 'Remove'));
          return S.goalRow(g, actions);
        })));
      } else {
        activeSec.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, goals.length ? 'Nothing on the go right now.' : 'Goals you or your tutor set will show up here, with progress counted from your practice.')));
      }
      doneSec.hidden = !done.length;
      S.clear(doneSec.body);
      if (done.length) doneSec.body.appendChild(el('ul', { class: 'skill-list' }, done.map(function (g) { return S.goalRow(g); })));
    }

    // ----- the form -----
    var fKind = el('select', { id: 'g-kind' }, KINDS.map(function (k) { return el('option', { value: k.id }, k.label); }));
    var fTarget = el('input', { id: 'g-target', type: 'number', min: '1', max: '500', inputmode: 'numeric', value: '3' });
    var fSkill = el('select', { id: 'g-skill' }, skills.map(function (s) { return el('option', { value: s.id }, s.name); }));
    var games = (window.MATHLETE_TOOLS || []).filter(function (t) { return t.status === 'live'; });
    var fGame = el('select', { id: 'g-game' }, games.map(function (t) { return el('option', { value: t.id }, t.name); }));
    var fText = el('input', { id: 'g-text', type: 'text', maxlength: '140', placeholder: 'e.g. Show my working on every problem' });
    var fDue = el('input', { id: 'g-due', type: 'date', value: endOfWeek() });
    var lTarget = el('label', { for: 'g-target' }, 'How many', fTarget);
    var lSkill = el('label', { for: 'g-skill' }, 'Skill', fSkill);
    var lGame = el('label', { for: 'g-game' }, 'Game', fGame);
    var lText = el('label', { for: 'g-text', class: 'goal-wide' }, 'Your goal', fText);
    var preview = el('p', { class: 'goal-preview goal-wide', 'aria-live': 'polite' });
    var submit = el('button', { class: 'button', type: 'submit' }, 'Set this goal');

    function current() {
      var k = kind(fKind.value), n = Math.round(Number(fTarget.value));
      var extra = k.id === 'skill' ? (fSkill.selectedOptions[0] || {}).textContent : k.id === 'game' ? (fGame.selectedOptions[0] || {}).textContent : k.id === 'custom' ? fText.value.trim() : null;
      return { k: k, n: n, title: k.title(n, extra) };
    }
    function sync(resetTarget) {
      var k = kind(fKind.value);
      if (resetTarget && k.n) fTarget.value = String(k.n);
      lTarget.hidden = k.id === 'custom'; lSkill.hidden = k.id !== 'skill'; lGame.hidden = k.id !== 'game'; lText.hidden = k.id !== 'custom';
      var c = current();
      S.clear(preview);
      if (c.title) { preview.appendChild(el('b', null, 'Goal: ')); preview.appendChild(document.createTextNode(c.title + (fDue.value ? ', by ' + S.fmtDate(fDue.value + 'T12:00:00', { weekday: 'long', month: 'short', day: 'numeric' }) : '') + '.')); }
    }
    fKind.addEventListener('change', function () { sync(true); });
    [fTarget, fSkill, fGame, fText, fDue].forEach(function (f) { f.addEventListener('input', function () { sync(false); }); });

    var form = el('form', { class: 'goal-form', novalidate: true },
      el('label', { for: 'g-kind' }, 'What', fKind), lTarget, lSkill, lGame, lText,
      el('label', { for: 'g-due' }, 'By when', fDue),
      preview,
      el('div', { class: 'goal-wide' }, submit));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = current();
      if (c.k.id === 'custom' && !c.title) { fText.focus(); return say('wrong', 'Write your goal first.'); }
      if (c.k.id !== 'custom' && !(c.n >= 1 && c.n <= 500)) { fTarget.focus(); return say('wrong', 'Pick how many: a number from 1 to 500.'); }
      submit.disabled = true;
      act(ctx.sb.rpc('save_goal', {
        p_kind: c.k.id, p_title: c.title, p_target: c.k.id === 'custom' ? null : c.n,
        p_skill_id: c.k.id === 'skill' ? fSkill.value : null, p_game_id: c.k.id === 'game' ? fGame.value : null,
        p_due_on: fDue.value || null
      }), 'Goal set. Go get it.').then(function () { submit.disabled = false; fText.value = ''; sync(false); });
    });
    addSec.body.appendChild(form);
    sync(true);

    S.clear(main);
    main.appendChild(el('div', { class: 'wrap', style: 'padding-top:24px' }, notice));
    main.appendChild(activeSec); main.appendChild(addSec); main.appendChild(doneSec);
    main.hidden = false;
    S.drawTabs('goals', d.review.waiting);
    return reload();
  }

  S.ready('goals').then(function (ctx) {
    return Promise.all([S.loadDashboard(ctx.sb), ctx.sb.from('skills').select('id,name,sort_order,active').order('sort_order', { ascending: true })]).then(function (r) {
      if (r[1].error) throw r[1].error;
      return page(ctx, r[0], r[1].data.filter(function (s) { return s.active !== false; }));
    });
  }).catch(S.fail);
})();
