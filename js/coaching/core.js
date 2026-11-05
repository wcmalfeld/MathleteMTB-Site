// Coaching Lab: the logic shared by the pages, the CMS and the tests.
// No DOM, no network: everything here takes the catalog (the JSON that
// coach_catalog() returns, same shape as content/coaching/seed.json) and
// returns plain data. Unit tests: tests/coaching-core.test.mjs.

export const DIFFICULTY = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert'
};

export const SAFETY = {
  1: { label: 'Class 1 · Foundational', short: 'Foundational',
       text: 'Suitable for self-guided practice with the safety guidance on this page.' },
  2: { label: 'Class 2 · Progressive', short: 'Progressive',
       text: 'Learn the prerequisites first, wear the protective equipment listed, use a suitable practice area and progress gradually.' },
  3: { label: 'Class 3 · High consequence', short: 'High consequence',
       text: 'Read and learn here, but practise only with a qualified specialist coach in a purpose-built training environment. Completing this page does not make you ready.' }
};

export const PREREQ_KIND = { required: 'Required', recommended: 'Recommended', optional: 'Optional support' };
export const STAGE_KIND = { required: 'Core stage', optional: 'Optional', assessment: 'Assessment' };
export const STATUS = {
  draft: 'Draft', submitted: 'In review', approved: 'Approved', published: 'Published', archived: 'Archived'
};

const byId = list => new Map((list || []).map(x => [x.id, x]));

// Fast lookups over a catalog, built once per page.
export function indexCatalog(cat) {
  const c = cat || {};
  const idx = {
    raw: c,
    preview: !!c.preview,
    skills: byId(c.skills), lessons: byId(c.lessons), drills: byId(c.drills), mistakes: byId(c.mistakes),
    media: byId(c.media), pathways: byId(c.pathways), disciplines: byId(c.disciplines),
    competencies: byId(c.competencies), people: byId(c.people), sources: byId(c.sources),
    lessonsBySkill: new Map(), dependents: new Map(), skillsByDiscipline: new Map()
  };
  for (const l of c.lessons || []) {
    if (!idx.skills.has(l.skill_id)) continue;
    if (!idx.lessonsBySkill.has(l.skill_id)) idx.lessonsBySkill.set(l.skill_id, []);
    idx.lessonsBySkill.get(l.skill_id).push(l);
  }
  for (const list of idx.lessonsBySkill.values()) list.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  for (const s of c.skills || []) {
    for (const p of s.prerequisites || []) {
      if (!idx.dependents.has(p.id)) idx.dependents.set(p.id, []);
      idx.dependents.get(p.id).push({ id: s.id, kind: p.kind });
    }
    for (const d of s.disciplines || []) {
      if (!idx.skillsByDiscipline.has(d.id)) idx.skillsByDiscipline.set(d.id, []);
      idx.skillsByDiscipline.get(d.id).push(s);
    }
  }
  return idx;
}

export const primaryLesson = (idx, skillId) => (idx.lessonsBySkill.get(skillId) || [])[0] || null;

// Only links that point at something in the catalog: on the live site that
// means published, so a page never shows a dead link.
export const present = (map, ids) => (ids || []).map(id => map.get(id)).filter(Boolean);

// ---------- prerequisites ----------

// Every skill this one builds on, nearest first, without repeats.
// kinds limits which links are followed (default: required + recommended).
export function foundationChain(idx, skillId, kinds = ['required', 'recommended']) {
  const seen = new Set([skillId]);
  const out = [];
  let frontier = [skillId];
  let depth = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const id of frontier) {
      const s = idx.skills.get(id);
      for (const p of (s && s.prerequisites) || []) {
        if (!kinds.includes(p.kind) || seen.has(p.id) || !idx.skills.has(p.id)) continue;
        seen.add(p.id);
        out.push({ id: p.id, kind: p.kind, depth, via: id });
        next.push(p.id);
      }
    }
    frontier = next;
  }
  return out;
}

// Learning order for a set of skills: every skill after the skills it
// depends on. Throws on a cycle (the database rejects them; this is a guard).
export function learningOrder(idx, ids, kinds = ['required', 'recommended']) {
  const want = new Set(ids);
  const state = new Map();
  const out = [];
  const visit = (id, path) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'active') throw new Error('Circular prerequisite: ' + [...path, id].join(' -> '));
    state.set(id, 'active');
    const s = idx.skills.get(id);
    for (const p of (s && s.prerequisites) || []) {
      if (kinds.includes(p.kind) && want.has(p.id)) visit(p.id, [...path, id]);
    }
    state.set(id, 'done');
    out.push(id);
  };
  for (const id of [...want].sort()) visit(id, []);
  return out;
}

// Would adding prereqId as a prerequisite of skillId create a loop?
// Used by the CMS to warn before saving.
export function wouldCreateCycle(idx, skillId, prereqId) {
  if (skillId === prereqId) return true;
  return foundationChain(idx, prereqId, ['required', 'recommended', 'optional']).some(x => x.id === skillId);
}

// ---------- safety ----------

// What the page should and shouldn't offer for a skill. Completing a lesson
// never changes any of this.
export function safetyRules(skill, lesson) {
  const cls = Number(skill && skill.safety_class) || 1;
  const safety = (lesson && lesson.safety) || {};
  return {
    cls,
    info: SAFETY[cls],
    selfGuidedPractice: cls < 3,
    needsSupervision: cls === 3 || !!safety.supervision,
    needsPrerequisites: cls >= 2,
    showProtectiveFirst: cls >= 2
  };
}

// ---------- pathways ----------

export function pathwaysFor(idx, skillId) {
  const lessonIds = new Set((idx.lessonsBySkill.get(skillId) || []).map(l => l.id));
  const target = [];
  const includes = [];
  for (const p of idx.pathways.values()) {
    if (p.target_skill_id === skillId) target.push(p);
    else if ((p.stages || []).some(st => (st.lessons || []).some(id => lessonIds.has(id)))) includes.push(p);
  }
  return { target, includes };
}

// Where a skill's lesson sits inside a pathway: { index, previous, next }.
export function stageOf(pathway, lessonId) {
  const stages = pathway.stages || [];
  const index = stages.findIndex(st => (st.lessons || []).includes(lessonId));
  if (index < 0) return null;
  return { index, stage: stages[index], previous: stages.slice(0, index), next: stages.slice(index + 1) };
}

// A plain-language description of what kind of progression a pathway is.
export function pathwayShape(pathway) {
  const stages = pathway.stages || [];
  const tags = [];
  if (stages.length && stages.every(s => s.kind !== 'optional' && s.mode !== 'any')) tags.push('Linear');
  if (stages.some(s => s.mode === 'any')) tags.push('Branching');
  if (stages.some(s => s.kind === 'optional')) tags.push('Has optional stages');
  if (stages.some(s => s.kind === 'assessment')) tags.push('Assessment');
  if (stages.some(s => s.supervision)) tags.push('Coach-supervised');
  return tags;
}

// ---------- search ----------

const STOP = new Set(('a an and are as at be become better can could do does doing feel get getting go going help how i ' +
  'im i\'m improve improving in into is it learn learning like make me more my of on or over please really should ' +
  'so some start teach the then to up want wanna what when where which while who why with work working you your').split(' '));

// Riders' words -> words in the library. Keys and values are stemmed terms.
const SYNONYMS = {
  jump: ['jump', 'air', 'takeoff', 'lip', 'tabletop', 'pump'],
  high: ['jump', 'pump', 'pressure'], air: ['jump', 'air'], airtime: ['jump', 'air'],
  casing: ['casing', 'consistency', 'overshoot'], case: ['casing', 'consistency'], overshoot: ['overshoot', 'consistency'],
  smooth: ['smooth', 'absorb', 'landing'], whip: ['whip', 'style'], style: ['style', 'whip', 'tabletop'],
  track: ['track', 'race'], race: ['race', 'track'], practice: ['practice', 'lap'], lap: ['lap', 'practice'], nerves: ['race', 'pressure'],
  wheelie: ['manual', 'wheel'], manny: ['manual'],
  hop: ['bunny', 'hop'], bunny: ['bunny', 'hop'], log: ['hop', 'bunny'],
  corner: ['corner', 'turn', 'berm'], turn: ['corner', 'turn', 'steer'], berm: ['corner', 'berm'],
  switchback: ['steer', 'corner', 'balance'],
  steep: ['steep', 'brake', 'body', 'position', 'drop', 'terrain'], descend: ['steep', 'body', 'brake', 'terrain'],
  downhill: ['steep', 'brake', 'body', 'corner'], scary: ['steep', 'body'], scared: ['steep', 'body'],
  comfortable: ['body', 'position', 'confidence'], confident: ['body', 'confidence'], nervous: ['body', 'balance'],
  brake: ['brake'], stop: ['brake', 'stop'], skid: ['brake', 'skid'], slow: ['brake', 'balance', 'slow'],
  wobbly: ['balance'], stable: ['balance', 'stable'], balance: ['balance'],
  root: ['terrain', 'root', 'pressure'], rock: ['terrain', 'rock', 'line'], rough: ['pressure', 'absorb', 'terrain'],
  line: ['line', 'terrain', 'steer'], look: ['terrain', 'vision'], vision: ['terrain', 'vision'],
  drop: ['drop', 'land', 'ledge'], ledge: ['drop', 'ledge'], land: ['land'],
  pump: ['pump', 'pressure'], speed: ['pump', 'corner', 'speed'], fast: ['corner', 'speed', 'pump', 'line'],
  suspension: ['setup', 'suspension', 'sag'], tire: ['setup', 'tyre', 'pressure'], tyre: ['setup', 'tyre', 'pressure'],
  setup: ['setup'], sag: ['sag', 'setup'], rebound: ['rebound', 'setup'],
  flip: ['flip', 'aerial'], backflip: ['flip', 'aerial'], spin: ['spin', 'rotation', '360'], '360': ['360', 'spin'],
  '180': ['180', 'spin'], whip: ['whip'], barspin: ['barspin'], tailwhip: ['tailwhip']
};

// Comparatives riders use ("faster", "smoother") mapped to their base word.
const COMPARATIVE = { faster: 'fast', fastest: 'fast', smoother: 'smooth', smoothest: 'smooth', higher: 'high', highest: 'high',
  bigger: 'big', biggest: 'big', harder: 'hard', later: 'late', earlier: 'early', quicker: 'quick', better: 'better' };

export function stem(word) {
  let w = word.toLowerCase().replace(/[’']/g, '');
  if (/^\d+s?$/.test(w)) return w.replace(/s$/, '');
  if (COMPARATIVE[w]) return COMPARATIVE[w];
  // Plurals first, so "landings" and "landing" end up the same.
  if (w.length > 3 && w.endsWith('ies')) w = w.slice(0, -3) + 'y';
  else if (w.length > 3 && w.endsWith('es') && /(ss|sh|ch|x)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  if (w.length > 3 && /([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|ff|zz)$/.test(w)) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('e') && !w.endsWith('ee')) w = w.slice(0, -1);
  return w;
}

// The synonym table, stemmed the same way as the text it's compared with.
const SYN = Object.fromEntries(Object.entries(SYNONYMS).map(([k, v]) => [stem(k), [...new Set(v.map(stem))]]));

export function tokens(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9’']+/).filter(Boolean).map(stem).filter(t => t && !STOP.has(t));
}

// Each word in the query, with its synonyms. A word scores once, by its
// best match, so a word with many synonyms doesn't outweigh the rest.
function queryTerms(q) {
  const base = [...new Set(tokens(q))];
  const groups = base.map(t => {
    const alts = new Map([[t, 1]]);
    for (const s of SYN[t] || []) if (!alts.has(s)) alts.set(s, 0.6);
    return { word: t, alts };
  });
  const terms = new Map();
  for (const g of groups) for (const [t, w] of g.alts) terms.set(t, Math.max(terms.get(t) || 0, w));
  return { base, groups, terms };
}

function skillDoc(idx, s) {
  const lessons = idx.lessonsBySkill.get(s.id) || [];
  const fields = [
    [s.name, 6], [(s.keywords || []).join(' '), 4], [lessons.map(l => l.title).join(' '), 3], [s.summary, 2],
    [(s.disciplines || []).map(d => (idx.disciplines.get(d.id) || {}).name).join(' '), 1],
    [(s.competencies || []).map(c => (idx.competencies.get(c.id) || {}).name).join(' '), 1],
    [s.why_it_matters, 0.5]
  ];
  const weights = new Map();
  for (const [text, w] of fields) for (const t of tokens(text)) weights.set(t, Math.max(weights.get(t) || 0, w));
  return weights;
}

// Natural-language search. "I want to jump higher" -> jumping and pumping,
// plus the foundations to start with and any pathway that leads there.
// Deterministic and explainable: every result says why it matched.
export function search(idx, query, { limit = 8 } = {}) {
  const { base, groups, terms } = queryTerms(query);
  const empty = { query, terms: base, skills: [], planned: [], foundations: [], pathways: [], best: null };
  if (!terms.size) return empty;
  const qnorm = String(query).toLowerCase();

  const scored = [];
  for (const s of idx.skills.values()) {
    const doc = skillDoc(idx, s);
    let score = 0;
    const matched = [];
    for (const g of groups) {
      let best = 0, bestTerm = null;
      for (const [t, qw] of g.alts) {
        const w = (doc.get(t) || 0) * qw;
        if (w > best) { best = w; bestTerm = t; }
      }
      if (best) { score += best; matched.push(bestTerm); }
    }
    if (qnorm.includes(String(s.name).toLowerCase())) score += 8;
    if (score > 0) scored.push({ skill: s, score, matched });
  }
  scored.sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));
  const top = scored.length ? scored[0].score : 0;
  const skills = scored.filter(r => r.score >= top * 0.25).slice(0, limit);

  // Topics on the roadmap (discipline planned_topics) that match too.
  const planned = [];
  for (const d of idx.disciplines.values()) {
    for (const topic of d.planned_topics || []) {
      const tt = tokens(topic);
      // Only when the rider's own words cover the whole topic ("learn a 360" -> "360s").
      const hit = tt.filter(t => base.includes(t));
      if (hit.length && hit.length === tt.length) planned.push({ discipline: d, topic, score: hit.length / tt.length });
    }
  }
  planned.sort((a, b) => b.score - a.score);

  const best = skills[0] ? skills[0].skill : null;
  const foundations = best
    ? foundationChain(idx, best.id, ['required']).map(f => idx.skills.get(f.id)).filter(Boolean)
    : [];
  const pathways = best ? pathwaysFor(idx, best.id).target : [];
  return { query, terms: base, skills, planned: planned.slice(0, 4), foundations, pathways, best };
}

// ---------- browsing ----------

export function filterSkills(idx, { discipline, difficulty, safety, competency } = {}) {
  return [...idx.skills.values()].filter(s =>
    (!discipline || (s.disciplines || []).some(d => d.id === discipline)) &&
    (!difficulty || s.difficulty === difficulty) &&
    (!safety || String(s.safety_class) === String(safety)) &&
    (!competency || (s.competencies || []).some(c => c.id === competency))
  ).sort((a, b) => (Number(a.safety_class) - Number(b.safety_class)) ||
    (Object.keys(DIFFICULTY).indexOf(a.difficulty) - Object.keys(DIFFICULTY).indexOf(b.difficulty)) ||
    a.name.localeCompare(b.name));
}

// Drills used by a set of lessons, in lesson order, without repeats.
export function drillsFor(idx, lessons) {
  const seen = new Set();
  const out = [];
  for (const l of lessons) for (const id of l.drills || []) {
    if (seen.has(id) || !idx.drills.has(id)) continue;
    seen.add(id);
    out.push(idx.drills.get(id));
  }
  return out;
}

// Lessons that use a drill (drills are shared between lessons).
export function lessonsUsingDrill(idx, drillId) {
  return [...idx.lessons.values()].filter(l => (l.drills || []).includes(drillId));
}

// ---------- integrity (seed file and CMS preflight) ----------

// Broken references and cycles in a catalog. Returns a list of problems.
export function checkIntegrity(cat) {
  const idx = indexCatalog(cat);
  const problems = [];
  const need = (map, id, what) => { if (id && !map.has(id)) problems.push(`${what} points at missing "${id}"`); };
  const ids = new Set();
  for (const key of ['skills', 'lessons', 'drills', 'mistakes', 'media', 'pathways', 'disciplines', 'competencies', 'people', 'sources']) {
    const seen = new Set();
    for (const x of cat[key] || []) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.id || '')) problems.push(`${key}: invalid id "${x.id}"`);
      if (seen.has(x.id)) problems.push(`${key}: duplicate id "${x.id}"`);
      seen.add(x.id);
      ids.add(key + ':' + x.id);
    }
  }
  for (const s of cat.skills || []) {
    for (const d of s.disciplines || []) need(idx.disciplines, d.id, `skill ${s.id}`);
    for (const c of s.competencies || []) need(idx.competencies, c.id, `skill ${s.id}`);
    for (const p of s.prerequisites || []) need(idx.skills, p.id, `skill ${s.id} prerequisite`);
    for (const r of s.related || []) need(idx.skills, r, `skill ${s.id} related`);
  }
  for (const l of cat.lessons || []) {
    need(idx.skills, l.skill_id, `lesson ${l.id}`);
    for (const d of l.drills || []) need(idx.drills, d, `lesson ${l.id}`);
    for (const m of l.mistakes || []) need(idx.mistakes, m, `lesson ${l.id}`);
    for (const m of l.media || []) need(idx.media, m, `lesson ${l.id}`);
    for (const p of l.contributors || []) need(idx.people, p.id, `lesson ${l.id}`);
    for (const x of l.sources || []) need(idx.sources, x.id, `lesson ${l.id} source`);
  }
  for (const d of cat.drills || []) { need(idx.drills, d.next_drill_id, `drill ${d.id}`); need(idx.media, d.media_id, `drill ${d.id}`); }
  for (const m of cat.mistakes || []) { need(idx.drills, m.drill_id, `mistake ${m.id}`); need(idx.media, m.media_id, `mistake ${m.id}`); }
  for (const p of cat.pathways || []) {
    need(idx.skills, p.target_skill_id, `pathway ${p.id}`);
    for (const st of p.stages || []) for (const l of st.lessons || []) need(idx.lessons, l, `pathway ${p.id}`);
  }
  try { learningOrder(idx, [...idx.skills.keys()], ['required', 'recommended', 'optional']); }
  catch (e) { problems.push(e.message); }
  return problems;
}
