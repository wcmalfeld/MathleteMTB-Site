// The Dream Line Project: the park model. Features, environments, the map's
// build slots, and the build-plan expression H = 4t + 3b + … + 5 that the
// student's own park produces. Pure; no DOM.
//
// Crew-hours are fictional classroom planning numbers, not real construction
// standards, and the map is a concept sketch, not a scaled construction
// plan: nothing here is jump-building or safety guidance.

import { Frac, show } from '../../lesson-kit/frac.js';

export const PLANNING_NOTE = 'Crew-hours in this lab are fictional classroom planning numbers, not real construction standards, and the map is a concept sketch, not a scaled construction plan. Nothing here is jump-building or safety guidance.';

// Each feature: its letter in the build plan and its (fictional) crew-hours.
export const FEATURES = [
  { id: 'tabletop', plural: 'tabletop jumps', name: 'Tabletop jump', letter: 't', hours: 4, cat: 'Dirt jump', desc: 'A jump with a flat deck between the takeoff and the landing.' },
  { id: 'hip', plural: 'hip jumps', name: 'Hip jump', letter: 'j', hours: 5, cat: 'Slopestyle', desc: 'Take off one way and land angled to the side.' },
  { id: 'stepup', plural: 'step-ups', name: 'Step-up', letter: 'u', hours: 4, cat: 'Dirt jump', desc: 'The landing sits higher than the takeoff.' },
  { id: 'stepdown', plural: 'step-downs', name: 'Step-down', letter: 's', hours: 3, cat: 'Dirt jump', desc: 'The landing sits lower than the takeoff.' },
  { id: 'drop', plural: 'drops', name: 'Drop', letter: 'd', hours: 5, cat: 'Freeride', desc: 'Roll off a ledge onto a downhill landing.' },
  { id: 'wallride', plural: 'wooden wall rides', name: 'Wooden wall ride', letter: 'w', hours: 6, cat: 'Wood feature', desc: 'A steep plank wall to ride across.' },
  { id: 'berm', plural: 'berms', name: 'Berm', letter: 'b', hours: 3, cat: 'Flow', desc: 'A banked corner that carries speed around the turn.' },
  { id: 'roller', plural: 'rollers', name: 'Roller', letter: 'r', hours: 1, cat: 'Flow', desc: 'A smooth hump to pump through.' },
  { id: 'pump', plural: 'pump track sections', name: 'Pump track section', letter: 'p', hours: 2, cat: 'Flow', desc: 'A short run of rollers and berms you ride without pedalling.' }
];
export const byId = Object.fromEntries(FEATURES.map(f => [f.id, f]));
export const SITE_PREP = 5;

export const ENVIRONMENTS = [
  { id: 'forest', name: 'Forest Jump Park', blurb: 'A woodland dirt-jump and slopestyle compound.' },
  { id: 'alpine', name: 'Alpine Freeride Zone', blurb: 'An open mountainside freeride setting.' },
  { id: 'backyard', name: 'Backyard Compound', blurb: 'A personal progression and dirt-jump park.' }
];

// Three lines down the hill, four build spots each. Coordinates are in the
// map's 800 × 520 viewBox.
export const LINES = [
  { id: 'green', name: 'Beginner line', short: 'Beginner', spots: [[170, 120], [130, 220], [180, 320], [140, 420]] },
  { id: 'blue', name: 'Intermediate line', short: 'Intermediate', spots: [[400, 110], [440, 210], [380, 310], [430, 410]] },
  { id: 'black', name: 'Expert line', short: 'Expert', spots: [[630, 120], [670, 220], [610, 320], [660, 420]] }
];
export const SPOTS = LINES.flatMap((l, li) => l.spots.map((xy, i) => ({ index: li * 4 + i, line: l.id, lineName: l.name, n: i + 1, x: xy[0], y: xy[1] })));

export const blankPark = () => ({ env: 'forest', slots: Array(SPOTS.length).fill(null), name: '', desc: '' });
export function tidyPark(p) {
  const b = blankPark();
  if (!p || typeof p !== 'object') return b;
  const slots = Array.isArray(p.slots) ? p.slots.slice(0, SPOTS.length).map(x => (byId[x] ? x : null)) : b.slots;
  while (slots.length < SPOTS.length) slots.push(null);
  return { env: ENVIRONMENTS.some(e => e.id === p.env) ? p.env : 'forest', slots, name: String(p.name || '').slice(0, 60), desc: String(p.desc || '').slice(0, 800) };
}

export function counts(park) {
  const c = Object.fromEntries(FEATURES.map(f => [f.id, 0]));
  for (const s of park.slots) if (s) c[s] += 1;
  return c;
}
export const featureTotal = park => park.slots.filter(Boolean).length;

// The build plan for a park: the terms in use (in library order), the
// expression, its substitution and its value. With nothing placed it's H = 5.
export function buildPlan(park) {
  const c = counts(park);
  const used = FEATURES.filter(f => c[f.id] > 0);
  const terms = used.map(f => ({ id: f.id, letter: f.letter, hours: f.hours, count: c[f.id], text: (f.hours === 1 ? '' : f.hours) + f.letter, sub: f.hours + '(' + c[f.id] + ')', value: f.hours * c[f.id] }));
  const total = terms.reduce((s, t) => s + t.value, SITE_PREP);
  return {
    terms, total,
    expression: 'H = ' + terms.map(t => t.text).concat(String(SITE_PREP)).join(' + '),
    substituted: 'H = ' + terms.map(t => t.sub).concat(String(SITE_PREP)).join(' + '),
    variables: terms.map(t => ({ letter: t.letter, meaning: 'number of ' + byId[t.id].plural, value: t.count }))
  };
}
// Adding k more of a feature raises H by k × its hours.
export const increase = (featureId, k) => byId[featureId].hours * k;

// The four stage landmarks that light up on the map as badges are earned.
export const BADGES = [
  { mission: 'blueprint', name: 'Blueprint Designer', landmark: 'Start tower' },
  { mission: 'plan', name: 'Build Planner', landmark: 'Tool shed' },
  { mission: 'materials', name: 'Materials Manager', landmark: 'Materials yard' },
  { mission: 'toolkit', name: 'Master Shaper', landmark: 'Finish arch' }
];

export { Frac, show };
