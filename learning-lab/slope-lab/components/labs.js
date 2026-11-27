// Map the Line: interactives. Every number comes from logic/linear.js (exact
// fractions) or logic/slope.js (the original Slope Lab's engine, for grade
// and angle). Controls are buttons, sliders and inputs; pointer dragging is
// an extra, never required. Settings are kept in the lab's progress.
//
// Graded here: plotPoints (place ordered pairs; snaps to grid crossings, or
// type the coordinates). A wrong check is an attempt with its misconception
// code; the solution can be shown after two misses or every hint.

import { el, svg, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot, dragXY } from '../../lesson-kit/plot.js';
import { tutorOf } from '../../dream-line-project/components/labs.js';
import { quadrant, QUAD_NAME, slope, grade, firstDifferences, isLinear, rates, proportional, classify, S, signed, Frac } from '../logic/linear.js';
import { angleFromSlope } from '../logic/slope.js';
import { FEATURES, MAP, PROFILE, PROFILE_NAMES, PROFILE_MAP } from '../logic/data.js';
import { gridSvg, tableEl, segmentPlot } from './figures.js';

const F = x => Frac.of(x);
const same = (a, b) => Number(a.x) === Number(b.x) && Number(a.y) === Number(b.y);

// ------------------------------------------------------------ plotting ordered pairs (graded)
export function plotPoints(ctx, id, Q, o = {}) {
  const P = ctx.progress, key = o.key || null, dk = 'pts:' + id + (key ? '|' + key : ''), G = Q.grid;
  let pts = P.getData(dk, []), misses = 0;
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const fig = el('div', { class: 'ms-figure mt-plot-fig' }), list = el('ul', { class: 'mt-pts', 'aria-label': 'Points placed' });
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  const xi = el('input', { class: 'ls-input mt-xy', id: uid('px'), inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'x-coordinate' });
  const yi = el('input', { class: 'ls-input mt-xy', id: uid('py'), inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'y-coordinate' });
  const done = () => P.done(id, key);
  const save = () => P.setData(dk, pts, true);
  const read = v => Number(String(v).trim().replace(/[−–]/g, '-'));
  const snapX = v => (G.profile ? G.x[0] + Math.round((v - G.x[0]) / (G.sx || 1)) * (G.sx || 1) : Math.round(v)), snapY = v => (G.profile ? G.y[0] + Math.round((v - G.y[0]) / (G.sy || 1)) * (G.sy || 1) : Math.round(v));   // grid crossings counted from where each axis starts
  function add(x, y) {
    if (done()) return;
    if (!isFinite(x) || !isFinite(y)) { say('info', 'Type two numbers: x and y.'); return; }
    if (x < G.x[0] || x > G.x[1] || y < G.y[0] || y > G.y[1]) { say('info', `That’s off this grid: x runs ${G.x[0]} to ${G.x[1]}, y runs ${G.y[0]} to ${G.y[1]}.`); return; }
    const p = { x: snapX(x), y: snapY(y) };
    const i = pts.findIndex(q => same(q, p));
    if (i >= 0) pts.splice(i, 1); else { if (pts.length >= Q.targets.length + 2) { say('info', 'That’s plenty of points: remove one first.'); return; } pts.push(p); }
    save(); draw();
  }
  function check() {
    const T = Q.targets, ok = T.every(t => pts.some(p => same(p, t))) && pts.length === T.length;
    if (ok) { P.attempt(id, key, pts.map(p => `(${p.x}, ${p.y})`).join(' '), true, { code: 'correct', prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh(); say('right', misses || rec().hints ? 'Right: every point is in place.' : 'Right, first try: every point is in place.', Q.solution); draw(); return; }
    let code = 'plot-error', msg = 'Some points aren’t in the right place yet.';
    const wrong = pts.filter(p => !T.some(t => same(p, t)));
    if (wrong.some(p => T.some(t => Number(t.x) === Number(p.y) && Number(t.y) === Number(p.x)))) { code = 'swap-xy'; msg = 'At least one point has x and y swapped: go across by x first, then up or down by y.'; }
    else if (wrong.some(p => T.some(t => Number(t.x) === -Number(p.x) && Number(t.y) === Number(p.y)) || T.some(t => Number(t.y) === -Number(p.y) && Number(t.x) === Number(p.x)))) { code = 'quadrant-signs'; msg = 'A point is mirrored across an axis: check the signs. Negative x is left, negative y is down.'; }
    else if (G.profile && wrong.some(p => T.some(t => Number(t.x) === Number(p.x)))) { code = 'scale-count'; msg = 'A point is at the right distance but the wrong elevation: read the vertical axis’s own scale.'; }
    else if (pts.length < T.length) { code = 'plot-error'; msg = `${T.length - pts.length} more point${T.length - pts.length === 1 ? '' : 's'} to place.`; }
    else if (pts.length > T.length) { code = 'plot-error'; msg = 'There are extra points: remove any that aren’t in the table.'; }
    misses += 1; P.attempt(id, key, pts.map(p => `(${p.x}, ${p.y})`).join(' '), false, { code, prompt: Q.prompt, correctAnswer: Q.solution }); ctx.refresh();
    say('wrong', msg, `${pts.length - wrong.length} of ${T.length} placed correctly.`); draw();
  }
  function reveal() { P.reveal(id, key); pts = Q.targets.map(t => ({ x: t.x, y: t.y })); save(); ctx.refresh(); say('info', 'Here’s where every point goes.', Q.solution); draw(); }
  function draw() {
    const D = done(), named = D ? Q.targets.map(t => ({ x: t.x, y: t.y, label: t.name, cls: 'is-ok' })) : pts.map(p => ({ ...p, cls: 'is-placed', label: `(${p.x}, ${p.y})` }));
    const sorted = (D ? Q.targets : pts).slice().sort((a, b) => a.x - b.x);
    put(fig, gridSvg({ ...G, map: !G.profile, points: named, path: D && Q.connect ? (Q.connect === true && !G.profile ? Q.targets.map(t => [t.x, t.y]) : sorted.map(t => [t.x, t.y])) : null, onPick: D ? null : add, label: Q.prompt }));
    put(list, pts.map(p => el('li', null, `(${p.x}, ${p.y})`, D ? null : button('Remove', () => { pts = pts.filter(q => !same(q, p)); save(); draw(); }, 'ls-btn--quiet mt-btn-sm', { 'aria-label': `Remove (${p.x}, ${p.y})` }))));
    const T = tutorOf(P), hs = T.hints ? Q.hints : [], r = rec();
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    put(actions, D ? null : [button('Check my points', check, 'ls-btn--primary'), pts.length ? button('Clear', () => { pts = []; save(); draw(); }, 'ls-btn--quiet') : null,
      hs.length && r.hints < hs.length ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id, key); draw(); }, 'ls-btn--quiet') : null,
      T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length) ? button('Show the solution', reveal, 'ls-btn--quiet') : null]);
  }
  if (done()) { if (rec().correct) pts = Q.targets.map(t => ({ x: t.x, y: t.y })); say(rec().correct ? 'right' : 'info', rec().correct ? 'You’ve plotted these.' : 'You looked at the solution for this one.', Q.solution); }
  draw();
  const typeRow = el('div', { class: 'mt-type' }, el('span', { class: 'ls-small' }, 'Or type a point:'), el('label', { class: 'ls-sr', for: xi.id }, 'x'), '(', xi, ',', el('label', { class: 'ls-sr', for: yi.id }, 'y'), yi, ')',
    button('Place point', () => { add(read(xi.value), read(yi.value)); xi.value = yi.value = ''; xi.focus(); }, 'ls-btn--quiet'));
  return el('div', { class: 'ls-card ms-ask mt-plotq', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || 'Plot it · ' + Q.level), el('p', { class: 'ls-prompt' }, Q.prompt),
    Q.targets.some(t => t.name) && !G.profile ? tableEl(Q.targets.map(t => [t.name, `(${t.x}, ${t.y})`]), ['Feature', 'Coordinates']) : null,
    fig, typeRow, list, actions, hintsEl, fb);
}

// ------------------------------------------------------------ the mountain map explorer (Stage 1)
export function mapExplorer(ctx) {
  const P = ctx.progress;
  let st = P.getData('mapx', { sel: 'jumps', quads: true, x: 2, y: -3, mode: 'features' });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'mt-read', 'aria-live': 'polite' }), ctl = el('div'), btns = el('div', { class: 'mt-feature-btns' });
  const pickF = id => () => { st.sel = id; draw(); };
  function draw() {
    const sel = FEATURES.find(f => f.id === st.sel);
    const points = st.mode === 'features' ? FEATURES.map(f => ({ x: f.x, y: f.y, label: f.id === st.sel ? f.name : '', cls: f.id === st.sel ? 'is-on' : 'is-feature', onClick: pickF(f.id), aria: f.name }))
      : [{ x: st.x, y: st.y, label: `(${st.x}, ${st.y})`, cls: 'is-on' }];
    put(fig, gridSvg({ ...MAP, map: true, quadrants: st.quads, points, label: 'Mountain map with a coordinate grid; the origin is the main trailhead' }));
    const p = st.mode === 'features' ? sel : { name: 'Your waypoint', x: st.x, y: st.y }, q = quadrant(p.x, p.y);
    put(read, el('p', { class: 'ms-live-eq' }, `${p.name}: (${S(p.x)}, ${S(p.y)})`), el('p', null, QUAD_NAME[q] + '. ' + (q === 'origin' ? 'Both coordinates are 0: the main trailhead.' : q.endsWith('axis') ? 'One coordinate is 0, so it sits on an axis, not in a quadrant.' : `x is ${p.x > 0 ? 'positive (right)' : 'negative (left)'}, y is ${p.y > 0 ? 'positive (up)' : 'negative (down)'}.`)));
    put(btns, st.mode === 'features' ? FEATURES.map(f => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet mt-btn-sm', 'aria-pressed': String(f.id === st.sel), onclick: pickF(f.id) }, f.name)) : null);
    P.setData('mapx', st, true);
  }
  function controls() {
    put(ctl, segs('Mode', [{ label: 'Tap the features', value: 'features' }, { label: 'Move a waypoint', value: 'move' }], st.mode, v => { st.mode = v; controls(); draw(); }),
      st.mode === 'move' ? [slider({ label: 'x', min: -6, max: 6, step: 1, value: st.x, onInput: v => { st.x = v; draw(); } }).node, slider({ label: 'y', min: -6, max: 6, step: 1, value: st.y, onInput: v => { st.y = v; draw(); } }).node] : btns,
      el('label', { class: 'dl-check' }, (() => { const c = el('input', { type: 'checkbox' }); c.checked = st.quads; c.addEventListener('change', () => { st.quads = c.checked; draw(); }); return c; })(), ' Show quadrant labels'));
  }
  controls(); draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, read, ctl));
}

// ------------------------------------------------------------ linked map and profile (Stage 2)
export function routeLink(ctx) {
  const P = ctx.progress;
  let sel = P.getData('link', 3);
  const left = el('div', { class: 'ms-figure' }), right = el('div', { class: 'ms-figure' }), read = el('div', { class: 'mt-read', 'aria-live': 'polite' }), btns = el('div', { class: 'mt-feature-btns' });
  function draw() {
    const pick = i => () => { sel = i; draw(); };
    put(left, gridSvg({ ...MAP, map: true, path: PROFILE_MAP, points: PROFILE_MAP.map(([x, y], i) => ({ x, y, label: i === sel ? PROFILE_NAMES[i] : '', cls: i === sel ? 'is-on' : 'is-feature', onClick: pick(i), aria: PROFILE_NAMES[i] })), label: 'Overhead map of the route' }));
    const p = plot({ x: [0, 600], y: [1195, 1220], xStep: 100, yStep: 5, xDigits: 0, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', label: 'Elevation profile of the same route',
      series: [{ points: PROFILE, cls: 'mt-prof-line' }], marks: PROFILE.map(([x, y], i) => ({ x, y, cls: i === sel ? 'mt-prof-on' : 'mt-prof-pt', r: i === sel ? 8 : 5, label: i === sel ? `(${x}, ${y})` : '' })) });
    p.node.querySelectorAll('circle').forEach((c, i) => { c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', PROFILE_NAMES[i]); c.addEventListener('click', pick(i)); c.addEventListener('keydown', e => { if (e.key === 'Enter') pick(i)(); }); });
    put(right, p.node);
    const [x, y] = PROFILE[sel];
    put(read, el('p', { class: 'ms-live-eq' }, `${PROFILE_NAMES[sel]}: ${x} m along, ${y} m up`), el('p', { class: 'ls-small' }, 'The map shows where the waypoint is from above; the profile shows how far along the route it is and how high. Select a waypoint in either view.'));
    put(btns, PROFILE_NAMES.map((n, i) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet mt-btn-sm', 'aria-pressed': String(i === sel), onclick: pick(i) }, n)));
    P.setData('link', sel, true);
  }
  draw();
  return el('div', null, el('div', { class: 'mt-two' }, left, right), btns, read);
}

// ------------------------------------------------------------ the rise-over-run visualizer (Stage 3; the original Trail Designer, extended)
const CHALLENGES = [
  { id: 'ten', text: 'Make a 10% climb', test: s => s.m !== null && Math.abs(s.m * 100 - 10) < 1e-9 },
  { id: 'down', text: 'Make a 5% descent (slope −0.05)', test: s => s.m !== null && Math.abs(s.m * 100 + 5) < 1e-9 },
  { id: 'flat', text: 'Make a flat section (slope 0)', test: s => s.m === 0 },
  { id: 'half', text: 'Keep a 10 m rise and double the run: watch the slope halve', test: s => s.rise === 10 && s.run === 400 }
];
export function riseRunViz(ctx) {
  const P = ctx.progress;
  let st = P.getData('rr', { y1: 1200, y2: 1210, run: 200, unit: 'm' }), done = P.getData('rrDone', []);
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), read = el('div', { class: 'mt-read', 'aria-live': 'polite' }), ctl = el('div'), chk = el('ul', { class: 'mt-checks' });
  let last;
  function calc() { const s = slope({ x: 0, y: st.y1 }, { x: st.run, y: st.y2 }); return { ...s, m: s.value === null ? null : Number(s.value), rise: st.y2 - st.y1, run: st.run }; }
  function draw() {
    const s = calc(), u = st.unit;
    last = plot({ x: [-20, 520], y: [1170, 1250], xStep: 100, yStep: 10, xDigits: 0, xLabel: `Horizontal distance (${u})`, yLabel: `Elevation (${u})`, label: `From (0, ${st.y1}) to (${st.run}, ${st.y2}): rise ${s.rise}, run ${st.run}`,
      series: [{ points: [[0, st.y1], [st.run, st.y2]], cls: 'mt-seg' }, ...(s.kind !== 'undefined' && s.rise ? [{ points: [[0, st.y1], [st.run, st.y1]], cls: 'mt-run' }, { points: [[st.run, st.y1], [st.run, st.y2]], cls: 'mt-rise' }] : [])],
      marks: [{ x: 0, y: st.y1, cls: 'mt-pt-a', label: `A (0, ${st.y1})` }, { x: st.run, y: st.y2, cls: 'mt-pt-b', label: `B (${st.run}, ${st.y2})` }] });
    put(fig, last.node);
    put(read, el('p', { class: 'ms-live-eq' }, `rise = ${st.y2} − ${st.y1} = ${signed(s.rise)} ${u}`), el('p', { class: 'ms-live-eq' }, `run = ${st.run} − 0 = ${st.run} ${u}`),
      s.kind === 'undefined' ? el('p', { class: 'ms-live-eq mt-und' }, 'm = rise ÷ 0: undefined (a vertical line, not a trail)') : el('p', { class: 'ms-live-eq' }, `m = ${signed(s.rise)} ÷ ${st.run} = `, el('b', null, S(s.value))),
      s.kind === 'undefined' ? null : el('p', null, `Grade ${signed(grade(s.value))}% · angle ≈ ${angleFromSlope(s.m).toFixed(1)}° (grade isn’t an angle) · ${s.kind}`));
    for (const c of CHALLENGES) if (!done.includes(c.id) && c.test(s)) done.push(c.id);
    P.setData('rrDone', done, true);
    put(chk, CHALLENGES.map(c => el('li', { class: done.includes(c.id) ? 'is-ok' : '' }, done.includes(c.id) ? '✓ ' : '○ ', c.text)));
    P.setData('rr', st, true);
  }
  function controls() {
    put(ctl, slider({ label: 'Start elevation (A)', min: 1180, max: 1240, step: 1, value: st.y1, unit: st.unit, onInput: v => { st.y1 = v; draw(); } }).node,
      slider({ label: 'End elevation (B)', min: 1180, max: 1240, step: 1, value: st.y2, unit: st.unit, onInput: v => { st.y2 = v; draw(); } }).node,
      slider({ label: 'Horizontal distance (run)', min: 0, max: 500, step: 10, value: st.run, unit: st.unit, onInput: v => { st.run = v; draw(); } }).node,
      segs('Units', [{ label: 'meters', value: 'm' }, { label: 'feet', value: 'ft' }], st.unit, v => { st.unit = v; controls(); draw(); }));
  }
  dragXY(fig, () => last, (x, y) => { st.run = Math.max(0, Math.min(500, Math.round(x / 10) * 10)); st.y2 = Math.max(1180, Math.min(1240, Math.round(y))); controls(); draw(); });
  controls(); draw();
  return el('div', null, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('p', { class: 'ls-small' }, 'Drag point B, or use the sliders. Rise and run use the same unit, so grade = slope × 100.')), el('div', { class: 'ms-lab-panel' }, ctl, read)),
    el('div', { class: 'mt-challenges' }, el('p', { class: 'ls-kicker' }, 'Designer challenges (explore: no marks, no penalty)'), chk));
}

// ------------------------------------------------------------ the trail profile designer (Stage 5)
export function profileDesigner(ctx) {
  const P = ctx.progress;
  let st = P.getData('designer', { start: 1200, step: 100, d: [5, 5, 5, 5] });
  const fig = el('div', { class: 'ms-figure' }), tbl = el('div'), read = el('div', { class: 'mt-read', 'aria-live': 'polite' }), ctl = el('div');
  function rows() { const r = [[0, st.start]]; st.d.forEach((d, i) => r.push([(i + 1) * st.step, r[i][1] + d])); return r; }
  function draw() {
    const R = rows(), ys = R.map(r => r[1]), lin = isLinear(R);
    put(fig, plot({ x: [0, 4 * st.step], y: [Math.min(...ys) - 10, Math.max(...ys) + 10], xStep: st.step, xDigits: 0, yDigits: 0, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', label: 'Your trail profile: ' + R.map(r => `(${r[0]}, ${r[1]})`).join(', '),
      series: [{ points: R, cls: lin ? 'mt-prof-line' : 'mt-prof-line is-bent' }], marks: R.map(r => ({ x: r[0], y: r[1], cls: 'mt-prof-pt', r: 5 })) }).node);
    put(tbl, tableEl(R, ['Distance (m)', 'Elevation (m)'], { diffs: true }));
    put(read, status(lin, `Constant rate of change: ${S(rates(R)[0])} m per meter (${signed(grade(rates(R)[0]))}%). Linear: an ideal constant-grade segment.`, 'The rate of change varies, so the profile isn’t linear, like real terrain.'),
      el('p', { class: 'ls-small' }, 'Real trails change grade all the time; a straight-line profile is an idealized model.'));
    P.setData('designer', st, true);
  }
  function controls() {
    put(ctl, slider({ label: 'Starting elevation', min: 1000, max: 1500, step: 10, value: st.start, unit: 'm', onInput: v => { st.start = v; draw(); } }).node,
      segs('Horizontal distance per section', [50, 100, 200].map(v => ({ label: v + ' m', value: v })), st.step, v => { st.step = v; draw(); }),
      st.d.map((d, i) => slider({ label: `Section ${i + 1} elevation change`, min: -20, max: 20, step: 1, value: d, unit: 'm', onInput: v => { st.d[i] = v; draw(); } }).node),
      button('Make every section the same as section 1', () => { st.d = st.d.map(() => st.d[0]); controls(); draw(); }, 'ls-btn--quiet'));
  }
  controls(); draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, tbl), el('div', { class: 'ms-lab-panel' }, read, ctl));
}

// ------------------------------------------------------------ the ride data dashboard (Stages 5 and 6)
export function rideDashboard(ctx) {
  const P = ctx.progress;
  let st = P.getData('dash', { speed: 240, t: 2, start: 0 });
  const tiles = el('div', { class: 'mt-dash' }), fig = el('div', { class: 'ms-figure' }), tbl = el('div'), read = el('div', { class: 'mt-read', 'aria-live': 'polite' });
  function draw() {
    const d = t => st.start + st.speed * t, R = [0, 1, 2, 3, 4, 5].map(t => [t, d(t)]), c = classify(R);
    put(tiles, [['Elapsed time', `${st.t} min`], ['Distance', `${d(st.t).toLocaleString('en-US')} m`], ['Average speed', st.t ? `${((d(st.t) - st.start) / st.t).toLocaleString('en-US')} m/min` : '—'], ['Trail progress', `${Math.round(100 * d(st.t) / (st.start + st.speed * 5))}%`]]
      .map(([k, v]) => el('div', { class: 'mt-tile' }, el('p', { class: 'mt-tile-k' }, k), el('p', { class: 'mt-tile-v' }, v))));
    put(fig, plot({ x: [0, 5], y: [0, Math.max(1600, st.start + st.speed * 5)], xStep: 1, xDigits: 0, xLabel: 'Time t (min)', yLabel: 'Distance d (m)', label: `Distance against time: d = ${st.start ? st.start + ' + ' : ''}${st.speed}t`,
      series: [{ points: R, cls: 'mt-prof-line' }], marks: [{ x: 0, y: 0, cls: 'mt-origin-mark', r: 6, label: '(0, 0)' }, { x: st.t, y: d(st.t), cls: 'mt-prof-on', r: 8 }] }).node);
    put(tbl, tableEl(R.slice(0, 5), ['Time t (min)', 'Distance d (m)'], { diffs: true }));
    put(read, el('p', { class: 'ms-live-eq' }, `d = ${st.start ? st.start + ' + ' : ''}${st.speed}t`),
      status(c === 'proportional', `Proportional: through (0, 0), with k = d ÷ t = ${st.speed} m/min every time.`, `Linear but not proportional: it starts at ${st.start} m, so d ÷ t isn’t constant and the line misses the origin.`),
      el('p', { class: 'ls-small' }, 'Fictional, controlled ride data. Real rides don’t hold a perfectly steady speed.'));
    P.setData('dash', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Rider speed', min: 120, max: 300, step: 10, value: st.speed, unit: 'm/min', onInput: v => { st.speed = v; draw(); } }).node,
    slider({ label: 'Elapsed time', min: 0, max: 5, step: 1, value: st.t, unit: 'min', onInput: v => { st.t = v; draw(); } }).node,
    slider({ label: 'Head start (distance at t = 0)', min: 0, max: 500, step: 50, value: st.start, unit: 'm', onInput: v => { st.start = v; draw(); } }).node);
  draw();
  return el('div', null, tiles, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, tbl), el('div', { class: 'ms-lab-panel' }, ctl, read)));
}

// ------------------------------------------------------------ linear vs proportional side by side (Stage 6)
export function propCompare() {
  const A = [[0, 0], [1, 240], [2, 480], [3, 720], [4, 960]], B = [[0, 1200], [100, 1205], [200, 1210], [300, 1215], [400, 1220]];
  const pa = plot({ x: [0, 4], y: [0, 1000], xStep: 1, xDigits: 0, xLabel: 'Time t (min)', yLabel: 'Distance d (m)', label: 'Graph A: d = 240t passes through the origin', series: [{ points: A, cls: 'mt-prof-line' }], marks: [{ x: 0, y: 0, cls: 'mt-origin-mark', r: 8, label: '(0, 0) ✓' }] }).node;
  const pb = plot({ x: [0, 400], y: [0, 1300], xStep: 100, xDigits: 0, xLabel: 'Horizontal distance x (m)', yLabel: 'Elevation e (m)', label: 'Graph B: e = 1200 + 0.05x starts at 1200', series: [{ points: B, cls: 'mt-prof-line is-b' }], marks: [{ x: 0, y: 0, cls: 'mt-origin-miss', r: 8, label: '(0, 0) ✗' }, { x: 0, y: 1200, cls: 'mt-prof-on', r: 7, label: 'starts at 1200' }] }).node;
  return el('div', { class: 'mt-two' }, el('figure', { class: 'ms-figure' }, el('figcaption', { class: 'ls-small' }, 'A: d = 240t, proportional'), pa), el('figure', { class: 'ms-figure' }, el('figcaption', { class: 'ls-small' }, 'B: e = 1200 + 0.05x, linear but not proportional'), pb));
}
export const diffTable = (rows, headers) => tableEl(rows, headers, { diffs: true });

// ------------------------------------------------------------ read the graph: click a point for its coordinates (Stage 2)
export function readProfile(ctx) {
  const P = ctx.progress;
  let sel = P.getData('readp', null);
  const fig = el('div', { class: 'ms-figure' }), read = el('p', { class: 'ms-live-eq', 'aria-live': 'polite' }), btns = el('div', { class: 'mt-feature-btns' });
  function draw() {
    const p = plot({ x: [0, 600], y: [1195, 1220], xStep: 100, yStep: 5, xDigits: 0, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', label: 'The completed fictional elevation profile; select a point to read its coordinates',
      series: [{ points: PROFILE, cls: 'mt-prof-line' }], marks: PROFILE.map(([x, y], i) => ({ x, y, cls: i === sel ? 'mt-prof-on' : 'mt-prof-pt', r: i === sel ? 8 : 6, label: i === sel ? `(${x}, ${y})` : '' })) });
    p.node.querySelectorAll('circle').forEach((c, i) => { c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', `Point ${i + 1}`); c.addEventListener('click', () => { sel = i; draw(); }); c.addEventListener('keydown', e => { if (e.key === 'Enter') { sel = i; draw(); } }); });
    put(fig, p.node);
    read.textContent = sel === null ? 'Select a point on the profile to read its coordinates.' : `${PROFILE_NAMES[sel]}: (${PROFILE[sel][0]}, ${PROFILE[sel][1]}): ${PROFILE[sel][0]} m along, ${PROFILE[sel][1]} m elevation.`;
    put(btns, PROFILE.map((r, i) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet mt-btn-sm', 'aria-pressed': String(i === sel), onclick: () => { sel = i; draw(); } }, `${r[0]} m`)));
    P.setData('readp', sel, true);
  }
  draw();
  return el('div', null, fig, btns, read, el('p', { class: 'ls-small' }, 'A fictional educational trail profile.'));
}
