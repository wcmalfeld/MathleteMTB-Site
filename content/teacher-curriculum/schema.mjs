// ============================================================
// TEACHER CURRICULUM: what a lesson plan must contain, and which parts of
// it are public, for students, or for teachers only.
//
// Lesson sources live in private-content/lesson-plans/<course>/*.mjs
// (git-ignored: they hold the answer keys). Format: docs/TEACHER-CURRICULUM.md.
// checkLesson() enforces PRD section 8 ("every published lesson must…"):
// a build with a failing lesson stops.
// ============================================================
import { parseRich, parseMath } from '../../js/teacher-curriculum/math.js';
import { checkGraph } from '../../js/teacher-curriculum/graph.js';
import { TOOLS, ACTIVITY_KINDS, PRACTICE_LEVELS } from './quarters.mjs';

export const LESSON_STATUSES = { published: 'Lesson plan ready', review: 'In review', draft: 'Draft' };

const str = v => typeof v === 'string' && v.trim().length > 0;
const arr = (v, min = 1) => Array.isArray(v) && v.length >= min;

// Every string in the lesson, with where it is (for math/markup checks).
function* strings(v, path) {
  if (typeof v === 'string') yield [v, path];
  else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* strings(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) { if (k !== 'graph') yield* strings(v[k], `${path}.${k}`); }
}
function* graphs(v, path) {
  if (Array.isArray(v)) for (let i = 0; i < v.length; i++) yield* graphs(v[i], `${path}[${i}]`);
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) {
    if (k === 'graph') yield [v[k], `${path}.graph`]; else yield* graphs(v[k], `${path}.${k}`);
  }
}

const BLOCKS = ['p', 'formula', 'graph', 'example', 'note', 'list', 'table', 'steps'];

export function checkLesson(L, topic) {
  const e = [];
  const need = (ok, msg) => { if (!ok) e.push(msg); };
  need(str(L.id), 'id missing');
  need(str(L.title), 'title missing');
  need(str(L.hook), 'hook (the subtitle question) missing');
  need(Number.isInteger(L.minutes) && L.minutes >= 20 && L.minutes <= 120, 'minutes must be a whole number from 20 to 120');
  need(LESSON_STATUSES[L.status], `status must be one of ${Object.keys(LESSON_STATUSES).join(', ')}`);
  need(str(L.summary), 'summary missing');
  need(arr(L.standards), 'standards missing (Common Core codes)');
  // 2. objectives, 3. essential question
  need(arr(L.objectives, 3), 'at least 3 objectives');
  need(str(L.question), 'essential question missing');
  // 4. mathematical foundation
  need(arr(L.vocab, 2) && L.vocab.every(v => Array.isArray(v) && str(v[0]) && str(v[1])), 'at least 2 vocabulary [term, meaning] pairs');
  need(arr(L.foundation, 3), 'foundation needs at least 3 blocks');
  (L.foundation || []).forEach((b, i) => {
    const kind = BLOCKS.find(k => k in b);
    if (!kind) e.push(`foundation[${i}] is not a known block (${BLOCKS.join(', ')})`);
    if (kind === 'example') need(str(b.example.q) && arr(b.example.steps) && str(b.example.answer), `foundation[${i}] example needs q, steps and answer`);
    if (kind === 'table') need(arr(b.table.head) && arr(b.table.rows) && b.table.rows.every(r => r.length === b.table.head.length), `foundation[${i}] table rows don't match its head`);
  });
  need((L.foundation || []).some(b => 'formula' in b || 'example' in b), 'foundation needs a formula or a worked example');
  // 5. MTB connection
  need(L.mtb && arr(L.mtb.text) && arr(L.mtb.pairs, 2), 'mtb needs text and at least 2 [math, trail] pairs');
  // 6. teaching timeline
  need(arr(L.stages, 4), 'at least 4 teaching stages');
  (L.stages || []).forEach((s, i) => need(str(s.name) && Number.isInteger(s.min) && s.min > 0 && str(s.teach) && str(s.students) && str(s.expect),
    `stage ${i + 1} needs name, min, teach, students and expect`));
  const total = (L.stages || []).reduce((n, s) => n + (s.min || 0), 0);
  need(total === L.minutes, `stage minutes add up to ${total}, not the lesson's ${L.minutes}`);
  // 7. activity
  const A = L.activity || {};
  need(ACTIVITY_KINDS[A.kind], `activity.kind must be one of ${Object.keys(ACTIVITY_KINDS).join(', ')}`);
  if (A.kind === 'tool' || A.kind === 'lab') need(TOOLS[A.tool], `activity.tool "${A.tool}" isn't a Mathlete tool in quarters.mjs TOOLS`);
  else need(!A.tool, 'only tool and lab activities name a tool');
  for (const k of ['title', 'objective', 'connection']) need(str(A[k]), `activity.${k} missing`);
  for (const k of ['materials', 'teacher', 'students', 'investigate', 'outcomes']) need(arr(A[k]), `activity.${k} missing`);
  need(arr(A.answers) && A.answers.length === (A.investigate || []).length, 'activity.answers: one expected answer per investigate question');
  // 8. guided practice
  need(arr(L.guided, 3), 'at least 3 guided examples');
  (L.guided || []).forEach((g, i) => need(str(g.q) && str(g.concept) && arr(g.steps) && str(g.answer), `guided[${i}] needs q, concept, steps and answer`));
  need((L.guided || []).some(g => g.mtb) && (L.guided || []).some(g => !g.mtb), 'guided practice needs both MTB and non-MTB examples');
  // 9. independent practice
  need(arr(L.practice, 8), 'at least 8 practice problems');
  (L.practice || []).forEach((p, i) => need(PRACTICE_LEVELS[p.level] && str(p.q) && str(p.a), `practice[${i}] needs level, q and a`));
  for (const lv of Object.keys(PRACTICE_LEVELS)) need((L.practice || []).some(p => p.level === lv), `practice needs at least one "${lv}" problem`);
  const order = Object.keys(PRACTICE_LEVELS);
  need((L.practice || []).every((p, i, a) => !i || order.indexOf(a[i - 1].level) <= order.indexOf(p.level)), 'practice must go concept → standard → mtb → challenge');
  const mtbShare = (L.practice || []).filter(p => p.level === 'mtb').length / ((L.practice || []).length || 1);
  need(mtbShare < 0.6, 'not every practice problem should be MTB-themed');
  // 10. exit ticket
  need(arr(L.exit, 3) && L.exit.length <= 5, 'exit ticket needs 3–5 questions');
  (L.exit || []).forEach((x, i) => need(str(x.q) && str(x.a) && str(x.why), `exit[${i}] needs q, a and why`));
  // 11. teacher resources
  const R = L.resources || {};
  need(arr(R.notes), 'resources.notes missing');
  need(arr(R.misconceptions, 2) && R.misconceptions.every(m => Array.isArray(m) && str(m[0]) && str(m[1])), 'at least 2 [misconception, response] pairs');
  need(arr(R.support) && arr(R.extend), 'resources.support and resources.extend (differentiation) missing');
  need(arr(R.challenge) && R.challenge.every(c => str(c.q) && str(c.a)), 'resources.challenge needs {q, a} items');
  // markup and figures
  for (const [s, where] of strings(L, 'lesson')) {
    // '\frac' typed with one backslash in JS is a form feed + "rac": catch it.
    if (/[\x00-\x1f]/.test(s)) e.push(`${where}: has a control character (a single backslash? write \\\\frac, \\\\theta…)`);
    try { parseRich(s); } catch (err) { e.push(`${where}: ${err.message}`); }
  }
  // Formula blocks are raw math (no $…$), so parse them as math.
  (L.foundation || []).forEach((b, i) => { if ('formula' in b) { try { parseMath(b.formula); } catch (err) { e.push(`lesson.foundation[${i}].formula: ${err.message}`); } } });
  for (const [g, where] of graphs(L, 'lesson')) for (const msg of checkGraph(g)) e.push(`${where}: ${msg}`);
  if (topic) need(L.id === topic.id, `id ${L.id} should be its topic's id ${topic.id}`);
  return e;
}

// What anyone may see (baked into the public page and lessons.json).
export function publicPart(L) {
  const A = L.activity;
  return {
    id: L.id, title: L.title, hook: L.hook, minutes: L.minutes, grade: L.grade || null, status: L.status,
    summary: L.summary, standards: L.standards, image: L.image || null,
    objectives: L.objectives, question: L.question,
    mtb: { text: L.mtb.text, pairs: L.mtb.pairs },
    activity: { kind: A.kind, tool: A.tool || null, title: A.title, objective: A.objective, materials: A.materials },
    counts: { stages: L.stages.length, guided: L.guided.length, practice: L.practice.length, exit: L.exit.length }
  };
}

// The student view (PRD 6): no timeline, solutions, answers or teacher notes.
// Not served yet; kept so the split is defined in one place and tested.
export function studentPart(L) {
  const A = L.activity;
  return {
    id: L.id, title: L.title, hook: L.hook, question: L.question, objectives: L.objectives,
    vocab: L.vocab, foundation: L.foundation, mtb: L.mtb,
    activity: { kind: A.kind, tool: A.tool || null, title: A.title, objective: A.objective, connection: A.connection,
      materials: A.materials, students: A.students, investigate: A.investigate },
    guided: L.guided.map(g => ({ q: g.q, concept: g.concept, graph: g.graph })),
    practice: L.practice.map(p => ({ level: p.level, q: p.q, graph: p.graph })),
    exit: L.exit.map(x => ({ q: x.q }))
  };
}
