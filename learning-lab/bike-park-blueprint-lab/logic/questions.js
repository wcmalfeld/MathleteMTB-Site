// Bike Park Blueprint Lab: every graded question. Answers are computed from
// the models (exact fractions in matrix.js), never typed in by hand. Each
// question has three progressive hints (direction, method, next step), a
// solution that says what the answer means for the park, and traps:
// anticipated wrong answers, each with a misconception code and a message.
//
// Question shape: the lesson kit's ask() (learning-lab/lesson-kit/ask.js).

import { CREW_EQ, MACHINE_EQ, DIAGNOSE, PARK, PLAN, INVENTORY, COST, SINGULAR, OPT, PRACTICE_2, PRACTICE_3, FINAL_SETS,
  solve2, solve3, costing, optimizer, eqText, augmented, A as Amat, pick, nf, classify } from './models.js';
import { mat, add, sub, scale, mul, det, rowOp, dimText, Frac } from './matrix.js';
export { nf };

const opt = (id, text, correct, code, feedback) => ({ id, text, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const num = M => M.map(r => r.map(Number));
const rowText = r => '[ ' + r.map(String).join('  ') + ' ]';
const augText = rows => rows.map(r => '[ ' + r.slice(0, -1).map(String).join('  ') + ' | ' + String(r[r.length - 1]) + ' ]').join('  ');
const money = x => '$' + Number(x).toLocaleString('en-US');

function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || !q.type) continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e6); const clash = Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, 1e-9); if (seen.has(k) || clash || !isFinite(t.value)) return false; seen.add(k); return true; });
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

export const IDEAS = {
  graphing: 'Solving systems by graphing',
  substitution: 'Solving systems by substitution',
  elimination: 'Solving systems by elimination',
  classify: 'Classifying systems (one, none, infinitely many)',
  'three-var': 'Solving three-variable systems',
  gaussian: 'Gaussian elimination (row operations)',
  augmented: 'Building augmented matrices',
  'add-sub': 'Matrix addition and subtraction',
  scalar: 'Scalar multiplication',
  multiply: 'Matrix multiplication',
  dimensions: 'Matrix dimensions',
  'matrix-equation': 'Matrix equations (AX = B)',
  inverse: 'Inverse matrices',
  applications: 'Real-world matrix applications',
  model: 'Writing a system from a situation',
  interpret: 'Interpreting solutions',
  verify: 'Checking solutions',
  optimize: 'Constraints and optimization'
};
// The PRD's fourteen tracked skills, in its order.
export const REPORT_IDEAS = ['graphing', 'substitution', 'elimination', 'classify', 'three-var', 'gaussian', 'augmented', 'add-sub', 'scalar', 'multiply', 'dimensions', 'matrix-equation', 'inverse', 'applications'];

export const MISCONCEPTIONS = {
  'one-equation': 'Solving only one equation instead of the whole system',
  'swap-xy': 'Swapping x and y',
  'bad-sub': 'Substituting incorrectly',
  'bad-elim': 'Eliminating incorrectly',
  sign: 'Losing a sign',
  'intersection-meaning': 'Misreading what the intersection means',
  'none-vs-infinite': 'Confusing no solution with infinitely many',
  'rows-cols': 'Confusing rows and columns',
  'wrong-dims': 'Misidentifying matrix dimensions',
  'add-mismatch': 'Adding matrices with different dimensions',
  'entrywise-mult': 'Multiplying matching entries instead of row by column',
  commute: 'Assuming matrix multiplication is commutative',
  'scalar-add': 'Adding the scalar instead of multiplying every entry',
  'partial-dot': 'Using only part of a row-by-column product',
  'every-inverse': 'Assuming every matrix has an inverse',
  'det-zero': 'Ignoring a zero determinant',
  'det-zero-none': 'Thinking det = 0 always means no solution',
  'no-check': 'Not checking the solution in every equation',
  'wrong-var': 'Solving for the wrong variable',
  'bad-row-op': 'An incorrect row operation',
  'divide-matrix': 'Trying to divide by a matrix',
  'not-viable': 'Accepting a plan that can’t be built (fractions or negatives)',
  'forgot-costs': 'Leaving out the costs',
  'forgot-quantities': 'Leaving out the quantities'
};

// ================================================================ Mission 1: The Trail Design Puzzle
const S0 = solve2(CREW_EQ, MACHINE_EQ), X0 = Number(S0.x), Y0 = Number(S0.y);
const M1 = {
  'm1-model': {
    type: 'choice', ideas: ['model'],
    prompt: 'Berms need 4 crew hours and 2 machine hours each; jumps need 3 crew hours and 1 machine hour. The crew has 17 crew hours and 7 machine hours. Which system describes using exactly all of it?',
    options: [
      opt('a', '4x + 3y = 17 and 2x + y = 7', true),
      opt('b', '4x + 2y = 17 and 3x + y = 7', false, 'rows-cols', 'Each equation is one resource. Crew hours: 4 per berm (x) and 3 per jump (y), so 4x + 3y = 17.'),
      opt('c', '4x + 3y = 17 only', false, 'one-equation', 'That covers crew hours, but the machine hours must work out too. A plan has to satisfy both.'),
      opt('d', '6x + 4y = 24', false, 'one-equation', 'Adding the resources together loses information: crew hours and machine hours are separate limits.')
    ],
    hints: ['Write one equation for each resource.', 'Crew hours used = 4 × berms + 3 × jumps.', 'Machine hours used = 2 × berms + 1 × jumps.'],
    solution: 'Crew hours: 4x + 3y = 17. Machine hours: 2x + y = 7. A build plan must satisfy both at once: that’s a system.'
  },
  'm1-graph': {
    type: 'fields', ideas: ['graphing'],
    prompt: 'Read the intersection of the two lines on the blueprint graph.',
    fields: [
      { id: 'x', label: 'x (berm modules)', answer: X0, tolerance: 0.001, traps: [{ value: Y0, code: 'swap-xy', message: 'That’s the y-value. x is across (berm modules).' }] },
      { id: 'y', label: 'y (jump features)', answer: Y0, tolerance: 0.001, traps: [{ value: X0, code: 'swap-xy', message: 'That’s the x-value. y is up (jump features).' }, { value: 7, code: 'one-equation', message: 'That’s where one line meets the y-axis, not where the lines cross.' }] }
    ],
    hints: ['Find where the two lines cross.', 'Read across for x, then up for y.', 'Check: does (x, y) work in both equations?'],
    solution: `The lines meet at (${X0}, ${Y0}): ${X0} berm modules and ${Y0} jump features.`
  },
  'm1-meaning': {
    type: 'choice', ideas: ['interpret', 'graphing'],
    prompt: `What does the intersection (${X0}, ${Y0}) tell the crew?`,
    options: [
      opt('a', `${X0} berms and ${Y0} jumps use exactly 17 crew hours and 7 machine hours`, true),
      opt('b', `They need ${X0} crew hours and ${Y0} machine hours`, false, 'intersection-meaning', `x and y count features, not hours: ${X0} berm modules and ${Y0} jump features.`),
      opt('c', 'It’s where crew hours equal machine hours', false, 'intersection-meaning', 'The two totals are 17 and 7; they’re never equal. The point is the plan that uses both exactly.'),
      opt('d', `${X0} berms and ${Y0} jumps use exactly the crew hours, but not the machine hours`, false, 'one-equation', 'The intersection is on both lines, so it satisfies both equations.')
    ],
    hints: ['What do x and y count?', 'A point on a line satisfies that line’s equation.', 'The intersection is on both lines.'],
    solution: 'The intersection is the one combination on both lines: it satisfies both resource equations at the same time.'
  },
  'm1-sub': {
    type: 'choice', ideas: ['substitution'],
    prompt: 'From 2x + y = 7, y = 7 − 2x. Substituting into 4x + 3y = 17 gives:',
    options: [
      opt('a', '4x + 3(7 − 2x) = 17', true),
      opt('b', '4x + 3 · 7 − 2x = 17', false, 'bad-sub', 'The 3 multiplies the whole expression for y: 3(7 − 2x) = 21 − 6x.'),
      opt('c', '4(7 − 2x) + 3y = 17', false, 'bad-sub', 'Replace y, the variable you solved for, not x.'),
      opt('d', '2x + (7 − 2x) = 7', false, 'bad-sub', 'Substituting back into the same equation just gives 7 = 7. Use the other equation.')
    ],
    hints: ['Replace y everywhere in the OTHER equation.', 'Keep the brackets: y becomes (7 − 2x).', '3y becomes 3(7 − 2x).'],
    solution: '4x + 3(7 − 2x) = 17 → 4x + 21 − 6x = 17 → −2x = −4. Substitution works because 7 − 2x and y are the same quantity.'
  },
  'm1-sub-x': {
    type: 'number', ideas: ['substitution'], answer: X0, tolerance: 0.001, label: 'x',
    prompt: 'Solve 4x + 21 − 6x = 17 for x.',
    traps: [{ value: -X0, code: 'sign', message: '−2x = −4: dividing two negatives gives a positive.' }, { value: 0.5, code: 'bad-sub', message: 'Divide −4 by −2, not −2 by −4.' }, { value: 19, code: 'sign', message: 'Move 21 across by subtracting: 4x − 6x = 17 − 21.' }],
    hints: ['Combine the x terms.', '4x − 6x = −2x, and 17 − 21 = −4.', '−2x = −4, so divide by −2.'],
    solution: `−2x = −4, so x = ${X0}. Then y = 7 − 2(${X0}) = ${Y0}.`
  },
  'm1-elim': {
    type: 'choice', ideas: ['elimination'],
    prompt: 'To eliminate y by adding the equations, multiply 2x + y = 7 by:',
    options: [
      opt('a', '−3, giving −6x − 3y = −21', true),
      opt('b', '3, giving 6x + 3y = 21', false, 'bad-elim', 'Adding 3y to 3y doubles it. You need −3y so y cancels when you add.'),
      opt('c', '2, giving 4x + 2y = 14', false, 'bad-elim', '2y doesn’t cancel 3y. Match the y-coefficient with the opposite sign: −3.'),
      opt('d', '−2, giving −4x − 2y = −14', false, 'wrong-var', 'That would cancel x (with 4x), not y. To remove y, make its coefficient −3.')
    ],
    hints: ['Elimination: make one variable’s coefficients opposites.', 'The first equation has +3y.', 'What makes the second equation’s y into −3y?'],
    solution: '−3 × (2x + y = 7) is −6x − 3y = −21. Adding to 4x + 3y = 17: −2x = −4, so x = 2. y is gone, so there’s one variable left.'
  },
  'm1-y': {
    type: 'number', ideas: ['elimination', 'substitution'], answer: Y0, tolerance: 0.001, label: 'y',
    prompt: `With x = ${X0}, find y from 2x + y = 7.`,
    traps: [{ value: 7 + 2 * X0, code: 'sign', message: 'Subtract: y = 7 − 2x.' }, { value: X0, code: 'wrong-var', message: 'That’s x. Put x into the equation and solve for y.' }],
    hints: ['Substitute x = 2.', '2(2) + y = 7.', 'y = 7 − 4.'],
    solution: `y = 7 − 2(${X0}) = ${Y0}.`
  },
  'm1-check': {
    type: 'fields', ideas: ['verify'],
    prompt: `Check (${X0}, ${Y0}) in both equations. How many crew hours and machine hours does that plan use?`,
    fields: [
      { id: 'crew', label: 'Crew hours 4x + 3y', answer: 4 * X0 + 3 * Y0, tolerance: 0.001, unit: 'h', traps: [{ value: 4 * Y0 + 3 * X0, code: 'swap-xy', message: 'Put x = 2 with the 4 and y = 3 with the 3.' }] },
      { id: 'machine', label: 'Machine hours 2x + y', answer: 2 * X0 + Y0, tolerance: 0.001, unit: 'h', traps: [{ value: 2 * Y0 + X0, code: 'swap-xy', message: 'x goes with the 2.' }] }
    ],
    hints: ['Substitute into each equation.', '4(2) + 3(3).', '2(2) + 3.'],
    solution: '4(2) + 3(3) = 17 and 2(2) + 3 = 7. Both totals match the crew’s resources: the plan checks.'
  },
  'm1-d1': {
    type: 'choice', ideas: ['classify'], keepOrder: true,
    prompt: 'Diagnose blueprint 1: 4x + 3y = 17 and 8x + 6y = 36.',
    options: [opt('one', 'One solution', false, 'none-vs-infinite', 'The left sides are multiples (8x + 6y is twice 4x + 3y): the lines have the same slope, so they can’t cross once.'),
      opt('none', 'No solution', true), opt('inf', 'Infinitely many solutions', false, 'none-vs-infinite', 'Halve the second: 4x + 3y = 18. The same left side can’t equal both 17 and 18: parallel lines, no solution.')],
    hints: ['Compare the two equations: is one a multiple of the other?', 'Halve the second equation.', '4x + 3y = 17 and 4x + 3y = 18. Can both be true?'],
    solution: 'Halving gives 4x + 3y = 18, which contradicts 4x + 3y = 17. The lines are parallel: no plan satisfies both. The requirements conflict.'
  },
  'm1-d2': {
    type: 'choice', ideas: ['classify'], keepOrder: true,
    prompt: 'Diagnose blueprint 2: 4x + 3y = 17 and 8x + 6y = 34.',
    options: [opt('one', 'One solution', false, 'none-vs-infinite', 'Halve the second: it’s exactly the first equation. Same line, every point shared.'),
      opt('none', 'No solution', false, 'none-vs-infinite', 'Halve the second: 4x + 3y = 17, the same equation, not a contradiction.'), opt('inf', 'Infinitely many solutions', true)],
    hints: ['Is one equation a multiple of the other?', 'Halve the second equation.', 'Is it the same equation, or a different one?'],
    solution: '8x + 6y = 34 is just 2 × (4x + 3y = 17): the same line. It adds no new information, so there are infinitely many mathematical solutions and no single plan.'
  },
  'm1-d3': {
    type: 'choice', ideas: ['classify'], keepOrder: true,
    prompt: 'Diagnose blueprint 3: 4x + 3y = 17 and x + y = 5.',
    options: [opt('one', 'One solution', true), opt('none', 'No solution', false, 'none-vs-infinite', 'The slopes differ (−4/3 and −1), so the lines must cross.'),
      opt('inf', 'Infinitely many solutions', false, 'none-vs-infinite', 'x + y = 5 isn’t a multiple of 4x + 3y = 17, so they’re different lines.')],
    hints: ['Are the slopes the same?', 'Different slopes means the lines cross once.', 'Find it: x = 5 − y in the first equation.'],
    solution: 'Different slopes, so the lines cross exactly once: at (2, 3) again, since 2 + 3 = 5.'
  },
  'm1-none-meaning': {
    type: 'choice', ideas: ['classify', 'interpret'],
    prompt: 'What does “no solution” mean for a build plan?',
    options: [
      opt('a', 'No plan uses exactly both resource amounts: the requirements conflict', true),
      opt('b', 'The crew should build zero features', false, 'none-vs-infinite', '(0, 0) isn’t a solution either: it uses 0 hours, not 17. No solution means no point works.'),
      opt('c', 'Any plan works', false, 'none-vs-infinite', 'That’s closer to infinitely many solutions. No solution means none at all.'),
      opt('d', 'The graph is missing a line', false, 'none-vs-infinite', 'Both lines are there; they’re parallel, so they never meet.')
    ],
    hints: ['What does a solution of the system mean?', 'A plan that satisfies both equations.', 'If the lines never meet…'],
    solution: 'Parallel lines never meet, so no (x, y) satisfies both equations. Exactly those two requirements can’t both be met: something has to change.'
  }
};
export function practice2(n) {
  const s = pick(PRACTICE_2, n), r = solve2(s.p, s.q), x = Number(r.x), y = Number(r.y);
  const brief = `Plan ${n + 1}: ${eqText(s.p)} (crew hours) and ${eqText(s.q)} (machine hours). Choose a method, then solve.`;
  return tidy({
    brief, set: s,
    'm1x-solve': {
      type: 'fields', ideas: ['substitution', 'elimination'],
      prompt: `Solve ${eqText(s.p)} and ${eqText(s.q)}.`,
      fields: [
        { id: 'x', label: 'x (berms)', answer: x, tolerance: 0.001, traps: [{ value: y, code: 'swap-xy', message: 'That’s y’s value.' }] },
        { id: 'y', label: 'y (jumps)', answer: y, tolerance: 0.001, traps: [{ value: x, code: 'swap-xy', message: 'That’s x’s value.' }] }
      ],
      hints: ['Pick one: graph, substitute or eliminate.', `Substitution: solve one equation for a variable (${s.q.a === 1 ? 'x = ' + s.q.c + ' − ' + (s.q.b === 1 ? '' : s.q.b) + 'y' : 'y = ' + s.q.c + ' − ' + s.q.a + 'x'}).`, 'Substitute, solve, then find the other variable.'],
      solution: `x = ${x}, y = ${y}. Check: ${s.p.a}(${x}) + ${s.p.b}(${y}) = ${s.p.c} and ${s.q.a}(${x}) + ${s.q.b}(${y}) = ${s.q.c}.`
    },
    'm1x-meaning': {
      type: 'choice', ideas: ['interpret'],
      prompt: 'What’s the build plan?',
      options: [
        opt('a', `${x} berm modules and ${y} jump features`, true),
        opt('b', `${y} berm modules and ${x} jump features`, false, 'swap-xy', 'x counts berms and y counts jumps.'),
        opt('c', `${x + y} features of either kind`, false, 'intersection-meaning', 'The solution says how many of each kind.'),
        opt('d', `${x} crew hours and ${y} machine hours`, false, 'intersection-meaning', 'x and y count features, not hours.')].map((o, i, a) => a[(i + (n % (a.length - 1)) + 1) % a.length]),
      hints: ['What does x count?', 'x = berm modules, y = jump features.', 'Read your solution.'],
      solution: `${x} berm modules and ${y} jump features use exactly the resources.`
    }
  });
}
export const PRACTICE2_IDS = ['m1x-solve', 'm1x-meaning'];

// ================================================================ Mission 2: Build the Entire Park
const AUG = augmented(Amat(), PARK.available);
const swapped = rowOp(AUG, { type: 'swap', i: 0, j: 2 });
const afterR2 = rowOp(swapped, { type: 'add', i: 1, j: 0, k: -2 });
const afterR3 = rowOp(afterR2, { type: 'add', i: 2, j: 0, k: -4 });
const plusR2 = rowOp(swapped, { type: 'add', i: 1, j: 0, k: 2 });
const plusR3 = rowOp(swapped, { type: 'add', i: 2, j: 0, k: 4 });
const fieldsFor = (row, wrong, labels = ['x', 'y', 'z', '|']) => row.map((v, i) => ({ id: 'c' + i, label: labels[i] === '|' ? 'constant' : labels[i] + '-entry', answer: Number(v), tolerance: 0.001,
  traps: wrong ? [{ value: Number(wrong[i]), code: 'sign', message: 'Subtract the multiple of row 1; it looks like you added.' }] : [] }));
const M2 = {
  'm2-soil': {
    type: 'choice', ideas: ['model', 'three-var'],
    prompt: 'Soil loads: a berm needs 1, a jump 2 and a rock garden 2; there are 10 loads. Which equation is it?',
    options: [
      opt('a', 'x + 2y + 2z = 10', true),
      opt('b', '1x + 2y + 2z = 22', false, 'rows-cols', '22 is the crew-hour total. Soil loads total 10.'),
      opt('c', '5x + 3y + 2z = 10', false, 'rows-cols', 'Those are the rock garden’s three needs (one feature, three resources). The soil equation uses each feature’s soil.'),
      opt('d', 'x + y + z = 10', false, 'model', 'Each feature needs a different number of loads: 1, 2 and 2.')
    ],
    hints: ['One equation per resource.', 'Soil used = (soil per berm)x + (soil per jump)y + (soil per rock garden)z.', '1x + 2y + 2z = 10.'],
    solution: 'x + 2y + 2z = 10. With crew hours (4x + 3y + 5z = 22) and machine hours (2x + y + 3z = 10) that’s three equations for three unknowns.'
  },
  'm2-planes': {
    type: 'choice', ideas: ['three-var', 'interpret'],
    prompt: 'Each equation is a plane in 3D. What is the solution (2, 3, 1) geometrically?',
    options: [
      opt('a', 'The one point that lies on all three planes', true),
      opt('b', 'Any point on the crew-hours plane', false, 'one-equation', 'That satisfies one equation. The solution has to satisfy all three.'),
      opt('c', 'The line where two of the planes meet', false, 'one-equation', 'Two planes share a whole line; the third plane cuts that line at one point.'),
      opt('d', 'The plane with the most features', false, 'intersection-meaning', 'A solution is a point (x, y, z), not a plane.')
    ],
    hints: ['A point on a plane satisfies that plane’s equation.', 'The solution satisfies all three equations.', 'Where do all three planes meet?'],
    solution: 'The solution is the single point common to all three planes, so it satisfies every equation at once. In the slice view, the three lines meet only when z = 1.'
  },
  'm2-aug': {
    type: 'choice', ideas: ['augmented'],
    prompt: 'Which augmented matrix represents the park system?',
    options: [
      opt('a', augText(AUG), true),
      opt('b', augText(mat(PARK.needs).map((r, i) => [...r, Frac.of(PARK.available[i])])), false, 'rows-cols', 'Each row must be one equation. That matrix has features as rows: its first row would be “4x + 2y + z = 22”, which isn’t the crew equation.'),
      opt('c', '[ 4  3  5 ]  [ 2  1  3 ]  [ 1  2  2 ]', false, 'augmented', 'That’s only the coefficients. An augmented matrix adds the constants after the bar.'),
      opt('d', '[ 22 | 4  3  5 ]  [ 10 | 2  1  3 ]  [ 10 | 1  2  2 ]', false, 'augmented', 'Coefficients first (x, y, z), then the constant after the bar.')
    ],
    hints: ['Each row is one equation.', 'Columns: x, y, z, then the constant.', 'Row 1 is the crew-hours equation 4x + 3y + 5z = 22.'],
    solution: `${augText(AUG)}: row 1 crew hours, row 2 machine hours, row 3 soil loads; columns x, y, z | total.`
  },
  'm2-r2': {
    type: 'fields', ideas: ['gaussian'],
    prompt: `After swapping rows 1 and 3, R1 = ${rowText(swapped[0])} and R2 = ${rowText(swapped[1])}. What is the new row 2 after R2 → R2 − 2R1?`,
    fields: fieldsFor(afterR2[1], plusR2[1]),
    hints: ['Work entry by entry.', 'New entry = R2 entry − 2 × R1 entry.', 'y-entry: 1 − 2 × 2.'],
    solution: `R2 − 2R1 = ${rowText(afterR2[1])}: x is gone from row 2, which now says −3y − z = −10.`
  },
  'm2-r3': {
    type: 'fields', ideas: ['gaussian'],
    prompt: `And row 3 (${rowText(swapped[2])}) after R3 → R3 − 4R1?`,
    fields: fieldsFor(afterR3[2], plusR3[2]),
    hints: ['Same idea with 4 × R1.', 'New entry = R3 entry − 4 × R1 entry.', 'y-entry: 3 − 4 × 2.'],
    solution: `R3 − 4R1 = ${rowText(afterR3[2])}.`
  },
  'm2-z': {
    type: 'number', ideas: ['gaussian', 'three-var'], answer: 1, tolerance: 0.001, label: 'z',
    prompt: 'After R3 → 3R3 − 5R2 the last row is [ 0  0  −4 | −4 ]. What is z?',
    traps: [{ value: -1, code: 'sign', message: '−4z = −4: two negatives give a positive.' }, { value: 16, code: 'bad-row-op', message: 'Divide, don’t multiply: z = −4 ÷ −4.' }],
    hints: ['The row means 0x + 0y − 4z = −4.', 'Solve −4z = −4.', 'Divide both sides by −4.'],
    solution: '−4z = −4, so z = 1: one rock garden section.'
  },
  'm2-back': {
    type: 'fields', ideas: ['three-var', 'gaussian'],
    prompt: 'Back-substitute: row 2 says −3y − z = −10 and row 1 says x + 2y + 2z = 10. Find y, then x.',
    fields: [
      { id: 'y', label: 'y', answer: 3, tolerance: 0.001, traps: [{ value: -3, code: 'sign', message: '−3y = −9, so y = +3.' }, { value: 11 / 3, code: 'sign', message: 'Move z across correctly: −3y = −10 + z = −9.' }] },
      { id: 'x', label: 'x', answer: 2, tolerance: 0.001, traps: [{ value: 10, code: 'wrong-var', message: 'Subtract 2y and 2z: x = 10 − 6 − 2.' }, { value: 6, code: 'sign', message: 'x = 10 − 2(3) − 2(1).' }] }
    ],
    hints: ['Start with the row that has the fewest unknowns left.', 'With z = 1: −3y − 1 = −10.', 'Then x = 10 − 2y − 2z.'],
    solution: '−3y − 1 = −10 → y = 3. x + 6 + 2 = 10 → x = 2. The solution is (2, 3, 1).'
  },
  'm2-check': {
    type: 'fields', ideas: ['verify', 'three-var'],
    prompt: 'Check (2, 3, 1) in all three original equations.',
    fields: [
      { id: 'crew', label: 'Crew 4x + 3y + 5z', answer: 22, tolerance: 0.001, unit: 'h' },
      { id: 'machine', label: 'Machine 2x + y + 3z', answer: 10, tolerance: 0.001, unit: 'h' },
      { id: 'soil', label: 'Soil x + 2y + 2z', answer: 10, tolerance: 0.001, unit: 'loads' }
    ],
    hints: ['Substitute x = 2, y = 3, z = 1.', 'Crew: 8 + 9 + 5.', 'Machine: 4 + 3 + 3; soil: 2 + 6 + 2.'],
    solution: '22, 10 and 10: every resource is used exactly. 2 berms, 3 jumps and 1 rock garden.'
  },
  'm2-equivalent': {
    type: 'choice', ideas: ['gaussian'],
    prompt: 'Why do row operations keep the same solution?',
    options: [
      opt('a', 'Each one can be undone, so every new system is equivalent to the old one', true),
      opt('b', 'They don’t: you have to check, because the answer usually changes', false, 'bad-row-op', 'Swaps, nonzero scalings and adding multiples of rows can all be reversed, so the solution set never changes.'),
      opt('c', 'Because the constants never change', false, 'bad-row-op', 'The constants do change (22 became 10, −10, −18…), and the solution stays the same.'),
      opt('d', 'Because you can multiply a row by zero', false, 'bad-row-op', 'Multiplying by 0 is not allowed: it destroys an equation and can’t be undone.')
    ],
    hints: ['Think about undoing each kind of step.', 'A swap undoes itself; scaling by k undoes with 1/k.', 'Adding k·R1 undoes by subtracting k·R1.'],
    solution: 'Swapping rows, multiplying a row by a nonzero number and adding a multiple of one row to another are all reversible. So the new system has exactly the same solutions, just easier to read.'
  }
};
export function practice3(n) {
  const s = pick(PRACTICE_3, n), c = classify(s.A, s.b);
  const sys = s.A.map((r, i) => eqText3(r, s.b[i])).join(';  ');
  const kinds = [opt('one', 'One solution', c.type === 'one', 'none-vs-infinite', 'After elimination there’s a zero row or a contradiction, so it isn’t a single point.'),
    opt('none', 'No solution', c.type === 'none', 'none-vs-infinite', c.type === 'infinite' ? 'A row became 0 = 0 (redundant), not 0 = a nonzero number.' : 'Every row still has a pivot: there is a unique solution.'),
    opt('inf', 'Infinitely many solutions', c.type === 'infinite', 'none-vs-infinite', c.type === 'none' ? 'A row became 0 = a nonzero number: a contradiction, so no solution.' : 'Every row still has a pivot: there is a unique solution.')];
  const qs = {
    brief: `Practice system ${n + 1}: ${sys}. Load it into the console (independent mode), eliminate, then answer.`, set: s,
    'm2x-classify': { type: 'choice', keepOrder: true, ideas: ['classify', 'gaussian'], prompt: 'How many solutions does this system have?', options: kinds,
      hints: ['Eliminate until the matrix is upper triangular, or a row of zero coefficients appears.', 'A row 0 0 0 | c with c ≠ 0 means 0 = c: impossible.', 'A row 0 0 0 | 0 means one equation was redundant.'],
      solution: c.type === 'one' ? `One solution: (${c.solution.map(String).join(', ')}).` : c.type === 'none' ? 'Elimination gives a row 0 0 0 | c with c ≠ 0: a contradiction, so no solution.' : 'Elimination gives a row 0 0 0 | 0: one equation was redundant, so there are infinitely many solutions.' }
  };
  if (c.type === 'one') {
    const x = c.solution.map(Number);
    qs['m2x-solve'] = { type: 'fields', ideas: ['three-var'], prompt: 'Find the solution.', fields: ['x', 'y', 'z'].map((v, i) => ({ id: v, label: v, answer: x[i], tolerance: 0.001 })),
      hints: ['Eliminate x from rows 2 and 3, then y from row 3.', 'Solve the last row for z.', 'Back-substitute for y, then x.'], solution: `(${x.join(', ')}). Check it in all three equations.` };
  } else {
    const none = c.type === 'none';
    qs['m2x-solve'] = { type: 'choice', ideas: ['classify'], prompt: 'Which row in your eliminated matrix tells you?', options: [
      opt('a', none ? 'A row 0 0 0 | c with c ≠ 0 (0 = c, impossible)' : 'A row 0 0 0 | 0 (0 = 0, always true)', true),
      opt('b', none ? 'A row 0 0 0 | 0' : 'A row 0 0 0 | c with c ≠ 0', false, 'none-vs-infinite', none ? '0 = 0 means redundant (infinitely many), not contradictory.' : '0 = c is a contradiction (no solution), not a redundancy.'),
      opt('c', 'A row with a 1 on the diagonal', false, 'none-vs-infinite', 'Pivots are normal; the tell-tale row has all zero coefficients.')].map((o, i, a) => a[(i + (n % (a.length - 1)) + 1) % a.length]),
      hints: ['Look for a row whose x, y and z entries are all 0.', 'What does that row say as an equation?', '0 = 0 or 0 = a nonzero number?'],
      solution: none ? 'A row 0x + 0y + 0z = c (c ≠ 0) can never be true, so the system has no solution: like two parallel resource limits that can’t both be met.' : 'A row 0 = 0 is always true: one equation repeated information. With fewer independent equations than unknowns, there are infinitely many solutions.' };
  }
  return tidy(qs);
}
export const PRACTICE3_IDS = ['m2x-classify', 'm2x-solve'];
export function eqText3(r, b) {
  const v = ['x', 'y', 'z'];
  return r.map((k, i) => ({ k, v: v[i] })).filter(t => t.k !== 0).map((t, i) => `${t.k < 0 ? (i ? ' − ' : '−') : (i ? ' + ' : '')}${Math.abs(t.k) === 1 ? '' : Math.abs(t.k)}${t.v}`).join('') + ` = ${b}`;
}

// ================================================================ Mission 3: The Matrix Workshop
const IA = mat(INVENTORY.A), IB = mat(INVENTORY.B), IS = mat(INVENTORY.S), IU = mat(INVENTORY.U);
const AB = num(add(IA, IB)), SU = num(sub(IS, IU)), TWO = num(scale(2, add(IA, IB)));
const COSTS = costing();
const M3 = {
  'm3-dims': {
    type: 'fields', ideas: ['dimensions'],
    prompt: 'The inventory matrix A has a row for each crew and a column for each tool. What are its dimensions?',
    fields: [
      { id: 'r', label: 'Rows', answer: 2, tolerance: 0.001, traps: [{ value: 3, code: 'wrong-dims', message: 'Rows go across; there are two (Crew A and Crew B).' }, { value: 6, code: 'wrong-dims', message: '6 is the number of entries. Dimensions are rows × columns.' }] },
      { id: 'c', label: 'Columns', answer: 3, tolerance: 0.001, traps: [{ value: 2, code: 'wrong-dims', message: 'Columns go down; there are three (shovels, rakes, tampers).' }] }
    ],
    hints: ['Dimensions are rows × columns.', 'A row runs left to right.', 'One row per crew, one column per tool.'],
    solution: 'A is 2 × 3: 2 rows (crews) and 3 columns (tools). Rows always come first.'
  },
  'm3-entry': {
    type: 'number', ideas: ['dimensions', 'applications'], answer: INVENTORY.A[1][1], tolerance: 0.001, label: 'Rakes, Crew B',
    prompt: 'How many rakes does Crew B have (row 2, column 2)?',
    traps: [{ value: INVENTORY.A[0][1], code: 'rows-cols', message: 'That’s Crew A’s rakes. Crew B is the second row.' }, { value: INVENTORY.A[1][2], code: 'rows-cols', message: 'That’s column 3 (tampers). Rakes are column 2.' }],
    hints: ['Find Crew B’s row.', 'Then the rakes column.', 'Row 2, column 2.'],
    solution: `a₂₂ = ${INVENTORY.A[1][1]}: Crew B has ${INVENTORY.A[1][1]} rakes.`
  },
  'm3-add': {
    type: 'fields', ideas: ['add-sub'],
    prompt: 'Trailer deliveries add B to A. What is Crew B’s row of A + B?',
    fields: AB[1].map((v, j) => ({ id: 'c' + j, label: ['Shovels', 'Rakes', 'Tampers'][j], answer: v, tolerance: 0.001, traps: [{ value: INVENTORY.A[1][j] * INVENTORY.B[1][j], code: 'entrywise-mult', message: 'Add the matching entries; don’t multiply them.' }, { value: AB[0][j], code: 'rows-cols', message: 'That’s Crew A’s row.' }] })),
    hints: ['Add entries in the same position.', 'Crew B: row 2 of A plus row 2 of B.', '3 + 1, 5 + 3, 1 + 2.'],
    solution: `[ ${AB[1].join('  ')} ]: Crew B now has ${AB[1][0]} shovels, ${AB[1][1]} rakes and ${AB[1][2]} tampers.`
  },
  'm3-add-dims': {
    type: 'choice', ideas: ['add-sub', 'dimensions'],
    prompt: 'Can you add a 2 × 3 matrix to a 3 × 2 matrix?',
    options: [
      opt('a', 'No: addition needs the same dimensions, entry for entry', true),
      opt('b', 'Yes: they both have 6 entries', false, 'add-mismatch', 'Same count isn’t enough: each entry needs a partner in the same position.'),
      opt('c', 'Yes: the answer is a 3 × 3 matrix', false, 'add-mismatch', 'Addition never changes dimensions, and these don’t match.'),
      opt('d', 'Only if you add the rows first', false, 'add-mismatch', 'There’s no fix: matrices of different sizes can’t be added.')
    ],
    hints: ['How does matrix addition work?', 'Entry (i, j) of A adds to entry (i, j) of B.', 'Does every position exist in both?'],
    solution: 'Addition and subtraction work position by position, so both matrices need the same dimensions. A 2 × 3 and a 3 × 2 can’t be added.'
  },
  'm3-sub': {
    type: 'fields', ideas: ['add-sub', 'applications'],
    prompt: 'Starting inventory S minus tools used U: what is Crew A’s remaining row of S − U?',
    fields: SU[0].map((v, j) => ({ id: 'c' + j, label: ['Shovels', 'Rakes', 'Tampers'][j], answer: v, tolerance: 0.001, traps: [{ value: INVENTORY.U[0][j] - INVENTORY.S[0][j], code: 'sign', message: 'Subtract used from starting: S − U, not U − S.' }, { value: INVENTORY.S[0][j] + INVENTORY.U[0][j], code: 'sign', message: 'Subtract, don’t add.' }] })),
    hints: ['Subtract matching entries.', 'Row 1 of S minus row 1 of U.', '10 − 3, 12 − 4, 6 − 2.'],
    solution: `[ ${SU[0].join('  ')} ]: Crew A has ${SU[0][0]} shovels, ${SU[0][1]} rakes and ${SU[0][2]} tampers left.`
  },
  'm3-scalar': {
    type: 'fields', ideas: ['scalar'],
    prompt: 'Two identical construction weekends: what is Crew A’s row of 2(A + B)?',
    fields: TWO[0].map((v, j) => ({ id: 'c' + j, label: ['Shovels', 'Rakes', 'Tampers'][j], answer: v, tolerance: 0.001, traps: [{ value: AB[0][j] + 2, code: 'scalar-add', message: 'Multiply every entry by 2; don’t add 2.' }, { value: AB[0][j], code: 'scalar-add', message: 'Every entry doubles.' }] })),
    hints: ['A scalar multiplies every entry.', 'Crew A’s row of A + B is [ 6  8  3 ].', 'Double each one.'],
    solution: `2 × [ ${AB[0].join('  ')} ] = [ ${TWO[0].join('  ')} ].`
  },
  'm3-mc': {
    type: 'fields', ideas: ['multiply', 'applications'],
    prompt: 'Resource matrix M (rows: berm, jump, rock garden; columns: crew, machine, soil) times the cost vector C = [28, 90, 45]. What is MC?',
    fields: COSTS.unit.map((v, i) => ({ id: 'r' + i, label: ['Berm', 'Jump', 'Rock garden'][i], answer: v, tolerance: 0.001, unit: '$',
      traps: [{ value: PARK.needs[i][0] * COST[0], code: 'partial-dot', message: 'That’s only the crew part. Add all three products across the row.' },
        { value: PARK.needs[i].reduce((a, b) => a + b, 0), code: 'forgot-costs', message: 'That adds the resources but leaves out their prices.' },
        { value: PARK.needs[i][i] * COST[i], code: 'entrywise-mult', message: 'That multiplies one matching entry. Row by column: multiply each pair and add.' }] })),
    hints: ['Each entry of MC is a row of M times the column C.', 'Berm: 4 × 28 + 2 × 90 + 1 × 45.', 'Do the same for the jump and rock garden rows.'],
    solution: `MC = [ ${COSTS.unit.join(', ')} ]: a berm costs ${money(COSTS.unit[0])}, a jump ${money(COSTS.unit[1])} and a rock garden ${money(COSTS.unit[2])} in this model.`
  },
  'm3-qm': {
    type: 'fields', ideas: ['multiply', 'applications'],
    prompt: 'The plan is Q = [2  3  1] (berms, jumps, rock gardens). What is QM: the total crew hours, machine hours and soil loads?',
    fields: COSTS.resources.map((v, j) => ({ id: 'c' + j, label: ['Crew hours', 'Machine hours', 'Soil loads'][j], answer: v, tolerance: 0.001,
      traps: [{ value: PLAN.reduce((s, q, k) => s + q * PARK.needs[j][k], 0), code: 'rows-cols', message: 'Use a column of M (one resource) against Q, not a row.' }, { value: PLAN[j] * PARK.needs[j][j], code: 'entrywise-mult', message: 'Row by column: 2 × (berm’s) + 3 × (jump’s) + 1 × (rock garden’s).' }] })),
    hints: ['Q is 1 × 3, M is 3 × 3: QM is 1 × 3.', 'Entry j = Q times column j of M.', 'Crew: 2 × 4 + 3 × 3 + 1 × 5.'],
    solution: `QM = [ ${COSTS.resources.join(', ')} ]: ${COSTS.resources[0]} crew hours, ${COSTS.resources[1]} machine hours and ${COSTS.resources[2]} soil loads, exactly what Mission 2’s park used.`
  },
  'm3-total': {
    type: 'number', ideas: ['multiply', 'applications'], answer: COSTS.cost, tolerance: 0.001, unit: '$', label: 'QMC',
    prompt: 'Now the whole park’s cost: QMC = [22  10  10] × C.',
    traps: [{ value: COSTS.unit.reduce((a, b) => a + b, 0), code: 'forgot-quantities', message: 'That’s one of each feature. Use the plan’s quantities: 2, 3 and 1.' }, { value: COSTS.resources.reduce((a, b) => a + b, 0), code: 'forgot-costs', message: 'That’s the total units of resources. Multiply each by its price.' }],
    hints: ['A 1 × 3 times a 3 × 1 gives a 1 × 1.', '22 × 28 + 10 × 90 + 10 × 45.', 'Or: Q × MC = 2 × 337 + 3 × 264 + 1 × 500.'],
    solution: `22 × 28 + 10 × 90 + 10 × 45 = ${money(COSTS.cost)}. The other grouping, Q(MC) = 2 × 337 + 3 × 264 + 500, gives the same total.`
  },
  'm3-dims-product': {
    type: 'choice', ideas: ['dimensions', 'multiply'],
    prompt: 'Q is 1 × 3, M is 3 × 3 and C is 3 × 1. What size is QMC?',
    options: [
      opt('a', '1 × 1 (a single number: the total cost)', true),
      opt('b', '3 × 3', false, 'wrong-dims', 'The outside numbers survive: (1 × 3)(3 × 3)(3 × 1) → 1 × 1.'),
      opt('c', '1 × 3', false, 'wrong-dims', 'That’s QM. Multiplying by C (3 × 1) leaves 1 × 1.'),
      opt('d', 'It can’t be multiplied', false, 'wrong-dims', 'Each inner pair matches (3 and 3), so it works.')
    ],
    hints: ['(m × n)(n × p) gives m × p.', 'QM: (1 × 3)(3 × 3) → 1 × 3.', 'Then (1 × 3)(3 × 1) → ?'],
    solution: 'Inner numbers must match (3 = 3 both times); the outer ones give the size: 1 × 1, the one total.'
  },
  'm3-commute': {
    type: 'choice', ideas: ['multiply', 'dimensions'],
    prompt: 'Is CM defined (C is 3 × 1, M is 3 × 3)?',
    options: [
      opt('a', 'No: C has 1 column but M has 3 rows, so they don’t match', true),
      opt('b', 'Yes, and it equals MC', false, 'commute', 'Matrix multiplication isn’t commutative. Here CM isn’t even defined.'),
      opt('c', 'Yes, it gives a 3 × 3 matrix', false, 'wrong-dims', '(3 × 1)(3 × 3): the inner numbers are 1 and 3, which don’t match.'),
      opt('d', 'Yes, it gives a 1 × 3 matrix', false, 'wrong-dims', 'Check the inner numbers: 1 and 3.')
    ],
    hints: ['For AB, columns of A must equal rows of B.', 'C has 1 column; M has 3 rows.', 'Do they match?'],
    solution: 'CM isn’t defined. MC is (3 × 3)(3 × 1) → 3 × 1. Order matters in matrix multiplication; sometimes the reversed product doesn’t exist at all.'
  },
  'm3-entrywise': {
    type: 'choice', ideas: ['multiply'],
    prompt: 'A teammate “multiplies” two 2 × 2 matrices by multiplying matching entries. What’s wrong?',
    options: [
      opt('a', 'Matrix multiplication is row by column: each entry is a row times a column, added up', true),
      opt('b', 'Nothing: that’s how all matrix operations work', false, 'entrywise-mult', 'Addition and subtraction work entry by entry; multiplication doesn’t.'),
      opt('c', 'They should add the matching entries instead', false, 'entrywise-mult', 'That’s matrix addition, a different operation.'),
      opt('d', 'You can only multiply square matrices by numbers', false, 'entrywise-mult', 'Matrices multiply each other row by column when the sizes match.')
    ],
    hints: ['Look at how MC was found.', 'Each entry of MC combined a whole row of M with all of C.', 'Multiply pairs, then add.'],
    solution: 'Entry (i, j) of AB is row i of A times column j of B: multiply pairs and add. That’s what lets M and C combine quantities and prices.'
  }
};

// ================================================================ Mission 4: The Matrix Solver
const A4 = Amat(), DET = det(A4);
const singularNone = classify(SINGULAR.A, SINGULAR.inconsistent).type, singularInf = classify(SINGULAR.A, SINGULAR.consistent).type;
const M4 = {
  'm4-dims': {
    type: 'choice', ideas: ['dimensions', 'matrix-equation'],
    prompt: 'In AX = B for the park system, what are the dimensions of A, X and B?',
    options: [
      opt('a', 'A is 3 × 3, X is 3 × 1, B is 3 × 1', true),
      opt('b', 'A is 3 × 3, X is 1 × 3, B is 1 × 3', false, 'wrong-dims', 'X is a column of the three unknowns: 3 × 1. (3 × 3)(1 × 3) wouldn’t be defined.'),
      opt('c', 'A is 3 × 4, X is 3 × 1, B is 3 × 1', false, 'wrong-dims', 'A holds only the coefficients (3 × 3). The 3 × 4 is the augmented matrix.'),
      opt('d', 'All three are 3 × 3', false, 'wrong-dims', 'X and B are single columns: 3 × 1.')
    ],
    hints: ['A holds the coefficients: one row per equation, one column per variable.', 'X lists x, y, z in a column.', 'B lists the three totals.'],
    solution: '(3 × 3)(3 × 1) = 3 × 1. A is the coefficients, X the unknowns and B the resource totals.'
  },
  'm4-row1': {
    type: 'choice', ideas: ['matrix-equation'],
    prompt: 'Multiplying the first row of A by X gives:',
    options: [
      opt('a', '4x + 3y + 5z, which must equal 22 (crew hours)', true),
      opt('b', '4x + 2y + z, which must equal 22', false, 'rows-cols', 'That uses the first column. A row of A times X: 4·x + 3·y + 5·z.'),
      opt('c', '4x, 3y and 5z as three separate entries', false, 'entrywise-mult', 'A row times a column gives one number: the products added together.'),
      opt('d', '12xyz', false, 'entrywise-mult', 'Multiply each coefficient by its own variable, then add.')
    ],
    hints: ['Row 1 of A is [4  3  5].', 'Row times column: multiply pairs and add.', '4·x + 3·y + 5·z.'],
    solution: 'Row 1 × X = 4x + 3y + 5z = 22, the crew-hours equation. Rows 2 and 3 rebuild the machine and soil equations: AX = B is the whole system.'
  },
  'm4-transpose': {
    type: 'choice', ideas: ['matrix-equation', 'applications'],
    prompt: 'Compare A (equations as rows) with Mission 3’s resource matrix M (features as rows). How are they related?',
    options: [
      opt('a', 'A’s rows are M’s columns: A is M with rows and columns swapped', true),
      opt('b', 'They’re the same matrix', false, 'rows-cols', 'M’s first row is the berm [4 2 1]; A’s first row is crew hours [4 3 5].'),
      opt('c', 'A is M multiplied by C', false, 'rows-cols', 'MC is a 3 × 1 cost vector, not a 3 × 3 matrix.'),
      opt('d', 'They have nothing in common', false, 'rows-cols', 'They hold the same nine numbers, arranged differently.')
    ],
    hints: ['Write out row 1 of each.', 'A row 1: [4 3 5]. M column 1: 4, 3, 5.', 'Rows of one are columns of the other.'],
    solution: 'A = Mᵀ (the transpose). M organises numbers by feature, A by resource equation. That’s why QM gave the totals 22, 10, 10: the same numbers as B.'
  },
  'm4-det': {
    type: 'number', ideas: ['inverse'], answer: Number(DET), tolerance: 0.001, label: 'det(A)',
    prompt: 'Find det(A) for A = [4 3 5; 2 1 3; 1 2 2] (expand along the first row).',
    traps: [{ value: -Number(DET), code: 'sign', message: 'Check the signs: + − + along the first row.' }, { value: 4 * (1 * 2 - 3 * 2) + 3 * (2 * 2 - 3 * 1) + 5 * (2 * 2 - 1 * 1), code: 'sign', message: 'The middle term is subtracted: −3 × (2·2 − 3·1).' }],
    hints: ['det = 4·(minor) − 3·(minor) + 5·(minor).', 'Minors: (1·2 − 3·2), (2·2 − 3·1), (2·2 − 1·1).', '4(−4) − 3(1) + 5(3).'],
    solution: `4(2 − 6) − 3(4 − 3) + 5(4 − 1) = −16 − 3 + 15 = ${DET}. Not zero, so A has an inverse.`
  },
  'm4-identity': {
    type: 'choice', ideas: ['inverse', 'matrix-equation'],
    prompt: 'Why does multiplying AX = B by A⁻¹ give X = A⁻¹B?',
    options: [
      opt('a', 'A⁻¹A = I, and IX = X', true),
      opt('b', 'Because you divide both sides by A', false, 'divide-matrix', 'There’s no matrix division. You multiply by the inverse, on the left.'),
      opt('c', 'Because A⁻¹ = 1 ÷ each entry of A', false, 'every-inverse', 'The inverse isn’t entry-by-entry reciprocals. It’s the matrix that undoes A.'),
      opt('d', 'Because AB = BA', false, 'commute', 'Order matters: A⁻¹ must multiply on the left of both sides.')
    ],
    hints: ['What is A⁻¹A?', 'The identity I: 1s on the diagonal.', 'What does I do to X?'],
    solution: 'A⁻¹(AX) = (A⁻¹A)X = IX = X, and the right side becomes A⁻¹B. The inverse undoes A, like dividing does for numbers.'
  },
  'm4-solve': {
    type: 'fields', ideas: ['inverse', 'three-var'],
    prompt: 'Use the solver to compute X = A⁻¹B. What are x, y and z?',
    fields: ['x', 'y', 'z'].map((v, i) => ({ id: v, label: v + ' (' + ['berms', 'jumps', 'rock gardens'][i] + ')', answer: PLAN[i], tolerance: 0.001 })),
    hints: ['Each entry of A⁻¹B is a row of A⁻¹ times B.', 'Row 1: 1(22) − 1(10) − 1(10).', 'Row 2: ¼(22) − ¾(10) + ½(10).'],
    solution: 'A⁻¹B = (2, 3, 1): the same plan as Gaussian elimination found. Different method, same system, same answer.'
  },
  'm4-order': {
    type: 'choice', ideas: ['inverse', 'dimensions'],
    prompt: 'Why X = A⁻¹B and not BA⁻¹?',
    options: [
      opt('a', 'BA⁻¹ is (3 × 1)(3 × 3), which isn’t defined; and the order matters anyway', true),
      opt('b', 'They’re the same; either works', false, 'commute', 'Matrix products don’t commute. Here BA⁻¹ doesn’t even exist.'),
      opt('c', 'BA⁻¹ gives the same numbers in a row instead of a column', false, 'commute', 'Check dimensions: 1 column against 3 rows doesn’t match.'),
      opt('d', 'Because B is smaller', false, 'commute', 'Size isn’t the reason; matching inner dimensions is.')
    ],
    hints: ['Check inner dimensions for each order.', 'A⁻¹B: (3 × 3)(3 × 1).', 'BA⁻¹: (3 × 1)(3 × 3).'],
    solution: 'A⁻¹B is (3 × 3)(3 × 1) → 3 × 1. BA⁻¹ has inner numbers 1 and 3: undefined. Multiply both sides on the left.'
  },
  'm4-singular': {
    type: 'choice', ideas: ['inverse', 'classify'],
    prompt: 'A coefficient matrix has det = 0. What can you say about its system?',
    options: [
      opt('a', 'There’s no inverse; the system has either no solution or infinitely many, so use elimination to tell which', true),
      opt('b', 'It always has no solution', false, 'det-zero-none', `Not always. With the same singular A, one set of totals gives ${singularInf === 'infinite' ? 'infinitely many' : singularInf} solutions and another gives ${singularNone === 'none' ? 'none' : singularNone}.`),
      opt('c', 'It has exactly one solution; find it with A⁻¹', false, 'det-zero', 'det = 0 means A⁻¹ doesn’t exist, and there’s no unique solution.'),
      opt('d', 'Divide by the determinant anyway', false, 'det-zero', 'Dividing by 0 is undefined. A zero determinant is the signal to stop.')
    ],
    hints: ['det = 0: does A⁻¹ exist?', 'Without an inverse there’s no single X = A⁻¹B.', 'Elimination shows 0 = 0 (redundant) or 0 = c (contradiction).'],
    solution: 'det = 0 means no inverse and no unique solution. The system is dependent (infinitely many) or inconsistent (none), depending on the totals; elimination tells you which.'
  }
};

// ================================================================ Extension: The Park Optimizer
const O = optimizer();
const EXT = {
  'ext-corner': {
    type: 'fields', ideas: ['optimize', 'elimination'],
    prompt: 'Where do the limits 4x + 3y = 40 and 2x + y = 18 cross?',
    fields: [{ id: 'x', label: 'x', answer: Number(O.corner.x), tolerance: 0.001, traps: [{ value: Number(O.corner.y), code: 'swap-xy', message: 'That’s y.' }] }, { id: 'y', label: 'y', answer: Number(O.corner.y), tolerance: 0.001, traps: [{ value: Number(O.corner.x), code: 'swap-xy', message: 'That’s x.' }] }],
    hints: ['Solve them as equations.', 'y = 18 − 2x.', '4x + 3(18 − 2x) = 40.'],
    solution: `(${O.corner.x}, ${O.corner.y}): a corner of the feasible region.`
  },
  'ext-best': {
    type: 'number', ideas: ['optimize'], answer: O.best, tolerance: 0.001, label: 'Largest x + y',
    prompt: 'Feature counts must be whole numbers. What is the largest total P = x + y the limits allow?',
    traps: [{ value: Number(O.corner.x) + Number(O.corner.y), code: 'not-viable', message: 'The corner (7, 4) gives 11, but other whole-number points do better. Try the y-axis end of the region.' }, { value: 40 / 3, code: 'not-viable', message: '13⅓ jumps can’t be built. Use whole numbers.' }, { value: 9, code: 'not-viable', message: 'That’s the most berms. Jumps use fewer crew hours each.' }],
    hints: ['Try points in the shaded region with whole-number x and y.', 'Jumps use fewer crew hours than berms.', 'Can you fit 13 features? 14?'],
    solution: `The largest is P = ${O.best}, at ${O.bestPlans.map(p => '(' + p.join(', ') + ')').join(' or ')}. 14 is impossible: 4x + 3(14 − x) = x + 42 > 40.`
  },
  'ext-viable': {
    type: 'choice', ideas: ['optimize', 'interpret'],
    prompt: 'Is (2.5, 3) a viable build plan?',
    options: [
      opt('a', 'No: you can’t build half a berm, even though it satisfies the inequalities', true),
      opt('b', 'Yes: it’s inside the region', false, 'not-viable', 'It satisfies the limits, but feature counts must be whole numbers.'),
      opt('c', 'No: it breaks the crew-hours limit', false, 'not-viable', '4(2.5) + 3(3) = 19 ≤ 40: it fits. The problem is the half feature.'),
      opt('d', 'Yes, if the crew rounds it to 3', false, 'not-viable', '(3, 3) is a different plan; check it separately.')
    ],
    hints: ['Does it satisfy the inequalities?', 'What kind of number is 2.5?', 'Can you build 2.5 of something?'],
    solution: 'A mathematical solution isn’t always a practical one. Build plans need non-negative whole numbers.'
  }
};

// ================================================================ Final: The Final Build Plan
export const FINAL_IDS = ['fa-vars', 'fa-solve', 'fa-meaning', 'fa-verify', 'fb-aug', 'fb-solve', 'fb-meaning', 'fc-qm', 'fc-cost', 'fc-budget'];
export const PASS_MARK = 8;   // of 10, right without the solution shown
export function finalSet(roundNo) {
  const S = pick(FINAL_SETS, roundNo - 1), two = solve2(S.two.p, S.two.q), three = solve3(S.three.A, S.three.b);
  const plan = three.x.map(Number), c = costing(plan);
  return { ...S, x2: Number(two.x), y2: Number(two.y), plan, costing: c, left: S.budget - c.cost };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), { p, q } = F.two, T = F.three, aug = augmented(mat(T.A), T.b), C = F.costing;
  const qs = {
    set: F,
    'fa-vars': {
      type: 'choice', ideas: ['model'],
      prompt: `Plan A: ${eqText(p)} (crew hours) and ${eqText(q)} (machine hours). What do x and y stand for?`,
      options: [opt('a', 'x = berm modules, y = jump features', true), opt('b', 'x = crew hours, y = machine hours', false, 'intersection-meaning', 'The hours are the totals on the right. x and y count features.'),
        opt('c', 'x = jump features, y = berm modules', false, 'swap-xy', 'In this lab x is berms and y is jumps.'), opt('d', 'x and y are both costs', false, 'intersection-meaning', 'No prices appear in these equations.')],
      hints: ['What does each term count?', '4x: crew hours for x features.', 'The features are berms and jumps.'], solution: 'x counts berm modules and y counts jump features.'
    },
    'fa-solve': {
      type: 'fields', ideas: ['substitution', 'elimination'],
      prompt: `Solve ${eqText(p)} and ${eqText(q)}.`,
      fields: [{ id: 'x', label: 'x', answer: F.x2, tolerance: 0.001, traps: [{ value: F.y2, code: 'swap-xy', message: 'That’s y.' }] }, { id: 'y', label: 'y', answer: F.y2, tolerance: 0.001, traps: [{ value: F.x2, code: 'swap-xy', message: 'That’s x.' }] }],
      hints: ['Substitution or elimination.', 'Solve the second for y (or x).', 'Substitute, solve, then back-substitute.'], solution: `x = ${F.x2}, y = ${F.y2}.`
    },
    'fa-meaning': {
      type: 'choice', ideas: ['interpret'], prompt: 'Interpret the solution.',
      options: [opt('a', `Build ${F.x2} berms and ${F.y2} jumps; that uses both resources exactly`, true), opt('b', `Build ${F.y2} berms and ${F.x2} jumps`, false, 'swap-xy', 'x is berms.'),
        opt('c', `It uses ${F.x2} crew hours and ${F.y2} machine hours`, false, 'intersection-meaning', 'x and y count features.'), opt('d', 'It satisfies the crew-hours equation only', false, 'one-equation', 'A solution satisfies both.')],
      hints: ['x is berms, y is jumps.', 'A solution satisfies both equations.', 'Say the plan in words.'], solution: `${F.x2} berm modules and ${F.y2} jump features use every crew hour and machine hour.`
    },
    'fa-verify': {
      type: 'fields', ideas: ['verify'], prompt: 'Verify: what does each equation’s left side equal with your solution?',
      fields: [{ id: 'p', label: eqText(p).split(' =')[0], answer: p.a * F.x2 + p.b * F.y2, tolerance: 0.001 }, { id: 'q', label: eqText(q).split(' =')[0], answer: q.a * F.x2 + q.b * F.y2, tolerance: 0.001 }],
      hints: ['Substitute x and y.', `${p.a}(${F.x2}) + ${p.b}(${F.y2}).`, 'Do the same for the second.'], solution: `${p.c} and ${q.c}: both equations check.`
    },
    'fb-aug': {
      type: 'choice', ideas: ['augmented'],
      prompt: `Plan B: ${T.A.map((r, i) => eqText3(r, T.b[i])).join(';  ')}. Which augmented matrix is it?`,
      options: [opt('a', augText(aug), true),
        opt('b', augText(mat(T.A[0].map((_, j) => T.A.map(r => r[j]))).map((r, i) => [...r, Frac.of(T.b[i])])), false, 'rows-cols', 'Rows must be equations. That uses the columns as rows.'),
        opt('c', T.A.map(r => '[ ' + r.join('  ') + ' ]').join('  '), false, 'augmented', 'Include the constants after the bar.'),
        opt('d', augText(aug.map(r => [r[3], r[1], r[2], r[0]])), false, 'augmented', 'Coefficients of x, y, z first, then the constant.')],
      hints: ['One row per equation.', 'Columns: x, y, z | constant.', `Row 1: ${T.A[0].join(', ')} | ${T.b[0]}.`], solution: augText(aug)
    },
    'fb-solve': {
      type: 'fields', ideas: ['three-var', 'gaussian'], prompt: 'Solve Plan B (row operations, or the solver).',
      fields: ['x', 'y', 'z'].map((v, i) => ({ id: v, label: v, answer: F.plan[i], tolerance: 0.001 })),
      hints: ['Eliminate x from rows 2 and 3.', 'Eliminate y from row 3; solve for z.', 'Back-substitute.'], solution: `(${F.plan.join(', ')}). Check all three equations.`
    },
    'fb-meaning': {
      type: 'choice', ideas: ['interpret', 'three-var'], prompt: 'Interpret Plan B.',
      options: [opt('a', `${F.plan[0]} berms, ${F.plan[1]} jumps and ${F.plan[2]} rock gardens`, true), opt('b', `${F.plan[2]} berms, ${F.plan[1]} jumps and ${F.plan[0]} rock gardens`, false, 'swap-xy', 'x, y, z are berms, jumps, rock gardens in that order.'),
        opt('c', `${F.plan.reduce((a, b) => a + b, 0)} features of any kind`, false, 'intersection-meaning', 'The solution says how many of each kind.'), opt('d', `${F.plan[0]} crew hours, ${F.plan[1]} machine hours and ${F.plan[2]} soil loads`, false, 'intersection-meaning', 'x, y, z count features.')],
      hints: ['x: berms, y: jumps, z: rock gardens.', 'Read your solution in order.', 'Say it in words.'], solution: `Build ${F.plan[0]} berm modules, ${F.plan[1]} jump features and ${F.plan[2]} rock garden sections.`
    },
    'fc-qm': {
      type: 'fields', ideas: ['multiply', 'applications'], prompt: `With Q = [${F.plan.join('  ')}] and the resource matrix M, what is QM (crew hours, machine hours, soil loads)?`,
      fields: C.resources.map((v, j) => ({ id: 'c' + j, label: ['Crew hours', 'Machine hours', 'Soil loads'][j], answer: v, tolerance: 0.001,
        traps: [{ value: F.plan.reduce((s, qq, k) => s + qq * PARK.needs[j][k], 0), code: 'rows-cols', message: 'Use the columns of M (one resource each) against Q.' }] })),
      hints: ['Entry j = Q times column j of M.', `Crew: ${F.plan[0]}·4 + ${F.plan[1]}·3 + ${F.plan[2]}·5.`, 'Then machine and soil.'], solution: `QM = [ ${C.resources.join(', ')} ].`
    },
    'fc-cost': {
      type: 'number', ideas: ['multiply', 'applications'], answer: C.cost, tolerance: 0.001, unit: '$', label: 'QMC', prompt: 'What does it cost? QMC with C = [28, 90, 45].',
      traps: [{ value: C.resources.reduce((a, b) => a + b, 0), code: 'forgot-costs', message: 'Multiply each resource by its price.' }, { value: C.unit.reduce((a, b) => a + b, 0), code: 'forgot-quantities', message: 'That’s one of each feature. Use the plan.' }],
      hints: ['QM × C.', `${C.resources[0]} × 28 + ${C.resources[1]} × 90 + ${C.resources[2]} × 45.`, 'Add the three products.'], solution: `${money(C.cost)}.`
    },
    'fc-budget': {
      type: 'choice', ideas: ['applications', 'interpret'], prompt: `The budget is ${money(F.budget)}. Does the project fit?`,
      options: [opt('a', F.left >= 0 ? `Yes, with ${money(F.left)} to spare` : `No, it’s ${money(-F.left)} over`, true),
        opt('b', F.left >= 0 ? `No, it’s ${money(F.left)} over` : `Yes, with ${money(-F.left)} to spare`, false, 'sign', `Compare: ${money(C.cost)} against ${money(F.budget)}.`),
        opt('c', 'Exactly on budget', false, 'sign', `${money(C.cost)} ≠ ${money(F.budget)}.`),
        opt('d', 'You can’t tell without the crew’s wages', false, 'forgot-costs', 'The wages are in C: the cost already includes them.')],
      hints: ['Compare the cost with the budget.', 'Budget − cost.', 'Positive means money left over.'], solution: F.left >= 0 ? `${money(F.budget)} − ${money(C.cost)} = ${money(F.left)} left: it fits.` : `${money(C.cost)} is ${money(-F.left)} over the ${money(F.budget)} budget: the plan needs to change.`
    }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...M4, ...EXT }));
export const MISSIONS = [
  { id: 'design', n: 1, title: 'The trail design puzzle', short: 'Trail Design Puzzle', minutes: '5–6', focus: 'Two-variable systems · graphing · substitution · elimination',
    blurb: 'How many berms and jumps use exactly the crew’s hours? Solve it three ways.', graded: Object.keys(M1) },
  { id: 'park', n: 2, title: 'Build the entire park', short: 'Build the Entire Park', minutes: '5–6', focus: 'Three-variable systems · augmented matrices · Gaussian elimination',
    blurb: 'Add rock gardens and soil loads: three equations, three unknowns, one row console.', graded: Object.keys(M2) },
  { id: 'workshop', n: 3, title: 'The matrix workshop', short: 'Matrix Workshop', minutes: '5–6', focus: 'Dimensions · addition · scalars · matrix multiplication',
    blurb: 'Organize tools and costs in matrices, then price the whole park in one product.', graded: Object.keys(M3) },
  { id: 'solver', n: 4, title: 'The matrix solver', short: 'Matrix Solver', minutes: '4–5', focus: 'AX = B · determinants · inverse matrices',
    blurb: 'Write the park as one matrix equation and solve it with an inverse.', graded: Object.keys(M4) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (let n = 0; n < PRACTICE_2.length; n++) { const P = practice2(n); for (const id of PRACTICE2_IDS) out[id] = [...new Set([...(out[id] || []), ...P[id].ideas])]; }
  for (let n = 0; n < PRACTICE_3.length; n++) { const P = practice3(n); for (const id of PRACTICE3_IDS) out[id] = [...new Set([...(out[id] || []), ...P[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
