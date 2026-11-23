// The Pump Track Profile Lab (Mathlete MTB, Algebra 2, Unit 5: Polynomial
// Functions). The module's public entry point.
//
//   import { mount } from './pump-track.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: pumptrack:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its four mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, zeroPractice, dividePractice, ZERO_PRACTICE_IDS, DIVIDE_PRACTICE_IDS, text } from './logic/questions.js';
import { factoredText } from './logic/poly.js';
import { ZERO_PRACTICE, DIVIDE_PRACTICE, FINAL_SETS, P, Q, CUBIC, BASE, ADJUST } from './logic/models.js';
import { flowDecoder, endExplorer, combineStudio, expansionGrid, multiplicityExplorer, factorBuilder, zeroTester, syntheticConsole, longWorkbench, remainderTester, complexGraph } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'pump-track-lab';
const DISCLAIMER = 'Every curve here is a simplified mathematical profile, not a pump track design or construction specification. Real pump tracks are continuous circuits whose shape depends on the site, the riders and professional design.';
const REFS = [
  ['Common Core: Arithmetic with Polynomials and Rational Expressions (HSA-APR.A.1, B.2–3, C.4–5)', 'https://www.thecorestandards.org/Math/Content/HSA/APR/'],
  ['Common Core: Interpreting Functions (HSF-IF.B.4, C.7c)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['OpenStax: Power functions and polynomial functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/5-2-power-functions-and-polynomial-functions'],
  ['OpenStax: Graphs of polynomial functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/5-3-graphs-of-polynomial-functions'],
  ['OpenStax: Zeros of polynomial functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/5-5-zeros-of-polynomial-functions'],
  ['Fishtank Learning: Algebra 2 polynomials', 'https://www.fishtanklearning.org/curriculum/math/algebra-2/polynomials/'],
  ['UCI: Pump Track Guide (2023)', 'https://assets.ctfassets.net/761l7gh5x5an/6WXzcUVrAjo9Qhw8bVkWn9/1b766a45c1da9c521d3cec1fe606ee92/2023_UCI_Pump_Track_Guide.pdf'],
  ['IMBA: Mountain bike trail development guidelines', 'https://fpr.vermont.gov/sites/fpr/files/doc_library/IMBA-MTB-Trail-Development-Guidelines-for-successfully-managing-the-process.pdf']
];

function decoderPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3 } = ctx;
  return [
    card('Module A', 'What is a polynomial?',
      P_('A polynomial is a sum of terms, each a number times x to a whole-number power (0, 1, 2, …). Polynomial graphs are smooth and unbroken: no corners, no gaps.'),
      q('p-is-poly')),
    card('The model', 'Flow Line A',
      eq('P(x) = 0.005x(x − 2)(x − 6)(x − 8),   0 ≤ x ≤ 8', [['x', 'horizontal distance along the modelled track (m)'], ['P(x)', 'height relative to the reference elevation (m)']]),
      eq(`Expanded:  P(x) = ${text(P())}`),
      note('key', 'a simplified profile', DISCLAIMER)),
    card('Module B', 'Degree and leading coefficient',
      P_('The degree is the highest power of x. The leading term is the term with that power; its number is the leading coefficient.'),
      q('p-degree'), q('p-lead')),
    card('Module C', 'End behavior',
      P_('End behavior is what the graph does as x → −∞ and x → +∞. Only the leading term matters out there.'),
      q('p-end'),
      sim('Polynomial end behavior explorer', endExplorer(ctx)),
      q('p-end-domain'),
      note('myth', 'the track isn’t the whole polynomial', 'Flow Line A only describes 0 ≤ x ≤ 8. End behavior is a property of the polynomial extended beyond that, not a prediction about the real track.')),
    card('Module D', 'Turning points',
      P_('A turning point is where the graph changes direction: the top of a roller or the bottom of a dip. A degree-n polynomial has at most n − 1 of them.'),
      q('p-turn-max'), q('p-turn-five'), q('p-below')),
    card('Decode it', 'Four views, one model',
      sim('Flow line decoder', flowDecoder(ctx)),
      explain('Reading the shape from the equation', ['Degree 4, even  →  both ends go the same way', 'Leading coefficient 0.005 > 0  →  both ends rise', 'At most 4 − 1 = 3 turning points', 'Zeros 0, 2, 6, 8  →  sign changes at each (all multiplicity 1)'], 'Everything above comes from the equation before you look at the graph; the graph confirms it.'))
  ];
}

function shapePage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3 } = ctx;
  return [
    card('Module A', 'Add and subtract polynomial profiles',
      eq(`B(x) = ${text(BASE())}`, [['B(x)', 'the existing terrain profile (m)']]),
      eq(`A(x) = ${text(ADJUST())}`, [['A(x)', 'a proposed shaping adjustment (m)']]),
      P_('The new profile is T(x) = B(x) + A(x). Add like terms only: same variable, same power.'),
      q('s-add'), q('s-x-term'),
      sim('Trail profile combination studio', combineStudio(ctx)),
      h3('Subtraction'),
      P_('Subtracting a polynomial means subtracting every one of its terms: distribute the minus sign first.'),
      q('s-sub'), q('s-recover')),
    card('Module B', 'Multiply polynomials to build a profile',
      P_('Sometimes we know where a profile crosses the reference elevation and want its full polynomial. Expand Flow Line A in stages:'),
      eq('0.005 · x(x − 8) · (x − 2)(x − 6)'),
      q('s-group'), q('s-expand'),
      sim('Polynomial expansion workbench', expansionGrid(ctx)),
      q('s-scale')),
    card('Module C', 'Degree rules',
      el('ul', { class: 'pt-points' }, el('li', null, 'Adding or subtracting: the degree is at most the larger degree (it can drop if leading terms cancel).'), el('li', null, 'Multiplying: the degrees add.')),
      q('s-degree-rule'), q('s-add-drop')),
    card('Challenge', 'Expand on your own',
      q('s-challenge'),
      explain('Worked expansion', ['(x² + 2x)(x² − 3x + 1)', '= x⁴ − 3x³ + x² + 2x³ − 6x² + 2x', '= x⁴ − x³ − 5x² + 2x'], 'Six products, then combine like terms.'))
  ];
}

function featuresPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Module A', 'Zeros and factors',
      eq(`Q(x) = 200 · P(x) = ${text(Q())}`),
      P_('The expanded equation hides the crossings. Scaling by 200 makes the coefficients whole numbers without moving any zeros.'),
      q('f-scale'), q('f-zeros'), q('f-factor'),
      note('key', 'zeros ↔ factors', 'If x = r is a zero, (x − r) is a factor, and the other way round. Setting each factor equal to zero gives the zeros.')),
    card('Module B', 'Does the trail cross the line or bounce off it?',
      eq('M(x) = 0.02(x − 1)(x − 3)²(x − 5),   0 ≤ x ≤ 6'),
      P_('Multiplicity is how many times a factor appears. Odd multiplicity: the graph crosses. Even multiplicity: it touches the line and turns back.'),
      q('f-mult'), q('f-touch'), q('f-cross'),
      sim('Multiplicity explorer', multiplicityExplorer(ctx))),
    card('Module C', 'Build a polynomial from its zeros',
      q('f-build'),
      sim('Build the profile', factorBuilder(ctx))),
    card('Module D', 'The Rational Zero Theorem',
      P_('For integer coefficients, any rational zero is ±p/q, where p divides the constant term and q divides the leading coefficient. It lists candidates; testing tells you which are zeros.'),
      eq(`Q(x) = x · (${text(CUBIC())})`),
      q('f-rzt'), q('f-test4'),
      sim('Zero tester', zeroTester(ctx, 'main')),
      q('f-rzt-zeros')),
    card('Independent challenge', 'Find the hidden crossing',
      practiceBox(), sim('Zero tester', zeroTester(ctx, 'practice')))
  ];
}

function diagnosticsPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Module A', 'Synthetic division',
      P_('Synthetic division divides by (x − k) using only coefficients. Write every coefficient, including a 0 for any missing power.'),
      q('d-missing'),
      sim('Synthetic division console', syntheticConsole(ctx)),
      P_('Now the track itself. The x = 2 transition is known: divide it out.'),
      q('d-synth'), q('d-quotient'), q('d-factor-q')),
    card('Module B', 'The Remainder and Factor Theorems',
      eq('f(x) ÷ (x − k) leaves remainder f(k)', [['Remainder Theorem', 'the remainder is the value at k'], ['Factor Theorem', '(x − k) is a factor exactly when f(k) = 0']]),
      q('d-q3'), q('d-r-meaning'), q('d-p3'),
      sim('Test a feature location', remainderTester(ctx))),
    card('Module C', 'Polynomial long division',
      P_('Long division works for any divisor, not just (x − k): divide the leading terms, multiply, subtract, bring down, repeat.'),
      q('d-long'),
      sim('Polynomial division workbench', longWorkbench(ctx)),
      q('d-algorithm')),
    card('Independent challenge', 'More divisions',
      practiceBox())
  ];
}

const HOOKS = {
  decoder: 'Your pump track team has mapped a new section of terrain with several rises and dips. You’ve received a mathematical model of it: figure out what the equation tells you.',
  shape: 'The team is combining an existing terrain profile with a proposed shaping adjustment. What does the result look like? Then expand a factored equation to reveal the complete polynomial.',
  features: 'Another section’s expanded equation is available, but its factored form is missing. Where does the profile cross the reference elevation, and how does it behave at each crossing?',
  diagnostics: 'The profile has been partly analysed. One transition is known; divide the polynomial and uncover the remaining factors.'
};
const PAGES = { decoder: decoderPage, shape: shapePage, features: featuresPage, diagnostics: diagnosticsPage };
const practiceFor = {
  features: { ids: ZERO_PRACTICE_IDS, count: ZERO_PRACTICE.length, questions: zeroPractice, button: 'New polynomial', note: 'Cubics with rational zeros; one has a leading coefficient of 2.' },
  diagnostics: { ids: DIVIDE_PRACTICE_IDS, count: DIVIDE_PRACTICE.length, questions: dividePractice, button: 'New division', note: 'Some divide exactly, some leave a remainder; watch for missing powers.' }
};

export const LAB = {
  id: ID, title: 'Pump Track Profile Lab', eventPrefix: 'pumptrack', rootClass: 'ptl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 5: Polynomial Functions',
    lines: ['The Pump Track', 'Profile'], accent: 'Lab',
    lede: 'Your team has a new section of terrain to turn into a smooth, flowing pump track: rollers, dips and transitions. But how do you describe that shape mathematically?',
    body: 'Analyse the track profile, uncover its polynomial equation, and see how its structure sets its shape. Ready to shape the flow?',
    enter: 'Enter the lab →', back: 'Back to the lab →',
    meta: '25–30 minutes · four missions and a final track analysis · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Mission stations', hook: 'Four stations: decode the flow line, shape it, find its hidden features, divide it apart. Finish all four to unlock the Final Track Analysis.',
    refsNote: DISCLAIMER,
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] || undefined })),
  extension: {
    kicker: 'Optional extension · complex zeros', title: 'Roots you can’t see on the graph',
    blurb: 'Why a degree-4 profile can cross the line only twice, and where the other zeros went.',
    hook: 'Some trail models have zeros that never appear on the real graph. Find them, and count them all.',
    page: ({ q, card, eq, note, para: P_ }) => [
      card(null, null, eq('R(x) = (x² + 1)(x − 2)(x − 6)'),
        q('c-real'), complexGraph(), q('c-complex'), q('c-count'), q('c-pairs'),
        note('key', 'the Fundamental Theorem of Algebra', 'A degree-n polynomial has exactly n complex zeros, counting multiplicity. Only the real ones are x-intercepts; complex zeros are algebraic results, not places on the track.'))
    ]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Track Analysis', blurb: 'A new section of track: features, zeros, standard form, division and the Remainder Theorem, on your own.',
    hook: 'Your team has the polynomial model for a new section of pump track. Identify its features, find its roots, reconstruct the equation and explain its shape. This time, you’re the engineer.',
    lockedHook: 'Finish all four missions to unlock the Final Track Analysis.',
    doneShort: 'Pump track profile engineer', doneTitle: 'Pump track profile engineer',
    doneLede: 'You analysed a polynomial track profile, identified its degree and end behavior, discovered its zeros, reconstructed its equation, and used polynomial division to uncover its structure.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with a new track section.`,
    page: ({ q, card, para: P_ }, F, key) => [
      card('Challenge A', 'Identify the polynomial', P_(`F(x) = ${factoredText(F.set.a, F.set.roots)} on 0 ≤ x ≤ 8: x in meters, height in meters relative to the reference line. A fictional profile.`),
        ['fa-degree', 'fa-lead', 'fa-turn', 'fa-end'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Find the zeros', ['fb-zeros', 'fb-cross'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
      card('Challenge C', 'Convert to standard form', ['fc-expand', 'fc-const'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' }))),
      card('Challenge D', 'Test a candidate factor', ['fd-synth', 'fd-factor'].map(id => q(id, { def: F[id], key, kicker: 'Challenge D' }))),
      card('Challenge E', 'Use the Remainder Theorem', ['fe-g', 'fe-f'].map(id => q(id, { def: F[id], key, kicker: 'Challenge E' })))
    ]
  },
  report: { kicker: 'Lab report' },
  summaryExtra: P => ({ independent: ['fb-zeros', 'fc-expand', 'fd-synth', 'fe-f'].filter(id => P.earned(id)).length, synthetic: ['d-synth', 'fd-synth'].filter(id => P.earned(id)).length }),
  stats: s => [['Independent solutions', String(s.independent)], ['Synthetic divisions right', `${s.synthetic} of 2`]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.PumpTrackLab = { mount, VERSION };
