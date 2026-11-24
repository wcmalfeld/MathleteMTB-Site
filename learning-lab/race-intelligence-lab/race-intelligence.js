// The Enduro Race Intelligence Lab (Mathlete MTB, Algebra 2, Unit 9:
// Probability and Statistics). The module's public entry point.
//
//   import { mount } from './race-intelligence.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: raceintelligence:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its four mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS,
  racePractice, zPractice, samplePractice, designPractice, RACE_PRACTICE_IDS, Z_PRACTICE_IDS, SAMPLE_PRACTICE_IDS, DESIGN_PRACTICE_IDS } from './logic/questions.js';
import { RACE, ALPHA, BRAVO, EXPERIMENT, RACE_PRACTICE, Z_PRACTICE, SAMPLE_PRACTICE, DESIGN_PRACTICE, FINAL_SETS } from './logic/models.js';
import { outcomeExplorer, conditionalFilter, cardSim, consistencyAnalyzer, bellCurve, percentileCalc, surveySim, samplingDist, moeExplorer, biasDemo, experimentView, shuffleSim, podiumCounter } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'race-intelligence-lab';
const DISCLAIMER = 'All data in this lab are simulated for teaching: they aren’t real race results, and nothing here is a safety recommendation about riding, weather, equipment or trail conditions. Associations in observational data are not proof of causation.';
const REFS = [
  ['Common Core: Conditional Probability and the Rules of Probability (HSS-CP)', 'https://www.thecorestandards.org/Math/Content/HSS/CP/'],
  ['Common Core: Making Inferences and Justifying Conclusions (HSS-IC)', 'https://www.thecorestandards.org/Math/Content/HSS/IC/'],
  ['Common Core: Interpreting Categorical and Quantitative Data (HSS-ID)', 'https://www.thecorestandards.org/Math/Content/HSS/ID/'],
  ['OpenStax: The standard normal distribution', 'https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution'],
  ['OpenStax: A population proportion', 'https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion'],
  ['OpenStax: Measures of the spread of the data', 'https://openstax.org/books/introductory-statistics/pages/2-7-measures-of-the-spread-of-the-data'],
  ['Fishtank Learning: Algebra 2 probability and statistical inference', 'https://www.fishtanklearning.org/curriculum/math/algebra-2/probability-and-statistical-inference/'],
  ['Canadian Enduro League: series information (race format context)', 'https://canadianenduro.com/seriesinfo']
];
const terms = pairs => el('dl', { class: 'ri-terms' }, pairs.map(([a, b]) => el('div', null, el('dt', null, a), el('dd', null, b))));

function racePage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The data', '200 simulated stage attempts',
      P_('Each attempt is classified by course condition and whether the rider hit their target split time.'),
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('caption', null, 'Simulated data'), el('thead', null, el('tr', null, ['Course', ...RACE.cols, 'Total'].map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', null, RACE.rows.map((r, i) => el('tr', null, el('th', { scope: 'row' }, r), RACE.cells[i].map(c => el('td', { class: 'ms-mono' }, String(c))), el('td', { class: 'ms-mono' }, String(RACE.cells[i][0] + RACE.cells[i][1])))),
          el('tr', null, el('th', { scope: 'row' }, 'Total'), el('td', { class: 'ms-mono' }, '124'), el('td', { class: 'ms-mono' }, '76'), el('td', { class: 'ms-mono' }, '200'))))),
      note('key', 'simulated, observational data', DISCLAIMER)),
    card('Module A', 'Sample spaces',
      terms([['Sample space', 'every possible outcome: here, the 200 attempts'], ['Event A', 'the rider hit their target time'], ['Event B', 'the course was dry']]),
      q('r-space'), q('r-and'), q('r-or'), q('r-not'), q('r-joint'),
      sim('Race outcome explorer', outcomeExplorer(ctx))),
    card('Module B', 'Mutually exclusive events',
      P_('Mutually exclusive events can’t happen at the same time. An attempt is classified as dry or wet, never both: P(Dry and Wet) = 0 and P(Dry or Wet) = 1.'),
      q('r-mutex'), q('r-wet')),
    card('Module C', 'Events that overlap',
      eq('P(A or B) = P(A) + P(B) − P(A and B)'),
      P_('A and B can happen together (84 dry attempts hit their target), so adding P(A) and P(B) counts that overlap twice.'),
      q('r-union')),
    card('Module D', 'Conditional probability',
      eq('P(A | B) = P(A and B) ÷ P(B)'),
      P_('The condition after the bar restricts the sample space: “given dry” means only the 120 dry attempts count.'),
      q('r-cond-dry'), q('r-cond-wet'),
      sim('Conditional probability filter', conditionalFilter(ctx))),
    card('Module E', 'Independence',
      eq('Independent ⇔ P(A | B) = P(A) ⇔ P(A and B) = P(A)·P(B)'),
      q('r-indep'), q('r-product'), q('r-cause'),
      h3('An independence experiment'),
      P_('Two separate decks: three trail-feature cards and two condition cards. Drawing from one can’t affect the other.'),
      q('r-cards'),
      sim('Independent card draws', cardSim(ctx))),
    card('Independent challenge', 'Another data set', practiceBox())
  ];
}

function fastPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The data', 'Two crews, ten simulated runs each',
      el('div', { class: 'ri-data' }, el('p', { class: 'ms-mono' }, el('b', null, 'Crew Alpha: '), ALPHA.join(', '), ' s'), el('p', { class: 'ms-mono' }, el('b', null, 'Crew Bravo: '), BRAVO.join(', '), ' s')),
      P_('Treat each crew’s ten runs as its complete data set.'),
      q('f-center'),
      P_('Same mean, same median. But that doesn’t mean they’re equally consistent.')),
    card('Module B', 'Measures of spread',
      terms([['Range', 'max − min'], ['Interquartile range', 'Q3 − Q1: the spread of the middle half'], ['Standard deviation σ', '√(average squared distance from the mean)']]),
      q('f-range'), q('f-sd'), q('f-consistent'), q('f-sd-meaning'),
      sim('Rider consistency analyzer', consistencyAnalyzer(ctx)),
      q('f-outlier')),
    card('Module C', 'The normal distribution',
      P_('Many measurements are roughly bell-shaped, but not all. For one controlled stage, the team uses a hypothetical model:'),
      eq('T ~ N(180, 12)', [['180 s', 'the mean μ'], ['12 s', 'the standard deviation σ']]),
      q('f-normal-ok'), q('f-68'), q('f-95'),
      sim('Race performance bell curve', bellCurve(ctx))),
    card('Module D', 'Z-scores and percentiles',
      eq('z = (x − μ) ÷ σ', [['z', 'how many SDs a time is above (+) or below (−) the mean']]),
      q('f-z'), q('f-pct'),
      note('myth', 'percentile isn’t ranking', 'A time percentile counts times at or below. For race times, a low percentile is a fast result; a high one is slow.'),
      sim('Rider performance percentile calculator', percentileCalc(ctx)),
      h3('Independent challenge'), q('f-challenge'), q('f-challenge-meaning'),
      h3('More models'), practiceBox())
  ];
}

function samplePage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Module A', 'Population versus sample',
      P_('The Pine Ridge Enduro Festival has 1,000 registered riders. Which do they prefer, flow or technical trails? Surveying everyone would take too long.'),
      note('key', 'a simulated population', 'The simulator holds 1,000 virtual riders with a hidden true split. You’ll estimate it before you see it.'),
      q('s-pop')),
    card('Module B', 'A random sample',
      q('s-phat'), q('s-exact'),
      sim('Rider survey simulator', surveySim(ctx))),
    card('Module C', 'Sampling distributions',
      P_('Take many random samples of the same size and record each p̂. Those values form a sampling distribution. Its spread is the standard error.'),
      eq('SE = √(p(1 − p) ÷ n)'),
      q('s-se25'), q('s-se100'), q('s-halve'),
      sim('Sampling distribution', samplingDist(ctx))),
    card('Module D', 'Standard error and margin of error',
      eq('SE ≈ √(p̂(1 − p̂) ÷ n),   ME ≈ 1.96 × SE'),
      q('s-se'), q('s-me'), q('s-interval'), q('s-larger'), q('s-certain'), q('s-sd-se'),
      sim('Margin of error explorer', moeExplorer(ctx))),
    card('Module E', 'Sampling bias',
      terms([['Random sampling', 'every member has a known chance of selection'], ['Convenience sampling', 'whoever is easy to reach'], ['Selection bias', 'some groups systematically over- or underrepresented']]),
      q('s-bias'),
      sim('Random vs convenience survey', biasDemo(ctx))),
    card('Independent challenge', 'More surveys', practiceBox())
  ];
}

function experimentPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The question', 'Map or video?',
      P_('Does an annotated video preview help riders remember more trail features than a printed map? 40 riders are randomly assigned, 20 to each method, given the same study time, then asked to mark 12 features on a blank map.'),
      note('key', 'a fictional experiment', 'Simulated scores in a controlled teaching experiment. It makes no claim about real race performance.')),
    card('Module A', 'Study design',
      terms([['Survey', 'ask people questions'], ['Observational study', 'record outcomes without assigning treatments'], ['Randomized experiment', 'assign treatments at random, then compare']]),
      q('e-design-1'), q('e-design-2'), q('e-design-3'), q('e-random')),
    card('Module B', 'Compare the groups',
      q('e-means'), q('e-diff'),
      sim('Treatment comparison', experimentView()),
      q('e-prove')),
    card('Module C', 'A randomization test',
      q('e-null'),
      sim('Treatment shuffle simulator', shuffleSim(ctx)),
      q('e-p')),
    card('Module D', 'Interpret significance',
      el('ul', { class: 'ri-points' }, el('li', null, 'A p-value is not the probability the null hypothesis is true.'), el('li', null, 'Statistical significance doesn’t automatically mean practical importance.'),
        el('li', null, 'Random assignment supports a causal conclusion for the experiment, under its conditions.'), el('li', null, 'Generalising to all riders needs a suitable way of choosing participants, and more evidence.')),
      q('e-practical'), q('e-conclusion')),
    card('Independent challenge', 'Classify the study', practiceBox())
  ];
}

const HOOKS = {
  race: 'Your team has 200 simulated enduro stage attempts, organised by course condition and whether the rider hit their target split. What does the data tell you, and what doesn’t it?',
  fast: 'Two crews appear to have the same average time. One might be much more consistent. Analyse the distributions and see what the numbers really say.',
  sample: 'Which trail type do the festival’s 1,000 riders prefer? Survey a random sample, and work out how far to trust the estimate.',
  experiment: 'The team wants to know whether a video preview helps riders learn a new course. Rather than guess, you run an experiment.'
};
const PAGES = { race: racePage, fast: fastPage, sample: samplePage, experiment: experimentPage };
const practiceFor = {
  race: { ids: RACE_PRACTICE_IDS, count: RACE_PRACTICE.length, questions: racePractice, button: 'New data set', note: 'Simulated tables; one is independent.' },
  fast: { ids: Z_PRACTICE_IDS, count: Z_PRACTICE.length, questions: zPractice, button: 'New model', note: 'Different stages, means and SDs.' },
  sample: { ids: SAMPLE_PRACTICE_IDS, count: SAMPLE_PRACTICE.length, questions: samplePractice, button: 'New survey', note: 'Different sample sizes and results.' },
  experiment: { ids: DESIGN_PRACTICE_IDS, count: DESIGN_PRACTICE.length, questions: designPractice, button: 'New scenario', note: 'Surveys, observational studies and experiments.' }
};

export const LAB = {
  id: ID, title: 'Enduro Race Intelligence Lab', eventPrefix: 'raceintelligence', rootClass: 'ril', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 9: Probability and Statistics',
    lines: ['The Enduro Race', 'Intelligence'], accent: 'Lab',
    lede: 'You’ve joined the performance analytics crew for an enduro team. How likely is a rider to hit their target? How consistent is the team? What can a sample tell you about a whole event? And does a strategy actually work?',
    body: 'Investigate the numbers and make the call. Don’t just look at the numbers: understand what they tell you, what they don’t, and how confident you can be.',
    enter: 'Enter the analytics lab →', back: 'Back to the lab →',
    meta: '30–35 minutes · four missions and a final race intelligence report · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Mission stations', hook: 'Four stations: race-day probability, rider performance, sampling, and an experiment. Finish all four to unlock the Final Race Intelligence Report.',
    refsNote: DISCLAIMER,
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: {
    kicker: 'Optional extension · the podium probability challenge', title: 'Who’s making the podium?',
    blurb: 'Combinations vs permutations, and the chance of one particular team or podium.',
    hook: 'A fictional team has eight riders for a three-person relay. How many teams, and how many podium orders?',
    page: ctx => { const { q, card, eq, sim, note } = ctx; return [
      card(null, null, eq('C(n, r) = n! ÷ (r!(n − r)!)      P(n, r) = n! ÷ (n − r)!'),
        q('x-comb'), q('x-perm'), q('x-prob'),
        note('key', 'equal likelihood', 'A uniform selection model where every outcome is equally likely: not a prediction of real race results.'),
        sim('Podium counter', podiumCounter(ctx)))
    ]; }
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Race Intelligence Report', blurb: 'Race probability, rider performance, a population estimate and an experiment, on your own.',
    hook: 'You’ve analysed race conditions, rider performance, event preferences and experimental results. Now prepare a report that uses evidence to support your recommendations.',
    lockedHook: 'Finish all four missions to unlock the Final Race Intelligence Report.',
    doneShort: 'Chief race analyst', doneTitle: 'Chief race analyst',
    doneLede: 'You analysed the probabilities behind race outcomes, compared rider performance, estimated population preferences and evaluated an experiment: statistics for informed decisions instead of guesses.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with new data.`,
    page: ({ q, card, para: P_ }, F, key) => [
      card('Challenge A', 'Race probability', P_('Simulated, observational data.'), ['fa-target', 'fa-dry', 'fa-cond', 'fa-indep', 'fa-union', 'fa-cause'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Rider performance', ['fb-z', 'fb-pct'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
      card('Challenge C', 'Estimate the event population', ['fc-se', 'fc-int', 'fc-larger'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' }))),
      card('Challenge D', 'Interpret the experiment', ['fd-diff', 'fd-p', 'fd-random'].map(id => q(id, { def: F[id], key, kicker: 'Challenge D' })))
    ]
  },
  report: { kicker: 'Lab report' },
  summaryExtra: P => ({ independent: ['rx-cond', 'zx-pct', 'sx-int', 'ex-kind', 'f-challenge', 'fa-cond', 'fb-pct', 'fc-int', 'fd-p'].filter(id => P.earned(id)).length, shuffles: P.getData('shuffles', 0) }),
  stats: s => [['Independent solutions', String(s.independent)], ['Randomization shuffles run', Number(s.shuffles || 0).toLocaleString('en-US')]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.RaceIntelligenceLab = { mount, VERSION };
