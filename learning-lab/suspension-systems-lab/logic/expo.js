// Suspension & Systems Lab: exponential and logarithmic calculations. One
// calculation layer for every graph, table, readout and answer. Exponentials
// and logs are irrational in general, so values are full-precision floats;
// display rounding happens only at the edge (fmt) and answers are checked
// with tolerances, never against rounded text. Pure; no DOM.

// ---------- exponentials and sequences ----------
export const term = (a, r, n) => a * Math.pow(r, n);                       // aₙ = a·rⁿ (n from 0)
export const terms = (a, r, n) => Array.from({ length: n + 1 }, (_, i) => term(a, r, i));
export function recursive(a, r, n) { const out = [a]; for (let i = 1; i <= n; i++) out.push(out[i - 1] * r); return out; }
export const linear = (a, d, n) => a + d * n;
// Continuous rate equivalent to a factor r per period p: A(t) = a·e^(−kt), k = −ln(r)/p (decay k > 0).
export const decayRate = (r, p = 1) => -Math.log(r) / p;
export const growthRate = (factor, p = 1) => Math.log(factor) / p;
export const envelope = (a, k, t) => a * Math.exp(-k * t);
// Solve a·bˣ = target for x (b > 0, b ≠ 1).
export function solveExp(a, b, target) {
  if (!(a > 0 && b > 0 && b !== 1 && target > 0)) throw new RangeError('needs a > 0, b > 0, b ≠ 1 and a positive target');
  return Math.log(target / a) / Math.log(b);
}
// Solve a·e^(−kt) = target for t.
export const solveEnvelope = (a, k, target) => Math.log(target / a) / -k;
// First whole step where the discrete model has passed the target (decay: below; growth: at or above).
export function firstWhole(a, b, target) {
  const x = solveExp(a, b, target), n = Math.ceil(x - 1e-12);
  // guard against float noise right at a whole number
  const passed = k => (b < 1 ? term(a, b, k) < target : term(a, b, k) >= target - 1e-9);
  return passed(n) ? n : n + 1;
}
export const seriesSum = (a, r, n) => (r === 1 ? a * n : a * (Math.pow(r, n) - 1) / (r - 1));   // first n terms
export const arithSum = (a, d, n) => n * (2 * a + (n - 1) * d) / 2;

// ---------- logarithms ----------
export function logb(x, b = 10) {
  if (!(x > 0)) throw new RangeError('a logarithm needs a positive argument');
  if (!(b > 0 && b !== 1)) throw new RangeError('the base must be positive and not 1');
  const v = b === 10 ? Math.log10(x) : Math.log(x) / Math.log(b);
  const r = Math.round(v);                                       // log₂ 32 is exactly 5, not 4.999…
  return Math.abs(v - r) < 1e-12 ? r : v;
}
export const ln = x => logb(x, Math.E);

// ---------- sound intensity level ----------
export const I0 = 1e-12;                                         // W/m², the reference intensity
export const level = I => 10 * logb(I / I0, 10);                 // L = 10·log₁₀(I/I₀) dB
export const intensity = L => I0 * Math.pow(10, L / 10);         // I = I₀·10^(L/10)
export const combine = (...levels) => level(levels.reduce((s, L) => s + intensity(L), 0));   // intensities add, not decibels
// Scientific notation: { c, e } with 1 ≤ |c| < 10.
export function sci(x) {
  if (x === 0) return { c: 0, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(x))), c = x / Math.pow(10, e);
  if (Math.abs(c) >= 10 - 1e-12) { c /= 10; e += 1; }
  return { c, e };
}

// ---------- display ----------
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '.': '·' };
export const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
export const pow10 = e => `10${sup(e).replace('⁻', '⁻')}`;
export function fmt(x, d = 3) { const v = Number(x.toFixed(d)); return (v < 0 ? '−' : '') + String(Math.abs(v)); }
export function sciText(x, d = 4) { const { c, e } = sci(x); const cc = Number(c.toFixed(d)); return cc === 1 ? pow10(e) : `${fmt(cc, d)} × ${pow10(e)}`; }
