// Jump Trajectory Lab: reading and checking answers.
// Deterministic only. Numbers are compared exactly (with a stated
// tolerance where a decimal of a fraction is acceptable), and wrong answers
// are checked against the usual quadratic misconceptions so the feedback
// can name the idea that went wrong.

const close = (a, b, tol) => Math.abs(a - b) <= tol;

// 3, -3, −3, 2.25, .5, -1/12, 1/12, "- 1 / 12". Returns { ok, value } or { ok: false, empty|unreadable }.
export function parseNumber(raw) {
  const s = String(raw == null ? '' : raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/,/g, '');
  if (!s) return { ok: false, empty: true };
  const num = t => /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
  const m = s.match(/^([+-]?)\(?([+-]?[\d.]+)\/([\d.]+)\)?$/);
  let v;
  if (m) { const n = num(m[2]), d = num(m[3]); if (!isFinite(n) || !isFinite(d) || d === 0) return { ok: false, unreadable: true }; v = (m[1] === '-' ? -1 : 1) * n / d; }
  else v = num(s);
  return isFinite(v) ? { ok: true, value: v } : { ok: false, unreadable: true };
}

// How close counts: exact for whole and half numbers; for a coefficient like
// −1/12 a decimal good to 3 places (−0.083) is accepted too.
export function tolFor(answer, decimalsOk) {
  return decimalsOk && !Number.isInteger(answer * 4) ? 0.0006 : 1e-9;
}

// Check one number. spec = { answer, decimalsOk?, traps?: [{ value, code, message }] }
export function checkNumber(spec, raw) {
  const p = parseNumber(raw);
  if (p.empty) return { correct: false, code: 'empty', message: 'Type an answer first.' };
  if (!p.ok) return { correct: false, code: 'unreadable', message: 'Enter a number like 6, 2.25 or −1/12.' };
  if (close(p.value, spec.answer, tolFor(spec.answer, spec.decimalsOk))) return { correct: true, code: 'correct', value: p.value };
  for (const t of spec.traps || []) if (close(p.value, t.value, 1e-9) || (spec.decimalsOk && close(p.value, t.value, 0.0006))) return { correct: false, code: t.code, message: t.message, value: p.value };
  if (spec.answer !== 0 && close(p.value, -spec.answer, tolFor(spec.answer, spec.decimalsOk))) {
    return { correct: false, code: 'sign', message: 'Right size, wrong sign.', value: p.value };
  }
  return { correct: false, code: 'wrong', message: null, value: p.value };
}

// Several numbers (e.g. the vertex's x and y). fields: [{ id, label, ...spec }]
export function checkFields(fields, inputs, pairTraps) {
  const each = fields.map(f => ({ id: f.id, label: f.label, ...checkNumber(f, (inputs || {})[f.id]) }));
  // Swapped coordinates: x typed where y belongs and the other way round.
  if (pairTraps && each.length === 2 && !each[0].correct && !each[1].correct) {
    const v0 = (parseNumber(inputs[fields[0].id]) || {}).value, v1 = (parseNumber(inputs[fields[1].id]) || {}).value;
    if (close(v0, fields[1].answer, 1e-9) && close(v1, fields[0].answer, 1e-9)) {
      return { correct: false, code: 'swapped-coordinates', fields: each,
        message: 'You have the right two numbers, swapped. The x-coordinate is the horizontal position (how far from takeoff); the y-coordinate is the height.' };
    }
  }
  const firstWrong = each.find(e => !e.correct && e.code !== 'empty' && e.code !== 'wrong' && e.code !== 'correct');
  return { correct: each.every(e => e.correct), fields: each, code: each.every(e => e.correct) ? 'correct' : (firstWrong ? firstWrong.code : 'wrong'), message: firstWrong ? firstWrong.message : null };
}

export function checkChoice(options, chosen) {
  const o = options.find(x => x.id === chosen);
  if (!o) return { correct: false, code: 'empty', message: 'Pick an answer first.' };
  return { correct: !!o.correct, code: o.correct ? 'correct' : (o.code || 'wrong'), message: o.feedback || null };
}

// A clicked point compared with a target, to a grid step. Used for "click the vertex".
export function checkPoint(target, clicked, step, traps) {
  if (!clicked) return { correct: false, code: 'empty', message: 'Click or tap a point on the graph first.' };
  if (close(clicked.x, target.x, step / 2 + 1e-9) && close(clicked.y, target.y, step / 2 + 1e-9)) return { correct: true, code: 'correct' };
  for (const t of traps || []) if (close(clicked.x, t.x, step / 2 + 1e-9) && close(clicked.y, t.y, step / 2 + 1e-9)) return { correct: false, code: t.code, message: t.message };
  return { correct: false, code: 'wrong', message: null };
}

// The misconceptions this lab watches for, in plain words (for tutors later).
export const MISCONCEPTIONS = {
  'swapped-coordinates': 'Confused the vertex coordinates (x and y swapped)',
  'distance-for-height': 'Mixed up horizontal distance and vertical height',
  'max-at-zero': 'Assumed the maximum happens at a zero (takeoff or landing)',
  'zero-for-vertex': 'Confused a zero with the vertex',
  'coefficient-sign': 'Misread the sign of the leading coefficient',
  'width-for-height': 'Confused the width of the parabola with its height',
  'axis-confusion': 'Misunderstood the axis of symmetry',
  'form-confusion': 'Confused what each equation form shows',
  'sign': 'Right size, wrong sign'
};
