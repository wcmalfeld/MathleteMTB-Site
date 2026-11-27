// The Dream Line Goes Pro (Mathlete MTB, Algebra 1, Unit 2: Solving
// Equations and Inequalities). The module's public entry point.
//
//   import { mount } from './goes-pro.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: goespro:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and continues Unit 1 (The
// Dream Line Project): the student's Unit 1 park is read (never changed) and
// shown as this unit's project; Unit 2 keeps its own progress. Students who
// skipped Unit 1 get a starter park. Shared pieces (park map, workbench,
// prediction-first, tutor panel, report blocks) come from the Unit 1 lab, so
// both units look and work the same.

import { el, put, button } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { solve, setText } from '../lesson-kit/equation.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS, DESIGNS,
  ONE_PRACTICE, ONE_PRACTICE_IDS, onePractice, MULTI_PRACTICE, MULTI_PRACTICE_IDS, multiPractice, BOTH_PRACTICE, BOTH_PRACTICE_IDS, bothPractice,
  FORMULA_PRACTICE, FORMULA_PRACTICE_IDS, formulaPractice, INEQ_PRACTICE, INEQ_PRACTICE_IDS, ineqPractice } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { loadProject, projectSummary, FICTION_NOTE, SAG_NOTE, GRADE_NOTE } from './logic/project.js';
import { parkMap } from '../dream-line-project/components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, jump, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';
import { equationSolver, numberLine, substitutionChecker, budgetTracker, packageVisual, designShowdown, trailTimeTool, gradeProfile, shockTool, rearrangeStudio, flipDemo, approvalBoard } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'dream-line-goes-pro';
const REFS = [
  ['Common Core: Reasoning with Equations and Inequalities (HSA-REI.A, B)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Creating Equations, including rearranging formulas (HSA-CED.A.4)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['Common Core: Expressions and Equations, grade 8 (8.EE.C.7: one, none or infinitely many solutions)', 'https://www.thecorestandards.org/Math/Content/8/EE/'],
  ['OpenStax Elementary Algebra 2e: Solve equations with variables and constants on both sides', 'https://openstax.org/books/elementary-algebra-2e/pages/2-3-solve-equations-with-variables-and-constants-on-both-sides'],
  ['OpenStax Elementary Algebra 2e: Solve linear inequalities', 'https://openstax.org/books/elementary-algebra-2e/pages/2-7-solve-linear-inequalities'],
  ['FOX: suspension setup guides (always follow your own manufacturer’s guidance)', 'https://tech.ridefox.com/']
];

let PROJECT = loadProject({ storage: 'memory' }), MISSION_LIST = [];
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
const BADGES = MISSIONS.map(m => ({ mission: m.id, name: m.badge }));
const badgeRow = earned => el('ul', { class: 'dl-badges', 'aria-label': 'Stage badges' }, BADGES.map((b, i) => el('li', { class: 'dl-badge' + (earned.has(b.mission) ? ' is-earned' : '') },
  el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, earned.has(b.mission) ? '★' : '☆'), el('span', null, el('b', null, b.name), el('span', { class: 'ls-small' }, ' · Stage ' + (i + 1))))));
const W = k => WORKBENCH[k];
// Any question: the kit's ask(), or one of this lab's own (solver, number line).
function Q(ctx, id, o = {}) {
  const def = o.def || QUESTIONS[id];
  if (def.type === 'solver') return equationSolver(ctx, id, def, o);
  if (def.type === 'numberline') return numberLine(ctx, id, def, o);
  return ctx.q(id, o);
}
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, 'Finish every question in this stage (including the independent challenge) to earn the ', el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
function projectMini(ctx, o = {}) {
  const P = ctx.progress, park = PROJECT.park, X = projectSummary(park), name = P.getData('projectName', '') || park.name || 'My Dream Line Park';
  return el('section', { class: 'ls-card dl-mini' },
    el('div', { class: 'dl-mini-map' }, parkMap(park, { label: `${name}: ${X.env}, ${X.features} features.` })),
    el('div', { class: 'dl-mini-text' }, el('p', { class: 'ls-kicker' }, o.kicker || 'Your park project'), el('h2', { class: 'ls-h3 dl-mini-h' }, name),
      el('p', { class: 'ls-small' }, `${X.env} · ${X.features} features (${X.jumps} jumps, ${X.flow} flow features${X.wood ? ', ' + X.wood + ' wooden' : ''}) · ${PROJECT.fromUnit1 ? 'brought forward from Unit 1' : 'starter project'}`),
      el('p', { class: 'dl-plan-eq dl-plan-eq--sm' }, X.plan.expression), o.badges === false ? null : badgeRow(earnedBadges(P, MISSION_LIST))));
}

// ================================================================ Stage 01: The Setup Garage
function garagePage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox } = ctx;
  const out = [
    projectMini(ctx, { badges: false }),
    act(ctx, 'gp-g-1', 'Activity 1', 'The Missing Measurement Board', workbench(ctx, W('inverse')),
      Pa('Several riders are prepping for a big freeride session, but the workshop setup sheets have missing values. Each problem is an equation on a balance: choose the operation that isolates x.'),
      note('key', 'keep it balanced', 'Whatever operation you perform on one side of an equation, you must perform on the other side as well.'),
      predict(ctx, 'undo-8', { prompt: 'Problem A is x + 8 = 23. Which operation undoes the + 8?', options: [{ id: 's', text: 'Subtract 8', right: true }, { id: 'a', text: 'Add 8', right: false }, { id: 'd', text: 'Divide by 8', right: false }], reveal: () => [Q(ctx, 'sv-a')] }),
      Q(ctx, 'sv-b'), Q(ctx, 'sv-c'), Q(ctx, 'sv-d'), h3('Negative and fractional answers'), Q(ctx, 'sv-e'), Q(ctx, 'sv-f'),
      note('key', 'fictional scenarios', 'These are classroom scenarios, not real park-construction requirements.')),
    act(ctx, 'gp-g-2', 'Activity 2', 'Check the mechanic’s work', workbench(ctx, W('check')),
      Pa('Checking a solution means substituting it into the original equation and seeing whether both sides match.'),
      Q(ctx, 'chk-yes'), Q(ctx, 'chk-no'), Q(ctx, 'chk-orig'), sim('Substitution checker: 3t = 42', substitutionChecker(ctx))),
    act(ctx, 'gp-g-3', 'Activity 3', 'Write the mechanic’s equation', workbench(ctx, W('write')),
      Pa('Write the equation the story describes (with its numbers), then solve it.'),
      Q(ctx, 'wr-laps-eq', { kicker: 'Sheet 1' }), Q(ctx, 'wr-laps', { kicker: 'Sheet 1' }), Q(ctx, 'wr-bikes-eq', { kicker: 'Sheet 2' }), Q(ctx, 'wr-bikes', { kicker: 'Sheet 2' }),
      Q(ctx, 'wr-kits-eq', { kicker: 'Sheet 3' }), Q(ctx, 'wr-kits', { kicker: 'Sheet 3' }), Q(ctx, 'wr-groups-eq', { kicker: 'Sheet 4' }), Q(ctx, 'wr-groups', { kicker: 'Sheet 4' })),
    act(ctx, 'gp-g-4', 'Activity 4', 'Suspension setup challenge', workbench(ctx, W('sag')),
      Pa('Sag is the share of a shock’s stroke used when the rider sits on the bike: P = 100S/T, with S the measured compression and T the total stroke.'),
      note('myth', 'classroom values only', SAG_NOTE),
      Q(ctx, 'sv-sag'), Q(ctx, 'sg-mm'), sim('Rear shock and O-ring', shockTool(ctx))),
    act(ctx, 'gp-g-5', 'Independent challenge', 'More setup sheets', practiceBox()),
    badgeNote(ctx, 'garage')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: The Build Crew
function crewPage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox, live } = ctx, P = ctx.progress;
  const out = [
    projectMini(ctx, { badges: false }),
    act(ctx, 'gp-c-1', 'Activity 1', 'Construction budget', workbench(ctx, W('multi')),
      Pa('The park is ready for construction, and you’re the lead construction engineer. First, a park-day rental.'),
      Q(ctx, 'bg-eq'), Q(ctx, 'sv-budget'), live(() => (P.done('sv-budget') ? sim('Budget tracker', budgetTracker(ctx)) : null))),
    act(ctx, 'gp-c-2', 'Activity 2', 'The feature materials calculator', workbench(ctx, W('distribute')),
      Pa('Three jump zones each need a package of x standard markers plus 4 fixed setup markers. Two service zones each need x standard markers plus 1. The total inventory is 29 units.'),
      Q(ctx, 'sv-mat'), Q(ctx, 'mat-check'), sim('Feature packages', packageVisual(ctx))),
    act(ctx, 'gp-c-3', 'Activity 3', 'Distributive property workshop',
      Pa('Four construction packages, each with x standard pieces and 3 fixed setup pieces: 4(x + 3). The 4 multiplies both quantities.'),
      Q(ctx, 'di-fill', { kicker: 'Guided' }), Q(ctx, 'di-exp', { kicker: 'Your turn' }), Q(ctx, 'sv-dist', { kicker: 'Now solve one' })),
    act(ctx, 'gp-c-4', 'Activity 4', 'Construction planning challenges',
      Pa('Build the equation from the description when it isn’t given, then solve it.'),
      Q(ctx, 'ch-kits-eq', { kicker: 'Challenge 1' }), Q(ctx, 'ch-kits', { kicker: 'Challenge 1' }), Q(ctx, 'ch-pack-eq', { kicker: 'Challenge 2' }), Q(ctx, 'ch-pack', { kicker: 'Challenge 2' }), Q(ctx, 'ch-zones', { kicker: 'Challenge 3' })),
    act(ctx, 'gp-c-5', 'Independent challenge', 'More crew jobs', practiceBox()),
    badgeNote(ctx, 'crew')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: The Design Showdown
function showdownPage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox } = ctx, D = DESIGNS.ab;
  const out = [
    projectMini(ctx, { badges: false }),
    act(ctx, 'gp-s-1', 'Activity 1', 'Compare two park designs', workbench(ctx, W('both')),
      el('div', { class: 'gp-cards' }, el('div', { class: 'gp-card is-a' }, el('p', { class: 'gp-card-h' }, 'Design A'), el('p', null, '18 planning credits to start, plus 6 per feature'), el('p', { class: 'ms-mono' }, 'A = 18 + 6f')),
        el('div', { class: 'gp-card is-b' }, el('p', { class: 'gp-card-h' }, 'Design B'), el('p', null, '30 planning credits to start, plus 4 per feature'), el('p', { class: 'ms-mono' }, 'B = 30 + 4f'))),
      predict(ctx, 'crossover', { prompt: 'At how many features will the two designs cost the same?', options: [{ id: '4', text: '4 features', right: false }, { id: '6', text: '6 features', right: true }, { id: '8', text: '8 features', right: false }, { id: 'never', text: 'Never', right: false }],
        reveal: () => [sim('Design showdown', designShowdown(ctx, 'ab')), Q(ctx, 'sv-ab'), Q(ctx, 'ab-cost')] }),
      note('key', 'whole features', 'The graph draws continuous lines, but a park has a whole number of features.')),
    act(ctx, 'gp-s-2', 'Activity 2', 'No solution', workbench(ctx, W('special')),
      Q(ctx, 'sv-none'), Q(ctx, 'none-type'), sim('Parallel proposals', designShowdown(ctx, 'none'))),
    act(ctx, 'gp-s-3', 'Activity 3', 'Infinitely many solutions',
      Q(ctx, 'sv-all'), Q(ctx, 'all-type'), sim('The same plan, two ways', designShowdown(ctx, 'all'))),
    act(ctx, 'gp-s-4', 'Activity 4', 'Design comparison challenge',
      Pa('For each pair: set the expressions equal, solve, classify, and decide whether the answer makes sense.'),
      h3('Membership plans'), Q(ctx, 'dc1-eq'), Q(ctx, 'dc1-type'), Q(ctx, 'dc1-val'),
      h3('Feature production estimates'), Q(ctx, 'dc2-type'),
      h3('Equipment rental plans'), Q(ctx, 'dc3-type'),
      h3('Service packages'), Q(ctx, 'dc4-type'), Q(ctx, 'dc4-val'),
      h3('Construction proposals'), Q(ctx, 'dc5-val'), Q(ctx, 'dc5-real')),
    act(ctx, 'gp-s-5', 'Independent challenge', 'More comparisons', practiceBox()),
    badgeNote(ctx, 'showdown')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: The Formula Garage
function formulaPage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox, eq } = ctx;
  const out = [
    projectMini(ctx, { badges: false }),
    act(ctx, 'gp-f-1', 'Activity 1', 'Speed, distance and time', workbench(ctx, W('literal')),
      eq('d = rt', [['d', 'distance (km)'], ['r', 'average speed (km/h)'], ['t', 'time (h)']]),
      Q(ctx, 'fm-t-form'), Q(ctx, 'fm-t'), Q(ctx, 'fm-min'), Q(ctx, 'fm-r-form'), Q(ctx, 'fm-r'), Q(ctx, 'fm-d'),
      sim('Trail section: distance, speed and time', trailTimeTool(ctx))),
    act(ctx, 'gp-f-2', 'Activity 2', 'Trail grade engineering', workbench(ctx, W('grade')),
      eq('G = 100R/L', [['G', 'percentage grade (%)'], ['R', 'vertical rise (ft)'], ['L', 'horizontal run (ft)']]),
      note('key', 'run is horizontal', 'The run L is measured flat, like distance on a map. The trail itself runs along the slope, a little longer.'),
      Q(ctx, 'gr-pick', { kicker: 'Choose the unknown first' }), Q(ctx, 'gr-a', { kicker: 'Challenge A' }), Q(ctx, 'gr-b', { kicker: 'Challenge B' }), Q(ctx, 'gr-c', { kicker: 'Challenge C' }), Q(ctx, 'gr-run'),
      sim('Trail profile', gradeProfile(ctx))),
    act(ctx, 'gp-f-3', 'Activity 3', 'Suspension engineering', workbench(ctx, W('sag')),
      eq('P = 100S/T', [['P', 'sag percentage (%)'], ['S', 'measured compression (mm)'], ['T', 'total shock stroke (mm)']]),
      note('myth', 'not a setup instruction', SAG_NOTE),
      Q(ctx, 'sp-s-form'), Q(ctx, 'sp-s'), Q(ctx, 'sp-p'), Q(ctx, 'sp-t-form'), Q(ctx, 'sp-t'), Q(ctx, 'sp-parts'), sim('Rear shock: stroke, compression and sag', shockTool(ctx))),
    act(ctx, 'gp-f-4', 'Activity 4', 'The Formula Rearrangement Studio',
      Pa('Pick a formula and the letter you want, then choose each operation. The traditional step-by-step working stays on screen, and a numeric check confirms the result.'),
      sim('Formula Garage', rearrangeStudio(ctx)), Q(ctx, 'st-l-form')),
    act(ctx, 'gp-f-5', 'Activity 5', 'Engineering formula assessment', Pa('New situations: choose the formula, rearrange it, substitute, and calculate with units.'), practiceBox()),
    badgeNote(ctx, 'formula')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 05: Park Operations
function operationsPage(ctx) {
  const { note, sim, para: Pa, h3, practiceBox, live } = ctx, P = ctx.progress;
  const out = [
    projectMini(ctx, { badges: false }),
    act(ctx, 'gp-o-1', 'Activity 1', 'The construction budget', workbench(ctx, W('inequality')),
      note('key', 'limits, not targets', 'Equations describe quantities that are equal. Inequalities describe limits and ranges.'),
      Q(ctx, 'ib-write'), Q(ctx, 'sv-ib'), Q(ctx, 'ib-max'), Q(ctx, 'ib-whole'),
      sim('Feature package budget', budgetTracker(ctx, { key: 'pkgs', budget: 105, fixed: 45, rate: 12, what: 'packages', unit: 'credits', label: 'Feature packages h', limitWord: 'Maximum budget' }))),
    act(ctx, 'gp-o-2', 'Activity 2', 'The negative number challenge', workbench(ctx, W('flip')),
      Pa('The park starts with 180 planning credits. Each feature kit costs 12, and at least 60 credits must remain: 180 − 12x ≥ 60.'),
      predict(ctx, 'flip', { prompt: 'After subtracting 180 you’ll have −12x ≥ −120. When you divide both sides by −12, what happens to the ≥ sign?', options: [{ id: 'keep', text: 'It stays ≥', right: false }, { id: 'flip', text: 'It reverses to ≤', right: true }],
        reveal: () => [sim('Why the sign reverses', flipDemo(ctx)), Q(ctx, 'sv-neg'), Q(ctx, 'neg-range'), Q(ctx, 'neg-why')] })),
    act(ctx, 'gp-o-3', 'Activity 3', 'The Number Line Studio', workbench(ctx, W('numberline')),
      Pa('Solve each inequality, then build its graph: choose the shape, place the endpoint, and pick open or closed.'),
      Q(ctx, 'nl-a-solve'), Q(ctx, 'nl-a'), Q(ctx, 'nl-b-solve'), Q(ctx, 'nl-b')),
    act(ctx, 'gp-o-4', 'Activity 4', 'Compound inequalities', workbench(ctx, W('compound')),
      Pa('The park’s approved planning allocation must be between 36 and 84 credits, inclusive. Each feature package needs 8 credits, plus 4 fixed credits.'),
      Q(ctx, 'sv-comp'), Q(ctx, 'comp-graph'), h3('AND versus OR'), Q(ctx, 'or-graph'), Q(ctx, 'or-which'), Q(ctx, 'andor')),
    act(ctx, 'gp-o-5', 'Activity 5', 'Trail grade constraints', note('myth', 'a fictional limit', GRADE_NOTE),
      Q(ctx, 'tg-ineq'), Q(ctx, 'tg-max'), sim('Connector profile against the limit', gradeProfile(ctx, { limit: 8 }))),
    act(ctx, 'gp-o-6', 'Activity 6', 'Final park approval',
      Pa('The park must satisfy every one of these fictional conditions: spending can’t exceed 180 credits; at least 4 feature packages; at least 60 credits must remain; no more than 10 kits; and the 300 ft connector stays within the 8% scenario limit. Kits cost 12 credits each.'),
      Q(ctx, 'ap-pass'), Q(ctx, 'ap-c'), sim('Project approval dashboard', live(() => approvalBoard(ctx, P.done('ap-pass')))),
      writtenResponse(ctx, 'approval-why', { prompt: 'Explain one approval decision using the inequalities.', sample: 'Plan D fails the grade condition: 100(27)/300 = 9%, and 9 > 8. Equivalently, its rise is 27 ft but R must satisfy R ≤ 24.' })),
    act(ctx, 'gp-o-7', 'Independent challenge', 'More constraints', practiceBox()),
    badgeNote(ctx, 'operations')
  ];
  afterRender(); return out;
}

// ================================================================ the finished project
function openPark(ctx) {
  const P = ctx.progress, park = PROJECT.park, X = projectSummary(park), earned = earnedBadges(P, MISSION_LIST), appr = P.getData('approved', null);
  const nameIn = el('input', { type: 'text', class: 'ls-input dl-name-in', id: 'gp-project-name', maxlength: 60, value: P.getData('projectName', '') || park.name, placeholder: 'My Dream Line Park', autocomplete: 'off' });
  nameIn.addEventListener('change', () => P.setData('projectName', nameIn.value.trim()));
  const desc = el('textarea', { class: 'ls-textarea', id: 'gp-project-summary', rows: 4, placeholder: 'My dream park has three jump zones and two service areas. I calculated the materials needed, compared design proposals and checked the project’s construction budget using equations and inequalities.' });
  desc.value = P.written('project-summary');
  desc.addEventListener('change', () => P.write('project-summary', desc.value));
  const fact = (ok, text) => el('li', { class: ok ? 'is-ok' : '' }, ok ? '✓ ' : '○ ', text);
  return el('div', null,
    el('div', { class: 'dl-finished' },
      el('div', { class: 'dl-finished-map' }, parkMap(park, { label: `${park.name}: ${X.env}, ${X.features} features` })),
      el('div', { class: 'dl-finished-side' },
        el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: 'gp-project-name' }, 'Engineering project name'), nameIn),
        el('p', { class: 'ls-small' }, PROJECT.fromUnit1 ? 'Your park from The Dream Line Project.' : 'A starter project (design your own in The Dream Line Project and it appears here).'),
        el('dl', { class: 'ms-stats dl-park-stats' }, [['Environment', X.env], ['Features', String(X.features)], ['Build plan', X.plan.total + ' crew-hours'], ['Stages complete', `${earned.size} of 5`]].map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))),
        el('p', { class: 'dl-plan-eq' }, X.plan.expression),
        el('p', { class: 'ls-kicker' }, 'Engineering results'),
        el('ul', { class: 'gp-checks' },
          fact(P.done('sv-budget'), 'Rental budget: 45 + 12h = 105 gives h = 5 hours.'),
          fact(P.done('sv-mat'), 'Materials: 3(x + 4) + 2(x + 1) = 29 gives x = 3 markers per package.'),
          fact(P.done('sv-ab'), 'Design A and Design B cost the same (54 credits) at f = 6 features.'),
          fact(P.done('sp-s'), 'Classroom sag: 30% of a 50 mm stroke is 15 mm of compression.'),
          fact(P.done('sv-neg'), 'Credits: 180 − 12x ≥ 60 allows up to 10 kits.'),
          fact(P.done('tg-ineq'), 'Connector: R ≤ 24 ft keeps the 300 ft run within the 8% scenario limit.'),
          fact(!!(appr && appr.ok), appr && appr.ok ? `Approved plan: ${appr.kits} kits, ${appr.rise} ft connector rise.` : 'Approve a plan on the Park Operations dashboard.')),
        badgeRow(earned))),
    el('div', { class: 'ls-field ls-field--wide dl-desc' }, el('label', { for: 'gp-project-summary' }, 'Project summary (saved for your tutor)'), desc),
    el('p', { class: 'ls-small' }, FICTION_NOTE));
}

// ================================================================ tutor mode and the report
const SECTIONS = {
  garage: [['gp-g-1', 'Missing Measurement Board'], ['gp-g-2', 'Check the mechanic’s work'], ['gp-g-3', 'Write the mechanic’s equation'], ['gp-g-4', 'Suspension setup'], ['gp-g-5', 'More setup sheets']],
  crew: [['gp-c-1', 'Construction budget'], ['gp-c-2', 'Materials calculator'], ['gp-c-3', 'Distributive workshop'], ['gp-c-4', 'Planning challenges'], ['gp-c-5', 'More crew jobs']],
  showdown: [['gp-s-1', 'Compare two designs'], ['gp-s-2', 'No solution'], ['gp-s-3', 'Infinitely many'], ['gp-s-4', 'Comparison challenge'], ['gp-s-5', 'More comparisons']],
  formula: [['gp-f-1', 'Speed, distance, time'], ['gp-f-2', 'Trail grade'], ['gp-f-3', 'Suspension sag'], ['gp-f-4', 'Rearrangement studio'], ['gp-f-5', 'Formula assessment']],
  operations: [['gp-o-1', 'Construction budget'], ['gp-o-2', 'Negative number challenge'], ['gp-o-3', 'Number Line Studio'], ['gp-o-4', 'Compound inequalities'], ['gp-o-5', 'Trail grade limit'], ['gp-o-6', 'Final approval'], ['gp-o-7', 'More constraints']]
};
const WRITTEN = { 'approval-why': 'Approval decision', 'project-summary': 'Project summary' };
const KINDS = questionKinds();
function boardExtra(ctx) {
  const P = ctx.progress;
  return el('div', null,
    projectMini(ctx, { kicker: PROJECT.fromUnit1 ? 'Your park, brought forward from Unit 1' : 'Your starter project' }),
    PROJECT.fromUnit1 ? null : el('p', { class: 'ls-small gp-unit1' }, 'Haven’t designed a park yet? ', el('a', { href: '../dream-line-project/#board' }, 'Build one in The Dream Line Project'), ' and it will appear here. You don’t need it to do this unit.'),
    sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS }));
}

const HOOKS = {
  garage: 'You’re the team’s lead bike mechanic. The setup sheets have missing values: use inverse operations to find them, and check your work.',
  crew: 'The park is ready for construction. As lead construction engineer, estimate materials, organize feature packages and calculate the requirements.',
  showdown: 'Two design teams have submitted proposals, each with its own starting estimate and cost per feature. When do they cost the same, and does that ever happen?',
  formula: 'You’re the park’s technical engineer. Rearrange real MTB formulas to find whichever unknown you need, with the right units.',
  operations: 'The park is almost ready to open. As park manager, keep the project within its budget, resource limits and design constraints.'
};
const PAGES = { garage: garagePage, crew: crewPage, showdown: showdownPage, formula: formulaPage, operations: operationsPage };
const practiceFor = {
  garage: { ids: ONE_PRACTICE_IDS, count: ONE_PRACTICE.length, questions: onePractice, button: 'New setup sheet', note: 'A new one-step story.', kicker: 'Independent challenge' },
  crew: { ids: MULTI_PRACTICE_IDS, count: MULTI_PRACTICE.length, questions: multiPractice, button: 'New crew job', note: 'Write the equation, then solve it.', kicker: 'Independent challenge' },
  showdown: { ids: BOTH_PRACTICE_IDS, count: BOTH_PRACTICE.length, questions: bothPractice, button: 'New comparison', note: 'One, none or infinitely many.', kicker: 'Independent challenge' },
  formula: { ids: FORMULA_PRACTICE_IDS, count: FORMULA_PRACTICE.length, questions: formulaPractice, button: 'New engineering job', note: 'Speed, grade or sag, with units.', kicker: 'Engineering assessment' },
  operations: { ids: INEQ_PRACTICE_IDS, count: INEQ_PRACTICE.length, questions: ineqPractice, button: 'New constraint', note: 'Some need the sign reversed.', kicker: 'Independent challenge' }
};

export const LAB = {
  id: ID, title: 'The Dream Line Goes Pro', eventPrefix: 'goespro', rootClass: 'dgp dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Unit 2: Solving Equations and Inequalities',
    lines: ['The Dream', 'Line Goes'], accent: 'Pro',
    lede: 'Your dream park is designed. Your feature list is ready. Now it’s time to make it work.',
    body: 'You’ve been hired as the lead engineer responsible for turning this dream into a functioning mountain bike playground. You’ll need to dial in suspension, solve engineering problems, compare construction plans, rearrange real MTB formulas and manage the project’s limits. Let’s get this park ready to open.',
    enter: 'Enter the engineering workshop →', back: 'Back to the workshop →',
    meta: 'Engineer it. Dial it. Optimize it. · 40–55 minutes · five stages and a final certification · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'The engineering workshop', hook: 'Five stages, from the setup garage to opening day. Each earns a badge; all five unlock the Final Park Engineer Certification.',
    extra: ctx => boardExtra(ctx), refsNote: FICTION_NOTE + ' ' + SAG_NOTE, refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: {
    kicker: 'Your park', title: 'Open your Dream Line',
    blurb: 'Your engineered park: the design, the calculations, the approved plan and your badges.',
    hook: 'The park you designed is now engineered, costed and approved. Name the project and sum up how you got it here.',
    page: ctx => [ctx.card(null, null, openPark(ctx))]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'Final Park Engineer Certification', blurb: 'Ten new questions, two per topic, on your own. Show your working.',
    hook: 'Equations, formulas and limits, in new situations. Your working is saved with your answers: certification looks at how you solved, not just the final number.',
    lockedHook: 'Earn all five stage badges to unlock the Final Park Engineer Certification.',
    doneShort: 'Certified park engineer', doneTitle: 'Certified park engineer',
    doneLede: 'You uncovered missing measurements with inverse operations, planned construction with multi-step equations, compared designs, rearranged real MTB formulas, and kept the project within its limits.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new numbers.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      projectMini(ctx, { kicker: 'The project you’re certifying', badges: false }),
      card('Part A', 'One-step equations', A('fa-solve'), A('fa-check')),
      card('Part B', 'Multi-step equations', A('fb-build'), A('fb-solve')),
      card('Part C', 'Variables on both sides', A('fc-solve'), A('fc-type')),
      card('Part D', 'Literal equations', A('fd-form'), A('fd-use')),
      card('Part E', 'Inequalities', A('fe-solve'), A('fe-graph'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The five topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'Next in Algebra 1: Linear Relationships, where these equations become lines on a graph.', retryLabel: 'Retry certification',
    park: projectMini(ctx, { kicker: 'Your engineered park' }), buttons: { view: ['View my engineered park', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => ({ badges: [...earnedBadges(P, MISSION_LIST)], project: { fromUnit1: PROJECT.fromUnit1, features: projectSummary(PROJECT.park).features, approved: P.getData('approved', null) }, rearranged: (P.getData('studio', { done: [] }).done || []).length }),
  stats: s => [['Badges', `${(s.badges || []).length} of 5`], ['Formulas rearranged in the studio', String(s.rearranged || 0)], ['Park project', s.project && s.project.fromUnit1 ? 'from Unit 1' : 'starter']]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) {
  PROJECT = loadProject({ studentId: opts.studentId, storage: opts.storage });
  return mountMissions(target, LAB, opts);
}

if (typeof window !== 'undefined') window.DreamLineGoesPro = { mount, VERSION };
