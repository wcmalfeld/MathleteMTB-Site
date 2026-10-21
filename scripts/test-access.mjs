#!/usr/bin/env node
// End-to-end access test against your real Supabase project (Node 18+).
//   node scripts/test-access.mjs
// Needs SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in
// .env. It creates two throwaway users and one probe file, checks every
// way in, then deletes all of it. Nothing on the website is touched.

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
const BUCKET = 'private-tools';

if (typeof fetch !== 'function') { console.error('Needs Node 18+ (try: nvm use 20).'); process.exit(1); }
if (!BASE || !ANON || !SERVICE) { console.error('Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.'); process.exit(1); }

async function call(method, path, { key = ANON, token, body, headers = {} } = {}) {
  const h = { apikey: key, Authorization: 'Bearer ' + (token || key), ...headers };
  let payload = body;
  if (body !== undefined && !(body instanceof Uint8Array) && typeof body !== 'string') {
    payload = JSON.stringify(body); h['Content-Type'] = 'application/json';
  }
  const res = await fetch(BASE + path, { method, headers: h, body: payload });
  const text = await res.text();
  let data = text;
  try { data = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, ok: res.ok, data, text };
}
const admin = (m, p, o = {}) => call(m, p, { ...o, key: SERVICE });

const results = [];
function record(n, name, pass, detail) {
  results.push({ n, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${String(n).padEnd(4)} ${name}${detail ? '  (' + detail + ')' : ''}`);
}

const tag = randomBytes(4).toString('hex');
const memberEmail = `access-test-member-${tag}@example.com`;
const outsiderEmail = `access-test-outsider-${tag}@example.com`;
const pw = () => randomBytes(12).toString('base64url') + 'aA1!';
const memberPw = pw(), outsiderPw = pw();
const probePath = `__access-test/probe-${tag}.html`;
const probeBody = `<!doctype html><title>probe ${tag}</title>`;
const created = [];

const login = (email, password) =>
  call('POST', '/auth/v1/token?grant_type=password', { body: { email, password } });
const fetchProbe = token => call('GET', `/storage/v1/object/${BUCKET}/${probePath}`, { token });
const hasAccess = token => call('POST', '/rest/v1/rpc/has_tool_access', { token, body: {} });

async function main() {
  // --- setup ---
  for (const [email, password, member] of [[memberEmail, memberPw, true], [outsiderEmail, outsiderPw, false]]) {
    const r = await admin('POST', '/auth/v1/admin/users', { body: { email, password, email_confirm: true } });
    if (!r.ok) throw new Error('could not create test user: ' + r.text);
    created.push(r.data.id);
    if (member) {
      const m = await admin('POST', '/rest/v1/members', { body: { user_id: r.data.id, email, active: true, note: 'access test' }, headers: { Prefer: 'return=minimal' } });
      if (!m.ok) throw new Error('could not add member row (did you run supabase/setup.sql?): ' + m.text);
    }
  }
  const up = await admin('POST', `/storage/v1/object/${BUCKET}/${probePath}`, { body: probeBody, headers: { 'Content-Type': 'text/html', 'x-upsert': 'true' } });
  if (!up.ok) throw new Error('could not upload probe (does the private-tools bucket exist?): ' + up.text);

  // --- logged out ---
  let r = await fetchProbe();
  record('6a', 'Logged-out visitor cannot download a private tool', !r.ok, `HTTP ${r.status}`);
  r = await call('GET', `/storage/v1/object/public/${BUCKET}/${probePath}`);
  record('6b', 'Private bucket has no public URL', !r.ok, `HTTP ${r.status}`);
  r = await hasAccess();
  record('6c', 'Logged-out visitor cannot call the access check', !r.ok || r.data !== true, `HTTP ${r.status}`);
  r = await call('GET', '/rest/v1/members?select=*');
  record('6d', 'Logged-out visitor cannot read members', !r.ok || (Array.isArray(r.data) && r.data.length === 0), `HTTP ${r.status}`);
  r = await call('POST', '/auth/v1/signup', { body: { email: `access-test-signup-${tag}@example.com`, password: pw() } });
  if (r.ok && r.data && (r.data.id || (r.data.user && r.data.user.id))) created.push(r.data.id || r.data.user.id);
  record('6e', 'Public self sign-up is disabled', !r.ok, `HTTP ${r.status}`);

  // --- bad credentials ---
  r = await login(memberEmail, 'wrong-' + memberPw);
  record(7, 'Invalid credentials cannot log in', !r.ok, `HTTP ${r.status}`);

  // --- valid account without access ---
  r = await login(outsiderEmail, outsiderPw);
  const outsider = r.data && r.data.access_token;
  record('8a', 'Account without access can authenticate', !!outsider, `HTTP ${r.status}`);
  r = await fetchProbe(outsider);
  record('8b', 'Account without access cannot download private tools', !r.ok, `HTTP ${r.status}`);
  r = await hasAccess(outsider);
  record('8c', 'Account without access: has_tool_access() is false', r.ok && r.data === false, JSON.stringify(r.data));
  r = await call('POST', '/rest/v1/members', { token: outsider, body: { user_id: created[1], email: outsiderEmail, active: true } });
  record('8d', 'Account without access cannot add itself as a member', !r.ok, `HTTP ${r.status}`);
  r = await fetchProbe(outsider);
  record('8e', '...and still cannot download afterwards', !r.ok, `HTTP ${r.status}`);

  // --- member ---
  r = await login(memberEmail, memberPw);
  let member = r.data && r.data.access_token;
  record('9a', 'Member can log in', !!member, `HTTP ${r.status}`);
  r = await fetchProbe(member);
  record('9b', 'Member can download private tools', r.ok && r.text === probeBody, `HTTP ${r.status}`);
  r = await hasAccess(member);
  record('9c', 'Member: has_tool_access() is true', r.ok && r.data === true, JSON.stringify(r.data));
  r = await call('GET', '/rest/v1/members?select=email', { token: member });
  record('9d', 'Member sees only their own members row', r.ok && Array.isArray(r.data) && r.data.length === 1 && r.data[0].email === memberEmail, JSON.stringify(r.data));
  r = await call('POST', `/storage/v1/object/${BUCKET}/__access-test/evil-${tag}.html`, { token: member, body: 'x', headers: { 'Content-Type': 'text/html' } });
  record('9e', 'Member cannot upload or replace tools', !r.ok, `HTTP ${r.status}`);

  // --- logout ---
  r = await call('POST', '/auth/v1/logout?scope=global', { token: member });
  record('11a', 'Member can log out', r.ok, `HTTP ${r.status}`);
  r = await fetchProbe(member);
  record('11b', 'Old token stops working right after logout', !r.ok, `HTTP ${r.status}`);

  // --- revoke ---
  r = await login(memberEmail, memberPw);
  member = r.data && r.data.access_token;
  r = await fetchProbe(member);
  const before = r.ok;
  await admin('PATCH', `/rest/v1/members?user_id=eq.${created[0]}`, { body: { active: false }, headers: { Prefer: 'return=minimal' } });
  r = await fetchProbe(member);
  record('12a', 'Revoking access blocks an already-signed-in member immediately', before && !r.ok, `before ${before ? 200 : 'denied'}, after HTTP ${r.status}`);
  r = await call('PATCH', `/rest/v1/members?user_id=eq.${created[0]}`, { token: member, body: { active: true }, headers: { Prefer: 'return=representation' } });
  const selfRestored = r.ok && Array.isArray(r.data) && r.data.length > 0;
  record('12b', 'Revoked member cannot re-activate themselves', !selfRestored, `HTTP ${r.status}`);
  await admin('PUT', `/auth/v1/admin/users/${created[0]}`, { body: { ban_duration: '876000h' } });
  r = await login(memberEmail, memberPw);
  record('12c', 'Revoked (banned) member cannot log in again', !r.ok, `HTTP ${r.status}`);
}

async function cleanup() {
  await admin('DELETE', `/storage/v1/object/${BUCKET}`, { body: { prefixes: [probePath] } }).catch(() => {});
  for (const id of created) await admin('DELETE', `/auth/v1/admin/users/${id}`).catch(() => {});
}

main()
  .catch(e => { record('!', 'Setup / run error', false, e.message); })
  .finally(async () => {
    await cleanup();
    const failed = results.filter(r => !r.pass).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed. Test users and probe file removed.`);
    process.exit(failed ? 1 : 0);
  });
