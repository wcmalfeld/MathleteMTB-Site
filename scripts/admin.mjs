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
    const header = readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).slice(0, 14);
    console.log(header.map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(cmd ? 1 : 0);
  }
  if (!BASE || !KEY) die('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (see .env.example).');
  if (['invite', 'create', 'grant', 'restore', 'revoke', 'reset', 'reset-link'].includes(cmd)) {
    if (!args[0] || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args[0])) die(`Usage: ${cmd} <email>`);
    args[0] = args[0].trim().toLowerCase();
  }
  try {
    await commands[cmd](...args);
  } catch (e) {
    die(`Failed: ${e.message}`);
  }
}

main();
