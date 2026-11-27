// The Dream Line Project (Mathlete MTB, Algebra 1, Unit 1: Foundations of
// Algebra). The module's public entry point.
//
//   import { mount } from './dream-line.js';
//   mount(element, { studentId, storage, routing, backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: dreamline:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js). The board holds the park studio (the persistent canvas,
// feature library and build plan) and the tutor panel; this file is the
// lab's config and its four stage pages. Works with no options and no
// account, and without any AI service.

import { el, button, put } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, FINAL_SETS, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, OBJECTIVES, MISCONCEPTIONS,
  BUILD_PRACTICE, BUILD_PRACTICE_IDS, buildPractice, ORDER_PRACTICE, ORDER_PRACTICE_IDS, orderPractice, PROP_PRACTICE, PROP_PRACTICE_IDS, propPractice,
  CHALLENGES, BOARD, MISTAKES } from './logic/questions.js';
import { CARDS, NATURAL_NOTE } from './logic/numbers.js';
import { PLANNING_NOTE, buildPlan, featureTotal } from './logic/park.js';
import { parkStudio, parkMini, finishedPark, getPark, earnedBadges, badgeRow } from './components/park.js';
import { workbench, predict, predictionStats, writtenResponse, WRITTEN, contributionBars, termParts, anatomyExplorer, calcBoard, fractionDisplay, crewSheet,
  elevationViz, fractionMapper, decimalStrip, challengeCard, markerGroups, numberSetDiagram, commutativeDemo, associativeDemo, identityDemo, inverseDemo,
  distributiveDemo, likeTermsDemo, tutorOf, TUTOR_DEFAULTS, jump, afterRender } from './components/labs.js';
import { openingArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'dream-line-project';
const REFS = [
  ['Common Core: Seeing Structure in Expressions (HSA-SSE.A.1)', 'https://www.thecorestandards.org/Math/Content/HSA/SSE/'],
  ['Common Core: Expressions and Equations, grade 6 (6.EE.A: write, read and evaluate expressions)', 'https://www.thecorestandards.org/Math/Content/6/EE/'],
  ['Common Core: The Real Number System (8.NS, HSN-RN)', 'https://www.thecorestandards.org/Math/Content/HSN/RN/'],
  ['OpenStax Prealgebra 2e: Evaluate, simplify and translate expressions', 'https://openstax.org/books/prealgebra-2e/pages/2-1-use-the-language-of-algebra'],
  ['OpenStax Elementary Algebra 2e: Properties of real numbers', 'https://openstax.org/books/elementary-algebra-2e/pages/1-10-properties-of-real-numbers']
];

let MISSION_LIST = [];   // LAB.missions (with their practice sets), for badges
const act = (ctx, id, kicker, title, ...kids) => { const c = ctx.card(kicker, title, ...kids); c.id = id; return c; };
const done = (P, ids) => ids.every(id => P.done(id));
function badgeNote(ctx, mid) {
  return ctx.live(() => {
    const m = MISSION_LIST.find(x => x.id === mid), got = earnedBadges(ctx.progress, MISSION_LIST).has(mid);
    return el('div', { class: 'dl-badge-card' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('p', null, got ? el('b', null, `${m.badge.toUpperCase()} badge earned.`) : el('span', null, `Finish every question in this stage (including the independent challenge) to earn the `, el('b', null, m.badge.toUpperCase()), ' badge.')));
  });
}
const mini = ctx => parkMini(ctx, MISSION_LIST, { badges: false });

// ================================================================ Stage 01: Create the Blueprint
function blueprintPage(ctx) {
  const { q, eq, note, sim, para: Pa, h3, practiceBox, live } = ctx, P = ctx.progress;
  const out = [
    act(ctx, 'dl-bp-brief', 'Construction brief', 'Estimate the build',
      Pa('Your build crew has been hired to create a new park. Each feature requires a certain amount of crew time, and the team needs to estimate how much time the park will take to build.'),
      el('ul', { class: 'dl-brief' }, el('li', null, 'Each tabletop requires 4 crew-hours.'), el('li', null, 'Each berm requires 3 crew-hours.'), el('li', null, 'Initial site preparation requires 5 crew-hours.')),
      el('dl', { class: 'ls-where dl-defs' }, [['t', 'number of tabletops'], ['b', 'number of berms'], ['H', 'total estimated crew-hours']].map(([a, b]) => el('div', null, el('dt', null, a), el('dd', null, b)))),
      note('key', 'fictional planning numbers', PLANNING_NOTE)),
    act(ctx, 'dl-bp-1', 'Activity 1', 'Build the expression', workbench(ctx, 'expressions'),
      Pa('“Every tabletop requires four hours of shaping. Every berm requires three hours. Preparing the site takes five additional hours.” How could we represent the total build time without knowing how many tabletops and berms we will build?'),
      q('b-term', { kicker: 'Guided' }), q('b-build', { kicker: 'Build it with the blocks (or type)' })),
    act(ctx, 'dl-bp-2', 'Activity 2', 'Expression anatomy', workbench(ctx, 'anatomy'),
      el('dl', { class: 'ls-where dl-defs' }, [['Variables', 'quantities that can change'], ['Coefficients', 'numbers that multiply variables'], ['Constants', 'fixed values'], ['Terms', 'the separate parts, split by + and −']].map(([a, b]) => el('div', null, el('dt', null, a), el('dd', null, b)))),
      eq('H = 4t + 3b + 5'), q('a-vars'), q('a-coef'), q('a-const'), q('a-terms'),
      sim('The blueprint, part by part', anatomyExplorer(ctx))),
    act(ctx, 'dl-bp-3', 'Activity 3', 'Translate the builder’s notes',
      Pa('Type each expression. A number next to a letter means multiply (6w = 6 × w); use + and − between terms.'),
      q('tr-wood', { kicker: 'Note 1' }), q('tr-jump-berm', { kicker: 'Note 2' }), q('tr-kits', { kicker: 'Note 3' }), q('tr-feature', { kicker: 'Note 4' })),
    act(ctx, 'dl-bp-4', 'Activity 4', 'Explain the blueprint', eq('H = 4t + 3b + 5'),
      q('ex-var'), q('ex-coef'), q('ex-const'), q('ex-more'), q('ex-fixed'),
      writtenResponse(ctx, 'explain-blueprint', { prompt: WRITTEN['explain-blueprint'] + ': what changes, what stays fixed, and why.', sample: 'H is the total crew-hours. t and b are the numbers of tabletops and berms, which change depending on the design. Each tabletop takes 4 hours, so the tabletops need 4t hours; each berm takes 3 hours, so 3b. The 5 is site preparation, which stays the same however many features we build. If we add a tabletop, H goes up by 4.' })),
    act(ctx, 'dl-bp-5', 'Activity 5', 'Design your own line',
      Pa('Add features to your park. Every feature you place updates its count, its variable and the expression, and the changed term lights up. (This is the same park as on the mission board.)'),
      sim('Park studio', parkStudio(ctx, MISSION_LIST)),
      h3('Predict first'),
      predict(ctx, 'two-tabletops', { prompt: 'A plan has 3 tabletops and 2 berms (H = 23). The crew adds two new tabletops. Will H increase by 4, 8 or 12 hours?',
        options: [{ id: '4', text: '4 hours', right: false }, { id: '8', text: '8 hours', right: true }, { id: '12', text: '12 hours', right: false }],
        reveal: () => [el('div', { class: 'dl-reveal' }, el('p', { class: 'ms-live-eq' }, 'Before: H = 4(3) + 3(2) + 5 = 23'), el('p', { class: 'ms-live-eq' }, 'After:  H = 4(', el('b', null, '5'), ') + 3(2) + 5 = 31'),
          el('p', null, 'H went up by 8: only the tabletop term changed, from 12 to 20.')), q('b-two')] })),
    act(ctx, 'dl-bp-6', 'Independent challenge', 'More builder’s notes', practiceBox()),
    badgeNote(ctx, 'blueprint')
  ];
  afterRender();
  return out;
}

// ================================================================ Stage 02: Plan the Build
function yourParkCheck(ctx) {
  const P = ctx.progress, park = getPark(P), plan = buildPlan(park);
  if (!featureTotal(park)) return el('p', { class: 'ls-small' }, 'Place some features in your park (on the mission board) and you can evaluate its own build plan here too.');
  const inp = el('input', { type: 'text', class: 'ls-input', id: 'dl-own-h', inputmode: 'decimal', autocomplete: 'off' }), fb = el('p', { class: 'ls-small', role: 'status', 'aria-live': 'polite' });
  const check = () => { const v = Number(String(inp.value).replace(/[^\d.-]/g, '')); fb.textContent = !inp.value.trim() ? 'Type your total first.' : v === plan.total ? `✓ Right: ${plan.substituted} = ${plan.total} crew-hours.` : 'Not yet: substitute each count, multiply, then add the 5.'; };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  return el('div', { class: 'ls-card ms-ask dl-own' }, el('p', { class: 'ls-kicker' }, 'Your own park · a self-check, not marked'),
    el('p', { class: 'ls-prompt' }, `Your park’s plan is ${plan.expression}, with ${plan.variables.map(v => v.letter + ' = ' + v.value).join(', ')}. Evaluate it.`),
    el('div', { class: 'ls-field' }, el('label', { for: 'dl-own-h' }, 'H (crew-hours)'), inp), el('div', { class: 'ls-actions' }, button('Check', check, 'ls-btn--quiet')), fb);
}
function planPage(ctx) {
  const { q, eq, note, sim, para: Pa, h3, live } = ctx, P = ctx.progress;
  const out = [
    mini(ctx),
    act(ctx, 'dl-pl-1', 'Activity 1', 'Calculate the construction plan', workbench(ctx, 'evaluate'),
      Pa('The blueprint is finished. Now the crew needs to know exactly how many hours to book. Replace each variable with its value, then calculate.'),
      eq('H = 4t + 3b + 5', [['t = 3', 'tabletops'], ['b = 2', 'berms']]),
      q('p-sub', { kicker: 'Step 1: substitute' }), q('p-total', { kicker: 'Step 2: evaluate' }),
      live(() => done(P, ['p-total']) ? sim('Where the hours go', contributionBars([['Tabletop shaping 4(3)', 12, 'is-a'], ['Berm shaping 3(2)', 6, 'is-b'], ['Site preparation', 5, 'is-c']], 'crew-hours')) : null),
      yourParkCheck(ctx)),
    act(ctx, 'dl-pl-2', 'Activity 2', 'Elevation mapping', workbench(ctx, 'negatives'),
      eq('Ef = Ei + ΔE', [['Ef', 'final elevation'], ['Ei', 'initial elevation'], ['ΔE', 'signed elevation change']]),
      el('ul', { class: 'dl-brief' }, el('li', null, 'Positive values can represent elevation gains.'), el('li', null, 'Negative values can represent elevation losses.'), el('li', null, 'Adding a negative value means subtracting that amount.')),
      q('el-sub'), q('el-final'),
      sim('Vertical elevation indicator', elevationViz(ctx)),
      q('el-two'), q('el-meaning')),
    act(ctx, 'dl-pl-3', 'Activity 3', 'Mapping fractions', workbench(ctx, 'fractions'),
      eq('D = (3/4)L', [['L', 'planned network length (mi)'], ['D', 'distance mapped (mi)']]),
      q('fr-d'), sim('Trail map sections', fractionMapper(ctx)), q('fr-two')),
    act(ctx, 'dl-pl-4', 'Activity 4', 'Decimal measurements',
      q('dc-one'), live(() => done(P, ['dc-one']) ? decimalStrip([1.25, 0.75], 'mi') : null), q('dc-two'), q('dc-three')),
    act(ctx, 'dl-pl-5', 'Activity 5', 'Prediction and evaluation challenges',
      Pa('Five challenges, from beginner to advanced. For each: predict, lock in your prediction, substitute, evaluate, then see the worked solution.'),
      CHALLENGES.map(c => challengeCard(ctx, c))),
    badgeNote(ctx, 'plan')
  ];
  afterRender();
  return out;
}

// ================================================================ Stage 03: Organize the Materials
function materialsPage(ctx) {
  const { q, eq, note, sim, para: Pa, h3, practiceBox, live } = ctx, P = ctx.progress;
  const B = id => ({ ...QUESTIONS[id], id });
  const mistake = id => MISTAKES.find(m => m.id === id);
  const out = [
    mini(ctx),
    act(ctx, 'dl-mt-1', 'Activity 1', 'The inventory calculation', workbench(ctx, 'order'),
      Pa('You’re the construction inventory manager. The park has three feature zones. Each zone needs 18 standard boundary markers and a square 2-by-2 arrangement of four feature markers. There are also 12 extra perimeter markers shared across the entire park.'),
      eq('M = 3(18 + 2²) + 12'),
      el('ol', { class: 'dl-brief' }, el('li', null, 'Grouping symbols first (and inside them, the same order again).'), el('li', null, 'Exponents.'), el('li', null, 'Multiplication and division, left to right.'), el('li', null, 'Addition and subtraction, left to right.')),
      q('in-first'), q('in-total'), sim('Marker groups, step by step', markerGroups(ctx))),
    act(ctx, 'dl-mt-2', 'Activity 2', 'The Shaper’s Calculation Board',
      Pa('Each operation is a button. Choose the one that should be completed next; it’s simplified and highlighted, and the step is logged. When two operations share a priority, work left to right.'),
      BOARD.map(b => calcBoard(ctx, B(b.id)))),
    act(ctx, 'dl-mt-3', 'Activity 3', 'Parentheses change everything', workbench(ctx, 'grouping'),
      predict(ctx, 'parens', { prompt: 'Which will be bigger: 3(6 + 2) or 3 × 6 + 2?', options: [{ id: 'a', text: '3(6 + 2)', right: true }, { id: 'b', text: '3 × 6 + 2', right: false }, { id: 'same', text: 'They’re equal', right: false }],
        reveal: () => [q('pa-a'), q('pa-b'), live(() => done(P, ['pa-a', 'pa-b']) ? note('key', 'grouping changes the result', '3(6 + 2) = 24 but 3 × 6 + 2 = 20. The brackets make the addition happen first.') : null)] }),
      h3('More grouping'), q('pa-c'), q('pa-d')),
    act(ctx, 'dl-mt-4', 'Activity 4', 'The fraction bar challenge',
      Pa('A supply order has 18 standard markers and 6 additional markers. Divide the complete quantity equally among three park zones.'),
      el('div', { class: 'dl-frac-row' }, fractionDisplay('18 + 6', '3', '18 plus 6, over 3'), el('span', { class: 'dl-big' }, '='), el('span', { class: 'dl-big' }, '(18 + 6) ÷ 3')),
      note('key', 'the fraction bar groups', 'Everything above the bar is one group (the numerator) and everything below is another (the denominator).'),
      q('fb-parts'), q('fb-val'),
      el('div', { class: 'dl-frac-row' }, fractionDisplay('30 − 6', '2 + 4', '30 minus 6, over 2 plus 4')), q('fb-two')),
    act(ctx, 'dl-mt-5', 'Activity 5', 'Catch the crew’s mistake', workbench(ctx, 'errors'),
      Pa('These calculations were written by the construction crew. Find the first line that goes wrong, and work out the fix.'),
      crewSheet(mistake('cm1')), q('cm1-line'), q('cm1-why'),
      crewSheet(mistake('cm2')), q('cm2-line'),
      crewSheet(mistake('cm3')), q('cm3-line'), q('cm3-fix'),
      crewSheet(mistake('cm4')), q('cm4-line'),
      crewSheet(mistake('cm5')), q('cm5-line'), q('cm5-fix')),
    act(ctx, 'dl-mt-6', 'Independent challenge', 'Another inventory sheet', live(() => { const n = P.getData('variant:materials', 0), O = ORDER_PRACTICE[n % ORDER_PRACTICE.length]; return crewSheet(O); }), practiceBox()),
    badgeNote(ctx, 'materials')
  ];
  afterRender();
  return out;
}

// ================================================================ Stage 04: The Builder's Math Toolkit
function toolkitPage(ctx) {
  const { q, eq, note, sim, para: Pa, h3, practiceBox, live } = ctx;
  const out = [
    mini(ctx),
    act(ctx, 'dl-tk-1', 'Activity 1', 'The number sorting challenge', workbench(ctx, 'numbers'),
      Pa('Natural ⊂ Whole ⊂ Integers ⊂ Rational ⊂ Real. Irrational numbers are also real numbers, but they aren’t rational.'),
      note('key', 'natural numbers start at 1', NATURAL_NOTE),
      el('div', { class: 'dl-cards' }, CARDS.map(c => el('span', { class: 'dl-numcard' }, el('b', null, c.label), el('span', null, c.context)))),
      CARDS.map(c => q('ns-' + c.id, { kicker: 'Card ' + c.label })),
      sim('Number-set diagram', live(() => numberSetDiagram(ctx))),
      h3('Quick checks'), q('ns-zero-why'), q('ns-pi-why')),
    act(ctx, 'dl-tk-2', 'Activity 2', 'The properties workshop', workbench(ctx, 'properties'),
      h3('A. Commutative property'), Pa('The order of numbers can change when adding or multiplying without changing the result: 4 + 6 = 6 + 4 and 4 × 6 = 6 × 4. Four equipment bundles plus six equipment bundles is the same total in either order.'),
      sim('Equipment bundles', commutativeDemo(ctx)), q('pc-which'),
      h3('B. Associative property'), Pa('Three piles of equipment: combine the first two before adding the third, or combine the last two first. (2 + 3) + 4 = 2 + (3 + 4).'),
      sim('Regroup the piles', associativeDemo(ctx)), q('as-non'),
      h3('C. Identity property'), identityDemo(), q('id-mult'),
      h3('D. Inverse property'), Pa('Equal and opposite elevation changes cancel: 7 + (−7) = 0. A nonzero number times its reciprocal is 1: 4 × (1/4) = 1. Zero has no multiplicative inverse.'),
      sim('Opposites and reciprocals', inverseDemo(ctx)), q('inv-add'), q('inv-mult'), q('inv-zero'),
      h3('E. Distributive property'), workbench(ctx, 'distributive'), Pa('Five builders each need two flags and three markers: 5(2 + 3). Count whole kits, 5(5) = 25, or distribute, 5(2) + 5(3) = 10 + 15 = 25.'),
      sim('Distribute the kits', distributiveDemo(ctx)), q('di-dist'), q('di-x'), q('di-eval'),
      h3('F. Combining like terms'), workbench(ctx, 'likeTerms'), Pa('Three planned tabletops plus two more is five tabletops: 3t + 2t = 5t. But 3t + 2b can’t become 5tb or 5t: tabletops and berms are different quantities.'),
      sim('Feature tiles', likeTermsDemo(ctx)), q('lt-a'), q('lt-b'), q('lt-c')),
    act(ctx, 'dl-tk-3', 'Activity 3', 'Identify the property',
      Pa('Rapid fire: name the property each statement uses. Then catch a crew member who used one incorrectly.'),
      ['ip-1', 'ip-2', 'ip-3', 'ip-4', 'ip-5', 'ip-6'].map((id, i) => q(id, { kicker: 'Card ' + (i + 1) })), q('ip-wrong', { kicker: 'Catch the misuse' })),
    act(ctx, 'dl-tk-4', 'Independent challenge', 'New workshop cards', practiceBox()),
    badgeNote(ctx, 'toolkit')
  ];
  afterRender();
  return out;
}

// ================================================================ tutor mode (on the board)
const SECTIONS = {
  blueprint: [['dl-bp-1', 'Build the expression'], ['dl-bp-2', 'Expression anatomy'], ['dl-bp-3', 'Translate the builder’s notes'], ['dl-bp-4', 'Explain the blueprint'], ['dl-bp-5', 'Design your own line'], ['dl-bp-6', 'More builder’s notes']],
  plan: [['dl-pl-1', 'Calculate the plan'], ['dl-pl-2', 'Elevation mapping'], ['dl-pl-3', 'Mapping fractions'], ['dl-pl-4', 'Decimal measurements'], ...CHALLENGES.map(c => ['dl-' + c.id, 'Challenge: ' + c.skill.toLowerCase()])],
  materials: [['dl-mt-1', 'The inventory calculation'], ['dl-mt-2', 'Calculation board'], ['dl-mt-3', 'Parentheses change everything'], ['dl-mt-4', 'Fraction bar'], ['dl-mt-5', 'Catch the crew’s mistake'], ['dl-mt-6', 'Another inventory sheet']],
  toolkit: [['dl-tk-1', 'Number sorting'], ['dl-tk-2', 'Properties workshop'], ['dl-tk-3', 'Identify the property'], ['dl-tk-4', 'New workshop cards']]
};
function tutorPanel(ctx) {
  const P = ctx.progress, T = tutorOf(P);
  const toggle = (k, label, help) => {
    const cid = 'dl-tut-' + k, cb = el('input', { type: 'checkbox', id: cid });
    cb.checked = !!T[k];
    cb.addEventListener('change', () => { P.setData('tutor', { ...tutorOf(P), [k]: cb.checked }); });
    return el('div', { class: 'dl-tut-opt' }, el('label', { class: 'dl-check', for: cid }, cb, ' ', el('b', null, label)), el('p', { class: 'ls-small' }, help));
  };
  const written = Object.entries(P.state.written).filter(([k, v]) => !k.includes(':working') && String(v).trim());
  return el('details', { class: 'ls-card dl-tutor' }, el('summary', null, el('span', { class: 'dl-wb-tag' }, 'For tutors'), ' Tutor mode'),
    el('p', { class: 'ls-small' }, 'Settings apply on this device and never reset progress. Solutions shown early count as help in the report, not as independent work.'),
    el('div', { class: 'dl-tut-grid' },
      toggle('predict', 'Require predictions', 'Prediction-first steps must be committed before the calculation unlocks.'),
      toggle('hints', 'Show hints', 'Turn off to hide the hint buttons.'),
      toggle('reveal', 'Allow solutions any time', 'Show the solution button before two tries.')),
    el('p', { class: 'ls-kicker' }, 'Go to a challenge'),
    el('div', { class: 'dl-tut-jumps' }, MISSIONS.map(m => el('div', null, el('p', { class: 'dl-tut-m' }, `Stage ${m.n}: ${m.short}`),
      el('ul', null, SECTIONS[m.id].map(([id, label]) => el('li', null, el('a', { href: '#' + m.id, onclick: () => { jump.target = id; } }, label))))))),
    el('p', { class: 'ls-kicker' }, 'Written responses'),
    written.length ? el('ul', { class: 'dl-tut-written' }, written.map(([k, v]) => el('li', null, el('b', null, (WRITTEN[k] || k) + (P.getData('review:' + k, false) ? ' · flagged for review' : '') + ': '), String(v))))
      : el('p', { class: 'ls-small' }, 'No written responses yet.'));
}

// ================================================================ the results screen additions
function objectiveRows(P) {
  const K = KINDS, rows = OBJECTIVES.map(o => ({ ...o, answered: 0, firstTry: 0, right: 0, hints: 0, revealed: 0, help: 0 }));
  for (const [k, r] of Object.entries(P.state.questions)) {
    if (!(r.attempts > 0 || r.revealed)) continue;
    const ideas = K[k.split('|')[0]] || [];
    for (const o of rows) if (ideas.some(i => o.ideas.includes(i))) {
      o.answered++; if (r.firstTry && !r.hints && !r.revealed) o.firstTry++;
      if (r.correct && !r.revealed) o.right++; if (r.correct && !r.revealed && (!r.firstTry || r.hints)) o.help++;
      o.hints += r.hints; if (r.revealed) o.revealed++;
    }
  }
  return rows;
}
function reportExtra(ctx, s) {
  const P = ctx.progress, rows = objectiveRows(P), recs = Object.entries(P.state.questions).filter(([, r]) => r.attempts > 0 || r.revealed);
  const indep = recs.filter(([, r]) => r.firstTry && !r.hints && !r.revealed).length, helped = recs.filter(([, r]) => r.correct && !r.revealed && (!r.firstTry || r.hints)).length, shown = recs.filter(([, r]) => r.revealed).length;
  const review = recs.filter(([, r]) => r.revealed || r.attempts >= 3).slice(0, 10).map(([k]) => { const id = k.split('|')[0], qd = QUESTIONS[id]; return qd ? qd.prompt : (k.includes('|r') ? 'Final certification: ' + id : 'Independent challenge: ' + id); });
  const pr = predictionStats(P), cert = s.certification;
  const pct = (a, b) => (b ? Math.round(100 * a / b) + '%' : '—');
  const unlocked = s.unlocked;
  const go = h => () => { location.hash = h; };
  return el('div', null,
    ctx.card('Accuracy by learning objective', 'The four subtopics',
      el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table ms-report' }, el('thead', null, el('tr', null, ['Objective', 'Answered', 'Independent (first try, no hints)', 'Right after help', 'Solutions shown'].map(h => el('th', { scope: 'col' }, h)))),
        el('tbody', null, rows.map(o => el('tr', null, el('th', { scope: 'row' }, o.name), el('td', { class: 'ms-mono' }, String(o.answered)), el('td', { class: 'ms-mono' }, o.answered ? `${o.firstTry} (${pct(o.firstTry, o.answered)})` : '—'), el('td', { class: 'ms-mono' }, String(o.help)), el('td', { class: 'ms-mono' }, String(o.revealed))))))),
      el('dl', { class: 'ms-stats' }, [['Answered independently', String(indep)], ['Right after hints or retries', String(helped)], ['Solutions shown', String(shown)], ['Predictions made', String(pr.made)], ['Predictions in range', pr.judged ? `${pr.right} of ${pr.judged}` : '—'],
        ['Certification', cert ? `${cert.right} of ${cert.total}, ${cert.firstTry} independent` : unlocked ? 'unlocked' : 'locked']].map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))),
      el('p', { class: 'ls-small' }, 'Independent means right on the first try with no hints. Answers reached after hints, retries or a shown solution are practice with help, not demonstrated mastery, and a correct prediction is never counted as mastery.')),
    review.length ? ctx.card('For review', 'Questions needing more practice', el('ul', { class: 'ms-miscon' }, review.map(t => el('li', null, t)))) : null,
    s.practice.length ? ctx.card('Suggested next', 'Where to go next', el('ul', { class: 'ms-miscon' }, s.practice.map(i => { const m = MISSIONS.find(mm => mm.graded.some(id => (KINDS[id] || []).includes(i))); return el('li', null, IDEAS[i], m ? [' · ', el('a', { href: '#' + m.id }, 'revisit Stage ' + m.n + ': ' + m.short)] : null); })),
      el('p', { class: 'ls-small' }, 'Next in Algebra 1: Solving Equations and Inequalities, where these expressions become equations.')) : null,
    parkMini(ctx, MISSION_LIST, { kicker: 'Your final park blueprint', edit: false }),
    el('div', { class: 'ls-actions dl-report-btns' },
      el('a', { class: 'ls-btn ls-btn--quiet', href: '#board' }, 'Revisit a stage'),
      unlocked ? button('Retry the certification', () => { P.setData('finalRound', P.getData('finalRound', 1) + (s.final.done ? 1 : 0)); go('#final')(); }, 'ls-btn--quiet') : null,
      el('a', { class: 'ls-btn ls-btn--primary', href: '#extension' }, 'View my dream park')));
}

// ================================================================ the lab config
const KINDS = questionKinds();
const HOOKS = {
  blueprint: 'You’re the lead designer. Before the park can be built, you need a blueprint: an expression that estimates the crew time for any design.',
  plan: 'The blueprint is finished. Now the construction crew needs real numbers: substitute values for the variables and calculate.',
  materials: 'The inventory requirements are in, but the calculations are mixed up. As inventory manager, work out the right quantities and catch the crew’s mistakes.',
  toolkit: 'Before you finish, learn how the number systems fit together, and how the properties of real numbers make calculations simpler.'
};
const PAGES = { blueprint: blueprintPage, plan: planPage, materials: materialsPage, toolkit: toolkitPage };
const practiceFor = {
  blueprint: { ids: BUILD_PRACTICE_IDS, count: BUILD_PRACTICE.length, questions: buildPractice, button: 'New builder’s note', note: 'Different features, numbers and letters.', kicker: 'Independent challenge' },
  materials: { ids: ORDER_PRACTICE_IDS, count: ORDER_PRACTICE.length, questions: orderPractice, button: 'New inventory sheet', note: 'A new expression and a new crew calculation.', kicker: 'Independent challenge' },
  toolkit: { ids: PROP_PRACTICE_IDS, count: PROP_PRACTICE.length, questions: propPractice, button: 'New cards', note: 'A new property card and a new number.', kicker: 'Independent challenge' }
};

export const LAB = {
  id: ID, title: 'The Dream Line Project', eventPrefix: 'dreamline', rootClass: 'dlp', noun: 'project',
  questions: QUESTIONS, kinds: KINDS, ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 1 · Unit 1: Foundations of Algebra',
    lines: ['The Dream', 'Line'], accent: 'Project',
    lede: 'Every mountain biker has imagined their dream jump park. Now you get to build yours.',
    body: 'You’ve been given a piece of land, a construction crew and a blank canvas. Your mission is to create the ultimate mountain bike playground. You’ll need to design the features, organize the materials and use mathematics to bring your vision to life. Let’s get shaping.',
    enter: 'Start building →', back: 'Back to your park →',
    meta: '35–50 minutes · four stages and a final certification · progress saves on this device',
    art: () => openingArt()
  },
  board: {
    title: 'Your park and the build stages', hook: 'Design your park here, then work through the four build stages. Each stage earns a badge and lights up a landmark on your map; all four unlock the Final Algebra Certification.',
    extra: ctx => el('div', null, ctx.card('Park studio', 'Design your dream line', parkStudio(ctx, MISSION_LIST)), tutorPanel(ctx)),
    refsNote: PLANNING_NOTE, refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] })),
  extension: {
    kicker: 'Your park', title: 'The finished park blueprint',
    blurb: 'Name your park, describe it, and see every feature with its build-plan expression and badges.',
    hook: 'Here’s the park your algebra planned. Give it a name and describe what its expression means.',
    page: ctx => [ctx.card(null, null, finishedPark(ctx, MISSION_LIST))]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'Final Algebra Certification', blurb: 'Ten new questions across all four subtopics, on your own.',
    hook: 'Your park is designed and planned. Show what you can do on your own: expressions, substitution, the order of operations and the properties of real numbers.',
    lockedHook: 'Earn all four stage badges to unlock the Final Algebra Certification.',
    doneShort: 'Certified park designer', doneTitle: 'Certified park designer',
    doneLede: 'You described your park with variables, planned it by evaluating expressions, organized its materials with the order of operations, and used the properties of real numbers to simplify the builder’s calculations.',
    notYet: x => `${x.right} of ${x.total} right this round (the pass mark is ${PASS_MARK}). Look back at the solutions, then try a fresh round with new numbers.`,
    page: (ctx, F, key) => { const { q, card, para: Pa } = ctx; return [
      parkMini(ctx, MISSION_LIST, { kicker: 'The finished park blueprint' }),
      card('Part A', 'Variables and expressions', ['fa-build', 'fa-parts'].map(id => q(id, { def: F[id], key, kicker: 'Part A' }))),
      card('Part B', 'Evaluating expressions', ['fb-sub', 'fb-neg', 'fb-frac'].map(id => q(id, { def: F[id], key, kicker: 'Part B' }))),
      card('Part C', 'Order of operations', q('fc-order', { def: F['fc-order'], key, kicker: 'Part C' }), crewSheet(F.set.error), q('fc-error', { def: F['fc-error'], key, kicker: 'Part C' })),
      card('Part D', 'Properties of real numbers', ['fd-class', 'fd-prop', 'fd-apply'].map(id => q(id, { def: F[id], key, kicker: 'Part D' })))
    ]; }
  },
  report: { kicker: 'Session report', extra: reportExtra },
  tutor: P => { const T = tutorOf(P); return { reveal: T.reveal, adapt: T.hints ? null : def => ({ ...def, hints: [] }) }; },
  summaryExtra: P => { const park = getPark(P), pr = predictionStats(P); return { park: { env: park.env, name: park.name, features: featureTotal(park), hours: buildPlan(park).total, expression: buildPlan(park).expression }, predictions: pr, badges: [...earnedBadges(P, MISSION_LIST)] }; },
  stats: s => [['Badges', `${(s.badges || []).length} of 4`], ['Park features', String(s.park ? s.park.features : 0)], ['Predictions made', String(s.predictions ? s.predictions.made : 0)]]
};
MISSION_LIST = LAB.missions;

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.DreamLineProject = { mount, VERSION };
export { TUTOR_DEFAULTS };
