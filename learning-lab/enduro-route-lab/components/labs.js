// Enduro Route Intelligence Lab interactives. Each returns an element; every
// number shown comes from logic/models.js and logic/rational.js (exact
// algebra). Every graph has keyboard controls; settings are kept in the
// lab's progress (getData / setData). A page asks its questions before the
// tool that would show their answers.

import { el, put, button, reducedMotion } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { CLOCK, clock, SPLIT, split, flowTime, techTime, splitQuadratic, PER_KM, SPEED_RATIO, CAL, SURVEY, surveyD, WHEEL, wheelY, STUDIO } from '../logic/models.js';
import { add, sub, mul, div, simplify, features, evalAt, value, text, factoredRat, rationalRoots, sqrtExact, surdText, ratHigh, show, ptext, Frac } from '../logic/rational.js';
import { stageMap, splitMap, surveyTriangle, wheelView } from './visuals.js';

const f1 = x => Number(x).toFixed(1), f2 = x => Number(x).toFixed(2), f3 = x => Number(x).toFixed(3);
const curveFn = (fn, a, b, n = 200) => { const out = []; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = fn(x); out.push(y === null || !isFinite(y) ? null : [x, y]); } return out; };
const readBox = () => el('div', { class: 'er-read', 'aria-live': 'polite' });
const pressed = (label, on, onclick) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet er-toggle', 'aria-pressed': String(!!on), onclick }, label);
const mmss = min => { const s = Math.round(min * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const clip = (y, lo, hi) => (y === null ? null : y < lo - 50 || y > hi + 50 ? null : y);
// rational curve with breaks at the excluded inputs, so asymptotes aren't joined across
function ratCurve(r, a, b, lo, hi, n = 400) {
  const ex = r.excluded.map(Number), out = [];
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; if (ex.some(e => Math.abs(x - e) < (b - a) / n)) { out.push(null); continue; } out.push([x, clip(value(r, x), lo, hi)]); }
  return out.map(p => (p && p[1] === null ? null : p));
}

// ------------------------------------------------------------ Race clock simulator (Mission 1)
export function raceClock(ctx) {
  const Pr = ctx.progress, T = clock();
  let st = Pr.getData('clock', { v: 18 }), anim = null, f = 1;
  const map = el('div', { class: 'ms-figure' }), fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sv = slider({ label: 'Average speed v', min: 1, max: 40, step: 1, value: st.v, unit: 'km/h', onInput: v => { st.v = v; stop(); f = 1; draw(true); }, describe: v => `${v} km/h: ${f1(8 + 360 / v)} minutes total` });
  const stop = () => { if (anim) cancelAnimationFrame(anim); anim = null; };
  ctx.cleanup(stop);
  const ride = button('Ride the stage', () => {
    stop();
    if (reducedMotion()) { f = 1; draw(false); return; }
    const ms = Math.min(6000, (360 / st.v) * 120), t0 = performance.now();          // longer stage time → longer ride
    const step = now => { f = Math.min(1, (now - t0) / ms); draw(true); if (f < 1) anim = requestAnimationFrame(step); else anim = null; };
    f = 0; anim = requestAnimationFrame(step);
  }, 'ls-btn--primary');
  function draw(quiet) {
    const v = st.v, stage = 360 / v, total = 8 + stage;
    put(map, stageMap(f, mmss(8 + stage * f), `Stage map: rider ${Math.round(f * 100)}% through at ${v} km/h.`));
    put(fig, plot({ x: [0, 40], y: [0, 100], xLabel: 'v: average speed (km/h)', yLabel: 'T(v): total time (min)', xStep: 5, yStep: 20, xDigits: 0, label: `T(v) = 8 + 360/v with the point at ${v} km/h.`,
      series: [{ points: curveFn(x => (x < 3.4 ? null : value(T, x)), 0.1, 40), cls: 'er-line--t' }], hlines: [{ y: 8, cls: 'er-asym', label: 'T = 8' }],
      guides: [{ x: v, y: total }], marks: [{ x: v, y: Math.min(total, 100), cls: 'er-mark--now', label: `${f1(total)} min` }] }).node);
    put(read, el('table', { class: 'ls-table ms-readout' }, el('caption', { class: 'ls-sr' }, 'Timing'), el('tbody', null,
      [['Fixed transition', '8 min'], ['Stage time 360/v', `360 ÷ ${v} = ${f2(stage)} min`], ['Total elapsed', `${f2(total)} min (${mmss(total)})`]].map(([k, x]) => el('tr', null, el('th', { scope: 'row' }, k), el('td', { class: 'ms-mono' }, x))))),
      el('p', { class: 'ms-live-eq' }, `T(${v}) = 8 + 360/${v} = `, el('b', { class: 'er-out' }, `${f2(total)} min`)));
    Pr.setData('clock', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, map, fig),
    el('div', { class: 'ms-lab-panel' }, sv.node, ride, read, el('p', { class: 'ls-small' }, 'An idealised model: one representative average speed for the whole stage. The 8 minutes never shrink, which is why T approaches 8, not 0.')));
}

// ------------------------------------------------------------ Asymptote explorer (Mission 1)
export function asymptoteExplorer(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('asym', { D: 6, t0: 8, v: 12, va: true, ha: true });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), tg = el('div', { class: 'ls-actions' });
  const sD = slider({ label: 'Route distance D', min: 1, max: 12, step: 1, value: st.D, unit: 'km', onInput: v => { st.D = v; draw(true); } });
  const sT = slider({ label: 'Fixed transition t₀', min: 0, max: 15, step: 1, value: st.t0, unit: 'min', onInput: v => { st.t0 = v; draw(true); } });
  const sV = slider({ label: 'Speed marker v', min: 1, max: 40, step: 1, value: st.v, unit: 'km/h', onInput: v => { st.v = v; draw(true); } });
  function draw(quiet) {
    const T = clock(st.D, st.t0), y = Number(evalAt(T, st.v));
    put(tg, pressed('Vertical asymptote', st.va, () => { st.va = !st.va; draw(false); }), pressed('Horizontal asymptote', st.ha, () => { st.ha = !st.ha; draw(false); }));
    put(fig, plot({ x: [0, 40], y: [0, 120], xLabel: 'v (km/h)', yLabel: 'T (min)', xStep: 5, yStep: 20, xDigits: 0, label: `T(v) = ${st.t0} + ${60 * st.D}/v.`,
      series: [{ points: curveFn(x => value(T, x), 0.05, 40, 400).map(p => (p && p[1] > 140 ? null : p)), cls: 'er-line--t' }],
      hlines: st.ha ? [{ y: st.t0, cls: 'er-asym', label: `T = ${st.t0}` }] : [], vlines: st.va ? [{ x: 0.05, cls: 'er-asym er-asym--v', label: 'v = 0' }] : [],
      marks: [{ x: st.v, y: Math.min(y, 119), cls: 'er-mark--now', label: `(${st.v}, ${f1(y)})` }] }).node);
    put(read, el('p', { class: 'ms-live-eq er-eqn' }, `T(v) = ${st.t0} + ${60 * st.D}/v`),
      el('ul', { class: 'er-points' }, el('li', null, 'Vertical asymptote v = 0 (it never moves)'), el('li', null, `Horizontal asymptote T = ${st.t0} (t₀ shifts it)`), el('li', null, `D = ${st.D} km stretches 60/v by ${st.D}`)));
    Pr.setData('asym', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sD.node, sT.node, sV.node, tg, read));
}

// ------------------------------------------------------------ Split-time simulator (Mission 2)
export function splitSim(ctx) {
  const Pr = ctx.progress, Fv = flowTime(), Sv = techTime(), Tv = split();
  let v = Pr.getData('split', 15);
  const map = el('div', { class: 'ms-figure' }), read = readBox();
  const sv = slider({ label: 'Flow-section speed v', min: 6, max: 40, step: 0.5, value: v, unit: 'km/h', onInput: x => { v = x; draw(true); }, describe: x => `flow ${x} km/h, technical ${x - 5} km/h, total ${f1(Number(evalAt(Tv, x)))} min` });
  function draw(quiet) {
    const a = Number(evalAt(Fv, v)), b = Number(evalAt(Sv, v)), total = 8 + a + b;
    put(map, splitMap(1, 1, `Flow section ${f2(a)} min at ${v} km/h; technical section ${f2(b)} min at ${v - 5} km/h.`),
      el('div', { class: 'er-timers' }, el('div', { class: 'er-timer er-timer--flow' }, el('span', { class: 'er-timer-h' }, 'Flow · 2 km'), el('b', null, mmss(a)), el('span', { class: 'ls-small' }, `${v} km/h`)),
        el('div', { class: 'er-timer er-timer--tech' }, el('span', { class: 'er-timer-h' }, 'Technical · 1 km'), el('b', null, mmss(b)), el('span', { class: 'ls-small' }, `${v - 5} km/h`)),
        el('div', { class: 'er-timer' }, el('span', { class: 'er-timer-h' }, 'Total, with the 8 min transition'), el('b', null, mmss(total)))));
    put(read, el('p', { class: 'ms-live-eq' }, `T(${v}) = 8 + 120/${v} + 60/${v - 5}`), el('p', { class: 'ms-live-eq' }, `= 8 + ${f2(a)} + ${f2(b)} = `, el('b', { class: 'er-out' }, `${f2(total)} min`)));
    Pr.setData('split', v, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, map), el('div', { class: 'ms-lab-panel' }, sv.node, read,
    el('p', { class: 'ls-small' }, 'The technical speed is always v − 5: a fictional modelling assumption, not a rule about trails. Speeds start above 5 so both are positive.')));
}

// ------------------------------------------------------------ Rational graph analyzer (Mission 2)
export function graphAnalyzer(ctx) {
  const Pr = ctx.progress, Tv = split(), Fz = features(Tv);
  let view = Pr.getData('analyzer', 'full');
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const tabs = segs('View', [{ label: 'Full mathematical view', value: 'full' }, { label: 'Real-world race view', value: 'race' }], view, x => { view = x; draw(false); });
  function draw(quiet) {
    const full = view === 'full', lo = full ? -60 : 0, hi = 80;
    put(fig, plot({ x: full ? [-15, 30] : [0, 30], y: [lo, hi], xLabel: 'v (km/h)', yLabel: 'T(v) (min)', xStep: 5, yStep: 20, xDigits: 0, label: `T(v) in the ${full ? 'full mathematical' : 'race'} view.`,
      bands: full ? [{ axis: 'x', from: 5, to: 30, cls: 'er-band--context' }] : [],
      series: [{ points: ratCurve(Tv, full ? -15 : 5.01, 30, lo, hi), cls: 'er-line--t' }, ...(full ? [] : [{ points: ratCurve(Tv, 0, 4.99, lo, hi), cls: 'er-line--ghost' }])],
      hlines: [{ y: 8, cls: 'er-asym', label: 'T = 8' }], vlines: Fz.vertical.map(x => ({ x: Number(x), cls: 'er-asym er-asym--v', label: `v = ${show(x)}` })),
      marks: [{ x: 15, y: 22, cls: 'er-mark--now', label: '(15, 22)' }] }).node);
    put(read, el('p', { class: 'ms-live-eq er-eqn' }, `T(v) = ${text(Fz.simplified)}`),
      el('ul', { class: 'er-points' }, el('li', null, 'Excluded: v = 0 and v = 5'), el('li', null, 'Vertical asymptotes: v = 0 and v = 5'), el('li', null, 'Horizontal asymptote: T = 8'),
        el('li', null, full ? 'Shaded: the contextual domain v > 5. The other branches are valid algebra, not races.' : 'Only v > 5: both speeds positive. The faded piece is outside the race model.')));
    Pr.setData('analyzer', view, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'View'), tabs), read));
}

// ------------------------------------------------------------ Rational expression workbench (Mission 2)
const OPS = {
  add: { name: 'F + S', run: () => add(flowTime(), techTime()), steps: ['120/v + 60/(v − 5)', 'common denominator v(v − 5)', '[120(v − 5) + 60v]/[v(v − 5)]', '(180v − 600)/[v(v − 5)]'] },
  sub: { name: 'F − S', run: () => sub(flowTime(), techTime()), steps: ['120/v − 60/(v − 5)', 'common denominator v(v − 5)', '[120(v − 5) − 60v]/[v(v − 5)]', '60(v − 10)/[v(v − 5)]'] },
  mul: { name: 'P × R', run: () => mul(PER_KM(), SPEED_RATIO()), steps: ['60/v × v/(v − 5)', 'multiply tops and bottoms: 60v/[v(v − 5)]', 'cancel the common factor v (v ≠ 0 still excluded)', '60/(v − 5)'] },
  div: { name: 'S ÷ F', run: () => div(techTime(), flowTime()), steps: ['60/(v − 5) ÷ 120/v', 'multiply by the reciprocal: 60/(v − 5) × v/120', '60v/[120(v − 5)]', 'v/[2(v − 5)]'] }
};
export function workbench(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('bench', { op: 'add', v: 15 });
  const box = el('div', { class: 'er-bench' });
  const sv = slider({ label: 'Check at v', min: 6, max: 40, step: 1, value: st.v, unit: 'km/h', onInput: x => { st.v = x; draw(true); } });
  const tabs = segs('Operation', Object.entries(OPS).map(([k, o]) => ({ label: o.name, value: k })), st.op, x => { st.op = x; draw(false); });
  function draw(quiet) {
    const O = OPS[st.op], r = O.run(), s = simplify(r), a = evalAt(r, st.v), b = evalAt(s, st.v);
    put(box, el('ol', { class: 'er-steps' }, O.steps.map((x, i) => el('li', { class: i === O.steps.length - 1 ? 'is-last' : '' }, el('span', { class: 'ms-mono' }, x)))),
      el('p', { class: 'ms-live-eq' }, `At v = ${st.v}: original ${show(a)}, simplified ${show(b)} `, status(a !== null && b !== null && a.eq(b), 'same value', 'different')),
      el('p', { class: 'ls-small' }, `Excluded inputs: ${s.excluded.map(show).join(' and ')}${s.holes.length ? ` (the cancelled factor still excludes ${s.holes.map(h => show(h.x)).join(', ')})` : ''}.`));
    Pr.setData('bench', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab ms-lab--stack' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Operation'), tabs), box, sv.node);
}

// ------------------------------------------------------------ Find the missing point (Mission 2)
export function holeFinder(ctx) {
  const Pr = ctx.progress, C = CAL(), Fz = features(C), hole = Fz.holes[0];
  let step = Pr.getData('hole', 0), compare = false;
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), act = el('div', { class: 'ls-actions' });
  const STEPS = [['Factor the numerator', 'C(v) = (v − 5)(v + 5)/(v − 5)'], ['Cancel the common factor', 'C(v) = v + 5'], ['Keep the excluded input', 'v ≠ 5 (the original denominator was zero there)'], ['Plot the missing point', `hole at (${show(hole.x)}, ${show(hole.y)})`]];
  function draw(quiet) {
    put(fig, plot({ x: [-2, 12], y: [-4, 18], xLabel: 'v', yLabel: 'C(v)', xStep: 2, yStep: 4, xDigits: 0, label: `C(v) = (v² − 25)/(v − 5): the line v + 5${step >= 4 ? ' with a hole at (5, 10)' : ''}.`,
      series: [{ points: [[-2, 3], [12, 17]], cls: 'er-line--t' }, ...(compare ? [{ points: ratCurve(ratHigh([10], [1, -5]), -2, 12, -4, 18), cls: 'er-line--ghost' }] : [])],
      vlines: compare ? [{ x: 5, cls: 'er-asym er-asym--v', label: '10/(v − 5): asymptote' }] : [],
      marks: step >= 4 ? [{ x: 5, y: 10, cls: 'er-mark--hole', r: 7, label: '(5, 10) missing' }] : [] }).node);
    put(act, step < 4 ? button(STEPS[step][0], () => { step++; draw(false); }, 'ls-btn--primary') : null, pressed('Compare with an asymptote', compare, () => { compare = !compare; draw(false); }),
      step ? button('Start again', () => { step = 0; draw(false); }, 'ls-btn--ghost') : null);
    put(read, el('ol', { class: 'er-steps' }, STEPS.slice(0, step).map(([a, b]) => el('li', null, el('b', null, a + ': '), el('span', { class: 'ms-mono' }, b)))),
      compare ? el('p', { class: 'ls-small' }, 'A hole: one missing point, because the factor cancelled. An asymptote: the graph shoots off to infinity, because the factor stays in the denominator.') : null);
    Pr.setData('hole', step, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, act, read,
    el('p', { class: 'ls-small' }, 'A mathematical data-calibration example, not a bike performance relationship.')));
}

// ------------------------------------------------------------ Target time finder (Mission 2)
export function targetFinder(ctx) {
  const Pr = ctx.progress, Tv = split();
  let target = Pr.getData('target', 22);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sT = slider({ label: 'Target total time', min: 14, max: 40, step: 1, value: target, unit: 'min', onInput: x => { target = x; draw(true); } });
  function draw(quiet) {
    const roots = rationalRoots(splitQuadratic(SPLIT, target)).roots.map(x => x.r), approx = (() => { const q = splitQuadratic(SPLIT, target).map(Number), [c, b, a] = q, d = b * b - 4 * a * c; return d < 0 ? [] : [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)]; })();
    put(fig, plot({ x: [-2, 30], y: [-40, 60], xLabel: 'v (km/h)', yLabel: 'T(v) (min)', xStep: 5, yStep: 20, xDigits: 0, label: `T(v) and the line T = ${target}.`,
      series: [{ points: ratCurve(Tv, -2, 30, -40, 60), cls: 'er-line--t' }], hlines: [{ y: target, cls: 'er-target', label: `T = ${target}` }, { y: 8, cls: 'er-asym' }], vlines: [0, 5].map(x => ({ x, cls: 'er-asym er-asym--v' })),
      marks: approx.map(x => { const e = roots.find(r => Math.abs(Number(r) - x) < 1e-6); return { x, y: target, cls: x > 5 ? 'er-mark--ok' : 'er-mark--reject', label: `v ${e && e.d === 1 ? '= ' + show(e) : '≈ ' + f2(x)}${x > 5 ? '' : ' ✗'}` }; }) }).node);
    const q0 = splitQuadratic(SPLIT, target), g = q0.map(c => Math.abs(c.n)).reduce((x, y) => { while (y) [x, y] = [y, x % y]; return x; }), qr = q0.map(c => c.div(g));
    put(read, el('p', { class: 'ms-live-eq' }, `8 + 120/v + 60/(v − 5) = ${target}  →  ${ptext(qr, 'v')} = 0`),
      el('ul', { class: 'er-points' }, approx.map(x => {
        const exact = roots.find(r => Math.abs(Number(r) - x) < 1e-6), label = exact ? `v = ${show(exact)}${exact.d === 1 ? '' : ` ≈ ${f2(x)}`}` : `v ≈ ${f2(x)}`;
        return el('li', null, label + ' ', status(x > 5, 'valid (v > 5)', 'rejected: v − 5 < 0'));
      })));
    Pr.setData('target', target, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sT.node, read,
    el('p', { class: 'ls-small' }, 'Every target gives two candidates. One always lands on the middle branch (0 < v < 5), which isn’t a real race.')));
}

// ------------------------------------------------------------ Trail survey simulator (Mission 3)
export function surveySim(ctx) {
  const Pr = ctx.progress;
  let h = Pr.getData('survey', 16);
  const scene = el('div', { class: 'ms-figure' }), fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sh = slider({ label: 'Signed elevation difference h', min: SURVEY.range[0], max: SURVEY.range[1], step: 1, value: h, unit: 'm', onInput: x => { h = x; draw(true); }, describe: x => `h = ${x} m: D = ${f2(surveyD(x))} m` });
  function draw(quiet) {
    const d = surveyD(h), ex = sqrtExact(14400 + h * h);
    put(scene, surveyTriangle(SURVEY.run, h, d));
    put(fig, plot({ x: [-60, 60], y: [118, 136], xLabel: 'h: signed elevation difference (m)', yLabel: 'D(h) (m)', xStep: 20, yStep: 4, xDigits: 0, label: `D(h) = √(14400 + h²), point at h = ${h}.`,
      series: [{ points: curveFn(x => surveyD(x), -60, 60), cls: 'er-line--d' }], hlines: [{ y: 120, cls: 'er-asym', label: 'run 120 m' }],
      marks: [{ x: h, y: d, cls: 'er-mark--now', label: f2(d) }, { x: -h, y: d, cls: 'er-mark--mirror', r: 4 }] }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `D(${h}) = √(14400 + ${h * h}) = √${14400 + h * h}`),
      el('p', { class: 'ms-live-eq' }, `= ${surdText(ex)} ≈ `, el('b', { class: 'er-out' }, `${f2(d)} m`)),
      el('p', { class: 'ls-small' }, `Grade ${f2(Math.abs(h) / 120 * 100)}% ${h > 0 ? 'uphill' : h < 0 ? 'downhill' : '(flat)'}. The faint point at h = ${-h} has the same D: h is squared.`));
    Pr.setData('survey', h, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, scene, fig), el('div', { class: 'ms-lab-panel' }, sh.node, read,
    el('p', { class: 'ls-small' }, 'The straight-line distance between survey points, not the length of a winding trail. A fictional educational survey, not a construction recommendation.')));
}

// ------------------------------------------------------------ Radical equation solver (Mission 3)
const EQS = [
  { name: '√(14400 + h²) = 122', v: 'h', lhs: x => Math.sqrt(14400 + x * x), rhs: () => 122, squared: '14400 + h² = 14884', solved: 'h² = 484', cands: [-22, 22] },
  { name: '√(r² + 16) = r − 2', v: 'r', lhs: x => Math.sqrt(x * x + 16), rhs: x => x - 2, squared: 'r² + 16 = r² − 4r + 4', solved: '12 = −4r', cands: [-3] },
  { name: '√(x + 3) = x − 3', v: 'x', lhs: x => Math.sqrt(x + 3), rhs: x => x - 3, squared: 'x + 3 = x² − 6x + 9', solved: 'x² − 7x + 6 = 0 → (x − 1)(x − 6) = 0', cands: [1, 6] }
];
export function radicalSolver(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('solver', { i: 0, step: 0 });
  const box = el('div', { class: 'er-solver' });
  function draw() {
    const E = EQS[st.i], rows = [['Square both sides', E.squared], ['Solve', E.solved], ['Candidates', E.cands.map(c => `${E.v} = ${c}`).join(', ')]];
    put(box, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Equation'), segs('Equation', EQS.map((e, i) => ({ label: e.name, value: i })), st.i, x => { st = { i: x, step: 0 }; save(); draw(); })),
      el('ol', { class: 'er-steps' }, rows.slice(0, st.step).map(([a, b]) => el('li', null, el('b', null, a + ': '), el('span', { class: 'ms-mono' }, b))),
        st.step >= 4 ? E.cands.map(c => { const L = E.lhs(c), Rr = E.rhs(c), okk = Math.abs(L - Rr) < 1e-9; return el('li', null, el('b', null, `Check ${E.v} = ${c}: `), el('span', { class: 'ms-mono' }, `left ${f2(L)}, right ${f2(Rr)} `), status(okk, 'solution', 'extraneous')); }) : null),
      st.step < 4 ? button(['Square both sides', 'Solve', 'List candidates', 'Check in the original'][st.step], () => { st.step++; save(); draw(); }, 'ls-btn--primary') : button('Start again', () => { st.step = 0; save(); draw(); }, 'ls-btn--ghost'));
  }
  const save = () => Pr.setData('solver', st, true);
  draw();
  return el('div', { class: 'er-solver-box' }, el('p', { class: 'ls-small' }, 'Squaring can create candidates that don’t solve the original. The last step is the one that decides.'), box);
}

// ------------------------------------------------------------ Wheel geometry explorer (Mission 4)
export function wheelExplorer(ctx) {
  const Pr = ctx.progress, R = WHEEL.R;
  let st = Pr.getData('wheel', { x: 0.3, mode: 'point', level: 0.3 });
  const scene = el('div', { class: 'ms-figure er-wheel-box' }), fig = el('div', { class: 'ms-figure' }), read = readBox(), ctl = el('div');
  const mode = segs('Mode', [{ label: 'Move a point', value: 'point' }, { label: 'Find a height', value: 'height' }], st.mode, x => { st.mode = x; draw(false); });
  const sx = slider({ label: 'Horizontal offset x', min: -0.36, max: 0.36, step: 0.01, value: st.x, unit: 'm', onInput: x => { st.x = x; draw(true); }, format: x => x.toFixed(2), describe: x => `x = ${x.toFixed(2)} m, height ${f3(wheelY(x))} m` });
  const sl = slider({ label: 'Target height above the hub', min: 0, max: 0.36, step: 0.01, value: st.level, unit: 'm', onInput: x => { st.level = x; draw(true); }, format: x => x.toFixed(2) });
  function draw(quiet) {
    const pt = st.mode === 'point', x = Math.round(st.x * 100) / 100, y = wheelY(x), L = Math.round(st.level * 100) / 100, xs = Math.sqrt(Math.max(0, R * R - L * L));
    put(ctl, pt ? sx.node : sl.node);
    put(scene, wheelView(R, x, pt ? y : null, pt ? [] : [[-xs, L], [xs, L]], pt ? null : L));
    put(fig, plot({ x: [-0.45, 0.45], y: [-0.05, 0.45], xLabel: 'x: offset from the hub (m)', yLabel: 'W(x) (m)', xStep: 0.1, yStep: 0.1, xDigits: 1, yDigits: 1, label: 'W(x) = √(0.1296 − x²), the upper semicircle.',
      bands: [{ axis: 'x', from: -0.36, to: 0.36, cls: 'er-band--context' }], series: [{ points: curveFn(v => wheelY(v), -0.36, 0.36, 300), cls: 'er-line--d' }],
      hlines: pt ? [] : [{ y: L, cls: 'er-target', label: `W = ${f2(L)}` }],
      marks: pt ? [{ x, y, cls: 'er-mark--now', label: `(${f2(x)}, ${f3(y)})` }] : [{ x: -xs, y: L, cls: 'er-mark--ok', label: `x ≈ −${f3(xs)}` }, { x: xs, y: L, cls: 'er-mark--ok', label: `x ≈ ${f3(xs)}` }] }).node);
    const r2 = Frac.of(R).mul(Frac.of(R));
    put(read, pt ? [el('p', { class: 'ms-live-eq' }, `W(${f2(x)}) = √(0.1296 − ${f2(x)}²) = √${show(r2.sub(Frac.of(x).mul(Frac.of(x))))}`), el('p', { class: 'ms-live-eq' }, '≈ ', el('b', { class: 'er-out' }, `${f3(y)} m`), ' above the hub')]
      : [el('p', { class: 'ms-live-eq' }, `√(0.1296 − x²) = ${f2(L)}  →  x² = ${show(r2.sub(Frac.of(L).mul(Frac.of(L))))}`), el('p', { class: 'ms-live-eq' }, 'x ≈ ', el('b', { class: 'er-out' }, `±${f3(xs)} m`), ': two symmetric points')],
      el('p', { class: 'ls-small' }, 'Radius 0.36 m. Domain [−0.36, 0.36], range [0, 0.36]: the upper half of an idealised circle.'));
    Pr.setData('wheel', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, scene, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Mode'), mode), ctl, read));
}

// ------------------------------------------------------------ Radical profile studio (Mission 4)
export function profileStudio(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('studio', { parent: 'sqrt', a: STUDIO.a, h: STUDIO.h, k: STUDIO.k, R: 2 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), ctl = el('div', { class: 'er-ctl' });
  const sA = slider({ label: 'a: stretch and reflection', min: -3, max: 3, step: 0.5, value: st.a, onInput: v => { st.a = v; draw(true); } });
  const sH = slider({ label: 'h: horizontal shift', min: -5, max: 5, step: 1, value: st.h, onInput: v => { st.h = v; draw(true); } });
  const sK = slider({ label: 'k: vertical shift', min: -4, max: 4, step: 1, value: st.k, onInput: v => { st.k = v; draw(true); } });
  const sR = slider({ label: 'R: radius', min: 1, max: 4, step: 0.5, value: st.R, onInput: v => { st.R = v; draw(true); } });
  const par = segs('Parent', [{ label: 'Square root √x', value: 'sqrt' }, { label: 'Cube root ∛x', value: 'cbrt' }, { label: 'Wheel (semicircle)', value: 'wheel' }], st.parent, v => { st.parent = v; draw(false); });
  const sgn = v => (v < 0 ? `− ${-v}` : `+ ${v}`), inner = h => (h === 0 ? 'x' : `x ${h > 0 ? '−' : '+'} ${Math.abs(h)}`);
  function draw(quiet) {
    const { a, h, k, R } = st, P = st.parent;
    const base = { sqrt: x => (x < 0 ? null : Math.sqrt(x)), cbrt: x => Math.cbrt(x) }[P];
    const g = P === 'wheel' ? x => wheelY(x, R, h, k) : x => { const b = base(x - h); return b === null ? null : a * b + k; };
    const parent = P === 'wheel' ? x => wheelY(x, R) : base;
    const eq = P === 'wheel' ? `W(x) = ${k} + √(${R}² − (${inner(h)})²)` : `g(x) = ${a === 1 ? '' : a === -1 ? '−' : a}${P === 'sqrt' ? '√' : '∛'}(${inner(h)}) ${sgn(k)}`;
    const dom = P === 'cbrt' ? 'all real numbers' : P === 'sqrt' ? `[${h}, ∞)` : `[${h - R}, ${h + R}]`;
    const ran = P === 'cbrt' ? 'all real numbers' : P === 'sqrt' ? (a === 0 ? `{${k}}` : a > 0 ? `[${k}, ∞)` : `(−∞, ${k}]`) : `[${k}, ${k + R}]`;
    put(ctl, P === 'wheel' ? [sR.node, sH.node, sK.node] : [sA.node, sH.node, sK.node]);
    put(fig, plot({ x: [-8, 10], y: [-6, 8], xLabel: 'x', yLabel: 'y', xStep: 2, yStep: 2, xDigits: 0, label: `${eq}, with the parent function.`,
      series: [{ points: curveFn(parent, -8, 10, 400), cls: 'er-line--ghost' }, { points: curveFn(g, -8, 10, 600), cls: 'er-line--d' }],
      marks: P === 'cbrt' ? [{ x: h, y: k, cls: 'er-mark--now', label: `centre (${h}, ${k})` }] : P === 'sqrt' ? [{ x: h, y: k, cls: 'er-mark--now', label: `start (${h}, ${k})` }] : [{ x: h, y: k, cls: 'er-mark--now', label: `centre (${h}, ${k})` }] }).node);
    put(read, el('p', { class: 'ms-live-eq er-eqn' }, eq), el('ul', { class: 'er-points' }, el('li', null, `Domain: ${dom}`), el('li', null, `Range: ${ran}`),
      el('li', null, P === 'cbrt' ? 'Odd root: defined for every x, no starting point' : P === 'sqrt' ? (a < 0 ? 'Negative a: reflected, it goes down from the start' : 'It starts where the radicand is zero') : 'h and k move the centre; R sets the size')));
    Pr.setData('studio', st, quiet);
  }
  draw(true);
  const reset = button('Back to 2√(x − 3) + 1', () => { st = { parent: 'sqrt', a: 2, h: 3, k: 1, R: st.R }; sA.set(2); sH.set(3); sK.set(1); draw(false); }, 'ls-btn--ghost er-math');
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('ul', { class: 'er-legend' }, el('li', { class: 'is-parent' }, 'Parent'), el('li', { class: 'is-g' }, 'Transformed'))),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Parent function'), par), ctl, reset, read,
      el('p', { class: 'ls-small' }, 'A mathematical coordinate model, not a tire clearance or frame-fit recommendation.')));
}

// ------------------------------------------------------------ Route data diagnostic graphs (extension)
const DIAG = {
  f: { name: 'f(x) = 1/(x + 2)', r: () => ratHigh([1], [1, 2]) },
  g: { name: 'g(x) = (x + 1)/(x² + 1)', r: () => ratHigh([1, 1], [1, 0, 1]) },
  h: { name: 'h(x) = (2x² + 3)/(x² − 4)', r: () => ratHigh([2, 0, 3], [1, 0, -4]) },
  s: { name: '(x² + 3x + 1)/(x + 1)', r: () => ratHigh([1, 3, 1], [1, 1]) }
};
export function diagnostic(ctx) {
  const Pr = ctx.progress;
  let k = Pr.getData('diag', 'f');
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const tabs = segs('Function', Object.entries(DIAG).map(([id, d]) => ({ label: d.name, value: id })), k, v => { k = v; draw(false); });
  function draw(quiet) {
    const r = DIAG[k].r(), Fz = features(r);
    put(fig, plot({ x: [-6, 6], y: [-8, 8], xLabel: 'x', yLabel: 'y', xStep: 1, yStep: 2, xDigits: 0, label: `${DIAG[k].name}.`,
      series: [{ points: ratCurve(r, -6, 6, -8, 8, 600), cls: 'er-line--t' }, ...(Fz.slant ? [{ points: [[-6, -4], [6, 8]], cls: 'er-line--ghost' }] : [])],
      hlines: Fz.horizontal !== null ? [{ y: Number(Fz.horizontal), cls: 'er-asym', label: `y = ${show(Fz.horizontal)}` }] : [], vlines: Fz.vertical.map(x => ({ x: Number(x), cls: 'er-asym er-asym--v', label: `x = ${show(x)}` })),
      marks: [...Fz.zeros.map(z => ({ x: Number(z), y: 0, cls: 'er-mark--ok' })), ...(Fz.yInt !== null ? [{ x: 0, y: Number(Fz.yInt), cls: 'er-mark--now' }] : [])] }).node);
    put(read, el('ul', { class: 'er-points' },
      el('li', null, `Domain: ${Fz.excluded.length ? 'x ≠ ' + Fz.excluded.map(show).join(', ') : 'all real numbers'}`),
      el('li', null, `Vertical asymptotes: ${Fz.vertical.length ? Fz.vertical.map(x => 'x = ' + show(x)).join(', ') : 'none'}`),
      el('li', null, Fz.slant ? `Slant asymptote: y = ${ptext(Fz.slant, 'x')}` : `Horizontal asymptote: y = ${show(Fz.horizontal)}`),
      el('li', null, `x-intercepts: ${Fz.zeros.length ? Fz.zeros.map(show).join(', ') : 'none'}; y-intercept: ${Fz.yInt === null ? 'none' : show(Fz.yInt)}`)));
    Pr.setData('diag', k, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Function'), tabs), read,
    el('p', { class: 'ls-small' }, 'Abstract graph diagnostics: these aren’t trail-time models.')));
}
export function rootCompare() {
  return el('div', { class: 'ms-figure' }, plot({ x: [-6, 8], y: [-3, 4], xLabel: 'x', yLabel: 'y', xStep: 1, yStep: 1, xDigits: 0, label: '√x, ∛x and √(x + 4) − 2.',
    series: [{ points: curveFn(x => (x < 0 ? null : Math.sqrt(x)), -6, 8, 400), cls: 'er-line--d' }, { points: curveFn(Math.cbrt, -6, 8, 400), cls: 'er-line--t' }, { points: curveFn(x => (x < -4 ? null : Math.sqrt(x + 4) - 2), -6, 8, 400), cls: 'er-line--c' }],
    marks: [{ x: 0, y: 0, cls: 'er-mark--now', label: '√x starts at (0, 0)' }, { x: -4, y: -2, cls: 'er-mark--ok', label: '(−4, −2)' }] }).node,
    el('ul', { class: 'er-legend' }, el('li', { class: 'is-g' }, '√x'), el('li', { class: 'is-t' }, '∛x (odd: every x)'), el('li', { class: 'is-c' }, '√(x + 4) − 2')));
}
