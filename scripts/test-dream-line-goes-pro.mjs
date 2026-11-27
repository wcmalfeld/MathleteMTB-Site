#!/usr/bin/env node
// Tests for The Dream Line Goes Pro (learning-lab/dream-line-goes-pro/) and
// the kit's equation engine (learning-lab/lesson-kit/equation.js): every
// table in the PRD's section 30, the solver's moves and its tempting wrong
// moves, the PRD's misconception list (section 31), formula rearrangements
// checked by exact substitution (never one numeric answer), number-line
// sets, the Unit 1 continuity, every question in every practice variant and
// certification round, and the curriculum mapping.
//   node scripts/test-dream-line-goes-pro.mjs   (add -v to list every check)

const base = new URL('../learning-lab/dream-line-goes-pro/', import.meta.url);
const EQ = await import(new URL('../learning-lab/lesson-kit/equation.js', import.meta.url));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const { Frac } = await import(new URL('../learning-lab/lesson-kit/frac.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const Q = await import(new URL('logic/questions.js', base));
const FM = await import(new URL('logic/formulas.js', base));
const PJ = await import(new URL('logic/project.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const { createProgress } = await import(new URL('../learning-lab/lesson-kit/progress.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const sol = (t, o) => EQ.solution(t, o).set;
const val = t => { const s = sol(t); return s.kind === 'one' ? Number(s.value) : s.kind; };

// ---- 1. The PRD's tables (section 30) ----
for (const [e, want] of [['x + 8 = 23', 15], ['x - 6 = 18', 24], ['4x = 28', 7], ['x / 3 = 8', 24], ['3t = 42', 14], ['-3x = 18', -6]]) ok(`One-step: ${e} → ${want}`, val(e) === want, val(e));
for (const [e, want] of [['45 + 12h = 105', 5], ['3(x + 4) + 2(x + 1) = 29', 3], ['4(x + 3) + 2x = 42', 5], ['30 + 15x = 150', 8], ['3(x + 2) + 4 = 28', 6]]) ok(`Multi-step: ${e} → ${want}`, val(e) === want, val(e));
ok('PRD correction: 4(x + 3) + 2x = 38 gives 13/3, not 3; the lab uses = 30, which gives 3', String(sol('4(x + 3) + 2x = 38').value) === '13/3' && val('4(x + 3) + 2x = 30') === 3 && Q.QUESTIONS['ch-zones'].answer === 3);
ok('Both sides: 18 + 6f = 30 + 4f → f = 6 (both cost 54)', val('18 + 6f = 30 + 4f') === 6 && Number(E.value('18 + 6(6)')) === 54 && Number(E.value('30 + 4(6)')) === 54);
ok('Both sides: 12 + 5f = 20 + 5f → no solution', sol('12 + 5f = 20 + 5f').kind === 'none');
ok('Both sides: 3(f + 4) = 3f + 12 → infinitely many', sol('3(f + 4) = 3f + 12').kind === 'all');
const lit = (form, vals) => Number(E.evaluate(EQ.parseRelation(form, { keepCase: true }).parts[1], vals));
ok('Literal: d = 4.8, r = 16 → t = 0.3 h = 18 min', lit('t = d/r', { d: 4.8, r: 16 }) === 0.3 && lit('t = d/r', { d: 4.8, r: 16 }) * 60 === 18);
ok('Literal: d = 9, t = 0.5 → r = 18 km/h', lit('r = d/t', { d: 9, t: 0.5 }) === 18);
ok('Literal: R = 18, L = 300 → G = 6%; G = 6, L = 300 → R = 18 ft; G = 6, R = 18 → L = 300 ft', lit('G = 100R/L', { R: 18, L: 300 }) === 6 && lit('R = GL/100', { G: 6, L: 300 }) === 18 && lit('L = 100R/G', { R: 18, G: 6 }) === 300);
ok('Literal: P = 30, T = 50 → S = 15 mm; S = 15, T = 50 → P = 30%; P = 30, S = 15 → T = 50 mm', lit('S = PT/100', { P: 30, T: 50 }) === 15 && lit('P = 100S/T', { S: 15, T: 50 }) === 30 && lit('T = 100S/P', { S: 15, P: 30 }) === 50);
const ineq = (t, o) => EQ.setText(sol(t, o));
ok('Inequalities: 45 + 12h ≤ 105 → h ≤ 5; 180 − 12x ≥ 60 → x ≤ 10', ineq('45 + 12h ≤ 105') === 'h ≤ 5' && ineq('180 - 12x ≥ 60') === 'x ≤ 10');
ok('Inequalities: 36 ≤ 8x + 4 ≤ 84 → 4 ≤ x ≤ 10; x + 4 ≤ 12 → x ≤ 8; 3x + 6 > 18 → x > 4', ineq('36 ≤ 8x + 4 ≤ 84') === '4 ≤ x ≤ 10' && ineq('x + 4 ≤ 12') === 'x ≤ 8' && ineq('3x + 6 > 18') === 'x > 4');
ok('Inequalities: 100R/300 ≤ 8 → R ≤ 24 (capital letters kept)', ineq('100R/300 ≤ 8', { keepCase: true }) === 'R ≤ 24');
const OR = Q.QUESTIONS['or-graph'].target;
ok('x < 2 OR x > 8: two separate regions (0 and 9 in, 2, 5 and 8 out)', OR.kind === 'or' && [0, 9, 8.5].every(x => EQ.contains(OR, x)) && ![2, 5, 8].some(x => EQ.contains(OR, x)));
ok('Whole-number domains: h ≤ 5 allows 0…5; 0 ≤ x ≤ 10 kits', [0, 1, 2, 3, 4, 5].every(h => 45 + 12 * h <= 105) && 45 + 12 * 6 > 105 && 180 - 12 * 10 >= 60 && 180 - 12 * 11 < 60);
ok('The PRD’s hint example: 4x + 12 = 42 → 4x = 30 → x = 7.5', EQ.solution('4x + 12 = 42').lines.join('|') === '4x + 12 = 42|4x = 30|x = 7.5');

// ---- 2. The solver's moves ----
const steps = t => EQ.solution(t).lines.join(' | ');
ok('Order of moves: distribute, combine, undo the constant, undo the coefficient', steps('3(x + 4) + 2(x + 1) = 29') === '3(x + 4) + 2(x + 1) = 29 | 3x + 12 + 2x + 2 = 29 | 5x + 14 = 29 | 5x = 15 | x = 3');
ok('Both sides: subtract the smaller variable term first', EQ.moves(EQ.start('18 + 6f = 30 + 4f')).next.label === 'Subtract 4f from both sides');
ok('Dividing an inequality by a negative reverses it (and says so)', (() => { const m = EQ.moves(EQ.apply(EQ.start('180 - 12x ≥ 60'), EQ.moves(EQ.start('180 - 12x ≥ 60')).next)).next; return m.flip && /reverse the sign/.test(m.label); })());
ok('Compound inequalities: each move applies to all three parts', EQ.moves(EQ.start('36 ≤ 8x + 4 ≤ 84')).next.label === 'Subtract 4 from all three parts');
ok('A negative coefficient in a compound inequality flips and reorders: −6 ≤ −2x ≤ 4 → −2 ≤ x ≤ 3', EQ.setText(EQ.solution('-6 ≤ -2x ≤ 4').set) === '−2 ≤ x ≤ 3' && EQ.stateText(EQ.solution('-6 ≤ -2x ≤ 4').state) === '−2 ≤ x ≤ 3');
ok('x/3 = 8 is undone by multiplying by 3', EQ.moves(EQ.start('x/3 = 8')).next.label === 'Multiply both sides by 3');
ok('The solver never ends in an unsolved state for any equation in the lab', Object.values(Q.QUESTIONS).filter(q => q.type === 'solver').every(q => { const s = EQ.solution(q.eq, { keepCase: q.keepCase }); const f = EQ.finished(s.state); return f.done && EQ.sameSet(s.set, EQ.solve(q.eq, null)) || f.done && f.vanished; }));
// ---- 3. The misconceptions (section 31) ----
const wrongCodes = t => { let st = EQ.start(t), codes = new Set(); for (let g = 0; g < 10; g++) { const M = EQ.moves(st); M.wrong.forEach(w => codes.add(w.code)); if (!M.next) break; st = EQ.apply(st, M.next); } return codes; };
ok('Offered wrong moves: one side only, wrong inverse, dividing before the constant', (c => c.has('one-side') && c.has('wrong-inverse') && c.has('divide-before-constant'))(wrongCodes('45 + 12h = 105')));
ok('Offered wrong moves: partial distribution and combining unlike terms', (c => c.has('distribute-partial') && c.has('combine-unlike'))(wrongCodes('3(x + 4) + 2(x + 1) = 29')));
ok('Offered wrong move: forgetting to reverse the inequality', wrongCodes('180 - 12x ≥ 60').has('no-flip'));
ok('Partial distribution shows the real mistake: 3x + 4 + 2x + 1', EQ.moves(EQ.start('3(x + 4) + 2(x + 1) = 29')).wrong.find(w => w.code === 'distribute-partial').result[0] === '3x + 4 + 2x + 1');
ok('Typed inequality, sign not reversed → no-flip; open vs closed → open-closed', EQ.checkInequality({ answer: 'x ≤ 10', flip: true }, 'x ≥ 10').code === 'no-flip' && EQ.checkInequality({ answer: 'x ≤ 10' }, 'x < 10').code === 'open-closed');
ok('Typed inequality must be solved: 3x + 6 > 18 isn’t accepted as the answer x > 4', EQ.checkInequality({ answer: 'x > 4' }, '3x + 6 > 18').code === 'unreadable' && EQ.checkInequality({ answer: 'x > 4' }, '4 < x').correct);
ok('Typed equation must come from the story: t = 14 isn’t 3t = 42; 42 = 3x is', EQ.checkEquation({ answer: '3t = 42' }, 't = 14').code === 'unreadable' && EQ.checkEquation({ answer: '3t = 42' }, '42 = 3x').correct);
ok('No solution vs infinitely many are told apart', EQ.solve('7 + 3x = 3x + 11').kind === 'none' && EQ.solve('5x + 10 = 5(x + 2)').kind === 'all');
ok('Rearranging upside down (r/d) or with the wrong operation (dr) is caught', E.checkExpression(Q.QUESTIONS['fm-t-form'], 'r/d').code === 'rearrange-flip' && E.checkExpression(Q.QUESTIONS['fm-t-form'], 'd*r').code === 'rearrange-wrong-op');
ok('Losing units: 0.3 h is 18 min, and 30 is flagged', V.checkNumber(Q.QUESTIONS['fm-min'], '30').code === 'time-units');
ok('Horizontal run vs along-trail distance: the trail is longer than the run', Math.sqrt(300 ** 2 + 18 ** 2) > 300 && Q.QUESTIONS['gr-run'].options.find(o => o.correct).text.startsWith('No'));
ok('An OR set is never the same as the AND interval between its ends', !EQ.sameSet(OR, { kind: 'interval', v: 'x', lo: new Frac(2), hi: new Frac(8), loIn: false, hiIn: false }));

// ---- 4. Formula rearrangements: equivalent by exact substitution ----
const samples = [[2, 3], [5, 7], [11, 13], [1.5, 0.25]];
let formulaBad = [];
for (const f of Object.values(FM.FORMULAS)) {
  const iso = FM.ISOLATED[f.id], others = Object.keys(f.vars).filter(k => k !== iso), R0 = EQ.parseRelation(f.base, { keepCase: true });
  for (const [a, b] of samples) {
    const vals = { [others[0]]: a, [others[1]]: b }; vals[iso] = E.evaluate(R0.parts[1], vals);
    for (const [k, form] of Object.entries(f.forms)) if (!EQ.relationAt(form, vals, { keepCase: true }).zero) formulaBad.push(form);
    for (const [k, stp] of Object.entries(f.steps)) for (const s of stp) { if (!EQ.relationAt(s.result, vals, { keepCase: true }).zero) formulaBad.push(s.result); }
  }
  for (const [k, stp] of Object.entries(f.steps)) { const last = stp[stp.length - 1].result, R = EQ.parseRelation(last, { keepCase: true }); if (!R.parts.some(p => p.t === 'var' && p.name === k)) formulaBad.push('ends without ' + k + ' alone: ' + last); }
}
ok('Every form and every studio step of d = rt, G = 100R/L and P = 100S/T is equivalent (checked at four exact points)', formulaBad.length === 0, formulaBad);
ok('A wrong rearrangement fails that check (r/d is not d/r)', !EQ.relationAt('t = r/d', { d: 4.8, r: 16, t: 0.3 }).zero);

// ---- 5. Project continuity ----
const mem = (() => { const m = {}; return { load: k => (m[k] ? JSON.parse(m[k]) : null), save: (k, v) => { m[k] = JSON.stringify(v); }, remove: k => { delete m[k]; }, m }; })();
ok('No Unit 1 park: a starter project', PJ.loadProject({ storage: mem }).fromUnit1 === false && PJ.projectSummary(PJ.starterPark()).features > 0);
mem.save('mathlete-dream-line-project:v1:guest', { version: 1, data: { park: { env: 'backyard', name: 'Back 40', slots: ['tabletop', 'berm'] } }, questions: {}, visited: {}, written: {} });
const pr = PJ.loadProject({ storage: mem });
ok('A Unit 1 park is brought forward (name, environment, features)', pr.fromUnit1 && pr.park.name === 'Back 40' && pr.park.env === 'backyard' && PJ.projectSummary(pr.park).features === 2);
ok('Loading the project never writes Unit 1’s record', JSON.parse(mem.m['mathlete-dream-line-project:v1:guest']).data.park.name === 'Back 40' && Object.keys(mem.m).length === 1);
ok('Approval: plans B and E pass; each condition agrees with the inequality engine', PJ.APPROVAL.plans.filter(PJ.passes).map(p => p.id).join() === 'B,E' && PJ.APPROVAL.plans.every(p => PJ.CONSTRAINTS.every(c => c.test(p) === EQ.contains(EQ.solve(c.ineq.replace('k', 'x').replace('R', 'x').replace('100x / 300', '100x/300'), 'x'), c.id === 'grade' ? p.rise : p.kits))));

// ---- 6. Every question ----
function checkQ(id, q, where) {
  const bad = [];
  if (!q || !q.prompt || !Array.isArray(q.ideas) || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!q.hints || q.hints.length !== 3 || !q.solution) bad.push('hints/solution');
  if (q.type === 'number') { if (!V.checkNumber(q, String(q.answer)).correct) bad.push('own answer'); if ((q.traps || []).some(t => V.checkNumber(q, String(t.value)).correct)) bad.push('trap = answer'); }
  if (q.type === 'expression') { if (!E.checkExpression(q, q.answer).correct) bad.push('own answer'); if ((q.traps || []).some(t => E.checkExpression(q, t.expr).correct)) bad.push('trap = answer'); }
  if (q.type === 'equation') { if (!EQ.checkEquation(q, q.answer).correct) bad.push('own answer'); if ((q.traps || []).some(t => EQ.checkEquation(q, t.eq).correct)) bad.push('trap = answer'); }
  if (q.type === 'inequality' && !EQ.checkInequality(q, q.answer).correct) bad.push('own answer');
  if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if ((q.type === 'choice' || q.type === 'multi') && new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push('dup options');
  if (q.type === 'multi' && !q.options.some(o => o.correct)) bad.push('none right');
  if (q.type === 'solver' && !EQ.finished(EQ.solution(q.eq, { keepCase: q.keepCase }).state).done) bad.push('solver');
  if (q.type === 'numberline' && !(q.range[0] < q.range[1])) bad.push('range');
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, q]) => checkQ(id, q, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.ONE_PRACTICE, Q.onePractice, Q.ONE_PRACTICE_IDS, 'one'], [Q.MULTI_PRACTICE, Q.multiPractice, Q.MULTI_PRACTICE_IDS, 'multi'], [Q.BOTH_PRACTICE, Q.bothPractice, Q.BOTH_PRACTICE_IDS, 'both'], [Q.FORMULA_PRACTICE, Q.formulaPractice, Q.FORMULA_PRACTICE_IDS, 'formula'], [Q.INEQ_PRACTICE, Q.ineqPractice, Q.INEQ_PRACTICE_IDS, 'ineq']])
  for (let n = 0; n < list.length; n++) { const P_ = fn(n); for (const id of ids) { const r = checkQ(id, P_[id], name + n); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, F[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 6));
ok('Certification: 10 questions, two per topic, pass mark 8; graphing, rearranging, equation building and working boxes', (() => { const F = Q.finalQuestions(1), t = new Set(Q.FINAL_IDS.map(id => F[id].type)); return Q.FINAL_IDS.length === 10 && Q.PASS_MARK === 8 && ['fa', 'fb', 'fc', 'fd', 'fe'].every(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length === 2) && ['numberline', 'expression', 'equation', 'inequality', 'choice', 'number'].every(x => t.has(x)) && Q.FINAL_IDS.filter(id => F[id].working).length === 4; })());
ok('Certification rounds differ, and never repeat a stage prompt', (() => { const stage = new Set(Object.values(Q.QUESTIONS).map(q => q.prompt)); const R = [1, 2, 3, 4].map(r => Q.finalQuestions(r)); return R.every(F => Q.FINAL_IDS.every(id => !stage.has(F[id].prompt))) && new Set(R.map(F => F['fb-solve'].prompt)).size === 4; })());
ok('Every certification inequality needs the sign reversed', [1, 2, 3, 4].every(r => Q.finalQuestions(r)['fe-solve'].flip && EQ.moves(EQ.start(Q.FINAL_SETS[r - 1].ineq.text)).wrong.length >= 0));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = q => { for (const o of q.options || []) if (!o.correct) codes.add(o.code); for (const t of q.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(q => q && q.type && add(q)); codes.delete('wrong'); return [...codes].every(c => Q.MISCONCEPTIONS[c]); })());
ok('Every solver misconception code is named', ['one-side', 'wrong-inverse', 'divide-before-constant', 'distribute-partial', 'skip-distribute', 'combine-unlike', 'dividing-early', 'no-flip', 'open-closed', 'direction', 'endpoint', 'or-and'].every(c => Q.MISCONCEPTIONS[c]));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));

// ---- 7. Progress and curriculum ----
const prog = createProgress({ lesson: { id: 'dream-line-goes-pro', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: Q.QUESTIONS }, storage: 'memory' });
prog.attempt('sv-neg', null, 'kept the sign', false, { code: 'no-flip' }); prog.attempt('sv-neg', null, 'x ≤ 10', true, {});
ok('A solver with one wrong move is done but not first-try', prog.done('sv-neg') && prog.question('sv-neg').firstTry === false);
const act = ACTIVITIES.find(a => a.id === 'dream-line-goes-pro'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 1 lab, home One-Step Equations in Solving Equations and Inequalities', act && act.status === 'live' && act.home === 'alg1.one-step-equations' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Solving Equations and Inequalities');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five topics and every skill of the unit', model.skills.filter(s => s.topic.unit.title === 'Solving Equations and Inequalities' && s.topic.course.id === 'alg1').every(s => act.skills.includes(s.id)));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 5 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Every tracked idea has questions; graded ids unique across stages', Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))) && (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());
ok('Question ids don’t clash with Unit 1’s (separate records)', ACTIVITIES.find(a => a.id === 'dream-line-project').tracking.gameId !== act.tracking.gameId);

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
