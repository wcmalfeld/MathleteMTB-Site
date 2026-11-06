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
const navPages = ['index.html', 'ski/index.html', 'about.html', 'login.html', 'account.html', 'college-beyond.html', 'tutoring.html', 'book.html'];
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
const cb = read('college-beyond.html');
check('About page Services links to the College & Beyond page', /id="services"[\s\S]*href="college-beyond\.html"/.test(read('about.html')));
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
