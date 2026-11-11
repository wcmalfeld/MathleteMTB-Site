// Review My Mistakes (review.html): the student's saved missed questions.
// Each one shows the question exactly as it was asked, every try so far,
// and (where the question can be answered on a page) lets the student try
// it again. A right answer here marks it "corrected"; that decision, and
// which question a try counts toward, is made by the database
// (record_review_attempt in supabase/progress.sql), not by this page.
//
// Questions are whatever the games saved: plain numbers, multiple choice,
// or (Summit Expedition) math written in TeX with typed algebra answers.
// The TeX ones need two libraries, loaded only when such a question is
// opened. Jump Lab missions can't be answered on a page, so those link
// back to the game.
(function () {
  'use strict';
  var S = window.MathleteStudent, el = S.el;
  var MP = window.MathleteProgress;

  var MATHJS = { src: 'https://cdn.jsdelivr.net/npm/mathjs@11.11.0/lib/browser/math.js', sri: 'sha384-1uyKgHafVYiQNXuVPdilMeCRBPCVKZdbBzusfeymvrLZUom2Gl1Az8SMm5KSbvjB' };
  var MATHJAX = { src: 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js', sri: 'sha384-KKWa9jJ1MZvssLeOoXG6FiOAZfAgmzsIIfw8BXwI9+kYm0lPCbC6yTQPBC00F1/L' };

  var REVIEW_STATUS = {
    needs_review: { label: 'Needs review', icon: '!', tone: 'needs_practice' },
    in_progress:  { label: 'In progress',  icon: '…', tone: 'developing' },
    corrected:    { label: 'Corrected',    icon: '✓', tone: 'strong' },
    mastered:     { label: 'Mastered',     icon: '★', tone: 'strong' }
  };
  function reviewChip(status) {
    var s = REVIEW_STATUS[status] || REVIEW_STATUS.needs_review;
    return el('span', { class: 'status status--' + s.tone }, el('span', { class: 'status-icon', 'aria-hidden': 'true' }, s.icon), s.label);
  }

  // ---------- math support (Summit Expedition questions) ----------

  var mathReady = null;
  function loadScript(lib) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = lib.src; s.integrity = lib.sri; s.crossOrigin = 'anonymous';
      s.onload = resolve; s.onerror = function () { reject(new Error('library-failed')); };
      document.head.appendChild(s);
    });
  }
  function loadMath() {
    if (mathReady) return mathReady;
    window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] }, svg: { fontCache: 'global' }, startup: { typeset: false } };
    mathReady = Promise.all([loadScript(MATHJS), loadScript(MATHJAX).then(function () { return window.MathJax.startup.promise; })]);
    return mathReady;
  }
  function typeset(node) {
    return loadMath().then(function () { return window.MathJax.typesetPromise([node]); }).catch(function () {});
  }

  // The same answer checking Summit Expedition uses, so a retry here is
  // judged the way the game judged the original.
  function cleanAns(s) {
    s = String(s || '').trim()
      .replace(/[−–—]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi')
      .replace(/√\s*\(/g, 'sqrt(').replace(/√\s*([0-9a-z.]+)/gi, 'sqrt($1)')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/\|([^|]+)\|/g, '($1)')
      .replace(/(^|[^a-z])(sin|cos|tan|sec|csc|cot|ln|log)\s*x\b/gi, '$1$2(x)')
      .replace(/x(?=(sin|cos|tan|sec|csc|cot|sqrt|log|ln|e\^|pi)\b)/gi, 'x*')
      .replace(/ln\s*\(/gi, 'log(');
    if (s.indexOf('=') !== -1) s = s.slice(s.lastIndexOf('=') + 1);
    return s.replace(/\+\s*[cC]\s*$/, '').trim();
  }
  function evalNum(s) {
    var v = window.math.evaluate(cleanAns(s));
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('not a number');
    return v;
  }
  function numEq(given, target, raw) {
    var tol = /\d\.\d/.test(raw) ? 0.006 * Math.max(1, Math.abs(target)) : 1e-7 * Math.max(1, Math.abs(target));
    return Math.abs(given - target) <= tol;
  }
  function splitList(s) {
    return String(s).replace(/^\s*[\(\[\{]|[\)\]\}]\s*$/g, '').split(/\s*(?:,|;|\bor\b|\band\b)\s*/i).filter(function (t) { return t.trim() !== ''; });
  }
  var XS = [0.37, 0.91, 1.43, 1.87, 2.21];
  function exprVals(s) {
    var c = window.math.compile(cleanAns(s));
    return XS.map(function (x) { var v = c.evaluate({ x: x, e: Math.E, pi: Math.PI }); if (typeof v !== 'number') throw new Error('nan'); return v; });
  }
  function checkMath(type, answer, raw) {
    if (raw === null || raw === undefined || String(raw).trim() === '') return { ok: false, invalid: true, msg: 'Type an answer first.' };
    try {
      if (type === 'num') return { ok: numEq(evalNum(raw), evalNum(answer), String(raw)) };
      if (type === 'set' || type === 'tuple') {
        var g = splitList(raw), t = splitList(answer);
        if (g.length !== t.length) return { ok: false, invalid: g.length < t.length && g.length > 0, msg: 'Enter ' + t.length + ' values separated by a comma.' };
        var gv = g.map(evalNum), tv = t.map(evalNum);
        if (type === 'tuple') return { ok: gv.every(function (v, i) { return numEq(v, tv[i], g[i]); }) };
        var used = {};
        return { ok: tv.every(function (want) {
          for (var j = 0; j < gv.length; j++) if (!used[j] && numEq(gv[j], want, g[j])) { used[j] = true; return true; }
          return false;
        }) };
      }
      var a = exprVals(raw), b = exprVals(answer);
      if (type === 'anti') {   // any constant of integration is fine
        var d0 = a[0] - b[0];
        return { ok: a.every(function (v, i) { return Math.abs((v - b[i]) - d0) <= 1e-6 * Math.max(1, Math.abs(b[0])); }) };
      }
      return { ok: a.every(function (v, i) { return Math.abs(v - b[i]) <= 1e-6 * Math.max(1, Math.abs(b[i])); }) };
    } catch (e) {
      return { ok: false, invalid: true, msg: 'I couldn’t read that. Check the format, for example 3/4, sqrt(2)/2, 2x^3.' };
    }
  }
  var MATH_FORMAT = {
    num: 'A number. Fractions like 3/4 and roots like sqrt(2) are fine.',
    set: 'All the values, separated by commas.',
    tuple: 'The values in order, separated by a comma, for example 2, -1.',
    expr: 'An expression in x, for example 3x^2 - 2x + 1.',
    anti: 'An expression in x. You can leave off + C.'
  };

  // ---------- what kind of retry a saved question allows ----------

  function retryKind(item) {
    var s = item.snap;
    if (Array.isArray(s.choices) && s.choices.length && typeof s.answer === 'string') return 'choice';
    if (s.format === 'tex' && MATH_FORMAT[s.type]) return 'math';
    if (typeof s.answer === 'number' && (typeof s.tolerance === 'number' || s.tolerance === undefined) && item.kind !== 'prediction') return 'number';
    return 'game';
  }
  function checkNumber(s, raw) {
    var clean = String(raw).replace(/[−–]/g, '-').replace(/[^0-9.\-]/g, '');
    var v = parseFloat(clean);
    if (clean === '' || clean === '-' || isNaN(v)) return { ok: false, invalid: true, msg: 'Type a number first.' };
    var tol = typeof s.tolerance === 'number' ? s.tolerance : Math.max(0.011, Math.abs(s.answer) * 0.012);
    return { ok: Math.abs(v - s.answer) <= tol + 1e-9 };
  }

  // ---------- drawing a saved question ----------

  var CONTEXT = [['title', 'Mission'], ['mission', 'Mission'], ['challenge', 'Challenge'], ['course', 'Course'], ['skill', 'Skill'], ['segment', 'Segment'],
                 ['raceCourse', 'Race course'], ['field', 'Field'], ['goal', 'Goal'], ['setup', 'Setup'], ['previousSetup', 'Launch before it'],
                 ['target', 'Target'], ['note', 'Note']];

  function graph(g) {
    var NS = 'http://www.w3.org/2000/svg', W = 420, H = 190, L = 34, B = 26, T = 10, R = 10;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'problem-graph'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Graph of height against horizontal distance, in feet');
    var x = function (v) { return L + (W - L - R) * v / g.xMax; }, y = function (v) { return H - B - (H - B - T) * v / g.yMax; };
    function line(x1, y1, x2, y2, op) { var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); l.setAttribute('stroke', 'currentColor'); l.setAttribute('stroke-opacity', op); svg.appendChild(l); }
    function text(tx, ty, str, anchor) { var t = document.createElementNS(NS, 'text'); t.setAttribute('x', tx); t.setAttribute('y', ty); t.setAttribute('font-size', '11'); t.setAttribute('fill', 'currentColor'); t.setAttribute('fill-opacity', '0.7'); t.setAttribute('text-anchor', anchor || 'middle'); t.textContent = str; svg.appendChild(t); }
    for (var i = 0; i <= g.xMax; i += 5) { line(x(i), y(0), x(i), y(g.yMax), i ? 0.1 : 0.4); text(x(i), H - 9, String(i)); }
    for (var j = 0; j <= g.yMax; j += 2) { line(x(0), y(j), x(g.xMax), y(j), j ? 0.1 : 0.4); text(L - 6, y(j) + 4, String(j), 'end'); }
    var p = document.createElementNS(NS, 'polyline');
    p.setAttribute('points', g.feet.map(function (pt) { return x(pt[0]).toFixed(1) + ',' + y(pt[1]).toFixed(1); }).join(' '));
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#E36A40'); p.setAttribute('stroke-width', '2');
    svg.appendChild(p);
    return svg;
  }

  function problem(item) {
    var s = item.snap, box = el('div');
    box.appendChild(el('p', { class: 'problem' }, s.prompt || item.title));
    if (s.format === 'tex' && s.math) box.appendChild(el('div', { class: 'problem-math' }, '\\[' + s.math + '\\]'));
    if (s.graph && Array.isArray(s.graph.feet)) box.appendChild(graph(s.graph));
    var ctx = el('ul', { class: 'problem-context' });
    CONTEXT.forEach(function (c) {
      var v = s[c[0]];
      if (typeof v === 'string' && v && v !== s.prompt) ctx.appendChild(el('li', null, el('b', null, c[1] + ': '), v));
    });
    if (typeof s.level === 'number') ctx.appendChild(el('li', null, el('b', null, 'Level: '), '★'.repeat(Math.max(1, Math.min(3, s.level)))));
    if (Array.isArray(s.runs)) ctx.appendChild(el('li', null, el('b', null, 'Saved runs: '), s.runs.join(' and ')));
    if (Array.isArray(s.objectives)) s.objectives.forEach(function (o) { ctx.appendChild(el('li', null, '• ' + o)); });
    if (ctx.childNodes.length) box.appendChild(ctx);
    return box;
  }

  // The correct answer, as a node (typeset later if it is TeX).
  function answerNode(item) {
    var s = item.snap;
    if (s.format === 'tex' && s.answerTex) return el('span', null, '\\(' + s.answerTex + '\\)');
    return el('span', { class: 'answer' }, item.first.correct_answer || String(s.answer));
  }

  function explanation(item) {
    var s = item.snap, out = [];
    if (s.formula) out.push(el('p', null, el('b', null, 'Formula: '), s.formula));
    if (s.explanation) out.push(el('p', null, s.explanation));
    if (Array.isArray(s.steps) && s.steps.length) out.push(el('ol', null, s.steps.map(function (t) { return el('li', null, t); })));
    return out;
  }

  // ---------- one card ----------

  function card(item, ctx, onChange) {
    var open = false, loaded = false, sitting = { tries: 0, hint: false, done: false };
    var chipHost = el('span', null, reviewChip(item.status));
    var body = el('div', { class: 'review-body', hidden: true });
    var li = el('li', { class: 'review-card', 'data-open': 'false' });
    var facts = el('p', { class: 'review-facts' });

    function drawFacts() {
      S.clear(facts);
      [S.gameName(item.game_id), item.skills.join(', '),
       'missed ' + (item.incorrect_count === 1 ? 'once' : item.incorrect_count + ' times'),
       S.ago(item.last_activity_at), item.tutor_flag ? 'flagged by your tutor' : null]
        .filter(Boolean).forEach(function (t) { facts.appendChild(el('span', null, t)); });
    }
    drawFacts();
    function setStatus(status) {
      if (item.status === status) return;
      item.status = status;
      S.clear(chipHost).appendChild(reviewChip(status));
      onChange();
    }

    var preview = item.snap.format === 'tex' || !item.snap.prompt ? null : el('p', { class: 'review-preview' }, item.snap.prompt);
    var summary = el('button', { class: 'review-summary', type: 'button', 'aria-expanded': 'false' },
      el('h3', { class: 'review-title' }, item.title), chipHost, preview, facts);

    function triesList(rows) {
      return el('ul', { class: 'tries' }, rows.map(function (a) {
        return el('li', null,
          el('span', { class: 'mark ' + (a.is_correct ? 'mark--right' : 'mark--wrong') }, a.is_correct ? '✓' : '✗'),
          el('span', { class: 'answer' }, a.student_answer || '(none)'),
          el('span', { class: 'row-meta' }, S.fmtDateTime(a.occurred_at) + (a.context === 'review' ? ' · review' : '') + (a.hints_used ? ' · with a hint' : '')));
      }));
    }

    function drawBody(attempts) {
      S.clear(body);
      var kind = retryKind(item), s = item.snap;
      body.appendChild(el('h3', null, 'The question'));
      body.appendChild(problem(item));
      var triesHost = el('div', null, triesList(attempts));
      body.appendChild(el('h3', null, 'Your tries'));
      body.appendChild(triesHost);

      var feedback = el('div', { class: 'feedback', role: 'status', hidden: true });
      function say(tone, nodes) {
        feedback.className = 'feedback' + (tone ? ' feedback--' + tone : '');
        S.clear(feedback); nodes.forEach(function (n) { if (n) feedback.appendChild(n); });
        feedback.hidden = false;
        if (s.format === 'tex') typeset(feedback);
      }

      body.appendChild(el('h3', null, 'Try it again'));
      if (kind === 'game') {
        body.appendChild(el('p', { class: 'row-body' },
          'This one is practiced in the game. Land it in a new session of ' + S.gameName(item.game_id) + ' and it’s marked corrected.'));
      } else {
        var form = el('form', { novalidate: true, autocomplete: 'off' }), input, check = el('button', { class: 'button', type: 'submit' }, 'Check');
        if (kind === 'choice') {
          var name = 'choice-' + item.id;
          form.appendChild(el('fieldset', { class: 'choices' }, el('legend', { class: 'sr-only', style: 'position:absolute;left:-9999px' }, 'Your answer'),
            s.choices.map(function (c) { return el('label', null, el('input', { type: 'radio', name: name, value: c }), el('span', null, c)); })));
          form.appendChild(el('div', { class: 'retry' }, check));
        } else {
          input = el('input', { class: 'input', id: 'answer-' + item.id, 'aria-label': 'Your answer', placeholder: 'Your answer',
                                inputmode: kind === 'number' ? 'decimal' : null, autocapitalize: 'off', spellcheck: 'false' });
          form.appendChild(el('div', { class: 'retry' }, input, s.unit && kind === 'number' ? el('span', { class: 'retry-unit' }, s.unit) : null, check));
          if (kind === 'math') form.appendChild(el('p', { class: 'format-hint' }, MATH_FORMAT[s.type]));
        }
        body.appendChild(form);

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (sitting.done) return;
          var raw, result;
          if (kind === 'choice') {
            var picked = form.querySelector('input:checked');
            raw = picked ? picked.value : '';
            result = raw ? { ok: raw === s.answer } : { ok: false, invalid: true, msg: 'Pick an answer first.' };
          } else {
            raw = input.value;
            result = kind === 'number' ? checkNumber(s, raw) : checkMath(s.type, s.answer, raw);
          }
          if (result.invalid) return say('', [el('p', null, result.msg)]);
          sitting.tries++;
          var usedHint = sitting.hint;
          attempts.push({ is_correct: result.ok, student_answer: raw, occurred_at: new Date().toISOString(), context: 'review', hints_used: usedHint ? 1 : 0 });
          S.clear(triesHost).appendChild(triesList(attempts));
          item.last_activity_at = new Date().toISOString();
          if (!result.ok) { item.incorrect_count++; }
          drawFacts();

          var saving = MP ? MP.recordReviewAttempt({ reviewItemId: item.id, studentAnswer: raw, isCorrect: result.ok, hintsUsed: usedHint ? 1 : 0 })
                          : Promise.resolve({ saved: false });
          function lock() { sitting.done = true; check.disabled = true; form.querySelectorAll('input').forEach(function (i) { i.disabled = true; }); }

          if (result.ok) {
            lock();
            say('right', [el('p', null, el('b', null, 'Correct. '), 'That’s this mistake fixed.')].concat(explanation(item)));
            saving.then(function (r) {
              if (r.saved) setStatus('corrected');
              else feedback.appendChild(el('p', null, r.queued ? 'It will be saved as soon as you’re back online.' : 'It couldn’t be saved just now. Reload the page and try again.'));
            });
          } else if (sitting.tries === 1 && s.hint) {
            sitting.hint = true;
            say('wrong', [el('p', null, el('b', null, 'Not quite. '), s.hint), el('p', null, 'Have another go.')]);
            if (item.status === 'corrected' || item.status === 'mastered') saving.then(function (r) { if (r.saved) setStatus('needs_review'); });
          } else if (sitting.tries === 1) {
            say('wrong', [el('p', null, el('b', null, 'Not quite. '), 'Have another go.')]);
            if (item.status === 'corrected' || item.status === 'mastered') saving.then(function (r) { if (r.saved) setStatus('needs_review'); });
          } else {
            lock();
            say('wrong', [el('p', null, el('b', null, 'The answer is '), answerNode(item), '.')].concat(explanation(item),
              [el('p', null, 'Read how it was found, then come back to this one another day to clear it.')]));
          }
          if (kind !== 'choice' && !sitting.done) { input.select(); }
        });
      }
      body.appendChild(feedback);
      body.appendChild(el('p', { class: 'review-actions' },
        el('a', { class: 'read-link', href: S.gameUrl(item.game_id) }, 'Practice more like this in ' + S.gameName(item.game_id), el('span', { 'aria-hidden': 'true' }, ' →'))));
      if (s.format === 'tex') typeset(body);
    }

    summary.addEventListener('click', function () {
      open = !open;
      body.hidden = !open;
      li.setAttribute('data-open', String(open));
      summary.setAttribute('aria-expanded', String(open));
      if (!open || loaded) return;
      loaded = true;
      S.clear(body).appendChild(el('p', { class: 'row-meta', style: 'padding-top:18px' }, 'Loading…'));
      if (item.status === 'needs_review') {
        ctx.sb.rpc('start_review', { p_review_item_id: item.id }).then(function (res) { if (!res.error && res.data) setStatus(res.data); });
      }
      ctx.sb.from('question_attempts')
        .select('is_correct,student_answer,occurred_at,context,hints_used,attempt_number')
        .eq('student_id', ctx.user.id).eq('question_id', item.question_id).eq('question_hash', item.question_hash)
        .order('attempt_number', { ascending: true }).limit(50)
        .then(function (res) { drawBody(res.error || !res.data ? [] : res.data); });
    });

    li.appendChild(summary); li.appendChild(body);
    return li;
  }

  // ---------- the page ----------

  // Most urgent first: missed more than once, in a skill that needs
  // practice, never tried again, missed recently.
  function priority(item, weak) {
    var p = 0;
    if (item.incorrect_count > 1) p += 3 + Math.min(item.incorrect_count, 5);
    if (item.skillIds.some(function (id) { return weak[id]; })) p += 3;
    if (item.attempt_count <= item.incorrect_count && item.status === 'needs_review') p += 2;
    if (Date.now() - new Date(item.last_activity_at).getTime() < 7 * 86400000) p += 1;
    if (item.tutor_flag) p += 4;
    return p;
  }

  function render(ctx, d, items) {
    var main = document.getElementById('student-main');
    S.clear(main);
    var weak = {};
    d.skills.forEach(function (s) { if (s.status === 'needs_practice') weak[s.id] = true; });
    items.forEach(function (it) { it.priority = priority(it, weak); });

    var waiting = function () { return items.filter(function (i) { return i.status === 'needs_review' || i.status === 'in_progress'; }).length; };
    var lede = document.getElementById('student-lede');
    function headline() {
      var n = waiting();
      lede.textContent = !items.length ? 'Nothing here yet. When you miss a question in a game, it’s saved here so you can fix it later.'
        : n ? S.plural(n, 'question') + ' to fix. Open one, try it again, and see how it’s solved.'
        : 'All clear: every mistake you’ve made is fixed.';
      S.drawTabs('review', n);
    }
    headline();

    var sec = el('section', { class: 'student-section' }), wrap = el('div', { class: 'wrap' });
    sec.appendChild(wrap); main.appendChild(sec); main.hidden = false;
    if (!items.length) {
      wrap.appendChild(el('div', { class: 'student-empty' },
        el('p', null, 'No mistakes saved. Play a game while you’re logged in; anything you miss shows up here.'),
        el('p', null, el('a', { class: 'button', href: 'index.html#tools' }, 'Pick a game'))));
      return;
    }

    function options(values, label) { return values.map(function (v) { return el('option', { value: v[0] }, v[1]); }); }
    var uniq = function (arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); };
    var games = uniq(items.map(function (i) { return i.game_id; }));
    var skills = {}; items.forEach(function (i) { i.skillIds.forEach(function (id, k) { skills[id] = i.skills[k]; }); });
    var levels = uniq(items.map(function (i) { return i.difficulty; }).filter(Boolean));

    var fStatus = el('select', { id: 'f-status' }, options([['waiting', 'To fix'], ['corrected', 'Corrected'], ['all', 'All']]));
    var fGame = el('select', { id: 'f-game' }, options([['', 'All games']].concat(games.map(function (g) { return [g, S.gameName(g)]; }))));
    var fSkill = el('select', { id: 'f-skill' }, options([['', 'All skills']].concat(Object.keys(skills).sort().map(function (k) { return [k, skills[k]]; }))));
    var fWhen = el('select', { id: 'f-when' }, options([['', 'Any time'], ['7', 'Last 7 days'], ['30', 'Last 30 days']]));
    var fLevel = el('select', { id: 'f-level' }, options([['', 'Any level']].concat(levels.map(function (l) { return [l, l.charAt(0).toUpperCase() + l.slice(1)]; }))));
    var fSort = el('select', { id: 'f-sort' }, options([['priority', 'Most important first'], ['recent', 'Most recent first']]));
    if (!waiting()) fStatus.value = 'all';
    var filters = el('div', { class: 'student-filters' },
      el('label', { for: 'f-status' }, 'Show', fStatus), el('label', { for: 'f-game' }, 'Game', fGame), el('label', { for: 'f-skill' }, 'Skill', fSkill),
      el('label', { for: 'f-when' }, 'Missed', fWhen), levels.length ? el('label', { for: 'f-level' }, 'Level', fLevel) : null, el('label', { for: 'f-sort' }, 'Order', fSort));
    var count = el('p', { class: 'meta student-count', role: 'status' });
    var list = el('ul', { class: 'review-list' });
    var none = el('div', { class: 'student-empty', hidden: true }, el('p', null, 'Nothing matches those filters.'));
    wrap.appendChild(filters); wrap.appendChild(count); wrap.appendChild(list); wrap.appendChild(none);

    var cards = {};
    function draw() {
      var days = fWhen.value ? Number(fWhen.value) : 0;
      var shown = items.filter(function (i) {
        var isWaiting = i.status === 'needs_review' || i.status === 'in_progress';
        if (fStatus.value === 'waiting' && !isWaiting) return false;
        if (fStatus.value === 'corrected' && isWaiting) return false;
        if (fGame.value && i.game_id !== fGame.value) return false;
        if (fSkill.value && i.skillIds.indexOf(fSkill.value) === -1) return false;
        if (fLevel.value && i.difficulty !== fLevel.value) return false;
        if (days && Date.now() - new Date(i.first_incorrect_at).getTime() > days * 86400000) return false;
        return true;
      });
      shown.sort(function (a, b) {
        if (fSort.value === 'priority' && b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.last_activity_at) - new Date(a.last_activity_at);
      });
      S.clear(list);
      shown.forEach(function (i) {
        // Keep each card's node, so an open question stays open (and half-typed answers stay) when the list is redrawn.
        if (!cards[i.id]) cards[i.id] = card(i, ctx, headline);
        list.appendChild(cards[i.id]);
      });
      count.textContent = 'Showing ' + shown.length + ' of ' + S.plural(items.length, 'saved question');
      none.hidden = shown.length > 0;
    }
    [fStatus, fGame, fSkill, fWhen, fLevel, fSort].forEach(function (f) { f.addEventListener('change', draw); });
    draw();
  }

  S.ready('review').then(function (ctx) {
    var sb = ctx.sb;
    return Promise.all([
      S.loadDashboard(sb),
      sb.from('review_items')
        .select('id,game_id,question_id,question_hash,status,incorrect_count,attempt_count,tutor_flag,first_incorrect_at,last_activity_at,' +
                'first:question_attempts!review_items_first_attempt_id_fkey(snapshot,student_answer,correct_answer)')
        .eq('student_id', ctx.user.id).order('last_activity_at', { ascending: false }).limit(300),
      sb.from('questions').select('id,title,question_type,difficulty'),
      sb.from('question_skills').select('question_id,skill_id'),
      sb.from('skills').select('id,name')
    ]).then(function (r) {
      for (var i = 1; i < r.length; i++) if (r[i].error) throw r[i].error;
      var questions = {}, skillName = {}, tags = {};
      r[2].data.forEach(function (q) { questions[q.id] = q; });
      r[4].data.forEach(function (s) { skillName[s.id] = s.name; });
      r[3].data.forEach(function (t) { (tags[t.question_id] = tags[t.question_id] || []).push(t.skill_id); });
      var items = r[1].data.filter(function (it) { return it.first && it.first.snapshot; }).map(function (it) {
        var q = questions[it.question_id] || {}, ids = tags[it.question_id] || [];
        it.snap = it.first.snapshot;
        it.title = q.title || it.snap.title || 'Question';
        it.kind = q.question_type || 'other';
        it.difficulty = q.difficulty || null;
        it.skillIds = ids;
        it.skills = ids.map(function (id) { return skillName[id] || id; });
        return it;
      });
      render(ctx, r[0], items);
    });
  }).catch(S.fail);
})();
