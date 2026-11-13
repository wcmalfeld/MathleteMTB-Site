// One question: prompt, picture, answer controls, progressive hints,
// feedback that explains the idea, and the full solution once it's right
// (or when the student asks to see it after trying).
//
// renderQuestion(q, { progress, kicker, onNext, nextLabel }) -> element

import { el, clear, button, id } from './dom.js';
import { createGraph } from './graph.js';
import { createProfile } from './profile.js';
import { checkNumber, checkFields, checkChoice, checkPlot } from '../logic/validate.js';
import { fmt, niceStep } from '../logic/slope.js';

export function diagramFor(d) {
  if (!d) return null;
  if (d.kind === 'profile') {
    const p = createProfile();
    p.update({ start: d.start.y, end: d.end.y, run: d.end.x - d.start.x, unit: d.unit, schematic: true, show: ['start', 'end', 'direction'] });
    return el('div', { class: 'sl-diagram' }, p.node);
  }
  if (d.kind === 'graph') {
    const g = createGraph({
      x: { min: d.x[0], max: d.x[1], step: d.step || niceStep(d.x[1] - d.x[0], 10), label: d.xLabel || 'x' },
      y: { min: d.y[0], max: d.y[1], step: d.step || niceStep(d.y[1] - d.y[0], 10), label: d.yLabel || 'y' },
      lines: d.lines, points: d.points, ticks: d.ticks
    });
    return el('div', { class: 'sl-diagram sl-diagram--graph' }, g.node);
  }
  if (d.kind === 'table') return el('div', { class: 'sl-diagram' }, table(d.headers, d.rows));
  return null;
}

export function table(headers, rows, caption) {
  return el('table', { class: 'sl-table' },
    caption ? el('caption', null, caption) : null,
    el('thead', null, el('tr', null, headers.map(h => el('th', { scope: 'col' }, h)))),
    el('tbody', null, rows.map(r => el('tr', null, r.map(c => el('td', { class: c === '?' ? 'sl-missing' : typeof c === 'number' || /^[+−-]?[\d,.]+$/.test(String(c)) ? 'sl-num' : null }, c === '?' ? '?' : (typeof c === 'number' ? fmt(c) : c)))))));
}

const LEVEL = { 1: 'Foundations', 2: 'Application', 3: 'Challenge' };

export function renderQuestion(q, opts) {
  const progress = opts.progress;
  const rec = () => progress.question(q.id) || { attempts: 0, hints: 0, correct: false, revealed: false, answers: [] };
  const wrap = el('article', { class: 'sl-q', 'aria-labelledby': q.id + '-prompt' });
  const feedback = el('div', { class: 'sl-feedback', role: 'status', 'aria-live': 'polite' });
  const hintList = el('ol', { class: 'sl-hints', 'aria-label': 'Hints' });
  const solution = el('div', { class: 'sl-solution', hidden: true });

  wrap.appendChild(el('p', { class: 'sl-kicker' }, (opts.kicker || LEVEL[q.level]) + ' · ' + q.skill));
  wrap.appendChild(el('h3', { class: 'sl-prompt', id: q.id + '-prompt' }, q.prompt));
  if (q.math) wrap.appendChild(el('ul', { class: 'sl-math-lines' }, q.math.map(m => el('li', null, m))));
  const dia = diagramFor(q.diagram);
  if (dia) wrap.appendChild(dia);

  // ---- answer controls ----
  let read, lock, showFieldMarks = () => {};
  const area = el('div', { class: 'sl-answer' });
  if (q.type === 'number') {
    const inputId = id('ans');
    const input = el('input', { id: inputId, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', class: 'sl-input', 'aria-describedby': q.id + '-fmt' });
    const row = el('div', { class: 'sl-input-row' },
      el('label', { for: inputId }, 'Your answer'),
      el('span', { class: 'sl-input-unit' }, input, q.unit ? el('span', { class: 'sl-unit' }, q.unit) : null));
    if (q.undefinedButton) row.appendChild(button('Undefined', () => { input.value = 'undefined'; input.focus(); }, 'sl-btn--quiet'));
    area.appendChild(row);
    area.appendChild(el('p', { class: 'sl-format', id: q.id + '-fmt' },
      q.format === 'percent' ? 'Type a percentage, like 12 or 12%.' : q.format === 'slope' ? 'Type a number or a fraction, like 0.25, −3 or 3/4.' + (q.undefinedButton ? ' If there’s no number, choose Undefined.' : '') : 'Type a number, like 750 or −3.'));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    read = () => input.value;
    lock = () => { input.readOnly = true; };
  } else if (q.type === 'fields') {
    const inputs = {};
    const grid = el('div', { class: 'sl-fields' });
    q.fields.forEach(f => {
      const fid = id('f');
      inputs[f.id] = el('input', { id: fid, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', class: 'sl-input' });
      inputs[f.id].addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      grid.appendChild(el('div', { class: 'sl-field' }, el('label', { for: fid }, f.label),
        el('span', { class: 'sl-input-unit' }, inputs[f.id], f.unit ? el('span', { class: 'sl-unit' }, f.unit) : null),
        el('span', { class: 'sl-field-mark', 'data-for': f.id, 'aria-live': 'polite' })));
    });
    area.appendChild(grid);
    area.appendChild(el('p', { class: 'sl-format' }, 'Numbers or fractions, like 0.06, −4 or 3/4.'));
    read = () => Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value]));
    lock = () => Object.values(inputs).forEach(i => { i.readOnly = true; });
    showFieldMarks = res => res.fields.forEach(f => {
      const m = grid.querySelector(`[data-for="${f.id}"]`);
      m.textContent = f.correct ? '✓ right' : (f.code === 'empty' ? '' : '✗ not yet');
      m.className = 'sl-field-mark ' + (f.correct ? 'is-right' : 'is-wrong');
      inputs[f.id].setAttribute('aria-invalid', f.correct ? 'false' : 'true');
    });
  } else if (q.type === 'choice') {
    const name = id('choice');
    const fs = el('fieldset', { class: 'sl-choices' }, el('legend', { class: 'sl-sr' }, 'Choose one answer'));
    q.options.forEach(o => {
      const oid = id('opt');
      fs.appendChild(el('label', { for: oid, class: 'sl-choice' },
        el('input', { type: 'radio', name, id: oid, value: o.id }),
        o.table ? el('span', null, table(['x', 'y'], o.table.x.map((x, i) => [x, o.table.y[i]]))) : el('span', null, o.text)));
    });
    area.appendChild(fs);
    read = () => { const c = fs.querySelector('input:checked'); return c ? c.value : null; };
    lock = () => fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
  } else if (q.type === 'plot') {
    let pts = [];
    const status = el('p', { class: 'sl-format', 'aria-live': 'polite' }, 'Click or tap two grid points. With a keyboard: focus the grid, move with the arrow keys, press Enter to place.');
    const g = createGraph({
      x: { min: q.grid.x[0], max: q.grid.x[1], step: 1, label: 'x' }, y: { min: q.grid.y[0], max: q.grid.y[1], step: 1, label: 'y' },
      title: 'Grid for placing two points',
      pick: { max: 2, snap: 1, labels: ['A', 'B'], onPick: p => { pts = p; status.textContent = p.length < 2 ? `A = (${fmt(p[0].x)}, ${fmt(p[0].y)}). Place B.` : `A = (${fmt(p[0].x)}, ${fmt(p[0].y)}), B = (${fmt(p[1].x)}, ${fmt(p[1].y)}).`; } }
    });
    area.appendChild(el('div', { class: 'sl-diagram sl-diagram--graph' }, g.node));
    area.appendChild(status);
    area.appendChild(button('Clear points', () => { pts = []; g.setPicked([]); status.textContent = 'Points cleared. Place two points.'; }, 'sl-btn--quiet'));
    read = () => pts.slice();
    lock = () => g.update({ pick: null, lines: [q.line], points: pts });
  }
  wrap.appendChild(area);

  // ---- actions ----
  const checkBtn = button('Check', check, 'sl-btn--primary');
  const hintBtn = button('Get a hint', hint, 'sl-btn--quiet');
  const showBtn = button('Show me the solution', reveal, 'sl-btn--quiet');
  showBtn.hidden = true;
  const nextBtn = button(opts.nextLabel || 'Next question', () => opts.onNext && opts.onNext(), 'sl-btn--primary');
  nextBtn.hidden = true;
  const actions = el('div', { class: 'sl-actions' }, checkBtn, hintBtn, showBtn, nextBtn);
  wrap.appendChild(actions);
  wrap.appendChild(hintList);
  wrap.appendChild(feedback);
  wrap.appendChild(solution);

  function say(tone, ...parts) { clear(feedback); feedback.className = 'sl-feedback' + (tone ? ' sl-feedback--' + tone : ''); parts.forEach(p => p && feedback.appendChild(typeof p === 'string' ? el('p', null, p) : p)); }
  function drawHints() {
    clear(hintList);
    const n = rec().hints;
    q.hints.slice(0, n).forEach((h, i) => hintList.appendChild(el('li', null, el('span', { class: 'sl-hint-n' }, 'Hint ' + (i + 1) + ': '), h)));
    hintBtn.textContent = n >= q.hints.length ? 'No more hints' : n ? `Another hint (${q.hints.length - n} left)` : 'Get a hint';
    hintBtn.disabled = n >= q.hints.length;
    const r = rec();
    showBtn.hidden = !(r.attempts >= 2 || n >= q.hints.length) || r.correct || r.revealed;
  }
  function hint() { progress.hint(q); drawHints(); const last = hintList.lastElementChild; if (last) last.setAttribute('tabindex', '-1'); }
  function finish(right, silent) {
    lock();
    checkBtn.hidden = true; hintBtn.hidden = true; showBtn.hidden = true;
    clear(solution);
    solution.appendChild(el('h4', null, right ? 'Why it works' : 'Solution'));
    solution.appendChild(el('p', null, q.explanation));
    solution.hidden = false;
    nextBtn.hidden = !opts.onNext;
    if (opts.onDone && !silent) opts.onDone(right);
  }
  function snapshot(ans) {
    if (q.type === 'plot') return ans.map(p => `(${p.x}, ${p.y})`).join(' ');
    if (q.type === 'fields') return q.fields.map(f => `${f.label}: ${ans[f.id] || '—'}`).join('; ');
    if (q.type === 'choice') { const o = q.options.find(x => x.id === ans); return o ? (o.text || 'table ' + o.id) : ''; }
    return String(ans);
  }
  function check() {
    const ans = read();
    let res;
    if (q.type === 'number') res = checkNumber(q, ans);
    else if (q.type === 'fields') { res = checkFields(q.fields, ans); showFieldMarks(res); }
    else if (q.type === 'choice') res = checkChoice(q.options, ans);
    else res = checkPlot(q.line, ans);
    const empty = res.code === 'empty' || (res.fields && res.fields.every(f => f.code === 'empty'));
    if (empty) { say('info', res.message || 'Fill in an answer first.'); return; }
    if (res.code === 'unreadable' || res.code === 'divide-by-zero' || (res.fields && res.fields.some(f => f.code === 'unreadable'))) {
      say('info', res.message || res.fields.find(f => f.code === 'unreadable').message); return;   // not counted: we couldn't read it
    }
    progress.recordAttempt(q, snapshot(ans), res.correct, { code: res.code });
    if (res.correct) {
      say('right', rec().attempts === 1 && !rec().hints ? 'Right, first try.' : 'Right.');
      finish(true);
      return;
    }
    let msg = res.message;
    if (res.fields) {
      const wrong = res.fields.filter(f => !f.correct);
      const specific = wrong.map(f => f.message ? `${f.label}: ${f.message}` : null).filter(Boolean);
      msg = specific.length ? specific.join(' ') : null;
      const right = res.fields.filter(f => f.correct).map(f => f.label);
      if (right.length && wrong.length) msg = `${right.join(' and ')} ${right.length === 1 ? 'is' : 'are'} right. ` + (msg || '');
    }
    say('wrong', msg || 'Not quite.', el('p', { class: 'sl-concept' }, q.concept), 'Have another go' + (rec().hints < q.hints.length ? ', or take a hint.' : '.'));
    drawHints();
  }
  function reveal() {
    progress.reveal(q);
    say('info', 'Here’s how it works. Read it through, then try a similar question.');
    if (q.type === 'plot') lock();
    finish(false);
  }

  // Already finished earlier (coming back to it)
  const r0 = rec();
  if (r0.correct || r0.revealed) {
    const last = r0.answers[r0.answers.length - 1];
    say(r0.correct ? 'right' : 'info', r0.correct ? `You got this one${r0.firstTry ? ' on the first try' : ''}.` + (last ? ' Your answer: ' + last.answer : '') : 'You looked at the solution for this one.');
    drawHints();
    finish(r0.correct, true);
  } else drawHints();
  return wrap;
}
