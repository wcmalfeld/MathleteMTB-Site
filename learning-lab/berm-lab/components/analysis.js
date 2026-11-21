// The analysis panel (PRD 3.1 C, 7, 8): the calculated results with their
// equations worked through, the traction indicator, the Graph Lab (four
// graphs), the Line Comparison Lab, and saved experiments. Collapsible, so the
// simulation stays the star.
//
// createAnalysis({ progress, sim }) -> { node, update(config, results) }

import { el, button, put, clear, id as uid } from './dom.js';
import { berm, convertUnits, calculateCentripetalAcceleration, calculateRequiredGrip, calculateNetInwardForce, G, LINES, STATUS_TEXT, fmt } from '../logic/physics.js';
import { createGraph } from './graph.js';
import { helpButton } from './help.js';

const tile = (key, label, helpKey) => {
  const value = el('p', { class: 'bl-tile-value' }), eq = el('p', { class: 'bl-tile-eq' });
  return { key, value, eq, node: el('div', { class: 'bl-tile bl-tile--' + key }, el('div', { class: 'bl-tile-head' }, el('h3', { class: 'bl-tile-label' }, label), helpButton(helpKey, label)), value, eq) };
};
const kmh = ms => convertUnits(ms, 'm/s', 'km/h');

export function createAnalysis(o) {
  const P = o.progress, sim = o.sim;
  const bodyId = uid('an');
  let open = P.settings.analysisOpen !== false;
  const toggle = el('button', { type: 'button', class: 'bl-analysis-toggle', 'aria-expanded': String(open), 'aria-controls': bodyId });
  const body = el('div', { class: 'bl-analysis-body', id: bodyId });
  const node = el('section', { class: 'bl-analysis', 'aria-labelledby': bodyId + '-h' },
    el('div', { class: 'bl-analysis-head' }, el('h2', { class: 'bl-h2 bl-h2--small', id: bodyId + '-h' }, 'Analysis'), toggle), body);
  toggle.addEventListener('click', () => { open = !open; P.setSetting('analysisOpen', open); paintToggle(); });
  function paintToggle() { body.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Hide analysis ▲' : 'Show analysis ▼'; }

  // ---- results ----
  const tiles = [tile('radius', 'Turn radius', 'cornerRadius'), tile('accel', 'Centripetal acceleration', 'centripetalAcceleration'), tile('force', 'Net inward force', 'netInwardForce'),
    tile('lean', 'Lean angle', 'leanAngle'), tile('matched', 'Matched speed', 'matchedSpeed'), tile('normal', 'Normal & friction', 'normalForce')];
  const meter = el('div', { class: 'bl-meter', role: 'img' });
  const meterText = el('p', { class: 'bl-meter-text' });
  const gripTile = el('div', { class: 'bl-tile bl-tile--grip' }, el('div', { class: 'bl-tile-head' }, el('h3', { class: 'bl-tile-label' }, 'Grip: needed vs. available'), helpButton('requiredGrip', 'Grip demand')),
    el('p', { class: 'bl-tile-value bl-grip-value' }), meter, meterText);
  body.append(el('div', { class: 'bl-tiles' }, gripTile, tiles.map(t => t.node)),
    el('p', { class: 'bl-note bl-model-note' }, 'Idealized steady-state banked turn. The grip numbers are an illustrative model setting, not real tire data, and nothing here is riding or safety advice.'),
    el('p', { class: 'bl-note bl-model-note' }, el('span', { class: 'bl-help-pair' }, 'About this model', helpButton('model', 'About this model')), el('span', { class: 'bl-help-pair' }, 'Why do I feel pushed outward?', helpButton('centrifugal', 'Why do I feel pushed outward?'))));

  // ---- Graph Lab ----
  const setVar = (k, v) => { sim.setConfig({ ...sim.config, [k]: v }); P.explored('graph-pick'); };
  const g1 = createGraph({ title: 'Centripetal acceleration vs. speed', xLabel: 'Speed', xUnit: 'm/s', yLabel: 'Acceleration', yUnit: 'm/s²', xDomain: [0, 10], xStep: 0.1, xDigits: 1, yDigits: 2, onPick: x => setVar('speedKmh', x * 3.6) });
  const g2 = createGraph({ title: 'Grip needed vs. berm angle', xLabel: 'Berm angle', xUnit: '°', yLabel: 'Grip needed', yUnit: 'μ', xDomain: [0, 45], xStep: 0.5, xDigits: 1, yDigits: 2, onPick: x => setVar('bermAngle', x) });
  const g3 = createGraph({ title: 'Grip needed vs. corner radius', xLabel: 'Corner radius', xUnit: 'm', yLabel: 'Grip needed', yUnit: 'μ', xDomain: [3, 12], xStep: 0.1, xDigits: 1, yDigits: 2, onPick: x => setVar('cornerRadius', x) });
  const g4 = createGraph({ title: 'Net inward force vs. mass', xLabel: 'Rider + bike mass', xUnit: 'kg', yLabel: 'Force', yUnit: 'N', xDomain: [35, 120], xStep: 1, xDigits: 0, yDigits: 0, onPick: x => setVar('totalMass', x) });
  const notes = [0, 1, 2, 3].map(() => el('p', { class: 'bl-graph-note' }));
  const eqs = ['a = v² ÷ r   (a quadratic in v)', 'μ = |sin β − q cos β| ÷ (cos β + q sin β),   q = v²/(rg)\nlowest (zero) at the matched angle β = arctan(v²/rg)', 'μ with r changing: q = v²/(rg) shrinks as r grows', 'F = m v² ÷ r   (a straight line through the origin in m)'];
  const card = (g, i) => el('div', { class: 'bl-graph-card' }, g.node, el('details', { class: 'bl-formula' }, el('summary', null, 'Show the equation'), el('p', null, eqs[i])), notes[i]);
  body.append(el('div', { class: 'bl-block' },
    el('h3', { class: 'bl-h3' }, 'Graph Lab'),
    el('p', { class: 'bl-note' }, 'Every graph comes from the same equations as the simulator. Hover (or focus a graph and use the arrow keys) to read any point; click or press Enter to set that value in the simulator.'),
    el('div', { class: 'bl-graphs' }, card(g1, 0), card(g2, 1), card(g3, 2), card(g4, 3))));

  // ---- Line Comparison Lab ----
  const lcBody = el('div', { class: 'bl-lines-body' });
  const predName = uid('lp');
  const predFs = el('fieldset', { class: 'bl-choices bl-choices--row' }, el('legend', { class: 'bl-prompt' }, 'Predict first: which line asks for the least grip at your current speed and berm angle?'),
    LINES.map(l => el('label', { class: 'bl-choice' }, el('input', { type: 'radio', name: predName, value: l.id }), el('span', null, l.label))));
  const predMsg = el('p', { class: 'bl-note', role: 'status', 'aria-live': 'polite' });
  const revealBtn = button('Reveal the comparison', () => {
    const pick = predFs.querySelector('input:checked');
    if (!pick) { predMsg.textContent = 'Make a prediction first (there’s no penalty for being wrong).'; return; }
    P.explored('lines-revealed'); P.setSetting('linePrediction', pick.value); paintLines();
  }, 'bl-btn--primary');
  const rideAll = button('▶ Ride all three lines', () => { if (o.onRideAll) o.onRideAll(); }, 'bl-btn--quiet');
  body.append(el('div', { class: 'bl-block bl-linecmp' },
    el('h3', { class: 'bl-h3' }, 'Line comparison'),
    el('p', { class: 'bl-note' }, 'The same corner, three lines, at your current speed, berm angle, mass and grip. (Simplified: all three use the same bank angle.)'),
    el('div', { class: 'bl-pred' }, predFs, el('div', { class: 'bl-actions' }, revealBtn, rideAll), predMsg), lcBody));

  // ---- saved experiments ----
  const nameId = uid('nm');
  const nameIn = el('input', { type: 'text', id: nameId, class: 'bl-input', maxlength: '40', placeholder: 'e.g. Fast wide line' });
  const savedList = el('ul', { class: 'bl-saved' });
  const doSave = () => { const it = P.saveSetup(nameIn.value || defaultName(), sim.config); nameIn.value = ''; paintSaved(it.id); };
  nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSave(); } });
  body.append(el('div', { class: 'bl-block' },
    el('h3', { class: 'bl-h3' }, 'Saved experiments'),
    el('div', { class: 'bl-row' }, el('label', { for: nameId, class: 'bl-mini-label' }, 'Name this corner'), nameIn, button('Save experiment', doSave, 'bl-btn--quiet')),
    savedList, el('p', { class: 'bl-note' }, 'Saved on this device.')));
  const defaultName = () => { const c = sim.config; return `${fmt(c.cornerRadius, 0)} m line, ${fmt(c.speedKmh, 0)} km/h, ${fmt(c.bermAngle, 0)}° berm`; };
  const short = c => `r ${fmt(c.cornerRadius, 1)} m · ${fmt(c.speedKmh, 1)} km/h · ${fmt(c.bermAngle, 1)}° · ${fmt(c.totalMass, 0)} kg · grip ${fmt(c.availableGrip, 2)}`;
  function paintSaved(flash) {
    clear(savedList);
    if (!P.state.saved.length) { savedList.appendChild(el('li', { class: 'bl-note' }, 'Nothing saved yet. Built a corner you like? Name it and save it here.')); return; }
    P.state.saved.forEach(it => savedList.appendChild(el('li', { class: it.id === flash ? 'is-new' : null },
      el('span', { class: 'bl-saved-name' }, it.name), el('span', { class: 'bl-saved-cfg' }, short(it.config) + ` → grip needed ${fmt(berm(it.config).requiredGrip, 2)}`),
      button('Load', () => { sim.setConfig(it.config); sim.node.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 'bl-btn--ghost', { 'aria-label': 'Load ' + it.name }),
      button('Delete', () => { P.removeSetup(it.id); paintSaved(); }, 'bl-btn--ghost', { 'aria-label': 'Delete ' + it.name }))));
  }

  function paintLines() {
    const c = sim.config, revealed = !!P.state.explored['lines-revealed'];
    clear(lcBody);
    predFs.hidden = revealed; revealBtn.hidden = revealed;
    if (!revealed) return;
    const cols = LINES.map(l => ({ label: l.label.split(' ')[0], r: berm({ ...c, cornerRadius: l.radius }), id: l.id }));
    if (!LINES.some(l => Math.abs(l.radius - c.cornerRadius) < 1e-9)) cols.push({ label: 'Your line', r: berm(c), id: 'yours' });
    const best = cols.slice(0, 3).reduce((a, b) => (b.r.requiredGrip < a.r.requiredGrip ? b : a));
    const pred = P.settings.linePrediction;
    const rows = [
      ['Radius (m)', x => fmt(x.turnRadius, 1)], ['Speed (km/h)', x => fmt(x.config.speedKmh, 1)], ['Acceleration (m/s²)', x => fmt(x.centripetalAcceleration, 2)],
      ['Net inward force (N)', x => fmt(x.netInwardForce, 0)], ['Lean angle (°)', x => fmt(x.leanAngle, 1)], ['Grip needed (μ)', x => fmt(x.requiredGrip, 2)],
      ['Model grip status', x => x.gripStatus === 'within' ? 'within' : x.gripStatus === 'approaching' ? 'close to limit' : 'beyond'],
      ['Distance (m)', x => fmt(x.turnDistance, 1)], ['Time through (s)', x => fmt(x.turnDuration, 2)]
    ];
    lcBody.append(
      pred ? el('p', { class: 'bl-verdict ' + (pred === best.id ? 'is-right' : 'is-wrong') }, pred === best.id ? `✓ You predicted the ${best.label.toLowerCase()} line, and it asks for the least grip here.` : `You predicted the ${(LINES.find(l => l.id === pred) || {}).label || pred}. At these settings the ${best.label.toLowerCase()} line asks for the least grip: look at the acceleration row to see why.`) : null,
      el('div', { class: 'bl-table-wrap' }, el('table', { class: 'bl-table' }, el('caption', { class: 'bl-sr' }, 'Tight, middle and wide lines compared'),
        el('thead', null, el('tr', null, el('th', { scope: 'col' }, ''), cols.map(x => el('th', { scope: 'col', class: x.id === best.id ? 'is-best' : null }, x.label)))),
        el('tbody', null, rows.map(([label, f]) => el('tr', null, el('th', { scope: 'row' }, label), cols.map(x => el('td', { class: x.id === best.id ? 'is-best' : null }, f(x.r)))))))),
      el('p', { class: 'bl-note' }, `Wider lines: lower acceleration and grip demand, but more distance (πr). The tight line is ${fmt(cols[2].r.turnDuration - cols[0].r.turnDuration, 2)} s quicker than the wide one at this speed.`),
      button('Hide and predict again', () => { delete P.state.explored['lines-revealed']; P.setSetting('linePrediction', null); paintLines(); }, 'bl-btn--ghost'));
  }

  function update(c, r) {
    const st = r.gripStatus;
    gripTile.className = 'bl-tile bl-tile--grip is-' + st;
    put(gripTile.querySelector('.bl-grip-value'), fmt(r.requiredGrip, 2), el('span', null, ` needed of ${fmt(c.availableGrip, 2)}`));
    const max = Math.max(0.8, Math.min(2, r.requiredGrip * 1.1));
    put(meter, el('span', { class: 'bl-meter-need', style: { width: Math.min(100, r.requiredGrip / max * 100).toFixed(1) + '%' } }),
      el('span', { class: 'bl-meter-avail', style: { left: (c.availableGrip / max * 100).toFixed(1) + '%' } }));
    meter.setAttribute('aria-label', `Grip needed ${fmt(r.requiredGrip, 2)}, available ${fmt(c.availableGrip, 2)}: ${STATUS_TEXT[st]}.`);
    put(meterText, el('b', null, STATUS_TEXT[st]), ` · margin ${fmt(r.gripMargin, 2)}`);
    put(tiles[0].value, fmt(r.turnRadius, 1), el('span', null, ' m'));
    put(tiles[0].eq, `${(LINES.find(l => Math.abs(l.radius - c.cornerRadius) < 1e-9) || { label: 'Your own line' }).label} · πr = ${fmt(r.turnDistance, 1)} m in ${fmt(r.turnDuration, 2)} s`);
    put(tiles[1].value, fmt(r.centripetalAcceleration, 2), el('span', null, ' m/s²'));
    put(tiles[1].eq, `a = v² ÷ r = ${fmt(r.speed, 2)}² ÷ ${fmt(r.turnRadius, 1)} = ${fmt(r.gForce, 2)} g`);
    put(tiles[2].value, fmt(r.netInwardForce, 0), el('span', null, ' N'));
    put(tiles[2].eq, `F = m v² ÷ r = ${fmt(c.totalMass, 0)} × ${fmt(r.centripetalAcceleration, 2)}`);
    put(tiles[3].value, fmt(r.leanAngle, 1), el('span', null, '°'));
    put(tiles[3].eq, `θ = arctan(v² ÷ rg) = arctan(${fmt(r.turnDemand, 3)})`);
    if (r.idealMatchedSpeed === null) { put(tiles[4].value, '—'); put(tiles[4].eq, 'Flat corner: there’s no matched speed. Every bit of the turn relies on tire grip (μ = v² ÷ rg).'); }
    else { put(tiles[4].value, fmt(r.idealMatchedSpeedKmh, 1), el('span', null, ' km/h')); put(tiles[4].eq, `√(r g tan β) = ${fmt(r.idealMatchedSpeed, 2)} m/s. You’re ${r.speed > r.idealMatchedSpeed + 0.01 ? 'faster' : r.speed < r.idealMatchedSpeed - 0.01 ? 'slower' : 'right on it'}.`); }
    put(tiles[5].value, fmt(r.normalForce, 0), el('span', null, ' N'));
    put(tiles[5].eq, Math.abs(r.frictionForce) < 0.5 ? 'friction ≈ 0 (matched)' : `friction ${fmt(Math.abs(r.frictionForce), 0)} N ${r.frictionForce > 0 ? 'up' : 'down'} the berm`);
    // graphs
    const v = r.speed, R = r.turnRadius, b = c.bermAngle;
    g1.update({ f: x => calculateCentripetalAcceleration(x, R), x: v, extra: [{ x: v / 2, y: calculateCentripetalAcceleration(v / 2, R), label: '½v' }, { x: 2 * v, y: calculateCentripetalAcceleration(2 * v, R), label: '2v' }, { x: 3 * v, y: calculateCentripetalAcceleration(3 * v, R), label: '3v' }] });
    const matched = r.matchedBermAngle;
    g2.update({ f: x => calculateRequiredGrip(v, R, x), x: b, hlines: [{ y: c.availableGrip, label: `available ${fmt(c.availableGrip, 2)}` }], extra: matched <= 45 ? [{ x: matched, y: 0, label: `matched ${fmt(matched, 1)}°` }] : [] });
    g3.update({ f: x => calculateRequiredGrip(v, x, b), x: R, hlines: [{ y: c.availableGrip, label: `available ${fmt(c.availableGrip, 2)}` }] });
    g4.update({ f: m => calculateNetInwardForce(m, v, R), x: c.totalMass, extra: [{ x: c.totalMass / 2, y: calculateNetInwardForce(c.totalMass / 2, v, R), label: '½m' }] });
    put(notes[0], `On this ${fmt(R, 1)} m line: ${fmt(v, 2)} m/s needs ${fmt(r.centripetalAcceleration, 2)} m/s²` + (2 * v <= 10 ? `; twice the speed, ${fmt(calculateCentripetalAcceleration(2 * v, R), 2)} (×4)` : '') + (3 * v <= 10 ? `; three times, ${fmt(calculateCentripetalAcceleration(3 * v, R), 2)} (×9)` : '') + '.');
    put(notes[1], matched <= 45 ? `The lowest point, zero, is at the matched angle ${fmt(matched, 1)}° (= your lean angle). Steeper or shallower than that, the model needs friction again.` : `At this speed and radius the matched angle is ${fmt(matched, 1)}°, steeper than this lab’s 45° limit, so the grip needed keeps falling all the way to 45°.`);
    put(notes[2], `With speed and bank fixed, a wider radius generally lowers the grip needed${b > 0 ? ', down to zero where the line’s radius matches the bank' : ''}.`);
    put(notes[3], `A straight line through zero: doubling the mass doubles the force (${fmt(calculateNetInwardForce(c.totalMass / 2, v, R), 0)} → ${fmt(r.netInwardForce, 0)} N). The acceleration and grip needed don’t change.`);
    paintLines();
  }

  paintToggle(); paintSaved();
  return { node, update };
}
