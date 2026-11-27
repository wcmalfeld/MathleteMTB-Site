// Map the Line: the original Slope Lab's question bank, kept whole. The 32
// questions (content/questions.js: 24 practice at three levels and the
// 8-question transfer challenge) are graded by the original checker
// (logic/validate.js: percent vs decimal, run ÷ rise, undefined slope, points
// on a line), and recorded under their original ids in lower case
// (slope-lab:f1 … slope-lab:t8), so students' earlier progress, the course
// skills and the rewards assessment still line up.

import { el, put, button, id as uid } from '../../lesson-kit/dom.js';
import { segs } from '../../lesson-kit/controls.js';
import { tutorOf } from '../../dream-line-project/components/labs.js';
import { QUESTIONS as BANK, LEVELS } from '../content/questions.js';
import { checkNumber, checkFields, checkChoice, checkPlot } from '../logic/validate.js';
import { gridSvg, tableEl, segmentPlot } from './figures.js';
import { S } from '../logic/linear.js';

export const LEGACY = BANK.map(q => ({ ...q, key: q.id.toLowerCase() }));
const LEVEL_NAMES = { 1: 'Foundations', 2: 'Application', 3: 'Challenge' };

function diagram(d) {
  if (!d) return null;
  if (d.kind === 'profile') return el('div', { class: 'ms-figure mt-fig' }, segmentPlot(d.start, d.end, { tri: true }));
  if (d.kind === 'table') return tableEl(d.rows, d.headers);
  if (d.kind === 'graph') {
    const L = (d.lines || [])[0], line = L ? (L.vertical ? [[L.x, d.y[0]], [L.x, d.y[1]]] : [[d.x[0], L.m * d.x[0] + L.b], [d.x[1], L.m * d.x[1] + L.b]]) : null;
    return el('div', { class: 'ms-figure mt-fig' }, gridSvg({ x: d.x, y: d.y, map: false, line, points: (d.points || []).map(p => ({ ...p, label: `(${S(p.x)}, ${S(p.y)})` })), label: 'A line on a coordinate grid' }));
  }
  return null;
}
const miniTable = t => el('span', { class: 'mt-mini-table' }, el('span', null, 'x: ' + t.x.join(', ')), el('span', null, 'y: ' + t.y.join(', ')));
const fmtAns = a => (a === 'undefined' ? 'undefined' : S(a));

export function legacyQuestion(ctx, q) {
  const P = ctx.progress, id = q.key, rec = () => P.question(id) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const area = el('div', { class: 'ls-answer' }), fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' }), hintsEl = el('ol', { class: 'ls-hints' }), actions = el('div', { class: 'ls-actions' }), sol = el('div', { class: 'ls-solution', hidden: true });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  let read, lock, answerText, plotted = [];
  if (q.type === 'number' || q.type === 'fields') {
    const fs = q.type === 'number' ? [{ id: 'v', label: q.label || 'Your answer', unit: q.unit }] : q.fields, inputs = {};
    area.appendChild(el('div', { class: 'ls-fields' }, fs.map(f => { const fid = uid('lf'); inputs[f.id] = el('input', { id: fid, class: 'ls-input', autocomplete: 'off', inputmode: 'decimal' });
      return el('div', { class: 'ls-field' }, el('label', { for: fid }, f.label), el('span', { class: 'ls-input-unit' }, inputs[f.id], f.unit ? el('span', { class: 'ls-unit' }, f.unit) : null)); })));
    if (q.undefinedButton) area.appendChild(button('Undefined', () => { inputs.v.value = 'undefined'; }, 'ls-btn--quiet'));
    read = () => (q.type === 'number' ? inputs.v.value : Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value])));
    lock = () => Object.values(inputs).forEach(i => { i.readOnly = true; });
    answerText = v => (typeof v === 'string' ? v : Object.entries(v).map(([k, x]) => k + ': ' + x).join('; '));
  } else if (q.type === 'choice') {
    const name = uid('lc');
    const box = el('fieldset', { class: 'ls-choices' }, el('legend', { class: 'ls-sr' }, 'Choose one'), q.options.map(o => { const oid = uid('lo'); return el('label', { class: 'ls-choice', for: oid }, el('input', { type: 'radio', id: oid, name, value: o.id }), el('span', null, o.table ? miniTable(o.table) : o.text)); }));
    area.appendChild(box);
    read = () => { const c = box.querySelector('input:checked'); return c ? c.value : null; };
    lock = () => box.querySelectorAll('input').forEach(i => { i.disabled = true; });
    answerText = v => { const o = q.options.find(x => x.id === v); return o ? (o.text || 'table ' + o.id) : ''; };
  } else if (q.type === 'plot') {
    const fig = el('div', { class: 'ms-figure mt-fig' });
    const drawPlot = () => put(fig, gridSvg({ x: q.grid.x, y: q.grid.y, map: false, points: plotted.map(p => ({ ...p, label: `(${S(p.x)}, ${S(p.y)})`, cls: 'is-placed' })), line: plotted.length === 2 ? [[plotted[0].x, plotted[0].y], [plotted[1].x, plotted[1].y]] : null,
      onPick: rec().correct || rec().revealed ? null : (x, y) => { const i = plotted.findIndex(p => p.x === x && p.y === y); if (i >= 0) plotted.splice(i, 1); else { plotted.push({ x, y }); if (plotted.length > 2) plotted.shift(); } drawPlot(); }, label: 'Grid: click to place two points' }));
    drawPlot(); area.append(fig, el('p', { class: 'ls-small' }, 'Click two grid crossings that are on the line (click a point again to remove it).'));
    read = () => plotted; lock = () => {}; answerText = v => v.map(p => `(${p.x}, ${p.y})`).join(' ');
  }
  const correctText = () => (q.type === 'number' ? fmtAns(q.answer) : q.type === 'fields' ? q.fields.map(f => f.label + ': ' + fmtAns(f.answer)).join('; ') : q.type === 'choice' ? (q.options.find(o => o.correct) || {}).text || 'the linear table' : `y = ${S(q.line.m)}x ${q.line.b < 0 ? '− ' + S(-q.line.b) : '+ ' + S(q.line.b)}`);
  const grade = v => (q.type === 'number' ? checkNumber(q, v) : q.type === 'fields' ? checkFields(q.fields, v) : q.type === 'choice' ? checkChoice(q.options, v) : checkPlot(q.line, v));
  function finish(right, revealed) {
    lock(); put(actions);
    sol.hidden = false; put(sol, el('p', { class: 'ls-solution-h' }, right ? 'Why it works' : 'Solution'), el('p', null, q.explanation));
    if (!revealed) ctx.refresh();
  }
  function check() {
    const v = read(), r = grade(v);
    const empty = r.code === 'empty' || r.code === 'unreadable' || (r.fields && r.fields.some(f => f.code === 'empty' || f.code === 'unreadable'));
    if (empty) { say('info', r.message || (r.fields || []).map(f => f.message).find(Boolean) || 'Fill in every answer first.'); return; }
    const code = r.code || (r.fields && (r.fields.find(f => !f.correct) || {}).code) || 'wrong';
    P.attempt(id, null, answerText(v), r.correct, { code: r.correct ? 'correct' : code, prompt: q.prompt, correctAnswer: correctText() });
    if (r.correct) { say('right', rec().attempts === 1 && !rec().hints ? 'Right, first try.' : 'Right.'); finish(true); return; }
    const msg = r.message || (r.fields || []).filter(f => !f.correct && f.message).map(f => f.label + ': ' + f.message)[0] || q.concept;
    say('wrong', msg, 'Have another go' + (rec().hints < (q.hints || []).length ? ', or take a hint.' : '.')); draw();
  }
  function draw() {
    const r = rec(), T = tutorOf(P), hs = T.hints ? q.hints || [] : [];
    put(hintsEl, hs.slice(0, r.hints).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    if (r.correct || r.revealed) return;
    put(actions, button('Check', check, 'ls-btn--primary'), hs.length && r.hints < hs.length ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', () => { P.hint(id); draw(); }, 'ls-btn--quiet') : null,
      T.reveal || r.attempts >= 2 || (hs.length && r.hints >= hs.length) ? button('Show the solution', () => { P.reveal(id); say('info', 'Here’s the full working.'); finish(false, true); ctx.refresh(); }, 'ls-btn--quiet') : null);
  }
  const r0 = rec();
  draw();
  if (r0.correct || r0.revealed) { say(r0.correct ? 'right' : 'info', r0.correct ? 'You’ve already got this one.' : 'You looked at the solution for this one.'); finish(r0.correct, true); }
  return el('div', { class: 'ls-card ms-ask mt-legacy', 'data-q': id }, el('p', { class: 'ls-kicker' }, (q.set === 'transfer' ? 'Transfer' : LEVEL_NAMES[q.level]) + ' · ' + q.skill),
    el('p', { class: 'ls-prompt' }, q.prompt), q.math ? el('p', { class: 'ms-live-eq' }, q.math.join('   ')) : null, diagram(q.diagram), area, actions, hintsEl, fb, sol);
}

// The practice bank (three levels) or the transfer challenge.
export function legacyBank(ctx, set) {
  const P = ctx.progress, list = LEGACY.filter(q => q.set === set), box = el('div'), head = el('p', { class: 'ls-small' });
  let level = P.getData('bankLevel', 1);
  const count = qs => qs.filter(q => P.done(q.key)).length;
  function draw() {
    const qs = set === 'transfer' ? list : list.filter(q => q.level === level);
    head.textContent = set === 'transfer' ? `${count(list)} of ${list.length} answered. The same slope ideas, outside mountain biking.` : `${count(list)} of ${list.length} practice questions answered across the three levels.`;
    put(box, qs.map(q => legacyQuestion(ctx, q)));
  }
  draw();
  return el('div', { class: 'mt-bank' }, set === 'transfer' ? null : segs('Level', [1, 2, 3].map(n => ({ label: `${LEVEL_NAMES[n]} (${list.filter(q => q.level === n).length})`, value: n })), level, v => { level = v; P.setData('bankLevel', v, true); draw(); }), head, box);
}
export { LEGACY_IDEAS } from '../logic/questions.js';
