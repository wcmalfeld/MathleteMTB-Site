// What the CMS editor shows for each content type. Each field maps to a key
// in the item's JSON (the same shape the database snapshots and seed.json
// use). Field kinds:
//   text, textarea, number, checkbox, select (options), list (one per line),
//   ref (one item of another type), refs (ordered list of items),
//   group (nested object, e.g. lesson.physics), items (repeating sub-forms).
import { DIFFICULTY, SAFETY, PREREQ_KIND, STAGE_KIND } from './core.js';
import { DEMO_IDS } from './demos.js';
import { KIND_LABEL } from './player.js';

const opts = o => Object.entries(o).map(([value, label]) => ({ value, label }));
const LEVELS = opts(DIFFICULTY);

export const TYPES = {
  skill: { label: 'Skill', plural: 'Skills', reviewed: true, titleKey: 'name' },
  lesson: { label: 'Lesson', plural: 'Lessons', reviewed: true, titleKey: 'title' },
  drill: { label: 'Drill', plural: 'Drills', reviewed: true, titleKey: 'name' },
  mistake: { label: 'Mistake', plural: 'Mistakes', reviewed: true, titleKey: 'name' },
  media: { label: 'Video', plural: 'Videos', reviewed: true, titleKey: 'title' },
  pathway: { label: 'Pathway', plural: 'Pathways', reviewed: true, titleKey: 'name' },
  discipline: { label: 'Discipline', plural: 'Disciplines', reviewed: false, titleKey: 'name', admin: true },
  competency: { label: 'Competency', plural: 'Competencies', reviewed: false, titleKey: 'name', admin: true },
  person: { label: 'Person', plural: 'People', reviewed: false, titleKey: 'name', admin: true }
};

const ID = { key: 'id', kind: 'text', label: 'ID', help: 'Used in the address, e.g. coaching/manual. Lowercase letters, numbers and hyphens. Can\'t be changed later.', idField: true };

export const FIELDS = {
  skill: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'summary', kind: 'textarea', label: 'Short description', rows: 2, required: true },
    { key: 'difficulty', kind: 'select', label: 'Difficulty', options: LEVELS },
    { key: 'safety_class', kind: 'select', label: 'Safety class', number: true, options: [1, 2, 3].map(c => ({ value: c, label: SAFETY[c].label })),
      help: 'Class 3 lessons must require coach supervision, and advanced, expert or Class 3 content needs a specialist reviewer.' },
    { key: 'environment', kind: 'text', label: 'Required riding environment', required: true },
    { key: 'bike_types', kind: 'list', label: 'Bike types', rows: 2 },
    { key: 'learning_commitment', kind: 'text', label: 'Estimated learning commitment', help: 'Leave blank unless the curriculum supports an estimate.' },
    { key: 'why_it_matters', kind: 'textarea', label: 'Why this skill matters', rows: 4, required: true },
    { key: 'keywords', kind: 'list', label: 'Search keywords', rows: 3, help: 'Words riders might search for, one per line.' },
    { key: 'featured', kind: 'checkbox', label: 'Show in "Popular skills"' },
    { key: 'disciplines', kind: 'items', label: 'Disciplines', add: 'Add discipline', fields: [
      { key: 'id', kind: 'ref', ref: 'discipline', label: 'Discipline' },
      { key: 'primary', kind: 'checkbox', label: 'Primary' }] },
    { key: 'competencies', kind: 'items', label: 'Foundational competencies', add: 'Add competency', fields: [
      { key: 'id', kind: 'ref', ref: 'competency', label: 'Competency' },
      { key: 'importance', kind: 'select', label: 'Importance', options: [{ value: 'primary', label: 'Primary' }, { value: 'supporting', label: 'Supporting' }] }] },
    { key: 'prerequisites', kind: 'items', label: 'Prerequisites', add: 'Add prerequisite', cycleCheck: true, fields: [
      { key: 'id', kind: 'ref', ref: 'skill', label: 'Skill' },
      { key: 'kind', kind: 'select', label: 'Type', options: opts(PREREQ_KIND) }] },
    { key: 'related', kind: 'refs', ref: 'skill', label: 'Related skills' }
  ],
  lesson: [
    ID,
    { key: 'skill_id', kind: 'ref', ref: 'skill', label: 'Skill this lesson teaches', required: true },
    { key: 'title', kind: 'text', label: 'Lesson title', required: true },
    { key: 'is_primary', kind: 'checkbox', label: 'Main lesson for the skill' },
    { key: 'introduction', kind: 'textarea', label: 'Introduction', rows: 4, required: true },
    { key: 'objectives', kind: 'list', label: 'Learning objectives', rows: 3, required: true },
    { key: 'physics', kind: 'group', label: 'Physics and biomechanics', fields: [
      { key: 'summary', kind: 'textarea', label: 'Summary', rows: 2 },
      { key: 'concepts', kind: 'list', label: 'Concepts', rows: 2 },
      { key: 'blocks', kind: 'items', label: 'Explanations', add: 'Add explanation', fields: [
        { key: 'heading', kind: 'text', label: 'Heading' },
        { key: 'body', kind: 'textarea', label: 'Explanation', rows: 4 },
        { key: 'demo', kind: 'select', label: 'Interactive demo', options: [{ value: '', label: 'None' }, ...DEMO_IDS.map(d => ({ value: d, label: d }))] }] }] },
    { key: 'technique', kind: 'items', label: 'Technique stages', add: 'Add stage', fields: [
      { key: 'title', kind: 'text', label: 'Stage title' },
      { key: 'result', kind: 'text', label: 'Intended result' },
      { key: 'movement', kind: 'textarea', label: 'The movement', rows: 3 },
      { key: 'interaction', kind: 'text', label: 'Bike and rider interaction' },
      { key: 'cues', kind: 'list', label: 'Coaching cues', rows: 2 },
      { key: 'errors', kind: 'list', label: 'Common errors at this stage', rows: 2 },
      { key: 'media_id', kind: 'ref', ref: 'media', label: 'Reference video' }] },
    { key: 'drills', kind: 'refs', ref: 'drill', label: 'Practice drills' },
    { key: 'mistakes', kind: 'refs', ref: 'mistake', label: 'Common mistakes' },
    { key: 'media', kind: 'refs', ref: 'media', label: 'Videos' },
    { key: 'safety', kind: 'group', label: 'Safety', fields: [
      { key: 'protective', kind: 'list', label: 'Protective equipment', rows: 3 },
      { key: 'equipment', kind: 'list', label: 'Equipment', rows: 2 },
      { key: 'environments', kind: 'list', label: 'Suitable training environments', rows: 2 },
      { key: 'conditions', kind: 'list', label: 'Weather and terrain considerations', rows: 2 },
      { key: 'supervision', kind: 'checkbox', label: 'Requires coach supervision' },
      { key: 'stop_conditions', kind: 'list', label: 'Stop conditions', rows: 3 },
      { key: 'warnings', kind: 'list', label: 'Warnings', rows: 2 }] },
    { key: 'contributors', kind: 'items', label: 'Contributors', add: 'Add contributor', fields: [
      { key: 'id', kind: 'ref', ref: 'person', label: 'Person' },
      { key: 'role', kind: 'select', label: 'Role', options: [{ value: 'author', label: 'Author' }, { value: 'reviewer', label: 'Reviewer' }, { value: 'demo-rider', label: 'Demo rider' }, { value: 'coach', label: 'Coach' }] }] }
  ],
  drill: [
    ID,
    { key: 'name', kind: 'text', label: 'Drill name', required: true },
    { key: 'objective', kind: 'text', label: 'Objective', required: true },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 3 },
    { key: 'steps', kind: 'list', label: 'Steps', rows: 5, required: true },
    { key: 'environment', kind: 'text', label: 'Required environment', required: true },
    { key: 'equipment', kind: 'list', label: 'Required equipment', rows: 2 },
    { key: 'duration_min', kind: 'number', label: 'Duration (minutes)', min: 1, max: 240 },
    { key: 'reps', kind: 'text', label: 'Repetitions' },
    { key: 'level', kind: 'select', label: 'Ability level', options: [{ value: '', label: 'Choose…' }, ...LEVELS] },
    { key: 'safety', kind: 'list', label: 'Safety conditions', rows: 3, required: true },
    { key: 'success', kind: 'list', label: 'Success indicators', rows: 3, required: true },
    { key: 'common_errors', kind: 'list', label: 'Common errors', rows: 2 },
    { key: 'next_drill_id', kind: 'ref', ref: 'drill', label: 'Next progression' },
    { key: 'media_id', kind: 'ref', ref: 'media', label: 'Demonstration video' }
  ],
  mistake: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 2, required: true },
    { key: 'looks_like', kind: 'textarea', label: 'What it looks like', rows: 2 },
    { key: 'cause', kind: 'textarea', label: 'Why it happens', rows: 2 },
    { key: 'correction', kind: 'textarea', label: 'Coaching correction', rows: 3, required: true },
    { key: 'drill_id', kind: 'ref', ref: 'drill', label: 'Supporting drill' },
    { key: 'media_id', kind: 'ref', ref: 'media', label: 'Example video' }
  ],
  media: [
    ID,
    { key: 'title', kind: 'text', label: 'Title', required: true },
    { key: 'kind', kind: 'select', label: 'Type', options: opts(KIND_LABEL) },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 2 },
    { key: 'provider', kind: 'select', label: 'Hosted on', options: [
      { value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' },
      { value: 'hls', label: 'HLS stream (Mux, Cloudflare Stream…)' }, { value: 'file', label: 'MP4 file URL' }] },
    { key: 'ref', kind: 'text', label: 'Video ID or URL', required: true, help: 'YouTube/Vimeo: the video ID. HLS/MP4: the full https:// address.' },
    { key: 'thumbnail', kind: 'text', label: 'Thumbnail URL', upload: 'image' },
    { key: 'duration_s', kind: 'number', label: 'Duration (seconds)', min: 0 },
    { key: 'captions_url', kind: 'text', label: 'Captions (.vtt) URL', upload: 'vtt' },
    { key: 'platform_captions', kind: 'checkbox', label: 'Captions are provided on YouTube/Vimeo' },
    { key: 'chapters', kind: 'items', label: 'Chapters', add: 'Add chapter', fields: [
      { key: 't', kind: 'number', label: 'Start (seconds)', min: 0 },
      { key: 'label', kind: 'text', label: 'Label' }] },
    { key: 'license_status', kind: 'select', label: 'Copyright / licensing', options: [
      { value: 'unknown', label: 'Not confirmed' }, { value: 'original', label: 'Original Mathlete footage' },
      { value: 'licensed', label: 'Licensed' }, { value: 'permission', label: 'Used with written permission' }] },
    { key: 'creator', kind: 'text', label: 'Creator' }
  ],
  pathway: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'target_skill_id', kind: 'ref', ref: 'skill', label: 'Target skill', required: true },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 3 },
    { key: 'stages', kind: 'items', label: 'Stages', add: 'Add stage', fields: [
      { key: 'title', kind: 'text', label: 'Stage title' },
      { key: 'description', kind: 'textarea', label: 'Description', rows: 2 },
      { key: 'kind', kind: 'select', label: 'Stage type', options: opts(STAGE_KIND) },
      { key: 'mode', kind: 'select', label: 'Lessons', options: [{ value: 'all', label: 'Complete all' }, { value: 'any', label: 'Choose any one (branching)' }] },
      { key: 'practical', kind: 'checkbox', label: 'Involves riding' },
      { key: 'supervision', kind: 'checkbox', label: 'Coach supervision required' },
      { key: 'readiness', kind: 'list', label: 'Readiness criteria', rows: 2 },
      { key: 'lessons', kind: 'refs', ref: 'lesson', label: 'Lessons' }] }
  ],
  discipline: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'summary', kind: 'text', label: 'Summary' },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 3 },
    { key: 'image', kind: 'text', label: 'Image URL', upload: 'image' },
    { key: 'display_order', kind: 'number', label: 'Display order' },
    { key: 'planned_topics', kind: 'list', label: 'Planned topics (shown as "coming to the library")', rows: 5 },
    { key: 'published', kind: 'checkbox', label: 'Show on the site' }
  ],
  competency: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'description', kind: 'textarea', label: 'Description', rows: 3 },
    { key: 'display_order', kind: 'number', label: 'Display order' }
  ],
  person: [
    ID,
    { key: 'name', kind: 'text', label: 'Name', required: true },
    { key: 'credentials', kind: 'text', label: 'Credentials', help: 'e.g. PMBIA Level 2. Only list credentials you have verified.' },
    { key: 'bio', kind: 'textarea', label: 'Bio', rows: 3 },
    { key: 'specialties', kind: 'list', label: 'Specialties', rows: 2 },
    { key: 'photo', kind: 'text', label: 'Photo URL', upload: 'image' },
    { key: 'verified', kind: 'checkbox', label: 'Verified coach (shown publicly)' },
    { key: 'published', kind: 'checkbox', label: 'Show on the site' }
  ]
};

// A blank item of a type, with every key present so the form has values.
export function blank(type) {
  const out = {};
  const fill = (fields, obj) => {
    for (const f of fields) {
      if (f.kind === 'group') { obj[f.key] = {}; fill(f.fields, obj[f.key]); }
      else obj[f.key] = f.kind === 'list' || f.kind === 'refs' || f.kind === 'items' ? []
        : f.kind === 'checkbox' ? false : f.kind === 'number' || f.kind === 'ref' ? null
        : f.kind === 'select' ? (f.options[0] ? (f.number ? Number(f.options[0].value) : f.options[0].value) : '') : '';
    }
  };
  fill(FIELDS[type], out);
  if (type === 'skill') { out.difficulty = 'beginner'; out.safety_class = 1; }
  if (type === 'lesson') out.is_primary = true;
  if (type === 'discipline' || type === 'person') out.published = true;
  if (type === 'discipline' || type === 'competency') out.display_order = 100;
  if (type === 'media') { out.license_status = 'unknown'; out.provider = 'youtube'; }
  return out;
}

// A new sub-item for an "items" field.
export function blankItem(field) {
  const o = {};
  for (const f of field.fields) {
    o[f.key] = f.kind === 'list' || f.kind === 'refs' ? [] : f.kind === 'checkbox' ? false
      : f.kind === 'number' || f.kind === 'ref' ? null : f.kind === 'select' ? f.options[0].value : '';
  }
  return o;
}

// Clean the form state into what coach_save expects.
export function toPayload(type, state) {
  const clean = (fields, src) => {
    const o = {};
    for (const f of fields) {
      const v = src == null ? undefined : src[f.key];
      if (f.kind === 'group') o[f.key] = clean(f.fields, v || {});
      else if (f.kind === 'items') o[f.key] = (v || []).map(x => clean(f.fields, x)).filter(x => Object.values(x).some(y => y !== '' && y !== null && !(Array.isArray(y) && !y.length) && y !== false));
      else if (f.kind === 'list') o[f.key] = (v || []).map(s => String(s).trim()).filter(Boolean);
      else if (f.kind === 'refs') o[f.key] = [...new Set((v || []).filter(Boolean))];
      else if (f.kind === 'number') o[f.key] = v === '' || v == null || isNaN(Number(v)) ? null : Number(v);
      else if (f.kind === 'checkbox') o[f.key] = !!v;
      else if (f.kind === 'ref') o[f.key] = v || null;
      else if (f.kind === 'select' && f.number) o[f.key] = Number(v);
      else o[f.key] = v == null ? '' : String(v);
    }
    return o;
  };
  const out = clean(FIELDS[type], state);
  // An explanation without a demo stores no "demo" key.
  if (type === 'lesson') for (const b of out.physics.blocks || []) if (!b.demo) delete b.demo;
  return out;
}
