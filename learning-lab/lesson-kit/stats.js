// Lesson kit: descriptive statistics and two-variable data, one calculation
// layer for every table, graph and answer a statistics lab shows. Pure; no
// DOM; floats at full precision (round only for display or grading).
//
// Quartile convention: median of halves. Sort the data; split it into a
// lower and an upper half (with an odd count the median itself belongs to
// neither half); Q1 and Q3 are the medians of those halves. This is the
// usual school convention, and the one every Mathlete lab uses.

// ---------- one variable ----------
export const sum = a => a.reduce((s, x) => s + x, 0);
export const mean = a => sum(a) / a.length;
export const sorted = a => a.slice().sort((x, y) => x - y);
export function median(a) { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
export const range = a => Math.max(...a) - Math.min(...a);
export function halves(a) {
  const s = sorted(a), n = s.length, h = Math.floor(n / 2);
  return { lower: s.slice(0, h), upper: s.slice(n % 2 ? h + 1 : h) };
}
export function quartiles(a) {
  const s = sorted(a), { lower, upper } = halves(a);
  return { q1: median(lower), q2: median(s), q3: median(upper), iqr: median(upper) - median(lower), min: s[0], max: s[s.length - 1] };
}
export const iqr = a => quartiles(a).iqr;
// Everything a box plot or a stats card needs, in one call.
export function summary(a) {
  const q = quartiles(a);
  return { n: a.length, sum: sum(a), mean: mean(a), median: q.q2, min: q.min, q1: q.q1, q3: q.q3, max: q.max, range: q.max - q.min, iqr: q.iqr };
}
// How many values sit at each value (dot-plot stacks), in value order.
export function tally(a) {
  const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1);
  return [...m.entries()].sort((p, q) => p[0] - q[0]).map(([value, count]) => ({ value, count }));
}

// ---------- frequency distributions ----------
// Counts for bins [lo, lo + w), [lo + w, lo + 2w), … up to hi (the last bin
// also keeps a value equal to hi).
export function histogram(a, lo, hi, w) {
  const n = Math.round((hi - lo) / w), out = Array.from({ length: n }, (_, i) => ({ from: lo + i * w, to: lo + (i + 1) * w, count: 0 }));
  for (const x of a) { let i = Math.floor((x - lo) / w + 1e-9); if (i === n && Math.abs(x - hi) < 1e-9) i = n - 1; if (i >= 0 && i < n) out[i].count++; }
  return out;
}
// Whole-number data in equal bins written the school way, 58–62, 63–67, …
// (each bin holds w whole numbers): [{ from: 58, to: 62, count }].
export function wholeBins(a, lo, w, n) {
  return Array.from({ length: n }, (_, i) => { const from = lo + i * w, to = from + w - 1; return { from, to, count: a.filter(x => x >= from && x <= to).length }; });
}
// Is a bin setup usable for a histogram? Bins must be equal width, must
// not overlap, must leave no gaps, and must cover every value.
// bins: [{ from, to }] as whole-number ranges (58–62 means 58 to 62 inclusive).
export function checkBins(bins, data) {
  const w = bins.map(b => b.to - b.from + 1);
  if (w.some(x => x < 1)) return { ok: false, code: 'bin-backwards', message: 'A bin ends before it starts.' };
  for (let i = 1; i < bins.length; i++) {
    if (bins[i].from <= bins[i - 1].to) return { ok: false, code: 'bin-overlap', message: `The bins ${bins[i - 1].from}–${bins[i - 1].to} and ${bins[i].from}–${bins[i].to} overlap: a time of ${bins[i].from} would be counted twice.` };
    if (bins[i].from > bins[i - 1].to + 1) return { ok: false, code: 'bin-gap', message: `There’s a gap between ${bins[i - 1].to} and ${bins[i].from}: a time in between wouldn’t be counted anywhere.` };
  }
  if (new Set(w).size > 1) return { ok: false, code: 'bin-unequal', message: 'The bins have different widths, so taller bars wouldn’t always mean more runs per second of time.' };
  const missed = (data || []).filter(x => !bins.some(b => x >= b.from && x <= b.to));
  if (missed.length) return { ok: false, code: 'bin-missing', message: `Some times aren’t inside any bin (${[...new Set(missed)].join(', ')}).` };
  return { ok: true, code: 'ok', message: null };
}

// ---------- two variables ----------
function centred(xs, ys) {
  if (xs.length !== ys.length || xs.length < 2) throw new Error('paired data needs two equal lists of at least two values');
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return { mx, my, sxy, sxx, syy };
}
// Pearson's correlation coefficient r (between −1 and 1).
export function pearson(xs, ys) { const c = centred(xs, ys); if (!c.sxx || !c.syy) return 0; return c.sxy / Math.sqrt(c.sxx * c.syy); }
// The least-squares line ŷ = intercept + slope·x.
export function regression(xs, ys) {
  const c = centred(xs, ys), slope = c.sxy / c.sxx, intercept = c.my - slope * c.mx;
  return { slope, intercept, r: pearson(xs, ys), xMean: c.mx, yMean: c.my, xRange: [Math.min(...xs), Math.max(...xs)] };
}
export const predict = (line, x) => line.intercept + line.slope * x;
// Residual = actual − predicted (positive: above the line).
export const residual = (line, x, y) => y - predict(line, x);
export const residuals = (line, xs, ys) => xs.map((x, i) => residual(line, x, ys[i]));
// Sum of squared residuals: how far a line misses, overall (the least-squares
// line makes this as small as possible).
export const sse = (line, xs, ys) => sum(residuals(line, xs, ys).map(r => r * r));
export const isExtrapolation = (line, x) => x < line.xRange[0] || x > line.xRange[1];

// ---------- seeded simulations ----------
// The same seed always gives the same numbers (mulberry32).
export function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const standardize = a => { const m = mean(a), sd = Math.sqrt(sum(a.map(x => (x - m) ** 2)) / a.length) || 1; return a.map(x => (x - m) / sd); };
// Two seeded, standardized, exactly uncorrelated lists of n values. Mixing
// them as y = ρ·u + √(1 − ρ²)·v gives points whose correlation is exactly ρ.
export function basis(n, seed) {
  const rnd = seeded(seed), g = () => { const u = Math.max(1e-12, rnd()), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const u = standardize(Array.from({ length: n }, g));
  let v = Array.from({ length: n }, g);
  const k = sum(v.map((x, i) => x * u[i])) / sum(u.map(x => x * x));
  v = standardize(v.map((x, i) => x - k * u[i]));
  return { u, v };
}
// A generated relationship of strength rho: [{ x, y }] in standard units.
export function generated(rho, n = 24, seed = 7) {
  const { u, v } = basis(n, seed), c = Math.max(-1, Math.min(1, rho)), s = Math.sqrt(1 - c * c);
  return u.map((x, i) => ({ x, y: c * x + s * v[i] }));
}
