// Jump Trajectory Lab: the ONE mathematical model.
// Everything on screen (jump scene, graph, rider, telemetry, equations,
// questions and their answers) comes from jumpModel(L, H) below. No
// component computes the trajectory itself.
//
//   L = horizontal jump distance (takeoff to landing), H = maximum height
//   a = −4H / L²,  vertex (L/2, H),  zeros x = 0 and x = L
//   vertex form    y = a(x − L/2)² + H
//   standard form  y = ax² + (4H/L)x + 0
//   factored form  y = a·x(x − L)
// Simplified model: takeoff and landing at the same reference height,
// domain 0 ≤ x ≤ L. Not a physics prediction.
//
// Coefficients are kept as exact fractions (inputs are whole or half
// numbers), so displayed equations are exact and rounding never changes an
// answer. Tested by scripts/test-jump-lab.mjs.

export const LIMITS = { L: { min: 6, max: 24, step: 1 }, H: { min: 1, max: 6, step: 0.5 } };
export const DEFAULT = { L: 12, H: 3 };

// ---------- exact fractions ----------
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
export function frac(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) throw new Error('frac needs integers and d ≠ 0');
  const g = gcd(n, d), s = d < 0 ? -1 : 1;
  return { n: s * n / g === 0 ? 0 : s * n / g, d: s * d / g };
}
// A number that is a whole or half (or any finite decimal) as an exact fraction.
export function toFrac(x) {
  if (!isFinite(x)) throw new Error('not a number');
  let d = 1;
  while (!Number.isInteger(Math.round(x * d * 1e9) / 1e9) && d < 1e6) d *= 10;
  return frac(Math.round(x * d), d);
}
export const fmul = (p, q) => frac(p.n * q.n, p.d * q.d);
export const fdiv = (p, q) => frac(p.n * q.d, p.d * q.n);
export const fadd = (p, q) => frac(p.n * q.d + q.n * p.d, p.d * q.d);
export const fneg = p => frac(-p.n, p.d);
export const fval = p => p.n / p.d;
export const feq = (p, q) => p.n === q.n && p.d === q.d;

// "−1/12", "3", "1/2"; with { plain: true } a hyphen-minus for typing.
export function fstr(p, opts = {}) {
  const m = opts.plain ? '-' : '−';
  const s = p.d === 1 ? String(Math.abs(p.n)) : `${Math.abs(p.n)}/${p.d}`;
  return (p.n < 0 ? m : '') + s;
}

// Positions and heights read better as decimals (7.5, not 15/2) when exact.
export function nice(p) {
  let d = p.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
  return d === 1 ? String(p.n / p.d).replace('-', '\u2212') : fstr(p);
}

// Tidy decimals for display only: 0.0833, 2.25, 12.
export function dec(x, places = 4) {
  if (!isFinite(x)) return '—';
  const r = Number(x.toFixed(places));
  return (Object.is(r, -0) ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: places }).replace('-', '−');
}

export function clamp(v, k) {
  const { min, max, step } = LIMITS[k];
  if (!isFinite(v)) v = DEFAULT[k];
  return Math.min(max, Math.max(min, Math.round(v / step) * step));
}

// ---------- the model ----------
export function jumpModel(Lin, Hin) {
  const L = Number(Lin), H = Number(Hin);
  if (!(L > 0) || !(H > 0)) throw new Error('L and H must both be greater than zero');
  const Lf = toFrac(L), Hf = toFrac(H);
  const a = fneg(fdiv(fmul(frac(4), Hf), fmul(Lf, Lf)));          // −4H/L²
  const b = fdiv(fmul(frac(4), Hf), Lf);                           // 4H/L
  const h = fdiv(Lf, frac(2));                                     // L/2
  const av = fval(a), hv = L / 2;
  const y = x => av * (x - hv) * (x - hv) + H;                     // vertex form, the definition
  return {
    L, H, a, b, c: frac(0), h, k: Hf, Lf, Hf,
    aValue: av, bValue: fval(b),
    vertex: { x: hv, y: H },
    zeros: [0, L],
    axis: hv,
    max: H,
    takeoff: { x: 0, y: 0 },
    landing: { x: L, y: 0 },
    y,
    // the same function written two other ways (used to prove they agree)
    yStandard: x => av * x * x + fval(b) * x,
    yFactored: x => av * x * (x - L),
    inDomain: x => x >= 0 && x <= L,
    // points along the jump, for drawing
    points(n = 80) { const out = []; for (let i = 0; i <= n; i++) { const x = L * i / n; out.push({ x, y: y(x) }); } return out; },
    // the point mirrored across the axis of symmetry
    mirror: x => L - x
  };
}

// ---------- the three forms, as text pieces for display ----------
// Each piece: { t: text, role?: 'a' | 'h' | 'k' | 'b' | 'c' | 'r1' | 'r2', frac?: {n,d} }
// so the screen can highlight the part that matters and show fractions stacked.
function coef(p, role, { lead = false } = {}) {
  // −1/12 -> "−" + fraction; 1 -> "" (leading) ; −1 -> "−"
  const neg = p.n < 0, abs = frac(Math.abs(p.n), p.d);
  const sign = lead ? (neg ? '−' : '') : (neg ? ' − ' : ' + ');
  if (abs.n === abs.d) return [{ t: sign, role }];
  return [{ t: sign, role }, abs.d === 1 ? { t: String(abs.n), role } : { frac: abs, role }];
}
export function vertexForm(m) {
  return [{ t: 'y = ' }, ...coef(m.a, 'a', { lead: true }), { t: '(x − ' }, { t: nice(m.h), role: 'h' }, { t: ')² + ' }, { t: nice(m.k), role: 'k' }];
}
export function standardForm(m) {
  return [{ t: 'y = ' }, ...coef(m.a, 'a', { lead: true }), { t: 'x²' }, ...coef(m.b, 'b'), { t: 'x' }, { t: ' + ' }, { t: '0', role: 'c' }];
}
export function factoredForm(m) {
  // root 0 is written as the plain factor x, as in −1/12·x(x − 12)
  return [{ t: 'y = ' }, ...coef(m.a, 'a', { lead: true }), { t: 'x', role: 'r1' }, { t: '(x − ' }, { t: nice(m.Lf), role: 'r2' }, { t: ')' }];
}
// Plain text versions (for screen readers, answers and saved attempts).
export const asText = parts => parts.map(p => p.frac ? `${p.frac.n}/${p.frac.d}` : p.t).join('');

// Parameter sets whose coefficient is a tidy unit fraction (a = −1/n),
// used for generated problems. Every set is checked by the tests.
export const NICE = [
  { L: 12, H: 3 }, { L: 8, H: 4 }, { L: 10, H: 5 }, { L: 16, H: 4 }, { L: 20, H: 5 }, { L: 6, H: 3 },
  { L: 12, H: 6 }, { L: 8, H: 2 }, { L: 10, H: 2.5 }, { L: 14, H: 3.5 }, { L: 18, H: 4.5 }, { L: 24, H: 6 },
  { L: 16, H: 2 }, { L: 20, H: 4 }, { L: 24, H: 3 }, { L: 6, H: 1.5 }
];
