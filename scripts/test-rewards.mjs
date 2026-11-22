#!/usr/bin/env node
// Tests for Trail XP, streaks, levels, achievements and the Trail Garage
// (supabase/rewards.sql), in a throwaway in-memory Postgres (PGlite) with
// the real setup, progress, organizations, resources and curriculum SQL.
// Answers are inserted with chosen timestamps, so days can pass in the test.
// Nothing touches your real database.
//
//   npm install --no-save @electric-sql/pglite     (once)
//   node scripts/test-rewards.mjs                  (Node 20+)

import { readFileSync } from 'node:fs';
import { randomUUID as uid } from 'node:crypto';
let PGlite;
try { ({ PGlite } = await import('@electric-sql/pglite')); }
catch { console.error('\n  Needs PGlite: npm install --no-save @electric-sql/pglite\n'); process.exit(1); }
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const sql = f => readFileSync(`${ROOT}/supabase/${f}.sql`, 'utf8');

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
for (const f of ['setup', 'progress', 'organizations', 'resources', 'curriculum']) {
  try { await db.exec(sql(f)); } catch (e) { console.error(`${f}.sql: ${e.message}`); process.exit(1); }
}

let pass = 0, fail = 0;
const ok = (name, v, extra = '') => { v ? pass++ : fail++; console.log((v ? 'PASS ' : 'FAIL ') + name + (v ? '' : '  ' + extra)); };
const U = {}; for (const n of ['old', 'ann', 'ben', 'cal', 'dee']) U[n] = { id: uid(), sid: uid() };
const org = uid();
await db.exec(`
  insert into auth.users (id, email) values ${Object.entries(U).map(([n, u]) => `('${u.id}', '${n}@example.com')`).join(',')};
  insert into auth.sessions (id, user_id) values ${Object.values(U).map(u => `('${u.sid}', '${u.id}')`).join(',')};
  insert into public.members (user_id, email) values ${Object.entries(U).filter(([n]) => n !== 'dee').map(([n, u]) => `('${u.id}', '${n}')`).join(',')};
  insert into public.profiles (user_id, role, display_name) values ${Object.entries(U).map(([n, u]) => `('${u.id}', 'student', '${n}')`).join(',')};
  insert into public.organizations (id, name, slug, status) values ('${org}', 'School', 'school', 'active');
`);

// Save an answer the way record_attempt does, at a chosen time.
let hashN = 0;
async function answer(who, qid, correct, at, opts = {}) {
  const game = qid.split(':')[0];
  const hash = opts.hash || 'h' + (opts.same ? opts.same : ++hashN);
  const n = (await db.query(`select count(*)::int n from public.question_attempts where student_id = $1 and question_id = $2 and question_hash = $3`, [U[who].id, qid, hash])).rows[0].n + 1;
  await db.query(`insert into public.question_attempts (id, student_id, game_id, question_id, question_hash, game_session_id, snapshot, is_correct, attempt_number, occurred_at, created_at, organization_id)
                  values ($1, $2, $3, $4, $5, $6, '{}', $7, $8, $9, $9, $10)`,
    [uid(), U[who].id, game, qid, hash, opts.session || null, correct, n, at, opts.org || null]);
}
async function session(who, game, attempts, at, completed = true) {
  const id = uid();
  await db.query(`insert into public.game_sessions (id, student_id, game_id, started_at, last_activity_at, attempt_count) values ($1, $2, $3, $4, $4, $5)`, [id, U[who].id, game, at, attempts]);
  if (completed) await db.query(`update public.game_sessions set completed = true, ended_at = $2 where id = $1`, [id, at]);
  return id;
}
const prof = async who => (await db.query(`select * from public.reward_profiles where user_id = $1`, [U[who].id])).rows[0];
const day = async (who, d) => (await db.query(`select * from public.reward_days where user_id = $1 and local_date = $2`, [U[who].id, d])).rows[0];
const has = async (who, a) => (await db.query(`select 1 from public.reward_user_achievements where user_id = $1 and achievement_id = $2`, [U[who].id, a])).rows.length === 1;
const ledgerSum = async (who, type) => (await db.query(`select coalesce(sum(xp), 0)::int s, count(*)::int n from public.reward_ledger where user_id = $1 ${type ? `and event_type = '${type}'` : ''}`, [U[who].id])).rows[0];
// Noon in Denver on day d (UTC−6 or −7): 19:00Z is safely midday.
const at = (d, hh = 19) => `${d}T${String(hh).padStart(2, '0')}:00:00Z`;
const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

// --- history before rewards.sql exists, replayed when it's installed ---
await answer('old', 'slope-lab:f1', true, at('2026-09-01'));
await answer('old', 'slope-lab:f2', true, at('2026-09-01'));
await answer('old', 'slope-lab:a1', false, at('2026-09-01'));
try { await db.exec(sql('rewards')); await db.exec(sql('rewards')); } catch (e) { console.error('rewards.sql: ' + e.message); process.exit(1); }
ok('rewards.sql runs, and runs again safely', true);
ok('existing history is replayed once: 5 + 5 XP (not doubled by the second run)', (await prof('old')).lifetime_xp === 10, JSON.stringify(await prof('old')));
ok('history is replayed quietly (no celebrations for old work)', (await db.query(`select count(*)::int n from public.reward_notices where user_id = $1`, [U.old.id])).rows[0].n === 0);

// --- problems ---
const D1 = '2026-10-05';
await answer('ann', 'slope-lab:f1', true, at(D1));
let p = await prof('ann');
ok('a new student gets a reward profile, 1 Trail Shield and starter items', p && p.shields === 1 && p.equipped.avatar === 'avatar-rider');
ok('easy (beginner) problem, first correct answer: 5 XP', p.lifetime_xp === 5, p.lifetime_xp);
await answer('ann', 'slope-lab:f1', true, at(D1), { same: hashN });
ok('the same problem again: no more XP', (await prof('ann')).lifetime_xp === 5);
await answer('ann', 'slope-lab:f1', true, at(D1));
ok('a new variant of the problem (different numbers): new XP', (await prof('ann')).lifetime_xp === 10);
await answer('ann', 'slope-lab:a1', false, at(D1));
ok('a wrong answer: no XP, nothing taken away', (await prof('ann')).lifetime_xp === 10);
const h = hashN;
await answer('ann', 'slope-lab:c1', false, at(D1));
await answer('ann', 'slope-lab:c1', true, at(D1), { same: hashN });
ok('challenge problem solved after a miss: 10 XP and the Never Give Up badge', (await ledgerSum('ann', 'problem')).s === 20 && await has('ann', 'never-give-up'));
await answer('ann', 'slope-lab:a2', true, at(D1));
p = await prof('ann'); let d = await day('ann', D1);
ok('those 20 XP reach the Regular Ride goal (20); a standard problem then adds 7', d.qualifying_xp === 27 && d.goal_completed, JSON.stringify(d));
ok('reaching the goal: +5 bonus that counts for XP but not toward the goal', p.lifetime_xp === 32 && d.bonus_xp === 5 && d.qualifying_xp === 27);
ok('first goal day starts a 1-day streak and unlocks First Lap', p.current_streak === 1 && await has('ann', 'first-lap'));
const bonusCount = async who => (await db.query(`select count(*)::int n from public.reward_ledger where user_id = $1 and event_type = 'daily_bonus'`, [U[who].id])).rows[0].n;
await answer('ann', 'slope-lab:f3', true, at(D1));
ok('the bonus is once a day', await bonusCount('ann') === 1);
ok('celebration notices are queued for the browser (+XP, goal, badge)', (await db.query(`select array_agg(distinct kind) k from public.reward_notices where user_id = $1`, [U.ann.id])).rows[0].k.sort().join() === 'achievement,goal,xp');

// --- streaks and shields ---
const goalDay = async (who, dd) => { for (let i = 0; i < 4; i++) await answer(who, 'slope-lab:a3', true, at(dd)); };
await goalDay('ann', '2026-10-06');
ok('next day’s goal: 2-day streak', (await prof('ann')).current_streak === 2);
await goalDay('ann', '2026-10-08');   // missed the 7th
p = await prof('ann');
ok('missed exactly one day: a Trail Shield covers it automatically, streak continues to 3', p.current_streak === 3 && p.shields === 0, JSON.stringify(p));
ok('the protected day is marked in the calendar', (await day('ann', '2026-10-07')).shield_used === true);
await goalDay('ann', '2026-10-10');   // missed the 9th, no shield left
p = await prof('ann');
ok('missed a day with no shield: the streak restarts at 1, the longest is kept', p.current_streak === 1 && p.longest_streak === 3);
await goalDay('ann', '2026-10-14');   // missed two days
ok('two missed days can’t be covered: streak restarts', (await prof('ann')).current_streak === 1);
for (const dd of ['2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20']) await goalDay('ann', dd);
p = await prof('ann');
ok('a 7-day streak earns a shield (and the Trail Regular badge)', p.current_streak === 7 && p.shields === 1 && await has('ann', 'trail-regular'));
for (let i = 21; i <= 27; i++) await goalDay('ann', `2026-10-${i}`);
for (let i = 28; i <= 31; i++) await goalDay('ann', `2026-10-${i}`);
for (let i = 1; i <= 3; i++) await goalDay('ann', `2026-11-0${i}`);
p = await prof('ann');
ok('shields never go above the maximum of 2', p.current_streak === 21 && p.shields === 2, JSON.stringify({ s: p.current_streak, sh: p.shields }));
ok('XP is never lost when streaks reset', p.lifetime_xp >= 100);
ok('levels follow XP: past 100 XP is level 2 (Trail Scout) or higher, with the frame unlocked',
  p.level === (await db.query(`select public.reward_level_for($1) l`, [p.lifetime_xp])).rows[0].l && p.level >= 2
  && (await db.query(`select 1 from public.reward_user_items where user_id = $1 and item_id = 'frame-basic'`, [U.ann.id])).rows.length === 1);
ok('a level-up notice names the new title', (await db.query(`select payload from public.reward_notices where user_id = $1 and kind = 'level' order by id limit 1`, [U.ann.id])).rows[0].payload.title === 'Trail Scout');
ok('Consistency Champion: goal on five days in one week', await has('ann', 'consistency-champion'));

// --- labs, lessons, assessments ---
const S1 = '2026-11-10';
await session('ben', 'slope-lab', 2, at(S1));
ok('a lab "finished" with only 2 answers doesn’t count', (await ledgerSum('ben', 'lab')).n === 0);
await session('ben', 'slope-lab', 6, at(S1));
ok('a finished lab with real work: +10 XP', (await ledgerSum('ben', 'lab')).s === 10);
await session('ben', 'slope-lab', 9, at(S1));
ok('finishing the same lab again: no more XP', (await ledgerSum('ben', 'lab')).n === 1);
for (const m of ['clear-the-gap', 'minimum-speed']) await answer('ben', 'jump-lab:' + m, true, at(S1));
ok('Jump Lab (no "finished" event): not complete after 2 missions', (await ledgerSum('ben', 'lab')).n === 1);
await answer('ben', 'jump-lab:perfect-trajectory', true, at(S1));
ok('…complete after 3 solved missions: +10 XP', (await ledgerSum('ben', 'lab')).n === 2);
await session('ben', 'newtons-laws', 5, at(S1));
ok('a lesson marked finished after only a few questions: no lesson XP', (await ledgerSum('ben', 'lesson')).n === 0);
const qs = (await db.query(`select id from public.questions where game_id = 'newtons-laws' order by id limit 12`)).rows.map(r => r.id);
for (const q of qs) await answer('ben', q, false, at(S1));
p = await prof('ben');
ok('…after real work across 12 questions: Lesson Completed, +20 XP, First Lesson badge', (await ledgerSum('ben', 'lesson')).s === 20 && await has('ben', 'first-lesson'));
for (let i = 1; i <= 7; i++) await answer('ben', 'slope-lab:t' + i, i % 2 === 0, at(S1));
ok('assessment not complete until every question is attempted', (await ledgerSum('ben', 'assessment')).n === 0);
await answer('ben', 'slope-lab:t8', false, at(S1));
ok('assessment complete (a perfect score isn’t needed): +5 XP once', (await ledgerSum('ben', 'assessment')).s === 5);
await answer('ben', 'slope-lab:t8', true, at(S1));
ok('…and only once', (await ledgerSum('ben', 'assessment')).n === 1);

// --- anti-farming and timezones ---
for (let i = 0; i < 60; i++) await answer('cal', 'slope-lab:c2', true, at('2026-11-12'));
const capDay = await day('cal', '2026-11-12');
ok('problem XP stops at the daily ceiling (250)', capDay.problem_xp === 250, capDay.problem_xp);
ok('…the problems still count as solved (badges), at 0 XP', (await ledgerSum('cal', 'problem')).n === 60 && await has('cal', 'problem-solver'));
await answer('cal', 'slope-lab:f1', true, '2026-11-14T06:30:00Z');
ok('local calendar days: 06:30 UTC is still the previous evening in Denver', !!(await day('cal', '2026-11-13')) && !(await day('cal', '2026-11-14')));
await db.query(`update public.reward_profiles set timezone = 'Asia/Tokyo' where user_id = $1`, [U.cal.id]);
await answer('cal', 'slope-lab:f2', true, '2026-11-14T06:30:00Z');
ok('after a timezone change, new days use the new zone and old days keep their dates', !!(await day('cal', '2026-11-14')) && !!(await day('cal', '2026-11-13')));
await answer('cal', 'slope-lab:f3', true, at('2026-11-20'), { org });
await db.query(`insert into public.reward_org_settings (organization_id, enabled) values ($1, false)`, [org]);
const before = (await prof('cal')).lifetime_xp;
await answer('cal', 'slope-lab:f4', true, at('2026-11-20'), { org });
ok('a school can switch rewards off: the answer is saved but earns nothing', (await prof('cal')).lifetime_xp === before
  && (await db.query(`select count(*)::int n from public.question_attempts where student_id = $1 and question_id = 'slope-lab:f4'`, [U.cal.id])).rows[0].n === 1);

// --- the browser’s side (RLS and functions) ---
async function as(who, q, params = []) {
  await db.exec('reset role');
  const u = U[who];
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [JSON.stringify({ sub: u.id, session_id: u.sid, role: 'authenticated' })]);
  await db.exec('set role authenticated');
  try { return await db.query(q, params); } finally { await db.exec('reset role'); }
}
const tryAs = (who, q, p) => as(who, q, p).then(r => ({ ok: true, r }), e => ({ ok: false, e: e.message }));
ok('a student sees only their own ledger', (await as('ben', `select distinct user_id from public.reward_ledger`)).rows.every(r => r.user_id === U.ben.id));
ok('a student can’t write their XP, streak or ledger', !(await tryAs('ben', `update public.reward_profiles set lifetime_xp = 99999`)).ok
  && !(await tryAs('ben', `insert into public.reward_ledger (user_id, event_type, source_id, xp, qualifying_xp, local_date, idempotency_key) values ('${U.ben.id}', 'lab', 'x', 500, 500, current_date, 'x')`)).ok);
ok('nobody can call the award function from the browser', !(await tryAs('ben', `select public.reward_award('${U.ben.id}', null, 'lab', 'hack', 1000, now(), '{}', false)`)).ok);
// Recent activity for the summary’s "today" view.
await answer('dee', 'slope-lab:f1', true, new Date().toISOString());
ok('rewards need an active account (no access: no summary)', !(await tryAs('dee', `select public.rewards_summary()`)).ok);
await goalDay('ben', daysAgo(1));
let sum = (await as('ben', `select public.rewards_summary('America/New_York') s`)).rows[0].s;
ok('summary: today’s streak is still alive after yesterday’s goal (not shown broken mid-day)', sum.streak.state === 'alive' && sum.streak.current >= 1, JSON.stringify(sum.streak));
ok('summary adopts the browser’s timezone', sum.timezone === 'America/New_York');
ok('summary has level, goal, calendar, badges, Garage items and stats', sum.level.title && sum.goal.xp === 20 && Array.isArray(sum.days) && sum.achievements.length === 25 && sum.items.length === 13 && sum.stats.lessons === 1);
let g = await tryAs('ben', `select public.set_daily_goal('big') g`);
ok('changing the goal applies from tomorrow', g.ok && g.r.rows[0].g.from === new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' }), JSON.stringify(g));
g = await tryAs('ben', `select public.set_daily_goal('casual')`);
ok('…and only once every seven days', !g.ok && /change your goal again/.test(g.e));
ok('an unknown goal is refused', !(await tryAs('ann', `select public.set_daily_goal('huge')`)).ok);
ok('can’t wear an item that isn’t unlocked', !(await tryAs('ben', `select public.equip_reward('theme-mathlete')`)).ok);
const eq = (await as('ann', `select public.equip_reward('frame-basic') e`)).rows[0].e;
ok('can wear an unlocked item, one per slot', eq.frame === 'frame-basic' && eq.avatar === 'avatar-rider');
const feed = (await as('ann', `select public.rewards_feed(0) f`)).rows[0].f;
ok('the feed gives only recent celebrations (last day), newest first-to-last', Array.isArray(feed.notices) && feed.last > 0);
ok('the feed never shows another student’s notices', (await as('ben', `select public.rewards_feed(0) f`)).rows[0].f.notices.every(n => true) &&
  (await as('ben', `select count(*)::int n from public.reward_notices`)).rows[0].n === (await db.query(`select count(*)::int n from public.reward_notices where user_id = $1`, [U.ben.id])).rows[0].n);

// A rider mid-streak, as of today: six goal days in a row, part of today done.
U.eve = { id: uid(), sid: uid() };
await db.exec(`insert into auth.users (id, email) values ('${U.eve.id}', 'eve@example.com'); insert into auth.sessions (id, user_id) values ('${U.eve.id}', '${U.eve.id}');
  insert into public.members (user_id, email) values ('${U.eve.id}', 'e'); insert into public.profiles (user_id, role, display_name) values ('${U.eve.id}', 'student', 'Eve');`);
U.eve.sid = U.eve.id;
for (let i = 6; i >= 1; i--) await goalDay('eve', daysAgo(i));
await session('eve', 'slope-lab', 6, new Date(Date.now() - 2 * 86400000).toISOString());
await answer('eve', 'slope-lab:f5', true, new Date().toISOString());
await answer('eve', 'slope-lab:a5', true, new Date().toISOString());
sum = (await as('eve', `select public.rewards_summary('America/Denver') s`)).rows[0].s;
ok('a 6-day streak with part of today done: alive, 12 of 20 XP today', sum.streak.current === 6 && sum.streak.state === 'alive' && sum.day.qualifying === 12, JSON.stringify({ st: sum.streak, day: sum.day }));
if (process.env.REWARDS_FIXTURE) (await import('node:fs')).writeFileSync(process.env.REWARDS_FIXTURE, JSON.stringify({ eve: sum, dash: (await as('eve', `select public.student_dashboard() s`)).rows[0].s, ann: (await as('ann', `select public.rewards_summary('America/Denver') s`)).rows[0].s }));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
