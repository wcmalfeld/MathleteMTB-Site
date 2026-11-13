// Student dashboard (dashboard.html): this week's numbers, next steps,
// skills and recent activity, all from one request: the database
// function student_dashboard() (supabase/progress.sql), which only ever
// returns the signed-in student's own records.
(function () {
  'use strict';
  var S = window.MathleteStudent, el = S.el;

  function section(id, title, note) {
    var body = el('div');
    var sec = el('section', { class: 'student-section', 'aria-labelledby': id },
      el('div', { class: 'wrap' },
        el('div', { class: 'student-section-head' },
          el('h2', { class: 'label', id: id }, title),
          note ? el('p', { class: 'meta' }, note) : null),
        body));
    sec.body = body;
    return sec;
  }

  function stat(label, value, sub, empty) {
    return el('li', { class: 'stat' + (empty ? ' stat--empty' : '') },
      el('p', { class: 'stat-label' }, label),
      el('p', { class: 'stat-value' }, value),
      sub ? el('p', { class: 'stat-sub' }, sub) : null);
  }

  // "3 more than last week" style comparison, in words.
  function versus(now, before, noun) {
    if (!before && !now) return null;
    if (!before) return 'none last week';
    var d = now - before;
    return d === 0 ? 'same as last week' : Math.abs(d) + (d > 0 ? ' more' : ' fewer') + ' than last week';
  }

  function weekSection(d) {
    var w = d.week, sec = section('week-title', 'This week', 'Since ' + S.fmtDate(w.start, { weekday: 'long', month: 'short', day: 'numeric' }));
    var mins = w.active_minutes;
    sec.body.appendChild(el('ul', { class: 'stat-row' },
      stat('Questions attempted', String(w.questions), versus(w.questions, w.previous.questions), !w.questions),
      stat('Right on the first try', w.questions ? S.pct(w.first_correct, w.questions) : '—',
           w.questions ? w.first_correct + ' of ' + w.questions + (w.questions < d.settings.min_sample ? ' (a small sample)' : '') : 'no questions yet', !w.questions),
      stat('Practice sessions', String(w.sessions), w.completed ? S.plural(w.completed, 'challenge') + ' finished' : null, !w.sessions),
      stat('Waiting for review', String(d.review.waiting),
           d.review.waiting ? el('a', { href: 'review.html' }, 'Review them') : (d.review.corrected ? S.plural(d.review.corrected, 'mistake') + ' corrected so far' : 'nothing to fix'), !d.review.waiting),
      // Counted only between one answer and the next, so an open tab adds nothing.
      stat('Time practicing', mins ? (mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + ' min') : '—',
           mins ? 'spent answering questions' : 'shows once you answer a few in a row', !mins)));
    return sec;
  }

  // One recommendation card: what to do, why, which skill, how long, and a link straight to it.
  function recCard(r) {
    var title, why, href, link, time = null, kicker;
    var game = r.game_id ? S.gameName(r.game_id) : null;
    if (r.type === 'review') {
      kicker = 'Review';
      title = 'Review ' + S.plural(r.count, 'saved problem');
      why = (r.count === 1 ? 'One question you missed is' : r.count + ' questions you missed are') + ' waiting.' +
            (r.skill_name ? ' Most are ' + r.skill_name + '.' : '') + ' Fixing a mistake is the fastest way to improve.';
      href = 'review.html'; link = 'Open my mistakes'; time = 'About ' + r.minutes + ' min';
    } else if (r.type === 'practice_skill') {
      kicker = 'Practice · ' + r.skill_name;
      title = 'Practice ' + r.skill_name;
      why = 'You got ' + r.correct + ' of ' + r.n + ' right on the first try lately.' + (game ? ' ' + game + ' has the most ' + r.skill_name + ' questions.' : '');
      href = S.gameUrl(r.game_id); link = game ? 'Play ' + game : 'Pick a game'; time = S.gameMinutes(r.game_id);
    } else if (r.type === 'refresh_skill') {
      kicker = 'Refresher · ' + r.skill_name;
      title = r.skill_name + ' refresher';
      why = 'You haven’t practiced ' + r.skill_name + ' for ' + r.days + ' days. A quick round keeps it fresh.';
      href = S.gameUrl(r.game_id); link = game ? 'Play ' + game : 'Pick a game'; time = S.gameMinutes(r.game_id);
    } else if (r.type === 'level_up') {
      kicker = 'Step up · ' + r.skill_name;
      title = 'Try a harder ' + r.skill_name + ' challenge';
      why = r.correct + ' of ' + r.n + ' right on the first try: ' + r.skill_name + ' is going well. Pick a tougher course or level' + (game ? ' in ' + game : '') + '.';
      href = S.gameUrl(r.game_id); link = game ? 'Play ' + game : 'Pick a game'; time = S.gameMinutes(r.game_id);
    } else {
      kicker = 'Get rolling';
      title = game ? 'Play a round of ' + game : 'Pick a game';
      why = 'Nothing logged yet this week. Every answer you give while logged in is saved here.';
      href = game ? S.gameUrl(r.game_id) : 'index.html#tools'; link = game ? 'Play ' + game : 'See the games'; time = game ? S.gameMinutes(r.game_id) : null;
    }
    return el('li', null, el('div', { class: 'rec' },
      el('p', { class: 'rec-kicker' }, kicker + (time ? ' · ' + time : '')),
      el('h3', { class: 'rec-title' }, title),
      el('p', { class: 'rec-why' }, why),
      el('a', { class: 'read-link', href: href }, link, el('span', { 'aria-hidden': 'true' }, ' →'))));
  }

  function sessionRow(s) {
    var bits = [];
    if (s.questions) bits.push(S.plural(s.questions, 'question') + ', ' + s.first_correct + ' right first try');
    if (s.metrics && typeof s.metrics.score === 'number') bits.push('score ' + s.metrics.score);
    if (s.metrics && s.metrics.course) bits.push(s.metrics.course);
    return el('li', { class: 'row' },
      el('div', null,
        el('p', { class: 'row-title' }, S.gameName(s.game_id)),
        el('p', { class: 'row-meta' }, bits.join(' · ') || 'Started')),
      el('p', { class: 'row-side' }, S.fmtDate(s.started_at), s.completed ? ' · finished' : null));
  }

  function goalsSection(goals) {
    var active = goals.filter(function (g) { return g.status === 'active'; });
    var justDone = goals.filter(function (g) { return g.status === 'completed' && Date.now() - new Date(g.completed_at).getTime() < 7 * 86400000; });
    if (!active.length && !justDone.length) return null;
    var sec = section('goals-title', 'Goals', active.length ? S.plural(active.length, 'goal') + ' on the go' : 'All done');
    sec.body.appendChild(el('ul', { class: 'skill-list' }, active.concat(justDone).slice(0, 4).map(function (g) { return S.goalRow(g); })));
    sec.body.appendChild(el('p', { class: 'student-note' }, el('a', { href: 'goals.html' }, 'See all goals')));
    return sec;
  }

  function render(d, goals) {
    var main = document.getElementById('student-main');
    var name = d.student && d.student.display_name ? d.student.display_name : 'Mathlete';
    document.getElementById('student-title').textContent = 'Welcome back, ' + name + '.';
    var w = d.week, lede;
    if (!d.recent.length) lede = 'This is where your practice shows up. Play any game while you’re logged in and your answers are saved here.';
    else if (!w.questions) lede = 'Nothing logged yet this week. Pick a game and get rolling.';
    else lede = S.plural(w.questions, 'question') + ' so far this week across ' + S.plural(w.sessions, 'session') + '.' +
                (d.review.waiting ? ' ' + S.plural(d.review.waiting, 'mistake') + ' waiting to be fixed.' : ' No mistakes waiting. Nice.');
    document.getElementById('student-lede').textContent = lede;
    S.drawTabs('dashboard', d.review.waiting);
    S.clear(main);

    main.appendChild(weekSection(d));
    var gs = goalsSection(goals || []);
    if (gs) main.appendChild(gs);

    var next = section('next-title', 'Next steps');
    next.body.appendChild(el('ul', { class: 'rec-list' }, d.recommendations.map(recCard)));
    main.appendChild(next);

    var skills = section('skills-title', 'Skills', 'Right on the first try, last ' + d.settings.window_days + ' days');
    if (d.skills.length) {
      skills.body.appendChild(el('ul', { class: 'skill-list' }, d.skills.map(function (s) { return S.skillRow(s, d.settings, false); })));
      skills.body.appendChild(el('p', { class: 'student-note' },
        'These show how recent practice went, not grades. A skill needs at least ' + d.settings.min_sample + ' first tries before it gets a percentage. ',
        el('a', { href: 'my-progress.html' }, 'See the details')));
    } else {
      skills.body.appendChild(el('div', { class: 'student-empty' },
        el('p', null, 'No skills to show yet. They appear here as you answer questions in the games.'),
        el('p', null, el('a', { class: 'button', href: 'index.html#tools' }, 'Pick a game'))));
    }
    main.appendChild(skills);

    var recent = section('recent-title', 'Recent activity');
    if (d.recent.length) {
      recent.body.appendChild(el('ul', { class: 'rows' }, d.recent.map(sessionRow)));
      recent.body.appendChild(el('p', { class: 'student-note' }, el('a', { href: 'my-progress.html#history' }, 'See every answer')));
    } else {
      recent.body.appendChild(el('div', { class: 'student-empty' }, el('p', null, 'Your practice sessions will be listed here.')));
    }
    main.appendChild(recent);
    main.hidden = false;
  }

  S.ready('dashboard').then(function (ctx) {
    // Goals are a bonus on this page: if they can't be loaded, show the rest.
    var goals = ctx.sb.rpc('student_goals').then(function (r) { return r.error ? [] : r.data; }, function () { return []; });
    return Promise.all([S.loadDashboard(ctx.sb), goals]).then(function (r) { render(r[0], r[1]); });
  }).catch(S.fail);
})();
