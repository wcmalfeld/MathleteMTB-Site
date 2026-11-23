// Race-Day Workshop (Mathlete MTB, Algebra 2, Unit 1: Equations and
// Inequalities). The module's public entry point.
//
//   import { mount } from './workshop.js';
//   mount(element, { studentId, storage: 'local' | 'memory' | { load, save },
//                    routing: 'hash' | 'memory',
//                    backLink: { href, label },      // "Exit": where the student came from
//                    courseLink: { href, label },    // "Back to Algebra 2"
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: raceday:attempt, raceday:progress, raceday:complete.
//
// The shell (opening screen, mission board, final rounds, completion and
// report) is the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the workshop's config and its three mission
// pages. Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions, photoFigure } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, PRACTICE_IDS, practiceQuestions, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, nf } from './logic/questions.js';
import { PRD, sagWindow, raceStage, survey, RACE_PRACTICE, FINAL_SETS } from './logic/models.js';
import { sagCalculator, toleranceGauge, raceClock, surveyLab, algebraDebugger } from './components/labs.js';

export const VERSION = '1.1.0';
export const ID = 'race-day-workshop';
// Photos live next to the module, so it finds them wherever it's mounted.
const PHOTO = name => new URL('./images/' + name, import.meta.url).href;
const REFS = [
  ['FOX: FLOAT shock owner’s manual, setting sag', 'https://tech.ridefox.com/bike/owners-manuals/3172/sagsetup'],
  ['REI: Mountain bike suspension basics', 'https://www.rei.com/learn/expert-advice/suspension.html'],
  ['Common Core: Reasoning with equations and inequalities (HSA-REI)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Creating equations (HSA-CED)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['OpenStax: Other types of equations', 'https://openstax.org/books/college-algebra-corequisite-support/pages/2-6-other-types-of-equations'],
  ['OpenStax: Linear and absolute value inequalities', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-7-linear-inequalities-and-absolute-value-inequalities']
];

function suspensionPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, h3 } = ctx, W = sagWindow(PRD.stroke);
  return [
      card('Briefing', 'What is sag?',
        el('div', { class: 'ms-brief-grid' },
          el('div', null, P_('Sag is how far your suspension compresses when you sit on the bike in your normal riding position. It’s written as a percentage of the suspension’s total travel.'),
            P_('A mechanic measures it on the shock itself: how far the shaft slides into the body with the rider on board, compared with the shock’s full stroke.')),
          photoFigure({ src: PHOTO('measuring-sag.jpg'), alt: 'A mechanic holding a ruler along a rear shock on a mountain bike frame to measure sag', width: 1200, height: 901, caption: 'Measuring sag: a ruler along the rear shock.' })),
        el('div', { class: 'ls-two' },
          note('key', 'shock stroke ≠ wheel travel', 'The shock stroke is how far the shock itself can compress: 60 mm on this practice bike. Rear-wheel travel is how far the wheel moves, set by the frame’s linkage, and is usually much more. Sag here is measured on the shock.'),
          note('key', 'the practice window', `FOX’s setup guide gives a 25–30% sag range for its FLOAT shock. We use that window with a fictional ${PRD.stroke} mm shock. Real settings vary by bike: this is maths practice, not setup advice.`))),
      card('Module A', 'Solve the sag equation',
        eq('p = s ÷ T × 100', [['p', 'sag percentage (%)'], ['s', 'measured sag (mm)'], ['T', 'total shock stroke (mm), T > 0']]),
        q('m1-rearrange'),
        sim('Sag calculator', sagCalculator(ctx)),
        P_('If the shock has 60 mm of stroke, how many millimetres of compression is 25% sag? Set up 25 = s ÷ 60 × 100 and solve.'),
        q('m1-sag-min'),
        explain('Worked explanation: the 25% boundary', ['25 = s ÷ 60 × 100', '0.25 = s ÷ 60   (divide both sides by 100)', '0.25 × 60 = s   (multiply both sides by 60)', 's = 15 mm'], 'The bottom of the window is 15 mm of sag.'),
        q('m1-sag-max'),
        P_(`So the acceptable range for this scenario is ${nf(W.minMm)}–${nf(W.maxMm)} mm. Move the slider in the calculator to see where 17 mm lands.`),
        q('m1-sag-pct'), q('m1-sag-check'),
        h3('Independent challenge'),
        P_('Change the total shock stroke to 80 mm. The window stays at 25–30% for this practice. Work the range out first, then switch the calculator to 80 mm to check.'),
        q('m1-range-80', { kicker: 'Independent challenge' })),
      card('Module B', 'How close are you to the perfect setup?',
        P_('Sometimes we aren’t looking for one exact measurement. We want a result within an acceptable distance of a target. Absolute value measures distance: |a − b| is how far apart a and b are on the number line, in either direction.'),
        P_('The midpoint of the 25–30% window is (25 + 30) ÷ 2 = 27.5%, and the window reaches 2.5 percentage points either side of it. So the window is:'),
        eq('|p − 27.5| ≤ 2.5', [['p', 'measured sag percentage'], ['27.5', 'midpoint of the window (the target)'], ['2.5', 'largest allowed distance from the target']]),
        sim('Tolerance gauge', toleranceGauge(ctx)),
        q('m1-abs-pick'), q('m1-abs-bounds'), q('m1-abs-direction'),
        explain('Worked explanation: from absolute value to an interval', ['|p − 27.5| ≤ 2.5', '−2.5 ≤ p − 27.5 ≤ 2.5   (within 2.5 either side)', '25 ≤ p ≤ 30   (add 27.5 to every part)', 'interval: [25, 30]   number line: a shaded segment from 25 to 30, both ends included'], 'The same window as before: absolute value inequality, compound inequality, interval and number line all say the same thing.'),
        q('m1-compound'),
        note('key', 'distance, not direction', 'A reading below the target and one above it can be exactly the same distance away. |p − 27.5| only measures how far, never which way.'))
  ];
}

function timingPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_, practiceBox } = ctx, S = raceStage(PRD.stage);
  return [
      card('Race data', null,
        el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, ['Section', 'Distance', 'Average speed'].map(h => el('th', { scope: 'col' }, h)))),
          el('tbody', null, el('tr', null, el('th', { scope: 'row' }, 'Section 1'), el('td', null, `${S.d1} km`), el('td', null, `${S.v1} km/h`)),
            el('tr', null, el('th', { scope: 'row' }, 'Section 2'), el('td', null, `${S.d2} km`), el('td', null, el('span', { class: 'ms-unknown' }, 'v (unknown)'))),
            el('tr', null, el('th', { scope: 'row' }, 'Whole stage'), el('td', null, `${S.total} km`), el('td', null, `target ${S.target} km/h`)))))),
      card('Module A', 'Understand average speed',
        eq('average speed = total distance ÷ total time'),
        P_('Average speed isn’t the average of the speeds. It’s the whole distance divided by the whole time, so work in time first.'),
        q('m2-target-time'), q('m2-time-used'), q('m2-average-trap'),
        sim('Race clock simulator', raceClock(ctx))),
      card('Module B', 'Solve the rational equation',
        P_('Let v be the average speed over the last 3 km. Time for section 1 + time for section 2 = time the target allows:'),
        eq(`${S.d1}/${S.v1} + ${S.d2}/v = ${S.total}/${S.target}`, [['v', 'section 2 speed in km/h; v ≠ 0 (it’s in a denominator), and v > 0 (it’s a speed)']]),
        explain('Worked explanation', ['1/12 + 3/v = 1/4', '3/v = 1/4 − 1/12 = 1/6', 'multiply both sides by 6v (v ≠ 0): 18 = v'], 'Then check: 5 minutes + 10 minutes = 15 minutes for 4 km, which is 16 km/h.'),
        q('m2-solve'), q('m2-check')),
      card('Module C', 'Turn it into an inequality',
        P_('The rider doesn’t need exactly 15 minutes. They need 15 minutes or less:'),
        eq('1/12 + 3/v ≤ 1/4,   v > 0'),
        q('m2-domain'), q('m2-ineq'),
        note('key', 'domain restrictions matter', 'Because v > 0, multiplying by v keeps the inequality’s direction. If v could be negative, the same step would be wrong.')),
      card('Independent challenge', 'A new stage',
        P_('Write the equation, solve it, check it and say what it means, on your own. Hints are there if you need them.'), practiceBox())
  ];
}

function surveyPage(ctx) {
  const { q, card, eq, explain, note, sim, para: P_ } = ctx, V = survey(PRD.survey.a, PRD.survey.c);
  return [
      card('Module A', 'Build the equation',
        P_('The horizontal distance and the elevation change are the two legs of a right triangle. The straight-line distance is the hypotenuse.'),
        eq('a² + b² = c²   →   √(120² + h²) = 125', [['h', 'signed elevation change in metres: + if the destination is higher, − if lower']]),
        q('m3-model'),
        sim('Trail survey simulator', surveyLab(ctx))),
      card('Module B', 'Solve the radical equation',
        explain('Worked explanation', ['√(120² + h²) = 125', '120² + h² = 125²   (square both sides)', '14400 + h² = 15625', 'h² = 1225', 'h = ±35'], 'Both signs: +35 m if the destination is higher, −35 m if it’s lower.'),
        q('m3-solve'), q('m3-why-two')),
      card('Module C', 'Verify your solution',
        P_('Don’t just trust the algebra: put the answer back into the original equation and see if both sides match.'),
        q('m3-verify')),
      card('Algebra debugging challenge', 'The extraneous solution',
        P_('Your trail-mapping console has generated an equation. One of its answers is false. Can you find it?'),
        q('m3-candidates'),
        sim('Candidate checker', algebraDebugger(ctx)),
        q('m3-valid'), q('m3-why-extraneous'),
        note('myth', 'squaring can add answers', 'Every time you square both sides, check every candidate in the original equation. It’s the habit that catches extraneous solutions.'))
  ];
}

const HOOKS = {
  suspension: 'You’ve got a new bike ready for race day, but the suspension setup needs checking. The mechanic needs to measure the sag and decide whether the setup falls inside the specified range. Can you calculate the measurements and verify the setup?',
  timing: (S => `The team has entered an enduro race with a ${S.total} km timed stage. The rider needs an overall average of at least ${S.target} km/h to hit the team’s target time. The first section is done. How fast does the rest have to be?`)(raceStage(PRD.stage)),
  survey: (V => `The trail crew is mapping a new section of technical singletrack. They measured the horizontal distance between two reference points (${V.a} m) and the straight-line distance along a simplified profile (${V.c} m). They don’t know the elevation change h. Your job: work it out.`)(survey(PRD.survey.a, PRD.survey.c))
};
const PAGES = { suspension: suspensionPage, timing: timingPage, survey: surveyPage };

export const LAB = {
  id: ID, title: 'Race-Day Workshop', eventPrefix: 'raceday', rootClass: 'rdw', noun: 'workshop',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 1: Equations and Inequalities',
    lines: ['Your race.', 'Your setup.'], accent: 'Your math.',
    lede: 'You’ve joined the technical crew for an upcoming enduro race. The rider is ready, the bike is almost dialed, and the stage is waiting.',
    body: 'But before the team heads out, there are a few problems to solve. Your job: use mathematics to get the team race-ready.',
    enter: 'Enter the workshop →', back: 'Back to the workshop →',
    meta: '20–25 minutes · three missions and a final certification · progress saves on this device',
    art: () => photoFigure({ src: PHOTO('enduro-rider.jpg'), alt: 'An enduro rider in a full-face helmet riding a rocky line through a pine forest', width: 1280, height: 852, hero: true })
  },
  board: {
    title: 'Race-day prep', hook: 'Three stations. Finish all three to unlock the Race-Day Certification.',
    refsNote: 'The sag window comes from FOX’s setup guide for its FLOAT shock. Every bike, shock and rider is different: this workshop teaches algebra and is not a setup recommendation.',
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id] })),
  practice: { ids: PRACTICE_IDS, count: RACE_PRACTICE.length, questions: practiceQuestions, button: 'New race scenario', note: 'Every scenario uses checked numbers with whole-minute times.' },
  extension: {
    kicker: 'Optional Algebra 2 extension', title: 'The setup that doesn’t exist',
    blurb: 'For students ready for complex numbers: what happens when an equation has no real solution?',
    hook: 'Some equations have no real solution at all. Algebra 2 can still write their solutions down.',
    page: ({ q, card, eq, note, para: P_ }) =>
card(null, null, eq('x² + 16 = 0'), q('ext-solve'),
        P_('There’s no real number that satisfies this equation: a real number squared is never negative. Complex numbers, using i = √−1, let us write the algebraic solutions anyway.'),
        q('ext-meaning'),
        note('key', 'imaginary isn’t physical', 'Imaginary numbers aren’t bike measurements. In a workshop model, complex solutions mean no real-valued setting satisfies that equation.'))
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.sag.length, questions: finalQuestions,
    title: 'Race-Day Certification', blurb: 'One last briefing: suspension, timing and survey, solved on your own.',
    hook: 'The team is almost ready. Can you finish the calculations on your own?',
    lockedHook: 'Finish all three missions to unlock the final briefing.',
    doneShort: 'Race-day ready', doneTitle: 'Race-day ready',
    doneLede: 'Nice work. You’ve used Algebra 2 to solve suspension setup constraints, calculate race performance, and analyze mountain biking terrain.',
    notYet: x => `${x.right} of ${x.total} right this round: not quite race-ready. Look back at the solutions, then try a fresh round with new numbers.`,
    page: ({ q, card, para: P_ }, F, key) => [
      card('Challenge A', 'Suspension setup',
        P_(`A different practice bike has a ${F.set.sag.stroke} mm shock stroke. Use the same 25–30% window.`),
        ['final-a-min', 'final-a-max', 'final-a-abs', 'final-a-eval'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
      card('Challenge B', 'Race timing', q('final-b-speed', { def: F['final-b-speed'], key, kicker: 'Challenge B' })),
      card('Challenge C', 'Trail survey', q('final-c-elev', { def: F['final-c-elev'], key, kicker: 'Challenge C' }))
    ]
  },
  report: { kicker: 'Workshop report' }
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.RaceDayWorkshop = { mount, VERSION };
