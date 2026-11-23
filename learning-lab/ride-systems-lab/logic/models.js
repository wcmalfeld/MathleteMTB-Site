// Ride Systems Lab: the maths. One authoritative source per model; every
// graph, readout, question and answer comes from here. Pure functions, no
// DOM (Node tests import this file directly).
//
// Units and domains:
//   Trail profiles: distance d in km along the trail (inside the route's
//     domain), elevation in metres. Piecewise-linear between GPS samples.
//     The data is simulated, not surveyed.
//   Drivetrain: cadence c in RPM (40–110 in the model), chainring F and
//     sprocket R in teeth (positive whole numbers from the offered sets),
//     wheel circumference C in metres (> 0; 2.30 m is an illustrative
//     measured value, not a standard for every wheel). Speeds in km/h.
//     An idealized rolling model: one fixed gear, no slipping.
//   Transformations: g(d) = a·h(b(d − c)) + k, with a ≠ 0 and b ≠ 0.

const EPS = 1e-9;
export const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

// ------------------------------------------------------------ trail profiles
export const PINE_RIDGE = Object.freeze({
  name: 'Pine Ridge Enduro Stage',
  points: Object.freeze([[0, 2400], [0.5, 2460], [1, 2430], [1.5, 2500], [2, 2480], [2.5, 2550], [3, 2520]].map(p => Object.freeze(p)))
});

export function makeProfile(points, name) {
  if (!points || points.length < 2) throw new Error('a profile needs two or more points');
  for (let i = 1; i < points.length; i++) if (!(points[i][0] > points[i - 1][0])) throw new Error('distances must increase');
  const P = points.map(p => [p[0], p[1]]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const domain = [xs[0], xs[xs.length - 1]];
  const range = [Math.min(...ys), Math.max(...ys)];
  // Piecewise-linear evaluation. Outside the domain: null (not part of the function).
  const at = d => {
    if (!(d >= domain[0] - EPS && d <= domain[1] + EPS)) return null;
    for (let i = 1; i < P.length; i++) if (d <= P[i][0] + EPS) {
      const [x0, y0] = P[i - 1], [x1, y1] = P[i], t = (d - x0) / (x1 - x0);
      return y0 + Math.max(0, Math.min(1, t)) * (y1 - y0);
    }
    return P[P.length - 1][1];
  };
  // Segments with their direction.
  const segments = P.slice(1).map((p, i) => ({ from: P[i][0], to: p[0], y0: P[i][1], y1: p[1], slope: (p[1] - P[i][1]) / (p[0] - P[i][0]), dir: p[1] > P[i][1] ? 'up' : p[1] < P[i][1] ? 'down' : 'flat' }));
  // Maximal runs of the same direction: the increasing / decreasing intervals.
  const runs = [];
  for (const s of segments) {
    const last = runs[runs.length - 1];
    if (last && last.dir === s.dir) last.to = s.to; else runs.push({ dir: s.dir, from: s.from, to: s.to });
  }
  // Every distance where the profile is at elevation y (the horizontal line test).
  const crossings = y => {
    const out = [];
    for (const s of segments) {
      const lo = Math.min(s.y0, s.y1), hi = Math.max(s.y0, s.y1);
      if (y < lo - EPS || y > hi + EPS) continue;
      if (s.dir === 'flat') { out.push(s.from, s.to); continue; }
      out.push(s.from + (y - s.y0) / s.slope);
    }
    return [...new Set(out.map(x => round(x, 9)))].sort((a, b) => a - b);
  };
  const ymax = range[1], ymin = range[0];
  const argmax = P.filter(p => p[1] === ymax).map(p => p[0]), argmin = P.filter(p => p[1] === ymin).map(p => p[0]);
  // Is the profile one-to-one on [a, b]? (strictly increasing or decreasing there)
  function monotoneOn(a, b) {
    const inside = segments.filter(s => s.to > a + EPS && s.from < b - EPS);
    if (!inside.length) return null;
    const dirs = new Set(inside.map(s => s.dir));
    return dirs.size === 1 && !dirs.has('flat') ? [...dirs][0] : null;
  }
  // Inverse over a restricted domain [a, b] where it's one-to-one; null otherwise.
  function inverseOn(a, b) {
    const dir = monotoneOn(a, b);
    if (!dir) return null;
    const ya = at(a), yb = at(b);
    const lo = Math.min(ya, yb), hi = Math.max(ya, yb);
    const inside = segments.filter(s => s.to > a + EPS && s.from < b - EPS);
    const f = y => {
      if (!(y >= lo - EPS && y <= hi + EPS)) return null;
      for (const s of inside) {
        const s0 = at(Math.max(s.from, a)), s1 = at(Math.min(s.to, b));
        if (y >= Math.min(s0, s1) - EPS && y <= Math.max(s0, s1) + EPS) return s.from + (y - s.y0) / s.slope;
      }
      return null;
    };
    // A single straight segment has a formula: d = from + (y − y0) / slope.
    const formula = inside.length === 1 ? { d0: inside[0].from, y0: inside[0].y0, slope: inside[0].slope } : null;
    return { domain: [a, b], range: [lo, hi], dir, f, formula };
  }
  return { name, points: P, domain, range, at, segments, runs, crossings, argmax, argmin, monotoneOn, inverseOn };
}
export const TRAIL = makeProfile(PINE_RIDGE.points, PINE_RIDGE.name);
// Relative elevation h(d) = E(d) − 2400 (metres above the start).
export const BASE = TRAIL.points[0][1];
export const RELATIVE = makeProfile(TRAIL.points.map(([d, y]) => [d, y - BASE]), 'Pine Ridge (relative to the start)');

// ------------------------------------------------------------ drivetrain
export const FRONT_TEETH = Object.freeze([30, 32, 34, 36]);
export const REAR_TEETH = Object.freeze([16, 17, 20, 24]);
export const CADENCE = Object.freeze({ min: 40, max: 110 });
export const CIRCUMFERENCE = Object.freeze({ min: 2.0, max: 2.4, base: 2.30 });
export const BASE_GEAR = Object.freeze({ front: 32, rear: 16, circumference: 2.30, cadence: 80 });

export const gearRatio = (F, R) => {
  if (!(Number.isInteger(F) && F > 0 && Number.isInteger(R) && R > 0)) throw new RangeError('tooth counts must be positive whole numbers');
  return F / R;
};
// W(c) = G·c : wheel RPM from cadence
export const wheelRpm = (c, G) => G * c;
// V(w) = (60·C / 1000)·w : km/h from wheel RPM (C metres per turn, 60 min an hour, 1000 m a km)
export const speedPerWheelRpm = C => { if (!(C > 0)) throw new RangeError('circumference must be positive'); return (60 * C) / 1000; };
export const wheelToSpeed = (w, C) => speedPerWheelRpm(C) * w;

// The whole drivetrain: f, g, the composite S = g ∘ f and its inverse.
export function drivetrain({ front, rear, circumference, cadenceRange = CADENCE }) {
  const G = gearRatio(front, rear), kg = speedPerWheelRpm(circumference), k = kg * G;
  const f = c => G * c, g = w => kg * w, S = c => g(f(c));
  const Sinv = v => v / k;
  const domain = [cadenceRange.min, cadenceRange.max], range = [S(domain[0]), S(domain[1])];
  const inDomain = c => c >= domain[0] - EPS && c <= domain[1] + EPS;
  const inRange = v => v >= range[0] - EPS && v <= range[1] + EPS;
  return { front, rear, circumference, G, kg, k, f, g, S, Sinv, domain, range, inDomain, inRange };
}
export const BASE_DRIVE = drivetrain(BASE_GEAR);

// ------------------------------------------------------------ transformations
// g(d) = a·h(b(d − c)) + k
export function transform(profile, { a = 1, b = 1, c = 0, k = 0 } = {}) {
  if (!a || !b) throw new RangeError('a and b must not be 0');
  const [d0, d1] = profile.domain;
  // b(d − c) must lie in h's domain: d = c + u/b for u in [d0, d1].
  const ends = [c + d0 / b, c + d1 / b].sort((x, y) => x - y);
  const g = d => { const u = b * (d - c), y = profile.at(u); return y === null ? null : a * y + k; };
  // Every sample point moves to (c + x/b, a·y + k).
  const points = profile.points.map(([x, y]) => [c + x / b, a * y + k]).sort((p, q) => p[0] - q[0]);
  return { a, b, c, k, domain: ends, at: g, points };
}
export const sameTransform = (p, q) => ['a', 'b', 'c', 'k'].every(key => Math.abs((p[key] ?? (key === 'a' || key === 'b' ? 1 : 0)) - (q[key] ?? (key === 'a' || key === 'b' ? 1 : 0))) < 1e-6);
export function describeTransform({ a = 1, b = 1, c = 0, k = 0 }) {
  const out = [];
  if (b !== 1) out.push(Math.abs(b) > 1 ? `compressed horizontally by a factor of ${nf(Math.abs(b))}` : `stretched horizontally by a factor of ${nf(1 / Math.abs(b))}`);
  if (b < 0) out.push('reflected left–right');
  if (c) out.push(`shifted ${c > 0 ? 'right' : 'left'} ${nf(Math.abs(c))} km`);
  if (Math.abs(a) !== 1) out.push(Math.abs(a) > 1 ? `stretched vertically by a factor of ${nf(Math.abs(a))}` : `compressed vertically by a factor of ${nf(Math.abs(a))}`);
  if (a < 0) out.push('reflected across the horizontal axis');
  if (k) out.push(`shifted ${k > 0 ? 'up' : 'down'} ${nf(Math.abs(k))} m`);
  return out.length ? out : ['unchanged'];
}
// The equation as text: g(d) = 2h(d) + 40, h(2d), −h(d − 0.5) …
export function transformEquation({ a = 1, b = 1, c = 0, k = 0 }) {
  const inner = c ? `d ${c > 0 ? '−' : '+'} ${nf(Math.abs(c))}` : 'd';
  const arg = b === 1 ? inner : `${b === -1 ? '−' : nf(b)}${c ? '(' + inner + ')' : 'd'}`;
  const coef = a === 1 ? '' : a === -1 ? '−' : nf(a);
  return `g(d) = ${coef}h(${arg})${k ? (k > 0 ? ' + ' : ' − ') + nf(Math.abs(k)) : ''}`;
}

// ------------------------------------------------------------ function operations (extension)
// A 60 m creek crossing: f(x) = ground height above the creek bed (m),
// b(x) = boardwalk deck height above the ground over the span, T = f + b.
export const CROSSING = Object.freeze({ length: 60, span: [20, 40], creek: 30, curve: 0.004 });
export const ground = x => CROSSING.curve * (x - CROSSING.creek) ** 2;
export const deck = H => x => (x >= CROSSING.span[0] && x <= CROSSING.span[1] ? H : 0);
export function crossing(H) {
  const b = deck(H);
  const T = x => ground(x) + b(x);                       // f + b: the riding surface
  const clearance = x => T(x) - ground(x);               // T − f = b
  const feet = x => 3.281 * T(x);                        // a constant multiple
  // b ÷ f: defined only where f(x) ≠ 0 (not at the creek bed, x = 30)
  const ratio = x => (Math.abs(ground(x)) < EPS ? null : b(x) / ground(x));
  return { H, f: ground, b, T, clearance, feet, ratio, excluded: [CROSSING.creek] };
}

// ------------------------------------------------------------ validated sets (final challenge)
// Round 1 uses the briefing's own numbers; retakes move to the next set.
export const FINAL_SETS = Object.freeze({
  trails: [
    { name: 'Aspen Flow Line', ys: [2100, 2140, 2180, 2150, 2120, 2160, 2170], at: 2.5 },
    { name: 'Cedar Creek Loop', ys: [1850, 1820, 1790, 1830, 1870, 1860, 1840], at: 1.5 },
    { name: 'Granite Gully', ys: [3050, 3080, 3120, 3100, 3060, 3040, 3070], at: 2.0 },
    { name: 'Juniper Ridge', ys: [2600, 2650, 2630, 2610, 2660, 2700, 2690], at: 1.0 },
    { name: 'Lodgepole Descent', ys: [2900, 2870, 2880, 2840, 2800, 2820, 2810], at: 0.5 }
  ],
  drives: [
    { front: 34, rear: 17, circumference: 2.30, cadence: 90, target: 100 },
    { front: 36, rear: 18, circumference: 2.20, cadence: 85, target: 90 },
    { front: 30, rear: 20, circumference: 2.30, cadence: 100, target: 90 },
    { front: 32, rear: 20, circumference: 2.25, cadence: 90, target: 100 },
    { front: 28, rear: 14, circumference: 2.20, cadence: 95, target: 100 }
  ],
  transforms: [{ a: 2, k: 30 }, { a: 3, k: -20 }, { a: 0.5, k: 60 }, { a: 2, k: -40 }, { a: 1.5, k: 25 }]
});
export const DISTANCES = Object.freeze([0, 0.5, 1, 1.5, 2, 2.5, 3]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
export const nf = x => String(Number(Number(x).toPrecision(12)));
