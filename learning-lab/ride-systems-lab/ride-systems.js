// The Ride Systems Lab (Mathlete MTB, Algebra 2, Unit 2: Functions). The
// module's public entry point.
//
//   import { mount } from './ride-systems.js';
//   mount(element, { studentId, storage: 'local' | 'memory' | { load, save },
//                    routing: 'hash' | 'memory',
//                    backLink: { href, label }, courseLink: { href, label }, breadcrumb: [{ label, href }],
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: ridesystems:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its four mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, nf } from './logic/questions.js';
import { TRAIL, BASE, BASE_DRIVE, FINAL_SETS, DISTANCES } from './logic/models.js';
import { trailExplorer, domainRangeExplorer, drivetrainSim, transformStudio, workBackward, inverseExplorer, functionMixer } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'ride-systems-lab';
const REFS = [
  ['Common Core: Interpreting Functions (HSF-IF)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['Common Core: Building Functions (HSF-BF)', 'https://www.thecorestandards.org/Math/Content/HSF/BF/'],
  ['OpenStax: Functions and function notation', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-1-functions-and-function-notation'],
  ['OpenStax: Domain and range', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-2-domain-and-range'],
  ['OpenStax: Composition of functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-4-composition-of-functions'],
  ['OpenStax: Transformation of functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-5-transformation-of-functions'],
  ['OpenStax: Inverse functions', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-7-inverse-functions'],
  ['Cycling UK: How do you measure gears on a bike?', 'https://www.cyclinguk.org/cycle-magazine/how-do-you-measure-gears-bike'],
  ['Wahoo: Tire size and wheel circumference', 'https://support.wahoofitness.com/hc/en-us/articles/26243161988882-Tire-Size-Wheel-Circumference-Chart']
];
const D = BASE_DRIVE;

function trailPage({ q, card, eq, note, sim, para: P_, h3, ...ctx }) {
  return [
    card('Briefing', 'Distance in, elevation out',
      P_('Input: distance travelled along the trail. Output: the elevation at that distance.'),
      note('key', 'what makes a function', 'A function is a relationship where each input has exactly one output. On one fixed trail, every distance has exactly one elevation.')),
    card('Module A', 'Function notation',
      eq('E(d) = elevation at distance d', [['E', 'the elevation function'], ['d', 'distance along the trail (km)'], ['E(d)', 'the elevation there (m)']]),
      P_(`Example: E(1.5) = ${nf(TRAIL.at(1.5))}. At 1.5 km along the trail, the rider is ${TRAIL.at(1.5).toLocaleString('en-US')} m above sea level.`),
      sim('GPS trail explorer', trailExplorer(ctx)),
      q('t-eval'), q('t-notation'), q('t-input'), q('t-function')),
    card('Module B', 'Domain and range',
      P_('The domain is the set of all possible inputs. The range is the set of all possible outputs.'),
      eq(`Domain: ${TRAIL.domain[0]} ≤ d ≤ ${TRAIL.domain[1]}   ·   Range: ${TRAIL.range[0]} ≤ E(d) ≤ ${TRAIL.range[1]}`),
      P_('The distance can’t be before the start or past the finish. The elevations run from the lowest to the highest point on the mapped course, which aren’t always the start and the finish.'),
      sim('Domain and range explorer', domainRangeExplorer(ctx)),
      q('t-domain'), q('t-range')),
    card('Module C', 'Function behaviour',
      P_('A function is increasing where its output rises as the input rises (a climb), and decreasing where it falls (a descent). The highest output is the maximum; the lowest is the minimum.'),
      P_('Pine Ridge climbs from 0 to 0.5 km, drops to 1.0 km, climbs again to 1.5 km, and keeps going up and down to the finish. Switch the explorer to “Climbs & descents” to see it.'),
      q('t-increasing'), q('t-max')),
    card('Additional challenge', 'Is the reverse a function?',
      P_('Switch the explorer to Range and press “Test 2,460 m”. The horizontal line crosses the profile more than once.'),
      q('t-hlt'),
      note('key', 'the horizontal line test', 'If a horizontal line crosses a graph more than once, two inputs share an output, so you can’t work backward from the output to one input. You’ll use this in Mission 4.'))
  ];
}

function gearboxPage({ q, card, eq, explain, note, sim, para: P_, ...ctx }) {
  return [
    card('Briefing', 'From the pedals to the dirt',
      P_('A rider pedals the crank. The chain carries that rotation to the rear sprocket, which turns the rear wheel. The wheel turns rotation into forward distance.'),
      P_('Two stages, two functions: cadence → wheel RPM, then wheel RPM → speed. Joining them is function composition.')),
    card('The model', 'Two functions',
      eq(`f(c) = ${nf(D.G)}c`, [['c', 'pedal cadence (RPM)'], ['f(c)', `rear-wheel RPM; G = ${D.front} ÷ ${D.rear} = ${nf(D.G)}`]]),
      eq(`g(w) = (60 × ${D.circumference.toFixed(2)} ÷ 1000)w = ${nf(D.kg)}w`, [['w', 'rear-wheel RPM'], ['g(w)', `speed (km/h), with a ${D.circumference.toFixed(2)} m wheel circumference`]]),
      sim('Drivetrain simulator', drivetrainSim(ctx))),
    card('Module A', 'Composition of functions',
      P_('Composition happens when the output of one function becomes the input of another.'),
      q('g-ratio'), q('g-wheel'), q('g-speed'), q('g-compose'),
      explain('Worked explanation: g(f(c))', [`f(c) = ${nf(D.G)}c`, `g(w) = ${nf(D.kg)}w`, `g(f(c)) = ${nf(D.kg)}(${nf(D.G)}c)`, `S(c) = ${nf(D.k)}c`, `S(80) = ${nf(D.k)} × 80 = ${nf(D.S(80).toFixed(2))} km/h`], 'One function now goes straight from cadence to speed.')),
    card('Module B', 'Order matters',
      eq('(g ∘ f)(c) = g(f(c))'),
      P_('First the wheel RPM, then the speed. The order follows the bike, and the units decide it: f expects a cadence; g expects a wheel RPM.'),
      q('g-order'),
      note('myth', 'same number, wrong meaning', 'Here f(g(c)) even gives the same number, because both stages just multiply. That’s exactly why you check units: a speed in km/h can’t be fed into a function that expects pedal turns.')),
    card('Module C', 'Domain and range of the composite',
      P_(`The model only makes sense for realistic cadences: ${D.domain[0]} ≤ c ≤ ${D.domain[1]} RPM. Outside that, a real rider can’t pedal, or the simplified model stops describing the bike.`),
      q('g-range'), q('g-gear-change'), q('g-circ'))
  ];
}

function transformPage({ q, card, eq, note, sim, para: P_, h3, ...ctx }) {
  return [
    card('Briefing', 'Relative elevation',
      P_(`Mission 3 uses the profile relative to the start: h(d) = E(d) − ${BASE}. So h is 0 at the start and ${nf(TRAIL.range[1] - BASE)} at the high point. The real trail data doesn’t change; only the function we draw.`),
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table rs-data' }, el('caption', { class: 'ls-sr' }, 'Relative elevation'),
        el('thead', null, el('tr', null, el('th', { scope: 'row' }, 'd (km)'), DISTANCES.map(x => el('td', { class: 'ms-mono' }, nf(x))))),
        el('tbody', null, el('tr', null, el('th', { scope: 'row' }, 'h(d) (m)'), DISTANCES.map(x => el('td', { class: 'ms-mono' }, nf(TRAIL.at(x) - BASE))))))),
      q('x-relative')),
    card('The studio', 'Trail transformation studio',
      P_('One control at a time first, then combine them. The pale line is h(d); the bright line is your transformed g(d).'),
      sim('Trail transformation studio', transformStudio(ctx))),
    card('Module A', 'Vertical shifts',
      eq('g(d) = h(d) + k'),
      P_('Adding a constant to the output moves the whole graph up or down without changing its shape. Adding 2,400 m turns relative elevation back into elevation above sea level: E(d) = h(d) + 2400.'),
      q('x-shift-up')),
    card('Module B', 'Vertical stretch and compression',
      eq('g(d) = a·h(d)'),
      P_('If |a| > 1 the graph stretches vertically; if 0 < |a| < 1 it compresses; if a is negative it also reflects across the horizontal axis.'),
      P_('Think of the vertical exaggeration setting in mapping software: bigger makes climbs look more dramatic, smaller flattens them. It changes the display, not the mountain.'),
      q('x-stretch'), q('x-display'), q('x-reflect')),
    card('Module C', 'Horizontal stretch and compression',
      eq('g(d) = h(bd)'),
      P_('If b > 1 the graph compresses horizontally (features arrive sooner); if 0 < b < 1 it stretches. The domain changes too.'),
      q('x-hscale'), q('x-hdomain')),
    card('Module D', 'Horizontal shifts',
      eq('g(d) = h(d − c)'),
      P_('h(d − c) moves the graph right by c; h(d + c) moves it left. It’s a change of where we measure distance from (a coordinate change), not the trail physically moving.'),
      q('x-hshift'), q('x-hshift-peak'),
      note('myth', 'the sign inside feels backwards', 'Inside the brackets, “− 0.5” moves the graph right. g(d) = h(d − 0.5) reaches h’s starting value when d − 0.5 = 0, at d = 0.5.')),
    card('Transformation challenge', 'Match the target',
      P_('The target profile is shifted up and stretched vertically. Work out how from the graph (look at the start and the peak), then set the studio to check.'),
      sim('Target match', transformStudio(ctx, { key: 'studio-target', target: true })),
      q('x-match'))
  ];
}

function reversePage({ q, card, eq, note, sim, para: P_, ...ctx }) {
  const I = TRAIL.inverseOn(1, 1.5);
  return [
    card('Briefing', 'Working backward',
      P_('So far, inputs gave outputs. Now you know the result, a target speed, and want the input: what cadence do you need?')),
    card('Module A', 'Reverse the drivetrain',
      eq(`S(c) = ${nf(D.k)}c   ⇒   S⁻¹(v) = v ÷ ${nf(D.k)}`, [['S⁻¹', 'the inverse: speed in, cadence out (same fixed gear)']]),
      q('r-inverse-formula'), q('r-eval'),
      sim('Work-backward calculator', workBackward(ctx)),
      q('r-verify'), q('r-swap'), q('r-target')),
    card('Module B', 'One-to-one functions',
      P_('An inverse is a function only when every output comes from exactly one input. The horizontal line test checks this: no horizontal line may cross the graph more than once.'),
      q('r-hlt-speed'), q('r-profile')),
    card('Module C', 'Restricting the domain',
      P_(`From 1.0 to 1.5 km the trail climbs steadily: E(1) = ${I.range[0]} m, E(1.5) = ${I.range[1]} m. With straight-line interpolation, E(d) = ${I.formula.y0} + ${nf(I.formula.slope)}(d − 1) on 1 ≤ d ≤ 1.5.`),
      eq(`E⁻¹(y) = 1 + (y − ${I.formula.y0}) ÷ ${nf(I.formula.slope)}`, [['y', `elevation in metres, ${I.range[0]} ≤ y ≤ ${I.range[1]}`]]),
      sim('Inverse trail explorer', inverseExplorer(ctx)),
      q('r-restrict'), q('r-einv'), q('r-einv-domain')),
    card('Important distinction', 'An inverse is not a reciprocal',
      eq('f⁻¹(x) ≠ 1 ÷ f(x)'),
      P_('The −1 on a function means “reverse it”, not “one over it”.'),
      q('r-reciprocal'))
  ];
}

const HOOKS = {
  trail: 'You’ve just downloaded the GPS data from a mountain bike trail. It shows how the elevation changes as the rider travels along it. Your job: understand the mathematical relationship between distance and elevation.',
  gearbox: 'You’re testing a mountain bike drivetrain. How does the rider’s pedalling cadence become actual speed? The drivetrain has two stages, and each stage is a function.',
  transform: 'Your trail mapping software can change how an elevation profile is displayed: move the reference elevation, change the vertical scale, stretch the distance axis. What exactly happens to the function?',
  reverse: 'So far you’ve used inputs to calculate outputs. But what happens when you know the result and want to work backward?'
};
const PAGES = { trail: trailPage, gearbox: gearboxPage, transform: transformPage, reverse: reversePage };

export const LAB = {
  id: ID, title: 'Ride Systems Lab', eventPrefix: 'ridesystems', rootClass: 'rsl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 2: Functions',
    lines: ['The Ride', 'Systems'], accent: 'Lab',
    lede: 'Every ride is a system of inputs, outputs, and relationships. Can you figure out how they all work?',
    body: 'You’ve joined a mountain bike performance engineering team. From analyzing elevation changes to calculating riding speed, your job is to use functions to understand what’s happening.',
    enter: 'Enter the lab →', back: 'Back to the lab →',
    meta: '20–25 minutes · four missions and a final challenge · progress saves on this device',
    art: () => openingArt(D)
  },
  board: {
    title: 'Mission stations', hook: 'Four stations. Finish all four to unlock Engineer the Ride.',
    refsNote: 'The trail profiles are simulated, not surveyed. The drivetrain is an idealized fixed-gear, no-slip model, and 2.30 m is an illustrative wheel circumference.',
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id] })),
  extension: {
    kicker: 'Optional extension · the function mixer', title: 'Combine the ride data',
    blurb: 'Add, subtract, scale and divide functions with a boardwalk over a creek.',
    hook: 'A raised boardwalk crosses a creek. The riding surface is the ground plus the structure: a sum of two functions.',
    page: ({ q, card, sim, note, para: P_, ...ctx }) => [
      card(null, null, P_('Ground: f(x), the height above the creek bed. Structure: b(x), the deck height over the span. Riding surface: T(x) = f(x) + b(x).'),
        sim('Function mixer', functionMixer(ctx)), q('ext-add'), q('ext-divide'),
        note('key', 'domains when you combine', 'The domain of f + b, f − b or f · b is where both are defined. For f ÷ b (or b ÷ f), also leave out every input that makes the denominator zero.'))
    ]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.trails.length, questions: finalQuestions,
    title: 'Engineer the Ride', blurb: 'A new trail, a new drivetrain, a transformation and an inverse, on your own.',
    hook: 'You’ve modelled a trail, analyzed a drivetrain, transformed functions and worked backward. Now put it all together.',
    lockedHook: 'Finish all four missions to unlock Engineer the Ride.',
    doneShort: 'Ride systems engineer', doneTitle: 'Ride systems engineer',
    doneLede: 'Congratulations! You’ve analyzed a trail profile, explored drivetrain relationships, transformed mathematical models, and worked backward through inverse functions.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with a new trail and drivetrain.`,
    page: ({ q, card, para: P_ }, F, key) => {
      const T = F.set.trail, Dv = F.set.drive;
      return [
        card('Challenge A', 'Read the trail: ' + T.name,
          el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table rs-data' }, el('caption', { class: 'ls-sr' }, T.name + ' GPS samples'),
            el('thead', null, el('tr', null, el('th', { scope: 'row' }, 'd (km)'), DISTANCES.map(x => el('td', { class: 'ms-mono' }, nf(x))))),
            el('tbody', null, el('tr', null, el('th', { scope: 'row' }, 'E(d) (m)'), T.ys.map(y => el('td', { class: 'ms-mono' }, String(y))))))),
          P_('Simulated data, straight lines between samples.'),
          ['fa-input', 'fa-eval', 'fa-domain', 'fa-range', 'fa-inc', 'fa-dec'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
        card('Challenge B', 'Build the drivetrain function',
          P_(`${Dv.front}T chainring · ${Dv.rear}T sprocket · ${Dv.circumference.toFixed(2)} m wheel · ${Dv.cadence} RPM.`),
          ['fb-ratio', 'fb-wheel', 'fb-k', 'fb-speed'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
        card('Challenge C', 'Transform the profile', ['fc-parts', 'fc-effect'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' }))),
        card('Challenge D', 'Work backward', ['fd-cadence', 'fd-why'].map(id => q(id, { def: F[id], key, kicker: 'Challenge D' })))
      ];
    }
  },
  report: { kicker: 'Lab report' }
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.RideSystemsLab = { mount, VERSION };
