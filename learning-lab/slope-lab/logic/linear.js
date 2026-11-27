// Map the Line: the maths of coordinates, slope, linear and proportional
// relationships. Exact fractions throughout (lesson-kit/frac.js), so a slope
// of 15/300 is exactly 1/20 and a vertical line is "undefined", never
// Infinity. Pure; no DOM. Every result uses coordinate values, never pixels.

import { Frac, show } from '../../lesson-kit/frac.js';
const F = x => Frac.of(x);

// 'I' | 'II' | 'III' | 'IV' | 'origin' | 'x-axis' | 'y-axis' (points on an axis are in no quadrant)
export function quadrant(x, y) {
  x = Number(x); y = Number(y);
  if (x === 0 && y === 0) return 'origin';
  if (y === 0) return 'x-axis';
  if (x === 0) return 'y-axis';
  return x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III');
}
export const QUAD_NAME = { I: 'Quadrant I', II: 'Quadrant II', III: 'Quadrant III', IV: 'Quadrant IV', origin: 'The origin', 'x-axis': 'On the x-axis (no quadrant)', 'y-axis': 'On the y-axis (no quadrant)' };
// A grid position read with each axis's own scale: (ix intervals, iy intervals) → coordinates.
export const scaled = (ix, iy, sx, sy) => ({ x: ix * sx, y: iy * sy });

// Slope between two points: { kind: 'positive'|'negative'|'zero'|'undefined', value: Frac|null, rise, run }
export function slope(p1, p2) {
  const rise = F(p2.y).sub(p1.y), run = F(p2.x).sub(p1.x);
  if (run.zero) return { kind: 'undefined', value: null, rise, run };
  const m = rise.div(run);
  return { kind: m.zero ? 'zero' : m.n > 0 ? 'positive' : 'negative', value: m, rise, run };
}
// Grade (%) from a slope; only meaningful when rise and run use the same unit.
export const grade = m => (m === null ? null : F(m).mul(100));
export const steepness = m => (m === null ? null : F(m).n < 0 ? F(m).neg().mul(100) : F(m).mul(100));

// rows: [[x, y], …] in order of x.
export const firstDifferences = rows => rows.slice(1).map((r, i) => F(r[1]).sub(rows[i][1]));
export const equallySpaced = rows => { const d = rows.slice(1).map((r, i) => F(r[0]).sub(rows[i][0])); return d.every(x => x.eq(d[0])); };
// Rates between consecutive points: works whether or not the x-values are equally spaced.
export const rates = rows => rows.slice(1).map((r, i) => F(r[1]).sub(rows[i][1]).div(F(r[0]).sub(rows[i][0])));
export const isLinear = rows => { const R = rates(rows); return R.every(r => r.eq(R[0])); };
// For a linear table: y = mx + b.
export function lineOf(rows) {
  if (!isLinear(rows)) return null;
  const m = rates(rows)[0], b = F(rows[0][1]).sub(m.mul(rows[0][0]));
  return { m, b };
}
// Proportional: linear AND through the origin (b = 0), so y/x is the same for every nonzero x.
export function proportional(rows) {
  const L = lineOf(rows);
  if (!L || !L.b.zero) return { proportional: false, linear: !!L, k: null, ratios: ratios(rows) };
  return { proportional: true, linear: true, k: L.m, ratios: ratios(rows) };
}
// y/x for every row with x ≠ 0 (never divides by zero).
export const ratios = rows => rows.filter(r => Number(r[0]) !== 0).map(r => F(r[1]).div(r[0]));
// 'proportional' | 'linear' (but not proportional) | 'not-linear'
export const classify = rows => (proportional(rows).proportional ? 'proportional' : isLinear(rows) ? 'linear' : 'not-linear');

export const S = x => (x === null || x === undefined ? 'undefined' : show(F(x)).replace(/^-/, '−'));
export const signed = x => (F(x).n > 0 ? '+' : '') + S(x);
export { Frac };
