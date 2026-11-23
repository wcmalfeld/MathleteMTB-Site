// Lesson kit: exact polynomial algebra (Pump Track Profile Lab, Enduro
// Route Intelligence Lab). A polynomial is an
// array of fraction coefficients from the constant term up:
//   [c0, c1, c2, …] means c0 + c1·x + c2·x² + …
// (lesson-kit/frac.js). Zero coefficients are kept, so missing powers never
// get lost in division. Every operation is exact; every division is checked
// (divisor × quotient + remainder = dividend). Pure; no DOM.

import { Frac, show } from './frac.js';
export { Frac, show };
const F = x => Frac.of(x);

// ---------- construction ----------
export const poly = cs => trim(cs.map(F));                       // from low to high
export const fromHigh = cs => poly(cs.slice().reverse());       // from high to low (how people write them)
export function trim(p) { const q = p.slice(); while (q.length > 1 && q[q.length - 1].zero) q.pop(); return q.length ? q : [F(0)]; }
export const degree = p => (p.length === 1 && p[0].zero ? -Infinity : p.length - 1);
export const leading = p => p[p.length - 1];
export const high = p => p.slice().reverse();                   // coefficients, highest power first
export const isZero = p => p.every(c => c.zero);

// ---------- arithmetic ----------
export function add(p, q) { const n = Math.max(p.length, q.length); return trim(Array.from({ length: n }, (_, i) => (p[i] || F(0)).add(q[i] || F(0)))); }
export const neg = p => p.map(c => c.neg());
export const sub = (p, q) => add(p, neg(q));
export const scale = (k, p) => trim(p.map(c => c.mul(F(k))));
export function mul(p, q) {
  const out = Array.from({ length: p.length + q.length - 1 }, () => F(0));
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] = out[i + j].add(a.mul(b)); }));
  return trim(out);
}
export const equal = (p, q) => isZero(sub(p, q));
export const evalAt = (p, x) => p.reduceRight((s, c) => s.mul(F(x)).add(c), F(0));          // Horner, exact
export const value = (p, x) => p.reduceRight((s, c) => s * x + Number(c), 0);               // for plotting
export const derivative = p => trim(p.slice(1).map((c, i) => c.mul(i + 1)));

// a(x − r₁)(x − r₂)… with multiplicities: roots = [[r, m], …]
export function fromRoots(a, roots) {
  let p = poly([a]);
  for (const [r, m] of roots) for (let k = 0; k < (m || 1); k++) p = mul(p, poly([F(r).neg(), 1]));
  return p;
}

// ---------- division ----------
// Long division with every step: { quotient, remainder, steps: [{ term, product, after }] }
export function longDivide(p, d) {
  if (isZero(d)) throw new RangeError('cannot divide by the zero polynomial');
  let r = p.slice(); const q = Array.from({ length: Math.max(1, p.length - d.length + 1) }, () => F(0)), steps = [];
  while (!isZero(r) && degree(r) >= degree(d)) {
    const k = degree(r) - degree(d), c = leading(r).div(leading(d));
    q[k] = c;
    const termP = Array.from({ length: k + 1 }, (_, i) => (i === k ? c : F(0)));
    const product = mul(termP, d), after = trim(sub(r, product));
    steps.push({ term: termP, product, before: trim(r), after });
    r = after;
  }
  const quotient = trim(q), remainder = trim(r);
  if (!equal(add(mul(d, quotient), remainder), p)) throw new Error('division failed its check');
  return { quotient, remainder, steps };
}
// Synthetic division by (x − k): the table rows, quotient and remainder.
export function synthetic(p, k) {
  const c = high(p), K = F(k), bottom = [], middle = [null];
  c.forEach((a, i) => { if (i === 0) bottom.push(a); else { const m = bottom[i - 1].mul(K); middle.push(m); bottom.push(a.add(m)); } });
  const remainder = bottom[bottom.length - 1], quotient = fromHigh(bottom.slice(0, -1));
  if (!remainder.eq(evalAt(p, K))) throw new Error('synthetic division disagrees with the remainder theorem');
  return { top: c, middle, bottom, quotient, remainder, k: K };
}

// ---------- features ----------
// End behaviour of the full (unrestricted) polynomial.
export function endBehavior(p) {
  const n = degree(p), s = leading(p).n > 0 ? 1 : -1;
  const right = s > 0 ? 'up' : 'down', left = n % 2 === 0 ? right : (right === 'up' ? 'down' : 'up');
  return { left, right, even: n % 2 === 0, positive: s > 0, text: `${left === 'up' ? 'rises' : 'falls'} on the left, ${right === 'up' ? 'rises' : 'falls'} on the right` };
}
export const maxTurning = p => Math.max(0, degree(p) - 1);
// Real roots in [a, b] by sign changes and bisection (for graphs); exact roots come from the factors.
export function realRootsIn(p, a, b, n = 2000) {
  const out = [], f = x => value(p, x);
  let x0 = a, y0 = f(x0);
  if (Math.abs(y0) < 1e-12) out.push(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + (b - a) * i / n, y1 = f(x1);
    if (Math.abs(y1) < 1e-12) out.push(x1);
    else if (y0 * y1 < 0) { let lo = x0, hi = x1; for (let t = 0; t < 60; t++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; } out.push((lo + hi) / 2); }
    x0 = x1; y0 = y1;
  }
  return [...new Set(out.map(x => Math.round(x * 1e9) / 1e9))];
}
// Turning points: where the derivative changes sign (computed, never asked for as calculus).
export function turningPoints(p, a, b) {
  const d = derivative(p);
  return realRootsIn(d, a, b).filter(x => { const e = 1e-4; return value(d, x - e) * value(d, x + e) < 0; }).map(x => [x, value(p, x)]);
}
// Sign on each interval between the given (sorted) zeros, within [a, b].
export function signIntervals(p, zeros, a, b) {
  const pts = [a, ...zeros.filter(z => z > a && z < b), b], out = [];
  for (let i = 0; i < pts.length - 1; i++) { const m = (pts[i] + pts[i + 1]) / 2, v = value(p, m); out.push({ from: pts[i], to: pts[i + 1], sign: v > 0 ? 'above' : v < 0 ? 'below' : 'on' }); }
  return out;
}
// Rational Zero Theorem candidates for integer coefficients: ±p/q.
export function rationalCandidates(p) {
  const c = high(p).map(Number);
  if (!c.every(Number.isInteger)) throw new RangeError('the Rational Zero Theorem needs integer coefficients');
  let lo = 0; while (lo < p.length && p[lo].zero) lo++;            // factor out x first
  const c0 = Math.abs(Number(p[lo])), cn = Math.abs(Number(leading(p)));
  const divs = n => { const out = []; for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i); return out; };
  const set = new Map();
  for (const a of divs(c0)) for (const b of divs(cn)) for (const s of [1, -1]) { const f = new Frac(s * a, b); set.set(String(f), f); }
  return [...set.values()].sort((x, y) => Number(x) - Number(y));
}

// ---------- text ----------
const sup = n => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
export function text(p, v = 'x', opts = {}) {
  const terms = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i]; if (c.zero) continue;
    const mag = c.n < 0 ? c.neg() : c, coef = i > 0 && mag.eq(1) ? '' : show(mag);
    const body = coef + (i === 0 ? '' : i === 1 ? v : v + sup(i));
    terms.push(terms.length ? (c.n < 0 ? ' − ' : ' + ') + body : (c.n < 0 ? '−' : '') + body);
  }
  return terms.length ? terms.join('') : '0';
}
export function factoredText(a, roots, v = 'x') {
  const k = F(a), lead = k.eq(1) ? '' : k.eq(-1) ? '−' : show(k);
  const f = ([r, m]) => { const R = F(r); const base = R.zero ? v : `(${v} ${R.n < 0 ? '+' : '−'} ${show(R.n < 0 ? R.neg() : R)})`; return (m || 1) > 1 ? (R.zero ? v + sup(m) : base + sup(m)) : base; };
  // a bare x goes first, as in 0.005x(x − 2)(x − 6)(x − 8)
  const ordered = roots.slice().sort((p, q) => (F(p[0]).zero ? -1 : F(q[0]).zero ? 1 : Number(p[0]) - Number(q[0])));
  return lead + ordered.map(f).join('');
}
export const termText = (c, i, v = 'x') => (i === 0 ? show(c) : (c.eq(1) ? '' : c.eq(-1) ? '−' : show(c)) + (i === 1 ? v : v + sup(i)));
