// The MTB Force Lab (PRD 9). Set the forces on the rider-bike system, ride,
// and watch the motion, the free-body diagram, the numbers and the graphs
// change together. Everything comes from logic/physics.js (forceLab, step).
//
// Deterministic: the ride advances in fixed 1/60 s steps however fast the
// screen draws, so the same settings always give the same ride.
//
// createForceLab({ progress, onChange(config, results) })
//   -> { node, setConfig(c), get config, get results, ride(), pause(), resetRide(), destroy() }

import { el, svg, clear, button, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { arrow, riderSide, fbd } from './visuals.js';
import { createGraph } from '../../lesson-kit/graph.js';
import { forceLab, step, normalizeConfig, LIMITS, DEFAULTS, START_SPEED, MAX_SPEED, fmt, signed, acceleration } from '../logic/physics.js';

const DT = 1 / 60, PX_PER_M = 22, K_SCENE = 0.32, K_FBD = 0.1;
export const SCENARIO_PRESETS = {
  flat: { label: 'Flat trail', config: { ...DEFAULTS } },
  climb: { label: 'Uphill climb', config: { ...DEFAULTS, traction: 260, angle: 8 } },
  brake: { label: 'Braking', config: { ...DEFAULTS, traction: 0, braking: 220, resistance: 40, angle: 0 } }
};
const CONTROLS = [
  ['mass', 'Total rider + bike mass', 'kg', 0],
  ['traction', 'Forward tire-ground traction', 'N', 0],
  ['braking', 'Braking force', 'N', 0],
  ['resistance', 'Opposing resistance (rolling + air)', 'N', 0],
  ['angle', 'Trail angle (+ uphill, − downhill)', '°', 0]
];

export function createForceLab(o = {}) {
  const P = o.progress;
  // Kept with the student's lesson progress: the last setup and saved experiments.
  const MAX_SAVED = 8;
  const store = {
    config: () => (P ? P.getData('lab-config', DEFAULTS) : DEFAULTS),
    setConfig: c => { if (P) P.setData('lab-config', normalizeConfig(c), true); },
    saved: () => (P ? P.getData('lab-saved', []) : []),
    save: (c, label) => P.setData('lab-saved', [{ id: 'e' + Date.now().toString(36), label: String(label || '').slice(0, 60), config: normalizeConfig(c), at: new Date().toISOString() }, ...store.saved()].slice(0, MAX_SAVED)),
    remove: id => P.setData('lab-saved', store.saved().filter(e => e.id !== id))
  };
  let config = normalizeConfig(store.config()), results = forceLab(config);
  let ride = { t: 0, v: START_SPEED, x: 0, stopped: false, capped: false }, trace = [{ t: 0, v: START_SPEED }];
  let playing = false, raf = 0, last = null, acc = 0, alive = true, thirdView = 'both';

  // ---------- scene ----------
  const SW = 720, SH = 300, cx = 300, gy = 215;
  const scene = svg('svg', { viewBox: `0 0 ${SW} ${SH}`, class: 'ls-scene', role: 'img' });
  const sTitle = svg('title');
  const world = svg('g'), markers = svg('g', { class: 'ls-markers' }), riderG = svg('g'), arrowsG = svg('g'), hud = svg('g', { class: 'ls-hud' });
  scene.append(sTitle, svg('rect', { class: 'ls-sky', x: 0, y: 0, width: SW, height: SH }), world, hud);
  world.append(svg('rect', { class: 'ls-ground', x: -600, y: gy, width: 2000, height: 600 }), svg('line', { class: 'ls-ground-line', x1: -600, y1: gy, x2: 1400, y2: gy }), markers, riderG, arrowsG);
  const speedT = svg('text', { x: 16, y: 28, class: 'ls-hud-big' }), timeT = svg('text', { x: 16, y: 48, class: 'ls-hud-s' }), noteT = svg('text', { x: 16, y: 68, class: 'ls-hud-note' });
  hud.append(speedT, timeT, noteT);

  // ---------- playback ----------
  const playBtn = button('▶ Ride', () => (playing ? pause() : play()), 'ls-btn--primary');
  const resetBtn = button('↺ Reset ride', () => resetRide(), 'ls-btn--quiet');
  const presetBar = el('div', { class: 'ls-segs', role: 'group', 'aria-label': 'Scenario' }, Object.entries(SCENARIO_PRESETS).map(([id, s]) =>
    button(s.label, () => { setConfig(s.config); resetRide(); }, 'ls-seg')));
  const traceSvg = svg('svg', { viewBox: '0 0 300 120', class: 'ls-trace', role: 'img' });

  // ---------- controls ----------
  const ctrl = {};
  const controls = el('div', { class: 'ls-controls' }, CONTROLS.map(([k, label, unit]) => {
    const [lo, hi, , stp] = LIMITS[k], cid = uid('c');
    const input = el('input', { type: 'range', id: cid, min: lo, max: hi, step: stp, value: config[k], class: 'ls-range' });
    const out = el('output', { for: cid, class: 'ls-out' });
    input.addEventListener('input', () => setConfig({ ...config, [k]: Number(input.value) }, true));
    input.addEventListener('change', () => store.setConfig(config));
    ctrl[k] = { input, out, unit };
    return el('div', { class: 'ls-control' }, el('div', { class: 'ls-control-top' }, el('label', { for: cid }, label), out), input,
      el('div', { class: 'ls-range-ends', 'aria-hidden': 'true' }, el('span', null, lo + ' ' + unit), el('span', null, hi + ' ' + unit)));
  }));

  // ---------- outputs ----------
  const outRows = {};
  const OUT = [['mass', 'Total mass', 'kg', 0], ['traction', 'Forward traction', 'N', 0], ['braking', 'Braking force', 'N', 0], ['resistance', 'Opposing resistance', 'N', 0],
    ['gravityParallel', 'Gravity along the trail, mg sin θ', 'N', 1], ['netForce', 'Net force, F_net', 'N', 1], ['acceleration', 'Acceleration, a = F_net ÷ m', 'm/s²', 2], ['normal', 'Normal force, mg cos θ', 'N', 1], ['weight', 'Weight, mg', 'N', 1]];
  const outputs = el('dl', { class: 'ls-outputs' }, OUT.map(([k, label]) => { outRows[k] = el('dd'); return el('div', { class: 'ls-output' + (k === 'netForce' || k === 'acceleration' ? ' ls-output--key' : '') }, el('dt', null, label), outRows[k]); }));
  const status = el('p', { class: 'ls-lab-status', 'aria-live': 'polite' });
  const working = el('p', { class: 'ls-lab-working' });
  const fbdBox = el('div', { class: 'ls-lab-fbd' });

  // ---------- third law ----------
  const thirdSvg = svg('svg', { viewBox: '0 0 320 160', class: 'ls-third', role: 'img' });
  const thirdSeg = el('div', { class: 'ls-segs', role: 'radiogroup', 'aria-label': 'Which force to show' }, [['both', 'Both'], ['tire', 'Force on the tire'], ['ground', 'Force on the ground']].map(([v, t]) => {
    const b = el('button', { type: 'button', role: 'radio', class: 'ls-seg', 'data-v': v }, t);
    b.addEventListener('click', () => { thirdView = v; drawThird(); }); return b;
  }));

  // ---------- graphs ----------
  const gA = createGraph({ title: 'Graph A: acceleration vs. net force (at this mass)', xLabel: 'Net force', yLabel: 'Acceleration', xUnit: 'N', yUnit: 'm/s²', xDomain: [0, 400], xStep: 5, xDigits: 0, yDigits: 2 });
  const gB = createGraph({ title: 'Graph B: acceleration vs. mass (at this net force)', xLabel: 'Mass', yLabel: 'Acceleration', xUnit: 'kg', yUnit: 'm/s²', xDomain: [45, 120], xStep: 1, xDigits: 0, yDigits: 2,
    onPick: m => setConfig({ ...config, mass: m }) });
  const graphNote = el('p', { class: 'ls-graph-note' });

  // ---------- saved experiments ----------
  const savedList = el('ul', { class: 'ls-saved' });
  const labelId = uid('sl'), labelIn = el('input', { id: labelId, type: 'text', class: 'ls-input', maxlength: 60, placeholder: 'e.g. Steep climb, heavy rider' });
  const saveBtn = button('Save this setup', () => { if (!P) return; store.save(config, labelIn.value || describe(config)); labelIn.value = ''; drawSaved(); }, 'ls-btn--quiet');

  const node = el('div', { class: 'ls-lab' },
    el('div', { class: 'ls-lab-top' }, el('span', { class: 'ls-mini-label' }, 'Scenario'), presetBar),
    el('div', { class: 'ls-lab-grid' },
      el('div', { class: 'ls-lab-stage' }, scene, el('div', { class: 'ls-playbar' }, playBtn, resetBtn, el('span', { class: 'ls-small' }, `Each ride starts at ${fmt(START_SPEED * 3.6, 0)} km/h.`)),
        el('figure', { class: 'ls-trace-fig' }, el('figcaption', { class: 'ls-graph-title' }, 'Speed over time (this ride)'), traceSvg)),
      el('div', { class: 'ls-lab-panel' }, el('h3', { class: 'ls-h3' }, 'The forces'), controls)),
    el('div', { class: 'ls-lab-grid ls-lab-grid--results' },
      el('div', null, el('h3', { class: 'ls-h3' }, 'Results'), status, outputs, working),
      el('div', null, el('h3', { class: 'ls-h3' }, 'Free-body diagram (to scale)'), fbdBox)),
    el('section', { class: 'ls-card ls-third-card', 'aria-label': 'Third law: tire and ground' },
      el('h3', { class: 'ls-h3' }, 'Third law: the tire and the ground'), thirdSeg, thirdSvg,
      el('p', { class: 'ls-small' }, 'The two arrows are always the same length, and they act on different objects. Only the force on the tire goes on the bike’s free-body diagram, so they never cancel.')),
    el('div', { class: 'ls-graphs' }, el('div', { class: 'ls-graph-card' }, gA.node), el('div', { class: 'ls-graph-card' }, gB.node)), graphNote,
    el('section', { class: 'ls-card', 'aria-label': 'Saved experiments' }, el('h3', { class: 'ls-h3' }, 'Saved experiments'),
      el('div', { class: 'ls-save-row' }, el('label', { for: labelId, class: 'ls-mini-label' }, 'Name'), labelIn, saveBtn), savedList,
      el('p', { class: 'ls-small' }, 'Saved in this browser, up to 8.')));

  const describe = c => `${c.mass} kg, ${c.traction} N traction, ${c.braking} N brakes, ${c.resistance} N resistance, ${c.angle}°`;

  function drawScene() {
    const r = results, angle = config.angle;
    world.setAttribute('transform', `rotate(${-angle} ${cx} ${gy})`);
    clear(markers);
    const off = -((ride.x * PX_PER_M) % (2 * PX_PER_M));
    for (let i = -14; i <= 26; i++) {
      const x = cx + off + i * 2 * PX_PER_M, metre = Math.floor(ride.x / 2) * 2 + i * 2, major = metre % 10 === 0;
      markers.append(svg('line', { x1: x, y1: gy, x2: x, y2: gy + (major ? 14 : 7), class: 'ls-marker' }));
      if (major && metre >= 0) markers.append(svg('text', { x: x + 3, y: gy + 28, class: 'ls-marker-t' }, `${metre} m`));
      if (i % 3 === 0) markers.append(svg('circle', { cx: x + 17, cy: gy + 46 + (i % 2) * 18, r: 3 + (i % 4), class: 'ls-stone' }));
    }
    const lean = reducedMotion() ? 0 : Math.max(-8, Math.min(8, (r.acceleration || 0) * 2.5));
    clear(riderG).appendChild(svg('g', { transform: `translate(${cx} ${gy}) rotate(${lean} 0 -20)` }, riderSide(92, ride.x / (92 * 0.3 / PX_PER_M))));
    // Along-the-trail forces on the rider (to scale), drawn in the trail's frame.
    clear(arrowsG);
    const y0 = gy - 128;
    const along = [[r.traction, 1, 'traction', 'Ft'], [r.braking, -1, 'braking', 'Fb'], [r.resistance, -1, 'resistance', 'Fr'], [Math.abs(r.gravityParallel), r.gravityParallel > 0 ? -1 : 1, 'gpar', 'mg sin θ']];
    let lane = 0;
    along.forEach(([mag, dir, cls, sym]) => {
      if (mag < 0.5) return;
      arrowsG.appendChild(arrow(cx + dir * 8, y0 - lane * 16, [dir, 0], mag * K_SCENE, cls === 'gpar' ? 'g' : cls === 'traction' ? 't' : cls === 'braking' ? 'b' : 'r', `${sym} ${fmt(mag, 0)} N`, { width: 3 }));
      lane++;
    });
    if (Math.abs(r.netForce) >= 0.5) arrowsG.appendChild(arrow(cx, gy - 196, [Math.sign(r.netForce), 0], Math.abs(r.netForce) * K_SCENE, 'net', `F_net ${fmt(Math.abs(r.netForce), 0)} N`, { width: 6 }));
    else arrowsG.appendChild(svg('text', { x: cx - 30, y: gy - 192, class: 'ls-arrow-label ls-arrow--net' }, 'F_net = 0'));
    speedT.textContent = `${fmt(ride.v * 3.6, 1)} km/h  (${fmt(ride.v, 2)} m/s)`;
    timeT.textContent = `t = ${fmt(ride.t, 1)} s · ${fmt(ride.x, 1)} m travelled`;
    noteT.textContent = ride.capped ? 'Top of the model’s range (90 km/h): reset the ride.' : ride.stopped ? 'Stopped. In the model, brakes and resistance hold a stopped bike still.' : '';
    sTitle.textContent = `Rider on a ${angle === 0 ? 'flat' : Math.abs(angle) + '° ' + (angle > 0 ? 'uphill' : 'downhill')} trail at ${fmt(ride.v * 3.6, 1)} km/h. Net force ${fmt(r.netForce, 1)} N, acceleration ${fmt(r.acceleration, 2)} m/s².`;
  }
  function drawTrace() {
    clear(traceSvg);
    const W = 300, H = 120, L = 36, B = 22, T = 8, R = 8;
    const tMax = Math.max(10, Math.ceil(ride.t / 5) * 5), vMax = Math.max(10, Math.ceil(Math.max(...trace.map(p => p.v)) / 5) * 5);
    const X = t => L + t / tMax * (W - L - R), Y = v => H - B - v / vMax * (H - B - T);
    for (let v = 0; v <= vMax; v += vMax / 2) traceSvg.append(svg('line', { x1: L, x2: W - R, y1: Y(v), y2: Y(v), class: 'ls-trace-grid' }), svg('text', { x: L - 5, y: Y(v) + 4, 'text-anchor': 'end', class: 'ls-trace-t' }, String(v)));
    traceSvg.append(svg('text', { x: L, y: H - 6, class: 'ls-trace-t' }, '0 s'), svg('text', { x: W - R, y: H - 6, 'text-anchor': 'end', class: 'ls-trace-t' }, tMax + ' s'),
      svg('text', { x: 4, y: T + 6, class: 'ls-trace-t' }, 'm/s'));
    traceSvg.append(svg('polyline', { class: 'ls-trace-line', points: trace.map(p => `${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ') }));
    traceSvg.setAttribute('aria-label', `Speed over time: started at ${fmt(trace[0].v, 1)} m/s, now ${fmt(ride.v, 1)} m/s after ${fmt(ride.t, 1)} s.`);
  }
  function drawThird() {
    clear(thirdSvg);
    const F = results.traction, len = Math.min(120, F * 0.4), gx = 160, gY = 110;
    thirdSvg.append(svg('rect', { class: 'ls-ground', x: 0, y: gY, width: 320, height: 50 }), svg('line', { class: 'ls-ground-line', x1: 0, y1: gY, x2: 320, y2: gY }),
      svg('circle', { class: 'ls-tire ls-tire--big', cx: gx, cy: gY - 52, r: 52 }), svg('circle', { class: 'ls-hubdot', cx: gx, cy: gY - 52, r: 6 }));
    const on = v => thirdView === 'both' || thirdView === v;
    if (F < 0.5) { thirdSvg.append(svg('text', { x: 14, y: 22, class: 'ls-small' }, 'No traction: the tire isn’t driving, so there’s no pair along the ground.')); }
    else {
      const a = arrow(gx, gY - 6, [1, 0], len, 't', `ground on tire: ${fmt(F, 0)} N`); if (!on('tire')) a.classList.add('ls-dim');
      const b = arrow(gx, gY + 14, [-1, 0], len, 'pair', `tire on ground: ${fmt(F, 0)} N`); if (!on('ground')) b.classList.add('ls-dim');
      thirdSvg.append(a, b);
    }
    thirdSvg.setAttribute('aria-label', F < 0.5 ? 'No traction force.' : `The tire pushes backward on the ground with ${fmt(F, 0)} newtons; the ground pushes forward on the tire with ${fmt(F, 0)} newtons.`);
    thirdSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-v') === thirdView)));
  }
  function drawResults() {
    const r = results;
    OUT.forEach(([k, , unit, d]) => { outRows[k].textContent = `${k === 'netForce' || k === 'acceleration' ? signed(r[k], d) : fmt(r[k], d)} ${unit}`; });
    status.textContent = r.trend === 'steady' ? 'Balanced: net force zero, so the velocity stays the same (first law).' : r.trend === 'speeding-up' ? 'Unbalanced forward: the rider speeds up.' : 'Unbalanced backward: the rider slows down.';
    status.className = 'ls-lab-status ls-lab-status--' + r.trend;
    working.textContent = `F_net = ${fmt(r.traction, 0)} − ${fmt(r.braking, 0)} − ${fmt(r.resistance, 0)} − ${fmt(r.gravityParallel, 1).replace(/^-/, '(−') + (r.gravityParallel < 0 ? ')' : '')} = ${fmt(r.netForce, 1)} N;  a = ${fmt(r.netForce, 1)} ÷ ${r.mass} = ${fmt(r.acceleration, 2)} m/s²`;
    const forces = [{ type: 'gravity', dir: 'down', mag: r.weight }, { type: 'normal', dir: 'perp', mag: r.normal }];
    if (r.traction) forces.push({ type: 'traction', dir: 'forward', mag: r.traction });
    if (r.braking) forces.push({ type: 'braking', dir: 'backward', mag: r.braking });
    if (r.resistance) forces.push({ type: 'resistance', dir: 'backward', mag: r.resistance });
    const t = config.angle, ang = t * Math.PI / 180, fwd = [Math.cos(ang), -Math.sin(ang)];
    clear(fbdBox).appendChild(fbd({ tilt: t, forces, scale: K_FBD, rider: false, ground: 'line', W: 340, H: 300,
      title: `Free-body diagram: gravity ${fmt(r.weight, 0)} N down, normal ${fmt(r.normal, 0)} N perpendicular to the trail, traction ${fmt(r.traction, 0)} N forward, braking ${fmt(r.braking, 0)} N and resistance ${fmt(r.resistance, 0)} N backward. Net ${fmt(r.netForce, 1)} N along the trail.`,
      showNet: Math.abs(r.netForce) >= 0.5 ? { d: r.netForce > 0 ? fwd : [-fwd[0], -fwd[1]], len: Math.max(14, Math.abs(r.netForce) * K_FBD * 2), label: `F_net ${fmt(Math.abs(r.netForce), 0)} N (×2)` } : null }));
    fbdBox.appendChild(el('p', { class: 'ls-small' }, `Arrows to scale: 100 N = 10 px (the net force at double scale). Up and down balance${t ? ' perpendicular to the trail' : ''}: N = mg cos θ.`));
    gA.update({ f: F => acceleration(F, r.mass), x: Math.max(0, Math.min(400, r.netForce)) });
    const Fpos = Math.max(0, r.netForce);
    gB.update({ f: m => acceleration(Fpos, m), x: r.mass });
    graphNote.textContent = r.netForce <= 0 ? 'The net force is zero or backward: graph A’s point sits at 0 and graph B is flat. Give the rider a forward net force to see the curves.' : `Graph A: a straight line through the origin (a ∝ F at ${r.mass} kg). Graph B: a curve (a ∝ 1/m at ${fmt(r.netForce, 0)} N). Click graph B to set the mass.`;
  }
  function drawSaved() {
    clear(savedList);
    const list = store.saved();
    if (!list.length) savedList.appendChild(el('li', { class: 'ls-small' }, 'Nothing saved yet.'));
    list.forEach(e => savedList.appendChild(el('li', null, el('span', null, e.label || describe(e.config)), ' ',
      button('Load', () => { setConfig(e.config); resetRide(); }, 'ls-btn--ghost'),
      button('Remove', () => { store.remove(e.id); drawSaved(); }, 'ls-btn--ghost'))));
  }
  function drawControls() { CONTROLS.forEach(([k]) => { const c = ctrl[k]; c.input.value = config[k]; c.out.textContent = `${config[k] > 0 && k === 'angle' ? '+' : ''}${config[k]} ${c.unit}`; }); }
  function drawAll() { drawControls(); drawScene(); drawResults(); drawThird(); drawTrace(); playBtn.textContent = playing ? '❚❚ Pause' : ride.t > 0 ? '▶ Keep riding' : '▶ Ride'; playBtn.setAttribute('aria-pressed', String(playing)); }

  function tick(now) {
    if (!playing || !alive) return;
    if (last === null) last = now;
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    while (acc >= DT) {
      ride = step(ride, config, DT); acc -= DT;
      if (ride.t - trace[trace.length - 1].t >= 0.1 - 1e-9) { trace.push({ t: ride.t, v: ride.v }); if (trace.length > 400) trace.shift(); }
      if (ride.capped || ride.t >= 60) { playing = false; break; }
    }
    drawScene(); drawTrace();
    if (playing) raf = requestAnimationFrame(tick); else drawAll();
  }
  function play() { if (ride.capped) resetRide(); playing = true; last = null; acc = 0; drawAll(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
  function pause() { playing = false; cancelAnimationFrame(raf); drawAll(); }
  function resetRide() { ride = { t: 0, v: START_SPEED, x: 0, stopped: false, capped: false }; trace = [{ t: 0, v: START_SPEED }]; pause(); }
  function setConfig(c, fromControl) {
    config = normalizeConfig({ ...config, ...c }); results = forceLab(config);
    if (!fromControl) store.setConfig(config);
    drawAll();
    if (o.onChange) o.onChange(config, results);
  }

  drawAll(); drawSaved();
  return {
    node, setConfig, play, pause, resetRide,
    get config() { return { ...config }; }, get results() { return results; }, get ride() { return { ...ride }; },
    destroy() { alive = false; playing = false; cancelAnimationFrame(raf); },
    MAX_SPEED
  };
}
