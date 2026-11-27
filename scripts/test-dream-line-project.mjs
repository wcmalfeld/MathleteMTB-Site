#!/usr/bin/env node
// Tests for the Dream Line Project (learning-lab/dream-line-project/) and the
// kit's expression engine (learning-lab/lesson-kit/expr.js): parsing,
// exact evaluation, the order of operations one step at a time, equivalence,
// every PRD number, number classifications, the properties (and their
// non-examples), the park build plan, every question in every practice
// variant and certification round, and the curriculum mapping.
//   node scripts/test-dream-line-project.mjs   (add -v to list every check)

const base = new URL('../learning-lab/dream-line-project/', import.meta.url);
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const { Frac } = await import(new URL('../learning-lab/lesson-kit/frac.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const N = await import(new URL('logic/numbers.js', base));
const K = await import(new URL('logic/park.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const { createProgress } = await import(new URL('../learning-lab/lesson-kit/progress.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const throws = fn => { try { fn(); return false; } catch (e) { return e instanceof E.ExprError; } };
const val = (e, v) => String(E.value(e, v));

// ---- 1. The PRD's calculation table (section 22) ----
const TABLE = [['4(3) + 3(2) + 5', '23'], ['2400 + (-125.5)', '4549/2'], ['(3/4)(2.4)', '9/5'], ['1.25 + 0.75', '2'], ['3(18 + 2²) + 12', '78'], ['5 + 3 × 4', '17'], ['48 ÷ 6 × 2', '16'], ['18 - 4 + 3', '17'], ['2[7 + (3²)] ÷ 4', '8'], ['(18 + 6) ÷ 3', '8'], ['5(2 + 3)', '25']];
for (const [e, want] of TABLE) ok(`PRD: ${e} = ${want === '4549/2' ? '2274.5' : want === '9/5' ? '1.8' : want}`, val(e) === want, val(e));
ok('PRD: 4(x + 2) = 20 when x = 3', val('4(x + 2)', { x: 3 }) === '20');

// ---- 2. The engine ----
ok('Exact arithmetic: 0.1 + 0.2 is exactly 3/10', E.value('0.1 + 0.2').eq(new Frac(3, 10)));
ok('Precedence: −3² = −9; 2^3^2 = 512 (right-assoc); 6/2(1+2) = 9 (left to right)', val('-3^2') === '−9' && val('2^3^2') === '512' && val('6/2(1+2)') === '9');
ok('Symbols: × · * and ÷ / and − – all read; [ ] and { } group', val('2·3×4*1') === '24' && val('12 ÷ 3 / 2') === '2' && val('10 − 3 – 2') === '5' && val('{2[1 + 1]}') === '4');
ok('Implicit multiplication: 4t, 3(…), (…)(…)', val('4t', { t: 3 }) === '12' && val('(2)(3)(4)') === '24' && val('2t(t + 1)', { t: 2 }) === '12');
ok('Friendly errors for bad input (never a crash)', ['', '4t+', '(4t', '4t)', '3 4', '[4)', 'x = 3', '4$', '1.2.3', '()'].every(s => throws(() => E.parse(s))));
ok('Division by zero is reported, not Infinity', throws(() => E.value('4 ÷ (2 − 2)')));
ok('Pretty text keeps the writer’s brackets', E.toText(E.parse('3(18+2^2)+12')) === '3(18 + 2²) + 12' && E.toText(E.parse('2400+(-125.5)')) === '2400 + (−125.5)' && E.toText(E.parse('48/6*2')) === '48/6 × 2');
ok('Equivalence: 4(x + 2) ≡ 4x + 8, 2n + 3n ≡ 5n, order doesn’t matter; 4t + 3b ≢ 7tb', E.equivalent('4(x+2)', '4x+8') && E.equivalent('2n+3n', '5n') && E.equivalent('4t+3b+5', '5+3b+4t') && !E.equivalent('4t+3b', '7tb'));
ok('Simplified form: 5t and 4x + 8 yes; 3t + 2t and 4(x + 2) no', E.isSimplified(E.parse('5t')) && E.isSimplified(E.parse('4x+8')) && !E.isSimplified(E.parse('3t+2t')) && !E.isSimplified(E.parse('4(x+2)')));
ok('Shape: 4(3) + 3(2) + 5 matches 3×2 + 4·3 + 5, not 12 + 6 + 5 or 23', E.sameShape('4(3)+3(2)+5', '3*2 + 4·3 + 5') && !E.sameShape('4(3)+3(2)+5', '12+6+5') && !E.sameShape('4(3)+3(2)+5', '23'));
ok('checkExpression: right, a trap, a stray letter, an unsimplified form', E.checkExpression({ answer: '4t+3b+5' }, '3b + 4t + 5').correct && E.checkExpression({ answer: '4t+3b+5', traps: [{ expr: '4t+3b', code: 'missing-constant' }] }, '4t+3b').code === 'missing-constant' && E.checkExpression({ answer: '4t+3b+5' }, '4x+3b+5').code === 'unreadable' && E.checkExpression({ answer: '5t', form: 'simplified' }, '3t+2t').code === 'unreadable');

// ---- 3. Order of operations, one step at a time ----
const firstStep = e => E.stepOf(E.next(E.parse(e))).text;
ok('First steps: 2² in 3(18 + 2²) + 12; 3 × 4 in 5 + 3 × 4; 48 ÷ 6 in 48 ÷ 6 × 2; 18 − 4 in 18 − 4 + 3; 3² in 2[7 + (3²)] ÷ 4', firstStep('3(18 + 2²) + 12') === '2² = 4' && firstStep('5 + 3 × 4') === '3 × 4 = 12' && firstStep('48 ÷ 6 × 2') === '48 ÷ 6 = 8' && firstStep('18 - 4 + 3') === '18 − 4 = 14' && firstStep('2[7 + (3²)] ÷ 4') === '3² = 9');
ok('The PRD’s inventory steps, in order: 2² = 4, 18 + 4 = 22, 3 × 22 = 66, 66 + 12 = 78', E.solveSteps('3(18 + 2²) + 12').map(s => s.text).join('|') === '2² = 4|18 + 4 = 22|3 × 22 = 66|66 + 12 = 78');
ok('Every solveSteps run ends at the evaluated value (all board, mistake and final expressions)', [...Q.BOARD.map(b => b.expr), ...Q.MISTAKES.map(m => m.expr), ...Q.ORDER_PRACTICE.map(o => o.expr), ...Q.FINAL_SETS.map(s => s.order.expr)].every(e => { const st = E.solveSteps(e); return st.length && st[st.length - 1].value.eq(E.value(e)); }));
const pick = (e, kind) => { const t = E.parse(e); return [t, E.operations(t).find(o => E.kindOf(o.node) === kind).node]; };
ok('whyNot: + before × → add-before-multiply; × before ÷ in 48 ÷ 6 × 2 → left-to-right; × of a bracket → ignore-grouping; + before 2² → exponent-order', E.whyNot(...pick('5 + 3 × 4', 'add')).code === 'add-before-multiply' && E.whyNot(...pick('48 ÷ 6 × 2', 'multiply')).code === 'left-to-right' && E.whyNot(...pick('3(18 + 2²) + 12', 'multiply')).code === 'ignore-grouping' && E.whyNot(...pick('18 + 2²', 'add')).code === 'exponent-order');
ok('Two independent groupings may go in either order: (2 + 3) × 4² has two allowed steps', E.ready(E.parse('(2 + 3) × 4²')).length === 2 && E.ready(E.parse('2 + 3 + 4 × 5')).length === 1);
ok('A fraction bar groups top and bottom: (12 + 18)/(2 × 3) allows both inner steps, never the division first', (() => { const t = E.parse('(12 + 18)/(2 × 3)'); t.bar = true; const R = E.ready(t); return R.length === 2 && !R.includes(t); })());

// ---- 4. Number sets and properties ----
const sets = c => N.setsOf(c).join(',');
ok('6: natural, whole, integer, rational', sets(N.CARDS[0]) === 'natural,whole,integer,rational');
ok('0: whole, integer, rational (natural numbers start at 1)', sets(N.CARDS[1]) === 'whole,integer,rational');
ok('−4: integer, rational', sets(N.CARDS[2]) === 'integer,rational');
ok('2.5 and 3/4: rational', sets(N.CARDS[3]) === 'rational' && sets(N.CARDS[4]) === 'rational');
ok('π and √2: irrational', sets(N.CARDS[5]) === 'irrational' && sets(N.CARDS[6]) === 'irrational');
ok('√9 = 3 is natural; √5 is irrational', sets(N.sqrtCard(9)) === 'natural,whole,integer,rational' && sets(N.sqrtCard(5)) === 'irrational');
ok('Commutative for + and ×; NOT for − (8 − 3 ≠ 3 − 8) or ÷', N.commutes('+', 4, 6) && N.commutes('×', 4, 6) && !N.commutes('−', 8, 3) && !N.commutes('÷', 12, 4));
ok('Associative for + and ×; NOT for − or ÷', N.associates('+', 2, 3, 4) && N.associates('×', 2, 3, 4) && !N.associates('−', 12, 4, 2) && !N.associates('÷', 24, 4, 2));
ok('Identity: 8 + 0 = 8, 8 × 1 = 8', E.value('8 + 0').eq(8) && E.value('8 × 1').eq(8));
ok('Additive inverse: 7 + (−7) = 0', E.value('7 + (-7)').zero && N.additiveInverse(7).eq(-7));
ok('Multiplicative inverse: 4 × 1/4 = 1; 0 has none', new Frac(4).mul(N.reciprocal(4)).eq(1) && N.reciprocal(0) === null);
ok('Distributive: 5(2 + 3) = 5(2) + 5(3) = 25; 4(x + 2) = 4x + 8', N.distributes(5, 2, 3) && E.equivalent('4(x + 2)', '4x + 8'));
ok('Like terms: 3t + 2t = 5t; 3t + 2b is not 5tb or 5t', E.equivalent('3t + 2t', '5t') && !E.equivalent('3t + 2b', '5tb') && !E.equivalent('3t + 2b', '5t'));
ok('Non-example guard: 3(4 + 2) ≠ 3(4) + 2', !E.value('3(4 + 2)').eq(E.value('3(4) + 2')));

// ---- 5. The park ----
const park = K.blankPark(); park.slots[0] = park.slots[1] = park.slots[2] = 'tabletop'; park.slots[4] = park.slots[5] = 'berm';
const plan = K.buildPlan(park);
ok('3 tabletops + 2 berms: H = 4t + 3b + 5 and 4(3) + 3(2) + 5 = 23', plan.expression === 'H = 4t + 3b + 5' && plan.substituted === 'H = 4(3) + 3(2) + 5' && plan.total === 23);
ok('The build plan agrees with the engine for every feature', K.FEATURES.every(f => { const p = K.blankPark(); p.slots[0] = p.slots[3] = f.id; const b = K.buildPlan(p); return Number(E.value(b.substituted.slice(4))) === b.total && b.total === 2 * f.hours + 5; }));
ok('An empty park is H = 5; two more tabletops add 8 hours', K.buildPlan(K.blankPark()).total === 5 && K.increase('tabletop', 2) === 8);
ok('Feature letters are distinct and none is H', new Set(K.FEATURES.map(f => f.letter)).size === K.FEATURES.length && !K.FEATURES.some(f => f.letter.toLowerCase() === 'h'));
ok('tidyPark repairs bad saved data', (() => { const t = K.tidyPark({ env: 'moon', slots: ['tabletop', 'rocket'], name: 7 }); return t.env === 'forest' && t.slots.length === K.SPOTS.length && t.slots[1] === null && t.name === '7'; })());
ok('Nine features, three environments, twelve spots, four badges', K.FEATURES.length === 9 && K.ENVIRONMENTS.length === 3 && K.SPOTS.length === 12 && K.BADGES.length === 4);

// ---- 6. Every question ----
function checkQ(id, q, where) {
  const bad = [];
  if (!q || !q.prompt || !Array.isArray(q.ideas) || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (q.type !== 'board' && (!q.hints || q.hints.length !== 3 || !q.solution)) bad.push('hints/solution');
  if (q.type === 'number') { if (!V.checkNumber(q, String(q.answer)).correct) bad.push('own answer'); if ((q.traps || []).some(t => V.checkNumber(q, String(t.value)).correct)) bad.push('trap = answer'); }
  if (q.type === 'expression') { if (!E.checkExpression(q, q.answer).correct) bad.push('own answer'); if ((q.traps || []).some(t => E.checkExpression(q, t.expr).correct)) bad.push('trap = answer'); for (const a of q.also || []) if (!E.checkExpression(q, a).correct) bad.push('alt'); }
  if (q.type === 'choice') { if (q.options.filter(o => o.correct).length !== 1) bad.push('one right'); if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push('dup options'); }
  if (q.type === 'multi') { if (!q.options.some(o => o.correct)) bad.push('none right'); if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push('dup options'); }
  if (q.type === 'board') { if (!E.value(q.expr).eq(Frac.of(q.answer))) bad.push('board value'); }
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, q]) => checkQ(id, q, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.BUILD_PRACTICE, Q.buildPractice, Q.BUILD_PRACTICE_IDS, 'build'], [Q.ORDER_PRACTICE, Q.orderPractice, Q.ORDER_PRACTICE_IDS, 'order'], [Q.PROP_PRACTICE, Q.propPractice, Q.PROP_PRACTICE_IDS, 'props']])
  for (let n = 0; n < list.length; n++) { const P_ = fn(n); for (const id of ids) { const r = checkQ(id, P_[id], name + n); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, F[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 6));
ok('Crew mistakes: the marked line really is the first wrong one', [...Q.MISTAKES, ...Q.ORDER_PRACTICE, ...Q.FINAL_SETS.map(s => s.error)].every(m => { const vals = m.lines.map(l => E.value(l)), ans = E.value(m.expr); return !vals[m.wrong].eq(ans) && vals.slice(0, m.wrong).every(v => v.eq(ans)) && !vals[vals.length - 1].eq(ans); }));
ok('Challenges: substitution equals the formula; exactly one prediction band is right, and it isn’t always the middle', Q.CHALLENGES.every(c => E.value(c.sub).eq(E.value(c.rhs, c.vars)) && Q.bandOptions(c).filter(o => o.right).length === 1) && new Set(Q.CHALLENGES.map(c => Q.bandOptions(c).find(o => o.right).id)).size > 1);
ok('Certification: ten questions in the PRD’s distribution (2 / 3 / 2 / 3), pass mark 8', Q.FINAL_IDS.length === 10 && Q.PASS_MARK === 8 && ['fa', 'fb', 'fc', 'fd'].map(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length).join() === '2,3,2,3');
ok('Certification rounds use new examples, never stage questions, and differ from each other', (() => { const stage = new Set(Object.values(Q.QUESTIONS).map(q => q.prompt)); const rounds = [1, 2, 3, 4].map(r => Q.finalQuestions(r)); return rounds.every(F => Q.FINAL_IDS.every(id => !stage.has(F[id].prompt))) && new Set(rounds.map(F => F['fb-sub'].prompt)).size === 4; })());
ok('Certification types include numeric entry, expression building, matching and identification', (() => { const F = Q.finalQuestions(1), t = new Set(Q.FINAL_IDS.map(id => F[id].type)); return ['number', 'expression', 'multi', 'choice'].every(x => t.has(x)); })());
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = q => { for (const o of q.options || []) if (!o.correct) codes.add(o.code); for (const t of q.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(q => q && q.type && add(q)); codes.delete('wrong'); return [...codes].every(c => Q.MISCONCEPTIONS[c]); })());
ok('The workbench has simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.simple.example && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));

// ---- 7. Progress ----
const prog = createProgress({ lesson: { id: 'dream-line-project', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: Q.QUESTIONS }, storage: 'memory' });
prog.attempt('cb-6', null, 'chose add', false, { code: 'add-before-multiply' }); prog.attempt('cb-6', null, 'steps', true, {});
ok('A board with one wrong click is done but not first-try', prog.done('cb-6') && prog.question('cb-6').firstTry === false && prog.question('cb-6').attempts === 2);
prog.attempt('bx-expr', 'v2', '6k', true, {});
ok('Practice answers are keyed by variant', prog.done('bx-expr', 'v2') && !prog.done('bx-expr', 'v3'));

// ---- 8. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'dream-line-project'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 1 lab, home Variables and Expressions in Foundations of Algebra', act && act.status === 'live' && act.home === 'alg1.variables-and-expressions' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Foundations of Algebra');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics and all twelve skills of the unit', ['variables-and-expressions', 'evaluating-expressions', 'order-of-operations', 'properties-of-real-numbers'].every(t => act.skills.some(s => s.startsWith('alg1.' + t + '.'))) && model.skills.filter(s => s.topic.unit.title === 'Foundations of Algebra' && s.topic.course.id === 'alg1').every(s => act.skills.includes(s.id)));
ok('Every tracked idea has questions', Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Every mission’s graded ids exist, with no id in two missions', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
