#!/usr/bin/env node
// Tests for The Split Report (learning-lab/split-report/): the PRD's
// statistics answer keys (section 13), the kit's statistics engine
// (lesson-kit/stats.js), the generated correlation explorer, every question
// in every practice set and certification round, the practice and
// certification datasets, and the curriculum mapping.
//   node scripts/test-split-report.mjs   (add -v to list every check)

const base = new URL('../learning-lab/split-report/', import.meta.url);
const S = await import(new URL('../learning-lab/lesson-kit/stats.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const D = await import(new URL('logic/data.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const r2 = v => Number(v.toFixed(2));

// ---- 1. Rider A and Rider B (PRD 13) ----
const A = S.summary(D.RIDER_A.times), B = S.summary(D.RIDER_B.times);
ok('Rider A: mean 64, median 64, range 4, Q1 63, Q3 65, IQR 2, min 62, max 66', [A.mean, A.median, A.range, A.q1, A.q3, A.iqr, A.min, A.max].join() === '64,64,4,63,65,2,62,66', A);
ok('Rider B: mean 65, median 63.5, range 18, Q1 60, Q3 69.5, IQR 9.5, min 58, max 76', [B.mean, B.median, B.range, B.q1, B.q3, B.iqr, B.min, B.max].join() === '65,63.5,18,60,69.5,9.5,58,76', B);
ok('Totals: 512 ÷ 8 and 520 ÷ 8', A.sum === 512 && B.sum === 520);
ok('Histogram 58–62 / 63–67 / 68–72 / 73–77: A 1, 7, 0, 0 and B 3, 3, 1, 1', Q.HIST.a.map(b => b.count).join() === '1,7,0,0' && Q.HIST.b.map(b => b.count).join() === '3,3,1,1' && Q.HIST.a.map(b => `${b.from}-${b.to}`).join() === '58-62,63-67,68-72,73-77');
ok('Mission 1B decisions: B lower median, A lower mean, A smaller range and IQR', B.median < A.median && A.mean < B.mean && A.range < B.range && A.iqr < B.iqr);
ok('Dot plot stacks: Rider A has two runs at 63, two at 64 and two at 65', S.tally(D.RIDER_A.times).filter(t => t.count === 2).map(t => t.value).join() === '63,64,65');
ok('Quartiles use the median of halves (odd counts leave the median out): 1–5 → Q1 1.5, Q3 4.5; 1–7 → 2, 6', (q => q.q1 === 1.5 && q.q3 === 4.5)(S.quartiles([5, 1, 4, 2, 3])) && (q => q.q1 === 2 && q.q3 === 6)(S.quartiles([1, 2, 3, 4, 5, 6, 7])));
ok('Bin checks: the team’s bins pass; overlaps, gaps, unequal widths and missing values are caught', (() => {
  const mk = a => a.map(([from, to]) => ({ from, to })), all = [...D.RIDER_A.times, ...D.RIDER_B.times];
  return S.checkBins(mk([[58, 62], [63, 67], [68, 72], [73, 77]]), all).ok && S.checkBins(mk([[58, 63], [63, 68], [68, 73], [73, 78]]), all).code === 'bin-overlap' && S.checkBins(mk([[58, 61], [63, 66], [68, 71], [73, 76]]), all).code === 'bin-gap'
    && S.checkBins(mk([[58, 62], [63, 70]]), all).code === 'bin-unequal' && S.checkBins(mk([[60, 64], [65, 69], [70, 74]]), all).code === 'bin-missing';
})());
const L = await import(new URL('components/labs.js', base)).catch(e => (console.log('labs.js import:', e.message), null));
ok('Every histogram-builder setup is judged correctly (three valid, two invalid)', L && L.BIN_SETUPS.map(b => S.checkBins(b.bins.map(([from, to]) => ({ from, to })), [...D.RIDER_A.times, ...D.RIDER_B.times]).ok).join() === 'true,true,true,false,false');

// ---- 2. Scatter plot data ----
ok('Ten correct paired points with PRD field names', D.LAPS.length === 10 && D.LAPS.map(r => `${r.practiceLaps},${r.sectorTimeSeconds}`).join(' ') === '1,78 2,75 3,76 4,71 5,70 6,67 7,68 8,75 9,65 10,62');
ok('Negative direction', S.regression(D.LAP_X, D.LAP_Y).slope < 0 && Q.R_ALL < 0);
ok('The outlier is Rider 8 at (8, 75): the largest residual by far', (() => { const res = S.residuals(Q.MODEL, D.LAP_X, D.LAP_Y).map(Math.abs), k = res.indexOf(Math.max(...res)); return k === D.OUTLIER && D.LAPS[k].practiceLaps === 8 && D.LAPS[k].sectorTimeSeconds === 75 && res[k] > 2.5 * Math.max(...res.filter((_, i) => i !== k)); })());

// ---- 3. Correlation ----
ok('r ≈ −0.81 for all ten, ≈ −0.97 without Rider 8', r2(Q.R_ALL) === -0.81 && r2(Q.R_NINE) === -0.97, [Q.R_ALL, Q.R_NINE]);
ok('r is between −1 and 1, and symmetric: r(x, y) = r(y, x)', Math.abs(Q.R_ALL) <= 1 && near(S.pearson(D.LAP_X, D.LAP_Y), S.pearson(D.LAP_Y, D.LAP_X)));
const F = await import(new URL('components/forecast.js', base)).catch(e => (console.log('forecast.js import:', e.message), null));
ok('Explorer: each linear preset’s r, computed from its own points, matches its setting; strong/weak/none read as intended', F && D.EXPLORER.filter(p => !p.curve).every(p => { const pts = F.explorerPoints(p), r = S.pearson(pts.map(q => q.x), pts.map(q => q.y)); return near(r, p.rho, 1e-9); }));
ok('Explorer: the curve is a clear pattern with r near 0', F && (pts => Math.abs(S.pearson(pts.map(q => q.x), pts.map(q => q.y))) < 0.05 && pts.every(q => near(q.y, 1 + 8 * ((q.x - 5) / 4.5) ** 2, 1e-9)))(F.explorerPoints(D.EXPLORER.find(p => p.curve))));
ok('Explorer: seeded, so the same points every time; changing the seed changes them', JSON.stringify(S.generated(0.5, 24, 2026)) === JSON.stringify(S.generated(0.5, 24, 2026)) && JSON.stringify(S.generated(0.5, 24, 2026)) !== JSON.stringify(S.generated(0.5, 24, 7)));
ok('Correlation recalculates when the data changes (hiding Rider 8 strengthens it)', Math.abs(Q.R_NINE) > Math.abs(Q.R_ALL));

// ---- 4. Regression, predictions and residuals ----
const fit = S.regression(D.LAP_X, D.LAP_Y);
ok('Least squares: slope −1.4, intercept 78.4, ŷ = 78.4 − 1.4x', near(fit.slope, -1.4, 1e-9) && near(fit.intercept, 78.4, 1e-9) && Q.eqText(Q.MODEL) === 'ŷ = 78.4 − 1.4x');
ok('Predictions: 6 → 70, 8 → 67.2, 11 → 63 (flagged as an extrapolation)', near(Q.PRED(6), 70) && near(Q.PRED(8), 67.2) && near(Q.PRED(11), 63) && S.isExtrapolation(Q.MODEL, 11) && !S.isExtrapolation(Q.MODEL, 6) && S.isExtrapolation(Q.MODEL, 0));
const KEY = [[77.0, 1.0], [75.6, -0.6], [74.2, 1.8], [72.8, -1.8], [71.4, -1.4], [70.0, -3.0], [68.6, -0.6], [67.2, 7.8], [65.8, -0.8], [64.4, -2.4]];
ok('The full residual table matches the PRD answer key (residual = actual − predicted)', KEY.every(([p, r], i) => near(Q.PRED(D.LAP_X[i]), p, 1e-9) && near(Q.RES(i), r, 1e-9) && near(S.residual(Q.MODEL, D.LAP_X[i], D.LAP_Y[i]), D.LAP_Y[i] - p, 1e-9)));
ok('Six laps: residual −3; Rider 8: +7.8', near(Q.RES(5), -3) && near(Q.RES(7), 7.8));
ok('The least-squares line has the smallest total squared miss, and its residuals sum to 0', [[-1.2, 77], [-1.5, 79], [-1.4, 78], [-1.6, 79.5]].every(([b, a]) => S.sse({ slope: b, intercept: a }, D.LAP_X, D.LAP_Y) > S.sse(fit, D.LAP_X, D.LAP_Y)) && near(S.sum(S.residuals(fit, D.LAP_X, D.LAP_Y)), 0, 1e-9));

// ---- 5. Practice and certification datasets ----
ok('Six practice and four certification paired datasets: least-squares slope and intercept are exact to one decimal (what students see is the true line)', [...D.PAIRED, ...D.FINAL_PAIRED].every(X => { const R = S.regression(X.x, X.y), Lr = Q.lineOf(X); return near(R.slope, Lr.slope, 1e-9) && near(R.intercept, Lr.intercept, 1e-9); }));
ok('…each has exactly one outlier: the named point has by far the largest residual, and hiding it strengthens r', [...D.PAIRED, ...D.FINAL_PAIRED].every(X => { const R = S.regression(X.x, X.y), res = S.residuals(R, X.x, X.y).map(Math.abs), k = res.indexOf(Math.max(...res)); const r9 = S.pearson(X.x.filter((_, i) => i !== k), X.y.filter((_, i) => i !== k)); return k === X.outlier && res[k] > 2.5 * Math.max(...res.filter((_, i) => i !== k)) && Math.abs(r9) > Math.abs(R.r); }));
ok('…and their r is fairly strong but not perfect (so “fairly strong, not perfect” is right), both directions appear', [...D.PAIRED, ...D.FINAL_PAIRED].every(X => { const r = Math.abs(S.pearson(X.x, X.y)); return r > 0.6 && r < 0.95; }) && D.FINAL_PAIRED.some(X => S.pearson(X.x, X.y) > 0) && D.FINAL_PAIRED.some(X => S.pearson(X.x, X.y) < 0));
ok('Rider pairs: the second rider always has the larger IQR and range, so “more consistent” is unambiguous', [...D.RIDER_PAIRS, ...D.FINAL_PAIRS].every(([c, d]) => { const C = S.summary(c), E = S.summary(d); return C.iqr < E.iqr && C.range < E.range && c.join() === S.sorted(c).join() && d.join() === S.sorted(d).join(); }));

// ---- 6. Every question ----
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); for (let n = 0; n < 6; n++) [Q.auditPractice, Q.scanPractice, Q.signalPractice, Q.forecastPractice].forEach(fn => Object.values(fn(n)).forEach(x => x && x.type && add(x))); codes.delete('wrong'); const miss = [...codes].filter(c => !Q.MISCONCEPTIONS[c]); return miss.length === 0 || (console.log(miss), false); })());
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.hints.every(Boolean) || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'fields') { if (!V.checkFields(x.fields, Object.fromEntries(x.fields.map(f => [f.id, String(f.answer)]))).correct) bad.push('own answer'); if (x.fields.some(f => (f.traps || []).some(t => V.checkNumber(f, String(t.value)).correct))) bad.push('trap = answer'); }
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if (x.type === 'choice' && x.options.length < 3) bad.push('too few options');
  if (x.type === 'multi' && (x.options.filter(o => o.correct).length < 2 || !x.options.some(o => !o.correct))) bad.push('multi mix');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.type === 'scatter' && !(x.targets && x.targets.length === 10)) bad.push('targets');
  if (!['choice', 'multi', 'number', 'fields', 'scatter'].includes(x.type)) bad.push('type ' + x.type);
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'mission')).filter(Boolean);
for (const [count, fn, ids, name] of [[D.RIDER_PAIRS.length, Q.auditPractice, Q.AUDIT_IDS, 'audit'], [D.PAIRED.length, Q.scanPractice, Q.SCAN_IDS, 'scan'], [D.PAIRED.length, Q.signalPractice, Q.SIGNAL_IDS, 'signal'], [D.PAIRED.length, Q.forecastPractice, Q.FORECAST_IDS, 'forecast']])
  for (let i = 0; i < count; i++) { const X = fn(i); for (const id of ids) { const r = checkQ(id, X[id], name + i); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const X = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, X[id], 'round' + r); if (x) problems.push(x); } }
ok('Every mission, practice and certification question is well-formed and accepts its own computed answer', problems.length === 0, problems.slice(0, 8));
ok('Graded answers match the PRD keys (means, medians, quartiles, spreads, histogram, predictions, residuals)', (() => { const f = (id, k) => Q.QUESTIONS[id].fields.find(x => x.id === k).answer; return f('au-mean', 'a') === 64 && f('au-mean', 'b') === 65 && f('au-median', 'b') === 63.5 && f('au-quart', 'q1') === 60 && f('au-quart', 'q3') === 69.5 && f('au-spread', 'ib') === 9.5 && f('au-spread', 'rb') === 18 && [1, 2, 3, 4].map(i => f('au-freq', 'b' + i)).join() === '3,3,1,1' && near(Q.QUESTIONS['fo-pred6'].answer, 70) && near(Q.QUESTIONS['fo-res6'].answer, -3) && near(f('fo-res8', 'r'), 7.8) && near(f('fo-c', 'eleven'), 63) && near(Q.QUESTIONS['fo-slope-n'].answer, -1.4); })());
ok('The PRD’s feedback for “the higher IQR is more consistent” is used word for word', Q.QUESTIONS['au-d4'].options.some(o => /smaller IQR means the middle half of the results are more tightly grouped, which indicates greater consistency/.test(o.feedback || '')));
ok('The causation and outlier questions never state a cause as fact', ['sc-causes', 'sg-factors'].every(id => Q.QUESTIONS[id].options.filter(o => /proves|must be/.test(o.text)).every(o => !o.correct)) && Q.QUESTIONS['sc-flag'].options.find(o => o.correct).text.startsWith('Flag'));
ok('The median hints follow the PRD’s progression', Q.QUESTIONS['au-median'].hints.join(' | ') === 'First, put the values in numerical order. | There are eight values. Which two values are in the middle? | Add the two middle values and divide by two.');
ok('Certification: 12 questions (3 + 3 + 2 + 4), pass mark 10, four rounds with different data', Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10 && Q.FINAL_SETS.length === 4 && JSON.stringify(['fa', 'fb', 'fc', 'fd'].map(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length)) === '[3,3,2,4]' && new Set([1, 2, 3, 4].map(r => Q.finalQuestions(r)['fd-predict'].answer)).size === 4);
ok('Certification extrapolation items really are outside the data', [1, 2, 3, 4].every(r => { const X = Q.FINAL_SETS[r - 1].data, xo = Number(Q.finalQuestions(r)['fd-extrap'].prompt.match(/x = (\d+)/)[1]); return xo > Math.max(...X.x); }));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));

// ---- 7. Shared engine ----
const RS = await import(new URL('../learning-lab/race-intelligence-lab/logic/stats.js', import.meta.url));
ok('The Algebra 2 statistics lab now uses the same kit engine (same quartiles)', RS.quartiles === S.quartiles && RS.median === S.median && RS.histogram === S.histogram);

// ---- 8. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'split-report'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), KI = Q.questionKinds();
ok('Activity registered at /learning-lab/split-report/', act && act.route === 'learning-lab/split-report/' && act.tracking.gameId === 'split-report' && act.home === 'alg1.data-representation');
ok('Every question kind maps to real skills', Object.keys(KI).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics and all 12 skills of the unit', (m => m.length === 12 && m.every(s => act.skills.includes(s.id)))(model.skills.filter(s => ['data-representation', 'scatter-plots', 'correlation', 'lines-of-best-fit'].includes(s.topic.slug) && s.topic.course.id === 'alg1')));
ok('Each topic opens its own mission', Object.keys(act.stages).length === 4 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique, and never clash with practice or certification ids', (() => { const seen = new Set(); const stage = Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); const other = [...Q.AUDIT_IDS, ...Q.SCAN_IDS, ...Q.SIGNAL_IDS, ...Q.FORECAST_IDS, ...Q.FINAL_IDS]; return stage && other.every(id => !seen.has(id)) && new Set(other).size === other.length; })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
