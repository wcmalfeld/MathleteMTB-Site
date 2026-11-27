// Frame the Line: the production models and the film concepts. Every money
// figure is a fictional classroom production credit shown in dollars, not a
// film-industry rate; the storage model is simplified (real footage use
// varies with codec, frame rate, audio and compression). Pure; no DOM.

import { Frac } from '../../lesson-kit/frac.js';

export const MONEY_NOTE = 'All costs in this lab are fictional classroom production credits shown in dollars, not real film-industry rates.';
export const STORAGE_NOTE = 'The storage model is simplified: real cameras use space at different rates depending on codec, frame rate, audio and compression.';

// The budget: C(d) = 1800 + 420d for d shoot days, approved for up to 8 days.
export const BUDGET = { fixed: 1800, daily: 420, maxDays: 8 };
export const C = d => BUDGET.fixed + BUDGET.daily * d;
// Memory cards: S(h) = 600 − 40h GB free after h hours of recording (full at 15 h).
export const STORAGE = { start: 600, rate: 40 };
export const Sf = h => STORAGE.start - STORAGE.rate * h;
// Editing: E(h) = 120 + 90h credits for h editor-hours.
export const EDIT = { base: 120, rate: 90 };
export const Ef = h => EDIT.base + EDIT.rate * h;

export const CONCEPTS = [
  { id: 'desert', name: 'Utah Desert Freeride', blurb: 'Red sandstone, natural cliffs and massive freeride lines, shot at golden hour with drones overhead.', location: 'Sandstone ridges, southern Utah', rider: 'Jess Ortega' },
  { id: 'forest', name: 'British Columbia Forest Film', blurb: 'Dense evergreen forest, technical singletrack and North Shore wooden features in soft forest light.', location: 'Coastal rainforest, British Columbia', rider: 'Kai Lindqvist' },
  { id: 'slopestyle', name: 'Slopestyle Action Film', blurb: 'Sculpted dirt jumps, wooden ramps, slow-motion tricks and FPV drone chase shots.', location: 'A purpose-built slopestyle course', rider: 'Remy Duval' }
];
// The riders are fictional characters for the story.
export const TIMELINE = [
  { id: 'pre', name: 'Pre-production', mission: 'plan' },
  { id: 'location', name: 'Location preparation', mission: 'budget' },
  { id: 'filming', name: 'Filming', mission: 'checkpoint' },
  { id: 'graphs', name: 'Dailies and planning graphs', mission: 'graph' },
  { id: 'editing', name: 'Editing', mission: 'limits' },
  { id: 'delivery', name: 'Final delivery', mission: 'direct' }
];
export const BUDGET_TABLE = [0, 1, 2, 3, 4, 5].map(d => [d, C(d)]);
// What the $1,800 up front covers (fictional), and the approved budget: the
// full eight-day shoot, C(8) = $5,160.
export const FIXED_PARTS = [['Pre-production (permits, scouting, travel)', 1100], ['Equipment reservation (camera, drone, audio)', 700]];
export const APPROVED = C(BUDGET.maxDays);
// Production functions the director's dashboard runs.
export const FUNCTIONS = [
  { id: 'C', name: 'Production cost', rule: 'C(d) = 1800 + 420d', input: 'd', inName: 'shoot days', unit: '$', b: 1800, m: 420, dom: [0, 8], say: (x, y) => `After ${x} shoot day${x === 1 ? '' : 's'}, the modeled production cost is $${y.toLocaleString('en-US')}.` },
  { id: 'S', name: 'Free storage', rule: 'S(h) = 600 − 40h', input: 'h', inName: 'recording hours', unit: 'GB', b: 600, m: -40, dom: [0, 15], say: (x, y) => `After ${x} hour${x === 1 ? '' : 's'} of recording, ${y} GB of storage is still free (a simplified model).` },
  { id: 'E', name: 'Editing cost', rule: 'E(h) = 120 + 90h', input: 'h', inName: 'editor-hours', unit: 'credits', b: 120, m: 90, dom: [0, 20], say: (x, y) => `${x} editor-hour${x === 1 ? '' : 's'} cost${x === 1 ? 's' : ''} ${y} credits in the model.` }
];
export { Frac };
