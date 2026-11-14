// Jump Trajectory Lab: the module's public entry point.
//
//   import { mount } from './jump-lab.js';
//   mount(element, {
//     studentId, storage: 'local' | 'memory' | { load, save },   // progress (default: this browser)
//     routing: 'hash' | 'memory',
//     backLink: { href, label },          // "Back to Algebra 1"
//     onAttempt(record), onProgress(summary), onComplete(summary)
//   })
// Events also fire on the element: jumplab:attempt, jumplab:progress, jumplab:complete.
// Works with no options and no account.

import { el, clear, button, reducedMotion } from './components/dom.js';
import { createScene } from './components/scene.js';
import { createSimulator } from './components/explore.js';
import { renderLearn } from './components/learn.js';
import { renderDecoder } from './components/decoder.js';
import { renderChallenges } from './components/missions.js';
import { ask } from './components/ask.js';
import { createProgress, SECTIONS, MODULES } from './logic/progress.js';
import { MISCONCEPTIONS } from './logic/validate.js';
import { HOOK } from './logic/problems.js';
import { jumpModel, DEFAULT } from './logic/quadratic.js';

export const VERSION = '1.0.0';
const NAV = [['overview', 'Overview'], ['explore', 'Explore'], ['learn', 'Learn'], ['decoder', 'Equation Decoder'], ['challenges', 'Challenges']];

export function mount(target, opts = {}) {
  if (!target) throw new Error('jump-lab: mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent('jumplab:' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({ studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); } });

  const status = el('p', { class: 'jl-status' });
  const nav = el('nav', { class: 'jl-nav', 'aria-label': 'Lab sections' });
  const main = el('main', { class: 'jl-main', tabindex: '-1', id: 'jl-main' });
  const back = opts.backLink && opts.backLink.href ? el('a', { class: 'jl-back', href: opts.backLink.href }, el('span', { 'aria-hidden': 'true' }, '← '), opts.backLink.label || 'Back') : null;
  const restart = button('Restart', () => { if (window.confirm('Start the lab over? This clears your progress in this lab on this device.')) { progress.reset(); go('overview'); } }, 'jl-btn--ghost');
  const root = el('div', { class: 'jlab' },
    el('a', { class: 'jl-skip', href: '#jl-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lab'),
    el('header', { class: 'jl-top' }, el('div', { class: 'jl-wrap jl-top-row' },
      el('div', { class: 'jl-top-left' }, el('p', { class: 'jl-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), back),
      el('p', { class: 'jl-activity' }, 'Jump Trajectory Lab'),
      el('div', { class: 'jl-top-right' }, status, restart))),
    el('div', { class: 'jl-navbar' }, el('div', { class: 'jl-wrap' }, nav)),
    el('div', { class: 'jl-wrap' }, main));
  clear(target).appendChild(root);

  let section = 'overview', sub = null, first = true;
  const ctx = { progress, jump: { ...DEFAULT }, MISCONCEPTIONS, go, refreshNav: drawNav, rerender: () => show(section, sub, false) };

  function drawNav() {
    const s = progress.summary();
    const marks = { overview: s.hook ? '✓' : '', explore: progress.state.explored.played || progress.state.explored['changed-H'] ? '✓' : '', learn: `${s.modules.done}/${s.modules.total}`, decoder: Object.keys(progress.state.decoder).length >= 5 ? '✓' : '', challenges: `${s.missionsDone}/6` };
    clear(nav).appendChild(el('ol', null, NAV.map(([id, label]) => el('li', null, el('a', { href: '#' + id, class: 'jl-nav-link', 'aria-current': id === section ? 'page' : null },
      el('span', null, label), marks[id] ? el('span', { class: 'jl-nav-mark', 'aria-hidden': 'true' }, marks[id]) : null)))));
    status.textContent = `Modules ${s.modules.done}/5 · Missions ${s.missionsDone}/6 · ${s.score} pts`;
    status.setAttribute('aria-label', `Progress: ${s.modules.done} of 5 modules, ${s.missionsDone} of 6 missions, ${s.score} of ${s.maxScore} points`);
  }

  function overview() {
    const page = el('div', { class: 'jl-overview' });
    const m = jumpModel(DEFAULT.L, DEFAULT.H), scene = createScene();
    let raf = 0, x = 0;
    const fly = () => {
      cancelAnimationFrame(raf);
      if (reducedMotion()) { scene.update({ model: m, rider: m.vertex.x, grid: true }); return; }
      let last = performance.now(); x = 0;
      const tick = t => { x += (t - last) * m.L / 2200; last = t; if (x >= m.L) { x = m.L; scene.update({ model: m, rider: x, grid: true }); return; } scene.update({ model: m, rider: x, grid: true }); raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    };
    scene.update({ model: m, rider: 0, grid: true });
    page.appendChild(el('div', { class: 'jl-hero' },
      el('div', { class: 'jl-hero-text' },
        el('p', { class: 'jl-kicker' }, 'Algebra 1 · Quadratic functions'),
        el('h1', { class: 'jl-h1' }, 'Jump Trajectory Lab'),
        el('p', { class: 'jl-lede' }, 'Every jump has a shape. Every shape has math behind it.')),
      el('div', { class: 'jl-hero-scene' }, scene.node, el('div', { class: 'jl-row' }, button('▶ Play', fly, 'jl-btn--quiet'), el('span', { class: 'jl-note' }, 'A simplified model of a jump, drawn to scale.')))));
    fly();
    page.appendChild(el('div', { class: 'jl-hook' },
      el('p', null, 'You’re watching a rider hit a jump. They leave the takeoff at one elevation, rise into the air, and land at the same elevation on the other side.'),
      el('p', { class: 'jl-question' }, 'How could we use math to describe the shape of that flight?')));
    const enter = el('a', { class: 'jl-btn jl-btn--primary jl-btn--big', href: '#explore' }, 'Enter the lab →');
    page.appendChild(ask({ ...HOOK, hints: [], solution: HOOK.explain }, { progress, onDone: r => { progress.hook(r.correct ? 'parabola' : 'other', r.correct); drawNav(); } }));
    page.appendChild(el('p', { class: 'jl-enter' }, enter));
    page.appendChild(el('ol', { class: 'jl-stages' }, [['Explore', 'Change the jump and watch the math change.', 'explore'], ['Learn', 'Parabola, vertex, zeros, symmetry, coefficient.', 'learn'], ['Equation Decoder', 'Three equations, one jump.', 'decoder'], ['Challenges', 'Six missions for the jump-design team.', 'challenges']]
      .map(([t, d, h], i) => el('li', null, el('a', { href: '#' + h }, el('span', { class: 'jl-num' }, String(i + 1)), el('b', null, t), el('span', null, d))))));
    return page;
  }

  function explore() {
    const page = el('div', { class: 'jl-explore' });
    page.appendChild(el('header', { class: 'jl-section-head' }, el('p', { class: 'jl-kicker' }, 'Explore'), el('h2', { class: 'jl-h2' }, 'The jump simulator'),
      el('p', { class: 'jl-lede' }, 'Change the jump distance (L) and the maximum height (H). The jump, the graph, the equation and every number update together, because they all come from one equation.')));
    const sim = createSimulator(ctx, { L: ctx.jump.L, H: ctx.jump.H, onChange: m => { ctx.jump = { L: m.L, H: m.H }; } });
    page.appendChild(sim.node);
    page.appendChild(el('p', { class: 'jl-note' }, 'These are illustrative numbers for a math model, not recommended riding dimensions.'));
    page.appendChild(el('section', { class: 'jl-block', 'aria-labelledby': 'try-title' }, el('h2', { class: 'jl-h3', id: 'try-title' }, 'Things to try'),
      el('ul', { class: 'jl-prompts' }, [
        'Can you make a wider parabola without changing the maximum height?',
        'Can you increase the maximum height without changing the landing position?',
        'What happens to the vertex when the horizontal distance doubles (say 8 m → 16 m)?',
        'Can two different jumps have the same leading coefficient? (Try 6 m × 1.5 m, then 12 m × 6 m, and compare a.)'
      ].map(t => el('li', null, t))),
      el('p', null, el('a', { class: 'jl-btn jl-btn--primary', href: '#learn' }, 'Next: learn what you’re seeing →'))));
    return page;
  }

  function show(sec, s, focus) {
    section = sec; sub = s;
    progress.visit(sec);
    const view = { overview, explore, learn: () => renderLearn(ctx, s), decoder: () => renderDecoder(ctx), challenges: () => renderChallenges(ctx, s) }[sec];
    clear(main).appendChild(view());
    drawNav();
    if (focus) { const h = main.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } root.scrollIntoView({ block: 'start' }); }
  }
  const parse = h => { const [a, b] = String(h || '').replace(/^#/, '').split('/'); return { section: SECTIONS.includes(a) ? a : 'overview', sub: b || null }; };
  function go(sec, s) { if (routing === 'hash') { const h = '#' + sec + (s ? '/' + s : ''); if (location.hash === h) show(sec, s, true); else location.hash = h; } else show(sec, s || null, true); }
  root.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('jl-skip')) return;
    const p = parse(a.getAttribute('href'));
    if (routing === 'memory' || location.hash === a.getAttribute('href')) { e.preventDefault(); show(p.section, p.sub, true); }
  });
  const onHash = () => { const p = parse(location.hash); show(p.section, p.sub, !first); first = false; };
  if (routing === 'hash') { window.addEventListener('hashchange', onHash); onHash(); }
  else { show('overview', null, false); first = false; }
  return { summary: () => progress.summary(), go, destroy: () => { if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}

if (typeof window !== 'undefined') window.JumpTrajectoryLab = { mount, VERSION };
