// QuadraticGraph: the jump on a coordinate plane.
// Equal scales on both axes (a metre across is the same length as a metre
// up), so the curve's shape on screen is its true shape. The parabola is
// drawn only from takeoff (x = 0) to landing (x = L): the jump, not the
// whole infinite parabola.
//
// Meaning is shown by shape AND colour AND a label:
//   trajectory = solid line        vertex = diamond      zeros = squares
//   axis of symmetry = dashed vertical line              rider = ring
//
// createGraph(opts) -> { node, update(state) }
// state: { model, show: { vertex, zeros, axis, labels, rider, ground }, rider: x,
//          range: 'fixed' | 'fit', extra: [{ x, y, label, kind }], ghost: model,
//          pick: { onPick(p), step } }

import { el, svg, clear, id } from './dom.js';
import { dec } from '../logic/quadratic.js';

const PAD = { l: 44, r: 16, t: 14, b: 40 };
const PX = 30;  // pixels per metre at viewBox scale

export function createGraph(opts = {}) {
  const clipId = id('clip');
  const root = svg('svg', { class: 'jl-graph', role: 'img' });
  const desc = el('p', { class: 'jl-sr' });
  const live = el('p', { class: 'jl-sr', 'aria-live': 'polite' });
  const node = el('figure', { class: 'jl-graph-wrap' }, root, desc, live);
  let st = { show: {}, ...opts }, cursor = null, picked = null;
  let box;  // current ranges

  function ranges() {
    const m = st.model;
    if (st.range === 'fixed') return { x0: -1, x1: 25, y0: -1, y1: 7 };
    const L = Math.max(m ? m.L : 12, st.ghost ? st.ghost.L : 0), H = Math.max(m ? m.H : 3, st.ghost ? st.ghost.H : 0);
    return { x0: -1, x1: Math.ceil(L) + 1, y0: -1, y1: Math.ceil(H) + 1 };
  }
  const sx = x => PAD.l + (x - box.x0) * PX;
  const sy = y => PAD.t + (box.y1 - y) * PX;
  const ix = px => box.x0 + (px - PAD.l) / PX;
  const iy = py => box.y1 - (py - PAD.t) / PX;

  function path(m) {
    return 'M' + m.points(90).map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' L');
  }

  function draw() {
    clear(root);
    box = ranges();
    const W = PAD.l + PAD.r + (box.x1 - box.x0) * PX, H = PAD.t + PAD.b + (box.y1 - box.y0) * PX;
    root.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const m = st.model, show = st.show || {};
    const xStep = box.x1 - box.x0 > 16 ? 2 : 1;
    root.appendChild(svg('defs', null, svg('clipPath', { id: clipId }, svg('rect', { x: PAD.l, y: PAD.t, width: W - PAD.l - PAD.r, height: H - PAD.t - PAD.b }))));
    // grid (every metre) and tick labels
    for (let x = Math.ceil(box.x0); x <= box.x1; x++) root.appendChild(svg('line', { x1: sx(x), x2: sx(x), y1: PAD.t, y2: H - PAD.b, class: 'jl-grid' + (x % xStep ? ' jl-grid--minor' : '') }));
    for (let y = Math.ceil(box.y0); y <= box.y1; y++) root.appendChild(svg('line', { y1: sy(y), y2: sy(y), x1: PAD.l, x2: W - PAD.r, class: 'jl-grid' }));
    for (let x = 0; x <= box.x1; x += xStep) root.appendChild(svg('text', { x: sx(x), y: H - PAD.b + 17, class: 'jl-tick', 'text-anchor': 'middle' }, String(x)));
    for (let y = 0; y <= box.y1; y++) root.appendChild(svg('text', { x: PAD.l - 8, y: sy(y) + 4, class: 'jl-tick', 'text-anchor': 'end' }, String(y)));
    root.appendChild(svg('text', { x: W - PAD.r, y: H - 6, class: 'jl-axis-label', 'text-anchor': 'end' }, 'x: horizontal distance (m)'));
    root.appendChild(svg('text', { x: PAD.l + 10, y: PAD.t + 12, class: 'jl-axis-label', 'paint-order': 'stroke' }, 'y: height (m)'));
    // axes: the x-axis is the ground reference line
    root.appendChild(svg('line', { x1: PAD.l, x2: W - PAD.r, y1: sy(0), y2: sy(0), class: 'jl-ground' }));
    root.appendChild(svg('line', { x1: sx(0), x2: sx(0), y1: PAD.t, y2: H - PAD.b, class: 'jl-axis' }));

    const g = svg('g', { 'clip-path': `url(#${clipId})` });
    if (st.ghost) g.appendChild(svg('path', { d: path(st.ghost), class: 'jl-ghost' }));
    if (m) {
      if (show.axis) g.appendChild(svg('line', { x1: sx(m.axis), x2: sx(m.axis), y1: PAD.t, y2: H - PAD.b, class: 'jl-axisline' }));
      g.appendChild(svg('path', { d: path(m), class: 'jl-traj' }));
    }
    root.appendChild(g);
    if (m) {
      const lab = show.labels !== false;
      if (show.axis && lab) root.appendChild(svg('text', { x: sx(m.axis) + 6, y: sy(0) - 10, class: 'jl-feature jl-feature--axis' }, `axis x = ${dec(m.axis)}`));
      if (show.zeros) m.zeros.forEach((z, i) => {
        root.appendChild(svg('rect', { x: sx(z) - 6, y: sy(0) - 6, width: 12, height: 12, class: 'jl-zero' }));
        if (lab) root.appendChild(svg('text', { x: sx(z) + (i ? -8 : 8), y: sy(0) + 22, class: 'jl-feature jl-feature--zero', 'text-anchor': i ? 'end' : 'start' }, `zero (${dec(z)}, 0)`));
      });
      if (show.vertex) {
        const vx = sx(m.vertex.x), vy = sy(m.vertex.y);
        root.appendChild(svg('path', { d: `M${vx},${vy - 9} L${vx + 9},${vy} L${vx},${vy + 9} L${vx - 9},${vy} Z`, class: 'jl-vertex' }));
        if (lab) root.appendChild(svg('text', { x: vx, y: vy - 14, class: 'jl-feature jl-feature--vertex', 'text-anchor': 'middle' }, `vertex (${dec(m.vertex.x)}, ${dec(m.vertex.y)})`));
      }
      (st.extra || []).forEach(p => {
        root.appendChild(svg('circle', { cx: sx(p.x), cy: sy(p.y), r: 6, class: 'jl-extra' + (p.kind ? ' jl-extra--' + p.kind : '') }));
        if (p.label) root.appendChild(svg('text', { x: sx(p.x) + 9, y: sy(p.y) - 9, class: 'jl-feature' }, p.label));
      });
      if (show.rider && st.rider !== undefined && st.rider !== null) {
        const rx = st.rider, ry = m.y(rx);
        root.appendChild(svg('line', { x1: sx(rx), x2: sx(rx), y1: sy(ry), y2: sy(0), class: 'jl-drop' }));
        root.appendChild(svg('circle', { cx: sx(rx), cy: sy(ry), r: 8, class: 'jl-rider' }));
      }
    }
    if (picked) root.appendChild(svg('circle', { cx: sx(picked.x), cy: sy(picked.y), r: 9, class: 'jl-picked' }));
    if (st.pick) {
      const hit = svg('rect', { x: PAD.l, y: PAD.t, width: W - PAD.l - PAD.r, height: H - PAD.t - PAD.b, class: 'jl-hit' });
      hit.addEventListener('pointerdown', e => {
        const r = root.getBoundingClientRect(), vb = root.viewBox.baseVal;
        const s = st.pick.step || 0.5, snap = v => Math.round(v / s) * s;
        place({ x: snap(ix((e.clientX - r.left) * vb.width / r.width)), y: snap(iy((e.clientY - r.top) * vb.height / r.height)) });
      });
      root.appendChild(hit);
      if (cursor) root.appendChild(svg('circle', { cx: sx(cursor.x), cy: sy(cursor.y), r: 12, class: 'jl-cursor' }));
    }
    root.setAttribute('aria-label', st.title || (m ? `Graph of the jump from x = 0 to x = ${dec(m.L)}` : 'Graph'));
    desc.textContent = m ? `The jump starts at (0, 0), rises to its highest point at (${dec(m.vertex.x)}, ${dec(m.vertex.y)}) and lands at (${dec(m.L)}, 0).` +
      (st.rider !== undefined && st.rider !== null ? ` The rider is at x = ${dec(st.rider, 2)}, height ${dec(m.y(st.rider), 2)} m.` : '') : '';
  }

  function place(p) {
    if (p.x < box.x0 || p.x > box.x1 || p.y < box.y0 || p.y > box.y1) return;
    picked = p;
    live.textContent = `Selected (${dec(p.x)}, ${dec(p.y)}).`;
    draw();
    st.pick.onPick(p);
  }
  // keyboard: arrows move a cursor (by the pick step), Enter or Space selects
  root.addEventListener('focus', () => {
    if (!st.pick) return;
    if (!cursor) cursor = picked ? { ...picked } : { x: 0, y: 0 };
    live.textContent = `Cursor at (${dec(cursor.x)}, ${dec(cursor.y)}). Arrow keys move it; Enter selects.`;
    draw();
  });
  root.addEventListener('blur', () => { if (st.pick) { cursor = null; draw(); } });
  root.addEventListener('keydown', e => {
    if (!st.pick || !cursor) return;
    const s = st.pick.step || 0.5, mv = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (mv) { e.preventDefault(); cursor = { x: Math.min(box.x1, Math.max(box.x0, cursor.x + mv[0])), y: Math.min(box.y1, Math.max(box.y0, cursor.y + mv[1])) }; live.textContent = `(${dec(cursor.x)}, ${dec(cursor.y)})`; draw(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place({ ...cursor }); }
  });

  function update(next) {
    st = { ...st, ...next, show: { ...(st.show || {}), ...((next && next.show) || {}) } };
    if (st.pick) { root.setAttribute('tabindex', '0'); root.setAttribute('role', 'application'); }
    else { root.removeAttribute('tabindex'); root.setAttribute('role', 'img'); }
    draw();
  }
  update({});
  return { node, update, clearPick() { picked = null; draw(); }, get picked() { return picked; } };
}
