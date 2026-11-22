#!/usr/bin/env node
// Tests for the Introduction to Physics lesson (learning-lab/intro-to-physics/):
// the content against the PRD, every grader (right answers pass, each kind of
// mistake fails with its own feedback), the written-work feedback, the
// completion rules and progress.
//   node scripts/test-intro-to-physics.mjs   (add -v to list every check)

const base = new URL('../learning-lab/intro-to-physics/', import.meta.url);
const L = await import(new URL('logic/lesson.js', base));
const G = await import(new URL('logic/grade.js', base));
const { createProgress: kitProgress } = await import(new URL('../lesson-kit/progress.js', base));
const LESSON = { id: 'intro-to-physics', sections: L.SECTIONS, questions: L.QUESTIONS, checkIds: L.CHECK_IDS, mastery: L.mastery };
const createProgress = o => kitProgress({ lesson: LESSON, storage: 'memory', ...o });

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };

// ---- 1. Content against the PRD ----
ok('PRD 3: seven sections, 35–45 minutes in all', L.SECTIONS.length === 7 && (t => t >= 35 && t <= 45)(L.SECTIONS.reduce((n, s) => n + s.minutes, 0)));
ok('PRD 2: 12 learning objectives', L.OBJECTIVES.length === 12);
ok('PRD 4.3: eight hotspots, the PRD’s eight', L.HOTSPOTS.map(h => h.id).join() === 'mountain,rider,front-wheel,tires,suspension,brakes,berm,jump');
ok('Every hotspot has a question, an explanation, a concept and where it’s studied, and sits on the picture', L.HOTSPOTS.every(h => h.q && h.text && h.concept && h.module && h.x > 0 && h.x < 100 && h.y > 0 && h.y < 100));
ok('Hotspots don’t overlap (at least 6% apart)', L.HOTSPOTS.every((a, i) => L.HOTSPOTS.every((b, j) => i === j || Math.hypot(a.x - b.x, (a.y - b.y) * 0.56) >= 6)));
ok('PRD 5.2: seven ride stages in order, each with what’s happening, 2+ concepts, an MTB link and a question', L.STAGES.length === 7 && L.STAGES.every((s, i) => s.n === i + 1 && s.happening && s.concepts.length >= 2 && s.mtb && s.investigate) && L.STAGES.every((s, i) => i === 0 || s.x > L.STAGES[i - 1].x));
ok('PRD 6.5: scenarios A–C match the PRD’s categories', ['matter', 'motion', 'interaction', 'energy'].every(k => L.CLASSIFY['classify-fork'].fits.includes(k)) &&
  L.CLASSIFY['classify-descent'].fits.sort().join() === 'energy,interaction,motion' && L.CLASSIFY['classify-tire'].fits.sort().join() === 'interaction,matter');
ok('Every category a scenario lists has an explanation', Object.values(L.CLASSIFY).every(c => [...c.fits, ...c.also].every(k => c.why[k])));
ok('PRD 7.3: three system scenarios, every object outside the system explained', Object.keys(L.SYSTEMS).length === 3 && Object.values(L.SYSTEMS).every(s => Object.keys(s.objects).filter(k => !s.required.includes(k)).every(k => s.notes[k]) && s.outside));
ok('PRD 7.6: the model leaves out drag, body movement, suspension and wheel rotation', L.MODEL_FACTORS.filter(f => f[2]).map(f => f[0]).sort().join() === 'body,drag,suspension,wheels');
ok('PRD 8.5: the experiment’s answer is trail angle → acceleration, with real controls', L.DESIGN.iv.find(x => x[2])[0] === 'angle' && L.DESIGN.dv.find(x => x[2])[0] === 'accel' && L.DESIGN.controls.filter(x => x[2]).length >= 3);
ok('PRD 9: seven branches, each with what it studies, MTB examples, a question and labs', L.BRANCHES.length === 7 && L.BRANCHES.every(b => b.studies && b.mtb.length >= 3 && b.q && b.labs.length));
ok('Live lab links point inside the site', Object.values(L.LIVE).every(u => /^\.\.\/[a-z-]+\/(#[a-z-]+)?$/.test(u)));
ok('PRD 10.1: eight knowledge-check questions with the PRD’s answers', L.CHECK_IDS.length === 8 && ['b', 'a', 'b', 'b', 'b', 'b', 'c', 'b'].every((a, i) => L.QUESTIONS['kc-' + (i + 1)].options.find(o => o.correct).id === a));
const choices = Object.entries(L.QUESTIONS).filter(([, q]) => q.type === 'choice');
ok('Every multiple-choice question has one right answer, feedback on every option and a solution', choices.every(([, q]) => q.options.filter(o => o.correct).length === 1 && q.options.every(o => o.feedback) && q.solution));
ok('PRD 11: five detective stages and the five written parts A–E', L.DETECTIVE_STAGES.map(s => s.id).join() === 'descend,accelerate,corner,jump,brake' && L.DETECTIVE_PARTS.map(p => p[0]).join() === 'identify,investigate,predict,explain,reflect');
ok('Every detective stage has right and wrong options', L.DETECTIVE_STAGES.every(s => s.options.some(o => o[2]) && s.options.some(o => !o[2])));
ok('Every graded item is a real question, and every question is graded somewhere', L.SECTIONS.every(s => s.graded.every(id => L.QUESTIONS[id])) && Object.keys(L.QUESTIONS).every(id => L.SECTIONS.some(s => s.graded.includes(id))));
ok('Every question practises at least one idea; kinds are valid slugs', Object.values(L.QUESTIONS).every(q => q.ideas && q.ideas.length) && Object.keys(L.questionKinds()).every(k => /^[a-z0-9-]+$/.test(k)));
ok('PRD 12: Explore and Engineer explanations both appear', ['explore', 'engineer'].every(lv => L.SECTIONS.some(s => s.blocks.some(b => b.t === 'level' && b.level === lv))));
ok('PRD 3: no equations are tested (no numeric questions)', !Object.values(L.QUESTIONS).some(q => q.type === 'number' || q.type === 'fields'));

// ---- 2. Graders ----
for (const [id, c] of Object.entries(L.CLASSIFY)) {
  ok(`${id}: the PRD’s categories pass`, G.gradeClassify(id, c.fits).correct);
  if (c.fits.length > 2) ok(`${id}: two of them is enough`, G.gradeClassify(id, c.fits.slice(0, 2)).correct);
  ok(`${id}: one alone isn’t enough`, G.gradeClassify(id, c.fits.slice(0, 1)).code === 'too-few');
  const wrong = Object.keys(L.CATEGORIES).find(k => !c.fits.includes(k) && !c.also.includes(k));
  if (wrong) ok(`${id}: a category that doesn’t fit is named`, G.gradeClassify(id, [...c.fits, wrong]).code === 'extra-' + wrong);
  if (c.also.length) ok(`${id}: a defensible extra is accepted`, G.gradeClassify(id, [...c.fits, ...c.also]).correct);
}
ok('Classify: nothing picked asks for a pick', G.gradeClassify('classify-fork', []).code === 'empty');
for (const [id, s] of Object.entries(L.SYSTEMS)) {
  ok(`${id}: the required objects pass`, G.gradeSystem(id, s.required).correct);
  if (s.optional.length) ok(`${id}: adding an optional object is fine`, G.gradeSystem(id, [...s.required, ...s.optional]).correct);
  const out = Object.keys(s.objects).find(k => !s.required.includes(k) && !s.optional.includes(k));
  ok(`${id}: a surroundings object in the system is named and explained`, (r => !r.correct && r.code === 'extra-' + out && r.message.includes(s.notes[out]))(G.gradeSystem(id, [...s.required, out])));
  ok(`${id}: a missing system object fails`, G.gradeSystem(id, s.required.slice(1)).code === (s.required.length > 1 ? 'missing' : 'missing') || s.required.length === 1);
}
ok('System: an empty system fails as missing', G.gradeSystem('system-tire', []).code === 'missing');
const left = L.MODEL_FACTORS.filter(f => f[2]).map(f => f[0]);
ok('Model: the four left-out factors pass', G.gradeModel(left).correct);
ok('Model: picking gravity (which the model keeps) is named', G.gradeModel([...left, 'gravity']).code === 'kept-gravity');
ok('Model: three of four is "missing"', G.gradeModel(left.slice(0, 3)).code === 'missing');
const sortRight = Object.fromEntries(L.STATEMENTS.map(([id, , k]) => [id, k]));
ok('Sort: all right passes', G.gradeSort(sortRight).correct);
ok('Sort: a gap asks to sort everything', G.gradeSort({ s1: 'observation' }).code === 'empty');
const sw = G.gradeSort({ ...sortRight, s2: 'observation' });
ok('Sort: a wrong one is named, with a tip for what it really is', !sw.correct && sw.wrong.join() === 's2' && /gives a reason/.test(sw.message));
ok('Statements cover all three kinds, twice each', ['observation', 'explanation', 'prediction'].every(k => L.STATEMENTS.filter(s => s[2] === k).length === 2));
const good = { iv: 'angle', dv: 'accel', controls: ['mass', 'speed', 'surface'], prediction: 'up', hypothesis: 'A steeper trail speeds the bike up faster because more gravity pulls along it' };
ok('Design: a sound experiment passes and spots the "because"', (r => r.correct && r.because)(G.gradeDesign(good)));
ok('Design: IV and DV swapped are both explained', (r => !r.parts.iv && !r.parts.dv && /dependent variable/.test(r.notes[0]))(G.gradeDesign({ ...good, iv: 'accel', dv: 'angle' })));
ok('Design: controlling the trail angle is flagged', (r => !r.parts.controls && r.notes.some(n => /can’t keep the trail angle/.test(n)))(G.gradeDesign({ ...good, controls: ['mass', 'speed', 'angle'] })));
ok('Design: fewer than three controls is flagged', !G.gradeDesign({ ...good, controls: ['mass'] }).parts.controls);
ok('Design: a one-word hypothesis is flagged', !G.gradeDesign({ ...good, hypothesis: 'faster' }).parts.hypothesis);
ok('Design: the wrong prediction is flagged', !G.gradeDesign({ ...good, prediction: 'same' }).parts.prediction);
ok('Design: no variables picked asks for them first', G.gradeDesign({}).code === 'empty');
const detRight = Object.fromEntries(L.DETECTIVE_STAGES.map(s => [s.id, [s.options.find(o => o[2])[0]]]));
ok('Detective: one real concept per stage passes', G.gradeDetective(detRight).correct);
ok('Detective: a missing stage is named', (r => r.code === 'empty' && /braking/.test(r.message))(G.gradeDetective({ ...detRight, brake: [] })));
ok('Detective: a wrong concept is named with its stage', (r => r.code === 'wrong-corner' && /Sound waves/.test(r.message))(G.gradeDetective({ ...detRight, corner: ['circular', 'sound'] })));
const wf = G.writeupFeedback({ identify: 'speeding up, leaning in the berm and flying off the jump', investigate: 'Why do I go further when I hit the jump faster?', predict: 'If I go faster I will land further away', explain: 'Gravity and projectile motion and speed', reflect: 'It helps me understand what my bike is doing' });
ok('Write-up: five real answers are complete, with positive tips for each', wf.complete && wf.tips.length === 5 && /exactly/.test(wf.tips[0]) && /real question/.test(wf.tips[1]) && /prediction/.test(wf.tips[2]) && /gravity/.test(wf.tips[3]));
const wf2 = G.writeupFeedback({ identify: 'a b c', investigate: 'speed on jumps here', predict: 'stuff happens there', explain: 'I really dont know', reflect: '' });
ok('Write-up: gaps are listed, and tips coach rather than mark down', !wf2.complete && wf2.empty.join() === 'Part E' && wf2.tips.some(t => /phrase it as a question/.test(t)) && wf2.tips.some(t => /naming a physics idea/.test(t)));

// ---- 3. The pictures' trail profile (components/scene.js loads in Node) ----
const S = await import(new URL('components/scene.js', base));
ok('Trail profile: a steady descent with a berm dip, a takeoff ramp and the ground in view', S.profileY(0) < S.profileY(400) && S.profileY(520) > S.profileY(400) + 20 && S.profileY(675) < S.profileY(620) && [0, 250, 500, 750, 1000].every(x => S.profileY(x) > 0 && S.profileY(x) <= 260));
ok('Every ride stage sits on the trail inside the picture', L.STAGES.every(st => { const p = S.stagePoint(st); return p.x > 0 && p.x < 1000 && p.y > 20 && p.y < 280; }));

// ---- 3. Completion (PRD 14) and progress ----
const pr = createProgress();
const all = (round) => {
  L.SECTIONS.forEach(s => s.graded.forEach(id => { if (!L.CHECK_IDS.includes(id)) pr.attempt(id, null, 'x', true, {}); }));
};
all();
L.CHECK_IDS.forEach((id, i) => pr.attempt(id, pr.checkKey(), 'x', i < 5, {}));
const m1 = pr.mastery();
ok('Completion: 5 of 8 (62.5%) on the check isn’t enough', !m1.mastered && !m1.criteria.find(c => c.id === 'check').met && m1.criteria.filter(c => c.met).length === 3, m1.criteria.map(c => c.id + ':' + c.met));
pr.retakeCheck(); L.CHECK_IDS.forEach((id, i) => pr.attempt(id, pr.checkKey(), 'x', i < 6, {}));
ok('Completion: a retake with 6 of 8 (75%) completes the lesson', pr.mastery().mastered);
const pr2 = createProgress();
pr2.attempt('detective-stages', null, 'x', true, {});
ok('Completion: the detective needs the written part too', !pr2.mastery().criteria.find(c => c.id === 'detective').met);
ok('Completion: the ride needs all seven stages explored', !pr2.mastery().criteria.find(c => c.id === 'ride').met);
const pr3 = createProgress(); pr3.setData('stages', ['top', 'start']);
ok('Activity data (explored stages) is kept per lesson', pr3.getData('stages').length === 2 && pr3.getData('missing', 'def') === 'def');
const sent = []; const pr4 = createProgress({ onAttempt: r => sent.push(r) });
pr4.attempt('detective-writeup', null, 'Part A · Identify: speed', true, { correctAnswer: 'All five parts written' });
ok('The written investigation is sent to the host with its kind and text', sent.length === 1 && sent[0].questionId === 'detective-writeup' && /Identify: speed/.test(sent[0].answer));

console.log(`${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
