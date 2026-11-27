// The Dream Line Project: the Math Workbench's content, one entry per
// activity. Simple mode: the concept, plain words, the formula, what each
// symbol means, a worked example and the park connection. Advanced mode:
// the full expression, substituted values, every step, the properties in
// play and the common errors. Kept apart from the page code so the words can
// be edited without touching it.

import { solveSteps } from '../../lesson-kit/expr.js';
const steps = e => solveSteps(e).map(s => s.text);

export const WORKBENCH = {
  expressions: {
    title: 'Writing expressions',
    simple: { concept: 'An algebraic expression uses numbers, letters and operations to describe a quantity.', plain: 'When you don’t know a number yet (how many tabletops?), use a letter for it. Then the expression works for every park.',
      formula: 'H = 4t + 3b + 5', vars: [['t', 'number of tabletops'], ['b', 'number of berms'], ['H', 'total crew-hours']],
      example: '“4 hours for each tabletop” → 4 × t → 4t.', park: 'Every feature you add to your map changes t or b, and H follows.' },
    advanced: { full: 'H = 4t + 3b + 5', sub: 'With t = 3, b = 2: H = 4(3) + 3(2) + 5', steps: steps('4(3) + 3(2) + 5'), props: ['A number written next to a letter multiplies it: 4t = 4 × t.'],
      errors: ['Writing t + 4 for “4 for each t” (that adds 4 once).', 'Leaving out the constant (the site preparation).', 'Combining 4t + 3b into 7tb: t and b count different things.'] }
  },
  anatomy: {
    title: 'Parts of an expression',
    simple: { concept: 'Variables, coefficients, constants and terms.', plain: 'Variables change; coefficients multiply variables; constants stay fixed; terms are the pieces separated by + and −.',
      formula: '4t + 3b + 5', vars: [['t, b', 'variables'], ['4, 3', 'coefficients'], ['5', 'constant'], ['4t, 3b, 5', 'terms']],
      example: 'In 6w + 2: variable w, coefficient 6, constant 2, terms 6w and 2.', park: 'The coefficients are the hours each feature costs; the constant is the site preparation.' },
    advanced: { full: '4t + 3b + 5', sub: 'Terms: +4t, +3b, +5', steps: ['Split at each + or − sign.', 'A term with a letter has a coefficient (its number).', 'A term with no letter is a constant.'], props: ['In 3b − 2, the terms are 3b and −2: the sign belongs to the term after it.'],
      errors: ['Calling the 4 in 4t a term on its own.', 'Calling the + sign a term.', 'Mixing up the coefficient (4) and the variable (t).'] }
  },
  evaluate: {
    title: 'Substituting and evaluating',
    simple: { concept: 'To evaluate an expression, replace each variable with its value, then calculate.', plain: 'Put each number in brackets where its letter was, so 4t becomes 4(3), which means 4 × 3.',
      formula: 'H = 4t + 3b + 5', vars: [['t = 3', '3 tabletops'], ['b = 2', '2 berms']],
      example: 'H = 4(3) + 3(2) + 5 = 12 + 6 + 5 = 23 crew-hours.', park: 'The same blueprint works for any plan: just change the values.' },
    advanced: { full: 'H = 4t + 3b + 5', sub: 'H = 4(3) + 3(2) + 5', steps: steps('4(3) + 3(2) + 5'), props: ['Brackets keep a substituted value together, especially a negative one: 4(−2.5).'],
      errors: ['Reading 4(3) as 43.', 'Swapping the values of two letters.', 'Working it out before writing the substitution, and losing track.'] }
  },
  negatives: {
    title: 'Signed elevation change',
    simple: { concept: 'Positive values can be gains and negative values losses.', plain: 'Adding a negative value means subtracting that amount.',
      formula: 'Ef = Ei + ΔE', vars: [['Ef', 'final elevation'], ['Ei', 'initial elevation'], ['ΔE', 'signed change: + climbs, − descends']],
      example: 'Ef = 2400 + (−125.5) = 2400 − 125.5 = 2274.5 ft.', park: 'A descent of 125.5 ft is a change of −125.5 ft.' },
    advanced: { full: 'Ef = Ei + ΔE', sub: 'Ef = 2400 + (−125.5)', steps: ['2400 + (−125.5) = 2400 − 125.5', '= 2274.5'], props: ['a + (−b) = a − b', 'A number times a negative is negative: 4(−2.5) = −10.'],
      errors: ['Adding the size of a loss instead of subtracting it.', 'Thinking a negative change makes the elevation itself negative.'] }
  },
  fractions: {
    title: 'Fractions and decimals',
    simple: { concept: 'A fraction of an amount means multiply.', plain: '(3/4)(2.4) means three-quarters of 2.4: split it into 4 equal parts and take 3.',
      formula: 'D = (3/4)L', vars: [['L', 'planned length (mi)'], ['D', 'mapped distance (mi)']],
      example: 'D = (3/4)(2.4) = 3 × 0.6 = 1.8 mi.', park: 'Three of the four sections of the trail map are done.' },
    advanced: { full: 'D = (3/4)L', sub: 'D = (3/4)(2.4)', steps: steps('(3/4)(2.4)'), props: ['Line up decimal points when adding: 1.25 + 0.75 = 2.00.', 'All of these values are rational: they’re fractions of integers.'],
      errors: ['Dividing by the fraction instead of multiplying.', 'Misaligning decimals: 0.8 is 0.80, not 0.08.'] }
  },
  order: {
    title: 'Order of operations',
    simple: { concept: 'An agreed order makes every expression have one value.', plain: 'Grouping symbols first, then exponents, then × and ÷ from left to right, then + and − from left to right.',
      formula: 'M = 3(18 + 2²) + 12', vars: [['3', 'zones'], ['18 + 2²', 'markers per zone'], ['12', 'shared perimeter markers']],
      example: '5 + 3 × 4 = 5 + 12 = 17 (multiply first).', park: 'Count each zone’s markers before multiplying by the number of zones.' },
    advanced: { full: '3(18 + 2²) + 12', sub: 'Inside the grouping, the exponent first', steps: steps('3(18 + 2²) + 12'), props: ['× and ÷ share a priority level, so do + and −: work left to right within a level.'],
      errors: ['48 ÷ 6 × 2 as 48 ÷ 12 (× isn’t first; go left to right).', '18 − 4 + 3 as 18 − 7 (+ isn’t first either).', 'Ignoring the brackets: 3 × 18 + 4.'] }
  },
  grouping: {
    title: 'Grouping symbols',
    simple: { concept: 'Parentheses ( ), brackets [ ] and fraction bars all group.', plain: 'Work out what’s inside a grouping first, starting from the innermost. A fraction bar groups everything above it and everything below it.',
      formula: '(18 + 6) / 3', vars: [['18 + 6', 'numerator (all of it)'], ['3', 'denominator']],
      example: '(18 + 6) ÷ 3 = 24 ÷ 3 = 8 markers per zone.', park: 'All 24 markers are shared among the 3 zones.' },
    advanced: { full: '2[7 + (3²)] ÷ 4', sub: 'Innermost grouping first', steps: steps('2[7 + (3²)] ÷ 4'), props: ['3(6 + 2) = 24 but 3 × 6 + 2 = 20: grouping changes the result.'],
      errors: ['Dividing only the last number above a fraction bar.', 'Working an outer bracket before the inner one.'] }
  },
  errors: {
    title: 'Finding mistakes',
    simple: { concept: 'Check each line against the line before it.', plain: 'The first wrong line is where the order of operations (or the arithmetic) broke.',
      formula: '48 ÷ 6 × 2', vars: [['48 ÷ 6', 'comes first (left to right)']],
      example: 'Wrong: 48 ÷ 12 = 4. Right: 48 ÷ 6 = 8, then 8 × 2 = 16.', park: 'One slip in the inventory means the wrong number of markers on site.' },
    advanced: { full: '48 ÷ 6 × 2', sub: 'Equal priority: left to right', steps: steps('48 ÷ 6 × 2'), props: ['Fix the first wrong line; everything after it inherits the mistake.'],
      errors: ['Addition before subtraction.', 'Ignoring brackets.', '6² as 12.', 'Ignoring a fraction bar.'] }
  },
  numbers: {
    title: 'Number sets',
    simple: { concept: 'Natural ⊂ Whole ⊂ Integers ⊂ Rational ⊂ Real. Irrational numbers are real but not rational.', plain: 'Natural: 1, 2, 3, … (this lab starts at 1). Whole: add 0. Integers: add negatives. Rational: any fraction of integers. Irrational: decimals that never end or repeat.',
      formula: 'rational = a/b (a, b integers, b ≠ 0)', vars: [['6', 'natural, whole, integer, rational'], ['−4', 'integer, rational'], ['π', 'irrational']],
      example: '2.5 = 5/2, so it’s rational.', park: 'Counts of features are natural; signed changes are integers; measurements are rational.' },
    advanced: { full: 'N ⊂ W ⊂ Z ⊂ Q ⊂ R', sub: 'Q and the irrationals together make R', steps: ['Is it a fraction of integers? Rational. If not: irrational.', 'Is it a whole number with no fraction part? Integer.', 'Is it 0 or more? Whole. 1 or more? Natural.'], props: ['√9 = 3 is natural; √2 is irrational.'],
      errors: ['Counting 0 as natural (in this lab).', 'Calling 3.14 or 2.5 irrational.', 'Leaving negatives out of the integers.'] }
  },
  properties: {
    title: 'Properties of real numbers',
    simple: { concept: 'Rules that let you rearrange, regroup and simplify without changing the value.', plain: 'Commutative: swap the order. Associative: move the brackets. Identity: + 0 or × 1. Inverse: back to 0 or 1.',
      formula: 'a + b = b + a,  (a + b) + c = a + (b + c)', vars: [['a, b, c', 'any real numbers']],
      example: '4 + 6 = 6 + 4 = 10 bundles, either order.', park: 'Add equipment piles in whatever order is easiest.' },
    advanced: { full: 'a × b = b × a,  a + 0 = a,  a × 1 = a,  a + (−a) = 0,  a × (1/a) = 1 (a ≠ 0)', sub: 'Non-examples: 8 − 3 ≠ 3 − 8;  (12 − 4) − 2 ≠ 12 − (4 − 2)', steps: ['Commutative and associative work for + and ×, not − or ÷.', 'Zero has no multiplicative inverse.'], props: [],
      errors: ['Swapping the numbers in a subtraction.', 'Confusing −4 (additive inverse) with 1/4 (reciprocal).'] }
  },
  distributive: {
    title: 'The distributive property',
    simple: { concept: 'Multiplying a sum multiplies every part of it.', plain: 'Five builders each need 2 flags and 3 markers: 5(2 + 3) = 5(2) + 5(3).',
      formula: 'a(b + c) = ab + ac', vars: [['a', 'what’s multiplying'], ['b + c', 'what’s inside']],
      example: '4(x + 2) = 4x + 8.', park: 'Count all the flags, then all the markers, or count whole kits: same total.' },
    advanced: { full: '5(2 + 3) = 5(2) + 5(3)', sub: '= 10 + 15 = 25 = 5(5)', steps: ['4(x + 2) = 4·x + 4·2', '= 4x + 8', 'Check at x = 3: 4(5) = 20 and 12 + 8 = 20.'], props: ['Distributive, then combine like terms: 2(3t + 4) + t = 7t + 8.'],
      errors: ['Multiplying only the first part: 4(x + 2) as 4x + 2.'] }
  },
  likeTerms: {
    title: 'Combining like terms',
    simple: { concept: 'Like terms have the same variable part, and add by adding coefficients.', plain: '3 tabletops plus 2 tabletops is 5 tabletops. 3 tabletops plus 2 berms stays 3t + 2b.',
      formula: '3t + 2t = 5t', vars: [['3t, 2t', 'like terms'], ['3t, 2b', 'unlike terms']],
      example: '4t + 3b + 2t + 5 = 6t + 3b + 5.', park: 'Group the same kind of feature together in the build plan.' },
    advanced: { full: '4t + 3b + 2t + 5', sub: '= (4t + 2t) + 3b + 5', steps: ['Reorder (commutative) and regroup (associative).', '4t + 2t = (4 + 2)t = 6t (distributive).', '6t + 3b + 5.'], props: ['Combining like terms is the distributive property in reverse.'],
      errors: ['3t + 2b = 5tb.', '3t + 2t = 5t².'] }
  }
};
