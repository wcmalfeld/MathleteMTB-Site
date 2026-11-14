// Equation Decoder: one jump, three equations. Each tab highlights what its
// form shows, on the equation and on the graph, while the jump stays the same.
import { el, clear, button, equation } from './dom.js';
import { createGraph } from './graph.js';
import { ask } from './ask.js';
import { jumpModel, LIMITS, clamp, dec, fstr, nice, vertexForm, standardForm, factoredForm } from '../logic/quadratic.js';
import { DECODER_MATCH, FORM_NAMES, decoderTranslate } from '../logic/problems.js';

const FORMS = {
  vertex: { general: 'y = a(x − h)² + k', parts: vertexForm, show: { vertex: true, axis: true }, roles: ['h', 'k', 'a'],
    explain: m => [`h = ${nice(m.h)}: the horizontal position of the vertex (where the peak is).`, `k = ${nice(m.k)}: the height of the vertex (the maximum height).`, `a = ${fstr(m.a)}: the direction and curvature.`] },
  standard: { general: 'y = ax² + bx + c', parts: standardForm, show: {}, roles: ['a', 'b', 'c'],
    explain: m => [`a = ${fstr(m.a)}: the leading coefficient. Negative, so the parabola opens downward.`, `b = ${fstr(m.b)}: with a, it sets where the peak is (x = −b / 2a = ${dec(m.vertex.x)}).`, 'c = 0: the height when x = 0. The jump takes off from the origin.'] },
  factored: { general: 'y = a(x − r₁)(x − r₂)', parts: factoredForm, show: { zeros: true }, roles: ['r1', 'r2', 'a'],
    explain: m => [`r₁ = 0: the takeoff (written as just x).`, `r₂ = ${nice(m.Lf)}: the landing.`, 'These are the zeros: where the graph crosses the x-axis.'] }
};

export function renderDecoder(ctx) {
  const P = ctx.progress;
  const page = el('div', { class: 'jl-decoder' });
  page.appendChild(el('header', { class: 'jl-section-head' }, el('p', { class: 'jl-kicker' }, 'Equation Decoder'), el('h2', { class: 'jl-h2' }, 'Three ways to describe one jump'),
    el('p', { class: 'jl-lede' }, 'Vertex, standard and factored form look different, but they are the same function and the same jump. Each one makes a different feature easy to read.')));

  let m = jumpModel(ctx.jump.L, ctx.jump.H), form = 'vertex';
  const g = createGraph({ model: m, range: 'fit' });
  const tabs = el('div', { class: 'jl-tabs', role: 'tablist', 'aria-label': 'Equation form' });
  const panel = el('div', { class: 'jl-tabpanel', role: 'tabpanel', 'aria-live': 'polite' });
  const btns = {};
  Object.keys(FORMS).forEach(f => {
    btns[f] = el('button', { type: 'button', role: 'tab', class: 'jl-tab', id: 'tab-' + f, onclick: () => { form = f; P.decoderDone('tab-' + f); draw(); } }, FORM_NAMES[f]);
    tabs.appendChild(btns[f]);
  });
  tabs.addEventListener('keydown', e => {
    const keys = Object.keys(FORMS), i = keys.indexOf(form);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); form = keys[(i + (e.key === 'ArrowRight' ? 1 : keys.length - 1)) % keys.length]; draw(); btns[form].focus(); }
  });
  const pick = (k, label) => {
    const s = el('select', { 'aria-label': label });
    for (let v = LIMITS[k].min; v <= LIMITS[k].max; v += LIMITS[k].step) s.appendChild(el('option', { value: v, selected: v === (k === 'L' ? m.L : m.H) ? true : null }, `${v} m`));
    s.addEventListener('change', () => { m = jumpModel(clamp(Number(sL.value), 'L'), clamp(Number(sH.value), 'H')); ctx.jump = { L: m.L, H: m.H }; draw(); });
    return s;
  };
  const sL = pick('L', 'Jump distance'), sH = pick('H', 'Maximum height');

  function draw() {
    const F = FORMS[form];
    Object.keys(btns).forEach(f => { btns[f].setAttribute('aria-selected', f === form ? 'true' : 'false'); btns[f].tabIndex = f === form ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'tab-' + form);
    g.update({ model: m, show: { vertex: false, axis: false, zeros: false, ...F.show } });
    clear(panel);
    const eqn = equation(F.parts(m), { cls: 'jl-equation--big jl-equation--' + form });
    panel.appendChild(el('p', { class: 'jl-mini' }, 'General form: ', el('span', { class: 'jl-mono' }, F.general)));
    panel.appendChild(el('p', null, eqn));
    panel.appendChild(el('ul', { class: 'jl-points' }, F.explain(m).map(t => el('li', null, t))));
    panel.appendChild(el('p', { class: 'jl-note' }, `The same jump in the other forms: ${Object.keys(FORMS).filter(f => f !== form).map(f => FORM_NAMES[f] + ': ' + FORMS[f].parts(m).map(x => x.frac ? `${x.frac.n}/${x.frac.d}` : x.t).join('')).join(' · ')}`));
  }
  page.appendChild(el('div', { class: 'jl-decoder-main' },
    el('div', null, el('div', { class: 'jl-row' }, el('label', { class: 'jl-inline' }, 'Distance ', sL), el('label', { class: 'jl-inline' }, 'Height ', sH)), g.node),
    el('div', null, tabs, panel)));
  draw();

  // Matching: which form shows what?
  const matchSec = el('section', { class: 'jl-block', 'aria-labelledby': 'match-title' }, el('h2', { class: 'jl-h3', id: 'match-title' }, 'Which form makes it easiest?'));
  DECODER_MATCH.forEach(d => {
    matchSec.appendChild(ask({ ...d, type: 'choice', hints: ['Think about which numbers each form shows directly.', 'Vertex form shows (h, k); factored form shows the roots; standard form shows a, b and c.'],
      solution: d.why,
      options: Object.keys(FORM_NAMES).map(f => ({ id: f, text: FORM_NAMES[f], mono: false, correct: f === d.answer, code: f === d.answer ? null : 'form-confusion',
        feedback: f === d.answer ? null : `${FORM_NAMES[f]} doesn’t show that directly. ${d.why}` })) }, { progress: P, onDone: () => P.decoderDone(d.id) }));
  });
  page.appendChild(matchSec);

  // Translation: read one form, answer about a feature another form shows.
  const trSec = el('section', { class: 'jl-block', 'aria-labelledby': 'tr-title' }, el('h2', { class: 'jl-h3', id: 'tr-title' }, 'Translate between forms'),
    el('p', { class: 'jl-note' }, 'Each jump is given in one form. Use what you know about the shape to read a feature another form would show.'));
  decoderTranslate(1).forEach(t => trSec.appendChild(ask({ ...t, type: 'number', solution: t.explain }, { progress: P, key: t.key, onDone: () => P.decoderDone(t.id) })));
  page.appendChild(trSec);
  return page;
}
