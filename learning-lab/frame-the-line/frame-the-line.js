// Frame the Line: the MTB Film Studio (Mathlete MTB, Algebra 1, Unit 4:
// Linear Equations and Functions). Students produce a fictional mountain
// bike film and use linear models to plan its budget, schedule, storage and
// limits: writing equations, slope-intercept and point-slope forms, graphing,
// domain and range, and function notation.
//
//   import { mount } from './frame-the-line.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: framethe:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with the other
// Algebra 1 labs, and Map the Line's coordinate grid and point plotter.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  TWO_POINT_PRACTICE, TWO_POINT_IDS, twoPointPractice, SI_PRACTICE, SI_PRACTICE_IDS, siPractice, PS_PRACTICE, PS_PRACTICE_IDS, psPractice,
  DOMAIN_PRACTICE, DOMAIN_PRACTICE_IDS, domainPractice, FN_PRACTICE, FN_PRACTICE_IDS, fnPractice } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { MONEY_NOTE, STORAGE_NOTE, BUDGET_TABLE } from './logic/film.js';
import { tableEl } from '../slope-lab/components/figures.js';
import { plotPoints } from '../slope-lab/components/labs.js';
import { figure, linePlot, budgetExplorer, psBuilder, verticalLineTest, domainBuilder, directorDashboard, studio, productionBoard, conceptOf } from './components/labs.js';
import { openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '1.0.0';
export const ID = 'frame-the-line';
const REFS = [
  ['Common Core: Creating Equations, linear equations in two variables (HSA-CED.A.2)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['Common Core: Interpreting Functions, function notation, domain and range (HSF-IF.A.1, A.2, B.5)', 'https://www.thecorestandards.org/Math/Content/HSF/IF/'],
  ['Common Core: Building Functions, linear models (HSF-BF.A.1)', 'https://www.thecorestandards.org/Math/Content/HSF/BF/'],
  ['Common Core: Linear, Quadratic and Exponential Models, interpreting parameters (HSF-LE.B.5)', 'https://www.thecorestandards.org/Math/Content/HSF/LE/'],
  ['OpenStax Elementary Algebra 2e: Use the slope-intercept form of an equation of a line', 'https://openstax.org/books/elementary-algebra-2e/pages/4-5-use-the-slope-intercept-form-of-an-equation-of-a-line'],
  ['OpenStax Elementary Algebra 2e: Find the equation of a line', 'https://openstax.org/books/elementary-algebra-2e/pages/4-6-find-the-equation-of-a-line']
];

let MISSION_LIST = [];
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
function Q(ctx, id, o = {}) {
  const def = o.def || QUESTIONS[id];
  if (def.type === 'plot') return plotPoints(ctx, id, def, o);
  if (def.type === 'lineplot') return linePlot(ctx, id, def, o);
  return ctx.q(id, o);
}
const Qs = (ctx, ids, o) => ids.map(id => Q(ctx, id, o));
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, 'Finish every question in this stage (including the independent challenge) to earn the ', el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
const WB = k => WORKBENCH[k];
const filmName = ctx => { const K = conceptOf(ctx.progress); return K ? K.name : 'your film'; };

// ================================================================ Stage 01: Plan the Production
function planPage(ctx) {
  const { note, para: Pa, h3, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ft-p-1', 'Activity 1', 'Write the budget from a description', workbench(ctx, WB('write')),
      Pa(`You’re the executive producer of ${filmName(ctx)}. Before a single shot is filmed, the studio needs a mathematical model of the budget.`),
      note('key', 'fictional credits', MONEY_NOTE), Qs(ctx, ['w-desc', 'w-fixed'])),
    act(ctx, 'ft-p-2', 'Activity 2', 'From a slope and a point', eq('y = mx + b'), Qs(ctx, ['w-sp-b', 'w-sp-eq'])),
    act(ctx, 'ft-p-3', 'Activity 3', 'From two budget checkpoints', eq('m = (y₂ − y₁) / (x₂ − x₁)', [['(1, 2220)', 'after 1 shoot day'], ['(5, 3900)', 'after 5 shoot days']]), Qs(ctx, ['w-2p-m', 'w-2p-b', 'w-2p-eq'])),
    act(ctx, 'ft-p-4', 'Activity 4', 'From a budget table', Qs(ctx, ['w-tab-start', 'w-tab-rate', 'w-tab-eq'])),
    act(ctx, 'ft-p-5', 'Activity 5', 'From a graph', Q(ctx, 'w-graph-eq')),
    act(ctx, 'ft-p-6', 'Activity 6', 'The production planning challenge', Pa('Four more parts of the production, each with a one-off cost and a rate.'), Qs(ctx, ['w-ch-camera', 'w-ch-travel', 'w-ch-edit', 'w-ch-location'])),
    act(ctx, 'ft-p-7', 'Independent challenge', 'More budget checkpoints', practiceBox()),
    badgeNote(ctx, 'plan')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: Understand the Budget
function budgetPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'ft-b-1', 'Activity 1', 'Read the budget equation', workbench(ctx, WB('si')), Pa('C = 420d + 1800 is in slope-intercept form, y = mx + b.'), Qs(ctx, ['si-m', 'si-m-mean'])),
    act(ctx, 'ft-b-2', 'Activity 2', 'The starting cost', Pa('Before filming begins (d = 0), the fixed costs are already on the books.'), Qs(ctx, ['si-b', 'si-b-mean'])),
    act(ctx, 'ft-b-3', 'Activity 3', 'The production budget explorer',
      predict(ctx, 'faster', { prompt: 'Two models: C = 500d + 2000 and C = 300d + 2000. Which do you think becomes more expensive more quickly?', options: [{ id: '500', text: '500d + 2000', right: true }, { id: '300', text: '300d + 2000', right: false }, { id: 'same', text: 'Neither: they start the same', right: false }],
        reveal: () => [sim('Production budget explorer', budgetExplorer(ctx)), Qs(ctx, ['si-faster', 'si-same'])] })),
    act(ctx, 'ft-b-4', 'Activity 4', 'Rewrite the equation', note('key', 'get y alone', 'To read m and b, rearrange so the output variable is alone on one side. Then divide every term.'), Qs(ctx, ['si-rewrite', 'si-rewrite-2', 'si-rewrite-3'])),
    act(ctx, 'ft-b-5', 'Activity 5', 'The producer’s challenge', Pa('What do the slope and the intercept mean in each production model?'), Qs(ctx, ['pc-runtime-m', 'pc-runtime-b', 'pc-storage-m', 'pc-remain-b'])),
    act(ctx, 'ft-b-6', 'Independent challenge', 'More budget memos', practiceBox()),
    badgeNote(ctx, 'budget')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: Calculate Mid-Project Costs
function checkpointPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ft-c-1', 'Activity 1', 'A mid-shoot checkpoint', workbench(ctx, WB('ps')), Pa('Day 3 of filming. The producer knows today’s total and the daily rate, not the start.'),
      eq('y − y₁ = m(x − x₁)', [['(x₁, y₁)', 'the checkpoint (3, 3060)'], ['m', '420 per day']]), Q(ctx, 'ps-eq')),
    act(ctx, 'ft-c-2', 'Activity 2', 'Convert to slope-intercept form', Qs(ctx, ['ps-step', 'ps-si']), note('key', 'one line, two forms', 'C − 3060 = 420(d − 3) and C = 420d + 1800 describe exactly the same budget line.')),
    act(ctx, 'ft-c-3', 'Activity 3', 'Choose the best form', Qs(ctx, ['ps-choose-a', 'ps-choose-b', 'ps-meaning'])),
    act(ctx, 'ft-c-4', 'Activity 4', 'Production checkpoints', Pa('Three more departments report mid-project figures.'), note('key', 'simplified models', STORAGE_NOTE), Qs(ctx, ['ps-e', 'ps-e-si', 'ps-s', 'ps-s-si', 'ps-m', 'ps-m-si'])),
    act(ctx, 'ft-c-5', 'Activity 5', 'The point-slope equation builder', sim('Point-slope builder', psBuilder(ctx))),
    act(ctx, 'ft-c-6', 'Independent challenge', 'More checkpoints', practiceBox()),
    badgeNote(ctx, 'checkpoint')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: Build the Production Graph
function graphPage(ctx) {
  const { note, para: Pa, h3 } = ctx;
  const out = [
    act(ctx, 'ft-g-1', 'Activity 1', 'Graph the budget', workbench(ctx, WB('graph')), Pa('The budget board needs a graph. Start at the intercept and use the slope.'), Qs(ctx, ['gr-plot', 'gr-meaning'])),
    act(ctx, 'ft-g-2', 'Activity 2', 'The memory card', note('key', 'a simplified storage model', STORAGE_NOTE), Pa('S = 600 − 40h: free storage S (GB) after h hours of recording.'), Qs(ctx, ['gr-s-yint', 'gr-s-xint', 'gr-s-plot', 'gr-s-mean'])),
    act(ctx, 'ft-g-3', 'Activity 3', 'Graphing from intercepts', Pa('Equations in standard form, Ax + By = C, are quick to graph from their intercepts.'), Qs(ctx, ['gr-std-x', 'gr-std-y']),
      note('key', 'check it', '(300, 0) is on the line 2h + S = 600: 2(300) + 0 = 600. Substitute an intercept back in to check it.'), Q(ctx, 'gr-std2')),
    act(ctx, 'ft-g-4', 'Activity 4', 'Horizontal and vertical lines', Qs(ctx, ['gr-h-m', 'gr-h-plot']), h3('A schedule marker'), Qs(ctx, ['gr-v-slope', 'gr-v-plot', 'gr-v-func'])),
    act(ctx, 'ft-g-5', 'Activity 5', 'The graph interpretation challenge', Qs(ctx, ['gr-c-m', 'gr-c-trend', 'gr-c-xint'])),
    badgeNote(ctx, 'graph')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 05: Manage the Production Limits
function limitsPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'ft-l-1', 'Activity 1', 'The approved shoot', workbench(ctx, WB('domain')), Pa('The project has been approved for a maximum of eight shoot days.'), Qs(ctx, ['dr-domain', 'dr-c8', 'dr-range'])),
    act(ctx, 'ft-l-2', 'Activity 2', 'Whole days only', note('key', 'discrete or continuous', 'If partial days are prorated, any d from 0 to 8 makes sense. If only whole days are booked, the domain is a list of values.'), Qs(ctx, ['dr-whole', 'dr-whole-range'])),
    act(ctx, 'ft-l-3', 'Activity 3', 'Storage limits', Qs(ctx, ['dr-s-domain', 'dr-s-range'])),
    act(ctx, 'ft-l-4', 'Activity 4', 'Domain and range from graphs and tables', Qs(ctx, ['dr-g-dom', 'dr-g-range', 'dr-dots', 'dr-share', 'dr-table', 'dr-all'])),
    act(ctx, 'ft-l-5', 'Activity 5', 'The model builder', sim('Domain and range builder', domainBuilder(ctx)),
      writtenResponse(ctx, 'explain-domain', { prompt: 'Why is the domain of the production model not all real numbers, even though the equation C = 1800 + 420d works for any d?', sample: 'The equation can take any number, but the situation can’t: you can’t film a negative number of days, and the producer approved at most eight. So the sensible inputs are 0 ≤ d ≤ 8 (or only whole days, 0 to 8, if partial days aren’t booked), and the range is the costs those days give, from $1,800 to $5,160.' })),
    act(ctx, 'ft-l-6', 'Independent challenge', 'More production models', practiceBox()),
    badgeNote(ctx, 'limits')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 06: Direct the Film
function directPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'ft-d-1', 'Activity 1', 'Function notation', workbench(ctx, WB('fn')), eq('C(d) = 1800 + 420d', [['C', 'the function’s name'], ['d', 'the input'], ['C(d)', 'the output']]), Qs(ctx, ['fn-c3', 'fn-evals'])),
    act(ctx, 'ft-d-2', 'Activity 2', 'It isn’t multiplication', Q(ctx, 'fn-mult')),
    act(ctx, 'ft-d-3', 'Activity 3', 'More production functions', tableEl([['S(h) = 600 − 40h', 'free storage after h recording hours'], ['E(h) = 120 + 90h', 'editing cost after h editor-hours']], ['Function', 'Meaning']), Qs(ctx, ['fn-s5', 'fn-e5', 'fn-inout'])),
    act(ctx, 'ft-d-4', 'Activity 4', 'Is it a function?', note('key', 'function', 'A function gives exactly one output for each input. Outputs may repeat.'), Qs(ctx, ['fn-a', 'fn-b', 'fn-c'])),
    act(ctx, 'ft-d-5', 'Activity 5', 'The vertical line test', sim('Vertical line test', verticalLineTest(ctx)), Q(ctx, 'fn-vlt')),
    act(ctx, 'ft-d-6', 'Activity 6', 'Function notation in context', Pa('Translate between notation, words, tables and graphs.'), tableEl(BUDGET_TABLE, ['d', 'C(d)']), Qs(ctx, ['fn-ctx-s3', 'fn-ctx-table', 'fn-ctx-graph', 'fn-ctx-write'])),
    act(ctx, 'ft-d-7', 'Activity 7', 'The director’s dashboard', Pa('Choose a production function and an input. Calculate the output yourself, then reveal it.'), sim('Director’s dashboard', directorDashboard(ctx))),
    act(ctx, 'ft-d-8', 'Independent challenge', 'More production functions', practiceBox()),
    badgeNote(ctx, 'direct')
  ];
  afterRender(); return out;
}

// ================================================================ config
const SECTIONS = {
  plan: [['ft-p-1', 'From a description'], ['ft-p-2', 'Slope and a point'], ['ft-p-3', 'Two checkpoints'], ['ft-p-4', 'From a table'], ['ft-p-5', 'From a graph'], ['ft-p-6', 'Planning challenge'], ['ft-p-7', 'More checkpoints']],
  budget: [['ft-b-1', 'Read the equation'], ['ft-b-2', 'The starting cost'], ['ft-b-3', 'Budget explorer'], ['ft-b-4', 'Rewrite the equation'], ['ft-b-5', 'Producer’s challenge'], ['ft-b-6', 'More budget memos']],
  checkpoint: [['ft-c-1', 'Mid-shoot checkpoint'], ['ft-c-2', 'Convert forms'], ['ft-c-3', 'Choose the best form'], ['ft-c-4', 'Production checkpoints'], ['ft-c-5', 'Point-slope builder'], ['ft-c-6', 'More checkpoints']],
  graph: [['ft-g-1', 'Graph the budget'], ['ft-g-2', 'The memory card'], ['ft-g-3', 'From intercepts'], ['ft-g-4', 'Horizontal and vertical'], ['ft-g-5', 'Interpretation challenge']],
  limits: [['ft-l-1', 'The approved shoot'], ['ft-l-2', 'Whole days only'], ['ft-l-3', 'Storage limits'], ['ft-l-4', 'Graphs and tables'], ['ft-l-5', 'Model builder'], ['ft-l-6', 'More models']],
  direct: [['ft-d-1', 'Function notation'], ['ft-d-2', 'Not multiplication'], ['ft-d-3', 'More functions'], ['ft-d-4', 'Is it a function?'], ['ft-d-5', 'Vertical line test'], ['ft-d-6', 'Notation in context'], ['ft-d-7', 'Director’s dashboard'], ['ft-d-8', 'More functions']]
};
const WRITTEN = { 'explain-domain': 'Why the domain isn’t all real numbers', 'project-statement': 'Film project statement' };
const KINDS = questionKinds();
const HOOKS = {
  plan: 'You’re the executive producer. Turn the producer’s notes, checkpoints, tables and graphs into the film’s budget equation.',
  budget: 'The budget director wants to know what every number means: the slope, the intercept, and how the model changes.',
  checkpoint: 'Filming is underway. Work from today’s figures with point-slope form, and convert between forms.',
  graph: 'The graphing editor needs the production graphs: the budget, the memory cards, and some special lines.',
  limits: 'Which inputs make sense? Set the film’s production limits with domain and range.',
  direct: 'You’re in the director’s chair: function notation, production functions, and telling functions from relations.'
};
const PAGES = { plan: planPage, budget: budgetPage, checkpoint: checkpointPage, graph: graphPage, limits: limitsPage, direct: directPage };
function withFigs(set) { for (const v of Object.values(set)) if (v && v.fig && !v.figure) v.figure = () => figure(v.fig); return set; }
withFigs(QUESTIONS);
const practiceFor = {
  plan: { ids: TWO_POINT_IDS, count: TWO_POINT_PRACTICE.length, questions: n => withFigs(twoPointPractice(n)), button: 'New checkpoints', note: 'Two points, then the equation.', kicker: 'Independent challenge' },
  budget: { ids: SI_PRACTICE_IDS, count: SI_PRACTICE.length, questions: n => withFigs(siPractice(n)), button: 'New memo', note: 'Rewrite, then read m and b.', kicker: 'Independent challenge' },
  checkpoint: { ids: PS_PRACTICE_IDS, count: PS_PRACTICE.length, questions: n => withFigs(psPractice(n)), button: 'New checkpoint', note: 'Point-slope, then slope-intercept.', kicker: 'Independent challenge' },
  limits: { ids: DOMAIN_PRACTICE_IDS, count: DOMAIN_PRACTICE.length, questions: n => withFigs(domainPractice(n)), button: 'New model', note: 'Interval notation or inequalities.', kicker: 'Independent challenge' },
  direct: { ids: FN_PRACTICE_IDS, count: FN_PRACTICE.length, questions: n => withFigs(fnPractice(n)), button: 'New function', note: 'Evaluate, then test a relation.', kicker: 'Independent challenge' }
};
const certified = P => !!P.getData('certified', null);

export const LAB = {
  id: ID, title: 'Frame the Line', eventPrefix: 'framethe', rootClass: 'ftl mtl dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Unit 4: Linear Equations and Functions',
    lines: ['Frame the'], accent: 'Line',
    lede: 'Plan the shoot. Model the budget. Direct the film.',
    body: 'Every great mountain bike film starts long before the camera rolls. Locations are scouted, budgets are approved, schedules are planned and every shoot day costs money. You’ve been hired as the producer of a new MTB film: choose its concept, then use linear equations and functions to plan the budget, track the shoot, manage the storage and bring the film to final delivery.',
    enter: 'Enter the film studio →', back: 'Back to the studio →',
    meta: 'The MTB Film Studio · 45–55 minutes · six stages and the Film Producer Certification · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'The film studio', hook: 'Six stages, from planning the production to directing the film. Each earns a badge; all six unlock the Film Producer Certification.',
    extra: ctx => el('div', null, studio(ctx, MISSION_LIST), sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS })), refsNote: MONEY_NOTE + ' ' + STORAGE_NOTE + ' The riders and film concepts are fictional.', refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], ...(practiceFor[m.id] ? { practice: practiceFor[m.id] } : {}) })),
  extension: { kicker: 'Your film', title: 'Your MTB Film', blurb: 'The production board: your film, its budget, checkpoint, graphs, limits and functions.', hook: 'Bring it all together. Name the film and finish the production plan.', page: ctx => [ctx.card(null, null, productionBoard(ctx, MISSION_LIST, certified(ctx.progress)))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: r => withFigs(finalQuestions(r)),
    title: 'Film Producer Certification', blurb: 'Twelve new questions, two per topic, on your own.',
    hook: 'A new production, new numbers. Write and convert its equations, graph its lines, set its limits and evaluate its functions.',
    lockedHook: 'Earn all six stage badges to unlock the Film Producer Certification.',
    doneShort: 'Certified film producer', doneTitle: 'Certified film producer',
    doneLede: 'You modeled a production with linear equations, read and converted their forms, graphed them, set their domains and ranges, and used function notation to direct the film.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh production.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      card('Part A', 'Writing linear equations', A('fa-2pt'), A('fa-desc')),
      card('Part B', 'Slope-intercept form', A('fb-mb'), A('fb-mean')),
      card('Part C', 'Point-slope form', A('fc-ps'), A('fc-conv')),
      card('Part D', 'Graphing linear equations', A('fd-ints'), A('fd-hv')),
      card('Part E', 'Domain and range', A('fe-dom'), A('fe-range')),
      card('Part F', 'Function notation', A('ff-eval'), A('ff-func')),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'See your film’s production board →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The six topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS,
    nextUnit: 'Next in Algebra 1: Systems of linear equations, where two production models meet.', park: null, buttons: { view: ['View my film', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => { const f = P.getData('film', {}) || {}; return { badges: [...earnedBadges(P, MISSION_LIST)], film: { concept: f.concept || null, titled: !!f.title }, dashboard: (P.getData('dashLog', []) || []).length, built: P.getData('builtCount', 0) || 0 }; },
  stats: s => [['Badges', `${(s.badges || []).length} of 6`], ['Film', s.film && s.film.concept ? (s.film.titled ? 'concept chosen and named' : 'concept chosen') : 'no concept yet'], ['Director’s dashboard calculations', String(s.dashboard || 0)], ['Point-slope equations built', String(s.built || 0)]]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }
if (typeof window !== 'undefined') window.FrameTheLine = { mount, VERSION };
