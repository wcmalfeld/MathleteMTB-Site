#!/usr/bin/env node
// Builds the Coaching Lab page shells and the site's 404 page.
//   node scripts/build-coaching.mjs
// The pages are small shells: the content comes from the database (or the
// seed file locally) and is drawn by js/coaching/app.js, so new skills,
// lessons and drills added in the CMS appear without rebuilding anything.
// Rebuild only when this template changes. check-site.mjs fails if the
// committed pages are out of date.
//
//   coaching/                  Coaching home
//   coaching/skills/           Explore skills + search (?q=)
//   coaching/disciplines/      Disciplines (?d=<id> for one)
//   coaching/progressions/     Pathways (?p=<id> for one)
//   coaching/skill/            A skill and its lesson (?s=<id>)
//   coaching/drill/            A drill (?d=<id>)
//   coaching/admin/            The CMS (editors only; noindex)
//   404.html                   /coaching/<skill-id> -> coaching/skill/?s=<skill-id>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url).pathname;
const SITE = 'https://www.mathletemtb.com/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const V = { site: 12, coaching: 1, cms: 1, app: 1 };
export const SCRIPTS = `<script src="js/tools-config.js?v=15" defer></script>
<script src="js/supabase-config.js?v=7" defer></script>
<script src="js/auth.js?v=7" defer></script>
<script src="js/site.js?v=8" defer></script>
<script src="js/track.js?v=1" defer></script>`;

const SUBNAV = [
  ['home', 'Coaching Home', 'coaching/'],
  ['skills', 'Explore Skills', 'coaching/skills/'],
  ['disciplines', 'Disciplines', 'coaching/disciplines/'],
  ['progressions', 'Progressions', 'coaching/progressions/'],
  ['practice', 'Practice Studio', null],
  ['my', 'My Development', null]
];

export const PAGES = [
  { path: 'coaching/index.html', url: 'coaching/', page: 'home', nav: 'home',
    title: 'Coaching Lab — Mathlete MTB', description: 'Learn mountain bike skills step by step: what to do, why it works, and what to practise next.' },
  { path: 'coaching/skills/index.html', url: 'coaching/skills/', page: 'skills', nav: 'skills',
    title: 'Explore Skills — Coaching Lab — Mathlete MTB', description: 'Search and browse every mountain bike skill in the Coaching Lab.' },
  { path: 'coaching/disciplines/index.html', url: 'coaching/disciplines/', page: 'disciplines', nav: 'disciplines',
    title: 'Disciplines — Coaching Lab — Mathlete MTB', description: 'Foundations, downhill, jumping, dirt jumping, slopestyle, bike control, enduro and bike setup.' },
  { path: 'coaching/progressions/index.html', url: 'coaching/progressions/', page: 'progressions', nav: 'progressions',
    title: 'Progressions — Coaching Lab — Mathlete MTB', description: 'Step-by-step pathways from the foundations to a target skill.' },
  { path: 'coaching/skill/index.html', url: 'coaching/skill/', page: 'skill', nav: 'skills',
    title: 'Skill — Coaching Lab — Mathlete MTB', description: 'A mountain bike skill lesson: physics, technique, drills, mistakes and progression.' },
  { path: 'coaching/drill/index.html', url: 'coaching/drill/', page: 'drill', nav: 'skills',
    title: 'Drill — Coaching Lab — Mathlete MTB', description: 'A mountain bike practice drill.' }
];

export function siteNav(active = 'coaching') {
  const a = id => id === active ? ' class="active" aria-current="page"' : '';
  return `<nav class="site-nav" aria-label="Main">
  <div class="wrap">
    <a href="index.html" class="brand">Mathlete<span>.</span>MTB</a>
    <ul class="nav-links">
      <li><a href="index.html"${a('lab')}>The Lab</a></li>
      <li><a href="coaching/"${a('coaching')}>Coaching</a></li>
      <li><a href="ski/"${a('ski')}>Ski</a></li>
      <li><a href="tutoring.html"><span class="nav-long">Private </span>Tutoring</a></li>
      <li><a href="about.html">About</a></li>
      <li data-auth-show="signed-in" hidden><a href="#" data-logout>Log out</a></li>
      <li class="nav-login" data-auth-show="guest"><a href="login.html">Log in</a></li>
    </ul>
    <a class="nav-book" href="book.html" data-track="book_cta_nav">Book a Session</a>
  </div>
</nav>`;
}

function subnav(current) {
  return `<nav class="coach-subnav" aria-label="Coaching Lab">
  <div class="wrap">
    <ul>
${SUBNAV.map(([id, label, h]) => h
    ? `      <li><a href="${h}"${id === current ? ' aria-current="page"' : ''}>${label}</a></li>`
    : `      <li><span class="soon" aria-disabled="true">${label} <small>Soon</small></span></li>`).join('\n')}
    </ul>
  </div>
</nav>`;
}

function headTags({ base, title, description, url, noindex }) {
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${base}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE}${url}">
<meta property="og:site_name" content="Mathlete MTB">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE}${url}">`}
<meta name="theme-color" content="#1F2B24">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css?v=${V.site}">
<link rel="stylesheet" href="css/coaching.css?v=${V.coaching}">`;
}

const footer = `<footer class="footer">
  <div class="wrap">
    <span>&copy; 2026 Mathlete MTB LLC. All rights reserved.</span>
    <span class="footer-links">
      <a href="login.html" data-auth-show="guest">Member login</a>
      <a href="https://www.willmalfeld.com" target="_blank" rel="noopener">willmalfeld.com</a>
    </span>
  </div>
</footer>`;

const GENERATED = `<!-- Generated by scripts/build-coaching.mjs. Don't edit this file: change
     the script and run  node scripts/build-coaching.mjs
     <base> makes every link below relative to the site root. -->`;

function page(p) {
  const depth = p.path.split('/').length - 1;
  return `<!DOCTYPE html>
${GENERATED}
<html lang="en">
<head>
${headTags({ base: '../'.repeat(depth), title: p.title, description: p.description, url: p.url })}
</head>
<body class="coach">
<a class="skip-link" href="${p.url}#main">Skip to content</a>

${siteNav()}
${subnav(p.nav)}

<main id="main">
  <div id="coach-root" data-coach-page="${p.page}" aria-busy="true" aria-live="polite">
    <div class="wrap coach-loading">Loading the Coaching Lab&hellip;</div>
    <noscript><div class="wrap"><p>The Coaching Lab needs JavaScript turned on.</p></div></noscript>
  </div>
</main>

${footer}

${SCRIPTS}
<script type="module" src="js/coaching/app.js?v=${V.app}"></script>
</body>
</html>
`;
}

function adminPage() {
  return `<!DOCTYPE html>
${GENERATED}
<html lang="en">
<head>
${headTags({ base: '../../', title: 'Coaching CMS — Mathlete MTB', description: 'Manage the Coaching Lab library.', noindex: true })}
<link rel="stylesheet" href="css/coaching-cms.css?v=${V.cms}">
</head>
<body class="coach cms">
<a class="skip-link" href="coaching/admin/#main">Skip to content</a>

${siteNav()}

<main id="main">
  <div id="cms-root" aria-busy="true" aria-live="polite">
    <div class="wrap coach-loading">Loading the CMS&hellip;</div>
    <noscript><div class="wrap"><p>The CMS needs JavaScript turned on.</p></div></noscript>
  </div>
</main>

${SCRIPTS}
<script type="module" src="js/coaching/cms.js?v=${V.cms}"></script>
</body>
</html>
`;
}

// GitHub Pages serves 404.html for any missing address. Clean coaching
// links like /coaching/manual go to that skill; everything else gets a
// normal "page not found".
function notFoundPage() {
  return `<!DOCTYPE html>
${GENERATED}
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page not found — Mathlete MTB</title>
<meta name="robots" content="noindex">
<script>
  (function () {
    var m = location.pathname.match(/\\/coaching\\/([a-z0-9]+(?:-[a-z0-9]+)*)\\/?$/);
    var reserved = { skills: 1, disciplines: 1, progressions: 1, skill: 1, drill: 1, admin: 1 };
    if (m && !reserved[m[1]]) {
      var base = location.pathname.slice(0, m.index + 1);
      location.replace(base + 'coaching/skill/?s=' + m[1] + location.hash);
    }
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css?v=${V.site}">
</head>
<body>
<main id="main" class="section">
  <div class="wrap">
    <p class="eyebrow">404</p>
    <h1 class="page-title">Page not found</h1>
    <p class="hero-lede">That page isn't here. It may have moved.</p>
    <p><a class="button" href="/">Go to the home page</a> <a class="read-link" href="/coaching/">Coaching Lab <span aria-hidden="true">&rarr;</span></a></p>
  </div>
</main>
</body>
</html>
`;
}

export function render() {
  const out = {};
  for (const p of PAGES) out[p.path] = page(p);
  out['coaching/admin/index.html'] = adminPage();
  out['404.html'] = notFoundPage();
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let changed = 0;
  for (const [p, html] of Object.entries(render())) {
    const file = root + p;
    mkdirSync(file.replace(/\/[^/]+$/, ''), { recursive: true });
    if (existsSync(file) && readFileSync(file, 'utf8') === html) continue;
    writeFileSync(file, html);
    changed++;
    console.log('wrote ' + p);
  }
  if (!changed) console.log('Coaching Lab pages are up to date.');
}
