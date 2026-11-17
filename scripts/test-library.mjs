#!/usr/bin/env node
// Permission tests for the Resources library (supabase/library.sql), run in
// a throwaway in-memory Postgres (PGlite) with stand-ins for Supabase's auth
// and storage schemas. Loads the real setup, progress, organizations,
// resources and library SQL, then checks every role: visitor, direct
// student, tutor, admin, two schools' admins, instructor and students.
// Nothing touches your real database.
//
//   npm install --no-save @electric-sql/pglite     (once, in this folder)
//   node scripts/test-library.mjs                  (Node 20+)

import { readFileSync } from 'node:fs';
import { randomUUID as uid } from 'node:crypto';
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); }
catch { console.error('\n  Needs PGlite: npm install --no-save @electric-sql/pglite\n'); process.exit(1); }
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

async function makeDb(root) {
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
  for (const f of ['setup', 'progress', 'organizations', 'resources', 'library']) {
    try { await db.exec(readFileSync(`${root}/supabase/${f}.sql`, 'utf8')); }
    catch (e) { throw new Error(`${f}.sql: ${e.message}`); }
  }
  return db;
}

const db = await makeDb(ROOT);

let pass = 0, fail = 0;
const ok = (name, v, extra = '') => { v ? pass++ : fail++; console.log((v ? 'PASS ' : 'FAIL ') + name + (v ? '' : '  ' + extra)); };
const U = {}; for (const n of ['admin', 'tutor', 'dstudent', 'aAdmin', 'aInstr', 'aStu', 'bAdmin', 'bStu', 'nobody']) U[n] = { id: uid(), sid: uid() };
const orgA = uid(), orgB = uid();
await db.exec(`
  insert into auth.users (id, email) values ${Object.entries(U).map(([n, u]) => `('${u.id}', '${n}@example.com')`).join(',')};
  insert into auth.sessions (id, user_id) values ${Object.values(U).map(u => `('${u.sid}', '${u.id}')`).join(',')};
  insert into public.platform_admins (user_id) values ('${U.admin.id}');
  insert into public.members (user_id, email) values ('${U.admin.id}', 'a'), ('${U.tutor.id}', 't'), ('${U.dstudent.id}', 'd');
  insert into public.profiles (user_id, role, display_name) values ('${U.admin.id}', 'admin', 'Admin'), ('${U.tutor.id}', 'tutor', 'Tutor'), ('${U.dstudent.id}', 'student', 'Dee');
  insert into public.organizations (id, name, slug, status) values ('${orgA}', 'School A', 'school-a', 'active'), ('${orgB}', 'School B', 'school-b', 'active');
  insert into public.plans (id, name) values ('test-plan', 'Test') on conflict do nothing;
  insert into public.subscriptions (organization_id, plan_id, status, starts_on, billing_interval, seat_allowance) values
    ('${orgA}', 'test-plan', 'active', current_date - 1, 'year', 30), ('${orgB}', 'test-plan', 'active', current_date - 1, 'year', 30);
  insert into public.organization_memberships (organization_id, user_id, role) values
    ('${orgA}', '${U.aAdmin.id}', 'admin'), ('${orgA}', '${U.aInstr.id}', 'instructor'), ('${orgA}', '${U.aStu.id}', 'student'),
    ('${orgB}', '${U.bAdmin.id}', 'admin'), ('${orgB}', '${U.bStu.id}', 'student');
`);
const cat = (await db.query(`select id from public.library_categories where slug = 'math'`)).rows[0].id;
const cat2 = (await db.query(`select id from public.library_categories where slug = 'study-skills'`)).rows[0].id;
async function as(who, sql, params = []) {
  await db.exec('reset role');
  if (who === 'anon') { await db.query(`select set_config('request.jwt.claims', '{"role":"anon"}', false)`); await db.exec('set role anon'); }
  else { const u = U[who]; await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: u.id, session_id: u.sid, role: 'authenticated' })]); await db.exec('set role authenticated'); }
  try { return await db.query(sql, params); } finally { await db.exec('reset role'); }
}
const tryAs = (who, sql, params) => as(who, sql, params).then(r => ({ ok: true, r }), e => ({ ok: false, e: e.message }));
const save = (who, o) => tryAs(who, 'select public.library_save_item($1::jsonb) j', [JSON.stringify(o)]).then(x => x.ok ? { ok: true, ...x.r.rows[0].j } : x);
const base = (extra) => ({ title: 'Algebra study guide', description: 'How to study algebra.', resource_type: 'written', category_id: cat, content: '# Hi\nText', visibility: 'public', status: 'draft', tags: ['Algebra', 'Exam Preparation'], ...extra });
const visible = async (who, id) => (await as(who, 'select count(*)::int n from public.library_items where id = $1', [id])).rows[0].n === 1;
const searchIds = async (who, args = '') => (await as(who, `select public.library_search(${args || 'null'}) j`)).rows[0].j.items.map(i => i.id);

// --- tutor: drafts, not publishing ---
const t1 = await save('tutor', base());
ok('tutor can create a Mathlete-wide draft', t1.ok && t1.status === 'draft', JSON.stringify(t1));
const t2 = await save('tutor', base({ title: 'Tutor tries to publish', status: 'published' }));
ok('tutor cannot publish Mathlete-wide', !t2.ok && /admin needs to publish/i.test(t2.e), JSON.stringify(t2));
const t3 = await save('tutor', base({ title: 'Staff notes', visibility: 'private', status: 'published' }));
ok('tutor can publish a staff-only (private) resource', t3.ok && t3.status === 'published', JSON.stringify(t3));
const t4 = await save('tutor', base({ title: 'Featured try', is_featured: true }));
ok('tutor cannot feature', t4.ok && !(await db.query('select is_featured from public.library_items where id = $1', [t4.id])).rows[0].is_featured);
ok('anon cannot see a draft', !(await visible('anon', t1.id)));
ok('student cannot see a draft', !(await visible('dstudent', t1.id)));
ok('tutor sees own draft', await visible('tutor', t1.id));
ok('anon cannot see staff-only resource', !(await visible('anon', t3.id)) && !(await visible('dstudent', t3.id)));
ok('another staff member (admin) sees staff-only resource', await visible('admin', t3.id));

// --- admin publishes ---
const p1 = await tryAs('admin', `select public.library_set_status($1, 'published')`, [t1.id]);
ok('admin publishes the tutor draft', p1.ok, p1.e);
ok('anon sees published Mathlete-wide resource', await visible('anon', t1.id));
ok('school student sees Mathlete-wide resource too', await visible('bStu', t1.id));
const t5 = await save('tutor', { ...base(), id: t1.id, title: 'Changed after publishing' });
ok('tutor can no longer edit it once published', !t5.ok, JSON.stringify(t5));
const g = (await as('anon', `select public.library_get($1) j`, [t1.slug])).rows[0].j;
ok('library_get works for visitors, with category name', g && g.category_name === 'Math & Mathematics' && !('search' in g));
ok('search finds it by word prefix ("alg")', (await searchIds('anon', `'alg'`)).includes(t1.id));
ok('search finds it by tag', (await searchIds('anon', `null, null, null, 'Exam Preparation'`)).includes(t1.id));
ok('search does not return drafts even to their author', !(await searchIds('tutor')).includes(t4.id));

// --- schools ---
const a1 = await save('aInstr', base({ title: 'School A guide', visibility: 'organization', organization_id: orgA }));
ok('instructor can draft a school resource', a1.ok, JSON.stringify(a1));
const a2 = await save('aInstr', base({ title: 'School A publish try', visibility: 'organization', organization_id: orgA, status: 'published' }));
ok('instructor cannot publish to students', !a2.ok);
const a3 = await tryAs('aAdmin', `select public.library_set_status($1, 'published')`, [a1.id]);
ok('school admin publishes it', a3.ok, a3.e);
ok('School A student sees it', await visible('aStu', a1.id));
ok('School B student does NOT see it', !(await visible('bStu', a1.id)));
ok('School B admin does NOT see it', !(await visible('bAdmin', a1.id)));
ok('direct student and visitor do NOT see it', !(await visible('dstudent', a1.id)) && !(await visible('anon', a1.id)));
ok('library_get returns nothing to School B', (await as('bStu', `select public.library_get($1) j`, [a1.slug])).rows[0].j === null);
ok('School B search does not include it', !(await searchIds('bStu')).includes(a1.id));
ok('School A search includes it with the school name', (await as('aStu', `select public.library_search() j`)).rows[0].j.items.some(i => i.id === a1.id && i.organization_name === 'School A'));
ok('school name lookup refuses a school you cannot see', (await as('anon', `select public.library_org_name($1) n`, [orgA])).rows[0].n === null);
const a4 = await save('aAdmin', base({ title: 'School admin public try', visibility: 'public', status: 'published' }));
ok('school admin cannot create Mathlete-wide resources', !a4.ok);
const a5 = await save('aAdmin', { ...base(), id: t1.id });
ok('school admin cannot edit Mathlete-wide resources', !a5.ok);
const a6 = await save('bAdmin', base({ title: 'B into A', visibility: 'organization', organization_id: orgA }));
ok('School B admin cannot add to School A', !a6.ok);
const a7 = await save('bAdmin', { ...base(), id: a1.id, visibility: 'organization', organization_id: orgB });
ok('School B admin cannot edit (or steal) School A resource', !a7.ok);
const a8 = await save('aInstr', base({ title: 'A staff only', visibility: 'private', organization_id: orgA, status: 'published' }));
ok('instructor publishes a school staff-only resource', a8.ok);
ok('School A admin sees it, School A student does not', await visible('aAdmin', a8.id) && !(await visible('aStu', a8.id)));
await db.exec(`update public.subscriptions set ends_on = current_date - 1, starts_on = current_date - 30 where organization_id = '${orgA}'`);
ok('expired licence: School A student loses school resources', !(await visible('aStu', a1.id)) && await visible('aStu', t1.id));
await db.exec(`update public.subscriptions set ends_on = null where organization_id = '${orgA}'`);

// --- everyone else ---
ok('direct student cannot save anything', !(await save('dstudent', base())).ok);
ok('signed-in account without any role cannot save', !(await save('nobody', base())).ok);
ok('visitor cannot call save', !(await save('anon', base())).ok);
ok('nobody can write the table directly', !(await tryAs('admin', `insert into public.library_items (slug, title, description, resource_type, category_id) values ('x', 'x', 'x', 'written', '${cat}')`)).ok);
ok('visitor cannot delete', !(await tryAs('anon', `select public.library_delete_item($1)`, [t1.id])).ok);
ok('student cannot delete', !(await tryAs('aStu', `select public.library_delete_item($1)`, [a1.id])).ok && await visible('aStu', a1.id));

// --- validation ---
ok('video must be YouTube or Vimeo', !(await save('admin', base({ resource_type: 'video', external_url: 'https://evil.example.com/v.mp4' }))).ok);
ok('YouTube video accepted', (await save('admin', base({ title: 'A video', resource_type: 'video', external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'published' }))).ok);
ok('javascript: links refused', !(await save('admin', base({ resource_type: 'article', external_url: 'javascript:alert(1)' }))).ok);
const d1 = await save('admin', base({ title: 'A doc', resource_type: 'document', content: null }));
ok('document cannot be published without its file', !(await save('admin', { ...base({ title: 'A doc', resource_type: 'document' }), id: d1.id, status: 'published' })).ok);
ok('file path from another resource is refused', !(await save('admin', { ...base({ title: 'A doc', resource_type: 'document' }), id: d1.id, file_path: `items/${t1.id}/x.pdf`, file_name: 'x.pdf', file_type: 'application/pdf', file_size: 10 })).ok);
const d2 = await save('admin', { ...base({ title: 'A doc', resource_type: 'document' }), id: d1.id, file_path: `items/${d1.id}/guide.pdf`, file_name: 'guide.pdf', file_type: 'application/pdf', file_size: 1000, status: 'published' });
ok('document publishes once its file is attached', d2.ok && d2.status === 'published', JSON.stringify(d2));
ok('duplicate titles get unique addresses', (await save('admin', base({ title: 'Algebra study guide' }))).slug === 'algebra-study-guide-2');

// --- storage ---
const obj = (who, item, verb = 'insert') => tryAs(who, `insert into storage.objects (bucket_id, name) values ('library', $1)`, [`items/${item}/file.pdf`]);
ok('tutor can upload to own draft', (await obj('tutor', t4.id)).ok);
ok('tutor cannot upload to a published resource', !(await obj('tutor', t1.id)).ok);
ok('School B admin cannot upload into School A resource', !(await obj('bAdmin', a1.id)).ok);
ok('visitor cannot upload', !(await obj('anon', t4.id)).ok);
ok('uploads outside items/<id>/ are refused', !(await tryAs('admin', `insert into storage.objects (bucket_id, name) values ('library', 'loose.pdf')`)).ok);
await db.exec(`insert into storage.objects (bucket_id, name) values ('library', 'items/${d1.id}/guide.pdf'), ('library', 'items/${a1.id}/a.pdf')`);
const seeObj = async (who, name) => (await as(who, `select count(*)::int n from storage.objects where bucket_id = 'library' and name = $1`, [name])).rows[0].n === 1;
ok('visitor can read a public published file (for signed links)', await seeObj('anon', `items/${d1.id}/guide.pdf`));
ok('School A file: A student yes, B student no, visitor no', await seeObj('aStu', `items/${a1.id}/a.pdf`) && !(await seeObj('bStu', `items/${a1.id}/a.pdf`)) && !(await seeObj('anon', `items/${a1.id}/a.pdf`)));
const bucket = (await db.query(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'library'`)).rows[0];
ok('bucket is private, 50 MB, no HTML/SVG/scripts', bucket.public === false && +bucket.file_size_limit === 52428800 && !bucket.allowed_mime_types.some(m => /html|svg|javascript|x-msdownload|octet/.test(m)));

// --- categories, tags, featured ---
ok('tutor cannot create categories', !(await tryAs('tutor', `select public.library_save_category(null, 'Tutor cat')`)).ok);
ok('admin creates a category', (await tryAs('admin', `select public.library_save_category(null, 'Test Prep')`)).ok);
const dc = await tryAs('admin', `select public.library_delete_category($1)`, [cat]);
ok('category with resources cannot be deleted', !dc.ok && /Move its/.test(dc.e), dc.e);
ok('empty category can be deleted', (await tryAs('admin', `select public.library_delete_category($1)`, [cat2])).ok);
ok('admin renames a tag everywhere', (await as('admin', `select public.library_rename_tag('Algebra', 'Algebra 1') n`)).rows[0].n >= 1 && (await searchIds('anon', `null, null, null, 'Algebra 1'`)).includes(t1.id));
ok('tutor cannot rename tags', !(await tryAs('tutor', `select public.library_rename_tag('Algebra 1', 'x')`)).ok);
await save('admin', { ...base(), id: t1.id, title: 'Algebra study guide', status: 'published', is_featured: true, tags: ['Algebra 1'] });
ok('featured filter returns featured resources', (await searchIds('anon', `null, null, null, null, null, null, null, true`)).join() === t1.id);
const acc = (await as('aInstr', `select public.library_access() j`)).rows[0].j;
ok('library_access describes an instructor', acc.signed_in && !acc.platform && !acc.direct_author && acc.orgs.length === 1 && acc.orgs[0].role === 'instructor' && !acc.orgs[0].can_publish);
ok('library_access for admin', (await as('admin', `select public.library_access() j`)).rows[0].j.platform === true);
ok('admin can delete', (await tryAs('admin', `select public.library_delete_item($1)`, [t3.id])).ok && !(await visible('admin', t3.id)));
const ml = async who => (await as(who, `select public.library_manage_list() j`)).rows[0].j;
const tl = await ml('tutor'); ok('manage list: tutor sees own items, published ones read-only', tl.some(i => i.id === t1.id && !i.can_manage) && tl.some(i => i.id === t4.id && i.can_manage && !i.can_publish && i.created_by_name === 'You'));
const bl = await ml('bAdmin'); ok('manage list: School B admin sees nothing from School A or Mathlete-wide', !bl.some(i => i.organization_id === orgA || i.visibility === 'public'));
ok('manage list: visitor gets nothing', (await tryAs('anon', `select public.library_manage_list()`)).ok === false);
ok('edit fetch refused for someone who cannot manage', !(await tryAs('aStu', `select public.library_get_for_edit($1)`, [a1.id])).ok);
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
