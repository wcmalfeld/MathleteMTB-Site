// One question, of any type, with progressive hints, teaching feedback and
// (after a real try) the full solution. Used by the learning modules, the
// equation decoder and the missions.
//
// ask(q, { progress, key, model, kicker, onDone(result) }) -> element
//   q.type: 'choice' | 'number' | 'fields' | 'point' | 'points' | 'written'
//   result: { correct, revealed, attempts, hints, independent }

import { el, clear, button, id as uid } from './dom.js';
import { createGraph } from './graph.js';
import { checkNumber, checkFields, checkChoice, checkPoint } from '../logic/validate.js';
import { dec } from '../logic/quadratic.js';

export function ask(q, o) {
  const P = o.progress, key = o.key || null;
  const rec = () => P.question(q.id, key) || { attempts: 0, hints: 0, correct: false, revealed: false, answers: [] };
  const wrap = el('div', { class: 'jl-ask', 'data-q': q.id });
  const fb = el('div', { class: 'jl-fb', role: 'status', 'aria-live': 'polite' });
  const hintsEl = el('ol', { class: 'jl-hints', 'aria-label': 'Hints' });
  const sol = el('div', { class: 'jl-solution', hidden: true });
  if (o.kicker) wrap.appendChild(el('p', { class: 'jl-kicker' }, o.kicker));
  wrap.appendChild(el('p', { class: 'jl-prompt' }, q.prompt));

  let read, lock, answerText, marks = () => {};
  const area = el('div', { class: 'jl-answer' });
  if (q.type === 'choice') {
    const name = uid('c');
    const fs = el('fieldset', { class: 'jl-choices' }, el('legend', { class: 'jl-sr' }, 'Choose one'),
      q.options.map(op => { const oid = uid('o'); return el('label', { for: oid, class: 'jl-choice' }, el('input', { type: 'radio', id: oid, name, value: op.id }), el('span', { class: op.mono ? 'jl-mono' : null }, op.text)); }));
    area.appendChild(fs);
    read = () => { const c = fs.querySelector('input:checked'); return c ? c.value : null; };
    lock = () => fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
    answerText = v => (q.options.find(x => x.id === v) || {}).text || '';
  } else if (q.type === 'number' || q.type === 'fields') {
    const fields = q.type === 'number' ? [{ id: 'v', label: q.label || 'Your answer', answer: q.answer, unit: q.unit, traps: q.traps, decimalsOk: q.decimalsOk }] : q.fields;
    if (q.template) area.appendChild(el('p', { class: 'jl-template jl-mono' }, q.template));
    const inputs = {};
    const grid = el('div', { class: 'jl-fields' + (fields.length > 3 ? ' jl-fields--many' : '') });
    fields.forEach(f => {
      const fid = uid('f');
      inputs[f.id] = el('input', { id: fid, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', class: 'jl-input' });
      inputs[f.id].addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      grid.appendChild(el('div', { class: 'jl-field' }, el('label', { for: fid }, f.label),
        el('span', { class: 'jl-input-unit' }, inputs[f.id], f.unit ? el('span', { class: 'jl-unit' }, f.unit) : null),
        el('span', { class: 'jl-mark', 'data-for': f.id })));
    });
    area.appendChild(grid);
    area.appendChild(el('p', { class: 'jl-format' }, 'Numbers or fractions: 6, 2.25, −1/12 (or a decimal like −0.083).'));
    read = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value]));
    lock = () => Object.values(inputs).forEach(i => { i.readOnly = true; });
    answerText = v => fields.map(f => `${f.label}: ${v[f.id] || '—'}`).join('; ');
    marks = res => (res.fields || []).forEach(f => {
      const m = grid.querySelector(`[data-for="${f.id}"]`);
      m.textContent = f.code === 'empty' ? '' : f.correct ? '✓ right' : '✗ not yet';
      m.className = 'jl-mark ' + (f.correct ? 'is-right' : f.code === 'empty' ? '' : 'is-wrong');
      inputs[f.id].setAttribute('aria-invalid', f.correct ? 'false' : 'true');
    });
    q._fields = fields;
  } else if (q.type === 'point' || q.type === 'points') {
    let picks = [];
    const need = q.type === 'points' ? q.targets.length : 1;
    const status = el('p', { class: 'jl-format', 'aria-live': 'polite' }, need > 1 ? `Click or tap the ${need} points. Keyboard: focus the graph, arrow keys, Enter.` : 'Click or tap the point. Keyboard: focus the graph, arrow keys, Enter.');
    const g = createGraph({ model: o.model, show: { labels: false, ...(q.show || {}) }, range: 'fit', title: 'Graph: select a point',
      pick: { step: q.step || 0.5, onPick: p => { picks = need > 1 ? picks.concat([p]).slice(-need) : [p]; status.textContent = 'Selected: ' + picks.map(x => `(${dec(x.x)}, ${dec(x.y)})`).join(' and ') + (picks.length < need ? '. Select the other one.' : '.'); g.update({ extra: picks.map(x => ({ ...x, kind: 'pick' })) }); } } });
    area.appendChild(g.node); area.appendChild(status);
    read = () => picks.slice();
    lock = () => g.update({ pick: null, show: q.reveal || {} });
    answerText = v => v.map(x => `(${dec(x.x)}, ${dec(x.y)})`).join(' ');
  } else if (q.type === 'written') {
    const tid = uid('w');
    const ta = el('textarea', { id: tid, class: 'jl-input jl-textarea', rows: '4', maxlength: '1200' });
    area.appendChild(el('label', { for: tid, class: 'jl-sr' }, q.prompt));
    area.appendChild(ta);
    read = () => ta.value;
    lock = () => { ta.readOnly = true; };
  }
  wrap.appendChild(area);

  const checkBtn = button(q.type === 'written' ? 'Save my explanation' : 'Check', check, 'jl-btn--primary');
  const hintBtn = button('Get a hint', hint, 'jl-btn--quiet');
  const showBtn = button('Show the solution', reveal, 'jl-btn--quiet');
  hintBtn.hidden = q.type === 'written' || !(q.hints && q.hints.length);
  showBtn.hidden = true;
  wrap.appendChild(el('div', { class: 'jl-actions' }, checkBtn, hintBtn, showBtn));
  wrap.appendChild(hintsEl); wrap.appendChild(fb); wrap.appendChild(sol);

  const say = (tone, ...ps) => { clear(fb); fb.className = 'jl-fb jl-fb--' + tone; ps.filter(Boolean).forEach(p => fb.appendChild(typeof p === 'string' ? el('p', null, p) : p)); };
  function drawHints() {
    clear(hintsEl);
    const r = rec(), n = r.hints, hs = q.hints || [];
    hs.slice(0, n).forEach((h, i) => hintsEl.appendChild(el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    hintBtn.textContent = n >= hs.length ? 'No more hints' : n ? `Next hint (${hs.length - n} left)` : 'Get a hint';
    hintBtn.disabled = n >= hs.length;
    // The full solution is offered only after a real try: two attempts, or every hint.
    showBtn.hidden = q.type === 'written' || r.correct || r.revealed || !(r.attempts >= 2 || (hs.length && n >= hs.length));
  }
  function hint() { P.hint(q.id, key); drawHints(); }
  function correctText() {
    if (q.type === 'choice') return (q.options.find(x => x.correct) || {}).text || '';
    if (q.type === 'number') return dec(q.answer) + (q.unit ? ' ' + q.unit : '');
    if (q.type === 'fields') return q._fields.map(f => `${f.label}: ${dec(f.answer)}`).join('; ');
    if (q.type === 'point') return `(${dec(q.target.x)}, ${dec(q.target.y)})`;
    if (q.type === 'points') return q.targets.map(t => `(${dec(t.x)}, ${dec(t.y)})`).join(' and ');
    return '';
  }
  function finish(right, revealed, silent) {
    lock();
    checkBtn.hidden = hintBtn.hidden = showBtn.hidden = true;
    const text = q.solution || q.explain;
    if (text) { clear(sol); sol.appendChild(el('p', { class: 'jl-solution-h' }, right ? 'Why it works' : 'Solution')); sol.appendChild(el('p', null, text)); sol.hidden = false; }
    const r = rec();
    if (!silent && o.onDone) o.onDone({ correct: right, revealed: !!revealed, attempts: r.attempts, hints: r.hints, independent: right && r.attempts === 1 && r.hints === 0 });
  }
  function grade(ans) {
    if (q.type === 'choice') return checkChoice(q.options, ans);
    if (q.type === 'number') { const r = checkFields(q._fields, ans); return { ...r.fields[0], fields: r.fields }; }
    if (q.type === 'fields') {
      let r = checkFields(q._fields, ans, q.pairTraps);
      if (!r.correct && q.unordered) {          // e.g. the two zeros in either order
        const [a, b] = q.unordered, sw = { ...ans, [a]: ans[b], [b]: ans[a] }, r2 = checkFields(q._fields, sw);
        if (r2.fields.filter(f => f.correct).length > r.fields.filter(f => f.correct).length) r = { ...r2, fields: r2.fields.map(f => f.id === a ? { ...f, id: b } : f.id === b ? { ...f, id: a } : f) };
      }
      return r;
    }
    if (q.type === 'point') return checkPoint(q.target, ans[0], q.step || 0.5, q.traps);
    if (q.type === 'points') {
      if (ans.length < q.targets.length) return { correct: false, code: 'empty', message: `Select ${q.targets.length} points.` };
      const hit = q.targets.filter(t => ans.some(a => checkPoint(t, a, q.step || 0.5).correct)).length;
      return hit === q.targets.length ? { correct: true, code: 'correct' } : { correct: false, code: hit ? 'partly' : 'wrong', message: hit ? 'One of those is right. Where else does the curve meet the ground line?' : null };
    }
  }
  function check() {
    const ans = read();
    if (q.type === 'written') {
      const words = String(ans).trim().split(/\s+/).filter(Boolean).length;
      if (words < 8) return say('info', 'Write at least a sentence or two (8+ words).');
      P.written(q.id, key, ans);
      say('right', 'Saved. Compare it with this model answer:');
      sol.hidden = false; clear(sol); sol.appendChild(el('p', { class: 'jl-solution-h' }, 'Model answer')); sol.appendChild(el('p', null, q.model));
      lock(); checkBtn.hidden = true;
      if (o.onDone) o.onDone({ correct: true, revealed: false, attempts: 1, hints: 0, independent: true, written: true });
      return;
    }
    const res = grade(ans);
    marks(res);
    if (res.code === 'empty' || res.code === 'unreadable' || (res.fields && res.fields.some(f => f.code === 'unreadable'))) {
      return say('info', res.message || (res.fields || []).map(f => f.message).find(Boolean) || 'Fill in every answer first.');
    }
    if (res.fields && res.fields.some(f => f.code === 'empty')) return say('info', 'Fill in every box first.');
    P.attempt(q.id, key, answerText(ans), res.correct, { code: res.code, skills: q.skills, prompt: q.prompt, correctAnswer: correctText() });
    if (res.correct) { say('right', rec().attempts === 1 && !rec().hints ? 'Right, first try.' : 'Right.'); finish(true); return; }
    const msgs = [];
    if (res.message) msgs.push(res.message);
    if (res.fields) res.fields.filter(f => !f.correct && f.message).forEach(f => msgs.push(`${f.label}: ${f.message}`));
    const right = (res.fields || []).filter(f => f.correct).map(f => f.label);
    say('wrong', right.length ? `${right.join(', ')}: right. ` + (msgs[0] || 'Check the others.') : (msgs[0] || 'Not quite.'), ...msgs.slice(1), (q.hints && rec().hints < q.hints.length) ? 'Have another go, or take a hint.' : 'Have another go.');
    drawHints();
  }
  function reveal() { P.reveal(q.id, key); say('info', 'Here’s the full working. Read it, then try the next one on your own.'); finish(false, true); }

  const r0 = rec();
  drawHints();
  if (r0.correct || r0.revealed) { say(r0.correct ? 'right' : 'info', r0.correct ? 'You’ve already got this one.' : 'You looked at the solution for this one.'); finish(r0.correct, r0.revealed, true); }
  return wrap;
}
