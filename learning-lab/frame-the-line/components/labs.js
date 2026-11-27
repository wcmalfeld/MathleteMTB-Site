// Frame the Line: interactives. Every number comes from logic/film.js or the
// kit's exact fractions; controls are buttons, sliders and inputs, so every
// interactive works from the keyboard. Settings are kept in the lab's
// progress (quietly: they aren't answers).
//
// Graded here: linePlot (place any two points on a given line). The
// explorers are ungraded; the questions beside them are.

import { el, svg, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { Frac, show } from '../../lesson-kit/frac.js';
import { tutorOf } from '../../dream-line-project/components/labs.js';
import { earnedBadges } from '../../dream-line-project/components/park.js';
import { gridSvg, tableEl, figure as mtFigure } from '../../slope-lab/components/figures.js';
import { BUDGET, C, Sf, Ef, STORAGE, CONCEPTS, TIMELINE, FIXED_PARTS, APPROVED, FUNCTIONS, MONEY_NOTE, STORAGE_NOTE } from '../logic/film.js';
import { conceptArt } from './visuals.js';

const money = x => (x < 0 ? '−$' : '$') + Math.abs(Math.round(x)).toLocaleString('en-US');
const S = x => show(Frac.of(x)).replace(/^-/, '−');
const lin = (m, b, x) => { const mt = m === 1 ? x : m === -1 ? '−' + x : S(m) + x; return b === 0 ? mt : mt + (b < 0 ? ' − ' + S(-b) : ' + ' + S(b)); };
const tiles = rows => el('div', { class: 'ftl-tiles' }, rows.map(([k, v, cls]) => el('div', { class: 'ftl-tile' + (cls ? ' ' + cls : '') }, el('p', { class: 'ftl-tile-k' }, k), el('p', { class: 'ftl-tile-v' }, v))));
export const film = P => ({ concept: null, title: '', rider: '', description: '', ...(P.getData('film', {}) || {}) });
export const conceptOf = P => CONCEPTS.find(c => c.id === film(P).concept) || null;

// ------------------------------------------------------------ figures (q.fig)
export function figure(fig) {
  if (!fig) return null;
  if (fig.kind === 'segment') {
    const [a, b] = [fig.a, fig.b];
    return el('div', { class: 'ms-figure ftl-fig' }, plot({ x: [0, 7], y: [0, 6], xStep: 1, yStep: 1, xDigits: 0, xLabel: 'x', yLabel: 'y',
      label: `A line segment from (${a[0]}, ${a[1]}) ${fig.aIn ? 'closed' : 'open'} circle to (${b[0]}, ${b[1]}) ${fig.bIn ? 'closed' : 'open'} circle`,
      series: [{ points: [a, b], cls: 'ftl-seg' }], marks: [{ x: a[0], y: a[1], r: 7, cls: fig.aIn ? 'ftl-closed' : 'ftl-open', label: `(${a[0]}, ${a[1]})${fig.aIn ? '' : ' open'}` }, { x: b[0], y: b[1], r: 7, cls: fig.bIn ? 'ftl-closed' : 'ftl-open', label: `(${b[0]}, ${b[1]})${fig.bIn ? ' closed' : ''}` }] }).node,
      el('p', { class: 'ls-small' }, 'Open circle: that point is not included. Closed circle: it is.'));
  }
  if (fig.kind === 'dots') return el('div', { class: 'ms-figure ftl-fig' }, plot({ x: [0, 5], y: [0, 14], xStep: 1, yStep: 2, xDigits: 0, xLabel: 'Filming day', yLabel: 'Approved shots', label: 'Separate points: ' + fig.pts.map(p => `(${p[0]}, ${p[1]})`).join(', '),
    marks: fig.pts.map(p => ({ x: p[0], y: p[1], r: 7, cls: 'ftl-closed', label: `(${p[0]}, ${p[1]})` })) }).node);
  if (fig.kind === 'relations') return el('div', { class: 'ftl-rels' }, RELATIONS.map(R => el('figure', { class: 'ftl-rel' }, el('figcaption', null, R.id + ': ' + R.name), relPlot(R, null).node)));
  return mtFigure(fig);
}

// The four relations of the vertical line test.
export const RELATIONS = [
  { id: 'A', name: 'a rising line', fn: true, pts: [[-4, -3], [4, 3]], at: x => [0.75 * x] },
  { id: 'B', name: 'a horizontal line', fn: true, pts: [[-4, 2], [4, 2]], at: () => [2] },
  { id: 'C', name: 'a vertical line', fn: false, pts: [[1, -4], [1, 4]], at: x => (Math.abs(x - 1) < 1e-9 ? 'all' : []) },
  { id: 'D', name: 'a sideways curve', fn: false, pts: Array.from({ length: 33 }, (_, i) => { const y = -4 + i * 0.25; return [y * y / 4 - 2, y]; }), at: x => (x < -2 ? [] : x === -2 ? [0] : [2 * Math.sqrt(x + 2), -2 * Math.sqrt(x + 2)]) }
];
function relPlot(R, x) {
  const marks = [], hits = x === null ? null : R.at(x);
  if (hits && hits !== 'all') hits.forEach(y => marks.push({ x, y, r: 6, cls: 'ftl-hit' }));
  return plot({ x: [-4, 4], y: [-4, 4], xStep: 2, yStep: 2, xDigits: 0, label: `Graph ${R.id}: ${R.name}` + (x === null ? '' : `, test line at x = ${x}`),
    series: [{ points: R.pts, cls: 'ftl-rel-line' }], vlines: x === null ? [] : [{ x, cls: 'ftl-test' + (hits === 'all' || (hits && hits.length > 1) ? ' is-bad' : '') }], marks });
}

// ------------------------------------------------------------ place two points on a line (graded)
export function linePlot(ctx, id, Q, o = {}) {
  const P = ctx.progress, key = o.key || null, dk = 'line:' + id + (key ? '|' + key : ''), G = Q.grid, L = Q.line;
  let pts = P.getData(dk, []) || [], misses = 0;
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const done = () => P.done(id, key), save = () => P.setData(dk, pts, true);
  const fig = el('div', { class: 'ms-figure mt-plot-fig' }), fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' }), list = el('ul', { class: 'mt-pts', 'aria-label': 'Points placed' });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  const on = p => (L.vertical !== undefined ? Number(p.x) === L.vertical : Math.abs(Number(p.y) - (L.m * p.x + L.b)) < 1e-9);
  const name = L.vertical !== undefined ? `x = ${L.vertical}` : L.m === 0 ? `y = ${L.b}` : `y = ${lin(L.m, L.b, 'x')}`;
  const ends = L.vertical !== undefined ? [[L.vertical, G.y[0]], [L.vertical, G.y[1]]] : [[G.x[0], L.m * G.x[0] + L.b], [G.x[1], L.m * G.x[1] + L.b]];
  const sample = L.vertical !== undefined ? [{ x: L.vertical, y: G.y[0] + 1 * (G.sy || 1) }, { x: L.vertical, y: G.y[1] - 1 * (G.sy || 1) }] : [{ x: G.x[0] + (G.sx || 1), y: L.m * (G.x[0] + (G.sx || 1)) + L.b }, { x: G.x[1] - (G.sx || 1), y: L.m * (G.x[1] - (G.sx || 1)) + L.b }];
  const xi = el('input', { class: 'ls-input mt-xy', id: uid('lx'), inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'x-coordinate' }), yi = el('input', { class: 'ls-input mt-xy', id: uid('ly'), inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'y-coordinate' });
  const read = v => Number(String(v).trim().replace(/[−–]/g, '-'));
  function add(x, y) {
    if (done()) return;
    if (!isFinite(x) || !isFinite(y)) { say('info', 'Type two numbers: x and y.'); return; }
    if (x < G.x[0] || x > G.x[1] || y < G.y[0] || y > G.y[1]) { say('info', `That’s off this grid: x runs ${G.x[0]} to ${G.x[1]}, y runs ${G.y[0]} to ${G.y[1]}.`); return; }
    const i = pts.findIndex(p => p.x === x && p.y === y);
    if (i >= 0) pts.splice(i, 1); else { pts.push({ x, y }); if (pts.length > 2) pts.shift(); }
    save(); draw();
  }
  function check() {
    if (pts.length < 2) { say('info', `Place two points on ${name} first.`); return; }
    const ok = pts.every(on);
    const txt = pts.map(p => `(${p.x}, ${p.y})`).join(' ');
    if (ok) { P.attempt(id, key, txt, true, { code: 'correct', prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh(); say('right', misses || rec().hints ? 'Right: both points are on the line.' : 'Right, first try: both points are on the line.', Q.solution); draw(); return; }
    let code = 'plot-error', msg = `At least one point isn’t on ${name}.`;
    const swapped = L.vertical !== undefined ? pts.every(p => Number(p.y) === L.vertical) : L.m === 0 && pts.every(p => Number(p.x) === L.b);
    if (swapped) { code = 'hv-swap'; msg = L.vertical !== undefined ? `Those points make a horizontal line. On x = ${L.vertical}, every point has x = ${L.vertical}.` : `Those points make a vertical line. On y = ${L.b}, every point has y = ${L.b}.`; }
    misses += 1; P.attempt(id, key, txt, false, { code, prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh();
    say('wrong', msg, `${pts.filter(on).length} of 2 on the line.`); draw();
  }
  function reveal() { P.reveal(id, key); pts = sample.slice(); save(); ctx.refresh(); say('info', 'Here are two points on the line.', Q.solution); draw(); }
  function draw() {
    const D = done();
    put(fig, gridSvg({ ...G, points: pts.map(p => ({ ...p, cls: D ? 'is-ok' : 'is-placed', label: `(${p.x}, ${p.y})` })), line: D ? ends : null, onPick: D ? null : add, label: Q.prompt }));
    put(list, pts.map(p => el('li', null, `(${p.x}, ${p.y})`, D ? null : button('Remove', () => { pts = pts.filter(q => !(q.x === p.x && q.y === p.y)); save(); draw(); }, 'ls-btn--quiet mt-btn-sm', { 'aria-label': `Remove (${p.x}, ${p.y})` }))));
    const T = tutorOf(P), hs = T.hints ? Q.hints || [] : [], r = rec();
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    put(actions, D ? null : [button('Check my line', check, 'ls-btn--primary'), pts.length ? button('Clear', () => { pts = []; save(); draw(); }, 'ls-btn--quiet') : null,
      hs.length && r.hints < hs.length ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id, key); draw(); }, 'ls-btn--quiet') : null,
      T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length) ? button('Show the solution', reveal, 'ls-btn--quiet') : null]);
  }
  if (done()) say(rec().correct ? 'right' : 'info', rec().correct ? 'You’ve graphed this one.' : 'You looked at the solution for this one.', Q.solution);
  draw();
  const typeRow = el('div', { class: 'mt-type' }, el('span', { class: 'ls-small' }, 'Or type a point:'), el('label', { class: 'ls-sr', for: xi.id }, 'x'), '(', xi, ',', el('label', { class: 'ls-sr', for: yi.id }, 'y'), yi, ')',
    button('Place point', () => { add(read(xi.value), read(yi.value)); xi.value = yi.value = ''; xi.focus(); }, 'ls-btn--quiet'));
  return el('div', { class: 'ls-card ms-ask mt-plotq ftl-lineq', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || 'Graph it · ' + Q.level), el('p', { class: 'ls-prompt' }, Q.prompt),
    fig, el('p', { class: 'ls-small' }, 'Click two grid crossings on the line, or type them (a third point replaces the first).'), typeRow, list, actions, hintsEl, fb);
}

// ------------------------------------------------------------ the production budget explorer (Stage 2)
const COMPARE = { base: [[420, 1800, 'The original budget']], rate: [[500, 2000, 'Model 1'], [300, 2000, 'Model 2']], start: [[420, 1800, 'Plan A'], [420, 2500, 'Plan B']] };
export function budgetExplorer(ctx) {
  const P = ctx.progress;
  let st = { daily: 420, fixed: 1800, days: 3, cmp: 'base', ...(P.getData('explorer', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'ftl-read', 'aria-live': 'polite' }), tl = el('div');
  function draw() {
    const yours = d => st.fixed + st.daily * d, others = COMPARE[st.cmp], top = Math.max(6000, yours(8), ...others.map(([m, b]) => b + 8 * m));
    put(fig, plot({ x: [0, 8], y: [0, Math.ceil(top / 1000) * 1000], xStep: 1, yStep: 1000, xDigits: 0, xLabel: 'Shoot days d', yLabel: 'Cost C ($)', label: `Your model C = ${st.daily}d + ${st.fixed}, with ${others.map(o => o[2] + ` C = ${o[0]}d + ${o[1]}`).join(' and ')}`,
      series: [...others.map(([m, b], i) => ({ points: [[0, b], [8, b + 8 * m]], cls: 'ftl-cmp is-' + i })), { points: [[0, st.fixed], [8, yours(8)]], cls: 'ftl-yours' }],
      marks: [{ x: 0, y: st.fixed, r: 6, cls: 'ftl-int', label: `b = ${st.fixed}` }, { x: st.days, y: yours(st.days), r: 8, cls: 'ftl-on', label: money(yours(st.days)) }] }).node);
    put(tl, tiles([['Equation', `C = ${st.daily}d + ${st.fixed}`], ['Slope m', `$${st.daily} per day`], ['y-intercept b', money(st.fixed)], [`Cost of ${st.days} day${st.days === 1 ? '' : 's'}`, money(yours(st.days))]]));
    put(read, el('ul', { class: 'ftl-legend' }, others.map(([m, b, n], i) => el('li', { class: 'is-' + i }, `${n}: C = ${m}d + ${b}`)), el('li', { class: 'is-yours' }, `Yours: C = ${st.daily}d + ${st.fixed}`)),
      st.cmp === 'rate' ? el('p', { class: 'ls-small' }, 'Same start, different slopes: the steeper line (500 a day) pulls away.') : st.cmp === 'start' ? el('p', { class: 'ls-small' }, 'Same slope, different intercepts: parallel lines, always $700 apart.') : el('p', { class: 'ls-small' }, 'Change the daily cost to change the slope; change the initial cost to move the line up or down.'));
    P.setData('explorer', st, true);
  }
  const ctl = el('div', null,
    slider({ label: 'Daily production cost (slope)', min: 100, max: 700, step: 20, value: st.daily, unit: '$ per day', onInput: v => { st.daily = v; draw(); } }).node,
    slider({ label: 'Initial production cost (intercept)', min: 0, max: 3000, step: 100, value: st.fixed, unit: '$', onInput: v => { st.fixed = v; draw(); } }).node,
    slider({ label: 'Number of filming days', min: 0, max: 8, step: 1, value: st.days, unit: 'days', onInput: v => { st.days = v; draw(); } }).node,
    segs('Compare with', [{ label: 'The original', value: 'base' }, { label: 'Two daily rates', value: 'rate' }, { label: 'Two starting costs', value: 'start' }], st.cmp, v => { st.cmp = v; draw(); }));
  draw();
  return el('div', null, tl, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, read)), el('p', { class: 'ls-small' }, MONEY_NOTE));
}

// ------------------------------------------------------------ the point-slope builder (Stage 3)
export function psBuilder(ctx) {
  const P = ctx.progress;
  let st = { m: 150, x1: 4, y1: 1200, conv: false, ...(P.getData('builder', {}) || {}) };
  const out = el('div', { class: 'ftl-build', 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure' });
  const ins = {}, blank = (k, w) => { ins[k] = el('input', { class: 'ls-input ftl-blank', id: uid('b'), inputmode: 'decimal', autocomplete: 'off', 'aria-label': w, size: 5 }); return ins[k]; };
  const marks = el('p', { class: 'ls-small', role: 'status' });
  function draw() {
    const b = st.y1 - st.m * st.x1, lo = Math.min(b, st.y1, b + 8 * st.m), hi = Math.max(b, st.y1, b + 8 * st.m);
    put(fig, plot({ x: [0, 8], y: [Math.min(0, Math.floor(lo / 100) * 100), Math.ceil((hi + 100) / 100) * 100], xStep: 1, xDigits: 0, xLabel: 'x (hours or days)', yLabel: 'y', label: `The line through (${st.x1}, ${st.y1}) with slope ${st.m}`,
      series: [{ points: [[0, b], [8, b + 8 * st.m]], cls: 'ftl-yours' }], marks: [{ x: st.x1, y: st.y1, r: 8, cls: 'ftl-on', label: `(${st.x1}, ${st.y1})` }] }).node);
    const sgn = v => (v < 0 ? '+ ' + S(-v) : '− ' + S(v));
    put(out, el('p', { class: 'ms-live-eq' }, 'y − ', blank('y1', 'y₁'), ' = ', blank('m', 'm'), '(x − ', blank('x1', 'x₁'), ')'),
      el('div', { class: 'ls-actions' }, button('Check my blanks', () => {
        const got = k => Number(String(ins[k].value).trim().replace(/[−–]/g, '-')), want = { y1: st.y1, m: st.m, x1: st.x1 };
        const bad = Object.keys(want).filter(k => ins[k].value.trim() === '' || got(k) !== want[k]);
        Object.keys(want).forEach(k => ins[k].classList.toggle('is-bad', bad.includes(k)));
        if (!bad.length) { const n = (P.getData('builtCount', 0) || 0) + 1; P.setData('builtCount', n, true); }
        marks.textContent = bad.length ? `Not yet: check ${bad.map(k => ({ y1: 'y₁', m: 'm', x1: 'x₁' })[k]).join(', ')}. The point is (${st.x1}, ${st.y1}): x₁ = ${st.x1}, y₁ = ${st.y1}.` : `Right: y − ${S(st.y1)} = ${S(st.m)}(x − ${S(st.x1)}).`;
      }, 'ls-btn--primary'), button(st.conv ? 'Hide the conversion' : 'Convert to slope-intercept form', () => { st.conv = !st.conv; save(); draw(); }, 'ls-btn--quiet')), marks,
      st.conv ? el('ol', { class: 'ms-steps ftl-conv' }, el('li', null, `y − ${S(st.y1)} = ${S(st.m)}(x − ${S(st.x1)})`), el('li', null, `Distribute: y − ${S(st.y1)} = ${S(st.m)}x ${sgn(st.m * st.x1)}`), el('li', null, `Add ${S(st.y1)}: y = ${lin(st.m, b, 'x')}`), el('li', null, `Check at x = ${st.x1}: ${S(st.m)}(${st.x1}) ${b < 0 ? '− ' + S(-b) : '+ ' + S(b)} = ${S(st.y1)} ✓`)) : null);
  }
  const save = () => P.setData('builder', st, true);
  const ctl = el('div', null,
    slider({ label: 'Slope m', min: -60, max: 500, step: 10, value: st.m, onInput: v => { st.m = v; save(); draw(); } }).node,
    slider({ label: 'x-coordinate x₁', min: 0, max: 8, step: 1, value: st.x1, onInput: v => { st.x1 = v; save(); draw(); } }).node,
    slider({ label: 'y-coordinate y₁', min: 0, max: 4000, step: 60, value: st.y1, onInput: v => { st.y1 = v; save(); draw(); } }).node);
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, el('p', { class: 'ls-small' }, 'Choose a checkpoint and a slope, then fill in the point-slope equation.'), out));
}

// ------------------------------------------------------------ the vertical line test (Stage 6)
export function verticalLineTest(ctx) {
  const P = ctx.progress;
  let st = { rel: 'A', x: -1, ...(P.getData('vlt', {}) || {}) };
  const fig = el('div', { class: 'ms-figure ftl-vlt' }), read = el('div', { 'aria-live': 'polite' });
  function draw() {
    const R = RELATIONS.find(r => r.id === st.rel), hits = R.at(st.x), n = hits === 'all' ? Infinity : hits.length;
    put(fig, relPlot(R, st.x).node);
    const seen = new Set(P.getData('vltSeen', []) || []); seen.add(R.id); P.setData('vltSeen', [...seen], true);
    put(read, el('p', { class: 'ms-live-eq' }, `Test line x = ${st.x}: crosses ${n === Infinity ? 'everywhere along it' : n + (n === 1 ? ' time' : ' times')}`),
      n > 1 ? status(false, '', `More than one y-value at x = ${st.x}: graph ${R.id} is not a function.`) : status(true, n ? `One y-value here. Sweep the line: does it ever cross twice? ${R.fn ? 'Never: graph ' + R.id + ' is a function.' : ''}` : 'No point here. Keep sweeping.', ''),
      el('p', { class: 'ls-small' }, R.id === 'C' ? 'Like the equipment handover x = 4: one moment, many values. A schedule marker, not a cost function.' : R.id === 'B' ? 'Like a fixed equipment package: the same output for every input. Still a function.' : R.id === 'A' ? 'Like the budget: each number of days has one cost.' : 'Some inputs give two outputs: not a function.'));
    P.setData('vlt', st, true);
  }
  const sl = slider({ label: 'Move the vertical test line', min: -4, max: 4, step: 0.5, value: st.x, onInput: v => { st.x = v; draw(); }, describe: v => `x = ${v}` });
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' },
    segs('Graph', RELATIONS.map(r => ({ label: r.id, value: r.id })), st.rel, v => { st.rel = v; draw(); }), sl.node, read));
}

// ------------------------------------------------------------ the domain and range builder (Stage 5)
export function domainBuilder(ctx) {
  const P = ctx.progress;
  let st = { fixed: 1800, daily: 420, max: 8, whole: false, ...(P.getData('dombuild', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'ftl-read', 'aria-live': 'polite' });
  function draw() {
    const f = d => st.fixed + st.daily * d, hi = f(st.max), days = Array.from({ length: st.max + 1 }, (_, i) => i);
    put(fig, plot({ x: [0, 12], y: [0, Math.ceil((hi + 500) / 1000) * 1000], xStep: 1, xDigits: 0, xLabel: 'Shoot days d', yLabel: 'Cost C ($)', label: `C(d) = ${st.fixed} + ${st.daily}d for ${st.whole ? 'whole days 0 to ' + st.max : '0 ≤ d ≤ ' + st.max}`,
      series: st.whole ? [] : [{ points: [[0, st.fixed], [st.max, hi]], cls: 'ftl-yours' }], bands: [{ axis: 'x', from: 0, to: st.max, cls: 'ftl-band' }],
      marks: st.whole ? days.map(d => ({ x: d, y: f(d), r: 5, cls: 'ftl-closed' })) : [{ x: 0, y: st.fixed, r: 7, cls: 'ftl-closed', label: money(st.fixed) }, { x: st.max, y: hi, r: 7, cls: 'ftl-closed', label: money(hi) }] }).node);
    const set = xs => '{' + (xs.length > 5 ? xs.slice(0, 3).join(', ') + ', …, ' + xs[xs.length - 1] : xs.join(', ')) + '}';
    put(read, el('p', { class: 'ms-live-eq' }, `C(d) = ${st.fixed} + ${st.daily}d`),
      tableEl(st.whole ? [['Domain', set(days)], ['Range', set(days.map(f))]] : [['Domain', `[0, ${st.max}]  or  0 ≤ d ≤ ${st.max}`], ['Range', `[${st.fixed}, ${hi}]  or  ${st.fixed} ≤ C ≤ ${hi}`]], ['', st.whole ? 'Whole days only' : 'Partial days prorated']),
      el('p', { class: 'ls-small' }, `C(0) = ${money(st.fixed)} is the smallest cost and C(${st.max}) = ${money(hi)} the largest. The equation works for any d; the production doesn’t.`));
    P.setData('dombuild', st, true);
  }
  const ctl = el('div', null,
    slider({ label: 'Initial cost', min: 0, max: 3000, step: 100, value: st.fixed, unit: '$', onInput: v => { st.fixed = v; draw(); } }).node,
    slider({ label: 'Daily cost', min: 100, max: 600, step: 20, value: st.daily, unit: '$ per day', onInput: v => { st.daily = v; draw(); } }).node,
    slider({ label: 'Approved shoot days', min: 1, max: 12, step: 1, value: st.max, unit: 'days', onInput: v => { st.max = v; draw(); } }).node,
    segs('Schedule', [{ label: 'Partial days prorated', value: false }, { label: 'Whole days only', value: true }], st.whole, v => { st.whole = v; draw(); }));
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, read));
}

// ------------------------------------------------------------ the director's dashboard (Stage 6): calculate first, then reveal
export function directorDashboard(ctx) {
  const P = ctx.progress;
  let st = { fn: 'C', x: 3, ...(P.getData('director', {}) || {}) }, shown = false;
  const box = el('div', { class: 'ftl-director' });
  function draw() {
    const F = FUNCTIONS.find(f => f.id === st.fn), x = Math.min(st.x, F.dom[1]), y = F.b + F.m * x;
    const gid = uid('dg'), guess = el('input', { class: 'ls-input', id: gid, inputmode: 'decimal', autocomplete: 'off' }), msg = el('p', { class: 'ls-small', role: 'status' });
    const sub = `${F.id}(${x}) = ${F.b} ${F.m < 0 ? '− ' + -F.m : '+ ' + F.m}(${x})`;
    const unitText = v => (F.unit === '$' ? money(v) : `${v} ${F.unit}`);
    const result = shown ? el('div', { class: 'ftl-reveal' }, tiles([['Input', `${F.input} = ${x} ${F.inName}`], ['Function rule', F.rule], ['Substituted', sub], ['Output', unitText(y)]]), el('p', null, el('b', null, 'In the production: '), F.say(x, y))) : null;
    put(box, segs('Production function', FUNCTIONS.map(f => ({ label: f.name, value: f.id })), st.fn, v => { st.fn = v; shown = false; save(); draw(); }),
      slider({ label: `Input ${F.input} (${F.inName})`, min: F.dom[0], max: F.dom[1], step: 1, value: x, onInput: v => { st.x = v; shown = false; save(); draw(); } }).node,
      el('p', { class: 'ms-live-eq' }, `${F.rule}.   Find ${F.id}(${x}).`),
      shown ? null : el('div', { class: 'ls-field' }, el('label', { for: gid }, `Your calculation of ${F.id}(${x})`), guess),
      shown ? null : el('div', { class: 'ls-actions' }, button('Reveal the output', () => {
        const g = Number(String(guess.value).trim().replace(/[−–,$]/g, m => (m === '−' || m === '–' ? '-' : '')));
        if (guess.value.trim() === '' || !isFinite(g)) { msg.textContent = 'Calculate it first, then reveal.'; return; }
        const right = Math.abs(g - y) < 1e-9, log = P.getData('dashLog', []) || [];
        log.push({ fn: F.id, x, guess: g, right }); P.setData('dashLog', log.slice(-30), true);
        shown = { g, right }; draw();
      }, 'ls-btn--primary')), msg, result,
      shown ? status(shown.right, `Your ${shown.g} matches.`, `You had ${shown.g}. Substitute ${x} for ${F.input}, multiply, then add.`) : null);
  }
  const save = () => P.setData('director', st, true);
  draw();
  return box;
}

// ------------------------------------------------------------ the production studio (board)
export function studio(ctx, missions) {
  const P = ctx.progress, F = film(P), got = earnedBadges(P, missions), K = conceptOf(P);
  const setFilm = patch => { P.setData('film', { ...film(P), ...patch }, true); };
  const plan = { days: 5, hours: 6, ...(P.getData('plan', {}) || {}) };
  const picker = el('div', { class: 'ftl-concepts', role: 'radiogroup', 'aria-label': 'Film concept' }, CONCEPTS.map(c => el('button', { type: 'button', role: 'radio', class: 'ftl-concept' + (F.concept === c.id ? ' is-on' : ''), 'aria-checked': String(F.concept === c.id),
    onclick: () => { setFilm({ concept: c.id, rider: film(P).rider || c.rider }); ctx.rerender(); } }, conceptArt(c.id), el('span', { class: 'ftl-concept-n' }, c.name), el('span', { class: 'ftl-concept-b' }, c.blurb))));
  const tid = uid('ft'), rid = uid('fr');
  const title = el('input', { class: 'ls-input', id: tid, maxlength: 60, placeholder: 'e.g. Beyond the Ridgeline', value: F.title });
  const rider = el('input', { class: 'ls-input', id: rid, maxlength: 40, placeholder: K ? K.rider : 'Your featured rider', value: F.rider });
  title.addEventListener('change', () => { setFilm({ title: title.value.trim() }); ctx.refresh(); });
  rider.addEventListener('change', () => { setFilm({ rider: rider.value.trim() }); ctx.refresh(); });
  const next = TIMELINE.find(t => !got.has(t.mission));
  const fin = el('div'), dash = el('div');
  function drawMoney() {
    const total = C(plan.days), left = APPROVED - total, free = Sf(plan.hours);
    put(fin, el('p', { class: 'ls-kicker' }, 'Financial dashboard'), tableEl([...FIXED_PARTS.map(([k, v]) => [k, money(v)]), ['Initial production costs (b)', money(BUDGET.fixed)], ['Daily filming expenses (m)', `${money(BUDGET.daily)} per day`], [`Total modeled cost, ${plan.days} day${plan.days === 1 ? '' : 's'}: C(${plan.days})`, money(total)], ['Approved budget: C(8)', money(APPROVED)], ['Remaining budget', money(left)]], ['Item', 'Amount']),
      el('p', { class: 'ls-small' }, `Storage: S(${plan.hours}) = ${free} GB free of ${STORAGE.start} GB after ${plan.hours} recording hours.`));
    P.setData('plan', plan, true);
  }
  put(dash, tiles([['Film title', F.title || 'Untitled'], ['Concept', K ? K.name : 'Not chosen'], ['Featured rider', F.rider || (K ? K.rider : '—')], ['Production stage', next ? next.name : 'Complete'],
    ['Budget model', got.has('plan') ? 'C = 420d + 1800' : 'Not yet modeled', got.has('plan') ? 'is-ok' : 'is-off'], ['Checkpoint', got.has('checkpoint') ? 'C − 3060 = 420(d − 3)' : 'Not yet', got.has('checkpoint') ? 'is-ok' : 'is-off'],
    ['Storage model', got.has('graph') ? 'S = 600 − 40h' : 'Not yet graphed', got.has('graph') ? 'is-ok' : 'is-off'], ['Authorized period', got.has('limits') ? '0 ≤ d ≤ 8' : 'Not yet set', got.has('limits') ? 'is-ok' : 'is-off']]));
  drawMoney();
  return el('section', { class: 'ftl-studio', 'aria-label': 'Your film production studio' },
    el('p', { class: 'ls-kicker' }, 'Your film production studio'),
    F.concept ? null : el('p', { class: 'ls-small' }, 'Choose a concept for your film. It changes the art and the story, not the maths.'), picker,
    el('div', { class: 'ftl-two' }, el('div', { class: 'ls-field' }, el('label', { for: tid }, 'Film title'), title), el('div', { class: 'ls-field' }, el('label', { for: rid }, 'Featured rider (fictional)'), rider)),
    el('p', { class: 'ls-kicker' }, 'Production dashboard'), dash,
    el('p', { class: 'ls-kicker' }, 'Production timeline'),
    el('ol', { class: 'ftl-timeline' }, TIMELINE.map(t => el('li', { class: got.has(t.mission) ? 'is-done' : next === t ? 'is-now' : '' }, el('span', { class: 'ftl-tl-dot', 'aria-hidden': 'true' }, got.has(t.mission) ? '✓' : ''), el('span', null, t.name), el('span', { class: 'ls-sr' }, got.has(t.mission) ? ' (done)' : next === t ? ' (current)' : '')))),
    el('div', { class: 'ftl-plan' }, slider({ label: 'Planned shoot days', min: 0, max: BUDGET.maxDays, step: 1, value: plan.days, unit: 'days', onInput: v => { plan.days = v; drawMoney(); } }).node,
      slider({ label: 'Planned recording hours', min: 0, max: 15, step: 1, value: plan.hours, unit: 'h', onInput: v => { plan.hours = v; drawMoney(); } }).node), fin,
    el('p', { class: 'ls-small' }, MONEY_NOTE + ' ' + STORAGE_NOTE));
}

// ------------------------------------------------------------ the final production board (extension)
export function productionBoard(ctx, missions, certified) {
  const P = ctx.progress, F = film(P), K = conceptOf(P), got = earnedBadges(P, missions), plan = { days: 5, hours: 6, ...(P.getData('plan', {}) || {}) };
  const tid = uid('pt'), did = uid('pd'), sid = uid('ps');
  const title = el('input', { class: 'ls-input ftl-title-in', id: tid, maxlength: 60, placeholder: 'Beyond the Ridgeline', value: F.title });
  const heading = el('p', { class: 'ftl-film-title' }, 'MY FILM: ' + (F.title || 'Untitled').toUpperCase());
  title.addEventListener('input', () => { heading.textContent = 'MY FILM: ' + (title.value.trim() || 'Untitled').toUpperCase(); });
  title.addEventListener('change', () => { P.setData('film', { ...film(P), title: title.value.trim() }); });
  const desc = el('textarea', { class: 'ls-textarea', id: did, rows: 3, placeholder: 'What is your film about?' }); desc.value = F.description || '';
  desc.addEventListener('change', () => P.setData('film', { ...film(P), description: desc.value }));
  const stmt = el('textarea', { class: 'ls-textarea', id: sid, rows: 3 }); stmt.value = P.written('project-statement') || 'I used linear equations to model the production budget, interpret daily expenses, calculate available resources and plan the filming schedule.';
  stmt.addEventListener('change', () => P.write('project-statement', stmt.value));
  const row = (k, ok, v) => el('li', { class: ok ? 'is-ok' : 'is-off' }, el('b', null, k + ': '), ok ? v : 'complete the stage to fill this in');
  return el('div', { class: 'ftl-board' },
    el('div', { class: 'ftl-board-head' }, K ? conceptArt(K.id, true) : null, heading),
    el('div', { class: 'ls-field' }, el('label', { for: tid }, 'Name your film'), title),
    el('p', { class: 'ls-kicker' }, 'Film information'),
    tiles([['Concept', K ? K.name : 'Choose one on the studio board'], ['Featured rider (fictional)', F.rider || (K ? K.rider : '—')], ['Location', K ? K.location : '—']]),
    el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: did }, 'Film description'), desc),
    el('p', { class: 'ls-kicker' }, 'Production information'),
    el('ul', { class: 'mt-checks ftl-checks' },
      row('Budget equation', got.has('plan'), 'C = 420d + 1800'), row('Slope and intercept', got.has('budget'), 'm = 420 ($ per shoot day), b = 1800 (initial costs)'),
      row('Point-slope checkpoint', got.has('checkpoint'), 'C − 3060 = 420(d − 3), the same line'), row('Storage model', got.has('graph'), 'S = 600 − 40h, intercepts (0, 600) and (15, 0)'),
      row('Domain and range', got.has('limits'), '0 ≤ d ≤ 8 and 1800 ≤ C ≤ 5160'), row('Evaluated functions', got.has('direct'), `C(3) = 3060, S(5) = ${Sf(5)}, E(5) = ${Ef(5)}`)),
    got.has('graph') ? el('figure', { class: 'ms-figure' }, el('figcaption', { class: 'ls-kicker' }, 'Production graph'), plot({ x: [0, 8], y: [0, 6000], xStep: 1, yStep: 1000, xDigits: 0, xLabel: 'Shoot days d', yLabel: 'Cost C ($)', label: 'C = 420d + 1800 from (0, 1800) to (8, 5160)',
      series: [{ points: [[0, 1800], [8, 5160]], cls: 'ftl-yours' }], marks: [{ x: 0, y: 1800, r: 6, cls: 'ftl-closed', label: '(0, 1800)' }, { x: 8, y: 5160, r: 6, cls: 'ftl-closed', label: '(8, 5160)' }, { x: plan.days, y: C(plan.days), r: 8, cls: 'ftl-on', label: `planned: ${money(C(plan.days))}` }] }).node) : null,
    el('p', { class: 'ls-kicker' }, 'Production status'),
    tiles([['Stages complete', `${got.size} of 6`], ['Final production budget', `${money(C(plan.days))} for ${plan.days} days`], ['Authorized filming period', '0 to 8 shoot days'], ['Storage at the planned duration', `S(${plan.hours}) = ${Sf(plan.hours)} GB free`], ['Certification', certified ? 'Certified film producer' : 'Not yet']]),
    el('ul', { class: 'dl-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, (got.has(m.id) ? '★ ' : '☆ ') + m.badge))),
    el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: sid }, 'Project statement (saved for your tutor)'), stmt),
    el('p', { class: 'ls-small' }, 'No video editing or uploads: this is your film’s mathematical production plan. ' + MONEY_NOTE));
}
