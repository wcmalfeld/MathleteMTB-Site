// Trail Dynamics Lab: exact quadratic algebra. A quadratic ax² + bx + c
// with fraction coefficients (lesson-kit/frac.js); roots come out exactly:
// rational, p ± q√n (n square-free) or p ± qi. Forms, vertex, factoring
// and completing the square all derive from the coefficients, and every
// root is verified by substitution. Pure; no DOM.

import { Frac, show } from '../../lesson-kit/frac.js';
export { Frac, show };
const F = x => Frac.of(x);

// |M| = s²·n with n square-free.
function squareFree(M) {
  let s = 1, n = Math.abs(M);
  for (let p = 2; p * p <= n; p++) while (n % (p * p) === 0) { n /= p * p; s *= p; }
  return { s, n };
}

export function quad(a, b, c) {
  a = F(a); b = F(b); c = F(c);
  if (a.zero) throw new RangeError('a must not be 0 for a quadratic');
  const at = x => a.mul(F(x)).mul(F(x)).add(b.mul(F(x))).add(c);
  const value = x => Number(a) * x * x + Number(b) * x + Number(c);
  const h = b.neg().div(a.mul(2)), k = at(h);
  return { a, b, c, at, value, h, k, disc: b.mul(b).sub(a.mul(c).mul(4)), opens: a.n < 0 ? 'down' : 'up' };
}

// Exact roots of ax² + bx + c = 0.
export function solve(Q) {
  const { a, b, disc } = Q;
  const p = b.neg().div(a.mul(2));                       // −b / 2a
  if (disc.zero) return { type: 'one', disc, p, roots: [p], exact: [p], text: show(p), approx: [Number(p)] };
  const M = disc.n * disc.d, { s, n } = squareFree(M);   // √(disc) = √(M) / d = (s/d)√n
  const q = new Frac(s, disc.d).div(a.mul(2).n < 0 ? a.mul(2).neg() : a.mul(2));   // ± absorbs the sign
  if (disc.n < 0) {
    return { type: 'complex', disc, p, q, n, roots: [], text: cleanComplex(p, q, n), approx: [] };
  }
  if (n === 1) {
    const r = [p.sub(q), p.add(q)].sort((x, y) => Number(x) - Number(y));
    return { type: 'two', rational: true, disc, p, q, n, roots: r, exact: r, text: r.map(show).join(' and '), approx: r.map(Number) };
  }
  const approx = [Number(p) - Number(q) * Math.sqrt(n), Number(p) + Number(q) * Math.sqrt(n)];
  return { type: 'two', rational: false, disc, p, q, n, roots: approx, text: `${nonzero(p)}± ${coefText(q)}√${n}`, approx };
}
const coefText = q => (q.eq(1) ? '' : show(q));
const nonzero = p => (p.zero ? '' : show(p) + ' ');
function cleanComplex(p, q, n) { return `${nonzero(p)}± ${coefText(q)}${n === 1 ? '' : '√' + n}i`.replace('± i', '± i'); }
// Substitution check of every real root (and of complex roots via Vieta).
export function verify(Q, S) {
  if (S.type === 'complex') {
    // roots p ± q√n·i: sum = 2p = −b/a, product = p² + q²n = c/a
    return S.p.mul(2).eq(Q.b.neg().div(Q.a)) && S.p.mul(S.p).add(S.q.mul(S.q).mul(S.n)).eq(Q.c.div(Q.a));
  }
  if (S.rational || S.type === 'one') return S.exact.every(r => Q.at(r).zero);
  return S.approx.every(x => Math.abs(Q.value(x)) < 1e-9 * Math.max(1, Math.abs(Number(Q.c)) + Math.abs(Number(Q.b)) * Math.abs(x)));
}

// ---------- forms ----------
const num = v => show(v);
const signed = (v, first) => { const s = show(v.n < 0 ? v.neg() : v); return (v.n < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ') + s; };
const term = (k, v, first) => (k.zero ? '' : (k.n < 0 ? (first ? '−' : ' − ') : first ? '' : ' + ') + (Math.abs(k.n) === k.d && v ? '' : show(k.n < 0 ? k.neg() : k)) + v);
export function standardText(Q, f = 'f', x = 'x') {
  const s = term(Q.a, x + '²', true) + term(Q.b, x, false) + (Q.c.zero ? '' : signed(Q.c, false));
  return `${f}(${x}) = ${s}`;
}
export function vertexText(Q, f = 'f', x = 'x') {
  const inner = Q.h.zero ? x : `${x} ${Q.h.n < 0 ? '+' : '−'} ${show(Q.h.n < 0 ? Q.h.neg() : Q.h)}`;
  const coef = Q.a.eq(1) ? '' : Q.a.eq(-1) ? '−' : num(Q.a);
  return `${f}(${x}) = ${coef}(${inner})²${Q.k.zero ? '' : signed(Q.k, false)}`;
}
// Factored over the rationals: a(x − r₁)(x − r₂), or null if the roots aren't rational.
export function factoredText(Q, f = 'f', x = 'x') {
  const S = solve(Q);
  if (!(S.type === 'one' || S.rational)) return null;
  const coef = Q.a.eq(1) ? '' : Q.a.eq(-1) ? '−' : num(Q.a);
  const fac = r => (r.zero ? x : `(${x} ${r.n < 0 ? '+' : '−'} ${show(r.n < 0 ? r.neg() : r)})`);
  const rs = S.type === 'one' ? [S.p, S.p] : S.exact;
  if (rs[0].eq(rs[1])) return `${f}(${x}) = ${coef}${fac(rs[0]).startsWith('(') ? fac(rs[0]) + '²' : x + '²'}`;
  // a zero root goes first as a bare x: −0.04x(x − 20)
  const ord = rs[0].zero ? rs : rs[1].zero ? [rs[1], rs[0]] : rs;
  return `${f}(${x}) = ${coef}${fac(ord[0])}${fac(ord[1])}`;
}
// Does a monic integer quadratic factor over the integers?
export function factorsOverIntegers(Q) { const S = solve(Q); return (S.type === 'one' || S.rational) && (S.exact || [S.p]).every(r => r.int); }

// Completing the square for ax² + bx (+ c): the PRD's steps, all derived.
export function completeSquare(Q) {
  const inner = Q.b.div(Q.a);                      // x² + (b/a)x
  const half = inner.div(2), sq = half.mul(half);
  return { factorOut: Q.a, inner, half, square: sq, h: half.neg(), k: Q.c.sub(Q.a.mul(sq)), vertex: [half.neg(), Q.c.sub(Q.a.mul(sq))] };
}

// Height equation: when is Q(x) = y?  Q(x) − y = 0, scaled to monic: x² + (b/a)x + (c − y)/a = 0.
export function atHeight(Q, y) { return quad(1, Q.b.div(Q.a), Q.c.sub(F(y)).div(Q.a)); }
// Line meets parabola: Q(x) = mx + q  →  ax² + (b − m)x + (c − q) = 0
export function meetLine(Q, m, q) { return quad(Q.a, Q.b.sub(F(m)), Q.c.sub(F(q))); }

// ---------- complex numbers (extension) ----------
export const cx = (re, im) => ({ re: F(re), im: F(im) });
export const cadd = (z, w) => cx(z.re.add(w.re), z.im.add(w.im));
export const csub = (z, w) => cx(z.re.sub(w.re), z.im.sub(w.im));
export const cmul = (z, w) => cx(z.re.mul(w.re).sub(z.im.mul(w.im)), z.re.mul(w.im).add(z.im.mul(w.re)));
export const ipow = n => ['1', 'i', '−1', '−i'][((n % 4) + 4) % 4];
export const ctext = z => (z.im.zero ? show(z.re) : `${z.re.zero ? '' : show(z.re) + ' '}${z.re.zero ? (z.im.n < 0 ? '−' : '') : z.im.n < 0 ? '− ' : '+ '}${show(z.im.n < 0 ? z.im.neg() : z.im).replace(/^1$/, '')}i`);
