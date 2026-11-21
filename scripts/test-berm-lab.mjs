#!/usr/bin/env node
// Tests for Berm Lab (learning-lab/berm-lab/): the banked-turn physics engine
// (PRD 5, with the PRD's own worked examples), the force balance, flat
// corners, unit conversion, bad input, the corner geometry, every challenge
// answer (re-derived here independently), answer checking, and progress.
//   node scripts/test-berm-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/berm-lab/', import.meta.url);
const P = await import(new URL('logic/physics.js', base));
const S = await import(new URL('logic/simulation.js', base));
const C = await import(new URL('logic/challenges.js', base));
const V = await import(new URL('logic/validate.js', base));
const { HELP } = await import(new URL('logic/explain.js', base));
const { createProgress, challengePoints, maxPoints } = await import(new URL('logic/progress.js', base));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI, g = 9.81;

// ---- 1. The PRD's worked examples (in m/s, as the PRD states them) ----
ok('PRD 5.1: 8 m/s on a 6 m corner → a = 10.67 m/s²', near(P.calculateCentripetalAcceleration(8, 6), 64 / 6) && P.fmt(P.calculateCentripetalAcceleration(8, 6), 2) === '10.67');
ok('PRD 5.2: 80 kg, 8 m/s, 6 m → F = 853.3 N', P.fmt(P.calculateNetInwardForce(80, 8, 6), 1) === '853.3');
ok('PRD 5.3: lean = arctan(64 / 58.86) ≈ 47.4°', near(P.calculateLeanAngle(8, 6), deg(Math.atan(64 / 58.86))) && P.fmt(P.calculateLeanAngle(8, 6), 1) === '47.4');
ok('PRD 5.4: 6 m at 30° → matched speed √(6·9.81·tan 30°) ≈ 5.83 m/s ≈ 21.0 km/h', near(P.calculateIdealMatchedSpeed(6, 30), Math.sqrt(6 * g * Math.tan(rad(30)))) && P.fmt(P.calculateIdealMatchedSpeed(6, 30) * 3.6, 1) === '21.0');
ok('PRD 5.4: a flat corner has no matched speed (null, not 0)', P.calculateIdealMatchedSpeed(6, 0) === null);
ok('PRD 5.5: flat corner → μ_required = v²/(rg)', near(P.calculateRequiredGrip(8, 6, 0), 64 / (6 * g), 1e-12));
ok('PRD 5.5: at the matched speed the required grip is zero', near(P.calculateRequiredGrip(P.calculateIdealMatchedSpeed(6, 30), 6, 30), 0, 1e-12));
ok('PRD 5.6: distance πr, time πr/v', near(P.calculateTurnDistance(6), 6 * Math.PI) && near(P.calculateTurnDuration(6, 8), 6 * Math.PI / 8));
ok('PRD 4: defaults 6 m, 22 km/h, 25°, 80 kg, grip 0.45; ranges 3–12, 5–35, 0–45, 35–120, 0.2–0.8',
  JSON.stringify(P.DEFAULTS) === JSON.stringify({ cornerRadius: 6, speedKmh: 22, bermAngle: 25, totalMass: 80, availableGrip: 0.45 })
  && [['cornerRadius', 3, 12], ['speedKmh', 5, 35], ['bermAngle', 0, 45], ['totalMass', 35, 120], ['availableGrip', 0.2, 0.8]].every(([k, a, b]) => P.RANGES[k].min === a && P.RANGES[k].max === b));
ok('PRD 4.1: tight 4 m, middle 6 m, wide 8 m', P.LINES.map(l => l.radius).join() === '4,6,8');

// ---- 2. The force balance holds everywhere on the controls' grid ----
let bad = [];
for (let r = 3; r <= 12; r += 1.5) for (let kmh = 5; kmh <= 35; kmh += 5) for (let b = 0; b <= 45; b += 5) for (const m of [35, 80, 120]) {
  const R = P.berm({ cornerRadius: r, speedKmh: kmh, bermAngle: b, totalMass: m, availableGrip: 0.45 });
  const v = kmh / 3.6, q = v * v / (r * g), B = rad(b);
  const N = R.normalForce, f = R.frictionForce;
  // Horizontal (inward) and vertical components of N and f (f positive = up the slope, i.e. outward and up).
  const inward = N * Math.sin(B) - f * Math.cos(B), up = N * Math.cos(B) + f * Math.sin(B);
  if (!near(inward, m * v * v / r, 1e-7 * m * v * v / r + 1e-9) || !near(up, m * g, 1e-9 * m * g)) bad.push(['balance', r, kmh, b, m]);
  if (!near(R.requiredGrip, Math.abs(f) / N, 1e-12)) bad.push(['mu', r, kmh, b, m]);
  if (!near(R.requiredGrip, Math.abs(Math.tan(B - Math.atan(q))), 1e-9)) bad.push(['identity', r, kmh, b, m]);
  if (!near(R.leanAngle, deg(Math.atan(q)), 1e-9) || !near(R.netInwardForce, m * v * v / r, 1e-9 * m * v * v / r)) bad.push(['lean/F', r, kmh, b, m]);
  if (!(N > 0)) bad.push(['N>0', r, kmh, b, m]);
}
ok('force balance: N sin β − f cos β = mv²/r and N cos β + f sin β = mg, μ = |f|/N, everywhere on the grid (7×7×10×3)', bad.length === 0, bad.slice(0, 3));
ok('identity: μ_required = |tan(β − lean)| (zero exactly when the berm matches the lean)', bad.every(b => b[0] !== 'identity'));
ok('friction sign: slower than matched → up the berm (+); faster → down it (−)', P.calculateFrictionForce(80, 3, 6, 30) > 0 && P.calculateFrictionForce(80, 9, 6, 30) < 0);
ok('mass: a and μ unchanged; F, N and f scale with mass', (() => { const a = P.berm({ totalMass: 70 }), b = P.berm({ totalMass: 100 });
  return near(a.centripetalAcceleration, b.centripetalAcceleration) && near(a.requiredGrip, b.requiredGrip, 1e-12) && near(b.netInwardForce / a.netInwardForce, 100 / 70, 1e-12) && near(b.normalForce / a.normalForce, 100 / 70, 1e-12); })());
ok('radius: a wider line lowers a; doubling speed quadruples a', P.berm({ cornerRadius: 8 }).centripetalAcceleration < P.berm({ cornerRadius: 4 }).centripetalAcceleration
  && near(P.berm({ speedKmh: 20 }).centripetalAcceleration, 4 * P.berm({ speedKmh: 10 }).centripetalAcceleration, 1e-9));
ok('grip vs berm angle has its minimum at the matched angle arctan(v²/rg)', (() => { const v = 22 / 3.6; let best = [9, 0]; for (let b = 0; b <= 45; b += 0.01) { const m = P.calculateRequiredGrip(v, 6, b); if (m < best[0]) best = [m, b]; } return Math.abs(best[1] - P.calculateMatchedBermAngle(v, 6)) < 0.011; })());
ok('grip status: within / approaching (≥ 80% of available) / exceeds', P.gripStatus(0.2, 0.45) === 'within' && P.gripStatus(0.4, 0.45) === 'approaching' && P.gripStatus(0.45, 0.45) === 'approaching' && P.gripStatus(0.46, 0.45) === 'exceeds');
ok('grip margin = available − required', near(P.calculateGripMargin(0.3, 0.45), 0.15) && P.calculateGripMargin(Infinity, 0.45) === -Infinity);
ok('bermAngleWindow: |β − θ| ≤ arctan μ, clipped to the limit', (() => { const w = P.bermAngleWindow(25 / 3.6, 7, 0.4, 45); return near(w.matched - w.min, deg(Math.atan(0.4)), 1e-9) && w.max === 45
  && P.calculateRequiredGrip(25 / 3.6, 7, w.min) <= 0.4 + 1e-9 && P.calculateRequiredGrip(25 / 3.6, 7, w.min - 0.1) > 0.4; })());

// ---- 3. Bad input never divides by zero ----
ok('zero radius: a = ∞, μ = ∞, no crash', P.calculateCentripetalAcceleration(5, 0) === Infinity && P.calculateRequiredGrip(5, 0, 20) === Infinity && P.calculateCentripetalAcceleration(0, 0) === 0);
ok('NaN in → NaN out; zero speed → duration ∞', Number.isNaN(P.calculateCentripetalAcceleration(NaN, 3)) && P.calculateTurnDuration(6, 0) === Infinity);
ok('matched speed: null for flat, negative, ≥ 90° or bad radius', [P.calculateIdealMatchedSpeed(6, 0), P.calculateIdealMatchedSpeed(6, -5), P.calculateIdealMatchedSpeed(6, 90), P.calculateIdealMatchedSpeed(0, 30), P.calculateIdealMatchedSpeed('x', 30)].every(x => x === null));
ok('clamping: out-of-range and junk values land in range, on the step', P.clampVariable('bermAngle', 60) === 45 && P.clampVariable('speedKmh', 2) === 5 && P.clampVariable('availableGrip', 'x') === 0.2
  && P.clampVariable('cornerRadius', 6.04) === 6 && P.clampVariable('speedKmh', 22.3) === 22.5);
ok('berm() of garbage is still a valid, finite corner', (() => { const r = P.berm({ cornerRadius: 'x', speedKmh: -3, bermAngle: Infinity, totalMass: {}, availableGrip: null }); return isFinite(r.requiredGrip) && isFinite(r.netInwardForce) && r.normalForce > 0; })());
ok('the hardest corner on the controls (3 m, 35 km/h, flat) is still finite', isFinite(P.berm({ cornerRadius: 3, speedKmh: 35, bermAngle: 0 }).requiredGrip));

// ---- 4. Units ----
ok('22 km/h = 6.11 m/s = 13.67 mph; 20 km/h = 5.56 m/s', P.fmt(P.convertUnits(22, 'km/h', 'm/s'), 2) === '6.11' && P.fmt(P.convertUnits(22, 'km/h', 'mph'), 2) === '13.67' && P.fmt(P.convertUnits(20, 'km/h', 'm/s'), 2) === '5.56');
ok('berm() converts km/h to m/s before calculating', near(P.berm({ speedKmh: 18 }).speed, 5, 1e-12) && near(P.berm({ speedKmh: 18, cornerRadius: 5 }).centripetalAcceleration, 5, 1e-9) && P.berm({ speedKmh: 36 }).config.speedKmh === 35);
ok('degrees ↔ radians; mismatched units throw', near(P.convertUnits(180, 'deg', 'rad'), Math.PI) && (() => { try { P.convertUnits(1, 'kg', 'm/s'); return false; } catch (e) { return true; } })());

// ---- 5. Corner geometry ----
for (const r of [3, 6, 12]) {
  let worst = 0, perp = 0;
  for (let i = 0; i <= 500; i++) { const p = S.stateAt(r, Math.PI * r * i / 500); worst = Math.max(worst, Math.abs(Math.hypot(p.x, p.y) - r)); perp = Math.max(perp, Math.abs(p.tx * p.x + p.ty * p.y)); }
  ok(`r = ${r}: every point is r from the centre, velocity ⟂ radius`, worst < 1e-9 && perp < 1e-9, [worst, perp]);
}
ok('entry (r, 0) heading up; apex (0, −r) heading left; exit (−r, 0) heading down', (() => { const e = S.stateAt(6, 0), a = S.stateAt(6, 3 * Math.PI), x = S.stateAt(6, 6 * Math.PI);
  return near(e.x, 6) && near(e.ty, -1) && near(a.x, 0, 1e-9) && near(a.y, -6) && near(a.tx, -1, 1e-9) && near(x.x, -6) && near(x.ty, 1, 1e-9); })());
ok('normal points at the centre; position clamps to the arc', (() => { const p = S.stateAt(6, 5); return near(p.nx * -p.x + p.ny * -p.y, 6, 1e-9) && S.stateAt(6, -3).s === 0 && near(S.stateAt(6, 999).s, 6 * Math.PI); })());
ok('SVG path: two quarter arcs of radius r·k', (S.linePath(6, 10, 0, 0).match(/ A /g) || []).length === 2 && S.linePath(6, 10, 0, 0).includes('A 60.00 60.00') && S.linePath(0, 10, 0, 0) === '');
ok('vectors: |v| = speed, |a| = v²/r, |F| = m v²/r, both inward', (() => { const R = P.berm(P.DEFAULTS), w = S.vectorsAt(6, 4, R);
  return near(Math.hypot(w.velocity.x, w.velocity.y), R.speed, 1e-9) && near(Math.hypot(w.acceleration.x, w.acceleration.y), R.centripetalAcceleration, 1e-9) && (w.force.x * -w.position.x + w.force.y * -w.position.y) > 0; })());
ok('time through = πr / v', near(S.timeThrough(6, 5), 6 * Math.PI / 5) && S.timeThrough(6, 0) === Infinity);

// ---- 6. Challenges: every answer re-derived here ----
ok('six challenges in PRD order, beginner → advanced', C.CHALLENGES.map(c => c.title).join('|') === 'Pick Your Line|Speed Is Squared|Find the Berm Sweet Spot|Flat Corner vs. Berm|Does Weight Matter?|The Perfect Berm'
  && C.CHALLENGES.map(c => c.difficulty).join() === 'beginner,beginner,intermediate,intermediate,intermediate,advanced');
ok('every challenge: prediction first, an experiment, an explanation, and a takeaway', C.CHALLENGES.every(c => c.steps[0].type === 'predict' && c.steps.some(s => s.type === 'run') && c.steps.some(s => s.type === 'explain') && c.explanation && c.scenario && c.objective));
const step = (cid, kind) => C.challengeById(cid).steps.find(s => s.kind === kind);
const v22 = 22 / 3.6, v20 = 20 / 3.6, v10 = 10 / 3.6, v25 = 25 / 3.6;
ok('C1: middle line a = 6.11² / 6 = 6.22 m/s²; wide is the lowest; tight is 2× wide', near(step('c1', 'c1-accel').question.answer, v22 * v22 / 6, 1e-12) && P.fmt(v22 * v22 / 6, 2) === '6.22'
  && step('c1', 'c1-predict').question.options.find(o => o.correct).id === 'wide' && step('c1', 'c1-ratio').question.options.find(o => o.correct).id === 'double');
ok('C2: 20 km/h = 5.56 m/s; a = 5.14 m/s² = 4 × 1.29', near(step('c2', 'c2-convert').question.answer, v20, 1e-12) && near(step('c2', 'c2-accel').question.answer, v20 * v20 / 6, 1e-12) && near(v20 * v20 / 6, 4 * v10 * v10 / 6, 1e-12));
ok('C3: matched angle arctan(5.56² / 58.86) = 27.7°; the 25–35° band is right', near(step('c3', 'c3-angle').question.answer, deg(Math.atan(v20 * v20 / (6 * g))), 1e-12) && P.fmt(step('c3', 'c3-angle').question.answer, 1) === '27.7'
  && step('c3', 'c3-predict').question.options.find(o => o.correct).id === '25-35');
ok('C3 target: 27.5° or 28° hits ≈ 0 grip; 25° and 30° don’t', (() => { const r = C.challengeById('c3').steps.find(s => s.mode === 'target'), b = C.challengeById('c3').initialConfiguration;
  return C.evaluateRun(r, { ...b, bermAngle: 27.5 }).met && C.evaluateRun(r, { ...b, bermAngle: 28 }).met && !C.evaluateRun(r, { ...b, bermAngle: 25 }).met && !C.evaluateRun(r, { ...b, bermAngle: 30 }).met; })());
ok('C4: flat μ = v²/(rg) = 0.63; the 30° berm needs far less (0.04); flat is the right prediction', near(step('c4', 'c4-flat').question.answer, v22 * v22 / (6 * g), 1e-12) && P.fmt(step('c4', 'c4-flat').question.answer, 2) === '0.63'
  && P.berm({ ...P.DEFAULTS, bermAngle: 30 }).requiredGrip < 0.05 && step('c4', 'c4-predict').question.options.find(o => o.correct).id === 'flat');
ok('C5: same a, F(100 kg) = 100 v²/r = 622 N, same μ', near(step('c5', 'c5-force').question.answer, 100 * v22 * v22 / 6, 1e-9) && P.fmt(step('c5', 'c5-force').question.answer, 0) === '622'
  && step('c5', 'c5-grip').question.options.find(o => o.correct).id === 'same' && step('c5', 'c5-predict').question.options.find(o => o.correct).id === 'same-more');
ok('C6: flat fails (μ = 0.70 > 0.4); smallest workable angle = arctan(q) − arctan(0.4) = 13.3°', (() => { const q = v25 * v25 / (7 * g); return P.berm(C.challengeById('c6').initialConfiguration).requiredGrip > 0.4
  && near(step('c6', 'c6-min').question.answer, deg(Math.atan(q)) - deg(Math.atan(0.4)), 1e-9) && P.fmt(step('c6', 'c6-min').question.answer, 1) === '13.3'; })());
const c6 = C.challengeById('c6'), run6 = c6.steps.find(s => s.mode === 'design');
ok('C6: many valid designs (14°, 25°, 35°, 45° all pass); 0° and 13° fail', [14, 25, 35, 45].every(b => C.evaluateRun(run6, { ...c6.initialConfiguration, bermAngle: b }).met) && ![0, 13].some(b => C.evaluateRun(run6, { ...c6.initialConfiguration, bermAngle: b }).met));
ok('C6: the "show your maths" answers come from the student’s own design', (() => { const q = C.designQuestion(c6.steps.find(s => s.dynamic), { ...c6.initialConfiguration, bermAngle: 35 });
  return near(q.fields[0].answer, v25 * v25 / (7 * g), 1e-12) && near(q.fields[1].answer, Math.abs(Math.tan(rad(35) - Math.atan(v25 * v25 / (7 * g)))), 1e-9) && V.checkFields(q.fields, { q: '0.70', mu: '0' }).correct; })());
const clash = [];
for (const c of C.CHALLENGES) for (const s of c.steps) if (s.type === 'ask' && s.question.type === 'number') for (const t of s.question.traps || []) if (Math.abs(t.value - s.question.answer) <= s.question.tolerance) clash.push([s.kind, t.code]);
ok('no anticipated wrong answer (trap) is within tolerance of a right answer', clash.length === 0, clash);
ok('every trap and option code names a misconception the lab can explain', C.CHALLENGES.every(c => c.steps.every(s => !s.question || [...(s.question.traps || []), ...(s.question.options || [])].every(t => !t.code || C.MISCONCEPTIONS[t.code]))));
ok('every question has hints and a solution', C.CHALLENGES.every(c => c.steps.filter(s => s.type === 'ask').every(s => (s.question.hints || []).length >= 2 && (s.dynamic || s.question.solution))));
const kinds = C.questionKinds().map(k => k.kind);
ok('19 graded question kinds, all unique', new Set(kinds).size === kinds.length && kinds.length === 19, kinds);

// ---- 7. Checking answers ----
const qa = step('c1', 'c1-accel').question;
ok('C1: 6.22 right; 80.67 "used km/h"; 1.02 "unsquared"', V.checkNumber(qa, '6.22').correct && V.checkNumber(qa, '80.67').code === 'kmh-not-ms' && V.checkNumber(qa, '1.02').code === 'unsquared');
ok('C2: 5.56 right; 72 "converted the wrong way"', V.checkNumber(step('c2', 'c2-convert').question, '5.56').correct && V.checkNumber(step('c2', 'c2-convert').question, '72').code === 'convert-wrong-way');
const q3 = step('c3', 'c3-angle').question;
ok('C3: 27.7 right; 0.524 "tan, not the angle"; 0.48 "radians"', V.checkNumber(q3, '27.7').correct && V.checkNumber(q3, '0.524').code === 'ratio-not-angle' && V.checkNumber(q3, '0.483').code === 'radians-mode');
ok('C4: 0.63 right; 6.22 "acceleration, not the ratio"', V.checkNumber(step('c4', 'c4-flat').question, '0.63').correct && V.checkNumber(step('c4', 'c4-flat').question, '6.22').code === 'accel-not-ratio');
ok('C5: 622 right; 436 "wrong mass"; 981 "weight"', V.checkNumber(step('c5', 'c5-force').question, '622').correct && V.checkNumber(step('c5', 'c5-force').question, '436').code === 'wrong-mass' && V.checkNumber(step('c5', 'c5-force').question, '981').code === 'weight-not-inward');
ok('C6: 13.3 right; 35.1 "matched, not the minimum"; 21.8 "window width"', V.checkNumber(step('c6', 'c6-min').question, '13.3').correct && V.checkNumber(step('c6', 'c6-min').question, '35.1').code === 'matched-not-min' && V.checkNumber(step('c6', 'c6-min').question, '21.8').code === 'window-not-angle');

// ---- 8. Explanations ----
const need = ['cornerRadius', 'speedKmh', 'bermAngle', 'totalMass', 'availableGrip', 'centripetalAcceleration', 'netInwardForce', 'leanAngle', 'matchedSpeed', 'normalForce', 'frictionForce', 'requiredGrip', 'turnTime', 'gravity', 'centrifugal', 'model'];
ok('every control, result and vector has an explanation with all five parts', need.every(k => HELP[k] && HELP[k].plain && HELP[k].equation && HELP[k].visual && HELP[k].ski && HELP[k].deeper), need.filter(k => !HELP[k]));
ok('honesty: grip is illustrative, not safety advice; centrifugal isn’t taught as a real force', /not a measured tire/.test(HELP.availableGrip.plain) && /safety/.test(HELP.model.ski) && /no real outward/.test(HELP.centrifugal.plain));

// ---- 9. Progress ----
const mem = (() => { const m = {}; return { load: k => (m[k] ? JSON.parse(m[k]) : null), save: (k, v) => { m[k] = JSON.stringify(v); }, remove: k => { delete m[k]; } }; })();
const ev = { a: [], c: 0 };
let pr = createProgress({ storage: mem, studentId: 's', onAttempt: r => ev.a.push(r), onComplete: () => ev.c++ });
const c1 = C.challengeById('c1');
pr.predict(c1, c1.steps[0], 'tight', false);
ok('a prediction is locked in once and sent with its misconception', pr.challenge('c1').predicted.choice === 'tight' && ev.a.length === 1 && ev.a[0].questionId === 'c1-predict' && ev.a[0].misconception === 'tight-is-easier' && ev.a[0].module === 'berm-lab');
pr.ranSetup('c1', 'tight'); pr.ranSetup('c1', 'middle'); pr.ranSetup('c1', 'wide'); pr.compareDone('c1');
pr.attempt('c1-accel', null, '6.22', true, {}); pr.hint('c1-ratio'); pr.attempt('c1-ratio', null, 'Twice as big', true, {}); pr.explained('c1'); pr.finish('c1');
ok('points reward reasoning: 1 (prediction) + 1 (run) + 1 (explained) + 2 + 1 = 6 of 7', challengePoints(c1, pr.challenge('c1'), pr.question) === 6 && maxPoints(c1) === 7);
ok('geometry mastered after Pick Your Line', pr.summary().concepts.includes('geometry'));
const c3 = C.challengeById('c3'), t3 = c3.steps.find(s => s.mode === 'target');
pr.simAttempt(c3, t3, { ...c3.initialConfiguration, bermAngle: 20 }, false, 'x'); pr.simAttempt(c3, t3, { ...c3.initialConfiguration, bermAngle: 27.5 }, true, 'y');
ok('simulator tries counted and sent as c3-sim', pr.summary().simAttempts === 2 && ev.a.filter(a => a.questionId === 'c3-sim').map(a => a.correct).join() === 'false,true');
pr.simAttempt(c6, run6, { ...c6.initialConfiguration, bermAngle: 35 }, true, 'design');
ok('a submitted design is kept with its key', pr.challenge('c6').design.bermAngle === 35 && /^7\.00_25\.00_35\.00_80\.00_0\.40$/.test(pr.challenge('c6').designKey), pr.challenge('c6').designKey);
pr.setConfig({ bermAngle: 33 }); pr.saveSetup('Fast berm', { speedKmh: 30, bermAngle: 40 }); pr.setSetting('view', 'section');
for (const c of C.CHALLENGES) pr.finish(c.id);
ok('complete after six challenges; onComplete fires once', pr.summary().complete && ev.c === 1 && (pr.finish('c6'), ev.c === 1));
await new Promise(r => setTimeout(r, 450));
pr = createProgress({ storage: mem, studentId: 's' });
ok('progress, saved experiments, settings and the last config survive a reload, per student', pr.summary().challengesDone === 6 && pr.state.saved[0].name === 'Fast berm' && pr.config.bermAngle === 33 && pr.settings.view === 'section'
  && createProgress({ storage: mem, studentId: 'x' }).summary().challengesDone === 0);
pr.reset();
ok('reset clears everything', pr.summary().challengesDone === 0 && JSON.stringify(pr.config) === JSON.stringify(P.DEFAULTS));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
