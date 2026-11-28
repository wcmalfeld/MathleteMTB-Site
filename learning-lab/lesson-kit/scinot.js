// Lesson kit: scientific notation, exactly. Reads 2.016 × 10⁷, 2.016 x 10^7,
// 2.016*10^(7), 2.016e7 and plain numbers (20,160,000 or 0.0000045); every
// value is an exact fraction (frac.js), so nothing drifts. Normalized means
// 1 ≤ |a| < 10. Pure; no DOM.
//
//   parseSci('4.5 × 10⁻⁶')   -> { c: Frac, e: -6, sci: true, value: Frac }  (plain numbers: { value, sci: false })
//   normalize(value)          -> { c, e } with 1 ≤ |c| < 10
//   sciText(x) / plainText(x) -> '4.5 × 10⁻⁶' / '0.0000045'
//   checkSci(spec, raw)       for ask type 'sci': spec = { answer (sci text or number), form: 'sci' | 'standard' | 'either', traps: [{ value, code, message }] }

import { Frac } from './frac.js';
import { fpow, sup } from './powers.js';

const SUPS = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const TEN = new Frac(10);
const p10 = e => fpow(TEN, e);
export function parseSci(raw) {
  let s = String(raw == null ? '' : raw).trim().replace(/[−–]/g, '-').replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => SUPS[c]).join('')).replace(/\s+/g, '');
  s = s.replace(/[×xX*·∙]/g, '*');
  let m = s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\*10\^\(?([+-]?\d+)\)?$/) || s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))[eE]([+-]?\d+)$/);
  if (m) { const c = Frac.parse(m[1]), e = parseInt(m[2], 10); if (c === null || !Number.isFinite(e)) return null; return { c, e, sci: true, value: c.mul(p10(e)) }; }
  m = s.match(/^10\^\(?([+-]?\d+)\)?$/);
  if (m) { const e = parseInt(m[1], 10); return { c: new Frac(1), e, sci: true, value: p10(e) }; }
  if (/^[+-]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$|^[+-]?\.\d+$/.test(s)) { const v = Frac.parse(s.replace(/,/g, '')); return v === null ? null : { value: v, sci: false }; }
  return null;
}
const lt = (a, b) => Number(a.sub(b)) < 0;
export function normalize(v) {
  v = typeof v === 'object' && v instanceof Frac ? v : Frac.of(v);
  if (v.zero) return { c: new Frac(0), e: 0 };
  const neg = v.n < 0; let a = neg ? v.neg() : v, e = 0;
  while (!lt(a, TEN)) { a = a.div(TEN); e++; }
  while (lt(a, new Frac(1))) { a = a.mul(TEN); e--; }
  return { c: neg ? a.neg() : a, e };
}
export const isNormal = c => { const a = c.n < 0 ? c.neg() : c; return !lt(a, new Frac(1)) && lt(a, TEN); };
// A terminating decimal, written out in full: 20,160,000 or 0.0000045.
export function plainText(v, commas = true) {
  v = v instanceof Frac ? v : Frac.of(v);
  let d = v.d, places = 0; while (d % 10 === 0) { d /= 10; places++; } while (d % 2 === 0 || d % 5 === 0) { d = d % 2 === 0 ? d / 2 : d / 5; places++; }
  const s = Number(v).toFixed(Math.min(places, 20)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const [i, f] = s.split('.'), neg = i.startsWith('-'), ii = neg ? i.slice(1) : i;
  return (neg ? '−' : '') + (commas ? ii.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ii) + (f ? '.' + f : '');
}
const coefText = c => plainText(c, false);
export function sciText(x) {
  const n = x instanceof Frac || typeof x === 'number' ? normalize(x) : x;
  return `${coefText(n.c)} × 10${sup(n.e)}`;
}
export const toValue = x => (typeof x === 'string' ? (parseSci(x) || {}).value : x instanceof Frac ? x : Frac.of(x));

export function checkSci(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type a number first.' };
  const mine = parseSci(text), target = toValue(spec.answer), form = spec.form || 'sci';
  if (!mine) return { correct: false, code: 'unreadable', message: 'Write it like 4.5 × 10^-6 (or 4.5e-6), or as an ordinary number.' };
  if (mine.value.eq(target)) {
    if (form === 'sci' && !mine.sci) return { correct: false, code: 'unreadable', message: 'That’s the right value: now write it in scientific notation, a × 10ⁿ.' };
    if (form === 'standard' && mine.sci) return { correct: false, code: 'unreadable', message: 'That’s the right value: now write it as an ordinary number.' };
    if (form === 'sci' && !isNormal(mine.c)) return { correct: false, code: 'not-normalized', message: 'That’s equal, but not normalized: the number in front must be at least 1 and less than 10. Move the decimal point and adjust the exponent to match.' };
    return { correct: true, code: 'correct', message: null };
  }
  for (const t of spec.traps || []) { const tv = toValue(t.value); if (tv && mine.value.eq(tv)) return { correct: false, code: t.code || 'wrong', message: t.message || null }; }
  const N = normalize(target), M = normalize(mine.value);
  if (M.c.eq(N.c) && M.e === -N.e && N.e !== 0) return { correct: false, code: 'exp-sign', message: N.e < 0 ? 'The digits are right, but the exponent’s sign is wrong: numbers smaller than 1 have negative powers of ten.' : 'The digits are right, but the exponent’s sign is wrong: numbers bigger than 10 have positive powers of ten.' };
  if (M.c.eq(N.c)) return { correct: false, code: 'decimal-count', message: `The digits are right, but the size is off by a factor of 10${sup(Math.abs(M.e - N.e))}: count how many places the decimal point moves.` };
  if (mine.sci && M.e === N.e) return { correct: false, code: 'coefficient', message: 'The power of ten is right; check the number in front.' };
  return { correct: false, code: 'wrong', message: null };
}
