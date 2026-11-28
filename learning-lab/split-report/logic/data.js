// The Split Report: the fictional team and every dataset. All of it is
// fictional instructional data created for Mathlete MTB, so every answer is
// reproducible and every graph predictable; none of it is a real UCI or
// Crankworx result or any real athlete's data. Times are in seconds, and
// lower times are faster. Every statistic shown is computed from these
// numbers by the kit's engine (lesson-kit/stats.js); none is typed in. Pure; no DOM.

export const TEAM = 'Northstar Gravity Racing';
export const DATA_NOTE = 'Northstar Gravity Racing, its riders and every time in this lab are fictional instructional data created for Mathlete MTB. They are not real UCI, Crankworx or athlete results. Times are in seconds, and lower times are faster.';
export const SIM_NOTE = 'Simulation: these points are generated for exploring, not measured from riders.';
export const AFFILIATION_NOTE = 'Mathlete MTB isn’t affiliated with the UCI, Crankworx, ChronoRace or Gravity Lab. They’re named only as real-world examples of where race data comes from.';
export const MODEL_NOTE = 'A line of best fit describes this sample. It can’t reliably predict real race results, and an association isn’t proof that practice causes faster times.';
export const DIRECTOR = 'Performance Director Kai Rowe';

// ---------- Activity 01: two riders' practice times on one technical sector ----------
export const RIDER_A = Object.freeze({ id: 'a', label: 'Rider A', name: 'Apex', bib: 14, times: Object.freeze([62, 63, 63, 64, 64, 65, 65, 66]) });
export const RIDER_B = Object.freeze({ id: 'b', label: 'Rider B', name: 'Breakaway', bib: 27, times: Object.freeze([58, 59, 61, 63, 64, 67, 72, 76]) });
export const RIDERS = Object.freeze([RIDER_A, RIDER_B]);
// The shared histogram bins: 58–62, 63–67, 68–72, 73–77.
export const BINS = Object.freeze({ lo: 58, w: 5, n: 4 });

// ---------- Activities 02–04: practice laps against final sector time ----------
// Field names match the PRD: practiceLaps, sectorTimeSeconds.
export const LAPS = Object.freeze([
  [1, 78], [2, 75], [3, 76], [4, 71], [5, 70], [6, 67], [7, 68], [8, 75], [9, 65], [10, 62]
].map(([practiceLaps, sectorTimeSeconds], i) => Object.freeze({ rider: `Rider ${i + 1}`, bib: [3, 8, 11, 19, 22, 31, 36, 42, 47, 55][i], practiceLaps, sectorTimeSeconds })));
export const LAP_X = Object.freeze(LAPS.map(r => r.practiceLaps));
export const LAP_Y = Object.freeze(LAPS.map(r => r.sectorTimeSeconds));
export const OUTLIER = 7;    // Rider 8, at (8, 75): unusual, to be investigated (never deleted)
export const GRID = Object.freeze({ x: [0, 11], y: [60, 80] });

// ---------- the correlation explorer (generated, seeded) ----------
// rho mixes two exactly uncorrelated seeded lists, so the r each plot shows
// is computed from its own points. The curve is y = x² on evenly spaced x.
export const EXPLORER = Object.freeze([
  { id: 'strong-pos', name: 'Strong positive', rho: 0.92 },
  { id: 'weak-pos', name: 'Weak positive', rho: 0.35 },
  { id: 'strong-neg', name: 'Strong negative', rho: -0.92 },
  { id: 'weak-neg', name: 'Weak negative', rho: -0.35 },
  { id: 'none', name: 'No linear correlation', rho: 0 },
  { id: 'curve', name: 'A curved relationship', curve: true }
]);
export const EXPLORER_SEED = 2026, EXPLORER_N = 24;

// ---------- practice and certification datasets (fictional) ----------
// Two more riders' times (Activity 01 practice and Part A of the certification).
export const RIDER_PAIRS = Object.freeze([
  [[70, 71, 71, 72, 73, 73, 74, 75], [66, 68, 69, 72, 74, 77, 79, 84]],
  [[55, 56, 56, 57, 57, 58, 58, 59], [52, 53, 55, 56, 59, 61, 64, 68]],
  [[88, 89, 90, 90, 91, 91, 92, 93], [84, 86, 87, 89, 93, 94, 98, 101]],
  [[47, 48, 48, 49, 50, 50, 51, 52], [44, 45, 47, 48, 50, 53, 57, 60]],
  [[63, 64, 64, 65, 65, 66, 66, 67], [60, 61, 62, 65, 66, 68, 71, 75]],
  [[101, 102, 102, 103, 104, 104, 105, 106], [97, 98, 100, 103, 106, 108, 111, 116]]
]);
export const FINAL_PAIRS = Object.freeze([
  [[72, 73, 73, 74, 75, 75, 76, 77], [68, 69, 71, 74, 76, 79, 82, 86]],
  [[58, 59, 60, 60, 61, 61, 62, 63], [54, 56, 57, 59, 62, 64, 67, 71]],
  [[81, 82, 82, 83, 83, 84, 84, 85], [77, 78, 80, 82, 85, 87, 90, 93]],
  [[66, 67, 67, 68, 69, 69, 70, 71], [62, 63, 65, 67, 70, 72, 75, 79]]
]);
// Paired datasets, each with one unusual point (outlier: its index). Chosen so
// the least-squares slope and intercept come out to one decimal place; the
// engine computes them, and the tests check.
const set = (title, xLabel, xUnit, x, y, outlier, context) => Object.freeze({ title, xLabel, xUnit, x: Object.freeze(x), y: Object.freeze(y), outlier, context });
export const PAIRED = Object.freeze([
  set('Practice laps vs. sector time, the rock garden', 'Practice laps', 'laps', [1, 2, 3, 4, 5, 6, 7, 8], [77, 77, 77, 73, 80, 71, 68, 67], 4, 'practice laps on the rock-garden sector'),
  set('Practice laps vs. sector time, the woods section', 'Practice laps', 'laps', [1, 2, 3, 4, 5, 6, 7, 8], [79, 77, 84, 75, 71, 70, 68, 68], 2, 'practice laps on the woods section'),
  set('Course walk-through vs. sector time', 'Minutes of course walk-through', 'minutes', [2, 4, 6, 8, 10, 12, 14, 16], [89, 88, 86, 90, 81, 79, 80, 75], 3, 'minutes spent walking the course'),
  set('Run number vs. sector time on a long day', 'Run number', 'runs', [1, 2, 3, 4, 5, 6, 7, 8], [58, 59, 58, 68, 61, 63, 63, 66], 3, 'the run number on a long practice day'),
  set('Start order vs. sector time on a rutting track', 'Start order', 'places', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [61, 62, 63, 63, 64, 58, 69, 69, 68, 70], 5, 'start order as the track ruts up'),
  set('Brake checks vs. section time', 'Brake checks in the section', 'checks', [1, 2, 3, 4, 5, 6, 7, 8], [42, 43, 47, 47, 41, 54, 54, 56], 4, 'brake checks counted in the section')
]);
export const FINAL_PAIRED = Object.freeze([
  set('Practice laps vs. sector time, the top section', 'Practice laps', 'laps', [1, 2, 3, 4, 5, 6, 7, 8], [80, 76, 76, 73, 80, 72, 70, 67], 4, 'practice laps on the top section'),
  set('Run number vs. sector time on a hot day', 'Run number', 'runs', [1, 2, 3, 4, 5, 6, 7, 8], [56, 57, 58, 59, 63, 70, 63, 64], 5, 'the run number on a hot practice day'),
  set('Entry speed vs. sector time', 'Speed at the sector entry', 'km/h', [10, 12, 14, 16, 18, 20, 22, 24], [88, 86, 83, 80, 86, 76, 75, 74], 4, 'speed at the sector entry'),
  set('Start order vs. sector time on a drying track', 'Start order', 'places', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [60, 62, 53, 65, 64, 66, 67, 70, 71, 72], 2, 'start order as the track dries and ruts')
]);

// ---------- careers (real-world context, no affiliation) ----------
export const CAREERS = Object.freeze([
  { id: 'timing', name: 'Race Timing Technician', does: 'Works with race timing systems, transponders, split times and results.', math: 'Data collection, organization and quality checks' },
  { id: 'analyst', name: 'Team Performance Analyst', does: 'Helps riders and coaches understand performance data.', math: 'Distributions, scatter plots, correlation and regression' },
  { id: 'scientist', name: 'Sports Scientist', does: 'Studies athlete performance with timing, GPS, movement and physiological measurements.', math: 'Statistics, relationships and comparisons' },
  { id: 'developer', name: 'Cycling Data Developer', does: 'Builds dashboards and tools that make race information useful.', math: 'Graphs, data modeling and prediction' },
  { id: 'journalist', name: 'Race Data Journalist / Broadcast Analyst', does: 'Turns timing information into race insights for viewers.', math: 'Visualizations, trends and interpretation' }
]);
export const REFS = Object.freeze([
  ['Gravity Lab: about and methodology (an independent project turning public downhill timing into sector updates and gap charts)', 'https://gravitylab.live/about'],
  ['UCI Mountain Bike World Series: live timing', 'https://live.ucimtbworldseries.com/'],
  ['Crankworx: results', 'https://www.crankworx.com/results/'],
  ['Physiological characteristics and performance in elite enduro mountain biking (Journal of Science and Cycling)', 'https://jsc-journal.com/index.php/JSC/article/view/318'],
  ['GPS-based evaluation of activity profiles in elite downhill mountain biking (Journal of Science and Cycling)', 'https://www.jsc-journal.com/index.php/JSC/article/view/31'],
  ['Common Core: Interpreting Categorical and Quantitative Data (HSS-ID.A.1–3, B.6, C.7–9)', 'https://www.thecorestandards.org/Math/Content/HSS/ID/'],
  ['OpenStax Introductory Statistics 2e: Linear regression and correlation', 'https://openstax.org/books/introductory-statistics-2e/pages/12-introduction']
]);
