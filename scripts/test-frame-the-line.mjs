#!/usr/bin/env node
// Tests for Frame the Line (learning-lab/frame-the-line/): the PRD's section
// 30 calculations, the misconception list (section 31), the kit's new line
// and interval checkers, every question in every practice set and
// certification round, and the curriculum mapping.
//   node scripts/test-frame-the-line.mjs   (add -v to list every check)

const base = new URL('../learning-lab/frame-the-line/', import.meta.url);
const F = await import(new URL('logic/film.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const EQ = await import(new URL('../learning-lab/lesson-kit/equation.js', import.meta.url));
const IV = await import(new URL('../learning-lab/lesson-kit/interval.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const mb = (eq, x, y) => { const L = EQ.lineOf(eq, x, y); return L && !L.vertical ? [Number(L.m), Number(L.b)] : L; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- 1. Writing linear equations ----
ok('C = 420d + 1800: C(3) = 3060', F.C(3) === 3060 && Number(E.value('420d + 1800', { d: 3 })) === 3060);
ok('Slope 420 and point (3, 3060) → b = 1800 → C = 420d + 1800', 3060 - 420 * 3 === 1800 && E.checkExpression(Q.QUESTIONS['w-sp-eq'], '420d + 1800').correct);
ok('Two points (1, 2220), (5, 3900): slope 420, intercept 1800', (3900 - 2220) / (5 - 1) === 420 && 2220 - 420 === 1800 && Q.QUESTIONS['w-2p-m'].answer === 420 && Q.QUESTIONS['w-2p-b'].answer === 1800);
ok('Table: 0 → 1800, 1 → 2220, 2 → 2640, 3 → 3060, 4 → 3480, 5 → 3900', F.BUDGET_TABLE.map(r => r.join('→')).join(' ') === '0→1800 1→2220 2→2640 3→3060 4→3480 5→3900');
ok('Description challenges: 95d + 350, 140n + 600, 65h + 250, 310d + 900', [['w-ch-camera', '95d + 350'], ['w-ch-travel', '140n + 600'], ['w-ch-edit', '65h + 250'], ['w-ch-location', '310d + 900']].every(([id, a]) => E.checkExpression(Q.QUESTIONS[id], a).correct));

// ---- 2. Slope-intercept form ----
ok('C = 420d + 1800: slope 420, intercept 1800', same(mb('C = 420d + 1800', 'd', 'c'), [420, 1800]));
ok('C = 300d + 2000: slope 300, intercept 2000', same(mb('C = 300d + 2000', 'd', 'c'), [300, 2000]));
ok('2C − 840d = 3600 converts to C = 420d + 1800', same(mb('2C - 840d = 3600', 'd', 'c'), [420, 1800]) && E.checkExpression(Q.QUESTIONS['si-rewrite'], '420d + 1800').correct);
ok('S + 40h = 600 → S = −40h + 600; 3E − 270h = 360 → E = 90h + 120', same(mb('S + 40h = 600', 'h', 's'), [-40, 600]) && same(mb('3E - 270h = 360', 'h', 'e'), [90, 120]));

// ---- 3. Point-slope form ----
ok('C − 3060 = 420(d − 3) ≡ C = 420d + 1800', same(mb('C - 3060 = 420(d - 3)', 'd', 'c'), [420, 1800]));
ok('E − 1200 = 150(h − 4) ≡ E = 150h + 600', same(mb('E - 1200 = 150(h - 4)', 'h', 'e'), [150, 600]));
ok('S − 400 = −40(h − 5) ≡ S = −40h + 600; M − 60 = 15(h − 0) ≡ M = 15h + 60', same(mb('S - 400 = -40(h - 5)', 'h', 's'), [-40, 600]) && same(mb('M - 60 = 15(h - 0)', 'h', 'm'), [15, 60]));
const psq = Q.QUESTIONS['ps-eq'];
ok('Point-slope answers must be in point-slope form (slope-intercept is the right line, wrong form)', EQ.checkLine(psq, 'C - 3060 = 420(d - 3)').correct && (r => !r.correct && r.code === 'unreadable')(EQ.checkLine(psq, 'C = 420d + 1800')));
ok('Point-slope accepts the equivalent arrangement y − y₁ = m(x − x₁) with spaces or no spaces', EQ.checkLine(psq, 'c-3060=420(d-3)').correct);

// ---- 4. Graphing ----
ok('C = 420d + 1800: y-intercept (0, 1800), slope 420', F.C(0) === 1800 && F.C(1) - F.C(0) === 420);
ok('S = 600 − 40h: y-intercept (0, 600), x-intercept (15, 0)', F.Sf(0) === 600 && F.Sf(15) === 0);
ok('2h + S = 600 has the intercept (300, 0) — the correct point the PRD text calls incorrect', 2 * 300 + 0 === 600 && Q.QUESTIONS['gr-std-x'].answer === 300);
ok('3x + 4y = 24: (8, 0) and (0, 6)', (t => t.some(p => p.x === 8 && p.y === 0) && t.some(p => p.x === 0 && p.y === 6))(Q.QUESTIONS['gr-std2'].targets));
ok('y = 700 is horizontal (slope 0); x = 4 is vertical (undefined slope, not a function)', same(mb('y = 700', 'x', 'y'), [0, 700]) && Number(EQ.lineOf('x = 4', 'x', 'y').vertical) === 4 && Q.QUESTIONS['gr-v-func'].options.find(o => o.correct).text.startsWith('No'));

// ---- 5. Domain and range ----
const civ = (id, raw) => IV.checkInterval(Q.QUESTIONS[id], raw);
ok('C(d), 0 ≤ d ≤ 8: domain [0, 8], range [1800, 5160]', civ('dr-domain', '[0, 8]').correct && civ('dr-range', '[1800, 5160]').correct && F.C(8) === 5160 && F.APPROVED === 5160);
ok('S(h), 0 ≤ h ≤ 15: domain [0, 15], range [0, 600]', civ('dr-s-domain', '[0, 15]').correct && civ('dr-s-range', '[0, 600]').correct);
ok('Interval answers also accept inequalities (0 ≤ d ≤ 8, 0 <= d <= 8)', civ('dr-domain', '0 ≤ d ≤ 8').correct && civ('dr-domain', '0 <= d <= 8').correct);
ok('Open and closed endpoints: (1, 6] right; [1, 6] caught as open-closed', civ('dr-g-dom', '(1, 6]').correct && civ('dr-g-dom', '[1, 6]').code === 'open-closed');
ok('Backwards intervals and “all real numbers” are caught', civ('dr-range', '[5160, 1800]').code === 'reversed-interval' && civ('dr-domain', 'all real numbers').code === 'all-reals');
ok('Discrete vs continuous: whole days give {0…8} and the nine costs; [0, 8] is caught', (x => x.options.find(o => o.correct).text === '{0, 1, 2, 3, 4, 5, 6, 7, 8}' && x.options.some(o => o.code === 'discrete-continuous'))(Q.QUESTIONS['dr-whole']) && Q.QUESTIONS['dr-whole-range'].options.find(o => o.correct).text === '{' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(F.C).join(', ') + '}');

// ---- 6. Function notation ----
ok('C(0) = 1800, C(2) = 2640, C(5) = 3900, C(8) = 5160', [[0, 1800], [2, 2640], [5, 3900], [8, 5160]].every(([d, c]) => F.C(d) === c) && V.checkFields(Q.QUESTIONS['fn-evals'].fields, { c0: '1800', c2: '2640', c5: '3900', c8: '5160' }).correct);
ok('S(5) = 400; E(5) = 570', F.Sf(5) === 400 && F.Ef(5) === 570 && Q.QUESTIONS['fn-s5'].answer === 400 && Q.QUESTIONS['fn-e5'].answer === 570);
ok('One input, one output: function. One input, several outputs: not. Shared outputs: still a function', Q.isFunctionPairs([[1, 2], [2, 4]]) && !Q.isFunctionPairs([[1, 12], [1, 18], [1, 24], [2, 15]]) && Q.isFunctionPairs([[1, 6], [2, 9], [3, 6], [4, 12]]));
ok('The director’s dashboard functions match the models', F.FUNCTIONS.every(f => [0, 1, 5].every(x => f.b + f.m * x === ({ C: F.C, S: F.Sf, E: F.Ef })[f.id](x))));

// ---- 7. Misconceptions (section 31) ----
const q = id => Q.QUESTIONS[id], code = (x, raw) => V.checkNumber(x, raw).code, ecode = (id, raw) => E.checkExpression(q(id), raw).code, opts = (id, c) => q(id).options.some(o => !o.correct && o.code === c);
ok('Confusing slope with y-intercept (1800d + 420; m = 1800)', ecode('w-desc', '1800d + 420') === 'm-b-swap' && code(q('si-m'), '1800') === 'm-b-swap');
ok('Interpreting the slope as the starting cost', opts('si-m-mean', 'slope-as-start') && opts('w-fixed', 'slope-as-start'));
ok('Writing the slope as a reciprocal (4/1680)', code(q('w-2p-m'), String(4 / 1680)) === 'reciprocal');
ok('Substituting into a two-point calculation incorrectly', code(q('w-sp-b'), '1260') === 'two-point-sub' && code(q('w-2p-m'), '1680') === 'two-point-sub');
ok('Sign errors in point-slope form (C + 3060 = 420(d + 3))', EQ.checkLine(psq, 'C + 3060 = 420(d + 3)').code === 'ps-sign');
ok('Distributing incorrectly when converting', ecode('ps-e-si', '150h + 1200') === 'distribute-error' && code(q('ps-step'), '3') === 'distribute-error');
ok('Graphing slope in the wrong direction (+150 for a falling line)', code(q('gr-c-m'), '150') === 'slope-direction');
ok('Confusing x- and y-intercepts', code(q('gr-s-xint'), '600') === 'intercept-swap' && code(q('gr-s-yint'), '15') === 'intercept-swap');
ok('Treating a vertical line as a function of x', opts('gr-v-func', 'vertical-function') && opts('fn-vlt', 'vertical-function'));
ok('Assuming domain and range are always all real numbers', opts('dr-all', 'all-reals') && civ('dr-s-domain', 'all real numbers').code === 'all-reals');
ok('Ignoring practical input constraints', opts('dr-all', 'ignore-constraints') && opts('dr-whole', 'ignore-constraints'));
ok('Treating discrete schedules as continuous without saying so', opts('dr-whole', 'discrete-continuous') && opts('dr-dots', 'discrete-continuous'));
ok('Treating function notation as multiplication', code(q('fn-c3'), String(1800 * 420 * 3)) === 'fn-multiply' && opts('fn-mult', 'fn-multiply'));
ok('Thinking every relation is a function', opts('fn-c', 'every-relation'));
ok('Assuming multiple inputs can’t share an output', opts('dr-share', 'shared-output') && opts('dr-dots', 'shared-output'));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); codes.delete('wrong'); const missing = [...codes].filter(c => !Q.MISCONCEPTIONS[c]); return missing.length === 0 || console.log(missing); })());

// ---- 8. Every question ----
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'fields') { if (!V.checkFields(x.fields, Object.fromEntries(x.fields.map(f => [f.id, String(f.answer)]))).correct) bad.push('own answer'); }
  if (x.type === 'expression') { if (!E.checkExpression(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => E.checkExpression(x, t.expr).correct)) bad.push('trap = answer'); }
  if (x.type === 'line') { if (!EQ.checkLine(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => EQ.checkLine(x, t.eq).correct)) bad.push('trap = answer'); }
  if (x.type === 'interval' && !IV.checkInterval(x, x.answer).correct) bad.push('own answer');
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.type === 'multi' && !x.options.some(o => o.correct)) bad.push('none right');
  if (x.type === 'plot') { const G = x.grid; if (!x.targets.every(t => t.x >= G.x[0] && t.x <= G.x[1] && t.y >= G.y[0] && t.y <= G.y[1] && (!G.profile || ((t.x - G.x[0]) % (G.sx || 1) === 0 && (t.y - G.y[0]) % (G.sy || 1) === 0)))) bad.push('targets off-grid'); if (!G.profile) bad.push('plot grids use profile mode (no map art, no answer table)'); }
  if (x.type === 'lineplot') { const G = x.grid, L = x.line; const pts = L.vertical !== undefined ? [G.y[0], G.y[1]].map(y => [L.vertical, y]) : [G.x[0], G.x[1]].map(v => [v, L.m * v + L.b]); if (!pts.some(([a, b]) => b >= G.y[0] && b <= G.y[1] && a >= G.x[0] && a <= G.x[1])) bad.push('line off-grid'); }
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.TWO_POINT_PRACTICE, Q.twoPointPractice, Q.TWO_POINT_IDS, 'two-point'], [Q.SI_PRACTICE, Q.siPractice, Q.SI_PRACTICE_IDS, 'si'], [Q.PS_PRACTICE, Q.psPractice, Q.PS_PRACTICE_IDS, 'ps'], [Q.DOMAIN_PRACTICE, Q.domainPractice, Q.DOMAIN_PRACTICE_IDS, 'domain'], [Q.FN_PRACTICE, Q.fnPractice, Q.FN_PRACTICE_IDS, 'fn']])
  for (let n = 0; n < list.length; n++) { const S_ = fn(n); for (const id of ids) { const r = checkQ(id, S_[id], name + n); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const X = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, X[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 6));
ok('Practice relations include both functions and non-functions', (s => s.has(true) && s.has(false))(new Set([0, 1, 2, 3, 4, 5].map(n => Q.fnPractice(n)['fx-func'].options.find(o => o.correct).id === 'y'))));
ok('Certification: 12 questions, two per topic, pass mark 10, four rounds with different numbers', Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10 && Q.FINAL_SETS.length === 4 && new Set([1, 2, 3, 4].map(r => Q.finalQuestions(r)['fa-2pt'].answer)).size === 4
  && Q.OBJECTIVES.every(o => Q.FINAL_IDS.filter(id => Q.finalQuestions(1)[id].ideas.some(i => o.ideas.includes(i))).length >= 2));
ok('Certification rounds include both a vertical and a horizontal line, and both function answers', (s => s.has('v') && s.has('h'))(new Set(Q.FINAL_SETS.map(x => (x.hv.vertical !== undefined ? 'v' : 'h')))) && (s => s.size === 2)(new Set(Q.FINAL_SETS.map(x => Q.isFunctionPairs(x.rel)))));
ok('Certification intercepts are whole grid points', [1, 2, 3, 4].every(r => Q.finalQuestions(r)['fd-ints'].targets.every(t => Number.isInteger(t.x) && Number.isInteger(t.y) && t.x <= 10 && t.y <= 10)));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));
ok('Three fictional film concepts with their own art text; the money and storage notes are present', F.CONCEPTS.length === 3 && new Set(F.CONCEPTS.map(c => c.blurb)).size === 3 && /fictional/.test(F.MONEY_NOTE) && /simplified/.test(F.STORAGE_NOTE));
ok('The fixed-cost breakdown adds up to $1,800', F.FIXED_PARTS.reduce((a, [, v]) => a + v, 0) === F.BUDGET.fixed);
ok('The timeline has a phase for every stage', F.TIMELINE.length === 6 && F.TIMELINE.every(t => Q.MISSIONS.some(m => m.id === t.mission)));

// ---- 9. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'frame-the-line'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), K = Q.questionKinds();
ok('Activity registered at its own route', act && act.route === 'learning-lab/frame-the-line/' && act.tracking.gameId === 'frame-the-line' && act.home === 'alg1.writing-linear-equations');
ok('Every question kind maps to real skills', Object.keys(K).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all six topics and every skill of Unit 4', (m => m.length === 18 && m.every(s => act.skills.includes(s.id)))(model.skills.filter(s => s.topic.unit.title === 'Linear Equations and Functions' && s.topic.course.id === 'alg1')), model.skills.filter(s => s.topic.unit.title === 'Linear Equations and Functions' && s.topic.course.id === 'alg1' && !act.skills.includes(s.id)).map(s => s.id));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 6 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique across stages, and no id clashes with practice or certification ids', (() => { const seen = new Set(); const stage = Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); const other = [...Q.TWO_POINT_IDS, ...Q.SI_PRACTICE_IDS, ...Q.PS_PRACTICE_IDS, ...Q.DOMAIN_PRACTICE_IDS, ...Q.FN_PRACTICE_IDS, ...Q.FINAL_IDS]; return stage && other.every(id => !seen.has(id)) && new Set(other).size === other.length; })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
