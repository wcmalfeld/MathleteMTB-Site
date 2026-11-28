// Wrap Lab: the Custom MTB Frame Protection Studio (Mathlete MTB, Algebra 1,
// Polynomials and Factoring). The student designs a frame protection kit at
// the fictional TrailSkin Studio: adding and subtracting panel areas,
// expanding graphics with the area model, optimizing cut sheets by factoring,
// and reverse-engineering panels by factoring quadratics.
//
//   import { mount } from './wrap.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: wraplab:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with the other
// Algebra 1 labs. Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  ADDSUB_PRACTICE, ADDSUB_IDS, addsubPractice, EXPAND_PRACTICE, EXPAND_IDS, expandPractice, CUT_PRACTICE, CUT_IDS, cutPractice, QUAD_PRACTICE, QUAD_IDS, quadPractice } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { MODEL_NOTE, UNIT_NOTE, DOS_NOTE } from './logic/studio.js';
import { tableEl } from '../slope-lab/components/figures.js';
import { tileOrganizer, sorter, negFlip, areaModel, polyGrid, cutOut, gcfBoard, groupingBoard, pairFinder, tileBuilder, designStudio, blueprint } from './components/labs.js';
import { openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '1.0.0';
export const ID = 'wrap-lab';
const REFS = [
  ['Common Core: Arithmetic with Polynomials, add, subtract and multiply polynomials (HSA-APR.A.1)', 'https://www.thecorestandards.org/Math/Content/HSA/APR/'],
  ['Common Core: Seeing Structure in Expressions, factoring and special patterns (HSA-SSE.A.2)', 'https://www.thecorestandards.org/Math/Content/HSA/SSE/'],
  ['OpenStax Elementary Algebra 2e: Add and subtract polynomials', 'https://openstax.org/books/elementary-algebra-2e/pages/6-1-add-and-subtract-polynomials'],
  ['OpenStax Elementary Algebra 2e: Multiply polynomials', 'https://openstax.org/books/elementary-algebra-2e/pages/6-3-multiply-polynomials'],
  ['OpenStax Elementary Algebra 2e: Factor trinomials', 'https://openstax.org/books/elementary-algebra-2e/pages/7-3-factor-trinomials-of-the-form-ax2-bx-c']
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

// ================================================================ Stage 01: Design the Protection Kit
function designPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'wr-d-1', 'Activity 1', 'Classify the design patterns', workbench(ctx, WB('classify')), Pa('You’re the lead pattern designer. Every protective panel card carries an area expression: sort the cards by their number of terms, then classify each by degree and terms.'),
      note('key', 'design units', UNIT_NOTE), sim('Panel card sorter', sorter(ctx)), Qs(ctx, ['cl-1', 'cl-2', 'cl-3', 'cl-4', 'cl-5', 'cl-6', 'cl-np'])),
    act(ctx, 'wr-d-2', 'Activity 2', 'Combine the protection panels', workbench(ctx, WB('add')), eq('A(x) + B(x) = (3x² + 4x + 2) + (2x² + 5x + 1)'), sim('Polynomial tile organizer', tileOrganizer(ctx)), Qs(ctx, ['ad-like', 'ad-1', 'ad-why'])),
    act(ctx, 'wr-d-3', 'Activity 3', 'Calculate remaining material', Pa('The studio’s film stock is S(x) = 8x² + 7x + 5. A batch of panels uses U(x) = 3x² + 2x + 1. Try “Stock − batch” on the tile organizer.'), Q(ctx, 'sb-1')),
    act(ctx, 'wr-d-4', 'Activity 4', 'Distribute the negative', workbench(ctx, WB('subtract')), note('key', 'the big idea', 'Subtracting a polynomial subtracts every term: each sign inside the brackets flips.'), sim('Negative distributor', negFlip(ctx)), Qs(ctx, ['nd-step', 'nd-1', 'nd-2'])),
    act(ctx, 'wr-d-5', 'Activity 5', 'Design your material kit', Pa('A new set of panel cards for the kit: classify, combine, subtract, and say what it means.'), Qs(ctx, ['kd-class', 'kd-add', 'kd-sub', 'kd-mean']),
      writtenResponse(ctx, 'explain-kit', { prompt: 'Explain why (6x² + 5x + 2) − (2x² − 3x + 4) isn’t 4x² + 2x + 6.', sample: 'The minus sign in front of the bracket applies to every term inside it, not just the first. So −(−3x) becomes +3x and −(+4) becomes −4, giving 4x² + 8x − 2.' })),
    act(ctx, 'wr-d-6', 'Independent challenge', 'More panel cards', practiceBox()),
    badgeNote(ctx, 'design')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: Expand the Graphics
function expandPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'wr-e-1', 'Activity 1', 'The area model', workbench(ctx, WB('area')), Pa('The pattern layout is done. Now expand each graphic panel into its sections for production, starting with a panel x + 3 by x + 4.'),
      predict(ctx, 'area', { prompt: 'What do you think the area of an (x + 3) by (x + 4) panel is?', options: [{ id: 'right', text: 'x² + 7x + 12', right: true }, { id: 'no-mid', text: 'x² + 12', right: false }, { id: 'add', text: 'x² + 7x + 7', right: false }],
        reveal: () => [sim('Binomial area model', areaModel(ctx)), Q(ctx, 'am-1')] })),
    act(ctx, 'wr-e-2', 'Activity 2', 'Multiply a monomial by a polynomial', eq('3x(2x + 5) = 3x · 2x + 3x · 5'), Qs(ctx, ['mm-1', 'mm-2', 'mm-3', 'mm-4'])),
    act(ctx, 'wr-e-3', 'Activity 3', 'Multiply two binomials', Pa('The area model is the main method; FOIL (first, outer, inner, last) just names its four regions.'), Qs(ctx, ['bn-four', 'bn-2', 'bn-3'])),
    act(ctx, 'wr-e-4', 'Activity 4', 'Special product: the square of a sum', workbench(ctx, WB('special')), eq('(a + b)² = a² + 2ab + b²'), Pa('Use the area model’s (x + 4)² preset: two identical 4x strips.'), Qs(ctx, ['sq-1', 'sq-why'])),
    act(ctx, 'wr-e-5', 'Activity 5', 'Special product: the difference of squares', eq('(a + b)(a − b) = a² − b²'), note('key', 'the picture', DOS_NOTE), sim('Cut-out square', cutOut(ctx)), Qs(ctx, ['ds-1', 'ds-fit'])),
    act(ctx, 'wr-e-6', 'Activity 6', 'Multiply polynomials with more terms', Pa('A symbolic production model, not a literal area: every term of one polynomial times every term of the other.'), sim('Polynomial multiplication grid', polyGrid(ctx)), Qs(ctx, ['pg-cell', 'pg-1'])),
    act(ctx, 'wr-e-7', 'Activity 7', 'The graphic expansion challenge', tableEl([['2x(x + 3)', '2x² + 6x'], ['(x + 2)(x + 5)', 'x² + 7x + 10'], ['(x + 4)²', 'x² + 8x + 16'], ['(x + 5)(x − 5)', 'x² − 25'], ['(2x + 1)(x + 3)', '2x² + 7x + 3'], ['(x + 2)(x² + 3x + 4)', 'x³ + 5x² + 10x + 8']], ['Expression', 'Expanded']),
      Qs(ctx, ['gx-err', 'gx-miss', 'gx-dos'])),
    act(ctx, 'wr-e-8', 'Independent challenge', 'More graphics orders', practiceBox()),
    badgeNote(ctx, 'expand')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: Optimize the Cut Sheets
function cutsheetPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'wr-c-1', 'Activity 1', 'Find the greatest common factor', workbench(ctx, WB('gcf')), Pa('The production team wants efficient cut sheets: patterns with shared factors can be cut as identical groups. Factoring reverses multiplication.'),
      sim('GCF grouping board', gcfBoard(ctx)), Qs(ctx, ['gc-1', 'gc-1f'])),
    act(ctx, 'wr-c-2', 'Activity 2', 'Factor more complex expressions', Pa('For each: the number GCF, the variable GCF, factor it out, then check by multiplying back.'), Qs(ctx, ['gc-2', 'gc-3', 'gc-4', 'gc-5', 'gc-6'])),
    act(ctx, 'wr-c-3', 'Activity 3', 'Factoring by grouping', workbench(ctx, WB('grouping')), sim('Grouping board', groupingBoard(ctx)), Qs(ctx, ['gp-1', 'gp-2', 'gp-3'])),
    act(ctx, 'wr-c-4', 'Activity 4', 'The grouping workshop', Qs(ctx, ['gw-1', 'gw-2', 'gw-3', 'gw-4', 'gw-none'])),
    act(ctx, 'wr-c-5', 'Activity 5', 'Check the pattern', note('key', 'reverse processes', 'Factoring and expanding undo each other: every factorization can be checked by multiplying back.'), Qs(ctx, ['gc-check', 'ck-1'])),
    act(ctx, 'wr-c-6', 'Independent challenge', 'More cut sheets', practiceBox()),
    badgeNote(ctx, 'cutsheet')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: Reverse Engineer the Panel
function reversePage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'wr-r-1', 'Activity 1', 'Recover the original panel dimensions', workbench(ctx, WB('monic')), Pa('A customer knows a rectangular panel’s area, x² + 7x + 12, but not its dimensions. Factoring recovers them.'), Qs(ctx, ['rv-pair', 'rv-1'])),
    act(ctx, 'wr-r-2', 'Activity 2', 'The factor pair finder', sim('Factor pair finder', pairFinder(ctx)), Qs(ctx, ['fp-1', 'fp-2', 'fp-3', 'fp-4'])),
    act(ctx, 'wr-r-3', 'Activity 3', 'Trinomials with leading coefficients', workbench(ctx, WB('nonmonic')), sim('Quadratic factor builder', tileBuilder(ctx)), Qs(ctx, ['nm-ac', 'nm-split', 'nm-1', 'nm-2', 'nm-3'])),
    act(ctx, 'wr-r-4', 'Activity 4', 'Perfect-square trinomials', workbench(ctx, WB('patterns')), eq('a² + 2ab + b² = (a + b)²\na² − 2ab + b² = (a − b)²'), Qs(ctx, ['ps-1', 'ps-2', 'ps-id'])),
    act(ctx, 'wr-r-5', 'Activity 5', 'Differences of squares', eq('a² − b² = (a + b)(a − b)'), Qs(ctx, ['dsq-1', 'dsq-2', 'dsq-3', 'dsq-4', 'dsq-sum'])),
    act(ctx, 'wr-r-6', 'Activity 6', 'The reverse engineering challenge', Pa('Monic, non-monic, perfect squares, differences of squares, and one that doesn’t factor over the integers. Read the area, factor it, and multiply back.'), Qs(ctx, ['rc-1', 'rc-2', 'rc-3', 'rc-prime', 'rc-dims'])),
    act(ctx, 'wr-r-7', 'Independent challenge', 'More customer panels', practiceBox()),
    badgeNote(ctx, 'reverse')
  ];
  afterRender(); return out;
}

// ================================================================ config
const SECTIONS = {
  design: [['wr-d-1', 'Classify the patterns'], ['wr-d-2', 'Combine the panels'], ['wr-d-3', 'Remaining material'], ['wr-d-4', 'Distribute the negative'], ['wr-d-5', 'Material kit'], ['wr-d-6', 'More panel cards']],
  expand: [['wr-e-1', 'Area model'], ['wr-e-2', 'Monomial × polynomial'], ['wr-e-3', 'Two binomials'], ['wr-e-4', 'Square of a sum'], ['wr-e-5', 'Difference of squares'], ['wr-e-6', 'More terms'], ['wr-e-7', 'Expansion challenge'], ['wr-e-8', 'More orders']],
  cutsheet: [['wr-c-1', 'Greatest common factor'], ['wr-c-2', 'More complex GCFs'], ['wr-c-3', 'Grouping'], ['wr-c-4', 'Grouping workshop'], ['wr-c-5', 'Check the pattern'], ['wr-c-6', 'More cut sheets']],
  reverse: [['wr-r-1', 'Recover dimensions'], ['wr-r-2', 'Factor pair finder'], ['wr-r-3', 'Leading coefficients'], ['wr-r-4', 'Perfect squares'], ['wr-r-5', 'Differences of squares'], ['wr-r-6', 'Reverse engineering'], ['wr-r-7', 'More panels']]
};
const WRITTEN = { 'explain-kit': 'Why the negative is distributed', 'cert-explain': 'Certification: why multiplying back checks a factorization' };
const KINDS = questionKinds();
const HOOKS = {
  design: 'You’re the lead pattern designer: classify the panel cards, combine panel areas and work out the film that’s left.',
  expand: 'The layout’s done. Expand each graphic panel into its sections with the area model, ready for production.',
  cutsheet: 'Optimize the cut sheets: find the shared factors and repeated patterns, and check every one by multiplying back.',
  reverse: 'A customer has the panel areas but lost the dimensions. Factor the area polynomials to recover them.'
};
const PAGES = { design: designPage, expand: expandPage, cutsheet: cutsheetPage, reverse: reversePage };
const practiceFor = {
  design: { ids: ADDSUB_IDS, count: ADDSUB_PRACTICE.length, questions: addsubPractice, button: 'New panel cards', note: 'Add them, then subtract.', kicker: 'Independent challenge' },
  expand: { ids: EXPAND_IDS, count: EXPAND_PRACTICE.length, questions: expandPractice, button: 'New order', note: 'A binomial product and a special product.', kicker: 'Independent challenge' },
  cutsheet: { ids: CUT_IDS, count: CUT_PRACTICE.length, questions: cutPractice, button: 'New cut sheet', note: 'A GCF and a grouping job.', kicker: 'Independent challenge' },
  reverse: { ids: QUAD_IDS, count: QUAD_PRACTICE.length, questions: quadPractice, button: 'New customer', note: 'A monic and a non-monic trinomial.', kicker: 'Independent challenge' }
};
const certified = P => !!P.getData('certified', null);
// Common slips the report counts (PRD 21).
const SLIPS = { sign: ['negative-first-only', 'added-instead', 'sign', 'dos-sign'], multiply: ['distribute-one', 'foil-missing', 'foil-add', 'square-no-middle', 'single-middle'], gcf: ['partial-gcf', 'incomplete-gcf'], factoring: ['pair-sum-only', 'pair-product-only', 'non-monic-error', 'middle-term', 'not-fully-factored', 'always-factors', 'sum-of-squares', 'grouping-no-common'] };
function slipCounts(P) {
  const out = { sign: 0, multiply: 0, gcf: 0, factoring: 0 };
  for (const r of Object.values(P.state.questions)) for (const c of r.codes || (r.code ? [r.code] : []) ) for (const [g, cs] of Object.entries(SLIPS)) if (cs.includes(c)) out[g]++;
  return out;
}

export const LAB = {
  id: ID, title: 'Wrap Lab', eventPrefix: 'wraplab', rootClass: 'wrp mtl dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Polynomials and Factoring',
    lines: ['Wrap'], accent: 'Lab',
    lede: 'Design it. Expand it. Factor it. Make it yours.',
    body: 'Welcome to TrailSkin Studio. You’ve been hired to help create custom frame protection kits for some of the coolest mountain bikes on the planet. Your customers want bikes that look incredible and stay protected from scratches, rock strikes and trail abrasion. You’ll design the protective panels, work with the material dimensions, optimize your cut sheets and discover the mathematics behind the patterns: from an empty bike frame to a finished custom protection kit. Let’s get designing.',
    enter: 'Enter the design studio →', back: 'Back to the design studio →',
    meta: 'The Custom MTB Frame Protection Studio · 40–55 minutes · four stages and the Custom Frame Designer Certification · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'The design studio', hook: 'Four stages, one custom kit. Each earns a badge; all four unlock the Custom Frame Designer Certification.',
    extra: ctx => el('div', null, designStudio(ctx, MISSION_LIST), sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS })), refsNote: MODEL_NOTE, refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: { kicker: 'Your kit', title: 'Custom MTB Armor Blueprint', blurb: 'Your bike, coverage and pattern, with the polynomial areas, expansions, factorizations and material summary.', hook: 'Name your kit and see the whole design, maths included.', page: ctx => [ctx.card(null, null, blueprint(ctx, MISSION_LIST, certified(ctx.progress)))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'Custom Frame Designer Certification', blurb: 'Twelve new questions across all four topics, on your own.',
    hook: 'A new customer, new panels: classify, combine, expand, factor, and recover dimensions. Multiply back to check.',
    lockedHook: 'Earn all four stage badges to unlock the Custom Frame Designer Certification.',
    doneShort: 'Certified frame designer', doneTitle: 'Certified MTB Frame Designer',
    doneLede: 'You classified, combined and subtracted panel areas, expanded graphics with the area model, optimized cut sheets by factoring, and recovered panel dimensions from their area polynomials.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new numbers.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      card('Part A', 'Adding and subtracting polynomials', A('fa-class'), A('fa-add'), A('fa-sub')),
      card('Part B', 'Multiplying polynomials', A('fb-mono'), A('fb-bin'), A('fb-poly')),
      card('Part C', 'Factoring expressions', A('fc-gcf'), A('fc-group')),
      card('Part D', 'Factoring quadratics', A('fd-monic'), A('fd-nonmonic'), A('fd-special'), A('fd-prime'),
        writtenResponse(ctx, 'cert-explain', { prompt: 'In a sentence or two: how does multiplying back prove a factorization is right?', sample: 'Factoring and multiplying undo each other, so if the factors multiply back to exactly the original polynomial, they are a correct factorization; if any term differs, something is wrong.' })),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'See your Custom MTB Armor Blueprint →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The four topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'Next in Algebra 1: Quadratic functions and equations.', park: null, retryLabel: 'Retry certification', buttons: { view: ['View my custom kit', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => ({ badges: [...earnedBadges(P, MISSION_LIST)], kit: (P.getData('studio', {}) || {}).kit || null, zones: ((P.getData('studio', {}) || {}).zones || ['top', 'down']).length, slips: slipCounts(P) }),
  stats: s => [['Badges', `${(s.badges || []).length} of 4`], ['Zones covered', `${s.zones || 0} of 6`], ['Sign-distribution slips', String((s.slips || {}).sign || 0)], ['Multiplication slips', String((s.slips || {}).multiply || 0)], ['GCF slips', String((s.slips || {}).gcf || 0)], ['Factoring slips', String((s.slips || {}).factoring || 0)]]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }
if (typeof window !== 'undefined') window.WrapLab = { mount, VERSION };
