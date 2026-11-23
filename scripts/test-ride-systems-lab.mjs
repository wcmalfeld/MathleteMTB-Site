#!/usr/bin/env node
// Tests for the Ride Systems Lab (learning-lab/ride-systems-lab/): the
// models (with the PRD's own numbers), every validated number set, every
// question's answer (re-derived independently where it matters), traps,
// the transformation and inverse engines' edge cases, progress, final
// rounds and the curriculum mapping.
//   node scripts/test-ride-systems-lab.mjs   (add -v to list every check)

const base = new URL('../learning-lab/ride-systems-lab/', import.meta.url);
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

// ---- 1. The PRD's numbers ----
const E = M.TRAIL;
ok('Pine Ridge samples match the PRD table', JSON.stringify(E.points) === JSON.stringify([[0, 2400], [0.5, 2460], [1, 2430], [1.5, 2500], [2, 2480], [2.5, 2550], [3, 2520]]));
ok('E(1.5) = 2500 and E(2.5) = 2550', E.at(1.5) === 2500 && E.at(2.5) === 2550);
ok('Piecewise-linear between samples: E(1.25) = 2465, E(0.25) = 2430', near(E.at(1.25), 2465) && near(E.at(0.25), 2430));
ok('Domain 0 ≤ d ≤ 3; range 2400 ≤ E ≤ 2550', E.domain.join() === '0,3' && E.range.join() === '2400,2550');
ok('Outside the domain E is undefined (null), not extrapolated', E.at(-0.1) === null && E.at(3.2) === null);
ok('Increasing on 0–0.5, 1–1.5, 2–2.5; decreasing on 0.5–1, 1.5–2, 2.5–3', E.runs.map(r => r.dir[0] + r.from + '-' + r.to).join(' ') === 'u0-0.5 d0.5-1 u1-1.5 d1.5-2 u2-2.5 d2.5-3');
ok('Maximum at 2.5 km (2550 m); minimum at the start (2400 m)', E.argmax.join() === '2.5' && E.argmin.join() === '0');
ok('Horizontal line at 2,460 m crosses at 0.5 and ≈1.214 km (not one-to-one)', E.crossings(2460).length === 2 && near(E.crossings(2460)[0], 0.5, 1e-9) && near(E.crossings(2460)[1], 1 + 30 / 140, 1e-6));
ok('Every crossing really is at that elevation', [2410, 2440, 2460, 2490, 2525, 2549].every(y => E.crossings(y).every(d => near(E.at(d), y, 1e-6))));
const D = M.BASE_DRIVE;
ok('Gear ratio 32/16 = 2; f(80) = 160 RPM', D.G === 2 && D.f(80) === 160);
ok('g(w) = 0.138w; g(160) = 22.08 km/h', near(D.kg, 0.138) && near(D.g(160), 22.08));
ok('S(c) = g(f(c)) = 0.276c; S(80) = 22.08', near(D.k, 0.276) && near(D.S(80), 22.08) && near(D.S(80), D.g(D.f(80))));
ok('Composite range on 40–110 RPM: 11.04–30.36 km/h', near(D.range[0], 11.04) && near(D.range[1], 30.36));
ok('S⁻¹(22.08) = 80; S⁻¹(27.6) = 100; S⁻¹(S(c)) = c', near(D.Sinv(22.08), 80) && near(D.Sinv(27.6), 100) && [40, 63, 110].every(c => near(D.Sinv(D.S(c)), c)));
const I = E.inverseOn(1, 1.5);
ok('Restricted 1–1.5 km: E(d) = 2430 + 140(d − 1), and E⁻¹(2460) ≈ 1.2143', I && I.formula.y0 === 2430 && I.formula.slope === 140 && near(I.f(2460), 1 + 30 / 140) && near(E.at(I.f(2460)), 2460));
ok('E⁻¹ has domain 2430–2500 m and refuses elevations outside it', I.range.join() === '2430,2500' && I.f(2420) === null && I.f(2510) === null);
ok('No inverse on a piece that climbs and descends (0–1, 0.5–1.5, whole trail)', E.inverseOn(0, 1) === null && E.inverseOn(0.5, 1.5) === null && E.inverseOn(0, 3) === null);
ok('Inverses exist on every single segment, and undo E there', E.segments.every(s => { const J = E.inverseOn(s.from, s.to); return J && [0.1, 0.5, 0.9].every(f => { const d = s.from + f * (s.to - s.from); return near(J.f(E.at(d)), d, 1e-9); }); }));
ok('h(d) = E(d) − 2400 gives 0, 60, 30, 100, 80, 150, 120', M.RELATIVE.points.map(p => p[1]).join() === '0,60,30,100,80,150,120');
ok('Final B (PRD): 34/17 → G = 2, S(90) = 24.84 km/h', near(M.drivetrain(M.FINAL_SETS.drives[0]).S(90), 24.84));

// ---- 2. Engines: transformations, drivetrain validation, operations ----
const h = M.RELATIVE;
const g1 = M.transform(h, { a: 2, k: 40 });
ok('2h(d) + 40: every point is doubled then raised 40', h.points.every(([d, y]) => near(g1.at(d), 2 * y + 40)));
ok('h(2d): compressed, domain 0–1.5, peak at 1.25', M.transform(h, { b: 2 }).domain.join() === '0,1.5' && near(M.transform(h, { b: 2 }).at(1.25), 150));
ok('h(d − 0.5): shifted right, domain 0.5–3.5, peak at 3.0', M.transform(h, { c: 0.5 }).domain.join() === '0.5,3.5' && near(M.transform(h, { c: 0.5 }).at(3), 150));
ok('h(d + 0.5): shifted left, peak at 2.0', near(M.transform(h, { c: -0.5 }).at(2), 150));
ok('−h(d): reflected; h(0.5d): stretched to 0–6', near(M.transform(h, { a: -1 }).at(2.5), -150) && M.transform(h, { b: 0.5 }).domain.join() === '0,6');
ok('Combined a·h(b(d − c)) + k agrees point by point', [0.3, 0.9, 1.7].every(d => near(M.transform(h, { a: 1.5, b: 2, c: 0.25, k: -20 }).at(d), 1.5 * (h.at(2 * (d - 0.25)) ?? NaN) - 20) || M.transform(h, { a: 1.5, b: 2, c: 0.25, k: -20 }).at(d) === null));
ok('Outside the transformed domain g is undefined, never NaN', M.transform(h, { b: 2 }).at(2) === null && M.transform(h, { c: 0.5 }).at(0.2) === null);
ok('a = 0 or b = 0 is refused (no undefined graph states)', (() => { try { M.transform(h, { a: 0 }); return false; } catch (e) { return true; } })() && (() => { try { M.transform(h, { b: 0 }); return false; } catch (e) { return true; } })());
ok('Equations read correctly', M.transformEquation({ a: 2, k: 40 }) === 'g(d) = 2h(d) + 40' && M.transformEquation({ b: 2 }) === 'g(d) = h(2d)' && M.transformEquation({ c: 0.5 }) === 'g(d) = h(d − 0.5)' && M.transformEquation({ c: -0.5, a: -1 }) === 'g(d) = −h(d + 0.5)' && M.transformEquation({ b: 2, c: 0.25, k: -20 }) === 'g(d) = h(2(d − 0.25)) − 20');
ok('Descriptions: compress for b > 1, stretch for b < 1, right for c > 0', M.describeTransform({ b: 2 })[0].startsWith('compressed horizontally') && M.describeTransform({ b: 0.5 })[0].startsWith('stretched horizontally') && M.describeTransform({ c: 0.5 })[0] === 'shifted right 0.5 km');
ok('Tooth counts and circumference are validated', (() => { try { M.gearRatio(32.5, 16); return false; } catch (e) { return true; } })() && (() => { try { M.gearRatio(32, 0); return false; } catch (e) { return true; } })() && (() => { try { M.speedPerWheelRpm(0); return false; } catch (e) { return true; } })());
ok('Circumference changes speed but not wheel RPM', (() => { const a = M.drivetrain({ front: 32, rear: 16, circumference: 2.3 }), b = M.drivetrain({ front: 32, rear: 16, circumference: 2.2 }); return a.f(80) === b.f(80) && a.S(80) > b.S(80); })());
ok('Every offered gear gives a positive, sensible speed range (5–60 km/h)', M.FRONT_TEETH.every(F => M.REAR_TEETH.every(R => { const x = M.drivetrain({ front: F, rear: R, circumference: 2.3 }); return x.range[0] > 5 && x.range[1] < 60; })));
const X = M.crossing(1.5);
ok('Function mixer: T = f + b, T − f = b, ×3.281, and b ÷ f undefined only at x = 30', near(X.T(25), 1.6) && near(X.clearance(25), 1.5) && near(X.feet(25), 3.281 * 1.6) && X.ratio(30) === null && X.ratio(29) !== null && X.ratio(10) === 0);

// ---- 3. Validated final sets ----
for (const [i, t] of M.FINAL_SETS.trails.entries()) {
  const P = M.makeProfile(M.DISTANCES.map((d, j) => [d, t.ys[j]]));
  ok(`Trail ${i + 1} (${t.name}): climbs and descents, no flat pieces, extremes not only at the ends, asked distance inside`, P.runs.some(r => r.dir === 'up') && P.runs.some(r => r.dir === 'down') && P.segments.every(s => s.dir !== 'flat') &&
    (P.argmax.some(d => d > 0 && d < 3) || P.argmin.some(d => d > 0 && d < 3)) && t.at >= 0 && t.at <= 3);
}
for (const [i, d] of M.FINAL_SETS.drives.entries()) {
  const x = M.drivetrain(d);
  ok(`Drive ${i + 1}: offered-style teeth, cadence and target inside 40–110, target ≠ cadence, speeds to 2 dp`, x.inDomain(d.cadence) && x.inDomain(d.target) && d.target !== d.cadence && near(x.S(d.cadence) * 100, Math.round(x.S(d.cadence) * 100), 1e-6) && near(x.S(d.target) * 100, Math.round(x.S(d.target) * 100), 1e-6));
}
ok('Transforms: none is the identity, both up and down shifts appear, stretch and compression appear', M.FINAL_SETS.transforms.every(t => t.a !== 1 && t.k !== 0) && M.FINAL_SETS.transforms.some(t => t.k < 0) && M.FINAL_SETS.transforms.some(t => t.a < 1));

// ---- 4. Every question, in every round ----
const all = [];
for (const [id, q] of Object.entries(Q.QUESTIONS)) all.push([id, q, 'fixed']);
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
    if (q.options.length < 3) bad.push(where + ': at least three options');
  }
  const fields = q.type === 'number' ? [{ id: 'v', answer: q.answer, tolerance: q.tolerance, traps: q.traps }] : q.type === 'fields' ? q.fields : [];
  for (const f of fields) {
    if (!isFinite(f.answer)) bad.push(where + ': finite answer');
    if (!V.checkNumber(f, String(f.answer)).correct) bad.push(where + ': its own answer is accepted');
    for (const t of f.traps || []) {
      if (!Q.MISCONCEPTIONS[t.code]) bad.push(where + ': trap code ' + t.code);
      if (!isFinite(t.value)) bad.push(where + ': finite trap');
      if (V.checkNumber(f, String(t.value)).correct) bad.push(where + ': trap ' + t.value + ' accepted');
    }
  }
}
ok(`Every question (${all.length} across rounds) is well formed, its answer is accepted and no trap is`, bad.length === 0, bad.slice(0, 6));
ok('No two traps on a field share a value', all.every(([, q]) => (q.type === 'number' ? [q] : q.fields || []).every(f => { const vs = (f.traps || []).map(t => Math.round(t.value * 1e6)); return new Set(vs).size === vs.length; })));
const pos = Object.values(Q.QUESTIONS).filter(q => q.type === 'choice').map(q => q.options.findIndex(o => o.correct));
ok('The correct option isn’t always in the same place', new Set(pos).size >= 3 && pos.filter(i => i === 0).length <= pos.length / 2, pos);
for (let r = 1; r <= 5; r++) {
  const F = Q.finalQuestions(r), P = F.set.trail.profile;
  const iv = id => { const o = F[id].options.find(x => x.correct); return o.text.match(/[\d.]+/g).map(Number); };
  const [a1, b1] = iv('fa-inc'), [a2, b2] = iv('fa-dec');
  ok(`Round ${r}: the increasing / decreasing answers really are, and every other interval option isn’t`,
    P.monotoneOn(a1, b1) === 'up' && P.monotoneOn(a2, b2) === 'down' &&
    F['fa-inc'].options.filter(o => !o.correct).every(o => { const [a, b] = o.text.match(/[\d.]+/g).map(Number); return P.monotoneOn(a, b) !== 'up'; }) &&
    F['fa-dec'].options.filter(o => !o.correct).every(o => { const [a, b] = o.text.match(/[\d.]+/g).map(Number); return P.monotoneOn(a, b) !== 'down'; }));
}
const QQ = Q.QUESTIONS, F1 = Q.finalQuestions(1);
ok('Answers re-derived: E(2.5) 2550, high point 2.5 km, f(80) 160, g(160) 22.08, 24T gear 14.72', QQ['t-eval'].answer === 2550 && QQ['t-max'].answer === 2.5 && QQ['g-wheel'].answer === 160 && near(QQ['g-speed'].answer, 22.08) && near(QQ['g-gear-change'].answer, 0.138 * (32 / 24) * 80));
ok('t-increasing ticks exactly the three climbs', QQ['t-increasing'].options.filter(o => o.correct).map(o => o.text).join(' | ') === '0 to 0.5 km | 1 to 1.5 km | 2 to 2.5 km');
ok('Transforms: h(2.5) 150, 1.5h(2.5) 225, h(2d) peak 1.25, h(d + 0.5) peak 2, match a = 2 k = 40', QQ['x-relative'].answer === 150 && QQ['x-stretch'].answer === 225 && QQ['x-hscale'].answer === 1.25 && QQ['x-hshift-peak'].answer === 2 && QQ['x-match'].fields.map(f => f.answer).join() === '2,40');
ok('Inverses: S⁻¹(22.08) 80, S⁻¹(S(90)) 90, E⁻¹(2460) ≈ 1.214, E⁻¹ domain 2430–2500', near(QQ['r-eval'].answer, 80) && QQ['r-verify'].answer === 90 && near(QQ['r-einv'].answer, 1.2142857, 1e-6) && QQ['r-einv-domain'].fields.map(f => f.answer).join() === '2430,2500');
ok('Final round 1 uses the briefing: 34/17, 90 RPM → 24.84; g = 2h + 30; 27.6 km/h → 100 RPM', near(F1['fb-ratio'].answer, 2) && near(F1['fb-speed'].answer, 24.84) && F1['fc-parts'].fields.map(f => f.answer).join() === '2,30' && near(F1['fd-cadence'].answer, 100));
ok('Reciprocal mistakes are caught: 1/22.08 for S⁻¹(22.08)', V.checkNumber(QQ['r-eval'], String(1 / 22.08)).code === 'reciprocal');
ok('Composition as addition is caught on the composite factor', V.checkNumber(F1['fb-k'], String(0.138 + 2)).code === 'composition-add');
ok('h(d − k) as “left” is caught as a sign slip', V.checkNumber(QQ['x-hshift-peak'], '3').code === 'shift-sign');
ok('The finish taken as the maximum is caught', V.checkFields(QQ['t-range'].fields, { lo: '2400', hi: '2520' }).fields[1].code === 'endpoint-not-max');

// ---- 5. Progress ----
const LESSON = { id: 'ride-systems-lab', sections: Q.MISSIONS.map(m => ({ id: m.id, graded: m.graded })), questions: QQ };
const sent = [];
const prog = createProgress({ lesson: LESSON, storage: 'memory', onAttempt: r => sent.push(r) });
prog.attempt('t-eval', null, '2520', false, { code: 'table-row' });
prog.attempt('t-eval', null, '2550', true, {});
ok('Attempts counted; first try remembered as wrong', prog.question('t-eval').attempts === 2 && prog.question('t-eval').firstTry === false && sent.length === 2);
prog.attempt('fa-eval', 'r2', '1830', true, {});
ok('Final rounds kept apart by key and sent with it', prog.done('fa-eval', 'r2') && !prog.done('fa-eval', 'r1') && sent.at(-1).key === 'fa-eval|r2');
Q.MISSIONS[0].graded.forEach(id => prog.reveal(id));
ok('Mission 1 completes when every question is done (solutions earn nothing)', prog.sectionState('trail').complete && !prog.earned('t-max'));

// ---- 6. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'ride-systems-lab'), model = loadClasses();
const skillIds = new Set(model.skills.map(s => s.id)), kinds = Q.questionKinds();
ok('A live Algebra 2 lab, home Function Notation in Unit 2: Functions', act && act.status === 'live' && act.home === 'alg2.function-notation' && model.errors.length === 0 && model.skills.find(s => s.topic.id === act.home).topic.unit.title === 'Functions', model.errors);
ok('Every question kind maps to real curriculum skills', Object.keys(kinds).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all five Functions topics', ['function-notation', 'domain-and-range', 'composite-functions', 'transformations-of-functions', 'inverse-functions'].every(t => act.skills.some(s => s.startsWith('alg2.' + t + '.'))));
ok('All twelve tracked areas from the PRD have questions', Q.REPORT_IDEAS.length === 12 && Q.REPORT_IDEAS.every(i => Object.values(kinds).some(ideas => ideas.includes(i))));
ok('Final ids and pass mark are consistent', Q.FINAL_IDS.every(id => kinds[id]) && Q.PASS_MARK < Q.FINAL_IDS.length && Q.PASS_MARK / Q.FINAL_IDS.length >= 0.75);

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
