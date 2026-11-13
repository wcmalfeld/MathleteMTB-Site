// Slope & Linear Relationships Lab: the mathematics.
// Pure functions only (no DOM), so every screen uses the same tested
// calculations. Tested by scripts/test-slope-lab.mjs.

export const EPS = 1e-9;
export const FT_PER_M = 3.28084;

// Remove floating-point noise: 0.1 + 0.2 -> 0.3, 120 / 600 -> 0.2.
export function clean(x) {
  if (typeof x !== 'number' || !isFinite(x)) return x;
  const r = Number(x.toPrecision(12));
  return Object.is(r, -0) ? 0 : r;
}

export function isNum(x) { return typeof x === 'number' && isFinite(x); }

export function close(a, b, tol = EPS) { return isNum(a) && isNum(b) && Math.abs(a - b) <= tol; }

// Vertical change from y1 to y2, horizontal change from x1 to x2.
export function rise(y1, y2) { return clean(y2 - y1); }
export function run(x1, x2) { return clean(x2 - x1); }

// The kind of slope a rise and run make.
//   positive | negative | zero | undefined (run 0, rise not 0) | none (no change at all)
export function slopeKind(riseV, runV) {
  if (!isNum(riseV) || !isNum(runV)) return 'invalid';
  if (runV === 0) return riseV === 0 ? 'none' : 'undefined';
  if (riseV === 0) return 'zero';
  return (riseV > 0) === (runV > 0) ? 'positive' : 'negative';
}

// rise / run as a number, or null when it is undefined (run 0).
export function slopeOf(riseV, runV) {
  const k = slopeKind(riseV, runV);
  if (k === 'undefined' || k === 'none' || k === 'invalid') return null;
  return clean(riseV / runV);
}

// Slope between two points {x, y}.
export function slopeBetween(p1, p2) { return slopeOf(rise(p1.y, p2.y), run(p1.x, p2.x)); }
export function kindBetween(p1, p2) { return slopeKind(rise(p1.y, p2.y), run(p1.x, p2.x)); }

// Percentage grade from a slope: 0.2 -> 20. null stays null.
export function gradeFromSlope(m) { return m === null || !isNum(m) ? null : clean(m * 100); }
export function slopeFromGrade(pct) { return isNum(pct) ? clean(pct / 100) : null; }

// Angle with the horizontal, in degrees: 0.2 -> 11.31. Undefined slope -> 90.
export function angleFromSlope(m) {
  if (m === null) return 90;
  return clean(Math.atan(m) * 180 / Math.PI);
}

// y = m x + b
export function evaluateLinear(m, b, x) { return clean(m * x + b); }

// b for the line with slope m through point p.
export function interceptFrom(m, p) { return clean(p.y - m * p.x); }

// The line through two points: { m, b } or { vertical: true, x } (or null for one point).
export function lineThrough(p1, p2) {
  const k = kindBetween(p1, p2);
  if (k === 'none' || k === 'invalid') return null;
  if (k === 'undefined') return { vertical: true, x: p1.x };
  const m = slopeBetween(p1, p2);
  return { m, b: interceptFrom(m, p1) };
}

// Does a point lie on a line { m, b } or { vertical, x }?
export function onLine(line, p, tol = 1e-7) {
  if (!line) return false;
  if (line.vertical) return Math.abs(p.x - line.x) <= tol;
  return Math.abs(p.y - (line.m * p.x + line.b)) <= tol;
}

// Is a table of { x, y } rows linear (constant rate of change)? Returns the rate too.
export function tableRate(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return { linear: false, rate: null };
  let rate = null;
  for (let i = 1; i < rows.length; i++) {
    const r = slopeBetween(rows[i - 1], rows[i]);
    if (r === null) return { linear: false, rate: null };
    if (rate === null) rate = r;
    else if (!close(r, rate, 1e-9)) return { linear: false, rate: null };
  }
  return { linear: true, rate };
}

// A reduced fraction for integer rise and run: 120/600 -> {n: 1, d: 5}. null otherwise.
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
export function reducedFraction(riseV, runV) {
  if (!Number.isInteger(riseV) || !Number.isInteger(runV) || runV === 0) return null;
  const g = gcd(riseV, runV) || 1;
  let n = riseV / g, d = runV / g;
  if (d < 0) { n = -n; d = -d; }
  return { n: n === 0 ? 0 : n, d };
}

// Units: feet <-> metres. Slope and grade have no units, so they do not change.
export function convertLength(value, from, to) {
  if (from === to || !isNum(value)) return value;
  return clean(from === 'ft' ? value / FT_PER_M : value * FT_PER_M);
}

// Readable number: up to `places` decimals, trailing zeros dropped, thousands
// separators, and a real minus sign. 0.2 -> "0.2", -1200 -> "−1,200".
export function fmt(x, places = 3) {
  if (x === null || x === undefined) return 'undefined';
  if (!isNum(x)) return String(x);
  const r = clean(Number(x.toFixed(places)));
  const s = Math.abs(r).toLocaleString('en-US', { maximumFractionDigits: places });
  return (r < 0 ? '−' : '') + s;
}

// Tick spacing for a graph axis: 1, 2 or 5 times a power of ten, about `count` ticks.
export function niceStep(span, count = 6) {
  if (!(span > 0)) return 1;
  const raw = span / count, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  return clean((f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p);
}

// An axis range that includes every value (and zero when asked), on whole ticks.
export function niceRange(values, { includeZero = false, count = 6, pad = 0 } = {}) {
  let lo = Math.min(...values), hi = Math.max(...values);
  if (includeZero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  if (lo === hi) { lo -= 1; hi += 1; }
  const span = hi - lo; lo -= span * pad; hi += span * pad;
  const step = niceStep(hi - lo, count);
  return { min: clean(Math.floor(lo / step) * step), max: clean(Math.ceil(hi / step) * step), step };
}
