// Lesson kit: interval notation and inequalities for domain and range.
// Reads [0, 8], (2, 6], [0, ∞), (−∞, 5), and inequalities such as
// 0 ≤ d ≤ 8 or x > 3 (through equation.js), and compares sets exactly.
// Pure; no DOM.
//   parseInterval('[0, 8]') -> { lo, hi, loIn, hiIn } (lo/hi null for ∞)
//   intervalText(i) -> '[0, 8]'      checkInterval(spec, raw) for ask type 'interval'

import { Frac, show } from './frac.js';
import { parseRelation, solve } from './equation.js';

const S = x => show(Frac.of(x)).replace(/^-/, '−');
const num = t => { const s = t.trim().replace(/[−–]/g, '-').replace(/,/g, ''); if (/^[+-]?(inf|infinity|∞)$/i.test(s)) return s.startsWith('-') ? -Infinity : Infinity; const f = Frac.parse(s); return f; };
export function parseInterval(raw) {
  const s = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
  const m = s.match(/^([[(])\s*([^,;]+?)\s*[,;]\s*([^\])]+?)\s*([\])])$/);
  if (!m) return null;
  const a = num(m[2]), b = num(m[3]);
  if (a === null || b === null) return null;
  const lo = a === -Infinity ? null : a, hi = b === Infinity ? null : b;
  if (a === Infinity || b === -Infinity) return null;
  return { lo, hi, loIn: lo !== null && m[1] === '[', hiIn: hi !== null && m[4] === ']' };
}
// An inequality in one letter, as an interval.
function fromInequality(raw) {
  const set = solve(parseRelation(raw));
  if (set.kind === 'interval') return { lo: set.lo, hi: set.hi, loIn: set.loIn, hiIn: set.hiIn };
  if (set.kind === 'ray') return set.dir === 'left' ? { lo: null, hi: set.at, loIn: false, hiIn: set.closed } : { lo: set.at, hi: null, loIn: set.closed, hiIn: false };
  return null;
}
export const intervalText = i => `${i.loIn ? '[' : '('}${i.lo === null ? '−∞' : S(i.lo)}, ${i.hi === null ? '∞' : S(i.hi)}${i.hiIn ? ']' : ')'}`;
const eqEnd = (a, b) => (a === null || b === null ? a === b : Frac.of(a).eq(b));
export const sameInterval = (a, b) => eqEnd(a.lo, b.lo) && eqEnd(a.hi, b.hi) && a.loIn === b.loIn && a.hiIn === b.hiIn;
// spec = { answer: '[0, 8]' }
export function checkInterval(spec, raw) {
  const t = String(raw == null ? '' : raw).trim();
  if (!t) return { correct: false, code: 'empty', message: 'Type an interval, like [0, 8], or an inequality, like 0 ≤ d ≤ 8.' };
  let mine = /^(all\s+real(\s+numbers)?|all\s+reals|ℝ|R|any\s+(real\s+)?number)$/i.test(t) ? { lo: null, hi: null, loIn: false, hiIn: false } : parseInterval(t);
  if (!mine) { try { mine = fromInequality(t); } catch (e) { mine = null; } }
  if (!mine) return { correct: false, code: 'unreadable', message: 'Write it as an interval, like [0, 8] or (2, 6], or as an inequality, like 0 ≤ d ≤ 8.' };
  const A = parseInterval(spec.answer);
  if (sameInterval(mine, A)) return { correct: true, code: 'correct' };
  if (eqEnd(mine.lo, A.lo) && eqEnd(mine.hi, A.hi)) return { correct: false, code: 'open-closed', message: 'Right endpoints. Check which are included: square brackets [ ] include an endpoint, round brackets ( ) don’t.' };
  if (mine.lo === null && mine.hi === null) return { correct: false, code: 'all-reals', message: 'Not every number makes sense here: what are the real limits on this quantity?' };
  if (eqEnd(mine.lo, A.hi) && eqEnd(mine.hi, A.lo)) return { correct: false, code: 'reversed-interval', message: 'Write the smaller endpoint first.' };
  return { correct: false, code: 'wrong', message: null };
}
