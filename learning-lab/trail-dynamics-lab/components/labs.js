// Trail Dynamics Lab interactives. Each returns an element; every number
// shown comes from logic/models.js and logic/quadratic.js (exact roots).
// Every graph has keyboard sliders as well as pointer dragging; settings
// are kept in the lab's progress (getData / setData).

import { el, put, button } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot, dragY } from '../../lesson-kit/plot.js';
import { BRAKE, stopping, D, Bk, TABLE_SPEEDS, J, JUMP, HEIGHTS, RAMP, FACTOR_PRACTICE, pick } from '../logic/models.js';
import { quad, solve, standardText, vertexText, factoredText, completeSquare, atHeight, meetLine, show } from '../logic/quadratic.js';
import { brakeScene, speedometer, jumpScene } from './visuals.js';

const f1 = x => Number(x).toFixed(1), f2 = x => Number(x).toFixed(2);
const curve = (fn, a, b, n = 80) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, fn(x)]; });
const JUMP_WIN = { x: [-2, 22], y: [-1, 6], xLabel: 'x: distance from takeoff (m)', yLabel: 'J(x): height (m)', xStep: 2, yStep: 1, xDigits: 0 };

// ------------------------------------------------------------ Stopping distance simulator (Mission 1)
export function brakeSim(ctx) {
  const P = ctx.progress;
  let st = P.getData('brake', { v: 20, model: 'A' });
  const scene = el('div', { class: 'ms-figure' }), speedo = el('div', { class: 'td-speedo-box' }), fig = el('div', { class: 'ms-figure' });
  const rows = el('tbody'), eq = el('p', { class: 'ms-live-eq', 'aria-live': 'polite' });
  const sv = slider({ label: 'Initial speed v', min: 0, max: 40, step: 1, value: st.v, unit: 'km/h', onInput: x => { st.v = x; draw(true); },
    describe: x => `${x} km/h: ${f1(stopping(st.model, x).total)} m to stop` });
  const mseg = segs('Braking model', [{ label: 'Model A (k = 0.01)', value: 'A' }, { label: 'Model B (k = 0.015)', value: 'B' }], st.model, m => { st.model = m; draw(false); });
  function draw(quiet) {
    const s = stopping(st.model, st.v), maxD = D(BRAKE.models.B, 40);
    put(scene, brakeScene(s, maxD)); put(speedo, speedometer(st.v));
    put(fig, plot({ x: [0, 40], y: [0, 36], xLabel: 'v: speed (km/h)', yLabel: 'D(v): stopping distance (m)', xStep: 5, yStep: 5, xDigits: 0,
      label: `Stopping distance curves for Model A and Model B, point at ${st.v} km/h.`,
      series: [{ points: curve(v => D(BRAKE.models.A, v), 0, 40), cls: 'td-line--a' + (st.model === 'A' ? ' is-on' : '') }, { points: curve(v => D(BRAKE.models.B, v), 0, 40), cls: 'td-line--b' + (st.model === 'B' ? ' is-on' : '') }],
      guides: [{ x: st.v, y: s.total }], marks: [{ x: st.v, y: s.total, cls: 'td-mark--now', label: `${f1(s.total)} m` }] }).node,
      el('ul', { class: 'td-legend td-legend--curves' }, el('li', { class: 'is-a' }, 'Model A: 0.01v² + 0.25v'), el('li', { class: 'is-b' }, 'Model B: 0.015v² + 0.25v')));
    put(rows, [['Initial speed', `${st.v} km/h`], ['Reaction distance', `0.25 × ${st.v} = ${f2(s.reaction)} m`], ['Braking distance', `${s.k} × ${st.v}² = ${f2(s.braking)} m`],
      ['Total stopping distance', `${f2(s.total)} m`], ['Model', `${st.model} (k = ${s.k})`]].map(([k, v]) => el('tr', null, el('th', { scope: 'row' }, k), el('td', { class: 'ms-mono' }, v))));
    put(eq, `D(v) = ${s.k}v² + 0.25v = ${s.k}(${st.v})² + 0.25(${st.v}) = `, el('b', { class: 'td-out' }, `${f2(s.total)} m`));
    P.setData('brake', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' },
    el('div', { class: 'ms-lab-visual' }, scene, el('div', { class: 'td-row' }, speedo, el('ul', { class: 'td-legend' }, el('li', { class: 'is-react' }, 'Reaction distance'), el('li', { class: 'is-brake' }, 'Braking distance'))), fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Model'), mseg), sv.node, eq,
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ms-readout' }, el('caption', { class: 'ls-sr' }, 'Stopping distance readout'), rows)),
      el('p', { class: 'ls-small' }, 'A simplified teaching model with a fixed 0.9 s reaction time and made-up k values. Real stopping depends on terrain, traction, slope, tires, technique and the rider: this is not riding advice.')));
}
export function stopTable() {
  return el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('caption', { class: 'ls-sr' }, 'Stopping distances for models A and B'),
    el('thead', null, el('tr', null, ['Speed', 'Model A stopping distance', 'Model B stopping distance'].map(h => el('th', { scope: 'col' }, h)))),
    el('tbody', null, TABLE_SPEEDS.map(v => el('tr', null, el('th', { scope: 'row' }, `${v} km/h`), el('td', { class: 'ms-mono' }, `${show(D(BRAKE.models.A, v))} m`), el('td', { class: 'ms-mono' }, `${show(D(BRAKE.models.B, v))} m`))))));
}

// Coefficient explorer: B(v) = kv² for any k, against Models A and B.
export function coefficientExplorer(ctx) {
  const P = ctx.progress;
  let k = P.getData('coef', 0.01);
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'td-read', 'aria-live': 'polite' });
  const sk = slider({ label: 'Braking coefficient k', min: 0.005, max: 0.03, step: 0.0025, value: k, onInput: v => { k = v; draw(true); }, format: v => v.toFixed(4).replace(/0+$/, '') });
  function draw(quiet) {
    put(fig, plot({ x: [0, 40], y: [0, 50], xLabel: 'v: speed (km/h)', yLabel: 'B(v): braking distance (m)', xStep: 5, yStep: 10, xDigits: 0, label: `Braking distance kv² for k = ${k}, with Models A and B for comparison.`,
      series: [{ points: curve(v => Bk(BRAKE.models.A, v), 0, 40), cls: 'td-line--a' }, { points: curve(v => Bk(BRAKE.models.B, v), 0, 40), cls: 'td-line--b' }, { points: curve(v => Bk(k, v), 0, 40), cls: 'td-line--k' }],
      vlines: [{ x: 30, cls: 'td-vline', label: '30 km/h' }] }).node);
    put(read, el('ul', { class: 'td-legend' }, el('li', { class: 'is-a' }, 'Model A: 0.01v²'), el('li', { class: 'is-b' }, 'Model B: 0.015v²'), el('li', { class: 'is-k' }, `Yours: ${sk.input.value}v²`)),
      el('p', { class: 'ms-live-eq' }, `At 30 km/h: A ${f1(Bk(BRAKE.models.A, 30))} m · B ${f1(Bk(BRAKE.models.B, 30))} m · yours ${f1(Bk(k, 30))} m`));
    P.setData('coef', k, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sk.node, read,
    el('p', { class: 'ls-small' }, 'A bigger k multiplies every braking distance: a vertical stretch. These are simulated parameters, not real trail surfaces.')));
}

// ------------------------------------------------------------ Jump equation decoder (Mission 2)
export function jumpDecoder(ctx) {
  const P = ctx.progress, Q = J(), S = solve(Q);
  let st = P.getData('decoder', { form: 'vertex', x: 10 });
  const scene = el('div', { class: 'ms-figure' }), fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'td-read', 'aria-live': 'polite' });
  const sx = slider({ label: 'Rider position x', min: 0, max: 20, step: 0.5, value: st.x, unit: 'm', onInput: v => { st.x = v; draw(true); } });
  const tabs = segs('Form', [{ label: 'Standard form', value: 'standard' }, { label: 'Vertex form', value: 'vertex' }, { label: 'Factored form', value: 'factored' }], st.form, v => { st.form = v; draw(false); });
  const INFO = {
    standard: [standardText(Q, 'J'), ['a = −0.04 < 0: opens downward; its size sets the curvature', 'b = 0.8 helps set the axis: x = −b ÷ 2a = 10', 'c = 0: the y-intercept, the takeoff height'], 'td-hi--c'],
    vertex: [vertexText(Q, 'J'), ['(h, k) = (10, 4): the vertex, read straight off', 'k = 4 is the maximum height (a < 0)', 'h = 10 is where it happens: the axis x = 10'], 'td-hi--v'],
    factored: [factoredText(Q, 'J'), ['The zeros are 0 and 20: takeoff and landing at the reference height', 'Horizontal range: 20 m', 'The vertex sits halfway between: x = 10'], 'td-hi--z']
  };
  function draw(quiet) {
    const [eqn, lines] = INFO[st.form];
    const marks = st.form === 'vertex' ? [{ x: 10, y: 4, cls: 'td-mark--vertex', label: 'vertex (10, 4)' }] : st.form === 'factored' ? S.approx.map(z => ({ x: z, y: 0, cls: 'td-mark--zero', label: `x = ${show(z)}` })) : [{ x: 0, y: 0, cls: 'td-mark--c', label: 'c = 0' }];
    put(scene, jumpScene(Q, JUMP.domain, st.x));
    put(fig, plot({ ...JUMP_WIN, label: `The jump J(x) with the ${st.form} form’s features highlighted; rider at x = ${st.x}.`,
      series: [{ points: curve(x => Q.value(x), 0, 20), cls: 'td-line--jump' }], vlines: st.form === 'vertex' ? [{ x: 10, cls: 'td-axis', label: 'x = 10' }] : [],
      marks: [...marks, { x: st.x, y: Q.value(st.x), cls: 'td-mark--now', r: 5 }] }).node);
    put(read, el('p', { class: 'ms-live-eq td-eqn' }, eqn), el('ul', { class: 'td-points' }, lines.map(l => el('li', null, l))),
      el('p', { class: 'ls-small' }, `Rider at x = ${st.x} m: J(${st.x}) = ${f2(Q.value(st.x))} m. All three forms give the same value.`));
    P.setData('decoder', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, scene, fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Show the jump in'), tabs), read, sx.node));
}

// ------------------------------------------------------------ Jump profile tuner (Mission 2)
export function jumpTuner(ctx) {
  const P = ctx.progress, Q0 = J();
  let st = P.getData('tuner', { a: -0.04, h: 10, k: 4 });
  const fig = el('div', { class: 'ms-figure' }), scene = el('div', { class: 'ms-figure' }), read = el('div', { class: 'td-read', 'aria-live': 'polite' });
  const sa = slider({ label: 'a: curvature and direction', min: -0.12, max: 0.12, step: 0.01, value: st.a, onInput: v => { st.a = Math.abs(v) < 1e-9 ? (st.a < 0 ? 0.01 : -0.01) : v; if (st.a !== v) sa.set(st.a); draw(true); }, format: v => v.toFixed(2) });
  const sh = slider({ label: 'h: horizontal shift', min: 0, max: 20, step: 0.5, value: st.h, unit: 'm', onInput: v => { st.h = v; draw(true); } });
  const sk = slider({ label: 'k: vertical shift', min: -2, max: 6, step: 0.5, value: st.k, unit: 'm', onInput: v => { st.k = v; draw(true); } });
  function draw(quiet) {
    const a = Math.round(st.a * 100) / 100, Q = quad(a, -2 * a * st.h, a * st.h * st.h + st.k), S = solve(Q);
    put(fig, plot({ x: [-4, 24], y: [-3, 8], xLabel: 'x (m)', yLabel: 'g(x) (m)', xStep: 2, yStep: 1, xDigits: 0, label: `Original jump and g(x) = ${vertexText(Q, 'g')}.`,
      series: [{ points: curve(x => Q0.value(x), -4, 24), cls: 'td-line--orig' }, { points: curve(x => Q.value(x), -4, 24, 120), cls: 'td-line--jump' }], hlines: [{ y: 0, cls: 'td-ground-ref' }],
      vlines: [{ x: st.h, cls: 'td-axis' }], marks: [{ x: st.h, y: st.k, cls: 'td-mark--vertex', label: `(${show(st.h)}, ${show(st.k)})` }, ...S.approx.filter(z => z > -4 && z < 24).map(z => ({ x: z, y: 0, cls: 'td-mark--zero' }))] }).node);
    const zeros = S.type === 'complex' ? 'none (no real x-intercepts)' : S.type === 'one' ? `one: x = ${S.text}` : `x = ${S.text}${S.rational ? '' : ' ≈ ' + S.approx.map(f2).join(', ')}`;
    put(read, el('p', { class: 'ms-live-eq td-eqn' }, vertexText(Q, 'g')),
      el('ul', { class: 'td-points' }, el('li', null, `Vertex (${show(st.h)}, ${show(st.k)}); axis x = ${show(st.h)}`), el('li', null, `${a < 0 ? 'Maximum' : 'Minimum'}: ${show(st.k)} m (opens ${a < 0 ? 'down' : 'up'})`), el('li', null, `Zeros: ${zeros}`)));
    const dom = S.type === 'two' && a < 0 ? S.approx : null;
    put(scene, dom && dom[1] - dom[0] > 0.5 ? jumpScene(Q, dom, (dom[0] + dom[1]) / 2) : el('p', { class: 'ls-small td-noscene' }, a > 0 ? 'Opening upward: this is a dip, not a jump trajectory.' : 'This curve never reaches the reference height, so there’s no takeoff or landing to draw.'));
    P.setData('tuner', st, quiet);
  }
  draw(true);
  const reset = button('Back to −0.04(x − 10)² + 4', () => { st = { a: -0.04, h: 10, k: 4 }; sa.set(-0.04); sh.set(10); sk.set(4); draw(false); }, 'ls-btn--ghost');
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, scene),
    el('div', { class: 'ms-lab-panel' }, sa.node, sh.node, sk.node, reset, read,
      el('p', { class: 'ls-small' }, 'Mathematical transformations of the model only, not advice about changing real jumps.')));
}

// Factoring practice: the zeros appear on a graph once answered.
export function factorGraph(ctx) {
  return ctx.live(() => {
    const n = ctx.progress.getData('variant:jump', 0), f = pick(FACTOR_PRACTICE, n), Q = quad(f.a, f.b, f.c), S = solve(Q), done = ctx.progress.done('jf-factor', 'v' + n);
    if (!done) return el('p', { class: 'ls-small td-wait' }, 'Answer to see the zeros on the graph.');
    const lo = Math.min(0, Math.floor(S.approx[0]) - 2), hi = Math.ceil(S.approx[S.approx.length - 1]) + 2, vy = Number(Q.k);
    return el('div', { class: 'ms-figure td-graphbox' }, plot({ x: [lo, hi], y: [Math.floor(vy) - 2, Math.max(8, f.c / 4)], xLabel: 'x', yLabel: 'y', xStep: 2, yStep: Math.max(2, Math.round(f.c / 20)), xDigits: 0,
      label: `Graph of ${standardText(Q, 'y')} with its zeros.`, series: [{ points: curve(x => Q.value(x), lo, hi), cls: 'td-line--jump' }], hlines: [{ y: 0, cls: 'td-ground-ref' }],
      marks: [...new Set(S.approx.map(v => v.toFixed(6)))].map(Number).map(z => ({ x: z, y: 0, cls: 'td-mark--zero', label: `x = ${f2(z)}` })) }).node);
  });
}

// ------------------------------------------------------------ Complete-the-square builder (Mission 3)
export function squareBuilder(ctx) {
  const Q = J(), C = completeSquare(Q);
  const STEPS = [
    ['l-cts-factor', 'Factor out the leading coefficient', `J(x) = ${show(C.factorOut)}(x² − ${show(C.inner.neg())}x)`],
    ['l-cts-square', 'Half the x-coefficient, squared', `(${show(C.half)})² = ${show(C.square)}:  x² − 20x = (x − ${show(C.h)})² − ${show(C.square)}`],
    ['l-cts-k', 'Distribute and simplify', `J(x) = ${show(C.factorOut)}[(x − ${show(C.h)})² − ${show(C.square)}] = ${vertexText(Q, 'J').replace('J(x) = ', '')}`]
  ];
  return ctx.live(() => {
    const done = STEPS.map(([id]) => ctx.progress.done(id));
    const all = done.every(Boolean);
    return el('div', { class: 'td-builder' },
      el('p', { class: 'ms-live-eq' }, 'Start: ', standardText(Q, 'J')),
      el('ol', { class: 'td-build-steps' }, STEPS.map(([id, name, line], i) => el('li', { class: done[i] ? 'is-done' : '' }, el('b', null, name + ': '), done[i] ? el('span', { class: 'ms-mono' }, line) : el('span', { class: 'ls-small' }, 'answer the step below to fill this in')))),
      el('div', { class: 'ms-figure' }, plot({ ...JUMP_WIN, label: 'The same graph at every step of completing the square.', series: [{ points: curve(x => Q.value(x), 0, 20), cls: 'td-line--jump' }],
        marks: all ? [{ x: Number(C.h), y: Number(C.k), cls: 'td-mark--vertex', label: `vertex (${show(C.h)}, ${show(C.k)})` }] : [] }).node),
      el('p', { class: 'ls-small' }, all ? 'Done: the vertex is visible in the equation, and the graph never changed. Completing the square rewrites, it doesn’t move anything.' : 'The graph stays the same at every step: only the way it’s written changes.'));
  });
}

// ------------------------------------------------------------ Trajectory height analyzer (Mission 3)
export function heightAnalyzer(ctx) {
  const P = ctx.progress, Q = J();
  let y = P.getData('height', 3);
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), read = el('div', { class: 'td-read', 'aria-live': 'polite' });
  let last;
  const sy = slider({ label: 'Target height y', min: -1, max: 6, step: 0.1, value: y, unit: 'm', onInput: v => { y = v; draw(true); } });
  const presets = el('div', { class: 'ls-actions' }, HEIGHTS.slice().sort().map(h => button(`${h} m`, () => { y = h; sy.set(h); draw(false); }, 'ls-btn--quiet')));
  function draw(quiet) {
    const yy = Math.round(y * 10) / 10, E = atHeight(Q, yy), S = solve(E), d = Number(E.disc);
    const xs = S.type === 'complex' ? [] : S.approx;
    last = plot({ ...JUMP_WIN, label: `Jump trajectory and the line y = ${yy}: ${xs.length} real intersection(s).`,
      series: [{ points: curve(x => Q.value(x), -2, 22), cls: 'td-line--jump' }], hlines: [{ y: yy, cls: d < 0 ? 'td-target td-target--none' : 'td-target', label: `y = ${yy} m` }],
      marks: [...xs.map(x => ({ x, y: yy, cls: 'td-mark--hit', label: `x ≈ ${f2(x)}` })), { x: 10, y: 4, cls: 'td-mark--vertex', r: 4 }] });
    put(fig, last.node);
    const method = d < 0 ? 'Quadratic formula: √ of a negative gives complex roots' : d === 0 ? 'A perfect square: (x − 10)² = 0' : S.rational ? 'Factors nicely (or square roots from vertex form)' : 'Doesn’t factor over the integers: quadratic formula';
    put(read,
      el('p', { class: 'ms-live-eq' }, `J(x) = ${yy}  →  ${standardText(E, 'E').replace('E(x) = ', '')} = 0`),
      el('p', { class: 'ms-live-eq' }, 'Δ = b² − 4ac = ', el('b', { class: d > 0 ? 'ms-ok' : d === 0 ? 'td-out' : 'ms-warn' }, show(E.disc))),
      el('p', null, d > 0 ? status(true, 'Δ > 0: two real intersections', '') : d === 0 ? status(true, 'Δ = 0: one repeated solution, touching the vertex', '') : status(false, '', 'Δ < 0: no real intersections (the jump never reaches this height)')),
      el('p', { class: 'ms-live-eq' }, 'x = ', el('b', null, S.text), S.type === 'two' && !S.rational ? ` ≈ ${S.approx.map(f2).join(' and ')}` : ''),
      el('p', { class: 'ls-small' }, method));
    P.setData('height', yy, quiet);
  }
  dragY(fig, () => last, v => { y = Math.max(-1, Math.min(6, Math.round(v * 10) / 10)); sy.set(y); draw(true); });
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, sy.node, el('p', { class: 'ls-mini-label' }, 'The PRD’s heights'), presets, read,
      el('p', { class: 'ls-small' }, 'Drag the target line up and down. Watch the discriminant: positive, zero and negative match two, one and no real crossings.')));
}

// ------------------------------------------------------------ Landing ramp (linear–quadratic system, Mission 3)
export function rampSystem(ctx) {
  const P = ctx.progress, Q = J();
  let st = P.getData('ramp', { m: RAMP.m, q: RAMP.q });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'td-read', 'aria-live': 'polite' });
  const sm = slider({ label: 'Ramp slope m', min: -1.5, max: 0.5, step: 0.05, value: st.m, onInput: v => { st.m = v; draw(true); }, format: v => v.toFixed(2) });
  const sq = slider({ label: 'Ramp intercept q', min: 0, max: 14, step: 0.5, value: st.q, unit: 'm', onInput: v => { st.q = v; draw(true); } });
  function draw(quiet) {
    const m = Math.round(st.m * 100) / 100, E = meetLine(Q, m, st.q), S = solve(E), xs = S.type === 'complex' ? [] : S.approx;
    put(fig, plot({ ...JUMP_WIN, y: [-1, 12], yStep: 2, label: `Trajectory and the line y = ${m}x + ${st.q}: ${xs.length} intersection(s).`,
      series: [{ points: curve(x => Q.value(x), -2, 22), cls: 'td-line--jump' }, { points: [[-2, m * -2 + st.q], [22, m * 22 + st.q]], cls: 'td-line--ramp' }],
      marks: xs.map(x => ({ x, y: Q.value(x), cls: 'td-mark--hit', label: `(${f2(x)}, ${f2(Q.value(x))})` })) }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `−0.04x² + 0.8x = ${show(m)}x + ${show(st.q)}  →  ${standardText(E, 'E').replace('E(x) = ', '')} = 0`),
      el('p', { class: 'ms-live-eq' }, `Δ = ${show(E.disc)}: `, xs.length === 2 ? 'two crossings' : xs.length === 1 ? 'the line just touches' : 'no crossings'),
      xs.length ? el('p', { class: 'ms-live-eq' }, 'x = ', el('b', null, S.text), S.rational ? '' : ` ≈ ${xs.map(f2).join(' and ')}`) : null);
    P.setData('ramp', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sm.node, sq.node, read,
    el('p', { class: 'ls-small' }, 'A linear–quadratic system: set the line equal to the parabola, get a quadratic, and the discriminant counts the crossings.')));
}
