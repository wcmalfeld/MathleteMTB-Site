// Enduro Race Intelligence Lab: the probability and statistics engine. One
// calculation layer for every table, graph, simulation and answer. Table
// probabilities are exact fractions (lesson-kit/frac.js); descriptive
// statistics, the normal model and simulations are floats. Every simulation
// uses a seeded generator, so the same seed always gives the same result.
// Pure; no DOM.

import { Frac, show } from '../../lesson-kit/frac.js';
export { Frac, show };

// ---------- two-way tables ----------
// t = { rows: ['Dry', 'Wet'], cols: ['Hit', 'Missed'], cells: [[84, 36], [40, 40]] }
export function twoWay(t) {
  const rowTot = t.cells.map(r => r.reduce((s, x) => s + x, 0)), colTot = t.cols.map((_, j) => t.cells.reduce((s, r) => s + r[j], 0));
  const total = rowTot.reduce((s, x) => s + x, 0);
  if (colTot.reduce((s, x) => s + x, 0) !== total) throw new Error('table totals disagree');
  const P = n => new Frac(n, total);
  return {
    ...t, rowTot, colTot, total,
    joint: (i, j) => P(t.cells[i][j]),                          // P(row i and col j)
    row: i => P(rowTot[i]), col: j => P(colTot[j]),             // marginals
    colGivenRow: (j, i) => new Frac(t.cells[i][j], rowTot[i]),  // P(col j | row i)
    rowGivenCol: (i, j) => new Frac(t.cells[i][j], colTot[j]),  // P(row i | col j)
    union: (i, j) => P(rowTot[i] + colTot[j] - t.cells[i][j]),  // P(row i or col j)
    independent: (i, j) => P(t.cells[i][j]).eq(P(rowTot[i]).mul(P(colTot[j])))
  };
}

// ---------- descriptive statistics ----------
export const sum = a => a.reduce((s, x) => s + x, 0);
export const mean = a => sum(a) / a.length;
export function median(a) { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
export const range = a => Math.max(...a) - Math.min(...a);
export const popSD = a => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / a.length); };
export const sampleSD = a => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - 1)); };
// Quartiles by the median-of-halves method (the usual school convention).
export function quartiles(a) {
  const s = a.slice().sort((x, y) => x - y), n = s.length, h = Math.floor(n / 2);
  const lo = s.slice(0, h), hi = s.slice(n % 2 ? h + 1 : h);
  return { q1: median(lo), q2: median(s), q3: median(hi), iqr: median(hi) - median(lo), min: s[0], max: s[n - 1] };
}
// Histogram counts for bins [lo, lo + w), …
export function histogram(a, lo, hi, w) {
  const n = Math.round((hi - lo) / w), out = Array.from({ length: n }, (_, i) => ({ from: lo + i * w, to: lo + (i + 1) * w, count: 0 }));
  for (const x of a) { let i = Math.floor((x - lo) / w + 1e-9); if (i === n && Math.abs(x - hi) < 1e-9) i = n - 1; if (i >= 0 && i < n) out[i].count++; }
  return out;
}

// ---------- the normal model ----------
// erf by series (|x| < 2.5) and continued fraction (beyond): accurate to ~1e-12.
function erf(x) {
  const s = Math.sign(x), z = Math.abs(x);
  if (z < 2.5) { let term = z, total = z; for (let n = 1; n < 80; n++) { term *= -z * z / n; total += term / (2 * n + 1); } return s * 2 / Math.sqrt(Math.PI) * total; }
  let f = 0; for (let k = 60; k >= 1; k--) f = k / 2 / (z + f);
  return s * (1 - Math.exp(-z * z) / Math.sqrt(Math.PI) / (z + f));
}
export const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));                       // standard normal CDF
export const normalCdf = (x, mu, sigma) => Phi((x - mu) / sigma);
export const normalPdf = (x, mu, sigma) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
export const zScore = (x, mu, sigma) => (x - mu) / sigma;
export const EMPIRICAL = Object.freeze([[1, 68], [2, 95], [3, 99.7]]);

// ---------- sampling and inference ----------
export const phat = (x, n) => x / n;
export const se = (p, n) => Math.sqrt(p * (1 - p) / n);
export const Z95 = 1.96;
export const moe = (p, n, z = Z95) => z * se(p, n);
export const interval = (p, n, z = Z95) => [p - moe(p, n, z), p + moe(p, n, z)];

// Seeded generator (mulberry32): the same seed always gives the same sequence.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffleInPlace(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// A simple random sample of n indices from 0..N−1 (without replacement).
export function sampleIndices(N, n, r) {
  if (n > N) throw new RangeError('sample larger than population');
  const idx = Array.from({ length: N }, (_, i) => i);
  for (let i = 0; i < n; i++) { const j = i + Math.floor(r() * (N - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, n);
}
// A population of N riders, the first `yes` preferring flow (1), the rest technical (0), in a seeded random order.
export const population = (N, yes, seed = 7) => shuffleInPlace(Array.from({ length: N }, (_, i) => (i < yes ? 1 : 0)), rng(seed));
export function samplingDistribution(pop, n, reps, seed) {
  const r = rng(seed), out = [];
  for (let k = 0; k < reps; k++) out.push(mean(sampleIndices(pop.length, n, r).map(i => pop[i])));
  return out;
}

// Randomization test for a difference in means (B − A), two-sided.
export function permutationTest(A, B, reps = 50000, seed = 2026) {
  const all = A.concat(B), tot = sum(all), nA = A.length, nB = B.length, obs = mean(B) - mean(A), r = rng(seed), a = all.slice(), diffs = new Float64Array(reps);
  let extreme = 0;
  for (let k = 0; k < reps; k++) {
    shuffleInPlace(a, r);
    let s = 0; for (let i = 0; i < nA; i++) s += a[i];
    const d = (tot - s) / nB - s / nA;
    diffs[k] = d;
    if (Math.abs(d) >= Math.abs(obs) - 1e-9) extreme++;
  }
  return { observed: obs, p: extreme / reps, extreme, reps, diffs };
}

// ---------- counting ----------
export function factorial(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }
export const nPr = (n, r) => factorial(n) / factorial(n - r);
export const nCr = (n, r) => nPr(n, r) / factorial(r);

// ---------- display ----------
export function fmt(x, d = 3) { const v = Number(x.toFixed(d)); return (v < 0 ? '−' : '') + String(Math.abs(v)); }
export const pct = (x, d = 1) => fmt(x * 100, d) + '%';
