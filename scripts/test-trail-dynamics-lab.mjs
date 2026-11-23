#!/usr/bin/env node
// Tests for the Trail Dynamics Lab (learning-lab/trail-dynamics-lab/): the
// exact quadratic engine (roots, surds, complex roots, forms, completing
// the square), every PRD number, every validated set, every question in
// every practice variant and final round, and the curriculum mapping.
//   node scripts/test-trail-dynamics-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/trail-dynamics-lab/', import.meta.url);
const X = await import(new URL('logic/quadratic.js', base));
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

// ---- 1. The engine ----
ok('a = 0 is refused (not a quadratic)', throws(() => X.quad(0, 1, 1)));
ok('Display: −1/25 shows as −0.04, 16/5 as 3.2; −140/3 stays a fraction', X.show(new X.Frac(-1, 25)) === '−0.04' && X.show(new X.Frac(16, 5)) === '3.2' && X.show(new X.Frac(-140, 3)) === '−140/3');
const r = (a, b, c) => X.solve(X.quad(a, b, c));
ok('Rational roots: x² − 5x + 6 → 2 and 3', r(1, -5, 6).type === 'two' && r(1, -5, 6).text === '2 and 3');
ok('Surds simplify: x² − 20x + 50 → 10 ± 5√2; x² − 16x + 40 → 8 ± 2√6', r(1, -20, 50).text === '10 ± 5√2' && r(1, -16, 40).text === '8 ± 2√6');
ok('Repeated: x² − 20x + 100 → 10 (Δ = 0)', r(1, -20, 100).type === 'one' && r(1, -20, 100).text === '10');
ok('Complex: x² − 20x + 125 → 10 ± 5i; x² + 16 → ± 4i', r(1, -20, 125).text === '10 ± 5i' && r(1, 0, 16).text === '± 4i');
ok('Every root verifies by substitution (rational, surd, repeated) and complex roots by sum and product', [[1, -5, 6], [1, -20, 50], [1, -20, 100], [1, -20, 125], [3, 50, -4200], [-0.04, 0.8, -2], [2, 3, 5], [1, 0, 16]].every(([a, b, c]) => { const q = X.quad(a, b, c); return X.verify(q, X.solve(q)); }));
ok('Random quadratics: approximate roots satisfy the equation', (() => { for (let i = 1; i < 60; i++) { const q = X.quad(((i % 7) - 3) || 1, (i % 11) - 5, (i % 13) - 6), S = X.solve(q); if (S.type !== 'complex' && !S.approx.every(x => Math.abs(q.value(x)) < 1e-7)) return false; if (!X.verify(q, S)) return false; } return true; })());
const Jq = M.J();
ok('Three forms of the jump agree everywhere (standard, vertex, factored)', [0, 3.3, 10, 17, 20].every(x => near(Jq.value(x), -0.04 * (x - 10) ** 2 + 4) && near(Jq.value(x), -0.04 * x * (x - 20))));
ok('Form text: −0.04x² + 0.8x, −0.04(x − 10)² + 4, −0.04x(x − 20)', X.standardText(Jq, 'J') === 'J(x) = −0.04x² + 0.8x' && X.vertexText(Jq, 'J') === 'J(x) = −0.04(x − 10)² + 4' && X.factoredText(Jq, 'J') === 'J(x) = −0.04x(x − 20)');
ok('No factored form when roots are irrational', X.factoredText(X.quad(1, -20, 50)) === null && !X.factorsOverIntegers(X.quad(1, -20, 50)) && X.factorsOverIntegers(X.quad(1, -12, 32)));
const C = X.completeSquare(Jq);
ok('Completing the square: −0.04(x² − 20x), half −10, square 100, vertex (10, 4)', C.factorOut.eq(new X.Frac(-1, 25)) && C.inner.eq(-20) && C.half.eq(-10) && C.square.eq(100) && C.vertex[0].eq(10) && C.vertex[1].eq(4));
ok('Complex arithmetic: (2 + 3i)(1 − i) = 5 + i; (3 + 2i) + (1 − 5i) = 4 − 3i; i⁷ = −i; (10 + 5i)(10 − 5i) = 125', X.ctext(X.cmul(X.cx(2, 3), X.cx(1, -1))) === '5 + i' && X.ctext(X.cadd(X.cx(3, 2), X.cx(1, -5))) === '4 − 3i' && X.ipow(7) === '−i' && X.ctext(X.cmul(X.cx(10, 5), X.cx(10, -5))) === '125');

// ---- 2. The PRD's numbers ----
ok('R(v) = (0.9 ÷ 3.6)v = 0.25v exactly', M.reactionRate().eq(new X.Frac(1, 4)));
ok('PRD table: A 0/9/16.5/26, B 0/11/21/34', M.TABLE_SPEEDS.map(v => M.D(0.01, v)).join() === '0,9,16.5,26' && M.TABLE_SPEEDS.map(v => near(M.D(0.015, v), [0, 11, 21, 34][M.TABLE_SPEEDS.indexOf(v)])).every(Boolean));
ok('B(2v) = 4B(v) for every speed', [5, 13, 20].every(v => near(M.Bk(0.01, 2 * v), 4 * M.Bk(0.01, v))));
ok('16.5 m under A → v² + 25v − 1650 = (v + 55)(v − 30): v = 30, −55 rejected', JSON.stringify(M.speedFor('A', 16.5).valid) === '[30]' && JSON.stringify(M.speedFor('A', 16.5).rejected) === '[-55]');
ok('21 m under B → 3v² + 50v − 4200 = 0, Δ = 52900, v = 30 (other ≈ −46.67)', String(X.quad(3, 50, -4200).disc) === '52900' && near(M.speedFor('B', 21).valid[0], 30) && near(M.speedFor('B', 21).rejected[0], -140 / 3));
ok('Jump: vertex (10, 4), zeros 0 and 20, range [0, 4]', Jq.h.eq(10) && Jq.k.eq(4) && X.solve(Jq).text === '0 and 20');
ok('Heights: 3 m → 5, 15; 2 m → 10 ± 5√2 ≈ 2.93, 17.07; 4 m → Δ 0, x = 10; 5 m → Δ −100, 10 ± 5i', (() => { const h = y => X.solve(X.atHeight(Jq, y)); return h(3).text === '5 and 15' && h(2).text === '10 ± 5√2' && h(2).approx.map(v => v.toFixed(2)).join() === '2.93,17.07' && String(X.atHeight(Jq, 4).disc) === '0' && h(4).text === '10' && String(X.atHeight(Jq, 5).disc) === '−100' && h(5).text === '10 ± 5i'; })());
ok('Height equations scale exactly to the PRD’s: x² − 20x + 50, + 100, + 125', ['2', '4', '5'].every((y, i) => X.standardText(X.atHeight(Jq, +y), 'E') === ['E(x) = x² − 20x + 50', 'E(x) = x² − 20x + 100', 'E(x) = x² − 20x + 125'][i]));
ok('Landing ramp y = −0.5x + 10 meets the jump at x = 12.5 and 20', M.rampMeet().text === '12.5 and 20');
const F1 = Q.finalSet(1);
ok('Final A: 21 m → v² + 25v − 2100 = (v + 60)(v − 35), v = 35', JSON.stringify(F1.sp.valid) === '[35]' && F1.mono.b === 25 && F1.mono.c === -2100);
ok('Final B: −0.05x² + 0.8x → vertex (8, 3.2), zeros 0 and 16, forms as in the PRD', F1.Jq.h.eq(8) && F1.Jq.k.eq(new X.Frac(16, 5)) && F1.Js.text === '0 and 16' && X.vertexText(F1.Jq, 'J') === 'J(x) = −0.05(x − 8)² + 3.2' && X.factoredText(F1.Jq, 'J') === 'J(x) = −0.05x(x − 16)');
ok('Final C: 2 m → x² − 16x + 40 = 0, 8 ± 2√6 ≈ 3.10, 12.90', X.standardText(F1.H, 'E') === 'E(x) = x² − 16x + 40' && F1.Hs.text === '8 ± 2√6' && F1.Hs.approx.map(v => v.toFixed(2)).join() === '3.10,12.90');

// ---- 3. Validated sets ----
for (const p of M.BRAKE_PRACTICE) { const s = M.speedFor(p.model, p.d); ok(`Brake practice ${p.model} ${p.d} m: one whole-number speed in 0–40, one negative root`, s.valid.length === 1 && Number.isInteger(s.valid[0]) && s.valid[0] > 0 && s.valid[0] <= 40 && s.rejected.length === 1); }
ok('Practice distances never repeat a final round’s', M.BRAKE_PRACTICE.every(p => !M.FINAL_SETS.some(f => f.brake.model === p.model && f.brake.d === p.d)));
ok('Factoring practice has both kinds (factors / doesn’t)', M.FACTOR_PRACTICE.some(f => X.factorsOverIntegers(X.quad(f.a, f.b, f.c))) && M.FACTOR_PRACTICE.some(f => !X.factorsOverIntegers(X.quad(f.a, f.b, f.c))));
for (const [i] of M.FINAL_SETS.entries()) {
  const F = Q.finalSet(i + 1);
  ok(`Final round ${i + 1}: whole-number speed in range; jump opens down with zeros at 0; height below the peak gives two irrational roots`, F.sp.valid.length === 1 && Number.isInteger(F.sp.valid[0]) && F.sp.valid[0] <= 40 && F.Jq.a.n < 0 && F.Js.approx[0] === 0 && Number(F.Jq.k) > F.height && F.Hs.type === 'two' && !F.Hs.rational);
}

// ---- 4. Every question ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
for (let n = 0; n < M.BRAKE_PRACTICE.length; n++) { const P = Q.brakePractice(n); for (const id of Q.BRAKE_PRACTICE_IDS) all.push([id, P[id], 'b' + n]); }
for (let n = 0; n < M.FACTOR_PRACTICE.length; n++) { const P = Q.factorPractice(n); for (const id of Q.FACTOR_PRACTICE_IDS) all.push([id, P[id], 'f' + n]); }
for (let r = 1; r <= 6; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [];
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution, three hints');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice') {
    if (q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
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
// Wrong form options must really be wrong: check every “form” option against the true function.
const formOk = (() => { for (let r = 1; r <= 5; r++) { const F = Q.finalQuestions(r), Jr = F.set.Jq; for (const id of ['fb-vform', 'fb-fform']) for (const o of F[id].options) {
  const m = o.text.match(/J\(x\) = (.+)$/); if (!m) return false;
  const expr = m[1].replace(/−/g, '-').replace(/(\d)\(/g, '$1*(').replace(/\)\(/g, ')*(').replace(/(\d)x/g, '$1*x').replace(/\)x/g, ')*x').replace(/x\(/g, 'x*(').replace(/²/g, '**2');
  const fn = new Function('x', 'return ' + expr);
  const same = [1, 3, 7].every(x => Math.abs(fn(x) - Jr.value(x)) < 1e-9);
  if (same !== o.correct) return false; } } return true; })();
ok('In the form questions, exactly the correct option equals the function (others are genuinely different)', formOk);
ok('Factoring options: the right one expands correctly, wrong ones don’t', (() => { for (let n = 0; n < M.FACTOR_PRACTICE.length; n++) { const f = M.FACTOR_PRACTICE[n], P = Q.factorPractice(n); for (const o of P['jf-factor'].options) { if (/doesn’t factor/.test(o.text)) { if (o.correct === X.factorsOverIntegers(X.quad(f.a, f.b, f.c))) return false; continue; }
  const ps = [...o.text.matchAll(/\(x ([+−]) (\d+)\)(²)?/g)].flatMap(m => (m[3] ? [m, m] : [m])).map(m => (m[1] === '−' ? +m[2] : -m[2]));
  const right = ps.length === 2 && ps[0] + ps[1] === -f.b && ps[0] * ps[1] === f.c; if (right !== o.correct) return false; } } return true; })());
const pos = Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').map(q => q.options.findIndex(o => o.correct));
ok('The correct option isn’t always in the same place', new Set(pos).size >= 3 && pos.filter(i => i === 0).length <= pos.length / 2, pos);
const QQ = Q.QUESTIONS;
ok('Mission answers: R(30) 7.5, D_B(30) 21, B(40)/B(20) = 4, factors 55/30, x for 3 m = 5, 15, square 100, k 4, Δ 200, roots 2.93/17.07', near(QQ['b-reaction'].answer, 7.5) && near(QQ['b-total'].answer, 21) && QQ['b-ratio'].answer === 4 && QQ['b-factor'].fields.map(f => f.answer).join() === '55,30' && QQ['l-sqrt'].fields.map(f => f.answer).join() === '5,15' && QQ['l-cts-square'].answer === 100 && QQ['l-cts-k'].answer === 4 && QQ['l-qf-disc'].answer === 200 && QQ['l-qf-roots'].fields.map(f => f.answer.toFixed(2)).join() === '2.93,17.07');
ok('Traps catch: forgetting ÷3.6 (27), averaging-free k misuse, forgetting 2a, sign of b', V.checkNumber(QQ['b-reaction'], '27').code === 'units' && V.checkFields(QQ['l-qf-roots'].fields, { x0: String(20 - Math.sqrt(200)), x1: '17.07' }).fields[0].code === 'forgot-2a' && V.checkFields(QQ['l-qf-abc'].fields, { a: '1', b: '20', c: '50' }).fields[1].code === 'neg-parens');

// ---- 5. Progress ----
const prog = createProgress({ lesson: { id: 'trail-dynamics-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QQ }, storage: 'memory' });
prog.attempt('b-p-v', 'v0', '40', true, {}); prog.attempt('jf-factor', 'v2', 'a', true, {});
ok('Practice answers keyed by variant', prog.done('b-p-v', 'v0') && !prog.done('b-p-v', 'v1') && prog.done('jf-factor', 'v2'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'trail-dynamics-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('Live Algebra 2 lab, home Quadratic Graphs in the Quadratic Functions unit', act && act.status === 'live' && act.home === 'alg2.quadratic-graphs' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Quadratic Functions');
ok('Every question kind maps to real skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five topics of the unit', ['quadratic-graphs', 'vertex-form', 'completing-the-square', 'quadratic-formula', 'complex-solutions'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All fourteen tracked skills from the PRD have questions', Q.REPORT_IDEAS.length === 14 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark consistent (10 of 12)', Q.FINAL_IDS.every(id => kinds[id]) && Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10);

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
