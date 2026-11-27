// The Dream Line Project: every graded question. Numeric answers come from
// the kit's expression engine (lesson-kit/expr.js: exact fractions, no
// eval), never typed in by hand; number classifications come from
// numbers.js. Each question has three progressive hints (concept, method,
// guided step) and a worked solution; traps are anticipated wrong answers
// with a misconception code and a message that teaches.
//
// Question fields beyond the kit's ask(): ideas (tracked skills), level
// ('beginner' | 'intermediate' | 'advanced'), and for the calculation board
// (type 'board', drawn by components/labs.js) expr and bar.

import { value, parse, toText, solveSteps } from '../../lesson-kit/expr.js';
import { Frac, show } from '../../lesson-kit/frac.js';
import { CARDS, classify, setsOf, sqrtCard, SETS, SET_NAMES, reasons } from './numbers.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const V = (e, vars) => Number(value(e, vars));          // an exact value, as a number for the checker
const P = e => toText(parse(e));                           // pretty: 4(3) + 3(2) + 5, 2400 + (−125.5)
const num = x => show(Frac.of(x)).replace(/^-/, '−');
const steps = e => solveSteps(e).map(s => s.text).join(';  ');
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || q.type !== 'number') continue;
    const seen = new Set();
    q.traps = (q.traps || []).filter(t => { const k = Math.round(t.value * 1e6); const clash = Math.abs(t.value - q.answer) < 1e-9; if (seen.has(k) || clash || !isFinite(t.value)) return false; seen.add(k); return true; });
  }
  return qs;
}
// Rotate choice options (deterministically, by id) so the right answer isn't always first.
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (!q || q.type !== 'choice' || q.keepOrder) continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];

export const IDEAS = {
  'write-expr': 'Writing expressions from words',
  parts: 'Variables, coefficients, constants and terms',
  interpret: 'Explaining what an expression means',
  substitute: 'Substituting values',
  negatives: 'Evaluating with negative values',
  'fractions-decimals': 'Evaluating with fractions and decimals',
  formulas: 'Evaluating real-world formulas',
  order: 'Order of operations',
  grouping: 'Parentheses, brackets and fraction bars',
  errors: 'Finding and fixing calculation mistakes',
  'number-sets': 'Classifying numbers',
  properties: 'Commutative, associative, identity and inverse properties',
  distributive: 'The distributive property',
  'like-terms': 'Combining like terms'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
// Which of the PRD's four subtopics each idea belongs to (for accuracy by objective).
export const OBJECTIVES = [
  { id: 'vae', name: 'Variables and Expressions', ideas: ['write-expr', 'parts', 'interpret'] },
  { id: 'eval', name: 'Evaluating Expressions', ideas: ['substitute', 'negatives', 'fractions-decimals', 'formulas'] },
  { id: 'order', name: 'Order of Operations', ideas: ['order', 'grouping', 'errors'] },
  { id: 'props', name: 'Properties of Real Numbers', ideas: ['number-sets', 'properties', 'distributive', 'like-terms'] }
];

export const MISCONCEPTIONS = {
  'wrong-operation': 'Using the wrong operation for the situation (t + 4 or t⁴ for 4t)',
  'missing-constant': 'Leaving out the fixed amount (the constant)',
  'combine-unlike': 'Combining unlike terms (4t + 3b as 7tb)',
  'variable-meaning': 'Treating a variable as an object or a fixed number, or pairing it with the wrong value',
  'coefficient-constant': 'Mixing up coefficients, constants and variables',
  'term-split': 'Splitting an expression into terms in the wrong places',
  'grouping-write': 'Adding brackets the situation doesn’t have',
  concatenate: 'Reading 4(3) as 43 instead of 4 × 3',
  'sign-error': 'A sign error with a negative value',
  'fraction-error': 'Multiplying by a fraction incorrectly',
  'decimal-place': 'Misaligning decimal places',
  'add-before-multiply': 'Adding or subtracting before multiplying or dividing',
  'left-to-right': 'Not working left to right when operations share priority',
  'ignore-grouping': 'Ignoring parentheses or brackets',
  'exponent-order': 'Working out an exponent at the wrong time',
  'exponent-multiply': 'Treating an exponent as multiplication (6² as 12)',
  'fraction-bar': 'Ignoring the grouping made by a fraction bar',
  'natural-zero': 'Counting 0 as a natural number (this lab starts them at 1)',
  'set-membership': 'Putting a number in a set it doesn’t belong to',
  'decimal-irrational': 'Calling a fraction or terminating decimal irrational',
  'irrational-sets': 'Putting π or a non-square root in a rational set',
  'commutative-subtraction': 'Using the commutative or associative property with subtraction or division',
  'property-names': 'Mixing up the names of the properties',
  'distribute-partial': 'Multiplying only the first term inside the brackets',
  'zero-inverse': 'Thinking 0 has a reciprocal',
  'inverse-confusion': 'Confusing additive and multiplicative inverses or identities',
  'like-terms-exponent': 'Squaring the variable when adding like terms (5t² for 3t + 2t)',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Mission 1: Create the Blueprint
const TILES = ['4', '3', '5', 't', 'b', '+', '−', '×', '(', ')'];
const TOK = (pairs) => pairs.map(([id, text, correct, code, fb]) => opt(id, text, correct, code, fb));
const M1 = {
  'b-term': { type: 'choice', ideas: ['write-expr'], level: 'beginner', prompt: 'Every tabletop needs 4 hours of shaping, and there are t tabletops. Which term gives the total tabletop shaping time?',
    options: [opt('a', '4t', true), opt('b', 't + 4', false, 'wrong-operation', 't + 4 adds the 4 hours only once. Every one of the t tabletops needs its own 4 hours.'), opt('c', '4 + t', false, 'wrong-operation', 'That adds 4 to the number of tabletops. Each tabletop needs 4 hours, so the 4 is counted t times.'), opt('d', 't⁴', false, 'wrong-operation', 'An exponent multiplies t by itself. Here 4 hours are needed for each tabletop: 4 × t.')],
    hints: ['Try it with numbers: how many hours do 2 tabletops need? And 3?', '2 tabletops need 4 + 4 = 2 × 4 hours; 3 need 3 × 4.', 'For t tabletops it’s 4 × t, which algebra writes as 4t.'],
    solution: 'Correct! There are t tabletops, and each one requires 4 hours. Multiplying the number of tabletops by 4 gives the total tabletop shaping time: 4t.' },
  'b-build': { type: 'expression', ideas: ['write-expr'], level: 'beginner', label: 'H =', answer: '4t + 3b + 5', vars: ['t', 'b'], tiles: TILES,
    prompt: 'Every tabletop requires four hours of shaping. Every berm requires three hours. Preparing the site takes five additional hours. Build an expression for the total crew-hours H, without knowing how many tabletops (t) and berms (b) you’ll build.',
    traps: [{ expr: '4t + 3b', code: 'missing-constant', message: 'That’s the shaping time. Site preparation adds 5 more hours, whatever you build.' },
      { expr: '4b + 3t + 5', code: 'variable-meaning', message: 'Check which letter goes with which feature: t counts tabletops (4 hours each), b counts berms (3 hours each).' },
      { expr: 't + 4 + b + 3 + 5', code: 'wrong-operation', message: 'Each tabletop takes 4 hours, so the 4 multiplies t: 4t, not t + 4.' },
      { expr: '7tb + 5', code: 'combine-unlike', message: 'Tabletops and berms are different features, so 4t and 3b stay separate terms.' },
      { expr: '12tb + 5', code: 'combine-unlike', message: 'Tabletops and berms are different features: keep 4t and 3b as separate terms.' }],
    hints: ['Look at how many different types of features are in the park.', 'The letter t represents the number of tabletops, and b the number of berms.', 'Each tabletop requires four hours: how could you represent four times t? Do the same for the berms, then add the site preparation.'],
    solution: 'H = 4t + 3b + 5: 4t hours for the tabletops, 3b hours for the berms, and 5 fixed hours of site preparation.' },
  'a-vars': { type: 'multi', inline: true, ideas: ['parts'], level: 'beginner', prompt: 'In 4t + 3b + 5, select every variable.',
    options: TOK([['4', '4', false, 'coefficient-constant', '4 is a coefficient: the number multiplying t.'], ['t', 't', true], ['3', '3', false, 'coefficient-constant', '3 is a coefficient: it multiplies b.'], ['b', 'b', true], ['5', '5', false, 'coefficient-constant', '5 is a constant: it never changes.']]),
    hints: ['A variable stands for a quantity that can change.', 'In this lab the variables are letters.', 'Which letters count features?'], solution: 'Variables: t and b. They count tabletops and berms, which change from park to park.' },
  'a-coef': { type: 'multi', inline: true, ideas: ['parts'], level: 'beginner', prompt: 'Now select every coefficient.',
    options: TOK([['4', '4', true], ['t', 't', false, 'coefficient-constant', 't is the variable. Its coefficient is the number in front of it.'], ['3', '3', true], ['b', 'b', false, 'coefficient-constant', 'b is the variable. Its coefficient is the number in front of it.'], ['5', '5', false, 'coefficient-constant', '5 isn’t multiplying a variable: it’s the constant.']]),
    hints: ['A coefficient multiplies a variable.', 'Look at the number written right before each letter.', '4t means 4 × t.'], solution: 'Coefficients: 4 and 3, the hours for each tabletop and each berm.' },
  'a-const': { type: 'multi', inline: true, ideas: ['parts'], level: 'beginner', prompt: 'Select the constant.',
    options: TOK([['4', '4', false, 'coefficient-constant', '4 multiplies t, so it’s a coefficient.'], ['t', 't', false, 'coefficient-constant', 't changes: it’s a variable.'], ['3', '3', false, 'coefficient-constant', '3 multiplies b, so it’s a coefficient.'], ['b', 'b', false, 'coefficient-constant', 'b changes: it’s a variable.'], ['5', '5', true]]),
    hints: ['A constant is a fixed value.', 'It isn’t attached to a letter.', 'Which number stays the same however many features you build?'], solution: 'The constant is 5: the 5 hours of site preparation never change.' },
  'a-terms': { type: 'multi', inline: true, ideas: ['parts'], level: 'intermediate', prompt: 'Select every term of 4t + 3b + 5.',
    options: TOK([['4t', '4t', true], ['3b', '3b', true], ['5', '5', true], ['4', '4', false, 'term-split', 'The 4 and the t together make one term: 4t.'], ['t', 't', false, 'term-split', 't belongs to the term 4t.'], ['plus', '+', false, 'term-split', 'The + signs separate the terms; they aren’t terms.'], ['3b5', '3b + 5', false, 'term-split', 'That’s two terms joined by +.']]),
    hints: ['Terms are the separate parts of an expression.', 'Addition and subtraction separate one term from the next.', 'Split 4t + 3b + 5 at each +.'], solution: 'Terms: 4t, 3b and 5. A term can be a coefficient times a variable (4t) or a constant (5).' },
  'tr-wood': { type: 'expression', ideas: ['write-expr'], level: 'beginner', label: 'Planning units', answer: '6w', vars: ['w'],
    prompt: 'Builder’s note 1: “Every wooden feature requires six planning units, and there are w wooden features.” Write an expression for the total planning units.',
    traps: [{ expr: 'w + 6', code: 'wrong-operation', message: 'Every one of the w features needs 6 units, so 6 multiplies w.' }, { expr: '6', code: 'variable-meaning', message: 'That’s one wooden feature. Multiply by the number of features, w.' }],
    hints: ['What’s repeated for every wooden feature?', 'Six units, w times.', '6 × w is written 6w.'], solution: '6w: six planning units for each of the w wooden features.' },
  'tr-jump-berm': { type: 'expression', ideas: ['write-expr'], level: 'intermediate', label: 'Shaping units', answer: '4j + 3b', vars: ['j', 'b'],
    prompt: 'Builder’s note 2: “Each jump requires 4 shaping units and each berm requires 3.” Use j for jumps and b for berms.',
    traps: [{ expr: '7jb', code: 'combine-unlike', message: 'j and b count different things, so 4j and 3b can’t be combined.' }, { expr: '7j + 7b', code: 'wrong-operation', message: 'Jumps and berms need different amounts: 4 for each jump, 3 for each berm.' }, { expr: '3j + 4b', code: 'variable-meaning', message: 'Check which number goes with which letter: 4 units for each jump j.' }, { expr: 'j + 4 + b + 3', code: 'wrong-operation', message: 'Each jump needs 4 units, so multiply: 4j.' }],
    hints: ['Two kinds of feature: two terms.', 'Jumps: 4 units each, j of them. Berms: 3 units each, b of them.', 'Add the two products.'], solution: '4j + 3b. The terms stay separate because jumps and berms are different features.' },
  'tr-kits': { type: 'choice', ideas: ['write-expr', 'like-terms'], level: 'intermediate', prompt: 'Builder’s note 3: “Each of n construction kits contains 2 flags and 3 markers.” Which expression gives the total number of items in all the kits?',
    options: [opt('a', '5n', true), opt('b', '2n + 3', false, 'distribute-partial', 'That counts the markers only once. Every kit has 3 markers, so they’re multiplied by n too: 2n + 3n.'), opt('c', '2 + 3n', false, 'distribute-partial', 'That counts the flags only once. Every kit has 2 flags.'), opt('d', '6n', false, 'wrong-operation', 'Each kit holds 2 + 3 = 5 items, not 2 × 3.')],
    hints: ['How many items are in one kit?', '2 flags + 3 markers = 5 items per kit.', 'n kits of 5 items each.'], solution: 'Each kit has 2 + 3 = 5 items, so n kits hold 5n. Counting flags then markers gives 2n + 3n, which is the same: 2n + 3n = 5n.' },
  'tr-feature': { type: 'expression', ideas: ['write-expr'], level: 'intermediate', label: 'Planning units', answer: '4f + 8', vars: ['f'],
    prompt: 'Builder’s note 4: “Every feature requires 4 planning units, and site preparation requires 8 additional units.” Use f for the number of features.',
    traps: [{ expr: '4(f + 8)', code: 'grouping-write', message: 'The brackets multiply the 8 by 4 as well. Site preparation’s 8 units are added once.' }, { expr: '4f', code: 'missing-constant', message: 'Add the 8 units of site preparation.' }, { expr: '12f', code: 'combine-unlike', message: 'The 8 units don’t depend on f, so 4f and 8 can’t be combined.' }],
    hints: ['One part changes with f; one part is fixed.', 'Changing part: 4 units for each feature.', 'Fixed part: + 8.'], solution: '4f + 8: 4f for the features and 8 fixed units of site preparation.' },
  'ex-var': { type: 'choice', ideas: ['interpret', 'parts'], level: 'beginner', prompt: 'H = 4t + 3b + 5. What does the variable t represent?',
    options: [opt('a', 'The number of tabletops', true), opt('b', 'A tabletop', false, 'variable-meaning', 't stands for a number: how many tabletops. A letter in algebra stands for a quantity, not an object.'), opt('c', 'The hours each tabletop takes', false, 'coefficient-constant', 'That’s the coefficient, 4.'), opt('d', 'The total crew-hours', false, 'variable-meaning', 'That’s H.')],
    hints: ['A variable stands for a quantity.', 'What can change from park to park?', 'Its coefficient tells you the hours for each one.'], solution: 't is the number of tabletops: a quantity that changes depending on your design.' },
  'ex-coef': { type: 'choice', ideas: ['interpret', 'parts'], level: 'beginner', prompt: 'Why is there a 4 in front of t?',
    options: [opt('a', 'Each tabletop takes 4 crew-hours', true), opt('b', 'There are 4 tabletops', false, 'variable-meaning', 'The number of tabletops is t, and it can change.'), opt('c', 'Site preparation takes 4 hours', false, 'coefficient-constant', 'Site preparation is the constant, 5.'), opt('d', 'The 4 is added to t', false, 'wrong-operation', '4t means 4 × t.')],
    hints: ['4t means 4 × t.', 't is how many tabletops.', 'So 4 is the amount for each one.'], solution: 'The coefficient 4 is the crew-hours for each tabletop; 4t multiplies it by the number of tabletops.' },
  'ex-const': { type: 'choice', ideas: ['interpret', 'parts'], level: 'beginner', prompt: 'What does the constant 5 tell the crew?',
    options: [opt('a', '5 hours of site preparation, however many features are built', true), opt('b', '5 features will be built', false, 'variable-meaning', 'The numbers of features are t and b.'), opt('c', 'Each berm takes 5 hours', false, 'coefficient-constant', 'Each berm takes 3 hours: the coefficient of b.'), opt('d', 'The park takes 5 hours in total', false, 'missing-constant', 'H is the total. 5 is only the fixed part of it.')],
    hints: ['A constant doesn’t change.', 'It isn’t attached to t or b.', 'Look back at the construction brief.'], solution: 'The 5 is fixed: 5 hours of site preparation whatever the design.' },
  'ex-more': { type: 'number', ideas: ['interpret'], level: 'intermediate', label: 'H goes up by', unit: 'hours', answer: 4, prompt: 'The crew adds one more tabletop and nothing else. By how many hours does H go up?',
    traps: [{ value: 5, code: 'coefficient-constant', message: 'The 5 is fixed: it doesn’t grow when you add features.' }, { value: 1, code: 'variable-meaning', message: 't goes up by 1, but each tabletop costs 4 hours.' }, { value: 9, code: 'missing-constant', message: 'Only the tabletop term changes; the 5 hours were already counted.' }],
    hints: ['Which term changes when t goes up?', 'Only 4t changes.', 'One more tabletop adds one more 4.'], solution: 'H goes up by 4 hours: the coefficient of t is the change for each extra tabletop.' },
  'ex-fixed': { type: 'multi', inline: true, ideas: ['interpret', 'parts'], level: 'intermediate', prompt: 'Which parts of 4t + 3b + 5 change from park to park? Tick them all.',
    options: TOK([['t', 't', true], ['b', 'b', true], ['4t', '4t', true], ['3b', '3b', true], ['4', '4', false, 'coefficient-constant', 'The 4 hours per tabletop stays the same; the number of tabletops is what changes.'], ['5', '5', false, 'coefficient-constant', 'Site preparation is fixed at 5 hours.']]),
    hints: ['Variables change; constants and coefficients stay put.', 'A term with a variable in it changes when the variable does.', 'Four things change.'], solution: 't and b change, so the terms 4t and 3b change too. The coefficients 4 and 3 and the constant 5 stay fixed.' },
  'b-two': { type: 'choice', ideas: ['interpret'], level: 'intermediate', prompt: 'Why did H go up by exactly 8 hours when the crew added two tabletops?',
    options: [opt('a', 'Two more tabletops × 4 hours each = 8 hours', true), opt('b', 'Each tabletop takes 8 hours', false, 'coefficient-constant', 'Each tabletop takes 4 hours; there were two of them.'), opt('c', 'The constant doubled from 5', false, 'missing-constant', 'The constant never changes.'), opt('d', 'H always goes up by 8', false, 'variable-meaning', 'Adding one tabletop raises H by 4; adding a berm raises it by 3.')],
    hints: ['Which term changed?', 't went up by 2.', 'The coefficient of t is 4.'], solution: 't went from 3 to 5, so 4t went from 12 to 20: up 2 × 4 = 8 hours.' }
};
// Practice: more builder’s notes (expression building on your own).
export const BUILD_PRACTICE = [
  { note: 'Each hip jump takes 5 crew-hours and each roller takes 1 hour, plus 3 hours to set up the tools.', vars: ['j', 'r'], answer: '5j + r + 3', key: '5', keyRole: 'coefficient', meaning: 'the crew-hours for each hip jump', wrong: ['the number of hip jumps', 'the hours to set up the tools', 'the total crew-hours'] },
  { note: 'Each step-down takes 3 crew-hours and each drop takes 5, plus 6 hours to survey the slope.', vars: ['s', 'd'], answer: '3s + 5d + 6', key: '6', keyRole: 'constant', meaning: 'the fixed 6 hours of surveying', wrong: ['the number of drops', 'the hours for each drop', 'the total crew-hours'] },
  { note: 'Each of k marking kits holds 4 stakes and 2 flags.', vars: ['k'], answer: '6k', key: 'k', keyRole: 'variable', meaning: 'the number of marking kits', wrong: ['the items in one kit', 'the number of stakes', 'a marking kit'] },
  { note: 'Each wooden wall ride takes 6 crew-hours and each pump track section takes 2, plus 10 hours for a viewing deck.', vars: ['w', 'p'], answer: '6w + 2p + 10', key: '2', keyRole: 'coefficient', meaning: 'the crew-hours for each pump track section', wrong: ['the number of pump track sections', 'the hours for the viewing deck', 'the number of wall rides'] },
  { note: 'Each berm takes 3 crew-hours and each roller 1 hour, but a volunteer crew saves 2 hours overall.', vars: ['b', 'r'], answer: '3b + r − 2', key: '−2', keyRole: 'constant', meaning: 'the 2 hours the volunteers save', wrong: ['the number of rollers', 'the hours for each berm', 'two extra berms'] },
  { note: 'Each of the n lines gets 8 flags, plus 15 spare flags for the start area.', vars: ['n'], answer: '8n + 15', key: '15', keyRole: 'constant', meaning: 'the 15 spare flags, however many lines there are', wrong: ['the number of lines', 'the flags on each line', 'the total number of flags'] }
];
export const BUILD_PRACTICE_IDS = ['bx-expr', 'bx-mean'];
export function buildPractice(n) {
  const B = pick(BUILD_PRACTICE, n), letters = B.vars.join(' and ');
  return arrange({
    brief: `Builder’s note ${n + 1}: “${B.note}”`,
    'bx-expr': { type: 'expression', ideas: ['write-expr'], level: 'intermediate', label: 'Expression', answer: B.answer, vars: B.vars, prompt: `Write an expression for the total, using ${letters}.`,
      hints: ['Find the parts that repeat for each feature, and any fixed part.', 'A repeated amount multiplies its letter.', 'Add (or subtract) the fixed part at the end.'], solution: `${P(B.answer)}.` },
    'bx-mean': { type: 'choice', ideas: ['interpret', 'parts'], level: 'intermediate', prompt: `In ${P(B.answer)}, what does the ${B.keyRole} ${B.key} represent?`,
      options: [opt('a', B.meaning, true), ...B.wrong.map((w, i) => opt('w' + i, w, false, B.keyRole === 'variable' ? 'variable-meaning' : 'coefficient-constant', null))],
      hints: [`A ${B.keyRole} is ${B.keyRole === 'variable' ? 'a quantity that can change' : B.keyRole === 'coefficient' ? 'the number multiplying a variable' : 'a fixed amount'}.`, 'Find it in the builder’s note.', 'Match it to the words.'], solution: `${B.key} is ${B.meaning}.` }
  });
}

// ================================================================ Mission 2: Plan the Build
// The prediction-first challenge sequence (Beginner → Advanced).
export const CHALLENGES = [
  { id: 'ch1', level: 'beginner', skill: 'Substitute whole numbers', story: 'A flow zone: each pump track section takes 2 crew-hours and each roller 1 hour, plus 5 hours of site preparation.', letter: 'H', rhs: '2p + r + 5', vars: { p: 4, r: 6 }, sub: '2(4) + 6 + 5', also: ['2(4) + 1(6) + 5'], unit: 'crew-hours', bands: [20, 30], ideas: ['substitute'] },
  { id: 'ch2', level: 'intermediate', skill: 'Decimal expressions', story: 'Each flag line uses 2.5 m of marking tape, plus 1.75 m to tie off the ends.', letter: 'T', rhs: '2.5n + 1.75', vars: { n: 6 }, sub: '2.5(6) + 1.75', unit: 'm of tape', bands: [10, 20], ideas: ['substitute', 'fractions-decimals'] },
  { id: 'ch3', level: 'intermediate', skill: 'Fractions', story: 'Two-thirds of the j jumps and half of the b berms are shaped. F counts the shaped features.', letter: 'F', rhs: '(2/3)j + (1/2)b', vars: { j: 18, b: 8 }, sub: '(2/3)(18) + (1/2)(8)', unit: 'features', bands: [5, 15], ideas: ['substitute', 'fractions-decimals'] },
  { id: 'ch4', level: 'advanced', skill: 'Negative values', story: 'The start gate is at 1,980 ft. Each of 4 rollers changes the elevation by d feet, and the final step-up climbs 12 ft.', letter: 'E', rhs: '1980 + 4d + 12', vars: { d: -2.5 }, sub: '1980 + 4(−2.5) + 12', also: ['1980 − 4(2.5) + 12'], unit: 'ft', bands: [1975, 1990], ideas: ['substitute', 'negatives'] },
  { id: 'ch5', level: 'advanced', skill: 'Multi-variable formula', story: 'The expert line: tabletops take 4 crew-hours, berms 3 and wall rides 6, plus 5 hours of site preparation.', letter: 'H', rhs: '4t + 3b + 6w + 5', vars: { t: 3, b: 4, w: 2 }, sub: '4(3) + 3(4) + 6(2) + 5', unit: 'crew-hours', bands: [25, 40], ideas: ['substitute', 'formulas'] }
].map(c => ({ ...c, answer: V(c.rhs, c.vars), parts: c.rhs }));
const varText = vars => Object.entries(vars).map(([k, v]) => `${k} = ${num(v)}`).join(', ');
export function bandOptions(c) {
  const [lo, hi] = c.bands, a = c.answer, f = x => Number(x).toLocaleString('en-US');
  return [{ id: 'lo', text: `Under ${f(lo)}`, right: a < lo }, { id: 'mid', text: `${f(lo)} to ${f(hi)}`, right: a >= lo && a <= hi }, { id: 'hi', text: `Over ${f(hi)}`, right: a > hi }];
}
const CH_QS = {};
for (const c of CHALLENGES) {
  const traps = [];
  if (c.id === 'ch1') traps.push({ value: V('2(4) + 6'), code: 'missing-constant', message: 'Add the 5 hours of site preparation.' }, { value: 2 + 4 + 6 + 5, code: 'wrong-operation', message: '2p means 2 × p: 2 × 4 = 8.' });
  if (c.id === 'ch2') traps.push({ value: 15, code: 'missing-constant', message: 'Add the 1.75 m for tying off.' }, { value: V('2.5(6 + 1.75)'), code: 'grouping-write', message: 'Only the 2.5 is multiplied by n; the 1.75 is added once.' });
  if (c.id === 'ch3') traps.push({ value: V('18/(2/3) + 8/(1/2)'), code: 'fraction-error', message: 'Two-thirds of 18 means (2/3) × 18, not 18 ÷ 2/3.' });
  if (c.id === 'ch4') traps.push({ value: V('1980 + 4(2.5) + 12'), code: 'sign-error', message: 'd is negative: 4(−2.5) = −10, so the rollers lower the elevation.' }, { value: V('1980 + 4(-2.5)'), code: 'missing-constant', message: 'Add the 12 ft step-up.' });
  if (c.id === 'ch5') traps.push({ value: 36, code: 'missing-constant', message: 'Add the 5 hours of site preparation.' }, { value: V('4(4) + 3(3) + 6(2) + 5'), code: 'variable-meaning', message: 'Check which value goes with which letter: t = 3, b = 4.' });
  CH_QS[c.id + '-sub'] = { type: 'expression', ideas: ['substitute'], level: c.level, form: 'shape', label: c.letter + ' =', answer: c.sub, also: c.also || [], vars: [],
    prompt: `Substitute ${varText(c.vars)} into ${c.letter} = ${P(c.rhs)}. Write it with the numbers in place; don’t work it out yet.`,
    traps: [{ expr: c.rhs.replace(/([\d)])(?=[a-z])/g, '$1+').replace(/[a-z]/g, m => '(' + c.vars[m] + ')'), code: 'wrong-operation', message: 'A number next to a letter means multiply: 4d means 4 × d, so 4(−2.5), not 4 + (−2.5).' }],
    hints: ['Replace each letter with its value.', 'Keep each value in brackets, so 4d becomes 4(−2.5).', `Values: ${varText(c.vars)}.`], solution: `${c.letter} = ${P(c.sub)}.` };
  CH_QS[c.id] = { type: 'number', ideas: c.ideas, level: c.level, label: c.letter, unit: c.unit, answer: c.answer, prompt: `Now evaluate: ${c.letter} = ${P(c.sub)} = ?`, traps,
    hints: ['Multiply each coefficient by its value first.', 'Then add (and subtract) from left to right.', steps(c.sub).split(';  ')[0] + ' is the first step.'], solution: `${steps(c.sub)}. So ${c.letter} = ${num(c.answer)} ${c.unit}.` };
}
const M2 = {
  'p-sub': { type: 'expression', ideas: ['substitute'], level: 'beginner', form: 'shape', label: 'H =', answer: '4(3) + 3(2) + 5', vars: [],
    prompt: 'The plan has 3 tabletops and 2 berms. Substitute t = 3 and b = 2 into H = 4t + 3b + 5. Write the expression with the numbers in place; don’t work it out yet.',
    traps: [{ expr: '43 + 32 + 5', code: 'concatenate', message: '4t means 4 × t, so 4(3) is 4 × 3, not forty-three. Keep the value in brackets.' }, { expr: '4(2) + 3(3) + 5', code: 'variable-meaning', message: 'Check which value goes with which letter: t = 3 tabletops, b = 2 berms.' }, { expr: '4(3) + 3(2)', code: 'missing-constant', message: 'Keep the + 5 for site preparation.' }],
    hints: ['Substituting means replacing each letter with its value.', 'Put each value in brackets where its letter was.', 't becomes (3) and b becomes (2): 4(3) + 3(…) + 5.'], solution: 'H = 4(3) + 3(2) + 5.' },
  'p-total': { type: 'number', ideas: ['substitute', 'formulas'], level: 'beginner', label: 'H', unit: 'crew-hours', answer: V('4(3) + 3(2) + 5'), prompt: 'Now evaluate H = 4(3) + 3(2) + 5.',
    traps: [{ value: 80, code: 'concatenate', message: '4(3) means 4 × 3 = 12, not 43.' }, { value: V('4(2) + 3(3) + 5'), code: 'variable-meaning', message: 'Tabletops are 3, berms are 2.' }, { value: 18, code: 'missing-constant', message: 'Add the 5 hours of site preparation.' }, { value: 17, code: 'wrong-operation', message: '4(3) means multiply: 4 × 3.' }],
    hints: ['Multiply first: 4(3) and 3(2).', '4 × 3 = 12 and 3 × 2 = 6.', '12 + 6 + 5.'], solution: `${steps('4(3) + 3(2) + 5')}. Tabletop shaping 12 h, berm shaping 6 h, site preparation 5 h: 23 crew-hours.` },
  'el-sub': { type: 'expression', ideas: ['substitute', 'negatives'], level: 'intermediate', form: 'shape', label: 'Ef =', answer: '2400 + (−125.5)', also: ['2400 − 125.5'], vars: [],
    prompt: 'The start is 2,400 ft above sea level. A mapped section descends 125.5 ft, so ΔE = −125.5. Substitute into Ef = Ei + ΔE.',
    traps: [{ expr: '2400 + 125.5', code: 'sign-error', message: 'The section descends, so the change is negative: ΔE = −125.5.' }],
    hints: ['Ei is where you start; ΔE is the signed change.', 'A descent is a negative change.', 'Ef = 2400 + (…).'], solution: 'Ef = 2400 + (−125.5). Adding a negative is the same as subtracting: 2400 − 125.5.' },
  'el-final': { type: 'number', ideas: ['negatives'], level: 'intermediate', label: 'Ef', unit: 'ft', answer: V('2400 + (-125.5)'), prompt: 'Evaluate Ef = 2400 + (−125.5).',
    traps: [{ value: V('2400 + 125.5'), code: 'sign-error', message: 'Adding −125.5 lowers the elevation.' }, { value: 2275.5, code: 'decimal-place', message: 'Check the tenths: 2400.0 − 125.5.' }],
    hints: ['Adding a negative means subtracting.', '2400 − 125.5.', '2400 − 125 = 2275, then take off 0.5 more.'], solution: 'Ef = 2400 − 125.5 = 2,274.5 ft.' },
  'el-two': { type: 'number', ideas: ['negatives', 'fractions-decimals'], level: 'advanced', label: 'Ef', unit: 'ft', answer: V('2150 + (-85) + 40.5'),
    prompt: 'A connector starts at 2,150 ft, drops 85 ft, then climbs 40.5 ft. Evaluate Ef = 2150 + (−85) + 40.5.',
    traps: [{ value: V('2150 + 85 + 40.5'), code: 'sign-error', message: 'The drop is a negative change.' }, { value: V('2150 - 85 - 40.5'), code: 'sign-error', message: 'The climb is a positive change: add 40.5.' }],
    hints: ['Positive changes are gains; negative changes are losses.', 'Work left to right.', '2150 − 85 = 2065, then + 40.5.'], solution: `${steps('2150 + (-85) + 40.5')} ft.` },
  'el-meaning': { type: 'choice', ideas: ['negatives'], level: 'beginner', prompt: 'What does adding a negative elevation change do?',
    options: [opt('a', 'Lowers the elevation: adding −125.5 is the same as subtracting 125.5', true), opt('b', 'Raises the elevation', false, 'sign-error', 'A negative change is a loss.'), opt('c', 'Makes the elevation negative', false, 'sign-error', 'The elevation stays positive (2,274.5 ft). The change is what’s negative.'), opt('d', 'Nothing: the negative cancels the plus sign', false, 'sign-error', 'It changes the operation: + (−125.5) means − 125.5.')],
    hints: ['Think of the vertical scale.', 'A descent goes down.', 'a + (−b) = a − b.'], solution: 'Adding a negative value subtracts that amount: positive changes are gains, negative changes are losses.' },
  'fr-d': { type: 'number', ideas: ['fractions-decimals', 'substitute'], level: 'intermediate', label: 'D', unit: 'mi', answer: V('(3/4)(2.4)'), prompt: 'You’ve mapped 3/4 of a planned 2.4-mile trail network. D = (3/4)L with L = 2.4. How many miles are mapped?',
    traps: [{ value: V('2.4/(3/4)'), code: 'fraction-error', message: 'That’s 2.4 ÷ 3/4. Three-quarters “of” 2.4 means multiply.' }, { value: V('2.4/4'), code: 'fraction-error', message: 'That’s one quarter. You’ve mapped three quarters: 3 × 0.6.' }, { value: 0.75, code: 'fraction-error', message: 'That’s the fraction itself. Multiply it by the length, 2.4.' }],
    hints: ['A fraction of a length means multiply.', 'Split 2.4 into 4 equal parts: 0.6 each.', 'Three of those parts: 3 × 0.6.'], solution: 'D = (3/4)(2.4) = 1.8 miles: three of the four 0.6-mile sections.' },
  'fr-two': { type: 'number', ideas: ['fractions-decimals', 'substitute'], level: 'intermediate', label: 'D', unit: 'mi', answer: V('(2/3)(4.5)'), prompt: 'The flow line is 4.5 miles long, and 2/3 of it is built. D = (2/3)(4.5). How many miles are built?',
    traps: [{ value: V('4.5/(2/3)'), code: 'fraction-error', message: 'Multiply by 2/3; don’t divide.' }, { value: 1.5, code: 'fraction-error', message: 'That’s one third. Two thirds is twice that.' }],
    hints: ['Find one third first.', '4.5 ÷ 3 = 1.5.', 'Two thirds: 2 × 1.5.'], solution: 'D = (2/3)(4.5) = 3 miles.' },
  'dc-one': { type: 'number', ideas: ['fractions-decimals'], level: 'beginner', label: 'D', unit: 'mi', answer: V('1.25 + 0.75'), prompt: 'A planned trail connection is 1.25 miles long. A new connector adds 0.75 miles. D = 1.25 + 0.75.',
    traps: [{ value: 1.325, code: 'decimal-place', message: 'Line up the decimal points: 0.75 is seventy-five hundredths.' }, { value: 1.1, code: 'decimal-place', message: 'Line up the decimal points before adding.' }],
    hints: ['Line up the decimal points.', '1.25 + 0.75: add the hundredths, then the tenths.', '0.25 + 0.75 = 1.'], solution: 'D = 1.25 + 0.75 = 2 miles.' },
  'dc-two': { type: 'number', ideas: ['fractions-decimals'], level: 'intermediate', label: 'D', unit: 'mi', answer: V('0.8 + 1.35 + 0.6'), prompt: 'Three connectors measure a = 0.8 mi, b = 1.35 mi and c = 0.6 mi. Evaluate D = a + b + c.',
    traps: [{ value: V('0.08 + 1.35 + 0.6'), code: 'decimal-place', message: '0.8 is eight tenths (0.80), not eight hundredths.' }, { value: V('0.8 + 1.35'), code: 'missing-constant', message: 'Add all three connectors.' }],
    hints: ['Write each with two decimal places.', '0.80 + 1.35 + 0.60.', '0.80 + 1.35 = 2.15.'], solution: 'D = 0.80 + 1.35 + 0.60 = 2.75 miles.' },
  'dc-three': { type: 'number', ideas: ['fractions-decimals', 'formulas'], level: 'advanced', label: 'D', unit: 'mi', answer: V('3(2.6) + 0.45'), prompt: 'A loop is L = 2.6 miles. A rider plans 3 laps plus a w = 0.45-mile warm-up. Evaluate D = 3L + w.',
    traps: [{ value: V('3(2.6 + 0.45)'), code: 'grouping-write', message: 'Only the laps are multiplied by 3; the warm-up is ridden once.' }, { value: 7.8, code: 'missing-constant', message: 'Add the warm-up.' }, { value: V('3 + 2.6 + 0.45'), code: 'wrong-operation', message: '3L means 3 × L.' }],
    hints: ['Substitute: D = 3(2.6) + 0.45.', 'Multiply first: 3 × 2.6.', '7.8 + 0.45.'], solution: 'D = 3(2.6) + 0.45 = 7.8 + 0.45 = 8.25 miles.' },
  ...CH_QS
};

// ================================================================ Mission 3: Organize the Materials
// The Shaper's Calculation Board: pick the next operation. Graded by components/labs.js.
export const BOARD = [
  { id: 'cb-1', expr: '5 + 3 × 4', level: 'beginner' },
  { id: 'cb-2', expr: '48 ÷ 6 × 2', level: 'beginner' },
  { id: 'cb-3', expr: '18 − 4 + 3', level: 'beginner' },
  { id: 'cb-4', expr: '2[7 + (3²)] ÷ 4', level: 'intermediate' },
  { id: 'cb-5', expr: '(18 + 6) ÷ 3', level: 'intermediate' },
  { id: 'cb-6', expr: '3(18 + 2²) + 12', level: 'advanced' }
].map(b => ({ ...b, answer: V(b.expr) }));
const BOARD_QS = Object.fromEntries(BOARD.map(b => [b.id, { type: 'board', ideas: ['order', 'grouping'], level: b.level, expr: b.expr, answer: b.answer, prompt: `Simplify ${P(b.expr)} one operation at a time.`,
  hints: ['Look for grouping symbols first, then exponents.', 'Then multiplication and division from left to right, then addition and subtraction from left to right.', 'Next: ' + (solveSteps(b.expr)[0] || {}).text + '.'],
  solution: steps(b.expr) + '.' }]));

// Catch the Crew's Mistake: each crew member's working, line by line.
export const MISTAKES = [
  { id: 'cm1', crew: 'Jordan', expr: '48 ÷ 6 × 2', lines: ['48 ÷ 12', '4'], wrong: 0, code: 'left-to-right', fix: 'Multiplication and division share priority, so work from left to right: 48 ÷ 6 = 8, then 8 × 2 = 16.' },
  { id: 'cm2', crew: 'Sam', expr: '20 − 5 + 3', lines: ['20 − 8', '12'], wrong: 0, code: 'left-to-right', fix: 'Addition doesn’t come before subtraction: they share priority, left to right. 20 − 5 = 15, then 15 + 3 = 18.' },
  { id: 'cm3', crew: 'Riley', expr: '2 + 3 × (8 − 2)²', lines: ['2 + 3 × 6²', '2 + 3 × 12', '2 + 36', '38'], wrong: 1, code: 'exponent-multiply', fix: '6² means 6 × 6 = 36, not 6 × 2. Then 3 × 36 = 108, and 2 + 108 = 110.' },
  { id: 'cm4', crew: 'Alex', expr: '4(5 + 3) − 6', lines: ['20 + 3 − 6', '23 − 6', '17'], wrong: 0, code: 'ignore-grouping', fix: 'The 4 multiplies the whole bracket. Work inside first: 5 + 3 = 8, then 4 × 8 = 32, then 32 − 6 = 26.' },
  { id: 'cm5', crew: 'Casey', expr: '(12 + 18)/(2 × 3)', bar: true, lines: ['12 + 18 ÷ 2 × 3', '12 + 9 × 3', '12 + 27', '39'], wrong: 0, code: 'fraction-bar', fix: 'The fraction bar groups the top and the bottom. Top: 12 + 18 = 30. Bottom: 2 × 3 = 6. Then 30 ÷ 6 = 5.' }
].map(m => ({ ...m, answer: V(m.expr) }));
const lineOptions = m => [...m.lines.map((l, i) => opt('l' + i, `Line ${i + 1}: = ${l}`, i === m.wrong, 'wrong', i < m.wrong ? 'That line is right. The mistake comes later.' : 'There’s an earlier line that’s already wrong.')), opt('none', 'Every line is right', false, m.code, 'Check each line against the order of operations.')];
const MISTAKE_QS = {};
for (const m of MISTAKES) {
  MISTAKE_QS[m.id + '-line'] = { type: 'choice', keepOrder: true, ideas: ['errors', 'order'], level: 'advanced', prompt: `${m.crew} simplified ${m.bar ? 'the fraction ' : ''}${P(m.expr)}${m.bar ? ' (written with a fraction bar)' : ''}. Where did ${m.crew} first go wrong?`,
    options: lineOptions(m), hints: ['Check each line against the line before it.', 'Order: grouping, exponents, × and ÷ left to right, + and − left to right.', `Look closely at line ${m.wrong + 1}.`], solution: m.fix };
}
MISTAKE_QS['cm1-why'] = { type: 'choice', ideas: ['errors', 'order'], level: 'intermediate', prompt: 'What should Jordan have done instead?',
  options: [opt('a', 'Worked left to right: 48 ÷ 6 = 8, then 8 × 2 = 16', true), opt('b', 'Multiplied first, because multiplication always comes before division', false, 'left-to-right', 'Multiplication and division share the same priority.'), opt('c', 'Added the numbers', false, 'arithmetic', 'There’s no addition here.'), opt('d', 'Nothing: 4 is right', false, 'left-to-right', '48 ÷ 6 × 2 = 16.')],
  hints: ['Do × and ÷ have different priorities?', 'They share one priority level.', 'Equal priority: left to right.'], solution: MISTAKES[0].fix };
for (const id of ['cm3', 'cm5']) {
  const m = MISTAKES.find(x => x.id === id);
  MISTAKE_QS[id + '-fix'] = { type: 'number', ideas: ['errors', 'order', 'grouping'], level: 'advanced', label: 'Correct value', answer: m.answer, prompt: `What should ${m.crew}’s answer have been?`,
    traps: [{ value: V(m.lines[m.lines.length - 1]), code: m.code, message: `That’s ${m.crew}’s answer.` }], hints: ['Start again from the original.', m.fix.split('.')[0] + '.', 'Finish the steps in order.'], solution: m.fix };
}
const M3 = {
  'in-first': { type: 'choice', ideas: ['order', 'grouping'], level: 'beginner', prompt: 'M = 3(18 + 2²) + 12. Which calculation comes first?',
    options: [opt('a', '2² = 4', true), opt('b', '3 × 18 = 54', false, 'ignore-grouping', 'The 3 multiplies the whole bracket, and inside the bracket there’s still work to do.'), opt('c', '18 + 2 = 20', false, 'exponent-order', 'The exponent belongs to the 2: work out 2² before adding.'), opt('d', '18 + 12 = 30', false, 'ignore-grouping', 'The 12 is outside the bracket; it’s added last.')],
    hints: ['Start inside the grouping symbols.', 'Inside the bracket there’s an addition and an exponent.', 'Exponents come before addition.'], solution: 'Inside the bracket, the exponent comes first: 2² = 4.' },
  'in-total': { type: 'number', ideas: ['order', 'grouping'], level: 'intermediate', label: 'M', unit: 'markers', answer: V('3(18 + 2²) + 12'), prompt: 'Three zones each need 18 boundary markers and a 2-by-2 square of feature markers (2²), plus 12 perimeter markers shared by the park. Simplify M = 3(18 + 2²) + 12.',
    traps: [{ value: V('3(18) + 2² + 12'), code: 'ignore-grouping', message: 'The 3 multiplies everything in the bracket: each zone has 18 + 4 markers.' }, { value: V('3(18 + 4 + 12)'), code: 'ignore-grouping', message: 'The 12 perimeter markers are outside the bracket: they’re shared, not per zone.' }, { value: V('3(18 + 2) + 12'), code: 'exponent-multiply', message: '2² = 2 × 2 = 4.' }, { value: 66, code: 'missing-constant', message: 'Add the 12 perimeter markers.' }],
    hints: ['Grouping symbols first, and inside them the exponent.', '2² = 4, so the bracket is 18 + 4 = 22.', '3 × 22 = 66, then add 12.'], solution: `${steps('3(18 + 2²) + 12')}: 78 markers.` },
  ...BOARD_QS,
  'pa-a': { type: 'number', ideas: ['order', 'grouping'], level: 'beginner', label: 'Value', answer: V('3(6 + 2)'), prompt: 'Evaluate 3(6 + 2).',
    traps: [{ value: V('3 × 6 + 2'), code: 'ignore-grouping', message: 'The brackets come first: 6 + 2 = 8.' }], hints: ['Brackets first.', '6 + 2 = 8.', '3 × 8.'], solution: '3(6 + 2) = 3 × 8 = 24.' },
  'pa-b': { type: 'number', ideas: ['order'], level: 'beginner', label: 'Value', answer: V('3 × 6 + 2'), prompt: 'Evaluate 3 × 6 + 2.',
    traps: [{ value: V('3(6 + 2)'), code: 'add-before-multiply', message: 'Without brackets, multiply first: 3 × 6 = 18.' }], hints: ['No brackets this time.', 'Multiplication before addition.', '3 × 6 = 18.'], solution: '3 × 6 + 2 = 18 + 2 = 20. The brackets in 3(6 + 2) change which step comes first, and so the answer.' },
  'pa-c': { type: 'number', ideas: ['order', 'grouping'], level: 'advanced', label: 'Value', answer: V('2[3 + (4 + 1)²]'), prompt: 'Evaluate 2[3 + (4 + 1)²].',
    traps: [{ value: V('2[3 + 4 + 1²]'), code: 'exponent-order', message: 'The exponent applies to the whole bracket (4 + 1): work out 4 + 1 = 5 first, then 5².' }, { value: V('2[3 + 10]'), code: 'exponent-multiply', message: '5² = 5 × 5 = 25.' }, { value: V('2 × 3 + 25'), code: 'ignore-grouping', message: 'The 2 multiplies the whole bracket.' }],
    hints: ['Work from the innermost grouping outward.', '(4 + 1) = 5, and 5² = 25.', '3 + 25 = 28, then 2 × 28.'], solution: `${steps('2[3 + (4 + 1)²]')}.` },
  'pa-d': { type: 'number', ideas: ['order'], level: 'intermediate', label: 'Value', answer: V('12 − 4 ÷ 2'), prompt: 'Evaluate 12 − 4 ÷ 2.',
    traps: [{ value: V('(12 − 4) ÷ 2'), code: 'add-before-multiply', message: 'That would be (12 − 4) ÷ 2. Without brackets, divide first.' }], hints: ['Division before subtraction.', '4 ÷ 2 = 2.', '12 − 2.'], solution: '12 − 4 ÷ 2 = 12 − 2 = 10.' },
  'fb-parts': { type: 'choice', ideas: ['grouping'], level: 'beginner', prompt: 'In the fraction above, which part is the numerator and which is the denominator?',
    options: [opt('a', 'Numerator 18 + 6, denominator 3', true), opt('b', 'Numerator 18, denominator 6 + 3', false, 'fraction-bar', 'The bar groups everything above it: all of 18 + 6.'), opt('c', 'Numerator 6, denominator 3', false, 'fraction-bar', 'The numerator is the whole top: 18 + 6.'), opt('d', 'Numerator 3, denominator 18 + 6', false, 'fraction-bar', 'The numerator is on top.')],
    hints: ['Numerator on top, denominator underneath.', 'The bar groups the whole top.', 'Everything above the bar: 18 + 6.'], solution: 'Numerator: 18 + 6 (everything above the bar). Denominator: 3.' },
  'fb-val': { type: 'number', ideas: ['grouping', 'order'], level: 'beginner', label: 'Markers per zone', answer: V('(18 + 6)/3'), prompt: 'A supply order has 18 standard markers and 6 extra markers, divided equally among 3 park zones. Evaluate (18 + 6) ÷ 3.',
    traps: [{ value: V('18 + 6/3'), code: 'fraction-bar', message: 'The bar (or the brackets) groups 18 + 6: add first, then divide.' }], hints: ['The fraction bar is a grouping symbol.', 'Work out the whole numerator first.', '24 ÷ 3.'], solution: '(18 + 6) ÷ 3 = 24 ÷ 3 = 8 markers per zone.' },
  'fb-two': { type: 'number', ideas: ['grouping', 'order'], level: 'advanced', label: 'Value', answer: V('(30 − 6)/(2 + 4)'), prompt: 'Evaluate the fraction with 30 − 6 on top and 2 + 4 underneath.',
    traps: [{ value: V('30 − 6/2 + 4'), code: 'fraction-bar', message: 'The bar groups the top and the bottom: work out 30 − 6 and 2 + 4 first.' }, { value: V('(30 − 6)/2 + 4'), code: 'fraction-bar', message: 'The bar groups the bottom too: 2 + 4 = 6.' }],
    hints: ['Both the top and the bottom are grouped.', 'Top: 30 − 6. Bottom: 2 + 4.', '24 ÷ 6.'], solution: 'Top 24, bottom 6: 24 ÷ 6 = 4.' },
  ...MISTAKE_QS
};
// Practice: a new expression to evaluate, and a crew member's new working.
export const ORDER_PRACTICE = [
  { expr: '36 ÷ 4 × 3', crew: 'Mo', lines: ['36 ÷ 12', '3'], wrong: 0, code: 'left-to-right' },
  { expr: '7 + 2(9 − 4)²', crew: 'Jess', lines: ['7 + 2 × 5²', '9 × 5²', '9 × 25', '225'], wrong: 1, code: 'add-before-multiply' },
  { expr: '30 − 12 + 6', crew: 'Kai', lines: ['30 − 18', '12'], wrong: 0, code: 'left-to-right' },
  { expr: '(20 + 4)/(5 − 2)', bar: true, crew: 'Lee', lines: ['20 + 4 ÷ 5 − 2', '20 + 0.8 − 2', '18.8'], wrong: 0, code: 'fraction-bar' },
  { expr: '5[2 + (6 − 3)²]', crew: 'Ari', lines: ['5[2 + 3²]', '5[2 + 6]', '5 × 8', '40'], wrong: 1, code: 'exponent-multiply' },
  { expr: '4 × 3² − 10', crew: 'Noor', lines: ['12² − 10', '144 − 10', '134'], wrong: 0, code: 'exponent-order' }
].map(o => ({ ...o, answer: V(o.expr) }));
export const ORDER_PRACTICE_IDS = ['ox-val', 'ox-line'];
export function orderPractice(n) {
  const O = pick(ORDER_PRACTICE, n);
  return tidy({
    brief: `Inventory sheet ${n + 1}: ${P(O.expr)}${O.bar ? ' (the division is a fraction bar)' : ''}.`,
    'ox-val': { type: 'number', ideas: ['order', 'grouping'], level: 'advanced', label: 'Value', answer: O.answer, prompt: `Evaluate ${P(O.expr)}.`,
      traps: [{ value: V(O.lines[O.lines.length - 1]), code: O.code, message: 'That skips the order of operations somewhere: check each step.' }],
      hints: ['Grouping, then exponents, then × and ÷, then + and −.', 'Equal priorities go left to right.', 'First step: ' + solveSteps(O.expr)[0].text + '.'], solution: `${steps(O.expr)}.` },
    'ox-line': { type: 'choice', keepOrder: true, ideas: ['errors'], level: 'advanced', prompt: `${O.crew} worked it out like this. Where did ${O.crew} first go wrong?`, options: lineOptions(O),
      hints: ['Compare each line with the one before.', 'Which rule decides the order of that step?', `Look at line ${O.wrong + 1}.`], solution: `Line ${O.wrong + 1} is the first mistake. Correctly: ${steps(O.expr)}.` }
  });
}

// ================================================================ Mission 4: The Builder's Math Toolkit
const setOptions = card => {
  const has = classify(card);
  const fb = s => {
    if (s === 'natural' && !card.irrational && Number(card.value) === 0) return ['natural-zero', 'This lab starts the natural numbers at 1, so 0 is whole but not natural.'];
    if (card.irrational && s !== 'irrational') return ['irrational-sets', card.label + ' can’t be written as a fraction of integers, so it isn’t in any of the rational sets.'];
    if (s === 'irrational') return ['decimal-irrational', card.label + ' can be written as a fraction of integers, so it’s rational, not irrational.'];
    return ['set-membership', { natural: 'Natural numbers are the counting numbers 1, 2, 3, …', whole: 'Whole numbers are 0, 1, 2, 3, …: no negatives or fractions.', integer: 'Integers are …, −2, −1, 0, 1, 2, …: no fractions or decimals between them.', rational: '' }[s]];
  };
  return SETS.map(s => { const [code, msg] = has[s] ? [null, null] : fb(s); return opt(s, SET_NAMES[s], has[s], code, msg); });
};
const CARD_QS = {};
for (const c of CARDS) {
  const sets = setsOf(c).map(s => SET_NAMES[s].toLowerCase());
  CARD_QS['ns-' + c.id] = { type: 'multi', inline: true, keepOrder: true, ideas: ['number-sets'], level: c.irrational ? 'intermediate' : 'beginner', card: c.id,
    prompt: `Card ${c.label} (${c.context.charAt(0).toLowerCase() + c.context.slice(1)}). Select every set it belongs to.`, options: setOptions(c),
    hints: ['The sets nest: natural ⊂ whole ⊂ integers ⊂ rationals. Irrationals sit beside the rationals.', c.irrational ? 'Can it be written as a fraction of two integers?' : 'Start with the smallest set it fits, then everything that contains that set.', c.irrational ? 'π and √2 never end or repeat.' : 'Is it a counting number? Is it a negative? Is it between two integers?'],
    solution: `${c.label}: ${sets.join(', ')}. ${reasons(c).join(' ')}` };
}
const M4 = {
  ...CARD_QS,
  'ns-zero-why': { type: 'choice', ideas: ['number-sets'], level: 'beginner', prompt: 'Quick check: why is 0 a whole number but not a natural number in this lab?',
    options: [opt('a', 'Natural numbers start at 1 (counting); whole numbers add 0', true), opt('b', '0 isn’t a number', false, 'set-membership', '0 is a number: it’s whole, an integer and rational.'), opt('c', '0 is negative', false, 'set-membership', '0 is neither positive nor negative.'), opt('d', '0 is irrational', false, 'decimal-irrational', '0 = 0/1, a fraction of integers.')],
    hints: ['What are the counting numbers?', 'Counting starts at 1.', 'Whole numbers are the counting numbers plus 0.'], solution: 'In this lab the natural numbers start at 1. The whole numbers are 0, 1, 2, 3, …, so 0 is whole but not natural.' },
  'ns-pi-why': { type: 'choice', ideas: ['number-sets'], level: 'intermediate', prompt: 'Quick check: why is π irrational?',
    options: [opt('a', 'Its decimal never ends and never repeats, so it isn’t a fraction of integers', true), opt('b', 'It’s written with a Greek letter', false, 'set-membership', 'The symbol doesn’t decide it: what matters is whether it can be a fraction of integers.'), opt('c', 'It equals 3.14, a decimal', false, 'decimal-irrational', '3.14 is only an approximation. Terminating decimals like 3.14 are rational.'), opt('d', 'It’s bigger than 3', false, 'set-membership', 'Size has nothing to do with it.')],
    hints: ['Rational means “a ratio (fraction) of integers”.', 'What does π’s decimal do?', '3.14159… never ends or repeats.'], solution: 'π = 3.14159… never ends and never repeats, so it can’t be written as a fraction of integers: it’s irrational (but still real).' },
  'pc-which': { type: 'multi', ideas: ['properties'], level: 'beginner', prompt: 'Which statements are true? Tick every one.',
    options: [opt('a', '4 + 6 = 6 + 4', true), opt('b', '4 × 6 = 6 × 4', true), opt('c', '8 − 3 = 3 − 8', false, 'commutative-subtraction', '8 − 3 = 5 but 3 − 8 = −5: order matters for subtraction.'), opt('d', '12 ÷ 4 = 4 ÷ 12', false, 'commutative-subtraction', '12 ÷ 4 = 3 but 4 ÷ 12 = 1/3: order matters for division.')],
    hints: ['Work out both sides of each.', 'Swapping works for adding and multiplying.', 'Try 8 − 3 and 3 − 8.'], solution: 'Addition and multiplication are commutative; subtraction and division are not.' },
  'as-non': { type: 'number', ideas: ['properties'], level: 'intermediate', label: 'Value', answer: V('12 − (4 − 2)'), prompt: '(12 − 4) − 2 = 6. Now regroup: what is 12 − (4 − 2)?',
    traps: [{ value: 6, code: 'commutative-subtraction', message: 'Regrouping subtraction changes the result: work out the new bracket first.' }], hints: ['Brackets first.', '4 − 2 = 2.', '12 − 2.'], solution: '12 − (4 − 2) = 12 − 2 = 10, not 6. The associative property doesn’t work for subtraction.' },
  'id-mult': { type: 'number', ideas: ['properties'], level: 'beginner', label: 'Identity', answer: 1, prompt: '8 × ? = 8 for any count of equipment. What is the multiplicative identity?',
    traps: [{ value: 0, code: 'inverse-confusion', message: '8 × 0 = 0. Zero is the additive identity: 8 + 0 = 8.' }, { value: 8, code: 'arithmetic', message: '8 × 8 = 64.' }], hints: ['Multiplying by it changes nothing.', '8 × ? = 8.', 'One group of 8.'], solution: '1: multiplying by 1 leaves any number unchanged (8 × 1 = 8). Adding 0 does the same for addition.' },
  'inv-add': { type: 'number', ideas: ['properties'], level: 'beginner', label: 'Change', unit: 'ft', answer: -7, prompt: 'A section climbs 7 ft. What elevation change brings you back to where you started? 7 + ? = 0',
    traps: [{ value: 1 / 7, code: 'inverse-confusion', message: 'That’s the multiplicative inverse (7 × 1/7 = 1). Here you need a sum of 0.' }, { value: 0, code: 'inverse-confusion', message: '7 + 0 = 7.' }],
    hints: ['Equal and opposite.', 'A climb is positive; going back down is…', 'The opposite of 7.'], solution: '−7: 7 + (−7) = 0. A number plus its additive inverse (its opposite) is 0.' },
  'inv-mult': { type: 'number', ideas: ['properties'], level: 'intermediate', label: 'Reciprocal', answer: 0.25, prompt: '4 × ? = 1. What is the multiplicative inverse (reciprocal) of 4? A fraction like 1/4 is fine.',
    traps: [{ value: -4, code: 'inverse-confusion', message: 'That’s the additive inverse (4 + (−4) = 0). Here you need a product of 1.' }],
    hints: ['Its product with 4 is 1.', 'Flip 4/1 over.', '4 × 1/4 = 1.'], solution: '1/4: 4 × (1/4) = 1. A nonzero number times its reciprocal is 1.' },
  'inv-zero': { type: 'choice', ideas: ['properties'], level: 'intermediate', prompt: 'Does 0 have a multiplicative inverse?',
    options: [opt('a', 'No: 0 times any number is 0, never 1', true), opt('b', 'Yes, 1/0', false, 'zero-inverse', 'Division by zero isn’t defined, so 1/0 isn’t a number.'), opt('c', 'Yes, 0 itself', false, 'zero-inverse', '0 × 0 = 0, not 1.'), opt('d', 'Yes, −0', false, 'zero-inverse', '−0 is just 0.')],
    hints: ['You’d need 0 × ? = 1.', 'What is 0 × anything?', 'It’s always 0.'], solution: 'No. 0 × anything = 0, so nothing makes 1: zero has no multiplicative inverse.' },
  'di-dist': { type: 'expression', ideas: ['distributive'], level: 'beginner', form: 'shape', label: 'Rewritten', answer: '5(2) + 5(3)', vars: [], shapeMessage: 'That’s the right value. Show the distributing instead: 5 times each part.',
    prompt: 'Five builders each need 2 flags and 3 markers: 5(2 + 3). Rewrite it with the distributive property (don’t work it out).',
    traps: [{ expr: '5(2) + 3', code: 'distribute-partial', message: 'The 5 multiplies both parts: 5(2) + 5(3).' }],
    hints: ['Multiply 5 by each part inside the brackets.', '5 × 2 and 5 × 3.', 'Join them with +.'], solution: '5(2 + 3) = 5(2) + 5(3) = 10 + 15 = 25, the same as 5(5) = 25.' },
  'di-x': { type: 'expression', ideas: ['distributive'], level: 'intermediate', form: 'simplified', label: 'Expanded', answer: '4x + 8', vars: ['x'], prompt: 'Distribute: 4(x + 2).',
    traps: [{ expr: '4x + 2', code: 'distribute-partial', message: 'The 4 multiplies the 2 as well: 4 × 2 = 8.' }, { expr: 'x + 8', code: 'distribute-partial', message: 'The 4 multiplies x too.' }],
    hints: ['Multiply 4 by each part.', '4 × x and 4 × 2.', '4x + …'], solution: '4(x + 2) = 4x + 8: multiplication distributes across everything inside the brackets.' },
  'di-eval': { type: 'number', ideas: ['distributive', 'substitute'], level: 'intermediate', label: 'Value', answer: V('4(x + 2)', { x: 3 }), prompt: 'Check it with x = 3: evaluate 4(x + 2).',
    traps: [{ value: V('4(3) + 2'), code: 'distribute-partial', message: '4(3 + 2) = 4 × 5.' }], hints: ['Substitute x = 3.', '4(3 + 2).', 'Or 4(3) + 8.'], solution: '4(3 + 2) = 4 × 5 = 20, and 4(3) + 8 = 12 + 8 = 20: both forms agree.' },
  'lt-a': { type: 'expression', ideas: ['like-terms'], level: 'beginner', form: 'simplified', label: 'Simplified', answer: '5t', vars: ['t'], prompt: 'Three planned tabletops plus two more: simplify 3t + 2t.',
    traps: [{ expr: '5t^2', code: 'like-terms-exponent', message: 'Adding like terms adds the coefficients; t isn’t squared. 3 tabletops + 2 tabletops = 5 tabletops.' }, { expr: '6t', code: 'arithmetic', message: 'Add the coefficients: 3 + 2.' }],
    hints: ['Both terms count tabletops.', 'Add the coefficients.', '3 + 2.'], solution: '3t + 2t = 5t: like terms combine by adding their coefficients.' },
  'lt-b': { type: 'choice', ideas: ['like-terms'], level: 'intermediate', prompt: 'Can 3t + 2b (3 tabletops and 2 berms) be simplified to 5tb or 5t?',
    options: [opt('a', 'No: t and b count different features, so they aren’t like terms', true), opt('b', 'Yes, to 5tb', false, 'combine-unlike', '5tb would mean 5 × t × b: a different quantity altogether.'), opt('c', 'Yes, to 5t', false, 'combine-unlike', 'That would turn 2 berms into tabletops.'), opt('d', 'Yes, to 6tb', false, 'combine-unlike', 't and b are different variables.')],
    hints: ['Like terms have the same variable part.', 'Is a berm a tabletop?', 'Try t = 1, b = 10: is 3t + 2b equal to 5t?'], solution: '3t + 2b is already simplified. Only terms with the same variable part combine.' },
  'lt-c': { type: 'expression', ideas: ['like-terms'], level: 'advanced', form: 'simplified', label: 'Simplified', answer: '6t + 3b + 5', vars: ['t', 'b'], prompt: 'Simplify the build plan 4t + 3b + 2t + 5.',
    traps: [{ expr: '9tb + 5', code: 'combine-unlike', message: 'Only the t terms combine: 4t + 2t.' }, { expr: '6t + 3b', code: 'missing-constant', message: 'Keep the constant 5.' }, { expr: '6t + 8b', code: 'combine-unlike', message: 'The 5 is a constant, not a berm term.' }],
    hints: ['Group the like terms.', '4t and 2t are like terms.', '4t + 2t = 6t; the 3b and 5 stay.'], solution: '4t + 2t + 3b + 5 = 6t + 3b + 5 (commutative property to reorder, then combine like terms).' }
};
// Identify the Property: rapid-fire cards (the PRD's examples), then a misuse to catch.
const PROPS = ['commutative', 'associative', 'identity', 'inverse', 'distributive'];
const PROP_FB = {
  commutative: 'Commutative swaps the order: a + b = b + a.', associative: 'Associative moves the brackets: (a + b) + c = a + (b + c).', identity: 'Identity adds 0 or multiplies by 1.',
  inverse: 'Inverse gives 0 (a + (−a)) or 1 (a × 1/a).', distributive: 'Distributive multiplies each part: a(b + c) = ab + ac.'
};
const propQ = (stmt, right, level) => ({ type: 'choice', inline: true, keepOrder: true, ideas: ['properties', ...(right === 'distributive' ? ['distributive'] : [])], level: level || 'beginner', prompt: stmt,
  options: PROPS.map(p => opt(p, p[0].toUpperCase() + p.slice(1), p === right, 'property-names', PROP_FB[p])),
  hints: ['What changed from the left side to the right side?', 'Order? Grouping? A 0 or 1? An opposite or reciprocal? Multiplying across brackets?', PROP_FB[right]], solution: `${right[0].toUpperCase() + right.slice(1)}. ${PROP_FB[right]}` });
const RAPID = [['ip-1', '7 + 3 = 3 + 7', 'commutative'], ['ip-2', '(2 + 4) + 5 = 2 + (4 + 5)', 'associative'], ['ip-3', '9 + 0 = 9', 'identity'], ['ip-4', '8 + (−8) = 0', 'inverse'], ['ip-5', '3(4 + 2) = 3(4) + 3(2)', 'distributive'], ['ip-6', '6 × 1 = 6', 'identity']];
for (const [id, s, p] of RAPID) M4[id] = propQ(s, p);
M4['ip-wrong'] = { type: 'choice', ideas: ['properties', 'distributive'], level: 'advanced', prompt: 'A crew member wrote these. Which one is NOT a correct use of a property?',
  options: [opt('a', '3(4 + 2) = 3(4) + 2', true), opt('b', '5 × 7 = 7 × 5', false, 'property-names', 'That’s a correct use of the commutative property.'), opt('c', '(1 + 2) + 3 = 1 + (2 + 3)', false, 'property-names', 'That’s a correct use of the associative property.'), opt('d', '6 + (−6) = 0', false, 'property-names', 'That’s a correct use of the additive inverse.')],
  hints: ['Work out both sides of each.', 'One side won’t match.', 'Check the distributive one carefully.'], solution: '3(4 + 2) = 18 but 3(4) + 2 = 14. The 3 must multiply both parts: 3(4) + 3(2).' };
// Practice: new property cards and new numbers to classify.
export const PROP_PRACTICE = [
  { stmt: '12 × 5 = 5 × 12', prop: 'commutative', card: sqrtCard(9, 'a perfect-square root') },
  { stmt: '(3 × 2) × 5 = 3 × (2 × 5)', prop: 'associative', card: { label: '−7', value: new Frac(-7), context: 'a drop of 7 ft' } },
  { stmt: '15 + 0 = 15', prop: 'identity', card: { label: '0.125', value: new Frac(1, 8), context: 'an eighth of a mile' } },
  { stmt: '(1/5) × 5 = 1', prop: 'inverse', card: { label: '1/3', value: new Frac(1, 3), context: 'a third of the crew' } },
  { stmt: '2(t + 6) = 2t + 12', prop: 'distributive', card: sqrtCard(5, 'a map diagonal') },
  { stmt: '4 + (−4) = 0', prop: 'inverse', card: { label: '12', value: new Frac(12), context: 'twelve flags' } },
  { stmt: 'b + 3t = 3t + b', prop: 'commutative', card: { label: '−2.75', value: new Frac(-11, 4), context: 'a signed change in feet' } },
  { stmt: '1 × 9.5 = 9.5', prop: 'identity', card: sqrtCard(16, 'a perfect-square root') }
];
export const PROP_PRACTICE_IDS = ['px-prop', 'px-class'];
export function propPractice(n) {
  const X = pick(PROP_PRACTICE, n), c = X.card;
  return {
    brief: `Workshop card ${n + 1}.`,
    'px-prop': propQ(X.stmt, X.prop, 'intermediate'),
    'px-class': { type: 'multi', inline: true, keepOrder: true, ideas: ['number-sets'], level: 'intermediate', prompt: `Classify ${c.label} (${c.context}). Select every set it belongs to.`, options: setOptions(c),
      hints: ['Natural ⊂ whole ⊂ integers ⊂ rationals; irrationals are separate.', c.label.startsWith('√') ? 'Is the number under the root a perfect square?' : 'Can it be written as a fraction of integers?', 'Then check: counting number? negative? between integers?'],
      solution: `${c.label}${c.note ? ' (' + c.note + ')' : ''}: ${setsOf(c).map(s => SET_NAMES[s].toLowerCase()).join(', ')}.` }
  };
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'blueprint', n: 1, title: 'Create the Blueprint', short: 'Create the Blueprint', minutes: '10–12', focus: 'Variables and Expressions', badge: 'Blueprint Designer',
    blurb: 'Turn the construction brief into an expression, take it apart, and watch it change as you design your line.', graded: Object.keys(M1) },
  { id: 'plan', n: 2, title: 'Plan the Build', short: 'Plan the Build', minutes: '10–12', focus: 'Evaluating Expressions', badge: 'Build Planner',
    blurb: 'Substitute real numbers: crew-hours, elevations, fractions of the map and decimal distances.', graded: Object.keys(M2) },
  { id: 'materials', n: 3, title: 'Organize the Materials', short: 'Organize the Materials', minutes: '10–12', focus: 'Order of Operations', badge: 'Materials Manager',
    blurb: 'Run the inventory, simplify one operation at a time, and catch the crew’s calculation mistakes.', graded: Object.keys(M3) },
  { id: 'toolkit', n: 4, title: 'The Builder’s Math Toolkit', short: 'The Builder’s Toolkit', minutes: '10–12', focus: 'Properties of Real Numbers', badge: 'Master Shaper',
    blurb: 'Sort numbers into their sets, then use the properties to rearrange, regroup and simplify.', graded: Object.keys(M4) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)) };

// ================================================================ Final Algebra Certification
// Ten questions per round: Variables and Expressions 2, Evaluating 3, Order of
// Operations 2, Properties 3. New examples, never the stage questions.
export const FINAL_SETS = [
  { build: { note: 'Each drop takes 5 crew-hours and each berm 3, plus 4 hours to clear the site. Use d for drops and b for berms.', answer: '5d + 3b + 4', vars: ['d', 'b'] },
    parts: { expr: '6w + 2p + 9', ask: 'coefficient', tokens: [['6', true], ['w', false], ['2', true], ['p', false], ['9', false]] },
    sub: { rhs: '5d + 3b + 4', letter: 'H', vars: { d: 2, b: 6 }, unit: 'crew-hours' },
    neg: { letter: 'Ef', story: 'Ef = Ei + ΔE with Ei = 1,850 ft and ΔE = −312.75 ft.', expr: '1850 + (-312.75)', unit: 'ft' },
    frac: { story: 'You’ve mapped 5/8 of a 3.2-mile network.', expr: '(5/8)(3.2)', unit: 'mi' },
    order: { expr: '40 − 2(3 + 1)² ÷ 4' },
    error: { crew: 'Pat', expr: '18 ÷ 3 × 2', lines: ['18 ÷ 6', '3'], wrong: 0, code: 'left-to-right' },
    card: { label: '−9', value: new Frac(-9), context: 'a 9 ft drop' },
    prop: ['(5 + 9) + 1 = 5 + (9 + 1)', 'associative'],
    apply: { prompt: 'Simplify 2(3t + 4) + t.', answer: '7t + 8', vars: ['t'] } },
  { build: { note: 'Each of n kits holds 3 stakes and 4 flags, and there are 6 spare flags.', answer: '7n + 6', vars: ['n'] },
    parts: { expr: '4j + 7r + 12', ask: 'constant', tokens: [['4', false], ['j', false], ['7', false], ['r', false], ['12', true]] },
    sub: { rhs: '3k + 2f + 10', letter: 'M', vars: { k: 5, f: 5 }, unit: 'markers' },
    neg: { letter: 'E', story: 'E = 2300 + 6d, where each of 6 sections changes the elevation by d = −14.5 ft.', expr: '2300 + 6(-14.5)', unit: 'ft' },
    frac: { story: 'Three-fifths of a 4.5-mile flow line is built: D = (3/5)(4.5).', expr: '(3/5)(4.5)', unit: 'mi' },
    order: { expr: '3[10 − (2 + 1)²] + 5' },
    error: { crew: 'Robin', expr: '12 − 4 + 2', lines: ['12 − 6', '6'], wrong: 0, code: 'left-to-right' },
    card: { label: '0.375', value: new Frac(3, 8), context: 'three-eighths of a mile' },
    prop: ['7 × (1/7) = 1', 'inverse'],
    apply: { prompt: 'Simplify 5b + 2t + 3b.', answer: '8b + 2t', vars: ['b', 't'] } },
  { build: { note: 'Each wooden wall ride takes 6 crew-hours and each roller 1 hour, plus 8 hours for a viewing deck. Use w and r.', answer: '6w + r + 8', vars: ['w', 'r'] },
    parts: { expr: '5d + 3s + 7', ask: 'variable', tokens: [['5', false], ['d', true], ['3', false], ['s', true], ['7', false]] },
    sub: { rhs: '6w + r + 8', letter: 'H', vars: { w: 3, r: 7 }, unit: 'crew-hours' },
    neg: { letter: 'Ef', story: 'Ef = 2025.5 + ΔE₁ + ΔE₂ with ΔE₁ = −48.75 ft and ΔE₂ = 12.25 ft.', expr: '2025.5 + (-48.75) + 12.25', unit: 'ft' },
    frac: { story: 'Two-thirds of a 5.4-mile loop is marked: D = (2/3)(5.4).', expr: '(2/3)(5.4)', unit: 'mi' },
    order: { expr: '(14 + 2²)/(3 × 2)', bar: true },
    error: { crew: 'Quinn', expr: '2 × (1 + 3)²', lines: ['2 × 4²', '8²', '64'], wrong: 1, code: 'exponent-order' },
    card: sqrtCard(7, 'a diagonal on the map'),
    prop: ['6 + 0 = 6', 'identity'],
    apply: { prompt: 'Distribute 6(x + 3).', answer: '6x + 18', vars: ['x'] } },
  { build: { note: 'Each hip jump takes 5 crew-hours and each step-up 4 hours, plus 6 hours of site preparation. Use j and u.', answer: '5j + 4u + 6', vars: ['j', 'u'] },
    parts: { expr: '3b + 9t + 2', ask: 'term', tokens: [['3b', true], ['9t', true], ['2', true], ['3', false], ['b', false], ['+', false]] },
    sub: { rhs: '2n + 9', letter: 'P', vars: { n: 11 }, unit: 'pieces' },
    neg: { letter: 'E', story: 'E = 1700 + 3d − 20 with d = −8.5 ft.', expr: '1700 + 3(-8.5) − 20', unit: 'ft' },
    frac: { story: 'Seven-tenths of a 6.5-mile network is mapped: D = (7/10)(6.5).', expr: '(7/10)(6.5)', unit: 'mi' },
    order: { expr: '50 ÷ 5 × 2 + 3²' },
    error: { crew: 'Sky', expr: '(20 + 10)/(5 + 1)', bar: true, lines: ['20 + 10 ÷ 5 + 1', '20 + 2 + 1', '23'], wrong: 0, code: 'fraction-bar' },
    card: { label: '0', value: new Frac(0), context: 'no extra materials' },
    prop: ['4(t + 2) = 4t + 8', 'distributive'],
    apply: { prompt: 'Simplify 3t + 5 + 4t + 2.', answer: '7t + 7', vars: ['t'] } }
];
export const FINAL_IDS = ['fa-build', 'fa-parts', 'fb-sub', 'fb-neg', 'fb-frac', 'fc-order', 'fc-error', 'fd-class', 'fd-prop', 'fd-apply'];
export const PASS_MARK = 8;   // of 10, right without the solution shown
const ROLE = { coefficient: 'coefficient', constant: 'constant', variable: 'variable', term: 'term' };
export function finalQuestions(roundNo) {
  const S = pick(FINAL_SETS, roundNo - 1), sub = S.sub, subExpr = sub.rhs.replace(/(\d)([a-z])/g, '$1($2)').replace(/[a-z]/g, m => String(sub.vars[m]));
  const qs = {
    set: S,
    'fa-build': { type: 'expression', ideas: ['write-expr'], level: 'intermediate', label: 'Expression', answer: S.build.answer, vars: S.build.vars, prompt: `Builder’s note: “${S.build.note}” Write an expression for the total.`,
      traps: [{ expr: S.build.answer.replace(/\s*\+\s*\d+$/, ''), code: 'missing-constant', message: 'Don’t forget the fixed amount.' }],
      hints: ['Which parts repeat for every item, and which part is fixed?', 'Repeated amounts multiply their letters.', 'Add the fixed part.'], solution: `${P(S.build.answer)}.` },
    'fa-parts': { type: 'multi', inline: true, keepOrder: true, ideas: ['parts'], level: 'beginner', prompt: `In ${P(S.parts.expr)}, select every ${ROLE[S.parts.ask]}.`,
      options: S.parts.tokens.map(([t, ok], i) => opt('k' + i, t, ok, S.parts.ask === 'term' ? 'term-split' : 'coefficient-constant', null)),
      hints: ['Variables change; coefficients multiply variables; constants are fixed; terms are separated by + and −.', `Look for the ${ROLE[S.parts.ask]}${S.parts.ask === 'constant' ? '' : 's'}.`, 'Check each token.'],
      solution: `${S.parts.tokens.filter(t => t[1]).map(t => t[0]).join(', ')}.` },
    'fb-sub': { type: 'number', ideas: ['substitute', 'formulas'], level: 'beginner', label: sub.letter, unit: sub.unit, answer: V(sub.rhs, sub.vars), prompt: `Evaluate ${sub.letter} = ${P(sub.rhs)} when ${varText(sub.vars)}.`,
      traps: [{ value: V(sub.rhs.replace(/\s*\+\s*\d+$/, ''), sub.vars), code: 'missing-constant', message: 'Add the constant.' }],
      hints: ['Substitute each value.', `${sub.letter} = ${P(subExpr)}.`, 'Multiply, then add.'], solution: `${sub.letter} = ${P(subExpr)} = ${num(V(sub.rhs, sub.vars))} ${sub.unit}.` },
    'fb-neg': { type: 'number', ideas: ['negatives', 'substitute'], level: 'advanced', label: S.neg.letter || 'Ef', unit: S.neg.unit, answer: V(S.neg.expr), prompt: S.neg.story + ' Evaluate it.',
      traps: [{ value: V(S.neg.expr.replace(/-(?=\d)/g, '')), code: 'sign-error', message: 'Keep the negative sign: adding a negative lowers the value.' }],
      hints: ['Substitute, keeping negatives in brackets.', P(S.neg.expr) + '.', 'Multiply first, then add and subtract left to right.'], solution: `${steps(S.neg.expr)} ${S.neg.unit}.` },
    'fb-frac': { type: 'number', ideas: ['fractions-decimals'], level: 'intermediate', label: 'D', unit: S.frac.unit, answer: V(S.frac.expr), prompt: S.frac.story + ' How many miles?',
      traps: [{ value: V(S.frac.expr.replace(/\((\d+)\/(\d+)\)\(([\d.]+)\)/, '$3/($1/$2)')), code: 'fraction-error', message: 'A fraction “of” a length means multiply.' }],
      hints: ['Multiply the fraction by the length.', 'Divide by the denominator, then multiply by the numerator.', P(S.frac.expr) + '.'], solution: `${P(S.frac.expr)} = ${num(V(S.frac.expr))} ${S.frac.unit}.` },
    'fc-order': { type: 'number', ideas: ['order', 'grouping'], level: 'advanced', label: 'Value', answer: V(S.order.expr), prompt: `Evaluate ${P(S.order.expr)}${S.order.bar ? ' (the division is a fraction bar)' : ''}.`,
      hints: ['Grouping, exponents, × and ÷ left to right, + and − left to right.', 'First: ' + solveSteps(S.order.expr)[0].text + '.', 'Keep going one step at a time.'], solution: `${steps(S.order.expr)}.` },
    'fc-error': { type: 'choice', keepOrder: true, ideas: ['errors'], level: 'advanced', prompt: `${S.error.crew} simplified ${P(S.error.expr)}${S.error.bar ? ' (a fraction bar)' : ''}. Where did ${S.error.crew} first go wrong?`, options: lineOptions(S.error),
      hints: ['Check each line against the order of operations.', 'Which step was done too early?', 'Compare with the correct first step: ' + solveSteps(S.error.expr)[0].text + '.'], solution: `Line ${S.error.wrong + 1}. Correctly: ${steps(S.error.expr)}.` },
    'fd-class': { type: 'multi', inline: true, keepOrder: true, ideas: ['number-sets'], level: 'intermediate', prompt: `Classify ${S.card.label} (${S.card.context}). Select every set it belongs to.`, options: setOptions(S.card),
      hints: ['Natural ⊂ whole ⊂ integers ⊂ rationals; irrationals are separate.', 'Find the smallest set it fits.', 'Then every set containing that one.'], solution: `${S.card.label}: ${setsOf(S.card).map(s => SET_NAMES[s].toLowerCase()).join(', ')}.` },
    'fd-prop': propQ(S.prop[0], S.prop[1], 'intermediate'),
    'fd-apply': { type: 'expression', ideas: [/Distribute|\(/.test(S.apply.prompt) ? 'distributive' : 'like-terms', 'like-terms'].filter((x, i, a) => a.indexOf(x) === i), level: 'advanced', form: 'simplified', label: 'Simplified', answer: S.apply.answer, vars: S.apply.vars, prompt: S.apply.prompt,
      hints: ['Distribute any brackets first.', 'Then collect like terms.', 'Add the coefficients of matching letters.'], solution: `${P(S.apply.answer)}.` }
  };
  return tidy(qs);
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[BUILD_PRACTICE, buildPractice, BUILD_PRACTICE_IDS], [ORDER_PRACTICE, orderPractice, ORDER_PRACTICE_IDS], [PROP_PRACTICE, propPractice, PROP_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const F = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...F[id].ideas])]; }
  return out;
}
export { P as pretty, steps as stepText, num as showNum };
