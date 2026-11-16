#!/usr/bin/env node
// Builds the tutoring team pages from content/tutors/.
//   node scripts/build-tutors.mjs
// Writes
//   tutors/index.html            the team directory, with filters
//   tutors/<slug>/index.html     one profile per published tutor
//   tutors/inquire/index.html    the tutoring inquiry form
//   tutoring.html                only the part between the
//                                <!-- BUILD:tutor-cards --> markers
// Unpublished tutors' old profile folders are removed. The output is plain
// HTML committed to the repo, readable without JavaScript and by search
// engines. check-site.mjs fails if these pages are out of date.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { TUTORS } from '../content/tutors/tutors.mjs';
import { SUBJECTS, SUBJECT_FILTERS, LEVELS, FORMATS } from '../content/tutors/taxonomy.mjs';

const root = new URL('..', import.meta.url).pathname;
const SITE = 'https://www.mathletemtb.com/';
const RESERVED = new Set(['inquire', 'index']);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byId = list => Object.fromEntries(list.map(x => [x.id, x]));
const SUBJ = byId(SUBJECTS), LEV = byId(LEVELS), FMT = byId(FORMATS), SFILT = byId(SUBJECT_FILTERS);
const firstName = t => t.name.split(/\s+/)[0];
const profileHref = t => `tutors/${t.slug}/`;
const inquireHref = t => `tutors/inquire/?tutor=${encodeURIComponent(t.slug)}`;
const joinNames = (ids, map) => ids.map(id => map[id].name);

// ---------- checking the content ----------
export function loadTutors() {
  const errors = [];
  const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const seen = new Set();
  const need = ['id', 'slug', 'name', 'title', 'image', 'imageAlt', 'shortBio'];
  const lists = ['biography', 'teachingPhilosophy', 'subjects', 'academicLevels', 'specialties', 'interests', 'formats'];
  for (const t of TUTORS) {
    const who = t.name || t.id || '(a tutor)';
    for (const f of need) if (typeof t[f] !== 'string' || !t[f].trim()) errors.push(`${who}: "${f}" is missing`);
    for (const f of lists) if (!Array.isArray(t[f]) || !t[f].length || t[f].some(x => typeof x !== 'string' || !x.trim())) errors.push(`${who}: "${f}" needs at least one entry`);
    if (t.slug && (!slugRe.test(t.slug) || t.slug.length > 60)) errors.push(`${who}: slug "${t.slug}" must be lowercase letters, numbers and hyphens`);
    if (t.id && !slugRe.test(t.id)) errors.push(`${who}: id "${t.id}" must be lowercase letters, numbers and hyphens`);
    if (RESERVED.has(t.slug)) errors.push(`${who}: slug "${t.slug}" is reserved`);
    for (const [k, v] of [['id', t.id], ['slug', t.slug]]) { if (v && seen.has(k + ':' + v)) errors.push(`${who}: ${k} "${v}" is used by another tutor`); seen.add(k + ':' + v); }
    if (t.image && !existsSync(root + t.image)) errors.push(`${who}: photo ${t.image} doesn't exist`);
    for (const s of t.subjects || []) if (!SUBJ[s]) errors.push(`${who}: unknown subject "${s}" (see content/tutors/taxonomy.mjs)`);
    for (const l of t.academicLevels || []) if (!LEV[l]) errors.push(`${who}: unknown level "${l}"`);
    for (const f of t.formats || []) if (!FMT[f]) errors.push(`${who}: unknown format "${f}"`);
    if (typeof t.featured !== 'boolean' || typeof t.published !== 'boolean') errors.push(`${who}: "featured" and "published" must be true or false`);
    if (!Number.isFinite(t.displayOrder)) errors.push(`${who}: "displayOrder" must be a number`);
    if (t.shortBio && t.shortBio.length > 400) errors.push(`${who}: shortBio is over 400 characters; keep it to 2-3 sentences`);
    for (const f of ['location', 'availability', 'formatNote']) if (t[f] != null && (typeof t[f] !== 'string' || !t[f].trim())) errors.push(`${who}: "${f}" should be text or left out`);
    const all = JSON.stringify(t);
    if (/[^\s@"]+@[^\s@"]+\.[a-z]{2,}/i.test(all) || /\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/.test(all)) errors.push(`${who}: looks like it contains an email address or phone number; keep contact details off profiles`);
  }
  const published = TUTORS.filter(t => t.published)
    .sort((a, b) => (b.featured - a.featured) || (a.displayOrder - b.displayOrder) || a.name.localeCompare(b.name));
  return { tutors: published, all: TUTORS, errors };
}

// What the directory filters and the inquiry form offer: only what at
// least one published tutor has.
function offered(tutors) {
  const subj = new Set(tutors.flatMap(t => t.subjects));
  const groups = new Set([...subj].map(s => SUBJ[s].filter));
  const lev = new Set(tutors.flatMap(t => t.academicLevels));
  const fmt = new Set(tutors.flatMap(t => t.formats));
  return {
    subjects: SUBJECTS.filter(s => subj.has(s.id)),
    subjectFilters: SUBJECT_FILTERS.filter(f => groups.has(f.id)),
    levels: LEVELS.filter(l => lev.has(l.id)),
    formats: FORMATS.filter(f => fmt.has(f.id))
  };
}

// Card subject tags: the filter names (so Algebra 1 and 2 read "Algebra"),
// except "Other", which shows the real subject names.
function cardSubjects(t) {
  const out = [];
  for (const id of t.subjects) {
    const s = SUBJ[id];
    const label = s.filter === 'other' ? s.name : SFILT[s.filter].name;
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

// ---------- the page shell ----------
function page({ path, depth, title, description, image, body, scripts = [], noindex }) {
  const base = '../'.repeat(depth);
  return `<!DOCTYPE html>
<!-- Generated by scripts/build-tutors.mjs from content/tutors/. Don't edit
     this file: change the content (or the script) and run
     node scripts/build-tutors.mjs
     <base> makes every link below relative to the site root. -->
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<base href="${base}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE + path}">${noindex ? '\n<meta name="robots" content="noindex">' : ''}
<meta property="og:site_name" content="Mathlete MTB">
<meta property="og:type" content="${path.startsWith('tutors/') && depth === 2 && !path.includes('inquire') ? 'profile' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE + path}">
<meta property="og:image" content="${SITE}${esc(image || 'assets/photos/tutoring-1.jpg')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css?v=15">
<link rel="stylesheet" href="css/tutors.css?v=1">
</head>
<body class="tutors">
<a class="skip-link" href="${path}#main">Skip to content</a>

<nav class="site-nav" aria-label="Main">
  <div class="wrap">
    <a href="index.html" class="brand">Mathlete<span>.</span>MTB</a>
    <ul class="nav-links">
      <li><a href="index.html">The Lab</a></li>
      <li><a href="classes/">Courses</a></li>
      <li><a href="ski/">Ski</a></li>
      <li><a href="tutoring.html" class="active"><span class="nav-long">Private </span>Tutoring</a></li>
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
${scripts.map(s => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`;
}

function crumbs(items) {
  return `<nav class="tutor-crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) =>
    i === items.length - 1 ? `<li><span aria-current="page">${esc(it.label)}</span></li>` : `<li><a href="${esc(it.href)}">${esc(it.label)}</a></li>`).join('')}</ol></nav>`;
}

const contour = `<svg class="contour-field" viewBox="0 0 1100 420" preserveAspectRatio="none" aria-hidden="true">
    <path d="M-20,90 C 180,50 320,130 500,90 C 680,50 820,120 1120,80" fill="none" stroke-opacity="0.08" stroke-width="1"/>
    <path d="M-20,200 C 220,160 340,230 540,190 C 720,155 880,220 1120,185" fill="none" stroke-opacity="0.2" stroke-width="1"/>
    <path d="M-20,310 C 240,275 360,340 560,300 C 740,265 900,325 1120,290" fill="none" stroke-opacity="0.06" stroke-width="1"/>
  </svg>`;

// ---------- the tutor card (tutoring.html and the directory) ----------
export function tutorCard(t, heading = 'h3') {
  const groups = [...new Set(t.subjects.map(s => SUBJ[s].filter))];
  const fn = esc(firstName(t));
  return `
    <article class="tutor-card" data-tutor="${esc(t.slug)}" data-subjects="${esc(groups.join(' '))}" data-levels="${esc(t.academicLevels.join(' '))}" data-formats="${esc(t.formats.join(' '))}">
      <a class="tutor-card-photo" href="${profileHref(t)}" tabindex="-1" aria-hidden="true"><img src="${esc(t.image)}" alt="" width="600" height="750" loading="lazy" decoding="async"></a>
      <div class="tutor-card-body">
        <${heading} class="tutor-card-name"><a href="${profileHref(t)}">${esc(t.name)}</a></${heading}>
        <p class="tutor-card-title">${esc(t.title)}</p>
        <p class="tutor-card-intro">${esc(t.shortBio)}</p>
        <dl class="tutor-facts">
          <div><dt>Subjects</dt><dd><ul class="pill-row">${cardSubjects(t).map(s => `<li class="pill${s === 'Physics' ? ' pill--physics' : ''}">${esc(s)}</li>`).join('')}</ul></dd></div>
          <div><dt>Levels</dt><dd>${joinNames(t.academicLevels, LEV).map(esc).join(' &middot; ')}</dd></div>
          <div><dt>Interests</dt><dd>${t.interests.slice(0, 3).map(esc).join(' &middot; ')}</dd></div>
        </dl>
        <div class="tutor-card-actions">
          <a class="button" href="${profileHref(t)}" data-track="tutor_card_meet">Meet ${fn}</a>
          <a class="read-link" href="${esc(inquireHref(t))}" data-track="tutor_card_inquire">Inquire About Tutoring<span class="visually-hidden"> with ${esc(t.name)}</span></a>
        </div>
      </div>
    </article>`;
}

// ---------- tutors/ : the directory ----------
function selectFilter(id, label, options) {
  return `
        <div class="field tutor-filter">
          <label for="filter-${id}">${label}</label>
          <select class="input" id="filter-${id}" data-filter="${id}">
            <option value="">All</option>
${options.map(o => `            <option value="${esc(o.id)}">${esc(o.name)}</option>`).join('\n')}
          </select>
        </div>`;
}

function directory(model) {
  const { tutors } = model, o = offered(tutors);
  const filters = [
    o.subjectFilters.length ? selectFilter('subject', 'Subject', o.subjectFilters) : '',
    o.levels.length ? selectFilter('level', 'Academic level', o.levels) : '',
    // A format filter with one choice can't narrow anything; it appears once tutors differ.
    o.formats.length > 1 ? selectFilter('format', 'Tutoring format', o.formats) : ''
  ].join('');
  const body = `
<header class="page-head tutor-head">
  ${contour}
  <div class="wrap">
    ${crumbs([{ href: 'tutoring.html', label: 'Private Tutoring' }, { label: 'Tutors' }])}
    <p class="eyebrow">The Mathlete Team</p>
    <h1 class="page-title">Meet the Mathlete Team</h1>
    <p class="hero-lede">Great tutoring starts with a great connection. Get to know the people behind Mathlete and find someone whose experience, personality, and interests align with yours.</p>
  </div>
</header>

<section class="section" id="team" aria-labelledby="team-title">
  <div class="wrap">
    <h2 class="visually-hidden" id="team-title">Tutors</h2>
    <!-- Filters work in the browser (js/tutors.js); without JavaScript every tutor is listed. -->
    <form class="tutor-filters" id="tutor-filters" aria-label="Filter tutors" hidden>
      <div class="tutor-filter-row">${filters}
        <button class="read-link tutor-filter-clear" type="reset">Clear filters</button>
      </div>
      <p class="tutor-filter-count" id="tutor-count" role="status" aria-live="polite"></p>
    </form>
    <div class="tutor-grid" id="tutor-grid">${tutors.map(t => tutorCard(t, 'h3')).join('')}
    </div>
    <div class="tutor-empty" id="tutor-empty" hidden>
      <p><strong>No tutors match all of those yet.</strong> Try fewer filters, or tell us what you&rsquo;re looking for and we&rsquo;ll help find the right fit.</p>
      <a class="button" href="tutors/inquire/" data-track="tutor_directory_empty_inquire">Inquire About Tutoring</a>
    </div>
  </div>
</section>
${ctaBand({ title: 'Not sure who to pick?', lede: 'Tell us what the student needs and we&rsquo;ll help find the right fit.', href: 'tutors/inquire/', track: 'tutor_directory_inquire' })}`;
  return page({
    path: 'tutors/', depth: 1,
    title: 'Meet the Mathlete Tutors | Math & Physics Tutoring | Mathlete',
    description: 'Meet the Mathlete tutoring team. Find a math or physics tutor by subject and level, and learn about each tutor’s background, teaching approach and interests.',
    body, scripts: ['js/tutors.js?v=1']
  });
}

function ctaBand({ title, lede, href, track, book = true }) {
  return `
<section class="section contact contact--short tutor-cta" aria-labelledby="tutor-cta-title">
  ${contour}
  <div class="wrap">
    <p class="eyebrow">Ready to Get Started?</p>
    <h2 class="contact-title" id="tutor-cta-title">${title}</h2>
    <p class="tutor-cta-lede">${lede}</p>
    <div class="contact-links">
      <a class="button" href="${esc(href)}" data-track="${track}">Inquire About Tutoring</a>${book ? `
      <a href="book.html" data-track="book_cta_tutors">Or book a session</a>` : ''}
    </div>
  </div>
</section>`;
}

// ---------- tutors/<slug>/ : a profile ----------
function profile(t, model) {
  const fn = esc(firstName(t));
  const others = model.tutors.filter(x => x !== t);
  const subjectsByLevel = joinNames(t.subjects, SUBJ);
  const formatLine = joinNames(t.formats, FMT).join(' and ');
  const body = `
<header class="page-head tutor-profile-head">
  ${contour}
  <div class="wrap tutor-profile-top">
    <figure class="tutor-portrait">
      <img src="${esc(t.image)}" alt="${esc(t.imageAlt)}" width="600" height="750" fetchpriority="high" decoding="async">
    </figure>
    <div class="tutor-profile-intro">
      ${crumbs([{ href: 'tutoring.html', label: 'Private Tutoring' }, { href: 'tutors/', label: 'Tutors' }, { label: t.name }])}
      <p class="eyebrow">Mathlete Tutor</p>
      <h1 class="page-title tutor-name">${esc(t.name)}</h1>
      <p class="tutor-profile-title">${esc(t.title)}</p>
      <p class="hero-lede">${esc(t.shortBio)}</p>
      <div class="hero-actions">
        <a class="button" href="${esc(inquireHref(t))}" data-track="tutor_profile_inquire">Inquire About Tutoring</a>
        <a class="read-link" href="${profileHref(t)}#about">More about ${fn} <span aria-hidden="true">&darr;</span></a>
      </div>
      <dl class="tutor-quick">
        <div><dt>Teaches</dt><dd>${cardSubjects(t).map(esc).join(', ')}</dd></div>
        <div><dt>Levels</dt><dd>${joinNames(t.academicLevels, LEV).map(esc).join(', ')}</dd></div>
        <div><dt>Format</dt><dd>${esc(formatLine)}</dd></div>
      </dl>
    </div>
  </div>
</header>

<section class="section" id="about" aria-labelledby="about-title">
  <div class="wrap split">
    <h2 class="label split-label" id="about-title">About ${fn}</h2>
    <div class="prose tutor-prose">
${t.biography.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </div>
  </div>
</section>

<section class="section section--panel" id="philosophy" aria-labelledby="philosophy-title">
  <div class="wrap split">
    <h2 class="label split-label" id="philosophy-title">Teaching Philosophy</h2>
    <div class="prose tutor-prose tutor-philosophy">
${t.teachingPhilosophy.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </div>
  </div>
</section>

<section class="section" id="details" aria-labelledby="details-title">
  <div class="wrap">
    <h2 class="visually-hidden" id="details-title">Subjects, specialties and format</h2>
    <div class="tutor-detail-grid">
      <div class="tutor-detail">
        <h3 class="label">Subjects</h3>
        <ul class="pill-row">${subjectsByLevel.map(s => `<li class="pill${s === 'Physics' ? ' pill--physics' : ''}">${esc(s)}</li>`).join('')}</ul>
        <h3 class="label tutor-detail-sub">Academic levels</h3>
        <ul class="pill-row">${joinNames(t.academicLevels, LEV).map(s => `<li class="pill">${esc(s)}</li>`).join('')}</ul>
      </div>
      <div class="tutor-detail">
        <h3 class="label">Areas of Specialty</h3>
        <ul class="check-list">
${t.specialties.map(s => `          <li>${esc(s)}</li>`).join('\n')}
        </ul>
      </div>
      <div class="tutor-detail">
        <h3 class="label">Personal Interests</h3>
        <ul class="tutor-interests">${t.interests.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
      <div class="tutor-detail">
        <h3 class="label">Tutoring Format</h3>
        <dl class="tutor-format">
          <div><dt>Format</dt><dd>${esc(formatLine)}${t.formatNote ? `<br><span class="tutor-format-note">${esc(t.formatNote)}</span>` : ''}</dd></div>${t.location ? `
          <div><dt>Location</dt><dd>${esc(t.location)}</dd></div>` : ''}
          <div><dt>Scheduling</dt><dd>${t.availability ? esc(t.availability) : 'Times are arranged with you after you reach out, or you can choose one when you book.'}</dd></div>
          <div><dt>Levels</dt><dd>${joinNames(t.academicLevels, LEV).map(esc).join(', ')}</dd></div>
        </dl>
      </div>
    </div>${others.length ? `
    <p class="tutor-more"><a class="read-link" href="tutors/">Meet the rest of the team <span aria-hidden="true">&rarr;</span></a></p>` : ''}
  </div>
</section>
${ctaBand({ title: 'Let&rsquo;s find a learning approach that works for you.', lede: `Tell us a little about the student and what they need. ${fn} or the Mathlete team will get back to you.`, href: inquireHref(t), track: 'tutor_profile_inquire_footer' })}`;
  const subjectsText = cardSubjects(t).filter(s => s !== 'General Mathematics');
  const descSubjects = subjectsText.includes('Physics') ? 'mathematics and physics' : 'mathematics';
  return page({
    path: profileHref(t), depth: 2,
    title: `${t.name} | ${t.title.replace(/^Founder & /, '').replace(/ and /, ' & ')} | Mathlete`,
    description: `Meet ${t.name}, a Mathlete ${descSubjects} tutor who connects academic concepts to real-world interests and experiences.`,
    image: t.image, body
  });
}

// ---------- tutors/inquire/ : the inquiry form ----------
function inquiry(model) {
  const { tutors } = model, o = offered(tutors);
  const formats = o.formats;
  const body = `
<header class="page-head tutor-head tutor-head--short">
  ${contour}
  <div class="wrap">
    ${crumbs([{ href: 'tutoring.html', label: 'Private Tutoring' }, { href: 'tutors/', label: 'Tutors' }, { label: 'Inquire' }])}
    <p class="eyebrow">Inquire About Tutoring</p>
    <h1 class="page-title">Let&rsquo;s find the right fit.</h1>
    <p class="hero-lede">Tell us a little about the student and what they need. We&rsquo;ll reply to talk it through and help find the right tutor. This doesn&rsquo;t book a session.</p>
  </div>
</header>

<!-- ============================================================
     TUTORING INQUIRY FORM. Submissions go to the Supabase table
     public.tutoring_inquiries (supabase/tutoring.sql); read them with
     node scripts/admin.mjs inquiries. js/tutors.js validates, sends,
     and fills in the tutor from ?tutor=<slug>. If sending fails, the
     visitor is offered an email with their answers filled in.
     ============================================================ -->
<section class="section" id="inquiry" aria-labelledby="inquiry-title">
  <div class="wrap split">
    <div class="split-label inquiry-label">
      <h2 class="label inquiry-title" id="inquiry-title">Tell us about the student.</h2>
      <p class="inquiry-lede">A short note is plenty. We&rsquo;ll follow up by email.</p>
      <p class="tutor-chosen" id="tutor-chosen" hidden></p>
    </div>

    <div class="form-panel form-panel--wide">
      <div class="notice" id="inquiry-notice" tabindex="-1" hidden></div>

      <form class="form" id="tutor-inquiry-form" action="tutors/inquire/#inquiry" method="post" novalidate>
        <!-- Spam trap: people never see this field; bots fill it in. -->
        <div class="hp" aria-hidden="true">
          <label for="ti-website">Leave this empty</label>
          <input id="ti-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>

        <p class="form-note">Fields marked <span class="req" aria-hidden="true">*</span><span class="visually-hidden">with an asterisk</span> are required.</p>

        <div class="field">
          <label for="ti-name">Parent or student name <span class="req" aria-hidden="true">*</span></label>
          <input class="input" id="ti-name" name="name" type="text" autocomplete="name" maxlength="120" required aria-describedby="ti-name-error">
          <p class="field-error" id="ti-name-error" hidden></p>
        </div>

        <div class="field">
          <label for="ti-email">Email address <span class="req" aria-hidden="true">*</span></label>
          <p class="field-hint" id="ti-email-hint">If the student is under 18, please use a parent or guardian&rsquo;s email.</p>
          <input class="input" id="ti-email" name="email" type="email" autocomplete="email" maxlength="254" required aria-describedby="ti-email-hint ti-email-error">
          <p class="field-error" id="ti-email-error" hidden></p>
        </div>

        <div class="field">
          <label for="ti-level">Student&rsquo;s grade or level <span class="req" aria-hidden="true">*</span></label>
          <select class="input" id="ti-level" name="student_level" required aria-describedby="ti-level-error">
            <option value="">Choose a level</option>
${LEVELS.map(l => `            <option value="${l.id}">${esc(l.name)}</option>`).join('\n')}
            <option value="other">Other</option>
          </select>
          <p class="field-error" id="ti-level-error" hidden></p>
        </div>

        <div class="field">
          <label for="ti-subject">Subject <span class="req" aria-hidden="true">*</span></label>
          <select class="input" id="ti-subject" name="subject" required aria-describedby="ti-subject-error">
            <option value="">Choose a subject</option>
${o.subjects.map(s => `            <option value="${s.id}">${esc(s.name)}</option>`).join('\n')}
            <option value="not-sure">Not sure, or something else</option>
          </select>
          <p class="field-error" id="ti-subject-error" hidden></p>
        </div>

        <div class="field">
          <label for="ti-tutor">Preferred tutor <span class="optional">(optional)</span></label>
          <select class="input" id="ti-tutor" name="preferred_tutor">
            <option value="no-preference">No preference</option>
${tutors.map(t => `            <option value="${esc(t.slug)}">${esc(t.name)}</option>`).join('\n')}
          </select>
        </div>

        <div class="field">
          <label for="ti-help">What would you like help with? <span class="req" aria-hidden="true">*</span></label>
          <p class="field-hint" id="ti-help-hint">A sentence or two is fine: a class, an upcoming test, a topic that isn&rsquo;t clicking. Please don&rsquo;t include grades, health or financial details.</p>
          <textarea class="input" id="ti-help" name="help_with" rows="4" maxlength="2000" required aria-describedby="ti-help-hint ti-help-error"></textarea>
          <p class="field-error" id="ti-help-error" hidden></p>
        </div>

        <fieldset class="field choice-group" id="ti-format">
          <legend>Preferred tutoring format</legend>
          <div class="choices choices--row">
${formats.map(f => `            <label class="choice"><input type="radio" name="format" value="${f.id}"> ${esc(f.name)}</label>`).join('\n')}
            <label class="choice"><input type="radio" name="format" value="no-preference" checked> No preference</label>
          </div>${formats.length === 1 ? `
          <p class="field-hint">Tutoring is currently ${esc(formats[0].name.toLowerCase())}.</p>` : ''}
        </fieldset>

        <div class="field">
          <label for="ti-more">Anything else we should know? <span class="optional">(optional)</span></label>
          <textarea class="input" id="ti-more" name="additional_info" rows="3" maxlength="2000"></textarea>
        </div>

        <div class="field">
          <label class="choice choice--consent"><input type="checkbox" id="ti-consent" name="consent" value="yes" required aria-describedby="ti-consent-error"> I agree to be contacted about this inquiry. <span class="req" aria-hidden="true">*</span></label>
          <p class="field-error" id="ti-consent-error" hidden></p>
        </div>

        <div class="form-actions">
          <button class="button" type="submit" id="inquiry-button">Send inquiry</button>
        </div>
        <p class="form-note">Your details are only used to reply to this inquiry.</p>
      </form>
    </div>
  </div>
</section>`;
  return page({
    path: 'tutors/inquire/', depth: 2,
    title: 'Inquire About Tutoring | Mathlete',
    description: 'Tell the Mathlete team about the student and the subject they need help with, and we’ll help find the right tutor.',
    body, scripts: ['js/tutors.js?v=1']
  });
}

// ---------- tutoring.html : the "Meet the team" cards ----------
function tutoringCards(model) {
  const featured = model.tutors.filter(t => t.featured);
  const show = (featured.length ? featured : model.tutors).slice(0, 3);
  return show.map(t => tutorCard(t, 'h3')).join('');
}

export function render() {
  const model = loadTutors();
  if (model.errors.length) throw new Error('content/tutors has problems:\n  ' + model.errors.join('\n  '));
  const pages = {
    'tutors/index.html': directory(model),
    'tutors/inquire/index.html': inquiry(model)
  };
  for (const t of model.tutors) pages[`tutors/${t.slug}/index.html`] = profile(t, model);

  // The marked part of the hand-edited tutoring.html.
  const html = readFileSync(root + 'tutoring.html', 'utf8');
  const re = /(<!-- BUILD:tutor-cards -->)[\s\S]*?(\n *<!-- \/BUILD:tutor-cards -->)/;
  if (!re.test(html)) throw new Error('tutoring.html is missing the <!-- BUILD:tutor-cards --> markers');
  pages['tutoring.html'] = html.replace(re, (m, a, b) => a + tutoringCards(model) + b);
  return pages;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pages = render();
  const want = new Set(Object.keys(pages));
  if (existsSync(root + 'tutors')) for (const d of readdirSync(root + 'tutors')) {
    const f = `tutors/${d}/index.html`;
    if (statSync(root + 'tutors/' + d).isDirectory() && !want.has(f)) { rmSync(root + 'tutors/' + d, { recursive: true }); console.log('removed tutors/' + d + ' (not published)'); }
  }
  for (const [p, html] of Object.entries(pages)) {
    mkdirSync(root + p.replace(/[^/]+$/, ''), { recursive: true });
    writeFileSync(root + p, html);
    console.log('wrote ' + p);
  }
}
