// The interactive berm simulator (PRD 4 and 6): the canvas, the playback
// controls (start / pause / restart, animation speed, top-down or
// cross-section view, ride all three lines at once, vector toggles, and a
// scrubber to stop anywhere) and the control panel. Used full-size on the
// Simulator page and inside each challenge.
//
// Time-based and deterministic: each frame only advances the clock; where
// each rider is comes from logic/simulation.js, the physics from berm().
//
// createSimulator({ config, locked, settings, onChange(config, results),
//                   onSetting(key, value), onPlay, onEnd, panelExtra, panelTitle, compact })

import { el, button, id as uid } from './dom.js';
import { berm, normalizeConfig, fmt, LINES } from '../logic/physics.js';
import { createScene } from './scene.js';
import { createControls } from './controls.js';

const ANIM_SPEEDS = [0.25, 0.5, 1, 2];
const VECTORS = [['velocity', 'Velocity', 'v', 'top'], ['acceleration', 'Acceleration', 'a', 'top'], ['force', 'Net force', 'f', 'both'],
  ['normal', 'Normal', 'n', 'section'], ['friction', 'Friction', 'fr', 'section'], ['gravity', 'Gravity', 'g', 'section']];

export function createSimulator(o = {}) {
  const settings = { view: 'top', allLines: false, animSpeed: 1, speedUnit: 'ms', ...(o.settings || {}) };
  settings.vectors = { velocity: true, acceleration: true, force: true, normal: true, friction: true, gravity: true, ...((o.settings || {}).vectors || {}) };
  let config = normalizeConfig(o.config), results = berm(config);
  let t = 0, playing = false, raf = 0, last = null, alive = true;
  const scene = createScene();
  const setSetting = (k, v) => { settings[k] = v; if (o.onSetting) o.onSetting(k, v); };
  const endTime = () => {
    const v = results.speed, own = Math.PI * config.cornerRadius / v;
    return settings.allLines ? Math.max(own, ...LINES.map(l => Math.PI * l.radius / v)) : own;
  };

  // ---- playback bar ----
  const playBtn = button('▶ Start turn', () => (playing ? pause() : play()), 'bl-btn--primary bl-play');
  const restartBtn = button('↺ Restart', () => restart(), 'bl-btn--quiet');
  const speedSel = el('select', { class: 'bl-select', id: uid('as') }, ANIM_SPEEDS.map(x => el('option', { value: x, selected: x === settings.animSpeed ? true : null }, x === 1 ? 'Real time' : x + '×')));
  speedSel.addEventListener('change', () => setSetting('animSpeed', Number(speedSel.value)));
  const viewSeg = el('div', { class: 'bl-segs', role: 'radiogroup', 'aria-label': 'View' },
    [['top', 'Top-down'], ['section', 'Cross-section']].map(([v, text]) => { const b = el('button', { type: 'button', role: 'radio', class: 'bl-seg', 'data-v': v }, text);
      b.addEventListener('click', () => setView(v)); return b; }));
  const allId = uid('al'), allBox = el('input', { type: 'checkbox', id: allId, checked: settings.allLines ? true : null });
  allBox.addEventListener('change', () => { setSetting('allLines', allBox.checked); draw(); });
  const vecBoxes = VECTORS.map(([k, label, c, where]) => {
    const cid = uid('vb'), box = el('input', { type: 'checkbox', id: cid, checked: settings.vectors[k] ? true : null });
    box.addEventListener('change', () => { settings.vectors[k] = box.checked; setSetting('vectors', { ...settings.vectors }); draw(); });
    return el('label', { for: cid, class: `bl-vecbox bl-vecbox--${c}`, 'data-where': where }, box, el('span', { class: 'bl-swatch', 'aria-hidden': 'true' }), label);
  });
  const scrubId = uid('sc');
  const scrub = el('input', { type: 'range', id: scrubId, min: 0, max: 1000, step: 1, value: 0, class: 'bl-range bl-scrub' });
  scrub.addEventListener('input', () => { const at = Number(scrub.value) / 1000; playing = false; cancelAnimationFrame(raf); t = endTime() * at; paintBar(); draw(); });
  const bar = el('div', { class: 'bl-playbar' },
    el('div', { class: 'bl-playbar-row' }, playBtn, restartBtn, el('label', { for: speedSel.id, class: 'bl-mini-label' }, 'Animation'), speedSel, viewSeg),
    el('div', { class: 'bl-playbar-row' }, el('label', { for: allId, class: 'bl-check' }, allBox, 'Ride all three lines together')),
    el('div', { class: 'bl-playbar-row bl-vec-row' }, el('span', { class: 'bl-mini-label' }, 'Show'), vecBoxes),
    el('div', { class: 'bl-playbar-row bl-scrub-row' }, el('label', { for: scrubId, class: 'bl-mini-label' }, 'Position through the corner'), scrub));
  function paintBar() {
    const end = endTime();
    playBtn.textContent = playing ? '❚❚ Pause' : (t >= end - 1e-6 && t > 0 ? '▶ Ride it again' : t > 0 ? '▶ Resume' : '▶ Start turn');
    playBtn.setAttribute('aria-pressed', String(playing));
    viewSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.getAttribute('data-v') === settings.view)));
    vecBoxes.forEach(l => { const w = l.getAttribute('data-where'); l.hidden = !(w === 'both' || w === settings.view); });
  }
  function setView(v) { setSetting('view', v); paintBar(); draw(true); }

  // ---- control panel ----
  const announce = el('p', { class: 'bl-sr', 'aria-live': 'polite' });
  let announceTimer = null;
  const controls = createControls({ config, locked: o.locked, speedUnit: settings.speedUnit,
    onInput: (name, value) => setConfig({ ...config, [name]: value }, { fromControls: true }),
    onCommit: () => { if (o.onCommit) o.onCommit(config, results); },
    onUnit: u => setSetting('speedUnit', u) });
  const panel = el('div', { class: 'bl-sim-panel' }, el('h2', { class: 'bl-panel-title' }, o.panelTitle || 'Your corner'), controls.node, o.panelExtra || null);
  const node = el('div', { class: 'bl-sim' + (o.compact ? ' bl-sim--compact' : '') }, el('div', { class: 'bl-sim-stage' }, scene.node, bar), panel, announce);

  function draw() {
    if (!alive) return;
    const s = Math.min(results.speed * t, Math.PI * config.cornerRadius);
    scene.render({ config, results, s, time: t, vectors: settings.vectors, view: settings.view, allLines: settings.allLines, playing });
    const end = endTime();
    if (document.activeElement !== scrub) scrub.value = String(Math.round(end ? Math.min(1, t / end) * 1000 : 0));
    scrub.setAttribute('aria-valuetext', `${fmt(t, 2)} of ${fmt(end, 2)} seconds through the corner`);
  }
  function tick(now) {
    if (!playing || !alive) return;
    if (last === null) last = now;
    t += Math.min(0.1, (now - last) / 1000) * settings.animSpeed;
    last = now;
    const end = endTime();
    if (t >= end) { t = end; playing = false; draw(); paintBar(); if (o.onEnd) o.onEnd(config, results); return; }
    draw();
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (t >= endTime() - 1e-6) t = 0;
    playing = true; last = null; paintBar();
    if (o.onPlay) o.onPlay(config, results);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function pause() { playing = false; cancelAnimationFrame(raf); paintBar(); draw(); }
  function restart() { t = 0; play(); }

  function setConfig(c, opts = {}) {
    const frac = endTime() ? t / endTime() : 0;
    config = normalizeConfig(c); results = berm(config);
    t = Math.min(1, frac) * endTime();
    if (!opts.fromControls) controls.update(config);
    draw(); paintBar();
    if (o.onChange) o.onChange(config, results);
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { announce.textContent = `Radius ${fmt(results.turnRadius, 1)} metres at ${fmt(config.speedKmh, 1)} kilometres per hour. Acceleration ${fmt(results.centripetalAcceleration, 2)} metres per second squared. Grip needed ${fmt(results.requiredGrip, 2)} of ${fmt(config.availableGrip, 2)}: ${results.gripStatus === 'exceeds' ? 'beyond' : results.gripStatus === 'approaching' ? 'close to' : 'within'} the model's grip.`; }, 900);
  }

  paintBar(); draw();
  return {
    node, scene, controls,
    get config() { return { ...config }; }, get results() { return results; }, get playing() { return playing; },
    setConfig, play, pause, restart, setView,
    // Race all three lines from the entry together (top-down view).
    rideAll() { allBox.checked = true; setSetting('allLines', true); setView('top'); restart(); },
    setLocked(list) { controls.setLocked(list); },
    destroy() { alive = false; playing = false; cancelAnimationFrame(raf); }
  };
}
