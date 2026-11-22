#!/usr/bin/env node
// Builds Mathlete's global resource catalog (PRD 3) from the site's own
// configuration, so nothing is typed in twice:
//   js/tools-config.js        live public labs        -> type 'lab'
//   js/lab-categories.js      sports + upcoming labs  -> type 'sport', 'lab' (coming soon)
//   content/classes/          courses and activities  -> type 'course', 'lab'
//   (below)                   platform features       -> type 'feature'
// Writes supabase/catalog.sql and js/course-topics.js. Run it after changing any of those, then paste
// catalog.sql into the Supabase SQL Editor (after resources.sql).
//   node scripts/build-catalog.mjs          write the file
//   node scripts/build-catalog.mjs --check  only check it's up to date (check-site.mjs)
//
// Ids are permanent. Something removed from the site is marked 'retired' in
// the database, never deleted, so plans and settings that mention it keep
// their meaning. Private tools (direct accounts only, for now) aren't listed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { loadClasses } from '../content/classes/model.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = f => readFileSync(root + f, 'utf8');
const SITE = 'https://www.mathletemtb.com/';

const SPORTS = {
  mtb: { name: 'Mountain Biking', description: 'Math and physics through trails, jumps, bikes and racing.', status: 'available' },
  ski: { name: 'Skiing', description: 'Math and physics on the mountain: slopes, snow, speed and air.', status: 'available' },
  surf: { name: 'Surfing', description: 'Waves, tides and boards.', status: 'coming_soon' },
  climb: { name: 'Climbing', description: 'Angles, forces and routes on the wall.', status: 'coming_soon' }
};
const FEATURES = [
  { id: 'feature.practice-engine', name: 'Academic Practice Engine',
    description: 'Saves every answer, the student dashboard, Review My Mistakes and goals. Without it, work in this organization isn’t saved.' },
  // Lesson plans with answer keys (teacher-curriculum/, supabase/teacher-curriculum.sql).
  // Staff only: an organization's owners, admins and instructors.
  { id: 'feature.teacher-curriculum', name: 'Teacher Curriculum', audience: 'staff', url: 'teacher-curriculum/',
    description: 'Complete lesson plans for each quarter of Algebra 1, Geometry, Algebra 2 and Precalculus, with answer keys. For teachers and instructors only.' }
];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SUBJECTS = { algebra: 'Algebra', geometry: 'Geometry', trigonometry: 'Trigonometry', statistics: 'Statistics', calculus: 'Calculus', physics: 'Physics' };

export function buildCatalog() {
  const box = { window: {} };
  vm.runInNewContext(read('js/tools-config.js'), box);
  vm.runInNewContext(read('js/lab-categories.js'), box);
  const tools = box.window.MATHLETE_TOOLS || [], categories = box.window.MATHLETE_LAB_CATEGORIES || [];
  const { courses, activities, errors } = loadClasses();
  if (errors.length) throw new Error('Classes content has errors: ' + errors.join('; '));
  const sportOf = Object.fromEntries(categories.map(c => [c.id, c.sport]));

  const out = [], rel = [];
  const add = r => {
    if (out.some(x => x.id === r.id)) throw new Error('duplicate catalog id ' + r.id);
    out.push({ objectives: [], skills: [], game_ids: [], audience: 'all', status: 'available', subject: null, course_id: null, sport: null, thumbnail: null, url: null, ...r });
  };

  FEATURES.forEach((f, i) => add({ ...f, slug: f.id.split('.')[1], type: 'feature', sort_order: i }));
  Object.entries(SPORTS).forEach(([id, s], i) => add({ id: 'sport.' + id, slug: id, type: 'sport', sport: id, sort_order: 10 + i, ...s }));
  courses.forEach(c => add({
    id: 'course.' + c.id, slug: c.slug, name: c.name, type: 'course', subject: c.subject, course_id: c.id,
    description: c.description, objectives: c.units.map(u => u.title), url: `classes/${c.slug}/`, sort_order: 100 + c.order
  }));
  // Live public labs from the Learning Lab.
  tools.filter(t => t.status === 'live' && t.access === 'public').forEach((t, i) => {
    const sport = sportOf[t.category] || 'mtb';
    add({
      id: t.id, slug: t.id, name: t.name, type: 'lab', sport, description: t.summary || null,
      subject: (t.subjects || []).map(s => SUBJECTS[s] || s).join(', ') || null,
      game_ids: [t.id], thumbnail: t.image || null, url: (t.url || '').replace(SITE, '') || null, sort_order: 200 + i
    });
    rel.push([t.id, 'sport.' + sport, 'requires']);
  });
  // Classes activities (labs that live in a course). A Lab tool used in a
  // course (a.tool) is already listed above; it only gets the link.
  activities.forEach((a, i) => {
    const home = a.home.split('.')[0];
    if (a.tool) {
      if (!out.some(x => x.id === a.tool)) throw new Error(`activity ${a.id}: tool ${a.tool} isn't a live public Lab tool`);
      rel.push([a.tool, 'course.' + home, 'part_of']);
      return;
    }
    add({
      id: a.id, slug: a.id, name: a.title, type: a.type === 'lab' ? 'lab' : 'module', sport: 'mtb', description: a.summary,
      subject: courses.find(c => c.id === home).subject, course_id: home, objectives: a.objectives || [], skills: a.skills || [],
      game_ids: a.tracking ? [a.tracking.gameId] : [], thumbnail: a.image || null, url: a.route, sort_order: 300 + i
    });
    rel.push([a.id, 'sport.mtb', 'requires']);
    rel.push([a.id, 'course.' + home, 'part_of']);
  });
  // Labs still being built: listed as coming soon, so plans can include them ahead of time.
  categories.forEach(c => (c.upcoming || []).forEach(name => {
    const id = slug(name);
    if (out.some(x => x.id === id)) return;
    add({ id, slug: id, name, type: 'lab', sport: c.sport, status: 'coming_soon', description: c.focus, sort_order: 400 + out.length });
    rel.push([id, 'sport.' + c.sport, 'requires']);
  }));
  return { resources: out, relations: rel };
}

// Course outlines for the browser (names of courses, units and topics), used
// by the organization page's topic picker and the "Your school" section.
export function courseTopicsJs() {
  const { courses } = loadClasses();
  const data = courses.map(c => ({ id: c.id, slug: c.slug, name: c.name,
    units: c.units.map(u => ({ title: u.title, topics: u.topics.map(t => [t.id, t.slug, t.title]) })) }));
  return `// GENERATED by scripts/build-catalog.mjs from content/classes/. Don't edit.
// Course outlines: [id, slug, title] for each topic, by unit.
window.MATHLETE_COURSE_TOPICS = ${JSON.stringify(data)};
`;
}

const lit = v => v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const arr = a => `array[${a.map(lit).join(', ')}]::text[]`;

export function catalogSql() {
  const { resources, relations } = buildCatalog();
  const rows = resources.map(r => `  (${[lit(r.id), lit(r.slug), lit(r.name), lit(r.description), lit(r.type), lit(r.subject), lit(r.course_id), lit(r.sport),
    arr(r.objectives), arr(r.skills), arr(r.game_ids), lit(r.thumbnail), lit(r.url), lit(r.audience), lit(r.status), r.sort_order].join(', ')})`);
  return `-- ============================================================
-- GENERATED by scripts/build-catalog.mjs from js/tools-config.js,
-- js/lab-categories.js and content/classes/. Don't edit: change those and run
--   node scripts/build-catalog.mjs
-- Then paste this whole file into Supabase -> SQL Editor and Run (after
-- resources.sql). Safe to re-run.
--
-- ${resources.length} resources: ${['feature', 'sport', 'course', 'lab', 'module'].map(t => t + ': ' + resources.filter(r => r.type === t).length).join(', ')}.
-- Ids are permanent; anything no longer listed is marked retired, never
-- deleted. A resource's version goes up when its description changes.
-- ============================================================

insert into public.resources (id, slug, name, description, type, subject, course_id, sport, objectives, skills, game_ids, thumbnail, url, audience, status, sort_order) values
${rows.join(',\n')}
on conflict (id) do update set
  version = public.resources.version + case when (public.resources.name, public.resources.description, public.resources.objectives)
                                                 is distinct from (excluded.name, excluded.description, excluded.objectives) then 1 else 0 end,
  slug = excluded.slug, name = excluded.name, description = excluded.description, type = excluded.type, subject = excluded.subject,
  course_id = excluded.course_id, sport = excluded.sport, objectives = excluded.objectives, skills = excluded.skills, game_ids = excluded.game_ids,
  thumbnail = excluded.thumbnail, url = excluded.url, audience = excluded.audience, status = excluded.status, sort_order = excluded.sort_order,
  updated_at = now();

update public.resources set status = 'retired', updated_at = now()
 where status <> 'retired' and id not in (${resources.map(r => lit(r.id)).join(', ')});

delete from public.resource_relations where resource_id in (${resources.map(r => lit(r.id)).join(', ')});
insert into public.resource_relations (resource_id, related_id, relation) values
${relations.map(([a, b, k]) => `  (${lit(a)}, ${lit(b)}, ${lit(k)})`).join(',\n')}
on conflict do nothing;
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputs = [[root + 'supabase/catalog.sql', catalogSql()], [root + 'js/course-topics.js', courseTopicsJs()]];
  if (process.argv.includes('--check')) {
    const stale = outputs.filter(([f, text]) => !existsSync(f) || readFileSync(f, 'utf8') !== text).map(([f]) => f.replace(root, ''));
    console.log(stale.length ? 'Out of date: ' + stale.join(', ') + ' (run node scripts/build-catalog.mjs)' : 'Catalog files are up to date.');
    process.exit(stale.length ? 1 : 0);
  }
  outputs.forEach(([f, text]) => writeFileSync(f, text));
  const { resources } = buildCatalog();
  console.log(`Wrote supabase/catalog.sql (${resources.length} resources) and js/course-topics.js.`);
  resources.forEach(r => console.log(`  ${r.type.padEnd(8)} ${r.status === 'available' ? '' : '(' + r.status + ') '}${r.id}  ${r.name}`));
}
