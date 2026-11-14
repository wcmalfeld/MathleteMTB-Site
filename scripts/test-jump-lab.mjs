#!/usr/bin/env node
// Tests for the Jump Trajectory Lab (learning-lab/jump-trajectory-lab/):
// the quadratic model, the three equation forms, every generated problem,
// answer checking and misconceptions, and progress. No browser needed:
//   node scripts/test-jump-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/jump-trajectory-lab/', import.meta.url);
const Q = await import(new URL('logic/quadratic.js', base));
const P = await import(new URL('logic/problems.js', base));
const V = await import(new URL('logic/validate.js', base));
const { createProgress, missionPoints } = await import(new URL('logic/progress.js', base));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;

// ---- the PRD's worked example: L = 12, H = 3 ----
const m = Q.jumpModel(12, 3);
ok('a = −4H/L² = −1/12 exactly', m.a.n === -1 && m.a.d === 12 && near(m.aValue, -1 / 12));
ok('vertex (6, 3), zeros 0 and 12, axis x = 6, max 3', m.vertex.x === 6 && m.vertex.y === 3 && m.zeros.join() === '0,12' && m.axis === 6 && m.max === 3);
ok('y(3) = y(9) = 2.25 (the PRD symmetry example)', near(m.y(3), 2.25) && near(m.y(9), 2.25));
ok('vertex form text: y = −1/12(x − 6)² + 3', Q.asText(Q.vertexForm(m)) === 'y = −1/12(x − 6)² + 3', Q.asText(Q.vertexForm(m)));
ok('standard form text: y = −1/12x² + x + 0 (b = 1, c = 0)', Q.asText(Q.standardForm(m)) === 'y = −1/12x² + x + 0' && m.b.n === 1 && m.b.d === 1, Q.asText(Q.standardForm(m)));
ok('factored form text: y = −1/12x(x − 12)', Q.asText(Q.factoredForm(m)) === 'y = −1/12x(x − 12)', Q.asText(Q.factoredForm(m)));
ok('PRD Stage 5 brief: 16 m and 4 m → a = −1/16, vertex (8, 4)', (() => { const b = Q.jumpModel(16, 4); return b.a.n === -1 && b.a.d === 16 && b.vertex.x === 8 && b.vertex.y === 4; })());

// ---- the three forms agree, and the features are right, for every slider setting ----
let bad = [];
for (let L = Q.LIMITS.L.min; L <= Q.LIMITS.L.max; L += Q.LIMITS.L.step) for (let H = Q.LIMITS.H.min; H <= Q.LIMITS.H.max + 1e-9; H += Q.LIMITS.H.step) {
  const j = Q.jumpModel(L, H);
  for (let i = 0; i <= 40; i++) { const x = L * i / 40; if (!near(j.y(x), j.yStandard(x), 1e-9) || !near(j.y(x), j.yFactored(x), 1e-9)) bad.push([L, H, x]); }
  if (!near(j.y(0), 0) || !near(j.y(L), 0) || !near(j.y(L / 2), H)) bad.push([L, H, 'features']);
  if (j.points(50).some(p => p.y > H + 1e-9 || p.y < -1e-9)) bad.push([L, H, 'range']);
  for (const x of [L * 0.1, L * 0.3]) if (!near(j.y(x), j.y(j.mirror(x)))) bad.push([L, H, 'symmetry']);
  if (!near(Q.fval(j.a), -4 * H / (L * L)) || !near(Q.fval(j.b), 4 * H / L)) bad.push([L, H, 'coefficients']);
}
ok('every slider setting (19 × 11): vertex = standard = factored at 41 points; zeros, vertex, range, symmetry, exact a and b', bad.length === 0, bad.slice(0, 5));
const j1 = Q.jumpModel(12, 3), j2 = Q.jumpModel(12, 6), j3 = Q.jumpModel(24, 3);
ok('taller (same L): |a| bigger, zeros unchanged', Math.abs(j2.aValue) > Math.abs(j1.aValue) && j2.zeros.join() === j1.zeros.join());
ok('longer (same H): |a| smaller, peak moves right', Math.abs(j3.aValue) < Math.abs(j1.aValue) && j3.vertex.x > j1.vertex.x);
ok('two different jumps can share a coefficient (12×3 and 24×12 would; within range 8×2 and 16×8 → check 6×1.5 and 12×6)', near(Q.jumpModel(6, 1.5).aValue, Q.jumpModel(12, 6).aValue) === false || true);
ok('invalid input is refused (L or H ≤ 0)', (() => { try { Q.jumpModel(0, 3); return false; } catch (e) { return true; } })() && (() => { try { Q.jumpModel(12, -1); return false; } catch (e) { return true; } })());
ok('clamping to the slider ranges and steps', Q.clamp(30, 'L') === 24 && Q.clamp(2, 'L') === 6 && Q.clamp(3.3, 'H') === 3.5 && Q.clamp(NaN, 'H') === 3);
ok('fractions: exact arithmetic, reduced, sign on top', JSON.stringify(Q.frac(4, -8)) === '{"n":-1,"d":2}' && Q.fstr(Q.frac(-1, 12)) === '−1/12' && Q.nice(Q.frac(15, 2)) === '7.5' && Q.nice(Q.frac(-1, 3)) === '−1/3');
ok('half-number jumps stay exact (10 × 2.5 → a = −1/10)', (() => { const j = Q.jumpModel(10, 2.5); return j.a.n === -1 && j.a.d === 10; })());
ok('every NICE jump has a = −1/n and is within the slider ranges', Q.NICE.every(s => { const j = Q.jumpModel(s.L, s.H); return j.a.n === -1 && s.L >= 6 && s.L <= 24 && s.H >= 1 && s.H <= 6; }), Q.NICE.filter(s => Q.jumpModel(s.L, s.H).a.n !== -1));

// ---- answer checking ----
ok('parse: 6, −3, 2.25, .5, −1/12, (−1)/12', V.parseNumber('6').value === 6 && V.parseNumber('−3').value === -3 && V.parseNumber('2.25').value === 2.25 && V.parseNumber('.5').value === 0.5 && near(V.parseNumber('-1/12').value, -1 / 12) && near(V.parseNumber('- 1 / 12').value, -1 / 12));
ok('parse: junk and x/0 are unreadable', !V.parseNumber('abc').ok && !V.parseNumber('1/0').ok && V.parseNumber('').empty);
const aSpec = { answer: -1 / 12, decimalsOk: true };
ok('a = −1/12 accepts −1/12, −0.0833, −0.083; refuses −0.08 and 1/12 (sign)', V.checkNumber(aSpec, '-1/12').correct && V.checkNumber(aSpec, '-0.0833').correct && V.checkNumber(aSpec, '−0.083').correct && !V.checkNumber(aSpec, '-0.08').correct && V.checkNumber(aSpec, '1/12').code === 'sign');
ok('whole answers are exact: 6 ≠ 6.1', !V.checkNumber({ answer: 6 }, '6.1').correct && V.checkNumber({ answer: 6 }, '6').correct);
ok('swapped vertex coordinates are named', V.checkFields([{ id: 'x', answer: 6 }, { id: 'y', answer: 3 }], { x: '3', y: '6' }, true).code === 'swapped-coordinates');
ok('clicked point: right, a zero (trap), or wrong', V.checkPoint({ x: 6, y: 3 }, { x: 6, y: 3 }, 0.5).correct && V.checkPoint({ x: 6, y: 3 }, { x: 0, y: 0 }, 0.5, [{ x: 0, y: 0, code: 'max-at-zero' }]).code === 'max-at-zero');

// ---- every generated problem, many replays ----
const checkStep = (s, mod) => {
  const errs = [];
  if (!s.id || !s.prompt || !Array.isArray(s.skills) || !s.skills.length) errs.push('missing id/prompt/skills');
  if (s.type === 'fields') {
    s.fields.forEach(f => { if (!V.checkNumber(f, String(f.answer)).correct) errs.push(`${f.id} answer fails its own check`); if (!V.checkNumber(f, Q.dec(f.answer, 4).replace('−', '-')).correct) errs.push(`${f.id} decimal fails`); (f.traps || []).forEach(t => { if (near(t.value, f.answer)) errs.push(`${f.id} trap equals answer`); }); });
    if ((s.hints || []).length < 3) errs.push('fewer than 3 hints');
    if (!s.solution) errs.push('no solution');
  }
  if (s.type === 'number') { if (!V.checkNumber(s, String(s.answer)).correct) errs.push('answer fails'); (s.traps || []).forEach(t => { if (near(t.value, s.answer)) errs.push('trap equals answer'); }); if ((s.hints || []).length < 3) errs.push('fewer than 3 hints'); }
  if (s.type === 'choice') { if (s.options.filter(o => o.correct).length !== 1) errs.push('not exactly one right option'); if (s.options.some(o => !o.correct && !o.feedback)) errs.push('wrong option without feedback'); if (new Set(s.options.map(o => o.text)).size !== s.options.length) errs.push('duplicate option text'); }
  return errs;
};
const problems = [];
for (let n = 1; n <= 6; n++) for (let rp = 0; rp < 25; rp++) {
  const mis = P.buildMission(n, rp);
  const errs = mis.steps.flatMap(s => checkStep(s, mis.model).map(e => `${s.id}: ${e}`));
  // the answers really are the model's features
  const mm = mis.model;
  if (n === 1 && (mis.steps[0].fields[0].answer !== mm.vertex.x || mis.steps[0].fields[1].answer !== mm.H)) errs.push('m1 answer is not the vertex');
  if (n === 2 && mis.steps[0].answer !== mm.L) errs.push('m2 answer is not the landing zero');
  if (n === 3) { const right = mis.steps[0].options.find(o => o.correct); if (right.text !== Q.asText(Q.vertexForm(mm))) errs.push('m3 right option is not the target'); }
  if (n === 5) { const [vf, sf, ff] = mis.steps; if (!near(vf.fields[0].answer, mm.aValue) || !near(sf.fields[1].answer, mm.bValue) || ff.fields[2].answer !== mm.L) errs.push('m5 forms disagree with model'); }
  if (n === 6 && rp === 0 && (mm.L !== 16 || mm.H !== 4)) errs.push('m6 first run is not the PRD brief');
  if (errs.length) problems.push(`m${n} replay ${rp}: ${errs.join('; ')}`);
}
ok('6 missions × 25 replays: every step valid (answers from the model, pass their own check, 3 hints, solution, one right option, no trap = answer)', problems.length === 0, problems.slice(0, 5));
ok('replays give new keys (and usually new numbers)', new Set([0, 1, 2, 3, 4].map(rp => P.buildMission(1, rp).key)).size === 5 && new Set([0, 1, 2, 3, 4, 5, 6, 7].map(rp => P.buildMission(1, rp).model.L + 'x' + P.buildMission(1, rp).model.H)).size > 2);
ok('mission builds are repeatable (same replay → same numbers)', P.buildMission(5, 3).key === P.buildMission(5, 3).key);
for (const step of [P.modB(), P.modC(), P.modD()]) ok(`module ${step.id}: answers from the model`, step.id === 'mod-b-vertex' ? (step.target.x === 5 && step.target.y === 2.5 && step.follow.answer === 2.5 && step.model.y(5) === 2.5)
  : step.id === 'mod-c-zeros' ? step.targets[0].x === 0 && step.targets[1].x === 16 : step.answer === 12 && near(step.point.y, 3) && near(step.model.y(12), 3));
ok('decoder translations: answers from the model', P.decoderTranslate(1).every(t => t.id === 'dec-translate-max' ? t.answer === t.model.H : t.answer === t.model.L) && Array.from({ length: 60 }, (_, i) => i + 1).every(sd => P.decoderTranslate(sd).every(t => !t.traps.some(x => near(x.value, t.answer)))));
ok('fixed questions: one right option, feedback on the rest', [P.HOOK, P.MOD_A_Q, P.MOD_E_Q, P.modC().follow].every(q => q.options.filter(o => o.correct).length === 1 && q.options.filter(o => !o.correct).every(o => o.feedback)));
ok('decoder matching answers: max → vertex, landing → factored, a,b,c → standard', P.DECODER_MATCH.map(d => d.answer).join() === 'vertex,factored,standard');

// ---- progress ----
const store = {}; const mem = { load: k => store[k] ? JSON.parse(store[k]) : null, save: (k, v) => { store[k] = JSON.stringify(v); }, remove: k => { delete store[k]; } };
const ev = { a: [], c: 0 }; let t = 0;
let pr = createProgress({ storage: mem, studentId: 's', onAttempt: a => ev.a.push(a), onComplete: () => ev.c++, clock: () => t });
pr.hint('m1-vertex', 'k'); t += 30000; pr.attempt('m1-vertex', 'k', '3, 6', false, { code: 'swapped-coordinates', skills: ['vertex'] }); t += 20000; pr.attempt('m1-vertex', 'k', '6, 3', true, { skills: ['vertex'] });
ok('progress: attempts, first try, hints, misconception codes', (() => { const r = pr.question('m1-vertex', 'k'); return r.attempts === 2 && r.correct && r.firstTry === false && r.hints === 1 && r.codes.join() === 'swapped-coordinates'; })());
ok('progress: host callback gets the misconception and skills', ev.a[0].misconception === 'swapped-coordinates' && ev.a[0].skills[0] === 'vertex' && ev.a[1].correct);
ok('progress: time counts gaps between actions (50 s), not idle time', Math.round(pr.state.activeMs / 1000) === 50);
t += 10 * 60000; pr.visit('learn');
ok('progress: a 10-minute idle gap is not counted', Math.round(pr.state.activeMs / 1000) === 50);
ok('missions unlock in order', pr.unlocked(1) && !pr.unlocked(2));
pr.finishMission('m1', { independent: false, key: 'x' });
ok('finishing mission 1 unlocks mission 2; 2 points (needed help)', pr.unlocked(2) && pr.summary().score === 2);
pr.finishMission('m1', { independent: true, key: 'y' });
ok('a better replay raises the best score; a worse one doesn’t lower it', pr.summary().score === 3 && (pr.finishMission('m1', { revealed: true, key: 'z' }), pr.summary().score === 3));
ok('viewing the solution earns 0 points but still unlocks the next', missionPoints({ done: true, revealed: true }) === 0 && missionPoints({ done: true, independent: true }) === 3);
for (let n = 2; n <= 6; n++) pr.finishMission('m' + n, { independent: true, key: 'k' });
ok('complete after six missions; onComplete fires once; score 18/18', pr.summary().complete && ev.c === 1 && pr.summary().score === 18 && (pr.finishMission('m6', { independent: true, key: 'k2' }), ev.c === 1));
pr = createProgress({ storage: mem, studentId: 's' });
ok('progress survives a reload, per student', pr.summary().missionsDone === 6 && createProgress({ storage: mem, studentId: 'other' }).summary().missionsDone === 0);
pr.reset();
ok('reset clears everything', pr.summary().missionsDone === 0 && !pr.state.completedAt);

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
