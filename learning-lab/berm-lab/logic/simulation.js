// Berm Lab: where the rider is on the corner.
//
// The corner is a 180° hairpin seen from above (PRD 6.1). The turn centre is
// the origin; x is across the screen and y DOWN the screen. Every riding line
// is a half circle of its own radius around the same centre:
//   entry  (r, 0)   heading up the screen
//   apex   (0, −r)  the top of the turn, heading left
//   exit   (−r, 0)  heading down the screen
// Calculated once per configuration; the animation only asks "where is the
// rider after s metres?" (PRD 6.1, deterministic and frame-rate independent).

// Position along a line of radius r after s metres (clamped to the arc).
export function stateAt(r, s) {
  const R = r > 0 && isFinite(r) ? r : 0;
  const len = Math.PI * R;
  const d = Math.max(0, Math.min(len, s || 0));
  const phi = R ? -d / R : 0;
  const c = Math.cos(phi), n = Math.sin(phi);
  return { x: R * c, y: R * n, tx: n, ty: -c, nx: -c, ny: -n, s: d, length: len, progress: len ? d / len : 0, phi };
}

// Named points on a line.
export const entry = r => ({ x: r, y: 0 });
export const apex = r => ({ x: 0, y: -r });
export const exit = r => ({ x: -r, y: 0 });
export const lineLength = r => Math.PI * r;

// SVG path data for a line (two quarter arcs, so the arc direction is never
// ambiguous). k: pixels per metre; (ox, oy): the centre on screen.
export function linePath(r, k, ox, oy) {
  if (!(r > 0)) return '';
  const R = (r * k).toFixed(2), X = x => (ox + x * k).toFixed(2), Y = y => (oy + y * k).toFixed(2);
  return `M ${X(r)} ${Y(0)} A ${R} ${R} 0 0 0 ${X(0)} ${Y(-r)} A ${R} ${R} 0 0 0 ${X(-r)} ${Y(0)}`;
}

// Time through the corner at constant speed v (m/s).
export const timeThrough = (r, v) => (v > 0 ? Math.PI * r / v : Infinity);

// Velocity, acceleration and force at a point, from the engine's results.
export function vectorsAt(r, s, results) {
  const p = stateAt(r, s);
  return {
    position: p,
    velocity: { x: p.tx * results.speed, y: p.ty * results.speed, magnitude: results.speed },
    acceleration: { x: p.nx * results.centripetalAcceleration, y: p.ny * results.centripetalAcceleration, magnitude: results.centripetalAcceleration },
    force: { x: p.nx * results.netInwardForce, y: p.ny * results.netInwardForce, magnitude: results.netInwardForce }
  };
}
