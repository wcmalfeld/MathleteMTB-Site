/* ============================================================
   LEARNING LAB CATEGORIES
   sport: 'mtb' labs are on the home page (index.html) and get a page
   at /learning-lab/<id>/; 'ski' labs are on Mathlete Ski (ski/) and
   get a page at /ski/<id>/. Ids must be unique across both.
   A tool joins a category by setting `category: '<id>'` in
   js/tools-config.js, which also puts it on that sport's home page.
   `upcoming` lists tools still on the drawing board; they show as
   "In development" on the category page.

   After changing anything here, run `node scripts/build-lab.mjs`.
   ============================================================ */
window.MATHLETE_LAB_CATEGORIES = [
  {
    id: 'engineering',
    sport: 'mtb',
    name: 'Engineering Lab',
    focus: 'Physics, motion and mechanical systems: what happens when a rider leaves the lip of a jump, carves a berm or compresses the fork.',
    concepts: ['Algebra', 'Geometry', 'Trigonometry', 'Quadratic functions', 'Physics'],
    upcoming: ['Berm Lab', 'Suspension Setup Studio']
  },
  {
    id: 'trail-crew',
    sport: 'mtb',
    name: 'Trail Crew',
    focus: 'Trail design, mapping, navigation and terrain: plan a line, hit an elevation target and stay on budget.',
    concepts: ['Geometry', 'Coordinate planes', 'Slope', 'Ratios', 'Measurement', 'Calculus'],
    upcoming: ['Trail Map Navigator', 'Pump Track Master']
  },
  {
    id: 'race-team',
    sport: 'mtb',
    name: 'Race Team',
    focus: 'Performance analysis, statistics and speed: read the data, find the fastest line and back your call with numbers.',
    concepts: ['Statistics', 'Probability', 'Percentages', 'Graphing', 'Regression', 'Rates of change'],
    upcoming: ['Speed Trap']
  },
  {
    id: 'bike-workshop',
    sport: 'mtb',
    name: 'Bike Workshop',
    focus: 'Bicycle mechanics and component setup: gearing, wheel sizes and the ratios that decide whether you climb or walk.',
    concepts: ['Fractions', 'Ratios', 'Proportions', 'Unit conversions', 'Algebra', 'Measurement'],
    upcoming: ['Bike Mechanic Challenge', 'Suspension Setup Studio']
  },
  {
    id: 'slope-physics',
    sport: 'ski',
    name: 'Slope Physics',
    focus: 'Gravity, friction and drag on the hill: why steeper runs are faster, how a tuck cuts air resistance and how far you fly off a kicker.',
    concepts: ['Algebra', 'Trigonometry', 'Vectors', 'Energy', 'Physics'],
    upcoming: ['Gravity & Friction Run', 'Kicker Air Time']
  },
  {
    id: 'mountain-ops',
    sport: 'ski',
    name: 'Mountain Ops',
    focus: 'Trail maps, slope angles and snow: read contour lines, rate a run by its steepest pitch and plan the grooming and snowmaking.',
    concepts: ['Geometry', 'Slope', 'Contour maps', 'Rates', 'Measurement'],
    upcoming: ['Slope Angle Finder', 'Snowmaking Planner']
  },
  {
    id: 'race-room',
    sport: 'ski',
    name: 'Race Room',
    focus: 'Gates, splits and race data: compare runs, find where time was lost and pick the fastest line through the course.',
    concepts: ['Statistics', 'Percentages', 'Graphing', 'Rates of change'],
    upcoming: ['Gate Timing Challenge']
  },
  {
    id: 'tuning-bench',
    sport: 'ski',
    name: 'Tuning Bench',
    focus: 'Ski and binding setup: sidecut geometry, turn radius, edge angles and the ratios behind a good tune.',
    concepts: ['Geometry', 'Circles', 'Angles', 'Ratios', 'Unit conversions'],
    upcoming: ['Sidecut & Turn Radius', 'Edge Angle Workshop']
  }
];
