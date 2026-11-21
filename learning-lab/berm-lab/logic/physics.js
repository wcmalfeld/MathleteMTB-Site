// Berm Lab: the physics engine. Pure functions, no DOM, no state.
// Every number, arrow, graph and answer in the lab comes from here (PRD 5),
// so nothing on screen can contradict the model.
//
// Units inside the engine are SI: metres, seconds, kilograms, newtons, and
// RADIANS for trigonometry. The controls use km/h and degrees; berm() converts
// them on the way in (convertUnits), and only the display rounds.
//
// The model is the PRD's simplified steady-state banked turn: a circular
// line of horizontal radius r, constant speed, a locally constant bank angle
// β (outer edge raised), vertical equilibrium.
//   a = v²/r                     F = m v²/r              lean θ = arctan(v²/rg)
//   q = v²/(rg)                  N = mg(cos β + q sin β) f = mg(sin β − q cos β)
//   μ_required = |f| / N         matched speed √(r g tan β) (none on a flat corner)
// A handy identity the lab teaches: μ_required = |tan(β − θ)|, so the grip
// demand is zero exactly when the berm angle equals the lean angle.

export const G = 9.81;   // m/s², the PRD's value

// Control ranges and defaults (PRD 4.1–4.5). Speed is in km/h at the controls.
export const RANGES = {
  cornerRadius:  { min: 3,   max: 12,  step: 0.1,  unit: 'm' },
  speedKmh:      { min: 5,   max: 35,  step: 0.5,  unit: 'km/h' },
  bermAngle:     { min: 0,   max: 45,  step: 0.5,  unit: '°' },
  totalMass:     { min: 35,  max: 120, step: 1,    unit: 'kg' },
  availableGrip: { min: 0.2, max: 0.8, step: 0.01, unit: '' }
};
export const DEFAULTS = Object.freeze({ cornerRadius: 6, speedKmh: 22, bermAngle: 25, totalMass: 80, availableGrip: 0.45 });
export const VARIABLES = Object.keys(RANGES);
// The three riding lines through the same corner (PRD 4.1, 8).
export const LINES = Object.freeze([
  { id: 'tight', label: 'Tight line', radius: 4 },
  { id: 'middle', label: 'Middle line', radius: 6 },
  { id: 'wide', label: 'Wide line', radius: 8 }
]);
// Traction indicator: "approaching" once the demand reaches this share of the available grip.
export const APPROACH = 0.8;
const MIN_RADIUS = 1e-6;

const finite = x => typeof x === 'number' && isFinite(x);
export function clamp(value, min, max) {
  const v = Number(value);
  if (!finite(v)) return min;
  return Math.min(max, Math.max(min, v));
}
export function clampVariable(name, value) {
  const r = RANGES[name];
  if (!r) throw new Error('unknown variable ' + name);
  const v = clamp(value, r.min, r.max);
  const stepped = Math.round((v - r.min) / r.step) * r.step + r.min;
  return Number(clamp(stepped, r.min, r.max).toFixed(6));
}
export function normalizeConfig(cfg) {
  const c = cfg || {};
  const out = {};
  for (const k of VARIABLES) out[k] = clampVariable(k, c[k] === undefined || c[k] === null || c[k] === '' ? DEFAULTS[k] : c[k]);
  return out;
}

export const toRadians = deg => deg * Math.PI / 180;
export const toDegrees = rad => rad * 180 / Math.PI;

// Unit conversions. convertUnits(36, 'km/h', 'm/s') -> 10
const FACTORS = {
  speed: { 'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704 },
  angle: { 'deg': Math.PI / 180, '°': Math.PI / 180, 'rad': 1 },
  mass: { 'kg': 1, 'lb': 0.45359237 },
  length: { 'm': 1, 'ft': 0.3048 },
  force: { 'N': 1, 'kN': 1000 },
  acceleration: { 'm/s²': 1, 'm/s^2': 1, 'g': G }
};
export function convertUnits(value, from, to) {
  if (from === to) return value;
  const kind = Object.keys(FACTORS).find(k => from in FACTORS[k] && to in FACTORS[k]);
  if (!kind) throw new Error(`can't convert ${from} to ${to}`);
  return value * FACTORS[kind][from] / FACTORS[kind][to];
}

// a = v² / r  (v in m/s). A zero radius has no finite answer: ∞, never a division by zero.
export function calculateCentripetalAcceleration(speed, radius) {
  if (!finite(speed) || !finite(radius)) return NaN;
  if (radius < MIN_RADIUS) return speed === 0 ? 0 : Infinity;
  return speed * speed / radius;
}
// F = m v² / r
export function calculateNetInwardForce(mass, speed, radius) {
  if (!finite(mass)) return NaN;
  return mass * calculateCentripetalAcceleration(speed, radius);
}
// The turning-demand ratio q = v² / (r g): the inward acceleration in g.
export function calculateTurnDemand(speed, radius) {
  const a = calculateCentripetalAcceleration(speed, radius);
  return a / G;
}
// Lean from vertical θ = arctan(v² / rg), in degrees.
export function calculateLeanAngle(speed, radius) {
  const q = calculateTurnDemand(speed, radius);
  if (Number.isNaN(q)) return NaN;
  return toDegrees(Math.atan(q));
}
// The berm angle that matches this speed and radius: arctan(v² / rg) (the same as the lean angle).
export const calculateMatchedBermAngle = calculateLeanAngle;
// Speed (m/s) that needs no lateral friction on a berm of angle β (degrees): √(r g tan β).
// null for a flat corner: there is no matched speed, a flat corner relies on friction alone.
export function calculateIdealMatchedSpeed(radius, bermAngleDeg) {
  if (!finite(radius) || !finite(bermAngleDeg) || radius <= 0) return null;
  if (bermAngleDeg <= 0 || bermAngleDeg >= 90) return null;
  return Math.sqrt(radius * G * Math.tan(toRadians(bermAngleDeg)));
}
// N = mg(cos β + q sin β)
export function calculateNormalForce(mass, speed, radius, bermAngleDeg) {
  const q = calculateTurnDemand(speed, radius), b = toRadians(bermAngleDeg);
  return mass * G * (Math.cos(b) + q * Math.sin(b));
}
// Signed friction along the berm surface: f = mg(sin β − q cos β).
// Positive acts up the berm (outward); negative acts down it (toward the centre).
export function calculateFrictionForce(mass, speed, radius, bermAngleDeg) {
  const q = calculateTurnDemand(speed, radius), b = toRadians(bermAngleDeg);
  return mass * G * (Math.sin(b) - q * Math.cos(b));
}
// μ_required = |sin β − q cos β| / (cos β + q sin β)  (mass cancels; flat corner: = q)
export function calculateRequiredGrip(speed, radius, bermAngleDeg) {
  const q = calculateTurnDemand(speed, radius), b = toRadians(bermAngleDeg);
  if (!finite(q)) return q === Infinity ? Infinity : NaN;
  const den = Math.cos(b) + q * Math.sin(b);
  if (den <= 0) return Infinity;
  const mu = Math.abs(Math.sin(b) - q * Math.cos(b)) / den;
  return mu < 1e-12 ? 0 : mu;
}
// How much available grip is left over (negative: the line asks for more than the setting).
export function calculateGripMargin(required, available) {
  if (!finite(available)) return NaN;
  if (required === Infinity) return -Infinity;
  return available - required;
}
// Within / approaching / exceeds the modeled grip (a model statement, not a safety prediction).
export function gripStatus(required, available) {
  if (!(required <= available + 1e-12)) return 'exceeds';
  return required >= APPROACH * available ? 'approaching' : 'within';
}
// A 180° corner: distance πr, time πr / v.
export function calculateTurnDistance(radius) {
  if (!finite(radius) || radius < 0) return NaN;
  return Math.PI * radius;
}
export function calculateTurnDuration(radius, speed) {
  if (!finite(radius) || !finite(speed) || radius < 0) return NaN;
  if (speed <= 0) return Infinity;
  return Math.PI * radius / speed;
}
// The berm angles that keep μ_required ≤ μ_available: |β − θ| ≤ arctan(μ), within [0, maxAngle].
export function bermAngleWindow(speed, radius, available, maxAngle = 90) {
  const lean = calculateLeanAngle(speed, radius), w = toDegrees(Math.atan(available));
  const lo = Math.max(0, lean - w), hi = Math.min(maxAngle, lean + w);
  return lo <= hi ? { min: lo, max: hi, matched: lean } : null;
}

// Everything the lab shows for one configuration (PRD 13, BermResults).
export function berm(config) {
  const c = normalizeConfig(config);
  const v = convertUnits(c.speedKmh, 'km/h', 'm/s'), r = c.cornerRadius, m = c.totalMass, b = c.bermAngle;
  const a = calculateCentripetalAcceleration(v, r);
  const requiredGrip = calculateRequiredGrip(v, r, b);
  const matched = calculateIdealMatchedSpeed(r, b);
  return {
    config: c,
    speed: v,
    turnRadius: r,
    centripetalAcceleration: a,
    gForce: a / G,
    turnDemand: a / G,
    netInwardForce: calculateNetInwardForce(m, v, r),
    leanAngle: calculateLeanAngle(v, r),
    matchedBermAngle: calculateMatchedBermAngle(v, r),
    idealMatchedSpeed: matched,
    idealMatchedSpeedKmh: matched === null ? null : convertUnits(matched, 'm/s', 'km/h'),
    weight: m * G,
    normalForce: calculateNormalForce(m, v, r, b),
    frictionForce: calculateFrictionForce(m, v, r, b),
    requiredGrip,
    availableGrip: c.availableGrip,
    gripMargin: calculateGripMargin(requiredGrip, c.availableGrip),
    gripStatus: gripStatus(requiredGrip, c.availableGrip),
    turnDistance: calculateTurnDistance(r),
    turnDuration: calculateTurnDuration(r, v),
    speedMph: convertUnits(v, 'm/s', 'mph')
  };
}

export function gripWord(mu) { return mu < 0.35 ? 'Lower modeled grip' : mu < 0.6 ? 'Moderate modeled grip' : 'Higher modeled grip'; }
export const STATUS_TEXT = {
  within: 'Within modeled grip availability',
  approaching: 'Approaching modeled grip limit',
  exceeds: 'Exceeds modeled grip availability'
};

// Display rounding (the engine never rounds; only the words on screen do).
export function fmt(x, digits = 1) {
  if (x === Infinity) return '∞';
  if (x === null || x === undefined || !finite(x)) return '—';
  const s = Number(x.toPrecision(12)).toFixed(digits);
  return (s === '-0' || /^-0\.0*$/.test(s)) ? s.slice(1) : s;
}
