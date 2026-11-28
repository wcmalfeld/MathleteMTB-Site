// Project Evolve: the MTB Innovation Lab (Mathlete MTB, Algebra 1, Exponents
// and Exponential Relationships). The student joins the fictional Northline
// Cycles team developing Project Switchback, a gravity bike: exponent rules
// in the prototype lab, scientific notation in the test lab, exponential
// growth at the launch, and exponential decay in the used market.
//
//   import { mount } from './evolve.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: evolve:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with the other
// Algebra 1 labs. No logarithms anywhere: targets come from tables and graphs.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  RULE_PRACTICE, RULE_PRACTICE_IDS, rulePractice, SCI_PRACTICE, SCI_PRACTICE_IDS, sciPractice, GROWTH_PRACTICE, GROWTH_PRACTICE_IDS, growthPractice, DECAY_PRACTICE, DECAY_PRACTICE_IDS, decayPractice } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { DATA_NOTE, TEST_NOTE, MEASURE_NOTE, LAUNCH_NOTE, MARKET_NOTE, LIMITS, PHOTOS } from './logic/product.js';
import { tableEl } from '../slope-lab/components/figures.js';
import { figure, cadLab, factorBoard, precisionScale, testRig, converter, magnitudes, growthTracker, resaleSim, dashboard, lifecycleReport } from './components/labs.js';
import { bikeArt, openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '1.0.0';
export const ID = 'project-evolve';
const REFS = [
  ['Common Core: Grade 8 Expressions and Equations, integer exponents and scientific notation (8.EE.A)', 'https://www.thecorestandards.org/Math/Content/8/EE/'],
  ['Common Core: Linear, Quadratic and Exponential Models (HSF-LE.A.1, A.2, B.5)', 'https://www.thecorestandards.org/Math/Content/HSF/LE/'],
  ['Common Core: Interpreting Functions, percent rate of change (HSF-IF.C.8b)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['OpenStax Elementary Algebra 2e: Use multiplication properties of exponents', 'https://openstax.org/books/elementary-algebra-2e/pages/6-2-use-multiplication-properties-of-exponents'],
  ['OpenStax Elementary Algebra 2e: Integer exponents and scientific notation', 'https://openstax.org/books/elementary-algebra-2e/pages/6-5-integer-exponents-and-scientific-notation']
];

let MISSION_LIST = [];
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
const Q = (ctx, id, o = {}) => ctx.q(id, o);
const Qs = (ctx, ids, o) => ids.map(id => Q(ctx, id, o));
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, 'Finish every question in this stage (including the independent challenge) to earn the ', el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
const WB = k => WORKBENCH[k];
const scene = stage => el('div', { class: 'pev-scene' }, bikeArt(stage, true));
const photo = k => { const X = PHOTOS[k]; return el('figure', { class: 'pev-photo' }, el('img', { src: X.src, alt: X.alt, width: X.w, height: X.h, loading: 'lazy', onerror: e => { e.target.closest('figure').remove(); } }), el('figcaption', { class: 'ls-small' }, X.caption)); };

// ================================================================ Stage 01: Prototype Design Lab
function prototypePage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ev-p-1', 'Activity 1', 'Understand exponents', photo('cad'), scene('prototype'), workbench(ctx, WB('exps')),
      Pa('Welcome to the product design team. Your first job: the maths behind component scaling in the CAD models. Start with the calibration block.'),
      sim('CAD scaling lab', cadLab(ctx)), Qs(ctx, ['pr-cube', 'pr-base', 'pr-x3', 'pr-53'])),
    act(ctx, 'ev-p-2', 'Activity 2', 'The product rule', workbench(ctx, WB('product')),
      predict(ctx, 'product', { prompt: 'Two scale factors in the model: x³ × x². What do you think it simplifies to?', options: [{ id: 'x5', text: 'x⁵', right: true }, { id: 'x6', text: 'x⁶', right: false }, { id: '2x5', text: '2x⁵', right: false }],
        reveal: () => [eq('aᵐ × aⁿ = aᵐ⁺ⁿ'), sim('Factor board', factorBoard(ctx)), Qs(ctx, ['pp-1', 'pp-2', 'pp-3', 'pp-4', 'pp-diff', 'pp-coef'])] })),
    act(ctx, 'ev-p-3', 'Activity 3', 'The quotient rule', workbench(ctx, WB('quotient')), eq('aᵐ / aⁿ = aᵐ⁻ⁿ   (a ≠ 0)'), Pa('Use the factor board’s Quotient setting to watch common factors cancel.'), Qs(ctx, ['pq-cancel', 'pq-1', 'pq-2', 'pq-3', 'pq-4'])),
    act(ctx, 'ev-p-4', 'Activity 4', 'Power of a power', workbench(ctx, WB('powpow')), eq('(aᵐ)ⁿ = aᵐⁿ'), Qs(ctx, ['ppw-1', 'ppw-2', 'ppw-3'])),
    act(ctx, 'ev-p-5', 'Activity 5', 'Power of a product', workbench(ctx, WB('powprod')), eq('(ab)ⁿ = aⁿbⁿ'), Pa('Back to the calibration block, now with edge 2x: (2x)³ = (2x)(2x)(2x).'), Qs(ctx, ['ppr-1', 'ppr-2', 'ppr-3', 'ppr-4'])),
    act(ctx, 'ev-p-6', 'Activity 6', 'Zero exponents', workbench(ctx, WB('zero')), eq('a⁰ = 1   (a ≠ 0)'), Qs(ctx, ['z-1', 'z-2', 'z-3x', 'z-00'])),
    act(ctx, 'ev-p-7', 'Activity 7', 'Negative exponents', workbench(ctx, WB('negative')), note('key', 'the big idea', 'A negative exponent means a reciprocal, not a negative value.'),
      sim('Precision scale', precisionScale(ctx)), Qs(ctx, ['n-1', 'n-2', 'n-3', 'n-4', 'n-5', 'n-6', 'n-den'])),
    act(ctx, 'ev-p-8', 'Activity 8', 'The prototype design challenge', tableEl([['x² × x³', 'x⁵'], ['x⁶ / x²', 'x⁴'], ['(x²)³', 'x⁶'], ['(2x)³', '8x³'], ['(3a)²', '9a²'], ['7⁰', '1'], ['x⁻²', '1/x²'], ['10⁻³', '0.001']], ['Expression', 'Simplified']),
      Pa('Name the law behind each simplification, then evaluate.'), Qs(ctx, ['ch-law-1', 'ch-law-2', 'ch-law-3', 'ch-103', 'ch-70']),
      writtenResponse(ctx, 'explain-law', { prompt: 'Explain why x³ × x² is x⁵ but (x³)² is x⁶.', sample: 'x³ × x² is three x’s times two more x’s, five factors in all, so the exponents add. (x³)² is two copies of x³, which is 3 + 3 = 6 factors, so the exponents multiply.' })),
    act(ctx, 'ev-p-9', 'Independent challenge', 'More CAD expressions', practiceBox()),
    badgeNote(ctx, 'prototype')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: Engineering Test Lab
function testlabPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ev-t-1', 'Activity 1', 'The massive test dataset', photo('rig'), workbench(ctx, WB('sci')), Pa('The prototype is assembled and clamped into the test rig. Its sensors stream readings for the whole test.'), note('key', 'fictional test', TEST_NOTE),
      sim('Sensor reading counter', testRig(ctx)), Qs(ctx, ['tl-count', 'tl-sci', 'tl-why'])),
    act(ctx, 'ev-t-2', 'Activity 2', 'Tiny measurements', note('key', 'classroom values', MEASURE_NOTE), Qs(ctx, ['tl-small-1', 'tl-small-2', 'tl-larger'])),
    act(ctx, 'ev-t-3', 'Activity 3', 'The scientific notation converter', eq('a × 10ⁿ,   1 ≤ |a| < 10'), sim('Converter', converter(ctx)),
      tableEl([['20,160,000', '2.016 × 10⁷'], ['350,000', '3.5 × 10⁵'], ['0.0000045', '4.5 × 10⁻⁶'], ['0.00000072', '7.2 × 10⁻⁷']], ['Standard', 'Scientific']), Qs(ctx, ['cv-1', 'cv-2', 'cv-3', 'cv-4'])),
    act(ctx, 'ev-t-4', 'Activity 4', 'Multiplication', photo('dyno'), workbench(ctx, WB('sciops')), eq('(3.0 × 10⁵)(2.0 × 10³)'), Qs(ctx, ['mu-coef', 'mu-exp', 'mu-ans', 'mu-2'])),
    act(ctx, 'ev-t-5', 'Activity 5', 'Division', Pa('The test data is split into 4.0 × 10² equal files.'), Qs(ctx, ['dv-1', 'dv-std', 'dv-2', 'tl-double'])),
    act(ctx, 'ev-t-6', 'Activity 6', 'Compare engineering measurements', workbench(ctx, WB('compare')), sim('Measurement comparison', magnitudes(ctx)), Qs(ctx, ['cmp-1', 'cmp-2', 'cmp-3', 'cmp-units'])),
    act(ctx, 'ev-t-7', 'Activity 7', 'The engineering test challenge', Qs(ctx, ['tc-1', 'tc-2', 'tc-3', 'tc-4'])),
    act(ctx, 'ev-t-8', 'Independent challenge', 'More test files', practiceBox()),
    badgeNote(ctx, 'testlab')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: Product Launch
function launchPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ev-l-1', 'Activity 1', 'The launch waitlist', photo('launch'), workbench(ctx, WB('growth')),
      Pa('Project Switchback is ready. Ambassador announcements, teaser videos and beta registrations start the early-access waitlist at 500 riders, growing 20% each month.'), note('key', 'a simplified model', LAUNCH_NOTE),
      eq('N(t) = 500(1.20)ᵗ', [['N', 'estimated waitlist'], ['t', 'months'], ['500', 'initial riders'], ['1.20', 'growth factor (20% rate)']]), Qs(ctx, ['gw-factor', 'gw-model', 'gw-500'])),
    act(ctx, 'ev-l-2', 'Activity 2', 'Build the growth table', Qs(ctx, ['gw-table', 'gw-n3', 'gw-people'])),
    act(ctx, 'ev-l-3', 'Activity 3', 'Linear or exponential?', workbench(ctx, WB('linexp')),
      predict(ctx, 'month4', { prompt: 'Campaign A adds 100 riders a month; Campaign B grows 20% a month. Both start at 500. Which is bigger at month 4?', options: [{ id: 'a', text: 'A (linear)', right: false }, { id: 'b', text: 'B (exponential)', right: true }, { id: 'same', text: 'They’re equal', right: false }],
        reveal: () => [Qs(ctx, ['lv-l4', 'lv-n4', 'lv-table', 'lv-graph', 'lv-words', 'lv-why'])] })),
    act(ctx, 'ev-l-4', 'Activity 4', 'Identify the growth factor', Pa('Three more campaigns. For each: the initial value, the growth factor and the growth rate.'), Qs(ctx, ['gf-1', 'gf-2', 'gf-3'])),
    act(ctx, 'ev-l-5', 'Activity 5', 'Write your own growth model', Qs(ctx, ['wm-a', 'wm-b', 'wm-c', 'wm-d'])),
    act(ctx, 'ev-l-6', 'Activity 6', 'The launch momentum simulator', sim('Launch growth tracker', growthTracker(ctx))),
    act(ctx, 'ev-l-7', 'Independent challenge', 'More campaigns', practiceBox()),
    badgeNote(ctx, 'launch')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: The Used Market
function marketPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ev-m-1', 'Activity 1', 'The starting value', scene('market'), workbench(ctx, WB('decay')),
      Pa('The bike has been released. As a used-market analyst, model how its value changes as it ages: a $6,000 build that keeps 80% of its modeled value each year.'), note('myth', 'a classroom model', MARKET_NOTE),
      eq('V(t) = 6000(0.80)ᵗ', [['V', 'modeled value'], ['t', 'age in years'], ['0.80', 'retention factor'], ['20%', 'yearly decrease']]), Qs(ctx, ['dk-factor', 'dk-model', 'dk-meaning'])),
    act(ctx, 'ev-m-2', 'Activity 2', 'Build the depreciation table', Qs(ctx, ['dk-table', 'dk-v3'])),
    act(ctx, 'ev-m-3', 'Activity 3', 'Linear vs exponential decay', Qs(ctx, ['ld-l3', 'ld-5', 'ld-shape', 'ld-which'])),
    act(ctx, 'ev-m-4', 'Activity 4', 'When does it reach a target?', workbench(ctx, WB('target')), note('key', 'tables, not formulas', 'Estimate the crossing from a table, repeated substitution or a graph.'),
      tableEl([0, 1, 2, 3, 4, 5].map(t => [t, ['$6,000', '$4,800', '$3,840', '$3,072', '$2,457.60', '$1,966.08'][t]]), ['Year', 'Modeled value']), Qs(ctx, ['tg-between', 'tg-first', 'tg-exact'])),
    act(ctx, 'ev-m-5', 'Activity 5', 'Change the depreciation rate', sim('Resale value simulator', resaleSim(ctx)), Qs(ctx, ['rc-keep', 'rc-3000', 'rc-more'])),
    act(ctx, 'ev-m-6', 'Activity 6', 'Real-world model limitations', Pa('Real used-bike prices depend on much more than age:'), el('ul', { class: 'pev-limits' }, LIMITS.map(x => el('li', null, x))), Qs(ctx, ['lim-1', 'lim-2']),
      writtenResponse(ctx, 'explain-limits', { prompt: 'Why is the 20% model useful even though it won’t predict a real sale price?', sample: 'It shows how a repeated percentage decrease works: each year the bike loses 20% of what it was worth the year before, so it falls by less each year. Real prices also depend on condition, maintenance and demand, so the model is an estimate, not a valuation.' })),
    act(ctx, 'ev-m-7', 'Independent challenge', 'More listings', practiceBox()),
    badgeNote(ctx, 'market')
  ];
  afterRender(); return out;
}

// ================================================================ config
const SECTIONS = {
  prototype: [['ev-p-1', 'Understand exponents'], ['ev-p-2', 'Product rule'], ['ev-p-3', 'Quotient rule'], ['ev-p-4', 'Power of a power'], ['ev-p-5', 'Power of a product'], ['ev-p-6', 'Zero exponents'], ['ev-p-7', 'Negative exponents'], ['ev-p-8', 'Design challenge'], ['ev-p-9', 'More expressions']],
  testlab: [['ev-t-1', 'Massive dataset'], ['ev-t-2', 'Tiny measurements'], ['ev-t-3', 'Converter'], ['ev-t-4', 'Multiplication'], ['ev-t-5', 'Division'], ['ev-t-6', 'Compare measurements'], ['ev-t-7', 'Test challenge'], ['ev-t-8', 'More test files']],
  launch: [['ev-l-1', 'Launch waitlist'], ['ev-l-2', 'Growth table'], ['ev-l-3', 'Linear or exponential?'], ['ev-l-4', 'Growth factor'], ['ev-l-5', 'Write your own'], ['ev-l-6', 'Momentum simulator'], ['ev-l-7', 'More campaigns']],
  market: [['ev-m-1', 'Starting value'], ['ev-m-2', 'Depreciation table'], ['ev-m-3', 'Linear vs exponential'], ['ev-m-4', 'Target value'], ['ev-m-5', 'Change the rate'], ['ev-m-6', 'Model limitations'], ['ev-m-7', 'More listings']]
};
const WRITTEN = { 'explain-law': 'Product rule vs power of a power', 'explain-limits': 'Why the model is still useful', 'cert-explain': 'Certification: linear vs exponential' };
const KINDS = questionKinds();
const HOOKS = {
  prototype: 'Join the product design team: the maths of component scaling, from the calibration block to negative exponents.',
  testlab: 'The prototype is on the test rig. Make sense of enormous datasets and microscopic measurements with scientific notation.',
  launch: 'Launch day is coming. Model the growing early-access waitlist, and see why percentage growth beats steady growth.',
  market: 'The bike is out in the world. Track its modeled resale value as it ages, and estimate when it crosses a target.'
};
const PAGES = { prototype: prototypePage, testlab: testlabPage, launch: launchPage, market: marketPage };
function withFigs(set) { for (const v of Object.values(set)) if (v && v.fig && !v.figure) v.figure = () => figure(v.fig); return set; }
withFigs(QUESTIONS);
const practiceFor = {
  prototype: { ids: RULE_PRACTICE_IDS, count: RULE_PRACTICE.length, questions: n => withFigs(rulePractice(n)), button: 'New expressions', note: 'Product or quotient, a power rule, and a negative exponent.', kicker: 'Independent challenge' },
  testlab: { ids: SCI_PRACTICE_IDS, count: SCI_PRACTICE.length, questions: n => withFigs(sciPractice(n)), button: 'New test file', note: 'Convert, then compute.', kicker: 'Independent challenge' },
  launch: { ids: GROWTH_PRACTICE_IDS, count: GROWTH_PRACTICE.length, questions: n => withFigs(growthPractice(n)), button: 'New campaign', note: 'Write the model, then evaluate it.', kicker: 'Independent challenge' },
  market: { ids: DECAY_PRACTICE_IDS, count: DECAY_PRACTICE.length, questions: n => withFigs(decayPractice(n)), button: 'New listing', note: 'Write the model, then find the target year from a table.', kicker: 'Independent challenge' }
};
const certified = P => !!P.getData('certified', null);

export const LAB = {
  id: ID, title: 'Project Evolve', eventPrefix: 'evolve', rootClass: 'pev mtl dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Exponents and Exponential Relationships',
    lines: ['Project'], accent: 'Evolve',
    lede: 'Design it. Test it. Launch it. Track its life.',
    body: 'Welcome to Northline Cycles. You’re joining the team behind our next-generation gravity mountain bike, and your mission is to help us develop Project Switchback. You’ll begin in the prototype lab, where you’ll learn the mathematics behind dimensions and scaling. Then you’ll enter the engineering test lab, analyze enormous datasets and microscopic measurements, prepare the product launch and track how the bike’s modeled market value changes over time. Let’s build something worth riding.',
    enter: 'Enter the innovation lab →', back: 'Back to the innovation lab →',
    meta: 'The MTB Innovation Lab · 35–50 minutes · four stages and the MTB Product Innovation Certification · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'The innovation lab', hook: 'Four stages, one bike. Each earns a badge; all four unlock the MTB Product Innovation Certification.',
    extra: ctx => el('div', null, dashboard(ctx, MISSION_LIST), sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS })), refsNote: DATA_NOTE + ' ' + MARKET_NOTE, refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: { kicker: 'Your project', title: 'Product Lifecycle Report', blurb: 'Your bike from prototype to used market: the expressions, test results, launch model and value model.', hook: 'Everything you worked out, in one report. Name your project.', page: ctx => [ctx.card(null, null, lifecycleReport(ctx, MISSION_LIST, certified(ctx.progress)))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: r => withFigs(finalQuestions(r)),
    title: 'MTB Product Innovation Certification', blurb: 'Twelve new questions, three per topic, on your own.',
    hook: 'A new product cycle: simplify the design expressions, process the test data, model the launch and the used market.',
    lockedHook: 'Earn all four stage badges to unlock the MTB Product Innovation Certification.',
    doneShort: 'Certified innovation engineer', doneTitle: 'Certified MTB Product Innovation Engineer',
    doneLede: 'You simplified expressions with the exponent rules, handled huge and tiny measurements in scientific notation, and modeled a launch’s growth and a bike’s decay in value.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new numbers.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      card('Part A', 'Exponent rules', A('fa-simplify'), A('fa-law'), A('fa-negative')),
      card('Part B', 'Scientific notation', A('fb-convert'), A('fb-op'), A('fb-compare')),
      card('Part C', 'Exponential growth', A('fc-model'), A('fc-eval'), A('fc-linexp')),
      card('Part D', 'Exponential decay', A('fd-model'), A('fd-eval'), A('fd-target'),
        writtenResponse(ctx, 'cert-explain', { prompt: 'In a sentence or two: how can you tell from a table whether a model is linear or exponential?', sample: 'If the same amount is added each step, the differences are equal and it’s linear. If each value is the previous one times the same factor, the ratios are equal and it’s exponential.' })),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'See your Product Lifecycle Report →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The four topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'Next in Algebra 1: Polynomials and factoring.', park: null, retryLabel: 'Retry certification', buttons: { view: ['View project report', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => ({ badges: [...earnedBadges(P, MISSION_LIST)], named: !!(P.getData('projectName', '') || '').trim() }),
  stats: s => [['Badges', `${(s.badges || []).length} of 4`], ['Project named', s.named ? 'yes' : 'not yet']]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }
if (typeof window !== 'undefined') window.ProjectEvolve = { mount, VERSION };
