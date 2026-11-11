#!/usr/bin/env node
// End-to-end progress-tracking test against your real Supabase project
// (Node 18+). Run it after supabase/progress.sql, and again whenever
// that file changes:
//   node scripts/test-progress.mjs
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in
// .env. It creates five throwaway accounts (two students, two tutors,
// one account without access) and one throwaway question, checks that
// attempts are saved to the right student and that nobody can read or
// change anyone else's records, then deletes all of it. No real
// student's data is read or touched.

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';

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
const GAME = 'zz-test-' + tag;
const QUESTION = GAME + ':probe';
const pw = () => randomBytes(12).toString('base64url') + 'aA1!';
const people = {
  A: { role: 'student', member: true },   // student with a tutor
  B: { role: 'student', member: true },   // another student
  T: { role: 'tutor', member: true },     // A's tutor
  U: { role: 'tutor', member: true },     // a tutor with no students
  X: { role: 'student', member: false }   // account without access
};
let questionMade = false;

const login = (email, password) => call('POST', '/auth/v1/token?grant_type=password', { body: { email, password } });
const rows = r => (Array.isArray(r.data) ? r.data : []);
const snap = { prompt: 'A 12 m trail climbs 3 m. What is the grade, in percent?', answer: 25, unit: '%', explanation: 'grade = rise / run x 100' };

function save(who, o = {}) {
  return call('POST', '/rest/v1/rpc/record_attempt', {
    token: people[who].token,
    body: {
      p_attempt_id: o.id || randomUUID(), p_game_id: o.game || GAME, p_question_id: o.question || QUESTION,
      p_snapshot: o.snapshot || snap, p_is_correct: !!o.correct, p_student_answer: o.answer || '24', p_correct_answer: '25',
      p_hints_used: o.hints || 0, p_time_ms: 18000, p_session_id: o.session || null, p_context: o.context || 'game',
      p_client_time: new Date().toISOString()
    }
  });
}
const read = (who, table, query = 'select=*') => call('GET', `/rest/v1/${table}?${query}`, { token: who === 'anon' ? undefined : people[who].token });

async function main() {
  // --- setup ---
  for (const [k, p] of Object.entries(people)) {
    p.email = `progress-test-${k.toLowerCase()}-${tag}@example.com`;
    p.password = pw();
    const r = await admin('POST', '/auth/v1/admin/users', { body: { email: p.email, password: p.password, email_confirm: true } });
    if (!r.ok) throw new Error('could not create test user: ' + r.text);
    p.id = r.data.id;
    if (p.member) {
      const m = await admin('POST', '/rest/v1/members', { body: { user_id: p.id, email: p.email, active: true, note: 'progress test' }, headers: { Prefer: 'return=minimal' } });
      if (!m.ok) throw new Error('could not add member row (did you run supabase/setup.sql?): ' + m.text);
      const pr = await admin('POST', '/rest/v1/profiles', { body: { user_id: p.id, role: p.role, display_name: 'Test ' + k }, headers: { Prefer: 'return=minimal' } });
      if (!pr.ok) throw new Error('could not add profile (did you run supabase/progress.sql?): ' + pr.text);
    }
  }
  let r = await admin('POST', '/rest/v1/questions', { body: { id: QUESTION, game_id: GAME, title: 'Progress test probe' }, headers: { Prefer: 'return=minimal' } });
  if (!r.ok) throw new Error('could not add test question: ' + r.text);
  questionMade = true;
  r = await admin('POST', '/rest/v1/question_skills', { body: { question_id: QUESTION, skill_id: 'geometry' }, headers: { Prefer: 'return=minimal' } });
  if (!r.ok) throw new Error('could not tag test question (is the skills list seeded?): ' + r.text);
  r = await admin('POST', '/rest/v1/student_tutors', { body: { student_id: people.A.id, tutor_id: people.T.id }, headers: { Prefer: 'return=minimal' } });
  if (!r.ok) throw new Error('could not assign tutor: ' + r.text);
  for (const p of Object.values(people)) {
    const l = await login(p.email, p.password);
    if (!l.ok) throw new Error('could not log in test user: ' + l.text);
    p.token = l.data.access_token;
  }

  // --- game tracking ---
  const s1 = randomUUID(), s2 = randomUUID(), firstId = randomUUID();
  r = await save('A', { id: firstId, session: s1, correct: false, hints: 1 });
  record('An incorrect answer is recorded as attempt 1', r.ok && r.data.attempt_number === 1 && r.data.duplicate === false, r.text);
  r = await save('A', { id: firstId, session: s1, correct: false });
  record('Sending the same attempt twice saves it once', r.ok && r.data.duplicate === true, r.text);
  r = await save('A', { session: s1, correct: false, answer: '4' });
  record('A retry is a new attempt (2), not an overwrite', r.ok && r.data.attempt_number === 2, r.text);
  r = await save('A', { session: s1, correct: true, answer: '25' });
  record('A correct answer is recorded (attempt 3)', r.ok && r.data.attempt_number === 3, r.text);
  record('...and a right answer straight after the reveal does not count as corrected', r.ok && r.data.review_status === 'needs_review', r.text);

  r = await read('A', 'question_attempts', 'select=*&order=attempt_number.asc');
  const mine = rows(r);
  record('All three attempts are preserved', mine.length === 3 && mine.map(a => a.is_correct).join() === 'false,false,true', r.text);
  record('Attempts belong to the right student', mine.length > 0 && mine.every(a => a.student_id === people.A.id));
  record('The original question can be retrieved', mine[0] && mine[0].snapshot && mine[0].snapshot.prompt === snap.prompt && mine[0].student_answer === '24' && mine[0].hints_used === 1);
  r = await read('A', 'question_skills', `select=skill_id&question_id=eq.${encodeURIComponent(QUESTION)}`);
  record('The right skill tags are attached to the question', rows(r).map(x => x.skill_id).join() === 'geometry', r.text);
  r = await read('A', 'game_sessions');
  record('A game session was created for the student', rows(r).length === 1 && rows(r)[0].id === s1 && rows(r)[0].attempt_count === 3, r.text);

  // --- review queue ---
  r = await read('A', 'review_items');
  record('The missed question is in the review queue, once', rows(r).length === 1 && rows(r)[0].status === 'needs_review' && rows(r)[0].incorrect_count === 2 && rows(r)[0].first_attempt_id === firstId, r.text);
  r = await save('A', { session: s2, correct: true, answer: '25' });
  record('Answering it correctly in a later session marks it corrected', r.ok && r.data.review_status === 'corrected', r.text);
  r = await save('A', { session: s2, correct: false, snapshot: { ...snap, prompt: 'A 20 m trail climbs 3 m. What is the grade?', answer: 15 } });
  r = await read('A', 'review_items');
  record('A different question of the same kind gets its own review item', rows(r).length === 2, r.text);
  r = await read('A', 'review_events');
  record('Review status history is kept', rows(r).length === 3, r.text);

  // --- who can see what ---
  await save('B', { correct: false });
  r = await read('B', 'question_attempts');
  record('Student B sees only their own attempt', rows(r).length === 1 && rows(r)[0].student_id === people.B.id, r.text);
  r = await read('B', 'question_attempts', `select=*&student_id=eq.${people.A.id}`);
  record('Student B cannot read student A by asking for A\'s id', r.ok && rows(r).length === 0, r.text);
  r = await read('B', 'review_items', `select=*&student_id=eq.${people.A.id}`);
  record('...nor A\'s review queue', r.ok && rows(r).length === 0, r.text);
  r = await read('B', 'profiles');
  record('Student B sees only their own profile', rows(r).length === 1 && rows(r)[0].user_id === people.B.id, r.text);
  r = await read('T', 'question_attempts');
  record('A tutor sees their assigned student\'s attempts, and only those', rows(r).length === 5 && rows(r).every(a => a.student_id === people.A.id), `${rows(r).length} rows`);
  r = await read('T', 'review_items');
  record('A tutor sees their assigned student\'s review queue', rows(r).length === 2);
  r = await read('U', 'question_attempts');
  record('A tutor with no assigned students sees no attempts', r.ok && rows(r).length === 0, r.text);
  r = await read('U', 'profiles');
  record('...and no student profiles', rows(r).length === 1 && rows(r)[0].user_id === people.U.id, r.text);
  r = await read('anon', 'question_attempts');
  record('A logged-out visitor cannot read attempts', !r.ok || rows(r).length === 0, `HTTP ${r.status}`);
  r = await read('anon', 'profiles');
  record('A logged-out visitor cannot read profiles', !r.ok || rows(r).length === 0, `HTTP ${r.status}`);

  // --- nobody can tamper ---
  const changed = x => x.ok && rows(x).length > 0;
  r = await call('POST', '/rest/v1/question_attempts', { token: people.A.token, headers: { Prefer: 'return=representation' },
    body: { id: randomUUID(), student_id: people.B.id, game_id: GAME, question_id: QUESTION, question_hash: 'x', snapshot: {}, is_correct: true, attempt_number: 9, occurred_at: new Date().toISOString() } });
  record('A student cannot insert an attempt directly (or for someone else)', !r.ok, `HTTP ${r.status}`);
  r = await call('PATCH', `/rest/v1/question_attempts?id=eq.${firstId}`, { token: people.A.token, body: { is_correct: true }, headers: { Prefer: 'return=representation' } });
  record('A student cannot edit a saved attempt', !changed(r), `HTTP ${r.status}`);
  r = await call('DELETE', `/rest/v1/question_attempts?id=eq.${firstId}`, { token: people.A.token, headers: { Prefer: 'return=representation' } });
  record('A student cannot delete a saved attempt', !changed(r), `HTTP ${r.status}`);
  r = await call('PATCH', `/rest/v1/review_items?student_id=eq.${people.A.id}`, { token: people.A.token, body: { status: 'mastered' }, headers: { Prefer: 'return=representation' } });
  record('A student cannot mark their own review items mastered', !changed(r), `HTTP ${r.status}`);
  r = await call('PATCH', `/rest/v1/profiles?user_id=eq.${people.B.id}`, { token: people.B.token, body: { role: 'tutor' }, headers: { Prefer: 'return=representation' } });
  record('A student cannot make themselves a tutor', !changed(r), `HTTP ${r.status}`);
  r = await call('POST', '/rest/v1/student_tutors', { token: people.U.token, body: { student_id: people.A.id, tutor_id: people.U.id }, headers: { Prefer: 'return=representation' } });
  record('A tutor cannot assign themselves a student', !r.ok, `HTTP ${r.status}`);
  r = await read('U', 'question_attempts');
  record('...and still sees nothing afterwards', r.ok && rows(r).length === 0);
  r = await save('B', { session: s1, correct: true });
  record('A student cannot write into another student\'s game session', r.status === 403, `HTTP ${r.status}`);
  r = await save('B', { id: firstId, correct: true });
  record('A student cannot reuse another student\'s attempt id', r.status === 409, `HTTP ${r.status}`);
  r = await save('A', { question: GAME + ':does-not-exist', correct: true });
  record('An unknown question is rejected', r.status === 422, `HTTP ${r.status}`);
  r = await save('X', { correct: true });
  record('An account without access cannot record attempts', r.status === 403, `HTTP ${r.status}`);
  r = await call('POST', '/rest/v1/rpc/record_attempt', { body: { p_attempt_id: randomUUID(), p_game_id: GAME, p_question_id: QUESTION, p_snapshot: snap, p_is_correct: true } });
  record('A logged-out visitor cannot record attempts', !r.ok, `HTTP ${r.status}`);

  // --- access changes take effect immediately ---
  await admin('PATCH', `/rest/v1/student_tutors?student_id=eq.${people.A.id}&tutor_id=eq.${people.T.id}`, { body: { active: false }, headers: { Prefer: 'return=minimal' } });
  r = await read('T', 'question_attempts');
  record('Unassigning a tutor cuts off their access immediately', r.ok && rows(r).length === 0, `${rows(r).length} rows`);
  await admin('PATCH', `/rest/v1/members?user_id=eq.${people.A.id}`, { body: { active: false }, headers: { Prefer: 'return=minimal' } });
  r = await save('A', { correct: true });
  const afterRevoke = await read('A', 'question_attempts');
  record('A revoked student can no longer record or read progress', r.status === 403 && rows(afterRevoke).length === 0, `HTTP ${r.status}`);
}

async function cleanup() {
  // Deleting a test user deletes their profile, attempts, sessions,
  // review items and tutor links with them.
  for (const p of Object.values(people)) if (p.id) await admin('DELETE', `/auth/v1/admin/users/${p.id}`).catch(() => {});
  if (questionMade) await admin('DELETE', `/rest/v1/questions?id=eq.${encodeURIComponent(QUESTION)}`).catch(() => {});
  const left = await admin('GET', `/rest/v1/question_attempts?select=id&game_id=eq.${GAME}`);
  return left.ok && Array.isArray(left.data) && left.data.length === 0;
}

main()
  .catch(e => { record('Setup / run error', false, e.message); })
  .finally(async () => {
    const clean = await cleanup();
    record('Deleting the test accounts removed every record they made', clean);
    const failed = results.filter(p => !p).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed. Test accounts and the test question removed.`);
    process.exit(failed ? 1 : 0);
  });
