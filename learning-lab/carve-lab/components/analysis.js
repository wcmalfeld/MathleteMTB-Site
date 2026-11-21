// The analysis panel (PRD 3.1 C and 7): the calculated results with their
// equations worked through, the Graph Lab (radius vs edge angle,
// acceleration vs speed, force vs speed), Compare Two Setups, and saved
// setups. Collapsible, so the simulation stays the star.
//
// createAnalysis({ progress, sim }) -> { node, update(config, results) }

import { el, svg, button, put, clear, id as uid } from './dom.js';
import { carve, calculateTurnRadius, calculateCentripetalAcceleration, G, fmt, convertUnits } from '../logic/physics.js';
import { buildPath, pathData } from '../logic/simulation.js';
import { createGraph } from './graph.js';
import { helpButton } from './help.js';

const tile = (key, label, helpKey) => {
  const value = el('p', { class: 'cl-tile-value' }), eq = el('p', { class: 'cl-tile-eq' });
  return { key, value, eq, node: el('div', { class: 'cl-tile cl-tile--' + key }, el('div', { class: 'cl-tile-head' }, el('h3', { class: 'cl-tile-label' }, label), helpButton(helpKey, label)), value, eq) };
};

export function createAnalysis(o) {
  const P = o.progress, sim = o.sim;
  const settings = P.settings;
  const bodyId = uid('an');
  let open = settings.analysisOpen !== false;
  const toggle = el('button', { type: 'button', class: 'cl-analysis-toggle', 'aria-expanded': String(open), 'aria-controls': bodyId });
  const body = el('div', { class: 'cl-analysis-body', id: bodyId });
  const node = el('section', { class: 'cl-analysis', 'aria-labelledby': bodyId + '-h' },
    el('div', { class: 'cl-analysis-head' }, el('h2', { class: 'cl-h2 cl-h2--small', id: bodyId + '-h' }, 'Analysis'), toggle), body);
  toggle.addEventListener('click', () => { open = !open; P.setSetting('analysisOpen', open); paintToggle(); });
  function paintToggle() { body.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Hide analysis ▲' : 'Show analysis ▼'; }

  // ---- results ----
  const tiles = [tile('radius', 'Turn radius', 'turnRadius'), tile('accel', 'Centripetal acceleration', 'centripetalAcceleration'), tile('g', 'Lateral g', 'gForce'),
    tile('force', 'Required inward force', 'inwardForce'), tile('turn', '180° turn', 'turnTime')];
  const modelNote = el('p', { class: 'cl-note cl-model-note' }, 'Idealized model: a pure carve on a rigid surface at constant speed. Real turns also depend on ski flex, snow and skidding. ', helpButton('model', 'About this model'));
  body.append(el('div', { class: 'cl-tiles' }, tiles.map(t => t.node)), modelNote);

  // ---- Graph Lab ----
  const g1 = createGraph({ title: 'Turn radius vs. edge angle', xLabel: 'Edge angle', xUnit: '°', yLabel: 'Turn radius', yUnit: 'm', xDomain: [0, 65], xStep: 0.5, xDigits: 1, yDigits: 1,
    onPick: x => { sim.setConfig({ ...sim.config, edgeAngle: x }); P.explored('graph-pick'); } });
  const g2 = createGraph({ title: 'Centripetal acceleration vs. speed', xLabel: 'Speed', xUnit: 'm/s', yLabel: 'Acceleration', yUnit: 'm/s²', xDomain: [0, 20], xStep: 0.1, xDigits: 1, yDigits: 1,
    onPick: x => { sim.setConfig({ ...sim.config, speed: Math.max(3, x) }); P.explored('graph-pick'); } });
  const g3 = createGraph({ title: 'Required inward force vs. speed', xLabel: 'Speed', xUnit: 'm/s', yLabel: 'Force', yUnit: 'N', xDomain: [0, 20], xStep: 0.1, xDigits: 1, yDigits: 0,
    onPick: x => { sim.setConfig({ ...sim.config, speed: Math.max(3, x) }); P.explored('graph-pick'); } });
  const n1 = el('p', { class: 'cl-graph-note' }), n2 = el('p', { class: 'cl-graph-note' }), n3 = el('p', { class: 'cl-graph-note' });
  body.append(el('div', { class: 'cl-block' },
    el('h3', { class: 'cl-h3' }, 'Graph Lab'),
    el('p', { class: 'cl-note' }, 'Every graph is drawn from the same equations as the simulator. Hover (or focus a graph and use the arrow keys) to read any point; click or press Enter to set that value.'),
    el('div', { class: 'cl-graphs' },
      el('div', { class: 'cl-graph-card' }, g1.node, el('p', { class: 'cl-formula' }, 'R = Rsc × cos θ'), n1),
      el('div', { class: 'cl-graph-card' }, g2.node, el('p', { class: 'cl-formula' }, 'a = v² ÷ R'), n2),
      el('div', { class: 'cl-graph-card' }, g3.node, el('p', { class: 'cl-formula' }, 'F = m v² ÷ R'), n3))));

  // ---- Compare two setups (Graph 4) ----
  const cmpBody = el('div', { class: 'cl-compare-body' });
  const showOnSlope = el('input', { type: 'checkbox', id: uid('cs') });
  showOnSlope.checked = !!settings.compareOnSlope;
  showOnSlope.addEventListener('change', () => { P.setSetting('compareOnSlope', showOnSlope.checked); paintGhosts(); });
  body.append(el('div', { class: 'cl-block cl-compare' },
    el('h3', { class: 'cl-h3' }, 'Compare two setups'),
    el('p', { class: 'cl-note' }, 'Save the current setup as A, change something, save it as B, and compare the turns side by side.'),
    el('div', { class: 'cl-row' },
      button('Save current as A', () => { P.setCompare('A', sim.config); P.explored('compare'); paintCompare(); }, 'cl-btn--quiet cl-btn--a'),
      button('Save current as B', () => { P.setCompare('B', sim.config); P.explored('compare'); paintCompare(); }, 'cl-btn--quiet cl-btn--b'),
      el('label', { class: 'cl-check', for: showOnSlope.id }, showOnSlope, 'Show A and B on the slope')),
    cmpBody));

  // ---- saved setups ----
  const nameId = uid('nm');
  const nameIn = el('input', { type: 'text', id: nameId, class: 'cl-input', maxlength: '40', placeholder: 'e.g. Slalom, max edge' });
  const savedList = el('ul', { class: 'cl-saved' });
  const doSave = () => { const it = P.saveSetup(nameIn.value || defaultName(), sim.config); nameIn.value = ''; paintSaved(it.id); };
  nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSave(); } });
  body.append(el('div', { class: 'cl-block' },
    el('h3', { class: 'cl-h3' }, 'Saved setups'),
    el('div', { class: 'cl-row' }, el('label', { for: nameId, class: 'cl-mini-label' }, 'Name this setup'), nameIn, button('Save setup', doSave, 'cl-btn--quiet')),
    savedList,
    el('p', { class: 'cl-note' }, 'Saved on this device.')));
  const defaultName = () => { const c = sim.config; return `${fmt(c.sidecutRadius, 0)} m ski, ${fmt(c.edgeAngle, 0)}°, ${fmt(c.speed, 0)} m/s`; };

  const short = c => `${fmt(c.sidecutRadius, 1)} m · ${fmt(c.edgeAngle, 1)}° · ${fmt(c.speed, 1)} m/s · ${fmt(c.skierMass, 0)} kg`;
  function paintSaved(flash) {
    clear(savedList);
    if (!P.state.saved.length) { savedList.appendChild(el('li', { class: 'cl-note' }, 'Nothing saved yet. Found an interesting turn? Name it and save it here.')); return; }
    P.state.saved.forEach(it => savedList.appendChild(el('li', { class: it.id === flash ? 'is-new' : null },
      el('span', { class: 'cl-saved-name' }, it.name), el('span', { class: 'cl-saved-cfg' }, short(it.config) + ` → R ${fmt(carve(it.config).turnRadius, 1)} m`),
      button('Load', () => { sim.setConfig(it.config); sim.node.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 'cl-btn--ghost', { 'aria-label': 'Load ' + it.name }),
      button('Delete', () => { P.removeSetup(it.id); paintSaved(); }, 'cl-btn--ghost', { 'aria-label': 'Delete ' + it.name }))));
  }

  function paintGhosts() {
    const list = [];
    if (showOnSlope.checked) ['A', 'B'].forEach(k => { const c = P.state.compare[k]; if (c) list.push({ path: buildPath(carve(c).turnRadius, { mode: settings.mode, turns: 4 }), label: k, cls: k.toLowerCase() }); });
    sim.setGhosts(list);
  }

  function paintCompare() {
    const A = P.state.compare.A, B = P.state.compare.B;
    clear(cmpBody);
    paintGhosts();
    if (!A && !B) { cmpBody.appendChild(el('p', { class: 'cl-note' }, 'No setups saved yet.')); update(sim.config, sim.results); return; }
    const rA = A && carve(A), rB = B && carve(B);
    // The two turns, drawn to the same scale from the same start.
    const maxR = Math.max(rA ? rA.turnRadius : 0, rB ? rB.turnRadius : 0), k = 170 / (2 * maxR + 2);
    const pic = svg('svg', { viewBox: '0 0 220 190', class: 'cl-compare-svg', role: 'img', 'aria-label': `Both turns to the same scale: A has radius ${rA ? fmt(rA.turnRadius, 1) : 'not set'} metres, B ${rB ? fmt(rB.turnRadius, 1) : 'not set'} metres.` });
    pic.appendChild(svg('rect', { width: 220, height: 190, class: 'cl-compare-snow' }));
    [[rA, 'a'], [rB, 'b']].forEach(([r, c]) => { if (!r) return; const p = buildPath(r.turnRadius); pic.appendChild(svg('path', { d: pathData(p, k, -(200 / k), -(10 / k)), class: 'cl-cmp-path cl-cmp-' + c })); });
    pic.appendChild(svg('circle', { cx: 200, cy: 10, r: 4, class: 'cl-cmp-start' }));
    [[rA, 'A', 'a'], [rB, 'B', 'b']].forEach(([r, L, c], i) => { if (r) pic.appendChild(svg('text', { x: 8, y: 20 + i * 16, class: 'cl-cmp-key cl-cmp-' + c }, `${L}: R = ${fmt(r.turnRadius, 1)} m`)); });
    const rows = [
      ['Sidecut radius', 'm', r => r.config.sidecutRadius, 1], ['Edge angle', '°', r => r.config.edgeAngle, 1], ['Speed', 'm/s', r => r.config.speed, 1], ['Skier mass', 'kg', r => r.config.skierMass, 0],
      ['Turn radius', 'm', r => r.turnRadius, 2], ['Acceleration', 'm/s²', r => r.centripetalAcceleration, 2], ['Lateral g', 'g', r => r.gForce, 2], ['Inward force', 'N', r => r.inwardForce, 0], ['Turn time', 's', r => r.turnDuration, 2]
    ];
    const table = el('table', { class: 'cl-table' },
      el('caption', { class: 'cl-sr' }, 'Setup A compared with setup B'),
      el('thead', null, el('tr', null, el('th', { scope: 'col' }, ''), el('th', { scope: 'col', class: 'cl-col-a' }, 'A'), el('th', { scope: 'col', class: 'cl-col-b' }, 'B'), el('th', { scope: 'col' }, 'B ÷ A'))),
      el('tbody', null, rows.map(([label, unit, f, d]) => {
        const a = rA ? f(rA) : null, b = rB ? f(rB) : null, same = a !== null && b !== null && Math.abs(a - b) < 1e-9;
        return el('tr', { class: same ? 'is-same' : null }, el('th', { scope: 'row' }, `${label} (${unit})`), el('td', null, a === null ? '—' : fmt(a, d)), el('td', null, b === null ? '—' : fmt(b, d)),
          el('td', { class: 'cl-ratio' }, a && b ? (same ? 'same' : '×' + fmt(b / a, 2)) : '—'));
      })));
    cmpBody.append(el('div', { class: 'cl-compare-grid' }, pic, table),
      el('div', { class: 'cl-row' }, A ? button('Load A', () => sim.setConfig(A), 'cl-btn--ghost') : null, B ? button('Load B', () => sim.setConfig(B), 'cl-btn--ghost') : null,
        button('Clear both', () => { P.setCompare('A', null); P.setCompare('B', null); paintCompare(); }, 'cl-btn--ghost')),
      rA && rB ? el('p', { class: 'cl-note' }, compareSentence(rA, rB)) : null);
    update(sim.config, sim.results);
  }

  function update(c, r) {
    put(tiles[0].value, fmt(r.turnRadius, 2), el('span', null, ' m'));
    put(tiles[0].eq, `R = ${fmt(c.sidecutRadius, 1)} × cos ${fmt(c.edgeAngle, 1)}° = ${fmt(c.sidecutRadius, 1)} × ${fmt(Math.cos(c.edgeAngle * Math.PI / 180), 3)}`);
    put(tiles[1].value, fmt(r.centripetalAcceleration, 2), el('span', null, ' m/s²'));
    put(tiles[1].eq, `a = v² ÷ R = ${fmt(c.speed, 1)}² ÷ ${fmt(r.turnRadius, 2)}`);
    put(tiles[2].value, fmt(r.gForce, 2), el('span', null, ' g'));
    put(tiles[2].eq, `${fmt(r.centripetalAcceleration, 2)} ÷ ${G}`);
    put(tiles[3].value, fmt(r.inwardForce, r.inwardForce < 10000 ? 1 : 0), el('span', null, ' N'));
    put(tiles[3].eq, `F = m × a = ${fmt(c.skierMass, 0)} × ${fmt(r.centripetalAcceleration, 2)}`);
    put(tiles[4].value, fmt(r.turnDuration, 2), el('span', null, ' s'));
    put(tiles[4].eq, `distance πR = ${fmt(r.turnDistance, 1)} m; time πR ÷ v = ${fmt(r.turnDistance, 1)} ÷ ${fmt(c.speed, 1)} (${fmt(convertUnits(c.speed, 'm/s', 'km/h'), 0)} km/h)`);
    const A = P.state.compare.A, B = P.state.compare.B, rA = A && carve(A), rB = B && carve(B);
    const marks = (fx, fy) => [[rA, 'A', 'a'], [rB, 'B', 'b']].filter(x => x[0]).map(([rr, L, cls]) => ({ x: fx(rr), y: fy(rr), label: L, cls: 'cl-g-mark--' + cls }));
    g1.update({ f: th => calculateTurnRadius(c.sidecutRadius, th), x: c.edgeAngle, markers: marks(x => x.config.edgeAngle, x => x.turnRadius) });
    const R = r.turnRadius, half = c.speed / 2, dbl = c.speed * 2;
    g2.update({ f: v => calculateCentripetalAcceleration(v, R), x: c.speed, markers: marks(x => x.config.speed, x => x.centripetalAcceleration),
      extra: [{ x: half, y: calculateCentripetalAcceleration(half, R), label: '½v', cls: 'cl-g-x--half' }, { x: dbl, y: calculateCentripetalAcceleration(dbl, R), label: '2v', cls: 'cl-g-x--double' }] });
    g3.update({ f: v => c.skierMass * calculateCentripetalAcceleration(v, R), x: c.speed, markers: marks(x => x.config.speed, x => x.inwardForce) });
    put(n1, `With a ${fmt(c.sidecutRadius, 1)} m sidecut. Tipping from 0° to 20° shrinks R by only ${fmt(c.sidecutRadius * (1 - Math.cos(20 * Math.PI / 180)), 1)} m; from 40° to 60°, by ${fmt(c.sidecutRadius * (Math.cos(40 * Math.PI / 180) - 0.5), 1)} m. The curve isn’t a straight line: it gets steeper.`);
    put(n2, `On this ${fmt(R, 1)} m turn: at ${fmt(half, 1)} m/s, a = ${fmt(calculateCentripetalAcceleration(half, R), 1)}; at ${fmt(c.speed, 1)} m/s, a = ${fmt(r.centripetalAcceleration, 1)}` +
      (dbl <= 20 ? `; at ${fmt(dbl, 1)} m/s, a = ${fmt(calculateCentripetalAcceleration(dbl, R), 1)}` : '') + ' m/s². Each doubling of speed multiplies a by 4.');
    put(n3, `Same curve shape as acceleration, multiplied by the mass (${fmt(c.skierMass, 0)} kg). A heavier skier makes the whole curve taller; the acceleration graph doesn’t change.`);
  }

  paintToggle(); paintSaved(); paintCompare();
  return { node, update };
}

function compareSentence(a, b) {
  const diffs = ['sidecutRadius', 'edgeAngle', 'speed', 'skierMass'].filter(k => Math.abs(a.config[k] - b.config[k]) > 1e-9);
  const names = { sidecutRadius: 'sidecut radius', edgeAngle: 'edge angle', speed: 'speed', skierMass: 'mass' };
  if (!diffs.length) return 'A and B are the same setup. Change one variable and save B again.';
  const which = diffs.length === 1 ? `Only the ${names[diffs[0]]} changed` : `${diffs.length} variables changed (${diffs.map(d => names[d]).join(', ')}); change just one to see its effect clearly`;
  return `${which}. Radius ×${fmt(b.turnRadius / a.turnRadius, 2)}, acceleration ×${fmt(b.centripetalAcceleration / a.centripetalAcceleration, 2)}, force ×${fmt(b.inwardForce / a.inwardForce, 2)}.`;
}
