// Coaching Lab pages: load the library, draw the page, wire it up.
// Each page's <main> has data-coach-page="home|skills|disciplines|progressions|skill|drill".
import { indexCatalog, search } from './core.js';
import { loadCatalog } from './data.js';
import * as R from './render.js';
import { mountDemos } from './demos.js';
import { wireVideos } from './player.js';

const track = name => { if (window.mathleteTrack) window.mathleteTrack(name); };

const PAGES = {
  home: (idx) => ({ html: R.renderHome(idx), title: 'Coaching Lab', event: 'coaching_home_viewed' }),
  skills: (idx, p) => {
    const text = (p.get('q') || '').trim();
    if (text) track('skill_searched');
    return { html: R.renderSkills(idx, p), title: text ? `Search: ${text}` : 'Explore skills' };
  },
  disciplines: (idx, p) => {
    const d = p.get('d') && idx.disciplines.get(p.get('d'));
    return { html: R.renderDisciplines(idx, p), title: d ? d.name : 'Disciplines', event: d ? 'discipline_viewed' : null };
  },
  progressions: (idx, p) => {
    const x = p.get('p') && idx.pathways.get(p.get('p'));
    return { html: R.renderProgressions(idx, p), title: x ? x.name : 'Progressions', event: x ? 'progression_viewed' : null };
  },
  skill: (idx, p) => {
    const s = idx.skills.get(p.get('s') || '');
    return { html: R.renderSkill(idx, p.get('s') || ''), title: s ? s.name : 'Skill not found', event: s ? 'skill_viewed' : null };
  },
  drill: (idx, p) => {
    const d = idx.drills.get(p.get('d') || '');
    return { html: R.renderDrill(idx, p.get('d') || ''), title: d ? d.name : 'Drill not found', event: d ? 'drill_viewed' : null };
  }
};

async function main() {
  const root = document.getElementById('coach-root');
  if (!root) return;
  const page = root.dataset.coachPage;
  const params = new URLSearchParams(location.search);
  const { catalog, source } = await loadCatalog();

  if (!catalog) {
    root.innerHTML = R.unavailable(source);
    root.removeAttribute('aria-busy');
    return;
  }
  const idx = indexCatalog(catalog);
  const out = (PAGES[page] || PAGES.home)(idx, params);
  root.innerHTML = R.sourceBanner(source) + out.html;
  root.removeAttribute('aria-busy');
  document.title = page === 'home' ? 'Coaching Lab — Mathlete MTB' : `${out.title} — Coaching Lab — Mathlete MTB`;
  if (out.event) track(out.event);

  mountDemos(root);
  wireVideos(root, idx.media);

  // Safety information for Class 2 and 3 skills counts as seen once it's on screen.
  const safety = root.querySelector('.coach-safety[data-safety-class="2"], .coach-safety[data-safety-class="3"]');
  if (safety && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { track('safety_warning_viewed'); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(safety);
  }

  root.addEventListener('toggle', e => {
    if (e.target.matches && e.target.matches('details.drill') && e.target.open) track('drill_opened');
  }, true);

  // Jump to an in-page section after the content exists.
  if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) el.scrollIntoView();
  }

  // Keep the cursor in the search box after a search, ready to refine it.
  const input = root.querySelector('#coach-q');
  if (page === 'skills' && input && params.get('q')) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  window.MathleteCoaching = { idx, search: text => search(idx, text) };
}

main().catch(err => {
  const root = document.getElementById('coach-root');
  if (root) { root.innerHTML = R.unavailable('unavailable'); root.removeAttribute('aria-busy'); }
  if (window.console) console.error('[Coaching Lab]', err);
});
