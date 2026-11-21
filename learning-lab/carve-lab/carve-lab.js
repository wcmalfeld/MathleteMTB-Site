// Carve Lab — the science of turning. The module's public entry point.
//
//   import { mount } from './carve-lab.js';
//   mount(element, {
//     studentId, storage: 'local' | 'memory' | { load, save },   // progress (default: this browser)
//     routing: 'hash' | 'memory',
//     backLink: { href, label },
//     onAttempt(record), onProgress(summary), onComplete(summary)
//   })
// Events also fire on the element: carvelab:attempt, carvelab:progress, carvelab:complete.
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
  if (!target) throw new Error('carve-lab: mount() needs an element');
  const routing = opts.routing === 'memory' ? 'memory' : 'hash';
  const fire = (n, d) => { try { target.dispatchEvent(new CustomEvent('carvelab:' + n, { detail: d })); } catch (e) { /* old browsers */ } };
  const progress = createProgress({ studentId: opts.studentId, storage: opts.storage,
    onAttempt: r => { fire('attempt', r); if (opts.onAttempt) opts.onAttempt(r); },
    onProgress: s => { fire('progress', s); if (opts.onProgress) opts.onProgress(s); },
    onComplete: s => { fire('complete', s); if (opts.onComplete) opts.onComplete(s); } });

  const status = el('p', { class: 'cl-status' });
  const nav = el('nav', { class: 'cl-nav', 'aria-label': 'Carve Lab sections' });
  const main = el('main', { class: 'cl-main', tabindex: '-1', id: 'cl-main' });
  const back = opts.backLink && opts.backLink.href ? el('a', { class: 'cl-back', href: opts.backLink.href }, el('span', { 'aria-hidden': 'true' }, '← '), opts.backLink.label || 'Back') : null;
  const restart = button('Start over', () => { if (window.confirm('Start Carve Lab over? This clears your challenges, saved setups and settings on this device.')) { progress.reset(); go('simulator'); } }, 'cl-btn--ghost');
  const root = el('div', { class: 'clab' },
    el('a', { class: 'cl-skip', href: '#cl-main', onclick: e => { e.preventDefault(); main.focus(); } }, 'Skip to the lab'),
    el('header', { class: 'cl-top' }, el('div', { class: 'cl-wrap cl-top-row' },
      el('div', { class: 'cl-top-left' }, el('p', { class: 'cl-logo' }, 'Mathlete', el('span', { 'aria-hidden': 'true' }, '.'), 'SKI'), back),
      el('p', { class: 'cl-activity' }, 'Carve Lab'),
      el('div', { class: 'cl-top-right' }, status, restart))),
    el('div', { class: 'cl-navbar' }, el('div', { class: 'cl-wrap' }, nav)),
    el('div', { class: 'cl-wrap' }, main));
  clear(target).appendChild(root);

  let section = 'simulator', sub = null, first = true, cleanups = [];
  const ctx = { progress, go, refreshNav: drawNav, cleanup: fn => cleanups.push(fn) };

  function drawNav() {
    const s = progress.summary();
    const marks = { simulator: Object.keys(progress.state.explored).length ? '✓' : '', challenges: `${s.challengesDone}/${s.challengesTotal}`, model: progress.state.visited.model ? '✓' : '' };
    put(nav, el('ol', null, NAV.map(([id, label]) => el('li', null, el('a', { href: '#' + id, class: 'cl-nav-link', 'aria-current': id === section ? 'page' : null },
      el('span', null, label), marks[id] ? el('span', { class: 'cl-nav-mark', 'aria-hidden': 'true' }, marks[id]) : null)))));
    status.textContent = `Challenges ${s.challengesDone}/${s.challengesTotal} · ${s.points} pts`;
    status.setAttribute('aria-label', `Progress: ${s.challengesDone} of ${s.challengesTotal} challenges, ${s.points} of ${s.maxPoints} reasoning points`);
  }

  function simulator() {
    const page = el('div', { class: 'cl-simpage' });
    page.appendChild(el('header', { class: 'cl-hero' },
      el('div', null,
        el('p', { class: 'cl-kicker' }, 'Mathlete Ski · Tuning Bench'),
        el('h1', { class: 'cl-h1' }, 'Carve Lab'),
        el('p', { class: 'cl-lede' }, 'The science of turning. Tip the ski, change the speed, and watch the maths of a carved turn happen on the snow.')),
      el('ul', { class: 'cl-try', 'aria-label': 'Things to try' },
        el('li', null, el('b', null, 'Try: '), 'press ▶ Start turn, then tip the ski further. What happens to the line?'),
        el('li', null, el('b', null, 'Try: '), 'double the speed. Watch the acceleration arrow, and the numbers below.'),
        el('li', null, el('b', null, 'Try: '), 'change only the mass. Which numbers don’t move?'))));
    const reset = button('Reset to defaults', () => { sim.pause(); sim.setConfig(DEFAULTS); progress.explored('reset'); }, 'cl-btn--ghost');
    const sim = createSimulator({ config: progress.config, settings: progress.settings, panelExtra: el('div', { class: 'cl-panel-foot' }, reset, el('a', { class: 'cl-btn cl-btn--quiet', href: '#challenges' }, 'Take on a challenge →')),
      onSetting: (k, v) => { progress.setSetting(k, v); if (k === 'mode' && v === 'linked') progress.explored('linked'); },
      onPlay: () => { progress.explored('played'); },
      onChange: (c, r) => {
        const prev = progress.config;
        VARIABLES.forEach(k => { if (prev[k] !== c[k]) progress.explored('changed-' + k); });
        progress.setConfig(c);
        analysis.update(c, r);
        drawNav();
      } });
    ctx.cleanup(() => sim.destroy());
    const analysis = createAnalysis({ progress, sim });
    analysis.update(sim.config, sim.results);
    page.append(sim.node, analysis.node);
    return page;
  }

  function model() {
    const page = el('div', { class: 'cl-model' });
    page.appendChild(el('header', { class: 'cl-section-head' },
      el('p', { class: 'cl-kicker' }, 'The Model'),
      el('h1', { class: 'cl-h2' }, 'The maths behind a carved turn'),
      el('p', { class: 'cl-lede' }, 'Carve Lab runs on three equations. Every number, arrow and graph in the lab comes from these and nothing else.')));
    page.appendChild(el('ol', { class: 'cl-chain' },
      el('li', null, el('p', { class: 'cl-chain-eq' }, 'R = Rsc × cos θ'), el('p', null, 'The ski’s shape and how far it’s tipped set the size of the turn.')),
      el('li', null, el('p', { class: 'cl-chain-eq' }, 'a = v² ÷ R'), el('p', null, 'The speed and the size of the turn set the acceleration toward its centre.')),
      el('li', null, el('p', { class: 'cl-chain-eq' }, 'F = m × a'), el('p', null, 'The skier’s mass and that acceleration set the inward force the snow must supply.'))));
    page.appendChild(el('div', { class: 'cl-explains' }, ['sidecutRadius', 'edgeAngle', 'turnRadius', 'speed', 'centripetalAcceleration', 'gForce', 'skierMass', 'inwardForce', 'turnTime'].map(k => el('section', { class: 'cl-explain-card' }, helpContent(k, 'h2')))));
    page.appendChild(el('section', { class: 'cl-honest', 'aria-labelledby': 'honest-h' }, helpContent('model', 'h2'),
      el('p', { class: 'cl-note' }, 'Carve Lab is for learning maths and physics. It isn’t advice about how to ski, what equipment to use, or what speeds or forces are safe.')));
    page.appendChild(el('p', null, el('a', { class: 'cl-btn cl-btn--primary', href: '#challenges' }, 'Put it to work: the Challenge Arena →')));
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
    if (!a || a.classList.contains('cl-skip')) return;
    const p = parse(a.getAttribute('href'));
    if (routing === 'memory' || location.hash === a.getAttribute('href')) { e.preventDefault(); show(p.section, p.sub, true); }
  });
  const onHash = () => { const p = parse(location.hash); show(p.section, p.sub, !first); first = false; };
  if (routing === 'hash') { window.addEventListener('hashchange', onHash); onHash(); }
  else { show('simulator', null, false); first = false; }
  return { summary: () => progress.summary(), go, destroy: () => { cleanups.forEach(fn => fn()); if (routing === 'hash') window.removeEventListener('hashchange', onHash); clear(target); } };
}

if (typeof window !== 'undefined') window.CarveLab = { mount, VERSION };
