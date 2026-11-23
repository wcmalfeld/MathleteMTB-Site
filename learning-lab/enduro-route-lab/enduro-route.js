// The Enduro Route Intelligence Lab (Mathlete MTB, Algebra 2, Unit 6:
// Rational and Radical Functions). The module's public entry point.
//
//   import { mount } from './enduro-route.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: enduroroute:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its four mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS,
  clockPractice, splitPractice, surveyPractice, expPractice, CLOCK_PRACTICE_IDS, SPLIT_PRACTICE_IDS, SURVEY_PRACTICE_IDS, EXP_PRACTICE_IDS } from './logic/questions.js';
import { CLOCK, CLOCK_PRACTICE, SPLIT_PRACTICE, SURVEY_PRACTICE, EXP_PRACTICE, FINAL_SETS } from './logic/models.js';
import { raceClock, asymptoteExplorer, splitSim, graphAnalyzer, workbench, holeFinder, targetFinder, surveySim, radicalSolver, wheelExplorer, profileStudio, diagnostic, rootCompare } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'enduro-route-lab';
const DISCLAIMER = 'Every model here is a fictional educational exercise: one representative average speed per section, a made-up speed difference, an idealised survey and an idealised circular wheel. It is not race-pacing, trail-construction or bike-fit advice.';
const REFS = [
  ['Common Core: Arithmetic with Polynomials and Rational Expressions (HSA-APR.D.6–7)', 'https://www.thecorestandards.org/Math/Content/HSA/APR/'],
  ['Common Core: Interpreting Functions (HSF-IF.B.5, C.7b, C.7d)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['OpenStax: Rational functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/5-6-rational-functions'],
  ['OpenStax: Use radicals in functions', 'https://openstax.org/books/intermediate-algebra-2e/pages/8-7-use-radicals-in-functions'],
  ['OpenStax: Solve equations with square roots', 'https://openstax.org/books/elementary-algebra/pages/9-6-solve-equations-with-square-roots'],
  ['Fishtank Learning: Algebra 2 rational and radical functions', 'https://www.fishtanklearning.org/curriculum/math/algebra-2/rational-and-radical-functions/'],
  ['IMBA: Mountain bike trail development guidelines', 'https://fpr.vermont.gov/sites/fpr/files/doc_library/IMBA-MTB-Trail-Development-Guidelines-for-successfully-managing-the-process.pdf'],
  ['IMBA: Trail Solutions', 'https://www.imba.com/sites/default/files/resource_1/IMBA_Trail%20Solutions%20Book.pdf']
];
const table = (head, rows) => el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, head.map(h => el('th', { scope: 'col' }, h)))),
  el('tbody', null, rows.map(r => el('tr', null, el('th', { scope: 'row' }, r[0]), r.slice(1).map(c => el('td', { class: 'ms-mono' }, c)))))));

function clockPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Module A', 'Discover inverse variation',
      q('c-predict'),
      eq('Time = Distance ÷ Speed'),
      eq('T(v) = 8 + (6/v) × 60 = 8 + 360/v', [['v', 'average riding speed on the 6 km timed stage (km/h)'], ['T(v)', 'total elapsed time (min)'], ['8', 'the fixed neutralised transition (min)']]),
      q('c-units'), q('c-t18'),
      table(['Average speed', 'Stage time 360/v', 'Total elapsed'], CLOCK.table.map(v => [`${v} km/h`, `${360 / v} min`, `${8 + 360 / v} min`])),
      P_('As speed increases, the time to cover a fixed distance decreases. The riding part t(v) = 360/v is inversely proportional to speed.'),
      sim('Race clock simulator', raceClock(ctx)),
      q('c-double'),
      note('key', 'an idealised timing model', 'One representative average speed for the whole timed stage. Real stages have climbs, descents and stops.')),
    card('Module B', 'Domain and range',
      P_('The domain is the possible inputs; the range is the possible outputs.'),
      q('c-zero'), q('c-domain'), q('c-range')),
    card('Module C', 'Asymptotes',
      q('c-vertical'), q('c-horizontal'),
      eq('T(v) = t₀ + 60D/v', [['D', 'route distance (km)'], ['t₀', 'fixed transition time (min)']]),
      sim('Asymptote explorer', asymptoteExplorer(ctx)),
      q('c-shift'), q('c-stretch')),
    card('Independent challenge', 'Beat 26 minutes',
      q('c-solve'), q('c-reasonable'),
      explain('Worked solution', ['26 = 8 + 360/v', '18 = 360/v   (subtract 8)', '18v = 360', 'v = 20 km/h'], 'Positive, so in the domain, and T(20) = 8 + 18 = 26 checks.'),
      h3('More stages'), practiceBox())
  ];
}

function consolePage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The model', 'Two sections, two speeds',
      el('dl', { class: 'er-terms' },
        el('div', null, el('dt', null, 'Flow section'), el('dd', null, '2 km at v km/h: F(v) = 120/v min')),
        el('div', null, el('dt', null, 'Technical section'), el('dd', null, '1 km at v − 5 km/h: S(v) = 60/(v − 5) min')),
        el('div', null, el('dt', null, 'Transition'), el('dd', null, '8 min, fixed'))),
      eq('T(v) = 8 + 120/v + 60/(v − 5)'),
      note('key', 'a fictional assumption', 'The 5 km/h difference is a modelling assumption for practice, not a rule about how trail difficulty affects speed.'),
      q('s-flow'), q('s-tech'), q('s-total'), q('s-domain'),
      sim('Split-time simulator', splitSim(ctx))),
    card('Module B', 'Add rational expressions',
      q('s-lcd'), q('s-combine'), q('s-simplified'),
      explain('Every step', ['120/v + 60/(v − 5)', '= [120(v − 5) + 60v]/[v(v − 5)]', '= (180v − 600)/[v(v − 5)]', '8 + that = [8v(v − 5) + 180v − 600]/[v(v − 5)]', '= (8v² + 140v − 600)/(v² − 5v)'], 'Two forms, one function: both give 22 at v = 15.')),
    card('Module C', 'Domain restrictions and asymptotes',
      q('s-restrict'), q('s-vertical'), q('s-horizontal'), q('s-context'),
      sim('Rational graph analyzer', graphAnalyzer(ctx))),
    card('Module D', 'Subtract, multiply and divide',
      h3('Subtraction: compare the two section times'), q('s-sub'), q('s-sub15'), q('s-sub-why'),
      h3('Multiplication: adjust a time estimate'), eq('P(v) = 60/v,   R(v) = v/(v − 5)', [['P(v)', 'minutes per km at the flow speed'], ['R(v)', 'ratio of flow speed to technical speed']]), q('s-mul'), q('s-mul-meaning'),
      h3('Division: how many times as long?'), q('s-div'), q('s-div15'),
      note('key', 'different lengths', 'The technical section is slower but only half as long, so it takes 75% as long as the flow section at 15 km/h.'),
      sim('Rational expression workbench', workbench(ctx))),
    card('Module E', 'The missing GPS reading',
      eq('C(v) = (v² − 25)/(v − 5)'),
      note('key', 'a calibration example', 'A mathematical data-calibration diagnostic, not a physical bike performance relationship.'),
      q('s-hole-simplify'), q('s-hole'), q('s-hole-vs'),
      sim('Find the missing point', holeFinder(ctx))),
    card('Module F', 'Solve a rational equation',
      eq('8 + 120/v + 60/(v − 5) = 22'),
      q('s-eq'), q('s-roots'), q('s-reject'),
      sim('Target time finder', targetFinder(ctx))),
    card('Independent challenge', 'A new two-section course',
      P_('New distances and a new speed difference: build the model, clear the fractions, solve, and check the restriction.'),
      practiceBox())
  ];
}

function surveyPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Module A', 'Build a radical function',
      eq('a² + b² = c²', [['a', 'horizontal run'], ['b', 'vertical elevation difference'], ['c', 'straight-line distance']]),
      note('key', 'straight-line, not trail length', 'This is the direct distance between two survey points, not the length of a winding trail. A fictional survey exercise, not a trail-construction recommendation.'),
      q('u-pyth'), q('u-model'), q('u-domain'), q('u-range'),
      sim('Trail survey simulator', surveySim(ctx)),
      q('u-symmetric')),
    card('Module B', 'Evaluate and interpret',
      P_('The survey team records an elevation change of 16 m.'),
      eq('D(16) = √(14400 + 16²) = √14656'),
      q('u-exact'), q('u-approx'),
      h3('Trail grade'), eq('Grade = elevation change ÷ horizontal run × 100'),
      q('u-grade'),
      P_('Grade describes steepness; the radical function gives distance. They answer different questions.')),
    card('Module C', 'Solve a radical equation',
      P_('A direct measurement of 122 m, with the 120 m run. What was the elevation difference?'),
      q('u-solve'), q('u-both')),
    card('Module D', 'Verify a radical equation',
      P_('The survey console warns: “the diagonal distance is two meters shorter than the horizontal run.”'),
      eq('√(r² + 16) = r − 2', [['r', 'horizontal run (m)']]),
      q('u-warning'), q('u-check'), q('u-why'),
      sim('Radical equation solver', radicalSolver(ctx))),
    card('Independent challenge', 'More survey segments', practiceBox())
  ];
}

function wheelPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The model', 'A wheel as a function',
      eq('x² + y² = R²   →   W(x) = √(0.36² − x²)', [['R = 0.36 m', 'an illustrative wheel radius, hub at the origin'], ['x', 'horizontal offset from the hub (m)'], ['W(x)', 'height above the hub (m), upper half only']]),
      note('key', 'an idealised circle', 'The wheel is modelled as a perfect circle; W gives the upper semicircle, not the whole circumference.')),
    card('Module A', 'Understand the radical graph',
      q('w-radicand'), q('w-domain'), q('w-range'), q('w-at'),
      sim('Wheel geometry explorer', wheelExplorer(ctx))),
    card('Module B', 'Solve a radical equation',
      P_('At what offsets is the upper wheel outline 0.30 m above the hub? Use the explorer’s height mode to check.'),
      q('w-height'), q('w-two')),
    card('Module C', 'Radical transformations',
      eq('g(x) = a√(x − h) + k', [['h', 'horizontal shift'], ['k', 'vertical shift'], ['a', 'vertical stretch or compression; negative a reflects']]),
      q('w-start'), q('w-stretch'), q('w-domain-g'), q('w-reflect'),
      sim('Radical profile studio', profileStudio(ctx)),
      eq('W(x) = k + √(R² − (x − h)²)'),
      q('w-wheel-move')),
    card('Module D', 'Rational exponents',
      eq('x^(1/2) = √x,   x^(1/3) = ∛x,   x^(1/4) = ∜x,   x^(p/q) = (q-th root of x)^p'),
      q('w-exp-wheel'), q('w-exp-eval'),
      h3('Conversion practice'), practiceBox()),
    card('Optional', 'Cube roots',
      eq('s(V) = ∛V', [['V', 'volume of an idealised cube storage box (ft³)'], ['s', 'side length (ft)']]),
      q('w-cube'), q('w-odd'))
  ];
}

const HOOKS = {
  clock: 'Your team is analysing a 6 km timed enduro stage, with an 8-minute neutralised transition before it. How does a rider’s average speed change the total elapsed time?',
  console: 'The course has two timed sections: one smooth and flowing, one technical and slower. Calculate the total time and compare pacing strategies.',
  survey: 'The trail team surveyed two points on a straight section. They know the run and the elevation difference; they need the direct distance between the points.',
  wheel: 'Your team is measuring a wheel’s circular geometry. A function can describe how a point’s height depends on its horizontal position.'
};
const PAGES = { clock: clockPage, console: consolePage, survey: surveyPage, wheel: wheelPage };
const practiceFor = {
  clock: { ids: CLOCK_PRACTICE_IDS, count: CLOCK_PRACTICE.length, questions: clockPractice, button: 'New stage', note: 'Every target gives a whole-number speed.' },
  console: { ids: SPLIT_PRACTICE_IDS, count: SPLIT_PRACTICE.length, questions: splitPractice, button: 'New course', note: 'One candidate is always rejected.' },
  survey: { ids: SURVEY_PRACTICE_IDS, count: SURVEY_PRACTICE.length, questions: surveyPractice, button: 'New segment', note: 'Whole-number answers.' },
  wheel: { ids: EXP_PRACTICE_IDS, count: EXP_PRACTICE.length, questions: expPractice, button: 'New exponent', note: 'Each one comes out whole.' }
};

export const LAB = {
  id: ID, title: 'Enduro Route Intelligence Lab', eventPrefix: 'enduroroute', rootClass: 'erl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 6: Rational and Radical Functions',
    lines: ['The Enduro Route', 'Intelligence'], accent: 'Lab',
    lede: 'You’re joining the technical analysis team for an upcoming enduro race. The course is ready, but your team still needs to understand the route.',
    body: 'How long will the stage take? How does speed affect time? How far apart are the survey points? Analyse the route with mathematics. Ready to investigate?',
    enter: 'Enter the lab →', back: 'Back to the lab →',
    meta: '25–30 minutes · four missions and a final route analysis · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Mission stations', hook: 'Four stations: race timing, stage splits, trail survey, wheel geometry. Finish all four to unlock the Final Route Analysis.',
    refsNote: DISCLAIMER,
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: {
    kicker: 'Optional extension · the route data diagnostic', title: 'Rational and radical graph diagnostics',
    blurb: 'Asymptotes from degrees, a slant asymptote, and even versus odd roots.',
    hook: 'Abstract graph diagnostics for extra practice. Not every graph is a trail-time model.',
    page: ctx => { const { q, card, para: P_ } = ctx; return [
      card('Rational graphs', 'Compare three functions',
        P_('Degree rule: numerator degree lower → y = 0; equal → the ratio of leading coefficients; one higher → a slant asymptote, found by division.'),
        q('x-f'), q('x-g'), q('x-h'), q('x-slant'), diagnostic(ctx)),
      card('Radical graphs', '√x, ∛x and √(x + 4) − 2', q('x-roots'), q('x-start'), rootCompare())
    ]; }
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Route Analysis', blurb: 'Race timing, two-section timing and a trail survey, on your own.',
    hook: 'You’ve learned to analyse race timing, rational functions, trail geometry and radical equations. The team has one final course to review. Can you put everything together?',
    lockedHook: 'Finish all four missions to unlock the Final Route Analysis.',
    doneShort: 'Enduro route analyst', doneTitle: 'Enduro route analyst',
    doneLede: 'You analysed race times with rational functions, simplified rational expressions, surveyed trail geometry with radicals, and solved rational and radical equations.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with a new course.`,
    page: ({ q, card }, F, key) => [
      card('Challenge A', 'Race timing', ['fa-model', 'fa-time', 'fa-domain', 'fa-ha', 'fa-speed'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Two-section timing', ['fb-num', 'fb-restrict', 'fb-ha', 'fb-time'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
      card('Challenge C', 'Trail survey', ['fc-exact', 'fc-dist', 'fc-grade'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' })))
    ]
  },
  report: { kicker: 'Lab report' },
  summaryExtra: P => ({ independent: ['c-solve', 'sx-v', 'fa-speed', 'fb-num', 'fc-exact'].filter(id => P.earned(id)).length, extraneous: ['s-reject', 'u-check', 'sx-reject'].filter(id => P.earned(id)).length }),
  stats: s => [['Independent solutions', String(s.independent)], ['Extraneous or rejected candidates caught', String(s.extraneous)]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.EnduroRouteLab = { mount, VERSION };
