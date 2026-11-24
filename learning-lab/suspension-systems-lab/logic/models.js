// Suspension & Systems Lab: the scenarios. Every graph, readout, question
// and answer comes from here (calculations in expo.js). Pure; no DOM.
//
// Simplified educational models only:
//   - the suspension model is the exponential decay envelope of successive
//     oscillation peaks, not a complete physical model of a real shock, and
//     its values are not suspension settings or specifications;
//   - the registrations are fictional, over a limited planning window, not a
//     prediction of unlimited event growth;
//   - the sound readings are fictional and use the definition of sound
//     intensity level; this is not a safety assessment of event noise.

import { decayRate } from './expo.js';

// ---------- Mission 1: Tune the Bounce ----------
// Aₙ = A₀rⁿ (peaks per cycle), and the continuous envelope A(t) = A₀e^(−kt).
export const BOUNCE = Object.freeze({ A0: 18, r: 0.65, period: 0.5, threshold: 2, cycles: 6, linearStep: 6.3 });
export const K = decayRate(BOUNCE.r, BOUNCE.period);           // ≈ 0.8616 per second, kept at full precision

// ---------- Mission 2: Grow the Ride ----------
export const GROW = Object.freeze({ R0: 100, pct: 20, weeks: 6, capacity: 300, target: 250, linearStep: 20 });

// ---------- Mission 3: Decode the Sound ----------
export const SOUND = Object.freeze({
  locations: Object.freeze([
    { name: 'Quiet trail zone', e: -8 }, { name: 'Warm-up area', e: -7 },
    { name: 'Pump track competition', e: -5 }, { name: 'Event PA area', e: -4 }
  ]),
  reading: 75
});

// ---------- validated sets ----------
// Mission 1 challenge: a new shock envelope (A₀ mm, retained fraction r, threshold mm, a cycle to evaluate).
export const BOUNCE_PRACTICE = Object.freeze([
  { A0: 20, r: 0.6, threshold: 3, at: 3 }, { A0: 15, r: 0.7, threshold: 2, at: 4 }, { A0: 22, r: 0.55, threshold: 2.5, at: 2 },
  { A0: 12, r: 0.8, threshold: 3, at: 5 }, { A0: 25, r: 0.45, threshold: 1.5, at: 3 }
]);
// Mission 2 challenge: start, weekly %, target.
export const GROW_PRACTICE = Object.freeze([
  { R0: 80, pct: 25, target: 250 }, { R0: 120, pct: 10, target: 200 }, { R0: 60, pct: 30, target: 180 },
  { R0: 200, pct: 5, target: 260 }, { R0: 90, pct: 15, target: 180 }
]);
// Mission 3 challenge: a decibel reading to turn back into an intensity.
export const SOUND_PRACTICE = Object.freeze([{ L: 65 }, { L: 85 }, { L: 92 }, { L: 58 }, { L: 47 }]);
// Final rounds. Round 1 is the PRD's report.
export const FINAL_SETS = Object.freeze([
  { A: { A0: 24, r: 0.7, at: 4, threshold: 3 }, B: { R0: 150, pct: 15, at: 4, target: 250, step: 22.5 }, C: { L: 80 }, D: { A0: 24, k: 0.9, target: 4 } },
  { A: { A0: 30, r: 0.6, at: 3, threshold: 2 }, B: { R0: 120, pct: 25, at: 3, target: 300, step: 30 }, C: { L: 90 }, D: { A0: 30, k: 0.75, target: 5 } },
  { A: { A0: 20, r: 0.75, at: 5, threshold: 2.5 }, B: { R0: 80, pct: 30, at: 2, target: 200, step: 24 }, C: { L: 60 }, D: { A0: 20, k: 1.2, target: 2 } },
  { A: { A0: 16, r: 0.55, at: 3, threshold: 1.5 }, B: { R0: 200, pct: 10, at: 5, target: 300, step: 20 }, C: { L: 100 }, D: { A0: 40, k: 0.6, target: 10 } },
  { A: { A0: 28, r: 0.8, at: 4, threshold: 4 }, B: { R0: 50, pct: 40, at: 3, target: 250, step: 20 }, C: { L: 110 }, D: { A0: 36, k: 0.8, target: 3 } }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
