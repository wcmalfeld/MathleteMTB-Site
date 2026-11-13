#!/usr/bin/env node
// End-to-end MTB Coaching test against your real Supabase project
// (Node 18+). Run it after supabase/coaching.sql, and again whenever that
// file changes:
//   node scripts/test-coaching.mjs
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in
// .env. It creates throwaway accounts (two riders, a coach, a coach with
// no riders, the rider's academic tutor), checks that riders and coaches
// see and change only what they should and that coaching and tutoring
// stay separate, then deletes all of it. No real person's data is read
// or touched.

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const env = { ...process.env };
const envFile = new URL('../.env', import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const BASE = (env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/, '');
const ANON = env.SUPABASE_ANON_KEY || '';
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || '';
if (typeof fetch !== 'function') { console.error('Needs Node 18+ (try: nvm use 20).'); process.exit(1); }
if (!BASE || !ANON || !SERVICE) { console.error('Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.'); process.exit(1); }

async function call(method, path, { key = ANON, token, body, headers = {} } = {}) {
  const h = { apikey: key, Authorization: 'Bearer ' + (token || key), ...headers };
  let payload;
  if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + path, { method, headers: h, body: payload });
  const text = await res.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, data, text };
}
const admin = (m, p, o = {}) => call(m, p, { ...o, key: SERVICE });
const results = [];
function record(name, pass, detail) {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined && !pass ? '  (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : ''}`);
}

const tag = randomBytes(4).toString('hex');
const pw = () => randomBytes(12).toString('base64url') + 'aA1!';
const people = {
  A: { role: 'student' },   // rider, coached by C, tutored by T
  B: { role: 'student' },   // another rider
  C: { role: 'coach', coach: ['jumping', 'tricks'] },
  K: { role: 'coach', coach: ['cornering'] },   // a coach with no riders
  T: { role: 'tutor' }      // A's academic tutor (not a coach)
};
const rpc = (who, fn, body = {}) => call('POST', `/rest/v1/rpc/${fn}`, { token: people[who].token, body });
const read = (who, table) => call('GET', `/rest/v1/${table}?select=*`, { token: people[who].token });
const rows = r => (Array.isArray(r.data) ? r.data : []);
const code = r => r.data && r.data.code;
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

async function main() {
  for (const [k, p] of Object.entries(people)) {
    p.email = `coaching-test-${k.toLowerCase()}-${tag}@example.com`;
    p.password = pw();
    const r = await admin('POST', '/auth/v1/admin/users', { body: { email: p.email, password: p.password, email_confirm: true } });
    if (!r.ok) throw new Error('could not create test user: ' + r.text);
    p.id = r.data.id;
    const m = await admin('POST', '/rest/v1/members', { body: { user_id: p.id, email: p.email, active: true, note: 'coaching test' }, headers: { Prefer: 'return=minimal' } });
    if (!m.ok) throw new Error('could not add member row: ' + m.text);
    const pr = await admin('POST', '/rest/v1/profiles', { body: { user_id: p.id, role: p.role, display_name: 'Test ' + k }, headers: { Prefer: 'return=minimal' } });
    if (!pr.ok) throw new Error('could not add profile (did you run supabase/coaching.sql? it allows the coach role): ' + pr.text);
    if (p.coach) {
      const c = await admin('POST', '/rest/v1/coaches', { body: { user_id: p.id, specialties: p.coach }, headers: { Prefer: 'return=minimal' } });
      if (!c.ok) throw new Error('could not add coach (did you run supabase/coaching.sql?): ' + c.text);
    }
    const t = await call('POST', '/auth/v1/token?grant_type=password', { body: { email: p.email, password: p.password } });
    if (!t.ok) throw new Error('could not log in test user: ' + t.text);
    p.token = t.data.access_token;
  }
  await admin('POST', '/rest/v1/athlete_coaches', { body: { athlete_id: people.A.id, coach_id: people.C.id }, headers: { Prefer: 'return=minimal' } });
  await admin('POST', '/rest/v1/student_tutors', { body: { student_id: people.A.id, tutor_id: people.T.id }, headers: { Prefer: 'return=minimal' } });

  let r = await rpc('A', 'coaching_home');
  record('A rider loads their coaching home, with their coach and specialties', r.ok && r.data.viewer === 'athlete' && r.data.coaches.length === 1 &&
         r.data.coaches[0].specialties.join() === 'Jumping,Tricks' && r.data.areas.length >= 9, r.data);

  r = await rpc('A', 'save_athlete_goal', { p_title: 'Land 360s consistently', p_horizon: 'quarter', p_area_id: 'tricks', p_why: 'Looks amazing' });
  const goal = r.data;
  record('A rider sets their own goal', r.ok && typeof goal === 'string', r.text);
  r = await rpc('C', 'save_goal_step', { p_goal_id: goal, p_title: 'Ten spins on the trampoline' });
  const step = r.data;
  record('Their coach adds a step to it', r.ok, r.text);
  r = await rpc('A', 'set_goal_step', { p_step_id: step, p_done: true });
  record('The rider ticks the step', r.ok && r.data === true, r.text);

  r = await rpc('C', 'save_training_item', { p_title: 'Two airbag sessions', p_sessions_target: 2, p_goal_id: goal, p_athlete: people.A.id });
  const item = r.data;
  record('The coach adds to the rider\'s plan', r.ok, r.text);
  r = await rpc('A', 'save_training_item', { p_item_id: item, p_title: 'Zero sessions' });
  record('The rider cannot rewrite what the coach planned', code(r) === 'PT403', r.text);

  for (let i = 0; i < 2; i++) {
    r = await rpc('A', 'save_training_log', { p_rode_on: today(), p_riding_type: 'skills', p_minutes: 40, p_area_ids: ['tricks'], p_item_id: item, p_practiced: '360s, session ' + (i + 1) });
    if (!r.ok) break;
  }
  r = await rpc('A', 'coaching_home');
  const it = r.ok && r.data.plan.find(x => x.id === item);
  record('Logging the plan item twice ticks it off and fills in its goal', it && it.status === 'done' && it.sessions_done === 2 && r.data.logs[0].goal_id === goal && r.data.week.minutes === 80, it || r.text);
  r = await rpc('C', 'save_training_log', { p_rode_on: today(), p_riding_type: 'trail', p_practiced: 'x' });
  record('Only the rider writes their own log', code(r) === 'PT403', r.text);

  r = await rpc('C', 'coaching_home', { p_athlete: people.A.id });
  record('The coach sees the rider\'s goals, plan and log', r.ok && r.data.viewer === 'coach' && r.data.goals.length === 1 && r.data.logs.length === 2, r.text);
  r = await rpc('K', 'coaching_home', { p_athlete: people.A.id });
  record('A coach without that rider is refused', code(r) === 'PT403', r.text);
  r = await rpc('T', 'coaching_home', { p_athlete: people.A.id });
  record('The rider\'s academic tutor is refused (coaching is separate)', code(r) === 'PT403', r.text);
  r = await rpc('B', 'coaching_home', { p_athlete: people.A.id });
  record('Another rider is refused', code(r) === 'PT403', r.text);

  const counts = {};
  for (const who of ['A', 'B', 'C', 'K', 'T']) counts[who] = rows(await read(who, 'athlete_goals')).length + rows(await read(who, 'training_logs')).length;
  record('Row-level reads: rider and coach see the records, nobody else does', counts.A === 3 && counts.C === 3 && counts.B === 0 && counts.K === 0 && counts.T === 0, counts);
  r = await read('C', 'question_attempts');
  const r2 = await rpc('C', 'student_dashboard', { p_student: people.A.id });
  record('The coach cannot read the rider\'s academic records', rows(r).length === 0 && !r2.ok, `${rows(r).length} rows, dashboard HTTP ${r2.status}`);

  r = await call('POST', '/rest/v1/athlete_goals', { token: people.A.token, body: { athlete_id: people.A.id, horizon: 'week', title: 'sneaky' } });
  record('Coaching tables cannot be written to directly', !r.ok, `HTTP ${r.status}`);

  await admin('PATCH', `/rest/v1/athlete_coaches?athlete_id=eq.${people.A.id}&coach_id=eq.${people.C.id}`, { body: { active: false }, headers: { Prefer: 'return=minimal' } });
  r = await rpc('C', 'coaching_home', { p_athlete: people.A.id });
  const rc = await read('C', 'athlete_goals');
  record('Unassigning the coach cuts off their access immediately', code(r) === 'PT403' && rows(rc).length === 0, r.text);
  await admin('PATCH', `/rest/v1/members?user_id=eq.${people.A.id}`, { body: { active: false }, headers: { Prefer: 'return=minimal' } });
  r = await rpc('A', 'coaching_home');
  record('A revoked rider can no longer open their coaching records', !r.ok, `HTTP ${r.status}`);
}

async function cleanup() {
  // Deleting a test user deletes their profile, coach row, links, goals, plan and log.
  for (const p of Object.values(people)) if (p.id) await admin('DELETE', `/auth/v1/admin/users/${p.id}`).catch(() => {});
  const ids = Object.values(people).filter(p => p.id).map(p => p.id).join(',');
  if (!ids) return true;
  const left = await admin('GET', `/rest/v1/training_logs?select=id&athlete_id=in.(${ids})`);
  const left2 = await admin('GET', `/rest/v1/athlete_goals?select=id&athlete_id=in.(${ids})`);
  return left.ok && left2.ok && rows(left).length === 0 && rows(left2).length === 0;
}

main()
  .catch(e => { record('Setup / run error', false, e.message); })
  .finally(async () => {
    const clean = await cleanup();
    record('Deleting the test accounts removed every record they made', clean);
    const failed = results.filter(p => !p).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed. Test accounts removed.`);
    process.exit(failed ? 1 : 0);
  });
