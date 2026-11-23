// Pump Track Profile Lab: every graded question. Answers come from the
// models (exact algebra in poly.js), never typed in by hand. Each has three
// progressive hints (concept, method, next step), a solution with its
// meaning in the profile model, and traps: anticipated wrong answers with
// a misconception code and a message.

import { FLOW, P, Q, CUBIC, MULT, Mpoly, BASE, ADJUST, COMPLEX, ZERO_PRACTICE, DIVIDE_PRACTICE, FINAL_SETS, pick } from './models.js';
import { fromRoots, fromHigh, add, sub, mul, scale, evalAt, synthetic, longDivide, text, factoredText, high, degree, leading, endBehavior, maxTurning, signIntervals, rationalCandidates, show } from './poly.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
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
const rot = (list, n) => list.map((o, i, a) => a[(i + (n % (a.length - 1)) + 1) % a.length]);
const coefFields = (p, labels, traps = {}) => high(p).map((c, i) => ({ id: 'c' + i, label: labels[i], answer: Number(c), tolerance: 1e-6, traps: traps[i] || [] }));
const sup = n => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
const powLabels = n => Array.from({ length: n + 1 }, (_, i) => { const k = n - i; return k === 0 ? 'constant' : k === 1 ? 'x' : 'x' + sup(k); });

export const IDEAS = {
  recognize: 'Recognizing polynomial functions',
  degree: 'Identifying degree',
  leading: 'Identifying leading coefficients',
  'end-behavior': 'End behavior',
  turning: 'Turning points',
  add: 'Adding polynomials',
  subtract: 'Subtracting polynomials',
  multiply: 'Multiplying polynomials',
  expand: 'Polynomial expansion',
  zeros: 'Identifying zeros',
  factoring: 'Factoring higher-degree polynomials',
  multiplicity: 'Understanding multiplicity',
  graphing: 'Graphing polynomial functions',
  'rational-zero': 'Rational Zero Theorem',
  synthetic: 'Synthetic division',
  'long-division': 'Polynomial long division',
  remainder: 'Remainder Theorem',
  'factor-theorem': 'Factor Theorem',
  interpret: 'Interpreting polynomial models',
  complex: 'Complex zeros'
};
// The PRD's nineteen tracked skills, in its order.
export const REPORT_IDEAS = ['recognize', 'degree', 'leading', 'end-behavior', 'turning', 'add', 'subtract', 'multiply', 'expand', 'zeros', 'factoring', 'multiplicity', 'graphing', 'rational-zero', 'synthetic', 'long-division', 'remainder', 'factor-theorem', 'interpret'];

export const MISCONCEPTIONS = {
  'degree-terms': 'Confusing degree with the number of terms',
  'leading-wrong': 'Misidentifying the leading coefficient',
  'end-odd-even': 'Mixing up end behavior for odd and even degrees',
  'end-sign': 'Ignoring the sign of the leading coefficient',
  'turning-limit': 'Thinking a graph can have unlimited turning points',
  'domain-vs-end': 'Treating end behavior as the real track’s shape',
  'not-polynomial': 'Accepting a non-polynomial (negative or fractional power, or a variable exponent)',
  'unlike-terms': 'Combining terms with different exponents',
  'sign-distribute': 'Forgetting to distribute a negative sign',
  distribute: 'Distributing incorrectly',
  'binomial-mult': 'Multiplying binomials incorrectly',
  'zero-factor': 'Confusing zeros with factors (sign of the factor)',
  'set-zero': 'Forgetting to set each factor equal to zero',
  'simple-repeated': 'Confusing simple and repeated roots',
  'cross-touch': 'Misreading crossing and touching behavior',
  'roots-turning': 'Confusing roots with turning points',
  'lost-coef': 'Losing a coefficient',
  'missing-zero': 'Leaving out a zero coefficient for a missing power',
  'synthetic-sign': 'Using the wrong sign for k in synthetic division',
  'remainder-wrong': 'Calculating the remainder incorrectly',
  'quotient-divisor': 'Confusing the quotient and the divisor',
  'scale-zeros': 'Thinking a vertical scale changes the zeros',
  'rzt-wrong': 'Using the wrong numbers for the Rational Zero Theorem',
  'complex-real': 'Expecting complex zeros on the real graph'
};

// ================================================================ Mission 1: The Flow Line Decoder
const PP = P(), QQ = Q(), EB = endBehavior(PP), SI = signIntervals(PP, [0, 2, 6, 8], 0, 8);
const ivText = i => `${i.from} to ${i.to} m`;
const M1 = {
  'p-is-poly': {
    type: 'multi', ideas: ['recognize'], prompt: 'Which of these are polynomials in x?',
    options: [
      opt('a', '3x² + 4x + 1', true), opt('b', 'x³ − 5x + 6', true), opt('c', '2x⁴ − 3x² + 7', true),
      opt('d', '1/x + 2', false, 'not-polynomial', '1/x is x⁻¹: a negative power, so not a polynomial (its graph breaks at x = 0).'),
      opt('e', '√x + 4', false, 'not-polynomial', '√x is x^½: powers must be whole numbers ≥ 0.'),
      opt('f', '2ˣ + 1', false, 'not-polynomial', 'Here x is the exponent: that’s an exponential function, not a polynomial.')
    ],
    hints: ['Polynomial terms are a number times x to a whole-number power (0, 1, 2, …).', 'Rewrite 1/x and √x as powers of x.', 'Is the variable ever in the exponent?'],
    solution: 'Polynomials: 3x² + 4x + 1, x³ − 5x + 6, 2x⁴ − 3x² + 7. Not: 1/x = x⁻¹, √x = x^½, and 2ˣ (variable exponent). Polynomial graphs are smooth and unbroken, with no corners or gaps.'
  },
  'p-degree': {
    type: 'number', ideas: ['degree'], answer: degree(PP), tolerance: 0.001, label: 'Degree',
    prompt: `Flow Line A: P(x) = ${text(PP)}. What is its degree?`,
    traps: [{ value: 0.005, code: 'leading-wrong', message: 'That’s the leading coefficient. The degree is the highest exponent.' }, { value: 1, code: 'degree-terms', message: 'Look at the exponents: the highest power of x.' }],
    hints: ['Degree: the highest power of x.', 'Look at every exponent.', 'x⁴ is the highest.'], solution: 'Degree 4: the highest power is x⁴. (It also has 4 terms, but that’s a coincidence: degree counts the power, not the terms.)'
  },
  'p-lead': {
    type: 'number', ideas: ['leading'], answer: Number(leading(PP)), tolerance: 1e-6, label: 'Leading coefficient',
    prompt: 'What is the leading coefficient of P(x)?',
    traps: [{ value: -0.48, code: 'leading-wrong', message: 'That’s the last term’s coefficient. The leading coefficient goes with the highest power.' }, { value: 4, code: 'leading-wrong', message: '4 is the degree. The coefficient is the number in front of x⁴.' }, { value: 1, code: 'leading-wrong', message: 'The x⁴ term has a coefficient: 0.005.' }],
    hints: ['The leading term has the highest power.', 'Here that’s the x⁴ term.', 'Its coefficient is the number in front.'], solution: 'Leading term 0.005x⁴, leading coefficient 0.005.'
  },
  'p-end': {
    type: 'choice', ideas: ['end-behavior'], prompt: 'Degree 4, leading coefficient 0.005. What is the end behavior of the full polynomial?',
    options: [opt('a', 'Both ends rise', true), opt('b', 'Both ends fall', false, 'end-sign', 'The leading coefficient is positive: even degree with a positive coefficient rises at both ends.'),
      opt('c', 'Falls on the left, rises on the right', false, 'end-odd-even', 'That’s an odd degree. Even degrees do the same thing at both ends.'), opt('d', 'Rises on the left, falls on the right', false, 'end-odd-even', 'That’s an odd degree with a negative coefficient.')],
    hints: ['Even or odd degree?', 'Even degree: both ends go the same way.', 'Positive leading coefficient: up.'], solution: 'Even degree and positive leading coefficient: as x → −∞ and x → +∞, P(x) → +∞. Both ends rise.'
  },
  'p-end-domain': {
    type: 'choice', ideas: ['end-behavior', 'interpret'], prompt: 'Does that mean the real pump track climbs forever past x = 8?',
    options: [opt('a', 'No: the model only covers 0 ≤ x ≤ 8; end behavior describes the polynomial extended beyond it', true),
      opt('b', 'Yes: the track keeps rising after x = 8', false, 'domain-vs-end', 'The track stops at 8 m. Past that, it’s mathematical extrapolation only.'),
      opt('c', 'Yes, but only on the right-hand side', false, 'domain-vs-end', 'The model says nothing outside 0 ≤ x ≤ 8.'),
      opt('d', 'No, because the end behavior is “both ends fall”', false, 'end-sign', 'Both ends rise, and either way it’s about the extended polynomial, not the track.')],
    hints: ['What is the model’s domain?', '0 ≤ x ≤ 8.', 'End behavior is about x → ±∞.'], solution: 'The real section is only 0 ≤ x ≤ 8. End behavior is a property of the unrestricted polynomial, not a prediction about the track.'
  },
  'p-turn-max': {
    type: 'number', ideas: ['turning'], answer: maxTurning(PP), tolerance: 0.001, label: 'Max turning points',
    prompt: 'At most how many turning points can a degree-4 polynomial have?',
    traps: [{ value: 4, code: 'turning-limit', message: 'At most n − 1 for degree n.' }, { value: 5, code: 'turning-limit', message: 'At most n − 1 = 3.' }],
    hints: ['A turning point: where the graph changes direction.', 'Degree n allows at most n − 1.', '4 − 1.'], solution: 'At most 3, and Flow Line A has exactly 3 (find them on the graph).'
  },
  'p-turn-five': {
    type: 'choice', ideas: ['turning'], prompt: 'Could a fourth-degree polynomial have five turning points?',
    options: [opt('a', 'No: degree 4 allows at most 3', true), opt('b', 'Yes, if the coefficients are large enough', false, 'turning-limit', 'Size doesn’t matter; the degree limits the count.'), opt('c', 'Yes, on a longer domain', false, 'turning-limit', 'Even on the whole real line, at most 3.'), opt('d', 'Only if it has five zeros', false, 'roots-turning', 'A degree-4 polynomial has at most 4 zeros, and at most 3 turning points.')],
    hints: ['Use n − 1.', 'n = 4.', 'Is 5 ≤ 3?'], solution: 'No. A degree-n polynomial has at most n − 1 turning points, so degree 4 allows 3 at most.'
  },
  'p-below': {
    type: 'multi', ideas: ['graphing', 'interpret'], prompt: 'Where is the profile below the reference elevation (P(x) < 0)?',
    options: SI.map((iv, i) => opt('i' + i, ivText(iv), iv.sign === 'below', 'cross-touch', `From ${ivText(iv)} the profile is ${iv.sign} the line.`)),
    hints: ['Between zeros the sign doesn’t change.', 'Test a point in each interval, e.g. P(1).', 'P(1) = 0.005(1)(−1)(−5)(−7) < 0.'], solution: `Below on ${SI.filter(i => i.sign === 'below').map(ivText).join(' and ')} (dips); above on ${SI.filter(i => i.sign === 'above').map(ivText).join(' and ')} (the roller).`
  }
};

// ================================================================ Mission 2: Shape the Trail
const T = add(BASE(), ADJUST());
const SUB_A = fromHigh([3, 2, 0, -5]), SUB_B = fromHigh([1, -4, 1, -2]), SUB_R = sub(SUB_A, SUB_B);
const G1 = fromHigh([1, -8, 0]), G2 = fromHigh([1, -8, 12]), G12 = mul(G1, G2);
const CH = mul(fromHigh([1, 2, 0]), fromHigh([1, -3, 1]));
const M2 = {
  's-add': {
    type: 'choice', ideas: ['add'], prompt: `B(x) = ${text(BASE())} and A(x) = ${text(ADJUST())}. What is T(x) = B(x) + A(x)?`,
    options: [opt('a', text(T), true), opt('b', text(fromHigh([-0.005, 0.05, 0.2, 1])), false, 'sign-distribute', '0.1x + (−0.1x) = 0: the x-terms cancel.'),
      opt('c', '0.045x³ + 1', false, 'unlike-terms', 'Only like terms combine: x³ with x³, x² with x².'), opt('d', text(fromHigh([-0.005, 0.01, 0, 1])), false, 'sign-distribute', '0.02x² + 0.03x² = 0.05x².')],
    hints: ['Line up like terms (same power).', 'x³: −0.005. x²: 0.02 + 0.03. x: 0.1 − 0.1. constant: 1.', 'Write the sum from the highest power down.'], solution: `T(x) = ${text(T)}: a third-degree profile (the adjustment brought in the x³ term).`
  },
  's-x-term': {
    type: 'choice', ideas: ['add'], prompt: 'What happened to the x-term when you added them?',
    options: [opt('a', 'It cancelled: 0.1x + (−0.1x) = 0', true), opt('b', 'It doubled to 0.2x', false, 'sign-distribute', 'One is +0.1x and the other −0.1x.'), opt('c', 'It combined with the x² term', false, 'unlike-terms', 'x and x² are different powers; they never combine.'), opt('d', 'It became the constant', false, 'unlike-terms', 'The constant 1 came from B on its own.')],
    hints: ['Find each x-term.', 'B has +0.1x; A has −0.1x.', 'Add them.'], solution: 'The linear terms cancel, so T has no x-term.'
  },
  's-sub': {
    type: 'fields', ideas: ['subtract'], prompt: `Subtract: (${text(SUB_A)}) − (${text(SUB_B)}). Enter each coefficient of the result.`,
    fields: coefFields(SUB_R, powLabels(3), { 1: [{ value: 2 - 4, code: 'sign-distribute', message: 'Subtracting −4x² adds 4x²: 2 − (−4) = 6.' }], 2: [{ value: 1, code: 'sign-distribute', message: 'Subtracting +x gives −x.' }], 3: [{ value: -7, code: 'sign-distribute', message: '−5 − (−2) = −3.' }] }),
    hints: ['Distribute the minus sign to every term in the second bracket.', `−(${text(SUB_B)}) = ${text(scale(-1, SUB_B))}.`, 'Then combine like terms.'], solution: `${text(SUB_R)}. Every sign in the second polynomial flips before combining.`
  },
  's-recover': {
    type: 'choice', ideas: ['subtract', 'interpret'], prompt: 'Which expression recovers the shaping adjustment A(x) from the combined profile?',
    options: [opt('a', 'T(x) − B(x)', true), opt('b', 'B(x) − T(x)', false, 'sign-distribute', 'That gives −A(x): every sign flipped.'), opt('c', 'T(x) + B(x)', false, 'sign-distribute', 'That counts the baseline twice.'), opt('d', 'T(x) × B(x)', false, 'distribute', 'Undo an addition with a subtraction.')],
    hints: ['T = B + A.', 'Solve for A.', 'Subtract B from both sides.'], solution: `T − B = A: (${text(T)}) − (${text(BASE())}) = ${text(ADJUST())}.`
  },
  's-group': {
    type: 'choice', ideas: ['multiply'], prompt: 'Expanding Flow Line A: what is (x − 2)(x − 6)?',
    options: [opt('a', 'x² − 8x + 12', true), opt('b', 'x² − 8x − 12', false, 'binomial-mult', '(−2)(−6) = +12.'), opt('c', 'x² + 12', false, 'binomial-mult', 'Don’t forget the middle terms: −6x − 2x.'), opt('d', 'x² − 12x + 8', false, 'binomial-mult', 'Add the inner numbers for the middle term (−8) and multiply them for the constant (12).')],
    hints: ['Multiply each term by each term.', 'x·x, x·(−6), (−2)·x, (−2)(−6).', 'Combine −6x − 2x.'], solution: '(x − 2)(x − 6) = x² − 6x − 2x + 12 = x² − 8x + 12. And x(x − 8) = x² − 8x.'
  },
  's-expand': {
    type: 'fields', ideas: ['multiply', 'expand'], prompt: 'Multiply (x² − 8x)(x² − 8x + 12). Enter the coefficients.',
    fields: coefFields(G12, powLabels(4), { 1: [{ value: -8, code: 'distribute', message: 'x³ terms: x²·(−8x) + (−8x)·x² = −16x³.' }], 2: [{ value: 64, code: 'distribute', message: 'Don’t forget x²·12: 64x² + 12x² = 76x².' }, { value: 12, code: 'distribute', message: 'Also (−8x)(−8x) = 64x².' }], 3: [{ value: 96, code: 'sign-distribute', message: '(−8x)(12) = −96x.' }] }),
    hints: ['Use the grid: each term of the first times each term of the second.', 'x²·x², x²·(−8x), x²·12, −8x·x², −8x·(−8x), −8x·12.', 'Combine like terms.'], solution: `${text(G12)}: degree 2 + 2 = 4.`
  },
  's-scale': {
    type: 'choice', ideas: ['expand'], prompt: 'Now multiply x⁴ − 16x³ + 76x² − 96x by 0.005. Which is Flow Line A in standard form?',
    options: [opt('a', text(PP), true), opt('b', '0.005x⁴ − 16x³ + 76x² − 96x', false, 'distribute', 'Multiply every term by 0.005.'), opt('c', text(scale(0.05, G12)), false, 'distribute', '0.005, not 0.05.'), opt('d', '0.005x⁴ − 0.08x³ + 0.38x²', false, 'lost-coef', 'The −96x term becomes −0.48x; don’t lose it.')],
    hints: ['A scalar multiplies every term.', '−16 × 0.005 = −0.08.', '76 × 0.005 and −96 × 0.005.'], solution: `P(x) = ${text(PP)}: exactly the same function as 0.005x(x − 2)(x − 6)(x − 8).`
  },
  's-degree-rule': {
    type: 'choice', ideas: ['multiply', 'degree'], prompt: 'Multiplying a degree-2 polynomial by a degree-2 polynomial gives degree:',
    options: [opt('a', '4: degrees add when you multiply', true), opt('b', '2: the same as before', false, 'degree-terms', 'x² · x² = x⁴.'), opt('c', '8', false, 'degree-terms', 'Exponents add: 2 + 2.'), opt('d', 'It depends on the constants', false, 'degree-terms', 'Only the leading terms set the degree (if they’re nonzero).')],
    hints: ['Multiply the leading terms.', 'x² · x².', 'Exponents add.'], solution: 'Degree 4. Multiplying adds degrees (when the leading coefficients aren’t zero).'
  },
  's-add-drop': {
    type: 'choice', ideas: ['add', 'degree'], prompt: 'Can adding two degree-3 polynomials give a degree-2 result?',
    options: [opt('a', 'Yes, if the x³ terms cancel', true), opt('b', 'No: the degree always stays the same', false, 'degree-terms', 'x³ + (−x³) = 0, so the x³ term can disappear.'), opt('c', 'No: adding raises the degree to 6', false, 'degree-terms', 'Adding doesn’t multiply powers; that’s multiplication.'), opt('d', 'Only if the constants cancel', false, 'degree-terms', 'The constants don’t affect the degree.')],
    hints: ['What happens to the x³ terms?', '2x³ + (−2x³)?', 'Then the highest power left is x².'], solution: 'Yes. If the leading terms cancel, the sum has a lower degree. Adding never raises the degree.'
  },
  's-challenge': {
    type: 'fields', ideas: ['multiply', 'expand'], prompt: 'Challenge: expand (x² + 2x)(x² − 3x + 1).',
    fields: coefFields(CH, powLabels(4), { 1: [{ value: -3, code: 'distribute', message: 'x³ terms: x²·(−3x) + 2x·x² = −x³.' }], 2: [{ value: 1, code: 'distribute', message: 'x² terms: x²·1 + 2x·(−3x) = −5x².' }, { value: -6, code: 'distribute', message: 'Also x²·1 = x².' }] }),
    hints: ['Six products: x²·x², x²·(−3x), x²·1, 2x·x², 2x·(−3x), 2x·1.', 'x⁴ − 3x³ + x² + 2x³ − 6x² + 2x.', 'Combine x³ and x² terms.'], solution: `${text(CH)}: degree 4, leading coefficient 1.`
  }
};

// ================================================================ Mission 3: Find the Hidden Features
const CU = CUBIC(), CAND = rationalCandidates(CU).filter(c => Number(c) >= 0 && Number(c) <= 8).map(Number);
const M3 = {
  'f-scale': {
    type: 'choice', ideas: ['zeros'], prompt: 'Q(x) = 200 · P(x). How do Q’s zeros compare with P’s?',
    options: [opt('a', 'They’re the same: a nonzero scale stretches heights, not where they’re zero', true), opt('b', 'They’re 200 times bigger', false, 'scale-zeros', '200 × 0 = 0: wherever P is zero, Q is too.'), opt('c', 'They’re divided by 200', false, 'scale-zeros', 'Scaling the output doesn’t move any x-values.'), opt('d', 'Q has no zeros', false, 'scale-zeros', 'Q is zero exactly where P is.')],
    hints: ['If P(x) = 0, what is 200P(x)?', '200 × 0.', 'So the zeros don’t move.'], solution: 'Same zeros: 0, 2, 6, 8. Multiplying by 200 just makes the numbers easier: Q(x) = x⁴ − 16x³ + 76x² − 96x.'
  },
  'f-zeros': {
    type: 'fields', ideas: ['zeros', 'graphing'], prompt: 'Where does the profile cross the reference elevation? Enter the four zeros from smallest.',
    fields: [0, 2, 6, 8].map((v, i) => ({ id: 'z' + i, label: 'Zero ' + (i + 1), answer: v, tolerance: 0.001, traps: [{ value: -v, code: 'zero-factor', message: '(x − ' + v + ') = 0 gives x = +' + v + '.' }, { value: 4, code: 'roots-turning', message: 'x = 4 is a turning point (the top of the roller), not a zero.' }] })),
    hints: ['Zeros: where P(x) = 0.', 'In factored form, set each factor to 0.', 'x = 0, x − 2 = 0, x − 6 = 0, x − 8 = 0.'], solution: 'x = 0, 2, 6 and 8: where the profile meets the reference line.'
  },
  'f-factor': {
    type: 'choice', ideas: ['zeros', 'factor-theorem'], prompt: 'If x = 2 is a zero, which is a factor?',
    options: [opt('a', '(x − 2)', true), opt('b', '(x + 2)', false, 'zero-factor', '(x + 2) is zero at x = −2.'), opt('c', '(2x)', false, 'zero-factor', '2x is zero at x = 0.'), opt('d', '(x − 1/2)', false, 'zero-factor', 'That’s zero at x = 1/2.')],
    hints: ['A factor is zero at its root.', 'Which bracket is zero when x = 2?', '2 − 2 = 0.'], solution: '(x − 2): zero r ↔ factor (x − r).'
  },
  'f-mult': {
    type: 'fields', ideas: ['multiplicity'], prompt: `M(x) = ${factoredText(MULT.a, MULT.roots)}. Enter the multiplicity of each zero.`,
    fields: MULT.roots.map(([r, m]) => ({ id: 'm' + r, label: 'x = ' + r, answer: m, tolerance: 0.001, traps: [{ value: m === 2 ? 1 : 2, code: 'simple-repeated', message: 'Count how many times the factor appears (the exponent).' }] })),
    hints: ['Multiplicity: how many times a factor appears.', 'Read the exponents.', '(x − 3)² appears twice.'], solution: 'x = 1 and x = 5: multiplicity 1. x = 3: multiplicity 2.'
  },
  'f-touch': {
    type: 'choice', ideas: ['multiplicity', 'graphing'], prompt: 'Where does M touch the reference line and turn back without crossing?',
    options: [opt('a', 'x = 3 (even multiplicity)', true), opt('b', 'x = 1', false, 'cross-touch', 'x = 1 has multiplicity 1 (odd): the graph crosses there.'), opt('c', 'x = 5', false, 'cross-touch', 'Multiplicity 1: it crosses.'), opt('d', 'Everywhere it meets the line', false, 'cross-touch', 'Only even-multiplicity zeros touch without crossing.')],
    hints: ['Even multiplicity: touch and turn back.', 'Odd multiplicity: cross.', 'Which factor is squared?'], solution: 'x = 3: (x − 3)² doesn’t change sign, so the graph touches the line and turns back. At x = 1 and x = 5 (odd) it crosses.'
  },
  'f-cross': {
    type: 'multi', ideas: ['multiplicity'], prompt: 'At which zeros does M cross the reference line?',
    options: MULT.roots.map(([r, m]) => opt('r' + r, 'x = ' + r, m % 2 === 1, 'cross-touch', `x = ${r} has multiplicity ${m}: ${m % 2 ? 'odd, so it crosses' : 'even, so it touches and turns back'}.`)),
    hints: ['Odd multiplicity crosses.', 'Find the odd exponents.', '1 and 5.'], solution: 'Crosses at x = 1 and x = 5 (odd multiplicity); touches at x = 3.'
  },
  'f-build': {
    type: 'choice', ideas: ['zeros', 'factoring'], prompt: 'Zeros 0, 2, 6, 8 and scale a = 0.005. Which function is it?',
    options: [opt('a', '0.005x(x − 2)(x − 6)(x − 8)', true), opt('b', '0.005x(x + 2)(x + 6)(x + 8)', false, 'zero-factor', 'Those factors are zero at −2, −6, −8.'), opt('c', '0.005(x − 2)(x − 6)(x − 8)', false, 'lost-coef', 'The zero at x = 0 needs the factor x.'), opt('d', '(x − 0.005)(x − 2)(x − 6)(x − 8)', false, 'zero-factor', 'a scales the whole product; it isn’t a zero.')],
    hints: ['Each zero r gives a factor (x − r).', 'x = 0 gives the factor x.', 'Multiply by the scale a.'], solution: 'P(x) = 0.005 · x · (x − 2)(x − 6)(x − 8).'
  },
  'f-rzt': {
    type: 'choice', ideas: ['rational-zero'], prompt: `Rational Zero Theorem for ${text(CU)}: possible rational zeros are…`,
    options: [opt('a', '± the factors of 96 (constant −96 ÷ leading coefficient 1)', true), opt('b', '± the factors of 16', false, 'rzt-wrong', 'Use the constant term (−96), not the x² coefficient.'), opt('c', '± the factors of 76', false, 'rzt-wrong', 'p comes from the constant term: 96.'), opt('d', 'Only 2, 6 and 8', false, 'rzt-wrong', 'The theorem lists candidates; testing finds which are real zeros.')],
    hints: ['p/q: p divides the constant, q divides the leading coefficient.', 'Constant −96, leading 1.', '±1, ±2, ±3, … ±96.'], solution: '±(factors of 96) ÷ 1. In the track’s domain 0–8: 1, 2, 3, 4, 6, 8 are worth testing.'
  },
  'f-test4': {
    type: 'number', ideas: ['rational-zero', 'remainder'], answer: Number(evalAt(CU, 4)), tolerance: 0.001, label: 'Value at x = 4',
    prompt: `Test the candidate x = 4 in ${text(CU)}. What is the value?`,
    traps: [{ value: 0, code: 'remainder-wrong', message: 'Work it out: 64 − 256 + 304 − 96.' }, { value: 64 - 256 + 304 + 96, code: 'sign-distribute', message: 'The constant is −96.' }],
    hints: ['Substitute x = 4.', '4³ − 16·4² + 76·4 − 96.', '64 − 256 + 304 − 96.'], solution: `${evalAt(CU, 4)}: not zero, so 4 isn’t a zero.`
  },
  'f-rzt-zeros': {
    type: 'multi', ideas: ['rational-zero', 'zeros'], prompt: `Which of the candidates ${CAND.join(', ')} are zeros of ${text(CU)}?`,
    options: CAND.map(c => opt('c' + c, 'x = ' + c, evalAt(CU, c).zero, 'remainder-wrong', `Test it: ${text(CU)} at x = ${c} gives ${evalAt(CU, c)}, not 0.`)),
    hints: ['Substitute each candidate.', 'Use the zero tester.', 'A zero gives exactly 0.'], solution: `x = ${CAND.filter(c => evalAt(CU, c).zero).join(', ')}: with x = 0 from the factored-out x, all four zeros.`
  }
};
export function zeroPractice(n) {
  const z = pick(ZERO_PRACTICE, n), p = fromRoots(z.a, z.roots), roots = z.roots.map(r => r[0]).sort((a, b) => a - b);
  const cands = rationalCandidates(p).map(Number);
  return tidy({
    brief: `Hidden crossing ${n + 1}: f(x) = ${text(p)}. Test candidates in the zero tester.`, set: z, poly: p, candidates: cands,
    'fx-zeros': { type: 'fields', ideas: ['rational-zero', 'zeros'], prompt: `Find all three zeros of ${text(p)} (smallest first).`,
      fields: roots.map((r, i) => ({ id: 'z' + i, label: 'Zero ' + (i + 1), answer: r, tolerance: 0.001, traps: [{ value: -r, code: 'zero-factor', message: 'Check the sign: substitute it back.' }] })),
      hints: [`Candidates: ±p/q with p | ${Math.abs(Number(p[0]))} and q | ${Math.abs(Number(leading(p)))}.`, 'Test them: the remainder (value) must be 0.', 'Once you find one, synthetic division leaves a quadratic.'],
      solution: `${roots.join(', ')}. ${z.a !== 1 ? 'The leading coefficient 2 allows halves: 1/2 is a candidate, and a zero.' : ''}` },
    'fx-factored': { type: 'choice', ideas: ['factoring'], prompt: 'So the factored form is:',
      options: rot([opt('a', factoredText(z.a, z.roots), true), opt('b', factoredText(z.a, z.roots.map(([r, m]) => [-r, m])), false, 'zero-factor', 'A zero r gives (x − r).'), opt('c', factoredText(1, z.roots.slice(0, 2)), false, 'lost-coef', 'A cubic needs three factors.'), opt('d', factoredText(z.a === 1 ? 2 : 1, z.roots), false, 'leading-wrong', `The leading coefficient is ${z.a}.`)].filter((o, i, a) => a.findIndex(x => x.text === o.text) === i), n),
      hints: ['One factor per zero.', '(x − r) for each.', `Times the leading coefficient ${z.a}.`], solution: factoredText(z.a, z.roots) }
  });
}
export const ZERO_PRACTICE_IDS = ['fx-zeros', 'fx-factored'];

// ================================================================ Mission 4: The Polynomial Diagnostics Center
const SQ = synthetic(QQ, 2), WRONG = synthetic(QQ, -2), LD = longDivide(QQ, G1);
const M4 = {
  'd-synth': {
    type: 'fields', ideas: ['synthetic'], prompt: 'Synthetic division of Q(x) = x⁴ − 16x³ + 76x² − 96x by (x − 2): coefficients 1, −16, 76, −96, 0. Enter the bottom row.',
    fields: SQ.bottom.map((v, i) => ({ id: 'b' + i, label: i === SQ.bottom.length - 1 ? 'Remainder' : 'Entry ' + (i + 1), answer: Number(v), tolerance: 0.001, traps: [{ value: Number(WRONG.bottom[i]), code: 'synthetic-sign', message: 'For (x − 2) use k = +2: multiply by 2, then add.' }] })),
    hints: ['Bring down the 1.', 'Multiply by 2, add to the next coefficient: −16 + 2 = −14.', 'Keep going: −14 × 2 = −28; 76 − 28 = 48.'], solution: `Bottom row ${SQ.bottom.map(String).join(', ')}: quotient ${text(SQ.quotient)}, remainder ${SQ.remainder}.`
  },
  'd-quotient': {
    type: 'choice', ideas: ['synthetic'], prompt: 'Which is the quotient?',
    options: [opt('a', text(SQ.quotient), true), opt('b', 'x⁴ − 14x³ + 48x²', false, 'quotient-divisor', 'Dividing a degree-4 by a degree-1 leaves degree 3.'), opt('c', 'x³ − 14x² + 48', false, 'missing-zero', 'The last bottom entry before the remainder is 0: the quotient is x³ − 14x² + 48x + 0.'), opt('d', 'x − 2', false, 'quotient-divisor', 'That’s the divisor.')],
    hints: ['The bottom row (without the remainder) gives the quotient.', 'It starts one degree lower: x³.', '1, −14, 48, 0.'], solution: `${text(SQ.quotient)}, remainder 0, so (x − 2) is a factor.`
  },
  'd-factor-q': {
    type: 'choice', ideas: ['factoring'], prompt: `Factor the quotient ${text(SQ.quotient)}.`,
    options: [opt('a', 'x(x − 6)(x − 8)', true), opt('b', 'x(x + 6)(x + 8)', false, 'zero-factor', '−6 × −8 = 48 and −6 + −8 = −14, so (x − 6)(x − 8).'), opt('c', '(x − 6)(x − 8)', false, 'lost-coef', 'Take out the common x first.'), opt('d', 'x(x − 4)(x − 12)', false, 'binomial-mult', '4 + 12 = 16, not 14.')],
    hints: ['Take out the common factor x.', 'x(x² − 14x + 48).', 'Two numbers: multiply to 48, add to −14.'], solution: 'x(x − 6)(x − 8), so Q(x) = x(x − 2)(x − 6)(x − 8): all four zeros recovered.'
  },
  'd-q3': {
    type: 'number', ideas: ['remainder'], answer: Number(evalAt(QQ, 3)), tolerance: 0.001, label: 'Q(3)',
    prompt: 'Remainder Theorem: what is Q(3)? (That is the remainder of Q(x) ÷ (x − 3).)',
    traps: [{ value: -45, code: 'remainder-wrong', message: '81 − 432 + 684 − 288 = +45.' }, { value: 0, code: 'remainder-wrong', message: '3 isn’t a zero; work it out.' }],
    hints: ['Substitute x = 3.', '3⁴ − 16·3³ + 76·3² − 96·3.', '81 − 432 + 684 − 288.'], solution: 'Q(3) = 45, so dividing by (x − 3) leaves remainder 45.'
  },
  'd-r-meaning': {
    type: 'choice', ideas: ['factor-theorem', 'remainder'], prompt: 'The remainder is 45. Is (x − 3) a factor?',
    options: [opt('a', 'No: a factor needs remainder 0', true), opt('b', 'Yes: any divisor with a remainder is a factor', false, 'remainder-wrong', 'Factor Theorem: (x − k) is a factor only if the remainder f(k) = 0.'), opt('c', 'Yes, because 45 is a multiple of 3', false, 'remainder-wrong', 'The remainder must be exactly 0.'), opt('d', 'You can’t tell without long division', false, 'remainder-wrong', 'The Remainder Theorem tells you: Q(3) ≠ 0.')],
    hints: ['Factor Theorem: f(k) = 0 ⇔ (x − k) is a factor.', 'Q(3) = 45.', 'Is 45 = 0?'], solution: 'No. Q(3) = 45 ≠ 0, so (x − 3) isn’t a factor, and the profile is above the line at x = 3.'
  },
  'd-p3': {
    type: 'number', ideas: ['remainder', 'interpret'], answer: Number(evalAt(PP, 3)), tolerance: 1e-6, unit: 'm', label: 'P(3)',
    prompt: 'Q = 200P. How high is the actual profile at x = 3?',
    traps: [{ value: 45, code: 'scale-zeros', message: 'That’s Q(3). Divide by 200 for P.' }, { value: 45 * 200, code: 'scale-zeros', message: 'P = Q ÷ 200.' }],
    hints: ['P = Q ÷ 200.', 'Q(3) = 45.', '45 ÷ 200.'], solution: 'P(3) = 0.225 m above the reference line. Scaling changes the heights, not the zeros.'
  },
  'd-missing': {
    type: 'choice', ideas: ['synthetic'], prompt: 'To divide x³ − 7x + 6 synthetically, which coefficient row is right?',
    options: [opt('a', '1, 0, −7, 6', true), opt('b', '1, −7, 6', false, 'missing-zero', 'There’s no x² term: write its 0, or every later column shifts.'), opt('c', '0, 1, −7, 6', false, 'missing-zero', 'The zero goes in the x² place, after the x³ coefficient.'), opt('d', '1, 7, 6', false, 'missing-zero', 'Keep the sign: −7, and the missing x² as 0.')],
    hints: ['One column per power: x³, x², x, constant.', 'Is there an x² term?', 'Write 0 for it.'], solution: '1, 0, −7, 6: a missing power still needs its column.'
  },
  'd-long': {
    type: 'choice', ideas: ['long-division'], prompt: 'Long division: Q(x) ÷ (x² − 8x) = ?',
    options: [opt('a', `${text(LD.quotient)}, remainder 0`, true), opt('b', 'x² − 8x, remainder 12', false, 'quotient-divisor', 'x² − 8x is the divisor.'), opt('c', 'x² + 8x + 12, remainder 0', false, 'sign-distribute', 'Check the subtraction signs: −16x³ − (−8x³) = −8x³.'), opt('d', 'x² − 8x + 12, remainder 96x', false, 'remainder-wrong', 'It divides exactly: remainder 0.')],
    hints: ['Divide leading terms: x⁴ ÷ x² = x².', 'Multiply, subtract, bring down.', 'Repeat until the remainder’s degree is below 2.'], solution: `${text(LD.quotient)}, remainder 0: Q(x) = (x² − 8x)(x² − 8x + 12).`
  },
  'd-algorithm': {
    type: 'choice', ideas: ['long-division'], prompt: 'The division algorithm says f(x) = d(x)·q(x) + r(x). What must be true of r(x)?',
    options: [opt('a', 'Its degree is less than d’s (or it’s 0)', true), opt('b', 'It equals the divisor', false, 'quotient-divisor', 'r is what’s left over; it must be “smaller” than d.'), opt('c', 'Its degree equals q’s', false, 'remainder-wrong', 'You keep dividing until r’s degree is below d’s.'), opt('d', 'It must be a whole number', false, 'remainder-wrong', 'A remainder can be a polynomial, like 2x + 1, if it’s below the divisor’s degree.')],
    hints: ['When do you stop dividing?', 'When the leading term no longer divides.', 'That happens when deg r < deg d.'], solution: 'r is zero or has lower degree than d. For a linear divisor (x − k), r is a number: f(k).'
  }
};
export function dividePractice(n) {
  const d = pick(DIVIDE_PRACTICE, n), p = fromHigh(d.p), s = synthetic(p, d.k), L = longDivide(p, fromHigh([1, -d.k])), dv = d.k < 0 ? `x + ${-d.k}` : `x − ${d.k}`;
  const deg = degree(s.quotient);
  return tidy({
    brief: `Division ${n + 1}: (${text(p)}) ÷ (${dv}).`, set: d, poly: p, s, L, divisor: dv,
    'dx-quotient': { type: 'fields', ideas: ['synthetic', 'long-division'], prompt: `Divide (${text(p)}) by (${dv}). Enter the quotient’s coefficients.`,
      fields: coefFields(s.quotient, powLabels(deg), Object.fromEntries(high(s.quotient).map((c, i) => [i, [{ value: Number(synthetic(p, -d.k).bottom[i]), code: 'synthetic-sign', message: `Use k = ${d.k} for (${dv}).` }]]))),
      hints: [`Use k = ${d.k}.`, `Coefficients (keep zeros): ${high(p).map(String).join(', ')}.`, 'Bring down, multiply by k, add; repeat.'], solution: `Quotient ${text(s.quotient)}, remainder ${s.remainder}.` },
    'dx-remainder': { type: 'number', ideas: ['remainder', 'synthetic'], answer: Number(s.remainder), tolerance: 0.001, label: 'Remainder', prompt: 'And the remainder?',
      traps: [{ value: Number(synthetic(p, -d.k).remainder), code: 'synthetic-sign', message: `For (${dv}), k = ${d.k}.` }],
      hints: ['The last entry of the bottom row.', `Or the Remainder Theorem: f(${d.k}).`, 'Substitute and check.'], solution: `${s.remainder} = f(${d.k}).` },
    'dx-factor': { type: 'choice', ideas: ['factor-theorem'], prompt: `Is (${dv}) a factor?`, keepOrder: true,
      options: [opt('y', 'Yes: the remainder is 0', s.remainder.zero, 'remainder-wrong', 'The remainder isn’t 0, so it isn’t a factor.'), opt('n', 'No: the remainder isn’t 0', !s.remainder.zero, 'remainder-wrong', 'The remainder is 0, so it is a factor.'), opt('u', 'Only if the quotient factors too', false, 'remainder-wrong', 'The Factor Theorem only needs the remainder.')],
      hints: ['Factor Theorem.', 'Remainder 0 ⇔ factor.', 'Look at your remainder.'], solution: s.remainder.zero ? `Yes: (${text(p)}) = (${dv})(${text(s.quotient)}).` : `No: remainder ${s.remainder}.` }
  });
}
export const DIVIDE_PRACTICE_IDS = ['dx-quotient', 'dx-remainder', 'dx-factor'];

// ================================================================ Extension: complex zeros
const RC = mul(COMPLEX(), fromRoots(1, [[2], [6]]));
const EXT = {
  'c-real': { type: 'fields', ideas: ['zeros', 'complex'], prompt: `R(x) = (x² + 1)(x − 2)(x − 6) = ${text(RC)}. Where does its real graph cross the x-axis?`,
    fields: [2, 6].map((v, i) => ({ id: 'z' + i, label: 'Zero ' + (i + 1), answer: v, tolerance: 0.001 })),
    hints: ['Set each factor to zero.', 'x² + 1 = 0 has no real solution.', 'So only x − 2 and x − 6.'], solution: 'x = 2 and x = 6: the only real x-intercepts.' },
  'c-complex': { type: 'choice', ideas: ['complex'], prompt: 'What are the zeros of x² + 1?',
    options: [opt('a', 'x = i and x = −i', true), opt('b', 'x = 1 and x = −1', false, 'complex-real', '1² + 1 = 2, not 0.'), opt('c', 'There are none', false, 'complex-real', 'None that are real; two complex ones.'), opt('d', 'x = −1', false, 'complex-real', 'x² = −1, so x = ±√−1.')],
    hints: ['x² = −1.', '√−1 = i.', '±i.'], solution: 'x = ±i: complex conjugates. They’re algebraic results, not places on the track.' },
  'c-count': { type: 'number', ideas: ['complex'], answer: degree(RC), tolerance: 0.001, label: 'Zeros (with multiplicity)', prompt: 'How many zeros does R have, counting complex ones (and multiplicity)?',
    traps: [{ value: 2, code: 'complex-real', message: 'That’s the real ones. Count ±i too.' }], hints: ['Fundamental Theorem of Algebra.', 'Degree n: exactly n zeros (complex, with multiplicity).', 'What degree is R?'], solution: '4: 2, 6, i and −i. A degree-n polynomial has exactly n complex zeros.' },
  'c-pairs': { type: 'choice', ideas: ['complex'], prompt: 'For a polynomial with real coefficients, complex zeros…',
    options: [opt('a', 'come in conjugate pairs (a + bi and a − bi)', true), opt('b', 'always appear on the graph', false, 'complex-real', 'The real graph only shows real zeros.'), opt('c', 'never happen', false, 'complex-real', 'x² + 1 has two.'), opt('d', 'come in threes', false, 'complex-real', 'They pair up: i with −i.')],
    hints: ['Think of i and −i.', 'Real coefficients force symmetry.', 'Conjugates.'], solution: 'Conjugate pairs. So a real-coefficient polynomial’s non-real zeros always come two at a time.' }
};

// ================================================================ Final: The Final Track Analysis
export const FINAL_IDS = ['fa-degree', 'fa-lead', 'fa-turn', 'fa-end', 'fb-zeros', 'fb-cross', 'fc-expand', 'fc-const', 'fd-synth', 'fd-factor', 'fe-g', 'fe-f'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalSet(roundNo) {
  const S = pick(FINAL_SETS, roundNo - 1), roots = S.roots.map(r => [r, 1]), Fp = fromRoots(S.a, roots), k = Math.round(1 / S.a), G = scale(k, Fp);
  return { ...S, roots, Fp, k, G, syn: synthetic(G, S.roots[0]), g: Number(evalAt(G, S.test)), f: Number(evalAt(Fp, S.test)) };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), { Fp, G, syn, k } = F, ft = factoredText(F.a, F.roots), Gh = high(G);
  const qs = {
    set: F,
    'fa-degree': { type: 'number', ideas: ['degree'], answer: 3, tolerance: 0.001, label: 'Degree', prompt: `F(x) = ${ft} on 0 ≤ x ≤ 8. What is its degree?`,
      traps: [{ value: F.a, code: 'leading-wrong', message: 'That’s the leading coefficient.' }], hints: ['Count the x-factors.', 'Three linear factors multiply to x³.', 'Degree = highest power.'], solution: 'Degree 3.' },
    'fa-lead': { type: 'number', ideas: ['leading'], answer: F.a, tolerance: 1e-7, label: 'Leading coefficient', prompt: 'And its leading coefficient?',
      traps: [{ value: 1, code: 'leading-wrong', message: `The factors are multiplied by ${show(F.a)}.` }, { value: Number(Fp[0]), code: 'leading-wrong', message: 'That’s the constant term.' }], hints: ['The leading term comes from multiplying the x in each factor.', `${show(F.a)} · x · x · x.`, 'Its coefficient.'], solution: `${show(F.a)}: leading term ${show(F.a)}x³.` },
    'fa-turn': { type: 'number', ideas: ['turning'], answer: 2, tolerance: 0.001, label: 'Max turning points', prompt: 'Maximum number of turning points?',
      traps: [{ value: 3, code: 'turning-limit', message: 'At most n − 1.' }], hints: ['n − 1.', 'n = 3.', '3 − 1.'], solution: '2.' },
    'fa-end': { type: 'choice', ideas: ['end-behavior'], prompt: 'End behavior of the unrestricted polynomial?',
      options: [opt('a', 'Falls on the left, rises on the right', true), opt('b', 'Both ends rise', false, 'end-odd-even', 'Odd degree: the ends go opposite ways.'), opt('c', 'Rises on the left, falls on the right', false, 'end-sign', 'The leading coefficient is positive.'), opt('d', 'Both ends fall', false, 'end-odd-even', 'Odd degree with a positive coefficient: down on the left, up on the right.')],
      hints: ['Odd or even degree?', 'Odd: opposite ends.', 'Positive leading coefficient: rises on the right.'], solution: 'Odd degree, positive leading coefficient: falls on the left, rises on the right (the real track is only 0 ≤ x ≤ 8).' },
    'fb-zeros': { type: 'fields', ideas: ['zeros'], prompt: 'Where does the profile meet the reference elevation?',
      fields: F.roots.map(([r], i) => ({ id: 'z' + i, label: 'Zero ' + (i + 1), answer: r, tolerance: 0.001, traps: [{ value: -r, code: 'zero-factor', message: '(x − r) is zero at x = +r.' }] })),
      hints: ['Set each factor to zero.', '(x − r) = 0.', 'Smallest first.'], solution: F.roots.map(r => r[0]).join(', ') },
    'fb-cross': { type: 'choice', ideas: ['multiplicity', 'graphing'], prompt: 'At those zeros, does the graph cross or touch?',
      options: [opt('a', 'Crosses at all three (each has multiplicity 1)', true), opt('b', 'Touches at all three', false, 'cross-touch', 'Touching needs even multiplicity.'), opt('c', 'Crosses at the middle one only', false, 'cross-touch', 'Every zero has odd multiplicity 1.'), opt('d', 'Touches at the middle one only', false, 'simple-repeated', 'No factor is repeated.')],
      hints: ['Read the multiplicities.', 'Each factor appears once.', 'Odd → cross.'], solution: 'All simple zeros: it crosses at each.' },
    'fc-expand': { type: 'fields', ideas: ['expand', 'multiply'], prompt: `Expand the factors: ${factoredText(1, F.roots)} = x³ + bx² + cx + d. Enter b, c and d.`,
      fields: Gh.slice(1).map((c, i) => ({ id: 'c' + i, label: ['b (x²)', 'c (x)', 'd (constant)'][i], answer: Number(c), tolerance: 0.001, traps: [{ value: -Number(c), code: 'sign-distribute', message: 'Check the signs.' }] })),
      hints: ['Multiply two factors first.', `(x − ${F.roots[0][0]})(x − ${F.roots[1][0]}) = ${text(fromRoots(1, F.roots.slice(0, 2)))}.`, `Then times (x − ${F.roots[2][0]}).`], solution: text(G) },
    'fc-const': { type: 'number', ideas: ['expand'], answer: Number(Fp[0]), tolerance: 1e-7, label: 'Constant term of F', prompt: `So F(x) = ${show(F.a)} × that. What is F’s constant term?`,
      traps: [{ value: Number(G[0]), code: 'lost-coef', message: `Multiply by ${show(F.a)}.` }], hints: [`The cubic’s constant is ${G[0]}.`, `Times ${show(F.a)}.`, 'Keep the sign.'], solution: `${show(Fp[0])}. In full: F(x) = ${text(Fp)}.` },
    'fd-synth': { type: 'fields', ideas: ['synthetic', 'factor-theorem'], prompt: `G(x) = ${k}F(x) = ${text(G)}. Divide synthetically by (x − ${F.roots[0][0]}): enter the bottom row.`,
      fields: syn.bottom.map((v, i) => ({ id: 'b' + i, label: i === syn.bottom.length - 1 ? 'Remainder' : 'Entry ' + (i + 1), answer: Number(v), tolerance: 0.001, traps: [{ value: Number(synthetic(G, -F.roots[0][0]).bottom[i]), code: 'synthetic-sign', message: `Use k = +${F.roots[0][0]}.` }] })),
      hints: [`Coefficients: ${Gh.map(String).join(', ')}.`, `k = ${F.roots[0][0]}: bring down, multiply, add.`, 'The last entry is the remainder.'], solution: `${syn.bottom.map(String).join(', ')}: quotient ${text(syn.quotient)}, remainder 0, so (x − ${F.roots[0][0]}) is a factor.` },
    'fd-factor': { type: 'choice', ideas: ['factoring'], prompt: `Factor the quotient ${text(syn.quotient)}.`,
      options: [opt('a', factoredText(1, F.roots.slice(1)), true), opt('b', factoredText(1, F.roots.slice(1).map(([r]) => [-r, 1])), false, 'zero-factor', 'Check the signs against the zeros.'), opt('c', factoredText(1, [[F.roots[1][0] - 1, 1], [F.roots[2][0] + 1, 1]]), false, 'binomial-mult', 'Expand it: the middle term doesn’t match.'), opt('d', factoredText(1, F.roots.slice(0, 2)), false, 'quotient-divisor', 'The first zero was divided out already.')],
      hints: ['Two numbers multiply to the constant and add to the x-coefficient.', 'They’re the remaining zeros.', 'Write (x − r) for each.'], solution: `${factoredText(1, F.roots.slice(1))}: all three factors reconstructed.` },
    'fe-g': { type: 'number', ideas: ['remainder'], answer: F.g, tolerance: 0.001, label: `G(${F.test})`, prompt: `Remainder Theorem: what is G(${F.test})?`,
      traps: [{ value: 0, code: 'remainder-wrong', message: `${F.test} isn’t a zero; evaluate.` }, { value: -F.g, code: 'sign-distribute', message: 'Check the signs.' }], hints: [`Substitute x = ${F.test}.`, `${Gh.map((c, i) => `${c}·${F.test}${['³', '²', '', ''][i]}`).join(' + ')}.`, 'Add up.'], solution: `G(${F.test}) = ${F.g}.` },
    'fe-f': { type: 'number', ideas: ['remainder', 'interpret'], answer: F.f, tolerance: 1e-7, unit: 'm', label: `F(${F.test})`, prompt: `So how high is the profile at x = ${F.test}?`,
      traps: [{ value: F.g, code: 'scale-zeros', message: `That’s G. Divide by ${k}.` }], hints: [`F = G ÷ ${k}.`, `${F.g} ÷ ${k}.`, 'Keep the sign: negative is below the line.'], solution: `F(${F.test}) = ${show(F.f)} m: ${F.f > 0 ? 'above' : 'below'} the reference line.` }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...M4, ...EXT }));
export const MISSIONS = [
  { id: 'decoder', n: 1, title: 'The flow line decoder', short: 'Flow Line Decoder', minutes: '5–6', focus: 'Degree · leading coefficient · end behavior · turning points',
    blurb: 'Read a pump track’s polynomial: what do the degree and leading term say about its shape?', graded: Object.keys(M1) },
  { id: 'shape', n: 2, title: 'Shape the trail', short: 'Shape the Trail', minutes: '5–6', focus: 'Adding, subtracting and multiplying polynomials',
    blurb: 'Combine profiles, then expand the factored equation to see its full structure.', graded: Object.keys(M2) },
  { id: 'features', n: 3, title: 'Find the hidden features', short: 'Hidden Features', minutes: '6–7', focus: 'Zeros · multiplicity · building from zeros · Rational Zero Theorem',
    blurb: 'Where does the profile cross the line, and does it cross or bounce?', graded: Object.keys(M3) },
  { id: 'diagnostics', n: 4, title: 'The polynomial diagnostics center', short: 'Diagnostics Center', minutes: '5–6', focus: 'Synthetic and long division · Remainder and Factor Theorems',
    blurb: 'Divide out a known factor and uncover the rest of the structure.', graded: Object.keys(M4) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (let n = 0; n < ZERO_PRACTICE.length; n++) { const P_ = zeroPractice(n); for (const id of ZERO_PRACTICE_IDS) out[id] = [...new Set([...(out[id] || []), ...P_[id].ideas])]; }
  for (let n = 0; n < DIVIDE_PRACTICE.length; n++) { const P_ = dividePractice(n); for (const id of DIVIDE_PRACTICE_IDS) out[id] = [...new Set([...(out[id] || []), ...P_[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
export { text, show };
