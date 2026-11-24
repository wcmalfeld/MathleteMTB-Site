// Suspension & Systems Lab interactives. Each returns an element; every
// number shown comes from logic/models.js and logic/expo.js. Every graph has
// keyboard controls; settings are kept in the lab's progress (getData /
// setData). A page asks its questions before the tool that would show their
// answers. Every animation has a static view, and none autoplays.

import { el, put, button, reducedMotion } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { BOUNCE, K, GROW, SOUND } from '../logic/models.js';
import { term, recursive, linear, decayRate, envelope, solveExp, solveEnvelope, firstWhole, logb, I0, level, intensity, combine, sci, sup, pow10, fmt, sciText } from '../logic/expo.js';
import { shockView, dbMeter, capacityBar } from './visuals.js';

const readBox = () => el('div', { class: 'ss-read', 'aria-live': 'polite' });
const pressed = (label, on, onclick) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet ss-toggle', 'aria-pressed': String(!!on), onclick }, label);
const curve = (fn, a, b, n = 240) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n, y = fn(x); return isFinite(y) ? [x, y] : null; });
const table = (head, rows, cap) => el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ss-table' }, el('caption', { class: 'ls-sr' }, cap || ''),
  el('thead', null, el('tr', null, head.map(h => el('th', { scope: 'col' }, h)))), el('tbody', null, rows.map(r => el('tr', null, el('th', { scope: 'row' }, r[0]), r.slice(1).map(c => el('td', { class: 'ms-mono' }, c)))))));
const sub = n => String(n).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('');

// ------------------------------------------------------------ Suspension decay simulator (Mission 1)
export function decaySim(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('decay', { A0: BOUNCE.A0, r: BOUNCE.r, cycles: BOUNCE.cycles, thr: BOUNCE.threshold, t: BOUNCE.cycles * BOUNCE.period });
  let anim = null;
  const shock = el('div', { class: 'ms-figure ss-shock-box' }), fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sA = slider({ label: 'Initial amplitude A₀', min: 5, max: 30, step: 1, value: st.A0, unit: 'mm', onInput: v => { st.A0 = v; draw(true); } });
  const sR = slider({ label: 'Retained fraction per cycle r', min: 0.3, max: 0.95, step: 0.05, value: st.r, onInput: v => { st.r = Math.round(v * 100) / 100; draw(true); }, format: v => v.toFixed(2), describe: v => `r = ${v.toFixed(2)}: keeps ${Math.round(v * 100)}% each cycle` });
  const sN = slider({ label: 'Cycles shown', min: 3, max: 12, step: 1, value: st.cycles, onInput: v => { st.cycles = v; st.t = Math.min(st.t, v * BOUNCE.period); draw(true); } });
  const sT = slider({ label: 'Settling threshold', min: 0.5, max: 5, step: 0.5, value: st.thr, unit: 'mm', onInput: v => { st.thr = v; draw(true); } });
  const sTime = slider({ label: 'Time t', min: 0, max: 6, step: 0.05, value: st.t, unit: 's', onInput: v => { stop(); st.t = Math.min(v, st.cycles * BOUNCE.period); draw(true); }, format: v => v.toFixed(2) });
  const stop = () => { if (anim) cancelAnimationFrame(anim); anim = null; };
  ctx.cleanup(stop);
  const hit = button('Hit a bump', () => {
    stop();
    const end = st.cycles * BOUNCE.period;
    if (reducedMotion()) { st.t = end; sTime.set(end); draw(false); return; }
    const t0 = performance.now(), ms = end * 900;
    const step = now => { st.t = Math.min(end, (now - t0) / ms * end); sTime.set(st.t); draw(true); anim = st.t < end ? requestAnimationFrame(step) : null; };
    anim = requestAnimationFrame(step);
  }, 'ls-btn--primary');
  function draw(quiet) {
    const { A0, r, cycles, thr } = st, P = BOUNCE.period, k = decayRate(r, P), end = cycles * P, t = Math.min(st.t, end);
    const disp = envelope(A0, k, t) * Math.cos(2 * Math.PI * t / P), n = Math.floor(t / P + 1e-9), first = A0 > thr ? firstWhole(A0, r, thr) : 0;
    put(shock, shockView(disp, 30, `Shock ${disp >= 0 ? 'compressed' : 'extended'} ${Math.abs(disp).toFixed(1)} mm at t = ${t.toFixed(2)} s.`));
    const peaks = Array.from({ length: cycles + 1 }, (_, i) => ({ x: i * P, y: term(A0, r, i), cls: term(A0, r, i) < thr ? 'ss-mark--below' : 'ss-mark--peak', r: 4.5 }));
    put(fig, plot({ x: [0, end], y: [-32, 32], xLabel: 't: time (s)', yLabel: 'displacement (mm)', xStep: P * (cycles > 8 ? 2 : 1), yStep: 8, xDigits: 1, label: `Damped oscillation with envelopes ±${A0}(${r})^(t/0.5) and a ±${thr} mm threshold band.`,
      bands: [{ axis: 'y', from: -thr, to: thr, cls: 'ss-band--settled' }],
      series: [{ points: curve(x => envelope(A0, k, x) * Math.cos(2 * Math.PI * x / P), 0, t, 600), cls: 'ss-line--osc' }, { points: curve(x => envelope(A0, k, x), 0, end), cls: 'ss-line--env' }, { points: curve(x => -envelope(A0, k, x), 0, end), cls: 'ss-line--env' }],
      hlines: [{ y: 0, cls: 'ss-zero' }],
      marks: [...peaks, { x: t, y: disp, cls: 'ss-mark--now', r: 6 }] }).node);
    put(read, table(['Measurement', 'Value'], [['Initial amplitude', `${A0} mm`], ['Retained fraction', `${Math.round(r * 100)}%`], ['Decay per cycle', `${Math.round((1 - r) * 100)}%`],
      ['Current cycle', String(n)], ['Current peak amplitude', `${fmt(term(A0, r, n))} mm`], ['Threshold', `${thr} mm (peaks below it are green)`]], 'Telemetry'),
      el('p', { class: 'ms-live-eq ss-eqn' }, `Aₙ = ${A0}(${r})ⁿ`));
    Pr.setData('decay', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual ss-decay-visual' }, shock, fig),
    el('div', { class: 'ms-lab-panel' }, hit, sTime.node, sA.node, sR.node, sN.node, sT.node, read,
      el('p', { class: 'ls-small' }, 'The curve draws the exponential envelope of a simplified spring-and-damper model, not every detail of a real shock. These values are teaching assumptions, not suspension settings. Drag the time slider for a static view.')));
}

// ------------------------------------------------------------ Exponential vs linear (Mission 1)
export function compareModels(ctx) {
  const Pr = ctx.progress;
  let show = Pr.getData('compare', 'diff');
  const box = el('div'), fig = el('div', { class: 'ms-figure' });
  const tabs = segs('Show', [{ label: 'Differences', value: 'diff' }, { label: 'Ratios', value: 'ratio' }], show, v => { show = v; draw(false); });
  function draw(quiet) {
    const N = 6, E = recursive(18, 0.65, N), L = Array.from({ length: N + 1 }, (_, i) => linear(18, -6.3, i));
    const ch = (arr, i) => (i === 0 ? '—' : show === 'diff' ? fmt(arr[i] - arr[i - 1]) : arr[i - 1] === 0 ? '—' : fmt(arr[i] / arr[i - 1], 3));
    put(box, table(['Cycle', 'Exponential Aₙ', show === 'diff' ? 'change' : 'ratio', 'Linear Lₙ', show === 'diff' ? 'change' : 'ratio'],
      E.map((v, i) => [String(i), fmt(v), ch(E, i), fmt(L[i]), ch(L, i)]), 'Exponential vs linear'));
    put(fig, plot({ x: [0, 6], y: [-20, 20], xLabel: 'cycle n', yLabel: 'amplitude (mm)', xStep: 1, yStep: 5, xDigits: 0, label: 'Exponential 18(0.65)ⁿ and linear 18 − 6.3n.',
      bands: [{ axis: 'y', from: -20, to: 0, cls: 'ss-band--impossible' }], hlines: [{ y: 0, cls: 'ss-zero', label: 'amplitude can’t go below 0' }],
      series: [{ points: curve(x => 18 * 0.65 ** x, 0, 6), cls: 'ss-line--env' }, { points: [[0, 18], [6, 18 - 37.8]], cls: 'ss-line--lin' }],
      marks: E.map((v, i) => ({ x: i, y: v, cls: 'ss-mark--peak', r: 4 })).concat(L.map((v, i) => ({ x: i, y: v, cls: 'ss-mark--lin', r: 4 }))) }).node,
      el('ul', { class: 'ss-legend' }, el('li', { class: 'is-env' }, 'Exponential: × 0.65'), el('li', { class: 'is-lin' }, 'Linear: − 6.3')));
    Pr.setData('compare', show, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Compare'), tabs), box,
    el('p', { class: 'ls-small' }, 'Equal ratios: exponential. Equal differences: linear, which goes negative by cycle 3.')));
}

// ------------------------------------------------------------ Geometric sequence explorer (Mission 1)
export function sequenceExplorer(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('sequence', { A0: 18, r: 0.65, form: 'explicit' });
  const box = el('div'), fig = el('div', { class: 'ms-figure' });
  const sA = slider({ label: 'First term A₀', min: 5, max: 30, step: 1, value: st.A0, unit: 'mm', onInput: v => { st.A0 = v; draw(true); } });
  const sR = slider({ label: 'Common ratio r', min: 0.3, max: 0.95, step: 0.05, value: st.r, onInput: v => { st.r = Math.round(v * 100) / 100; draw(true); }, format: v => v.toFixed(2) });
  const tabs = segs('Rule', [{ label: 'Explicit', value: 'explicit' }, { label: 'Recursive', value: 'recursive' }], st.form, v => { st.form = v; draw(false); });
  function draw(quiet) {
    const { A0, r } = st, Ex = Array.from({ length: 7 }, (_, i) => term(A0, r, i)), Rc = recursive(A0, r, 6);
    put(box, el('p', { class: 'ms-live-eq ss-eqn' }, st.form === 'explicit' ? `Aₙ = ${A0}(${r})ⁿ` : `A₀ = ${A0},  Aₙ = ${r}·Aₙ₋₁`),
      table(['n', st.form === 'explicit' ? `${A0}(${r})ⁿ` : `${r} × previous`, 'other rule'], Ex.map((v, i) => [String(i), st.form === 'explicit' ? fmt(v) : (i ? `${r} × ${fmt(Rc[i - 1])} = ${fmt(Rc[i])}` : String(A0)), fmt(st.form === 'explicit' ? Rc[i] : v)]), 'Sequence'),
      status(Ex.every((v, i) => Math.abs(v - Rc[i]) < 1e-9), 'Both rules give the same sequence', 'Mismatch'));
    put(fig, plot({ x: [0, 6], y: [0, 32], xLabel: 'n', yLabel: 'Aₙ (mm)', xStep: 1, yStep: 4, xDigits: 0, label: `Geometric sequence ${A0}(${r})ⁿ.`, marks: Ex.map((v, i) => ({ x: i, y: v, cls: 'ss-mark--peak', r: 5, label: i < 3 ? fmt(v) : null })), series: [{ points: curve(x => term(A0, r, x), 0, 6), cls: 'ss-line--ghost' }] }).node);
    Pr.setData('sequence', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Rule'), tabs), sA.node, sR.node, box));
}

// ------------------------------------------------------------ Exponential transformation studio (Mission 1)
export function expStudio(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('studio', { a: 18, b: 0.65, h: 0, k: 0 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sA = slider({ label: 'a: vertical scale (initial amplitude)', min: -20, max: 30, step: 1, value: st.a, onInput: v => { st.a = v; draw(true); } });
  const sB = slider({ label: 'b: base (decay or growth)', min: 0.2, max: 2, step: 0.05, value: st.b, onInput: v => { st.b = Math.abs(v - 1) < 1e-9 ? (st.b < 1 ? 1.05 : 0.95) : Math.round(v * 100) / 100; if (st.b !== v) sB.set(st.b); draw(true); }, format: v => v.toFixed(2) });
  const sH = slider({ label: 'h: horizontal shift', min: -3, max: 3, step: 0.5, value: st.h, onInput: v => { st.h = v; draw(true); } });
  const sK = slider({ label: 'k: vertical shift', min: -8, max: 8, step: 1, value: st.k, onInput: v => { st.k = v; draw(true); } });
  function draw(quiet) {
    const { a, b, h, k } = st, g = x => a * Math.pow(b, x - h) + k;
    const eq = `g(x) = ${a}(${b})${h === 0 ? 'ˣ' : `^(x ${h > 0 ? '−' : '+'} ${Math.abs(h)})`}${k ? (k > 0 ? ' + ' : ' − ') + Math.abs(k) : ''}`;
    put(fig, plot({ x: [-4, 8], y: [-20, 40], xLabel: 'x', yLabel: 'y', xStep: 1, yStep: 10, xDigits: 0, label: `${eq}, with the parent 18(0.65)ˣ.`,
      series: [{ points: curve(x => 18 * 0.65 ** x, -4, 8), cls: 'ss-line--ghost' }, { points: curve(g, -4, 8).map(p => (p && Math.abs(p[1]) < 200 ? p : null)), cls: 'ss-line--env' }],
      hlines: [{ y: k, cls: 'ss-asym', label: `y = ${k}` }], marks: [{ x: h, y: a + k, cls: 'ss-mark--now', label: `(${h}, ${a + k})` }] }).node);
    put(read, el('p', { class: 'ms-live-eq ss-eqn' }, eq), el('ul', { class: 'ss-points' },
      el('li', null, a === 0 ? 'a = 0: a flat line' : b < 1 ? `0 < b < 1: decay (keeps ${Math.round(b * 100)}% per step)` : `b > 1: growth (× ${b} per step)`),
      el('li', null, `Horizontal asymptote y = ${k}`), el('li', null, `Domain: all real x; range: ${a > 0 ? `y > ${k}` : a < 0 ? `y < ${k}` : `y = ${k}`}`),
      el('li', null, a < 0 ? 'Negative a: reflected across the asymptote' : `a = ${a}: the value at x = h is ${a + k}`)));
    Pr.setData('studio', st, quiet);
  }
  draw(true);
  const reset = button('Back to 18(0.65)ˣ', () => { st = { a: 18, b: 0.65, h: 0, k: 0 }; sA.set(18); sB.set(0.65); sH.set(0); sK.set(0); draw(false); }, 'ls-btn--ghost ss-math');
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('ul', { class: 'ss-legend' }, el('li', { class: 'is-ghost' }, 'Parent 18(0.65)ˣ'), el('li', { class: 'is-env' }, 'g(x)'))),
    el('div', { class: 'ms-lab-panel' }, sA.node, sB.node, sH.node, sK.node, reset, read,
      el('p', { class: 'ls-small' }, 'Mathematical transformations of the model. The physical meaning stays separate: only A₀ and r describe the shock.')));
}

// ------------------------------------------------------------ Cycle versus time (Mission 1)
export function cycleTime(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('cycletime', { view: 'discrete', n: 3 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const tabs = segs('View', [{ label: 'Discrete: cycles', value: 'discrete' }, { label: 'Continuous: time', value: 'continuous' }], st.view, v => { st.view = v; draw(false); });
  const sN = slider({ label: 'Cycle n', min: 0, max: 8, step: 1, value: st.n, onInput: v => { st.n = v; draw(true); }, describe: v => `cycle ${v}, t = ${v * 0.5} s` });
  function draw(quiet) {
    const n = st.n, t = n * BOUNCE.period, an = term(18, 0.65, n), at = envelope(18, K, t), disc = st.view === 'discrete';
    put(fig, plot({ x: disc ? [0, 8] : [0, 4], y: [0, 20], xLabel: disc ? 'n: cycle' : 't: time (s)', yLabel: 'amplitude (mm)', xStep: disc ? 1 : 0.5, yStep: 4, xDigits: disc ? 0 : 1, label: disc ? 'Peaks Aₙ = 18(0.65)ⁿ.' : 'Envelope A(t) = 18e^(−0.8616t) with peaks every 0.5 s.',
      series: disc ? [] : [{ points: curve(x => envelope(18, K, x), 0, 4), cls: 'ss-line--env' }],
      marks: Array.from({ length: 9 }, (_, i) => ({ x: disc ? i : i * 0.5, y: term(18, 0.65, i), cls: i === n ? 'ss-mark--now' : 'ss-mark--peak', r: i === n ? 7 : 4.5 })) }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `A${sub(n)} = 18(0.65)${sup(n)} = `, el('b', { class: 'ss-out' }, `${fmt(an, 4)} mm`)),
      el('p', { class: 'ms-live-eq' }, `A(${t}) = 18e^(−0.8616 × ${t}) = `, el('b', { class: 'ss-out' }, `${fmt(at, 4)} mm`)),
      status(Math.abs(an - at) < 1e-9, `Same value: cycle ${n} is t = ${t} s`, 'Different'));
    Pr.setData('cycletime', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'View'), tabs), sN.node, read,
    el('p', { class: 'ls-small' }, 'k = −ln(0.65) ÷ 0.5 is kept at full precision, so the continuous envelope passes exactly through every peak.')));
}

// ------------------------------------------------------------ Settling time calculator (Mission 1)
export function settleCalc(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('settle', { A0: 18, r: 0.65, thr: 2, mode: 'time' });
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sA = slider({ label: 'Initial amplitude A₀', min: 5, max: 30, step: 1, value: st.A0, unit: 'mm', onInput: v => { st.A0 = v; draw(true); } });
  const sR = slider({ label: 'Retained fraction r', min: 0.3, max: 0.95, step: 0.05, value: st.r, onInput: v => { st.r = Math.round(v * 100) / 100; draw(true); }, format: v => v.toFixed(2) });
  const sT = slider({ label: 'Threshold', min: 0.5, max: 5, step: 0.5, value: st.thr, unit: 'mm', onInput: v => { st.thr = v; draw(true); } });
  const tabs = segs('Solve for', [{ label: 'Time (s)', value: 'time' }, { label: 'Cycles', value: 'cycles' }], st.mode, v => { st.mode = v; draw(false); });
  function draw(quiet) {
    const { A0, r, thr } = st, k = decayRate(r, BOUNCE.period), ok = A0 > thr;
    const tt = ok ? solveEnvelope(A0, k, thr) : 0, nn = ok ? solveExp(A0, r, thr) : 0, first = ok ? firstWhole(A0, r, thr) : 0, time = st.mode === 'time';
    const xmax = Math.max(2, Math.ceil((time ? tt : nn) * 1.4));
    put(fig, plot({ x: [0, xmax], y: [0, Math.max(A0, 6) * 1.1], xLabel: time ? 't (s)' : 'n (cycles)', yLabel: 'amplitude (mm)', xStep: niceStep(xmax), yStep: A0 > 20 ? 5 : 2, xDigits: time && xmax < 6 ? 1 : 0, label: `Threshold crossing at ${time ? fmt(tt, 2) + ' s' : fmt(nn, 2) + ' cycles'}.`,
      series: [{ points: curve(x => (time ? envelope(A0, k, x) : term(A0, r, x)), 0, xmax), cls: 'ss-line--env' }], hlines: [{ y: thr, cls: 'ss-settle', label: `${thr} mm` }],
      marks: ok ? [{ x: time ? tt : nn, y: thr, cls: 'ss-mark--now', label: time ? `t ≈ ${fmt(tt, 2)} s` : `n ≈ ${fmt(nn, 2)}` }] : [] }).node);
    put(read, !ok ? el('p', null, status(false, '', 'The amplitude starts at or below the threshold.')) : time
      ? [el('p', { class: 'ms-live-eq' }, `${A0}e^(−${fmt(k, 4)}t) = ${thr}`), el('p', { class: 'ms-live-eq' }, `−${fmt(k, 4)}t = ln(${thr}/${A0})`), el('p', { class: 'ms-live-eq' }, 't = ', el('b', { class: 'ss-out' }, `${fmt(tt, 2)} s`))]
      : [el('p', { class: 'ms-live-eq' }, `${A0}(${r})ⁿ = ${thr}`), el('p', { class: 'ms-live-eq' }, `n = ln(${thr}/${A0}) ÷ ln(${r})`), el('p', { class: 'ms-live-eq' }, 'n ≈ ', el('b', { class: 'ss-out' }, fmt(nn, 2)), `: first peak below at cycle ${first}`)]);
    Pr.setData('settle', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Solve for'), tabs), sA.node, sR.node, sT.node, read,
    el('p', { class: 'ls-small' }, 'The threshold is an arbitrary teaching measurement, not a suspension tuning specification.')));
}
const niceStep = m => (m <= 4 ? 0.5 : m <= 10 ? 1 : m <= 20 ? 2 : 5);

// ------------------------------------------------------------ Event growth simulator (Mission 2)
export function growthSim(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('growth', { R0: GROW.R0, pct: GROW.pct, weeks: GROW.weeks, lin: true });
  const bar = el('div'), fig = el('div', { class: 'ms-figure' }), read = readBox(), tg = el('div', { class: 'ls-actions' });
  const sR = slider({ label: 'Initial registrations', min: 50, max: 200, step: 10, value: st.R0, onInput: v => { st.R0 = v; draw(true); } });
  const sP = slider({ label: 'Weekly growth', min: 5, max: 40, step: 5, value: st.pct, unit: '%', onInput: v => { st.pct = v; draw(true); } });
  const sW = slider({ label: 'Weeks', min: 1, max: 10, step: 1, value: st.weeks, onInput: v => { st.weeks = v; draw(true); } });
  function draw(quiet) {
    const { R0, pct, weeks } = st, f = 1 + pct / 100, step = R0 * pct / 100, rows = Array.from({ length: weeks + 1 }, (_, w) => [String(w), String(Math.round(term(R0, f, w))), String(Math.round(linear(R0, step, w)))]);
    put(tg, pressed(`Compare with +${fmt(step, 1)} riders a week`, st.lin, () => { st.lin = !st.lin; draw(false); }));
    put(bar, capacityBar(term(R0, f, weeks), GROW.capacity));
    put(fig, plot({ x: [0, 10], y: [0, 500], xLabel: 'w: weeks', yLabel: 'registrations', xStep: 1, yStep: 100, xDigits: 0, label: `R(w) = ${R0}(${fmt(f, 2)})ʷ${st.lin ? ` and L(w) = ${R0} + ${fmt(step, 1)}w` : ''}.`,
      bands: [{ axis: 'x', from: 6, to: 10, cls: 'ss-band--outside' }], hlines: [{ y: GROW.capacity, cls: 'ss-cap-line', label: 'capacity 300' }],
      series: [{ points: curve(w => term(R0, f, w), 0, weeks), cls: 'ss-line--grow' }, ...(st.lin ? [{ points: [[0, R0], [weeks, linear(R0, step, weeks)]], cls: 'ss-line--lin' }] : [])],
      marks: Array.from({ length: weeks + 1 }, (_, w) => ({ x: w, y: Math.min(499, term(R0, f, w)), cls: 'ss-mark--grow', r: 4 })) }).node,
      el('ul', { class: 'ss-legend' }, el('li', { class: 'is-grow' }, `× ${fmt(f, 2)} a week`), st.lin ? el('li', { class: 'is-lin' }, `+ ${fmt(step, 1)} a week`) : null, el('li', { class: 'is-outside' }, 'outside the planning window')));
    put(read, el('p', { class: 'ms-live-eq ss-eqn' }, `R(w) = ${R0}(${fmt(f, 2)})ʷ`), table(['Week', 'Exponential', 'Linear'], rows, 'Weekly registrations'));
    Pr.setData('growth', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, bar, fig), el('div', { class: 'ms-lab-panel' }, sR.node, sP.node, sW.node, tg, read,
    el('p', { class: 'ls-small' }, 'Fictional registrations, modelled for a limited planning period (weeks 0–6). Not a prediction of unlimited growth.')));
}

// ------------------------------------------------------------ Growth target calculator (Mission 2)
export function targetCalc(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('target', { R0: 100, pct: 20, target: 250 });
  const read = readBox(), fig = el('div', { class: 'ms-figure' });
  const sR = slider({ label: 'Initial registrations', min: 50, max: 200, step: 10, value: st.R0, onInput: v => { st.R0 = v; draw(true); } });
  const sP = slider({ label: 'Weekly growth', min: 5, max: 40, step: 5, value: st.pct, unit: '%', onInput: v => { st.pct = v; draw(true); } });
  const sT = slider({ label: 'Target registrations', min: 100, max: 300, step: 10, value: st.target, onInput: v => { st.target = v; draw(true); } });
  function draw(quiet) {
    const { R0, pct, target } = st, f = 1 + pct / 100, ok = target > R0, w = ok ? solveExp(R0, f, target) : 0, wk = ok ? firstWhole(R0, f, target) : 0;
    const xm = Math.max(4, Math.ceil(w) + 2);
    put(fig, plot({ x: [0, xm], y: [0, Math.max(target, term(R0, f, xm)) * 1.05], xLabel: 'w: weeks', yLabel: 'registrations', xStep: 1, yStep: niceStep(target / 4) * 25, xDigits: 0, label: `R(w) reaches ${target} at w ≈ ${fmt(w, 2)}.`,
      series: [{ points: curve(x => term(R0, f, x), 0, xm), cls: 'ss-line--grow' }], hlines: [{ y: target, cls: 'ss-settle', label: `target ${target}` }],
      marks: ok ? [{ x: w, y: target, cls: 'ss-mark--now', label: `w ≈ ${fmt(w, 2)}` }, { x: wk, y: term(R0, f, wk), cls: 'ss-mark--grow', label: `week ${wk}: ${Math.round(term(R0, f, wk))}` }] : [] }).node);
    put(read, !ok ? status(false, '', 'The target is already reached at week 0.') : [
      el('p', { class: 'ms-live-eq' }, `${R0}(${fmt(f, 2)})ʷ = ${target}`), el('p', { class: 'ms-live-eq' }, `w·ln(${fmt(f, 2)}) = ln(${fmt(target / R0, 4)})`),
      el('p', { class: 'ms-live-eq' }, 'w = ', el('b', { class: 'ss-out' }, `${fmt(w, 2)} weeks`)), el('p', null, `First weekly check-in at or above ${target}: week ${wk} (${Math.round(term(R0, f, wk))} riders).`)]);
    Pr.setData('target', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sR.node, sP.node, sT.node, read));
}

// ------------------------------------------------------------ Decibel analyzer (Mission 3)
export function dbAnalyzer(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('db', { e: -5, other: null });
  const meter = el('div', { class: 'ms-figure ss-meter-box' }), fig = el('div', { class: 'ms-figure' }), read = readBox(), pre = el('div', { class: 'ls-actions' }), cmp = el('div', { class: 'ls-actions' });
  const sE = slider({ label: 'Intensity I = 10ⁿ W/m²: n', min: -12, max: -1, step: 0.1, value: st.e, onInput: v => { st.e = Math.round(v * 10) / 10; draw(true); }, format: v => v.toFixed(1), describe: v => `I = 10 to the ${v.toFixed(1)}: ${(10 * (v + 12)).toFixed(0)} dB` });
  function draw(quiet) {
    const I = Math.pow(10, st.e), L = level(I), oth = st.other === null ? null : SOUND.locations[st.other], Lc = oth ? combine(L, level(Math.pow(10, oth.e))) : null;
    put(pre, SOUND.locations.map(l => pressed(l.name, Math.abs(l.e - st.e) < 1e-9, () => { st.e = l.e; sE.set(l.e); draw(false); })));
    put(cmp, el('span', { class: 'ls-mini-label' }, 'Add a second source'), SOUND.locations.map((l, i) => pressed(l.name, st.other === i, () => { st.other = st.other === i ? null : i; draw(false); })));
    put(meter, dbMeter(Lc ?? L, `Meter reading ${fmt(Lc ?? L, 1)} dB.`));
    put(fig, plot({ x: [-12, 0], y: [0, 120], xLabel: 'log₁₀ I  (I in W/m²)', yLabel: 'L (dB)', xStep: 1, yStep: 20, xDigits: 0, label: `L = 10 log₁₀(I/10⁻¹²): ${fmt(L, 1)} dB at I = 10^${st.e}.`,
      series: [{ points: [[-12, 0], [0, 120]], cls: 'ss-line--db' }], guides: [{ x: st.e, y: L }],
      marks: [{ x: st.e, y: L, cls: 'ss-mark--now', label: `${fmt(L, 1)} dB` }, ...SOUND.locations.map(l => ({ x: l.e, y: level(Math.pow(10, l.e)), cls: 'ss-mark--peak', r: 4 }))] }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `L = 10·log₁₀(${pow10(st.e)} / 10⁻¹²) = 10·log₁₀(${pow10(Math.round((st.e + 12) * 10) / 10)})`),
      el('p', { class: 'ms-live-eq' }, '= ', el('b', { class: 'ss-out' }, `${fmt(L, 1)} dB`)),
      oth ? el('p', null, `With the second source, ${oth.name} (${fmt(level(Math.pow(10, oth.e)), 0)} dB) too: intensities add → `, el('b', null, `${fmt(Lc, 2)} dB`), ', not the sum of the decibels.') : null);
    Pr.setData('db', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, meter, fig), el('div', { class: 'ms-lab-panel' }, el('span', { class: 'ls-mini-label' }, 'Locations (fictional readings)'), pre, sE.node, cmp, read,
    el('p', { class: 'ls-small' }, 'Uses the definition of sound intensity level with I₀ = 10⁻¹² W/m². It doesn’t measure real sound and isn’t a safety assessment.')));
}

// ------------------------------------------------------------ Exponential ⇄ logarithmic converter (Mission 3)
export function converter(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('convert', { base: 10, x: 4 });
  const read = readBox();
  const bases = segs('Base', [{ label: 'Base 10', value: 10 }, { label: 'Base 2', value: 2 }, { label: 'Base e', value: 'e' }], st.base, v => { st.base = v; draw(false); });
  const sX = slider({ label: 'Exponent x', min: -4, max: 8, step: 0.5, value: st.x, onInput: v => { st.x = v; draw(true); } });
  function draw(quiet) {
    const b = st.base === 'e' ? Math.E : st.base, bs = st.base === 'e' ? 'e' : String(st.base), y = Math.pow(b, st.x), yt = Math.abs(y) >= 1e6 || (y > 0 && y < 1e-3) ? sciText(y, 4) : fmt(y, 4);
    const lg = st.base === 10 ? 'log' : st.base === 'e' ? 'ln' : `log${String(st.base).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('')}`;
    put(read, el('div', { class: 'ss-convert' },
      el('div', null, el('span', { class: 'ss-tag' }, 'Exponential form'), el('p', { class: 'ms-live-eq ss-eqn' }, `${bs}${sup(st.x)} = ${yt}`)),
      el('div', { class: 'ss-arrow', 'aria-hidden': 'true' }, '⇄'),
      el('div', null, el('span', { class: 'ss-tag' }, 'Logarithmic form'), el('p', { class: 'ms-live-eq ss-eqn' }, `${lg}(${yt}) = ${st.x}`))),
      el('p', { class: 'ls-small' }, `The log answers: “${bs} to what power gives ${yt}?” → ${st.x}.${st.base === 10 ? ` In the sound model, L/10 = log₁₀(I/I₀) ⇔ I/I₀ = 10^(L/10).` : ''}`));
    Pr.setData('convert', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Base'), bases), sX.node, read);
}

// ------------------------------------------------------------ Logarithm workbench (Mission 3)
export function logWorkbench(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('logbench', { prop: 'product', M: 100, N: 1000, p: 2, b: 3, x: 20 });
  const box = el('div', { class: 'ss-bench' }), ctl = el('div', { class: 'ss-ctl' });
  const sM = slider({ label: 'M', min: 1, max: 1000, step: 1, value: st.M, onInput: v => { st.M = v; draw(true); } });
  const sN = slider({ label: 'N', min: 1, max: 1000, step: 1, value: st.N, onInput: v => { st.N = v; draw(true); } });
  const sP = slider({ label: 'p', min: -3, max: 5, step: 0.5, value: st.p, onInput: v => { st.p = v; draw(true); } });
  const sB = slider({ label: 'Base b', min: 2, max: 10, step: 1, value: st.b, onInput: v => { st.b = v; draw(true); } });
  const sX = slider({ label: 'x', min: 1, max: 200, step: 1, value: st.x, onInput: v => { st.x = v; draw(true); } });
  const tabs = segs('Property', [{ label: 'Product', value: 'product' }, { label: 'Quotient', value: 'quotient' }, { label: 'Power', value: 'power' }, { label: 'Change of base', value: 'change' }], st.prop, v => { st.prop = v; draw(false); });
  function draw(quiet) {
    const { M, N, p, b, x } = st, L = v => logb(v), f4 = v => fmt(v, 4);
    put(ctl, st.prop === 'change' ? [sB.node, sX.node] : st.prop === 'power' ? [sM.node, sP.node] : [sM.node, sN.node]);
    const rows = {
      product: [`log(${M} × ${N}) = log(${M * N})`, f4(L(M * N)), `log ${M} + log ${N} = ${f4(L(M))} + ${f4(L(N))}`, f4(L(M) + L(N))],
      quotient: [`log(${M} ÷ ${N}) = log(${fmt(M / N, 4)})`, f4(L(M / N)), `log ${M} − log ${N} = ${f4(L(M))} − ${f4(L(N))}`, f4(L(M) - L(N))],
      power: [`log(${M}${sup(p)})`, f4(L(Math.pow(M, p))), `${p} × log ${M} = ${p} × ${f4(L(M))}`, f4(p * L(M))],
      change: [`ln ${x} ÷ ln ${b} = ${f4(Math.log(x))} ÷ ${f4(Math.log(b))}`, f4(logb(x, b)), `log ${x} ÷ log ${b} = ${f4(L(x))} ÷ ${f4(L(b))}`, f4(L(x) / L(b))]
    }[st.prop];
    put(box, el('p', { class: 'ms-live-eq ss-eqn' }, { product: 'log(MN) = log M + log N', quotient: 'log(M/N) = log M − log N', power: 'log(Mᵖ) = p·log M', change: `log_b(x) = ln x ÷ ln b = log x ÷ log b` }[st.prop]),
      table(['', 'Value'], [[rows[0], rows[1]], [rows[2], rows[3]]], 'Both sides'),
      status(Math.abs(Number(rows[1]) - Number(rows[3])) < 1e-3, st.prop === 'change' ? `log${String(b).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('')}(${x}) ≈ ${rows[1]} either way` : 'Both sides agree', 'Mismatch'),
      st.prop === 'product' ? el('p', { class: 'ls-small' }, `But log(${M} + ${N}) = ${f4(L(M + N))}: a sum inside a log doesn’t split.`) : null);
    Pr.setData('logbench', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Property'), tabs), ctl, box);
}

// ------------------------------------------------------------ Logarithmic transformation studio (extension)
export function logStudio(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('logstudio', { a: 2, b: 2, h: 3, k: 1, inverse: false });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), tg = el('div', { class: 'ls-actions' });
  const sA = slider({ label: 'a: vertical scale', min: -3, max: 3, step: 0.5, value: st.a, onInput: v => { st.a = v; draw(true); } });
  const sB = slider({ label: 'b: base', min: 2, max: 10, step: 1, value: st.b, onInput: v => { st.b = v; draw(true); } });
  const sH = slider({ label: 'h: horizontal shift', min: -4, max: 4, step: 1, value: st.h, onInput: v => { st.h = v; draw(true); } });
  const sK = slider({ label: 'k: vertical shift', min: -4, max: 4, step: 1, value: st.k, onInput: v => { st.k = v; draw(true); } });
  function draw(quiet) {
    const { a, b, h, k } = st, g = x => (x - h > 0 ? a * Math.log(x - h) / Math.log(b) + k : NaN);
    const bsub = String(b).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join(''), eq = `g(x) = ${a}·log${bsub}(x ${h >= 0 ? '−' : '+'} ${Math.abs(h)}) ${k >= 0 ? '+' : '−'} ${Math.abs(k)}`;
    put(tg, pressed(`Show the parent’s inverse, ${b}ˣ`, st.inverse, () => { st.inverse = !st.inverse; draw(false); }));
    put(fig, plot({ x: [-6, 10], y: [-6, 8], xLabel: 'x', yLabel: 'y', xStep: 2, yStep: 2, xDigits: 0, label: `${eq}; vertical asymptote x = ${h}.`,
      series: [{ points: curve(x => (x > 0 ? Math.log(x) / Math.log(b) : NaN), 0.001, 10, 400), cls: 'ss-line--ghost' }, { points: curve(g, h + 0.0005, 10, 600), cls: 'ss-line--db' },
        ...(st.inverse ? [{ points: curve(x => Math.pow(b, x), -6, 3), cls: 'ss-line--env' }, { points: [[-6, -6], [8, 8]], cls: 'ss-line--mirror' }] : [])],
      vlines: [{ x: h, cls: 'ss-asym', label: `x = ${h}` }], marks: [{ x: h + 1, y: k, cls: 'ss-mark--now', label: `(${h + 1}, ${k})` }] }).node);
    put(read, el('p', { class: 'ms-live-eq ss-eqn' }, eq), el('ul', { class: 'ss-points' }, el('li', null, `Domain x > ${h} (the argument must be positive)`), el('li', null, `Vertical asymptote x = ${h}`), el('li', null, 'Range: all real numbers'),
      el('li', null, a < 0 ? 'Negative a reflects it across the x-axis direction' : `Passes through (${h + 1}, ${k}), since log(1) = 0`)));
    Pr.setData('logstudio', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sA.node, sB.node, sH.node, sK.node, tg, read));
}
