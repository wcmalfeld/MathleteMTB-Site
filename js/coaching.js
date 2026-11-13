// MTB Coaching pages: coaching.html (Coaching Dashboard), riding-goals.html
// (My Goals) and training.html (My Training: the plan and the ride log).
// The page is picked by <body data-page>.
//
// Everything comes from coaching_home() and is changed through the
// functions in supabase/coaching.sql, which decide who may do what:
// a rider changes their own goals, plan and log; a coach the rider is
// assigned to can add to them too. These records are separate from the
// academic ones: nothing here reads or writes learning progress.
//
// Text from the database is always put on the page as plain text.
(function () {
  'use strict';
  // MTB Coaching is hidden for now: these pages send visitors to the
  // dashboard, and nothing links here. To switch it on, set this to true,
  // put the "My Riding" nav link back and run supabase/coaching.sql
  // (see docs/COACHING.md).
  var COACHING_ENABLED = false;
  if (!COACHING_ENABLED) { location.replace('dashboard.html'); return; }

  var S = window.MathleteStudent, el = S.el;
  var PAGE = document.body.getAttribute('data-page');

  // ---------- words ----------

  var HORIZONS = [
    { id: 'dream',   label: 'Big goal',      many: 'Big goals',     hint: 'A long-term dream: where you want your riding to go.' },
    { id: 'quarter', label: 'Next 3 months', many: 'Next 3 months', hint: 'A goal for this season or the next few months.' },
    { id: 'month',   label: 'This month',    many: 'This month',    hint: 'A milestone you can reach in a few weeks.' },
    { id: 'week',    label: 'This week',     many: 'This week',     hint: 'Something to work on in your next few rides.' }
  ];
  function horizon(id) { return HORIZONS.filter(function (h) { return h.id === id; })[0] || HORIZONS[2]; }

  var RIDE_TYPES = [
    { id: 'trail', label: 'Trail ride' }, { id: 'bike_park', label: 'Bike park' }, { id: 'pump_track', label: 'Pump track' },
    { id: 'dirt_jumps', label: 'Dirt jumps' }, { id: 'skills', label: 'Skills session' }, { id: 'race', label: 'Race' }, { id: 'other', label: 'Other' }
  ];
  function rideType(id) { var t = RIDE_TYPES.filter(function (x) { return x.id === id; })[0]; return t ? t.label : 'Ride'; }

  // ---------- small helpers ----------

  function day(iso, long) {   // 'YYYY-MM-DD' -> 'Tue, Nov 17'
    return iso ? S.fmtDate(iso + 'T12:00:00', long ? { weekday: 'long', month: 'short', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' }) : '';
  }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function today() { return ymd(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }
  function minutes(m) { return m >= 60 ? Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '') : m + ' min'; }
  function setBy(x) { return x.set_by === 'athlete' ? 'Set by you' : 'From ' + (x.set_by_name || (x.set_by === 'admin' ? 'Mathlete' : 'your coach')); }

  function section(id, title, note) {
    var body = el('div');
    var sec = el('section', { class: 'student-section', 'aria-labelledby': id },
      el('div', { class: 'wrap' },
        el('div', { class: 'student-section-head' }, el('h2', { class: 'label', id: id }, title), note ? el('p', { class: 'meta' }, note) : null),
        body));
    sec.body = body;
    return sec;
  }
  function link(href, text) { return el('a', { class: 'read-link', href: href }, text, el('span', { 'aria-hidden': 'true' }, ' →')); }
  function btn(text, onclick, cls) { return el('button', { type: 'button', class: cls || null, onclick: onclick }, text); }
  function chip(tone, icon, label) {
    return el('span', { class: 'status status--' + tone }, el('span', { class: 'status-icon', 'aria-hidden': 'true' }, icon), label);
  }
  function field(label, input, cls) {
    if (!input.id) input.id = 'f-' + Math.random().toString(36).slice(2, 9);
    return el('label', { for: input.id, class: cls || null }, label, input);
  }
  function options(list, value, blank) {
    var out = blank ? [el('option', { value: '' }, blank)] : [];
    return out.concat(list.map(function (o) { return el('option', { value: o.id, selected: o.id === value ? true : null }, o.label || o.name || o.title); }));
  }

  // The page's messages, and running a change then reloading.
  var notice = el('div', { class: 'feedback', role: 'status', hidden: true });
  function say(tone, text) { notice.className = 'feedback' + (tone ? ' feedback--' + tone : ''); notice.textContent = text; notice.hidden = false; }
  var ctx, data, redraw;
  function load() {
    return ctx.sb.rpc('coaching_home').then(function (res) {
      if (res.error) throw res.error;
      data = res.data;
      return data;
    });
  }
  // Run an rpc; on success show okText and redraw the page from fresh data.
  function act(fn, args, okText) {
    return ctx.sb.rpc(fn, args).then(function (res) {
      if (res.error) { say('wrong', res.error.message || 'That didn’t work. Try again.'); return false; }
      if (okText) say('right', okText);
      return load().then(function () { redraw(); return res.data || true; });
    }, function () { say('wrong', 'Couldn’t reach the server. Check your connection and try again.'); return false; });
  }

  function goalById(id) { return data.goals.filter(function (g) { return g.id === id; })[0]; }
  function openGoals() { return data.goals.filter(function (g) { return g.status === 'active' || g.status === 'paused'; }); }
  function plannedItems() { return data.plan.filter(function (i) { return i.status === 'planned'; }); }

  // ---------- pieces ----------

  function goalState(g) {
    if (g.status === 'achieved') return chip('strong', '✓', 'Achieved');
    if (g.status === 'paused') return chip('not_enough_data', '‖', 'Paused');
    if (g.past_due) return chip('needs_practice', '!', 'Past target date');
    return chip('developing', '↗', 'On the go');
  }

  // A goal. `full` adds the why / starting point / outcome, the steps you
  // can tick, and the buttons (My Goals page).
  function goalCard(g, full, onEdit) {
    var steps = g.steps || [], done = steps.filter(function (s) { return s.done_at; }).length;
    var facts = [];
    if (g.status === 'achieved' && g.achieved_at) facts.push('Achieved ' + S.fmtDate(g.achieved_at, { month: 'short', day: 'numeric', year: 'numeric' }));
    else if (g.target_date) facts.push((g.past_due ? 'Target was ' : 'Target ') + day(g.target_date));
    if (steps.length) facts.push(done + ' of ' + S.plural(steps.length, 'step') + ' done');
    if (g.rides) facts.push(S.plural(g.rides, 'ride') + ' logged');
    facts.push(setBy(g));
    var parent = g.parent_id ? goalById(g.parent_id) : null;

    var card = el('li', { class: 'ride-goal' + (g.status === 'achieved' ? ' ride-goal--done' : '') },
      el('div', { class: 'ride-goal-head' },
        el('div', null,
          el('p', { class: 'rec-kicker' }, horizon(g.horizon).label + (g.area_name ? ' · ' + g.area_name : '')),
          el('h3', { class: 'ride-goal-title' }, g.title),
          parent ? el('p', { class: 'ride-goal-parent' }, 'Part of: ', parent.title) : null),
        goalState(g)),
      el('p', { class: 'row-meta' }, facts.join(' · ')));
    if (steps.length) {
      card.appendChild(el('div', { class: 'meter meter--' + (g.status === 'achieved' ? 'strong' : 'developing'), role: 'img', 'aria-label': done + ' of ' + steps.length + ' steps done' },
        done ? el('span', { style: 'width:' + Math.round(100 * done / steps.length) + '%' }) : null));
    }
    if (!full) return card;

    var notes = [['Why it matters', g.why], ['Starting point', g.starting_point], ['When I get there', g.target_outcome]].filter(function (x) { return x[1]; });
    if (notes.length) {
      card.appendChild(el('dl', { class: 'ride-notes' }, notes.map(function (x) { return [el('dt', null, x[0]), el('dd', null, x[1])]; })));
    }

    var editable = g.status !== 'achieved';
    var list = el('ul', { class: 'ride-steps', 'aria-label': 'Steps' }, steps.map(function (s) {
      var box = el('input', { type: 'checkbox', checked: s.done_at ? true : null, disabled: editable ? null : true,
        onchange: function () { act('set_goal_step', { p_step_id: s.id, p_done: box.checked }, box.checked ? 'Step done. Nice.' : null); } });
      return el('li', null,
        el('label', null, box, el('span', null, s.title)),
        editable ? el('button', { type: 'button', class: 'ride-x', 'aria-label': 'Remove step: ' + s.title,
          onclick: function () { act('set_goal_step', { p_step_id: s.id, p_done: null }, 'Step removed.'); } }, '×') : null);
    }));
    card.appendChild(el('div', { class: 'ride-steps-wrap' }, el('h4', { class: 'ride-mini' }, 'Steps'),
      steps.length ? list : el('p', { class: 'row-meta' }, 'No steps yet. Break the goal into a few small ones.')));
    if (editable) {
      var stepIn = el('input', { type: 'text', maxlength: '140', placeholder: 'Add a step, e.g. Spot the landing every time', 'aria-label': 'New step for ' + g.title });
      var addStep = el('form', { class: 'ride-add-step' }, stepIn, el('button', { type: 'submit', class: 'button button--quiet' }, 'Add step'));
      addStep.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!stepIn.value.trim()) return stepIn.focus();
        act('save_goal_step', { p_goal_id: g.id, p_title: stepIn.value }, 'Step added.');
      });
      card.appendChild(addStep);
    }

    var actions = [];
    if (g.status === 'active') {
      actions.push(btn('Mark achieved', function () { act('set_athlete_goal_status', { p_goal_id: g.id, p_status: 'achieved' }, 'Goal achieved. That’s a big deal.'); }));
      actions.push(btn('Edit', function () { onEdit(g); }));
      actions.push(btn('Pause', function () { act('set_athlete_goal_status', { p_goal_id: g.id, p_status: 'paused' }, 'Goal paused. Pick it back up any time.'); }));
    } else if (g.status === 'paused') {
      actions.push(btn('Pick it back up', function () { act('set_athlete_goal_status', { p_goal_id: g.id, p_status: 'active' }, 'Back on.'); }));
      actions.push(btn('Edit', function () { onEdit(g); }));
    } else {
      actions.push(btn('Not quite yet: reopen', function () { act('set_athlete_goal_status', { p_goal_id: g.id, p_status: 'active' }, 'Reopened.'); }));
    }
    actions.push(btn('Remove', function () {
      if (window.confirm('Remove “' + g.title + '”? Its steps go with it.')) act('set_athlete_goal_status', { p_goal_id: g.id, p_status: 'archived' }, 'Goal removed.');
    }));
    card.appendChild(el('p', { class: 'goal-actions' }, actions));
    return card;
  }

  // A plan item: what to practise, progress in sessions, and (optionally) buttons.
  function planRow(i, opts) {
    opts = opts || {};
    var open = i.status === 'planned';
    var facts = [];
    if (i.goal_title) facts.push('For: ' + i.goal_title);
    if (i.area_name) facts.push(i.area_name);
    if (open && i.due_on) facts.push((i.past_due ? 'Was due ' : 'By ') + day(i.due_on));
    if (!open) facts.push((i.status === 'done' ? 'Done ' : 'Skipped ') + S.fmtDate(i.done_at, { month: 'short', day: 'numeric' }));
    facts.push(setBy(i));
    var state = i.status === 'done' ? chip('strong', '✓', 'Done')
              : i.status === 'skipped' ? chip('not_enough_data', '–', 'Skipped')
              : i.past_due ? chip('needs_practice', '!', 'Past due')
              : chip('developing', '↗', i.sessions_done ? 'In progress' : 'To do');
    var row = el('li', { class: 'skill plan-item' },
      el('p', { class: 'skill-name' }, i.title, el('small', null, facts.join(' · '))),
      el('div', { class: 'skill-figure' },
        el('span', { class: 'skill-pct goal-count' }, Math.min(i.sessions_done, i.sessions_target) + ' of ' + i.sessions_target),
        el('div', { class: 'meter meter--' + (i.status === 'done' ? 'strong' : 'developing'), role: 'img',
                    'aria-label': i.sessions_done + ' of ' + S.plural(i.sessions_target, 'session') + ' logged' },
          i.sessions_done ? el('span', { style: 'width:' + Math.min(100, Math.round(100 * i.sessions_done / i.sessions_target)) + '%' }) : null)),
      state);
    if (opts.full && i.details) row.appendChild(el('p', { class: 'skill-detail plan-details' }, i.details));
    var actions = [];
    if (open && opts.onLog) actions.push(btn('Log a session', function () { opts.onLog(i); }));
    else if (open && opts.logLink) actions.push(el('a', { href: 'training.html?item=' + encodeURIComponent(i.id) + '#log' }, 'Log a session'));
    if (opts.full) {
      if (open) {
        actions.push(btn('Done', function () { act('set_training_item_status', { p_item_id: i.id, p_status: 'done' }, 'Ticked off. Nice work.'); }));
        if (i.can_edit) actions.push(btn('Edit', function () { opts.onEdit(i); }));
        actions.push(btn('Skip', function () { act('set_training_item_status', { p_item_id: i.id, p_status: 'skipped' }, 'Skipped.'); }));
        if (i.can_edit) actions.push(btn('Remove', function () { act('set_training_item_status', { p_item_id: i.id, p_status: 'archived' }, 'Removed from your plan.'); }));
      } else {
        actions.push(btn('Put back on the plan', function () { act('set_training_item_status', { p_item_id: i.id, p_status: 'planned' }, 'Back on your plan.'); }));
      }
    }
    if (actions.length) row.appendChild(el('p', { class: 'skill-detail goal-actions' }, actions));
    return row;
  }

  // A ride log entry.
  function logRow(l, opts) {
    opts = opts || {};
    var head = [rideType(l.riding_type)];
    if (l.location) head.push(l.location);
    if (l.minutes) head.push(minutes(l.minutes));
    var meta = [];
    if (l.areas && l.areas.length) meta.push(l.areas.join(', '));
    if (l.item_title) meta.push('Plan: ' + l.item_title);
    else if (l.goal_title) meta.push('Goal: ' + l.goal_title);
    var qa = [['Practised', l.practiced], ['Improved', l.improved], ['Challenge', l.challenge], ['Next time', l.next_time]].filter(function (x) { return x[1]; });
    var row = el('li', { class: 'row ride-log' },
      el('div', null,
        el('p', { class: 'row-title' }, head.join(' · ')),
        meta.length ? el('p', { class: 'row-meta' }, meta.join(' · ')) : null),
      el('p', { class: 'row-side' }, day(l.rode_on)),
      qa.length ? el('dl', { class: 'ride-notes ride-notes--log' }, (opts.brief ? qa.slice(0, 2) : qa).map(function (x) { return [el('dt', null, x[0]), el('dd', null, x[1])]; })) : null);
    if (opts.onEdit) {
      row.appendChild(el('p', { class: 'goal-actions ride-log-actions' },
        btn('Edit', function () { opts.onEdit(l); }),
        btn('Delete', function () { if (window.confirm('Delete this log entry from ' + day(l.rode_on) + '?')) act('delete_training_log', { p_log_id: l.id }, 'Entry deleted.'); })));
    }
    return row;
  }

  function stat(label, value, sub, empty) {
    return el('li', { class: 'stat' + (empty ? ' stat--empty' : '') },
      el('p', { class: 'stat-label' }, label), el('p', { class: 'stat-value' }, value), sub ? el('p', { class: 'stat-sub' }, sub) : null);
  }

  function coachesBlock() {
    if (!data.coaches.length) {
      return el('div', { class: 'student-empty' },
        el('p', null, 'You haven’t been matched with a coach yet. When you are, your coach sees your goals, plan and log here, and can add to your plan.'),
        el('p', null, el('a', { href: 'index.html#contact' }, 'Ask about coaching')));
    }
    return el('ul', { class: 'coach-list' }, data.coaches.map(function (c) {
      return el('li', { class: 'coach' },
        el('p', { class: 'coach-name' }, c.name),
        c.specialties.length ? el('p', { class: 'row-meta' }, c.specialties.join(' · ')) : null,
        c.bio ? el('p', { class: 'coach-bio' }, c.bio) : null);
    }));
  }

  // ---------- Coaching Dashboard ----------

  function dashboard(main) {
    var name = data.athlete && data.athlete.display_name ? data.athlete.display_name : 'rider';
    document.getElementById('student-title').textContent = 'Ride on, ' + name + '.';
    var goals = openGoals().filter(function (g) { return g.status === 'active'; }), plan = plannedItems(), w = data.week;
    var lede = document.getElementById('student-lede');
    if (!data.goals.length && !data.plan.length && !data.log_count) {
      lede.textContent = 'Your riding goals, your training plan and your ride log, all in one place. Start with a goal.';
    } else {
      lede.textContent = [S.plural(goals.length, 'goal') + ' on the go', S.plural(plan.length, 'thing') + ' on your plan',
                          w.rides ? S.plural(w.rides, 'ride') + ' logged this week' : 'no rides logged yet this week'].join(', ') + '.';
    }
    S.clear(main);

    if (!data.goals.length && !data.plan.length && !data.log_count) {
      var start = section('start-title', 'Get started');
      start.body.appendChild(el('ul', { class: 'rec-list' }, [
        ['Step 1', 'Set a big goal', 'Where do you want your riding to go? Write it down, then break it into smaller goals and steps.', 'riding-goals.html#add', 'Set a goal'],
        ['Step 2', 'Plan your practice', 'Pick one or two things to work on in your next rides. Your coach can add to the plan too.', 'training.html#plan-add', 'Add to my plan'],
        ['Step 3', 'Log a ride', 'After you ride, take a minute: what did you improve, what was hard, what’s next?', 'training.html#log', 'Log a ride']
      ].map(function (r) {
        return el('li', null, el('div', { class: 'rec' }, el('p', { class: 'rec-kicker' }, r[0]), el('h3', { class: 'rec-title' }, r[1]),
          el('p', { class: 'rec-why' }, r[2]), link(r[3], r[4])));
      })));
      main.appendChild(start);
    }

    var week = section('week-title', 'This week', 'Since ' + day(w.start, true));
    var vs = w.last_week_rides ? (w.rides - w.last_week_rides === 0 ? 'same as last week' : Math.abs(w.rides - w.last_week_rides) + (w.rides > w.last_week_rides ? ' more' : ' fewer') + ' than last week') : null;
    var dueSoon = plan.filter(function (i) { return i.due_on && i.due_on <= addDays(7); }).length;
    week.body.appendChild(el('ul', { class: 'stat-row' },
      stat('Rides logged', String(w.rides), vs || el('a', { href: 'training.html#log' }, 'Log a ride'), !w.rides),
      stat('Time on the bike', w.minutes ? minutes(w.minutes) : '—', w.minutes ? 'from the rides you logged' : 'add minutes when you log', !w.minutes),
      stat('On my plan', String(plan.length), dueSoon ? dueSoon + ' due in the next week' : (plan.length ? 'nothing due this week' : 'nothing planned yet'), !plan.length),
      stat('Goals on the go', String(goals.length), goals.length ? null : el('a', { href: 'riding-goals.html#add' }, 'Set one'), !goals.length)));
    main.appendChild(week);

    var next = section('plan-title', 'Up next', 'From your training plan');
    if (plan.length) {
      next.body.appendChild(el('ul', { class: 'skill-list' }, plan.slice(0, 4).map(function (i) { return planRow(i, { logLink: true }); })));
      next.body.appendChild(el('p', { class: 'student-note' }, el('a', { href: 'training.html' }, plan.length > 4 ? 'See all ' + plan.length + ' on my plan' : 'Open my training')));
    } else {
      next.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'Nothing planned. Add one or two things to practise in your next rides.'),
        el('p', null, link('training.html#plan-add', 'Add to my plan'))));
    }
    main.appendChild(next);

    var gs = section('goals-title', 'My goals');
    if (goals.length) {
      // the nearest goals first: they're what to ride for next
      var near = goals.slice().sort(function (a, b) { return HORIZONS.indexOf(horizon(b.horizon)) - HORIZONS.indexOf(horizon(a.horizon)); });
      gs.body.appendChild(el('ul', { class: 'ride-goal-list' }, near.slice(0, 4).map(function (g) { return goalCard(g, false); })));
      gs.body.appendChild(el('p', { class: 'student-note' }, el('a', { href: 'riding-goals.html' }, 'See all my goals')));
    } else {
      gs.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'No goals yet. A good one says what you want to be able to do, and why it matters to you.'),
        el('p', null, link('riding-goals.html#add', 'Set a goal'))));
    }
    main.appendChild(gs);

    var rides = section('rides-title', 'Recent rides');
    if (data.logs.length) {
      rides.body.appendChild(el('ul', { class: 'rows' }, data.logs.slice(0, 3).map(function (l) { return logRow(l, { brief: true }); })));
      rides.body.appendChild(el('p', { class: 'student-note' }, el('a', { href: 'training.html#log-title' }, 'See my whole log')));
    } else {
      rides.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'Your rides will be listed here once you log them.'), el('p', null, link('training.html#log', 'Log a ride'))));
    }
    main.appendChild(rides);

    var coaches = section('coach-title', data.coaches.length === 1 ? 'My coach' : 'My coaches');
    coaches.body.appendChild(coachesBlock());
    main.appendChild(coaches);
  }

  // ---------- My Goals ----------

  function goalsPage(main) {
    var editing = null;
    var lists = el('div');
    var addSec = section('add-title', 'Set a goal', 'Start big, then break it down. Your coach can help shape it.');
    var doneSec = section('achieved-title', 'Achieved');
    addSec.id = 'add';

    var fH = el('select', null, options(HORIZONS, 'month'));
    var fTitle = el('input', { type: 'text', maxlength: '140', required: true, placeholder: 'e.g. Land a 360 on the small jump line' });
    var fArea = el('select', null, options(data.areas, null, 'Any / not sure'));
    var fDate = el('input', { type: 'date', min: today() });
    var fParent = el('select');
    var fWhy = el('textarea', { rows: '2', maxlength: '600', placeholder: 'What makes this goal exciting or important to you?' });
    var fStart = el('textarea', { rows: '2', maxlength: '600', placeholder: 'What can you do now? e.g. I can do 180s on the trampoline.' });
    var fOutcome = el('textarea', { rows: '2', maxlength: '600', placeholder: 'How will you know you’ve got it?' });
    var fSteps = el('textarea', { rows: '3', maxlength: '1400', placeholder: 'One per line, e.g.\nPractise rotations on the trampoline\nSpot the landing' });
    var hint = el('p', { class: 'format-hint goal-wide' });
    var submit = el('button', { class: 'button', type: 'submit' }, 'Set this goal');
    var cancel = el('button', { class: 'button button--quiet', type: 'button', hidden: true }, 'Cancel');
    var stepsField = field('First steps (optional)', fSteps, 'goal-wide');

    function fillParents(selfId) {
      S.clear(fParent);
      var others = openGoals().filter(function (g) { return g.id !== selfId; });
      options(others.map(function (g) { return { id: g.id, label: horizon(g.horizon).label + ': ' + g.title }; }), null, 'Nothing: it stands on its own').forEach(function (o) { fParent.appendChild(o); });
      fParent.disabled = !others.length;
    }
    function syncHint() { hint.textContent = horizon(fH.value).hint; }
    fH.addEventListener('change', syncHint);

    function reset() {
      editing = null;
      [fTitle, fWhy, fStart, fOutcome, fSteps, fDate].forEach(function (f) { f.value = ''; });
      fArea.value = ''; fillParents(null);
      submit.textContent = 'Set this goal'; cancel.hidden = true; stepsField.hidden = false;
      addSec.querySelector('h2').textContent = 'Set a goal';
      syncHint();
    }
    function edit(g) {
      editing = g;
      fH.value = g.horizon; fTitle.value = g.title; fArea.value = g.area_id || ''; fDate.value = g.target_date || '';
      fWhy.value = g.why || ''; fStart.value = g.starting_point || ''; fOutcome.value = g.target_outcome || '';
      fillParents(g.id); fParent.value = g.parent_id || '';
      submit.textContent = 'Save changes'; cancel.hidden = false; stepsField.hidden = true;
      addSec.querySelector('h2').textContent = 'Edit goal';
      syncHint();
      addSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      fTitle.focus({ preventScroll: true });
    }
    cancel.addEventListener('click', reset);

    var form = el('form', { class: 'goal-form ride-form', novalidate: true },
      field('How far ahead', fH), field('Riding area', fArea), field('Target date (optional)', fDate),
      hint,
      field('My goal', fTitle, 'goal-wide'),
      field('Part of a bigger goal?', fParent, 'goal-wide'),
      field('Why it matters to me', fWhy, 'goal-wide'),
      field('Where I’m starting from', fStart, 'goal-wide'),
      field('What it looks like when I get there', fOutcome, 'goal-wide'),
      stepsField,
      el('div', { class: 'goal-wide ride-form-actions' }, submit, cancel));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!fTitle.value.trim()) { fTitle.focus(); return say('wrong', 'Write your goal first.'); }
      submit.disabled = true;
      var steps = editing ? [] : fSteps.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 20);
      act('save_athlete_goal', {
        p_title: fTitle.value, p_horizon: fH.value, p_area_id: fArea.value || null, p_why: fWhy.value, p_starting_point: fStart.value,
        p_target_outcome: fOutcome.value, p_target_date: fDate.value || null, p_parent_id: fParent.value || null, p_goal_id: editing ? editing.id : null
      }, editing ? 'Goal updated.' : null).then(function (id) {
        if (!id) return;
        if (editing || !steps.length) { if (!editing) say('right', 'Goal set. Now go ride.'); reset(); return; }
        // add the first steps in order, then show everything
        return steps.reduce(function (p, s) { return p.then(function () { return ctx.sb.rpc('save_goal_step', { p_goal_id: id, p_title: s }); }); }, Promise.resolve())
          .then(load).then(function () { say('right', 'Goal set with ' + S.plural(steps.length, 'step') + '. Now go ride.'); reset(); redraw(); });
      }).then(function () { submit.disabled = false; }, function () { submit.disabled = false; });
    });
    addSec.body.appendChild(form);
    reset();

    redraw = function () {
      var open = openGoals(), achieved = data.goals.filter(function (g) { return g.status === 'achieved'; });
      document.getElementById('student-lede').textContent = !data.goals.length ? 'No goals yet. Start with a big one below, then break it into smaller goals and steps.'
        : S.plural(open.filter(function (g) { return g.status === 'active'; }).length, 'goal') + ' on the go' + (achieved.length ? ', ' + achieved.length + ' achieved lately.' : '.');
      S.clear(lists);
      HORIZONS.forEach(function (h) {
        var mine = open.filter(function (g) { return g.horizon === h.id; });
        if (!mine.length) return;
        var sec = section('h-' + h.id, h.many);
        sec.body.appendChild(el('ul', { class: 'ride-goal-list' }, mine.map(function (g) { return goalCard(g, true, edit); })));
        lists.appendChild(sec);
      });
      if (!open.length) {
        var empty = section('none-title', 'On the go');
        empty.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, data.goals.length ? 'Nothing on the go right now. Set the next goal below.' : 'Goals you set, or set with your coach, show up here with the steps toward them.')));
        lists.appendChild(empty);
      }
      doneSec.hidden = !achieved.length;
      S.clear(doneSec.body);
      if (achieved.length) doneSec.body.appendChild(el('ul', { class: 'ride-goal-list' }, achieved.map(function (g) { return goalCard(g, true, edit); })));
      if (!editing) fillParents(null);
    };

    S.clear(main);
    main.appendChild(el('div', { class: 'wrap', style: 'padding-top:24px' }, notice));
    main.appendChild(lists); main.appendChild(addSec); main.appendChild(doneSec);
    redraw();
  }

  // ---------- My Training ----------

  function trainingPage(main) {
    var planSec = section('plan-title', 'My plan', 'What to practise next. Log a session and it counts toward the item.');
    var addSec = section('plan-add-title', 'Add to my plan');
    var logSec = section('log-form-title', 'Log a ride', 'Lightweight on purpose: a few words is plenty.');
    var histSec = section('log-title', 'My training log');
    var doneSec = section('plan-done-title', 'Done lately');
    addSec.id = 'plan-add'; logSec.id = 'log';

    // --- plan form ---
    var editingItem = null;
    var pTitle = el('input', { type: 'text', maxlength: '140', placeholder: 'e.g. Manual drills in the parking lot' });
    var pDetails = el('textarea', { rows: '2', maxlength: '1000', placeholder: 'How to do it, where, anything to remember (optional)' });
    var pN = el('input', { type: 'number', min: '1', max: '14', inputmode: 'numeric', value: '1' });
    var pDue = el('input', { type: 'date', min: today() });
    var pGoal = el('select'), pArea = el('select', null, options(data.areas, null, 'Any'));
    var pSubmit = el('button', { class: 'button', type: 'submit' }, 'Add to my plan');
    var pCancel = el('button', { class: 'button button--quiet', type: 'button', hidden: true }, 'Cancel');
    function goalOptions(sel) {
      S.clear(sel);
      options(openGoals().map(function (g) { return { id: g.id, label: horizon(g.horizon).label + ': ' + g.title }; }), null, 'No particular goal').forEach(function (o) { sel.appendChild(o); });
    }
    function resetPlan() {
      editingItem = null; pTitle.value = ''; pDetails.value = ''; pN.value = '1'; pDue.value = addDays((7 - new Date().getDay()) % 7 || 7);
      goalOptions(pGoal); pArea.value = ''; pSubmit.textContent = 'Add to my plan'; pCancel.hidden = true;
      addSec.querySelector('h2').textContent = 'Add to my plan';
    }
    function editItem(i) {
      editingItem = i; pTitle.value = i.title; pDetails.value = i.details || ''; pN.value = String(i.sessions_target); pDue.value = i.due_on || '';
      goalOptions(pGoal); pGoal.value = i.goal_id || ''; pArea.value = i.area_id || '';
      pSubmit.textContent = 'Save changes'; pCancel.hidden = false; addSec.querySelector('h2').textContent = 'Edit plan item';
      addSec.scrollIntoView({ behavior: 'smooth', block: 'start' }); pTitle.focus({ preventScroll: true });
    }
    pCancel.addEventListener('click', resetPlan);
    var planForm = el('form', { class: 'goal-form ride-form', novalidate: true },
      field('What to practise', pTitle, 'goal-wide'),
      field('How many sessions', pN), field('By when', pDue), field('For which goal', pGoal), field('Riding area', pArea),
      field('Details', pDetails, 'goal-wide'),
      el('div', { class: 'goal-wide ride-form-actions' }, pSubmit, pCancel));
    planForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = Math.round(Number(pN.value));
      if (!pTitle.value.trim()) { pTitle.focus(); return say('wrong', 'Say what to practise first.'); }
      if (!(n >= 1 && n <= 14)) { pN.focus(); return say('wrong', 'Pick 1 to 14 sessions.'); }
      pSubmit.disabled = true;
      act('save_training_item', { p_title: pTitle.value, p_details: pDetails.value, p_goal_id: pGoal.value || null, p_area_id: pArea.value || null,
        p_sessions_target: n, p_due_on: pDue.value || null, p_item_id: editingItem ? editingItem.id : null }, editingItem ? 'Plan updated.' : 'Added to your plan.')
        .then(function (ok) { pSubmit.disabled = false; if (ok) resetPlan(); });
    });
    addSec.body.appendChild(planForm);

    // --- log form ---
    var editingLog = null;
    var lDate = el('input', { type: 'date', max: addDays(1) });
    var lType = el('select', null, options(RIDE_TYPES, 'trail'));
    var lWhere = el('input', { type: 'text', maxlength: '80', placeholder: 'e.g. Valmont Bike Park' });
    var lMin = el('input', { type: 'number', min: '1', max: '720', inputmode: 'numeric', placeholder: 'e.g. 60' });
    var lItem = el('select'), lGoal = el('select');
    var areaBoxes = data.areas.map(function (a) { return el('input', { type: 'checkbox', value: a.id }); });
    var lAreas = el('fieldset', { class: 'ride-areas goal-wide' }, el('legend', null, 'What did you work on?'),
      data.areas.map(function (a, k) { return el('label', null, areaBoxes[k], el('span', null, a.name)); }));
    var lPracticed = el('textarea', { rows: '2', maxlength: '1000', placeholder: 'Drills, features, lines, laps…' });
    var lImproved = el('textarea', { rows: '2', maxlength: '500' });
    var lChallenge = el('textarea', { rows: '2', maxlength: '500' });
    var lNext = el('textarea', { rows: '2', maxlength: '500' });
    var lSubmit = el('button', { class: 'button', type: 'submit' }, 'Save to my log');
    var lCancel = el('button', { class: 'button button--quiet', type: 'button', hidden: true }, 'Cancel');
    function itemOptions(keep) {
      S.clear(lItem);
      var items = plannedItems();
      if (keep && !items.some(function (i) { return i.id === keep.id; })) items = items.concat([keep]);
      options(items.map(function (i) { return { id: i.id, label: i.title + ' (' + Math.min(i.sessions_done, i.sessions_target) + ' of ' + i.sessions_target + ')' }; }), null, 'Not on my plan').forEach(function (o) { lItem.appendChild(o); });
      goalOptions(lGoal);
    }
    lItem.addEventListener('change', function () {
      var i = data.plan.filter(function (x) { return x.id === lItem.value; })[0];
      if (i && i.goal_id) lGoal.value = i.goal_id;
      if (i && i.area_id) areaBoxes.forEach(function (b) { if (b.value === i.area_id) b.checked = true; });
    });
    function resetLog() {
      editingLog = null; lDate.value = today(); lType.value = 'trail'; lWhere.value = ''; lMin.value = '';
      [lPracticed, lImproved, lChallenge, lNext].forEach(function (f) { f.value = ''; });
      areaBoxes.forEach(function (b) { b.checked = false; });
      itemOptions(null); lSubmit.textContent = 'Save to my log'; lCancel.hidden = true; logSec.querySelector('h2').textContent = 'Log a ride';
    }
    function startLog(i) {
      resetLog();
      if (i) { lItem.value = i.id; lItem.dispatchEvent(new Event('change')); }
      logSec.scrollIntoView({ behavior: 'smooth', block: 'start' }); lPracticed.focus({ preventScroll: true });
    }
    function editLog(l) {
      resetLog(); editingLog = l;
      lDate.value = l.rode_on; lType.value = l.riding_type; lWhere.value = l.location || ''; lMin.value = l.minutes || '';
      var item = l.item_id ? data.plan.filter(function (x) { return x.id === l.item_id; })[0] || { id: l.item_id, title: l.item_title || 'Plan item', sessions_done: 0, sessions_target: 1 } : null;
      itemOptions(item); lItem.value = l.item_id || ''; lGoal.value = l.goal_id || '';
      areaBoxes.forEach(function (b) { b.checked = (l.area_ids || []).indexOf(b.value) >= 0; });
      lPracticed.value = l.practiced || ''; lImproved.value = l.improved || ''; lChallenge.value = l.challenge || ''; lNext.value = l.next_time || '';
      lSubmit.textContent = 'Save changes'; lCancel.hidden = false; logSec.querySelector('h2').textContent = 'Edit log entry';
      logSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    lCancel.addEventListener('click', resetLog);
    var logForm = el('form', { class: 'goal-form ride-form', novalidate: true },
      field('Day', lDate), field('Kind of riding', lType), field('Where (optional)', lWhere), field('Minutes (optional)', lMin),
      field('Was it on my plan?', lItem), field('For which goal', lGoal),
      lAreas,
      field('What did you practise?', lPracticed, 'goal-wide'),
      field('What was one thing you improved today?', lImproved, 'goal-wide'),
      field('What challenged you?', lChallenge, 'goal-wide'),
      field('What would you like to try next time?', lNext, 'goal-wide'),
      el('div', { class: 'goal-wide ride-form-actions' }, lSubmit, lCancel));
    logForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = lMin.value ? Math.round(Number(lMin.value)) : null;
      if (!lDate.value) { lDate.focus(); return say('wrong', 'Pick the day you rode.'); }
      if (m !== null && !(m >= 1 && m <= 720)) { lMin.focus(); return say('wrong', 'Minutes should be between 1 and 720.'); }
      if (![lPracticed, lImproved, lChallenge, lNext].some(function (f) { return f.value.trim(); })) { lPracticed.focus(); return say('wrong', 'Write at least a few words about what you practised.'); }
      lSubmit.disabled = true;
      var wasItem = lItem.value;
      act('save_training_log', {
        p_rode_on: lDate.value, p_riding_type: lType.value, p_location: lWhere.value, p_minutes: m,
        p_area_ids: areaBoxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }),
        p_item_id: lItem.value || null, p_goal_id: lGoal.value || null,
        p_practiced: lPracticed.value, p_improved: lImproved.value, p_challenge: lChallenge.value, p_next_time: lNext.value,
        p_log_id: editingLog ? editingLog.id : null
      }, null).then(function (ok) {
        lSubmit.disabled = false;
        if (!ok) return;
        var item = wasItem && data.plan.filter(function (x) { return x.id === wasItem; })[0];
        say('right', editingLog ? 'Log entry updated.' : item && item.status === 'done' ? 'Saved, and “' + item.title + '” is done. Nice work.' : 'Saved to your log. Good ride.');
        resetLog();
      });
    });
    logSec.body.appendChild(logForm);

    // --- the log list, 25 at a time ---
    var older = [], hasMore = false;
    var more = el('button', { type: 'button', class: 'button button--quiet' }, 'Show older entries');
    more.addEventListener('click', function () {
      more.disabled = true;
      ctx.sb.rpc('coaching_logs', { p_offset: data.logs.length + older.length }).then(function (res) {
        more.disabled = false;
        if (res.error) return say('wrong', 'Couldn’t load older entries. Try again.');
        older = older.concat(res.data.logs); hasMore = res.data.has_more; drawLog();
      });
    });
    function drawLog() {
      S.clear(histSec.body);
      var all = data.logs.concat(older);
      if (!all.length) {
        histSec.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'No rides logged yet. Your entries show up here, newest first.')));
        return;
      }
      histSec.body.appendChild(el('p', { class: 'meta student-count' }, S.plural(data.log_count, 'entry', 'entries') + ' in your log'));
      histSec.body.appendChild(el('ul', { class: 'rows' }, all.map(function (l) { return logRow(l, { onEdit: editLog }); })));
      if (hasMore || (!older.length && data.log_count > data.logs.length)) histSec.body.appendChild(el('p', { class: 'student-note' }, more));
    }

    redraw = function () {
      var plan = plannedItems(), past = data.plan.filter(function (i) { return i.status !== 'planned'; });
      document.getElementById('student-lede').textContent = (plan.length ? S.plural(plan.length, 'thing') + ' on your plan' : 'Nothing on your plan yet') +
        ', ' + S.plural(data.log_count, 'ride') + ' in your log.';
      S.clear(planSec.body);
      if (plan.length) planSec.body.appendChild(el('ul', { class: 'skill-list' }, plan.map(function (i) { return planRow(i, { full: true, onLog: startLog, onEdit: editItem }); })));
      else planSec.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'Nothing planned. Add something to practise below, or ask your coach what to work on.')));
      doneSec.hidden = !past.length;
      S.clear(doneSec.body);
      if (past.length) doneSec.body.appendChild(el('ul', { class: 'skill-list' }, past.map(function (i) { return planRow(i, { full: true }); })));
      older = []; hasMore = false;
      drawLog();
      if (!editingItem) goalOptions(pGoal);
      if (!editingLog) { var keepI = lItem.value, keepG = lGoal.value; itemOptions(null); lItem.value = keepI; lGoal.value = keepG; }
    };

    S.clear(main);
    main.appendChild(el('div', { class: 'wrap', style: 'padding-top:24px' }, notice));
    [planSec, addSec, logSec, histSec, doneSec].forEach(function (s) { main.appendChild(s); });
    resetPlan(); resetLog();
    redraw();
    // ?item=<id>#log (from the dashboard's "Log a session")
    var want = new URLSearchParams(location.search).get('item');
    var item = want && data.plan.filter(function (i) { return i.id === want && i.status === 'planned'; })[0];
    if (item) startLog(item);
    else if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  // ---------- start ----------

  var TAB = { coaching: 'coaching', 'riding-goals': 'riding-goals', training: 'training' }[PAGE];
  S.ready(TAB, 'riding').then(function (c) {
    ctx = c;
    return load().then(function () {
      var main = document.getElementById('student-main');
      if (PAGE === 'coaching') { redraw = function () { dashboard(main); }; dashboard(main); }
      else if (PAGE === 'riding-goals') {
        goalsPage(main);
        if (location.hash === '#add') { var a = document.getElementById('add'); if (a) a.scrollIntoView(); }
      }
      else trainingPage(main);
      main.hidden = false;
    });
  }).catch(S.fail);
})();
