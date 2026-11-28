// Project Evolve: the fictional product and its models. Northline Cycles and
// Project Switchback are invented; every number is an illustrative classroom
// value, not a manufacturer specification, a real launch or a valuation.
// All values are exact fractions (the kit's frac.js); targets are found by
// stepping through a table (repeated substitution), never with logarithms.
// Pure; no DOM.

import { Frac } from '../../lesson-kit/frac.js';
import { fpow } from '../../lesson-kit/powers.js';

export const COMPANY = 'Northline Cycles', PRODUCT = 'Project Switchback';
export const DATA_NOTE = 'Northline Cycles, Project Switchback and every number in this lab are fictional, illustrative classroom values: not manufacturer specifications, test standards, real launch data or valuations.';
export const TEST_NOTE = 'Real suspension labs run long durability tests on machines that replay recorded ride data. The 28-hour test and 200 readings per second here are fictional educational assumptions.';
export const MEASURE_NOTE = 'These tiny measurements are classroom examples, not real manufacturing tolerances.';
export const LAUNCH_NOTE = 'A simplified model for learning how repeated percentage growth works. Real launches don’t always grow exponentially, and no growth is guaranteed.';
export const MARKET_NOTE = 'A simplified model for learning repeated percentage decrease. The fixed 20% rate is not a universal depreciation rate or a used-bike valuation forecast.';
export const LIMITS = ['Condition', 'Brand and model', 'Component specification', 'Maintenance history', 'Model-year changes', 'Market demand', 'Seasonality'];

const F = x => (x instanceof Frac ? x : typeof x === 'string' ? Frac.parse(x) : Frac.of(x));
export { F, Frac, fpow };

// The engineering test: readings = rate per second × seconds.
export const TEST = { hours: 28, perSecond: 200 };
export const readings = (hours = TEST.hours, perSecond = TEST.perSecond) => perSecond * hours * 60 * 60;

// Growth and decay: y = a(1 + r)^t and y = a(1 − r)^t, with r as a percent.
export const factorOf = (pct, dir = 1) => F(100 + dir * pct).div(100);
export const model = (a, pct, t, dir = 1) => F(a).mul(fpow(factorOf(pct, dir), t));
export const WAIT = { a: 500, pct: 20, add: 100 };
export const N = t => model(WAIT.a, WAIT.pct, t, 1);
export const L = t => F(WAIT.a + WAIT.add * t);
export const BIKE = { a: 6000, pct: 20, drop: 1200, target: 2500 };
export const V = t => model(BIKE.a, BIKE.pct, t, -1);
export const Lv = t => F(BIKE.a - BIKE.drop * t);
// The first whole period at which a model goes below (decay) or above (growth) a target, by checking each period in turn.
export function firstPast(f, target, dir = -1, max = 60) {
  const T = F(target);
  for (let t = 0; t <= max; t++) { const v = f(t), past = dir < 0 ? Number(v.sub(T)) < 0 : Number(v.sub(T)) > 0; if (past) return { t, before: t ? f(t - 1) : null, at: v }; }
  return null;
}
// Display helpers: money to the cent; counts of people rounded with the exact model value kept.
export const num = x => { const v = Number(F(x)); return Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 6 }); };
export const money = x => '$' + Number(F(x)).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(Number(F(x))) ? 0 : 2, maximumFractionDigits: 2 });
export const people = x => Math.round(Number(F(x))).toLocaleString('en-US');

// The product's four phases, one per stage.
export const PHASES = [
  { id: 'prototype', name: 'Prototype Design Lab', role: 'product design engineer' },
  { id: 'testlab', name: 'Engineering Test Lab', role: 'test technician' },
  { id: 'launch', name: 'Product Launch', role: 'product launch manager' },
  { id: 'market', name: 'Used Market', role: 'market analyst' }
];

// Photos for the stages (assets/photos/EVOLVE/). Real-world scenes for context only: the lab's
// company and bike are fictional, so no photo is presented as Project Switchback itself.
const PH = '../../assets/photos/EVOLVE/';
export const PHOTOS = {
  cad: { src: PH + 'image2.jpeg', w: 768, h: 696, alt: 'A designer at a desk studies a CAD model of a bike wheel and swingarm on a large monitor', caption: 'Real product designers model components in CAD software before anything is built.' },
  rig: { src: PH + 'image3.jpeg', w: 2100, h: 1400, alt: 'A suspension fork clamped upright in a laboratory test machine between steel columns', caption: 'A suspension fork in a laboratory test machine: rigs like this repeat loads for hours.' },
  dyno: { src: PH + 'image4.jpeg', w: 1157, h: 633, alt: 'An engineer watches live readings on a monitor beside a coil shock mounted in a test rig', caption: 'Every second of a test produces readings: datasets quickly reach millions of values.' },
  launch: { src: PH + 'image1.jpeg', w: 1400, h: 1400, alt: 'A full-suspension downhill race bike photographed in a dark studio between light tubes', caption: 'A real gravity race bike at a studio shoot. Project Switchback is fictional, but launches look like this.' }
};
