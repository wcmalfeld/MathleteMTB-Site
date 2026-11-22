// Drawings: a side-view rider and bike, force arrows, free-body diagrams on
// flat ground or a slope, and the lesson's small pictures. SVG, built from
// data; every arrow has a text label as well as a colour.
//
// Directions in SVG coordinates (y points down). The rider always travels
// to the right; `tilt` is the trail angle in degrees (+ uphill, − downhill).

import { svg } from './dom.js';
import { fmt, G } from '../logic/physics.js';
import { FORCES } from '../logic/lesson.js';

const rad = d => d * Math.PI / 180;

// Unit vector for a named direction on a trail tilted `tilt` degrees.
export function dirVector(dir, tilt = 0) {
  const t = rad(tilt), u = [Math.cos(t), -Math.sin(t)], n = [-Math.sin(t), -Math.cos(t)];
  const neg = v => [-v[0], -v[1]];
  switch (dir) {
    case 'up': return [0, -1];
    case 'down': return [0, 1];
    case 'forward': return u;
    case 'backward': return neg(u);
    case 'perp': return n;
    case 'uphill': return tilt >= 0 ? u : neg(u);
    case 'downhill': return tilt >= 0 ? neg(u) : u;
    default: return [0, 0];
  }
}

// An arrow from (x, y) along unit vector d, `len` px long, with a label.
export function arrow(x, y, d, len, cls, label, opts = {}) {
  const g = svg('g', { class: 'nl-arrow nl-arrow--' + cls });
  if (!(len > 0.5)) return g;
  const x2 = x + d[0] * len, y2 = y + d[1] * len, h = Math.min(11, len * 0.6), a = Math.atan2(d[1], d[0]);
  g.append(svg('line', { x1: x, y1: y, x2: x2 - Math.cos(a) * h * 0.7, y2: y2 - Math.sin(a) * h * 0.7, 'stroke-width': opts.width || 3.5 }),
    svg('path', { d: `M ${x2} ${y2} L ${x2 - h * Math.cos(a - 0.42)} ${y2 - h * Math.sin(a - 0.42)} L ${x2 - h * Math.cos(a + 0.42)} ${y2 - h * Math.sin(a + 0.42)} Z` }));
  if (label) {
    const lx = x2 + d[0] * 10 + (Math.abs(d[0]) < 0.3 ? 8 : 0), ly = y2 + d[1] * 12 + 4;
    g.append(svg('text', { x: lx, y: ly, 'text-anchor': d[0] < -0.3 ? 'end' : Math.abs(d[0]) < 0.3 ? 'start' : 'start', class: 'nl-arrow-label' }, label));
  }
  return g;
}

// A rider and bike seen from the side, facing right, wheels touching y = 0.
// `spin` turns the wheels (radians).
export function riderSide(s = 60, spin = 0) {
  const r = s * 0.3, wx = s * 0.52, cy = -r;
  const wheel = cx => svg('g', { transform: `translate(${cx} ${cy})` },
    svg('circle', { r, class: 'nl-tire' }),
    svg('path', { class: 'nl-spokes', d: [0, 1, 2].map(i => { const a = spin + i * Math.PI / 3; return `M ${-Math.cos(a) * r * 0.85} ${-Math.sin(a) * r * 0.85} L ${Math.cos(a) * r * 0.85} ${Math.sin(a) * r * 0.85}`; }).join(' ') }));
  const bb = [-s * 0.02, cy + r * 0.05], seat = [-s * 0.18, cy - s * 0.5];
  return svg('g', { class: 'nl-rider' },
    wheel(-wx), wheel(wx),
    svg('path', { class: 'nl-frame', d: `M ${-wx} ${cy} L ${bb[0]} ${bb[1]} L ${s * 0.32} ${cy - s * 0.42} L ${wx} ${cy} M ${bb[0]} ${bb[1]} L ${seat[0]} ${seat[1]} L ${s * 0.32} ${cy - s * 0.42} L ${-wx} ${cy} M ${s * 0.32} ${cy - s * 0.42} L ${s * 0.36} ${cy - s * 0.56}` }),
    svg('path', { class: 'nl-body', d: `M ${seat[0]} ${seat[1] - 4} L ${s * 0.12} ${cy - s * 0.92} L ${s * 0.36} ${cy - s * 0.58} M ${seat[0] + 2} ${seat[1]} L ${bb[0] + s * 0.06} ${bb[1] - s * 0.18} L ${bb[0]} ${bb[1]}` }),
    svg('circle', { class: 'nl-helmet', cx: s * 0.14, cy: cy - s * 1.04, r: s * 0.11 }));
}

// Default arrow lengths when a diagram isn't drawn to scale.
const LEN = { gravity: 78, normal: 78, traction: 52, friction: 52, braking: 52, resistance: 34, air: 34, spring: 40, magnetic: 40, motion: 52, pedal: 40 };

// A free-body diagram: the rider-bike system as a dot-and-block on its trail.
//   forces: [{ type, dir, mag? }]; with `scale` (px per N) lengths are to scale.
export function fbd({ tilt = 0, forces = [], scale = null, W = 340, H = 270, rider = true, ground = 'fill', title, showNet = null }) {
  const cx = W / 2, cy = H * 0.52;
  const n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'nl-fbd', role: 'img' });
  if (title) n.append(svg('title', null, title));
  const t = rad(tilt), ux = Math.cos(t), uy = -Math.sin(t);
  // The ground: a line through the contact point under the system.
  const gy = cy + 46 / Math.cos(t);
  if (ground === 'line') n.append(svg('line', { class: 'nl-trail-dir', x1: cx - ux * 400, y1: cy - uy * 400, x2: cx + ux * 400, y2: cy + uy * 400 }),
    svg('text', { class: 'nl-small', x: 12, y: 20 }, 'The system on its own (dashed: the trail’s direction)'));
  else n.append(svg('path', { class: 'nl-ground', d: `M ${cx - ux * 400} ${gy - uy * 400} L ${cx + ux * 400} ${gy + uy * 400} L ${cx + ux * 400} ${H + 400} L ${cx - ux * 400} ${H + 400} Z` }),
    svg('line', { class: 'nl-ground-line', x1: cx - ux * 400, y1: gy - uy * 400, x2: cx + ux * 400, y2: gy + uy * 400 }));
  if (tilt) n.append(svg('text', { class: 'nl-small', x: 12, y: H - 10 }, `trail ${tilt > 0 ? 'up' : 'down'} ${Math.abs(tilt)}°`));
  const body = svg('g', { transform: `translate(${cx} ${gy}) rotate(${-tilt})` });
  if (rider) body.append(svg('g', { class: 'nl-faded', transform: 'translate(0 0)' }, riderSide(58)));
  n.append(body);
  n.append(svg('circle', { class: 'nl-cm', cx, cy, r: 5 }));
  forces.forEach(f => {
    const d = dirVector(f.dir, tilt), info = FORCES[f.type] || { sym: f.type, cls: 'x' };
    const len = scale && f.mag !== undefined ? Math.max(f.mag > 0 ? 14 : 0, f.mag * scale) : LEN[f.type] || 45;
    const label = info.sym + (scale && f.mag !== undefined ? ' ' + fmt(f.mag, 0) + ' N' : '');
    n.append(arrow(cx, cy, d, len, info.cls, label));
  });
  if (showNet) n.append(arrow(cx, cy, showNet.d, showNet.len, 'net', showNet.label, { width: 5 }));
  return n;
}

// The lesson's small pictures (lesson block { t: 'visual', id }).
export function visual(id) {
  if (id === 'coast') {
    const W = 520, H = 170, n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'nl-pic', role: 'img' });
    n.append(svg('title', null, 'A rider coasting along a flat trail: velocity forward; in an ideal world nothing changes it, on a real trail resistance points backward.'),
      svg('rect', { class: 'nl-ground', x: 0, y: 128, width: W, height: 42 }), svg('line', { class: 'nl-ground-line', x1: 0, y1: 128, x2: W, y2: 128 }));
    [130, 360].forEach((x, i) => {
      n.append(svg('g', { transform: `translate(${x} 128)` }, riderSide(64)));
      n.append(arrow(x + 40, 60, [1, 0], 70, 'v', 'v'));
      if (i === 1) n.append(arrow(x - 40, 88, [-1, 0], 42, 'r', 'Fr'));
      n.append(svg('text', { class: 'nl-small', x: x - 60, y: 158 }, i === 0 ? 'Ideal: no resistance → coasts forever' : 'Real trail: resistance → slows down'));
    });
    return n;
  }
  if (id === 'fbd-flat') {
    const m = 80, f = fbd({ tilt: 0, title: 'Free-body diagram, flat trail at constant speed: gravity down and normal force up are equal; traction forward and resistance backward are equal.',
      forces: [{ type: 'gravity', dir: 'down' }, { type: 'normal', dir: 'up' }, { type: 'traction', dir: 'forward' }, { type: 'resistance', dir: 'backward' }] });
    f.append(svg('text', { class: 'nl-small', x: 12, y: 20 }, `Flat, steady: Fg = FN = ${fmt(m * G, 0)} N for 80 kg; Ft = Fr`));
    return f;
  }
  if (id === 'fbd-climb') {
    const f = fbd({ tilt: 12, title: 'Free-body diagram on a climb: gravity straight down, split into a part along the slope and a part into it; the normal force perpendicular to the slope; traction up the slope; resistance down it.',
      forces: [{ type: 'gravity', dir: 'down' }, { type: 'normal', dir: 'perp' }, { type: 'traction', dir: 'uphill' }, { type: 'resistance', dir: 'downhill' }] });
    const W = 340, cx = W / 2, cy = 270 * 0.52, t = rad(12);
    // gravity's components, dashed
    f.append(svg('g', { class: 'nl-comp' },
      arrow(cx, cy, dirVector('downhill', 12), 78 * Math.sin(t) * 2.2, 'gc', 'mg sin θ', { width: 2 }),
      arrow(cx, cy, [Math.sin(t), Math.cos(t)], 78 * Math.cos(t), 'gc', 'mg cos θ', { width: 2 })));
    f.append(svg('text', { class: 'nl-small', x: 12, y: 20 }, 'Climb: gravity splits into mg sin θ and mg cos θ'));
    return f;
  }
  return svg('svg', { viewBox: '0 0 10 10' });
}
