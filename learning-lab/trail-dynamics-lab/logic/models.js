// Trail Dynamics Lab: the scenarios. Every graph, readout, question and
// answer comes from here (exact algebra in quadratic.js). Pure; no DOM.
//
// All braking numbers are a simplified teaching model, not riding advice:
// real stopping depends on terrain, traction, slope, tires, technique and
// the rider. The jump is a simplified parabolic model, not a physical
// prediction of a rider's flight.
//   v: speed (km/h), 0 ≤ v ≤ 40 in the simulator; distances in metres.
//   x: horizontal distance from takeoff (m); J(x): height above the
//      reference ground (m), takeoff and landing at the same elevation.

import { quad, solve, atHeight, meetLine, Frac, show } from './quadratic.js';

// ---------------------------------------------------------- braking (one config, no numbers in the UI)
export const BRAKE = Object.freeze({
  reaction: 0.9,                                  // s, a fixed simulation assumption
  models: Object.freeze({ A: 0.01, B: 0.015 }),   // hypothetical k values for the learning simulation
  domain: Object.freeze([0, 40])
});
// R(v) = (t / 3.6) v : km/h → m/s is ÷ 3.6, times the reaction time.
export const reactionRate = () => Frac.of(BRAKE.reaction).div(new Frac(36, 10));   // 0.25
export const R = v => Number(reactionRate()) * v;
export const Bk = (k, v) => k * v * v;
export const D = (k, v) => Bk(k, v) + R(v);
export const stopping = (model, v) => { const k = BRAKE.models[model]; return { model, k, v, reaction: R(v), braking: Bk(k, v), total: D(k, v) }; };
// D(v) = d  →  kv² + 0.25v − d = 0 (as an exact quadratic)
export const stopEquation = (model, d) => quad(BRAKE.models[model], reactionRate(), Frac.of(d).neg());
export function speedFor(model, d) {
  const S = solve(stopEquation(model, d));
  const valid = S.type === 'two' ? S.roots.filter(r => Number(r) >= 0) : [];
  return { S, valid: valid.map(Number), rejected: (S.type === 'two' ? S.roots : []).map(Number).filter(r => r < 0) };
}
// The PRD's comparison table.
export const TABLE_SPEEDS = Object.freeze([0, 20, 30, 40]);

// ---------------------------------------------------------- the jump
export const JUMP = Object.freeze({ a: -0.04, b: 0.8, c: 0, domain: Object.freeze([0, 20]) });
export const J = () => quad(JUMP.a, JUMP.b, JUMP.c);
// Heights the Landing Analyzer starts from (PRD scenarios).
export const HEIGHTS = Object.freeze([3, 2, 4, 5]);
// A landing ramp as a straight line y = −0.5x + 10 (a linear–quadratic system).
export const RAMP = Object.freeze({ m: -0.5, q: 10 });
export const rampMeet = (m = RAMP.m, q = RAMP.q) => solve(meetLine(J(), m, q));

// ---------------------------------------------------------- validated sets
// Brake practice (Mission 1): whole-number speeds for each modelled distance,
// none shared with the final rounds.
export const BRAKE_PRACTICE = Object.freeze([
  { model: 'A', d: 26 }, { model: 'B', d: 34 }, { model: 'A', d: 3.5 }, { model: 'B', d: 15.625 }, { model: 'B', d: 27.125 }
]);
// Factoring practice (Mission 2): some factor over the integers, some don't.
export const FACTOR_PRACTICE = Object.freeze([
  { a: 1, b: -12, c: 32 }, { a: 1, b: -20, c: 50 }, { a: 1, b: -14, c: 45 }, { a: 1, b: -16, c: 40 }, { a: 1, b: -10, c: 21 }, { a: 1, b: -10, c: 25 }
]);
// Final rounds. Round 1 is the briefing's own numbers. Each round's target
// height gives irrational roots, so Challenge C needs the quadratic formula.
export const FINAL_SETS = Object.freeze([
  { brake: { model: 'A', d: 21 }, jump: { a: -0.05, b: 0.8 }, height: 2 },
  { brake: { model: 'A', d: 12.5 }, jump: { a: -0.02, b: 0.4 }, height: 0.5 },
  { brake: { model: 'B', d: 4 }, jump: { a: -0.1, b: 1.2 }, height: 3 },
  { brake: { model: 'A', d: 6 }, jump: { a: -0.04, b: 0.64 }, height: 1 },
  { brake: { model: 'B', d: 11 }, jump: { a: -0.025, b: 0.6 }, height: 3 }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
export { quad, solve, atHeight, show, Frac };
export const nf = x => String(Number(Number(x).toPrecision(12)));
