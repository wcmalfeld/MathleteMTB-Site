// Suspension & Systems Lab: every graded question. Answers come from the
// models and expo.js at full precision, never typed in by hand. Each has
// three progressive hints (concept, method, guided step), a solution with
// its meaning in the scenario, and traps: anticipated wrong answers with a
// misconception code and a message.

import { BOUNCE, K, GROW, SOUND, BOUNCE_PRACTICE, GROW_PRACTICE, SOUND_PRACTICE, FINAL_SETS, pick } from './models.js';
import { term, recursive, linear, decayRate, growthRate, envelope, solveExp, solveEnvelope, firstWhole, seriesSum, arithSum, logb, ln, I0, level, intensity, combine, sci, sup, pow10, fmt, sciText } from './expo.js';

const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object' || !q.type) continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e6); const clash = Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, 1e-9) * 1.5; if (seen.has(k) || clash || !isFinite(t.value)) return false; seen.add(k); return true; });
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
const pctOf = r => Math.round(r * 100);

export const IDEAS = {
  recognize: 'Exponential function recognition',
  factors: 'Initial values and growth factors',
  growth: 'Exponential growth',
  decay: 'Exponential decay',
  geometric: 'Geometric sequences',
  recursive: 'Recursive formulas',
  explicit: 'Explicit formulas',
  'exp-graph': 'Exponential graphs',
  'exp-transform': 'Exponential transformations',
  compare: 'Linear versus exponential comparison',
  'base-e': 'Base e',
  continuous: 'Continuous exponential models',
  'solve-exp': 'Solving exponential equations',
  'log-notation': 'Logarithmic notation',
  conversion: 'Exponential–logarithmic conversions',
  'common-log': 'Common logarithms',
  'natural-log': 'Natural logarithms',
  'log-graph': 'Logarithm graphing',
  product: 'Product property',
  quotient: 'Quotient property',
  power: 'Power property',
  'change-base': 'Change of base',
  'solve-log': 'Solving logarithmic equations',
  inverse: 'Inverse functions',
  suspension: 'Suspension exponential decay',
  event: 'Event growth modeling',
  sound: 'Sound intensity calculations',
  time: 'Solving for time with logarithms',
  series: 'Geometric series'
};
// The PRD's twenty-eight tracked skills, in its order.
export const REPORT_IDEAS = Object.keys(IDEAS).filter(k => k !== 'series');

export const MISCONCEPTIONS = {
  'base-exponent': 'Confusing the base with the exponent',
  'rate-factor': 'Confusing the growth rate with the growth factor',
  'additive-percent': 'Treating percentage increases as additive',
  'linear-exp': 'Confusing linear and exponential change',
  'negative-exponent': 'Misreading a negative exponent',
  asymptote: 'Misinterpreting the horizontal asymptote',
  'discrete-continuous': 'Confusing discrete sequence values with continuous time',
  'log-division': 'Confusing a logarithm with division',
  'log-ln': 'Confusing common log and natural log',
  'log-argument': 'Forgetting the argument of a log must be positive',
  'log-property': 'Applying log properties incorrectly',
  'change-base': 'Misusing change of base',
  exponentiate: 'Forgetting to exponentiate both sides correctly',
  'log-meaning': 'Misinterpreting a logarithmic result',
  'no-verify': 'Failing to verify or interpret the solution',
  'add-decibels': 'Adding decibel readings directly',
  'whole-step': 'Rounding to the wrong whole cycle or week',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Mission 1: Tune the Bounce
const B = BOUNCE, A = n => term(B.A0, B.r, n), NSET = solveExp(B.A0, B.r, B.threshold), TSET = solveEnvelope(B.A0, K, B.threshold);
const M1 = {
  'b-predict': { type: 'choice', ideas: ['recognize', 'compare'], prompt: 'If the suspension lost the same number of millimetres every cycle, would that be the same pattern as keeping 65% each cycle?',
    options: [opt('a', 'No: losing a fixed amount is linear; keeping a fixed percentage is exponential', true), opt('b', 'Yes: both get smaller each cycle', false, 'linear-exp', 'Both decrease, but one by equal differences and one by equal factors.'),
      opt('c', 'Yes, if the amounts are small', false, 'linear-exp', 'The size doesn’t change the type of pattern.'), opt('d', 'No: a fixed percentage would make it grow', false, 'rate-factor', 'Keeping 65% means multiplying by 0.65: it shrinks.')],
    hints: ['Compare subtracting with multiplying.', 'Equal differences: linear. Equal factors: exponential.', 'Which is “keep 65%”?'], solution: 'No. A fixed loss in mm subtracts the same amount (linear); keeping 65% multiplies by 0.65 every cycle (exponential).' },
  'b-retain': { type: 'choice', ideas: ['factors', 'decay'], prompt: 'Aₙ = 18(0.65)ⁿ. What happens to the peak amplitude each cycle?',
    options: [opt('a', 'It keeps 65%, so it decreases by 35%', true), opt('b', 'It decreases by 65%', false, 'rate-factor', '0.65 is what remains: the decrease is 1 − 0.65 = 35%.'), opt('c', 'It decreases by 0.65 mm', false, 'linear-exp', 'It multiplies by 0.65; it doesn’t subtract.'), opt('d', 'It increases by 65%', false, 'rate-factor', 'A factor below 1 shrinks the value.')],
    hints: ['r is the decay factor.', 'r = 0.65 is the fraction kept.', 'Lost: 1 − r.'], solution: 'Each peak is 65% of the one before: a 35% decrease per cycle.' },
  'b-a3': { type: 'number', ideas: ['decay', 'suspension'], answer: A(3), tolerance: 0.001, unit: 'mm', label: 'A₃', prompt: 'Evaluate A₃ = 18(0.65)³ (3 decimal places).',
    traps: [{ value: 18 - 3 * 6.3, code: 'linear-exp', message: 'Multiply by 0.65 three times; don’t subtract.' }, { value: 18 * 0.65 * 3, code: 'base-exponent', message: '(0.65)³ is 0.65 × 0.65 × 0.65, not × 3.' }, { value: 18 * 0.35 ** 3, code: 'rate-factor', message: 'Use the retained factor 0.65, not 0.35.' }],
    hints: ['Raise 0.65 to the 3rd power first.', '0.65³ ≈ 0.2746.', '× 18.'], solution: `A₃ = 18 × 0.274625 = ${fmt(A(3))} mm.` },
  'b-diffs': { type: 'choice', ideas: ['recognize', 'decay'], prompt: 'The drops are 6.3, 4.095, 2.662… mm. Why aren’t they constant?',
    options: [opt('a', 'Each peak is a fixed fraction of the last, so each drop is 35% of a smaller amount', true), opt('b', 'Rounding errors', false, 'linear-exp', 'The values are exact; the pattern itself makes the drops shrink.'), opt('c', 'The damper gets weaker', false, 'linear-exp', 'In this model r is the same every cycle.'), opt('d', 'They are constant', false, 'linear-exp', '6.3 ≠ 4.095.')],
    hints: ['What is 35% of 18? Of 11.7?', '6.3 and 4.095.', 'Constant factor, not constant difference.'], solution: 'Constant ratio, changing differences: that’s what makes it exponential.' },
  'b-linear-neg': { type: 'number', ideas: ['compare'], answer: linear(18, -6.3, 3), tolerance: 0.001, unit: 'mm', label: 'L₃', prompt: 'The linear comparison Lₙ = 18 − 6.3n matches at cycle 1. What does it give at cycle 3?',
    traps: [{ value: A(3), code: 'linear-exp', message: 'That’s the exponential model. Use 18 − 6.3 × 3.' }], hints: ['Substitute n = 3.', '6.3 × 3 = 18.9.', '18 − 18.9.'], solution: 'L₃ = −0.9 mm: a negative amplitude, which is impossible. The linear model fails here.' },
  'b-which': { type: 'choice', ideas: ['compare', 'suspension'], prompt: 'Which model fits a fixed-percentage decay of a nonnegative amplitude?',
    options: [opt('a', 'The exponential one: it changes by equal factors and never goes negative', true), opt('b', 'The linear one: it changes by equal differences', false, 'linear-exp', 'Equal differences isn’t a fixed percentage, and it goes negative.'), opt('c', 'Both equally', false, 'linear-exp', 'They agree only at cycles 0 and 1.'), opt('d', 'Neither', false, 'linear-exp', 'The exponential model is built from the fixed percentage.')],
    hints: ['Fixed percentage → equal factors.', 'Which one goes negative?', 'L₃ = −0.9.'], solution: 'Exponential. The linear model subtracts 6.3 mm each time and is negative by cycle 3.' },
  'b-sequence': { type: 'fields', ideas: ['geometric', 'explicit'], prompt: 'The peaks 18, 11.7, 7.605, … form a geometric sequence. Enter the first term, the common ratio, the decay percentage, and A₆.',
    fields: [{ id: 'a', label: 'First term A₀', answer: 18, tolerance: 0.001 }, { id: 'r', label: 'Common ratio r', answer: 0.65, tolerance: 0.0001, traps: [{ value: 0.35, code: 'rate-factor', message: 'The ratio is what’s kept: 0.65.' }, { value: -6.3, code: 'linear-exp', message: 'That’s a difference; the ratio is 11.7 ÷ 18.' }] },
      { id: 'p', label: 'Decay per cycle (%)', answer: 35, tolerance: 0.01, traps: [{ value: 65, code: 'rate-factor', message: '65% is kept; 35% is lost.' }] }, { id: 'a6', label: 'A₆ (mm)', answer: A(6), tolerance: 0.001, traps: [{ value: A(5), code: 'whole-step', message: 'A₆ is cycle 6: n = 6.' }, { value: 18 * 0.65 * 6, code: 'base-exponent', message: '0.65⁶, not 0.65 × 6.' }] }],
    hints: ['Ratio: any term ÷ the one before.', '11.7 ÷ 18.', 'A₆ = 18(0.65)⁶.'], solution: `A₀ = 18, r = 0.65, 35% decay, A₆ ≈ ${fmt(A(6))} mm.` },
  'b-recursive': { type: 'choice', ideas: ['recursive', 'geometric'], prompt: 'Which is the recursive rule?',
    options: [opt('a', 'A₀ = 18,  Aₙ = 0.65·Aₙ₋₁', true), opt('b', 'A₀ = 18,  Aₙ = Aₙ₋₁ − 0.65', false, 'linear-exp', 'Subtracting gives a linear sequence.'), opt('c', 'Aₙ = 18(0.65)ⁿ', false, 'linear-exp', 'That’s the explicit rule: it jumps straight to any n.'), opt('d', 'A₀ = 18,  Aₙ = 0.35·Aₙ₋₁', false, 'rate-factor', 'Each term keeps 65% of the previous one.')],
    hints: ['Recursive: each term from the one before.', 'Multiply by the ratio.', 'Plus a starting value.'], solution: 'A₀ = 18 and Aₙ = 0.65·Aₙ₋₁. Both rules generate the same sequence.' },
  'b-faster': { type: 'choice', ideas: ['exp-transform', 'decay'], prompt: 'What does moving the decay factor closer to 1 do?',
    options: [opt('a', 'Slows the decay: each cycle keeps more', true), opt('b', 'Speeds the decay up', false, 'rate-factor', 'Closer to 1 means keeping more each cycle.'), opt('c', 'Shifts the curve up', false, 'asymptote', 'A₀ sets the starting height; r sets the speed.'), opt('d', 'Makes it grow', false, 'rate-factor', 'Only a factor above 1 grows.')],
    hints: ['r = 0.9 vs r = 0.5.', 'Which keeps more?', 'Keeping more = slower decay.'], solution: 'Slower decay. r = 1 would mean no decay at all; r near 0, almost instant.' },
  'b-asymptote': { type: 'choice', ideas: ['exp-graph', 'decay'], prompt: 'What is the horizontal asymptote of y = 18(0.65)ˣ, and what does it mean?',
    options: [opt('a', 'y = 0: the amplitude approaches zero but never reaches it', true), opt('b', 'y = 18', false, 'asymptote', '18 is the starting value, the y-intercept.'), opt('c', 'y = 0.65', false, 'asymptote', '0.65 is the base.'), opt('d', 'There isn’t one', false, 'asymptote', 'As x → ∞, 0.65ˣ → 0.')],
    hints: ['What happens to 0.65ˣ as x grows?', 'It shrinks toward 0.', 'Times 18.'], solution: 'y = 0. In g(x) = abˣ⁻ʰ + k the asymptote is y = k; here k = 0. Domain: all reals; range: y > 0.' },
  'b-k': { type: 'number', ideas: ['base-e', 'continuous', 'natural-log'], answer: K, tolerance: 0.0005, unit: '/s', label: 'k', prompt: 'Peaks are 0.5 s apart. The continuous envelope A(t) = 18e^(−kt) uses k = −ln(0.65) ÷ 0.5. Find k (4 decimal places).',
    traps: [{ value: -Math.log10(0.65) / 0.5, code: 'log-ln', message: 'Use ln (base e), not log (base 10).' }, { value: -Math.log(0.65), code: 'discrete-continuous', message: 'Divide by the 0.5 s between peaks.' }, { value: 0.35 / 0.5, code: 'rate-factor', message: 'Use −ln(0.65), not 0.35.' }],
    hints: ['ln(0.65) ≈ −0.4308.', 'Negate it.', 'Divide by 0.5.'], solution: `k = 0.4308 ÷ 0.5 ≈ ${fmt(K, 4)} per second: A(t) = 18e^(−0.8616t).` },
  'b-match': { type: 'number', ideas: ['continuous', 'base-e'], answer: envelope(B.A0, K, 1.5), tolerance: 0.001, unit: 'mm', label: 'A(1.5)', prompt: 'Evaluate the envelope at t = 1.5 s.',
    traps: [{ value: envelope(B.A0, 0.8616, 15), code: 'discrete-continuous', message: 't is in seconds: 1.5, not 15.' }, { value: A(1.5), code: 'discrete-continuous', message: 'Use the continuous envelope with t = 1.5 s (that’s cycle 3).' }],
    hints: ['e^(−0.8616 × 1.5).', '≈ 0.2746.', '× 18.'], solution: `A(1.5) ≈ ${fmt(envelope(B.A0, K, 1.5))} mm, exactly A₃: t = 1.5 s is the 3rd peak, so the two models agree.` },
  'b-settle-t': { type: 'number', ideas: ['solve-exp', 'natural-log', 'time'], answer: TSET, tolerance: 0.01, unit: 's', label: 't', prompt: 'When does the envelope fall to 2 mm? Solve 18e^(−0.8616t) = 2.',
    traps: [{ value: Math.log10(9) / K, code: 'log-ln', message: 'e undoes with ln, not log.' }, { value: (18 - 2) / K, code: 'exponentiate', message: 'Divide by 18 first, then take ln of both sides.' }, { value: NSET, code: 'discrete-continuous', message: 'That’s cycles. Time in seconds is cycles × 0.5.' }],
    hints: ['Divide by 18: e^(−0.8616t) = 1/9.', 'ln both sides: −0.8616t = ln(1/9).', 't = ln(1/9) ÷ (−0.8616).'], solution: `t = ln(1/9) ÷ (−0.8616) ≈ ${fmt(TSET, 2)} s.` },
  'b-settle-n': { type: 'number', ideas: ['solve-exp', 'time'], answer: NSET, tolerance: 0.01, label: 'n', prompt: 'And in cycles? Solve 18(0.65)ⁿ = 2.',
    traps: [{ value: 2 / 18 / 0.65, code: 'log-division', message: 'The unknown is an exponent: use logs, n = ln(2/18) ÷ ln(0.65).' }, { value: Math.log(2 / 18) / Math.log(0.35), code: 'rate-factor', message: 'Use ln(0.65), the retained factor.' }],
    hints: ['0.65ⁿ = 2/18.', 'Take ln: n·ln(0.65) = ln(2/18).', 'Divide.'], solution: `n ≈ ${fmt(NSET, 2)} cycles (= ${fmt(TSET, 2)} s ÷ 0.5).` },
  'b-first-cycle': { type: 'number', ideas: ['time', 'suspension'], answer: firstWhole(B.A0, B.r, B.threshold), tolerance: 0.001, label: 'Cycle', prompt: 'At which whole cycle is a peak first below 2 mm?',
    traps: [{ value: Math.floor(NSET), code: 'whole-step', message: `A₅ ≈ ${fmt(A(5))} mm is still above 2.` }], hints: ['n ≈ 5.10.', 'Peaks happen at whole cycles.', `Check A₅ and A₆.`], solution: `Cycle 6: A₅ ≈ ${fmt(A(5))} mm, A₆ ≈ ${fmt(A(6))} mm. (The 2 mm threshold is an arbitrary teaching value, not a tuning target.)` }
};
export function bouncePractice(n) {
  const s = pick(BOUNCE_PRACTICE, n), p = pctOf(s.r), x = solveExp(s.A0, s.r, s.threshold), first = firstWhole(s.A0, s.r, s.threshold);
  return tidy({
    brief: `Shock ${n + 1}: the envelope starts at ${s.A0} mm and keeps ${p}% of its amplitude each cycle. Threshold ${s.threshold} mm.`, set: s,
    'bx-explicit': { type: 'choice', ideas: ['explicit', 'factors'], prompt: 'Which is the explicit rule?',
      options: rot([opt('a', `Aₙ = ${s.A0}(${s.r})ⁿ`, true), opt('b', `Aₙ = ${s.A0}(${fmt(1 - s.r, 2)})ⁿ`, false, 'rate-factor', `Keep ${p}%: the factor is ${s.r}.`), opt('c', `Aₙ = ${s.r}(${s.A0})ⁿ`, false, 'base-exponent', 'The base is the factor; the initial value multiplies.'), opt('d', `Aₙ = ${s.A0} − ${s.r}n`, false, 'linear-exp', 'A fixed percentage multiplies.')], n),
      hints: ['Aₙ = A₀rⁿ.', `A₀ = ${s.A0}.`, `r = ${s.r}.`], solution: `Aₙ = ${s.A0}(${s.r})ⁿ; recursively A₀ = ${s.A0}, Aₙ = ${s.r}·Aₙ₋₁.` },
    'bx-term': { type: 'number', ideas: ['decay', 'geometric'], answer: term(s.A0, s.r, s.at), tolerance: 0.001, unit: 'mm', label: `A${['₀', '₁', '₂', '₃', '₄', '₅', '₆'][s.at]}`, prompt: `Amplitude after ${s.at} cycles (3 decimal places)?`,
      traps: [{ value: s.A0 * s.r * s.at, code: 'base-exponent', message: `${s.r}^${s.at}, not × ${s.at}.` }, { value: term(s.A0, 1 - s.r, s.at), code: 'rate-factor', message: `Use the kept fraction ${s.r}.` }],
      hints: [`${s.r} to the power ${s.at}.`, `≈ ${fmt(s.r ** s.at, 4)}.`, `× ${s.A0}.`], solution: `${fmt(term(s.A0, s.r, s.at))} mm.` },
    'bx-cycle': { type: 'number', ideas: ['solve-exp', 'time'], answer: first, tolerance: 0.001, label: 'Cycle', prompt: `First whole cycle with a peak below ${s.threshold} mm?`,
      traps: [{ value: Math.floor(x), code: 'whole-step', message: 'Check that peak: it’s still above the threshold.' }], hints: [`${s.r}ⁿ = ${s.threshold}/${s.A0}.`, `n = ln(${s.threshold}/${s.A0}) ÷ ln(${s.r}).`, 'Round up to the next whole cycle.'], solution: `n ≈ ${fmt(x, 2)}, so cycle ${first}.` }
  });
}
export const BOUNCE_PRACTICE_IDS = ['bx-explicit', 'bx-term', 'bx-cycle'];

// ================================================================ Mission 2: Grow the Ride
const G = GROW, F = 1 + G.pct / 100, R = w => term(G.R0, F, w), W250 = solveExp(G.R0, F, G.target);
const M2 = {
  'g-factor': { type: 'number', ideas: ['factors', 'growth'], answer: F, tolerance: 0.0001, label: 'Growth factor', prompt: '100 registrations, growing 20% a week. What is the weekly growth factor?',
    traps: [{ value: 0.2, code: 'rate-factor', message: 'That’s the rate. The factor is 1 + 0.20.' }, { value: 20, code: 'rate-factor', message: 'As a multiplier: 1.20.' }],
    hints: ['Growing by 20% keeps 100% and adds 20%.', '100% + 20%.', 'As a decimal.'], solution: 'Factor 1.20: R(w) = 100(1.20)ʷ.' },
  'g-r3': { type: 'number', ideas: ['growth', 'event'], answer: R(3), tolerance: 0.5, label: 'R(3)', prompt: 'Projected registrations after 3 weeks (to the nearest rider)?',
    traps: [{ value: 160, code: 'additive-percent', message: '20% of a growing number each week, not 20 riders a week.' }, { value: 100 * 1.6, code: 'additive-percent', message: '3 × 20% isn’t 60%: the percentages compound.' }],
    hints: ['100 × 1.2³.', '1.2³ = 1.728.', 'Round to whole riders.'], solution: `R(3) = 172.8 ≈ 173 riders.` },
  'g-additive': { type: 'choice', ideas: ['compare', 'growth'], prompt: 'Why is 20% a week not the same as 20 riders a week?',
    options: [opt('a', '20% of a larger number is more riders, so the weekly gain keeps growing', true), opt('b', 'They are the same', false, 'additive-percent', 'They match only in week 1.'), opt('c', '20 riders a week grows faster', false, 'linear-exp', 'Only at first; after week 1 the percentage gives more.'), opt('d', 'Percentages can’t describe people', false, 'additive-percent', 'They can: 20% of 120 is 24.')],
    hints: ['Week 1: 20% of 100 = 20.', 'Week 2: 20% of 120 = ?', '24, not 20.'], solution: 'The percentage applies to a growing base: gains of 20, 24, 28.8… vs a constant 20.' },
  'g-week6': { type: 'fields', ideas: ['compare', 'event'], prompt: 'Week 6: exponential R(6) = 100(1.2)⁶ and linear L(6) = 100 + 20·6 (nearest rider).',
    fields: [{ id: 'r', label: 'R(6)', answer: R(6), tolerance: 0.5, traps: [{ value: 220, code: 'linear-exp', message: 'That’s the linear one.' }] }, { id: 'l', label: 'L(6)', answer: linear(100, 20, 6), tolerance: 0.5, traps: [{ value: R(6), code: 'linear-exp', message: 'That’s the exponential one.' }] }],
    hints: ['1.2⁶ ≈ 2.986.', '100 × that.', '100 + 120.'], solution: 'R(6) ≈ 299, L(6) = 220: the exponential model predicts more.' },
  'g-capacity': { type: 'choice', ideas: ['event', 'growth'], prompt: 'The model gives R(8) ≈ 430. Should the team plan for 430 riders?',
    options: [opt('a', 'No: the model only covers weeks 0–6, and the event caps at 300', true), opt('b', 'Yes: exponential growth continues forever', false, 'no-verify', 'A short-term model isn’t a forecast of unlimited growth.'), opt('c', 'Yes, but round down to 400', false, 'no-verify', 'The capacity is 300.'), opt('d', 'No, because R(8) is negative', false, 'arithmetic', 'It’s positive; the problem is extrapolating.')],
    hints: ['What’s the model’s window?', '0 ≤ w ≤ 6.', 'And the capacity?'], solution: 'No. Fictional data over a limited window; past week 6 or 300 riders the real event needs a different model.' },
  'g-solve': { type: 'number', ideas: ['solve-exp', 'time', 'event'], answer: W250, tolerance: 0.01, unit: 'weeks', label: 'w', prompt: '250 registrations unlock a new race category. Solve 100(1.20)ʷ = 250.',
    traps: [{ value: 2.5 / 1.2, code: 'log-division', message: 'w is an exponent: use logs.' }, { value: Math.log(2.5) / Math.log(0.2), code: 'rate-factor', message: 'ln of the factor 1.20, not the rate.' }, { value: 7.5, code: 'linear-exp', message: '150 more riders at 20 a week is the linear model.' }],
    hints: ['Divide by 100: 1.2ʷ = 2.5.', 'ln both sides: w·ln 1.2 = ln 2.5.', 'Divide.'], solution: `w = ln 2.5 ÷ ln 1.2 ≈ ${fmt(W250, 2)} weeks.` },
  'g-week': { type: 'number', ideas: ['time', 'event'], answer: firstWhole(G.R0, F, G.target), tolerance: 0.001, label: 'Week', prompt: 'At which weekly check-in is 250 first reached?',
    traps: [{ value: 5, code: 'whole-step', message: `R(5) ≈ ${Math.round(R(5))}: just short.` }], hints: ['w ≈ 5.03.', 'Check-ins are whole weeks.', 'R(5) vs R(6).'], solution: `Week 6: R(5) ≈ 249, R(6) ≈ 299.` }
};
export function growPractice(n) {
  const s = pick(GROW_PRACTICE, n), f = 1 + s.pct / 100, w = solveExp(s.R0, f, s.target), wk = firstWhole(s.R0, f, s.target);
  return tidy({
    brief: `Event ${n + 1}: ${s.R0} riders, growing ${s.pct}% a week. Target ${s.target}.`, set: s,
    'gx-model': { type: 'choice', ideas: ['factors', 'growth'], prompt: 'Which model?',
      options: rot([opt('a', `R(w) = ${s.R0}(${fmt(f, 2)})ʷ`, true), opt('b', `R(w) = ${s.R0}(${fmt(s.pct / 100, 2)})ʷ`, false, 'rate-factor', 'The factor is 1 + rate.'), opt('c', `R(w) = ${s.R0} + ${s.pct}w`, false, 'additive-percent', 'A percentage multiplies.'), opt('d', `R(w) = ${fmt(f, 2)}(${s.R0})ʷ`, false, 'base-exponent', 'The base is the factor.')], n),
      hints: ['R(w) = R₀ × factorʷ.', `Factor 1 + ${s.pct / 100}.`, `R₀ = ${s.R0}.`], solution: `R(w) = ${s.R0}(${fmt(f, 2)})ʷ.` },
    'gx-w': { type: 'number', ideas: ['solve-exp', 'time'], answer: w, tolerance: 0.01, unit: 'weeks', label: 'w', prompt: `When does it reach ${s.target}? (2 decimal places)`,
      traps: [{ value: (s.target - s.R0) / (s.R0 * s.pct / 100), code: 'linear-exp', message: 'That treats the growth as linear.' }], hints: [`${fmt(f, 2)}ʷ = ${s.target}/${s.R0}.`, `w = ln(${s.target}/${s.R0}) ÷ ln(${fmt(f, 2)}).`, 'Divide.'], solution: `w ≈ ${fmt(w, 2)} weeks.` },
    'gx-week': { type: 'number', ideas: ['time', 'event'], answer: wk, tolerance: 0.001, label: 'Week', prompt: 'First weekly check-in at or above the target?',
      traps: [{ value: Math.floor(w), code: 'whole-step', message: 'That week is still short of the target.' }], hints: ['Round w up.', 'Check that week’s value.', `R(${wk}).`], solution: `Week ${wk}: R(${wk}) ≈ ${Math.round(term(s.R0, f, wk))}.` }
  });
}
export const GROW_PRACTICE_IDS = ['gx-model', 'gx-w', 'gx-week'];

// ================================================================ Mission 3: Decode the Sound
const L75 = sci(intensity(SOUND.reading));
const M3 = {
  'd-log': { type: 'number', ideas: ['log-notation', 'common-log'], answer: logb(1000), tolerance: 0.001, label: 'log₁₀(1000)', prompt: '10³ = 1000. What is log₁₀(1000)?',
    traps: [{ value: 100, code: 'log-division', message: 'A log is an exponent, not 1000 ÷ 10.' }, { value: 1000, code: 'log-meaning', message: 'The log is the exponent that gives 1000.' }],
    hints: ['A log answers “10 to what power?”.', '10^? = 1000.', '10³.'], solution: 'log₁₀(1000) = 3: the exponent.' },
  'd-ratio': { type: 'number', ideas: ['sound', 'log-notation'], answer: logb(1e-5 / I0), tolerance: 0.001, label: 'Exponent', prompt: 'Pump track competition: I = 10⁻⁵ W/m². I ÷ I₀ = 10⁻⁵ ÷ 10⁻¹² = 10 to what power?',
    traps: [{ value: -17, code: 'negative-exponent', message: 'Dividing subtracts exponents: −5 − (−12).' }, { value: -7, code: 'negative-exponent', message: '−5 − (−12) = +7.' }],
    hints: ['Divide powers: subtract exponents.', '−5 − (−12).', 'Careful with the double negative.'], solution: '10⁷.' },
  'd-level': { type: 'number', ideas: ['sound', 'common-log'], answer: level(1e-5), tolerance: 0.01, unit: 'dB', label: 'L', prompt: 'So L = 10·log₁₀(10⁷) = ?',
    traps: [{ value: 7, code: 'log-meaning', message: 'Multiply the log by 10.' }, { value: 1e8, code: 'log-meaning', message: 'Take the log: log₁₀(10⁷) = 7.' }],
    hints: ['log₁₀(10⁷) = 7.', '× 10.', 'Decibels.'], solution: '70 dB.' },
  'd-tenfold': { type: 'choice', ideas: ['sound', 'log-graph'], prompt: 'The quiet trail zone is 10⁻⁸ W/m² (40 dB), the warm-up area 10⁻⁷ (50 dB). What does +10 dB mean?',
    options: [opt('a', 'Ten times the intensity', true), opt('b', '10 W/m² more intensity', false, 'log-meaning', 'The difference is 9 × 10⁻⁸ W/m²: a factor, not a fixed amount.'), opt('c', '25% more intensity', false, 'log-meaning', '50 ÷ 40 compares levels, not intensities.'), opt('d', 'Twice the intensity', false, 'log-meaning', '10⁻⁷ ÷ 10⁻⁸ = 10.')],
    hints: ['Divide the intensities.', '10⁻⁷ ÷ 10⁻⁸.', '= 10.'], solution: 'Every +10 dB is ×10 intensity: a logarithmic scale squeezes huge ratios into small steps.' },
  'd-form': { type: 'choice', ideas: ['conversion'], prompt: 'Which is equivalent to 10⁴ = 10000?',
    options: [opt('a', 'log₁₀(10000) = 4', true), opt('b', 'log₄(10000) = 10', false, 'base-exponent', 'The base stays the base: 10.'), opt('c', 'log₁₀(4) = 10000', false, 'base-exponent', 'The log equals the exponent.'), opt('d', '10000 ÷ 10 = 4', false, 'log-division', 'A log isn’t division.')],
    hints: ['bˣ = y ⇔ log_b(y) = x.', 'b = 10, x = 4, y = 10000.', 'The log gives the exponent.'], solution: 'log₁₀(10000) = 4.' },
  'd-inverse': { type: 'choice', ideas: ['inverse', 'conversion'], prompt: 'Rearrange L = 10·log₁₀(I/I₀) for I.',
    options: [opt('a', 'I = I₀ · 10^(L/10)', true), opt('b', 'I = I₀ · L/10', false, 'log-division', 'Undo the log by exponentiating: 10 to both sides.'), opt('c', 'I = 10^L · I₀', false, 'exponentiate', 'Divide by 10 first: L/10.'), opt('d', 'I = I₀ · log(L/10)', false, 'exponentiate', 'The inverse of a log is an exponential.')],
    hints: ['Divide by 10.', 'L/10 = log₁₀(I/I₀).', 'Exponential form: 10^(L/10) = I/I₀.'], solution: 'I = I₀·10^(L/10): exponentials and logs undo each other.' },
  'd-product': { type: 'number', ideas: ['product'], answer: logb(100 * 1000), tolerance: 0.001, label: 'log₁₀(100 × 1000)', prompt: 'Product property: log₁₀(100 × 1000) = ?',
    traps: [{ value: 6, code: 'log-property', message: 'log(MN) = log M + log N: 2 + 3.' }, { value: 100000, code: 'log-meaning', message: 'Take the log of 100000.' }], hints: ['log(MN) = log M + log N.', 'log 100 = 2, log 1000 = 3.', 'Add.'], solution: '2 + 3 = 5 (and 100 × 1000 = 10⁵).' },
  'd-quotient': { type: 'number', ideas: ['quotient'], answer: logb(1e7 / 1e4), tolerance: 0.001, label: 'log₁₀(10⁷/10⁴)', prompt: 'Quotient property: log₁₀(10⁷ ÷ 10⁴) = ?',
    traps: [{ value: 7 / 4, code: 'log-property', message: 'log(M/N) = log M − log N, not ÷.' }, { value: 11, code: 'log-property', message: 'Subtract, don’t add.' }], hints: ['log(M/N) = log M − log N.', '7 − 4.', 'Or simplify first: 10³.'], solution: '3: a 70 dB source is 10³ = 1000 times as intense as a 40 dB one.' },
  'd-power': { type: 'number', ideas: ['power'], answer: logb(1000 ** 2), tolerance: 0.001, label: 'log₁₀(1000²)', prompt: 'Power property: log₁₀(1000²) = ?',
    traps: [{ value: 9, code: 'log-property', message: 'log(Mᵖ) = p·log M = 2 × 3.' }, { value: 5, code: 'log-property', message: 'It’s 2 × log 1000, not 2 + log 1000.' }], hints: ['log(Mᵖ) = p·log M.', 'p = 2, log 1000 = 3.', 'Multiply.'], solution: '2 × 3 = 6.' },
  'd-misuse': { type: 'choice', ideas: ['product', 'log-graph'], prompt: 'Which statement is FALSE?',
    options: [opt('a', 'log(M + N) = log M + log N', true), opt('b', 'log(MN) = log M + log N', false, 'log-property', 'That’s the product property: true.'), opt('c', 'log(M/N) = log M − log N', false, 'log-property', 'The quotient property: true.'), opt('d', 'log(Mᵖ) = p·log M', false, 'log-property', 'The power property: true.')],
    hints: ['Test with numbers: M = N = 10.', 'log 20 vs 1 + 1.', '1.301 ≠ 2.'], solution: 'log(M + N) isn’t log M + log N; there’s no property for a sum inside a log.' },
  'd-combine': { type: 'number', ideas: ['sound', 'product'], answer: combine(70, 70), tolerance: 0.01, unit: 'dB', label: 'Combined', prompt: 'Two equal 70 dB sources run together. Intensities add: 2 × 10⁻⁵ W/m². What’s the combined level (2 decimal places)?',
    traps: [{ value: 140, code: 'add-decibels', message: 'Add the intensities, not the decibels.' }, { value: 70, code: 'add-decibels', message: 'Two sources are twice the intensity: a little louder.' }],
    hints: ['L = 10·log₁₀(2 × 10⁷).', 'Product property: log 2 + log 10⁷.', '10 × (0.301 + 7).'], solution: `${fmt(combine(70, 70), 2)} dB: doubling the intensity adds about 3 dB.` },
  'd-ln': { type: 'choice', ideas: ['common-log', 'natural-log'], prompt: 'What do log(x) and ln(x) mean?',
    options: [opt('a', 'log is base 10; ln is base e', true), opt('b', 'They’re the same', false, 'log-ln', 'Different bases: log 10 = 1, ln 10 ≈ 2.303.'), opt('c', 'log is base e; ln is base 10', false, 'log-ln', 'Swapped.'), opt('d', 'ln is log ÷ n', false, 'log-division', 'ln is the natural log, base e.')],
    hints: ['Common log.', 'Natural log.', 'e ≈ 2.718.'], solution: 'log(x) = log₁₀(x); ln(x) = logₑ(x).' },
  'd-log2': { type: 'number', ideas: ['change-base', 'log-notation'], answer: logb(32, 2), tolerance: 0.001, label: 'log₂(32)', prompt: 'log₂(32) = ?',
    traps: [{ value: 16, code: 'log-division', message: '2 to what power is 32?' }], hints: ['2^? = 32.', '2, 4, 8, 16, 32.', 'Count.'], solution: '5, because 2⁵ = 32 (and ln 32 ÷ ln 2 = 5).' },
  'd-log3': { type: 'number', ideas: ['change-base'], answer: logb(20, 3), tolerance: 0.001, label: 'log₃(20)', prompt: 'Change of base: log₃(20) = ln(20) ÷ ln(3) (3 decimal places).',
    traps: [{ value: Math.log(3) / Math.log(20), code: 'change-base', message: 'Argument on top: ln 20 ÷ ln 3.' }, { value: 20 / 3, code: 'log-division', message: 'Take the logs first.' }, { value: Math.log(20 / 3), code: 'change-base', message: 'Divide the logs, not the numbers.' }],
    hints: ['log_b(x) = ln x ÷ ln b.', 'ln 20 ≈ 2.9957, ln 3 ≈ 1.0986.', 'Divide.'], solution: `≈ ${fmt(logb(20, 3), 3)}: between 2 and 3, since 3² = 9 and 3³ = 27.` },
  'd-domain': { type: 'choice', ideas: ['log-graph'], prompt: 'Why can’t the analyzer show the decibel level of an intensity of 0?',
    options: [opt('a', 'log(0) is undefined: a log’s argument must be positive', true), opt('b', 'log(0) = 0, so it’s 0 dB', false, 'log-argument', '10^? = 0 has no solution.'), opt('c', 'It would be −120 dB', false, 'log-argument', '0 dB is I₀; zero intensity has no level.'), opt('d', 'It can; it shows ∞', false, 'log-argument', 'log x → −∞ as x → 0⁺, but log 0 doesn’t exist.')],
    hints: ['10^? = 0.', 'No power of 10 is 0.', 'Domain of log: x > 0.'], solution: 'The domain of log is x > 0. As I → 0⁺ the level falls without bound; the y-axis is a vertical asymptote.' },
  'd-75': { type: 'fields', ideas: ['solve-log', 'sound', 'conversion'], prompt: 'A 75 dB reading. Solve 75 = 10·log₁₀(I/10⁻¹²) and write I = c × 10ⁿ.',
    fields: [{ id: 'c', label: 'c (3 decimal places)', answer: L75.c, tolerance: 0.001, traps: [{ value: 7.5, code: 'exponentiate', message: '10^7.5, not 7.5.' }] }, { id: 'n', label: 'n', answer: L75.e, tolerance: 0.001, traps: [{ value: -4, code: 'negative-exponent', message: '10⁻¹² × 10^7.5 = 10^−4.5 = 3.162 × 10⁻⁵.' }, { value: 7.5, code: 'exponentiate', message: 'Multiply by 10⁻¹².' }] }],
    hints: ['Divide by 10: 7.5 = log₁₀(I/10⁻¹²).', 'Exponential form: I/10⁻¹² = 10^7.5.', 'I = 10^−4.5.'], solution: `I = 10^−4.5 ≈ ${sciText(intensity(75))} W/m².` }
};
export function soundPractice(n) {
  const s = pick(SOUND_PRACTICE, n), I = intensity(s.L), sc = sci(I), times = Math.pow(10, (s.L - 40) / 10);
  return tidy({
    brief: `Reading ${n + 1}: the sensor shows ${s.L} dB.`, set: s,
    'dx-int': { type: 'fields', ideas: ['solve-log', 'sound'], prompt: `Find the intensity for ${s.L} dB as c × 10ⁿ W/m².`,
      fields: [{ id: 'c', label: 'c (3 decimal places)', answer: sc.c, tolerance: 0.001, traps: [{ value: s.L / 10, code: 'exponentiate', message: `10^(${s.L}/10), not ${s.L}/10.` }] }, { id: 'n', label: 'n', answer: sc.e, tolerance: 0.001, traps: [{ value: Math.round(s.L / 10), code: 'negative-exponent', message: 'Multiply by I₀ = 10⁻¹².' }] }],
      hints: [`${s.L}/10 = log₁₀(I/10⁻¹²).`, `I = 10^(${s.L / 10} − 12).`, 'Write as c × 10ⁿ.'], solution: `I = 10^${fmt(s.L / 10 - 12, 1)} ≈ ${sciText(I)} W/m².` },
    'dx-times': { type: 'number', ideas: ['sound', 'quotient'], answer: times, tolerance: Math.max(0.01, times * 0.001), label: 'Times as intense', prompt: `How many times as intense as the 40 dB quiet zone? (1 decimal place)`,
      traps: [{ value: s.L / 40, code: 'log-meaning', message: 'Compare intensities, not decibels.' }, { value: s.L - 40, code: 'log-meaning', message: 'Each 10 dB is ×10.' }],
      hints: ['Difference in dB.', `${s.L - 40} dB = ${(s.L - 40) / 10} tens.`, `10^${(s.L - 40) / 10}.`], solution: `10^${fmt((s.L - 40) / 10, 1)} ≈ ${fmt(times, 1)} times.` }
  });
}
export const SOUND_PRACTICE_IDS = ['dx-int', 'dx-times'];

// ================================================================ Extension: the advanced engineering bench
const EXT = {
  'x-k': { type: 'number', ideas: ['continuous', 'natural-log'], answer: growthRate(1.2), tolerance: 0.0005, label: 'k', prompt: 'Continuous growth N(t) = 100e^(kt) equivalent to 20% a week: k = ln(1.20) = ? (4 decimal places)',
    traps: [{ value: 0.2, code: 'rate-factor', message: 'k = ln(1.2), a bit less than 0.2.' }, { value: Math.log10(1.2), code: 'log-ln', message: 'Natural log.' }], hints: ['e^k must equal 1.2.', 'k = ln 1.2.', '≈ 0.1823.'], solution: `k ≈ ${fmt(growthRate(1.2), 4)}: 100e^(0.1823t) equals 100(1.2)ᵗ at every whole week.` },
  'x-equal': { type: 'choice', ideas: ['continuous', 'base-e'], prompt: 'At week 3, compare 100e^(0.1823·3) and 100(1.2)³.',
    options: [opt('a', 'Equal (172.8): e^(ln 1.2 × 3) = 1.2³', true), opt('b', 'The continuous one is much bigger', false, 'discrete-continuous', 'k was chosen so they match.'), opt('c', 'The continuous one is 100e^0.6', false, 'rate-factor', 'k is ln 1.2, not 0.2.'), opt('d', 'They can’t be compared', false, 'discrete-continuous', 'Same function at whole weeks.')],
    hints: ['e^(kt) = (e^k)ᵗ.', 'e^k = 1.2.', 'So both are 1.2³.'], solution: 'Equal: e^(kt) = (e^k)ᵗ = 1.2ᵗ.' },
  'x-logdomain': { type: 'choice', ideas: ['log-graph', 'inverse'], prompt: 'g(x) = 2·log₂(x − 3) + 1. Domain and vertical asymptote?',
    options: [opt('a', 'x > 3; asymptote x = 3', true), opt('b', 'x > 0; asymptote x = 0', false, 'log-argument', 'The argument is x − 3, which must be positive.'), opt('c', 'x > −3; asymptote x = −3', false, 'log-argument', 'x − 3 > 0 means x > 3.'), opt('d', 'All reals; asymptote y = 1', false, 'asymptote', 'Logs have vertical asymptotes; exponentials have horizontal ones.')],
    hints: ['Argument > 0.', 'x − 3 > 0.', 'The asymptote is where the argument is 0.'], solution: 'Domain x > 3, vertical asymptote x = 3. It’s the inverse of an exponential, reflected across y = x.' },
  'x-series': { type: 'number', ideas: ['series', 'geometric'], answer: seriesSum(100, 1.2, 5), tolerance: 0.01, label: 'S₅', prompt: 'A sponsor contributes 100, 120, 144, 172.8, 207.36. Use Sₙ = a(rⁿ − 1)/(r − 1) for the first five.',
    traps: [{ value: term(100, 1.2, 5), code: 'whole-step', message: 'That’s a single term; add all five.' }, { value: 100 * (1.2 ** 5 - 1) / 1.2, code: 'arithmetic', message: 'Divide by r − 1 = 0.2.' }],
    hints: ['a = 100, r = 1.2, n = 5.', '1.2⁵ = 2.48832.', '100 × 1.48832 ÷ 0.2.'], solution: `S₅ = ${fmt(seriesSum(100, 1.2, 5), 2)}.` },
  'x-arith': { type: 'number', ideas: ['series', 'compare'], answer: arithSum(100, 20, 5), tolerance: 0.01, label: 'Arithmetic total', prompt: 'Compare: 100, 120, 140, 160, 180 (adding 20 each time). Total?',
    traps: [{ value: seriesSum(100, 1.2, 5), code: 'linear-exp', message: 'That’s the geometric total.' }], hints: ['n(first + last)/2.', '5(100 + 180)/2.', '= ?'], solution: '700: less than the geometric 744.16, and the gap grows with more terms.' }
};

// ================================================================ Final: The Final Engineering Report
export const FINAL_IDS = ['fa-model', 'fa-at', 'fa-cycle', 'fb-model', 'fb-at', 'fb-w', 'fb-linear', 'fc-exp', 'fc-n', 'fc-10db', 'fd-t', 'fd-why'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalSet(roundNo) {
  const S = pick(FINAL_SETS, roundNo - 1), f = 1 + S.B.pct / 100;
  return { ...S, f, aAt: term(S.A.A0, S.A.r, S.A.at), aN: solveExp(S.A.A0, S.A.r, S.A.threshold), aFirst: firstWhole(S.A.A0, S.A.r, S.A.threshold),
    bAt: term(S.B.R0, f, S.B.at), bW: solveExp(S.B.R0, f, S.B.target), bLinW: (S.B.target - S.B.R0) / S.B.step, cE: S.C.L / 10 - 12, dT: solveEnvelope(S.D.A0, S.D.k, S.D.target) };
}
export function finalQuestions(roundNo) {
  const F_ = finalSet(roundNo), { A: a, B: b, C: c, D: d } = F_, p = pctOf(a.r), fb = fmt(F_.f, 2);
  const qs = {
    set: F_,
    'fa-model': { type: 'choice', ideas: ['explicit', 'suspension'], prompt: `A simulated envelope starts at ${a.A0} mm and keeps ${p}% per cycle. Which model?`,
      options: [opt('a', `A(n) = ${a.A0}(${a.r})ⁿ`, true), opt('b', `A(n) = ${a.A0}(${fmt(1 - a.r, 2)})ⁿ`, false, 'rate-factor', `Keep ${p}%: factor ${a.r}.`), opt('c', `A(n) = ${a.A0} − ${a.r}n`, false, 'linear-exp', 'A percentage multiplies.'), opt('d', `A(n) = ${a.r}(${a.A0})ⁿ`, false, 'base-exponent', 'The factor is the base.')],
      hints: ['A₀rⁿ.', `A₀ = ${a.A0}.`, `r = ${a.r}.`], solution: `A(n) = ${a.A0}(${a.r})ⁿ: initial value ${a.A0} mm, decay factor ${a.r}.` },
    'fa-at': { type: 'number', ideas: ['decay', 'suspension'], answer: F_.aAt, tolerance: 0.001, unit: 'mm', label: `A(${a.at})`, prompt: `Amplitude after ${a.at} cycles (4 decimal places)?`,
      traps: [{ value: a.A0 * a.r * a.at, code: 'base-exponent', message: `${a.r}^${a.at}, not × ${a.at}.` }], hints: [`${a.r}^${a.at}.`, `≈ ${fmt(a.r ** a.at, 4)}.`, `× ${a.A0}.`], solution: `${fmt(F_.aAt, 4)} mm.` },
    'fa-cycle': { type: 'number', ideas: ['solve-exp', 'time'], answer: F_.aFirst, tolerance: 0.001, label: 'Cycle', prompt: `How many complete cycles until a peak is below ${a.threshold} mm?`,
      traps: [{ value: Math.floor(F_.aN), code: 'whole-step', message: 'Round up: that peak is still above the threshold.' }], hints: [`${a.r}ⁿ ≤ ${a.threshold}/${a.A0}.`, `n ≥ ln(${a.threshold}/${a.A0}) ÷ ln(${a.r}).`, 'Next whole cycle.'], solution: `n ≥ ${fmt(F_.aN, 2)}, so cycle ${F_.aFirst}.` },
    'fb-model': { type: 'choice', ideas: ['factors', 'event'], prompt: `A festival starts with ${b.R0} registrations, growing ${b.pct}% a week. Which model?`,
      options: [opt('a', `R(w) = ${b.R0}(${fb})ʷ`, true), opt('b', `R(w) = ${b.R0}(${fmt(b.pct / 100, 2)})ʷ`, false, 'rate-factor', 'Factor = 1 + rate.'), opt('c', `R(w) = ${b.R0} + ${b.pct}w`, false, 'additive-percent', 'A percentage multiplies.'), opt('d', `R(w) = ${b.R0}(1.${String(b.pct).padStart(2, '0')})^${b.pct}w`, false, 'base-exponent', 'The exponent is just w.')],
      hints: ['R₀ × factorʷ.', `1 + ${b.pct / 100}.`, `R₀ = ${b.R0}.`], solution: `R(w) = ${b.R0}(${fb})ʷ.` },
    'fb-at': { type: 'number', ideas: ['growth', 'event'], answer: F_.bAt, tolerance: 0.01, label: `R(${b.at})`, prompt: `Projected registrations after ${b.at} weeks (2 decimal places)?`,
      traps: [{ value: b.R0 * (1 + b.pct / 100 * b.at), code: 'additive-percent', message: 'The percentages compound.' }], hints: [`${fb}^${b.at}.`, `× ${b.R0}.`, 'Keep two decimals.'], solution: `${fmt(F_.bAt, 2)}.` },
    'fb-w': { type: 'number', ideas: ['solve-exp', 'time'], answer: F_.bW, tolerance: 0.01, unit: 'weeks', label: 'w', prompt: `When do projected registrations reach ${b.target}? (2 decimal places)`,
      traps: [{ value: F_.bLinW, code: 'linear-exp', message: 'That’s the linear model.' }], hints: [`${fb}ʷ = ${b.target}/${b.R0}.`, `w = ln(${b.target}/${b.R0}) ÷ ln(${fb}).`, 'Divide.'], solution: `w ≈ ${fmt(F_.bW, 2)} weeks; at weekly check-ins, first reached in week ${firstWhole(b.R0, F_.f, b.target)}.` },
    'fb-linear': { type: 'choice', ideas: ['compare'], prompt: `Compare a linear model adding ${b.step} riders a week from ${b.R0}. When does it reach ${b.target}?`,
      options: [opt('a', `Later: at w ≈ ${fmt(F_.bLinW, 2)}, after the exponential model’s ${fmt(F_.bW, 2)}`, true), opt('b', 'At the same time', false, 'linear-exp', 'They start together but the exponential one pulls ahead.'), opt('c', `Earlier: at w ≈ ${fmt(F_.bW - 1, 2)}`, false, 'linear-exp', `Solve ${b.R0} + ${b.step}w = ${b.target}.`), opt('d', 'Never', false, 'linear-exp', 'A linear model with a positive slope reaches any target eventually.')],
      hints: [`${b.R0} + ${b.step}w = ${b.target}.`, `w = ${b.target - b.R0} ÷ ${b.step}.`, 'Compare.'], solution: `Linear: w = ${fmt(F_.bLinW, 2)}. The exponential model gets there first.` },
    'fc-exp': { type: 'choice', ideas: ['conversion', 'sound'], prompt: `A sensor reads ${c.L} dB: ${c.L} = 10·log₁₀(I/10⁻¹²). Which is the exponential form?`,
      options: [opt('a', `I/10⁻¹² = 10${sup(c.L / 10)}`, true), opt('b', `I/10⁻¹² = ${c.L / 10}`, false, 'exponentiate', 'Exponentiate: 10 to the power.'), opt('c', `I = 10${sup(c.L)}`, false, 'exponentiate', 'Divide by 10 first, and keep I₀.'), opt('d', `I/10⁻¹² = 10 × ${c.L / 10}`, false, 'base-exponent', 'It’s a power: 10 raised to L/10, not 10 times it.')],
      hints: ['Divide by 10.', `${c.L / 10} = log₁₀(I/10⁻¹²).`, 'log_b y = x ⇔ bˣ = y.'], solution: `I/10⁻¹² = 10${sup(c.L / 10)}.` },
    'fc-n': { type: 'number', ideas: ['solve-log', 'sound'], answer: F_.cE, tolerance: 0.001, label: 'n in I = 10ⁿ', prompt: 'So I = 10ⁿ W/m². What is n?',
      traps: [{ value: c.L / 10, code: 'negative-exponent', message: 'Multiply by 10⁻¹²: add −12 to the exponent.' }, { value: c.L / 10 + 12, code: 'negative-exponent', message: 'I = 10⁻¹² × 10^(L/10).' }], hints: ['I = 10⁻¹² × 10^(L/10).', 'Add exponents.', `${c.L / 10} − 12.`], solution: `I = ${pow10(F_.cE)} W/m².` },
    'fc-10db': { type: 'choice', ideas: ['sound', 'log-graph'], prompt: `What would ${c.L + 10} dB mean compared with ${c.L} dB?`,
      options: [opt('a', 'Ten times the intensity', true), opt('b', '10 W/m² more', false, 'log-meaning', 'A factor, not an amount.'), opt('c', `${fmt((c.L + 10) / c.L, 2)} times the intensity`, false, 'log-meaning', 'Ratios of decibels aren’t ratios of intensity.'), opt('d', 'Twice the intensity', false, 'log-meaning', 'Doubling is about +3 dB.')],
      hints: ['+10 dB → +1 in the exponent.', '10 to one more power.', '×10.'], solution: '+10 dB = ×10 intensity.' },
    'fd-t': { type: 'number', ideas: ['solve-exp', 'natural-log', 'time'], answer: F_.dT, tolerance: 0.01, unit: 's', label: 't', prompt: `A(t) = ${d.A0}e^(−${d.k}t). When does the envelope fall to ${d.target} mm? (2 decimal places)`,
      traps: [{ value: Math.log10(d.A0 / d.target) / d.k, code: 'log-ln', message: 'Undo e with ln.' }, { value: (d.A0 - d.target) / d.k, code: 'exponentiate', message: 'Divide, then take ln.' }],
      hints: [`e^(−${d.k}t) = ${d.target}/${d.A0}.`, `−${d.k}t = ln(${d.target}/${d.A0}).`, 'Divide by −' + d.k + '.'], solution: `t = ln(${d.target}/${d.A0}) ÷ (−${d.k}) ≈ ${fmt(F_.dT, 2)} s.` },
    'fd-why': { type: 'choice', ideas: ['inverse', 'natural-log'], prompt: 'Why are logarithms needed to solve for t?',
      options: [opt('a', 't is in the exponent; ln is the inverse of eˣ, so it brings t down', true), opt('b', 'To make the numbers smaller', false, 'log-meaning', 'Logs undo exponentials.'), opt('c', 'They aren’t: divide by e', false, 'log-division', 'Dividing by e doesn’t isolate an exponent.'), opt('d', 'Because the answer is negative', false, 'log-meaning', 'The time is positive.')],
      hints: ['Where is t?', 'In the exponent.', 'What undoes eˣ?'], solution: 'ln(eˣ) = x: the natural log is the inverse of the exponential, so it frees the exponent.' }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...EXT }));
export const MISSIONS = [
  { id: 'bounce', n: 1, title: 'Tune the bounce', short: 'Tune the Bounce', minutes: '7–8', focus: 'Exponential decay · geometric sequences · transformations · base e · solving with ln',
    blurb: 'How fast does the shock’s remaining oscillation die away after a hit?', graded: Object.keys(M1) },
  { id: 'grow', n: 2, title: 'Grow the ride', short: 'Grow the Ride', minutes: '5–6', focus: 'Exponential growth · linear vs exponential · time to a target',
    blurb: 'A trail festival’s registrations grow 20% a week. When do they hit 250?', graded: Object.keys(M2) },
  { id: 'sound', n: 3, title: 'Decode the sound', short: 'Decode the Sound', minutes: '6–7', focus: 'Logarithms · decibels · log properties · change of base · log equations',
    blurb: 'Why do sound meters use decibels, and how do you turn a reading back into an intensity?', graded: Object.keys(M3) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  const gen = [[BOUNCE_PRACTICE, bouncePractice, BOUNCE_PRACTICE_IDS], [GROW_PRACTICE, growPractice, GROW_PRACTICE_IDS], [SOUND_PRACTICE, soundPractice, SOUND_PRACTICE_IDS]];
  for (const [list, fn, ids] of gen) for (let n = 0; n < list.length; n++) { const P_ = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...P_[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
export { fmt, sciText };
