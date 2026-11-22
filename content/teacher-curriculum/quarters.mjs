// ============================================================
// TEACHER CURRICULUM: how each course's year is split into quarters.
//
//   Course -> Quarter -> Unit -> Topic -> Lesson plan
//
// Courses, units and topics are the Classes curriculum
// (content/classes/curriculum.mjs), so lessons follow the same structure
// and ids students see. This file only adds the quarters on top; every unit
// must appear in exactly one quarter (check-site.mjs enforces it).
//
// The sequence is PROPOSED: a standard US high-school pacing written for
// Mathlete MTB, not a school's confirmed calendar. When a school confirms
// its own, set `confirmed: true` for that course (the pages then stop
// saying "proposed") and move units between quarters as needed. Unit and
// topic ids never change, so moving them is safe.
//
// After editing, run: node scripts/build-teacher-curriculum.mjs
// ============================================================

// The quarter teachers are in now. Course cards and course pages open on it.
export const CURRENT_QUARTER = 2;

export const SCHOOL_YEAR = '2026–27';

// Approximate dates, shown on the quarter tabs (a typical August start).
export const QUARTER_DATES = {
  1: 'Aug – Oct',
  2: 'Nov – Jan',
  3: 'Jan – Mar',
  4: 'Apr – Jun'
};

// Courses in the order teachers see them, with each quarter's units
// (unit slugs from curriculum.mjs) and a one-line focus.
export const TEACHER_COURSES = [
  {
    course: 'alg1', icon: 'climb', grades: 'Grades 8–9', confirmed: false,
    quarters: [
      { n: 1, focus: 'Expressions, equations and inequalities', units: ['foundations-of-algebra', 'solving-equations-and-inequalities'] },
      { n: 2, focus: 'Slope, linear relationships and functions', units: ['linear-relationships', 'linear-equations-and-functions'] },
      { n: 3, focus: 'Systems, exponents and polynomials', units: ['systems-of-equations', 'exponents-and-exponential-relationships', 'polynomials-and-factoring'] },
      { n: 4, focus: 'Quadratics and data', units: ['quadratic-equations-and-functions', 'data-and-statistics'] }
    ]
  },
  {
    course: 'geo', icon: 'frame', grades: 'Grades 9–10', confirmed: false,
    quarters: [
      { n: 1, focus: 'Points, lines, angles and proof', units: ['foundations-of-geometry', 'reasoning-and-proof'] },
      { n: 2, focus: 'Triangles, quadrilaterals and polygons', units: ['triangles', 'quadrilaterals-and-polygons'] },
      { n: 3, focus: 'Transformations, similarity and circles', units: ['transformations', 'similarity-and-scale', 'circles'] },
      { n: 4, focus: 'Area, volume and coordinate geometry', units: ['area-and-volume', 'coordinate-geometry'] }
    ]
  },
  {
    course: 'alg2', icon: 'jump', grades: 'Grades 10–11', confirmed: false,
    quarters: [
      { n: 1, focus: 'Equations, complex numbers and functions', units: ['equations-and-inequalities', 'functions'] },
      { n: 2, focus: 'Systems, matrices and quadratic functions', units: ['linear-systems-and-matrices', 'quadratic-functions'] },
      { n: 3, focus: 'Polynomial, rational and radical functions', units: ['polynomial-functions', 'rational-and-radical-functions'] },
      { n: 4, focus: 'Exponentials, logarithms, sequences and probability', units: ['exponential-and-logarithmic-functions', 'sequences-and-series', 'probability-and-statistics'] }
    ]
  },
  {
    course: 'precalc', icon: 'wheel', grades: 'Grades 11–12', confirmed: false,
    quarters: [
      { n: 1, focus: 'Advanced, polynomial and rational functions', units: ['advanced-functions', 'polynomial-and-rational-functions'] },
      { n: 2, focus: 'Exponential and logarithmic models, and trigonometry', units: ['exponential-and-logarithmic-functions', 'trigonometry'] },
      { n: 3, focus: 'Trigonometric functions and applications', units: ['trigonometric-functions', 'trigonometric-applications'] },
      { n: 4, focus: 'Vectors, parametric and polar, sequences and limits', units: ['vectors', 'parametric-and-polar-functions', 'sequences-series-and-limits'] }
    ]
  }
];

// Mathlete tools a lesson's activity may launch, by stable id. A lesson
// names a tool by id only; the address comes from here, so there are no
// hand-typed URLs to break. Only live, public tools belong here.
export const TOOLS = {
  'slope-lab':           { name: 'Slope & Linear Relationships Lab', route: 'learning-lab/slope-lab/', kind: 'lab', returns: true },
  'jump-trajectory-lab': { name: 'Jump Trajectory Lab', route: 'learning-lab/jump-trajectory-lab/', kind: 'lab', returns: true },
  'jump-lab':            { name: 'Jump Lab', route: 'learning-lab/jump-lab/', kind: 'lab' },
  'berm-lab':            { name: 'Berm Lab', route: 'learning-lab/berm-lab/', kind: 'lab' },
  'gear-ratio-lab':      { name: 'Gear Ratio Lab', route: 'learning-lab/gear-ratio-lab/', kind: 'tool' },
  'trail-builder':       { name: 'Trail Builder', route: 'learning-lab/trail-builder/', kind: 'tool' },
  'strava-showdown':     { name: 'Strava Showdown', route: 'learning-lab/strava-showdown/', kind: 'tool' },
  'carve-lab':           { name: 'Carve Lab', route: 'learning-lab/carve-lab/', kind: 'lab' }
};

// The four kinds of MTB activity a lesson can have (PRD section 7).
export const ACTIVITY_KINDS = {
  tool: 'Interactive Mathlete Tool',
  lab: 'Mathlete MTB Lab',
  classroom: 'MTB Classroom Activity',
  problem: 'MTB Problem-Based Exercise'
};

// Kinds of independent-practice problem, in the order they're shown.
export const PRACTICE_LEVELS = {
  concept: 'Check the idea',
  standard: 'Core practice',
  mtb: 'On the trail',
  challenge: 'Extension'
};
