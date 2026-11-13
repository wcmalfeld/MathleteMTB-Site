// CLASSES: turns curriculum.mjs + activities.mjs into one checked model
// with stable ids, used by scripts/build-classes.mjs and check-site.mjs.
import { COURSES } from './curriculum.mjs';
import { ACTIVITIES } from './activities.mjs';

export const ACTIVITY_TYPES = { lab: 'Interactive lab', guided: 'Guided activity', game: 'Game', practice: 'Practice' };
export const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function loadClasses() {
  const errors = [];
  const ids = new Set();
  const claim = (id, what) => { if (ids.has(id)) errors.push(`duplicate id ${id} (${what})`); ids.add(id); };
  const courses = [], units = [], topics = [], skills = [];

  [...COURSES].sort((a, b) => a.order - b.order).forEach(c => {
    claim(c.id, 'course');
    const course = { ...c, units: [], href: `classes/${c.slug}/` };
    const slugs = new Set();
    c.units.forEach((u, ui) => {
      const unit = { id: `${c.id}.u.${u.slug}`, slug: u.slug, title: u.title, number: ui + 1, course, topics: [] };
      claim(unit.id, 'unit');
      u.topics.forEach((t, ti) => {
        const id = `${c.id}.${t.slug}`;
        claim(id, 'topic');
        if (slugs.has(t.slug)) errors.push(`topic slug ${t.slug} used twice in ${c.name}`);
        slugs.add(t.slug);
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug)) errors.push(`bad topic slug ${t.slug}`);
        const topic = { id, slug: t.slug, title: t.title, desc: t.desc, mtb: t.mtb, prereq: t.prereq || [], number: ti + 1,
          unit, course, href: `classes/${c.slug}/${t.slug}/`, skills: [] };
        if (!t.skills || !t.skills.length) errors.push(`${id} has no skills`);
        (t.skills || []).forEach(s => {
          const m = s.match(/^([a-z0-9-]+):\s*(.+)$/);
          if (!m) { errors.push(`${id}: bad skill "${s}"`); return; }
          const skill = { id: `${id}.${m[1]}`, slug: m[1], title: m[2], topic };
          claim(skill.id, 'skill');
          topic.skills.push(skill); skills.push(skill);
        });
        unit.topics.push(topic); topics.push(topic);
      });
      course.units.push(unit); units.push(unit);
    });
    courses.push(course);
  });

  const skillById = new Map(skills.map(s => [s.id, s]));
  const topicById = new Map(topics.map(t => [t.id, t]));
  topics.forEach(t => t.prereq.forEach(p => { if (!topicById.has(p)) errors.push(`${t.id}: unknown prerequisite ${p}`); }));

  const activities = ACTIVITIES.filter(a => a.status === 'live').map(a => {
    if (ids.has(a.id)) errors.push(`activity id ${a.id} clashes with a curriculum id`);
    if (!ACTIVITY_TYPES[a.type]) errors.push(`${a.id}: unknown type ${a.type}`);
    const missing = a.skills.filter(s => !skillById.has(s));
    if (missing.length) errors.push(`${a.id}: unknown skills ${missing.join(', ')}`);
    if (a.tracking) Object.entries(a.tracking.questions).forEach(([q, ss]) => ss.forEach(s => { if (!skillById.has(s)) errors.push(`${a.id}:${q}: unknown skill ${s}`); }));
    if (!topicById.has(a.home)) errors.push(`${a.id}: unknown home topic ${a.home}`);
    return { ...a, skillSet: new Set(a.skills) };
  });

  // Which activities serve each topic (home topic first).
  topics.forEach(t => {
    t.activities = activities.filter(a => t.skills.some(s => a.skillSet.has(s.id)))
      .sort((a, b) => (b.home === t.id) - (a.home === t.id));
  });
  courses.forEach(c => { c.activityIds = new Set(c.units.flatMap(u => u.topics.flatMap(t => t.activities.map(a => a.id)))); });

  return { courses, units, topics, skills, activities, skillById, topicById, errors };
}
