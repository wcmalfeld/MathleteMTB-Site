#!/usr/bin/env node
// Tests for the Pump Track Profile Lab (learning-lab/pump-track-lab/): the
// exact polynomial engine (arithmetic, roots, long and synthetic division,
// features, rational zero candidates, text), every PRD number, every
// validated set, every question in every practice variant and final round,
// and the curriculum mapping.
//   node scripts/test-pump-track-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/pump-track-lab/', import.meta.url);
const X = await import(new URL('logic/poly.js', base));
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
const H = (...c) => X.fromHigh(c), T = p => X.text(p);
// Turn the lab's maths text (e.g. 0.005x(x − 2)², x⁴ − 3x³ + 2) into a function, to check options numerically.
const SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
function fnOf(s) {
  const e = s.replace(/−/g, '-').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '**' + [...m].map(c => SUP[c]).join(''))
    .replace(/(\d)\s*(x|\()/g, '$1*$2').replace(/\)\s*(x|\(|\d)/g, ')*$1').replace(/x\s*\(/g, 'x*(').replace(/x(\d)/g, 'x*$1');
  return new Function('x', 'return ' + e);
}
const sameFn = (s, p) => { const f = fnOf(s); return [-1.3, 0.7, 2.9, 5.1].every(x => near(f(x), X.value(p, x), 1e-7 * (1 + Math.abs(X.value(p, x))))); };

// ---- 1. The engine ----
ok('Text: x⁴ − 16x³ + 76x² − 96x, decimals for terminating fractions', T(H(1, -16, 76, -96, 0)) === 'x⁴ − 16x³ + 76x² − 96x' && T(H(0.005, -0.08, 0.38, -0.48, 0)) === '0.005x⁴ − 0.08x³ + 0.38x² − 0.48x');
ok('Trim and degree: 0x³ + 2x drops to degree 1; the zero polynomial has degree −∞', X.degree(X.poly([0, 2, 0, 0])) === 1 && X.degree(X.poly([0])) === -Infinity);
ok('Add, subtract, multiply: (x² + 2x)(x² − 3x + 1) = x⁴ − x³ − 5x² + 2x', T(X.mul(H(1, 2, 0), H(1, -3, 1))) === 'x⁴ − x³ − 5x² + 2x' && T(X.sub(H(3, 2, 0, -5), H(1, -4, 1, -2))) === '2x³ + 6x² − x − 3');
ok('Exact evaluation (Horner) agrees with the float evaluation', [[H(1, -16, 76, -96, 0), 3], [H(2, -15, 31, -12), 0.5], [H(0.005, -0.08, 0.38, -0.48, 0), 7.25]].every(([p, x]) => near(Number(X.evalAt(p, x)), X.value(p, x), 1e-12)));
ok('fromRoots with multiplicity: 0.02(x − 1)(x − 3)²(x − 5) is degree 4 and zero at 1, 3, 5', (() => { const p = X.fromRoots(0.02, [[1, 1], [3, 2], [5, 1]]); return X.degree(p) === 4 && [1, 3, 5].every(r => X.evalAt(p, r).zero) && X.leading(p).eq(X.Frac.of(0.02)); })());
ok('Random divisions check: d·q + r = p, deg r < deg d', (() => { for (let i = 1; i < 40; i++) { const p = H(i % 5 + 1, (i % 7) - 3, (i % 3) - 1, (i % 11) - 5, i % 4), d = H(1, (i % 5) - 2, (i % 2)); const R = X.longDivide(p, d); if (!X.equal(X.add(X.mul(d, R.quotient), R.remainder), p) || !(X.degree(R.remainder) < X.degree(d))) return false; } return true; })());
ok('Synthetic division agrees with long division and with the Remainder Theorem', [[H(1, -6, 11, -6), 1], [H(2, -3, 0, 4), -1], [H(1, 0, -3, 0, 2), 2], [H(1, -16, 76, -96, 0), 3]].every(([p, k]) => { const s = X.synthetic(p, k), L = X.longDivide(p, H(1, -k)); return X.equal(s.quotient, L.quotient) && s.remainder.eq(L.remainder[0]) && s.remainder.eq(X.evalAt(p, k)); }));
ok('Dividing by the zero polynomial is refused', throws(() => X.longDivide(H(1, 2), X.poly([0]))));
ok('End behavior: even/positive both rise; odd/positive falls left rises right; odd/negative the reverse; even/negative both fall', X.endBehavior(H(1, 0, 0)).text === 'rises on the left, rises on the right' && X.endBehavior(H(1, 0, 0, 0)).text === 'falls on the left, rises on the right' && X.endBehavior(H(-1, 0, 0, 0)).text === 'rises on the left, falls on the right' && X.endBehavior(H(-1, 0, 0, 0, 0)).text === 'falls on the left, falls on the right');
ok('Rational Zero candidates: 2x³ − 15x² + 31x − 12 includes 1/2 and 3/2; factors out x first', (() => { const c = X.rationalCandidates(H(2, -15, 31, -12)).map(String); const d = X.rationalCandidates(H(1, -16, 76, -96, 0)).map(Number); return c.includes('1/2') && c.includes('3/2') && d.includes(96) && !d.includes(0); })());
ok('Rational Zero Theorem needs integer coefficients', throws(() => X.rationalCandidates(H(0.5, 1, 1))));
ok('Factored text: a bare x first, superscript multiplicities', X.factoredText(0.005, [[2, 1], [0, 1], [6, 1], [8, 1]]) === '0.005x(x − 2)(x − 6)(x − 8)' && X.factoredText(0.02, [[1, 1], [3, 2], [5, 1]]) === '0.02(x − 1)(x − 3)²(x − 5)' && X.factoredText(1, [[-1, 1]]) === '(x + 1)');

// ---- 2. The PRD's numbers ----
const P = M.P(), QQ = M.Q();
ok('Flow Line A expands to 0.005x⁴ − 0.08x³ + 0.38x² − 0.48x; Q = 200P = x⁴ − 16x³ + 76x² − 96x', T(P) === '0.005x⁴ − 0.08x³ + 0.38x² − 0.48x' && T(QQ) === 'x⁴ − 16x³ + 76x² − 96x' && X.equal(X.mul(H(1, 0), M.CUBIC()), QQ));
ok('Degree 4, leading 0.005, both ends rise, at most 3 turning points', X.degree(P) === 4 && X.leading(P).eq(X.Frac.of(0.005)) && X.endBehavior(P).text === 'rises on the left, rises on the right' && X.maxTurning(P) === 3);
ok('Turning points ≈ (0.838, −0.180), (4, 0.32), (7.162, −0.180)', (() => { const t = X.turningPoints(P, 0, 8); return t.length === 3 && near(t[0][0], 0.838, 1e-3) && near(t[0][1], -0.180, 1e-3) && near(t[1][0], 4, 1e-6) && near(t[1][1], 0.32, 1e-9) && near(t[2][0], 7.162, 1e-3); })());
ok('Below the line on (0, 2) and (6, 8); above on (2, 6)', X.signIntervals(P, [0, 2, 6, 8], 0, 8).map(i => i.sign).join() === 'below,above,below');
ok('B + A = −0.005x³ + 0.05x² + 1 (the x-terms cancel)', T(X.add(M.BASE(), M.ADJUST())) === '−0.005x³ + 0.05x² + 1');
ok('x(x − 8) = x² − 8x, (x − 2)(x − 6) = x² − 8x + 12, product = Q', X.equal(X.mul(H(1, -8, 0), H(1, -8, 12)), QQ));
ok('Synthetic Q ÷ (x − 2): 1, −14, 48, 0 | 0; quotient = x(x − 6)(x − 8)', X.synthetic(QQ, 2).bottom.map(String).join() === '1,−14,48,0,0' && X.equal(X.synthetic(QQ, 2).quotient, X.fromRoots(1, [[0], [6], [8]])));
ok('Q(3) = 45, P(3) = 0.225; Q ÷ (x² − 8x) = x² − 8x + 12 exactly', String(X.evalAt(QQ, 3)) === '45' && X.evalAt(P, 3).eq(X.Frac.of(0.225)) && T(X.longDivide(QQ, H(1, -8, 0)).quotient) === 'x² − 8x + 12' && X.isZero(X.longDivide(QQ, H(1, -8, 0)).remainder));
ok('Cubic x³ − 16x² + 76x − 96: value 16 at x = 4; zeros 2, 6, 8 among the candidates 1–8', String(X.evalAt(M.CUBIC(), 4)) === '16' && [1, 2, 3, 4, 6, 8].filter(c => X.evalAt(M.CUBIC(), c).zero).join() === '2,6,8');
ok('(x² + 1)(x − 2)(x − 6) = x⁴ − 8x³ + 13x² − 8x + 12; real zeros 2 and 6 only', T(X.mul(M.COMPLEX(), X.fromRoots(1, [[2], [6]]))) === 'x⁴ − 8x³ + 13x² − 8x + 12' && X.realRootsIn(X.mul(M.COMPLEX(), X.fromRoots(1, [[2], [6]])), -20, 20).map(x => Math.round(x)).join() === '2,6');
const F1 = Q.finalSet(1);
ok('Final (PRD): F = 0.002(x − 1)(x − 4)(x − 7) = 0.002x³ − 0.024x² + 0.078x − 0.056', T(F1.Fp) === '0.002x³ − 0.024x² + 0.078x − 0.056' && F1.k === 500);
ok('Final (PRD): G = 500F = x³ − 12x² + 39x − 28; ÷ (x − 1) gives x² − 11x + 28, remainder 0; G(2) = 10, F(2) = 0.02', T(F1.G) === 'x³ − 12x² + 39x − 28' && T(F1.syn.quotient) === 'x² − 11x + 28' && F1.syn.remainder.zero && F1.g === 10 && near(F1.f, 0.02));

// ---- 3. Validated sets ----
for (const [i, z] of M.ZERO_PRACTICE.entries()) {
  const p = X.fromRoots(z.a, z.roots), cands = X.rationalCandidates(p);
  ok(`Zero practice ${i + 1}: integer coefficients, degree 3, every zero is a Rational Zero candidate`, X.high(p).every(c => Number.isInteger(Number(c))) && X.degree(p) === 3 && z.roots.every(([r]) => cands.some(c => c.eq(X.Frac.of(r)))));
}
ok('Zero practice never repeats the mission’s cubic or a final round’s zeros', M.ZERO_PRACTICE.every(z => !M.FINAL_SETS.some(f => f.roots.join() === z.roots.map(r => r[0]).join()) && z.roots.map(r => r[0]).join() !== '2,6,8'));
ok('Division practice: both exact and remainder cases, a negative k, and a missing power', M.DIVIDE_PRACTICE.some(d => X.synthetic(X.fromHigh(d.p), d.k).remainder.zero) && M.DIVIDE_PRACTICE.some(d => !X.synthetic(X.fromHigh(d.p), d.k).remainder.zero) && M.DIVIDE_PRACTICE.some(d => d.k < 0) && M.DIVIDE_PRACTICE.some(d => d.p.includes(0)));
const quotients = new Set();
for (const [i] of M.FINAL_SETS.entries()) {
  const F = Q.finalSet(i + 1);
  quotients.add(T(F.syn.quotient));
  ok(`Final round ${i + 1}: 1/a whole, G has integer coefficients, zeros in 0–8, (x − r₁) divides exactly, the test point isn’t a zero`, Number.isInteger(F.k) && X.high(F.G).every(c => Number.isInteger(Number(c))) && F.roots.every(([r]) => r >= 0 && r <= 8) && F.syn.remainder.zero && F.g !== 0 && near(F.f, F.g / F.k));
}
ok('Every final round has its own synthetic-division quotient', quotients.size === M.FINAL_SETS.length);

// ---- 4. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
for (let n = 0; n < M.ZERO_PRACTICE.length; n++) { const PQ = Q.zeroPractice(n); for (const id of Q.ZERO_PRACTICE_IDS) all.push([id, PQ[id], 'z' + n]); }
for (let n = 0; n < M.DIVIDE_PRACTICE.length; n++) { const PQ = Q.dividePractice(n); for (const id of Q.DIVIDE_PRACTICE_IDS) all.push([id, PQ[id], 'd' + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [];
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  if (/undefined|NaN/.test(JSON.stringify([q.prompt, q.solution, q.hints]))) bad.push(where + ': undefined/NaN in text');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' || q.type === 'multi') {
    if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
    if (q.type === 'multi' && !q.options.some(o => o.correct)) bad.push(where + ': a correct option');
    if (q.options.length < 3) bad.push(where + ': three or more options');
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
    if (q.options.some(o => /undefined|NaN/.test(o.text))) bad.push(where + ': undefined/NaN in an option');
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

// Polynomial options: the right one equals the true function, every wrong one doesn't.
const polyChecks = [];
const QS = Q.QUESTIONS, T_ = X.add(M.BASE(), M.ADJUST());
polyChecks.push(['s-add', QS['s-add'], T_], ['s-scale', QS['s-scale'], P], ['s-group', QS['s-group'], H(1, -8, 12)], ['f-build', QS['f-build'], P], ['d-quotient', QS['d-quotient'], X.synthetic(QQ, 2).quotient], ['d-factor-q', QS['d-factor-q'], X.synthetic(QQ, 2).quotient]);
for (let n = 0; n < M.ZERO_PRACTICE.length; n++) { const PQ = Q.zeroPractice(n); polyChecks.push(['fx-factored z' + n, PQ['fx-factored'], PQ.poly]); }
for (let r = 1; r <= 5; r++) { const F = Q.finalQuestions(r); polyChecks.push(['fd-factor r' + r, F['fd-factor'], F.set.syn.quotient]); }
const polyBad = [];
for (const [name, q, truth] of polyChecks) for (const o of q.options) {
  const s = o.text.replace(/, remainder.*$/, '');
  let same; try { same = sameFn(s, truth); } catch (e) { polyBad.push(name + ': unreadable ' + o.text); continue; }
  if (same !== o.correct) polyBad.push(`${name}: “${o.text}” ${o.correct ? 'is marked right but differs' : 'is marked wrong but equals the answer'}`);
}
ok(`Polynomial options are right exactly when they equal the true function (${polyChecks.length} questions)`, polyBad.length === 0, polyBad.slice(0, 6));
ok('Final rounds differ in their numbers', new Set([1, 2, 3, 4, 5].map(r => Q.finalQuestions(r)['fc-expand'].fields.map(f => f.answer).join())).size === 5);
ok('Choice order varies: the right answer isn’t always first', Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').some(q => !q.options[0].correct) && Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').some(q => q.options[0].correct));

// ---- 5. Progress ----
const prog = createProgress({ lesson: { id: 'pump-track-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: Q.QUESTIONS }, storage: 'memory' });
prog.attempt('fx-zeros', 'v0', '1', true, {}); prog.attempt('dx-remainder', 'v3', '6', true, {});
ok('Practice answers keyed by variant', prog.done('fx-zeros', 'v0') && !prog.done('fx-zeros', 'v1') && prog.done('dx-remainder', 'v3'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'pump-track-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 2 lab, home Polynomial Graphs in the Polynomial Functions unit', act && act.status === 'live' && act.home === 'alg2.polynomial-graphs' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Polynomial Functions');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five topics of the unit', ['polynomial-operations', 'polynomial-graphs', 'factoring-higher-degree-polynomials', 'roots-and-zeros', 'remainder-and-factor-theorems'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All nineteen tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 19 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark consistent (10 of 12)', Q.FINAL_IDS.every(id => kinds[id]) && Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10);
ok('Every mission’s graded ids exist, with no id in two missions', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
