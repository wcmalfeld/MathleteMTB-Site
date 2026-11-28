// Race-Day Workshop: every graded question. Answers are computed from the
// models (logic/models.js), never typed in by hand, and each question has
// three progressive hints (direction, relationship, next step), a full
// solution that says what the answer means on the bike, and "traps":
// anticipated wrong answers, each with a misconception code and a message.
//
// Question shape (the lesson kit's ask(), learning-lab/lesson-kit/ask.js):
//   { type: 'choice' | 'multi' | 'number' | 'fields', prompt, options | answer | fields,
//     hints: [3], solution, ideas: [...] }

import {
  PRD, SAG_RANGE, sagWindow, sagReading, sagPercent, raceStage, naiveSpeed, minutes, survey,
  radicalCandidates, RACE_PRACTICE, FINAL_SETS, pick, round
} from './models.js';

// Display numbers without float noise or trailing zeros: 17.875, 0.25, 18.
export const nf = x => String(Number(Number(x).toPrecision(12)));
// Generated numbers can make two anticipated mistakes give the same value
// (on a 50 mm shock the window is 2.5 mm wide, the same as the 2.5-point
// tolerance in percent). Keep the first trap for each value, and never one
// that would equal the answer.
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object') continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Math.round(t.value * 1e6); const clash = Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, 0.01, Math.abs(f.answer) * 0.015); if (seen.has(k) || clash) return false; seen.add(k); return true; });
    }
  }
  return qs;
}
const opt = (id, text, correct, code, feedback) => ({ id, text, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });

// The ideas each question practices. These become curriculum skills in
// content/classes/activities.mjs, and the end-of-workshop report groups
// results by them.
export const IDEAS = {
  formula: 'Rearranging formulas',
  model: 'Writing an equation from a situation',
  'abs-eq': 'Absolute value equations',
  'abs-ineq': 'Absolute value inequalities',
  compound: 'Compound inequalities and interval notation',
  'rational-eq': 'Rational equations',
  'rational-ineq': 'Rational inequalities',
  'radical-eq': 'Radical equations',
  verify: 'Checking solutions',
  domain: 'Domain restrictions',
  interpret: 'Interpreting solutions in context',
  complex: 'No real solution (complex numbers)'
};
// The PRD's eight tracked areas, in its order.
export const REPORT_IDEAS = ['formula', 'abs-eq', 'abs-ineq', 'rational-eq', 'rational-ineq', 'radical-eq', 'verify', 'domain'];

// Misconceptions the feedback recognises (codes stored with each attempt).
export const MISCONCEPTIONS = {
  'pct-vs-mm': 'Mixing up sag percentage and millimetres',
  'no-percent': 'Forgetting the ÷ 100 in a percentage',
  inverted: 'Dividing the wrong way round (stroke ÷ sag)',
  complement: 'Using the uncompressed part of the stroke',
  range: 'Misreading what an acceptable range includes',
  direction: 'Treating distance from a target as direction',
  'dev-vs-value': 'Confusing the deviation with the value itself',
  'abs-flip': 'Writing the outside of an absolute value range',
  'forgot-shift': 'Not adding the target back to every part',
  endpoints: 'Leaving out the endpoints of a ≤ inequality',
  'same-stroke': 'Keeping the old stroke after it changed',
  'average-speeds': 'Averaging two speeds without weighting by time',
  'dist-time': 'Confusing distance, speed and time',
  'hours-not-min': 'Leaving a time in hours',
  reciprocal: 'Losing track of v when it is in a denominator',
  target: 'Confusing the overall target with the section speed',
  'forgot-section1': 'Leaving out the time already ridden',
  domain: 'Ignoring that the speed must be positive',
  flip: 'Flipping an inequality at the wrong time',
  'add-distances': 'Adding distances that are at right angles',
  'legs-hyp': 'Putting the straight-line distance in as a leg',
  subtract: 'Subtracting distances instead of their squares',
  'forgot-root': 'Stopping at h² instead of h',
  'both-roots': 'Forgetting the negative square root',
  'root-sign': 'Thinking √ gives both signs',
  'square-sum': 'Squaring a sum instead of adding squares',
  'no-check': 'Not checking candidates in the original equation',
  'factor-sign': 'A sign slip when factoring',
  'sign-square': 'Forgetting that a real number squared is never negative',
  'no-complex': 'Not knowing that complex solutions exist'
};

// ================================================================ Mission 1
const T0 = PRD.stroke, W0 = sagWindow(T0), R17 = sagReading(PRD.guidedSag, T0);
const T80 = PRD.practiceStroke, W80 = sagWindow(T80);
const mid = W0.midPct, tol = W0.tolPct;

const M1 = {
  'm1-rearrange': {
    type: 'choice', ideas: ['formula'],
    prompt: 'The sag formula is p = s ÷ T × 100. The mechanic knows the target percentage p and the stroke T, and needs the sag s in millimetres. Which rearrangement is right?',
    options: [
      opt('a', 's = p × T ÷ 100', true),
      opt('b', 's = 100 × T ÷ p', false, 'inverted', 'Try it with numbers: 25% of a 60 mm shock would come out as 240 mm, four times the whole stroke.'),
      opt('c', 's = p ÷ (100 × T)', false, 'inverted', 'Try it: 25 ÷ 6000 is about 0.004 mm. Undoing “÷ T” means multiplying by T.'),
      opt('d', 's = 100 × p ÷ T', false, 'no-percent', 'That undoes the steps in the wrong direction: ÷ 100 undoes × 100, and × T undoes ÷ T.')
    ],
    hints: ['Undo what was done to s, in reverse order.', 's was divided by T, then multiplied by 100. Undo × 100 first, then undo ÷ T.', 'Divide both sides by 100: p ÷ 100 = s ÷ T. Now multiply both sides by T.'],
    solution: 'p ÷ 100 = s ÷ T, so s = p × T ÷ 100. Test it with numbers you can picture: 25% of a 60 mm stroke is 25 × 60 ÷ 100 = 15 mm, a quarter of the shock.'
  },
  'm1-sag-min': {
    type: 'number', ideas: ['formula', 'model'], answer: W0.minMm, tolerance: 0.01, unit: 'mm', label: 'Sag at 25%',
    prompt: `The shock has a ${T0} mm stroke. How many millimetres of sag is 25%? Solve 25 = s ÷ ${T0} × 100.`,
    traps: [
      { value: 25 * T0, code: 'no-percent', message: `That’s 25 × ${T0}: the percentage still needs dividing by 100.` },
      { value: 0.25, code: 'pct-vs-mm', message: `0.25 is 25% written as a decimal. Multiply it by the ${T0} mm stroke to get millimetres.` },
      { value: T0 / 0.25, code: 'inverted', message: `You divided ${T0} by 0.25. Sag can’t be more than the whole ${T0} mm stroke.` },
      { value: T0 / 25, code: 'inverted', message: `That’s ${T0} ÷ 25. Multiply instead: 25% of ${T0} is 0.25 × ${T0}.` },
      { value: T0 * 0.75, code: 'complement', message: 'That’s the 75% of the stroke left over. Sag is the 25% that compresses.' }
    ],
    hints: [`25% means 25 out of every 100. What’s a quarter of ${T0}?`, `Divide both sides by 100: 0.25 = s ÷ ${T0}.`, `Multiply both sides by ${T0}: s = 0.25 × ${T0}.`],
    solution: `0.25 × ${T0} = ${nf(W0.minMm)} mm. At 25% sag the shock sits ${nf(W0.minMm)} mm into its ${T0} mm stroke: the bottom of the window.`
  },
  'm1-sag-max': {
    type: 'number', ideas: ['formula', 'model'], answer: W0.maxMm, tolerance: 0.01, unit: 'mm', label: 'Sag at 30%',
    prompt: `Now the top of the window. How many millimetres is 30% of the ${T0} mm stroke?`,
    traps: [
      { value: 30 * T0, code: 'no-percent', message: `That’s 30 × ${T0}: divide by 100 as well.` },
      { value: 0.3, code: 'pct-vs-mm', message: `0.3 is 30% as a decimal. Multiply it by ${T0} mm.` },
      { value: T0 / 0.3, code: 'inverted', message: `You divided ${T0} by 0.3, which gives more than the whole stroke.` },
      { value: T0 / 30, code: 'inverted', message: `That’s ${T0} ÷ 30. 30% of ${T0} is 0.30 × ${T0}.` },
      { value: T0 * 0.7, code: 'complement', message: 'That’s the 70% left over, not the 30% that compresses.' }
    ],
    hints: ['Same equation, new percentage: 30 = s ÷ 60 × 100.', 's = p × T ÷ 100.', `s = 0.30 × ${T0}.`],
    solution: `0.30 × ${T0} = ${nf(W0.maxMm)} mm. So for this practice shock any sag from ${nf(W0.minMm)} mm to ${nf(W0.maxMm)} mm is inside the 25–30% window.`
  },
  'm1-sag-pct': {
    type: 'number', ideas: ['formula'], answer: R17.pct, tolerance: 0.05, unit: '%', label: 'Sag percentage',
    prompt: `The mechanic measures ${PRD.guidedSag} mm of sag on the ${T0} mm shock. What percentage of the stroke is that? (Round to one decimal place.)`,
    traps: [
      { value: R17.pct / 100, code: 'pct-vs-mm', message: 'That’s the fraction of the stroke as a decimal. Multiply by 100 for a percentage.' },
      { value: (T0 / PRD.guidedSag) * 100, code: 'inverted', message: 'That’s stroke ÷ sag. The formula is measured sag over total stroke.' },
      { value: PRD.guidedSag, code: 'pct-vs-mm', message: `${PRD.guidedSag} is the sag in millimetres. The question asks what percentage of the stroke it is.` },
      { value: T0 / PRD.guidedSag, code: 'inverted', message: 'Divide the sag by the stroke, not the other way round.' }
    ],
    hints: ['A percentage compares a part with the whole. Which number is the part?', 'p = s ÷ T × 100, with s = 17 and T = 60.', '17 ÷ 60 = 0.2833… Now multiply by 100.'],
    solution: `${PRD.guidedSag} ÷ ${T0} × 100 = ${nf(round(R17.pct, 2))}%. The rider’s weight compresses the shock through about ${Math.round(R17.pct)}% of its stroke.`
  },
  'm1-sag-check': {
    type: 'choice', ideas: ['interpret', 'compound'],
    prompt: `Is ${PRD.guidedSag} mm (${nf(round(R17.pct, 1))}%) inside the 25–30% window?`,
    options: [
      opt('a', `Yes: ${nf(round(R17.pct, 1))}% is between 25% and 30%`, true),
      opt('b', `No: ${PRD.guidedSag} is less than 25, so it’s under`, false, 'pct-vs-mm', `${PRD.guidedSag} is millimetres and 25 is a percentage. Compare like with like: ${PRD.guidedSag} mm sits between ${nf(W0.minMm)} and ${nf(W0.maxMm)} mm.`),
      opt('c', 'No: only exactly 27.5% passes', false, 'range', 'A window means any value from 25% up to 30% is acceptable, not only the middle.'),
      opt('d', 'You can’t tell without the rider’s weight', false, 'range', 'The weight is already in the measurement: it’s what compressed the shock 17 mm.')
    ],
    hints: ['Compare numbers that have the same unit.', 'Either compare 28.3% with 25% and 30%, or 17 mm with 15 mm and 18 mm.', 'Is 25 ≤ 28.3 ≤ 30 true?'],
    solution: `It’s inside: 28.3% is between 25% and 30% (and ${PRD.guidedSag} mm is between ${nf(W0.minMm)} and ${nf(W0.maxMm)} mm). In this practice scenario the setup passes the check.`
  },
  'm1-range-80': {
    type: 'fields', ideas: ['formula', 'model'],
    prompt: `A different practice shock has an ${T80} mm stroke, with the same 25–30% window. What is the allowable sag range in millimetres?`,
    fields: [
      { id: 'lo', label: 'Minimum sag', answer: W80.minMm, tolerance: 0.01, unit: 'mm', traps: [{ value: W0.minMm, code: 'same-stroke', message: `That’s the ${T0} mm shock’s minimum. Use the new ${T80} mm stroke.` }, { value: 0.25, code: 'pct-vs-mm', message: 'Multiply 0.25 by the stroke.' }, { value: 25 * T80, code: 'no-percent', message: 'Divide by 100 too.' }] },
      { id: 'hi', label: 'Maximum sag', answer: W80.maxMm, tolerance: 0.01, unit: 'mm', traps: [{ value: W0.maxMm, code: 'same-stroke', message: `That’s the ${T0} mm shock’s maximum. Use ${T80} mm.` }, { value: 0.3, code: 'pct-vs-mm', message: 'Multiply 0.30 by the stroke.' }, { value: 30 * T80, code: 'no-percent', message: 'Divide by 100 too.' }] }
    ],
    hints: ['Same formula, new stroke. Only T changes.', 's = p × T ÷ 100, with T = 80 and p = 25, then p = 30.', '0.25 × 80 and 0.30 × 80.'],
    solution: `0.25 × ${T80} = ${nf(W80.minMm)} mm and 0.30 × ${T80} = ${nf(W80.maxMm)} mm, so ${nf(W80.minMm)}–${nf(W80.maxMm)} mm. A longer stroke means more millimetres for the same percentage.`
  },
  'm1-abs-pick': {
    type: 'multi', ideas: ['abs-ineq'],
    prompt: `Three bikes are measured: 24%, 27% and 31%. Which satisfy |p − ${mid}| ≤ ${tol}?`,
    options: [24, 27, 31].map(p => {
      const d = Math.abs(p - mid);
      return opt('p' + p, p + '%', d <= tol, 'range', `|${p} − ${mid}| = ${nf(d)}, which is more than ${tol}: ${p < mid ? 'under' : 'over'} the window.`);
    }),
    hints: ['Absolute value is a distance. How far is each reading from 27.5?', 'Work out |24 − 27.5|, |27 − 27.5| and |31 − 27.5|.', 'Keep the ones whose distance is 2.5 or less.'],
    solution: `|24 − 27.5| = 3.5, |27 − 27.5| = 0.5, |31 − 27.5| = 3.5. Only 27% is within 2.5 points of the target. 24% and 31% miss by the same distance, in opposite directions.`
  },
  'm1-abs-bounds': {
    type: 'fields', ideas: ['abs-eq'],
    prompt: `Now solve the equation |p − ${mid}| = ${tol}. Which two sag percentages are exactly ${tol} points from the target?`,
    fields: [
      { id: 'lo', label: 'Lower value', answer: mid - tol, tolerance: 0.001, unit: '%', traps: [{ value: tol, code: 'dev-vs-value', message: `${tol} is the distance from the target, not a sag percentage. Go ${tol} down from ${mid}.` }, { value: -tol, code: 'dev-vs-value', message: `−${tol} solves p − ${mid} = −${tol} only for p − ${mid}. Add ${mid} back.` }] },
      { id: 'hi', label: 'Upper value', answer: mid + tol, tolerance: 0.001, unit: '%', traps: [{ value: tol, code: 'dev-vs-value', message: `Add ${tol} to ${mid}.` }] }
    ],
    hints: ['Which numbers are exactly 2.5 away from 27.5 on a number line?', 'Split it into two cases: p − 27.5 = 2.5 or p − 27.5 = −2.5.', 'Add 27.5 to both sides of each case.'],
    solution: `p − ${mid} = ${tol} gives p = ${mid + tol}; p − ${mid} = −${tol} gives p = ${mid - tol}. They’re the two ends of the window: an absolute value equation finds the boundaries, and the inequality fills in everything between them.`
  },
  'm1-abs-direction': {
    type: 'choice', ideas: ['abs-ineq', 'interpret'],
    prompt: 'Two readings: 26% and 29%. Which one is closer to the 27.5% target?',
    options: [
      opt('a', 'Neither: both are 1.5 points away', true),
      opt('b', '29%, because it’s bigger', false, 'direction', 'Bigger isn’t closer: |29 − 27.5| = 1.5 and |26 − 27.5| = 1.5.'),
      opt('c', '26%, because under the target is closer', false, 'direction', 'Absolute value ignores direction: both readings are 1.5 points away.'),
      opt('d', 'Neither is in the window', false, 'range', 'Both are inside 25–30%: each is only 1.5 points from the middle.')
    ],
    hints: ['Distance on a number line has no direction.', 'Work out |26 − 27.5| and |29 − 27.5|.', 'Compare the two distances.'],
    solution: '|26 − 27.5| = 1.5 and |29 − 27.5| = 1.5. One is under the target and one is over, but absolute value measures distance, not direction, so they’re equally close.'
  },
  'm1-compound': {
    type: 'choice', ideas: ['compound', 'abs-ineq'],
    prompt: `Write |p − ${mid}| ≤ ${tol} without the absolute value. Which compound inequality and interval are right?`,
    options: [
      opt('a', '25 ≤ p ≤ 30, the interval [25, 30]', true),
      opt('b', 'p ≤ 25 or p ≥ 30', false, 'abs-flip', 'That’s the outside of the window, the solution of |p − 27.5| ≥ 2.5.'),
      opt('c', '−2.5 ≤ p ≤ 2.5', false, 'forgot-shift', 'That’s the range for p − 27.5, not p. Add 27.5 to all three parts.'),
      opt('d', '25 < p < 30, the interval (25, 30)', false, 'endpoints', '≤ includes the boundaries: 25% and 30% are both allowed, so the brackets are square.')
    ],
    hints: ['“Within 2.5 of 27.5” is a sandwich: a lower and an upper limit.', '|x| ≤ 2.5 means −2.5 ≤ x ≤ 2.5. Here x = p − 27.5.', 'Add 27.5 to every part of −2.5 ≤ p − 27.5 ≤ 2.5.'],
    solution: '−2.5 ≤ p − 27.5 ≤ 2.5, then add 27.5 to every part: 25 ≤ p ≤ 30, or [25, 30] in interval notation. It’s the same window you found with millimetres, now written three ways: absolute value, compound inequality and interval.'
  }
};

// ================================================================ Mission 2
const S0 = raceStage(PRD.stage), NAIVE = naiveSpeed(PRD.stage);
const M2 = {
  'm2-target-time': {
    type: 'number', ideas: ['model'], answer: minutes(S0.tTarget), tolerance: 0.01, unit: 'min', label: 'Time allowed',
    prompt: `The stage is ${S0.total} km and the target is an average of ${S0.target} km/h. How many minutes does that allow for the whole stage?`,
    traps: [
      { value: S0.tTarget, code: 'hours-not-min', message: 'That’s the time in hours. Multiply by 60 for minutes.' },
      { value: S0.total * S0.target, code: 'dist-time', message: 'That’s distance × speed. Time = distance ÷ speed.' },
      { value: S0.target / S0.total, code: 'dist-time', message: 'That’s speed ÷ distance. Time = distance ÷ speed.' }
    ],
    hints: ['Average speed = total distance ÷ total time. Which one do you need?', 'Rearrange: total time = total distance ÷ average speed.', `${S0.total} ÷ ${S0.target} = 0.25 hours. Now convert to minutes.`],
    solution: `t = ${S0.total} ÷ ${S0.target} = ${nf(S0.tTarget)} hours = ${nf(minutes(S0.tTarget))} minutes for the whole stage.`
  },
  'm2-time-used': {
    type: 'number', ideas: ['model'], answer: minutes(S0.t1), tolerance: 0.01, unit: 'min', label: 'Section 1 time',
    prompt: `Section 1 was ${S0.d1} km at ${S0.v1} km/h. How many minutes did it take?`,
    traps: [
      { value: S0.t1, code: 'hours-not-min', message: 'That’s in hours. Multiply by 60.' },
      { value: S0.d1 * S0.v1, code: 'dist-time', message: 'That’s distance × speed. Time = distance ÷ speed.' }
    ],
    hints: ['Time = distance ÷ speed.', `t₁ = ${S0.d1} ÷ ${S0.v1} hours.`, `1/12 of an hour is 60 ÷ 12 minutes.`],
    solution: `t₁ = ${S0.d1}/${S0.v1} hour = ${nf(minutes(S0.t1))} minutes. That leaves ${nf(minutes(S0.tLeft))} of the ${nf(minutes(S0.tTarget))} minutes for the last ${S0.d2} km.`
  },
  'm2-average-trap': {
    type: 'choice', ideas: ['rational-eq', 'interpret'],
    prompt: `A teammate says: “Section 1 was ${S0.v1} km/h and we want ${S0.target}, so average them: (${S0.v1} + v) ÷ 2 = ${S0.target}, v = ${nf(NAIVE)} km/h.” What’s wrong?`,
    options: [
      opt('a', 'The sections take different times, so the speeds can’t simply be averaged', true),
      opt('b', `Nothing is wrong: ${nf(NAIVE)} km/h on section 2 averages ${S0.target} overall`, false, 'average-speeds', `Check it: ${S0.d2} km at ${nf(NAIVE)} km/h is ${nf(minutes(S0.d2 / NAIVE))} minutes, plus ${nf(minutes(S0.t1))} is ${nf(minutes(S0.t1 + S0.d2 / NAIVE))} minutes, an average of ${nf(round(S0.total / (S0.t1 + S0.d2 / NAIVE), 1))} km/h, not ${S0.target}.`),
      opt('c', 'They should have averaged the two section distances, not the speeds', false, 'dist-time', 'Averaging distances doesn’t give a speed. Work with time: distance ÷ speed for each section.'),
      opt('d', 'The rider has to ride exactly 16 km/h on both of the sections', false, 'target', 'Section 1 was already slower than 16, so section 2 has to be faster to make up the time.')
    ],
    hints: ['Averaging two speeds treats both sections as equally long in time. Are they?', 'Average speed = total distance ÷ total time.', 'Try v = 20: how long would the stage take?'],
    solution: 'A simple average only works if the rider spends the same time at each speed. They don’t: the slow section takes longer per km. Average speed is total distance ÷ total time, so the equation has to add the times: 1/12 + 3/v = 4/16.'
  },
  'm2-solve': {
    type: 'number', ideas: ['rational-eq', 'model'], answer: S0.vNeeded, tolerance: 0.01, unit: 'km/h', label: 'v',
    prompt: `Solve the rational equation ${S0.d1}/${S0.v1} + ${S0.d2}/v = ${S0.total}/${S0.target} for v, the speed needed on section 2.`,
    traps: [
      { value: NAIVE, code: 'average-speeds', message: 'That’s what you get by averaging the speeds. The times have to add up, not the speeds.' },
      { value: S0.d2 * (S0.tLeft), code: 'reciprocal', message: 'That’s 3 × 1/6. If 3/v = 1/6, then v = 3 ÷ (1/6).' },
      { value: 1 / S0.tLeft, code: 'reciprocal', message: 'That’s 1 ÷ (1/6): the 3 km has gone missing.' },
      { value: S0.tLeft, code: 'reciprocal', message: '1/6 is the time left, in hours. You need the speed: 3 ÷ that time.' },
      { value: S0.target, code: 'target', message: '16 km/h is the target for the whole stage. Section 2 has to be faster to make up for section 1.' }
    ],
    hints: ['Get the term with v on its own first.', '1/4 − 1/12 = 3/12 − 1/12 = 2/12 = 1/6, so 3/v = 1/6.', 'Multiply both sides by 6v (allowed because v ≠ 0): 18 = v.'],
    solution: `3/v = 1/4 − 1/12 = 1/6. Multiply both sides by 6v (v ≠ 0): 18 = v. The rider needs ${nf(S0.vNeeded)} km/h on the last ${S0.d2} km.`
  },
  'm2-check': {
    type: 'fields', ideas: ['verify', 'rational-eq'],
    prompt: `Check v = ${nf(S0.vNeeded)}. How long does section 2 take, and what’s the total time?`,
    fields: [
      { id: 't2', label: 'Section 2 time', answer: minutes(S0.d2 / S0.vNeeded), tolerance: 0.01, unit: 'min', traps: [{ value: S0.d2 / S0.vNeeded, code: 'hours-not-min', message: 'That’s in hours. Multiply by 60.' }, { value: S0.d2 * S0.vNeeded, code: 'dist-time', message: 'Time = distance ÷ speed.' }] },
      { id: 'tot', label: 'Total time', answer: minutes(S0.tTarget), tolerance: 0.01, unit: 'min', traps: [{ value: minutes(S0.d2 / S0.vNeeded), code: 'forgot-section1', message: 'Add the 5 minutes already ridden on section 1.' }] }
    ],
    hints: ['Put v = 18 back into the time for section 2.', 't₂ = 3 ÷ 18 hours.', '3/18 = 1/6 hour = 10 minutes. Add section 1’s 5 minutes.'],
    solution: `Section 2: 3 ÷ ${nf(S0.vNeeded)} = 1/6 hour = 10 minutes. Total: 5 + 10 = 15 minutes for 4 km, which is 4 ÷ 0.25 = 16 km/h. It checks.`
  },
  'm2-domain': {
    type: 'choice', ideas: ['domain', 'rational-ineq'],
    prompt: 'The new rule is “15 minutes or less”, so 3/v ≤ 1/6. To clear the fraction you multiply both sides by 6v. Why does the ≤ stay the same way round?',
    options: [
      opt('a', 'v is a speed, so v > 0: multiplying by a positive keeps the direction', true),
      opt('b', 'Because v can’t be zero, so the sign can never change', false, 'domain', 'v ≠ 0 only stops you dividing by zero. If v could be negative, multiplying by it would flip the sign. The model needs v > 0.'),
      opt('c', 'Because an inequality never flips, whatever you multiply by', false, 'flip', 'They do flip when you multiply or divide both sides by a negative number: 2 < 3 but −2 > −3.'),
      opt('d', 'Because the answer, 18, is positive, so multiplying is safe', false, 'domain', 'At this step you don’t know v yet. The reason has to come from what v means: a speed.')
    ],
    hints: ['When does an inequality sign flip?', 'It flips when you multiply or divide by a negative number.', 'What do you know about the sign of a speed?'],
    solution: 'A speed is positive (v > 0), so 6v is positive and multiplying by it keeps ≤ as ≤. This is the domain restriction doing real work: without it you couldn’t clear the fraction safely.'
  },
  'm2-ineq': {
    type: 'choice', ideas: ['rational-ineq', 'domain'],
    prompt: 'Solve 1/12 + 3/v ≤ 1/4 for v, with v > 0.',
    options: [
      opt('a', 'v ≥ 18', true),
      opt('b', 'v ≤ 18', false, 'flip', 'Slower means more time. Try v = 12: 3 km takes 15 minutes, far more than the 10 that are left.'),
      opt('c', '0 < v ≤ 18', false, 'flip', 'Try v = 9: 3 km takes 20 minutes. Lower speeds take longer, so they can’t meet the limit.'),
      opt('d', 'v ≥ 1/6', false, 'reciprocal', '1/6 is the time left in hours, not a speed.')
    ],
    hints: ['Faster riding means less time. Which way should the answer point?', 'Subtract 1/12: 3/v ≤ 1/6.', 'Multiply by 6v (positive): 18 ≤ v.'],
    solution: '3/v ≤ 1/6. Multiply both sides by 6v, which is positive: 18 ≤ v, so v ≥ 18. Any average of 18 km/h or more on the last 3 km gets the rider in within 15 minutes.'
  }
};

// Independent challenge: a fresh stage each time (variant n).
export function practiceStage(n) { return raceStage(pick(RACE_PRACTICE, n)); }
export function practiceQuestions(n) {
  const S = practiceStage(n);
  const f = (a, b) => `${nf(a)}/${nf(b)}`;
  const brief = `Stage ${n + 1}: ${nf(S.total)} km. Section 1 was ${nf(S.d1)} km at ${nf(S.v1)} km/h. The rider wants an overall average of ${nf(S.target)} km/h. Section 2 is ${nf(S.d2)} km at speed v.`;
  return tidy({
    brief, stage: S,
    'm2x-model': {
      type: 'choice', ideas: ['model', 'rational-eq'],
      prompt: brief + ' Which equation models it?',
      options: [
        opt('a', `${f(S.d1, S.v1)} + ${f(S.d2, 'v')} = ${f(S.total, S.target)}`, true),
        opt('b', `(${nf(S.v1)} + v) ÷ 2 = ${nf(S.target)}`, false, 'average-speeds', 'That averages the speeds. The times have to add up: distance ÷ speed for each section.'),
        opt('c', `${nf(S.d1)} × ${nf(S.v1)} + ${nf(S.d2)} × v = ${nf(S.total)} × ${nf(S.target)}`, false, 'dist-time', 'Distance × speed isn’t a time. Time = distance ÷ speed.'),
        opt('d', `${f(S.d1, S.v1)} + v/${nf(S.d2)} = ${f(S.total, S.target)}`, false, 'dist-time', 'Section 2’s time is its distance ÷ its speed: ' + nf(S.d2) + '/v.')
      ].map((o, i, all) => all[(i + n) % all.length]),
      hints: ['Each section’s time is its distance ÷ its speed.', 'Time for section 1 + time for section 2 = time allowed for the whole stage.', `Time allowed = ${nf(S.total)} ÷ ${nf(S.target)}.`],
      solution: `${f(S.d1, S.v1)} + ${f(S.d2, 'v')} = ${f(S.total, S.target)}: the two section times add up to the time the target allows.`
    },
    'm2x-solve': {
      type: 'number', ideas: ['rational-eq'], answer: S.vNeeded, tolerance: 0.01, unit: 'km/h', label: 'v',
      prompt: 'Solve it. What average speed does section 2 need?',
      traps: [
        { value: naiveSpeed(S), code: 'average-speeds', message: 'That comes from averaging the speeds. Add the times instead.' },
        { value: S.target, code: 'target', message: 'That’s the overall target. Section 2 has to make up for section 1.' },
        { value: 1 / S.tLeft, code: 'reciprocal', message: 'You’ve lost the section 2 distance: v = distance ÷ time left.' },
        { value: S.d2 * S.tLeft, code: 'reciprocal', message: 'If d/v = t, then v = d ÷ t, not d × t.' }
      ],
      hints: [`Find the time allowed and the time already used, in hours or minutes.`, `Time left = ${nf(S.total)}/${nf(S.target)} − ${nf(S.d1)}/${nf(S.v1)} = ${nf(minutes(S.tLeft))} minutes.`, `${nf(S.d2)}/v = ${nf(minutes(S.tLeft))}/60, so v = ${nf(S.d2)} ÷ (${nf(minutes(S.tLeft))}/60).`],
      solution: `Allowed: ${nf(minutes(S.tTarget))} min. Used: ${nf(minutes(S.t1))} min. Left: ${nf(minutes(S.tLeft))} min = ${nf(S.tLeft)} h. v = ${nf(S.d2)} ÷ ${nf(round(S.tLeft, 6))} = ${nf(S.vNeeded)} km/h.`
    },
    'm2x-check': {
      type: 'fields', ideas: ['verify'],
      prompt: `Check your answer: at ${nf(S.vNeeded)} km/h, how long is section 2, and what’s the overall average speed?`,
      fields: [
        { id: 't2', label: 'Section 2 time', answer: minutes(S.d2 / S.vNeeded), tolerance: 0.01, unit: 'min', traps: [{ value: S.d2 / S.vNeeded, code: 'hours-not-min', message: 'That’s in hours. Multiply by 60.' }] },
        { id: 'avg', label: 'Overall average', answer: S.target, tolerance: 0.01, unit: 'km/h', traps: [{ value: (S.v1 + S.vNeeded) / 2, code: 'average-speeds', message: 'That’s the average of the two speeds. Use total distance ÷ total time.' }] }
      ],
      hints: ['Section 2 time = distance ÷ speed.', 'Overall average = total distance ÷ total time (in hours).', `Total time = ${nf(minutes(S.t1))} + section 2’s minutes.`],
      solution: `${nf(S.d2)} ÷ ${nf(S.vNeeded)} h = ${nf(minutes(S.d2 / S.vNeeded))} min. Total ${nf(minutes(S.tTarget))} min, and ${nf(S.total)} km ÷ ${nf(S.tTarget)} h = ${nf(S.target)} km/h. It checks.`
    },
    'm2x-meaning': {
      type: 'choice', ideas: ['rational-ineq', 'interpret'],
      prompt: `The rider only has to finish in ${nf(minutes(S.tTarget))} minutes or less. Which section 2 speeds work?`,
      options: [
        opt('a', `v ≥ ${nf(S.vNeeded)} km/h`, true),
        opt('b', `v ≤ ${nf(S.vNeeded)} km/h`, false, 'flip', 'Slower riding takes longer. Lower speeds miss the time.'),
        opt('c', `Exactly ${nf(S.vNeeded)} km/h`, false, 'range', '“Or less” makes it an inequality: anything faster finishes sooner, which also counts.'),
        opt('d', `v ≥ ${nf(S.target)} km/h`, false, 'target', `${nf(S.target)} is the overall target. Section 1 was ${S.v1 < S.target ? 'slower' : 'faster'}, so section 2 needs ${nf(S.vNeeded)}.`)
      ],
      hints: ['Faster riding means less time.', `${nf(S.d2)}/v ≤ time left, with v > 0.`, 'Multiplying by v (positive) keeps the direction.'],
      solution: `${nf(S.d2)}/v ≤ ${nf(round(S.tLeft, 6))} with v > 0 gives v ≥ ${nf(S.vNeeded)}. Any average of at least ${nf(S.vNeeded)} km/h on section 2 makes the time.`
    }
  });
}
export const PRACTICE_IDS = ['m2x-model', 'm2x-solve', 'm2x-check', 'm2x-meaning'];

// ================================================================ Mission 3
const V0 = survey(PRD.survey.a, PRD.survey.c);
const { m: RM, n: RN } = PRD.radical, CANDS = radicalCandidates(RM, RN);
const M3 = {
  'm3-model': {
    type: 'choice', ideas: ['model', 'radical-eq'],
    prompt: `The crew measured ${V0.a} m horizontally and ${V0.c} m in a straight line. Which equation describes the unknown elevation change h?`,
    options: [
      opt('a', `√(${V0.a}² + h²) = ${V0.c}`, true),
      opt('b', `${V0.a} + h = ${V0.c}`, false, 'add-distances', 'Distances at right angles don’t add. They combine through squares: a² + b² = c².'),
      opt('c', `√(${V0.c}² + h²) = ${V0.a}`, false, 'legs-hyp', `The straight line is the longest side (the hypotenuse), so ${V0.c} goes alone on the right.`),
      opt('d', `${V0.a}² + ${V0.c}² = h²`, false, 'legs-hyp', `That makes h the longest side. The ${V0.c} m straight line is the hypotenuse.`)
    ],
    hints: ['The horizontal run, the climb and the straight line form a right triangle.', 'a² + b² = c², where c is the side opposite the right angle.', 'Take the square root of both sides of 120² + h² = 125².'],
    solution: `The horizontal run and the elevation change are the legs; the straight line is the hypotenuse. 120² + h² = 125², or written for the distance itself: √(120² + h²) = 125. That’s a radical equation.`
  },
  'm3-solve': {
    type: 'fields', ideas: ['radical-eq'],
    prompt: `Solve √(${V0.a}² + h²) = ${V0.c}. Give both possible elevation changes.`,
    fields: [
      { id: 'up', label: 'Destination higher: h =', answer: V0.rise, tolerance: 0.01, unit: 'm', traps: [{ value: V0.c - V0.a, code: 'subtract', message: 'That’s 125 − 120. Square first: h² = 125² − 120².' }, { value: V0.h2, code: 'forgot-root', message: 'That’s h². Take the square root.' }, { value: Math.sqrt(V0.a ** 2 + V0.c ** 2), code: 'legs-hyp', message: 'That treats 125 as a leg. It’s the hypotenuse: subtract the squares.' }] },
      { id: 'down', label: 'Destination lower: h =', answer: -V0.rise, tolerance: 0.01, unit: 'm', traps: [{ value: V0.rise, code: 'both-roots', message: 'That’s the uphill answer. If the destination is lower, the change is negative.' }, { value: -(V0.c - V0.a), code: 'subtract', message: 'Square first: h² = 125² − 120².' }, { value: -V0.h2, code: 'forgot-root', message: 'That’s −h². Take the square root of h².' }] }
    ],
    hints: ['Get rid of the square root first.', 'Square both sides: 120² + h² = 125², so 14400 + h² = 15625.', 'h² = 1225. Which numbers square to 1225?'],
    solution: `Square: 14400 + h² = 15625, so h² = 1225 and h = ±35. +35 m: the destination is 35 m higher. −35 m: it’s 35 m lower.`
  },
  'm3-why-two': {
    type: 'choice', ideas: ['interpret', 'radical-eq'],
    prompt: 'Both +35 and −35 satisfy √(120² + h²) = 125. Why are both real answers?',
    options: [
      opt('a', 'h is squared, and (−35)² = 35²: the distance is the same up or down', true),
      opt('b', '−35 is an extraneous solution, so only the +35 answer counts', false, 'both-roots', 'Test it: √(14400 + 1225) = √15625 = 125. It checks, so it’s a real solution: the downhill case.'),
      opt('c', 'A square root always gives a positive and a negative answer', false, 'root-sign', 'The symbol √ means the positive root (√15625 = 125). The ± comes from solving h² = 1225.'),
      opt('d', 'One of them is a rounding error from taking the square root', false, 'both-roots', 'Both are exact: 35² = 1225 and (−35)² = 1225.')
    ],
    hints: ['What happens to the sign of h when you square it?', 'Compare 35² and (−35)².', 'Does the straight-line distance tell you whether you went up or down?'],
    solution: 'The equation only “sees” h², so it can’t tell up from down: 35² = (−35)² = 1225. The context decides: +35 if the destination is higher, −35 if it’s lower.'
  },
  'm3-verify': {
    type: 'number', ideas: ['verify'], answer: V0.a ** 2 + V0.rise ** 2, tolerance: 0.01, label: '120² + 35²',
    prompt: 'Verify h = 35 in the original equation. Work out 120² + 35² (then compare its square root with 125).',
    traps: [{ value: (V0.a + V0.rise) ** 2, code: 'square-sum', message: 'That’s (120 + 35)². Square each number, then add.' }, { value: V0.a + V0.rise, code: 'square-sum', message: 'Square each number first.' }, { value: V0.a * 2 + V0.rise * 2, code: 'square-sum', message: 'Squaring means multiplying a number by itself, not doubling it.' }],
    hints: ['Substitute h = 35 into the left side.', '120² = 14400 and 35² = 1225.', 'Add them, then take the square root.'],
    solution: '14400 + 1225 = 15625, and √15625 = 125. The left side equals the right side, so h = 35 checks. h = −35 gives the same 1225, so it checks too.'
  },
  'm3-candidates': {
    type: 'fields', ideas: ['radical-eq'],
    prompt: `Debugger: solve √(q + ${RM}) = q − ${RN} by squaring both sides. q + ${RM} = q² − ${2 * RN}q + ${RN * RN} simplifies to q(q − ${CANDS[1]}) = 0. What are the two candidates?`,
    fields: [
      { id: 'a', label: 'Smaller candidate', answer: CANDS[0], tolerance: 0.001, traps: [{ value: -CANDS[1], code: 'factor-sign', message: `q − ${CANDS[1]} = 0 gives q = +${CANDS[1]}. Check the smaller one: q = 0 makes the first factor zero.` }] },
      { id: 'b', label: 'Larger candidate', answer: CANDS[1], tolerance: 0.001, traps: [{ value: -CANDS[1], code: 'factor-sign', message: `q − ${CANDS[1]} = 0 gives q = ${CANDS[1]}, not −${CANDS[1]}.` }] }
    ],
    hints: ['A product is zero when one of its factors is zero.', `q(q − ${CANDS[1]}) = 0 means q = 0 or q − ${CANDS[1]} = 0.`, `Solve q − ${CANDS[1]} = 0.`],
    solution: `q = 0 or q = ${CANDS[1]}. These are only candidates: squaring can add answers that don’t satisfy the original equation, so both have to be tested.`
  },
  'm3-valid': {
    type: 'choice', ideas: ['verify', 'radical-eq'],
    prompt: `Test both candidates in the original equation √(q + ${RM}) = q − ${RN}. Which are real solutions?`,
    options: [
      opt('a', `q = ${CANDS[1]} only`, true),
      opt('b', 'q = 0 only', false, 'no-check', `Test q = 0: √9 = 3, but 0 − 3 = −3. 3 ≠ −3.`),
      opt('c', 'Both: they came out of the algebra', false, 'no-check', 'Squaring can create answers that don’t work. q = 0 gives √9 = −3, which is false, because √9 is 3.'),
      opt('d', 'Neither', false, 'no-check', `Test q = ${CANDS[1]}: √16 = 4 and 7 − 3 = 4. It works.`)
    ],
    hints: ['Put each candidate into the ORIGINAL equation, not the squared one.', 'q = 0: left side √9, right side 0 − 3.', 'q = 7: left side √16, right side 7 − 3.'],
    solution: `q = 0: √9 = 3 but 0 − 3 = −3, false. q = ${CANDS[1]}: √16 = 4 and 7 − 3 = 4, true. Only q = ${CANDS[1]} is a solution; q = 0 is extraneous.`
  },
  'm3-why-extraneous': {
    type: 'choice', ideas: ['verify'],
    prompt: 'Why did squaring produce the false candidate q = 0?',
    options: [
      opt('a', 'Squaring hides signs: √9 = −3 is false, but 9 = 9 is true', true),
      opt('b', 'There was a mistake when the equation was factored', false, 'no-check', 'The factoring is right: q² − 7q = q(q − 7). The false answer comes from squaring, not the factoring.'),
      opt('c', 'Zero can never be the solution of an equation', false, 'no-check', 'Zero can be a solution of plenty of equations. Here it fails the test in the original equation.'),
      opt('d', 'Square roots can be negative as well as positive', false, 'root-sign', 'The √ symbol means the non-negative root, which is why √9 = −3 is false.')
    ],
    hints: ['What do 3² and (−3)² have in common?', 'For q = 0 the original says 3 = −3. What does squaring do to that?', 'Squaring turns 3 = −3 (false) into 9 = 9 (true).'],
    solution: 'Squaring both sides throws away the sign: 3 = −3 is false, but 9 = 9 is true. So the squared equation has an extra solution the original doesn’t. That’s why every candidate gets checked in the original equation.'
  }
};

// ================================================================ Extension
const EXT = {
  'ext-solve': {
    type: 'choice', ideas: ['complex'],
    prompt: 'Solve x² + 16 = 0.',
    options: [
      opt('a', 'x = 4i or x = −4i', true),
      opt('b', 'x = 4 or x = −4', false, 'sign-square', '4² = 16, so 4² + 16 = 32, not 0. The same goes for (−4)².'),
      opt('c', 'x = −16', false, 'sign-square', 'x² = −16, not x = −16. Which number squares to −16?'),
      opt('d', 'There’s no solution of any kind', false, 'no-complex', 'No real solution, but there are complex ones: (4i)² = 16i² = −16.')
    ],
    hints: ['Get x² on its own first.', 'x² = −16. Can a real number squared be negative?', 'i² = −1, so (4i)² = 16 × (−1).'],
    solution: 'x² = −16, so x = ±√(−16) = ±4i. Check: (4i)² + 16 = 16i² + 16 = −16 + 16 = 0. There’s no real solution, but there are two complex ones.'
  },
  'ext-meaning': {
    type: 'choice', ideas: ['complex', 'interpret'],
    prompt: 'Suppose x stood for a setting on the bike. What does x = ±4i tell the mechanic?',
    options: [
      opt('a', 'No real setting works: 4i isn’t a measurement', true),
      opt('b', 'Set it to 4i, since that’s what the algebra gives', false, 'no-complex', 'You can’t dial in an imaginary number. 4i has no physical meaning as a measurement.'),
      opt('c', 'Set it to 4, the real part of the answer, instead', false, 'no-complex', '4i has no real part. And x = 4 doesn’t satisfy the equation: 16 + 16 ≠ 0.'),
      opt('d', 'The equation must have an algebra mistake somewhere', false, 'no-complex', 'The algebra is fine. It’s telling you the situation it models has no real solution.')
    ],
    hints: ['Is 4i a real number?', 'Could you measure 4i millimetres?', 'Complex solutions describe the algebra, not a setting.'],
    solution: 'Complex numbers let us write the algebraic solutions, but no real value of x works. For a real-world model that means there is no setting that satisfies it, and the model or the constraint has to change.'
  }
};

// ================================================================ Final certification
export const FINAL_IDS = ['final-a-min', 'final-a-max', 'final-a-abs', 'final-a-eval', 'final-b-speed', 'final-c-elev'];
export const PASS_MARK = 5;   // of 6, right without the solution shown
export function finalSet(roundNo) {
  const i = roundNo - 1;
  return { sag: pick(FINAL_SETS.sag, i), race: pick(FINAL_SETS.race, i), survey: pick(FINAL_SETS.survey, i) };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo);
  const T = F.sag.stroke, W = sagWindow(T), M = sagReading(F.sag.measured, T, SAG_RANGE);
  const R = raceStage(F.race), V = survey(F.survey.a, F.survey.c);
  const mm = x => nf(x) + ' mm';
  const evalOpts = [
    opt('in', `Inside: ${mm(W.minMm)} ≤ ${mm(M.sag)} ≤ ${mm(W.maxMm)}`, M.within, 'range', `|${nf(M.sag)} − ${nf(W.midMm)}| = ${nf(round(Math.abs(M.sag - W.midMm), 4))} mm, more than the ${nf(W.tolMm)} mm tolerance.`),
    opt('high', `Outside: more sag than the ${mm(W.maxMm)} maximum`, M.side === 'high', 'range', M.within ? `${mm(M.sag)} is between ${mm(W.minMm)} and ${mm(W.maxMm)}.` : `${mm(M.sag)} is below the ${mm(W.minMm)} minimum, not above the maximum.`),
    opt('low', `Outside: less sag than the ${mm(W.minMm)} minimum`, M.side === 'low', 'range', M.within ? `${mm(M.sag)} is between ${mm(W.minMm)} and ${mm(W.maxMm)}.` : `${mm(M.sag)} is above the ${mm(W.maxMm)} maximum, not below the minimum.`)
  ];
  return tidy({
    set: F,
    'final-a-min': {
      type: 'number', ideas: ['formula'], answer: W.minMm, tolerance: 0.006, unit: 'mm', label: 'Minimum sag',
      prompt: `A practice bike has a ${T} mm shock stroke and the same 25–30% window. What is the minimum allowable sag?`,
      traps: [{ value: W.maxMm, code: 'range', message: 'That’s the maximum (30%). The minimum is 25%.' }, { value: 25 * T, code: 'no-percent', message: 'Divide by 100 too.' }, { value: 0.25, code: 'pct-vs-mm', message: 'Multiply 0.25 by the stroke.' }, { value: T / 0.25, code: 'inverted', message: 'Multiply by 0.25; don’t divide.' }],
      hints: ['s = p × T ÷ 100.', `p = 25, T = ${T}.`, `0.25 × ${T}.`],
      solution: `0.25 × ${T} = ${mm(W.minMm)}.`
    },
    'final-a-max': {
      type: 'number', ideas: ['formula'], answer: W.maxMm, tolerance: 0.006, unit: 'mm', label: 'Maximum sag',
      prompt: 'And the maximum allowable sag?',
      traps: [{ value: W.minMm, code: 'range', message: 'That’s the minimum (25%). The maximum is 30%.' }, { value: 30 * T, code: 'no-percent', message: 'Divide by 100 too.' }, { value: 0.3, code: 'pct-vs-mm', message: 'Multiply 0.30 by the stroke.' }],
      hints: ['Same formula, the top of the window.', `p = 30, T = ${T}.`, `0.30 × ${T}.`],
      solution: `0.30 × ${T} = ${mm(W.maxMm)}.`
    },
    'final-a-abs': {
      type: 'fields', ideas: ['abs-ineq'],
      prompt: 'Write the window as an absolute value inequality |s − m| ≤ t, in millimetres. What are the midpoint m and the tolerance t?',
      fields: [
        { id: 'm', label: 'Midpoint m', answer: W.midMm, tolerance: 0.006, unit: 'mm', traps: [{ value: W.midPct, code: 'pct-vs-mm', message: 'That’s the midpoint in percent. This inequality is in millimetres.' }, { value: W.maxMm - W.minMm, code: 'dev-vs-value', message: 'That’s the width of the window. The midpoint is halfway between the ends.' }] },
        { id: 't', label: 'Tolerance t', answer: W.tolMm, tolerance: 0.006, unit: 'mm', traps: [{ value: W.tolPct, code: 'pct-vs-mm', message: 'That’s the tolerance in percentage points. Work in millimetres.' }, { value: W.maxMm - W.minMm, code: 'dev-vs-value', message: 'That’s the whole width. The tolerance is the distance from the middle to an end: half the width.' }] }
      ],
      hints: ['The midpoint is halfway between the minimum and the maximum.', 'm = (min + max) ÷ 2; t = (max − min) ÷ 2.', `m = (${nf(W.minMm)} + ${nf(W.maxMm)}) ÷ 2.`],
      solution: `m = (${nf(W.minMm)} + ${nf(W.maxMm)}) ÷ 2 = ${nf(W.midMm)} mm and t = (${nf(W.maxMm)} − ${nf(W.minMm)}) ÷ 2 = ${nf(W.tolMm)} mm, so |s − ${nf(W.midMm)}| ≤ ${nf(W.tolMm)}.`
    },
    'final-a-eval': {
      type: 'choice', ideas: ['abs-ineq', 'interpret'],
      prompt: `The mechanic measures ${mm(M.sag)} of sag. Where is it?`,
      options: evalOpts,
      hints: ['Compare the reading with the window, or use the inequality.', `Work out |${nf(M.sag)} − ${nf(W.midMm)}|.`, `Is that distance at most ${nf(W.tolMm)}?`],
      solution: `|${nf(M.sag)} − ${nf(W.midMm)}| = ${nf(round(Math.abs(M.sag - W.midMm), 4))} mm. ` + (M.within ? `That’s within the ${nf(W.tolMm)} mm tolerance: inside the window.` : `That’s more than the ${nf(W.tolMm)} mm tolerance: ${M.side === 'high' ? 'too much sag' : 'too little sag'} for this practice window.`)
    },
    'final-b-speed': {
      type: 'number', ideas: ['rational-eq'], answer: R.vNeeded, tolerance: 0.01, unit: 'km/h', label: 'v',
      prompt: `A rider completes the first ${nf(R.d1)} km of a ${nf(R.total)} km stage at ${nf(R.v1)} km/h and needs an overall average of ${nf(R.target)} km/h. What average speed is needed over the remaining ${nf(R.d2)} km?`,
      traps: [{ value: naiveSpeed(R), code: 'average-speeds', message: 'That averages the speeds. Add the times instead.' }, { value: R.target, code: 'target', message: 'That’s the overall target, not the section 2 speed.' }, { value: 1 / R.tLeft, code: 'reciprocal', message: 'You’ve lost the distance: v = distance ÷ time left.' }],
      hints: ['Write time for section 1 + time for section 2 = time allowed.', `${nf(R.d1)}/${nf(R.v1)} + ${nf(R.d2)}/v = ${nf(R.total)}/${nf(R.target)}.`, `${nf(R.d2)}/v = ${nf(round(R.tLeft, 6))} hours.`],
      solution: `${nf(R.d1)}/${nf(R.v1)} + ${nf(R.d2)}/v = ${nf(R.total)}/${nf(R.target)} → ${nf(round(R.t1, 6))} + ${nf(R.d2)}/v = ${nf(R.tTarget)} → ${nf(R.d2)}/v = ${nf(round(R.tLeft, 6))} → v = ${nf(R.vNeeded)} km/h.`
    },
    'final-c-elev': {
      type: 'fields', ideas: ['radical-eq'],
      prompt: `A mapped trail segment has a horizontal distance of ${V.a} m and a straight-line distance of ${V.c} m. What are the possible signed elevation changes?`,
      fields: [
        { id: 'up', label: 'Destination higher: h =', answer: V.rise, tolerance: 0.01, unit: 'm', traps: [{ value: V.c - V.a, code: 'subtract', message: 'Square first: h² = c² − a².' }, { value: V.h2, code: 'forgot-root', message: 'That’s h². Take the square root.' }] },
        { id: 'down', label: 'Destination lower: h =', answer: -V.rise, tolerance: 0.01, unit: 'm', traps: [{ value: V.rise, code: 'both-roots', message: 'Going down, the change is negative.' }, { value: -V.h2, code: 'forgot-root', message: 'Take the square root of h².' }] }
      ],
      hints: [`√(${V.a}² + h²) = ${V.c}.`, `Square: h² = ${V.c}² − ${V.a}² = ${nf(V.h2)}.`, 'Both signs: h = ±√(h²).'],
      solution: `h² = ${V.c ** 2} − ${V.a ** 2} = ${nf(V.h2)}, so h = ±${nf(V.rise)}: ${nf(V.rise)} m above or ${nf(V.rise)} m below the start.`
    }
  });
}

// ================================================================ missions
// Options are written correct-first above; show them in a fixed order that
// differs from question to question (the same every time, so a student
// reviewing a question sees what they saw before).
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (q.type !== 'choice') continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}
export const QUESTIONS = arrange({ ...M1, ...M2, ...M3, ...EXT });
export const MISSIONS = [
  { id: 'suspension', n: 1, title: 'Dial in your suspension', short: 'Suspension Setup', minutes: '7–9',
    focus: 'Rearranging formulas · absolute value · compound inequalities',
    blurb: 'Check the sag on a race shock: millimetres, percentages, and how close to the target is close enough.',
    graded: Object.keys(M1) },
  { id: 'timing', n: 2, title: 'Beat the clock', short: 'Race Timing', minutes: '5–6',
    focus: 'Rational equations and inequalities',
    blurb: 'Section 1 is done. Work out how fast the rider has to go on the rest of the stage to hit the target.',
    graded: Object.keys(M2), practice: PRACTICE_IDS },
  { id: 'survey', n: 3, title: 'Read the terrain', short: 'Trail Survey', minutes: '5–6',
    focus: 'Radical equations · checking solutions',
    blurb: 'Find a climb’s elevation change from two distances, then debug an equation with a false answer.',
    graded: Object.keys(M3) }
];

// Every question kind the workshop can send (for curriculum skills and
// the generated curriculum SQL): id -> ideas.
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  const P = practiceQuestions(0); for (const id of PRACTICE_IDS) out[id] = P[id].ideas;
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
