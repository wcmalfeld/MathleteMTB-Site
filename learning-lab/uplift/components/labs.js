// Uplift: interactives. Every number shown comes from logic/systems.js
// (exact fractions); intersections are calculated, never read from pixels,
// and the graphs only draw them. Controls are buttons, sliders and inputs,
// so everything works from the keyboard and by tapping. Settings are kept in
// the lab's progress quietly: exploring is never marked.

import { el, put, button, id as uid } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { earnedBadges } from '../../dream-line-project/components/park.js';
import { gridSvg, tableEl } from '../../slope-lab/components/figures.js';
import { figure as ftlFigure } from '../../frame-the-line/components/labs.js';
import { E, F, S, solve, check, eqText, breakEven, cost, substitutionSteps, eliminationSteps, scale, addEq, blend, rateMeet, mixture, pointText, KIND_TEXT, satisfies } from '../logic/systems.js';
import { PLANS, FLEET, INVOICES, ORDERS, MIX, CREWS, DESTINATIONS, DEPARTMENTS, PRICE_NOTE, SOIL_NOTE, CREW_NOTE, WHOLE_NOTE } from '../logic/park.js';
import { destinationArt, workshopArt, bikeIcon } from './visuals.js';

const N = x => Number(F(x));
const money = x => (N(x) < 0 ? '−$' : '$') + Math.abs(N(x)).toLocaleString('en-US', { maximumFractionDigits: 2 });
const tiles = rows => el('div', { class: 'upl-tiles' }, rows.filter(Boolean).map(([k, v, cls]) => el('div', { class: 'upl-tile' + (cls ? ' ' + cls : '') }, el('p', { class: 'upl-tile-k' }, k), el('p', { class: 'upl-tile-v' }, v))));
const stepList = (steps, upto) => el('ol', { class: 'upl-steps' }, steps.slice(0, upto).map((s, i) => el('li', { class: i === upto - 1 ? 'is-new' : '' }, el('span', { class: 'upl-step-eq' }, s.text), el('span', { class: 'upl-step-note' }, s.note))));
export const park = P => ({ destination: null, ...(P.getData('park', {}) || {}) });
export const destOf = P => DESTINATIONS.find(d => d.id === park(P).destination) || null;

// ------------------------------------------------------------ figures (q.fig)
export function figure(fig) {
  if (!fig) return null;
  if (fig.kind === 'system') return el('div', { class: 'ms-figure upl-fig' }, gridSvg({ ...fig.grid, lines: fig.lines, points: fig.points || [], label: fig.label || 'Two lines on a grid' }));
  return ftlFigure(fig);
}

// ------------------------------------------------------------ the live pricing graph (Stage 1, and the break-even challenge)
const PLAN_DEFAULT = { af: PLANS.a.fee, ar: PLANS.a.rate, bf: PLANS.b.fee, br: PLANS.b.rate, r: 3 };
export function pricingGraph(ctx, o = {}) {
  const P = ctx.progress, key = o.key || 'pricing';
  let st = { ...PLAN_DEFAULT, ...(P.getData(key, {}) || {}) };
  const fig = el('div', { class: 'ms-figure' }), dash = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  function draw() {
    const pa = { fee: st.af, rate: st.ar }, pb = { fee: st.bf, rate: st.br }, R = breakEven(pa, pb), ca = N(cost(pa, st.r)), cb = N(cost(pb, st.r));
    const top = Math.max(ca, cb, st.af + 12 * st.ar, st.bf + 12 * st.br, R.kind === 'one' ? N(R.C) : 0), ymax = Math.ceil((top + 10) / 20) * 20;
    const inView = R.kind === 'one' && N(R.r) >= 0 && N(R.r) <= 12;
    put(fig, plot({ x: [0, 12], y: [0, ymax], xStep: 1, xDigits: 0, xLabel: 'Shuttle rides r', yLabel: 'Total cost C ($)', label: `Plan A C = ${st.ar}r + ${st.af} and Plan B C = ${st.br}r + ${st.bf}` + (R.kind === 'one' ? `, crossing at ${pointText(R.r, R.C)}` : ''),
      series: [{ points: [[0, st.af], [12, st.af + 12 * st.ar]], cls: 'upl-a' }, { points: [[0, st.bf], [12, st.bf + 12 * st.br]], cls: 'upl-b' + (R.kind === 'infinite' ? ' is-same' : '') }],
      vlines: [{ x: st.r, cls: 'upl-now', label: `${st.r} rides` }],
      marks: [{ x: st.r, y: ca, r: 6, cls: 'upl-mark-a' }, { x: st.r, y: cb, r: 6, cls: 'upl-mark-b' }, inView ? { x: N(R.r), y: N(R.C), r: 9, cls: 'upl-meet', label: `break-even ${pointText(R.r, R.C)}` } : null].filter(Boolean) }).node);
    const cheaper = ca === cb ? null : ca < cb ? 'a' : 'b';
    put(dash, tiles([[`Plan A: C = ${st.ar}r + ${st.af}`, money(ca), cheaper === 'a' ? 'is-best' : ''], [`Plan B: C = ${st.br}r + ${st.bf}`, money(cb), cheaper === 'b' ? 'is-best' : ''],
      ['Break-even', R.kind === 'one' ? `${S(R.r)} rides, ${money(R.C)}` : R.kind === 'none' ? 'never: parallel' : 'always: same plan', R.kind === 'one' ? 'is-meet' : '']]),
      el('p', { class: 'ls-small upl-verdict' }, cheaper ? `At ${st.r} rides, Plan ${cheaper.toUpperCase()} is cheaper by ${money(Math.abs(ca - cb))}.` : `At ${st.r} rides, both plans cost ${money(ca)}.`),
      R.kind === 'one' && !Number.isInteger(N(R.r)) ? el('p', { class: 'ls-small' }, `The lines cross at ${S(R.r)} rides, but rides come in whole numbers: no ride count costs exactly the same on both.`) : null);
    P.setData(key, st, true);
  }
  function controls() {
    put(ctl, slider({ label: 'Number of rides', min: 0, max: 12, step: 1, value: st.r, unit: 'rides', onInput: v => { st.r = v; draw(); } }).node,
      o.edit === false ? null : el('details', { class: 'upl-edit', open: !!o.openEdit }, el('summary', null, 'Change the plans (explore)'),
        slider({ label: 'Plan A booking fee', min: 0, max: 60, step: 2, value: st.af, format: v => '$' + v, onInput: v => { st.af = v; draw(); } }).node,
        slider({ label: 'Plan A per ride', min: 1, max: 12, step: 1, value: st.ar, format: v => '$' + v, onInput: v => { st.ar = v; draw(); } }).node,
        slider({ label: 'Plan B pass fee', min: 0, max: 60, step: 2, value: st.bf, format: v => '$' + v, onInput: v => { st.bf = v; draw(); } }).node,
        slider({ label: 'Plan B per ride', min: 1, max: 12, step: 1, value: st.br, format: v => '$' + v, onInput: v => { st.br = v; draw(); } }).node,
        button('Back to the original plans', () => { st = { ...PLAN_DEFAULT, r: st.r }; controls(); draw(); }, 'ls-btn--quiet')));
  }
  controls(); draw();
  return el('div', null, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, ctl, dash)), el('p', { class: 'ls-small' }, WHOLE_NOTE + ' ' + PRICE_NOTE));
}

// ------------------------------------------------------------ one, none or infinitely many (Stage 1)
const CASES = {
  one: { a: [8, 12], b: [4, 36], text: ['y = 8x + 12', 'y = 4x + 36'], why: 'Different slopes (8 and 4): the lines cross exactly once.' },
  none: { a: [6, 20], b: [6, 30], text: ['y = 6x + 20', 'y = 6x + 30'], why: 'Same slope, intercepts 20 and 30: parallel lines stay $10 apart forever.' },
  infinite: { a: [8, 16], b: [8, 16], text: ['y = 8(x + 2)', 'y = 8x + 16'], why: '8(x + 2) = 8x + 16: the same line drawn twice. Every point on it is a solution.' }
};
export function classifier(ctx) {
  const P = ctx.progress; let cur = P.getData('classCase', 'one');
  const box = el('div', { 'aria-live': 'polite' });
  function draw() {
    const C = CASES[cur], e1 = E(-C.a[0], 1, C.a[1]), e2 = E(-C.b[0], 1, C.b[1]), R = solve(e1, e2);
    const working = R.kind === 'one' ? `${C.a[0]}x + ${C.a[1]} = ${C.b[0]}x + ${C.b[1]}  →  x = ${S(R.x)}, y = ${S(R.y)}` : R.kind === 'none' ? `${C.a[0]}x + ${C.a[1]} = ${C.b[0]}x + ${C.b[1]}  →  ${C.a[1]} = ${C.b[1]}: never true` : `${C.a[0]}x + ${C.a[1]} = ${C.b[0]}x + ${C.b[1]}  →  ${C.a[1]} = ${C.b[1]}: always true`;
    put(box, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, el('div', { class: 'ms-figure' }, plot({ x: [0, 10], y: [0, 110], xStep: 1, xDigits: 0, xLabel: 'x', yLabel: 'y', label: `${C.text[0]} and ${C.text[1]}: ${KIND_TEXT[R.kind]}`,
      series: [{ points: [[0, C.a[1]], [10, C.a[1] + 10 * C.a[0]]], cls: 'upl-a' }, { points: [[0, C.b[1]], [10, C.b[1] + 10 * C.b[0]]], cls: 'upl-b' + (R.kind === 'infinite' ? ' is-same' : '') }],
      marks: R.kind === 'one' ? [{ x: N(R.x), y: N(R.y), r: 9, cls: 'upl-meet', label: pointText(R.x, R.y) }] : [] }).node)),
      el('div', { class: 'ms-lab-panel' }, el('p', { class: 'ms-live-eq' }, C.text[0]), el('p', { class: 'ms-live-eq' }, C.text[1]), el('p', { class: 'upl-kind is-' + R.kind }, KIND_TEXT[R.kind]), el('p', null, C.why), el('p', { class: 'ls-small ms-mono' }, working))));
    const seen = new Set(P.getData('classSeen', []) || []); seen.add(cur); P.setData('classSeen', [...seen], true); P.setData('classCase', cur, true);
  }
  draw();
  return el('div', null, segs('System', [{ label: 'One solution', value: 'one' }, { label: 'No solution', value: 'none' }, { label: 'Infinitely many', value: 'infinite' }], cur, v => { cur = v; draw(); }), box);
}

// ------------------------------------------------------------ the rental fleet (Stage 2)
export function fleetBuilder(ctx) {
  const P = ctx.progress;
  let st = { total: FLEET.total, trail: FLEET.trail, dh: FLEET.dh, target: FLEET.revenue, x: 9, ...(P.getData('fleet', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  function draw() {
    st.x = Math.min(st.x, st.total);
    const x = st.x, y = st.total - x, rev = st.trail * x + st.dh * y, e1 = E(1, 1, st.total), e2 = E(st.trail, st.dh, st.target), R = solve(e1, e2), ok = rev === st.target;
    put(out, el('div', { class: 'upl-rack', role: 'img', 'aria-label': `${x} trail bikes and ${y} downhill bikes` }, Array.from({ length: st.total }, (_, i) => bikeIcon(i < x ? 'trail' : 'dh'))),
      tiles([['Trail bikes x', String(x)], ['Downhill bikes y', String(y)], ['Trail revenue', money(st.trail * x)], ['Downhill revenue', money(st.dh * y)], ['Daily total', money(rev), ok ? 'is-best' : '']]),
      el('ul', { class: 'upl-checks' }, el('li', { class: 'is-ok' }, `Equation 1: ${x} + ${y} = ${st.total} ✓`), el('li', { class: ok ? 'is-ok' : 'is-off' }, `Equation 2: ${st.trail}(${x}) + ${st.dh}(${y}) = ${rev.toLocaleString('en-US')} ${ok ? '✓' : `✗ (target ${st.target.toLocaleString('en-US')})`}`)),
      status(ok, 'Both conditions hold: this is the solution of the system.', R.kind === 'one' && Number.isInteger(N(R.x)) && N(R.x) >= 0 && N(R.y) >= 0 ? 'The fleet size is right, but the revenue isn’t: move the slider.' : 'With these numbers, no whole-number fleet hits both targets exactly.'));
    P.setData('fleet', st, true);
  }
  function controls() {
    put(ctl, slider({ label: 'Trail bikes in the fleet', min: 0, max: st.total, step: 1, value: st.x, unit: 'bikes', onInput: v => { st.x = v; draw(); } }).node,
      el('details', { class: 'upl-edit' }, el('summary', null, 'Change the fleet (explore)'),
        slider({ label: 'Fleet size', min: 6, max: 30, step: 1, value: st.total, unit: 'bikes', onInput: v => { st.total = v; controls(); draw(); } }).node,
        slider({ label: 'Trail bike rate', min: 30, max: 100, step: 5, value: st.trail, unit: '$ a day', onInput: v => { st.trail = v; draw(); } }).node,
        slider({ label: 'Downhill bike rate', min: 50, max: 150, step: 5, value: st.dh, unit: '$ a day', onInput: v => { st.dh = v; draw(); } }).node,
        slider({ label: 'Revenue target', min: 300, max: 4000, step: 30, value: st.target, format: v => '$' + v, onInput: v => { st.target = v; draw(); } }).node,
        button('Back to the opening-day fleet', () => { st = { total: FLEET.total, trail: FLEET.trail, dh: FLEET.dh, target: FLEET.revenue, x: st.x }; controls(); draw(); }, 'ls-btn--quiet')));
  }
  controls(); draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, out), el('div', { class: 'ms-lab-panel' }, ctl, el('p', { class: 'ls-small' }, PRICE_NOTE)));
}

// ------------------------------------------------------------ the substitution workbench (Stage 2): choose, then step through
const SUB_SYSTEMS = [
  { id: 'fleet', name: 'The rental fleet', e1: FLEET.e1, e2: FLEET.e2 },
  { id: 'cs1', name: 'x + 2y = 16, x = 4y − 2', e1: E(1, 2, 16), e2: E(1, -4, -2) },
  { id: 'cs2', name: '3x − y = 7, 2x + 3y = 1', e1: E(3, -1, 7), e2: E(2, 3, 1) },
  { id: 'mix', name: 'The soil mixture', e1: E(1, 1, 10), e2: E('0.9', '0.5', 7) }
];
export function substitutionWorkbench(ctx) {
  const P = ctx.progress;
  let st = { sys: 'fleet', v: 'x', from: 1, step: 1, ...(P.getData('subwb', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' }), head = el('div');
  function draw() {
    const Sy = SUB_SYSTEMS.find(s => s.id === st.sys), A = st.from === 1 ? Sy.e1 : Sy.e2, k = st.v === 'x' ? A.a : A.b;
    if (k.zero) { st.v = st.v === 'x' ? 'y' : 'x'; }
    const R = substitutionSteps(Sy.e1, Sy.e2, st.v, st.from), all = R.steps, kk = st.v === 'x' ? A.a : A.b, easy = Math.abs(N(kk)) === 1;
    put(head, el('p', { class: 'ms-live-eq' }, `(1)  ${eqText(Sy.e1)}`), el('p', { class: 'ms-live-eq' }, `(2)  ${eqText(Sy.e2)}`),
      el('div', { class: 'upl-iso', role: 'group', 'aria-label': 'Which variable to isolate' }, [['x', 1], ['y', 1], ['x', 2], ['y', 2]].map(([v, n]) => { const e = n === 1 ? Sy.e1 : Sy.e2, c = v === 'x' ? e.a : e.b; return c.zero ? null : el('button', { type: 'button', class: 'ls-seg', role: 'radio', 'aria-checked': String(st.v === v && st.from === n), onclick: () => { st.v = v; st.from = n; st.step = 1; draw(); } }, `${v} from (${n})`); })),
      el('p', { class: 'ls-small' }, easy ? `Good choice: ${st.v} has a coefficient of ${S(kk)} in equation ${st.from}, so no fractions.` : `This works, but ${st.v} has a coefficient of ${S(kk)} in equation ${st.from}: expect fractions.`));
    const done = st.step >= all.length, R2 = R.result;
    put(box, stepList(all, st.step), el('div', { class: 'ls-actions' }, done ? null : button('Next step', () => { st.step += 1; draw(); }, 'ls-btn--primary'), st.step > 1 ? button('Start again', () => { st.step = 1; draw(); }, 'ls-btn--quiet') : null),
      done && R2.kind === 'one' ? el('div', { class: 'upl-verify' }, el('p', { class: 'ls-kicker' }, 'Verify in both original equations'), ...[Sy.e1, Sy.e2].map((e, i) => el('p', { class: 'ms-mono' }, `(${i + 1})  ${S(e.a)}(${S(R2.x)}) + ${S(e.b)}(${S(R2.y)}) = ${S(e.a.mul(R2.x).add(e.b.mul(R2.y)))} ${satisfies(e, R2.x, R2.y) ? '✓' : '✗'}`))) : null);
    P.setData('subwb', st, true);
  }
  draw();
  return el('div', null, segs('System', SUB_SYSTEMS.map(s => ({ label: s.name, value: s.id })), st.sys, v => { st = { ...st, sys: v, step: 1, v: 'x', from: 1 }; draw(); }), head, box);
}

// ------------------------------------------------------------ the workshop: invoices and inventory (Stage 3)
export function invoices(ctx) {
  const P = ctx.progress, x = P.done('ws-x'), y = P.done('ws-y');
  const card = (name, inv) => el('div', { class: 'upl-invoice' }, el('p', { class: 'upl-inv-h' }, name), el('table', { class: 'upl-inv-t' }, el('tbody', null,
    el('tr', null, el('td', null, `Tubeless service kit × ${inv.kits}`), el('td', { class: 'ms-mono' }, x ? money(80 * inv.kits) : `${inv.kits}x`)),
    el('tr', null, el('td', null, `Brake pad pair × ${inv.pads}`), el('td', { class: 'ms-mono' }, y ? money(50 * inv.pads) : `${inv.pads}y`)),
    el('tr', { class: 'upl-inv-total' }, el('td', null, 'Total'), el('td', { class: 'ms-mono' }, money(inv.total) + (x && y ? ' ✓' : ''))))));
  return el('div', { class: 'upl-workshop' }, el('div', { class: 'upl-invoices' }, card('Invoice A', INVOICES.a), card('Invoice B', INVOICES.b)),
    el('div', { class: 'upl-shelf' }, workshopArt(), el('p', { class: 'ls-kicker' }, 'Workshop stock'), el('ul', { class: 'upl-checks' },
      el('li', { class: x ? 'is-ok' : 'is-off' }, 'Tubeless service kit: ', x ? '$80 each' : 'price unknown (x)'), el('li', { class: y ? 'is-ok' : 'is-off' }, 'Brake pad pair: ', y ? '$50 each' : 'price unknown (y)'))));
}

// ------------------------------------------------------------ the coefficient scaler (Stage 3)
const ELIM_SYSTEMS = [
  { id: 'inv', name: 'The invoices', e1: INVOICES.e1, e2: INVOICES.e2 },
  { id: 'ord', name: 'The service orders', e1: ORDERS.e1, e2: ORDERS.e2 },
  { id: 'neg', name: '−2x + 5y = 1, 2x + 3y = 7', e1: E(-2, 5, 1), e2: E(2, 3, 7) },
  { id: 'par', name: '6x − y = −20, 6x − y = −30', e1: E(6, -1, -20), e2: E(6, -1, -30) }
];
export function scaler(ctx) {
  const P = ctx.progress;
  let st = { sys: 'ord', k1: 1, k2: 1, ...(P.getData('scaler', {}) || {}) };
  const box = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  function draw() {
    const Sy = ELIM_SYSTEMS.find(s => s.id === st.sys), A = scale(Sy.e1, st.k1), B = scale(Sy.e2, st.k2), sum = addEq(A, B);
    const gone = sum.a.zero ? 'x' : sum.b.zero ? 'y' : null, both = sum.a.zero && sum.b.zero;
    const best = eliminationSteps(Sy.e1, Sy.e2, 'y') || eliminationSteps(Sy.e1, Sy.e2, 'x');
    put(box, el('div', { class: 'upl-stack' },
      el('p', { class: 'ms-live-eq' }, el('span', { class: 'upl-k' }, `× ${S(st.k1)}`), `  ${eqText(A)}`),
      el('p', { class: 'ms-live-eq' }, el('span', { class: 'upl-k' }, `× ${S(st.k2)}`), `  ${eqText(B)}`),
      el('p', { class: 'ms-live-eq upl-sum' }, el('span', { class: 'upl-k' }, 'add'), `  ${eqText(sum)}`)),
      both ? status(false, '', sum.c.zero ? 'Both variables cancel and 0 = 0: the equations are the same line, infinitely many solutions.' : `Both variables cancel and 0 = ${S(sum.c)} is never true: no solution.`)
        : gone ? status(true, `${gone} cancels! ${gone === 'x' ? 'y' : 'x'} = ${S(sum.c.div(gone === 'x' ? sum.b : sum.a))}.`, '') : status(false, '', 'Nothing cancels yet: make one variable’s coefficients opposites.'),
      st.k1 === 0 || st.k2 === 0 ? el('p', { class: 'ls-small' }, 'Multiplying by 0 wipes out the whole equation: use a nonzero multiplier.') : null,
      el('details', { class: 'ms-explain' }, el('summary', null, 'Show an efficient plan'), best ? stepList(best.steps, best.steps.length) : el('p', null, 'Try matching the coefficients.')));
    P.setData('scaler', st, true);
  }
  function controls() {
    const Sy = ELIM_SYSTEMS.find(s => s.id === st.sys);
    put(ctl, el('p', { class: 'ms-live-eq' }, `(1)  ${eqText(Sy.e1)}`), el('p', { class: 'ms-live-eq' }, `(2)  ${eqText(Sy.e2)}`),
      slider({ label: 'Multiply equation 1 by', min: -5, max: 5, step: 1, value: st.k1, onInput: v => { st.k1 = v; draw(); } }).node,
      slider({ label: 'Multiply equation 2 by', min: -5, max: 5, step: 1, value: st.k2, onInput: v => { st.k2 = v; draw(); } }).node);
  }
  controls(); draw();
  return el('div', null, segs('System', ELIM_SYSTEMS.map(s => ({ label: s.name, value: s.id })), st.sys, v => { st = { sys: v, k1: 1, k2: 1 }; controls(); draw(); }),
    el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, box), el('div', { class: 'ms-lab-panel' }, ctl, el('p', { class: 'ls-small' }, 'Every term is multiplied, on both sides.'))));
}

// ------------------------------------------------------------ the dirt mixing station (Stage 4)
export function mixStation(ctx) {
  const P = ctx.progress;
  let st = { a: 3, b: 3, pa: MIX.pa, pb: MIX.pb, total: MIX.total, target: MIX.target, ...(P.getData('mix', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), ctl = el('div');
  function draw() {
    const R = blend(st.a, st.b, st.pa, st.pb), pct = R.pct === null ? null : N(R.pct), totalOk = N(R.total) === st.total, clayOk = pct !== null && Math.abs(pct - st.target) < 1e-9;
    const fillH = Math.min(100, 100 * N(R.total) / (st.total * 1.4)), clayH = R.total.zero ? 0 : fillH * N(R.clay) / N(R.total);
    put(out, el('div', { class: 'upl-mix' },
      el('div', { class: 'upl-pile' }, el('div', { class: 'upl-pile-art is-a', style: `--clay:${st.pa}%` }), el('p', null, `Stockpile A: ${st.pa}% clay`), el('p', { class: 'ms-mono' }, `${st.a} yd³`)),
      el('div', { class: 'upl-pile' }, el('div', { class: 'upl-pile-art is-b', style: `--clay:${st.pb}%` }), el('p', null, `Stockpile B: ${st.pb}% clay`), el('p', { class: 'ms-mono' }, `${st.b} yd³`)),
      el('div', { class: 'upl-tub', role: 'img', 'aria-label': `Mixing container: ${S(R.total)} cubic yards, ${pct === null ? 'empty' : S(R.pct) + '% clay'}` },
        el('div', { class: 'upl-tub-sand', style: `height:${fillH}%` }), el('div', { class: 'upl-tub-clay', style: `height:${clayH}%` }), el('div', { class: 'upl-tub-line', style: `bottom:${100 * st.total / (st.total * 1.4)}%` }, `${st.total} yd³`))),
      tiles([['Total', `${S(R.total)} yd³`, totalOk ? 'is-best' : ''], ['Clay', `${S(R.clay)} yd³`], ['Sand', `${S(R.sand)} yd³`], ['Clay %', pct === null ? '—' : `${S(R.pct)}%`, clayOk ? 'is-best' : '']]),
      el('ul', { class: 'upl-checks' }, el('li', { class: totalOk ? 'is-ok' : 'is-off' }, `Volume: ${st.a} + ${st.b} = ${S(R.total)} ${totalOk ? '✓' : `(need ${st.total})`}`), el('li', { class: clayOk && totalOk ? 'is-ok' : 'is-off' }, `Clay: ${st.pa / 100}(${st.a}) + ${st.pb / 100}(${st.b}) = ${S(R.clay)} ${clayOk && totalOk ? '✓' : `(need ${S(F(st.total).mul(st.target).div(100))})`}`)),
      status(totalOk && clayOk, `Target blend reached: ${st.total} yd³ at ${st.target}% clay.`, !totalOk ? 'The volume equation isn’t satisfied yet.' : 'Right volume, wrong blend: the clay equation isn’t satisfied.'));
    P.setData('mix', st, true);
  }
  function controls() {
    put(ctl, slider({ label: 'From Stockpile A', min: 0, max: 12, step: 0.5, value: st.a, unit: 'yd³', onInput: v => { st.a = v; draw(); } }).node,
      slider({ label: 'From Stockpile B', min: 0, max: 12, step: 0.5, value: st.b, unit: 'yd³', onInput: v => { st.b = v; draw(); } }).node,
      el('details', { class: 'upl-edit' }, el('summary', null, 'Change the stockpiles (explore)'),
        slider({ label: 'Stockpile A clay', min: 50, max: 100, step: 5, value: st.pa, unit: '%', onInput: v => { st.pa = v; draw(); } }).node,
        slider({ label: 'Stockpile B clay', min: 0, max: 60, step: 5, value: st.pb, unit: '%', onInput: v => { st.pb = v; draw(); } }).node,
        button('Back to the 90% and 50% piles', () => { st = { ...st, pa: MIX.pa, pb: MIX.pb }; controls(); draw(); }, 'ls-btn--quiet')));
  }
  controls(); draw();
  return el('div', null, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, out), el('div', { class: 'ms-lab-panel' }, ctl)), el('p', { class: 'ls-small' }, SOIL_NOTE));
}

// ------------------------------------------------------------ the crew progress simulator (Stage 4)
export function crewSim(ctx) {
  const P = ctx.progress;
  let st = { head: CREWS.a.start, ra: CREWS.a.rate, rb: CREWS.b.rate, day: 3, ...(P.getData('crew', {}) || {}) };
  const out = el('div', { 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure' });
  const LEN = 2000;
  function draw() {
    const R = rateMeet({ start: st.head, rate: st.ra }, { start: 0, rate: st.rb }), da = st.head + st.ra * st.day, db = st.rb * st.day, days = 14;
    const ymax = Math.max(LEN, st.head + st.ra * days, st.rb * days);
    put(fig, plot({ x: [0, days], y: [0, Math.ceil(ymax / 500) * 500], xStep: 1, xDigits: 0, xLabel: 'Days t', yLabel: 'Trail built D (ft)', label: `Crew A D = ${st.head} + ${st.ra}t, Crew B D = ${st.rb}t` + (R.kind === 'one' ? `, level at ${pointText(R.t, R.D)}` : ''),
      series: [{ points: [[0, st.head], [days, st.head + st.ra * days]], cls: 'upl-a' }, { points: [[0, 0], [days, st.rb * days]], cls: 'upl-b' }], vlines: [{ x: st.day, cls: 'upl-now', label: `day ${st.day}` }],
      marks: R.kind === 'one' && N(R.t) >= 0 && N(R.t) <= days ? [{ x: N(R.t), y: N(R.D), r: 9, cls: 'upl-meet', label: `level ${pointText(R.t, R.D)}` }] : [] }).node);
    const bar = (name, d, cls) => el('div', { class: 'upl-bar ' + cls }, el('span', { class: 'upl-bar-n' }, name), el('span', { class: 'upl-bar-track' }, el('span', { class: 'upl-bar-fill', style: `width:${Math.min(100, 100 * d / LEN)}%` })), el('span', { class: 'ms-mono' }, `${d.toLocaleString('en-US')} ft`));
    put(out, bar('Crew A', da, 'is-a'), bar('Crew B', db, 'is-b'),
      tiles([['Crew A', `D = ${st.head} + ${st.ra}t`], ['Crew B', `D = ${st.rb}t`], ['Level after', R.kind === 'one' && N(R.t) >= 0 ? `${S(R.t)} days` : R.kind === 'one' ? 'never (B is behind and slower)' : R.kind === 'none' ? 'never: same rate' : 'always level', R.kind === 'one' ? 'is-meet' : ''], ['Feet then', R.kind === 'one' && N(R.t) >= 0 ? `${S(R.D)} ft` : '—']]),
      el('p', { class: 'ls-small' }, R.kind === 'one' && N(R.t) > 0 ? `Crew B gains ${st.rb - st.ra} ft a day on a ${st.head} ft head start: ${st.head} ÷ ${st.rb - st.ra} = ${S(R.t)} days.` : 'Crew B only catches up if it builds faster than Crew A.'));
    P.setData('crew', st, true);
  }
  const ctl = el('div', null,
    slider({ label: 'Day', min: 0, max: 14, step: 0.5, value: st.day, unit: 'days', onInput: v => { st.day = v; draw(); } }).node,
    slider({ label: 'Crew A head start', min: 0, max: 800, step: 50, value: st.head, unit: 'ft', onInput: v => { st.head = v; draw(); } }).node,
    slider({ label: 'Crew A rate', min: 40, max: 250, step: 10, value: st.ra, unit: 'ft a day', onInput: v => { st.ra = v; draw(); } }).node,
    slider({ label: 'Crew B rate', min: 40, max: 250, step: 10, value: st.rb, unit: 'ft a day', onInput: v => { st.rb = v; draw(); } }).node);
  draw();
  return el('div', null, el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, out), el('div', { class: 'ms-lab-panel' }, ctl)), el('p', { class: 'ls-small' }, CREW_NOTE));
}

// ------------------------------------------------------------ Operations HQ (the board)
const DEPT_ROWS = {
  uplift: got => [['Plan A', 'C = 8r + 12'], ['Plan B', 'C = 4r + 36'], ['Break-even', got ? '6 rides, $60' : null]],
  fleet: got => [['Fleet size', '18 bikes'], ['Trail bikes', got ? '12 at $60' : null], ['Downhill bikes', got ? '6 at $90' : null], ['Daily revenue', got ? '$1,260' : null]],
  workshop: got => [['Invoices', 'A $310, B $470'], ['Tubeless kit', got ? '$80' : null], ['Brake pad pair', got ? '$50' : null]],
  trails: got => [['Surface mix', got ? '5 yd³ A + 5 yd³ B at 70% clay' : null], ['Crew B catches A', got ? 'day 7.5, at 1,200 ft' : null]]
};
function deptCard(D, got) {
  return el('article', { class: 'upl-dept' + (got ? ' is-done' : '') },
    D.photo ? el('img', { class: 'upl-dept-img', src: D.photo, alt: D.alt, loading: 'lazy', width: 600, height: 400, onerror: e => { e.target.remove(); } }) : workshopArt(true),
    el('div', { class: 'upl-dept-in' }, el('p', { class: 'upl-dept-h' }, D.name, got ? el('span', { class: 'upl-dept-ok' }, ' ✓ ready') : null),
      el('dl', { class: 'upl-dept-dl' }, DEPT_ROWS[D.id](got).map(([k, v]) => el('div', null, el('dt', null, k), el('dd', { class: v ? '' : 'is-off' }, v || 'after this stage'))))));
}
export function hq(ctx, missions) {
  const P = ctx.progress, got = earnedBadges(P, missions), D = destOf(P), certified = !!P.getData('certified', null);
  const steps = missions.length + 1, doneN = got.size + (certified ? 1 : 0);
  const picker = el('div', { class: 'upl-dests', role: 'radiogroup', 'aria-label': 'Choose your destination' }, DESTINATIONS.map(d => el('button', { type: 'button', role: 'radio', class: 'upl-dest' + (D && D.id === d.id ? ' is-on' : ''), 'aria-checked': String(!!D && D.id === d.id),
    onclick: () => { P.setData('park', { ...park(P), destination: d.id }, true); ctx.rerender(); } }, destinationArt(d.id), el('span', { class: 'upl-dest-n' }, d.name), el('span', { class: 'upl-dest-b' }, d.blurb))));
  return el('section', { class: 'upl-hq', 'aria-label': 'Operations headquarters' },
    el('p', { class: 'ls-kicker' }, 'Operations HQ'),
    D ? el('div', { class: 'upl-hq-hero' }, destinationArt(D.id, true), el('p', { class: 'upl-hq-name' }, D.name.toUpperCase())) : el('p', { class: 'ls-small' }, 'Choose where your park is. It changes the scenery, not the maths.'),
    D ? el('details', { class: 'upl-edit' }, el('summary', null, 'Change destination'), picker) : picker,
    el('div', { class: 'upl-progress' }, el('p', { class: 'ls-kicker' }, 'Opening day progress'), el('div', { class: 'upl-prog-track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': steps, 'aria-valuenow': doneN, 'aria-label': 'Opening day progress' }, el('span', { class: 'upl-prog-fill', style: `width:${100 * doneN / steps}%` })),
      el('p', { class: 'ls-small' }, doneN === steps ? 'Every department is ready and you’re certified: open the mountain in the Opening Day Command Center.' : `${got.size} of ${missions.length} departments ready${certified ? ', certified' : ''}.`)),
    el('div', { class: 'upl-depts' }, DEPARTMENTS.map(d => deptCard(d, got.has(d.mission)))),
    el('p', { class: 'ls-small' }, PRICE_NOTE));
}

// ------------------------------------------------------------ the Opening Day Command Center (extension)
export function commandCenter(ctx, missions, certified) {
  const P = ctx.progress, got = earnedBadges(P, missions), D = destOf(P);
  const approved = new Set(P.getData('approved', []) || []);
  const pick = { r: 8, ...(P.getData('ridePlan', {}) || {}) };
  const planBox = el('div', { 'aria-live': 'polite' });
  const drawPlan = () => { const a = N(cost(PLANS.a, pick.r)), b = N(cost(PLANS.b, pick.r)); put(planBox, el('p', null, `A rider planning ${pick.r} rides: Plan A ${money(a)}, Plan B ${money(b)}. `, el('b', null, a === b ? 'Either plan: they tie.' : `Recommend ${a < b ? 'Plan A, Pay As You Ride' : 'Plan B, Mountain Pass'}.`))); P.setData('ridePlan', pick, true); };
  // '60(12) + 90(6) = 1260 ✓', with coefficients of 1 written plainly: '12 + 6 = 18 ✓'
  const subst = (e, x, y) => [[e.a, x], [e.b, y]].filter(([k]) => !k.zero).map(([k, v], i) => { const neg = k.n < 0, a = neg ? k.neg() : k, t = a.eq(1) ? S(v) : `${S(a)}(${S(v)})`; return (i ? (neg ? ' − ' : ' + ') : neg ? '−' : '') + t; }).join('');
  const vline = (e, x, y, nm) => { const c = satisfies(e, x, y); return el('li', { class: c ? 'is-ok' : 'is-off' }, `${nm}: ${subst(e, x, y)} = ${S(e.a.mul(F(x)).add(e.b.mul(F(y))))} ${c ? '✓' : '✗'}`); };
  const planCheck = (pl, r) => { const c = N(cost(pl, r)); return el('li', { class: 'is-ok' }, `${pl.name}: C = ${pl.rate}r + ${pl.fee} → ${pl.rate}(${r}) + ${pl.fee} = ${c} ✓`); };
  const mx = mixture(MIX), cr = rateMeet(CREWS.a, CREWS.b);
  const depts = [
    { id: 'uplift', name: 'Uplift Operations', m: 'shuttle', body: () => [el('p', null, 'Break-even: 6 rides at $60.'), el('ul', { class: 'upl-checks' }, planCheck(PLANS.a, 6), planCheck(PLANS.b, 6)),
      slider({ label: 'Expected rides for a typical rider', min: 0, max: 12, step: 1, value: pick.r, unit: 'rides', onInput: v => { pick.r = v; drawPlan(); } }).node, planBox] },
    { id: 'fleet', name: 'Rental Fleet', m: 'fleet', body: () => [el('p', null, '12 trail bikes and 6 downhill bikes: $720 + $540 = $1,260 a day.'), el('ul', { class: 'upl-checks' }, vline(FLEET.e1, 12, 6, 'Fleet size'), vline(FLEET.e2, 12, 6, 'Revenue'))] },
    { id: 'workshop', name: 'Workshop', m: 'workshop', body: () => [el('p', null, 'Tubeless service kit $80, brake pad pair $50. Restock: 4 kits and 6 pad pairs = $620.'), el('ul', { class: 'upl-checks' }, vline(INVOICES.e1, 80, 50, 'Invoice A'), vline(INVOICES.e2, 80, 50, 'Invoice B'))] },
    { id: 'trails', name: 'Trail Construction', m: 'mountain', body: () => [el('p', null, `Surface mix: ${S(mx.x)} yd³ of A and ${S(mx.y)} yd³ of B, 70% clay. Crews level on day ${S(cr.t)} at ${S(cr.D)} ft.`), el('ul', { class: 'upl-checks' }, vline(mx.e1, mx.x, mx.y, 'Volume'), vline(mx.e2, mx.x, mx.y, 'Clay'),
      el('li', { class: 'is-ok' }, `Crews: 300 + 120(7.5) = 1200 and 160(7.5) = 1200 ✓`))] }
  ];
  const allOpen = depts.every(d => got.has(d.m) && approved.has(d.id));
  const out = el('div', { class: 'upl-cc' },
    D ? el('div', { class: 'upl-hq-hero' }, destinationArt(D.id, true), el('p', { class: 'upl-hq-name' }, D.name.toUpperCase())) : null,
    el('p', null, 'Review each department and confirm its numbers satisfy both of its original conditions. Approve a department once its stage is done.'),
    el('div', { class: 'upl-cc-grid' }, depts.map(d => {
      const ready = got.has(d.m), cid = uid('ap'), box = el('input', { type: 'checkbox', id: cid, disabled: !ready });
      box.checked = approved.has(d.id) && ready;
      box.addEventListener('change', () => { const s = new Set(P.getData('approved', []) || []); box.checked ? s.add(d.id) : s.delete(d.id); P.setData('approved', [...s]); ctx.rerender(); });
      return el('section', { class: 'upl-cc-dept' + (ready ? '' : ' is-locked') }, el('p', { class: 'upl-dept-h' }, d.name), ready ? d.body() : el('p', { class: 'ls-small' }, 'Finish this department’s stage first.'),
        el('label', { class: 'dl-check', for: cid }, box, ' Approved: both conditions check out'));
    })),
    allOpen ? el('div', { class: 'upl-open', role: 'status' }, el('p', { class: 'upl-open-h' }, 'THE MOUNTAIN IS OPEN.'),
      el('p', null, 'The shuttle fleet is ready. The rental bikes are stocked. The workshop is prepared. The trail crews have everything they need.'),
      el('p', null, 'You’ve solved the systems, balanced the operation and gotten the mountain ready for riders.'),
      certified ? el('p', { class: 'upl-cert' }, 'CERTIFIED BIKE PARK OPERATIONS DIRECTOR') : el('p', { class: 'ls-small' }, 'One more step: pass the Mountain Operations Certification.')) : null,
    el('ul', { class: 'dl-badges' }, missions.map(m => el('li', { class: got.has(m.id) ? 'is-earned' : '' }, (got.has(m.id) ? '★ ' : '☆ ') + m.badge))),
    el('p', { class: 'ls-small' }, PRICE_NOTE));
  if (got.has('shuttle')) drawPlan();
  return out;
}
export { money, N };
