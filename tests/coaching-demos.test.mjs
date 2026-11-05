// The physics demo models should at least point the right way.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frontShare, brakingLoads, cornerNeeds, jumpFlight } from '../js/coaching/demos.js';

test('centre of mass: hips back lightens the front, slopes load it', () => {
  const mid = frontShare({ comX: 0.6 });
  assert.ok(Math.abs(mid - 0.5) < 1e-9);
  assert.ok(frontShare({ comX: 0.4 }) < mid);
  assert.ok(frontShare({ comX: 0.6, slopeDeg: 20 }) > mid);
  assert.ok(frontShare({ comX: -0.05 }) < 0, 'behind the rear axle: front lifts');
});

test('braking moves load forward and has a tip-over limit', () => {
  const still = brakingLoads({ decelG: 0 });
  const hard = brakingLoads({ decelG: 0.6 });
  assert.ok(hard.front > still.front && hard.rear < still.rear);
  assert.ok(Math.abs(hard.front + hard.rear - 1) < 1e-9);
  assert.ok(brakingLoads({ decelG: hard.endoAtG + 0.01 }).rear < 0);
  assert.ok(brakingLoads({ decelG: 0, comX: 0.5 }).endoAtG > brakingLoads({ decelG: 0 }).endoAtG, 'hips back raises the limit');
});

test('cornering: double the speed needs four times the grip; berms help', () => {
  const a = cornerNeeds({ speedKmh: 15, radius: 10 });
  const b = cornerNeeds({ speedKmh: 30, radius: 10 });
  assert.ok(Math.abs(b.accelG / a.accelG - 4) < 1e-9);
  assert.ok(cornerNeeds({ speedKmh: 30, radius: 10, bermDeg: 30 }).muNeeded < b.muNeeded);
  assert.ok(cornerNeeds({ speedKmh: 30, radius: 20 }).muNeeded < b.muNeeded);
});

test('jumps: more speed lands further, from deck to landing to overshoot', () => {
  const slow = jumpFlight({ speedKmh: 12, lipDeg: 30 });
  const mid = jumpFlight({ speedKmh: 22, lipDeg: 30 });
  const fast = jumpFlight({ speedKmh: 40, lipDeg: 30 });
  assert.equal(slow.where, 'deck');
  assert.ok(['landing', 'knuckle'].includes(mid.where), mid.where);
  assert.equal(fast.where, 'overshoot');
  assert.ok(slow.x < mid.x && mid.x < fast.x);
  // On a landing, the touchdown point is on the landing slope.
  const tb = Math.tan(28 * Math.PI / 180);
  assert.ok(Math.abs(mid.y - (-(mid.x - 3) * tb)) < 1e-6);
  // Overshoot lands on the flat below the landing.
  assert.ok(Math.abs(fast.y - (-4 * tb)) < 1e-6);
});
