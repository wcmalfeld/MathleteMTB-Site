// Project Evolve: every graded question. Answers come from the kit's engines
// (powers.js for exponent rules, scinot.js for scientific notation, frac.js)
// and logic/product.js, never typed in by hand. Three progressive hints each,
// a worked solution, and traps (anticipated wrong answers with a
// misconception code). Targets are estimated from tables, never with logs.

import { Frac } from '../../lesson-kit/frac.js';
import { mono, monoText, fpow, sup } from '../../lesson-kit/powers.js';
import { normalize, sciText, plainText } from '../../lesson-kit/scinot.js';
import { F, N, L, V, Lv, WAIT, BIKE, TEST, readings, model, factorOf, firstPast, num, money } from './product.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
const H = (a, b, c) => [a, b, c];
const val = x => Number(F(x));
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object') continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e9); if (seen.has(k) || Math.abs(t.value - f.answer) < 1e-12 || !isFinite(t.value)) return false; seen.add(k); return true; });
    }
    if (q.type === 'monomial') q.traps = (q.traps || []).filter(t => { try { return monoText(t.expr) !== monoText(q.answer); } catch (e) { return false; } });
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
const numQ = (answer, o) => ({ type: 'number', tolerance: o.tolerance || 1e-9, ...o, answer: val(answer), traps: (o.traps || []).map(t => ({ ...t, value: val(t.value) })) });
const choice = (prompt, right, wrongs, o = {}) => ({ type: 'choice', ideas: o.ideas, level: o.level || 'intermediate', prompt, fig: o.fig, keepOrder: o.keepOrder, inline: o.inline,
  options: [opt('a', right, true), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))], hints: o.hints, solution: o.solution || right + '.' });
const exprQ = (label, answer, vars, o) => ({ type: 'expression', label, answer, vars, ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt, traps: o.traps || [], tiles: o.tiles, hints: o.hints, solution: o.solution });
const sciQ = (answer, o) => ({ type: 'sci', answer: typeof answer === 'string' ? answer : plainText(answer, false), form: o.form || 'sci', unit: o.unit, label: o.label, ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt, traps: o.traps || [], hints: o.hints, solution: o.solution });
const S = x => sciText(F(x));                  // 2.016 × 10⁷
const P = x => plainText(F(x));                // 20,160,000

// ---------- exponent-rule question builders (answers and traps from powers.js)
const pw = (v, e) => (e === 1 ? v : `${v}^${e}`);
function mq(expr, o) {
  const m = mono(expr), ans = monoText(m);   // the kit reads superscripts, so the answer is stored as shown: 8x³, 1/x⁶
  return { type: 'monomial', label: o.label || 'Simplified', answer: ans, vars: o.vars, positive: o.positive !== false, ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt, traps: o.traps || [], tiles: o.tiles, hints: o.hints, solution: o.solution || `${o.shown || expr} = ${monoText(m)}.` };
}
const TXT = s => s.replace(/\^\(?(-?\d+)\)?/g, (_, e) => sup(e)).replace(/\*/g, ' × ');
const product = (v, m, n, o = {}) => mq(`${v}^${m}*${v}^${n}`, { ideas: ['product'], vars: [v], level: o.level, shown: TXT(`${v}^${m} * ${v}^${n}`), prompt: o.prompt || `Simplify ${TXT(`${v}^${m}*${v}^${n}`)}.`,
  traps: [{ expr: pw(v, m * n), code: 'multiply-exponents', message: 'Multiplying powers with the same base adds the exponents: count all the factors.' }, { expr: `${m + n}${v}`, code: 'times-exponent', message: `${v}${sup(m + n)} means ${m + n} factors of ${v} multiplied, not ${m + n} × ${v}.` }],
  hints: H(`Write out the factors: ${v}${sup(m)} is ${m} ${v}’s, ${v}${sup(n)} is ${n} more.`, 'Same base, so combine all the factors.', `a${sup('m')} × a${sup('n')} = a${sup('m')}⁺${sup('n')}: add ${m} + ${n}.`), solution: `${TXT(`${v}^${m} * ${v}^${n}`)} = ${v}${sup(m + n)}: ${m} factors plus ${n} factors.` });
const quotient = (v, m, n, o = {}) => mq(`${v}^${m}/${v}^${n}`, { ideas: ['quotient'], vars: [v], level: o.level, prompt: o.prompt || `Simplify ${v}${sup(m)} / ${v}${sup(n)} (${v} ≠ 0).`,
  traps: [...(m % n === 0 && m / n !== m - n ? [{ expr: pw(v, m / n), code: 'divide-exponents', message: 'Dividing powers with the same base subtracts the exponents: cancel the common factors.' }] : []), { expr: pw(v, m + n), code: 'divide-exponents', message: 'For division, subtract the exponents.' }],
  hints: H(`Write ${m} factors on top and ${n} underneath.`, `Each pair of ${v}’s cancels: ${n} pairs.`, `a${sup('m')} / a${sup('n')} = a${sup('m')}⁻${sup('n')}: ${m} − ${n}.`), solution: `${n} factors cancel, leaving ${v}${sup(m - n)}.` });
const powpow = (v, m, n, o = {}) => mq(`(${v}^${m})^${n}`, { ideas: ['power-power'], vars: [v], level: o.level, prompt: o.prompt || `Simplify (${v}${sup(m)})${sup(n)}.`,
  traps: [{ expr: pw(v, m + n), code: 'add-in-power', message: `(${v}${sup(m)})${sup(n)} is ${n} copies of ${v}${sup(m)} multiplied: multiply the exponents.` }],
  hints: H(`Write it out: ${Array(n).fill(v + sup(m)).join(' × ')}.`, `That’s ${n} groups of ${m} factors.`, `(a${sup('m')})${sup('n')} = a${sup('m')}ⁿ: ${m} × ${n}.`), solution: `${n} groups of ${m}: ${v}${sup(m * n)}.` });
const powprod = (k, v, n, o = {}) => mq(`(${k}${v})^${n}`, { ideas: ['power-product'], vars: [v], level: o.level, prompt: o.prompt || `Simplify (${k}${v})${sup(n)}.`,
  traps: [{ expr: `${k}${v}^${n}`, code: 'outside-only', message: `The exponent applies to every factor inside the brackets: ${k}${sup(n)} as well as ${v}${sup(n)}.` }, { expr: `${k * n}${v}^${n}`, code: 'times-exponent', message: `${k}${sup(n)} means ${Array(n).fill(k).join(' × ')}, not ${k} × ${n}.` }],
  hints: H(`Write it out: ${Array(n).fill(`(${k}${v})`).join('')}.`, `Group the numbers and the ${v}’s.`, `(ab)${sup('n')} = a${sup('n')}b${sup('n')}: ${k}${sup(n)} = ${k ** n}.`), solution: `${Array(n).fill(k).join(' × ')} = ${k ** n} and ${v}${sup(n)}: ${k ** n}${v}${sup(n)}.` });

export const IDEAS = {
  repeated: 'Exponents as repeated multiplication', product: 'The product rule', quotient: 'The quotient rule', 'power-power': 'Power of a power', 'power-product': 'Power of a product', zero: 'Zero exponents', negative: 'Negative exponents',
  'to-sci': 'Writing numbers in scientific notation', 'to-standard': 'Writing scientific notation as standard numbers', 'sci-multiply': 'Multiplying in scientific notation', 'sci-divide': 'Dividing in scientific notation', compare: 'Comparing large and small quantities', units: 'Keeping units',
  'growth-identify': 'Recognizing exponential growth', 'growth-factor': 'Initial values and growth factors', 'growth-model': 'Writing growth models', 'growth-evaluate': 'Evaluating growth models', 'lin-vs-exp': 'Linear vs exponential growth',
  'decay-identify': 'Recognizing exponential decay', 'decay-factor': 'Decay rates and retention factors', 'decay-model': 'Writing decay models', 'decay-evaluate': 'Evaluating decay models', target: 'Estimating when a target is reached', 'decay-compare': 'Linear vs exponential decay', limits: 'A model’s limitations'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'rules', name: 'Exponent Rules', ideas: ['repeated', 'product', 'quotient', 'power-power', 'power-product', 'zero', 'negative'] },
  { id: 'sci', name: 'Scientific Notation', ideas: ['to-sci', 'to-standard', 'sci-multiply', 'sci-divide', 'compare', 'units'] },
  { id: 'growth', name: 'Exponential Growth', ideas: ['growth-identify', 'growth-factor', 'growth-model', 'growth-evaluate', 'lin-vs-exp'] },
  { id: 'decay', name: 'Exponential Decay', ideas: ['decay-identify', 'decay-factor', 'decay-model', 'decay-evaluate', 'target', 'decay-compare', 'limits'] }
];
export const MISCONCEPTIONS = {
  'different-bases': 'Adding exponents with different bases',
  'multiply-exponents': 'Multiplying exponents in the product rule',
  'divide-exponents': 'Dividing (or adding) exponents in the quotient rule',
  'add-in-power': 'Adding exponents for a power of a power',
  'outside-only': 'Applying a power to only part of the brackets',
  'times-exponent': 'Multiplying the base by the exponent',
  'base-exponent-swap': 'Swapping the base and the exponent',
  'add-coefficients': 'Adding coefficients when multiplying terms',
  'negative-value': 'Reading a negative exponent as a negative value',
  'zero-zero': 'Treating zero to the zero power as one',
  'zero-is-zero': 'Thinking a zero exponent gives zero',
  'zero-coef': 'Applying an exponent to a coefficient it doesn’t touch',
  'denominator-zero': 'Forgetting that a base in a denominator can’t be zero',
  'exp-sign': 'Using the wrong exponent sign (moving the decimal the wrong way)',
  'decimal-count': 'Counting the decimal places wrongly',
  'not-normalized': 'Leaving the coefficient outside normalized notation',
  'exp-arith': 'Adding or subtracting exponents incorrectly',
  'coef-only': 'Comparing only the coefficients',
  'lost-units': 'Losing the units',
  'missing-conversion': 'Missing a unit conversion',
  'add-percent': 'Adding the percentage as a fixed amount each time',
  'initial-factor-swap': 'Confusing the initial value with the growth factor',
  'rate-as-factor': 'Using the rate (0.20) instead of the factor (1.20) as the multiplier',
  'linear-exponential': 'Confusing linear and exponential change',
  indivisible: 'Reporting a fraction of a person or a bike',
  'subtract-constant': 'Subtracting a fixed amount instead of a repeated percentage',
  'rate-retention-swap': 'Confusing the depreciation rate with the retention factor',
  'decay-multiplier': 'Using the wrong decay multiplier',
  'guaranteed-value': 'Treating a modeled estimate as a guaranteed price',
  'exact-crossing': 'Treating an estimated crossing as an exact answer',
  exponent: 'Right coefficient, wrong exponent',
  coefficient: 'Right exponent, wrong coefficient',
  arithmetic: 'An arithmetic slip',
  sign: 'A sign error'
};

// ================================================================ Stage 01: Prototype Design Lab (exponent rules)
const M1 = {
  'pr-cube': numQ(8, { ideas: ['repeated'], level: 'beginner', label: 'Unit cubes', prompt: 'The calibration block is a cube with edges 2 units long. How many unit cubes make it up?', traps: [{ value: 6, code: 'times-exponent', message: '2³ is 2 × 2 × 2, not 2 × 3.' }, { value: 9, code: 'base-exponent-swap', message: 'That’s 3², not 2³: the edge length 2 is the base.' }, { value: 4, code: 'times-exponent', message: 'That’s one layer (2 × 2). There are 2 layers.' }],
    hints: H('Count one layer first.', 'One layer is 2 × 2 = 4 cubes.', 'There are 2 layers: 2 × 2 × 2.'), solution: '2 × 2 × 2 = 2³ = 8 unit cubes.' }),
  'pr-base': choice('In 2³ = 8, which number is the base?', '2: the number multiplied by itself', [['3: the small raised number', 'base-exponent-swap', '3 is the exponent: how many 2’s are multiplied.'], ['8: the result', 'base-exponent-swap', '8 is the value of the power.']], { ideas: ['repeated'], level: 'beginner', hints: H('The base is the number being multiplied.', 'The exponent counts how many times.', 'Which one repeats in 2 × 2 × 2?') }),
  'pr-x3': choice('What does x³ mean?', 'x × x × x', [['3x', 'times-exponent', '3x is x + x + x. x³ multiplies three x’s.'], ['x + 3', 'times-exponent', 'The exponent tells you how many factors, not what to add.'], ['3 × 3 × 3', 'base-exponent-swap', 'x is the base: it’s x that repeats.']], { ideas: ['repeated'], level: 'beginner', hints: H('The exponent counts the factors.', 'The base is x.', 'Three factors of x.') }),
  'pr-53': numQ(125, { ideas: ['repeated'], level: 'beginner', label: '5³', prompt: 'A scaled model uses 5³. Evaluate it.', traps: [{ value: 15, code: 'times-exponent', message: '5³ is 5 × 5 × 5, not 5 × 3.' }, { value: 243, code: 'base-exponent-swap', message: 'That’s 3⁵.' }], hints: H('Three factors of 5.', '5 × 5 = 25.', '25 × 5.'), solution: '5 × 5 × 5 = 125.' }),
  'pp-1': product('x', 2, 3, { level: 'beginner' }),
  'pp-2': product('a', 4, 2),
  'pp-3': product('y', 3, 5),
  'pp-4': product('m', 2, 4),
  'pp-diff': choice('A CAD panel shows x² × y³. Can the exponents be combined?', 'No: the bases are different, so it stays x²y³', [['Yes: x⁵y', 'different-bases', 'Only the same base combines: x’s with x’s.'], ['Yes: (xy)⁵', 'different-bases', '(xy)⁵ would be x⁵y⁵.'], ['Yes: x⁶y⁶', 'different-bases', 'Nothing combines across different bases.']], { ideas: ['product'], level: 'intermediate', hints: H('What does the product rule need?', 'The same base.', 'x and y are different.') }),
  'pp-coef': mq('(3x^2)*(4x^5)', { ideas: ['product'], vars: ['x'], level: 'advanced', prompt: 'Simplify (3x²)(4x⁵).', traps: [{ expr: '7x^7', code: 'add-coefficients', message: 'Multiply the numbers: 3 × 4 = 12.' }, { expr: '12x^10', code: 'multiply-exponents', message: 'Add the exponents: 2 + 5.' }], hints: H('Multiply the numbers.', 'Then use the product rule on the x’s.', '3 × 4 and 2 + 5.'), solution: '3 × 4 = 12 and x² × x⁵ = x⁷: 12x⁷.' }),
  'pq-cancel': numQ(2, { ideas: ['quotient'], level: 'beginner', label: 'Pairs', prompt: 'In x⁵ / x², how many pairs of x’s cancel?', traps: [{ value: 5, code: 'divide-exponents', message: 'Only as many as the bottom has: 2.' }], hints: H('Write 5 x’s on top, 2 below.', 'Each x below cancels one above.', '2 pairs.'), solution: '2 pairs cancel, leaving x³.' }),
  'pq-1': quotient('x', 6, 2, { level: 'beginner' }),
  'pq-2': quotient('a', 7, 3),
  'pq-3': quotient('y', 5, 2),
  'pq-4': quotient('m', 8, 4),
  'ppw-1': powpow('x', 2, 3, { level: 'beginner' }),
  'ppw-2': powpow('a', 3, 2),
  'ppw-3': powpow('y', 2, 4),
  'ppr-1': powprod(2, 'x', 3, { level: 'beginner' }),
  'ppr-2': powprod(2, 'x', 2),
  'ppr-3': powprod(3, 'a', 2),
  'ppr-4': powprod(2, 'y', 3),
  'z-1': numQ(1, { ideas: ['zero'], level: 'beginner', label: '5⁰', prompt: 'Evaluate 5⁰.', traps: [{ value: 0, code: 'zero-is-zero', message: 'A nonzero number to the power 0 is 1, not 0.' }, { value: 5, code: 'zero-is-zero', message: 'The power 0 means no factors of 5 at all: the result is 1.' }], hints: H('Look at the pattern 5³, 5², 5¹…', 'Each step divides by 5: 125, 25, 5…', '5 ÷ 5 = 1.'), solution: '5⁰ = 1 (for any nonzero base).' }),
  'z-2': { type: 'fields', ideas: ['zero'], level: 'beginner', prompt: 'Evaluate each.', fields: [{ id: 'a', label: '10⁰', answer: 1, traps: [{ value: 0, code: 'zero-is-zero', message: 'It’s 1.' }, { value: 10, code: 'zero-is-zero', message: 'It’s 1.' }] }, { id: 'b', label: '(3a)⁰, a ≠ 0', answer: 1, traps: [{ value: 3, code: 'zero-coef', message: 'The brackets put the whole 3a to the power 0: it’s 1.' }, { value: 0, code: 'zero-is-zero', message: 'It’s 1.' }] }],
    hints: H('Any nonzero base to the power 0 is 1.', 'The brackets make 3a the base.', 'Both are 1.'), solution: '10⁰ = 1 and (3a)⁰ = 1 (3a is nonzero).' },
  'z-3x': numQ(3, { ideas: ['zero'], level: 'intermediate', label: '3x⁰', prompt: 'Now there are no brackets: evaluate 3x⁰ for x = 7.', traps: [{ value: 1, code: 'zero-coef', message: 'Without brackets, the exponent touches only x: 3 × 1.' }, { value: 0, code: 'zero-is-zero', message: 'x⁰ = 1, so 3 × 1.' }], hints: H('Which base has the exponent 0?', 'Only x: x⁰ = 1.', '3 × 1.'), solution: '3x⁰ = 3 × 1 = 3.' }),
  'z-00': choice('Which statement about zero exponents is right?', 'a⁰ = 1 for every a except 0; 0⁰ isn’t defined here', [['0⁰ = 1, like every other base', 'zero-zero', 'The rule needs a nonzero base: 0⁰ isn’t treated as an ordinary exponent-rule example.'], ['a⁰ = 0 for every a', 'zero-is-zero', 'A nonzero base to the power 0 is 1.'], ['a⁰ = a', 'zero-is-zero', 'That’s a¹.']], { ideas: ['zero'], level: 'intermediate', hints: H('Where does a⁰ = 1 come from?', 'aⁿ ÷ aⁿ = 1, which needs a ≠ 0.', 'So zero is excluded.') }),
  'n-1': mq('x^(-2)', { ideas: ['negative'], vars: ['x'], level: 'beginner', label: 'With positive exponents', prompt: 'Rewrite x⁻² with a positive exponent (x ≠ 0).', traps: [{ expr: '-x^2', code: 'negative-value', message: 'A negative exponent means a reciprocal, not a negative value: x⁻² = 1/x².' }], hints: H('Negative exponent: reciprocal.', 'Move the power to the denominator.', 'x⁻² = 1/x².'), solution: 'x⁻² = 1/x².' }),
  'n-2': mq('x^(-3)', { ideas: ['negative'], vars: ['x'], level: 'beginner', label: 'With positive exponents', prompt: 'Rewrite x⁻³ with a positive exponent.', traps: [{ expr: '-x^3', code: 'negative-value', message: 'It’s a reciprocal: 1/x³.' }], hints: H('Reciprocal.', 'Denominator.', '1/x³.'), solution: 'x⁻³ = 1/x³.' }),
  'n-3': numQ('0.01', { ideas: ['negative'], level: 'beginner', label: '10⁻²', prompt: 'Evaluate 10⁻² as a decimal.', traps: [{ value: -100, code: 'negative-value', message: 'A negative exponent isn’t a negative number: 10⁻² = 1/10² = 0.01.' }, { value: -20, code: 'times-exponent', message: 'It’s 1/(10 × 10).' }, { value: 100, code: 'negative-value', message: 'That’s 10². Take the reciprocal.' }], hints: H('10⁻² = 1/10².', '10² = 100.', '1/100.'), solution: '10⁻² = 1/100 = 0.01.' }),
  'n-4': numQ('0.0001', { ideas: ['negative'], level: 'intermediate', label: '10⁻⁴', prompt: 'Evaluate 10⁻⁴.', traps: [{ value: -10000, code: 'negative-value', message: 'Reciprocal, not negative: 1/10,000.' }, { value: '0.001', code: 'decimal-count', message: '0.001 is 10⁻³. Four places.' }], hints: H('1/10⁴.', '10⁴ = 10,000.', 'Four decimal places.'), solution: '10⁻⁴ = 1/10,000 = 0.0001.' }),
  'n-5': numQ(new Frac(1, 25), { ideas: ['negative'], level: 'intermediate', label: '5⁻²', prompt: 'Evaluate 5⁻² (a fraction or a decimal).', traps: [{ value: -25, code: 'negative-value', message: '5⁻² = 1/5² = 1/25.' }, { value: -10, code: 'times-exponent', message: 'It’s 1/(5 × 5).' }], hints: H('Reciprocal of 5².', '5² = 25.', '1/25 = 0.04.'), solution: '5⁻² = 1/25 = 0.04.' }),
  'n-6': mq('(x^(-2))^3', { ideas: ['negative', 'power-power'], vars: ['x'], level: 'advanced', label: 'With positive exponents', prompt: 'Simplify (x⁻²)³ with a positive exponent.', traps: [{ expr: 'x^(-5)', code: 'add-in-power', message: 'Power of a power: multiply −2 × 3.' }, { expr: 'x^6', code: 'negative-value', message: '−2 × 3 = −6, so it’s a reciprocal: 1/x⁶.' }, { expr: '-x^6', code: 'negative-value', message: 'x⁻⁶ is 1/x⁶, not −x⁶.' }], hints: H('Power of a power: multiply the exponents.', '−2 × 3 = −6.', 'x⁻⁶ = 1/x⁶.'), solution: '(x⁻²)³ = x⁻⁶ = 1/x⁶.' }),
  'n-den': choice('x⁻² = 1/x². For which values of x is that true?', 'Every x except 0: 1/0² is undefined', [['Every x, including 0', 'denominator-zero', 'x = 0 would mean dividing by zero.'], ['Only positive x', 'negative-value', 'Negative x is fine: (−2)⁻² = 1/4.']], { ideas: ['negative'], level: 'intermediate', hints: H('What goes in the denominator?', 'x².', 'Which x makes x² = 0?') }),
  'ch-law-1': choice('Which law turns (x²)³ into x⁶?', 'Power of a power: multiply the exponents', [['Product rule: add the exponents', 'add-in-power', 'Adding would give x⁵.'], ['Power of a product', 'outside-only', 'There’s only one factor inside the brackets.'], ['Quotient rule', 'divide-exponents', 'Nothing is divided.']], { ideas: ['power-power'], level: 'intermediate', hints: H('Brackets with an exponent outside.', 'One power raised to another.', 'Multiply.') }),
  'ch-law-2': choice('Which law gives (3a)² = 9a²?', 'Power of a product: the exponent applies to every factor', [['Product rule', 'multiply-exponents', 'There’s one power, applied to a product.'], ['Power of a power', 'add-in-power', 'There’s no power inside.'], ['Zero exponent', 'zero-is-zero', 'No zero here.']], { ideas: ['power-product'], level: 'intermediate', hints: H('What’s inside the brackets?', 'A product: 3 × a.', 'Both factors get the exponent.') }),
  'ch-law-3': choice('Which law gives x⁶ / x² = x⁴?', 'Quotient rule: subtract the exponents', [['Divide the exponents: 6 ÷ 2', 'divide-exponents', 'That would give x³.'], ['Product rule', 'multiply-exponents', 'It’s a division.'], ['Negative exponents', 'negative-value', 'No negative exponent appears.']], { ideas: ['quotient'], level: 'intermediate', hints: H('Same base, divided.', 'Cancel common factors.', '6 − 2.') }),
  'ch-103': numQ('0.001', { ideas: ['negative'], level: 'intermediate', label: '10⁻³', prompt: 'Evaluate 10⁻³.', traps: [{ value: -1000, code: 'negative-value', message: 'Reciprocal: 1/1000.' }], hints: H('1/10³.', '10³ = 1000.', '0.001.'), solution: '10⁻³ = 0.001.' }),
  'ch-70': numQ(1, { ideas: ['zero'], level: 'beginner', label: '7⁰', prompt: 'Evaluate 7⁰.', traps: [{ value: 0, code: 'zero-is-zero', message: 'Nonzero base to the 0: 1.' }, { value: 7, code: 'zero-is-zero', message: 'It’s 1.' }], hints: H('Zero exponent.', 'Nonzero base.', '1.'), solution: '7⁰ = 1.' })
};
export const RULE_PRACTICE = [['x', 3, 4, 2, 5, 'b', 6, 2], ['a', 5, 2, 3, 3, 'y', 9, 4], ['m', 2, 6, 4, 2, 't', 7, 1], ['y', 4, 4, 2, 3, 'n', 10, 3], ['b', 6, 3, 3, 4, 'x', 8, 5], ['k', 7, 1, 5, 2, 'a', 12, 7]];
export const RULE_PRACTICE_IDS = ['prx-prod', 'prx-power', 'prx-neg'];
export function rulePractice(n) {
  const [v, m, k, c, e, w, p, q] = pick(RULE_PRACTICE, n);
  return tidy({ brief: `CAD panel ${n + 1}: three new expressions to simplify.`,
    'prx-prod': n % 2 ? quotient(v, m + k, k, { level: 'advanced' }) : product(v, m, k, { level: 'advanced' }),
    'prx-power': n % 2 ? powpow(w, c, e, { level: 'advanced' }) : powprod(c, w, e, { level: 'advanced' }),
    'prx-neg': mq(`${v}^${q}/${v}^${p}`, { ideas: ['negative', 'quotient'], vars: [v], level: 'advanced', label: 'With positive exponents', prompt: `Simplify ${v}${sup(q)} / ${v}${sup(p)} and write it with a positive exponent.`, traps: [{ expr: `-${v}^${p - q}`, code: 'negative-value', message: `${q} − ${p} is negative, which means a reciprocal, not a negative value.` }, { expr: `${v}^${p - q}`, code: 'divide-exponents', message: 'Top minus bottom: the exponent is negative, so the power goes underneath.' }],
      hints: H('Quotient rule: subtract top − bottom.', `${q} − ${p} = ${q - p}.`, 'A negative exponent means the reciprocal.'), solution: `${v}${sup(q - p)} = 1/${v}${sup(p - q)}.` }) });
}

// ================================================================ Stage 02: Engineering Test Lab (scientific notation)
const R = readings();
const M2 = {
  'tl-count': numQ(R, { ideas: ['to-sci', 'units'], level: 'beginner', label: 'Readings', prompt: 'The rig runs for 28 hours at 200 sensor readings per second (60 seconds a minute, 60 minutes an hour). How many readings? Work out 200 × 28 × 60 × 60.', traps: [{ value: 200 * 28 * 60, code: 'missing-conversion', message: 'That’s readings per minute × hours: there are 60 × 60 seconds in an hour.' }, { value: 200 * 28, code: 'missing-conversion', message: 'Convert hours to seconds: × 60 × 60.' }],
    hints: H('Seconds in the test: 28 × 60 × 60.', 'That’s 100,800 seconds.', '200 readings each second.'), solution: '200 × 28 × 3,600 = 20,160,000 readings.' }),
  'tl-sci': sciQ(R, { ideas: ['to-sci'], level: 'beginner', label: 'Readings', prompt: 'Write 20,160,000 in scientific notation.', hints: H('Put the decimal after the first nonzero digit: 2.016.', 'Count how many places it moved.', '7 places to the left: × 10⁷.'), solution: `20,160,000 = ${S(R)}: the decimal moves 7 places left.` }),
  'tl-why': choice('Why does the test team record the dataset as 2.016 × 10⁷?', 'The power of ten shows the size at a glance, without counting zeros', [['It’s more accurate than 20,160,000', 'not-normalized', 'It’s the same number, just easier to read.'], ['It rounds the readings off', 'decimal-count', 'Nothing is rounded: 2.016 × 10⁷ is exactly 20,160,000.']], { ideas: ['to-sci'], level: 'beginner', hints: H('Are the two forms equal?', 'Yes, exactly.', 'So what does the notation help with?') }),
  'tl-small-1': sciQ('0.0000045', { ideas: ['to-sci'], level: 'intermediate', label: 'Measurement (m)', unit: 'm', prompt: 'A precision inspection reads 0.0000045 m. Write it in scientific notation.', hints: H('Move the decimal right until one nonzero digit is in front: 4.5.', 'Count the places: 6.', 'Moving right for a small number: a negative exponent.'), solution: '0.0000045 = 4.5 × 10⁻⁶ m.' }),
  'tl-small-2': sciQ('0.000012', { ideas: ['to-sci'], level: 'intermediate', label: 'Measurement (m)', unit: 'm', prompt: 'Another reading: 0.000012 m.', hints: H('Coefficient 1.2.', 'Count the places the decimal moves.', '5 places right: 10⁻⁵.'), solution: '0.000012 = 1.2 × 10⁻⁵ m.' }),
  'tl-larger': choice('Which measurement is larger: 4.5 × 10⁻⁶ m or 1.2 × 10⁻⁵ m?', '1.2 × 10⁻⁵ m: 10⁻⁵ is ten times bigger than 10⁻⁶', [['4.5 × 10⁻⁶ m, because 4.5 > 1.2', 'coef-only', 'Compare the powers of ten first: 10⁻⁵ > 10⁻⁶.'], ['They’re about the same', 'coef-only', '0.000012 is almost three times 0.0000045.']], { ideas: ['compare'], level: 'intermediate', hints: H('Compare the exponents first.', '−5 is greater than −6.', 'In standard form: 0.000012 vs 0.0000045.') }),
  'cv-1': sciQ('350000', { ideas: ['to-sci'], level: 'beginner', label: 'Scientific', prompt: 'Convert 350,000 to scientific notation.', hints: H('Coefficient 3.5.', 'Count places: 5.', 'Large number: positive exponent.'), solution: '350,000 = 3.5 × 10⁵.' }),
  'cv-2': sciQ('0.00000072', { ideas: ['to-sci'], level: 'intermediate', label: 'Scientific', prompt: 'Convert 0.00000072 to scientific notation.', hints: H('Coefficient 7.2.', 'Count places: 7.', 'Small number: negative exponent.'), solution: '0.00000072 = 7.2 × 10⁻⁷.' }),
  'cv-3': sciQ(R, { ideas: ['to-standard'], level: 'beginner', form: 'standard', label: 'Standard', prompt: 'Reverse it: write 2.016 × 10⁷ as a standard number.', hints: H('× 10⁷ moves the decimal 7 places right.', 'Fill with zeros.', '20,160,000.'), solution: '2.016 × 10⁷ = 20,160,000.' }),
  'cv-4': sciQ('0.0000045', { ideas: ['to-standard'], level: 'intermediate', form: 'standard', label: 'Standard', prompt: 'Write 4.5 × 10⁻⁶ as a standard number.', hints: H('× 10⁻⁶ moves the decimal 6 places left.', 'Fill with zeros after the point.', '0.0000045.'), solution: '4.5 × 10⁻⁶ = 0.0000045.' }),
  'mu-coef': numQ(6, { ideas: ['sci-multiply'], level: 'beginner', label: 'Coefficient', prompt: '(3.0 × 10⁵)(2.0 × 10³): first multiply the coefficients.', traps: [{ value: 5, code: 'add-coefficients', message: 'Multiply: 3.0 × 2.0.' }], hints: H('Multiply the numbers in front.', '3.0 × 2.0.', 'The powers of ten come next.'), solution: '3.0 × 2.0 = 6.0.' }),
  'mu-exp': numQ(8, { ideas: ['sci-multiply'], level: 'beginner', label: 'Exponent', prompt: 'Then the powers of ten: 10⁵ × 10³ = 10^?', traps: [{ value: 15, code: 'exp-arith', message: 'Product rule: add the exponents, 5 + 3.' }, { value: 2, code: 'exp-arith', message: 'For multiplication, add.' }], hints: H('Product rule.', 'Add the exponents.', '5 + 3.'), solution: '10⁵ × 10³ = 10⁸.' }),
  'mu-ans': sciQ('6e8', { ideas: ['sci-multiply'], level: 'intermediate', label: 'Product', prompt: 'So (3.0 × 10⁵)(2.0 × 10³) = ?', traps: [{ value: '6e15', code: 'exp-arith', message: 'Add the exponents, don’t multiply them.' }], hints: H('Coefficient 6.0.', 'Power 10⁸.', '6.0 × 10⁸.'), solution: '6.0 × 10⁸.' }),
  'mu-2': sciQ('2e8', { ideas: ['sci-multiply'], level: 'advanced', label: 'Product', prompt: 'A data rate: (4.0 × 10³)(5.0 × 10⁴). Give the answer normalized.', traps: [{ value: '2e7', code: 'not-normalized', message: '4 × 5 = 20, so 20 × 10⁷ = 2.0 × 10⁸: normalizing adds 1 to the exponent.' }], hints: H('4.0 × 5.0 = 20.', '10³ × 10⁴ = 10⁷.', '20 × 10⁷ isn’t normalized: 2.0 × 10⁸.'), solution: '20 × 10⁷ = 2.0 × 10⁸.' }),
  'dv-1': sciQ(F(R).div(400), { ideas: ['sci-divide'], level: 'intermediate', label: 'Readings per file', prompt: 'Split the 2.016 × 10⁷ readings into 4.0 × 10² equal files. How many per file? (Normalized.)', traps: [{ value: '5.04e9', code: 'exp-arith', message: 'Division: subtract the exponents, 7 − 2.' }], hints: H('Divide the coefficients: 2.016 ÷ 4.0 = 0.504.', 'Subtract the exponents: 10⁵.', '0.504 × 10⁵ isn’t normalized: 5.04 × 10⁴.'), solution: '0.504 × 10⁵ = 5.04 × 10⁴ readings per file.' }),
  'dv-std': sciQ(F(R).div(400), { ideas: ['sci-divide', 'to-standard'], level: 'beginner', form: 'standard', label: 'Readings per file', prompt: 'Write 5.04 × 10⁴ readings per file as a standard number.', hints: H('Move the decimal 4 places right.', '5.04 → 50400.', '50,400.'), solution: '50,400 readings per file.' }),
  'dv-2': sciQ('300', { ideas: ['sci-divide'], level: 'advanced', label: 'Ratio', form: 'either', prompt: 'A sensor drift check: (6.0 × 10⁻³) ÷ (2.0 × 10⁻⁵). (Scientific notation or standard.)', traps: [{ value: '3e-8', code: 'exp-arith', message: 'Subtract the exponents: −3 − (−5) = +2.' }, { value: '3e-2', code: 'exp-arith', message: '−3 − (−5) = −3 + 5 = 2.' }], hints: H('6.0 ÷ 2.0 = 3.0.', 'Exponents: −3 − (−5).', '= +2.'), solution: '3.0 × 10² = 300.' }),
  'tl-double': sciQ(F(R).mul(2), { ideas: ['sci-multiply'], level: 'intermediate', label: 'Readings', prompt: 'A second rig runs the same test. Total readings: 2 × (2.016 × 10⁷)?', traps: [{ value: F(R).mul(2).mul(10 ** 7), code: 'exp-arith', message: 'Only the coefficient doubles: the power of ten stays 10⁷.' }], hints: H('Double the coefficient.', '2 × 2.016 = 4.032.', '× 10⁷ stays.'), solution: '4.032 × 10⁷.' }),
  'cmp-1': choice('Wear on two bushings: 3.2 × 10⁻⁴ m and 9.8 × 10⁻⁵ m. Which is larger?', '3.2 × 10⁻⁴ m', [['9.8 × 10⁻⁵ m, because 9.8 > 3.2', 'coef-only', 'Compare the powers first: 10⁻⁴ > 10⁻⁵.']], { ideas: ['compare'], level: 'intermediate', inline: true, hints: H('Exponents first.', '−4 > −5.', '0.00032 vs 0.000098.') }),
  'cmp-2': choice('Two datasets: 7.5 × 10⁶ and 2.1 × 10⁷ readings. Which is larger?', '2.1 × 10⁷', [['7.5 × 10⁶, because 7.5 > 2.1', 'coef-only', '10⁷ beats 10⁶: 21 million vs 7.5 million.']], { ideas: ['compare'], level: 'beginner', inline: true, hints: H('Compare exponents.', '7 > 6.', '21,000,000 vs 7,500,000.') }),
  'cmp-3': choice('Order from smallest to largest: 5 × 10⁻³, 2 × 10⁻², 8 × 10⁻⁴.', '8 × 10⁻⁴, 5 × 10⁻³, 2 × 10⁻²', [['2 × 10⁻², 5 × 10⁻³, 8 × 10⁻⁴', 'coef-only', 'That orders the coefficients. More negative exponents are smaller.'], ['5 × 10⁻³, 8 × 10⁻⁴, 2 × 10⁻²', 'coef-only', 'Compare exponents first.']], { ideas: ['compare'], level: 'advanced', hints: H('The most negative exponent is smallest.', '−4 < −3 < −2.', '0.0008, 0.005, 0.02.') }),
  'cmp-units': choice('Which is a complete answer for the first inspection reading?', '4.5 × 10⁻⁶ meters', [['4.5 × 10⁻⁶', 'lost-units', 'Keep the units: 4.5 × 10⁻⁶ of what?'], ['4.5 × 10⁻⁶ seconds', 'lost-units', 'It was a length, in meters.']], { ideas: ['units'], level: 'beginner', hints: H('What was measured?', 'A length.', 'In meters.') }),
  'tc-1': sciQ('0.000307', { ideas: ['to-standard'], level: 'intermediate', form: 'standard', label: 'Standard', prompt: 'Challenge: write 3.07 × 10⁻⁴ as a standard number.', hints: H('× 10⁻⁴: the decimal moves left.', 'Four places.', 'Fill the gaps with zeros.'), solution: '0.000307.' }),
  'tc-2': sciQ('92000000', { ideas: ['to-sci'], level: 'intermediate', label: 'Scientific', prompt: 'Write 92,000,000 in scientific notation.', hints: H('9.2.', '7 places.', '× 10⁷.'), solution: '9.2 × 10⁷.' }),
  'tc-3': sciQ('0.045', { ideas: ['sci-multiply'], level: 'advanced', label: 'Product', prompt: '(1.5 × 10⁴)(3.0 × 10⁻⁶)?', traps: [{ value: '4.5e-24', code: 'exp-arith', message: 'Add the exponents: 4 + (−6).' }], hints: H('1.5 × 3.0 = 4.5.', '4 + (−6) = −2.', '4.5 × 10⁻².'), solution: '4.5 × 10⁻² (0.045).' }),
  'tc-4': sciQ('300000', { ideas: ['sci-divide'], level: 'advanced', label: 'Quotient', prompt: '(9.0 × 10⁸) ÷ (3.0 × 10³)?', traps: [{ value: '3e11', code: 'exp-arith', message: 'Division: subtract the exponents.' }], hints: H('9 ÷ 3 = 3.', '8 − 3 = 5.', '3.0 × 10⁵.'), solution: '3.0 × 10⁵.' })
};
// [standard number, op pair]: conversions and operations.
export const SCI_PRACTICE = [['0.00064', ['2.5e6', '4e-2', '*']], ['48000000', ['8.4e9', '2.1e3', '/']], ['0.0000091', ['6e-4', '1.5e7', '*']], ['7300000', ['7.2e5', '9e-3', '/']], ['0.000208', ['3.5e8', '2e4', '*']], ['615000', ['1.8e-2', '6e-7', '/']]];
export const SCI_PRACTICE_IDS = ['tlx-conv', 'tlx-op'];
export function sciPractice(n) {
  const [std, [a, b, op]] = pick(SCI_PRACTICE, n), A = F(sciTextToFrac(a)), B = F(sciTextToFrac(b)), out = op === '*' ? A.mul(B) : A.div(B);
  const na = normalize(A), nb = normalize(B), wrongExp = op === '*' ? na.e * nb.e : na.e + nb.e;
  return tidy({ brief: `Test file ${n + 1}: a new reading and a new calculation.`,
    'tlx-conv': sciQ(std, { ideas: ['to-sci'], level: 'advanced', label: 'Scientific', prompt: `Write ${P(std)} in scientific notation.`, hints: H('Put the decimal after the first nonzero digit.', 'Count the places it moves.', 'Big number: positive; small: negative.'), solution: `${P(std)} = ${S(std)}.` }),
    'tlx-op': sciQ(out, { ideas: [op === '*' ? 'sci-multiply' : 'sci-divide'], level: 'advanced', label: op === '*' ? 'Product' : 'Quotient', prompt: `Compute (${S(A)}) ${op === '*' ? '×' : '÷'} (${S(B)}), normalized.`, traps: [{ value: F(normalize(out).c).mul(fpow(new Frac(10), wrongExp)), code: 'exp-arith', message: op === '*' ? 'Multiplying: add the exponents.' : 'Dividing: subtract the exponents.' }],
      hints: H(`${op === '*' ? 'Multiply' : 'Divide'} the coefficients.`, `${op === '*' ? 'Add' : 'Subtract'} the exponents.`, 'Normalize if the coefficient isn’t between 1 and 10.'), solution: `${S(out)}.` }) });
}
function sciTextToFrac(t) { const [c, e] = t.split('e'); return F(c).mul(fpow(new Frac(10), parseInt(e, 10))); }

// ================================================================ Stage 03: Product Launch (exponential growth)
const n4 = N(4), l4 = L(4);
const growthTable = [0, 1, 2, 3, 4].map(t => [t, num(N(t))]);
const fieldRow = (ts, f, labelFn, traps = () => []) => ts.map(t => ({ id: 't' + t, label: labelFn(t), answer: val(f(t)), traps: traps(t) }));
const M3 = {
  'gw-factor': numQ('1.2', { ideas: ['growth-factor'], level: 'beginner', label: 'Growth factor', prompt: 'The waitlist starts at 500 riders and grows 20% a month. What does it get multiplied by each month?', traps: [{ value: '0.2', code: 'rate-as-factor', message: '0.20 is the rate. Growing by 20% keeps the 100% and adds 20%: 1.20.' }, { value: 20, code: 'rate-as-factor', message: '20 is the percent. As a multiplier: 1.20.' }, { value: 120, code: 'rate-as-factor', message: '120% as a decimal is 1.20.' }],
    hints: H('The new month is the old month plus 20% of it.', '100% + 20% = 120%.', '120% = 1.20.'), solution: '100% + 20% = 120% = 1.20.' }),
  'gw-model': exprQ('N =', '500(1.2)^t', ['t'], { ideas: ['growth-model'], level: 'beginner', tiles: ['500', '1.20', '0.20', '(', ')', '^', 't'], prompt: 'Write the waitlist model N(t) for t months.',
    traps: [{ expr: '500(0.2)^t', code: 'rate-as-factor', message: 'Multiply by 1.20 to grow 20%; 0.20 would shrink it.' }, { expr: '500 + 0.2t', code: 'add-percent', message: 'Exponential growth multiplies by the same factor each month.' }, { expr: '500 + 100t', code: 'linear-exponential', message: 'That adds 100 every month (linear). The waitlist grows by 20% of its current size.' }, { expr: '1.2(500)^t', code: 'initial-factor-swap', message: 'The starting value 500 multiplies; the factor 1.20 is raised to the power t.' }],
    hints: H('Starting value: 500.', 'Factor each month: 1.20.', 'N = a(factor)ᵗ.'), solution: 'N(t) = 500(1.20)ᵗ.' }),
  'gw-500': choice('In N(t) = 500(1.20)ᵗ, what does 500 represent?', 'The starting waitlist (month 0)', [['The monthly growth', 'initial-factor-swap', 'The growth is the factor 1.20.'], ['The waitlist after one month', 'initial-factor-swap', 'After one month it’s 600.'], ['The maximum waitlist', 'linear-exponential', 'The model keeps growing.']], { ideas: ['growth-factor'], level: 'beginner', hints: H('Set t = 0.', '1.20⁰ = 1.', '500 × 1.') }),
  'gw-table': { type: 'fields', ideas: ['growth-evaluate'], level: 'intermediate', prompt: 'Build the launch tracker: N(t) for months 1 to 4.', fields: fieldRow([1, 2, 3, 4], N, t => `Month ${t}`, t => [{ value: val(L(t)), code: 'add-percent', message: `That adds 100 a month. Multiply the previous month by 1.20 instead.` }]),
    hints: H('Each month is 1.20 × the month before.', '500 × 1.2 = 600; 600 × 1.2 = 720.', 'Keep multiplying: 864, then 1036.8.'), solution: '600, 720, 864, 1036.8.' },
  'gw-n3': numQ(N(3), { ideas: ['growth-evaluate'], level: 'intermediate', label: 'N(3)', prompt: 'Evaluate N(3) = 500(1.20)³.', traps: [{ value: 500 * 1.2 * 3, code: 'times-exponent', message: '(1.20)³ is 1.20 × 1.20 × 1.20, not 1.20 × 3.' }, { value: 800, code: 'add-percent', message: 'That adds 100 a month. Raise 1.20 to the power 3.' }, { value: Math.pow(600, 3), code: 'initial-factor-swap', message: 'Only 1.20 is cubed: work out the power first, then multiply by 500.' }],
    hints: H('What is the starting number of interested riders?', 'Each month, the waitlist becomes 120% of the previous month’s size.', 'Replace t with 3 and calculate the power first.'), solution: '1.20³ = 1.728, and 500 × 1.728 = 864.' }),
  'gw-people': choice('N(4) = 1036.8. How many riders should the dashboard show?', 'About 1,037: people come in whole numbers, so round the model’s value', [['Exactly 1036.8', 'indivisible', 'There’s no 0.8 of a rider: keep 1036.8 inside the model, but report about 1,037.'], ['1,036: always round down', 'indivisible', '1036.8 is closer to 1,037.']], { ideas: ['growth-evaluate'], level: 'beginner', hints: H('Can there be 0.8 of a person?', 'Round for the display.', 'Nearest whole number.') }),
  'lv-l4': numQ(l4, { ideas: ['lin-vs-exp'], level: 'beginner', label: 'L(4)', prompt: 'Campaign A adds 100 riders a month: L(t) = 500 + 100t. Find L(4).', traps: [{ value: n4, code: 'linear-exponential', message: 'That’s the exponential campaign.' }], hints: H('Substitute 4.', '100 × 4 = 400.', '500 + 400.'), solution: 'L(4) = 900.' }),
  'lv-n4': numQ(n4, { ideas: ['lin-vs-exp', 'growth-evaluate'], level: 'intermediate', label: 'N(4)', prompt: 'Campaign B grows 20% a month. Find N(4).', traps: [{ value: l4, code: 'linear-exponential', message: 'That’s the linear campaign.' }, { value: 900, code: 'add-percent', message: '20% of 500 each month is linear. Multiply by 1.20 four times.' }], hints: H('864 × 1.20.', 'Or 500 × 1.20⁴.', '1.20⁴ = 2.0736.'), solution: 'N(4) = 500 × 2.0736 = 1036.8.' }),
  'lv-table': choice('Which table is exponential? A: 500, 600, 700, 800. B: 500, 600, 720, 864.', 'B: each value is 1.20 times the one before', [['A: it goes up by 100 each time', 'linear-exponential', 'Equal differences mean linear.'], ['Both', 'linear-exponential', 'A adds the same amount; B multiplies by the same factor.']], { ideas: ['lin-vs-exp', 'growth-identify'], level: 'beginner', hints: H('Look at differences.', 'Then look at ratios.', 'Equal ratios: exponential.') }),
  'lv-graph': choice('On the launch graph, which campaign’s line curves upward more and more steeply?', 'The exponential one: its increase grows as the waitlist grows', [['The linear one', 'linear-exponential', 'A linear model is a straight line.'], ['Neither: both are straight', 'linear-exponential', 'Repeated percentage growth curves upward.']], { ideas: ['lin-vs-exp', 'growth-identify'], level: 'beginner', fig: { kind: 'curves', x: [0, 8], y: [0, 2200], series: [{ f: t => val(L(t)), cls: 'pev-lin', label: 'A: 500 + 100t' }, { f: t => val(N(t)), cls: 'pev-exp', label: 'B: 500(1.20)ᵗ' }] }, hints: H('Which one adds the same amount?', 'That one is straight.', 'The other multiplies.') }),
  'lv-words': choice('“The bike’s ambassador list doubles every month.” Linear or exponential?', 'Exponential: it multiplies by 2 each month', [['Linear: it changes by the same amount', 'linear-exponential', 'Doubling adds more each month: 1, 2, 4, 8…'], ['Neither', 'linear-exponential', 'Repeated multiplication is exponential.']], { ideas: ['lin-vs-exp', 'growth-identify'], level: 'intermediate', inline: false, hints: H('Same amount, or same factor?', 'Doubling = × 2.', 'Same factor.') }),
  'lv-why': choice('Why does Campaign B pull ahead of Campaign A?', 'B’s 20% is taken of a bigger number each month, so its monthly increase keeps growing', [['B adds more riders every month from the start', 'add-percent', 'In month 1 both add 100. After that, B’s increase grows.'], ['A slows down over time', 'linear-exponential', 'A adds exactly 100 every month.']], { ideas: ['lin-vs-exp'], level: 'advanced', hints: H('Compare month 1 increases.', 'Both +100.', 'Then B: +120, +144…') }),
  'gf-1': { type: 'fields', ideas: ['growth-factor'], level: 'intermediate', prompt: 'N(t) = 100(1.15)ᵗ. Identify each part.', fields: [{ id: 'a', label: 'Initial value', answer: 100, traps: [{ value: 1.15, code: 'initial-factor-swap', message: '1.15 is the factor.' }] }, { id: 'b', label: 'Growth factor', answer: 1.15, traps: [{ value: 100, code: 'initial-factor-swap', message: '100 is the starting value.' }, { value: 0.15, code: 'rate-as-factor', message: '0.15 is the rate; the factor is 1.15.' }] }, { id: 'r', label: 'Growth rate', unit: '%', answer: 15, traps: [{ value: 115, code: 'rate-as-factor', message: 'The rate is the part above 100%: 15%.' }, { value: 1.15, code: 'rate-as-factor', message: 'As a percent: 15%.' }] }],
    hints: H('The number in front is the start.', 'The base of the power is the factor.', 'Factor − 1, as a percent, is the rate.'), solution: 'Start 100, factor 1.15, rate 15%.' },
  'gf-2': { type: 'fields', ideas: ['growth-factor'], level: 'intermediate', prompt: 'N(t) = 250(1.30)ᵗ.', fields: [{ id: 'a', label: 'Initial value', answer: 250 }, { id: 'b', label: 'Growth factor', answer: 1.3, traps: [{ value: 0.3, code: 'rate-as-factor', message: 'The factor is 1.30.' }] }, { id: 'r', label: 'Growth rate', unit: '%', answer: 30, traps: [{ value: 130, code: 'rate-as-factor', message: '30%.' }] }],
    hints: H('Start in front.', 'Factor in the brackets.', 'Rate = factor − 1.'), solution: 'Start 250, factor 1.30, rate 30%.' },
  'gf-3': { type: 'fields', ideas: ['growth-factor'], level: 'intermediate', prompt: 'N(t) = 1000(1.05)ᵗ.', fields: [{ id: 'a', label: 'Initial value', answer: 1000 }, { id: 'b', label: 'Growth factor', answer: 1.05, traps: [{ value: 0.05, code: 'rate-as-factor', message: 'The factor is 1.05.' }] }, { id: 'r', label: 'Growth rate', unit: '%', answer: 5, traps: [{ value: 105, code: 'rate-as-factor', message: '5%.' }, { value: 50, code: 'decimal-count', message: '0.05 = 5%.' }] }],
    hints: H('Start in front.', 'Factor in the brackets.', '1.05 − 1 = 0.05.'), solution: 'Start 1000, factor 1.05, rate 5%.' },
  'wm-a': numQ(800, { ideas: ['growth-model'], level: 'beginner', label: 'Initial value', prompt: '“A new gravity bike begins with 800 interested riders on its early-access list. The list grows by 10% each month.” Initial value?', traps: [{ value: 1.1, code: 'initial-factor-swap', message: 'That’s the factor.' }], hints: H('Month 0.', 'The list begins with…', '800.'), solution: '800.' }),
  'wm-b': numQ('1.1', { ideas: ['growth-model', 'growth-factor'], level: 'beginner', label: 'Growth factor', prompt: 'Growth factor?', traps: [{ value: '0.1', code: 'rate-as-factor', message: '10% growth: 1 + 0.10 = 1.10.' }, { value: 10, code: 'rate-as-factor', message: 'As a multiplier: 1.10.' }], hints: H('100% + 10%.', '110%.', '1.10.'), solution: '1.10.' }),
  'wm-c': exprQ('N =', '800(1.1)^t', ['t'], { ideas: ['growth-model'], level: 'intermediate', prompt: 'Write N(t).', traps: [{ expr: '800(0.1)^t', code: 'rate-as-factor', message: 'Use the factor 1.10.' }, { expr: '800 + 80t', code: 'linear-exponential', message: 'That adds 80 every month: linear.' }, { expr: '1.1(800)^t', code: 'initial-factor-swap', message: '800 in front, 1.10 to the power t.' }], hints: H('a = 800.', 'factor = 1.10.', 'N = 800(1.10)ᵗ.'), solution: 'N(t) = 800(1.10)ᵗ.' }),
  'wm-d': numQ(model(800, 10, 3), { ideas: ['growth-evaluate'], level: 'intermediate', label: 'N(3)', prompt: 'Estimate the list after three months: N(3).', traps: [{ value: 800 * 1.1 * 3, code: 'times-exponent', message: 'Cube 1.10 first: 1.331.' }, { value: 1040, code: 'add-percent', message: 'That adds 80 a month. Multiply by 1.10 three times.' }], hints: H('1.10³ = 1.331.', '800 × 1.331.', '1064.8, about 1,065 riders.'), solution: '800 × 1.331 = 1064.8, about 1,065 riders.' })
};
// [start, percent, month to evaluate]
export const GROWTH_PRACTICE = [[400, 25, 3], [1200, 5, 2], [300, 50, 2], [2000, 10, 3], [150, 40, 2], [640, 25, 2]];
export const GROWTH_PRACTICE_IDS = ['gwx-model', 'gwx-eval'];
export function growthPractice(n) {
  const [a, p, t] = pick(GROWTH_PRACTICE, n), f = factorOf(p, 1), fs = String(Number(f));
  return tidy({ brief: `Launch campaign ${n + 1}: ${a.toLocaleString('en-US')} interested riders, growing ${p}% a month.`,
    'gwx-model': exprQ('N =', `${a}(${fs})^t`, ['t'], { ideas: ['growth-model'], level: 'advanced', prompt: 'Write the growth model N(t).', traps: [{ expr: `${a}(${p / 100})^t`, code: 'rate-as-factor', message: `Use the factor 1 + ${p / 100} = ${fs}.` }, { expr: `${a} + ${a * p / 100}t`, code: 'linear-exponential', message: 'That adds the same amount each month.' }], hints: H(`Start: ${a}.`, `Factor: 1 + ${p / 100}.`, `N = ${a}(${fs})ᵗ.`), solution: `N(t) = ${a}(${fs})ᵗ.` }),
    'gwx-eval': numQ(model(a, p, t), { ideas: ['growth-evaluate'], level: 'advanced', label: `N(${t})`, prompt: `Evaluate N(${t}).`, traps: [{ value: a + a * p / 100 * t, code: 'add-percent', message: `Multiply by ${fs} each month instead of adding ${a * p / 100}.` }, { value: a * Number(f) * t, code: 'times-exponent', message: `Raise ${fs} to the power ${t} first.` }], hints: H(`${fs}${sup(t)} first.`, `= ${num(fpow(f, t))}.`, `× ${a}.`), solution: `N(${t}) = ${a} × ${num(fpow(f, t))} = ${num(model(a, p, t))}.` }) });
}

// ================================================================ Stage 04: The Used Market (exponential decay)
const cross = firstPast(V, BIKE.target, -1);
const M4 = {
  'dk-factor': numQ('0.8', { ideas: ['decay-factor'], level: 'beginner', label: 'Retention factor', prompt: 'The $6,000 Project Switchback build keeps 80% of its modeled value each year. What is the yearly multiplier?', traps: [{ value: '0.2', code: 'rate-retention-swap', message: '0.20 is the 20% lost. The bike keeps 80%: 0.80.' }, { value: '1.2', code: 'decay-multiplier', message: '1.20 would grow the value. Losing 20% means × 0.80.' }, { value: 80, code: 'rate-retention-swap', message: '80% as a decimal: 0.80.' }],
    hints: H('What fraction of the value remains each year?', '100% − 20% = 80%.', '0.80.'), solution: 'It keeps 80%: × 0.80 each year (it loses 20%).' }),
  'dk-model': exprQ('V =', '6000(0.8)^t', ['t'], { ideas: ['decay-model'], level: 'beginner', tiles: ['6000', '0.80', '0.20', '(', ')', '^', 't'], prompt: 'Write the modeled value V(t) after t years.',
    traps: [{ expr: '6000(0.2)^t', code: 'rate-retention-swap', message: 'Multiply by what’s kept, 0.80, not the 0.20 lost.' }, { expr: '6000 - 1200t', code: 'subtract-constant', message: 'That subtracts $1,200 every year. The model multiplies by 0.80 each year.' }, { expr: '6000(1.2)^t', code: 'decay-multiplier', message: 'A factor above 1 grows. Use 0.80.' }],
    hints: H('Start: 6000.', 'Factor: 0.80.', 'V = a(factor)ᵗ.'), solution: 'V(t) = 6000(0.80)ᵗ.' }),
  'dk-meaning': choice('What does 0.80 mean in V(t) = 6000(0.80)ᵗ?', 'Each year the bike keeps 80% of the previous year’s modeled value', [['The bike loses $0.80 a year', 'subtract-constant', 'It’s a multiplier, not an amount.'], ['The bike loses 80% a year', 'rate-retention-swap', 'It keeps 80%; it loses 20%.'], ['The bike is worth $800 after a year', 'initial-factor-swap', 'After a year it’s 6000 × 0.80 = $4,800.']], { ideas: ['decay-factor'], level: 'beginner', hints: H('What is multiplied by 0.80?', 'Last year’s value.', 'So 80% remains.') }),
  'dk-table': { type: 'fields', ideas: ['decay-evaluate'], level: 'intermediate', prompt: 'Build the depreciation table: V(t) for years 1 to 5.', fields: fieldRow([1, 2, 3, 4, 5], V, t => `Year ${t} ($)`, t => [{ value: val(Lv(t)), code: 'subtract-constant', message: 'That subtracts $1,200 a year. Multiply the previous year by 0.80 instead.' }]),
    hints: H('Each year is 0.80 × the year before.', '6000 × 0.8 = 4800; 4800 × 0.8 = 3840.', 'Then 3072, 2457.60, 1966.08.'), solution: '$4,800, $3,840, $3,072, $2,457.60, $1,966.08.' },
  'dk-v3': numQ(V(3), { ideas: ['decay-evaluate'], level: 'intermediate', label: 'V(3) ($)', prompt: 'Evaluate V(3) = 6000(0.80)³.', traps: [{ value: 6000 * 0.8 * 3, code: 'times-exponent', message: 'Cube 0.80 first: 0.512.' }, { value: val(Lv(3)), code: 'subtract-constant', message: 'That’s the linear model.' }], hints: H('0.80³ = 0.512.', '6000 × 0.512.', '3072.'), solution: '6000 × 0.512 = $3,072.' }),
  'ld-l3': numQ(Lv(3), { ideas: ['decay-compare'], level: 'beginner', label: 'L(3) ($)', prompt: 'A linear model subtracts $1,200 a year: L(t) = 6000 − 1200t. Find L(3).', traps: [{ value: V(3), code: 'linear-exponential', message: 'That’s the exponential model.' }], hints: H('1200 × 3.', '= 3600.', '6000 − 3600.'), solution: 'L(3) = $2,400.' }),
  'ld-5': choice('After 5 years, which model says the bike is worth more?', `Exponential: ${money(V(5))} vs $0 for the linear model`, [['Linear', 'linear-exponential', 'L(5) = 6000 − 6000 = 0.'], ['They’re equal', 'linear-exponential', 'They’re only equal at the start and after year 1.']], { ideas: ['decay-compare'], level: 'intermediate', hints: H('L(5) = 6000 − 1200(5).', 'V(5) = 6000(0.80)⁵.', 'Compare.') }),
  'ld-shape': choice('How do the two graphs differ?', 'The linear one is a straight line down; the exponential one curves, falling less each year', [['Both are straight lines', 'linear-exponential', 'Repeated percentages curve.'], ['The exponential one falls by the same amount each year', 'subtract-constant', 'It falls by the same percentage: smaller amounts as the value shrinks.']], { ideas: ['decay-compare', 'decay-identify'], level: 'intermediate', fig: { kind: 'curves', x: [0, 6], y: [0, 6500], series: [{ f: t => Math.max(0, val(Lv(t))), cls: 'pev-lin', label: 'L: 6000 − 1200t' }, { f: t => val(V(t)), cls: 'pev-exp', label: 'V: 6000(0.80)ᵗ' }] }, hints: H('What does each subtract?', 'Linear: $1,200 always.', 'Exponential: 20% of what’s left.') }),
  'ld-which': choice('Year by year the value goes 6000, 4800, 3600, 2400. Which model is that?', 'Linear: it drops the same $1,200 each year', [['Exponential: it drops 20% each year', 'linear-exponential', '20% of 4800 is 960, not 1200.'], ['Neither', 'linear-exponential', 'Equal drops: linear.']], { ideas: ['decay-compare', 'decay-identify'], level: 'beginner', hints: H('Differences.', 'All −1200.', 'Equal differences.') }),
  'tg-between': choice('The company wants to know when the modeled value drops below $2,500. From the table (V(3) = $3,072, V(4) = $2,457.60), between which two years?', 'Between years 3 and 4', [['Between years 4 and 5', 'exact-crossing', 'V(4) is already below $2,500.'], ['Between years 2 and 3', 'exact-crossing', 'V(3) = $3,072 is still above.']], { ideas: ['target'], level: 'intermediate', keepOrder: true, hints: H('Find the last year above $2,500.', 'Year 3: $3,072.', 'Year 4: $2,457.60, below.') }),
  'tg-first': numQ(cross.t, { ideas: ['target'], level: 'intermediate', label: 'Year', prompt: 'What is the first whole-year checkpoint with a modeled value below $2,500?', traps: [{ value: cross.t - 1, code: 'exact-crossing', message: 'V(3) = $3,072 is still above $2,500.' }], hints: H('Check each year in the table.', 'Which is the first under $2,500?', 'Year 4.'), solution: 'Year 4 ($2,457.60).' }),
  'tg-exact': choice('A classmate says the bike is worth exactly $2,500 at 3.5 years. What’s the problem?', 'The table only shows the crossing is somewhere between years 3 and 4: halfway isn’t guaranteed, because the curve isn’t a straight line', [['Nothing: 3.5 is the midpoint, so it’s exact', 'exact-crossing', 'The values don’t fall evenly, so the midpoint isn’t the crossing.'], ['It happens in year 5', 'exact-crossing', 'V(4) is already below $2,500.']], { ideas: ['target'], level: 'advanced', hints: H('What does the table actually show?', 'Above at 3, below at 4.', 'Is the drop from 3 to 4 even?') }),
  'rc-keep': choice('Two used-market models start at $6,000: one drops 10% a year, the other 25%. Which keeps more of its modeled value?', 'The 10% model (factor 0.90)', [['The 25% model', 'rate-retention-swap', '25% off leaves only 75% each year.'], ['They keep the same', 'linear-exponential', '0.90 vs 0.75 each year.']], { ideas: ['decay-factor'], level: 'beginner', hints: H('Write each factor.', '0.90 and 0.75.', 'The bigger factor keeps more.') }),
  'rc-3000': choice('With 10%, 15%, 20% and 25% yearly drops from $6,000, which falls below $3,000 at the earliest whole year?', 'The 25% model, in year 3', [['The 10% model', 'rate-retention-swap', 'A smaller drop keeps value longer.'], ['They all cross in the same year', 'linear-exponential', 'Check the tables: years 7, 5, 4 and 3.']], { ideas: ['target', 'decay-factor'], level: 'advanced', hints: H('The biggest drop falls fastest.', 'Check 6000 × 0.75³.', '= $2,531.25.'), solution: '25%: 6000 × 0.75³ = $2,531.25 in year 3 (20%: year 4; 15%: year 5; 10%: year 7).' }),
  'rc-more': choice('What happens to the curve when the depreciation rate increases?', 'It falls more steeply: the factor is smaller', [['It falls more slowly', 'rate-retention-swap', 'A bigger rate means a smaller factor kept.'], ['It becomes a straight line', 'linear-exponential', 'It still curves.']], { ideas: ['decay-identify'], level: 'beginner', hints: H('Rate up → factor down.', 'Smaller factor each year.', 'Faster fall.') }),
  'lim-1': { type: 'multi', ideas: ['limits'], level: 'beginner', prompt: 'Which of these really affect a used bike’s price, but aren’t in the model?', options: [opt('c', 'Condition', true), opt('m', 'Maintenance', true), opt('d', 'Market demand', true), opt('s', 'Seasonality', true), opt('x', 'The exponent rules', false, 'guaranteed-value', 'The maths describes the model; it doesn’t set prices.')], hints: H('What makes two used bikes of the same age sell for different prices?', 'Think about the bike and the market.', 'All but one of these.'), solution: 'Condition, maintenance, demand and seasonality (and brand, specification and model-year changes) all affect real prices.' },
  'lim-2': choice(`Is ${money(V(5))} what the bike will sell for after 5 years?`, 'No: it’s a modeled estimate from a simplified 20% rule, not a guaranteed price', [['Yes: the model calculates it exactly', 'guaranteed-value', 'The calculation is exact, but the model is a simplification.'], ['Yes, to the nearest cent', 'guaranteed-value', 'A real sale depends on condition, demand and more.']], { ideas: ['limits'], level: 'intermediate', hints: H('What does the model assume?', 'A fixed 20% every year.', 'Is that guaranteed?') })
};
// [start value, percent drop, target]
export const DECAY_PRACTICE = [[5000, 10, 3500], [8000, 25, 3000], [4000, 15, 2500], [3200, 20, 1500], [7500, 30, 2000], [10000, 12, 6000]];
export const DECAY_PRACTICE_IDS = ['dkx-model', 'dkx-target'];
export function decayPractice(n) {
  const [a, p, target] = pick(DECAY_PRACTICE, n), f = factorOf(p, -1), fs = String(Number(f)), C = firstPast(t => model(a, p, t, -1), target, -1);
  return tidy({ brief: `Used listing ${n + 1}: a $${a.toLocaleString('en-US')} bike in a model that loses ${p}% a year.`,
    'dkx-model': exprQ('V =', `${a}(${fs})^t`, ['t'], { ideas: ['decay-model'], level: 'advanced', prompt: 'Write the decay model V(t).', traps: [{ expr: `${a}(${p / 100})^t`, code: 'rate-retention-swap', message: `Multiply by what’s kept: 1 − ${p / 100} = ${fs}.` }, { expr: `${a} - ${a * p / 100}t`, code: 'subtract-constant', message: 'That subtracts the same amount each year.' }, { expr: `${a}(${1 + p / 100})^t`, code: 'decay-multiplier', message: 'A factor above 1 grows.' }], hints: H(`Start: ${a}.`, `Kept each year: ${100 - p}%.`, `V = ${a}(${fs})ᵗ.`), solution: `V(t) = ${a}(${fs})ᵗ.` }),
    'dkx-target': numQ(C.t, { ideas: ['target'], level: 'advanced', label: 'First year below', prompt: `Using a table, what is the first whole year the modeled value is below $${target.toLocaleString('en-US')}?`, traps: [{ value: C.t - 1, code: 'exact-crossing', message: `V(${C.t - 1}) = ${money(model(a, p, C.t - 1, -1))} is still above the target.` }], hints: H('Make a table year by year.', `Multiply by ${fs} each year.`, `V(${C.t - 1}) = ${money(model(a, p, C.t - 1, -1))}; V(${C.t}) = ${money(model(a, p, C.t, -1))}.`), solution: `Year ${C.t}: ${money(model(a, p, C.t, -1))} (year ${C.t - 1} was ${money(model(a, p, C.t - 1, -1))}).` }) });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'prototype', n: 1, title: 'Prototype Design Lab', short: 'Prototype Design', minutes: '10–13', focus: 'Exponent Rules', badge: 'Prototype Designer', blurb: 'Scale the CAD models: repeated multiplication, the product, quotient and power rules, and zero and negative exponents.', graded: Object.keys(M1) },
  { id: 'testlab', n: 2, title: 'Engineering Test Lab', short: 'Engineering Test Lab', minutes: '9–12', focus: 'Scientific Notation', badge: 'Test Engineer', blurb: 'Huge sensor datasets and tiny measurements: convert, multiply, divide and compare in scientific notation.', graded: Object.keys(M2) },
  { id: 'launch', n: 3, title: 'Product Launch', short: 'Product Launch', minutes: '8–11', focus: 'Exponential Growth', badge: 'Product Launch Manager', blurb: 'Model the early-access waitlist growing 20% a month, and tell exponential growth from linear.', graded: Object.keys(M3) },
  { id: 'market', n: 4, title: 'The Used Market', short: 'Used Market', minutes: '8–11', focus: 'Exponential Decay', badge: 'Market Analyst', blurb: 'Track the bike’s modeled resale value, compare decay rates, and estimate when it falls below a target from a table.', graded: Object.keys(M4) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)) };
export const GROWTH_TABLE = growthTable;

// ================================================================ MTB Product Innovation Certification
// Each round: three exponent-rule items, three scientific-notation items, a growth model, a decay model.
export const FINAL_SETS = [
  { rules: [['(2x^3)^2', '4x^6', '2x^6', '4x^5'], ['power-power'], [3, 'n']], sci: ['0.000058', ['3.0e4', '2.5e-2', '*'], ['6.1e-5', '9.4e-6']], growth: [300, 15, 3], growthTable: [[0, 200], [1, 260], [2, 338], [3, 439.4]], decay: [9000, 25, 4000] },
  { rules: [['(3a^2)^3', '27a^6', '3a^6', '27a^5'], ['quotient'], [2, 'n']], sci: ['4730000', ['8.4e6', '2.1e2', '/'], ['3.2e8', '9.9e7']], growth: [1200, 5, 2], growthTable: [[0, 400], [1, 450], [2, 500], [3, 550]], decay: [5000, 10, 3500] },
  { rules: [['(5y)^2', '25y^2', '5y^2', '10y^2'], ['product'], [4, 'z']], sci: ['0.0000903', ['6.0e-3', '4.0e5', '*'], ['7.7e-3', '2.0e-2']], growth: [800, 25, 2], growthTable: [[0, 1000], [1, 1100], [2, 1210], [3, 1331]], decay: [7200, 20, 3000] },
  { rules: [['(2m^4)^3', '8m^12', '2m^12', '8m^7'], ['power-product'], [5, 'n']], sci: ['812000000', ['1.8e9', '6.0e4', '/'], ['5.5e-4', '5.5e-5']], growth: [2500, 12, 2], growthTable: [[0, 50], [1, 100], [2, 150], [3, 200]], decay: [4800, 15, 2500] }
];
export const FINAL_IDS = ['fa-simplify', 'fa-law', 'fa-negative', 'fb-convert', 'fb-op', 'fb-compare', 'fc-model', 'fc-eval', 'fc-linexp', 'fd-model', 'fd-eval', 'fd-target'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
const LAW_ITEMS = {
  'power-power': ['(y³)⁴ = y¹²', 'Power of a power: multiply the exponents'],
  quotient: ['b⁹ / b⁴ = b⁵', 'Quotient rule: subtract the exponents'],
  product: ['k³ × k⁶ = k⁹', 'Product rule: add the exponents'],
  'power-product': ['(4w)² = 16w²', 'Power of a product: apply the power to every factor']
};
const LAW_NAMES = { 'power-power': 'Power of a power: multiply the exponents', quotient: 'Quotient rule: subtract the exponents', product: 'Product rule: add the exponents', 'power-product': 'Power of a product: apply the power to every factor' };
export function finalQuestions(roundNo) {
  const X = pick(FINAL_SETS, roundNo - 1), out = { set: X };
  const [[expr, ans, tOut, tAdd], [law], [negE, negV]] = X.rules;
  out['fa-simplify'] = mq(expr, { ideas: ['power-product', 'power-power'], vars: [ans.replace(/[^a-z]/g, '')[0]], level: 'intermediate', prompt: `Simplify ${TXT(expr)}.`, traps: [{ expr: tOut, code: 'outside-only', message: 'The power applies to the number in the brackets too.' }, { expr: tAdd, code: /^\(\d[a-z]\)/.test(expr) ? 'times-exponent' : 'add-in-power', message: /^\(\d[a-z]\)/.test(expr) ? 'Raise the number to the power: don’t multiply it by the exponent.' : 'A power of a power multiplies the exponents.' }], hints: H('Apply the outside power to every factor.', 'Number: raise it. Letter: multiply the exponents.', 'Combine.') });
  out['fa-law'] = { type: 'choice', keepOrder: true, ideas: [law], level: 'intermediate', prompt: `Which law gives ${LAW_ITEMS[law][0]}?`,
    options: Object.entries(LAW_NAMES).map(([k, t]) => opt(k, t, k === law, { 'power-power': 'add-in-power', product: 'multiply-exponents', quotient: 'divide-exponents', 'power-product': 'outside-only' }[law], 'Look at what happened to the exponents.')), hints: H('Is anything in brackets?', 'Multiplying, dividing, or raising a power?', 'Check what happened to the exponents.'), solution: LAW_NAMES[law] + '.' };
  out['fa-negative'] = mq(`${negV}^(-${negE})`, { ideas: ['negative'], vars: [negV], level: 'intermediate', label: 'With positive exponents', prompt: `Rewrite ${negV}${sup(-negE)} with a positive exponent (${negV} ≠ 0).`, traps: [{ expr: `-${negV}^${negE}`, code: 'negative-value', message: 'Reciprocal, not negative.' }], hints: H('Negative exponent: reciprocal.', 'Move it to the denominator.', `1/${negV}${sup(negE)}.`) });
  const [std, [a, b, op], [c1, c2]] = X.sci, A = sciTextToFrac(a), B = sciTextToFrac(b), res = op === '*' ? A.mul(B) : A.div(B);
  out['fb-convert'] = sciQ(std, { ideas: ['to-sci'], level: 'intermediate', label: 'Scientific', prompt: `A new test reading: ${P(std)}. Write it in scientific notation.`, hints: H('One nonzero digit before the point.', 'Count places.', 'Sign of the exponent.'), solution: `${S(std)}.` });
  out['fb-op'] = sciQ(res, { ideas: [op === '*' ? 'sci-multiply' : 'sci-divide'], level: 'advanced', label: op === '*' ? 'Product' : 'Quotient', prompt: `Compute (${S(A)}) ${op === '*' ? '×' : '÷'} (${S(B)}), normalized.`, hints: H('Coefficients first.', op === '*' ? 'Add the exponents.' : 'Subtract the exponents.', 'Normalize.'), solution: `${S(res)}.` });
  const v1 = sciTextToFrac(c1), v2 = sciTextToFrac(c2), big = Number(v1) > Number(v2) ? c1 : c2, small = big === c1 ? c2 : c1, coefTrap = Number(normalize(sciTextToFrac(small)).c) > Number(normalize(sciTextToFrac(big)).c);
  out['fb-compare'] = choice(`Which is larger: ${S(v1)} or ${S(v2)}?`, S(sciTextToFrac(big)), [[S(sciTextToFrac(small)), coefTrap ? 'coef-only' : 'exp-sign', 'Compare the powers of ten first, then the coefficients.']], { ideas: ['compare'], level: 'intermediate', inline: true, hints: H('Exponents first.', 'If equal, coefficients.', 'Or write both out.') });
  const [ga, gp, gt] = X.growth, gf = String(Number(factorOf(gp, 1)));
  out['fc-model'] = exprQ('N =', `${ga}(${gf})^t`, ['t'], { ideas: ['growth-model'], level: 'intermediate', prompt: `A demo-day list starts at ${ga.toLocaleString('en-US')} riders and grows ${gp}% a month. Write N(t).`, traps: [{ expr: `${ga}(${gp / 100})^t`, code: 'rate-as-factor', message: `The factor is 1 + ${gp / 100}.` }, { expr: `${ga} + ${ga * gp / 100}t`, code: 'linear-exponential', message: 'That’s linear.' }], hints: H('Start.', 'Factor = 1 + rate.', 'a(factor)ᵗ.'), solution: `N(t) = ${ga}(${gf})ᵗ.` });
  out['fc-eval'] = numQ(model(ga, gp, gt), { ideas: ['growth-evaluate'], level: 'intermediate', label: `N(${gt})`, prompt: `Evaluate N(${gt}).`, traps: [{ value: ga + ga * gp / 100 * gt, code: 'add-percent', message: 'Multiply by the factor each month.' }], hints: H(`${gf}${sup(gt)}.`, `× ${ga}.`, 'Keep full precision.'), solution: `${num(model(ga, gp, gt))}.` });
  const T = X.growthTable, isExp = T.every((r, i) => i < 2 || Number(F(r[1]).div(F(T[i - 1][1]))) === Number(F(T[1][1]).div(F(T[0][1])))) && !T.every((r, i) => i < 2 || r[1] - T[i - 1][1] === T[1][1] - T[0][1]);
  out['fc-linexp'] = choice(`A campaign table: ${T.map(r => r[1].toLocaleString('en-US')).join(', ')}. Linear or exponential?`, isExp ? `Exponential: it multiplies by ${Number(F(T[1][1]).div(F(T[0][1])))} each month` : `Linear: it adds ${T[1][1] - T[0][1]} each month`, [[isExp ? 'Linear: it goes up each month' : 'Exponential: it goes up each month', 'linear-exponential', isExp ? 'The differences grow; the ratios stay the same.' : 'The differences stay the same.']], { ideas: ['lin-vs-exp'], level: 'intermediate', hints: H('Differences.', 'Ratios.', 'Which is constant?') });
  const [da, dp, dt] = X.decay, df = String(Number(factorOf(dp, -1))), C = firstPast(t => model(da, dp, t, -1), dt, -1);
  out['fd-model'] = exprQ('V =', `${da}(${df})^t`, ['t'], { ideas: ['decay-model'], level: 'intermediate', prompt: `A used e-MTB model: $${da.toLocaleString('en-US')}, losing ${dp}% of its modeled value a year. Write V(t).`, traps: [{ expr: `${da}(${dp / 100})^t`, code: 'rate-retention-swap', message: `Multiply by what’s kept: ${df}.` }, { expr: `${da} - ${da * dp / 100}t`, code: 'subtract-constant', message: 'That subtracts a fixed amount.' }], hints: H('Start.', 'Kept = 1 − rate.', 'a(factor)ᵗ.'), solution: `V(t) = ${da}(${df})ᵗ.` });
  out['fd-eval'] = numQ(model(da, dp, 2, -1), { ideas: ['decay-evaluate'], level: 'intermediate', label: 'V(2) ($)', prompt: 'Evaluate V(2).', traps: [{ value: da - 2 * da * dp / 100, code: 'subtract-constant', message: 'Multiply by the factor twice.' }], hints: H(`The factor is ${df}.`, `${df}² first.`, `Then × ${da}.`), solution: `${money(model(da, dp, 2, -1))}.` });
  out['fd-target'] = numQ(C.t, { ideas: ['target'], level: 'advanced', label: 'First year below', prompt: `Using a table, in which whole year does the modeled value first drop below $${dt.toLocaleString('en-US')}?`, traps: [{ value: C.t - 1, code: 'exact-crossing', message: `V(${C.t - 1}) = ${money(model(da, dp, C.t - 1, -1))} is still above.` }], hints: H('Make a table.', `Multiply by ${df} each year.`, 'Find the first value below.'), solution: `Year ${C.t}: ${money(model(da, dp, C.t, -1))}.` });
  return tidy(arrange(out));
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[RULE_PRACTICE, rulePractice, RULE_PRACTICE_IDS], [SCI_PRACTICE, sciPractice, SCI_PRACTICE_IDS], [GROWTH_PRACTICE, growthPractice, GROWTH_PRACTICE_IDS], [DECAY_PRACTICE, decayPractice, DECAY_PRACTICE_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const X = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...X[id].ideas])]; }
  return out;
}
export { sciTextToFrac };
