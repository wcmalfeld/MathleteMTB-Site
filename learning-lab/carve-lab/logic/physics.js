// Carve Lab: the physics engine. Pure functions, no DOM, no state.
// Every number, picture, graph and answer in the lab comes from here
// (PRD section 5), so nothing on screen can contradict the model.
//
// Units inside the engine are always SI: metres, seconds, kilograms,
// newtons, and RADIANS for trigonometry. Degrees, km/h and mph exist only at
// the edges (controls and displays) and go through convertUnits().
//
// The model is the idealized one the PRD specifies:
//   turn radius            R = Rsc × cos(θ)       (θ = edge angle)
//   centripetal accel.     a = v² / R
//   required inward force  F = m × a
//   g-force                a / 9.81
//   180° turn              distance = πR, time = πR / v
// It ignores ski flex, snow penetration and strength, construction and
// skidding. The lab says so wherever it shows these numbers.

export const G = 9.81;   // m/s², the PRD's value

// Control ranges and defaults (PRD 4.1–4.4).
export const RANGES = {
  sidecutRadius: { min: 10, max: 30, step: 0.5, unit: 'm' },
  edgeAngle:     { min: 0,  max: 65, step: 0.5, unit: '°' },
  speed:         { min: 3,  max: 20, step: 0.1, unit: 'm/s' },
  skierMass:     { min: 35, max: 110, step: 1, unit: 'kg' }
};
export const DEFAULTS = Object.freeze({ sidecutRadius: 15, edgeAngle: 35, speed: 10, skierMass: 65 });
export const VARIABLES = Object.keys(RANGES);

// The smallest radius the engine will divide by. R can only reach 0 at a
// 90° edge angle, which the controls never allow; this guards anything
// called directly with bad input.
export const MIN_RADIUS = 1e-6;

const finite = x => typeof x === 'number' && isFinite(x);

export function clamp(value, min, max) {
  const v = Number(value);
  if (!finite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

// One control value forced into its range (and onto its step).
export function clampVariable(name, value) {
  const r = RANGES[name];
  if (!r) throw new Error('unknown variable ' + name);
  const v = clamp(value, r.min, r.max);
  const stepped = Math.round((v - r.min) / r.step) * r.step + r.min;
  return Number(clamp(stepped, r.min, r.max).toFixed(6));
}

// A whole configuration, every field valid. Missing fields take the defaults.
export function normalizeConfig(cfg) {
  const c = cfg || {};
  const out = {};
  for (const k of VARIABLES) out[k] = clampVariable(k, c[k] === undefined || c[k] === null || c[k] === '' ? DEFAULTS[k] : c[k]);
  return out;
}

export const toRadians = deg => deg * Math.PI / 180;
export const toDegrees = rad => rad * 180 / Math.PI;

// R = Rsc × cos(θ). θ in degrees (converted to radians here).
export function calculateTurnRadius(sidecutRadius, edgeAngleDeg) {
  if (!finite(sidecutRadius) || !finite(edgeAngleDeg) || sidecutRadius <= 0) return 0;
  const r = sidecutRadius * Math.cos(toRadians(edgeAngleDeg));
  // cos(90°) comes out as 6e-17, not 0: treat anything that small as zero.
  return r > 1e-9 ? r : 0;
}

// a = v² / R. A zero (or invalid) radius has no finite answer: returns Infinity
// for a real speed, so callers can show "no turn" instead of dividing by zero.
export function calculateCentripetalAcceleration(speed, radius) {
  if (!finite(speed) || !finite(radius)) return NaN;
  if (radius < MIN_RADIUS) return speed === 0 ? 0 : Infinity;
  return speed * speed / radius;
}

// F = m × a
export function calculateInwardForce(mass, acceleration) {
  if (!finite(mass) || (!finite(acceleration) && acceleration !== Infinity)) return NaN;
  return mass * acceleration;
}

export function calculateGForce(acceleration) {
  if (!finite(acceleration) && acceleration !== Infinity) return NaN;
  return acceleration / G;
}

// A 180° turn is half a circle: distance πR.
export function calculateTurnDistance(radius) {
  if (!finite(radius) || radius < 0) return NaN;
  return Math.PI * radius;
}

// time = πR / v
export function calculateTurnDuration(radius, speed) {
  if (!finite(radius) || !finite(speed) || radius < 0) return NaN;
  if (speed <= 0) return Infinity;
  return Math.PI * radius / speed;
}

// The inverse of the radius model, for "what edge angle gives this radius?":
// θ = arccos(R / Rsc), in degrees. null when no edge angle can do it.
export function edgeAngleForRadius(targetRadius, sidecutRadius) {
  if (!finite(targetRadius) || !finite(sidecutRadius) || sidecutRadius <= 0 || targetRadius <= 0) return null;
  const ratio = targetRadius / sidecutRadius;
  if (ratio > 1) return null;
  return toDegrees(Math.acos(ratio));
}

// How deep the sidecut is: the gap between a straight line from tip to tail
// contact points and the curved edge at the waist (the sagitta of a circle of
// radius Rsc over a chord of the contact length). Used only for the ski
// drawing. contactLength in metres, result in metres.
export function sidecutDepth(sidecutRadius, contactLength = 1.6) {
  const half = contactLength / 2;
  if (!finite(sidecutRadius) || sidecutRadius <= half) return NaN;
  return sidecutRadius - Math.sqrt(sidecutRadius * sidecutRadius - half * half);
}

// Unit conversions. convertUnits(10, 'm/s', 'km/h') -> 36
const FACTORS = {
  speed: { 'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704 },
  angle: { 'deg': Math.PI / 180, '°': Math.PI / 180, 'rad': 1 },
  mass: { 'kg': 1, 'lb': 0.45359237 },
  length: { 'm': 1, 'km': 1000, 'ft': 0.3048, 'mm': 0.001 },
  force: { 'N': 1, 'kN': 1000 },
  acceleration: { 'm/s²': 1, 'm/s^2': 1, 'g': G }
};
export function convertUnits(value, from, to) {
  if (from === to) return value;
  const kind = Object.keys(FACTORS).find(k => from in FACTORS[k] && to in FACTORS[k]);
  if (!kind) throw new Error(`can't convert ${from} to ${to}`);
  return value * FACTORS[kind][from] / FACTORS[kind][to];
}

// Everything the lab shows for one configuration (PRD 12, CarveResults).
export function carve(config) {
  const c = normalizeConfig(config);
  const turnRadius = calculateTurnRadius(c.sidecutRadius, c.edgeAngle);
  const centripetalAcceleration = calculateCentripetalAcceleration(c.speed, turnRadius);
  const inwardForce = calculateInwardForce(c.skierMass, centripetalAcceleration);
  return {
    config: c,
    turnRadius,
    centripetalAcceleration,
    inwardForce,
    gForce: calculateGForce(centripetalAcceleration),
    turnDistance: calculateTurnDistance(turnRadius),
    turnDuration: calculateTurnDuration(turnRadius, c.speed),
    speedKmh: convertUnits(c.speed, 'm/s', 'km/h'),
    speedMph: convertUnits(c.speed, 'm/s', 'mph'),
    sidecutDepth: sidecutDepth(c.sidecutRadius)
  };
}

// Display rounding (the engine never rounds; only the words on screen do).
export function fmt(x, digits = 1) {
  if (x === Infinity) return '∞';
  if (!finite(x)) return '—';
  // Clear floating-point noise first (65 × 12.499999999999996 is really 812.5).
  const s = Number(x.toPrecision(12)).toFixed(digits);
  return (s === '-0' || /^-0\.0*$/.test(s)) ? s.slice(1) : s;
}
