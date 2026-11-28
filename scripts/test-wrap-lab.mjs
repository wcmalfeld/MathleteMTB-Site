#!/usr/bin/env node
// Tests for Wrap Lab (learning-lab/wrap-lab/): the PRD's section 29 tables,
// the kit's factoring engine (factor.js), the misconception list (section 30),
// every question in every practice set and certification round (every
// factored answer must multiply back to its source), the visual models, and
// the curriculum mapping.
//   node scripts/test-wrap-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/wrap-lab/', import.meta.url);
const Q = await import(new URL('logic/questions.js', base));
const S = await import(new URL('logic/studio.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const K = await import(new URL('../learning-lab/lesson-kit/factor.js', import.meta.url));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const P = s => K.polyText(K.polyOf(s));
const same = (a, b) => K.samePoly(K.polyOf(a), K.polyOf(b));

// ---- 1. Adding and subtracting (PRD 29) ----
const AS = [['(3x^2 + 4x + 2) + (2x^2 + 5x + 1)', '5x² + 9x + 3'], ['(8x^2 + 7x + 5) - (3x^2 + 2x + 1)', '5x² + 5x + 4'], ['(6x^2 + 5x + 2) - (2x^2 - 3x + 4)', '4x² + 8x − 2']];
ok('Every PRD addition and subtraction', AS.every(([a, b]) => P(a) === b), AS.map(([a]) => P(a)));
const CL = [['7x^3', 3, 1, 'monomial'], ['3x^2 - 4x', 2, 2, 'binomial'], ['x^2 + 5x + 6', 2, 3, 'trinomial'], ['-4x', 1, 1, 'monomial'], ['9', 0, 1, 'monomial'], ['2x^3 + 3x^2 + x + 8', 3, 4, 'four terms']];
ok('Classification table: degree and terms for all six cards', CL.every(([t, d, n, name]) => { const c = K.classify(t); return c.polynomial && c.degree === d && c.terms === n && c.termName === name; }));
ok('3/x and x⁻² are not polynomials', !K.classify('3/x').polynomial && !K.classify('x^-2').polynomial);

// ---- 2. Multiplying (PRD 29) ----
const MU = [['3x(2x + 5)', '6x² + 15x'], ['(x + 3)(x + 4)', 'x² + 7x + 12'], ['(x + 4)^2', 'x² + 8x + 16'], ['(x + 5)(x - 5)', 'x² − 25'], ['(2x + 1)(x + 3)', '2x² + 7x + 3'], ['(x + 2)(x^2 + 3x + 4)', 'x³ + 5x² + 10x + 8']];
ok('Every PRD product', MU.every(([a, b]) => P(a) === b), MU.map(([a]) => P(a)));
ok('The area model’s four regions add up to the expansion (x², 4x, 3x, 12)', same('x^2 + 4x + 3x + 12', '(x + 3)(x + 4)'));
ok('Difference of squares holds for every x (the picture needs x > 5)', [6, 9, 2, -3, 0].every(x => (x + 5) * (x - 5) === x * x - 25));

// ---- 3. Factoring expressions (PRD 29) ----
const FE = [['12x + 18', '6(2x + 3)'], ['6x^2 + 9x', '3x(2x + 3)'], ['3x + 6 + 2xy + 4y', '(x + 2)(3 + 2y)'], ['x^2 + 5x + 3x + 15', '(x + 3)(x + 5)']];
ok('Every PRD factorization multiplies back to its expression', FE.every(([a, b]) => same(a, b)));
ok('GCF engine: 12x + 18 → 6, 6x² + 9x → 3x, 12x³ + 8x² → 4x², 3x + 6 + 2xy + 4y → 1', K.gcfText(K.gcfOf('12x + 18')) === '6' && K.gcfText(K.gcfOf('6x^2 + 9x')) === '3x' && K.gcfText(K.gcfOf('12x^3 + 8x^2')) === '4x²' && K.gcfText(K.gcfOf('3x + 6 + 2xy + 4y')) === '1');
ok('Grouping workshop extras: (2x + 5)(x + 3), (3x + 2)(x + 3), (4x + 3)(x + 2)', same('2x^2 + 6x + 5x + 15', '(2x + 5)(x + 3)') && same('3x^2 + 9x + 2x + 6', '(3x + 2)(x + 3)') && same('4x^2 + 8x + 3x + 6', '(4x + 3)(x + 2)'));
ok('6x(2x + 3) multiplies back to 12x² + 18x', P('6x(2x + 3)') === '12x² + 18x');

// ---- 4. Factoring quadratics (PRD 29) ----
const FQ = [[1, 7, 12, '(x + 3)(x + 4)'], [1, 5, 6, '(x + 2)(x + 3)'], [1, -1, -12, '(x - 4)(x + 3)'], [1, -7, 12, '(x - 3)(x - 4)'], [2, 7, 3, '(2x + 1)(x + 3)'], [1, 10, 25, '(x + 5)^2'], [1, -6, 9, '(x - 3)^2'], [1, 0, -25, '(x + 5)(x - 5)'], [4, 0, -25, '(2x + 5)(2x - 5)']];
ok('Every PRD quadratic factors to the expected factors (any order), and multiplies back', FQ.every(([a, b, c, want]) => { const F = K.factorQuadratic(a, b, c); return F && same(K.quadAscii(F), want) && same(K.quadAscii(F), `${a}*x^2 + (${b})*x + (${c})`); }), FQ.map(([a, b, c]) => K.quadText(K.factorQuadratic(a, b, c))));
ok('Sums of squares and other primes are reported as not factoring over the integers (never guessed)', [[1, 0, 25], [1, 3, 5], [1, 4, 6], [2, 3, 4], [1, 0, 16], [1, -2, 5]].every(([a, b, c]) => K.factorQuadratic(a, b, c) === null));
ok('Common factors are pulled out first: 2x² + 6x + 4 = 2(x + 1)(x + 2); 6x² + 9x = 3x(2x + 3)', same(K.quadAscii(K.factorQuadratic(2, 6, 4)), '2(x + 1)(x + 2)') && K.quadText(K.factorQuadratic(6, 9, 0)) === '3x(2x + 3)');

// ---- 5. The factored-form checker ----
const cf = (answer, raw, o = {}) => K.checkFactored({ answer, ...o }, raw);
ok('Factors in any order are accepted; (x + 5)(x + 5) = (x + 5)²', cf('(x + 3)(x + 4)', '(x+4)(x+3)').correct && cf('(x + 5)^2', '(x+5)(x+5)').correct && cf('(x + 2)(3 + 2y)', '(2y+3)(x+2)', { vars: ['x', 'y'] }).correct);
ok('The expanded form is sent back (not marked wrong)', cf('(x + 3)(x + 4)', 'x^2 + 7x + 12').code === 'unreadable');
ok('Half-finished grouping is sent back with a nudge', /common factor/.test(cf('(x + 2)(3 + 2y)', '3(x+2) + 2y(x+2)', { vars: ['x', 'y'] }).message));
ok('A wrong answer is multiplied back for the student', /Multiply back: your factors give x² \+ 8x \+ 12/.test(cf('(x + 3)(x + 4)', '(x+2)(x+6)').message));

// ---- 6. Misconceptions (section 30) ----
const q = id => Q.QUESTIONS[id], ec = (id, raw) => E.checkExpression(q(id), raw).code, fc = (id, raw) => K.checkFactored(q(id), raw).code, nc = (id, raw) => V.checkNumber(q(id), String(raw)).code, has = (id, c) => q(id).options.some(o => !o.correct && o.code === c);
ok('Combining unlike terms', ec('ad-1', '17x^2') === 'unlike-terms' && has('ad-like', 'unlike-terms'));
ok('Misidentifying degree; confusing degree with number of terms', ['cl-1', 'cl-3', 'cl-6'].every(id => has(id, 'degree-wrong') || has(id, 'degree-terms')) && has('cl-3', 'degree-terms'));
ok('Forgetting to distribute a negative', ec('nd-1', '4x^2 + 2x + 6') === 'negative-first-only' && has('nd-step', 'negative-first-only'));
ok('Distributing multiplication to only one term', ec('mm-1', '6x^2 + 5') === 'distribute-one' && ec('pg-1', 'x^3 + 3x^2 + 4x + 2') === 'distribute-one');
ok('Incorrect FOIL', ec('am-1', 'x^2 + 12') === 'foil-missing' && ec('am-1', 'x^2 + 7x + 7') === 'foil-add');
ok('Forgetting the double middle term', ec('sq-1', 'x^2 + 16') === 'square-no-middle' && ec('sq-1', 'x^2 + 4x + 16') === 'single-middle');
ok('Factoring a sum of squares as a difference of squares', has('dsq-sum', 'sum-of-squares'));
ok('Not identifying the complete GCF', nc('gc-1', 3) === 'partial-gcf' && fc('gc-2', '3(2x^2 + 3x)') === 'incomplete-gcf' && fc('gc-2', 'x(6x + 9)') === 'incomplete-gcf');
ok('Grouping terms without a common binomial', has('gw-none', 'grouping-no-common'));
ok('Not multiplying back to verify', has('gw-none', 'no-verify'));
ok('Pairs that only add (or only multiply) correctly', has('rv-pair', 'pair-sum-only') && has('rv-pair', 'pair-product-only') && fc('rv-1', '(x + 2)(x + 6)') === 'pair-product-only');
ok('Incorrectly factoring non-monic trinomials', fc('nm-1', '(x + 1)(x + 3)') === 'non-monic-error');
ok('Assuming every quadratic factors over the integers', has('rc-prime', 'always-factors'));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); codes.delete('wrong'); const miss = [...codes].filter(c => !Q.MISCONCEPTIONS[c]); return miss.length === 0 || (console.log(miss), false); })());

// ---- 7. Every question ----
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.hints.every(Boolean) || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'expression') { if (!E.checkExpression(x, x.answer).correct) bad.push('own answer'); if (x.src && !same(x.src, x.answer)) bad.push('answer ≠ expansion'); if ((x.traps || []).some(t => E.checkExpression(x, t.expr).correct)) bad.push('trap = answer'); }
  if (x.type === 'factored') { if (!K.checkFactored(x, x.answer).correct) bad.push('own answer: ' + JSON.stringify(K.checkFactored(x, x.answer))); if (!same(x.src, x.answer)) bad.push('factors don’t multiply back'); if ((x.traps || []).some(t => same(t.expr, x.answer))) bad.push('trap = answer'); }
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if (x.type === 'choice' && x.options.length < 3 && !x.inline) bad.push('too few options');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.w && x.w.some(w => same(w, x.prompt.match(/Factor (.+) over/)[1].replace(/−/g, '-')))) bad.push('prime distractor actually works');
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.ADDSUB_PRACTICE, Q.addsubPractice, Q.ADDSUB_IDS, 'addsub'], [Q.EXPAND_PRACTICE, Q.expandPractice, Q.EXPAND_IDS, 'expand'], [Q.CUT_PRACTICE, Q.cutPractice, Q.CUT_IDS, 'cut'], [Q.QUAD_PRACTICE, Q.quadPractice, Q.QUAD_IDS, 'quad']])
  for (let i = 0; i < list.length; i++) { const S_ = fn(i); for (const id of ids) { const r = checkQ(id, S_[id], name + i); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const X = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, X[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed, accepts its own answer, and every factorization multiplies back', problems.length === 0, problems.slice(0, 8));
ok('Certification: 12 questions (3 + 3 + 2 + 4), pass mark 10, four rounds with different values', Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10 && Q.FINAL_SETS.length === 4 && JSON.stringify(['fa', 'fb', 'fc', 'fd'].map(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length)) === '[3,3,2,4]' && new Set([1, 2, 3, 4].map(r => Q.finalQuestions(r)['fd-monic'].answer)).size === 4);
ok('Certification “doesn’t factor” items really don’t, and their distractors really don’t match', Q.FINAL_SETS.every(X => K.factorQuadratic(X.prime[0], X.prime[1], X.prime[2]) === null && [X.prime[3], X.prime[4]].every(w => !same(w, `${X.prime[0]}*x^2 + (${X.prime[1]})*x + (${X.prime[2]})`))));
ok('Certification special products cover both perfect squares and differences of squares', (s => s.has(0) && [...s].some(b => b !== 0))(new Set(Q.FINAL_SETS.map(X => X.special[1]))));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));
ok('Six protection zones, each a real polynomial; the default kit (top + down tube) totals 5x² + 9x + 3', S.ZONES.length === 6 && S.ZONES.every(z => K.classify(z.area).polynomial) && P('(3x^2 + 4x + 2) + (2x^2 + 5x + 1)') === '5x² + 9x + 3');

// ---- 8. The visual models agree with the engine ----
const L = await import(new URL('components/labs.js', base)).catch(() => null);
ok('Grouping board presets: each group equals its factor × bracket, and the result multiplies back', L && L.GROUP_PRESETS.every(g => [0, 1].every(i => same(g.g[i], `${g.f[i]}*(${g.in[i]})`)) && (g.out ? same(g.src, g.out) && g.in[0] === g.in[1] : g.in[0] !== g.in[1])));

// ---- 9. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'wrap-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), KI = Q.questionKinds();
ok('Activity registered at /learning-lab/wrap-lab/', act && act.route === 'learning-lab/wrap-lab/' && act.tracking.gameId === 'wrap-lab' && act.home === 'alg1.adding-and-subtracting-polynomials');
ok('Every question kind maps to real skills', Object.keys(KI).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics and every skill of the unit', (m => m.length === 12 && m.every(s => act.skills.includes(s.id)))(model.skills.filter(s => ['adding-and-subtracting-polynomials', 'multiplying-polynomials', 'factoring-expressions', 'factoring-quadratics'].includes(s.topic.slug) && s.topic.course.id === 'alg1')));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 4 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique, and never clash with practice or certification ids', (() => { const seen = new Set(); const stage = Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); const other = [...Q.ADDSUB_IDS, ...Q.EXPAND_IDS, ...Q.CUT_IDS, ...Q.QUAD_IDS, ...Q.FINAL_IDS]; return stage && other.every(id => !seen.has(id)) && new Set(other).size === other.length; })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
