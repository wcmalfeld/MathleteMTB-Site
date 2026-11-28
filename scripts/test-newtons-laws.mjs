#!/usr/bin/env node
// Tests for the Newton's Laws lesson (learning-lab/newtons-laws/): the
// physics (with the PRD's own worked examples), the Force Lab model and
// ride, every question's answer (re-derived here independently), answer
// checking, free-body diagram grading, progress, retakes and mastery.
//   node scripts/test-newtons-laws.mjs   (add -v to list every check)

const base = new URL('../learning-lab/newtons-laws/', import.meta.url);
const P = await import(new URL('logic/physics.js', base));
const L = await import(new URL('logic/lesson.js', base));
const kit = new URL('../learning-lab/lesson-kit/', import.meta.url);
const V = await import(new URL('validate.js', kit));
const { createProgress: kitProgress } = await import(new URL('progress.js', kit));
const LESSON = { id: 'newtons-laws', sections: L.SECTIONS, questions: L.QUESTIONS, checkIds: L.CHECK_IDS, mastery: L.mastery };
const createProgress = o => kitProgress({ lesson: LESSON, ...o });
const { gradeForces } = await import(new URL('components/forces.js', base));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
const g = 9.81, sin = d => Math.sin(d * Math.PI / 180), cos = d => Math.cos(d * Math.PI / 180);

// ---- 1. The PRD's worked examples ----
ok('PRD 4.3: 80 kg weighs 784.8 N', near(P.weight(80), 784.8, 1e-9));
ok('PRD 4.4: 200 N forward, 50 N back → 150 N', P.netForce(200, 50) === 150);
ok('PRD 6.3: 160 N on 80 kg → 2 m/s²', P.acceleration(160, 80) === 2);
ok('PRD 6.4: −240 N on 80 kg → −3 m/s²', P.acceleration(-240, 80) === -3);
ok('PRD 10.1 Q3: 150 N on 75 kg → 2 m/s²', P.acceleration(150, 75) === 2);
const q8 = P.forceLab({ mass: 75, traction: 240, resistance: 45, braking: 0, angle: 5 });
ok('PRD 10.1 Q8: Fg∥ ≈ 64.1 N, F_net ≈ 130.9 N, a ≈ 1.75 m/s²', P.fmt(q8.gravityParallel, 1) === '64.1' && P.fmt(q8.netForce, 1) === '130.9' && P.fmt(q8.acceleration, 2) === '1.75', [q8.gravityParallel, q8.netForce, q8.acceleration]);
const fc = P.forceLab({ mass: 85, traction: 300, resistance: 55, braking: 0, angle: 8 });
ok('PRD 10.2 final: 85 kg, 8°, 300 N, 55 N → a ≈ 1.52 m/s²', near(fc.acceleration, (300 - 55 - 85 * g * sin(8)) / 85, 1e-12) && P.fmt(fc.acceleration, 2) === '1.52', fc.acceleration);

// ---- 2. Physics functions ----
ok('Incline components: mg sin θ and mg cos θ', near(P.slopeParallel(80, 10), 80 * g * sin(10)) && near(P.slopePerpendicular(80, 10), 80 * g * cos(10)));
ok('Components rebuild the weight: (mg sin θ)² + (mg cos θ)² = (mg)²', [-10, 0, 5, 15, 30].every(t => near(P.slopeParallel(70, t) ** 2 + P.slopePerpendicular(70, t) ** 2, (70 * g) ** 2, 1e-6)));
ok('Flat ground: no gravity along the trail, N = mg', P.slopeParallel(80, 0) === 0 && near(P.normalForce(80, 0), 784.8));
ok('Downhill: gravity along the trail is negative (it helps)', P.slopeParallel(80, -8) < 0);
ok('No division by zero: a with m = 0 or bad input is NaN, never Infinity', Number.isNaN(P.acceleration(100, 0)) && Number.isNaN(P.acceleration('x', 80)) && Number.isNaN(P.massFor(10, 0)));
ok('F = ma round-trips: force, mass, acceleration', near(P.forceFor(80, 2), 160) && near(P.massFor(160, 2), 80));
ok('PRD 9.2 controls: ranges and defaults', JSON.stringify(P.LIMITS) === JSON.stringify({ mass: [45, 120, 80, 1], traction: [0, 350, 180, 5], braking: [0, 300, 0, 5], resistance: [0, 120, 40, 5], angle: [-10, 15, 0, 1] }));
const clamped = P.normalizeConfig({ mass: 500, traction: -9, braking: 'x', resistance: 1e9, angle: -40 });
ok('Bad input is clamped into range (or defaulted)', clamped.mass === 120 && clamped.traction === 0 && clamped.braking === 0 && clamped.resistance === 120 && clamped.angle === -10);
const d = P.forceLab(P.DEFAULTS);
ok('Defaults: 180 − 0 − 40 − 0 = 140 N, a = 1.75 m/s²', d.netForce === 140 && d.acceleration === 1.75 && d.trend === 'speeding-up');
ok('PRD 9.3 net force formula holds across the controls', (() => { for (let m = 45; m <= 120; m += 25) for (let t = -10; t <= 15; t += 5) for (const [tr, br, rs] of [[0, 0, 0], [350, 0, 120], [100, 300, 40]]) {
  const r = P.forceLab({ mass: m, traction: tr, braking: br, resistance: rs, angle: t });
  if (!near(r.netForce, tr - br - rs - m * g * sin(t), 1e-9) || !near(r.acceleration, r.netForce / m, 1e-12) || !near(r.normal, m * g * cos(t), 1e-9)) return false; } return true; })());
ok('Balanced: traction = resistance on the flat → steady', P.forceLab({ mass: 80, traction: 40, resistance: 40, braking: 0, angle: 0 }).trend === 'steady');
ok('Negative net force → negative acceleration and "slowing"', (() => { const r = P.forceLab({ mass: 80, traction: 0, braking: 240, resistance: 0, angle: 0 }); return r.acceleration === -3 && r.trend === 'slowing'; })());

// ---- 3. The ride (deterministic steps) ----
const ride = (cfg, secs) => { let s = { t: 0, v: P.START_SPEED, x: 0 }; for (let i = 0; i < Math.round(secs * 60); i++) s = P.step(s, cfg, 1 / 60); return s; };
const steady = ride({ mass: 80, traction: 40, resistance: 40, braking: 0, angle: 0 }, 10);
ok('First law: zero net force keeps the speed exactly', near(steady.v, P.START_SPEED, 1e-9) && near(steady.x, P.START_SPEED * 10, 1e-6));
const acc = ride(P.DEFAULTS, 4);
ok('Constant acceleration: v = v₀ + at', near(acc.v, P.START_SPEED + 1.75 * 4, 1e-6));
const twice = [ride(P.DEFAULTS, 3), ride(P.DEFAULTS, 3)];
ok('Deterministic: the same ride twice gives the same result', twice[0].v === twice[1].v && twice[0].x === twice[1].x);
const braked = ride({ mass: 80, traction: 0, braking: 240, resistance: 0, angle: 0 }, 5);
ok('Braking stops the rider and holds them (never rolls backward)', braked.v === 0 && braked.stopped && near(braked.x, P.START_SPEED ** 2 / (2 * 3), 0.1), braked);
const capped = ride({ mass: 45, traction: 350, braking: 0, resistance: 0, angle: -10 }, 30);
ok('Speed is capped at the model’s maximum', capped.v === P.MAX_SPEED && capped.capped);

// ---- 4. Every question: answers re-derived, traps distinct ----
const Q = L.QUESTIONS;
ok('Weight question: 65 kg → 637.65 N', near(Q['weight-calc'].answer, 65 * g, 1e-9));
ok('Net force question: 260 − 90 = 170 N', Q['net-calc'].answer === 170);
ok('Acceleration question: 225 ÷ 90 = 2.5', near(Q['accel-calc'].answer, 2.5));
ok('Braking question: −280 ÷ 70 = −4', Q['brake-calc'].answer === -4);
ok('Slope components: 80 kg on 10°', near(Q['slope-components'].fields[0].answer, 80 * g * sin(10)) && near(Q['slope-components'].fields[1].answer, 80 * g * cos(10)));
ok('Lab question: (200 − 40) ÷ 80 = 2.0', near(Q['lab-accel'].answer, 2));
ok('Knowledge check Q7: 784.8 N', near(Q['kc-7'].answer, 784.8));
const k8 = Q['kc-8'].fields;
ok('Knowledge check Q8 fields match the Force Lab model', near(k8[0].answer, q8.gravityParallel) && near(k8[1].answer, q8.netForce) && near(k8[2].answer, q8.acceleration));
const f8 = Q['final-calc'].fields;
ok('Final challenge fields match the Force Lab model', near(f8[0].answer, fc.gravityParallel) && near(f8[1].answer, fc.netForce) && near(f8[2].answer, fc.acceleration));
const choices = Object.entries(Q).filter(([, q]) => q.type === 'choice' && q.options);
ok('Every multiple-choice question has exactly one right answer and feedback on every option', choices.every(([, q]) => q.options.filter(o => o.correct).length === 1 && q.options.every(o => o.feedback)), choices.filter(([, q]) => q.options.filter(o => o.correct).length !== 1).map(([id]) => id));
ok('PRD 10.1: the knowledge check has 8 questions, with the PRD’s right answers', L.CHECK_IDS.length === 8 &&
  ['b', 'b', 'b', 'a', 'b', 'b'].every((a, i) => Q['kc-' + (i + 1)].options.find(o => o.correct).id === a));
const numeric = Object.entries(Q).flatMap(([id, q]) => q.type === 'number' ? [[id, q]] : q.type === 'fields' ? q.fields.map(f => [id + '.' + f.id, f]) : []);
ok('Every numeric answer is accepted at its own value and when rounded within tolerance', numeric.every(([, f]) => V.checkNumber(f, String(f.answer)).correct && V.checkNumber(f, P.fmt(f.answer, f.tolerance >= 0.1 ? 1 : 2)).correct), numeric.filter(([, f]) => !V.checkNumber(f, P.fmt(f.answer, f.tolerance >= 0.1 ? 1 : 2)).correct).map(([id]) => id));
ok('No trap is itself the right answer, and each trap triggers its message', numeric.every(([, f]) => (f.traps || []).every(t => !near(t.value, f.answer, f.tolerance) && V.checkNumber(f, String(t.value)).code === t.code)),
  numeric.flatMap(([id, f]) => (f.traps || []).filter(t => V.checkNumber(f, String(t.value)).code !== t.code).map(t => id + ':' + t.code)));
ok('Answer parsing: "784.8 N", "−4", "2.5 m/s²" read as numbers', V.parseNumber('784.8 N').value === 784.8 && V.parseNumber('−4').value === -4 && V.parseNumber('2.5 m/s²').value === 2.5);
ok('Every question has a solution and a prompt', Object.entries(Q).filter(([, q]) => q.type !== 'forces' && q.type !== 'task' && !q.dynamic).every(([, q]) => q.solution && q.prompt));
ok('Every graded item in a section is a real question', L.SECTIONS.every(s => s.graded.every(id => Q[id])));
ok('Every question in the lesson appears somewhere (a block, an activity or a section’s list)', Object.keys(Q).filter(id => id !== 'fbd-net').every(id => L.SECTIONS.some(s => s.graded.includes(id))));
ok('Every question practices at least one idea', Object.values(Q).every(q => q.ideas && q.ideas.length));
ok('PRD 3: seven sections, 45–60 minutes in all', L.SECTIONS.length === 7 && (() => { const t = L.SECTIONS.reduce((n, s) => n + s.minutes, 0); return t >= 45 && t <= 60; })());
ok('PRD 2: 14 learning objectives', L.OBJECTIVES.length === 14);
ok('PRD 11: three levels (Explore, Apply, Engineer), and both kinds of level block are used', L.LEVELS.map(l => l.id).join() === 'explore,apply,engineer' &&
  ['explore', 'engineer'].every(lv => L.SECTIONS.some(s => s.blocks.some(b => b.t === 'level' && b.level === lv))));

// ---- 5. Free-body diagrams ----
for (const [id, sc] of Object.entries(L.SCENARIOS)) {
  ok(`FBD ${id}: the correct diagram passes`, gradeForces(id, sc.correct).correct);
  const extra = sc.choices.find(k => !sc.correct[k]);
  ok(`FBD ${id}: an extra force (${extra}) fails, naming it`, (r => !r.correct && r.code === 'extra-' + extra)(gradeForces(id, { ...sc.correct, [extra]: sc.dirs[0] })));
  const [k1] = Object.keys(sc.correct), wrongDir = sc.dirs.find(dd => dd !== sc.correct[k1]);
  ok(`FBD ${id}: a wrong direction fails, naming the force`, (r => !r.correct && r.code === 'direction-' + k1)(gradeForces(id, { ...sc.correct, [k1]: wrongDir })));
  const missing = { ...sc.correct }; delete missing[Object.keys(sc.correct).pop()];
  ok(`FBD ${id}: a missing force fails`, gradeForces(id, missing).code === 'missing');
  ok(`FBD ${id}: every correct force has an explanation, every wrong one a reason`, Object.keys(sc.correct).every(k => sc.why[k]) && sc.choices.filter(k => !sc.correct[k]).every(k => sc.not[k]));
}
ok('FBD: gravity is always straight down, the normal force perpendicular to the surface', Object.values(L.SCENARIOS).every(sc => sc.correct.gravity === 'down' && sc.correct.normal === (sc.tilt ? 'perp' : 'up')));

// ---- 6. Progress, retakes and mastery ----
const sent = [], done = [];
const pr = createProgress({ storage: 'memory', onAttempt: r => sent.push(r), onComplete: s => done.push(s) });
pr.attempt('weight-calc', null, '600', false, {}); pr.attempt('weight-calc', null, '637.7', true, {});
const wr = pr.question('weight-calc');
ok('Progress: attempts, first try and answer are recorded', wr.attempts === 2 && wr.firstTry === false && wr.correct && wr.answer === '637.7');
ok('Progress: every attempt is sent to the host, with its kind', sent.length === 2 && sent[1].questionId === 'weight-calc' && sent[1].correct === true);
pr.attempt('weight-calc', null, '1', false, {});
ok('Progress: a finished question takes no more attempts', pr.question('weight-calc').attempts === 2 && sent.length === 2);
const answerAll = (round, rightIds) => L.CHECK_IDS.forEach(id => pr.attempt(id, pr.checkKey(round), 'x', rightIds.includes(id), {}));
answerAll(1, L.CHECK_IDS.slice(0, 6));
ok('Knowledge check: 6 of 8 right first try is below mastery', pr.checkScore(1).right === 6 && !pr.mastery().criteria.find(c => c.id === 'check').met);
pr.retakeCheck(); answerAll(2, L.CHECK_IDS.slice(0, 7));
ok('Retake: a new round counts separately, and the best round (7/8) meets 80%', pr.checkScore(2).right === 7 && pr.bestCheck().round === 2 && pr.mastery().criteria.find(c => c.id === 'check').met);
ok('Retake: round attempts are sent with their own key', sent.some(r => r.key === 'kc-1|r2'));
ok('Mastery: not yet without the final challenge, a pair and a diagram', !pr.mastery().mastered);
pr.attempt('final-fbd', null, 'x', true, {}); pr.attempt('final-calc', null, 'x', true, {});
pr.attempt('pair-tire', null, 'x', true, {});
pr.attempt('fbd-climb', null, 'x', true, {});
ok('Mastery: a diagram without its net-force answer doesn’t count', !pr.mastery().criteria.find(c => c.id === 'fbd').met);
pr.attempt('fbd-net', 'climb', 'uphill', true, {});
ok('Mastery: all four PRD criteria met → mastered', pr.mastery().mastered, pr.mastery().criteria.map(c => c.id + ':' + c.met));
const pr2 = createProgress({ storage: 'memory' });
pr2.attempt('final-fbd', null, 'x', true, {}); pr2.reveal('final-calc');
ok('Mastery: reading the solution doesn’t count as solving it', !pr2.mastery().criteria.find(c => c.id === 'final').met);
ok('Sections: complete only when every graded item is answered', !pr.sectionState('forces').complete && (() => { ['forces-flat', 'net-calc', 'balanced'].forEach(id => pr.attempt(id, null, 'x', true, {})); return pr.sectionState('forces').complete; })());
L.SECTIONS.forEach(s => s.graded.forEach(id => { if (!pr.done(id, L.CHECK_IDS.includes(id) ? pr.checkKey() : null)) pr.reveal(id, L.CHECK_IDS.includes(id) ? pr.checkKey() : null); }));
ok('Completing every section fires onComplete once', done.length === 1 && pr.summary().complete);
const store = { data: {}, load(k) { return this.data[k] ? JSON.parse(this.data[k]) : null; }, save(k, v) { this.data[k] = JSON.stringify(v); } };
const a1 = createProgress({ storage: store }); a1.setLevel('engineer'); a1.attempt('accel-calc', null, '2.5', true, {}); a1.setData('lab-saved', [{ label: 'Heavy', config: { mass: 100 } }]); a1.write('final-cer-claim', 'I speed up');
const a2 = createProgress({ storage: store });
ok('Progress persists: level, answers, saved experiments and writing come back', a2.level === 'engineer' && a2.earned('accel-calc') && a2.getData('lab-saved')[0].label === 'Heavy' && a2.getData('lab-saved')[0].config.mass === 100 && a2.written('final-cer-claim') === 'I speed up');
ok('Activity data comes back as a copy (changing it doesn’t change the saved state)', (() => { const d = a2.getData('lab-saved'); d.push(1); return a2.getData('lab-saved').length === 1; })());
ok('Progress is kept per lesson (separate storage keys)', (() => { const st = { data: {}, load(k) { return this.data[k] ? JSON.parse(this.data[k]) : null; }, save(k, v) { this.data[k] = JSON.stringify(v); } }; createProgress({ storage: st }).write('x', 'y'); return Object.keys(st.data).every(k => k.startsWith('mathlete-newtons-laws:v1:')); })());
ok('Kinds for the account: every question id is a valid kind slug', Object.keys(L.questionKinds()).every(k => /^[a-z0-9-]+$/.test(k)));

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
