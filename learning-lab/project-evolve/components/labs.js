// Project Evolve: interactives. Every number shown comes from the kit's
// exact engines (powers.js, scinot.js, frac.js) and logic/product.js; graphs
// only draw those numbers. Controls are buttons, sliders and inputs (no
// drag-and-drop), and settings are kept quietly: exploring is never marked.

import { el, svg, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { sup, fpow } from '../../lesson-kit/powers.js';
import { parseSci, normalize, sciText, plainText, isNormal } from '../../lesson-kit/scinot.js';
import { earnedBadges } from '../../dream-line-project/components/park.js';
import { tableEl } from '../../slope-lab/components/figures.js';
import { F, Frac, N, L, V, Lv, WAIT, BIKE, TEST, readings, model, factorOf, firstPast, num, money, people, PRODUCT, DATA_NOTE, TEST_NOTE, MEASURE_NOTE, LAUNCH_NOTE, MARKET_NOTE, PHASES } from '../logic/product.js';
import { bikeArt } from './visuals.js';

const tiles = rows => el('div', { class: 'pev-tiles' }, rows.filter(Boolean).map(([k, v, cls]) => el('div', { class: 'pev-tile' + (cls ? ' ' + cls : '') }, el('p', { class: 'pev-tile-k' }, k), el('p', { class: 'pev-tile-v' }, v))));
const nv = x => Number(F(x));
const range = n => Array.from({ length: n + 1 }, (_, i) => i);

// ------------------------------------------------------------ figures (q.fig)
export function figure(fig) {
  if (!fig) return null;
  if (fig.kind === 'curves') {
    // f is evaluated at whole periods only (the exact model); between them the line is straight for a linear
    // model and follows the same constant ratio for an exponential one, so the drawing matches the maths.
    const xs = range(fig.x[1] - fig.x[0]).map(i => fig.x[0] + i);
    const pts = s => xs.flatMap((x, i) => (i ? [0.25, 0.5, 0.75, 1].map(f => [x - 1, f]) : [[x, 0]])).map(([k, fr]) => { const a = s.f(k), b = fr ? s.f(k + 1) : a; return [k + fr, /pev-lin/.test(s.cls) || a <= 0 || b <= 0 ? a + (b - a) * fr : a * Math.pow(b / a, fr)]; });
    return el('figure', { class: 'ms-figure pev-fig' }, plot({ x: fig.x, y: fig.y, xStep: 1, xDigits: 0, xLabel: fig.xLabel || 'Months t', yLabel: fig.yLabel || '', label: fig.series.map(s => s.label).join(' and '),
      series: fig.series.map(s => ({ points: pts(s), cls: s.cls })), marks: fig.series.flatMap(s => xs.map(x => ({ x, y: s.f(x), r: 4, cls: s.cls + '-pt' }))) }).node,
      el('figcaption', { class: 'pev-legend' }, fig.series.map(s => el('span', { class: s.cls }, s.label))));
  }
  if (fig.kind === 'table') return tableEl(fig.rows, fig.headers);
  return null;
}

// ------------------------------------------------------------ A. the CAD scaling lab (Stage 1): repeated multiplication
export function cadLab(ctx) {
  const P = ctx.progress;
  let st = { edge: 2, dim: 3, letter: false, ...(P.getData('cad', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure pev-cad' });
  function draw() {
    const e = st.edge, d = st.dim, total = e ** d, base = st.letter ? 'x' : String(e);
    // the model: a row, a square, or a cube drawn as stacked layers (isometric), one unit cell each
    const s = svg('svg', { class: 'pev-cad-svg', viewBox: '0 0 320 240', role: 'img', 'aria-label': `${d === 1 ? 'A row' : d === 2 ? 'A square' : 'A cube'} of ${total} unit cells, ${e} along each edge` });
    s.append(svg('rect', { class: 'pev-cad-bg', x: 0, y: 0, width: 320, height: 240 }));
    for (let i = 0; i <= 16; i++) s.append(svg('path', { class: 'pev-cad-grid', d: `M${i * 20} 0 V240 M0 ${i * 15} H320` }));
    const u = Math.min(30, 150 / (e + (d === 3 ? e * 0.6 : 0))), ox = 160 - (e * u) / 2 - (d === 3 ? e * u * 0.25 : 0), oy = d === 1 ? 120 : 200 - (d === 3 ? 0 : 0);
    const layers = d === 3 ? e : 1, rows = d >= 2 ? e : 1;
    for (let z = 0; z < layers; z++) for (let r = rows - 1; r >= 0; r--) for (let c = 0; c < e; c++) {
      const x = ox + c * u + r * u * 0.5 * (d === 3 ? 1 : 0), y = (d === 1 ? oy : oy - (d === 2 ? r * u : 0)) - z * u - (d === 3 ? r * u * 0.5 : 0);
      s.append(svg('rect', { class: 'pev-cell' + (z === layers - 1 ? ' is-top' : ''), x, y: y - u, width: u, height: u, style: `animation-delay:${(z * rows * e + r * e + c) * 12}ms` }));
    }
    put(fig, s);
    put(out, el('p', { class: 'ms-live-eq' }, Array(d).fill(base).join(' × '), ' = ', `${base}${d === 1 ? '' : sup(d)}`, st.letter ? '' : ` = ${total}`),
      tiles([['Base', base], ['Exponent', String(d)], [st.letter ? 'Factors of x' : 'Unit cells', st.letter ? String(d) : String(total)]]),
      el('p', { class: 'ls-small' }, `The exponent ${d} says how many times the base ${base} is multiplied by itself${d === 3 ? ': a cube has length, width and height' : d === 2 ? ': a square has length and width' : ''}.`));
    P.setData('cad', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Edge length', min: 1, max: 5, step: 1, value: st.edge, unit: 'units', onInput: v => { st.edge = v; draw(); } }).node,
    segs('Model', [{ label: 'Row (power 1)', value: 1 }, { label: 'Square (power 2)', value: 2 }, { label: 'Cube (power 3)', value: 3 }], st.dim, v => { st.dim = v; draw(); }),
    segs('Edge', [{ label: 'Number', value: false }, { label: 'Letter x', value: true }], st.letter, v => { st.letter = v; draw(); }));
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, out));
}

// ------------------------------------------------------------ the factor board (Stage 1): product, quotient and power rules as factors
export function factorBoard(ctx) {
  const P = ctx.progress;
  let st = { mode: 'product', m: 3, n: 2, ...(P.getData('factors', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  const chip = (cls, t) => el('span', { class: 'pev-chip ' + (cls || '') }, t || 'x');
  function draw() {
    const { m, n } = st;
    let body, eq, note;
    if (st.mode === 'product') {
      body = el('div', { class: 'pev-row' }, el('span', { class: 'pev-group' }, range(m - 1).map(() => chip('is-a'))), el('span', { class: 'pev-op' }, '×'), el('span', { class: 'pev-group' }, range(n - 1).map(() => chip('is-b'))));
      eq = `x${sup(m)} × x${sup(n)} = x${sup(m + n)}`; note = `${m} factors and ${n} more: ${m} + ${n} = ${m + n} factors.`;
    } else if (st.mode === 'quotient') {
      const k = Math.min(m, n);
      body = el('div', { class: 'pev-frac' }, el('div', { class: 'pev-group' }, range(m - 1).map(i => chip(i < k ? 'is-gone' : 'is-a'))), el('div', { class: 'pev-bar' }), el('div', { class: 'pev-group' }, range(n - 1).map(i => chip(i < k ? 'is-gone' : 'is-b'))));
      const e = m - n; eq = `x${sup(m)} / x${sup(n)} = x${sup(e)}` + (e < 0 ? ` = 1/x${sup(-e)}` : e === 0 ? ' = 1' : '');
      note = `${k} pair${k === 1 ? '' : 's'} cancel. ${e > 0 ? `${e} left on top.` : e < 0 ? `${-e} left underneath: a negative exponent is a reciprocal.` : 'Nothing is left: x⁰ = 1 (x ≠ 0).'}`;
    } else {
      body = el('div', { class: 'pev-row' }, range(n - 1).map(() => el('span', { class: 'pev-group is-boxed' }, range(m - 1).map(() => chip('is-a')))));
      eq = `(x${sup(m)})${sup(n)} = x${sup(m * n)}`; note = `${n} groups of ${m} factors: ${m} × ${n} = ${m * n}.`;
    }
    put(out, body, el('p', { class: 'ms-live-eq' }, eq), el('p', { class: 'ls-small' }, note));
    P.setData('factors', st, true);
  }
  function controls() {
    put(ctl, slider({ label: st.mode === 'power' ? 'Inner exponent' : st.mode === 'quotient' ? 'Exponent on top' : 'First exponent', min: 1, max: 6, step: 1, value: st.m, onInput: v => { st.m = v; draw(); } }).node,
      slider({ label: st.mode === 'power' ? 'Outer exponent' : st.mode === 'quotient' ? 'Exponent below' : 'Second exponent', min: 1, max: st.mode === 'power' ? 4 : 6, step: 1, value: Math.min(st.n, st.mode === 'power' ? 4 : 6), onInput: v => { st.n = v; draw(); } }).node);
  }
  controls(); draw();
  return el('div', null, segs('Rule', [{ label: 'Product', value: 'product' }, { label: 'Quotient', value: 'quotient' }, { label: 'Power of a power', value: 'power' }], st.mode, v => { st.mode = v; if (v === 'power') st.n = Math.min(st.n, 4); controls(); draw(); }),
    el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, out), el('div', { class: 'ms-lab-panel' }, ctl)));
}

// ------------------------------------------------------------ the precision scale (Stage 1): powers of ten, positive to negative
export function precisionScale(ctx) {
  const P = ctx.progress; let k = P.getData('scale', -2);
  const out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const v = fpow(new Frac(10), k);
    put(out, el('div', { class: 'pev-scale' }, range(9).map(i => { const e = 3 - i; return el('div', { class: 'pev-step' + (e === k ? ' is-on' : '') + (e < 0 ? ' is-neg' : '') }, el('span', { class: 'pev-step-e' }, `10${sup(e)}`), el('span', { class: 'pev-step-bar', style: `width:${Math.max(4, 100 * (i ? Math.pow(0.6, i) : 1))}%` }), el('span', { class: 'pev-step-v ms-mono' }, plainText(fpow(new Frac(10), e)))); })),
      el('p', { class: 'ms-live-eq' }, `10${sup(k)} = ${k < 0 ? `1/10${sup(-k)} = ` : ''}${plainText(v)}`),
      el('p', { class: 'ls-small' }, k < 0 ? `Still positive: a negative exponent is a reciprocal, so 10${sup(k)} is a small positive number, not ${plainText(fpow(new Frac(10), -k).neg())}.` : k === 0 ? '10⁰ = 1: the zero exponent.' : `10${sup(k)} is ${k} factor${k === 1 ? '' : 's'} of 10.`));
    P.setData('scale', k, true);
  }
  draw();
  return el('div', null, slider({ label: 'Power of ten', min: -6, max: 3, step: 1, value: k, onInput: v => { k = v; draw(); }, describe: v => `10 to the power ${v}` }).node, out);
}

// ------------------------------------------------------------ B. the test rig (Stage 2): the sensor reading counter
export function testRig(ctx) {
  const P = ctx.progress;
  let st = { hours: TEST.hours, rate: TEST.perSecond, ...(P.getData('rig', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const R = readings(st.hours, st.rate);
    put(out, el('div', { class: 'pev-rig' }, bikeArt('test'), el('div', { class: 'pev-screen' }, el('p', { class: 'pev-screen-k' }, 'READINGS'), el('p', { class: 'pev-screen-v ms-mono' }, R.toLocaleString('en-US')), el('p', { class: 'pev-screen-k' }, 'SCIENTIFIC'), el('p', { class: 'pev-screen-v ms-mono' }, sciText(F(R))))),
      el('p', { class: 'ms-live-eq' }, `${st.rate} × ${st.hours} × 60 × 60 = ${R.toLocaleString('en-US')} = ${sciText(F(R))}`),
      el('p', { class: 'ls-small' }, `That’s ${(st.hours * 3600).toLocaleString('en-US')} seconds of testing.`));
    P.setData('rig', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Test duration', min: 1, max: 52, step: 1, value: st.hours, unit: 'hours', onInput: v => { st.hours = v; draw(); } }).node,
    slider({ label: 'Sensor readings per second (assumed)', min: 50, max: 1000, step: 50, value: st.rate, onInput: v => { st.rate = v; draw(); } }).node);
  draw();
  return el('div', null, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, out), el('div', { class: 'ms-lab-panel' }, ctl)), el('p', { class: 'ls-small' }, TEST_NOTE));
}

// ------------------------------------------------------------ the converter (Stage 2): standard ⇄ scientific, moving the decimal
export function converter(ctx) {
  const P = ctx.progress;
  let st = { text: '0.0000045', shift: 0, ...(P.getData('conv', {}) || {}) };
  const iid = uid('cv'), input = el('input', { id: iid, class: 'ls-input', autocomplete: 'off', inputmode: 'decimal', value: st.text });
  const out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const v = parseSci(st.text);
    if (!v || v.value.zero) { put(out, el('p', { class: 'ls-small' }, 'Type a nonzero number like 350000, 0.00000072 or 2.016 × 10^7.')); return; }
    const n = normalize(v.value), e = n.e + st.shift, c = n.c.div(fpow(new Frac(10), st.shift)), ok = isNormal(c);
    put(out, tiles([['Standard', plainText(v.value)], ['Scientific (normalized)', sciText(v.value), 'is-best'], ['Your version', `${plainText(c, false)} × 10${sup(e)}`, ok ? 'is-best' : 'is-warn']]),
      el('p', { class: 'ms-live-eq' }, n.e === 0 ? 'Already between 1 and 10: × 10⁰.' : `The decimal point moves ${Math.abs(n.e)} place${Math.abs(n.e) === 1 ? '' : 's'} ${n.e > 0 ? 'left' : 'right'}, so the exponent is ${n.e > 0 ? '+' : '−'}${Math.abs(n.e)}.`),
      status(ok, 'Normalized: the coefficient is at least 1 and less than 10.', `Equal in value, but not normalized: ${plainText(c, false)} isn’t between 1 and 10.`));
    P.setData('conv', st, true);
  }
  input.addEventListener('input', () => { st.text = input.value; st.shift = 0; draw(); });
  draw();
  return el('div', null, el('div', { class: 'ls-field' }, el('label', { for: iid }, 'Enter a number (standard or scientific)'), input),
    el('div', { class: 'ls-actions' }, button('Move the decimal left (exponent +1)', () => { st.shift += 1; draw(); }, 'ls-btn--quiet'), button('Move the decimal right (exponent −1)', () => { st.shift -= 1; draw(); }, 'ls-btn--quiet'), button('Normalize', () => { st.shift = 0; draw(); }, 'ls-btn--quiet')), out);
}

// ------------------------------------------------------------ comparing magnitudes (Stage 2)
const MEASURES = [['Fork bushing wear', '3.2e-4', 'm'], ['Inspection reading A', '4.5e-6', 'm'], ['Inspection reading B', '1.2e-5', 'm'], ['Seal clearance', '9.8e-5', 'm'], ['Full test dataset', '2.016e7', 'readings'], ['One test file', '5.04e4', 'readings'], ['Second rig’s dataset', '4.032e7', 'readings'], ['Lab bench dataset', '7.5e6', 'readings']];
export function magnitudes(ctx) {
  const P = ctx.progress;
  let st = { a: 1, b: 2, ...(P.getData('mag', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' });
  const val = i => parseSci(MEASURES[i][1]).value;
  function draw() {
    const A = MEASURES[st.a], B = MEASURES[st.b], va = val(st.a), vb = val(st.b), same = A[2] === B[2];
    const big = Number(va) >= Number(vb) ? st.a : st.b, ratio = Number(va) >= Number(vb) ? va.div(vb) : vb.div(va);
    const ea = normalize(va).e, eb = normalize(vb).e, lo = Math.min(ea, eb) - 1, hi = Math.max(ea, eb) + 1;
    const pos = v => { const n = normalize(v); return 100 * (n.e + (Number(n.c) - 1) / 9 - lo) / (hi + 1 - lo); };
    put(out, el('div', { class: 'pev-ruler', role: 'img', 'aria-label': `A powers-of-ten ruler from 10 to the ${lo} to 10 to the ${hi + 1}` },
      range(hi + 1 - lo).map(i => el('span', { class: 'pev-tick', style: `left:${100 * i / (hi + 1 - lo)}%` }, `10${sup(lo + i)}`)),
      el('span', { class: 'pev-pin is-a', style: `left:${pos(va)}%` }, 'A'), el('span', { class: 'pev-pin is-b', style: `left:${pos(vb)}%` }, 'B')),
      tiles([[`A: ${A[0]}`, `${sciText(va)} ${A[2]}`, big === st.a ? 'is-best' : ''], [`B: ${B[0]}`, `${sciText(vb)} ${B[2]}`, big === st.b ? 'is-best' : '']]),
      same ? el('p', null, `${big === st.a ? 'A' : 'B'} is larger, about ${num(F(Math.round(Number(ratio) * 100) / 100))} times as big. ${ea !== eb ? `Compare the powers first: 10${sup(Math.max(ea, eb))} beats 10${sup(Math.min(ea, eb))}.` : 'Same power of ten, so compare the coefficients.'}`)
        : status(false, '', `Different units (${A[2]} and ${B[2]}): these can’t be compared. Keep the units with every value.`));
    P.setData('mag', st, true);
  }
  const sel = (key, label) => { const sid = uid('ms'), s = el('select', { id: sid, class: 'ls-input' }, MEASURES.map(([n, v, u], i) => el('option', { value: i, selected: i === st[key] }, `${n} (${u})`))); s.addEventListener('change', () => { st[key] = Number(s.value); draw(); }); return el('div', { class: 'ls-field' }, el('label', { for: sid }, label), s); };
  draw();
  return el('div', null, el('div', { class: 'pev-two' }, sel('a', 'Measurement A'), sel('b', 'Measurement B')), out, el('p', { class: 'ls-small' }, MEASURE_NOTE));
}

// ------------------------------------------------------------ C. the launch growth tracker (Stage 3)
export function growthTracker(ctx) {
  const P = ctx.progress;
  let st = { a: WAIT.a, pct: WAIT.pct, months: 6, lin: true, ...(P.getData('growth', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure' });
  function draw() {
    const f = factorOf(st.pct, 1), add = st.a * st.pct / 100, E = t => model(st.a, st.pct, t), Ln = t => F(st.a + add * t), T = st.months, top = Math.max(nv(E(T)), nv(Ln(T))) * 1.08;
    const curve = []; for (let i = 0; i <= T * 4; i++) curve.push([i / 4, nv(E(i / 4 | 0)) * Math.pow(nv(f), i / 4 - (i / 4 | 0))]);
    put(fig, plot({ x: [0, Math.max(1, T)], y: [0, Math.ceil(top / 100) * 100], xStep: 1, xDigits: 0, xLabel: 'Months t', yLabel: 'Waitlist (riders)', label: `N(t) = ${st.a}(${num(f)})ᵗ` + (st.lin ? ` and the linear L(t) = ${st.a} + ${num(add)}t` : ''),
      series: [{ points: curve, cls: 'pev-exp' }, st.lin ? { points: [[0, st.a], [T, nv(Ln(T))]], cls: 'pev-lin' } : null].filter(Boolean),
      marks: [...range(T).map(t => ({ x: t, y: nv(E(t)), r: 4, cls: 'pev-exp-pt' })), ...(st.lin ? range(T).map(t => ({ x: t, y: nv(Ln(t)), r: 3, cls: 'pev-lin-pt' })) : [])] }).node);
    put(out, el('p', { class: 'ms-live-eq' }, `N(t) = ${st.a}(${num(f)})ᵗ`), tiles([['Growth rate', `${st.pct}%`], ['Growth factor', `1 + ${num(F(st.pct).div(100))} = ${num(f)}`], [`Month ${T}`, `${num(E(T))} (about ${people(E(T))} riders)`, 'is-best'], st.lin ? [`Linear, + ${num(add)} a month`, num(Ln(T))] : null]),
      tableEl(range(Math.min(T, 8)).map(t => [t, num(E(t)), ...(st.lin ? [num(Ln(t))] : [])]), ['Month', 'Exponential N(t)', ...(st.lin ? ['Linear L(t)'] : [])]),
      el('p', { class: 'ls-small' }, LAUNCH_NOTE));
    P.setData('growth', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Starting waitlist', min: 100, max: 2000, step: 50, value: st.a, unit: 'riders', onInput: v => { st.a = v; draw(); } }).node,
    slider({ label: 'Growth per month', min: 1, max: 50, step: 1, value: st.pct, unit: '%', onInput: v => { st.pct = v; draw(); } }).node,
    slider({ label: 'Months', min: 1, max: 12, step: 1, value: st.months, onInput: v => { st.months = v; draw(); } }).node,
    segs('Linear comparison', [{ label: 'Show', value: true }, { label: 'Hide', value: false }], st.lin, v => { st.lin = v; draw(); }));
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, out));
}

// ------------------------------------------------------------ D. the resale value simulator (Stage 4)
export function resaleSim(ctx) {
  const P = ctx.progress;
  let st = { a: BIKE.a, pct: BIKE.pct, years: 6, target: BIKE.target, compare: false, lin: false, ...(P.getData('resale', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure' });
  const curve = (a, p, T) => { const f = nv(factorOf(p, -1)), pts = []; for (let i = 0; i <= T * 4; i++) pts.push([i / 4, a * Math.pow(f, i / 4)]); return pts; };
  function draw() {
    const T = st.years, f = factorOf(st.pct, -1), Vt = t => model(st.a, st.pct, t, -1), drop = st.a * st.pct / 100, C = firstPast(Vt, st.target, -1, 60);
    const series = [{ points: curve(st.a, st.pct, T), cls: 'pev-exp' }];
    if (st.compare) [10, 15, 25].filter(p => p !== st.pct).forEach((p, i) => series.push({ points: curve(st.a, p, T), cls: 'pev-cmp is-' + i }));
    if (st.lin) series.push({ points: [[0, st.a], [Math.min(T, st.a / drop), Math.max(0, st.a - drop * Math.min(T, st.a / drop))]], cls: 'pev-lin' });
    put(fig, plot({ x: [0, T], y: [0, Math.ceil(st.a * 1.05 / 500) * 500], xStep: 1, xDigits: 0, xLabel: 'Age t (years)', yLabel: 'Modeled value ($)', label: `V(t) = ${st.a}(${num(f)})ᵗ with a $${st.target} target line`,
      series, hlines: [{ y: st.target, cls: 'pev-target', label: `target $${st.target.toLocaleString('en-US')}` }],
      marks: range(T).map(t => ({ x: t, y: nv(Vt(t)), r: 4, cls: 'pev-exp-pt' })).concat(C && C.t <= T ? [{ x: C.t, y: nv(C.at), r: 8, cls: 'pev-cross', label: `year ${C.t}` }] : []) }).node);
    put(out, el('p', { class: 'ms-live-eq' }, `V(t) = ${st.a.toLocaleString('en-US')}(${num(f)})ᵗ`),
      tiles([['Depreciation rate', `${st.pct}%`], ['Retention factor', `1 − ${num(F(st.pct).div(100))} = ${num(f)}`], [`Value at year ${T}`, money(Vt(T))],
        ['Below the target', C ? (C.t === 0 ? 'from the start' : `between years ${C.t - 1} and ${C.t}; first whole year: ${C.t}`) : 'not within 60 years', 'is-best']]),
      tableEl(range(Math.min(T, 8)).map(t => [t, money(Vt(t)), ...(st.lin ? [money(Math.max(0, st.a - drop * t))] : [])]), ['Year', 'Exponential V(t)', ...(st.lin ? [`Linear (− ${money(drop)} a year)`] : [])]),
      st.compare ? el('p', { class: 'ls-small' }, 'Dashed curves: the same bike at the other rates (10%, 15%, 25%). A bigger rate means a smaller factor and a steeper fall.') : null,
      el('p', { class: 'ls-small' }, MARKET_NOTE));
    P.setData('resale', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Starting value', min: 1000, max: 10000, step: 250, value: st.a, format: v => '$' + v.toLocaleString('en-US'), onInput: v => { st.a = v; draw(); } }).node,
    slider({ label: 'Yearly decrease', min: 5, max: 40, step: 5, value: st.pct, unit: '%', onInput: v => { st.pct = v; draw(); } }).node,
    slider({ label: 'Years shown', min: 2, max: 10, step: 1, value: st.years, onInput: v => { st.years = v; draw(); } }).node,
    slider({ label: 'Target value', min: 500, max: 6000, step: 100, value: st.target, format: v => '$' + v.toLocaleString('en-US'), onInput: v => { st.target = v; draw(); } }).node,
    segs('Compare rates', [{ label: 'Off', value: false }, { label: '10 / 15 / 20 / 25%', value: true }], st.compare, v => { st.compare = v; draw(); }),
    segs('Linear comparison', [{ label: 'Off', value: false }, { label: 'On', value: true }], st.lin, v => { st.lin = v; draw(); }));
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, out));
}

// ------------------------------------------------------------ the product development dashboard (board)
export const projectName = P => (P.getData('projectName', '') || PRODUCT).trim() || PRODUCT;
const PHASE_ROWS = {
  prototype: got => [['Component expression', got ? '(2x)³ = 8x³' : null], ['Scaling rule', got ? 'x³ × x² = x⁵' : null]],
  testlab: got => [['Test readings', got ? `${sciText(F(readings()))}` : null], ['Smallest reading', got ? '4.5 × 10⁻⁶ m' : null]],
  launch: got => [['Waitlist model', got ? 'N(t) = 500(1.20)ᵗ' : null], ['Month 4', got ? 'about 1,037 riders' : null]],
  market: got => [['Value model', got ? 'V(t) = 6000(0.80)ᵗ' : null], ['Below $2,500', got ? 'year 4' : null]]
};
export function dashboard(ctx, missions) {
  const P = ctx.progress, got = earnedBadges(P, missions), next = PHASES.find(p => !got.has(p.id));
  const stage = next ? next.id : 'done', nid = uid('pn');
  const name = el('input', { class: 'ls-input', id: nid, maxlength: 40, value: P.getData('projectName', '') || '', placeholder: PRODUCT });
  name.addEventListener('change', () => { P.setData('projectName', name.value.trim(), true); ctx.rerender(); });
  return el('section', { class: 'pev-dash', 'aria-label': 'Product development dashboard' },
    el('div', { class: 'pev-dash-head' }, el('div', null, el('p', { class: 'ls-kicker' }, 'Northline Cycles · product development'), el('p', { class: 'pev-dash-name' }, projectName(P).toUpperCase()), el('p', { class: 'ls-small' }, next ? `Now: ${next.name}, as ${next.role}.` : 'Every phase complete: the bike is launched and tracked.')),
      bikeArt(stage === 'done' ? 'market' : stage, true)),
    el('div', { class: 'ls-field' }, el('label', { for: nid }, 'Project name'), name),
    el('ol', { class: 'pev-phases' }, PHASES.map(p => el('li', { class: got.has(p.id) ? 'is-done' : next === p ? 'is-now' : '' },
      el('p', { class: 'pev-phase-h' }, (got.has(p.id) ? '✓ ' : '') + p.name),
      el('dl', { class: 'pev-phase-dl' }, PHASE_ROWS[p.id](got.has(p.id)).map(([k, v]) => el('div', null, el('dt', null, k), el('dd', { class: v ? '' : 'is-off' }, v || 'after this stage'))))))),
    el('p', { class: 'ls-small' }, DATA_NOTE));
}

// ------------------------------------------------------------ the product lifecycle report (extension)
export function lifecycleReport(ctx, missions, certified) {
  const P = ctx.progress, got = earnedBadges(P, missions), nid = uid('rn');
  const head = el('p', { class: 'pev-report-h' }, `${projectName(P).toUpperCase()} — PRODUCT DEVELOPMENT REPORT`);
  const name = el('input', { class: 'ls-input', id: nid, maxlength: 40, value: P.getData('projectName', '') || '', placeholder: PRODUCT });
  name.addEventListener('input', () => { head.textContent = `${(name.value.trim() || PRODUCT).toUpperCase()} — PRODUCT DEVELOPMENT REPORT`; });
  name.addEventListener('change', () => P.setData('projectName', name.value.trim(), true));
  const sect = (id, title, body) => el('section', { class: 'pev-rep' + (got.has(id) ? '' : ' is-locked') }, el('p', { class: 'pev-phase-h' }, title), got.has(id) ? body() : el('p', { class: 'ls-small' }, 'Complete this stage to add it to the report.'));
  const C = firstPast(V, BIKE.target, -1);
  return el('div', { class: 'pev-report' }, el('div', { class: 'pev-dash-head' }, head, bikeArt('launch', true)), el('div', { class: 'ls-field' }, el('label', { for: nid }, 'Name your project'), name),
    el('div', { class: 'pev-rep-grid' },
      sect('prototype', 'Prototype development', () => el('ul', { class: 'mt-checks' }, el('li', { class: 'is-ok' }, 'Calibration block: 2 × 2 × 2 = 2³ = 8 unit cubes'), el('li', { class: 'is-ok' }, 'Product rule: x³ × x² = x⁵'), el('li', { class: 'is-ok' }, 'Scaling: (2x)³ = 8x³; (x²)³ = x⁶'), el('li', { class: 'is-ok' }, 'Precision: 10⁻³ = 0.001; x⁻² = 1/x²'))),
      sect('testlab', 'Engineering test results', () => el('ul', { class: 'mt-checks' }, el('li', { class: 'is-ok' }, `Sensor readings: 200 × 28 × 60 × 60 = 20,160,000 = ${sciText(F(readings()))}`), el('li', { class: 'is-ok' }, 'Smallest measurement: 0.0000045 m = 4.5 × 10⁻⁶ m'), el('li', { class: 'is-ok' }, '(3.0 × 10⁵)(2.0 × 10³) = 6.0 × 10⁸'), el('li', { class: 'is-ok' }, '(2.016 × 10⁷)/(4.0 × 10²) = 5.04 × 10⁴ readings per file'), el('li', { class: 'is-ok' }, '1.2 × 10⁻⁵ m > 4.5 × 10⁻⁶ m'))),
      sect('launch', 'Product launch', () => [el('ul', { class: 'mt-checks' }, el('li', { class: 'is-ok' }, 'Initial waitlist 500; growth 20% a month (factor 1.20)'), el('li', { class: 'is-ok' }, 'N(t) = 500(1.20)ᵗ'), el('li', { class: 'is-ok' }, `Projected: month 3 ${num(N(3))}, month 4 ${num(N(4))} (about ${people(N(4))} riders)`), el('li', { class: 'is-ok' }, 'Linear comparison: L(4) = 900')),
        figure({ kind: 'curves', x: [0, 6], y: [0, 1600], series: [{ f: t => nv(L(t)), cls: 'pev-lin', label: 'L(t) = 500 + 100t' }, { f: t => nv(N(t)), cls: 'pev-exp', label: 'N(t) = 500(1.20)ᵗ' }] })]),
      sect('market', 'Used market', () => [el('ul', { class: 'mt-checks' }, el('li', { class: 'is-ok' }, 'Initial value $6,000; retention factor 0.80 (20% a year)'), el('li', { class: 'is-ok' }, 'V(t) = 6000(0.80)ᵗ'), el('li', { class: 'is-ok' }, `Below $2,500: between years ${C.t - 1} and ${C.t} (from the table, not a formula)`)),
        tableEl([0, 1, 2, 3, 4, 5].map(t => [t, money(V(t))]), ['Year', 'Modeled value']),
        figure({ kind: 'curves', x: [0, 6], y: [0, 6500], xLabel: 'Years t', series: [{ f: t => nv(V(t)), cls: 'pev-exp', label: 'V(t) = 6000(0.80)ᵗ' }] })])),
    el('ul', { class: 'dl-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, (got.has(m.id) ? '★ ' : '☆ ') + m.badge))),
    certified ? el('p', { class: 'pev-cert' }, 'CERTIFIED MTB PRODUCT INNOVATION ENGINEER') : null,
    el('p', { class: 'ls-small' }, DATA_NOTE + ' ' + MARKET_NOTE));
}
