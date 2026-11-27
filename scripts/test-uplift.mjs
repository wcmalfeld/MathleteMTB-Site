#!/usr/bin/env node
// Tests for Uplift (learning-lab/uplift/): the PRD's section 29 calculations,
// the systems engine (classification from structure, substitution and
// elimination steps, verification), the misconception list (section 30),
// every question in every practice set and certification round, and the
// curriculum mapping.
//   node scripts/test-uplift.mjs   (add -v to list every check)

const base = new URL('../learning-lab/uplift/', import.meta.url);
const Y = await import(new URL('logic/systems.js', base));
const K = await import(new URL('logic/park.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const EQ = await import(new URL('../learning-lab/lesson-kit/equation.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const sol = (a, b) => { const r = Y.solve(typeof a === 'string' ? Y.std(a) : a, typeof b === 'string' ? Y.std(b) : b); return r.kind === 'one' ? [Number(r.x), Number(r.y)] : r.kind; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const both = (e1, e2, x, y) => Y.check(e1, e2, x, y).both;

// ---- 1. Graphing systems ----
ok('C = 8r + 12 and C = 4r + 36: one solution, (6, 60)', same(sol('y = 8x + 12', 'y = 4x + 36'), [6, 60]) && same([Number(Q.QUESTIONS['sh-solve'].answer), Q.QUESTIONS['sh-cost'].answer], [6, 60]));
ok('y = 6x + 20 and y = 6x + 30: no solution', sol('y = 6x + 20', 'y = 6x + 30') === 'none');
ok('y = 8(x + 2) and y = 8x + 16: infinitely many', sol('y = 8(x + 2)', 'y = 8x + 16') === 'infinite');
ok('Classification uses structure, not a failed solve: scaled copies are infinite, scaled with a new constant are none', Y.solve(Y.E(2, 4, 10), Y.E(1, 2, 5)).kind === 'infinite' && Y.solve(Y.E(2, 4, 10), Y.E(1, 2, 6)).kind === 'none' && Y.solve(Y.E(0, 3, 6), Y.E(0, 1, 2)).kind === 'infinite');
ok('Vertical lines are handled: x = 4 and y = 2x → (4, 8); x = 4 and x = 5 → none', same(sol('x = 4', 'y = 2x'), [4, 8]) && sol('x = 4', 'x = 5') === 'none');
ok('Strategy challenge: 9r + 15 and 6r + 45 break even at (10, 105)', same(sol('y = 9x + 15', 'y = 6x + 45'), [10, 105]));

// ---- 2. Substitution ----
ok('x + y = 18, 60x + 90y = 1260 → (12, 6)', same(sol(K.FLEET.e1, K.FLEET.e2), [12, 6]));
ok('Verification: 12 + 6 = 18 and 60(12) + 90(6) = 1260', both(K.FLEET.e1, K.FLEET.e2, 12, 6) && 60 * 12 === 720 && 90 * 6 === 540);
ok('Second fleet: x + y = 20, 50x + 80y = 1240 → (12, 8)', same(sol(K.FLEET_2.e1, K.FLEET_2.e2), [12, 8]) && both(K.FLEET_2.e1, K.FLEET_2.e2, 12, 8));
ok('x + 2y = 16 and x = 4y − 2 → (10, 3)', same(sol('x + 2y = 16', 'x = 4y - 2'), [10, 3]));
const ss = Y.substitutionSteps(K.FLEET.e1, K.FLEET.e2, 'x', 1).steps.map(s => s.text);
ok('Substitution steps match the PRD: x = 18 − y, 60(18 − y) + 90y = 1260, 1080 − 60y + 90y = 1260, y = 6, x = 12', same(ss, ['x = 18 − y', '60(18 − y) + 90y = 1260', '1080 − 60y + 90y = 1260', '30y + 1080 = 1260', 'y = 6', 'x = 12']), ss);
ok('Substitution recognises infinitely many and no solution', /always true/.test(Y.substitutionSteps(Y.E(-8, 1, 16), Y.E(-8, 1, 16), 'y', 1).steps.pop().note) && /never true/.test(Y.substitutionSteps(Y.E(-6, 1, 20), Y.E(-6, 1, 30), 'y', 1).steps.pop().note));
ok('Fractional solutions stay exact: x − 2y = 1, 4x + 2y = 9 → (2, 1/2)', (r => String(r.x) === '2' && String(r.y) === '1/2')(Y.solve(Y.E(1, -2, 1), Y.E(4, 2, 9))));

// ---- 3. Elimination ----
ok('2x + 3y = 310, 4x + 3y = 470 → (80, 50), both invoices verify', same(sol(K.INVOICES.e1, K.INVOICES.e2), [80, 50]) && both(K.INVOICES.e1, K.INVOICES.e2, 80, 50));
const es = Y.eliminationSteps(K.INVOICES.e1, K.INVOICES.e2, 'y').steps.map(s => s.text);
ok('Matching 3y: subtract Invoice A from Invoice B to get 2x = 160', es[1] === '2x = 160' && /^\(4x \+ 3y = 470\) − \(2x \+ 3y = 310\)$/.test(es[0]), es);
ok('3x + 2y = 260, 2x + 3y = 240 → (60, 40), both verify', same(sol(K.ORDERS.e1, K.ORDERS.e2), [60, 40]) && both(K.ORDERS.e1, K.ORDERS.e2, 60, 40));
const em = Y.eliminationSteps(K.ORDERS.e1, K.ORDERS.e2, 'y');
ok('Scaling: × 3 and × −2 give 9x + 6y = 780 and −4x − 6y = −480, then 5x = 300', same(em.multipliers, [3, -2]) && em.steps[0].text.endsWith('9x + 6y = 780') && em.steps[1].text.endsWith('−4x − 6y = −480') && em.steps[2].text === '5x = 300', em.steps.map(s => s.text));
ok('Elimination recognises no solution (0 = 10)', /never true/.test(Y.eliminationSteps(Y.E(6, -1, -20), Y.E(6, -1, -30), 'x').steps.pop().note));

// ---- 4. Applications ----
const M = Y.mixture(K.MIX), B = Y.blend(5, 5, 90, 50);
ok('Mixture: x + y = 10, 0.90x + 0.50y = 7 → (5, 5)', same([Number(M.x), Number(M.y)], [5, 5]) && Y.eqText(M.e2) === '0.9x + 0.5y = 7');
ok('Mixture check: 10 yd³ total, 7 yd³ clay, 70% clay, 30% sand', Number(B.total) === 10 && Number(B.clay) === 7 && Number(B.pct) === 70 && Number(B.sand) / Number(B.total) === 0.3);
const R = Y.rateMeet(K.CREWS.a, K.CREWS.b);
ok('Rate: D = 300 + 120t and D = 160t → t = 7.5 days, D = 1200 ft', Number(R.t) === 7.5 && Number(R.D) === 1200);
ok('Equal rates never meet; equal rates and starts always level', Y.rateMeet({ start: 100, rate: 50 }, { start: 0, rate: 50 }).kind === 'none' && Y.rateMeet({ start: 0, rate: 50 }, { start: 0, rate: 50 }).kind === 'infinite');
const BE = Y.breakEven(K.PLANS.a, K.PLANS.b);
ok('Break-even: 12 + 8r = 36 + 4r → r = 6, $60', Number(BE.r) === 6 && Number(BE.C) === 60);
ok('Break-even scenarios: higher fee/lower rate (10, $80), same rate (none), same model (infinite)', (r => Number(r.r) === 10 && Number(r.C) === 80)(Y.breakEven({ fee: 50, rate: 3 }, { fee: 20, rate: 6 })) && Y.breakEven({ fee: 25, rate: 5 }, { fee: 40, rate: 5 }).kind === 'none' && sol('y = 5(x + 4)', 'y = 20 + 5x') === 'infinite');

// ---- 5. Misconceptions (section 30) ----
const q = id => Q.QUESTIONS[id], fc = (x, field, raw) => V.checkNumber(x.fields.find(f => f.id === field), raw).code, nc = (id, raw) => V.checkNumber(q(id), raw).code, ec = (id, raw) => E.checkExpression(q(id), raw).code, lc = (id, raw) => EQ.checkLine(q(id), raw).code, has = (id, c) => q(id).options.some(o => !o.correct && o.code === c);
ok('Confusing the x- and y-coordinates of an intersection', nc('sh-solve', '60') === 'swap-xy' && fc(q('be-1'), 'x', '60') === 'swap-xy' && has('sh-interp', 'swap-xy'));
ok('Assuming every system has a solution', has('ty-none', 'always-solution') && has('sc-same', 'always-solution'));
ok('Confusing no solution with infinitely many', has('ty-none', 'none-vs-infinite') && has('ty-inf', 'none-vs-infinite') && has('be-same-model', 'none-vs-infinite'));
ok('Finding an intersection without interpreting it', has('sh-interp', 'no-interpret') && has('cr-mean', 'no-interpret'));
ok('Isolating a variable incorrectly (y − 18)', ec('fl-iso', 'y - 18') === 'isolate-error');
ok('Substituting without parentheses', has('fl-sub', 'no-parens'));
ok('Solving or checking only one equation', has('fl-only', 'one-equation') && has('op-d-check', 'one-equation') && fc(q('fl-check'), 'e2', '720') === 'one-equation');
ok('Failing to verify in both equations', has('fl-only', 'no-verify'));
ok('Adding before aligning coefficients', has('mm-add', 'unaligned-add') && has('mm-plan', 'unaligned-add'));
ok('Multiplying only one side when scaling', has('mm-plan', 'one-side-scale') && fc(q('mm-s1'), 'c', '260') === 'one-side-scale');
ok('Changing signs incorrectly during subtraction', has('ws-sub', 'sign-subtract') && has('ws-op', 'sign-subtract'));
ok('Mixing up mixture quantity and concentration', nc('mx-clay', '70') === 'quantity-concentration' && lc('mx-eq2', '0.9x + 0.5y = 70') === 'quantity-concentration');
ok('Mixing up rates, times and distances (mph vs hours)', nc('cr-t', '1200') === 'rate-time' && nc('cr-mph', '30') === 'rate-time' && nc('cr-mph', '3') === 'rate-time');
ok('Accepting a fractional number of bikes without checking the context', has('fl-frac', 'fractional-count'));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); codes.delete('wrong'); const miss = [...codes].filter(c => !Q.MISCONCEPTIONS[c]); return miss.length === 0 || (console.log(miss), false); })());

// ---- 6. Every question ----
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'fields') { if (!V.checkFields(x.fields, Object.fromEntries(x.fields.map(f => [f.id, String(f.answer)]))).correct) bad.push('own answer'); if (x.fields.some(f => (f.traps || []).some(t => V.checkNumber(f, String(t.value)).correct))) bad.push('trap = answer'); }
  if (x.type === 'expression') { if (!E.checkExpression(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => E.checkExpression(x, t.expr).correct)) bad.push('trap = answer'); }
  if (x.type === 'line') { if (!EQ.checkLine(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => EQ.checkLine(x, t.eq).correct)) bad.push('trap = answer'); }
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.type === 'plot') { const G = x.grid; if (!x.targets.every(t => t.x >= G.x[0] && t.x <= G.x[1] && t.y >= G.y[0] && t.y <= G.y[1] && (!G.profile || ((t.x - G.x[0]) % (G.sx || 1) === 0 && (t.y - G.y[0]) % (G.sy || 1) === 0)))) bad.push('targets off-grid'); if (!G.profile) bad.push('plot grids use profile mode'); if (!(G.lines || []).every(l => l.pts.every(([a, b]) => a >= G.x[0] - 1e-9 && a <= G.x[1] + 1e-9 && b >= G.y[0] - 1e-9 && b <= G.y[1] + 1e-9))) bad.push('lines leave the grid'); }
  if (x.type === 'lineplot') { const G = x.grid, L = x.line; const onGrid = []; for (let a = G.x[0]; a <= G.x[1]; a += G.sx || 1) { const b = L.m * a + L.b; if (b >= G.y[0] && b <= G.y[1] && (b - G.y[0]) % (G.sy || 1) === 0) onGrid.push(a); } if (onGrid.length < 2) bad.push('fewer than two grid points on the line'); }
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.SHUTTLE_PRACTICE, Q.shuttlePractice, Q.SHUTTLE_PRACTICE_IDS, 'shuttle'], [Q.FLEET_PRACTICE, Q.fleetPractice, Q.FLEET_PRACTICE_IDS, 'fleet'], [Q.WORKSHOP_PRACTICE, Q.workshopPractice, Q.WORKSHOP_PRACTICE_IDS, 'workshop'], [Q.MOUNTAIN_PRACTICE, Q.mountainPractice, Q.MOUNTAIN_PRACTICE_IDS, 'mountain']])
  for (let n = 0; n < list.length; n++) { const S_ = fn(n); for (const id of ids) { const r = checkQ(id, S_[id], name + n); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const X = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, X[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 6));
ok('Practice fleets, orders and plans all have whole-number, nonnegative answers', [0, 1, 2, 3, 4, 5].every(n => { const f = Q.fleetPractice(n)['flx-sol'].fields, w = Q.workshopPractice(n)['wsx-sol'].fields, s = Q.shuttlePractice(n)['shx-meet'].fields; return [...f, ...w, ...s].every(x => Number.isInteger(x.answer) && x.answer >= 0); }));
ok('Certification: 10 questions (graphing 3, substitution 2, elimination 2, applications 3), pass mark 8, four rounds', Q.FINAL_IDS.length === 10 && Q.PASS_MARK === 8 && Q.FINAL_SETS.length === 4
  && same(['fa', 'fb', 'fc', 'fd'].map(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length), [3, 2, 2, 3]));
ok('Certification rounds use different values from the guided activities and from each other', new Set([1, 2, 3, 4].map(r => Q.finalQuestions(r)['fa-plot'].targets[0].name)).size === 4 && [1, 2, 3, 4].every(r => Q.finalQuestions(r)['fa-plot'].targets[0].name !== '(6, 60)'));
ok('Certification covers all three solution types and every application kind', (s => s.has('one') && s.has('none') && s.has('infinite'))(new Set(Q.FINAL_SETS.map(x => x.type[2]))) && same(Q.FINAL_SETS.map(x => x.app.kind).sort(), ['breakeven', 'fleet', 'mixture', 'rate']));
ok('Certification solution-type answers match the engine', Q.FINAL_SETS.every(x => Y.solve(Y.std(x.type[0]), Y.std(x.type[1])).kind === x.type[2]));
ok('Certification “verify” claims satisfy equation 1 only', [1, 2, 3, 4].every(r => { const X = Q.FINAL_SETS[r - 1], e1 = Y.E(...X.sub[0]), e2 = Y.E(...X.sub[1]), t = Q.finalQuestions(r)['fd-verify'].prompt.match(/\((−?[\d/]+), (−?[\d/]+)\)/); const x = t[1].replace('−', '-'), y = t[2].replace('−', '-'); return Y.satisfies(e1, x, y) && !Y.satisfies(e2, x, y); }));
ok('Certification substitution systems have exactly one easy variable', Q.FINAL_SETS.every(x => [x.sub[0][0], x.sub[0][1], x.sub[1][0], x.sub[1][1]].filter(c => Math.abs(c) === 1).length === 1));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));
ok('Three destinations (imagery only) and four departments, each tied to a stage', K.DESTINATIONS.length === 3 && K.DEPARTMENTS.length === 4 && K.DEPARTMENTS.every(d => Q.MISSIONS.some(m => m.id === d.mission)));

// ---- 7. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'uplift'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), KI = Q.questionKinds();
ok('Activity registered at /learning-lab/uplift/', act && act.route === 'learning-lab/uplift/' && act.tracking.gameId === 'uplift' && act.home === 'alg1.graphing-systems');
ok('Every question kind maps to real skills', Object.keys(KI).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics and every skill of Systems of Equations', (m => m.length === 12 && m.every(s => act.skills.includes(s.id)))(model.skills.filter(s => ['graphing-systems', 'substitution', 'elimination', 'applications-of-systems'].includes(s.topic.slug) && s.topic.course.id === 'alg1')));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 4 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique, and never clash with practice or certification ids', (() => { const seen = new Set(); const stage = Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); const other = [...Q.SHUTTLE_PRACTICE_IDS, ...Q.FLEET_PRACTICE_IDS, ...Q.WORKSHOP_PRACTICE_IDS, ...Q.MOUNTAIN_PRACTICE_IDS, ...Q.FINAL_IDS]; return stage && other.every(id => !seen.has(id)) && new Set(other).size === other.length; })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
