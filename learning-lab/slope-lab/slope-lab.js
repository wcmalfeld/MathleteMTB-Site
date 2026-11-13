// Slope & Linear Relationships Lab: the module's one public entry point.
//
//   import { mount } from './slope-lab.js';
//   const lab = mount(document.getElementById('slope-lab'), {
//     studentId:  'abc123',            // optional: keeps each student's progress separate
//     storage:    'local',             // 'local' (default, this browser) | 'memory' | { load(key), save(key, data) }
//     routing:    'hash',              // 'hash' (default, back button works) | 'memory' (host owns the URL)
//     onAttempt:  record => {},        // every answer: question, answer, right or not, attempt number, hints
//     onProgress: summary => {},       // after any change
//     onComplete: summary => {}        // once, when the module is finished
//   });
//   lab.summary(); lab.go('practice'); lab.destroy();
//
// The same events are also dispatched on the mount element as
// 'slopelab:attempt', 'slopelab:progress' and 'slopelab:complete'.
// Nothing here depends on the rest of the Mathlete site: no login, no site
// navigation, no shared styles. Everything works when no options are given.

import { el, clear } from './components/dom.js';
import { createProgress, SECTIONS } from './logic/progress.js';
import { renderIntro } from './components/intro.js';
import { renderLearn } from './components/learn.js';
import { renderExplore } from './components/explore.js';
import { renderPractice, renderChallenge } from './components/practice.js';
import { renderSummary } from './components/summary.js';
import { TOPICS } from './content/lessons.js';

export const VERSION = '1.0.0';

const NAV = [
  ['intro', 'Introduction'], ['learn', 'Learn'], ['explore', 'Explore'], ['practice', 'Practice'], ['challenge', 'Challenge'], ['progress', 'My Progress']
];

export function mount(target, opts = {}) {
  if (!target) throw new Error('slope-lab: mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (name, detail) => { try { target.dispatchEvent(new CustomEvent('slopelab:' + name, { detail })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({
    studentId: opts.studentId, storage: opts.storage, initial: opts.initialProgress,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); }
  });

  const nav = el('nav', { class: 'sl-nav', 'aria-label': 'Lab sections' });
  const main = el('main', { class: 'sl-main', id: 'sl-main', tabindex: '-1' });
  const root = el('div', { class: 'slab' },
    el('a', { class: 'sl-skip', href: '#sl-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lesson'),
    el('header', { class: 'sl-top' }, el('div', { class: 'sl-wrap sl-top-row' },
      el('p', { class: 'sl-brand' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), ' ', el('span', { class: 'sl-brand-sub' }, 'Slope & Linear Relationships Lab')),
      el('p', { class: 'sl-saved', 'aria-live': 'polite' }))),
    el('div', { class: 'sl-navbar' }, el('div', { class: 'sl-wrap' }, nav)),
    el('div', { class: 'sl-wrap' }, main));
  clear(target).appendChild(root);

  let section = 'intro', sub = null, first = true;
  const ctx = { progress, studentId: opts.studentId || null, go, rerender: () => show(section, sub, false) };

  function parse(hash) {
    const [a, b] = String(hash || '').replace(/^#/, '').split('/');
    return { section: SECTIONS.includes(a) ? a : 'intro', sub: b || null };
  }

  function drawNav() {
    const s = progress.summary();
    const status = {
      intro: s.visited.intro ? '✓' : '',
      learn: `${s.topics.done}/${s.topics.total}`,
      explore: `${s.challenges.done}/${s.challenges.total}`,
      practice: `${s.practiceAttempted}/24`,
      challenge: `${s.transfer.attempted}/${s.transfer.total}`,
      progress: s.complete ? '✓' : ''
    };
    const words = {
      learn: `${s.topics.done} of ${s.topics.total} topics opened`, explore: `${s.challenges.done} of ${s.challenges.total} challenges done`,
      practice: `${s.practiceAttempted} of 24 questions tried`, challenge: `${s.transfer.attempted} of ${s.transfer.total} questions tried`
    };
    clear(nav).appendChild(el('ol', null, NAV.map(([id, label]) => el('li', null,
      el('a', { href: '#' + id, 'aria-current': id === section ? 'page' : null, class: 'sl-nav-link' },
        el('span', { class: 'sl-nav-label' }, label),
        status[id] ? el('span', { class: 'sl-nav-status', 'aria-hidden': 'true' }, status[id]) : null,
        words[id] ? el('span', { class: 'sl-sr' }, ', ' + words[id]) : null)))));
  }

  function show(sec, subId, focus) {
    section = sec; sub = subId;
    progress.visit(sec);
    const render = {
      intro: () => renderIntro(ctx),
      learn: () => renderLearn(ctx, subId || (TOPICS.find(t => !progress.state.topics[t.id]) || TOPICS[0]).id),
      explore: () => renderExplore(ctx),
      practice: () => renderPractice(ctx, subId),
      challenge: () => renderChallenge(ctx),
      progress: () => renderSummary(ctx)
    }[sec];
    clear(main).appendChild(render());
    drawNav();
    if (focus) {
      const h = main.querySelector('h1, h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      root.scrollIntoView({ block: 'start' });
    }
  }

  function go(sec, subId) {
    if (routing === 'hash') {
      const h = '#' + sec + (subId ? '/' + subId : '');
      if (location.hash === h) show(sec, subId || null, true); else location.hash = h;
    } else show(sec, subId || null, true);
  }

  // In-lab links all start with '#'. With hash routing the browser handles
  // them (and the back button works); in memory mode we intercept them.
  root.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('sl-skip')) return;
    const p = parse(a.getAttribute('href'));
    if (routing === 'memory') { e.preventDefault(); show(p.section, p.sub, true); }
    else if (location.hash === a.getAttribute('href')) { e.preventDefault(); show(p.section, p.sub, true); }
  });
  const onHash = () => { const p = parse(location.hash); show(p.section, p.sub, !first); first = false; };
  if (routing === 'hash') window.addEventListener('hashchange', onHash);

  // Saved indicator
  const saved = root.querySelector('.sl-saved');
  let ready = false;
  progress.onChange(() => { drawNav(); if (!ready) return; saved.textContent = 'Progress saved'; clearTimeout(saved._t); saved._t = setTimeout(() => { saved.textContent = ''; }, 1600); });

  if (routing === 'hash') onHash();
  else { const p = parse(opts.start ? '#' + opts.start : ''); show(p.section, p.sub, false); first = false; }
  ready = true;

  return {
    summary: () => progress.summary(),
    go,
    reset: () => { progress.reset(); go('intro'); },
    destroy: () => { if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); }
  };
}

// For hosts that don't use modules: window.SlopeLab.mount(el, opts)
if (typeof window !== 'undefined') window.SlopeLab = { mount, VERSION };
