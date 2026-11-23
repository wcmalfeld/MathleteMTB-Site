// Race-Day Workshop (Mathlete MTB, Algebra 2, Unit 1: Equations and
// Inequalities). The module's public entry point.
//
//   import { mount } from './workshop.js';
//   mount(element, { studentId, storage: 'local' | 'memory' | { load, save },
//                    routing: 'hash' | 'memory',
//                    backLink: { href, label },      // "Exit": where the student came from
//                    courseLink: { href, label },    // "Back to Algebra 2"
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: raceday:attempt, raceday:progress, raceday:complete.
//
// It reuses the lesson kit (learning-lab/lesson-kit/) for questions, hints,
// answer checking and progress, and adds its own shell: an opening screen,
// a mission board, three missions, the Race-Day Certification and a report.
// Works with no options and no account, and without any AI service.

import { el, clear, put, button } from '../lesson-kit/dom.js';
import { ask } from '../lesson-kit/ask.js';
import { createProgress } from '../lesson-kit/progress.js';
import { MISSIONS, QUESTIONS, PRACTICE_IDS, practiceQuestions, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, nf } from './logic/questions.js';
import { PRD, sagWindow, raceStage, survey, minutes, RACE_PRACTICE, FINAL_SETS } from './logic/models.js';
import { sagCalculator, toleranceGauge, raceClock, surveyLab, algebraDebugger } from './components/labs.js';

export const VERSION = '1.0.0';
export const ID = 'race-day-workshop';
const ROUTES = ['start', 'board', 'suspension', 'timing', 'survey', 'final', 'extension', 'report'];
const KINDS = questionKinds();
// Photos live next to the module, so it finds them wherever it's mounted.
const PHOTO = name => new URL('./images/' + name, import.meta.url).href;
const photo = (name, alt, w, h, cls, caption) => el('figure', { class: 'rd-photo ' + (cls || '') },
  el('img', { src: PHOTO(name), alt, width: w, height: h, loading: cls === 'rd-photo--hero' ? 'eager' : 'lazy', decoding: 'async' }),
  caption ? el('figcaption', { class: 'ls-small' }, caption) : null);
const REFS = [
  ['FOX: FLOAT shock owner’s manual, setting sag', 'https://tech.ridefox.com/bike/owners-manuals/3172/sagsetup'],
  ['REI: Mountain bike suspension basics', 'https://www.rei.com/learn/expert-advice/suspension.html'],
  ['Common Core: Reasoning with equations and inequalities (HSA-REI)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Creating equations (HSA-CED)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['OpenStax: Other types of equations', 'https://openstax.org/books/college-algebra-corequisite-support/pages/2-6-other-types-of-equations'],
  ['OpenStax: Linear and absolute value inequalities', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-7-linear-inequalities-and-absolute-value-inequalities']
];

export function mount(target, opts = {}) {
  if (!target) throw new Error(ID + ': mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent('raceday:' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const call = (fn, a) => { try { if (typeof fn === 'function') fn(a); } catch (e) { if (typeof console !== 'undefined') console.warn('[' + ID + ']', e); } };
  // The kit's progress, with the missions as its sections (their fixed
  // questions). Keyed questions (the race practice and the final rounds)
  // are tracked here, in missionState() and finalState().
  const progress = createProgress({
    lesson: { id: ID, sections: MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QUESTIONS },
    studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => {
      // Keep every misconception a question produced (the kit stores only the
      // latest). This runs just before the kit saves the attempt.
      const stored = P && P.state.questions[r.key || r.questionId];
      if (stored && r.code && !['correct', 'wrong', 'sign', 'missed'].includes(r.code)) stored.codes = [...new Set([...(stored.codes || []), r.code])];
      const rec = { ...r, ideas: KINDS[r.questionId] || [] }; fire('attempt', rec); call(opts.onAttempt, rec);
    },
    onProgress: () => { const s = summary(); fire('progress', s); call(opts.onProgress, s); }
  });
  var P = progress;

  // ---------- state ----------
  const variant = () => P.getData('variant', 0);
  const finalRound = () => P.getData('finalRound', 1);
  function missionState(m) {
    const items = m.graded.map(id => [id, null]).concat((m.practice || []).map(id => [id, 'v' + variant()]));
    const done = items.filter(([id, k]) => P.done(id, k)).length;
    return { done, total: items.length, complete: done === items.length, started: done > 0 || !!P.state.visited[m.id] };
  }
  function finalState(roundNo) {
    const r = roundNo || finalRound(), key = 'r' + r;
    const recs = FINAL_IDS.map(id => P.question(id, key));
    const done = FINAL_IDS.filter(id => P.done(id, key)).length;
    const right = FINAL_IDS.filter(id => P.earned(id, key)).length;
    const firstTry = recs.filter(x => x && x.correct && !x.revealed && x.attempts === 1 && !x.hints).length;
    return { round: r, key, done, total: FINAL_IDS.length, right, firstTry, complete: done === FINAL_IDS.length, passed: done === FINAL_IDS.length && right >= PASS_MARK };
  }
  const unlocked = () => MISSIONS.every(m => missionState(m).complete);

  function summary() {
    const missions = MISSIONS.map(m => ({ id: m.id, title: m.short, ...missionState(m) }));
    const recs = Object.entries(P.state.questions);
    const ideas = {};
    for (const [k, r] of recs) {
      const id = k.split('|')[0];
      for (const idea of KINDS[id] || []) {
        const x = ideas[idea] = ideas[idea] || { answered: 0, firstTry: 0, right: 0, hints: 0, revealed: 0, attempts: 0 };
        if (r.attempts > 0 || r.revealed) x.answered += 1;
        if (r.firstTry) x.firstTry += 1;
        if (r.correct && !r.revealed) x.right += 1;
        x.hints += r.hints; x.attempts += r.attempts; if (r.revealed) x.revealed += 1;
      }
    }
    // "Worth more practice": a solution was needed, or fewer than half were right first try.
    const practice = Object.keys(IDEAS).filter(i => ideas[i] && ideas[i].answered && (ideas[i].revealed > 0 || ideas[i].firstTry / ideas[i].answered < 0.5));
    const codes = {};
    for (const [, r] of recs) if (r.codes) for (const c of r.codes) codes[c] = (codes[c] || 0) + 1;
    const cert = P.getData('certified', null);
    const answered = recs.filter(([, r]) => r.attempts > 0).map(([, r]) => r);
    return {
      missions, missionsDone: missions.filter(m => m.complete).length, missionsTotal: missions.length,
      unlocked: unlocked(), final: finalState(), certified: !!cert, certification: cert, complete: !!cert,
      questionsAnswered: answered.length, attempts: answered.reduce((n, r) => n + r.attempts, 0),
      correct: recs.filter(([, r]) => r.correct && !r.revealed).length, firstTryRight: answered.filter(r => r.firstTry).length,
      hintsUsed: recs.reduce((n, [, r]) => n + r.hints, 0), solutionsShown: recs.filter(([, r]) => r.revealed).length,
      activeMinutes: Math.round(P.state.activeMs / 60000), startedAt: P.state.startedAt,
      ideas, practice, misconceptions: Object.entries(codes).sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ code, label: MISCONCEPTIONS[code] || code, count }))
    };
  }

  // Certification: once, the first time a round is passed.
  function checkCertified() {
    if (P.getData('certified', null)) return;
    const f = finalState();
    if (!f.passed) return;
    P.setData('certified', { at: new Date().toISOString(), round: f.round, right: f.right, firstTry: f.firstTry, total: f.total });
    const s = summary(); fire('complete', s); call(opts.onComplete, s);
  }

  // ---------- shell ----------
  const meter = el('div', { class: 'rd-meter' });
  const main = el('main', { class: 'ls-main rd-main', tabindex: '-1', id: 'rd-main' });
  const link = (o, cls, arrow) => (o && o.href ? el('a', { class: cls, href: o.href }, arrow ? el('span', { 'aria-hidden': 'true' }, '← ') : null, o.label) : null);
  const root = el('div', { class: 'lsn rdw' },
    el('a', { class: 'ls-skip', href: '#rd-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the workshop'),
    el('header', { class: 'ls-top' }, el('div', { class: 'ls-wrap ls-top-row' },
      el('div', { class: 'ls-top-left' }, el('p', { class: 'ls-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), link(opts.courseLink, 'ls-back', true)),
      el('a', { class: 'ls-titlebar rd-titlebar', href: '#board' }, 'Race-Day Workshop'),
      el('div', { class: 'ls-top-right' }, meter, link(opts.backLink ? { ...opts.backLink, label: 'Exit' } : null, 'ls-back rd-exit')))),
    el('div', { class: 'ls-wrap' }, main));
  clear(target).appendChild(root);

  let route = 'start', first = true, cleanups = [], refreshers = [];
  const ctx = { progress: P, cleanup: fn => cleanups.push(fn) };
  const refresh = () => { checkCertified(); drawMeter(); refreshers.forEach(fn => { try { fn(); } catch (e) { /* keep going */ } }); };

  function drawMeter() {
    const s = summary();
    put(meter, el('ol', { class: 'rd-pips', 'aria-hidden': 'true' },
      s.missions.map(m => el('li', { class: m.complete ? 'is-done' : m.done ? 'is-part' : '' })),
      el('li', { class: 'rd-pip-flag ' + (s.certified ? 'is-done' : s.unlocked ? 'is-part' : '') }, '⚑')),
      el('span', { class: 'ls-status' }, s.certified ? 'Race-day ready' : `${s.missionsDone}/3 missions`));
    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', `Progress: ${s.missionsDone} of 3 missions complete; final challenge ${s.certified ? 'passed' : s.unlocked ? 'unlocked' : 'locked'}.`);
  }

  // ---------- building blocks ----------
  const P_ = text => el('p', { class: 'ls-p' }, text);
  const card = (kicker, title, ...kids) => el('section', { class: 'ls-card rd-module' }, kicker ? el('p', { class: 'ls-kicker' }, kicker) : null, title ? el('h2', { class: 'ls-h2 rd-h2' }, title) : null, ...kids);
  const eq = (main_, where) => el('div', { class: 'ls-eq' }, el('p', { class: 'ls-eq-main' }, main_), where ? el('dl', { class: 'ls-where' }, where.map(([s, m]) => el('div', null, el('dt', null, s), el('dd', null, m)))) : null);
  const explain = (title, steps, meaning) => el('details', { class: 'rd-explain' }, el('summary', null, title),
    el('ol', { class: 'ls-steps' }, steps.map(s => el('li', null, el('span', { class: 'ls-mono' }, s)))), meaning ? el('p', { class: 'ls-meaning' }, meaning) : null);
  const note = (kind, title, text) => el('aside', { class: 'ls-note ls-note--' + kind }, el('p', { class: 'ls-note-h' }, (kind === 'myth' ? 'Watch out: ' : 'Key idea: ') + title), el('p', null, text));
  const sim = (title, node) => el('figure', { class: 'rd-sim' }, el('figcaption', { class: 'rd-sim-h' }, el('span', { class: 'rd-sim-dot', 'aria-hidden': 'true' }), title), node);
  function q(id, opt = {}) {
    const def = opt.def || QUESTIONS[id];
    return el('div', { class: 'ls-card ls-ask-card rd-ask' }, el('p', { class: 'ls-kicker' }, opt.kicker || 'Your turn'),
      ask({ ...def, id }, { progress: P, key: opt.key || null, onDone: refresh }));
  }
  function missionHead(m, hook) {
    return el('header', { class: 'ls-section-head rd-mission-head' },
      el('p', { class: 'ls-kicker' }, `Mission ${m.n} · ${m.short} · about ${m.minutes} min`),
      el('h1', { class: 'ls-h1' }, m.title), el('p', { class: 'rd-focus' }, m.focus), el('p', { class: 'ls-hook rd-brief' }, hook));
  }
  function missionFoot(m) {
    const st = el('p', { class: 'ls-section-status', 'aria-live': 'polite' });
    const draw = () => { const s = missionState(m); st.textContent = s.complete ? `✓ Mission ${m.n} complete.` : `${s.done} of ${s.total} answered in this mission.`; st.classList.toggle('is-done', s.complete); };
    refreshers.push(draw); draw();
    const next = MISSIONS[MISSIONS.indexOf(m) + 1];
    return el('footer', { class: 'ls-section-foot' }, st, el('nav', { class: 'ls-pager', 'aria-label': 'Missions' },
      el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board'),
      next ? el('a', { href: '#' + next.id }, el('span', null, 'Next'), `Mission ${next.n}: ${next.short}`) : el('a', { href: '#final' }, el('span', null, 'Then'), 'Race-Day Certification')));
  }

  // ---------- pages ----------
  function startPage() {
    const s = summary(), begun = s.questionsAnswered > 0 || Object.keys(P.state.visited).length > 0;
    return el('article', { class: 'rd-open' },
      el('div', { class: 'rd-open-grid' },
        el('div', null,
          el('p', { class: 'ls-kicker' }, 'Algebra 2 · Unit 1: Equations and Inequalities'),
          el('h1', { class: 'ls-h1 ls-h1--big rd-open-h' }, 'Your race.', el('br'), 'Your setup.', el('br'), el('span', null, 'Your math.')),
          el('p', { class: 'ls-lede' }, 'You’ve joined the technical crew for an upcoming enduro race. The rider is ready, the bike is almost dialed, and the stage is waiting.'),
          el('p', { class: 'ls-p' }, 'But before the team heads out, there are a few problems to solve. Your job: use mathematics to get the team race-ready.'),
          el('a', { class: 'ls-btn ls-btn--primary rd-enter', href: '#board' }, begun ? 'Back to the workshop →' : 'Enter the workshop →'),
          el('p', { class: 'ls-small' }, '20–25 minutes · three missions and a final certification · progress saves on this device', s.certified ? ' · ✓ race-day ready' : '')),
        el('div', { class: 'rd-open-art' }, photo('enduro-rider.jpg', 'An enduro rider in a full-face helmet riding a rocky line through a pine forest', 1280, 852, 'rd-photo--hero'))));
  }

  function boardPage() {
    const s = summary();
    const pct = Math.round(100 * (s.missionsDone + (s.certified ? 1 : 0)) / 4);
    const missionCard = m => {
      const st = s.missions.find(x => x.id === m.id);
      return el('li', { class: 'rd-mcard' + (st.complete ? ' is-done' : '') },
        el('p', { class: 'rd-mcard-n' }, 'Mission ' + m.n), el('h2', { class: 'rd-mcard-h' }, m.short), el('p', { class: 'rd-mcard-t' }, m.blurb),
        el('p', { class: 'ls-small' }, m.focus + ' · ' + m.minutes + ' min'),
        el('p', { class: 'rd-mcard-status' }, st.complete ? '✓ Complete' : st.done ? `${st.done} of ${st.total} answered` : 'Not started'),
        el('a', { class: 'ls-btn ' + (st.complete ? 'ls-btn--quiet' : 'ls-btn--primary'), href: '#' + m.id }, st.complete ? 'Revisit' : st.done ? 'Continue' : 'Start', el('span', { class: 'ls-sr' }, ' mission ' + m.n)));
    };
    return el('article', { class: 'rd-board' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Mission board'), el('h1', { class: 'ls-h1' }, 'Race-day prep'),
        el('p', { class: 'ls-hook' }, 'Three stations. Finish all three to unlock the Race-Day Certification.')),
      el('div', { class: 'rd-overall' }, el('div', { class: 'rd-overall-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': 'Workshop progress' }, el('span', { style: { width: pct + '%' } })),
        el('p', { class: 'ls-small' }, `${s.missionsDone} of 3 missions · ${s.certified ? 'certified' : s.unlocked ? 'final unlocked' : 'final locked'} · ${s.questionsAnswered} questions answered, ${s.firstTryRight} right first try`)),
      el('ol', { class: 'rd-missions' }, MISSIONS.map(missionCard),
        el('li', { class: 'rd-mcard rd-mcard--final' + (s.unlocked ? '' : ' is-locked') + (s.certified ? ' is-done' : '') },
          el('p', { class: 'rd-mcard-n' }, 'Final'), el('h2', { class: 'rd-mcard-h' }, 'Race-Day Certification'),
          el('p', { class: 'rd-mcard-t' }, 'One last briefing: suspension, timing and survey, solved on your own.'),
          el('p', { class: 'rd-mcard-status' }, s.certified ? '✓ Race-day ready' : s.unlocked ? `Unlocked · ${s.final.done} of ${s.final.total}` : '🔒 Finish all three missions'),
          el('a', { class: 'ls-btn ' + (s.unlocked && !s.certified ? 'ls-btn--primary' : 'ls-btn--quiet'), href: '#final' }, s.certified ? 'Review' : s.unlocked ? 'Take the challenge' : 'See what’s left'))),
      el('section', { class: 'ls-card rd-extra' },
        el('div', null, el('p', { class: 'ls-kicker' }, 'Optional extension'), el('h2', { class: 'ls-h3' }, 'The setup that doesn’t exist'),
          el('p', { class: 'ls-small' }, 'For students ready for complex numbers: what happens when an equation has no real solution?')),
        el('a', { class: 'ls-btn ls-btn--quiet', href: '#extension' }, 'Open the extension')),
      el('section', { class: 'ls-card rd-extra' },
        el('div', null, el('p', { class: 'ls-kicker' }, 'Your report'), el('p', { class: 'ls-small' }, 'Attempts, hints and the ideas worth more practice, so far.')),
        el('a', { class: 'ls-btn ls-btn--quiet', href: '#report' }, 'See your report')),
      el('details', { class: 'rd-refs' }, el('summary', null, 'References'),
        el('p', { class: 'ls-small' }, 'The sag window comes from FOX’s setup guide for its FLOAT shock. Every bike, shock and rider is different: this workshop teaches algebra and is not a setup recommendation.'),
        el('ul', null, REFS.map(([t, u]) => el('li', null, el('a', { href: u, target: '_blank', rel: 'noopener' }, t, el('span', { class: 'ls-sr' }, ' (opens in a new tab)')))))));
  }

  function suspensionPage() {
    const m = MISSIONS[0], W = sagWindow(PRD.stroke);
    return el('article', { class: 'rd-mission' },
      missionHead(m, 'You’ve got a new bike ready for race day, but the suspension setup needs checking. The mechanic needs to measure the sag and decide whether the setup falls inside the specified range. Can you calculate the measurements and verify the setup?'),
      card('Briefing', 'What is sag?',
        el('div', { class: 'rd-brief-grid' },
          el('div', null, P_('Sag is how far your suspension compresses when you sit on the bike in your normal riding position. It’s written as a percentage of the suspension’s total travel.'),
            P_('A mechanic measures it on the shock itself: how far the shaft slides into the body with the rider on board, compared with the shock’s full stroke.')),
          photo('measuring-sag.jpg', 'A mechanic holding a ruler along a rear shock on a mountain bike frame to measure sag', 1200, 901, '', 'Measuring sag: a ruler along the rear shock.')),
        el('div', { class: 'ls-two' },
          note('key', 'shock stroke ≠ wheel travel', 'The shock stroke is how far the shock itself can compress: 60 mm on this practice bike. Rear-wheel travel is how far the wheel moves, set by the frame’s linkage, and is usually much more. Sag here is measured on the shock.'),
          note('key', 'the practice window', `FOX’s setup guide gives a 25–30% sag range for its FLOAT shock. We use that window with a fictional ${PRD.stroke} mm shock. Real settings vary by bike: this is maths practice, not setup advice.`))),
      card('Module A', 'Solve the sag equation',
        eq('p = s ÷ T × 100', [['p', 'sag percentage (%)'], ['s', 'measured sag (mm)'], ['T', 'total shock stroke (mm), T > 0']]),
        q('m1-rearrange'),
        sim('Sag calculator', sagCalculator(ctx)),
        P_('If the shock has 60 mm of stroke, how many millimetres of compression is 25% sag? Set up 25 = s ÷ 60 × 100 and solve.'),
        q('m1-sag-min'),
        explain('Worked explanation: the 25% boundary', ['25 = s ÷ 60 × 100', '0.25 = s ÷ 60   (divide both sides by 100)', '0.25 × 60 = s   (multiply both sides by 60)', 's = 15 mm'], 'The bottom of the window is 15 mm of sag.'),
        q('m1-sag-max'),
        P_(`So the acceptable range for this scenario is ${nf(W.minMm)}–${nf(W.maxMm)} mm. Move the slider in the calculator to see where 17 mm lands.`),
        q('m1-sag-pct'), q('m1-sag-check'),
        el('h3', { class: 'ls-h3 rd-h3' }, 'Independent challenge'),
        P_('Change the total shock stroke to 80 mm. The window stays at 25–30% for this practice. Work the range out first, then switch the calculator to 80 mm to check.'),
        q('m1-range-80', { kicker: 'Independent challenge' })),
      card('Module B', 'How close are you to the perfect setup?',
        P_('Sometimes we aren’t looking for one exact measurement. We want a result within an acceptable distance of a target. Absolute value measures distance: |a − b| is how far apart a and b are on the number line, in either direction.'),
        P_('The midpoint of the 25–30% window is (25 + 30) ÷ 2 = 27.5%, and the window reaches 2.5 percentage points either side of it. So the window is:'),
        eq('|p − 27.5| ≤ 2.5', [['p', 'measured sag percentage'], ['27.5', 'midpoint of the window (the target)'], ['2.5', 'largest allowed distance from the target']]),
        sim('Tolerance gauge', toleranceGauge(ctx)),
        q('m1-abs-pick'), q('m1-abs-bounds'), q('m1-abs-direction'),
        explain('Worked explanation: from absolute value to an interval', ['|p − 27.5| ≤ 2.5', '−2.5 ≤ p − 27.5 ≤ 2.5   (within 2.5 either side)', '25 ≤ p ≤ 30   (add 27.5 to every part)', 'interval: [25, 30]   number line: a shaded segment from 25 to 30, both ends included'], 'The same window as before: absolute value inequality, compound inequality, interval and number line all say the same thing.'),
        q('m1-compound'),
        note('key', 'distance, not direction', 'A reading below the target and one above it can be exactly the same distance away. |p − 27.5| only measures how far, never which way.')),
      missionFoot(m));
  }

  function timingPage() {
    const m = MISSIONS[1], S = raceStage(PRD.stage);
    const n = variant(), PQ = practiceQuestions(n), key = 'v' + n;
    const practiceBox = el('div');
    const newBtn = button('New race scenario', () => { P.setData('variant', (n + 1) % RACE_PRACTICE.length); rerender(); }, 'ls-btn--quiet');
    put(practiceBox, el('p', { class: 'rd-brief' }, PQ.brief), PRACTICE_IDS.map(id => q(id, { def: PQ[id], key, kicker: 'Independent challenge' })),
      el('div', { class: 'ls-actions' }, newBtn, el('span', { class: 'ls-small' }, 'Every scenario uses checked numbers with whole-minute times.')));
    return el('article', { class: 'rd-mission' },
      missionHead(m, `The team has entered an enduro race with a ${S.total} km timed stage. The rider needs an overall average of at least ${S.target} km/h to hit the team’s target time. The first section is done. How fast does the rest have to be?`),
      card('Race data', null,
        el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, ['Section', 'Distance', 'Average speed'].map(h => el('th', { scope: 'col' }, h)))),
          el('tbody', null, el('tr', null, el('th', { scope: 'row' }, 'Section 1'), el('td', null, `${S.d1} km`), el('td', null, `${S.v1} km/h`)),
            el('tr', null, el('th', { scope: 'row' }, 'Section 2'), el('td', null, `${S.d2} km`), el('td', null, el('span', { class: 'rd-unknown' }, 'v (unknown)'))),
            el('tr', null, el('th', { scope: 'row' }, 'Whole stage'), el('td', null, `${S.total} km`), el('td', null, `target ${S.target} km/h`)))))),
      card('Module A', 'Understand average speed',
        eq('average speed = total distance ÷ total time'),
        P_('Average speed isn’t the average of the speeds. It’s the whole distance divided by the whole time, so work in time first.'),
        q('m2-target-time'), q('m2-time-used'), q('m2-average-trap'),
        sim('Race clock simulator', raceClock(ctx))),
      card('Module B', 'Solve the rational equation',
        P_('Let v be the average speed over the last 3 km. Time for section 1 + time for section 2 = time the target allows:'),
        eq(`${S.d1}/${S.v1} + ${S.d2}/v = ${S.total}/${S.target}`, [['v', 'section 2 speed in km/h; v ≠ 0 (it’s in a denominator), and v > 0 (it’s a speed)']]),
        explain('Worked explanation', ['1/12 + 3/v = 1/4', '3/v = 1/4 − 1/12 = 1/6', 'multiply both sides by 6v (v ≠ 0): 18 = v'], 'Then check: 5 minutes + 10 minutes = 15 minutes for 4 km, which is 16 km/h.'),
        q('m2-solve'), q('m2-check')),
      card('Module C', 'Turn it into an inequality',
        P_('The rider doesn’t need exactly 15 minutes. They need 15 minutes or less:'),
        eq('1/12 + 3/v ≤ 1/4,   v > 0'),
        q('m2-domain'), q('m2-ineq'),
        note('key', 'domain restrictions matter', 'Because v > 0, multiplying by v keeps the inequality’s direction. If v could be negative, the same step would be wrong.')),
      card('Independent challenge', 'A new stage',
        P_('Write the equation, solve it, check it and say what it means, on your own. Hints are there if you need them.'), practiceBox),
      missionFoot(m));
  }

  function surveyPage() {
    const m = MISSIONS[2], V = survey(PRD.survey.a, PRD.survey.c);
    return el('article', { class: 'rd-mission' },
      missionHead(m, `The trail crew is mapping a new section of technical singletrack. They measured the horizontal distance between two reference points (${V.a} m) and the straight-line distance along a simplified profile (${V.c} m). They don’t know the elevation change h. Your job: work it out.`),
      card('Module A', 'Build the equation',
        P_('The horizontal distance and the elevation change are the two legs of a right triangle. The straight-line distance is the hypotenuse.'),
        eq('a² + b² = c²   →   √(120² + h²) = 125', [['h', 'signed elevation change in metres: + if the destination is higher, − if lower']]),
        q('m3-model'),
        sim('Trail survey simulator', surveyLab(ctx))),
      card('Module B', 'Solve the radical equation',
        explain('Worked explanation', ['√(120² + h²) = 125', '120² + h² = 125²   (square both sides)', '14400 + h² = 15625', 'h² = 1225', 'h = ±35'], 'Both signs: +35 m if the destination is higher, −35 m if it’s lower.'),
        q('m3-solve'), q('m3-why-two')),
      card('Module C', 'Verify your solution',
        P_('Don’t just trust the algebra: put the answer back into the original equation and see if both sides match.'),
        q('m3-verify')),
      card('Algebra debugging challenge', 'The extraneous solution',
        P_('Your trail-mapping console has generated an equation. One of its answers is false. Can you find it?'),
        q('m3-candidates'),
        sim('Candidate checker', algebraDebugger(ctx)),
        q('m3-valid'), q('m3-why-extraneous'),
        note('myth', 'squaring can add answers', 'Every time you square both sides, check every candidate in the original equation. It’s the habit that catches extraneous solutions.')),
      missionFoot(m));
  }

  function extensionPage() {
    return el('article', { class: 'rd-mission' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Optional Algebra 2 extension'), el('h1', { class: 'ls-h1' }, 'The setup that doesn’t exist'),
        el('p', { class: 'ls-hook' }, 'Some equations have no real solution at all. Algebra 2 can still write their solutions down.')),
      card(null, null, eq('x² + 16 = 0'), q('ext-solve'),
        P_('There’s no real number that satisfies this equation: a real number squared is never negative. Complex numbers, using i = √−1, let us write the algebraic solutions anyway.'),
        q('ext-meaning'),
        note('key', 'imaginary isn’t physical', 'Imaginary numbers aren’t bike measurements. In a workshop model, complex solutions mean no real-valued setting satisfies that equation.')),
      el('footer', { class: 'ls-section-foot' }, el('nav', { class: 'ls-pager', 'aria-label': 'Workshop' }, el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board'))));
  }

  function finalPage() {
    if (!unlocked()) {
      const s = summary();
      return el('article', { class: 'rd-mission' },
        el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Final mission · locked'), el('h1', { class: 'ls-h1' }, 'Race-Day Certification'),
          el('p', { class: 'ls-hook' }, 'Finish all three missions to unlock the final briefing.')),
        el('ul', { class: 'rd-left' }, s.missions.map((x, i) => el('li', { class: x.complete ? 'is-done' : '' }, x.complete ? '✓ ' : '○ ', el('a', { href: '#' + x.id }, `Mission ${i + 1}: ${x.title}`), x.complete ? '' : ` · ${x.done} of ${x.total} answered`))),
        el('nav', { class: 'ls-pager', 'aria-label': 'Workshop' }, el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board')));
    }
    const f = finalState(), F = finalQuestions(f.round), key = f.key;
    const score = el('div', { class: 'rd-score', 'aria-live': 'polite' }), done = el('div');
    const drawScore = () => {
      const x = finalState(), cert = P.getData('certified', null);
      put(score, el('p', { class: 'rd-score-n' }, `${x.right} / ${x.total}`), el('p', { class: 'ls-small' }, `Round ${x.round} · ${x.done} of ${x.total} answered · ${x.firstTry} right first try with no hints · pass mark ${PASS_MARK} of ${x.total} right without the solution`));
      put(done, x.passed || cert ? completion(cert) : x.complete ? el('div', { class: 'rd-retry' },
        el('p', null, `${x.right} of ${x.total} right this round: not quite race-ready. Look back at the solutions, then try a fresh round with new numbers.`),
        button('Start a new round', () => { P.setData('finalRound', x.round + 1); rerender(); }, 'ls-btn--primary')) : null);
    };
    refreshers.push(drawScore); drawScore();
    const nr = (FINAL_SETS.sag.length);
    return el('article', { class: 'rd-mission rd-final' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, `Final mission · round ${f.round}`), el('h1', { class: 'ls-h1' }, 'Race-Day Certification'),
        el('p', { class: 'ls-hook' }, 'The team is almost ready. Can you finish the calculations on your own?'), score),
      card('Challenge A', 'Suspension setup',
        P_(`A different practice bike has a ${F.set.sag.stroke} mm shock stroke. Use the same 25–30% window.`),
        ['final-a-min', 'final-a-max', 'final-a-abs', 'final-a-eval'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Race timing', q('final-b-speed', { def: F['final-b-speed'], key, kicker: 'Challenge B' })),
      card('Challenge C', 'Trail survey', q('final-c-elev', { def: F['final-c-elev'], key, kicker: 'Challenge C' })),
      done,
      el('p', { class: 'ls-small' }, `Each new round uses a different checked set of numbers (${nr} sets, then they repeat).`),
      el('nav', { class: 'ls-pager', 'aria-label': 'Workshop' }, el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board'), el('a', { href: '#report' }, el('span', null, 'See'), 'Your report')));
  }

  function completion(cert) {
    const s = summary();
    return el('section', { class: 'rd-ready', 'aria-labelledby': 'rd-ready-h' },
      el('p', { class: 'ls-kicker' }, 'Certified'),
      el('h2', { class: 'ls-h1 rd-ready-h', id: 'rd-ready-h', tabindex: '-1' }, 'Race-day ready'),
      el('p', { class: 'ls-lede' }, 'Nice work. You’ve used Algebra 2 to solve suspension setup constraints, calculate race performance, and analyze mountain biking terrain.'),
      stats(s, cert),
      el('div', { class: 'ls-actions' }, el('a', { class: 'ls-btn ls-btn--primary', href: '#report' }, 'Your full report'),
        button('Practise a new round', () => { P.setData('finalRound', finalRound() + 1); rerender(); }, 'ls-btn--quiet')));
  }
  function stats(s, cert) {
    const items = [['Missions completed', `${s.missionsDone} of 3`], ['Final challenge', cert ? `${cert.right} of ${cert.total} (round ${cert.round})` : `${s.final.right} of ${s.final.total} so far`],
      ['Correct answers', String(s.correct)], ['Attempts', String(s.attempts)], ['Right first try', String(s.firstTryRight)], ['Hints used', String(s.hintsUsed)], ['Time', s.activeMinutes < 1 ? 'under a minute' : `about ${s.activeMinutes} min`]];
    return el('dl', { class: 'rd-stats' }, items.map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v))));
  }

  function reportPage() {
    const s = summary();
    const rows = REPORT_IDEAS.concat(Object.keys(IDEAS).filter(i => !REPORT_IDEAS.includes(i))).map(i => {
      const x = s.ideas[i];
      return el('tr', null, el('th', { scope: 'row' }, IDEAS[i]),
        el('td', { class: 'rd-mono' }, x ? String(x.answered) : '0'), el('td', { class: 'rd-mono' }, x ? String(x.firstTry) : '—'),
        el('td', { class: 'rd-mono' }, x ? String(x.hints) : '—'), el('td', { class: 'rd-mono' }, x ? String(x.revealed) : '—'),
        el('td', null, !x || !x.answered ? el('span', { class: 'ls-small' }, 'not practised yet') : s.practice.includes(i) ? el('span', { class: 'rd-status rd-status--warn' }, 'worth more practice') : el('span', { class: 'rd-status rd-status--ok' }, 'going well')));
    });
    return el('article', { class: 'rd-mission' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Workshop report'), el('h1', { class: 'ls-h1' }, s.certified ? 'Race-day ready' : 'Your progress'),
        el('p', { class: 'ls-hook' }, 'What you’ve practised so far. This shows practice, not mastery: one workshop is a start, not a finish.')),
      card(null, null, stats(s, s.certification)),
      card('By idea', 'Skills practised',
        el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table rd-report' },
          el('thead', null, el('tr', null, ['Idea', 'Answered', 'First try', 'Hints', 'Solutions shown', ''].map(h => el('th', { scope: 'col' }, h)))), el('tbody', null, rows))),
        el('p', { class: 'ls-small' }, '“Worth more practice” means a solution was needed, or fewer than half were right on the first try.')),
      s.misconceptions.length ? card('Patterns to watch', 'Mistakes that came up',
        el('ul', { class: 'rd-miscon' }, s.misconceptions.map(m => el('li', null, m.label, el('span', { class: 'ls-small' }, ` · ${m.count} question${m.count === 1 ? '' : 's'}`))))) : null,
      el('div', { class: 'ls-actions rd-report-actions' }, el('a', { class: 'ls-btn ls-btn--quiet', href: '#board' }, 'Mission board'),
        button('Start the workshop over', () => { if (window.confirm('Start the workshop over? This clears your answers and settings on this device.')) { P.reset(); go('start'); } }, 'ls-btn--ghost')));
  }

  const PAGES = { start: startPage, board: boardPage, suspension: suspensionPage, timing: timingPage, survey: surveyPage, final: finalPage, extension: extensionPage, report: reportPage };
  function show(r, focus) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); cleanups = []; refreshers = [];
    route = r;
    if (r !== 'start') P.visit(r);
    root.classList.toggle('rdw--open', r === 'start');
    clear(main).appendChild(PAGES[r]());
    drawMeter();
    if (focus) { const h = main.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } root.scrollIntoView({ block: 'start' }); }
  }
  function rerender() { const y = typeof window !== 'undefined' ? window.scrollY : 0; show(route, false); if (typeof window !== 'undefined') window.scrollTo(0, y); }
  const parse = h => { const a = String(h || '').replace(/^#/, ''); return ROUTES.includes(a) ? a : 'start'; };
  function go(r) { if (routing === 'hash') { if (location.hash === '#' + r) show(r, true); else location.hash = '#' + r; } else show(r, true); }
  root.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('ls-skip')) return;
    const r = parse(a.getAttribute('href'));
    if (routing === 'memory' || location.hash === a.getAttribute('href')) { e.preventDefault(); show(r, true); }
  });
  const onHash = () => { show(parse(location.hash), !first); first = false; };
  if (routing === 'hash') { window.addEventListener('hashchange', onHash); onHash(); }
  else { show('start', false); first = false; }
  checkCertified();
  return { summary, progress: P, go, destroy: () => { cleanups.forEach(fn => fn()); if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}

if (typeof window !== 'undefined') window.RaceDayWorkshop = { mount, VERSION };
