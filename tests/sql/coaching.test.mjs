// Tests for supabase/coaching.sql against a real Postgres.
//   TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres npm run test:sql
// Creates a throwaway database (coach_test_run), loads a small Supabase
// stand-in (tests/sql/supabase-stub.sql), setup.sql and coaching.sql, then
// calls the functions the way the website does: as anon or as a signed-in user.
// Skipped when TEST_DATABASE_URL isn't set.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const URL_ = process.env.TEST_DATABASE_URL;
const root = new URL('../../', import.meta.url).pathname;
const sql = p => readFileSync(root + p, 'utf8');
const DB = 'coach_test_run';

let pg, db, admin;
const users = {};

before(async () => {
  if (!URL_) return;
  pg = (await import('pg')).default;
  admin = new pg.Client({ connectionString: URL_ });
  await admin.connect();
  await admin.query(`drop database if exists ${DB}`);
  await admin.query(`create database ${DB}`);
  const u = new URL(URL_); u.pathname = '/' + DB;
  db = new pg.Client({ connectionString: u.toString() });
  await db.connect();
  for (const f of ['tests/sql/supabase-stub.sql', 'supabase/setup.sql', 'supabase/coaching.sql', 'supabase/coaching.sql']) {
    await db.query(sql(f));
  }
  for (const [name, role, specialist] of [
    ['admin', 'admin', true], ['reviewer', 'reviewer', false], ['spec', 'reviewer', true],
    ['contrib', 'contributor', false], ['contrib2', 'contributor', false], ['outsider', null, false]]) {
    const { rows } = await db.query('insert into auth.users (email) values ($1) returning id', [name + '@example.com']);
    users[name] = rows[0].id;
    if (role) await db.query('insert into public.coach_editors (user_id, email, role, specialist) values ($1, $2, $3, $4)',
      [rows[0].id, name + '@example.com', role, specialist]);
  }
});

after(async () => {
  if (!URL_) return;
  await db.end();
  await admin.query(`drop database if exists ${DB}`);
  await admin.end();
});

// Run one function call as a user (or anon when who is null), like PostgREST does.
async function as(who, text, params = []) {
  await db.query('begin');
  try {
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [who ? users[who] : '']);
    await db.query(`set local role ${who ? 'authenticated' : 'anon'}`);
    const res = await db.query(text, params);
    await db.query('commit');
    return res.rows[0] ? Object.values(res.rows[0])[0] : null;
  } catch (e) {
    await db.query('rollback');
    throw e;
  }
}
const save = (who, type, item) => as(who, 'select public.coach_save($1, $2)', [type, JSON.stringify(item)]);
const move = (who, type, id, to, note = '') => as(who, 'select public.coach_transition($1, $2, $3, $4)', [type, id, to, note]);
const catalog = (who = null, preview = false) => as(who, 'select public.coach_catalog($1)', [preview]);
const status = async (type, id) => (await db.query(`select status::text s from public.${{ skill: 'coach_skills', lesson: 'coach_lessons', drill: 'coach_drills', mistake: 'coach_mistakes', pathway: 'coach_pathways', media: 'coach_media' }[type]} where id = $1`, [id])).rows[0]?.s;
async function publish(type, id, author = 'admin', approver = 'spec') {
  await move(author, type, id, 'submitted');
  await move(approver, type, id, 'approved');
  await move('admin', type, id, 'published');
}
const skip = !URL_ && 'set TEST_DATABASE_URL to run the database tests';

const skillBase = id => ({
  id, name: id.replace(/-/g, ' '), summary: 'Summary', why_it_matters: 'Because', environment: 'Flat grass',
  difficulty: 'beginner', safety_class: 1,
  disciplines: [{ id: 'foundations', primary: true }], competencies: [{ id: 'balance', importance: 'primary' }]
});

test('reference data: only admins can create disciplines and competencies', { skip }, async () => {
  await assert.rejects(save('reviewer', 'discipline', { id: 'foundations', name: 'Foundations' }), /permission/);
  await save('admin', 'discipline', { id: 'foundations', name: 'MTB Foundations', planned_topics: ['Steering'] });
  await save('admin', 'competency', { id: 'balance', name: 'Stability & Balance' });
  await save('admin', 'competency', { id: 'timing', name: 'Timing & Coordination' });
  await save('admin', 'person', { id: 'coach-a', name: 'Coach A', verified: true });
});

test('anon and outsiders cannot reach tables or editor functions', { skip }, async () => {
  await assert.rejects(as(null, 'select * from public.coach_skills'), /permission denied/);
  await assert.rejects(as('contrib', 'select * from public.coach_skills'), /permission denied/);
  await assert.rejects(as(null, "select public.coach_save('skill', '{}'::jsonb)"), /permission denied/);
  await assert.rejects(save('outsider', 'skill', skillBase('sneaky')), /permission/);
  await assert.rejects(as('outsider', 'select public.coach_admin_list()'), /permission/);
  const c = await catalog(null);
  assert.equal(c.preview, false);
  assert.deepEqual(c.skills, []);
  assert.equal(c.disciplines[0].id, 'foundations');
});

test('ids must be slugs', { skip }, async () => {
  await assert.rejects(save('admin', 'skill', { id: 'Bad Id!' }), /Invalid id/);
  await assert.rejects(save('admin', 'unknown', { id: 'x' }), /Unknown content type/);
});

test('incomplete drafts cannot be submitted, and say what is missing', { skip }, async () => {
  await save('contrib', 'skill', { id: 'balance-basics', name: 'Balance Basics' });
  await assert.rejects(move('contrib', 'skill', 'balance-basics', 'submitted'), /Short description is required.*discipline/);
  assert.equal(await status('skill', 'balance-basics'), 'draft');
});

test('contributors can only edit and submit their own drafts', { skip }, async () => {
  await assert.rejects(save('contrib2', 'skill', { id: 'balance-basics', summary: 'mine now' }), /own drafts/);
  await save('contrib', 'skill', skillBase('balance-basics'));
  await assert.rejects(move('contrib2', 'skill', 'balance-basics', 'submitted'), /own drafts/);
  await move('contrib', 'skill', 'balance-basics', 'submitted');
  await assert.rejects(save('contrib', 'skill', { id: 'balance-basics', summary: 'edit while in review' }), /own drafts/);
  await assert.rejects(move('contrib', 'skill', 'balance-basics', 'approved'), /Only reviewers/);
  await move('reviewer', 'skill', 'balance-basics', 'approved');
  await assert.rejects(move('reviewer', 'skill', 'balance-basics', 'published'), /permission/);
  await move('admin', 'skill', 'balance-basics', 'published');
  const c = await catalog(null);
  assert.deepEqual(c.skills.map(s => s.id), ['balance-basics']);
  assert.equal(c.skills[0].disciplines[0].id, 'foundations');
  assert.ok(!('status' in c.skills[0]) && !('created_by' in c.skills[0]), 'no workflow metadata on the public site');
});

test('editing published content sends it back to draft and leaves the live version alone', { skip }, async () => {
  await save('admin', 'skill', { id: 'balance-basics', name: 'Balance (edited)' });
  assert.equal(await status('skill', 'balance-basics'), 'draft');
  const live = await catalog(null);
  assert.equal(live.skills[0].name, 'balance basics');
  const preview = await catalog('reviewer', true);
  assert.equal(preview.preview, true);
  assert.equal(preview.skills.find(s => s.id === 'balance-basics').name, 'Balance (edited)');
  const anonPreview = await catalog(null, true);
  assert.equal(anonPreview.preview, false, 'anon cannot preview drafts');
  // Saving the same content again is not a change.
  const v1 = (await db.query("select version from coach_skills where id = 'balance-basics'")).rows[0].version;
  await save('admin', 'skill', { id: 'balance-basics', name: 'Balance (edited)' });
  const v2 = (await db.query("select version from coach_skills where id = 'balance-basics'")).rows[0].version;
  assert.equal(v1, v2);
});

test('circular prerequisites are rejected', { skip }, async () => {
  await save('admin', 'skill', skillBase('a-skill'));
  await save('admin', 'skill', { ...skillBase('b-skill'), prerequisites: [{ id: 'a-skill', kind: 'required' }] });
  await save('admin', 'skill', { ...skillBase('c-skill'), prerequisites: [{ id: 'b-skill', kind: 'recommended' }] });
  await assert.rejects(save('admin', 'skill', { id: 'a-skill', prerequisites: [{ id: 'c-skill', kind: 'required' }] }), /Circular prerequisite/);
  await assert.rejects(save('admin', 'skill', { id: 'a-skill', prerequisites: [{ id: 'a-skill' }] }), /check constraint|Circular/);
  const a = await as('admin', "select public.coach_admin_get('skill', 'a-skill')");
  assert.deepEqual(a.item.prerequisites, [], 'failed save left nothing behind');
  await assert.rejects(save('admin', 'skill', { id: 'a-skill', prerequisites: [{ id: 'no-such-skill' }] }), /foreign key/);
});

test('a skill cannot be published while its prerequisites are unpublished', { skip }, async () => {
  await move('admin', 'skill', 'b-skill', 'submitted');
  await move('reviewer', 'skill', 'b-skill', 'approved');
  await assert.rejects(move('admin', 'skill', 'b-skill', 'published'), /Skill "a-skill" is not published yet/);
  await publish('skill', 'a-skill', 'admin', 'reviewer');
  await move('admin', 'skill', 'b-skill', 'published');
});

test('advanced and Class 3 content needs an independent specialist', { skip }, async () => {
  await save('admin', 'skill', { ...skillBase('backflip'), difficulty: 'expert', safety_class: 3 });
  await move('admin', 'skill', 'backflip', 'submitted');
  await assert.rejects(move('reviewer', 'skill', 'backflip', 'approved'), /specialist/);
  await assert.rejects(move('admin', 'skill', 'backflip', 'approved'), /someone other than its last editor/);
  await move('spec', 'skill', 'backflip', 'approved');
  await move('admin', 'skill', 'backflip', 'published');
});

const drill = id => ({ id, name: 'Drill ' + id, objective: 'Obj', steps: ['Step'], environment: 'Grass', level: 'beginner',
  safety: ['Helmet'], success: ['Smooth'], duration_min: 5 });
const lesson = (id, skill, extra = {}) => ({
  id, skill_id: skill, title: 'Lesson ' + id, introduction: 'Intro', objectives: ['Obj'],
  physics: { summary: 's', blocks: [{ heading: 'COM', body: 'b' }] },
  technique: [{ title: 'Stage 1', cues: ['Look ahead'] }],
  safety: { protective: ['Helmet'], stop_conditions: ['Tired'], environments: ['Grass'] },
  drills: ['d-one'], mistakes: ['m-one'], contributors: [{ id: 'coach-a', role: 'author' }], ...extra
});

test('lessons: completeness, links and the Class 3 supervision rule', { skip }, async () => {
  await save('admin', 'drill', drill('d-one'));
  await save('admin', 'mistake', { id: 'm-one', name: 'Stiff arms', description: 'd', correction: 'c', drill_id: 'd-one' });
  await save('admin', 'lesson', lesson('l-balance', 'balance-basics', { contributors: [] }));
  await assert.rejects(move('admin', 'lesson', 'l-balance', 'submitted'), /Credit at least one author/);
  await save('admin', 'lesson', lesson('l-balance', 'balance-basics'));
  await move('admin', 'lesson', 'l-balance', 'submitted');
  await move('reviewer', 'lesson', 'l-balance', 'approved');
  await assert.rejects(move('admin', 'lesson', 'l-balance', 'published'), err => /Drill "d-one" is not published yet/.test(err.message) && /Mistake "m-one" is not published yet/.test(err.message));
  await publish('drill', 'd-one', 'admin', 'reviewer');
  await publish('mistake', 'm-one', 'admin', 'reviewer');
  await move('admin', 'lesson', 'l-balance', 'published');

  await save('admin', 'lesson', lesson('l-flip', 'backflip'));
  await assert.rejects(move('admin', 'lesson', 'l-flip', 'submitted'), /Class 3 lessons must require coach supervision/);
  await save('admin', 'lesson', lesson('l-flip', 'backflip', { safety: { protective: ['Full face'], stop_conditions: ['x'], environments: ['Airbag'], supervision: true } }));
  await move('admin', 'lesson', 'l-flip', 'submitted');
  await assert.rejects(move('reviewer', 'lesson', 'l-flip', 'approved'), /specialist/);
  await move('spec', 'lesson', 'l-flip', 'approved');
  // A drill used by a Class 3 lesson needs a specialist too.
  await save('admin', 'drill', { id: 'd-one', name: 'Drill one v2' });
  await move('admin', 'drill', 'd-one', 'submitted');
  await assert.rejects(move('reviewer', 'drill', 'd-one', 'approved'), /specialist/);
});

test('pathways: practical Class 3 stages must be coach-supervised', { skip }, async () => {
  const p = { id: 'p-flip', name: 'Backflip path', target_skill_id: 'backflip', stages: [
    { title: 'Understand rotation', lessons: ['l-flip'], kind: 'required' },
    { title: 'Airbag practice', lessons: ['l-flip'], practical: true, readiness: ['Coach sign-off'] }] };
  await save('admin', 'pathway', p);
  await assert.rejects(move('admin', 'pathway', 'p-flip', 'submitted'), /Stage 2: practical stages for Class 3 skills must require coach supervision/);
  p.stages[1].supervision = true;
  await save('admin', 'pathway', p);
  await move('admin', 'pathway', 'p-flip', 'submitted');
  const got = await as('admin', "select public.coach_admin_get('pathway', 'p-flip')");
  assert.equal(got.item.stages.length, 2);
  assert.equal(got.item.stages[1].supervision, true);
  assert.deepEqual(got.item.stages[0].lessons, ['l-flip']);
});

test('published content that others link to cannot be archived or deleted', { skip }, async () => {
  await assert.rejects(move('admin', 'mistake', 'm-one', 'archived'), /lesson:l-balance/);
  await assert.rejects(as('admin', "select public.coach_delete('mistake', 'm-one')"), /only be archived/);
  await save('admin', 'drill', drill('d-scratch'));
  await as('admin', "select public.coach_delete('drill', 'd-scratch')");
  assert.equal(await status('drill', 'd-scratch'), undefined);
});

test('rollback puts an older version back on the live site', { skip }, async () => {
  await save('admin', 'skill', skillBase('rollme'));
  await publish('skill', 'rollme', 'admin', 'reviewer');
  await save('admin', 'skill', { id: 'rollme', name: 'Second version' });
  await publish('skill', 'rollme', 'admin', 'reviewer');
  let live = await catalog(null);
  assert.equal(live.skills.find(s => s.id === 'rollme').name, 'Second version');
  const got = await as('admin', "select public.coach_admin_get('skill', 'rollme')");
  assert.deepEqual(got.versions.map(v => v.version), [2, 1]);
  await assert.rejects(as('reviewer', "select public.coach_rollback('skill', 'rollme', 1, '')"), /permission/);
  await as('admin', "select public.coach_rollback('skill', 'rollme', 1, 'typo')");
  live = await catalog(null);
  assert.equal(live.skills.find(s => s.id === 'rollme').name, 'rollme');
  assert.equal(await status('skill', 'rollme'), 'published');
  const after_ = await as('admin', "select public.coach_admin_get('skill', 'rollme')");
  assert.equal(after_.versions[0].version, 3);
  assert.match(after_.versions[0].note, /Rollback to v1/);
});

test('archiving takes an item off the live site; restoring makes it a draft again', { skip }, async () => {
  await move('admin', 'skill', 'rollme', 'archived');
  assert.ok(!(await catalog(null)).skills.some(s => s.id === 'rollme'));
  await move('admin', 'skill', 'rollme', 'draft');
  assert.equal(await status('skill', 'rollme'), 'draft');
  await assert.rejects(move('admin', 'skill', 'rollme', 'published'), /Can't move from draft to published/);
});

test('every status change is logged with who did it', { skip }, async () => {
  const list = await as('admin', 'select public.coach_admin_list()');
  assert.equal(list.me.role, 'admin');
  const approve = list.log.find(l => l.action === 'status' && l.to === 'approved');
  assert.ok(approve && /@example\.com$/.test(approve.by));
  assert.ok(list.items.some(i => i.type === 'skill' && i.id === 'backflip' && i.needs_specialist === true));
});

test('the seed file loads, and re-running it never overwrites edits', { skip }, async () => {
  const seed = JSON.parse(sql('content/coaching/seed.json'));
  const r1 = await db.query('select public.coach__seed($1)', [JSON.stringify(seed)]);
  assert.ok(r1.rows[0].coach__seed.added > 10);
  const first = seed.skills[0].id;
  await save('admin', 'skill', { id: first, name: 'Edited in the CMS' });
  const r2 = await db.query('select public.coach__seed($1)', [JSON.stringify(seed)]);
  assert.equal(r2.rows[0].coach__seed.added, 0);
  const got = await as('admin', 'select public.coach_admin_get($1, $2)', ['skill', first]);
  assert.equal(got.item.name, 'Edited in the CMS');
  // Seeded lessons are complete enough to go to review as they are.
  for (const l of seed.lessons) {
    const v = await as('admin', 'select public.coach_validate($1, $2)', ['lesson', l.id]);
    assert.deepEqual(v.content, [], `lesson ${l.id}: ${v.content.join('; ')}`);
  }
  for (const t of ['skill', 'drill', 'mistake', 'pathway']) {
    for (const item of seed[{ skill: 'skills', drill: 'drills', mistake: 'mistakes', pathway: 'pathways' }[t]]) {
      if (t === 'skill' && item.id === first) continue;
      const v = await as('admin', 'select public.coach_validate($1, $2)', [t, item.id]);
      assert.deepEqual(v.content, [], `${t} ${item.id}: ${v.content.join('; ')}`);
    }
  }
  // Nothing seeded is live: it all waits for review.
  assert.ok(!(await catalog(null)).lessons.some(l => seed.lessons.some(s => s.id === l.id)));
});
