// Frame the Line: every graded question. Answers come from the kit's engines
// (expr.js, equation.js, interval.js; exact fractions) and logic/film.js,
// never typed in by hand. Three progressive hints each, a worked solution,
// and traps (anticipated wrong answers with a misconception code).
//
// Types the lab draws (frame-the-line.js): 'plot' (place given points; Map
// the Line's plotter) and 'lineplot' (place any two points on a line).
// fig: a figure under the prompt (Map the Line's grid/table, or this lab's
// 'segment', 'dots' and 'relations').

import { value } from '../../lesson-kit/expr.js';
import { lineOf } from '../../lesson-kit/equation.js';
import { Frac, show } from '../../lesson-kit/frac.js';
import { BUDGET, C, Sf, Ef, BUDGET_TABLE } from './film.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const V = (e, vars) => Number(value(e, vars));
const S = x => show(Frac.of(x)).replace(/^-/, '−');
const money = x => '$' + Number(x).toLocaleString('en-US');
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
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
// y = mx + b as text, with letters: lin(420, 1800, 'd') → '420d + 1800'
const lin = (m, b, x) => { m = Frac.of(m); b = Frac.of(b); const mt = m.eq(1) ? x : m.eq(-1) ? '−' + x : S(m) + x; return b.zero ? mt : mt + (b.n < 0 ? ' − ' + S(b.neg()) : ' + ' + S(b)); };
const expr = (y, m, b, x, o = {}) => ({ type: 'expression', ideas: o.ideas || ['write-eq'], level: o.level || 'intermediate', label: y + ' =', answer: lin(m, b, x).replace(/−/g, '-'), vars: [x.toLowerCase()], prompt: o.prompt, fig: o.fig, tiles: o.tiles,
  traps: [{ expr: lin(b, m, x).replace(/−/g, '-'), code: 'm-b-swap', message: `The rate multiplies ${x}; the starting value is added on its own.` }, { expr: lin(m, 0, x).replace(/−/g, '-'), code: 'missing-intercept', message: 'Add the starting value (the intercept).' }, ...(o.traps || [])],
  hints: o.hints || [`What changes with ${x}, and what is fixed?`, `The rate (slope) multiplies ${x}.`, `The starting value is the ${y}-intercept.`], solution: o.solution || `${y} = ${lin(m, b, x)}.` });
const ps = (y, x, m, x1, y1, o = {}) => ({ type: 'line', ideas: o.ideas || ['point-slope'], level: o.level || 'intermediate', label: 'Equation', y: y.toLowerCase(), x: x.toLowerCase(), form: 'point-slope', point: [x1, y1],
  answer: `${y} - ${y1} = ${m}(${x} - ${x1})`, prompt: o.prompt,
  traps: [{ eq: `${y} + ${y1} = ${m}(${x} + ${x1})`, code: 'ps-sign', message: `Point-slope form subtracts the point’s coordinates: ${y} − ${S(y1)} and ${x} − ${S(x1)}.` }, { eq: `${y} - ${x1} = ${m}(${x} - ${y1})`, code: 'swap-xy', message: `The point is (${S(x1)}, ${S(y1)}): ${S(x1)} goes with ${x}, ${S(y1)} with ${y}.` }],
  hints: o.hints || ['Point-slope form: y − y₁ = m(x − x₁).', `The point is (${S(x1)}, ${S(y1)}); the slope is ${S(m)}.`, `${y} − ${S(y1)} = ${S(m)}(${x} − ${S(x1)}).`], solution: `${y} − ${S(y1)} = ${S(m)}(${x} − ${S(x1)}).` });
const num = (answer, o) => ({ type: 'number', tolerance: 1e-6, ...o, answer });
const BUDGET_GRID = { x: [0, 8], y: [1800, 5160], sx: 1, sy: 420, profile: true, rect: true, xLabel: 'Shoot days d', yLabel: 'Cost C ($)', map: false };

export const IDEAS = {
  'write-eq': 'Writing equations from descriptions, points, tables and graphs',
  'slope-int': 'Slope and y-intercept in y = mx + b',
  'context-mb': 'The meaning of m and b in context',
  rearrange: 'Rewriting equations in slope-intercept form',
  'point-slope': 'Point-slope form',
  convert: 'Converting between forms',
  graph: 'Graphing linear equations',
  intercepts: 'x- and y-intercepts',
  'hv-lines': 'Horizontal and vertical lines',
  domain: 'Domain',
  range: 'Range',
  interval: 'Interval and inequality notation',
  'is-function': 'Is it a function?',
  evaluate: 'Evaluating functions',
  'fn-context': 'Function notation in context'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'write', name: 'Writing Linear Equations', ideas: ['write-eq'] },
  { id: 'si', name: 'Slope-Intercept Form', ideas: ['slope-int', 'context-mb', 'rearrange'] },
  { id: 'ps', name: 'Point-Slope Form', ideas: ['point-slope', 'convert'] },
  { id: 'graph', name: 'Graphing Linear Equations', ideas: ['graph', 'intercepts', 'hv-lines'] },
  { id: 'dr', name: 'Domain and Range', ideas: ['domain', 'range', 'interval'] },
  { id: 'fn', name: 'Function Notation', ideas: ['is-function', 'evaluate', 'fn-context'] }
];
export const MISCONCEPTIONS = {
  'm-b-swap': 'Confusing the slope with the y-intercept',
  'slope-as-start': 'Interpreting the slope as the starting cost',
  'missing-intercept': 'Leaving out the starting value',
  reciprocal: 'Writing the slope as a reciprocal (run ÷ rise)',
  'two-point-sub': 'Substituting into a two-point calculation incorrectly',
  'ps-sign': 'Sign errors in point-slope form',
  'distribute-error': 'Distributing incorrectly when converting forms',
  'slope-direction': 'Graphing the slope in the wrong direction',
  'intercept-swap': 'Confusing the x- and y-intercepts',
  'vertical-function': 'Treating a vertical line as a function of x',
  'all-reals': 'Assuming domain and range are always all real numbers',
  'ignore-constraints': 'Ignoring practical limits on inputs',
  'discrete-continuous': 'Treating a whole-day schedule as continuous (or the reverse) without saying so',
  'fn-multiply': 'Reading function notation as multiplication',
  'every-relation': 'Thinking every relation is a function',
  'shared-output': 'Thinking two inputs can’t share an output',
  'swap-xy': 'Swapping the input and output',
  'open-closed': 'Including or excluding the wrong endpoints',
  'reversed-interval': 'Writing an interval backwards',
  intercept: 'Right slope, wrong intercept',
  slope: 'Right intercept, wrong slope',
  sign: 'A sign error',
  arithmetic: 'An arithmetic slip',
  'plot-error': 'Placing points off the line',
  'hv-swap': 'Mixing up horizontal and vertical lines',
  'quadrant-signs': 'Sign errors when plotting',
  'scale-count': 'Misreading an axis scale',
  'graph-needed': 'Not reading the slope straight from the equation',
  'parallel-cross': 'Thinking lines with the same slope will meet',
  'form-choice': 'Choosing a form that doesn’t match the information given'
};

// ================================================================ Stage 01: Plan the Production
const TILES = ['420', '1800', 'd', '+', '−', '×'];
const M1 = {
  'w-desc': expr('C', 420, 1800, 'd', { level: 'beginner', tiles: TILES, prompt: 'The producer’s note: “The production needs $1,800 in initial expenses, and every shoot day adds $420.” Build the total cost C for d shoot days.',
    hints: ['Which amount is paid once, and which is paid every day?', 'Every day adds 420: that’s 420 × d.', 'Then add the one-off 1800.'] }),
  'w-fixed': { type: 'choice', ideas: ['write-eq', 'context-mb'], level: 'beginner', prompt: 'In C = 420d + 1800, which part is the fixed production expense?',
    options: [opt('a', '1800: paid once, before any filming', true), opt('b', '420: paid once', false, 'slope-as-start', '420 is added for every shoot day.'), opt('c', 'd: the number of days', false, 'm-b-swap', 'd is the input: how many days.'), opt('e', 'C: the total', false, 'm-b-swap', 'C is the total cost, the output.')],
    hints: ['Fixed means it doesn’t change with d.', 'Which number isn’t multiplied by d?', 'The constant term.'], solution: '1800 is fixed; 420d grows with the number of shoot days; C is the total.' },
  'w-sp-b': num(1800, { ideas: ['write-eq'], level: 'intermediate', label: 'b', unit: '$', prompt: 'The daily cost is $420, and after 3 shoot days the total is $3,060. Complete the step: 3060 = 420(3) + b. What is b?',
    traps: [{ value: 3060 - 420, code: 'two-point-sub', message: 'Multiply first: 420(3) = 1260, then 3060 − 1260.' }, { value: 3060 + 1260, code: 'sign', message: 'Subtract 1260 from both sides, don’t add.' }, { value: 1260, code: 'two-point-sub', message: '1260 is 420(3). b is what’s left of 3060.' }],
    hints: ['Work out 420(3) first.', '420 × 3 = 1260.', '3060 = 1260 + b, so b = 3060 − 1260.'], solution: '3060 = 1260 + b, so b = 1800.' }),
  'w-sp-eq': expr('C', 420, 1800, 'd', { level: 'intermediate', prompt: 'So write the equation.', hints: ['m = 420.', 'b = 1800.', 'C = md + b.'] }),
  'w-2p-m': num(420, { ideas: ['write-eq'], level: 'intermediate', label: 'm', unit: '$ per day', prompt: 'Two checkpoints: 1 day costs $2,220 and 5 days cost $3,900. Find the slope m = (3900 − 2220) ÷ (5 − 1).',
    traps: [{ value: V('4/1680'), code: 'reciprocal', message: 'That’s run ÷ rise. Slope = change in cost ÷ change in days.' }, { value: 1680, code: 'two-point-sub', message: 'Divide the cost change by the change in days, 4.' }, { value: V('(3900 - 2220)/5'), code: 'two-point-sub', message: 'The change in days is 5 − 1 = 4.' }],
    hints: ['Slope = change in C ÷ change in d.', '3900 − 2220 = 1680; 5 − 1 = 4.', '1680 ÷ 4.'], solution: '1680 ÷ 4 = 420 dollars per day.' }),
  'w-2p-b': num(1800, { ideas: ['write-eq'], level: 'intermediate', label: 'b', unit: '$', prompt: 'Substitute the point (1, 2220): 2220 = 420(1) + b. What is b?', traps: [{ value: 2640, code: 'sign', message: 'Subtract 420 from 2220.' }],
    hints: ['420(1) = 420.', '2220 = 420 + b.', '2220 − 420.'], solution: 'b = 2220 − 420 = 1800. (The other point gives the same: 3900 − 420(5) = 1800.)' }),
  'w-2p-eq': expr('C', 420, 1800, 'd', { level: 'intermediate', prompt: 'Write the equation through (1, 2220) and (5, 3900).' }),
  'w-tab-start': num(1800, { ideas: ['write-eq'], level: 'beginner', label: 'Starting cost', unit: '$', prompt: 'From the table: what is the starting cost?', fig: { kind: 'table', rows: BUDGET_TABLE, headers: ['Shoot days d', 'Cost C ($)'] }, traps: [{ value: 2220, code: 'slope-as-start', message: 'That’s after one day. Start at d = 0.' }],
    hints: ['The start is d = 0.', 'Read the first row.', 'C when d = 0.'], solution: '$1,800 at d = 0.' }),
  'w-tab-rate': num(420, { ideas: ['write-eq'], level: 'beginner', label: 'Increase', unit: '$ per day', prompt: 'How much does the cost go up each day?', traps: [{ value: 1800, code: 'm-b-swap', message: 'That’s the starting cost.' }],
    hints: ['Compare neighbouring rows.', '2220 − 1800.', 'Check another pair.'], solution: '+$420 every day.' }),
  'w-tab-eq': expr('C', 420, 1800, 'd', { level: 'beginner', prompt: 'Write the table’s equation.' }),
  'w-graph-eq': expr('C', 420, 1800, 'd', { level: 'intermediate', prompt: 'The production-cost graph passes through the marked points. Write its equation.', fig: { kind: 'grid', grid: BUDGET_GRID, points: [{ x: 0, y: 1800, label: '(0, 1800)' }, { x: 4, y: 3480, label: '(4, 3480)' }], line: [[0, 1800], [8, 5160]] },
    hints: ['Read the y-intercept.', 'Slope: (3480 − 1800) ÷ (4 − 0).', '1680 ÷ 4 = 420.'] }),
  'w-ch-camera': expr('R', 95, 350, 'd', { level: 'intermediate', prompt: 'A camera package costs $350 to reserve, plus $95 for each filming day. Write R, the rental cost, for d days.' }),
  'w-ch-travel': expr('T', 140, 600, 'n', { level: 'intermediate', prompt: 'Travel costs $600, plus $140 lodging for each night n. Write the total T.' }),
  'w-ch-edit': expr('E', 65, 250, 'h', { level: 'advanced', prompt: 'An editor charges a $250 retainer plus $65 per editing hour h. Write the editing cost E.' }),
  'w-ch-location': expr('L', 310, 900, 'd', { level: 'advanced', prompt: 'Preparing the location costs $900, then $310 for every production day d. Write L.' })
};
export const TWO_POINT_PRACTICE = [[[2, 1340], [6, 2380]], [[1, 610], [4, 1120]], [[3, 900], [8, 1650]], [[0, 75], [5, 425]], [[2, 1880], [5, 3350]], [[4, 1500], [10, 2700]]];
export const TWO_POINT_IDS = ['wx-m', 'wx-eq'];
export function twoPointPractice(n) {
  const [[x1, y1], [x2, y2]] = pick(TWO_POINT_PRACTICE, n), m = new Frac(y2 - y1, x2 - x1), b = Frac.of(y1).sub(m.mul(x1));
  return tidy({ brief: `Budget checkpoints ${n + 1}: day ${x1} cost ${money(y1)}, day ${x2} cost ${money(y2)}.`,
    'wx-m': num(Number(m), { ideas: ['write-eq'], level: 'intermediate', label: 'm', unit: '$ per day', prompt: 'Find the daily cost (the slope).', traps: [{ value: Number(new Frac(x2 - x1, y2 - y1)), code: 'reciprocal', message: 'Cost change on top, day change underneath.' }],
      hints: ['m = ΔC ÷ Δd.', `${y2} − ${y1} over ${x2} − ${x1}.`, 'Divide.'], solution: `(${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${S(m)}.` }),
    'wx-eq': expr('C', m, b, 'd', { level: 'advanced', prompt: 'Write the equation.', hints: ['Use the slope you found.', `Substitute (${x1}, ${y1}) to find b.`, `b = ${y1} − ${S(m)}(${x1}).`] }) });
}

// ================================================================ Stage 02: Understand the Budget
const mean = (prompt, right, wrongs, o = {}) => ({ type: 'choice', ideas: o.ideas || ['context-mb'], level: o.level || 'intermediate', prompt, options: [opt('a', right, true), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))],
  hints: o.hints || ['m multiplies the input; b is the value when the input is 0.', 'What are the units of each?', 'Read it as a sentence about the situation.'], solution: o.solution || right + '.' });
const M2 = {
  'si-m': num(420, { ideas: ['slope-int'], level: 'beginner', label: 'm', prompt: 'In C = 420d + 1800 (slope-intercept form y = mx + b), what is the slope?', traps: [{ value: 1800, code: 'm-b-swap', message: '1800 is b, the y-intercept. The slope multiplies d.' }],
    hints: ['y = mx + b.', 'm is the number in front of the input.', 'The number multiplying d.'], solution: 'm = 420.' }),
  'si-m-mean': mean('What does the slope 420 mean for the production?', 'Each additional shoot day adds $420 to the cost', [['The film starts at $420', 'slope-as-start', 'The starting cost is b, 1800.'], ['Filming lasts 420 days', 'swap-xy', '420 is dollars per day.'], ['The total is $420', 'm-b-swap', 'C is the total; 420 is the rate.']]),
  'si-b': num(1800, { ideas: ['slope-int'], level: 'beginner', label: 'b', prompt: 'And the y-intercept?', traps: [{ value: 420, code: 'm-b-swap', message: '420 is the slope. The intercept is the constant.' }],
    hints: ['b is the constant.', 'It’s C when d = 0.', 'C = 420(0) + 1800.'], solution: 'b = 1800: the point (0, 1800).' }),
  'si-b-mean': mean('What does the intercept 1800 mean?', 'Before any filming (d = 0), the project has already cost $1,800', [['Each day costs $1,800', 'slope-as-start', 'That would be the slope.'], ['The film is 1800 seconds long', 'swap-xy', 'It’s in dollars.'], ['The cost after 1 day', 'slope-as-start', 'After 1 day it’s 2220.']]),
  'si-faster': { type: 'choice', ideas: ['slope-int'], level: 'intermediate', prompt: 'Two production models: C = 500d + 2000 and C = 300d + 2000. Which becomes more expensive more quickly?',
    options: [opt('a', 'C = 500d + 2000: the greater slope', true), opt('b', 'C = 300d + 2000', false, 'm-b-swap', 'It adds only 300 a day.'), opt('c', 'They grow equally: same intercept', false, 'm-b-swap', 'Same start, but different daily rates.'), opt('d', 'You can’t tell without a graph', false, 'graph-needed', 'The slope tells you directly.')],
    hints: ['Which number is the daily rate?', 'Compare the slopes.', '500 vs 300.'], solution: '500d + 2000 rises $500 a day vs $300: steeper, so more expensive more quickly.' },
  'si-same': { type: 'choice', ideas: ['slope-int', 'context-mb'], level: 'intermediate', prompt: 'C = 420d + 1800 and C = 420d + 2500. How are they related?',
    options: [opt('a', 'Same slope (parallel lines), different starting costs', true), opt('b', 'Different slopes, same start', false, 'm-b-swap', 'Both have 420 in front of d.'), opt('c', 'They’re the same line', false, 'intercept', 'The intercepts differ: 1800 vs 2500.'), opt('d', 'They cross at day 7', false, 'parallel-cross', 'Parallel lines never cross.')],
    hints: ['Compare the m values.', 'Compare the b values.', 'Same m: parallel.'], solution: 'Same slope, so parallel; the second always costs $700 more.' },
  'si-rewrite': expr('C', 420, 1800, 'd', { ideas: ['rearrange'], level: 'intermediate', prompt: 'Rewrite 2C − 840d = 3600 in slope-intercept form.',
    traps: [{ expr: '840d + 3600', code: 'distribute-error', message: 'You added 840d; now divide every term by 2.' }, { expr: '420d + 3600', code: 'distribute-error', message: 'Divide every term by 2, including 3600.' }],
    hints: ['Get 2C alone: add 840d to both sides.', '2C = 840d + 3600.', 'Divide every term by 2.'], solution: '2C = 840d + 3600, so C = 420d + 1800.' }),
  'si-rewrite-2': expr('S', -40, 600, 'h', { ideas: ['rearrange'], level: 'intermediate', prompt: 'Rewrite S + 40h = 600 in slope-intercept form.', traps: [{ expr: '40h + 600', code: 'sign', message: 'Subtract 40h from both sides: the slope is negative.' }], hints: ['Get S alone.', 'Subtract 40h from both sides.', 'S = −40h + 600.'], solution: 'S = −40h + 600.' }),
  'si-rewrite-3': expr('E', 90, 120, 'h', { ideas: ['rearrange'], level: 'advanced', prompt: 'Rewrite 3E − 270h = 360 in slope-intercept form.', traps: [{ expr: '270h + 360', code: 'distribute-error', message: 'Divide every term by 3.' }], hints: ['Add 270h.', '3E = 270h + 360.', 'Divide by 3.'], solution: 'E = 90h + 120.' }),
  'pc-runtime-m': mean('R = 8c + 45 gives a trailer’s runtime R (seconds) with c clips. What does 8 mean?', 'Each clip adds 8 seconds of runtime', [['The trailer has 8 clips', 'swap-xy', 'c is the number of clips.'], ['The intro lasts 8 seconds', 'slope-as-start', 'The fixed part is 45.'], ['The trailer is 8 minutes long', 'arithmetic', 'Units: seconds per clip.']], { level: 'advanced' }),
  'pc-runtime-b': mean('And what does 45 mean?', 'A 45-second fixed part (titles and intro) before any clips', [['45 clips', 'swap-xy', '45 is seconds, not clips.'], ['45 seconds per clip', 'm-b-swap', 'That would be the slope.'], ['The total runtime', 'm-b-swap', 'R is the total.']], { level: 'advanced' }),
  'pc-storage-m': mean('S = −40h + 600. What does the slope −40 mean?', 'Free storage drops 40 GB for every hour of recording', [['40 GB is used in total', 'slope-as-start', 'It’s per hour.'], ['Storage grows 40 GB per hour', 'sign', 'The negative sign means it decreases.'], ['The card holds 40 GB', 'm-b-swap', 'The card starts with 600 GB free.']], { level: 'advanced' }),
  'pc-remain-b': mean('B = 5000 − 420d gives the budget remaining after d days. What does 5000 mean?', 'The approved budget before any shoot days', [['The cost per day', 'slope-as-start', 'The daily amount is 420.'], ['The money left after the shoot', 'swap-xy', 'That depends on d.'], ['The number of days allowed', 'swap-xy', 'It’s in dollars.']], { level: 'advanced' })
};
export const SI_PRACTICE = [['4C - 1200d = 2000', 'C', 'd'], ['S + 25h = 500', 'S', 'h'], ['2R = 16c + 90', 'R', 'c'], ['5E - 300h = 750', 'E', 'h'], ['F - 30 = 12t', 'F', 't'], ['3B + 600d = 9000', 'B', 'd']].map(([eq, y, x]) => ({ eq, y, x, ...lineOf(eq, x.toLowerCase(), y.toLowerCase()) }));
export const SI_PRACTICE_IDS = ['sx-mb', 'sx-eq'];
export function siPractice(n) {
  const X = pick(SI_PRACTICE, n);
  return tidy({ brief: `Budget memo ${n + 1}: ${X.eq.replace(/-/g, '−')}.`,
    'sx-eq': expr(X.y, X.m, X.b, X.x, { ideas: ['rearrange'], level: 'advanced', prompt: `Rewrite ${X.eq.replace(/-/g, '−')} in slope-intercept form.`, hints: [`Get ${X.y} alone on one side.`, 'Move the other term, then divide by any coefficient.', `${X.y} = m${X.x} + b.`] }),
    'sx-mb': { type: 'fields', ideas: ['slope-int'], level: 'intermediate', prompt: 'What are its slope and y-intercept?', fields: [{ id: 'm', label: 'm', answer: Number(X.m), traps: [{ value: Number(X.b), code: 'm-b-swap', message: 'That’s the intercept.' }] }, { id: 'b', label: 'b', answer: Number(X.b), traps: [{ value: Number(X.m), code: 'm-b-swap', message: 'That’s the slope.' }] }],
      hints: ['Rewrite first.', 'm multiplies the input.', 'b is the constant.'], solution: `m = ${S(X.m)}, b = ${S(X.b)}.` } });
}

// ================================================================ Stage 03: Calculate Mid-Project Costs
const M3 = {
  'ps-eq': ps('C', 'd', 420, 3, 3060, { level: 'beginner', prompt: 'Checkpoint: day 3, total $3,060, and each extra day costs $420. Write the point-slope equation.' }),
  'ps-step': num(1260, { ideas: ['convert'], level: 'beginner', label: '?', prompt: 'Distribute: 420(d − 3) = 420d − ?', traps: [{ value: 3, code: 'distribute-error', message: 'Multiply 420 by the 3 as well.' }, { value: 423, code: 'distribute-error', message: 'Multiply, don’t add.' }],
    hints: ['Multiply 420 by each term in the brackets.', '420 × d and 420 × 3.', '420 × 3.'], solution: '420(d − 3) = 420d − 1260.' }),
  'ps-si': expr('C', 420, 1800, 'd', { ideas: ['convert'], level: 'intermediate', prompt: 'Now finish converting C − 3060 = 420d − 1260 to slope-intercept form.', traps: [{ expr: '420d - 4320', code: 'sign', message: 'Add 3060 to both sides: −1260 + 3060.' }],
    hints: ['Get C alone.', 'Add 3060 to both sides.', '−1260 + 3060 = 1800.'], solution: 'C = 420d + 1800: the same line as before.' }),
  'ps-choose-a': { type: 'choice', ideas: ['point-slope', 'convert'], level: 'intermediate', prompt: 'Situation A: “The cost rises $420 a day, starting from $1,800.” Which form says this most directly?',
    options: [opt('a', 'Slope-intercept: C = 420d + 1800', true), opt('b', 'Point-slope: C − 3060 = 420(d − 3)', false, 'form-choice', 'You were given the starting value, not a checkpoint.'), opt('c', 'Neither works', false, 'form-choice', 'Both describe the same line; one fits the information better.')],
    hints: ['What were you given?', 'A rate and a start (d = 0).', 'Start = intercept.'], solution: 'Given the rate and the starting value: slope-intercept form, C = 420d + 1800.' },
  'ps-choose-b': { type: 'choice', ideas: ['point-slope', 'convert'], level: 'intermediate', prompt: 'Situation B: “At day 3 the total is $3,060, and each extra day costs $420.” Which form says this most directly?',
    options: [opt('a', 'Point-slope: C − 3060 = 420(d − 3)', true), opt('b', 'Slope-intercept: C = 420d + 1800', false, 'form-choice', 'That needs the start, which you weren’t given directly.'), opt('c', 'C = 3060d + 420', false, 'm-b-swap', 'That mixes up the point and the slope.')],
    hints: ['What were you given?', 'A checkpoint and a rate.', 'Point + slope.'], solution: 'A known point and a rate: point-slope form.' },
  'ps-e': ps('E', 'h', 150, 4, 1200, { level: 'intermediate', prompt: 'An editing project has cost $1,200 after 4 hours; each hour costs $150. Write the point-slope equation.' }),
  'ps-e-si': expr('E', 150, 600, 'h', { ideas: ['convert'], level: 'intermediate', prompt: 'Convert it to slope-intercept form.', traps: [{ expr: '150h + 1200', code: 'distribute-error', message: 'Distribute 150(h − 4) = 150h − 600, then add 1200.' }],
    hints: ['Distribute: 150h − 600.', 'Add 1200 to both sides.', '−600 + 1200.'], solution: 'E − 1200 = 150h − 600, so E = 150h + 600.' }),
  'ps-s': ps('S', 'h', -40, 5, 400, { level: 'advanced', prompt: 'A card has 400 GB free after 5 hours of filming, and free space drops 40 GB per hour. Write the point-slope equation.' }),
  'ps-s-si': expr('S', -40, 600, 'h', { ideas: ['convert'], level: 'advanced', prompt: 'Convert it to slope-intercept form.', traps: [{ expr: '-40h + 200', code: 'distribute-error', message: '−40(h − 5) = −40h + 200; then add 400.' }],
    hints: ['−40 × −5 = +200.', 'S − 400 = −40h + 200.', 'Add 400.'], solution: 'S = −40h + 600.' }),
  'ps-m': ps('M', 'h', 15, 0, 60, { level: 'intermediate', prompt: 'A simplified planning model: 60 production minutes are already done, and each editor-hour adds 15. Use the point (0, 60) to write the point-slope equation.' }),
  'ps-m-si': expr('M', 15, 60, 'h', { ideas: ['convert'], level: 'beginner', prompt: 'Convert it to slope-intercept form.', hints: ['15(h − 0) = 15h.', 'Add 60.', 'M = 15h + 60.'], solution: 'M = 15h + 60: when the point is at h = 0, both forms show the intercept.' }),
  'ps-meaning': { type: 'choice', ideas: ['point-slope'], level: 'advanced', prompt: 'In C − 3060 = 420(d − 3), what do 3060 and 3 represent?',
    options: [opt('a', 'The checkpoint (3, 3060): 3 shoot days, $3,060', true), opt('b', 'The slope and the intercept', false, 'm-b-swap', 'The slope is 420; the intercept isn’t shown in this form.'), opt('c', '3060 per day for 3 days', false, 'slope-as-start', '420 is the per-day amount.'), opt('d', 'A point at (3060, 3)', false, 'swap-xy', 'd goes with 3, C with 3060.')],
    hints: ['y − y₁ = m(x − x₁).', 'x₁ = 3, y₁ = 3060.', 'That’s a point.'], solution: 'They’re the known point (3, 3060).' }
};
export const PS_PRACTICE = [[250, 2, 1300, 'C', 'd'], [-30, 4, 380, 'S', 'h'], [75, 6, 950, 'E', 'h'], [120, 1, 520, 'T', 'n'], [-25, 8, 300, 'B', 'd'], [60, 3, 330, 'R', 'c']];
export const PS_PRACTICE_IDS = ['px-ps', 'px-si'];
export function psPractice(n) {
  const [m, x1, y1, y, x] = pick(PS_PRACTICE, n), b = Frac.of(y1).sub(Frac.of(m).mul(x1));
  return tidy({ brief: `Checkpoint ${n + 1}: (${x1}, ${y1}), slope ${S(m)}.`,
    'px-ps': ps(y, x, m, x1, y1, { level: 'advanced', prompt: `Write the point-slope equation through (${x1}, ${y1}) with slope ${S(m)} (use ${y} and ${x}).` }),
    'px-si': expr(y, m, b, x, { ideas: ['convert'], level: 'advanced', prompt: 'Convert it to slope-intercept form.', hints: ['Distribute.', 'Move the constant across.', `b = ${y1} − (${S(m)})(${x1}).`] }) });
}

// ================================================================ Stage 04: Build the Production Graph
const lp = (line, grid, o) => ({ type: 'lineplot', line, grid, ideas: o.ideas || ['hv-lines', 'graph'], level: o.level || 'intermediate', prompt: o.prompt, hints: o.hints, solution: o.solution });
const M4 = {
  'gr-plot': { type: 'plot', ideas: ['graph'], level: 'beginner', prompt: 'Graph C = 420d + 1800: start at the intercept (0, 1800), then right 1 day and up $420 each time, to day 4.', grid: BUDGET_GRID, connect: true,
    targets: [0, 1, 2, 3, 4].map(d => ({ x: d, y: C(d), name: `(${d}, ${C(d)})` })), hints: ['Start on the y-axis at 1800.', 'Slope 420 = 420/1: right 1, up 420.', '(1, 2220), (2, 2640)…'], solution: '(0, 1800), (1, 2220), (2, 2640), (3, 3060), (4, 3480).' },
  'gr-meaning': { type: 'choice', ideas: ['graph'], level: 'intermediate', prompt: 'On the budget graph, what does the point (3, 3060) mean?',
    options: [opt('a', 'After 3 shoot days the modeled cost is $3,060', true), opt('b', 'It costs $3 per day after 3060 days', false, 'swap-xy', 'd is first, C second.'), opt('c', 'Day 3 costs $3,060 by itself', false, 'slope-as-start', 'It’s the total so far; each day adds 420.'), opt('d', 'The slope is 3060', false, 'm-b-swap', 'The slope is 420.')],
    hints: ['(d, C).', 'd = 3.', 'C = 3060 total.'], solution: 'After three shoot days, the total modeled cost is $3,060.' },
  'gr-s-yint': num(600, { ideas: ['intercepts'], level: 'beginner', label: 'S', unit: 'GB', prompt: 'S = 600 − 40h. What is the y-intercept (S when h = 0)?', traps: [{ value: 15, code: 'intercept-swap', message: '15 is the h-intercept. At h = 0, S = 600.' }],
    hints: ['Set h = 0.', '600 − 40(0).', '600.'], solution: '(0, 600): 600 GB free before recording.' }),
  'gr-s-xint': num(15, { ideas: ['intercepts'], level: 'intermediate', label: 'h', unit: 'hours', prompt: 'And the x-intercept (h when S = 0)?', traps: [{ value: 600, code: 'intercept-swap', message: 'That’s the y-intercept. Set S = 0 and solve.' }, { value: -15, code: 'sign', message: '600 − 40h = 0 gives h = +15.' }, { value: 560, code: 'arithmetic', message: 'Solve 600 − 40h = 0.' }],
    hints: ['Set S = 0.', '600 − 40h = 0.', '40h = 600.'], solution: '600 − 40h = 0 → h = 15: (15, 0).' }),
  'gr-s-plot': { type: 'plot', ideas: ['graph', 'intercepts'], level: 'intermediate', prompt: 'Plot both intercepts of S = 600 − 40h; the line joins them.', grid: { x: [0, 16], y: [0, 640], sx: 1, sy: 40, profile: true, rect: true, xLabel: 'Hours h', yLabel: 'Free storage S (GB)', map: false }, connect: true,
    targets: [{ x: 0, y: 600, name: '(0, 600)' }, { x: 15, y: 0, name: '(15, 0)' }], hints: ['y-intercept on the S-axis.', 'x-intercept on the h-axis.', '(0, 600) and (15, 0).'], solution: '(0, 600) and (15, 0).' },
  'gr-s-mean': { type: 'choice', ideas: ['intercepts'], level: 'intermediate', prompt: 'What does (15, 0) mean for the crew?',
    options: [opt('a', 'After 15 hours of recording at this rate, the free storage reaches zero', true), opt('b', 'The card holds 15 GB', false, 'intercept-swap', 'It starts with 600 GB free.'), opt('c', 'They record 15 GB an hour', false, 'm-b-swap', 'The rate is 40 GB an hour.'), opt('d', 'Filming starts at hour 15', false, 'swap-xy', 'At hour 15 it ends.')],
    hints: ['At the x-intercept, S = 0.', 'h = 15.', 'No space left.'], solution: 'At 15 hours the modeled free storage is 0 (a simplified model).' },
  'gr-std-x': num(300, { ideas: ['intercepts'], level: 'intermediate', label: 'h', prompt: 'A different fictional model: 2h + S = 600. Find the h-intercept (set S = 0).', traps: [{ value: 600, code: 'intercept-swap', message: 'That’s the S-intercept.' }, { value: 1200, code: 'arithmetic', message: '2h = 600: divide by 2.' }],
    hints: ['Set S = 0.', '2h = 600.', 'Divide by 2.'], solution: '2h = 600 → h = 300: the point (300, 0). (This is the correct intercept.)' }),
  'gr-std-y': num(600, { ideas: ['intercepts'], level: 'intermediate', label: 'S', prompt: 'And the S-intercept (set h = 0)?', traps: [{ value: 300, code: 'intercept-swap', message: 'That’s the h-intercept.' }], hints: ['Set h = 0.', 'S = 600.', '(0, 600).'], solution: '(0, 600).' }),
  'gr-std2': { type: 'plot', ideas: ['graph', 'intercepts'], level: 'advanced', prompt: 'Graph 3x + 4y = 24 from its intercepts: plot both, and the line joins them.', grid: { x: [0, 10], y: [0, 8], sx: 1, sy: 1, profile: true, xLabel: 'x', yLabel: 'y', map: false }, connect: true,
    targets: [{ x: 8, y: 0, name: '(8, 0)' }, { x: 0, y: 6, name: '(0, 6)' }], hints: ['x-intercept: set y = 0.', '3x = 24 → x = 8.', 'y-intercept: 4y = 24 → y = 6.'], solution: '(8, 0) and (0, 6).' },
  'gr-h-m': num(0, { ideas: ['hv-lines'], level: 'beginner', label: 'Slope', prompt: 'A fixed equipment package: y = 700 credits whatever the number of hours. What is the slope?', traps: [{ value: 700, code: 'm-b-swap', message: '700 is the y-intercept. The output never changes, so the slope is 0.' }],
    hints: ['Does y change when x changes?', 'No change in y.', '0 ÷ anything.'], solution: 'Slope 0: a horizontal line.' }),
  'gr-h-plot': lp({ m: 0, b: 700 }, { x: [0, 8], y: [0, 1000], sx: 1, sy: 100, profile: true, rect: true, xLabel: 'Hours', yLabel: 'Credits', map: false }, { level: 'beginner', prompt: 'Graph y = 700: place two points on the line.', hints: ['Every point has y = 700.', 'Choose any two hours.', 'For example (2, 700) and (6, 700).'], solution: 'Any two points with y = 700: a horizontal line.' }),
  'gr-v-slope': { type: 'choice', ideas: ['hv-lines'], level: 'intermediate', prompt: 'The schedule marks x = 4 (day 4) as the equipment handover. What is the slope of x = 4?',
    options: [opt('a', 'Undefined: the line is vertical', true), opt('b', '0', false, 'vertical-function', 'Zero slope is horizontal. Here x stays fixed.'), opt('c', '4', false, 'm-b-swap', 'x = 4 is where the line is, not its slope.'), opt('d', '1/4', false, 'reciprocal', 'Every point has the same x: the run is 0.')],
    hints: ['Every point has x = 4.', 'The run between any two points is 0.', 'Division by 0.'], solution: 'Undefined: x = 4 is vertical.' },
  'gr-v-plot': lp({ vertical: 4 }, { x: [0, 8], y: [0, 8], map: false }, { level: 'intermediate', prompt: 'Graph x = 4: place two points on the line.', hints: ['Every point has x = 4.', 'Choose any two y-values.', '(4, 1) and (4, 6), for example.'], solution: 'Any two points with x = 4: a vertical line.' }),
  'gr-v-func': { type: 'choice', ideas: ['hv-lines', 'is-function'], level: 'advanced', prompt: 'Is x = 4 a function of x (y as a function of x)?',
    options: [opt('a', 'No: one x-value has many y-values', true), opt('b', 'Yes: it’s a straight line', false, 'vertical-function', 'Straight isn’t enough; a vertical line fails the vertical-line test.'), opt('c', 'Yes: its slope is 0', false, 'vertical-function', 'Its slope is undefined.')],
    hints: ['A function gives one output per input.', 'At x = 4, how many y-values?', 'Infinitely many.'], solution: 'Not a function: x = 4 pairs with every y. It’s a schedule marker, not a cost function.' },
  'gr-c-m': num(-150, { ideas: ['graph', 'slope-int'], level: 'advanced', label: 'Slope', prompt: 'This graph shows remaining location-hire credits against days: it passes through (0, 900) and (6, 0). What is its slope?', fig: { kind: 'grid', grid: { x: [0, 7], y: [0, 1000], sx: 1, sy: 100, profile: true, rect: true, xLabel: 'Days', yLabel: 'Credits left', map: false }, points: [{ x: 0, y: 900, label: '(0, 900)' }, { x: 6, y: 0, label: '(6, 0)' }], line: [[0, 900], [6, 0]] },
    traps: [{ value: 150, code: 'slope-direction', message: 'The line falls from left to right: the slope is negative.' }, { value: V('-6/900'), code: 'reciprocal', message: 'Rise ÷ run: −900 ÷ 6.' }], hints: ['Rise ÷ run.', '(0 − 900) ÷ (6 − 0).', '−900 ÷ 6.'], solution: '−900 ÷ 6 = −150 credits per day.' }),
  'gr-c-trend': { type: 'choice', inline: true, keepOrder: true, ideas: ['graph'], level: 'intermediate', prompt: 'Is that line increasing, decreasing or constant?',
    options: [opt('inc', 'Increasing', false, 'slope-direction', 'It falls from left to right.'), opt('dec', 'Decreasing', true), opt('con', 'Constant', false, 'slope-direction', 'Its slope isn’t 0.')], hints: ['Read left to right.', 'Does it go up or down?', 'Negative slope.'], solution: 'Decreasing: the credits run down by 150 a day.' },
  'gr-c-xint': num(6, { ideas: ['intercepts'], level: 'intermediate', label: 'Days', prompt: 'What is its x-intercept, and so when do the credits run out?', traps: [{ value: 900, code: 'intercept-swap', message: 'That’s the y-intercept.' }], hints: ['Where does it meet the x-axis?', 'Credits = 0.', '(6, 0).'], solution: 'Day 6: the credits reach 0.' })
};

// ================================================================ Stage 05: Manage the Production Limits
const iv = (answer, o) => ({ type: 'interval', ...o, answer });
const M5 = {
  'dr-domain': iv('[0, 8]', { ideas: ['domain', 'interval'], level: 'beginner', label: 'Domain', prompt: 'C(d) = 1800 + 420d, approved for at most 8 shoot days, with partial days prorated. What values of d make sense? (Interval like [a, b], or an inequality.)', hints: ['The fewest days is 0.', 'The most is 8.', 'Both are allowed: [0, 8].'], solution: '0 ≤ d ≤ 8, or [0, 8].' }),
  'dr-c8': num(C(8), { ideas: ['range', 'evaluate'], level: 'beginner', label: 'C(8)', unit: '$', prompt: 'What does the full eight-day shoot cost? C(8) = 1800 + 420(8).', traps: [{ value: 1800 * 420 * 8, code: 'fn-multiply', message: 'Substitute 8 for d: 1800 + 420 × 8.' }, { value: 1800 + 4208, code: 'arithmetic', message: '420 × 8 = 3360.' }], hints: ['420 × 8.', '= 3360.', '+ 1800.'], solution: 'C(8) = 1800 + 3360 = $5,160.' }),
  'dr-range': iv('[1800, 5160]', { ideas: ['range', 'interval'], level: 'intermediate', label: 'Range', prompt: 'So what is the range of possible costs?', hints: ['The smallest cost is at d = 0.', 'The largest is at d = 8.', '[C(0), C(8)].'], solution: '1800 ≤ C ≤ 5160, or [1800, 5160].' }),
  'dr-whole': { type: 'choice', ideas: ['domain'], level: 'intermediate', prompt: 'Now the producer only books whole shoot days. What is the domain?',
    options: [opt('a', '{0, 1, 2, 3, 4, 5, 6, 7, 8}', true), opt('b', '[0, 8]', false, 'discrete-continuous', 'That includes 2.5 days, which a whole-day schedule doesn’t allow.'), opt('c', 'All real numbers', false, 'all-reals', 'Negative or 100-day shoots don’t make sense here.'), opt('d', '{1, 2, 3, 4, 5, 6, 7, 8}', false, 'ignore-constraints', 'Zero days (before filming) is still a possible input.')],
    hints: ['Whole days only.', 'From 0 to 8.', 'A list of values, not an interval.'], solution: 'A discrete domain: {0, 1, …, 8}. Real-world domains depend on the situation.' },
  'dr-whole-range': { type: 'choice', ideas: ['range'], level: 'advanced', prompt: 'And its range?',
    options: [opt('a', '{1800, 2220, 2640, 3060, 3480, 3900, 4320, 4740, 5160}', true), opt('b', '[1800, 5160]', false, 'discrete-continuous', 'Only the costs of whole days are possible.'), opt('c', '{420, 840, …, 3360}', false, 'missing-intercept', 'Include the $1,800 fixed cost.'), opt('d', '{0, 1, …, 8}', false, 'swap-xy', 'That’s the domain.')],
    hints: ['Evaluate C at each whole day.', 'Start at C(0) = 1800.', 'Add 420 each time.'], solution: 'C(0) through C(8): 1800, 2220, …, 5160.' },
  'dr-s-domain': iv('[0, 15]', { ideas: ['domain', 'interval'], level: 'intermediate', label: 'Domain', prompt: 'S(h) = 600 − 40h. Recording stops when free storage reaches zero. What is the domain?', hints: ['Start at h = 0.', 'Stop when S = 0.', 'h = 15.'], solution: '0 ≤ h ≤ 15, or [0, 15].' }),
  'dr-s-range': iv('[0, 600]', { ideas: ['range', 'interval'], level: 'intermediate', label: 'Range', prompt: 'And the range of free storage?', hints: ['At h = 0, S = 600.', 'At h = 15, S = 0.', 'Smaller endpoint first.'], solution: '0 ≤ S ≤ 600, or [0, 600].' }),
  'dr-g-dom': iv('(1, 6]', { ideas: ['domain', 'interval'], level: 'advanced', label: 'Domain', prompt: 'This production graph has an open circle at (1, 2) and a closed circle at (6, 5). What is its domain?', fig: { kind: 'segment', a: [1, 2], b: [6, 5], aIn: false, bIn: true },
    hints: ['Read the x-values of the endpoints.', 'Open circle: not included.', 'From 1 (excluded) to 6 (included).'], solution: '1 < x ≤ 6, or (1, 6].' }),
  'dr-g-range': iv('(2, 5]', { ideas: ['range', 'interval'], level: 'advanced', label: 'Range', prompt: 'And its range?', hints: ['Read the y-values of the endpoints.', 'Open at 2, closed at 5.', '(2, 5].'], solution: '2 < y ≤ 5, or (2, 5].' }),
  'dr-dots': { type: 'choice', ideas: ['domain', 'range'], level: 'intermediate', prompt: 'Approved shots on each filming day are shown as separate points: (1, 6), (2, 9), (3, 6), (4, 12). What are the domain and range?', fig: { kind: 'dots', pts: [[1, 6], [2, 9], [3, 6], [4, 12]] },
    options: [opt('a', 'Domain {1, 2, 3, 4}; range {6, 9, 12}', true), opt('b', 'Domain [1, 4]; range [6, 12]', false, 'discrete-continuous', 'Separate points: list the values, don’t join them into intervals.'), opt('c', 'Domain {6, 9, 12}; range {1, 2, 3, 4}', false, 'swap-xy', 'Inputs (days) are the domain.'), opt('d', 'Domain {1, 2, 3, 4}; range {6, 9, 6, 12}', false, 'shared-output', 'List a repeated output once: 6 appears twice but is one value.')],
    hints: ['Domain: the inputs.', 'Range: the outputs, each listed once.', 'The days are separate, so use sets.'], solution: 'Domain {1, 2, 3, 4}; range {6, 9, 12}. Two days share 6 shots: fine for a function.' },
  'dr-share': { type: 'choice', ideas: ['range', 'is-function'], level: 'intermediate', prompt: 'Days 1 and 3 both have 6 approved shots. Does that stop it being a function?',
    options: [opt('a', 'No: different inputs may share an output', true), opt('b', 'Yes: each output needs its own input', false, 'shared-output', 'That rule is about inputs: each input needs exactly one output.'), opt('c', 'Yes: 6 appears twice', false, 'shared-output', 'Repeated outputs are fine.')],
    hints: ['A function: one output per input.', 'Does any day have two shot counts?', 'No.'], solution: 'Still a function. Each day has one shot count; two days just happen to match.' },
  'dr-table': { type: 'choice', ideas: ['domain', 'range'], level: 'intermediate', prompt: 'Clips and combined runtime: (1, 8), (2, 16), (3, 24), (4, 32), (5, 40). What is the domain?',
    options: [opt('a', '{1, 2, 3, 4, 5}', true), opt('b', '{8, 16, 24, 32, 40}', false, 'swap-xy', 'That’s the range.'), opt('c', '[1, 5]', false, 'discrete-continuous', 'You can’t have 2.5 clips: list the whole numbers.'), opt('d', 'All real numbers', false, 'all-reals', 'Only these clip counts are in the table.')],
    hints: ['Domain = the inputs.', 'The number of clips.', 'Listed values.'], solution: '{1, 2, 3, 4, 5}.' },
  'dr-all': { type: 'choice', ideas: ['domain'], level: 'advanced', prompt: 'The algebra of C(d) = 1800 + 420d works for any number d. Is the domain of the production model all real numbers?',
    options: [opt('a', 'No: the situation limits it, here 0 ≤ d ≤ 8', true), opt('b', 'Yes: any number can be substituted', false, 'ignore-constraints', 'Negative days or 50 days don’t fit this production.'), opt('c', 'Yes: domains are always all real numbers', false, 'all-reals', 'A model’s domain comes from the situation.')],
    hints: ['Can d be negative?', 'Can it be more than the approved 8?', 'The context decides.'], solution: 'No. The equation allows any d, but the production only allows 0 to 8 days.' }
};
export const DOMAIN_PRACTICE = [[250, 1500, 6], [380, 900, 10], [150, 2000, 12], [500, 1200, 5], [95, 350, 14], [210, 600, 9]];
export const DOMAIN_PRACTICE_IDS = ['dx-dom', 'dx-range'];
export function domainPractice(n) {
  const [rate, fixed, max] = pick(DOMAIN_PRACTICE, n), hi = fixed + rate * max;
  return { brief: `Production model ${n + 1}: C(d) = ${fixed} + ${rate}d, approved for up to ${max} days (partial days prorated).`,
    'dx-dom': iv(`[0, ${max}]`, { ideas: ['domain', 'interval'], level: 'advanced', label: 'Domain', prompt: 'What is the domain?', hints: ['From 0 days…', `…to ${max} days.`, 'Both included.'], solution: `[0, ${max}].` }),
    'dx-range': iv(`[${fixed}, ${hi}]`, { ideas: ['range', 'interval'], level: 'advanced', label: 'Range', prompt: 'And the range?', hints: ['C(0) is the smallest.', `C(${max}) is the largest.`, `${fixed} + ${rate} × ${max}.`], solution: `[${fixed}, ${hi}].` }) };
}

// ================================================================ Stage 06: Direct the Film
const M6 = {
  'fn-c3': num(C(3), { ideas: ['evaluate'], level: 'beginner', label: 'C(3)', unit: '$', prompt: 'C(d) = 1800 + 420d. Evaluate C(3).', traps: [{ value: 1800 * 420 * 3, code: 'fn-multiply', message: 'C(3) means “C when d = 3”, not C × 3.' }, { value: 3 * (1800 + 420), code: 'fn-multiply', message: 'Substitute 3 for d: 1800 + 420(3).' }],
    hints: ['Replace d with 3.', '1800 + 420(3).', '1800 + 1260.'], solution: 'C(3) = 1800 + 420(3) = 3060: after three days, $3,060.' }),
  'fn-evals': { type: 'fields', ideas: ['evaluate'], level: 'beginner', prompt: 'Evaluate C(0), C(2), C(5) and C(8).', fields: [0, 2, 5, 8].map(d => ({ id: 'c' + d, label: `C(${d})`, unit: '$', answer: C(d) })),
    hints: ['Substitute each input for d.', 'C(0) is the fixed cost.', 'Each extra day adds 420.'], solution: 'C(0) = 1800, C(2) = 2640, C(5) = 3900, C(8) = 5160.' },
  'fn-mult': { type: 'choice', ideas: ['evaluate', 'fn-context'], level: 'intermediate', prompt: 'A crew member reads C(3) as “C times 3”. What does C(3) actually mean?',
    options: [opt('a', 'The output of C when the input d is 3', true), opt('b', 'C multiplied by 3', false, 'fn-multiply', 'The brackets hold the input; they don’t mean multiply.'), opt('c', 'The cost of 3 dollars', false, 'swap-xy', '3 is the number of days.'), opt('d', 'Day 3’s cost alone', false, 'slope-as-start', 'It’s the total after 3 days.')],
    hints: ['f(x) is read “f of x”.', 'The input goes in the brackets.', 'C(3): C of 3.'], solution: 'C(3) is the value of C at d = 3: the total cost after three days.' },
  'fn-s5': num(Sf(5), { ideas: ['evaluate'], level: 'intermediate', label: 'S(5)', unit: 'GB', prompt: 'S(h) = 600 − 40h. Evaluate S(5).', traps: [{ value: 600 + 200, code: 'sign', message: 'Subtract: 600 − 40(5).' }, { value: (600 - 40) * 5, code: 'fn-multiply', message: 'Substitute h = 5: 600 − 40 × 5.' }], hints: ['Replace h with 5.', '40 × 5 = 200.', '600 − 200.'], solution: 'S(5) = 400 GB free after 5 hours.' }),
  'fn-e5': num(Ef(5), { ideas: ['evaluate'], level: 'intermediate', label: 'E(5)', unit: 'credits', prompt: 'E(h) = 120 + 90h gives the modeled editing cost. Evaluate E(5).', traps: [{ value: (120 + 90) * 5, code: 'fn-multiply', message: 'Multiply only the 90 by 5.' }], hints: ['Replace h with 5.', '90 × 5 = 450.', '120 + 450.'], solution: 'E(5) = 570 credits.' }),
  'fn-inout': { type: 'choice', ideas: ['fn-context'], level: 'intermediate', prompt: 'For E(h) = 120 + 90h, what are the input and the output?',
    options: [opt('a', 'Input: editor-hours h. Output: editing cost E', true), opt('b', 'Input: cost. Output: hours', false, 'swap-xy', 'The function takes hours and returns cost.'), opt('c', 'Input: 120. Output: 90', false, 'm-b-swap', 'Those are the rule’s numbers.'), opt('d', 'Input and output are both h', false, 'swap-xy', 'E(h) is the output.')],
    hints: ['The letter in the brackets is the input.', 'h: hours.', 'E(h): the cost.'], solution: 'Input: hours; output: cost.' },
  'fn-a': { type: 'choice', inline: true, keepOrder: true, ideas: ['is-function'], level: 'beginner', prompt: 'Shoot day → total production cost. Function?', options: [opt('y', 'Function', true), opt('n', 'Not a function', false, 'every-relation', 'Each number of days has exactly one total cost.')], hints: ['One output per input?', 'Each d gives one C.', 'Yes.'], solution: 'A function: each number of shoot days has one modeled cost.' },
  'fn-b': { type: 'choice', inline: true, keepOrder: true, ideas: ['is-function'], level: 'beginner', prompt: 'Unique clip ID → clip duration. Function?', options: [opt('y', 'Function', true), opt('n', 'Not a function', false, 'every-relation', 'Each clip ID has one duration.')], hints: ['One output per input?', 'One clip, one duration.', 'Yes.'], solution: 'A function: each clip has one duration.' },
  'fn-c': { type: 'choice', inline: true, keepOrder: true, ideas: ['is-function'], level: 'intermediate', prompt: 'Shoot day → duration of each clip recorded that day: (1, 12), (1, 18), (1, 24), (2, 15). Function?', options: [opt('y', 'Function', false, 'every-relation', 'Day 1 has three different durations.'), opt('n', 'Not a function', true)],
    hints: ['Look at the inputs.', 'Day 1 appears three times…', '…with different outputs.'], solution: 'Not a function: the input 1 has three different outputs.' },
  'fn-vlt': { type: 'multi', inline: true, keepOrder: true, ideas: ['is-function'], level: 'advanced', prompt: 'Use the vertical line test. Which graphs are functions?', fig: { kind: 'relations' },
    options: [opt('A', 'A: a rising line', true), opt('B', 'B: a horizontal line', true), opt('C', 'C: a vertical line', false, 'vertical-function', 'A vertical test line lies along the whole graph: one x, infinitely many y.'), opt('D', 'D: a sideways curve', false, 'every-relation', 'A vertical line crosses it twice: one x, two y-values.')],
    hints: ['Imagine a vertical line sweeping across.', 'Does it ever cross the graph more than once?', 'Horizontal lines pass; vertical lines don’t.'], solution: 'A and B are functions. C (vertical) and D (sideways curve) fail the vertical line test.' },
  'fn-ctx-s3': { type: 'choice', ideas: ['fn-context'], level: 'intermediate', prompt: 'What does S(3) mean?',
    options: [opt('a', 'The free storage after 3 hours of recording', true), opt('b', '3 GB of storage', false, 'swap-xy', '3 is the input: hours.'), opt('c', 'S multiplied by 3', false, 'fn-multiply', 'S(3) is S evaluated at 3.'), opt('d', 'The hours left when 3 GB is free', false, 'swap-xy', 'The input is hours; the output is storage.')],
    hints: ['S takes hours as input.', 'S(3): input 3 hours.', 'Output: free storage.'], solution: 'S(3) is the free storage after 3 hours: 600 − 120 = 480 GB.' },
  'fn-ctx-table': num(C(4), { ideas: ['fn-context', 'evaluate'], level: 'intermediate', label: 'C(4)', unit: '$', prompt: 'From the budget table, what is C(4)?', fig: { kind: 'table', rows: BUDGET_TABLE, headers: ['d', 'C(d)'] }, traps: [{ value: C(3), code: 'arithmetic', message: 'Read the row where d = 4.' }], hints: ['Find d = 4.', 'Read across.', 'C(4).'], solution: 'C(4) = 3480.' }),
  'fn-ctx-graph': num(Ef(2), { ideas: ['fn-context', 'evaluate'], level: 'advanced', label: 'E(2)', unit: 'credits', prompt: 'The graph shows E(h) = 120 + 90h. Read E(2).', fig: { kind: 'grid', grid: { x: [0, 6], y: [0, 700], sx: 1, sy: 50, profile: true, rect: true, xLabel: 'Editor-hours h', yLabel: 'Cost E (credits)', map: false }, points: [{ x: 2, y: Ef(2), label: '' }], line: [[0, 120], [6, 660]] },
    hints: ['Find h = 2 on the horizontal axis.', 'Go up to the line.', 'Or calculate 120 + 90(2).'], solution: 'E(2) = 120 + 180 = 300 credits.' }),
  'fn-ctx-write': { type: 'choice', ideas: ['fn-context'], level: 'advanced', prompt: 'Write “the editing cost after 6 editor-hours” in function notation.',
    options: [opt('a', 'E(6)', true), opt('b', '6(E)', false, 'swap-xy', 'The function name comes first; the input goes in the brackets.'), opt('c', 'E × 6', false, 'fn-multiply', 'Function notation, not multiplication.'), opt('d', 'h(6)', false, 'swap-xy', 'The function is E; h is its input.')],
    hints: ['Function name, then the input in brackets.', 'The function is E.', 'The input is 6.'], solution: 'E(6) = 120 + 540 = 660 credits.' }
};
export const FN_PRACTICE = [['C', 'd', 1800, 420, 6], ['S', 'h', 600, -40, 9], ['E', 'h', 120, 90, 4], ['R', 'c', 45, 8, 12], ['B', 'd', 5000, -420, 7], ['T', 'n', 600, 140, 3]];
export const FN_PRACTICE_IDS = ['fx-eval', 'fx-func'];
const RELS = [[[1, 4], [2, 7], [3, 4], [4, 9]], [[2, 5], [2, 8], [3, 6], [4, 7]], [[0, 10], [1, 10], [2, 10], [3, 10]], [[5, 1], [6, 2], [5, 3], [7, 4]], [[1, 2], [2, 4], [3, 6], [4, 8]], [[3, 3], [4, 4], [4, 5], [6, 6]]];
export const isFunctionPairs = pairs => pairs.every(([x, y]) => pairs.filter(p => p[0] === x).every(p => p[1] === y));
export function fnPractice(n) {
  const [F_, x, b, m, k] = pick(FN_PRACTICE, n), out = b + m * k, rel = pick(RELS, n), isF = isFunctionPairs(rel);
  return tidy({ brief: `Production function ${n + 1}: ${F_}(${x}) = ${b} ${m < 0 ? '− ' + -m : '+ ' + m}${x}.`,
    'fx-eval': num(out, { ideas: ['evaluate'], level: 'advanced', label: `${F_}(${k})`, prompt: `Evaluate ${F_}(${k}).`, traps: [{ value: (b + m) * k, code: 'fn-multiply', message: `Substitute ${k} for ${x}; only ${m} is multiplied by it.` }], hints: [`Replace ${x} with ${k}.`, `${m} × ${k} = ${m * k}.`, `${b} + (${m * k}).`], solution: `${F_}(${k}) = ${b} + ${m}(${k}) = ${out}.` }),
    'fx-func': { type: 'choice', inline: true, keepOrder: true, ideas: ['is-function'], level: 'advanced', prompt: `Is the relation ${rel.map(p => `(${p[0]}, ${p[1]})`).join(', ')} a function?`, options: [opt('y', 'Function', isF, isF ? 'every-relation' : 'every-relation', 'An input repeats with a different output.'), opt('n', 'Not a function', !isF, 'shared-output', 'No input has two outputs (repeated outputs are fine).')],
      hints: ['Look for repeated inputs.', 'Do they have different outputs?', 'Repeated outputs don’t matter.'], solution: isF ? 'A function: no input has two different outputs.' : 'Not a function: an input has two different outputs.' } });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'plan', n: 1, title: 'Plan the Production', short: 'Plan the Production', minutes: '7–9', focus: 'Writing Linear Equations', badge: 'Executive Producer', blurb: 'Model the budget from a description, a slope and a point, two points, a table and a graph.', graded: Object.keys(M1) },
  { id: 'budget', n: 2, title: 'Understand the Budget', short: 'Understand the Budget', minutes: '6–8', focus: 'Slope-Intercept Form', badge: 'Budget Director', blurb: 'What m and b mean on the budget, the explorer, and rewriting equations into y = mx + b.', graded: Object.keys(M2) },
  { id: 'checkpoint', n: 3, title: 'Calculate Mid-Project Costs', short: 'Mid-Project Costs', minutes: '6–8', focus: 'Point-Slope Form', badge: 'Production Coordinator', blurb: 'Work from checkpoints with y − y₁ = m(x − x₁), convert forms, and pick the best one.', graded: Object.keys(M3) },
  { id: 'graph', n: 4, title: 'Build the Production Graph', short: 'Production Graph', minutes: '8–10', focus: 'Graphing Linear Equations', badge: 'Graphing Editor', blurb: 'Graph the budget and the memory cards, from slopes and intercepts, plus horizontal and vertical lines.', graded: Object.keys(M4) },
  { id: 'limits', n: 5, title: 'Manage the Production Limits', short: 'Production Limits', minutes: '6–8', focus: 'Domain and Range', badge: 'Production Manager', blurb: 'Which inputs make sense? Domains and ranges from models, graphs, tables and points.', graded: Object.keys(M5) },
  { id: 'direct', n: 6, title: 'Direct the Film', short: 'Direct the Film', minutes: '7–9', focus: 'Function Notation', badge: 'Film Director', blurb: 'f(x) notation, evaluating production functions, and telling functions from relations.', graded: Object.keys(M6) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)), ...arrange(tidy(M5)), ...arrange(tidy(M6)) };

// ================================================================ Film Producer Certification
export const FINAL_SETS = [
  { two: [[2, 1600], [6, 2800]], desc: { note: 'A drone package: $480 to book, plus $135 per flight day d.', y: 'D', x: 'd', m: 135, b: 480 }, std: { eq: '3C - 1500d = 2400', y: 'C', x: 'd' }, ps: [250, 4, 2100], hv: { vertical: 3 }, ints: '5x + 2y = 20', model: [310, 1200, 7], fn: ['S', 'h', 800, -50, 6], rel: [[1, 3], [2, 3], [3, 5], [4, 7]] },
  { two: [[1, 950], [4, 1730]], desc: { note: 'Sound design: a $300 setup fee plus $75 per hour h.', y: 'A', x: 'h', m: 75, b: 300 }, std: { eq: 'S + 30h = 450', y: 'S', x: 'h' }, ps: [-60, 3, 520], hv: { m: 0, b: 400 }, ints: '2x + 3y = 18', model: [180, 900, 10], fn: ['E', 'h', 150, 80, 7], rel: [[2, 4], [2, 6], [3, 8], [5, 9]] },
  { two: [[3, 2190], [7, 3510]], desc: { note: 'Lighting rental: $650 up front plus $220 per night n.', y: 'L', x: 'n', m: 220, b: 650 }, std: { eq: '2E - 180h = 400', y: 'E', x: 'h' }, ps: [140, 5, 1300], hv: { vertical: 5 }, ints: '4x + 5y = 40', model: [450, 2000, 6], fn: ['C', 'd', 1800, 420, 7], rel: [[0, 1], [1, 2], [2, 1], [3, 2]] },
  { two: [[2, 860], [5, 1610]], desc: { note: 'An FPV pilot: $200 travel plus $160 per session s.', y: 'P', x: 's', m: 160, b: 200 }, std: { eq: '4B + 1600d = 20000', y: 'B', x: 'd' }, ps: [-35, 6, 390], hv: { m: 0, b: 250 }, ints: '3x + 2y = 12', model: [95, 400, 12], fn: ['R', 'c', 30, 6, 9], rel: [[4, 1], [5, 2], [4, 3], [6, 4]] }
];
export const FINAL_IDS = ['fa-2pt', 'fa-desc', 'fb-mb', 'fb-mean', 'fc-ps', 'fc-conv', 'fd-ints', 'fd-hv', 'fe-dom', 'fe-range', 'ff-eval', 'ff-func'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalQuestions(roundNo) {
  const X = pick(FINAL_SETS, roundNo - 1), [[x1, y1], [x2, y2]] = X.two, m2 = new Frac(y2 - y1, x2 - x1), b2 = Frac.of(y1).sub(m2.mul(x1));
  const L = lineOf(X.std.eq, X.std.x.toLowerCase(), X.std.y.toLowerCase()), [pm, px, py] = X.ps, pb = Frac.of(py).sub(Frac.of(pm).mul(px));
  const I = lineOf(X.ints, 'x', 'y'), xi = I.b.neg().div(I.m), yi = I.b;
  const [rate, fixed, max] = X.model, [F_, fx, fb, fm, fk] = X.fn, isF = isFunctionPairs(X.rel);
  const hvGrid = X.hv.vertical !== undefined ? { x: [0, 8], y: [0, 8], map: false } : { x: [0, 8], y: [0, 500], sx: 1, sy: 50, profile: true, rect: true, xLabel: 'Hours', yLabel: 'Credits', map: false };
  return tidy({
    set: X,
    'fa-2pt': expr('C', m2, b2, 'd', { level: 'advanced', prompt: `Two budget checkpoints: day ${x1} cost ${money(y1)}, day ${x2} cost ${money(y2)}. Write the equation C = md + b.`, hints: ['Slope = change in cost ÷ change in days.', `(${y2} − ${y1}) ÷ (${x2} − ${x1}).`, 'Then substitute a point for b.'] }),
    'fa-desc': expr(X.desc.y, X.desc.m, X.desc.b, X.desc.x, { level: 'intermediate', prompt: `${X.desc.note} Write ${X.desc.y}.` }),
    'fb-mb': { type: 'fields', ideas: ['slope-int', 'rearrange'], level: 'advanced', prompt: `Rewrite ${X.std.eq.replace(/-/g, '−')} in slope-intercept form. What are the slope and the intercept?`, fields: [{ id: 'm', label: 'm', answer: Number(L.m), traps: [{ value: Number(L.b), code: 'm-b-swap', message: 'That’s the intercept.' }] }, { id: 'b', label: 'b', answer: Number(L.b), traps: [{ value: Number(L.m), code: 'm-b-swap', message: 'That’s the slope.' }] }],
      hints: [`Get ${X.std.y} alone.`, 'Move the other term; divide every term.', `${X.std.y} = m${X.std.x} + b.`], solution: `${X.std.y} = ${lin(L.m, L.b, X.std.x)}: m = ${S(L.m)}, b = ${S(L.b)}.` },
    'fb-mean': mean(`In ${X.desc.y} = ${X.desc.m}${X.desc.x} + ${X.desc.b}, what does ${X.desc.b} mean?`, `The fixed amount: $${X.desc.b} before any ${X.desc.x === 'd' ? 'days' : X.desc.x === 'h' ? 'hours' : X.desc.x === 'n' ? 'nights' : 'sessions'}`, [[`$${X.desc.b} for each unit`, 'slope-as-start', `That’s the ${X.desc.m}.`], [`${X.desc.b} units in total`, 'swap-xy', 'It’s in dollars.'], ['The total cost', 'm-b-swap', `${X.desc.y} is the total.`]], { level: 'intermediate' }),
    'fc-ps': ps('C', 'd', pm, px, py, { level: 'advanced', prompt: `A checkpoint: (${px}, ${py}) with slope ${S(pm)}. Write the point-slope equation (C and d).` }),
    'fc-conv': expr('C', pm, pb, 'd', { ideas: ['convert'], level: 'advanced', prompt: 'Convert it to slope-intercept form.', hints: ['Distribute.', 'Move the constant.', `b = ${py} − (${S(pm)})(${px}).`] }),
    'fd-ints': { type: 'plot', ideas: ['graph', 'intercepts'], level: 'advanced', prompt: `Graph ${X.ints} from its intercepts.`, grid: { x: [0, 10], y: [0, 10], sx: 1, sy: 1, profile: true, xLabel: 'x', yLabel: 'y', map: false }, connect: true,
      targets: [{ x: Number(xi), y: 0, name: `(${S(xi)}, 0)` }, { x: 0, y: Number(yi), name: `(0, ${S(yi)})` }], hints: ['x-intercept: y = 0.', 'y-intercept: x = 0.', 'Plot both.'], solution: `(${S(xi)}, 0) and (0, ${S(yi)}).` },
    'fd-hv': lp(X.hv, hvGrid, { level: 'intermediate', prompt: `Graph ${X.hv.vertical !== undefined ? 'x = ' + X.hv.vertical : 'y = ' + X.hv.b}: place two points on it.`, hints: ['Which coordinate stays fixed?', X.hv.vertical !== undefined ? `x = ${X.hv.vertical} every time.` : `y = ${X.hv.b} every time.`, 'Pick any two points.'], solution: X.hv.vertical !== undefined ? `Any two points with x = ${X.hv.vertical}: vertical, slope undefined.` : `Any two points with y = ${X.hv.b}: horizontal, slope 0.` }),
    'fe-dom': iv(`[0, ${max}]`, { ideas: ['domain', 'interval'], level: 'intermediate', label: 'Domain', prompt: `C(d) = ${fixed} + ${rate}d, approved for up to ${max} shoot days (prorated). Domain?`, hints: ['Smallest d.', 'Largest d.', 'Interval notation.'], solution: `[0, ${max}].` }),
    'fe-range': iv(`[${fixed}, ${fixed + rate * max}]`, { ideas: ['range', 'interval'], level: 'advanced', label: 'Range', prompt: 'And the range?', hints: ['C(0).', `C(${max}).`, 'Smaller first.'], solution: `[${fixed}, ${fixed + rate * max}].` }),
    'ff-eval': num(fb + fm * fk, { ideas: ['evaluate'], level: 'intermediate', label: `${F_}(${fk})`, prompt: `${F_}(${fx}) = ${fb} ${fm < 0 ? '− ' + -fm : '+ ' + fm}${fx}. Evaluate ${F_}(${fk}).`, traps: [{ value: (fb + fm) * fk, code: 'fn-multiply', message: `Substitute ${fk} for ${fx}.` }], hints: [`Replace ${fx} with ${fk}.`, `${fm} × ${fk}.`, `Add ${fb}.`], solution: `${F_}(${fk}) = ${fb + fm * fk}.` }),
    'ff-func': { type: 'choice', inline: true, keepOrder: true, ideas: ['is-function'], level: 'intermediate', prompt: `Is ${X.rel.map(p => `(${p[0]}, ${p[1]})`).join(', ')} a function?`, options: [opt('y', 'Function', isF, 'every-relation', 'An input repeats with a different output.'), opt('n', 'Not a function', !isF, 'shared-output', 'Repeated outputs are fine; no input has two outputs.')],
      hints: ['Repeated inputs?', 'Different outputs for them?', 'Outputs may repeat.'], solution: isF ? 'A function.' : 'Not a function: an input has two outputs.' }
  });
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[TWO_POINT_PRACTICE, twoPointPractice, TWO_POINT_IDS], [SI_PRACTICE, siPractice, SI_PRACTICE_IDS], [PS_PRACTICE, psPractice, PS_PRACTICE_IDS], [DOMAIN_PRACTICE, domainPractice, DOMAIN_PRACTICE_IDS], [FN_PRACTICE, fnPractice, FN_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const F = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...F[id].ideas])]; }
  return out;
}
export { lin, money, S as showNum };
