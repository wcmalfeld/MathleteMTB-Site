#!/usr/bin/env node
// Tests for the Suspension & Systems Lab (learning-lab/suspension-systems-lab/):
// the exponential/logarithm calculation layer, every PRD number (with the one
// corrected), every validated set, every question in every practice variant
// and final round, and the curriculum mapping.
//   node scripts/test-suspension-systems-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/suspension-systems-lab/', import.meta.url);
const X = await import(new URL('logic/expo.js', base));
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
// The lab's model text (Aₙ = 18(0.65)ⁿ, R(w) = 100 + 20w, …) as a function of n or w.
function fnOf(s) {
  const e = s.replace(/^[^=]*= /, '').replace(/−/g, '-').replace(/[ⁿʷ]/g, '**v').replace(/\^(\d+)([nw])/g, '**($1*v)')
    .replace(/(\d)\(/g, '$1*(').replace(/(\d)([nw])/g, '$1*v').replace(/\b[nw]\b/g, 'v');
  return new Function('v', 'return ' + e);
}
const sameFn = (s, truth) => [0, 1, 2.5, 4].every(v => near(fnOf(s)(v), truth(v), 1e-9 * (1 + Math.abs(truth(v)))));

// ---- 1. The calculation layer ----
ok('Explicit and recursive geometric rules agree', [[18, 0.65], [100, 1.2], [3, -0.5]].every(([a, r]) => X.terms(a, r, 8).every((v, i) => near(v, X.recursive(a, r, 8)[i], 1e-12))));
ok('solveExp inverts the exponential; bad inputs are refused', [[18, 0.65, 2], [100, 1.2, 250], [5, 3, 400]].every(([a, b, t]) => near(X.term(a, b, X.solveExp(a, b, t)), t, 1e-9)) && throws(() => X.solveExp(10, 1, 5)) && throws(() => X.solveExp(10, 0.5, -1)));
ok('firstWhole: decay below / growth at-or-above, robust at exact whole numbers', X.firstWhole(18, 0.65, 2) === 6 && X.firstWhole(100, 1.2, 250) === 6 && X.firstWhole(16, 0.5, 2) === 4 && X.firstWhole(100, 2, 400) === 2);
ok('Logs: exact integers for exact powers (log₂ 32 = 5, log₁₀ 10⁷ = 7); positive arguments only; base ≠ 1', X.logb(32, 2) === 5 && X.logb(1e7) === 7 && X.logb(1000) === 3 && throws(() => X.logb(0)) && throws(() => X.logb(-5)) && throws(() => X.logb(5, 1)));
ok('Log properties hold numerically', [[3, 7], [100, 1000], [0.2, 50]].every(([m, n]) => near(X.logb(m * n), X.logb(m) + X.logb(n), 1e-12) && near(X.logb(m / n), X.logb(m) - X.logb(n), 1e-12) && near(X.logb(m ** 3), 3 * X.logb(m), 1e-12)));
ok('Level and intensity are inverses; doubling intensity adds ≈ 3.01 dB', [40, 75, 92.5].every(L => near(X.level(X.intensity(L)), L, 1e-9)) && near(X.combine(70, 70) - 70, 10 * Math.log10(2), 1e-9));
ok('Scientific notation: 3.1623 × 10⁻⁵, and 9.99999 rounds into the next power', near(X.sci(X.intensity(75)).c, 3.16227766, 1e-6) && X.sci(X.intensity(75)).e === -5 && X.sci(1e-4).e === -4 && near(X.sci(1e-4).c, 1, 1e-9));
ok('Continuous rate matches the discrete factor at every period', [0, 1, 2, 5].every(n => near(X.envelope(18, M.K, n * 0.5), X.term(18, 0.65, n), 1e-9)));

// ---- 2. The PRD's numbers ----
ok('Table 18, 11.7, 7.605, 4.943, 3.213, 2.089, 1.358', [18, 11.7, 7.605, 4.943, 3.213, 2.089, 1.358].every((v, n) => near(X.term(18, 0.65, n), v, 0.0006)));
ok('Linear comparison Lₙ = 18 − 6.3n matches at cycle 1 and goes negative at cycle 3', near(X.linear(18, -6.3, 1), X.term(18, 0.65, 1), 1e-9) && X.linear(18, -6.3, 3) < 0);
ok('k = −ln(0.65)/0.5 ≈ 0.8616; settling t ≈ 2.55 s, n ≈ 5.10, first peak below 2 mm at cycle 6', near(M.K, 0.8616, 0.0001) && near(X.solveEnvelope(18, M.K, 2), 2.55, 0.005) && near(X.solveExp(18, 0.65, 2), 5.10, 0.005) && X.firstWhole(18, 0.65, 2) === 6);
ok('Registrations 100, 120, 144, 173, 207, 249, 299 (rounded); L(6) = 220', [100, 120, 144, 173, 207, 249, 299].every((v, w) => Math.round(X.term(100, 1.2, w)) === v) && X.linear(100, 20, 6) === 220);
ok('250 registrations at w ≈ 5.03; first reached at week 6; S₅ = 744.16', near(X.solveExp(100, 1.2, 250), 5.03, 0.005) && X.firstWhole(100, 1.2, 250) === 6 && near(X.seriesSum(100, 1.2, 5), 744.16, 1e-9));
ok('Decibel table 40, 50, 70, 80 dB; 75 dB → 3.1623 × 10⁻⁵ W/m²; log₃ 20 ≈ 2.7268', M.SOUND.locations.map(l => X.level(10 ** l.e)).join() === '40,50,70,80' && near(X.intensity(75), 3.1623e-5, 1e-9) && near(X.logb(20, 3), 2.7268, 0.0001));
const F1 = Q.finalSet(1);
ok('Final A (PRD): 24(0.7)⁴ = 5.7624, n ≥ 5.83, cycle 6', near(F1.aAt, 5.7624, 1e-9) && near(F1.aN, 5.83, 0.005) && F1.aFirst === 6);
ok('Final B (PRD): R(4) ≈ 262.35, first reached at week 4', near(F1.bAt, 262.35, 0.005) && X.firstWhole(150, 1.15, 250) === 4);
ok('Final B correction: w = ln(250/150)/ln(1.15) ≈ 3.66, not the PRD’s 3.61 (which gives ≈ 248.4)', near(F1.bW, 3.655, 0.001) && X.term(150, 1.15, 3.61) < 249);
ok('Final C (PRD): 80 dB → 10⁻⁴ W/m²; Final D: 24e^(−0.9t) = 4 at t ≈ 1.99 s', F1.cE === -4 && near(F1.dT, 1.99, 0.005));
ok('Extension: k = ln 1.2 ≈ 0.1823, and 100e^(kt) = 100(1.2)ᵗ at whole weeks', near(X.growthRate(1.2), 0.1823, 0.0001) && [1, 3, 6].every(t => near(100 * Math.exp(X.growthRate(1.2) * t), X.term(100, 1.2, t), 1e-9)));

// ---- 3. Validated sets ----
for (const [i, s] of M.BOUNCE_PRACTICE.entries()) { const x = X.solveExp(s.A0, s.r, s.threshold); ok(`Bounce practice ${i + 1}: threshold not hit exactly at a whole cycle; differs from the PRD model`, Math.abs(x - Math.round(x)) > 0.02 && !(s.A0 === 18 && s.r === 0.65)); }
for (const [i, s] of M.GROW_PRACTICE.entries()) { const w = X.solveExp(s.R0, 1 + s.pct / 100, s.target); ok(`Growth practice ${i + 1}: target reached between whole weeks, within 10 weeks`, w > 0 && w < 10 && Math.abs(w - Math.round(w)) > 0.02); }
ok('Growth practice answers never repeat a final round’s', M.GROW_PRACTICE.every(s => M.FINAL_SETS.every(f => !near(X.solveExp(s.R0, 1 + s.pct / 100, s.target), X.solveExp(f.B.R0, 1 + f.B.pct / 100, f.B.target), 0.005))));
ok('Sound practice readings aren’t multiples of 10', M.SOUND_PRACTICE.every(s => s.L % 10 !== 0));
for (const [i] of M.FINAL_SETS.entries()) {
  const F = Q.finalSet(i + 1);
  ok(`Final round ${i + 1}: thresholds and targets fall between whole steps; the linear model is slower; levels are whole tens`, Math.abs(F.aN - Math.round(F.aN)) > 0.02 && Math.abs(F.bW - Math.round(F.bW)) > 0.02 && F.bLinW > F.bW && F.C.L % 10 === 0 && F.dT > 0);
}
ok('Final rounds differ', new Set([1, 2, 3, 4, 5].map(r => Q.finalSet(r).aAt.toFixed(4) + Q.finalSet(r).bW.toFixed(3))).size === 5);

// ---- 4. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
const gens = [[M.BOUNCE_PRACTICE, Q.bouncePractice, Q.BOUNCE_PRACTICE_IDS, 'b'], [M.GROW_PRACTICE, Q.growPractice, Q.GROW_PRACTICE_IDS, 'g'], [M.SOUND_PRACTICE, Q.soundPractice, Q.SOUND_PRACTICE_IDS, 's']];
for (const [list, fn, ids, tag] of gens) for (let n = 0; n < list.length; n++) { const P = fn(n); for (const id of ids) all.push([id, P[id], tag + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [], slip = /NaN|\[object|\$\{|(\d|[=(−+] ?)undefined|undefined ?(m|min|mm|dB|%|\)|\/)/;
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (id !== id.toLowerCase()) bad.push(where + ': id must be lowercase (it becomes a question id in the database)');
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  if (slip.test(JSON.stringify([q.prompt, q.solution, q.hints]))) bad.push(where + ': template slip in text');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' || q.type === 'multi') {
    if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
    if (q.options.length < 3) bad.push(where + ': three or more options');
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
    if (q.options.some(o => slip.test(o.text))) bad.push(where + ': template slip in an option');
    q.options.filter(o => !o.correct).forEach(o => { if (!o.feedback) bad.push(where + ': feedback on ' + o.id); if (!Q.MISCONCEPTIONS[o.code]) bad.push(where + ': code ' + o.code); });
  }
  const fields = q.type === 'number' ? [{ answer: q.answer, tolerance: q.tolerance, traps: q.traps }] : q.type === 'fields' ? q.fields : [];
  for (const f of fields) {
    if (!isFinite(f.answer)) bad.push(where + ': finite answer');
    if (!V.checkNumber(f, String(f.answer)).correct) bad.push(where + ': answer accepted');
    if (f.tolerance < Math.abs(f.answer) * 1e-6 && f.tolerance < 1e-6) bad.push(where + ': tolerance too tight for a decimal answer');
    for (const t of f.traps || []) { if (!Q.MISCONCEPTIONS[t.code]) bad.push(where + ': trap code ' + t.code); if (V.checkNumber(f, String(t.value)).correct) bad.push(where + ': trap accepted ' + t.value); }
  }
}
ok(`Every question (${all.length} across practice variants and rounds) is well formed; answers accepted, traps not`, bad.length === 0, bad.slice(0, 6));
ok('Rounded answers are accepted at the precision the prompt asks for (4.943, 2.55, 5.10, 2.727, 73.01)', [['b-a3', '4.943'], ['b-settle-t', '2.55'], ['b-settle-n', '5.10'], ['d-log3', '2.727'], ['d-combine', '73.01']].every(([id, v]) => V.checkNumber(Q.QUESTIONS[id], v).correct));

// Model options: right exactly when they equal the true function.
const checks = [];
for (let n = 0; n < 5; n++) { const P = Q.bouncePractice(n); checks.push(['bx-explicit ' + n, P['bx-explicit'], v => X.term(P.set.A0, P.set.r, v)]); const G = Q.growPractice(n); checks.push(['gx-model ' + n, G['gx-model'], v => X.term(G.set.R0, 1 + G.set.pct / 100, v)]); }
for (let r = 1; r <= 5; r++) { const F = Q.finalQuestions(r), S = F.set; checks.push(['fa-model ' + r, F['fa-model'], v => X.term(S.A.A0, S.A.r, v)], ['fb-model ' + r, F['fb-model'], v => X.term(S.B.R0, S.f, v)]); }
const exprBad = [];
for (const [name, q, truth] of checks) for (const o of q.options) { let same; try { same = sameFn(o.text, truth); } catch (e) { exprBad.push(name + ': unreadable ' + o.text); continue; } if (same !== o.correct) exprBad.push(`${name}: “${o.text}” ${o.correct ? 'marked right but differs' : 'marked wrong but equal'}`); }
ok(`Model options are right exactly when they equal the true function (${checks.length} questions)`, exprBad.length === 0, exprBad.slice(0, 6));
ok('Choice order varies: the right answer isn’t always first', Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').some(q => !q.options[0].correct) && Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').some(q => q.options[0].correct));

// ---- 5. Progress ----
const prog = createProgress({ lesson: { id: 'suspension-systems-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: Q.QUESTIONS }, storage: 'memory' });
prog.attempt('gx-w', 'v0', '5.1', true, {}); prog.attempt('dx-int', 'v2', '1.585', true, {});
ok('Practice answers keyed by variant', prog.done('gx-w', 'v0') && !prog.done('gx-w', 'v1') && prog.done('dx-int', 'v2'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'suspension-systems-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 2 lab, home Exponential Growth and Decay in the Exponential and Logarithmic Functions unit', act && act.status === 'live' && act.home === 'alg2.exponential-growth-and-decay' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Exponential and Logarithmic Functions');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five topics of the unit, plus Geometric Sequences and Series', ['exponential-functions', 'exponential-growth-and-decay', 'logarithms', 'logarithmic-properties', 'applications', 'geometric-sequences', 'series'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All twenty-eight tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 28 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark consistent (10 of 12)', Q.FINAL_IDS.every(id => kinds[id]) && Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10);
ok('Every mission’s graded ids exist, with no id in two missions', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
