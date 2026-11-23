// Lesson kit: the mission-board shell for Mathlete labs built as missions
// (Race-Day Workshop, Ride Systems Lab, …). A lab is config plus its own
// mission pages; the shell draws the opening screen, the mission board, the
// mission pages' header and footer, an optional extension, the locked /
// unlocked final challenge with rounds and a pass mark, the completion
// panel and the report, and keeps progress (progress.js) and routing.
//
//   import { mountMissions } from '../lesson-kit/missions.js';
//   mountMissions(element, LAB, { studentId, storage, routing: 'hash' | 'memory',
//     backLink: { href, label },     // "Exit": where the student came from
//     courseLink: { href, label },   // "← Algebra 2"
//     onAttempt(record), onProgress(summary), onComplete(summary) })
//
// LAB = {
//   id, title, eventPrefix, rootClass, noun,            // noun: 'workshop', 'lab' (used in words)
//   questions, kinds: { id: [ideas] }, ideas: { idea: label }, reportIdeas: [...], misconceptions: { code: label },
//   open: { kicker, lines: [..], accent, lede, body, enter, back, meta, art: () => element },
//   board: { title, hook, refsNote, refs: [[title, url]] },
//   missions: [{ id, n, title, short, minutes, focus, blurb, hook, graded: [ids], practice?: true, page: ctx => [elements] }],
//   practice?: { ids, count, questions(n) -> { brief, [id]: question }, button, note, kicker },
//   extension?: { kicker, title, blurb, hook, page: ctx => [elements] },
//   final: { ids, passMark, sets, questions(round) -> { [id]: question }, title, blurb, hook, lockedHook,
//            doneShort, doneTitle, doneLede, notYet(state) -> text, page: (ctx, F, key) => [elements] },
//   report: { kicker }
// }
// ctx (passed to pages): { progress, cleanup, rerender, q(id, { def, key, kicker }), card, eq, explain, note, sim, para, h3, practiceBox() }
// Pass mark: a round passes when every question is answered and at least
// passMark are right without the solution shown. Passing once records the
// certification (and fires onComplete); it is never a mastery claim.

import { el, clear, put, button } from './dom.js';
import { ask } from './ask.js';
import { createProgress } from './progress.js';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const word = n => WORDS[n] || String(n);

// A photo figure (src resolved by the lab, e.g. with import.meta.url).
export function photoFigure({ src, alt, width, height, hero, caption, cls }) {
  return el('figure', { class: 'ms-photo' + (hero ? ' ms-photo--hero' : '') + (cls ? ' ' + cls : '') },
    el('img', { src, alt, width, height, loading: hero ? 'eager' : 'lazy', decoding: 'async' }),
    caption ? el('figcaption', { class: 'ls-small' }, caption) : null);
}

export function mountMissions(target, L, opts = {}) {
  if (!target) throw new Error(L.id + ': mount() needs an element');
  const MISSIONS = L.missions, QUESTIONS = L.questions, KINDS = L.kinds, FINAL = L.final, NOUN = L.noun || 'lab';
  const ROUTES = ['start', 'board', ...MISSIONS.map(m => m.id), 'final', ...(L.extension ? ['extension'] : []), 'report'];
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent((L.eventPrefix || L.id) + ':' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const call = (fn, a) => { try { if (typeof fn === 'function') fn(a); } catch (e) { if (typeof console !== 'undefined') console.warn('[' + L.id + ']', e); } };
  // The kit's progress, with the missions as its sections (their fixed
  // questions). Keyed questions (practice variants and final rounds) are
  // tracked here, in missionState() and finalState().
  var P = createProgress({
    lesson: { id: L.id, sections: MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QUESTIONS },
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

  // ---------- state ----------
  const variant = () => P.getData('variant', 0);
  const finalRound = () => P.getData('finalRound', 1);
  function missionState(m) {
    const items = m.graded.map(id => [id, null]).concat(m.practice && L.practice ? L.practice.ids.map(id => [id, 'v' + variant()]) : []);
    const done = items.filter(([id, k]) => P.done(id, k)).length;
    return { done, total: items.length, complete: done === items.length, started: done > 0 || !!P.state.visited[m.id] };
  }
  function finalState(roundNo) {
    const r = roundNo || finalRound(), key = 'r' + r;
    const recs = FINAL.ids.map(id => P.question(id, key));
    const done = FINAL.ids.filter(id => P.done(id, key)).length;
    const right = FINAL.ids.filter(id => P.earned(id, key)).length;
    const firstTry = recs.filter(x => x && x.correct && !x.revealed && x.attempts === 1 && !x.hints).length;
    return { round: r, key, done, total: FINAL.ids.length, right, firstTry, complete: done === FINAL.ids.length, passed: done === FINAL.ids.length && right >= FINAL.passMark };
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
    const practice = Object.keys(L.ideas).filter(i => ideas[i] && ideas[i].answered && (ideas[i].revealed > 0 || ideas[i].firstTry / ideas[i].answered < 0.5));
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
      ideas, practice, misconceptions: Object.entries(codes).sort((a, b) => b[1] - a[1]).map(([code, count]) => ({ code, label: L.misconceptions[code] || code, count }))
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
  const N = MISSIONS.length;
  const meter = el('div', { class: 'ms-meter' });
  const main = el('main', { class: 'ls-main ms-main', tabindex: '-1', id: 'ms-main' });
  const link = (o, cls, arrow) => (o && o.href ? el('a', { class: cls, href: o.href }, arrow ? el('span', { 'aria-hidden': 'true' }, '← ') : null, o.label) : null);
  const root = el('div', { class: 'lsn ' + (L.rootClass || '') },
    el('a', { class: 'ls-skip', href: '#ms-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the ' + NOUN),
    el('header', { class: 'ls-top' }, el('div', { class: 'ls-wrap ls-top-row' },
      el('div', { class: 'ls-top-left' }, el('p', { class: 'ls-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), link(opts.courseLink, 'ls-back', true)),
      el('a', { class: 'ls-titlebar ms-titlebar', href: '#board' }, L.title),
      el('div', { class: 'ls-top-right' }, meter, link(opts.backLink ? { ...opts.backLink, label: 'Exit' } : null, 'ls-back ms-exit')))),
    el('div', { class: 'ls-wrap' }, opts.breadcrumb ? el('nav', { class: 'ms-crumbs', 'aria-label': 'Breadcrumb' }, el('ol', null, opts.breadcrumb.map((c, i, a) => el('li', null,
      c.href && i < a.length - 1 ? el('a', { href: c.href }, c.label) : el('span', { 'aria-current': i === a.length - 1 ? 'page' : null }, c.label))))) : null, main));
  clear(target).appendChild(root);

  let route = 'start', first = true, cleanups = [], refreshers = [];
  const refresh = () => { checkCertified(); drawMeter(); refreshers.forEach(fn => { try { fn(); } catch (e) { /* keep going */ } }); };

  function drawMeter() {
    const s = summary();
    put(meter, el('ol', { class: 'ms-pips', 'aria-hidden': 'true' },
      s.missions.map(m => el('li', { class: m.complete ? 'is-done' : m.done ? 'is-part' : '' })),
      el('li', { class: 'ms-pip-flag ' + (s.certified ? 'is-done' : s.unlocked ? 'is-part' : '') }, '⚑')),
      el('span', { class: 'ls-status' }, s.certified ? FINAL.doneShort : `${s.missionsDone}/${N} missions`));
    meter.setAttribute('role', 'img');
    meter.setAttribute('aria-label', `Progress: ${s.missionsDone} of ${N} missions complete; final challenge ${s.certified ? 'passed' : s.unlocked ? 'unlocked' : 'locked'}.`);
  }

  // ---------- building blocks (also handed to the lab's pages) ----------
  const para = text => el('p', { class: 'ls-p' }, text);
  const card = (kicker, title, ...kids) => el('section', { class: 'ls-card ms-module' }, kicker ? el('p', { class: 'ls-kicker' }, kicker) : null, title ? el('h2', { class: 'ls-h2 ms-h2' }, title) : null, ...kids);
  const eq = (main_, where) => el('div', { class: 'ls-eq' }, el('p', { class: 'ls-eq-main' }, main_), where ? el('dl', { class: 'ls-where' }, where.map(([s, m]) => el('div', null, el('dt', null, s), el('dd', null, m)))) : null);
  const explain = (title, steps, meaning) => el('details', { class: 'ms-explain' }, el('summary', null, title),
    el('ol', { class: 'ls-steps' }, steps.map(s => el('li', null, el('span', { class: 'ls-mono' }, s)))), meaning ? el('p', { class: 'ls-meaning' }, meaning) : null);
  const note = (kind, title, text) => el('aside', { class: 'ls-note ls-note--' + kind }, el('p', { class: 'ls-note-h' }, (kind === 'myth' ? 'Watch out: ' : 'Key idea: ') + title), el('p', null, text));
  const sim = (title, node) => el('figure', { class: 'ms-sim' }, el('figcaption', { class: 'ms-sim-h' }, el('span', { class: 'ms-sim-dot', 'aria-hidden': 'true' }), title), node);
  const h3 = text => el('h3', { class: 'ls-h3 ms-h3' }, text);
  function q(id, o = {}) {
    const def = o.def || QUESTIONS[id];
    return el('div', { class: 'ls-card ls-ask-card ms-ask' }, el('p', { class: 'ls-kicker' }, o.kicker || 'Your turn'),
      ask({ ...def, id }, { progress: P, key: o.key || null, onDone: refresh }));
  }
  function practiceBox() {
    const PR = L.practice, n = variant(), PQ = PR.questions(n), key = 'v' + n;
    return el('div', null, el('p', { class: 'ms-brief' }, PQ.brief), PR.ids.map(id => q(id, { def: PQ[id], key, kicker: PR.kicker || 'Independent challenge' })),
      el('div', { class: 'ls-actions' }, button(PR.button || 'New numbers', () => { P.setData('variant', (n + 1) % PR.count); rerender(); }, 'ls-btn--quiet'),
        PR.note ? el('span', { class: 'ls-small' }, PR.note) : null));
  }
  const ctx = { progress: P, cleanup: fn => cleanups.push(fn), rerender: () => rerender(), q, card, eq, explain, note, sim, para, h3, practiceBox };

  function missionHead(m) {
    return el('header', { class: 'ls-section-head ms-mission-head' },
      el('p', { class: 'ls-kicker' }, `Mission ${m.n} · ${m.short} · about ${m.minutes} min`),
      el('h1', { class: 'ls-h1' }, m.title), el('p', { class: 'ms-focus' }, m.focus), el('p', { class: 'ls-hook ms-brief' }, m.hook));
  }
  function missionFoot(m) {
    const st = el('p', { class: 'ls-section-status', 'aria-live': 'polite' });
    const draw = () => { const s = missionState(m); st.textContent = s.complete ? `✓ Mission ${m.n} complete.` : `${s.done} of ${s.total} answered in this mission.`; st.classList.toggle('is-done', s.complete); };
    refreshers.push(draw); draw();
    const next = MISSIONS[MISSIONS.indexOf(m) + 1];
    return el('footer', { class: 'ls-section-foot' }, st, el('nav', { class: 'ls-pager', 'aria-label': 'Missions' },
      el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board'),
      next ? el('a', { href: '#' + next.id }, el('span', null, 'Next'), `Mission ${next.n}: ${next.short}`) : el('a', { href: '#final' }, el('span', null, 'Then'), FINAL.title)));
  }
  const backToBoard = () => el('a', { href: '#board' }, el('span', null, 'Back to'), 'Mission board');

  // ---------- pages ----------
  function startPage() {
    const s = summary(), O = L.open, begun = s.questionsAnswered > 0 || Object.keys(P.state.visited).length > 0;
    const lines = O.lines.flatMap(t => [t, el('br')]);
    return el('article', { class: 'ms-open' },
      el('div', { class: 'ms-open-grid' },
        el('div', null,
          el('p', { class: 'ls-kicker' }, O.kicker),
          el('h1', { class: 'ls-h1 ls-h1--big ms-open-h' }, ...lines, el('span', null, O.accent)),
          el('p', { class: 'ls-lede' }, O.lede),
          O.body ? el('p', { class: 'ls-p' }, O.body) : null,
          el('a', { class: 'ls-btn ls-btn--primary ms-enter', href: '#board' }, begun ? O.back : O.enter),
          el('p', { class: 'ls-small' }, O.meta, s.certified ? ' · ✓ ' + FINAL.doneShort.toLowerCase() : '')),
        el('div', { class: 'ms-open-art' }, O.art ? O.art() : null)));
  }

  function boardPage() {
    const s = summary(), B = L.board;
    const pct = Math.round(100 * (s.missionsDone + (s.certified ? 1 : 0)) / (N + 1));
    const missionCard = m => {
      const st = s.missions.find(x => x.id === m.id);
      return el('li', { class: 'ms-mcard' + (st.complete ? ' is-done' : '') },
        el('p', { class: 'ms-mcard-n' }, 'Mission ' + m.n), el('h2', { class: 'ms-mcard-h' }, m.short), el('p', { class: 'ms-mcard-t' }, m.blurb),
        el('p', { class: 'ls-small' }, m.focus + ' · ' + m.minutes + ' min'),
        el('p', { class: 'ms-mcard-status' }, st.complete ? '✓ Complete' : st.done ? `${st.done} of ${st.total} answered` : 'Not started'),
        el('a', { class: 'ls-btn ' + (st.complete ? 'ls-btn--quiet' : 'ls-btn--primary'), href: '#' + m.id }, st.complete ? 'Revisit' : st.done ? 'Continue' : 'Start', el('span', { class: 'ls-sr' }, ' mission ' + m.n)));
    };
    return el('article', { class: 'ms-board' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Mission board'), el('h1', { class: 'ls-h1' }, B.title),
        el('p', { class: 'ls-hook' }, B.hook)),
      el('div', { class: 'ms-overall' }, el('div', { class: 'ms-overall-bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': NOUN[0].toUpperCase() + NOUN.slice(1) + ' progress' }, el('span', { style: { width: pct + '%' } })),
        el('p', { class: 'ls-small' }, `${s.missionsDone} of ${N} missions · ${s.certified ? 'certified' : s.unlocked ? 'final unlocked' : 'final locked'} · ${s.questionsAnswered} questions answered, ${s.firstTryRight} right first try`)),
      el('ol', { class: 'ms-missions' + (N === 4 ? ' ms-missions--five' : '') }, MISSIONS.map(missionCard),
        el('li', { class: 'ms-mcard ms-mcard--final' + (s.unlocked ? '' : ' is-locked') + (s.certified ? ' is-done' : '') },
          el('p', { class: 'ms-mcard-n' }, 'Final'), el('h2', { class: 'ms-mcard-h' }, FINAL.title),
          el('p', { class: 'ms-mcard-t' }, FINAL.blurb),
          el('p', { class: 'ms-mcard-status' }, s.certified ? '✓ ' + FINAL.doneShort : s.unlocked ? `Unlocked · ${s.final.done} of ${s.final.total}` : `🔒 Finish all ${word(N)} missions`),
          el('a', { class: 'ls-btn ' + (s.unlocked && !s.certified ? 'ls-btn--primary' : 'ls-btn--quiet'), href: '#final' }, s.certified ? 'Review' : s.unlocked ? 'Take the challenge' : 'See what’s left'))),
      L.extension ? el('section', { class: 'ls-card ms-extra' },
        el('div', null, el('p', { class: 'ls-kicker' }, 'Optional extension'), el('h2', { class: 'ls-h3' }, L.extension.title),
          el('p', { class: 'ls-small' }, L.extension.blurb)),
        el('a', { class: 'ls-btn ls-btn--quiet', href: '#extension' }, 'Open the extension')) : null,
      el('section', { class: 'ls-card ms-extra' },
        el('div', null, el('p', { class: 'ls-kicker' }, 'Your report'), el('p', { class: 'ls-small' }, 'Attempts, hints and the ideas worth more practice, so far.')),
        el('a', { class: 'ls-btn ls-btn--quiet', href: '#report' }, 'See your report')),
      B.refs ? el('details', { class: 'ms-refs' }, el('summary', null, 'References'),
        B.refsNote ? el('p', { class: 'ls-small' }, B.refsNote) : null,
        el('ul', null, B.refs.map(([t, u]) => el('li', null, el('a', { href: u, target: '_blank', rel: 'noopener' }, t, el('span', { class: 'ls-sr' }, ' (opens in a new tab)')))))) : null);
  }

  function missionPage(m) {
    return el('article', { class: 'ms-mission' }, missionHead(m), m.page(ctx), missionFoot(m));
  }

  function extensionPage() {
    const X = L.extension;
    return el('article', { class: 'ms-mission' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, X.kicker || 'Optional extension'), el('h1', { class: 'ls-h1' }, X.title),
        el('p', { class: 'ls-hook' }, X.hook)),
      X.page(ctx),
      el('footer', { class: 'ls-section-foot' }, el('nav', { class: 'ls-pager', 'aria-label': L.title }, backToBoard())));
  }

  function finalPage() {
    if (!unlocked()) {
      const s = summary();
      return el('article', { class: 'ms-mission' },
        el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, 'Final mission · locked'), el('h1', { class: 'ls-h1' }, FINAL.title),
          el('p', { class: 'ls-hook' }, FINAL.lockedHook || `Finish all ${word(N)} missions to unlock the final challenge.`)),
        el('ul', { class: 'ms-left' }, s.missions.map((x, i) => el('li', { class: x.complete ? 'is-done' : '' }, x.complete ? '✓ ' : '○ ', el('a', { href: '#' + x.id }, `Mission ${i + 1}: ${x.title}`), x.complete ? '' : ` · ${x.done} of ${x.total} answered`))),
        el('nav', { class: 'ls-pager', 'aria-label': L.title }, backToBoard()));
    }
    const f = finalState(), F = FINAL.questions(f.round), key = f.key;
    const score = el('div', { class: 'ms-score', 'aria-live': 'polite' }), done = el('div');
    const drawScore = () => {
      const x = finalState(), cert = P.getData('certified', null);
      put(score, el('p', { class: 'ms-score-n' }, `${x.right} / ${x.total}`), el('p', { class: 'ls-small' }, `Round ${x.round} · ${x.done} of ${x.total} answered · ${x.firstTry} right first try with no hints · pass mark ${FINAL.passMark} of ${x.total} right without the solution`));
      put(done, x.passed || cert ? completion(cert) : x.complete ? el('div', { class: 'ms-retry' },
        el('p', null, FINAL.notYet ? FINAL.notYet(x) : `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with new numbers.`),
        button('Start a new round', () => { P.setData('finalRound', x.round + 1); rerender(); }, 'ls-btn--primary')) : null);
    };
    refreshers.push(drawScore); drawScore();
    return el('article', { class: 'ms-mission ms-final' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, `Final mission · round ${f.round}`), el('h1', { class: 'ls-h1' }, FINAL.title),
        el('p', { class: 'ls-hook' }, FINAL.hook), score),
      FINAL.page(ctx, F, key),
      done,
      el('p', { class: 'ls-small' }, `Each new round uses a different checked set of numbers (${FINAL.sets} sets, then they repeat).`),
      el('nav', { class: 'ls-pager', 'aria-label': L.title }, backToBoard(), el('a', { href: '#report' }, el('span', null, 'See'), 'Your report')));
  }

  function completion(cert) {
    const s = summary();
    return el('section', { class: 'ms-ready', 'aria-labelledby': 'ms-ready-h' },
      el('p', { class: 'ls-kicker' }, 'Certified'),
      el('h2', { class: 'ls-h1 ms-ready-h', id: 'ms-ready-h', tabindex: '-1' }, FINAL.doneTitle),
      el('p', { class: 'ls-lede' }, FINAL.doneLede),
      stats(s, cert),
      el('div', { class: 'ls-actions' }, el('a', { class: 'ls-btn ls-btn--primary', href: '#report' }, 'Your full report'),
        button('Practise a new round', () => { P.setData('finalRound', finalRound() + 1); rerender(); }, 'ls-btn--quiet')));
  }
  function stats(s, cert) {
    const items = [['Missions completed', `${s.missionsDone} of ${N}`], ['Final challenge', cert ? `${cert.right} of ${cert.total} (round ${cert.round})` : `${s.final.right} of ${s.final.total} so far`],
      ['Correct answers', String(s.correct)], ['Attempts', String(s.attempts)], ['Right first try', String(s.firstTryRight)], ['Hints used', String(s.hintsUsed)], ['Time', s.activeMinutes < 1 ? 'under a minute' : `about ${s.activeMinutes} min`]];
    return el('dl', { class: 'ms-stats' }, items.map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v))));
  }

  function reportPage() {
    const s = summary(), IDEAS = L.ideas, REPORT = L.reportIdeas || Object.keys(IDEAS);
    const rows = REPORT.concat(Object.keys(IDEAS).filter(i => !REPORT.includes(i))).map(i => {
      const x = s.ideas[i];
      return el('tr', null, el('th', { scope: 'row' }, IDEAS[i]),
        el('td', { class: 'ms-mono' }, x ? String(x.answered) : '0'), el('td', { class: 'ms-mono' }, x ? String(x.firstTry) : '—'),
        el('td', { class: 'ms-mono' }, x ? String(x.hints) : '—'), el('td', { class: 'ms-mono' }, x ? String(x.revealed) : '—'),
        el('td', null, !x || !x.answered ? el('span', { class: 'ls-small' }, 'not practised yet') : s.practice.includes(i) ? el('span', { class: 'ms-status ms-status--warn' }, 'worth more practice') : el('span', { class: 'ms-status ms-status--ok' }, 'going well')));
    });
    return el('article', { class: 'ms-mission' },
      el('header', { class: 'ls-section-head' }, el('p', { class: 'ls-kicker' }, (L.report && L.report.kicker) || 'Report'), el('h1', { class: 'ls-h1' }, s.certified ? FINAL.doneTitle : 'Your progress'),
        el('p', { class: 'ls-hook' }, `What you’ve practised so far. This shows practice, not mastery: one ${NOUN} is a start, not a finish.`)),
      card(null, null, stats(s, s.certification)),
      card('By idea', 'Skills practised',
        el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ms-report' },
          el('thead', null, el('tr', null, ['Idea', 'Answered', 'First try', 'Hints', 'Solutions shown', ''].map(h => el('th', { scope: 'col' }, h)))), el('tbody', null, rows))),
        el('p', { class: 'ls-small' }, '“Worth more practice” means a solution was needed, or fewer than half were right on the first try.')),
      s.misconceptions.length ? card('Patterns to watch', 'Mistakes that came up',
        el('ul', { class: 'ms-miscon' }, s.misconceptions.map(m => el('li', null, m.label, el('span', { class: 'ls-small' }, ` · ${m.count} question${m.count === 1 ? '' : 's'}`))))) : null,
      el('div', { class: 'ls-actions ms-report-actions' }, el('a', { class: 'ls-btn ls-btn--quiet', href: '#board' }, 'Mission board'),
        button(`Start the ${NOUN} over`, () => { if (window.confirm(`Start the ${NOUN} over? This clears your answers and settings on this device.`)) { P.reset(); go('start'); } }, 'ls-btn--ghost')));
  }

  function page(r) {
    if (r === 'start') return startPage();
    if (r === 'board') return boardPage();
    if (r === 'final') return finalPage();
    if (r === 'extension') return extensionPage();
    if (r === 'report') return reportPage();
    return missionPage(MISSIONS.find(m => m.id === r));
  }
  function show(r, focus) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); cleanups = []; refreshers = [];
    route = r;
    if (r !== 'start') P.visit(r);
    root.classList.toggle('ms-is-open', r === 'start');
    clear(main).appendChild(page(r));
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
