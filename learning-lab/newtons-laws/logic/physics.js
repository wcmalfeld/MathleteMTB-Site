// Newton's Laws lesson: the physics (PRD 9.3). Pure functions, SI units,
// angles in degrees at the edges and radians inside. Nothing here touches
// the page, so every number the lesson shows can be tested on its own
// (scripts/test-newtons-laws.mjs).
//
// The MTB Force Lab model, along a straight trail. Positive = the rider's
// direction of travel; a positive angle is uphill.
//   Fg∥ = mg sin θ        N = mg cos θ
//   F_net = F_traction − F_braking − F_resistance − mg sin θ
//   a = F_net / m
// Assumptions: one combined rider-bike mass, a straight trail, the tires
// don't slip, braking and resistance are constant forces opposing motion.

export const G = 9.81;

// [min, max, default, step] for each Force Lab control (PRD 9.2).
export const LIMITS = {
  mass: [45, 120, 80, 1],
  traction: [0, 350, 180, 5],
  braking: [0, 300, 0, 5],
  resistance: [0, 120, 40, 5],
  angle: [-10, 15, 0, 1]
};
export const DEFAULTS = Object.fromEntries(Object.entries(LIMITS).map(([k, v]) => [k, v[2]]));
export const START_SPEED = 5;     // m/s (18 km/h): where a ride starts after Reset
export const MAX_SPEED = 25;      // m/s: the model stops the ride beyond this

const finite = x => typeof x === 'number' && isFinite(x);
const rad = d => d * Math.PI / 180;

export function weight(mass, g = G) { return finite(mass) ? mass * g : NaN; }
// Forces along one line: forward minus backward.
export function netForce(forward, backward) { return (forward || 0) - (backward || 0); }
// a = F/m. No mass, no answer (never divides by zero).
export function acceleration(fNet, mass) { return finite(fNet) && finite(mass) && mass > 0 ? fNet / mass : NaN; }
export function forceFor(mass, a) { return finite(mass) && finite(a) ? mass * a : NaN; }
export function massFor(fNet, a) { return finite(fNet) && finite(a) && a !== 0 ? fNet / a : NaN; }
export function slopeParallel(mass, angleDeg) { return weight(mass) * Math.sin(rad(angleDeg)); }
export function slopePerpendicular(mass, angleDeg) { return weight(mass) * Math.cos(rad(angleDeg)); }
export const normalForce = slopePerpendicular;

// Any input becomes a valid configuration inside the control ranges.
export function normalizeConfig(c) {
  const out = {};
  for (const [k, [lo, hi, def]] of Object.entries(LIMITS)) {
    const v = Number((c || {})[k]);
    out[k] = finite(v) ? Math.min(hi, Math.max(lo, v)) : def;
  }
  return out;
}

// Everything the Force Lab shows for one configuration.
export function forceLab(config) {
  const c = normalizeConfig(config);
  const gPar = slopeParallel(c.mass, c.angle);
  const fNet = c.traction - c.braking - c.resistance - gPar;
  const a = acceleration(fNet, c.mass);
  return {
    config: c, mass: c.mass, traction: c.traction, braking: c.braking, resistance: c.resistance, angle: c.angle,
    weight: weight(c.mass), gravityParallel: gPar, normal: normalForce(c.mass, c.angle),
    netForce: fNet, acceleration: a,
    balanced: Math.abs(fNet) < 0.5,
    trend: Math.abs(fNet) < 0.5 ? 'steady' : fNet > 0 ? 'speeding-up' : 'slowing'
  };
}

// One time step of a ride (deterministic: the same steps give the same ride).
// Braking and resistance only oppose motion while the bike moves; stopped, the
// rider stays put unless the traction beats gravity along the slope plus
// those forces. (The model never rolls the rider backward.)
export function step(state, config, dt) {
  const r = forceLab(config);
  let v = state.v, x = state.x, stopped = false;
  if (v <= 0) {
    const drive = r.traction - r.gravityParallel - r.braking - r.resistance;
    if (drive > 0) v = acceleration(drive, r.mass) * dt; else { v = 0; stopped = true; }
  } else {
    v += r.acceleration * dt;
    if (v <= 0) { v = 0; stopped = true; }
  }
  const capped = v >= MAX_SPEED;
  if (capped) v = MAX_SPEED;
  x += v * dt;
  return { t: state.t + dt, v, x, stopped, capped };
}

// Display rounding (the engine never rounds; only the words on screen do).
export function fmt(x, digits = 1) {
  if (x === null || x === undefined || !finite(x)) return '—';
  const s = Number(x.toPrecision(12)).toFixed(digits);
  return (s === '-0' || /^-0\.0*$/.test(s)) ? s.slice(1) : s;
}
// Signed, with a real minus sign: "+2.0", "−3.0".
export const signed = (x, d = 1) => (x > 0 && fmt(x, d) !== fmt(0, d) ? '+' : '') + fmt(x, d).replace(/^-/, '−');
