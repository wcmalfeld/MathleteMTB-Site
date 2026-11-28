// Wrap Lab: interactives. Every expression shown comes from the kit's exact
// polynomial engine (expr.js, factor.js); tiles, regions and rectangles are
// drawn from those results, so the visual areas always add up to the
// algebra, and no pixel is ever a measurement. Controls are buttons,
// sliders and taps (no drag-and-drop). Settings are kept quietly.

import { el, svg, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { earnedBadges } from '../../dream-line-project/components/park.js';
import { tableEl } from '../../slope-lab/components/figures.js';
import { polyOf, polyText, classify, factorQuadratic, quadText, gcfOf, gcfText, gcd } from '../../lesson-kit/factor.js';
import { BIKES, ZONES, PALETTES, FINISHES, PATTERNS, STOCK, BATCH, MODEL_NOTE, UNIT_NOTE, DOS_NOTE, STUDIO } from '../logic/studio.js';
import { frameSvg } from './visuals.js';

const tiles = rows => el('div', { class: 'wrp-tiles' }, rows.filter(Boolean).map(([k, v, cls]) => el('div', { class: 'wrp-tile-box' + (cls ? ' ' + cls : '') }, el('p', { class: 'wrp-tile-k' }, k), el('p', { class: 'wrp-tile-v' }, v))));
const SUP = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] || c).join('');
// x-polynomial ⇄ coefficients { 0: c0, 1: c1, 2: c2, 3: c3 }
export const coeffs = src => { const P = typeof src === 'string' ? polyOf(src) : src, out = {}; for (const [k, c] of P) { const m = k ? Number(k.split(':')[1]) : 0; out[m] = Number(c); } return out; };
const fromCoeffs = c => polyOf(Object.entries(c).filter(([, v]) => v).map(([e, v]) => `(${v})*x^${e}`).join(' + ') || '0');
const termText = (c, e) => { const a = Math.abs(c), v = e === 0 ? '' : e === 1 ? 'x' : 'x' + SUP(e); return (e && a === 1 ? '' : String(a)) + v; };
const ptext = src => polyText(typeof src === 'string' ? polyOf(src) : src);
export const studio = P => ({ bike: 'enduro', zones: ['top', 'down'], palette: 'ember', finish: 'gloss', pattern: 'stripes', name: '', kit: '', ...(P.getData('studio', {}) || {}) });
const zoneNames = Object.fromEntries(ZONES.map(z => [z.id, z.name]));

// ------------------------------------------------------------ the tile organizer (Stage 1)
// Algebra tiles: x² large squares, x long strips, 1 small squares; negatives are outlined red.
function tileRow(c, label) {
  const row = el('div', { class: 'wrp-trow', 'aria-label': label });
  for (const e of [3, 2, 1, 0]) { const k = c[e] || 0; for (let i = 0; i < Math.abs(k); i++) row.append(el('span', { class: `wrp-alg is-p${e}` + (k < 0 ? ' is-neg' : ''), title: (k < 0 ? '−' : '') + termText(1, e) || '1' }, e ? (e === 1 ? 'x' : 'x' + SUP(e)) : '1')); }
  return row;
}
const PRESETS_TILES = [
  { id: 'add', name: 'Top tube + down tube', a: '3x^2 + 4x + 2', b: '2x^2 + 5x + 1', op: '+' },
  { id: 'sub', name: 'Stock − batch', a: STOCK, b: BATCH, op: '-' },
  { id: 'neg', name: '(6x² + 5x + 2) − (2x² − 3x + 4)', a: '6x^2 + 5x + 2', b: '2x^2 - 3x + 4', op: '-' }
];
export function tileOrganizer(ctx) {
  const P = ctx.progress;
  let st = { preset: 'add', step: 0, ...(P.getData('tiles', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const X = PRESETS_TILES.find(p => p.id === st.preset), A = coeffs(X.a), B = coeffs(X.b), Bs = X.op === '-' ? Object.fromEntries(Object.entries(B).map(([e, v]) => [e, -v])) : B;
    const R = Object.fromEntries([0, 1, 2, 3].map(e => [e, (A[e] || 0) + (Bs[e] || 0)]));
    const steps = X.op === '-' ? ['Lay out both panels', 'Flip every tile of the subtracted panel', 'Group like tiles', 'Combine: opposite tiles cancel'] : ['Lay out both panels', 'Group like tiles', 'Combine the coefficients'];
    const flipped = X.op === '-' && st.step >= 1, grouped = st.step >= (X.op === '-' ? 2 : 1), done = st.step >= steps.length - 1;
    const C2 = flipped ? Bs : B;
    put(box, el('p', { class: 'ms-live-eq' }, `(${ptext(X.a)}) ${X.op === '-' ? '−' : '+'} (${ptext(X.b)})`),
      !grouped ? el('div', null, el('p', { class: 'wrp-tlab' }, 'Panel A'), tileRow(A, 'Panel A tiles'), el('p', { class: 'wrp-tlab' }, X.op === '-' ? (flipped ? 'Panel B, every sign flipped' : 'Panel B (to subtract)') : 'Panel B'), tileRow(C2, 'Panel B tiles'))
        : el('div', { class: 'wrp-groups' }, [2, 1, 0].map(e => el('div', { class: 'wrp-group' }, el('p', { class: 'wrp-tlab' }, e ? `x${e === 2 ? '²' : ''} tiles` : 'unit tiles'), tileRow({ [e]: A[e] || 0 }, ''), tileRow({ [e]: (X.op === '-' ? Bs : B)[e] || 0 }, ''),
          done ? el('p', { class: 'ms-mono' }, `${A[e] || 0} ${((X.op === '-' ? Bs : B)[e] || 0) < 0 ? '−' : '+'} ${Math.abs((X.op === '-' ? Bs : B)[e] || 0)} = ${R[e]}`) : null))),
      done ? el('p', { class: 'ms-live-eq wrp-result' }, '= ' + ptext(fromCoeffs(R))) : null,
      el('ol', { class: 'wrp-stepper' }, steps.map((t, i) => el('li', { class: i < st.step ? 'is-done' : i === st.step ? 'is-now' : '' }, t))),
      el('div', { class: 'ls-actions' }, done ? null : button('Next step', () => { st.step += 1; draw(); }, 'ls-btn--primary'), st.step ? button('Start again', () => { st.step = 0; draw(); }, 'ls-btn--quiet') : null),
      X.op === '-' && st.step >= 1 ? el('p', { class: 'ls-small' }, 'Red-outlined tiles are negative. A positive and a negative tile of the same kind cancel to zero.') : null);
    P.setData('tiles', st, true);
  }
  draw();
  return el('div', null, segs('Panels', PRESETS_TILES.map(p => ({ label: p.name, value: p.id })), st.preset, v => { st = { preset: v, step: 0 }; draw(); }), box, el('p', { class: 'ls-small' }, UNIT_NOTE));
}

// ------------------------------------------------------------ classify sorter (Stage 1): tap a card, then a bin
const CARDS = ['7x^3', '3x^2 - 4x', 'x^2 + 5x + 6', '-4x', '9', '2x^3 + 3x^2 + x + 8', '3/x', 'x^2 + 1'];
export function sorter(ctx) {
  const P = ctx.progress;
  let st = { card: null, placed: {}, ...(P.getData('sorter', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  const show = t => t.replace(/\^(\d)/g, (_, d) => SUP(d)).replace(/-/g, '−');
  const binOf = t => { const c = classify(t); return c.polynomial ? c.termName : 'not a polynomial'; };
  const BINS = ['monomial', 'binomial', 'trinomial', 'four terms', 'not a polynomial'];
  function draw() {
    const msg = el('p', { class: 'ls-small', role: 'status' });
    put(box, el('div', { class: 'wrp-cards' }, CARDS.map(t => { const done = st.placed[t]; return el('button', { type: 'button', class: 'wrp-card' + (st.card === t ? ' is-on' : '') + (done ? ' is-done' : ''), disabled: !!done, 'aria-pressed': String(st.card === t), onclick: () => { st.card = t; draw(); } }, show(t), done ? el('span', { class: 'wrp-card-d' }, ` ✓ ${done}`) : null); })),
      el('div', { class: 'wrp-bins' }, BINS.map(b => el('button', { type: 'button', class: 'wrp-bin', onclick: () => {
        if (!st.card) { msg.textContent = 'Tap a panel card first.'; return; }
        const right = binOf(st.card), c = classify(st.card);
        if (b === right) { st.placed[st.card] = c.polynomial ? `${c.degreeName} ${c.termName}` : 'not a polynomial'; st.card = null; P.setData('sorter', st, true); draw(); return; }
        msg.textContent = right === 'not a polynomial' ? `${show(st.card)} has a variable in the denominator, so it isn’t a polynomial.` : `Count the terms of ${show(st.card)} again: it has ${c.terms}.`;
      } }, b))), msg,
      Object.keys(st.placed).length === CARDS.length ? status(true, 'Every card sorted. The degree is the greatest exponent; the name counts the terms.', '') : null);
  }
  draw();
  return box;
}

// ------------------------------------------------------------ distribute the negative (Stage 1): tap each term
export function negFlip(ctx) {
  const P = ctx.progress, A = '6x^2 + 5x + 2', B = [[2, 2], [-3, 1], [4, 0]];
  let flipped = new Set(P.getData('negflip', []) || []);
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const terms = B.map(([c, e], i) => ({ c: flipped.has(i) ? -c : c, e, i }));
    const all = flipped.size === B.length;
    put(box, el('p', { class: 'ms-live-eq' }, '(6x² + 5x + 2) − (2x² − 3x + 4)'),
      el('p', null, 'Tap each term of the second panel to apply the negative:'),
      el('div', { class: 'wrp-negrow' }, el('span', { class: 'ms-mono' }, ptext(A)), ...terms.map(t => el('button', { type: 'button', class: 'wrp-negterm' + (flipped.has(t.i) ? ' is-flipped' : ''), 'aria-pressed': String(flipped.has(t.i)), onclick: () => { flipped.has(t.i) ? flipped.delete(t.i) : flipped.add(t.i); P.setData('negflip', [...flipped], true); draw(); } }, `${t.c < 0 ? '−' : '+'} ${termText(t.c, t.e)}`))),
      all ? el('p', { class: 'ms-live-eq wrp-result' }, '= ' + ptext(`(${A}) - (2x^2 - 3x + 4)`)) : flipped.size ? status(false, '', `${B.length - flipped.size} term${B.length - flipped.size === 1 ? '' : 's'} still to flip: the negative applies to every term, not just the first.`) : null);
  }
  draw();
  return box;
}

// ------------------------------------------------------------ the binomial area model (Stage 2)
const AM_PRESETS = [['(x + 3)(x + 4)', 1, 3, 1, 4], ['(x + 4)²', 1, 4, 1, 4], ['(x + 5)(x − 5)', 1, 5, 1, -5], ['(2x + 1)(x + 3)', 2, 1, 1, 3]];
export function areaModel(ctx) {
  const P = ctx.progress;
  let st = { a: 1, b: 3, c: 1, d: 4, ...(P.getData('area', {}) || {}) };
  const fig = el('div', { class: 'ms-figure wrp-am' }), out = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  const bin = (p, q) => `${p === 1 ? '' : p}x ${q < 0 ? '−' : '+'} ${Math.abs(q)}`;
  function draw() {
    const { a, b, c, d } = st, cells = [[`${termText(a * c, 2)}`, a * c, 2], [`${b * c < 0 ? '−' : ''}${termText(b * c, 1)}`, b * c, 1], [`${a * d < 0 ? '−' : ''}${termText(a * d, 1)}`, a * d, 1], [`${b * d}`.replace('-', '−'), b * d, 0]];
    // drawn proportions: x = 90 px, 1 = 14 px (for |b|, |d|); a picture, not a measurement
    const X = 90, U = 14, W1 = a * X, W2 = Math.abs(b) * U, H1 = c * X, H2 = Math.abs(d) * U, ox = 50, oy = 30;
    const s = svg('svg', { class: 'wrp-am-svg', viewBox: `0 0 ${ox + W1 + W2 + 20} ${oy + H1 + H2 + 20}`, role: 'img', 'aria-label': `Area model of (${bin(a, b)})(${bin(c, d)}): ${cells.map(x => x[0]).join(', ')}` });
    const rect = (x, y, w, h, t, cls) => { s.append(svg('rect', { class: 'wrp-cell ' + cls, x, y, width: w, height: h })); s.append(svg('text', { class: 'wrp-cell-t', x: x + w / 2, y: y + h / 2 + 5, 'text-anchor': 'middle' }, t)); };
    rect(ox, oy, W1, H1, cells[0][0], 'is-x2'); rect(ox + W1, oy, W2, H1, cells[2][0], 'is-x' + (a * d < 0 ? ' is-neg' : '')); rect(ox, oy + H1, W1, H2, cells[1][0], 'is-x' + (b * c < 0 ? ' is-neg' : '')); rect(ox + W1, oy + H1, W2, H2, cells[3][0], 'is-1' + (b * d < 0 ? ' is-neg' : ''));
    s.append(svg('text', { class: 'wrp-dim', x: ox + W1 / 2, y: oy - 10, 'text-anchor': 'middle' }, a === 1 ? 'x' : a + 'x'), svg('text', { class: 'wrp-dim', x: ox + W1 + W2 / 2, y: oy - 10, 'text-anchor': 'middle' }, String(d).replace('-', '−')));
    s.append(svg('text', { class: 'wrp-dim', x: ox - 8, y: oy + H1 / 2, 'text-anchor': 'end' }, c === 1 ? 'x' : c + 'x'), svg('text', { class: 'wrp-dim', x: ox - 8, y: oy + H1 + H2 / 2 + 4, 'text-anchor': 'end' }, String(b).replace('-', '−')));
    put(fig, s);
    const src = `(${a}x + (${b}))(${c}x + (${d}))`, exp = ptext(src), middle = a * d + b * c;
    const note = b * d === b * b && a === c && b === d ? 'A square: the two strips are identical, so the middle term doubles (2ab).' : a === c && b === -d ? 'A sum times a difference: the two strips are opposites, so the middle cancels (a² − b²).' : '';
    put(out, el('p', { class: 'ms-live-eq' }, `(${bin(c, b)})(${bin(a, d)})`.replace(/^\(1x/, '(x')), el('p', { class: 'ms-mono' }, cells.map(x => x[0]).join(' + ').replace(/\+ −/g, '− ')), el('p', { class: 'ms-live-eq wrp-result' }, '= ' + exp),
      el('p', { class: 'ls-small' }, `The middle term ${middle}x is the two strips added: ${a * d}x + ${b * c}x.`.replace(/\+ -/g, '− ').replace(/ -/g, ' −')), note ? el('p', { class: 'ls-small' }, note) : null);
    P.setData('area', st, true);
  }
  function controls() {
    put(ctl, el('div', { class: 'wrp-presets' }, AM_PRESETS.map(([n, a, b, c, d]) => button(n, () => { st = { a, b, c, d }; controls(); draw(); }, 'ls-btn--quiet'))),
      slider({ label: 'Height: x coefficient', min: 1, max: 3, step: 1, value: st.c, onInput: v => { st.c = v; draw(); } }).node, slider({ label: 'Height: number', min: -6, max: 6, step: 1, value: st.b, onInput: v => { st.b = v || 1; draw(); } }).node,
      slider({ label: 'Width: x coefficient', min: 1, max: 3, step: 1, value: st.a, onInput: v => { st.a = v; draw(); } }).node, slider({ label: 'Width: number', min: -6, max: 6, step: 1, value: st.d, onInput: v => { st.d = v || 1; draw(); } }).node);
  }
  controls(); draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, out), el('div', { class: 'ms-lab-panel' }, ctl, el('p', { class: 'ls-small' }, 'The drawing’s proportions are a picture, not a measurement: the algebra comes from the engine.')));
}

// ------------------------------------------------------------ the multiplication grid (Stage 2)
const GRID_PRESETS = [['x + 2', 'x^2 + 3x + 4'], ['2x - 1', 'x^2 + x + 3'], ['x + 3', 'x + 4'], ['x - 3', 'x^2 + 3x + 9']];
export function polyGrid(ctx) {
  const P = ctx.progress; let k = P.getData('grid', 0) || 0;
  const box = el('div', { 'aria-live': 'polite' });
  const termsOf = s => { const c = coeffs(s); return Object.keys(c).map(Number).sort((a, b) => b - a).map(e => [c[e], e]); };
  const show = (c, e) => (c < 0 ? '−' : '') + termText(c, e);
  function draw() {
    const [A, B] = GRID_PRESETS[k], rows = termsOf(A), cols = termsOf(B), colors = ['is-p3', 'is-p2', 'is-p1', 'is-p0'];
    put(box, el('p', { class: 'ms-live-eq' }, `(${ptext(A)})(${ptext(B)})`),
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table wrp-grid' }, el('thead', null, el('tr', null, el('th', { scope: 'col' }, '×'), cols.map(([c, e]) => el('th', { scope: 'col' }, show(c, e))))),
        el('tbody', null, rows.map(([rc, re]) => el('tr', null, el('th', { scope: 'row' }, show(rc, re)), cols.map(([cc, ce]) => el('td', { class: 'ms-mono wrp-gcell ' + colors[3 - (re + ce)] }, show(rc * cc, re + ce)))))))),
      el('p', { class: 'ls-small' }, 'Cells of the same colour are like terms: add them.'),
      el('p', { class: 'ms-live-eq wrp-result' }, '= ' + ptext(`(${A})(${B})`)));
    P.setData('grid', k, true);
  }
  draw();
  return el('div', null, segs('Product', GRID_PRESETS.map(([a, b], i) => ({ label: `(${ptext(a)})(${ptext(b)})`, value: i })), k, v => { k = v; draw(); }), box);
}

// ------------------------------------------------------------ the cut-out square (Stages 2 and 4): x² − b² = (x + b)(x − b)
export function cutOut(ctx) {
  const P = ctx.progress;
  let st = { x: 9, b: 5, re: false, ...(P.getData('cutout', {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), out = el('div', { 'aria-live': 'polite' });
  function draw() {
    const { x, b } = st, u = 200 / x, s = svg('svg', { class: 'wrp-dos', viewBox: '0 0 300 250', role: 'img', 'aria-label': st.re ? `The L-shape rearranged into a ${x + b} by ${x - b} rectangle` : `An ${x} by ${x} square with a ${b} by ${b} square cut from its corner` });
    if (!st.re) {
      s.append(svg('rect', { class: 'wrp-cell is-x2', x: 20, y: 20, width: x * u, height: x * u }), svg('rect', { class: 'wrp-hole', x: 20 + (x - b) * u, y: 20 + (x - b) * u, width: b * u, height: b * u }));
      s.append(svg('text', { class: 'wrp-dim', x: 20 + x * u / 2, y: 14, 'text-anchor': 'middle' }, `x = ${x}`), svg('text', { class: 'wrp-dim', x: 20 + (x - b / 2) * u, y: 20 + (x - b / 2) * u + 4, 'text-anchor': 'middle' }, `${b}²`));
    } else {
      const w = (x + b) * u * 0.9, h = (x - b) * u * 0.9;
      s.append(svg('rect', { class: 'wrp-cell is-x2', x: 20, y: 40, width: x * u * 0.9, height: h }), svg('rect', { class: 'wrp-cell is-x', x: 20 + x * u * 0.9, y: 40, width: b * u * 0.9, height: h }));
      s.append(svg('text', { class: 'wrp-dim', x: 20 + w / 2, y: 32, 'text-anchor': 'middle' }, `x + ${b} = ${x + b}`), svg('text', { class: 'wrp-dim', x: 14, y: 40 + h / 2, 'text-anchor': 'end' }, `x − ${b}`));
    }
    put(fig, s);
    put(out, tiles([['Square − cut-out', `${x}² − ${b}² = ${x * x - b * b}`], ['Rearranged rectangle', `(${x} + ${b})(${x} − ${b}) = ${(x + b) * (x - b)}`, 'is-best']]),
      el('p', { class: 'ms-live-eq' }, `x² − ${b * b} = (x + ${b})(x − ${b})`), el('p', { class: 'ls-small' }, DOS_NOTE.replace(/5/g, String(b))));
    P.setData('cutout', st, true);
  }
  const ctl = el('div', null, slider({ label: 'Sheet side x', min: 6, max: 14, step: 1, value: st.x, onInput: v => { st.x = Math.max(v, st.b + 1); draw(); } }).node, slider({ label: 'Cut-out side', min: 1, max: 5, step: 1, value: st.b, onInput: v => { st.b = Math.min(v, st.x - 1); draw(); } }).node,
    segs('View', [{ label: 'Cut out', value: false }, { label: 'Rearranged', value: true }], st.re, v => { st.re = v; draw(); }));
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, out));
}

// ------------------------------------------------------------ the GCF board (Stage 3): try a factor, see the groups
const GCF_PRESETS = ['12x + 18', '6x^2 + 9x', '8x + 12', '10x^2 + 15x', '12x^3 + 8x^2'];
export function gcfBoard(ctx) {
  const P = ctx.progress;
  let st = { k: 0, pick: null, ...(P.getData('gcf', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const src = GCF_PRESETS[st.k], c = coeffs(src), G = gcfOf(src), ge = G.vars.x || 0, nums = Object.values(c).map(Math.abs), minE = Math.min(...Object.keys(c).map(Number));
    const cands = []; for (let n = 1; n <= Math.max(...nums); n++) if (nums.every(v => v % n === 0)) for (let e = 0; e <= minE; e++) cands.push([n, e]);
    const cand = st.pick, isG = cand && cand[0] === G.k && cand[1] === ge;
    const inner = cand ? Object.keys(c).map(Number).sort((a, b) => b - a).map(e => [c[e] / cand[0], e - cand[1]]) : null;
    put(box, el('p', { class: 'ms-live-eq' }, ptext(src)), el('p', null, 'Try a common factor:'),
      el('div', { class: 'wrp-cands' }, cands.filter(([n, e]) => n > 1 || e > 0).map(([n, e]) => button(termText(n, e) || '1', () => { st.pick = [n, e]; P.setData('gcf', st, true); draw(); }, 'ls-btn--quiet' + (cand && cand[0] === n && cand[1] === e ? ' is-on' : '')))),
      cand ? el('div', null, el('div', { class: 'wrp-gcfgroups' }, Array.from({ length: Math.min(cand[0], 12) }, () => el('span', { class: 'wrp-gcfg' }, inner.map(([k, e]) => termText(k, e)).join(' + ')))),
        el('p', { class: 'ms-live-eq' }, `${ptext(src)} = ${termText(cand[0], cand[1])}(${ptext(polyOf(inner.map(([k, e]) => `${k}*x^${e}`).join(' + ')))})`),
        status(isG, 'That’s the greatest common factor: nothing common is left inside the bracket.', `A common factor, but not the greatest: the terms inside still share ${gcfText({ k: G.k / cand[0], vars: ge - cand[1] ? { x: ge - cand[1] } : {} })}.`)) : null);
  }
  draw();
  return el('div', null, segs('Cut sheet', GCF_PRESETS.map((p, i) => ({ label: ptext(p), value: i })), st.k, v => { st = { k: v, pick: null }; draw(); }), box);
}

// ------------------------------------------------------------ the grouping board (Stage 3)
export const GROUP_PRESETS = [
  { src: '3x + 6 + 2xy + 4y', g: ['3x + 6', '2xy + 4y'], f: ['3', '2y'], in: ['x + 2', 'x + 2'], bin: 'x + 2', out: '(x + 2)(3 + 2y)' },
  { src: 'x^2 + 5x + 3x + 15', g: ['x^2 + 5x', '3x + 15'], f: ['x', '3'], in: ['x + 5', 'x + 5'], bin: 'x + 5', out: '(x + 3)(x + 5)' },
  { src: '2x^2 + 6x + 5x + 15', g: ['2x^2 + 6x', '5x + 15'], f: ['2x', '5'], in: ['x + 3', 'x + 3'], bin: 'x + 3', out: '(2x + 5)(x + 3)' },
  { src: 'x^2 + 3x + 2x + 5', g: ['x^2 + 3x', '2x + 5'], f: ['x', '1'], in: ['x + 3', '2x + 5'], bin: null, out: null }
];
export function groupingBoard(ctx) {
  const P = ctx.progress;
  let st = { k: 0, step: 0, ...(P.getData('grouping', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const X = GROUP_PRESETS[st.k];
    // each group = its factor × its bracket (checked by multiplying back in the tests)
    const cols = [0, 1].map(i => el('div', { class: 'wrp-gcol' }, el('p', { class: 'wrp-tlab' }, `Group ${i + 1}`), el('p', { class: 'ms-mono' }, ptext(X.g[i])), st.step >= 1 ? el('p', { class: 'ms-mono wrp-hl' }, `${X.f[i]}(${ptext(X.in[i])})`) : null));
    put(box, el('p', { class: 'ms-live-eq' }, X.src.replace(/\^2/g, '²')), el('div', { class: 'wrp-gcols' }, cols),
      st.step >= 2 ? (X.bin ? el('p', { class: 'ms-live-eq wrp-result' }, `Common binomial (${X.bin}): ${X.out}`) : status(false, '', 'The brackets don’t match: no common binomial, so this grouping doesn’t factor the expression.')) : null,
      st.step >= 3 && X.out ? el('p', { class: 'ls-small' }, `Check: ${X.out} multiplies back to ${ptext(X.out)} ✓`) : null,
      el('div', { class: 'ls-actions' }, st.step < (X.bin ? 3 : 2) ? button(['Factor each group', 'Look for a common binomial', 'Multiply back to check'][st.step], () => { st.step += 1; P.setData('grouping', st, true); draw(); }, 'ls-btn--primary') : null, st.step ? button('Start again', () => { st.step = 0; draw(); }, 'ls-btn--quiet') : null));
  }
  draw();
  return el('div', null, segs('Expression', GROUP_PRESETS.map((x, i) => ({ label: x.src.replace(/\^2/g, '²'), value: i })), st.k, v => { st = { k: v, step: 0 }; draw(); }), box);
}

// ------------------------------------------------------------ the factor-pair finder (Stage 4)
const PAIR_PRESETS = [[1, 7, 12], [1, 5, 6], [1, -1, -12], [1, -7, 12], [2, 7, 3], [1, 3, 5]];
export function pairFinder(ctx) {
  const P = ctx.progress;
  let st = { k: 0, pick: null, ...(P.getData('pairs', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const [a, b, c] = PAIR_PRESETS[st.k], ac = a * c, pairs = [];
    for (let m = -Math.abs(ac); m <= Math.abs(ac); m++) { if (m === 0 || ac % m) continue; const n = ac / m; if (m <= n) pairs.push([m, n]); }
    const F = factorQuadratic(a, b, c), src = ptext(`${a}*x^2 + (${b})*x + (${c})`), win = pairs.find(([m, n]) => m + n === b);
    const pick = st.pick, ok = pick && pick[0] + pick[1] === b;
    put(box, el('p', { class: 'ms-live-eq' }, src), el('p', null, a === 1 ? `Find two numbers that multiply to ${c} and add to ${b}.` : `a × c = ${ac}. Find two numbers that multiply to ${ac} and add to ${b}.`),
      el('div', { class: 'wrp-cands' }, pairs.map(([m, n]) => button(`${m} and ${n}`.replace(/-/g, '−'), () => { st.pick = [m, n]; P.setData('pairs', st, true); draw(); }, 'ls-btn--quiet' + (pick && pick[0] === m && pick[1] === n ? ' is-on' : '')))),
      el('div', { class: 'ls-actions' }, win ? null : button('No pair works', () => { st.pick = 'none'; draw(); }, 'ls-btn--quiet')),
      pick === 'none' ? status(!win, 'Right: no integer pair has that product and that sum, so it doesn’t factor over the integers.', 'There is a pair: check the sums again.')
        : pick ? (ok ? el('div', null, status(true, `${pick[0]} × ${pick[1]} = ${ac} and ${pick[0]} + ${pick[1]} = ${b}.`.replace(/-/g, '−'), ''),
          a === 1 ? null : el('p', { class: 'ms-mono' }, `Split: ${ptext(`${a}*x^2`)} ${pick[0] < 0 ? '−' : '+'} ${Math.abs(pick[0])}x ${pick[1] < 0 ? '−' : '+'} ${Math.abs(pick[1])}x ${c < 0 ? '−' : '+'} ${Math.abs(c)}`),
          el('p', { class: 'ms-live-eq wrp-result' }, `${src} = ${quadText(F)}`), el('p', { class: 'ls-small' }, `Check: ${quadText(F)} multiplies back to ${ptext(quadText(F).replace(/−/g, '-'))} ✓`))
          : status(false, '', `${pick[0]} × ${pick[1]} = ${ac}, but ${pick[0]} + ${pick[1]} = ${pick[0] + pick[1]}, not ${b}.`.replace(/-/g, '−'))) : null);
  }
  draw();
  return el('div', null, segs('Area', PAIR_PRESETS.map(([a, b, c], i) => ({ label: ptext(`${a}*x^2 + (${b})*x + (${c})`), value: i })), st.k, v => { st = { k: v, pick: null }; draw(); }), box);
}

// ------------------------------------------------------------ the quadratic factor builder (Stage 4): tiles into a rectangle
const BUILD_PRESETS = [[1, 7, 12], [2, 7, 3], [1, 6, 9], [1, 5, 4], [1, 4, 5]];
export function tileBuilder(ctx) {
  const P = ctx.progress;
  let st = { k: 0, built: false, ...(P.getData('builder', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const [a, b, c] = BUILD_PRESETS[st.k], F = factorQuadratic(a, b, c), src = ptext(`${a}*x^2 + ${b}*x + ${c}`);
    const loose = el('div', { class: 'wrp-loose' }, tileRow({ 2: a, 1: b, 0: c }, `${a} x² tiles, ${b} x tiles and ${c} unit tiles`));
    let rect = null;
    if (st.built && F && F.k === 1) {
      // rectangle: rows = p·x + q (p x-strips tall, q units), cols = r·x + s
      const [[p, q], [r, s]] = F.f, X = 60, U = 14, W = r * X + s * U, Hh = p * X + q * U, sv = svg('svg', { class: 'wrp-build-svg', viewBox: `0 0 ${W + 70} ${Hh + 50}`, role: 'img', 'aria-label': `The tiles arranged into a ${quadText(F)} rectangle` });
      const ox = 50, oy = 30;
      for (let i = 0; i < p; i++) for (let j = 0; j < r; j++) sv.append(svg('rect', { class: 'wrp-cell is-x2', x: ox + j * X, y: oy + i * X, width: X, height: X }));
      for (let i = 0; i < p; i++) for (let j = 0; j < s; j++) sv.append(svg('rect', { class: 'wrp-cell is-x', x: ox + r * X + j * U, y: oy + i * X, width: U, height: X }));
      for (let i = 0; i < q; i++) for (let j = 0; j < r; j++) sv.append(svg('rect', { class: 'wrp-cell is-x', x: ox + j * X, y: oy + p * X + i * U, width: X, height: U }));
      for (let i = 0; i < q; i++) for (let j = 0; j < s; j++) sv.append(svg('rect', { class: 'wrp-cell is-1', x: ox + r * X + j * U, y: oy + p * X + i * U, width: U, height: U }));
      sv.append(svg('text', { class: 'wrp-dim', x: ox + W / 2, y: oy - 10, 'text-anchor': 'middle' }, `${r === 1 ? '' : r}x + ${s}`), svg('text', { class: 'wrp-dim', x: ox - 8, y: oy + Hh / 2, 'text-anchor': 'end' }, `${p === 1 ? '' : p}x + ${q}`));
      rect = el('div', { class: 'ms-figure' }, sv);
    }
    put(box, el('p', { class: 'ms-live-eq' }, src), loose,
      el('div', { class: 'ls-actions' }, button(st.built ? 'Scatter the tiles' : 'Arrange into a rectangle', () => { st.built = !st.built; P.setData('builder', st, true); draw(); }, 'ls-btn--primary')),
      st.built ? (F ? [rect, el('p', { class: 'ms-live-eq wrp-result' }, `${src} = ${quadText(F)}`), el('p', { class: 'ls-small' }, 'The rectangle’s sides are the factors: its width and height.')] : status(false, '', `These tiles don’t make a rectangle with whole-number sides: ${src} doesn’t factor over the integers.`)) : null);
  }
  draw();
  return el('div', null, segs('Tiles', BUILD_PRESETS.map(([a, b, c], i) => ({ label: ptext(`${a}*x^2 + ${b}*x + ${c}`), value: i })), st.k, v => { st = { k: v, built: false }; draw(); }), box);
}

// ------------------------------------------------------------ the design studio (board)
export function designStudio(ctx, missions) {
  const P = ctx.progress, D = studio(P), got = earnedBadges(P, missions), zones = new Set(D.zones);
  const save = patch => { P.setData('studio', { ...studio(P), ...patch }, true); ctx.rerender(); };
  const total = zones.size ? polyOf([...zones].map(z => `(${ZONES.find(x => x.id === z).area})`).join(' + ')) : polyOf('0');
  const nid = uid('wn'), name = el('input', { class: 'ls-input', id: nid, maxlength: 18, value: D.name, placeholder: 'Team or rider name' });
  name.addEventListener('change', () => save({ name: name.value.trim() }));
  return el('section', { class: 'wrp-studio', 'aria-label': 'The design studio' },
    el('p', { class: 'ls-kicker' }, `${STUDIO} · design studio`),
    el('div', { class: 'wrp-bikes', role: 'radiogroup', 'aria-label': 'Choose a bike' }, BIKES.map(b => el('button', { type: 'button', role: 'radio', class: 'wrp-bike' + (D.bike === b.id ? ' is-on' : ''), 'aria-checked': String(D.bike === b.id), onclick: () => save({ bike: b.id }) },
      frameSvg({ bike: b.id, zones: new Set(['top', 'down']), palette: D.palette, pattern: D.pattern, label: b.name }), el('span', { class: 'wrp-bike-n' }, b.name), el('span', { class: 'wrp-bike-b' }, b.blurb)))),
    el('div', { class: 'wrp-canvas' }, el('div', { class: 'wrp-canvas-art' }, frameSvg({ bike: D.bike, zones, palette: D.palette, pattern: D.pattern, finish: D.finish, name: D.name, names: zoneNames, label: `Your ${BIKES.find(b => b.id === D.bike).name}: tap a zone to cover it`, onZone: id => { zones.has(id) ? zones.delete(id) : zones.add(id); save({ zones: [...zones] }); } })),
      el('div', { class: 'wrp-canvas-side' },
        segs('Palette', PALETTES.map(p => ({ label: p.name, value: p.id })), D.palette, v => save({ palette: v })),
        segs('Finish', FINISHES.map(f => ({ label: f.name, value: f.id })), D.finish, v => save({ finish: v })),
        segs('Pattern', PATTERNS.map(p => ({ label: p.name, value: p.id })), D.pattern, v => save({ pattern: v })),
        el('div', { class: 'ls-field' }, el('label', { for: nid }, 'Team or rider name'), name))),
    el('p', { class: 'ls-kicker' }, 'Material board'),
    tableEl(ZONES.map(z => [z.name, ptext(z.area), zones.has(z.id) ? 'covered' : '—']), ['Zone', 'Panel area (design units²)', 'Kit']),
    el('p', { class: 'ms-live-eq' }, `Combined film: ${zones.size ? ptext(total) : '0'}`),
    el('ul', { class: 'wrp-checklist' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-done' : '' }, (got.has(m.id) ? '✓ ' : '○ ') + m.title))),
    el('p', { class: 'ls-small' }, MODEL_NOTE));
}

// ------------------------------------------------------------ the custom MTB armor blueprint (extension)
export function blueprint(ctx, missions, certified) {
  const P = ctx.progress, D = studio(P), got = earnedBadges(P, missions), zones = new Set(D.zones), kid = uid('wk');
  const kit = el('input', { class: 'ls-input wrp-kit-in', id: kid, maxlength: 40, value: D.kit || '', placeholder: 'Name your kit' });
  const head = el('p', { class: 'wrp-bp-h' }, `${(D.kit || 'CUSTOM MTB ARMOR').toUpperCase()} — BLUEPRINT`);
  kit.addEventListener('input', () => { head.textContent = `${(kit.value.trim() || 'CUSTOM MTB ARMOR').toUpperCase()} — BLUEPRINT`; });
  kit.addEventListener('change', () => P.setData('studio', { ...studio(P), kit: kit.value.trim() }, true));
  const sel = ZONES.filter(z => zones.has(z.id)), total = sel.length ? polyOf(sel.map(z => `(${z.area})`).join(' + ')) : polyOf('0');
  const sx = 4, val = Number([...total].reduce((s, [k, c]) => s + Number(c) * Math.pow(sx, k ? Number(k.split(':')[1]) : 0), 0));
  const line = (id, t, body) => el('section', { class: 'wrp-bp-sec' + (got.has(id) ? '' : ' is-locked') }, el('p', { class: 'wrp-bp-t' }, t), got.has(id) ? body : el('p', { class: 'ls-small' }, 'Complete this stage to add it to the blueprint.'));
  return el('div', { class: 'wrp-bp' }, head, el('div', { class: 'ls-field' }, el('label', { for: kid }, 'Kit name'), kit),
    el('div', { class: 'wrp-bp-art' }, frameSvg({ bike: D.bike, zones, palette: D.palette, pattern: D.pattern, finish: D.finish, name: D.name, label: 'Your finished frame protection design' })),
    tiles([['Bike', BIKES.find(b => b.id === D.bike).name], ['Design', `${PALETTES.find(p => p.id === D.palette).name}, ${D.finish}, ${PATTERNS.find(p => p.id === D.pattern).name.toLowerCase()}`], ['Coverage', sel.length ? sel.map(z => z.name).join(', ') : 'no zones yet']]),
    el('div', { class: 'wrp-bp-grid' },
      line('design', 'Panel areas combined', el('div', null, tableEl(sel.map(z => [z.name, ptext(z.area)]), ['Zone', 'Area']), el('p', { class: 'ms-mono' }, `Total: ${ptext(total)}`), el('p', { class: 'ms-mono' }, `Minus a 2x² + x + 1 window: ${ptext(polyOf(`(${polyText(total).replace(/−/g, '-')}) - (2x^2 + x + 1)`))}`))),
      line('expand', 'Expanded panel', el('div', null, el('p', { class: 'ms-mono' }, '(x + 3)(x + 4) = x² + 7x + 12'), el('p', { class: 'ms-mono' }, '(x + 4)² = x² + 8x + 16'))),
      line('cutsheet', 'Optimized material', el('div', null, el('p', { class: 'ms-mono' }, '12x + 18 = 6(2x + 3): six identical sections'), el('p', { class: 'ms-mono' }, '3x + 6 + 2xy + 4y = (x + 2)(3 + 2y)'))),
      line('reverse', 'Recovered panel', el('div', null, el('p', { class: 'ms-mono' }, 'x² + 7x + 12 = (x + 3)(x + 4): x + 3 by x + 4'), el('p', { class: 'ms-mono' }, '2x² + 7x + 3 = (2x + 1)(x + 3)')))),
    el('p', { class: 'ls-kicker' }, 'Material summary'),
    el('p', null, sel.length ? `Combined modeled film: ${ptext(total)} design units². With x = ${sx} design units, that’s ${val} square design units.` : 'Cover some zones in the design studio to build the summary.'),
    el('ul', { class: 'dl-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, (got.has(m.id) ? '★ ' : '☆ ') + m.badge))),
    certified ? el('p', { class: 'wrp-cert' }, 'CERTIFIED MTB FRAME DESIGNER') : null,
    el('p', { class: 'ls-small' }, MODEL_NOTE));
}
export { coeffs as polyCoeffs };
