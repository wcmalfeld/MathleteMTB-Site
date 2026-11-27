// Uplift: the fictional bike park. Every price, quantity and rate here is an
// instructional scenario, not real commercial pricing or construction advice.
// Pure; no DOM.

import { E } from './systems.js';

export const PRICE_NOTE = 'All prices, quantities and rates in this lab are fictional instructional scenarios, not real commercial pricing.';
export const SOIL_NOTE = 'The 70% clay / 30% sand blend comes from one published pump-track project specification (the City of Davis), not a universal recommendation. The stockpiles and this volume-based model are simplified for the classroom: real surface mixes, soil properties, compaction and drainage must be professionally assessed and approved.';
export const CREW_NOTE = 'Crew rates here are hypothetical instructional values. IMBA guidance reports broad ranges of daily trail production; terrain, soil, crew experience and trail type all change real output, so no rate is guaranteed.';
export const WHOLE_NOTE = 'Ride counts are whole numbers: the lines are drawn continuously to show the pattern, but a rider takes 5 or 6 rides, never 5.5.';

// The three looks a student can choose. Imagery and story only: the maths is identical.
export const DESTINATIONS = [
  { id: 'rainforest', name: 'Tasmania Rainforest', blurb: 'Rainforest singletrack, remote shuttle runs and scenic trailheads deep in the ferns.', hub: 'the rainforest shuttle hub' },
  { id: 'alpine', name: 'Swiss Alpine Bike Park', blurb: 'Gondolas, alpine terrain and big lift-served bike park facilities above the valley.', hub: 'the gondola base station' },
  { id: 'bc', name: 'British Columbia Gravity Park', blurb: 'Dense forest, steep downhill trails, a rental workshop and a busy shuttle hub.', hub: 'the gravity park shuttle hub' }
];
export const PARK_NAME = 'the park';

// The guided scenarios (PRD values).
export const PLANS = { a: { id: 'a', name: 'Pay As You Ride', fee: 12, rate: 8 }, b: { id: 'b', name: 'Mountain Pass', fee: 36, rate: 4 } };
export const FLEET = { total: 18, trail: 60, dh: 90, revenue: 1260, e1: E(1, 1, 18), e2: E(60, 90, 1260) };
export const FLEET_2 = { total: 20, trail: 50, fr: 80, revenue: 1240, e1: E(1, 1, 20), e2: E(50, 80, 1240) };
export const INVOICES = { a: { kits: 2, pads: 3, total: 310 }, b: { kits: 4, pads: 3, total: 470 }, e1: E(2, 3, 310), e2: E(4, 3, 470) };
export const ORDERS = { e1: E(3, 2, 260), e2: E(2, 3, 240) };
export const MIX = { total: 10, target: 70, pa: 90, pb: 50 };
export const CREWS = { a: { name: 'Crew A', start: 300, rate: 120 }, b: { name: 'Crew B', start: 0, rate: 160 } };

// The four departments of Operations HQ, with the stage that runs each, and a photo where there is one.
const PHOTO = '../../assets/photos/Alg1_SystemsofEquations/';
export const DEPARTMENTS = [
  { id: 'uplift', name: 'Uplift Operations', mission: 'shuttle', photo: PHOTO + 'image1.jpeg', alt: 'Riders step off a shuttle bus at a forest trailhead while others unload bikes from a trailer' },
  { id: 'fleet', name: 'Rental Fleet', mission: 'fleet', photo: PHOTO + 'image2.jpeg', alt: 'Rows of blue rental mountain bikes lined up in a rack' },
  { id: 'workshop', name: 'Workshop', mission: 'workshop', photo: null, alt: '' },
  { id: 'trails', name: 'Trail Construction', mission: 'mountain', photo: PHOTO + 'image3.jpeg', alt: 'A trail crew in high-visibility shirts shovels dirt to shape a berm in a forest' }
];
