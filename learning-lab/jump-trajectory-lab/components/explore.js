// The jump simulator: JumpScene + QuadraticGraph + JumpControls + JumpTelemetry,
// all fed by one jumpModel(L, H). Used on its own (Explore) and, smaller,
// inside lessons and missions.
//
// createSimulator(ctx, { L, H, compact, lockL, onChange }) -> { node, get model(), set(L, H) }

import { el, clear, button, id as uid, equation, reducedMotion } from './dom.js';
import { createScene } from './scene.js';
import { createGraph } from './graph.js';
import { jumpModel, LIMITS, DEFAULT, clamp, dec, fstr, vertexForm } from '../logic/quadratic.js';

export function createSimulator(ctx, opts = {}) {
  let L = clamp(opts.L ?? DEFAULT.L, 'L'), H = clamp(opts.H ?? DEFAULT.H, 'H');
  let model = jumpModel(L, H), prev = null, riderX = 0, playing = false, raf = 0, pauseAtApex = false, pausedAtApex = false;
  const scene = createScene();
  const graph = createGraph({ model, show: { vertex: true, zeros: true, axis: true, rider: true }, range: 'fixed' });
  const changeNote = el('p', { class: 'jl-change', 'aria-live': 'polite' });

  // ---------- controls ----------
  function control(k, label, unit) {
    const rid = uid('r'), nid = uid('n'), { min, max, step } = LIMITS[k];
    const r = el('input', { type: 'range', id: rid, min, max, step, class: 'jl-range', 'aria-label': label });
    const n = el('input', { type: 'number', id: nid, min, max, step, class: 'jl-input jl-input--num', inputmode: 'decimal' });
    const box = el('div', { class: 'jl-control' }, el('label', { for: nid }, label, el('span', { class: 'jl-control-sym' }, k === 'L' ? ' (L)' : ' (H)')),
      el('div', { class: 'jl-control-row' }, r, el('span', { class: 'jl-input-unit' }, n, el('span', { class: 'jl-unit' }, unit))),
      el('p', { class: 'jl-control-range' }, `${min}–${max} ${unit}`));
    const apply = v => { set(k === 'L' ? v : L, k === 'H' ? v : H); };
    r.addEventListener('input', () => apply(Number(r.value)));
    n.addEventListener('change', () => apply(Number(n.value)));
    n.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(Number(n.value)); } });
    return { box, sync(v, locked) { r.value = v; if (document.activeElement !== n) n.value = v; r.disabled = n.disabled = !!locked; } };
  }
  const cL = control('L', 'Jump distance', 'm'), cH = control('H', 'Maximum height', 'm');

  const playBtn = button('▶ Play', () => (playing ? stop() : play()), 'jl-btn--primary');
  const apexBox = el('input', { type: 'checkbox', id: uid('apex') });
  apexBox.addEventListener('change', () => { pauseAtApex = apexBox.checked; });
  const scrubId = uid('s');
  const scrub = el('input', { type: 'range', id: scrubId, min: 0, max: 1000, step: 1, value: 0, class: 'jl-range' });
  scrub.addEventListener('input', () => { stop(); moveRider(model.L * Number(scrub.value) / 1000); });
  const riderOut = el('output', { class: 'jl-mono', for: scrubId });
  const apexBtn = button('Jump to apex', () => { stop(); moveRider(model.vertex.x); }, 'jl-btn--quiet');

  // ---------- telemetry and equation ----------
  const tel = el('dl', { class: 'jl-telemetry' });
  const eqBox = el('div', { class: 'jl-live-eq' });

  function telemetry() {
    clear(tel);
    const row = (k, v, cls) => [el('dt', null, k), el('dd', { class: cls || null }, v)];
    [
      row('Jump distance', `${dec(model.L)} m`),
      row('Maximum height', `${dec(model.H)} m`, 'jl-c-vertex'),
      row('Apex location', `${dec(model.vertex.x)} m`, 'jl-c-vertex'),
      row('Takeoff point', '(0, 0)', 'jl-c-zero'),
      row('Landing point', `(${dec(model.L)}, 0)`, 'jl-c-zero'),
      row('Leading coefficient a', `${fstr(model.a)} ≈ ${dec(model.aValue, 4)}`),
      row('Rider position', `(${dec(riderX, 2)}, ${dec(model.y(riderX), 2)})`)
    ].forEach(r => r.forEach(x => tel.appendChild(x)));
    clear(eqBox);
    eqBox.appendChild(el('p', { class: 'jl-mini' }, 'Vertex form'));
    eqBox.appendChild(equation(vertexForm(model), { cls: 'jl-equation--big' }));
  }

  // What changed, in words, after each slider move.
  function describeChange() {
    if (!prev) return;
    const bits = [];
    if (model.H !== prev.H && model.L === prev.L) {
      bits.push(model.H > prev.H ? 'Higher peak, same takeoff and landing: the parabola got narrower.' : 'Lower peak, same takeoff and landing: the parabola got wider.');
      bits.push(`a went from ${fstr(prev.a)} to ${fstr(model.a)} (|a| ${Math.abs(model.aValue) > Math.abs(prev.aValue) ? 'bigger' : 'smaller'}). The zeros stayed at 0 and ${dec(model.L)}.`);
    } else if (model.L !== prev.L && model.H === prev.H) {
      bits.push(model.L > prev.L ? 'Longer jump, same height: wider and flatter, and the peak moved right.' : 'Shorter jump, same height: narrower and steeper, and the peak moved left.');
      bits.push(`a went from ${fstr(prev.a)} to ${fstr(model.a)} (|a| ${Math.abs(model.aValue) > Math.abs(prev.aValue) ? 'bigger' : 'smaller'}). The vertex is now at x = ${dec(model.vertex.x)}.`);
    } else if (model.L !== prev.L || model.H !== prev.H) {
      bits.push(`Both changed: a is now ${fstr(model.a)}.`);
    }
    changeNote.textContent = bits.join(' ');
  }

  function moveRider(x) {
    riderX = Math.max(0, Math.min(model.L, x));
    scene.update({ model, rider: riderX });
    graph.update({ rider: riderX });
    scrub.value = String(Math.round(1000 * riderX / model.L));
    riderOut.textContent = `x = ${dec(riderX, 1)} m, height ${dec(model.y(riderX), 2)} m`;
    telemetry();
  }

  function set(nL, nH) {
    const cl = clamp(nL, 'L'), ch = clamp(nH, 'H');
    if (opts.lockL) { /* mission 4 can lock the distance */ }
    const L2 = opts.lockL ? L : cl;
    if (L2 === L && ch === H && model) { cL.sync(L, opts.lockL); cH.sync(H); return; }
    prev = model; L = L2; H = ch;
    model = jumpModel(L, H);
    cL.sync(L, opts.lockL); cH.sync(H);
    graph.update({ model, ghost: prev });
    moveRider(Math.min(riderX, model.L));
    describeChange();
    if (ctx && ctx.progress) ctx.progress.explored(prev && prev.L !== L ? 'changed-L' : 'changed-H');
    if (opts.onChange) opts.onChange(model, prev);
  }

  // ---------- animation (along the calculated curve; never required) ----------
  function play() {
    if (reducedMotion()) { moveRider(pauseAtApex ? model.vertex.x : model.L); return; }
    if (riderX >= model.L - 1e-6) riderX = 0;
    playing = true; pausedAtApex = false; playBtn.textContent = '❚❚ Pause';
    const speed = model.L / 2200;   // metres per millisecond: about 2.2 s per jump
    let last = performance.now();
    const tick = t => {
      if (!playing) return;
      let x = riderX + (t - last) * speed; last = t;
      if (pauseAtApex && !pausedAtApex && riderX < model.vertex.x && x >= model.vertex.x) { x = model.vertex.x; pausedAtApex = true; moveRider(x); stop(); changeNote.textContent = `Paused at the apex: (${dec(model.vertex.x)}, ${dec(model.H)}), the vertex.`; return; }
      if (x >= model.L) { moveRider(model.L); stop(); return; }
      moveRider(x); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (ctx && ctx.progress) ctx.progress.explored('played');
  }
  function stop() { playing = false; cancelAnimationFrame(raf); playBtn.textContent = '▶ Play'; }

  const resetBtn = button('Reset jump', () => { stop(); prev = null; set(opts.L ?? DEFAULT.L, opts.H ?? DEFAULT.H); moveRider(0); changeNote.textContent = ''; graph.update({ ghost: null }); }, 'jl-btn--quiet');

  const node = el('div', { class: 'jl-sim' + (opts.compact ? ' jl-sim--compact' : '') },
    el('div', { class: 'jl-sim-views' }, scene.node, graph.node,
      el('ul', { class: 'jl-legend', 'aria-label': 'Key' },
        el('li', null, el('span', { class: 'jl-key jl-key--traj', 'aria-hidden': 'true' }), 'trajectory'),
        el('li', null, el('span', { class: 'jl-key jl-key--vertex', 'aria-hidden': 'true' }), 'vertex (max)'),
        el('li', null, el('span', { class: 'jl-key jl-key--zero', 'aria-hidden': 'true' }), 'zeros (takeoff, landing)'),
        el('li', null, el('span', { class: 'jl-key jl-key--axis', 'aria-hidden': 'true' }), 'axis of symmetry'),
        el('li', null, el('span', { class: 'jl-key jl-key--ghost', 'aria-hidden': 'true' }), 'previous jump'))),
    el('div', { class: 'jl-sim-panel' },
      el('div', { class: 'jl-panel-block' }, cL.box, cH.box, changeNote),
      el('div', { class: 'jl-panel-block' },
        el('div', { class: 'jl-row' }, playBtn, apexBtn, resetBtn),
        el('label', { class: 'jl-check', for: apexBox.id }, apexBox, ' Pause at the apex'),
        el('div', { class: 'jl-control' }, el('label', { for: scrubId }, 'Rider position (step through without animation)'), scrub, riderOut)),
      el('div', { class: 'jl-panel-block' }, eqBox, tel)));

  // Wide screens keep a fixed graph scale (so you can see the curve change
  // size); narrow screens zoom to the jump so it stays readable.
  let mode = 'fixed';
  const fit = () => {
    const want = node.clientWidth && node.clientWidth < 760 ? 'fit' : 'fixed';
    if (want !== mode) { mode = want; graph.update({ range: mode }); }   // only on a real change, so resizing can't loop
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(node);
  cL.sync(L, opts.lockL); cH.sync(H); moveRider(0);
  return { node, get model() { return model; }, set, stop, fit };
}
