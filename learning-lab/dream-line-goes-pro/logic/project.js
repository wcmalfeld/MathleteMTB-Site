// The Dream Line Goes Pro: the park project carried forward from Unit 1.
// The student's Unit 1 park (The Dream Line Project) is read, never written:
// Unit 2 keeps its own progress, and its own additions to the project (an
// engineering project name, a summary, the approved plan) live in Unit 2's
// data. A student who skipped Unit 1 gets a starter park instead.
//
// Numbers in this lab (credits, crew-hours, grade limits, sag targets) are
// fictional classroom values, not real budgets, construction standards or
// bike setup instructions.

import { createProgress } from '../../lesson-kit/progress.js';
import { tidyPark, blankPark, buildPlan, counts, featureTotal, FEATURES, ENVIRONMENTS } from '../../dream-line-project/logic/park.js';

export const FICTION_NOTE = 'Every number in this lab (credits, crew-hours, grade limits and sag targets) is a fictional classroom value: not a real budget, a trail-construction standard or a bike setup instruction.';
export const SAG_NOTE = 'Sag targets vary by suspension component, manufacturer, bike and rider. The 30% here is a classroom value, not a setup instruction: use your own bike’s and suspension manufacturer’s guidance for real setup.';
export const GRADE_NOTE = 'The 8% limit is a fictional project requirement for this classroom scenario, not a trail-construction standard. Real trail design needs professional, site-specific assessment.';

export function starterPark() {
  const p = blankPark();
  p.env = 'forest'; p.name = 'The Dream Line (starter project)';
  ['tabletop', 'tabletop', 'roller', 'berm', 'tabletop', 'berm', 'wallride', null, 'hip', 'roller', null, 'drop'].forEach((f, i) => { p.slots[i] = f; });
  return p;
}
// { park, fromUnit1 } — read-only look at the Unit 1 lab's saved progress.
export function loadProject({ studentId, storage } = {}) {
  try {
    const U1 = createProgress({ lesson: { id: 'dream-line-project', sections: [], questions: {} }, studentId, storage });
    const raw = U1.getData('park', null), park = tidyPark(raw);
    if (raw && featureTotal(park) > 0) return { park, fromUnit1: true };
  } catch (e) { /* fall through to the starter park */ }
  return { park: starterPark(), fromUnit1: false };
}
export function projectSummary(park) {
  const c = counts(park), plan = buildPlan(park), env = ENVIRONMENTS.find(e => e.id === park.env);
  const jumps = ['tabletop', 'hip', 'stepup', 'stepdown', 'drop'].reduce((s, k) => s + c[k], 0), flow = ['berm', 'roller', 'pump'].reduce((s, k) => s + c[k], 0);
  return { env: env.name, features: featureTotal(park), jumps, flow, wood: c.wallride, plan, list: FEATURES.filter(f => c[f.id]).map(f => ({ ...f, count: c[f.id] })) };
}

// Final park approval (Stage 5). Fictional conditions, checked with the kit's inequality engine.
export const APPROVAL = {
  credits: 180, kitCost: 12, run: 300, maxGrade: 8,
  plans: [
    { id: 'A', name: 'Plan A', kits: 3, rise: 20 },
    { id: 'B', name: 'Plan B', kits: 8, rise: 22 },
    { id: 'C', name: 'Plan C', kits: 11, rise: 18 },
    { id: 'D', name: 'Plan D', kits: 6, rise: 27 },
    { id: 'E', name: 'Plan E', kits: 10, rise: 24 }
  ]
};
export const CONSTRAINTS = [
  { id: 'spend', text: 'Spending can’t exceed 180 credits', ineq: '12k ≤ 180', test: p => 12 * p.kits <= 180 },
  { id: 'min', text: 'At least 4 feature packages', ineq: 'k ≥ 4', test: p => p.kits >= 4 },
  { id: 'keep', text: 'At least 60 credits must remain', ineq: '180 − 12k ≥ 60', test: p => 180 - 12 * p.kits >= 60 },
  { id: 'max', text: 'No more than 10 kits', ineq: 'k ≤ 10', test: p => p.kits <= 10 },
  { id: 'grade', text: 'Connector grade within the scenario’s 8% limit', ineq: '100R / 300 ≤ 8', test: p => 100 * p.rise / 300 <= 8 }
];
export const passes = p => CONSTRAINTS.every(c => c.test(p));
