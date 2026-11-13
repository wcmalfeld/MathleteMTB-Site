// Slope & Linear Relationships Lab: the question bank (content only).
// Every answer here is re-derived from the numbers in the question by
// scripts/test-slope-lab.mjs using logic/slope.js, so a typo in an answer
// fails the test.
//
// Question fields:
//   id, set ('practice' | 'transfer'), level (1 Foundations, 2 Application, 3 Challenge),
//   objective (see OBJECTIVES), skill (short description), context ('mtb' | 'none'),
//   type: 'number' | 'fields' | 'choice' | 'plot'
//   prompt, math? (lines shown under the prompt), diagram? (profile | graph | table),
//   number:  answer, format ('slope' | 'percent' | 'number'), unit?, places?, inverse?, traps?, undefinedButton?
//   fields:  fields [{ id, label, answer, format, unit?, traps? }]
//   choice:  options [{ id, text | table, correct?, feedback? }]
//   plot:    line { m, b }, grid { x: [min, max], y: [min, max] }
//   concept  what to say when an answer is wrong (the idea, not the answer)
//   hints    progressive: each says a little more; the last is one step short of the answer
//   explanation  the full solution, shown once it's right or the student asks to see it

export const OBJECTIVES = {
  'rise-run':     'Identify rise and run',
  'slope-types':  'Positive, negative, zero and undefined slope',
  'rise-over-run':'Calculate slope as rise ÷ run',
  'grade':        'Percentage grade (and why it isn’t an angle)',
  'two-points':   'Slope from two points',
  'table':        'Slope and linearity from a table',
  'graph':        'Slope from a graph',
  'equation':     'Slope-intercept form, y = mx + b',
  'rate':         'Rate of change in context, with units'
};

export const LEVELS = {
  1: { name: 'Foundations', blurb: 'Rise and run, positive and negative slope, simple slopes, percentage grade.' },
  2: { name: 'Application', blurb: 'Two points, tables, graphs, grade problems and reading equations.' },
  3: { name: 'Challenge', blurb: 'Writing equations, comparing relationships, multi-step problems and units.' }
};

export const QUESTIONS = [
  // ---------------- Level 1: Foundations ----------------
  {
    id: 'F1', set: 'practice', level: 1, objective: 'rise-run', skill: 'Identify rise and run from a trail profile', context: 'mtb', type: 'fields',
    prompt: 'A trail section starts at an elevation of 1,200 ft and ends at 1,260 ft. It covers 400 ft of horizontal distance. What are the rise and the run?',
    diagram: { kind: 'profile', start: { x: 0, y: 1200 }, end: { x: 400, y: 1260 }, unit: 'ft' },
    fields: [
      { id: 'rise', label: 'Rise', answer: 60, format: 'number', unit: 'ft',
        traps: [{ value: 1260, message: '1,260 ft is where the trail ends. Rise is the change in elevation: end minus start.' },
                { value: 1200, message: '1,200 ft is where the trail starts. Rise is the change: end minus start.' },
                { value: -60, message: 'The trail ends higher than it starts, so the rise is positive.' }] },
      { id: 'run', label: 'Run', answer: 400, format: 'number', unit: 'ft' }
    ],
    concept: 'Rise is the vertical change (how much the elevation changes). Run is the horizontal change (how far across the trail goes).',
    hints: ['Rise is a change in elevation, not an elevation. Which two elevations are given?', 'Rise = ending elevation − starting elevation.', '1,260 − 1,200 = ?  The run is the horizontal distance you were given.'],
    explanation: 'Rise = 1,260 − 1,200 = 60 ft. Run = 400 ft, the horizontal distance. (The slope would be 60 ÷ 400 = 0.15.)'
  },
  {
    id: 'F2', set: 'practice', level: 1, objective: 'slope-types', skill: 'Recognize a negative slope', context: 'mtb', type: 'choice',
    prompt: 'On a graph of elevation (y) against horizontal distance (x), a downhill section goes down from left to right. What kind of slope does its line have?',
    diagram: { kind: 'graph', x: [0, 10], y: [0, 10], lines: [{ m: -0.6, b: 8.5 }], xLabel: 'distance', yLabel: 'elevation', ticks: false },
    options: [
      { id: 'pos', text: 'Positive', feedback: 'A positive slope goes up from left to right: y increases as x increases. This line goes down.' },
      { id: 'neg', text: 'Negative', correct: true },
      { id: 'zero', text: 'Zero', feedback: 'A zero slope is flat: y doesn’t change at all. This line drops.' },
      { id: 'und', text: 'Undefined', feedback: 'Undefined slope is a vertical line (run of 0). This line moves across as well as down.' }
    ],
    concept: 'Read a graph left to right. Going up means positive slope, going down means negative, flat means zero, and straight up and down is undefined.',
    hints: ['As x increases (moving right), what happens to y?', 'y goes down as x goes up, so the rise is negative while the run is positive.'],
    explanation: 'Negative. Moving right, the elevation drops: a negative rise over a positive run gives a negative slope.'
  },
  {
    id: 'F3', set: 'practice', level: 1, objective: 'rise-over-run', skill: 'Calculate a simple slope', context: 'mtb', type: 'number',
    prompt: 'A trail gains 50 ft of elevation over 250 ft of horizontal distance. What is its slope, as a decimal?',
    answer: 0.2, format: 'slope', inverse: true,
    traps: [{ value: 200, message: 'That’s 250 − 50. Slope compares the two by dividing: rise ÷ run.' }],
    concept: 'Slope = rise ÷ run: how much elevation you gain for each unit of horizontal distance.',
    hints: ['Which number is the rise and which is the run?', 'Slope = rise ÷ run.', 'Work out 50 ÷ 250.'],
    explanation: 'Slope = rise ÷ run = 50 ÷ 250 = 0.2. The trail gains 0.2 ft of elevation for every 1 ft across.'
  },
  {
    id: 'F4', set: 'practice', level: 1, objective: 'grade', skill: 'Convert a slope to a percentage grade', context: 'mtb', type: 'number',
    prompt: 'A fire road has a slope of 0.08. What is its percentage grade?',
    answer: 8, format: 'percent', unit: '%',
    traps: [{ value: 0.8, message: 'To turn a decimal into a percentage, multiply by 100 (move the decimal point two places right).' }],
    concept: 'Percentage grade = slope × 100. It tells you the rise for every 100 units of run.',
    hints: ['A percentage is “out of 100”.', 'Grade = slope × 100.'],
    explanation: '0.08 × 100 = 8%. The road rises 8 ft for every 100 ft across.'
  },
  {
    id: 'F5', set: 'practice', level: 1, objective: 'grade', skill: 'Find a percentage grade from rise and run', context: 'mtb', type: 'number',
    prompt: 'A trail gains 90 feet of elevation over 450 feet of horizontal distance. What is its percentage grade?',
    answer: 20, format: 'percent', unit: '%', inverse: false,
    traps: [{ value: 500, message: 'That’s run ÷ rise × 100. Slope is rise ÷ run: elevation change on top.' }],
    concept: 'First find the slope (rise ÷ run), then turn it into a percentage.',
    hints: ['Which two quantities do we need to compare?', 'Remember that slope is rise divided by run.', 'Divide 90 by 450.', 'Convert the decimal into a percentage.'],
    explanation: 'Slope = 90 ÷ 450 = 0.2. Grade = 0.2 × 100 = 20%.'
  },
  {
    id: 'F6', set: 'practice', level: 1, objective: 'slope-types', skill: 'Slope of a horizontal line', context: 'none', type: 'choice',
    prompt: 'What is the slope of this line?',
    diagram: { kind: 'graph', x: [-5, 5], y: [-5, 5], lines: [{ m: 0, b: 3 }], points: [{ x: -2, y: 3 }, { x: 2, y: 3 }] },
    options: [
      { id: 'zero', text: '0', correct: true },
      { id: 'three', text: '3', feedback: '3 is the line’s height: where it crosses the y-axis. Slope is about steepness: how much y changes when x changes.' },
      { id: 'und', text: 'Undefined', feedback: 'Undefined slope belongs to a vertical line. This one is horizontal: it moves across but never up or down.' },
      { id: 'one', text: '1', feedback: 'A slope of 1 would rise 1 for every 1 across. Does this line rise at all?' }
    ],
    concept: 'Slope measures how much y changes as x changes. A flat line never changes y.',
    hints: ['Pick two points on the line. How much does y change between them?', 'The rise is 0. What is 0 divided by any run?'],
    explanation: 'Between (−2, 3) and (2, 3) the rise is 0 and the run is 4, so the slope is 0 ÷ 4 = 0. Horizontal lines have zero slope.'
  },
  {
    id: 'F7', set: 'practice', level: 1, objective: 'rise-run', skill: 'Rise, run and slope of a descent', context: 'mtb', type: 'fields',
    prompt: 'Riding left to right, a descent drops from 480 m of elevation to 450 m over 150 m of horizontal distance. What are the rise, the run and the slope?',
    diagram: { kind: 'profile', start: { x: 0, y: 480 }, end: { x: 150, y: 450 }, unit: 'm' },
    fields: [
      { id: 'rise', label: 'Rise', answer: -30, format: 'number', unit: 'm',
        traps: [{ value: 30, message: 'The trail ends lower than it starts. Rise = end − start = 450 − 480, which is negative.' }] },
      { id: 'run', label: 'Run', answer: 150, format: 'number', unit: 'm' },
      { id: 'slope', label: 'Slope', answer: -0.2, format: 'slope', inverse: true }
    ],
    concept: 'Dropping in elevation is a negative rise. A negative rise over a positive run gives a negative slope.',
    hints: ['Rise = ending elevation − starting elevation. Will that be positive or negative?', 'Rise = 450 − 480 = −30 m. The run is the horizontal distance.', 'Slope = −30 ÷ 150.'],
    explanation: 'Rise = 450 − 480 = −30 m (a drop). Run = 150 m. Slope = −30 ÷ 150 = −0.2.'
  },
  {
    id: 'F8', set: 'practice', level: 1, objective: 'grade', skill: 'Grade is not an angle', context: 'mtb', type: 'choice',
    prompt: 'A sign at the bottom of a climb says “20% grade”. Which statement is true?',
    options: [
      { id: 'a', text: 'It rises 20 ft for every 100 ft of horizontal distance.', correct: true },
      { id: 'b', text: 'The trail is tilted at 20 degrees.', feedback: 'A grade isn’t an angle. A 20% grade is a slope of 0.2, which is only about 11.3°. A 20° slope would be about a 36% grade.' },
      { id: 'c', text: 'It rises 20 ft for every 100 ft you ride along the trail surface.', feedback: 'Grade uses horizontal distance (run), not the distance along the slope. On gentle trails they’re close, but they aren’t the same.' },
      { id: 'd', text: 'It is 20 times steeper than a flat trail.', feedback: 'A flat trail has a grade of 0%, so “20 times steeper” doesn’t mean anything here. Grade is rise per 100 units of run.' }
    ],
    concept: 'Percentage grade = rise ÷ run × 100, using horizontal distance. Degrees measure an angle, which is a different thing.',
    hints: ['What does “percent” mean?', 'Grade compares the rise with the horizontal run, out of 100.'],
    explanation: '20% means 20 units of rise for every 100 units of horizontal run (slope 0.2). That’s an angle of about 11.3°, not 20°.'
  },

  // ---------------- Level 2: Application ----------------
  {
    id: 'A1', set: 'practice', level: 2, objective: 'two-points', skill: 'Slope between two points', context: 'none', type: 'number',
    prompt: 'Find the slope of the line through these two points.', math: ['(2, 4) and (6, 12)'],
    answer: 2, format: 'slope', inverse: true,
    concept: 'm = (y₂ − y₁) ÷ (x₂ − x₁): the change in y over the change in x.',
    hints: ['Change in y = 12 − 4.', 'Change in x = 6 − 2.', 'Divide the change in y by the change in x.'],
    explanation: 'm = (12 − 4) ÷ (6 − 2) = 8 ÷ 4 = 2.'
  },
  {
    id: 'A2', set: 'practice', level: 2, objective: 'two-points', skill: 'Slope between points with negatives', context: 'none', type: 'number',
    prompt: 'Find the slope of the line through these two points.', math: ['(−3, 5) and (1, −3)'],
    answer: -2, format: 'slope', inverse: true,
    traps: [{ value: -0.5, message: 'That’s the change in x over the change in y. Slope puts the change in y on top.' }],
    concept: 'Subtract in the same order top and bottom: (y₂ − y₁) ÷ (x₂ − x₁). Watch the signs when subtracting negatives.',
    hints: ['Call (−3, 5) point 1 and (1, −3) point 2.', 'Change in y = −3 − 5 = −8.', 'Change in x = 1 − (−3). Subtracting a negative means adding.'],
    explanation: 'm = (−3 − 5) ÷ (1 − (−3)) = −8 ÷ 4 = −2.'
  },
  {
    id: 'A3', set: 'practice', level: 2, objective: 'table', skill: 'Slope from a table', context: 'mtb', type: 'number',
    prompt: 'This table shows a trail’s elevation at points along its horizontal distance. What is the slope?',
    diagram: { kind: 'table', headers: ['Distance x (ft)', 'Elevation y (ft)'], rows: [[0, 1000], [100, 1020], [200, 1040], [300, 1060]] },
    answer: 0.2, format: 'slope', inverse: true,
    traps: [{ value: 20, message: '20 ft is how much the elevation changes from one row to the next. Divide it by how much the distance changes.' }],
    concept: 'In a table, slope = change in y ÷ change in x between any two rows.',
    hints: ['How much does the elevation change from one row to the next?', 'How much does the distance change from one row to the next?', 'Divide: 20 ÷ 100.'],
    explanation: 'Each row, elevation goes up 20 ft while distance goes up 100 ft. Slope = 20 ÷ 100 = 0.2 (a 20% grade).'
  },
  {
    id: 'A4', set: 'practice', level: 2, objective: 'table', skill: 'Recognize a linear table', context: 'none', type: 'choice',
    prompt: 'Which table shows a linear relationship (a constant rate of change)?',
    options: [
      { id: 'a', table: { x: [0, 1, 2, 3], y: [5, 8, 11, 14] }, correct: true },
      { id: 'b', table: { x: [0, 1, 2, 3], y: [1, 2, 4, 8] }, feedback: 'Here y goes up by 1, then 2, then 4. The change keeps doubling, so it isn’t constant.' },
      { id: 'c', table: { x: [0, 1, 2, 3], y: [0, 1, 4, 9] }, feedback: 'Here y goes up by 1, then 3, then 5. The change grows, so the graph would curve.' }
    ],
    concept: 'A relationship is linear when y changes by the same amount every time x changes by the same amount.',
    hints: ['In each table, x goes up by 1 each row. How much does y change each row?', 'Look for the table where y changes by the same amount every row.'],
    explanation: 'In the first table y goes 5, 8, 11, 14: up 3 every time x goes up 1. That’s a constant rate of change (slope 3), so it’s linear.'
  },
  {
    id: 'A5', set: 'practice', level: 2, objective: 'graph', skill: 'Read a slope from a graph', context: 'none', type: 'number',
    prompt: 'What is the slope of this line? (A fraction like 2/3 is fine.)',
    diagram: { kind: 'graph', x: [-2, 6], y: [-2, 6], lines: [{ m: 0.75, b: 1 }], points: [{ x: 0, y: 1 }, { x: 4, y: 4 }] },
    answer: 0.75, format: 'slope', inverse: true, places: 2,
    concept: 'Pick two points where the line crosses grid corners, then count the rise (up or down) and the run (across).',
    hints: ['Use the two marked points, (0, 1) and (4, 4).', 'From the first point to the second: how far up? How far across?', 'Rise 3, run 4: divide.'],
    explanation: 'From (0, 1) to (4, 4): rise = 3, run = 4, so the slope is 3/4 = 0.75.'
  },
  {
    id: 'A6', set: 'practice', level: 2, objective: 'rise-over-run', skill: 'Use slope = rise ÷ run to find the run', context: 'mtb', type: 'number',
    prompt: 'A trail crew wants a climb with a steady 12% grade that gains 90 ft of elevation. How much horizontal distance (run) do they need?',
    answer: 750, format: 'number', unit: 'ft',
    traps: [{ value: 10.8, message: 'That’s 90 × 0.12. If slope = rise ÷ run, then run = rise ÷ slope.' },
            { value: 7.5, message: 'Close: you divided by 12 instead of by the slope. A 12% grade is a slope of 0.12.' }],
    concept: 'Slope = rise ÷ run, so run = rise ÷ slope. Change the grade to a decimal slope first.',
    hints: ['Write 12% as a decimal slope.', 'Slope = rise ÷ run, so run = rise ÷ slope.', 'Work out 90 ÷ 0.12.'],
    explanation: 'Slope = 0.12. Run = rise ÷ slope = 90 ÷ 0.12 = 750 ft. Check: 90 ÷ 750 = 0.12 = 12%.'
  },
  {
    id: 'A7', set: 'practice', level: 2, objective: 'equation', skill: 'Evaluate a linear model', context: 'mtb', type: 'number',
    prompt: 'A trail’s elevation y (ft) is modeled by y = 0.15x + 2,400, where x is horizontal distance (ft). What is the elevation at x = 600?',
    answer: 2490, format: 'number', unit: 'ft',
    traps: [{ value: 90, message: '90 ft is how much the trail has climbed. Add the starting elevation, b = 2,400.' },
            { value: 361.5, message: 'Multiply 0.15 by 600 first, then add 2,400.' }],
    concept: 'To use y = mx + b, put the x value in and work out y: multiply by m, then add b.',
    hints: ['Replace x with 600.', 'y = 0.15 × 600 + 2,400.', '0.15 × 600 = 90. Now add 2,400.'],
    explanation: 'y = 0.15 × 600 + 2,400 = 90 + 2,400 = 2,490 ft.'
  },
  {
    id: 'A8', set: 'practice', level: 2, objective: 'equation', skill: 'Read slope and intercept from an equation', context: 'none', type: 'fields',
    prompt: 'For the line y = −4x + 7, what are the slope and the y-intercept?',
    fields: [
      { id: 'm', label: 'Slope, m', answer: -4, format: 'slope', traps: [{ value: 7, message: '7 is the y-intercept (b). The slope is the number multiplying x.' }] },
      { id: 'b', label: 'y-intercept, b', answer: 7, format: 'number', traps: [{ value: -4, message: '−4 multiplies x, so it’s the slope. The intercept is the number on its own.' }] }
    ],
    concept: 'In y = mx + b, m is the number multiplying x (the slope) and b is the number on its own (where the line crosses the y-axis).',
    hints: ['Match y = −4x + 7 to y = mx + b.', 'The number in front of x is m. Keep its sign.'],
    explanation: 'm = −4 (the line goes down 4 for every 1 across) and b = 7 (it crosses the y-axis at (0, 7)).'
  },

  // ---------------- Level 3: Challenge ----------------
  {
    id: 'C1', set: 'practice', level: 3, objective: 'equation', skill: 'Write an equation from a context', context: 'mtb', type: 'fields',
    prompt: 'A trail starts at an elevation of 1,800 ft and climbs at a constant 6% grade. Write its elevation y after x ft of horizontal distance in the form y = mx + b.',
    fields: [
      { id: 'm', label: 'm', answer: 0.06, format: 'slope', traps: [{ value: 6, message: '6 is the percentage. As a slope, 6% is 6 ÷ 100 = 0.06.' }] },
      { id: 'b', label: 'b', answer: 1800, format: 'number', unit: 'ft' }
    ],
    concept: 'm is the rate (the slope, as a decimal) and b is the starting value (the elevation when x = 0).',
    hints: ['What is the elevation when x = 0? That’s b.', 'Turn the grade into a decimal slope: that’s m.', '6% = 0.06.'],
    explanation: 'y = 0.06x + 1,800. The trail starts at 1,800 ft (b) and gains 0.06 ft per foot across (m).'
  },
  {
    id: 'C2', set: 'practice', level: 3, objective: 'rate', skill: 'Compare linear relationships in different forms', context: 'mtb', type: 'choice',
    prompt: 'Which climb is steepest?',
    math: ['Trail A: gains 180 ft over 1,200 ft of horizontal distance', 'Trail B: gains 100 ft over 500 ft of horizontal distance', 'Trail C: elevation y = 0.17x + 900 (x and y in ft)'],
    options: [
      { id: 'A', text: 'Trail A', feedback: 'Trail A gains the most elevation, but over a long distance: 180 ÷ 1,200 = 0.15. Compare slopes, not total gain.' },
      { id: 'B', text: 'Trail B', correct: true },
      { id: 'C', text: 'Trail C', feedback: 'Trail C’s slope is 0.17 (the 900 is just where it starts). Work out the slope of A and B too.' },
      { id: 'same', text: 'They’re all the same', feedback: 'Work out each slope as a decimal and compare.' }
    ],
    concept: 'To compare steepness, put every trail in the same form: its slope (rise ÷ run).',
    hints: ['Find the slope of each trail as a decimal.', 'A: 180 ÷ 1,200. B: 100 ÷ 500. C: read m from the equation.'],
    explanation: 'A: 180 ÷ 1,200 = 0.15. B: 100 ÷ 500 = 0.20. C: m = 0.17. Trail B is steepest (20%), even though it gains the least elevation.'
  },
  {
    id: 'C3', set: 'practice', level: 3, objective: 'grade', skill: 'Multi-step grade problem', context: 'mtb', type: 'number',
    prompt: 'A climb goes from 6,200 ft to 6,560 ft at a constant 9% grade. How much horizontal distance does it cover?',
    answer: 4000, format: 'number', unit: 'ft',
    traps: [{ value: 40, message: 'You divided by 9 instead of 0.09. A 9% grade is a slope of 0.09.' },
            { value: 32.4, message: 'That’s 360 × 0.09. Run = rise ÷ slope.' }],
    concept: 'Find the rise first (end − start), then use run = rise ÷ slope.',
    hints: ['First find the rise.', 'Rise = 6,560 − 6,200 = 360 ft. Write 9% as a decimal.', 'Run = 360 ÷ 0.09.'],
    explanation: 'Rise = 360 ft; slope = 0.09; run = 360 ÷ 0.09 = 4,000 ft. Check: 360 ÷ 4,000 = 0.09.'
  },
  {
    id: 'C4', set: 'practice', level: 3, objective: 'rate', skill: 'Interpret a rate of change with units', context: 'none', type: 'choice',
    prompt: 'The water level y (inches) in a rain barrel is modeled by y = −1.5x + 48, where x is hours since it stopped raining. What does −1.5 tell you?',
    options: [
      { id: 'a', text: 'The level drops 1.5 inches per hour.', correct: true },
      { id: 'b', text: 'The barrel started with 1.5 inches of water.', feedback: 'The starting amount is b, the value when x = 0: that’s 48 inches.' },
      { id: 'c', text: 'It takes 1.5 hours for the level to drop 1 inch.', feedback: 'That flips the rate. The slope is change in y (inches) per change in x (hours).' },
      { id: 'd', text: 'The barrel is empty after 1.5 hours.', feedback: 'After 1.5 hours y = −1.5 × 1.5 + 48 = 45.75 inches. Not empty.' }
    ],
    concept: 'The slope is a rate: units of y per unit of x. Its sign says whether y is going up or down.',
    hints: ['What are the units of y? Of x?', 'Slope = change in y ÷ change in x, so its units are inches per hour.'],
    explanation: 'The slope −1.5 means y changes by −1.5 inches for each hour: the level drops 1.5 inches per hour, starting from 48 inches.'
  },
  {
    id: 'C5', set: 'practice', level: 3, objective: 'graph', skill: 'Write an equation from a graph', context: 'none', type: 'fields',
    prompt: 'Write the equation of this line in the form y = mx + b.',
    diagram: { kind: 'graph', x: [-4, 5], y: [-4, 6], lines: [{ m: 2, b: -2 }], points: [{ x: 0, y: -2 }, { x: 3, y: 4 }] },
    fields: [
      { id: 'm', label: 'm', answer: 2, format: 'slope', traps: [{ value: 0.5, message: 'That’s run ÷ rise. Go from (0, −2) to (3, 4): up 6, across 3.' }] },
      { id: 'b', label: 'b', answer: -2, format: 'number', traps: [{ value: 2, message: 'Check the sign: the line crosses the y-axis below zero.' }] }
    ],
    concept: 'b is where the line crosses the y-axis. m is the rise over the run between two points on it.',
    hints: ['Where does the line cross the y-axis? That’s b.', 'From (0, −2) to (3, 4): how far up, how far across?', 'Rise 6, run 3.'],
    explanation: 'It crosses the y-axis at −2, so b = −2. From (0, −2) to (3, 4) the rise is 6 and the run is 3, so m = 2. The line is y = 2x − 2.'
  },
  {
    id: 'C6', set: 'practice', level: 3, objective: 'table', skill: 'Complete a linear table', context: 'none', type: 'fields',
    prompt: 'This table is linear. Fill in the two missing y values.',
    diagram: { kind: 'table', headers: ['x', 'y'], rows: [[0, 3], [2, 8], [4, '?'], [6, '?']] },
    fields: [
      { id: 'y4', label: 'y when x = 4', answer: 13, format: 'number' },
      { id: 'y6', label: 'y when x = 6', answer: 18, format: 'number' }
    ],
    concept: 'A linear table changes by the same amount every step. Find that change from the rows you know.',
    hints: ['From x = 0 to x = 2, how much does y change?', 'y goes up 5 every time x goes up 2.', 'Add 5 to get the next value, then add 5 again.'],
    explanation: 'y goes up 5 for every 2 in x (slope 2.5). So y = 8 + 5 = 13 at x = 4, and 13 + 5 = 18 at x = 6. The equation is y = 2.5x + 3.'
  },
  {
    id: 'C7', set: 'practice', level: 3, objective: 'equation', skill: 'Use a point and a slope', context: 'none', type: 'number',
    prompt: 'A line has slope −2 and passes through (4, 9). What is y when x = 10?',
    answer: -3, format: 'number',
    traps: [{ value: 21, message: 'Check the sign: a slope of −2 means y goes down as x goes up.' },
            { value: -12, message: 'That’s the change in y. Add it to the starting y value of 9.' }],
    concept: 'From a known point, the change in y = slope × change in x.',
    hints: ['How far is x = 10 from x = 4?', 'Change in x = 6, so change in y = −2 × 6.', 'Start at y = 9 and add −12.'],
    explanation: 'Change in x = 10 − 4 = 6. Change in y = −2 × 6 = −12. y = 9 − 12 = −3.'
  },
  {
    id: 'C8', set: 'practice', level: 3, objective: 'rate', skill: 'Solve a linear model for x', context: 'mtb', type: 'number',
    prompt: 'On a descent, your elevation y (ft) is modeled by y = −0.08x + 3,200, where x is horizontal distance (ft). How far horizontally do you ride before reaching 2,800 ft?',
    answer: 5000, format: 'number', unit: 'ft',
    traps: [{ value: -5000, message: 'Distance ridden is positive here. Check your signs: −0.08x = −400.' },
            { value: 32, message: 'That’s 400 × 0.08. Divide by the slope instead: x = −400 ÷ −0.08.' }],
    concept: 'Set y to the target value and solve for x: subtract b, then divide by m.',
    hints: ['Put y = 2,800 into the equation.', '2,800 = −0.08x + 3,200, so −0.08x = −400.', 'Divide both sides by −0.08.'],
    explanation: '2,800 = −0.08x + 3,200 → −0.08x = −400 → x = 5,000 ft. You drop 400 ft at 8 ft per 100 ft across.'
  },

  // ---------------- Transfer challenge: no mountain biking ----------------
  {
    id: 'T1', set: 'transfer', level: 2, objective: 'two-points', skill: 'Slope between two points', context: 'none', type: 'number',
    prompt: 'Find the slope of the line through these points.', math: ['(−2, 7) and (4, −5)'],
    answer: -2, format: 'slope', inverse: true,
    concept: 'm = (y₂ − y₁) ÷ (x₂ − x₁).',
    hints: ['Change in y = −5 − 7.', 'Change in x = 4 − (−2).', 'Divide −12 by 6.'],
    explanation: 'm = (−5 − 7) ÷ (4 − (−2)) = −12 ÷ 6 = −2.'
  },
  {
    id: 'T2', set: 'transfer', level: 2, objective: 'equation', skill: 'Slope from an equation in a different order', context: 'none', type: 'choice',
    prompt: 'What is the slope of y = 5 − 3x?',
    options: [
      { id: 'a', text: '−3', correct: true },
      { id: 'b', text: '5', feedback: '5 is the number on its own, the y-intercept. The order of the terms doesn’t change which is which.' },
      { id: 'c', text: '3', feedback: 'Keep the sign: the x term is −3x.' },
      { id: 'd', text: '−5/3', feedback: 'There’s nothing to divide. Rewrite it as y = −3x + 5 and read m.' }
    ],
    concept: 'The slope is the number multiplying x, wherever it appears in the equation.',
    hints: ['Rewrite it as y = −3x + 5.', 'Which number multiplies x?'],
    explanation: 'y = 5 − 3x is the same as y = −3x + 5, so m = −3.'
  },
  {
    id: 'T3', set: 'transfer', level: 2, objective: 'table', skill: 'Rate of change from a table', context: 'none', type: 'number',
    prompt: 'What is the rate of change (slope) shown in this table?',
    diagram: { kind: 'table', headers: ['x', 'y'], rows: [[1, 10], [3, 16], [5, 22], [7, 28]] },
    answer: 3, format: 'slope', inverse: true,
    traps: [{ value: 6, message: 'y goes up 6 each row, but x goes up 2 each row, not 1. Divide.' }],
    concept: 'Rate of change = change in y ÷ change in x. Check how much x changes, too.',
    hints: ['How much does y change from row to row?', 'How much does x change from row to row?', 'Divide 6 by 2.'],
    explanation: 'Each row, y goes up 6 while x goes up 2, so the rate is 6 ÷ 2 = 3.'
  },
  {
    id: 'T4', set: 'transfer', level: 2, objective: 'table', skill: 'Constant rate of change', context: 'none', type: 'choice',
    prompt: 'Which of these has a constant rate of change?',
    options: [
      { id: 'a', text: 'y = 2x + 1', correct: true },
      { id: 'b', text: 'y = x² + 1', feedback: 'Try x = 0, 1, 2: y = 1, 2, 5. The change goes from 1 to 3, so it isn’t constant.' },
      { id: 'c', text: 'y = 2ˣ', feedback: 'Try x = 0, 1, 2: y = 1, 2, 4. It doubles, so the change grows.' },
      { id: 'd', text: 'y = 12 ÷ x', feedback: 'Try x = 1, 2, 3: y = 12, 6, 4. The change shrinks, so it isn’t constant.' }
    ],
    concept: 'A constant rate of change means the graph is a straight line: y changes by the same amount for each step in x.',
    hints: ['Try x = 0, 1, 2 in each one and look at how y changes.', 'Which one has the form y = mx + b?'],
    explanation: 'y = 2x + 1 goes up by exactly 2 every time x goes up 1. It’s linear (slope 2). The others curve.'
  },
  {
    id: 'T5', set: 'transfer', level: 3, objective: 'graph', skill: 'Graph a linear equation', context: 'none', type: 'plot',
    prompt: 'Graph y = ½x − 1 by placing two points that are on the line.',
    line: { m: 0.5, b: -1 }, grid: { x: [-6, 6], y: [-6, 6] },
    concept: 'Start at the y-intercept (0, b), then use the slope as rise over run to step to another point.',
    hints: ['Where does the line cross the y-axis? (Put x = 0 into the equation.)', 'The first point is (0, −1).', 'A slope of ½ means up 1 for every 2 across: from (0, −1) go right 2 and up 1.'],
    explanation: 'The y-intercept is (0, −1). A slope of ½ means up 1 for every 2 across, so (2, 0) and (4, 1) are on the line too.'
  },
  {
    id: 'T6', set: 'transfer', level: 2, objective: 'slope-types', skill: 'Undefined slope', context: 'none', type: 'number',
    prompt: 'What is the slope of the line through these points? (If it has no number, choose “Undefined”.)', math: ['(3, −1) and (3, 6)'],
    answer: 'undefined', format: 'slope', undefinedButton: true,
    concept: 'When x doesn’t change, the run is 0 and the line is vertical. Dividing by 0 has no answer, so the slope is undefined.',
    hints: ['What is the change in x?', 'The run is 3 − 3 = 0. Can you divide 7 by 0?'],
    explanation: 'Rise = 6 − (−1) = 7, run = 3 − 3 = 0. Dividing by zero isn’t possible, so the slope is undefined: the line is vertical (x = 3).'
  },
  {
    id: 'T7', set: 'transfer', level: 3, objective: 'rate', skill: 'Rate of change in a real-world problem', context: 'none', type: 'number',
    prompt: 'A phone plan’s monthly cost is linear in data used: $35 for 4 GB and $55 for 9 GB. What is the cost per GB?',
    answer: 4, format: 'number', unit: '$ per GB',
    traps: [{ value: 0.25, message: 'That’s GB per dollar. Cost per GB puts dollars on top.' },
            { value: 8.75, message: 'That’s $35 ÷ 4 GB, which includes the plan’s fixed base cost. Use the change in cost over the change in data.' }],
    concept: 'The rate is the change in cost ÷ the change in data: (dollars) ÷ (GB).',
    hints: ['How much more does the 9 GB month cost than the 4 GB month?', 'Change in cost = $20; change in data = 5 GB.', 'Divide 20 by 5.'],
    explanation: '(55 − 35) ÷ (9 − 4) = 20 ÷ 5 = $4 per GB. (The rest of the bill is a fixed $19.)'
  },
  {
    id: 'T8', set: 'transfer', level: 3, objective: 'equation', skill: 'Equation of a line through two points', context: 'none', type: 'fields',
    prompt: 'Write the equation of the line through these points in the form y = mx + b.', math: ['(1, 2) and (3, 8)'],
    fields: [
      { id: 'm', label: 'm', answer: 3, format: 'slope', traps: [{ value: 1 / 3, message: 'That’s the change in x over the change in y. Slope is change in y on top.' }] },
      { id: 'b', label: 'b', answer: -1, format: 'number', traps: [{ value: 2, message: '2 is the y value at x = 1, not at x = 0. Use the slope to find where x = 0.' }] }
    ],
    concept: 'Find m from the two points, then put one point into y = mx + b to find b.',
    hints: ['m = (8 − 2) ÷ (3 − 1).', 'm = 3. Put (1, 2) into y = 3x + b.', '2 = 3 + b.'],
    explanation: 'm = 6 ÷ 2 = 3. Using (1, 2): 2 = 3(1) + b, so b = −1. The line is y = 3x − 1.'
  }
];

export function questionById(id) { return QUESTIONS.find(q => q.id === id) || null; }
export function questionsIn(set, level) { return QUESTIONS.filter(q => q.set === set && (level == null || q.level === level)); }
