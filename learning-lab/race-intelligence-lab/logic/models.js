// Enduro Race Intelligence Lab: the scenarios. One authoritative data source
// per scenario; every table, graph, simulation and answer derives from here
// (calculations in stats.js). Pure; no DOM.
//
// All data is SIMULATED for teaching: none of it is a real race result, and
// nothing here is a safety recommendation about riding, weather, equipment
// or trail conditions. Observational associations are not proof of causation.

import { twoWay, population } from './stats.js';

// ---------- Mission 1: Race-Day Probability ----------
export const RACE = Object.freeze({ rows: ['Dry', 'Wet'], cols: ['Hit target', 'Missed target'], cells: [[84, 36], [40, 40]] });
export const raceTable = () => twoWay(RACE);
export const CARDS = Object.freeze({ features: ['Berm', 'Jump', 'Rock garden'], conditions: ['Dry', 'Wet'] });

// ---------- Mission 2: Who's Actually Fast? ----------
export const ALPHA = Object.freeze([172, 174, 176, 178, 180, 180, 182, 184, 186, 188]);
export const BRAVO = Object.freeze([160, 168, 172, 176, 180, 180, 184, 188, 192, 200]);
export const NORMAL = Object.freeze({ mu: 180, sigma: 12, example: 168, challenge: 204 });

// ---------- Mission 3: The Rider Sample Lab ----------
export const SURVEY = Object.freeze({ N: 1000, flow: 600, n: 100, x: 62, sizes: Object.freeze([25, 50, 100, 200]), seed: 7 });
export const riders = () => population(SURVEY.N, SURVEY.flow, SURVEY.seed);
// The flawed survey: riders at the jump line lean technical in this simulation.
export const JUMP_LINE = Object.freeze({ size: 60, technicalShare: 0.75 });

// ---------- Mission 4: The Race Strategy Experiment ----------
export const EXPERIMENT = Object.freeze({
  A: Object.freeze([10, 5, 6, 9, 8, 5, 4, 10, 8, 6, 8, 10, 9, 6, 9, 5, 6, 10, 10, 4]),     // printed trail map
  B: Object.freeze([9, 11, 10, 8, 10, 10, 11, 12, 9, 9, 11, 8, 9, 10, 6, 7, 7, 12, 11, 8]),  // annotated video preview
  features: 12, reps: 50000, seed: 2026, alpha: 0.05
});

// ---------- extension ----------
export const PODIUM = Object.freeze({ n: 8, r: 3 });

// ---------- validated sets ----------
// Mission 1 practice: other simulated tables (dry/wet × hit/missed).
export const RACE_PRACTICE = Object.freeze([
  [[54, 26], [48, 72]], [[70, 30], [35, 65]], [[30, 20], [90, 60]], [[88, 22], [36, 54]], [[45, 15], [70, 70]]
]);
// Mission 2 practice: a time under a stated normal model.
export const Z_PRACTICE = Object.freeze([
  { mu: 180, sigma: 12, x: 186 }, { mu: 240, sigma: 15, x: 270 }, { mu: 95, sigma: 8, x: 83 }, { mu: 180, sigma: 12, x: 150 }, { mu: 300, sigma: 20, x: 325 }
]);
// Mission 3 practice: a random sample of n with x preferring flow.
export const SAMPLE_PRACTICE = Object.freeze([{ n: 50, x: 30 }, { n: 200, x: 130 }, { n: 80, x: 52 }, { n: 120, x: 42 }, { n: 250, x: 175 }]);
// Mission 4 practice: study-design scenarios.
export const DESIGN_PRACTICE = Object.freeze([
  { text: 'The team emails every registered rider and asks which tire tread they prefer.', kind: 'survey' },
  { text: 'Analysts compare last season’s stage times for riders who happened to use clipless pedals with those who used flats.', kind: 'observational' },
  { text: 'Thirty riders are randomly split into two groups: one warms up on rollers, one on the trail. Both then ride the same timed segment.', kind: 'experiment' },
  { text: 'A coach records how many hours each rider says they slept and compares it with their race result.', kind: 'observational' },
  { text: 'A coin flip decides whether each of 24 riders previews a stage on foot or on video before a memory test.', kind: 'experiment' }
]);
// Final rounds. Round 1 is the PRD's report.
export const FINAL_SETS = Object.freeze([
  { A: [[84, 36], [40, 40]], B: { mu: 180, sigma: 12, x: 162 }, C: { n: 100, x: 62 }, D: EXPERIMENT },
  { A: [[72, 48], [48, 32]], B: { mu: 180, sigma: 12, x: 198 }, C: { n: 200, x: 90 },
    D: { A: [7, 8, 6, 9, 7, 8, 10, 6, 7, 9, 8, 7, 9, 6, 8, 7, 10, 8, 9, 7], B: [8, 7, 9, 8, 7, 9, 10, 7, 8, 9, 8, 6, 9, 7, 9, 8, 10, 7, 9, 8] } },
  { A: [[63, 27], [66, 44]], B: { mu: 180, sigma: 12, x: 174 }, C: { n: 50, x: 35 },
    D: { A: [6, 7, 5, 8, 6, 9, 9, 5, 6, 8, 7, 6, 10, 5, 7, 6, 9, 7, 8, 6], B: [8, 7, 10, 7, 9, 10, 6, 9, 11, 8, 7, 5, 10, 9, 6, 10, 8, 11, 7, 8] } },
  { A: [[45, 55], [60, 40]], B: { mu: 180, sigma: 12, x: 210 }, C: { n: 400, x: 248 },
    D: { A: [8, 9, 7, 10, 6, 9, 8, 7, 9, 10, 8, 7, 6, 9, 8, 10, 7, 8, 9, 6], B: [9, 8, 10, 7, 9, 8, 11, 9, 8, 7, 10, 9, 8, 9, 7, 10, 8, 9, 11, 8] } },
  { A: [[96, 64], [16, 24]], B: { mu: 180, sigma: 12, x: 156 }, C: { n: 150, x: 48 },
    D: { A: [5, 7, 6, 10, 4, 6, 7, 5, 9, 6, 8, 5, 6, 8, 7, 4, 9, 7, 5, 6], B: [8, 9, 5, 10, 6, 9, 6, 10, 8, 4, 11, 7, 9, 6, 10, 9, 5, 8, 7, 10] } }
]);
export const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
export const tableOf = cells => twoWay({ rows: RACE.rows, cols: RACE.cols, cells });
