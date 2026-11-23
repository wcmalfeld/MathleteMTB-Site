// Race-Day Workshop: the maths. One model per mission; every picture,
// readout, question and answer in the lab comes from these functions, so
// nothing is worked out twice. Pure functions, no DOM (Node tests import
// this file directly).
//
// Units and domains (all stated, all checked):
//   Suspension: shock stroke T in mm (T > 0), measured sag s in mm (0 ≤ s ≤ T),
//               sag percentage p = s / T × 100 (%). The 25–30% window is the
//               range FOX gives for the FLOAT shock in its setup guide; it is
//               a practice scenario here, not a setting for any real bike.
//   Race timing: distances in km (> 0), speeds in km/h (> 0), times in hours
//               (shown in minutes). Average speed = total distance ÷ total time.
//   Trail survey: horizontal distance a and straight-line distance c in metres
//               (c ≥ a > 0); signed elevation change h in metres (+ up, − down).

const EPS = 1e-9;
export const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

// ---------------------------------------------------------- suspension
export const SAG_RANGE = Object.freeze({ lo: 25, hi: 30 });   // percent of shock stroke

export const sagPercent = (s, T) => {
  if (!(T > 0)) throw new RangeError('shock stroke must be positive');
  return (s / T) * 100;
};
// p = s / T × 100, rearranged for s: s = p × T / 100.
export const sagMm = (p, T) => (p * T) / 100;

export function sagWindow(T, range = SAG_RANGE) {
  const minMm = sagMm(range.lo, T), maxMm = sagMm(range.hi, T);
  return {
    stroke: T, lo: range.lo, hi: range.hi,
    minMm, maxMm,
    midPct: (range.lo + range.hi) / 2, tolPct: (range.hi - range.lo) / 2,
    midMm: (minMm + maxMm) / 2, tolMm: (maxMm - minMm) / 2
  };
}

// One reading on the shock: everything the sag calculator and the
// tolerance gauge show.
export function sagReading(s, T, range = SAG_RANGE) {
  const w = sagWindow(T, range);
  const p = sagPercent(s, T);
  const dev = Math.abs(p - w.midPct);
  const within = dev <= w.tolPct + EPS;
  return { ...w, sag: s, pct: p, dev, within, side: within ? 'in' : p < w.lo ? 'low' : 'high' };
}

// |x − mid| ≤ tol  ⇔  mid − tol ≤ x ≤ mid + tol
export const absWithin = (x, mid, tol) => Math.abs(x - mid) <= tol + EPS;
export const absBounds = (mid, tol) => [mid - tol, mid + tol];

// ---------------------------------------------------------- race timing
// A stage in two sections: d1 km already ridden at v1 km/h, d2 km to go,
// and a target overall average speed. Solving
//     d1/v1 + d2/v = (d1 + d2)/target
// for v gives the speed needed on section 2.
export function raceStage({ d1, v1, d2, target }) {
  if (![d1, v1, d2, target].every(x => x > 0)) throw new RangeError('distances and speeds must be positive');
  const total = d1 + d2;
  const tTarget = total / target;           // hours allowed for the whole stage
  const t1 = d1 / v1;                       // hours already used
  const tLeft = tTarget - t1;               // hours left for section 2
  // If section 1 already used all the time, no positive speed is fast enough.
  const vNeeded = tLeft > EPS ? d2 / tLeft : null;
  return { d1, v1, d2, target, total, tTarget, t1, tLeft, vNeeded };
}

// The simulator: ride section 2 at v km/h and see what happens.
export function raceRun(stage, v) {
  if (!(v > 0)) throw new RangeError('speed must be positive');
  const S = raceStage(stage);
  const t2 = S.d2 / v, time = S.t1 + t2, avg = S.total / time;
  return { ...S, v, t2, time, avg, meets: time <= S.tTarget + EPS };
}

// The naive (wrong) idea: average the two section speeds.
export const naiveSpeed = ({ v1, target }) => 2 * target - v1;

export const minutes = hours => hours * 60;
export function clock(hours) {
  const total = Math.round(hours * 3600);
  const m = Math.floor(total / 60), s = total % 60;
  return m + ':' + String(s).padStart(2, '0');
}

// ---------------------------------------------------------- trail survey
// √(a² + h²) = c  →  h² = c² − a²  →  h = ±√(c² − a²)
export function survey(a, c) {
  if (!(a > 0) || !(c > 0)) throw new RangeError('distances must be positive');
  const h2 = c * c - a * a;
  if (h2 < -EPS) return { a, c, h2, real: false, rise: null, solutions: [] };
  const rise = Math.sqrt(Math.max(0, h2));
  return { a, c, h2, real: true, rise, solutions: rise < EPS ? [0] : [rise, -rise], grade: rise / a };
}
// Does a value of h satisfy the original (unsquared) equation?
export const surveyCheck = (a, c, h) => Math.abs(Math.sqrt(a * a + h * h) - c) < 1e-7;

// ---------------------------------------------------------- algebra debugger
// √(q + m) = q − n. Squaring gives q + m = (q − n)², a quadratic whose roots
// are the candidates; each is then tested in the original equation.
export function radicalCandidates(m, n) {
  // q² − (2n + 1)q + (n² − m) = 0
  const B = -(2 * n + 1), C = n * n - m, disc = B * B - 4 * C;
  if (disc < 0) return [];
  const r = Math.sqrt(disc);
  return [...new Set([(-B - r) / 2, (-B + r) / 2].map(x => round(x, 9)))].sort((x, y) => x - y);
}
export function radicalTest(m, n, q) {
  const inside = q + m;
  const left = inside >= 0 ? Math.sqrt(inside) : NaN, right = q - n;
  return { q, inside, left, right, valid: inside >= 0 && Math.abs(left - right) < 1e-9 };
}

// ---------------------------------------------------------- extension
// x² + k = 0 (k > 0) has no real solution: x = ±√k · i.
export const complexRoots = k => (k > 0 ? { real: false, im: Math.sqrt(k) } : { real: true, roots: [Math.sqrt(-k), -Math.sqrt(-k)] });

// ---------------------------------------------------------- validated number sets
// Every set below gives whole-minute times and a whole-number answer, and
// the two sections take different times (when they're equal, averaging the
// two speeds happens to work, which would hide the misconception);
// scripts/test-race-day-workshop.mjs re-derives them all.
export const PRD = Object.freeze({
  stroke: 60, practiceStroke: 80, guidedSag: 17,
  stage: { d1: 1, v1: 12, d2: 3, target: 16 },
  survey: { a: 120, c: 125 },
  radical: { m: 9, n: 3 }
});
// Independent race challenge (Mission 2): a fresh scenario each time.
export const RACE_PRACTICE = Object.freeze([
  { d1: 1, v1: 10, d2: 3, target: 16 },
  { d1: 1, v1: 15, d2: 2, target: 18 },
  { d1: 2, v1: 12, d2: 2, target: 16 },
  { d1: 1, v1: 12, d2: 3.5, target: 18 },
  { d1: 1.5, v1: 10, d2: 2.5, target: 16 },
  { d1: 1, v1: 10, d2: 5, target: 20 }
]);
// Final certification. Round 1 uses the briefing's own numbers; each retake
// moves to the next set.
export const FINAL_SETS = Object.freeze({
  sag: [{ stroke: 65, measured: 20.5 }, { stroke: 50, measured: 14 }, { stroke: 55, measured: 13 }, { stroke: 70, measured: 19 }, { stroke: 75, measured: 23 }],
  race: [{ d1: 1.5, v1: 15, d2: 3, target: 18 }, { d1: 1, v1: 12, d2: 4, target: 20 }, { d1: 2, v1: 15, d2: 4, target: 18 }, { d1: 0.5, v1: 10, d2: 2.5, target: 20 }, { d1: 0.5, v1: 10, d2: 4, target: 18 }],
  survey: [{ a: 40, c: 41 }, { a: 60, c: 61 }, { a: 80, c: 82 }, { a: 84, c: 85 }, { a: 48, c: 50 }]
});
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
