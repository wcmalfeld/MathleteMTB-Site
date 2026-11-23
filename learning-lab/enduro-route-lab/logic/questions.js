// Enduro Route Intelligence Lab: every graded question. Answers come from
// the models (exact algebra in rational.js), never typed in by hand. Each has
// three progressive hints (concept, method, next step), a solution with its
// meaning in the race or survey model, and traps: anticipated wrong answers
// with a misconception code and a message.

import { CLOCK, clock, SPLIT, split, flowTime, techTime, splitQuadratic, PER_KM, SPEED_RATIO, CAL, SURVEY, WARNING, WHEEL, STUDIO, CUBE,
  CLOCK_PRACTICE, SPLIT_PRACTICE, SURVEY_PRACTICE, EXP_PRACTICE, FINAL_SETS, pick } from './models.js';
import { add, sub, mul, div, constant, ratHigh, simplify, features, evalAt, text, factoredRat, rationalRoots, sqrtExact, surdText, ratPow, nthRoot, show, high, ptext, Frac } from './rational.js';

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
const N = x => Number(x), r2 = x => Math.round(x * 100) / 100;
const minus = k => (k < 0 ? `+ ${-k}` : `− ${k}`);

export const IDEAS = {
  evaluate: 'Rational function evaluation',
  domain: 'Domain restrictions',
  simplify: 'Rational expression simplification',
  add: 'Rational expression addition',
  subtract: 'Rational expression subtraction',
  multiply: 'Rational expression multiplication',
  divide: 'Rational expression division',
  vertical: 'Vertical asymptotes',
  horizontal: 'Horizontal asymptotes',
  hole: 'Removable discontinuities',
  transform: 'Rational transformations',
  'rational-eq': 'Rational equation solving',
  context: 'Contextual interpretation',
  'radical-eval': 'Radical function evaluation',
  'radical-domain': 'Radical domain and range',
  'sqrt-graph': 'Square-root graphs',
  'cube-root': 'Cube-root graphs',
  'radical-transform': 'Radical transformations',
  exponents: 'Rational exponents',
  'radical-simplify': 'Simplifying radical expressions',
  'radical-eq': 'Solving radical equations',
  extraneous: 'Identifying extraneous solutions',
  'radical-model': 'Interpreting radical models',
  inverse: 'Inverse variation',
  slant: 'Slant asymptotes'
};
// The PRD's twenty-three tracked skills, in its order.
export const REPORT_IDEAS = ['evaluate', 'domain', 'simplify', 'add', 'subtract', 'multiply', 'divide', 'vertical', 'horizontal', 'hole', 'transform', 'rational-eq', 'context',
  'radical-eval', 'radical-domain', 'sqrt-graph', 'cube-root', 'radical-transform', 'exponents', 'radical-simplify', 'radical-eq', 'extraneous', 'radical-model'];

export const MISCONCEPTIONS = {
  'no-restriction': 'Forgetting denominator restrictions',
  'hole-asymptote': 'Confusing a hole with an asymptote',
  'bad-cancel': 'Simplifying rational expressions incorrectly (cancelling terms, not factors)',
  'add-denominators': 'Adding denominators instead of finding a common denominator',
  reciprocal: 'Multiplying by the wrong reciprocal when dividing',
  'ha-wrong': 'Misidentifying horizontal asymptotes',
  'excluded-check': 'Forgetting to check excluded values',
  'context-domain': 'Misinterpreting contextual domain restrictions',
  'radicand-negative': 'Forgetting that an even root needs a nonnegative radicand',
  'root-vs-square': 'Confusing square roots with square powers (√(a² + b²) isn’t a + b)',
  'exponent-notation': 'Confusing radical and rational exponent notation',
  'both-signs': 'Forgetting both signs when solving with a squared variable',
  'squaring-extraneous': 'Not realising squaring can introduce extraneous solutions',
  'no-verify': 'Failing to verify solutions in the original equation',
  'domain-range': 'Misidentifying domain and range',
  transform: 'Misunderstanding transformations',
  'inverse-direct': 'Treating an inverse relationship as direct or linear',
  units: 'Mixing up hours and minutes',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Mission 1: Beat the Clock
const TC = clock(), T = v => N(evalAt(TC, v));
const M1 = {
  'c-predict': { type: 'choice', ideas: ['inverse'], prompt: 'Same 6 km, higher average speed. What happens to the time?',
    options: [opt('a', 'It goes down: a fixed distance at a higher speed takes less time', true), opt('b', 'It goes up', false, 'inverse-direct', 'Faster riding covers the same distance sooner.'),
      opt('c', 'It stays the same: the distance hasn’t changed', false, 'inverse-direct', 'Time = distance ÷ speed, so speed matters.'), opt('d', 'It drops by the same amount for every 1 km/h', false, 'inverse-direct', 'Not linear: going 12 → 13 km/h saves far more than 30 → 31.')],
    hints: ['Time = distance ÷ speed.', 'Distance is fixed at 6 km.', 'Divide by a bigger number.'], solution: 'It decreases. Time and speed vary inversely: t = 6/v hours.' },
  'c-units': { type: 'choice', ideas: ['evaluate', 'context'], prompt: 'Why is the stage time written 6/v × 60 = 360/v?',
    options: [opt('a', '6/v is in hours; × 60 turns it into minutes', true), opt('b', 'There are 60 km in the stage', false, 'units', 'The stage is 6 km; 60 is minutes per hour.'), opt('c', 'The speed is in km per minute', false, 'units', 'v is km/h, so 6/v is hours.'), opt('d', 'To make the numbers whole', false, 'units', 'It’s a unit conversion, not a convenience.')],
    hints: ['What unit is 6 km ÷ v km/h?', 'Hours.', 'T is in minutes.'], solution: '6 km ÷ v km/h = 6/v hours = 360/v minutes. Add the 8-minute transition: T(v) = 8 + 360/v.' },
  'c-t18': { type: 'number', ideas: ['evaluate'], answer: T(18), tolerance: 0.01, unit: 'min', label: 'T(18)', prompt: 'T(v) = 8 + 360/v. What is the total elapsed time at 18 km/h?',
    traps: [{ value: 20, code: 'context-domain', message: 'That’s the riding part. Add the 8-minute transition.' }, { value: 8 + 18 / 360, code: 'arithmetic', message: '360 ÷ 18, not 18 ÷ 360.' }],
    hints: ['Substitute v = 18.', '360 ÷ 18 = 20.', 'Then add 8.'], solution: 'T(18) = 8 + 20 = 28 minutes.' },
  'c-double': { type: 'choice', ideas: ['inverse', 'context'], prompt: 'Average speed doubles from 12 to 24 km/h. What happens?',
    options: [opt('a', 'Stage time halves (30 → 15 min), but total time only drops from 38 to 23 min', true), opt('b', 'Total time halves, 38 → 19 min', false, 'inverse-direct', 'Only the 360/v part halves; the 8-minute transition doesn’t.'),
      opt('c', 'Stage time doubles', false, 'inverse-direct', 'Faster means less time.'), opt('d', 'Nothing: both are on the same stage', false, 'inverse-direct', 'Check the table: 38 min vs 23 min.')],
    hints: ['Look at the two parts separately.', '360/12 = 30, 360/24 = 15.', 'The 8 minutes never change.'], solution: 'The variable part is inversely proportional to v and halves; the fixed 8 minutes don’t, so the total doesn’t halve.' },
  'c-zero': { type: 'choice', ideas: ['domain'], prompt: 'Why is v = 0 excluded from T(v) = 8 + 360/v?',
    options: [opt('a', '360/0 is undefined: the denominator can’t be zero', true), opt('b', 'Because 8 + 360/0 = 8', false, 'no-restriction', 'Division by zero has no value at all.'), opt('c', 'It isn’t excluded', false, 'no-restriction', 'v is in the denominator.'), opt('d', 'Because speeds are whole numbers', false, 'context-domain', 'Speeds can be any positive number.')],
    hints: ['Where is v in the formula?', 'In a denominator.', 'What is 360 ÷ 0?'], solution: 'Division by zero is undefined, so v ≠ 0. (A rider at 0 km/h never finishes.)' },
  'c-domain': { type: 'choice', ideas: ['domain', 'context'], prompt: 'What is the contextual domain of the race model?',
    options: [opt('a', 'v > 0: (0, ∞)', true), opt('b', 'v ≠ 0: all speeds except zero', false, 'context-domain', 'That’s the algebraic domain. Negative speeds make no sense here.'), opt('c', '0 ≤ v ≤ 40', false, 'no-restriction', '0 is excluded, and 40 is only the slider’s limit.'), opt('d', 'v > 8', false, 'domain-range', '8 is the transition time, an output.')],
    hints: ['Algebra excludes v = 0.', 'What speeds make sense in a race?', 'Positive ones.'], solution: 'Domain (0, ∞): speed must be positive.' },
  'c-range': { type: 'choice', ideas: ['domain', 'context'], prompt: 'And the contextual range?',
    options: [opt('a', 'T > 8: (8, ∞)', true), opt('b', 'T > 0', false, 'ha-wrong', 'The transition always adds 8 minutes.'), opt('c', 'T ≥ 8', false, 'ha-wrong', '360/v is never 0, so T never equals 8.'), opt('d', 'v > 0', false, 'domain-range', 'That’s the domain (inputs).')],
    hints: ['Range: possible outputs.', '360/v is always positive.', 'So T is always more than 8.'], solution: 'Range (8, ∞): the elapsed time is always more than the fixed 8 minutes, and can be as close to 8 as you like at high speed.' },
  'c-vertical': { type: 'choice', ideas: ['vertical'], prompt: 'Where is the vertical asymptote?',
    options: [opt('a', 'v = 0', true), opt('b', 'T = 8', false, 'hole-asymptote', 'That’s horizontal.'), opt('c', 'v = 8', false, 'hole-asymptote', 'Set the denominator to zero.'), opt('d', 'There isn’t one', false, 'no-restriction', 'v → 0⁺ makes 360/v grow without bound.')],
    hints: ['Where is the function undefined?', 'Where the denominator is zero.', 'v = ?'], solution: 'v = 0. As v → 0⁺, T → ∞.' },
  'c-horizontal': { type: 'number', ideas: ['horizontal'], answer: 8, tolerance: 0.001, label: 'Horizontal asymptote T =', prompt: 'As v gets very large, T approaches what value?',
    traps: [{ value: 0, code: 'ha-wrong', message: '360/v → 0, but the 8 minutes stay.' }, { value: 360, code: 'ha-wrong', message: '360/v shrinks as v grows.' }],
    hints: ['What does 360/v do for huge v?', 'It approaches 0.', 'What’s left?'], solution: 'T = 8: only the fixed transition remains.' },
  'c-shift': { type: 'choice', ideas: ['transform', 'horizontal'], prompt: 'In T(v) = t₀ + 60D/v, what does changing t₀ do to the graph?',
    options: [opt('a', 'Shifts it vertically; the horizontal asymptote becomes T = t₀', true), opt('b', 'Shifts it horizontally', false, 'transform', 'Adding a constant outside moves it up or down.'), opt('c', 'Moves the vertical asymptote', false, 'transform', 'The denominator is still v.'), opt('d', 'Stretches it', false, 'transform', 'That’s D.')],
    hints: ['t₀ is added to the whole function.', 'Adding outside: vertical shift.', 'What does T approach now?'], solution: 'A vertical shift by t₀; the asymptote T = t₀ moves with it, v = 0 doesn’t.' },
  'c-stretch': { type: 'choice', ideas: ['transform'], prompt: 'And changing the distance D?',
    options: [opt('a', 'Vertically scales the reciprocal part 60D/v; both asymptotes stay', true), opt('b', 'Shifts the vertical asymptote to v = D', false, 'transform', 'D multiplies the numerator; the denominator is still v.'), opt('c', 'Changes the horizontal asymptote to T = D', false, 'ha-wrong', 'The asymptote is t₀.'), opt('d', 'Nothing', false, 'transform', 'A longer stage takes longer at every speed.')],
    hints: ['D is in the numerator.', 'Multiplying a function: vertical stretch.', 'Do the asymptotes move?'], solution: 'A vertical stretch of 60/v by D. Asymptotes stay at v = 0 and T = t₀.' },
  'c-solve': { type: 'number', ideas: ['rational-eq'], answer: 20, tolerance: 0.01, unit: 'km/h', label: 'Speed v', prompt: 'The team wants 26 minutes total. Solve 26 = 8 + 360/v.',
    traps: [{ value: 360 / 26, code: 'arithmetic', message: 'Subtract the 8 first: 18 = 360/v.' }, { value: 18, code: 'arithmetic', message: '18 is 360/v, the stage time. Solve for v.' }],
    hints: ['Subtract 8.', '18 = 360/v.', 'Multiply by v, divide by 18.'], solution: '18 = 360/v, so 18v = 360 and v = 20 km/h.' },
  'c-reasonable': { type: 'choice', ideas: ['context'], prompt: 'Why is 20 km/h a reasonable input for this model?',
    options: [opt('a', 'It’s positive, so it’s in the domain v > 0, and it’s a plausible average speed for the stage', true), opt('b', 'Because every answer from the equation is reasonable', false, 'excluded-check', 'Always check it against the domain.'), opt('c', 'Because 20 is less than 26', false, 'domain-range', 'Speed and time are different quantities.'), opt('d', 'It isn’t: speeds above 18 are excluded', false, 'context-domain', 'Only v ≤ 0 is excluded.')],
    hints: ['What’s the domain?', 'v > 0.', 'Does 20 fit?'], solution: '20 > 0, so it’s in the domain, and T(20) = 8 + 18 = 26 checks.' }
};
export function clockPractice(n) {
  const s = pick(CLOCK_PRACTICE, n), k = 60 * s.D, v = k / (s.target - s.t0);
  return tidy({
    brief: `Stage ${n + 1}: ${s.D} km timed, a ${s.t0}-minute transition, and a target of ${s.target} minutes.`, set: s, v,
    'cx-model': { type: 'choice', ideas: ['evaluate', 'context'], prompt: `Which function gives the total time T(v) in minutes?`,
      options: rot([opt('a', `T(v) = ${s.t0} + ${k}/v`, true), opt('b', `T(v) = ${s.t0} + ${s.D}/v`, false, 'units', `${s.D}/v is in hours; × 60 for minutes.`), opt('c', `T(v) = ${s.t0}v + ${k}`, false, 'inverse-direct', 'Time is distance ÷ speed.'), opt('d', `T(v) = ${k}/(v + ${s.t0})`, false, 'transform', 'The transition is added, not part of the denominator.')], n),
      hints: ['Time = distance ÷ speed.', `${s.D} ÷ v hours × 60.`, 'Add the transition.'], solution: `T(v) = ${s.t0} + ${k}/v.` },
    'cx-speed': { type: 'number', ideas: ['rational-eq'], answer: v, tolerance: 0.01, unit: 'km/h', label: 'Speed v', prompt: `What average speed gives exactly ${s.target} minutes?`,
      traps: [{ value: k / s.target, code: 'arithmetic', message: `Subtract the ${s.t0} minutes first.` }, { value: s.target - s.t0, code: 'arithmetic', message: 'That’s the stage time; solve for v.' }],
      hints: [`Subtract ${s.t0}.`, `${s.target - s.t0} = ${k}/v.`, `v = ${k} ÷ ${s.target - s.t0}.`], solution: `${s.target - s.t0} = ${k}/v → v = ${v} km/h (positive, so in the domain).` }
  });
}
export const CLOCK_PRACTICE_IDS = ['cx-model', 'cx-speed'];

// ================================================================ Mission 2: The Stage Timing Console
const S = SPLIT, ST = split(), STs = simplify(ST), FL = flowTime(), TE = techTime();
const SUBr = simplify(sub(FL, TE)), MULr = simplify(mul(PER_KM(), SPEED_RATIO())), DIVr = simplify(div(TE, FL)), CALf = features(CAL());
const SQ = splitQuadratic(S, S.target), SROOTS = rationalRoots(SQ).roots.map(x => x.r);
const M2 = {
  's-flow': { type: 'number', ideas: ['evaluate'], answer: N(evalAt(FL, 15)), tolerance: 0.01, unit: 'min', label: 'F(15)', prompt: 'Flow section: 2 km at v. F(v) = 120/v. How long at v = 15 km/h?',
    traps: [{ value: 4, code: 'units', message: '2 km is 120/v minutes, not 60/v.' }], hints: ['Substitute 15.', '120 ÷ 15.', 'Minutes.'], solution: '120/15 = 8 minutes.' },
  's-tech': { type: 'number', ideas: ['evaluate'], answer: N(evalAt(TE, 15)), tolerance: 0.01, unit: 'min', label: 'S(15)', prompt: 'Technical section: 1 km at v − 5. S(v) = 60/(v − 5). How long at v = 15?',
    traps: [{ value: 4, code: 'context-domain', message: 'The technical speed is v − 5 = 10, not 15.' }], hints: ['Technical speed: 15 − 5.', '60 ÷ 10.', 'Minutes.'], solution: '60/10 = 6 minutes.' },
  's-total': { type: 'number', ideas: ['evaluate', 'add'], answer: N(evalAt(ST, 15)), tolerance: 0.01, unit: 'min', label: 'T(15)', prompt: 'And the total, with the 8-minute transition?',
    traps: [{ value: 14, code: 'context-domain', message: 'Add the 8-minute transition.' }], hints: ['8 + F + S.', '8 + 8 + 6.', 'Minutes.'], solution: '8 + 8 + 6 = 22 minutes.' },
  's-domain': { type: 'choice', ideas: ['domain', 'context'], prompt: 'What speeds make physical sense for this model?',
    options: [opt('a', 'v > 5, so the technical speed v − 5 is positive', true), opt('b', 'v > 0', false, 'context-domain', 'At v = 3 the technical speed would be −2 km/h.'), opt('c', 'v ≠ 0 and v ≠ 5', false, 'context-domain', 'That’s the algebraic domain; speeds also have to be positive.'), opt('d', 'v ≥ 5', false, 'no-restriction', 'At v = 5 the technical speed is 0: undefined.')],
    hints: ['Both speeds must be positive.', 'v > 0 and v − 5 > 0.', 'Which is stricter?'], solution: 'v > 5. (Both v and v − 5 must be positive.)' },
  's-lcd': { type: 'choice', ideas: ['add'], prompt: 'To add 120/v + 60/(v − 5), what common denominator?',
    options: [opt('a', 'v(v − 5)', true), opt('b', '2v − 5', false, 'add-denominators', 'Denominators aren’t added; you need a common multiple.'), opt('c', 'v − 5', false, 'add-denominators', 'v doesn’t divide v − 5.'), opt('d', '180', false, 'add-denominators', 'Those are numerators.')],
    hints: ['Like fractions: least common multiple.', 'v and v − 5 share no factor.', 'Multiply them.'], solution: 'v(v − 5).' },
  's-combine': { type: 'fields', ideas: ['add'], prompt: '120(v − 5) + 60v simplifies to av + b. Enter a and b.',
    fields: [{ id: 'a', label: 'a (v)', answer: 180, tolerance: 0.001, traps: [{ value: 120, code: 'arithmetic', message: '120v + 60v.' }] }, { id: 'b', label: 'b', answer: -600, tolerance: 0.001, traps: [{ value: -5, code: 'arithmetic', message: 'Distribute: 120 × 5.' }, { value: 600, code: 'arithmetic', message: '120(v − 5) gives −600.' }] }],
    hints: ['Distribute 120.', '120v − 600 + 60v.', 'Combine the v terms.'], solution: '180v − 600, so 120/v + 60/(v − 5) = (180v − 600)/[v(v − 5)].' },
  's-simplified': { type: 'fields', ideas: ['add', 'simplify'], prompt: 'Include the 8: (8v(v − 5) + 180v − 600)/[v(v − 5)] = (av² + bv + c)/(v² − 5v). Enter a, b, c.',
    fields: high(STs.n).map((c, i) => ({ id: 'c' + i, label: ['a (v²)', 'b (v)', 'c'][i], answer: N(c), tolerance: 0.001, traps: i === 1 ? [{ value: 180, code: 'arithmetic', message: '8v(v − 5) also gives −40v: 180 − 40.' }, { value: 220, code: 'arithmetic', message: '8v(v − 5) = 8v² − 40v.' }] : i === 0 ? [{ value: 1, code: 'add-denominators', message: 'Write 8 as 8v(v − 5)/[v(v − 5)].' }] : [] })),
    hints: ['8 = 8v(v − 5)/[v(v − 5)].', '8v(v − 5) = 8v² − 40v.', 'Add 180v − 600.'], solution: `T(v) = ${text(STs)}: the same function, one fraction.` },
  's-restrict': { type: 'multi', ideas: ['domain', 'vertical'], prompt: 'Which values are excluded from the algebraic domain of T?',
    options: [opt('a', 'v = 0', true), opt('b', 'v = 5', true), opt('c', 'v = −5', false, 'no-restriction', 'Set v(v − 5) = 0.'), opt('d', 'v = 15', false, 'no-restriction', '15 is a speed we evaluated, and it’s fine.')],
    hints: ['Denominator v(v − 5).', 'Set it equal to zero.', 'Each factor.'], solution: 'v ≠ 0 and v ≠ 5.' },
  's-vertical': { type: 'choice', ideas: ['vertical'], prompt: 'The rational function’s vertical asymptotes are at…',
    options: [opt('a', 'v = 0 and v = 5 (nothing cancels)', true), opt('b', 'v = 5 only', false, 'no-restriction', 'The factor v is in the denominator too.'), opt('c', 'T = 8', false, 'hole-asymptote', 'That’s the horizontal one.'), opt('d', 'v = 0 only; v = 5 is a hole', false, 'hole-asymptote', 'A hole needs the factor to cancel with the numerator; (v − 5) doesn’t.')],
    hints: ['Excluded values where nothing cancels.', 'Does v or (v − 5) divide the numerator?', 'Check 8v² + 140v − 600 at 0 and 5.'], solution: 'v = 0 and v = 5: the numerator isn’t zero there (−600 and 500), so both are asymptotes.' },
  's-horizontal': { type: 'number', ideas: ['horizontal'], answer: N(features(ST).horizontal), tolerance: 0.001, label: 'Horizontal asymptote T =', prompt: 'Same degree top and bottom. Horizontal asymptote?',
    traps: [{ value: 0, code: 'ha-wrong', message: 'y = 0 is for a lower-degree numerator.' }, { value: 140, code: 'ha-wrong', message: 'Use the leading coefficients: 8 ÷ 1.' }], hints: ['Compare degrees.', 'Equal: ratio of leading coefficients.', '8v² ÷ v².'], solution: 'T = 8, the transition time again.' },
  's-context': { type: 'choice', ideas: ['context'], prompt: 'Which part of the full graph is a valid race scenario?',
    options: [opt('a', 'Only the branch with v > 5', true), opt('b', 'Every branch', false, 'context-domain', 'For v < 5 a speed is negative or zero.'), opt('c', 'The branch between 0 and 5', false, 'context-domain', 'There v − 5 < 0.'), opt('d', 'The branch with v < 0', false, 'context-domain', 'Negative speeds aren’t a race.')],
    hints: ['The graph has three branches.', 'Contextual domain: v > 5.', 'Pick that one.'], solution: 'Only v > 5. The other branches are valid algebra, not valid races.' },
  's-sub': { type: 'choice', ideas: ['subtract', 'simplify'], prompt: 'Compare the sections: F(v) − S(v) = 120/v − 60/(v − 5) = ?',
    options: [opt('a', '60(v − 10)/[v(v − 5)]', true), opt('b', '60/(2v − 5)', false, 'add-denominators', 'Subtract over a common denominator, not the denominators.'), opt('c', '60/[v(v − 5)]', false, 'add-denominators', 'Each numerator gets multiplied by the other denominator.'), opt('d', '(180v − 600)/[v(v − 5)]', false, 'arithmetic', 'That’s F + S. Subtracting gives 120v − 600 − 60v.')],
    hints: ['Common denominator v(v − 5).', '120(v − 5) − 60v.', '60v − 600 = 60(v − 10).'], solution: `F − S = ${factoredRat(SUBr)}.` },
  's-sub15': { type: 'number', ideas: ['subtract', 'evaluate'], answer: N(evalAt(SUBr, 15)), tolerance: 0.01, unit: 'min', label: 'F − S at 15', prompt: 'At v = 15, by how many minutes does the flow section exceed the technical one?',
    traps: [{ value: -2, code: 'arithmetic', message: 'F − S: 8 − 6.' }], hints: ['Substitute 15.', '60(5)/[15(10)].', '300/150.'], solution: '2 minutes (8 − 6).' },
  's-sub-why': { type: 'choice', ideas: ['context'], prompt: 'Why is F − S positive at 15 km/h, even though the flow section is faster?',
    options: [opt('a', 'The flow section is twice as long (2 km vs 1 km)', true), opt('b', 'Because speeds are positive', false, 'context-domain', 'Positive speeds alone don’t decide which is bigger.'), opt('c', 'Faster sections always take longer', false, 'inverse-direct', 'Not at the same distance.'), opt('d', 'It isn’t; it’s negative', false, 'arithmetic', '8 − 6 = +2.')],
    hints: ['Compare the distances.', '2 km at 15 vs 1 km at 10.', 'Distance matters as well as speed.'], solution: 'Twice the distance outweighs the 1.5× speed, so the flow section takes longer.' },
  's-mul': { type: 'choice', ideas: ['multiply', 'simplify'], prompt: 'P(v) = 60/v (min per km at flow speed), R(v) = v/(v − 5). P(v) · R(v) = ?',
    options: [opt('a', '60/(v − 5)', true), opt('b', '60v/(v − 5)', false, 'bad-cancel', 'The v on top cancels the v underneath.'), opt('c', '60/v²', false, 'reciprocal', 'Multiply tops and bottoms: 60 · v over v(v − 5).'), opt('d', '60/(v² − 5)', false, 'bad-cancel', 'v · (v − 5) = v² − 5v, and the v cancels.')],
    hints: ['Multiply numerators and denominators.', '60v / [v(v − 5)].', 'Cancel the common factor v.'], solution: `60v/[v(v − 5)] = ${text(MULr)} (v ≠ 0, v ≠ 5).` },
  's-mul-meaning': { type: 'choice', ideas: ['context', 'multiply'], prompt: 'What does 60/(v − 5) mean in the race?',
    options: [opt('a', 'Minutes per km at the technical-section speed', true), opt('b', 'Total time', false, 'context-domain', 'There’s no transition and only 1 km.'), opt('c', 'The speed difference', false, 'context-domain', 'It’s a time, not a speed.'), opt('d', 'Minutes per km at the flow speed', false, 'context-domain', 'That was P(v) = 60/v.')],
    hints: ['60 ÷ speed = minutes per km.', 'Which speed is v − 5?', 'The technical one.'], solution: 'Time per kilometre at v − 5: scaling by the speed ratio converts one pace into the other.' },
  's-div': { type: 'choice', ideas: ['divide', 'simplify'], prompt: 'How many times as long does the technical section take? S(v) ÷ F(v) = ?',
    options: [opt('a', 'v/[2(v − 5)]', true), opt('b', '2(v − 5)/v', false, 'reciprocal', 'That’s F ÷ S: flip the divisor, not the dividend.'), opt('c', '7200/[v(v − 5)]', false, 'reciprocal', 'Dividing means multiplying by the reciprocal, not multiplying the fractions.'), opt('d', '1/2', false, 'bad-cancel', 'v and v − 5 don’t cancel.')],
    hints: ['Divide = multiply by the reciprocal.', '60/(v − 5) × v/120.', '60/120 = 1/2.'], solution: `${factoredRat(DIVr)} = v/[2(v − 5)].` },
  's-div15': { type: 'number', ideas: ['divide', 'evaluate'], answer: N(evalAt(DIVr, 15)), tolerance: 0.001, label: 'S ÷ F at 15', prompt: 'Evaluate it at v = 15.',
    traps: [{ value: 4 / 3, code: 'reciprocal', message: 'That’s F ÷ S.' }], hints: ['15/[2(10)].', '15/20.', 'As a decimal.'], solution: '0.75: the technical section takes 75% as long (6 min vs 8 min).' },
  's-hole-simplify': { type: 'choice', ideas: ['simplify', 'hole'], prompt: 'Calibration diagnostic: C(v) = (v² − 25)/(v − 5). Simplify it.',
    options: [opt('a', 'v + 5, for v ≠ 5', true), opt('b', 'v + 5, for every v', false, 'excluded-check', 'The original is still undefined at v = 5.'), opt('c', 'v − 5', false, 'bad-cancel', 'v² − 25 = (v − 5)(v + 5).'), opt('d', 'v² − 5', false, 'bad-cancel', 'You can’t cancel terms, only factors.')],
    hints: ['Factor the numerator.', 'Difference of squares.', 'Cancel (v − 5), but remember it.'], solution: 'C(v) = (v − 5)(v + 5)/(v − 5) = v + 5 with v ≠ 5.' },
  's-hole': { type: 'fields', ideas: ['hole'], prompt: 'Where is the hole? Enter its coordinates.',
    fields: [{ id: 'x', label: 'v', answer: N(CALf.holes[0].x), tolerance: 0.001, traps: [{ value: -5, code: 'bad-cancel', message: 'The cancelled factor is (v − 5).' }] }, { id: 'y', label: 'C', answer: N(CALf.holes[0].y), tolerance: 0.001, traps: [{ value: 0, code: 'hole-asymptote', message: 'Use the simplified form: 5 + 5.' }] }],
    hints: ['The excluded value is v = 5.', 'Its height comes from the simplified form.', 'v + 5 at v = 5.'], solution: 'The hole is at (5, 10).' },
  's-hole-vs': { type: 'choice', ideas: ['hole', 'vertical'], prompt: 'Why is v = 5 a hole in C, but a vertical asymptote in T?',
    options: [opt('a', 'In C the factor (v − 5) cancels; in T it stays in the denominator', true), opt('b', 'C is a line', false, 'hole-asymptote', 'It’s a line because the factor cancelled: that’s the reason.'), opt('c', 'There’s no difference', false, 'hole-asymptote', 'One graph jumps to infinity; the other is missing a single point.'), opt('d', 'Holes happen at positive values only', false, 'hole-asymptote', 'Sign doesn’t matter.')],
    hints: ['Does the factor cancel?', 'In C: yes. In T: no.', 'Cancelled → hole; remaining → asymptote.'], solution: 'A factor that cancels leaves a hole; one that stays in the denominator makes a vertical asymptote.' },
  's-eq': { type: 'fields', ideas: ['rational-eq'], prompt: 'Target 22 min: 8 + 120/v + 60/(v − 5) = 22. Clear fractions and write it as av² + bv + c = 0 (a = 7).',
    fields: high(SQ).map((c, i) => ({ id: 'q' + i, label: ['a', 'b', 'c'][i], answer: N(c) / 2, tolerance: 0.001, traps: i === 1 ? [{ value: -125 * 2, code: 'arithmetic', message: 'Divide the whole equation by 2.' }] : [] })),
    hints: ['Subtract 8: 120/v + 60/(v − 5) = 14.', 'Multiply by v(v − 5): 120(v − 5) + 60v = 14v(v − 5).', 'Collect on one side and divide by 2.'], solution: '7v² − 125v + 300 = 0.' },
  's-roots': { type: 'fields', ideas: ['rational-eq'], prompt: 'Factor: (v − 15)(7v − 20) = 0. Enter both candidates, smaller first.',
    fields: SROOTS.map((r, i) => ({ id: 'r' + i, label: 'Candidate ' + (i + 1), answer: N(r), tolerance: 0.005, traps: [{ value: -N(r), code: 'arithmetic', message: 'Check the sign.' }] })),
    hints: ['Set each factor to zero.', 'v − 15 = 0, 7v − 20 = 0.', '20/7 ≈ 2.86.'], solution: 'v = 20/7 ≈ 2.86 and v = 15.' },
  's-reject': { type: 'choice', ideas: ['domain', 'context', 'rational-eq'], prompt: 'Which candidate is the answer?',
    options: [opt('a', 'v = 15; 20/7 is rejected because v − 5 would be negative', true), opt('b', 'Both', false, 'excluded-check', 'Check each against v > 5.'), opt('c', 'v = 20/7', false, 'context-domain', 'At 20/7 the technical speed is about −2.1 km/h.'), opt('d', 'Neither', false, 'excluded-check', '15 > 5, and T(15) = 22 checks.')],
    hints: ['The domain is v > 5.', 'Is 20/7 > 5?', 'Check 15 in the original.'], solution: 'v = 15 km/h. 20/7 solves the algebra but makes the technical speed negative.' }
};
export function splitPractice(n) {
  const s = pick(SPLIT_PRACTICE, n), a = 60 * s.d1, b = 60 * s.d2, target = s.t0 + a / s.v + b / (s.v - s.diff), Q0 = splitQuadratic(s, target), g = high(Q0).map(c => Math.abs(N(c))).reduce((x, y) => { while (y) [x, y] = [y, x % y]; return x; }), Qd = Q0.map(c => c.div(g)), roots = rationalRoots(Qd).roots.map(x => x.r), other = roots.find(r => !r.eq(s.v));
  const ftxt = `${s.t0} + ${a}/v + ${b}/(v − ${s.diff})`;
  return tidy({
    brief: `Course ${n + 1}: ${s.d1} km of flow at v km/h, ${s.d2} km of technical at v − ${s.diff} km/h, and a ${s.t0}-minute transition. Target: ${show(Frac.of(target))} minutes.`, set: s, target, roots,
    'sx-model': { type: 'choice', ideas: ['context', 'add'], prompt: 'Which function gives the total time T(v)?',
      options: rot([opt('a', `T(v) = ${ftxt}`, true), opt('b', `T(v) = ${s.t0} + ${a + b}/(2v − ${s.diff})`, false, 'add-denominators', 'Each section gets its own fraction.'), opt('c', `T(v) = ${s.t0} + ${s.d1}/v + ${s.d2}/(v − ${s.diff})`, false, 'units', 'Convert hours to minutes: × 60.'), opt('d', `T(v) = ${s.t0} + ${a}/v + ${b}/(v + ${s.diff})`, false, 'context-domain', `The technical speed is v − ${s.diff}.`)], n),
      hints: ['Time = 60 × distance ÷ speed (minutes).', `Flow: ${a}/v. Technical: ${b}/(v − ${s.diff}).`, 'Add the transition.'], solution: `T(v) = ${ftxt}, with v > ${s.diff}.` },
    'sx-quad': { type: 'fields', ideas: ['rational-eq'], prompt: `Set T(v) = ${show(Frac.of(target))}, multiply by v(v − ${s.diff}), and write it as av² + bv + c = 0 in lowest terms, with a = ${N(high(Qd)[0])}.`,
      fields: high(Qd).map((c, i) => ({ id: 'q' + i, label: ['a', 'b', 'c'][i], answer: N(c), tolerance: 0.001, traps: [{ value: -N(c), code: 'arithmetic', message: 'Check the sign when you collect terms.' }] })),
      hints: [`Subtract ${s.t0}: ${a}/v + ${b}/(v − ${s.diff}) = ${show(Frac.of(target - s.t0))}.`, `${a}(v − ${s.diff}) + ${b}v = ${show(Frac.of(target - s.t0))}v(v − ${s.diff}).`, 'Move everything to one side, then divide by any common factor.'], solution: `${high(Qd).map(String).join(', ')}.` },
    'sx-v': { type: 'number', ideas: ['rational-eq', 'domain'], answer: s.v, tolerance: 0.01, unit: 'km/h', label: 'Valid speed v', prompt: 'Solve it. Which speed is valid?',
      traps: other ? [{ value: N(other), code: 'excluded-check', message: `Check it against v > ${s.diff}.` }] : [], hints: ['Factor or use the formula.', 'Two candidates.', `Keep the one above ${s.diff}.`], solution: `v = ${s.v} km/h; ${other ? show(other) : ''} is rejected.` },
    'sx-reject': { type: 'choice', ideas: ['domain', 'context'], prompt: `Why is the other candidate, ${other ? show(other) : ''}, rejected?`, keepOrder: true,
      options: [opt('a', `It’s below ${s.diff}, so the technical speed v − ${s.diff} would be negative`, true), opt('b', 'Because it isn’t a whole number', false, 'context-domain', 'Speeds don’t have to be whole numbers.'), opt('c', 'Because it makes T negative', false, 'excluded-check', 'The issue is the speed, not the time.'), opt('d', 'It isn’t; both are valid', false, 'excluded-check', `Check v − ${s.diff}.`)],
      hints: ['Contextual domain?', `v > ${s.diff}.`, 'Compare.'], solution: `It fails v > ${s.diff}: the technical speed would be ${other ? show(other.sub(s.diff)) : ''} km/h.` }
  });
}
export const SPLIT_PRACTICE_IDS = ['sx-model', 'sx-quad', 'sx-v', 'sx-reject'];

// ================================================================ Mission 3: Survey the Line
const SV = SURVEY, D16 = sqrtExact(SV.run * SV.run + SV.h * SV.h), H122 = Math.sqrt(SV.measured ** 2 - SV.run ** 2);
const M3 = {
  'u-pyth': { type: 'choice', ideas: ['radical-model'], prompt: 'Run a, elevation difference b, straight-line distance c. Which gives c?',
    options: [opt('a', 'c = √(a² + b²)', true), opt('b', 'c = a + b', false, 'root-vs-square', 'Distances in a right triangle don’t simply add.'), opt('c', 'c = a² + b²', false, 'root-vs-square', 'That’s c², not c.'), opt('d', 'c = √a + √b', false, 'root-vs-square', 'The root goes over the whole sum.')],
    hints: ['Pythagoras: a² + b² = c².', 'Solve for c.', 'Take the square root.'], solution: 'c = √(a² + b²): the direct distance between survey points (not the winding trail length).' },
  'u-model': { type: 'choice', ideas: ['radical-model'], prompt: 'Run fixed at 120 m, signed elevation difference h. Which is D(h)?',
    options: [opt('a', 'D(h) = √(14400 + h²)', true), opt('b', 'D(h) = 120 + h', false, 'root-vs-square', '√(a² + b²) isn’t a + b.'), opt('c', 'D(h) = √14400 + h', false, 'root-vs-square', 'The root covers both terms.'), opt('d', 'D(h) = √(120 + h²)', false, 'root-vs-square', 'Square the run: 120² = 14400.')],
    hints: ['a = 120, b = h.', '120² = 14400.', 'Root of the sum.'], solution: 'D(h) = √(120² + h²) = √(14400 + h²).' },
  'u-domain': { type: 'choice', ideas: ['radical-domain'], prompt: 'What is the domain of D(h) = √(14400 + h²)?',
    options: [opt('a', 'All real numbers: 14400 + h² is never negative', true), opt('b', 'h ≥ 0', false, 'domain-range', 'h is signed: negative means downhill.'), opt('c', 'h ≥ −120', false, 'radicand-negative', 'h² is never negative, so any h works.'), opt('d', 'h ≥ 120', false, 'domain-range', '120 is the smallest output.')],
    hints: ['When is the radicand negative?', 'h² ≥ 0.', 'So 14400 + h² ≥ 14400.'], solution: '(−∞, ∞). (In this model h is from −60 to 60, but the function accepts any h.)' },
  'u-range': { type: 'choice', ideas: ['radical-domain'], prompt: 'And its range?',
    options: [opt('a', '[120, ∞): the direct distance is never less than the run', true), opt('b', '[0, ∞)', false, 'domain-range', 'The smallest value is at h = 0: √14400.'), opt('c', '(120, ∞)', false, 'domain-range', 'At h = 0, D = 120 exactly.'), opt('d', 'All real numbers', false, 'domain-range', 'A square root is never negative.')],
    hints: ['Smallest radicand?', '14400 at h = 0.', '√14400 = 120.'], solution: '[120, ∞). D(0) = 120: on flat ground the direct distance is the run.' },
  'u-symmetric': { type: 'choice', ideas: ['radical-model', 'sqrt-graph'], prompt: 'Why is D(−20) the same as D(20)?',
    options: [opt('a', '(−20)² = 20²: uphill and downhill by the same amount give the same triangle', true), opt('b', 'It isn’t: downhill is shorter', false, 'root-vs-square', 'Squaring removes the sign.'), opt('c', 'Because distances are rounded', false, 'arithmetic', 'They’re exactly equal.'), opt('d', 'Because √ ignores negatives', false, 'radicand-negative', 'It’s the h² inside that makes them equal.')],
    hints: ['Look at h².', '(−20)² = 400.', 'Same radicand.'], solution: 'h appears only as h², so the graph is symmetric about h = 0.' },
  'u-exact': { type: 'fields', ideas: ['radical-simplify', 'radical-eval'], prompt: 'D(16) = √14656. Simplify to a√b (b with no square factors).',
    fields: [{ id: 'a', label: 'a', answer: N(D16.coef), tolerance: 0.001, traps: [{ value: 4, code: 'arithmetic', message: '14656 = 64 × 229, and √64 = 8.' }, { value: 2, code: 'arithmetic', message: 'Keep taking out square factors: 64 = 8².' }] }, { id: 'b', label: 'b', answer: D16.rad, tolerance: 0.001, traps: [{ value: 916, code: 'arithmetic', message: '916 = 4 × 229 still has a square factor.' }, { value: 3664, code: 'arithmetic', message: '3664 = 16 × 229 still has a square factor.' }] }],
    hints: ['Find the largest square factor of 14656.', 'Try 64: 14656 ÷ 64.', '√(64 × 229) = 8√229.'], solution: `√14656 = ${surdText(D16)}.` },
  'u-approx': { type: 'number', ideas: ['radical-eval'], answer: r2(D16.value), tolerance: 0.01, unit: 'm', label: 'D(16)', prompt: 'To two decimal places?',
    traps: [{ value: 136, code: 'root-vs-square', message: '√(120² + 16²) isn’t 120 + 16.' }, { value: 14656, code: 'root-vs-square', message: 'Take the square root.' }], hints: ['8 × √229.', '√229 ≈ 15.133.', 'Round to 0.01.'], solution: 'D(16) ≈ 121.06 m: exact 8√229, decimal 121.06.' },
  'u-grade': { type: 'number', ideas: ['radical-model'], answer: r2(SV.h / SV.run * 100), tolerance: 0.01, unit: '%', label: 'Grade', prompt: 'Grade = elevation change ÷ horizontal run × 100. What’s the grade for h = 16?',
    traps: [{ value: r2(16 / D16.value * 100), code: 'arithmetic', message: 'Divide by the run (120), not the direct distance.' }, { value: 0.13, code: 'arithmetic', message: '× 100 for a percentage.' }],
    hints: ['16 ÷ 120.', '≈ 0.1333.', '× 100.'], solution: '13.33%. Grade is steepness; D is distance: different questions.' },
  'u-solve': { type: 'fields', ideas: ['radical-eq', 'extraneous'], prompt: 'A direct measurement of 122 m: √(14400 + h²) = 122. Enter both solutions, smaller first.',
    fields: [-H122, H122].map((v, i) => ({ id: 'h' + i, label: 'h' + (i + 1), answer: v, tolerance: 0.001, traps: [{ value: 2, code: 'root-vs-square', message: '122 − 120 isn’t the elevation change.' }, { value: -v, code: 'both-signs', message: 'Two solutions: ±22. Put the negative first.' }] })),
    hints: ['Square both sides.', '14400 + h² = 14884.', 'h² = 484: both signs.'], solution: 'h = −22 or h = 22 (both check).' },
  'u-both': { type: 'choice', ideas: ['radical-model', 'extraneous'], prompt: 'Are both solutions valid?',
    options: [opt('a', 'Yes: +22 m means the destination is higher, −22 m lower; the measurement can’t tell which', true), opt('b', 'Only +22: elevation can’t be negative', false, 'both-signs', 'h is signed: negative is downhill.'), opt('c', 'Only −22', false, 'both-signs', 'Both give √14884 = 122.'), opt('d', 'Neither: squaring makes them extraneous', false, 'squaring-extraneous', 'Check them: both satisfy the original.')],
    hints: ['Check each in the original.', '√(14400 + 484) = 122 for both.', 'What does the sign mean?'], solution: 'Both. The sign is direction, which the distance alone can’t determine.' },
  'u-warning': { type: 'number', ideas: ['radical-eq'], answer: -3, tolerance: 0.001, label: 'Candidate r', prompt: 'A console warning: √(r² + 16) = r − 2. Square both sides and solve for r.',
    traps: [{ value: 3, code: 'arithmetic', message: '12 = −4r.' }, { value: 5, code: 'arithmetic', message: 'r² + 16 = r² − 4r + 4.' }],
    hints: ['(r − 2)² = r² − 4r + 4.', 'The r² terms cancel.', '16 = −4r + 4.'], solution: 'r² + 16 = r² − 4r + 4 → 12 = −4r → r = −3.' },
  'u-check': { type: 'choice', ideas: ['extraneous'], prompt: 'Check r = −3 in the original equation.',
    options: [opt('a', '√25 = 5 but −3 − 2 = −5: it’s extraneous, so there’s no solution', true), opt('b', 'It checks: r = −3', false, 'no-verify', 'Left side 5, right side −5.'), opt('c', 'It’s valid because squaring is reversible', false, 'squaring-extraneous', '5² = (−5)², so squaring hides the sign.'), opt('d', 'r = 3 instead', false, 'no-verify', '√25 = 5 and 3 − 2 = 1.')],
    hints: ['Substitute −3 on both sides.', 'Left: √(9 + 16).', 'Right: −3 − 2.'], solution: 'The candidate is extraneous. A square root is never negative, so no r makes √(r² + 16) equal to a negative r − 2 (and a diagonal can’t be shorter than the run).' },
  'u-why': { type: 'choice', ideas: ['extraneous', 'radical-eq'], prompt: 'Why can squaring both sides create a false candidate?',
    options: [opt('a', 'Squaring makes 5 and −5 look the same (both give 25)', true), opt('b', 'Squaring is an arithmetic mistake', false, 'squaring-extraneous', 'It’s a valid step; it just isn’t reversible.'), opt('c', 'Square roots can be negative', false, 'radicand-negative', 'The principal square root is never negative.'), opt('d', 'It can’t', false, 'squaring-extraneous', 'r = −3 just showed it can.')],
    hints: ['Square 5 and −5.', 'Same result.', 'So information is lost.'], solution: 'Squaring loses the sign, so a solution of the squared equation may not solve the original: always check.' }
};
export function surveyPractice(n) {
  const s = pick(SURVEY_PRACTICE, n), h = Math.sqrt(s.D * s.D - s.run * s.run);
  return tidy({
    brief: `Survey ${n + 1}: horizontal run ${s.run} m, direct distance measured as ${s.D} m.`, set: s, h,
    'ux-h': { type: 'fields', ideas: ['radical-eq'], prompt: `Solve √(${s.run * s.run} + h²) = ${s.D}. Enter both elevation differences, smaller first.`,
      fields: [-h, h].map((v, i) => ({ id: 'h' + i, label: 'h' + (i + 1), answer: v, tolerance: 0.001, traps: [{ value: s.D - s.run, code: 'root-vs-square', message: 'Square both sides; don’t just subtract.' }, { value: -v, code: 'both-signs', message: 'Both signs: put the negative first.' }] })),
      hints: ['Square both sides.', `h² = ${s.D * s.D} − ${s.run * s.run}.`, 'Both signs.'], solution: `h = ±${h} m.` },
    'ux-grade': { type: 'number', ideas: ['radical-model'], answer: r2(h / s.run * 100), tolerance: 0.01, unit: '%', label: 'Grade (uphill)', prompt: 'If it’s uphill, what is the grade?',
      traps: [{ value: r2(h / s.D * 100), code: 'arithmetic', message: 'Divide by the run, not the direct distance.' }], hints: ['Elevation ÷ run.', `${h} ÷ ${s.run}.`, '× 100.'], solution: `${r2(h / s.run * 100)}%.` }
  });
}
export const SURVEY_PRACTICE_IDS = ['ux-h', 'ux-grade'];

// ================================================================ Mission 4: Wheel Geometry Lab
const R = WHEEL.R, R2 = Frac.of(R).mul(Frac.of(R)), W30 = sqrtExact(R2.sub(Frac.of(WHEEL.x).mul(Frac.of(WHEEL.x)))), X30 = sqrtExact(R2.sub(Frac.of(WHEEL.height).mul(Frac.of(WHEEL.height))));
const M4 = {
  'w-radicand': { type: 'choice', ideas: ['radical-domain'], prompt: 'W(x) = √(0.36² − x²). What must be true of the radicand?',
    options: [opt('a', '0.1296 − x² ≥ 0', true), opt('b', '0.1296 − x² > 0', false, 'radicand-negative', '√0 = 0 is allowed: the wheel’s sides.'), opt('c', 'x ≥ 0', false, 'domain-range', 'x can be negative: left of the hub.'), opt('d', 'Nothing: any x works', false, 'radicand-negative', 'An even root needs a nonnegative radicand.')],
    hints: ['Square roots of negatives aren’t real.', 'Radicand ≥ 0.', '0.36² = 0.1296.'], solution: '0.1296 − x² ≥ 0.' },
  'w-domain': { type: 'choice', ideas: ['radical-domain'], prompt: 'So the domain is…',
    options: [opt('a', '[−0.36, 0.36]', true), opt('b', '[0, 0.36]', false, 'domain-range', 'Left of the hub counts too.'), opt('c', '[−0.1296, 0.1296]', false, 'root-vs-square', 'x² ≤ 0.1296, so |x| ≤ 0.36.'), opt('d', '(−∞, ∞)', false, 'radicand-negative', 'Outside the wheel the radicand is negative.')],
    hints: ['x² ≤ 0.1296.', '|x| ≤ √0.1296.', '√0.1296 = 0.36.'], solution: '[−0.36, 0.36]: the graph stops at the edges of the wheel.' },
  'w-range': { type: 'choice', ideas: ['radical-domain'], prompt: 'And the range?',
    options: [opt('a', '[0, 0.36]: the upper semicircle only', true), opt('b', '[−0.36, 0.36]', false, 'domain-range', 'The positive root gives only the top half.'), opt('c', '[0, 0.1296]', false, 'root-vs-square', 'Biggest value √0.1296 = 0.36.'), opt('d', '[0, ∞)', false, 'domain-range', 'It can’t exceed the radius.')],
    hints: ['Smallest at the edges.', 'Largest at x = 0.', 'W(0) = 0.36.'], solution: '[0, 0.36]. W is the upper half of the circle, not the whole circumference.' },
  'w-at': { type: 'number', ideas: ['radical-eval'], answer: Math.round(W30.value * 1000) / 1000, tolerance: 0.0015, unit: 'm', label: 'W(0.30)', prompt: 'Evaluate W(0.30) = √(0.1296 − 0.09), to 3 decimal places.',
    traps: [{ value: 0.06, code: 'root-vs-square', message: '√(a² − b²) isn’t a − b.' }, { value: 0.0396, code: 'root-vs-square', message: 'Take the square root.' }], hints: ['0.1296 − 0.09 = 0.0396.', '√0.0396.', '≈ 0.199.'], solution: `W(0.30) = √0.0396 = ${surdText(W30)} ≈ 0.199 m above the hub.` },
  'w-height': { type: 'fields', ideas: ['radical-eq'], prompt: 'Where is the upper wheel 0.30 m above the hub? Solve √(0.1296 − x²) = 0.30 (3 d.p., smaller first).',
    fields: [-X30.value, X30.value].map((v, i) => ({ id: 'x' + i, label: 'x' + (i + 1), answer: Math.round(v * 1000) / 1000, tolerance: 0.0015, traps: [{ value: -Math.round(v * 1000) / 1000, code: 'both-signs', message: 'Two points: negative first.' }, { value: 0.06, code: 'root-vs-square', message: 'Square both sides: x² = 0.1296 − 0.09.' }] })),
    hints: ['Square both sides.', 'x² = 0.0396.', 'Both signs.'], solution: 'x = ±√0.0396 ≈ ±0.199: two symmetric points.' },
  'w-two': { type: 'choice', ideas: ['radical-model'], prompt: 'Why are there two answers?',
    options: [opt('a', 'The wheel is symmetric: one point left of the hub, one right, at the same height', true), opt('b', 'One is extraneous', false, 'squaring-extraneous', 'Both check: √(0.1296 − 0.0396) = 0.3.'), opt('c', 'The wheel has two radii', false, 'arithmetic', 'One radius, 0.36 m.'), opt('d', 'There’s only one: x is positive', false, 'both-signs', 'x is an offset either way.')],
    hints: ['Where is the hub?', 'At x = 0.', 'Left and right.'], solution: 'Symmetry: x² is the same for ±x, and both check in the original.' },
  'w-start': { type: 'fields', ideas: ['radical-transform', 'sqrt-graph'], prompt: `g(x) = ${STUDIO.a}√(x − ${STUDIO.h}) + ${STUDIO.k}. Where does the graph begin?`,
    fields: [{ id: 'x', label: 'x', answer: STUDIO.h, tolerance: 0.001, traps: [{ value: -STUDIO.h, code: 'transform', message: 'x − 3 shifts right, to x = 3.' }] }, { id: 'y', label: 'y', answer: STUDIO.k, tolerance: 0.001, traps: [{ value: STUDIO.a, code: 'transform', message: 'At x = 3 the root is 0, so y = 0 + 1.' }] }],
    hints: ['√ starts where the radicand is 0.', 'x − 3 = 0.', 'Then g(3) = 2·0 + 1.'], solution: 'It starts at (3, 1).' },
  'w-stretch': { type: 'choice', ideas: ['radical-transform'], prompt: 'What does the 2 in front do?',
    options: [opt('a', 'Vertically stretches it: every height above the start doubles', true), opt('b', 'Shifts it up 2', false, 'transform', 'A shift is added; this multiplies.'), opt('c', 'Shifts it right 2', false, 'transform', 'That would be inside the root.'), opt('d', 'Compresses it horizontally by 2', false, 'transform', 'It multiplies the output, so it’s vertical.')],
    hints: ['It multiplies the root.', 'Outputs change.', 'By a factor of 2.'], solution: 'A vertical stretch by 2: g rises twice as fast as √(x − 3) + 1.' },
  'w-domain-g': { type: 'choice', ideas: ['radical-domain', 'radical-transform'], prompt: 'Domain and range of g?',
    options: [opt('a', 'Domain [3, ∞), range [1, ∞)', true), opt('b', 'Domain [0, ∞), range [0, ∞)', false, 'transform', 'That’s the parent √x.'), opt('c', 'Domain [−3, ∞), range [1, ∞)', false, 'transform', 'x − 3 ≥ 0 means x ≥ 3.'), opt('d', 'Domain [3, ∞), range [2, ∞)', false, 'domain-range', 'The lowest output is at the start: 1.')],
    hints: ['Radicand ≥ 0.', 'x ≥ 3.', 'Lowest output at the start.'], solution: 'Domain [3, ∞), range [1, ∞).' },
  'w-reflect': { type: 'choice', ideas: ['radical-transform', 'radical-domain'], prompt: 'Now a = −2: g(x) = −2√(x − 3) + 1. Range?',
    options: [opt('a', '(−∞, 1]: reflected, it goes down from (3, 1)', true), opt('b', '[1, ∞)', false, 'transform', 'A negative a reflects it over the horizontal line through the start.'), opt('c', '(−∞, −1]', false, 'transform', 'The start is still (3, 1).'), opt('d', 'Domain becomes (−∞, 3]', false, 'transform', 'Reflecting the output doesn’t change the radicand.')],
    hints: ['Negative a flips it vertically.', 'It still starts at (3, 1).', 'Then it goes down.'], solution: 'Range (−∞, 1]; domain still [3, ∞).' },
  'w-wheel-move': { type: 'choice', ideas: ['radical-transform', 'radical-model'], prompt: 'In W(x) = k + √(R² − (x − h)²), what do h and k do?',
    options: [opt('a', 'Move the wheel’s centre to (h, k); R sets the radius', true), opt('b', 'h sets the radius, k the height', false, 'transform', 'R is the radius.'), opt('c', 'They stretch the wheel', false, 'transform', 'They shift it; the shape stays a circle.'), opt('d', 'Nothing: the hub is always at the origin', false, 'transform', 'Only when h = k = 0.')],
    hints: ['Compare with a√(x − h) + k.', 'Horizontal and vertical shifts.', 'Of the centre.'], solution: 'h and k translate the centre; R controls the size. (A coordinate model only, not a fit or clearance rule.)' },
  'w-exp-wheel': { type: 'choice', ideas: ['exponents'], prompt: 'Write W(x) = √(0.1296 − x²) with a rational exponent.',
    options: [opt('a', '(0.1296 − x²)^(1/2)', true), opt('b', '(0.1296 − x²)²', false, 'exponent-notation', 'A square root is the 1/2 power, not the 2nd.'), opt('c', '(0.1296 − x²)^(−1/2)', false, 'exponent-notation', 'A negative exponent is a reciprocal.'), opt('d', '0.1296^(1/2) − x', false, 'root-vs-square', 'The exponent applies to the whole radicand.')],
    hints: ['ⁿ√a = a^(1/n).', 'Square root: n = 2.', 'Bracket the radicand.'], solution: '(0.1296 − x²)^(1/2).' },
  'w-exp-eval': { type: 'number', ideas: ['exponents'], answer: N(ratPow(8, 2, 3)), tolerance: 0.001, label: '8^(2/3)', prompt: 'Evaluate 8^(2/3).',
    traps: [{ value: 16 / 3, code: 'exponent-notation', message: 'It isn’t 8 × 2/3: take the cube root, then square.' }, { value: 2, code: 'exponent-notation', message: '∛8 = 2, then square it.' }, { value: 64, code: 'exponent-notation', message: 'The denominator 3 means cube root.' }],
    hints: ['a^(p/q) = (q√a)^p.', '∛8 = 2.', '2².'], solution: '8^(2/3) = (∛8)² = 2² = 4.' },
  'w-cube': { type: 'number', ideas: ['cube-root', 'radical-eval'], answer: N(nthRoot(CUBE.V, 3)), tolerance: 0.001, unit: 'ft', label: 's(125)', prompt: 'Optional cube-root extension: an idealised cube storage box of 125 ft³. Side length s = ∛V?',
    traps: [{ value: 125 / 3, code: 'exponent-notation', message: 'Cube root, not ÷ 3.' }, { value: Math.sqrt(125), code: 'exponent-notation', message: 'Cube root, not square root.' }], hints: ['What cubed is 125?', '5 × 5 × 5.', 's = 5.'], solution: '∛125 = 5 ft.' },
  'w-odd': { type: 'choice', ideas: ['cube-root', 'radical-domain'], prompt: 'Which is a real number?',
    options: [opt('a', '∛(−27) = −3', true), opt('b', '√(−9) = −3', false, 'radicand-negative', '(−3)² = 9, not −9: no real square root.'), opt('c', 'Both', false, 'radicand-negative', 'Only odd roots of negatives are real.'), opt('d', 'Neither', false, 'radicand-negative', '(−3)³ = −27.')],
    hints: ['Odd vs even roots.', '(−3)³ = ?', '(−3)² = ?'], solution: '∛(−27) = −3. Cube-root functions accept every real input; square roots need a nonnegative radicand.' }
};
export function expPractice(n) {
  const SUP = d => String(d).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join(''), rootSym = k => (k === 2 ? '√' : { 3: '∛', 4: '∜' }[k] || SUP(k) + '√');
  const s = pick(EXP_PRACTICE, n), v = N(ratPow(s.b, s.p, s.q)), root = N(nthRoot(s.b, s.q)), idx = rootSym(s.q);
  return tidy({
    brief: `Exponent ${n + 1}: ${s.b}^(${s.p}/${s.q}).`, set: s,
    'wx-form': { type: 'choice', ideas: ['exponents'], prompt: `Which is ${s.b}^(${s.p}/${s.q}) in radical form?`,
      options: rot([opt('a', `(${idx}${s.b})${SUP(s.p)}`, true), opt('b', `(${rootSym(s.p)}${s.b})${SUP(s.q)}`, false, 'exponent-notation', 'The denominator is the root; the numerator is the power.'), opt('c', `${s.b} × ${s.p}/${s.q}`, false, 'exponent-notation', 'An exponent isn’t a multiplier.'), opt('d', `1/(${idx}${s.b})${SUP(s.p)}`, false, 'exponent-notation', 'That’s a negative exponent.')], n),
      hints: ['a^(p/q): q is the root.', `q = ${s.q}.`, `Then the ${s.p} power.`], solution: `(${idx}${s.b})${SUP(s.p)}.` },
    'wx-value': { type: 'number', ideas: ['exponents'], answer: v, tolerance: 0.001, label: 'Value', prompt: `Evaluate ${s.b}^(${s.p}/${s.q}).`,
      traps: [{ value: s.b * s.p / s.q, code: 'exponent-notation', message: 'Take the root, then the power.' }, { value: root, code: 'exponent-notation', message: `${idx}${s.b} = ${root}; now raise it to ${s.p}.` }],
      hints: [`${idx}${s.b} = ?`, `${root}.`, `${root}${SUP(s.p)}.`], solution: `(${idx}${s.b})${SUP(s.p)} = ${root}${SUP(s.p)} = ${v}.` }
  });
}
export const EXP_PRACTICE_IDS = ['wx-form', 'wx-value'];

// ================================================================ Extension: the Route Data Diagnostic
const Fx = features(ratHigh([1], [1, 2])), Gx = features(ratHigh([1, 1], [1, 0, 1])), Hx = features(ratHigh([2, 0, 3], [1, 0, -4])), SLx = features(ratHigh([1, 3, 1], [1, 1]));
const EXT = {
  'x-f': { type: 'fields', ideas: ['vertical', 'horizontal'], prompt: 'f(x) = 1/(x + 2): vertical and horizontal asymptotes?',
    fields: [{ id: 'v', label: 'vertical x =', answer: N(Fx.vertical[0]), tolerance: 0.001, traps: [{ value: 2, code: 'no-restriction', message: 'x + 2 = 0 at x = −2.' }] }, { id: 'h', label: 'horizontal y =', answer: N(Fx.horizontal), tolerance: 0.001, traps: [{ value: 1, code: 'ha-wrong', message: 'Lower-degree numerator: y = 0.' }] }],
    hints: ['Denominator zero.', 'Degree 0 over degree 1.', 'y = 0.'], solution: 'x = −2 and y = 0.' },
  'x-g': { type: 'choice', ideas: ['vertical', 'domain'], prompt: 'g(x) = (x + 1)/(x² + 1). Vertical asymptotes?',
    options: [opt('a', 'None: x² + 1 is never zero, so the domain is all reals', true), opt('b', 'x = −1', false, 'hole-asymptote', '−1 is a zero of the numerator: an x-intercept.'), opt('c', 'x = ±1', false, 'no-restriction', 'x² + 1 = 0 has no real solutions.'), opt('d', 'x = 1', false, 'no-restriction', '1² + 1 = 2.')],
    hints: ['Solve x² + 1 = 0.', 'x² = −1.', 'No real solutions.'], solution: 'None. g has x-intercept −1, y-intercept 1 and horizontal asymptote y = 0.' },
  'x-h': { type: 'fields', ideas: ['vertical', 'horizontal', 'evaluate'], prompt: 'h(x) = (2x² + 3)/(x² − 4). Enter the vertical asymptotes, the horizontal one, and the y-intercept.',
    fields: [{ id: 'v1', label: 'vertical (left)', answer: N(Hx.vertical[0]), tolerance: 0.001, traps: [{ value: -4, code: 'no-restriction', message: 'x² = 4.' }] }, { id: 'v2', label: 'vertical (right)', answer: N(Hx.vertical[1]), tolerance: 0.001, traps: [{ value: 4, code: 'no-restriction', message: 'x² = 4.' }] },
      { id: 'h', label: 'horizontal y =', answer: N(Hx.horizontal), tolerance: 0.001, traps: [{ value: 0, code: 'ha-wrong', message: 'Equal degrees: 2 ÷ 1.' }] }, { id: 'y', label: 'y-intercept', answer: N(Hx.yInt), tolerance: 0.001, traps: [{ value: 0.75, code: 'arithmetic', message: '3 ÷ (−4).' }] }],
    hints: ['x² − 4 = (x − 2)(x + 2).', 'Equal degrees: leading coefficients.', 'h(0) = 3/(−4).'], solution: 'x = ±2, y = 2, y-intercept −0.75.' },
  'x-slant': { type: 'choice', ideas: ['slant'], prompt: '(x² + 3x + 1)/(x + 1): numerator degree one higher. Divide to find the slant asymptote.',
    options: [opt('a', 'y = x + 2', true), opt('b', 'y = x + 3', false, 'arithmetic', 'Long division: x² + 3x ÷ (x + 1) leaves 2x after the first step.'), opt('c', 'y = 1', false, 'ha-wrong', 'With a higher-degree numerator there’s no horizontal asymptote.'), opt('d', 'y = 0', false, 'ha-wrong', 'That’s for a lower-degree numerator.')],
    hints: ['Long division.', 'x² ÷ x = x; subtract x² + x.', 'Then 2x ÷ x = 2.'], solution: 'Quotient x + 2, remainder −1, so y = x + 2.' },
  'x-roots': { type: 'multi', ideas: ['sqrt-graph', 'cube-root', 'radical-domain'], prompt: 'Which have domain all real numbers?',
    options: [opt('a', 'g(x) = ∛x', true), opt('b', 'f(x) = √x', false, 'radicand-negative', 'Even root: x ≥ 0.'), opt('c', 'h(x) = √(x + 4) − 2', false, 'radicand-negative', 'x + 4 ≥ 0, so x ≥ −4.')],
    hints: ['Even roots need radicand ≥ 0.', 'Odd roots take anything.', 'Which are odd?'], solution: 'Only ∛x. √x: [0, ∞); √(x + 4) − 2: [−4, ∞).' },
  'x-start': { type: 'fields', ideas: ['radical-transform'], prompt: 'Where does h(x) = √(x + 4) − 2 start?',
    fields: [{ id: 'x', label: 'x', answer: -4, tolerance: 0.001, traps: [{ value: 4, code: 'transform', message: 'x + 4 shifts left.' }] }, { id: 'y', label: 'y', answer: -2, tolerance: 0.001, traps: [{ value: 2, code: 'transform', message: '− 2 shifts down.' }] }],
    hints: ['Radicand zero.', 'x = −4.', 'h(−4) = 0 − 2.'], solution: '(−4, −2); range [−2, ∞).' }
};

// ================================================================ Final: The Final Route Analysis
export const FINAL_IDS = ['fa-model', 'fa-time', 'fa-domain', 'fa-ha', 'fa-speed', 'fb-num', 'fb-restrict', 'fb-ha', 'fb-time', 'fc-exact', 'fc-dist', 'fc-grade'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalSet(roundNo) {
  const S_ = pick(FINAL_SETS, roundNo - 1), A = S_.A, B = S_.B, C = S_.C;
  const TA = clock(A.D, A.t0), TB = split(B), TBs = simplify(TB), DC = sqrtExact(C.run * C.run + C.h * C.h);
  return { ...S_, TA, k: 60 * A.D, timeA: N(evalAt(TA, A.v)), speed: 60 * A.D / (A.target - A.t0), TB, TBs, timeB: N(evalAt(TB, B.v)), DC, grade: r2(C.h / C.run * 100) };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), { A, B, C } = F, num = high(F.TBs.n).map(N);
  const qs = {
    set: F,
    'fa-model': { type: 'choice', ideas: ['context', 'evaluate'], prompt: `A ${A.D} km timed stage with a fixed ${A.t0}-minute transition. Which is T(v), in minutes?`,
      options: [opt('a', `T(v) = ${A.t0} + ${F.k}/v`, true), opt('b', `T(v) = ${A.t0} + ${A.D}/v`, false, 'units', 'Convert hours to minutes: × 60.'), opt('c', `T(v) = ${A.t0}v + ${F.k}`, false, 'inverse-direct', 'Time is distance ÷ speed.'), opt('d', `T(v) = ${F.k}/(v + ${A.t0})`, false, 'transform', 'The transition is added on.')],
      hints: ['60 × distance ÷ speed.', `${F.k}/v.`, 'Plus the transition.'], solution: `T(v) = ${A.t0} + ${F.k}/v.` },
    'fa-time': { type: 'number', ideas: ['evaluate'], answer: F.timeA, tolerance: 0.01, unit: 'min', label: `T(${A.v})`, prompt: `Total elapsed time at ${A.v} km/h?`,
      traps: [{ value: F.timeA - A.t0, code: 'context-domain', message: 'Add the transition.' }], hints: [`${F.k} ÷ ${A.v}.`, `= ${F.k / A.v}.`, `+ ${A.t0}.`], solution: `${A.t0} + ${F.k / A.v} = ${F.timeA} minutes.` },
    'fa-domain': { type: 'choice', ideas: ['domain', 'context'], prompt: 'Contextual domain?',
      options: [opt('a', 'v > 0', true), opt('b', 'v ≠ 0', false, 'context-domain', 'Speeds are positive.'), opt('c', `v > ${A.t0}`, false, 'domain-range', `${A.t0} is a time.`), opt('d', 'v ≥ 0', false, 'no-restriction', 'v = 0 is undefined.')],
      hints: ['v is in a denominator.', 'Speed is positive.', 'v > 0.'], solution: 'v > 0, i.e. (0, ∞).' },
    'fa-ha': { type: 'number', ideas: ['horizontal'], answer: A.t0, tolerance: 0.001, label: 'Horizontal asymptote T =', prompt: 'Horizontal asymptote?',
      traps: [{ value: 0, code: 'ha-wrong', message: 'The transition stays.' }], hints: [`${F.k}/v → 0.`, 'What’s left?', 'The constant.'], solution: `T = ${A.t0}.` },
    'fa-speed': { type: 'number', ideas: ['rational-eq'], answer: F.speed, tolerance: 0.01, unit: 'km/h', label: 'Speed v', prompt: `What speed gives a total of ${A.target} minutes?`,
      traps: [{ value: F.k / A.target, code: 'arithmetic', message: `Subtract ${A.t0} first.` }, { value: A.target - A.t0, code: 'arithmetic', message: 'That’s the stage time; solve for v.' }],
      hints: [`${A.target} − ${A.t0} = ${F.k}/v.`, `${A.target - A.t0}v = ${F.k}.`, 'Divide.'], solution: `v = ${F.k} ÷ ${A.target - A.t0} = ${F.speed} km/h.` },
    'fb-num': { type: 'fields', ideas: ['add', 'simplify'], prompt: `T(v) = ${B.t0} + ${60 * B.d1}/v + ${60 * B.d2}/(v − ${B.diff}). Write it as (av² + bv + c)/[v(v − ${B.diff})]. Enter a, b, c.`,
      fields: num.map((c, i) => ({ id: 'c' + i, label: ['a (v²)', 'b (v)', 'c'][i], answer: c, tolerance: 0.001, traps: i === 1 ? [{ value: 60 * (B.d1 + B.d2), code: 'arithmetic', message: `Include ${B.t0}v(v − ${B.diff}) = ${B.t0}v² − ${B.t0 * B.diff}v.` }] : i === 0 ? [{ value: 0, code: 'add-denominators', message: `The ${B.t0} becomes ${B.t0}v(v − ${B.diff}) over the common denominator.` }] : [{ value: -c, code: 'arithmetic', message: 'Check the sign.' }] })),
      hints: [`Common denominator v(v − ${B.diff}).`, `${B.t0}v(v − ${B.diff}) + ${60 * B.d1}(v − ${B.diff}) + ${60 * B.d2}v.`, 'Collect like terms.'], solution: `T(v) = (${ptext(F.TBs.n, 'v')})/[v(v − ${B.diff})].` },
    'fb-restrict': { type: 'multi', ideas: ['domain', 'vertical'], prompt: 'Denominator restrictions (they’re also the vertical asymptotes)?',
      options: [opt('a', 'v = 0', true), opt('b', `v = ${B.diff}`, true), opt('c', `v = −${B.diff}`, false, 'no-restriction', `v − ${B.diff} = 0 at v = ${B.diff}.`), opt('d', `v = ${B.v}`, false, 'no-restriction', 'That’s just a speed we use.')],
      hints: ['Set v(v − diff) = 0.', 'Each factor.', 'Nothing cancels.'], solution: `v ≠ 0, v ≠ ${B.diff}: vertical asymptotes v = 0 and v = ${B.diff}. Contextual domain v > ${B.diff}.` },
    'fb-ha': { type: 'number', ideas: ['horizontal'], answer: num[0], tolerance: 0.001, label: 'Horizontal asymptote y =', prompt: 'Horizontal asymptote?',
      traps: [{ value: 0, code: 'ha-wrong', message: 'Equal degrees: leading coefficients.' }, { value: num[1], code: 'ha-wrong', message: 'Use the v² coefficients.' }], hints: ['Compare degrees.', 'Both 2.', `${num[0]} ÷ 1.`], solution: `y = ${num[0]}.` },
    'fb-time': { type: 'number', ideas: ['evaluate'], answer: F.timeB, tolerance: 0.01, unit: 'min', label: `T(${B.v})`, prompt: `Total time at v = ${B.v} km/h?`,
      traps: [{ value: F.timeB - B.t0, code: 'context-domain', message: 'Add the transition.' }, { value: B.t0 + 60 * B.d1 / B.v + 60 * B.d2 / B.v, code: 'context-domain', message: `The technical speed is ${B.v} − ${B.diff}.` }],
      hints: [`Flow: ${60 * B.d1}/${B.v}.`, `Technical: ${60 * B.d2}/${B.v - B.diff}.`, 'Add the transition.'], solution: `${B.t0} + ${60 * B.d1 / B.v} + ${60 * B.d2 / (B.v - B.diff)} = ${F.timeB} minutes.` },
    'fc-exact': { type: 'fields', ideas: ['radical-simplify', 'radical-model'], prompt: `Survey: run ${C.run} m, signed elevation change ${C.h} m. Write D = √(${C.run}² + ${C.h}²) as a√b.`,
      fields: [{ id: 'a', label: 'a', answer: N(F.DC.coef), tolerance: 0.001, traps: [{ value: 1, code: 'arithmetic', message: 'Take out the largest square factor.' }] }, { id: 'b', label: 'b', answer: F.DC.rad, tolerance: 0.001, traps: [{ value: C.run * C.run + C.h * C.h, code: 'arithmetic', message: 'Simplify: take out square factors.' }] }],
      hints: [`${C.run}² + ${C.h}² = ${C.run * C.run + C.h * C.h}.`, 'Largest square factor.', 'Its root comes out.'], solution: `${surdText(F.DC)}.` },
    'fc-dist': { type: 'number', ideas: ['radical-eval'], answer: r2(F.DC.value), tolerance: 0.01, unit: 'm', label: 'D', prompt: 'Decimal approximation (2 d.p.)?',
      traps: [{ value: C.run + C.h, code: 'root-vs-square', message: '√(a² + b²) isn’t a + b.' }], hints: ['Square root of the sum.', 'Or a × √b.', 'Round.'], solution: `D ≈ ${r2(F.DC.value)} m.` },
    'fc-grade': { type: 'number', ideas: ['radical-model'], answer: F.grade, tolerance: 0.01, unit: '%', label: 'Grade', prompt: 'Percent grade?',
      traps: [{ value: r2(C.h / F.DC.value * 100), code: 'arithmetic', message: 'Divide by the run.' }], hints: ['Elevation ÷ run.', `${C.h} ÷ ${C.run}.`, '× 100.'], solution: `${F.grade}%.` }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...M4, ...EXT }));
export const MISSIONS = [
  { id: 'clock', n: 1, title: 'Beat the clock', short: 'Beat the Clock', minutes: '5–6', focus: 'Inverse variation · domain and range · asymptotes · transformations',
    blurb: 'How does average speed change the time for a 6 km stage, and why does it never drop below 8 minutes?', graded: Object.keys(M1) },
  { id: 'console', n: 2, title: 'The stage timing console', short: 'Stage Timing Console', minutes: '6–7', focus: 'Rational expressions and operations · holes · rational equations',
    blurb: 'Two sections at two speeds: combine them, compare them, and solve for a target time.', graded: Object.keys(M2) },
  { id: 'survey', n: 3, title: 'Survey the line', short: 'Survey the Line', minutes: '5–6', focus: 'Radical functions · domain and range · radical equations · extraneous solutions',
    blurb: 'From a run and an elevation difference to the direct distance, and back again.', graded: Object.keys(M3) },
  { id: 'wheel', n: 4, title: 'Wheel geometry lab', short: 'Wheel Geometry', minutes: '5–6', focus: 'Square-root graphs · transformations · rational exponents · cube roots',
    blurb: 'A wheel’s upper edge as a square-root function, and the transformations that move it.', graded: Object.keys(M4) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  const gen = [[CLOCK_PRACTICE, clockPractice, CLOCK_PRACTICE_IDS], [SPLIT_PRACTICE, splitPractice, SPLIT_PRACTICE_IDS], [SURVEY_PRACTICE, surveyPractice, SURVEY_PRACTICE_IDS], [EXP_PRACTICE, expPractice, EXP_PRACTICE_IDS]];
  for (const [list, fn, ids] of gen) for (let n = 0; n < list.length; n++) { const P_ = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...P_[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
export { text, factoredRat, show };
