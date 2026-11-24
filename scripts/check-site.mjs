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

import { readFileSync, existsSync, statSync } from 'node:fs';
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
// Carve Lab: its challenge data lists them (questionKinds()).
const carveKinds = (await import('../learning-lab/carve-lab/logic/challenges.js')).questionKinds().map(k => k.kind);
const bermKinds = (await import('../learning-lab/berm-lab/logic/challenges.js')).questionKinds().map(k => k.kind);
const QUESTION_KINDS = { 'trail-builder': KIND, 'gear-ratio-lab': KIND, 'strava-showdown': KIND, 'jump-lab': jumpLabKinds, 'physics-playground': playgroundKinds, 'carve-lab': () => carveKinds, 'berm-lab': () => bermKinds };
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
  const sql = ['setup', 'progress', 'organizations', 'resources', 'curriculum'].map(f => read(`supabase/${f}.sql`)).join('\n');
  const calls = [...new Set(['js/student.js', 'js/dashboard.js', 'js/my-progress.js', 'js/review.js', 'js/goals.js', 'js/progress.js', 'js/org.js', 'js/auth.js', 'js/organization.js', 'js/join.js', 'js/login.js', 'js/classes.js', 'supabase/functions/invite/index.ts', 'supabase/functions/join/index.ts'].flatMap(f => [...read(f).matchAll(/\.rpc\(([^,)]+)[,)]/g)].flatMap(m => [...m[1].matchAll(/'([a-z]+_[a-z_]+)'/g)].map(x => x[1]))))];
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

// ---- Mission-board labs on the lesson kit's missions.js shell (Algebra 2) ----
// tests: scripts/test-race-day-workshop.mjs, scripts/test-ride-systems-lab.mjs
{
  const LABS = [
    { id: 'race-day-workshop', name: 'Race-Day Workshop', root: '.rdw', css: 'race-day-workshop.css', entry: 'workshop.js', home: 'classes/algebra-2/solving-equations-and-modeling-constraints/index.html', also: 'classes/algebra-2/absolute-value-equations/index.html', final: 'race-day-workshop.final' },
    { id: 'ride-systems-lab', name: 'Ride Systems Lab', root: '.rsl', css: 'ride-systems.css', entry: 'ride-systems.js', home: 'classes/algebra-2/function-notation/index.html', also: 'classes/algebra-2/inverse-functions/index.html', final: 'ride-systems-lab.final' },
    { id: 'bike-park-blueprint-lab', name: 'Bike Park Blueprint Lab', root: '.bpl', css: 'blueprint.css', entry: 'blueprint.js', home: 'classes/algebra-2/systems-of-equations/index.html', also: 'classes/algebra-2/matrix-operations/index.html', final: 'bike-park-blueprint-lab.final' },
    { id: 'trail-dynamics-lab', name: 'Trail Dynamics Lab', root: '.tdl', css: 'trail-dynamics.css', entry: 'trail-dynamics.js', home: 'classes/algebra-2/quadratic-graphs/index.html', also: 'classes/algebra-2/quadratic-formula/index.html', final: 'trail-dynamics-lab.final' },
    { id: 'pump-track-lab', name: 'Pump Track Profile Lab', root: '.ptl', css: 'pump-track.css', entry: 'pump-track.js', home: 'classes/algebra-2/polynomial-graphs/index.html', also: 'classes/algebra-2/remainder-and-factor-theorems/index.html', final: 'pump-track-lab.final' },
    { id: 'enduro-route-lab', name: 'Enduro Route Intelligence Lab', root: '.erl', css: 'enduro-route.css', entry: 'enduro-route.js', home: 'classes/algebra-2/graphing-rational-functions/index.html', also: 'classes/algebra-2/radical-functions/index.html', final: 'enduro-route-lab.final' },
    { id: 'suspension-systems-lab', name: 'Suspension & Systems Lab', root: '.ssl', css: 'suspension.css', entry: 'suspension.js', home: 'classes/algebra-2/exponential-growth-and-decay/index.html', also: 'classes/algebra-2/logarithms/index.html', final: 'suspension-systems-lab.final' },
    { id: 'race-intelligence-lab', name: 'Enduro Race Intelligence Lab', root: '.ril', css: 'race-intelligence.css', entry: 'race-intelligence.js', home: 'classes/algebra-2/statistical-analysis/index.html', also: 'classes/algebra-2/conditional-probability/index.html', final: 'race-intelligence-lab.final' }
  ];
  const cur = read('supabase/curriculum.sql'), rw = read('supabase/rewards.sql');
  for (const Lb of LABS) {
    const dir = 'learning-lab/' + Lb.id + '/', html = read(dir + 'index.html');
    const css = read(dir + 'styles/' + Lb.css).replace(/\/\*[\s\S]*?\*\//g, '');
    const flat = css.replace(/@media[^{]*\{([\s\S]*?\})\s*\}/g, '$1');
    const leaking = flat.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@') && !/^(from|to|\d+%)$/.test(sel)).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith(Lb.root));
    check(`${Lb.name} styles are all scoped under ${Lb.root}, braces balanced`, leaking.length === 0 && (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length, leaking.slice(0, 5).join(' | '));
    const js = execSync(`find ${root + dir} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
    const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
    check(`${Lb.name} module doesn’t depend on the site (only its page connects it)`, coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
    check(`${Lb.name} page loads progress tracking in order, then the kit and mission-shell styles, then its own, then the module`, ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])) && html.indexOf('lesson-kit.css') > 0 && html.indexOf('lesson-kit.css') < html.indexOf('lesson-kit/missions.css') && html.indexOf('lesson-kit/missions.css') < html.indexOf('styles/' + Lb.css));
    check(`${Lb.name} runs on the shared mission shell`, read(dir + Lb.entry).includes("from '../lesson-kit/missions.js'"));
    // Every mission's practice config must be one the shell understands
    // (true or a list of ids → the lab's set; an object with ids + questions → its own).
    const { LAB } = await import('../' + dir + Lb.entry);
    const badPractice = LAB.missions.filter(m => m.practice !== undefined && !((m.practice === true || Array.isArray(m.practice)) ? LAB.practice && Array.isArray(LAB.practice.ids) && typeof LAB.practice.questions === 'function' : m.practice && Array.isArray(m.practice.ids) && typeof m.practice.questions === 'function' && m.practice.count > 0)).map(m => m.id);
    check(`${Lb.name} practice sets are wired the way the shell expects`, badPractice.length === 0, badPractice.join(', '));
    const unsafe = js.filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
    check(`${Lb.name} never builds HTML from strings`, unsafe.length === 0, unsafe.join(', '));
    const { questionKinds } = await import('../' + dir + 'logic/questions.js');
    const kinds = Object.keys(questionKinds()).map(k => Lb.id + ':' + k).sort();
    const sqlKinds = [...new Set([...cur.matchAll(new RegExp(`\\('(${Lb.id}:[a-z0-9-]+)', '${Lb.id}'`, 'g'))].map(m => m[1]))].sort();
    check(`${Lb.name} question kinds are registered in supabase/curriculum.sql (${kinds.length})`, kinds.length > 0 && kinds.join() === sqlKinds.join(), `lab: ${kinds.length} | sql: ${sqlKinds.length}`);
    check(`${Lb.name} is linked from its Algebra 2 home topic and a related one`, read(Lb.home).includes(`href="learning-lab/${Lb.id}/?from=`) && read(Lb.also).includes(`learning-lab/${Lb.id}/`));
    check(`${Lb.name} earns lab XP on certification, and its final counts as an assessment`, new RegExp(`\\('${Lb.id}',\\s+'${Lb.name}',\\s+'lab',\\s+'alg2',\\s+'session'`).test(rw) && rw.includes(`('${Lb.final}', '${Lb.id}'`));
  }
  check('Race-Day Workshop names the sag window’s source and says it isn’t setup advice', read('learning-lab/race-day-workshop/workshop.js').includes('tech.ridefox.com') && /not a setup recommendation/.test(read('learning-lab/race-day-workshop/workshop.js')));
  check('Bike Park Blueprint Lab says its resources and prices are fictional', /fictional planning numbers/.test(read('learning-lab/bike-park-blueprint-lab/blueprint.js')));
  check('Trail Dynamics Lab says its braking model is simplified and not riding advice', /not riding advice/.test(read('learning-lab/trail-dynamics-lab/components/labs.js')) && /not a riding recommendation/.test(read('learning-lab/trail-dynamics-lab/trail-dynamics.js')));
  check('Pump Track Profile Lab says its curves are simplified profiles, not track designs', /not a pump track design or construction specification/.test(read('learning-lab/pump-track-lab/pump-track.js')) && /not a pump track design or construction specification/.test(read('learning-lab/pump-track-lab/components/labs.js')) && /not a pump track design or construction specification/.test(read('learning-lab/pump-track-lab/logic/models.js')));
  check('Enduro Route Intelligence Lab says its models are fictional, not race, trail or fit advice', /not race-pacing, trail-construction or bike-fit advice/.test(read('learning-lab/enduro-route-lab/enduro-route.js')) && /not race, trail-construction or bike-fit advice/.test(read('learning-lab/enduro-route-lab/logic/models.js')) && /not a tire clearance or frame-fit recommendation/.test(read('learning-lab/enduro-route-lab/components/labs.js')));
  check('Polynomial algebra lives once, in the kit (lesson-kit/poly.js); both labs use it', read('learning-lab/enduro-route-lab/logic/rational.js').includes("from '../../lesson-kit/poly.js'") && read('learning-lab/pump-track-lab/logic/poly.js').includes("from '../../lesson-kit/poly.js'") && !/function longDivide/.test(read('learning-lab/pump-track-lab/logic/poly.js')));
  check('Suspension & Systems Lab says its models are simplified: an envelope not a shock, fictional growth, not a noise-safety assessment', (t => /not a complete model of a real shock/.test(t) && /not a forecast/.test(t) && /not a safety assessment/.test(t))(read('learning-lab/suspension-systems-lab/suspension.js')) && /not suspension settings/.test(read('learning-lab/suspension-systems-lab/components/labs.js')) && /isn’t a safety assessment/.test(read('learning-lab/suspension-systems-lab/components/labs.js')));
  check('Enduro Race Intelligence Lab labels its data simulated, says association isn’t causation, and computes (never hardcodes) its p-values', (t => /simulated for teaching/.test(t) && /not proof of causation/.test(t))(read('learning-lab/race-intelligence-lab/race-intelligence.js')) && /SIMULATED/.test(read('learning-lab/race-intelligence-lab/logic/models.js')) && /permutationTest\(/.test(read('learning-lab/race-intelligence-lab/logic/questions.js')) && !/0\.0033|0\.00348/.test(read('learning-lab/race-intelligence-lab/logic/questions.js') + read('learning-lab/race-intelligence-lab/race-intelligence.js') + read('learning-lab/race-intelligence-lab/components/labs.js')));
  check('Exact fractions live once, in the kit (lesson-kit/frac.js)', read('learning-lab/bike-park-blueprint-lab/logic/matrix.js').includes("from '../../lesson-kit/frac.js'") && read('learning-lab/trail-dynamics-lab/logic/quadratic.js').includes("from '../../lesson-kit/frac.js'") && read('learning-lab/lesson-kit/poly.js').includes("from './frac.js'") && !/class Frac/.test(read('learning-lab/bike-park-blueprint-lab/logic/matrix.js')));
  check('The kit’s plotter is shared, not copied (no lab keeps its own plot.js)', !existsSync(root + 'learning-lab/ride-systems-lab/components/plot.js') && !existsSync(root + 'learning-lab/bike-park-blueprint-lab/components/plot.js'));
  check('Ride Systems Lab says its trail data is simulated and its drivetrain idealized', /simulated, not surveyed/.test(read('learning-lab/ride-systems-lab/ride-systems.js')) && /idealized/.test(read('learning-lab/ride-systems-lab/components/labs.js')));
}

// ---- Carve Lab (Mathlete Ski; standalone module; tests: scripts/test-carve-lab.mjs) ----
{
  const dir = 'learning-lab/carve-lab/';
  const html = read(dir + 'index.html');
  const css = read(dir + 'styles/carve-lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const leaking = css.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@') && !/^(from|to|\d+%)$/.test(sel)).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith('.clab'));
  check('Carve Lab styles are all scoped under .clab', leaking.length === 0, leaking.slice(0, 5).join(' | '));
  const js = execSync(`find ${root + dir} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
  check('Carve Lab module doesn’t depend on the site (only its page connects it)', coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
  check('Carve Lab page loads progress tracking in order, then the module', ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])));
  const unsafe = js.filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
  check('Carve Lab never builds HTML from strings', unsafe.length === 0, unsafe.join(', '));
  // Every graded question kind is registered for progress saving, and nothing extra.
  const { questionKinds } = await import('../' + dir + 'logic/challenges.js');
  const kinds = questionKinds().map(k => 'carve-lab:' + k.kind).sort();
  const sqlKinds = [...new Set([...read('supabase/progress.sql').matchAll(/\('(carve-lab:[a-z0-9-]+)',\s*'carve-lab'/g)].map(m => m[1]))].sort();
  check(`Carve Lab question kinds match supabase/progress.sql (${kinds.length})`, kinds.length > 0 && kinds.join() === sqlKinds.join(), `lab: ${kinds.join(' ')} | sql: ${sqlKinds.join(' ')}`);
  const t = tools.find(x => x.id === 'carve-lab');
  check('Carve Lab is a live public tool in Mathlete Ski → Tuning Bench, with its card image', !!t && t.status === 'live' && t.access === 'public' && t.category === 'tuning-bench' && existsSync(root + t.image) && t.url.endsWith('/learning-lab/carve-lab/'));
  check('Carve Lab is listed on the Ski home and the Tuning Bench page', read('ski/index.html').includes('learning-lab/carve-lab/') && read('ski/tuning-bench/index.html').includes('learning-lab/carve-lab/'));
}

// ---- Berm Lab (Mathlete MTB; standalone module; tests: scripts/test-berm-lab.mjs) ----
{
  const dir = 'learning-lab/berm-lab/';
  const html = read(dir + 'index.html');
  const css = read(dir + 'styles/berm-lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const leaking = css.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@') && !/^(from|to|\d+%)$/.test(sel)).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith('.blab'));
  check('Berm Lab styles are all scoped under .blab', leaking.length === 0, leaking.slice(0, 5).join(' | '));
  const js = execSync(`find ${root + dir} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
  check('Berm Lab module doesn’t depend on the site (only its page connects it)', coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
  check('Berm Lab page loads progress tracking in order, then the module', ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])));
  const unsafe = js.filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
  check('Berm Lab never builds HTML from strings', unsafe.length === 0, unsafe.join(', '));
  // Every graded question kind is registered for progress saving, and nothing extra.
  const { questionKinds } = await import('../' + dir + 'logic/challenges.js');
  const kinds = questionKinds().map(k => 'berm-lab:' + k.kind).sort();
  const sqlKinds = [...new Set([...read('supabase/progress.sql').matchAll(/\('(berm-lab:[a-z0-9-]+)',\s*'berm-lab'/g)].map(m => m[1]))].sort();
  check(`Berm Lab question kinds match supabase/progress.sql (${kinds.length})`, kinds.length > 0 && kinds.join() === sqlKinds.join(), `lab: ${kinds.join(' ')} | sql: ${sqlKinds.join(' ')}`);
  const t = tools.find(x => x.id === 'berm-lab');
  check('Berm Lab is a live public tool in The Lab → Engineering Lab, with its card image', !!t && t.status === 'live' && t.access === 'public' && t.category === 'engineering' && existsSync(root + t.image) && t.url.endsWith('/learning-lab/berm-lab/'));
  check('Berm Lab is listed on the Lab home and the Engineering Lab page, and its placeholder is gone', read('index.html').includes('learning-lab/berm-lab/') && read('learning-lab/engineering/index.html').includes('learning-lab/berm-lab/') && !read('js/lab-categories.js').includes("'Berm Lab'"));
}

// ---- Home page photo carousel (js/gallery-config.js, js/carousel.js; PRDs/photoCarousel.md) ----
{
  const box = { window: {} };
  vm.runInNewContext(read('js/gallery-config.js'), box);
  const G = box.window.MATHLETE_GALLERY || [];
  const home = read('index.html');
  check('Gallery: at least two photos, each with alt text, all in assets/gallery/', G.length >= 2 && G.every(p => p.alt && p.alt.length > 10 && /^assets\/gallery\/[a-z0-9-]+\.jpe?g$/.test(p.src) && existsSync(root + p.src)), G.map(p => p.src).join(', '));
  check('Gallery photos are web-sized (under 400 KB)', G.every(p => statSync(root + p.src).size < 400 * 1024));
  // Walk the JPEG's header segments (up to the image data) for an EXIF/XMP block;
  // searching the raw bytes can match "GPS" by chance inside the compressed image.
  const hasMeta = (b) => {
    for (let i = 2; i + 4 <= b.length && b[i] === 0xFF;) {
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m === 0xDA) return false;
      if (m === 0xE1 && /^(Exif|http:\/\/ns\.adobe)/.test(b.subarray(i + 4, i + 4 + 32).toString('latin1'))) return true;
      i += 2 + len;
    }
    return false;
  };
  const gps = G.filter(p => hasMeta(readFileSync(root + p.src))).map(p => p.src);
  check('Gallery photos carry no EXIF/GPS metadata (location stripped)', gps.length === 0, gps.join(', '));
  const firstImg = (home.match(/class="carousel-slide[^"]*"><img src="([^"]+)" alt="([^"]+)"/) || []);
  check('Home page: the carousel sits beside the logo, its first photo matches the gallery', /class="hero-brand">\s*<h1 class="lab-home-title">/.test(home) && firstImg[1] === G[0].src && firstImg[2] === G[0].alt);
  check('Home page loads the gallery list before the carousel script, and the carousel styles', home.indexOf('src="js/gallery-config.js') > 0 && home.indexOf('src="js/gallery-config.js') < home.indexOf('src="js/carousel.js') && home.includes('css/carousel.css'));
  check('Carousel builds DOM safely and respects reduced motion', !/innerHTML|insertAdjacentHTML|document\.write/.test(read('js/carousel.js')) && read('js/carousel.js').includes('prefers-reduced-motion'));
}

// ---- Physics lessons (learning-lab/lesson-kit/ + one folder per lesson) ----
// tests: scripts/test-newtons-laws.mjs, scripts/test-intro-to-physics.mjs
{
  const scoped = f => { const css = read(f).replace(/\/\*[\s\S]*?\*\//g, '');
    const flat = css.replace(/@media[^{]*\{([\s\S]*?\})\s*\}/g, '$1');
    return { ok: (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length,
      leaking: flat.split('}').map(r => r.split('{')[0].trim()).filter(sel => sel && !sel.startsWith('@') && !/^(from|to|\d+%)$/.test(sel)).flatMap(sel => sel.split(',').map(x => x.trim())).filter(x => x && !x.startsWith('.lsn')) }; };
  const jsIn = d => execSync(`find ${root + d} -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  const kitCss = scoped('learning-lab/lesson-kit/lesson-kit.css');
  check('Lesson kit styles are all scoped under .lsn, braces balanced', kitCss.ok && kitCss.leaking.length === 0, kitCss.leaking.slice(0, 5).join(' | '));
  const msCss = scoped('learning-lab/lesson-kit/missions.css');
  check('Lesson kit mission-board styles (missions.css) are all scoped under .lsn, braces balanced', msCss.ok && msCss.leaking.length === 0, msCss.leaking.slice(0, 5).join(' | '));
  const kitJs = jsIn('learning-lab/lesson-kit/');
  const kitCoupled = kitJs.filter(f => /MathleteProgress|MathleteAuth|supabase|tools-config|newtons-laws|intro-to-physics|race-day-workshop|ride-systems|bike-park|trail-dynamics|pump-track|enduro-route|suspension-systems|race-intelligence/.test(readFileSync(f, 'utf8')));
  check('Lesson kit doesn’t depend on the site or on any one lesson', kitCoupled.length === 0, kitCoupled.join(', '));
  const curriculumSql = read('supabase/curriculum.sql');
  const LESSONS = [
    { id: 'newtons-laws', name: 'Newton’s Laws lesson', css: 'newtons-laws.css', mod: 'classes/trail-physics/newtons-laws/index.html', broad: 'forces-motion' },
    { id: 'intro-to-physics', name: 'Intro to Physics lesson', css: 'intro-to-physics.css', mod: 'classes/trail-physics/introduction-to-physics/index.html', broad: 'physics' }
  ];
  for (const Ls of LESSONS) {
    const dir = 'learning-lab/' + Ls.id + '/', html = read(dir + 'index.html');
    const css = scoped(dir + 'styles/' + Ls.css);
    check(`${Ls.name} styles are all scoped under .lsn, braces balanced`, css.ok && css.leaking.length === 0, css.leaking.slice(0, 5).join(' | '));
    const js = jsIn(dir);
    const coupled = js.filter(f => !f.endsWith('/main.js') && /MathleteProgress|MathleteAuth|supabase|tools-config/.test(readFileSync(f, 'utf8')));
    check(`${Ls.name} module doesn’t depend on the site (only its page connects it)`, coupled.length === 0 && !/site\.css|site-nav|site\.js/.test(html), coupled.join(', '));
    check(`${Ls.name} page loads progress tracking in order, then the kit styles, then the module`, ['js/supabase-config.js', 'js/auth.js', 'js/progress.js', 'src="main.js'].map(x => html.indexOf(x)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])) && html.indexOf('lesson-kit.css') > 0 && html.indexOf('lesson-kit.css') < html.indexOf('styles/' + Ls.css));
    const unsafe = [...js, ...kitJs].filter(f => /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(/.test(readFileSync(f, 'utf8')));
    check(`${Ls.name} never builds HTML from strings`, unsafe.length === 0, unsafe.join(', '));
    const { questionKinds } = await import('../' + dir + 'logic/lesson.js');
    const kinds = Object.keys(questionKinds()).map(k => Ls.id + ':' + k).sort();
    const sqlKinds = [...new Set([...curriculumSql.matchAll(new RegExp(`\\('(${Ls.id}:[a-z0-9-]+)', '${Ls.id}'`, 'g'))].map(m => m[1]))].sort();
    check(`${Ls.name} question kinds are registered in supabase/curriculum.sql (${kinds.length})`, kinds.length > 0 && kinds.join() === sqlKinds.join(), `lesson: ${kinds.length} | sql: ${sqlKinds.length}`);
    check(`${Ls.name} kinds are filed under ${Ls.broad}, not algebra`, new RegExp(`\\('${Ls.id}:kc-1', '${Ls.broad}'\\)`).test(curriculumSql) && !new RegExp(`\\('${Ls.id}:[a-z0-9-]+', 'algebra'\\)`).test(curriculumSql));
    const mod = read(Ls.mod);
    check(`${Ls.name}: its module page links the lesson and says it’s in review (not yet published)`, mod.includes(`href="learning-lab/${Ls.id}/?from=`) && mod.includes('Lesson in review') && !mod.includes('Lesson available'));
  }
  // The intro lesson's branch map links the labs that are live; keep it in step with the lab library.
  const { LIVE } = await import('../learning-lab/intro-to-physics/logic/lesson.js');
  const { LABS } = await import('../content/classes/physics.mjs');
  const liveLabs = LABS.filter(l => l.activity && l.flagship).map(l => l.id).sort();
  check('Intro to Physics branch map links exactly the live flagship labs', Object.keys(LIVE).sort().join() === liveLabs.join(), `lesson: ${Object.keys(LIVE).sort().join()} | library: ${liveLabs.join()}`);
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
  const mathCourses = model.courses.filter(c => !c.pathway);
  check('Classes: Algebra 1, Algebra 2, Geometry and Precalculus, 9 units each, every topic with skills',
    mathCourses.map(c => c.name).join() === 'Algebra 1,Algebra 2,Geometry,Precalculus' && mathCourses.every(c => c.units.length === 9) && model.topics.every(t => t.skills.length >= 2));

  // Physics (content/classes/physics.mjs, PRDs/collegePhysics.md)
  const P = model.pathway, pMods = P.courses.flatMap(c => c.units.flatMap(u => u.topics));
  check('Physics: Trail Physics (6 units, 17 modules) and Trail Technology (3 units, 11 modules), units numbered 1–9',
    P.courses.map(c => `${c.name}:${c.units.length}:${c.units.reduce((n, u) => n + u.topics.length, 0)}`).join() === 'Trail Physics:6:17,Trail Technology:3:11' &&
    P.courses.flatMap(c => c.units.map(u => u.number)).join() === '1,2,3,4,5,6,7,8,9');
  check('Physics: every module has a hook, concepts, a status, a category, a lab and at least 3 objectives',
    pMods.every(t => t.hook && t.concepts.length && t.status && t.category && t.labs.length && t.skills.length >= 3));
  check('Physics: the PRD’s 23 flagship labs are in the lab library, each used by a module', P.labs.filter(l => l.flagship).length === 23 && P.labs.every(l => l.modules.length));
  const pathPage = read(P.href + 'index.html');
  check('Physics page links to every module', pMods.every(t => pathPage.includes(`href="${t.href}"`)));
  const overclaim = pMods.filter(t => t.status !== 'published' && /Lesson available/.test(read(t.href + 'index.html'))).map(t => t.id);
  check('Physics modules only say “Lesson available” once published', overclaim.length === 0 && pMods.every(t => t.status === 'published' || pathPage.includes(`data-topic="${t.id}"`)), overclaim.join(', '));
  const unnoted = pMods.filter(t => t.note && !read(t.href + 'index.html').includes('About the model:')).map(t => t.id);
  check('Physics modules state their model’s assumptions where they have them', unnoted.length === 0, unnoted.join(', '));
  check('Physics content roadmap is generated (docs/PHYSICS-ROADMAP.md)', read('docs/PHYSICS-ROADMAP.md').includes('| ' + pMods[0].course.name + ' 1 |'));
  // Lab tools used in courses: every linked kind must be registered in progress.sql for that game.
  const progressSql = read('supabase/progress.sql');
  const toolActs = ACTIVITIES.filter(a => a.tool && a.status === 'live');
  const badKinds = toolActs.flatMap(a => Object.keys(a.tracking.questions).filter(k => !new RegExp(`\\('${a.tracking.gameId}:${k}',\\s*'${a.tracking.gameId}'`).test(progressSql)).map(k => a.id + ':' + k));
  check('Physics labs: every question kind linked to a skill is registered in supabase/progress.sql', toolActs.length >= 3 && badKinds.length === 0, badKinds.join(', '));
  const bermAll = [...progressSql.matchAll(/\('berm-lab:([a-z0-9-]+)', 'berm-lab'/g)].map(m => m[1]);
  const bermMap = toolActs.find(a => a.id === 'berm-lab').tracking.questions;
  check('Berm Lab: all its question kinds count toward Trail Physics skills', bermAll.length === 19 && bermAll.every(k => bermMap[k]));
  check('Lab tools in courses don’t re-register their question kinds in curriculum.sql', !/\('(jump-lab|berm-lab|gear-ratio-lab):[a-z0-9-]+', '(jump-lab|berm-lab|gear-ratio-lab)', /.test(read('supabase/curriculum.sql')));
  check('Classes progress returns recent first tries (module mastery can improve)', /'recent_ok', x\.recent_ok/.test(read('supabase/curriculum.sql')) && read('js/classes.js').includes('recent_ok'));
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
  // Resource catalog and entitlements (Step 3)
  const sqlR = read('supabase/resources.sql');
  let catalogFresh = true;
  try { execSync('node scripts/build-catalog.mjs --check', { cwd: root, stdio: 'pipe' }); } catch { catalogFresh = false; }
  check('supabase/catalog.sql and js/course-topics.js are up to date (node scripts/build-catalog.mjs)', catalogFresh);
  const catalogSqlText = read('supabase/catalog.sql');
  const progressGames = [...new Set([...read('supabase/progress.sql').matchAll(/\('([a-z0-9-]+):[a-z0-9-]+',\s*'\1'/g)].map(m => m[1]))];
  const privateIds = tools.filter(t => t.access === 'private').map(t => t.id);
  const unmapped = progressGames.filter(g => !privateIds.includes(g) && !new RegExp(`array\\[[^\\]]*'${g}'[^\\]]*\\]::text\\[\\]`).test(catalogSqlText));
  check(`Every game that saves progress is in the catalog, so schools' settings apply to it (${progressGames.length} games)`, progressGames.length >= 5 && unmapped.length === 0, unmapped.join(', '));
  check('record_attempt checks the school has the activity switched on (org_game_allowed)', /org_game_allowed\(v_org, p_game_id\)/.test(read('supabase/progress.sql')));
  check('Schools can only switch on what their licence includes (set_resource_enabled checks org_entitled)', /if not public\.org_entitled\(p_org, p_resource\) then\s+raise sqlstate 'PT403'/.test(sqlR));
  check('Resource tables are read-only from the browser (no insert/update/delete grants)', !/grant (insert|update|delete|all)[^;]*on public\.(resources|plan_resources|organization_entitlements|organization_resource_settings|organization_collections)/i.test(sqlR));
  check('Every resource role check treats "no role" as a refusal', !/public\.org_role\([a-z_]+\) in \(/.test(sqlR));
  check('Logos: images only (no SVG), only into the organization’s own folder', /allowed_mime_types = array\['image\/png', 'image\/jpeg', 'image\/webp'\]/.test(sqlR) && /public\.org_manages_branding_path\(name\)/.test(sqlR) && !/svg\)\$/.test(sqlR));
  check('The student view and the admin preview are drawn by the same code (MathleteOrg.drawSchool)', /MathleteOrg\.drawSchool\(frame/.test(read('js/organization.js')) && /drawSchool\(wrap, view\)/.test(read('js/org.js')));
  check('Dashboard and organization page load course outlines and org.js', ['dashboard.html', 'organization.html'].every(p => { const h = read(p); return h.includes('src="js/course-topics.js') && h.indexOf('src="js/org.js') > h.indexOf('src="js/course-topics.js'); }));
  check('Run order is documented: setup → progress → organizations → curriculum', /AFTER\s+setup\.sql and progress\.sql \(and before curriculum\.sql\)/.test(sqlO.replace(/--\s*/g, '')));
}

// ---- home pages (the Lab, and Mathlete Ski) ----
const index = read('index.html');
// Each sport's tools are on its own home page (MTB: index.html, Ski: ski/index.html).
const cards = ['index.html', 'ski/index.html'].flatMap(f => [...read(f).matchAll(/<article\b[^>]*\bdata-lab-tool="([^"]+)"/g)].map(m => m[1]));
const liveIds = tools.filter(t => t.status === 'live').map(t => t.id);
check('Every live tool has a card on its sport’s home page', liveIds.every(id => cards.includes(id)), liveIds.filter(id => !cards.includes(id)).join(', '));
check('Every card on the home pages is a live tool in the config', cards.every(id => liveIds.includes(id)), cards.filter(id => !liveIds.includes(id)).join(', '));
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
// ---- About page (PRDs/aboutpage.md) ----
const about = read('about.html');
check('About page has exactly one <h1>, its canonical URL, and is indexable',
  (about.match(/<h1\b/g) || []).length === 1 &&
  about.includes('<link rel="canonical" href="https://www.mathletemtb.com/about.html">') &&
  !/name="robots" content="noindex/.test(about));
check('About page has Open Graph title, description and image',
  ['og:title', 'og:description', 'og:image'].every(k => about.includes(`property="${k}"`)));
const aboutIcons = [...about.matchAll(/<use href="#([^"]+)"/g)].map(m => m[1]);
check('Every About page icon has a symbol', aboutIcons.every(id => about.includes(`<symbol id="${id}"`)), aboutIcons.filter(id => !about.includes(`<symbol id="${id}"`)).join(', '));
const aboutImgs = [...about.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);
check('Every About page image exists', aboutImgs.every(src => existsSync(root + src)), aboutImgs.filter(src => !existsSync(root + src)).join(', '));
const aboutLinks = [...about.matchAll(/href="([^"#:?]+\/?)(?:#[^"]*)?"/g)].map(m => m[1]).filter(h => !h.startsWith('http') && !h.startsWith('css/'));
const deadAbout = aboutLinks.filter(h => !existsSync(root + (h.endsWith('/') ? h + 'index.html' : h)));
check('Every internal link on the About page points at a real page', deadAbout.length === 0, deadAbout.join(', '));
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

// ---- tutoring team (generated from content/tutors/ by scripts/build-tutors.mjs) ----
{
  const { loadTutors, render: renderTutors } = await import('./build-tutors.mjs');
  const model = loadTutors();
  check('Tutor content has no problems (content/tutors/)', model.errors.length === 0, model.errors.slice(0, 5).join('; '));
  if (!model.errors.length) {
    const want = renderTutors();
    const stale = Object.entries(want).filter(([p, h]) => !existsSync(root + p) || read(p) !== h).map(([p]) => p);
    check('Tutor pages are up to date (node scripts/build-tutors.mjs)', stale.length === 0, stale.join(', '));
    const unpublished = model.all.filter(t => !t.published && existsSync(root + `tutors/${t.slug}/index.html`)).map(t => t.slug);
    check('Unpublished tutors have no profile page', unpublished.length === 0, unpublished.join(', '));
    check('At least one published tutor, and every one has a profile', model.tutors.length > 0 && model.tutors.every(t => existsSync(root + `tutors/${t.slug}/index.html`)));
    const titles = model.tutors.map(t => (read(`tutors/${t.slug}/index.html`).match(/<title>([^<]*)<\/title>/) || [])[1]);
    check('Every tutor profile has its own title', new Set(titles).size === titles.length && titles.every(Boolean));
    const inq = read('tutors/inquire/index.html');
    check('Inquiry form lists every published tutor', model.tutors.every(t => inq.includes(`<option value="${t.slug}">`)));
    check('Every profile links to the inquiry form with that tutor chosen', model.tutors.every(t => read(`tutors/${t.slug}/index.html`).includes(`tutors/inquire/?tutor=${t.slug}`)));
  }
  const tsql = read('supabase/tutoring.sql');
  const inq = read('tutors/inquire/index.html');
  const levelVals = [...inq.matchAll(/<select[^>]*name="student_level"[\s\S]*?<\/select>/g)].flatMap(m => [...m[0].matchAll(/value="([^"]+)"/g)].map(x => x[1]));
  check('Every inquiry level is allowed by the database', levelVals.length > 0 && levelVals.every(v => tsql.includes(`'${v}'`)));
  const fmtVals = [...inq.matchAll(/name="format" value="([^"]+)"/g)].map(m => m[1]);
  check('Every inquiry format is allowed by the database', fmtVals.length > 0 && fmtVals.every(v => tsql.includes(`'${v}'`)));
  check('Tutoring inquiries are insert-only for visitors', /revoke all on public\.tutoring_inquiries from anon, authenticated;/.test(tsql) && !/grant select[^;]*public\.tutoring_inquiries/i.test(tsql));
  check('Tutor pages never build HTML from strings', !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(read('js/tutors.js')));
}

// ---- Resources library (scripts/build-resources.mjs, supabase/library.sql) ----
{
  const { render: renderResources } = await import('./build-resources.mjs');
  const want = renderResources();
  const stale = Object.entries(want).filter(([p, h]) => !existsSync(root + p) || read(p) !== h).map(([p]) => p);
  check('Resources pages are up to date (node scripts/build-resources.mjs)', stale.length === 0, stale.join(', '));
  const lsql = read('supabase/library.sql');
  check('Library tables are read-only to the browser (changes only through checked functions)',
    /revoke all on public\.library_items from anon, authenticated;/.test(lsql) && /revoke all on public\.library_categories from anon, authenticated;/.test(lsql)
    && !/grant (insert|update|delete|all)[^;]*on public\.library_/i.test(lsql));
  const mimes = (lsql.match(/allowed_mime_types\)\s*values[\s\S]*?array\[([\s\S]*?)\]\)/) || [])[1] || '';
  check('Library bucket is private and refuses HTML, SVG and scripts', /\('library', 'library', false/.test(lsql) && mimes.length > 0 && !/html|svg|javascript|octet-stream|x-ms/.test(mimes));
  check('Library pages never build HTML from strings', ['js/library-common.js', 'js/library.js', 'js/library-manage.js'].every(f => !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(read(f))));
  const common = read('js/library-common.js');
  check('Video embeds are built from YouTube/Vimeo ids only', common.includes("'https://www.youtube-nocookie.com/embed/' + id") && common.includes("'https://player.vimeo.com/video/' + id"));
  let htmlFiles = [];
  try { htmlFiles = execSync("git ls-files --cached --others --exclude-standard '*.html'", { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean); } catch {}
  const navPages = htmlFiles.filter(f => existsSync(root + f) && read(f).includes('class="nav-links"'));
  const noLink = navPages.filter(f => !read(f).includes('<li><a href="resources/"'));
  check('Every page’s main menu links to Resources', noLink.length === 0, noLink.slice(0, 5).join(', '));
}

// ---- Teacher Curriculum (scripts/build-teacher-curriculum.mjs, supabase/teacher-curriculum.sql) ----
{
  const { render: renderTC, buildModel } = await import('./build-teacher-curriculum.mjs');
  const { CURRENT_QUARTER, TOOLS } = await import('../content/teacher-curriculum/quarters.mjs');
  const model = await buildModel();
  check('Teacher Curriculum: every unit in exactly one quarter, every lesson complete (PRD section 8)', model.errors.length === 0, model.errors.slice(0, 5).join('; '));
  if (!model.errors.length) {
    const { pages, bundle } = await renderTC();
    const stale = Object.entries(pages).filter(([p, h]) => !existsSync(root + p) || read(p) !== h).map(([p]) => p);
    check('Teacher Curriculum pages and lessons.json are up to date (node scripts/build-teacher-curriculum.mjs)', stale.length === 0, stale.slice(0, 5).join(', '));
    check('Teacher Curriculum: Algebra 1, Geometry, Algebra 2 and Precalculus, four quarters each',
      model.courses.map(c => c.name).join() === 'Algebra 1,Geometry,Algebra 2,Precalculus' && model.courses.every(c => c.quarters.length === 4));
    const cur = model.courses.flatMap(c => c.quarters.filter(q => q.n === CURRENT_QUARTER).flatMap(q => q.units.flatMap(u => u.topics)));
    const missing = cur.filter(t => !t.lesson || t.lesson.status !== 'published').map(t => t.id);
    check(`Every topic in the current quarter (${CURRENT_QUARTER}) has a published lesson plan`, missing.length === 0, `${missing.length} missing: ${missing.slice(0, 6).join(', ')}`);
    const lessons = model.courses.flatMap(c => c.quarters.flatMap(q => q.units.flatMap(u => u.topics.filter(t => t.lesson))));
    const live = (() => { const box = { window: {} }; vm.runInNewContext(read('js/tools-config.js'), box); return box.window.MATHLETE_TOOLS || []; })();
    const badTools = Object.entries(TOOLS).filter(([id, t]) => !existsSync(root + t.route + 'index.html')
      || (live.some(x => x.id === id) && !live.some(x => x.id === id && x.access === 'public' && x.status === 'live'))).map(([id]) => id);
    check('Every tool a lesson can launch is a live, public page in this repo', badTools.length === 0, badTools.join(', '));
    const pub = JSON.parse(read('content/teacher-curriculum/lessons.json'));
    const leakKeys = pub.filter(l => ['stages', 'guided', 'practice', 'exit', 'resources', 'foundation'].some(k => k in l) || (l.activity && ('answers' in l.activity || 'teacher' in l.activity)));
    check('lessons.json (public) holds no teaching plan, practice, answers or teacher notes', leakKeys.length === 0, leakKeys.map(l => l.id).join(', '));
    if (bundle.length) {
      // The answers themselves must never be in a public page.
      const leaks = [];
      for (const b of bundle) {
        const L = b.content, secrets = [...L.exit.map(x => x.why), ...L.resources.misconceptions.map(m => m[1]), ...L.stages.map(s => s.teach), ...L.activity.answers];
        for (const sec of secrets) if (sec.length > 30 && Object.values(pages).some(h => h.includes(sec.slice(0, 30).replace(/&/g, '&amp;')))) leaks.push(b.id);
      }
      check('No teacher-only text (answers, teaching plan, misconceptions) appears in any public page', leaks.length === 0, [...new Set(leaks)].join(', '));
    }
    check('Lesson plans link only to lesson pages that exist (prev/next, breadcrumbs)', lessons.every(t => existsSync(root + t.lesson.href + 'index.html')));
  }
  const tsql = read('supabase/teacher-curriculum.sql');
  check('Lesson plans are readable only through teacher_lesson(), never the table',
    /alter table public\.teacher_lessons enable row level security;/.test(tsql) && /revoke all on public\.teacher_lessons from anon, authenticated;/.test(tsql)
    && !/grant [^;]*on public\.teacher_lessons/i.test(tsql) && !/create policy[^;]*teacher_lessons/i.test(tsql) && /if not public\.is_teacher\(\) then return/.test(tsql));
  const tcJs = execSync(`find ${root}js/teacher-curriculum -name '*.js'`, { encoding: 'utf8' }).trim().split('\n');
  check('Teacher Curriculum scripts never build HTML from strings', tcJs.every(f => !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|eval\(|new Function/.test(readFileSync(f, 'utf8'))));
  check('Lesson sources (with answer keys) are git-ignored', read('.gitignore').split('\n').includes('private-content/'));
  let tracked = '';
  try { tracked = execSync('git ls-files private-content', { cwd: root, encoding: 'utf8' }); } catch {}
  check('No lesson sources are committed', tracked.trim() === '', tracked.split('\n').slice(0, 3).join(', '));
}

// ---- Rewards: Trail XP, streaks, levels, badges, Garage (supabase/rewards.sql) ----
{
  const rsql = read('supabase/rewards.sql');
  check('Reward records are read-only to the browser (no write grants; awards only via triggers)',
    !/grant (insert|update|delete|all)[^;]*on public\.reward_/i.test(rsql) && /revoke all on public\.%I from anon, authenticated/.test(rsql)
    && /reward_award\(uuid, uuid, text, text, integer, timestamptz, jsonb, boolean\),[\s\S]*from public, anon, authenticated;/.test(rsql));
  check('Rewards hook into the existing learning events (answers and finished sessions)', /after insert on public\.question_attempts/.test(rsql) && /after update of completed on public\.game_sessions/.test(rsql));
  check('A rewards failure can never block saving an answer', (rsql.match(/exception when others then\s+raise warning 'rewards:/g) || []).length === 2);
  check('Every reward is idempotent (one ledger row per student per event key)', /unique \(user_id, idempotency_key\)/.test(rsql));
  const rwJs = ['js/rewards.js', 'js/rewards-live.js'];
  check('Rewards scripts never build HTML from strings', rwJs.every(f => !/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write/.test(read(f))));
  check('Rewards respect reduced motion', read('css/rewards.css').includes('prefers-reduced-motion') && read('js/rewards-live.js').includes('prefers-reduced-motion'));
  check('progress.js shows reward celebrations after saves', /function celebrate\(\)/.test(read('js/progress.js')) && read('js/progress.js').includes("js/rewards-live.js"));
  let pages = [];
  try { pages = execSync(`grep -rl 'js/progress.js' --include='*.html' .`, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean); } catch {}
  const stale = pages.filter(f => !f.includes('private-tools/')).filter(f => !/js\/progress\.js\?v=4/.test(read(f.replace(/^\.\//, ''))));
  check('Every page loads the current progress.js (v=4)', stale.length === 0, stale.join(', '));
  check('Rewards tab is on the student pages', read('js/student.js').includes("href: 'rewards.html'") && existsSync(root + 'rewards.html'));
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
