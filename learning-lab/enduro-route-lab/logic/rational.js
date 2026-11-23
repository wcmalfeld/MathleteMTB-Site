// Enduro Route Intelligence Lab: exact rational expressions and radicals.
// A rational expression is { n, d }: two kit polynomials (lesson-kit/poly.js,
// fraction coefficients, lowest power first). Every operation is exact;
// cancelling remembers the excluded inputs, so a hole is never lost.
// Radicals are simplified exactly (√14656 = 8√229). Pure; no DOM.

import { Frac, show, squareFree } from '../../lesson-kit/frac.js';
import { poly, fromHigh, fromRoots, add as padd, sub as psub, mul as pmul, scale, evalAt as pevalAt, value as pvalue, longDivide, isZero, degree, leading, high, text as ptext, rationalCandidates, synthetic, equal as pequal, trim } from '../../lesson-kit/poly.js';
export { Frac, show, poly, fromHigh, fromRoots, ptext, high, degree };
const F = x => Frac.of(x);

// ---------- polynomial helpers ----------
const monic = p => (isZero(p) ? p : scale(F(1).div(leading(p)), p));
export function pgcd(a, b) {            // monic greatest common divisor (Euclid)
  let x = a, y = b;
  while (!isZero(y)) { const r = longDivide(x, y).remainder; x = y; y = r; }
  return monic(x);
}
const pdiv = (p, q) => { const R = longDivide(p, q); if (!isZero(R.remainder)) throw new Error('not exact'); return R.quotient; };
// Rational roots with multiplicity (integer-coefficient multiple first); what's
// left over (e.g. x² + 1) is returned too.
export function rationalRoots(p) {
  if (degree(p) < 1) return { roots: [], rest: p };
  const L = high(p).reduce((l, c) => l * c.d / gcd(l, c.d), 1), q0 = scale(L, p);
  const roots = []; let q = q0;
  while (degree(q) >= 1 && q[0].zero) { roots.push(F(0)); q = trim(q.slice(1)); }
  let again = true;
  while (again && degree(q) >= 1) {
    again = false;
    for (const c of rationalCandidates(q)) if (synthetic(q, c).remainder.zero) { roots.push(c); q = synthetic(q, c).quotient; again = true; break; }
  }
  const out = new Map();
  for (const r of roots) { const k = String(r); out.set(k, { r, m: (out.get(k)?.m || 0) + 1 }); }
  return { roots: [...out.values()].sort((a, b) => Number(a.r) - Number(b.r)), rest: q };
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }

// ---------- rational expressions ----------
export function rat(n, d, excluded) {
  if (isZero(d)) throw new RangeError('the denominator cannot be the zero polynomial');
  const r = { n: trim(n), d: trim(d) };
  // excluded inputs: every real root of every denominator this came from
  r.excluded = uniq([...(excluded || []), ...rationalRoots(r.d).roots.map(x => x.r)]);
  return r;
}
const uniq = list => { const m = new Map(); list.forEach(x => m.set(String(x), x)); return [...m.values()].sort((a, b) => Number(a) - Number(b)); };
export const ratHigh = (n, d) => rat(fromHigh(n), fromHigh(d));
export const add = (a, b) => rat(padd(pmul(a.n, b.d), pmul(b.n, a.d)), pmul(a.d, b.d), [...a.excluded, ...b.excluded]);
export const sub = (a, b) => rat(psub(pmul(a.n, b.d), pmul(b.n, a.d)), pmul(a.d, b.d), [...a.excluded, ...b.excluded]);
export const mul = (a, b) => rat(pmul(a.n, b.n), pmul(a.d, b.d), [...a.excluded, ...b.excluded]);
export function div(a, b) {
  if (isZero(b.n)) throw new RangeError('cannot divide by zero');
  // dividing also excludes where the divisor is zero
  return rat(pmul(a.n, b.d), pmul(a.d, b.n), [...a.excluded, ...b.excluded, ...rationalRoots(b.n).roots.map(x => x.r)]);
}
export const constant = c => rat(poly([c]), poly([1]));
// Cancel common factors. The result keeps the original excluded inputs, and
// `holes` lists the excluded inputs that are no longer zeros of the denominator.
export function simplify(a) {
  const g = pgcd(a.n, a.d);
  let n = pdiv(a.n, g), d = pdiv(a.d, g);
  const k = F(1).div(leading(d)); n = scale(k, n); d = scale(k, d);       // monic denominator
  const r = { n, d, excluded: a.excluded };
  r.holes = a.excluded.filter(x => !pevalAt(d, x).zero).map(x => ({ x, y: pevalAt(n, x).div(pevalAt(d, x)) }));
  r.vertical = rationalRoots(d).roots.map(x => x.r);
  return r;
}
export function evalAt(a, x) {
  const X = F(x);
  if (a.excluded.some(e => e.eq(X))) return null;            // undefined: excluded input
  const dv = pevalAt(a.d, X);
  return dv.zero ? null : pevalAt(a.n, X).div(dv);
}
export const value = (a, x) => { const d = pvalue(a.d, x); return Math.abs(d) < 1e-12 ? null : pvalue(a.n, x) / d; };
export const equal = (a, b) => pequal(pmul(a.n, b.d), pmul(b.n, a.d));
// Asymptotes and features of the (simplified) function.
export function features(a) {
  const s = simplify(a), dn = degree(s.n), dd = degree(s.d);
  const horizontal = dn < dd ? F(0) : dn === dd ? leading(s.n).div(leading(s.d)) : null;
  const slant = dn === dd + 1 ? longDivide(s.n, s.d).quotient : null;
  const zeros = rationalRoots(s.n).roots.map(x => x.r).filter(x => !a.excluded.some(e => e.eq(x)));
  const yInt = evalAt(a, 0);
  return { simplified: s, vertical: s.vertical, holes: s.holes, horizontal, slant, zeros, yInt, excluded: a.excluded };
}

// ---------- text ----------
export function text(a, v = 'v') { const w = p => br(ptext(p, v)); return isOne(a.d) ? ptext(a.n, v) : `${w(a.n)}/${w(a.d)}`; }
const isOne = p => p.length === 1 && p[0].eq(1);
// Factored text of a polynomial with rational roots: 60(v − 10), v(v − 5).
export function factored(p, v = 'v') {
  const { roots, rest } = rationalRoots(p);
  if (degree(rest) > 0 && roots.length === 0) return ptext(p, v);
  const lin = roots.reduce((acc, { r, m }) => pmul(acc, fromRoots(1, [[r, m]])), poly([1]));
  const c = pdiv(p, lin);                  // constant or leftover factor
  const lead = degree(c) === 0 ? (c[0].eq(1) ? '' : c[0].eq(-1) ? '−' : show(c[0])) : `(${ptext(c, v)})`;
  const sup = m => (m > 1 ? '⁰¹²³⁴⁵⁶⁷⁸⁹'[m] : '');
  const f = roots.map(({ r, m }) => (r.zero ? v + sup(m) : `(${v} ${r.n < 0 ? '+' : '−'} ${show(r.n < 0 ? r.neg() : r)})${sup(m)}`));
  return lead + f.join('');
}
// A sum at the top level needs brackets before it's divided: (v + 5)/v, but v(v − 5) is fine.
const topSum = t => { let depth = 0; for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === '(') depth++; else if (c === ')') depth--; else if (depth === 0 && i > 0 && (c === '+' || c === '−') && t[i - 1] === ' ') return true; } return false; };
const br = t => (topSum(t) ? `(${t})` : t);
// A denominator that is a product gets square brackets: 60(v − 10)/[v(v − 5)].
const brDen = t => (topSum(t) ? `(${t})` : /^\([^()]*\)$|^[^ ()]+$/.test(t) ? t : `[${t}]`);
export function factoredRat(a, v = 'v') { const n = factored(a.n, v); return isOne(a.d) ? n : `${br(n)}/${brDen(factored(a.d, v))}`; }

// ---------- radicals ----------
// √x for a nonnegative fraction, exactly: { coef, rad } meaning coef·√rad, rad square-free.
export function sqrtExact(x) {
  const X = F(x);
  if (X.n < 0) throw new RangeError('even roots need a nonnegative radicand (in the reals)');
  const { s, n } = squareFree(X.n * X.d);                  // √(n/d) = √(n·d)/d
  return { coef: new Frac(s, X.d), rad: n, value: Math.sqrt(Number(X)) };
}
export function surdText(S) {
  if (S.rad === 1) return show(S.coef);
  const c = S.coef.eq(1) ? '' : S.coef.d === 1 ? String(S.coef.n) : show(S.coef);
  return `${c}√${S.rad}`;
}
// Real nth root, exact when the result is rational; odd roots of negatives are fine.
export function nthRoot(x, n) {
  const X = F(x);
  if (n % 2 === 0 && X.n < 0) return null;
  const r = v => { const s = Math.sign(v), t = Math.round(Math.abs(v) ** (1 / n)); return s * t; };
  const a = r(X.n), b = Math.round(X.d ** (1 / n));
  if (a ** n === X.n && b ** n === X.d) return new Frac(a, b);
  return null;
}
// x^(p/q) exactly when it is rational: (ⁿ√x)^p.
export function ratPow(x, p, q) { const root = nthRoot(x, q); if (!root) return null; let out = F(1); for (let i = 0; i < Math.abs(p); i++) out = out.mul(root); return p < 0 ? F(1).div(out) : out; }
