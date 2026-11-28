// One question (choice, number or several numbers) with progressive hints,
// feedback that names the mistake, and the full solution only after a real
// try (two attempts, or every hint). Same behaviour as the other labs
// (copied from Berm Lab), plus an optional "your working" box (q.working)
// whose text is saved and sent with the answer.
//
// ask(q, { progress, key, onDone(result) }) -> element
//   q: { id, type, prompt, options | answer+tolerance+unit+traps | fields, hints, solution, skills }
//   type: 'choice' (one answer), 'multi' (tick all that apply), 'number', 'fields',
//         'expression' (typed algebra checked by expr.js: answer, vars, form, traps, tiles),
//         'equation' / 'inequality' (typed relations checked by equation.js), 'line' (a two-variable linear equation, with a form),
//         'interval' (interval notation or an inequality, interval.js),
//         'monomial' (one simplified term, powers.js: answer, vars, positive, traps), 'sci' (scientific notation, scinot.js: answer, form, traps),
//         'factored' (a polynomial in factored form, factor.js: answer, vars, traps)
//   q.inline: choices laid out in a row (tokens of an expression, lines of working)
//   o.revealAnytime: the solution can be shown before two tries (a tutor's choice)

import { el, clear, button, id as uid } from './dom.js';
import { checkFields, checkChoice, checkMulti } from './validate.js';
import { fmt } from './format.js';
import { checkExpression, parse as parseExpr, toText as exprText } from './expr.js';
import { checkEquation, checkInequality, checkLine, parseRelation, joinParts } from './equation.js';
import { checkInterval } from './interval.js';
import { checkMonomial } from './powers.js';
import { checkFactored } from './factor.js';
import { checkSci, parseSci, sciText, plainText } from './scinot.js';

const digitsFor = tol => (tol >= 1 ? 0 : tol >= 0.1 ? 1 : 2);

export function ask(q, o) {
  const P = o.progress, key = o.key || null;
  const rec = () => P.question(q.id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const wrap = el('div', { class: 'ls-ask', 'data-q': q.id });
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' });
  const hintsEl = el('ol', { class: 'ls-hints', 'aria-label': 'Hints' });
  const sol = el('div', { class: 'ls-solution', hidden: true });
  const promptId = uid('qp');
  wrap.appendChild(el('p', { class: 'ls-prompt', id: promptId }, q.prompt));
  // q.figure: an element (or a function returning one) shown under the prompt: a table, graph or map.
  if (q.figure) { const f = typeof q.figure === 'function' ? q.figure() : q.figure; if (f) wrap.appendChild(f); }

  let read, lock, answerText, marks = () => {};
  const area = el('div', { class: 'ls-answer' });
  if (q.type === 'choice') {
    const name = uid('c');
    const fs = el('fieldset', { class: 'ls-choices' + (q.inline ? ' ls-choices--inline' : ''), 'aria-labelledby': promptId }, el('legend', { class: 'ls-sr' }, 'Choose one'),
      q.options.map(op => { const oid = uid('o'); return el('label', { for: oid, class: 'ls-choice' }, el('input', { type: 'radio', id: oid, name, value: op.id }), el('span', null, op.text)); }));
    area.appendChild(fs);
    read = () => { const c = fs.querySelector('input:checked'); return c ? c.value : null; };
    lock = () => fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
    answerText = v => (q.options.find(x => x.id === v) || {}).text || '';
  } else if (q.type === 'multi') {
    const fs = el('fieldset', { class: 'ls-choices' + (q.inline ? ' ls-choices--inline' : ''), 'aria-labelledby': promptId }, el('legend', { class: 'ls-sr' }, 'Tick every answer that applies'),
      q.options.map(op => { const oid = uid('o'); return el('label', { for: oid, class: 'ls-choice' }, el('input', { type: 'checkbox', id: oid, value: op.id }), el('span', null, op.text)); }));
    area.append(el('p', { class: 'ls-small' }, 'Tick every answer that applies.'), fs);
    read = () => [...fs.querySelectorAll('input:checked')].map(i => i.value);
    lock = () => fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
    answerText = v => q.options.filter(x => v.includes(x.id)).map(x => x.text).join('; ');
  } else if (q.type === 'expression' || q.type === 'equation' || q.type === 'inequality' || q.type === 'line' || q.type === 'interval' || q.type === 'monomial' || q.type === 'sci' || q.type === 'factored') {
    const rel = q.type !== 'expression' && q.type !== 'interval' && q.type !== 'monomial' && q.type !== 'sci' && q.type !== 'factored';
    const iid = uid('x'), pid = uid('xp');
    const input = el('input', { id: iid, type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', class: 'ls-input ls-expr-input', 'aria-describedby': pid });
    const preview = el('p', { class: 'ls-small ls-expr-preview', id: pid, 'aria-live': 'polite' });
    const sync = () => { let t = ''; try { if (input.value.trim() && q.type === 'sci') { const v = parseSci(input.value); t = v ? 'Reads as: ' + (v.sci ? `${plainText(v.c, false)} × 10${v.e < 0 ? '⁻' : ''}${String(Math.abs(v.e)).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')}` : plainText(v.value)) : ''; } else if (input.value.trim() && q.type !== 'interval') { if (rel) { const R = parseRelation(input.value, { keepCase: true }); t = 'Reads as: ' + joinParts(R.parts.map(p => exprText(p)), R.rels); } else t = 'Reads as: ' + exprText(parseExpr(input.value, { keepCase: true })); } } catch (e) { t = ''; } preview.textContent = t; };
    input.addEventListener('input', sync);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    const insert = t => { if (input.readOnly) return; const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a; input.setRangeText(t, a, b, 'end'); input.focus(); sync(); };
    const tiles = q.tiles ? el('div', { class: 'ls-expr-tiles', role: 'group', 'aria-label': 'Expression blocks' },
      q.tiles.map(t => el('button', { type: 'button', class: 'ls-expr-tile', onclick: () => insert(t === '×' ? '×' : t === '−' ? '−' : t) }, t)),
      el('button', { type: 'button', class: 'ls-expr-tile ls-expr-tile--key', 'aria-label': 'Delete the last character', onclick: () => { if (input.readOnly) return; input.value = input.value.slice(0, -1); sync(); input.focus(); } }, '⌫'),
      el('button', { type: 'button', class: 'ls-expr-tile ls-expr-tile--key', onclick: () => { if (input.readOnly) return; input.value = ''; sync(); input.focus(); } }, 'Clear')) : null;
    area.append(...[el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: iid }, q.label || (q.type === 'equation' || q.type === 'line' ? 'Your equation' : q.type === 'inequality' ? 'Your inequality' : q.type === 'interval' ? 'Your interval' : q.type === 'sci' ? 'Your number' : 'Your expression')), input), tiles, preview].filter(Boolean));
    read = () => input.value;
    lock = () => { input.readOnly = true; if (tiles) tiles.querySelectorAll('button').forEach(b => { b.disabled = true; }); };
    answerText = v => String(v || '').trim();
  } else {
    const fields = q.type === 'number' ? [{ id: 'v', label: q.label || 'Your answer', answer: q.answer, tolerance: q.tolerance, unit: q.unit, traps: q.traps }] : q.fields;
    const inputs = {};
    const grid = el('div', { class: 'ls-fields' });
    fields.forEach(f => {
      const fid = uid('f');
      inputs[f.id] = el('input', { id: fid, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', class: 'ls-input' });
      inputs[f.id].addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      grid.appendChild(el('div', { class: 'ls-field' }, el('label', { for: fid }, f.label),
        el('span', { class: 'ls-input-unit' }, inputs[f.id], f.unit ? el('span', { class: 'ls-unit' }, f.unit) : null),
        el('span', { class: 'ls-mark', 'data-for': f.id })));
    });
    area.appendChild(grid);
    read = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value]));
    lock = () => Object.values(inputs).forEach(i => { i.readOnly = true; });
    answerText = v => fields.map(f => (fields.length > 1 ? f.label + ': ' : '') + (v[f.id] || '—')).join('; ');
    marks = res => (res.fields || []).forEach(f => {
      const m = grid.querySelector(`[data-for="${f.id}"]`);
      m.textContent = f.code === 'empty' ? '' : f.correct ? '✓ right' : '✗ not yet';
      m.className = 'ls-mark ' + (f.correct ? 'is-right' : f.code === 'empty' ? '' : 'is-wrong');
      inputs[f.id].setAttribute('aria-invalid', f.correct ? 'false' : 'true');
    });
    q._fields = fields;
  }
  wrap.appendChild(area);
  let workBox = null;
  if (q.working) {
    const wid = uid('w');
    workBox = el('textarea', { id: wid, class: 'ls-textarea ls-working', rows: 4, placeholder: 'Show your working: the equation, your numbers, the steps.' });
    workBox.value = P.written(q.id + (key ? '|' + key : '') + ':working');
    workBox.addEventListener('change', () => P.write(q.id + (key ? '|' + key : '') + ':working', workBox.value));
    wrap.appendChild(el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: wid }, 'Your working (saved with your answer)'), workBox));
  }

  const checkBtn = button('Check', check, 'ls-btn--primary');
  const hintBtn = button('Get a hint', hint, 'ls-btn--quiet');
  const showBtn = button('Show the solution', reveal, 'ls-btn--quiet');
  hintBtn.hidden = !(q.hints && q.hints.length);
  showBtn.hidden = true;
  wrap.append(el('div', { class: 'ls-actions' }, checkBtn, hintBtn, showBtn), hintsEl, fb, sol);

  const say = (tone, ...ps) => { clear(fb); fb.className = 'ls-fb ls-fb--' + tone; ps.filter(Boolean).forEach(p => fb.appendChild(typeof p === 'string' ? el('p', null, p) : p)); };
  function drawHints() {
    clear(hintsEl);
    const r = rec(), n = r.hints, hs = q.hints || [];
    hs.slice(0, n).forEach((h, i) => hintsEl.appendChild(el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
    hintBtn.textContent = n >= hs.length ? 'No more hints' : n ? `Next hint (${hs.length - n} left)` : 'Get a hint';
    hintBtn.disabled = n >= hs.length;
    showBtn.hidden = r.correct || r.revealed || !(o.revealAnytime || r.attempts >= 2 || (hs.length && n >= hs.length));
  }
  function hint() { P.hint(q.id, key); drawHints(); }
  function correctText() {
    if (q.type === 'choice') return (q.options.find(x => x.correct) || {}).text || '';
    if (q.type === 'multi') return q.options.filter(x => x.correct).map(x => x.text).join('; ');
    if (q.type === 'expression') { try { return exprText(parseExpr(q.answer)); } catch (e) { return q.answer; } }
    if (q.type === 'monomial' || q.type === 'factored') { try { return exprText(parseExpr(q.answer)); } catch (e) { return q.answer; } }
    if (q.type === 'sci') { const v = parseSci(String(q.answer)); return v ? (q.form === 'standard' ? plainText(v.value) : sciText(v.value)) : String(q.answer); }
    if (q.type === 'equation' || q.type === 'inequality' || q.type === 'line' || q.type === 'interval') return q.answer.replace(/-/g, '−').replace(/<=/g, '≤').replace(/>=/g, '≥');
    return q._fields.map(f => (q._fields.length > 1 ? f.label + ': ' : '') + fmt(f.answer, digitsFor(f.tolerance)) + (f.unit ? ' ' + f.unit : '')).join('; ');
  }
  function finish(right, revealed, silent) {
    lock();
    if (workBox) workBox.readOnly = true;
    checkBtn.hidden = hintBtn.hidden = showBtn.hidden = true;
    if (q.solution) { clear(sol); sol.append(el('p', { class: 'ls-solution-h' }, right ? 'Why it works' : 'Solution'), el('p', null, q.solution)); sol.hidden = false; }
    const r = rec();
    if (!silent && o.onDone) o.onDone({ correct: right, revealed: !!revealed, attempts: r.attempts, hints: r.hints });
  }
  function grade(ans) {
    if (q.type === 'choice') return checkChoice(q.options, ans);
    if (q.type === 'multi') return checkMulti(q.options, ans);
    if (q.type === 'expression') return checkExpression(q, ans);
    if (q.type === 'equation') return checkEquation(q, ans);
    if (q.type === 'inequality') return checkInequality(q, ans);
    if (q.type === 'line') return checkLine(q, ans);
    if (q.type === 'interval') return checkInterval(q, ans);
    if (q.type === 'monomial') return checkMonomial(q, ans);
    if (q.type === 'factored') return checkFactored(q, ans);
    if (q.type === 'sci') return checkSci(q, ans);
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
    if (workBox) P.write(q.id + (key ? '|' + key : '') + ':working', workBox.value);
    const working = workBox && workBox.value.trim() ? ' | Working: ' + workBox.value.trim().slice(0, 600) : '';
    P.attempt(q.id, key, answerText(ans) + working, res.correct, { code: res.code, prompt: q.prompt, correctAnswer: correctText() });
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
