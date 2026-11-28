#!/usr/bin/env node
// Builds the Teacher Curriculum (PRDs/lessonPlanLibrary.md):
//   node scripts/build-teacher-curriculum.mjs
//
// Reads
//   content/classes/            courses, units and topics (the same ids students see)
//   content/teacher-curriculum/quarters.mjs   which units fall in which quarter
//   private-content/lesson-plans/**/*.mjs     the lesson plans (git-ignored:
//                                             they contain the answer keys)
// Writes
//   teacher-curriculum/index.html                   the four courses
//   teacher-curriculum/<course>/index.html          quarters, units, topics
//   teacher-curriculum/<course>/<topic>/index.html  a lesson: its public
//       overview, plus the full plan for teachers (loaded from Supabase)
//   content/teacher-curriculum/lessons.json         every lesson's public part,
//       so the pages can be rebuilt (and checked) without the private sources
//   private-content/build/teacher-lessons.json      the full lessons, for
//       `node scripts/admin.mjs lessons-upload`
//
// Without private-content/ (a fresh clone, or CI) it rebuilds the pages from
// lessons.json. check-site.mjs fails if any page is out of date.

import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { loadClasses } from '../content/classes/model.mjs';
import { ART } from './build-classes.mjs';
import { TEACHER_COURSES, CURRENT_QUARTER, QUARTER_DATES, SCHOOL_YEAR, TOOLS, ACTIVITY_KINDS } from '../content/teacher-curriculum/quarters.mjs';
import { checkLesson, publicPart, LESSON_STATUSES } from '../content/teacher-curriculum/schema.mjs';
import { parseRich } from '../js/teacher-curriculum/math.js';

const root = new URL('..', import.meta.url).pathname;
const SITE = 'https://www.mathletemtb.com/';
const BASE = 'teacher-curriculum/';
const PRIVATE = root + 'private-content/lesson-plans/';
const MANIFEST = 'content/teacher-curriculum/lessons.json';
const BUNDLE = 'private-content/build/teacher-lessons.json';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
const V = { site: 16, lab: 10, classes: 3, tc: 1 };

// ---------- rich text to HTML (same markup as js/teacher-curriculum/math.js) ----------
const SPECIAL = { frac: 1, sqrt: 1, sup: 1, sub: 1, over: 1, arrow: 1, grp: 1 };
function mathHtml(nodes) {
  return nodes.map(n => {
    switch (n.t) {
      case 'v': return `<i class="m-v">${esc(n.s)}</i>`;
      case 'n': return `<span class="m-n">${esc(n.s)}</span>`;
      case 'o': return `<span class="m-o">${esc(n.s)}</span>`;
      case 'f': return `<span class="m-f">${esc(n.s)}</span>`;
      case 'w': return `<span class="m-w">${esc(n.s)}</span>`;
      case 'sp': return ' ';
      case 'grp': return `<span class="m-g">${mathHtml(n.c)}</span>`;
      case 'sup': return `<sup class="m-sup">${mathHtml(n.c)}</sup>`;
      case 'sub': return `<sub class="m-sub">${mathHtml(n.c)}</sub>`;
      case 'over': return `<span class="m-over">${mathHtml(n.c)}</span>`;
      case 'arrow': return `<span class="m-arrow">${mathHtml(n.c)}</span>`;
      case 'sqrt': return `<span class="m-sqrt"><span class="m-rad">√</span><span class="m-rad-in">${mathHtml(n.c)}</span></span>`;
      case 'frac': return `<span class="m-frac"><span class="m-num">${mathHtml(n.n)}</span><span class="m-den">${mathHtml(n.d)}</span></span>`;
      default: return `<span class="m-x">${esc(n.s)}</span>`;
    }
  }).join('');
}
function flatMath(nodes) {
  return nodes.map(n => n.t === 'frac' ? `(${flatMath(n.n)})/(${flatMath(n.d)})` : n.t === 'sqrt' ? `√(${flatMath(n.c)})`
    : n.t === 'sup' ? '^' + flatMath(n.c) : SPECIAL[n.t] ? flatMath(n.c) : n.t === 'sp' ? ' ' : n.s).join('');
}
const rich = s => parseRich(s).map(p => p.t === 'text' ? esc(p.s) : p.t === 'bold' ? `<strong>${esc(p.s)}</strong>`
  : `<span class="m" role="math" aria-label="${esc(flatMath(p.ast))}">${mathHtml(p.ast)}</span>`).join('');
const plain = s => parseRich(s).map(p => p.t === 'math' ? flatMath(p.ast) : p.s).join('');

// ---------- the model: course -> quarter -> unit -> topic -> lesson ----------
async function loadLessons() {
  if (!existsSync(PRIVATE)) return { source: 'manifest', lessons: JSON.parse(readFileSync(root + MANIFEST, 'utf8')), full: null };
  const files = [];
  const walk = d => readdirSync(d).sort().forEach(f => { const p = d + '/' + f; if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.mjs')) files.push(p); });
  walk(PRIVATE.replace(/\/$/, ''));
  const full = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(f).href + '?t=' + statSync(f).mtimeMs);
    const got = Array.isArray(mod.default) ? mod.default : [mod.default];
    got.forEach(l => full.push({ ...l, _file: f.replace(root, '') }));
  }
  return { source: 'private', lessons: null, full };
}

export async function buildModel() {
  const classes = loadClasses();
  if (classes.errors.length) throw new Error('content/classes has problems:\n  ' + classes.errors.join('\n  '));
  const errors = [];
  const { source, lessons: manifest, full } = await loadLessons();
  const topicById = classes.topicById;

  // Lessons, checked (from the private sources) or as last built (manifest).
  const byTopic = new Map();
  if (full) {
    for (const L of full) {
      const topic = topicById.get(L.id);
      if (!topic) { errors.push(`${L._file}: ${L.id} isn't a Classes topic id`); continue; }
      for (const msg of checkLesson(L, topic)) errors.push(`${L._file} (${L.id}): ${msg}`);
      if (byTopic.has(L.id)) errors.push(`${L.id} has two lessons (one lesson per topic for now)`);
      byTopic.set(L.id, { pub: publicPart(L), full: L });
    }
  } else {
    for (const p of manifest) {
      if (!topicById.get(p.id)) errors.push(`${MANIFEST}: ${p.id} isn't a Classes topic id`);
      byTopic.set(p.id, { pub: p, full: null });
    }
  }

  const courses = [];
  const seenUnits = new Set();
  for (const tc of TEACHER_COURSES) {
    const c = classes.courses.find(x => x.id === tc.course);
    if (!c) { errors.push(`quarters.mjs: no course ${tc.course}`); continue; }
    const course = { id: c.id, slug: c.slug, name: c.name, description: c.description, card: c.card, art: tc.icon, grades: tc.grades,
      confirmed: !!tc.confirmed, href: BASE + c.slug + '/', classesHref: c.href, quarters: [] };
    if (tc.quarters.map(q => q.n).join() !== '1,2,3,4') errors.push(`${c.name}: quarters must be 1, 2, 3, 4`);
    for (const q of tc.quarters) {
      const quarter = { n: q.n, focus: q.focus, dates: QUARTER_DATES[q.n], course, units: [], id: `q${q.n}` };
      for (const slug of q.units) {
        const u = c.units.find(x => x.slug === slug);
        if (!u) { errors.push(`${c.name} quarter ${q.n}: no unit ${slug}`); continue; }
        if (seenUnits.has(u.id)) errors.push(`${c.name}: unit ${slug} is in two quarters`);
        seenUnits.add(u.id);
        const unit = { id: u.id, slug: u.slug, title: u.title, number: u.number, quarter, topics: [] };
        for (const t of u.topics) {
          const hit = byTopic.get(t.id);
          unit.topics.push({ id: t.id, slug: t.slug, title: t.title, desc: t.desc, classesHref: t.href, unit, quarter, course,
            lesson: hit ? { ...hit.pub, href: BASE + c.slug + '/' + t.slug + '/' } : null, full: hit && hit.full });
        }
        quarter.units.push(unit);
      }
      course.quarters.push(quarter);
    }
    c.units.forEach(u => { if (!seenUnits.has(u.id)) errors.push(`${c.name}: unit ${u.slug} isn't in any quarter`); });
    courses.push(course);
  }
  // Every lesson's topic must be in a course listed here.
  const placed = new Set(courses.flatMap(c => c.quarters.flatMap(q => q.units.flatMap(u => u.topics.map(t => t.id)))));
  for (const id of byTopic.keys()) if (!placed.has(id)) errors.push(`${id} has a lesson but its course isn't in the Teacher Curriculum`);
  return { courses, errors, source };
}

const lessonsOf = c => c.quarters.flatMap(q => q.units.flatMap(u => u.topics.filter(t => t.lesson)));
const ready = t => t.lesson && t.lesson.status === 'published';

// ---------- page shell ----------
function page({ path, depth, title, description, body, scripts = [] }) {
  const base = '../'.repeat(depth);
  return `<!DOCTYPE html>
<!-- Generated by scripts/build-teacher-curriculum.mjs. Don't edit this
     file: change content/teacher-curriculum/ or the lesson sources and run
     node scripts/build-teacher-curriculum.mjs
     <base> makes every link below relative to the site root. -->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<base href="${base}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE + path}">
<meta property="og:site_name" content="Mathlete MTB">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE + path}">
<meta property="og:image" content="${SITE}assets/trailbuilder.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css?v=${V.site}">
<link rel="stylesheet" href="css/lab.css?v=${V.lab}">
<link rel="stylesheet" href="css/classes.css?v=${V.classes}">
<link rel="stylesheet" href="css/teacher-curriculum.css?v=${V.tc}">
</head>
<body class="lab cls tc">
<a class="skip-link" href="${path}#main">Skip to content</a>

<nav class="site-nav" aria-label="Main">
  <div class="wrap">
    <a href="index.html" class="brand">Mathlete<span>.</span>MTB</a>
    <ul class="nav-links">
      <li><a href="index.html">The Lab</a></li>
      <li><a href="classes/" class="active">Courses</a></li>
      <li><a href="ski/">Ski</a></li>
      <li><a href="tutoring.html"><span class="nav-long">Private </span>Tutoring</a></li>
      <li><a href="resources/">Resources</a></li>
      <li><a href="about.html">About</a></li>
      <li data-auth-show="member" hidden><a href="dashboard.html">My Dashboard</a></li>
      <li data-auth-show="signed-in" hidden><a href="#" data-logout>Log out</a></li>
      <li class="nav-login" data-auth-show="guest"><a href="login.html">Log in</a></li>
    </ul>
    <a class="nav-book" href="book.html" data-track="book_cta_nav">Book a Session</a>
  </div>
</nav>

<main id="main">
${body}
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
<script src="js/auth.js?v=8" defer></script>
<script src="js/site.js?v=8" defer></script>
<script src="js/track.js?v=1" defer></script>
${scripts.map(s => `<script type="module" src="${s}?v=${V.tc}"></script>`).join('\n')}
</body>
</html>
`;
}

function crumbs(items) {
  return `<nav class="cls-crumbs tc-crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) =>
    i === items.length - 1 ? `<li><span aria-current="page">${esc(it.label)}</span></li>` : `<li><a href="${esc(it.href)}">${esc(it.label)}</a></li>`).join('')}</ol></nav>`;
}
const proposedNote = c => c.confirmed ? '' : `<p class="tc-proposed"><span class="tc-proposed-tag">Proposed sequence</span> This quarter-by-quarter order is Mathlete MTB’s suggested pacing for a typical school year, not a school’s confirmed calendar. Your school’s order may differ; every lesson stands on its own.</p>`;

// ---------- landing ----------
function landing(model) {
  const cards = model.courses.map(c => {
    const all = lessonsOf(c), cur = c.quarters.find(q => q.n === CURRENT_QUARTER);
    const units = c.quarters.reduce((n, q) => n + q.units.length, 0);
    const curReady = cur.units.flatMap(u => u.topics).filter(ready).length;
    const curTopics = cur.units.reduce((n, u) => n + u.topics.length, 0);
    return `
    <li><article class="cls-course tc-course">
      <a class="cls-course-art" href="${c.href}" tabindex="-1" aria-hidden="true">${ART[c.art] || ''}</a>
      <div class="cls-course-body">
        <p class="tc-course-grades">${esc(c.grades)}</p>
        <h2 class="cls-course-name"><a href="${c.href}">${esc(c.name)}</a></h2>
        <p class="cls-course-desc">${esc(c.description)}</p>
        <div class="tc-now">
          <p class="tc-now-label">Now teaching &middot; Quarter ${CURRENT_QUARTER}</p>
          <p class="tc-now-focus">${esc(cur.focus)}</p>
          <p class="tc-now-count">${curReady} of ${plural(curTopics, 'lesson plan')} ready</p>
        </div>
        <p class="cls-course-count">4 quarters &middot; ${plural(units, 'unit')} &middot; ${plural(all.filter(ready).length, 'lesson plan')} ready</p>
        <a class="button" href="${c.href}#q${CURRENT_QUARTER}">Open ${esc(c.name)} <span aria-hidden="true">&rarr;</span></a>
      </div>
    </article></li>`;
  }).join('');
  const total = model.courses.reduce((n, c) => n + lessonsOf(c).filter(ready).length, 0);
  return page({
    path: BASE, depth: 1, title: 'Teacher Curriculum — Mathlete MTB',
    description: 'Complete, ready-to-teach lesson plans for Algebra 1, Geometry, Algebra 2 and Precalculus, organized by quarter, unit and topic, each with a mountain biking activity.',
    scripts: ['js/teacher-curriculum/access-note.js'],
    body: `
<header class="page-head lab-head cls-head tc-head">
  <div class="wrap">
    <p class="eyebrow">Teacher Curriculum &middot; ${esc(SCHOOL_YEAR)}</p>
    <h1 class="page-title">Your complete math teaching companion.</h1>
    <p class="hero-lede">Ready-to-teach lesson plans for every topic, organized by course, quarter and unit. Each one has clear objectives, the math explained, a timed teaching plan, a mountain biking activity or lab, practice, an exit ticket and a full answer key.</p>
    <p class="cls-course-count">${plural(model.courses.length, 'course')} &middot; Quarter ${CURRENT_QUARTER} is current &middot; ${plural(total, 'lesson plan')} ready</p>
    <div class="tc-access" data-tc-access>
      <p class="tc-access-text">Anyone can browse the curriculum and lesson overviews. The full plans and answer keys are for teachers: Mathlete tutors, and instructors at partner schools. <a href="login.html?next=teacher-curriculum/">Log in</a> to open them.</p>
    </div>
  </div>
</header>

<section class="section" aria-labelledby="courses-title">
  <div class="wrap">
    <div class="lab-section-head"><h2 class="label" id="courses-title">Courses</h2></div>
    <ul class="cls-courses tc-courses">${cards}
    </ul>
    <p class="cls-note">Lessons follow the same courses, units and topics as the <a href="classes/">Courses</a> pages, so what you teach lines up with what students practice. The quarter-by-quarter order is a proposed pacing for a typical school year; tell us your school’s and we’ll match it.</p>
  </div>
</section>
`
  });
}

// ---------- course ----------
function resourcesOf(t) {
  const L = t.lesson; if (!L) return '';
  const tool = L.activity.tool && TOOLS[L.activity.tool];
  return `<ul class="tc-res" aria-label="In this lesson">
                <li class="tc-res-item tc-res--${tool ? 'tool' : 'activity'}">${tool ? esc(tool.name) : esc(ACTIVITY_KINDS[L.activity.kind])}</li>
                <li class="tc-res-item">Worksheet</li>
                <li class="tc-res-item">Answer key</li>
              </ul>`;
}
function topicRow(t, qi) {
  const L = t.lesson, n = `${t.unit.number}.${t.unit.topics.indexOf(t) + 1}`;
  if (!L) return `
            <li class="tc-topic tc-topic--planned">
              <span class="tc-topic-n">${n}</span>
              <div class="tc-topic-main">
                <h4 class="tc-topic-title">${esc(t.title)}</h4>
                <p class="tc-topic-desc">${esc(t.desc)}</p>
              </div>
              <div class="tc-topic-side">
                <span class="tc-state tc-state--planned">Lesson plan planned</span>
                <a class="tc-topic-classes" href="${t.classesHref}">Student topic page</a>
              </div>
            </li>`;
  return `
            <li class="tc-topic">
              <span class="tc-topic-n">${n}</span>
              <div class="tc-topic-main">
                <p class="tc-topic-kicker">${esc(t.title)}</p>
                <h4 class="tc-topic-title"><a href="${L.href}">${rich(L.title)}</a></h4>
                <p class="tc-topic-hook">${rich(L.hook)}</p>
                ${resourcesOf(t)}
              </div>
              <div class="tc-topic-side">
                <span class="tc-state tc-state--${esc(L.status)}">${esc(LESSON_STATUSES[L.status])}</span>
                <span class="tc-topic-min">${L.minutes} min</span>
              </div>
            </li>`;
}
function coursePage(c, model) {
  const tabs = c.quarters.map(q => {
    const n = q.units.flatMap(u => u.topics).filter(ready).length;
    return `
      <a class="tc-qtab" href="${c.href}#${q.id}" role="tab" id="tab-${q.id}" aria-controls="${q.id}" data-quarter-tab="${q.id}"${q.n === CURRENT_QUARTER ? ' data-current' : ''}>
        <span class="tc-qtab-n">Quarter ${q.n}</span>
        <span class="tc-qtab-meta">${esc(q.dates)}${q.n === CURRENT_QUARTER ? ' &middot; <strong>Now</strong>' : ''}</span>
        <span class="tc-qtab-count">${n ? plural(n, 'lesson plan') : 'Plans coming'}</span>
      </a>`;
  }).join('');
  const panels = c.quarters.map(q => {
    const topics = q.units.flatMap(u => u.topics), n = topics.filter(ready).length;
    return `
    <section class="tc-quarter" id="${q.id}" role="tabpanel" aria-labelledby="tab-${q.id}" data-quarter-panel="${q.id}">
      <header class="tc-quarter-head">
        <h2 class="tc-quarter-title">Quarter ${q.n}<span class="tc-quarter-focus">${esc(q.focus)}</span></h2>
        <p class="tc-quarter-meta">${esc(q.dates)} &middot; ${plural(q.units.length, 'unit')} &middot; ${plural(topics.length, 'topic')} &middot; ${n ? `${n} of ${topics.length} lesson plans ready` : 'lesson plans in development'}</p>
      </header>
      <ol class="cls-units tc-units">${q.units.map(u => {
        const k = u.topics.filter(ready).length;
        return `
        <li><details class="cls-unit tc-unit" id="${esc(u.slug)}"${q.n === CURRENT_QUARTER ? ' open' : ''}>
          <summary>
            <span class="cls-unit-n">Unit ${u.number}</span>
            <span class="cls-unit-title">${esc(u.title)}</span>
            <span class="cls-unit-meta">${plural(u.topics.length, 'topic')}${k ? ` &middot; ${k} ready` : ''}</span>
          </summary>
          <ol class="tc-topics">${u.topics.map(t => topicRow(t)).join('')}
          </ol>
        </details></li>`;
      }).join('')}
      </ol>
    </section>`;
  }).join('');
  const others = model.courses.filter(o => o !== c);
  return page({
    path: c.href, depth: 2, title: `${c.name} — Teacher Curriculum — Mathlete MTB`,
    description: `${c.name} lesson plans by quarter, unit and topic, each with a mountain biking activity. ${c.description}`,
    scripts: ['js/teacher-curriculum/course-page.js', 'js/teacher-curriculum/access-note.js'],
    body: `
<header class="page-head lab-head cls-head tc-head">
  <div class="wrap">
    ${crumbs([{ label: 'Teacher Curriculum', href: BASE }, { label: c.name }])}
    <p class="eyebrow">Teacher Curriculum &middot; ${esc(c.grades)}</p>
    <h1 class="page-title">${esc(c.name)}</h1>
    <p class="hero-lede">${esc(c.description)}</p>
    <p class="cls-course-count">4 quarters &middot; ${plural(c.quarters.reduce((n, q) => n + q.units.length, 0), 'unit')} &middot; ${plural(c.quarters.reduce((n, q) => n + q.units.reduce((m, u) => m + u.topics.length, 0), 0), 'topic')} &middot; ${plural(lessonsOf(c).filter(ready).length, 'lesson plan')} ready</p>
    ${proposedNote(c)}
    <div class="tc-access" data-tc-access hidden></div>
  </div>
</header>

<section class="section tc-course-body" aria-label="Quarters">
  <div class="wrap">
    <div class="tc-qtabs" role="tablist" aria-label="Quarters">${tabs}
    </div>${panels}
  </div>
</section>

<section class="section section--panel" aria-labelledby="other-title">
  <div class="wrap">
    <div class="lab-section-head"><h2 class="label" id="other-title">Other courses</h2></div>
    <ul class="lab-also">
      ${others.map(o => `<li><a href="${o.href}">${esc(o.name)}</a></li>`).join('\n      ')}
      <li><a href="${c.classesHref}">${esc(c.name)} for students (Classes)</a></li>
      <li><a href="${BASE}">Teacher Curriculum</a></li>
    </ul>
  </div>
</section>
`
  });
}

// ---------- lesson ----------
const SECTIONS = [
  ['objectives', 'Learning objectives'], ['question', 'Essential question'], ['math', 'Mathematical foundation'],
  ['mtb', 'MTB connection'], ['timeline', 'Teaching plan'], ['activity', 'MTB activity'], ['guided', 'Guided practice'],
  ['practice', 'Independent practice'], ['exit', 'Exit ticket'], ['resources', 'Teacher resources']
];
function lessonPage(t, prev, next) {
  const L = t.lesson, c = t.course, q = t.quarter, u = t.unit;
  const tool = L.activity.tool ? TOOLS[L.activity.tool] : null;
  const launch = tool ? `${tool.route}${tool.returns ? '?from=' + encodeURIComponent(L.href) : ''}` : null;
  const toc = SECTIONS.map(([id, label], i) => `<li><a href="${L.href}#${id}" data-toc="${id}"><span class="tc-toc-n">${i + 2}</span>${label}</a></li>`).join('');
  const nav = (x, dir) => x ? `<a class="tc-pn tc-pn--${dir}" href="${x.lesson.href}"><span class="tc-pn-dir">${dir === 'prev' ? '&larr; Previous lesson' : 'Next lesson &rarr;'}</span><span class="tc-pn-title">${rich(x.lesson.title)}</span><span class="tc-pn-where">${esc(x.course.name)} &middot; Quarter ${x.quarter.n} &middot; ${esc(x.unit.title)}</span></a>` : '<span></span>';
  return page({
    path: L.href, depth: 3, title: `${plain(L.title)} — ${c.name} lesson plan — Mathlete MTB`,
    description: `${c.name}, Quarter ${q.n}, ${u.title}: ${plain(L.summary)}`,
    scripts: ['js/teacher-curriculum/lesson-page.js'],
    body: `
<header class="page-head lab-head tc-lesson-head">
  <div class="wrap">
    ${crumbs([{ label: 'Teacher Curriculum', href: BASE }, { label: c.name, href: c.href }, { label: `Quarter ${q.n}`, href: c.href + '#' + q.id }, { label: u.title, href: c.href + '#' + u.slug }, { label: t.title }])}
    <p class="tc-lesson-kicker">${esc(c.name)} <span aria-hidden="true">|</span> Quarter ${q.n} <span aria-hidden="true">|</span> Unit ${u.number}: ${esc(u.title)}</p>
    <h1 class="tc-lesson-title">${rich(L.title)}</h1>
    <p class="tc-lesson-hook">${rich(L.hook)}</p>
    <dl class="tc-facts">
      <div><dt>Duration</dt><dd><span data-duration>${L.minutes}</span> minutes</dd></div>
      <div><dt>Grade level</dt><dd>${esc(L.grade || c.grades)}</dd></div>
      <div><dt>Topic</dt><dd><a href="${t.classesHref}">${esc(t.title)}</a></dd></div>
      <div><dt>Standards</dt><dd>${L.standards.map(esc).join(', ')}</dd></div>
    </dl>
    <p class="tc-lesson-summary">${rich(L.summary)}</p>
    <div class="tc-tools" data-teacher-tools hidden></div>
  </div>
</header>

<div class="wrap tc-workspace" data-lesson="${esc(L.id)}" data-minutes="${L.minutes}"${launch ? ` data-launch="${esc(launch)}"` : ''}>
  <nav class="tc-toc" aria-label="Lesson sections">
    <p class="tc-toc-head">In this lesson</p>
    <ol>${toc}</ol>
  </nav>
  <div class="tc-plan" data-lesson-plan>
    <section class="tc-sec" id="objectives" aria-labelledby="objectives-h">
      <h2 class="tc-sec-title" id="objectives-h"><span class="tc-sec-n">2</span>Learning objectives</h2>
      <p class="tc-sec-lead">By the end of this lesson, students will be able to:</p>
      <ul class="tc-objectives">${L.objectives.map(o => `<li>${rich(o)}</li>`).join('')}</ul>
    </section>
    <section class="tc-sec" id="question" aria-labelledby="question-h">
      <h2 class="tc-sec-title" id="question-h"><span class="tc-sec-n">3</span>Essential question</h2>
      <blockquote class="tc-eq"><p>${rich(L.question)}</p></blockquote>
    </section>
    <section class="tc-sec" id="mtb" aria-labelledby="mtb-h">
      <h2 class="tc-sec-title" id="mtb-h"><span class="tc-sec-n">5</span>MTB connection</h2>
      ${L.mtb.text.map(p => `<p>${rich(p)}</p>`).join('\n      ')}
      <table class="tc-pairs"><thead><tr><th scope="col">The math</th><th scope="col">On the trail</th></tr></thead><tbody>${L.mtb.pairs.map(p => `<tr><td>${rich(p[0])}</td><td>${rich(p[1])}</td></tr>`).join('')}</tbody></table>
    </section>
    <section class="tc-sec" id="activity" aria-labelledby="activity-h">
      <h2 class="tc-sec-title" id="activity-h"><span class="tc-sec-n">7</span>MTB activity</h2>
      <article class="tc-launch">
        <p class="tc-launch-kind">${esc(ACTIVITY_KINDS[L.activity.kind])}</p>
        <h3 class="tc-launch-title">${rich(L.activity.title)}</h3>
        <p>${rich(L.activity.objective)}</p>
        <p class="tc-launch-materials"><strong>You’ll need:</strong> ${L.activity.materials.map(rich).join('; ')}</p>
        ${launch ? `<a class="button" href="${esc(launch)}" target="_blank" rel="noopener">Open ${esc(tool.name)} <span aria-hidden="true">&nearr;</span><span class="visually-hidden"> (opens in a new tab)</span></a>` : ''}
      </article>
    </section>
    <section class="tc-sec tc-locked" data-locked aria-labelledby="locked-h">
      <h2 class="tc-sec-title" id="locked-h">The full lesson plan is for teachers</h2>
      <p>Teachers also get the mathematical foundation with worked examples, a ${L.counts.stages}-stage teaching plan with timings, step-by-step activity instructions, ${L.counts.guided} guided examples with solutions, ${L.counts.practice} practice problems, a ${L.counts.exit}-question exit ticket, a printable worksheet, common misconceptions, differentiation ideas and the complete answer key.</p>
      <p data-locked-msg><a class="button" href="login.html?next=${encodeURIComponent(L.href)}">Log in to open it</a></p>
      <p class="tc-locked-who">Open to Mathlete tutors, and to instructors at partner schools whose licence includes the Teacher Curriculum.</p>
    </section>
  </div>
</div>

<nav class="wrap tc-prevnext" aria-label="Other lessons">
  ${nav(prev, 'prev')}
  ${nav(next, 'next')}
</nav>
`
  });
}

// ---------- outputs ----------
export async function render() {
  const model = await buildModel();
  if (model.errors.length) throw new Error('Teacher Curriculum has problems:\n  ' + model.errors.join('\n  '));
  const pages = { [BASE + 'index.html']: landing(model) };
  const manifest = [], bundle = [];
  for (const c of model.courses) {
    pages[c.href + 'index.html'] = coursePage(c, model);
    const list = lessonsOf(c);
    list.forEach((t, i) => {
      pages[t.lesson.href + 'index.html'] = lessonPage(t, list[i - 1], list[i + 1]);
      const { href, ...pub } = t.lesson;
      manifest.push(pub);
      if (t.full) {
        const { _file, ...L } = t.full;
        const tool = L.activity.tool ? TOOLS[L.activity.tool] : null;
        const content = { ...L, context: { course: c.name, quarter: t.quarter.n, unit: t.unit.title, topic: t.title,
          tool: tool ? { name: tool.name, route: tool.route + (tool.returns ? '?from=' + encodeURIComponent(t.lesson.href) : '') } : null } };
        const json = JSON.stringify(content);
        bundle.push({ id: L.id, course_id: c.id, quarter: t.quarter.n, topic_id: t.id, title: plain(L.title), status: L.status,
          content, content_hash: createHash('sha256').update(json).digest('hex').slice(0, 32) });
      }
    });
  }
  pages[MANIFEST] = JSON.stringify(manifest, null, 1) + '\n';
  return { pages, bundle, source: model.source };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { pages, bundle, source } = await render();
  const want = new Set(Object.keys(pages));
  // Remove pages for lessons or courses that no longer exist.
  const dir = root + BASE;
  if (existsSync(dir)) for (const course of readdirSync(dir)) {
    const cdir = dir + course;
    if (!statSync(cdir).isDirectory()) continue;
    for (const topic of readdirSync(cdir)) {
      const f = `${BASE}${course}/${topic}/index.html`;
      if (statSync(cdir + '/' + topic).isDirectory() && !want.has(f)) { rmSync(cdir + '/' + topic, { recursive: true }); console.log('removed ' + f); }
    }
    if (!want.has(`${BASE}${course}/index.html`)) { rmSync(cdir, { recursive: true }); console.log('removed ' + BASE + course); }
  }
  for (const [p, html] of Object.entries(pages)) {
    mkdirSync(root + p.replace(/[^/]+$/, ''), { recursive: true });
    writeFileSync(root + p, html);
  }
  if (source === 'private') {
    mkdirSync(root + BUNDLE.replace(/[^/]+$/, ''), { recursive: true });
    writeFileSync(root + BUNDLE, JSON.stringify(bundle));
    console.log(`wrote ${Object.keys(pages).length} files and ${BUNDLE} (${bundle.length} lessons). Upload with: node scripts/admin.mjs lessons-upload`);
  } else {
    console.log(`wrote ${Object.keys(pages).length} files from ${MANIFEST} (private-content/lesson-plans/ not found, so no upload bundle)`);
  }
}
