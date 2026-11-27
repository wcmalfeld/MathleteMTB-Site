// Uplift: every graded question. Answers come from logic/systems.js (exact
// fractions; classification from the equations' structure) and the kit's
// checkers, never typed in by hand. Three progressive hints each, a worked
// solution, and traps (anticipated wrong answers with a misconception code).
//
// Types the lab draws (uplift.js): 'plot' (place a point; Map the Line's
// plotter, with both lines drawn) and 'lineplot' (place two points on a line;
// Frame the Line's). fig: a figure under the prompt ('system' grid, or a table).

import { E, solve, check, eqText, eqAscii, S, F, KIND_TEXT, mixture, rateMeet, breakEven, cost, multipliersFor, scale, satisfies, pointText } from './systems.js';
import { PLANS, FLEET, FLEET_2, INVOICES, ORDERS, MIX, CREWS } from './park.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
const N = x => Number(F(x));
const money = x => '$' + N(x).toLocaleString('en-US');
const num = (answer, o) => ({ type: 'number', tolerance: 1e-6, ...o, answer: N(answer) });
const H = (a, b, c) => [a, b, c];
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
// A solution pair (x, y) as two fields, with the swapped pair as a trap.
function pair(x, y, o) {
  const [lx, ly] = o.labels || ['x', 'y'], ux = o.units ? o.units[0] : undefined, uy = o.units ? o.units[1] : undefined;
  return { type: 'fields', ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt, fig: o.fig,
    fields: [{ id: 'x', label: lx, unit: ux, answer: N(x), traps: [{ value: N(y), code: 'swap-xy', message: o.swapMsg || 'Those are the right numbers in the wrong places: check which variable is which.' }, ...(o.trapsX || [])] },
      { id: 'y', label: ly, unit: uy, answer: N(y), traps: [{ value: N(x), code: 'swap-xy', message: o.swapMsg || 'Those are the right numbers in the wrong places: check which variable is which.' }, ...(o.trapsY || [])] }],
    hints: o.hints, solution: o.solution };
}
const lineQ = (answer, o) => ({ type: 'line', x: o.x || 'x', y: o.y || 'y', label: o.label || 'Equation', ideas: o.ideas || ['model'], level: o.level || 'intermediate', prompt: o.prompt, answer, traps: o.traps || [], hints: o.hints, solution: o.solution || answer.replace(/-/g, '−') + '.' });
const exprQ = (label, answer, vars, o) => ({ type: 'expression', label, answer, vars, ideas: o.ideas || ['model'], level: o.level || 'beginner', prompt: o.prompt, traps: o.traps || [], tiles: o.tiles, hints: o.hints, solution: o.solution });
const choice = (prompt, right, wrongs, o = {}) => ({ type: 'choice', ideas: o.ideas, level: o.level || 'intermediate', prompt, fig: o.fig, keepOrder: o.keepOrder, inline: o.inline,
  options: [opt('a', right, true), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))], hints: o.hints, solution: o.solution || right + '.' });
const TYPE_WRONG = {
  one: { none: ['slope-compare', 'Different slopes always cross exactly once.'], infinite: ['slope-compare', 'Different slopes: the lines cross at one point only.'] },
  none: { one: ['always-solution', 'Parallel lines never meet: there is no point on both.'], infinite: ['none-vs-infinite', 'Same slope but different intercepts: parallel, not the same line.'] },
  infinite: { one: ['always-solution', 'Equivalent equations make the same line: every point on it works.'], none: ['none-vs-infinite', 'These are the same line, not parallel ones: they share every point.'] }
};
const typeQ = (prompt, kind, o = {}) => ({ type: 'choice', inline: true, keepOrder: true, ideas: ['num-solutions'], level: o.level || 'intermediate', prompt, fig: o.fig,
  options: [['one', 'One solution'], ['none', 'No solution'], ['infinite', 'Infinitely many']].map(([id, t]) => (id === kind ? opt(id, t, true) : opt(id, t, false, TYPE_WRONG[kind][id][0], TYPE_WRONG[kind][id][1]))),
  hints: o.hints || ['Compare the slopes first.', 'Same slope? Then compare the intercepts.', 'Different slopes: one. Same slope, different intercept: none. Same line: infinitely many.'], solution: o.solution });

// The shuttle graph (rides against dollars) and a system figure.
export const SHUTTLE_GRID = { x: [0, 12], y: [0, 120], sx: 1, sy: 10, profile: true, rect: true, xLabel: 'Shuttle rides r', yLabel: 'Total cost C ($)', map: false };
// A line y = m·x + b, clipped to the grid window.
function clipLine(m, b, G) {
  let [x0, x1] = G.x; const yl = G.y || [-Infinity, Infinity];
  if (m) { const xa = (yl[0] - b) / m, xb = (yl[1] - b) / m; x0 = Math.max(x0, Math.min(xa, xb)); x1 = Math.min(x1, Math.max(xa, xb)); }
  return [[x0, m * x0 + b], [x1, m * x1 + b]];
}
const planLine = (fee, rate, G, cls, label) => ({ pts: clipLine(rate, fee, G), cls, label });
const sysFig = (p, q, G = SHUTTLE_GRID, o = {}) => ({ kind: 'system', grid: G, lines: [planLine(p.fee, p.rate, G, 'is-a', o.la || 'A'), planLine(q.fee, q.rate, G, 'is-b', o.lb || 'B')], points: o.points || [] });
const slopeLine = (m, b, G, cls, label) => ({ pts: clipLine(m, b, G), cls, label });

export const IDEAS = {
  'graph-solve': 'Solving a system by graphing',
  'num-solutions': 'One, no or infinitely many solutions',
  interpret: 'Interpreting an intersection in context',
  substitute: 'Solving by substitution',
  'choose-var': 'Choosing which variable to isolate',
  verify: 'Checking a solution in both equations',
  eliminate: 'Solving by elimination',
  scale: 'Multiplying equations to line up coefficients',
  method: 'Choosing graphing, substitution or elimination',
  model: 'Writing a system from a situation',
  'break-even': 'Break-even and comparison problems',
  mixture: 'Mixture problems',
  rate: 'Rate problems'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'graph', name: 'Graphing Systems', ideas: ['graph-solve', 'num-solutions', 'interpret'] },
  { id: 'sub', name: 'Substitution', ideas: ['substitute', 'choose-var', 'verify'] },
  { id: 'elim', name: 'Elimination', ideas: ['eliminate', 'scale', 'method'] },
  { id: 'apps', name: 'Applications of Systems', ideas: ['model', 'break-even', 'mixture', 'rate'] }
];
export const MISCONCEPTIONS = {
  'swap-xy': 'Confusing the x- and y-coordinates of an intersection',
  'always-solution': 'Assuming every system has exactly one solution',
  'none-vs-infinite': 'Confusing no solution with infinitely many solutions',
  'no-interpret': 'Finding an intersection without interpreting it',
  'isolate-error': 'Isolating a variable incorrectly',
  'no-parens': 'Substituting an expression without parentheses',
  'one-equation': 'Solving or checking only one equation instead of both',
  'no-verify': 'Not verifying the solution in both equations',
  'unaligned-add': 'Adding equations before the coefficients are aligned',
  'one-side-scale': 'Multiplying only one side of an equation when scaling',
  'sign-subtract': 'Changing signs incorrectly during subtraction',
  'quantity-concentration': 'Mixing up a mixture’s quantity and its concentration',
  'rate-time': 'Mixing up a rate, a time and a distance',
  'slope-compare': 'Not comparing slopes to count solutions',
  'fractional-count': 'Accepting a fractional number of bikes or items without checking the context',
  'rate-fee-swap': 'Swapping the fixed fee and the per-ride rate',
  'var-mixup': 'Mixing up what each variable stands for',
  'inefficient-choice': 'Choosing a harder variable or method than needed',
  'plot-error': 'Placing a point off the intersection',
  'hv-swap': 'Mixing up horizontal and vertical lines',
  'quadrant-signs': 'Sign errors when plotting',
  'scale-count': 'Misreading an axis scale',
  intercept: 'Right slope, wrong intercept',
  slope: 'Right intercept, wrong slope',
  sign: 'A sign error',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Stage 01: The Uplift Showdown (graphing)
const A = PLANS.a, B = PLANS.b, BE = breakEven(A, B);
const STRAT = { c: { fee: 15, rate: 9 }, d: { fee: 45, rate: 6 } }, STRAT_BE = breakEven(STRAT.c, STRAT.d);
const STRAT_GRID = { ...SHUTTLE_GRID, y: [0, 150], sy: 15 };
const M1 = {
  'sh-eq-a': exprQ('C =', '8r + 12', ['r'], { level: 'beginner', ideas: ['model', 'graph-solve'], tiles: ['8', '12', 'r', '+'], prompt: 'Plan A, Pay As You Ride: a $12 booking fee plus $8 for every shuttle ride. Write the total cost C for r rides.',
    traps: [{ expr: '12r + 8', code: 'rate-fee-swap', message: 'The $8 is paid every ride, so it multiplies r; the $12 is paid once.' }, { expr: '8r', code: 'rate-fee-swap', message: 'Don’t forget the $12 booking fee.' }], hints: H('What’s paid once, and what’s paid every ride?', 'Each ride adds 8: that’s 8r.', 'Add the one-off 12.'), solution: 'C = 8r + 12.' }),
  'sh-eq-b': exprQ('C =', '4r + 36', ['r'], { level: 'beginner', ideas: ['model', 'graph-solve'], prompt: 'Plan B, Mountain Pass: a $36 pass plus $4 per ride. Write its total cost.',
    traps: [{ expr: '36r + 4', code: 'rate-fee-swap', message: 'The $4 is the per-ride rate: it multiplies r.' }], hints: H('The pass is paid once.', 'Each ride adds 4.', 'C = 4r + 36.'), solution: 'C = 4r + 36.' }),
  'sh-graph-a': { type: 'lineplot', line: { m: 8, b: 12 }, grid: SHUTTLE_GRID, ideas: ['graph-solve'], level: 'beginner', prompt: 'Graph Plan A, C = 8r + 12: place two points on its line.', hints: H('At r = 1, C = 20.', 'Find another ride count that lands on a grid line: try r = 6.', '(1, 20) and (6, 60).'), solution: 'For example (1, 20) and (6, 60): the line starts at $12 and rises $8 a ride.' },
  'sh-graph-b': { type: 'lineplot', line: { m: 4, b: 36 }, grid: SHUTTLE_GRID, ideas: ['graph-solve'], level: 'beginner', prompt: 'Graph Plan B, C = 4r + 36: place two points on its line.', hints: H('At r = 1, C = 40.', 'At r = 6, C = 60.', '(1, 40) and (6, 60).'), solution: 'For example (1, 40) and (6, 60): it starts higher but rises only $4 a ride.' },
  'sh-plot': { type: 'plot', ideas: ['graph-solve'], level: 'intermediate', prompt: 'Both plans are graphed. Place the point where they cross.', grid: { ...SHUTTLE_GRID, lines: sysFig(A, B).lines }, targets: [{ x: N(BE.r), y: N(BE.C), name: pointText(BE.r, BE.C) }],
    hints: H('Look for the one point on both lines.', 'Read the rides across, then the cost up.', 'They meet at 6 rides.'), solution: `They cross at ${pointText(BE.r, BE.C)}: 6 rides, $60 on both plans.` },
  'sh-solve': num(BE.r, { ideas: ['graph-solve'], level: 'intermediate', label: 'r', unit: 'rides', prompt: 'Check it algebraically: 8r + 12 = 4r + 36. Solve for r.', traps: [{ value: 12, code: 'arithmetic', message: 'Subtract 4r and 12 from both sides first: 4r = 24.' }, { value: 60, code: 'swap-xy', message: '60 is the cost, C. The question asks for the rides, r.' }],
    hints: H('Collect the r terms on one side.', '8r − 4r = 36 − 12.', '4r = 24.'), solution: '4r = 24, so r = 6.' }),
  'sh-cost': num(BE.C, { ideas: ['graph-solve'], level: 'beginner', label: 'C', unit: '$', prompt: 'And the cost at 6 rides?', traps: [{ value: 6, code: 'swap-xy', message: '6 is the number of rides.' }], hints: H('Substitute r = 6 into either plan.', '8(6) + 12.', 'Check: 4(6) + 36 gives the same.'), solution: 'C = 8(6) + 12 = 60, and 4(6) + 36 = 60 too.' }),
  'sh-interp': choice('What does the intersection (6, 60) mean for riders?', 'At 6 rides both plans cost $60; below 6, Plan A is cheaper, above 6, Plan B is', [['Riders should take exactly 6 rides', 'no-interpret', 'It’s where the plans tie, not a ride limit.'], ['6 dollars buys 60 rides', 'swap-xy', 'The first coordinate is rides, the second is dollars.'], ['Plan B is always cheaper', 'no-interpret', 'Below 6 rides, Plan A costs less.']],
    { ideas: ['interpret'], hints: H('What is the same at the intersection?', 'What happens on each side of it?', 'Compare 3 rides and 10 rides.') }),
  'sh-3': choice('Which plan is cheaper for 3 rides?', 'Plan A: $36 vs $48', [['Plan B: $48 vs $36', 'no-interpret', 'Work out both: 8(3) + 12 = 36 and 4(3) + 36 = 48.'], ['They cost the same', 'always-solution', 'They’re only equal at 6 rides.']], { ideas: ['interpret', 'break-even'], level: 'beginner', hints: H('Substitute r = 3 into each plan.', 'A: 24 + 12. B: 12 + 36.', 'Smaller total wins.') }),
  'sh-10': choice('And for 10 rides?', 'Plan B: $76 vs $92', [['Plan A: $92 vs $76', 'no-interpret', 'Past 6 rides, the lower per-ride rate wins.'], ['They cost the same', 'always-solution', 'Only at 6 rides.']], { ideas: ['interpret', 'break-even'], level: 'beginner', hints: H('Substitute r = 10.', 'A: 80 + 12. B: 40 + 36.', 'Smaller total wins.') }),
  'ty-one': typeQ('y = 8x + 12 and y = 4x + 36: how many solutions?', 'one', { fig: { kind: 'system', grid: SHUTTLE_GRID, lines: [slopeLine(8, 12, SHUTTLE_GRID, 'is-a'), slopeLine(4, 36, SHUTTLE_GRID, 'is-b')] }, level: 'beginner', solution: 'One: different slopes (8 and 4), so the lines cross exactly once, at (6, 60).' }),
  'ty-none': typeQ('Two operators: y = 6x + 20 and y = 6x + 30. How many solutions?', 'none', { fig: { kind: 'system', grid: SHUTTLE_GRID, lines: [slopeLine(6, 20, SHUTTLE_GRID, 'is-a'), slopeLine(6, 30, SHUTTLE_GRID, 'is-b')] }, solution: 'No solution: both rise $6 a ride but start $10 apart, so they stay $10 apart forever. Parallel lines never meet.' }),
  'ty-inf': typeQ('y = 8(x + 2) and y = 8x + 16. How many solutions?', 'infinite', { fig: { kind: 'system', grid: SHUTTLE_GRID, lines: [slopeLine(8, 16, SHUTTLE_GRID, 'is-a'), slopeLine(8, 16, SHUTTLE_GRID, 'is-b is-same')] }, level: 'advanced', solution: 'Infinitely many: 8(x + 2) = 8x + 16, so they’re the same line. Every point on it is a solution.' }),
  'ty-why': choice('Why can y = 6x + 20 and y = 6x + 30 never be equal?', 'They rise at the same rate, so the $10 gap never closes', [['The second always grows faster', 'none-vs-infinite', 'Both grow $6 a ride.'], ['They’re equal at x = 10', 'always-solution', '6(10) + 20 = 80 but 6(10) + 30 = 90.'], ['They’re the same line', 'none-vs-infinite', 'Different intercepts: 20 and 30.']], { ideas: ['num-solutions'], level: 'intermediate', hints: H('Compare the slopes.', 'Compare the starting values.', 'What happens to the gap as x grows?') }),
  'sc-eq-c': exprQ('C =', '9r + 15', ['r'], { level: 'intermediate', ideas: ['model'], prompt: 'Strategy challenge. Plan C: $15 to book plus $9 per ride. Write its cost.', traps: [{ expr: '15r + 9', code: 'rate-fee-swap', message: 'The per-ride amount multiplies r.' }], hints: H('Fixed fee: 15.', 'Per ride: 9.', 'C = 9r + 15.'), solution: 'C = 9r + 15.' }),
  'sc-eq-d': exprQ('C =', '6r + 45', ['r'], { level: 'intermediate', ideas: ['model'], prompt: 'Plan D: a $45 pass plus $6 per ride.', traps: [{ expr: '45r + 6', code: 'rate-fee-swap', message: 'The per-ride amount multiplies r.' }], hints: H('Fixed fee: 45.', 'Per ride: 6.', 'C = 6r + 45.'), solution: 'C = 6r + 45.' }),
  'sc-plot': { type: 'plot', ideas: ['graph-solve'], level: 'intermediate', prompt: 'Place the break-even point of Plans C and D.', grid: { ...STRAT_GRID, lines: sysFig(STRAT.c, STRAT.d, STRAT_GRID, { la: 'C', lb: 'D' }).lines }, targets: [{ x: N(STRAT_BE.r), y: N(STRAT_BE.C), name: pointText(STRAT_BE.r, STRAT_BE.C) }],
    hints: H('Where do the lines cross?', '9r + 15 = 6r + 45.', '3r = 30.'), solution: `${pointText(STRAT_BE.r, STRAT_BE.C)}: 10 rides cost $105 on both.` },
  'sc-type': typeQ('How many solutions does the C/D system have?', 'one', { level: 'beginner', solution: 'One: the slopes (9 and 6) differ.' }),
  'sc-cheap': choice('A rider plans 4 rides. Which plan should they buy?', 'Plan C: $51 vs $69', [['Plan D: $69 vs $51', 'no-interpret', 'Below the break-even (10 rides), the lower fee wins.'], ['Either: they’re equal', 'always-solution', 'Only at 10 rides.']], { ideas: ['interpret', 'break-even'], hints: H('4 is below the break-even of 10.', 'C: 36 + 15. D: 24 + 45.', 'Smaller total.') }),
  'sc-same': choice('Plan E is $30 + $7 a ride; Plan F is $40 + $7 a ride. When do they cost the same?', 'Never: same rate, so Plan E is always $10 cheaper', [['At 10 rides', 'always-solution', '30 + 70 = 100 but 40 + 70 = 110.'], ['At every ride count', 'none-vs-infinite', 'They start $10 apart.'], ['At 0 rides', 'always-solution', '$30 vs $40.']], { ideas: ['num-solutions', 'break-even'], level: 'advanced', hints: H('Compare the per-ride rates.', 'Same slope: parallel lines.', 'Different starts: never equal.') })
};
export const SHUTTLE_PRACTICE = [[10, 9, 40, 4], [5, 12, 35, 7], [18, 6, 42, 3], [25, 8, 55, 5], [8, 11, 32, 7], [14, 10, 50, 6]];
export const SHUTTLE_PRACTICE_IDS = ['shx-meet', 'shx-cheap'];
export function shuttlePractice(n) {
  const [f1, r1, f2, r2] = pick(SHUTTLE_PRACTICE, n), p = { fee: f1, rate: r1 }, q = { fee: f2, rate: r2 }, R = breakEven(p, q), k = N(R.r) + 3;
  const cp = N(cost(p, k)), cq = N(cost(q, k));
  return tidy({ brief: `New packages ${n + 1}: Plan P is $${f1} + $${r1} a ride; Plan Q is $${f2} + $${r2} a ride.`,
    'shx-meet': pair(R.r, R.C, { ideas: ['graph-solve', 'break-even'], level: 'intermediate', labels: ['Rides r', 'Cost C'], units: ['rides', '$'], prompt: 'Where do the plans break even?', hints: H(`${r1}r + ${f1} = ${r2}r + ${f2}.`, `${r1 - r2}r = ${f2 - f1}.`, 'Then substitute r into either plan.'), solution: `r = ${S(R.r)}, C = ${S(R.C)}.` }),
    'shx-cheap': choice(`Which plan is cheaper for ${k} rides?`, `Plan Q: $${cq} vs $${cp}`, [[`Plan P: $${cp} vs $${cq}`, 'no-interpret', 'Past the break-even, the lower per-ride rate wins.'], ['They cost the same', 'always-solution', `They only tie at ${S(R.r)} rides.`]], { ideas: ['interpret', 'break-even'], hints: H('Is it above or below the break-even?', 'Substitute into both.', 'Smaller total.') }) });
}

// ================================================================ Stage 02: Build the Rental Fleet (substitution)
const FS = solve(FLEET.e1, FLEET.e2), F2S = solve(FLEET_2.e1, FLEET_2.e2);
const CS1 = { e1: E(1, 2, 16), e2: E(1, -4, -2) }, CS1S = solve(CS1.e1, CS1.e2);
const CS2 = { e1: E(3, -1, 7), e2: E(2, 3, 1) }, CS2S = solve(CS2.e1, CS2.e2);
const CS3 = { e1: E(1, -2, 1), e2: E(4, 2, 9) }, CS3S = solve(CS3.e1, CS3.e2);
const M2 = {
  'fl-eq1': lineQ('x + y = 18', { ideas: ['model', 'substitute'], level: 'beginner', prompt: 'The rental fleet: 18 bikes. Let x = trail bikes and y = downhill bikes. Write the fleet-size equation.', traps: [{ eq: 'x + y = 1260', code: 'var-mixup', message: 'This equation counts bikes, not dollars.' }],
    hints: H('What do you know about the total number of bikes?', 'Trail bikes plus downhill bikes…', '…make 18.') }),
  'fl-eq2': lineQ('60x + 90y = 1260', { ideas: ['model', 'substitute'], level: 'intermediate', prompt: 'Trail bikes rent for $60 a day and downhill bikes for $90. The target is $1,260 a day. Write the revenue equation.', traps: [{ eq: '90x + 60y = 1260', code: 'var-mixup', message: 'x is trail bikes, which rent for $60: 60x.' }, { eq: '60x + 90y = 18', code: 'var-mixup', message: 'The revenue equation totals dollars: $1,260.' }],
    hints: H('Each trail bike brings in $60: 60x.', 'Each downhill bike brings in $90: 90y.', 'Together: $1,260.') }),
  'fl-iso': exprQ('x =', '18 - y', ['y'], { ideas: ['substitute', 'choose-var'], level: 'beginner', prompt: 'Rearrange x + y = 18 to express x in terms of y.', traps: [{ expr: 'y - 18', code: 'isolate-error', message: 'Subtract y from both sides: x = 18 − y, not y − 18.' }, { expr: '18 + y', code: 'isolate-error', message: 'Move y by subtracting it.' }],
    hints: H('Get x alone.', 'Subtract y from both sides.', 'x = 18 − y.'), solution: 'x = 18 − y.' }),
  'fl-sub': choice('Substitute x = 18 − y into 60x + 90y = 1260. Which is right?', '60(18 − y) + 90y = 1260', [['60 · 18 − y + 90y = 1260', 'no-parens', 'Without brackets, only the 18 gets multiplied by 60. Keep 18 − y together: 60(18 − y).'], ['60(18 − y) + 90(18 − y) = 1260', 'isolate-error', 'Only x is replaced; y stays as y.'], ['18 − y + 90y = 1260', 'no-parens', 'The 60 still multiplies the whole of x.']],
    { ideas: ['substitute'], level: 'intermediate', hints: H('Replace x, and only x.', 'The whole expression 18 − y goes where x was.', 'Use brackets: 60(18 − y).') }),
  'fl-dist': num(180, { ideas: ['substitute'], level: 'intermediate', label: '30y =', prompt: 'Distribute and combine: 1080 − 60y + 90y = 1260, so 30y = ?', traps: [{ value: 1260 - 1080 + 120, code: 'sign', message: '−60y + 90y = 30y, and 1260 − 1080 = 180.' }, { value: 2340, code: 'sign', message: 'Subtract 1080 from both sides.' }],
    hints: H('Combine −60y + 90y.', '30y + 1080 = 1260.', 'Subtract 1080.'), solution: '30y = 180.' }),
  'fl-y': num(FS.y, { ideas: ['substitute'], level: 'beginner', label: 'y', unit: 'downhill bikes', prompt: 'So how many downhill bikes?', traps: [{ value: 180, code: 'arithmetic', message: 'Divide by 30.' }, { value: 12, code: 'swap-xy', message: 'That’s x, the trail bikes.' }], hints: H('30y = 180.', 'Divide both sides by 30.', 'y = 6.'), solution: 'y = 6 downhill bikes.' }),
  'fl-x': num(FS.x, { ideas: ['substitute'], level: 'beginner', label: 'x', unit: 'trail bikes', prompt: 'And trail bikes?', traps: [{ value: 6, code: 'swap-xy', message: 'That’s y.' }, { value: 24, code: 'isolate-error', message: 'x = 18 − y, so 18 − 6.' }], hints: H('Use x = 18 − y.', 'y = 6.', '18 − 6.'), solution: 'x = 18 − 6 = 12 trail bikes.' }),
  'fl-check': { type: 'fields', ideas: ['verify'], level: 'beginner', prompt: 'Verify (12, 6) in both original equations.', fields: [{ id: 'e1', label: '12 + 6 =', answer: 18 }, { id: 'e2', label: '60(12) + 90(6) =', unit: '$', answer: 1260, traps: [{ value: 720, code: 'one-equation', message: 'That’s only the trail bikes: add the downhill revenue, 90(6) = 540.' }] }],
    hints: H('Substitute x = 12, y = 6 into each.', '60 × 12 = 720; 90 × 6 = 540.', '720 + 540.'), solution: '12 + 6 = 18 ✓ and 720 + 540 = 1260 ✓. Both conditions hold.' },
  'fl-only': choice('A manager suggests 10 trail bikes and 8 downhill bikes. Is that a solution?', 'No: it makes 18 bikes, but brings in $1,320, not $1,260', [['Yes: 10 + 8 = 18', 'one-equation', 'That’s only the first equation. Check the revenue too: 60(10) + 90(8) = 1320.'], ['Yes: it’s close enough', 'no-verify', 'A solution must make both equations exactly true.']],
    { ideas: ['verify'], level: 'intermediate', hints: H('Check the fleet size.', 'Now check the revenue.', '600 + 720 = ?') }),
  'fl-frac': choice('Another park: x + y = 15 and 60x + 90y = 1125 give x = 7.5 and y = 7.5. What should the manager do?', 'Change a target: no whole-number fleet meets both conditions exactly', [['Stock 7.5 of each', 'fractional-count', 'Half a bike can’t be rented: the context needs whole numbers.'], ['Round to 8 and 8', 'fractional-count', '8 + 8 = 16, which breaks the 15-bike total.'], ['Ignore the revenue equation', 'one-equation', 'Both conditions matter.']],
    { ideas: ['verify', 'substitute'], level: 'advanced', hints: H('Can a fleet have half a bike?', 'Would rounding keep both equations true?', 'Check 8 + 8.') }),
  'cs-which': choice('System: x + 2y = 16 and x = 4y − 2. What should you substitute?', 'x = 4y − 2: x is already alone in equation 2', [['Isolate y in equation 1 first', 'inefficient-choice', 'That works, but gives fractions: equation 2 already has x alone.'], ['Isolate x in equation 1 first', 'inefficient-choice', 'Equation 2 already gives x.'], ['Add the equations', 'unaligned-add', 'Nothing cancels if you add them as they are.']],
    { ideas: ['choose-var'], level: 'beginner', hints: H('Is any variable already on its own?', 'Look at equation 2.', 'Substitute 4y − 2 for x.') }),
  'cs-sol': pair(CS1S.x, CS1S.y, { ideas: ['substitute'], level: 'intermediate', prompt: 'Solve it: (4y − 2) + 2y = 16.', hints: H('6y − 2 = 16.', '6y = 18, so y = 3.', 'x = 4(3) − 2.'), solution: `6y = 18, y = 3, x = 10: ${pointText(CS1S.x, CS1S.y)}.` }),
  'cs-which-2': choice('System: 3x − y = 7 and 2x + 3y = 1. Which variable is easiest to isolate?', 'y in equation 1 (coefficient −1)', [['x in equation 2', 'inefficient-choice', 'You’d divide by 2 and get fractions.'], ['x in equation 1', 'inefficient-choice', 'You’d divide by 3.'], ['y in equation 2', 'inefficient-choice', 'You’d divide by 3.']],
    { ideas: ['choose-var'], level: 'intermediate', hints: H('Look for a coefficient of 1 or −1.', '−y in equation 1.', 'y = 3x − 7.') }),
  'cs-sol-2': pair(CS2S.x, CS2S.y, { ideas: ['substitute'], level: 'advanced', prompt: 'Solve it: y = 3x − 7, so 2x + 3(3x − 7) = 1.', trapsY: [{ value: 1, code: 'sign', message: 'y = 3(2) − 7 = −1.' }], hints: H('2x + 9x − 21 = 1.', '11x = 22.', 'x = 2; then y = 3(2) − 7.'), solution: `11x = 22, x = 2, y = −1: ${pointText(CS2S.x, CS2S.y)}. Check: 3(2) − (−1) = 7 ✓, 2(2) + 3(−1) = 1 ✓.` }),
  'cs-sol-3': pair(CS3S.x, CS3S.y, { ideas: ['substitute', 'choose-var'], level: 'advanced', prompt: 'One with a fraction: x − 2y = 1 and 4x + 2y = 9. Solve by substitution.', hints: H('Isolate x in equation 1: x = 2y + 1.', '4(2y + 1) + 2y = 9 → 10y = 5.', 'y = 1/2; x = 2(1/2) + 1.'), solution: `y = 1/2, x = 2: ${pointText(CS3S.x, CS3S.y)}. (Type 0.5 or 1/2.)` }),
  'flc-sys1': lineQ('x + y = 20', { ideas: ['model'], level: 'intermediate', prompt: 'The fleet challenge: a company stocks 20 bikes, trail bikes (x) at $50 a day and freeride bikes (y) at $80. Revenue is $1,240 if every bike is rented. Write the fleet equation.', hints: H('Count the bikes.', 'x + y = …', '20.') }),
  'flc-sys2': lineQ('50x + 80y = 1240', { ideas: ['model'], level: 'intermediate', prompt: 'And the revenue equation.', traps: [{ eq: '80x + 50y = 1240', code: 'var-mixup', message: 'x is trail bikes at $50.' }], hints: H('$50 for each trail bike.', '$80 for each freeride bike.', 'Total $1,240.') }),
  'flc-sol': pair(F2S.x, F2S.y, { ideas: ['substitute'], level: 'advanced', labels: ['Trail bikes x', 'Freeride bikes y'], prompt: 'Choose a variable, substitute and solve.', hints: H('x = 20 − y.', '50(20 − y) + 80y = 1240 → 30y = 240.', 'y = 8.'), solution: '30y = 240, y = 8, x = 12: 12 trail bikes and 8 freeride bikes.' }),
  'flc-verify': { type: 'fields', ideas: ['verify'], level: 'intermediate', prompt: 'Verify your fleet in both equations.', fields: [{ id: 'e1', label: '12 + 8 =', answer: 20 }, { id: 'e2', label: '50(12) + 80(8) =', unit: '$', answer: 1240, traps: [{ value: 600, code: 'one-equation', message: 'Add the freeride revenue too.' }] }],
    hints: H('Substitute both values.', '50 × 12 = 600; 80 × 8 = 640.', 'Add them.'), solution: '20 ✓ and 600 + 640 = 1240 ✓.' }
};
// [total, trail rate, downhill rate, revenue] with whole-number answers.
export const FLEET_PRACTICE = [[16, 40, 70, 850], [24, 55, 85, 1620], [15, 45, 75, 885], [22, 50, 90, 1500], [20, 35, 60, 950], [26, 45, 70, 1520]];
export const FLEET_PRACTICE_IDS = ['flx-iso', 'flx-sol'];
export function fleetPractice(n) {
  const [t, a, b, r] = pick(FLEET_PRACTICE, n), R = solve(E(1, 1, t), E(a, b, r));
  return tidy({ brief: `Fleet ${n + 1}: ${t} bikes; trail bikes (x) rent for $${a}, downhill bikes (y) for $${b}; target $${r.toLocaleString('en-US')} a day.`,
    'flx-iso': exprQ('x =', `${t} - y`, ['y'], { ideas: ['substitute', 'choose-var'], level: 'intermediate', prompt: `Write x in terms of y from x + y = ${t}.`, traps: [{ expr: `y - ${t}`, code: 'isolate-error', message: 'Subtract y from both sides.' }], hints: H('Get x alone.', 'Subtract y.', `x = ${t} − y.`), solution: `x = ${t} − y.` }),
    'flx-sol': pair(R.x, R.y, { ideas: ['substitute', 'verify'], level: 'advanced', labels: ['Trail bikes x', 'Downhill bikes y'], prompt: 'Solve for the fleet.', hints: H(`${a}(${t} − y) + ${b}y = ${r}.`, `${b - a}y = ${r - a * t}.`, 'Then x = total − y.'), solution: `y = ${S(R.y)}, x = ${S(R.x)}. Check: ${S(R.x)} + ${S(R.y)} = ${t} ✓ and ${a}(${S(R.x)}) + ${b}(${S(R.y)}) = ${r} ✓.` }) });
}

// ================================================================ Stage 03: Stock the Workshop (elimination)
const IS = solve(INVOICES.e1, INVOICES.e2), OS = solve(ORDERS.e1, ORDERS.e2);
const ME = { one: { e1: E(5, 2, 34), e2: E(3, -2, 6) }, two: { e1: E(-3, 1, -4), e2: E(2, 1, 11) }, three: { e1: E(-2, 1, 1), e2: E(1, 1, 7) }, four: { e1: E(-2, 5, 1), e2: E(2, 3, 7) } };
const MES = Object.fromEntries(Object.entries(ME).map(([k, v]) => [k, solve(v.e1, v.e2)]));
const coefFields = (e, o) => ({ type: 'fields', ideas: ['scale', 'eliminate'], level: o.level || 'intermediate', prompt: o.prompt,
  fields: [{ id: 'a', label: 'x-coefficient', answer: N(e.a) }, { id: 'b', label: 'y-coefficient', answer: N(e.b) }, { id: 'c', label: 'Right side', answer: N(e.c), traps: o.cTraps || [] }], hints: o.hints, solution: o.solution || eqText(e) + '.' });
const M3 = {
  'ws-eq-a': lineQ('2x + 3y = 310', { ideas: ['model', 'eliminate'], level: 'beginner', prompt: 'Invoice A: 2 tubeless service kits (x each) and 3 brake pad pairs (y each), total $310. Write its equation.', traps: [{ eq: '3x + 2y = 310', code: 'var-mixup', message: 'x is the kit price: 2 kits make 2x.' }], hints: H('2 kits cost 2x.', '3 pad pairs cost 3y.', 'The total is 310.') }),
  'ws-eq-b': lineQ('4x + 3y = 470', { ideas: ['model', 'eliminate'], level: 'beginner', prompt: 'Invoice B: 4 kits and 3 pad pairs, total $470.', traps: [{ eq: '3x + 4y = 470', code: 'var-mixup', message: '4 kits: 4x.' }], hints: H('4 kits: 4x.', '3 pad pairs: 3y.', 'Total 470.') }),
  'ws-op': choice('Both invoices have 3y. What happens if you subtract Invoice A from Invoice B?', 'The 3y terms cancel, leaving 2x = 160', [['The x terms cancel', 'sign-subtract', '4x − 2x = 2x: x stays. It’s the 3y terms that match.'], ['Nothing cancels', 'unaligned-add', 'Matching coefficients cancel when you subtract.'], ['You get 6x + 6y = 780', 'unaligned-add', 'That’s adding them: the matching terms only cancel if you subtract.']],
    { ideas: ['eliminate'], level: 'beginner', hints: H('Which terms are identical?', '3y − 3y = 0.', '4x − 2x and 470 − 310.') }),
  'ws-sub': choice('Write out (4x + 3y = 470) − (2x + 3y = 310).', '2x = 160', [['2x + 6y = 160', 'sign-subtract', 'Subtract every term: 3y − 3y = 0, not 6y.'], ['6x + 6y = 780', 'unaligned-add', 'That’s adding.'], ['2x = 780', 'sign-subtract', 'Subtract the right sides too: 470 − 310.']],
    { ideas: ['eliminate'], level: 'intermediate', hints: H('Subtract term by term.', '4x − 2x, 3y − 3y, 470 − 310.', '2x = 160.') }),
  'ws-x': num(IS.x, { ideas: ['eliminate'], level: 'beginner', label: 'x', unit: '$ per kit', prompt: 'So what does one tubeless service kit cost?', traps: [{ value: 160, code: 'arithmetic', message: 'Divide by 2: 2x = 160.' }, { value: 50, code: 'swap-xy', message: 'That’s the brake pad price, y.' }], hints: H('2x = 160.', 'Divide by 2.', 'x = 80.'), solution: 'x = $80.' }),
  'ws-y': num(IS.y, { ideas: ['eliminate'], level: 'intermediate', label: 'y', unit: '$ per pair', prompt: 'Substitute into Invoice A: 2(80) + 3y = 310. Brake pad pair price?', traps: [{ value: 150, code: 'arithmetic', message: '3y = 150; divide by 3.' }, { value: 80, code: 'swap-xy', message: 'That’s x.' }], hints: H('160 + 3y = 310.', '3y = 150.', 'y = 50.'), solution: 'y = $50.' }),
  'ws-check': { type: 'fields', ideas: ['verify'], level: 'beginner', prompt: 'Verify both invoices with x = 80 and y = 50.', fields: [{ id: 'a', label: '2(80) + 3(50) =', unit: '$', answer: 310 }, { id: 'b', label: '4(80) + 3(50) =', unit: '$', answer: 470, traps: [{ value: 310, code: 'one-equation', message: 'That’s Invoice A again: Invoice B has 4 kits.' }] }],
    hints: H('Substitute into each invoice.', 'A: 160 + 150.', 'B: 320 + 150.'), solution: '310 ✓ and 470 ✓: both invoices match.' },
  'mm-add': choice('New orders: 3x + 2y = 260 and 2x + 3y = 240. What happens if you just add them?', '5x + 5y = 500: neither variable disappears', [['The y terms cancel', 'unaligned-add', '2y + 3y = 5y: they only cancel if they’re opposites.'], ['You get x = 100', 'unaligned-add', 'Adding leaves both variables.']],
    { ideas: ['eliminate', 'scale'], level: 'intermediate', hints: H('Add term by term.', '3x + 2x; 2y + 3y.', 'Nothing is zero.') }),
  'mm-plan': choice('Which plan eliminates y?', 'Multiply equation 1 by 3 and equation 2 by −2, then add', [['Multiply equation 1 by 3, then add', 'unaligned-add', '6y + 3y still doesn’t cancel: both equations need scaling.'], ['Multiply only the left of equation 1 by 3: 9x + 6y = 260', 'one-side-scale', 'Multiply every term, both sides: 9x + 6y = 780.'], ['Multiply both by 2, then add', 'unaligned-add', '4y + 6y = 10y: no cancelling.']],
    { ideas: ['scale'], level: 'intermediate', hints: H('Make the y coefficients opposites.', '2 and 3 → 6 and −6.', '×3 and ×−2.') }),
  'mm-s1': coefFields(scale(ORDERS.e1, 3), { prompt: 'Multiply every term of 3x + 2y = 260 by 3.', cTraps: [{ value: 260, code: 'one-side-scale', message: 'Multiply the right side too: 260 × 3.' }], hints: H('Every term × 3.', '3x → 9x, 2y → 6y.', '260 × 3 = 780.') }),
  'mm-s2': coefFields(scale(ORDERS.e2, -2), { prompt: 'Multiply every term of 2x + 3y = 240 by −2.', cTraps: [{ value: 480, code: 'sign', message: '240 × −2 is negative.' }, { value: 240, code: 'one-side-scale', message: 'Multiply the right side too.' }], hints: H('Every term × −2.', '2x → −4x, 3y → −6y.', '240 × −2.') }),
  'mm-x': num(OS.x, { ideas: ['eliminate', 'scale'], level: 'intermediate', label: 'x', unit: '$', prompt: 'Add them: 9x + 6y = 780 and −4x − 6y = −480. Find x.', traps: [{ value: 300, code: 'arithmetic', message: '5x = 300: divide by 5.' }, { value: 252, code: 'sign-subtract', message: 'Adding: 780 + (−480) = 300.' }], hints: H('The y terms cancel.', '5x = 300.', 'x = 60.'), solution: '5x = 300, so x = 60.' }),
  'mm-y': num(OS.y, { ideas: ['eliminate'], level: 'intermediate', label: 'y', unit: '$', prompt: 'Substitute back: 3(60) + 2y = 260. Find y.', traps: [{ value: 80, code: 'arithmetic', message: '2y = 80: divide by 2.' }], hints: H('180 + 2y = 260.', '2y = 80.', 'y = 40.'), solution: 'y = 40. Check: 2(60) + 3(40) = 240 ✓.' }),
  'me-1': choice('System 1: 5x + 2y = 34 and 3x − 2y = 6. Most efficient method?', 'Elimination: add them, the y terms are already opposites', [['Substitution', 'inefficient-choice', 'It works, but isolating any variable gives fractions.'], ['Graphing', 'inefficient-choice', 'The answer has a decimal, which is hard to read from a graph.']], { ideas: ['method'], level: 'intermediate', hints: H('Look at the y terms.', '+2y and −2y.', 'Add.') }),
  'me-1s': pair(MES.one.x, MES.one.y, { ideas: ['eliminate'], level: 'intermediate', prompt: 'Solve System 1.', hints: H('Add: 8x = 40.', 'x = 5.', '5(5) + 2y = 34.'), solution: `8x = 40, x = 5, y = 4.5: ${pointText(MES.one.x, MES.one.y)}.` }),
  'me-2': choice('System 2: y = 3x − 4 and 2x + y = 11.', 'Substitution: y is already isolated', [['Elimination', 'inefficient-choice', 'Possible after rearranging, but y is already alone.'], ['Graphing', 'inefficient-choice', 'Possible, but substitution is quicker and exact.']], { ideas: ['method', 'choose-var'], level: 'beginner', hints: H('Is a variable already alone?', 'y = 3x − 4.', 'Substitute.') }),
  'me-2s': pair(MES.two.x, MES.two.y, { ideas: ['substitute'], level: 'intermediate', prompt: 'Solve System 2.', hints: H('2x + (3x − 4) = 11.', '5x = 15.', 'x = 3; y = 3(3) − 4.'), solution: `${pointText(MES.two.x, MES.two.y)}.` }),
  'me-3': choice('System 3: y = 2x + 1 and y = −x + 7, both easy to graph with a whole-number crossing.', 'Graphing or substitution: both are already in y = form', [['Elimination only', 'inefficient-choice', 'It works, but both are ready to graph or set equal.'], ['None: it has no solution', 'always-solution', 'Slopes 2 and −1 differ, so they cross once.']], { ideas: ['method', 'graph-solve'], level: 'beginner', hints: H('Both start with y =.', 'Set them equal, or graph them.', 'Either is quick.') }),
  'me-3s': { type: 'plot', ideas: ['graph-solve'], level: 'intermediate', prompt: 'Place the intersection of y = 2x + 1 and y = −x + 7.', grid: { x: [0, 8], y: [0, 10], sx: 1, sy: 1, profile: true, xLabel: 'x', yLabel: 'y', map: false, lines: [slopeLine(2, 1, { x: [0, 8], y: [0, 10] }, 'is-a', ''), slopeLine(-1, 7, { x: [0, 8], y: [0, 10] }, 'is-b', '')] },
    targets: [{ x: N(MES.three.x), y: N(MES.three.y), name: pointText(MES.three.x, MES.three.y) }], hints: H('Where do they cross?', '2x + 1 = −x + 7.', '3x = 6.'), solution: `${pointText(MES.three.x, MES.three.y)}.` },
  'me-4': choice('System 4: −2x + 5y = 1 and 2x + 3y = 7.', 'Elimination: add, the x terms are opposites', [['Substitution', 'inefficient-choice', 'No variable has a coefficient of 1.'], ['Graphing', 'inefficient-choice', 'Neither is in y = form.']], { ideas: ['method'], level: 'intermediate', hints: H('Look at the x terms.', '−2x and +2x.', 'Add.') }),
  'me-4s': pair(MES.four.x, MES.four.y, { ideas: ['eliminate'], level: 'intermediate', prompt: 'Solve System 4.', hints: H('Add: 8y = 8.', 'y = 1.', '2x + 3 = 7.'), solution: `${pointText(MES.four.x, MES.four.y)}.` })
};
// [a1, b1, a2, b2, x, y]: invoices with mismatched coefficients and whole-number prices.
export const WORKSHOP_PRACTICE = [[2, 5, 3, 2, 30, 12], [4, 3, 2, 5, 45, 20], [3, 4, 5, 2, 24, 15], [5, 2, 3, 4, 18, 35], [2, 3, 5, 4, 40, 25], [6, 5, 4, 3, 15, 22]];
export const WORKSHOP_PRACTICE_IDS = ['wsx-plan', 'wsx-sol'];
export function workshopPractice(n) {
  const [a1, b1, a2, b2, x, y] = pick(WORKSHOP_PRACTICE, n), e1 = E(a1, b1, a1 * x + b1 * y), e2 = E(a2, b2, a2 * x + b2 * y), [k1, k2] = multipliersFor(e1, e2, 'y');
  const R = solve(e1, e2);
  return tidy({ brief: `Service orders ${n + 1}: ${eqText(e1)} and ${eqText(e2)} (x = one grip set, y = one chain).`,
    'wsx-plan': choice('Which multipliers eliminate y?', `Equation 1 × ${k1} and equation 2 × ${k2}, then add`, [[`Equation 1 × ${b2} and equation 2 × ${b1}, then add`, 'unaligned-add', 'Both y terms become positive: adding doubles them instead of cancelling.'], [`Equation 1 × ${k1} only, then add`, 'unaligned-add', 'Both equations need scaling to make opposites.']],
      { ideas: ['scale'], level: 'intermediate', hints: H('Make the y coefficients opposites.', `${b1} and ${b2} → ${b1 * k1} and ${b2 * k2}.`, 'One multiplier must be negative.') }),
    'wsx-sol': pair(R.x, R.y, { ideas: ['eliminate', 'verify'], level: 'advanced', labels: ['Grip set x', 'Chain y'], units: ['$', '$'], prompt: 'Find both prices.', hints: H('Scale and add to remove y.', 'Solve for x.', 'Substitute back for y.'), solution: `x = $${x}, y = $${y}. Check: ${a1}(${x}) + ${b1}(${y}) = ${N(e1.c)} ✓ and ${a2}(${x}) + ${b2}(${y}) = ${N(e2.c)} ✓.` }) });
}

// ================================================================ Stage 04: Run the Mountain (applications)
const MX = mixture(MIX), MX2 = mixture({ total: 10, target: 75, pa: 90, pb: 40 }), CR = rateMeet(CREWS.a, CREWS.b), BE2 = breakEven({ fee: 50, rate: 3 }, { fee: 20, rate: 6 });
const OPA = solve(E(5, 2, 110), E(3, 2, 86)), OPB = solve(E(1, 1, 24), E(110, 65, 2010)), OPC = rateMeet({ start: 450, rate: 90 }, { start: 0, rate: 140 });
const M4 = {
  'mx-eq1': lineQ('x + y = 10', { ideas: ['mixture', 'model'], level: 'beginner', prompt: 'The crew needs 10 cubic yards of surface mix. x = cubic yards from Stockpile A (90% clay), y = from Stockpile B (50% clay). Write the total-volume equation.', traps: [{ eq: 'x + y = 7', code: 'quantity-concentration', message: 'This one totals all the material (10 yd³), not just the clay.' }, { eq: 'x + y = 70', code: 'quantity-concentration', message: '70 is the percentage of clay, not the volume.' }], hints: H('How much material in total?', 'A plus B.', '10 cubic yards.') }),
  'mx-clay': num(7, { ideas: ['mixture'], level: 'beginner', label: 'Clay needed', unit: 'yd³', prompt: 'The target is 70% clay. How many cubic yards of clay must the 10 yd³ contain?', traps: [{ value: 70, code: 'quantity-concentration', message: '70 is the percent; the clay volume is 70% of 10.' }, { value: 0.7, code: 'quantity-concentration', message: 'That’s the concentration as a decimal; multiply by the 10 yd³.' }, { value: 3, code: 'quantity-concentration', message: 'That’s the sand.' }],
    hints: H('70% of 10.', '0.70 × 10.', '7.'), solution: '0.70 × 10 = 7 yd³ of clay.' }),
  'mx-eq2': lineQ('0.9x + 0.5y = 7', { ideas: ['mixture', 'model'], level: 'intermediate', prompt: 'Write the clay equation: A is 90% clay, B is 50% clay.', traps: [{ eq: '0.9x + 0.5y = 70', code: 'quantity-concentration', message: 'The right side is the clay volume, 7 yd³, not the percentage.' }, { eq: '90x + 50y = 7', code: 'quantity-concentration', message: 'Use the percentages as decimals: 0.90 and 0.50.' }, { eq: '0.5x + 0.9y = 7', code: 'var-mixup', message: 'x is from Stockpile A, the 90% pile.' }],
    hints: H('Clay from A: 0.90x.', 'Clay from B: 0.50y.', 'Together: 7.') }),
  'mx-sol': pair(MX.x, MX.y, { ideas: ['mixture', 'substitute'], level: 'intermediate', labels: ['From A (x)', 'From B (y)'], units: ['yd³', 'yd³'], prompt: 'Solve the mixture system.', hints: H('y = 10 − x.', '0.9x + 0.5(10 − x) = 7 → 0.4x = 2.', 'x = 5.'), solution: '0.4x = 2, x = 5, y = 5: five yd³ from each pile.' }),
  'mx-check': { type: 'fields', ideas: ['verify', 'mixture'], level: 'beginner', prompt: 'Check the blend: 5 yd³ of A and 5 yd³ of B.', fields: [{ id: 'clay', label: 'Clay: 0.9(5) + 0.5(5) =', unit: 'yd³', answer: 7 }, { id: 'pct', label: 'Clay percentage', unit: '%', answer: 70, traps: [{ value: 7, code: 'quantity-concentration', message: '7 yd³ is the quantity; as a percentage of 10 yd³ it’s 70%.' }] }],
    hints: H('4.5 + 2.5.', '7 out of 10.', '70%.'), solution: '7 yd³ of clay, 7 ÷ 10 = 70% clay and 30% sand ✓.' },
  'mx-2': pair(MX2.x, MX2.y, { ideas: ['mixture'], level: 'advanced', labels: ['From A (x)', 'From C (y)'], units: ['yd³', 'yd³'], prompt: 'A berm needs 10 yd³ at 75% clay, from Stockpile A (90%) and Stockpile C (40%). How much of each?', hints: H('x + y = 10; 0.9x + 0.4y = 7.5.', '0.9x + 0.4(10 − x) = 7.5.', '0.5x = 3.5.'), solution: '0.5x = 3.5, x = 7, y = 3. Check: 6.3 + 1.2 = 7.5 ✓.' }),
  'cr-a': exprQ('D =', '300 + 120t', ['t'], { ideas: ['rate', 'model'], level: 'beginner', prompt: 'Crew A has built 300 ft and adds a modeled 120 ft a day. Write its total D after t days.', traps: [{ expr: '120 + 300t', code: 'rate-time', message: 'The rate (120 ft a day) multiplies t; the 300 ft is the head start.' }], hints: H('Start: 300.', 'Per day: 120.', 'D = 300 + 120t.'), solution: 'D = 300 + 120t.' }),
  'cr-b': exprQ('D =', '160t', ['t'], { ideas: ['rate', 'model'], level: 'beginner', prompt: 'Crew B starts from zero and builds 160 ft a day.', hints: H('Start: 0.', 'Per day: 160.', 'D = 160t.'), solution: 'D = 160t.' }),
  'cr-t': num(CR.t, { ideas: ['rate'], level: 'intermediate', label: 't', unit: 'days', prompt: 'When does Crew B catch up? Solve 300 + 120t = 160t.', traps: [{ value: 1200, code: 'rate-time', message: '1200 is the distance in feet. The question asks for the time.' }, { value: 40, code: 'rate-time', message: '40 ft a day is how fast B gains. Divide the 300 ft lead by it.' }, { value: 2.5, code: 'rate-time', message: '300 ÷ 120 is how long A took for its lead, not the catch-up time.' }],
    hints: H('Subtract 120t from both sides.', '300 = 40t.', 't = 300 ÷ 40.'), solution: '300 = 40t, so t = 7.5 days.' }),
  'cr-d': num(CR.D, { ideas: ['rate'], level: 'intermediate', label: 'D', unit: 'ft', prompt: 'How much trail has each crew completed then?', traps: [{ value: 7.5, code: 'rate-time', message: 'That’s the time. Substitute it to get the distance.' }, { value: 1500, code: 'arithmetic', message: '160 × 7.5 = 1200.' }], hints: H('Substitute t = 7.5.', '160(7.5).', 'Check: 300 + 120(7.5).'), solution: 'D = 160(7.5) = 1200 ft, and 300 + 900 = 1200 ✓.' }),
  'cr-mean': choice('What does (7.5, 1200) mean?', 'Halfway through day 8, both crews have completed 1,200 ft: Crew B has caught up', [['Crew B builds 1,200 ft a day', 'rate-time', '1,200 ft is a total, not a rate.'], ['They finish the trail on day 7.5', 'no-interpret', 'It’s where they’re level, not the end of the project.'], ['7.5 ft after 1,200 days', 'swap-xy', 't comes first: days, then feet.']], { ideas: ['rate', 'interpret'], hints: H('t is days, D is feet.', 'What is equal there?', 'B started behind.') }),
  'cr-mph': num(2, { ideas: ['rate'], level: 'advanced', label: 't', unit: 'hours', prompt: 'A shuttle-day challenge: Rider A starts 6 miles up the fire road climbing at 12 mph (on a flat model); Rider B starts at the bottom at 15 mph. When does B catch A?', traps: [{ value: 30, code: 'rate-time', message: '30 miles is where they meet; the question asks for hours.' }, { value: 3, code: 'rate-time', message: '3 mph is the gap in speed. Divide the 6-mile lead by it.' }, { value: 0.5, code: 'rate-time', message: 'Divide the distance by the speed difference: 6 ÷ 3.' }],
    hints: H('A: d = 6 + 12t. B: d = 15t.', '6 + 12t = 15t.', '6 = 3t.'), solution: '6 = 3t, t = 2 hours (both at 30 miles).' }),
  'be-1': pair(BE.r, BE.C, { ideas: ['break-even'], level: 'beginner', labels: ['Rides r', 'Cost C'], units: ['rides', '$'], prompt: 'Back to the shuttle: C = 12 + 8r and C = 36 + 4r. Break-even?', hints: H('12 + 8r = 36 + 4r.', '4r = 24.', 'C = 12 + 8(6).'), solution: 'r = 6, C = 60.' }),
  'be-hi': pair(BE2.r, BE2.C, { ideas: ['break-even'], level: 'intermediate', labels: ['Rides r', 'Cost C'], units: ['rides', '$'], prompt: 'Season Lite: $50 + $3 a ride. Day Saver: $20 + $6 a ride. Break-even?', hints: H('50 + 3r = 20 + 6r.', '30 = 3r.', 'C = 50 + 3(10).'), solution: 'r = 10, C = 80.' }),
  'be-which': choice('A rider expects 15 rides. Season Lite or Day Saver?', 'Season Lite: $95 vs $110', [['Day Saver: $110 vs $95', 'no-interpret', 'Past the 10-ride break-even, the lower per-ride rate wins.'], ['Either: they’re equal', 'always-solution', 'Only at 10 rides.']], { ideas: ['break-even', 'interpret'], hints: H('15 is above the break-even.', 'Lite: 50 + 45. Saver: 20 + 90.', 'Smaller total.') }),
  'be-same-rate': choice('Explorer pass: $25 + $5 a ride. Weekend pass: $40 + $5 a ride. Break-even?', 'None: same rate, so the Explorer pass is always $15 cheaper', [['At 3 rides', 'always-solution', '25 + 15 = 40 but 40 + 15 = 55.'], ['Every ride count', 'none-vs-infinite', 'They start $15 apart.']], { ideas: ['break-even', 'num-solutions'], hints: H('Compare the rates.', 'Same slope.', 'Different starts.') }),
  'be-same-model': choice('Two brochures: C = 5(r + 4) and C = 20 + 5r. Break-even?', 'Every ride count: they’re the same pricing model', [['None: they’re parallel', 'none-vs-infinite', '5(r + 4) = 5r + 20: same slope and the same start.'], ['At 4 rides only', 'always-solution', 'They’re equal at every r.']], { ideas: ['break-even', 'num-solutions'], level: 'advanced', hints: H('Distribute 5(r + 4).', '5r + 20.', 'Same line.') }),
  'op-a-vars': choice('Operations challenge A: the shop sells 5 grip sets and 2 chains for $110, and 3 grip sets and 2 chains for $86. What should x and y stand for?', 'x = price of one grip set, y = price of one chain', [['x = number of grip sets, y = number of chains', 'var-mixup', 'The numbers of items are given: the unknowns are the prices.'], ['x = $110, y = $86', 'var-mixup', 'Those are the totals.']], { ideas: ['model'], level: 'intermediate', hints: H('What don’t you know?', 'The counts are given.', 'The unit prices.') }),
  'op-a-method': choice('Equations: 5x + 2y = 110 and 3x + 2y = 86. Best method?', 'Elimination: subtract, the 2y terms match', [['Substitution', 'inefficient-choice', 'Works, but isolating gives fractions.'], ['Graphing', 'inefficient-choice', 'The prices are hard to read precisely from a graph.']], { ideas: ['method'], level: 'intermediate', hints: H('Compare the y terms.', 'Both 2y.', 'Subtract.') }),
  'op-a-sol': pair(OPA.x, OPA.y, { ideas: ['eliminate', 'model'], level: 'intermediate', labels: ['Grip set x', 'Chain y'], units: ['$', '$'], prompt: 'Solve challenge A.', hints: H('Subtract: 2x = 24.', 'x = 12.', '5(12) + 2y = 110.'), solution: `x = $12, y = $25. Check: 60 + 50 = 110 ✓, 36 + 50 = 86 ✓.` }),
  'op-b-sys': choice('Challenge B: 24 rental bikes, e-bikes (x) at $110 a day and pedal bikes (y) at $65; $2,010 a day when all are rented. Which system?', 'x + y = 24 and 110x + 65y = 2010', [['x + y = 2010 and 110x + 65y = 24', 'var-mixup', 'The count equation totals bikes; the money equation totals dollars.'], ['110x + 65y = 24', 'one-equation', 'Two unknowns need two equations.'], ['x + y = 24 and 65x + 110y = 2010', 'var-mixup', 'x is the e-bikes, at $110.']], { ideas: ['model'], level: 'intermediate', hints: H('One equation counts bikes.', 'One counts dollars.', 'Match each rate to its bike.') }),
  'op-b-sol': pair(OPB.x, OPB.y, { ideas: ['substitute', 'model'], level: 'advanced', labels: ['E-bikes x', 'Pedal bikes y'], prompt: 'Solve challenge B.', hints: H('y = 24 − x.', '110x + 65(24 − x) = 2010 → 45x = 450.', 'x = 10.'), solution: 'x = 10 e-bikes, y = 14 pedal bikes. Check: 1100 + 910 = 2010 ✓.' }),
  'op-c-sol': pair(OPC.t, OPC.D, { ideas: ['rate', 'model'], level: 'advanced', labels: ['Days t', 'Feet D'], units: ['days', 'ft'], prompt: 'Challenge C: Crew X has 450 ft built and adds 90 ft a day; Crew Y starts at 0 and builds 140 ft a day. When are they level, and at what total?', hints: H('450 + 90t = 140t.', '450 = 50t.', 't = 9; D = 140(9).'), solution: 't = 9 days, D = 1,260 ft.' }),
  'op-d-check': choice('Challenge D: someone claims the mix is 6 yd³ of A (90% clay) and 4 yd³ of B (50% clay) for 10 yd³ at 70% clay. Do both conditions hold?', 'No: the total is 10 yd³, but the clay is 7.4 yd³ (74%), not 7', [['Yes: 6 + 4 = 10', 'one-equation', 'That’s only the volume equation. Check the clay: 0.9(6) + 0.5(4) = 7.4.'], ['Yes: close enough to 70%', 'no-verify', 'Both equations must be exactly true.']], { ideas: ['verify', 'mixture'], level: 'intermediate', hints: H('Check the total.', 'Check the clay.', '5.4 + 2.0.') })
};
// Mixtures [total, target %, A %, B %] and rates [head start, rate A, rate B], whole or tidy answers.
export const MOUNTAIN_PRACTICE = [[[8, 60, 80, 40], [200, 100, 150]], [[10, 62, 80, 50], [450, 80, 130]], [[15, 74, 90, 50], [360, 90, 150]], [[20, 55, 70, 40], [240, 110, 170]], [[12, 70, 85, 60], [500, 75, 125]], [[10, 66, 90, 50], [150, 140, 200]]];
export const MOUNTAIN_PRACTICE_IDS = ['mtx-mix', 'mtx-rate'];
export function mountainPractice(n) {
  const [[total, target, pa, pb], [h, ra, rb]] = pick(MOUNTAIN_PRACTICE, n), M = mixture({ total, target, pa, pb }), R = rateMeet({ start: h, rate: ra }, { start: 0, rate: rb });
  return tidy({ brief: `Operations day ${n + 1}: a soil order and a crew schedule.`,
    'mtx-mix': pair(M.x, M.y, { ideas: ['mixture', 'model'], level: 'advanced', labels: ['From A (x)', 'From B (y)'], units: ['yd³', 'yd³'], prompt: `Mix ${total} yd³ at ${target}% clay from Stockpile A (${pa}% clay) and Stockpile B (${pb}% clay).`,
      hints: H(`x + y = ${total}.`, `${pa / 100}x + ${pb / 100}y = ${N(F(total).mul(target).div(100))}.`, `Substitute y = ${total} − x.`), solution: `x = ${S(M.x)} yd³, y = ${S(M.y)} yd³.` }),
    'mtx-rate': num(R.t, { ideas: ['rate'], level: 'advanced', label: 't', unit: 'days', prompt: `Crew A has ${h} ft built and adds ${ra} ft a day; Crew B starts at 0 and builds ${rb} ft a day. When does B catch up?`, traps: [{ value: N(R.D), code: 'rate-time', message: 'That’s the distance; the question asks for days.' }, { value: rb - ra, code: 'rate-time', message: 'That’s how fast B gains. Divide the head start by it.' }],
      hints: H(`${h} + ${ra}t = ${rb}t.`, `${h} = ${rb - ra}t.`, 'Divide.'), solution: `t = ${S(R.t)} days (both at ${S(R.D)} ft).` }) });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'shuttle', n: 1, title: 'The Uplift Showdown', short: 'Uplift Showdown', minutes: '10–13', focus: 'Graphing Systems', badge: 'Uplift Strategist', blurb: 'Compare two shuttle plans on a live pricing graph, find the break-even point, and meet systems with one, no or infinitely many solutions.', graded: Object.keys(M1) },
  { id: 'fleet', n: 2, title: 'Build the Rental Fleet', short: 'Rental Fleet', minutes: '9–12', focus: 'Substitution', badge: 'Fleet Manager', blurb: 'Stock the right mix of trail and downhill bikes by substitution, choose what to isolate, and check both conditions.', graded: Object.keys(M2) },
  { id: 'workshop', n: 3, title: 'Stock the Workshop', short: 'Stock the Workshop', minutes: '9–12', focus: 'Elimination', badge: 'Workshop Commander', blurb: 'Price parts from two invoices by elimination, scale equations to line up coefficients, and pick the best method.', graded: Object.keys(M3) },
  { id: 'mountain', n: 4, title: 'Run the Mountain', short: 'Run the Mountain', minutes: '11–14', focus: 'Applications of Systems', badge: 'Mountain Operations Director', blurb: 'Mix the trail surface, race two trail crews, and solve break-even and operations problems with any method.', graded: Object.keys(M4) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)) };

// ================================================================ Mountain Operations Certification
// Each round: two pricing plans (graphing), a solution-type pair, a substitution system with one
// easy variable, an elimination system and which equation to scale, an application, and a claim to verify.
export const FINAL_SETS = [
  { plans: [[10, 8], [40, 5]], type: ['y = 4x + 7', 'y = 4x - 3', 'none'], sub: [[1, 4, 18], [3, 5, 26], 'x1'], elim: [[4, 3, 37], [2, 5, 43], 2, -2], app: { kind: 'mixture', total: 10, target: 66, pa: 90, pb: 50 } },
  { plans: [[5, 10], [45, 5]], type: ['y = 3(x - 2)', 'y = 3x - 6', 'infinite'], sub: [[2, 3, 21], [4, 1, 17], 'y2'], elim: [[3, 4, 41], [5, -2, 25], 2, 2], app: { kind: 'rate', start: 240, ra: 100, rb: 160 } },
  { plans: [[25, 5], [55, 2]], type: ['y = 2x + 9', 'y = -x + 3', 'one'], sub: [[5, -2, 4], [1, -3, -7], 'x2'], elim: [[6, -5, 3], [3, 2, 15], 2, -2], app: { kind: 'breakeven', p: [30, 4], q: [12, 7] } },
  { plans: [[15, 10], [45, 5]], type: ['2x + y = 8', '4x + 2y = 10', 'none'], sub: [[3, 2, 16], [5, -1, 18], 'y2'], elim: [[2, 7, 47], [5, 3, 45], 1, 5], app: { kind: 'fleet', total: 25, ra: 45, rb: 95, revenue: 1625 } }
];
export const FINAL_IDS = ['fa-plot', 'fa-type', 'fa-interp', 'fb-choose', 'fb-sol', 'fc-scale', 'fc-sol', 'fd-model', 'fd-sol', 'fd-verify'];
export const PASS_MARK = 8;   // of 10, right without the solution shown
export const FINAL_GRID = { x: [0, 12], y: [0, 120], sx: 1, sy: 5, profile: true, rect: true, xLabel: 'Rides r', yLabel: 'Cost C ($)', map: false };
const ISO_TEXT = { x1: 'x in equation 1', y1: 'y in equation 1', x2: 'x in equation 2', y2: 'y in equation 2' };
export function finalQuestions(roundNo) {
  const X = pick(FINAL_SETS, roundNo - 1), [[f1, r1], [f2, r2]] = X.plans, p = { fee: f1, rate: r1 }, q = { fee: f2, rate: r2 }, BR = breakEven(p, q);
  const sE1 = E(...X.sub[0]), sE2 = E(...X.sub[1]), SR = solve(sE1, sE2), eE1 = E(...X.elim[0]), eE2 = E(...X.elim[1]), ER = solve(eE1, eE2), which = X.elim[2], k = X.elim[3], scaled = scale(which === 1 ? eE1 : eE2, k);
  const lo = Math.min(f1 + r1, f2 + r2), cheapAt = N(BR.r) - 2;
  const out = { set: X };
  out['fa-plot'] = { type: 'plot', ideas: ['graph-solve'], level: 'intermediate', prompt: `Plan P costs $${f1} + $${r1} a ride; Plan Q costs $${f2} + $${r2} a ride. Both are graphed: place their break-even point.`, grid: { ...FINAL_GRID, lines: sysFig(p, q, FINAL_GRID, { la: 'P', lb: 'Q' }).lines },
    targets: [{ x: N(BR.r), y: N(BR.C), name: pointText(BR.r, BR.C) }], hints: H('Find where the lines cross.', `${r1}r + ${f1} = ${r2}r + ${f2}.`, 'Then substitute for C.'), solution: `${pointText(BR.r, BR.C)}.` };
  out['fa-type'] = typeQ(`${X.type[0].replace(/-/g, '−')} and ${X.type[1].replace(/-/g, '−')}: how many solutions?`, X.type[2], { level: 'intermediate', solution: `${KIND_TEXT[X.type[2]]}.` });
  out['fa-interp'] = choice(`What does the break-even point ${pointText(BR.r, BR.C)} tell a rider?`, `At ${S(BR.r)} rides both plans cost $${S(BR.C)}; with fewer rides (say ${cheapAt}) Plan P is cheaper`, [[`${S(BR.r)} dollars buys ${S(BR.C)} rides`, 'swap-xy', 'Rides first, then dollars.'], [`With ${cheapAt} rides Plan Q is cheaper`, 'no-interpret', `Check: P costs $${f1 + r1 * cheapAt}, Q costs $${f2 + r2 * cheapAt}.`], ['Plan Q is always cheaper', 'no-interpret', 'Below the break-even, the lower fee wins.']], { ideas: ['interpret'], hints: H('What’s equal at the intersection?', 'Try a smaller ride count.', 'Compare both costs.') });
  out['fb-choose'] = { type: 'choice', keepOrder: true, ideas: ['choose-var'], level: 'intermediate', prompt: `To solve ${eqText(sE1)} and ${eqText(sE2)} by substitution, which variable is easiest to isolate?`,
    options: Object.entries(ISO_TEXT).map(([id, t]) => opt(id, t, id === X.sub[2], 'inefficient-choice', 'That one has a coefficient other than ±1, so you’d divide and get fractions.')), hints: H('Look for a coefficient of 1 or −1.', 'Check all four terms.', 'Isolate that one.'), solution: `${ISO_TEXT[X.sub[2]]}: its coefficient is ±1.` };
  out['fb-sol'] = pair(SR.x, SR.y, { ideas: ['substitute', 'verify'], level: 'advanced', prompt: 'Solve it.', hints: H('Isolate the easy variable.', 'Substitute, in brackets.', 'Back-substitute.'), solution: `${pointText(SR.x, SR.y)}. Check: ${S(sE1.a)}(${S(SR.x)}) + ${S(sE1.b)}(${S(SR.y)}) = ${S(sE1.c)} ✓ and ${S(sE2.a)}(${S(SR.x)}) + ${S(sE2.b)}(${S(SR.y)}) = ${S(sE2.c)} ✓.` });
  out['fc-scale'] = coefFields(scaled, { level: 'intermediate', prompt: `System: ${eqText(eE1)} and ${eqText(eE2)}. To eliminate a variable, multiply every term of equation ${which} by ${S(k)}. What do you get?`, cTraps: [{ value: N((which === 1 ? eE1 : eE2).c), code: 'one-side-scale', message: 'Multiply the right side too.' }, { value: -N(scaled.c), code: 'sign', message: 'Check the sign of the right side.' }], hints: H(`Multiply each coefficient by ${S(k)}.`, 'And the right side.', 'Signs matter.') });
  out['fc-sol'] = pair(ER.x, ER.y, { ideas: ['eliminate', 'verify'], level: 'advanced', prompt: 'Now solve the system.', hints: H('Add the scaled equation to the other one.', 'One variable cancels.', 'Substitute back.'), solution: `${pointText(ER.x, ER.y)}.` });
  const A_ = X.app;
  if (A_.kind === 'mixture') {
    const M = mixture(A_);
    out['fd-model'] = lineQ(`0.9x + 0.5y = ${N(F(A_.total).mul(A_.target).div(100))}`, { ideas: ['model', 'mixture'], level: 'intermediate', prompt: `A pump track needs ${A_.total} yd³ at ${A_.target}% clay, from Stockpile A (90%, x yd³) and B (50%, y yd³). Write the clay equation.`, traps: [{ eq: `0.9x + 0.5y = ${A_.target}`, code: 'quantity-concentration', message: 'The right side is the clay volume, not the percentage.' }], hints: H('Clay from each pile.', '0.9x and 0.5y.', `${A_.target}% of ${A_.total}.`) });
    out['fd-sol'] = pair(M.x, M.y, { ideas: ['mixture'], level: 'advanced', labels: ['From A (x)', 'From B (y)'], units: ['yd³', 'yd³'], prompt: 'Solve for both amounts.', hints: H(`x + y = ${A_.total}.`, `Substitute y = ${A_.total} − x.`, 'Solve for x.'), solution: `x = ${S(M.x)}, y = ${S(M.y)}.` });
  } else if (A_.kind === 'rate') {
    const R = rateMeet({ start: A_.start, rate: A_.ra }, { start: 0, rate: A_.rb });
    out['fd-model'] = lineQ(`d = ${A_.start} + ${A_.ra}t`, { x: 't', y: 'd', label: 'd =', ideas: ['model', 'rate'], level: 'intermediate', prompt: `Crew A has ${A_.start} ft built and adds ${A_.ra} ft a day. Write its total d after t days (as d = …).`, traps: [{ eq: `d = ${A_.ra} + ${A_.start}t`, code: 'rate-time', message: 'The daily rate multiplies t.' }], hints: H('Head start.', 'Plus rate × days.', `d = ${A_.start} + ${A_.ra}t.`) });
    out['fd-sol'] = pair(R.t, R.D, { ideas: ['rate'], level: 'advanced', labels: ['Days t', 'Feet d'], units: ['days', 'ft'], prompt: `Crew B starts at 0 and builds ${A_.rb} ft a day. When do the crews draw level, and at what total?`, hints: H(`${A_.start} + ${A_.ra}t = ${A_.rb}t.`, `${A_.start} = ${A_.rb - A_.ra}t.`, 'Substitute for d.'), solution: `t = ${S(R.t)} days, d = ${S(R.D)} ft.` });
  } else if (A_.kind === 'breakeven') {
    const R = breakEven({ fee: A_.p[0], rate: A_.p[1] }, { fee: A_.q[0], rate: A_.q[1] });
    out['fd-model'] = lineQ(`c = ${A_.p[0]} + ${A_.p[1]}r`, { x: 'r', y: 'c', label: 'C =', ideas: ['model', 'break-even'], level: 'intermediate', prompt: `The Ridge pass: $${A_.p[0]} plus $${A_.p[1]} a ride. Write its cost C for r rides (as C = …).`, traps: [{ eq: `c = ${A_.p[1]} + ${A_.p[0]}r`, code: 'rate-fee-swap', message: 'The per-ride rate multiplies r.' }], hints: H('Fee once.', 'Rate per ride.', `C = ${A_.p[0]} + ${A_.p[1]}r.`) });
    out['fd-sol'] = pair(R.r, R.C, { ideas: ['break-even'], level: 'advanced', labels: ['Rides r', 'Cost C'], units: ['rides', '$'], prompt: `The Valley pass is $${A_.q[0]} plus $${A_.q[1]} a ride. Break-even?`, hints: H('Set the costs equal.', 'Collect r.', 'Substitute for C.'), solution: `r = ${S(R.r)}, C = $${S(R.C)}.` });
  } else {
    const R = solve(E(1, 1, A_.total), E(A_.ra, A_.rb, A_.revenue));
    out['fd-model'] = lineQ(`${A_.ra}x + ${A_.rb}y = ${A_.revenue}`, { ideas: ['model'], level: 'intermediate', prompt: `A fleet of ${A_.total}: trail bikes (x) at $${A_.ra} a day, e-bikes (y) at $${A_.rb}; $${A_.revenue.toLocaleString('en-US')} a day when all are rented. Write the revenue equation.`, traps: [{ eq: `${A_.rb}x + ${A_.ra}y = ${A_.revenue}`, code: 'var-mixup', message: `x is trail bikes, at $${A_.ra}.` }], hints: H('Rate × count for each type.', 'Add them.', 'Equals the revenue.') });
    out['fd-sol'] = pair(R.x, R.y, { ideas: ['substitute', 'model'], level: 'advanced', labels: ['Trail bikes x', 'E-bikes y'], prompt: 'Solve for the fleet.', hints: H(`x + y = ${A_.total}.`, 'Substitute.', 'Solve.'), solution: `x = ${S(R.x)}, y = ${S(R.y)}.` });
  }
  // A claim that satisfies equation 1 of the substitution system but not equation 2.
  const cx = SR.x.add(sE1.b), cy = SR.y.sub(sE1.a), v2 = sE2.a.mul(cx).add(sE2.b.mul(cy));
  out['fd-verify'] = choice(`A colleague says ${pointText(cx, cy)} solves ${eqText(sE1)} and ${eqText(sE2)}. Are they right?`, `No: it works in equation 1, but equation 2 gives ${S(v2)}, not ${S(sE2.c)}`, [['Yes: it works in equation 1', 'one-equation', 'Check equation 2 as well.'], ['Yes: any point on one line is a solution', 'no-verify', 'A solution must be on both lines.']], { ideas: ['verify'], level: 'intermediate', hints: H('Substitute into equation 1.', 'Now equation 2.', 'Both must be true.') });
  return tidy(arrange(out));
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[SHUTTLE_PRACTICE, shuttlePractice, SHUTTLE_PRACTICE_IDS], [FLEET_PRACTICE, fleetPractice, FLEET_PRACTICE_IDS], [WORKSHOP_PRACTICE, workshopPractice, WORKSHOP_PRACTICE_IDS], [MOUNTAIN_PRACTICE, mountainPractice, MOUNTAIN_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const X = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...X[id].ideas])]; }
  return out;
}
export { money, check };
