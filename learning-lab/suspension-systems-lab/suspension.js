// The Suspension & Systems Lab (Mathlete MTB, Algebra 2, Unit 7: Exponential
// and Logarithmic Functions). The module's public entry point.
//
//   import { mount } from './suspension.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: suspensionsystems:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its three mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS,
  bouncePractice, growPractice, soundPractice, BOUNCE_PRACTICE_IDS, GROW_PRACTICE_IDS, SOUND_PRACTICE_IDS, fmt } from './logic/questions.js';
import { BOUNCE, GROW, SOUND, BOUNCE_PRACTICE, GROW_PRACTICE, SOUND_PRACTICE, FINAL_SETS } from './logic/models.js';
import { term, level, pow10 } from './logic/expo.js';
import { decaySim, compareModels, sequenceExplorer, expStudio, cycleTime, settleCalc, growthSim, targetCalc, dbAnalyzer, converter, logWorkbench, logStudio } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'suspension-systems-lab';
const DISCLAIMER = 'Simplified educational models: the suspension curve is the exponential decay envelope of oscillation peaks, not a complete model of a real shock or a suspension setting; the registrations are fictional and short-term, not a forecast; the sound readings are fictional and not a safety assessment.';
const REFS = [
  ['Common Core: Linear, Quadratic and Exponential Models (HSF-LE.A.1–4, B.5)', 'https://www.thecorestandards.org/Math/Content/HSF/LE/'],
  ['Common Core: Building Functions (HSF-BF.A.2, B.3, B.5)', 'https://www.thecorestandards.org/Math/Content/HSF/BF/'],
  ['OpenStax: Exponential and logarithmic models', 'https://openstax.org/books/college-algebra-2e/pages/6-7-exponential-and-logarithmic-models'],
  ['OpenStax: Sound intensity and sound level', 'https://openstax.org/books/college-physics/pages/17-3-sound-intensity-and-sound-level'],
  ['Oregon State University: Damped harmonic motion', 'https://lipa.physics.oregonstate.edu/sec_damped.html'],
  ['Fishtank Learning: Algebra 2 exponential modeling and logarithms', 'https://www.fishtanklearning.org/curriculum/math/algebra-2/exponential-modeling-and-logarithms/'],
  ['RockShox: Suspension fine tuning', 'https://www.sram.com/en/rockshox/learn/suspension-fine-tuning'],
  ['FOX: Coil shock owner’s manual (rebound damping)', 'https://tech.ridefox.com/bike/owners-manuals/2025-all-coil-shocks-dhx2-dhx-models']
];
const table = (head, rows) => el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, head.map(h => el('th', { scope: 'col' }, h)))),
  el('tbody', null, rows.map(r => el('tr', null, el('th', { scope: 'row' }, r[0]), r.slice(1).map(c => el('td', { class: 'ms-mono' }, c)))))));
const terms = pairs => el('dl', { class: 'ss-terms' }, pairs.map(([a, b]) => el('div', null, el('dt', null, a), el('dd', null, b))));

function bouncePage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('Briefing', 'Spring, damper, rebound',
      terms([['Spring', 'stores energy when the shock compresses'], ['Damper', 'controls how fast the shock compresses and rebounds'], ['Compression', 'the shock shortening over a bump'], ['Rebound', 'the shock extending again afterwards'],
        ['Oscillation', 'the back-and-forth that follows'], ['Amplitude', 'how far each swing goes from rest']]),
      P_('Manufacturers describe rebound damping as controlling how quickly a shock extends after compression. In an underdamped spring-and-damper system, the peaks shrink inside an exponential envelope.'),
      note('key', 'a simplified model', 'We model only the sequence of peak amplitudes and their exponential envelope, not the full motion of a real shock. The numbers are teaching assumptions, not suspension settings or specifications.'),
      q('b-predict')),
    card('The model', 'Peaks that keep 65%',
      eq('Aₙ = 18(0.65)ⁿ', [['A₀ = 18 mm', 'initial displacement amplitude'], ['r = 0.65', 'decay factor: the fraction kept each cycle'], ['n', 'number of cycles'], ['Aₙ', 'remaining peak amplitude (mm)']]),
      q('b-retain'), q('b-a3'),
      table(['Cycle', 'Remaining amplitude'], Array.from({ length: 7 }, (_, n) => [String(n), `${fmt(term(18, 0.65, n))} mm`])),
      q('b-diffs')),
    card('Module A', 'Exponential versus linear change',
      eq('Exponential  Aₙ = 18(0.65)ⁿ      Linear  Lₙ = 18 − 6.3n'),
      P_('Both start at 18 mm and agree at cycle 1. One multiplies by 0.65 each cycle; the other subtracts 6.3 mm.'),
      q('b-linear-neg'), q('b-which'),
      sim('Exponential vs linear', compareModels(ctx))),
    card('The simulator', 'Suspension decay simulator',
      sim('Suspension decay simulator', decaySim(ctx))),
    card('Module B', 'Geometric sequences',
      P_('Each peak is the previous one times the same common ratio, so the peaks form a geometric sequence.'),
      q('b-sequence'), q('b-recursive'),
      sim('Geometric sequence explorer', sequenceExplorer(ctx))),
    card('Module C', 'Transformations of exponential functions',
      eq('g(x) = a·b^(x − h) + k', [['a', 'vertical scale and reflection'], ['b', 'growth (b > 1) or decay (0 < b < 1); b > 0, b ≠ 1'], ['h', 'horizontal shift'], ['k', 'vertical shift: the horizontal asymptote is y = k']]),
      q('b-faster'), q('b-asymptote'),
      sim('Exponential transformation studio', expStudio(ctx))),
    card('Module D', 'The natural base e',
      P_('Peaks come every 0.5 s. A continuous envelope through all of them uses e, the natural base of continuous growth and decay.'),
      eq('k = −ln(0.65) ÷ 0.5,   A(t) = 18e^(−kt)', [['t', 'time (s)'], ['A(t)', 'modelled amplitude envelope (mm)'], ['e ≈ 2.718', 'Euler’s number']]),
      q('b-k'), q('b-match'),
      sim('Cycle versus time', cycleTime(ctx))),
    card('Module E', 'Solve for the settling time',
      P_('How long until the envelope falls below a 2 mm threshold? The unknown is an exponent, so logarithms bring it down.'),
      q('b-settle-t'), q('b-settle-n'), q('b-first-cycle'),
      explain('Both ways', ['18e^(−0.8616t) = 2', 'e^(−0.8616t) = 1/9', '−0.8616t = ln(1/9)', 't ≈ 2.55 s', '—', '18(0.65)ⁿ = 2', 'n = ln(2/18) ÷ ln(0.65) ≈ 5.10', 't = 0.5n'], 'The envelope crosses 2 mm at 5.10 cycles; the first whole peak below it is cycle 6.'),
      sim('Settling time calculator', settleCalc(ctx))),
    card('Independent challenge', 'A different shock', practiceBox())
  ];
}

function growPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The model', 'A trail festival’s registrations',
      eq('R(w) = 100(1.20)ʷ,   0 ≤ w ≤ 6', [['w', 'weeks since the campaign began'], ['R(w)', 'projected cumulative registrations'], ['1.20', 'the weekly growth factor (1 + 20%)']]),
      note('key', 'fictional, short-term data', 'The 20% is an illustrative six-week planning model. The event caps at 300 riders; it isn’t a claim that attendance grows exponentially forever.'),
      q('g-factor'), q('g-r3'),
      table(['Week', 'Projected registrations'], Array.from({ length: 7 }, (_, w) => [String(w), String(Math.round(term(100, 1.2, w)))])),
      q('g-additive')),
    card('Module A', 'Event growth simulator', sim('Event growth simulator', growthSim(ctx))),
    card('Module B', 'Exponential versus linear growth',
      eq('R(w) = 100(1.20)ʷ      L(w) = 100 + 20w'),
      q('g-week6'), q('g-capacity')),
    card('Module C', 'Solve an exponential growth equation',
      P_('250 projected registrations unlock an extra race category. When?'),
      q('g-solve'), q('g-week'),
      sim('Growth target calculator', targetCalc(ctx))),
    card('Independent challenge', 'Another event', practiceBox())
  ];
}

function soundPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3, practiceBox } = ctx;
  return [
    card('The model', 'Decibels',
      eq('L = 10·log₁₀(I / I₀)', [['L', 'sound intensity level (dB)'], ['I', 'sound intensity (W/m²)'], ['I₀ = 10⁻¹² W/m²', 'the reference intensity']]),
      note('key', 'fictional readings', 'The example readings are simulated. This uses the definition of sound intensity level; it isn’t a measurement or a safety assessment of event noise.')),
    card('Module A', 'Why use logarithms?',
      P_('A logarithm gives the exponent needed to produce a number.'),
      q('d-log'), q('d-ratio'), q('d-level'),
      table(['Example location', 'Intensity', 'Level'], SOUND.locations.map(l => [l.name, `${pow10(l.e)} W/m²`, `${level(Math.pow(10, l.e))} dB`])),
      q('d-tenfold'),
      sim('Decibel analyzer', dbAnalyzer(ctx))),
    card('Module B', 'Logarithmic and exponential forms',
      eq('log_b(y) = x   ⇔   bˣ = y'),
      q('d-form'), q('d-inverse'),
      sim('Conversion tool', converter(ctx))),
    card('Module C', 'Logarithm properties',
      eq('log(MN) = log M + log N      log(M/N) = log M − log N      log(Mᵖ) = p·log M'),
      q('d-product'), q('d-quotient'), q('d-power'), q('d-misuse'),
      h3('Two sources at once'),
      note('myth', 'don’t add decibels', 'Two sources running together add their intensities, then convert. 70 dB + 70 dB is not 140 dB.'),
      q('d-combine')),
    card('Module D', 'Common logs, natural logs and change of base',
      eq('log x = log₁₀ x,   ln x = logₑ x,   log_b(x) = ln x ÷ ln b'),
      q('d-ln'), q('d-log2'), q('d-log3'),
      sim('Logarithm workbench', logWorkbench(ctx))),
    card('Module E', 'Solve a logarithmic equation',
      q('d-domain'),
      P_('The system records 75 dB. What intensity is that?'),
      q('d-75'),
      explain('Worked solution', ['75 = 10·log₁₀(I/10⁻¹²)', '7.5 = log₁₀(I/10⁻¹²)', '10^7.5 = I/10⁻¹²', 'I = 10⁻¹² × 10^7.5 = 10^−4.5', 'I ≈ 3.1623 × 10⁻⁵ W/m²'], 'Exponentiating undoes the log.'),
      h3('Independent challenge'), practiceBox())
  ];
}

const HOOKS = {
  bounce: 'You’ve just ridden a section of technical trail with a series of bumps. Your suspension compresses and rebounds after each one. How does the remaining oscillation shrink over time?',
  grow: 'A local trail festival opens registration: 100 riders in the first week, with an estimated 20% growth each week for six weeks. Forecast the attendance.',
  sound: 'The festival has a pump track competition, an announcer and spectators. Sound intensity spans an enormous range, so the system reports decibels. How do logarithms make that work?'
};
const PAGES = { bounce: bouncePage, grow: growPage, sound: soundPage };
const practiceFor = {
  bounce: { ids: BOUNCE_PRACTICE_IDS, count: BOUNCE_PRACTICE.length, questions: bouncePractice, button: 'New shock', note: 'A different initial amplitude and retention each time.' },
  grow: { ids: GROW_PRACTICE_IDS, count: GROW_PRACTICE.length, questions: growPractice, button: 'New event', note: 'Different starts, rates and targets.' },
  sound: { ids: SOUND_PRACTICE_IDS, count: SOUND_PRACTICE.length, questions: soundPractice, button: 'New reading', note: 'Readings that aren’t multiples of 10.' }
};

export const LAB = {
  id: ID, title: 'Suspension & Systems Lab', eventPrefix: 'suspensionsystems', rootClass: 'ssl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 7: Exponential and Logarithmic Functions',
    lines: ['The Suspension', '& Systems'], accent: 'Lab',
    lede: 'You’ve joined a mountain bike engineering team: a suspension that settles after a hit, an enduro event whose entries are growing, and a sound system that measures intensity with logarithms.',
    body: 'Some of the most important relationships in engineering aren’t linear. Ready to investigate?',
    enter: 'Enter the lab →', back: 'Back to the lab →',
    meta: '20–25 minutes · three missions and a final engineering report · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Mission stations', hook: 'Three stations: suspension decay, event growth, and sound. Finish all three to unlock the Final Engineering Report.',
    refsNote: DISCLAIMER,
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: {
    kicker: 'Optional extension · the advanced engineering bench', title: 'Continuous growth, log graphs and series',
    blurb: 'N₀e^(kt), transformations of log graphs, and geometric vs arithmetic totals.',
    hook: 'For riders ready to go further: three short benches, all optional.',
    page: ctx => { const { q, card, eq, para: P_, sim } = ctx; return [
      card('Bench A', 'Continuous exponential growth', eq('N(t) = N₀e^(kt)   vs   N(t) = N₀(1 + r)ᵗ'), q('x-k'), q('x-equal')),
      card('Bench B', 'Logarithmic graph transformations', eq('g(x) = a·log_b(x − h) + k'), q('x-logdomain'), sim('Log transformation studio', logStudio(ctx))),
      card('Bench C', 'Geometric series', eq('Sₙ = a(rⁿ − 1)/(r − 1)'), P_('A sponsor’s weekly contribution grows 20% a week: 100, 120, 144, 172.8, 207.36.'), q('x-series'), q('x-arith'))
    ]; }
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Engineering Report', blurb: 'Suspension decay, event growth, sound intensity and a natural-log reversal, on your own.',
    hook: 'You’ve explored suspension damping, event growth and sound intensity. Now the team needs one final analysis, using exponential models and logarithms without step-by-step guidance.',
    lockedHook: 'Finish all three missions to unlock the Final Engineering Report.',
    doneShort: 'Suspension & systems engineer', doneTitle: 'Suspension & systems engineer',
    doneLede: 'You analysed suspension damping, modelled exponential growth and used logarithms to understand sound intensity: exponential functions describe changing systems, and logarithms work backward to find the unknowns.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with new numbers.`,
    page: ({ q, card }, F, key) => [
      card('Challenge A', 'Suspension decay', ['fa-model', 'fa-at', 'fa-cycle'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Event growth', ['fb-model', 'fb-at', 'fb-w', 'fb-linear'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
      card('Challenge C', 'Sound intensity', ['fc-exp', 'fc-n', 'fc-10db'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' }))),
      card('Challenge D', 'Reverse the suspension model', ['fd-t', 'fd-why'].map(id => q(id, { def: F[id], key, kicker: 'Challenge D' })))
    ]
  },
  report: { kicker: 'Lab report' },
  summaryExtra: P => ({ independent: ['bx-cycle', 'gx-w', 'dx-int', 'fa-cycle', 'fb-w', 'fd-t'].filter(id => P.earned(id)).length, logs: ['b-settle-t', 'g-solve', 'd-75', 'fb-w', 'fd-t'].filter(id => P.earned(id)).length }),
  stats: s => [['Independent solutions', String(s.independent)], ['Equations solved with logarithms', `${s.logs} of 5`]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.SuspensionSystemsLab = { mount, VERSION };
