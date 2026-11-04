#!/usr/bin/env node
// Builds the Learning Lab from the tool registry.
//   node scripts/build-lab.mjs
// Reads js/tools-config.js, js/lab-categories.js and the tool descriptions
// in content/tool-details/<tool-id>.html, and writes
//   index.html, ski/index.html           (only the parts between the
//                                         <!-- BUILD:name --> markers: the
//                                         lab tiles and the tool grid; the
//                                         rest of each page is hand-edited)
//   learning-lab/<category>/index.html   (one per MTB category)
//   ski/<category>/index.html            (one per ski category)
//   learning-lab/index.html              (redirect to the home page, which
//                                         is now the Lab)
// The output is plain HTML committed to the repo, so the site still has no
// deploy-time build and the cards are readable by search engines and
// without JavaScript. check-site.mjs fails if these pages are out of date.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = new URL('..', import.meta.url).pathname;
const read = p => readFileSync(root + p, 'utf8');
const SITE = 'https://www.mathletemtb.com/';

export const SUBJECTS = {
  algebra: 'Algebra', geometry: 'Geometry', trigonometry: 'Trigonometry',
  statistics: 'Statistics', calculus: 'Calculus', physics: 'Physics'
};
export const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
export const DURATIONS = { quick: 'Quick activity', challenge: 'Full challenge', extended: 'Extended exploration' };

// Each sport has its own Lab home page and category pages.
export const SPORTS = {
  mtb: { home: 'index.html', href: 'index.html', catBase: 'learning-lab/', name: 'The Mathlete Lab', bodyClass: 'lab' },
  ski: { home: 'ski/index.html', href: 'ski/', catBase: 'ski/', name: 'Mathlete Ski', bodyClass: 'lab lab--ski' }
};
const sportOf = c => (c && c.sport) || 'mtb';
export const catHref = c => SPORTS[sportOf(c)].catBase + c.id + '/';

export function loadRegistry() {
  const sandbox = { window: {} };
  vm.runInNewContext(read('js/tools-config.js'), sandbox);
  vm.runInNewContext(read('js/lab-categories.js'), sandbox);
  return {
    tools: sandbox.window.MATHLETE_TOOLS || [],
    categories: sandbox.window.MATHLETE_LAB_CATEGORIES || []
  };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Card id, e.g. trail-builder -> tool-trailbuilder. index.html#tool-trailbuilder
// opens that tool's description (js/site.js).
export const cardId = t => 'tool-' + t.id.replace(/-/g, '');

// The full description shown in the "Details" pop-up, if the tool has one.
export const detailsPath = t => `content/tool-details/${t.id}.html`;
function details(t) {
  if (!existsSync(root + detailsPath(t))) return '';
  const html = read(detailsPath(t)).trim().split('\n').map(l => l ? '            ' + l : l).join('\n');
  return `
          <details class="lab-more">
            <summary class="read-link">Details</summary>
${html}
          </details>`;
}

function launchHref(t) {
  return t.access === 'public' ? t.url : 'tool.html?id=' + encodeURIComponent(t.id);
}

function levelRange(levels) {
  const order = Object.keys(LEVELS).filter(l => levels.includes(l));
  if (!order.length) return '';
  return order.length === 1 ? LEVELS[order[0]] : LEVELS[order[0]] + ' &ndash; ' + LEVELS[order[order.length - 1]];
}

function toolCard(t, cats) {
  const cat = cats.find(c => c.id === t.category);
  const href = launchHref(t);
  const ext = t.access === 'public' ? ' target="_blank" rel="noopener"' : '';
  const members = t.access === 'private';
  const flag = members
    ? '<span class="lab-flag">Members</span>'
    : t.featured ? '<span class="lab-flag lab-flag--featured">Featured</span>' : '';
  return `
    <article class="tool-card lab-card" id="${esc(cardId(t))}" data-lab-tool="${esc(t.id)}" data-category="${esc(t.category || '')}" data-subjects="${esc(t.subjects.join(' '))}" data-difficulty="${esc(t.difficulty.join(' '))}" data-duration="${esc(t.duration)}">
      <span class="tool-thumb">${flag}<img src="${esc(t.image)}" alt="" loading="lazy" decoding="async"></span>
      <div class="tool-card-body">
        <p class="kicker">${esc(cat ? cat.name : 'The Lab')}</p>
        <h3 class="tool-card-title"><a href="${esc(href)}"${ext}>${esc(t.name)}</a></h3>
        <p class="tool-card-desc">${esc(t.summary)}</p>
        <dl class="lab-facts">
          <div><dt>Level</dt><dd>${levelRange(t.difficulty)}</dd></div>
          <div><dt>Time</dt><dd>${esc(t.minutes)}</dd></div>
        </dl>
        <ul class="pill-row" aria-label="Math">
          ${t.subjects.map(s => `<li class="pill${s === 'physics' ? ' pill--physics' : ''}">${esc(SUBJECTS[s] || s)}</li>`).join('')}
        </ul>${members ? '\n        <p class="lab-access">Student login required.</p>' : ''}
        <div class="lab-card-actions">
          <a class="button" href="${esc(href)}"${ext}>Launch <span aria-hidden="true">&rarr;</span><span class="visually-hidden"> ${esc(t.name)}${ext ? ' (opens in a new tab)' : ''}</span></a>${details(t)}
        </div>
      </div>
    </article>`;
}

function soonCard(name, cat) {
  return `
    <article class="tool-card tool-card--soon lab-soon">
      <div class="tool-card-body">
        <p class="kicker">${cat ? esc(cat.name) + ' ' : ''}<span class="kicker-flag">In development</span></p>
        <h3 class="tool-card-title">${esc(name)}</h3>
      </div>
    </article>`;
}

function page({ path, depth, title, description, body, sport = 'mtb' }) {
  const base = '../'.repeat(depth);
  const canonical = SITE + path;
  return `<!DOCTYPE html>
<!-- Generated by scripts/build-lab.mjs from js/tools-config.js and
     js/lab-categories.js. Don't edit this file: change those (or the
     script) and run  node scripts/build-lab.mjs
     <base> makes every link below relative to the site root. -->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${base}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="Mathlete MTB">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}assets/trailbuilder.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css?v=12">
<link rel="stylesheet" href="css/lab.css?v=5">
</head>
<body class="${SPORTS[sport].bodyClass}">
<a class="skip-link" href="${path}#main">Skip to content</a>

<nav class="site-nav" aria-label="Main">
  <div class="wrap">
    <a href="index.html" class="brand">Mathlete<span>.</span>MTB</a>
    <ul class="nav-links">
      <li><a href="index.html"${sport === 'mtb' ? ' class="active"' : ''}>The Lab</a></li>
      <li><a href="ski/"${sport === 'ski' ? ' class="active"' : ''}>Ski</a></li>
      <li><a href="tutoring.html"><span class="nav-long">Private </span>Tutoring</a></li>
      <li><a href="about.html">About</a></li>
      <li data-auth-show="signed-in" hidden><a href="#" data-logout>Log out</a></li>
      <li class="nav-login" data-auth-show="guest"><a href="login.html">Log in</a></li>
    </ul>
    <a class="nav-book" href="book.html" data-track="book_cta_nav">Book a Session</a>
  </div>
</nav>

<main id="main">
${body}
<section class="section lab-cta" aria-labelledby="lab-cta-title">
  <div class="wrap">
    <div>
      <p class="eyebrow">Private Tutoring</p>
      <h2 class="lab-cta-title" id="lab-cta-title">Work with Will one-on-one</h2>
      <p>Every tool here was built for real tutoring sessions. Book a private online session in Math, Physics or SAT prep, and we&rsquo;ll work through the ideas behind these challenges together.</p>
    </div>
    <div class="lab-cta-actions">
      <a class="button" href="book.html" data-track="book_cta_lab">Book a Session</a>
      <a class="read-link" href="tutoring.html">Private tutoring <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</section>

</main>

<footer class="footer">
  <div class="wrap">
    <span>&copy; 2026 Mathlete MTB LLC. All rights reserved.</span>
    <span class="footer-links">
      <a href="login.html" data-auth-show="guest">Member login</a>
      <a href="https://www.willmalfeld.com" target="_blank" rel="noopener">willmalfeld.com</a>
    </span>
  </div>
</footer>

<script src="js/tools-config.js?v=15" defer></script>
<script src="js/supabase-config.js?v=7" defer></script>
<script src="js/auth.js?v=7" defer></script>
<script src="js/site.js?v=8" defer></script>
<script src="js/track.js?v=1" defer></script>
</body>
</html>
`;
}

const contour = `
  <svg class="contour-field" viewBox="0 0 1100 420" preserveAspectRatio="none" aria-hidden="true">
    <path d="M-20,90 C 180,50 320,130 500,90 C 680,50 820,120 1120,80" fill="none" stroke-opacity="0.08" stroke-width="1"/>
    <path d="M-20,200 C 220,160 340,230 540,190 C 720,155 880,220 1120,185" fill="none" stroke-opacity="0.22" stroke-width="1"/>
    <path d="M-20,310 C 240,275 360,340 560,300 C 740,265 900,325 1120,290" fill="none" stroke-opacity="0.06" stroke-width="1"/>
  </svg>`;

function options(map, all) {
  return `<option value="">${all}</option>` + Object.entries(map).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
}

// Replace what's between <!-- BUILD:name --> and <!-- /BUILD:name -->.
function fill(html, parts) {
  for (const [name, content] of Object.entries(parts)) {
    const re = new RegExp(`(<!-- BUILD:${name} -->)[\\s\\S]*?(\\n *<!-- /BUILD:${name} -->)`);
    if (!re.test(html)) throw new Error(`index.html is missing the <!-- BUILD:${name} --> markers`);
    html = html.replace(re, (m, open, close) => open + content + close);
  }
  return html;
}

const redirect = `<!DOCTYPE html>
<!-- Generated by scripts/build-lab.mjs. The Lab dashboard moved to the
     home page; this keeps old /learning-lab/ links (and their filters,
     e.g. ?subjects=physics) working. -->
<html lang="en">
<head>
<meta charset="UTF-8">
<title>The Mathlete Lab — Mathlete MTB</title>
<link rel="canonical" href="${SITE}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=../">
<script>location.replace('../' + location.search + (location.hash || '#tools'));</script>
</head>
<body>
<p>The Mathlete Lab is now on the <a href="../">home page</a>.</p>
</body>
</html>
`;

export function render() {
  const { tools, categories } = loadRegistry();
  // Featured tools first, then registry order.
  const live = tools.filter(t => t.status === 'live')
    .map((t, i) => [t, i]).sort((a, b) => (b[0].featured === true) - (a[0].featured === true) || a[1] - b[1]).map(x => x[0]);
  const catOf = t => categories.find(c => c.id === t.category);
  const pages = {};

  for (const [sport, info] of Object.entries(SPORTS)) {
    const cats = categories.filter(c => sportOf(c) === sport);
    // Tools with no category (category: null) are listed with MTB.
    const mine = live.filter(t => sportOf(catOf(t)) === sport);

    const catTiles = cats.map(c => {
      const n = live.filter(t => t.category === c.id).length;
      const soon = (c.upcoming || []).length;
      const count = [n ? `${n} tool${n === 1 ? '' : 's'}` : '', soon ? `${soon} in development` : ''].filter(Boolean).join(' &middot; ');
      return `
      <li><a class="lab-cat" href="${catHref(c)}">
        <h3 class="lab-cat-name">${esc(c.name)}</h3>
        <p class="lab-cat-focus">${esc(c.focus)}</p>
        <span class="lab-cat-count">${count}</span>
      </a></li>`;
    }).join('');

    const catOptions = '<option value="">All activities</option>' + cats.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

    // With no finished tools yet, the grid shows what's in development
    // (and there's nothing to filter).
    const seen = new Set();
    const upcoming = cats.flatMap(c => (c.upcoming || []).filter(n => !seen.has(n) && seen.add(n)).map(n => soonCard(n, c)));
    const toolsPart = mine.length ? `
    <form class="lab-filters" data-lab-filters hidden aria-label="Filter tools">
      <div class="lab-filter"><label for="f-category">Activity</label><select id="f-category" name="category">${catOptions}</select></div>
      <div class="lab-filter"><label for="f-subject">Math</label><select id="f-subject" name="subjects">${options(SUBJECTS, 'All subjects')}</select></div>
      <div class="lab-filter"><label for="f-difficulty">Level</label><select id="f-difficulty" name="difficulty">${options(LEVELS, 'All levels')}</select></div>
      <div class="lab-filter"><label for="f-duration">Time</label><select id="f-duration" name="duration">${options(DURATIONS, 'Any length')}</select></div>
      <button type="reset" class="lab-filter-reset">Clear</button>
    </form>
    <p class="meta lab-count" data-lab-count aria-live="polite" hidden></p>
    <div class="tool-grid" data-lab-grid>${mine.map(t => toolCard(t, categories)).join('')}
    </div>
    <p class="lab-empty" data-lab-empty hidden>No tools match those filters yet. <button type="button" class="lab-filter-reset" data-lab-clear>Clear filters</button></p>` : `
    <div class="tool-grid">${upcoming.join('')}
    </div>`;

    pages[info.home] = fill(read(info.home), { 'lab-cats': catTiles, 'lab-tools': toolsPart });

    for (const c of cats) {
      const inCat = live.filter(t => t.category === c.id);
      const others = cats.filter(o => o.id !== c.id);
      const soon = c.upcoming || [];
      pages[catHref(c) + 'index.html'] = page({
        path: catHref(c),
        depth: 2,
        sport,
        title: `${c.name} — ${info.name} — Mathlete MTB`,
        description: `${c.name}: ${c.focus}`,
        body: `
<header class="page-head lab-head">${contour}
  <div class="wrap">
    <a class="lab-crumb" href="${info.href}#labs"><span aria-hidden="true">&larr;</span> ${esc(info.name)}</a>
    <p class="eyebrow">${sport === 'ski' ? 'Mathlete Ski' : 'The Lab'}</p>
    <h1 class="page-title">${esc(c.name)}</h1>
    <p class="hero-lede">${esc(c.focus)}</p>
    <ul class="pill-row" aria-label="Math concepts">
      ${c.concepts.map(x => `<li class="pill pill--moss">${esc(x)}</li>`).join('')}
    </ul>
  </div>
</header>

<section class="section section--panel" aria-labelledby="tools-title">
  <div class="wrap">
    <div class="lab-section-head">
      <h2 class="label" id="tools-title">Tools</h2>
    </div>
    <div class="tool-grid">${inCat.map(t => toolCard(t, categories)).join('')}${soon.map(n => soonCard(n)).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="also-title">
  <div class="wrap">
    <div class="lab-section-head">
      <h2 class="label" id="also-title">More labs</h2>
    </div>
    <ul class="lab-also">
      ${others.map(o => `<li><a href="${catHref(o)}">${esc(o.name)}</a></li>`).join('\n      ')}
      <li><a href="${info.href}#tools">All tools</a></li>
    </ul>
  </div>
</section>
`
      });
    }
  }

  pages['learning-lab/index.html'] = redirect;
  return pages;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pages = render();
  for (const [p, html] of Object.entries(pages)) {
    mkdirSync(root + p.replace(/[^/]+$/, ''), { recursive: true });
    writeFileSync(root + p, html);
    console.log('wrote ' + p);
  }
}
