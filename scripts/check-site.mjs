#!/usr/bin/env node
// Offline checks for the access setup (any Node version that runs .mjs).
//   node scripts/check-site.mjs
// - exactly the expected number of public tools in js/tools-config.js
// - every tool card on the homepage matches the config, and members-only
//   cards start out hidden
// - pages load the access scripts in the right order
// - no secret keys and no private tool files in anything that would be
//   committed or published

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import vm from 'node:vm';

const root = new URL('..', import.meta.url).pathname;
const read = p => readFileSync(root + p, 'utf8');
const results = [];
const check = (name, pass, detail) => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
};

// ---- tools config ----
const sandbox = { window: {} };
vm.runInNewContext(read('js/tools-config.js'), sandbox);
const tools = sandbox.window.MATHLETE_TOOLS || [];
const wantPublic = sandbox.window.MATHLETE_PUBLIC_TOOL_COUNT;
const pub = tools.filter(t => t.access === 'public');
const priv = tools.filter(t => t.access === 'private');
check(`Exactly ${wantPublic} public tools`, pub.length === wantPublic, pub.map(t => t.id).join(', '));
check('Every tool is either public or private', tools.every(t => t.access === 'public' || t.access === 'private'));
check('Tool ids are unique', new Set(tools.map(t => t.id)).size === tools.length);
check('Live public tools have an https url', pub.filter(t => t.status === 'live').every(t => /^https:\/\//.test(t.url || '')));
check('Private tools point at a file in the bucket, not a public url', priv.every(t => t.file && !t.url));

// ---- homepage cards ----
const index = read('index.html');
const cards = [...index.matchAll(/<(details|article|a)\b[^>]*\bdata-tool="([^"]+)"[^>]*>/g)].map(m => ({ id: m[2], tag: m[0] }));
const byId = Object.fromEntries(tools.map(t => [t.id, t]));
check('Every card on the homepage is in the config', cards.every(c => byId[c.id]), cards.filter(c => !byId[c.id]).map(c => c.id).join(', '));
check('Every tool in the config has a card', tools.every(t => cards.some(c => c.id === t.id)));
check('Members-only cards start hidden', cards.filter(c => byId[c.id] && byId[c.id].access === 'private').every(c => /\shidden(\s|>|=)/.test(c.tag)));
check('Public cards are visible without JavaScript', cards.filter(c => byId[c.id] && byId[c.id].access === 'public').every(c => !/\shidden(\s|>|=)/.test(c.tag)));
check('No private tool file is linked from the homepage', priv.every(t => !index.includes(t.file)));

// ---- script order on pages ----
for (const page of ['index.html', 'about.html', 'login.html', 'account.html', 'tool.html']) {
  const html = read(page);
  const order = ['js/tools-config.js', 'js/supabase-config.js', 'js/auth.js'].map(s => html.indexOf(s));
  check(`${page} loads config, then Supabase config, then auth`, order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2]);
}

// ---- secrets / private files in the repo ----
let files = [];
try {
  files = execSync('git ls-files --cached --others --exclude-standard', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch { console.log('(git not available; skipping repository scan)'); }
const textFiles = files.filter(f => !/\.(png|jpe?g|gif|webp|ico|pdf|woff2?)$/i.test(f) && existsSync(root + f));
const leaks = [];
for (const f of textFiles) {
  const s = readFileSync(root + f, 'utf8');
  for (const m of s.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.(eyJ[A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
    try {
      const role = JSON.parse(Buffer.from(m[1], 'base64url').toString()).role;
      if (role && role !== 'anon') leaks.push(`${f}: ${role} JWT`);
    } catch {}
  }
  if (/sb_secret_[A-Za-z0-9_-]{10,}/.test(s)) leaks.push(`${f}: sb_secret_ key`);
  const svc = s.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s#]+)/);
  if (svc && !/^your-|^\$|^<|^""$/.test(svc[1]) && f !== '.env.example') leaks.push(`${f}: SUPABASE_SERVICE_ROLE_KEY value`);
}
check('No service-role or secret keys in committed/published files', leaks.length === 0, leaks.join('; '));
check('.env is not committed', !files.includes('.env'));
check('js/supabase-config.js is generated, not committed', !files.includes('js/supabase-config.js'));
check('No private tool sources in the repository', !files.some(f => f.startsWith('private-tools/')));
const gi = existsSync(root + '.gitignore') ? read('.gitignore') : '';
check('.gitignore covers .env, generated config and private-tools/', ['.env', 'js/supabase-config.js', 'private-tools/'].every(x => gi.includes(x)));

const failed = results.filter(x => !x).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
