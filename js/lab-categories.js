/* ============================================================
   LEARNING LAB CATEGORIES
   Each one gets a page at /learning-lab/<id>/. A tool joins a
   category by setting `category: '<id>'` in js/tools-config.js.
   `upcoming` lists tools still on the drawing board; they show as
   "In development" on the category page.

   After changing anything here, run `node scripts/build-lab.mjs`.
   ============================================================ */
window.MATHLETE_LAB_CATEGORIES = [
  {
    id: 'engineering',
    name: 'Engineering Lab',
    focus: 'Physics, motion and mechanical systems: what happens when a rider leaves the lip of a jump, carves a berm or compresses the fork.',
    concepts: ['Algebra', 'Geometry', 'Trigonometry', 'Quadratic functions', 'Physics'],
    upcoming: ['Berm Lab', 'Suspension Setup Studio']
  },
  {
    id: 'trail-crew',
    name: 'Trail Crew',
    focus: 'Trail design, mapping, navigation and terrain: plan a line, hit an elevation target and stay on budget.',
    concepts: ['Geometry', 'Coordinate planes', 'Slope', 'Ratios', 'Measurement', 'Calculus'],
    upcoming: ['Trail Map Navigator', 'Pump Track Master']
  },
  {
    id: 'race-team',
    name: 'Race Team',
    focus: 'Performance analysis, statistics and speed: read the data, find the fastest line and back your call with numbers.',
    concepts: ['Statistics', 'Probability', 'Percentages', 'Graphing', 'Regression', 'Rates of change'],
    upcoming: ['Speed Trap']
  },
  {
    id: 'bike-workshop',
    name: 'Bike Workshop',
    focus: 'Bicycle mechanics and component setup: gearing, wheel sizes and the ratios that decide whether you climb or walk.',
    concepts: ['Fractions', 'Ratios', 'Proportions', 'Unit conversions', 'Algebra', 'Measurement'],
    upcoming: ['Bike Mechanic Challenge', 'Suspension Setup Studio']
  }
];
