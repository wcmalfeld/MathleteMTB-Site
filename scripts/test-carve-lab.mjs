#!/usr/bin/env node
// Tests for Carve Lab (learning-lab/carve-lab/): the physics engine (PRD 5,
// with the PRD's own worked examples), unit conversions, safe handling of
// bad input, the turn path the skier follows, every challenge answer
// (re-derived here independently), answer checking, and progress.
// No browser needed:
//   node scripts/test-carve-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/carve-lab/', import.meta.url);
const P = await import(new URL('logic/physics.js', base));
const S = await import(new URL('logic/simulation.js', base));
const C = await import(new URL('logic/challenges.js', base));
const V = await import(new URL('logic/validate.js', base));
const { HELP } = await import(new URL('logic/explain.js', base));
const { createProgress, challengePoints, maxPoints } = await import(new URL('logic/progress.js', base));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const cosd = d => Math.cos(d * Math.PI / 180);

// ---- 1. The PRD's worked examples ----
ok('PRD 5.1: 16 m sidecut at 60° → R = 8 m', near(P.calculateTurnRadius(16, 60), 8, 1e-12));
ok('PRD 5.2: 10 m/s on an 8 m turn → a = 12.5 m/s²', near(P.calculateCentripetalAcceleration(10, 8), 12.5));
ok('PRD 5.3: 65 kg × 12.5 m/s² → F = 812.5 N', near(P.calculateInwardForce(65, 12.5), 812.5));
ok('PRD 5.2: g-force = a / 9.81', near(P.calculateGForce(12.5), 12.5 / 9.81) && P.G === 9.81);
ok('PRD 5.4: turn distance πR, time πR/v', near(P.calculateTurnDistance(8), Math.PI * 8) && near(P.calculateTurnDuration(8, 10), Math.PI * 0.8));
ok('PRD 4: defaults 15 m, 35°, 10 m/s, 65 kg', JSON.stringify(P.DEFAULTS) === JSON.stringify({ sidecutRadius: 15, edgeAngle: 35, speed: 10, skierMass: 65 }));
ok('PRD 4: ranges 10–30 m, 0–65°, 3–20 m/s, 35–110 kg', P.RANGES.sidecutRadius.min === 10 && P.RANGES.sidecutRadius.max === 30 && P.RANGES.edgeAngle.min === 0 && P.RANGES.edgeAngle.max === 65
  && P.RANGES.speed.min === 3 && P.RANGES.speed.max === 20 && P.RANGES.skierMass.min === 35 && P.RANGES.skierMass.max === 110);

// ---- 2. carve() agrees with the individual formulas everywhere on the controls' grid ----
let bad = [];
for (let rsc = 10; rsc <= 30; rsc += 2.5) for (let th = 0; th <= 65; th += 5) for (let v = 3; v <= 20; v += 1.7) for (const m of [35, 65, 110]) {
  const r = P.carve({ sidecutRadius: rsc, edgeAngle: th, speed: v, skierMass: m });
  const R = rsc * cosd(th), a = v * v / R, F = m * a;
  if (!near(r.turnRadius, R, 1e-9) || !near(r.centripetalAcceleration, a, 1e-9 * a) || !near(r.inwardForce, F, 1e-9 * F) || !near(r.gForce, a / 9.81, 1e-9)
    || !near(r.turnDistance, Math.PI * R, 1e-9) || !near(r.turnDuration, Math.PI * R / v, 1e-9) || !(r.turnRadius > 0)) bad.push([rsc, th, v, m]);
}
ok('carve() = R·cosθ, v²/R, ma, a/g, πR, πR/v across the whole control grid (9×14×11×3 settings)', bad.length === 0, bad.slice(0, 3));
ok('relationships: more edge angle → smaller R; bigger sidecut → bigger R', P.calculateTurnRadius(15, 50) < P.calculateTurnRadius(15, 30) && P.calculateTurnRadius(25, 30) > P.calculateTurnRadius(15, 30));
ok('doubling speed quadruples a; mass leaves a unchanged and scales F', (() => { const a = P.carve({ speed: 6 }), b = P.carve({ speed: 12 }), h = P.carve({ skierMass: 130 / 2 * 2 > 110 ? 110 : 130 });
  const m1 = P.carve({ skierMass: 50 }), m2 = P.carve({ skierMass: 100 });
  return near(b.centripetalAcceleration, 4 * a.centripetalAcceleration, 1e-9) && near(m1.centripetalAcceleration, m2.centripetalAcceleration) && near(m2.inwardForce, 2 * m1.inwardForce, 1e-9) && h; })());
ok('cos uses radians internally: R(16, 60°) is 8, not 16·cos(60 rad)', !near(P.calculateTurnRadius(16, 60), 16 * Math.cos(60)));
ok('inverse: edgeAngleForRadius(12, 16) = cos⁻¹(0.75) and round-trips', near(P.edgeAngleForRadius(12, 16), Math.acos(0.75) * 180 / Math.PI) && near(P.calculateTurnRadius(16, P.edgeAngleForRadius(12, 16)), 12, 1e-12));
ok('inverse: impossible targets return null (R > Rsc, zero, negative)', P.edgeAngleForRadius(20, 16) === null && P.edgeAngleForRadius(0, 16) === null && P.edgeAngleForRadius(-3, 16) === null);
ok('sidecut depth (sagitta) of a 15 m ski over 1.6 m ≈ 21.4 mm; deeper for smaller sidecuts', near(P.sidecutDepth(15), 15 - Math.sqrt(225 - 0.64), 1e-12) && near(P.sidecutDepth(15) * 1000, 21.35, 0.05) && P.sidecutDepth(10) > P.sidecutDepth(30));

// ---- 3. Bad input never divides by zero or escapes the ranges ----
ok('zero radius: a = ∞ (no division by zero), F = ∞, still a number type', P.calculateCentripetalAcceleration(10, 0) === Infinity && P.calculateInwardForce(65, Infinity) === Infinity && P.calculateCentripetalAcceleration(0, 0) === 0);
ok('90° edge: R = 0 exactly (cos 90° rounding guarded)', P.calculateTurnRadius(15, 90) === 0);
ok('negative or junk sidecut → R = 0; NaN inputs → NaN, not a crash', P.calculateTurnRadius(-5, 30) === 0 && P.calculateTurnRadius('x', 30) === 0 && Number.isNaN(P.calculateCentripetalAcceleration(NaN, 5)));
ok('zero speed: duration ∞, acceleration 0', P.calculateTurnDuration(10, 0) === Infinity && P.calculateCentripetalAcceleration(0, 10) === 0);
ok('clamping: out-of-range and junk values land inside the range, on the step', P.clampVariable('edgeAngle', 80) === 65 && P.clampVariable('edgeAngle', -4) === 0 && P.clampVariable('speed', 'abc') === 3
  && P.clampVariable('sidecutRadius', 12.26) === 12.5 && P.clampVariable('skierMass', 64.6) === 65);
ok('normalizeConfig fills gaps with defaults and clamps the rest', JSON.stringify(P.normalizeConfig({ speed: 99, edgeAngle: null })) === JSON.stringify({ sidecutRadius: 15, edgeAngle: 35, speed: 20, skierMass: 65 }));
ok('carve() of garbage is still a valid, finite turn', (() => { const r = P.carve({ sidecutRadius: 'x', edgeAngle: Infinity, speed: -1, skierMass: {} }); return isFinite(r.turnRadius) && r.turnRadius > 0 && isFinite(r.inwardForce); })());
ok('the smallest possible turn (10 m at 65°) is still a real, positive radius', P.carve({ sidecutRadius: 10, edgeAngle: 65 }).turnRadius > 4 && isFinite(P.carve({ sidecutRadius: 10, edgeAngle: 65, speed: 20 }).centripetalAcceleration));

// ---- 4. Units ----
ok('10 m/s = 36 km/h = 22.37 mph; and back', near(P.convertUnits(10, 'm/s', 'km/h'), 36, 1e-9) && near(P.convertUnits(10, 'm/s', 'mph'), 22.369, 1e-3) && near(P.convertUnits(36, 'km/h', 'm/s'), 10, 1e-9));
ok('degrees ↔ radians, kg ↔ lb, g ↔ m/s²', near(P.convertUnits(180, 'deg', 'rad'), Math.PI) && near(P.convertUnits(1, 'kg', 'lb'), 2.20462, 1e-5) && near(P.convertUnits(1, 'g', 'm/s²'), 9.81));
ok('converting between different kinds of unit throws', (() => { try { P.convertUnits(1, 'kg', 'm/s'); return false; } catch (e) { return true; } })());
ok('display rounding: ∞, —, no "-0"', P.fmt(Infinity) === '∞' && P.fmt(NaN) === '—' && P.fmt(-0.01, 1) === '0.0' && P.fmt(12.345, 2) === '12.35');

// ---- 5. The turn path ----
for (const mode of ['single', 'linked']) {
  const R = P.calculateTurnRadius(15, 35), path = S.buildPath(R, { mode, turns: 4 });
  ok(`${mode}: length = turns × πR`, near(path.length, path.turns * Math.PI * R, 1e-9));
  let worst = 0, tangent = 0, jump = 0, prev = null;
  for (let i = 0; i <= 2000; i++) {
    const s = path.length * i / 2000, p = S.stateAt(path, s);
    worst = Math.max(worst, Math.abs(Math.hypot(p.x - p.cx, p.y - p.cy) - R));               // on the circle
    tangent = Math.max(tangent, Math.abs(p.tx * (p.cx - p.x) + p.ty * (p.cy - p.y)));        // tangent ⟂ radius
    if (prev) jump = Math.max(jump, Math.hypot(p.x - prev.x, p.y - prev.y), Math.hypot(p.tx - prev.tx, p.ty - prev.ty) * 0);
    prev = p;
  }
  ok(`${mode}: every point is exactly R from its turn centre`, worst < 1e-9, worst);
  ok(`${mode}: velocity is tangent (perpendicular to the radius) everywhere`, tangent < 1e-9, tangent);
  ok(`${mode}: no jumps in position along the path`, jump <= path.length / 2000 * 1.0001, jump);
  // Direction is continuous where turns link.
  let kink = 0;
  for (let k = 1; k < path.turns; k++) { const a = S.stateAt(path, k * Math.PI * R - 1e-7), b = S.stateAt(path, k * Math.PI * R + 1e-7); kink = Math.max(kink, Math.hypot(a.tx - b.tx, a.ty - b.ty)); }
  ok(`${mode}: direction never jumps where turns link (smooth S-line)`, kink < 1e-5, kink);
  const n = S.stateAt(path, path.length / 2 / path.turns);
  ok(`${mode}: halfway through the first turn the skier points straight down the fall line`, near(n.tx, 0, 1e-9) && near(n.ty, 1, 1e-9));
  ok(`${mode}: starts heading across the hill, finishes 2R × turns further down`, near(S.stateAt(path, 0).tx, -1) && near(path.end.y - path.start.y, 2 * R * path.turns, 1e-9));
}
{
  const path = S.buildPath(10, { mode: 'linked', turns: 4 });
  ok('linked turns alternate left, right, left, right', path.arcs.map(a => a.side).join() === 'left,right,left,right');
  const vec = S.vectorsAt(path, 7, { sidecutRadius: 20, edgeAngle: 60, speed: 10, skierMass: 65 });
  ok('vectors: |v| = speed, |a| = v²/R, |F| = ma, a and F point at the centre', near(Math.hypot(vec.velocity.x, vec.velocity.y), 10, 1e-9) && near(vec.acceleration.magnitude, 10, 1e-9)
    && near(vec.force.magnitude, 650, 1e-9) && near(vec.acceleration.x * (vec.position.cx - vec.position.x) + vec.acceleration.y * (vec.position.cy - vec.position.y), 10 * 10, 1e-6));
  ok('stateAt clamps outside the path; zero radius is handled', near(S.stateAt(path, -5).s, 0) && near(S.stateAt(path, 1e9).s, path.length) && S.stateAt(S.buildPath(0), 3).s === 0 && S.pathData(S.buildPath(0)) === '');
  ok('animation time = path length / speed', near(S.pathTime(path, 10), path.length / 10) && S.pathTime(path, 0) === Infinity);
  ok('SVG path data: two 90° arcs per turn, same radius', (S.pathData(path).match(/ A /g) || []).length === 8 && S.pathData(path).includes('A 10.000 10.000'));
}

// ---- 6. Challenges: every answer re-derived here ----
ok('five challenges, in PRD order, difficulties beginner → advanced', C.CHALLENGES.map(c => c.title).join('|') === 'Sidecut Detective|Edge Angle Experiment|Speed Is Everything|The Heavy Skier Experiment|Design Your Turn'
  && C.CHALLENGES.map(c => c.difficulty).join() === 'beginner,beginner,intermediate,intermediate,advanced');
ok('every challenge has a prediction first, an experiment, maths or a target, an explanation, and a post-challenge explanation',
  C.CHALLENGES.every(c => c.steps[0].type === 'predict' && c.steps.some(s => s.type === 'run') && c.steps.some(s => s.type === 'explain') && c.explanation && c.scenario && c.objective && c.initialConfiguration));
const step = (cid, kind) => C.challengeById(cid).steps.find(s => s.kind === kind);
ok('C1: Ski A at 40° → 12·cos 40° = 9.19 m', near(step('c1', 'c1-radius').question.answer, 12 * cosd(40), 1e-12) && near(step('c1', 'c1-radius').question.answer, 9.19, 0.01));
ok('C1: Ski A (12 m) makes the tighter turn; doubling sidecut doubles R', step('c1', 'c1-predict').question.options.find(o => o.correct).id === 'a' && step('c1', 'c1-ratio').question.options.find(o => o.correct).id === 'double');
ok('C2: θ = cos⁻¹(12/16) = 41.4°', near(step('c2', 'c2-angle').question.answer, Math.acos(0.75) * 180 / Math.PI, 1e-12) && near(step('c2', 'c2-angle').question.answer, 41.41, 0.01));
ok('C2: prediction band 30–45° contains the answer', step('c2', 'c2-predict').question.options.find(o => o.correct).id === '30-45');
ok('C3: R = 25·cos 60° = 12.5; a = 8 at 10 m/s, 32 at 20 m/s; tripling → ×9', near(P.carve(C.challengeById('c3').initialConfiguration).turnRadius, 12.5, 1e-9)
  && near(P.carve(C.challengeById('c3').initialConfiguration).centripetalAcceleration, 8, 1e-9) && near(step('c3', 'c3-accel').question.answer, 32, 1e-9) && step('c3', 'c3-factor').question.answer === 9);
ok('C3: the right prediction is "quadruples"', step('c3', 'c3-predict').question.options.find(o => o.correct).id === 'quad');
ok('C4: R = 10 m, a = 10 m/s² for both; Skier B needs 1000 N, Skier A 500 N', (() => { const c = C.challengeById('c4'), A = P.carve(c.steps[1].setups[0].config), B = P.carve(c.steps[1].setups[1].config);
  return near(A.turnRadius, 10, 1e-9) && near(A.centripetalAcceleration, B.centripetalAcceleration) && near(B.inwardForce, 1000, 1e-9) && near(A.inwardForce, 500, 1e-9) && near(step('c4', 'c4-force').question.answer, 1000, 1e-9); })());
// No trap may equal (or sit within tolerance of) the right answer.
const trapClash = [];
for (const c of C.CHALLENGES) for (const s of c.steps) if (s.type === 'ask' && s.question.type === 'number') for (const t of s.question.traps || []) if (Math.abs(t.value - s.question.answer) <= s.question.tolerance) trapClash.push([s.kind, t.code]);
ok('no anticipated wrong answer (trap) is within tolerance of a right answer', trapClash.length === 0, trapClash);
ok('every trap names a misconception the lab can explain to a tutor', C.CHALLENGES.every(c => c.steps.every(s => !s.question || [...(s.question.traps || []), ...(s.question.options || [])].every(t => !t.code || C.MISCONCEPTIONS[t.code]))));
ok('every number question has three-or-fewer progressive hints and a solution', C.CHALLENGES.every(c => c.steps.filter(s => s.type === 'ask').every(s => (s.question.hints || []).length >= 2 && (s.dynamic || s.question.solution))));
// C5: several different valid designs, and a few invalid ones.
const c5 = C.challengeById('c5'), run5 = c5.steps.find(s => s.type === 'run');
const designs = [
  { sidecutRadius: 20, edgeAngle: 60, speed: 10, skierMass: 65 },            // R 10, F 650
  { sidecutRadius: 14, edgeAngle: P.clampVariable('edgeAngle', Math.acos(10 / 14) * 180 / Math.PI), speed: 8, skierMass: 110 },
  { sidecutRadius: 12, edgeAngle: 33.5, speed: 12, skierMass: 50 }
];
ok('C5: three different designs all pass (many valid answers)', designs.every(d => C.evaluateRun(run5, d).met), designs.map(d => C.evaluateRun(run5, d).checks));
ok('C5: radius off, speed out of range, or too much force each fail with the right check marked', !C.evaluateRun(run5, P.DEFAULTS).met
  && C.evaluateRun(run5, { ...designs[0], speed: 13 }).checks.find(x => x.key === 'speed').ok === false
  && C.evaluateRun(run5, { ...designs[0], skierMass: 90 }).checks.find(x => x.key === 'inwardForce').ok === false
  && C.evaluateRun(run5, { ...designs[0], skierMass: 90 }).checks.find(x => x.key === 'turnRadius').ok === true);
ok('C5: the "show your maths" answers are computed from the student’s own design', (() => { const q = C.designQuestion(c5.steps.find(s => s.dynamic), designs[0]);
  return near(q.fields[0].answer, 10, 1e-9) && near(q.fields[1].answer, 650, 1e-9) && V.checkFields(q.fields, { R: '10', F: '650' }).correct && !V.checkFields(q.fields, { R: '10', F: '600' }).correct; })());
ok('C2 target: 41.4° passes, 40° and 43° don’t', (() => { const r = C.challengeById('c2').steps.find(s => s.mode === 'target'), base2 = C.challengeById('c2').initialConfiguration;
  return C.evaluateRun(r, { ...base2, edgeAngle: 41.5 }).met && !C.evaluateRun(r, { ...base2, edgeAngle: 40 }).met && !C.evaluateRun(r, { ...base2, edgeAngle: 43 }).met; })());
ok('compare runs are met only once every setup has been run', (() => { const r = C.challengeById('c1').steps[1]; return !C.evaluateRun(r, {}, { A: 1 }).met && C.evaluateRun(r, {}, { A: 1, B: 1 }).met; })());
const kinds = C.questionKinds().map(k => k.kind);
ok('graded question kinds are unique and match the progress.sql list', new Set(kinds).size === kinds.length && kinds.length === 15, kinds);

// ---- 7. Checking answers ----
ok('reads 9.2, 9,2, "9.2 m", "41.4°", 1,000, 3/4, −8', V.parseNumber('9.2').value === 9.2 && V.parseNumber('9,2').value === 9.2 && V.parseNumber('9.2 m').value === 9.2
  && V.parseNumber('41.4°').value === 41.4 && V.parseNumber('1,000').value === 1000 && V.parseNumber('3/4').value === 0.75 && V.parseNumber('−8').value === -8);
ok('empty and unreadable input are explained, not marked wrong', V.checkNumber({ answer: 1 }, '').code === 'empty' && V.checkNumber({ answer: 1 }, 'abc').code === 'unreadable');
const qr = step('c1', 'c1-radius').question;
ok('C1 radius: 9.19 and 9.2 are right; 7.7 is "sin for cos"; 12 is "no cos"; −8 is "radians mode"', V.checkNumber(qr, '9.19').correct && V.checkNumber(qr, '9.2').correct
  && V.checkNumber(qr, '7.7').code === 'sin-for-cos' && V.checkNumber(qr, '12').code === 'no-cos' && V.checkNumber(qr, '-8').code === 'radians-mode');
const qa = step('c2', 'c2-angle').question;
ok('C2 angle: 41.4 right; 0.75 "ratio not angle"; 48.6 "sin for cos"; 0.72 "radians"', V.checkNumber(qa, '41.4').correct && V.checkNumber(qa, '0.75').code === 'ratio-not-angle'
  && V.checkNumber(qa, '48.6').code === 'sin-for-cos' && V.checkNumber(qa, '0.72').code === 'radians-mode');
ok('C3: 16 is "linear speed"; 32 right; ×9 right, 3 and 6 caught', V.checkNumber(step('c3', 'c3-accel').question, '16').code === 'linear-speed' && V.checkNumber(step('c3', 'c3-accel').question, '32').correct
  && V.checkNumber(step('c3', 'c3-factor').question, '9').correct && V.checkNumber(step('c3', 'c3-factor').question, '3').code === 'linear-speed' && V.checkNumber(step('c3', 'c3-factor').question, '6').code === 'doubled-factor');
ok('C4: 1000 right, 500 "wrong mass", 2000 "mass in acceleration"', V.checkNumber(step('c4', 'c4-force').question, '1000').correct && V.checkNumber(step('c4', 'c4-force').question, '500').code === 'wrong-mass' && V.checkNumber(step('c4', 'c4-force').question, '2000').code === 'mass-in-accel');
ok('a near miss gets a rounding nudge, not a misconception', V.checkNumber({ answer: 9.1925, tolerance: 0.06 }, '9.1').message.startsWith('Close'));

// ---- 8. Explanations ----
const need = ['sidecutRadius', 'edgeAngle', 'speed', 'skierMass', 'turnRadius', 'centripetalAcceleration', 'gForce', 'inwardForce', 'turnTime', 'model'];
ok('every control and result has an explanation with all five parts', need.every(k => HELP[k] && HELP[k].plain && HELP[k].equation && HELP[k].visual && HELP[k].ski && HELP[k].deeper));
ok('the model’s limits are stated (flex, snow, skidding; not real-world advice)', /flex/.test(HELP.turnRadius.deeper) && /skid/.test(HELP.turnRadius.deeper) && /not as advice/.test(HELP.model.ski));

// ---- 9. Progress ----
const mem = (() => { const m = {}; return { load: k => (m[k] ? JSON.parse(m[k]) : null), save: (k, v) => { m[k] = JSON.stringify(v); }, remove: k => { delete m[k]; } }; })();
const ev = { a: [], c: 0 };
let pr = createProgress({ storage: mem, studentId: 's', onAttempt: r => ev.a.push(r), onComplete: () => ev.c++ });
const c1 = C.challengeById('c1');
pr.predict(c1, c1.steps[0], 'b', false);
pr.predict(c1, c1.steps[0], 'a', true);
ok('a prediction is locked in once, recorded as an attempt with its misconception', pr.challenge('c1').predicted.choice === 'b' && ev.a.length === 1 && ev.a[0].questionId === 'c1-predict' && ev.a[0].misconception === 'bigger-is-tighter');
ok('prediction accuracy counts made and correct', pr.summary().predictions.made === 1 && pr.summary().predictions.correct === 0);
pr.ranSetup('c1', 'A'); pr.ranSetup('c1', 'B'); pr.compareDone('c1');
pr.hint('c1-radius'); pr.attempt('c1-radius', null, '7.7', false, { code: 'sin-for-cos' }); pr.attempt('c1-radius', null, '9.19', true, {});
pr.attempt('c1-ratio', null, 'Twice as big', true, {});
pr.explained('c1'); pr.finish('c1');
const s1 = pr.summary();
ok('attempts, hints, accuracy and one challenge done are tracked', s1.challengesDone === 1 && s1.hints === 1 && s1.questions.attempts === 3 && s1.questions.correct === 2 && s1.questions.firstTry === 1);
ok('points reward reasoning, not just results: prediction (even a wrong one) + run + explanation + 1 (needed a retry) + 2 (first try) = 6 of 7', challengePoints(c1, pr.challenge('c1'), pr.question) === 6 && maxPoints(c1) === 7, challengePoints(c1, pr.challenge('c1'), pr.question));
ok('geometry is mastered after Sidecut Detective with no solutions viewed', s1.concepts.includes('geometry') && !s1.concepts.includes('trigonometry'));
const c2 = C.challengeById('c2'), tgt = c2.steps.find(s => s.mode === 'target');
pr.simAttempt(c2, tgt, { ...c2.initialConfiguration, edgeAngle: 30 }, false, 'R = 13.9 m'); pr.simAttempt(c2, tgt, { ...c2.initialConfiguration, edgeAngle: 41.5 }, true, 'R = 12.0 m');
ok('simulator attempts are counted and sent (c2-sim: 2 tries, then right)', pr.summary().simAttempts === 2 && ev.a.filter(a => a.questionId === 'c2-sim').map(a => a.correct).join() === 'false,true');
const c5p = C.challengeById('c5');
pr.simAttempt(c5p, run5, designs[0], true, 'design');
ok('a submitted design is kept, with a key for its "show your maths" question', pr.challenge('c5').design.sidecutRadius === 20 && pr.challenge('c5').designKey === '20.0-60.0-10.0-65.0');
pr.setConfig({ speed: 14 }); pr.saveSetup('Fast GS', { sidecutRadius: 27, edgeAngle: 45, speed: 18, skierMass: 70 }); pr.setCompare('A', P.DEFAULTS);
for (const c of C.CHALLENGES) pr.finish(c.id);
ok('complete after five challenges; onComplete fires once', pr.summary().complete && ev.c === 1 && (pr.finish('c5'), ev.c === 1));
await new Promise(r => setTimeout(r, 450));   // config saves are debounced
pr = createProgress({ storage: mem, studentId: 's' });
ok('progress, saved setups, compare slot and the last config survive a reload, per student', pr.summary().challengesDone === 5 && pr.state.saved[0].name === 'Fast GS' && pr.state.compare.A.speed === 10 && pr.config.speed === 14
  && createProgress({ storage: mem, studentId: 'other' }).summary().challengesDone === 0);
ok('saved setups are clamped and capped at 12', (() => { for (let i = 0; i < 15; i++) pr.saveSetup('x' + i, { speed: 99 }); return pr.state.saved.length === 12 && pr.state.saved[0].config.speed === 20; })());
pr.reset();
ok('reset clears everything back to the defaults', pr.summary().challengesDone === 0 && pr.state.saved.length === 0 && JSON.stringify(pr.config) === JSON.stringify(P.DEFAULTS));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
