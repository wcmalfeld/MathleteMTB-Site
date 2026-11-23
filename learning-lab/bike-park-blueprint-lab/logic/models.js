// Bike Park Blueprint Lab: the scenarios and their maths. Every graph,
// matrix, readout, question and answer comes from here (with the exact
// arithmetic in matrix.js). Pure; no DOM.
//
// All resource figures and prices are fictional planning numbers for the
// simulation, not construction standards or contractor estimates.
//   x = berm modules, y = jump features, z = rock garden sections
//   (whole numbers ≥ 0 for a real build plan).

import { Frac, mat, mul, det, inverse, transpose, classify, toNumbers } from './matrix.js';

export const FEATURES = Object.freeze(['Berm module', 'Jump feature', 'Rock garden']);
export const RESOURCES = Object.freeze(['Crew hours', 'Machine hours', 'Soil loads']);
export const TOOLS = Object.freeze(['Shovels', 'Rakes', 'Tampers']);
export const CREWS = Object.freeze(['Crew A', 'Crew B']);

// ---------------------------------------------------------- two-variable lines
// A line ax + by = c. Points across a window, for plotting.
export function linePoints({ a, b, c }, [x0, x1], [y0, y1]) {
  if (b !== 0) return [[x0, (c - a * x0) / b], [x1, (c - a * x1) / b]];
  if (a !== 0) return [[c / a, y0], [c / a, y1]];
  return [];
}
// Two lines: one point, parallel (none) or the same line (infinite).
export function solve2(p, q) {
  const D = p.a * q.b - p.b * q.a;
  if (D === 0) {
    // Same line if one equation is a multiple of the other (including c).
    const same = p.a * q.c === q.a * p.c && p.b * q.c === q.b * p.c;
    return { type: same ? 'infinite' : 'none' };
  }
  // Exact even for decimal inputs (e.g. a plane sliced at z = 0.5): Cramer's rule in fractions.
  const f = Frac.of, Df = f(D);
  const x = f(p.c).mul(q.b).sub(f(p.b).mul(q.c)).div(Df), y = f(p.a).mul(q.c).sub(f(p.c).mul(q.a)).div(Df);
  return { type: 'one', x, y };
}
export const onLine = ({ a, b, c }, x, y) => Math.abs(a * x + b * y - c) < 1e-9;
// A real build plan needs whole, non-negative feature counts.
export const buildable = s => s.type === 'one' && s.x.int && s.y.int && s.x.n >= 0 && s.y.n >= 0;
export const eqText = ({ a, b, c }, v = ['x', 'y']) => `${coef(a, v[0], true)} ${b < 0 ? '−' : '+'} ${coef(Math.abs(b), v[1])} = ${c}`;
function coef(k, v, first) { const s = k === 1 ? v : k === -1 ? '−' + v : k + v; return first ? s : s; }

// ---------------------------------------------------------- Mission 1
export const ZONE = Object.freeze({
  needs: { berm: { crew: 4, machine: 2 }, jump: { crew: 3, machine: 1 } },
  available: { crew: 17, machine: 7 }
});
export const CREW_EQ = Object.freeze({ a: 4, b: 3, c: 17 });
export const MACHINE_EQ = Object.freeze({ a: 2, b: 1, c: 7 });
export const crewLine = c => ({ a: ZONE.needs.berm.crew, b: ZONE.needs.jump.crew, c });
export const machineLine = c => ({ a: ZONE.needs.berm.machine, b: ZONE.needs.jump.machine, c });
// Diagnose the blueprint: one, none, infinite.
export const DIAGNOSE = Object.freeze([
  { id: 'none', p: CREW_EQ, q: { a: 8, b: 6, c: 36 } },
  { id: 'infinite', p: CREW_EQ, q: { a: 8, b: 6, c: 34 } },
  { id: 'one', p: CREW_EQ, q: { a: 1, b: 1, c: 5 } }
]);

// ---------------------------------------------------------- Mission 2 (and 4)
export const PARK = Object.freeze({
  // rows: features (berm, jump, rock garden); columns: crew, machine, soil
  needs: Object.freeze([[4, 2, 1], [3, 1, 2], [5, 3, 2]]),
  available: Object.freeze([22, 10, 10])
});
// The system: one equation per resource, so its coefficient matrix A is
// the transpose of the feature-by-resource matrix M (rows ↔ columns).
export const M = () => mat(PARK.needs);
export const A = () => transpose(M());
export const Bvec = () => mat(PARK.available.map(v => [v]));
export const augmented = (A_, b) => A_.map((r, i) => [...r, Frac.of(b[i])]);
export const PARK_AUG = () => augmented(A(), PARK.available);
// The PRD's elimination route (the guided console follows it).
export const GUIDED_STEPS = Object.freeze([
  { type: 'swap', i: 0, j: 2, why: 'Put the row with a 1 in front first: it makes the next steps whole numbers.' },
  { type: 'add', i: 1, j: 0, k: -2, why: 'Clear x from row 2: subtract 2 × row 1.' },
  { type: 'add', i: 2, j: 0, k: -4, why: 'Clear x from row 3: subtract 4 × row 1.' },
  { type: 'scale', i: 2, k: 3, why: 'Scale row 3 by 3 so its y-entry (−15) matches a multiple of row 2’s (−3 × 5).' },
  { type: 'add', i: 2, j: 1, k: -5, why: 'Clear y from row 3: subtract 5 × row 2. (Together with the last step this is R3 → 3R3 − 5R2.)' }
]);

// ---------------------------------------------------------- Mission 3
export const INVENTORY = Object.freeze({
  A: Object.freeze([[4, 6, 2], [3, 5, 1]]), B: Object.freeze([[2, 2, 1], [1, 3, 2]]),
  S: Object.freeze([[10, 12, 6], [8, 10, 5]]), U: Object.freeze([[3, 4, 2], [2, 3, 1]])
});
export const COST = Object.freeze([28, 90, 45]);               // $ per crew hour, machine hour, soil load
export const Cvec = (c = COST) => mat(c.map(v => [v]));
export const PLAN = Object.freeze([2, 3, 1]);                  // the Mission 2 solution
// The whole park: resources QM, unit costs MC, total QMC (and Q(MC) agrees).
export function costing(q = PLAN, needs = PARK.needs, cost = COST) {
  const Q = mat([q]), Mm = mat(needs), C = mat(cost.map(v => [v]));
  const QM = mul(Q, Mm), MC = mul(Mm, C), total = mul(QM, C)[0][0];
  if (!mul(Q, MC)[0][0].eq(total)) throw new Error('associativity check failed');
  return { Q, M: Mm, C, QM, MC, total, resources: QM[0].map(Number), unit: MC.map(r => Number(r[0])), cost: Number(total) };
}

// ---------------------------------------------------------- Mission 4: a singular example
// Two rows of A are multiples (row 2 = 2 × row 1): det = 0, no inverse.
export const SINGULAR = Object.freeze({ A: Object.freeze([[1, 2, 1], [2, 4, 2], [1, 1, 1]]), consistent: Object.freeze([5, 10, 4]), inconsistent: Object.freeze([5, 12, 4]) });

// ---------------------------------------------------------- Extension: the park optimizer
export const OPT = Object.freeze({ crew: { a: 4, b: 3, c: 40 }, machine: { a: 2, b: 1, c: 18 } });
export const feasible = (x, y) => x >= 0 && y >= 0 && 4 * x + 3 * y <= 40 + 1e-9 && 2 * x + y <= 18 + 1e-9;
export function optimizer() {
  const pts = [];
  for (let x = 0; x <= 9; x++) for (let y = 0; y <= 14; y++) if (feasible(x, y)) pts.push([x, y]);
  const best = Math.max(...pts.map(([x, y]) => x + y));
  const corner = solve2(OPT.crew, OPT.machine);
  // Feasible region's corners (for the shaded polygon).
  const region = [[0, 0], [9, 0], [Number(corner.x), Number(corner.y)], [0, 40 / 3]];
  return { points: pts, best, bestPlans: pts.filter(([x, y]) => x + y === best), corner, region };
}

// ---------------------------------------------------------- validated sets
// Practice (Mission 1): new two-variable plans, whole-number answers.
export const PRACTICE_2 = Object.freeze([
  { p: { a: 3, b: 1, c: 10 }, q: { a: 1, b: 2, c: 10 } },
  { p: { a: 2, b: 5, c: 19 }, q: { a: 1, b: 1, c: 5 } },
  { p: { a: 5, b: 3, c: 21 }, q: { a: 1, b: 1, c: 5 } },
  { p: { a: 3, b: 4, c: 25 }, q: { a: 2, b: 1, c: 10 } },
  { p: { a: 4, b: 1, c: 14 }, q: { a: 1, b: 3, c: 9 } }
]);
// Practice (Mission 2): three-variable systems of every kind.
export const PRACTICE_3 = Object.freeze([
  { A: [[1, 1, 1], [2, 1, 3], [1, 2, 2]], b: [6, 13, 11], type: 'one' },
  { A: [[1, 1, 1], [2, 1, 3], [3, 2, 4]], b: [6, 13, 20], type: 'none' },
  { A: [[1, 1, 1], [2, 1, 3], [3, 2, 4]], b: [6, 13, 19], type: 'infinite' },
  { A: [[2, 1, 1], [1, 3, 2], [1, 1, 4]], b: [9, 10, 12], type: 'one' },
  { A: [[1, 2, 1], [2, 4, 2], [1, 1, 1]], b: [5, 10, 4], type: 'infinite' },
  { A: [[1, 2, 1], [2, 4, 2], [1, 1, 1]], b: [5, 12, 4], type: 'none' }
]);
// Final rounds. Round 1 is the briefing's own plan. (The PRD's Challenge B
// listed totals 25, 13, 9, which solve to (3, −1, 4); its intended answer
// (1, 2, 3) needs totals 26, 14, 7, used here.) Challenge C costs Challenge
// B's plan, with a budget that fits in some rounds and not in others.
export const FINAL_SETS = Object.freeze([
  { two: { p: { a: 4, b: 3, c: 17 }, q: { a: 2, b: 1, c: 7 } }, three: { A: [[3, 4, 5], [1, 2, 3], [2, 1, 1]], b: [26, 14, 7] }, budget: 2400 },
  { two: { p: { a: 3, b: 2, c: 16 }, q: { a: 1, b: 2, c: 8 } }, three: { A: [[4, 3, 5], [2, 1, 3], [1, 2, 2]], b: [25, 13, 9] }, budget: 2200 },
  { two: { p: { a: 5, b: 2, c: 19 }, q: { a: 3, b: 1, c: 11 } }, three: { A: [[2, 3, 4], [1, 1, 2], [3, 2, 1]], b: [14, 6, 11] }, budget: 1800 },
  { two: { p: { a: 2, b: 3, c: 18 }, q: { a: 3, b: 1, c: 13 } }, three: { A: [[1, 2, 1], [3, 1, 2], [2, 3, 4]], b: [9, 10, 19] }, budget: 2100 },
  { two: { p: { a: 3, b: 5, c: 27 }, q: { a: 1, b: 1, c: 7 } }, three: { A: [[5, 2, 3], [2, 2, 1], [1, 3, 2]], b: [21, 9, 11] }, budget: 2500 }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];

// Exact solution of a 3×3 system (checked: det ≠ 0 and A·x = b).
export function solve3(A_, b) {
  const Am = mat(A_);
  if (det(Am).zero) return null;
  const x = mul(inverse(Am), mat(b.map(v => [v]))).map(r => r[0]);
  return { x, det: det(Am), inverse: inverse(Am) };
}
export { Frac, toNumbers, classify };
export const nf = x => String(Number(Number(x).toPrecision(12)));
