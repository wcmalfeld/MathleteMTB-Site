// The Bike Park Blueprint Lab (Mathlete MTB, Algebra 2, Unit 3: Linear
// Systems and Matrices). The module's public entry point.
//
//   import { mount } from './blueprint.js';
//   mount(element, { studentId, storage: 'local' | 'memory' | { load, save },
//                    routing: 'hash' | 'memory',
//                    backLink, courseLink, breadcrumb,
//                    onAttempt(record), onProgress(summary), onComplete(summary) })
// Events also fire on the element: blueprint:attempt, :progress, :complete.
//
// It runs in the lesson kit's mission-board shell (learning-lab/lesson-kit/
// missions.js); this file is the lab's config and its four mission pages.
// Works with no options and no account, and without any AI service.

import { el } from '../lesson-kit/dom.js';
import { mountMissions } from '../lesson-kit/missions.js';
import { MISSIONS, QUESTIONS, FINAL_IDS, PASS_MARK, finalQuestions, questionKinds, IDEAS, REPORT_IDEAS, MISCONCEPTIONS, practice2, practice3, PRACTICE2_IDS, PRACTICE3_IDS } from './logic/questions.js';
import { ZONE, PARK, FEATURES, RESOURCES, PRACTICE_2, PRACTICE_3, FINAL_SETS, INVENTORY, TOOLS, CREWS, COST, augmented, A as Amat, eqText } from './logic/models.js';
import { mat } from './logic/matrix.js';
import { blueprintGraph, methodPanel, diagnoseGraph, planeSlices, rowConsole, inventoryWorkbench, costCalculator, dimensionChecker, matrixSolver, parkOptimizer } from './components/labs.js';
import { matrixView } from './components/matrix-view.js';
import { blueprintArt } from './components/visuals.js';

export const VERSION = '1.0.0';
export const ID = 'bike-park-blueprint-lab';
const REFS = [
  ['Common Core: Reasoning with Equations and Inequalities (HSA-REI, C.5–C.9)', 'https://www.thecorestandards.org/Math/Content/HSA/REI/'],
  ['Common Core: Creating Equations (HSA-CED, A.2–A.3)', 'https://www.thecorestandards.org/Math/Content/HSA/CED/'],
  ['OpenStax: Systems of linear equations in three variables', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/11-2-systems-of-linear-equations-three-variables'],
  ['OpenStax: Solve systems of equations using matrices', 'https://openstax.org/books/intermediate-algebra/pages/4-5-solve-systems-of-equations-using-matrices'],
  ['OpenStax: Matrices and matrix operations', 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/11-5-matrices-and-matrix-operations'],
  ['IMBA: Trail planning and design', 'https://www.imba.com/planning-design']
];
const table = (head, rows) => el('div', { class: 'ls-table-wrap' }, el('table', { class: 'ls-table' }, el('thead', null, el('tr', null, head.map(h => el('th', { scope: 'col' }, h)))),
  el('tbody', null, rows.map(r => el('tr', null, r.map((c, i) => (i ? el('td', { class: 'ms-mono' }, String(c)) : el('th', { scope: 'row' }, c))))))));

function designPage({ q, card, eq, explain, note, sim, para: P_, h3, practiceBox, ...ctx }) {
  return [
    card('Briefing', 'Berms and jumps',
      table(['Feature', 'Crew hours', 'Machine hours'], [['Berm module (x)', ZONE.needs.berm.crew, ZONE.needs.berm.machine], ['Jump feature (y)', ZONE.needs.jump.crew, ZONE.needs.jump.machine], ['Available', ZONE.available.crew, ZONE.available.machine]]),
      P_('Fictional planning estimates for this simulation, not construction standards. Find how many of each feature use exactly all of the crew’s hours.'),
      q('m1-model'),
      eq('4x + 3y = 17   and   2x + y = 7', [['x', 'berm modules'], ['y', 'jump features']])),
    card('Module A', 'Solve by graphing',
      P_('Each equation is a line: every plan that uses exactly that resource. The plan that uses both exactly is on both lines, at their intersection.'),
      sim('Blueprint graph', blueprintGraph(ctx)),
      q('m1-graph'), q('m1-meaning')),
    card('Module B', 'Solve by substitution',
      explain('Worked explanation', ['2x + y = 7  →  y = 7 − 2x', '4x + 3(7 − 2x) = 17', '4x + 21 − 6x = 17', '−2x = −4  →  x = 2', 'y = 7 − 2(2) = 3'], 'y and 7 − 2x are the same quantity, so one can replace the other.'),
      q('m1-sub'), q('m1-sub-x')),
    card('Module C', 'Solve by elimination',
      explain('Worked explanation', ['−3 × (2x + y = 7):  −6x − 3y = −21', 'add to 4x + 3y = 17:  −2x = −4', 'x = 2, then y = 3'], 'Making the y-terms opposites removes y, leaving one equation in one unknown.'),
      q('m1-elim'), q('m1-y'), q('m1-check')),
    card('Module D', 'When does a plan have no solution?',
      P_('Two lines can cross once (one solution), be parallel (no solution) or be the same line (infinitely many). Diagnose each blueprint; its graph appears after you answer.'),
      el('div', { class: 'bp-diagnose' }, [0, 1, 2].map(i => el('div', null, q('m1-d' + (i + 1), { kicker: 'Diagnose the blueprint' }), diagnoseGraph(ctx, i)))),
      q('m1-none-meaning'),
      note('key', 'redundant isn’t contradictory', 'Infinitely many solutions: the equations repeat the same information, so they don’t pin down one plan. No solution: they contradict each other, so no plan fits both.')),
    card('Independent practice', 'A new zone',
      P_('Choose a method, solve and interpret. Each new plan uses checked numbers with whole-number answers.'),
      methodPanel(ctx), practiceBox())
  ];
}

function parkPage({ q, card, eq, explain, note, sim, para: P_, practiceBox, ...ctx }) {
  return [
    card('Briefing', 'Three features, three resources',
      table(['Feature', ...RESOURCES], PARK.needs.map((r, i) => [FEATURES[i] + ' (' + 'xyz'[i] + ')', ...r]).concat([['Available', ...PARK.available]])),
      q('m2-soil'),
      eq('4x + 3y + 5z = 22   ·   2x + y + 3z = 10   ·   x + 2y + 2z = 10')),
    card('Module A', 'Three-variable systems',
      P_('Three unknowns need three independent equations. Each equation is a plane; the solution is where all three meet.'),
      sim('Slice the planes', planeSlices(ctx)),
      q('m2-planes')),
    card('Module B', 'Gaussian elimination',
      P_('An augmented matrix keeps only the numbers: each row is one equation; the columns are the x, y and z coefficients, then the constant.'),
      q('m2-aug'),
      ctx.live(() => ctx.progress.done('m2-aug') ? matrixView(augmented(Amat(), PARK.available), { aug: true, rowLabels: ['Crew', 'Machine', 'Soil'], colLabels: ['x', 'y', 'z', '='], name: 'Park' }) : el('p', { class: 'ls-small' }, 'Answer the question to see the labelled matrix.')),
      q('m2-r2'), q('m2-r3'), q('m2-z'), q('m2-back'),
      P_('Now run the whole route in the console: guided first, then try your own row operations.'),
      sim('Matrix elimination console', rowConsole(ctx)),
      q('m2-check'), q('m2-equivalent'),
      explain('Worked explanation: the whole route', ['R1 ↔ R3', 'R2 → R2 − 2R1,  R3 → R3 − 4R1', 'R3 → 3R3 − 5R2  (row 3 becomes 0 0 −4 | −4)', 'z = 1;  −3y − 1 = −10 → y = 3;  x + 6 + 2 = 10 → x = 2'], 'The same three equations, turned into an easier equivalent system.')),
    card('Independent practice', 'Systems of every kind',
      P_('Some of these have one solution, some none, some infinitely many. Switch the console to “Practice system” and Independent mode, eliminate, then answer.'),
      practiceBox(),
      note('key', 'reading the last row', 'A row 0 0 0 | c (c ≠ 0) says 0 = c: a contradiction, so no solution. A row 0 0 0 | 0 says 0 = 0: a redundant equation, so infinitely many.'))
  ];
}

function workshopPage({ q, card, eq, note, sim, para: P_, ...ctx }) {
  return [
    card('Module A', 'Read the inventory matrix',
      P_('A matrix is a rectangular arrangement of numbers in rows and columns. Rows here are crews; columns are tools.'),
      matrixView(mat(INVENTORY.A), { name: 'A', rowLabels: CREWS, colLabels: TOOLS, dims: true }),
      q('m3-dims'), q('m3-entry')),
    card('Modules B–D', 'Add, subtract, scale',
      P_('Addition and subtraction work position by position, so the matrices must have the same dimensions. A scalar multiplies every entry.'),
      el('div', { class: 'bp-row' }, matrixView(mat(INVENTORY.A), { name: 'A', rowLabels: CREWS, colLabels: TOOLS }), matrixView(mat(INVENTORY.B), { name: 'B', rowLabels: CREWS, colLabels: TOOLS })),
      P_('B is the second trailer’s delivery. S is the starting inventory and U the tools used:'),
      el('div', { class: 'bp-row' }, matrixView(mat(INVENTORY.S), { name: 'S', rowLabels: CREWS, colLabels: TOOLS }), matrixView(mat(INVENTORY.U), { name: 'U', rowLabels: CREWS, colLabels: TOOLS })),
      q('m3-add'), q('m3-add-dims'), q('m3-sub'), q('m3-scalar'),
      P_('Check your answers, and try more weekends, in the workbench. Select any entry to see its calculation.'),
      sim('Inventory workbench', inventoryWorkbench(ctx))),
    card('Module E', 'How much will the entire park cost?',
      P_('Matrix multiplication combines quantities and prices in one step: each entry is a row times a column, multiplied pair by pair and added.'),
      el('div', { class: 'bp-row' }, matrixView(mat(PARK.needs), { name: 'M', rowLabels: FEATURES, colLabels: RESOURCES }), matrixView(mat(COST.map(v => [v])), { name: 'C', rowLabels: ['$/crew h', '$/machine h', '$/soil load'] })),
      q('m3-mc'), q('m3-qm'), q('m3-total'), q('m3-dims-product'),
      P_('Now see every row-by-column step, and change the plan, the prices or (in practice) the resource matrix:'),
      sim('Matrix cost calculator', costCalculator(ctx)),
      q('m3-commute'), q('m3-entrywise'),
      sim('Dimension checker', dimensionChecker(ctx)),
      note('myth', 'order matters', 'AB and BA are usually different, and one of them may not exist at all. Always check that the inner dimensions match.'))
  ];
}

function solverPage({ q, card, eq, note, sim, para: P_, ...ctx }) {
  return [
    card('Module A', 'Build the matrix equation',
      eq('AX = B', [['A', 'coefficient matrix (3 × 3)'], ['X', 'the unknowns x, y, z (3 × 1)'], ['B', 'the resource totals (3 × 1)']]),
      q('m4-dims'), q('m4-row1'), q('m4-transpose')),
    card('Module B', 'Solving with an inverse matrix',
      eq('A⁻¹AX = A⁻¹B   →   IX = A⁻¹B   →   X = A⁻¹B'),
      P_('If A has an inverse, multiplying both sides on the left by A⁻¹ isolates X. A has an inverse exactly when det(A) ≠ 0.'),
      matrixView(Amat(), { name: 'A', dims: true }),
      q('m4-det'), q('m4-identity'),
      sim('Matrix equation solver', matrixSolver(ctx)),
      q('m4-solve'), q('m4-order')),
    card('Important teaching point', 'Not every matrix has an inverse',
      P_('Switch the solver to the singular examples: the same A (row 2 is twice row 1, so det = 0) with two different sets of totals. One set is dependent, the other inconsistent.'),
      q('m4-singular'),
      note('key', 'det = 0 isn’t the end', 'A zero determinant means no inverse and no unique solution. It doesn’t say which of “none” or “infinitely many” you have; elimination does.'))
  ];
}

const HOOKS = {
  design: 'The crew has a section of land to turn into a small jump and berm zone. Each feature needs different amounts of crew time and machine time. How many of each can they build using exactly the available resources?',
  park: 'The park has secured more space. Now there are three feature types and three resources to balance. How many of each feature can the crew build?',
  workshop: 'Several crews are working in different sections. Instead of long lists of numbers, the crew uses matrices to track equipment, materials and costs.',
  solver: 'The lead engineer wants the whole project as one matrix equation, solved in one move.'
};
const PAGES = { design: designPage, park: parkPage, workshop: workshopPage, solver: solverPage };
const practiceFor = {
  design: { ids: PRACTICE2_IDS, count: PRACTICE_2.length, questions: practice2, button: 'New zone plan', note: 'Checked numbers, whole-number answers.' },
  park: { ids: PRACTICE3_IDS, count: PRACTICE_3.length, questions: practice3, button: 'New practice system', note: 'One, none or infinitely many: elimination tells you which.' }
};

export const LAB = {
  id: ID, title: 'Bike Park Blueprint Lab', eventPrefix: 'blueprint', rootClass: 'bpl', noun: 'lab',
  questions: QUESTIONS, kinds: questionKinds(), ideas: IDEAS, reportIdeas: REPORT_IDEAS, misconceptions: MISCONCEPTIONS,
  open: {
    kicker: 'Algebra 2 · Unit 3: Linear Systems and Matrices',
    lines: ['Bike Park', 'Blueprint'], accent: 'Lab',
    lede: 'Your mountain bike park has a new development zone. The trail crew is ready, but resources are limited, there are several kinds of features, and the budget is fixed.',
    body: 'Before construction begins, you need to figure out exactly what the crew can build. Can you design the park?',
    enter: 'Start building →', back: 'Back to the blueprint →',
    meta: '20–25 minutes · four missions and a final build plan · progress saves on this device',
    art: () => blueprintArt()
  },
  board: {
    title: 'Mission stations', hook: 'Design the trail. Balance the resources. Solve the mathematics. Finish all four to unlock the Final Build Plan.',
    refsNote: 'All crew hours, machine hours, soil loads and prices are fictional planning numbers for this simulation, not construction standards or contractor estimates.',
    refs: REFS
  },
  missions: MISSIONS.map(m => ({ ...m, hook: HOOKS[m.id], page: PAGES[m.id], practice: practiceFor[m.id] || undefined })),
  extension: {
    kicker: 'Optional extension · the park optimizer', title: 'Can you build more with less?',
    blurb: 'Turn the equations into limits (inequalities) and find the biggest buildable plan.',
    hook: 'Instead of using exactly all the resources, the crew just can’t go over them. Now there are many possible plans. Which builds the most features?',
    page: ({ q, card, sim, note, para: P_, eq, ...ctx }) => [
      card(null, null, eq('4x + 3y ≤ 40   ·   2x + y ≤ 18   ·   x ≥ 0, y ≥ 0'), P_('Each inequality is a resource limit. Every point in the shaded region fits both. Maximise P = x + y, with whole numbers.'),
        sim('Park optimizer', parkOptimizer(ctx)), q('ext-corner'), q('ext-best'), q('ext-viable'),
        note('key', 'mathematical vs practical', 'Not every mathematical solution is a practical plan: feature counts must be non-negative whole numbers. This is the first idea of linear programming.'))
    ]
  },
  final: {
    ids: FINAL_IDS, passMark: PASS_MARK, sets: FINAL_SETS.length, questions: finalQuestions,
    title: 'The Final Build Plan', blurb: 'Solve a two-variable plan and a three-variable park, then cost it against the budget.',
    hook: 'The park is almost ready to open. Figure out the build plan, solve the equations, and calculate the resources and cost. Can you put it all together?',
    lockedHook: 'Finish all four missions to unlock the Final Build Plan.',
    doneShort: 'Park designer certified', doneTitle: 'Park designer certified',
    doneLede: 'You planned a trail network, balanced construction resources, solved multi-variable systems, and used matrices to calculate your complete project requirements.',
    notYet: x => `${x.right} of ${x.total} right this round. Look back at the solutions, then try a fresh round with a new plan.`,
    page: ({ q, card, para: P_ }, F, key) => {
      const S = F.set, T = S.three;
      return [
        card('Challenge A', 'Solve the two-variable plan', P_(`${eqText(S.two.p)} (crew hours) · ${eqText(S.two.q)} (machine hours).`),
          ['fa-vars', 'fa-solve', 'fa-meaning', 'fa-verify'].map(id => q(id, { def: F[id], key, kicker: 'Challenge A' }))),
        card('Challenge B', 'Solve the full park plan', ['fb-aug', 'fb-solve', 'fb-meaning'].map(id => q(id, { def: F[id], key, kicker: 'Challenge B' }))),
        card('Challenge C', 'Calculate resources and cost',
          el('div', { class: 'bp-row' }, matrixView(mat(PARK.needs), { name: 'M', rowLabels: FEATURES, colLabels: RESOURCES }), matrixView(mat(COST.map(v => [v])), { name: 'C' })),
          ['fc-qm', 'fc-cost', 'fc-budget'].map(id => q(id, { def: F[id], key, kicker: 'Challenge C' })))
      ];
    }
  },
  report: { kicker: 'Lab report' },
  // Row operations performed in the elimination console (the PRD tracks them).
  summaryExtra: P => ({ rowOps: (P.getData('console', null) || {}).ops || 0, systemsSolved: ['m1-sub-x', 'm2-back', 'm4-solve'].filter(id => P.earned(id)).length }),
  stats: s => [['Row operations', String(s.rowOps)], ['Systems solved', String(s.systemsSolved)]]
};

export function mount(target, opts = {}) { return mountMissions(target, LAB, opts); }

if (typeof window !== 'undefined') window.BikeParkBlueprintLab = { mount, VERSION };
