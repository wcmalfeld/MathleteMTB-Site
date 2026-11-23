// Newton’s Laws lesson: reading and checking answers. Deterministic, no AI grading.
// Physics answers are decimals, so each has a stated tolerance (enough for
// ordinary rounding). Wrong answers are matched against anticipated
// mistakes ("traps") so the feedback can name the idea that went wrong.

const close = (a, b, tol) => Math.abs(a - b) <= tol;

// 3, -3, −3, 9.19, .5, 1,000, 3/4. Returns { ok, value } or { ok: false, empty|unreadable }.
export function parseNumber(raw) {
  const s = String(raw == null ? '' : raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/,(?=\d{3}(\D|$))/g, '').replace(/,/g, '.')
    .replace(/(°|deg|degrees|m\/s²|m\/s\^2|m\/s|ms-2|km\/h|kmh|kph|%|percent|mm|km|m|min|mins|minutes|n|newtons?|×|x|times)$/i, '');
  if (!s) return { ok: false, empty: true };
  const num = t => /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
  const m = s.match(/^([+-]?)\(?([+-]?[\d.]+)\/([\d.]+)\)?$/);
  let v;
  if (m) { const n = num(m[2]), d = num(m[3]); if (!isFinite(n) || !isFinite(d) || d === 0) return { ok: false, unreadable: true }; v = (m[1] === '-' ? -1 : 1) * n / d; }
  else v = num(s);
  return isFinite(v) ? { ok: true, value: v } : { ok: false, unreadable: true };
}

// A trap matches when the answer is within 1.5% of it (at least 0.01).
const trapTol = v => Math.max(0.01, Math.abs(v) * 0.015);

// spec = { answer, tolerance, traps?: [{ value, code, message }] }
export function checkNumber(spec, raw) {
  const p = parseNumber(raw);
  if (p.empty) return { correct: false, code: 'empty', message: 'Type an answer first.' };
  if (!p.ok) return { correct: false, code: 'unreadable', message: 'Enter a number like 9.2, 41.4 or 1000.' };
  const tol = spec.tolerance === undefined ? 1e-9 : spec.tolerance;
  if (close(p.value, spec.answer, tol)) return { correct: true, code: 'correct', value: p.value };
  for (const t of spec.traps || []) if (close(p.value, t.value, trapTol(t.value)) && !close(t.value, spec.answer, tol)) return { correct: false, code: t.code, message: t.message, value: p.value };
  if (spec.answer !== 0 && close(p.value, -spec.answer, tol)) return { correct: false, code: 'sign', message: 'Right size, wrong sign.', value: p.value };
  const near = Math.abs(p.value - spec.answer) <= Math.max(tol * 4, Math.abs(spec.answer) * 0.03);
  return { correct: false, code: 'wrong', message: near ? 'Close. Check your rounding, or carry more decimal places through.' : null, value: p.value };
}

// Several numbers. fields: [{ id, label, answer, tolerance, traps }]
export function checkFields(fields, inputs) {
  const each = fields.map(f => ({ id: f.id, label: f.label, ...checkNumber(f, (inputs || {})[f.id]) }));
  const firstWrong = each.find(e => !e.correct && e.message && e.code !== 'empty');
  return { correct: each.every(e => e.correct), fields: each, code: each.every(e => e.correct) ? 'correct' : (firstWrong ? firstWrong.code : 'wrong'), message: firstWrong ? firstWrong.message : null };
}

// Select all that apply: right only when exactly the correct options are
// ticked. The feedback names the first wrong pick (its own message) or says
// one is missing.
export function checkMulti(options, chosen) {
  const picked = new Set(chosen || []);
  if (!picked.size) return { correct: false, code: 'empty', message: 'Tick at least one answer first.' };
  const wrongPick = options.find(o => picked.has(o.id) && !o.correct);
  const missed = options.filter(o => o.correct && !picked.has(o.id));
  if (!wrongPick && !missed.length) return { correct: true, code: 'correct', message: null };
  if (wrongPick) return { correct: false, code: wrongPick.code || 'wrong', message: wrongPick.feedback || null };
  return { correct: false, code: 'missed', message: missed.length === 1 ? 'Everything you ticked is right, but one more answer belongs.' : 'Everything you ticked is right, but more answers belong.' };
}

export function checkChoice(options, chosen) {
  const o = options.find(x => x.id === chosen);
  if (!o) return { correct: false, code: 'empty', message: 'Pick an answer first.' };
  return { correct: !!o.correct, code: o.correct ? 'correct' : (o.code || 'wrong'), message: o.feedback || null };
}
