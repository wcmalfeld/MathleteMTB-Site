// Bike Park Blueprint Lab interactives. Each returns an element; every
// number shown comes from logic/models.js and logic/matrix.js (exact
// fractions). Graphs have keyboard sliders as well as pointer dragging.
// Settings are kept in the lab's progress (getData / setData).

import { el, put, button } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot, dragXY } from '../../lesson-kit/plot.js';
import { Frac, mat, add, sub, scale, mul, det, inverse, identity, equal, rowOp, describeOp, analyse, satisfies, canMultiply, dims, dimText, transpose } from '../logic/matrix.js';
import { CREW_EQ, MACHINE_EQ, crewLine, machineLine, DIAGNOSE, linePoints, solve2, onLine, buildable, eqText, PARK, PARK_AUG, augmented, A as Amat, Bvec,
  GUIDED_STEPS, PLAN, INVENTORY, TOOLS, CREWS, FEATURES, RESOURCES, COST, costing, SINGULAR, classify, OPT, optimizer, feasible, PRACTICE_2, PRACTICE_3, pick } from '../logic/models.js';
import { eqText3 } from '../logic/questions.js';
import { matrixView } from './matrix-view.js';

const W2 = { x: [0, 8], y: [0, 8], xLabel: 'x: berm modules', yLabel: 'y: jump features', xStep: 1, yStep: 1, xDigits: 0 };
const snap = (v, s) => Math.round(v / s) * s, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = v => String(v);
const field = (label, value, onChange, attrs = {}) => {
  const id = 'bp-f-' + Math.random().toString(36).slice(2, 8);
  const inp = el('input', { id, type: 'text', inputmode: 'decimal', class: 'ls-input bp-small-input', value: String(value), autocomplete: 'off', ...attrs });
  inp.addEventListener('input', () => onChange(inp.value));
  return el('span', { class: 'ls-field bp-inline' }, el('label', { for: id }, label), inp);
};

// ------------------------------------------------------------ Blueprint graph (Mission 1)
export function blueprintGraph(ctx) {
  const P = ctx.progress;
  let st = P.getData('blueprint', { crew: 17, machine: 7, showCrew: true, showMachine: true, showMeet: false, x: 1, y: 1 });
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), read = el('div', { class: 'bp-read', 'aria-live': 'polite' });
  let last;
  const sx = slider({ label: 'Plan: berm modules x', min: 0, max: 8, step: 0.5, value: st.x, onInput: v => { st.x = v; draw(true); } });
  const sy = slider({ label: 'Plan: jump features y', min: 0, max: 8, step: 0.5, value: st.y, onInput: v => { st.y = v; draw(true); } });
  const sc = slider({ label: 'Crew hours available', min: 9, max: 30, step: 1, value: st.crew, unit: 'h', onInput: v => { st.crew = v; draw(true); } });
  const sm = slider({ label: 'Machine hours available', min: 3, max: 15, step: 1, value: st.machine, unit: 'h', onInput: v => { st.machine = v; draw(true); } });
  const toggle = (key, label) => { const b = button('', () => { st[key] = !st[key]; draw(false); }, 'ls-btn--quiet bp-toggle'); b.dataset.key = key; b.dataset.label = label; return b; };
  const tCrew = toggle('showCrew', 'crew-hours line'), tMach = toggle('showMachine', 'machine-hours line'), tMeet = toggle('showMeet', 'intersection');
  function draw(quiet) {
    const L1 = crewLine(st.crew), L2 = machineLine(st.machine), s = solve2(L1, L2);
    const series = [];
    if (st.showCrew) series.push({ points: linePoints(L1, W2.x, W2.y), cls: 'bp-line--crew' });
    if (st.showMachine) series.push({ points: linePoints(L2, W2.x, W2.y), cls: 'bp-line--machine' });
    const on1 = onLine(L1, st.x, st.y), on2 = onLine(L2, st.x, st.y);
    const marks = [{ x: st.x, y: st.y, cls: on1 && on2 ? 'bp-mark--hit' : 'bp-mark--plan', r: 8, label: `(${st.x}, ${st.y})` }];
    if (st.showMeet && s.type === 'one') marks.push({ x: Number(s.x), y: Number(s.y), cls: 'bp-mark--meet', r: 6 });
    last = plot({ ...W2, label: `Graph of ${eqText(L1)} and ${eqText(L2)}; your plan point at (${st.x}, ${st.y}).`, series, marks });
    put(fig, last.node);
    [tCrew, tMach, tMeet].forEach(b => { b.textContent = (st[b.dataset.key] ? 'Hide ' : 'Show ') + b.dataset.label; b.setAttribute('aria-pressed', String(!!st[b.dataset.key])); });
    const used = (L, x, y) => L.a * x + L.b * y;
    put(read,
      el('ul', { class: 'bp-legend' }, el('li', { class: 'is-crew' }, `${eqText(L1)} (crew hours)`), el('li', { class: 'is-machine' }, `${eqText(L2)} (machine hours)`)),
      el('p', { class: 'ms-live-eq' }, `Plan (${st.x}, ${st.y}) uses ${used(L1, st.x, st.y)} crew h and ${used(L2, st.x, st.y)} machine h`),
      el('p', null, on1 && on2 ? status(true, 'On both lines: this plan uses every hour exactly', '') : status(false, '', on1 ? 'On the crew line only' : on2 ? 'On the machine line only' : 'On neither line')),
      st.showMeet ? el('p', { class: 'ls-small' }, s.type === 'one' ? `Intersection: (${s.x}, ${s.y})${buildable(s) ? '' : ' – not a buildable plan (it needs whole, non-negative numbers)'}` : 'The lines don’t cross once.') : null);
    P.setData('blueprint', st, quiet);
  }
  dragXY(fig, () => last, (x, y) => { st.x = clamp(snap(x, 0.5), 0, 8); st.y = clamp(snap(y, 0.5), 0, 8); sx.set(st.x); sy.set(st.y); draw(true); });
  draw(true);
  const reset = button('Back to the zone (17 h, 7 h)', () => { st.crew = 17; st.machine = 7; sc.set(17); sm.set(7); draw(false); }, 'ls-btn--ghost');
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, read),
    el('div', { class: 'ms-lab-panel' }, el('div', { class: 'ls-actions' }, tCrew, tMach, tMeet), sx.node, sy.node,
      el('p', { class: 'ls-mini-label' }, 'Practice: change the resources'), sc.node, sm.node, reset,
      el('p', { class: 'ls-small' }, 'Drag the plan point, or use the sliders. Fictional planning numbers, not construction estimates.')));
}

// Method helper for the Mission 1 practice plan: starts the chosen method.
export function methodPanel(ctx) {
  const P = ctx.progress;
  let method = P.getData('method', 'graph');
  const box = el('div');
  const seg = segs('Method', [{ label: 'Graphing', value: 'graph' }, { label: 'Substitution', value: 'sub' }, { label: 'Elimination', value: 'elim' }], method, v => { method = v; P.setData('method', v, true); draw(); });
  function draw() {
    const s = pick(PRACTICE_2, P.getData('variant:design', 0)), { p, q } = s;
    if (method === 'graph') put(box, plot({ ...W2, label: `Graph of ${eqText(p)} and ${eqText(q)}.`, series: [{ points: linePoints(p, W2.x, W2.y), cls: 'bp-line--crew' }, { points: linePoints(q, W2.x, W2.y), cls: 'bp-line--machine' }] }).node,
      el('p', { class: 'ls-small' }, 'Read where the lines cross, then check it in both equations.'));
    else if (method === 'sub') {
      const v = q.a === 1 ? 'x' : 'y', expr = q.a === 1 ? `x = ${q.c} − ${q.b === 1 ? '' : q.b}y` : `y = ${q.c} − ${q.a}x`;
      put(box, el('ol', { class: 'ms-steps' }, el('li', null, `From ${eqText(q)}: ${expr}`), el('li', null, `Substitute for ${v} in ${eqText(p)}`), el('li', null, 'Solve for the other variable, then back-substitute')));
    } else {
      put(box, el('ol', { class: 'ms-steps' }, el('li', null, `Multiply ${eqText(q)} by ${new Frac(-p.b, q.b)} to make the y-terms opposites`), el('li', null, 'Add the equations: y cancels'), el('li', null, 'Solve for x, then substitute to find y')));
    }
  }
  draw();
  return el('div', { class: 'bp-method' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Choose your method'), seg), box);
}

// Diagnose the blueprint: the graph appears once the question is answered.
export function diagnoseGraph(ctx, i) {
  const d = DIAGNOSE[i], id = 'm1-d' + (i + 1);
  return ctx.live(() => {
    if (!ctx.progress.done(id)) return el('p', { class: 'ls-small bp-wait' }, 'Answer to see the graph.');
    const s = solve2(d.p, d.q);
    return el('div', { class: 'ms-figure bp-diag' }, plot({ ...W2, x: [0, 6], y: [0, 7], label: `Blueprint ${i + 1}: ${eqText(d.p)} and ${eqText(d.q)}.`,
      series: [{ points: linePoints(d.p, [0, 6], [0, 7]), cls: 'bp-line--crew' }, { points: linePoints(d.q, [0, 6], [0, 7]), cls: s.type === 'infinite' ? 'bp-line--same' : 'bp-line--machine' }],
      marks: s.type === 'one' ? [{ x: Number(s.x), y: Number(s.y), cls: 'bp-mark--meet', label: `(${s.x}, ${s.y})` }] : [] }).node,
      el('p', { class: 'ls-small' }, s.type === 'one' ? 'Different slopes: one crossing.' : s.type === 'none' ? 'Same slope, different lines: parallel, never meeting.' : 'The same line twice: every point is shared.'));
  });
}

// ------------------------------------------------------------ Slice the planes (Mission 2)
export function planeSlices(ctx) {
  const P = ctx.progress;
  let z = P.getData('slice', 0);
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'bp-read', 'aria-live': 'polite' });
  const sz = slider({ label: 'Slice at z (rock gardens)', min: 0, max: 3, step: 0.25, value: z, onInput: v => { z = v; draw(true); } });
  const eqs = () => Amat().map((r, i) => ({ a: Number(r[0]), b: Number(r[1]), c: PARK.available[i] - Number(r[2]) * z }));
  function draw(quiet) {
    const E = eqs(), win = { x: [0, 6], y: [0, 7] };
    const meets = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => solve2(E[i], E[j])).filter(s => s.type === 'one').map(s => [Number(s.x), Number(s.y)]);
    const all = meets.length === 3 && meets.every(m => Math.abs(m[0] - meets[0][0]) < 1e-9 && Math.abs(m[1] - meets[0][1]) < 1e-9);
    put(fig, plot({ ...W2, ...win, label: `The three planes sliced at z = ${z}.`, series: E.map((e, i) => ({ points: linePoints(e, win.x, win.y), cls: ['bp-line--crew', 'bp-line--machine', 'bp-line--soil'][i] })),
      marks: all ? [{ x: meets[0][0], y: meets[0][1], cls: 'bp-mark--meet', r: 8, label: `(${meets[0][0]}, ${meets[0][1]}, ${z})` }] : meets.map(m => ({ x: m[0], y: m[1], cls: 'bp-mark--pair', r: 4 })) }).node);
    put(read, el('ul', { class: 'bp-legend' }, ['crew', 'machine', 'soil'].map((k, i) => el('li', { class: 'is-' + k }, `${RESOURCES[i]}: ${eqText({ a: E[i].a, b: E[i].b, c: Number(E[i].c.toFixed(2)) })}`))),
      el('p', null, all ? status(true, `All three meet at one point: (${meets[0][0]}, ${meets[0][1]}, ${z}). That’s the solution.`, '') : status(false, '', `At z = ${z} the three lines don’t share a point: no plan with ${z} rock gardens uses every resource exactly.`)));
    P.setData('slice', z, quiet);
  }
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig),
    el('div', { class: 'ms-lab-panel' }, sz.node, read, el('p', { class: 'ls-small' }, 'Each equation is a plane in (x, y, z) space. Fixing z slices each plane into a line. Only at the right z do all three lines meet: the planes share exactly one point.')));
}

// ------------------------------------------------------------ Matrix elimination console (Mission 2)
const toMat = rows => rows.map(r => r.map(v => Frac.of(v)));
const serial = M => M.map(r => r.map(v => [v.n, v.d]));
const unserial = S => S.map(r => r.map(([n, d]) => new Frac(n, d)));
export function rowConsole(ctx) {
  const P = ctx.progress;
  let st = P.getData('console', null);
  const source = () => (st.src === 'park' ? { M: PARK_AUG(), sol: PLAN.map(v => Frac.of(v)), label: 'The park system' } : (() => {
    const s = pick(PRACTICE_3, P.getData('variant:park', 0)), c = classify(s.A, s.b);
    return { M: augmented(toMat(s.A), s.b), sol: c.solution || null, label: 'Practice system ' + (P.getData('variant:park', 0) + 1) };
  })());
  if (!st) st = { src: 'park', mode: 'guided', hist: [], M: null, ops: 0 };
  const start = () => { st.M = serial(source().M); st.hist = []; st.stack = []; };
  if (!st.M) start();
  const box = el('div', { class: 'bp-console-body' }), read = el('div', { class: 'bp-read', 'aria-live': 'polite' }), ctl = el('div', { class: 'bp-ops' });
  let op = { type: 'add', i: 1, j: 0, k: '-2' }, msg = null;
  const modeSeg = segs('Mode', [{ label: 'Guided', value: 'guided' }, { label: 'Independent', value: 'free' }], st.mode, v => { st.mode = v; draw(false); });
  const srcSeg = segs('System', [{ label: 'Park system', value: 'park' }, { label: 'Practice system', value: 'practice' }], st.src, v => { st.src = v; start(); msg = null; draw(false); });
  const selRow = (label, val, on) => { const id = 'bp-r-' + Math.random().toString(36).slice(2, 7); const s = el('select', { id, class: 'ls-input bp-select' }, [0, 1, 2].map(i => el('option', { value: String(i), selected: i === val ? true : null }, 'R' + (i + 1))));
    s.addEventListener('change', () => on(+s.value)); return el('span', { class: 'ls-field bp-inline' }, el('label', { for: id }, label), s); };
  function apply(o, why) {
    try {
      const k = o.type === 'swap' ? null : Frac.parse(o.k);
      if (o.type !== 'swap' && !k) { msg = ['warn', 'Type a number for the multiplier, like 3, −2 or 1/4.']; return draw(false); }
      const before = unserial(st.M), next = rowOp(before, { ...o, k });
      (st.stack = st.stack || []).push(st.M); st.M = serial(next); st.hist.push(describeOp({ ...o, k })); st.ops = (st.ops || 0) + 1;
      msg = ['ok', `${describeOp({ ...o, k })}: ${why || explainOp({ ...o, k })}`];
    } catch (e) { msg = ['warn', e.message]; }
    draw(false);
  }
  function explainOp(o) {
    if (o.type === 'swap') return 'two equations change places. Same equations, same solutions.';
    if (o.type === 'scale') return `every entry of row ${o.i + 1} is multiplied by ${o.k}. A nonzero multiple of an equation has the same solutions.`;
    return `row ${o.i + 1} gets ${o.k} times row ${o.j + 1} added to it, entry by entry. Adding equal amounts to both sides keeps the solutions.`;
  }
  function draw(quiet) {
    const M = unserial(st.M), A_ = analyse(M), src = source();
    const step = st.src === 'park' && st.mode === 'guided' ? GUIDED_STEPS[st.hist.length] : null;
    const hi = {}; if (step) { hi[step.i] = 'is-target'; if (step.j !== undefined) hi[step.j] = 'is-source'; }
    put(box, el('p', { class: 'ls-mini-label' }, src.label), matrixView(M, { aug: true, rowLabels: ['R1', 'R2', 'R3'], colLabels: ['x', 'y', 'z', '='], rowHi: hi, caption: 'Augmented matrix' }));
    const keep = src.sol && satisfies(M, src.sol);
    put(read,
      msg ? el('p', { class: msg[0] === 'ok' ? 'bp-msg' : 'bp-msg bp-msg--warn' }, msg[1]) : null,
      // The check uses the system's known solution but never prints it (it's what the questions ask).
      src.sol ? el('p', null, keep ? status(true, 'Same solution set: the system’s solution still satisfies every row', '') : status(false, '', 'Check that step: the solution no longer fits every row')) : null,
      A_.state === 'solved' ? el('p', null, status(true, 'Upper triangular: now back-substitute, starting from the last row', '')) :
        A_.state === 'contradiction' ? el('p', null, status(false, '', `Row ${A_.row + 1} says 0 = ${M[A_.row][3]}: impossible, so the system has no solution`)) :
          A_.state === 'redundant' ? el('p', null, status(false, '', `Row ${A_.row + 1} is all zeros (0 = 0): one equation was redundant, so there are infinitely many solutions`)) : null,
      st.hist.length ? el('p', { class: 'ls-small' }, 'Steps: ' + st.hist.join(' · ')) : null);
    // controls
    if (step) {
      put(ctl, el('p', { class: 'bp-guide' }, el('b', null, `Step ${st.hist.length + 1} of ${GUIDED_STEPS.length}: `, describeOp({ ...step, k: step.k !== undefined ? Frac.of(step.k) : undefined })), ' ', step.why),
        button('Do this step', () => apply({ ...step, k: step.k !== undefined ? String(step.k) : undefined }, step.why), 'ls-btn--primary'));
    } else if (st.src === 'park' && st.mode === 'guided') {
      put(ctl, el('p', { class: 'bp-guide' }, 'Guided route finished. Switch to Independent to try your own steps, or reset.'));
    } else {
      const type = segs('Row operation', [{ label: 'Swap rows', value: 'swap' }, { label: 'Multiply a row', value: 'scale' }, { label: 'Add a multiple', value: 'add' }], op.type, v => { op.type = v; draw(true); });
      put(ctl, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Operation'), type),
        el('div', { class: 'bp-opline' },
          op.type === 'swap' ? [selRow('Swap', op.i, v => { op.i = v; }), selRow('with', op.j, v => { op.j = v; })] :
            op.type === 'scale' ? [selRow('Row', op.i, v => { op.i = v; }), field('times (≠ 0)', op.k, v => { op.k = v; })] :
              [selRow('Row', op.i, v => { op.i = v; }), field('plus', op.k, v => { op.k = v; }), selRow('× row', op.j, v => { op.j = v; })]),
        button('Apply', () => apply({ ...op }), 'ls-btn--primary'));
    }
    st.rowOpsTotal = st.ops;
    P.setData('console', st, quiet);
  }
  draw(true);
  const undo = button('Undo', () => { if (!st.stack || !st.stack.length) return; st.M = st.stack.pop(); st.hist.pop(); msg = ['ok', 'Undone.']; draw(false); }, 'ls-btn--ghost');
  const reset = button('Reset', () => { start(); msg = null; draw(false); }, 'ls-btn--ghost');
  return el('div', { class: 'bp-console' },
    el('div', { class: 'bp-console-top' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'System'), srcSeg), el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Mode'), modeSeg)),
    el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, box, read), el('div', { class: 'ms-lab-panel' }, ctl, el('div', { class: 'ls-actions' }, undo, reset),
      el('p', { class: 'ls-small' }, 'Allowed: swap two rows, multiply a row by a nonzero number, add a multiple of one row to another. Each can be undone, so the solutions never change.'))));
}
// ------------------------------------------------------------ Inventory workbench (Mission 3)
export function inventoryWorkbench(ctx) {
  const P = ctx.progress;
  let st = P.getData('inventory', { op: 'read', r: 1, c: 1, k: 2 });
  const out = el('div', { class: 'bp-work' }), read = el('div', { class: 'bp-read', 'aria-live': 'polite' }), extra = el('div');
  const A = mat(INVENTORY.A), B = mat(INVENTORY.B), S = mat(INVENTORY.S), U = mat(INVENTORY.U);
  const opSeg = segs('Operation', [{ label: 'Read A', value: 'read' }, { label: 'A + B', value: 'add' }, { label: 'S − U', value: 'sub' }, { label: 'k(A + B)', value: 'scale' }], st.op, v => { st.op = v; draw(false); });
  const sk = slider({ label: 'Construction weekends k', min: 1, max: 4, step: 1, value: st.k, onInput: v => { st.k = v; draw(true); } });
  const pickCell = (r, c) => { st.r = r; st.c = c; draw(false); };
  function draw(quiet) {
    const hi = { [st.r + ',' + st.c]: 'is-picked' }, o = { rowLabels: CREWS, colLabels: TOOLS, hi, onCell: pickCell };
    const tool = TOOLS[st.c].toLowerCase(), crew = CREWS[st.r], rc = `${st.r + 1}${st.c + 1}`;
    let parts, line;
    if (st.op === 'read') { parts = [matrixView(A, { ...o, name: 'A', dims: true })]; line = `a${sub2(rc)} = ${A[st.r][st.c]}: ${crew} has ${A[st.r][st.c]} ${tool}.`; }
    else if (st.op === 'add') { const R = add(A, B); parts = [matrixView(A, { ...o, name: 'A' }), opSym('+'), matrixView(B, { ...o, name: 'B' }), opSym('='), matrixView(R, { ...o, name: 'A + B' })]; line = `${A[st.r][st.c]} + ${B[st.r][st.c]} = ${R[st.r][st.c]} ${tool} for ${crew} (the same position in each).`; }
    else if (st.op === 'sub') { const R = sub(S, U); parts = [matrixView(S, { ...o, name: 'S' }), opSym('−'), matrixView(U, { ...o, name: 'U' }), opSym('='), matrixView(R, { ...o, name: 'S − U' })]; line = `${S[st.r][st.c]} − ${U[st.r][st.c]} = ${R[st.r][st.c]} ${tool} left for ${crew}.`; }
    else { const AB = add(A, B), R = scale(st.k, AB); parts = [el('span', { class: 'bp-scalar' }, String(st.k)), matrixView(AB, { ...o, name: 'A + B' }), opSym('='), matrixView(R, { ...o, name: `${st.k}(A + B)` })]; line = `${st.k} × ${AB[st.r][st.c]} = ${R[st.r][st.c]} ${tool} for ${crew} over ${st.k} weekend${st.k > 1 ? 's' : ''}: every entry is multiplied.`; }
    put(out, ...parts);
    put(read, el('p', { class: 'ms-live-eq' }, line), el('p', { class: 'ls-small' }, 'Select any entry to see its calculation.'));
    put(extra, st.op === 'scale' ? sk.node : null);
    P.setData('inventory', st, quiet);
  }
  draw(true);
  return el('div', { class: 'bp-workbench' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Operation'), opSeg), extra, out, read);
}
const opSym = s => el('span', { class: 'bp-opsym', 'aria-hidden': 'true' }, s);
const sub2 = t => t.split('').map(ch => '₀₁₂₃₄₅₆₇₈₉'[+ch]).join('');

// ------------------------------------------------------------ Matrix cost calculator (Mission 3)
export function costCalculator(ctx) {
  const P = ctx.progress;
  let st = P.getData('cost', { q: [...PLAN], c: [...COST], needs: PARK.needs.map(r => [...r]), edit: false });
  const out = el('div', { class: 'bp-calc', 'aria-live': 'polite' }), inputs = el('div');
  function draw(quiet) {
    const clean = v => Math.max(0, Math.round(Number(v) || 0));
    const q = st.q.map(clean), c = st.c.map(v => Math.max(0, Number(v) || 0)), needs = st.needs.map(r => r.map(clean));
    let R;
    try { R = costing(q, needs, c.map(v => Math.round(v))); } catch (e) { put(out, el('p', { class: 'bp-msg bp-msg--warn' }, e.message)); return; }
    const Q = R.Q, Mm = R.M, C = R.C, QM = R.QM, MC = R.MC;
    put(out,
      el('p', { class: 'bp-dimchain' }, el('span', null, 'Q (1 × 3)'), ' · ', el('span', null, 'M (3 × 3)'), ' · ', el('span', null, 'C (3 × 1)'), ' → ', el('b', null, '1 × 1'),
        el('span', { class: 'ls-small' }, '  inner numbers match (3 = 3, 3 = 3), so each product is defined')),
      el('div', { class: 'bp-row' }, matrixView(Q, { name: 'Q', colLabels: ['Berm', 'Jump', 'Rock'] }), opSym('·'), matrixView(Mm, { name: 'M', rowLabels: ['Berm', 'Jump', 'Rock'], colLabels: ['Crew', 'Mach.', 'Soil'] }), opSym('='), matrixView(QM, { name: 'QM', colLabels: ['Crew', 'Mach.', 'Soil'] })),
      el('ol', { class: 'ms-steps bp-dots' }, QM[0].map((v, j) => el('li', null, `${RESOURCES[j]}: Q · column ${j + 1} = ${q.map((qq, k) => `${qq}×${needs[k][j]}`).join(' + ')} = `, el('b', null, String(v))))),
      el('div', { class: 'bp-row' }, matrixView(QM, { name: 'QM' }), opSym('·'), matrixView(C, { name: 'C', rowLabels: ['$/crew h', '$/mach. h', '$/load'] }), opSym('='), matrixView([[R.total]], { name: 'QMC' })),
      el('p', { class: 'ms-live-eq' }, `${QM[0].map((v, j) => `${v}×${C[j][0]}`).join(' + ')} = `, el('b', { class: 'bp-total' }, '$' + Number(R.total).toLocaleString('en-US'))),
      el('details', { class: 'ms-explain' }, el('summary', null, 'Unit costs first: MC (cost of one of each feature)'),
        el('div', { class: 'bp-row' }, matrixView(Mm, { name: 'M' }), opSym('·'), matrixView(C, { name: 'C' }), opSym('='), matrixView(MC, { name: 'MC', rowLabels: ['Berm', 'Jump', 'Rock'] })),
        el('ol', { class: 'ms-steps' }, MC.map((r, i) => el('li', null, `${FEATURES[i]}: row ${i + 1} · C = ${needs[i].map((v, j) => `${v}×${c[j]}`).join(' + ')} = $${r[0]}`))),
        el('p', { class: 'ls-small' }, `Q(MC) = ${q.map((qq, i) => `${qq}×${MC[i][0]}`).join(' + ')} = $${R.total}: the same total. (QM)C = Q(MC).`)));
    P.setData('cost', st, quiet);
  }
  function drawInputs() {
    put(inputs,
      el('p', { class: 'ls-mini-label' }, 'Feature quantities Q'), el('div', { class: 'bp-fields' }, ['Berms', 'Jumps', 'Rock gardens'].map((l, i) => field(l, st.q[i], v => { st.q[i] = v; draw(true); }, { inputmode: 'numeric' }))),
      el('p', { class: 'ls-mini-label' }, 'Unit costs C ($)'), el('div', { class: 'bp-fields' }, ['Crew hour', 'Machine hour', 'Soil load'].map((l, i) => field(l, st.c[i], v => { st.c[i] = v; draw(true); }, { inputmode: 'numeric' }))),
      button(st.edit ? 'Hide the practice resource matrix' : 'Practice: change the resource matrix M', () => { st.edit = !st.edit; drawInputs(); draw(false); }, 'ls-btn--quiet'),
      st.edit ? el('div', { class: 'bp-mgrid' }, st.needs.map((r, i) => el('div', { class: 'bp-fields' }, el('span', { class: 'ls-mini-label' }, FEATURES[i]), r.map((v, j) => field(RESOURCES[j], v, x => { st.needs[i][j] = x; draw(true); }, { inputmode: 'numeric' }))))) : null,
      button('Back to the park plan', () => { st = { q: [...PLAN], c: [...COST], needs: PARK.needs.map(r => [...r]), edit: false }; drawInputs(); draw(false); }, 'ls-btn--ghost'));
  }
  drawInputs(); draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, out), el('div', { class: 'ms-lab-panel' }, inputs,
    el('p', { class: 'ls-small' }, 'Fictional prices and quantities for the simulation. Whole numbers ≥ 0 only.')));
}

// ------------------------------------------------------------ Dimension checker (Mission 3)
export function dimensionChecker(ctx) {
  const P = ctx.progress;
  const LIB = { Q: mat([PLAN]), M: mat(PARK.needs), C: mat(COST.map(v => [v])), A: transpose(mat(PARK.needs)), I: mat(INVENTORY.A) };
  const NAMES = { Q: 'Q (plan)', M: 'M (resources)', C: 'C (costs)', A: 'A = Mᵀ', I: 'inventory' };
  let st = P.getData('dimcheck', { L: 'M', R: 'C' });
  const out = el('div', { class: 'bp-read', 'aria-live': 'polite' });
  const opts = Object.keys(LIB).map(k => ({ label: `${k} ${dimText(LIB[k])}`, value: k }));
  const segL = segs('Left matrix', opts, st.L, v => { st.L = v; draw(); }), segR = segs('Right matrix', opts, st.R, v => { st.R = v; draw(); });
  function draw() {
    const L = LIB[st.L], R = LIB[st.R], ok = canMultiply(L, R);
    const [a, b] = dims(L), [c, d] = dims(R);
    let swapNote = null;
    if (ok && canMultiply(R, L) && dims(L)[0] === dims(L)[1] && dims(R)[0] === dims(R)[1] && st.L !== st.R) swapNote = equal(mul(L, R), mul(R, L)) ? 'Here LR = RL, but that’s rare.' : `${st.L}${st.R} ≠ ${st.R}${st.L}: same sizes, different products. Order matters.`;
    put(out, el('p', { class: 'bp-dimchain' }, `${st.L} (${a} × ${b}) · ${st.R} (${c} × ${d})`),
      el('p', null, ok ? status(true, `Inner numbers ${b} and ${c} match: the product is ${a} × ${d}`, '') : status(false, '', `Inner numbers ${b} and ${c} don’t match: ${st.L}${st.R} isn’t defined`)),
      ok ? matrixView(mul(L, R), { name: st.L + st.R }) : null,
      swapNote ? el('p', { class: 'ls-small' }, swapNote) : !ok && canMultiply(R, L) ? el('p', { class: 'ls-small' }, `${st.R}${st.L} is defined (${c} × ${a}): reversing the order changes whether a product even exists.`) : null);
    P.setData('dimcheck', st, true);
  }
  draw();
  return el('div', { class: 'bp-dimcheck' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Left'), segL), el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'Right'), segR), out,
    el('p', { class: 'ls-small' }, Object.entries(NAMES).map(([k, v]) => `${k}: ${v}`).join(' · ')));
}

// ------------------------------------------------------------ Matrix equation solver (Mission 4)
export function matrixSolver(ctx) {
  const P = ctx.progress;
  let st = P.getData('solver', { sys: 'park', step: 0 });
  const out = el('div', { class: 'bp-solver', 'aria-live': 'polite' }), steps = el('div', { class: 'ls-actions' });
  const sysSeg = segs('System', [{ label: 'Park system', value: 'park' }, { label: 'Singular A, totals 1', value: 'dep' }, { label: 'Singular A, totals 2', value: 'inc' }], st.sys, v => { st.sys = v; st.step = 0; draw(false); });
  const STEPS = ['Write AX = B', 'Multiply out AX', 'Find det(A)', 'Find A⁻¹', 'X = A⁻¹B', 'Verify'];
  function draw(quiet) {
    const A = st.sys === 'park' ? Amat() : mat(SINGULAR.A), b = st.sys === 'park' ? PARK.available : st.sys === 'dep' ? SINGULAR.consistent : SINGULAR.inconsistent;
    const B = mat(b.map(v => [v])), X = [['x'], ['y'], ['z']], D = det(A), inv = D.zero ? null : inverse(A);
    const parts = [el('div', { class: 'bp-row' }, matrixView(A, { name: 'A', dims: true }), matrixView(X, { name: 'X', dims: true }), opSym('='), matrixView(B, { name: 'B', dims: true }))];
    if (st.step >= 1) parts.push(el('ol', { class: 'ms-steps' }, A.map((r, i) => el('li', null, `Row ${i + 1} × X: ${eqText3(r.map(Number), b[i])}${st.sys === 'park' ? ' (' + RESOURCES[i].toLowerCase() + ')' : ''}`))));
    if (st.step >= 2) parts.push(el('p', { class: 'ms-live-eq' }, `det(A) = ${detWork(A)} = `, el('b', null, String(D))),
      D.zero ? el('p', null, status(false, '', 'det(A) = 0: A has no inverse, so there’s no unique solution X = A⁻¹B.')) : el('p', null, status(true, 'det(A) ≠ 0: A has an inverse', '')));
    if (st.step >= 3 && inv) parts.push(el('div', { class: 'bp-row' }, matrixView(inv, { name: 'A⁻¹' })), el('p', { class: 'ls-small' }, equal(mul(inv, A), identity(3)) ? '✓ Checked: A⁻¹A = I (1s on the diagonal, 0s elsewhere).' : ''));
    if (st.step >= 3 && !inv) { const c = classify(A.map(r => r.map(Number)), b); parts.push(el('p', null, status(false, '', c.type === 'none' ? 'Elimination gives a row 0 = nonzero: these totals are inconsistent, no solution.' : 'Elimination gives a row 0 = 0: these totals are dependent, infinitely many solutions.')),
      matrixView(c.echelon, { aug: true, name: 'After elimination' })); }
    if (st.step >= 4 && inv) { const Xs = mul(inv, B); parts.push(el('ol', { class: 'ms-steps' }, Xs.map((r, i) => el('li', null, `${['x', 'y', 'z'][i]} = ${inv[i].map((v, j) => `(${v})(${b[j]})`).join(' + ')} = `, el('b', null, String(r[0]))))),
      el('div', { class: 'bp-row' }, matrixView(Xs, { name: 'X' }))); }
    if (st.step >= 5 && inv) { const Xs = mul(inv, B).map(r => r[0]); parts.push(el('ol', { class: 'ms-steps' }, A.map((r, i) => el('li', null, `${r.map((v, j) => `${v}(${Xs[j]})`).join(' + ')} = ${r.reduce((s, v, j) => s.add(v.mul(Xs[j])), Frac.of(0))} ✓ (needs ${b[i]})`)))); }
    put(out, ...parts);
    const max = inv ? STEPS.length - 1 : 3;
    put(steps, st.step < max ? button(`Next: ${STEPS[st.step + 1]}`, () => { st.step++; draw(false); }, 'ls-btn--primary') : el('span', { class: 'ls-small' }, inv ? 'Solved and verified.' : 'No inverse: elimination decides.'),
      st.step ? button('Start over', () => { st.step = 0; draw(false); }, 'ls-btn--ghost') : null);
    P.setData('solver', st, quiet);
  }
  draw(true);
  return el('div', { class: 'bp-solverbox' }, el('div', { class: 'ls-control' }, el('span', { class: 'ls-mini-label' }, 'System'), sysSeg), out, steps,
    el('p', { class: 'ls-small' }, 'Technology does the 3 × 3 arithmetic here (exact fractions), so you can focus on what each step means.'));
}
function detWork(A) {
  const [a, b, c] = A[0], m = (i, j) => { const r = A.filter((_, k) => k).map(row => row.filter((_, k) => k !== j)); return `(${r[0][0]}·${r[1][1]} − ${r[0][1]}·${r[1][0]})`; };
  return `${a}${m(0, 0)} − ${b}${m(0, 1)} + ${c}${m(0, 2)}`;
}

// ------------------------------------------------------------ Park optimizer (extension)
export function parkOptimizer(ctx) {
  const P = ctx.progress, O = optimizer();
  let st = P.getData('optimizer', { x: 3, y: 5 });
  const fig = el('div', { class: 'ms-figure ms-figure--drag' }), read = el('div', { class: 'bp-read', 'aria-live': 'polite' });
  let last;
  const sx = slider({ label: 'Berm modules x', min: 0, max: 10, step: 1, value: st.x, onInput: v => { st.x = v; draw(true); } });
  const sy = slider({ label: 'Jump features y', min: 0, max: 15, step: 1, value: st.y, onInput: v => { st.y = v; draw(true); } });
  function draw(quiet) {
    const ok = feasible(st.x, st.y), win = { x: [0, 10], y: [0, 15] };
    last = plot({ ...W2, ...win, xStep: 1, yStep: 1, label: `Feasible region of 4x + 3y ≤ 40, 2x + y ≤ 18. Plan (${st.x}, ${st.y}).`,
      polygons: [{ points: O.region, cls: 'bp-region' }],
      series: [{ points: linePoints(OPT.crew, win.x, win.y), cls: 'bp-line--crew' }, { points: linePoints(OPT.machine, win.x, win.y), cls: 'bp-line--machine' }],
      marks: [...O.points.map(([x, y]) => ({ x, y, r: 2.5, cls: 'bp-mark--dot' })), { x: st.x, y: st.y, r: 8, cls: ok ? 'bp-mark--hit' : 'bp-mark--bad', label: `P = ${st.x + st.y}` }] });
    put(fig, last.node);
    put(read, el('p', { class: 'ms-live-eq' }, `Crew: 4(${st.x}) + 3(${st.y}) = ${4 * st.x + 3 * st.y} ${4 * st.x + 3 * st.y <= 40 ? '≤' : '>'} 40   ·   Machine: 2(${st.x}) + ${st.y} = ${2 * st.x + st.y} ${2 * st.x + st.y <= 18 ? '≤' : '>'} 18`),
      el('p', null, ok ? status(true, `Feasible: ${st.x} berms + ${st.y} jumps, P = x + y = ${st.x + st.y}`, '') : status(false, '', 'Over a limit: not a feasible plan')));
    P.setData('optimizer', st, quiet);
  }
  dragXY(fig, () => last, (x, y) => { st.x = clamp(Math.round(x), 0, 10); st.y = clamp(Math.round(y), 0, 15); sx.set(st.x); sy.set(st.y); draw(true); });
  draw(true);
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, sx.node, sy.node, read,
    el('p', { class: 'ls-small' }, 'Green region: every plan that fits both limits. Dots: the whole-number plans you could actually build.')));
}
