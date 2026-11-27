// The Dream Line Goes Pro: interactives. Every number is computed by the
// kit's engines (lesson-kit/equation.js, expr.js, frac.js). Controls are
// keyboard-operable buttons, sliders and radio groups (no drag needed); tool
// settings are kept in the lab's progress (getData / setData).
//
// Graded here (like the Unit 1 calculation board): equationSolver (choose
// each move on both sides) and numberLine (build the graph). A wrong choice
// is recorded as an attempt with its misconception code; finishing records
// the right answer; the solution can be shown after two misses or every hint.

import { el, svg, put, button, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { plot } from '../../lesson-kit/plot.js';
import { start, moves, apply, finished, stateText, solve, setText, sameSet, contains, parseRelation, showNumber as S } from '../../lesson-kit/equation.js';
import { evaluate } from '../../lesson-kit/expr.js';
import { Frac } from '../../lesson-kit/frac.js';
import { tutorOf } from '../../dream-line-project/components/labs.js';
import { FORMULAS, ISOLATED, SAMPLE } from '../logic/formulas.js';
import { DESIGNS } from '../logic/questions.js';
import { APPROVAL, CONSTRAINTS, passes, SAG_NOTE, GRADE_NOTE } from '../logic/project.js';
import { balanceSvg, shockSvg } from './visuals.js';

const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rotate = (list, k) => list.slice(k % list.length).concat(list.slice(0, k % list.length));
const F = x => Frac.of(x), num = x => Number(F(x));

// ------------------------------------------------------------ the equation balance / multi-step solver
export function equationSolver(ctx, id, Q, o = {}) {
  const P = ctx.progress, key = o.key || null, opts = { keepCase: !!Q.keepCase };
  const fresh = () => start(Q.eq, null, opts);
  let st = fresh(), log = [], misses = 0, practice = P.done(id, key), tilt = 0;
  const eqBox = el('div', { class: 'gp-eq-now', 'aria-live': 'polite' }), appliedBox = el('p', { class: 'gp-applied' });
  const visBox = el('div', { class: 'gp-balance-box' }), choices = el('div', { class: 'gp-moves', role: 'group', 'aria-label': 'Choose the next move' });
  const logList = el('ol', { class: 'gp-steps', 'aria-label': 'Steps so far' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' });
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const isIneq = () => st.rels.some(r => r !== '=');
  const checkLine = () => {
    const s = solve(parseRelation(Q.eq, opts), st.v);
    if (s.kind !== 'one') return null;
    const R = parseRelation(Q.eq, opts), vals = { [st.v]: s.value };
    return `Check in the original: ${R.parts.map(p => S(evaluate(p, vals))).join(' ' + R.rels[0] + ' ')} ✓`;
  };
  function choose(m, right) {
    if (finished(st).done) return;
    if (right) {
      const flip = m.flip;
      st = apply(st, m); log.push({ label: m.label, applied: st.applied, result: stateText(st) }); tilt = 0;
      if (finished(st).done) return finish();
      say('right', flip ? `Exactly: ${m.label.toLowerCase()}. Dividing by a negative reverses the inequality.` : `Exactly. ${m.label}, so the ${isIneq() ? 'inequality stays true' : 'equation stays balanced'}.`);
    } else {
      misses += 1; tilt = m.tilt ? (m.label.includes('right') ? 1 : -1) : 0;
      if (!practice) { P.attempt(id, key, `Chose “${m.label}” at ${stateText(st)}`, false, { code: m.code, prompt: Q.prompt, correctAnswer: setText(Q.set) }); ctx.refresh(); }
      say('wrong', m.why || 'Not quite.', rec().hints < Q.hints.length && tutorOf(P).hints ? 'Have another go, or take a hint.' : 'Have another go.');
      if (tilt && !reducedMotion()) setTimeout(() => { tilt = 0; drawVis(); }, 1600);
    }
    draw();
  }
  function finish(revealed) {
    const f = finished(st);
    if (!practice && !revealed) { P.attempt(id, key, log.map(l => l.result).join(' → '), true, { code: 'correct', prompt: Q.prompt, correctAnswer: setText(Q.set) }); ctx.refresh(); }
    const res = f.vanished ? `The variable is gone: ${stateText(st)}. ${f.set.kind === 'none' ? 'That’s never true.' : 'That’s always true.'}` : `Solved: ${stateText(st)}${Q.unit ? ' ' + Q.unit : ''}.`;
    say(revealed ? 'info' : 'right', revealed ? 'Here’s every move, in order.' : (misses === 0 && !rec().hints && !practice ? 'Every move right first time. ' : ''), res, f.vanished ? null : checkLine());
    practice = true; draw();
  }
  function reveal() { P.reveal(id, key); ctx.refresh(); st = fresh(); log = []; let g = 0; for (;;) { const m = moves(st).next; if (!m || g++ > 20) break; st = apply(st, m); log.push({ label: m.label, applied: st.applied, result: stateText(st) }); } finish(true); }
  function drawVis() { if (Q.visual === 'balance' && st.parts.length === 2) put(visBox, balanceSvg(st.texts[0], st.texts[1], tilt, st.rels[0])); else put(visBox); }
  function draw() {
    put(eqBox, el('span', null, stateText(st)));
    appliedBox.textContent = st.applied ? st.applied : '';
    drawVis();
    const done = finished(st).done, M = moves(st), T = tutorOf(P), hs = T.hints ? Q.hints : [], r = rec();
    put(choices, done || !M.next ? null : rotate([[M.next, true], ...M.wrong.map(w => [w, false])], hash(id) + log.length).map(([m, ok]) => el('button', { type: 'button', class: 'gp-move', onclick: () => choose(m, ok) }, m.label)));
    put(logList, log.map(l => el('li', null, el('span', { class: 'gp-step-op' }, l.label), l.applied ? el('span', { class: 'gp-step-applied' }, l.applied) : null, el('span', { class: 'gp-step-res' }, l.result))));
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    put(actions,
      !done && hs.length && r.hints < hs.length && !practice ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id, key); draw(); }, 'ls-btn--quiet') : null,
      !done && !practice && !r.correct && !r.revealed && (T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length)) ? button('Show the solution', reveal, 'ls-btn--quiet') : null,
      done || log.length ? button(done ? 'Replay (practice, not recorded)' : 'Start over', () => { st = fresh(); log = []; misses = 0; practice = practice || P.done(id, key); tilt = 0; say('info', practice ? 'Practice run: not recorded.' : 'Back to the original equation.'); draw(); }, 'ls-btn--quiet') : null);
  }
  if (practice) { let g = 0; for (;;) { const m = moves(st).next; if (!m || g++ > 20) break; st = apply(st, m); log.push({ label: m.label, applied: st.applied, result: stateText(st) }); } say(rec().correct ? 'right' : 'info', rec().correct ? `You’ve solved this one: ${stateText(st)}.` : 'You looked at the solution for this one.'); }
  draw();
  return el('div', { class: 'ls-card ms-ask gp-solver', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || (Q.visual === 'balance' ? 'Equation balance' : 'Solver') + ' · ' + Q.level),
    el('p', { class: 'ls-prompt' }, Q.prompt), eqBox, appliedBox, visBox, choices, logList, actions, hintsEl, fb);
}

// ------------------------------------------------------------ the Number Line Studio (graded)
function setOf(g, v) {
  if (g.shape === 'ray') return { kind: 'ray', v, at: F(g.a), dir: g.dir, closed: g.aIn };
  if (g.shape === 'interval') { const [lo, hi, li, hiIn] = g.a <= g.b ? [g.a, g.b, g.aIn, g.bIn] : [g.b, g.a, g.bIn, g.aIn]; return { kind: 'interval', v, lo: F(lo), hi: F(hi), loIn: li, hiIn }; }
  const [lo, hi, li, hiIn] = g.a <= g.b ? [g.a, g.b, g.aIn, g.bIn] : [g.b, g.a, g.bIn, g.aIn];
  return { kind: 'or', v, left: { kind: 'ray', v, at: F(lo), dir: 'left', closed: li }, right: { kind: 'ray', v, at: F(hi), dir: 'right', closed: hiIn } };
}
const shapeOf = s => (s.kind === 'ray' ? 'ray' : s.kind === 'interval' ? 'interval' : 'or');
export function numberLineSvg(set, range, label) {
  const [lo, hi] = range, W = 640, X = x => 30 + (num(x) - lo) / (hi - lo) * (W - 60), y = 46;
  const s = svg('svg', { class: 'gp-nl', viewBox: `0 0 ${W} 90`, role: 'img', 'aria-label': label || (set ? 'Number line showing ' + setText(set) : 'Empty number line') });
  s.appendChild(svg('path', { class: 'gp-nl-axis', d: `M14 ${y} H${W - 14} M22 ${y - 6} L14 ${y} L22 ${y + 6} M${W - 22} ${y - 6} L${W - 14} ${y} L${W - 22} ${y + 6}` }));
  const step = hi - lo > 16 ? 2 : 1;
  for (let v = lo; v <= hi; v += 1) { s.appendChild(svg('path', { class: 'gp-nl-tick', d: `M${X(v)} ${y - 6} V${y + 6}` })); if ((v - lo) % step === 0) s.appendChild(svg('text', { class: 'gp-nl-num', x: X(v), y: y + 26, 'text-anchor': 'middle' }, v < 0 ? '−' + -v : String(v))); }
  const shade = (a, b, arrowL, arrowR) => {
    s.appendChild(svg('path', { class: 'gp-nl-shade', d: `M${a} ${y} H${b}` }));
    if (arrowL) s.appendChild(svg('path', { class: 'gp-nl-arrow', d: `M${a + 12} ${y - 9} L${a} ${y} L${a + 12} ${y + 9}` }));
    if (arrowR) s.appendChild(svg('path', { class: 'gp-nl-arrow', d: `M${b - 12} ${y - 9} L${b} ${y} L${b - 12} ${y + 9}` }));
  };
  const dot = (x, closed) => s.appendChild(svg('circle', { class: 'gp-nl-dot' + (closed ? ' is-closed' : ''), cx: X(x), cy: y, r: 8 }));
  if (set) {
    if (set.kind === 'ray') { set.dir === 'left' ? shade(18, X(set.at), true, false) : shade(X(set.at), W - 18, false, true); dot(set.at, set.closed); }
    else if (set.kind === 'interval') { shade(X(set.lo), X(set.hi)); dot(set.lo, set.loIn); dot(set.hi, set.hiIn); }
    else if (set.kind === 'or') { shade(18, X(set.left.at), true, false); shade(X(set.right.at), W - 18, false, true); dot(set.left.at, set.left.closed); dot(set.right.at, set.right.closed); }
  }
  return s;
}
export function numberLine(ctx, id, Q, o = {}) {
  const P = ctx.progress, key = o.key || null, [lo, hi] = Q.range, v = Q.target.v || 'x';
  const dk = 'nl:' + id + (key ? '|' + key : '');
  const mid = Math.round((lo + hi) / 2);
  let g = P.getData(dk, { shape: 'ray', a: mid, b: Math.min(hi, mid + 3), aIn: true, bIn: true, dir: 'right' }), misses = 0;
  const fig = el('div', { class: 'ms-figure' }), ctl = el('div', { class: 'gp-nl-ctl' }), read = el('p', { class: 'ms-live-eq', 'aria-live': 'polite' });
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' });
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const locked = () => P.done(id, key);
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  function controls() {
    if (locked()) return put(ctl);
    const end = (k, label) => {
      const sl = slider({ label, min: lo, max: hi, step: 1, value: g[k], onInput: x => { g[k] = x; drawFig(); }, format: x => (x < 0 ? '−' + -x : String(x)) });
      return el('div', null, sl.node, segs(label + ': endpoint', [{ label: '● closed (included)', value: true }, { label: '○ open (not included)', value: false }], g[k + 'In'], x => { g[k + 'In'] = x; drawFig(); }));
    };
    put(ctl, segs('Graph shape', [{ label: 'One ray', value: 'ray' }, { label: 'Interval (and)', value: 'interval' }, { label: 'Two rays (or)', value: 'or' }], g.shape, x => { g.shape = x; controls(); drawFig(); }),
      g.shape === 'ray' ? [end('a', 'Endpoint'), segs('Direction', [{ label: '← smaller values', value: 'left' }, { label: 'larger values →', value: 'right' }], g.dir, x => { g.dir = x; drawFig(); })]
        : [end('a', g.shape === 'or' ? 'Left ray ends at' : 'Lower endpoint'), end('b', g.shape === 'or' ? 'Right ray starts at' : 'Upper endpoint')]);
  }
  function drawFig() {
    const s = locked() && rec().revealed ? Q.target : setOf(g, v);
    put(fig, numberLineSvg(s, Q.range)); read.textContent = 'Your graph: ' + setText(s);
    P.setData(dk, g, true);
  }
  function check() {
    const mine = setOf(g, v), T = Q.target;
    if (sameSet(mine, T)) { P.attempt(id, key, setText(mine), true, { code: 'correct', prompt: Q.prompt, correctAnswer: setText(T) }); say('right', misses || rec().hints ? 'Right.' : 'Right, first try.', Q.solution); ctx.refresh(); draw(); return; }
    let code = 'wrong', msg = 'Not quite. Check the boundary, the circles and the direction.';
    if (shapeOf(mine) !== shapeOf(T)) { code = T.kind === 'or' || mine.kind === 'or' ? 'or-and' : 'direction'; msg = T.kind === 'or' ? 'An OR inequality needs two separate regions: either condition is enough.' : mine.kind === 'or' ? 'This one needs both conditions at once (AND) or a single ray, not two separate regions.' : T.kind === 'interval' ? 'Two boundaries means a bounded interval between them.' : 'One boundary means one ray.'; }
    else if (T.kind === 'ray') { code = !mine.at.eq(T.at) ? 'endpoint' : mine.dir !== T.dir ? 'direction' : 'open-closed'; msg = code === 'endpoint' ? 'Check the boundary value.' : code === 'direction' ? 'Right boundary, wrong direction. Test a value: is it a solution?' : 'Use a closed circle when the endpoint is included (≤, ≥) and an open circle when it isn’t (<, >).'; }
    else { const [a, b] = T.kind === 'interval' ? [[T.lo, T.loIn], [T.hi, T.hiIn]] : [[T.left.at, T.left.closed], [T.right.at, T.right.closed]], [c, d] = mine.kind === 'interval' ? [[mine.lo, mine.loIn], [mine.hi, mine.hiIn]] : [[mine.left.at, mine.left.closed], [mine.right.at, mine.right.closed]];
      code = !a[0].eq(c[0]) || !b[0].eq(d[0]) ? 'endpoint' : 'open-closed'; msg = code === 'endpoint' ? 'Check both boundary values.' : 'Right boundaries. Check which endpoints are included: closed for ≤ and ≥, open for < and >.'; }
    misses += 1; P.attempt(id, key, setText(mine), false, { code, prompt: Q.prompt, correctAnswer: setText(T) }); ctx.refresh();
    say('wrong', msg, 'Adjust the graph and check again.'); draw();
  }
  function reveal() { P.reveal(id, key); ctx.refresh(); say('info', 'Here’s the graph.', Q.solution); draw(); }
  function draw() {
    controls(); drawFig();
    const r = rec(), T = tutorOf(P), hs = T.hints ? Q.hints : [], done = locked();
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    put(actions, done ? null : [button('Check my graph', check, 'ls-btn--primary'),
      hs.length && r.hints < hs.length ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id, key); draw(); }, 'ls-btn--quiet') : null,
      T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length) ? button('Show the solution', reveal, 'ls-btn--quiet') : null]);
  }
  if (locked()) say(rec().correct ? 'right' : 'info', rec().correct ? 'You’ve graphed this one.' : 'You looked at the solution for this one.', Q.solution);
  if (locked() && rec().correct) { const T = Q.target; g = T.kind === 'ray' ? { shape: 'ray', a: num(T.at), aIn: T.closed, dir: T.dir, b: 0, bIn: true } : T.kind === 'interval' ? { shape: 'interval', a: num(T.lo), b: num(T.hi), aIn: T.loIn, bIn: T.hiIn } : { shape: 'or', a: num(T.left.at), b: num(T.right.at), aIn: T.left.closed, bIn: T.right.closed }; }
  draw();
  return el('div', { class: 'ls-card ms-ask gp-nlq', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || 'Number Line Studio · ' + Q.level), el('p', { class: 'ls-prompt' }, Q.prompt), fig, read, ctl, actions, hintsEl, fb);
}

// ------------------------------------------------------------ Stage 1: substitution checker
export function substitutionChecker(ctx) {
  const P = ctx.progress;
  let t = P.getData('subcheck', 12);
  const vis = el('div', { class: 'gp-balance-box' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'Try a value for t', min: 0, max: 20, step: 1, value: t, onInput: x => { t = x; draw(); } });
  function draw() { const L = 3 * t, ok = L === 42; put(vis, balanceSvg(`3(${t}) = ${L}`, '42', ok ? 0 : L < 42 ? 1 : -1, '=')); put(read, el('p', { class: 'ms-live-eq' }, `3(${t}) = ${L}  ${ok ? '=' : '≠'}  42`), status(ok, `t = ${t} satisfies 3t = 42: the sides balance.`, `t = ${t} doesn’t work: ${L} ${L < 42 ? '<' : '>'} 42.`)); P.setData('subcheck', t, true); }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' }, sl.node, read));
}

// ------------------------------------------------------------ Stage 2: budget tracker and feature packages
export function budgetTracker(ctx, o = {}) {
  const P = ctx.progress, key = o.key || 'budget', B = o.budget || 105, fixed = o.fixed || 45, rate = o.rate || 12, what = o.what || 'rental hours';
  let h = P.getData(key, 2);
  const bar = el('div', { class: 'gp-budget' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const sl = slider({ label: o.label || 'Rental hours h', min: 0, max: o.max || 8, step: 1, value: h, onInput: x => { h = x; draw(); } });
  function draw() {
    const cost = fixed + rate * h, over = cost > B, W = x => (100 * Math.min(x, Math.max(B, cost)) / Math.max(B, cost)).toFixed(1) + '%';
    put(bar, el('div', { class: 'gp-budget-track' + (over ? ' is-over' : '') },
      el('span', { class: 'gp-budget-fixed', style: { width: W(fixed) } }, 'fixed ' + fixed), el('span', { class: 'gp-budget-var', style: { width: W(rate * h) } }, h ? rate + ' × ' + h : ''),
      !over && B - cost > 0 ? el('span', { class: 'gp-budget-left', style: { width: W(B - cost) } }, 'left ' + (B - cost)) : null),
      el('p', { class: 'ls-small' }, `${o.limitWord || 'Budget'}: ${B} ${o.unit || 'dollars'}`));
    put(read, el('p', { class: 'ms-live-eq' }, `${fixed} + ${rate}(${h}) = ${cost} ${over ? '>' : cost === B ? '=' : '<'} ${B}`),
      status(!over, cost === B ? `Exactly on budget with ${h} ${what}.` : `Within budget: ${B - cost} left.`, `Over budget by ${cost - B}: this plan isn’t valid. ${what[0].toUpperCase() + what.slice(1)} would have to come down.`));
    P.setData(key, h, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, bar), el('div', { class: 'ms-lab-panel' }, sl.node, read));
}
export function packageVisual(ctx) {
  const P = ctx.progress;
  let st = P.getData('packs', { x: 1, split: false });
  const vis = el('div', { class: 'gp-packs' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'Standard markers per package x', min: 0, max: 6, step: 1, value: st.x, onInput: v => { st.x = v; draw(); } });
  const pack = (n, fixedN, cls) => el('div', { class: 'gp-pack ' + cls }, el('span', { class: 'gp-pack-x' + (st.split ? ' is-split' : '') }, 'x = ' + st.x), Array.from({ length: fixedN }, () => el('span', { class: 'gp-pack-fixed' + (st.split ? ' is-split' : '') })));
  function draw() {
    const x = st.x, total = 3 * (x + 4) + 2 * (x + 1);
    put(vis, el('div', { class: 'gp-pack-row' }, el('p', { class: 'gp-pack-h' }, '3 jump zones: x + 4 each'), [0, 1, 2].map(() => pack(x, 4, 'is-jump'))),
      el('div', { class: 'gp-pack-row' }, el('p', { class: 'gp-pack-h' }, '2 service zones: x + 1 each'), [0, 1].map(() => pack(x, 1, 'is-service'))));
    put(read, st.split ? el('p', { class: 'ms-live-eq' }, `3x + 12 + 2x + 2 = 5x + 14 = ${total}`) : el('p', { class: 'ms-live-eq' }, `3(${x} + 4) + 2(${x} + 1) = ${total}`),
      status(total === 29, 'x = 3 uses exactly the 29-unit inventory.', total < 29 ? `${29 - total} units unused.` : `${total - 29} units more than the inventory.`),
      el('p', { class: 'ls-small' }, st.split ? 'Distributed: every package contributes its x (gold) and its setup markers (blue) separately.' : 'Each package is a bracket: the 3 multiplies both the x and the 4.'));
    P.setData('packs', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' }, sl.node,
    segs('View', [{ label: 'Packages', value: false }, { label: 'Distributed', value: true }], st.split, v => { st.split = v; draw(); }), read));
}

// ------------------------------------------------------------ Stage 3: the Design Showdown graph
export function designShowdown(ctx, preset) {
  const P = ctx.progress, D = DESIGNS[preset];
  let f = P.getData('show:' + preset, 2);
  const fig = el('div', { class: 'ms-figure' }), cards = el('div', { class: 'gp-cards' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const cost = (d, x) => d.fixed + d.rate * x;
  const sl = slider({ label: 'Number of features f', min: 0, max: 12, step: 1, value: f, onInput: v => { f = v; draw(); } });
  const sol = solve(`${D.a.text} = ${D.b.text}`);
  function draw() {
    const a = cost(D.a, f), b = cost(D.b, f), maxY = Math.max(cost(D.a, 12), cost(D.b, 12)) + 10;
    const marks = [{ x: f, y: a, cls: 'gp-mark-a' }, { x: f, y: b, cls: 'gp-mark-b' }];
    if (sol.kind === 'one') marks.push({ x: num(sol.value), y: cost(D.a, num(sol.value)), cls: 'gp-mark-x', r: 9, label: `equal at f = ${S(sol.value)}` });
    const p = plot({ x: [0, 12], y: [0, Math.ceil(maxY / 10) * 10], xStep: 1, yStep: 10, xDigits: 0, xLabel: 'Number of features f', yLabel: 'Estimated cost (credits)', label: `${D.a.name}: ${D.a.text}; ${D.b.name}: ${D.b.text}. At f = ${f}: ${a} and ${b}. ${sol.kind === 'one' ? 'The lines cross at f = ' + S(sol.value) : sol.kind === 'none' ? 'The lines are parallel.' : 'The lines are the same line.'}`,
      series: [{ points: [[0, cost(D.a, 0)], [12, cost(D.a, 12)]], cls: 'gp-line-a' }, { points: [[0, cost(D.b, 0)], [12, cost(D.b, 12)]], cls: 'gp-line-b' + (sol.kind === 'all' ? ' is-same' : '') }], vlines: [{ x: f, cls: 'gp-vline' }], marks });
    put(fig, p.node);
    const card = (d, v, cls) => el('div', { class: 'gp-card ' + cls }, el('p', { class: 'gp-card-h' }, d.name), el('p', { class: 'ms-mono' }, d.text), el('p', { class: 'gp-card-v' }, `${v} credits`));
    put(cards, card(D.a, a, 'is-a'), card(D.b, b, 'is-b'));
    put(read, el('p', { class: 'ms-live-eq' }, a === b ? `At f = ${f} both cost ${a}.` : `At f = ${f}: ${D.a.name} ${a > b ? 'costs ' + (a - b) + ' more' : 'costs ' + (b - a) + ' less'}.`), el('p', { class: 'ls-small' }, D.note));
    P.setData('show:' + preset, f, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, cards, sl.node, read));
}

// ------------------------------------------------------------ Stage 4: formula tools
export function trailTimeTool(ctx) {
  const P = ctx.progress, U = { d: 'km', r: 'km/h', t: 'h' };
  let st = P.getData('dtr', { solve: 't', d: 4.8, r: 16, t: 0.3 });
  const knobs = el('div'), fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const RANGE = { d: [0.5, 20, 0.1], r: [4, 40, 0.5], t: [0.05, 2, 0.05] };
  function value() { const d = F(st.d), r = F(st.r), t = F(st.t); return st.solve === 'd' ? r.mul(t) : st.solve === 'r' ? d.div(t) : d.div(r); }
  function draw() {
    const v = value(), vals = { ...st, [st.solve]: Number(v) };
    put(knobs, ['d', 'r', 't'].filter(k => k !== st.solve).map(k => slider({ label: { d: 'Distance d', r: 'Average speed r', t: 'Time t' }[k], min: RANGE[k][0], max: RANGE[k][1], step: RANGE[k][2], value: st[k], unit: U[k], onInput: x => { st[k] = x; redraw(); } }).node));
    redraw();
  }
  function redraw() {
    const v = value(), d = st.solve === 'd' ? Number(v) : st.d, W = 600, len = Math.max(20, W * d / 20);
    const s = svg('svg', { viewBox: '0 0 640 90', role: 'img', 'aria-label': `A ${S(d)} km trail section` });
    s.appendChild(svg('path', { class: 'gp-trail', d: `M20 50 H${20 + len}` }));
    for (let k = 0; k <= Math.floor(d); k++) s.appendChild(svg('path', { class: 'gp-trail-tick', d: `M${20 + W * k / 20} 42 V58` }));
    s.appendChild(svg('text', { class: 'ms-svg-label', x: 20, y: 28 }, `${S(d)} km`));
    s.appendChild(svg('circle', { class: 'gp-rider', cx: 20 + len, cy: 50, r: 7 }));
    put(fig, s);
    const form = FORMULAS.speed.forms[st.solve], sub = st.solve === 'd' ? `${S(st.r)} × ${S(st.t)}` : st.solve === 'r' ? `${S(st.d)} ÷ ${S(st.t)}` : `${S(st.d)} ÷ ${S(st.r)}`;
    put(read, el('p', { class: 'ms-live-eq' }, `${form}:  ${st.solve} = ${sub} = `, el('b', null, `${S(v)} ${U[st.solve]}`)), st.solve === 't' ? el('p', { class: 'ls-small' }, `${S(v)} h × 60 = ${S(F(v).mul(60))} minutes`) : null);
    P.setData('dtr', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, read), el('div', { class: 'ms-lab-panel' },
    segs('Solve for', [{ label: 'distance d', value: 'd' }, { label: 'speed r', value: 'r' }, { label: 'time t', value: 't' }], st.solve, v => { st.solve = v; draw(); }), knobs));
}
export function gradeProfile(ctx, o = {}) {
  const P = ctx.progress, key = o.limit ? 'gradeLimit' : 'grade';
  let st = P.getData(key, o.limit ? { solve: 'G', R: 18, L: 300, G: 6 } : { solve: 'G', R: 18, L: 300, G: 6 });
  const knobs = el('div'), fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const RANGE = { R: [0, 60, 1, 'ft', 'Vertical rise R'], L: [50, 600, 10, 'ft', 'Horizontal run L'], G: [1, 20, 0.5, '%', 'Grade G'] };
  const val = () => (st.solve === 'G' ? F(st.R).mul(100).div(st.L) : st.solve === 'R' ? F(st.G).mul(st.L).div(100) : F(st.R).mul(100).div(st.G));
  function draw() {
    const keys = o.limit ? ['R'] : ['R', 'L', 'G'].filter(k => k !== st.solve);
    put(knobs, keys.map(k => slider({ label: RANGE[k][4], min: RANGE[k][0], max: RANGE[k][1], step: RANGE[k][2], value: st[k], unit: RANGE[k][3], onInput: x => { st[k] = x; redraw(); } }).node));
    redraw();
  }
  function redraw() {
    const v = val(), vals = { R: st.R, L: st.L, G: st.G, [st.solve]: Number(v) }, R = vals.R, L = vals.L, G = 100 * R / L;
    const sx = 560 / 600, sy = 4 * sx, x0 = 40, y0 = 200, x1 = x0 + L * sx, y1 = y0 - R * sy, along = Math.sqrt(R * R + L * L);
    const over = o.limit && G > o.limit + 1e-9;
    const s = svg('svg', { viewBox: '0 0 640 230', role: 'img', 'aria-label': `Trail profile: rise ${S(R)} ft over a ${S(L)} ft horizontal run, ${S(F(R).mul(100).div(L))}% grade` });
    s.appendChild(svg('path', { class: 'gp-prof-ground', d: `M${x0} ${y0} L${x1} ${y1} V${y0} Z` }));
    s.appendChild(svg('path', { class: 'gp-prof-trail' + (over ? ' is-over' : ''), d: `M${x0} ${y0} L${x1} ${y1}` }));
    s.appendChild(svg('path', { class: 'gp-prof-run', d: `M${x0} ${y0 + 8} H${x1}` }));
    s.appendChild(svg('path', { class: 'gp-prof-rise', d: `M${x1 + 8} ${y0} V${y1}` }));
    s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: (x0 + x1) / 2, y: y0 + 24 }, `horizontal run L = ${S(L)} ft`));
    s.appendChild(svg('text', { class: 'ms-svg-small', x: Math.min(x1 + 14, 560), y: (y0 + y1) / 2 }, `rise R = ${S(R)} ft`));
    s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: (x0 + x1) / 2 - 10, y: (y0 + y1) / 2 - 14 }, `along the trail ≈ ${along.toFixed(1)} ft`));
    s.appendChild(svg('text', { class: 'ms-svg-kicker', x: 40, y: 18 }, 'VERTICAL SCALE EXAGGERATED ×4'));
    put(fig, s);
    const form = FORMULAS.grade.forms[st.solve], subs = st.solve === 'G' ? `100(${S(R)})/${S(L)}` : st.solve === 'R' ? `${S(st.G)}(${S(st.L)})/100` : `100(${S(st.R)})/${S(st.G)}`;
    put(read, o.limit ? [el('p', { class: 'ms-live-eq' }, `G = 100(${S(R)})/300 = `, el('b', null, S(F(R).mul(100).div(300)) + '%')), status(!over, `Within the scenario’s ${o.limit}% limit (R ≤ 24 ft).`, `Over the ${o.limit}% limit: R must be 24 ft or less.`), el('p', { class: 'ls-small' }, GRADE_NOTE)]
      : [el('p', { class: 'ms-live-eq' }, `${form}:  ${st.solve} = ${subs} = `, el('b', null, `${S(v)} ${RANGE[st.solve][3]}`)), el('p', { class: 'ls-small' }, 'Grade uses the horizontal run, not the distance along the trail.')]);
    P.setData(key, st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig, read), el('div', { class: 'ms-lab-panel' },
    o.limit ? null : segs('Choose the unknown', [{ label: 'grade G', value: 'G' }, { label: 'rise R', value: 'R' }, { label: 'run L', value: 'L' }], st.solve, v => { st.solve = v; draw(); }), knobs));
}
export function shockTool(ctx) {
  const P = ctx.progress;
  let st = P.getData('shock', { T: 50, S: 15 });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' }), knob = el('div');
  function draw() {
    if (st.S > st.T) st.S = st.T;
    put(knob, slider({ label: 'Measured compression S (O-ring distance)', min: 0, max: st.T, step: 0.5, value: st.S, unit: 'mm', onInput: x => { st.S = x; redraw(); } }).node);
    redraw();
  }
  function redraw() {
    const p = F(st.S).mul(100).div(st.T);
    put(fig, shockSvg(st.T, st.S));
    put(read, el('p', { class: 'ms-live-eq' }, `P = 100S/T = 100(${S(st.S)})/${st.T} = `, el('b', null, S(p) + '%')),
      el('ul', { class: 'gp-defs' }, el('li', null, el('b', null, 'Stroke T: '), `${st.T} mm, the shock’s total travel (fixed by its design).`), el('li', null, el('b', null, 'Compression S: '), `${S(st.S)} mm, measured from the seal to the O-ring.`), el('li', null, el('b', null, 'Sag P: '), 'the percentage of the stroke used, calculated.')),
      el('p', { class: 'ls-small' }, SAG_NOTE));
    P.setData('shock', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' },
    segs('Shock stroke T', [40, 50, 55, 60, 65].map(t => ({ label: t + ' mm', value: t })), st.T, v => { st.T = v; draw(); }), knob, read));
}
// The Formula Rearrangement Studio: formula → unknown → each operation → the rearranged formula, then a numeric check.
export function rearrangeStudio(ctx) {
  const P = ctx.progress;
  let st = P.getData('studio', { f: 'grade', target: 'L', step: 0, done: [] });
  const box = el('div'), fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' });
  const say = (tone, t) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, el('p', null, t)); };
  function draw() {
    const Fm = FORMULAS[st.f], targets = Object.keys(Fm.vars), steps = (Fm.steps[st.target] || []), isolated = ISOLATED[st.f] === st.target;
    const current = st.step === 0 ? Fm.base : steps[st.step - 1].result, done = isolated || st.step >= steps.length;
    const finalForm = Fm.forms[st.target];
    let check = null;
    if (done && !isolated) {
      const vals = { ...SAMPLE[st.f] }; const R0 = parseRelation(Fm.base, { keepCase: true }); vals[ISOLATED[st.f]] = Number(evaluate(R0.parts[1], vals));
      const R = parseRelation(finalForm, { keepCase: true }), got = evaluate(R.parts[1], vals);
      check = `Check with numbers: ${Object.entries(vals).filter(([k]) => k !== st.target).map(([k, v]) => `${k} = ${S(v)}`).join(', ')} gives ${st.target} = ${S(got)}, matching ${st.target} = ${S(vals[st.target])} ✓`;
    }
    const s = steps[st.step];
    put(box,
      segs('Formula', Object.values(FORMULAS).map(x => ({ label: x.name, value: x.id })), st.f, v => { st.f = v; st.target = Object.keys(FORMULAS[v].vars).find(k => k !== ISOLATED[v]); st.step = 0; save(); draw(); }),
      segs('Isolate', targets.map(k => ({ label: `${k} (${Fm.vars[k].name})`, value: k })), st.target, v => { st.target = v; st.step = 0; save(); draw(); }),
      el('p', { class: 'gp-formula-now' }, current),
      el('ol', { class: 'gp-steps' }, steps.slice(0, st.step).map(x => el('li', null, el('span', { class: 'gp-step-op' }, x.op), el('span', { class: 'gp-step-res' }, x.result)))),
      isolated ? el('p', { class: 'ls-small' }, `${st.target} is already alone in ${Fm.base}. Pick another letter to isolate.`)
        : done ? el('div', { class: 'gp-reveal' }, el('p', { class: 'ms-live-eq' }, 'Rearranged: ', el('b', null, finalForm)), el('p', { class: 'ls-small' }, `Units: ${st.target} in ${Fm.vars[st.target].unit}.`), el('p', { class: 'ls-small' }, check),
          button('Start this one again', () => { st.step = 0; save(); draw(); }, 'ls-btn--quiet'))
          : el('div', { class: 'gp-moves', role: 'group', 'aria-label': 'Choose the operation' }, rotate([[s.op, true, null], ...s.wrong.map(([l, why]) => [l, false, why])], hash(st.f + st.target) + st.step).map(([label, ok, why]) =>
            el('button', { type: 'button', class: 'gp-move', onclick: () => { if (ok) { st.step += 1; if (st.step >= steps.length && !st.done.includes(st.f + ':' + st.target)) st.done.push(st.f + ':' + st.target); say('right', `Exactly: ${label.toLowerCase()}.`); } else say('wrong', why); save(); draw(); } }, label))),
      fb);
  }
  const save = () => P.setData('studio', st, true);
  draw();
  return el('div', { class: 'gp-studio' }, box);
}

// ------------------------------------------------------------ Stage 5: sign flip demo and approval dashboard
export function flipDemo(ctx) {
  const P = ctx.progress;
  let neg = P.getData('flip', false);
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'gp-read', 'aria-live': 'polite' }), btnBox = el('div');
  function draw() {
    put(btnBox, button(neg ? 'Undo: back to 2 and 5' : 'Multiply both sides by −1', () => { neg = !neg; draw(); }, 'ls-btn--quiet'));
    const a = neg ? -2 : 2, b = neg ? -5 : 5, W = 640, X = x => 320 + x * 44, y = 50;
    const s = svg('svg', { viewBox: `0 0 ${W} 100`, role: 'img', 'aria-label': neg ? '−2 and −5 on a number line: −2 is to the right, so −2 > −5' : '2 and 5 on a number line: 2 is to the left, so 2 < 5' });
    s.appendChild(svg('path', { class: 'gp-nl-axis', d: `M20 ${y} H${W - 20}` }));
    for (let v = -6; v <= 6; v++) { s.appendChild(svg('path', { class: 'gp-nl-tick', d: `M${X(v)} ${y - 5} V${y + 5}` })); s.appendChild(svg('text', { class: 'gp-nl-num', x: X(v), y: y + 24, 'text-anchor': 'middle' }, v < 0 ? '−' + -v : String(v))); }
    s.appendChild(svg('circle', { class: 'gp-flip-a', cx: X(a), cy: y, r: 9 })); s.appendChild(svg('circle', { class: 'gp-flip-b', cx: X(b), cy: y, r: 9 }));
    s.appendChild(svg('text', { class: 'ms-svg-label ms-mid', x: X(a), y: y - 16 }, S(a))); s.appendChild(svg('text', { class: 'ms-svg-label ms-mid', x: X(b), y: y - 16 }, S(b)));
    put(fig, s);
    put(read, el('p', { class: 'ms-live-eq' }, neg ? '−2 > −5' : '2 < 5'), el('p', null, neg ? 'Multiplying by −1 reflected both numbers across 0. Now −2 is to the right of −5, so the order (and the inequality sign) reversed.' : '2 is to the left of 5. Multiply both by −1 and watch the order.'));
    P.setData('flip', neg, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, btnBox, read));
}
export function approvalBoard(ctx, showVerdicts) {
  const P = ctx.progress;
  let mine = P.getData('custom', { kits: 7, rise: 21 });
  const box = el('div', { class: 'gp-pad' }), cust = el('div', { class: 'gp-read', 'aria-live': 'polite' });
  const cell = ok => el('td', { class: 'gp-cell ' + (ok ? 'is-ok' : 'is-bad') }, ok ? '✓' : '✗');
  function drawCustom() {
    const ok = passes(mine);
    put(cust, el('ul', { class: 'gp-checks' }, CONSTRAINTS.map(c => el('li', { class: c.test(mine) ? 'is-ok' : 'is-bad' }, c.test(mine) ? '✓ ' : '✗ ', c.text, el('span', { class: 'ls-small' }, '  (' + c.ineq + ')')))),
      status(ok, 'This plan meets every condition.', 'This plan breaks at least one condition.'),
      button('Approve this plan for my park', () => { P.setData('approved', { ...mine, ok }); drawCustom(); }, ok ? 'ls-btn--primary' : 'ls-btn--quiet', ok ? null : { disabled: true }),
      P.getData('approved', null) ? el('p', { class: 'ls-small' }, `Approved: ${P.getData('approved').kits} kits, connector rise ${P.getData('approved').rise} ft.`) : null);
    P.setData('custom', mine, true);
  }
  put(box,
    el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table gp-approve' }, el('caption', { class: 'ls-sr' }, 'Candidate plans and the conditions'),
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Plan'), el('th', { scope: 'col' }, 'Kits k'), el('th', { scope: 'col' }, 'Rise R'), ...CONSTRAINTS.map(c => el('th', { scope: 'col' }, c.ineq)))),
      el('tbody', null, APPROVAL.plans.map(p => el('tr', null, el('th', { scope: 'row' }, p.name), el('td', { class: 'ms-mono' }, String(p.kits)), el('td', { class: 'ms-mono' }, p.rise + ' ft'),
        ...CONSTRAINTS.map(c => (showVerdicts ? cell(c.test(p)) : el('td', { class: 'gp-cell' }, '?')))))))),
    showVerdicts ? null : el('p', { class: 'ls-small' }, 'The ✓ and ✗ appear once you’ve answered the approval question.'),
    el('h3', { class: 'ls-h3 ms-h3' }, 'Try your own plan'),
    slider({ label: 'Feature kits k', min: 0, max: 16, step: 1, value: mine.kits, onInput: v => { mine.kits = v; drawCustom(); } }).node,
    slider({ label: 'Connector rise R', min: 0, max: 40, step: 1, value: mine.rise, unit: 'ft', onInput: v => { mine.rise = v; drawCustom(); } }).node,
    cust);
  drawCustom();
  return box;
}
