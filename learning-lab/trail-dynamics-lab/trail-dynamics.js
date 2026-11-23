// The Trail Dynamics Lab (Mathlete MTB, Algebra 2, Unit 4: Quadratic
// Functions). The module's public entry point.
//
//   import { mount } from './trail-dynamics.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: traildynamics:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its three mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, brakePractice, factorPractice, BRAKE_PRACTICE_IDS, FACTOR_PRACTICE_IDS } from './logic/questions.js';
import { BRAKE_PRACTICE, FACTOR_PRACTICE, FINAL_SETS, RAMP } from './logic/models.js';
import { brakeSim, stopTable, coefficientExplorer, jumpDecoder, jumpTuner, factorGraph, squareBuilder, heightAnalyzer, rampSystem } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'trail-dynamics-lab';
const REFS = [
  ['Common Core: Reasoning with Equations and Inequalities (HSA-REI.B.4, C.7)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Interpreting Functions (HSF-IF.C.7–9)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['OpenStax: Quadratic functions', 'https://openstax.org/books/college-algebra/pages/5-1-quadratic-functions'],
  ['OpenStax: Completing the square', 'https://openstax.org/books/intermediate-algebra-2e/pages/9-2-solve-quadratic-equations-by-completing-the-square'],
  ['OpenStax: The quadratic formula', 'https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula'],
  ['Fishtank Learning: Algebra 2 quadratics', 'https://www.fishtanklearning.org/curriculum/math/algebra-2/quadratics/'],
  ['NZ Curriculum: Quadratics in context (braking and reaction distance)', 'https://newzealandcurriculum.tahurangi.education.govt.nz/quadratics-in-context/5637187368.p'],
  ['British Cycling: Braking tips for cycling', 'https://www.britishcycling.org.uk/knowledge/bike-kit/get-started/article/20250911-Braking-tips-for-cycling-0']
];

function brakePage({ q, card, eq, explain, note, sim, para: P_, h3, practiceBox, ...ctx }) {
  return [
    card('Briefing', 'Reaction, braking, stopping',
      el('dl', { class: 'td-terms' },
        el('div', null, el('dt', null, 'Reaction distance'), el('dd', null, 'Travelled during the assumed time before braking begins.')),
        el('div', null, el('dt', null, 'Braking distance'), el('dd', null, 'Travelled after braking begins.')),
        el('div', null, el('dt', null, 'Total stopping distance'), el('dd', null, 'Reaction distance + braking distance.'))),
      note('key', 'a teaching model', 'Real stopping depends on terrain, traction, slope, tires, braking technique and the rider. This lab uses a simplified model with made-up coefficients. It is not a riding recommendation.')),
    card('Module A', 'Discover the quadratic relationship',
      q('b-predict'),
      stopTable(),
      P_('The braking part grows with the square of speed in this model; the reaction part grows in a straight line. Together:'),
      eq('D(v) = R(v) + B(v) = kv² + 0.25v', [['v', 'initial speed (km/h)'], ['R(v)', '(0.9 ÷ 3.6)v = 0.25v: reaction distance (m), with a 0.9 s reaction time'], ['B(v)', 'kv²: braking distance (m); Model A k = 0.01, Model B k = 0.015']]),
      q('b-ratio'), q('b-double'), q('b-reaction'), q('b-total'),
      sim('Stopping distance simulator', brakeSim(ctx))),
    card('Module B', 'Understand the coefficient',
      sim('Coefficient explorer', coefficientExplorer(ctx)),
      q('b-compare'), q('b-k')),
    card('Module C', 'Solve the stopping distance equation',
      P_('Now run it backwards: the analysis says Model A stops in 16.5 m. What speed was that?'),
      eq('0.01v² + 0.25v = 16.5'),
      q('b-eq'), q('b-factor'), q('b-reject'),
      explain('Worked explanation', ['0.01v² + 0.25v = 16.5', '× 100:  v² + 25v − 1650 = 0', '(v + 55)(v − 30) = 0', 'v = −55 or v = 30', 'speed can’t be negative → v = 30 km/h'], 'Solving the equation and interpreting its solutions are two different tasks.')),
    card('Independent challenge', '21 m under Model B',
      eq('0.015v² + 0.25v = 21   →   3v² + 50v − 4200 = 0'),
      q('b-x-abc'), q('b-x-disc'), q('b-x-v'),
      h3('More scenarios'), practiceBox())
  ];
}

function jumpPage({ q, card, eq, explain, note, sim, para: P_, h3, practiceBox, ...ctx }) {
  return [
    card('The model', 'A jump with a missing equation',
      eq('J(x) = −0.04x² + 0.8x,   0 ≤ x ≤ 20', [['x', 'horizontal distance from takeoff (m)'], ['J(x)', 'height above the reference ground (m); takeoff and landing at the same elevation']]),
      note('key', 'a simplified model', 'A parabola is a simplified model of a trajectory, not a full physical prediction of a rider’s flight. This builds on the Algebra 1 Jump Trajectory Lab: here the focus is moving between forms.'),
      q('j-vertex'), q('j-zeros'), q('j-range')),
    card('Module A', 'Three ways to describe the same jump',
      el('div', { class: 'td-forms' },
        eq('Standard:  J(x) = ax² + bx + c  =  −0.04x² + 0.8x', [['a', 'direction and curvature'], ['b', 'helps place the axis (x = −b ÷ 2a)'], ['c', 'the y-intercept']]),
        eq('Vertex:  J(x) = a(x − h)² + k  =  −0.04(x − 10)² + 4', [['(h, k)', 'the vertex'], ['a', 'direction and width']]),
        eq('Factored:  J(x) = a(x − r₁)(x − r₂)  =  −0.04x(x − 20)', [['r₁, r₂', 'the zeros: where the trajectory meets the reference height']])),
      sim('Jump equation decoder', jumpDecoder(ctx)),
      q('j-form-max'), q('j-form-zeros'), q('j-form-standard')),
    card('Module B', 'Transform the jump',
      P_('Every jump curve here is the parent y = x² transformed: g(x) = a(x − h)² + k. Predict, then check in the tuner.'),
      q('j-shift'), q('j-stretch'),
      sim('Jump profile tuner', jumpTuner(ctx))),
    card('Module C', 'Factor the jump',
      q('j-factor'), q('j-zpp'),
      h3('Factoring challenge'),
      P_('Some of these factor over the integers; some don’t. Factor it (or say it doesn’t), then see its zeros on the graph.'),
      practiceBox(), factorGraph(ctx))
  ];
}

function landingPage({ q, card, eq, explain, note, sim, para: P_, h3, ...ctx }) {
  return [
    card('Briefing', 'How high, and where?',
      eq('J(x) = −0.04(x − 10)² + 4'),
      P_('Where does the trajectory reach 3 m? 2 m? Does it ever reach 5 m? Each question is the same equation with a different target, and a different best method.')),
    card('Module A', 'Solve using square roots: 3 m',
      q('l-sqrt-step'), q('l-sqrt')),
    card('Module B', 'Complete the square',
      P_('Start from standard form and rebuild vertex form. The graph never changes, only how the equation is written.'),
      squareBuilder(ctx),
      q('l-cts-factor'), q('l-cts-square'), q('l-cts-k')),
    card('Module C', 'The quadratic formula: 2 m',
      eq('x = (−b ± √(b² − 4ac)) ÷ 2a'),
      q('l-qf-abc'), q('l-qf-disc'), q('l-qf-roots'), q('l-qf-exact'),
      explain('Where the formula comes from (completing the square)', ['ax² + bx + c = 0', 'x² + (b/a)x = −c/a   (divide by a)', 'x² + (b/a)x + (b/2a)² = (b/2a)² − c/a', '(x + b/2a)² = (b² − 4ac) ÷ 4a²', 'x + b/2a = ±√(b² − 4ac) ÷ 2a', 'x = (−b ± √(b² − 4ac)) ÷ 2a'], 'It isn’t a separate fact to memorise: it’s completing the square done once, for every quadratic.'),
      q('l-derive')),
    card('Module D', 'Will the trajectory reach that height?',
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, el('th', { scope: 'col' }, 'Discriminant Δ = b² − 4ac'), el('th', { scope: 'col' }, 'Real solutions'))),
        el('tbody', null, [['Positive', 'Two distinct'], ['Zero', 'One repeated'], ['Negative', 'None (two complex)']].map(([a, b]) => el('tr', null, el('th', { scope: 'row' }, a), el('td', null, b)))))),
      q('l-disc-4'), q('l-disc-5'), q('l-complex'),
      sim('Trajectory height analyzer', heightAnalyzer(ctx)),
      q('l-disc-meaning')),
    card('Module E', 'Complex solutions',
      P_('With i² = −1, √(−100) = 10i, so the 5 m equation has solutions 10 + 5i and 10 − 5i: complex conjugates. They are valid algebraic solutions, but they aren’t positions on the trail: the jump simply never reaches 5 m.'),
      note('key', 'negative Δ isn’t “no solution”', 'A negative discriminant means no REAL solutions. There are still exactly two complex ones. The optional extension practises complex-number arithmetic.')),
    card('Linear meets quadratic', 'The landing ramp',
      P_(`A target height is a flat line. A landing ramp is a sloped one: y = ${RAMP.m}x + ${RAMP.q}. Setting the line equal to the parabola gives another quadratic.`),
      q('l-system'),
      sim('Landing ramp system', rampSystem(ctx)))
  ];
}

const HOOKS = {
  brake: 'You’re analysing a section of technical downhill. The rider approaches a corner at different speeds. Why does a small increase in speed create a much bigger increase in the distance needed to stop?',
  jump: 'The team has trajectory data from a fictional jump simulation, but the equation is missing. Reconstruct it, find its key features, and see how different forms describe the same jump.',
  landing: 'Where does the modelled trajectory reach 2 m? 3 m? Does it ever reach 5 m? Calculate the answers and use the graph to check your work.'
};
const PAGES = { brake: brakePage, jump: jumpPage, landing: landingPage };
const practiceFor = {
  brake: { ids: BRAKE_PRACTICE_IDS, count: BRAKE_PRACTICE.length, questions: brakePractice, button: 'New scenario', note: 'Checked numbers with whole-number speeds.' },
  jump: { ids: FACTOR_PRACTICE_IDS, count: FACTOR_PRACTICE.length, questions: factorPractice, button: 'New quadratic', note: 'Some factor over the integers, some don’t.' }
};

export const LAB = {
  id: ID, title: 'Trail Dynamics Lab', eventPrefix: 'traildynamics', rootClass: 'tdl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 4: Quadratic Functions',
    lines: ['The Trail', 'Dynamics'], accent: 'Lab',
    lede: 'You’re joining the mountain bike performance team for an enduro event. Before race day, the team needs to understand the braking zones and the jump lines.',
    body: 'Your job: investigate the mathematics behind both. Can you become the team’s Trail Dynamics Engineer?',
    enter: 'Enter the lab →', back: 'Back to the lab →',
    meta: '20–25 minutes · three missions and a final course analysis · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Mission stations', hook: 'Three stations: braking, jump forms, landing heights. Finish all three to unlock the Final Course Analysis.',
    refsNote: 'The braking coefficients and reaction time are a simplified teaching model, not empirical measurements or riding advice. The jump is a simplified parabolic model, not a prediction of real flight.',
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] || undefined })),
  extension: {
    kicker: 'Optional extension · complex numbers', title: 'Working with i',
    blurb: 'Powers of i, and adding, subtracting and multiplying complex numbers.',
    hook: 'The 5 m equation gave 10 ± 5i. Here’s how those numbers work: straight mathematics, no forced trail story.',
    page: ({ q, card, eq, note, para: P_ }) => [
      card(null, null, eq('i = √−1,   i² = −1', [['a + bi', 'a complex number: real part a, imaginary part b']]),
        P_('Powers of i repeat every four: i, −1, −i, 1. Add or subtract complex numbers part by part. Multiply like brackets, then replace i² with −1.'),
        q('cx-i2'), q('cx-power'), q('cx-add'), q('cx-sub'), q('cx-mul'), q('cx-conj'),
        note('key', 'conjugates', 'a + bi and a − bi are conjugates. They always add to a real number (2a) and multiply to a real number (a² + b²): exactly what the quadratic’s coefficients say.'))
    ]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Course Analysis', blurb: 'Braking, a new jump in three forms, and a landing height, on your own.',
    hook: 'You’ve analysed braking, reconstructed a jump, and investigated different solutions. Now complete the team’s final performance report.',
    lockedHook: 'Finish all three missions to unlock the Final Course Analysis.',
    doneShort: 'Trail dynamics engineer', doneTitle: 'Trail dynamics engineer',
    doneLede: 'You’ve used quadratic functions to investigate stopping distances, reconstruct mountain bike jump trajectories, and solve complex mathematical problems.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with new numbers.`,
    page: ({ q, card, para: P_ }, F, key) => [
      card('Challenge A', 'Braking analysis', P_('Simulated data, not a riding recommendation.'), ['fa-eq', 'fa-v', 'fa-reject'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Reconstruct the jump', ['fb-abc', 'fb-axis', 'fb-vertex', 'fb-zeros', 'fb-vform', 'fb-fform'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
      card('Challenge C', 'Diagnose the landing height', ['fc-eq', 'fc-roots', 'fc-exact'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' })))
    ]
  },
  report: { kicker: 'Lab report' },
  summaryExtra: P => ({ independent: ['b-x-v', 'fa-v', 'fb-vertex', 'fc-roots'].filter(id => P.earned(id)).length }),
  stats: s => [['Independent solutions', String(s.independent)]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.TrailDynamicsLab = { mount, VERSION };
