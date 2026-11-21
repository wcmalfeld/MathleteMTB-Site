// Carve Lab: the turn's path, and where the skier is on it.
//
// The path is calculated once per configuration (PRD 6.1); the animation
// only asks "where is the skier after s metres?" and never recomputes the
// physics. Deterministic: the same configuration always gives the same path.
//
// Coordinates are metres on a top-down view of the slope: x across the hill,
// y DOWN the fall line (as on screen). A 180° turn is half a circle of the
// model's radius R:
//   - a single turn starts traversing to the skier's left (−x), turns down
//     the fall line and finishes traversing the other way: the left half of
//     a circle centred R below the start;
//   - linked turns alternate left and right halves, each starting where the
//     last ended and heading the same way, so the line is smooth (the
//     direction never jumps) and forms the S-shaped skiing line (PRD 6.2).

import { carve } from './physics.js';

// One arc: centre (cx, cy), start angle phi0, direction sgn (−1 = a left
// turn, +1 = a right turn), radius R. Position at arc length u:
//   phi = phi0 + sgn·u/R,  point = centre + R(cos phi, sin phi)
//   unit tangent = sgn·(−sin phi, cos phi),  unit normal (to centre) = −(cos phi, sin phi)
function arcAt(a, u) {
  const phi = a.phi0 + a.sgn * u / a.R;
  const c = Math.cos(phi), s = Math.sin(phi);
  return { x: a.cx + a.R * c, y: a.cy + a.R * s, tx: -a.sgn * s, ty: a.sgn * c, nx: -c, ny: -s, phi };
}

// buildPath(R, { mode: 'single' | 'linked', turns, x0, y0 })
// Returns { R, mode, arcs, length, start, end, bounds }.
export function buildPath(R, opts = {}) {
  const mode = opts.mode === 'linked' ? 'linked' : 'single';
  const turns = mode === 'linked' ? Math.max(2, Math.min(12, opts.turns || 4)) : 1;
  const x0 = opts.x0 || 0, y0 = opts.y0 || 0;
  const r = R > 0 && isFinite(R) ? R : 0;
  const arcs = [];
  for (let k = 0; k < turns; k++) {
    arcs.push({ index: k, cx: x0, cy: y0 + (2 * k + 1) * r, R: r, phi0: -Math.PI / 2, sgn: k % 2 === 0 ? -1 : 1,
      side: k % 2 === 0 ? 'left' : 'right', start: k * Math.PI * r, length: Math.PI * r });
  }
  const length = turns * Math.PI * r;
  return {
    R: r, mode, turns, arcs, length,
    start: { x: x0, y: y0 }, end: { x: x0, y: y0 + 2 * turns * r },
    // Single turns sweep left of the start line; linked turns both ways.
    bounds: { minX: x0 - r, maxX: mode === 'linked' ? x0 + r : x0, minY: y0, maxY: y0 + 2 * turns * r }
  };
}

// Where the skier is after s metres along the path (clamped to the path).
export function stateAt(path, s) {
  if (!path.arcs.length || path.R <= 0) return { x: path.start.x, y: path.start.y, tx: -1, ty: 0, nx: 0, ny: 1, cx: path.start.x, cy: path.start.y, s: 0, arc: 0, side: 'left', progress: 0, turnFraction: 0 };
  const d = Math.max(0, Math.min(path.length, s || 0));
  let i = Math.min(path.arcs.length - 1, Math.floor(d / (Math.PI * path.R)));
  if (i < 0) i = 0;
  const a = path.arcs[i];
  const u = d - a.start;
  const p = arcAt(a, u);
  return { ...p, cx: a.cx, cy: a.cy, s: d, arc: i, side: a.side, progress: path.length ? d / path.length : 0, turnFraction: u / a.length };
}

// The physics at a point on the path: velocity along the tangent, and the
// acceleration and required force toward the centre (PRD 6.3). Same numbers
// as carve(), pointed in the right directions.
export function vectorsAt(path, s, config) {
  const r = carve(config);
  const p = stateAt(path, s);
  return {
    position: p,
    velocity: { x: p.tx * r.config.speed, y: p.ty * r.config.speed, magnitude: r.config.speed },
    acceleration: { x: p.nx * r.centripetalAcceleration, y: p.ny * r.centripetalAcceleration, magnitude: r.centripetalAcceleration },
    force: { x: p.nx * r.inwardForce, y: p.ny * r.inwardForce, magnitude: r.inwardForce }
  };
}

// SVG path data for the whole line (each 180° arc drawn as two 90° arcs so
// the SVG arc direction is never ambiguous). k scales metres to drawing units.
export function pathData(path, k = 1, ox = 0, oy = 0) {
  if (!path.arcs.length || path.R <= 0) return '';
  const X = x => ((x - ox) * k).toFixed(3), Y = y => ((y - oy) * k).toFixed(3), Rk = (path.R * k).toFixed(3);
  let d = `M ${X(path.start.x)} ${Y(path.start.y)}`;
  for (const a of path.arcs) {
    const mid = arcAt(a, a.length / 2), end = arcAt(a, a.length);
    const sweep = a.sgn > 0 ? 1 : 0;
    d += ` A ${Rk} ${Rk} 0 0 ${sweep} ${X(mid.x)} ${Y(mid.y)} A ${Rk} ${Rk} 0 0 ${sweep} ${X(end.x)} ${Y(end.y)}`;
  }
  return d;
}

// Time for the skier to cover the path at constant speed v (seconds).
export const pathTime = (path, v) => (v > 0 ? path.length / v : Infinity);
