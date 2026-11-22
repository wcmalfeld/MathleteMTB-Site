// Drawings: a side-view rider and bike, force arrows, free-body diagrams on
// flat ground or a slope, and the lesson's small pictures. SVG, built from
// data; every arrow has a text label as well as a colour.
//
// Directions in SVG coordinates (y points down). The rider always travels
// to the right; `tilt` is the trail angle in degrees (+ uphill, − downhill).

import { svg } from '../../lesson-kit/dom.js';
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

// The arrow and the rider live in the lesson kit (shared with other lessons).
import { arrow, riderSide } from '../../lesson-kit/draw.js';
export { arrow, riderSide };

// Default arrow lengths when a diagram isn't drawn to scale.
const LEN = { gravity: 78, normal: 78, traction: 52, friction: 52, braking: 52, resistance: 34, air: 34, spring: 40, magnetic: 40, motion: 52, pedal: 40 };

// A free-body diagram: the rider-bike system as a dot-and-block on its trail.
//   forces: [{ type, dir, mag? }]; with `scale` (px per N) lengths are to scale.
export function fbd({ tilt = 0, forces = [], scale = null, W = 340, H = 270, rider = true, ground = 'fill', title, showNet = null }) {
  const cx = W / 2, cy = H * 0.52;
  const n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ls-fbd', role: 'img' });
  if (title) n.append(svg('title', null, title));
  const t = rad(tilt), ux = Math.cos(t), uy = -Math.sin(t);
  // The ground: a line through the contact point under the system.
  const gy = cy + 46 / Math.cos(t);
  if (ground === 'line') n.append(svg('line', { class: 'ls-trail-dir', x1: cx - ux * 400, y1: cy - uy * 400, x2: cx + ux * 400, y2: cy + uy * 400 }),
    svg('text', { class: 'ls-small', x: 12, y: 20 }, 'The system on its own (dashed: the trail’s direction)'));
  else n.append(svg('path', { class: 'ls-ground', d: `M ${cx - ux * 400} ${gy - uy * 400} L ${cx + ux * 400} ${gy + uy * 400} L ${cx + ux * 400} ${H + 400} L ${cx - ux * 400} ${H + 400} Z` }),
    svg('line', { class: 'ls-ground-line', x1: cx - ux * 400, y1: gy - uy * 400, x2: cx + ux * 400, y2: gy + uy * 400 }));
  if (tilt) n.append(svg('text', { class: 'ls-small', x: 12, y: H - 10 }, `trail ${tilt > 0 ? 'up' : 'down'} ${Math.abs(tilt)}°`));
  const body = svg('g', { transform: `translate(${cx} ${gy}) rotate(${-tilt})` });
  if (rider) body.append(svg('g', { class: 'ls-faded', transform: 'translate(0 0)' }, riderSide(58)));
  n.append(body);
  n.append(svg('circle', { class: 'ls-cm', cx, cy, r: 5 }));
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
    const W = 520, H = 170, n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ls-pic', role: 'img' });
    n.append(svg('title', null, 'A rider coasting along a flat trail: velocity forward; in an ideal world nothing changes it, on a real trail resistance points backward.'),
      svg('rect', { class: 'ls-ground', x: 0, y: 128, width: W, height: 42 }), svg('line', { class: 'ls-ground-line', x1: 0, y1: 128, x2: W, y2: 128 }));
    [130, 360].forEach((x, i) => {
      n.append(svg('g', { transform: `translate(${x} 128)` }, riderSide(64)));
      n.append(arrow(x + 40, 60, [1, 0], 70, 'v', 'v'));
      if (i === 1) n.append(arrow(x - 40, 88, [-1, 0], 42, 'r', 'Fr'));
      n.append(svg('text', { class: 'ls-small', x: x - 60, y: 158 }, i === 0 ? 'Ideal: no resistance → coasts forever' : 'Real trail: resistance → slows down'));
    });
    return n;
  }
  if (id === 'fbd-flat') {
    const m = 80, f = fbd({ tilt: 0, title: 'Free-body diagram, flat trail at constant speed: gravity down and normal force up are equal; traction forward and resistance backward are equal.',
      forces: [{ type: 'gravity', dir: 'down' }, { type: 'normal', dir: 'up' }, { type: 'traction', dir: 'forward' }, { type: 'resistance', dir: 'backward' }] });
    f.append(svg('text', { class: 'ls-small', x: 12, y: 20 }, `Flat, steady: Fg = FN = ${fmt(m * G, 0)} N for 80 kg; Ft = Fr`));
    return f;
  }
  if (id === 'fbd-climb') {
    const f = fbd({ tilt: 12, title: 'Free-body diagram on a climb: gravity straight down, split into a part along the slope and a part into it; the normal force perpendicular to the slope; traction up the slope; resistance down it.',
      forces: [{ type: 'gravity', dir: 'down' }, { type: 'normal', dir: 'perp' }, { type: 'traction', dir: 'uphill' }, { type: 'resistance', dir: 'downhill' }] });
    const W = 340, cx = W / 2, cy = 270 * 0.52, t = rad(12);
    // gravity's components, dashed
    f.append(svg('g', { class: 'ls-comp' },
      arrow(cx, cy, dirVector('downhill', 12), 78 * Math.sin(t) * 2.2, 'gc', 'mg sin θ', { width: 2 }),
      arrow(cx, cy, [Math.sin(t), Math.cos(t)], 78 * Math.cos(t), 'gc', 'mg cos θ', { width: 2 })));
    f.append(svg('text', { class: 'ls-small', x: 12, y: 20 }, 'Climb: gravity splits into mg sin θ and mg cos θ'));
    return f;
  }
  return svg('svg', { viewBox: '0 0 10 10' });
}
