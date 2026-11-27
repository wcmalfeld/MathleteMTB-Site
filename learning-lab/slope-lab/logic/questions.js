// Map the Line: every graded question. Answers come from logic/linear.js
// (exact fractions), never typed in by hand. Three progressive hints each,
// a worked solution, and traps (anticipated wrong answers with a
// misconception code and a message that teaches).
//
// Extra fields the lab draws (map-the-line.js): fig (a figure shown above the
// question: { kind: 'grid' | 'profile' | 'table' | 'lines', … }), and the lab
// type 'plot' (place points on a grid: targets, grid, connect).

import { quadrant, QUAD_NAME, scaled, slope, grade, firstDifferences, rates, isLinear, lineOf, proportional, ratios, classify, S, signed, Frac } from './linear.js';
import { QUESTIONS as BANK } from '../content/questions.js';
import { FEATURES, featureById, SCALE_MAP, SCOUT_PLACE, ROUTE, PROFILE, PATTERN_A, PATTERN_B, MISSING, SPEED_TABLE, PUMP_TABLE, UNEVEN, RIDERS, MAP } from './data.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const N = x => Number(x);
const pt = p => `(${S(p.x ?? p[0])}, ${S(p.y ?? p[1])})`;
const P = (x, y) => ({ x, y });
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object') continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e6); if (seen.has(k) || Math.abs(t.value - f.answer) < 1e-9 || !isFinite(t.value)) return false; seen.add(k); return true; });
    }
  }
  return qs;
}
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (!q || q.type !== 'choice' || q.keepOrder) continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
const QUADS = ['I', 'II', 'III', 'IV', 'axis'];
const quadQ = (x, y, prompt, ideas, level) => {
  const q = quadrant(x, y), right = q === 'origin' || q.endsWith('axis') ? 'axis' : q;
  return { type: 'choice', inline: true, keepOrder: true, ideas: ideas || ['quadrants'], level: level || 'beginner', prompt,
    options: QUADS.map(k => opt(k, k === 'axis' ? 'On an axis (no quadrant)' : 'Quadrant ' + k, k === right, k === 'axis' || right === 'axis' ? 'axis-quadrant' : 'quadrant-signs',
      k === 'axis' ? 'Only points with x = 0 or y = 0 sit on an axis.' : right === 'axis' ? 'A point on an axis isn’t in any quadrant.' : `Quadrant ${k} has x ${k === 'I' || k === 'IV' ? 'positive' : 'negative'} and y ${k === 'I' || k === 'II' ? 'positive' : 'negative'}.`)),
    hints: ['Look at the sign of x (left or right of the origin), then y (up or down).', 'I: (+, +). II: (−, +). III: (−, −). IV: (+, −).', x === 0 || y === 0 ? 'One coordinate is 0: where does that put the point?' : `x is ${x > 0 ? 'positive' : 'negative'} and y is ${y > 0 ? 'positive' : 'negative'}.`],
    solution: `(${S(x)}, ${S(y)}) is ${q === 'origin' ? 'at the origin' : QUAD_NAME[q].charAt(0).toLowerCase() + QUAD_NAME[q].slice(1)}.` };
};
const xyFields = (x, y, o = {}) => ({ type: 'fields', ideas: o.ideas || ['read-points'], level: o.level || 'beginner', prompt: o.prompt, fig: o.fig,
  fields: [{ id: 'x', label: 'x', answer: x, traps: [{ value: y, code: 'swap-xy', message: 'That’s the y-value. The x-coordinate (left or right) comes first.' }, ...(o.xTraps || [])] },
    { id: 'y', label: 'y', answer: y, traps: [{ value: x, code: 'swap-xy', message: 'That’s the x-value. The y-coordinate (up or down) comes second.' }, ...(o.yTraps || [])] }],
  hints: o.hints || ['Ordered pairs are (x, y): across first, then up or down.', 'Count from the origin along the x-axis, then up or down.', 'Left and down are negative.'], solution: o.solution || `(${S(x)}, ${S(y)}).` });
const slopeNum = (p1, p2, o = {}) => {
  const s = slope(p1, p2), m = N(s.value);
  return { type: 'number', ideas: o.ideas || ['slope'], level: o.level || 'intermediate', label: o.label || 'm', answer: m, tolerance: Number.isInteger(Math.round(m * 1e6) / 1e3) ? 1e-6 : 0.005, prompt: o.prompt + (Number.isInteger(Math.round(m * 1e6) / 1e3) ? '' : ' (a fraction is fine, or round to two decimal places)'), fig: o.fig,
    traps: [{ value: N(s.run.div(s.rise.zero ? 1 : s.rise)), code: 'run-over-rise', message: 'That’s run ÷ rise. Slope is rise ÷ run: the change in y goes on top.' }, { value: N(s.value.mul(100)), code: 'grade-for-slope', message: 'That’s the grade as a percentage. The slope is the decimal: divide by 100.' },
      { value: -m, code: 'reversed-numerator', message: 'Check the order: subtract the y-values in the same order as the x-values, (y₂ − y₁) ÷ (x₂ − x₁).' }],
    hints: o.hints || ['Slope describes how much y changes for every unit of change in x.', `Subtract the y-values to find the vertical change: ${S(p2.y)} − ${S(p1.y)}.`, `Subtract the x-values to find the horizontal change: ${S(p2.x)} − ${S(p1.x)}.`],
    solution: `m = (${S(p2.y)} − ${S(p1.y)}) / (${S(p2.x)} − ${S(p1.x)}) = ${S(s.rise)} / ${S(s.run)} = ${S(s.value)}${o.after ? '. ' + o.after : '.'}` };
};
const classOpts = right => [opt('positive', 'Positive', right === 'positive', 'slope-sign', 'Positive slopes rise from left to right.'), opt('negative', 'Negative', right === 'negative', 'slope-sign', 'Negative slopes fall from left to right.'),
  opt('zero', 'Zero', right === 'zero', 'slope-sign', 'Zero slope is a flat, horizontal line.'), opt('undefined', 'Undefined', right === 'undefined', 'divide-zero', 'Undefined slope is a vertical line: the run is 0.')];
const tableFig = (rows, h) => ({ kind: 'table', rows, headers: h || ['x', 'y'] });
const LIN_OPTS = (rows, why) => { const lin = isLinear(rows); return [opt('lin', 'Linear: constant rate of change', lin, 'constant-rate', why), opt('not', 'Not linear: the rate changes', !lin, 'constant-rate', why)]; };
const diffText = rows => firstDifferences(rows).map(signed).join(', ');

export const IDEAS = {
  axes: 'Axes, origin and quadrants',
  quadrants: 'Quadrant signs',
  'read-points': 'Reading coordinates',
  scales: 'Different axis scales',
  plot: 'Plotting ordered pairs',
  'read-graph': 'Reading graphs and tables',
  patterns: 'Describing patterns in data',
  slope: 'Slope as rise over run',
  grade: 'Slope as percentage grade',
  'slope-sign': 'Positive, negative, zero and undefined slope',
  'constant-rate': 'Constant rate of change',
  linear: 'Linear or not linear',
  representations: 'Words, tables, graphs and equations',
  proportional: 'Proportional relationships',
  'k-value': 'The constant of proportionality'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'coord', name: 'Coordinate Plane', ideas: ['axes', 'quadrants', 'read-points', 'scales'] },
  { id: 'pairs', name: 'Graphing Ordered Pairs', ideas: ['plot', 'read-graph', 'patterns'] },
  { id: 'slope', name: 'Slope and Rate of Change', ideas: ['slope', 'grade'] },
  { id: 'sign', name: 'Positive and Negative Slope', ideas: ['slope-sign'] },
  { id: 'linear', name: 'Linear Relationships', ideas: ['constant-rate', 'linear', 'representations'] },
  { id: 'prop', name: 'Proportional Relationships', ideas: ['proportional', 'k-value'] }
];
export const MISCONCEPTIONS = {
  'swap-xy': 'Reversing the x- and y-coordinates',
  'quadrant-signs': 'Confusing the quadrants',
  'axis-quadrant': 'Forgetting that points on an axis aren’t in a quadrant',
  'scale-count': 'Counting grid intervals without reading the axis scale',
  'same-scale': 'Assuming both axes use the same scale',
  'pixel-distance': 'Using distances on the screen instead of coordinate values',
  'run-over-rise': 'Dividing run by rise',
  'reversed-numerator': 'Subtracting the coordinates in different orders',
  'divide-zero': 'Treating a vertical line’s slope as a number (dividing by zero)',
  'negative-elevation': 'Confusing negative slope with negative elevation',
  'same-downhill': 'Assuming every downhill section has the same slope',
  'always-linear': 'Assuming real trail profiles are always linear',
  'linear-proportional': 'Assuming every linear relationship is proportional',
  origin: 'Forgetting that proportional relationships pass through the origin',
  'ratio-zero': 'Calculating y/x when x is 0',
  'grade-for-slope': 'Confusing slope with percentage grade',
  'run-vs-length': 'Using distance along the trail as the horizontal run',
  'slope-sign': 'Misreading the sign of a slope',
  'constant-rate': 'Misjudging whether a rate of change is constant',
  'uneven-spacing': 'Comparing first differences when the x-values aren’t equally spaced',
  'plot-error': 'Plotting a point in the wrong place',
  'read-graph': 'Misreading a value from a graph or table',
  representations: 'Mismatching words, tables, graphs and equations',
  'k-value': 'Calculating or interpreting the constant of proportionality incorrectly',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Stage 01: Scout the Mountain
const F = featureById;
const M1 = {
  'sc-origin': { type: 'choice', ideas: ['axes'], level: 'beginner', prompt: 'The main trailhead sits where the x-axis and y-axis cross. What are its coordinates, and what is that point called?',
    options: [opt('a', '(0, 0): the origin', true), opt('b', '(1, 1): the start', false, 'axis-quadrant', 'The axes cross where both coordinates are 0.'), opt('c', '(0, 0): Quadrant I', false, 'axis-quadrant', 'The origin isn’t in any quadrant.'), opt('d', '(6, 6): the top corner', false, 'axis-quadrant', 'That’s the edge of the map.')],
    hints: ['The axes are the two number lines.', 'They cross at zero on both.', 'That point has a special name.'], solution: '(0, 0) is the origin: zero across, zero up.' },
  'sc-jump': quadQ(3, 2, 'The tabletop jump zone is at (3, 2). Which quadrant is it in?'),
  'sc-overlook': quadQ(-4, 3, 'The northern overlook is at (−4, 3). Which quadrant?'),
  'sc-pump': quadQ(-3, -2, 'The pump track is at (−3, −2). Which quadrant?'),
  'sc-workshop': quadQ(4, -3, 'The workshop is at (4, −3). Which quadrant?'),
  'sc-lr': { type: 'choice', inline: true, keepOrder: true, ideas: ['quadrants'], level: 'beginner', prompt: 'A new feature is at (−3, 4). Is it left or right of the origin?',
    options: [opt('l', 'Left', true), opt('r', 'Right', false, 'swap-xy', 'x = −3 is negative: left.')], hints: ['The first number is x.', 'Negative x is left.', 'x = −3.'], solution: 'Left: x = −3 is negative.' },
  'sc-ud': { type: 'choice', inline: true, keepOrder: true, ideas: ['quadrants'], level: 'beginner', prompt: 'Is (−3, 4) up or down from the origin?',
    options: [opt('u', 'Up', true), opt('d', 'Down', false, 'swap-xy', 'y = 4 is positive: up.')], hints: ['The second number is y.', 'Positive y is up.', 'y = 4.'], solution: 'Up: y = 4 is positive.' },
  'sc-q': quadQ(-3, 4, 'So which quadrant is (−3, 4) in?', ['quadrants'], 'beginner'),
  'sc-wash': quadQ(0, -3, 'The bike wash is at (0, −3). Where is it?', ['axes', 'quadrants'], 'intermediate'),
  'sc-read': xyFields(F.rocks.x, F.rocks.y, { level: 'intermediate', prompt: 'The highlighted feature on the map is the rock garden. What are its coordinates?', fig: { kind: 'grid', grid: MAP, points: [{ ...F.rocks, label: '?', cls: 'is-on' }] } }),
  'sc-gps-berm': { type: 'choice', ideas: ['read-points'], level: 'beginner', prompt: 'GPS finder: the berm section is 5 left of the trailhead and 1 up. Which ordered pair is it?', fig: { kind: 'grid', grid: MAP, points: [{ ...F.berms, label: 'Berms', cls: 'is-on' }] },
    options: [opt('a', '(−5, 1)', true), opt('b', '(1, −5)', false, 'swap-xy', 'That reverses the order: x (across) comes first.'), opt('c', '(5, 1)', false, 'quadrant-signs', 'Left of the origin is negative.'), opt('d', '(−5, −1)', false, 'quadrant-signs', 'Up is positive.')],
    hints: ['x first: across.', 'Left is negative.', 'Then y: up is positive.'], solution: '(−5, 1): x = −5 (left), y = 1 (up).' },
  'sc-gps-view': xyFields(F.viewpoint.x, F.viewpoint.y, { level: 'intermediate', prompt: 'Read the viewpoint’s coordinates from the map.', fig: { kind: 'grid', grid: MAP, points: [{ ...F.viewpoint, label: 'Viewpoint', cls: 'is-on' }] } }),
  'sc-gps-finish': { type: 'choice', ideas: ['read-points'], level: 'intermediate', prompt: 'Where is the finish area?', fig: { kind: 'grid', grid: MAP, points: [{ ...F.finish, label: 'Finish', cls: 'is-on' }] },
    options: [opt('a', '(5, −5)', true), opt('b', '(−5, 5)', false, 'quadrant-signs', 'Right is positive x; down is negative y.'), opt('c', '(5, 5)', false, 'quadrant-signs', 'The finish is below the x-axis.'), opt('d', '(−5, −5)', false, 'quadrant-signs', 'The finish is right of the y-axis.')],
    hints: ['Right or left of the origin?', 'Up or down?', 'Right is +, down is −.'], solution: '(5, −5): right 5, down 5 (Quadrant IV).' },
  'sc-scale': xyFields(60, 10, { ideas: ['scales'], level: 'intermediate', prompt: 'On this map each horizontal grid interval is 20 m and each vertical interval is 5 m. The kicker is 3 intervals right and 2 intervals up. What are its coordinates in meters?', fig: { kind: 'grid', grid: { x: [-6, 6], y: [-6, 6], sx: 20, sy: 5 }, points: [{ x: 3, y: 2, label: 'Kicker', cls: 'is-on' }] },
    xTraps: [{ value: 3, code: 'scale-count', message: '3 is the number of intervals. Each is 20 m: 3 × 20.' }], yTraps: [{ value: 2, code: 'scale-count', message: '2 intervals of 5 m each: 2 × 5.' }, { value: 40, code: 'same-scale', message: 'The vertical axis has its own scale: 5 m per interval, not 20.' }],
    hints: ['Read each axis with its own scale.', 'Across: 3 intervals of 20 m.', 'Up: 2 intervals of 5 m.'], solution: 'x = 3 × 20 = 60 m, y = 2 × 5 = 10 m: (60, 10).' }),
  'sc-scale-2': xyFields(-40, 20, { ideas: ['scales'], level: 'advanced', prompt: 'Same map: the drop-in is 2 intervals left and 4 intervals up. Its coordinates?', fig: { kind: 'grid', grid: { x: [-6, 6], y: [-6, 6], sx: 20, sy: 5 }, points: [{ x: -2, y: 4, label: 'Drop-in', cls: 'is-on' }] },
    xTraps: [{ value: -2, code: 'scale-count', message: 'Multiply the intervals by 20 m.' }], yTraps: [{ value: 4, code: 'scale-count', message: 'Multiply the intervals by 5 m.' }, { value: 80, code: 'same-scale', message: 'The y-axis uses 5 m per interval.' }],
    hints: ['Left is negative.', 'Across: −2 × 20.', 'Up: 4 × 5.'], solution: '(−2 × 20, 4 × 5) = (−40, 20).' }),
  'sc-place': { type: 'plot', ideas: ['plot', 'read-points'], level: 'intermediate', prompt: 'Scout challenge: place the four new features on the unfinished map.', grid: MAP, targets: SCOUT_PLACE,
    hints: ['Start at the origin each time.', 'Move across by x, then up or down by y.', 'Negative means left or down.'], solution: SCOUT_PLACE.map(p => `${p.name} ${pt(p)}`).join('; ') + '.' },
  'sc-place-q': { type: 'choice', ideas: ['quadrants'], level: 'advanced', prompt: 'Which list gives the right quadrant for each feature you placed (lift station, wall ride, creek crossing, café)?',
    options: [opt('a', 'II, I, III, IV', true), opt('b', 'I, II, III, IV', false, 'quadrant-signs', 'The lift station has negative x and positive y.'), opt('c', 'II, I, IV, III', false, 'quadrant-signs', 'The creek crossing has both coordinates negative: III.'), opt('d', 'IV, I, III, II', false, 'quadrant-signs', 'Check the lift station: (−4, 4).')],
    hints: ['Lift station (−4, 4).', 'Wall ride (5, 2), creek crossing (−3, −5).', 'Café (2, −4).'], solution: 'Lift station (−4, 4): II. Wall ride (5, 2): I. Creek crossing (−3, −5): III. Café (2, −4): IV.' }
};
export const SCOUT_PRACTICE = [[-2, 5], [6, -1], [-5, -3], [0, 4], [3, 6], [-6, 0]];
export const SCOUT_PRACTICE_IDS = ['sx-read', 'sx-quad'];
export function scoutPractice(n) {
  const [x, y] = pick(SCOUT_PRACTICE, n);
  return tidy({ brief: `Scout point ${n + 1}.`,
    'sx-read': xyFields(x, y, { level: 'intermediate', prompt: 'Read the coordinates of the highlighted waypoint.', fig: { kind: 'grid', grid: MAP, points: [{ x, y, label: '?', cls: 'is-on' }] } }),
    'sx-quad': quadQ(x, y, `Where is (${S(x)}, ${S(y)})?`, ['quadrants'], 'intermediate') });
}

// ================================================================ Stage 02: Plot Your Line
const profFig = (o = {}) => ({ kind: 'profile', rows: PROFILE, ...o });
const M2 = {
  'pl-route': { type: 'plot', ideas: ['plot'], level: 'beginner', prompt: 'Plot the five GPS readings from the route table. Click the grid (points snap to grid crossings) or type the coordinates.', grid: { x: [-1, 9], y: [-2, 6] }, targets: ROUTE, connect: true,
    hints: ['x first (across), then y (up or down).', 'The trailhead is the origin.', 'The finish has a negative y: below the x-axis.'], solution: ROUTE.map(p => `${p.name} ${pt(p)}`).join(', ') + '.' },
  'pl-profile': { type: 'plot', ideas: ['plot', 'scales'], level: 'intermediate', prompt: 'Build the elevation profile: plot the seven (distance, elevation) readings. The axes have different scales: 100 m across, 5 m up.', grid: { x: [0, 600], y: [1195, 1220], sx: 100, sy: 5, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', profile: true },
    targets: PROFILE.map(([x, y], i) => ({ x, y, name: ['Start', 'Climb 1', 'Climb 2', 'Highest point', 'Flat end', 'Descent 1', 'Finish'][i] })), connect: true,
    hints: ['Each point is (distance, elevation).', 'Read each axis with its own scale: 100 m per step across, 5 m per step up.', 'The elevations go 1200, 1205, 1210, 1215, 1215, 1210, 1205.'], solution: 'The points climb to 1215 m at 300 m, stay flat to 400 m, then descend to 1205 m at 600 m.' },
  'pl-r200': { type: 'number', ideas: ['read-graph'], level: 'beginner', label: 'Elevation', unit: 'm', answer: 1210, prompt: 'What is the elevation at a horizontal distance of 200 m?', traps: [{ value: 200, code: 'swap-xy', message: '200 is the distance (x). Read the elevation (y) there.' }],
    hints: ['Find 200 on the horizontal axis.', 'Go up to the profile.', 'Read across to the elevation axis.'], solution: 'At x = 200 the profile is at 1210 m: the point (200, 1210).' },
  'pl-peak': { type: 'choice', ideas: ['read-graph'], level: 'intermediate', prompt: 'Where along the route is the trail highest?',
    options: [opt('a', 'From 300 m to 400 m, at 1215 m', true), opt('b', 'At 600 m', false, 'read-graph', 'That’s the finish, at 1205 m.'), opt('c', 'At 1215 m along the route', false, 'swap-xy', '1215 m is the elevation, not the distance.'), opt('d', 'Only at 400 m', false, 'read-graph', 'It reaches 1215 m at 300 m and stays there until 400 m.')],
    hints: ['Look for the largest y-value.', 'More than one point might share it.', 'Read their x-values.'], solution: 'The highest elevation, 1215 m, is reached at 300 m and held until 400 m.' },
  'pl-flat': { type: 'number', ideas: ['read-graph'], level: 'intermediate', label: 'Distance', unit: 'm', answer: 300, prompt: 'At what distance does the flat section begin?',
    traps: [{ value: 1215, code: 'swap-xy', message: 'That’s the elevation. Where along the route (x) does it level off?' }], hints: ['Flat means the elevation stops changing.', 'Find where the profile goes level.', 'Read the x-value.'], solution: 'At 300 m: from (300, 1215) to (400, 1215) the elevation stays the same.' },
  'pl-desc': { type: 'number', ideas: ['read-graph'], level: 'intermediate', label: 'Distance', unit: 'm', answer: 400, prompt: 'Where does the descent begin?', hints: ['After the flat section…', '…the elevation starts to fall.', 'Read that x-value.'], solution: 'At 400 m, the end of the flat section.' },
  'pl-finish': { type: 'number', ideas: ['read-graph'], level: 'beginner', label: 'Elevation', unit: 'm', answer: 1205, prompt: 'What is the finishing elevation?', traps: [{ value: 600, code: 'swap-xy', message: '600 m is the distance. The elevation is the y-value.' }],
    hints: ['The finish is the last point.', 'At x = 600.', 'Read its y-value.'], solution: '1205 m: the last point is (600, 1205).' },
  'pl-pat-a': { type: 'choice', ideas: ['patterns'], level: 'beginner', prompt: 'Table A: each time the distance goes up by 100 m, what happens to the elevation?', fig: tableFig(PATTERN_A, ['Distance x (m)', 'Elevation y (m)']),
    options: [opt('a', 'It goes up by 5 m every time', true), opt('b', 'It goes up by 100 m', false, 'swap-xy', '100 m is the change in distance.'), opt('c', 'It changes by a different amount each time', false, 'constant-rate', '1200 → 1205 → 1210 → 1215: the same each time.'), opt('d', 'It goes down', false, 'slope-sign', 'The elevations increase.')],
    hints: ['Subtract each elevation from the next.', '1205 − 1200, 1210 − 1205…', 'Compare the changes.'], solution: 'It rises 5 m for every 100 m: 1200, 1205, 1210, 1215.' },
  'pl-pat-b': { type: 'choice', ideas: ['patterns'], level: 'intermediate', prompt: 'Table B: what pattern do you see?', fig: tableFig(PATTERN_B, ['Distance x (m)', 'Elevation y (m)']),
    options: [opt('a', 'It always climbs, but by different amounts: +5, +6, +4', true), opt('b', 'It climbs 5 m every 100 m', false, 'constant-rate', '1205 → 1211 is +6, then 1211 → 1215 is +4.'), opt('c', 'It stays flat', false, 'read-graph', 'The elevations change.'), opt('d', 'It climbs then descends', false, 'read-graph', 'Every change is positive.')],
    hints: ['Work out each change.', diffText(PATTERN_B) + '.', 'Are they the same?'], solution: `Changes ${diffText(PATTERN_B)}: always up, but not by the same amount each time.` },
  'pl-miss': { type: 'number', ideas: ['patterns', 'read-graph'], level: 'advanced', label: 'Elevation', unit: 'm', answer: MISSING.answer, prompt: 'One waypoint is missing from this steady climb. Use the table and graph to find the elevation at 200 m.', fig: { kind: 'missing', rows: MISSING.rows },
    traps: [{ value: 1186, code: 'read-graph', message: 'That’s the elevation at 100 m.' }], hints: ['Look at how the known elevations change.', 'Each 100 m adds 6 m.', '1186 + 6.'], solution: '1180, 1186, 1192, 1198, 1204: each 100 m adds 6 m, so (200, 1192).' }
};

// ================================================================ Stage 03: Measure the Grade
const lineFig = (p1, p2, o = {}) => ({ kind: 'lines', p1, p2, ...o });
const M3 = {
  'gr-rr': { type: 'fields', ideas: ['slope'], level: 'beginner', prompt: 'The climb goes from (0, 1200) to (300, 1215). Find the rise and the run.', fig: lineFig(P(0, 1200), P(300, 1215), { tri: true }),
    fields: [{ id: 'rise', label: 'Rise (change in y)', answer: 15, unit: 'm', traps: [{ value: 1215, code: 'read-graph', message: 'That’s an elevation. The rise is the change: 1215 − 1200.' }] },
      { id: 'run', label: 'Run (change in x)', answer: 300, unit: 'm', traps: [{ value: 15, code: 'swap-xy', message: 'That’s the rise. The run is the change in x.' }] }],
    hints: ['Rise = change in y; run = change in x.', 'Rise: 1215 − 1200.', 'Run: 300 − 0.'], solution: 'Rise = 1215 − 1200 = 15 m. Run = 300 − 0 = 300 m.' },
  'gr-m': slopeNum(P(0, 1200), P(300, 1215), { level: 'beginner', prompt: 'Now the slope: m = rise ÷ run.', after: 'For every 1 m across, the trail climbs 0.05 m' }),
  'gr-pct': { type: 'number', ideas: ['grade'], level: 'beginner', label: 'Grade', unit: '%', answer: N(grade(new Frac(1, 20))), prompt: 'Convert the slope 0.05 to a percentage grade.',
    traps: [{ value: 0.05, code: 'grade-for-slope', message: 'That’s the slope. A grade is a percentage: multiply by 100.' }, { value: 0.0005, code: 'grade-for-slope', message: 'Multiply by 100, don’t divide.' }], hints: ['Grade = slope × 100.', '0.05 × 100.', 'Add the % sign.'], solution: '0.05 × 100 = 5%: for every 100 m across, the trail climbs 5 m.' },
  'gr-mean': { type: 'choice', ideas: ['grade'], level: 'intermediate', prompt: 'What does a 5% grade mean on this section?',
    options: [opt('a', 'For every 100 m of horizontal distance, the elevation rises 5 m', true), opt('b', 'The trail is 5% of the way up the mountain', false, 'grade-for-slope', 'Grade compares rise to run.'), opt('c', 'The trail climbs at 5°', false, 'grade-for-slope', 'A grade is a percentage, not an angle (5% is about 2.9°).'), opt('d', 'For every 5 m along the trail, it rises 100 m', false, 'run-over-rise', 'That’s upside down.')],
    hints: ['Grade = rise ÷ run × 100.', '5% = 5/100.', 'Rise 5 for every 100 run.'], solution: '5 m of rise for every 100 m of horizontal run.' },
  'gr-down': slopeNum(P(400, 1215), P(600, 1205), { prompt: 'The descent goes from (400, 1215) to (600, 1205). Find its slope.', fig: lineFig(P(400, 1215), P(600, 1205), { tri: true }), after: 'Negative: the elevation falls as the distance increases' }),
  'gr-down-steep': { type: 'choice', ideas: ['grade', 'slope-sign'], level: 'intermediate', prompt: 'A trail sign for that descent might say “5% downhill”. How does that fit with the slope −0.05?',
    options: [opt('a', 'The signed slope is −0.05 (−5%); the sign shows it goes down. “5% downhill” gives the steepness without the sign', true), opt('b', 'The sign is wrong: it should be −5% downhill', false, 'slope-sign', 'Saying “downhill” already carries the direction.'), opt('c', 'Negative slopes are steeper than positive ones', false, 'slope-sign', '−0.05 and +0.05 are equally steep; the sign is the direction.'), opt('d', 'The trail is 5% below sea level', false, 'negative-elevation', 'A negative slope says nothing about the elevation itself.')],
    hints: ['What does the minus sign tell you?', 'Direction, not steepness.', 'Steepness is the size of the number.'], solution: 'Mathematically the slope is −0.05 (−5%): the minus sign means it falls. People describing steepness often drop the sign and say “5% downhill”.' },
  'gr-two': slopeNum(P(2, 3), P(6, 11), { level: 'intermediate', prompt: 'From two points: find the slope through (2, 3) and (6, 11).' }),
  'gr-table': slopeNum(P(0, 1200), P(100, 1205), { level: 'intermediate', prompt: 'From a table: the first two rows are (0, 1200) and (100, 1205). Find the slope.', fig: tableFig(PATTERN_A, ['Distance (m)', 'Elevation (m)']) }),
  'gr-graph': slopeNum(P(0, 2), P(4, 5), { level: 'intermediate', prompt: 'From a graph: the line passes through the two marked points. Find its slope (a fraction like 3/4 is fine).', fig: { kind: 'grid', grid: { x: [-1, 6], y: [-1, 7], map: false }, points: [{ x: 0, y: 2, label: '(0, 2)' }, { x: 4, y: 5, label: '(4, 5)' }], line: [[0, 2], [4, 5]] } }),
  'gr-words': { type: 'number', ideas: ['slope', 'grade'], level: 'advanced', label: 'Grade', unit: '%', answer: N(grade(new Frac(45, 900))), prompt: 'From words: a fictional fire road climbs from 850 m to 895 m over 900 m of horizontal distance. What is its grade?',
    traps: [{ value: 0.05, code: 'grade-for-slope', message: 'That’s the slope; multiply by 100.' }, { value: 2000, code: 'run-over-rise', message: 'Rise over run: 45 ÷ 900.' }], hints: ['Rise = 895 − 850.', 'Run = 900.', '(45 ÷ 900) × 100.'], solution: '(895 − 850) ÷ 900 = 45 ÷ 900 = 0.05: a 5% grade.' },
  'gr-conn': { type: 'number', ideas: ['grade'], level: 'intermediate', label: 'Grade', unit: '%', answer: N(grade(new Frac(12, 240))), prompt: 'A hypothetical connector rises 12 m over a horizontal run of 240 m. Find the grade.',
    traps: [{ value: 0.05, code: 'grade-for-slope', message: 'As a percentage: × 100.' }, { value: 2000, code: 'run-over-rise', message: '12 ÷ 240, not 240 ÷ 12.' }], hints: ['m = 12 ÷ 240.', 'm = 0.05.', '× 100 for the grade.'], solution: '12 ÷ 240 = 0.05 = 5%.' },
  'gr-short': { type: 'number', ideas: ['grade'], level: 'intermediate', label: 'Grade', unit: '%', answer: N(grade(new Frac(12, 120))), prompt: 'The same 12 m of elevation over only 120 m of horizontal run: what is the grade now?',
    traps: [{ value: 5, code: 'grade-for-slope', message: 'The run changed: 12 ÷ 120.' }, { value: 2.5, code: 'run-over-rise', message: 'A shorter run makes it steeper, not gentler.' }], hints: ['m = 12 ÷ 120.', '= 0.10.', '× 100.'], solution: '12 ÷ 120 = 0.10 = 10%: the same rise over a shorter run is steeper.' },
  'gr-run-length': { type: 'choice', ideas: ['grade'], level: 'advanced', prompt: 'A rider’s GPS says they rode 241 m along that connector. Should you use 241 m as the run?',
    options: [opt('a', 'No: the run is the horizontal distance (240 m); 241 m is measured along the sloping trail', true), opt('b', 'Yes: it’s the more accurate number', false, 'run-vs-length', 'Grade uses horizontal run, not distance along the slope.'), opt('c', 'Yes: they’re the same thing', false, 'run-vs-length', 'The trail surface is the slanted side of the triangle, slightly longer.'), opt('d', 'No: use the rise instead', false, 'run-vs-length', 'The rise goes on top; the horizontal run goes underneath.')],
    hints: ['Picture the rise/run triangle.', 'Run is the flat side.', 'The trail is the slanted side.'], solution: 'Use the horizontal run. The distance along the trail is the slanted side of the triangle: √(240² + 12²) ≈ 240.3 m.' }
};
export const SLOPE_PRACTICE = [[P(1, 2), P(5, 10)], [P(-2, 6), P(2, -2)], [P(0, 1450), P(500, 1475)], [P(3, -1), P(9, -1)], [P(-4, -3), P(2, 1)], [P(100, 980), P(300, 950)]];
export const SLOPE_PRACTICE_IDS = ['gx-m', 'gx-kind'];
export function slopePractice(n) {
  const [a, b] = pick(SLOPE_PRACTICE, n), s = slope(a, b);
  return tidy(arrange({ brief: `Section ${n + 1}: from ${pt(a)} to ${pt(b)}.`,
    'gx-m': slopeNum(a, b, { level: 'advanced', prompt: `Find the slope from ${pt(a)} to ${pt(b)}.` }),
    'gx-kind': { type: 'choice', inline: true, keepOrder: true, ideas: ['slope-sign'], level: 'intermediate', prompt: 'What kind of slope is it?', options: classOpts(s.kind), hints: ['Does y go up, down or stay the same as x increases?', 'Look at the sign of the rise.', 'Rise ' + S(s.rise) + ', run ' + S(s.run) + '.'], solution: `${s.kind[0].toUpperCase() + s.kind.slice(1)}: m = ${S(s.value)}.` } }));
}

// ================================================================ Stage 04: Read the Terrain
const kindQ = (p1, p2, prompt, o = {}) => { const s = slope(p1, p2); return { type: 'choice', inline: true, keepOrder: true, ideas: ['slope-sign'], level: o.level || 'beginner', prompt, fig: lineFig(p1, p2, { tri: s.kind !== 'undefined', vertical: s.kind === 'undefined', bare: o.bare }), options: classOpts(s.kind),
  hints: ['Read the line from left to right.', 'Rising: positive. Falling: negative. Flat: zero. Vertical: undefined.', o.hint || `Rise ${S(s.rise)}, run ${S(s.run)}.`], solution: o.solution || `${s.kind[0].toUpperCase() + s.kind.slice(1)}${s.kind === 'undefined' ? ': the run is 0, and you can’t divide by 0.' : `: m = ${S(s.rise)} / ${S(s.run)} = ${S(s.value)}.`}` }; };
const M4 = {
  'tr-pos': kindQ(P(0, 1200), P(100, 1205), 'A climbing fire road: (0, 1200) to (100, 1205). What kind of slope?'),
  'tr-pos-m': slopeNum(P(0, 1200), P(100, 1205), { ideas: ['slope', 'slope-sign'], level: 'beginner', prompt: 'And its slope?' }),
  'tr-neg': kindQ(P(100, 1210), P(200, 1205), 'A descent: (100, 1210) to (200, 1205). What kind of slope?'),
  'tr-neg-m': slopeNum(P(100, 1210), P(200, 1205), { ideas: ['slope', 'slope-sign'], level: 'beginner', prompt: 'And its slope?' }),
  'tr-zero': kindQ(P(200, 1210), P(300, 1210), 'A flat connector: (200, 1210) to (300, 1210). What kind of slope?'),
  'tr-zero-m': { type: 'number', ideas: ['slope', 'slope-sign'], level: 'beginner', label: 'm', answer: 0, prompt: 'And its slope?', hints: ['Rise = 1210 − 1210.', 'Run = 100.', '0 ÷ 100.'], solution: 'm = 0 / 100 = 0.' },
  'tr-und': kindQ(P(200, 1210), P(200, 1220), 'On the coordinate plane: (200, 1210) to (200, 1220). What kind of slope?', { level: 'intermediate', solution: 'Undefined: the run is 200 − 200 = 0, and dividing by 0 isn’t defined. The line is vertical.' }),
  'tr-und-real': { type: 'choice', ideas: ['slope-sign'], level: 'intermediate', prompt: 'Does an undefined slope describe a trail you could ride?',
    options: [opt('a', 'No: it’s a vertical line on a graph, a mathematical idea, not a rideable trail', true), opt('b', 'Yes: it’s the steepest possible trail', false, 'divide-zero', 'A vertical line has no horizontal run at all.'), opt('c', 'Yes: undefined means very steep', false, 'divide-zero', 'Undefined means the calculation can’t be done (÷ 0), not “very steep”.'), opt('d', 'It means a flat trail', false, 'slope-sign', 'Flat is zero slope.')],
    hints: ['What is the run?', 'Zero horizontal distance.', 'Straight up and down.'], solution: 'An undefined slope is a vertical line: a mathematical case, never a description of a rideable trail.' },
  'tr-c1': kindQ(P(0, 0), P(2, 9), 'Classify: a steep climb.', { level: 'intermediate', bare: true }),
  'tr-c2': kindQ(P(0, 6), P(10, 5), 'Classify: a gentle descent.', { level: 'intermediate', bare: true }),
  'tr-c3': kindQ(P(0, 9), P(2, 0), 'Classify: a steep descent.', { level: 'intermediate', bare: true }),
  'tr-c4': kindQ(P(0, 1), P(10, 2), 'Classify: a gentle climb.', { level: 'intermediate', bare: true }),
  'tr-neg-elev': { type: 'choice', ideas: ['slope-sign'], level: 'advanced', prompt: 'A descent runs from 1,215 m down to 1,205 m. Its slope is negative. Does that mean the elevations are negative?',
    options: [opt('a', 'No: the elevations are positive; the negative slope means they are decreasing', true), opt('b', 'Yes: negative slope means below sea level', false, 'negative-elevation', 'The slope is the rate of change, not the elevation.'), opt('c', 'Yes, for the second half', false, 'negative-elevation', '1205 m is still above sea level.'), opt('d', 'Only if the run is negative', false, 'slope-sign', 'Here the run is positive; the rise is negative.')],
    hints: ['What is the slope measuring?', 'How elevation changes.', 'Are 1215 and 1205 negative?'], solution: 'The elevations stay positive. The negative slope only says they decrease as distance increases.' },
  'tr-same-down': { type: 'choice', ideas: ['slope-sign', 'slope'], level: 'advanced', prompt: 'Two descents: one drops 10 m over 200 m, the other 30 m over 200 m. Do they have the same slope?',
    options: [opt('a', 'No: −0.05 and −0.15; both negative, but the second is three times as steep', true), opt('b', 'Yes: all descents have the same negative slope', false, 'same-downhill', 'The sign gives direction; the size gives steepness.'), opt('c', 'Yes: both are −1', false, 'same-downhill', 'Divide each rise by its run.'), opt('d', 'No: the first is positive', false, 'slope-sign', 'Both fall, so both are negative.')],
    hints: ['Work out each slope.', '−10 ÷ 200 and −30 ÷ 200.', 'Compare the sizes.'], solution: '−10/200 = −0.05 and −30/200 = −0.15. Same direction, different steepness.' }
};

// ================================================================ Stage 05: Analyze Rider Data
const rowsText = rows => rows.map(r => `(${S(r[0])}, ${S(r[1])})`).join(', ');
const M5 = {
  'ld-plus': { type: 'number', ideas: ['constant-rate'], level: 'beginner', label: 'Change', unit: 'm', answer: 5, prompt: 'A simplified fire-road climb (table). Every time the horizontal distance increases by 100 m, how much does the elevation increase?', fig: tableFig(PATTERN_A, ['Distance (m)', 'Elevation (m)']),
    traps: [{ value: 100, code: 'swap-xy', message: '100 m is the change in distance.' }], hints: ['Find each change in elevation.', '1205 − 1200.', 'Is it the same every time?'], solution: '+5 m every time: a constant rate of change, so the relationship is linear.' },
  'ld-m': { type: 'number', ideas: ['constant-rate', 'slope'], level: 'beginner', label: 'm', answer: N(lineOf(PATTERN_A).m), prompt: 'So the rate of change is m = change in y ÷ change in x = ?',
    traps: [{ value: 5, code: 'constant-rate', message: '5 is the change in y. Divide by the change in x, 100.' }, { value: 20, code: 'run-over-rise', message: '5 ÷ 100, not 100 ÷ 5.' }], hints: ['m = Δy ÷ Δx.', '5 ÷ 100.', 'As a decimal.'], solution: 'm = 5 ÷ 100 = 0.05 m of elevation per meter of horizontal distance.' },
  'ld-eq': { type: 'expression', ideas: ['representations', 'constant-rate'], level: 'intermediate', label: 'y =', answer: '1200 + 0.05x', vars: ['x'], prompt: 'Write an equation for the elevation y after x meters of horizontal distance.',
    traps: [{ expr: '0.05x', code: 'linear-proportional', message: 'The climb starts at 1200 m, not 0: add the starting elevation.' }, { expr: '1200x + 0.05', code: 'representations', message: 'The rate (0.05) multiplies x; 1200 is the starting value.' }, { expr: '1200 + 5x', code: 'constant-rate', message: '5 m is per 100 m. Per meter it’s 0.05.' }],
    hints: ['Start value + rate × x.', 'Start: 1200 m.', 'Rate: 0.05 per meter.'], solution: 'y = 1200 + 0.05x: start at 1200 m, gain 0.05 m per horizontal meter.' },
  'ld-a': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'beginner', prompt: 'Example A, a constant-grade climb. Linear or not?', fig: tableFig(PATTERN_A), options: LIN_OPTS(PATTERN_A, 'Differences: ' + diffText(PATTERN_A) + '.'), hints: ['x goes up by 100 each row.', 'Find the changes in y.', diffText(PATTERN_A) + '.'], solution: `Linear: ${diffText(PATTERN_A)} for every 100 m.` },
  'ld-b': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'intermediate', prompt: 'Example B, a changing grade. Linear or not?', fig: tableFig(PATTERN_B), options: LIN_OPTS(PATTERN_B, 'Differences: ' + diffText(PATTERN_B) + '.'), hints: ['Equal x-steps of 100.', 'Changes in y?', diffText(PATTERN_B) + '.'], solution: `Not linear: ${diffText(PATTERN_B)}. The grade changes, as real trails do.` },
  'ld-c': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'intermediate', prompt: 'Example C, a steady speed. Linear or not?', fig: tableFig(SPEED_TABLE, ['Time (min)', 'Distance (m)']), options: LIN_OPTS(SPEED_TABLE, 'Differences: ' + diffText(SPEED_TABLE) + '.'), hints: ['Time goes up by 1 each row.', 'Changes in distance?', diffText(SPEED_TABLE) + '.'], solution: `Linear: ${diffText(SPEED_TABLE)} every minute.` },
  'ld-d': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'intermediate', prompt: 'Example D, variable pump-track speed. Linear or not?', fig: tableFig(PUMP_TABLE, ['Time (min)', 'Distance (m)']), options: LIN_OPTS(PUMP_TABLE, 'Differences: ' + diffText(PUMP_TABLE) + '.'), hints: ['Equal 1-minute steps.', 'Changes in distance?', diffText(PUMP_TABLE) + '.'], solution: `Not linear: ${diffText(PUMP_TABLE)}. The rider speeds up and slows down.` },
  'ld-uneven': { type: 'choice', keepOrder: true, ideas: ['linear', 'constant-rate'], level: 'advanced', prompt: 'Careful: the x-values here aren’t equally spaced. Linear or not?', fig: tableFig(UNEVEN, ['Distance (m)', 'Elevation (m)']),
    options: [opt('lin', 'Linear: the rate between every pair of points is 0.05', isLinear(UNEVEN), 'uneven-spacing', 'Compare rates (Δy ÷ Δx), not just the changes in y, when the x-steps differ.'), opt('not', 'Not linear: the changes in y are +5, +10, +5', !isLinear(UNEVEN), 'uneven-spacing', 'The x-steps are 100, 200 and 100, so equal changes aren’t expected. Compare Δy ÷ Δx instead.')],
    hints: ['The x-steps are 100, 200, 100.', 'Compare Δy ÷ Δx for each pair.', '5/100, 10/200, 5/100.'], solution: 'Rates 5/100, 10/200 and 5/100 are all 0.05: linear. Only compare first differences when the x-values are equally spaced.' },
  'ld-match-eq': { type: 'choice', ideas: ['representations'], level: 'intermediate', prompt: 'A rider travels 240 m every minute at a constant speed, starting at 0. Which equation matches?',
    options: [opt('a', 'd = 240t', true), opt('b', 'd = t + 240', false, 'representations', 'At t = 0 that gives 240, but the rider starts at 0.'), opt('c', 't = 240d', false, 'swap-xy', 'Distance depends on time: d = 240t.'), opt('d', 'd = 240', false, 'representations', 'That never changes.')],
    hints: ['Distance = speed × time.', '240 m each minute.', 'Starting at 0.'], solution: 'd = 240t.' },
  'ld-match-graph': { type: 'choice', ideas: ['representations'], level: 'intermediate', prompt: 'Which graph matches d = 240t?',
    options: [opt('a', 'A straight line through the origin, rising 240 m each minute', true), opt('b', 'A straight line starting at 240 m', false, 'origin', 'At t = 0, d = 0.'), opt('c', 'A curve that gets steeper', false, 'constant-rate', 'A constant speed gives a straight line.'), opt('d', 'A horizontal line at 240', false, 'slope-sign', 'Distance increases over time.')],
    hints: ['Constant rate: straight.', 'd = 0 when t = 0.', 'Slope 240.'], solution: 'A straight line through (0, 0) with slope 240.' },
  'ld-g2t': { type: 'choice', ideas: ['representations'], level: 'advanced', prompt: 'A graph is a straight line through (0, 1500) and (100, 1504). Which table could it come from?', fig: { kind: 'grid', grid: { x: [0, 300], y: [1495, 1515], sx: 50, sy: 5, xLabel: 'Distance (m)', yLabel: 'Elevation (m)', profile: true }, points: [{ x: 0, y: 1500, label: '(0, 1500)' }, { x: 100, y: 1504, label: '(100, 1504)' }], line: [[0, 1500], [300, 1512]] },
    options: [opt('a', '0 → 1500, 100 → 1504, 200 → 1508, 300 → 1512', true), opt('b', '0 → 1500, 100 → 1504, 200 → 1510, 300 → 1512', false, 'constant-rate', 'A straight line changes by the same amount every 100 m.'), opt('c', '0 → 0, 100 → 4, 200 → 8, 300 → 12', false, 'linear-proportional', 'The line starts at 1500, not 0.'), opt('d', '0 → 1500, 100 → 1600, 200 → 1700', false, 'swap-xy', 'The elevation rises 4 m per 100 m, not 100.')],
    hints: ['Find the rate from the two points.', '+4 m per 100 m.', 'Keep adding 4.'], solution: '+4 m every 100 m from 1500: 1500, 1504, 1508, 1512.' },
  'ld-t2e': { type: 'expression', ideas: ['representations'], level: 'advanced', label: 'd =', answer: '150t', vars: ['t'], prompt: 'A table of a rider’s distance d (m) against time t (min): (0, 0), (1, 150), (2, 300), (3, 450). Write its equation.',
    traps: [{ expr: 't + 150', code: 'representations', message: 'Distance goes up 150 every minute: multiply.' }, { expr: '150', code: 'representations', message: 'Include t: the distance depends on time.' }], hints: ['How much does d increase each minute?', '150.', 'Starting at 0.'], solution: 'd = 150t.' },
  'ld-e2w': { type: 'choice', ideas: ['representations'], level: 'advanced', prompt: 'Which description matches y = 900 + 0.08x (y = elevation in m, x = horizontal distance in m)?',
    options: [opt('a', 'A climb starting at 900 m that rises 8 m for every 100 m across', true), opt('b', 'A climb starting at 0 that rises 900 m', false, 'representations', '900 is the starting elevation.'), opt('c', 'A descent of 0.08 m per meter', false, 'slope-sign', 'The rate is positive: a climb.'), opt('d', 'A rider at 900 m/min', false, 'representations', 'x and y are distances and elevations here.')],
    hints: ['b = 900 is where it starts.', 'm = 0.08 per meter.', '0.08 × 100 = 8 per 100 m.'], solution: 'Start at 900 m and rise 0.08 m per meter (8 m per 100 m): an 8% climb.' }
};
export const LIN_PRACTICE = [
  { rows: [[0, 50], [1, 80], [2, 110], [3, 140]], h: ['Time (min)', 'Distance (m)'] }, { rows: [[0, 1400], [200, 1390], [400, 1380], [600, 1370]], h: ['Distance (m)', 'Elevation (m)'] },
  { rows: [[0, 0], [1, 90], [2, 200], [3, 290]], h: ['Time (min)', 'Distance (m)'] }, { rows: [[0, 980], [50, 984], [100, 988], [200, 996]], h: ['Distance (m)', 'Elevation (m)'] },
  { rows: [[0, 12], [2, 18], [4, 26], [6, 30]], h: ['x', 'y'] }, { rows: [[0, 0], [2, 360], [4, 720], [6, 1080]], h: ['Time (min)', 'Distance (m)'] }
];
export const LIN_PRACTICE_IDS = ['lx-lin', 'lx-rate'];
export function linPractice(n) {
  const X = pick(LIN_PRACTICE, n), lin = isLinear(X.rows), R = rates(X.rows);
  return tidy({ brief: `Ride dataset ${n + 1}: ${rowsText(X.rows)}.`,
    'lx-lin': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'advanced', prompt: 'Is this relationship linear?', fig: tableFig(X.rows, X.h), options: LIN_OPTS(X.rows, 'Rates between points: ' + R.map(S).join(', ') + '.'),
      hints: ['Are the x-values equally spaced?', 'Compare Δy ÷ Δx between each pair of points.', 'Rates: ' + R.map(S).join(', ') + '.'], solution: (lin ? 'Linear' : 'Not linear') + ': rates ' + R.map(S).join(', ') + '.' },
    'lx-rate': { type: 'number', ideas: ['constant-rate'], level: 'advanced', label: 'Rate', answer: N(R[0]), tolerance: 1e-6, prompt: 'What is the rate of change between the first two points?', hints: ['Δy ÷ Δx.', `${S(X.rows[1][1])} − ${S(X.rows[0][1])} over ${S(X.rows[1][0])} − ${S(X.rows[0][0])}.`, 'Divide.'], solution: `${S(R[0])}.` } });
}

// ================================================================ Stage 06: Find Your Flow
const M6 = {
  'pf-eq': { type: 'expression', ideas: ['proportional'], level: 'beginner', label: 'd =', answer: '240t', vars: ['t'], prompt: 'A rider travels 240 m per minute. Write the relationship between distance d and time t.', fig: tableFig(SPEED_TABLE, ['Time t (min)', 'Distance d (m)']),
    traps: [{ expr: 't + 240', code: 'representations', message: 'Distance grows by 240 each minute: 240 × t.' }, { expr: 't/240', code: 'run-over-rise', message: 'd = 240t: distance = speed × time.' }], hints: ['How far each minute?', '240 × the number of minutes.', 'd = …'], solution: 'd = 240t.' },
  'pf-k': { type: 'number', ideas: ['k-value'], level: 'beginner', label: 'k', answer: N(new Frac(480, 2)), prompt: 'Find k from the table using k = y ÷ x with the row (2, 480).',
    traps: [{ value: N(new Frac(2, 480)), code: 'run-over-rise', message: 'k = y ÷ x: 480 ÷ 2.' }], hints: ['k = d ÷ t.', '480 ÷ 2.', 'Same as the speed.'], solution: 'k = 480 ÷ 2 = 240.' },
  'pf-units': { type: 'choice', ideas: ['k-value'], level: 'beginner', prompt: 'What are the units of k = 240?', options: [opt('a', 'Meters per minute', true), opt('b', 'Minutes per meter', false, 'run-over-rise', 'k = distance ÷ time.'), opt('c', 'Meters', false, 'k-value', 'k is a rate.'), opt('d', 'Minutes', false, 'k-value', 'k is a rate.')],
    hints: ['k = y ÷ x.', 'y is meters, x is minutes.', 'm ÷ min.'], solution: 'Meters per minute: k = distance ÷ time.' },
  'pf-verify': { type: 'choice', ideas: ['k-value', 'proportional'], level: 'intermediate', prompt: 'Check every row: 240/1, 480/2, 720/3, 960/4. What do you find?',
    options: [opt('a', 'Every ratio is 240, and (0, 0) is in the table: proportional', true), opt('b', 'The ratios grow', false, 'k-value', 'Work out each one: all 240.'), opt('c', 'You can also use 0/0 = 240', false, 'ratio-zero', 'Never divide by 0: check the origin separately instead.'), opt('d', 'One row is enough to decide', false, 'linear-proportional', 'Check the whole relationship.')],
    hints: ['Divide each distance by its time.', 'Skip t = 0 (you can’t divide by 0).', 'Does the table include (0, 0)?'], solution: 'Every ratio is 240 and the table includes (0, 0): proportional, d = 240t.' },
  'pf-origin': { type: 'multi', ideas: ['proportional'], level: 'intermediate', prompt: 'Which graphs show proportional relationships? Tick them all.', fig: { kind: 'four', lines: [{ id: 'A', m: 2, b: 0 }, { id: 'B', m: 1, b: 3 }, { id: 'C', m: 0.5, b: 0 }, { id: 'D', m: -1, b: 6 }] },
    options: [opt('A', 'Graph A', true), opt('B', 'Graph B', false, 'origin', 'Graph B is straight, but it doesn’t pass through the origin.'), opt('C', 'Graph C', true), opt('D', 'Graph D', false, 'origin', 'Graph D starts at 6, not 0.')],
    hints: ['Proportional graphs are straight lines…', '…that pass through (0, 0).', 'Check where each line meets the y-axis.'], solution: 'A and C: straight lines through the origin. B and D are linear but don’t pass through (0, 0).' },
  'pf-vs': { type: 'choice', ideas: ['proportional', 'linear'], level: 'intermediate', prompt: 'Relationship B: elevation e = 1200 + 0.05x on a steady-grade trail. Is it proportional?',
    options: [opt('a', 'No: it’s linear (constant rate), but it starts at 1200, not 0', true), opt('b', 'Yes: it has a constant rate of change', false, 'linear-proportional', 'Constant rate makes it linear; proportional also needs the origin.'), opt('c', 'No: it isn’t linear', false, 'constant-rate', 'The rate is a constant 0.05: it is linear.'), opt('d', 'Yes: the ratio e/x is constant', false, 'linear-proportional', '1205/100 = 12.05 but 1210/200 = 6.05: not constant.')],
    hints: ['Is the rate constant?', 'What is e when x = 0?', 'Proportional needs e = 0 at x = 0.'], solution: 'Linear, but not proportional: at x = 0, e = 1200. Its graph has a nonzero y-intercept.' },
  'pf-all': { type: 'choice', ideas: ['proportional'], level: 'advanced', prompt: 'Which statement is true?',
    options: [opt('a', 'All proportional relationships are linear, but not all linear relationships are proportional', true), opt('b', 'All linear relationships are proportional', false, 'linear-proportional', 'e = 1200 + 0.05x is linear but not proportional.'), opt('c', 'Proportional relationships are never linear', false, 'linear-proportional', 'y = kx is a straight line.'), opt('d', 'A relationship is proportional if one ratio y/x is a whole number', false, 'k-value', 'Every ratio must match, and the graph must pass through the origin.')],
    hints: ['Is y = kx a straight line?', 'Does every straight line pass through the origin?', 'Think of e = 1200 + 0.05x.'], solution: 'y = kx is always a straight line through the origin, but lines like y = 1200 + 0.05x are linear without being proportional.' },
  'pf-180': { type: 'expression', ideas: ['proportional'], level: 'intermediate', label: 'd =', answer: '180t', vars: ['t'], prompt: 'A rider travels at a constant 180 m per minute. Write the equation.', hints: ['d = kt.', 'k = 180.', 'd = 180t.'], solution: 'd = 180t.' },
  'pf-180-vals': { type: 'fields', ideas: ['proportional'], level: 'intermediate', prompt: 'Use d = 180t: how far after 1, 2 and 5 minutes?',
    fields: [{ id: 'a', label: 'After 1 min', unit: 'm', answer: 180 }, { id: 'b', label: 'After 2 min', unit: 'm', answer: 360 }, { id: 'c', label: 'After 5 min', unit: 'm', answer: 900, traps: [{ value: 185, code: 'representations', message: 'Multiply: 180 × 5.' }] }],
    hints: ['Substitute each t.', '180 × 2.', '180 × 5.'], solution: '180 m, 360 m and 900 m.' },
  'pf-table-k': { type: 'number', ideas: ['k-value'], level: 'advanced', label: 'k', unit: 'm/min', answer: 210, prompt: 'A table: (0, 0), (2, 420), (3, 630), (5, 1050). Find k.', traps: [{ value: 420, code: 'k-value', message: 'Divide the distance by the time: 420 ÷ 2.' }],
    hints: ['k = y ÷ x for any nonzero x.', '420 ÷ 2.', 'Check another row.'], solution: '420/2 = 630/3 = 1050/5 = 210: k = 210 m/min, and the table includes (0, 0).' },
  'pf-table-eq': { type: 'expression', ideas: ['proportional', 'k-value'], level: 'advanced', label: 'd =', answer: '210t', vars: ['t'], prompt: 'Write the equation for that table.', hints: ['d = kt.', 'k = 210.', 'd = 210t.'], solution: 'd = 210t.' },
  'pf-prop': { type: 'multi', inline: true, keepOrder: true, ideas: ['proportional'], level: 'advanced', prompt: 'The flow challenge (fictional riders A, B and C, table above). Which riders have a proportional relationship between time and distance?',
    options: ['A', 'B', 'C'].map(r => opt(r, 'Rider ' + r, proportional([[0, 0], ...RIDERS[r]]).proportional && new Set(ratios(RIDERS[r]).map(String)).size === 1, 'k-value', r === 'C' ? 'Rider C’s ratios are 180, 195 and 210: not constant.' : null)),
    hints: ['Work out distance ÷ time for each row.', 'A: 200, 200, 200. B: 240, 240, 240.', 'C: 180, 195, 210.'], solution: 'Riders A and B: their ratios stay at 200 and 240. Rider C’s ratio changes.' },
  'pf-speeds': { type: 'fields', ideas: ['k-value'], level: 'advanced', prompt: 'What are the constant speeds (k) of Riders A and B?',
    fields: [{ id: 'a', label: 'Rider A', unit: 'm/min', answer: 200 }, { id: 'b', label: 'Rider B', unit: 'm/min', answer: 240 }], hints: ['k = distance ÷ time.', 'A: 200 ÷ 1.', 'B: 240 ÷ 1.'], solution: 'A: 200 m/min. B: 240 m/min.' },
  'pf-fast': { type: 'choice', ideas: ['k-value', 'constant-rate'], level: 'advanced', prompt: 'Which rider has the greatest constant rate of change?',
    options: [opt('b', 'Rider B: 240 m/min', true), opt('a', 'Rider A: 200 m/min', false, 'k-value', 'B covers more each minute.'), opt('c', 'Rider C, because they finish furthest after 3 min', false, 'constant-rate', 'Rider C’s rate isn’t constant (and 630 m < 720 m).'), opt('s', 'They’re all the same', false, 'k-value', 'Compare the rates.')],
    hints: ['Compare the k values.', 'C’s rate changes, so it has no single constant rate.', '240 vs 200.'], solution: 'Rider B, at a constant 240 m/min. Rider C speeds up, so has no single constant rate.' }
};
export const PROP_PRACTICE = [[[0, 0], [1, 160], [3, 480], [4, 640]], [[0, 50], [1, 250], [2, 450], [3, 650]], [[0, 0], [2, 500], [4, 1000], [5, 1250]], [[0, 0], [1, 120], [2, 260], [3, 390]], [[0, 0], [3, 540], [6, 1080], [8, 1440]], [[0, 1200], [100, 1206], [200, 1212], [300, 1218]]];
export const PROP_PRACTICE_IDS = ['px-class', 'px-k'];
export function propPractice(n) {
  const rows = pick(PROP_PRACTICE, n), c = classify(rows), pr = proportional(rows), R = rates(rows);
  const CL = [opt('proportional', 'Proportional', c === 'proportional', 'linear-proportional', c === 'linear' ? 'It’s linear, but it doesn’t pass through (0, 0).' : 'The rate isn’t constant.'), opt('linear', 'Linear, not proportional', c === 'linear', 'linear-proportional', c === 'proportional' ? 'It passes through the origin with a constant ratio: proportional.' : 'The rate changes, so it isn’t linear.'), opt('not-linear', 'Not linear', c === 'not-linear', 'constant-rate', 'The rate between points is constant.')];
  return tidy({ brief: `Ride dataset ${n + 1}: ${rowsText(rows)}.`,
    'px-class': { type: 'choice', keepOrder: true, ideas: ['proportional', 'linear'], level: 'advanced', prompt: 'Classify this relationship.', fig: tableFig(rows), options: CL,
      hints: ['Is the rate constant?', 'Does it pass through (0, 0)?', 'Rates: ' + R.map(S).join(', ') + '.'], solution: { proportional: 'Proportional', linear: 'Linear but not proportional', 'not-linear': 'Not linear' }[c] + ': rates ' + R.map(S).join(', ') + (rows[0][0] === 0 ? `, starting at ${S(rows[0][1])}.` : '.') },
    'px-k': { type: 'number', ideas: ['k-value', 'constant-rate'], level: 'advanced', label: 'Rate', answer: N(R[0]), tolerance: 1e-6, prompt: 'What is the rate of change (k if it’s proportional)?', hints: ['Δy ÷ Δx between the first two rows.', `${S(rows[1][1])} − ${S(rows[0][1])} over ${S(rows[1][0])} − ${S(rows[0][0])}.`, 'Divide.'], solution: `${S(R[0])}${pr.proportional ? ' (k)' : ''}.` } });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'scout', n: 1, title: 'Scout the Mountain', short: 'Scout the Mountain', minutes: '7–9', focus: 'Coordinate Plane', badge: 'Trail Scout', blurb: 'Read the topographic map: axes, the origin at the trailhead, four quadrants, and maps with different scales.', graded: Object.keys(M1) },
  { id: 'plot', n: 2, title: 'Plot Your Line', short: 'Plot Your Line', minutes: '7–9', focus: 'Graphing Ordered Pairs', badge: 'GPS Mapper', blurb: 'Plot GPS readings, build the elevation profile, read the graph and find a missing waypoint.', graded: Object.keys(M2) },
  { id: 'grade', n: 3, title: 'Measure the Grade', short: 'Measure the Grade', minutes: '7–9', focus: 'Slope and Rate of Change', badge: 'Grade Analyst', blurb: 'Rise over run, percentage grade, and slope from points, tables, graphs and words.', graded: Object.keys(M3) },
  { id: 'terrain', n: 4, title: 'Read the Terrain', short: 'Read the Terrain', minutes: '6–8', focus: 'Positive and Negative Slope', badge: 'Terrain Reader', blurb: 'Climbs, descents, flats and the vertical line: what the sign of a slope tells you.', graded: Object.keys(M4) },
  { id: 'data', n: 5, title: 'Analyze Rider Data', short: 'Analyze Rider Data', minutes: '7–9', focus: 'Linear Relationships', badge: 'Ride Data Analyst', blurb: 'Constant rates of change, linear or not, and words, tables, graphs and equations.', graded: Object.keys(M5) },
  { id: 'flow', n: 6, title: 'Find Your Flow', short: 'Find Your Flow', minutes: '7–9', focus: 'Proportional Relationships', badge: 'Flow Master', blurb: 'y = kx at a steady pace: the constant of proportionality, the origin, and linear vs proportional.', graded: Object.keys(M6) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)), ...arrange(tidy(M5)), ...arrange(tidy(M6)) };

// ================================================================ The Ultimate Ride Analysis Challenge
export const FINAL_SETS = [
  { name: 'Ridgeback Network', map: [{ name: 'Trailhead', x: 0, y: 0 }, { name: 'Jump zone', x: 4, y: 3 }, { name: 'Viewpoint', x: -5, y: 4 }, { name: 'Pump track', x: -3, y: -4 }, { name: 'Berm section', x: 2, y: -5 }, { name: 'Finish', x: 6, y: -2 }],
    profile: [[0, 900], [200, 910], [400, 920], [600, 920], [800, 905]], vertical: [P(300, 910), P(300, 925)],
    linear: { rows: [[0, 900], [200, 910], [400, 920]], other: [[0, 0], [1, 150], [2, 330], [3, 450]] },
    sets: { speed: [[0, 0], [1, 220], [2, 440], [3, 660]], grade: [[0, 900], [100, 905], [200, 910], [300, 915]], pump: [[0, 0], [1, 140], [2, 330], [3, 450]] } },
  { name: 'Cedar Bowl', map: [{ name: 'Trailhead', x: 0, y: 0 }, { name: 'Jump zone', x: -4, y: 2 }, { name: 'Viewpoint', x: 3, y: 5 }, { name: 'Pump track', x: 5, y: -3 }, { name: 'Berm section', x: -2, y: -4 }, { name: 'Finish', x: -6, y: -1 }],
    profile: [[0, 1500], [100, 1506], [200, 1512], [300, 1512], [400, 1500]], vertical: [P(150, 1505), P(150, 1515)],
    linear: { rows: [[0, 1500], [100, 1506], [200, 1512]], other: [[0, 0], [1, 100], [2, 250], [3, 350]] },
    sets: { speed: [[0, 0], [1, 190], [2, 380], [3, 570]], grade: [[0, 1500], [100, 1506], [200, 1512], [300, 1518]], pump: [[0, 0], [1, 120], [2, 290], [3, 380]] } },
  { name: 'Granite Flow', map: [{ name: 'Trailhead', x: 0, y: 0 }, { name: 'Jump zone', x: 5, y: 1 }, { name: 'Viewpoint', x: -2, y: 6 }, { name: 'Pump track', x: -5, y: -2 }, { name: 'Berm section', x: 3, y: -4 }, { name: 'Finish', x: 1, y: -6 }],
    profile: [[0, 600], [250, 615], [500, 630], [750, 630], [1000, 610]], vertical: [P(500, 620), P(500, 640)],
    linear: { rows: [[0, 600], [250, 615], [500, 630]], other: [[0, 10], [1, 30], [2, 60], [3, 100]] },
    sets: { speed: [[0, 0], [1, 260], [2, 520], [3, 780]], grade: [[0, 600], [100, 606], [200, 612], [300, 618]], pump: [[0, 0], [1, 150], [2, 340], [3, 470]] } },
  { name: 'Alder Ridge', map: [{ name: 'Trailhead', x: 0, y: 0 }, { name: 'Jump zone', x: -3, y: 5 }, { name: 'Viewpoint', x: 6, y: 4 }, { name: 'Pump track', x: 4, y: -5 }, { name: 'Berm section', x: -6, y: -3 }, { name: 'Finish', x: -1, y: -2 }],
    profile: [[0, 2000], [100, 2008], [200, 2016], [300, 2016], [400, 2004]], vertical: [P(100, 2000), P(100, 2010)],
    linear: { rows: [[0, 2000], [100, 2008], [200, 2016]], other: [[0, 5], [1, 15], [2, 35], [3, 45]] },
    sets: { speed: [[0, 0], [1, 210], [2, 420], [3, 630]], grade: [[0, 2000], [100, 2008], [200, 2016], [300, 2024]], pump: [[0, 0], [1, 170], [2, 380], [3, 520]] } }
];
export const FINAL_IDS = ['fa-map', 'fa-quad', 'fb-profile', 'fb-high', 'fc-pos', 'fc-neg', 'fc-zero', 'fc-und', 'fd-lin', 'fd-rate', 'fd-eq', 'fe-speed', 'fe-grade', 'fe-pump'];
export const PASS_MARK = 11;   // of 14, right without the solution shown
export function finalSet(r) {
  const S_ = pick(FINAL_SETS, r - 1), pr = S_.profile, maxY = Math.max(...pr.map(p => p[1]));
  const sy = [5, 4, 2, 1].find(k => pr.every(p => p[1] % k === 0)), minY = Math.min(...pr.map(p => p[1]));
  const span = [Math.floor((minY - 2 * sy) / sy) * sy, Math.ceil((maxY + 2 * sy) / sy) * sy];
  return { ...S_, sy, pos: [P(...pr[0]), P(...pr[2])], neg: [P(...pr[3]), P(...pr[4])], zero: [P(...pr[2]), P(...pr[3])], maxY, span, line: lineOf(S_.linear.rows) };
}
export function finalQuestions(roundNo) {
  const X = finalSet(roundNo), pr = X.profile, step = pr[1][0] - pr[0][0], quadPt = X.map[2], highXs = pr.filter(p => p[1] === X.maxY).map(p => p[0]);
  const clsQ = (rows, label) => { const c = classify(rows); return { type: 'choice', keepOrder: true, ideas: ['proportional', 'linear'], level: 'advanced', prompt: `${label}: ${rowsText(rows)}. Classify it.`, fig: tableFig(rows),
    options: [opt('proportional', 'Proportional', c === 'proportional', 'linear-proportional', c === 'linear' ? 'Linear, but not through (0, 0).' : 'The rate isn’t constant.'), opt('linear', 'Linear, not proportional', c === 'linear', 'linear-proportional', c === 'proportional' ? 'It passes through (0, 0) with a constant ratio.' : 'The rate changes.'), opt('not-linear', 'Not linear', c === 'not-linear', 'constant-rate', 'The rate is constant.')],
    hints: ['Constant rate?', 'Through (0, 0)?', 'Rates: ' + rates(rows).map(S).join(', ') + '.'], solution: { proportional: 'Proportional', linear: 'Linear, not proportional', 'not-linear': 'Not linear' }[c] + ': rates ' + rates(rows).map(S).join(', ') + '.' }; };
  return tidy({
    set: X,
    'fa-map': { type: 'plot', ideas: ['plot', 'quadrants'], level: 'intermediate', prompt: `Task 1: map the ${X.name}. The origin is the trailhead; plot every waypoint.`, grid: MAP, targets: X.map,
      hints: ['x across, then y.', 'Use all four quadrants.', 'Negative is left or down.'], solution: X.map.map(p => `${p.name} ${pt(p)}`).join('; ') + '.' },
    'fa-quad': quadQ(quadPt.x, quadPt.y, `Which quadrant is the ${quadPt.name.toLowerCase()} in, at ${pt(quadPt)}?`, ['quadrants'], 'intermediate'),
    'fb-profile': { type: 'plot', ideas: ['plot', 'scales'], level: 'advanced', prompt: 'Task 2: plot the elevation profile and connect it.', grid: { x: [0, pr[pr.length - 1][0]], y: X.span, sx: step, sy: X.sy, xLabel: 'Horizontal distance (m)', yLabel: 'Elevation (m)', profile: true },
      targets: pr.map(([x, y], i) => ({ x, y, name: 'Point ' + (i + 1) })), connect: true, hints: ['(distance, elevation).', `Across: ${step} m per step. Up: ${X.sy} m per step.`, 'Read each axis with its own scale.'], solution: rowsText(pr) + '.' },
    'fb-high': { type: 'number', ideas: ['read-graph'], level: 'intermediate', label: 'Elevation', unit: 'm', answer: X.maxY, prompt: 'What is the highest elevation on the profile?', hints: ['The largest y-value.', 'Look at the top of the profile.', `It’s reached at ${highXs.join(' and ')} m.`], solution: `${X.maxY} m, at ${highXs.join(' to ')} m.` },
    'fc-pos': slopeNum(X.pos[0], X.pos[1], { level: 'intermediate', prompt: `Task 3: slope of the climb from ${pt(X.pos[0])} to ${pt(X.pos[1])}.` }),
    'fc-neg': slopeNum(X.neg[0], X.neg[1], { ideas: ['slope', 'slope-sign'], level: 'intermediate', prompt: `Slope of the descent from ${pt(X.neg[0])} to ${pt(X.neg[1])}.` }),
    'fc-zero': { type: 'number', ideas: ['slope-sign'], level: 'beginner', label: 'm', answer: 0, prompt: `Slope of the flat section from ${pt(X.zero[0])} to ${pt(X.zero[1])}.`, hints: ['Rise?', '0.', '0 ÷ run.'], solution: '0: no change in elevation.' },
    'fc-und': { type: 'choice', inline: true, keepOrder: true, ideas: ['slope-sign'], level: 'intermediate', prompt: `A separate mathematical example: the line through ${pt(X.vertical[0])} and ${pt(X.vertical[1])}. What is its slope?`, options: classOpts('undefined'),
      hints: ['Find the run.', `${S(X.vertical[1].x)} − ${S(X.vertical[0].x)}.`, 'Can you divide by 0?'], solution: 'Undefined: the run is 0 (a vertical line).' },
    'fd-lin': { type: 'choice', keepOrder: true, ideas: ['linear'], level: 'intermediate', prompt: `Task 4: a ride table: ${rowsText(X.linear.other)}. Linear?`, fig: tableFig(X.linear.other, ['Time (min)', 'Distance (m)']), options: LIN_OPTS(X.linear.other, 'Rates: ' + rates(X.linear.other).map(S).join(', ') + '.'),
      hints: ['Equal steps in x?', 'Compare the changes.', 'Rates: ' + rates(X.linear.other).map(S).join(', ') + '.'], solution: 'Not linear: rates ' + rates(X.linear.other).map(S).join(', ') + '.' },
    'fd-rate': { type: 'number', ideas: ['constant-rate'], level: 'intermediate', label: 'Rate', answer: N(X.line.m), tolerance: 1e-6, prompt: `The climb’s table: ${rowsText(X.linear.rows)}. What is its constant rate of change?`, hints: ['Δy ÷ Δx.', `${S(X.linear.rows[1][1] - X.linear.rows[0][1])} ÷ ${S(X.linear.rows[1][0] - X.linear.rows[0][0])}.`, 'Check the next pair too.'], solution: `${S(X.line.m)} m of elevation per meter across.` },
    'fd-eq': { type: 'expression', ideas: ['representations'], level: 'advanced', label: 'y =', answer: `${S(X.line.b)} + ${S(X.line.m)}x`, vars: ['x'], prompt: 'Write the climb’s equation (y = elevation, x = horizontal distance).', hints: ['Start value + rate × x.', `Start: ${S(X.line.b)}.`, `Rate: ${S(X.line.m)}.`], solution: `y = ${S(X.line.b)} + ${S(X.line.m)}x: start at ${S(X.line.b)} m, climb ${S(X.line.m)} m per meter.` },
    'fe-speed': clsQ(X.sets.speed, 'Task 5: a constant-speed rider'),
    'fe-grade': clsQ(X.sets.grade, 'A constant-grade elevation dataset'),
    'fe-pump': clsQ(X.sets.pump, 'A variable-speed pump-track dataset')
  });
}

// The original Slope Lab's 32 questions (content/questions.js), kept as the
// practice bank and transfer challenge under their ids in lower case.
export const LEGACY_IDEAS = { 'rise-run': ['slope'], 'slope-types': ['slope-sign'], 'rise-over-run': ['slope'], grade: ['grade'], 'two-points': ['slope'], table: ['linear', 'constant-rate'], graph: ['slope', 'read-graph'], equation: ['representations'], rate: ['constant-rate'] };
export const LEGACY_KINDS = Object.fromEntries(BANK.map(q => [q.id.toLowerCase(), LEGACY_IDEAS[q.objective]]));
export function questionKinds() {
  const out = { ...LEGACY_KINDS };
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[SCOUT_PRACTICE, scoutPractice, SCOUT_PRACTICE_IDS], [SLOPE_PRACTICE, slopePractice, SLOPE_PRACTICE_IDS], [LIN_PRACTICE, linPractice, LIN_PRACTICE_IDS], [PROP_PRACTICE, propPractice, PROP_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const F = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...F[id].ideas])]; }
  return out;
}
export { pt as pointText, rowsText };
