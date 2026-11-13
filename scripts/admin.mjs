#!/usr/bin/env node
// Mathlete MTB member admin. Runs on YOUR computer only (needs Node 18+).
// Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SITE_URL from .env
// (see .env.example). The service_role key never leaves this machine.
//
//   node scripts/admin.mjs invite you@example.com      email an invite (they choose a password)
//   node scripts/admin.mjs create you@example.com      make an account now, print a temporary password
//   node scripts/admin.mjs list                        everyone with access, and whether it's active
//   node scripts/admin.mjs revoke you@example.com      take access away immediately and block login
//   node scripts/admin.mjs restore you@example.com     give access back (also: grant)
//   node scripts/admin.mjs reset you@example.com       email a "set a new password" link
//   node scripts/admin.mjs reset-link you@example.com  print that link instead (to send yourself)
//   node scripts/admin.mjs upload path/to/tool.html tool-04/index.html
//                                                      put a private tool in the private bucket
//   node scripts/admin.mjs inquiries [all]             College & Beyond inquiries not yet handled (or all)
//   node scripts/admin.mjs handled <inquiry-id>        mark an inquiry as handled
//
// Students and tutors (needs supabase/progress.sql; see docs/PROGRESS-TRACKING.md):
//   node scripts/admin.mjs role you@example.com tutor   make an account a student, tutor or admin
//   node scripts/admin.mjs name you@example.com Noah    set the first name shown on dashboards
//   node scripts/admin.mjs assign student@example.com tutor@example.com
//                                                      give a tutor access to a student's progress
//   node scripts/admin.mjs unassign student@example.com tutor@example.com
//                                                      take it away again (immediate)
//   node scripts/admin.mjs roster                      every account's role, and who tutors whom
//   node scripts/admin.mjs goal student@example.com sessions 3 [YYYY-MM-DD]
//                                                      set a goal for a student: sessions | questions | corrections <how many>,
//                                                      with an optional due date (default: this coming Sunday)
//   node scripts/admin.mjs goal student@example.com custom Explain slope out loud
//                                                      a goal in words (you mark it done in the Supabase table for now)
//   node scripts/admin.mjs goals student@example.com   list a student's goals
//
// MTB Coaching: HIDDEN FOR NOW, these work only after supabase/coaching.sql is run
// (see docs/COACHING.md). Coaching
// is separate from tutoring: a tutor sees no riding records and a coach no
// academic ones, unless you assign them both ways.
//   node scripts/admin.mjs coach coach@example.com jumping tricks
//                                                      make someone a coach, with their specialties
//                                                      (fundamentals cornering technical jumping tricks downhill racing fitness mindset)
//   node scripts/admin.mjs coach coach@example.com off  stop them coaching (their riders lose them at once)
//   node scripts/admin.mjs coach-assign rider@example.com coach@example.com
//                                                      let a coach see and add to a rider's goals, plan and log
//   node scripts/admin.mjs coach-unassign rider@example.com coach@example.com
//   node scripts/admin.mjs coaches                     every coach, their specialties and riders
//   node scripts/admin.mjs plan rider@example.com 2 Two airbag sessions: 360 rotations
//                                                      add something to a rider's training plan (how many sessions, then what)

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const BUCKET = 'private-tools';
const BAN_FOREVER = '876000h'; // ~100 years

function loadEnv() {
  const env = { ...process.env };
  const file = new URL('../.env', import.meta.url);
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return env;
}

const env = loadEnv();
// Accept the URL with or without a copied "/rest/v1" (or /auth/v1, /storage/v1) on the end.
const BASE = (env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/, '');
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE = (env.SITE_URL || 'https://www.mathletemtb.com').replace(/\/+$/, '');
const ACCOUNT_URL = SITE + '/account.html';

function die(msg) { console.error('\n  ' + msg + '\n'); process.exit(1); }

async function api(method, path, body, extraHeaders = {}) {
  const headers = { apikey: KEY, Authorization: 'Bearer ' + KEY, ...extraHeaders };
  let payload;
  if (body instanceof Uint8Array || typeof body === 'string') payload = body;
  else if (body !== undefined) { payload = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  const text = await res.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = data && typeof data === 'object' ? (data.msg || data.message || data.error_description || data.error || JSON.stringify(data)) : text;
    throw new Error(`${res.status} ${msg}`);
  }
  return data;
}

async function findUser(email) {
  const want = email.toLowerCase();
  for (let page = 1; page < 100; page++) {
    const data = await api('GET', `/auth/v1/admin/users?page=${page}&per_page=200`);
    const users = data.users || [];
    const hit = users.find(u => (u.email || '').toLowerCase() === want);
    if (hit) return hit;
    if (users.length < 200) return null;
  }
  return null;
}

async function requireUser(email) {
  const user = await findUser(email);
  if (!user) die(`No account for ${email}. Use "invite" or "create" first.`);
  return user;
}

async function grant(user) {
  await api('POST', '/rest/v1/members?on_conflict=user_id',
    { user_id: user.id, email: user.email, active: true },
    { Prefer: 'resolution=merge-duplicates,return=minimal' });
  await api('PUT', `/auth/v1/admin/users/${user.id}`, { ban_duration: 'none' });
  await ensureProfile(user);
}

// Every account gets a profile (a student, named after their email until
// you run "name"). An existing profile is left exactly as it is.
async function ensureProfile(user) {
  try {
    await api('POST', '/rest/v1/profiles?on_conflict=user_id',
      { user_id: user.id, display_name: (user.email || 'Mathlete').split('@')[0].slice(0, 60) },
      { Prefer: 'resolution=ignore-duplicates,return=minimal' });
  } catch (e) {
    console.log(`\n  Note: no profile was made for ${user.email} (${e.message}).`);
    console.log('  Progress tracking needs supabase/progress.sql run in the Supabase SQL Editor.');
  }
}

async function profileOf(email) {
  const user = await requireUser(email);
  await ensureProfile(user);
  const rows = await api('GET', `/rest/v1/profiles?user_id=eq.${user.id}&select=user_id,role,display_name`);
  if (!rows.length) die(`${email} has no profile. Run supabase/progress.sql in the Supabase SQL Editor first.`);
  return rows[0];
}

const ROLES = ['student', 'tutor', 'parent', 'admin', 'coach'];
const AREAS = ['fundamentals', 'cornering', 'technical', 'jumping', 'tricks', 'downhill', 'racing', 'fitness', 'mindset'];

// GET that returns [] when coaching.sql hasn't been run yet (instead of failing).
async function maybe(path) {
  try { return await api('GET', path); } catch (e) { if (/^404|PGRST205|does not exist/.test(e.message)) return []; throw e; }
}
function needCoaching(e) {
  if (/^404|PGRST205|does not exist/.test(e.message)) die('MTB Coaching isn\'t set up yet: run supabase/coaching.sql in the Supabase SQL Editor first.');
  throw e;
}

const commands = {
  async invite(email) {
    if (await findUser(email)) die(`${email} already has an account. Use "restore" to give access, or "reset" to send a password link.`);
    const user = await api('POST', `/auth/v1/invite?redirect_to=${encodeURIComponent(ACCOUNT_URL)}`, { email });
    await grant(user);
    console.log(`\n  Invited ${email}. They'll get an email with a link to choose a password.`);
    console.log(`  Access is active. The link expires (24 hours by default); run "reset" to send a fresh one.\n`);
  },

  async create(email) {
    if (await findUser(email)) die(`${email} already has an account.`);
    const password = randomBytes(12).toString('base64url');
    const user = await api('POST', '/auth/v1/admin/users', { email, password, email_confirm: true });
    await grant(user);
    console.log(`\n  Created ${email} with access.`);
    console.log(`  Temporary password: ${password}`);
    console.log(`  Send it privately (not in the same message as the email address, ideally).`);
    console.log(`  They can change it at ${ACCOUNT_URL} after logging in.\n`);
  },

  async grant(email) { return commands.restore(email); },

  async restore(email) {
    const user = await requireUser(email);
    await grant(user);
    console.log(`\n  ${email} has access again.\n`);
  },

  async revoke(email) {
    const user = await requireUser(email);
    await api('PATCH', `/rest/v1/members?user_id=eq.${user.id}`, { active: false }, { Prefer: 'return=minimal' });
    await api('PUT', `/auth/v1/admin/users/${user.id}`, { ban_duration: BAN_FOREVER });
    console.log(`\n  Revoked ${email}. Private tools stop loading for them right away, and they can't log in.`);
    console.log(`  Undo with: node scripts/admin.mjs restore ${email}\n`);
  },

  async reset(email) {
    await requireUser(email);
    await api('POST', `/auth/v1/recover?redirect_to=${encodeURIComponent(ACCOUNT_URL)}`, { email });
    console.log(`\n  Sent ${email} a link to set a new password.\n`);
  },

  async 'reset-link'(email) {
    await requireUser(email);
    const data = await api('POST', '/auth/v1/admin/generate_link', { type: 'recovery', email, redirect_to: ACCOUNT_URL });
    const link = data.action_link || (data.properties && data.properties.action_link);
    console.log(`\n  One-time link for ${email} (send it privately; it expires):\n\n  ${link}\n`);
  },

  async list() {
    const rows = await api('GET', '/rest/v1/members?select=email,active,plan,expires_at,created_at&order=created_at.asc');
    if (!rows.length) return console.log('\n  No members yet.\n');
    console.log('');
    for (const r of rows) {
      const state = r.active ? 'active ' : 'REVOKED';
      const exp = r.expires_at ? `  expires ${r.expires_at.slice(0, 10)}` : '';
      console.log(`  ${state}  ${r.email}  (${r.plan}, since ${r.created_at.slice(0, 10)})${exp}`);
    }
    console.log('');
  },

  async role(email, role) {
    if (!ROLES.includes(role)) die(`Usage: role <email> <${ROLES.join('|')}>`);
    const p = await profileOf(email);
    if (p.role === role) return console.log(`\n  ${email} is already a ${role}.\n`);
    if (role === 'student') {
      const links = await api('GET', `/rest/v1/student_tutors?tutor_id=eq.${p.user_id}&active=eq.true&select=student_id`);
      if (links.length) die(`${email} still tutors ${links.length} student(s). Run "unassign" for each first (see "roster").`);
      const coached = await maybe(`/rest/v1/coaches?user_id=eq.${p.user_id}&select=user_id`);
      if (coached.length) die(`${email} is set up as a coach. Run "coach ${email} off" and "coach-unassign" first (see "coaches").`);
    } else {
      const links = await api('GET', `/rest/v1/student_tutors?student_id=eq.${p.user_id}&active=eq.true&select=tutor_id`);
      if (links.length) die(`${email} is still a student of ${links.length} tutor(s). Run "unassign" for each first (see "roster").`);
      const riding = await maybe(`/rest/v1/athlete_coaches?athlete_id=eq.${p.user_id}&active=eq.true&select=coach_id`);
      if (riding.length) die(`${email} is still coached by ${riding.length} coach(es). Run "coach-unassign" for each first (see "coaches").`);
      if (role !== 'coach' && role !== 'tutor' && role !== 'admin') {
        const coached = await maybe(`/rest/v1/coaches?user_id=eq.${p.user_id}&active=eq.true&select=user_id`);
        if (coached.length) die(`${email} is an active coach. Run "coach ${email} off" first.`);
      }
    }
    await api('PATCH', `/rest/v1/profiles?user_id=eq.${p.user_id}`, { role }, { Prefer: 'return=minimal' });
    console.log(`\n  ${email} is now a${role === 'admin' ? 'n' : ''} ${role} (was ${p.role}).`);
    if (role === 'tutor') console.log('  They see no students until you run: node scripts/admin.mjs assign <student-email> ' + email);
    if (role === 'admin') console.log('  Admins can see every student\'s progress and riding records.');
    if (role === 'coach') console.log('  Next, give them specialties: node scripts/admin.mjs coach ' + email + ' jumping tricks');
    console.log('');
  },

  async name(email, ...words) {
    const display_name = words.join(' ').trim();
    if (!display_name || display_name.length > 60) die('Usage: name <email> <first name>   (up to 60 characters)');
    const p = await profileOf(email);
    await api('PATCH', `/rest/v1/profiles?user_id=eq.${p.user_id}`, { display_name }, { Prefer: 'return=minimal' });
    console.log(`\n  ${email} is now shown as "${display_name}".\n`);
  },

  async assign(studentEmail, tutorEmail) {
    const student = await profileOf(studentEmail), tutor = await profileOf(tutorEmail);
    if (student.role !== 'student') die(`${studentEmail} is a ${student.role}, not a student.`);
    if (!['tutor', 'admin'].includes(tutor.role)) die(`${tutorEmail} is a ${tutor.role}. Make them a tutor first: node scripts/admin.mjs role ${tutorEmail} tutor`);
    await api('POST', '/rest/v1/student_tutors?on_conflict=student_id,tutor_id',
      { student_id: student.user_id, tutor_id: tutor.user_id, active: true },
      { Prefer: 'resolution=merge-duplicates,return=minimal' });
    console.log(`\n  ${tutor.display_name} (${tutorEmail}) can now see ${student.display_name}'s progress.\n`);
  },

  async unassign(studentEmail, tutorEmail) {
    const student = await profileOf(studentEmail), tutor = await profileOf(tutorEmail);
    const rows = await api('PATCH', `/rest/v1/student_tutors?student_id=eq.${student.user_id}&tutor_id=eq.${tutor.user_id}`,
      { active: false }, { Prefer: 'return=representation' });
    if (!rows.length) die(`${tutorEmail} wasn't assigned to ${studentEmail}.`);
    console.log(`\n  ${tutor.display_name} (${tutorEmail}) can no longer see ${student.display_name}'s progress. Nothing was deleted.\n`);
  },

  async roster() {
    const [profiles, members, links, coachLinks] = await Promise.all([
      api('GET', '/rest/v1/profiles?select=user_id,role,display_name&order=role.asc,display_name.asc'),
      api('GET', '/rest/v1/members?select=user_id,email,active'),
      api('GET', '/rest/v1/student_tutors?select=student_id,tutor_id&active=eq.true'),
      maybe('/rest/v1/athlete_coaches?select=athlete_id,coach_id&active=eq.true')
    ]);
    if (!profiles.length) return console.log('\n  No profiles yet.\n');
    const email = id => (members.find(m => m.user_id === id) || {}).email || '(no access row)';
    const label = id => { const p = profiles.find(x => x.user_id === id); return p ? p.display_name : '?'; };
    console.log('');
    for (const p of profiles) {
      const m = members.find(x => x.user_id === p.user_id);
      const who = p.role === 'student'
        ? links.filter(l => l.student_id === p.user_id).map(l => label(l.tutor_id))
        : links.filter(l => l.tutor_id === p.user_id).map(l => label(l.student_id));
      let rel = p.role === 'student' ? `tutor: ${who.join(', ') || 'none'}` : p.role === 'tutor' ? `students: ${who.join(', ') || 'none'}` : '';
      const coaches = coachLinks.filter(l => l.athlete_id === p.user_id).map(l => label(l.coach_id));
      const riders = coachLinks.filter(l => l.coach_id === p.user_id).map(l => label(l.athlete_id));
      if (coaches.length) rel += `  |  coach: ${coaches.join(', ')}`;
      if (riders.length || p.role === 'coach') rel += `${rel ? '  |  ' : ''}riders: ${riders.join(', ') || 'none'}`;
      console.log(`  ${p.role.padEnd(7)}  ${p.display_name}  <${email(p.user_id)}>${m && !m.active ? '  REVOKED' : ''}${rel ? '  |  ' + rel : ''}`);
    }
    console.log('');
  },

  async goal(email, kind, ...rest) {
    const TITLES = { sessions: n => `Complete ${n} practice session${n === 1 ? '' : 's'}`, questions: n => `Answer ${n} question${n === 1 ? '' : 's'}`,
                     corrections: n => `Correct ${n} missed question${n === 1 ? '' : 's'}` };
    if (kind !== 'custom' && !TITLES[kind]) die('Usage: goal <student-email> <sessions|questions|corrections> <how many> [YYYY-MM-DD]\n         goal <student-email> custom <the goal in words>');
    const student = await profileOf(email);
    if (student.role !== 'student') die(`${email} is a ${student.role}, not a student.`);
    const sunday = () => { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    let row;
    if (kind === 'custom') {
      const title = rest.join(' ').trim();
      if (!title || title.length > 140) die('Write the goal in words (up to 140 characters).');
      row = { kind, title, target: null, due_on: sunday() };
    } else {
      const n = Number(rest[0]);
      if (!Number.isInteger(n) || n < 1 || n > 500) die('How many? Give a whole number from 1 to 500.');
      if (rest[1] && !/^\d{4}-\d{2}-\d{2}$/.test(rest[1])) die('Write the due date as YYYY-MM-DD.');
      row = { kind, title: TITLES[kind](n), target: n, due_on: rest[1] || sunday() };
    }
    await api('POST', '/rest/v1/student_goals', { student_id: student.user_id, created_by: null, created_by_role: 'tutor', ...row }, { Prefer: 'return=minimal' });
    console.log(`\n  Goal set for ${student.display_name}: "${row.title}", due ${row.due_on}.`);
    console.log('  Progress counts from now. They see it on their dashboard and My Goals page.\n');
  },

  async goals(email) {
    const student = await profileOf(email);
    const rows = await api('GET', `/rest/v1/student_goals?student_id=eq.${student.user_id}&status=neq.archived&select=title,kind,target,due_on,status,created_by_role,created_at&order=created_at.desc`);
    if (!rows.length) return console.log(`\n  ${student.display_name} has no goals.\n`);
    console.log('');
    for (const g of rows) console.log(`  ${g.status.padEnd(9)}  ${g.title}${g.due_on ? '  (due ' + g.due_on + ')' : ''}  [set by ${g.created_by_role}, ${g.created_at.slice(0, 10)}]`);
    console.log(`\n  Progress is shown on the student's My Goals page (it is counted from their activity).\n`);
  },

  async coach(email, ...specialties) {
    const p = await profileOf(email);
    if (specialties[0] === 'off') {
      const rows = await api('PATCH', `/rest/v1/coaches?user_id=eq.${p.user_id}`, { active: false }, { Prefer: 'return=representation' }).catch(needCoaching);
      if (!rows.length) die(`${email} isn't a coach.`);
      return console.log(`\n  ${p.display_name} no longer coaches. Their riders can't see them, and they can't see their riders. Nothing was deleted.\n`);
    }
    const bad = specialties.filter(x => !AREAS.includes(x));
    if (bad.length) die(`Unknown specialty: ${bad.join(', ')}. Use any of: ${AREAS.join(' ')}`);
    if (!['coach', 'tutor', 'admin'].includes(p.role)) die(`${email} is a ${p.role}. Make them a coach first: node scripts/admin.mjs role ${email} coach\n  (Someone who tutors as well keeps the tutor role.)`);
    await api('POST', '/rest/v1/coaches?on_conflict=user_id', { user_id: p.user_id, specialties: [...new Set(specialties)], active: true },
      { Prefer: 'resolution=merge-duplicates,return=minimal' }).catch(needCoaching);
    console.log(`\n  ${p.display_name} is a coach${specialties.length ? ' (' + specialties.join(', ') + ')' : ''}.`);
    console.log(`  Assign riders with: node scripts/admin.mjs coach-assign <rider-email> ${email}\n`);
  },

  async 'coach-assign'(riderEmail, coachEmail) {
    const rider = await profileOf(riderEmail), coach = await profileOf(coachEmail);
    if (rider.role !== 'student') die(`${riderEmail} is a ${rider.role}. Riders are student accounts.`);
    const c = await maybe(`/rest/v1/coaches?user_id=eq.${coach.user_id}&active=eq.true&select=user_id`);
    if (!c.length) die(`${coachEmail} isn't an active coach. Run: node scripts/admin.mjs coach ${coachEmail} <specialties>`);
    await api('POST', '/rest/v1/athlete_coaches?on_conflict=athlete_id,coach_id',
      { athlete_id: rider.user_id, coach_id: coach.user_id, active: true },
      { Prefer: 'resolution=merge-duplicates,return=minimal' }).catch(needCoaching);
    console.log(`\n  ${coach.display_name} now coaches ${rider.display_name}: they can see and add to their riding goals, plan and log.`);
    console.log('  (This gives no access to their academic progress; that is "assign".)\n');
  },

  async 'coach-unassign'(riderEmail, coachEmail) {
    const rider = await profileOf(riderEmail), coach = await profileOf(coachEmail);
    const rows = await api('PATCH', `/rest/v1/athlete_coaches?athlete_id=eq.${rider.user_id}&coach_id=eq.${coach.user_id}`,
      { active: false }, { Prefer: 'return=representation' }).catch(needCoaching);
    if (!rows.length) die(`${coachEmail} wasn't coaching ${riderEmail}.`);
    console.log(`\n  ${coach.display_name} no longer coaches ${rider.display_name}. Nothing was deleted.\n`);
  },

  async coaches() {
    const [coaches, links, profiles, members] = await Promise.all([
      api('GET', '/rest/v1/coaches?select=user_id,specialties,active').catch(needCoaching),
      api('GET', '/rest/v1/athlete_coaches?select=athlete_id,coach_id&active=eq.true'),
      api('GET', '/rest/v1/profiles?select=user_id,display_name'),
      api('GET', '/rest/v1/members?select=user_id,email')
    ]);
    if (!coaches.length) return console.log('\n  No coaches yet. Add one with: node scripts/admin.mjs coach <email> <specialties>\n');
    const name = id => (profiles.find(p => p.user_id === id) || {}).display_name || '?';
    const email = id => (members.find(m => m.user_id === id) || {}).email || '';
    console.log('');
    for (const c of coaches) {
      const riders = links.filter(l => l.coach_id === c.user_id).map(l => name(l.athlete_id));
      console.log(`  ${c.active ? 'coach' : 'OFF  '}  ${name(c.user_id)} <${email(c.user_id)}>  [${c.specialties.join(', ') || 'no specialties'}]  |  riders: ${riders.join(', ') || 'none'}`);
    }
    console.log('');
  },

  async plan(email, sessions, ...words) {
    const n = Number(sessions), title = words.join(' ').trim();
    if (!Number.isInteger(n) || n < 1 || n > 14 || !title || title.length > 140) die('Usage: plan <rider-email> <sessions 1-14> <what to practise, up to 140 characters>');
    const rider = await profileOf(email);
    if (rider.role !== 'student') die(`${email} is a ${rider.role}. Riders are student accounts.`);
    const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    const due_on = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await api('POST', '/rest/v1/training_items', { athlete_id: rider.user_id, title, sessions_target: n, due_on, created_by: null, created_by_role: 'coach' },
      { Prefer: 'return=minimal' }).catch(needCoaching);
    console.log(`\n  Added to ${rider.display_name}'s plan: "${title}" (${n} session${n === 1 ? '' : 's'}, by ${due_on}).`);
    console.log('  They see it on My Training and their Coaching Dashboard, marked "From your coach".\n');
  },

  async inquiries(which) {
    const filter = which === 'all' ? '' : '&handled=eq.false';
    const rows = await api('GET', `/rest/v1/inquiries?select=*&order=created_at.desc${filter}`);
    if (!rows.length) return console.log(`\n  No ${which === 'all' ? '' : 'open '}inquiries.\n`);
    for (const r of rows) {
      console.log(`\n  ${r.created_at.slice(0, 16).replace('T', ' ')}  ${r.handled ? '[handled] ' : ''}${r.service}`);
      console.log(`  ${r.name} <${r.email}>  (${r.reaching_out_as}, grade: ${r.grade})`);
      if (r.student_first_name) console.log(`  Student: ${r.student_first_name}`);
      console.log(`  Help with: ${r.help_with.join(', ')}${r.timeline ? '  |  Timeline: ' + r.timeline : ''}`);
      if (r.message) console.log(`  Message: ${r.message.replace(/\s+/g, ' ')}`);
      console.log(`  id: ${r.id}`);
    }
    console.log(`\n  ${rows.length} inquir${rows.length === 1 ? 'y' : 'ies'}. Mark one done with: node scripts/admin.mjs handled <id>\n`);
  },

  async handled(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id || '')) die('Usage: handled <inquiry-id>  (the id printed by "inquiries")');
    const rows = await api('PATCH', `/rest/v1/inquiries?id=eq.${id}`, { handled: true }, { Prefer: 'return=representation' });
    if (!rows.length) die(`No inquiry with id ${id}.`);
    console.log(`\n  Marked ${rows[0].name}'s inquiry as handled.\n`);
  },

  async upload(localFile, objectPath) {
    if (!localFile || !objectPath) die('Usage: upload <local-file.html> <path-in-bucket, e.g. tool-04/index.html>');
    if (!existsSync(localFile)) die(`File not found: ${localFile}`);
    const bytes = readFileSync(localFile);
    const clean = objectPath.replace(/^\/+/, '');
    await api('POST', `/storage/v1/object/${BUCKET}/${clean.split('/').map(encodeURIComponent).join('/')}`, new Uint8Array(bytes),
      { 'Content-Type': 'text/html; charset=utf-8', 'x-upsert': 'true', 'Cache-Control': 'no-store' });
    console.log(`\n  Uploaded ${localFile} -> ${BUCKET}/${clean}`);
    console.log(`  Make sure js/tools-config.js has this tool with access: 'private', status: 'live', file: '${clean}'.\n`);
  }
};

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (typeof fetch !== 'function') die('This script needs Node 18 or newer (try: nvm use 20).');
  if (!cmd || !commands[cmd]) {
    const lines = readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1);
    const header = lines.slice(0, lines.findIndex(l => !l.startsWith('//')));
    console.log(header.map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(cmd ? 1 : 0);
  }
  if (!BASE || !KEY) die('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example).');
  const isEmail = v => !!v && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  if (['invite', 'create', 'grant', 'restore', 'revoke', 'reset', 'reset-link', 'role', 'name', 'goal', 'goals', 'coach', 'plan'].includes(cmd)) {
    if (!isEmail(args[0])) die(`Usage: ${cmd} <email>${cmd === 'role' ? ' <' + ROLES.join('|') + '>' : cmd === 'name' ? ' <first name>' : cmd === 'coach' ? ' <specialties...|off>' : cmd === 'plan' ? ' <sessions> <what to practise>' : ''}`);
    args[0] = args[0].trim().toLowerCase();
  }
  if (['assign', 'unassign', 'coach-assign', 'coach-unassign'].includes(cmd)) {
    if (!isEmail(args[0]) || !isEmail(args[1])) die(cmd.startsWith('coach') ? `Usage: ${cmd} <rider-email> <coach-email>` : `Usage: ${cmd} <student-email> <tutor-email>`);
    args[0] = args[0].trim().toLowerCase();
    args[1] = args[1].trim().toLowerCase();
  }
  try {
    await commands[cmd](...args);
  } catch (e) {
    die(`Failed: ${e.message}`);
  }
}

main();
