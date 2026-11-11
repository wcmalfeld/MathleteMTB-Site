// My Progress (my-progress.html): every skill in detail, then the
// student's own answer history, a page at a time. The history is read
// straight from question_attempts; the database only returns the
// signed-in student's rows, and the query also asks for exactly those.
(function () {
  'use strict';
  var S = window.MathleteStudent, el = S.el;
  var PAGE = 25;

  function section(id, title, note) {
    var body = el('div');
    var sec = el('section', { class: 'student-section', id: id.replace('-title', ''), 'aria-labelledby': id },
      el('div', { class: 'wrap' },
        el('div', { class: 'student-section-head' },
          el('h2', { class: 'label', id: id }, title),
          note ? el('p', { class: 'meta' }, note) : null),
        body));
    sec.body = body;
    return sec;
  }

  // What the student saw, in a line: the prompt if it is plain text,
  // otherwise the kind of question (math written in TeX reads badly raw).
  function promptLine(a) {
    var s = a.snapshot || {}, title = a.questions && a.questions.title;
    if (s.format === 'tex' || !s.prompt) return title || s.title || 'Question';
    return s.prompt;
  }

  function attemptRow(a) {
    var facts = [S.gameName(a.game_id), S.fmtDateTime(a.occurred_at)];
    if (a.attempt_number > 1) facts.push('try ' + a.attempt_number);
    if (a.hints_used) facts.push(S.plural(a.hints_used, 'hint'));
    if (a.context === 'review') facts.push('from review');
    return el('li', { class: 'row' },
      el('div', null,
        el('p', { class: 'row-title' }, (a.questions && a.questions.title) || 'Question'),
        el('p', { class: 'row-meta' }, facts.join(' · '))),
      el('p', { class: 'row-side' },
        el('span', { class: 'mark ' + (a.is_correct ? 'mark--right' : 'mark--wrong') }, a.is_correct ? '✓ Right' : '✗ Not yet')),
      el('p', { class: 'row-body' }, promptLine(a)),
      el('p', { class: 'row-body' }, 'Your answer: ', el('span', { class: 'answer' }, a.student_answer || '(none)'),
        a.is_correct ? null : [' · Answer: ', el('span', { class: 'answer' }, a.correct_answer || '—')]));
  }

  function historySection(ctx, games) {
    var sec = section('history-title', 'Practice history', 'Every answer, newest first');
    var list = el('ul', { class: 'rows' }), count = el('p', { class: 'meta student-count', role: 'status' });
    var more = el('button', { class: 'button button--quiet', type: 'button' }, 'Show more');
    var select = el('select', { id: 'history-game' }, el('option', { value: '' }, 'All games'),
      games.map(function (g) { return el('option', { value: g }, S.gameName(g)); }));
    var shown = 0, total = null, busy = false;

    function load(reset) {
      if (busy) return;
      busy = true; more.disabled = true;
      if (reset) { shown = 0; S.clear(list); }
      var q = ctx.sb.from('question_attempts')
        .select('id,game_id,question_id,context,snapshot,student_answer,correct_answer,is_correct,attempt_number,hints_used,occurred_at,questions(title)', { count: 'exact' })
        .eq('student_id', ctx.user.id)
        .order('occurred_at', { ascending: false }).order('attempt_number', { ascending: false })
        .range(shown, shown + PAGE - 1);
      if (select.value) q = q.eq('game_id', select.value);
      q.then(function (res) {
        busy = false; more.disabled = false;
        if (res.error) { count.textContent = 'Couldn’t load your history. Check your connection and try again.'; return; }
        total = res.count;
        res.data.forEach(function (a) { list.appendChild(attemptRow(a)); });
        shown += res.data.length;
        count.textContent = total ? 'Showing ' + shown + ' of ' + S.plural(total, 'answer') : '';
        more.hidden = shown >= total;
        empty.hidden = total !== 0;
      });
    }
    var empty = el('div', { class: 'student-empty', hidden: true },
      el('p', null, 'No answers saved yet. Play a game while you’re logged in and they’ll show up here.'),
      el('p', null, el('a', { class: 'button', href: 'index.html#tools' }, 'Pick a game')));
    select.addEventListener('change', function () { load(true); });
    more.addEventListener('click', function () { load(false); });
    sec.body.appendChild(el('div', { class: 'student-filters' }, el('label', { for: 'history-game' }, 'Game', select)));
    sec.body.appendChild(count); sec.body.appendChild(list); sec.body.appendChild(empty);
    sec.body.appendChild(el('p', { class: 'review-actions' }, more));
    load(true);
    return sec;
  }

  function render(ctx, d) {
    var main = document.getElementById('student-main');
    S.drawTabs('progress', d.review.waiting);
    S.clear(main);

    var win = d.settings.window_days;
    var skills = section('skills-title', 'Skills', 'Last ' + win + ' days, compared with the ' + win + ' before');
    if (d.skills.length) {
      skills.body.appendChild(el('ul', { class: 'skill-list' }, d.skills.map(function (s) { return S.skillRow(s, d.settings, true); })));
      skills.body.appendChild(el('p', { class: 'student-note' },
        'The percentage is how often you were right on your first try at a question. Trying the same question again doesn’t change it. ' +
        'These show how recent practice went; they are not grades or test scores. A skill needs at least ' + d.settings.min_sample +
        ' first tries in the last ' + win + ' days before it gets a percentage: ' +
        Math.round(d.settings.strong_at * 100) + '% or more is Strong, ' + Math.round(d.settings.developing_at * 100) + '% or more is Developing.'));
    } else {
      skills.body.appendChild(el('div', { class: 'student-empty' },
        el('p', null, 'No skills to show yet. They appear as you answer questions in the games.')));
    }
    main.appendChild(skills);

    // Games this student has actually played, for the filter.
    var games = [];
    d.recent.forEach(function (s) { if (games.indexOf(s.game_id) === -1) games.push(s.game_id); });
    (window.MATHLETE_TOOLS || []).forEach(function (t) { if (t.status === 'live' && games.indexOf(t.id) === -1) games.push(t.id); });
    main.appendChild(historySection(ctx, games));
    main.hidden = false;
    if (location.hash === '#history') { var h = document.getElementById('history'); if (h) h.scrollIntoView(); }
  }

  S.ready('progress').then(function (ctx) {
    return S.loadDashboard(ctx.sb).then(function (d) { render(ctx, d); });
  }).catch(S.fail);
})();
