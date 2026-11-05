// Coaching Lab pages: catalog in, HTML out. Everything from the CMS is
// plain text and goes through esc(), so nothing an editor types can add
// markup or scripts to the page.
import {
  DIFFICULTY, SAFETY, PREREQ_KIND, STAGE_KIND, primaryLesson, present, foundationChain, safetyRules,
  pathwaysFor, stageOf, pathwayShape, search, filterSkills, drillsFor, lessonsUsingDrill
} from './core.js';
import { mediaCard } from './player.js';

export const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const q = encodeURIComponent;

export const href = {
  home: 'coaching/', skills: 'coaching/skills/', disciplines: 'coaching/disciplines/', progressions: 'coaching/progressions/',
  skill: id => 'coaching/skill/?s=' + q(id), drill: id => 'coaching/drill/?d=' + q(id),
  discipline: id => 'coaching/disciplines/?d=' + q(id), pathway: id => 'coaching/progressions/?p=' + q(id),
  search: text => 'coaching/skills/?q=' + q(text)
};

const paras = t => String(t || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
const list = (items, cls = '') => (items && items.length) ? `<ul class="${cls}">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function draftFlag(item) {
  const s = item && item._status;
  if (!s || s === 'published') return '';
  return `<span class="flag flag--draft">${s === 'submitted' ? 'In review' : s === 'approved' ? 'Approved, not published' : 'Draft'}</span>`;
}

export function safetyBadge(cls) {
  const c = Number(cls) || 1;
  return `<span class="safety safety--c${c}"><span class="safety-num" aria-hidden="true">${c}</span><span><span class="visually-hidden">Safety class ${c}: </span>${esc(SAFETY[c].short)}</span></span>`;
}
const levelPill = d => `<span class="pill">${esc(DIFFICULTY[d] || d)}</span>`;

function disciplineNames(idx, s) {
  return (s.disciplines || []).map(d => idx.disciplines.get(d.id)).filter(Boolean).map(d => d.name);
}

export function skillCard(idx, s, extra = '') {
  const lesson = primaryLesson(idx, s.id);
  return `<article class="skill-card">
    <p class="kicker">${esc(disciplineNames(idx, s)[0] || 'Skill')} ${draftFlag(s)}</p>
    <h3 class="skill-card-title"><a href="${href.skill(s.id)}">${esc(s.name)}</a></h3>
    <p class="skill-card-desc">${esc(s.summary)}</p>
    <div class="skill-card-meta">${levelPill(s.difficulty)}${safetyBadge(s.safety_class)}${lesson ? '' : '<span class="pill pill--quiet">Lesson coming</span>'}</div>
    ${extra}
  </article>`;
}

function crumbs(items) {
  return `<nav class="coach-crumbs" aria-label="Breadcrumb"><ol>${items.map(([t, h]) =>
    h ? `<li><a href="${h}">${esc(t)}</a></li>` : `<li aria-current="page">${esc(t)}</li>`).join('')}</ol></nav>`;
}

function head({ eyebrow, title, lede, extra = '', crumbs: c = '' }) {
  return `<header class="page-head coach-head">
    <div class="wrap">${c}
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="page-title">${esc(title)}</h1>
      ${lede ? `<p class="hero-lede">${esc(lede)}</p>` : ''}
      ${extra}
    </div>
  </header>`;
}

export function sourceBanner(source) {
  if (source === 'seed') return `<div class="coach-banner coach-banner--draft" role="note"><div class="wrap"><strong>Local preview.</strong> You're seeing the starter drafts from <code>content/coaching/seed.json</code>. None of it has been reviewed by a coach, and none of it appears on the live site until it's published in the CMS.</div></div>`;
  if (source === 'preview') return `<div class="coach-banner coach-banner--draft" role="note"><div class="wrap"><strong>Preview mode.</strong> Showing drafts and unpublished changes. Riders only see published content. <a href="?preview=0">Leave preview</a></div></div>`;
  return '';
}

export function unavailable(source) {
  const body = source === 'not-configured'
    ? 'The Coaching Lab needs the site\'s database connection, which isn\'t set up on this copy of the site.'
    : 'We couldn\'t load the coaching library just now. Check your connection and try again in a moment.';
  return head({ eyebrow: 'Coaching Lab', title: 'Coaching Lab', lede: body }) +
    `<section class="section"><div class="wrap"><a class="button" href="${href.home}">Try again</a></div></section>`;
}

export function notFound(what, back = href.home) {
  return head({ eyebrow: 'Coaching Lab', title: 'Not found', lede: `That ${what} isn't in the library, or it hasn't been published yet.` }) +
    `<section class="section"><div class="wrap"><a class="button" href="${back}">Back to the Coaching Lab</a></div></section>`;
}

function searchForm(value = '', big = false) {
  return `<form class="coach-search${big ? ' coach-search--big' : ''}" action="coaching/skills/" method="get" role="search">
    <label for="coach-q" class="${big ? 'coach-search-label' : 'visually-hidden'}">What do you want to learn?</label>
    <div class="coach-search-row">
      <input id="coach-q" name="q" type="search" value="${esc(value)}" placeholder="e.g. how do I manual?" autocomplete="off" enterkeyhint="search">
      <button class="button" type="submit">Search</button>
    </div>
  </form>`;
}

// ---------------------------------------------------------------- home
export function renderHome(idx) {
  const examples = ['How do I manual?', 'I want to jump higher', 'Improve my cornering', 'Get comfortable on steep trails', 'Learn a 360'];
  const featured = [...idx.skills.values()].filter(s => s.featured);
  const popular = (featured.length ? featured : [...idx.skills.values()]).slice(0, 6);
  const disciplines = [...idx.disciplines.values()];
  const pathways = [...idx.pathways.values()];
  const coaches = [...idx.people.values()].filter(p => p.verified);
  return `
  <header class="page-head coach-hero">
    <div class="wrap">
      <p class="eyebrow">Coaching &amp; Progression Lab</p>
      <h1 class="page-title">Learn. Understand.<br>Practice. Progress.</h1>
      <p class="hero-lede">Mountain bike skills broken down into what to do, why it works, and exactly what to practise next.</p>
      ${searchForm('', true)}
      <ul class="chip-row" aria-label="Example questions">${examples.map(e => `<li><a class="chip" href="${href.search(e)}" data-track="coaching_example_search">${esc(e)}</a></li>`).join('')}</ul>
    </div>
  </header>

  <section class="section" aria-labelledby="disc-title">
    <div class="wrap">
      <div class="coach-section-head"><h2 class="label" id="disc-title">Browse by discipline</h2><a class="read-link" href="${href.disciplines}">All disciplines <span aria-hidden="true">&rarr;</span></a></div>
      <ul class="disc-grid">${disciplines.map(d => {
        const n = (idx.skillsByDiscipline.get(d.id) || []).length;
        return `<li><a class="disc-tile" href="${href.discipline(d.id)}" data-track="discipline_selected">
          <span class="disc-name">${esc(d.name)}</span><span class="disc-sum">${esc(d.summary)}</span>
          <span class="meta">${n ? plural(n, 'skill', 'skills') : 'Coming soon'}</span></a></li>`;
      }).join('')}</ul>
    </div>
  </section>

  ${popular.length ? `<section class="section section--panel" aria-labelledby="pop-title">
    <div class="wrap">
      <div class="coach-section-head"><h2 class="label" id="pop-title">Popular skills</h2><a class="read-link" href="${href.skills}">Explore all skills <span aria-hidden="true">&rarr;</span></a></div>
      <div class="skill-grid">${popular.map(s => skillCard(idx, s)).join('')}</div>
    </div>
  </section>` : ''}

  ${pathways.length ? `<section class="section" aria-labelledby="path-title">
    <div class="wrap">
      <div class="coach-section-head"><h2 class="label" id="path-title">Progression pathways</h2><a class="read-link" href="${href.progressions}">All pathways <span aria-hidden="true">&rarr;</span></a></div>
      <div class="path-grid">${pathways.map(p => pathwayCard(idx, p)).join('')}</div>
    </div>
  </section>` : ''}

  <section class="section section--panel" aria-labelledby="comp-title">
    <div class="wrap">
      <div class="coach-section-head"><h2 class="label" id="comp-title">Six foundations under every skill</h2></div>
      <p class="coach-intro">Every maneuver in the Lab is built from the same six competencies. When a skill isn't clicking, the fix is usually one of these.</p>
      <ol class="comp-list">${[...idx.competencies.values()].map(c => `<li><strong>${esc(c.name)}</strong><span>${esc(c.description)}</span></li>`).join('')}</ol>
    </div>
  </section>

  ${coaches.length ? `<section class="section" aria-labelledby="coach-title"><div class="wrap">
    <div class="coach-section-head"><h2 class="label" id="coach-title">Coaches</h2></div>
    <ul class="people-grid">${coaches.map(personCard).join('')}</ul></div></section>` : ''}

  <section class="section" aria-labelledby="soon-title">
    <div class="wrap soon-grid">
      <div><h2 class="label" id="soon-title">Coming next</h2></div>
      <div class="soon-card"><p class="kicker"><span class="kicker-flag">Soon</span></p><h3>Practice Studio</h3><p>Build a 10&ndash;60 minute practice session for any skill and work through it on your phone at the trail.</p></div>
      <div class="soon-card"><p class="kicker"><span class="kicker-flag">Soon</span></p><h3>My Development</h3><p>Save skills, mark lessons complete, log practice and see your progress across the six foundations.</p></div>
    </div>
  </section>`;
}

function personCard(p) {
  return `<li class="person"><p class="person-name">${esc(p.name)}${p.verified ? ' <span class="flag flag--ok">Verified coach</span>' : ''}</p>
    ${p.credentials ? `<p class="meta">${esc(p.credentials)}</p>` : ''}${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</li>`;
}

function pathwayCard(idx, p) {
  const target = idx.skills.get(p.target_skill_id);
  return `<article class="path-card">
    <p class="kicker">${target ? 'Goal: ' + esc(target.name) : 'Pathway'} ${draftFlag(p)}</p>
    <h3 class="skill-card-title"><a href="${href.pathway(p.id)}">${esc(p.name)}</a></h3>
    <p class="skill-card-desc">${esc(p.description)}</p>
    <p class="meta">${plural((p.stages || []).length, 'stage', 'stages')} · ${esc(pathwayShape(p).join(' · '))}</p>
  </article>`;
}

// ---------------------------------------------------------------- explore + search
export function renderSkills(idx, params) {
  const text = (params.get('q') || '').trim();
  const f = { discipline: params.get('d') || '', difficulty: params.get('level') || '', safety: params.get('class') || '', competency: params.get('c') || '' };
  const opt = (v, l, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`;
  const filters = `<form class="coach-filters" action="coaching/skills/" method="get" aria-label="Filter skills">
    <label>Discipline<select name="d">${opt('', 'All', f.discipline)}${[...idx.disciplines.values()].map(d => opt(d.id, d.name, f.discipline)).join('')}</select></label>
    <label>Level<select name="level">${opt('', 'All', f.difficulty)}${Object.entries(DIFFICULTY).map(([k, v]) => opt(k, v, f.difficulty)).join('')}</select></label>
    <label>Safety class<select name="class">${opt('', 'All', f.safety)}${[1, 2, 3].map(c => opt(String(c), SAFETY[c].label, f.safety)).join('')}</select></label>
    <label>Foundation<select name="c">${opt('', 'All', f.competency)}${[...idx.competencies.values()].map(c => opt(c.id, c.name, f.competency)).join('')}</select></label>
    <button class="button button--small" type="submit">Filter</button>
  </form>`;

  if (text) {
    const r = search(idx, text);
    let body;
    if (!r.skills.length && !r.planned.length) {
      body = `<p class="coach-empty">Nothing matched &ldquo;${esc(text)}&rdquo; yet. Try describing the skill differently, or <a href="${href.skills}">browse every skill</a>.</p>`;
    } else {
      const best = r.best;
      const bestLesson = best && primaryLesson(idx, best.id);
      body = `
      ${best ? `<div class="search-best">
        <p class="kicker">Best match</p>
        <h2 class="search-best-title"><a href="${href.skill(best.id)}" data-track="recommendation_selected">${esc(best.name)}</a></h2>
        <p>${esc(best.summary)}</p>
        <div class="skill-card-meta">${levelPill(best.difficulty)}${safetyBadge(best.safety_class)}</div>
        ${r.foundations.length ? `<p class="search-why"><strong>Start with the foundations.</strong> ${esc(best.name)} builds on ${r.foundations.map(s => `<a href="${href.skill(s.id)}" data-track="recommendation_selected">${esc(s.name)}</a>`).join(', ')}. If any of those feel shaky, begin there.</p>` : ''}
        ${r.pathways.length ? `<p class="search-why"><strong>Follow a pathway.</strong> ${r.pathways.map(p => `<a href="${href.pathway(p.id)}" data-track="recommendation_selected">${esc(p.name)}</a>`).join(', ')} takes you there step by step.</p>` : ''}
        <a class="button" href="${href.skill(best.id)}" data-track="recommendation_selected">${bestLesson ? 'Open the lesson' : 'View the skill'} <span aria-hidden="true">&rarr;</span></a>
      </div>` : ''}
      ${r.skills.length > 1 ? `<h2 class="label coach-sub">Also related</h2><div class="skill-grid">${r.skills.slice(1).map(x => skillCard(idx, x.skill)).join('')}</div>` : ''}
      ${r.planned.length ? `<div class="search-planned"><h2 class="label coach-sub">On the roadmap</h2>
        <p>These aren't in the library yet:</p>
        <ul>${r.planned.map(p => `<li><strong>${esc(p.topic)}</strong> in <a href="${href.discipline(p.discipline.id)}">${esc(p.discipline.name)}</a>${p.discipline.id === 'slopestyle' ? '. Aerial tricks will be taught as high-consequence (Class 3) content: learn the theory here, practise with a specialist coach.' : ''}</li>`).join('')}</ul>
        ${r.planned.some(p => ['slopestyle', 'jumping', 'dirt-jumping'].includes(p.discipline.id)) && idx.skills.has('jumping') ? `<p>In the meantime, every aerial skill starts with <a href="${href.skill('jumping')}">Jumping Fundamentals</a>.</p>` : ''}
      </div>` : ''}`;
    }
    return head({ eyebrow: 'Explore skills', title: 'Search', crumbs: crumbs([['Coaching Lab', href.home], ['Explore skills', href.skills], ['Search']]), extra: searchForm(text) }) +
      `<section class="section"><div class="wrap">${body}</div></section>`;
  }

  const results = filterSkills(idx, f);
  return head({ eyebrow: 'Coaching Lab', title: 'Explore skills', lede: 'Every skill in the library, from foundations up.', crumbs: crumbs([['Coaching Lab', href.home], ['Explore skills']]), extra: searchForm('') }) +
    `<section class="section" aria-labelledby="results-t"><div class="wrap"><h2 class="visually-hidden" id="results-t">Skills</h2>${filters}
      <p class="meta coach-count" aria-live="polite">${plural(results.length, 'skill', 'skills')}</p>
      ${results.length ? `<div class="skill-grid">${results.map(s => skillCard(idx, s)).join('')}</div>` : '<p class="coach-empty">No skills match those filters yet.</p>'}
    </div></section>`;
}

// ---------------------------------------------------------------- disciplines
export function renderDisciplines(idx, params) {
  const id = params.get('d');
  if (!id) {
    return head({ eyebrow: 'Coaching Lab', title: 'Disciplines', lede: 'Choose the kind of riding you want to get better at.', crumbs: crumbs([['Coaching Lab', href.home], ['Disciplines']]) }) +
      `<section class="section"><div class="wrap"><ul class="disc-grid">${[...idx.disciplines.values()].map(d => {
        const n = (idx.skillsByDiscipline.get(d.id) || []).length;
        return `<li><a class="disc-tile" href="${href.discipline(d.id)}" data-track="discipline_selected"><span class="disc-name">${esc(d.name)}</span><span class="disc-sum">${esc(d.summary)}</span><span class="meta">${n ? plural(n, 'skill', 'skills') : 'Coming soon'}</span></a></li>`;
      }).join('')}</ul></div></section>`;
  }
  const d = idx.disciplines.get(id);
  if (!d) return notFound('discipline', href.disciplines);
  const skills = filterSkills(idx, { discipline: id });
  const have = new Set(skills.map(s => s.name.toLowerCase()));
  const planned = (d.planned_topics || []).filter(t => !have.has(t.toLowerCase()));
  return head({ eyebrow: 'Discipline', title: d.name, lede: d.summary, crumbs: crumbs([['Coaching Lab', href.home], ['Disciplines', href.disciplines], [d.name]]) }) +
    `<section class="section"><div class="wrap">
      ${d.description ? `<div class="coach-prose">${paras(d.description)}</div>` : ''}
      ${d.id === 'slopestyle' ? `<div class="coach-callout coach-callout--c3"><p><strong>High-consequence riding.</strong> Spins, flips and advanced aerial tricks are Class 3 content. You can learn how they work here, but practise them only with a qualified specialist coach in a purpose-built environment.</p></div>` : ''}
      <h2 class="label coach-sub">${skills.length ? 'Skills' : 'Skills are on the way'}</h2>
      ${skills.length ? `<div class="skill-grid">${skills.map(s => skillCard(idx, s)).join('')}</div>` : '<p class="coach-empty">There are no published lessons in this discipline yet. Start with the foundations below.</p>'}
      ${planned.length ? `<h2 class="label coach-sub">Coming to the library</h2><ul class="planned-list">${planned.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    </div></section>`;
}

// ---------------------------------------------------------------- progressions
export function renderProgressions(idx, params) {
  const id = params.get('p');
  if (!id) {
    const all = [...idx.pathways.values()];
    return head({ eyebrow: 'Coaching Lab', title: 'Progressions', lede: 'Step-by-step pathways from the foundations to a target skill.', crumbs: crumbs([['Coaching Lab', href.home], ['Progressions']]) }) +
      `<section class="section"><div class="wrap">${all.length ? `<div class="path-grid">${all.map(p => pathwayCard(idx, p)).join('')}</div>` : '<p class="coach-empty">No pathways are published yet.</p>'}</div></section>`;
  }
  const p = idx.pathways.get(id);
  if (!p) return notFound('pathway', href.progressions);
  const target = idx.skills.get(p.target_skill_id);
  const cls = target ? Number(target.safety_class) : 1;
  return head({ eyebrow: target ? 'Pathway to ' + target.name : 'Pathway', title: p.name, lede: p.description,
      crumbs: crumbs([['Coaching Lab', href.home], ['Progressions', href.progressions], [p.name]]),
      extra: `<div class="skill-card-meta">${pathwayShape(p).map(t => `<span class="pill">${esc(t)}</span>`).join('')}${target ? safetyBadge(cls) : ''} ${draftFlag(p)}</div>` }) +
    `<section class="section"><div class="wrap">
      ${cls === 3 ? `<div class="coach-callout coach-callout--c3"><p><strong>${esc(SAFETY[3].label)}.</strong> ${esc(SAFETY[3].text)}</p></div>` : ''}
      <h2 class="visually-hidden">Stages</h2>
      ${pathwayStages(idx, p)}
      <p class="coach-note">Readiness criteria are an honest check for you or your coach. Reading a lesson or ticking a box here never means you're ready for the next stage on the bike.</p>
    </div></section>`;
}

function pathwayStages(idx, p, currentLessonId = null) {
  return `<ol class="stages">${(p.stages || []).map((st, i) => {
    const lessons = present(idx.lessons, st.lessons);
    const here = currentLessonId && (st.lessons || []).includes(currentLessonId);
    return `<li class="stage${here ? ' stage--here' : ''}${st.kind === 'optional' ? ' stage--optional' : ''}">
      <div class="stage-num" aria-hidden="true">${i + 1}</div>
      <div class="stage-body">
        <p class="kicker">${esc(STAGE_KIND[st.kind] || 'Stage')}${st.mode === 'any' && lessons.length > 1 ? ' · Choose any one' : ''}${st.practical ? ' · On the bike' : ' · Learn'}${st.supervision ? ' · <span class="flag flag--coach">Coach supervised</span>' : ''}${here ? ' · <span class="flag flag--here">You are here</span>' : ''}</p>
        <h3 class="stage-title">${esc(st.title)}</h3>
        ${st.description ? `<p>${esc(st.description)}</p>` : ''}
        ${lessons.length ? `<ul class="stage-lessons">${lessons.map(l => {
          const s = idx.skills.get(l.skill_id);
          return `<li><a href="${href.skill(l.skill_id)}">${esc(l.title)}</a>${s ? ' ' + safetyBadge(s.safety_class) : ''}</li>`;
        }).join('')}</ul>` : ''}
        ${(st.readiness || []).length ? `<div class="stage-ready"><p class="meta">Ready to move on when</p>${list(st.readiness, 'checks')}</div>` : ''}
      </div>
    </li>`;
  }).join('')}</ol>`;
}

// ---------------------------------------------------------------- skill page
export function renderSkill(idx, id) {
  const s = idx.skills.get(id);
  if (!s) return notFound('skill', href.skills);
  const lesson = primaryLesson(idx, id);
  const rules = safetyRules(s, lesson);
  const discs = (s.disciplines || []).map(d => idx.disciplines.get(d.id)).filter(Boolean);
  const media = lesson ? present(idx.media, lesson.media) : [];
  const drills = lesson ? drillsFor(idx, [lesson]) : [];
  const mistakes = lesson ? present(idx.mistakes, lesson.mistakes) : [];
  const prereqs = (s.prerequisites || []).filter(p => idx.skills.has(p.id));
  const chain = foundationChain(idx, id);
  const leadsTo = (idx.dependents.get(id) || []).map(d => idx.skills.get(d.id)).filter(Boolean);
  const related = present(idx.skills, s.related);
  const paths = pathwaysFor(idx, id);
  const people = lesson ? (lesson.contributors || []).map(c => ({ ...c, person: idx.people.get(c.id) })).filter(c => c.person) : [];
  const ROLE = { author: 'Written by', reviewer: 'Reviewed by', 'demo-rider': 'Demonstrated by', coach: 'Coach' };

  const toc = [['why', 'Why it matters'], lesson && ['physics', 'Physics'], ['watch', 'Watch'], lesson && ['technique', 'Technique'],
    ['before', 'Before you start'], mistakes.length && ['mistakes', 'Mistakes'], ['drills', 'Drills'], ['pathway', 'Progression'], ['safety', 'Safety']]
    .filter(Boolean);

  const safetyBlock = lesson ? renderSafety(lesson, rules) : `<section class="coach-block" id="safety" aria-labelledby="safety-t"><h2 class="label" id="safety-t">Safety</h2><p>${esc(rules.info.text)}</p></section>`;

  return `
  <header class="page-head coach-head coach-head--skill">
    <div class="wrap">
      ${crumbs([['Coaching Lab', href.home], [discs[0] ? discs[0].name : 'Skills', discs[0] ? href.discipline(discs[0].id) : href.skills], [s.name]])}
      <p class="eyebrow">${esc(discs[0] ? discs[0].name : 'Skill')}</p>
      <h1 class="page-title">${esc(s.name)} ${draftFlag(s)}</h1>
      <p class="hero-lede">${esc(s.summary)}</p>
      <dl class="skill-facts">
        <div><dt>Level</dt><dd>${esc(DIFFICULTY[s.difficulty] || s.difficulty)}</dd></div>
        <div><dt>Safety</dt><dd>${safetyBadge(s.safety_class)}</dd></div>
        <div><dt>Where</dt><dd>${esc(s.environment)}</dd></div>
        ${discs.length > 1 ? `<div><dt>Also in</dt><dd>${discs.slice(1).map(d => `<a href="${href.discipline(d.id)}">${esc(d.name)}</a>`).join(', ')}</dd></div>` : ''}
        ${(s.bike_types || []).length ? `<div><dt>Bikes</dt><dd>${esc(s.bike_types.join(', '))}</dd></div>` : ''}
        ${s.learning_commitment ? `<div><dt>Commitment</dt><dd>${esc(s.learning_commitment)}</dd></div>` : ''}
      </dl>
      <nav class="chip-row coach-toc" aria-label="On this page">${toc.map(([a, t]) => `<a class="chip" href="${href.skill(id)}#${a}">${esc(t)}</a>`).join('')}</nav>
    </div>
  </header>

  <div class="coach-callout coach-callout--c${rules.cls} coach-safety-strip" data-safety-class="${rules.cls}"><div class="wrap">
    <p><strong>${esc(rules.info.label)}.</strong> ${esc(rules.info.text)}</p>
  </div></div>

  <div class="wrap coach-skill">
    ${rules.showProtectiveFirst && lesson ? safetyBlock : ''}

    <section class="coach-block" id="why" aria-labelledby="why-t">
      <h2 class="label" id="why-t">Why this skill matters</h2>
      <div class="coach-prose">${paras(s.why_it_matters)}${lesson ? paras(lesson.introduction) : ''}</div>
      ${lesson && (lesson.objectives || []).length ? `<div class="objectives"><p class="meta">By the end of this lesson you can</p>${list(lesson.objectives, 'checks')}</div>` : ''}
      ${!lesson ? '<p class="coach-empty">The full lesson for this skill is still being written.</p>' : ''}
    </section>

    ${lesson ? renderPhysics(lesson) : ''}

    <section class="coach-block" id="watch" aria-labelledby="watch-t">
      <h2 class="label" id="watch-t">Expert demonstration</h2>
      ${media.length ? `<div class="video-grid">${media.map(m => mediaCard(m)).join('')}</div>`
        : `<div class="video-placeholder"><p><strong>Demonstration videos are being filmed.</strong> Until then, the technique breakdown below walks through each stage.</p></div>`}
    </section>

    ${lesson ? renderTechnique(lesson, idx) : ''}

    <section class="coach-block" id="before" aria-labelledby="before-t">
      <h2 class="label" id="before-t">Before you start</h2>
      ${prereqs.length ? ['required', 'recommended', 'optional'].map(kind => {
        const group = prereqs.filter(p => p.kind === kind).map(p => idx.skills.get(p.id));
        return group.length ? `<div class="prereq-group prereq-group--${kind}"><p class="kicker">${esc(PREREQ_KIND[kind])}</p>
          <ul class="prereq-list">${group.map(p => `<li><a href="${href.skill(p.id)}">${esc(p.name)}</a> ${safetyBadge(p.safety_class)}</li>`).join('')}</ul></div>` : '';
      }).join('') : '<p>No prerequisites: this is a starting point.</p>'}
      ${chain.length > prereqs.length ? `<details class="coach-more"><summary class="read-link">The full foundation path</summary>
        <ol class="chain">${chain.slice().reverse().map(c => { const x = idx.skills.get(c.id); return `<li><a href="${href.skill(c.id)}">${esc(x.name)}</a> <span class="meta">${esc(PREREQ_KIND[c.kind])}</span></li>`; }).join('')}<li><strong>${esc(s.name)}</strong></li></ol></details>` : ''}
      ${(s.competencies || []).length ? `<div class="comp-tags"><p class="meta">Builds these foundations</p><ul class="pill-row">${s.competencies.map(c => idx.competencies.get(c.id)).filter(Boolean).map(c => `<li class="pill${''}">${esc(c.name)}</li>`).join('')}</ul></div>` : ''}
    </section>

    ${mistakes.length ? `<section class="coach-block" id="mistakes" aria-labelledby="mistakes-t">
      <h2 class="label" id="mistakes-t">Common mistakes</h2>
      <div class="mistake-grid">${mistakes.map(m => mistakeCard(idx, m)).join('')}</div>
    </section>` : ''}

    <section class="coach-block" id="drills" aria-labelledby="drills-t">
      <h2 class="label" id="drills-t">${rules.selfGuidedPractice ? 'Practice drills' : 'Coach-led drills'}</h2>
      ${!rules.selfGuidedPractice ? `<div class="coach-callout coach-callout--c3"><p>These drills are here so you know what to expect. Do them only with a qualified specialist coach in a purpose-built training environment.</p></div>` : ''}
      ${drills.length ? `<div class="drill-list">${drills.map(d => drillCard(idx, d, rules)).join('')}</div>` : '<p class="coach-empty">Drills for this skill are on the way.</p>'}
    </section>

    <section class="coach-block" id="pathway" aria-labelledby="pathway-t">
      <h2 class="label" id="pathway-t">Progression</h2>
      ${paths.target.length || paths.includes.length ? [...paths.target, ...paths.includes].slice(0, 3).map(p => `
        <div class="path-inline"><p class="kicker">${p.target_skill_id === id ? 'Pathway to this skill' : 'Part of'}</p>
        <h3 class="stage-title"><a href="${href.pathway(p.id)}">${esc(p.name)}</a></h3>
        ${pathwayStages(idx, p, lesson && lesson.id)}</div>`).join('') : ''}
      ${leadsTo.length ? `<div class="leads-to"><p class="kicker">What to learn next</p><ul class="prereq-list">${leadsTo.map(x => `<li><a href="${href.skill(x.id)}" data-track="recommendation_selected">${esc(x.name)}</a> ${safetyBadge(x.safety_class)}</li>`).join('')}</ul></div>` : ''}
      ${related.length ? `<div class="leads-to"><p class="kicker">Related skills</p><ul class="prereq-list">${related.map(x => `<li><a href="${href.skill(x.id)}">${esc(x.name)}</a></li>`).join('')}</ul></div>` : ''}
      ${!paths.target.length && !paths.includes.length && !leadsTo.length ? '<p>Pathways that include this skill are on the way.</p>' : ''}
    </section>

    ${rules.showProtectiveFirst && lesson ? '' : safetyBlock}

    <section class="coach-block coach-done" id="complete" aria-labelledby="done-t">
      <h2 class="label" id="done-t">After this lesson</h2>
      <p>Understanding a skill and being able to ride it are different things. Take the drills above to a suitable practice area and build up gradually.</p>
      <p class="meta">Coming soon with My Development: save this skill, mark the lesson complete, rate your understanding and log your practice.</p>
      ${people.length ? `<p class="credits">${people.map(c => `${esc(ROLE[c.role] || 'By')} <strong>${esc(c.person.name)}</strong>${c.person.verified ? '' : ''}`).join(' · ')}</p>` : ''}
    </section>
  </div>`;
}

function renderPhysics(lesson) {
  const ph = lesson.physics || {};
  const blocks = ph.blocks || [];
  if (!blocks.length && !ph.summary) return '';
  return `<section class="coach-block coach-physics" id="physics" aria-labelledby="physics-t">
    <h2 class="label" id="physics-t">Understand the physics</h2>
    ${ph.summary ? `<p class="physics-summary">${esc(ph.summary)}</p>` : ''}
    ${(ph.concepts || []).length ? `<ul class="pill-row" aria-label="Concepts">${ph.concepts.map(c => `<li class="pill pill--physics">${esc(c)}</li>`).join('')}</ul>` : ''}
    ${blocks.map(b => `<div class="physics-block"><h3>${esc(b.heading)}</h3><div class="coach-prose">${paras(b.body)}</div>${b.demo ? `<div data-demo="${esc(b.demo)}"></div>` : ''}</div>`).join('')}
  </section>`;
}

function renderTechnique(lesson, idx) {
  const stages = lesson.technique || [];
  if (!stages.length) return '';
  return `<section class="coach-block" id="technique" aria-labelledby="technique-t">
    <h2 class="label" id="technique-t">Technique breakdown</h2>
    <ol class="tech-stages">${stages.map((t, i) => {
      const m = t.media_id && idx.media.get(t.media_id);
      return `<li class="tech-stage">
        <div class="stage-num" aria-hidden="true">${i + 1}</div>
        <div class="stage-body">
          <h3 class="stage-title">${esc(t.title)}</h3>
          ${t.result ? `<p class="tech-result"><span class="meta">The goal</span> ${esc(t.result)}</p>` : ''}
          ${t.movement ? `<p>${esc(t.movement)}</p>` : ''}
          ${t.interaction ? `<p class="tech-why"><span class="meta">Bike and rider</span> ${esc(t.interaction)}</p>` : ''}
          ${(t.cues || []).length ? `<div class="cues"><p class="meta">Coaching cues</p><ul>${t.cues.map(c => `<li>&ldquo;${esc(c)}&rdquo;</li>`).join('')}</ul></div>` : ''}
          ${(t.errors || []).length ? `<p class="tech-errors"><span class="meta">Watch for</span> ${esc(t.errors.join('; '))}</p>` : ''}
          ${m ? mediaCard(m, { compact: true }) : ''}
        </div>
      </li>`;
    }).join('')}</ol>
  </section>`;
}

function renderSafety(lesson, rules) {
  const s = lesson.safety || {};
  const row = (t, items) => (items && items.length) ? `<div><h3>${t}</h3>${list(items)}</div>` : '';
  return `<section class="coach-block coach-safety coach-safety--c${rules.cls}" id="safety" aria-labelledby="safety-t" data-safety-class="${rules.cls}">
    <h2 class="label" id="safety-t">Safety</h2>
    ${rules.needsSupervision ? `<p class="coach-callout coach-callout--c3"><strong>Coach supervision required.</strong> Practise this only with a qualified coach present.</p>` : ''}
    <div class="safety-grid">
      ${row('Wear', s.protective)}
      ${row('Bring', s.equipment)}
      ${row('Where to practise', s.environments)}
      ${row('Conditions', s.conditions)}
      ${row('Stop if', s.stop_conditions)}
    </div>
    ${(s.warnings || []).length ? `<div class="safety-warnings">${s.warnings.map(w => `<p><strong>Warning.</strong> ${esc(w)}</p>`).join('')}</div>` : ''}
  </section>`;
}

function mistakeCard(idx, m) {
  const d = m.drill_id && idx.drills.get(m.drill_id);
  return `<article class="mistake">
    <h3 class="mistake-name">${esc(m.name)} ${draftFlag(m)}</h3>
    <p>${esc(m.description)}</p>
    ${m.looks_like ? `<p><span class="meta">What it looks like</span> ${esc(m.looks_like)}</p>` : ''}
    ${m.cause ? `<p><span class="meta">Why it happens</span> ${esc(m.cause)}</p>` : ''}
    <p class="mistake-fix"><span class="meta">The fix</span> ${esc(m.correction)}</p>
    ${d ? `<p><span class="meta">Practise with</span> <a href="${href.drill(d.id)}">${esc(d.name)}</a></p>` : ''}
    ${m.media_id && idx.media.get(m.media_id) ? mediaCard(idx.media.get(m.media_id), { compact: true }) : ''}
  </article>`;
}

function drillFacts(d) {
  return `<dl class="drill-facts">
    ${d.level ? `<div><dt>Level</dt><dd>${esc(DIFFICULTY[d.level] || d.level)}</dd></div>` : ''}
    ${d.duration_min ? `<div><dt>Time</dt><dd>${esc(d.duration_min)} min</dd></div>` : ''}
    ${d.reps ? `<div><dt>Reps</dt><dd>${esc(d.reps)}</dd></div>` : ''}
    ${d.environment ? `<div><dt>Where</dt><dd>${esc(d.environment)}</dd></div>` : ''}
  </dl>`;
}

function drillBody(idx, d, h = 'h4') {
  const next = d.next_drill_id && idx.drills.get(d.next_drill_id);
  const m = d.media_id && idx.media.get(d.media_id);
  return `${d.description ? paras(d.description) : ''}
    ${m ? mediaCard(m, { compact: true }) : ''}
    ${(d.steps || []).length ? `<${h}>Steps</${h}><ol class="drill-steps">${d.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
    <div class="drill-cols">
      ${(d.success || []).length ? `<div><${h}>You've got it when</${h}>${list(d.success, 'checks')}</div>` : ''}
      ${(d.safety || []).length ? `<div><${h}>Safety</${h}>${list(d.safety)}</div>` : ''}
      ${(d.equipment || []).length ? `<div><${h}>Equipment</${h}>${list(d.equipment)}</div>` : ''}
      ${(d.common_errors || []).length ? `<div><${h}>Common errors</${h}>${list(d.common_errors)}</div>` : ''}
    </div>
    ${next ? `<p class="drill-next"><span class="meta">Next progression</span> <a href="${href.drill(next.id)}">${esc(next.name)}</a></p>` : ''}`;
}

function drillCard(idx, d, rules) {
  return `<details class="drill"${rules && !rules.selfGuidedPractice ? ' data-coach-led' : ''}>
    <summary>
      <span class="drill-head"><h3 class="drill-name">${esc(d.name)} ${draftFlag(d)}</h3><span class="drill-obj">${esc(d.objective)}</span></span>
      ${drillFacts(d)}
    </summary>
    <div class="drill-body">${drillBody(idx, d)}<p><a class="read-link" href="${href.drill(d.id)}">Open this drill on its own page <span aria-hidden="true">&rarr;</span></a></p></div>
  </details>`;
}

// ---------------------------------------------------------------- drill page
export function renderDrill(idx, id) {
  const d = idx.drills.get(id);
  if (!d) return notFound('drill', href.skills);
  const users = lessonsUsingDrill(idx, id);
  const hardest = users.map(l => idx.skills.get(l.skill_id)).filter(Boolean).reduce((m, s) => Math.max(m, Number(s.safety_class) || 1), 1);
  return head({ eyebrow: 'Practice drill', title: d.name, lede: d.objective,
      crumbs: crumbs([['Coaching Lab', href.home], ['Explore skills', href.skills], [d.name]]),
      extra: `${drillFacts(d)} ${draftFlag(d)}` }) +
    `<section class="section"><div class="wrap coach-drill">
      ${hardest === 3 ? `<div class="coach-callout coach-callout--c3"><p><strong>Coach-led.</strong> This drill is used in high-consequence lessons. Do it only with a qualified specialist coach.</p></div>` : ''}
      ${drillBody(idx, d, 'h2')}
      ${users.length ? `<h2 class="label coach-sub">Used in</h2><ul class="prereq-list">${users.map(l => { const s = idx.skills.get(l.skill_id); return `<li><a href="${href.skill(l.skill_id)}">${esc(l.title)}</a>${s ? ' ' + safetyBadge(s.safety_class) : ''}</li>`; }).join('')}</ul>` : ''}
    </div></section>`;
}
