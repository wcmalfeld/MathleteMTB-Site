// One question (choice, number or several numbers) with progressive hints,
// feedback that names the mistake, and the full solution only after a real
// try (two attempts, or every hint). Same behaviour as the other labs.
//
// ask(q, { progress, key, onDone(result) }) -> element
//   q: { id, type, prompt, options | answer+tolerance+unit+traps | fields, hints, solution, skills }

import { el, clear, button, id as uid } from './dom.js';
import { checkNumber, checkFields, checkChoice } from '../logic/validate.js';
import { fmt } from '../logic/physics.js';

const digitsFor = tol => (tol >= 1 ? 0 : tol >= 0.1 ? 1 : 2);

export function ask(q, o) {
  const P = o.progress, key = o.key || null;
  const rec = () => P.question(q.id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const wrap = el('div', { class: 'cl-ask', 'data-q': q.id });
  const fb = el('div', { class: 'cl-fb', role: 'status', 'aria-live': 'polite' });
  const hintsEl = el('ol', { class: 'cl-hints', 'aria-label': 'Hints' });
  const sol = el('div', { class: 'cl-solution', hidden: true });
  const promptId = uid('qp');
  wrap.appendChild(el('p', { class: 'cl-prompt', id: promptId }, q.prompt));

  let read, lock, answerText, marks = () => {};
  const area = el('div', { class: 'cl-answer' });
  if (q.type === 'choice') {
    const name = uid('c');
    const fs = el('fieldset', { class: 'cl-choices', 'aria-labelledby': promptId }, el('legend', { class: 'cl-sr' }, 'Choose one'),
      q.options.map(op => { const oid = uid('o'); return el('label', { for: oid, class: 'cl-choice' }, el('input', { type: 'radio', id: oid, name, value: op.id }), el('span', null, op.text)); }));
    area.appendChild(fs);
    read = () => { const c = fs.querySelector('input:checked'); return c ? c.value : null; };
    lock = () => fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
    answerText = v => (q.options.find(x => x.id === v) || {}).text || '';
  } else {
    const fields = q.type === 'number' ? [{ id: 'v', label: q.label || 'Your answer', answer: q.answer, tolerance: q.tolerance, unit: q.unit, traps: q.traps }] : q.fields;
    const inputs = {};
    const grid = el('div', { class: 'cl-fields' });
    fields.forEach(f => {
      const fid = uid('f');
      inputs[f.id] = el('input', { id: fid, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', class: 'cl-input' });
      inputs[f.id].addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      grid.appendChild(el('div', { class: 'cl-field' }, el('label', { for: fid }, f.label),
        el('span', { class: 'cl-input-unit' }, inputs[f.id], f.unit ? el('span', { class: 'cl-unit' }, f.unit) : null),
        el('span', { class: 'cl-mark', 'data-for': f.id })));
    });
    area.appendChild(grid);
    read = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value]));
    lock = () => Object.values(inputs).forEach(i => { i.readOnly = true; });
    answerText = v => fields.map(f => (fields.length > 1 ? f.label + ': ' : '') + (v[f.id] || '—')).join('; ');
    marks = res => (res.fields || []).forEach(f => {
      const m = grid.querySelector(`[data-for="${f.id}"]`);
      m.textContent = f.code === 'empty' ? '' : f.correct ? '✓ right' : '✗ not yet';
      m.className = 'cl-mark ' + (f.correct ? 'is-right' : f.code === 'empty' ? '' : 'is-wrong');
      inputs[f.id].setAttribute('aria-invalid', f.correct ? 'false' : 'true');
    });
    q._fields = fields;
  }
  wrap.appendChild(area);

  const checkBtn = button('Check', check, 'cl-btn--primary');
  const hintBtn = button('Get a hint', hint, 'cl-btn--quiet');
  const showBtn = button('Show the solution', reveal, 'cl-btn--quiet');
  hintBtn.hidden = !(q.hints && q.hints.length);
  showBtn.hidden = true;
  wrap.append(el('div', { class: 'cl-actions' }, checkBtn, hintBtn, showBtn), hintsEl, fb, sol);

  const say = (tone, ...ps) => { clear(fb); fb.className = 'cl-fb cl-fb--' + tone; ps.filter(Boolean).forEach(p => fb.appendChild(typeof p === 'string' ? el('p', null, p) : p)); };
  function drawHints() {
    clear(hintsEl);
    const r = rec(), n = r.hints, hs = q.hints || [];
    hs.slice(0, n).forEach((h, i) => hintsEl.appendChild(el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    hintBtn.textContent = n >= hs.length ? 'No more hints' : n ? `Next hint (${hs.length - n} left)` : 'Get a hint';
    hintBtn.disabled = n >= hs.length;
    showBtn.hidden = r.correct || r.revealed || !(r.attempts >= 2 || (hs.length && n >= hs.length));
  }
  function hint() { P.hint(q.id, key); drawHints(); }
  function correctText() {
    if (q.type === 'choice') return (q.options.find(x => x.correct) || {}).text || '';
    return q._fields.map(f => (q._fields.length > 1 ? f.label + ': ' : '') + fmt(f.answer, digitsFor(f.tolerance)) + (f.unit ? ' ' + f.unit : '')).join('; ');
  }
  function finish(right, revealed, silent) {
    lock();
    checkBtn.hidden = hintBtn.hidden = showBtn.hidden = true;
    if (q.solution) { clear(sol); sol.append(el('p', { class: 'cl-solution-h' }, right ? 'Why it works' : 'Solution'), el('p', null, q.solution)); sol.hidden = false; }
    const r = rec();
    if (!silent && o.onDone) o.onDone({ correct: right, revealed: !!revealed, attempts: r.attempts, hints: r.hints });
  }
  function grade(ans) {
    if (q.type === 'choice') return checkChoice(q.options, ans);
    const r = checkFields(q._fields, ans);
    return q.type === 'number' ? { ...r.fields[0], fields: r.fields } : r;
  }
  function check() {
    const ans = read();
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
    if (res.fields && res.fields.length > 1) res.fields.filter(f => !f.correct && f.message && f.message !== res.message).forEach(f => msgs.push(`${f.label}: ${f.message}`));
    const right = (res.fields && res.fields.length > 1 ? res.fields : []).filter(f => f.correct).map(f => f.label);
    say('wrong', right.length ? `${right.join(', ')}: right. ` + (msgs[0] || 'Check the other.') : (msgs[0] || 'Not quite.'), ...msgs.slice(1), (q.hints && rec().hints < q.hints.length) ? 'Have another go, or take a hint.' : 'Have another go.');
    drawHints();
  }
  function reveal() { P.reveal(q.id, key); say('info', 'Here’s the full working. Read it through, then carry on.'); finish(false, true); }

  const r0 = rec();
  drawHints();
  if (r0.correct || r0.revealed) { say(r0.correct ? 'right' : 'info', r0.correct ? 'You’ve already got this one.' : 'You looked at the solution for this one.'); finish(r0.correct, r0.revealed, true); }
  return wrap;
}
