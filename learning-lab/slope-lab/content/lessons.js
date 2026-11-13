// Slope & Linear Relationships Lab: lesson text and Explore activities (content only).
// Screens in components/ decide how this looks; the words and numbers live here.

export const INTRO = {
  kicker: 'Slope & Linear Relationships Lab',
  title: 'What makes a trail steep?',
  lede: 'Every trail tells a mathematical story. Whether you’re climbing uphill, descending a mountain, or comparing two different trail sections, you’re working with slope.',
  question: 'How can we describe how steep something is mathematically?',
  action: 'Explore slope',
  stages: [
    ['Learn', 'Rise, run, grade, and slope in graphs, tables and equations.'],
    ['Explore', 'Design trails in the Trail Designer and test your predictions.'],
    ['Practice', '24 questions in three levels, with hints when you want them.'],
    ['Challenge', 'Show the same math works without a bike in sight.']
  ]
};

// Learn topics, in order. `kind` picks the interactive piece on the page.
export const TOPICS = [
  {
    id: 'rise-run', title: 'Rise and run', kind: 'rise-run',
    intro: 'To describe steepness, compare two changes between a starting point and an ending point.',
    terms: [
      ['Rise', 'The vertical change in elevation: how much higher (or lower) you end up.'],
      ['Run', 'The horizontal distance traveled: how far across you went, measured flat.']
    ],
    rule: 'Slope = rise ÷ run',
    after: 'Slope tells you how much something changes vertically for each one unit of horizontal change. A slope of 0.2 means 0.2 ft up for every 1 ft across.',
    steps: [
      ['start', 'Start here: 0 ft across, 1,000 ft elevation.'],
      ['end', 'End here: 600 ft across, 1,120 ft elevation.'],
      ['run', 'Run: the horizontal change, 600 − 0 = 600 ft.'],
      ['rise', 'Rise: the vertical change, 1,120 − 1,000 = 120 ft.'],
      ['direction', 'Riding left to right, the trail goes up, so the rise is positive.'],
      ['slope', 'Slope = rise ÷ run = 120 ÷ 600 = 0.2.']
    ]
  },
  {
    id: 'worked', title: 'Worked example: grade', kind: 'worked',
    intro: 'A mountain bike trail gains 120 feet of elevation over 600 feet of horizontal distance. Calculate its slope.',
    points: [
      'The decimal slope is 0.2.',
      'The percentage grade is 20%.',
      'This means the trail gains 20 feet vertically for every 100 feet horizontally, assuming a constant grade.'
    ],
    warn: 'A 20% grade is not a 20-degree angle.',
    angle: 'The angle a 20% grade makes with flat ground is only about 11.3°. To get a 20° angle you’d need about a 36% grade. Grade compares rise to run; degrees measure the tilt.'
  },
  {
    id: 'types', title: 'Four kinds of slope', kind: 'types',
    intro: 'Read a graph from left to right, the way x increases.',
    types: [
      { id: 'positive', name: 'Positive slope', example: 'Trail gaining elevation', rise: 3, run: 4, words: 'Goes up from left to right.' },
      { id: 'negative', name: 'Negative slope', example: 'Trail descending', rise: -3, run: 4, words: 'Goes down from left to right.' },
      { id: 'zero', name: 'Zero slope', example: 'Flat trail', rise: 0, run: 4, words: 'Flat: rise is 0, so slope = 0 ÷ run = 0.' },
      { id: 'undefined', name: 'Undefined slope', example: 'A vertical line (a cliff, not a trail)', rise: 4, run: 0, words: 'Straight up: run is 0, and you can’t divide by 0.' }
    ],
    direction: 'Direction matters. If x measures distance from the bottom of a hill, a descent heading back toward the bottom goes right to left. The same piece of trail read left to right has a positive slope. The trail didn’t change; the direction you measure in did.'
  },
  {
    id: 'two-points', title: 'Slope from two points', kind: 'two-points',
    intro: 'In school math, the start and end are points (x₁, y₁) and (x₂, y₂). Rise becomes the change in y, and run the change in x.',
    rule: 'm = (y₂ − y₁) ÷ (x₂ − x₁)',
    example: { p1: { x: 2, y: 4 }, p2: { x: 6, y: 12 } },
    steps: ['Identify the first point.', 'Identify the second point.', 'Change in y (rise).', 'Change in x (run).', 'Divide.'],
    tryIt: 'Now pick any two points on the grid and watch the calculation.'
  },
  {
    id: 'graph', title: 'Slope from a graph', kind: 'graph',
    intro: 'Pick two points where the line crosses grid corners. Count the rise and the run between them, then divide.',
    lines: [
      { name: 'Line 1', m: 0.5, b: 1 },
      { name: 'Line 2', m: -2, b: 3 },
      { name: 'Line 3', m: 0, b: -2 },
      { name: 'Line 4', vertical: true, x: 2 }
    ]
  },
  {
    id: 'table', title: 'Slope from a table', kind: 'table',
    intro: 'A table gives you points without a picture. The slope is the change in y compared with the change in x.',
    rows: [[0, 1000], [100, 1020], [200, 1040], [300, 1060]],
    headers: ['Distance x (ft)', 'Elevation y (ft)'],
    after: 'The elevation increases by 20 feet for every 100 feet of horizontal distance.',
    linearNote: 'If the change in y is the same every time x changes by the same amount, the table is linear. If not, the graph curves.',
    check: {
      prompt: 'Is this table linear?',
      x: [0, 1, 2, 3], y: [2, 5, 10, 17]
    }
  },
  {
    id: 'intercept', title: 'Slope-intercept form', kind: 'intercept',
    intro: 'A straight line can be written as y = mx + b.',
    parts: [['m', 'the slope: how much y changes for each 1 in x'], ['b', 'the y-intercept: the value of y when x = 0']],
    example: 'A trail starts at 1,000 ft and rises at a constant grade of 0.2: y = 0.2x + 1,000. Every foot across adds 0.2 ft of elevation; after 500 ft across, y = 0.2 × 500 + 1,000 = 1,100 ft.',
    model: 'This is an idealized constant-grade model. Real trails change grade all the time and don’t follow one straight line, but over a short, steady section, a line is a good description.'
  }
];

// Trail Designer limits (feet; metres are converted from these).
export const DESIGNER = {
  ft: { elev: [0, 3000, 10], run: [0, 2000, 10], start: 1000, end: 1120, run0: 600 },
  m:  { elev: [0, 900, 5],   run: [0, 600, 5],   start: 300,  end: 336,  run0: 180 }
};

// Explore challenges. `check` names the test in components/explore.js.
export const CHALLENGES = [
  { id: 'c1', title: 'Create a 10% grade', goal: 'Adjust the trail until its grade is 10%.', target: 10, check: 'grade',
    tip: '10% means 10 ft of rise for every 100 ft of run.' },
  { id: 'c2', title: 'Create a 20% grade', goal: 'Before you touch anything, predict: to turn a 10% grade into a 20% grade over the same run, what has to happen to the rise?',
    target: 20, check: 'grade-predict',
    predict: { options: [['double', 'It doubles'], ['plus10', 'It goes up by 10 ft'], ['half', 'It halves'], ['same', 'It stays the same']], answer: 'double',
               why: 'Slope = rise ÷ run. With the run fixed, doubling the rise doubles the slope: 10% → 20%.' } },
  { id: 'c3', title: 'Compare two trails', goal: 'Which trail is steeper?', check: 'compare',
    trails: [{ name: 'Trail A', rise: 90, run: 600 }, { name: 'Trail B', rise: 60, run: 300 }],
    options: [['A', 'Trail A: it climbs more'], ['B', 'Trail B: it climbs more per foot across'], ['same', 'They’re equally steep']], answer: 'B',
    why: 'Trail A: 90 ÷ 600 = 0.15 (15%). Trail B: 60 ÷ 300 = 0.20 (20%). B gains less elevation in total, but more for every foot across, so it’s steeper.' },
  { id: 'c4', title: 'Keep the elevation, change the distance', goal: 'The rise is locked at 120 ft. Try at least three different runs, then answer.', check: 'vary-run',
    lockRise: 120, tries: 3,
    options: [['less', 'The longer the run, the less steep'], ['more', 'The longer the run, the steeper'], ['same', 'The slope doesn’t change']], answer: 'less',
    why: 'The same rise spread over more horizontal distance is gentler: slope = rise ÷ run, and dividing by a bigger number gives a smaller slope.' },
  { id: 'c5', title: 'Keep the distance, change the elevation', goal: 'The run is locked at 500 ft. Try at least three different ending elevations, then answer.', check: 'vary-rise',
    lockRun: 500, tries: 3,
    options: [['prop', 'Double the rise and the slope doubles'], ['inverse', 'Double the rise and the slope halves'], ['add', 'Each extra foot of rise adds 1% to the grade']], answer: 'prop',
    why: 'With the run fixed, slope is proportional to rise: double the rise, double the slope. (Each extra foot of rise over 500 ft adds 0.2%, not 1%.)' },
  { id: 'c6', title: 'Build your own trail', goal: 'Design a climb with an 8% grade that is at least 1,000 ft long horizontally.', target: 8, minRun: 1000, check: 'build',
    tip: 'Pick a run of at least 1,000 ft first, then work out the rise you need: rise = 0.08 × run.' }
];

// Prediction cards: reason before you calculate.
export const PREDICTIONS = [
  { id: 'p1', setup: 'A trail gains 100 ft over 500 ft of horizontal distance.', change: 'Keep the same elevation gain but reduce the horizontal distance to 250 ft.',
    answer: 'steeper', before: { rise: 100, run: 500 }, after: { rise: 100, run: 250 } },
  { id: 'p2', setup: 'A trail gains 80 ft over 400 ft.', change: 'Double both the elevation gain and the horizontal distance (160 ft over 800 ft).',
    answer: 'same', before: { rise: 80, run: 400 }, after: { rise: 160, run: 800 } },
  { id: 'p3', setup: 'A trail gains 150 ft over 1,000 ft.', change: 'Keep the distance and raise the gain to 200 ft.',
    answer: 'steeper', before: { rise: 150, run: 1000 }, after: { rise: 200, run: 1000 } },
  { id: 'p4', setup: 'A climb gains 60 ft over 300 ft.', change: 'Stretch the same climb over 600 ft of switchbacks (same 60 ft gain).',
    answer: 'less', before: { rise: 60, run: 300 }, after: { rise: 60, run: 600 } }
];
export const PREDICTION_CHOICES = [['steeper', 'It becomes steeper'], ['less', 'It becomes less steep'], ['same', 'It stays the same']];
