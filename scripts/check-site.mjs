#!/usr/bin/env node
// Offline checks for the access setup (any Node version that runs .mjs).
//   node scripts/check-site.mjs
// - exactly the expected number of public tools in js/tools-config.js
// - the home page (the Lab) has a card and a description for every live
//   tool, and links to no private tool file
// - pages load the access scripts in the right order
// - no secret keys and no private tool files in anything that would be
//   committed or published
// - Learning Lab: every live tool has its listing fields, and the generated
//   parts of index.html and the pages in learning-lab/ match the registry
// - riding curriculum (riding/): pages up to date, every page noindex and
//   unlinked from the site, every lesson cites known sources, nothing
//   approved without a named reviewer, no trick technique in outlines and
//   no universal settings (pressures, clicks, sag) in the content
// - tutoring and booking: every page has "Book a Session", subject links
//   match js/booking-config.js, and no prices are typed into the pages
//   node scripts/check-site.mjs --online   also checks that every live
//   public tool's address responds

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import vm from 'node:vm';
import https from 'node:https';
import { render as renderLab, loadRegistry, detailsPath, catHref, SPORTS, SUBJECTS, LEVELS, DURATIONS } from './build-lab.mjs';

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

// ---- games hosted in this repo (they share the login, so they can save progress) ----
const SITE_ORIGIN = 'https://www.mathletemtb.com/';
// How to find each game's question kinds in its source: the single-file
// games name them '<course or area>-<topic>', e.g. 'geo-pythagorean'.
const KIND = /'((?:alg1|geo|alg2|precalc|stats|calc|sheet|tune)-[a-z0-9-]+)'/g;
// Jump Lab: its mission ids, one kind for mission predictions, and 'predict-<id>' for each Explore prediction.
const jumpLabKinds = html => [
  ...[...html.slice(html.indexOf('const CHALLENGES = ['), html.indexOf('const PREDICTIONS = [')).matchAll(/^    id: '([a-z0-9-]+)'/gm)].map(m => m[1]),
  'mission-prediction',
  ...[...html.slice(html.indexOf('const PREDICTIONS = ['), html.indexOf('const CONCEPTS = ')).matchAll(/^    id: '([a-z0-9-]+)'/gm)].map(m => 'predict-' + m[1])];
// Physics Playground: a minified build, so its kinds are listed here (they are defined in src/progress.tsx in its own repository).
const playgroundKinds = () => ['predict-outcome', 'predict-distance', 'predict-airtime', 'q-compare-runs', 'q-angle-components', 'calc-vx-q', 'calc-vy-q', 'compare-vy-q', 'height-time-q', 'graph-q'];
const QUESTION_KINDS = { 'trail-builder': KIND, 'gear-ratio-lab': KIND, 'strava-showdown': KIND, 'jump-lab': jumpLabKinds, 'physics-playground': playgroundKinds };
const hosted = pub.filter(t => (t.url || '').startsWith(SITE_ORIGIN)).map(t => ({ ...t, page: t.url.slice(SITE_ORIGIN.length) + 'index.html' }));
check('Tools on mathletemtb.com live at learning-lab/<id>/ in this repo', hosted.every(t => t.page === `learning-lab/${t.id}/index.html` && existsSync(root + t.page)), hosted.map(t => t.page).join(', '));
for (const t of hosted) {
  const html = read(t.page);
  const order = ['../../js/supabase-config.js', '../../js/auth.js', '../../js/progress.js'].map(s => Math.max(html.indexOf(`src="${s}"`), html.indexOf(`src="${s}?`)));
  check(`${t.page} loads Supabase config, auth, then progress tracking`, order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2]);
  if (t.id === 'physics-playground') {
    const asset = (html.match(/assets\/(index-[^"]+\.js)/) || [])[1];
    check(`${t.page}: the build exists and has progress tracking in it`, !!asset && existsSync(root + `learning-lab/${t.id}/assets/${asset}`) && read(`learning-lab/${t.id}/assets/${asset}`).includes('MathleteProgress'));
  }
  // Every kind of question the game can ask must be registered, or the
  // server refuses to save attempts at it.
  const sql = read('supabase/progress.sql');
  const find = QUESTION_KINDS[t.id];
  const kinds = typeof find === 'function' ? find(html) : [...new Set([...html.matchAll(find || /$^/g)].map(m => m[1]))];
  const missing = kinds.filter(k => !sql.includes(`'${t.id}:${k}'`));
  check(`${t.page}: its ${kinds.length} question kinds are registered in supabase/progress.sql`, kinds.length > 0 && missing.length === 0, missing.join(', '));
}

// ---- private tools that save progress (they use the player page's copy of js/progress.js) ----
{
  const player = read('tool.html');
  const order = ['js/auth.js', 'js/progress.js', 'js/tool-player.js'].map(x => player.indexOf(x));
  check('tool.html loads auth, then progress tracking, then the player', order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2]);
  const summit = 'private-tools/summit-expedition/index.html';
  if (existsSync(root + summit)) {   // git-ignored, so only checked on your computer
    const sql = read('supabase/progress.sql');
    const missing = [...read(summit).matchAll(/defSkill\('[^']*', '([^']*)'/g)].map(m => m[1]).filter(k => !sql.includes(`'summit-expedition:${k}'`));
    check('Summit Expedition: every skill is registered in supabase/progress.sql', missing.length === 0, missing.join(', '));
  }
}

// ---- student pages (dashboard, progress, review) ----
for (const page of ['dashboard.html', 'my-progress.html', 'review.html', 'goals.html']) {
  const html = read(page);
  const order = ['js/tools-config.js', 'js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'js/student.js'].map(x => html.indexOf(x));
  check(`${page} loads config, Supabase config, auth, progress, then the student scripts`, order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])));
  check(`${page} is kept out of search engines`, html.includes('<meta name="robots" content="noindex">'));
}
{
  // Text from the database must never be inserted as HTML on these pages.
  const unsafe = ['js/student.js', 'js/dashboard.js', 'js/my-progress.js', 'js/review.js', 'js/goals.js', 'js/org.js', 'js/organization.js', 'js/join.js', 'js/login.js'].filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(read(f)));
  check('Student pages never build HTML from data (text only)', unsafe.length === 0, unsafe.join(', '));
  const sql = ['setup', 'progress', 'organizations'].map(f => read(`supabase/${f}.sql`)).join('\n');
  const calls = [...new Set(['js/student.js', 'js/dashboard.js', 'js/my-progress.js', 'js/review.js', 'js/goals.js', 'js/progress.js', 'js/org.js', 'js/auth.js', 'js/organization.js', 'js/join.js', 'js/login.js', 'supabase/functions/invite/index.ts', 'supabase/functions/join/index.ts'].flatMap(f => [...read(f).matchAll(/\.rpc\(([^,)]+)[,)]/g)].flatMap(m => [...m[1].matchAll(/'([a-z]+_[a-z_]+)'/g)].map(x => x[1]))))];
  const missing = calls.filter(fn => !sql.includes(`function public.${fn}(`));
  check(`Every database function the pages call exists in supabase/ (${calls.join(', ')})`, calls.length >= 7 && missing.length === 0, missing.join(', '));
}

// ---- MTB Coaching pages (separate from the Learning pages) ----
{
  // While coaching is switched off, no page may link to it.
  const off = /var COACHING_ENABLED = false;/.test(read('js/coaching.js'));
  if (off) {
    const linked = execSync("grep -rl 'href=\"coaching.html\"\\|riding-goals.html\\|training.html' --include='*.html' . || true", { cwd: root, encoding: 'utf8' })
      .split('\n').filter(f => f && !/^\.\/(coaching|riding-goals|training)\.html$/.test(f));
    check('MTB Coaching is switched off and no page links to it', linked.length === 0, linked.join(', '));
  }
}
for (const page of ['coaching.html', 'riding-goals.html', 'training.html']) {
  const html = read(page);
  const order = ['js/tools-config.js', 'js/supabase-config.js', 'js/auth.js', 'js/student.js', 'js/coaching.js'].map(x => html.indexOf('src="' + x));
  check(`${page} loads config, Supabase config, auth, the student shell, then coaching.js`, order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])));
  check(`${page} is kept out of search engines and names its page`, html.includes('<meta name="robots" content="noindex">') && html.includes(`data-page="${page.replace('.html', '')}"`));
}
{
  const js = read('js/coaching.js');
  check('Coaching pages never build HTML from data (text only)', !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(js));
  const sql = read('supabase/coaching.sql');
  const calls = [...new Set([...js.matchAll(/(?:\.rpc|\bact)\('([a-z]+_[a-z_]+)'/g)].map(m => m[1]))];
  const missing = calls.filter(fn => !sql.includes(`function public.${fn}(`));
  check(`Every database function the coaching pages call exists in supabase/coaching.sql (${calls.join(', ')})`, calls.length >= 8 && missing.length === 0, missing.join(', '));
  // Separation: the Learning pages call no coaching functions, and the coaching pages no academic ones.
  const coachingFns = [...sql.matchAll(/function public\.([a-z_]+)\(/g)].map(m => m[1]);
  const learning = ['js/dashboard.js', 'js/my-progress.js', 'js/review.js', 'js/goals.js', 'js/progress.js'].map(read).join('\n');
  const crossed = coachingFns.filter(fn => learning.includes(`'${fn}'`));
  const academic = [...read('supabase/progress.sql').matchAll(/function public\.([a-z_]+)\(/g)].map(m => m[1]).filter(fn => js.includes(`'${fn}'`));
  check('Learning and Coaching pages call only their own database functions', crossed.length === 0 && academic.length === 0, crossed.concat(academic).join(', '));
}

// ---- Slope & Linear Relationships Lab (standalone module; tests: scripts/test-slope-lab.mjs) ----
{
  const dir = 'learning-lab/slope-lab/';
  const html = read(dir + 'index.html');
  const css = read(dir + 'styles/slope-lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const leaking = css.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@')).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith('.slab'));
  check('Slope lab styles are all scoped under .slab (nothing leaks into other pages)', leaking.length === 0, leaking.slice(0, 5).join(' | '));
  // The module stays independent: only its page (index.html + main.js) talks to the site.
  const js = execSync(`find ${root + dir} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
  check('Slope lab module doesn’t depend on the site (only its page connects it)', coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
  check('Slope lab page loads progress tracking in order, then the module', ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])));
  const unsafe = js.filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
  check('Slope lab never builds HTML from strings', unsafe.length === 0, unsafe.join(', '));
  check('Slope lab is listed: indexable, and linked from Algebra 1 → Slope and Rate of Change', !html.includes('noindex') &&
    existsSync(root + 'classes/algebra-1/slope-and-rate-of-change/index.html') && read('classes/algebra-1/slope-and-rate-of-change/index.html').includes('href="learning-lab/slope-lab/?from='));
}

// ---- Jump Trajectory Lab (standalone module; tests: scripts/test-jump-lab.mjs) ----
{
  const dir = 'learning-lab/jump-trajectory-lab/';
  const html = read(dir + 'index.html');
  const css = read(dir + 'styles/jump-lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const leaking = css.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@')).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith('.jlab'));
  check('Jump lab styles are all scoped under .jlab', leaking.length === 0, leaking.slice(0, 5).join(' | '));
  const js = execSync(`find ${root + dir} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
  check('Jump lab module doesn’t depend on the site (only its page connects it)', coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
  check('Jump lab page loads progress tracking in order, then the module', ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])));
  const unsafe = js.filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
  check('Jump lab never builds HTML from strings', unsafe.length === 0, unsafe.join(', '));
  check('Jump lab is linked from Algebra 1 → Graphing Quadratics', read('classes/algebra-1/graphing-quadratics/index.html').includes('href="learning-lab/jump-trajectory-lab/?from='));
  check('The Lab’s original Jump Lab game is untouched and still listed', existsSync(root + 'learning-lab/jump-lab/index.html') && tools.some(t => t.id === 'jump-lab' && t.status === 'live'));
}

// ---- Classes (generated from content/classes/ by scripts/build-classes.mjs) ----
{
  const { loadClasses } = await import('../content/classes/model.mjs');
  const { render: renderClasses } = await import('./build-classes.mjs');
  const { ACTIVITIES } = await import('../content/classes/activities.mjs');
  const model = loadClasses();
  check('Classes content has no id or reference problems', model.errors.length === 0, model.errors.slice(0, 5).join('; '));
  const want = renderClasses();
  const staleC = Object.entries(want).filter(([p, h]) => !existsSync(root + p) || read(p) !== h).map(([p]) => p);
  check('Classes pages and supabase/curriculum.sql are up to date (node scripts/build-classes.mjs)', staleC.length === 0, staleC.slice(0, 5).join(', '));
  check('Classes: Algebra 1, Algebra 2, Geometry and Precalculus, 9 units each, every topic with skills',
    model.courses.map(c => c.name).join() === 'Algebra 1,Algebra 2,Geometry,Precalculus' && model.courses.every(c => c.units.length === 9) && model.topics.every(t => t.skills.length >= 2));
  const lab = ACTIVITIES.find(a => a.id === 'slope-lab');
  const { QUESTIONS: LABQ } = await import('../learning-lab/slope-lab/content/questions.js');
  const labMap = Object.fromEntries(LABQ.map(q => [q.id, q.objective]));
  const tracked = Object.keys(lab.tracking.questions);
  check('Slope lab: every lab question is linked to curriculum skills, and no others', tracked.length === LABQ.length && LABQ.every(q => lab.tracking.questions[q.id] && lab.tracking.questions[q.id].length));
  const activitiesText = read('content/classes/activities.mjs');
  const objMismatch = LABQ.filter(q => !new RegExp(`\\b${q.id}: '${q.objective}'`).test(activitiesText)).map(q => q.id);
  check('Slope lab: question objectives in activities.mjs match the lab', objMismatch.length === 0, objMismatch.join(', '));
  check('Classes progress function exists in supabase/curriculum.sql', read('js/classes.js').includes("rpc('curriculum_progress'") && read('supabase/curriculum.sql').includes('function public.curriculum_progress('));
  check('Classes pages never build HTML from strings', !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(read('js/classes.js')));
  const emptyWithCard = model.topics.filter(t => !t.activities.length && read(t.href + 'index.html').includes('class="cls-activity"')).map(t => t.id);
  check('Topics without activities show the honest empty state (no placeholder cards)', emptyWithCard.length === 0 &&
    model.topics.filter(t => !t.activities.length).every(t => read(t.href + 'index.html').includes('Learning activities for this topic are being developed.')), emptyWithCard.join(', '));
  const navless = execSync(`grep -rL 'href="classes/"' --include='*.html' ${root} || true`, { encoding: 'utf8' }).split('\n')
    .filter(f => f && /<nav class="site-nav"/.test(readFileSync(f, 'utf8')) && !f.includes('node_modules')).map(f => f.replace(root, ''));
  check('Every page with the site nav links to Classes', navless.length === 0, navless.slice(0, 5).join(', '));
}

// ---- Organizations (supabase/organizations.sql) ----
{
  const sqlO = read('supabase/organizations.sql');
  check('Student pages load the organization switcher (js/org.js) before student.js', ['dashboard.html', 'my-progress.html', 'review.html', 'goals.html'].every(p => { const h = read(p); const a = h.indexOf('src="js/org.js'), b = h.indexOf('src="js/student.js'); return a > 0 && b > a; }));
  check('Organization tables are read-only from the browser (no insert/update/delete grants)', !/grant (insert|update|delete|all)[^;]*on public\.(organizations|organization_memberships|subscriptions|plans|invitations|audit_events)/i.test(sqlO));
  check('Every organization role check treats "no role" as a refusal (no bare org_role(...) in ...)', !/public\.org_role\(p_org\) in \(/.test(sqlO));
  check('Private tools need a direct account (not organization access) for now', /bucket_id = 'private-tools' and public\.has_individual_access\(\)/.test(read('supabase/setup.sql')) && /st\.individual === false/.test(read('js/tool-player.js')));
  // Invitations and the organization page (Step 2)
  for (const page of ['organization.html', 'join.html']) {
    const h = read(page), js = page === 'join.html' ? 'js/join.js' : 'js/organization.js';
    check(`${page} is kept out of search engines and loads auth before ${js}`, h.includes('<meta name="robots" content="noindex">') && h.indexOf('src="js/auth.js') > 0 && h.indexOf(`src="${js}`) > h.indexOf('src="js/auth.js'));
  }
  check('Invitation tokens are stored only as a hash (no plain token column)', /token_hash\s+text not null unique/.test(sqlO) && !/^\s*token\s+text/m.test(sqlO));
  check('Only the server (service role) can accept on behalf of a new account', /grant execute on function public\.accept_invitation_new_user\(text, uuid\) to service_role;/.test(sqlO) && !/accept_invitation_new_user\(text, uuid\)[^;]*to [^;]*(anon|authenticated)/.test(sqlO.replace(/revoke[^;]*;/g, '')));
  const fnInvite = read('supabase/functions/invite/index.ts'), fnJoin = read('supabase/functions/join/index.ts');
  const edgeRpc = [...(fnInvite + fnJoin).matchAll(/rpc\/([a-z_]+)|\$\{rest\}\/([a-z_]+)|rpc\('([a-z_]+)'/g)].map(m => m[1] || m[2] || m[3]);
  check(`Server functions only call database functions that exist (${[...new Set(edgeRpc)].join(', ')})`, edgeRpc.length >= 4 && edgeRpc.every(fn => sqlO.includes(`function public.${fn}(`)));
  check('The invite function acts as the signed-in person (forwards their sign-in, never the service key)', /Authorization: auth/.test(fnInvite) && !/SERVICE_ROLE/.test(fnInvite));
  check('Server keys come only from the function environment, never typed in', ![fnInvite, fnJoin].some(f => /eyJ[A-Za-z0-9_-]{20,}|sb_secret_|re_[A-Za-z0-9]{20,}/.test(f)) && /env\.SUPABASE_SERVICE_ROLE_KEY/.test(fnJoin));
  const browserFiles = execSync("grep -rlE 'SERVICE_ROLE|service_role_key' js *.html || true", { cwd: root, encoding: 'utf8' }).trim();
  check('No page or browser script mentions the service role key', browserFiles === '', browserFiles);
  check('The invitation page takes the token out of the address bar', /history\.replaceState/.test(read('js/join.js')));
  check('Login lets an invitation through and sends managers to their organization', /joining = \/\^join\\\.html\//.test(read('js/login.js')) && /'organization\.html'/.test(read('js/login.js')));
  check('Run order is documented: setup → progress → organizations → curriculum', /AFTER\s+setup\.sql and progress\.sql \(and before curriculum\.sql\)/.test(sqlO.replace(/--\s*/g, '')));
}

// ---- home page (the Lab) ----
const index = read('index.html');
const cards = [...index.matchAll(/<article\b[^>]*\bdata-lab-tool="([^"]+)"/g)].map(m => m[1]);
const liveIds = tools.filter(t => t.status === 'live').map(t => t.id);
check('Every live tool has a card on the home page', liveIds.every(id => cards.includes(id)), liveIds.filter(id => !cards.includes(id)).join(', '));
check('Every card on the home page is a live tool in the config', cards.every(id => liveIds.includes(id)), cards.filter(id => !liveIds.includes(id)).join(', '));
const noDetails = tools.filter(t => t.status === 'live' && !existsSync(root + detailsPath(t))).map(t => t.id);
check('Every live tool has a description in content/tool-details/', noDetails.length === 0, noDetails.join(', '));
check('No private tool file is linked from the home page', priv.every(t => !index.includes(t.file)));

// ---- script order on pages ----
const labPages = renderLab();
const REDIRECT = 'learning-lab/index.html';
const homes = Object.values(SPORTS).map(x => x.home);
const labContent = Object.keys(labPages).filter(p => p !== REDIRECT && !homes.includes(p));
for (const page of ['index.html', 'ski/index.html', 'about.html', 'login.html', 'account.html', 'tool.html', 'college-beyond.html', 'tutoring.html', 'book.html', ...labContent]) {
  const html = read(page);
  const order = ['js/tools-config.js', 'js/supabase-config.js', 'js/auth.js'].map(s => html.indexOf(s));
  check(`${page} loads config, then Supabase config, then auth`, order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2]);
}

// ---- Learning Lab ----
const { categories } = loadRegistry();
const catIds = categories.map(c => c.id);
const listed = tools.filter(t => t.status === 'live');
const within = (vals, allowed) => Array.isArray(vals) && vals.length > 0 && vals.every(v => v in allowed);
const badListing = listed.filter(t =>
  !(t.category === null || catIds.includes(t.category)) || !t.summary || !t.image || !existsSync(root + t.image) ||
  !within(t.difficulty, LEVELS) || !within(t.subjects, SUBJECTS) || !(t.duration in DURATIONS) || !t.minutes || typeof t.featured !== 'boolean');
check('Every live tool has valid Learning Lab fields', badListing.length === 0, badListing.map(t => t.id).join(', '));
check('Category ids are unique', new Set(catIds).size === catIds.length);
const stale = Object.entries(labPages).filter(([p, html]) => !existsSync(root + p) || read(p) !== html).map(([p]) => p);
check('Learning Lab pages are up to date (node scripts/build-lab.mjs)', stale.length === 0, stale.join(', '));
check('Every lab has a sport (mtb or ski)', categories.every(c => c.sport in SPORTS), categories.filter(c => !(c.sport in SPORTS)).map(c => c.id).join(', '));
for (const [sport, info] of Object.entries(SPORTS)) {
  const home = read(info.home);
  const mine = categories.filter(c => c.sport === sport);
  check(`${info.home} links to every ${sport} lab, and only those`, mine.every(c => home.includes(`href="${catHref(c)}"`)) &&
    categories.filter(c => c.sport !== sport).every(c => !home.includes(`href="${catHref(c)}"`)));
}
const ski = read('ski/index.html').replace(/<!--[\s\S]*?-->/g, '');
check('ski/index.html has <base href="../"> and one <h1>', ski.includes('<base href="../">') && (ski.match(/<h1\b/g) || []).length === 1);
// With <base>, a bare href="#x" would jump to the MTB home page.
const skiAnchors = [...ski.matchAll(/href="(?:ski\/)?#([^"]*)"/g)];
check('ski/index.html in-page links say ski/#..., and every one has a target',
  skiAnchors.every(m => m[1] === '' || m[0].startsWith('href="ski/#')) && skiAnchors.filter(m => m[1]).every(m => ski.includes(`id="${m[1]}"`)),
  skiAnchors.filter(m => m[1] && (!m[0].startsWith('href="ski/#') || !ski.includes(`id="${m[1]}"`))).map(m => m[0]).join(', '));
check('learning-lab/ redirects to the home page', /http-equiv="refresh" content="0; url=\.\.\/"/.test(labPages[REDIRECT]));

if (process.argv.includes('--online')) {
  // node:https rather than fetch, so this runs on older Node too.
  const status = (url, hops = 5) => new Promise(done => {
    https.get(url, res => {
      res.resume();
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && hops) {
        done(status(new URL(res.headers.location, url).href, hops - 1));
      } else done(res.statusCode);
    }).on('error', () => done(0));
  });
  for (const t of pub.filter(t => t.status === 'live')) {
    const code = await status(t.url);
    check(`${t.name} responds at ${t.url}`, code === 200, 'HTTP ' + code);
  }
}

// ---- riding curriculum (drafts for coach review) ----
const { render: renderRiding } = await import('./build-riding.mjs');
const { LESSONS } = await import('../content/riding/curriculum.mjs');
const { SOURCES: RIDE_SOURCES } = await import('../content/riding/sources.mjs');
const ridingPages = renderRiding();
const staleRiding = Object.entries(ridingPages).filter(([p, html]) => !existsSync(root + p) || read(p) !== html).map(([p]) => p);
check('Riding pages are up to date (node scripts/build-riding.mjs)', staleRiding.length === 0, staleRiding.slice(0, 5).join(', '));
check('Every riding page is noindex and has the draft banner', Object.values(ridingPages).every(h => h.includes('<meta name="robots" content="noindex, nofollow">') && h.includes('class="ride-banner"')));
const siteHtml = ['index.html', 'ski/index.html', 'about.html', 'login.html', 'account.html', 'tool.html', 'college-beyond.html', 'tutoring.html', 'book.html', ...Object.keys(labPages)];
const linksRiding = siteHtml.filter(p => /href="(\.\.\/)*riding\//.test(read(p)));
check('Nothing outside riding/ links to the riding drafts', linksRiding.length === 0, linksRiding.join(', '));
const slugs = LESSONS.map(l => l.slug);
check('Riding lesson slugs and ids are unique', new Set(slugs).size === slugs.length && new Set(LESSONS.map(l => l.id)).size === LESSONS.length);
const badSrc = LESSONS.filter(l => !l.sources.primary.length || [...l.sources.primary, ...l.sources.comparison].some(id => !RIDE_SOURCES[id]));
check('Every riding lesson cites at least one primary source, all in the registry', badSrc.length === 0, badSrc.map(l => l.id).join(', '));
const badNext = LESSONS.filter(l => (l.next || []).some(n => !slugs.includes(n)));
check('Riding "Next" links point at real lessons', badNext.length === 0, badNext.map(l => l.id).join(', '));
const badApproval = LESSONS.filter(l => l.status === 'approved' && !(l.review && l.review.by && l.review.date && (l.risk < 3 || l.review.specialistVerified)));
check('No riding lesson is approved without a named reviewer and date (Class 3: verified specialist)', badApproval.length === 0, badApproval.map(l => l.id).join(', '));
check('Riding lesson statuses are draft, specialist, outline or approved', LESSONS.every(l => ['draft', 'specialist', 'outline', 'approved'].includes(l.status)));
const trickTech = LESSONS.filter(l => l.pathway === 'tricks' && l.status !== 'approved' && (l.model || l.practice || l.status !== 'outline'));
check('Trick lessons stay outlines (no technique or practice) until approved', trickTech.length === 0, trickTech.map(l => l.id).join(', '));
const draftsComplete = LESSONS.filter(l => (l.status === 'draft' || l.status === 'specialist') && !['outcome', 'who', 'prereqs', 'why', 'model', 'errors', 'practice', 'rubric', 'gates', 'specialist'].every(k => l[k] && (!Array.isArray(l[k]) || l[k].length)));
check('Every full riding draft has all the required sections', draftsComplete.length === 0, draftsComplete.map(l => l.id).join(', '));
const curriculumText = read('content/riding/curriculum.mjs');
const settings = curriculumText.match(/\b\d+(\.\d+)?\s*(psi|bar\b|clicks?\b|mm of sag)|\d+\s*%\s*(sag|front|rear)|\b\d+\s*[:/]\s*\d+\s*(front|rear|brake)/gi) || [];
check('No universal pressures, click counts, sag values or brake ratios in the riding content', settings.length === 0, settings.join(', '));

// ---- tutoring & booking ----
const bookingBox = { window: {} };
vm.runInNewContext(read('js/booking-config.js'), bookingBox);
const booking = bookingBox.window.MATHLETE_BOOKING || {};
const subjectIds = (booking.subjects || []).map(x => x.id);
const tutoring = read('tutoring.html');
const book = read('book.html');
const navPages = ['index.html', 'ski/index.html', 'about.html', 'login.html', 'account.html', 'college-beyond.html', 'tutoring.html', 'book.html', 'join.html', 'organization.html'];
const noBook = navPages.filter(p => !/<a class="nav-book[^"]*" href="book\.html"/.test(read(p)))
  .concat(labContent.filter(p => !labPages[p].includes('<a class="nav-book" href="book.html"')));
check('Every page has "Book a Session" in the nav', noBook.length === 0, noBook.join(', '));
check('Booking subjects are math, physics and sat', subjectIds.join() === 'math,physics,sat', subjectIds.join());
const radios = [...book.matchAll(/name="subject" value="([^"]+)"/g)].map(m => m[1]);
check('book.html offers exactly the configured subjects', radios.join() === subjectIds.join(), radios.join());
const subjectLinks = [index, tutoring].flatMap(h => [...h.matchAll(/href="book\.html\?subject=([^"#&]+)"/g)].map(m => m[1]));
check('Every subject Book button names a configured subject', subjectLinks.length >= 6 && subjectLinks.every(id => subjectIds.includes(id)), subjectLinks.join(', '));
const calUrls = [booking.calendlyUrl || ''].concat((booking.subjects || []).map(x => x.calendlyUrl || ''));
check('Calendly links are empty or https://calendly.com/...', calUrls.every(u => u === '' || /^https:\/\/calendly\.com\//.test(u)));
const noComments = h => h.replace(/<!--[\s\S]*?-->/g, '');
check('No prices typed into tutoring.html or book.html (set them in booking-config.js)', ![tutoring, book].some(h => /\$\s?\d/.test(noComments(h))));
check('Homepage links to Private Tutoring and booking', index.includes('href="tutoring.html"') && index.includes('href="book.html"'));
check('Tutoring and booking pages have exactly one <h1> and their own canonical URL', [['tutoring.html', tutoring], ['book.html', book]].every(([p, h]) =>
  (h.match(/<h1\b/g) || []).length === 1 && h.includes(`<link rel="canonical" href="https://www.mathletemtb.com/${p}">`)));
for (const [p, h] of [['index.html', index], ['tutoring.html', tutoring], ['book.html', book], ['about.html', read('about.html')]]) {
  const ids = [...h.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(id => id !== 'main');
  check(`Every in-page link on ${p} has a target`, ids.every(id => h.includes(`id="${id}"`)), ids.filter(id => !h.includes(`id="${id}"`)).join(', '));
}

// ---- College & Beyond page ----
// While it's hidden (redirects to tutoring.html), nothing may link to it.
if (/http-equiv="refresh" content="0; url=tutoring\.html"/.test(read('college-beyond.html'))) {
  const linksCb = siteHtml.filter(p => p !== 'college-beyond.html' && /href="college-beyond\.html/.test(read(p)));
  check('College & Beyond is hidden and nothing links to it', linksCb.length === 0, linksCb.join(', '));
}
const cb = read('college-beyond.html');
// (Skipped while the About page says "coming soon"; it has no Services section then.)
if (!/<h1 class="page-title">Coming soon\.<\/h1>/.test(read('about.html'))) {
  check('About page Services links to the College & Beyond page', /id="services"[\s\S]*href="college-beyond\.html"/.test(read('about.html')));
}
check('College & Beyond page has exactly one <h1>', (cb.match(/<h1\b/g) || []).length === 1);
check('College & Beyond page has its own canonical URL', cb.includes('<link rel="canonical" href="https://www.mathletemtb.com/college-beyond.html">'));
const anchors = [...cb.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(id => id !== 'main');
check('Every in-page link on College & Beyond has a target', anchors.every(id => cb.includes(`id="${id}"`)), anchors.filter(id => !cb.includes(`id="${id}"`)).join(', '));
check('Inquiry form identifies the service', /name="service" value="college-beyond"/.test(cb) && read('js/inquiry.js').includes("service: 'college-beyond'"));
check('No prices published on College & Beyond', !/\$\s?\d/.test(cb.replace(/<!--[\s\S]*?-->/g, '')));
check('No guarantee language on College & Beyond', !/\b(we|I) guarantee|guaranteed (admission|acceptance|results)|get into your dream school|secure admission/i.test(cb));
const sql = read('supabase/setup.sql');
const helpValues = [...cb.matchAll(/name="help_with" value="([^"]+)"/g)].map(m => m[1]);
check('Every "help with" option is allowed by the database', helpValues.length === 8 && helpValues.every(v => sql.includes(`'${v}'`)));
check('Inquiries are insert-only for visitors', /revoke all on public\.inquiries from anon, authenticated;/.test(sql) && !/grant select[^;]*public\.inquiries/i.test(sql));

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
