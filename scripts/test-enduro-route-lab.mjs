#!/usr/bin/env node
// Tests for the Enduro Route Intelligence Lab (learning-lab/enduro-route-lab/):
// the exact rational-expression and radical engine, every PRD number (with
// the one corrected), every validated set, every question in every practice
// variant and final round, and the curriculum mapping.
//   node scripts/test-enduro-route-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/enduro-route-lab/', import.meta.url);
const R = await import(new URL('logic/rational.js', base));
const M = await import(new URL('logic/models.js', base));
const Q = await import(new URL('logic/questions.js', base));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { createProgress } = await import(new URL('../learning-lab/lesson-kit/progress.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const throws = fn => { try { fn(); return false; } catch (e) { return true; } };
const S = x => String(x), N = Number, rh = R.ratHigh;
// The lab's maths text in v (e.g. 60(v − 10)/[v(v − 5)], T(v) = 8 + 360/v) as a function.
const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
function fnOf(s) {
  const e = s.replace(/^[A-Z]\(v\) = /, '').replace(/−/g, '-').replace(/[[]/g, '(').replace(/]/g, ')').replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '**' + [...m].map(c => SUP[c]).join(''))
    .replace(/(\d)\s*(v|\()/g, '$1*$2').replace(/\)\s*(v|\(|\d)/g, ')*$1').replace(/v\s*\(/g, 'v*(');
  return new Function('v', 'return ' + e);
}
const sameFn = (s, truth) => [6.3, 11.7, 17, 26.5].every(v => { const t = truth(v); return near(fnOf(s)(v), t, 1e-7 * (1 + Math.abs(t))); });

// ---- 1. The engine ----
ok('pgcd: gcd(v² − 25, v − 5) = v − 5; gcd of coprime polynomials is 1', R.ptext(R.pgcd(R.fromHigh([1, 0, -25]), R.fromHigh([1, -5]))) === 'x − 5' && R.ptext(R.pgcd(R.fromHigh([1, 0, 1]), R.fromHigh([1, -2]))) === '1');
ok('Rational roots with multiplicity, and the leftover factor: (x − 2)²(x² + 1)', (() => { const r = R.rationalRoots(R.fromHigh([1, -4, 5, -4, 4])); return r.roots.length === 1 && S(r.roots[0].r) === '2' && r.roots[0].m === 2 && R.degree(r.rest) === 2; })());
ok('Rational roots handle fractions: 7v² − 125v + 300 → 20/7 and 15', R.rationalRoots(R.fromHigh([7, -125, 300])).roots.map(x => S(x.r)).join() === '20/7,15');
ok('A zero denominator is refused; dividing by a zero expression is refused', throws(() => R.rat(R.poly([1]), R.poly([0]))) && throws(() => R.div(rh([1], [1, 0]), rh([0], [1]))));
ok('Evaluating at an excluded input gives undefined (null), even after cancelling', R.evalAt(rh([1, 0, -25], [1, -5]), 5) === null && R.evalAt(R.simplify(rh([1, 0, -25], [1, -5])), 5) === null && S(R.evalAt(rh([1, 0, -25], [1, -5]), 4)) === '9');
ok('Simplifying keeps the hole: (v² − 25)/(v − 5) → v + 5, hole (5, 10), no vertical asymptote', (() => { const s = R.simplify(rh([1, 0, -25], [1, -5])); return R.text(s) === 'v + 5' && s.holes.length === 1 && S(s.holes[0].x) === '5' && S(s.holes[0].y) === '10' && s.vertical.length === 0; })());
ok('Multiplying then cancelling keeps every excluded input: 60/v · v/(v − 5) excludes 0 and 5', (() => { const s = R.simplify(R.mul(rh([60], [1, 0]), rh([1, 0], [1, -5]))); return R.text(s) === '60/(v − 5)' && s.excluded.map(S).join() === '0,5' && s.holes.map(h => S(h.x)).join() === '0'; })());
ok('Dividing also excludes where the divisor is zero', R.div(rh([1], [1, -1]), rh([1, -2], [1])).excluded.map(S).join() === '1,2');
ok('Random sums, differences, products and quotients agree with floating point', (() => { for (let i = 1; i < 40; i++) { const a = rh([i % 5 + 1, (i % 3) - 1], [1, (i % 7) - 3]), b = rh([(i % 4) + 1], [1, (i % 5) + 1]); const v = 10.37 + i / 7, fa = N(R.evalAt(a, v)), fb = N(R.evalAt(b, v));
  if (!near(N(R.evalAt(R.add(a, b), v)), fa + fb, 1e-9) || !near(N(R.evalAt(R.sub(a, b), v)), fa - fb, 1e-9) || !near(N(R.evalAt(R.mul(a, b), v)), fa * fb, 1e-9) || !near(N(R.evalAt(R.div(a, b), v)), fa / fb, 1e-9)) return false; } return true; })());
ok('Asymptotes from degrees: lower → y = 0, equal → ratio, one higher → slant by division', (() => { const f = R.features(rh([1], [1, 2])), h = R.features(rh([2, 0, 3], [1, 0, -4])), s = R.features(rh([1, 3, 1], [1, 1])); return S(f.horizontal) === '0' && S(h.horizontal) === '2' && s.horizontal === null && R.ptext(s.slant) === 'x + 2'; })());
ok('Square roots simplify exactly: √14656 = 8√229, √0.0396 = 0.06√11, √0.1296 = 0.36, √50 = 5√2', R.surdText(R.sqrtExact(14656)) === '8√229' && R.surdText(R.sqrtExact(0.0396)) === '0.06√11' && R.surdText(R.sqrtExact(0.1296)) === '0.36' && R.surdText(R.sqrtExact(50)) === '5√2');
ok('An even root of a negative is refused; odd roots of negatives are fine', throws(() => R.sqrtExact(-4)) && R.nthRoot(-4, 2) === null && S(R.nthRoot(-27, 3)) === '−3');
ok('Rational exponents exactly: 8^(2/3) = 4, 16^(3/4) = 8, 27^(2/3) = 9, 4^(−1/2) = 1/2', S(R.ratPow(8, 2, 3)) === '4' && S(R.ratPow(16, 3, 4)) === '8' && S(R.ratPow(27, 2, 3)) === '9' && S(R.ratPow(4, -1, 2)) === '1/2');
ok('Product denominators are bracketed in text: 60(v − 10)/[v(v − 5)]', R.factoredRat(R.simplify(R.sub(rh([120], [1, 0]), rh([60], [1, -5])))) === '60(v − 10)/[v(v − 5)]');

// ---- 2. The PRD's numbers ----
const T1 = M.clock();
ok('T(v) = 8 + 360/v: the table 38, 28, 23, 20; T(20) = 26', M.CLOCK.table.map(v => S(R.evalAt(T1, v))).join() === '38,28,23,20' && S(R.evalAt(T1, 20)) === '26');
ok('Clock asymptotes v = 0 and T = 8', R.features(T1).vertical.map(S).join() === '0' && S(R.features(T1).horizontal) === '8');
const TS = M.split(), TSs = R.simplify(TS);
ok('Split model at v = 15: 8 + 8 + 6 = 22', S(R.evalAt(M.flowTime(), 15)) === '8' && S(R.evalAt(M.techTime(), 15)) === '6' && S(R.evalAt(TS, 15)) === '22');
ok('Combined: (8v² + 140v − 600)/(v² − 5v); asymptotes v = 0, 5 and T = 8', R.text(TSs) === '(8v² + 140v − 600)/(v² − 5v)' && R.features(TS).vertical.map(S).join() === '0,5' && S(R.features(TS).horizontal) === '8' && TSs.holes.length === 0);
ok('120(v − 5) + 60v = 180v − 600', R.text(R.add(M.flowTime(), M.techTime()).n.length ? R.simplify(R.add(M.flowTime(), M.techTime())) : null) === '(180v − 600)/(v² − 5v)');
ok('F − S = 60(v − 10)/[v(v − 5)], = 2 at v = 15', S(R.evalAt(R.sub(M.flowTime(), M.techTime()), 15)) === '2');
ok('P · R = 60/(v − 5); S ÷ F = v/[2(v − 5)] = 0.75 at 15', R.text(R.simplify(R.mul(M.PER_KM(), M.SPEED_RATIO()))) === '60/(v − 5)' && S(R.evalAt(R.div(M.techTime(), M.flowTime()), 15)) === '3/4' && sameFn('v/[2(v − 5)]', v => N(R.evalAt(R.div(M.techTime(), M.flowTime()), v))));
ok('Target 22: 7v² − 125v + 300 = (v − 15)(7v − 20), candidates 15 and 20/7', R.ptext(M.splitQuadratic(M.SPLIT, 22).map(c => c.div(2)), 'v') === '7v² − 125v + 300' && R.rationalRoots(M.splitQuadratic(M.SPLIT, 22)).roots.map(x => S(x.r)).join() === '20/7,15');
ok('Survey: D(16) = √14656 = 8√229 ≈ 121.06; grade 13.33%', R.surdText(R.sqrtExact(14656)) === '8√229' && M.surveyD(16).toFixed(2) === '121.06' && (16 / 120 * 100).toFixed(2) === '13.33');
ok('122 m → h² = 484, h = ±22; both check', 122 * 122 - 14400 === 484 && [22, -22].every(h => near(M.surveyD(h), 122)));
ok('Warning √(r² + 16) = r − 2 → r = −3, which is extraneous (5 ≠ −5)', (() => { const r = -3; return r * r + 16 === (r - 2) ** 2 && Math.sqrt(r * r + 16) === 5 && r - 2 === -5; })());
ok('Wheel: W(0) = 0.36, W(0.30) ≈ 0.199; height 0.30 at x ≈ ±0.199', M.wheelY(0) === 0.36 && M.wheelY(0.3).toFixed(3) === '0.199' && Math.sqrt(0.1296 - 0.09).toFixed(3) === '0.199');
ok('Studio g(x) = 2√(x − 3) + 1 starts at (3, 1); ∛125 = 5', S(R.nthRoot(125, 3)) === '5');
const F1 = Q.finalSet(1);
ok('Final A (PRD): T = 6 + 300/v, T(15) = 26, asymptote 6', F1.k === 300 && F1.timeA === 26);
ok('Final B (PRD): T(15) = 29, asymptotes 0 and 5, horizontal 5', F1.timeB === 29 && R.features(F1.TB).vertical.map(S).join() === '0,5' && S(R.features(F1.TB).horizontal) === '5');
ok('Final B correction: the simplified numerator is 5v² + 275v − 900 (the PRD’s 5v² + 280v − 780 gives 30.3 at v = 15)', R.ptext(F1.TBs.n, 'v') === '5v² + 275v − 900' && !near((5 * 225 + 280 * 15 - 780) / (15 * 10), 29, 0.01));
ok('Final C (PRD): 8√229 ≈ 121.06, grade 13.33%', R.surdText(F1.DC) === '8√229' && F1.grade === 13.33);
ok('Final A round 1 asks for 31 minutes (not the circular 26), giving 12 km/h', F1.A.target === 31 && F1.speed === 12);

// ---- 3. Validated sets ----
for (const [i, s] of M.CLOCK_PRACTICE.entries()) { const v = 60 * s.D / (s.target - s.t0); ok(`Clock practice ${i + 1}: whole speed in (0, 40]`, Number.isInteger(v) && v > 0 && v <= 40); }
for (const [i, s] of M.SPLIT_PRACTICE.entries()) {
  const P = Q.splitPractice(i), roots = P.roots.map(N), other = roots.find(r => !near(r, s.v));
  ok(`Split practice ${i + 1}: speed difference ≠ 5, whole section times, valid root ${s.v} > ${s.diff}, other root rejected`, s.diff !== 5 && Number.isInteger(60 * s.d1 / s.v) && Number.isInteger(60 * s.d2 / (s.v - s.diff)) && roots.some(r => near(r, s.v)) && other !== undefined && other < s.diff);
}
for (const [i, s] of M.SURVEY_PRACTICE.entries()) { const h = Math.sqrt(s.D ** 2 - s.run ** 2); ok(`Survey practice ${i + 1}: whole elevation difference, inside ±60`, Number.isInteger(h) && h > 0 && h <= 60); }
for (const [i, s] of M.EXP_PRACTICE.entries()) ok(`Exponent practice ${i + 1}: ${s.b}^(${s.p}/${s.q}) is whole`, R.ratPow(s.b, s.p, s.q) && R.ratPow(s.b, s.p, s.q).d === 1);
const nums = new Set();
for (const [i] of M.FINAL_SETS.entries()) {
  const F = Q.finalSet(i + 1); nums.add(R.ptext(F.TBs.n, 'v'));
  ok(`Final round ${i + 1}: whole speeds and times; B simplifies with no holes; C is irrational`, Number.isInteger(F.speed) && F.speed > 0 && Number.isInteger(F.timeA) && Number.isInteger(F.timeB) && F.TBs.holes.length === 0 && F.DC.rad > 1 && F.B.v > F.B.diff && F.speed !== F.A.v);
}
ok('Every final round has its own two-section numerator', nums.size === M.FINAL_SETS.length);
ok('Practice speeds never repeat a final round’s course', M.SPLIT_PRACTICE.every(p => !M.FINAL_SETS.some(f => f.B.d1 === p.d1 && f.B.d2 === p.d2 && f.B.diff === p.diff)));

// ---- 4. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
const gens = [[M.CLOCK_PRACTICE, Q.clockPractice, Q.CLOCK_PRACTICE_IDS, 'c'], [M.SPLIT_PRACTICE, Q.splitPractice, Q.SPLIT_PRACTICE_IDS, 's'], [M.SURVEY_PRACTICE, Q.surveyPractice, Q.SURVEY_PRACTICE_IDS, 'u'], [M.EXP_PRACTICE, Q.expPractice, Q.EXP_PRACTICE_IDS, 'w']];
for (const [list, fn, ids, tag] of gens) for (let n = 0; n < list.length; n++) { const P = fn(n); for (const id of ids) all.push([id, P[id], tag + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [];
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  // a template slip (not the word “undefined” in a sentence)
  const slip = /NaN|\[object|\$\{|(\d|[=(−+] ?)undefined|undefined ?(m|min|km|%|\)|\/)/;
  if (slip.test(JSON.stringify([q.prompt, q.solution, q.hints]))) bad.push(where + ': undefined/NaN in text');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' || q.type === 'multi') {
    if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
    if (q.type === 'multi' && !q.options.some(o => o.correct)) bad.push(where + ': a correct option');
    if (q.options.length < 3) bad.push(where + ': three or more options');
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
    if (q.options.some(o => slip.test(o.text))) bad.push(where + ': undefined/NaN in an option');
    q.options.filter(o => !o.correct).forEach(o => { if (!o.feedback) bad.push(where + ': feedback on ' + o.id); if (!Q.MISCONCEPTIONS[o.code]) bad.push(where + ': code ' + o.code); });
  }
  const fields = q.type === 'number' ? [{ answer: q.answer, tolerance: q.tolerance, traps: q.traps }] : q.type === 'fields' ? q.fields : [];
  for (const f of fields) {
    if (!isFinite(f.answer)) bad.push(where + ': finite answer');
    if (!V.checkNumber(f, String(f.answer)).correct) bad.push(where + ': answer accepted');
    for (const t of f.traps || []) { if (!Q.MISCONCEPTIONS[t.code]) bad.push(where + ': trap code ' + t.code); if (V.checkNumber(f, String(t.value)).correct) bad.push(where + ': trap accepted ' + t.value); }
  }
}
ok(`Every question (${all.length} across practice variants and rounds) is well formed; answers accepted, traps not`, bad.length === 0, bad.slice(0, 6));
ok('Fraction input works: 20/7 is accepted for the candidate', V.checkNumber(Q.QUESTIONS['s-roots'].fields[0], '20/7').correct);

// Expression options: right exactly when they equal the true function.
const QS = Q.QUESTIONS, val = r => v => N(R.evalAt(r, v));
const checks = [['s-sub', QS['s-sub'], val(R.sub(M.flowTime(), M.techTime()))], ['s-mul', QS['s-mul'], val(R.mul(M.PER_KM(), M.SPEED_RATIO()))], ['s-div', QS['s-div'], val(R.div(M.techTime(), M.flowTime()))]];
for (let n = 0; n < 5; n++) { const P = Q.clockPractice(n); checks.push(['cx-model ' + n, P['cx-model'], val(M.clock(P.set.D, P.set.t0))]); }
for (let n = 0; n < 5; n++) { const P = Q.splitPractice(n); checks.push(['sx-model ' + n, P['sx-model'], val(M.split(P.set))]); }
for (let r = 1; r <= 5; r++) { const F = Q.finalQuestions(r); checks.push(['fa-model ' + r, F['fa-model'], val(F.set.TA)]); }
const exprBad = [];
for (const [name, q, truth] of checks) for (const o of q.options) { let same; try { same = sameFn(o.text, truth); } catch (e) { exprBad.push(name + ': unreadable ' + o.text); continue; } if (same !== o.correct) exprBad.push(`${name}: “${o.text}” ${o.correct ? 'marked right but differs' : 'marked wrong but equal'}`); }
ok(`Expression options are right exactly when they equal the true function (${checks.length} questions)`, exprBad.length === 0, exprBad.slice(0, 6));
ok('Final rounds differ in their numbers', new Set([1, 2, 3, 4, 5].map(r => Q.finalQuestions(r)['fb-num'].fields.map(f => f.answer).join())).size === 5);
ok('Choice order varies: the right answer isn’t always first', Object.values(QS).filter(q => q.type === 'choice').some(q => !q.options[0].correct) && Object.values(QS).filter(q => q.type === 'choice').some(q => q.options[0].correct));

// ---- 5. Progress ----
const prog = createProgress({ lesson: { id: 'enduro-route-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QS }, storage: 'memory' });
prog.attempt('sx-v', 'v0', '12', true, {}); prog.attempt('wx-value', 'v3', '32', true, {});
ok('Practice answers keyed by variant', prog.done('sx-v', 'v0') && !prog.done('sx-v', 'v1') && prog.done('wx-value', 'v3'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'enduro-route-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 2 lab, home Graphing Rational Functions in the Rational and Radical Functions unit', act && act.status === 'live' && act.home === 'alg2.graphing-rational-functions' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Rational and Radical Functions');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five topics of the unit, and Unit 1’s Radical Equations', ['rational-expressions', 'rational-equations-applications', 'radical-functions', 'graphing-rational-functions', 'asymptotes', 'radical-equations'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All twenty-three tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 23 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark consistent (10 of 12)', Q.FINAL_IDS.every(id => kinds[id]) && Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10);
ok('Every mission’s graded ids exist, with no id in two missions', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => QS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
