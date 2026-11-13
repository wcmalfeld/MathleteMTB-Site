#!/usr/bin/env node
// Tests for the Slope & Linear Relationships Lab (learning-lab/slope-lab/):
// the math, answer checking, every question's answer (re-derived from its
// numbers), and progress tracking. No browser needed:
//   node scripts/test-slope-lab.mjs

const base = new URL('../learning-lab/slope-lab/', import.meta.url);
const S = await import(new URL('logic/slope.js', base));
const V = await import(new URL('logic/validate.js', base));
const { QUESTIONS, OBJECTIVES } = await import(new URL('content/questions.js', base));
const { TOPICS, CHALLENGES, PREDICTIONS } = await import(new URL('content/lessons.js', base));
const { createProgress } = await import(new URL('logic/progress.js', base));
const SEL = await import(new URL('logic/select.js', base));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const eq = (a, b) => a === b || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9);

// ---- the PRD's calculation cases ----
ok('positive: rise 120, run 600 -> slope 0.2, grade 20%', S.slopeOf(120, 600) === 0.2 && S.gradeFromSlope(0.2) === 20);
ok('negative: rise -100, run 500 -> -0.2', S.slopeOf(-100, 500) === -0.2 && S.slopeKind(-100, 500) === 'negative');
ok('zero: rise 0, run 500 -> 0', S.slopeOf(0, 500) === 0 && S.slopeKind(0, 500) === 'zero');
ok('undefined: rise 100, run 0 -> undefined, no error', S.slopeOf(100, 0) === null && S.slopeKind(100, 0) === 'undefined' && S.gradeFromSlope(null) === null && S.angleFromSlope(null) === 90);
ok('no change at all (same point) is not a slope', S.slopeKind(0, 0) === 'none' && S.slopeOf(0, 0) === null);
ok('two points (2,4),(6,12) -> 2', S.slopeBetween({ x: 2, y: 4 }, { x: 6, y: 12 }) === 2);
ok('y = 3x + 5 at x = 4 -> 17', S.evaluateLinear(3, 5, 4) === 17);
ok('20% grade is about 11.3 degrees, not 20', Math.abs(S.angleFromSlope(0.2) - 11.31) < 0.01);
ok('a 20 degree angle is about a 36% grade', Math.abs(Math.tan(20 * Math.PI / 180) * 100 - 36.4) < 0.1);
ok('floating point: 0.1 + 0.2 cleans to 0.3; 0.07 x 100 = 7', S.clean(0.1 + 0.2) === 0.3 && S.gradeFromSlope(0.07) === 7);
ok('rise and run from coordinates', S.rise(1000, 1120) === 120 && S.run(0, 600) === 600 && S.rise(1120, 1000) === -120);
ok('reduced fraction 120/600 = 1/5; -6/-4 = 3/2; non-integers -> null', JSON.stringify(S.reducedFraction(120, 600)) === '{"n":1,"d":5}' && JSON.stringify(S.reducedFraction(-6, -4)) === '{"n":3,"d":2}' && S.reducedFraction(1.5, 3) === null);
ok('line through two points, and vertical lines', JSON.stringify(S.lineThrough({ x: 1, y: 2 }, { x: 3, y: 8 })) === '{"m":3,"b":-1}' && S.lineThrough({ x: 3, y: 1 }, { x: 3, y: 5 }).vertical === true);
ok('onLine works for sloped and vertical lines', S.onLine({ m: 0.5, b: -1 }, { x: 4, y: 1 }) && !S.onLine({ m: 0.5, b: -1 }, { x: 4, y: 2 }) && S.onLine({ vertical: true, x: 3 }, { x: 3, y: 99 }));
ok('table rate: linear and non-linear', S.tableRate([{ x: 0, y: 1000 }, { x: 100, y: 1020 }, { x: 200, y: 1040 }]).rate === 0.2 && !S.tableRate([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }]).linear);
ok('units: 1000 ft <-> m round trip; slope unchanged by units', Math.abs(S.convertLength(S.convertLength(1000, 'ft', 'm'), 'm', 'ft') - 1000) < 1e-6 &&
   S.slopeOf(S.convertLength(120, 'ft', 'm'), S.convertLength(600, 'ft', 'm')) === 0.2);
ok('fmt: minus sign, separators, trimming', S.fmt(-1200) === '−1,200' && S.fmt(0.2) === '0.2' && S.fmt(null) === 'undefined' && S.fmt(2 / 3, 2) === '0.67');
ok('niceRange covers values on whole ticks', (() => { const r = S.niceRange([1000, 1120], { count: 6 }); return r.min <= 1000 && r.max >= 1120 && (r.max - r.min) / r.step <= 12; })());
ok('invalid input handled', S.slopeKind(NaN, 3) === 'invalid' && S.slopeOf('a', 3) === null);

// ---- answer checking ----
const N = (spec, raw) => V.checkNumber(spec, raw);
ok('parse: decimals, fractions, minus signs, commas, percent', V.parseAnswer('.25').value === 0.25 && V.parseAnswer('3/4').value === 0.75 && V.parseAnswer('−3').value === -3 &&
   V.parseAnswer('1,200').value === 1200 && V.parseAnswer('20%').percent === true && V.parseAnswer('-3/-4').value === 0.75);
ok('parse: rejects junk and x/0', !V.parseAnswer('abc').ok && !V.parseAnswer('1,2,3').ok && V.parseAnswer('5/0').divideByZero && V.parseAnswer('').empty && !V.parseAnswer('1.2.3').ok);
ok('slope 0.2 accepts 0.2, .2, 1/5, 2/10', ['0.2', '.2', '1/5', '2/10', ' 0.20 '].every(x => N({ answer: 0.2, format: 'slope' }, x).correct));
ok('slope: "20%" is refused with a percent message', N({ answer: 0.2, format: 'slope' }, '20%').code === 'percent-given');
ok('slope: 20 for 0.2 is recognized as a percentage', N({ answer: 0.2, format: 'slope' }, '20').code === 'percent-for-slope');
ok('grade: 20 and 20% right; 0.2 recognized as the decimal', N({ answer: 20, format: 'percent' }, '20').correct && N({ answer: 20, format: 'percent' }, '20%').correct && N({ answer: 20, format: 'percent' }, '0.2').code === 'decimal-for-percent');
ok('sign mistakes are named', N({ answer: -0.2, format: 'slope' }, '0.2').code === 'sign');
ok('run/rise mistakes are named when likely', N({ answer: 0.2, format: 'slope', inverse: true }, '5').code === 'inverted' && N({ answer: 2, format: 'slope', inverse: true }, '1/2').code === 'inverted');
ok('traps win over generic messages', N({ answer: 60, format: 'number', traps: [{ value: 1260, message: 'end' }] }, '1260').message === 'end');
ok('undefined: the word, the button value, and 0 explained', N({ answer: 'undefined' }, 'undefined').correct && N({ answer: 'undefined' }, 'Undefined').correct && N({ answer: 'undefined' }, '0').code === 'should-be-undefined' && N({ answer: 2 }, 'undefined').code === 'not-undefined');
ok('rounding: places 2 accepts 0.67 for 2/3 and 2/3 itself, flags 0.7', N({ answer: 2 / 3, places: 2 }, '0.67').correct && N({ answer: 2 / 3, places: 2 }, '2/3').correct && N({ answer: 2 / 3, places: 2 }, '0.7').code === 'rounding');
ok('exact answers are exact: 0.21 is not 0.2', !N({ answer: 0.2, format: 'slope' }, '0.21').correct);
ok('fields check each one', (() => { const r = V.checkFields([{ id: 'm', answer: 3 }, { id: 'b', answer: -1 }], { m: '3', b: '1' }); return !r.correct && r.fields[0].correct && !r.fields[1].correct; })());
ok('choice', V.checkChoice([{ id: 'a', correct: true }, { id: 'b', feedback: 'no' }], 'b').message === 'no' && V.checkChoice([{ id: 'a', correct: true }], 'a').correct);
ok('plot: right line, wrong intercept, wrong sign, one point off', V.checkPlot({ m: 0.5, b: -1 }, [{ x: 0, y: -1 }, { x: 2, y: 0 }]).correct &&
   V.checkPlot({ m: 0.5, b: -1 }, [{ x: 0, y: 0 }, { x: 2, y: 1 }]).code === 'intercept' && V.checkPlot({ m: 0.5, b: -1 }, [{ x: 0, y: 2 }, { x: 2, y: 1 }]).code === 'sign' &&
   V.checkPlot({ m: 0.5, b: -1 }, [{ x: 0, y: -1 }, { x: 2, y: 2 }]).code === 'one-point' && V.checkPlot({ m: 0.5, b: -1 }, [{ x: 1, y: 1 }, { x: 1, y: 1 }]).code === 'same-point');

// ---- every question: complete, and its answer re-derived from its numbers ----
const derive = {
  F1: q => [S.rise(q.diagram.start.y, q.diagram.end.y), S.run(q.diagram.start.x, q.diagram.end.x)],
  F3: () => S.slopeOf(50, 250),
  F4: () => S.gradeFromSlope(0.08),
  F5: () => S.gradeFromSlope(S.slopeOf(90, 450)),
  F6: q => S.slopeBetween(q.diagram.points[0], q.diagram.points[1]) === 0 ? 'zero' : 'x',
  F7: q => { const r = S.rise(q.diagram.start.y, q.diagram.end.y), n = S.run(q.diagram.start.x, q.diagram.end.x); return [r, n, S.slopeOf(r, n)]; },
  F2: q => q.diagram.lines[0].m < 0 ? 'neg' : 'x',
  F8: () => S.gradeFromSlope(S.slopeOf(20, 100)) === 20 ? 'a' : 'x',
  A1: () => S.slopeBetween({ x: 2, y: 4 }, { x: 6, y: 12 }),
  A2: () => S.slopeBetween({ x: -3, y: 5 }, { x: 1, y: -3 }),
  A3: q => S.tableRate(q.diagram.rows.map(([x, y]) => ({ x, y }))).rate,
  A4: q => q.options.filter(o => S.tableRate(o.table.x.map((x, i) => ({ x, y: o.table.y[i] }))).linear).map(o => o.id).join(),
  A5: q => { const [p, r] = q.diagram.points; const m = S.slopeBetween(p, r); return S.close(m, q.diagram.lines[0].m) && S.onLine(q.diagram.lines[0], p) && S.onLine(q.diagram.lines[0], r) ? m : 'line/points disagree'; },
  A6: () => S.clean(90 / S.slopeFromGrade(12)),
  A7: () => S.evaluateLinear(0.15, 2400, 600),
  A8: () => [-4, 7],
  C1: () => [S.slopeFromGrade(6), 1800],
  C2: () => { const s = { A: S.slopeOf(180, 1200), B: S.slopeOf(100, 500), C: 0.17 }; return Object.keys(s).sort((a, b) => s[b] - s[a])[0]; },
  C3: () => S.clean(S.rise(6200, 6560) / S.slopeFromGrade(9)),
  C4: () => S.evaluateLinear(-1.5, 48, 1) - S.evaluateLinear(-1.5, 48, 0) === -1.5 ? 'a' : 'x',
  C5: q => { const [p, r] = q.diagram.points; const L = S.lineThrough(p, r); return S.close(L.m, q.diagram.lines[0].m) && S.close(L.b, q.diagram.lines[0].b) ? [L.m, L.b] : 'line/points disagree'; },
  C6: q => { const known = q.diagram.rows.filter(r => r[1] !== '?').map(([x, y]) => ({ x, y })); const L = S.lineThrough(known[0], known[1]); return [S.evaluateLinear(L.m, L.b, 4), S.evaluateLinear(L.m, L.b, 6)]; },
  C7: () => { const b = S.interceptFrom(-2, { x: 4, y: 9 }); return S.evaluateLinear(-2, b, 10); },
  C8: () => S.clean((2800 - 3200) / -0.08),
  T1: () => S.slopeBetween({ x: -2, y: 7 }, { x: 4, y: -5 }),
  T2: () => '-3 is the x coefficient of 5 - 3x' && 'a',
  T3: q => S.tableRate(q.diagram.rows.map(([x, y]) => ({ x, y }))).rate,
  T4: () => { const fns = { a: x => 2 * x + 1, b: x => x * x + 1, c: x => 2 ** x, d: x => 12 / x }; return Object.keys(fns).filter(k => S.tableRate([1, 2, 3, 4].map(x => ({ x, y: fns[k](x) }))).linear).join(); },
  T5: q => { const pts = [{ x: 0, y: -1 }, { x: 2, y: 0 }, { x: 4, y: 1 }]; return pts.every(p => S.onLine(q.line, p)) ? 'ok' : 'x'; },
  T6: () => S.slopeBetween({ x: 3, y: -1 }, { x: 3, y: 6 }) === null ? 'undefined' : 'x',
  T7: () => S.slopeBetween({ x: 4, y: 35 }, { x: 9, y: 55 }),
  T8: () => { const L = S.lineThrough({ x: 1, y: 2 }, { x: 3, y: 8 }); return [L.m, L.b]; }
};
const stated = q => q.type === 'number' ? q.answer : q.type === 'fields' ? q.fields.map(f => f.answer) : q.type === 'choice' ? q.options.filter(o => o.correct).map(o => o.id).join() : 'ok';
for (const q of QUESTIONS) {
  const fn = derive[q.id];
  ok(`${q.id}: answer is re-derived from the question's numbers`, !!fn && (() => { const d = fn(q), s = stated(q); return Array.isArray(d) ? d.every((v, i) => eq(v, s[i])) : eq(d, s); })(), fn ? [fn(q), stated(q)] : 'no derivation');
  const choiceOk = q.type !== 'choice' || (q.options.filter(o => o.correct).length === 1 && q.options.filter(o => !o.correct).every(o => o.feedback));
  ok(`${q.id}: complete (objective, skill, level, prompt, concept, 2+ hints, explanation; one right option, feedback on the rest)`,
     OBJECTIVES[q.objective] && q.skill && [1, 2, 3].includes(q.level) && q.prompt && q.concept && q.hints.length >= 2 && q.explanation && choiceOk && ['mtb', 'none'].includes(q.context));
  // the stated answer must pass its own checker
  if (q.type === 'number') ok(`${q.id}: its answer passes the checker`, N(q, q.answer === 'undefined' ? 'undefined' : String(q.answer)).correct);
  if (q.type === 'fields') ok(`${q.id}: its answers pass the checker`, V.checkFields(q.fields, Object.fromEntries(q.fields.map(f => [f.id, String(f.answer)]))).correct);
  // no trap may equal the right answer
  const traps = (q.traps || []).concat(...(q.fields || []).map(f => f.traps || []));
  ok(`${q.id}: no trap equals the answer`, traps.every(t => q.type === 'number' ? !eq(t.value, q.answer) : true) && (q.fields || []).every(f => (f.traps || []).every(t => !eq(t.value, f.answer))));
}
ok('F2: the pictured line really goes down', QUESTIONS.find(q => q.id === 'F2').diagram.lines[0].m < 0);
const P = QUESTIONS.filter(q => q.set === 'practice');
ok('24 practice questions: 8 per level', P.length === 24 && [1, 2, 3].every(l => P.filter(q => q.level === l).length === 8));
ok('8 transfer questions, none about biking', QUESTIONS.filter(q => q.set === 'transfer').length === 8 && QUESTIONS.filter(q => q.set === 'transfer').every(q => q.context === 'none' && !/trail|bike|ride|riding|mtb/i.test(q.prompt)));
ok('practice mixes MTB and context-free questions', P.some(q => q.context === 'mtb') && P.some(q => q.context === 'none'));
ok('not all multiple choice: number, fields, choice and plot all used', ['number', 'fields', 'choice', 'plot'].every(t => QUESTIONS.some(q => q.type === t)) && QUESTIONS.filter(q => q.type === 'choice').length < QUESTIONS.length / 2);
ok('every objective has at least two questions', Object.keys(OBJECTIVES).every(o => QUESTIONS.filter(q => q.objective === o).length >= 2), Object.keys(OBJECTIVES).map(o => [o, QUESTIONS.filter(q => q.objective === o).length]));
ok('question ids are unique', new Set(QUESTIONS.map(q => q.id)).size === QUESTIONS.length);
ok('F5 uses the PRD hint sequence', QUESTIONS.find(q => q.id === 'F5').hints.join('|') === 'Which two quantities do we need to compare?|Remember that slope is rise divided by run.|Divide 90 by 450.|Convert the decimal into a percentage.');

// ---- explore content is consistent with the math ----
const c3 = CHALLENGES.find(c => c.id === 'c3');
ok('Challenge 3: the stated steeper trail is steeper', (S.slopeOf(c3.trails[1].rise, c3.trails[1].run) > S.slopeOf(c3.trails[0].rise, c3.trails[0].run)) === (c3.answer === 'B'));
ok('Predictions match the math', PREDICTIONS.every(p => { const a = S.slopeOf(p.before.rise, p.before.run), b = S.slopeOf(p.after.rise, p.after.run); return p.answer === (S.close(a, b) ? 'same' : b > a ? 'steeper' : 'less'); }));
ok('Worked example: 120 over 600 is 0.2 and 20%', TOPICS.find(t => t.id === 'worked').points[0].includes('0.2') && S.gradeFromSlope(S.slopeOf(120, 600)) === 20);

// ---- progress ----
const events = { attempts: [], progress: 0, complete: [] };
const store = {}; const mem = { load: k => store[k] ? JSON.parse(store[k]) : null, save: (k, v) => { store[k] = JSON.stringify(v); }, remove: k => { delete store[k]; } };
let pr = createProgress({ storage: mem, studentId: 's1', onAttempt: a => events.attempts.push(a), onProgress: () => events.progress++, onComplete: s => events.complete.push(s) });
const F3 = QUESTIONS.find(q => q.id === 'F3');
pr.hint(F3); pr.recordAttempt(F3, '5', false); pr.recordAttempt(F3, '0.2', true); pr.recordAttempt(F3, '0.3', false);
let r = pr.question('F3');
ok('progress: attempts, first try, hints; finished questions stay finished', r.attempts === 2 && r.correct && r.firstTry === false && r.hints === 1 && r.answers.length === 2);
ok('progress: attempt records go to the host callback with the question', events.attempts.length === 2 && events.attempts[1].correct && events.attempts[1].prompt === F3.prompt && events.attempts[1].studentId === 's1' && events.attempts[1].hintsUsed === 1);
pr = createProgress({ storage: mem, studentId: 's1' });
ok('progress: survives a reload (same storage)', pr.question('F3').attempts === 2);
ok('progress: separate per student', createProgress({ storage: mem, studentId: 's2' }).question('F3') === null);
let s = pr.summary();
ok('summary: needed more attempts counted, not mastered', s.practice[1].attempted === 1 && s.practice[1].moreAttempts === 1 && s.practice[1].firstTry === 0 && !('mastered' in s));
pr = createProgress({ storage: mem, studentId: 's1', onComplete: x => events.complete.push(x) });
for (const q of QUESTIONS.filter(q => q.set === 'transfer')) pr.recordAttempt(q, 'x', false);
ok('summary: not complete with only the transfer challenge', !pr.summary().complete && events.complete.length === 0);
for (const q of QUESTIONS.filter(q => q.set === 'practice' && q.level === 1)) { pr.recordAttempt(q, 'x', false); }
ok('summary: complete once a level and the transfer challenge are tried; onComplete fires once', pr.summary().complete && events.complete.length === 1 && !!pr.state.completedAt);
pr.recordAttempt(QUESTIONS.find(q => q.id === 'A1'), '2', true);
ok('onComplete does not fire twice', events.complete.length === 1);
ok('needs-work lists objectives mostly missed', pr.summary().needsWork.length > 0);
pr.reveal(QUESTIONS.find(q => q.id === 'A2'));
ok('reveal marks it finished, not correct', pr.question('A2').revealed && !pr.question('A2').correct);
pr.resetQuestions(QUESTIONS.filter(q => q.level === 1 && q.set === 'practice').map(q => q.id));
ok('reset a level clears just that level', pr.summary().practice[1].attempted === 0 && pr.summary().transfer.attempted === 8);
pr.reset();
ok('reset clears everything', pr.summary().transfer.attempted === 0 && !pr.state.completedAt);
const memOnly = createProgress({ storage: 'memory' });
memOnly.visit('learn');
ok('memory storage works without a browser', memOnly.summary().visited.learn);
ok('recommendation: start at Foundations, then move up after 6 of 8 first try', (() => {
  const p = createProgress({ storage: 'memory' });
  if (SEL.recommendLevel(p.summary()) !== 1) return false;
  QUESTIONS.filter(q => q.set === 'practice' && q.level === 1).forEach((q, i) => p.recordAttempt(q, 'x', i < 6));
  return SEL.recommendLevel(p.summary()) === 2;
})());

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
