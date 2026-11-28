#!/usr/bin/env node
// Tests for Project Evolve (learning-lab/project-evolve/): the PRD's section
// 27 tables, the kit's new exponent and scientific-notation engines
// (powers.js, scinot.js), the misconception list (section 28), every question
// in every practice set and certification round, and the curriculum mapping.
//   node scripts/test-project-evolve.mjs   (add -v to list every check)

const base = new URL('../learning-lab/project-evolve/', import.meta.url);
const K = await import(new URL('logic/product.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const W = await import(new URL('../learning-lab/lesson-kit/powers.js', import.meta.url));
const SN = await import(new URL('../learning-lab/lesson-kit/scinot.js', import.meta.url));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { Frac } = await import(new URL('../learning-lab/lesson-kit/frac.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const mt = s => W.monoText(W.mono(s));
const sci = s => SN.sciText(SN.toValue(s));
const n = x => Number(x);

// ---- 1. Exponent rules (PRD 27) ----
const RULES = [['x^2*x^3', 'x⁵'], ['x^6/x^2', 'x⁴'], ['(x^2)^3', 'x⁶'], ['(2x)^3', '8x³'], ['(3a)^2', '9a²'], ['7^0', '1'], ['5^(-2)', '1/25'], ['10^(-3)', '1/1000'], ['(x^(-2))^3', '1/x⁶']];
ok('Every PRD exponent example simplifies as expected', RULES.every(([a, b]) => mt(a) === b), RULES.map(([a]) => mt(a)));
ok('10⁻³ = 0.001 and 5⁻² = 1/25 = 0.04 exactly', W.mono('10^(-3)').k.eq(Frac.parse('0.001')) && n(W.mono('5^(-2)').k) === 0.04);
ok('Superscripts are read as exponents (x⁵, 10⁻³, x¹²)', mt('x⁵') === 'x⁵' && W.mono('10⁻³').k.eq(Frac.parse('0.001')) && mt('x¹²') === 'x¹²');
ok('Superscripts read exactly like ^ (2² is 2^2 with no extra grouping, so the Unit 1 order-of-operations board is unchanged)', E.parse('2²').b.t === 'num' && E.parse('10⁻³').b.t === 'num' && E.toText(E.parse('3(18 + 2²) + 12')) === E.toText(E.parse('3(18 + 2^2) + 12')));
ok('Exponents apply to the right base: 3x² is not (3x)², and −x² is not (−x)²', mt('3x^2') === '3x²' && mt('(3x)^2') === '9x²' && mt('-x^2') === '−x²' && mt('(-x)^2') === 'x²');
ok('Product and quotient rules keep different bases apart: x² × y³ stays x²y³', mt('x^2*y^3') === 'x²y³' && mt('x^5/y^2') === 'x⁵/y²');
const throws = (s, re) => { try { W.mono(s); return false; } catch (e) { return re.test(e.message); } };
ok('0⁰ is refused (not 1); 0 to a negative power and dividing by zero are refused', throws('0^0', /0⁰ isn’t defined/) && throws('0^(-2)', /divide by zero/) && throws('x/0', /zero/));
ok('A nonzero base to the zero power is 1, including (3a)⁰', mt('5^0') === '1' && mt('(3a)^0') === '1' && mt('3x^0') === '3');

// ---- 2. The monomial checker ----
const cm = (answer, raw, o = {}) => W.checkMonomial({ answer, ...o }, raw);
ok('Equal but unsimplified answers are sent back, not marked wrong (x³x², (2x)³, x⁻⁶ when positive)', cm('x^5', 'x^3x^2').code === 'unreadable' && cm('8x^3', '(2x)^3').code === 'unreadable' && cm('1/x^6', 'x^-6', { positive: true }).code === 'unreadable');
ok('Simplified forms are accepted, typed or with superscripts', cm('x^5', 'x^5').correct && cm('x^5', 'x⁵').correct && cm('8x^3', '8x³').correct && cm('1/x^6', '1/x^6', { positive: true }).correct);
ok('The coefficient-right / exponent-right diagnoses', cm('8x^3', '2x^3').code === 'coefficient' && cm('x^5', 'x^4').code === 'exponent');

// ---- 3. Scientific notation (PRD 27) ----
ok('20,160,000 = 2.016 × 10⁷; 0.0000045 = 4.5 × 10⁻⁶; 0.00000072 = 7.2 × 10⁻⁷', sci('20160000') === '2.016 × 10⁷' && sci('0.0000045') === '4.5 × 10⁻⁶' && sci('0.00000072') === '7.2 × 10⁻⁷');
ok('(3.0 × 10⁵)(2.0 × 10³) = 6.0 × 10⁸', SN.sciText(SN.toValue('3e5').mul(SN.toValue('2e3'))) === '6 × 10⁸');
ok('(2.016 × 10⁷)/(4.0 × 10²) = 5.04 × 10⁴ = 50,400', SN.sciText(SN.toValue('2.016e7').div(SN.toValue('4e2'))) === '5.04 × 10⁴' && SN.plainText(SN.toValue('2.016e7').div(400)) === '50,400');
ok('2 × (2.016 × 10⁷) = 4.032 × 10⁷', SN.sciText(SN.toValue('2.016e7').mul(2)) === '4.032 × 10⁷');
ok('The test dataset: 200 × 28 × 60 × 60 = 20,160,000', K.readings() === 20160000);
ok('Normalized means 1 ≤ |a| < 10 (exactly 10 is not normalized)', SN.isNormal(Frac.parse('1')) && SN.isNormal(Frac.parse('9.99')) && !SN.isNormal(Frac.parse('10')) && !SN.isNormal(Frac.parse('0.504')));
ok('Both directions read: 2.016 × 10⁷, 2.016x10^7, 2.016e7, 20,160,000 all equal', ['2.016 × 10⁷', '2.016x10^7', '2.016e7', '20,160,000'].every(t => SN.parseSci(t).value.eq(SN.toValue('20160000'))));
ok('Tiny decimals stay exact (the kit’s fractions)', Frac.parse('0.00000072').eq(new Frac(72, 100000000)) && String(Frac.of(7.2e-7)) === '9/12500000');

// ---- 4. Growth and decay (PRD 27) ----
ok('N(t) = 500(1.20)ᵗ: 500, 600, 720, 864, 1036.8', [500, 600, 720, 864, 1036.8].every((v, t) => n(K.N(t)) === v));
ok('L(4) = 900 and N(4) = 1036.8: equal-amount vs equal-percentage growth', n(K.L(4)) === 900 && n(K.N(4)) === 1036.8 && n(K.L(2)) - n(K.L(1)) === n(K.L(1)) - n(K.L(0)) && n(K.N(2)) / n(K.N(1)) === n(K.N(1)) / n(K.N(0)));
ok('V(t) = 6000(0.80)ᵗ: $6,000, $4,800, $3,840, $3,072, $2,457.60, $1,966.08', [6000, 4800, 3840, 3072, 2457.6, 1966.08].every((v, t) => n(K.V(t)) === v) && K.money(K.V(4)) === '$2,457.60');
const C = K.firstPast(K.V, 2500, -1);
ok('$2,500: year 3 is above, year 4 below, crossed between years 3 and 4 (found by checking the table)', C.t === 4 && n(C.before) === 3072 && n(C.at) === 2457.6);
ok('Rates and factors are kept apart: 20% growth × 1.20, 20% decay × 0.80', String(K.factorOf(20, 1)) === '6/5' && String(K.factorOf(20, -1)) === '4/5');
ok('Display rounds people, never the model: N(4) shows about 1,037', K.people(K.N(4)) === '1,037' && n(K.N(4)) === 1036.8);
ok('Different rates cross $3,000 in years 7, 5, 4 and 3 (10%, 15%, 20%, 25%)', [[10, 7], [15, 5], [20, 4], [25, 3]].every(([p, y]) => K.firstPast(t => K.model(6000, p, t, -1), 3000, -1).t === y));

// ---- 5. Misconceptions (section 28) ----
const q = id => Q.QUESTIONS[id], mc = (id, raw) => W.checkMonomial(q(id), raw).code, nc = (id, raw) => V.checkNumber(q(id), String(raw)).code, sc = (id, raw) => SN.checkSci(q(id), raw).code, ec = (id, raw) => E.checkExpression(q(id), raw).code, has = (id, c) => q(id).options.some(o => !o.correct && o.code === c);
ok('Exponent rules: different bases; multiplying in the product rule; powers across brackets', has('pp-diff', 'different-bases') && mc('pp-1', 'x^6') === 'multiply-exponents' && mc('ppr-1', '2x^3') === 'outside-only');
ok('Exponent rules: negative exponents as negative values; 0⁰ as 1; denominator restrictions', mc('n-1', '-x^2') === 'negative-value' && nc('n-3', -100) === 'negative-value' && has('z-00', 'zero-zero') && has('n-den', 'denominator-zero'));
ok('Scientific notation: wrong direction / exponent sign; not normalized; exponent arithmetic', sc('tl-small-1', '4.5 × 10^6') === 'exp-sign' && sc('tl-sci', '20.16 × 10^6') === 'not-normalized' && sc('mu-ans', '6 × 10^15') === 'exp-arith');
ok('Scientific notation: comparing only coefficients; losing units', has('tl-larger', 'coef-only') && has('cmp-units', 'lost-units'));
ok('Growth: adding the percent as a fixed amount; initial value vs factor; 0.20 instead of 1.20; linear vs exponential', ec('gw-model', '500 + 0.2t') === 'add-percent' && ec('gw-model', '1.2(500)^t') === 'initial-factor-swap' && nc('gw-factor', 0.2) === 'rate-as-factor' && ec('gw-model', '500 + 100t') === 'linear-exponential');
ok('Decay: subtracting a constant; rate vs retention factor; wrong multiplier; guaranteed value; exact crossing', ec('dk-model', '6000 - 1200t') === 'subtract-constant' && nc('dk-factor', 0.2) === 'rate-retention-swap' && nc('dk-factor', 1.2) === 'decay-multiplier' && has('lim-2', 'guaranteed-value') && has('tg-exact', 'exact-crossing'));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); codes.delete('wrong'); const miss = [...codes].filter(c => !Q.MISCONCEPTIONS[c]); return miss.length === 0 || (console.log(miss), false); })());

// ---- 6. Every question ----
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.hints.every(Boolean) || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'fields') { if (!V.checkFields(x.fields, Object.fromEntries(x.fields.map(f => [f.id, String(f.answer)]))).correct) bad.push('own answer'); if (x.fields.some(f => (f.traps || []).some(t => V.checkNumber(f, String(t.value)).correct))) bad.push('trap = answer'); }
  if (x.type === 'expression') { if (!E.checkExpression(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => E.checkExpression(x, t.expr).correct)) bad.push('trap = answer'); }
  if (x.type === 'monomial') { if (!W.checkMonomial(x, x.answer).correct) bad.push('own answer'); if ((x.traps || []).some(t => W.checkMonomial(x, t.expr).correct)) bad.push('trap = answer'); }
  if (x.type === 'sci') { const a = SN.parseSci(String(x.answer)), ans = x.form === 'standard' ? SN.plainText(a.value) : SN.sciText(a.value); if (!SN.checkSci(x, ans).correct) bad.push('own answer: ' + ans); if ((x.traps || []).some(t => SN.toValue(t.value).eq(a.value))) bad.push('trap = answer'); }
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.type === 'multi' && !x.options.some(o => o.correct)) bad.push('none right');
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.RULE_PRACTICE, Q.rulePractice, Q.RULE_PRACTICE_IDS, 'rules'], [Q.SCI_PRACTICE, Q.sciPractice, Q.SCI_PRACTICE_IDS, 'sci'], [Q.GROWTH_PRACTICE, Q.growthPractice, Q.GROWTH_PRACTICE_IDS, 'growth'], [Q.DECAY_PRACTICE, Q.decayPractice, Q.DECAY_PRACTICE_IDS, 'decay']])
  for (let i = 0; i < list.length; i++) { const S_ = fn(i); for (const id of ids) { const r = checkQ(id, S_[id], name + i); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const X = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, X[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and certification question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 8));
ok('Certification: 12 questions (3 per topic), pass mark 10, four rounds with different values', Q.FINAL_IDS.length === 12 && Q.PASS_MARK === 10 && Q.FINAL_SETS.length === 4 && JSON.stringify(['fa', 'fb', 'fc', 'fd'].map(p => Q.FINAL_IDS.filter(i => i.startsWith(p)).length)) === '[3,3,3,3]'
  && new Set([1, 2, 3, 4].map(r => Q.finalQuestions(r)['fb-convert'].answer)).size === 4);
ok('Certification tables are classified by the numbers themselves (both linear and exponential appear)', (s => s.has(true) && s.has(false))(new Set([1, 2, 3, 4].map(r => /^Exponential/.test(Q.finalQuestions(r)['fc-linexp'].options.find(o => o.correct).text)))));
ok('Certification target years come from the table', [1, 2, 3, 4].every(r => { const [a, p, t] = Q.FINAL_SETS[r - 1].decay, y = Q.finalQuestions(r)['fd-target'].answer; return n(K.model(a, p, y, -1)) < t && n(K.model(a, p, y - 1, -1)) >= t; }));
ok('Scientific-notation practice answers are exact', [0, 1, 2, 3, 4, 5].every(i => { const x = Q.sciPractice(i)['tlx-op']; return SN.checkSci(x, SN.sciText(SN.toValue(x.answer))).correct; }));
ok('No question uses logarithms', !JSON.stringify(Q.QUESTIONS).match(/\blog\b|logarithm/i));
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));
ok('Four phases, one per stage', K.PHASES.length === 4 && K.PHASES.every(p => Q.MISSIONS.some(m => m.id === p.id)));

// ---- 7. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'project-evolve'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id)), KI = Q.questionKinds();
ok('Activity registered at /learning-lab/project-evolve/', act && act.route === 'learning-lab/project-evolve/' && act.tracking.gameId === 'project-evolve' && act.home === 'alg1.exponent-rules');
ok('Every question kind maps to real skills', Object.keys(KI).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all four topics and every skill of the unit', (m => m.length === 12 && m.every(s => act.skills.includes(s.id)))(model.skills.filter(s => ['exponent-rules', 'scientific-notation', 'exponential-growth', 'exponential-decay'].includes(s.topic.slug) && s.topic.course.id === 'alg1')));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 4 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique, and never clash with practice or certification ids', (() => { const seen = new Set(); const stage = Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); const other = [...Q.RULE_PRACTICE_IDS, ...Q.SCI_PRACTICE_IDS, ...Q.GROWTH_PRACTICE_IDS, ...Q.DECAY_PRACTICE_IDS, ...Q.FINAL_IDS]; return stage && other.every(id => !seen.has(id)) && new Set(other).size === other.length; })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
