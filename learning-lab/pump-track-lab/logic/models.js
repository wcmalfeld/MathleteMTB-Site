// Pump Track Profile Lab: the scenarios. Every graph, readout, question and
// answer comes from here (exact algebra in poly.js). Pure; no DOM.
//
// Every curve is a simplified mathematical side profile over a stated
// distance, not a pump track design or construction specification. Real
// pump tracks are continuous circuits whose geometry depends on the site,
// the riders and professional design.
//   x: horizontal distance along the modelled track (m)
//   P(x): height relative to the reference elevation (m)

import { fromRoots, fromHigh, scale, poly, Frac } from './poly.js';

// Flow Line A: 0.005x(x − 2)(x − 6)(x − 8) on 0 ≤ x ≤ 8.
export const FLOW = Object.freeze({ a: 0.005, roots: Object.freeze([[0, 1], [2, 1], [6, 1], [8, 1]]), domain: Object.freeze([0, 8]) });
export const P = () => fromRoots(FLOW.a, FLOW.roots);
export const Q = () => scale(200, P());                                   // x⁴ − 16x³ + 76x² − 96x
export const CUBIC = () => fromHigh([1, -16, 76, -96]);                  // Q ÷ x
// Multiplicity model: 0.02(x − 1)(x − 3)²(x − 5) on 0 ≤ x ≤ 6.
export const MULT = Object.freeze({ a: 0.02, roots: Object.freeze([[1, 1], [3, 2], [5, 1]]), domain: Object.freeze([0, 6]) });
export const Mpoly = () => fromRoots(MULT.a, MULT.roots);
// Profile combination: baseline B and shaping adjustment A.
export const BASE = () => fromHigh([0.02, 0.1, 1]);
export const ADJUST = () => fromHigh([-0.005, 0.03, -0.1, 0]);
// Complex-root extension: (x² + 1)(x − 2)(x − 6).
export const COMPLEX = () => fromHigh([1, 0, 1]);

// The four parent examples for the end-behaviour explorer.
export const PARENTS = Object.freeze([1, 2, 3, 4]);

// ---------- validated sets ----------
// Mission 3 practice ("find the hidden crossing"): cubics with rational roots.
export const ZERO_PRACTICE = Object.freeze([
  { a: 1, roots: [[1, 1], [3, 1], [5, 1]] },
  { a: 1, roots: [[2, 1], [4, 1], [5, 1]] },
  { a: 1, roots: [[-1, 1], [2, 1], [6, 1]] },
  { a: 1, roots: [[1, 1], [2, 1], [8, 1]] },
  { a: 2, roots: [[0.5, 1], [3, 1], [4, 1]] }
]);
// Mission 4 practice: divisions with integer coefficients (some leave a remainder,
// one has a missing power to keep as a zero coefficient).
export const DIVIDE_PRACTICE = Object.freeze([
  { p: [1, -6, 11, -6], k: 1 },
  { p: [1, 2, -5, 3], k: 1 },
  { p: [2, -3, 0, 4], k: -1 },
  { p: [1, 0, -3, 0, 2], k: 2 },
  { p: [1, 0, 0, -8], k: 2 }
]);
// Final rounds: a(x − r₁)(x − r₂)(x − r₃) with 1/a a whole number, and a test point
// that isn't a zero. Round 1 is the briefing's own F(x).
export const FINAL_SETS = Object.freeze([
  { a: 0.002, roots: [1, 4, 7], test: 2 },
  { a: 0.004, roots: [2, 3, 6], test: 4 },
  { a: 0.0025, roots: [1, 5, 6], test: 3 },
  { a: 0.005, roots: [2, 5, 7], test: 4 },
  { a: 0.001, roots: [1, 3, 8], test: 2 }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
export { poly, Frac };
