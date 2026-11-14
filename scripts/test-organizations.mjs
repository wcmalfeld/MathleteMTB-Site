#!/usr/bin/env node
// End-to-end test of organizations and licensing against your real Supabase
// project (Node 18+). Run after supabase/organizations.sql, and again
// whenever it changes:
//   node scripts/test-organizations.mjs
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.
// It creates two throwaway organizations, a throwaway plan and question,
// and throwaway people (owners, an instructor, students, one person in both
// organizations, one direct account), checks the PRD 1 security criteria
// and the PRD 2 invitation rules (plus the `join` server function, once
// it's deployed) through the real API, then deletes everything it made. No real
// organization or student is read or touched.

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';

const env = { ...process.env };
const envFile = new URL('../.env', import.meta.url);
if (existsSync(envFile)) for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
}
const BASE = (env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/(rest|auth|storage)\/v1$/, '');
const ANON = env.SUPABASE_ANON_KEY || '', SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || '';
if (typeof fetch !== 'function') { console.error('Needs Node 18+ (try: nvm use 20).'); process.exit(1); }
if (!BASE || !ANON || !SERVICE) { console.error('Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.'); process.exit(1); }

async function call(method, path, { key = ANON, token, body, headers = {} } = {}) {
  const h = { apikey: key, Authorization: 'Bearer ' + (token || key), ...headers };
  let payload; if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + path, { method, headers: h, body: payload });
  const text = await res.text(); let data = text; try { data = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, data, text };
}
const admin = (m, p, o = {}) => call(m, p, { ...o, key: SERVICE });
const svc = (fn, body) => admin('POST', `/rest/v1/rpc/${fn}`, { body });
const results = [];
function record(name, pass, detail) { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined && !pass ? '  (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : ''}`); }

const tag = randomBytes(4).toString('hex');
const GAME = 'zz-orgtest-' + tag, QUESTION = GAME + ':probe', PLAN = 'zz-plan-' + tag;
const people = { WO: {}, WI: {}, WS: {}, WS2: {}, BA: {}, BS: {}, X: {}, D: { direct: true } };
const orgs = {};
const rpc = (who, fn, body = {}) => call('POST', `/rest/v1/rpc/${fn}`, { token: people[who].token, body });
const read = (who, q) => call('GET', `/rest/v1/${q}`, { token: people[who].token });
const rows = r => (Array.isArray(r.data) ? r.data : []);
const code = r => r.data && r.data.code;
const attempt = (who, org, correct = false) => rpc(who, 'record_attempt', { p_attempt_id: randomUUID(), p_game_id: GAME, p_question_id: QUESTION, p_snapshot: { prompt: 'probe ' + tag }, p_is_correct: correct, p_organization_id: org });
const today = new Date().toISOString().slice(0, 10), inDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

async function main() {
  for (const [k, p] of Object.entries(people)) {
    p.email = `org-test-${k.toLowerCase()}-${tag}@example.com`; p.password = randomBytes(12).toString('base64url') + 'aA1!';
    const r = await admin('POST', '/auth/v1/admin/users', { body: { email: p.email, password: p.password, email_confirm: true } });
    if (!r.ok) throw new Error('could not create test user: ' + r.text);
    p.id = r.data.id;
    if (p.direct) await admin('POST', '/rest/v1/members', { body: { user_id: p.id, email: p.email, active: true, note: 'org test' }, headers: { Prefer: 'return=minimal' } });
    const pr = await admin('POST', '/rest/v1/profiles', { body: { user_id: p.id, role: 'student', display_name: 'Test ' + k }, headers: { Prefer: 'return=minimal' } });
    if (!pr.ok) throw new Error('could not add profile: ' + pr.text);
    const t = await call('POST', '/auth/v1/token?grant_type=password', { body: { email: p.email, password: p.password } });
    if (!t.ok) throw new Error('could not log in test user: ' + t.text);
    p.token = t.data.access_token;
  }
  const q = await admin('POST', '/rest/v1/questions', { body: { id: QUESTION, game_id: GAME, title: 'Org test probe' }, headers: { Prefer: 'return=minimal' } });
  if (!q.ok) throw new Error('could not add test question: ' + q.text);

  // --- organizations, plan, licence ---
  let r = await svc('create_organization', { p_name: 'Test Academy ' + tag, p_slug: 'zz-academy-' + tag, p_type: 'sports_academy' });
  if (!r.ok) throw new Error('create_organization failed (did you run supabase/organizations.sql?): ' + r.text);
  orgs.A = r.data;
  orgs.B = (await svc('create_organization', { p_name: 'Test School ' + tag, p_slug: 'zz-school-' + tag, p_type: 'school' })).data;
  record('1 organizations can be created (two, independent)', !!orgs.A && !!orgs.B && orgs.A !== orgs.B);
  r = await rpc('WO', 'create_organization', { p_name: 'Sneaky', p_slug: 'zz-sneaky-' + tag });
  record('   a regular account can’t create organizations', code(r) === 'PT403', r.text);
  await svc('save_plan', { p_id: PLAN, p_name: 'Test plan', p_seat_limit: 10, p_interval: 'term' });
  r = await svc('activate_license', { p_org: orgs.A, p_plan: PLAN, p_seats: 2, p_starts: today, p_ends: inDays(30) });
  record('manual licence activation (2 seats)', r.ok, r.text);
  for (const [who, role] of [['WO', 'owner'], ['WI', 'instructor'], ['X', 'instructor'], ['WS', 'student']]) await svc('add_member', { p_org: orgs.A, p_user: people[who].id, p_role: role });
  r = await rpc('WO', 'add_member', { p_org: orgs.A, p_user: people.WS2.id, p_role: 'student' });
  record('   the owner adds a second student (2 of 2 seats)', r.ok, r.text);
  r = await rpc('WO', 'add_member', { p_org: orgs.A, p_user: people.BS.id, p_role: 'student' });
  record('   a third student is refused: no seats left', code(r) === 'PT422', r.text);
  r = await rpc('WS', 'record_attempt', { p_attempt_id: randomUUID(), p_game_id: GAME, p_question_id: QUESTION, p_snapshot: { p: 1 }, p_is_correct: true, p_organization_id: orgs.A });
  record('a pending organization: students can’t work in it yet', code(r) === 'PT403' || r.status === 403, r.text);
  await svc('set_organization_status', { p_org: orgs.A, p_status: 'active' });
  r = await attempt('WS', orgs.A);
  record('active + licensed: the student saves work, tagged with the organization', r.ok && rows(await admin('GET', `/rest/v1/question_attempts?select=organization_id&student_id=eq.${people.WS.id}`))[0]?.organization_id === orgs.A, r.text);
  r = await rpc('WS2', 'record_attempt', { p_attempt_id: randomUUID(), p_game_id: GAME, p_question_id: QUESTION, p_snapshot: { p: 2 }, p_is_correct: true });
  record('   a student with one organization doesn’t have to name it', r.ok && rows(await admin('GET', `/rest/v1/question_attempts?select=organization_id&student_id=eq.${people.WS2.id}`))[0]?.organization_id === orgs.A, r.text);

  // B with its own licence; X is a student in B and an instructor in A
  await svc('activate_license', { p_org: orgs.B, p_plan: PLAN, p_seats: 5, p_starts: today, p_ends: null });
  await svc('add_member', { p_org: orgs.B, p_user: people.BA.id, p_role: 'owner' });
  await svc('set_organization_status', { p_org: orgs.B, p_status: 'active' });
  for (const who of ['BS', 'X']) await rpc('BA', 'add_member', { p_org: orgs.B, p_user: people[who].id, p_role: 'student' });
  await attempt('BS', orgs.B); await attempt('X', orgs.B);
  r = await rpc('X', 'my_organizations');
  record('3 one person in two organizations with different roles', r.ok && rows(r).length === 2 && rows(r).some(o => o.id === orgs.A && o.role === 'instructor') && rows(r).some(o => o.id === orgs.B && o.role === 'student'), r.data);
  r = await rpc('X', 'add_member', { p_org: orgs.A, p_user: people.BS.id, p_role: 'student' });
  record('4 roles are per organization: an instructor in A can’t manage A', code(r) === 'PT403', r.text);

  // --- isolation (direct API, including tampering with organization ids) ---
  r = await read('BA', `question_attempts?select=id&organization_id=eq.${orgs.A}`);
  const r2 = await read('BA', `organization_memberships?select=id&organization_id=eq.${orgs.A}`), r3 = await read('BA', `subscriptions?select=id&organization_id=eq.${orgs.A}`);
  record('5 B’s owner can’t read A’s attempts, members or licences', rows(r).length === 0 && rows(r2).length === 0 && rows(r3).length === 0, [rows(r).length, rows(r2).length, rows(r3).length]);
  r = await rpc('BA', 'organization_overview', { p_org: orgs.A });
  const r4 = await rpc('BA', 'update_member', { p_org: orgs.A, p_user: people.WS.id, p_status: 'removed' });
  record('6 sending A’s id to A’s functions as B’s owner is refused (server-side context check)', code(r) === 'PT403' && code(r4) === 'PT403', [r.text, r4.text]);
  r = await read('WO', `question_attempts?select=organization_id`);
  record('   A’s owner sees A’s work only', rows(r).length === 2 && rows(r).every(x => x.organization_id === orgs.A), rows(r));
  r = await read('X', 'question_attempts?select=organization_id');
  record('   X (A instructor, B student) sees only their own work', rows(r).length === 1 && rows(r)[0].organization_id === orgs.B);
  r = await call('POST', '/rest/v1/organization_memberships', { token: people.WO.token, body: { organization_id: orgs.A, user_id: people.BS.id, role: 'owner' } });
  record('   organization tables can’t be written directly', !r.ok, `HTTP ${r.status}`);

  // --- status and licence affect access at once ---
  await svc('set_organization_status', { p_org: orgs.A, p_status: 'suspended', p_reason: 'test' });
  r = await rpc('WS', 'has_tool_access');
  const r5 = await attempt('WS', orgs.A), r6 = await rpc('WO', 'organization_overview', { p_org: orgs.A });
  record('8 suspending an organization stops its students immediately (same session); the owner can still see it', r.data === false && !r5.ok && r6.ok, [r.data, r5.status, r6.status]);
  await svc('set_organization_status', { p_org: orgs.A, p_status: 'active' });
  await svc('activate_license', { p_org: orgs.A, p_plan: PLAN, p_seats: 2, p_starts: inDays(-60), p_ends: inDays(-1) });
  r = await rpc('WS', 'org_license_state', { p_org: orgs.A });
  const r7 = await attempt('WS', orgs.A);
  record('an expired licence stops access; the history keeps both licences', r.data === 'expired' && !r7.ok && rows(await admin('GET', `/rest/v1/subscriptions?select=id&organization_id=eq.${orgs.A}`)).length === 2, [r.data, r7.status]);
  await svc('activate_license', { p_org: orgs.A, p_plan: PLAN, p_seats: 2, p_starts: today, p_ends: inDays(30) });
  r = await rpc('WO', 'update_member', { p_org: orgs.A, p_user: people.WS2.id, p_status: 'removed' });
  const seats = (await svc('seat_usage', { p_org: orgs.A })).data;
  record('removing a student frees the seat and keeps their records', r.ok && seats.active_students === 1 && rows(await admin('GET', `/rest/v1/question_attempts?select=id&student_id=eq.${people.WS2.id}`)).length === 1, seats);
  r = await rpc('D', 'has_tool_access');
  const r8 = await attempt('D', null);
  record('7 direct accounts keep working with no organization', r.data === true && r8.ok && rows(await admin('GET', `/rest/v1/question_attempts?select=organization_id&student_id=eq.${people.D.id}`))[0]?.organization_id === null, r8.text);
  r = await admin('GET', `/rest/v1/audit_events?select=action&organization_id=eq.${orgs.A}`);
  record('administrative changes are in the audit log', ['organization.created', 'subscription.activated', 'member.added', 'organization.status_changed', 'member.updated'].every(a => rows(r).some(x => x.action === a)));

  // --- PRD 2: invitations (A has 2 seats: WS active, WS2 removed -> 1 free) ---
  const newEmail = `org-test-new-${tag}@example.com`, new2 = `org-test-new2-${tag}@example.com`;
  r = await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: newEmail.toUpperCase(), p_role: 'student', p_first: 'Nia' });
  const inv1 = r.data || {};
  record('PRD2 the owner invites a student; the link token is long and random', r.ok && /^[0-9a-f]{64}$/.test(inv1.token || ''), r.text);
  const stored = rows(await admin('GET', `/rest/v1/invitations?select=email,token_hash&id=eq.${inv1.id}`))[0] || {};
  const { createHash } = await import('node:crypto');
  record('   only a hash of the token is stored; the address is kept in lower case', stored.token_hash === createHash('sha256').update(inv1.token || '').digest('hex') && stored.token_hash !== inv1.token && stored.email === newEmail, stored);
  r = await svc('seat_usage', { p_org: orgs.A });
  record('   a pending student invitation holds a seat', r.data && r.data.pending_invitations === 1 && r.data.available === 0, r.data);
  r = await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: 'another-' + newEmail, p_role: 'student' });
  record('   no seat left: the next student invitation is refused', code(r) === 'PT422', r.text);
  r = await rpc('WI', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'student' });
  const r9 = await rpc('BA', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'instructor' });
  record('   instructors and other organizations’ owners can’t invite', code(r) === 'PT403' && code(r9) === 'PT403', [r.text, r9.text]);
  r = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: inv1.token } });
  const bad = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: randomBytes(32).toString('hex') } });
  record('   anyone holding the link sees who invited them; a made-up link finds nothing', r.ok && r.data.status === 'pending' && r.data.account_exists === false && r.data.email === newEmail && /Test Academy/.test(r.data.organization) && bad.data?.status === 'not_found', [r.data, bad.data]);
  r = await call('GET', `/rest/v1/invitations?select=id&organization_id=eq.${orgs.A}`);
  const r10 = await read('BA', `invitations?select=id&organization_id=eq.${orgs.A}`);
  record('   invitations can’t be listed by the public or another organization', rows(r).length === 0 && rows(r10).length === 0, [r.status, rows(r10).length]);
  r = await rpc('X', 'accept_invitation', { p_token: inv1.token });
  record('   someone signed in with another address can’t accept it', code(r) === 'PT403', r.text);
  r = await rpc('WO', 'accept_invitation_new_user', { p_token: inv1.token, p_user: people.WO.id });
  record('   only the server can accept on behalf of a new account', !r.ok, r.text);
  // What the join function does: make the account, then accept for it.
  r = await admin('POST', '/auth/v1/admin/users', { body: { email: newEmail, password: randomBytes(12).toString('base64url') + 'aA1!', email_confirm: true } });
  people.N = { id: r.data?.id };
  r = await svc('accept_invitation_new_user', { p_token: inv1.token, p_user: people.N.id });
  const mem = rows(await admin('GET', `/rest/v1/organization_memberships?select=role,status&organization_id=eq.${orgs.A}&user_id=eq.${people.N.id}`))[0];
  const prof = rows(await admin('GET', `/rest/v1/profiles?select=display_name&user_id=eq.${people.N.id}`))[0];
  record('   accepting makes them an active student with a profile (first name from the invitation)', r.ok && mem?.role === 'student' && mem?.status === 'active' && prof?.display_name === 'Nia', [r.text, mem, prof]);
  r = await svc('accept_invitation_new_user', { p_token: inv1.token, p_user: people.N.id });
  const used = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: inv1.token } });
  record('   a link works once', code(r) === 'PT422' && used.data?.status === 'accepted', [r.text, used.data]);
  // Re-send, revoke, expire (instructors don't take seats)
  const i2 = (await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'instructor' })).data || {};
  r = await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'instructor' });
  const old = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: i2.token } });
  record('   re-sending makes a new link and cancels the old one', r.ok && r.data.resent === true && old.data?.status === 'revoked', [r.data, old.data]);
  const i3 = r.data || {};
  r = await rpc('WO', 'revoke_invitation', { p_invitation: i3.id });
  const gone = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: i3.token } });
  record('   the owner can withdraw an invitation', r.data === 'revoked' && gone.data?.status === 'revoked', [r.data, gone.data]);
  const i4 = (await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'instructor' })).data || {};
  await admin('PATCH', `/rest/v1/invitations?id=eq.${i4.id}`, { body: { expires_at: new Date(Date.now() - 60000).toISOString() }, headers: { Prefer: 'return=minimal' } });
  r = await call('POST', '/rest/v1/rpc/invitation_preview', { body: { p_token: i4.token } });
  const r11 = await svc('accept_invitation_new_user', { p_token: i4.token, p_user: people.D.id });
  record('   an expired invitation can’t be used', r.data?.status === 'expired' && code(r11) === 'PT422', [r.data, r11.text]);
  // Members page, CSV check, settings, setup, subscription
  r = await rpc('WO', 'org_members', { p_org: orgs.A });
  const r12 = await rpc('WS', 'org_members', { p_org: orgs.A });
  record('PRD2 members page: the owner sees members with emails and invitations; a student can’t', r.ok && r.data.members.some(m => m.email === newEmail) && r.data.invitations.length >= 3 && code(r12) === 'PT403', [r.text?.slice(0, 200), r12.text]);
  r = await rpc('WO', 'check_invitees', { p_org: orgs.A, p_emails: [newEmail, new2.toUpperCase(), 'fresh-' + newEmail, people.WS.email] });
  record('   CSV check marks members, invited and new addresses', r.ok && r.data[newEmail] === 'member' && r.data[new2] === 'new' && r.data['fresh-' + newEmail] === 'new' && r.data[people.WS.email] === 'member', r.data);
  r = await rpc('WO', 'update_organization_settings', { p_org: orgs.A, p_name: 'Test Academy ' + tag, p_welcome: 'Welcome!' });
  const r13 = await rpc('WI', 'update_organization_settings', { p_org: orgs.A, p_welcome: 'hacked' });
  const r14 = await rpc('WO', 'complete_setup', { p_org: orgs.A });
  const ov = (await rpc('WO', 'organization_overview', { p_org: orgs.A })).data || {};
  record('   settings and setup: the owner can, an instructor can’t; the checklist follows real data', r.ok && code(r13) === 'PT403' && r14.ok && ov.organization?.welcome_message === 'Welcome!' && ov.setup?.details === true && ov.setup?.students === true && !!ov.setup?.completed_at, [r13.text, ov.setup]);
  r = await rpc('WO', 'org_subscription', { p_org: orgs.A });
  const r15 = await rpc('WI', 'org_subscription', { p_org: orgs.A });
  record('   the subscription and its history are for the owner', r.ok && r.data.history.length >= 3 && code(r15) === 'PT403', [r15.text]);
  r = await admin('GET', `/rest/v1/audit_events?select=action,metadata&organization_id=eq.${orgs.A}&action=like.member.*`);
  record('   invitations are in the audit log, without tokens or addresses', ['member.invited', 'member.reinvited', 'member.invitation_revoked', 'member.joined'].every(a => rows(r).some(x => x.action === a)) && !JSON.stringify(rows(r)).includes(inv1.token) && !JSON.stringify(rows(r).filter(x => x.action !== 'member.joined')).includes(newEmail));

  // The join server function, if it's deployed
  const i5 = (await rpc('WO', 'create_invitation', { p_org: orgs.A, p_email: new2, p_role: 'instructor', p_first: 'Ivo' })).data || {};
  const pw = randomBytes(10).toString('base64url') + 'aA1!';
  r = await call('POST', '/functions/v1/join', { body: { token: i5.token, password: pw, first_name: 'Ivo' } });
  if (r.status === 404 && !(r.data && r.data.error)) console.log('SKIP  the join server function isn’t deployed yet (supabase/functions/join)');
  else {
    const login = await call('POST', '/auth/v1/token?grant_type=password', { body: { email: new2, password: pw } });
    const mine = login.ok ? await call('POST', '/rest/v1/rpc/my_organizations', { token: login.data.access_token, body: {} }) : {};
    people.N2 = { id: login.data?.user?.id };
    record('PRD2 join function: creates the account, accepts, and the new person can log in as an instructor', r.ok && login.ok && rows(mine).some(o => o.id === orgs.A && o.role === 'instructor'), [r.status, r.text, login.status]);
    r = await call('POST', '/functions/v1/join', { body: { token: i5.token, password: pw } });
    record('   the join function refuses a used link', r.status === 410 || r.status === 409, r.text);
  }
}

async function cleanup() {
  // People first (their memberships, attempts and sessions go with them), then the organizations.
  for (const p of Object.values(people)) if (p.id) await admin('DELETE', `/auth/v1/admin/users/${p.id}`).catch(() => {});
  for (const id of Object.values(orgs)) if (id) {
    await admin('DELETE', `/rest/v1/subscriptions?organization_id=eq.${id}&replaced_by=not.is.null`);
    await admin('DELETE', `/rest/v1/subscriptions?organization_id=eq.${id}`);
    await admin('DELETE', `/rest/v1/invitations?organization_id=eq.${id}`);
    await admin('DELETE', `/rest/v1/audit_events?organization_id=eq.${id}`);
    await admin('DELETE', `/rest/v1/organizations?id=eq.${id}`);
  }
  await admin('DELETE', `/rest/v1/audit_events?target_id=eq.${PLAN}`);
  await admin('DELETE', `/rest/v1/plans?id=eq.${PLAN}`);
  await admin('DELETE', `/rest/v1/questions?id=eq.${encodeURIComponent(QUESTION)}`);
  const left = await admin('GET', `/rest/v1/organizations?select=id&slug=like.*${tag}`);
  return left.ok && rows(left).length === 0;
}

main().catch(e => record('Setup / run error', false, e.message)).finally(async () => {
  const clean = await cleanup();
  record('Deleting the test data removed every organization, person and record it made', clean);
  const failed = results.filter(p => !p).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed. Test organizations, people and plan removed.`);
  process.exit(failed ? 1 : 0);
});
