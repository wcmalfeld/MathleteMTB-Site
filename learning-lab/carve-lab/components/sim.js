// The interactive carve simulator (PRD 4 and 6): the canvas, the playback
// controls (play / pause / restart, animation speed, single or linked turns,
// vector toggles, scale, and a scrubber to stop anywhere and inspect the
// vectors) and the control panel. Used full-size on the Simulator page and
// inside each challenge.
//
// The path is rebuilt only when the configuration changes; each animation
// frame just moves the skier along it (PRD 6.1).
//
// createSimulator({ config, locked, settings, ghosts, onChange(config, results),
//                   onSetting(key, value), onPlay(config), onEnd(config), panelExtra })

import { el, button, id as uid } from './dom.js';
import { carve, normalizeConfig, fmt } from '../logic/physics.js';
import { buildPath, pathTime } from '../logic/simulation.js';
import { createScene } from './scene.js';
import { createControls } from './controls.js';

const ANIM_SPEEDS = [0.25, 0.5, 1, 2];

export function createSimulator(o = {}) {
  const settings = { mode: 'single', animSpeed: 1, scale: 'fixed', speedUnit: 'kmh', vectors: { velocity: true, acceleration: true, force: true }, ...(o.settings || {}) };
  settings.vectors = { ...settings.vectors };
  let config = normalizeConfig(o.config), results = carve(config), path = buildPath(results.turnRadius, { mode: settings.mode, turns: 4 });
  let s = 0, playing = false, raf = 0, last = null, frame = 0, ghosts = o.ghosts || [], cfgChanged = true, alive = true;
  const scene = createScene();
  const setSetting = (k, v) => { settings[k] = v; if (o.onSetting) o.onSetting(k, v); };

  // ---- playback bar ----
  const playBtn = button('▶ Start turn', () => (playing ? pause() : play()), 'cl-btn--primary cl-play');
  const restartBtn = button('↺ Restart', () => restart(), 'cl-btn--quiet');
  const speedSel = el('select', { class: 'cl-select', id: uid('as') }, ANIM_SPEEDS.map(x => el('option', { value: x, selected: x === settings.animSpeed ? true : null }, x === 1 ? 'Real time' : x + '×')));
  speedSel.addEventListener('change', () => setSetting('animSpeed', Number(speedSel.value)));
  const seg = (label, key, opts) => {
    const g = el('div', { class: 'cl-segs', role: 'radiogroup', 'aria-label': label });
    opts.forEach(([val, text]) => { const b = el('button', { type: 'button', role: 'radio', class: 'cl-seg', 'data-v': val }, text);
      b.addEventListener('click', () => { setSetting(key, val); if (key === 'mode') rebuild(true); paintBar(); draw(); }); g.appendChild(b); });
    return g;
  };
  const modeSeg = seg('Turn shape', 'mode', [['single', 'One turn'], ['linked', 'Linked turns']]);
  const scaleSeg = seg('Scale', 'scale', [['fixed', 'True scale'], ['fit', 'Zoom to fit']]);
  const vecBoxes = [['velocity', 'Velocity', 'v'], ['acceleration', 'Acceleration', 'a'], ['force', 'Force', 'f']].map(([k, label, c]) => {
    const cid = uid('vb'), box = el('input', { type: 'checkbox', id: cid, checked: settings.vectors[k] ? true : null });
    box.addEventListener('change', () => { settings.vectors[k] = box.checked; setSetting('vectors', { ...settings.vectors }); draw(); });
    return el('label', { for: cid, class: 'cl-vecbox cl-vecbox--' + c }, box, el('span', { class: 'cl-swatch', 'aria-hidden': 'true' }), label);
  });
  const scrubId = uid('sc');
  const scrub = el('input', { type: 'range', id: scrubId, min: 0, max: 1000, step: 1, value: 0, class: 'cl-range cl-scrub' });
  // Read the position first: pausing redraws (and would reset) the scrubber.
  scrub.addEventListener('input', () => { const at = Number(scrub.value) / 1000; playing = false; cancelAnimationFrame(raf); s = path.length * at; paintBar(); draw(); });
  const asId = speedSel.getAttribute('id');
  const bar = el('div', { class: 'cl-playbar' },
    el('div', { class: 'cl-playbar-row' }, playBtn, restartBtn, el('label', { for: asId, class: 'cl-mini-label' }, 'Animation'), speedSel, modeSeg),
    el('div', { class: 'cl-playbar-row' }, el('span', { class: 'cl-mini-label' }, 'Show'), vecBoxes, scaleSeg),
    el('div', { class: 'cl-playbar-row cl-scrub-row' }, el('label', { for: scrubId, class: 'cl-mini-label' }, 'Position along the line'), scrub));
  function paintBar() {
    playBtn.textContent = playing ? '❚❚ Pause' : (s >= path.length - 1e-6 && s > 0 ? '▶ Run it again' : s > 0 ? '▶ Resume' : '▶ Start turn');
    playBtn.setAttribute('aria-pressed', String(playing));
    modeSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-v') === settings.mode)));
    scaleSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-v') === settings.scale)));
  }

  // ---- control panel ----
  const announce = el('p', { class: 'cl-sr', 'aria-live': 'polite' });
  let announceTimer = null;
  const controls = createControls({ config, locked: o.locked, speedUnit: settings.speedUnit,
    onInput: (name, value) => setConfig({ ...config, [name]: value }, { fromControls: true }),
    onCommit: () => { if (o.onCommit) o.onCommit(config, results); },
    onUnit: u => setSetting('speedUnit', u) });
  const panel = el('div', { class: 'cl-sim-panel' }, el('h2', { class: 'cl-panel-title' }, o.panelTitle || 'Your setup'), controls.node, o.panelExtra || null);
  const node = el('div', { class: 'cl-sim' + (o.compact ? ' cl-sim--compact' : '') },
    el('div', { class: 'cl-sim-stage' }, scene.node, bar), panel, announce);

  function rebuild(keepFraction) {
    const frac = keepFraction && path.length ? s / path.length : 0;
    path = buildPath(results.turnRadius, { mode: settings.mode, turns: 4 });
    s = frac * path.length;
    cfgChanged = true;
  }
  function draw() {
    if (!alive) return;
    scene.render({ path, config, results, s, vectors: settings.vectors, ghosts, scale: settings.scale, time: s / config.speed, total: pathTime(path, config.speed), playing, frame, cfgChanged });
    cfgChanged = false;
    if (document.activeElement !== scrub) scrub.value = String(Math.round(path.length ? s / path.length * 1000 : 0));
    scrub.setAttribute('aria-valuetext', `${fmt(s, 1)} of ${fmt(path.length, 1)} metres along the line`);
  }
  function tick(t) {
    if (!playing || !alive) return;
    if (last === null) last = t;
    const dt = Math.min(0.1, (t - last) / 1000) * settings.animSpeed;
    last = t; frame++;
    s += config.speed * dt;
    if (s >= path.length) { s = path.length; playing = false; draw(); paintBar(); if (o.onEnd) o.onEnd(config, results); return; }
    draw();
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (s >= path.length - 1e-6) s = 0;
    playing = true; last = null; paintBar();
    if (o.onPlay) o.onPlay(config, results);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function pause() { playing = false; cancelAnimationFrame(raf); paintBar(); draw(); }
  function restart() { s = 0; play(); }

  function setConfig(c, opts = {}) {
    config = normalizeConfig(c); results = carve(config);
    rebuild(true);
    if (!opts.fromControls) controls.update(config);
    draw(); paintBar();
    if (o.onChange) o.onChange(config, results);
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { announce.textContent = `Turn radius ${fmt(results.turnRadius, 1)} metres. Acceleration ${fmt(results.centripetalAcceleration, 1)} metres per second squared, ${fmt(results.gForce, 2)} g. Inward force ${fmt(results.inwardForce, 0)} newtons.`; }, 900);
  }

  paintBar(); draw();
  return {
    node, scene, controls,
    get config() { return { ...config }; }, get results() { return results; }, get path() { return path; }, get playing() { return playing; },
    setConfig, play, pause, restart,
    setGhosts(list) { ghosts = list || []; draw(); },
    setLocked(list) { controls.setLocked(list); },
    destroy() { alive = false; playing = false; cancelAnimationFrame(raf); }
  };
}
