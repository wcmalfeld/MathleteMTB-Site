// Slope & Linear Relationships Lab: checking answers.
// Deterministic only: every answer is a number, a choice, or points on a
// line, compared exactly (or to a stated rounding). When an answer is wrong
// we look for the usual mistakes and explain the idea behind them.

import { close, isNum, clean, onLine } from './slope.js';

// Read what a student typed. Accepts 0.25, .25, -3, −3, 1,200, 3/4, -3/4,
// 20%, and the word "undefined". Returns { ok, value, percent, fraction, undefined }.
export function parseAnswer(raw) {
  const s = String(raw == null ? '' : raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
  if (!s) return { ok: false, empty: true };
  if (/^(undefined|undef|und|none|nosolution|dne)$/i.test(s)) return { ok: true, undefined: true };
  const percent = /%$/.test(s);
  const body = percent ? s.slice(0, -1) : s;
  const num = t => /^[+-]?(\d{1,3}(,\d{3})+|\d+)?(\.\d+)?$/.test(t) && /\d/.test(t) ? Number(t.replace(/,/g, '')) : NaN;
  let value, fraction = false;
  const m = body.match(/^([+-]?[\d.,]+)\/([+-]?[\d.,]+)$/);
  if (m) {
    const n = num(m[1]), d = num(m[2]);
    if (!isNum(n) || !isNum(d)) return { ok: false };
    if (d === 0) return { ok: false, divideByZero: true };
    value = clean(n / d); fraction = true;
  } else {
    value = num(body);
  }
  if (!isNum(value)) return { ok: false };
  return { ok: true, value, percent, fraction };
}

// How close counts as right. `places`: the answer may be rounded to that many
// decimals. Otherwise it must be exact (allowing for floating-point noise).
export function tolerance(spec) {
  if (isNum(spec.tol)) return spec.tol;
  if (isNum(spec.places)) return 0.5 * Math.pow(10, -spec.places) + 1e-9;
  return 1e-9;
}

// Check one number. spec = {
//   answer: number | 'undefined',
//   format: 'slope' (a plain number, not a percent) | 'percent' (a percentage grade) | 'number',
//   places?, tol?, inverse?: true when run/rise is a likely mistake,
//   traps?: [{ value, message }]  specific wrong answers and what to say,
//   noun?: what the number is ("the slope", "the run")
// }
export function checkNumber(spec, raw) {
  const p = parseAnswer(raw);
  const result = (correct, code, message) => ({ correct, code, message, value: p.ok ? (p.undefined ? 'undefined' : p.value) : null });
  if (p.empty) return result(false, 'empty', 'Type an answer first.');
  if (p.divideByZero) return result(false, 'divide-by-zero', 'You can’t divide by zero. If the run is 0, the slope is undefined (type “undefined”).');
  if (!p.ok) return result(false, 'unreadable', 'Enter a number such as 0.25, −3 or 3/4' + (spec.format === 'percent' ? ', or a percentage such as 12%.' : '.'));

  if (spec.answer === 'undefined') {
    if (p.undefined) return result(true, 'correct');
    return result(false, 'should-be-undefined', p.value === 0
      ? 'A slope of 0 means a flat line (no rise). Here the run is 0: the line goes straight up and down.'
      : 'Look at the run (the change in x). What happens when you divide by it?');
  }
  if (p.undefined) return result(false, 'not-undefined', 'This line isn’t vertical, so its slope is a number. Undefined slope only happens when the run is 0.');

  if (spec.format === 'slope' && p.percent) {
    return result(false, 'percent-given', 'That’s written as a percentage. Give the slope as a plain number: a 20% grade is a slope of 0.2.');
  }
  const v = p.value, a = spec.answer, tol = tolerance(spec);
  if (close(v, a, tol)) return result(true, 'correct');

  for (const t of spec.traps || []) {
    if (close(v, t.value, Math.max(tol, 1e-9))) return result(false, 'trap', t.message);
  }
  if (spec.format === 'percent' && a !== 0 && close(v * 100, a, tol)) {
    return result(false, 'decimal-for-percent', `${fmtPlain(v)} is the slope as a decimal. A grade is a percentage: multiply by 100.`);
  }
  if (spec.format === 'slope' && a !== 0 && close(v / 100, a, tol)) {
    return result(false, 'percent-for-slope', `That looks like a percentage grade. The slope itself is that number divided by 100.`);
  }
  if (a !== 0 && close(v, -a, tol)) {
    return result(false, 'sign', 'Right size, wrong sign. Does the line go up or down as x increases (left to right)?');
  }
  if (spec.inverse && a !== 0 && close(v, 1 / a, Math.max(tol, 1e-6))) {
    return result(false, 'inverted', 'That looks like run ÷ rise. Slope is rise ÷ run: the vertical change goes on top.');
  }
  if (isNum(spec.places) && close(v, a, 0.5 * Math.pow(10, -(spec.places - 1)) + 1e-9) && spec.places > 0) {
    return result(false, 'rounding', `Close. Round to ${spec.places === 1 ? 'one decimal place' : spec.places + ' decimal places'}.`);
  }
  return result(false, 'wrong', null);
}

function fmtPlain(v) { return String(clean(v)).replace('-', '−'); }

// Several numbers at once (rise and run, m and b, table cells).
// fields: [{ id, label, ...numberSpec }]; inputs: { id: raw }.
export function checkFields(fields, inputs) {
  const each = fields.map(f => ({ id: f.id, label: f.label, ...checkNumber(f, (inputs || {})[f.id]) }));
  return { correct: each.every(e => e.correct), fields: each };
}

// A multiple-choice answer. options: [{ id, correct?, feedback? }].
export function checkChoice(options, chosenId) {
  const o = options.find(x => x.id === chosenId);
  if (!o) return { correct: false, code: 'empty', message: 'Pick an answer first.' };
  return { correct: !!o.correct, code: o.correct ? 'correct' : 'wrong', message: o.feedback || null };
}

// Two points placed on a grid for the line `line` ({ m, b } or { vertical, x }).
export function checkPlot(line, points) {
  if (!points || points.length < 2) return { correct: false, code: 'empty', message: 'Place two points on the grid.' };
  const [p, q] = points;
  if (p.x === q.x && p.y === q.y) return { correct: false, code: 'same-point', message: 'Use two different points.' };
  const okP = onLine(line, p), okQ = onLine(line, q);
  if (okP && okQ) return { correct: true, code: 'correct' };
  if (okP || okQ) return { correct: false, code: 'one-point', message: `(${fmtPlain(okP ? q.x : p.x)}, ${fmtPlain(okP ? q.y : p.y)}) isn’t on the line. Check it with the equation: put in the x and see what y comes out.` };
  if (!line.vertical) {
    // Same slope, wrong intercept? Or right intercept, wrong slope?
    const mPlaced = p.x === q.x ? null : clean((q.y - p.y) / (q.x - p.x));
    if (mPlaced !== null && close(mPlaced, line.m)) return { correct: false, code: 'intercept', message: 'Your line has the right slope but crosses the y-axis in the wrong place. Where is the line when x = 0?' };
    if (mPlaced !== null && close(mPlaced, -line.m)) return { correct: false, code: 'sign', message: 'Your line slopes the wrong way. A positive slope goes up from left to right; a negative one goes down.' };
  }
  return { correct: false, code: 'wrong', message: 'Neither point is on the line. Start with the y-intercept (x = 0), then use the slope to step to a second point.' };
}
