// The small diagrams: the ski seen from above (its sidecut), the ski's cross-
// section tipped on edge, and the pictures in the explanations. All drawn
// from the physics engine's numbers.

import { svg, clear } from './dom.js';
import { sidecutDepth, calculateTurnRadius, fmt, DEFAULTS } from '../logic/physics.js';

const WAIST_MM = 70, CONTACT = 1.6, SKI_LEN = 1.72;

// The ski from above. Length to scale; width exaggerated (stated on the
// drawing) so a 10–30 mm sidecut depth is visible.
export function sidecutDiagram() {
  const W = 220, H = 92, pxPerM = 110, pxPerMm = 0.3, cx = W / 2, cy = 40;
  const node = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cl-inset-svg', role: 'img' });
  const title = svg('title');
  const shape = svg('path', { class: 'cl-ski-top' });
  const chord = svg('line', { class: 'cl-ski-chord' });
  const depthLine = svg('line', { class: 'cl-ski-depth' });
  const t1 = svg('text', { x: 6, y: H - 20, class: 'cl-inset-t' });
  const t2 = svg('text', { x: 6, y: H - 7, class: 'cl-inset-s' });
  node.append(title, shape, chord, depthLine, t1, t2);
  function update(rsc) {
    const d = sidecutDepth(rsc, CONTACT) * 1000;   // mm
    const half = x => (WAIST_MM / 2 + (rsc - Math.sqrt(rsc * rsc - x * x)) * 1000) * pxPerMm;   // half-width at x metres from the waist
    const top = [], bot = [];
    for (let i = 0; i <= 40; i++) { const x = -CONTACT / 2 + CONTACT * i / 40; top.push([cx + x * pxPerM, cy - half(x)]); bot.push([cx + x * pxPerM, cy + half(x)]); }
    const tipX = cx + SKI_LEN / 2 * pxPerM, tailX = cx - SKI_LEN / 2 * pxPerM, hw = half(CONTACT / 2);
    const P = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    let dpath = `M ${P(top[0])} ` + top.slice(1).map(p => 'L ' + P(p)).join(' ');
    dpath += ` C ${(cx + CONTACT / 2 * pxPerM + 8).toFixed(1)} ${(cy - hw).toFixed(1)} ${tipX.toFixed(1)} ${(cy - hw * 0.7).toFixed(1)} ${tipX.toFixed(1)} ${cy}`;
    dpath += ` C ${tipX.toFixed(1)} ${(cy + hw * 0.7).toFixed(1)} ${(cx + CONTACT / 2 * pxPerM + 8).toFixed(1)} ${(cy + hw).toFixed(1)} ${P(bot[40])} `;
    dpath += bot.slice(0, 40).reverse().map(p => 'L ' + P(p)).join(' ');
    dpath += ` C ${(cx - CONTACT / 2 * pxPerM - 5).toFixed(1)} ${(cy + hw).toFixed(1)} ${tailX.toFixed(1)} ${(cy + hw * 0.8).toFixed(1)} ${tailX.toFixed(1)} ${cy} C ${tailX.toFixed(1)} ${(cy - hw * 0.8).toFixed(1)} ${(cx - CONTACT / 2 * pxPerM - 5).toFixed(1)} ${(cy - hw).toFixed(1)} ${P(top[0])} Z`;
    shape.setAttribute('d', dpath);
    // The straight line from tip contact to tail contact, and the depth at the waist.
    const y0 = cy - hw;
    chord.setAttribute('x1', top[0][0]); chord.setAttribute('y1', y0); chord.setAttribute('x2', top[40][0]); chord.setAttribute('y2', y0);
    depthLine.setAttribute('x1', cx); depthLine.setAttribute('y1', y0); depthLine.setAttribute('x2', cx); depthLine.setAttribute('y2', cy - half(0));
    t1.textContent = `Rsc = ${fmt(rsc, 1)} m`;
    t2.textContent = `sidecut depth ${fmt(d, 0)} mm · width ×${(pxPerMm * 1000 / pxPerM).toFixed(1)}`;
    title.textContent = `The ski from above. Sidecut radius ${fmt(rsc, 1)} metres: the edge curves in ${fmt(d, 0)} millimetres at the waist. Width is drawn exaggerated.`;
  }
  return { node, update };
}

// The ski's cross-section, tipped onto its edge by θ.
export function edgeDiagram() {
  const W = 220, H = 92, gx = 58, gy = 62;
  const node = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cl-inset-svg', role: 'img' });
  const title = svg('title');
  const snow = svg('path', { class: 'cl-x-snow', d: `M 0 ${gy} L ${W} ${gy} L ${W} ${H} L 0 ${H} Z` });
  const surf = svg('line', { class: 'cl-x-surface', x1: 0, y1: gy, x2: W, y2: gy });
  const ski = svg('g');
  const base = svg('rect', { x: 0, y: -7, width: 58, height: 7, class: 'cl-x-ski' });
  const boot = svg('rect', { x: 18, y: -27, width: 22, height: 20, rx: 3, class: 'cl-x-boot' });
  const leg = svg('line', { x1: 29, y1: -27, x2: 29, y2: -52, class: 'cl-x-leg' });
  ski.append(leg, boot, base);
  const arc = svg('path', { class: 'cl-x-arc' });
  const label = svg('text', { class: 'cl-inset-t' });
  const t2 = svg('text', { x: 6, y: H - 7, class: 'cl-inset-s cl-inset-s--dark' });
  node.append(title, snow, surf, ski, arc, label, t2);
  function update(theta) {
    // Pivot on the edge in the snow; tip up by θ (anticlockwise on screen).
    ski.setAttribute('transform', `translate(${gx} ${gy}) rotate(${-theta})`);
    const r = 34, a = theta * Math.PI / 180;
    arc.setAttribute('d', theta > 0.5 ? `M ${gx + r} ${gy} A ${r} ${r} 0 0 0 ${(gx + r * Math.cos(a)).toFixed(1)} ${(gy - r * Math.sin(a)).toFixed(1)}` : '');
    const la = a / 2;
    label.setAttribute('x', (gx + (r + 10) * Math.cos(la) + 2).toFixed(1)); label.setAttribute('y', (gy - (r + 10) * Math.sin(la) + 4).toFixed(1));
    label.textContent = `θ = ${fmt(theta, 1)}°`;
    t2.textContent = `cos θ = ${fmt(Math.cos(a), 3)}`;
    title.textContent = `The ski seen end-on, tipped ${fmt(theta, 1)} degrees onto its edge. cos θ is ${fmt(Math.cos(a), 3)}.`;
  }
  return { node, update };
}

// Pictures for the explanations (HELP[...].visual).
export function helpVisual(kind) {
  const W = 260, H = 130;
  const n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cl-help-svg', 'aria-hidden': 'true' });
  const arrow = (x1, y1, x2, y2, cls, w) => {
    const ang = Math.atan2(y2 - y1, x2 - x1), h = 8;
    return svg('g', { class: cls }, svg('line', { x1, y1, x2: x2 - Math.cos(ang) * h * 0.6, y2: y2 - Math.sin(ang) * h * 0.6, 'stroke-width': w || 2.5 }),
      svg('path', { d: `M ${x2} ${y2} L ${x2 - h * Math.cos(ang - 0.45)} ${y2 - h * Math.sin(ang - 0.45)} L ${x2 - h * Math.cos(ang + 0.45)} ${y2 - h * Math.sin(ang + 0.45)} Z` }));
  };
  const text = (x, y, s, cls) => svg('text', { x, y, class: cls || 'cl-hv-t' }, s);
  if (kind === 'sidecut') { const d = sidecutDiagram(); d.update(DEFAULTS.sidecutRadius); return d.node; }
  if (kind === 'edge') { const d = edgeDiagram(); d.update(DEFAULTS.edgeAngle); return d.node; }
  if (kind === 'speed') {
    n.append(text(10, 30, 'v'), arrow(30, 26, 100, 26, 'cl-hv-v'), text(110, 30, '10 m/s'),
      text(10, 70, '2v'), arrow(30, 66, 170, 66, 'cl-hv-v'), text(180, 70, '20 m/s'),
      text(10, 110, 'a ∝ v²: twice the speed → 4× the acceleration', 'cl-hv-s'));
    return n;
  }
  if (kind === 'mass') {
    n.append(svg('circle', { cx: 50, cy: 50, r: 12, class: 'cl-hv-body' }), text(38, 82, '50 kg'), arrow(64, 50, 104, 50, 'cl-hv-f', 4), text(110, 46, '500 N', 'cl-hv-s'),
      svg('circle', { cx: 50, cy: 100, r: 17, class: 'cl-hv-body' }), arrow(69, 100, 149, 100, 'cl-hv-f', 4), text(155, 96, '1000 N', 'cl-hv-s'), text(8, 124, '100 kg'),
      text(160, 30, 'same a = 10 m/s²', 'cl-hv-s'));
    return n;
  }
  // Circle-based pictures.
  const cx = 130, cy = 66, r = 48;
  n.append(svg('circle', { cx, cy, r, class: 'cl-hv-circle' }), svg('circle', { cx, cy, r: 3, class: 'cl-hv-centre' }));
  if (kind === 'radius') {
    n.append(svg('line', { x1: cx, y1: cy, x2: cx - r * 0.8, y2: cy + r * 0.6, class: 'cl-hv-r' }), text(cx - 48, cy + 10, 'R'), text(cx + 6, cy - 6, 'centre', 'cl-hv-s'),
      svg('path', { d: `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`, class: 'cl-hv-path' }), text(8, 124, 'the turn: half a circle of radius R', 'cl-hv-s'));
    return n;
  }
  if (kind === 'distance') {
    n.append(svg('path', { d: `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`, class: 'cl-hv-path' }), svg('line', { x1: cx, y1: cy, x2: cx, y2: cy - r, class: 'cl-hv-r' }), text(cx + 6, cy - 20, 'R'),
      text(cx - r - 40, cy + 4, 'πR'), text(8, 124, 'half the circumference 2πR', 'cl-hv-s'));
    return n;
  }
  // centripetal / force: velocity tangent at two points, inward arrows.
  const pts = [[-Math.PI / 2 - 0.9], [Math.PI]];
  pts.forEach(([a]) => {
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), tx = Math.sin(a), ty = -Math.cos(a);
    n.append(arrow(x, y, x + tx * 36, y + ty * 36, 'cl-hv-v'));
    n.append(arrow(x, y, x + (cx - x) * 0.6, y + (cy - y) * 0.6, kind === 'force' ? 'cl-hv-f' : 'cl-hv-a', kind === 'force' ? 4 : 2.5));
  });
  n.append(text(8, 124, kind === 'force' ? 'F points to the centre: F = m × a' : 'v keeps changing direction: a points to the centre', 'cl-hv-s'));
  return n;
}
