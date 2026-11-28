// The Split Report: every graded question. Each answer is computed from the
// fictional datasets (logic/data.js) by the kit's statistics engine
// (lesson-kit/stats.js), never typed in; scripts/test-split-report.mjs checks
// them against the PRD's answer keys. Three progressive hints each, a worked
// solution, and wrong answers tagged with misconception codes and feedback
// that explains the reasoning. Pure; no DOM (figures are described as data,
// fig: { kind, … }, and drawn by the lab).

import { summary, wholeBins, regression, pearson, predict, residual, sorted } from '../../lesson-kit/stats.js';
import { RIDER_A, RIDER_B, BINS, LAPS, LAP_X, LAP_Y, OUTLIER, RIDER_PAIRS, FINAL_PAIRS, PAIRED, FINAL_PAIRED } from './data.js';

// ---------- display ----------
// N(v, d): a number to at most d decimals, with a real minus sign.
export const N = (v, d = 1) => { const x = Number(Number(v).toFixed(d)); return (x < 0 ? '−' : '') + String(Math.abs(x)); };
export const signed = (v, d = 1) => (Number(v.toFixed(d)) > 0 ? '+' : '') + N(v, d);
export const eqText = (L, d = 1, y = 'ŷ') => `${y} = ${N(L.intercept, d)} ${L.slope < 0 ? '−' : '+'} ${Math.abs(Math.abs(L.slope) - 1) < 1e-9 ? '' : N(Math.abs(L.slope), d)}x`;
const list = a => a.join(', ');

// ---------- the engine's answers ----------
export const SA = summary(RIDER_A.times), SB = summary(RIDER_B.times);
export const HIST = { a: wholeBins(RIDER_A.times, BINS.lo, BINS.w, BINS.n), b: wholeBins(RIDER_B.times, BINS.lo, BINS.w, BINS.n) };
export const FIT = regression(LAP_X, LAP_Y);
export const R_ALL = pearson(LAP_X, LAP_Y);
export const R_NINE = pearson(LAP_X.filter((_, i) => i !== OUTLIER), LAP_Y.filter((_, i) => i !== OUTLIER));
// The reference model, at the precision the PRD states (78.4 and −1.4, exact).
export const MODEL = { intercept: Number(FIT.intercept.toFixed(1)), slope: Number(FIT.slope.toFixed(1)), xRange: FIT.xRange };
export const PRED = x => predict(MODEL, x);
export const RES = i => residual(MODEL, LAP_X[i], LAP_Y[i]);

// ---------- builders ----------
const opt = (id, t, correct, code, feedback) => ({ id, text: t, correct: !!correct, code: correct ? 'correct' : code || 'wrong', feedback: feedback || null });
const pick = (list_, n) => list_[((n % list_.length) + list_.length) % list_.length];
const H = (a, b, c) => [a, b, c];
function tidy(qs) {
  for (const q of Object.values(qs)) {
    if (!q || typeof q !== 'object') continue;
    for (const f of q.type === 'number' ? [q] : q.type === 'fields' ? q.fields : []) {
      const seen = new Set();
      f.traps = (f.traps || []).filter(t => { const k = Number(t.value.toFixed(6)); if (seen.has(k) || Math.abs(t.value - f.answer) <= (f.tolerance || 1e-9)) return false; seen.add(k); return true; });
    }
  }
  return qs;
}
function arrange(qs) {
  for (const [id, q] of Object.entries(qs)) {
    if (!q || (q.type !== 'choice' && q.type !== 'multi') || q.keepOrder) continue;
    const k = [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length;
    q.options = q.options.slice(k).concat(q.options.slice(0, k));
  }
  return qs;
}
const choice = (prompt, right, wrongs, o = {}) => ({ type: 'choice', ideas: o.ideas, level: o.level || 'intermediate', prompt, fig: o.fig, keepOrder: o.keepOrder,
  options: [opt('a', right, true, null, o.why || null), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))], hints: o.hints, solution: o.solution || right + '.' });
const multi = (prompt, rights, wrongs, o = {}) => ({ type: 'multi', ideas: o.ideas, level: o.level || 'intermediate', prompt, fig: o.fig,
  options: [...rights.map((r, i) => opt('r' + i, r, true)), ...wrongs.map((w, i) => opt('w' + i, w[0], false, w[1], w[2]))], hints: o.hints, solution: o.solution });
const num = (answer, o) => ({ type: 'number', tolerance: 0.05, ...o, answer });
const fields = (fs, o) => ({ type: 'fields', ...o, fields: fs.map(f => ({ tolerance: 0.05, unit: 's', ...f })) });

export const IDEAS = {
  'choose-display': 'Choosing a data display', 'dot-plot': 'Reading dot plots', histogram: 'Building and reading histograms', 'box-plot': 'Reading box plots and quartiles',
  center: 'Mean and median', spread: 'Range and interquartile range', compare: 'Comparing two distributions',
  'plot-pairs': 'Plotting paired data', association: 'Describing the direction of an association', form: 'Linear and nonlinear patterns', outliers: 'Spotting and handling outliers',
  'direction-strength': 'Direction and strength of correlation', 'r-meaning': 'Interpreting the correlation coefficient', 'r-outlier': 'How an outlier changes r', causation: 'Correlation isn’t causation',
  'fit-line': 'Fitting a line of best fit', 'slope-meaning': 'Interpreting the slope', 'intercept-meaning': 'Interpreting the intercept', predict: 'Making predictions', residuals: 'Calculating and reading residuals', extrapolation: 'Being careful outside the data'
};
export const REPORT_IDEAS = Object.keys(IDEAS);
export const OBJECTIVES = [
  { id: 'rep', name: 'Data Representation', ideas: ['choose-display', 'dot-plot', 'histogram', 'box-plot', 'center', 'spread', 'compare'] },
  { id: 'scatter', name: 'Scatter Plots', ideas: ['plot-pairs', 'association', 'form', 'outliers'] },
  { id: 'corr', name: 'Correlation', ideas: ['direction-strength', 'r-meaning', 'r-outlier', 'causation'] },
  { id: 'fit', name: 'Lines of Best Fit', ideas: ['fit-line', 'slope-meaning', 'intercept-meaning', 'predict', 'residuals', 'extrapolation'] }
];
export const MISCONCEPTIONS = {
  'display-hides-values': 'Choosing a display that hides the individual values',
  'larger-iqr-consistent': 'Thinking a larger IQR means more consistent',
  'range-for-iqr': 'Giving the range instead of the IQR',
  'median-one-middle': 'Taking one middle value instead of averaging the two',
  'median-unsorted': 'Finding the middle before sorting',
  'quartile-method': 'Finding a quartile from the wrong half',
  'mean-for-median': 'Mixing up the mean and the median',
  'median-for-mean': 'Giving the median when the mean was asked for',
  'r-outlier': 'Misjudging how an outlier affects r',
  'sum-not-divided': 'Forgetting to divide the total by the count',
  'bin-edge': 'Counting a boundary value in the wrong bin',
  'bin-miscount': 'Miscounting a histogram bar',
  'lower-is-slower': 'Forgetting that lower times are faster',
  'one-statistic': 'Judging from a single statistic',
  'faster-is-positive': 'Calling an association positive because faster sounds good',
  'connect-points': 'Treating a scatter plot like a line graph',
  'extreme-not-outlier': 'Calling the highest or lowest point an outlier when it fits the pattern',
  'delete-outlier': 'Deleting or ignoring a point because it doesn’t fit',
  'outlier-proof': 'Treating an outlier as proof of what happened',
  'axis-swap': 'Putting the variables on the wrong axes',
  'nonlinear-called-linear': 'Misjudging the form of a pattern',
  'sign-strength': 'Thinking a positive r is stronger than a negative one',
  'r-zero-no-relation': 'Thinking r near 0 means no relationship of any kind',
  'r-out-of-range': 'An impossible correlation coefficient',
  'causal-claim': 'Claiming correlation proves causation',
  'overcorrect': 'Deciding an association means nothing at all',
  'irrelevant-factor': 'Choosing a factor that couldn’t affect the times',
  'slope-sign': 'Dropping the sign of the slope',
  'slope-causal': 'Reading the slope as a guaranteed effect',
  'intercept-certain': 'Trusting the intercept outside the data',
  'substitute': 'A substitution slip in the regression equation',
  'residual-order': 'Computing predicted − actual instead of actual − predicted',
  'residual-sign-meaning': 'Misreading what a residual’s sign means',
  'perfect-fit': 'Expecting the line to go through every point',
  'line-through-ends': 'Drawing the line through the first and last points',
  'extrapolate-trust': 'Trusting a prediction outside the observed range',
  'plot-error': 'A point in the wrong place',
  'swap-xy': 'Swapping x and y when plotting',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Mission 01: The Consistency Audit (data representation)
const A = RIDER_A.times, B = RIDER_B.times;
const M1 = {
  'au-display': choice('What kind of graph would help you compare the individual practice times?', 'A dot plot: every run is its own dot, on the same time scale', [
    ['A histogram', 'display-hides-values', 'A histogram groups the times into intervals (58–62, 63–67…), so you can’t see each individual run. It’s great for the overall shape of bigger datasets.'],
    ['A box plot', 'display-hides-values', 'A box plot summarizes each rider with five numbers (minimum, Q1, median, Q3, maximum). It’s great for comparing center and spread, but it hides the individual runs.']],
    { ideas: ['choose-display'], level: 'beginner', why: 'Right: a dot plot keeps every single run visible. Histograms group values into intervals, and box plots summarize them with five numbers; you’ll use both next.', hints: H('Which display shows every value separately?', 'Histograms group values; box plots summarize them.', 'One dot per run.') }),
  'au-tight': choice('Which rider has a tighter cluster of practice times?', 'Rider A (Apex)', [['Rider B (Breakaway)', 'larger-iqr-consistent', 'Look at the dot plot: Rider B’s dots spread from 58 all the way to 76 seconds.'], ['They’re about the same', 'one-statistic', 'Compare how far each rider’s dots spread: Rider A’s sit between 62 and 66; Rider B’s stretch from 58 to 76.']],
    { ideas: ['dot-plot', 'compare'], level: 'beginner', hints: H('Look at how wide each rider’s group of dots is.', `Rider A: ${SA.min} to ${SA.max}. Rider B: ${SB.min} to ${SB.max}.`, 'The narrower group is the tighter cluster.'), solution: `Rider A: all eight runs sit between ${SA.min} and ${SA.max} seconds, much more tightly grouped than Rider B’s ${SB.min} to ${SB.max}.` }),
  'au-stack': num(A.filter(t => t === 63).length, { ideas: ['dot-plot'], level: 'beginner', label: 'Dots', unit: 'runs', tolerance: 0, prompt: 'On Rider A’s dot plot, how many dots are stacked above 63 seconds?',
    traps: [{ value: 1, code: 'plot-error', message: 'Repeated times stack: Rider A recorded 63 seconds on two runs.' }], hints: H('Each run is one dot.', 'Find every 63 in Rider A’s list.', 'Runs 2 and 3.'), solution: 'Two: runs 2 and 3 were both 63 seconds, so the dots stack.' }),
  'au-freq': fields([
    { id: 'b1', label: 'Rider B, 58–62', answer: HIST.b[0].count, unit: 'runs', tolerance: 0, traps: [{ value: 4, code: 'bin-edge', message: '63 belongs to the 63–67 bin, not 58–62: count 58, 59 and 61.' }, { value: 2, code: 'bin-miscount', message: 'Count every time from 58 to 62: 58, 59 and 61.' }] },
    { id: 'b2', label: 'Rider B, 63–67', answer: HIST.b[1].count, unit: 'runs', tolerance: 0, traps: [{ value: 2, code: 'bin-edge', message: 'The 63–67 bin includes both ends: 63, 64 and 67.' }] },
    { id: 'b3', label: 'Rider B, 68–72', answer: HIST.b[2].count, unit: 'runs', tolerance: 0 },
    { id: 'b4', label: 'Rider B, 73–77', answer: HIST.b[3].count, unit: 'runs', tolerance: 0 }
  ], { ideas: ['histogram'], level: 'intermediate', prompt: `Build Rider B’s histogram. Rider B’s times: ${list(B)}. How many runs fall in each bin?`,
    hints: H('Every bin includes both of its end numbers: 58–62 means 58, 59, 60, 61 or 62.', 'Go through the times one at a time and tally each into its bin.', 'The four counts should add up to 8.'), solution: `58–62: ${HIST.b[0].count} (58, 59, 61). 63–67: ${HIST.b[1].count} (63, 64, 67). 68–72: ${HIST.b[2].count} (72). 73–77: ${HIST.b[3].count} (76). Total 8.` }),
  'au-hist': choice('Which rider has more practice runs grouped between 63 and 67 seconds?', `Rider A, with ${HIST.a[1].count} runs`, [[`Rider B, with ${HIST.b[1].count} runs`, 'bin-miscount', `Rider B has ${HIST.b[1].count} runs in that bin; compare it with Rider A’s bar.`], ['They’re tied', 'bin-miscount', 'Compare the heights of the two 63–67 bars.']],
    { ideas: ['histogram', 'compare'], level: 'beginner', hints: H('Find the 63–67 bar for each rider.', 'Read each bar’s height on the frequency axis.', `Rider A: ${HIST.a[1].count}. Rider B: ${HIST.b[1].count}.`) }),
  'au-mean': fields([
    { id: 'a', label: 'Rider A mean', answer: SA.mean, traps: [{ value: SA.sum, code: 'sum-not-divided', message: `That’s the total, ${SA.sum}. Divide by the 8 runs.` }] },
    { id: 'b', label: 'Rider B mean', answer: SB.mean, traps: [{ value: SB.median, code: 'median-for-mean', message: `${N(SB.median)} is Rider B’s median (the middle). The mean adds every time and divides by 8.` }, { value: SB.sum, code: 'sum-not-divided', message: `That’s the total, ${SB.sum}. Divide by the 8 runs.` }] }
  ], { ideas: ['center'], level: 'beginner', prompt: 'Find each rider’s mean practice time.', hints: H('Mean = total ÷ number of runs.', `Rider A’s total is ${SA.sum}; Rider B’s is ${SB.sum}.`, 'Divide each total by 8.'), solution: `Rider A: ${SA.sum} ÷ 8 = ${N(SA.mean)} s. Rider B: ${SB.sum} ÷ 8 = ${N(SB.mean)} s.` }),
  'au-median': fields([
    { id: 'a', label: 'Rider A median', answer: SA.median, traps: [{ value: 64.5, code: 'arithmetic', message: 'The two middle values are 64 and 64: (64 + 64) ÷ 2 = 64.' }] },
    { id: 'b', label: 'Rider B median', answer: SB.median, traps: [{ value: 63, code: 'median-one-middle', message: 'With eight runs there are two middle values, 63 and 64. Add them and divide by 2.' }, { value: 64, code: 'median-one-middle', message: 'With eight runs there are two middle values, 63 and 64. Add them and divide by 2.' }, { value: SB.mean, code: 'mean-for-median', message: `${N(SB.mean)} is the mean. The median is the middle of the sorted times.` }] }
  ], { ideas: ['center'], level: 'intermediate', prompt: 'Find each rider’s median practice time. (Both lists are already in order.)', hints: H('First, put the values in numerical order.', 'There are eight values. Which two values are in the middle?', 'Add the two middle values and divide by two.'), solution: `Rider A: (64 + 64) ÷ 2 = ${N(SA.median)} s. Rider B: (63 + 64) ÷ 2 = ${N(SB.median)} s.` }),
  'au-quart': fields([
    { id: 'q1', label: 'Rider B Q1', answer: SB.q1, traps: [{ value: 59, code: 'quartile-method', message: 'Q1 is the median of the lower half (58, 59, 61, 63): (59 + 61) ÷ 2.' }, { value: 61, code: 'quartile-method', message: 'Q1 is the median of the lower half (58, 59, 61, 63): (59 + 61) ÷ 2.' }] },
    { id: 'q3', label: 'Rider B Q3', answer: SB.q3, traps: [{ value: 67, code: 'quartile-method', message: 'Q3 is the median of the upper half (64, 67, 72, 76): (67 + 72) ÷ 2.' }, { value: 72, code: 'quartile-method', message: 'Q3 is the median of the upper half (64, 67, 72, 76): (67 + 72) ÷ 2.' }] }
  ], { ideas: ['box-plot'], level: 'intermediate', prompt: 'Find Rider B’s quartiles. Split the eight sorted times into a lower half and an upper half, then find the median of each half.', hints: H('Lower half: 58, 59, 61, 63. Upper half: 64, 67, 72, 76.', 'Each half has four values, so its median is the mean of its two middle values.', 'Q1 = (59 + 61) ÷ 2; Q3 = (67 + 72) ÷ 2.'), solution: `Q1 = (59 + 61) ÷ 2 = ${N(SB.q1)} s. Q3 = (67 + 72) ÷ 2 = ${N(SB.q3)} s.` }),
  'au-spread': fields([
    { id: 'ra', label: 'Rider A range', answer: SA.range }, { id: 'rb', label: 'Rider B range', answer: SB.range },
    { id: 'ia', label: 'Rider A IQR', answer: SA.iqr, traps: [{ value: SA.range, code: 'range-for-iqr', message: 'That’s the range. The IQR is Q3 − Q1: 65 − 63.' }] },
    { id: 'ib', label: 'Rider B IQR', answer: SB.iqr, traps: [{ value: SB.range, code: 'range-for-iqr', message: 'That’s the range (max − min). The IQR is Q3 − Q1: 69.5 − 60.' }, { value: 7, code: 'quartile-method', message: 'Use Q1 = 60 and Q3 = 69.5, the medians of the two halves.' }] }
  ], { ideas: ['spread'], level: 'intermediate', prompt: 'Measure the spread. Range = maximum − minimum. IQR = Q3 − Q1 (Rider A’s quartiles are 63 and 65).', hints: H('Range uses the fastest and slowest runs.', 'The IQR is the spread of the middle 50% of runs.', `Rider A: 66 − 62 and 65 − 63. Rider B: 76 − 58 and ${N(SB.q3)} − ${N(SB.q1)}.`), solution: `Range: A ${N(SA.range)} s, B ${N(SB.range)} s. IQR: A ${N(SA.iqr)} s, B ${N(SB.iqr)} s.` }),
  'au-d1': choice('Which rider has the lower median practice time?', 'Rider B', [['Rider A', 'lower-is-slower', `Rider A’s median is ${N(SA.median)}; Rider B’s is ${N(SB.median)}. Lower is the smaller number.`], ['They’re equal', 'arithmetic', `${N(SA.median)} and ${N(SB.median)} aren’t equal.`]], { ideas: ['center', 'compare'], level: 'beginner', hints: H('Compare the two medians.', `A: ${N(SA.median)}; B: ${N(SB.median)}.`, 'The smaller median is lower.') }),
  'au-d2': choice('Which rider has the lower mean practice time?', 'Rider A', [['Rider B', 'one-statistic', `Rider B’s median is lower, but their mean is ${N(SB.mean)}, higher than Rider A’s ${N(SA.mean)}.`], ['They’re equal', 'arithmetic', `${N(SA.mean)} and ${N(SB.mean)} differ.`]], { ideas: ['center', 'compare'], level: 'beginner', hints: H('Compare the two means.', `A: ${N(SA.mean)}; B: ${N(SB.mean)}.`, 'The smaller mean is lower.') }),
  'au-d3': choice('Which rider has the smaller range?', 'Rider A', [['Rider B', 'larger-iqr-consistent', `Rider B’s range is ${N(SB.range)} seconds; Rider A’s is ${N(SA.range)}.`], ['They’re equal', 'arithmetic', `${N(SA.range)} and ${N(SB.range)} differ.`]], { ideas: ['spread', 'compare'], level: 'beginner', hints: H('Range = max − min.', `A: ${N(SA.range)}; B: ${N(SB.range)}.`, 'Smaller range, narrower spread.') }),
  'au-d4': choice('Which rider appears more consistent?', 'Rider A: their range and IQR are both much smaller', [
    ['Rider B, because their IQR is larger', 'larger-iqr-consistent', 'Take another look at what the interquartile range measures. It describes the spread of the middle 50% of the data. A smaller IQR means the middle half of the results are more tightly grouped, which indicates greater consistency.'],
    ['Rider B, because their median is lower', 'one-statistic', 'A lower median says Rider B’s typical run is a little faster. Consistency is about spread: how close together the runs are.']],
    { ideas: ['spread', 'compare'], level: 'intermediate', hints: H('Consistency is about spread, not speed.', 'Which rider’s middle 50% of runs is more tightly grouped?', `IQR: A ${N(SA.iqr)} s, B ${N(SB.iqr)} s.`) }),
  'au-d5': choice('Why are the mean and median telling slightly different stories for Rider B?', 'Rider B has a few much slower runs (72 and 76 s) that pull the mean up; the median only depends on the middle values', [
    ['Rider B made an arithmetic mistake', 'mean-for-median', 'Both values are correct. They measure center in different ways.'],
    ['The median includes the slow runs, but the mean ignores them', 'mean-for-median', 'It’s the other way round: every time counts in the mean, so the slow runs raise it. The median depends only on the middle values.'],
    ['Rider B is the faster rider overall', 'one-statistic', 'That’s a claim about speed, not an explanation of why the two measures of center differ.']],
    { ideas: ['center'], level: 'intermediate', hints: H('Which measure uses every single time?', 'What happens to an average when a couple of values are much bigger?', 'The median is the middle of the sorted list, so a few extreme values barely move it.') }),
  'au-same': choice('Challenge: two riders have the same mean but very different IQRs. What does that tell you?', 'Their typical times are similar, but one rider’s runs are much more spread out, so less consistent', [
    ['They performed identically', 'one-statistic', 'The same mean doesn’t mean the same runs: the spread can be completely different.'],
    ['The rider with the bigger IQR is more consistent', 'larger-iqr-consistent', 'A bigger IQR means the middle half of the runs is more spread out: less consistent.']],
    { ideas: ['compare', 'spread'], level: 'advanced', hints: H('What does a mean describe? What does an IQR describe?', 'Center and spread are different features.', 'Same center, different spread.') }),
  'au-lower': choice('Challenge: can a rider have a lower median but a higher mean than another rider?', 'Yes: Rider B does, because a few slow runs raise the mean without moving the middle', [
    ['No: the median and mean always agree', 'mean-for-median', 'Rider B is the counterexample: median 63.5 vs 64, but mean 65 vs 64.'],
    ['Only if a time was recorded wrong', 'outlier-proof', 'Slow runs are real data. They simply affect the mean more than the median.']],
    { ideas: ['center', 'compare'], level: 'advanced', hints: H('Look back at Riders A and B.', 'Compare their medians, then their means.', 'B: lower median, higher mean.') })
};
// Practice: two more riders (C and D).
export const AUDIT_IDS = ['aux-median', 'aux-iqr', 'aux-consistent'];
export function auditPractice(n) {
  const [c, d] = pick(RIDER_PAIRS, n), C = summary(c), D = summary(d), cons = C.iqr < D.iqr ? 'C' : 'D';
  const lo = s => s.slice(0, 4), hi = s => s.slice(4);
  return tidy(arrange({ brief: `Timing sheet ${n + 1}. Rider C: ${list(c)}. Rider D: ${list(d)} (seconds, in order).`,
    'aux-median': fields([{ id: 'c', label: 'Rider C median', answer: C.median, traps: [{ value: c[3], code: 'median-one-middle', message: 'Average the two middle times.' }, { value: c[4], code: 'median-one-middle', message: 'Average the two middle times.' }] }, { id: 'd', label: 'Rider D median', answer: D.median, traps: [{ value: d[3], code: 'median-one-middle', message: 'Average the two middle times.' }, { value: d[4], code: 'median-one-middle', message: 'Average the two middle times.' }, { value: D.mean, code: 'mean-for-median', message: 'That’s the mean; the median is the middle.' }] }],
      { ideas: ['center'], level: 'intermediate', prompt: 'Find each rider’s median.', hints: H('Eight sorted times: the 4th and 5th are in the middle.', 'Add them and divide by 2.', `C: (${c[3]} + ${c[4]}) ÷ 2. D: (${d[3]} + ${d[4]}) ÷ 2.`), solution: `C: (${c[3]} + ${c[4]}) ÷ 2 = ${N(C.median)} s. D: (${d[3]} + ${d[4]}) ÷ 2 = ${N(D.median)} s.` }),
    'aux-iqr': fields([{ id: 'c', label: 'Rider C IQR', answer: C.iqr, traps: [{ value: C.range, code: 'range-for-iqr', message: 'That’s the range; the IQR is Q3 − Q1.' }] }, { id: 'd', label: 'Rider D IQR', answer: D.iqr, traps: [{ value: D.range, code: 'range-for-iqr', message: 'That’s the range; the IQR is Q3 − Q1.' }] }],
      { ideas: ['spread', 'box-plot'], level: 'advanced', prompt: 'Find each rider’s IQR (median of halves).', hints: H('Split each list into its lower four and upper four.', 'Q1 and Q3 are the medians of those halves.', 'IQR = Q3 − Q1.'), solution: `C: halves ${list(lo(c))} | ${list(hi(c))}; Q1 = ${N(C.q1)}, Q3 = ${N(C.q3)}, IQR ${N(C.iqr)} s. D: halves ${list(lo(d))} | ${list(hi(d))}; Q1 = ${N(D.q1)}, Q3 = ${N(D.q3)}, IQR ${N(D.iqr)} s.` }),
    'aux-consistent': choice('Which rider is more consistent?', `Rider ${cons}: the smaller IQR (${N(Math.min(C.iqr, D.iqr))} s)`, [[`Rider ${cons === 'C' ? 'D' : 'C'}: the larger IQR`, 'larger-iqr-consistent', 'A larger IQR means the middle half is more spread out: less consistent.'], [`Rider ${cons === 'C' ? 'D' : 'C'}: the lower minimum`, 'one-statistic', 'One fast run doesn’t make a rider consistent. Compare the spread.']],
      { ideas: ['compare', 'spread'], level: 'intermediate', hints: H('Consistency is spread.', 'Compare the IQRs.', 'Smaller IQR, more consistent.') }) }));
}

// ================================================================ Mission 02: The Pattern Scan (scatter plots)
const lapRow = i => `${LAPS[i].rider} (${LAPS[i].practiceLaps}, ${LAPS[i].sectorTimeSeconds})`;
const M2 = {
  'sc-plot': { type: 'scatter', ideas: ['plot-pairs'], level: 'beginner', prompt: 'Plot all ten riders: practice laps across, final sector time up. Tap the grid (points snap to whole numbers) or type each point.',
    targets: LAPS.map(r => ({ x: r.practiceLaps, y: r.sectorTimeSeconds, name: r.rider })), hints: H('Find the practice laps on the horizontal axis first.', 'Then go up to the sector time on the vertical axis (it starts at 60 s).', 'Rider 1 is (1, 78): one lap across, up to 78.'), solution: 'One point per rider, at (practice laps, sector time): (1, 78), (2, 75), (3, 76), (4, 71), (5, 70), (6, 67), (7, 68), (8, 75), (9, 65), (10, 62).' },
  'sc-axes': choice('Which variable belongs on the horizontal (x) axis?', 'Practice laps: we’re asking how sector time changes as practice laps change', [['Sector time', 'axis-swap', 'The question asks whether sector time changes with practice laps, so laps go across and time goes up.'], ['It doesn’t matter for this question', 'axis-swap', 'Either way shows the points, but the convention puts the variable you think might help predict on x, and the line of best fit later predicts time from laps.']],
    { ideas: ['plot-pairs'], level: 'beginner', hints: H('What are we trying to predict?', 'Sector time is what we’d like to predict.', 'The predictor goes on x.') }),
  'sc-q1': choice('As the number of practice laps increases, what generally happens to sector times?', 'They tend to decrease', [['They tend to increase', 'faster-is-positive', 'Follow the points from left to right: the times mostly go down, from 78 to 62.'], ['They stay about the same', 'nonlinear-called-linear', 'The times drop by about 16 seconds across the plot.']], { ideas: ['association'], level: 'beginner', hints: H('Read the plot from left to right.', 'Where are the points at 1 lap? At 10 laps?', '78 s down to 62 s.') }),
  'sc-q2': choice('Is this a positive or a negative association?', 'Negative: as laps go up, times go down', [['Positive: the riders get faster', 'faster-is-positive', 'Getting faster sounds positive, but direction is about the numbers: as x increases, y decreases. That’s a negative association.'], ['No association', 'overcorrect', 'There’s a clear downward trend.']], { ideas: ['association'], level: 'beginner', hints: H('Positive: both go up together.', 'Negative: one goes up while the other goes down.', 'Laps up, times down.') }),
  'sc-q3': choice('Does the pattern look approximately linear?', 'Yes: most points follow a roughly straight downward trend', [['No: it curves sharply', 'nonlinear-called-linear', 'Apart from one point, the points drop at a fairly steady rate.'], ['No: the points are completely scattered', 'overcorrect', 'Nine of the ten points line up closely.']], { ideas: ['form'], level: 'beginner', hints: H('Imagine laying a ruler over the points.', 'Do most points stay close to it?', 'A fairly straight downward band.') }),
  'sc-q4': choice('Which point looks unusual?', 'Rider 8, at (8, 75)', [[`Rider 1, at (1, 78)`, 'extreme-not-outlier', 'Rider 1 has the highest time, but it fits the trend: few laps, slower time.'], ['Rider 10, at (10, 62)', 'extreme-not-outlier', 'The fastest time, but right where the trend leads.'], ['Rider 3, at (3, 76)', 'extreme-not-outlier', 'A small bump, but still close to the pattern.']], { ideas: ['outliers'], level: 'beginner', hints: H('Which point sits far from the others’ pattern?', 'Look around 8 laps.', 'Its time is much higher than its neighbours’.'), solution: 'Rider 8, at (8, 75): with eight laps the others suggest about 66–67 s, but the time was 75 s.' }),
  'sc-q5': choice('What do you notice about the other nine points?', 'They form a downward-sloping cluster: riders with more practice laps generally have lower sector times', [['They’re scattered with no pattern', 'overcorrect', 'Without Rider 8 the points line up even more clearly.'], ['They rise from left to right', 'faster-is-positive', 'Times fall as laps rise.']], { ideas: ['association', 'form'], level: 'intermediate', hints: H('Cover up Rider 8 with your finger.', 'What shape do the remaining points make?', 'A tight downward band.') }),
  'sc-connect': choice('Why shouldn’t we connect the points from left to right, like a line graph?', 'Each point is a different rider, not one thing measured over time, so there’s nothing to join', [['Because the line would go down', 'connect-points', 'The direction isn’t the problem. Joining the dots suggests a sequence that doesn’t exist.'], ['You should: it shows the trend best', 'connect-points', 'A zig-zag through every point hides the overall trend. Later you’ll fit one straight line of best fit instead.']], { ideas: ['plot-pairs'], level: 'intermediate', hints: H('What does each point represent?', 'One rider’s laps and time.', 'Riders aren’t a timeline.') }),
  'sc-flag': choice('Rider 8 completed eight practice laps but recorded 75 seconds. What should the team do?', 'Flag it and investigate the circumstances', [['Automatically delete the point', 'delete-outlier', 'Never remove an observation just because it doesn’t fit the pattern we expected. There may be a legitimate reason.'], ['Ignore the point', 'delete-outlier', 'Ignoring it is deleting it quietly. It’s real data until there’s evidence it isn’t.']], { ideas: ['outliers'], level: 'beginner', hints: H('Is an unusual point automatically wrong?', 'What would a good analyst want to know first?', 'Check the timing record and the context.') }),
  'sc-causes': multi('Which of these are possibilities worth investigating for Rider 8’s run? Tick every one that could be worth checking.', ['Different course conditions', 'A mechanical problem', 'A timing error', 'Rider fatigue', 'A mistake during the run'], [['The point proves Rider 8 crashed', 'outlier-proof', 'The data can’t tell us what happened. A crash is one possibility, not a fact.'], ['Rider 8 must be a slower rider than everyone else', 'outlier-proof', 'One run can’t prove that. It’s a possibility, not a conclusion.']],
    { ideas: ['outliers'], level: 'intermediate', hints: H('Possibilities to check are not the same as conclusions.', 'Which options are things you could look into?', 'Two options state a conclusion as if it were proven.'), solution: 'All five circumstances are possibilities to investigate: conditions, a mechanical, a timing error, fatigue or a mistake. None is known to be true, and the data can’t prove a crash or that Rider 8 is slower.' }),
  'sc-prove': choice('Does identifying Rider 8 as an outlier prove the record is invalid?', 'No: it shows the point is unusual, which is a reason to look closer, not proof that it’s wrong', [['Yes: outliers are always errors', 'delete-outlier', 'Unusual results happen for real reasons too.'], ['Yes, if it changes the trend', 'delete-outlier', 'Changing the trend makes it important, not invalid.']], { ideas: ['outliers'], level: 'intermediate', hints: H('What does “unusual” mean?', 'Different from the pattern.', 'Different isn’t the same as wrong.') })
};
// Practice: new scatter plots.
export const SCAN_IDS = ['scx-dir', 'scx-out'];
const pt = (D, i) => `(${D.x[i]}, ${D.y[i]})`;
export function scanPractice(n) {
  const D = pick(PAIRED, n), r = pearson(D.x, D.y), dir = r < 0 ? 'Negative' : 'Positive', k = D.outlier, last = D.x.length - 1;
  const others = [0, last, k === 1 ? 2 : 1].filter(i => i !== k);
  return tidy(arrange({ brief: `Data sheet ${n + 1}: ${D.title}. (Fictional.)`,
    'scx-dir': choice(`${D.title}: what’s the direction of the association?`, `${dir}: as ${D.xLabel.toLowerCase()} increases, sector time tends to ${r < 0 ? 'decrease' : 'increase'}`, [[`${r < 0 ? 'Positive' : 'Negative'}`, r < 0 ? 'faster-is-positive' : 'lower-is-slower', `Follow the points left to right: the times go ${r < 0 ? 'down' : 'up'}.`], ['No association', 'overcorrect', 'Most points follow a clear trend.']],
      { ideas: ['association'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('Read the plot from left to right.', 'Do the times mostly rise or fall?', 'Ignore the one unusual point.') }),
    'scx-out': choice('Which point is unusual?', pt(D, k), others.map(i => [pt(D, i), 'extreme-not-outlier', `${pt(D, i)} fits the overall pattern.`]),
      { ideas: ['outliers'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('Picture the trend through most of the points.', 'Which point is far from it?', 'It’s the one the trend doesn’t pass near.'), solution: `${pt(D, k)}: it sits well away from the trend of the other points. Flag it and investigate; don’t delete it.` }) }));
}

// ================================================================ Mission 03: Signal or Noise? (correlation)
const M3 = {
  'sg-range': choice('The correlation coefficient r is always between…', '−1 and +1', [['0 and 1', 'sign-strength', 'Negative relationships have negative r.'], ['−100 and +100', 'r-out-of-range', 'r has no units and never goes beyond ±1.']], { ideas: ['r-meaning'], level: 'beginner', hints: H('Can r be negative?', 'Yes: for negative relationships.', 'Its largest size is 1.') }),
  'sg-strongest': choice('Which r shows the strongest linear relationship?', 'r = −0.92', [['r = 0.45', 'sign-strength', 'A positive sign isn’t stronger. Strength is how close r is to −1 or +1: 0.92 beats 0.45.'], ['r = 0.10', 'sign-strength', 'Close to 0: very weak.'], ['r = −0.30', 'sign-strength', 'Weaker than −0.92.']], { ideas: ['direction-strength', 'r-meaning'], level: 'intermediate', hints: H('Ignore the sign for strength.', 'Which is closest to ±1?', '0.92.') }),
  'sg-curve': choice('The curved pattern in the explorer has r close to 0. Does that mean there’s no relationship?', 'No: r only measures linear relationships, and these points follow a clear curve', [['Yes: r = 0 means the variables are unrelated', 'r-zero-no-relation', 'Look at the plot: the points follow a clear U-shape. r just can’t see curves.'], ['Yes: the points must be random', 'r-zero-no-relation', 'They’re far from random: they follow y = x².']], { ideas: ['r-meaning', 'direction-strength'], level: 'advanced', hints: H('What kind of pattern does r measure?', 'Straight-line patterns.', 'A curve can have r near 0.') }),
  'sg-r1': choice(`For all ten Northstar riders, r ≈ ${N(R_ALL, 2)}. Is the correlation positive or negative?`, 'Negative', [['Positive', 'faster-is-positive', 'The sign of r is negative: as laps rise, times fall.'], ['Neither', 'overcorrect', `${N(R_ALL, 2)} is clearly negative.`]], { ideas: ['direction-strength'], level: 'beginner', hints: H('Look at the sign of r.', 'It’s negative.', 'Negative r: one goes up, the other down.') }),
  'sg-r2': choice('Is it strong or weak?', 'A fairly strong negative linear relationship', [['Weak: it’s below 0', 'sign-strength', 'Strength comes from the size, |r| ≈ 0.81, not the sign.'], ['Perfect', 'perfect-fit', 'A perfect correlation would be exactly −1; the points don’t all sit on one line.']], { ideas: ['direction-strength', 'r-meaning'], level: 'intermediate', hints: H('Strength: how close is r to −1 or +1?', `|r| ≈ ${N(Math.abs(R_ALL), 2)}.`, 'Fairly close to 1, but not perfect.') }),
  'sg-r3': choice('What does this suggest about practice laps and sector times?', 'In this dataset, riders with more practice laps tend to have lower (faster) sector times', [['More practice laps make riders slower', 'lower-is-slower', 'Lower times are faster. More laps go with lower times.'], ['Practice laps cause faster times', 'causal-claim', 'r describes an association in this data. It doesn’t show cause; more on that next.']], { ideas: ['r-meaning'], level: 'intermediate', hints: H('Negative: laps up, times down.', 'Lower time means faster.', 'Describe the tendency, not a cause.') }),
  'sg-why': choice(`Without Rider 8, r goes from ${N(R_ALL, 2)} to ${N(R_NINE, 2)}. Why did it change?`, 'Rider 8 is far from the main downward pattern, so that one point weakens the overall linear correlation', [['Because there are fewer points', 'r-outlier', 'Removing a point that fits the pattern would barely change r. It’s where Rider 8 sits that matters.'], ['Because Rider 8’s time was a mistake', 'outlier-proof', 'We don’t know that. The change shows Rider 8’s influence, not whether it’s an error.']], { ideas: ['r-outlier'], level: 'intermediate', hints: H('Where does Rider 8 sit compared with the trend?', 'Far above it.', 'A point far from the line pulls r towards 0.') }),
  'sg-keep': choice('After the experiment, which dataset is the official one?', 'All ten riders: hiding Rider 8 was a sensitivity experiment, and the record stays unless there’s evidence it’s invalid', [['The nine riders: it gives a stronger result', 'delete-outlier', 'Choosing the data that gives a nicer answer is not allowed. Keep every observation unless there’s evidence it’s wrong.'], ['Neither: the data is unreliable now', 'overcorrect', 'One unusual point doesn’t spoil the dataset.']], { ideas: ['r-outlier', 'outliers'], level: 'intermediate', hints: H('Why did we hide the point?', 'To see how much it influences r.', 'Not to remove it.') }),
  'sg-cause': choice('“Riders who complete more practice laps tend to have faster sector times. Therefore, completing more practice laps causes riders to become faster.” Can we conclude that from the correlation alone?', 'No: the data shows an association, but it’s observational, so it can’t isolate the effect of practice laps', [['Yes: r is strong', 'causal-claim', 'A strong correlation still isn’t proof of cause. Other factors could be behind it.'], ['Yes, once Rider 8 is removed', 'causal-claim', 'A stronger r is still only an association.']], { ideas: ['causation'], level: 'intermediate', hints: H('How was this data collected?', 'Riders chose their own laps: nobody assigned them.', 'Other things could explain the pattern.') }),
  'sg-factors': multi('What else could be happening? Tick every factor that could influence the relationship between practice laps and sector time.', ['A rider’s existing skill and experience', 'Weather and trail conditions changing between runs', 'Fatigue from doing many laps', 'How familiar a rider already is with the terrain', 'Equipment differences between bikes'], [['The order the riders appear in the table', 'irrelevant-factor', 'The table order is just how the data was written down; it can’t change anyone’s time.'], ['The colour of the timing screen', 'irrelevant-factor', 'Nothing about the display could affect a run.']],
    { ideas: ['causation'], level: 'intermediate', hints: H('Which could actually change a rider’s time or how many laps they do?', 'A more experienced rider might need fewer laps and still be fast.', 'Two options couldn’t affect anything.'), solution: 'Skill and experience, conditions, fatigue, terrain familiarity and equipment could all be involved. The data doesn’t tell us how much any of them mattered; that’s why correlation alone can’t show cause.' }),
  'sg-headline': choice('The marketing manager wants the headline “More Practice Laps Make You Faster!” Which rewrite is statistically responsible?', 'In this sample, riders with more practice laps tended to record faster sector times, but the data doesn’t prove the extra laps caused it', [['More practice laps make you 1.4 seconds faster per lap', 'causal-claim', 'That still claims cause, and it treats the trend as a guarantee for every rider.'], ['Practice laps have nothing to do with speed', 'overcorrect', 'There is a clear association. The issue is only claiming it’s causal.'], [`Science proves practice laps make you faster: r = ${N(R_ALL, 2)}`, 'causal-claim', 'A correlation coefficient can’t prove cause.']],
    { ideas: ['causation'], level: 'intermediate', hints: H('Describe what was observed.', 'Say who it’s about (this sample).', 'Don’t claim cause.') })
};
// Practice: new datasets' correlation.
export const SIGNAL_IDS = ['sgx-r', 'sgx-out', 'sgx-cause'];
export function signalPractice(n) {
  const D = pick(PAIRED, n), r = pearson(D.x, D.y), r9 = pearson(D.x.filter((_, i) => i !== D.outlier), D.y.filter((_, i) => i !== D.outlier)), neg = r < 0;
  return tidy(arrange({ brief: `Data sheet ${n + 1}: ${D.title}, r ≈ ${N(r, 2)}. (Fictional.)`,
    'sgx-r': choice(`r ≈ ${N(r, 2)}. Which description fits best?`, `${neg ? 'Negative' : 'Positive'}, and fairly strong: the points follow a clear line, but not perfectly`, [[`${neg ? 'Positive' : 'Negative'}, and fairly strong`, 'sign-strength', `The sign of r gives the direction: ${neg ? 'negative' : 'positive'}.`], ['No linear relationship', 'r-zero-no-relation', `|r| ≈ ${N(Math.abs(r), 2)} is far from 0.`], [`A perfect ${neg ? 'negative' : 'positive'} relationship`, 'perfect-fit', 'Perfect would be exactly ±1.']],
      { ideas: ['direction-strength', 'r-meaning'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('The sign gives direction.', 'The size gives strength.', `|r| ≈ ${N(Math.abs(r), 2)}: fairly close to 1.`) }),
    'sgx-out': choice(`If the unusual point ${pt(D, D.outlier)} were hidden for a sensitivity experiment, r would most likely…`, `Move closer to ${neg ? '−1' : '+1'} (stronger)`, [['Move closer to 0 (weaker)', 'r-outlier', 'The unusual point is what’s weakening the line now; without it the rest line up better.'], ['Stay exactly the same', 'r-outlier', 'One point far from the line has a big influence on r.']],
      { ideas: ['r-outlier'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('Is the point near the trend or far from it?', 'Far.', 'Points far from the line weaken r.'), solution: `It would strengthen: r ≈ ${N(r, 2)} becomes about ${N(r9, 2)}. That’s an experiment, though: the point stays in the official data.` }),
    'sgx-cause': choice(`Someone says this proves ${D.context} ${neg ? 'makes riders faster' : 'makes riders slower'}. What’s the best response?`, 'It shows an association in this sample, but other factors could explain it, so it doesn’t prove cause', [['They’re right: r is strong', 'causal-claim', 'A strong r is still only an association.'], ['There’s no connection at all', 'overcorrect', 'There is an association; it just isn’t proven to be causal.']],
      { ideas: ['causation'], level: 'intermediate', hints: H('Was anything controlled or assigned?', 'No: it’s observational.', 'Association, not proof.') }) }));
}

// ================================================================ Mission 04: Race-Day Forecast (lines of best fit)
const resLine = i => `${N(LAP_Y[i])} − ${N(PRED(LAP_X[i]))} = ${signed(RES(i))}`;
const M4 = {
  'fo-good': choice('What makes a good line of best fit?', 'It follows the overall trend, with points above and below it, rather than passing through every point', [['It passes through as many points as possible', 'perfect-fit', 'A line through a few points can still miss the overall trend. It should balance the points above and below.'], ['It joins the first and last points', 'line-through-ends', 'The end points might be unusual. The line should describe all the points.'], ['It goes through every point', 'perfect-fit', 'Real data almost never lines up exactly.']], { ideas: ['fit-line'], level: 'beginner', hints: H('Will a line predict every time exactly?', 'No: points scatter around it.', 'Balance the points above and below.') }),
  'fo-slope-n': num(MODEL.slope, { ideas: ['slope-meaning'], level: 'beginner', label: 'Slope', unit: '', prompt: 'The least-squares line is ŷ = 78.4 − 1.4x. What is its slope?', traps: [{ value: 1.4, code: 'slope-sign', message: 'The slope includes its sign: ŷ = 78.4 − 1.4x has slope −1.4.' }, { value: 78.4, code: 'slope-sign', message: '78.4 is the intercept (the value when x = 0).' }], hints: H('In ŷ = a + bx, the slope is b.', 'It’s the number multiplying x.', 'Keep the sign.'), solution: 'Slope −1.4 (and intercept 78.4).' }),
  'fo-slope': choice('What does the slope of −1.4 mean in this situation?', 'For each additional practice lap, the model predicts a sector time about 1.4 seconds lower, on average, within this dataset', [['One more practice lap makes a rider 1.4 seconds faster', 'slope-causal', 'Be careful: the slope describes an association in this data, not a guaranteed effect of doing another lap.'], ['Every rider loses 1.4 seconds per lap', 'slope-causal', 'It’s an average tendency of the model, not something that happens to each rider.'], ['Sector time increases by 1.4 seconds per lap', 'slope-sign', 'The slope is negative: predicted times go down.']],
    { ideas: ['slope-meaning'], level: 'intermediate', hints: H('Slope = change in ŷ for each 1 more x.', 'x is laps; ŷ is predicted time.', 'Negative: lower predicted time. And it’s a prediction, not a cause.') }),
  'fo-int': choice('What does the intercept of 78.4 mean, and how much should we trust it?', 'The model predicts 78.4 s for a rider with zero practice laps, but the data only covers 1 to 10 laps, so treat it cautiously', [['Every rider’s first run will be 78.4 seconds', 'intercept-certain', 'It’s a model prediction at x = 0, outside the data, not a guaranteed time.'], ['It’s the fastest possible time', 'intercept-certain', 'It’s the predicted time at 0 laps, which is the slowest end of the line.'], ['It’s the average sector time', 'intercept-certain', `The average time is ${N(FIT.yMean)} s. The intercept is the prediction at x = 0.`]],
    { ideas: ['intercept-meaning', 'extrapolation'], level: 'intermediate', hints: H('The intercept is ŷ when x = 0.', 'Did any rider do 0 laps?', 'No: 0 is outside the data.') }),
  'fo-pred6': num(PRED(6), { ideas: ['predict'], level: 'beginner', label: 'Predicted time', prompt: 'A rider has completed six practice laps. What sector time does the model ŷ = 78.4 − 1.4x predict?', traps: [{ value: 78.4 + 1.4 * 6, code: 'slope-sign', message: 'Subtract: 78.4 − 1.4 × 6.' }, { value: (78.4 - 1.4) * 6, code: 'substitute', message: 'Multiply 1.4 by 6 first, then subtract from 78.4.' }, { value: 77, code: 'substitute', message: 'Substitute x = 6, not 1.' }], hints: H('Substitute x = 6.', '1.4 × 6 = 8.4.', '78.4 − 8.4.'), solution: `ŷ = 78.4 − 1.4(6) = 78.4 − 8.4 = ${N(PRED(6))} seconds.` }),
  'fo-res6': num(RES(5), { ideas: ['residuals'], level: 'intermediate', label: 'Residual', prompt: 'The six-lap rider’s actual time was 67 seconds. What’s the residual? (Residual = actual − predicted.)', traps: [{ value: -RES(5), code: 'residual-order', message: 'Residual = actual − predicted: 67 − 70, not 70 − 67.' }], hints: H('Actual = 67; predicted = 70.', 'Residual = actual − predicted.', '67 − 70.'), solution: `${resLine(5)} seconds: the rider was 3 seconds faster than the model predicted.` }),
  'fo-res-sign': choice('Because lower times are faster, what does a negative residual mean here?', 'The actual time was lower than predicted: faster than the model expected', [['The rider was slower than predicted', 'residual-sign-meaning', 'Negative means actual < predicted. A lower time is faster.'], ['The model was exactly right', 'residual-sign-meaning', 'That would be a residual of 0.']], { ideas: ['residuals'], level: 'intermediate', hints: H('Residual = actual − predicted.', 'Negative: actual is smaller.', 'Smaller time, faster run.') }),
  'fo-res8': fields([
    { id: 'p', label: 'Rider 8 predicted', answer: PRED(8), traps: [{ value: 75, code: 'residual-order', message: '75 is the actual time. Predicted = 78.4 − 1.4(8).' }] },
    { id: 'r', label: 'Rider 8 residual', answer: RES(OUTLIER), unit: 's', traps: [{ value: -RES(OUTLIER), code: 'residual-order', message: 'Residual = actual − predicted: 75 − 67.2.' }] }
  ], { ideas: ['predict', 'residuals'], level: 'intermediate', prompt: 'Select Rider 8 on the residual visualizer. Rider 8 did 8 laps and recorded 75 seconds. Find the predicted time and the residual.', hints: H('Predicted: substitute x = 8.', '78.4 − 11.2 = 67.2.', 'Residual = 75 − 67.2.'), solution: `Predicted ${N(PRED(8))} s; residual ${resLine(OUTLIER)} s.` }),
  'fo-res8-mean': choice('What does Rider 8’s residual of +7.8 seconds tell us?', 'Rider 8 was 7.8 seconds slower than the model predicted: a relatively large residual that deserves investigation', [['Rider 8 failed the run', 'outlier-proof', 'The model can’t explain what happened. A large residual is a reason to investigate, not a verdict.'], ['Rider 8 was 7.8 seconds faster than predicted', 'residual-sign-meaning', 'Positive residual: actual > predicted, so slower.']], { ideas: ['residuals', 'outliers'], level: 'intermediate', hints: H('Positive: actual above predicted.', 'Higher time is slower.', 'Large, so look closer.') }),
  'fo-res3': num(RES(2), { ideas: ['residuals'], level: 'intermediate', label: 'Residual', prompt: 'Rider 3 did 3 laps and recorded 76 seconds. What’s the residual?', traps: [{ value: -RES(2), code: 'residual-order', message: 'Actual − predicted: 76 − 74.2.' }], hints: H('Predicted: 78.4 − 1.4(3).', '= 74.2.', '76 − 74.2.'), solution: `${resLine(2)} seconds: 1.8 s slower than predicted.` }),
  'fo-c': fields([
    { id: 'six', label: '6 laps', answer: PRED(6) }, { id: 'eight', label: '8 laps', answer: PRED(8) },
    { id: 'eleven', label: '11 laps', answer: PRED(11), traps: [{ value: 78.4 + 1.4 * 11, code: 'slope-sign', message: 'Subtract 1.4 × 11.' }] }
  ], { ideas: ['predict'], level: 'intermediate', prompt: 'The forecast challenge: predict the sector time for riders with 6, 8 and 11 practice laps.', hints: H('Substitute each x into ŷ = 78.4 − 1.4x.', '1.4 × 6 = 8.4; 1.4 × 8 = 11.2; 1.4 × 11 = 15.4.', 'Subtract each from 78.4.'), solution: `6 laps: ${N(PRED(6))} s. 8 laps: ${N(PRED(8))} s. 11 laps: ${N(PRED(11))} s (an extrapolation).` }),
  'fo-trust': choice('Should we trust the eleven-lap prediction as much as predictions within our dataset?', 'No: the model was built from 1 to 10 laps, so 11 is an extrapolation and the pattern may not continue', [['Yes: the equation works for any x', 'extrapolate-trust', 'The equation gives a number for any x, but nothing in the data shows the trend holds beyond 10 laps.'], ['Yes: 11 is only one more lap', 'extrapolate-trust', 'Close or not, it’s outside the observed range, so be cautious.']], { ideas: ['extrapolation'], level: 'intermediate', hints: H('What range of laps is in the data?', '1 to 10.', '11 is outside it.') })
};
// Practice: forecast new datasets.
export const FORECAST_IDS = ['fox-pred', 'fox-res'];
export function lineOf(D) { const L = regression(D.x, D.y); return { slope: Number(L.slope.toFixed(1)), intercept: Number(L.intercept.toFixed(1)), xRange: L.xRange }; }
export function forecastPractice(n) {
  const D = pick(PAIRED, n), L = lineOf(D), j = [1, 2, 3, 0].find(i => i !== D.outlier && Math.abs(D.y[i] - predict(L, D.x[i])) > 0.05), x = D.x[j], p = predict(L, x), rs = D.y[j] - p, u = D.xUnit;
  return tidy({ brief: `Forecast sheet ${n + 1}: ${D.title}. The team’s least-squares model is ${eqText(L)}, where x is ${D.xLabel.toLowerCase()}. (Fictional.)`,
    'fox-pred': num(p, { ideas: ['predict'], level: 'advanced', label: 'Predicted time', unit: 's', prompt: `Predict the sector time at x = ${x} ${u}, using ${eqText(L)}.`, traps: [{ value: L.intercept - L.slope * x, code: 'slope-sign', message: 'Keep the slope’s sign.' }], fig: { kind: 'scatter', set: D, line: L },
      hints: H(`Substitute x = ${x}.`, `${N(L.slope)} × ${x} = ${N(L.slope * x)}.`, `${N(L.intercept)} + (${N(L.slope * x)}).`), solution: `ŷ = ${N(L.intercept)} ${L.slope < 0 ? '−' : '+'} ${N(Math.abs(L.slope))}(${x}) = ${N(p)} s.` }),
    'fox-res': num(rs, { ideas: ['residuals'], level: 'advanced', label: 'Residual', unit: 's', prompt: `The rider at x = ${x} actually recorded ${D.y[j]} s. What’s the residual?`, traps: [{ value: -rs, code: 'residual-order', message: 'Actual − predicted.' }],
      hints: H('Residual = actual − predicted.', `Predicted: ${N(p)} s.`, `${D.y[j]} − ${N(p)}.`), solution: `${D.y[j]} − ${N(p)} = ${signed(rs)} s: ${N(Math.abs(rs))} s ${rs < 0 ? 'faster' : 'slower'} than predicted.` }) });
}

// ================================================================ the missions
export const MISSIONS = [
  { id: 'audit', n: 1, title: 'The Consistency Audit', short: 'Consistency Audit', minutes: '12–15', focus: 'Data Representation', badge: 'Consistency Auditor', blurb: 'Compare two riders’ practice times with dot plots, histograms and box plots: mean, median, range and IQR.', graded: Object.keys(M1) },
  { id: 'scan', n: 2, title: 'The Pattern Scan', short: 'Pattern Scan', minutes: '10–12', focus: 'Scatter Plots', badge: 'Pattern Hunter', blurb: 'Plot practice laps against sector time, describe the association, and investigate the outlier.', graded: Object.keys(M2) },
  { id: 'signal', n: 3, title: 'Signal or Noise?', short: 'Signal or Noise?', minutes: '10–12', focus: 'Correlation', badge: 'Signal Detective', blurb: 'Read correlation coefficients, run the outlier experiment, and separate association from causation.', graded: Object.keys(M3) },
  { id: 'forecast', n: 4, title: 'Race-Day Forecast', short: 'Race-Day Forecast', minutes: '12–15', focus: 'Lines of Best Fit', badge: 'Race-Day Forecaster', blurb: 'Fit a line, interpret its slope and intercept, predict sector times and read the residuals.', graded: Object.keys(M4) }
];
export const QUESTIONS = { ...arrange(tidy(M1)), ...arrange(tidy(M2)), ...arrange(tidy(M3)), ...arrange(tidy(M4)) };

// ================================================================ the Race Intelligence Analyst certification
export const FINAL_SETS = FINAL_PAIRED.map((D, i) => ({ pair: FINAL_PAIRS[i], data: D }));
export const FINAL_IDS = ['fa-median', 'fa-iqr', 'fa-consistent', 'fb-direction', 'fb-outlier', 'fb-action', 'fc-strength', 'fc-cause', 'fd-slope', 'fd-predict', 'fd-residual', 'fd-extrap'];
export const PASS_MARK = 10;   // of 12, right without the solution shown
export function finalQuestions(roundNo) {
  const X = pick(FINAL_SETS, roundNo - 1), [e, f] = X.pair, E = summary(e), F = summary(f), D = X.data, r = pearson(D.x, D.y), neg = r < 0, L = lineOf(D), k = D.outlier, last = D.x.length - 1;
  const xin = D.x[Math.floor(D.x.length / 2)], step = D.x[1] - D.x[0], xout = D.x[last] + 3 * step, res = D.y[k] - predict(L, D.x[k]), cons = E.iqr < F.iqr ? 'E' : 'F';
  const out = { set: X };
  out['fa-median'] = fields([{ id: 'e', label: 'Rider E median', answer: E.median, traps: [{ value: e[3], code: 'median-one-middle', message: 'Average the two middle times.' }] }, { id: 'f', label: 'Rider F median', answer: F.median, traps: [{ value: f[3], code: 'median-one-middle', message: 'Average the two middle times.' }, { value: F.mean, code: 'mean-for-median', message: 'That’s the mean.' }] }],
    { ideas: ['center'], level: 'intermediate', prompt: `Rider E: ${list(e)}. Rider F: ${list(f)} (seconds, in order). Find each median.`, hints: H('Eight values: average the 4th and 5th.', `E: ${e[3]} and ${e[4]}.`, `F: ${f[3]} and ${f[4]}.`), solution: `E: ${N(E.median)} s. F: ${N(F.median)} s.` });
  out['fa-iqr'] = fields([{ id: 'e', label: 'Rider E IQR', answer: E.iqr, traps: [{ value: E.range, code: 'range-for-iqr', message: 'That’s the range.' }] }, { id: 'f', label: 'Rider F IQR', answer: F.iqr, traps: [{ value: F.range, code: 'range-for-iqr', message: 'That’s the range.' }] }],
    { ideas: ['spread', 'box-plot'], level: 'advanced', prompt: 'Find each rider’s IQR (median of halves).', hints: H('Lower half: the first four; upper half: the last four.', 'Q1 and Q3 are their medians.', 'IQR = Q3 − Q1.'), solution: `E: Q1 ${N(E.q1)}, Q3 ${N(E.q3)}, IQR ${N(E.iqr)} s. F: Q1 ${N(F.q1)}, Q3 ${N(F.q3)}, IQR ${N(F.iqr)} s.` });
  out['fa-consistent'] = choice('Which rider is more consistent, and why?', `Rider ${cons}, because their IQR is smaller`, [[`Rider ${cons === 'E' ? 'F' : 'E'}, because their IQR is larger`, 'larger-iqr-consistent', 'A larger IQR means more spread: less consistent.'], [`Rider ${cons === 'E' ? 'F' : 'E'}, because their fastest run is faster`, 'one-statistic', 'One run doesn’t measure consistency.']],
    { ideas: ['compare', 'spread'], level: 'intermediate', hints: H('Consistency means spread.', 'Compare IQRs.', 'Smaller is more consistent.') });
  out['fb-direction'] = choice(`${D.title}: describe the association.`, `${neg ? 'Negative' : 'Positive'} and roughly linear, with one unusual point`, [[`${neg ? 'Positive' : 'Negative'} and roughly linear`, neg ? 'faster-is-positive' : 'lower-is-slower', `Left to right, the times go ${neg ? 'down' : 'up'}.`], ['No association', 'overcorrect', 'Most points follow a clear trend.']],
    { ideas: ['association', 'form'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('Read left to right.', 'Rising or falling?', 'Look for one point off the pattern.') });
  out['fb-outlier'] = choice('Which point is the unusual one?', pt(D, k), [0, last, k === 1 ? 2 : 1].filter(i => i !== k).map(i => [pt(D, i), 'extreme-not-outlier', `${pt(D, i)} fits the pattern.`]),
    { ideas: ['outliers'], level: 'intermediate', fig: { kind: 'scatter', set: D }, hints: H('Picture the trend.', 'Which point is far from it?', 'Not necessarily the highest or lowest.') });
  out['fb-action'] = choice(`What should the team do about ${pt(D, k)}?`, 'Flag it and investigate the circumstances before deciding anything', [['Delete it so the pattern is cleaner', 'delete-outlier', 'Never remove a point just because it doesn’t fit.'], ['Treat it as proof that the rider made a mistake', 'outlier-proof', 'The data can’t say what happened.']],
    { ideas: ['outliers'], level: 'beginner', hints: H('Is unusual the same as wrong?', 'No.', 'Investigate.') });
  out['fc-strength'] = choice(`For this data r ≈ ${N(r, 2)}. Which description fits?`, `${neg ? 'Negative' : 'Positive'}, fairly strong but not perfect`, [[`${neg ? 'Positive' : 'Negative'}, fairly strong`, 'sign-strength', 'The sign gives the direction.'], ['Very weak: close to 0', 'r-zero-no-relation', `|r| ≈ ${N(Math.abs(r), 2)} is far from 0.`], [`Perfect ${neg ? 'negative' : 'positive'}`, 'perfect-fit', 'Perfect would be exactly ±1.']],
    { ideas: ['direction-strength', 'r-meaning'], level: 'intermediate', hints: H('Sign: direction.', 'Size: strength.', 'Exactly ±1 would be perfect.') });
  out['fc-cause'] = choice(`Can this data prove that ${D.context} ${neg ? 'makes sector times faster' : 'makes sector times slower'}?`, 'No: it shows an association in observational data; other factors could explain it', [['Yes: the correlation is strong', 'causal-claim', 'Strength doesn’t turn association into cause.'], ['Yes, after removing the unusual point', 'causal-claim', 'Still only an association.']],
    { ideas: ['causation'], level: 'intermediate', hints: H('Was anything assigned or controlled?', 'No.', 'Association isn’t proof.') });
  const sl = Math.abs(L.slope), up = L.slope > 0;
  out['fd-slope'] = choice(`The model is ${eqText(L)} (x = ${D.xLabel.toLowerCase()}). What does the slope mean?`, `For each additional ${u1(D)}, the predicted sector time is about ${N(sl)} s ${up ? 'higher' : 'lower'}, on average, in this data`, [[`Each additional ${u1(D)} makes a rider exactly ${N(sl)} s ${up ? 'slower' : 'faster'}`, 'slope-causal', 'It’s an average prediction from an association, not a guaranteed effect.'], [`For each additional ${u1(D)}, the predicted time is about ${N(sl)} s ${up ? 'lower' : 'higher'}`, 'slope-sign', `The slope is ${up ? 'positive' : 'negative'}.`]],
    { ideas: ['slope-meaning'], level: 'intermediate', hints: H('Slope: change in ŷ per 1 more x.', 'Check the sign.', 'It’s a prediction, not a cause.') });
  out['fd-predict'] = num(predict(L, xin), { ideas: ['predict'], level: 'intermediate', label: 'Predicted time', unit: 's', prompt: `Use ${eqText(L)} to predict the sector time at x = ${xin}.`, traps: [{ value: L.intercept - L.slope * xin, code: 'slope-sign', message: 'Keep the slope’s sign.' }],
    hints: H(`Substitute x = ${xin}.`, `${N(L.slope)} × ${xin} = ${N(L.slope * xin)}.`, 'Add it to the intercept.'), solution: `ŷ = ${N(L.intercept)} + (${N(L.slope * xin)}) = ${N(predict(L, xin))} s.` });
  out['fd-residual'] = num(res, { ideas: ['residuals'], level: 'advanced', label: 'Residual', unit: 's', prompt: `The unusual point is ${pt(D, k)}. What’s its residual?`, traps: [{ value: -res, code: 'residual-order', message: 'Actual − predicted.' }],
    hints: H(`Predicted at x = ${D.x[k]}: ${N(L.intercept)} + (${N(L.slope)})(${D.x[k]}).`, `= ${N(predict(L, D.x[k]))}.`, `Residual = ${D.y[k]} − ${N(predict(L, D.x[k]))}.`), solution: `${D.y[k]} − ${N(predict(L, D.x[k]))} = ${signed(res)} s.` });
  out['fd-extrap'] = choice(`The model predicts ${N(predict(L, xout))} s at x = ${xout}. How should the team treat that?`, `Cautiously: the data only runs from ${D.x[0]} to ${D.x[last]}, so ${xout} is an extrapolation`, [['Trust it: the equation works for any x', 'extrapolate-trust', 'The trend may not continue outside the data.'], ['Throw the model away', 'overcorrect', 'The model is still useful inside its range.']],
    { ideas: ['extrapolation'], level: 'intermediate', hints: H('What x-values are in the data?', `${D.x[0]} to ${D.x[last]}.`, `${xout} is outside.`) });
  return tidy(arrange(out));
}
function u1(D) { return ({ laps: 'practice lap', minutes: 'minute of walk-through', runs: 'run', places: 'place later in the start order', checks: 'brake check', 'km/h': 'km/h of entry speed' })[D.xUnit] || D.xUnit; }

export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  for (const [count, fn, ids] of [[RIDER_PAIRS.length, auditPractice, AUDIT_IDS], [PAIRED.length, scanPractice, SCAN_IDS], [PAIRED.length, signalPractice, SIGNAL_IDS], [PAIRED.length, forecastPractice, FORECAST_IDS]])
    for (let n = 0; n < count; n++) { const Q = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...Q[id].ideas])]; }
  for (let r = 1; r <= FINAL_SETS.length; r++) { const X = finalQuestions(r); for (const id of FINAL_IDS) out[id] = [...new Set([...(out[id] || []), ...X[id].ideas])]; }
  return out;
}
export { sorted };
