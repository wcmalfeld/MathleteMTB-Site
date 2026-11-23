// Enduro Route Intelligence Lab: the scenarios. Every graph, readout,
// question and answer comes from here (exact algebra in rational.js). Pure; no DOM.
//
// All of it is a fictional educational model: one representative average
// speed per section, a made-up 5 km/h difference between sections, an
// idealised circular wheel and an idealised survey.
// It is not race, trail-construction or bike-fit advice.
//   speeds v in km/h, times in minutes, distances in km (timing) or m (survey), wheel in m

import { rat, ratHigh, add, sub, mul, div, constant, poly, fromHigh, Frac } from './rational.js';

// ---------- Mission 1: Beat the Clock ----------
// T(v) = t0 + 60D/v
export const CLOCK = Object.freeze({ D: 6, t0: 8, table: Object.freeze([12, 18, 24, 30]), target: 26 });
export const clock = (D = CLOCK.D, t0 = CLOCK.t0) => add(constant(t0), ratHigh([60 * D], [1, 0]));
export const stageTime = (D, v) => 60 * D / v;

// ---------- Mission 2: The Stage Timing Console ----------
// Flow section d1 km at v, technical d2 km at v − diff, transition t0.
export const SPLIT = Object.freeze({ d1: 2, d2: 1, diff: 5, t0: 8, check: 15, target: 22 });
export const flowTime = (s = SPLIT) => ratHigh([60 * s.d1], [1, 0]);
export const techTime = (s = SPLIT) => ratHigh([60 * s.d2], [1, -s.diff]);
export const split = (s = SPLIT) => add(add(constant(s.t0), flowTime(s)), techTime(s));
// The target equation, cleared of fractions: K v² − (K·diff + 60d1 + 60d2) v + 60·d1·diff = 0, K = target − t0.
export function splitQuadratic(s, target) {
  const K = target - s.t0;
  return fromHigh([K, -(K * s.diff + 60 * s.d1 + 60 * s.d2), 60 * s.d1 * s.diff]);
}
export const PER_KM = () => ratHigh([60], [1, 0]);                    // P(v) = 60/v
export const SPEED_RATIO = () => ratHigh([1, 0], [1, -5]);           // R(v) = v/(v − 5)
// The calibration diagnostic (a data example, not bike performance).
export const CAL = () => ratHigh([1, 0, -25], [1, -5]);

// ---------- Mission 3: Survey the Line ----------
export const SURVEY = Object.freeze({ run: 120, h: 16, measured: 122, range: Object.freeze([-60, 60]) });
export const surveyD = (h, run = SURVEY.run) => Math.sqrt(run * run + h * h);
// The fictional console warning: √(r² + 16) = r − 2.
export const WARNING = Object.freeze({ c: 16, minus: 2 });

// ---------- Mission 4: Wheel Geometry Lab ----------
export const WHEEL = Object.freeze({ R: 0.36, x: 0.3, height: 0.3 });
export const wheelY = (x, R = WHEEL.R, h = 0, k = 0) => { const r = R * R - (x - h) * (x - h); return r < -1e-12 ? null : k + Math.sqrt(Math.max(0, r)); };
export const STUDIO = Object.freeze({ a: 2, h: 3, k: 1 });
export const CUBE = Object.freeze({ V: 125 });

// ---------- validated sets ----------
// Mission 1 practice: a target total time; the speed comes out whole.
export const CLOCK_PRACTICE = Object.freeze([
  { D: 6, t0: 8, target: 32 }, { D: 4, t0: 5, target: 29 }, { D: 10, t0: 6, target: 36 }, { D: 3, t0: 4, target: 16 }, { D: 8, t0: 10, target: 34 }
]);
// Mission 2 independent challenge: new distances and speed differences. The
// cleared equation factors; one root is a whole speed above diff, the other is rejected.
export const SPLIT_PRACTICE = Object.freeze([
  { d1: 1, d2: 2, diff: 6, t0: 5, v: 12 }, { d1: 1, d2: 2, diff: 10, t0: 5, v: 20 }, { d1: 2, d2: 2, diff: 4, t0: 6, v: 12 },
  { d1: 4, d2: 1, diff: 4, t0: 5, v: 16 }, { d1: 3, d2: 3, diff: 8, t0: 6, v: 20 }
]);
// Mission 3 practice: a run and a measured direct distance (Pythagorean triples).
export const SURVEY_PRACTICE = Object.freeze([
  { run: 120, D: 130 }, { run: 80, D: 82 }, { run: 60, D: 61 }, { run: 40, D: 41 }, { run: 96, D: 104 }
]);
// Mission 4 practice: rational exponents that come out whole.
export const EXP_PRACTICE = Object.freeze([
  { b: 27, p: 2, q: 3 }, { b: 32, p: 3, q: 5 }, { b: 81, p: 3, q: 4 }, { b: 64, p: 5, q: 6 }, { b: 125, p: 2, q: 3 }
]);
// Final rounds. Round 1 is the briefing's course, except A's target: the PRD
// asks for the speed giving 26 min right after T(15) = 26, so it's 31 min here.
export const FINAL_SETS = Object.freeze([
  { A: { D: 5, t0: 6, v: 15, target: 31 }, B: { d1: 3, d2: 2, diff: 5, t0: 5, v: 15 }, C: { run: 120, h: 16 } },
  { A: { D: 4, t0: 5, v: 12, target: 21 }, B: { d1: 2, d2: 2, diff: 6, t0: 4, v: 30 }, C: { run: 80, h: 12 } },
  { A: { D: 8, t0: 10, v: 16, target: 34 }, B: { d1: 4, d2: 2, diff: 10, t0: 6, v: 20 }, C: { run: 100, h: 25 } },
  { A: { D: 3, t0: 4, v: 12, target: 24 }, B: { d1: 3, d2: 2, diff: 8, t0: 5, v: 18 }, C: { run: 150, h: 20 } },
  { A: { D: 10, t0: 12, v: 20, target: 37 }, B: { d1: 2, d2: 3, diff: 8, t0: 6, v: 20 }, C: { run: 72, h: 18 } }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
export { rat, ratHigh, add, sub, mul, div, constant, poly, fromHigh, Frac };
