// Berm Lab — the science of cornering. The module's public entry point.
//
//   import { mount } from './berm-lab.js';
//   mount(element, {
//     studentId, storage: 'local' | 'memory' | { load, save },   // progress (default: this browser)
//     routing: 'hash' | 'memory',
//     backLink: { href, label },
//     onAttempt(record), onProgress(summary), onComplete(summary)
//   })
// Events also fire on the element: bermlab:attempt, bermlab:progress, bermlab:complete.
// Works with no options and no account, and without any AI service.

import { el, clear, button, put } from './components/dom.js';
import { createSimulator } from './components/sim.js';
import { createAnalysis } from './components/analysis.js';
import { renderArena, renderChallenge } from './components/arena.js';
import { helpContent } from './components/help.js';
import { createProgress, SECTIONS } from './logic/progress.js';
import { DEFAULTS, VARIABLES } from './logic/physics.js';
import { CHALLENGES } from './logic/challenges.js';

export const VERSION = '1.0.0';
const NAV = [['simulator', 'Simulator'], ['challenges', 'Challenge Arena'], ['model', 'The Model']];

export function mount(target, opts = {}) {
  if (!target) throw new Error('berm-lab: mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent('bermlab:' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({ studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); } });

  const status = el('p', { class: 'bl-status' });
  const nav = el('nav', { class: 'bl-nav', 'aria-label': 'Berm Lab sections' });
  const main = el('main', { class: 'bl-main', tabindex: '-1', id: 'bl-main' });
  const back = opts.backLink && opts.backLink.href ? el('a', { class: 'bl-back', href: opts.backLink.href }, el('span', { 'aria-hidden': 'true' }, '← '), opts.backLink.label || 'Back') : null;
  const restart = button('Start over', () => { if (window.confirm('Start Berm Lab over? This clears your challenges, saved experiments and settings on this device.')) { progress.reset(); go('simulator'); } }, 'bl-btn--ghost');
  const root = el('div', { class: 'blab' },
    el('a', { class: 'bl-skip', href: '#bl-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lab'),
    el('header', { class: 'bl-top' }, el('div', { class: 'bl-wrap bl-top-row' },
      el('div', { class: 'bl-top-left' }, el('p', { class: 'bl-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'MTB'), back),
      el('p', { class: 'bl-activity' }, 'Berm Lab'),
      el('div', { class: 'bl-top-right' }, status, restart))),
    el('div', { class: 'bl-navbar' }, el('div', { class: 'bl-wrap' }, nav)),
    el('div', { class: 'bl-wrap' }, main));
  clear(target).appendChild(root);

  let section = 'simulator', sub = null, first = true, cleanups = [];
  const ctx = { progress, go, refreshNav: drawNav, cleanup: fn => cleanups.push(fn) };

  function drawNav() {
    const s = progress.summary();
    const marks = { simulator: Object.keys(progress.state.explored).length ? '✓' : '', challenges: `${s.challengesDone}/${s.challengesTotal}`, model: progress.state.visited.model ? '✓' : '' };
    put(nav, el('ol', null, NAV.map(([id, label]) => el('li', null, el('a', { href: '#' + id, class: 'bl-nav-link', 'aria-current': id === section ? 'page' : null },
      el('span', null, label), marks[id] ? el('span', { class: 'bl-nav-mark', 'aria-hidden': 'true' }, marks[id]) : null)))));
    status.textContent = `Challenges ${s.challengesDone}/${s.challengesTotal} · ${s.points} pts`;
    status.setAttribute('aria-label', `Progress: ${s.challengesDone} of ${s.challengesTotal} challenges, ${s.points} of ${s.maxPoints} reasoning points`);
  }

  function simulator() {
    const page = el('div', { class: 'bl-simpage' });
    page.appendChild(el('header', { class: 'bl-hero' },
      el('div', null,
        el('p', { class: 'bl-kicker' }, 'Mathlete MTB · Engineering Lab'),
        el('h1', { class: 'bl-h1' }, 'Berm Lab'),
        el('p', { class: 'bl-lede' }, 'The science of cornering. Pick your line, set your speed, bank the berm, and watch the forces that get you round the turn.')),
      el('ul', { class: 'bl-try', 'aria-label': 'Things to try' },
        el('li', null, el('b', null, 'Try: '), 'switch Tight → Wide. What happens to the grip needed?'),
        el('li', null, el('b', null, 'Try: '), 'open the Cross-section and tilt the berm until the friction arrow disappears.'),
        el('li', null, el('b', null, 'Try: '), 'tick “Ride all three lines” and race them. Which line wins, and which needs the most grip?'))));
    const reset = button('Reset to defaults', () => { sim.pause(); sim.setConfig(DEFAULTS); progress.explored('reset'); }, 'bl-btn--ghost');
    const sim = createSimulator({ config: progress.config, settings: progress.settings, panelExtra: el('div', { class: 'bl-panel-foot' }, reset, el('a', { class: 'bl-btn bl-btn--quiet', href: '#challenges' }, 'Take on a challenge →')),
      onSetting: (k, v) => { progress.setSetting(k, v); if (k === 'view' && v === 'section') progress.explored('section'); if (k === 'allLines' && v) progress.explored('all-lines'); },
      onPlay: () => { progress.explored('played'); },
      onChange: (c, r) => {
        const prev = progress.config;
        VARIABLES.forEach(k => { if (prev[k] !== c[k]) progress.explored('changed-' + k); });
        progress.setConfig(c);
        analysis.update(c, r);
        drawNav();
      } });
    ctx.cleanup(() => sim.destroy());
    const analysis = createAnalysis({ progress, sim, onRideAll: () => { sim.rideAll(); sim.node.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    analysis.update(sim.config, sim.results);
    page.append(sim.node, analysis.node);
    return page;
  }

  function model() {
    const page = el('div', { class: 'bl-model' });
    page.appendChild(el('header', { class: 'bl-section-head' },
      el('p', { class: 'bl-kicker' }, 'The Model'),
      el('h1', { class: 'bl-h2' }, 'The maths behind a berm'),
      el('p', { class: 'bl-lede' }, 'Berm Lab runs on one simple model of a banked turn. Every number, arrow and graph in the lab comes from these equations and nothing else.')));
    page.appendChild(el('ol', { class: 'bl-chain' },
      el('li', null, el('p', { class: 'bl-chain-eq' }, 'a = v² ÷ r'), el('p', null, 'Speed and the line’s radius set the acceleration toward the centre.')),
      el('li', null, el('p', { class: 'bl-chain-eq' }, 'F = m v² ÷ r'), el('p', null, 'Mass times that acceleration: the net inward force the berm and tires must supply.')),
      el('li', null, el('p', { class: 'bl-chain-eq' }, 'N = mg(cos β + q sin β)'), el('p', null, 'The berm pushes perpendicular to itself; tilted, part of that push points into the turn.')),
      el('li', null, el('p', { class: 'bl-chain-eq' }, 'μ = |f| ÷ N'), el('p', null, 'Whatever the berm can’t supply, friction must. Zero at the matched angle tan β = v²/(rg).'))));
    page.appendChild(el('div', { class: 'bl-explains' }, ['cornerRadius', 'speedKmh', 'centripetalAcceleration', 'netInwardForce', 'bermAngle', 'normalForce', 'frictionForce', 'gravity', 'requiredGrip', 'availableGrip', 'leanAngle', 'matchedSpeed', 'totalMass', 'turnTime', 'centrifugal'].map(k => el('section', { class: 'bl-explain-card' }, helpContent(k, 'h2')))));
    page.appendChild(el('section', { class: 'bl-honest', 'aria-labelledby': 'honest-h' }, helpContent('model', 'h2'),
      el('p', { class: 'bl-note' }, 'Berm Lab is for learning maths and physics. It isn’t advice about how to ride, what equipment to use, or what speeds, angles or grip are safe.')));
    page.appendChild(el('p', null, el('a', { class: 'bl-btn bl-btn--primary', href: '#challenges' }, 'Put it to work: the Challenge Arena →')));
    return page;
  }

  function show(sec, s, focus) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); cleanups = [];
    section = sec; sub = s;
    progress.visit(sec);
    const view = { simulator, challenges: () => (s ? renderChallenge(ctx, s) : renderArena(ctx)), model }[sec];
    clear(main).appendChild(view());
    drawNav();
    if (focus) { const h = main.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } root.scrollIntoView({ block: 'start' }); }
  }
  const parse = h => { const [a, b] = String(h || '').replace(/^#/, '').split('/'); return { section: SECTIONS.includes(a) ? a : 'simulator', sub: b && CHALLENGES.some(c => c.id === b) ? b : null }; };
  function go(sec, s) { if (routing === 'hash') { const h = '#' + sec + (s ? '/' + s : ''); if (location.hash === h) show(sec, s, true); else location.hash = h; } else show(sec, s || null, true); }
  root.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('bl-skip')) return;
    const p = parse(a.getAttribute('href'));
    if (routing === 'memory' || location.hash === a.getAttribute('href')) { e.preventDefault(); show(p.section, p.sub, true); }
  });
  const onHash = () => { const p = parse(location.hash); show(p.section, p.sub, !first); first = false; };
  if (routing === 'hash') { window.addEventListener('hashchange', onHash); onHash(); }
  else { show('simulator', null, false); first = false; }
  return { summary: () => progress.summary(), go, destroy: () => { cleanups.forEach(fn => fn()); if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}

if (typeof window !== 'undefined') window.BermLab = { mount, VERSION };
