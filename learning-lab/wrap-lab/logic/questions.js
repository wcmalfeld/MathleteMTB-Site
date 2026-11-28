// Wrap Lab: every graded question. Expanded answers come from the kit's
// polynomial engine (expr.js / factor.js, exact), factored answers are
// verified by multiplying back (scripts/test-wrap-lab.mjs), and quadratics
// are factored by the kit's integer factor-pair search, which reports when
// no integer factorization exists. Three progressive hints each, a worked
// solution, and traps tagged with misconception codes.

import { polyOf, polyText, polyAscii, classify, factorQuadratic, quadText, quadAscii, gcfOf, gcfText } from '../../lesson-kit/factor.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const pick = (list, n) => list[((n % list.length) + list.length) % list.length];
const H = (a, b, c) => [a, b, c];
const T = s => s.replace(/\^(\d+)/g, (_, d) => d.split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c]).join('')).replace(/\*/g, '').replace(/-/g, '−');   // display: x^2 → x², - → −
const P = s => polyText(polyOf(s));                                   // expanded, as displayed
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object') continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { if (seen.has(t.value) || t.value === f.answer) return false; seen.add(t.value); return true; });
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
const choice = (prompt, right, wrongs, o = {}) => ({ type: 'choice', ideas: o.ideas, level: o.level || 'intermediate', prompt, fig: o.fig, keepOrder: o.keepOrder, inline: o.inline,
  options: [opt('a', right, true), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))], hints: o.hints, solution: o.solution || right + '.' });
const numQ = (answer, o) => ({ type: 'number', tolerance: 1e-9, ...o, answer });
// An expansion: the answer is the engine's simplified polynomial.
const ex = (src, o) => ({ type: 'expression', label: o.label || 'Simplified', answer: polyAscii(polyOf(src)), vars: o.vars || ['x'], form: 'simplified', ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt || `Expand and simplify ${T(src)}.`, traps: o.traps || [], tiles: o.tiles, hints: o.hints, solution: o.solution || `${T(src)} = ${P(src)}.`, src });
// A factorization: the answer must multiply back to the source (tested).
const fq = (src, answer, o) => ({ type: 'factored', label: o.label || 'Factored', answer, vars: o.vars || ['x'], ideas: o.ideas, level: o.level || 'intermediate', prompt: o.prompt || `Factor ${T(src)} completely.`, traps: o.traps || [], hints: o.hints, solution: o.solution || `${T(src)} = ${T(answer)}. Check: multiplying back gives ${P(answer)}.`, src });
const quadSrc = (a, b, c) => polyAscii(polyOf(`${a}*x^2 + (${b})*x + (${c})`));      // the engine writes it: x² − x − 12
const quad = (a, b, c, o = {}) => { const F = factorQuadratic(a, b, c), src = quadSrc(a, b, c); return fq(src, quadAscii(F), { ...o, solution: o.solution || `${P(src)} = ${quadText(F)}. Check: ${quadText(F)} multiplies back to ${P(src)}.` }); };

// Classification choices: degree name + term name, with the confusions as traps.
const NAMES = { 1: 'monomial', 2: 'binomial', 3: 'trinomial', 4: 'four terms' }, DEGS = ['constant', 'linear', 'quadratic', 'cubic'];
function classQ(src, o = {}) {
  const c = classify(src), right = `${DEGS[c.degree][0].toUpperCase() + DEGS[c.degree].slice(1)} ${c.termName}`;
  const wrongs = [];
  const altDeg = DEGS[Math.min(3, Math.max(0, c.terms))] || DEGS[1];
  if (altDeg !== DEGS[c.degree]) wrongs.push([`${altDeg[0].toUpperCase() + altDeg.slice(1)} ${c.termName}`, 'degree-terms', `The degree is the greatest exponent (${c.degree}), not the number of terms.`]);
  const altTerm = NAMES[c.terms === 1 ? 2 : c.terms - 1];   // always a different term count
  if (altTerm !== c.termName) wrongs.push([`${DEGS[c.degree][0].toUpperCase() + DEGS[c.degree].slice(1)} ${altTerm}`, 'degree-terms', `Count the terms: there ${c.terms === 1 ? 'is 1' : 'are ' + c.terms}.`]);
  const d2 = DEGS[(c.degree + 2) % 4];
  wrongs.push([`${d2[0].toUpperCase() + d2.slice(1)} ${c.termName}`, 'degree-wrong', `Find the term with the greatest exponent: its exponent is ${c.degree}.`]);
  return choice(`Classify the panel card ${T(src)}.`, right, wrongs.filter((w, i, a) => a.findIndex(x => x[0] === w[0]) === i && w[0] !== right).slice(0, 3), { ideas: ['classify'], level: o.level || 'beginner', hints: H('Degree: the greatest exponent of the variable.', 'Terms: the parts joined by + or −.', '1 term: monomial; 2: binomial; 3: trinomial.'), solution: `${T(src)}: degree ${c.degree} (${DEGS[c.degree]}), ${c.terms} term${c.terms === 1 ? '' : 's'} (${c.termName}).` });
}

export const IDEAS = {
  classify: 'Classifying polynomials by degree and terms', 'like-terms': 'Recognizing like terms', add: 'Adding polynomials', subtract: 'Subtracting polynomials (distributing the negative)',
  'mono-mult': 'Multiplying a monomial by a polynomial', binomial: 'Multiplying binomials', 'square-sum': 'The square of a sum', 'diff-squares-x': 'The difference-of-squares product', 'poly-mult': 'Multiplying polynomials with more terms',
  gcf: 'The greatest common factor', grouping: 'Factoring by grouping', verify: 'Checking a factorization by multiplying back',
  monic: 'Factoring x² + bx + c', 'non-monic': 'Factoring ax² + bx + c', 'perfect-square': 'Perfect-square trinomials', 'diff-squares': 'Factoring differences of squares', 'prime': 'Recognizing quadratics that don’t factor over the integers'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'addsub', name: 'Adding and Subtracting Polynomials', ideas: ['classify', 'like-terms', 'add', 'subtract'] },
  { id: 'mult', name: 'Multiplying Polynomials', ideas: ['mono-mult', 'binomial', 'square-sum', 'diff-squares-x', 'poly-mult'] },
  { id: 'factor', name: 'Factoring Expressions', ideas: ['gcf', 'grouping', 'verify'] },
  { id: 'quad', name: 'Factoring Quadratics', ideas: ['monic', 'non-monic', 'perfect-square', 'diff-squares', 'prime'] }
];
export const MISCONCEPTIONS = {
  'unlike-terms': 'Combining unlike terms',
  'add-exponents': 'Adding exponents when adding terms',
  'degree-wrong': 'Misidentifying the degree',
  'degree-terms': 'Confusing the degree with the number of terms',
  'not-polynomial': 'Calling an expression with a variable in a denominator a polynomial',
  'negative-first-only': 'Distributing the negative to only the first term',
  'added-instead': 'Adding instead of subtracting',
  'distribute-one': 'Multiplying only one term',
  'foil-missing': 'Leaving out products when multiplying binomials',
  'foil-add': 'Adding instead of multiplying the last terms',
  'square-no-middle': 'Forgetting the double middle term in a squared binomial',
  'single-middle': 'Using ab instead of 2ab for the middle term',
  'dos-sign': 'Getting the sign wrong in a difference of squares',
  'sum-of-squares': 'Factoring a sum of squares as a difference of squares',
  'partial-gcf': 'Taking out only part of the greatest common factor',
  'incomplete-gcf': 'Leaving a common factor inside a bracket',
  'grouping-no-common': 'Grouping terms that have no common binomial',
  'no-verify': 'Not multiplying back to check a factorization',
  'pair-sum-only': 'Choosing numbers that add correctly but don’t multiply to c',
  'pair-product-only': 'Choosing numbers that multiply correctly but don’t add to b',
  'non-monic-error': 'Factoring a non-monic trinomial as if a = 1',
  'always-factors': 'Assuming every quadratic factors over the integers',
  'not-fully-factored': 'Stopping before the factorization is complete',
  'middle-term': 'A factorization whose middle term doesn’t match',
  sign: 'A sign error',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Stage 01: Design the Protection Kit (adding and subtracting)
const M1 = {
  'cl-1': classQ('7x^3'), 'cl-2': classQ('3x^2 - 4x'), 'cl-3': classQ('x^2 + 5x + 6'), 'cl-4': classQ('-4x'), 'cl-5': classQ('9'), 'cl-6': classQ('2x^3 + 3x^2 + x + 8', { level: 'intermediate' }),
  'cl-np': choice('A card reads 3/x. Is it a polynomial?', 'No: a polynomial can’t have a variable in a denominator', [['Yes: a monomial', 'not-polynomial', '3/x is 3x⁻¹: polynomial exponents must be whole numbers 0, 1, 2…'], ['Yes: a constant', 'not-polynomial', 'It changes with x.']], { ideas: ['classify'], level: 'intermediate', hints: H('What’s in the denominator?', 'A variable.', 'Polynomials only use whole-number powers.') }),
  'ad-like': choice('Which pair are like terms?', '4x² and −7x²', [['4x² and 4x', 'unlike-terms', 'Like terms have the same variable and the same exponent.'], ['3x and 3', 'unlike-terms', 'One has x, one doesn’t.'], ['x³ and x²', 'unlike-terms', 'Different exponents.']], { ideas: ['like-terms'], level: 'beginner', hints: H('Same letter?', 'Same exponent?', 'The coefficients can differ.') }),
  'ad-1': ex('(3x^2 + 4x + 2) + (2x^2 + 5x + 1)', { ideas: ['add'], level: 'beginner', prompt: 'Top tube A(x) = 3x² + 4x + 2 and down tube B(x) = 2x² + 5x + 1. Find the total area A(x) + B(x).', traps: [{ expr: '17x^2', code: 'unlike-terms', message: 'Only like terms combine: x² with x², x with x, numbers with numbers.' }, { expr: '5x^4 + 9x^2 + 3', code: 'add-exponents', message: 'Adding like terms adds the coefficients; the exponent stays the same.' }],
    hints: H('Group the x² tiles, the x tiles and the unit tiles.', '3x² + 2x², then 4x + 5x, then 2 + 1.', '5x² + 9x + 3.') }),
  'ad-why': choice('Why can’t 5x² + 9x be combined into one term?', 'They aren’t like terms: x² and x are different sizes of tile', [['They can: 14x²', 'unlike-terms', 'x² and x are different powers.'], ['They can: 14x³', 'add-exponents', 'Adding never changes exponents.']], { ideas: ['like-terms'], level: 'beginner', hints: H('Compare the variable parts.', 'x² vs x.', 'Different.') }),
  'sb-1': ex('(8x^2 + 7x + 5) - (3x^2 + 2x + 1)', { ideas: ['subtract'], level: 'beginner', prompt: 'The stock S(x) = 8x² + 7x + 5. A batch uses U(x) = 3x² + 2x + 1. How much modeled material remains?', traps: [{ expr: '11x^2 + 9x + 6', code: 'added-instead', message: 'Remaining means subtract.' }],
    hints: H('Subtract like terms.', '8x² − 3x², 7x − 2x, 5 − 1.', '5x² + 5x + 4.') }),
  'nd-step': choice('(6x² + 5x + 2) − (2x² − 3x + 4). Which line distributes the negative correctly?', '6x² + 5x + 2 − 2x² + 3x − 4', [['6x² + 5x + 2 − 2x² − 3x + 4', 'negative-first-only', 'The minus applies to every term in the bracket: −(−3x) = +3x and −(+4) = −4.'], ['6x² + 5x + 2 + 2x² − 3x + 4', 'added-instead', 'The bracket is being subtracted.']], { ideas: ['subtract'], level: 'intermediate', hints: H('The minus multiplies every term inside.', '−(2x²) = −2x².', '−(−3x) = +3x; −(4) = −4.') }),
  'nd-1': ex('(6x^2 + 5x + 2) - (2x^2 - 3x + 4)', { ideas: ['subtract'], level: 'intermediate', prompt: 'Now simplify (6x² + 5x + 2) − (2x² − 3x + 4).', traps: [{ expr: '4x^2 + 2x + 6', code: 'negative-first-only', message: 'Distribute the negative to every term: −(−3x) is +3x and −(4) is −4.' }],
    hints: H('6x² + 5x + 2 − 2x² + 3x − 4.', '6x² − 2x² = 4x²; 5x + 3x = 8x.', '2 − 4 = −2.') }),
  'nd-2': ex('(5x^2 - 2x + 7) - (x^2 + 4x - 3)', { ideas: ['subtract'], level: 'advanced', prompt: 'A trimmed chainstay panel: (5x² − 2x + 7) − (x² + 4x − 3).', traps: [{ expr: '4x^2 + 2x + 4', code: 'negative-first-only', message: 'Every term changes sign: −4x and +3.' }],
    hints: H('Distribute the minus: −x² − 4x + 3.', '5x² − x²; −2x − 4x; 7 + 3.', '4x² − 6x + 10.') }),
  'kd-class': classQ('4x^2 + 6x', { level: 'intermediate' }),
  'kd-add': ex('(4x^2 + 6x) + (x^2 + 2x + 9)', { ideas: ['add'], level: 'intermediate', prompt: 'Kit job: seatstay panel 4x² + 6x plus logo patch x² + 2x + 9. Total?', traps: [{ expr: '5x^2 + 17x', code: 'unlike-terms', message: '9 has no x: it stays on its own.' }], hints: H('x² terms: 4 + 1.', 'x terms: 6 + 2.', 'The 9 stays.') }),
  'kd-sub': ex('(5x^2 + 8x + 9) - (2x^2 - x + 3)', { ideas: ['subtract'], level: 'advanced', prompt: 'A removed window section measures 2x² − x + 3. Subtract it from 5x² + 8x + 9.', traps: [{ expr: '3x^2 + 7x + 6', code: 'negative-first-only', message: '−(−x) = +x: 8x + x.' }], hints: H('Distribute: −2x² + x − 3.', '5x² − 2x²; 8x + x; 9 − 3.', '3x² + 9x + 6.') }),
  'kd-mean': choice('What does the 3 in 3x² + 9x + 6 tell the cutter?', 'The remaining material includes 3 large x-by-x squares’ worth of film', [['There are 3 panels', 'degree-terms', 'It’s the coefficient of x²: three x² tiles.'], ['The degree is 3', 'degree-wrong', 'The degree is 2.']], { ideas: ['classify'], level: 'intermediate', hints: H('Which term is it the coefficient of?', 'x².', 'Tiles of size x by x.') })
};
// [panel A, panel B] for practice: add them, then subtract B from A.
export const ADDSUB_PRACTICE = [['4x^2 + 3x - 2', 'x^2 - 5x + 6'], ['7x^2 - x + 4', '3x^2 + 2x - 5'], ['2x^3 + x^2 - 3', 'x^3 - 4x^2 + 2x'], ['6x^2 + 2x + 1', '-2x^2 + 7x - 4'], ['5x^2 - 8', '2x^2 - 3x - 8'], ['x^3 + 6x - 1', '3x^3 - 2x^2 + 6x']];
export const ADDSUB_IDS = ['dsx-add', 'dsx-sub'];
export function addsubPractice(n) {
  const [a, b] = pick(ADDSUB_PRACTICE, n), bt = b.split(/(?=[+-])/).map(t => t.trim()).filter(Boolean);
  // the classic slip: only the first term of the second panel changes sign
  const firstOnly = polyAscii(polyOf(`(${a}) - (${bt[0]}) + (${bt.slice(1).join(' ').replace(/^\+\s*/, '')})`));
  return tidy({ brief: `Panel cards ${n + 1}: ${T(a)} and ${T(b)}.`,
    'dsx-add': ex(`(${a}) + (${b})`, { ideas: ['add'], level: 'advanced', prompt: `Add the panels: (${T(a)}) + (${T(b)}).`, hints: H('Line up like terms.', 'Add their coefficients.', 'Keep each exponent.') }),
    'dsx-sub': ex(`(${a}) - (${b})`, { ideas: ['subtract'], level: 'advanced', prompt: `Subtract: (${T(a)}) − (${T(b)}).`, traps: [{ expr: firstOnly, code: 'negative-first-only', message: 'Change the sign of every term in the second bracket.' }], hints: H('Distribute the minus to every term.', 'Then combine like terms.', 'Check the constant.') }) });
}

// ================================================================ Stage 02: Expand the Graphics (multiplying)
const M2 = {
  'am-1': ex('(x + 3)(x + 4)', { ideas: ['binomial'], level: 'beginner', prompt: 'The area model: a panel x + 3 by x + 4. Its four regions are x², 4x, 3x and 12. What’s the total area?', traps: [{ expr: 'x^2 + 12', code: 'foil-missing', message: 'All four regions count: the two x-strips 4x and 3x too.' }, { expr: 'x^2 + 7x + 7', code: 'foil-add', message: 'The corner region is 3 × 4 = 12, not 3 + 4.' }],
    hints: H('Add the four regions.', 'x² + 4x + 3x + 12.', 'Combine the x terms.') }),
  'mm-1': ex('3x(2x + 5)', { ideas: ['mono-mult'], level: 'beginner', prompt: 'A film strip 3x wide covers a 2x + 5 run. Expand 3x(2x + 5).', traps: [{ expr: '6x^2 + 5', code: 'distribute-one', message: 'The 3x multiplies every term: 3x × 5 too.' }, { expr: '5x + 15x', code: 'add-exponents', message: '3x × 2x = 6x².' }], hints: H('3x × 2x.', '3x × 5.', '6x² + 15x.') }),
  'mm-2': ex('2x(x + 3)', { ideas: ['mono-mult'], level: 'beginner', traps: [{ expr: '2x^2 + 3', code: 'distribute-one', message: 'Multiply 2x by the 3 as well.' }], hints: H('2x × x.', '2x × 3.', '2x² + 6x.') }),
  'mm-3': ex('4x(2x + 1)', { ideas: ['mono-mult'], level: 'intermediate', traps: [{ expr: '8x^2 + 1', code: 'distribute-one', message: 'Multiply 4x by the 1 as well.' }], hints: H('4x × 2x.', '4x × 1.', '8x² + 4x.') }),
  'mm-4': ex('3a(a + 4)', { ideas: ['mono-mult'], vars: ['a'], level: 'intermediate', traps: [{ expr: '3a^2 + 4', code: 'distribute-one', message: 'Multiply 3a by 4 too.' }], hints: H('3a × a.', '3a × 4.', '3a² + 12a.') }),
  'bn-four': choice('Why does (x + 3)(x + 4) need four products?', 'Each term of the first factor multiplies each term of the second: 2 × 2 regions', [['Only the first and last terms matter', 'foil-missing', 'That would miss the 4x and 3x regions.'], ['Because there are four terms in the answer', 'foil-missing', 'There are four regions, but like terms combine to three terms.']], { ideas: ['binomial'], level: 'beginner', hints: H('Look at the area model.', 'It has two columns and two rows.', '2 × 2 = 4 regions.') }),
  'bn-2': ex('(x + 2)(x + 5)', { ideas: ['binomial'], level: 'intermediate', traps: [{ expr: 'x^2 + 10', code: 'foil-missing', message: 'Include the outer and inner products: 5x and 2x.' }, { expr: 'x^2 + 7x + 7', code: 'foil-add', message: '2 × 5 = 10.' }], hints: H('First: x · x.', 'Outer + inner: 5x + 2x.', 'Last: 2 · 5.') }),
  'bn-3': ex('(2x + 1)(x + 3)', { ideas: ['binomial'], level: 'advanced', traps: [{ expr: '2x^2 + 3', code: 'foil-missing', message: 'Include 6x and x.' }, { expr: '2x^2 + 4x + 3', code: 'foil-missing', message: 'The outer product is 2x × 3 = 6x, not 3x.' }], hints: H('2x · x = 2x².', '2x · 3 + 1 · x = 7x.', '1 · 3 = 3.') }),
  'sq-1': ex('(x + 4)^2', { ideas: ['square-sum'], level: 'intermediate', prompt: 'A square graphic, side x + 4. Expand (x + 4)².', traps: [{ expr: 'x^2 + 16', code: 'square-no-middle', message: 'The square has four regions: x², 4x, 4x and 16. Don’t lose the two 4x strips.' }, { expr: 'x^2 + 4x + 16', code: 'single-middle', message: 'There are two 4x strips: 2 × 4x = 8x.' }], hints: H('(x + 4)(x + 4).', 'Regions: x², 4x, 4x, 16.', 'x² + 8x + 16.') }),
  'sq-why': choice('Why is the middle term of (a + b)² equal to 2ab?', 'The square has two identical a-by-b strips', [['Because 2 is the exponent', 'single-middle', 'It comes from two regions, each ab.'], ['It isn’t: (a + b)² = a² + b²', 'square-no-middle', 'That misses both ab strips.']], { ideas: ['square-sum'], level: 'intermediate', hints: H('Draw the square’s four regions.', 'a², ab, ab, b².', 'Two ab strips.') }),
  'ds-1': ex('(x + 5)(x - 5)', { ideas: ['diff-squares-x'], level: 'intermediate', prompt: 'A square sheet x by x has a 5-by-5 square removed; rearranged, it’s (x + 5) by (x − 5). Expand (x + 5)(x − 5).', traps: [{ expr: 'x^2 + 25', code: 'dos-sign', message: '5 × (−5) = −25.' }, { expr: 'x^2 - 10x - 25', code: 'foil-missing', message: 'The middle products cancel: −5x + 5x = 0.' }], hints: H('First: x². Last: 5 × (−5).', 'Outer + inner: −5x + 5x.', 'They cancel.') }),
  'ds-fit': choice('Why does the cut-out picture need x > 5?', 'So the 5-by-5 square fits inside the x-by-x sheet', [['Because the algebra only works for x > 5', 'dos-sign', 'The identity works for every x; only the picture needs room.'], ['Because 5 is the degree', 'degree-wrong', 'It’s the side of the removed square.']], { ideas: ['diff-squares-x'], level: 'beginner', hints: H('Can you cut a 5 × 5 square from a 3 × 3 sheet?', 'No.', 'The picture needs x > 5.') }),
  'pg-cell': choice('In the grid for (x + 2)(x² + 3x + 4), what goes in the cell for 2 × 3x?', '6x', [['5x', 'foil-add', 'Multiply: 2 × 3x.'], ['6x²', 'add-exponents', '2 has no x, so the power stays 1.']], { ideas: ['poly-mult'], level: 'beginner', inline: true, hints: H('Multiply the row and column.', '2 × 3x.', '= 6x.') }),
  'pg-1': ex('(x + 2)(x^2 + 3x + 4)', { ideas: ['poly-mult'], level: 'advanced', traps: [{ expr: 'x^3 + 3x^2 + 4x + 2', code: 'distribute-one', message: 'The 2 multiplies every term too: 2x² + 6x + 8.' }, { expr: 'x^3 + 3x^2 + 4x + 8', code: 'distribute-one', message: 'Multiply 2 by every term of x² + 3x + 4.' }], hints: H('x(x² + 3x + 4) + 2(x² + 3x + 4).', 'x³ + 3x² + 4x + 2x² + 6x + 8.', 'Combine like terms.') }),
  'gx-err': choice('A designer wrote (x + 4)² = x² + 16 on a work order. What’s the fix?', 'x² + 8x + 16: they left out the two 4x strips', [['Nothing: it’s right', 'square-no-middle', 'Try x = 1: (1 + 4)² = 25, but 1 + 16 = 17.'], ['x² + 4x + 16', 'single-middle', 'There are two 4x strips.']], { ideas: ['square-sum'], level: 'intermediate', hints: H('Test with x = 1.', '25 vs 17.', 'Add the middle term.') }),
  'gx-miss': numQ(5, { ideas: ['binomial'], level: 'intermediate', label: 'Missing number', prompt: 'Missing product: (x + 3)(x + ?) = x² + 8x + 15.', traps: [{ value: 12, code: 'pair-sum-only', message: '3 × 12 = 36, not 15.' }, { value: 8, code: 'pair-product-only', message: '3 + ? must make 8, and 3 × ? must make 15.' }], hints: H('3 × ? = 15.', '3 + ? = 8.', '5.'), solution: '5: 3 × 5 = 15 and 3 + 5 = 8.' }),
  'gx-dos': ex('(2x + 3)(2x - 3)', { ideas: ['diff-squares-x'], level: 'advanced', traps: [{ expr: '4x^2 + 9', code: 'dos-sign', message: '3 × (−3) = −9.' }, { expr: '2x^2 - 9', code: 'distribute-one', message: '2x × 2x = 4x².' }], hints: H('(a + b)(a − b) = a² − b².', 'a = 2x, b = 3.', '4x² − 9.') })
};
export const EXPAND_PRACTICE = [['(x + 6)(x - 2)', '(x + 3)^2'], ['(3x + 2)(x + 4)', '(x - 7)(x + 7)'], ['(x - 5)(x - 1)', '(2x + 1)^2'], ['(2x - 3)(x + 5)', '(x - 6)^2'], ['(4x + 1)(x - 2)', '(3x + 4)(3x - 4)'], ['(x + 8)(x - 3)', '(x + 5)^2']];
export const EXPAND_IDS = ['exx-bin', 'exx-special'];
export function expandPractice(n) {
  const [a, b] = pick(EXPAND_PRACTICE, n), sq = /\^2$/.test(b);
  return tidy({ brief: `Graphics order ${n + 1}: two panels to expand.`,
    'exx-bin': ex(a, { ideas: ['binomial'], level: 'advanced', hints: H('Multiply every term by every term.', 'Four products.', 'Combine the like terms.') }),
    'exx-special': ex(b, { ideas: [sq ? 'square-sum' : 'diff-squares-x'], level: 'advanced', traps: sq ? [{ expr: (() => { const m = b.match(/\((.+) ([+-]) (\d+)\)\^2/); return `(${m[1]})^2 + ${m[3]}^2`; })(), code: 'square-no-middle', message: 'Squaring a binomial gives a middle term: 2ab.' }] : [], hints: H(sq ? '(a + b)² = a² + 2ab + b².' : '(a + b)(a − b) = a² − b².', 'Identify a and b.', 'Substitute.') }) });
}

// ================================================================ Stage 03: Optimize the Cut Sheets (factoring expressions)
const M3 = {
  'gc-1': numQ(6, { ideas: ['gcf'], level: 'beginner', label: 'GCF', prompt: 'The cut sheet 12x + 18: 12 x-sections and 18 unit sections. What is the greatest common factor of both terms?', traps: [{ value: 3, code: 'partial-gcf', message: '3 is a common factor, but not the greatest: 6 divides both.' }, { value: 2, code: 'partial-gcf', message: 'Not the greatest: 6 divides both.' }, { value: 12, code: 'partial-gcf', message: '12 doesn’t divide 18.' }], hints: H('Factors of 12: 1, 2, 3, 4, 6, 12.', 'Factors of 18: 1, 2, 3, 6, 9, 18.', 'The largest in both: 6.'), solution: 'GCF 6: six identical groups of 2x + 3.' }),
  'gc-1f': fq('12x + 18', '6(2x + 3)', { ideas: ['gcf'], level: 'beginner', traps: [{ expr: '6(2x + 18)', code: 'distribute-one', message: 'Divide both terms by 6: 18 ÷ 6 = 3.' }], hints: H('Take out 6.', '12x ÷ 6 = 2x.', '18 ÷ 6 = 3.') }),
  'gc-2': fq('6x^2 + 9x', '3x(2x + 3)', { ideas: ['gcf'], level: 'intermediate', hints: H('Numbers: GCF of 6 and 9 is 3.', 'Variables: both terms have at least one x.', 'Take out 3x.') }),
  'gc-3': fq('8x + 12', '4(2x + 3)', { ideas: ['gcf'], level: 'beginner', hints: H('GCF of 8 and 12.', '4.', '8x ÷ 4 and 12 ÷ 4.') }),
  'gc-4': fq('10x^2 + 15x', '5x(2x + 3)', { ideas: ['gcf'], level: 'intermediate', hints: H('GCF of 10 and 15: 5.', 'Both have x.', 'Take out 5x.') }),
  'gc-5': fq('12x^3 + 8x^2', '4x^2(3x + 2)', { ideas: ['gcf'], level: 'advanced', hints: H('GCF of 12 and 8: 4.', 'Smallest power of x: x².', 'Take out 4x².') }),
  'gc-6': fq('6a^2 + 12a', '6a(a + 2)', { ideas: ['gcf'], vars: ['a'], level: 'intermediate', hints: H('GCF of 6 and 12: 6.', 'Both have a.', 'Take out 6a.') }),
  'gc-check': ex('6x(2x + 3)', { ideas: ['verify'], level: 'beginner', prompt: 'Check the pattern: multiply 6x(2x + 3) back out.', traps: [{ expr: '12x^2 + 3', code: 'distribute-one', message: 'Multiply 6x by the 3 as well.' }], hints: H('6x × 2x.', '6x × 3.', '12x² + 18x.') }),
  'gp-1': choice('Grouping 3x + 6 + 2xy + 4y: what’s a good first step?', 'Group (3x + 6) + (2xy + 4y)', [['Group (3x + 2xy) + (6 + 4y)… and stop', 'grouping-no-common', 'That grouping also works (x(3 + 2y) + 2(3 + 2y)), but it needs finishing. Pairs that share a factor are the key.'], ['Add 3x and 2xy', 'unlike-terms', 'Those aren’t like terms.']], { ideas: ['grouping'], level: 'beginner', hints: H('Pair terms that share a factor.', '3x and 6 share 3.', '2xy and 4y share 2y.') }),
  'gp-2': choice('Factor each group of (3x + 6) + (2xy + 4y).', '3(x + 2) + 2y(x + 2)', [['3(x + 6) + 2y(x + 4)', 'distribute-one', 'Divide every term in the group by its factor: 6 ÷ 3 = 2.'], ['3x(1 + 2) + 2y(x + 2)', 'partial-gcf', 'The first group’s common factor is 3, not 3x.']], { ideas: ['grouping'], level: 'intermediate', hints: H('First group: 3.', 'Second group: 2y.', 'Both leave x + 2.') }),
  'gp-3': fq('3x + 6 + 2xy + 4y', '(x + 2)(3 + 2y)', { ideas: ['grouping'], vars: ['x', 'y'], level: 'intermediate', prompt: 'Finish: factor 3x + 6 + 2xy + 4y.', hints: H('3(x + 2) + 2y(x + 2).', 'The common binomial is (x + 2).', '(x + 2)(3 + 2y).') }),
  'gw-1': fq('x^2 + 5x + 3x + 15', '(x + 3)(x + 5)', { ideas: ['grouping'], level: 'intermediate', prompt: 'Grouping workshop: factor x² + 5x + 3x + 15.', hints: H('(x² + 5x) + (3x + 15).', 'x(x + 5) + 3(x + 5).', '(x + 3)(x + 5).') }),
  'gw-2': fq('2x^2 + 6x + 5x + 15', '(2x + 5)(x + 3)', { ideas: ['grouping'], level: 'intermediate', hints: H('(2x² + 6x) + (5x + 15).', '2x(x + 3) + 5(x + 3).', 'Common binomial: x + 3.') }),
  'gw-3': fq('3x^2 + 9x + 2x + 6', '(3x + 2)(x + 3)', { ideas: ['grouping'], level: 'intermediate', hints: H('(3x² + 9x) + (2x + 6).', '3x(x + 3) + 2(x + 3).', '(3x + 2)(x + 3).') }),
  'gw-4': fq('4x^2 + 8x + 3x + 6', '(4x + 3)(x + 2)', { ideas: ['grouping'], level: 'advanced', hints: H('(4x² + 8x) + (3x + 6).', '4x(x + 2) + 3(x + 2).', '(4x + 3)(x + 2).') }),
  'gw-none': choice('x² + 3x + 2x + 5 groups as x(x + 3) + (2x + 5). What does that tell you?', 'The groups have no common binomial, so this grouping doesn’t factor it', [['It factors as (x + 1)(x + 3) + 5', 'grouping-no-common', 'That’s not a product. The brackets must match to factor out.'], ['(x + 3)(2x + 5)', 'no-verify', 'Multiply back: that gives 2x² + 11x + 15.']], { ideas: ['grouping'], level: 'advanced', hints: H('Compare the brackets.', 'x + 3 and 2x + 5 differ.', 'No common binomial.') }),
  'ck-1': ex('(x + 3)(x + 5)', { ideas: ['verify'], level: 'beginner', prompt: 'Verify the grouping result: multiply (x + 3)(x + 5) back.', hints: H('Four products.', 'x² + 5x + 3x + 15.', 'x² + 8x + 15.'), solution: '(x + 3)(x + 5) = x² + 8x + 15 = x² + 5x + 3x + 15 ✓.' })
};
// GCF and grouping practice.
export const CUT_PRACTICE = [['14x^2 + 21x', '7x(2x + 3)', 'x^2 + 4x + 2x + 8', '(x + 2)(x + 4)'], ['9x^3 - 6x^2', '3x^2(3x - 2)', '2x^2 + 4x + 3x + 6', '(2x + 3)(x + 2)'], ['20x + 35', '5(4x + 7)', 'x^2 - 3x + 4x - 12', '(x + 4)(x - 3)'], ['18a^2 + 24a', '6a(3a + 4)', '3x^2 + 6x + x + 2', '(3x + 1)(x + 2)'], ['16x^2 - 8x', '8x(2x - 1)', '5x^2 + 10x + 2x + 4', '(5x + 2)(x + 2)'], ['15x^3 + 25x', '5x(3x^2 + 5)', 'x^2 + 7x - 2x - 14', '(x - 2)(x + 7)']];
export const CUT_IDS = ['csx-gcf', 'csx-group'];
export function cutPractice(n) {
  const [g, ga, q, qa] = pick(CUT_PRACTICE, n), v = /a/.test(g) ? 'a' : 'x';
  return { brief: `Cut sheet ${n + 1}: a common factor and a grouping job.`,
    'csx-gcf': fq(g, ga, { ideas: ['gcf'], vars: [v], level: 'advanced', hints: H('Greatest number in every coefficient.', 'Smallest power of the variable.', 'Divide every term by the GCF.') }),
    'csx-group': fq(q, qa, { ideas: ['grouping'], level: 'advanced', hints: H('Group the first two and the last two.', 'Factor each group.', 'Take out the common binomial.') }) };
}

// ================================================================ Stage 04: Reverse Engineer the Panel (factoring quadratics)
const M4 = {
  'rv-pair': choice('A panel’s area is x² + 7x + 12. Which pair multiplies to 12 and adds to 7?', '3 and 4', [['2 and 6', 'pair-product-only', '2 × 6 = 12, but 2 + 6 = 8.'], ['1 and 6', 'pair-sum-only', '1 + 6 = 7, but 1 × 6 = 6.'], ['5 and 2', 'pair-sum-only', '5 + 2 = 7, but 5 × 2 = 10.']], { ideas: ['monic'], level: 'beginner', hints: H('What two numbers multiply to make 12?', 'Those same two numbers need to add up to 7.', 'Try 3 and 4.') }),
  'rv-1': quad(1, 7, 12, { ideas: ['monic'], level: 'beginner', prompt: 'Recover the panel’s dimensions: factor x² + 7x + 12.', hints: H('What two numbers multiply to make 12?', 'Those same two numbers need to add up to 7.', 'Try 3 and 4.'), traps: [{ expr: '(x + 2)(x + 6)', code: 'pair-product-only', message: 'Multiply back: x² + 8x + 12. The pair must add to 7.' }] }),
  'fp-1': quad(1, 5, 6, { ideas: ['monic'], level: 'beginner', hints: H('Multiply to 6.', 'Add to 5.', '2 and 3.') }),
  'fp-2': quad(1, -1, -12, { ideas: ['monic'], level: 'intermediate', hints: H('Multiply to −12: one positive, one negative.', 'Add to −1.', '−4 and 3.') }),
  'fp-3': quad(1, -7, 12, { ideas: ['monic'], level: 'intermediate', hints: H('Multiply to +12 but add to −7: both negative.', 'Pairs: −1·−12, −2·−6, −3·−4.', '−3 and −4.') }),
  'fp-4': quad(1, 2, -15, { ideas: ['monic'], level: 'intermediate', hints: H('Multiply to −15.', 'Add to +2.', '5 and −3.') }),
  'nm-ac': numQ(6, { ideas: ['non-monic'], level: 'beginner', label: 'a × c', prompt: '2x² + 7x + 3 has a leading coefficient. First find a × c.', traps: [{ value: 3, code: 'non-monic-error', message: 'Multiply a by c: 2 × 3.' }, { value: 5, code: 'foil-add', message: 'Multiply, don’t add.' }], hints: H('a = 2, c = 3.', 'a × c.', '6.'), solution: 'a × c = 6.' }),
  'nm-split': choice('Which numbers multiply to 6 and add to 7, to split the middle term?', '6 and 1: 2x² + 6x + x + 3', [['3 and 4: 2x² + 3x + 4x + 3', 'pair-sum-only', '3 × 4 = 12, not 6.'], ['2 and 3: 2x² + 2x + 3x + 3', 'pair-product-only', '2 + 3 = 5, not 7.']], { ideas: ['non-monic'], level: 'intermediate', hints: H('Multiply to a × c = 6.', 'Add to b = 7.', '6 and 1.') }),
  'nm-1': quad(2, 7, 3, { ideas: ['non-monic'], level: 'intermediate', prompt: 'Now factor 2x² + 7x + 3.', traps: [{ expr: '(x + 1)(x + 3)', code: 'non-monic-error', message: 'With a = 2, one factor needs 2x: multiply back to check the x² term.' }, { expr: '(2x + 3)(x + 1)', code: 'middle-term', message: 'Multiply back: 2x² + 5x + 3.' }], hints: H('2x² + 6x + x + 3.', '2x(x + 3) + 1(x + 3).', '(2x + 1)(x + 3).') }),
  'nm-2': quad(3, 11, 6, { ideas: ['non-monic'], level: 'advanced', hints: H('a × c = 18; pair adding to 11: 9 and 2.', '3x² + 9x + 2x + 6.', '3x(x + 3) + 2(x + 3).') }),
  'nm-3': quad(2, 5, -3, { ideas: ['non-monic'], level: 'advanced', hints: H('a × c = −6; pair adding to 5: 6 and −1.', '2x² + 6x − x − 3.', '2x(x + 3) − 1(x + 3).') }),
  'ps-1': quad(1, 10, 25, { ideas: ['perfect-square'], level: 'intermediate', prompt: 'A square panel’s area is x² + 10x + 25. Factor it.', hints: H('Is x² a square? Is 25?', 'Is 10x twice x × 5?', '(x + 5)².') }),
  'ps-2': quad(1, -6, 9, { ideas: ['perfect-square'], level: 'intermediate', traps: [{ expr: '(x + 3)^2', code: 'sign', message: 'The middle term is −6x: (x − 3)².' }], hints: H('9 = 3².', '−6x = −2 · x · 3.', '(x − 3)².') }),
  'ps-id': choice('Which is a perfect-square trinomial?', 'x² + 12x + 36', [['x² + 12x + 35', 'always-factors', '35 isn’t a perfect square.'], ['x² + 6x + 36', 'single-middle', 'The middle would need to be 2 · 6 · x = 12x.']], { ideas: ['perfect-square'], level: 'intermediate', hints: H('Check whether the first and final terms are perfect squares.', 'Then see whether the middle term is twice their product.', '2 × x × 6 = 12x.') }),
  'dsq-1': quad(1, 0, -9, { ideas: ['diff-squares'], level: 'beginner', prompt: 'Factor x² − 9.', hints: H('x² and 9 are both squares.', 'a² − b² = (a + b)(a − b).', 'b = 3.') }),
  'dsq-2': quad(1, 0, -49, { ideas: ['diff-squares'], level: 'beginner', prompt: 'Factor x² − 49.', hints: H('49 = 7².', '(a + b)(a − b).', '(x + 7)(x − 7).') }),
  'dsq-3': quad(4, 0, -25, { ideas: ['diff-squares'], level: 'intermediate', prompt: 'Factor 4x² − 25.', traps: [{ expr: '(4x + 5)(4x - 5)', code: 'dos-sign', message: 'Multiply back: 16x² − 25. 4x² is (2x)².' }], hints: H('4x² = (2x)².', '25 = 5².', '(2x + 5)(2x − 5).') }),
  'dsq-4': quad(9, 0, -16, { ideas: ['diff-squares'], level: 'intermediate', prompt: 'Factor 9x² − 16.', hints: H('9x² = (3x)².', '16 = 4².', '(3x + 4)(3x − 4).') }),
  'dsq-sum': choice('Can x² + 25 be factored like x² − 25?', 'No: a sum of squares doesn’t factor over the integers', [['Yes: (x + 5)(x − 5)', 'sum-of-squares', 'Multiply back: that gives x² − 25.'], ['Yes: (x + 5)²', 'sum-of-squares', 'Multiply back: x² + 10x + 25.']], { ideas: ['diff-squares', 'prime'], level: 'advanced', hints: H('Multiply back each option.', '(x + 5)(x − 5) = x² − 25.', 'No integer pair multiplies to 25 and adds to 0.') }),
  'rc-1': quad(6, 1, -2, { ideas: ['non-monic'], level: 'advanced', prompt: 'Reverse-engineering challenge: factor 6x² + x − 2.', hints: H('a × c = −12; pair adding to 1: 4 and −3.', '6x² + 4x − 3x − 2.', '2x(3x + 2) − 1(3x + 2).') }),
  'rc-2': quad(1, 14, 49, { ideas: ['perfect-square'], level: 'intermediate', hints: H('49 = 7².', '14x = 2 · x · 7.', '(x + 7)².') }),
  'rc-3': quad(16, 0, -1, { ideas: ['diff-squares'], level: 'intermediate', hints: H('16x² = (4x)².', '1 = 1².', '(4x + 1)(4x − 1).') }),
  'rc-prime': choice('Factor x² + 3x + 5.', 'It doesn’t factor over the integers: no pair multiplies to 5 and adds to 3', [['(x + 1)(x + 5)', 'always-factors', 'Multiply back: x² + 6x + 5.'], ['(x + 2)(x + 1) + 3', 'grouping-no-common', 'That isn’t a product.']], { ideas: ['prime'], level: 'advanced', hints: H('Pairs multiplying to 5: 1 and 5, −1 and −5.', 'Sums: 6 and −6.', 'Neither is 3.') }),
  'rc-dims': choice('A rectangular panel has area x² + 9x + 20. What are its dimensions?', 'x + 4 by x + 5', [['x + 2 by x + 10', 'pair-product-only', '2 + 10 = 12, not 9.'], ['x + 9 by x + 20', 'pair-sum-only', 'Multiply back: x² + 29x + 180.']], { ideas: ['monic', 'verify'], level: 'intermediate', hints: H('Multiply to 20, add to 9.', '4 and 5.', 'Check: (x + 4)(x + 5) = x² + 9x + 20.') })
};
export const QUAD_PRACTICE = [[[1, 9, 14], [3, 10, 8]], [[1, -2, -24], [2, -1, -6]], [[1, -11, 28], [5, 13, 6]], [[1, 4, -21], [4, 4, -3]], [[1, -10, 16], [6, 7, 2]], [[1, 13, 40], [3, -4, -4]]];
export const QUAD_IDS = ['rvx-monic', 'rvx-nonmonic'];
export function quadPractice(n) {
  const [[a, b, c], [d, e, f]] = pick(QUAD_PRACTICE, n);
  return tidy({ brief: `Customer panel ${n + 1}: two areas to reverse-engineer.`,
    'rvx-monic': quad(a, b, c, { ideas: ['monic'], level: 'advanced', hints: H(`Multiply to ${c}.`, `Add to ${b}.`, 'Check by multiplying back.') }),
    'rvx-nonmonic': quad(d, e, f, { ideas: ['non-monic'], level: 'advanced', hints: H(`a × c = ${d * f}.`, `Find a pair with that product that adds to ${e}; split the middle term.`, 'Group and factor.') }) });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'design', n: 1, title: 'Design the Protection Kit', short: 'Protection Kit', minutes: '9–12', focus: 'Adding and Subtracting Polynomials', badge: 'Pattern Designer', blurb: 'Classify the panel cards, combine panel areas with algebra tiles, and subtract cut sections, distributing every negative.', graded: Object.keys(M1) },
  { id: 'expand', n: 2, title: 'Expand the Graphics', short: 'Expand the Graphics', minutes: '10–13', focus: 'Multiplying Polynomials', badge: 'Graphics Expansion Specialist', blurb: 'Expand panel dimensions with the area model, including squares of sums, differences of squares and bigger grids.', graded: Object.keys(M2) },
  { id: 'cutsheet', n: 3, title: 'Optimize the Cut Sheets', short: 'Optimize the Cut Sheets', minutes: '9–12', focus: 'Factoring Expressions', badge: 'Cut Sheet Optimizer', blurb: 'Find the greatest common factor, factor by grouping, and multiply back to check every cut sheet.', graded: Object.keys(M3) },
  { id: 'reverse', n: 4, title: 'Reverse Engineer the Panel', short: 'Reverse Engineer', minutes: '11–14', focus: 'Factoring Quadratics', badge: 'Master Pattern Engineer', blurb: 'Recover panel dimensions from area polynomials: factor pairs, leading coefficients, perfect squares and differences of squares.', graded: Object.keys(M4) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)) };

// ================================================================ Custom Frame Designer Certification
export const FINAL_SETS = [
  { cls: 'x^3 - 4x + 2', add: ['2x^2 + 3x - 1', 'x^2 - 5x + 4'], sub: ['7x^2 + x - 3', '2x^2 - 4x + 5'], mono: '5x(x - 4)', bin: '(x + 6)^2', poly: '(x - 1)(x^2 + 2x + 5)', gcf: ['9x^2 + 12x', '3x(3x + 4)'], group: ['x^2 + 6x + 2x + 12', '(x + 2)(x + 6)'], monic: [1, 3, -18], nonmonic: [2, 9, 4], special: [1, 0, -64], prime: [1, 4, 6, '(x + 1)(x + 6)', '(x + 2)(x + 3)'] },
  { cls: '6x^2 + 1', add: ['4x^2 - 2x + 6', '-x^2 + 7x - 2'], sub: ['5x^2 - 3x + 8', 'x^2 + 2x - 6'], mono: '4x(3x + 2)', bin: '(x + 7)(x - 7)', poly: '(x + 3)(x^2 - x + 2)', gcf: ['15x^3 + 10x^2', '5x^2(3x + 2)'], group: ['2x^2 + 8x + x + 4', '(2x + 1)(x + 4)'], monic: [1, -9, 20], nonmonic: [3, 7, 2], special: [1, -8, 16], prime: [1, 0, 16, '(x + 4)(x - 4)', '(x + 4)^2'] },
  { cls: '-2x', add: ['3x^2 + x + 5', '2x^2 - 6x - 1'], sub: ['6x^2 + 4x - 1', '3x^2 - x - 7'], mono: '2x(5x - 3)', bin: '(2x + 5)(x - 1)', poly: '(x + 1)(x^2 + 4x - 3)', gcf: ['24x + 36', '12(2x + 3)'], group: ['3x^2 + 3x + 2x + 2', '(3x + 2)(x + 1)'], monic: [1, 2, -35], nonmonic: [5, -3, -2], special: [9, 0, -25], prime: [2, 3, 4, '(2x + 1)(x + 4)', '(2x + 2)(x + 2)'] },
  { cls: '4x^3 + x^2 - x', add: ['x^2 + 9x - 3', '5x^2 - 4x + 3'], sub: ['8x^2 - 2x + 1', '5x^2 + 3x - 2'], mono: '6x(x + 7)', bin: '(x - 4)^2', poly: '(x - 2)(x^2 + x + 3)', gcf: ['8x^3 - 12x^2', '4x^2(2x - 3)'], group: ['x^2 - 4x + 5x - 20', '(x + 5)(x - 4)'], monic: [1, 12, 32], nonmonic: [4, 8, 3], special: [1, 14, 49], prime: [1, -2, 5, '(x - 1)(x - 5)', '(x + 1)(x - 5)'] }
];
export const FINAL_IDS = ['fa-class', 'fa-add', 'fa-sub', 'fb-mono', 'fb-bin', 'fb-poly', 'fc-gcf', 'fc-group', 'fd-monic', 'fd-nonmonic', 'fd-special', 'fd-prime'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
const qText = (a, b, c) => P(`${a}x^2 + ${b}x + ${c}`);
export function finalQuestions(roundNo) {
  const X = pick(FINAL_SETS, roundNo - 1), out = { set: X };
  out['fa-class'] = classQ(X.cls, { level: 'intermediate' });
  out['fa-add'] = ex(`(${X.add[0]}) + (${X.add[1]})`, { ideas: ['add'], level: 'intermediate', prompt: `Two panels: (${T(X.add[0])}) + (${T(X.add[1])}). Total area?`, hints: H('Group like terms.', 'Add coefficients.', 'Keep exponents.') });
  out['fa-sub'] = ex(`(${X.sub[0]}) - (${X.sub[1]})`, { ideas: ['subtract'], level: 'advanced', prompt: `Remaining material: (${T(X.sub[0])}) − (${T(X.sub[1])}).`, hints: H('Distribute the negative to every term.', 'Combine like terms.', 'Watch the constants.') });
  out['fb-mono'] = ex(X.mono, { ideas: ['mono-mult'], level: 'intermediate', hints: H('Multiply the monomial by each term.', 'Multiply coefficients, add exponents.', 'Two terms.') });
  out['fb-bin'] = ex(X.bin, { ideas: [/\^2/.test(X.bin) ? 'square-sum' : /\+ (\d+)\)\(x - \1\)/.test(X.bin) ? 'diff-squares-x' : 'binomial'], level: 'intermediate', hints: H('Every term times every term.', 'Four products.', 'Combine like terms.') });
  out['fb-poly'] = ex(X.poly, { ideas: ['poly-mult'], level: 'advanced', hints: H('Distribute each term of the binomial.', 'Six products.', 'Combine like terms.') });
  out['fc-gcf'] = fq(X.gcf[0], X.gcf[1], { ideas: ['gcf'], level: 'intermediate', hints: H('Greatest number.', 'Smallest power.', 'Factor it out.') });
  out['fc-group'] = fq(X.group[0], X.group[1], { ideas: ['grouping'], level: 'intermediate', hints: H('Group in pairs.', 'Factor each pair.', 'Common binomial.') });
  out['fd-monic'] = quad(...X.monic, { ideas: ['monic'], level: 'intermediate', hints: H('Multiply to c.', 'Add to b.', 'Check by expanding.') });
  out['fd-nonmonic'] = quad(...X.nonmonic, { ideas: ['non-monic'], level: 'advanced', hints: H('a × c.', 'Split the middle term.', 'Group.') });
  const sp = X.special, spIdea = sp[1] === 0 ? 'diff-squares' : 'perfect-square';
  out['fd-special'] = quad(...sp, { ideas: [spIdea], level: 'intermediate', hints: H(spIdea === 'diff-squares' ? 'Two squares, subtracted.' : 'First and last terms are squares.', spIdea === 'diff-squares' ? '(a + b)(a − b).' : 'Middle = 2ab?', 'Check by expanding.') });
  const [pa, pb, pc, w1, w2] = X.prime;
  out['fd-prime'] = choice(`Factor ${qText(pa, pb, pc)} over the integers, if you can.`, 'It doesn’t factor over the integers', [[T(w1), pb === 0 ? 'sum-of-squares' : 'always-factors', `Multiply back: ${P(w1)}. No integer pair works here.`], [T(w2), 'always-factors', `Multiply back: ${P(w2)}.`]], { ideas: ['prime'], level: 'advanced', hints: H('List the factor pairs of a × c.', 'Does any pair add to b?', 'If none does, there’s no integer factorization.'), w: [w1, w2] });
  return tidy(arrange(out));
}

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [list, fn, ids] of [[ADDSUB_PRACTICE, addsubPractice, ADDSUB_IDS], [EXPAND_PRACTICE, expandPractice, EXPAND_IDS], [CUT_PRACTICE, cutPractice, CUT_IDS], [QUAD_PRACTICE, quadPractice, QUAD_IDS]])
    for (let n = 0; n < list.length; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const X = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...X[id].ideas])]; }
  return out;
}
export { T as showPoly, P as expandText };
