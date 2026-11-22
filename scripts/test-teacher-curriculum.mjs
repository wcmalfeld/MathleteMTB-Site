#!/usr/bin/env node
// Tests for the Teacher Curriculum (PRDs/lessonPlanLibrary.md).
//
//   Part 1 (always): the math notation, figures, timing, the lesson rules
//   and the public / student / teacher split, on every lesson source in
//   private-content/lesson-plans/ (skipped if that folder isn't here).
//   Part 2 (needs PGlite): supabase/teacher-curriculum.sql in a throwaway
//   in-memory Postgres with the real setup, progress, organizations,
//   resources and catalog SQL, checking who can read a lesson plan.
//   Nothing touches your real database.
//
//   npm install --no-save @electric-sql/pglite     (once, for part 2)
//   node scripts/test-teacher-curriculum.mjs       (Node 20+)

import { readFileSync, existsSync } from 'node:fs';
import { randomUUID as uid } from 'node:crypto';
import { parseMath, parseRich, plainText } from '../js/teacher-curriculum/math.js';
import { checkGraph, fnValue } from '../js/teacher-curriculum/graph.js';
import { checkLesson, publicPart, studentPart } from '../content/teacher-curriculum/schema.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
let pass = 0, fail = 0;
const ok = (name, v, extra = '') => { v ? pass++ : fail++; console.log((v ? 'PASS ' : 'FAIL ') + name + (v ? '' : '  ' + extra)); };
const throws = f => { try { f(); return false; } catch { return true; } };

// ---------- 1. notation, figures, timing ----------
ok('fractions, powers and subscripts parse', parseMath('m = \\frac{y_2 - y_1}{x_2 - x_1}').some(n => n.t === 'frac'));
ok('nested fraction and root', parseMath('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}').some(n => n.t === 'frac' && n.n.some(k => k.t === 'sqrt')));
ok('plain text of a formula reads sensibly', plainText('$x^2 + \\frac{1}{2}$') === 'x^2 + (1)/(2)', plainText('$x^2 + \\frac{1}{2}$'));
ok('an unclosed $ is an error', throws(() => parseRich('costs $5')));
ok('an escaped dollar is a price, not math', parseRich('costs \\$5').length === 1 && parseRich('costs \\$5')[0].s === 'costs $5');
ok('an unknown command is an error', throws(() => parseMath('\\fraq{1}{2}')));
ok('unbalanced braces are an error', throws(() => parseMath('\\frac{1}{2')) && throws(() => parseMath('x}')));
ok('**bold** works and must be closed', parseRich('a **b** c')[1].t === 'bold' && throws(() => parseRich('a **b')));
ok('a good graph passes', checkGraph({ x: [0, 5], y: [0, 5], items: [{ line: [1, 0] }, { fn: 'quad', a: -1, h: 2, k: 4 }] }).length === 0);
ok('a bad graph is caught', checkGraph({ x: [5, 0], y: [0, 5], items: [{ wobble: 1 }] }).length === 2);
ok('figures compute their curves correctly', fnValue({ fn: 'quad', a: -1, h: 2, k: 4 }, 0) === 0 && fnValue({ fn: 'exp', a: 2, b: 3 }, 2) === 18
  && Math.abs(fnValue({ fn: 'log', b: 10 }, 1000) - 3) < 1e-12 && Number.isNaN(fnValue({ fn: 'log', b: 10 }, -1)));
const { scaleMinutes } = await import('./../js/teacher-curriculum/render.js').catch(() => ({}));
if (scaleMinutes) {
  const st = [{ min: 5 }, { min: 10 }, { min: 15 }, { min: 10 }, { min: 10 }];
  ok('class length: timings rescale and always add up', [40, 45, 55, 60, 75, 90].every(t => scaleMinutes(st, t).reduce((a, b) => a + b) === t) && scaleMinutes(st, 50).join() === '5,10,15,10,10');
} else ok('render.js loads in Node (for scaleMinutes)', false);

// ---------- 2. every lesson source ----------
const dir = ROOT + '/private-content/lesson-plans';
if (!existsSync(dir)) console.log('SKIP lesson sources (private-content/lesson-plans/ is not on this machine)');
else {
  const { buildModel } = await import('./build-teacher-curriculum.mjs');
  const model = await buildModel();
  ok('every lesson source passes the lesson rules', model.errors.length === 0, model.errors.slice(0, 8).join('\n   '));
  const lessons = model.courses.flatMap(c => c.quarters.flatMap(q => q.units.flatMap(u => u.topics.filter(t => t.full)))).map(t => t.full);
  ok('at least one lesson source exists', lessons.length > 0);
  for (const L of lessons) {
    // Answers may legitimately repeat taught material (a worked example, a
    // definition), so only the parts of the views that hold questions count.
    const sp = studentPart(L);
    const pub = JSON.stringify(publicPart(L)), stu = JSON.stringify({ guided: sp.guided, practice: sp.practice, exit: sp.exit, activity: sp.activity });
    const teacherOnly = [...L.exit.map(x => x.a), ...L.practice.map(p => p.a), ...L.guided.map(g => g.answer), ...L.activity.answers, ...L.stages.map(s => s.teach)]
      .filter(s => s.length > 12);
    const leaked = teacherOnly.filter(s => pub.includes(JSON.stringify(s).slice(1, -1)) || stu.includes(JSON.stringify(s).slice(1, -1)));
    if (leaked.length) ok(`${L.id}: answers stay out of the public and student views`, false, leaked[0]);
  }
  ok(`answers stay out of the public and student views (${lessons.length} lessons)`, true);
  const bad = lessons.map(L => [L.id, checkLesson({ ...L, exit: L.exit.slice(0, 2) })]).filter(([, e]) => !e.some(m => /exit ticket/.test(m)));
  ok('the rules really reject an incomplete lesson (2-question exit ticket)', bad.length === 0, bad.map(b => b[0]).join());
  const noMtb = lessons.filter(L => !L.activity || !L.mtb || !L.mtb.pairs.length);
  ok('every lesson has an MTB connection and an MTB activity', noMtb.length === 0, noMtb.map(L => L.id).join());
}

// ---------- 3. who can read a lesson (SQL) ----------
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); } catch { PGlite = null; }
if (!PGlite) console.log('SKIP database tests (npm install --no-save @electric-sql/pglite)');
else {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key, email text, banned_until timestamptz, raw_user_meta_data jsonb default '{}', created_at timestamptz default now(), last_sign_in_at timestamptz, email_confirmed_at timestamptz);
    create table auth.sessions (id uuid primary key, user_id uuid, not_after timestamptz);
    create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
    create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
    create or replace function auth.role() returns text language sql stable as $$ select auth.jwt() ->> 'role' $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb);
    alter table storage.objects enable row level security;
    grant usage on schema auth, storage to anon, authenticated, service_role;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
    grant select, insert, update, delete on storage.objects to anon, authenticated;
  `);
  for (const f of ['setup', 'progress', 'organizations', 'resources', 'curriculum', 'catalog', 'teacher-curriculum', 'teacher-curriculum']) {
    try { await db.exec(readFileSync(`${ROOT}/supabase/${f}.sql`, 'utf8')); }
    catch (e) { ok(`${f}.sql runs`, false, e.message); process.exit(1); }
  }
  ok('teacher-curriculum.sql runs (twice: safe to re-run)', true);
  const U = {}; for (const n of ['admin', 'tutor', 'dstudent', 'aOwner', 'aInstr', 'aStu', 'nobody']) U[n] = { id: uid(), sid: uid() };
  const orgA = uid();
  await db.exec(`
    insert into auth.users (id, email) values ${Object.entries(U).map(([n, u]) => `('${u.id}', '${n}@example.com')`).join(',')};
    insert into auth.sessions (id, user_id) values ${Object.values(U).map(u => `('${u.sid}', '${u.id}')`).join(',')};
    insert into public.platform_admins (user_id) values ('${U.admin.id}');
    insert into public.members (user_id, email) values ('${U.admin.id}', 'a'), ('${U.tutor.id}', 't'), ('${U.dstudent.id}', 'd');
    insert into public.profiles (user_id, role, display_name) values ('${U.admin.id}', 'admin', 'Admin'), ('${U.tutor.id}', 'tutor', 'Tutor'), ('${U.dstudent.id}', 'student', 'Dee');
    insert into public.organizations (id, name, slug, status) values ('${orgA}', 'School A', 'school-a', 'active');
    insert into public.plans (id, name) values ('new-plan', 'New') on conflict do nothing;
    insert into public.subscriptions (organization_id, plan_id, status, starts_on, billing_interval, seat_allowance) values ('${orgA}', 'new-plan', 'active', current_date - 1, 'year', 30);
    insert into public.organization_memberships (organization_id, user_id, role) values
      ('${orgA}', '${U.aOwner.id}', 'owner'), ('${orgA}', '${U.aInstr.id}', 'instructor'), ('${orgA}', '${U.aStu.id}', 'student');
    insert into public.teacher_lessons (id, course_id, quarter, topic_id, title, status, content, content_hash) values
      ('alg1.slope-and-rate-of-change', 'alg1', 2, 'alg1.slope-and-rate-of-change', 'Understanding Slope', 'published', '{"title":"Understanding Slope","exit":[{"a":"SECRET"}]}', 'h1'),
      ('alg1.coordinate-plane', 'alg1', 2, 'alg1.coordinate-plane', 'Draft lesson', 'review', '{"title":"Draft"}', 'h2');
  `);
  async function as(who, sql, params = []) {
    await db.exec('reset role');
    if (who === 'anon') { await db.query(`select set_config('request.jwt.claims', '{"role":"anon"}', false)`); await db.exec('set role anon'); }
    else { const u = U[who]; await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: u.id, session_id: u.sid, role: 'authenticated' })]); await db.exec('set role authenticated'); }
    try { return await db.query(sql, params); } finally { await db.exec('reset role'); }
  }
  const tryAs = (who, sql, p) => as(who, sql, p).then(r => ({ ok: true, r }), e => ({ ok: false, e: e.message }));
  const lesson = async (who, id = 'alg1.slope-and-rate-of-change') => {
    const x = await tryAs(who, 'select public.teacher_lesson($1) j', [id]);
    return x.ok ? x.r.rows[0].j : { status: 'error', e: x.e };
  };
  const st = async (who, id) => (await lesson(who, id)).status;

  ok('a visitor (not signed in) cannot call teacher_lesson at all', (await st('anon')) === 'error');
  ok('nobody can read the table directly, not even a teacher', !(await tryAs('tutor', 'select * from public.teacher_lessons')).ok && !(await tryAs('anon', 'select * from public.teacher_lessons')).ok);
  ok('a direct student is not a teacher', (await st('dstudent')) === 'not_teacher');
  ok('a student gets no lesson data at all', !JSON.stringify(await lesson('dstudent')).includes('SECRET'));
  ok('a signed-in user with no access is not a teacher', (await st('nobody')) === 'not_teacher');
  const t = await lesson('tutor');
  ok('a tutor reads a published lesson plan, answers included', t.status === 'ok' && JSON.stringify(t.lesson).includes('SECRET'), JSON.stringify(t));
  ok('a platform admin reads it', (await st('admin')) === 'ok');
  ok('lessons in review are hidden from tutors…', (await st('tutor', 'alg1.coordinate-plane')) === 'missing');
  const rv = await lesson('admin', 'alg1.coordinate-plane');
  ok('…but platform admins see them, marked as review', rv.status === 'ok' && rv.review === true);
  ok('an unknown lesson is "missing" for a teacher', (await st('tutor', 'alg1.nope')) === 'missing');
  ok('school instructor: not a teacher while the plan doesn’t include the Teacher Curriculum (new plans include nothing)', (await st('aInstr')) === 'not_teacher');
  await db.exec(`insert into public.plan_resources (plan_id, resource_id) values ('new-plan', 'feature.teacher-curriculum');
                 insert into public.organization_resource_settings (organization_id, resource_id, enabled) values ('${orgA}', 'feature.teacher-curriculum', true);`);
  ok('school instructor: a teacher once the licence includes it and it’s switched on', (await st('aInstr')) === 'ok');
  ok('school owner: a teacher too', (await st('aOwner')) === 'ok');
  ok('school student: never a teacher, even with the feature on', (await st('aStu')) === 'not_teacher');
  const acc = (await as('aInstr', 'select public.teacher_curriculum_access() j')).rows[0].j;
  ok('teacher_curriculum_access() tells the page', acc.signed_in === true && acc.teacher === true);
  await db.exec(`update public.organization_resource_settings set enabled = false where organization_id = '${orgA}'`);
  ok('school switches it off: instructors lose access', (await st('aInstr')) === 'not_teacher');
  await db.exec(`update public.organization_resource_settings set enabled = true where organization_id = '${orgA}';
                 update public.subscriptions set status = 'suspended' where organization_id = '${orgA}'`);
  ok('licence suspended: instructors lose access', (await st('aInstr')) === 'not_teacher');
  await db.exec(`update public.subscriptions set status = 'active' where organization_id = '${orgA}';
                 update public.organization_memberships set status = 'removed' where user_id = '${U.aInstr.id}'`);
  ok('instructor removed from the school: loses access', (await st('aInstr')) === 'not_teacher');
  await db.exec(`delete from auth.sessions where user_id = '${U.tutor.id}'`);
  ok('signed out (session revoked): a tutor loses access at once', (await st('tutor')) === 'not_teacher');
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
