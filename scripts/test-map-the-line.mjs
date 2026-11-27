#!/usr/bin/env node
// Tests for Map the Line (learning-lab/slope-lab/): the PRD's section 30
// tables, the misconception list (section 31), every question in every
// practice set and challenge round, the original Slope Lab bank kept
// alongside, the saved-progress migration, and the curriculum mapping.
// (The original engine and bank are also tested by scripts/test-slope-lab.mjs.)
//   node scripts/test-map-the-line.mjs   (add -v to list every check)

const base = new URL('../learning-lab/slope-lab/', import.meta.url);
const L = await import(new URL('logic/linear.js', base));
const D = await import(new URL('logic/data.js', base));
const Q = await import(new URL('logic/questions.js', base));
const { WORKBENCH } = await import(new URL('logic/workbench.js', base));
const { QUESTIONS: BANK } = await import(new URL('content/questions.js', base));
const E = await import(new URL('../learning-lab/lesson-kit/expr.js', import.meta.url));
const V = await import(new URL('../learning-lab/lesson-kit/validate.js', import.meta.url));
const { createProgress } = await import(new URL('../learning-lab/lesson-kit/progress.js', import.meta.url));
const { ACTIVITIES } = await import('../content/classes/activities.mjs');
const { loadClasses } = await import('../content/classes/model.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { cond ? pass++ : fail++; if (!cond || process.argv.includes('-v')) console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail !== undefined ? '  -> ' + JSON.stringify(detail) : ''}`); };
const P = (x, y) => ({ x, y });

// ---- 1. Coordinate plane ----
ok('Quadrants: (3, 2) I, (−4, 3) II, (−3, −2) III, (4, −3) IV, (0, 0) origin', [[3, 2, 'I'], [-4, 3, 'II'], [-3, -2, 'III'], [4, -3, 'IV'], [0, 0, 'origin']].every(([x, y, q]) => L.quadrant(x, y) === q));
ok('Points on an axis are in no quadrant', L.quadrant(0, -3) === 'y-axis' && L.quadrant(4, 0) === 'x-axis');
ok('Different scales: 3 intervals of 20 m and 2 of 5 m → (60, 10)', (s => s.x === 60 && s.y === 10)(L.scaled(3, 2, 20, 5)));
ok('The map features match the PRD table', ['jumps', 'overlook', 'pump', 'workshop', 'trailhead'].map(id => D.featureById[id]).map(f => f.x + ',' + f.y).join(' ') === '3,2 -4,3 -3,-2 4,-3 0,0');

// ---- 2. Trail profile ----
ok('Profile points: (0,1200) (100,1205) (200,1210) (300,1215) (400,1215) (500,1210) (600,1205)', D.PROFILE.map(r => r.join(',')).join(' ') === '0,1200 100,1205 200,1210 300,1215 400,1215 500,1210 600,1205');
ok('Missing waypoint at 200 m is 1192 (steady +6 per 100 m)', D.MISSING.answer === 1192 && L.isLinear(D.MISSING.rows.map(r => (r[1] === null ? [r[0], D.MISSING.answer] : r))));

// ---- 3. Slope ----
const sl = (a, b) => L.slope(a, b);
ok('(0,1200) to (300,1215): +0.05, +5%', String(sl(P(0, 1200), P(300, 1215)).value) === '1/20' && Number(L.grade(sl(P(0, 1200), P(300, 1215)).value)) === 5);
ok('(300,1215) to (400,1215): 0', sl(P(300, 1215), P(400, 1215)).kind === 'zero');
ok('(400,1215) to (600,1205): −0.05, −5%', Number(sl(P(400, 1215), P(600, 1205)).value) === -0.05 && Number(L.grade(sl(P(400, 1215), P(600, 1205)).value)) === -5);
ok('(200,1210) to (200,1220): undefined, never Infinity', (s => s.kind === 'undefined' && s.value === null && L.grade(s.value) === null)(sl(P(200, 1210), P(200, 1220))));
ok('12 m over 240 m = 5%; over 120 m = 10%', Number(L.grade(sl(P(0, 0), P(240, 12)).value)) === 5 && Number(L.grade(sl(P(0, 0), P(120, 12)).value)) === 10);
ok('Slope uses coordinate values: the same points give the same slope whatever the grid scale', Number(sl(P(0, 2), P(4, 5)).value) === 0.75);

// ---- 4. Linear and proportional ----
ok('1200, 1205, 1210, 1215 at 100 m: linear', L.isLinear(D.PATTERN_A) && L.classify(D.PATTERN_A) === 'linear');
ok('1200, 1205, 1211, 1215 at 100 m: nonlinear', !L.isLinear(D.PATTERN_B));
ok('0, 240, 480, 720, 960 each minute: linear and proportional', L.classify(D.SPEED_TABLE) === 'proportional');
ok('Pump track 0, 160, 380, 530, 790: nonlinear', L.classify(D.PUMP_TABLE) === 'not-linear' && L.firstDifferences(D.PUMP_TABLE).map(String).join() === '160,220,150,260');
ok('Unequal x-steps: compare rates, not first differences (0, 100, 300, 400 is linear)', L.isLinear(D.UNEVEN) && !L.firstDifferences(D.UNEVEN).every(d => d.eq(5)));
const d240 = t => 240 * t;
ok('d = 240t: d(0) = 0, d(1) = 240, d(2) = 480, d(3) = 720; k = 240; through the origin', [0, 240, 480, 720].every((v, t) => d240(t) === v) && Number(L.proportional(D.SPEED_TABLE).k) === 240 && L.lineOf(D.SPEED_TABLE).b.zero);
const ELEV = [[0, 1200], [100, 1205], [200, 1210], [300, 1215]];
ok('e = 1200 + 0.05x: linear, rate 0.05, intercept 1200, not proportional', L.isLinear(ELEV) && Number(L.lineOf(ELEV).m) === 0.05 && Number(L.lineOf(ELEV).b) === 1200 && !L.proportional(ELEV).proportional);
ok('Riders: A proportional (200), B proportional (240), C not', Number(L.proportional([[0, 0], ...D.RIDERS.A]).k) === 200 && Number(L.proportional([[0, 0], ...D.RIDERS.B]).k) === 240 && !L.proportional([[0, 0], ...D.RIDERS.C]).proportional && L.ratios(D.RIDERS.C).map(String).join() === '180,195,210');
ok('Ratios skip x = 0 (no 0/0)', L.ratios(D.SPEED_TABLE).length === 4);

// ---- 5. Misconceptions (section 31) ----
const q = id => Q.QUESTIONS[id];
const trapCode = (qq, raw, field) => { const f = field ? qq.fields.find(x => x.id === field) : qq; const r = V.checkNumber(f, raw); return r.code; };
ok('Reversing x and y is caught', trapCode(q('sc-read'), '-4', 'x') === 'swap-xy');
ok('Points on axes: the bike wash expects “on an axis”', q('sc-wash').options.find(o => o.correct).id === 'axis');
ok('Counting intervals instead of reading the scale; one scale for both axes', trapCode(q('sc-scale'), '3', 'x') === 'scale-count' && trapCode(q('sc-scale'), '40', 'y') === 'same-scale');
ok('Run ÷ rise and slope-for-grade traps', trapCode(q('gr-m'), '20') === 'run-over-rise' && trapCode(q('gr-pct'), '0.05') === 'grade-for-slope');
ok('Reversed numerator gives the wrong sign and is caught', trapCode(q('gr-down'), '0.05') === 'reversed-numerator' || trapCode(q('gr-down'), '0.05') === 'sign');
ok('Negative slope ≠ negative elevation; downhill slopes differ; undefined isn’t a trail', ['tr-neg-elev', 'tr-same-down', 'tr-und-real'].every(id => q(id).options.some(o => !o.correct && ['negative-elevation', 'same-downhill', 'divide-zero'].includes(o.code))));
ok('Assuming every linear relationship is proportional is caught', q('pf-vs').options.some(o => o.code === 'linear-proportional') && E.checkExpression(q('ld-eq'), '0.05x').code === 'linear-proportional');
ok('Along-trail distance used as run is caught', q('gr-run-length').options.some(o => o.code === 'run-vs-length'));
ok('Every misconception code a question uses is named', (() => { const codes = new Set(); const add = x => { for (const o of x.options || []) if (!o.correct) codes.add(o.code); for (const t of x.traps || []) codes.add(t.code); for (const f of x.fields || []) for (const t of f.traps || []) codes.add(t.code); }; Object.values(Q.QUESTIONS).forEach(add); for (let r = 1; r <= 4; r++) Object.values(Q.finalQuestions(r)).forEach(x => x && x.type && add(x)); codes.delete('wrong'); return [...codes].every(c => Q.MISCONCEPTIONS[c]); })());

// ---- 6. Every question ----
function checkQ(id, x, where) {
  const bad = [];
  if (!x || !x.prompt || typeof x.prompt !== 'string' || !Array.isArray(x.ideas) || !x.ideas.length || !x.ideas.every(i => Q.IDEAS[i])) bad.push('fields/ideas');
  if (!x.hints || x.hints.length !== 3 || !x.solution) bad.push('hints/solution');
  if (x.type === 'number') { if (!V.checkNumber(x, String(x.answer)).correct) bad.push('own answer'); if ((x.traps || []).some(t => V.checkNumber(x, String(t.value)).correct)) bad.push('trap = answer'); }
  if (x.type === 'fields') { if (!V.checkFields(x.fields, Object.fromEntries(x.fields.map(f => [f.id, String(f.answer)]))).correct) bad.push('own answer'); }
  if (x.type === 'expression' && !E.checkExpression(x, x.answer).correct) bad.push('own answer');
  if (x.type === 'choice' && x.options.filter(o => o.correct).length !== 1) bad.push('one right');
  if ((x.type === 'choice' || x.type === 'multi') && new Set(x.options.map(o => o.text)).size !== x.options.length) bad.push('dup options');
  if (x.type === 'multi' && !x.options.some(o => o.correct)) bad.push('none right');
  if (x.type === 'plot') { const G = x.grid; if (!x.targets.every(t => t.x >= G.x[0] && t.x <= G.x[1] && t.y >= G.y[0] && t.y <= G.y[1] && (!G.profile || ((t.x - G.x[0]) % (G.sx || 1) === 0 && (t.y - G.y[0]) % (G.sy || 1) === 0)))) bad.push('targets off-grid'); }
  if (id !== id.toLowerCase() || !/^[a-z0-9-]+$/.test(id)) bad.push('id');
  return bad.length ? `${where} ${id}: ${bad.join(', ')}` : null;
}
const problems = Object.entries(Q.QUESTIONS).map(([id, x]) => checkQ(id, x, 'stage')).filter(Boolean);
for (const [list, fn, ids, name] of [[Q.SCOUT_PRACTICE, Q.scoutPractice, Q.SCOUT_PRACTICE_IDS, 'scout'], [Q.SLOPE_PRACTICE, Q.slopePractice, Q.SLOPE_PRACTICE_IDS, 'slope'], [Q.LIN_PRACTICE, Q.linPractice, Q.LIN_PRACTICE_IDS, 'lin'], [Q.PROP_PRACTICE, Q.propPractice, Q.PROP_PRACTICE_IDS, 'prop']])
  for (let n = 0; n < list.length; n++) { const S_ = fn(n); for (const id of ids) { const r = checkQ(id, S_[id], name + n); if (r) problems.push(r); } }
for (let r = 1; r <= Q.FINAL_SETS.length; r++) { const F = Q.finalQuestions(r); for (const id of Q.FINAL_IDS) { const x = checkQ(id, F[id], 'round' + r); if (x) problems.push(x); } }
ok('Every stage, practice and challenge question is well-formed and accepts its own answer (traps never do)', problems.length === 0, problems.slice(0, 6));
ok('Slopes that don’t terminate (2/3) accept a rounded answer or the fraction', (x => V.checkNumber(x, '0.67').correct && V.checkNumber(x, '2/3').correct)(Q.slopePractice(4)['gx-m']));
ok('Challenge: 14 questions over five tasks, pass mark 11; every round’s data checks out', Q.FINAL_IDS.length === 14 && Q.PASS_MARK === 11 && [1, 2, 3, 4].every(r => { const X = Q.finalSet(r); return L.slope(X.pos[0], X.pos[1]).kind === 'positive' && L.slope(X.neg[0], X.neg[1]).kind === 'negative' && L.slope(X.zero[0], X.zero[1]).kind === 'zero' && L.slope(X.vertical[0], X.vertical[1]).kind === 'undefined' && L.classify(X.sets.speed) === 'proportional' && L.classify(X.sets.grade) === 'linear' && L.classify(X.sets.pump) === 'not-linear' && !L.isLinear(X.linear.other) && new Set(X.map.map(p => L.quadrant(p.x, p.y))).size >= 5; }));
ok('Challenge rounds use different networks', new Set([1, 2, 3, 4].map(r => Q.finalSet(r).name)).size === 4);
ok('Workbench: simple and advanced content for every entry', Object.values(WORKBENCH).every(w => w.simple.concept && w.simple.formula && w.advanced.full && w.advanced.steps.length && w.advanced.errors.length));

// ---- 7. The original bank and migration ----
const K = Q.questionKinds();
ok('All 32 original Slope Lab questions are kept, under lower-case ids', BANK.length === 32 && BANK.every(x => K[x.id.toLowerCase()] && K[x.id.toLowerCase()].length));
ok('No new question id clashes with an original one', Object.keys(Q.QUESTIONS).every(id => !BANK.some(x => x.id.toLowerCase() === id)));
const mem = (() => { const m = {}; return { load: k => (m[k] ? JSON.parse(m[k]) : null), save: (k, v) => { m[k] = JSON.stringify(v); }, remove: k => { delete m[k]; }, m }; })();
mem.save('mathlete-slope-lab:v1:guest', { version: 1, startedAt: 'x', updatedAt: 'x', completedAt: null, visited: {}, topics: {}, challenges: {}, predictions: {}, settings: { units: 'ft' }, questions: { F3: { attempts: 1, correct: true, firstTry: true, hints: 0, revealed: false } } });
// the same rename the module does on mount (map-the-line.js migrate), without the DOM
const Pm = createProgress({ lesson: { id: 'slope-lab', sections: [], questions: {} }, storage: mem });
for (const k of Object.keys(Pm.state.questions)) if (/^[A-Z]\d+$/.test(k)) { Pm.state.questions[k.toLowerCase()] = Pm.state.questions[k]; delete Pm.state.questions[k]; }
Pm.setData('migratedFrom', 'test', true);
ok('An old saved answer (F3) loads in the kit’s progress and counts as f3', createProgress({ lesson: { id: 'slope-lab', sections: [], questions: {} }, storage: mem }).done('f3'));

// ---- 8. Curriculum ----
const act = ACTIVITIES.find(a => a.id === 'slope-lab'), model = loadClasses(), skillIds = new Set(model.skills.map(s => s.id));
ok('Same activity id and route, now titled Map the Line', act && act.title === 'Map the Line' && act.route === 'learning-lab/slope-lab/' && act.tracking.gameId === 'slope-lab');
ok('Every question kind maps to real skills', Object.keys(K).every(k => (act.tracking.questions[k] || []).length && act.tracking.questions[k].every(s => skillIds.has(s))));
ok('It covers all six topics and every skill of Unit 3', model.skills.filter(s => s.topic.unit.title === 'Linear Relationships' && s.topic.course.id === 'alg1').every(s => act.skills.includes(s.id)));
ok('The original questions keep their wider skills (slope-intercept and writing equations)', act.skills.includes('alg1.slope-intercept-form.identify-m-and-b') && act.skills.includes('alg1.writing-linear-equations.from-two-points'));
ok('Each topic opens its own stage', Object.keys(act.stages).length === 6 && Object.values(act.stages).every(s => Q.MISSIONS.some(m => m.id === s.route)));
ok('Graded ids are unique across stages', (() => { const seen = new Set(); return Q.MISSIONS.every(m => m.graded.every(id => Q.QUESTIONS[id] && !seen.has(id) && seen.add(id))); })());

console.log(`\n${pass}/${pass + fail} checks passed.`);
process.exit(fail ? 1 : 0);
