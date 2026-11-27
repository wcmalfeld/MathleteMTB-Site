// The Dream Line Project: the Park Design Canvas, the Feature Library and
// the Build Plan. Placing works three ways: tap a feature's “Add” (it goes in
// the first free spot), pick a feature then tap a spot, or drag a feature
// card onto a spot. Spots are keyboard buttons: Enter places or selects,
// Delete removes. Every change updates the counts, the variables and the
// expression H = …, and the changed term is highlighted.
//
// The park lives in the lab's progress (getData('park')), so it is the same
// park on the board, in Mission 1 and in the finished blueprint.

import { el, put, button } from '../../lesson-kit/dom.js';
import { segs } from '../../lesson-kit/controls.js';
import { FEATURES, byId, ENVIRONMENTS, SPOTS, SITE_PREP, BADGES, PLANNING_NOTE, tidyPark, blankPark, counts, buildPlan, featureTotal } from '../logic/park.js';
import { parkMap, featureIcon } from './visuals.js';

export const getPark = P => tidyPark(P.getData('park', null));
export const savePark = (P, park) => P.setData('park', park);

// A mission is complete (badge earned) the same way the shell counts it:
// every fixed question, plus the current practice set if it has one.
export function earnedBadges(P, missions) {
  const out = new Set();
  for (const m of missions) {
    const ids = m.graded.map(id => [id, null]);
    if (m.practice && m.practice.ids) ids.push(...m.practice.ids.map(id => [id, 'v' + P.getData('variant:' + m.id, 0)]));
    if (ids.every(([id, k]) => P.done(id, k))) out.add(m.id);
  }
  return out;
}

// The expression with each term as its own element, so a changed term can glow.
function planExpression(plan, changed) {
  const parts = [el('span', null, 'H = ')];
  plan.terms.forEach((t, i) => parts.push(i ? ' + ' : '', el('span', { class: 'dl-term' + (t.id === changed ? ' is-new' : '') }, t.text)));
  parts.push(plan.terms.length ? ' + ' : '', el('span', { class: 'dl-term dl-term--const' }, String(SITE_PREP)));
  return el('p', { class: 'dl-plan-eq' }, parts);
}

export function buildPlanPanel(park, changed, o = {}) {
  const plan = buildPlan(park), c = counts(park);
  return el('div', { class: 'dl-plan' },
    el('p', { class: 'ls-kicker' }, 'Build plan'),
    planExpression(plan, changed),
    plan.terms.length
      ? el('dl', { class: 'dl-vars' }, plan.variables.map(v => el('div', { class: v.letter === (changed && byId[changed].letter) ? 'is-new' : '' }, el('dt', null, v.letter + ' = ' + v.value), el('dd', null, v.meaning))))
      : el('p', { class: 'ls-small' }, 'No features yet: the plan is only the 5 hours of site preparation. Add features to see their terms appear.'),
    el('p', { class: 'dl-plan-sub' }, plan.terms.length ? plan.substituted + ' = ' : 'H = ', el('b', null, String(plan.total)), ' crew-hours'),
    o.compact ? null : el('p', { class: 'ls-small' }, `${featureTotal(park)} of ${SPOTS.length} spots used · ${FEATURES.filter(f => c[f.id]).length} feature types`));
}

export function badgeRow(earned, missions) {
  return el('ul', { class: 'dl-badges', 'aria-label': 'Stage badges' }, BADGES.map(b => {
    const m = missions.find(x => x.id === b.mission), got = earned.has(b.mission);
    return el('li', { class: 'dl-badge' + (got ? ' is-earned' : '') }, el('span', { class: 'dl-badge-mark', 'aria-hidden': 'true' }, got ? '★' : '☆'),
      el('span', null, el('b', null, b.name), el('span', { class: 'ls-small' }, got ? ` · ${b.landmark} lit` : ` · Stage ${m ? m.n : ''}`)));
  }));
}

// ------------------------------------------------------------ the studio (board and Mission 1)
export function parkStudio(ctx, missions, o = {}) {
  const P = ctx.progress;
  let park = getPark(P), picked = null, selected = null, changed = null, newSpot = null;
  const mapBox = el('div', { class: 'ms-figure dl-map-box' }), planBox = el('div'), libBox = el('div', { class: 'dl-library' });
  const status = el('p', { class: 'ls-small dl-status', role: 'status', 'aria-live': 'polite' });
  const selBox = el('div', { class: 'dl-sel' });
  const save = () => savePark(P, park);
  const firstFree = () => park.slots.findIndex(x => !x);

  function place(i, fid) {
    if (i < 0) { status.textContent = 'Every spot is full. Remove a feature to make room.'; return; }
    const was = park.slots[i];
    park.slots[i] = fid; changed = fid; newSpot = i; selected = i; picked = null; save();
    const f = byId[fid], s = SPOTS[i], plan = buildPlan(park);
    status.textContent = `${was ? 'Replaced the ' + byId[was].name.toLowerCase() + ' with' : 'Added'} a ${f.name.toLowerCase()} on the ${s.lineName.toLowerCase()}, spot ${s.n}. ${f.letter} = ${counts(park)[fid]}; H = ${plan.total} crew-hours.`;
    draw(i);
  }
  function remove(i) {
    const fid = park.slots[i]; if (!fid) return;
    park.slots[i] = null; changed = fid; newSpot = null; selected = null; save();
    status.textContent = `Removed the ${byId[fid].name.toLowerCase()}. ${byId[fid].letter} = ${counts(park)[fid]}; H = ${buildPlan(park).total} crew-hours.`;
    draw(i);
  }
  function onSpot(i) {
    if (picked) { place(i, picked); return; }
    selected = park.slots[i] ? (selected === i ? null : i) : null;
    if (!park.slots[i]) status.textContent = 'Pick a feature from the library first, then tap this spot (or use a feature’s Add button).';
    draw(i);
  }

  function drawMap(focusSpot) {
    const earned = earnedBadges(P, missions);
    const map = parkMap(park, { interactive: true, selectedSpot: selected, highlight: newSpot, earned, label: `Park map, ${ENVIRONMENTS.find(e => e.id === park.env).name}. Three lines of four build spots.` });
    map.addEventListener('click', e => { const g = e.target.closest && e.target.closest('[data-spot]'); if (g) onSpot(+g.getAttribute('data-spot')); });
    map.addEventListener('keydown', e => {
      const g = e.target.closest && e.target.closest('[data-spot]'); if (!g) return;
      const i = +g.getAttribute('data-spot');
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSpot(i); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(i); }
    });
    map.addEventListener('dragover', e => { if (e.target.closest && e.target.closest('[data-spot]')) e.preventDefault(); });
    map.addEventListener('drop', e => {
      const g = e.target.closest && e.target.closest('[data-spot]'); if (!g) return;
      e.preventDefault(); const fid = e.dataTransfer && e.dataTransfer.getData('text/plain');
      if (byId[fid]) place(+g.getAttribute('data-spot'), fid);
    });
    put(mapBox, map);
    if (focusSpot !== undefined && focusSpot !== null) { const t = map.querySelector(`[data-spot="${focusSpot}"]`); if (t && document.activeElement && document.activeElement.closest && document.activeElement.closest('.dl-map-box')) t.focus(); }
  }
  function drawSel() {
    const f = selected !== null && park.slots[selected] ? byId[park.slots[selected]] : null, s = selected !== null ? SPOTS[selected] : null;
    put(selBox, picked ? el('p', { class: 'dl-sel-msg' }, el('b', null, byId[picked].name), ' picked: tap an empty spot on the map to place it, or ', button('Cancel', () => { picked = null; draw(); }, 'ls-btn--quiet dl-btn-sm'))
      : f ? el('p', { class: 'dl-sel-msg' }, el('b', null, f.name), ` on the ${s.lineName.toLowerCase()}, spot ${s.n} (${f.letter}, ${f.hours} crew-hour${f.hours === 1 ? '' : 's'}). `, button('Remove it', () => remove(selected), 'ls-btn--quiet dl-btn-sm'))
        : el('p', { class: 'ls-small dl-sel-msg' }, 'Tap a placed feature to select it (or remove it). Keyboard: Tab to a spot, Enter to place or select, Delete to remove.'));
  }
  function drawLib() {
    put(libBox, el('p', { class: 'ls-kicker' }, 'Feature library'), el('ul', { class: 'dl-lib-list' }, FEATURES.map(f => {
      const card = el('li', { class: 'dl-lib-card' + (picked === f.id ? ' is-picked' : ''), draggable: 'true' },
        el('button', { type: 'button', class: 'dl-lib-pick', 'aria-pressed': String(picked === f.id), onclick: () => { picked = picked === f.id ? null : f.id; selected = null; draw(); } },
          featureIcon(f.id, 44), el('span', { class: 'dl-lib-text' }, el('b', null, f.name), el('span', { class: 'dl-lib-cat' }, f.cat + ' · ' + f.letter + ' · ' + f.hours + ' crew-hour' + (f.hours === 1 ? '' : 's') + ' each'), el('span', { class: 'dl-lib-desc' }, f.desc))),
        button('Add', () => { picked = null; place(firstFree(), f.id); }, 'ls-btn--quiet dl-btn-sm dl-lib-add', { 'aria-label': 'Add a ' + f.name.toLowerCase() + ' to the first free spot' }));
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', f.id); e.dataTransfer.effectAllowed = 'copy'; });
      return card;
    })));
  }
  function draw(focusSpot) {
    drawMap(focusSpot); drawSel(); drawLib();
    put(planBox, buildPlanPanel(park, changed), badgeRow(earnedBadges(P, missions), missions));
    if (o.onChange) o.onChange(park);
  }
  const envPick = segs('Park environment', ENVIRONMENTS.map(e => ({ label: e.name, value: e.id })), park.env, v => { park.env = v; save(); status.textContent = ENVIRONMENTS.find(e => e.id === v).name + ': ' + ENVIRONMENTS.find(e => e.id === v).blurb + ' (Visual only: the maths is the same.)'; draw(); });
  draw();
  return el('div', { class: 'dl-studio' },
    el('div', { class: 'dl-env-row' }, el('p', { class: 'ls-kicker' }, 'Your land'), envPick),
    el('div', { class: 'ms-lab dl-studio-grid' }, el('div', { class: 'ms-lab-visual' }, mapBox, selBox, status), el('div', { class: 'ms-lab-panel' }, planBox)),
    libBox,
    el('div', { class: 'ls-actions' }, button('Clear the park', () => { if (window.confirm('Remove every feature from the map? Your answers are kept.')) { park = { ...blankPark(), env: park.env, name: park.name, desc: park.desc }; selected = picked = changed = newSpot = null; save(); status.textContent = 'The park is empty again.'; draw(); } }, 'ls-btn--ghost')),
    el('p', { class: 'ls-small' }, PLANNING_NOTE));
}

// ------------------------------------------------------------ the compact view (other missions, final, report)
export function parkMini(ctx, missions, o = {}) {
  const P = ctx.progress, park = getPark(P), plan = buildPlan(park), earned = earnedBadges(P, missions);
  const env = ENVIRONMENTS.find(e => e.id === park.env);
  return el('section', { class: 'ls-card dl-mini' + (o.big ? ' dl-mini--big' : '') },
    el('div', { class: 'dl-mini-map' }, parkMap(park, { earned, label: `${park.name || 'Your park'}: ${env.name}, ${featureTotal(park)} features.` })),
    el('div', { class: 'dl-mini-text' },
      el('p', { class: 'ls-kicker' }, o.kicker || 'Your park'),
      el('h2', { class: 'ls-h3 dl-mini-h' }, park.name || 'Your Dream Line Park'),
      el('p', { class: 'ls-small' }, `${env.name} · ${featureTotal(park)} feature${featureTotal(park) === 1 ? '' : 's'} · ${plan.total} crew-hours`),
      el('p', { class: 'dl-plan-eq dl-plan-eq--sm' }, plan.expression),
      o.badges === false ? null : badgeRow(earned, missions),
      o.edit === false ? null : el('a', { class: 'ls-btn ls-btn--quiet', href: '#board' }, 'Edit the park')));
}

// ------------------------------------------------------------ the finished park blueprint (extension page and final)
export function finishedPark(ctx, missions) {
  const P = ctx.progress;
  let park = getPark(P);
  const box = el('div');
  const draw = () => {
    park = getPark(P);
    const plan = buildPlan(park), c = counts(park), earned = earnedBadges(P, missions), env = ENVIRONMENTS.find(e => e.id === park.env);
    const nameIn = el('input', { type: 'text', class: 'ls-input dl-name-in', id: 'dl-park-name', maxlength: 60, value: park.name, placeholder: 'My Dream Line Park', autocomplete: 'off' });
    nameIn.addEventListener('change', () => { park.name = nameIn.value.trim(); savePark(P, park); draw(); });
    const desc = el('textarea', { class: 'ls-textarea', id: 'dl-park-desc', rows: 4, maxlength: 800, placeholder: 'My Dream Line Park has three tabletops, two berms and a wooden wall ride. My construction plan uses algebra to estimate the total crew-hours required.' });
    desc.value = park.desc;
    desc.addEventListener('change', () => { park.desc = desc.value; savePark(P, park); P.write('park-description', desc.value); });
    put(box,
      el('div', { class: 'dl-finished' },
        el('div', { class: 'dl-finished-map' }, parkMap(park, { earned, label: `${park.name || 'Your park'}: ${env.name}, ${featureTotal(park)} features.` })),
        el('div', { class: 'dl-finished-side' },
          el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: 'dl-park-name' }, 'Park name'), nameIn),
          el('dl', { class: 'ms-stats dl-park-stats' },
            [['Environment', env.name], ['Features', String(featureTotal(park))], ['Crew-hours', String(plan.total)], ['Stages complete', `${earned.size} of ${missions.length}`]].map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v)))),
          el('p', { class: 'dl-plan-eq' }, plan.expression), el('p', { class: 'dl-plan-sub' }, plan.substituted + ' = ', el('b', null, String(plan.total)), ' crew-hours'),
          el('ul', { class: 'dl-feat-list' }, FEATURES.filter(f => c[f.id]).map(f => el('li', null, featureIcon(f.id, 28), `${c[f.id]} × ${f.name.toLowerCase()} (${f.letter} = ${c[f.id]}, ${f.hours * c[f.id]} h)`))),
          badgeRow(earned, missions))),
      el('div', { class: 'ls-field ls-field--wide dl-desc' }, el('label', { for: 'dl-park-desc' }, 'Describe your park and what its build-plan expression means (saved for your tutor)'), desc),
      featureTotal(park) ? null : el('p', { class: 'ls-note' }, 'Your map is empty. ', el('a', { href: '#board' }, 'Add some features'), ' to see them here.'));
  };
  draw();
  return box;
}
