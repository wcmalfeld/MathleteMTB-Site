// Lesson kit: the shell every Physics lesson runs in. A lesson is data
// (sections made of blocks, questions, objectives, mastery rules) plus its
// own interactive activities; the kit draws the overview, the section
// pages, the navigation, the level switch and the knowledge check, and
// keeps progress (progress.js).
//
//   import { mountLesson } from '../lesson-kit/lesson.js';
//   mountLesson(element, LESSON, { studentId, storage, routing, backLink,
//                                  onAttempt, onProgress, onComplete })
//
// LESSON = {
//   id, title, eventPrefix,             // e.g. 'my-lesson', 'My Lesson', 'mylesson'
//   kicker,                             // e.g. 'Trail Physics · Module 7' (section headers)
//   overview: { kicker, lede, questions: [..], start, note, duration },
//   sections, questions, checkIds, objectives, levels,
//   activities: { id: ctx => element },  // the lesson's own interactives
//   visual(id) -> element,               // optional pictures for { t: 'visual' } blocks
//   check: { intro },                    // knowledge-check wording
//   mastery(progressApi) -> { mastered, criteria: [{ id, label, met, detail?, review: [sectionIds] }] },
//   masteryText: { done, todo, doneBody, todoBody, criteriaTitle }
// }
//
// Block types (lesson.sections[].blocks):
//   p { text } · law { name, text } · eq { eq, where } · cards { items: [{ h, text, mtb }] }
//   table { head, rows } · example { title, given, steps, answer, meaning }
//   note { kind: 'key' | 'myth', title, text }
//   level { level: 'explore' | 'engineer', title, paras }   open at that level, folded otherwise
//   visual { id } · activity { id } · ask { q }
// Built-in activities: 'knowledge-check', 'mastery'.

import { el, clear, button, put, id as uid } from './dom.js';
import { ask } from './ask.js';
import { createProgress } from './progress.js';

export const KIT_VERSION = '1.0.0';

export function mountLesson(target, L, opts = {}) {
  if (!target) throw new Error(L.id + ': mount() needs an element');
  const SECTIONS = L.sections, QUESTIONS = L.questions;
  const ROUTES = ['start', ...SECTIONS.map(s => s.id)];
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent((L.eventPrefix || L.id) + ':' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({ lesson: L, studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); } });
  const MT = { done: '★ Mastered', todo: 'What mastery takes', criteriaTitle: 'Your mastery', ...(L.masteryText || {}) };

  const status = el('p', { class: 'ls-status' });
  const levelSeg = el('div', { class: 'ls-segs ls-level', role: 'radiogroup', 'aria-label': 'Level of support' });
  const nav = el('nav', { class: 'ls-nav', 'aria-label': 'Lesson sections' });
  const main = el('main', { class: 'ls-main', tabindex: '-1', id: 'ls-main' });
  const back = opts.backLink && opts.backLink.href ? el('a', { class: 'ls-back', href: opts.backLink.href }, el('span', { 'aria-hidden': 'true' }, '← '), opts.backLink.label || 'Back') : null;
  const restart = button('Start over', () => { if (window.confirm('Start the lesson over? This clears your answers, experiments and notes on this device.')) { progress.reset(); go('start'); } }, 'ls-btn--ghost');
  const root = el('div', { class: 'lsn lsn--' + L.id },
    el('a', { class: 'ls-skip', href: '#ls-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lesson'),
    el('header', { class: 'ls-top' }, el('div', { class: 'ls-wrap ls-top-row' },
      el('div', { class: 'ls-top-left' }, el('p', { class: 'ls-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), back),
      el('p', { class: 'ls-titlebar' }, L.title),
      el('div', { class: 'ls-top-right' }, el('span', { class: 'ls-mini-label' }, 'Level'), levelSeg, status, restart))),
    el('div', { class: 'ls-navbar' }, el('div', { class: 'ls-wrap' }, nav)),
    el('div', { class: 'ls-wrap' }, main));
  clear(target).appendChild(root);

  let route = 'start', first = true, cleanups = [], refreshers = [];
  const ctx = {
    lesson: L, progress, go,
    cleanup: fn => cleanups.push(fn),
    refresh: () => { drawChrome(); refreshers.forEach(fn => { try { fn(); } catch (e) { /* keep going */ } }); },
    rerender: () => show(route, false),
    ask: (id, extra = {}) => ask({ ...QUESTIONS[id], id }, { progress, onDone: () => ctx.refresh(), ...extra })
  };

  const shortTitle = sec => sec.navTitle || sec.title;
  function drawChrome() {
    const s = progress.summary();
    put(nav, el('ol', null, ROUTES.map(id => {
      const sec = SECTIONS.find(x => x.id === id), st = sec && s.sections.find(x => x.id === id);
      return el('li', null, el('a', { href: '#' + id, class: 'ls-nav-link', 'aria-current': id === route ? 'page' : null },
        el('span', null, sec ? `${sec.n}. ${shortTitle(sec)}` : 'Overview'),
        st && st.complete ? el('span', { class: 'ls-nav-mark', 'aria-label': 'complete' }, '✓') : st && st.answered ? el('span', { class: 'ls-nav-mark ls-nav-mark--part' }, `${st.answered}/${st.total}`) : null));
    })));
    status.textContent = `${s.sectionsDone}/${s.sectionsTotal} sections${s.mastered ? ' · ★' : ''}`;
    status.setAttribute('aria-label', `Progress: ${s.sectionsDone} of ${s.sectionsTotal} sections complete${s.mastered ? '; ' + MT.done.replace('★ ', '') : ''}`);
    put(levelSeg, L.levels.map(l => { const b = el('button', { type: 'button', role: 'radio', class: 'ls-seg', 'aria-checked': String(progress.level === l.id), title: l.text }, l.name);
      b.addEventListener('click', () => { if (progress.level !== l.id) { progress.setLevel(l.id); ctx.rerender(); } }); return b; }));
  }

  // ---------- built-in activities ----------
  const BUILTIN = {
    'knowledge-check': () => {
      const key = progress.checkKey();
      const score = el('p', { class: 'ls-score', 'aria-live': 'polite' });
      const retake = button('Retake the knowledge check', () => { if (window.confirm('Start a new round of the knowledge check? Your best round still counts.')) { progress.retakeCheck(); ctx.rerender(); } }, 'ls-btn--quiet');
      function drawScore() {
        const s = progress.checkScore(), best = progress.bestCheck();
        score.textContent = `Round ${s.round}: ${s.answered} of ${s.total} answered, ${s.right} right first try.` + (best && best.round !== s.round ? ` Best round so far: ${best.right} of ${best.total}.` : '');
        retake.hidden = s.answered < s.total;
      }
      const list = el('ol', { class: 'ls-check-list' }, L.checkIds.map(id => el('li', null, ask({ ...QUESTIONS[id], id }, { progress, key, onDone: () => { drawScore(); ctx.refresh(); } }))));
      drawScore();
      return el('section', { class: 'ls-kcheck', 'aria-labelledby': 'kc-h' },
        el('h2', { class: 'ls-h2', id: 'kc-h' }, 'Knowledge check'), el('p', null, (L.check || {}).intro || ''), score, list, retake);
    },
    mastery: () => {
      const m = progress.mastery(), s = progress.summary();
      const title = sec => (SECTIONS.find(x => x.id === sec) || {}).title || sec;
      return el('section', { class: 'ls-mastery' + (m.mastered ? ' is-mastered' : ''), 'aria-labelledby': 'ms-h' },
        el('h2', { class: 'ls-h2', id: 'ms-h' }, m.mastered ? MT.done : MT.criteriaTitle),
        criteriaList(m, title),
        el('p', { class: 'ls-small' }, `${s.sectionsDone} of ${s.sectionsTotal} sections complete · ${s.questionsAnswered} questions answered, ${s.firstTryRight} right first try · ${s.hintsUsed} hints · about ${s.activeMinutes} min.`),
        el('p', null, m.mastered ? MT.doneBody || '' : MT.todoBody || ''));
    }
  };
  function criteriaList(m, title) {
    return el('ul', { class: 'ls-criteria' }, m.criteria.map(c => el('li', { class: c.met ? 'is-met' : '' },
      el('span', { class: 'ls-crit-mark', 'aria-hidden': 'true' }, c.met ? '✓' : '○'), el('span', null, c.label, c.detail ? el('span', { class: 'ls-small' }, ' · ' + c.detail) : null,
        c.met ? el('span', { class: 'ls-sr' }, ' (met)') : title && c.review && c.review.length ? el('span', { class: 'ls-review' }, ' Review: ', c.review.map((sec, i) => [i ? ', ' : '', el('a', { href: '#' + sec }, title(sec))])) : null))));
  }

  // ---------- blocks ----------
  function block(b) {
    switch (b.t) {
      case 'p': return el('p', { class: 'ls-p' }, b.text);
      case 'law': return el('div', { class: 'ls-law' }, el('p', { class: 'ls-law-name' }, b.name), el('p', { class: 'ls-law-text' }, b.text));
      case 'eq': return el('div', { class: 'ls-eq' }, el('p', { class: 'ls-eq-main' }, b.eq),
        b.where ? el('dl', { class: 'ls-where' }, b.where.map(([s, m]) => el('div', null, el('dt', null, s), el('dd', null, m)))) : null);
      case 'cards': return el('ul', { class: 'ls-cards' }, b.items.map(c => el('li', { class: 'ls-mtb-card' }, el('h3', { class: 'ls-card-h' }, c.h), el('p', null, c.text),
        c.list ? el('ul', { class: 'ls-card-list' }, c.list.map(x => el('li', null, x))) : null,
        c.mtb ? el('p', { class: 'ls-mtb' }, el('b', null, 'On the bike: '), c.mtb) : null)));
      case 'table': return el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, b.head.map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', null, b.rows.map(r => el('tr', null, r.map((c, i) => i === 0 ? el('th', { scope: 'row' }, c) : el('td', null, c)))))));
      case 'example': return el('div', { class: 'ls-example' }, el('p', { class: 'ls-kicker' }, b.kicker || 'Worked example'), el('h3', { class: 'ls-h3' }, b.title.replace(/^Worked example: /, '')),
        b.given ? el('p', null, b.given) : null, el('ol', { class: 'ls-steps' }, b.steps.map(([l, t]) => el('li', null, el('b', null, l + ': '), el('span', { class: b.plain ? '' : 'ls-mono' }, t)))),
        b.answer ? el('p', { class: 'ls-answer' }, el('b', null, 'Answer: '), b.answer) : null, b.meaning ? el('p', { class: 'ls-meaning' }, b.meaning) : null);
      case 'note': return el('aside', { class: 'ls-note ls-note--' + b.kind }, el('p', { class: 'ls-note-h' }, (b.kind === 'myth' ? 'Common mistake: ' : 'Key idea: ') + b.title), el('p', null, b.text));
      case 'level': return el('details', { class: 'ls-level-block ls-level-block--' + b.level, open: progress.level === b.level ? true : null },
        el('summary', null, el('span', { class: 'ls-level-tag' }, b.level === 'explore' ? 'Explore' : 'Engineer'), ' ', b.title), b.paras.map(p => el('p', null, p)));
      case 'visual': return L.visual ? el('figure', { class: 'ls-figure' }, L.visual(b.id)) : null;
      case 'activity': {
        const make = BUILTIN[b.id] || (L.activities || {})[b.id];
        if (!make) return null;
        if (b.id === 'mastery' || b.live) { const box = el('div'); const draw = () => put(box, make(ctx)); draw(); refreshers.push(draw); return box; }
        return make(ctx);
      }
      case 'ask': return el('div', { class: 'ls-card ls-ask-card' }, el('p', { class: 'ls-kicker' }, 'Your turn'), ctx.ask(b.q));
      default: return null;
    }
  }

  function sectionPage(sec) {
    const page = el('article', { class: 'ls-section' });
    const footStatus = el('p', { class: 'ls-section-status', 'aria-live': 'polite' });
    const drawFoot = () => {
      const st = progress.sectionState(sec.id);
      footStatus.textContent = st.complete ? `✓ Section ${sec.n} complete.` : `${st.answered} of ${st.total} activities in this section done.`;
      footStatus.classList.toggle('is-done', st.complete);
    };
    refreshers.push(drawFoot);
    page.append(el('header', { class: 'ls-section-head' },
      el('p', { class: 'ls-kicker' }, `${L.kicker} · Section ${sec.n} of ${SECTIONS.length} · about ${sec.minutes} min`),
      el('h1', { class: 'ls-h1' }, sec.title),
      el('p', { class: 'ls-hook' }, sec.hook)));
    page.append(el('div', { class: 'ls-blocks' }, sec.blocks.map(block)));
    const i = SECTIONS.indexOf(sec), prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
    drawFoot();
    page.append(el('footer', { class: 'ls-section-foot' }, footStatus,
      el('nav', { class: 'ls-pager', 'aria-label': 'Sections' },
        prev ? el('a', { href: '#' + prev.id }, el('span', null, 'Previous'), prev.title) : el('a', { href: '#start' }, el('span', null, 'Back to'), 'Overview'),
        next ? el('a', { href: '#' + next.id }, el('span', null, 'Next'), next.title) : el('a', { href: '#start' }, el('span', null, 'Finished?'), 'Lesson overview'))));
    return page;
  }

  function overview() {
    const s = progress.summary(), m = s.mastery, O = L.overview || {};
    const firstOpen = SECTIONS.find(x => !s.sections.find(y => y.id === x.id).complete) || SECTIONS[0];
    return el('article', { class: 'ls-overview' },
      el('header', { class: 'ls-hero' },
        el('div', null,
          el('p', { class: 'ls-kicker' }, O.kicker || L.kicker),
          el('h1', { class: 'ls-h1 ls-h1--big' }, L.title),
          el('p', { class: 'ls-lede' }, O.lede || ''),
          el('a', { class: 'ls-btn ls-btn--primary', href: '#' + firstOpen.id }, s.sectionsDone ? `Continue: ${firstOpen.n}. ${firstOpen.title} →` : (O.start || 'Start the lesson →')),
          el('p', { class: 'ls-small' }, O.duration || '')),
        O.questions ? el('ul', { class: 'ls-questions', 'aria-label': 'Questions this lesson answers' }, O.questions.map(t => el('li', null, t))) : null),
      el('section', { class: 'ls-card', 'aria-labelledby': 'sec-h' }, el('h2', { class: 'ls-h2', id: 'sec-h' }, 'The lesson'),
        el('ol', { class: 'ls-sec-list' }, SECTIONS.map(sec => { const st = s.sections.find(x => x.id === sec.id);
          return el('li', { class: st.complete ? 'is-done' : '' }, el('a', { href: '#' + sec.id }, el('span', { class: 'ls-sec-n' }, sec.n), el('span', { class: 'ls-sec-t' }, sec.title),
            el('span', { class: 'ls-sec-m' }, `${sec.minutes} min · ${st.complete ? '✓ done' : st.answered ? `${st.answered}/${st.total}` : 'not started'}`))); }))),
      el('section', { class: 'ls-card', 'aria-labelledby': 'lv-h' }, el('h2', { class: 'ls-h2', id: 'lv-h' }, 'Pick your level'),
        el('p', null, 'The lesson is the same at every level. The level only changes which extra explanations start open. Switch any time with the Level buttons at the top.'),
        el('ul', { class: 'ls-levels' }, L.levels.map(l => el('li', { class: progress.level === l.id ? 'is-on' : '' },
          button(l.name + (progress.level === l.id ? ' ✓' : ''), () => { progress.setLevel(l.id); ctx.rerender(); }, progress.level === l.id ? 'ls-btn--primary' : 'ls-btn--quiet'), el('span', null, l.text))))),
      el('section', { class: 'ls-card', 'aria-labelledby': 'ob-h' }, el('h2', { class: 'ls-h2', id: 'ob-h' }, 'By the end you’ll be able to'),
        el('ol', { class: 'ls-objectives' }, L.objectives.map(t => el('li', null, t)))),
      el('section', { class: 'ls-card', 'aria-labelledby': 'ma-h' }, el('h2', { class: 'ls-h2', id: 'ma-h' }, m.mastered ? MT.done : MT.todo), criteriaList(m, null)),
      O.note ? el('p', { class: 'ls-note-small' }, O.note) : null);
  }

  function show(r, focus) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); cleanups = []; refreshers = [];
    route = r;
    if (r !== 'start') progress.visit(r);
    clear(main).appendChild(r === 'start' ? overview() : sectionPage(SECTIONS.find(s => s.id === r)));
    drawChrome();
    if (focus) { const h = main.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } root.scrollIntoView({ block: 'start' }); }
  }
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
  return { summary: () => progress.summary(), progress, go, destroy: () => { cleanups.forEach(fn => fn()); if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}
