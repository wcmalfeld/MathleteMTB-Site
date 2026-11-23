#!/usr/bin/env node
// Tests for the Bike Park Blueprint Lab (learning-lab/bike-park-blueprint-lab/):
// exact fraction and matrix arithmetic, the PRD's numbers (and its one
// corrected example), dimension rules, row operations, classification,
// every validated set, every question in every practice variant and final
// round, the shell's per-mission practice, and the curriculum mapping.
//   node scripts/test-bike-park-blueprint-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/bike-park-blueprint-lab/', import.meta.url);
const X = await import(new URL('logic/matrix.js', base));
const M = await import(new URL('logic/models.js', base));
const Q = await import(new URL('logic/questions.js', base));
const kit = new URL('../learning-lab/lesson-kit/', import.meta.url);
const V = await import(new URL('validate.js', kit));
const { createProgress } = await import(new URL('progress.js', kit));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const throws = fn => { try { fn(); return false; } catch (e) { return true; } };
const S = A => A.map(r => r.map(String));
const { Frac, mat } = X;

// ---- 1. Exact arithmetic ----
ok('Fractions reduce and keep the sign on top: 6/−8 = −3/4', String(new Frac(6, -8)) === '−3/4');
ok('No float noise: 1/10 + 2/10 = 3/10 exactly', new Frac(1, 10).add(new Frac(2, 10)).eq(new Frac(3, 10)));
ok('Parsing: "−3/4", "0.25", "5", " 1 / 2 " ; junk and /0 are rejected', String(Frac.parse('−3/4')) === '−3/4' && String(Frac.parse('0.25')) === '1/4' && String(Frac.parse('5')) === '5' && String(Frac.parse(' 1 / 2 ')) === '1/2' && Frac.parse('abc') === null && Frac.parse('3/0') === null);
ok('Division by zero throws', throws(() => new Frac(1, 0)) && throws(() => new Frac(1).div(0)));
const A = M.A(), Mres = M.M();
ok('Matrix multiplication is row by column: [[1,2],[3,4]]·[[5,6],[7,8]] = [[19,22],[43,50]]', JSON.stringify(S(X.mul(mat([[1, 2], [3, 4]]), mat([[5, 6], [7, 8]])))) === JSON.stringify([['19', '22'], ['43', '50']]));
ok('…and not commutative: BA = [[23,34],[31,46]]', JSON.stringify(S(X.mul(mat([[5, 6], [7, 8]]), mat([[1, 2], [3, 4]])))) === JSON.stringify([['23', '34'], ['31', '46']]));
ok('Dimensions enforced: 2×3 + 3×2 and (3×1)(3×3) are refused', throws(() => X.add(mat([[1, 2, 3], [4, 5, 6]]), mat([[1, 2], [3, 4], [5, 6]]))) && throws(() => X.mul(M.Cvec(), Mres)));
ok('A (equations) is the transpose of M (features)', X.equal(A, X.transpose(Mres)));

// ---- 2. The PRD's numbers ----
const s2 = M.solve2(M.CREW_EQ, M.MACHINE_EQ);
ok('4x + 3y = 17, 2x + y = 7 → (2, 3)', s2.type === 'one' && s2.x.eq(2) && s2.y.eq(3));
ok('8x + 6y = 36 → parallel (none); 8x + 6y = 34 → same line (infinite); x + y = 5 → (2, 3)', M.DIAGNOSE.map(d => M.solve2(d.p, d.q).type).join() === 'none,infinite,one' && M.solve2(M.DIAGNOSE[2].p, M.DIAGNOSE[2].q).x.eq(2));
const park = X.classify(A.map(r => r.map(Number)), M.PARK.available);
ok('Three-variable park system → (2, 3, 1)', park.type === 'one' && park.solution.map(String).join() === '2,3,1');
let G = M.PARK_AUG(); const trace = [];
for (const st of M.GUIDED_STEPS) { G = X.rowOp(G, st); trace.push(S(G)); }
ok('PRD elimination: after the swap and R2 − 2R1, R3 − 4R1 the rows are [1 2 2|10], [0 −3 −1|−10], [0 −5 −3|−18]', JSON.stringify(trace[2]) === JSON.stringify([['1', '2', '2', '10'], ['0', '−3', '−1', '−10'], ['0', '−5', '−3', '−18']]));
ok('…and 3R3 − 5R2 gives [0 0 −4 | −4]; back-substitution gives (2, 3, 1)', JSON.stringify(trace[4][2]) === JSON.stringify(['0', '0', '−4', '−4']) && X.analyse(G).solution.map(String).join() === '2,3,1');
ok('Every guided step keeps (2, 3, 1) as a solution', (() => { let g = M.PARK_AUG(); return M.GUIDED_STEPS.every(st => { g = X.rowOp(g, st); return X.satisfies(g, M.PLAN.map(v => Frac.of(v))); }); })());
ok('A + B = [[6,8,3],[4,8,3]]; S − U = [[7,8,4],[6,7,4]]; 2(A + B) = [[12,16,6],[8,16,6]]', JSON.stringify(X.toNumbers(X.add(mat(M.INVENTORY.A), mat(M.INVENTORY.B)))) === '[[6,8,3],[4,8,3]]' && JSON.stringify(X.toNumbers(X.sub(mat(M.INVENTORY.S), mat(M.INVENTORY.U)))) === '[[7,8,4],[6,7,4]]' && JSON.stringify(X.toNumbers(X.scale(2, X.add(mat(M.INVENTORY.A), mat(M.INVENTORY.B))))) === '[[12,16,6],[8,16,6]]');
const C0 = M.costing();
ok('MC = [337, 264, 500]; QM = [22, 10, 10]; QMC = $1,966', C0.unit.join() === '337,264,500' && C0.resources.join() === '22,10,10' && C0.cost === 1966);
ok('(QM)C = Q(MC): associativity checked inside the model', C0.cost === Number(X.mul(C0.Q, C0.MC)[0][0]));
const inv = X.inverse(A);
ok('det(A) = −4 and A⁻¹ = [[1,−1,−1],[1/4,−3/4,1/2],[−3/4,5/4,1/2]] (exact)', String(X.det(A)) === '−4' && JSON.stringify(S(inv)) === JSON.stringify([['1', '−1', '−1'], ['1/4', '−3/4', '1/2'], ['−3/4', '5/4', '1/2']]));
ok('The inverse is verified both ways: A⁻¹A = AA⁻¹ = I', X.equal(X.mul(inv, A), X.identity(3)) && X.equal(X.mul(A, inv), X.identity(3)));
ok('A⁻¹B = (2, 3, 1)', X.mul(inv, M.Bvec()).map(r => String(r[0])).join() === '2,3,1');
ok('The singular A has det 0, no inverse; its two sets of totals are dependent and inconsistent', X.det(mat(M.SINGULAR.A)).zero && X.inverse(mat(M.SINGULAR.A)) === null && X.classify(M.SINGULAR.A, M.SINGULAR.consistent).type === 'infinite' && X.classify(M.SINGULAR.A, M.SINGULAR.inconsistent).type === 'none');
ok('PRD Final B as printed (totals 25, 13, 9) solves to (3, −1, 4): not a buildable plan', X.classify([[3, 4, 5], [1, 2, 3], [2, 1, 1]], [25, 13, 9]).solution.map(String).join() === '3,−1,4');
ok('…so the lab uses totals 26, 14, 7, giving the PRD’s intended (1, 2, 3)', M.solve3(M.FINAL_SETS[0].three.A, M.FINAL_SETS[0].three.b).x.map(String).join() === '1,2,3');
const F1 = Q.finalSet(1);
ok('Final C: Q = [1 2 3] → QM = [25, 13, 11], QMC = $2,365, $35 under the $2,400 budget', F1.costing.resources.join() === '25,13,11' && F1.costing.cost === 2365 && F1.left === 35);
const O = M.optimizer();
ok('Optimizer: corner (7, 4); best whole-number total P = 13 at (0, 13) and (1, 12)', O.corner.x.eq(7) && O.corner.y.eq(4) && O.best === 13 && JSON.stringify(O.bestPlans) === '[[0,13],[1,12]]');
ok('…and P = 14 is impossible (checked over every integer point)', !O.points.some(([x, y]) => x + y >= 14));

// ---- 3. Row operations and analysis ----
const R0 = M.PARK_AUG();
ok('Row ops refuse ×0, a row added to itself, and missing rows', throws(() => X.rowOp(R0, { type: 'scale', i: 0, k: 0 })) && throws(() => X.rowOp(R0, { type: 'add', i: 1, j: 1, k: 2 })) && throws(() => X.rowOp(R0, { type: 'swap', i: 0, j: 5 })));
ok('Row ops never change the solution set (random valid sequences)', (() => { let g = R0; const sol = M.PLAN.map(v => Frac.of(v)); for (let t = 0; t < 40; t++) { const i = t % 3, j = (t + 1) % 3, k = new Frac((t % 5) - 2 || 1, (t % 3) + 1); g = X.rowOp(g, t % 3 === 0 ? { type: 'swap', i, j } : t % 3 === 1 ? { type: 'scale', i, k } : { type: 'add', i, j, k }); if (!X.satisfies(g, sol)) return false; } return true; })());
ok('Descriptions read naturally', X.describeOp({ type: 'add', i: 2, j: 1, k: -5 }) === 'R3 → R3 − 5·R2' && X.describeOp({ type: 'add', i: 1, j: 0, k: 1 }) === 'R2 → R2 + R1' && X.describeOp({ type: 'swap', i: 0, j: 2 }) === 'R1 ↔ R3' && X.describeOp({ type: 'scale', i: 0, k: new Frac(-1, 3) }) === 'R1 → −1/3·R1');
for (const p of M.PRACTICE_3) {
  const c = X.classify(p.A, p.b);
  ok(`Practice 3-var ${JSON.stringify(p.b)}: labelled ${p.type}, classified ${c.type}${c.solution ? ', whole-number solution' : ''}`, c.type === p.type && (!c.solution || c.solution.every(v => v.int && v.n >= 0)));
}
ok('2×2 solving is exact for decimal totals too (planes sliced at z = 0.5)', (() => { const r = M.solve2({ a: 4, b: 3, c: 19.5 }, { a: 2, b: 1, c: 8.5 }); return r.type === 'one' && r.x.eq(new Frac(3, 1)) && r.y.eq(new Frac(5, 2)); })());
ok('Practice includes every kind twice (one, none, infinite)', ['one', 'none', 'infinite'].every(t => M.PRACTICE_3.filter(p => p.type === t).length === 2));

// ---- 4. Validated sets ----
for (const [i, p] of M.PRACTICE_2.entries()) { const r = M.solve2(p.p, p.q); ok(`Practice 2-var ${i + 1}: one whole-number, non-negative plan`, M.buildable(r)); }
const seen = new Set();
for (const [i, f] of M.FINAL_SETS.entries()) {
  const t = M.solve2(f.two.p, f.two.q), th = M.solve3(f.three.A, f.three.b), C = M.costing(th.x.map(Number));
  ok(`Final ${i + 1}: buildable 2-var plan, det ≠ 0, whole-number 3-var plan, budget ≠ cost`, M.buildable(t) && th && !th.det.zero && th.x.every(v => v.int && v.n >= 0) && C.cost !== f.budget);
  seen.add(String(t.x) + ',' + String(t.y));
}
ok('Final 2-var answers differ round to round', seen.size === M.FINAL_SETS.length);
ok('Budgets fit in some rounds and not in others', M.FINAL_SETS.some((f, i) => Q.finalSet(i + 1).left > 0) && M.FINAL_SETS.some((f, i) => Q.finalSet(i + 1).left < 0));
ok('Practice 2-var plans never repeat a final round’s system', M.PRACTICE_2.every(p => !M.FINAL_SETS.some(f => JSON.stringify(f.two) === JSON.stringify(p))));

// ---- 5. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
for (let n = 0; n < M.PRACTICE_2.length; n++) { const P = Q.practice2(n); for (const id of Q.PRACTICE2_IDS) all.push([id, P[id], 'p2-' + n]); }
for (let n = 0; n < M.PRACTICE_3.length; n++) { const P = Q.practice3(n); for (const id of Q.PRACTICE3_IDS) all.push([id, P[id], 'p3-' + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [];
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
  if (['choice', 'multi'].includes(q.type)) {
    q.options.filter(o => !o.correct).forEach(o => { if (!o.feedback) bad.push(where + ': feedback on ' + o.id); if (!Q.MISCONCEPTIONS[o.code] && !Q.IDEAS[o.code]) bad.push(where + ': code ' + o.code); });
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
  }
  const fields = q.type === 'number' ? [{ answer: q.answer, tolerance: q.tolerance, traps: q.traps }] : q.type === 'fields' ? q.fields : [];
  for (const f of fields) {
    if (!isFinite(f.answer)) bad.push(where + ': finite answer');
    if (!V.checkNumber(f, String(f.answer)).correct) bad.push(where + ': answer accepted');
    for (const t of f.traps || []) { if (!Q.MISCONCEPTIONS[t.code]) bad.push(where + ': trap code ' + t.code); if (V.checkNumber(f, String(t.value)).correct) bad.push(where + ': trap accepted ' + t.value); }
  }
}
ok(`Every question (${all.length} across practice variants and rounds) is well formed; answers accepted, traps not`, bad.length === 0, bad.slice(0, 6));
const pos = Object.values(Q.QUESTIONS).filter(q => q.type === 'choice' && !q.keepOrder).map(q => q.options.findIndex(o => o.correct));
ok('The correct option isn’t always in the same place', new Set(pos).size >= 3 && pos.filter(i => i === 0).length <= pos.length / 2, pos);
ok('Practice options aren’t correct-first', [0, 1, 2, 3, 4].every(n => Q.practice2(n)['m1x-meaning'].options[0].correct === false));
const QQ = Q.QUESTIONS;
ok('Answers re-derived: graph (2, 3), x = 2, y = 3, checks 17 and 7', QQ['m1-graph'].fields.map(f => f.answer).join() === '2,3' && QQ['m1-sub-x'].answer === 2 && QQ['m1-y'].answer === 3 && QQ['m1-check'].fields.map(f => f.answer).join() === '17,7');
ok('Row answers: R2 − 2R1 = [0, −3, −1, −10], R3 − 4R1 = [0, −5, −3, −18]', QQ['m2-r2'].fields.map(f => f.answer).join() === '0,-3,-1,-10' && QQ['m2-r3'].fields.map(f => f.answer).join() === '0,-5,-3,-18');
ok('Workshop answers: 2 × 3; rakes 5; Crew B (A + B) [4, 8, 3]; Crew A (S − U) [7, 8, 4]; 2(A + B) [12, 16, 6]', QQ['m3-dims'].fields.map(f => f.answer).join() === '2,3' && QQ['m3-entry'].answer === 5 && QQ['m3-add'].fields.map(f => f.answer).join() === '4,8,3' && QQ['m3-sub'].fields.map(f => f.answer).join() === '7,8,4' && QQ['m3-scalar'].fields.map(f => f.answer).join() === '12,16,6');
ok('Entry-by-entry multiplication is caught on MC', V.checkFields(QQ['m3-mc'].fields, { r0: String(4 * 28), r1: '264', r2: '500' }).fields[0].code === 'partial-dot');
ok('Rows-for-columns is caught on QM', V.checkFields(QQ['m3-qm'].fields, { c0: String(2 * 4 + 3 * 2 + 1 * 1), c1: '10', c2: '10' }).fields[0].code === 'rows-cols');
ok('Forgetting the quantities is caught on the total', V.checkNumber(QQ['m3-total'], '1101').code === 'forgot-quantities');
ok('det sign slip caught; S − U backwards caught', V.checkNumber(QQ['m4-det'], '4').code === 'sign' && V.checkFields(QQ['m3-sub'].fields, { c0: '-7', c1: '8', c2: '4' }).fields[0].code === 'sign');

// ---- 6. Progress: per-mission practice keys ----
const LESSON = { id: 'bike-park-blueprint-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QQ };
const prog = createProgress({ lesson: LESSON, storage: 'memory' });
prog.attempt('m1x-solve', 'v0', '2;4', true, {}); prog.attempt('m2x-classify', 'v0', 'one', true, {});
ok('Practice answers are keyed per variant and per question', prog.done('m1x-solve', 'v0') && !prog.done('m1x-solve', 'v1') && prog.done('m2x-classify', 'v0'));

// ---- 7. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'bike-park-blueprint-lab'), model = loadClasses();
const skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('A live Algebra 2 lab, home Systems of Equations in Linear Systems and Matrices', act && act.status === 'live' && act.home === 'alg2.systems-of-equations' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Linear Systems and Matrices', model.errors);
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics of the unit', ['systems-of-equations', 'three-variable-systems', 'matrix-operations', 'applications-of-matrices'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All fourteen tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 14 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark are consistent', Q.FINAL_IDS.every(id => kinds[id]) && Q.PASS_MARK === 8 && Q.FINAL_IDS.length === 10);

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
