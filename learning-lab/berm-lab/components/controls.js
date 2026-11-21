// The control panel (PRD 3.1 B and 4): one control per variable, each with a
// name, slider, typed value, unit, short explanation, and immediate feedback
// saying what the change just did. The riding line has Tight / Middle / Wide
// quick picks; speed shows m/s (and optionally mph) next to km/h; grip shows
// lower / moderate / higher.
//
// createControls({ config, locked, speedUnit, onInput(name, value), onCommit, onUnit })
//   -> { node, update(config), setLocked(list), config }

import { el, put, id as uid } from './dom.js';
import { RANGES, VARIABLES, LINES, berm, clampVariable, convertUnits, gripWord, fmt } from '../logic/physics.js';
import { helpButton } from './help.js';

export const LABELS = {
  cornerRadius: { name: 'Riding line (radius)', unit: 'm', digits: 1, explain: 'How tight or wide your line is: the radius of its circle, measured flat.' },
  speedKmh: { name: 'Speed', unit: 'km/h', digits: 1, explain: 'How fast you ride through the corner (held steady).' },
  bermAngle: { name: 'Berm angle', unit: '°', digits: 1, explain: 'How steeply the berm is banked. 0° is a flat corner.' },
  totalMass: { name: 'Rider + bike mass', unit: 'kg', digits: 0, explain: 'The combined mass of the rider, the bike and their gear.' },
  availableGrip: { name: 'Available grip', unit: 'μ', digits: 2, explain: 'An illustrative grip setting for the model, not a measured tire specification.' }
};

// What changed between two results, in words.
export function describeChange(name, before, after) {
  const out = [];
  const d = (a, b, tiny) => Math.abs(a - b) > tiny;
  const x = (a, b) => (a > 0 && isFinite(a) && isFinite(b) ? ` (×${fmt(b / a, 2)})` : '');
  if (d(before.centripetalAcceleration, after.centripetalAcceleration, 0.005)) out.push(`acceleration ${fmt(before.centripetalAcceleration, 2)} → ${fmt(after.centripetalAcceleration, 2)} m/s²${x(before.centripetalAcceleration, after.centripetalAcceleration)}`);
  else if (name === 'totalMass' || name === 'bermAngle' || name === 'availableGrip') out.push('acceleration unchanged');
  if (d(before.netInwardForce, after.netInwardForce, 0.5)) out.push(`force ${fmt(before.netInwardForce, 0)} → ${fmt(after.netInwardForce, 0)} N`);
  if (d(before.requiredGrip, after.requiredGrip, 0.0005)) out.push(`grip needed ${fmt(before.requiredGrip, 2)} → ${fmt(after.requiredGrip, 2)}`);
  else if (name === 'totalMass') out.push('grip needed unchanged');
  if (name === 'availableGrip' && before.gripStatus !== after.gripStatus) out.push(after.gripStatus === 'exceeds' ? 'now beyond the model’s grip' : after.gripStatus === 'approaching' ? 'now close to the model’s limit' : 'now within the model’s grip');
  if (name === 'speedKmh' || name === 'cornerRadius') { if (d(before.leanAngle, after.leanAngle, 0.05)) out.push(`lean ${fmt(before.leanAngle, 1)}° → ${fmt(after.leanAngle, 1)}°`); }
  return out.join(' · ');
}

export function createControls(o) {
  let config = { ...o.config }, locked = new Set(o.locked || []), speedUnit = o.speedUnit === 'mph' ? 'mph' : 'ms';
  const parts = {};
  const node = el('div', { class: 'bl-controls', role: 'group', 'aria-label': 'Corner, rider and grip controls' });
  let baseline = berm(config), baseName = null;
  const begin = name => { if (baseName !== name) { baseline = berm(config); baseName = name; } };

  VARIABLES.forEach(name => {
    const Lb = LABELS[name], R = RANGES[name];
    const rid = uid('r'), eid = uid('e'), fid = uid('fb');
    const range = el('input', { type: 'range', id: rid, min: R.min, max: R.max, step: R.step, value: config[name], 'aria-describedby': `${eid} ${fid}`, class: 'bl-range' });
    const num = el('input', { type: 'number', min: R.min, max: R.max, step: R.step, value: config[name], class: 'bl-num', 'aria-label': `${Lb.name} in ${Lb.unit === '°' ? 'degrees' : Lb.unit === 'μ' ? 'grip coefficient' : Lb.unit}` });
    const alt = el('span', { class: 'bl-alt' });
    const fb = el('p', { class: 'bl-control-fb', id: fid });
    const lock = el('p', { class: 'bl-lock', hidden: true }, 'Fixed for this challenge');
    const box = el('div', { class: 'bl-control', 'data-var': name },
      el('div', { class: 'bl-control-head' },
        el('label', { for: rid, class: 'bl-control-name' }, Lb.name), helpButton(name, Lb.name),
        el('span', { class: 'bl-control-value' }, num, el('span', { class: 'bl-unit' }, Lb.unit === 'μ' ? '' : Lb.unit))),
      range,
      el('div', { class: 'bl-range-ends', 'aria-hidden': 'true' }, el('span', null, `${R.min}${Lb.unit === 'μ' ? '' : ' ' + Lb.unit}`), alt, el('span', null, `${R.max}${Lb.unit === 'μ' ? '' : ' ' + Lb.unit}`)),
      el('p', { class: 'bl-control-explain', id: eid }, Lb.explain), lock, fb);
    range.addEventListener('pointerdown', () => begin(name)); range.addEventListener('focus', () => begin(name)); num.addEventListener('focus', () => begin(name));
    range.addEventListener('input', () => set(name, Number(range.value), false));
    range.addEventListener('change', () => set(name, Number(range.value), true));
    num.addEventListener('change', () => { begin(name); set(name, num.value, true); });
    num.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); begin(name); set(name, num.value, true); } });
    parts[name] = { box, range, num, alt, fb, lock };
    node.appendChild(box);
  });

  // Riding-line quick picks (PRD 4.1).
  const presets = el('div', { class: 'bl-presets', role: 'radiogroup', 'aria-label': 'Riding line' },
    LINES.map(line => { const b = el('button', { type: 'button', role: 'radio', class: 'bl-seg', 'data-r': line.radius }, `${line.label.split(' ')[0]} ${line.radius} m`);
      b.addEventListener('click', () => { begin('cornerRadius'); set('cornerRadius', line.radius, true); }); return b; }));
  parts.cornerRadius.box.insertBefore(presets, parts.cornerRadius.box.querySelector('.bl-control-explain'));
  // Speed: m/s always shown, mph optional.
  const unitToggle = el('div', { class: 'bl-units', role: 'radiogroup', 'aria-label': 'Also show speed in' },
    el('span', { class: 'bl-units-label' }, 'Also show'),
    [['ms', 'm/s'], ['mph', 'm/s + mph']].map(([u, t]) => { const b = el('button', { type: 'button', role: 'radio', class: 'bl-seg', 'data-u': u }, t);
      b.addEventListener('click', () => { speedUnit = u; if (o.onUnit) o.onUnit(u); paint(); }); return b; }));
  parts.speedKmh.box.appendChild(unitToggle);

  function set(name, raw, commit) {
    if (locked.has(name)) return;
    config = { ...config, [name]: clampVariable(name, raw) };
    if (o.onInput) o.onInput(name, config[name]);
    paint(name, commit);
    if (commit && o.onCommit) o.onCommit(name, config[name]);
  }
  function paint(changed, committed) {
    const r = berm(config);
    VARIABLES.forEach(name => {
      const p = parts[name];
      if (document.activeElement !== p.range) p.range.value = config[name];
      if (document.activeElement !== p.num || changed !== name || committed) p.num.value = fmt(config[name], LABELS[name].digits);
      p.range.setAttribute('aria-valuetext', `${fmt(config[name], LABELS[name].digits)} ${name === 'bermAngle' ? 'degrees' : name === 'availableGrip' ? '' : LABELS[name].unit}`.trim());
      const isLocked = locked.has(name);
      p.range.disabled = isLocked; p.num.disabled = isLocked; p.lock.hidden = !isLocked; p.box.classList.toggle('is-locked', isLocked);
    });
    presets.querySelectorAll('button').forEach(b => { b.setAttribute('aria-checked', String(Math.abs(Number(b.getAttribute('data-r')) - config.cornerRadius) < 1e-9)); b.disabled = locked.has('cornerRadius'); });
    const v = convertUnits(config.speedKmh, 'km/h', 'm/s');
    parts.speedKmh.alt.textContent = `= ${fmt(v, 2)} m/s` + (speedUnit === 'mph' ? ` = ${fmt(convertUnits(v, 'm/s', 'mph'), 1)} mph` : '');
    parts.availableGrip.alt.textContent = gripWord(config.availableGrip);
    parts.bermAngle.alt.textContent = config.bermAngle === 0 ? 'flat corner' : '';
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
