// Newton's Laws of Motion: an interactive lesson (Mathlete MTB, Trail
// Physics, Module 7). The module's public entry point.
//
//   import { mount } from './newtons-laws.js';
//   mount(element, {
//     studentId, storage: 'local' | 'memory' | { load, save },   // progress (default: this browser)
//     routing: 'hash' | 'memory',
//     backLink: { href, label },
//     onAttempt(record), onProgress(summary), onComplete(summary)
//   })
// Events also fire on the element: newtonslaws:attempt, :progress, :complete.
// Works with no options and no account, and without any AI service.

import { el, clear, button, put } from './components/dom.js';
import { ask } from './components/ask.js';
import { visual } from './components/visuals.js';
import { ACTIVITIES } from './components/activities.js';
import { createProgress } from './logic/progress.js';
import { SECTIONS, QUESTIONS, OBJECTIVES, LEVELS } from './logic/lesson.js';

export const VERSION = '1.0.0';
const ROUTES = ['start', ...SECTIONS.map(s => s.id)];

export function mount(target, opts = {}) {
  if (!target) throw new Error('newtons-laws: mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent('newtonslaws:' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({ studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); } });

  const status = el('p', { class: 'nl-status' });
  const levelSeg = el('div', { class: 'nl-segs nl-level', role: 'radiogroup', 'aria-label': 'Level of support' });
  const nav = el('nav', { class: 'nl-nav', 'aria-label': 'Lesson sections' });
  const main = el('main', { class: 'nl-main', tabindex: '-1', id: 'nl-main' });
  const back = opts.backLink && opts.backLink.href ? el('a', { class: 'nl-back', href: opts.backLink.href }, el('span', { 'aria-hidden': 'true' }, '← '), opts.backLink.label || 'Back') : null;
  const restart = button('Start over', () => { if (window.confirm('Start the lesson over? This clears your answers, experiments and notes on this device.')) { progress.reset(); go('start'); } }, 'nl-btn--ghost');
  const root = el('div', { class: 'nlab' },
    el('a', { class: 'nl-skip', href: '#nl-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lesson'),
    el('header', { class: 'nl-top' }, el('div', { class: 'nl-wrap nl-top-row' },
      el('div', { class: 'nl-top-left' }, el('p', { class: 'nl-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), back),
      el('p', { class: 'nl-titlebar' }, 'Newton’s Laws of Motion'),
      el('div', { class: 'nl-top-right' }, el('span', { class: 'nl-mini-label' }, 'Level'), levelSeg, status, restart))),
    el('div', { class: 'nl-navbar' }, el('div', { class: 'nl-wrap' }, nav)),
    el('div', { class: 'nl-wrap' }, main));
  clear(target).appendChild(root);

  let route = 'start', first = true, cleanups = [], refreshers = [];
  const ctx = {
    progress, go,
    cleanup: fn => cleanups.push(fn),
    refresh: () => { drawChrome(); refreshers.forEach(fn => { try { fn(); } catch (e) { /* keep going */ } }); },
    rerender: () => show(route, false)
  };

  function drawChrome() {
    const s = progress.summary();
    put(nav, el('ol', null, ROUTES.map(id => {
      const sec = SECTIONS.find(x => x.id === id), st = sec && s.sections.find(x => x.id === id);
      return el('li', null, el('a', { href: '#' + id, class: 'nl-nav-link', 'aria-current': id === route ? 'page' : null },
        el('span', null, sec ? `${sec.n}. ${sec.title.replace(/^Newton’s (\w+) Law: /, '$1 law: ')}` : 'Overview'),
        st && st.complete ? el('span', { class: 'nl-nav-mark', 'aria-label': 'complete' }, '✓') : st && st.answered ? el('span', { class: 'nl-nav-mark nl-nav-mark--part' }, `${st.answered}/${st.total}`) : null));
    })));
    status.textContent = `${s.sectionsDone}/${s.sectionsTotal} sections${s.mastered ? ' · ★ mastered' : ''}`;
    status.setAttribute('aria-label', `Progress: ${s.sectionsDone} of ${s.sectionsTotal} sections complete${s.mastered ? ', lesson mastered' : ''}`);
    put(levelSeg, LEVELS.map(l => { const b = el('button', { type: 'button', role: 'radio', class: 'nl-seg', 'aria-checked': String(progress.level === l.id), title: l.text }, l.name);
      b.addEventListener('click', () => { if (progress.level !== l.id) { progress.setLevel(l.id); ctx.rerender(); } }); return b; }));
  }

  // ---------- blocks ----------
  function block(b) {
    switch (b.t) {
      case 'p': return el('p', { class: 'nl-p' }, b.text);
      case 'law': return el('div', { class: 'nl-law' }, el('p', { class: 'nl-law-name' }, b.name), el('p', { class: 'nl-law-text' }, b.text));
      case 'eq': return el('div', { class: 'nl-eq' }, el('p', { class: 'nl-eq-main' }, b.eq),
        b.where ? el('dl', { class: 'nl-where' }, b.where.map(([s, m]) => el('div', null, el('dt', null, s), el('dd', null, m)))) : null);
      case 'cards': return el('ul', { class: 'nl-cards' }, b.items.map(c => el('li', { class: 'nl-mtb-card' }, el('h3', { class: 'nl-card-h' }, c.h), el('p', null, c.text),
        c.mtb ? el('p', { class: 'nl-mtb' }, el('b', null, 'On the bike: '), c.mtb) : null)));
      case 'table': return el('div', { class: 'nl-table-wrap' }, el('table', { class: 'nl-table' }, el('thead', null, el('tr', null, b.head.map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', null, b.rows.map(r => el('tr', null, r.map((c, i) => i === 0 ? el('th', { scope: 'row' }, c) : el('td', null, c)))))));
      case 'example': return el('div', { class: 'nl-example' }, el('p', { class: 'nl-kicker' }, 'Worked example'), el('h3', { class: 'nl-h3' }, b.title.replace(/^Worked example: /, '')),
        el('p', null, b.given), el('ol', { class: 'nl-steps' }, b.steps.map(([l, t]) => el('li', null, el('b', null, l + ': '), el('span', { class: 'nl-mono' }, t)))),
        el('p', { class: 'nl-answer' }, el('b', null, 'Answer: '), b.answer), b.meaning ? el('p', { class: 'nl-meaning' }, b.meaning) : null);
      case 'note': return el('aside', { class: 'nl-note nl-note--' + b.kind }, el('p', { class: 'nl-note-h' }, (b.kind === 'myth' ? 'Common mistake: ' : 'Key idea: ') + b.title), el('p', null, b.text));
      case 'level': {
        const open = progress.level === b.level;
        const d = el('details', { class: 'nl-level-block nl-level-block--' + b.level, open: open ? true : null },
          el('summary', null, el('span', { class: 'nl-level-tag' }, b.level === 'explore' ? 'Explore' : 'Engineer'), ' ', b.title),
          b.paras.map(p => el('p', null, p)));
        return d;
      }
      case 'visual': return el('figure', { class: 'nl-figure' }, visual(b.id));
      case 'activity': {
        const make = ACTIVITIES[b.id];
        if (!make) return null;
        if (b.id === 'mastery') { const box = el('div'); const draw = () => put(box, make(ctx)); draw(); refreshers.push(draw); return box; }
        return make(ctx);
      }
      case 'ask': return el('div', { class: 'nl-card nl-ask-card' }, el('p', { class: 'nl-kicker' }, 'Your turn'),
        ask({ ...QUESTIONS[b.q], id: b.q }, { progress, onDone: () => ctx.refresh() }));
      default: return null;
    }
  }

  function sectionPage(sec) {
    const page = el('article', { class: 'nl-section' });
    const footStatus = el('p', { class: 'nl-section-status', 'aria-live': 'polite' });
    const drawFoot = () => {
      const st = progress.sectionState(sec.id);
      footStatus.textContent = st.complete ? `✓ Section ${sec.n} complete.` : `${st.answered} of ${st.total} activities in this section done.`;
      footStatus.classList.toggle('is-done', st.complete);
    };
    refreshers.push(drawFoot);
    page.append(el('header', { class: 'nl-section-head' },
      el('p', { class: 'nl-kicker' }, `Trail Physics · Module 7 · Section ${sec.n} of ${SECTIONS.length} · about ${sec.minutes} min`),
      el('h1', { class: 'nl-h1' }, sec.title),
      el('p', { class: 'nl-hook' }, sec.hook)));
    page.append(el('div', { class: 'nl-blocks' }, sec.blocks.map(block)));
    const i = SECTIONS.indexOf(sec), prev = SECTIONS[i - 1], next = SECTIONS[i + 1];
    drawFoot();
    page.append(el('footer', { class: 'nl-section-foot' }, footStatus,
      el('nav', { class: 'nl-pager', 'aria-label': 'Sections' },
        prev ? el('a', { href: '#' + prev.id }, el('span', null, 'Previous'), prev.title) : el('a', { href: '#start' }, el('span', null, 'Back to'), 'Overview'),
        next ? el('a', { href: '#' + next.id }, el('span', null, 'Next'), next.title) : el('a', { href: '#start' }, el('span', null, 'Finished?'), 'Lesson overview'))));
    return page;
  }

  function overview() {
    const s = progress.summary(), m = s.mastery;
    const firstOpen = SECTIONS.find(x => !s.sections.find(y => y.id === x.id).complete) || SECTIONS[0];
    return el('article', { class: 'nl-overview' },
      el('header', { class: 'nl-hero' },
        el('div', null,
          el('p', { class: 'nl-kicker' }, 'Trail Physics · Unit 3: Forces & Cornering · Module 7'),
          el('h1', { class: 'nl-h1 nl-h1--big' }, 'Newton’s Laws of Motion'),
          el('p', { class: 'nl-lede' }, 'Why does a bike keep rolling when you stop pedalling? Why does a heavier rider need more force to get going? Why does the ground push back on your tires? Three laws explain all of it, and you’ll use the maths to prove it.'),
          el('a', { class: 'nl-btn nl-btn--primary', href: '#' + firstOpen.id }, s.sectionsDone ? `Continue: ${firstOpen.n}. ${firstOpen.title} →` : 'Start the lesson →'),
          el('p', { class: 'nl-small' }, '45–60 minutes in seven sections. Your progress is saved, so you can stop and come back.')),
        el('ul', { class: 'nl-questions', 'aria-label': 'Questions this lesson answers' },
          ['Why does a rider keep moving after they stop pedalling?', 'Why does a heavier rider need more force to accelerate at the same rate?', 'Why does the ground push back against a tire?', 'What forces act on a bike climbing a steep trail?']
            .map(t => el('li', null, t)))),
      el('section', { class: 'nl-card', 'aria-labelledby': 'sec-h' }, el('h2', { class: 'nl-h2', id: 'sec-h' }, 'The lesson'),
        el('ol', { class: 'nl-sec-list' }, SECTIONS.map(sec => { const st = s.sections.find(x => x.id === sec.id);
          return el('li', { class: st.complete ? 'is-done' : '' }, el('a', { href: '#' + sec.id }, el('span', { class: 'nl-sec-n' }, sec.n), el('span', { class: 'nl-sec-t' }, sec.title),
            el('span', { class: 'nl-sec-m' }, `${sec.minutes} min · ${st.complete ? '✓ done' : st.answered ? `${st.answered}/${st.total}` : 'not started'}`))); }))),
      el('section', { class: 'nl-card', 'aria-labelledby': 'lv-h' }, el('h2', { class: 'nl-h2', id: 'lv-h' }, 'Pick your level'),
        el('p', null, 'The physics is the same at every level. The level only changes which extra explanations start open. Switch any time with the Level buttons at the top.'),
        el('ul', { class: 'nl-levels' }, LEVELS.map(l => el('li', { class: progress.level === l.id ? 'is-on' : '' },
          button(l.name + (progress.level === l.id ? ' ✓' : ''), () => { progress.setLevel(l.id); ctx.rerender(); }, progress.level === l.id ? 'nl-btn--primary' : 'nl-btn--quiet'), el('span', null, l.text))))),
      el('section', { class: 'nl-card', 'aria-labelledby': 'ob-h' }, el('h2', { class: 'nl-h2', id: 'ob-h' }, 'By the end you’ll be able to'),
        el('ol', { class: 'nl-objectives' }, OBJECTIVES.map(t => el('li', null, t)))),
      el('section', { class: 'nl-card', 'aria-labelledby': 'ma-h' }, el('h2', { class: 'nl-h2', id: 'ma-h' }, m.mastered ? '★ Mastered' : 'What mastery takes'),
        el('ul', { class: 'nl-criteria' }, m.criteria.map(c => el('li', { class: c.met ? 'is-met' : '' }, el('span', { class: 'nl-crit-mark', 'aria-hidden': 'true' }, c.met ? '✓' : '○'), el('span', null, c.label, c.met ? el('span', { class: 'nl-sr' }, ' (met)') : null))))),
      el('p', { class: 'nl-note-small' }, 'This lesson teaches physics with simplified models. Nothing in it is riding, equipment or safety advice.'));
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
    if (!a || a.classList.contains('nl-skip')) return;
    const r = parse(a.getAttribute('href'));
    if (routing === 'memory' || location.hash === a.getAttribute('href')) { e.preventDefault(); show(r, true); }
  });
  const onHash = () => { show(parse(location.hash), !first); first = false; };
  if (routing === 'hash') { window.addEventListener('hashchange', onHash); onHash(); }
  else { show('start', false); first = false; }
  return { summary: () => progress.summary(), go, destroy: () => { cleanups.forEach(fn => fn()); if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}

if (typeof window !== 'undefined') window.NewtonsLaws = { mount, VERSION };
