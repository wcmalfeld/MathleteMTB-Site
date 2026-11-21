// An interactive graph of one relationship from the physics engine (PRD 7):
// a smooth curve, the current value highlighted with guide lines to both
// axes, a probe that follows the pointer (or the arrow keys) with a tooltip,
// optional comparison markers (setups A and B), and click / Enter to set the
// control to the probed value.
//
// createGraph({ id, title, xLabel, yLabel, xUnit, yUnit, xDomain: [a, b], xStep,
//               xDigits, yDigits, onPick(x) }) -> { node, update({ f, x, markers, extra }) }
//   f(x)      the relationship (a function from the engine)
//   x         the current x (the control's value)
//   markers   [{ x, y, label, cls }]  e.g. setups A and B
//   extra     [{ x, y, label, cls }]  e.g. "half the speed" for the doubling discovery
//   hlines    [{ y, label, cls }]     horizontal reference lines, e.g. the available grip

import { el, svg, clear, id as uid } from './dom.js';
import { fmt } from '../logic/physics.js';

const GW = 380, GH = 250, M = { l: 54, r: 16, t: 16, b: 44 };
const NICE = [1, 2, 2.5, 5, 10];
function niceMax(v) {
  if (!(v > 0) || !isFinite(v)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const n of NICE) if (n * p >= v) return n * p;
  return 10 * p;
}
function ticks(max) {
  const raw = max / 5, p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(n => n * p).find(s => s >= raw) || raw;
  const out = [];
  for (let t = 0; t <= max + 1e-9; t += step) out.push(Number(t.toFixed(6)));
  return out;
}

export function createGraph(o) {
  const titleId = uid('gt'), readId = uid('gr');
  const pw = GW - M.l - M.r, ph = GH - M.t - M.b;
  const node = el('figure', { class: 'bl-graph' });
  const s = svg('svg', { viewBox: `0 0 ${GW} ${GH}`, class: 'bl-graph-svg', role: 'application', tabindex: '0', 'aria-labelledby': titleId, 'aria-describedby': readId });
  const grid = svg('g', { class: 'bl-g-grid' }), axes = svg('g', { class: 'bl-g-axes' });
  const curve = svg('path', { class: 'bl-g-curve' });
  const guides = svg('path', { class: 'bl-g-guide' });
  const extraG = svg('g', { class: 'bl-g-extra' }), markG = svg('g', { class: 'bl-g-marks' }), hlineG = svg('g', { class: 'bl-g-hlines' });
  const current = svg('g', { class: 'bl-g-current' }, svg('path', { d: 'M 0 -7 L 7 0 L 0 7 L -7 0 Z' }));
  const curLabel = svg('text', { class: 'bl-g-curlabel' });
  const probe = svg('g', { class: 'bl-g-probe', visibility: 'hidden' }, svg('circle', { r: 4.5 }), svg('rect', { class: 'bl-g-tip', rx: 3, height: 20 }), svg('text', { class: 'bl-g-tiptext' }));
  const hit = svg('rect', { x: M.l, y: M.t, width: pw, height: ph, fill: 'transparent', class: 'bl-g-hit' });
  s.append(grid, axes, hlineG, curve, guides, extraG, markG, current, curLabel, probe, hit);
  const readout = el('p', { class: 'bl-graph-read', id: readId, 'aria-live': 'polite' });
  node.append(el('figcaption', { id: titleId, class: 'bl-graph-title' }, o.title), s, readout);

  let st = { f: () => 0, x: 0, yMax: 1, probeX: null };
  const [x0, x1] = o.xDomain;
  const X = x => M.l + (x - x0) / (x1 - x0) * pw, Y = y => M.t + ph - Math.min(y, st.yMax * 1.04) / st.yMax * ph;
  const invX = px => x0 + (px - M.l) / pw * (x1 - x0);
  const snap = x => { const st2 = o.xStep || 1; return Math.max(x0, Math.min(x1, Math.round(x / st2) * st2)); };
  const fx = (x, d) => fmt(x, d === undefined ? (o.xDigits || 0) : d), fy = y => fmt(y, o.yDigits === undefined ? 1 : o.yDigits);

  function drawAxes() {
    clear(grid); clear(axes);
    ticks(st.yMax).forEach(t => {
      grid.appendChild(svg('line', { x1: M.l, x2: M.l + pw, y1: Y(t), y2: Y(t) }));
      axes.appendChild(svg('text', { x: M.l - 7, y: Y(t) + 4, 'text-anchor': 'end' }, String(t)));
    });
    ticks(x1 - x0).map(t => t + x0).forEach(t => {
      grid.appendChild(svg('line', { x1: X(t), x2: X(t), y1: M.t, y2: M.t + ph }));
      axes.appendChild(svg('text', { x: X(t), y: M.t + ph + 16, 'text-anchor': 'middle' }, String(t)));
    });
    axes.appendChild(svg('line', { x1: M.l, x2: M.l + pw, y1: M.t + ph, y2: M.t + ph, class: 'bl-g-axis' }));
    axes.appendChild(svg('line', { x1: M.l, x2: M.l, y1: M.t, y2: M.t + ph, class: 'bl-g-axis' }));
    axes.appendChild(svg('text', { x: M.l + pw / 2, y: GH - 6, 'text-anchor': 'middle', class: 'bl-g-axlabel' }, `${o.xLabel} (${o.xUnit})`));
    axes.appendChild(svg('text', { x: 13, y: M.t + ph / 2, 'text-anchor': 'middle', class: 'bl-g-axlabel', transform: `rotate(-90 13 ${M.t + ph / 2})` }, `${o.yLabel} (${o.yUnit})`));
  }
  function point(x, y, cls, label) {
    const g = svg('g', { class: cls, transform: `translate(${X(x).toFixed(1)} ${Y(y).toFixed(1)})` });
    g.appendChild(svg('circle', { r: 5 }));
    if (label) { const right = X(x) > GW - 40; g.appendChild(svg('text', { x: right ? -8 : 8, y: -8, 'text-anchor': right ? 'end' : 'start' }, label)); }
    return g;
  }
  function showProbe() {
    if (st.probeX === null) { probe.setAttribute('visibility', 'hidden'); return; }
    const x = st.probeX, y = st.f(x), px = X(x), py = Y(y);
    probe.setAttribute('visibility', 'visible');
    probe.children[0].setAttribute('cx', px); probe.children[0].setAttribute('cy', py);
    const text = `(${fx(x)} ${o.xUnit}, ${fy(y)} ${o.yUnit})`, w = text.length * 6.6 + 12;
    const tx = Math.min(GW - w - 4, Math.max(4, px - w / 2)), ty = py - 30 < 2 ? py + 10 : py - 30;
    probe.children[1].setAttribute('x', tx); probe.children[1].setAttribute('y', ty); probe.children[1].setAttribute('width', w);
    probe.children[2].setAttribute('x', tx + 6); probe.children[2].setAttribute('y', ty + 14); probe.children[2].textContent = text;
    readout.textContent = `${o.xLabel} ${fx(x)} ${o.xUnit} → ${o.yLabel.toLowerCase()} ${fy(y)} ${o.yUnit}.` + (o.onPick ? ' Press Enter or click to use this value.' : '');
  }

  function update(u) {
    st = { ...st, ...u };
    // The y-axis steps in nice numbers so it stays still for small changes.
    let top = 0;
    for (let i = 0; i <= 60; i++) { const y = st.f(x0 + (x1 - x0) * i / 60); if (isFinite(y)) top = Math.max(top, y); }
    (st.markers || []).forEach(m => { if (isFinite(m.y)) top = Math.max(top, m.y); });
    (st.hlines || []).forEach(h => { if (isFinite(h.y)) top = Math.max(top, h.y); });
    st.yMax = niceMax(top * 1.05);
    drawAxes();
    let d = '';
    for (let i = 0; i <= 160; i++) { const x = x0 + (x1 - x0) * i / 160, y = st.f(x); if (isFinite(y)) d += (d ? ' L ' : 'M ') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); }
    curve.setAttribute('d', d);
    const cy = st.f(st.x), px = X(st.x), py = Y(cy);
    guides.setAttribute('d', `M ${px.toFixed(1)} ${(M.t + ph).toFixed(1)} V ${py.toFixed(1)} H ${M.l}`);
    current.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
    curLabel.setAttribute('x', Math.min(px + 10, GW - 120)); curLabel.setAttribute('y', Math.max(py - 10, M.t + 12));
    curLabel.textContent = `(${fx(st.x, o.xDigits === undefined ? 1 : o.xDigits)}, ${fy(cy)})`;
    clear(hlineG); (st.hlines || []).forEach(h => hlineG.append(svg('line', { x1: M.l, x2: M.l + pw, y1: Y(h.y), y2: Y(h.y), class: 'bl-g-hline ' + (h.cls || '') }), svg('text', { x: M.l + pw - 4, y: Y(h.y) - 5, 'text-anchor': 'end', class: 'bl-g-hlabel' }, h.label)));
    clear(markG); (st.markers || []).forEach(m => markG.appendChild(point(m.x, m.y, 'bl-g-mark ' + (m.cls || ''), m.label)));
    clear(extraG); (st.extra || []).forEach(m => { if (m.x >= x0 && m.x <= x1) extraG.appendChild(point(m.x, m.y, 'bl-g-x ' + (m.cls || ''), m.label)); });
    if (st.probeX === null) readout.textContent = `Now: ${o.xLabel.toLowerCase()} ${fx(st.x, 1)} ${o.xUnit}, ${o.yLabel.toLowerCase()} ${fy(cy)} ${o.yUnit}.`;
    showProbe();
  }

  // Pointer: hover shows the probe; click picks.
  const fromEvent = e => { const r = s.getBoundingClientRect(); return snap(invX((e.clientX - r.left) / r.width * GW)); };
  hit.addEventListener('pointermove', e => { st.probeX = fromEvent(e); showProbe(); });
  hit.addEventListener('pointerleave', () => { if (document.activeElement !== s) { st.probeX = null; showProbe(); update({}); } });
  hit.addEventListener('click', e => { if (o.onPick) o.onPick(fromEvent(e)); });
  // Keyboard: arrows move the probe, Enter picks.
  s.addEventListener('keydown', e => {
    const step = (o.xStep || 1) * (e.shiftKey ? 10 : 1);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') st.probeX = snap((st.probeX === null ? st.x : st.probeX) + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') st.probeX = snap((st.probeX === null ? st.x : st.probeX) - step);
    else if (e.key === 'Home') st.probeX = x0;
    else if (e.key === 'End') st.probeX = x1;
    else if ((e.key === 'Enter' || e.key === ' ') && st.probeX !== null && o.onPick) { e.preventDefault(); o.onPick(st.probeX); return; }
    else if (e.key === 'Escape') st.probeX = null;
    else return;
    e.preventDefault(); showProbe();
  });
  s.addEventListener('focus', () => { if (st.probeX === null) { st.probeX = snap(st.x); showProbe(); } });
  s.addEventListener('blur', () => { st.probeX = null; showProbe(); update({}); });
  return { node, update };
}
