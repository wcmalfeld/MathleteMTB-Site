// Enduro Race Intelligence Lab: every graded question. Answers come from the
// models and stats.js (exact fractions for table probabilities, computed
// simulations for p-values), never typed in by hand. Each has three
// progressive hints (concept, method, guided step), a solution with its
// meaning in the race scenario, and traps: anticipated wrong answers with a
// misconception code and a message.

import { RACE, raceTable, CARDS, ALPHA, BRAVO, NORMAL, SURVEY, EXPERIMENT, PODIUM, RACE_PRACTICE, Z_PRACTICE, SAMPLE_PRACTICE, DESIGN_PRACTICE, FINAL_SETS, pick, tableOf } from './models.js';
import { mean, median, range, popSD, sampleSD, Phi, zScore, se, moe, interval, permutationTest, nCr, nPr, fmt, pct, show, Frac } from './stats.js';

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
const N = x => Number(x), P3 = 0.001;   // probabilities to 3 decimal places

// Permutation tests are computed once per dataset and cached (50,000 seeded shuffles each).
const TESTS = new Map();
export function testFor(D) { const k = D.A.join() + '|' + D.B.join(); if (!TESTS.has(k)) TESTS.set(k, permutationTest(D.A, D.B, EXPERIMENT.reps, EXPERIMENT.seed)); return TESTS.get(k); }

export const IDEAS = {
  'sample-space': 'Sample spaces',
  'mutually-exclusive': 'Mutually exclusive events',
  'not-exclusive': 'Non-mutually exclusive events',
  addition: 'Addition rule',
  multiplication: 'Multiplication rule',
  conditional: 'Conditional probability',
  independent: 'Independent events',
  dependent: 'Dependent events',
  'two-way': 'Two-way tables',
  joint: 'Joint probabilities',
  marginal: 'Marginal probabilities',
  'conditional-rf': 'Conditional relative frequencies',
  mean: 'Mean',
  median: 'Median',
  range: 'Range',
  sd: 'Standard deviation',
  histogram: 'Histograms',
  normal: 'Normal distribution',
  empirical: 'Empirical rule',
  'z-score': 'Z-scores',
  percentile: 'Percentiles',
  'pop-sample': 'Population and sample',
  'random-sampling': 'Random sampling',
  proportion: 'Sample proportion',
  'sampling-dist': 'Sampling distributions',
  'standard-error': 'Standard error',
  moe: 'Margin of error',
  'study-design': 'Surveys, experiments and observational studies',
  randomized: 'Randomized experiments',
  significance: 'Statistical significance',
  claims: 'Interpretation of statistical claims',
  counting: 'Combinations and permutations'
};
// The PRD's thirty-one tracked skills, in its order.
export const REPORT_IDEAS = Object.keys(IDEAS).filter(k => k !== 'counting');

export const MISCONCEPTIONS = {
  'conditional-unconditional': 'Confusing conditional and unconditional probability',
  denominator: 'Using the wrong denominator in a conditional probability',
  'forgot-intersection': 'Forgetting to subtract the intersection in the addition rule',
  causation: 'Assuming an observational association proves causation',
  'independent-exclusive': 'Confusing independence with mutual exclusivity',
  'table-reading': 'Misreading a two-way table',
  'mean-median': 'Confusing the mean and the median',
  'sd-meaning': 'Treating standard deviation as exactly the average distance from the mean',
  shape: 'Ignoring the shape of a distribution',
  outliers: 'Using mean and SD when outliers make median and IQR better',
  'z-calc': 'Calculating a z-score incorrectly',
  'z-direction': 'Confusing the direction of a z-score',
  'percentile-rank': 'Confusing a time percentile with a performance ranking',
  'empirical-misuse': 'Misapplying the empirical rule',
  'sample-population': 'Confusing sample and population',
  'biased-sample': 'Treating a biased sample as representative',
  'sd-se': 'Confusing standard deviation with standard error',
  'certainty': 'Assuming a larger sample eliminates uncertainty',
  'moe-meaning': 'Misinterpreting margin of error',
  'survey-experiment': 'Confusing surveys, observational studies and experiments',
  'p-proof': 'Assuming a small p-value proves a hypothesis',
  'p-meaning': 'Misreading what a p-value is',
  practical: 'Treating statistical significance as practical significance',
  'sd-convention': 'Using the sample SD where the population SD was asked for',
  'order-matters': 'Mixing up combinations and permutations',
  arithmetic: 'An arithmetic slip'
};

// ================================================================ Mission 1: Race-Day Probability
const T = raceTable(), pA = T.col(0), pB = T.row(0), pAB = T.joint(0, 0);
const M1 = {
  'r-space': { type: 'number', ideas: ['sample-space', 'two-way'], answer: T.total, tolerance: 0.001, label: 'Outcomes', prompt: 'We pick one of the simulated stage attempts at random. How many equally likely outcomes are in the sample space?',
    traps: [{ value: 4, code: 'table-reading', message: 'The four cells are categories. Each attempt is one outcome.' }, { value: 120, code: 'table-reading', message: 'That’s only the dry attempts.' }],
    hints: ['A sample space lists every possible outcome.', 'Each attempt is one outcome.', 'Use the grand total.'], solution: '200: each simulated attempt is one equally likely outcome.' },
  'r-and': { type: 'choice', ideas: ['sample-space', 'joint'], prompt: 'A = hit target time, B = dry course. What does “A and B” mean?',
    options: [opt('a', 'The attempt hit its target AND was on a dry course', true), opt('b', 'It hit its target OR was dry', false, 'table-reading', '“Or” includes either; “and” needs both.'), opt('c', 'It hit its target, given it was dry', false, 'conditional-unconditional', 'That’s conditional: A | B.'), opt('d', 'It missed its target on a dry course', false, 'table-reading', 'A is hitting the target.')],
    hints: ['“And” is an intersection.', 'Both conditions at once.', 'One cell of the table.'], solution: 'Both: the Dry / Hit target cell, 84 attempts.' },
  'r-or': { type: 'choice', ideas: ['sample-space', 'not-exclusive'], prompt: 'And “A or B”?',
    options: [opt('a', 'Hit target, or dry, or both', true), opt('b', 'Hit target or dry, but not both', false, 'forgot-intersection', 'In probability “or” is inclusive: both counts.'), opt('c', 'Only attempts that did both', false, 'table-reading', 'That’s “and”.'), opt('d', 'Neither', false, 'table-reading', 'That’s the complement of A or B.')],
    hints: ['“Or” is a union.', 'Inclusive.', 'Either, or both.'], solution: 'Inclusive “or”: any attempt that hit its target, was dry, or both.' },
  'r-not': { type: 'number', ideas: ['sample-space', 'marginal'], answer: N(new Frac(1).sub(pA)), tolerance: P3, label: 'P(not A)', prompt: 'P(not A): the probability an attempt missed its target?',
    traps: [{ value: N(pA), code: 'table-reading', message: 'That’s P(A). The complement is 1 − P(A).' }, { value: 76, code: 'table-reading', message: 'As a probability: 76 ÷ 200.' }],
    hints: ['Complement: 1 − P(A).', 'P(A) = 124/200.', 'Or count the misses: 76/200.'], solution: `P(not A) = 1 − 0.62 = ${show(new Frac(1).sub(pA))}.` },
  'r-joint': { type: 'number', ideas: ['joint', 'two-way'], answer: N(pAB), tolerance: P3, label: 'P(A and B)', prompt: 'P(A and B)?',
    traps: [{ value: N(T.colGivenRow(0, 0)), code: 'denominator', message: 'Joint probability divides by all 200, not the 120 dry.' }, { value: 84, code: 'table-reading', message: 'As a probability: ÷ 200.' }],
    hints: ['Find the Dry / Hit cell.', '84 attempts.', 'Out of 200.'], solution: 'P(A and B) = 84/200 = 0.42.' },
  'r-mutex': { type: 'multi', ideas: ['mutually-exclusive'], prompt: 'Challenge: which pairs of events are mutually exclusive (can’t happen in the same attempt)?',
    options: [opt('a', 'Dry and Wet', true), opt('b', 'Hit target and Missed target', true), opt('c', 'Dry and Hit target', false, 'independent-exclusive', '84 attempts were both.'), opt('d', 'Wet and Missed target', false, 'independent-exclusive', '40 attempts were both.')],
    hints: ['Mutually exclusive: P(both) = 0.', 'Look for a 0 in the table.', 'Two categories of the same variable never overlap.'], solution: 'Dry/Wet and Hit/Missed: each attempt is exactly one of each pair.' },
  'r-wet': { type: 'number', ideas: ['mutually-exclusive', 'marginal'], answer: N(T.row(1)), tolerance: P3, label: 'P(Wet)', prompt: 'P(Dry or Wet) = 1, and they can’t overlap. So P(Wet) = 1 − P(Dry) = ?',
    traps: [{ value: N(pB), code: 'table-reading', message: 'That’s P(Dry).' }], hints: ['P(Dry) = 120/200.', '1 − 0.60.', 'Check: 80/200.'], solution: 'P(Wet) = 1 − 0.60 = 0.40.' },
  'r-union': { type: 'number', ideas: ['addition', 'not-exclusive'], answer: N(T.union(0, 0)), tolerance: P3, label: 'P(A or B)', prompt: 'Addition rule: P(A or B) = P(A) + P(B) − P(A and B). Find it.',
    traps: [{ value: N(pA.add(pB)), code: 'forgot-intersection', message: 'Subtract the overlap: the 84 dry hits were counted twice.' }, { value: N(pAB), code: 'table-reading', message: 'That’s “and”.' }],
    hints: ['P(A) = 0.62, P(B) = 0.60.', 'P(A and B) = 0.42.', '0.62 + 0.60 − 0.42.'], solution: 'P(A or B) = 0.80: 80% of attempts hit their target, were dry, or both.' },
  'r-cond-dry': { type: 'number', ideas: ['conditional', 'conditional-rf'], answer: N(T.colGivenRow(0, 0)), tolerance: P3, label: 'P(A | Dry)', prompt: 'P(hit target | dry course)?',
    traps: [{ value: N(pAB), code: 'conditional-unconditional', message: 'Given dry: only the 120 dry attempts count.' }, { value: N(T.rowGivenCol(0, 0)), code: 'denominator', message: 'That’s P(dry | hit) = 84/124. The condition after | is the denominator.' }],
    hints: ['The condition restricts the sample space.', 'Only the 120 dry attempts.', '84 of them hit.'], solution: 'P(A | Dry) = 84/120 = 0.70.' },
  'r-cond-wet': { type: 'number', ideas: ['conditional', 'conditional-rf'], answer: N(T.colGivenRow(0, 1)), tolerance: P3, label: 'P(A | Wet)', prompt: 'And P(hit target | wet course)?',
    traps: [{ value: N(T.joint(0, 1)), code: 'conditional-unconditional', message: 'Divide by the 80 wet attempts.' }, { value: N(T.rowGivenCol(1, 0)), code: 'denominator', message: 'That’s P(wet | hit) = 40/124.' }],
    hints: ['Restrict to wet.', '80 wet attempts.', '40 hit.'], solution: 'P(A | Wet) = 40/80 = 0.50.' },
  'r-indep': { type: 'choice', ideas: ['independent', 'dependent'], prompt: 'Are hitting the target and a dry course independent in this dataset?',
    options: [opt('a', 'No: P(A | Dry) = 0.70 isn’t P(A) = 0.62', true), opt('b', 'Yes: they can happen together', false, 'independent-exclusive', 'Overlapping isn’t the same as independent.'), opt('c', 'No: they’re mutually exclusive', false, 'independent-exclusive', '84 attempts were both: not mutually exclusive.'), opt('d', 'Yes: both probabilities are above 0.5', false, 'table-reading', 'Independence compares P(A | B) with P(A).')],
    hints: ['Independent: knowing B doesn’t change P(A).', 'Compare P(A | Dry) and P(A).', '0.70 vs 0.62.'], solution: 'Not independent: being dry is associated with a higher hit rate in these simulated data.' },
  'r-product': { type: 'number', ideas: ['multiplication', 'independent'], answer: N(pA.mul(pB)), tolerance: P3, label: 'P(A)·P(B)', prompt: 'Another check: if they were independent, P(A and B) would equal P(A)·P(B). Compute P(A)·P(B).',
    traps: [{ value: N(pAB), code: 'table-reading', message: 'That’s the actual P(A and B). Multiply 0.62 × 0.60.' }, { value: N(pA.add(pB)), code: 'arithmetic', message: 'Multiply, don’t add.' }],
    hints: ['0.62 × 0.60.', '= 0.372.', 'Compare with 0.42.'], solution: '0.372 ≠ 0.42, confirming the events aren’t independent.' },
  'r-cause': { type: 'choice', ideas: ['claims', 'dependent'], prompt: 'Does this prove dry conditions cause riders to hit their target times?',
    options: [opt('a', 'No: these are observational data; other factors (rider, bike, time of day) could explain the association', true), opt('b', 'Yes: the probabilities are different', false, 'causation', 'An association in observational data isn’t proof of cause.'), opt('c', 'Yes: 200 attempts is a large sample', false, 'causation', 'Sample size doesn’t turn association into causation.'), opt('d', 'No: the events are independent', false, 'table-reading', 'They aren’t independent; but even so, association ≠ causation.')],
    hints: ['Was anything randomly assigned?', 'No: conditions just happened.', 'What else could differ between dry and wet attempts?'], solution: 'No. Association, not causation. (And this is simulated data, not riding advice.)' },
  'r-cards': { type: 'number', ideas: ['multiplication', 'independent'], answer: 1 / 6, tolerance: P3, label: 'P(Jump and Wet)', prompt: `Independent draws: a feature card (${CARDS.features.join(', ')}) and a condition card (Dry, Wet), each equally likely. P(Jump and Wet)?`,
    traps: [{ value: 1 / 3 + 1 / 2, code: 'forgot-intersection', message: 'For “and” with independent events, multiply.' }, { value: 1 / 5, code: 'arithmetic', message: 'There are 3 × 2 = 6 equally likely pairs.' }],
    hints: ['Independent: multiply.', 'P(Jump) = 1/3, P(Wet) = 1/2.', '1/3 × 1/2.'], solution: '1/6 ≈ 0.167: one of six equally likely card pairs.' }
};
export function racePractice(n) {
  const t = tableOf(pick(RACE_PRACTICE, n)), indep = t.independent(0, 0);
  return tidy({
    brief: `Data set ${n + 1} (simulated): Dry ${t.cells[0][0]} hit / ${t.cells[0][1]} missed; Wet ${t.cells[1][0]} hit / ${t.cells[1][1]} missed.`, table: t,
    'rx-cond': { type: 'fields', ideas: ['conditional', 'conditional-rf'], prompt: 'Find P(hit | dry) and P(hit | wet) (3 decimal places).',
      fields: [{ id: 'd', label: 'P(hit | dry)', answer: N(t.colGivenRow(0, 0)), tolerance: P3, traps: [{ value: N(t.joint(0, 0)), code: 'conditional-unconditional', message: 'Divide by the dry total only.' }] }, { id: 'w', label: 'P(hit | wet)', answer: N(t.colGivenRow(0, 1)), tolerance: P3, traps: [{ value: N(t.joint(0, 1)), code: 'conditional-unconditional', message: 'Divide by the wet total only.' }] }],
      hints: ['Restrict to one row.', `Dry total ${t.rowTot[0]}, wet total ${t.rowTot[1]}.`, 'Hits in that row ÷ the row total.'], solution: `${show(t.colGivenRow(0, 0))} and ${show(t.colGivenRow(0, 1))}.` },
    'rx-union': { type: 'number', ideas: ['addition'], answer: N(t.union(0, 0)), tolerance: P3, label: 'P(hit or dry)', prompt: 'P(hit or dry)?',
      traps: [{ value: N(t.col(0).add(t.row(0))), code: 'forgot-intersection', message: 'Subtract P(hit and dry).' }], hints: ['P(hit) + P(dry) − P(both).', `${t.colTot[0]}/${t.total} + ${t.rowTot[0]}/${t.total} − ${t.cells[0][0]}/${t.total}.`, 'Simplify.'], solution: `${show(t.union(0, 0))}.` },
    'rx-indep': { type: 'choice', ideas: ['independent', 'dependent'], prompt: 'Are hitting the target and a dry course independent here?', keepOrder: true,
      options: [opt('y', 'Yes: P(hit | dry) equals P(hit)', indep, 'independent-exclusive', `P(hit | dry) = ${show(t.colGivenRow(0, 0))} but P(hit) = ${show(t.col(0))}.`), opt('n', 'No: P(hit | dry) differs from P(hit)', !indep, 'independent-exclusive', `They’re equal (${show(t.col(0))}), so the events are independent.`), opt('m', 'They’re mutually exclusive', false, 'independent-exclusive', `${t.cells[0][0]} attempts were both.`)],
      hints: ['Compare P(hit | dry) with P(hit).', `P(hit) = ${t.colTot[0]}/${t.total}.`, 'Equal → independent.'], solution: indep ? `Independent: both are ${show(t.col(0))}.` : `Not independent: ${show(t.colGivenRow(0, 0))} vs ${show(t.col(0))}.` }
  });
}
export const RACE_PRACTICE_IDS = ['rx-cond', 'rx-union', 'rx-indep'];

// ================================================================ Mission 2: Who's Actually Fast?
const NM = NORMAL, zx = zScore(NM.example, NM.mu, NM.sigma), zc = zScore(NM.challenge, NM.mu, NM.sigma);
const M2 = {
  'f-center': { type: 'fields', ideas: ['mean', 'median'], prompt: 'Find the mean and median of each crew’s 10 simulated segment times.',
    fields: [{ id: 'am', label: 'Alpha mean', answer: mean(ALPHA), tolerance: 0.01 }, { id: 'ad', label: 'Alpha median', answer: median(ALPHA), tolerance: 0.01 }, { id: 'bm', label: 'Bravo mean', answer: mean(BRAVO), tolerance: 0.01 }, { id: 'bd', label: 'Bravo median', answer: median(BRAVO), tolerance: 0.01 }],
    hints: ['Mean: add and divide by 10.', 'Median: the middle of the ordered list.', 'With 10 values, average the 5th and 6th.'], solution: 'All four are 180 s. Same center: so is one crew more consistent?' },
  'f-range': { type: 'fields', ideas: ['range'], prompt: 'Range of each crew?',
    fields: [{ id: 'a', label: 'Alpha range (s)', answer: range(ALPHA), tolerance: 0.01, traps: [{ value: 188, code: 'arithmetic', message: 'Range = max − min.' }] }, { id: 'b', label: 'Bravo range (s)', answer: range(BRAVO), tolerance: 0.01, traps: [{ value: 200, code: 'arithmetic', message: 'Range = max − min.' }] }],
    hints: ['Max − min.', 'Alpha: 188 − 172.', 'Bravo: 200 − 160.'], solution: 'Alpha 16 s, Bravo 40 s.' },
  'f-sd': { type: 'fields', ideas: ['sd'], prompt: 'Treat each crew’s 10 runs as the whole data set: population standard deviation σ (2 decimal places)?',
    fields: [{ id: 'a', label: 'Alpha σ (s)', answer: popSD(ALPHA), tolerance: 0.01, traps: [{ value: sampleSD(ALPHA), code: 'sd-convention', message: 'Divide by n = 10 (population), not n − 1.' }, { value: popSD(ALPHA) ** 2, code: 'sd-meaning', message: 'That’s the variance; take the square root.' }] },
      { id: 'b', label: 'Bravo σ (s)', answer: popSD(BRAVO), tolerance: 0.01, traps: [{ value: sampleSD(BRAVO), code: 'sd-convention', message: 'Divide by n = 10 (population), not n − 1.' }, { value: popSD(BRAVO) ** 2, code: 'sd-meaning', message: 'That’s the variance; take the square root.' }] }],
    hints: ['Square each distance from 180.', 'Alpha: 64 + 36 + 16 + 4 + 0 + 0 + 4 + 16 + 36 + 64 = 240.', 'σ = √(240 ÷ 10); Bravo’s squares add to 1248.'], solution: `Alpha σ ≈ ${fmt(popSD(ALPHA), 2)} s, Bravo σ ≈ ${fmt(popSD(BRAVO), 2)} s.` },
  'f-consistent': { type: 'choice', ideas: ['sd', 'histogram'], prompt: 'Which crew has the more consistent times?',
    options: [opt('a', 'Alpha: its standard deviation (4.90 s) is much smaller than Bravo’s (11.17 s)', true), opt('b', 'They’re the same: equal means', false, 'mean-median', 'Same center, different spread.'), opt('c', 'Bravo: it has the fastest single run', false, 'sd-meaning', 'One fast run says nothing about consistency.'), opt('d', 'Bravo: a bigger SD means steadier times', false, 'sd-meaning', 'Bigger SD = more spread.')],
    hints: ['Consistency is about spread.', 'Compare σ.', 'Smaller is tighter.'], solution: 'Alpha: its times cluster more tightly around 180 s.' },
  'f-sd-meaning': { type: 'choice', ideas: ['sd'], prompt: 'What does Alpha’s σ ≈ 4.90 s describe?',
    options: [opt('a', 'A typical distance of a run from the 180 s mean', true), opt('b', 'Exactly the average distance from the mean', false, 'sd-meaning', 'That’s the mean absolute deviation (4.0 s here); σ squares distances first.'), opt('c', 'The difference between the fastest and slowest runs', false, 'sd-meaning', 'That’s the range, 16 s.'), opt('d', 'How fast the crew is', false, 'mean-median', 'Speed is about the center; σ is spread.')],
    hints: ['σ measures spread around the mean.', 'It squares distances, averages, then roots.', 'Close to, but not exactly, the average distance.'], solution: 'A typical distance from the mean. It’s not exactly the average distance: squaring weights big deviations more.' },
  'f-outlier': { type: 'choice', ideas: ['median', 'mean'], prompt: 'Suppose one Alpha run had been a crash at 240 s. Which summary of the center would change least?',
    options: [opt('a', 'The median', true), opt('b', 'The mean', false, 'outliers', 'The mean jumps by 5.2 s; one extreme value pulls it.'), opt('c', 'Both equally', false, 'outliers', 'The median ignores how extreme the top value is.'), opt('d', 'The standard deviation', false, 'outliers', 'That’s spread, and it would grow a lot.')],
    hints: ['Which uses every value’s size?', 'Which only uses the middle?', 'Outliers pull the mean.'], solution: 'The median (it stays 180 or 181); with outliers, median and IQR describe the data better than mean and SD.' },
  'f-68': { type: 'fields', ideas: ['empirical', 'normal'], prompt: `Model T ~ N(${NM.mu}, ${NM.sigma}): mean ${NM.mu} s, SD ${NM.sigma} s. About 68% of modelled times fall between…`,
    fields: [{ id: 'lo', label: 'from (s)', answer: NM.mu - NM.sigma, tolerance: 0.01, traps: [{ value: NM.mu - 2 * NM.sigma, code: 'empirical-misuse', message: '68% is within 1 SD.' }] }, { id: 'hi', label: 'to (s)', answer: NM.mu + NM.sigma, tolerance: 0.01, traps: [{ value: NM.mu + 2 * NM.sigma, code: 'empirical-misuse', message: '68% is within 1 SD.' }] }],
    hints: ['68% is within one SD.', 'μ ± σ.', '180 ± 12.'], solution: '168 to 192 s (and 95%: 156–204; 99.7%: 144–216).' },
  'f-95': { type: 'fields', ideas: ['empirical'], prompt: 'And about 95% between…',
    fields: [{ id: 'lo', label: 'from (s)', answer: NM.mu - 2 * NM.sigma, tolerance: 0.01, traps: [{ value: NM.mu - NM.sigma, code: 'empirical-misuse', message: '95% is within 2 SD.' }] }, { id: 'hi', label: 'to (s)', answer: NM.mu + 2 * NM.sigma, tolerance: 0.01, traps: [{ value: NM.mu + 3 * NM.sigma, code: 'empirical-misuse', message: '95% is within 2 SD.' }] }],
    hints: ['Two SDs.', '2 × 12 = 24.', '180 ± 24.'], solution: '156 to 204 s.' },
  'f-normal-ok': { type: 'choice', ideas: ['normal', 'histogram'], prompt: 'When is a normal model reasonable for race times?',
    options: [opt('a', 'When the distribution is roughly symmetric and bell-shaped with one peak', true), opt('b', 'Always: race times are normal', false, 'shape', 'Plenty of data are skewed; check the shape first.'), opt('c', 'Whenever you have a mean and an SD', false, 'empirical-misuse', 'Any data have a mean and SD; that doesn’t make them normal.'), opt('d', 'When there are crashes in the data', false, 'shape', 'Crashes add a long right tail: skewed, not normal.')],
    hints: ['Look at the histogram.', 'Symmetric? One peak?', 'Long tails or skew mean no.'], solution: 'Only when the shape is roughly bell-shaped. Times with crashes or mechanicals are often right-skewed.' },
  'f-z': { type: 'number', ideas: ['z-score'], answer: zx, tolerance: 0.001, label: 'z', prompt: `A rider finishes in ${NM.example} s. z = (x − μ)/σ = ?`,
    traps: [{ value: -zx, code: 'z-direction', message: 'x − μ: 168 − 180 is negative.' }, { value: NM.example - NM.mu, code: 'z-calc', message: 'Divide by σ = 12.' }],
    hints: ['x − μ = 168 − 180.', '= −12.', '÷ 12.'], solution: 'z = −1: one SD below the mean, which for times means faster.' },
  'f-pct': { type: 'fields', ideas: ['percentile', 'z-score'], prompt: `Using the normal model: what percentile is a ${NM.example} s time, and what percent of modelled riders are slower? (1 decimal place)`,
    fields: [{ id: 'p', label: 'Time percentile (%)', answer: Phi(zx) * 100, tolerance: 0.1, traps: [{ value: (1 - Phi(zx)) * 100, code: 'percentile-rank', message: 'The percentile is the share of times at or below 168 s.' }, { value: 16, code: 'empirical-misuse', message: 'Use the normal table: Φ(−1) ≈ 0.1587.' }] },
      { id: 's', label: 'Slower (%)', answer: (1 - Phi(zx)) * 100, tolerance: 0.1, traps: [{ value: Phi(zx) * 100, code: 'percentile-rank', message: 'Slower = more time = above 168 s.' }] }],
    hints: ['Φ(−1) ≈ 0.1587.', 'Percentile = Φ(z) × 100.', 'Slower = 100 − percentile.'], solution: `≈ ${fmt(Phi(zx) * 100, 1)}th percentile of times; about ${fmt((1 - Phi(zx)) * 100, 1)}% of modelled riders are slower. A low time percentile is a strong result.` },
  'f-challenge': { type: 'fields', ideas: ['z-score', 'percentile'], prompt: `Independent challenge: ${NM.challenge} s. Find z and the time percentile (%, 1 decimal place).`,
    fields: [{ id: 'z', label: 'z', answer: zc, tolerance: 0.001, traps: [{ value: -zc, code: 'z-direction', message: '204 is above the mean: z > 0.' }] }, { id: 'p', label: 'Percentile (%)', answer: Phi(zc) * 100, tolerance: 0.1, traps: [{ value: (1 - Phi(zc)) * 100, code: 'percentile-rank', message: 'Percentile = share at or below.' }, { value: 95, code: 'empirical-misuse', message: '95% is between ±2 SD; below +2 SD is 97.7%.' }] }],
    hints: ['(204 − 180) ÷ 12.', 'z = 2.', 'Φ(2) ≈ 0.9772.'], solution: `z = 2; ≈ ${fmt(Phi(zc) * 100, 1)}th percentile.` },
  'f-challenge-meaning': { type: 'choice', ideas: ['percentile', 'z-score'], prompt: 'What does that mean for the rider?',
    options: [opt('a', 'A relatively slow time: about 97.7% of modelled times are at or below 204 s', true), opt('b', 'A great result: 97.7th percentile', false, 'percentile-rank', 'For times, a high percentile means slower than most.'), opt('c', 'Exactly average', false, 'z-direction', 'z = 2 is two SDs above the mean.'), opt('d', 'Faster than 97.7% of riders', false, 'percentile-rank', 'The percentile counts times at or below: those riders were faster.')],
    hints: ['Lower time = faster.', 'z = +2 is above the mean time.', 'Most riders were quicker.'], solution: 'Slow: only about 2.3% of modelled riders take longer. A time percentile isn’t a ranking where high is good.' }
};
export function zPractice(n) {
  const s = pick(Z_PRACTICE, n), z = zScore(s.x, s.mu, s.sigma), p = Phi(z) * 100;
  return tidy({
    brief: `Model ${n + 1}: a simulated stage modelled as N(${s.mu}, ${s.sigma}) seconds. A rider’s time: ${s.x} s.`, set: s,
    'zx-z': { type: 'number', ideas: ['z-score'], answer: z, tolerance: 0.001, label: 'z', prompt: 'z-score?',
      traps: [{ value: -z, code: 'z-direction', message: 'x − μ, in that order.' }, { value: s.x - s.mu, code: 'z-calc', message: `Divide by σ = ${s.sigma}.` }], hints: ['z = (x − μ)/σ.', `(${s.x} − ${s.mu}) ÷ ${s.sigma}.`, 'Keep the sign.'], solution: `z = ${fmt(z, 2)}.` },
    'zx-pct': { type: 'number', ideas: ['percentile'], answer: p, tolerance: 0.1, label: 'Percentile (%)', prompt: 'Time percentile (%, 1 decimal place)?',
      traps: [{ value: 100 - p, code: 'percentile-rank', message: 'Percentile = share at or below this time.' }], hints: ['Φ(z) × 100.', `Φ(${fmt(z, 2)}).`, 'Use the calculator below.'], solution: `≈ ${fmt(p, 1)}%: ${z < 0 ? 'faster' : z > 0 ? 'slower' : 'the same as'} than the mean time.` }
  });
}
export const Z_PRACTICE_IDS = ['zx-z', 'zx-pct'];

// ================================================================ Mission 3: The Rider Sample Lab
const S = SURVEY, ph = S.x / S.n, SEP = se(ph, S.n), MEP = moe(ph, S.n), IV = interval(ph, S.n), p0 = S.flow / S.N;
const M3 = {
  's-pop': { type: 'choice', ideas: ['pop-sample'], prompt: 'Which is the population, and which is the sample?',
    options: [opt('a', 'Population: all 1,000 registered riders. Sample: the riders surveyed', true), opt('b', 'Population: the riders surveyed. Sample: all 1,000', false, 'sample-population', 'The population is everyone you want to know about.'), opt('c', 'Both are the 100 surveyed riders', false, 'sample-population', 'The sample is a part of the population.'), opt('d', 'Population: flow-trail fans. Sample: technical-trail fans', false, 'sample-population', 'Those are answer categories.')],
    hints: ['Who do we want to know about?', 'Who did we actually ask?', 'The sample is part of the population.'], solution: 'Population: the 1,000 registrants. Sample: the riders actually surveyed.' },
  's-phat': { type: 'number', ideas: ['proportion'], answer: ph, tolerance: P3, label: 'p̂', prompt: 'A random sample of 100: 62 prefer flow trails. Sample proportion p̂?',
    traps: [{ value: 62, code: 'arithmetic', message: 'As a proportion: 62 ÷ 100.' }, { value: 0.6, code: 'sample-population', message: 'That’s the hidden population value; we only know the sample.' }],
    hints: ['p̂ = x ÷ n.', '62 ÷ 100.', 'As a decimal.'], solution: 'p̂ = 0.62.' },
  's-exact': { type: 'choice', ideas: ['proportion', 'sampling-dist'], prompt: 'Can we conclude exactly 62% of all 1,000 riders prefer flow trails?',
    options: [opt('a', 'No: it’s an estimate; another random sample would likely give a different proportion', true), opt('b', 'Yes: the sample was random', false, 'certainty', 'Random samples still vary.'), opt('c', 'Yes: 100 riders is 10% of the population', false, 'certainty', 'Size helps, but doesn’t make it exact.'), opt('d', 'No: random samples are always biased', false, 'biased-sample', 'Random samples are unbiased; they just vary.')],
    hints: ['Would a second sample match exactly?', 'Sampling variability.', 'Estimate vs truth.'], solution: 'No. A random sample estimates the population; it doesn’t pin it down exactly.' },
  's-se25': { type: 'number', ideas: ['standard-error', 'sampling-dist'], answer: se(p0, 25), tolerance: P3, label: 'SE (n = 25)', prompt: 'The simulator’s hidden population has p = 0.60. Standard error for n = 25: √(p(1 − p)/n)?',
    traps: [{ value: p0 * (1 - p0) / 25, code: 'arithmetic', message: 'Take the square root.' }, { value: Math.sqrt(p0 * (1 - p0)), code: 'sd-se', message: 'That’s the SD of one rider’s answer; divide by n inside the root.' }],
    hints: ['p(1 − p) = 0.24.', '0.24 ÷ 25 = 0.0096.', '√0.0096.'], solution: `SE ≈ ${fmt(se(p0, 25), 3)}.` },
  's-se100': { type: 'number', ideas: ['standard-error'], answer: se(p0, 100), tolerance: P3, label: 'SE (n = 100)', prompt: 'And for n = 100?',
    traps: [{ value: se(p0, 25) / 4, code: 'arithmetic', message: '4× the sample size halves the SE (square root).' }], hints: ['0.24 ÷ 100.', '√0.0024.', '≈ 0.049.'], solution: `SE ≈ ${fmt(se(p0, 100), 3)}: half the n = 25 value.` },
  's-halve': { type: 'choice', ideas: ['standard-error', 'sampling-dist'], prompt: 'Why does going from 25 to 100 riders only halve the standard error?',
    options: [opt('a', 'SE depends on √n: four times the sample is twice √n', true), opt('b', 'Because 100 is twice 25', false, 'arithmetic', '100 is four times 25.'), opt('c', 'Larger samples don’t change SE', false, 'certainty', 'They shrink it.'), opt('d', 'It should be a quarter', false, 'sd-se', 'n is under a square root.')],
    hints: ['SE = √(p(1 − p)/n).', 'n is inside the root.', '√4 = 2.'], solution: 'SE ∝ 1/√n, so quadrupling n halves it.' },
  's-se': { type: 'number', ideas: ['standard-error', 'proportion'], answer: SEP, tolerance: 0.0005, label: 'SE', prompt: 'In real life we don’t know p, so we estimate SE with p̂ = 0.62, n = 100. SE ≈ ? (4 decimal places)',
    traps: [{ value: se(p0, 100), code: 'sample-population', message: 'Use the sample’s p̂ = 0.62.' }, { value: 0.62 * 0.38 / 100, code: 'arithmetic', message: 'Square root.' }],
    hints: ['p̂(1 − p̂) = 0.62 × 0.38.', '= 0.2356; ÷ 100.', '√0.002356.'], solution: `SE ≈ ${fmt(SEP, 4)}.` },
  's-me': { type: 'number', ideas: ['moe'], answer: MEP, tolerance: 0.001, label: 'ME', prompt: 'Approximate 95% margin of error: ME ≈ 1.96 × SE?',
    traps: [{ value: SEP, code: 'moe-meaning', message: 'Multiply the SE by 1.96.' }, { value: 2 * 1.96 * SEP, code: 'moe-meaning', message: 'The margin is one side of the interval.' }],
    hints: ['1.96 × 0.0485.', '≈ 0.095.', 'About 9.5 percentage points.'], solution: `ME ≈ ${fmt(MEP, 3)}.` },
  's-interval': { type: 'fields', ideas: ['moe', 'proportion'], prompt: 'So the approximate 95% interval is 62% ± 9.5%. Enter it as percentages (1 decimal place).',
    fields: [{ id: 'lo', label: 'from (%)', answer: IV[0] * 100, tolerance: 0.1, traps: [{ value: 62 - 4.85, code: 'moe-meaning', message: 'Use the margin of error, not the SE.' }] }, { id: 'hi', label: 'to (%)', answer: IV[1] * 100, tolerance: 0.1, traps: [{ value: 62 + 4.85, code: 'moe-meaning', message: 'Use the margin of error, not the SE.' }] }],
    hints: ['p̂ ± ME.', '62 − 9.5 and 62 + 9.5.', 'As percentages.'], solution: `${fmt(IV[0] * 100, 1)}% to ${fmt(IV[1] * 100, 1)}%: plausible values for the whole event’s flow-trail share, under random sampling and the normal approximation.` },
  's-larger': { type: 'choice', ideas: ['moe', 'sampling-dist'], prompt: 'Which random sample gives the most precise estimate?',
    options: [opt('a', 'n = 200', true), opt('b', 'n = 25', false, 'certainty', 'Smaller samples vary more.'), opt('c', 'They’re all equally precise', false, 'certainty', 'SE shrinks as n grows.'), opt('d', 'n = 50, because it’s in the middle', false, 'certainty', 'Bigger random samples are more precise.')],
    hints: ['Precision = small SE.', 'SE ∝ 1/√n.', 'Biggest n.'], solution: 'n = 200: the smallest margin of error.' },
  's-certain': { type: 'choice', ideas: ['sampling-dist', 'moe'], prompt: 'With n = 200, is the estimate guaranteed to be within a point of the truth?',
    options: [opt('a', 'No: larger samples reduce sampling variability but never eliminate it', true), opt('b', 'Yes: 200 is a big sample', false, 'certainty', 'There’s still a margin of error (about ±6.8 points).'), opt('c', 'Yes, if it’s random', false, 'certainty', 'Random samples still vary.'), opt('d', 'Only if every rider answers', false, 'certainty', 'Even then the sample differs from the population.')],
    hints: ['Find the ME for n = 200.', '≈ 1.96 × √(0.24/200).', '≈ 0.068.'], solution: 'No guarantee: the margin of error shrinks with n, but some uncertainty always remains.' },
  's-sd-se': { type: 'choice', ideas: ['standard-error'], prompt: 'What’s the difference between a standard deviation and a standard error?',
    options: [opt('a', 'SD describes spread of individual values; SE describes how much a statistic varies from sample to sample', true), opt('b', 'They’re the same thing', false, 'sd-se', 'SE = SD ÷ √n for a mean: much smaller.'), opt('c', 'SE is the error in measuring one rider', false, 'sd-se', 'SE is about sample statistics, not individual measurements.'), opt('d', 'SD only applies to normal data', false, 'sd-se', 'Any data have an SD.')],
    hints: ['One rider vs one sample.', 'Spread of data vs spread of estimates.', 'SE shrinks with n; SD doesn’t.'], solution: 'SD: spread of the data. SE: spread of a statistic (like p̂) across repeated samples.' },
  's-bias': { type: 'choice', ideas: ['random-sampling'], prompt: 'Survey A randomly selects from all 1,000 registrants. Survey B only asks riders in line at the jump. Which is better for estimating the whole event’s preference?',
    options: [opt('a', 'Survey A: every registrant has a chance to be chosen', true), opt('b', 'Survey B: those riders are easy to reach', false, 'biased-sample', 'Convenient isn’t representative.'), opt('c', 'Survey B: jump riders know trails best', false, 'biased-sample', 'They’re a particular group, likely to lean technical.'), opt('d', 'Either: they’re the same size', false, 'biased-sample', 'Size doesn’t fix selection bias.')],
    hints: ['Who could be chosen in each?', 'Is the jump line typical of all riders?', 'Random selection avoids systematic bias.'], solution: 'Survey A. Survey B is a convenience sample with selection bias: it underrepresents riders who aren’t at the jump line.' }
};
export function samplePractice(n) {
  const s = pick(SAMPLE_PRACTICE, n), p = s.x / s.n, e = se(p, s.n), m = moe(p, s.n);
  return tidy({
    brief: `Survey ${n + 1} (simulated): a random sample of ${s.n} riders, ${s.x} prefer flow trails.`, set: s,
    'sx-se': { type: 'number', ideas: ['standard-error', 'proportion'], answer: e, tolerance: 0.0005, label: 'SE', prompt: 'Estimated standard error (4 decimal places)?',
      traps: [{ value: p * (1 - p) / s.n, code: 'arithmetic', message: 'Square root.' }, { value: Math.sqrt(p * (1 - p)), code: 'sd-se', message: `Divide by n = ${s.n} inside the root.` }], hints: [`p̂ = ${s.x}/${s.n} = ${fmt(p, 3)}.`, `p̂(1 − p̂)/n.`, 'Square root.'], solution: `SE ≈ ${fmt(e, 4)}.` },
    'sx-int': { type: 'fields', ideas: ['moe'], prompt: 'Approximate 95% interval, as percentages (1 decimal place)?',
      fields: [{ id: 'lo', label: 'from (%)', answer: (p - m) * 100, tolerance: 0.1, traps: [{ value: (p - e) * 100, code: 'moe-meaning', message: 'Use 1.96 × SE.' }] }, { id: 'hi', label: 'to (%)', answer: (p + m) * 100, tolerance: 0.1, traps: [{ value: (p + e) * 100, code: 'moe-meaning', message: 'Use 1.96 × SE.' }] }],
      hints: ['ME = 1.96 × SE.', `≈ ${fmt(m, 3)}.`, 'p̂ ± ME.'], solution: `${fmt((p - m) * 100, 1)}% to ${fmt((p + m) * 100, 1)}%.` }
  });
}
export const SAMPLE_PRACTICE_IDS = ['sx-se', 'sx-int'];

// ================================================================ Mission 4: The Race Strategy Experiment
const E = EXPERIMENT, ET = testFor(E), DIFF = mean(E.B) - mean(E.A);
const designOpts = kind => [opt('s', 'Survey', kind === 'survey', 'survey-experiment', 'A survey asks people questions; nobody is assigned anything.'), opt('o', 'Observational study', kind === 'observational', 'survey-experiment', 'Observational: outcomes are recorded without assigning treatments.'), opt('e', 'Randomized experiment', kind === 'experiment', 'survey-experiment', 'An experiment randomly assigns treatments.')];
const M4 = {
  'e-design-1': { type: 'choice', ideas: ['study-design'], keepOrder: true, prompt: '“Which course-preview method do you prefer?” asked of 50 riders. What kind of study?', options: designOpts('survey'),
    hints: ['Was anything assigned?', 'Was anything measured besides answers?', 'Asking questions.'], solution: 'A survey.' },
  'e-design-2': { type: 'choice', ideas: ['study-design', 'claims'], keepOrder: true, prompt: 'Comparing results of riders who chose different training methods themselves. What kind of study?', options: designOpts('observational'),
    hints: ['Who chose the method?', 'The riders did.', 'No assignment: observational.'], solution: 'Observational: it can show association, not cause.' },
  'e-design-3': { type: 'choice', ideas: ['study-design', 'randomized'], keepOrder: true, prompt: '40 riders randomly assigned to the printed map or the video preview, then tested. What kind of study?', options: designOpts('experiment'),
    hints: ['Who decided the method?', 'Random assignment.', 'That’s an experiment.'], solution: 'A randomized experiment.' },
  'e-random': { type: 'choice', ideas: ['randomized'], prompt: 'Why assign the preview methods randomly?',
    options: [opt('a', 'It balances other differences (experience, memory, fitness) between the groups on average', true), opt('b', 'It makes both groups score the same', false, 'survey-experiment', 'It balances other factors; the treatment can still differ.'), opt('c', 'It’s faster than choosing', false, 'survey-experiment', 'Speed isn’t the point.'), opt('d', 'So the results are a survey', false, 'survey-experiment', 'Random assignment makes it an experiment.')],
    hints: ['What if riders chose?', 'Keener riders might pick video.', 'Randomization prevents systematic differences.'], solution: 'Random assignment spreads other factors evenly on average, so a difference can be attributed to the treatment.' },
  'e-means': { type: 'fields', ideas: ['mean', 'randomized'], prompt: 'Mean features identified (out of 12) for each group?',
    fields: [{ id: 'a', label: 'Method A (map)', answer: mean(E.A), tolerance: 0.01, traps: [{ value: median(E.A), code: 'mean-median', message: 'That’s the median.' }] }, { id: 'b', label: 'Method B (video)', answer: mean(E.B), tolerance: 0.01, traps: [{ value: median(E.B), code: 'mean-median', message: 'That’s the median.' }] }],
    hints: ['Add each group’s 20 scores.', 'A totals 148; B totals 188.', '÷ 20.'], solution: `A ${fmt(mean(E.A), 1)}, B ${fmt(mean(E.B), 1)}.` },
  'e-diff': { type: 'number', ideas: ['randomized'], answer: DIFF, tolerance: 0.01, label: 'B − A', prompt: 'Observed difference in means (B − A)?',
    traps: [{ value: -DIFF, code: 'arithmetic', message: 'B − A: video minus map.' }], hints: ['9.4 − 7.4.', 'Features.', 'Positive favours video.'], solution: '2.0 more features for the video group.' },
  'e-prove': { type: 'choice', ideas: ['significance', 'claims'], prompt: 'Does a 2-feature gap prove the video method is better?',
    options: [opt('a', 'Not by itself: random assignment alone produces some difference even if the methods are equally good', true), opt('b', 'Yes: 9.4 > 7.4', false, 'p-proof', 'Any two random groups differ a bit.'), opt('c', 'Yes: it was an experiment', false, 'p-proof', 'We still need to check whether the gap is bigger than chance.'), opt('d', 'No: experiments can never show anything', false, 'survey-experiment', 'They can, if the difference is bigger than chance would give.')],
    hints: ['Split 40 scores randomly into two groups.', 'Would the means be exactly equal?', 'How big a gap does chance give?'], solution: 'Not yet. We need to know how unusual a 2-feature gap would be if the methods made no difference.' },
  'e-null': { type: 'choice', ideas: ['significance'], prompt: 'In the shuffle test, what does the null hypothesis say?',
    options: [opt('a', 'There’s no difference between the methods, so any rider’s score would be the same in either group', true), opt('b', 'The video method is better', false, 'p-meaning', 'That’s the alternative.'), opt('c', 'Both groups scored 0', false, 'p-meaning', 'It’s about the treatments having no effect.'), opt('d', 'The data are wrong', false, 'p-meaning', 'The null is a model, not a claim about errors.')],
    hints: ['“Null” = no effect.', 'If the method doesn’t matter…', '…scores can be shuffled between groups.'], solution: 'No difference: under it, the 40 scores are exchangeable, which is why shuffling them simulates chance.' },
  'e-p': { type: 'choice', ideas: ['significance'], prompt: `Running ${E.reps.toLocaleString('en-US')} seeded shuffles, a gap of 2.0 or more (either direction) happened in about ${fmt(ET.p * 100, 2)}% of them (p ≈ ${fmt(ET.p, 4)}). What does that mean?`,
    options: [opt('a', 'If the methods made no difference, a gap this large would be rare, so there is evidence of a real difference', true), opt('b', `There is a ${fmt(ET.p * 100, 2)}% chance the methods are the same`, false, 'p-meaning', 'A p-value isn’t the probability the null is true.'), opt('c', 'The video method is proven better for every rider', false, 'p-proof', 'Evidence, not proof, and only under these conditions.'), opt('d', 'The difference is too small to matter', false, 'practical', 'That’s practical significance, a separate question.')],
    hints: ['p is computed assuming no difference.', 'How often does chance alone give ≥ 2?', `${fmt(ET.p * 100, 2)}% of shuffles.`], solution: `p ≈ ${fmt(ET.p, 4)} < 0.05: unusual under the no-difference model, so evidence of a difference in this simulated experiment.` },
  'e-practical': { type: 'choice', ideas: ['significance', 'claims'], prompt: 'Which statement is correct?',
    options: [opt('a', 'Statistically significant doesn’t automatically mean practically important', true), opt('b', 'A small p-value means a big effect', false, 'practical', 'A tiny effect can be significant with lots of data.'), opt('c', 'p < 0.05 proves the hypothesis', false, 'p-proof', 'It’s evidence, not proof.'), opt('d', 'The p-value is the chance the null is true', false, 'p-meaning', 'It’s the chance of data this extreme if the null were true.')],
    hints: ['Significance asks “is it bigger than chance?”', 'Importance asks “does it matter?”', 'Different questions.'], solution: 'Significance ≠ importance: whether 2 features matters on race day is a separate judgement.' },
  'e-conclusion': { type: 'choice', ideas: ['claims', 'randomized'], prompt: 'Can the team conclude the video preview produced higher scores in this experiment?',
    options: [opt('a', 'Yes, there’s evidence favouring video in this simulated randomized experiment, but it doesn’t guarantee the same for every rider or course', true), opt('b', 'Yes: video will make every rider faster in races', false, 'p-proof', 'The outcome was feature recognition in one experiment, not race times for everyone.'), opt('c', 'No: it was only 40 riders', false, 'certainty', 'The randomization test already accounts for chance at this size.'), opt('d', 'No: experiments can’t show cause', false, 'survey-experiment', 'Random assignment supports a causal conclusion for the experiment.')],
    hints: ['Random assignment supports cause within the experiment.', 'p ≈ 0.003.', 'But generalising needs care.'], solution: 'Evidence of a difference favouring video under these study conditions. Generalising to all riders needs how participants were chosen and more evidence.' }
};
export function designPractice(n) {
  const s = pick(DESIGN_PRACTICE, n);
  return tidy({
    brief: `Scenario ${n + 1}: ${s.text}`, set: s,
    'ex-kind': { type: 'choice', ideas: ['study-design'], keepOrder: true, prompt: 'What kind of study is this?', options: designOpts(s.kind),
      hints: ['Was a treatment assigned?', 'If so, randomly?', 'Questions only → survey.'], solution: { survey: 'A survey.', observational: 'An observational study: nothing was assigned.', experiment: 'A randomized experiment: treatments were assigned at random.' }[s.kind] },
    'ex-cause': { type: 'choice', ideas: ['claims', 'study-design'], keepOrder: true, prompt: 'Could it, on its own, support a cause-and-effect conclusion?',
      options: [opt('y', 'Yes, within the study’s conditions', s.kind === 'experiment', 'causation', s.kind === 'experiment' ? '' : 'Without random assignment, other factors could explain any difference.'), opt('n', 'No', s.kind !== 'experiment', 'causation', 'Random assignment of the treatment does support a causal conclusion.'), opt('m', 'Only if the sample is large', false, 'certainty', 'Size doesn’t replace random assignment.')],
      hints: ['Cause needs random assignment.', 'Was there any?', s.kind === 'experiment' ? 'Yes.' : 'No.'], solution: s.kind === 'experiment' ? 'Yes: randomization balances other factors.' : 'No: it can show an association at most.' }
  });
}
export const DESIGN_PRACTICE_IDS = ['ex-kind', 'ex-cause'];

// ================================================================ Extension: the podium probability challenge
const EXT = {
  'x-comb': { type: 'number', ideas: ['counting'], answer: nCr(PODIUM.n, PODIUM.r), tolerance: 0.001, label: 'C(8, 3)', prompt: 'Eight riders, a three-person relay team (no order). How many possible teams?',
    traps: [{ value: nPr(8, 3), code: 'order-matters', message: 'Order doesn’t matter for a team: divide by 3!.' }, { value: 24, code: 'arithmetic', message: 'C(8, 3) = 8!/(3!·5!).' }], hints: ['Combinations: C(n, r) = n!/(r!(n − r)!).', '8 × 7 × 6 ÷ 6.', '= 56.'], solution: '56 teams.' },
  'x-perm': { type: 'number', ideas: ['counting'], answer: nPr(PODIUM.n, PODIUM.r), tolerance: 0.001, label: 'P(8, 3)', prompt: 'Now order matters: 1st, 2nd and 3rd. How many ordered podiums?',
    traps: [{ value: nCr(8, 3), code: 'order-matters', message: 'Order matters: don’t divide by 3!.' }, { value: 512, code: 'arithmetic', message: 'No repeats: 8 × 7 × 6.' }], hints: ['8 choices for 1st.', 'Then 7, then 6.', 'Multiply.'], solution: '336 = 56 × 3!: each team can be ordered 6 ways.' },
  'x-prob': { type: 'number', ideas: ['counting', 'multiplication'], answer: 1 / nPr(8, 3), tolerance: 0.0001, label: 'Probability', prompt: 'If every ordered podium were equally likely (a uniform model, not a race prediction), what’s the chance of one particular order? (4 decimal places)',
    traps: [{ value: 1 / nCr(8, 3), code: 'order-matters', message: 'That’s one particular team in any order.' }], hints: ['One favourable outcome.', 'Out of 336.', '1 ÷ 336.'], solution: `1/336 ≈ ${fmt(1 / 336, 4)}.` }
};

// ================================================================ Final: The Final Race Intelligence Report
export const FINAL_IDS = ['fa-target', 'fa-dry', 'fa-cond', 'fa-indep', 'fa-union', 'fa-cause', 'fb-z', 'fb-pct', 'fc-se', 'fc-int', 'fc-larger', 'fd-diff', 'fd-p', 'fd-random'];
export const PASS_MARK = 12;   // of 14, right without the solution shown
export function finalSet(roundNo) {
  const S_ = pick(FINAL_SETS, roundNo - 1), t = tableOf(S_.A), z = zScore(S_.B.x, S_.B.mu, S_.B.sigma), p = S_.C.x / S_.C.n, test = testFor(S_.D);
  return { ...S_, t, z, pctl: Phi(z) * 100, p, se: se(p, S_.C.n), iv: interval(p, S_.C.n), test, diff: mean(S_.D.B) - mean(S_.D.A) };
}
export function finalQuestions(roundNo) {
  const F = finalSet(roundNo), { t, B, C } = F, indep = t.independent(0, 0), sig = F.test.p < EXPERIMENT.alpha;
  const qs = {
    set: F,
    'fa-target': { type: 'number', ideas: ['marginal', 'two-way'], answer: N(t.col(0)), tolerance: P3, label: 'P(target)', prompt: `Simulated table: Dry ${t.cells[0][0]} hit / ${t.cells[0][1]} missed; Wet ${t.cells[1][0]} hit / ${t.cells[1][1]} missed. P(hit target)?`,
      traps: [{ value: t.colTot[0], code: 'table-reading', message: `As a probability: ÷ ${t.total}.` }], hints: ['Column total ÷ grand total.', `${t.colTot[0]} hits.`, `÷ ${t.total}.`], solution: `${show(t.col(0))}.` },
    'fa-dry': { type: 'number', ideas: ['marginal'], answer: N(t.row(0)), tolerance: P3, label: 'P(dry)', prompt: 'P(dry)?',
      traps: [{ value: N(t.row(1)), code: 'table-reading', message: 'That’s wet.' }], hints: ['Row total ÷ grand total.', `${t.rowTot[0]} dry.`, `÷ ${t.total}.`], solution: `${show(t.row(0))}.` },
    'fa-cond': { type: 'fields', ideas: ['conditional', 'conditional-rf'], prompt: 'P(hit | dry) and P(hit | wet)?',
      fields: [{ id: 'd', label: 'P(hit | dry)', answer: N(t.colGivenRow(0, 0)), tolerance: P3, traps: [{ value: N(t.joint(0, 0)), code: 'conditional-unconditional', message: 'Divide by the dry total.' }, { value: N(t.rowGivenCol(0, 0)), code: 'denominator', message: 'That’s P(dry | hit).' }] },
        { id: 'w', label: 'P(hit | wet)', answer: N(t.colGivenRow(0, 1)), tolerance: P3, traps: [{ value: N(t.joint(0, 1)), code: 'conditional-unconditional', message: 'Divide by the wet total.' }, { value: N(t.rowGivenCol(1, 0)), code: 'denominator', message: 'That’s P(wet | hit).' }] }],
      hints: ['Restrict to a row.', 'Hits ÷ row total.', 'Two answers.'], solution: `${show(t.colGivenRow(0, 0))} and ${show(t.colGivenRow(0, 1))}.` },
    'fa-indep': { type: 'choice', ideas: ['independent', 'dependent'], keepOrder: true, prompt: 'Are hitting the target and a dry course independent in this table?',
      options: [opt('y', 'Yes: P(hit | dry) = P(hit)', indep, 'independent-exclusive', 'They differ, so the events aren’t independent.'), opt('n', 'No: P(hit | dry) ≠ P(hit)', !indep, 'independent-exclusive', 'They’re equal, so the events are independent.'), opt('m', 'No: they’re mutually exclusive', false, 'independent-exclusive', `${t.cells[0][0]} attempts were both.`)],
      hints: ['Compare P(hit | dry) and P(hit).', 'Equal → independent.', 'Mutually exclusive is a different idea.'], solution: indep ? `Independent: ${show(t.colGivenRow(0, 0))} = ${show(t.col(0))}.` : `Not independent: ${show(t.colGivenRow(0, 0))} ≠ ${show(t.col(0))}.` },
    'fa-union': { type: 'number', ideas: ['addition'], answer: N(t.union(0, 0)), tolerance: P3, label: 'P(hit or dry)', prompt: 'P(hit or dry)?',
      traps: [{ value: N(t.col(0).add(t.row(0))), code: 'forgot-intersection', message: 'Subtract the overlap.' }], hints: ['P(A) + P(B) − P(A and B).', `${t.colTot[0]} + ${t.rowTot[0]} − ${t.cells[0][0]}.`, `÷ ${t.total}.`], solution: `${show(t.union(0, 0))}.` },
    'fa-cause': { type: 'choice', ideas: ['claims'], prompt: 'A teammate says “the dry course caused better times.” What’s the best response?',
      options: [opt('a', 'These are observational data: other factors could explain any association, so they don’t establish cause', true), opt('b', 'Agree: the table proves it', false, 'causation', 'Observational data can’t prove cause.'), opt('c', 'Agree, if P(hit | dry) is above 0.5', false, 'causation', 'A high probability still isn’t a cause.'), opt('d', 'Disagree: dry and hit are mutually exclusive', false, 'independent-exclusive', 'They overlap.')],
      hints: ['Was the condition assigned?', 'No: it just happened.', 'Association ≠ causation.'], solution: 'Association isn’t causation; only a randomized experiment could support a causal claim.' },
    'fb-z': { type: 'number', ideas: ['z-score'], answer: F.z, tolerance: 0.001, label: 'z', prompt: `Model T ~ N(${B.mu}, ${B.sigma}). A rider’s time: ${B.x} s. z-score?`,
      traps: [{ value: -F.z, code: 'z-direction', message: 'x − μ.' }, { value: B.x - B.mu, code: 'z-calc', message: `Divide by ${B.sigma}.` }], hints: ['(x − μ)/σ.', `(${B.x} − ${B.mu}) ÷ ${B.sigma}.`, 'Keep the sign.'], solution: `z = ${fmt(F.z, 2)}: ${F.z < 0 ? 'faster' : 'slower'} than the mean.` },
    'fb-pct': { type: 'fields', ideas: ['percentile'], prompt: 'Time percentile, and the percent of modelled riders with slower times (1 decimal place)?',
      fields: [{ id: 'p', label: 'Percentile (%)', answer: F.pctl, tolerance: 0.1, traps: [{ value: 100 - F.pctl, code: 'percentile-rank', message: 'Percentile = share at or below.' }] }, { id: 's', label: 'Slower (%)', answer: 100 - F.pctl, tolerance: 0.1, traps: [{ value: F.pctl, code: 'percentile-rank', message: 'Slower = longer times = above.' }] }],
      hints: [`Φ(${fmt(F.z, 2)}).`, '× 100.', 'Slower = 100 − percentile.'], solution: `≈ ${fmt(F.pctl, 1)}th percentile; ≈ ${fmt(100 - F.pctl, 1)}% slower.` },
    'fc-se': { type: 'number', ideas: ['standard-error', 'proportion'], answer: F.se, tolerance: 0.0005, label: 'SE', prompt: `A random sample of ${C.n} riders: ${C.x} prefer flow. Estimated standard error (4 decimal places)?`,
      traps: [{ value: Math.sqrt(F.p * (1 - F.p)), code: 'sd-se', message: `Divide by n = ${C.n} inside the root.` }], hints: [`p̂ = ${fmt(F.p, 3)}.`, 'p̂(1 − p̂)/n.', 'Square root.'], solution: `SE ≈ ${fmt(F.se, 4)}.` },
    'fc-int': { type: 'fields', ideas: ['moe', 'proportion'], prompt: 'Approximate 95% interval as percentages (1 decimal place)?',
      fields: [{ id: 'lo', label: 'from (%)', answer: F.iv[0] * 100, tolerance: 0.1, traps: [{ value: (F.p - F.se) * 100, code: 'moe-meaning', message: 'ME = 1.96 × SE.' }] }, { id: 'hi', label: 'to (%)', answer: F.iv[1] * 100, tolerance: 0.1, traps: [{ value: (F.p + F.se) * 100, code: 'moe-meaning', message: 'ME = 1.96 × SE.' }] }],
      hints: ['ME = 1.96 × SE.', 'p̂ ± ME.', 'As percentages.'], solution: `${fmt(F.iv[0] * 100, 1)}% to ${fmt(F.iv[1] * 100, 1)}%.` },
    'fc-larger': { type: 'choice', ideas: ['moe', 'sampling-dist'], prompt: 'How would a random sample four times as large change the estimate?',
      options: [opt('a', 'The margin of error would be about half as big: a more precise estimate', true), opt('b', 'A quarter as big', false, 'sd-se', 'ME ∝ 1/√n.'), opt('c', 'The estimate would become exact', false, 'certainty', 'Uncertainty shrinks but never vanishes.'), opt('d', 'No change', false, 'certainty', 'Bigger samples reduce sampling variability.')],
      hints: ['ME ∝ 1/√n.', '√4 = 2.', 'Half.'], solution: 'About half the margin of error: more precise, still not certain.' },
    'fd-diff': { type: 'number', ideas: ['randomized', 'mean'], answer: F.diff, tolerance: 0.01, label: 'B − A', prompt: `A randomized preview experiment (simulated): Method A (map) ${F.D.A.join(', ')}. Method B (video) ${F.D.B.join(', ')}. Observed difference in means, B − A?`,
      traps: [{ value: -F.diff, code: 'arithmetic', message: 'B − A.' }], hints: ['Mean of each group of 20.', `${fmt(mean(F.D.A), 2)} and ${fmt(mean(F.D.B), 2)}.`, 'Subtract.'], solution: `${fmt(F.diff, 2)} features.` },
    'fd-p': { type: 'choice', ideas: ['significance', 'claims'], keepOrder: true, prompt: `${EXPERIMENT.reps.toLocaleString('en-US')} seeded shuffles give a two-sided p ≈ ${fmt(F.test.p, 4)}. Using α = 0.05, what’s the conclusion?`,
      options: [opt('a', 'Evidence of a difference between the methods in this experiment', sig, 'p-meaning', `p ≈ ${fmt(F.test.p, 3)} is above 0.05: a gap this size happens often by chance.`), opt('b', 'Not enough evidence of a difference: chance alone often gives a gap this large', !sig, 'p-proof', `p ≈ ${fmt(F.test.p, 4)} is below 0.05: a gap this size is rare by chance.`), opt('c', 'Proof the video method is better for every rider', false, 'p-proof', 'A p-value is never proof, and the experiment is one setting.'), opt('d', `A ${fmt(F.test.p * 100, 1)}% chance the methods are the same`, false, 'p-meaning', 'A p-value isn’t the probability the null is true.')],
      hints: ['Compare p with 0.05.', 'Small p: rare under no difference.', 'Large p: chance explains it.'], solution: sig ? `p ≈ ${fmt(F.test.p, 4)} < 0.05: evidence of a difference favouring ${F.diff > 0 ? 'video' : 'the map'} under these conditions.` : `p ≈ ${fmt(F.test.p, 3)} ≥ 0.05: a gap of ${fmt(Math.abs(F.diff), 2)} is consistent with chance. That’s not proof of “no difference”, just not enough evidence.` },
    'fd-random': { type: 'choice', ideas: ['randomized'], prompt: 'Why does random assignment matter for interpreting this result?',
      options: [opt('a', 'It balances other rider differences on average, so a real difference can be attributed to the method', true), opt('b', 'It guarantees a significant result', false, 'p-proof', 'Randomization doesn’t decide the outcome.'), opt('c', 'It makes the sample represent all riders', false, 'sample-population', 'That’s random sampling; this is random assignment.'), opt('d', 'It isn’t needed in experiments', false, 'survey-experiment', 'It’s what lets us shuffle and compare.')],
      hints: ['What could differ between groups?', 'Randomization spreads it out.', 'It also justifies the shuffle test.'], solution: 'It balances other factors (and justifies the shuffle test), supporting a causal conclusion for this experiment.' }
  };
  return arrange(tidy(qs));
}

// ================================================================ missions
export const QUESTIONS = arrange(tidy({ ...M1, ...M2, ...M3, ...M4, ...EXT }));
export const MISSIONS = [
  { id: 'race', n: 1, title: 'Race-day probability', short: 'Race-Day Probability', minutes: '6–7', focus: 'Sample spaces · addition rule · conditional probability · independence · two-way tables',
    blurb: 'Are riders more likely to hit their target split on a dry course? What does the table actually say?', graded: Object.keys(M1) },
  { id: 'fast', n: 2, title: 'Who’s actually fast?', short: 'Who’s Actually Fast?', minutes: '6–7', focus: 'Mean, median, spread · the normal model · empirical rule · z-scores · percentiles',
    blurb: 'Two crews with the same average. Which is consistent, and how do individual times compare?', graded: Object.keys(M2) },
  { id: 'sample', n: 3, title: 'The rider sample lab', short: 'Rider Sample Lab', minutes: '6–7', focus: 'Populations and samples · sampling distributions · standard error · margin of error · bias',
    blurb: 'What can 100 surveyed riders tell you about all 1,000 at the festival?', graded: Object.keys(M3) },
  { id: 'experiment', n: 4, title: 'The race strategy experiment', short: 'Strategy Experiment', minutes: '6–7', focus: 'Study design · random assignment · randomization test · significance',
    blurb: 'Does a video preview help riders remember the course, or is the gap just chance?', graded: Object.keys(M4) }
];
export function questionKinds() {
  const out = {};
  for (const [id, q] of Object.entries(QUESTIONS)) out[id] = q.ideas;
  const gen = [[RACE_PRACTICE, racePractice, RACE_PRACTICE_IDS], [Z_PRACTICE, zPractice, Z_PRACTICE_IDS], [SAMPLE_PRACTICE, samplePractice, SAMPLE_PRACTICE_IDS], [DESIGN_PRACTICE, designPractice, DESIGN_PRACTICE_IDS]];
  for (const [list, fn, ids] of gen) for (let n = 0; n < list.length; n++) { const P_ = fn(n); for (const id of ids) out[id] = [...new Set([...(out[id] || []), ...P_[id].ideas])]; }
  const F = finalQuestions(1); for (const id of FINAL_IDS) out[id] = F[id].ideas;
  return out;
}
export { fmt, pct, show };
