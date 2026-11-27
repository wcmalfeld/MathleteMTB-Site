// Uplift: the Ultimate Bike Park Operations Challenge (Mathlete MTB,
// Algebra 1, Systems of Equations). The student runs a fictional mountain
// bike destination: compare shuttle plans by graphing, stock the rental
// fleet by substitution, price the workshop's parts by elimination, then mix
// trail dirt, race trail crews and solve break-even problems.
//
//   import { mount } from './uplift.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb, onAttempt, onProgress, onComplete })
// Events also fire on the element: uplift:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell and shares the Algebra 1
// workbench, prediction-first steps, tutor panel and report with the other
// Algebra 1 labs, Map the Line's grid and plotter, and Frame the Line's line
// plotter. Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  SHUTTLE_PRACTICE, SHUTTLE_PRACTICE_IDS, shuttlePractice, FLEET_PRACTICE, FLEET_PRACTICE_IDS, fleetPractice, WORKSHOP_PRACTICE, WORKSHOP_PRACTICE_IDS, workshopPractice, MOUNTAIN_PRACTICE, MOUNTAIN_PRACTICE_IDS, mountainPractice } from './logic/questions.js';
import { WORKBENCH } from './logic/workbench.js';
import { PRICE_NOTE, SOIL_NOTE, CREW_NOTE, WHOLE_NOTE, DEPARTMENTS } from './logic/park.js';
import { tableEl } from '../slope-lab/components/figures.js';
import { plotPoints } from '../slope-lab/components/labs.js';
import { linePlot } from '../frame-the-line/components/labs.js';
import { figure, pricingGraph, classifier, fleetBuilder, substitutionWorkbench, invoices, scaler, mixStation, crewSim, hq, commandCenter, destOf } from './components/labs.js';
import { openingArt } from './components/visuals.js';
import { earnedBadges } from '../dream-line-project/components/park.js';
import { workbench, predict, writtenResponse, tutorOf, afterRender } from '../dream-line-project/components/labs.js';
import { tutorPanel as sharedTutorPanel, reportBlocks } from '../dream-line-project/components/shared.js';

export const VERSION = '1.0.0';
export const ID = 'uplift';
const REFS = [
  ['Common Core: Grade 8 Expressions and Equations, systems of linear equations (8.EE.C.8)', 'https://www.thecorestandards.org/Math/Content/8/EE/'],
  ['Common Core: Reasoning with Equations and Inequalities, solving systems (HSA-REI.C.5, C.6, D.11)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Creating Equations, representing constraints (HSA-CED.A.3)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['OpenStax Elementary Algebra 2e: Solve systems of equations by graphing', 'https://openstax.org/books/elementary-algebra-2e/pages/5-1-solve-systems-of-equations-by-graphing'],
  ['OpenStax Elementary Algebra 2e: Solve systems of equations by substitution', 'https://openstax.org/books/elementary-algebra-2e/pages/5-2-solving-systems-of-equations-by-substitution'],
  ['OpenStax Elementary Algebra 2e: Solve systems of equations by elimination', 'https://openstax.org/books/elementary-algebra-2e/pages/5-3-solve-systems-of-equations-by-elimination']
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
const photo = id => { const D = DEPARTMENTS.find(d => d.id === id); return D && D.photo ? el('figure', { class: 'upl-photo' }, el('img', { src: D.photo, alt: D.alt, loading: 'lazy', width: 800, height: 500, onerror: e => { e.target.closest('figure').remove(); } })) : null; };
const where = ctx => { const D = destOf(ctx.progress); return D ? D.hub : 'the shuttle hub'; };

// ================================================================ Stage 01: The Uplift Showdown
function shuttlePage(ctx) {
  const { note, sim, para: Pa, h3, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'up-s-1', 'Activity 1', 'Choose your uplift plan', photo('uplift'), workbench(ctx, WB('system')),
      Pa(`The park is launching its uplift service from ${where(ctx)}. Riders choose between two shuttle packages, and you need to know how each one behaves.`),
      tableEl([['A: Pay As You Ride', '$12', '$8'], ['B: Mountain Pass', '$36', '$4']], ['Plan', 'Up front', 'Per ride']), note('key', 'fictional prices', PRICE_NOTE), Qs(ctx, ['sh-eq-a', 'sh-eq-b'])),
    act(ctx, 'up-s-2', 'Activity 2', 'The live pricing graph', workbench(ctx, WB('graph')),
      predict(ctx, 'meet', { prompt: 'Where do you think the two plans’ lines will cross?', options: [{ id: '3', text: 'Around 3 rides', right: false }, { id: '6', text: 'Around 6 rides', right: true }, { id: '10', text: 'Around 10 rides', right: false }, { id: 'never', text: 'They never cross', right: false }],
        reveal: () => [Qs(ctx, ['sh-graph-a', 'sh-graph-b', 'sh-plot']), eq('8r + 12 = 4r + 36'), Qs(ctx, ['sh-solve', 'sh-cost', 'sh-interp'])] }),
      note('key', 'whole rides', WHOLE_NOTE)),
    act(ctx, 'up-s-3', 'Activity 3', 'Explore the pricing plans', Pa('Slide the number of rides. Both prices update and the cheaper plan is highlighted; the break-even point stays on the graph. Open “Change the plans” to try your own.'),
      sim('Live pricing graph', pricingGraph(ctx)), Qs(ctx, ['sh-3', 'sh-10']),
      writtenResponse(ctx, 'explain-intersection', { prompt: 'Why is the intersection of the two lines the solution of the system?', sample: 'Every point on a line makes that plan’s equation true. The intersection is the only point on both lines, so it’s the only (rides, cost) pair that makes both equations true at once: at 6 rides, both plans cost $60.' })),
    act(ctx, 'up-s-4', 'Activity 4', 'One solution, no solution, infinitely many', workbench(ctx, WB('types')), sim('Solution classifier', classifier(ctx)), Qs(ctx, ['ty-one', 'ty-none', 'ty-inf', 'ty-why'])),
    act(ctx, 'up-s-5', 'Activity 5', 'The uplift strategy challenge', Pa('Two new packages compete for riders. Write both, find the break-even, and advise a rider.'), Qs(ctx, ['sc-eq-c', 'sc-eq-d', 'sc-plot', 'sc-type', 'sc-cheap', 'sc-same'])),
    act(ctx, 'up-s-6', 'Independent challenge', 'More shuttle packages', practiceBox()),
    badgeNote(ctx, 'shuttle')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 02: Build the Rental Fleet
function fleetPage(ctx) {
  const { note, sim, para: Pa, eq, practiceBox } = ctx;
  const out = [
    act(ctx, 'up-f-1', 'Activity 1', 'The rental fleet inventory', photo('fleet'), workbench(ctx, WB('sub')),
      Pa('The rental department needs 18 bikes for opening day: trail bikes at $60 a day and downhill bikes at $90 a day, bringing in $1,260 a day when every bike is out.'),
      predict(ctx, 'fleet', { prompt: 'Which fleet do you think hits both targets?', options: [{ id: '9-9', text: '9 trail, 9 downhill', right: false }, { id: '12-6', text: '12 trail, 6 downhill', right: true }, { id: '6-12', text: '6 trail, 12 downhill', right: false }],
        reveal: () => [sim('Fleet builder', fleetBuilder(ctx)), Qs(ctx, ['fl-eq1', 'fl-eq2'])] })),
    act(ctx, 'up-f-2', 'Activity 2', 'The substitution workshop', eq('x + y = 18', [['x', 'trail bikes'], ['y', 'downhill bikes']]), Qs(ctx, ['fl-iso', 'fl-sub', 'fl-dist', 'fl-y', 'fl-x']),
      sim('Substitution workbench', substitutionWorkbench(ctx))),
    act(ctx, 'up-f-3', 'Activity 3', 'Verify the fleet', workbench(ctx, WB('verify')), note('key', 'both conditions', 'A solution must make both equations true, not just one.'), Qs(ctx, ['fl-check', 'fl-only', 'fl-frac'])),
    act(ctx, 'up-f-4', 'Activity 4', 'Choose what to substitute', Pa('Either variable can be isolated, but one choice is usually quicker.'), Qs(ctx, ['cs-which', 'cs-sol', 'cs-which-2', 'cs-sol-2', 'cs-sol-3'])),
    act(ctx, 'up-f-5', 'Activity 5', 'Build the rental fleet challenge', Qs(ctx, ['flc-sys1', 'flc-sys2', 'flc-sol', 'flc-verify'])),
    act(ctx, 'up-f-6', 'Independent challenge', 'More fleets', practiceBox()),
    badgeNote(ctx, 'fleet')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 03: Stock the Workshop
function workshopPage(ctx) {
  const { note, sim, para: Pa, eq, live, practiceBox } = ctx;
  const out = [
    act(ctx, 'up-w-1', 'Activity 1', 'The workshop invoices', workbench(ctx, WB('elim')), Pa('The mechanic is ordering tubeless tire service kits (x dollars each) and brake pad pairs (y dollars each). The supplier sent two invoices with different mixes of the same items.'),
      live(() => invoices(ctx)), Qs(ctx, ['ws-eq-a', 'ws-eq-b'])),
    act(ctx, 'up-w-2', 'Activity 2', 'Eliminate the brake pad variable',
      predict(ctx, 'elim', { prompt: 'Which variable would be easiest to eliminate?', options: [{ id: 'x', text: 'x, the kits', right: false }, { id: 'y', text: 'y, the brake pads', right: true }, { id: 'none', text: 'Neither, without multiplying', right: false }],
        reveal: () => [eq('4x + 3y = 470\n2x + 3y = 310'), Qs(ctx, ['ws-op', 'ws-sub', 'ws-x', 'ws-y'])] })),
    act(ctx, 'up-w-3', 'Activity 3', 'The mechanic’s order verification', Q(ctx, 'ws-check'), note('key', 'stock updated', 'Once both prices are found, the invoices and the workshop stock above fill in.')),
    act(ctx, 'up-w-4', 'Activity 4', 'When coefficients don’t match', workbench(ctx, WB('scale')), eq('3x + 2y = 260\n2x + 3y = 240'), Qs(ctx, ['mm-add', 'mm-plan', 'mm-s1', 'mm-s2', 'mm-x', 'mm-y']),
      sim('Coefficient scaler', scaler(ctx))),
    act(ctx, 'up-w-5', 'Activity 5', 'Elimination or substitution?', workbench(ctx, WB('method')), Pa('No single method is required: choose the one you think is most efficient for each system.'),
      Qs(ctx, ['me-1', 'me-1s', 'me-2', 'me-2s', 'me-3', 'me-3s', 'me-4', 'me-4s']),
      writtenResponse(ctx, 'explain-method', { prompt: 'Pick one system above. Why was your method the most efficient choice for it?', sample: 'In 5x + 2y = 34 and 3x − 2y = 6 the y terms are already opposites, so adding the equations removes y in one step. Substitution would mean dividing by 5 or 3 and working with fractions.' })),
    act(ctx, 'up-w-6', 'Independent challenge', 'More service orders', practiceBox()),
    badgeNote(ctx, 'workshop')
  ];
  afterRender(); return out;
}

// ================================================================ Stage 04: Run the Mountain
function mountainPage(ctx) {
  const { note, sim, para: Pa, practiceBox } = ctx;
  const out = [
    act(ctx, 'up-m-1', 'Activity 1', 'Mix the perfect dirt', photo('trails'), workbench(ctx, WB('mixture')),
      Pa('Some pump-track specifications call for a compacted surface of 70% clay and 30% sand. The crew needs 10 cubic yards at 70% clay, from Stockpile A (90% clay, 10% sand) and Stockpile B (50% clay, 50% sand).'),
      note('myth', 'a classroom model', SOIL_NOTE),
      predict(ctx, 'mix', { prompt: 'How much of each stockpile do you think the crew needs?', options: [{ id: 'more-a', text: 'More from A', right: false }, { id: 'equal', text: 'The same from each', right: true }, { id: 'more-b', text: 'More from B', right: false }],
        reveal: () => [sim('Dirt mixing station', mixStation(ctx)), Qs(ctx, ['mx-eq1', 'mx-clay', 'mx-eq2', 'mx-sol', 'mx-check', 'mx-2'])] })),
    act(ctx, 'up-m-2', 'Activity 2', 'The trail crew showdown', workbench(ctx, WB('rate')), Pa('Crew A has 300 ft of trail built and adds 120 ft a day. Crew B starts at zero but builds 160 ft a day.'), note('key', 'hypothetical rates', CREW_NOTE),
      predict(ctx, 'crew', { prompt: 'When do you think Crew B catches up?', options: [{ id: '5', text: 'About 5 days', right: false }, { id: '7.5', text: 'About 7½ days', right: true }, { id: '10', text: 'About 10 days', right: false }, { id: 'never', text: 'Never', right: false }],
        reveal: () => [sim('Crew progress simulator', crewSim(ctx)), Qs(ctx, ['cr-a', 'cr-b', 'cr-t', 'cr-d', 'cr-mean', 'cr-mph'])] })),
    act(ctx, 'up-m-3', 'Activity 3', 'Uplift break-even challenge', Pa('Back to the shuttle, with new pricing models.'), Qs(ctx, ['be-1', 'be-hi', 'be-which', 'be-same-rate', 'be-same-model']),
      sim('Pricing explorer', pricingGraph(ctx, { key: 'pricing2', openEdit: true }))),
    act(ctx, 'up-m-4', 'Activity 4', 'The operations method challenge', Pa('New problems from every department. For each: decide what the unknowns are, write the system, choose a method, solve and check.'),
      Qs(ctx, ['op-a-vars', 'op-a-method', 'op-a-sol', 'op-b-sys', 'op-b-sol', 'op-c-sol', 'op-d-check'])),
    act(ctx, 'up-m-5', 'Independent challenge', 'More operations', practiceBox()),
    badgeNote(ctx, 'mountain')
  ];
  afterRender(); return out;
}

// ================================================================ config
const SECTIONS = {
  shuttle: [['up-s-1', 'Choose your uplift plan'], ['up-s-2', 'Live pricing graph'], ['up-s-3', 'Explore the plans'], ['up-s-4', 'One, none, infinite'], ['up-s-5', 'Strategy challenge'], ['up-s-6', 'More packages']],
  fleet: [['up-f-1', 'Fleet inventory'], ['up-f-2', 'Substitution workshop'], ['up-f-3', 'Verify the fleet'], ['up-f-4', 'Choose what to substitute'], ['up-f-5', 'Fleet challenge'], ['up-f-6', 'More fleets']],
  workshop: [['up-w-1', 'Workshop invoices'], ['up-w-2', 'Eliminate the brake pads'], ['up-w-3', 'Order verification'], ['up-w-4', 'Coefficients don’t match'], ['up-w-5', 'Elimination or substitution?'], ['up-w-6', 'More orders']],
  mountain: [['up-m-1', 'Mix the perfect dirt'], ['up-m-2', 'Trail crew showdown'], ['up-m-3', 'Break-even challenge'], ['up-m-4', 'Operations method challenge'], ['up-m-5', 'More operations']]
};
const WRITTEN = { 'explain-intersection': 'Why the intersection solves the system', 'explain-method': 'Why a method was most efficient', 'cert-explain': 'Certification: checking both conditions' };
const KINDS = questionKinds();
const HOOKS = {
  shuttle: 'The uplift service needs a pricing strategy. Compare two shuttle plans on a live graph and find where they cost the same.',
  fleet: 'Stock the rental fleet: the right number of trail and downhill bikes to hit both the fleet size and the revenue target.',
  workshop: 'Two supplier invoices, two unknown prices. Use elimination to price every part the workshop needs.',
  mountain: 'Opening day is close. Mix the trail surface, schedule the crews and settle the shuttle pricing, with whichever method fits.'
};
const PAGES = { shuttle: shuttlePage, fleet: fleetPage, workshop: workshopPage, mountain: mountainPage };
function withFigs(set) { for (const v of Object.values(set)) if (v && v.fig && !v.figure) v.figure = () => figure(v.fig); return set; }
withFigs(QUESTIONS);
const practiceFor = {
  shuttle: { ids: SHUTTLE_PRACTICE_IDS, count: SHUTTLE_PRACTICE.length, questions: n => withFigs(shuttlePractice(n)), button: 'New packages', note: 'Break-even, then advise a rider.', kicker: 'Independent challenge' },
  fleet: { ids: FLEET_PRACTICE_IDS, count: FLEET_PRACTICE.length, questions: n => withFigs(fleetPractice(n)), button: 'New fleet', note: 'Isolate, substitute, solve.', kicker: 'Independent challenge' },
  workshop: { ids: WORKSHOP_PRACTICE_IDS, count: WORKSHOP_PRACTICE.length, questions: n => withFigs(workshopPractice(n)), button: 'New orders', note: 'Scale, add, solve.', kicker: 'Independent challenge' },
  mountain: { ids: MOUNTAIN_PRACTICE_IDS, count: MOUNTAIN_PRACTICE.length, questions: n => withFigs(mountainPractice(n)), button: 'New operations day', note: 'A mixture and a crew race.', kicker: 'Independent challenge' }
};
const certified = P => !!P.getData('certified', null);
// Equation setup, verification and method choices, for the report.
const GROUPS = { setup: ['model'], verify: ['verify'], method: ['method', 'choose-var'] };
function groupStats(P) {
  const out = {};
  for (const [g, ideas] of Object.entries(GROUPS)) {
    let n = 0, right = 0, indep = 0;
    for (const [k, r] of Object.entries(P.state.questions)) { if (!(r.attempts > 0 || r.revealed)) continue; if (!(KINDS[k.split('|')[0]] || []).some(i => ideas.includes(i))) continue; n++; if (r.correct && !r.revealed) right++; if (r.firstTry && !r.hints && !r.revealed) indep++; }
    out[g] = { n, right, indep };
  }
  return out;
}
const gs = x => (x && x.n ? `${x.right} of ${x.n} right (${x.indep} first try)` : '—');

export const LAB = {
  id: ID, title: 'Uplift', eventPrefix: 'uplift', rootClass: 'upl mtl ftl dlp', noun: 'lab',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Systems of Equations',
    lines: [], accent: 'Uplift',
    lede: 'Run the mountain. Solve the systems.',
    body: 'Welcome to your new mountain bike destination. You’ve been appointed Director of Operations, and the mountain is getting ready to open. The shuttle service needs a pricing strategy. The rental fleet needs to be organized. The workshop needs supplies. The trail crew needs materials and a construction schedule. You’ve got four major departments to get running: solve the problems, make the decisions and get this mountain ready for riders. Let’s open the mountain.',
    enter: 'Enter Operations HQ →', back: 'Back to Operations HQ →',
    meta: 'The Ultimate Bike Park Operations Challenge · 40–55 minutes · four departments and the Mountain Operations Certification · progress saves on this device',
    art: () => openingArt()
  },
  board: { title: 'Operations HQ', hook: 'Four departments, one opening day. Each stage earns a badge; all four unlock the Mountain Operations Certification.',
    extra: ctx => el('div', null, hq(ctx, MISSION_LIST), sharedTutorPanel(ctx, { missions: MISSION_LIST, sections: SECTIONS, written: WRITTEN, questions: QUESTIONS })), refsNote: PRICE_NOTE + ' ' + SOIL_NOTE + ' ' + CREW_NOTE, refs: REFS },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: { kicker: 'Opening day', title: 'Opening Day Command Center', blurb: 'Review all four departments, approve their numbers, and open the mountain.', hook: 'Every department has solved its problem. Check that each answer satisfies both of its conditions, then approve it.', page: ctx => [ctx.card(null, null, commandCenter(ctx, MISSION_LIST, certified(ctx.progress)))] },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: r => withFigs(finalQuestions(r)),
    title: 'Mountain Operations Certification', blurb: 'Ten new questions across all four topics, on your own.',
    hook: 'New plans, new systems, new operations problems. Graph, substitute, eliminate and model, and check both equations every time.',
    lockedHook: 'Earn all four department badges to unlock the Mountain Operations Certification.',
    doneShort: 'Certified operations director', doneTitle: 'Certified Bike Park Operations Director',
    doneLede: 'You compared plans by graphing, stocked a fleet by substitution, priced parts by elimination, and modeled mixtures, crews and break-even points with systems of equations.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new numbers.`,
    page: (ctx, F, key) => { const { card } = ctx, A = id => Q(ctx, id, { def: F[id], key, kicker: 'Certification' }); return [
      card('Part A', 'Graphing systems', A('fa-plot'), A('fa-type'), A('fa-interp')),
      card('Part B', 'Substitution', A('fb-choose'), A('fb-sol')),
      card('Part C', 'Elimination', A('fc-scale'), A('fc-sol')),
      card('Part D', 'Applications of systems', A('fd-model'), A('fd-sol'), A('fd-verify'),
        writtenResponse(ctx, 'cert-explain', { prompt: 'In a sentence or two: how do you know your Part D answer satisfies both conditions?', sample: 'I substituted both values into each original equation and both came out true, so the answer meets both conditions at once, not just one.' })),
      el('p', { class: 'ls-small' }, el('a', { href: '#extension' }, 'Go to the Opening Day Command Center →'))
    ]; }
  },
  report: { kicker: 'Session report', extra: (ctx, s) => reportBlocks(ctx, s, { objectives: OBJECTIVES, objectivesTitle: 'The four topics', kinds: KINDS, questions: QUESTIONS, ideas: IDEAS, missions: MISSIONS, stageWord: 'Stage',
    nextUnit: 'Next in Algebra 1: Exponents and exponential functions.', park: null, revisitLabel: 'Revisit a department', retryLabel: 'Retry certification', buttons: { view: ['View opening day dashboard', '#extension'] } }) },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => { const g = groupStats(P); return { badges: [...earnedBadges(P, MISSION_LIST)], destination: (P.getData('park', {}) || {}).destination || null, approved: (P.getData('approved', []) || []).length, setup: g.setup, verify: g.verify, method: g.method }; },
  stats: s => [['Badges', `${(s.badges || []).length} of 4`], ['Equation setup', gs(s.setup)], ['Verification', gs(s.verify)], ['Method selection', gs(s.method)], ['Departments approved', `${s.approved || 0} of 4`]]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }
if (typeof window !== 'undefined') window.Uplift = { mount, VERSION };
