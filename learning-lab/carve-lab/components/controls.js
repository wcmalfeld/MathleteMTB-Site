// The control panel (PRD 3.1 B and 4): one control per variable, each with a
// name, slider, typed value, unit, short explanation, and immediate feedback
// that says what the change just did ("turn radius 12.3 → 9.8 m, tighter").
//
// createControls({ config, locked, speedUnit, onInput(name, value),
//                  onCommit(name, value), onUnit(unit) })
//   -> { node, update(config, results), setLocked(list) }

import { el, put, id as uid } from './dom.js';
import { RANGES, VARIABLES, carve, clampVariable, convertUnits, fmt } from '../logic/physics.js';
import { helpButton } from './help.js';

export const LABELS = {
  sidecutRadius: { name: 'Sidecut radius', unit: 'm', digits: 1, explain: 'The curve cut into the sides of the ski. A smaller radius is a deeper curve.' },
  edgeAngle: { name: 'Edge angle', unit: '°', digits: 1, explain: 'How far the ski is tipped up onto its edge, from flat on the snow (0°).' },
  speed: { name: 'Speed', unit: 'm/s', digits: 1, explain: 'How fast you’re moving along the turn (held steady through it).' },
  skierMass: { name: 'Skier mass', unit: 'kg', digits: 0, explain: 'The mass of the skier plus their gear.' }
};

// What changed between two results, in words.
export function describeChange(name, before, after) {
  const out = [];
  const d = (a, b, tiny) => Math.abs(a - b) > tiny;
  if (d(before.turnRadius, after.turnRadius, 0.005)) out.push(`Turn radius ${fmt(before.turnRadius, 1)} → ${fmt(after.turnRadius, 1)} m (${after.turnRadius < before.turnRadius ? 'tighter' : 'wider'})`);
  else if (name === 'speed' || name === 'skierMass') out.push('Turn radius unchanged');
  if (d(before.centripetalAcceleration, after.centripetalAcceleration, 0.005)) out.push(`acceleration ${fmt(before.centripetalAcceleration, 1)} → ${fmt(after.centripetalAcceleration, 1)} m/s² (×${fmt(after.centripetalAcceleration / before.centripetalAcceleration, 2)})`);
  else if (name === 'skierMass') out.push('acceleration unchanged');
  if (d(before.inwardForce, after.inwardForce, 0.5)) out.push(`force ${fmt(before.inwardForce, 0)} → ${fmt(after.inwardForce, 0)} N (×${fmt(after.inwardForce / before.inwardForce, 2)})`);
  return out.join(' · ');
}

export function createControls(o) {
  let config = { ...o.config }, locked = new Set(o.locked || []), speedUnit = o.speedUnit || 'kmh';
  const parts = {};
  const node = el('div', { class: 'cl-controls', role: 'group', 'aria-label': 'Ski and skier controls' });
  let baseline = carve(config), baseName = null;

  VARIABLES.forEach(name => {
    const L = LABELS[name], R = RANGES[name];
    const rid = uid('r'), nid = uid('n'), eid = uid('e'), fid = uid('fb');
    const range = el('input', { type: 'range', id: rid, min: R.min, max: R.max, step: R.step, value: config[name], 'aria-describedby': `${eid} ${fid}`, class: 'cl-range' });
    const num = el('input', { type: 'number', id: nid, min: R.min, max: R.max, step: R.step, value: config[name], class: 'cl-num', 'aria-label': `${L.name} in ${L.unit === '°' ? 'degrees' : L.unit}` });
    const alt = name === 'speed' ? el('span', { class: 'cl-alt' }) : null;
    const fb = el('p', { class: 'cl-control-fb', id: fid });
    const lock = el('p', { class: 'cl-lock', hidden: true }, 'Fixed for this challenge');
    const box = el('div', { class: 'cl-control', 'data-var': name },
      el('div', { class: 'cl-control-head' },
        el('label', { for: rid, class: 'cl-control-name' }, L.name),
        helpButton(name, L.name),
        el('span', { class: 'cl-control-value' }, num, el('span', { class: 'cl-unit' }, L.unit))),
      range,
      el('div', { class: 'cl-range-ends', 'aria-hidden': 'true' }, el('span', null, `${R.min} ${L.unit}`), alt, el('span', null, `${R.max} ${L.unit}`)),
      el('p', { class: 'cl-control-explain', id: eid }, L.explain),
      lock, fb);
    const begin = () => { if (baseName !== name) { baseline = carve(config); baseName = name; } };
    range.addEventListener('pointerdown', begin); range.addEventListener('focus', begin); num.addEventListener('focus', begin);
    range.addEventListener('input', () => set(name, Number(range.value), false));
    range.addEventListener('change', () => set(name, Number(range.value), true));
    num.addEventListener('change', () => { begin(); set(name, num.value, true); });
    num.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); begin(); set(name, num.value, true); } });
    parts[name] = { box, range, num, alt, fb, lock };
    node.appendChild(box);
  });

  // Speed units: m/s always, plus km/h or mph.
  const unitToggle = el('div', { class: 'cl-units', role: 'radiogroup', 'aria-label': 'Also show speed in' },
    el('span', { class: 'cl-units-label' }, 'Also show speed in'),
    ['kmh', 'mph'].map(u => { const b = el('button', { type: 'button', role: 'radio', class: 'cl-seg', 'data-u': u }, u === 'kmh' ? 'km/h' : 'mph');
      b.addEventListener('click', () => { speedUnit = u; if (o.onUnit) o.onUnit(u); paint(); }); return b; }));
  parts.speed.box.appendChild(unitToggle);

  function set(name, raw, commit) {
    if (locked.has(name)) return;
    const value = clampVariable(name, raw);
    config = { ...config, [name]: value };
    if (o.onInput) o.onInput(name, value);
    paint(name, commit);
    if (commit) { if (o.onCommit) o.onCommit(name, value); }
  }
  function paint(changed, committed) {
    const r = carve(config);
    VARIABLES.forEach(name => {
      const p = parts[name];
      if (document.activeElement !== p.range) p.range.value = config[name];
      // Don't rewrite a box while someone is typing in it, but do once they commit (so 99 shows as 20.0).
      if (document.activeElement !== p.num || changed !== name || committed) p.num.value = fmt(config[name], LABELS[name].digits);
      p.range.setAttribute('aria-valuetext', `${fmt(config[name], LABELS[name].digits)} ${name === 'edgeAngle' ? 'degrees' : LABELS[name].unit}`);
      const isLocked = locked.has(name);
      p.range.disabled = isLocked; p.num.disabled = isLocked; p.lock.hidden = !isLocked; p.box.classList.toggle('is-locked', isLocked);
    });
    const kmh = convertUnits(config.speed, 'm/s', speedUnit === 'mph' ? 'mph' : 'km/h');
    parts.speed.alt.textContent = `= ${fmt(kmh, 1)} ${speedUnit === 'mph' ? 'mph' : 'km/h'}`;
    unitToggle.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-u') === speedUnit)));
    if (changed && parts[changed]) {
      const text = describeChange(changed, baseline, r);
      VARIABLES.forEach(n => { if (n !== changed) put(parts[n].fb); });
      put(parts[changed].fb, text ? el('span', null, text) : null);
    }
  }
  paint();
  return {
    node,
    update(c) { config = { ...c }; baseName = null; VARIABLES.forEach(n => put(parts[n].fb)); paint(); },
    setLocked(list) { locked = new Set(list || []); paint(); },
    get config() { return { ...config }; }
  };
}
