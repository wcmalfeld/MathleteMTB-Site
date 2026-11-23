#!/usr/bin/env node
// Tests for the Race-Day Workshop (learning-lab/race-day-workshop/): the
// models (with the PRD's own worked numbers), every validated number set,
// every question's answer (re-derived here independently), traps, answer
// checking (including the kit's new "tick all that apply" type), progress,
// practice variants, final rounds, the pass mark and the curriculum mapping.
//   node scripts/test-race-day-workshop.mjs   (add -v to list every check)

const base = new URL('../learning-lab/race-day-workshop/', import.meta.url);
const M = await import(new URL('logic/models.js', base));
const Q = await import(new URL('logic/questions.js', base));
const kit = new URL('../learning-lab/lesson-kit/', import.meta.url);
const V = await import(new URL('validate.js', kit));
const { createProgress } = await import(new URL('progress.js', kit));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const whole = x => near(x, Math.round(x), 1e-9);

// ---- 1. The PRD's numbers ----
const w60 = M.sagWindow(60);
ok('Mission 1: 25% and 30% of 60 mm are 15 and 18 mm', near(w60.minMm, 15) && near(w60.maxMm, 18));
ok('Mission 1: 17 mm of 60 mm is 28.33%, inside', near(M.sagReading(17, 60).pct, 1700 / 60) && M.sagReading(17, 60).within);
ok('Mission 1: 80 mm stroke gives 20–24 mm', near(M.sagWindow(80).minMm, 20) && near(M.sagWindow(80).maxMm, 24));
ok('Mission 1: midpoint 27.5%, tolerance 2.5 points', w60.midPct === 27.5 && w60.tolPct === 2.5);
ok('Mission 1: |p − 27.5| ≤ 2.5 keeps 27 and drops 24 and 31', M.absWithin(27, 27.5, 2.5) && !M.absWithin(24, 27.5, 2.5) && !M.absWithin(31, 27.5, 2.5));
ok('Mission 1: |p − 27.5| = 2.5 has boundaries 25 and 30', M.absBounds(27.5, 2.5).join() === '25,30');
ok('Boundaries count: 25% and 30% are inside (≤)', M.sagReading(15, 60).within && M.sagReading(18, 60).within && !M.sagReading(18.1, 60).within && !M.sagReading(14.9, 60).within);
ok('Sag formula rearranges both ways', [10, 15.5, 22].every(s => near(M.sagMm(M.sagPercent(s, 73), 73), s)));
ok('Stroke must be positive', (() => { try { M.sagPercent(10, 0); return false; } catch (e) { return true; } })());
const S = M.raceStage(M.PRD.stage);
ok('Mission 2: 4 km at 16 km/h allows 0.25 h = 15 min', near(S.tTarget, 0.25) && near(M.minutes(S.tTarget), 15));
ok('Mission 2: 1 km at 12 km/h takes 5 min, leaving 1/6 h', near(M.minutes(S.t1), 5) && near(S.tLeft, 1 / 6));
ok('Mission 2: v = 18 km/h', near(S.vNeeded, 18));
const run18 = M.raceRun(M.PRD.stage, 18);
ok('Mission 2 check: 18 km/h → 10 + 5 = 15 min, average 16 km/h', near(M.minutes(run18.t2), 10) && near(M.minutes(run18.time), 15) && near(run18.avg, 16) && run18.meets);
ok('Mission 2 inequality: any v ≥ 18 meets the target, anything slower misses', [18, 18.5, 25, 40].every(v => M.raceRun(M.PRD.stage, v).meets) && [17.9, 12, 5].every(v => !M.raceRun(M.PRD.stage, v).meets));
ok('Averaging speeds is wrong: (12 + 20)/2 = 16 but 20 km/h gives 17.1 km/h', M.naiveSpeed(M.PRD.stage) === 20 && !near(M.raceRun(M.PRD.stage, 20).avg, 16, 0.01));
ok('Speed must be positive; an impossible target gives no speed', (() => { try { M.raceRun(M.PRD.stage, 0); return false; } catch (e) { return true; } })() && M.raceStage({ d1: 3, v1: 5, d2: 1, target: 20 }).vNeeded === null);
ok('Race clock reads m:ss', M.clock(0.25) === '15:00' && M.clock(1 / 12) === '5:00' && M.clock(3 / 17) === '10:35');
const Sv = M.survey(120, 125);
ok('Mission 3: √(120² + h²) = 125 → h² = 1225, h = ±35', near(Sv.h2, 1225) && near(Sv.rise, 35) && Sv.solutions.join() === '35,-35');
ok('Mission 3: both +35 and −35 check in the original equation', M.surveyCheck(120, 125, 35) && M.surveyCheck(120, 125, -35) && !M.surveyCheck(120, 125, 34));
ok('Survey: a straight line shorter than the horizontal has no real answer', !M.survey(100, 90).real && M.survey(100, 90).solutions.length === 0);
ok('Survey: equal distances mean flat ground (h = 0)', M.survey(80, 80).real && M.survey(80, 80).solutions.join() === '0');
ok('Debugger: √(q + 9) = q − 3 → candidates 0 and 7', M.radicalCandidates(9, 3).join() === '0,7');
ok('Debugger: q = 0 fails (√9 = 3 ≠ −3), q = 7 works (4 = 4)', !M.radicalTest(9, 3, 0).valid && M.radicalTest(9, 3, 0).left === 3 && M.radicalTest(9, 3, 0).right === -3 && M.radicalTest(9, 3, 7).valid);
ok('Extension: x² + 16 = 0 → ±4i, no real roots', M.complexRoots(16).real === false && M.complexRoots(16).im === 4);
const fA = M.sagWindow(65);
ok('Final A: 65 mm → 16.25–19.5 mm, midpoint 17.875, tolerance 1.625', near(fA.minMm, 16.25) && near(fA.maxMm, 19.5) && near(fA.midMm, 17.875) && near(fA.tolMm, 1.625));
ok('Final A: 20.5 mm is outside (too much sag)', !M.sagReading(20.5, 65).within && M.sagReading(20.5, 65).side === 'high');
ok('Final B: 1.5 km at 15 km/h of a 4.5 km stage at 18 km/h → 20 km/h', near(M.raceStage(M.FINAL_SETS.race[0]).vNeeded, 20));
ok('Final C: 40 m and 41 m → h = ±9', near(M.survey(40, 41).rise, 9));

// ---- 2. Every validated number set is clean ----
for (const st of [...M.RACE_PRACTICE, ...M.FINAL_SETS.race, M.PRD.stage]) {
  const R = M.raceStage(st);
  ok(`Race set ${JSON.stringify(st)}: whole minutes, whole-number speed, the equation balances, averaging the speeds doesn’t happen to work`,
    whole(M.minutes(R.t1)) && whole(M.minutes(R.tTarget)) && R.vNeeded > 0 && whole(R.vNeeded) && near(st.d1 / st.v1 + st.d2 / R.vNeeded, R.total / st.target, 1e-12) && R.vNeeded >= 10 && R.vNeeded <= 30
      && !near(R.t1, st.d2 / R.vNeeded) && !near(M.naiveSpeed(st), R.vNeeded), R);
}
ok('Practice scenarios are all different from Mission 2’s own stage', M.RACE_PRACTICE.every(st => JSON.stringify(st) !== JSON.stringify(M.PRD.stage)));
for (const sv of M.FINAL_SETS.survey) {
  const x = M.survey(sv.a, sv.c);
  ok(`Survey set ${sv.a}/${sv.c}: whole-number rise, a sensible grade (≤ 35%)`, x.real && whole(x.rise) && x.rise > 0 && x.grade <= 0.35, x);
}
for (const sg of M.FINAL_SETS.sag) {
  const r = M.sagReading(sg.measured, sg.stroke);
  ok(`Sag set ${sg.stroke} mm / ${sg.measured} mm: the reading isn’t right on a boundary`, Math.abs(r.pct - 25) > 0.3 && Math.abs(r.pct - 30) > 0.3, r.pct);
}
ok('Final sag sets include readings inside, too high and too low', ['in', 'high', 'low'].every(side => M.FINAL_SETS.sag.some(sg => M.sagReading(sg.measured, sg.stroke).side === side)));

// ---- 3. Every question, in every variant and round ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
for (let n = 0; n < M.RACE_PRACTICE.length; n++) { const P = Q.practiceQuestions(n); for (const id of Q.PRACTICE_IDS) all.push([id, P[id], 'v' + n]); }
for (let r = 1; r <= 7; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) all.push([id, F[id], 'r' + r]); }
const bad = [];
for (const [id, q, tag] of all) {
  const where = id + ' ' + tag;
  if (!q || !q.prompt || !q.solution || !Array.isArray(q.hints) || q.hints.length !== 3) bad.push(where + ': prompt, solution and three hints');
  if (!q.ideas || !q.ideas.length || !q.ideas.every(i => Q.IDEAS[i])) bad.push(where + ': ideas');
  if (q.type === 'choice' && q.options.filter(o => o.correct).length !== 1) bad.push(where + ': exactly one correct option');
  if (q.type === 'multi' && !q.options.some(o => o.correct)) bad.push(where + ': a correct option');
  if (['choice', 'multi'].includes(q.type)) {
    q.options.filter(o => !o.correct).forEach(o => { if (!o.feedback) bad.push(where + ': feedback on ' + o.id); if (!Q.MISCONCEPTIONS[o.code]) bad.push(where + ': code ' + o.code); });
    if (new Set(q.options.map(o => o.text)).size !== q.options.length) bad.push(where + ': duplicate options');
  }
  const fields = q.type === 'number' ? [{ id: 'v', answer: q.answer, tolerance: q.tolerance, traps: q.traps }] : q.type === 'fields' ? q.fields : [];
  for (const f of fields) {
    if (!isFinite(f.answer)) bad.push(where + ': finite answer');
    if (!V.checkNumber(f, String(f.answer)).correct) bad.push(where + ': its own answer is accepted');
    for (const t of f.traps || []) {
      if (!Q.MISCONCEPTIONS[t.code]) bad.push(where + ': trap code ' + t.code);
      if (Math.abs(t.value - f.answer) <= Math.max(f.tolerance || 0, Math.abs(f.answer) * 0.015, 0.01)) bad.push(where + ': trap ' + t.value + ' too close to the answer ' + f.answer);
      const res = V.checkNumber(f, String(t.value));
      if (res.correct) bad.push(where + ': trap ' + t.value + ' accepted');
    }
  }
}
ok(`Every question (${all.length} across variants and rounds) is well formed, its answer is accepted and no trap is`, bad.length === 0, bad.slice(0, 6));
ok('No trap shares a value with another trap on the same field', all.every(([, q]) => (q.type === 'number' ? [q] : q.fields || []).every(f => { const vs = (f.traps || []).map(t => Math.round(t.value * 1e6)); return new Set(vs).size === vs.length; })));

const pos = Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').map(q => q.options.findIndex(o => o.correct));
ok('The correct option isn’t always in the same place (no position give-away)', new Set(pos).size >= 3 && pos.filter(i => i === 0).length <= pos.length / 2, pos);
// Answers re-derived independently of models.js
const QQ = Q.QUESTIONS;
ok('m1-sag-min / max / pct answers: 15, 18, 28.33', QQ['m1-sag-min'].answer === 0.25 * 60 && near(QQ['m1-sag-max'].answer, 0.3 * 60) && near(QQ['m1-sag-pct'].answer, 17 / 60 * 100));
ok('m1-range-80: 20 and 24', QQ['m1-range-80'].fields.map(f => f.answer).join() === '20,24');
ok('m1-abs-pick: only 27% is ticked as correct', QQ['m1-abs-pick'].options.filter(o => o.correct).map(o => o.text).join() === '27%');
ok('m1-abs-bounds: 25 and 30', QQ['m1-abs-bounds'].fields.map(f => f.answer).join() === '25,30');
ok('m2 answers: 15 min, 5 min, 18 km/h, check 10 and 15 min', near(QQ['m2-target-time'].answer, 15) && near(QQ['m2-time-used'].answer, 5) && near(QQ['m2-solve'].answer, 18) && QQ['m2-check'].fields.map(f => Math.round(f.answer * 1e9) / 1e9).join() === '10,15');
ok('m3 answers: +35 and −35, 120² + 35² = 15625, candidates 0 and 7', QQ['m3-solve'].fields.map(f => f.answer).join() === '35,-35' && QQ['m3-verify'].answer === 15625 && QQ['m3-candidates'].fields.map(f => f.answer).join() === '0,7');
const F1 = Q.finalQuestions(1);
ok('Final round 1 uses the briefing’s numbers: 16.25, 19.5, (17.875, 1.625), outside-high, 20, ±9',
  near(F1['final-a-min'].answer, 16.25) && near(F1['final-a-max'].answer, 19.5) && F1['final-a-abs'].fields.map(f => f.answer).join() === '17.875,1.625' &&
  F1['final-a-eval'].options.find(o => o.correct).id === 'high' && near(F1['final-b-speed'].answer, 20) && F1['final-c-elev'].fields.map(f => f.answer).join() === '9,-9');
ok('Final rounds 2+ use different numbers', Q.finalQuestions(2)['final-a-min'].answer !== F1['final-a-min'].answer && Q.finalQuestions(2)['final-b-speed'].prompt !== F1['final-b-speed'].prompt);
ok('Practice variants: the correct equation isn’t always in the same place', new Set([0, 1, 2, 3].map(n => Q.practiceQuestions(n)['m2x-model'].options.findIndex(o => o.correct))).size > 1);
for (let n = 0; n < M.RACE_PRACTICE.length; n++) {
  const P = Q.practiceQuestions(n), st = M.RACE_PRACTICE[n];
  const v = st.d2 / ((st.d1 + st.d2) / st.target - st.d1 / st.v1);
  ok(`Practice ${n + 1}: answer ${Math.round(v)} km/h re-derived; the check’s average is the target`, near(P['m2x-solve'].answer, v, 1e-9) && near(P['m2x-check'].fields[1].answer, st.target));
}

// ---- 4. Answer reading and checking ----
ok('Units are read: 15 mm, 28.3%, 18 km/h, 15 min, −35 m', ['15 mm', '28.3%', '18 km/h', '15 min', '−35 m'].map(x => V.parseNumber(x).value).join() === '15,28.3,18,15,-35');
ok('Fractions are read: 3/4 → 0.75', V.parseNumber('3/4').value === 0.75);
ok('28.3 and 28.33 are accepted for 28.33…%, 28 is not', V.checkNumber(QQ['m1-sag-pct'], '28.3').correct && V.checkNumber(QQ['m1-sag-pct'], '28.33').correct && !V.checkNumber(QQ['m1-sag-pct'], '28').correct);
ok('A trap names its mistake: 0.2833 is “decimal, not percent”', V.checkNumber(QQ['m1-sag-pct'], '0.2833').code === 'pct-vs-mm');
ok('Averaging the speeds is caught: 20 → average-speeds', V.checkNumber(QQ['m2-solve'], '20').code === 'average-speeds');
ok('Downhill entered as +35 is caught as a missing negative root', V.checkFields(QQ['m3-solve'].fields, { up: '35', down: '35' }).fields[1].code === 'both-roots');
ok('Final A midpoint in percent (27.5) is caught', V.checkFields(F1['final-a-abs'].fields, { m: '27.5', t: '1.625' }).fields[0].code === 'pct-vs-mm');
const opts = QQ['m1-abs-pick'].options;
ok('Tick-all: exactly 27% is right', V.checkMulti(opts, ['p27']).correct);
ok('Tick-all: ticking a wrong one explains it', V.checkMulti(opts, ['p27', 'p31']).correct === false && /3\.5/.test(V.checkMulti(opts, ['p27', 'p31']).message));
ok('Tick-all: nothing ticked is not counted', V.checkMulti(opts, []).code === 'empty');
ok('Tick-all: a missing answer is named as missing', V.checkMulti([{ id: 'a', correct: true }, { id: 'b', correct: true }, { id: 'c' }], ['a']).code === 'missed');

// ---- 5. Progress (the kit's, with the missions as sections) ----
const LESSON = { id: 'race-day-workshop', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QQ };
let sent = [];
const prog = createProgress({ lesson: LESSON, storage: 'memory', onAttempt: r => sent.push(r) });
prog.attempt('m1-sag-min', null, '1500', false, { code: 'no-percent' });
prog.attempt('m1-sag-min', null, '15', true, { code: 'correct' });
ok('Attempts are counted; first try remembered as wrong', prog.question('m1-sag-min').attempts === 2 && prog.question('m1-sag-min').firstTry === false && prog.done('m1-sag-min'));
prog.attempt('final-a-min', 'r1', '16.25', true, {});
prog.attempt('final-a-min', 'r2', '12', false, {});
ok('Final rounds are kept apart by key, and sent with it', prog.done('final-a-min', 'r1') && !prog.done('final-a-min', 'r2') && sent.at(-1).key === 'final-a-min|r2');
ok('Answering a keyed question doesn’t complete a fixed one', !prog.done('final-a-min'));
ok('Mission 1 isn’t complete after one question', !prog.sectionState('suspension').complete && prog.sectionState('suspension').answered === 1);
Q.MISSIONS[0].graded.forEach(id => prog.reveal(id));
ok('Reading every solution completes the mission but earns nothing', prog.sectionState('suspension').complete && !prog.earned('m1-rearrange'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'race-day-workshop');
const model = loadClasses();
const skillIds = new Set(model.skills.map(s => s.id));
const kinds = Q.questionKinds();
ok('The workshop is a live Algebra 2 lab, home topic Solving Equations and Modeling Constraints', act && act.status === 'live' && act.home === 'alg2.solving-equations-and-modeling-constraints' && model.errors.length === 0, model.errors);
ok('That topic is the first in Algebra 2 → Unit 1: Equations and Inequalities', (() => { const t = model.skills.find(s => s.topic.id === act.home).topic; return t.unit.title === 'Equations and Inequalities' && t.number === 1 && t.course.id === 'alg2'; })());
ok('Every question kind maps to real curriculum skills', Object.keys(kinds).every(k => act.tracking.questions[k] && act.tracking.questions[k].length && act.tracking.questions[k].every(s => skillIds.has(s))), Object.keys(kinds).filter(k => !(act.tracking.questions[k] || []).every(s => skillIds.has(s))));
ok('All eight tracked areas from the PRD have questions', Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Question ids are lowercase kinds (as stored)', Object.keys(kinds).every(k => /^[a-z0-9-]+$/.test(k)));
ok('Final ids match the assessment', Q.FINAL_IDS.every(id => kinds[id]) && Q.PASS_MARK <= Q.FINAL_IDS.length);

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
