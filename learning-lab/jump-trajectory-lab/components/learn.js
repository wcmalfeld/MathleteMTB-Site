// Learn: five short modules (A–E). Each has a short explanation, a visual
// demonstration, a guided interaction and a comprehension question, and can
// be revisited any time.
import { el, button, equation } from './dom.js';
import { createGraph } from './graph.js';
import { createSimulator } from './explore.js';
import { ask } from './ask.js';
import { jumpModel, dec, fstr, vertexForm, factoredForm, standardForm } from '../logic/quadratic.js';
import { MOD_A_Q, MOD_E_Q, modB, modC, modD } from '../logic/problems.js';
import { MODULES } from '../logic/progress.js';

export const MODULE_TITLES = {
  a: ['The parabola', 'Why does a jump make a parabola?'],
  b: ['The vertex', 'Where does the rider reach maximum height?'],
  c: ['Zeros', 'Where does the trajectory meet the ground?'],
  d: ['Axis of symmetry', 'The invisible line through every symmetrical jump'],
  e: ['The coefficient', 'Why do some jumps have a steeper arc than others?']
};

const p = (...k) => el('p', null, ...k);
const stepH = (n, t) => el('h3', { class: 'jl-step-h' }, el('span', { class: 'jl-step-n' }, String(n)), t);

export function renderLearn(ctx, which) {
  const id = MODULES.includes(which) ? which : (MODULES.find(m => !ctx.progress.state.modules[m]) || 'a');
  const page = el('div', { class: 'jl-learn' });
  page.appendChild(el('nav', { class: 'jl-subnav', 'aria-label': 'Learning modules' }, el('ol', null, MODULES.map((m, i) =>
    el('li', null, el('a', { href: '#learn/' + m, 'aria-current': m === id ? 'page' : null, class: ctx.progress.state.modules[m] ? 'is-done' : null },
      el('span', { class: 'jl-num', 'aria-hidden': 'true' }, ctx.progress.state.modules[m] && m !== id ? '✓' : String.fromCharCode(65 + i)), MODULE_TITLES[m][0]))))));
  const body = el('section', { class: 'jl-module', 'aria-labelledby': 'mod-title' },
    el('p', { class: 'jl-kicker' }, `Module ${id.toUpperCase()} · ${MODULE_TITLES[id][0]}`),
    el('h2', { class: 'jl-h2', id: 'mod-title' }, MODULE_TITLES[id][1]));
  const done = () => { ctx.progress.moduleDone(id); ctx.refreshNav(); };
  ({ a: modA, b: modBView, c: modCView, d: modDView, e: modE })[id](body, ctx, done);
  const i = MODULES.indexOf(id), next = MODULES[i + 1];
  body.appendChild(el('div', { class: 'jl-pager' },
    i > 0 ? el('a', { class: 'jl-btn jl-btn--quiet', href: '#learn/' + MODULES[i - 1] }, '← Module ' + MODULES[i - 1].toUpperCase()) : el('span'),
    next ? el('a', { class: 'jl-btn jl-btn--primary', href: '#learn/' + next }, `Next: ${MODULE_TITLES[next][0]} →`) : el('a', { class: 'jl-btn jl-btn--primary', href: '#decoder' }, 'Next: the Equation Decoder →')));
  page.appendChild(body);
  return page;
}

// A. The parabola
function modA(box, ctx, done) {
  box.appendChild(stepH(1, 'The idea'));
  box.appendChild(p('In algebra, a quadratic function makes a graph called a parabola. A simplified mountain bike jump trajectory is a great example of this shape.'));
  box.appendChild(el('div', { class: 'jl-rule' }, el('span', { class: 'jl-equation jl-equation--big' }, 'y = ax² + bx + c')));
  box.appendChild(el('ul', { class: 'jl-points' },
    el('li', null, el('b', null, 'x'), ' is the horizontal distance from takeoff.'),
    el('li', null, el('b', null, 'y'), ' is the height above the takeoff level.'),
    el('li', null, el('b', null, 'a, b and c'), ' are numbers (coefficients) that set the shape and position of the curve.')));
  box.appendChild(stepH(2, 'Try it'));
  box.appendChild(p('Raise the maximum height and leave the jump distance alone. Watch the takeoff and landing, and the shape of the curve.'));
  const sim = createSimulator(ctx, { compact: true });
  box.appendChild(sim.node);
  box.appendChild(stepH(3, 'Check'));
  box.appendChild(ask(MOD_A_Q, { progress: ctx.progress, onDone: done }));
}

// B. The vertex
function modBView(box, ctx, done) {
  const m = jumpModel(12, 3);
  box.appendChild(stepH(1, 'The idea'));
  box.appendChild(p('The vertex is the highest or lowest point of a parabola. Because our modeled jump opens downward, the vertex is the maximum height.'));
  const g = createGraph({ model: m, show: { vertex: true, axis: false }, range: 'fit' });
  box.appendChild(el('div', { class: 'jl-demo' }, g.node, el('div', null,
    el('p', null, 'For the modeled jump'), el('p', null, equation(vertexForm(m), { cls: 'jl-equation--big' })),
    el('p', null, 'the vertex is ', el('b', { class: 'jl-c-vertex' }, '(6, 3)'), '.'),
    el('ul', { class: 'jl-points' },
      el('li', null, 'The ', el('b', null, 'x-coordinate'), ', 6, tells you ', el('b', null, 'where'), ' the maximum happens: 6 m from takeoff.'),
      el('li', null, 'The ', el('b', null, 'y-coordinate'), ', 3, tells you ', el('b', null, 'what'), ' the maximum is: 3 m high.')))));
  box.appendChild(stepH(2, 'Find it yourself'));
  const q = modB();
  const follow = el('div');
  box.appendChild(ask(q, { progress: ctx.progress, key: q.key, model: q.model, onDone: () => {
    follow.appendChild(ask(q.follow, { progress: ctx.progress, key: q.key, onDone: done }));
  } }));
  box.appendChild(follow);
  if (ctx.progress.question(q.id, q.key) && (ctx.progress.question(q.id, q.key).correct || ctx.progress.question(q.id, q.key).revealed) && !follow.firstChild) {
    follow.appendChild(ask(q.follow, { progress: ctx.progress, key: q.key, onDone: done }));
  }
}

// C. Zeros
function modCView(box, ctx, done) {
  const m = jumpModel(12, 3);
  box.appendChild(stepH(1, 'The idea'));
  box.appendChild(p('The zeros of a quadratic function are the x-values where the graph crosses the x-axis. In our simplified jump model, they are the takeoff and landing positions.'));
  const g = createGraph({ model: m, show: { zeros: true }, range: 'fit' });
  box.appendChild(el('div', { class: 'jl-demo' }, g.node, el('div', null,
    el('p', null, 'Factored form shows them:'), el('p', null, equation(factoredForm(m), { cls: 'jl-equation--big' })),
    el('p', null, 'Set y = 0:  0 = −1/12 · x · (x − 12).'),
    el('p', null, 'A product is 0 when a factor is 0, so ', el('b', { class: 'jl-c-zero' }, 'x = 0'), ' or ', el('b', { class: 'jl-c-zero' }, 'x = 12'), '.'),
    el('ul', { class: 'jl-points' }, el('li', null, 'The rider takes off at x = 0.'), el('li', null, 'The rider lands at x = 12.')))));
  box.appendChild(stepH(2, 'Find them yourself'));
  const q = modC();
  const follow = el('div');
  const showFollow = () => { if (!follow.firstChild) follow.appendChild(ask(q.follow, { progress: ctx.progress, key: q.key, onDone: done })); };
  box.appendChild(ask(q, { progress: ctx.progress, key: q.key, model: q.model, onDone: showFollow }));
  box.appendChild(follow);
  const r = ctx.progress.question(q.id, q.key); if (r && (r.correct || r.revealed)) showFollow();
}

// D. Axis of symmetry
function modDView(box, ctx, done) {
  const m = jumpModel(12, 3);
  box.appendChild(stepH(1, 'The idea'));
  box.appendChild(p('The axis of symmetry is a vertical line through the vertex. It splits the parabola into two mirror-image halves, because takeoff and landing are at the same height.'));
  const g = createGraph({ model: m, show: { axis: true, vertex: true }, range: 'fit', extra: [{ x: 3, y: m.y(3), label: '(3, 2.25)' }, { x: 9, y: m.y(9), label: '(9, 2.25)' }] });
  box.appendChild(el('div', { class: 'jl-demo' }, g.node, el('div', null,
    el('p', null, 'For this jump the axis is ', el('b', { class: 'jl-c-axis' }, 'x = 6'), '.'),
    el('p', null, 'Points the same distance either side of it are at the same height:'),
    el('ul', { class: 'jl-points' }, el('li', null, `At x = 3 (3 m before the axis), height = ${dec(m.y(3))} m.`), el('li', null, `At x = 9 (3 m after the axis), height = ${dec(m.y(9))} m.`)),
    el('p', null, 'The rider rises and falls the same way.'))));
  box.appendChild(stepH(2, 'Find the mirror point'));
  const q = modD();
  const g2 = createGraph({ model: q.model, show: { axis: true }, range: 'fit', extra: [{ ...q.point, label: `(4, ${dec(q.point.y)})` }] });
  box.appendChild(g2.node);
  box.appendChild(ask(q, { progress: ctx.progress, key: q.key, onDone: r => { g2.update({ extra: [{ ...q.point, label: `(4, ${dec(q.point.y)})` }, { x: q.answer, y: q.point.y, label: `(${dec(q.answer)}, ${dec(q.point.y)})`, kind: 'answer' }] }); done(r); } }));
}

// E. The coefficient
function modE(box, ctx, done) {
  box.appendChild(stepH(1, 'The idea'));
  box.appendChild(el('div', { class: 'jl-rule' }, el('span', { class: 'jl-equation jl-equation--big' }, 'y = ', el('b', { class: 'jl-hl' }, 'a'), 'x² + bx + c')));
  box.appendChild(el('ul', { class: 'jl-points' },
    el('li', null, 'A ', el('b', null, 'negative'), ' a opens downward (a maximum), like every jump.'),
    el('li', null, 'A ', el('b', null, 'positive'), ' a opens upward (a minimum), like a valley.'),
    el('li', null, 'A ', el('b', null, 'bigger |a|'), ' (further from 0) makes a ', el('b', null, 'narrower'), ' parabola; a smaller |a| makes a wider one.')));
  box.appendChild(el('div', { class: 'jl-callout' },
    el('p', { class: 'jl-callout-h' }, 'In our jump, you don’t set a directly.'),
    p('It comes from the height and the distance:'),
    el('p', { class: 'jl-equation jl-equation--big' }, 'a = −4H / L²'),
    p('So changing the jump changes a. Try it below and watch a in the readout.')));
  box.appendChild(stepH(2, 'Try it'));
  const out = el('p', { class: 'jl-live', 'aria-live': 'polite' });
  const sim = createSimulator(ctx, { compact: true, onChange: m => { out.textContent = `a = −4 × ${dec(m.H)} / ${dec(m.L)}² = ${fstr(m.a)} ≈ ${dec(m.aValue, 4)}`; } });
  out.textContent = `a = −4 × 3 / 12² = −1/12 ≈ −0.0833`;
  box.appendChild(sim.node); box.appendChild(out);
  box.appendChild(stepH(3, 'Check'));
  box.appendChild(ask(MOD_E_Q, { progress: ctx.progress, onDone: done }));
}
