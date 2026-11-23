// Pump Track Profile Lab interactives. Each returns an element; every number
// shown comes from logic/models.js and logic/poly.js (exact algebra). Every
// graph has keyboard controls; settings are kept in the lab's progress
// (getData / setData). A page asks its questions before the tool that would
// show their answers.

import { el, put, button } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { parseNumber } from '../../lesson-kit/validate.js';
import { FLOW, P, Q, CUBIC, MULT, BASE, ADJUST, COMPLEX, ZERO_PRACTICE, pick } from '../logic/models.js';
import { fromRoots, fromHigh, add, mul, equal, evalAt, value, synthetic, longDivide, endBehavior, maxTurning, turningPoints, signIntervals, rationalCandidates,
  text, factoredText, termText, high, degree, leading, show, Frac } from '../logic/poly.js';
import { profileScene } from './visuals.js';

const f2 = x => Number(x).toFixed(2), f3 = x => Number(x).toFixed(3);
const curve = (p, a, b, n = 160) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, value(p, x)]; });
const sup = n => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
const PP = P(), QQ = Q();
const FLOW_WIN = { x: [0, 8], y: [-0.3, 0.4], xLabel: 'x: distance along the track (m)', yLabel: 'P(x): height (m)', xStep: 1, yStep: 0.1, xDigits: 0, yDigits: 1 };
const readBox = () => el('div', { class: 'pt-read', 'aria-live': 'polite' });
const pressed = (label, on, onclick, extra) => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet pt-toggle', 'aria-pressed': String(!!on), onclick, ...(extra || {}) }, label);

// ------------------------------------------------------------ Flow Line Decoder (Mission 1)
export function flowDecoder(ctx) {
  const Pr = ctx.progress, TP = turningPoints(PP, 0, 8), SI = signIntervals(PP, [0, 2, 6, 8], 0, 8), EB = endBehavior(PP);
  let st = Pr.getData('decoder', { tab: 'standard', x: 3, sel: 1 });
  const scene = el('div', { class: 'ms-figure' }), fig = el('div', { class: 'ms-figure' }), read = readBox(), extra = el('div');
  const sx = slider({ label: 'Rider position x', min: 0, max: 8, step: 0.25, value: st.x, unit: 'm', onInput: v => { st.x = v; draw(true); },
    describe: v => `x = ${v} m, height ${f3(value(PP, v))} m` });
  const tabs = segs('View', [{ label: 'Standard', value: 'standard' }, { label: 'Factored', value: 'factored' }, { label: 'Graph', value: 'graph' }, { label: 'Features', value: 'features' }], st.tab, v => { st.tab = v; draw(false); });
  function draw(quiet) {
    const y = value(PP, st.x), tab = st.tab;
    put(scene, profileScene(PP, FLOW.domain, st.x));
    const marks = [{ x: st.x, y, cls: 'pt-mark--now', r: 5 }];
    if (tab === 'factored') marks.push(...[0, 2, 6, 8].map(z => ({ x: z, y: 0, cls: 'pt-mark--zero', label: `x = ${z}` })));
    if (tab === 'features') marks.push(...TP.map(([x, v], i) => ({ x, y: v, cls: 'pt-mark--turn' + (i === st.sel ? ' is-on' : ''), label: i === st.sel ? `(${f2(x)}, ${f3(v)})` : null })));
    put(fig, plot({ ...FLOW_WIN, label: `Flow Line A, ${tab} view; rider at x = ${st.x}.`,
      bands: tab === 'features' ? SI.map(i => ({ axis: 'x', from: i.from, to: i.to, cls: 'pt-band--' + i.sign })) : [],
      series: [{ points: curve(PP, 0, 8), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }],
      guides: tab === 'graph' ? [{ x: st.x, y }] : [], marks }).node);
    const L = {
      standard: [`P(x) = ${text(PP)}`, [`Degree ${degree(PP)}: the highest power is x⁴`, `Leading coefficient ${show(leading(PP))} (positive)`, 'Four terms, but the term count isn’t the degree']],
      factored: [`P(x) = ${factoredText(FLOW.a, FLOW.roots)}`, ['Each factor (x − r) is zero at x = r', 'Zeros: 0, 2, 6 and 8', 'The same function as the standard form, just written differently']],
      graph: [`P(${st.x}) = ${f3(y)} m`, [y > 1e-9 ? 'Above the reference elevation' : y < -1e-9 ? 'Below the reference elevation' : 'On the reference elevation', 'Drag the slider: the graph and the side view use the same model', 'Vertical scale exaggerated in the side view']],
      features: [`Up to ${maxTurning(PP)} turning points; this one has ${TP.length}`, [`End behavior (extended beyond 0–8): ${EB.text}`, 'Shaded: below the line (dips) and above (the roller)', 'Pick a turning point for its coordinates']]
    }[tab];
    put(read, el('p', { class: 'ms-live-eq pt-eqn' }, L[0]), el('ul', { class: 'pt-points' }, L[1].map(l => el('li', null, l))));
    put(extra, tab === 'features' ? el('div', { class: 'ls-actions' }, TP.map(([x, v], i) => pressed(`${v > value(PP, x + 0.3) ? 'High' : 'Low'} point ${i + 1}`, i === st.sel, () => { st.sel = i; draw(false); }))) : null);
    Pr.setData('decoder', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, scene, fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Show Flow Line A as'), tabs), read, extra, sx.node,
      el('p', { class: 'ls-small' }, 'A simplified mathematical profile over 0–8 m, not a pump track design or construction specification.')));
}

// ------------------------------------------------------------ End behavior explorer (Mission 1)
const END_CHOICES = ['rises on the left, rises on the right', 'falls on the left, falls on the right', 'falls on the left, rises on the right', 'rises on the left, falls on the right'];
export function endExplorer(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('ends', { n: 3, s: 1, guess: null, shown: false });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), guessBox = el('div', { class: 'ls-control pt-guesses' });
  const dseg = segs('Degree', [1, 2, 3, 4].map(n => ({ label: `Degree ${n}`, value: n })), st.n, v => { st.n = v; st.shown = false; st.guess = null; draw(false); });
  const sseg = segs('Sign of the leading coefficient', [{ label: 'Positive', value: 1 }, { label: 'Negative', value: -1 }], st.s, v => { st.s = v; st.shown = false; st.guess = null; draw(false); });
  function draw(quiet) {
    const p = fromHigh([st.s, ...Array(st.n).fill(0)]), eb = endBehavior(p), name = `y = ${st.s < 0 ? '−' : ''}x${st.n > 1 ? sup(st.n) : ''}`;
    put(guessBox, el('span', { class: 'ls-mini-label' }, 'Your prediction'), el('p', { class: 'ms-live-eq pt-eqn' }, name), segs('Your prediction', END_CHOICES.map(c => ({ label: c, value: c })), st.guess, v => { st.guess = v; draw(false); }),
      button('Reveal the graph', () => { st.shown = true; draw(false); }, 'ls-btn--primary', { disabled: st.guess ? null : true }));
    put(fig, st.shown ? plot({ x: [-2.5, 2.5], y: [-6, 6], xLabel: 'x', yLabel: 'y', xStep: 1, yStep: 2, xDigits: 0, label: `Graph of ${name}: ${eb.text}.`,
      series: [{ points: curve(p, -2.5, 2.5), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }],
      marks: [{ x: -1.9, y: Math.max(-5.5, Math.min(5.5, value(p, -1.9))), cls: 'pt-mark--end', label: eb.left === 'up' ? '↑ left' : '↓ left' }, { x: 1.9, y: Math.max(-5.5, Math.min(5.5, value(p, 1.9))), cls: 'pt-mark--end', label: eb.right === 'up' ? '↑ right' : '↓ right' }] }).node
      : el('p', { class: 'ls-small pt-wait' }, 'Choose a prediction, then reveal the graph.'));
    put(read, st.shown ? [status(st.guess === eb.text, `Right: ${eb.text}`, `Not quite: it ${eb.text}`),
      el('p', { class: 'ls-small' }, `${eb.even ? 'Even degree: both ends go the same way' : 'Odd degree: the ends go opposite ways'}; ${eb.positive ? 'positive' : 'negative'} leading coefficient: ${eb.right === 'up' ? 'rises' : 'falls'} on the right.`)] : null);
    Pr.setData('ends', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Degree'), dseg), el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Leading coefficient'), sseg), guessBox, read,
      el('p', { class: 'ls-small' }, 'End behavior describes the polynomial as x → ±∞, not the real track, which only covers its stated distance.')));
}

// ------------------------------------------------------------ Profile combination studio (Mission 2)
export function combineStudio(ctx) {
  const Pr = ctx.progress, B = BASE(), A = ADJUST(), T = add(B, A);
  let st = Pr.getData('combine', { b: true, a: true, t: true, x: 4 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), toggles = el('div', { class: 'ls-actions' });
  const sx = slider({ label: 'Check at x', min: 0, max: 8, step: 0.5, value: st.x, unit: 'm', onInput: v => { st.x = v; draw(true); } });
  function draw(quiet) {
    const x = st.x, yb = value(B, x), ya = value(A, x);
    put(toggles, pressed('Baseline B', st.b, () => { st.b = !st.b; draw(false); }), pressed('Adjustment A', st.a, () => { st.a = !st.a; draw(false); }), pressed('Combined T', st.t, () => { st.t = !st.t; draw(false); }));
    put(fig, plot({ x: [0, 8], y: [-2, 3.5], xLabel: 'x (m)', yLabel: 'height (m)', xStep: 1, yStep: 0.5, xDigits: 0, yDigits: 1, label: `Baseline, adjustment and combined profile; check at x = ${x}.`,
      series: [st.b && { points: curve(B, 0, 8), cls: 'pt-line--b' }, st.a && { points: curve(A, 0, 8), cls: 'pt-line--a' }, st.t && { points: curve(T, 0, 8), cls: 'pt-line--t' }].filter(Boolean),
      hlines: [{ y: 0, cls: 'pt-refline' }], vlines: [{ x, cls: 'pt-vline' }],
      marks: [st.b && { x, y: yb, cls: 'pt-mark--b', r: 4 }, st.a && { x, y: ya, cls: 'pt-mark--a', r: 4 }, st.t && { x, y: yb + ya, cls: 'pt-mark--t', label: `T(${x}) = ${f3(yb + ya)}` }].filter(Boolean) }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `B(${x}) + A(${x}) = ${f3(yb)} + (${f3(ya)}) = `, el('b', { class: 'pt-out' }, f3(yb + ya))),
      el('p', { class: 'ls-small' }, 'At every x, the combined height is the two heights added: that’s what adding the polynomials does.'));
    Pr.setData('combine', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('ul', { class: 'pt-legend' }, el('li', { class: 'is-b' }, 'B: baseline'), el('li', { class: 'is-a' }, 'A: adjustment'), el('li', { class: 'is-t' }, 'T = B + A'))),
    el('div', { class: 'ms-lab-panel' }, toggles, sx.node, read, likeTerms(ctx, [['B(x)', B], ['A(x)', A], ['T(x)', T, 's-add']])));
}
// Like terms lined up in columns (a row with a question id appears once it's answered).
function likeTerms(ctx, rows) {
  return ctx.live(() => {
    const n = Math.max(...rows.map(r => degree(r[1])));
    const cols = Array.from({ length: n + 1 }, (_, i) => n - i);
    return el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table pt-terms' }, el('caption', { class: 'ls-sr' }, 'Like terms in columns'),
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, ''), cols.map(k => el('th', { scope: 'col' }, k === 0 ? 'constant' : k === 1 ? 'x' : 'x' + sup(k))))),
      el('tbody', null, rows.map(([name, p, id]) => el('tr', { class: id ? 'pt-sum' : '' }, el('th', { scope: 'row' }, name),
        cols.map(k => el('td', { class: 'ms-mono' }, id && !ctx.progress.done(id) ? '?' : p[k] && !p[k].zero ? show(p[k]) : '0')))))));
  });
}

// ------------------------------------------------------------ Expansion grid (area model, Mission 2)
export function expansionGrid(ctx) {
  const Pr = ctx.progress, A = [[1, 2], [-8, 1]], Bt = [[1, 2], [-8, 1], [12, 0]];
  const box = el('div', { class: 'pt-grid-wrap' });
  const tt = ([c, i]) => termText(Frac.of(c), i);
  function draw() {
    const shown = new Set(Pr.getData('grid', []));
    put(box, el('table', { class: 'pt-grid' }, el('caption', { class: 'ls-sr' }, 'Area model for (x² − 8x)(x² − 8x + 12)'),
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, '×'), Bt.map(b => el('th', { scope: 'col' }, tt(b))))),
      el('tbody', null, A.map((a, r) => el('tr', null, el('th', { scope: 'row' }, tt(a)), Bt.map((b, c) => {
        const k = r + ':' + c, on = shown.has(k), prod = [a[0] * b[0], a[1] + b[1]];
        return el('td', null, on ? el('span', { class: 'ms-mono pt-prod pt-pow' + prod[1] }, tt(prod))
          : button('?', () => { shown.add(k); Pr.setData('grid', [...shown]); draw(); }, 'ls-btn--quiet pt-cell', { 'aria-label': `Reveal ${tt(a)} times ${tt(b)}` }));
      }))))));
  }
  draw();
  return el('div', { class: 'pt-grid-box' }, el('p', { class: 'ls-small' }, 'Each cell is one term times one term. Work a cell out, then tap it to check. Matching colours are like terms.'), box,
    ctx.live(() => ctx.progress.done('s-expand') ? el('p', { class: 'ms-live-eq' }, 'Combine like terms: ', el('b', { class: 'pt-out' }, text(QQ))) : el('p', { class: 'ls-small' }, 'Answer the expansion question to see the combined result.')));
}

// ------------------------------------------------------------ Multiplicity explorer (Mission 3)
export function multiplicityExplorer(ctx) {
  const Pr = ctx.progress;
  let m = Pr.getData('mult', 2);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sm = slider({ label: 'Multiplicity of (x − 3)', min: 1, max: 4, step: 1, value: m, onInput: v => { m = v; draw(true); }, describe: v => `multiplicity ${v}: ${v % 2 ? 'crosses' : 'touches and turns back'} at x = 3` });
  function draw(quiet) {
    const roots = [[1, 1], [3, m], [5, 1]], p = fromRoots(MULT.a, roots), odd = m % 2 === 1;
    put(fig, plot({ x: [0, 6], y: [-0.6, 0.6], xLabel: 'x (m)', yLabel: 'height (m)', xStep: 1, yStep: 0.2, xDigits: 0, yDigits: 1, label: `Graph of ${factoredText(MULT.a, roots)}.`,
      series: [{ points: curve(p, 0, 6, 240), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }],
      marks: roots.map(([r, k]) => ({ x: r, y: 0, cls: k % 2 ? 'pt-mark--zero' : 'pt-mark--touch', label: `x = ${r} (×${k})` })) }).node);
    put(read, el('p', { class: 'ms-live-eq pt-eqn' }, factoredText(MULT.a, roots)),
      status(odd, `Multiplicity ${m} (odd): crosses at x = 3`, `Multiplicity ${m} (even): touches at x = 3 and turns back`),
      el('p', { class: 'ls-small' }, `Just left and right of 3: (2.9 − 3)${sup(m)} and (3.1 − 3)${sup(m)} have ${odd ? 'opposite signs, so the profile changes side' : 'the same sign, so the profile stays on one side'}. Higher multiplicity also flattens it near the zero.`));
    Pr.setData('mult', m, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sm.node, read));
}

// ------------------------------------------------------------ Factor builder (Mission 3)
export function factorBuilder(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('builder', { roots: [2], a: 0.01 });
  const fig = el('div', { class: 'ms-figure' }), read = readBox(), picks = el('div', { class: 'ls-actions pt-roots' });
  const sa = slider({ label: 'Scale a', min: 0.001, max: 0.02, step: 0.001, value: st.a, onInput: v => { st.a = Math.round(v * 1000) / 1000; draw(true); }, format: v => v.toFixed(3) });
  function draw(quiet) {
    const roots = st.roots.slice().sort((x, y) => x - y).map(r => [r, 1]), p = fromRoots(st.a, roots), match = equal(p, PP);
    put(picks, el('span', { class: 'ls-mini-label' }, 'Zeros (tap to add or remove)'), Array.from({ length: 9 }, (_, r) => pressed(`x = ${r}`, st.roots.includes(r), () => {
      st.roots = st.roots.includes(r) ? st.roots.filter(z => z !== r) : [...st.roots, r]; draw(false); })));
    put(fig, plot({ ...FLOW_WIN, label: `Your function ${factoredText(st.a, roots)} against Flow Line A.`,
      series: [{ points: curve(PP, 0, 8), cls: 'pt-line--target' }, { points: curve(p, 0, 8, 240), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }],
      marks: roots.map(([r]) => ({ x: r, y: 0, cls: 'pt-mark--zero' })) }).node);
    put(read, el('p', { class: 'ms-live-eq pt-eqn' }, roots.length ? factoredText(st.a, roots) : `${show(st.a)} (no zeros yet)`),
      el('p', { class: 'ms-live-eq ls-small' }, `= ${text(p)}`),
      status(match, 'Match: this is Flow Line A', roots.length === 4 && !st.roots.some(r => ![0, 2, 6, 8].includes(r)) ? 'Right zeros: now adjust the scale a' : `Degree ${roots.length}: keep building toward the dashed target`));
    Pr.setData('builder', st, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, el('ul', { class: 'pt-legend' }, el('li', { class: 'is-target' }, 'Target: Flow Line A'), el('li', { class: 'is-flow' }, 'Yours'))),
    el('div', { class: 'ms-lab-panel' }, picks, sa.node, read, el('p', { class: 'ls-small' }, 'Each zero r adds a factor (x − r). The scale stretches the heights without moving the zeros.')));
}

// ------------------------------------------------------------ Zero tester (Mission 3)
// source: 'main' (the cubic x³ − 16x² + 76x − 96) or 'practice' (the current practice cubic).
export function zeroTester(ctx, source = 'main') {
  const Pr = ctx.progress, n = source === 'practice' ? Pr.getData('variant:features', 0) : 0;
  const p = source === 'practice' ? (z => fromRoots(z.a, z.roots))(pick(ZERO_PRACTICE, n)) : CUBIC(), store = 'tester:' + source + ':' + n;
  const all = rationalCandidates(p), cands = source === 'main' ? all.filter(c => Number(c) >= 0 && Number(c) <= 8) : all;
  const box = el('div', { class: 'pt-tester' });
  function draw() {
    const tried = Pr.getData(store, []);
    put(box, el('p', { class: 'ms-live-eq' }, `f(x) = ${text(p)}`),
      el('p', { class: 'ls-small' }, source === 'main' ? `Candidates in the track’s range 0–8 (±p/q with p | 96, q | 1):` : `Candidates ±p/q (p | ${Math.abs(Number(p[0]))}, q | ${Math.abs(Number(leading(p)))}):`),
      el('div', { class: 'ls-actions pt-cands' }, cands.map(c => { const k = String(c), done = tried.includes(k), z = evalAt(p, c).zero;
        return el('button', { type: 'button', class: 'ls-btn ls-btn--quiet pt-cand' + (done ? (z ? ' is-zero' : ' is-not') : ''), 'aria-label': `Test x = ${show(c)}` + (done ? (z ? ': a zero' : ': not a zero') : ''),
          onclick: () => { if (!done) Pr.setData(store, [...tried, k]); draw(); } }, show(c)); })),
      el('ul', { class: 'pt-points', 'aria-live': 'polite' }, tried.slice(-4).reverse().map(k => all.find(c => String(c) === k)).filter(Boolean).map(c => { const v = evalAt(p, c);
        return el('li', null, `f(${show(c)}) = ${show(v)}  `, status(v.zero, 'zero', 'not a zero')); })));
  }
  draw();
  return box;
}

// ------------------------------------------------------------ Synthetic division console (Mission 4)
const CONSOLE = { p: [1, 0, -7, 6], ks: [1, 2, -3, 3] };
export function syntheticConsole(ctx) {
  const Pr = ctx.progress, p = fromHigh(CONSOLE.p);
  let st = Pr.getData('console', { k: 1, mode: 'guided' });
  let entries = [], steps = 0, msg = null;
  const box = el('div', { class: 'pt-console' }), ctl = el('div');
  const reset = () => { entries = []; steps = 0; msg = null; };
  function draw() {
    const S = synthetic(p, st.k), n = S.bottom.length, done = entries.length === n, inputs = [];
    put(ctl, el('p', { class: 'ms-live-eq' }, '(x³ − 7x + 6) ÷ (', st.k < 0 ? `x + ${-st.k}` : `x − ${st.k}`, ')'), el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Divisor'),
        segs('Divisor', CONSOLE.ks.map(k => ({ label: k < 0 ? `x + ${-k}` : `x − ${k}`, value: k })), st.k, v => { st.k = v; reset(); save(); draw(); })),
      el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Mode'),
        segs('Mode', [{ label: 'Guided: one cell at a time', value: 'guided' }, { label: 'Independent: the whole row', value: 'independent' }], st.mode, v => { st.mode = v; reset(); save(); draw(); })));
    const cell = (i) => {
      if (i < entries.length) return el('td', { class: 'ms-mono pt-ok' }, show(S.bottom[i]));
      const open = st.mode === 'independent' || i === entries.length;
      const inp = el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'ls-input pt-cin', 'aria-label': i === n - 1 ? 'Remainder' : `Bottom entry ${i + 1}`, disabled: open ? null : true });
      inputs[i] = inp;
      return el('td', { class: i === n - 1 ? 'pt-rem' : '' }, inp);
    };
    const table = el('table', { class: 'pt-synth' }, el('caption', { class: 'ls-sr' }, `Synthetic division by k = ${st.k}`),
      el('tbody', null,
        el('tr', null, el('th', { scope: 'row', class: 'pt-k' }, show(st.k)), S.top.map(c => el('td', { class: 'ms-mono' }, show(c)))),
        el('tr', null, el('th', { scope: 'row' }, ''), S.middle.map((m, i) => el('td', { class: 'ms-mono pt-mid' }, m && i < entries.length ? show(m) : ''))),
        el('tr', { class: 'pt-bottom' }, el('th', { scope: 'row' }, ''), S.bottom.map((_, i) => cell(i)))));
    function check() {
      steps++;
      const todo = st.mode === 'guided' ? [entries.length] : Array.from({ length: n - entries.length }, (_, j) => entries.length + j);
      for (const i of todo) {
        const r = parseNumber(inputs[i].value);
        if (!r.ok) { msg = ['warn', r.empty ? `Enter ${i === n - 1 ? 'the remainder' : 'entry ' + (i + 1)}.` : 'Enter a number, like −2 or 5.']; break; }
        const good = Number(S.bottom[i]), prev = i ? Number(S.bottom[i - 1]) : 0, flip = Number(S.top[i]) - st.k * prev;
        if (Math.abs(r.value - good) < 1e-9) { entries.push(good); msg = null; continue; }
        msg = ['warn', i === 0 ? 'Bring the first coefficient straight down.' : Math.abs(r.value - flip) < 1e-9 ? `Sign check: for (${st.k < 0 ? 'x + ' + -st.k : 'x − ' + st.k}) use k = ${st.k}, then multiply and ADD.` : `Multiply the last bottom entry (${show(S.bottom[i - 1])}) by ${st.k}, then add ${show(S.top[i])}.`];
        break;
      }
      draw();
    }
    const fin = done ? el('div', { class: 'pt-read' }, el('p', { class: 'ms-live-eq' }, 'Quotient ', el('b', { class: 'pt-out' }, text(S.quotient)), `, remainder ${show(S.remainder)}`),
      status(S.remainder.zero, `Remainder 0: (${st.k < 0 ? 'x + ' + -st.k : 'x − ' + st.k}) is a factor`, `Remainder ${show(S.remainder)} = f(${show(st.k)}): not a factor`),
      el('p', { class: 'ls-small' }, `Done in ${steps} check${steps === 1 ? '' : 's'}.`)) : null;
    put(box, ctl, el('div', { class: 'ls-table-wrap' }, table),
      done ? null : el('div', { class: 'ls-actions' }, button(st.mode === 'guided' ? 'Check this cell' : 'Check the row', check, 'ls-btn--primary'), el('span', { class: 'ls-small' }, `Checks so far: ${steps}`)),
      msg ? el('p', { class: 'ms-status ms-status--warn', role: 'status' }, msg[1]) : null, fin);
  }
  const save = () => Pr.setData('console', st, true);
  draw();
  return el('div', { class: 'pt-console-box' }, el('p', { class: 'ls-small' }, 'The coefficients include the 0 for the missing x² term. Bring down, multiply by k, add; repeat. The last entry is the remainder.'), box);
}

// ------------------------------------------------------------ Long division workbench (Mission 4)
const LONG = [
  { name: 'Q(x) ÷ (x² − 8x)', p: () => QQ, d: () => fromHigh([1, -8, 0]) },
  { name: '(x³ − 7x + 6) ÷ (x − 1)', p: () => fromHigh([1, 0, -7, 6]), d: () => fromHigh([1, -1]) },
  { name: '(2x³ − 3x² + 4) ÷ (x² + 1)', p: () => fromHigh([2, -3, 0, 4]), d: () => fromHigh([1, 0, 1]) }
];
export function longWorkbench(ctx) {
  const Pr = ctx.progress;
  let st = Pr.getData('long', { i: 0, shown: 0 });
  const box = el('div', { class: 'pt-long' });
  function draw() {
    const L = LONG[st.i], p = L.p(), d = L.d(), R = longDivide(p, d), sh = Math.min(st.shown, R.steps.length);
    const qSoFar = R.steps.slice(0, sh).reduce((acc, s) => add(acc, s.term), fromHigh([0]));
    put(box, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Division'),
        segs('Division', LONG.map((x, i) => ({ label: x.name, value: i })), st.i, v => { st = { i: v, shown: 0 }; save(); draw(); })),
      el('p', { class: 'ms-live-eq' }, `(${text(p)}) ÷ (${text(d)})`),
      el('ol', { class: 'pt-steps' }, R.steps.slice(0, sh).map(s => el('li', null,
        el('span', null, `Divide: ${text(s.before).split(' ')[0]} ÷ ${text(d).split(' ')[0]} = `, el('b', null, text(s.term))),
        el('span', { class: 'ms-mono' }, `Multiply: ${text(s.term)} · (${text(d)}) = ${text(s.product)}`),
        el('span', { class: 'ms-mono' }, `Subtract: (${text(s.before)}) − (${text(s.product)}) = ${text(s.after)}`)))),
      sh < R.steps.length ? el('div', { class: 'ls-actions' }, button(sh ? 'Next step' : 'First step', () => { st.shown = sh + 1; save(); draw(); }, 'ls-btn--primary'),
        el('span', { class: 'ls-small' }, `Step ${sh} of ${R.steps.length}`))
        : el('div', { class: 'pt-read' }, el('p', { class: 'ms-live-eq' }, 'Quotient ', el('b', { class: 'pt-out' }, text(R.quotient)), `, remainder ${text(R.remainder)}`),
          el('p', { class: 'ls-small' }, `Check: (${text(d)})(${text(R.quotient)})${R.remainder.length === 1 && R.remainder[0].zero ? '' : ` + (${text(R.remainder)})`} = ${text(p)}. The remainder’s degree is below the divisor’s, so the division stops.`),
          button('Start again', () => { st.shown = 0; save(); draw(); }, 'ls-btn--ghost')),
      sh && sh < R.steps.length ? el('p', { class: 'ls-small' }, `Quotient so far: ${text(qSoFar)}`) : null);
  }
  const save = () => Pr.setData('long', st, true);
  draw();
  return el('div', { class: 'pt-long-box' }, box);
}

// ------------------------------------------------------------ Remainder tester (Mission 4)
export function remainderTester(ctx) {
  const Pr = ctx.progress;
  let k = Pr.getData('remainder', 3);
  const fig = el('div', { class: 'ms-figure' }), read = readBox();
  const sk = slider({ label: 'Divide by (x − k): k', min: 0, max: 8, step: 1, value: k, onInput: v => { k = v; draw(true); }, describe: v => `k = ${v}: remainder ${show(evalAt(QQ, v))}` });
  function draw(quiet) {
    const S = synthetic(QQ, k), r = S.remainder;
    put(fig, plot({ x: [0, 8.5], y: [-60, 80], xLabel: 'x', yLabel: 'Q(x)', xStep: 1, yStep: 20, xDigits: 0, label: `Q(x) with the point (${k}, ${show(r)}).`,
      series: [{ points: curve(QQ, 0, 8.5), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }], guides: [{ x: k, y: Number(r) }],
      marks: [{ x: k, y: Number(r), cls: r.zero ? 'pt-mark--zero' : 'pt-mark--now', label: `(${k}, ${show(r)})` }] }).node);
    put(read, el('p', { class: 'ms-live-eq' }, `Synthetic: ${S.bottom.map(String).join(', ')}`),
      el('p', { class: 'ms-live-eq' }, `Remainder = Q(${k}) = `, el('b', { class: 'pt-out' }, show(r))),
      status(r.zero, `(x − ${k}) is a factor`, `(x − ${k}) is not a factor`),
      el('p', { class: 'ls-small' }, `Actual profile: P(${k}) = Q(${k}) ÷ 200 = ${show(evalAt(PP, k))} m.`));
    Pr.setData('remainder', k, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sk.node, read,
    el('p', { class: 'ls-small' }, 'The remainder of division by (x − k) is the height of the graph at x = k: the Remainder Theorem, seen on the graph.')));
}

// ------------------------------------------------------------ Complex zeros graph (extension)
export function complexGraph() {
  const R = mul(COMPLEX(), fromRoots(1, [[2], [6]]));
  return el('div', { class: 'ms-figure' }, plot({ x: [-1, 8], y: [-140, 100], xLabel: 'x', yLabel: 'R(x)', xStep: 1, yStep: 20, xDigits: 0, label: 'R(x) = (x² + 1)(x − 2)(x − 6): real zeros at 2 and 6 only.',
    series: [{ points: curve(R, -1, 8), cls: 'pt-line--flow' }], hlines: [{ y: 0, cls: 'pt-refline' }],
    marks: [2, 6].map(z => ({ x: z, y: 0, cls: 'pt-mark--zero', label: `x = ${z}` })) }).node,
    el('p', { class: 'ls-small' }, 'Degree 4, so four zeros in all: the graph shows the two real ones; ±i don’t appear on a real graph.'));
}
