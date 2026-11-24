#!/usr/bin/env node
// Tests for the Enduro Race Intelligence Lab (learning-lab/race-intelligence-lab/):
// the probability/statistics engine (two-way tables, descriptive statistics,
// the normal CDF, seeded sampling and the randomization test), every PRD
// number, every validated set, every question in every practice variant and
// final round, and the curriculum mapping.
//   node scripts/test-race-intelligence-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/race-intelligence-lab/', import.meta.url);
const S = await import(new URL('logic/stats.js', base));
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
const T = M.raceTable();

// ---- 1. The engine ----
ok('Two-way tables: row totals, column totals and the grand total agree', T.rowTot.join() === '120,80' && T.colTot.join() === '124,76' && T.total === 200);
ok('Table probabilities are exact fractions that stay between 0 and 1', [T.joint(0, 0), T.row(0), T.col(0), T.union(0, 0), T.colGivenRow(0, 0), T.rowGivenCol(1, 1)].every(f => f instanceof S.Frac && Number(f) >= 0 && Number(f) <= 1));
ok('Joint probabilities sum to 1; marginals match the sums of joints', near(Number(T.joint(0, 0).add(T.joint(0, 1)).add(T.joint(1, 0)).add(T.joint(1, 1))), 1) && T.row(0).eq(T.joint(0, 0).add(T.joint(0, 1))) && T.col(0).eq(T.joint(0, 0).add(T.joint(1, 0))));
ok('Conditional = joint ÷ marginal, both ways', T.colGivenRow(0, 0).eq(T.joint(0, 0).div(T.row(0))) && T.rowGivenCol(0, 0).eq(T.joint(0, 0).div(T.col(0))));
ok('An exactly independent table is detected as independent', M.tableOf([[72, 48], [48, 32]]).independent(0, 0) && !T.independent(0, 0));
ok('Mean, median (odd and even), range, population vs sample SD', S.mean([1, 2, 3, 6]) === 3 && S.median([3, 1, 2]) === 2 && S.median([4, 1, 3, 2]) === 2.5 && S.range([4, 9, 1]) === 8 && near(S.popSD([2, 4, 4, 4, 5, 5, 7, 9]), 2) && near(S.sampleSD([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7)));
ok('Quartiles (median of halves) and histogram counts', (q => q.q1 === 176 && q.q3 === 184 && q.iqr === 8)(S.quartiles(M.ALPHA)) && S.histogram(M.ALPHA, 170, 190, 5).map(b => b.count).join() === '2,2,4,2');
ok('Normal CDF matches standard tables to 1e-6', [[0, 0.5], [-1, 0.158655], [1, 0.841345], [2, 0.97725], [-1.5, 0.066807], [1.96, 0.975002], [-3, 0.00135], [3.5, 0.999767]].every(([z, p]) => near(S.Phi(z), p, 1e-6)));
ok('Normal CDF is symmetric and monotone', [0.3, 1.1, 2.7, 4.2].every(z => near(S.Phi(z) + S.Phi(-z), 1, 1e-12)) && [-3, -1, 0, 1, 3].every((z, i, a) => i === 0 || S.Phi(z) > S.Phi(a[i - 1])));
ok('Seeded generator is reproducible and different seeds differ', (() => { const a = S.rng(5), b = S.rng(5), c = S.rng(6); const x = [a(), a(), a()], y = [b(), b(), b()], z = [c(), c(), c()]; return x.join() === y.join() && x.join() !== z.join() && x.every(v => v >= 0 && v < 1); })());
ok('Random samples have no repeats and the right size; oversized samples are refused', (() => { const s = S.sampleIndices(1000, 200, S.rng(3)); return s.length === 200 && new Set(s).size === 200 && s.every(i => i >= 0 && i < 1000); })() && throws(() => S.sampleIndices(10, 11, S.rng(1))));
const POP = M.riders();
ok('The simulated population has exactly 600 flow and 400 technical riders', POP.length === 1000 && S.sum(POP) === 600);
ok('Sampling distributions centre on p = 0.6 with SD close to √(0.24/n)', [25, 100].every(n => { const d = S.samplingDistribution(POP, n, 2000, 11); const fpc = Math.sqrt((1000 - n) / 999); return near(S.mean(d), 0.6, 0.01) && near(S.popSD(d), S.se(0.6, n) * fpc, 0.1 * S.se(0.6, n)); }));
ok('Counting: C(8, 3) = 56, P(8, 3) = 336, P = C × r!', S.nCr(8, 3) === 56 && S.nPr(8, 3) === 336 && S.nPr(10, 4) === S.nCr(10, 4) * S.factorial(4));

// ---- 2. The PRD's numbers ----
ok('P(A) = 0.62, P(B) = 0.60, P(A and B) = 0.42, P(A or B) = 0.80', T.col(0).eq(new S.Frac(31, 50)) && T.row(0).eq(new S.Frac(3, 5)) && T.joint(0, 0).eq(new S.Frac(21, 50)) && T.union(0, 0).eq(new S.Frac(4, 5)));
ok('P(A | Dry) = 0.70, P(A | Wet) = 0.50, P(Wet) = 0.40, P(A)P(B) = 0.372 ≠ 0.42', T.colGivenRow(0, 0).eq(new S.Frac(7, 10)) && T.colGivenRow(0, 1).eq(new S.Frac(1, 2)) && T.row(1).eq(new S.Frac(2, 5)) && near(Number(T.col(0).mul(T.row(0))), 0.372) && !T.independent(0, 0));
ok('Card draws: P(Jump and Wet) = 1/6', near(1 / 3 * 1 / 2, 1 / 6));
ok('Crews: means 180, medians 180, ranges 16 and 40, σ ≈ 4.90 and 11.17', [M.ALPHA, M.BRAVO].every(a => S.mean(a) === 180 && S.median(a) === 180) && S.range(M.ALPHA) === 16 && S.range(M.BRAVO) === 40 && near(S.popSD(M.ALPHA), 4.90, 0.005) && near(S.popSD(M.BRAVO), 11.17, 0.005));
ok('Empirical rule ranges 168–192, 156–204, 144–216; actual areas ≈ 68.3%, 95.4%, 99.7%', [1, 2, 3].every(k => near(S.Phi(k) - S.Phi(-k), [0.6827, 0.9545, 0.9973][k - 1], 0.0001)));
ok('168 s: z = −1, ≈ 15.9th percentile, 84.1% slower; 204 s: z = 2, ≈ 97.7th', S.zScore(168, 180, 12) === -1 && near(S.Phi(-1) * 100, 15.9, 0.05) && S.zScore(204, 180, 12) === 2 && near(S.Phi(2) * 100, 97.7, 0.05));
ok('SE(25) ≈ 0.098, SE(100) ≈ 0.049; p̂ = 0.62 → SE ≈ 0.0485, ME ≈ 0.095, 52.5%–71.5%', near(S.se(0.6, 25), 0.098, 0.0005) && near(S.se(0.6, 100), 0.049, 0.0005) && near(S.se(0.62, 100), 0.0485, 0.00005) && near(S.moe(0.62, 100), 0.095, 0.0005) && near(S.interval(0.62, 100)[0], 0.525, 0.0005) && near(S.interval(0.62, 100)[1], 0.715, 0.0005));
ok('Experiment: 20 per group, means 7.4 and 9.4, difference 2.0, scores within 0–12', M.EXPERIMENT.A.length === 20 && M.EXPERIMENT.B.length === 20 && near(S.mean(M.EXPERIMENT.A), 7.4) && near(S.mean(M.EXPERIMENT.B), 9.4) && [...M.EXPERIMENT.A, ...M.EXPERIMENT.B].every(x => x >= 0 && x <= 12));
const R = Q.testFor(M.EXPERIMENT);
ok('Randomization test: 50,000 seeded shuffles, p matches the PRD’s reference ≈ 0.0033 within simulation error', R.reps === 50000 && near(R.p, 0.0033, 0.0008), R.p);
ok('…and is reproducible: the same seed gives the same p and the same first differences', (() => { const R2 = S.permutationTest(M.EXPERIMENT.A, M.EXPERIMENT.B, 50000, 2026); return R2.p === R.p && R2.diffs.slice(0, 50).join() === R.diffs.slice(0, 50).join(); })());
ok('…and a no-effect check: identical groups give a high p', S.permutationTest([3, 5, 7, 9], [9, 7, 5, 3], 5000, 1).p > 0.9);
ok('…and the null distribution is centred near 0', near(S.mean(Array.from(R.diffs)), 0, 0.02));
const F1 = Q.finalSet(1);
ok('Final (PRD): 162 s → z = −1.5, ≈ 6.7th percentile, 93.3% slower', near(F1.z, -1.5) && near(F1.pctl, 6.7, 0.05) && near(100 - F1.pctl, 93.3, 0.05));

// ---- 3. Validated sets ----
for (const [i, cells] of M.RACE_PRACTICE.entries()) { const t = M.tableOf(cells); ok(`Race practice ${i + 1}: 200 attempts, terminating-decimal answers`, t.total === 200 && [t.colGivenRow(0, 0), t.colGivenRow(0, 1), t.union(0, 0)].every(f => { let d = f.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; })); }
ok('Race practice includes an independent table and a dependent one', M.RACE_PRACTICE.some(c => M.tableOf(c).independent(0, 0)) && M.RACE_PRACTICE.some(c => !M.tableOf(c).independent(0, 0)));
ok('z practice: every z is distinct and between −3 and 3', new Set(M.Z_PRACTICE.map(s => S.zScore(s.x, s.mu, s.sigma))).size === M.Z_PRACTICE.length && M.Z_PRACTICE.every(s => Math.abs(S.zScore(s.x, s.mu, s.sigma)) <= 3));
ok('Sample practice: proportions strictly between 0 and 1, n·p̂ and n(1 − p̂) ≥ 10', M.SAMPLE_PRACTICE.every(s => s.x > 10 && s.n - s.x > 10));
ok('Design practice covers all three study types', ['survey', 'observational', 'experiment'].every(k => M.DESIGN_PRACTICE.some(d => d.kind === k)));
const sigs = [];
for (const [i] of M.FINAL_SETS.entries()) {
  const F = Q.finalSet(i + 1); sigs.push(F.test.p < 0.05);
  ok(`Final round ${i + 1}: table totals 200, |z| ≤ 3, sample checks, experiment 20 + 20, p not right at 0.05`, F.t.total === 200 && Math.abs(F.z) <= 3 && F.C.x >= 10 && F.C.n - F.C.x >= 10 && F.D.A.length === 20 && F.D.B.length === 20 && Math.abs(F.test.p - 0.05) > 0.01, { p: F.test.p });
}
ok('Final rounds include both significant and non-significant experiments, and an independent table', sigs.includes(true) && sigs.includes(false) && M.FINAL_SETS.some(f => M.tableOf(f.A).independent(0, 0)));

// ---- 4. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
const gens = [[M.RACE_PRACTICE, Q.racePractice, Q.RACE_PRACTICE_IDS, 'r'], [M.Z_PRACTICE, Q.zPractice, Q.Z_PRACTICE_IDS, 'z'], [M.SAMPLE_PRACTICE, Q.samplePractice, Q.SAMPLE_PRACTICE_IDS, 's'], [M.DESIGN_PRACTICE, Q.designPractice, Q.DESIGN_PRACTICE_IDS, 'd']];
for (const [list, fn, ids, tag] of gens) for (let n = 0; n < list.length; n++) { const P = fn(n); for (const id of ids) all.push([id, P[id], tag + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [], slip = /NaN|\[object|\$\{|(\d|[=(−+] ?)undefined|undefined ?(s|%|\)|\/)/;
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (id !== id.toLowerCase()) bad.push(where + ': id must be lowercase');
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  if (slip.test(JSON.stringify([q.prompt, q.solution, q.hints]))) bad.push(where + ': template slip in text');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' || q.type === 'multi') {
    if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
    if (q.type === 'multi' && !q.options.some(o => o.correct)) bad.push(where + ': a correct option');
    if (q.options.length < 3) bad.push(where + ': three or more options');
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
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
ok('Rounded and fraction answers are accepted (0.167, 1/6, 15.9, 0.0485, 52.5)', V.checkNumber(Q.QUESTIONS['r-cards'], '0.167').correct && V.checkNumber(Q.QUESTIONS['r-cards'], '1/6').correct && V.checkNumber(Q.QUESTIONS['f-pct'].fields[0], '15.9').correct && V.checkNumber(Q.QUESTIONS['s-se'], '0.0485').correct && V.checkNumber(Q.QUESTIONS['s-interval'].fields[0], '52.5').correct);
ok('The final experiment question’s right answer follows the computed p-value in every round', [1, 2, 3, 4, 5].every(r => { const F = Q.finalQuestions(r), c = F['fd-p'].options.find(o => o.correct); return (F.set.test.p < 0.05) === /^Evidence of a difference/.test(c.text); }));
ok('The final independence question follows the table in every round', [1, 2, 3, 4, 5].every(r => { const F = Q.finalQuestions(r), c = F['fa-indep'].options.find(o => o.correct); return F.set.t.independent(0, 0) === /^Yes/.test(c.text); }));
ok('Choice order varies: the right answer isn’t always first', Object.values(Q.QUESTIONS).filter(q => q.type === 'choice' && !q.keepOrder).some(q => !q.options[0].correct) && Object.values(Q.QUESTIONS).filter(q => q.type === 'choice' && !q.keepOrder).some(q => q.options[0].correct));

// ---- 5. Progress ----
const prog = createProgress({ lesson: { id: 'race-intelligence-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: Q.QUESTIONS }, storage: 'memory' });
prog.attempt('rx-union', 'v0', '0.64', true, {}); prog.attempt('ex-kind', 'v4', 'e', true, {});
ok('Practice answers keyed by variant', prog.done('rx-union', 'v0') && !prog.done('rx-union', 'v1') && prog.done('ex-kind', 'v4'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'race-intelligence-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 2 lab, home Statistical Analysis in the Probability and Statistics unit', act && act.status === 'live' && act.home === 'alg2.statistical-analysis' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Probability and Statistics');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics of the unit', ['probability', 'conditional-probability', 'combinations-and-permutations', 'statistical-analysis'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All thirty-one tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 31 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark consistent (12 of 14)', Q.FINAL_IDS.every(id => kinds[id]) && Q.FINAL_IDS.length === 14 && Q.PASS_MARK === 12);
ok('Every mission’s graded ids exist, with no id in two missions', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
