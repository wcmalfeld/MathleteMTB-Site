// The Dream Line Goes Pro: every graded question. Answers come from the
// kit's engines (lesson-kit/equation.js for equations and inequalities,
// expr.js for expressions; exact fractions), never typed in by hand. Each
// question has three progressive hints (concept, method, guided step) and a
// worked solution; traps are anticipated wrong answers with a misconception
// code and a message that teaches.
//
// Lab-drawn types (components/labs.js): 'solver' (choose each move on both
// sides: eq, keepCase, visual) and 'numberline' (build the graph: target, range).

import { solve, solution, setText, contains, parseRelation } from '../../lesson-kit/equation.js';
import { value, parse, toText } from '../../lesson-kit/expr.js';
import { Frac, show } from '../../lesson-kit/frac.js';
import { APPROVAL, CONSTRAINTS, passes } from './project.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const S = x => show(Frac.of(x)).replace(/^-/, '−');
const N = x => Number(Frac.of(x));
const pretty = t => { const R = parseRelation(t, { keepCase: true }); return R.parts.map(p => toText(p)).map((x, i) => (i ? ' ' + R.rels[i - 1] + ' ' : '') + x).join(''); };
const lines = (t, o) => solution(t, o).lines.join('  →  ');
const ans = (t, o) => { const s = solution(t, o).set; return s.kind === 'one' ? N(s.value) : s; };
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || q.type !== 'number') continue;
    const seen = new Set();
    q.traps = (q.traps || []).filter(t => { const k = Math.round(t.value * 1e6); if (seen.has(k) || Math.abs(t.value - q.answer) < 1e-9 || !isFinite(t.value)) return false; seen.add(k); return true; });
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
// A solver question: choose each move; graded by components/labs.js.
const solver = (eq, o = {}) => ({ type: 'solver', eq, keepCase: !!o.keepCase, visual: o.visual || 'steps', level: o.level || 'intermediate', ideas: o.ideas, unit: o.unit || '',
  prompt: o.prompt || `Solve ${pretty(eq)}: choose each move.`, hints: o.hints || ['Your goal is to get the variable by itself.', 'Undo what’s been done to it, in reverse order: brackets and like terms first, then + and −, then × and ÷.', 'Whatever you do to one side, do to the other.'],
  solution: lines(eq, { keepCase: !!o.keepCase }) + (o.after ? '. ' + o.after : '.'), set: solution(eq, { keepCase: !!o.keepCase }).set });
const numberline = (target, range, o = {}) => ({ type: 'numberline', target, range, level: o.level || 'intermediate', ideas: o.ideas || ['graph-inequality'], prompt: o.prompt, hints: o.hints, solution: o.solution || ('The graph of ' + setText(target) + '.') });
const ray = (at, dir, closed, v = 'x') => ({ kind: 'ray', v, at: Frac.of(at), dir, closed });
const interval = (lo, hi, loIn, hiIn, v = 'x') => ({ kind: 'interval', v, lo: Frac.of(lo), hi: Frac.of(hi), loIn, hiIn });
const orSet = (a, aIn, b, bIn, v = 'x') => ({ kind: 'or', v, left: ray(a, 'left', aIn, v), right: ray(b, 'right', bIn, v) });

export const IDEAS = {
  inverse: 'Inverse operations (one step)',
  check: 'Checking solutions by substitution',
  'write-one': 'Writing one-step equations from situations',
  'multi-step': 'Solving multi-step equations',
  distribute: 'Distributing and combining like terms',
  'write-multi': 'Writing multi-step equations from situations',
  'both-sides': 'Variables on both sides',
  special: 'No solution or infinitely many solutions',
  'when-equal': 'When two relationships are equal',
  rearrange: 'Rearranging formulas',
  'use-formula': 'Substituting into rearranged formulas, with units',
  inequality: 'Solving inequalities',
  flip: 'Reversing the sign for a negative',
  'graph-inequality': 'Graphing inequalities on a number line',
  compound: 'Compound inequalities',
  constraints: 'Writing and using real-world limits'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'one', name: 'One-Step Equations', ideas: ['inverse', 'check', 'write-one'] },
  { id: 'multi', name: 'Multi-Step Equations', ideas: ['multi-step', 'distribute', 'write-multi'] },
  { id: 'both', name: 'Variables on Both Sides', ideas: ['both-sides', 'special', 'when-equal'] },
  { id: 'literal', name: 'Literal Equations', ideas: ['rearrange', 'use-formula'] },
  { id: 'ineq', name: 'Inequalities', ideas: ['inequality', 'flip', 'graph-inequality', 'compound', 'constraints'] }
];
export const MISCONCEPTIONS = {
  'one-side': 'Doing an operation to one side only',
  'wrong-inverse': 'Using the wrong inverse operation',
  'divide-before-constant': 'Dividing before removing the added or subtracted constant',
  'distribute-partial': 'Multiplying only the first term inside the brackets',
  'skip-distribute': 'Solving before clearing the brackets',
  'combine-unlike': 'Combining unlike terms',
  'dividing-early': 'Undoing operations before tidying each side',
  'not-original': 'Checking a solution somewhere other than the original equation',
  'equation-setup': 'Setting up the equation from the situation incorrectly',
  'none-vs-all': 'Confusing no solution with infinitely many solutions',
  unrealistic: 'Accepting a solution that doesn’t fit the situation',
  'rearrange-flip': 'Rearranging a formula upside down (r/d for d/r)',
  'rearrange-wrong-op': 'Using the wrong operation to rearrange a formula',
  'time-units': 'Converting hours to minutes incorrectly',
  units: 'Losing or mixing units',
  'run-vs-length': 'Confusing horizontal run with the distance along the trail',
  'sag-parts': 'Mixing up stroke, compression and sag percentage',
  'no-flip': 'Forgetting to reverse the inequality when dividing by a negative',
  direction: 'Graphing or writing an inequality in the wrong direction',
  'open-closed': 'Using an open circle where a closed one is needed, or the reverse',
  endpoint: 'Putting a boundary at the wrong value',
  'or-and': 'Treating an OR inequality as an AND interval, or the reverse',
  'whole-number': 'Ignoring that counts must be whole numbers',
  constraints: 'Missing one of the conditions when checking a plan',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Stage 01: The Setup Garage (one-step)
const ONE = { ideas: ['inverse'], visual: 'balance', level: 'beginner' };
const M1 = {
  'sv-a': solver('x + 8 = 23', { ...ONE, prompt: 'Problem A. A parts inventory has an unknown starting quantity x. Eight components arrive, bringing the total to 23: x + 8 = 23. Choose the move that isolates x.' }),
  'sv-b': solver('x − 6 = 18', { ...ONE, prompt: 'Problem B. Six components are used from an unknown supply, leaving 18: x − 6 = 18.' }),
  'sv-c': solver('4x = 28', { ...ONE, prompt: 'Problem C. Each tabletop needs 4 fictional planning units; the crew allocated 28: 4x = 28.' }),
  'sv-d': solver('x/3 = 8', { ...ONE, prompt: 'Problem D. An inventory split equally across 3 zones gives 8 units each: x/3 = 8.' }),
  'sv-e': solver('−3x = 18', { ...ONE, level: 'intermediate', prompt: 'A negative coefficient: −3x = 18.' }),
  'sv-f': solver('4x = 6', { ...ONE, level: 'intermediate', prompt: 'A fraction answer: four equal shims stack to 6 mm, 4x = 6.', after: 'x = 1.5 mm (3/2)' }),
  'chk-yes': { type: 'choice', ideas: ['check'], level: 'beginner', prompt: 'A mechanic says t = 14 solves 3t = 42. Substitute it into the original equation. Does it work?',
    options: [opt('a', 'Yes: 3(14) = 42, so both sides match', true), opt('b', 'No: 3 + 14 = 17', false, 'arithmetic', '3t means 3 × t: 3 × 14.'), opt('c', 'Yes, because 14 is less than 42', false, 'not-original', 'A check needs both sides to come out equal.'), opt('d', 'You can’t tell without solving again', false, 'not-original', 'Substituting is the check: put 14 in for t.')],
    hints: ['Replace t with 14.', '3(14) = ?', 'Compare with 42.'], solution: '3(14) = 42: the left side equals the right side, so t = 14 satisfies the equation.' },
  'chk-no': { type: 'choice', ideas: ['check'], level: 'beginner', prompt: 'Another mechanic says t = 12. Does it satisfy 3t = 42?',
    options: [opt('a', 'No: 3(12) = 36, and 36 ≠ 42', true), opt('b', 'Yes: it’s close', false, 'not-original', 'Close isn’t equal: the equation doesn’t balance.'), opt('c', 'Yes: 12 + 30 = 42', false, 'not-original', 'Substitute into the original equation, 3t = 42.'), opt('d', 'No: 3(12) = 32', false, 'arithmetic', '3 × 12 = 36.')],
    hints: ['Substitute t = 12.', '3 × 12 = 36.', 'Is 36 equal to 42?'], solution: '3(12) = 36 ≠ 42: the equation doesn’t balance, so t = 12 isn’t a solution.' },
  'chk-orig': { type: 'choice', ideas: ['check'], level: 'intermediate', prompt: 'Why check a solution in the original equation, not in one of your later steps?',
    options: [opt('a', 'A mistake in a later step would be copied into the check; the original equation is the real condition', true), opt('b', 'Later steps are always wrong', false, 'not-original', 'They can be right, but a check there can’t catch a mistake made before it.'), opt('c', 'It doesn’t matter which step you use', false, 'not-original', 'If an earlier step went wrong, every later step agrees with the mistake.'), opt('d', 'Because the original has the biggest numbers', false, 'not-original', 'Size isn’t the reason.')],
    hints: ['What if you made a slip in step 2?', 'Step 3 would agree with the slip.', 'Only the original says what must be true.'], solution: 'Substitute into the original: it’s the actual requirement. A later step may already contain a mistake.' },
  'wr-laps-eq': { type: 'equation', ideas: ['write-one'], level: 'beginner', label: 'Equation', answer: '3t = 42', prompt: 'Three equal practice laps take 42 minutes in total. Write an equation for t, the time for each lap.',
    traps: [{ eq: 't + 3 = 42', code: 'equation-setup', message: 'Three laps of t minutes each: that’s 3 × t, not t + 3.' }, { eq: 't/3 = 42', code: 'equation-setup', message: 'The 42 minutes is the total of three laps: 3t = 42.' }],
    hints: ['What’s unknown? The time for one lap.', 'Three laps of t minutes each.', '3 × t = the total.'], solution: '3t = 42.' },
  'wr-laps': { type: 'number', ideas: ['inverse', 'write-one'], level: 'beginner', label: 't', unit: 'min', answer: 14, prompt: 'Solve it: how long is each lap?', traps: [{ value: 126, code: 'wrong-inverse', message: 'Multiplying undoes division. Here t is multiplied by 3, so divide.' }, { value: 39, code: 'wrong-inverse', message: '3t means 3 × t: divide by 3.' }],
    hints: ['Undo the multiplication.', 'Divide both sides by 3.', '42 ÷ 3.'], solution: 't = 42 ÷ 3 = 14 minutes. Check: 3(14) = 42.' },
  'wr-bikes-eq': { type: 'equation', ideas: ['write-one'], level: 'beginner', label: 'Equation', answer: '6x = 36', prompt: 'Six bikes need 36 identical components in total. Write an equation for x, the components per bike.',
    traps: [{ eq: 'x + 6 = 36', code: 'equation-setup', message: 'Each of the 6 bikes needs x: that’s 6 × x.' }], hints: ['Unknown: components per bike.', 'Six bikes, x each.', '6x = total.'], solution: '6x = 36.' },
  'wr-bikes': { type: 'number', ideas: ['inverse', 'write-one'], level: 'beginner', label: 'x', unit: 'per bike', answer: 6, prompt: 'Solve it.', traps: [{ value: 216, code: 'wrong-inverse', message: 'Divide, don’t multiply.' }, { value: 30, code: 'wrong-inverse', message: '6x means 6 × x: divide by 6.' }],
    hints: ['Undo × 6.', 'Divide both sides by 6.', '36 ÷ 6.'], solution: 'x = 6. Check: 6(6) = 36.' },
  'wr-kits-eq': { type: 'equation', ideas: ['write-one'], level: 'intermediate', label: 'Equation', answer: 'x − 7 = 18', prompt: 'Seven equipment kits have been used, leaving 18. Write an equation for x, the number of kits there were to begin with.',
    traps: [{ eq: 'x + 7 = 18', code: 'equation-setup', message: 'Kits were used, so 7 is taken away from the starting number.' }, { eq: '7 − x = 18', code: 'equation-setup', message: 'Start with x kits, then take 7 away: x − 7.' }], hints: ['Start with x.', 'Seven were used: subtract.', 'What’s left is 18.'], solution: 'x − 7 = 18.' },
  'wr-kits': { type: 'number', ideas: ['inverse', 'write-one'], level: 'intermediate', label: 'x', unit: 'kits', answer: 25, prompt: 'Solve it.', traps: [{ value: 11, code: 'wrong-inverse', message: 'Undo subtraction with addition: add 7.' }],
    hints: ['Undo − 7.', 'Add 7 to both sides.', '18 + 7.'], solution: 'x = 25. Check: 25 − 7 = 18.' },
  'wr-groups-eq': { type: 'equation', ideas: ['write-one'], level: 'intermediate', label: 'Equation', answer: 'x/3 = 18', prompt: 'An unknown inventory x is divided equally into three groups, with 18 units in each. Write an equation.',
    traps: [{ eq: '3x = 18', code: 'equation-setup', message: 'The inventory is divided into 3 groups: x ÷ 3.' }], hints: ['Start with x.', 'Divided into 3 equal groups.', 'Each group has 18.'], solution: 'x/3 = 18.' },
  'wr-groups': { type: 'number', ideas: ['inverse', 'write-one'], level: 'intermediate', label: 'x', unit: 'units', answer: 54, prompt: 'Solve it.', traps: [{ value: 6, code: 'wrong-inverse', message: 'x is divided by 3, so multiply by 3 to undo it.' }],
    hints: ['Undo ÷ 3.', 'Multiply both sides by 3.', '18 × 3.'], solution: 'x = 54. Check: 54 ÷ 3 = 18.' },
  'sv-sag': solver('S/50 = 0.30', { ...ONE, keepCase: true, level: 'intermediate', ideas: ['inverse'], unit: 'mm', prompt: 'A shock has a 50 mm stroke and a fictional setup sheet lists 30% sag, so S/50 = 0.30. Find S, the compression to measure.', after: 'S = 15 mm of measured compression (classroom values)' }),
  'sg-mm': { type: 'number', ideas: ['inverse'], level: 'intermediate', label: 'S', unit: 'mm', answer: V('60 × 0.25'), prompt: 'A different classroom setup sheet: 60 mm stroke, 25% sag. Solve S/60 = 0.25.',
    traps: [{ value: 240, code: 'wrong-inverse', message: 'S is divided by 60, so multiply both sides by 60, don’t divide.' }, { value: 1500, code: 'units', message: '25% is 0.25 as a decimal.' }],
    hints: ['Undo ÷ 60.', 'Multiply both sides by 60.', '0.25 × 60.'], solution: 'S = 0.25 × 60 = 15 mm.' }
};
function V(e) { return Number(value(e)); }
// Practice: new one-step stories.
export const ONE_PRACTICE = [
  { story: 'After 9 more spokes arrive, there are 41 in the bin.', eq: 'x + 9 = 41', unit: 'spokes', letter: 'x', name: 'the spokes there were before' },
  { story: 'Five equal setup sessions take 75 minutes in total.', eq: '5t = 75', unit: 'min', letter: 't', name: 'the length of each session' },
  { story: 'Twelve bolts are used, leaving 30 in the tray.', eq: 'x − 12 = 30', unit: 'bolts', letter: 'x', name: 'the bolts in the tray to begin with' },
  { story: 'An order is shared equally by 4 riders, and each gets 7 tubes.', eq: 'x/4 = 7', unit: 'tubes', letter: 'x', name: 'the tubes in the order' },
  { story: 'Eight identical brake pads cost $36 in total.', eq: '8p = 36', unit: '$ each', letter: 'p', name: 'the price of one pad' },
  { story: 'A tire loses 6 psi overnight and reads 22 psi in the morning.', eq: 'x − 6 = 22', unit: 'psi', letter: 'x', name: 'the pressure the night before' }
].map(p => ({ ...p, answer: ans(p.eq) }));
export const ONE_PRACTICE_IDS = ['gx-eq', 'gx-val'];
export function onePractice(n) {
  const X = pick(ONE_PRACTICE, n);
  return tidy({
    brief: `Setup sheet ${n + 1}: “${X.story}”`,
    'gx-eq': { type: 'equation', ideas: ['write-one'], level: 'intermediate', label: 'Equation', answer: X.eq, prompt: `Write an equation, using ${X.letter} for ${X.name}.`, hints: ['What’s unknown?', 'What happened to it: added, taken away, multiplied or shared?', 'Set that equal to the number you know.'], solution: pretty(X.eq) + '.' },
    'gx-val': { type: 'number', ideas: ['inverse', 'write-one'], level: 'intermediate', label: X.letter, unit: X.unit, answer: X.answer, prompt: 'Solve it.', hints: ['Undo the operation.', 'Use its inverse on both sides.', lines(X.eq).split('  →  ')[0] + '…'], solution: lines(X.eq) + '.' }
  });
}

// ================================================================ Stage 02: The Build Crew (multi-step)
const MS = { ideas: ['multi-step'], visual: 'steps' };
const M2 = {
  'bg-eq': { type: 'equation', ideas: ['write-multi'], level: 'beginner', label: 'Equation', answer: '45 + 12h = 105', prompt: 'Your budget is $105. A fictional equipment rental package costs $45 up front plus $12 for every rental hour h. Write an equation for the hours that use the whole budget.',
    traps: [{ eq: '45h + 12 = 105', code: 'equation-setup', message: 'The $12 is per hour, so it multiplies h; the $45 is paid once.' }, { eq: '12h = 105', code: 'equation-setup', message: 'Include the $45 up-front fee.' }],
    hints: ['Fixed part + per-hour part = budget.', 'The per-hour part is 12 × h.', '45 + 12h = …'], solution: '45 + 12h = 105.' },
  'sv-budget': solver('45 + 12h = 105', { ...MS, level: 'beginner', unit: 'hours', prompt: 'Solve 45 + 12h = 105: choose each move.', after: 'Five rental hours fit the budget exactly' }),
  'sv-mat': solver('3(x + 4) + 2(x + 1) = 29', { ideas: ['multi-step', 'distribute'], level: 'intermediate', prompt: 'Three jump zones each get x standard markers + 4 setup markers; two service zones each get x + 1. The total inventory is 29: 3(x + 4) + 2(x + 1) = 29.' }),
  'mat-check': { type: 'number', ideas: ['check', 'multi-step'], level: 'intermediate', label: 'Total', answer: V('3(3 + 4) + 2(3 + 1)'), prompt: 'Verify x = 3 in the original equation: 3(3 + 4) + 2(3 + 1) = ?',
    traps: [{ value: V('3 × 3 + 4 + 2 × 3 + 1'), code: 'distribute-partial', message: 'Work out each bracket first: 3(7) + 2(4).' }], hints: ['Brackets first.', '3(7) + 2(4).', '21 + 8.'], solution: '3(7) + 2(4) = 21 + 8 = 29 ✓.' },
  'di-fill': { type: 'number', ideas: ['distribute'], level: 'beginner', label: '?', answer: 12, prompt: 'Four packages each hold x standard pieces and 3 setup pieces: 4(x + 3) = 4x + ?',
    traps: [{ value: 3, code: 'distribute-partial', message: 'The 4 multiplies the 3 too: 4 packages × 3 pieces.' }, { value: 7, code: 'wrong-inverse', message: 'Multiply 4 × 3, don’t add.' }], hints: ['Every package has 3 setup pieces.', '4 packages.', '4 × 3.'], solution: '4(x + 3) = 4x + 12.' },
  'di-exp': { type: 'expression', ideas: ['distribute'], level: 'beginner', form: 'simplified', label: 'Expanded', answer: '2x + 10', vars: ['x'], prompt: 'Distribute 2(x + 5).',
    traps: [{ expr: '2x + 5', code: 'distribute-partial', message: 'The 2 multiplies the 5 as well.' }], hints: ['Multiply 2 by each term.', '2 × x and 2 × 5.', '2x + …'], solution: '2(x + 5) = 2x + 10.' },
  'sv-dist': solver('4(x + 3) + 2x = 42', { ideas: ['multi-step', 'distribute'], level: 'intermediate', prompt: 'Four packages of x + 3 pieces plus 2x more pieces make 42: 4(x + 3) + 2x = 42.' }),
  'ch-kits-eq': { type: 'equation', ideas: ['write-multi'], level: 'intermediate', label: 'Equation', answer: '30 + 15x = 150', prompt: 'Challenge 1: $30 of site preparation plus $15 per construction kit x, with $150 available. Write the equation.',
    traps: [{ eq: '30x + 15 = 150', code: 'equation-setup', message: 'The $15 is per kit; the $30 is paid once.' }], hints: ['Fixed + per-kit = available.', 'Per kit: 15x.', '30 + 15x = …'], solution: '30 + 15x = 150.' },
  'ch-kits': { type: 'number', ideas: ['multi-step'], level: 'intermediate', label: 'x', unit: 'kits', answer: ans('30 + 15x = 150'), prompt: 'Solve it: how many kits?', traps: [{ value: 12, code: 'divide-before-constant', message: 'Subtract the 30 first: 15x = 120.' }],
    hints: ['Subtract 30 from both sides.', '15x = 120.', 'Divide by 15.'], solution: lines('30 + 15x = 150') + '.' },
  'ch-pack-eq': { type: 'equation', ideas: ['write-multi', 'distribute'], level: 'advanced', label: 'Equation', answer: '3(x + 2) + 4 = 28', prompt: 'Challenge 2: three packages each contain x + 2 items, plus four extra items. The total is 28. Write the equation.',
    traps: [{ eq: '3x + 2 + 4 = 28', code: 'distribute-partial', message: 'Each package has x + 2 items: the 3 multiplies the whole x + 2, so use brackets.' }], hints: ['One package: x + 2.', 'Three packages: 3(x + 2).', 'Plus the 4 extras.'], solution: '3(x + 2) + 4 = 28.' },
  'ch-pack': { type: 'number', ideas: ['multi-step', 'distribute'], level: 'advanced', label: 'x', answer: ans('3(x + 2) + 4 = 28'), prompt: 'Solve it.', traps: [{ value: V('22/3'), code: 'distribute-partial', message: 'Distribute to both terms: 3x + 6 + 4.' }],
    hints: ['Distribute: 3x + 6 + 4 = 28.', 'Combine: 3x + 10 = 28.', 'Subtract 10, then divide by 3.'], solution: lines('3(x + 2) + 4 = 28') + '.' },
  'ch-zones': { type: 'number', ideas: ['multi-step', 'distribute'], level: 'advanced', label: 'x', answer: ans('4(x + 3) + 2x = 30'), prompt: 'Challenge 3: four feature zones each use x + 3 units, plus 2x for the central area, 30 units in total: 4(x + 3) + 2x = 30.',
    traps: [{ value: V('(30 − 3)/6'), code: 'distribute-partial', message: 'The 4 multiplies the 3 as well: 4x + 12.' }], hints: ['Distribute: 4x + 12 + 2x.', 'Combine: 6x + 12 = 30.', 'Subtract 12, divide by 6.'], solution: lines('4(x + 3) + 2x = 30') + '.' }
};
export const MULTI_PRACTICE = [
  { story: 'A $20 entry fee plus $8 per uplift run r comes to $68.', eq: '20 + 8r = 68', letter: 'r', unit: 'runs' },
  { story: 'Two crews each build x + 5 berms, plus 3 rollers: 21 features in all.', eq: '2(x + 5) + 3 = 21', letter: 'x', unit: 'berms' },
  { story: 'Five packs, each with x stakes plus 2 spares, hold 45 stakes.', eq: '5(x + 2) = 45', letter: 'x', unit: 'stakes' },
  { story: '$15 parking plus $6.50 per hour h of bike rental comes to $41.', eq: '15 + 6.5h = 41', letter: 'h', unit: 'hours' },
  { story: 'Three zones get x + 4 flags each and the start area gets x flags: 32 flags.', eq: '3(x + 4) + x = 32', letter: 'x', unit: 'flags' },
  { story: 'A $90 budget covers an $18 tool rental plus $9 per tube t.', eq: '18 + 9t = 90', letter: 't', unit: 'tubes' }
].map(p => ({ ...p, answer: ans(p.eq) }));
export const MULTI_PRACTICE_IDS = ['cx-eq', 'cx-val'];
export function multiPractice(n) {
  const X = pick(MULTI_PRACTICE, n);
  return tidy({
    brief: `Crew job ${n + 1}: “${X.story}”`,
    'cx-eq': { type: 'equation', ideas: ['write-multi'], level: 'advanced', label: 'Equation', answer: X.eq, prompt: `Write the equation, using ${X.letter}.`, hints: ['Which part repeats, and which is fixed?', 'A repeated group goes in brackets times the count.', 'Set the total equal to the known amount.'], solution: pretty(X.eq) + '.' },
    'cx-val': { type: 'number', ideas: ['multi-step'], level: 'advanced', label: X.letter, unit: X.unit, answer: X.answer, prompt: 'Solve it.', hints: ['Distribute and combine like terms first.', 'Undo + and −.', 'Then undo × and ÷.'], solution: lines(X.eq) + '.' }
  });
}

// ================================================================ Stage 03: The Design Showdown (both sides)
export const DESIGNS = {
  ab: { a: { name: 'Design A', fixed: 18, rate: 6, text: '18 + 6f' }, b: { name: 'Design B', fixed: 30, rate: 4, text: '30 + 4f' }, note: 'Different starts, different rates: the lines cross.' },
  none: { a: { name: 'Proposal 1', fixed: 12, rate: 5, text: '12 + 5f' }, b: { name: 'Proposal 2', fixed: 20, rate: 5, text: '20 + 5f' }, note: 'Same rate, different starts: parallel lines that never meet.' },
  all: { a: { name: 'Plan written one way', fixed: 12, rate: 3, text: '3(f + 4)' }, b: { name: 'The same plan, distributed', fixed: 12, rate: 3, text: '3f + 12' }, note: 'The same relationship twice: the lines lie on top of each other.' }
};
const TYPE_OPTS = (right, extra) => [opt('one', 'One solution', right === 'one', 'none-vs-all', extra && extra.one), opt('none', 'No solution', right === 'none', 'none-vs-all', extra && extra.none), opt('all', 'Infinitely many solutions', right === 'all', 'none-vs-all', extra && extra.all)];
const kindOf = eq => solve(eq).kind;
const M3 = {
  'sv-ab': solver('18 + 6f = 30 + 4f', { ideas: ['both-sides', 'when-equal'], level: 'intermediate', prompt: 'Set the designs equal: 18 + 6f = 30 + 4f. Choose each move.', after: 'At 6 features both designs cost the same' }),
  'ab-cost': { type: 'number', ideas: ['when-equal', 'check'], level: 'beginner', label: 'Cost', unit: 'credits', answer: V('18 + 6(6)'), prompt: 'Check: what does each design cost at f = 6?', traps: [{ value: 36, code: 'arithmetic', message: 'Include the starting estimate: 18 + 36.' }],
    hints: ['Substitute f = 6 into both.', 'A: 18 + 6(6). B: 30 + 4(6).', 'Both should match.'], solution: 'A: 18 + 36 = 54. B: 30 + 24 = 54. Both 54 credits.' },
  'sv-none': solver('12 + 5f = 20 + 5f', { ideas: ['both-sides', 'special'], level: 'advanced', prompt: 'Two proposals: 12 + 5f and 20 + 5f. Set them equal and choose each move.' }),
  'none-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'advanced', prompt: 'The f terms vanished and left 12 = 20. What does that tell you?',
    options: TYPE_OPTS('none', { one: '12 = 20 has no f in it, and it’s false for every f.', all: '12 = 20 is never true. “Always true” would look like 12 = 12.' }),
    hints: ['Is 12 = 20 ever true?', 'The costs rise at the same rate, 5 per feature.', 'One always starts 8 credits higher.'], solution: 'No solution: 12 = 20 is never true. The lines are parallel; Proposal 2 is always 8 credits more.' },
  'sv-all': solver('3(f + 4) = 3f + 12', { ideas: ['both-sides', 'special', 'distribute'], level: 'advanced', prompt: 'Two ways of writing a plan: 3(f + 4) and 3f + 12. Set them equal and choose each move.' }),
  'all-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'advanced', prompt: 'You reached 12 = 12. What does that tell you?',
    options: TYPE_OPTS('all', { one: 'There’s no f left to solve for, and 12 = 12 is true whatever f is.', none: '12 = 12 is always true, not never.' }),
    hints: ['Is 12 = 12 ever false?', 'Both expressions are the same relationship.', 'Every value of f works.'], solution: 'Infinitely many solutions: 12 = 12 is always true. The expressions are the same plan, so the lines overlap completely.' },
  'dc1-eq': { type: 'equation', ideas: ['both-sides', 'write-multi'], level: 'intermediate', label: 'Equation', answer: '40 + 5v = 10 + 8v', prompt: 'Membership plans: Plan A is $40 plus $5 per visit; Plan B is $10 plus $8 per visit. Write the equation for when they cost the same (v visits).',
    traps: [{ eq: '40 + 8v = 10 + 5v', code: 'equation-setup', message: 'Keep each plan’s own fee with its own rate: $40 goes with $5 per visit.' }], hints: ['Plan A = Plan B.', 'A: 40 + 5v.', 'B: 10 + 8v.'], solution: '40 + 5v = 10 + 8v.' },
  'dc1-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'intermediate', prompt: 'How many solutions does 40 + 5v = 10 + 8v have?', options: TYPE_OPTS(kindOf('40 + 5v = 10 + 8v')),
    hints: ['Compare the rates.', 'Different rates: the lines cross once.', 'Different rates always give one solution.'], solution: 'One solution: the rates differ (5 vs 8), so the lines cross exactly once.' },
  'dc1-val': { type: 'number', ideas: ['both-sides'], level: 'intermediate', label: 'v', unit: 'visits', answer: ans('40 + 5v = 10 + 8v'), prompt: 'Solve it.', traps: [{ value: V('50/13'), code: 'wrong-inverse', message: 'Collect the v terms: subtract 5v from both sides.' }],
    hints: ['Subtract 5v from both sides.', '40 = 10 + 3v.', 'Subtract 10, divide by 3.'], solution: lines('40 + 5v = 10 + 8v') + '. At 10 visits both plans cost $90.' },
  'dc2-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'advanced', prompt: 'Feature production estimates: Crew 1 has 14 + 3d features after d days, Crew 2 has 6 + 3d. When are they equal? Classify 14 + 3d = 6 + 3d.', options: TYPE_OPTS(kindOf('14 + 3d = 6 + 3d')),
    hints: ['Subtract 3d from both sides.', '14 = 6.', 'Is that ever true?'], solution: 'No solution: 14 = 6 is false. Both crews build 3 a day, so Crew 1 stays 8 ahead.' },
  'dc3-type': { type: 'choice', keepOrder: true, ideas: ['special', 'distribute'], level: 'advanced', prompt: 'Rental plans: Shop 1 charges 25 + 6h; Shop 2 charges 6(h + 4) + 1. Classify 25 + 6h = 6(h + 4) + 1.', options: TYPE_OPTS(kindOf('25 + 6h = 6(h + 4) + 1')),
    hints: ['Distribute the right side.', '6h + 24 + 1 = 6h + 25.', 'Compare the two sides.'], solution: 'Infinitely many: 6(h + 4) + 1 = 6h + 25, the same as Shop 1. Every number of hours costs the same at both.' },
  'dc4-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'intermediate', prompt: 'Service packages: 50 + 4s and 20 + 7s for s services. Classify 50 + 4s = 20 + 7s.', options: TYPE_OPTS(kindOf('50 + 4s = 20 + 7s')),
    hints: ['Compare the rates.', '4 and 7 differ.', 'The lines cross once.'], solution: 'One solution: the rates differ.' },
  'dc4-val': { type: 'number', ideas: ['both-sides'], level: 'intermediate', label: 's', unit: 'services', answer: ans('50 + 4s = 20 + 7s'), prompt: 'Solve it.', hints: ['Subtract 4s from both sides.', '50 = 20 + 3s.', 'Subtract 20, divide by 3.'], solution: lines('50 + 4s = 20 + 7s') + '.' },
  'dc5-val': { type: 'number', ideas: ['both-sides'], level: 'advanced', label: 'f', unit: 'features', answer: ans('10 + 6f = 25 + 4f'), prompt: 'Construction proposals: 10 + 6f and 25 + 4f credits. Solve 10 + 6f = 25 + 4f.',
    hints: ['Subtract 4f.', '10 + 2f = 25.', 'Subtract 10, divide by 2.'], solution: lines('10 + 6f = 25 + 4f') + '.' },
  'dc5-real': { type: 'choice', ideas: ['when-equal'], level: 'advanced', prompt: 'Is there a number of features where these two proposals cost exactly the same?',
    options: [opt('a', 'No: f = 7.5, and a park can’t have half a feature', true), opt('b', 'Yes: 7.5 features', false, 'unrealistic', 'Feature counts are whole numbers: 7.5 doesn’t fit the situation.'), opt('c', 'Yes: round to 8', false, 'unrealistic', 'At 8 features they cost 58 and 57: not equal.'), opt('d', 'No: they’re parallel', false, 'none-vs-all', 'The rates differ (6 vs 4), so the lines do cross, at 7.5.')],
    hints: ['What did you get for f?', 'Can f be 7.5 here?', 'Check f = 7 and f = 8.'], solution: 'Algebraically f = 7.5, but feature counts are whole numbers. At 7 features the costs are 52 and 53; at 8, 58 and 57. They never match exactly.' }
};
export const BOTH_PRACTICE = [
  { story: 'Tool rental: 15 + 4d vs 3 + 6d for d days.', eq: '15 + 4d = 3 + 6d', letter: 'd' },
  { story: 'Two flag orders: 9 + 2n and 2(n + 3) + 3 flags for n lines.', eq: '9 + 2n = 2(n + 3) + 3', letter: 'n' },
  { story: 'Marker crews: 30 + 5h and 12 + 5h markers placed after h hours.', eq: '30 + 5h = 12 + 5h', letter: 'h' },
  { story: 'Shuttle passes: 60 + 3r vs 24 + 7r for r rides.', eq: '60 + 3r = 24 + 7r', letter: 'r' },
  { story: 'Signs: 4(s + 2) and 4s + 9 credits for s signs.', eq: '4(s + 2) = 4s + 9', letter: 's' },
  { story: 'Shaping: 8 + 9x vs 3(3x + 1) + 5 crew-hours for x features.', eq: '8 + 9x = 3(3x + 1) + 5', letter: 'x' }
].map(p => ({ ...p, kind: kindOf(p.eq) }));
export const BOTH_PRACTICE_IDS = ['vx-eq', 'vx-type'];
export function bothPractice(n) {
  const X = pick(BOTH_PRACTICE, n), sol = solution(X.eq).set;
  return arrange({
    brief: `Comparison ${n + 1}: ${X.story}`,
    'vx-eq': { type: 'equation', ideas: ['both-sides', 'write-multi'], level: 'advanced', label: 'Equation', answer: X.eq, prompt: `Set the two expressions equal (use ${X.letter}).`, hints: ['One expression = the other.', 'Keep each with its own numbers.', 'Use = between them.'], solution: pretty(X.eq) + '.' },
    'vx-type': { type: 'choice', keepOrder: true, ideas: ['special', 'both-sides'], level: 'advanced', prompt: 'Solve it. How many solutions are there?', options: TYPE_OPTS(X.kind),
      hints: ['Distribute and combine first.', 'Collect the variable terms on one side.', 'Did the variable vanish? Is what’s left true or false?'], solution: lines(X.eq) + ': ' + setText(sol) + '.' }
  });
}

// ================================================================ Stage 04: The Formula Garage (literal)
const FORM = (answer, vars, target, traps, o = {}) => ({ type: 'expression', ideas: ['rearrange'], level: o.level || 'intermediate', label: target + ' =', answer, vars, prompt: o.prompt, traps: traps || [],
  hints: o.hints || ['Find what’s being done to ' + target + '.', 'Undo it on both sides with inverse operations.', 'Keep going until ' + target + ' is alone.'], solution: o.solution });
const M4 = {
  'fm-t-form': FORM('d/r', ['d', 'r'], 't', [{ expr: 'r/d', code: 'rearrange-flip', message: 'Upside down: d = rt means t = d ÷ r. Check: d/r × r = d.' }, { expr: 'd*r', code: 'rearrange-wrong-op', message: 'r multiplies t, so divide by r to undo it.' }, { expr: 'd - r', code: 'rearrange-wrong-op', message: 'r multiplies t: undo with division, not subtraction.' }],
    { level: 'beginner', prompt: 'Rearrange d = rt to solve for t. Type the right side: t = …', solution: 'Divide both sides by r: t = d/r.' }),
  'fm-t': { type: 'number', ideas: ['use-formula'], level: 'beginner', label: 't', unit: 'h', answer: V('4.8/16'), prompt: 'A hypothetical downhill section is 4.8 km long, at an average speed of 16 km/h. Find the time in hours.',
    traps: [{ value: V('16/4.8'), code: 'rearrange-flip', message: 't = d/r: distance ÷ speed.' }, { value: V('4.8 × 16'), code: 'rearrange-wrong-op', message: 'Divide distance by speed.' }], hints: ['t = d/r.', 't = 4.8/16.', '4.8 ÷ 16.'], solution: 't = 4.8/16 = 0.3 hours.' },
  'fm-min': { type: 'number', ideas: ['use-formula'], level: 'intermediate', label: 'Time', unit: 'min', answer: V('0.3 × 60'), prompt: 'Convert 0.3 hours to minutes.',
    traps: [{ value: 30, code: 'time-units', message: 'An hour has 60 minutes, not 100: 0.3 × 60.' }, { value: 3, code: 'time-units', message: 'Multiply by 60 minutes per hour.' }, { value: 0.005, code: 'time-units', message: 'Multiply by 60; don’t divide.' }], hints: ['1 hour = 60 minutes.', '0.3 of an hour.', '0.3 × 60.'], solution: '0.3 × 60 = 18 minutes.' },
  'fm-r-form': FORM('d/t', ['d', 't'], 'r', [{ expr: 't/d', code: 'rearrange-flip', message: 'Upside down: r = d ÷ t.' }, { expr: 'd*t', code: 'rearrange-wrong-op', message: 't multiplies r, so divide by t.' }], { prompt: 'Rearrange d = rt to solve for r.', solution: 'Divide both sides by t: r = d/t.' }),
  'fm-r': { type: 'number', ideas: ['use-formula'], level: 'intermediate', label: 'r', unit: 'km/h', answer: V('9/0.5'), prompt: 'A rider covers 9 km in 0.5 hours. Find the average speed.',
    traps: [{ value: 4.5, code: 'rearrange-wrong-op', message: 'r = d/t = 9 ÷ 0.5. Dividing by a half doubles it.' }, { value: V('0.5/9'), code: 'rearrange-flip', message: 'Distance ÷ time.' }], hints: ['r = d/t.', '9 ÷ 0.5.', 'How many halves in 9?'], solution: 'r = 9/0.5 = 18 km/h.' },
  'fm-d': { type: 'number', ideas: ['use-formula'], level: 'beginner', label: 'd', unit: 'km', answer: V('20 × 0.25'), prompt: 'At 20 km/h for 0.25 hours, how far does a rider go?', traps: [{ value: 80, code: 'rearrange-wrong-op', message: 'd = rt: multiply.' }],
    hints: ['d = rt.', '20 × 0.25.', 'A quarter of 20.'], solution: 'd = 20 × 0.25 = 5 km.' },
  'gr-pick': { type: 'choice', ideas: ['rearrange'], level: 'intermediate', prompt: 'You know the grade (6%) and the horizontal run (300 ft) and need the rise. Which form of G = 100R/L do you need?',
    options: [opt('a', 'R = GL/100', true), opt('b', 'L = 100R/G', false, 'rearrange-wrong-op', 'That finds the run. You need the rise, R.'), opt('c', 'G = 100R/L', false, 'rearrange-wrong-op', 'That finds the grade, which you already know.'), opt('d', 'R = 100/(GL)', false, 'rearrange-flip', 'Multiply both sides by L, then divide by 100: R = GL/100.')],
    hints: ['Choose the unknown first: R.', 'Which form has R alone?', 'Multiply by L, divide by 100.'], solution: 'R = GL/100: multiply both sides by L, then divide by 100.' },
  'gr-a': { type: 'number', ideas: ['use-formula'], level: 'beginner', label: 'G', unit: '%', answer: V('100(18)/300'), prompt: 'Challenge A. A connector rises 18 ft over a 300 ft horizontal run. G = 100R/L. Find the grade.',
    traps: [{ value: 0.06, code: 'units', message: 'The 100 in the formula turns it into a percentage: 6%.' }, { value: V('100(300)/18'), code: 'rearrange-flip', message: 'Rise over run: 18 on top.' }], hints: ['Substitute R = 18, L = 300.', '100(18)/300.', '1800 ÷ 300.'], solution: 'G = 100(18)/300 = 6%.' },
  'gr-b': { type: 'number', ideas: ['use-formula', 'rearrange'], level: 'intermediate', label: 'R', unit: 'ft', answer: V('6(300)/100'), prompt: 'Challenge B. A design has a 6% grade and a 300 ft run. Find the rise with R = GL/100.',
    traps: [{ value: 1800, code: 'rearrange-wrong-op', message: 'Divide by 100 as well.' }, { value: 5000, code: 'rearrange-flip', message: 'R = GL/100.' }], hints: ['R = GL/100.', '6 × 300 / 100.', '1800 ÷ 100.'], solution: 'R = 6(300)/100 = 18 ft.' },
  'gr-c': { type: 'number', ideas: ['use-formula', 'rearrange'], level: 'intermediate', label: 'L', unit: 'ft', answer: V('100(18)/6'), prompt: 'Challenge C. A section rises 18 ft at a 6% grade. Find the horizontal run with L = 100R/G.',
    traps: [{ value: 1.08, code: 'rearrange-flip', message: 'L = 100R/G: 100 × 18 ÷ 6.' }], hints: ['L = 100R/G.', '100 × 18 ÷ 6.', '1800 ÷ 6.'], solution: 'L = 100(18)/6 = 300 ft.' },
  'gr-run': { type: 'choice', ideas: ['use-formula'], level: 'intermediate', prompt: 'A rider follows that connector from bottom to top. Is the distance ridden the same as the 300 ft horizontal run?',
    options: [opt('a', 'No: the trail goes along the slope, a little longer than the horizontal run', true), opt('b', 'Yes: they’re the same thing', false, 'run-vs-length', 'The run is measured flat, like on a map; the trail climbs as it goes.'), opt('c', 'No: the ridden distance is shorter', false, 'run-vs-length', 'The sloping side of a right triangle is its longest side.'), opt('d', 'Yes, because the grade is small', false, 'run-vs-length', 'Small grade means nearly equal, but not the same.')],
    hints: ['Picture a right triangle.', 'Run is the flat side; rise is the vertical side.', 'The trail is the sloping side.'], solution: 'Grade uses horizontal run. The trail along the slope is √(300² + 18²) ≈ 300.5 ft: slightly longer.' },
  'sp-s-form': FORM('PT/100', ['p', 't'], 'S', [{ expr: '100/(PT)', code: 'rearrange-flip', message: 'Multiply both sides by T, then divide by 100: S = PT/100.' }, { expr: '100PT', code: 'rearrange-wrong-op', message: 'Divide by 100, don’t multiply.' }], { prompt: 'Rearrange P = 100S/T to solve for S.', solution: 'Multiply both sides by T: PT = 100S. Divide by 100: S = PT/100.' }),
  'sp-s': { type: 'number', ideas: ['use-formula'], level: 'intermediate', label: 'S', unit: 'mm', answer: V('30(50)/100'), prompt: 'Fictional setup sheet: target sag 30%, shock stroke 50 mm. Find the compression S = PT/100.',
    traps: [{ value: 1500, code: 'rearrange-wrong-op', message: 'Divide by 100.' }], hints: ['S = PT/100.', '30 × 50 / 100.', '1500 ÷ 100.'], solution: 'S = 30(50)/100 = 15 mm.' },
  'sp-p': { type: 'number', ideas: ['use-formula'], level: 'intermediate', label: 'P', unit: '%', answer: V('100(15)/50'), prompt: 'Reverse it: measured compression 15 mm, total stroke 50 mm. P = 100S/T. Find the sag percentage.',
    traps: [{ value: 0.3, code: 'units', message: 'The 100 makes it a percentage: 30%.' }, { value: V('100(50)/15'), code: 'rearrange-flip', message: 'Compression on top: 100 × 15 ÷ 50.' }], hints: ['P = 100S/T.', '100 × 15 / 50.', '1500 ÷ 50.'], solution: 'P = 100(15)/50 = 30%.' },
  'sp-t-form': FORM('100S/P', ['s', 'p'], 'T', [{ expr: 'P/(100S)', code: 'rearrange-flip', message: 'Multiply by T, then divide by P: T = 100S/P.' }, { expr: '100SP', code: 'rearrange-wrong-op', message: 'P multiplies T after you clear the fraction, so divide by P.' }], { level: 'advanced', prompt: 'Rearrange P = 100S/T to solve for T.', solution: 'Multiply both sides by T: PT = 100S. Divide by P: T = 100S/P.' }),
  'sp-t': { type: 'number', ideas: ['use-formula'], level: 'advanced', label: 'T', unit: 'mm', answer: V('100(15)/30'), prompt: 'Sag 30% with 15 mm of compression: what is the total stroke? T = 100S/P.',
    traps: [{ value: 4.5, code: 'rearrange-flip', message: 'T = 100S/P = 100 × 15 ÷ 30.' }], hints: ['T = 100S/P.', '100 × 15 / 30.', '1500 ÷ 30.'], solution: 'T = 100(15)/30 = 50 mm.' },
  'sp-parts': { type: 'choice', ideas: ['use-formula'], level: 'beginner', prompt: 'On the rear shock, which quantity does the O-ring measure when the rider sits on the bike?',
    options: [opt('a', 'The compression S: how far the shaft moved into the shock', true), opt('b', 'The total stroke T', false, 'sag-parts', 'The stroke is the shock’s full travel, fixed by its design.'), opt('c', 'The sag percentage P', false, 'sag-parts', 'P is calculated from S and T; it isn’t measured directly.'), opt('d', 'The rider’s weight', false, 'sag-parts', 'The O-ring shows a distance in mm.')],
    hints: ['The O-ring is pushed along the shaft.', 'It shows a distance.', 'P is worked out afterwards.'], solution: 'The O-ring measures compression S (mm). Stroke T is the shock’s total travel; sag P = 100S/T is calculated.' },
  'st-l-form': FORM('100R/G', ['r', 'g'], 'L', [{ expr: 'G/(100R)', code: 'rearrange-flip', message: 'Multiply by L, then divide by G: L = 100R/G.' }, { expr: 'GR/100', code: 'rearrange-wrong-op', message: 'That’s the form for R, with letters swapped. For L: L = 100R/G.' }], { level: 'advanced', prompt: 'From the studio: solve G = 100R/L for L.', solution: 'Multiply both sides by L: GL = 100R. Divide by G: L = 100R/G.' })
};
export const FORMULA_PRACTICE = [
  { story: 'A 3.6 km climb ridden at 9 km/h. How long does it take?', target: 't', form: 'd/r', vars: ['d', 'r'], calc: '3.6/9', unit: 'h' },
  { story: 'A 4% grade over a 450 ft horizontal run. What is the rise?', target: 'R', form: 'GL/100', vars: ['g', 'l'], calc: '4(450)/100', unit: 'ft' },
  { story: 'A 55 mm stroke with 16.5 mm of measured compression. What is the sag percentage?', target: 'P', form: '100S/T', vars: ['s', 't'], calc: '100(16.5)/55', unit: '%' },
  { story: '12 km ridden in 0.75 hours. What is the average speed?', target: 'r', form: 'd/t', vars: ['d', 't'], calc: '12/0.75', unit: 'km/h' },
  { story: 'A 12 ft rise at a 5% grade. What is the horizontal run?', target: 'L', form: '100R/G', vars: ['r', 'g'], calc: '100(12)/5', unit: 'ft' },
  { story: 'A classroom target of 25% sag on a 60 mm stroke. How much compression?', target: 'S', form: 'PT/100', vars: ['p', 't'], calc: '25(60)/100', unit: 'mm' }
].map(p => ({ ...p, answer: V(p.calc) }));
export const FORMULA_PRACTICE_IDS = ['fx-form', 'fx-val'];
export function formulaPractice(n) {
  const X = pick(FORMULA_PRACTICE, n);
  return tidy({
    brief: `Engineering job ${n + 1}: ${X.story}`,
    'fx-form': FORM(X.form, X.vars, X.target, [], { level: 'advanced', prompt: `Choose the formula, then rearrange it for ${X.target}: ${X.target} = …`, solution: `${X.target} = ${X.form}.` }),
    'fx-val': { type: 'number', ideas: ['use-formula'], level: 'advanced', label: X.target, unit: X.unit, answer: X.answer, prompt: 'Substitute and calculate. Give the unit too (it’s shown).', hints: ['Use your rearranged formula.', 'Substitute the known values.', X.calc.replace(/-/g, '−') + '.'], solution: `${X.target} = ${X.calc} = ${S(X.answer)} ${X.unit}.` }
  });
}

// ================================================================ Stage 05: Park Operations (inequalities)
const M5 = {
  'ib-write': { type: 'equation', ideas: ['constraints'], level: 'beginner', label: 'Inequality', answer: '45 + 12h ≤ 105', prompt: 'The project has at most 105 planning credits. Setup costs 45; every feature package costs 12. Write an inequality for h packages that stays within budget.',
    traps: [{ eq: '45 + 12h ≥ 105', code: 'direction', message: '“At most 105” means 105 or less: ≤.' }, { eq: '45h + 12 ≤ 105', code: 'equation-setup', message: '12 per package, 45 once.' }], hints: ['Cost must be no more than the budget.', 'Cost = 45 + 12h.', '“No more than” is ≤.'], solution: '45 + 12h ≤ 105.' },
  'sv-ib': solver('45 + 12h ≤ 105', { ideas: ['inequality'], level: 'beginner', prompt: 'Solve 45 + 12h ≤ 105: choose each move. Inequalities use the same moves as equations.' }),
  'ib-max': { type: 'number', ideas: ['constraints'], level: 'beginner', label: 'Most packages', answer: 5, prompt: 'What is the greatest number of packages the park can buy?', traps: [{ value: 6, code: 'endpoint', message: 'h ≤ 5: six would cost 117 credits.' }],
    hints: ['h ≤ 5.', 'Can h equal 5?', '45 + 60 = 105 is within budget.'], solution: '5 packages (45 + 12 × 5 = 105, exactly the budget).' },
  'ib-whole': { type: 'choice', ideas: ['constraints'], level: 'intermediate', prompt: 'h counts packages. Which values are allowed?',
    options: [opt('a', '0, 1, 2, 3, 4 or 5', true), opt('b', 'Any number up to 5, like 4.5', false, 'whole-number', 'You can’t buy half a package.'), opt('c', 'Only 5', false, 'direction', 'h ≤ 5 allows fewer too.'), opt('d', '5 or more', false, 'direction', 'h ≤ 5 means 5 or fewer.')],
    hints: ['h ≤ 5.', 'Packages are whole.', 'And you can’t buy a negative number.'], solution: 'Whole numbers from 0 to 5: 0 ≤ h ≤ 5.' },
  'sv-neg': solver('180 − 12x ≥ 60', { ideas: ['inequality', 'flip'], level: 'advanced', prompt: 'The park starts with 180 credits, each kit costs 12, and at least 60 must remain: 180 − 12x ≥ 60. Choose each move.', after: 'Dividing by −12 reverses ≥ to ≤' }),
  'neg-range': { type: 'choice', ideas: ['constraints', 'flip'], level: 'intermediate', prompt: 'x counts kits. Which describes every allowed number of kits?',
    options: [opt('a', '0 ≤ x ≤ 10 (whole numbers)', true), opt('b', 'x ≥ 10', false, 'no-flip', 'That’s the sign you get without reversing it.'), opt('c', 'x ≤ 10, including negatives', false, 'whole-number', 'A number of kits can’t be negative.'), opt('d', 'x = 10 only', false, 'direction', 'Fewer kits leave even more credits.')],
    hints: ['x ≤ 10.', 'Kits can’t be negative.', 'And they’re whole.'], solution: '0 ≤ x ≤ 10, whole numbers: up to ten kits.' },
  'neg-why': { type: 'choice', ideas: ['flip'], level: 'advanced', prompt: 'Why does dividing by −12 reverse the inequality?',
    options: [opt('a', 'Multiplying or dividing by a negative flips numbers across 0, reversing their order: 2 < 5 but −2 > −5', true), opt('b', 'Because the numbers are big', false, 'no-flip', 'Size has nothing to do with it; the sign does.'), opt('c', 'It doesn’t: only multiplying reverses it', false, 'no-flip', 'Dividing by a negative is multiplying by a negative reciprocal: it reverses too.'), opt('d', 'Because subtraction came first', false, 'no-flip', 'Adding and subtracting never reverse an inequality.')],
    hints: ['Try 2 < 5 and multiply both by −1.', '−2 and −5.', 'Which is bigger now?'], solution: 'Multiplying or dividing by a negative reflects numbers across 0, so their order reverses: 2 < 5 but −2 > −5.' },
  'nl-a-solve': { type: 'inequality', ideas: ['inequality'], level: 'beginner', label: 'Solution', answer: 'x ≤ 8', prompt: 'Solve x + 4 ≤ 12.', hints: ['Undo + 4.', 'Subtract 4 from both sides.', '12 − 4.'], solution: 'x ≤ 8.' },
  'nl-a': numberline(ray(8, 'left', true), [0, 14], { level: 'beginner', prompt: 'Graph x ≤ 8 on the number line.', hints: ['Is 8 included?', '≤ includes it: closed circle.', 'Smaller values: arrow to the left.'], solution: 'A closed circle at 8 and an arrow to the left.' }),
  'nl-b-solve': { type: 'inequality', ideas: ['inequality'], level: 'intermediate', label: 'Solution', answer: 'x > 4', prompt: 'Solve 3x + 6 > 18.', hints: ['Subtract 6.', '3x > 12.', 'Divide by 3 (positive: the sign stays).'], solution: '3x > 12, so x > 4.' },
  'nl-b': numberline(ray(4, 'right', false), [0, 14], { level: 'intermediate', prompt: 'Graph x > 4.', hints: ['Is 4 itself a solution?', '> doesn’t include it: open circle.', 'Bigger values: arrow to the right.'], solution: 'An open circle at 4 and an arrow to the right.' }),
  'sv-comp': solver('36 ≤ 8x + 4 ≤ 84', { ideas: ['compound', 'inequality'], level: 'advanced', prompt: 'The allocation must be between 36 and 84 credits, inclusive: 36 ≤ 8x + 4 ≤ 84. Choose each move (it applies to all three parts).' }),
  'comp-graph': numberline(interval(4, 10, true, true), [0, 14], { ideas: ['graph-inequality', 'compound'], level: 'advanced', prompt: 'Graph 4 ≤ x ≤ 10.', hints: ['Two endpoints: an interval.', 'Both included.', 'Closed circles at 4 and 10, shaded between.'], solution: 'Closed circles at 4 and 10, shaded between them.' }),
  'or-graph': numberline(orSet(2, false, 8, false), [0, 14], { ideas: ['graph-inequality', 'compound'], level: 'advanced', prompt: 'Graph x < 2 OR x > 8.', hints: ['OR: either condition is enough.', 'Two separate regions.', 'Open circles at 2 and 8; arrows pointing away from each other.'], solution: 'Two separate rays: open circle at 2 pointing left, open circle at 8 pointing right.' }),
  'or-which': { type: 'multi', inline: true, keepOrder: true, ideas: ['compound'], level: 'advanced', prompt: 'Which values satisfy x < 2 OR x > 8? Tick them all.',
    options: [0, 2, 5, 8.5, 9].map(x => opt('v' + String(x).replace('.', '_'), S(x), contains(orSet(2, false, 8, false), x), 'or-and', x === 2 ? '2 isn’t less than 2: the circle is open.' : x === 5 ? '5 is in neither region: it’s not less than 2 and not more than 8.' : null)),
    hints: ['Each value needs to meet at least one condition.', 'Less than 2, or more than 8.', 'Check each.'], solution: '0, 8.5 and 9. (2 isn’t less than 2; 5 is in neither region.)' },
  'andor': { type: 'choice', ideas: ['compound'], level: 'intermediate', prompt: 'What’s the difference between “4 ≤ x and x ≤ 10” and “x < 2 or x > 8”?',
    options: [opt('a', 'AND needs both conditions (one interval); OR needs at least one (two separate regions)', true), opt('b', 'They’re the same thing written differently', false, 'or-and', 'AND keeps only values that pass both; OR keeps values that pass either.'), opt('c', 'OR needs both conditions', false, 'or-and', 'That’s AND.'), opt('d', 'AND always gives two regions', false, 'or-and', 'AND gives the overlap: one interval.')],
    hints: ['AND: both must hold.', 'OR: either is enough.', 'Picture each on the number line.'], solution: 'AND: both conditions, the overlap (one bounded interval). OR: either condition, so two separate pieces.' },
  'tg-ineq': { type: 'inequality', ideas: ['constraints', 'inequality'], level: 'intermediate', label: 'Solution', answer: 'R ≤ 24', prompt: 'A fictional design brief: horizontal run 300 ft, maximum average grade 8%. Solve 100R/300 ≤ 8 for the rise R.',
    hints: ['100R/300 simplifies to R/3.', 'R/3 ≤ 8.', 'Multiply both sides by 3.'], solution: 'R/3 ≤ 8, so R ≤ 24.' },
  'tg-max': { type: 'number', ideas: ['constraints'], level: 'intermediate', label: 'Max rise', unit: 'ft', answer: 24, prompt: 'What is the greatest vertical rise that meets this brief?', traps: [{ value: 2400, code: 'units', message: '100R/300 ≤ 8: R ≤ 24 ft.' }],
    hints: ['R ≤ 24.', 'Is 24 allowed?', '≤ includes it.'], solution: '24 ft (grade exactly 8%).' },
  'ap-pass': { type: 'multi', inline: true, keepOrder: true, ideas: ['constraints'], level: 'advanced', prompt: 'Which candidate plans meet every condition? Tick them all.',
    options: APPROVAL.plans.map(p => opt(p.id, p.name, passes(p), 'constraints', `${p.name} fails: ${CONSTRAINTS.filter(c => !c.test(p)).map(c => c.text.toLowerCase()).join('; ')}.`)),
    hints: ['Check each plan against each condition.', 'Kits: 4 ≤ k ≤ 10 (and 180 − 12k ≥ 60).', 'Grade: 100R/300 ≤ 8 means R ≤ 24.'], solution: 'Plans B and E pass. A has too few kits; C has too many (only 48 credits would remain); D’s connector rises 27 ft, a 9% grade.' },
  'ap-c': { type: 'choice', ideas: ['constraints'], level: 'advanced', prompt: 'Plan C buys 11 kits. Which condition rules it out first?',
    options: [opt('a', 'At least 60 credits must remain: 180 − 12(11) = 48', true), opt('b', 'Spending can’t exceed 180', false, 'arithmetic', '12 × 11 = 132, under 180.'), opt('c', 'At least 4 packages', false, 'direction', '11 is more than 4.'), opt('d', 'The grade limit', false, 'arithmetic', 'Its connector rises 18 ft: a 6% grade.')],
    hints: ['Work out 180 − 12 × 11.', '180 − 132.', 'Compare with 60.'], solution: '180 − 12(11) = 48 < 60, so it breaks the “at least 60 remain” condition (and the 10-kit limit).' }
};
M5['ap-c'].keepOrder = false;
export const INEQ_PRACTICE = [
  { ineq: '5x − 3 ≤ 22', flip: false }, { ineq: '−4x + 10 > 2', flip: true }, { ineq: '7 + 2x ≥ 19', flip: false },
  { ineq: '−3x ≤ 12', flip: true }, { ineq: 'x/2 + 1 < 6', flip: false }, { ineq: '20 − 5x ≥ 0', flip: true }
].map(p => ({ ...p, set: solution(p.ineq).set }));
export const INEQ_PRACTICE_IDS = ['ix-solve', 'ix-test'];
export function ineqPractice(n) {
  const X = pick(INEQ_PRACTICE, n), s = X.set, test = Number(s.at) + (n % 2 ? 1 : -1), ok = contains(s, test);
  return arrange({
    brief: `Constraint ${n + 1}: ${pretty(X.ineq)}`,
    'ix-solve': { type: 'inequality', flip: X.flip, ideas: X.flip ? ['inequality', 'flip'] : ['inequality'], level: 'advanced', label: 'Solution', answer: setText(s), prompt: `Solve ${pretty(X.ineq)}.`,
      hints: ['Undo + and − first.', 'Then divide by the coefficient.', X.flip ? 'The coefficient is negative: reverse the sign.' : 'The coefficient is positive: the sign stays.'], solution: lines(X.ineq) + '.' },
    'ix-test': { type: 'choice', ideas: ['inequality', 'check'], level: 'intermediate', prompt: `Is x = ${S(test)} a solution of ${pretty(X.ineq)}?`,
      options: [opt('y', 'Yes', ok, 'direction', `Substitute x = ${S(test)} into the original: it’s false.`), opt('n', 'No', !ok, 'direction', `Substitute x = ${S(test)}: it’s true.`)], keepOrder: true,
      hints: ['Substitute into the original inequality.', 'Work out the left side.', 'Is the statement true?'], solution: `x = ${S(test)} ${ok ? 'is' : 'isn’t'} a solution (the solution is ${setText(s)}).` }
  });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'garage', n: 1, title: 'The Setup Garage', short: 'Setup Garage', minutes: '8–10', focus: 'One-Step Equations', badge: 'Bike Mechanic', blurb: 'Find the missing measurements on the setup sheets with inverse operations, check the mechanics’ work, and solve for sag.', graded: Object.keys(M1) },
  { id: 'crew', n: 2, title: 'The Build Crew', short: 'Build Crew', minutes: '8–10', focus: 'Multi-Step Equations', badge: 'Build Engineer', blurb: 'Budget the rental, distribute the feature packages and solve multi-step construction equations.', graded: Object.keys(M2) },
  { id: 'showdown', n: 3, title: 'The Design Showdown', short: 'Design Showdown', minutes: '8–10', focus: 'Variables on Both Sides', badge: 'Design Analyst', blurb: 'Two design teams, two cost models. When are they equal: once, never, or always?', graded: Object.keys(M3) },
  { id: 'formula', n: 4, title: 'The Formula Garage', short: 'Formula Garage', minutes: '8–10', focus: 'Literal Equations', badge: 'MTB Engineer', blurb: 'Rearrange speed, trail-grade and suspension-sag formulas, then use them with the right units.', graded: Object.keys(M4) },
  { id: 'operations', n: 5, title: 'Park Operations', short: 'Park Operations', minutes: '8–10', focus: 'Inequalities', badge: 'Park Manager', blurb: 'Keep the project within its limits: budgets, sign reversal, number lines, compound inequalities and final approval.', graded: Object.keys(M5) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)), ...arrange(tidy(M5)) };

// ================================================================ Final Park Engineer Certification
// Two questions per topic; new contexts and values each round.
export const FINAL_SETS = [
  { a: { eq: 'x/5 = 9', story: 'A shipment shared equally by 5 zones gives each 9 posts.' }, check: { eq: '4x + 3 = 31', v: 7 },
    build: { story: 'A $25 day pass plus $9 per uplift ride r comes to $79.', eq: '25 + 9r = 79' }, multi: '2(x + 5) + 3x = 40',
    both: '25 + 3f = 10 + 6f', type: '2(x + 6) = 2x + 12',
    form: { base: 'P = 2L + 2W', target: 'W', answer: '(P - 2L)/2', vars: ['p', 'l'], about: 'the perimeter of a rectangular staging area' }, use: { story: 'The staging area takes 46 m of fencing (P) and is 15 m long (L). Find its width.', calc: '(46 - 2(15))/2', target: 'W', unit: 'm' },
    ineq: { text: '−5x + 4 ≥ 29', flip: true }, graph: { set: interval(-2, 3, false, true), text: '−2 < x ≤ 3' } },
  { a: { eq: 'x − 14 = 27', story: 'After 14 tubes are used, 27 remain.' }, check: { eq: '3x − 5 = 16', v: 6 },
    build: { story: 'Four crews each lay x + 3 meters of boardwalk, 32 meters in all.', eq: '4(x + 3) = 32' }, multi: '5(x − 2) + x = 32',
    both: '8 + 7x = 2x + 33', type: '7 + 3x = 3x + 11',
    form: { base: 'G = 100R/L', target: 'R', answer: 'GL/100', vars: ['g', 'l'] }, use: { story: 'A 5% grade over a 240 ft horizontal run. Find the rise.', calc: '5(240)/100', target: 'R', unit: 'ft' },
    ineq: { text: '60 − 4x > 20', flip: true }, graph: { set: orSet(-1, false, 4, true), text: 'x < −1 or x ≥ 4' } },
  { a: { eq: '−6x = 42', story: 'A negative coefficient warm-up.' }, check: { eq: '2(x + 3) = 20', v: 7 },
    build: { story: 'Two packages of x + 6 markers plus 5 loose markers make 29.', eq: '2(x + 6) + 5 = 29' }, multi: '3(2x + 1) − x = 28',
    both: '4x − 9 = x + 12', type: '5x + 10 = 5(x + 2)',
    form: { base: 'C = 15 + 4h', target: 'h', answer: '(C - 15)/4', vars: ['c'], about: 'a rental bill: $15 plus $4 per hour' }, use: { story: 'A rental bill comes to $47. How many hours?', calc: '(47 - 15)/4', target: 'h', unit: 'hours' },
    ineq: { text: '−2x − 7 < 3', flip: true }, graph: { set: interval(1, 6, true, false), text: '1 ≤ x < 6' } },
  { a: { eq: '7x = 59.5', story: 'Seven equal sections make a 59.5 m line.' }, check: { eq: '9 + 2x = 25', v: 9 },
    build: { story: 'A bike rental costs $12 per hour h plus a $30 deposit: $102 in all.', eq: '12h + 30 = 102' }, multi: '6x + 2(x − 4) = 40',
    both: '50 + 2n = 20 + 5n', type: '4x + 1 = 4x − 1',
    form: { base: 'A = bh/2', target: 'h', answer: '2A/b', vars: ['a', 'b'], about: 'the area of a ramp’s triangular side panel' }, use: { story: 'A side panel has area 18 m² and base 6 m. Find its height.', calc: '2(18)/6', target: 'h', unit: 'm' },
    ineq: { text: '15 − 3x ≤ 0', flip: true }, graph: { set: orSet(0, true, 5, false), text: 'x ≤ 0 or x > 5' } }
];
export const FINAL_IDS = ['fa-solve', 'fa-check', 'fb-build', 'fb-solve', 'fc-solve', 'fc-type', 'fd-form', 'fd-use', 'fe-solve', 'fe-graph'];
export const PASS_MARK = 8;   // of 10, right without the solution shown
export function finalQuestions(roundNo) {
  const F = pick(FINAL_SETS, roundNo - 1), chkOk = solve(F.check.eq).value.eq(F.check.v), lhs = F.check.eq.split('=')[0].trim();
  const lhsVal = Number(value(lhs.replace(/x/g, '(' + F.check.v + ')')));
  const rhs = F.check.eq.split('=')[1].trim();
  return tidy({
    set: F,
    'fa-solve': { type: 'number', working: true, ideas: ['inverse'], level: 'beginner', label: 'x', answer: ans(F.a.eq), prompt: `${F.a.story} Solve ${pretty(F.a.eq)}.`, hints: ['What’s being done to x?', 'Undo it with the inverse on both sides.', lines(F.a.eq).split('  →  ')[0] + '…'], solution: lines(F.a.eq) + '.' },
    'fa-check': { type: 'choice', keepOrder: true, ideas: ['check'], level: 'beginner', prompt: `Is x = ${F.check.v} a solution of ${pretty(F.check.eq)}? Substitute to check.`,
      options: [opt('y', `Yes: the left side is ${lhsVal}, which equals ${rhs}`, chkOk, 'not-original', `The left side is ${lhsVal}, not ${rhs}.`), opt('n', `No: the left side is ${lhsVal}, not ${rhs}`, !chkOk, 'not-original', `The left side is ${lhsVal}: that does equal ${rhs}.`)],
      hints: ['Replace x with the value.', 'Work out the left side.', 'Compare with the right.'], solution: `${lhs.replace(/x/g, '(' + F.check.v + ')')} = ${lhsVal}${chkOk ? ' = ' : ' ≠ '}${rhs}.` },
    'fb-build': { type: 'equation', ideas: ['write-multi'], level: 'intermediate', label: 'Equation', answer: F.build.eq, prompt: `${F.build.story} Write the equation.`, hints: ['What’s fixed and what repeats?', 'Repeated groups: count × (group).', 'Set it equal to the total.'], solution: pretty(F.build.eq) + '.' },
    'fb-solve': { type: 'number', working: true, ideas: ['multi-step', 'distribute'], level: 'intermediate', label: 'x', answer: ans(F.multi), prompt: `Solve ${pretty(F.multi)}.`, hints: ['Distribute.', 'Combine like terms.', 'Undo + or −, then × or ÷.'], solution: lines(F.multi) + '.' },
    'fc-solve': { type: 'number', working: true, ideas: ['both-sides'], level: 'intermediate', label: solve(F.both).v, answer: ans(F.both), prompt: `Solve ${pretty(F.both)}.`, hints: ['Collect the variable terms on one side.', 'Then the numbers on the other.', 'Divide.'], solution: lines(F.both) + '.' },
    'fc-type': { type: 'choice', keepOrder: true, ideas: ['special'], level: 'advanced', prompt: `How many solutions does ${pretty(F.type)} have?`, options: TYPE_OPTS(kindOf(F.type)),
      hints: ['Distribute and collect the variable terms.', 'Does the variable vanish?', 'Is what’s left always true, or never?'], solution: lines(F.type) + ': ' + setText(solve(F.type)) + '.' },
    'fd-form': FORM(F.form.answer, F.form.vars, F.form.target, [], { level: 'advanced', prompt: `${F.form.about ? 'A new formula, for ' + F.form.about + ': ' : ''}rearrange ${F.form.base} to solve for ${F.form.target}.`.replace(/^r/, 'R'), solution: `${F.form.target} = ${F.form.answer.replace(/-/g, '−')}.` }),
    'fd-use': { type: 'number', working: true, ideas: ['use-formula'], level: 'intermediate', label: F.use.target, unit: F.use.unit, answer: V(F.use.calc), prompt: F.use.story, hints: ['Choose the form with your unknown alone.', 'Substitute the known values.', F.use.calc + '.'], solution: `${F.use.target} = ${F.use.calc} = ${S(V(F.use.calc))} ${F.use.unit}.` },
    'fe-solve': { type: 'inequality', flip: F.ineq.flip, ideas: ['inequality', 'flip'], level: 'advanced', label: 'Solution', answer: setText(solution(F.ineq.text).set), prompt: `Solve ${pretty(F.ineq.text)}.`, hints: ['Undo + and − first.', 'Divide by the coefficient.', 'Negative coefficient: reverse the sign.'], solution: lines(F.ineq.text) + '.' },
    'fe-graph': numberline(F.graph.set, [-6, 10], { ideas: ['graph-inequality', 'compound'], level: 'advanced', prompt: `Graph ${F.graph.text}.`, hints: ['Interval (and) or two rays (or)?', 'Which endpoints are included?', '≤ and ≥: closed. < and >: open.'], solution: `The graph of ${F.graph.text}.` })
  });
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[ONE_PRACTICE, onePractice, ONE_PRACTICE_IDS], [MULTI_PRACTICE, multiPractice, MULTI_PRACTICE_IDS], [BOTH_PRACTICE, bothPractice, BOTH_PRACTICE_IDS], [FORMULA_PRACTICE, formulaPractice, FORMULA_PRACTICE_IDS], [INEQ_PRACTICE, ineqPractice, INEQ_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const F = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...F[id].ideas])]; }
  return out;
}
export { pretty, lines as solutionLines, S as showNum };
