// Carve Lab: the Challenge Arena, as data (PRD 8 and 12).
// Adding a challenge = adding an object here; the arena reads these and never
// needs to change. Every answer is computed from the physics engine, never
// typed in, so a challenge can't disagree with the simulator.
//
// A challenge is a list of steps, done in order:
//   predict  a choice question, answered once BEFORE the simulator unlocks
//   run      the simulator, in one of three forms:
//              compare  run each listed setup (e.g. Ski A, then Ski B)
//              target   change the unlocked controls until a result hits a target
//              design   meet every constraint, any way you like
//   ask      a maths question (choice or number), with hints and a solution
//   explain  a written explanation, saved (not graded), with a model answer
// Each graded step has a `kind`: the question id saved to a student's
// account as "carve-lab:<kind>" (the site's database lists them in progress.sql).

import { carve, calculateTurnRadius, edgeAngleForRadius, toDegrees, fmt } from './physics.js';

const r1 = x => Math.round(x * 10) / 10;

// The skills each question practices (ids from the site's shared skill list).
export const CONCEPTS = {
  geometry: 'Geometry: circles and radius',
  trigonometry: 'Trigonometry: cosine and inverse cosine',
  quadratics: 'Squared (quadratic) relationships',
  newton: 'Newton’s second law (F = ma)',
  modeling: 'Using a model to design and predict'
};

const C1A = { sidecutRadius: 12, edgeAngle: 40, speed: 10, skierMass: 65 };
const C1B = { sidecutRadius: 24, edgeAngle: 40, speed: 10, skierMass: 65 };
const C2 = { sidecutRadius: 16, edgeAngle: 20, speed: 10, skierMass: 65 };
const C3 = { sidecutRadius: 25, edgeAngle: 60, speed: 10, skierMass: 65 };     // R = 12.5 m
const C4 = { sidecutRadius: 20, edgeAngle: 60, speed: 10, skierMass: 50 };     // R = 10 m, a = 10 m/s²
const C5_LIMITS = { radius: 10, radiusTol: 0.25, speedMin: 8, speedMax: 12, maxForce: 800 };

export const CHALLENGES = [
  {
    id: 'c1', number: 1, title: 'Sidecut Detective', difficulty: 'beginner', concepts: ['geometry'],
    description: 'Two pairs of skis, one edge angle. Which carves tighter?',
    scenario: 'You have two pairs of skis. Ski A has a sidecut radius of 12 m. Ski B has a sidecut radius of 24 m. Both are tipped to the same edge angle, 40°.',
    initialConfiguration: C1A,
    objective: 'Run both skis and compare their trajectories.',
    steps: [
      { type: 'predict', kind: 'c1-predict', question: {
        prompt: 'Which ski will make the tighter (smaller-radius) idealized carved turn?',
        options: [
          { id: 'a', text: 'Ski A, the 12 m sidecut', correct: true },
          { id: 'b', text: 'Ski B, the 24 m sidecut', code: 'bigger-is-tighter' },
          { id: 'same', text: 'Neither: same edge angle, same turn', code: 'angle-only' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'A', label: 'Ski A · 12 m sidecut', config: C1A }, { id: 'B', label: 'Ski B · 24 m sidecut', config: C1B }],
        objective: 'Run Ski A and Ski B. Their lines are drawn on the same slope, to the same scale.' },
      { type: 'ask', kind: 'c1-radius', question: {
        type: 'number', prompt: 'Ski A is tipped to 40°. What is its idealized turn radius, R = Rsc × cos θ? (to 0.1 m)',
        answer: calculateTurnRadius(12, 40), tolerance: 0.06, unit: 'm',
        traps: [
          { value: 12 * Math.sin(40 * Math.PI / 180), code: 'sin-for-cos', message: 'That’s 12 × sin 40°. The model uses cosine.' },
          { value: 12, code: 'no-cos', message: 'That’s the sidecut radius itself. Tipping the ski shrinks the turn: multiply by cos 40°.' },
          { value: 12 * Math.cos(40), code: 'radians-mode', message: 'Your calculator is in radians: it took cos of 40 radians. Switch it to degrees.' }
        ],
        hints: ['Write the model with Ski A’s numbers in it: R = 12 × cos(40°).', 'Make sure your calculator is in degree mode. cos(40°) is about 0.766.', '12 × 0.766 = ?'],
        solution: `R = 12 × cos 40° = 12 × 0.766 = ${fmt(calculateTurnRadius(12, 40), 2)} m. Ski B at the same angle: 24 × 0.766 = ${fmt(calculateTurnRadius(24, 40), 2)} m.` } },
      { type: 'ask', kind: 'c1-ratio', question: {
        type: 'choice', prompt: 'Ski B’s sidecut is twice Ski A’s. At the same edge angle, how does Ski B’s turn radius compare?',
        options: [
          { id: 'half', text: 'Half as big', code: 'inverse' },
          { id: 'same', text: 'The same', code: 'angle-only' },
          { id: 'double', text: 'Twice as big', correct: true },
          { id: 'four', text: 'Four times as big', code: 'squared' }
        ],
        hints: ['Both radii are “sidecut × the same number (cos 40°)”.', 'If one sidecut is twice the other, and both are multiplied by the same number…'],
        solution: 'R = Rsc × cos θ. With θ the same, cos θ is the same number for both, so R is proportional to Rsc: double the sidecut, double the turn radius.' } },
      { type: 'explain', kind: 'c1-explain', prompt: 'In your own words: why does the ski with the smaller sidecut radius make the tighter turn?',
        model: 'A smaller sidecut radius means a deeper curve cut into the side of the ski. When the ski is tipped on edge and bent along that curve, it follows a smaller circle. In the model the turn radius is the sidecut radius times cos θ, so with the same edge angle, half the sidecut gives half the turn radius.' }
    ],
    explanation: 'At the same edge angle, R = Rsc × cos θ multiplies both sidecuts by the same number, so the turn radius is proportional to the sidecut radius. A 12 m ski carves a turn half the size of a 24 m ski. That’s why slalom skis (short sidecut) make quick, tight turns and giant-slalom skis (long sidecut) make big, sweeping ones.'
  },
  {
    id: 'c2', number: 2, title: 'Edge Angle Experiment', difficulty: 'beginner', concepts: ['trigonometry'],
    description: 'Find the edge angle that carves a 12 m turn, then prove it on the slope.',
    scenario: 'You’re on skis with a 16 m sidecut radius. Your coach wants a turn with an estimated radius of exactly 12 m.',
    initialConfiguration: C2,
    objective: 'Set the edge angle so the turn radius is 12 m (within 0.1 m).',
    steps: [
      { type: 'predict', kind: 'c2-predict', question: {
        prompt: 'Before any calculating: roughly what edge angle will you need?',
        options: [
          { id: 'lt30', text: 'Less than 30°' },
          { id: '30-45', text: 'Between 30° and 45°', correct: true },
          { id: '45-60', text: 'Between 45° and 60°' },
          { id: 'gt60', text: 'More than 60°' }
        ] } },
      { type: 'ask', kind: 'c2-angle', question: {
        type: 'number', prompt: 'Solve 12 = 16 × cos θ for the edge angle θ. (to 0.1°)',
        answer: edgeAngleForRadius(12, 16), tolerance: 0.15, unit: '°',
        traps: [
          { value: 0.75, code: 'ratio-not-angle', message: '0.75 is cos θ, not θ. Now undo the cosine: θ = cos⁻¹(0.75).' },
          { value: toDegrees(Math.asin(0.75)), code: 'sin-for-cos', message: 'That’s sin⁻¹(0.75). The model uses cosine, so use cos⁻¹.' },
          { value: Math.acos(0.75), code: 'radians-mode', message: 'That’s the angle in radians. Switch your calculator to degrees (or multiply by 180/π).' }
        ],
        hints: ['Divide both sides by 16 to get cos θ on its own.', 'cos θ = 12 / 16 = 0.75. Which angle has a cosine of 0.75?', 'Use inverse cosine: θ = cos⁻¹(0.75), in degree mode.'],
        solution: `12 = 16 cos θ → cos θ = 0.75 → θ = cos⁻¹(0.75) ≈ ${fmt(edgeAngleForRadius(12, 16), 1)}°.` } },
      { type: 'run', mode: 'target', unlocked: ['edgeAngle'], target: { key: 'turnRadius', value: 12, tol: 0.1, label: 'Turn radius 12 m' },
        objective: 'Now prove it: set the edge angle, then press Test this turn. The radius must be 12 m, give or take 0.1 m.' },
      { type: 'explain', kind: 'c2-explain', prompt: 'Why does tipping the ski further onto its edge make the turn tighter?',
        model: 'The turn radius is Rsc × cos θ. As θ gets bigger, cos θ gets smaller (cos 0° = 1, cos 60° = 0.5), so the turn radius shrinks. Physically, tipping the ski further bends it into a deeper arc in the snow, so it follows a smaller circle.' }
    ],
    explanation: 'cos θ falls as θ grows, so more edge angle means a smaller turn. The relationship isn’t a straight line: going from 0° to 20° barely changes the radius (cos 20° ≈ 0.94), but going from 40° to 60° shrinks it a lot (0.77 → 0.5). Inverse cosine runs the model backwards: from the radius you want to the angle you need.'
  },
  {
    id: 'c3', number: 3, title: 'Speed Is Everything', difficulty: 'intermediate', concepts: ['quadratics'],
    description: 'Double the speed on the same turn. What happens to the acceleration?',
    scenario: 'You’re carving a turn with a 12.5 m radius at 10 m/s. On the next run your speed doubles to 20 m/s, on exactly the same turn.',
    initialConfiguration: C3,
    objective: 'Run the turn at 10 m/s and at 20 m/s and compare the accelerations.',
    steps: [
      { type: 'predict', kind: 'c3-predict', question: {
        prompt: 'When your speed doubles on the same turn, what happens to the centripetal acceleration?',
        options: [
          { id: 'double', text: 'It doubles', code: 'linear-speed' },
          { id: 'triple', text: 'It triples' },
          { id: 'quad', text: 'It quadruples', correct: true },
          { id: 'same', text: 'It stays the same', code: 'radius-only' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'slow', label: '10 m/s', config: C3 }, { id: 'fast', label: '20 m/s', config: { ...C3, speed: 20 } }],
        objective: 'Run the turn at 10 m/s, then at 20 m/s. Watch the acceleration arrow and the numbers.' },
      { type: 'ask', kind: 'c3-accel', question: {
        type: 'number', prompt: `The radius is 12.5 m. At 10 m/s, a = 10² ÷ 12.5 = ${fmt(carve(C3).centripetalAcceleration, 0)} m/s². What is a at 20 m/s?`,
        answer: carve({ ...C3, speed: 20 }).centripetalAcceleration, tolerance: 0.05, unit: 'm/s²',
        traps: [
          { value: 16, code: 'linear-speed', message: 'That’s double. Speed is squared in a = v²/R: try 20² ÷ 12.5.' },
          { value: 24, code: 'triples', message: 'That’s three times as much. Work out 20² ÷ 12.5.' },
          { value: 1.6, code: 'unsquared', message: 'That’s 20 ÷ 12.5. Square the speed first: 20² = 400.' }
        ],
        hints: ['Use a = v² ÷ R with v = 20 and R = 12.5.', '20² = 400.', '400 ÷ 12.5 = ?'],
        solution: 'a = 20² ÷ 12.5 = 400 ÷ 12.5 = 32 m/s². That’s 4 × 8: twice the speed, four times the acceleration.' } },
      { type: 'ask', kind: 'c3-factor', question: {
        type: 'number', prompt: 'Same turn again. If your speed TRIPLED, by what factor would the centripetal acceleration change?',
        answer: 9, tolerance: 0.001, unit: '×',
        traps: [
          { value: 3, code: 'linear-speed', message: 'Acceleration isn’t proportional to speed; it’s proportional to speed squared.' },
          { value: 6, code: 'doubled-factor', message: 'Squaring 3 isn’t 3 × 2. What is 3 × 3?' }
        ],
        hints: ['Doubling the speed multiplied a by 2² = 4.', 'Tripling the speed multiplies a by 3² = ?'],
        solution: 'a = v²/R, so a scales with the square of the speed. Triple the speed → 3² = 9 times the acceleration.' } },
      { type: 'explain', kind: 'c3-explain', prompt: 'Explain why doubling your speed doesn’t just double the acceleration.',
        model: 'In a = v²/R the speed is squared. Doubling v makes v² four times bigger (2² = 4), and with the same radius the acceleration is four times as big. Going faster, you also have to change direction faster, which is why the effect compounds.' }
    ],
    explanation: 'a = v²/R is a quadratic relationship in v: doubling speed quadruples the centripetal acceleration, tripling it multiplies by nine. On the Graph Lab’s speed graph that’s the curve getting steeper and steeper. It’s why a turn that feels easy at moderate speed can need far more grip at high speed.'
  },
  {
    id: 'c4', number: 4, title: 'The Heavy Skier Experiment', difficulty: 'intermediate', concepts: ['newton'],
    description: 'Same speed, same turn, twice the mass. Who needs more force?',
    scenario: 'Two skiers carve the same 10 m radius turn at the same speed, 10 m/s. Skier A has a mass of 50 kg. Skier B has a mass of 100 kg.',
    initialConfiguration: C4,
    objective: 'Run both skiers and compare their accelerations and forces.',
    steps: [
      { type: 'predict', kind: 'c4-predict', question: {
        prompt: 'Which skier requires more inward force to follow the turn?',
        options: [
          { id: 'a', text: 'Skier A (50 kg)', code: 'lighter-more' },
          { id: 'b', text: 'Skier B (100 kg)', correct: true },
          { id: 'same', text: 'Both need the same force', code: 'mass-irrelevant' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'A', label: 'Skier A · 50 kg', config: C4 }, { id: 'B', label: 'Skier B · 100 kg', config: { ...C4, skierMass: 100 } }],
        objective: 'Run Skier A, then Skier B. Compare the acceleration arrows and the force arrows.' },
      { type: 'ask', kind: 'c4-accel', question: {
        type: 'choice', prompt: 'How do their centripetal accelerations compare?',
        options: [
          { id: 'same', text: 'They’re the same', correct: true },
          { id: 'b2', text: 'Skier B’s is twice as big', code: 'mass-in-accel' },
          { id: 'a2', text: 'Skier A’s is twice as big', code: 'lighter-more' }
        ],
        hints: ['Look at a = v²/R. Which letters are in it?', 'Mass isn’t in a = v²/R. Same speed and same radius means…'],
        solution: 'a = v²/R = 10² ÷ 10 = 10 m/s² for both. Acceleration depends only on speed and radius, not mass.' } },
      { type: 'ask', kind: 'c4-force', question: {
        type: 'number', prompt: 'Both accelerate at 10 m/s² toward the centre. What inward force does Skier B (100 kg) need?',
        answer: carve({ ...C4, skierMass: 100 }).inwardForce, tolerance: 0.5, unit: 'N',
        traps: [
          { value: 500, code: 'wrong-mass', message: 'That’s Skier A’s force (50 kg × 10 m/s²). Use Skier B’s mass.' },
          { value: 10, code: 'force-is-accel', message: 'That’s the acceleration. Force = mass × acceleration.' },
          { value: 2000, code: 'mass-in-accel', message: 'That doubles the acceleration as well as the mass. Both skiers accelerate at 10 m/s²: F = 100 × 10.' }
        ],
        hints: ['Newton’s second law: F = m × a.', 'm = 100 kg and a = 10 m/s².'],
        solution: 'F = m × a = 100 × 10 = 1000 N. Skier A needs 50 × 10 = 500 N: twice the mass, twice the force, same acceleration.' } },
      { type: 'explain', kind: 'c4-explain', prompt: 'Explain how both skiers can have the same acceleration but need different forces.',
        model: 'Acceleration only depends on how fast you go and how tight the turn is (a = v²/R), so both skiers accelerate at 10 m/s². But it takes more force to give a bigger mass that same acceleration (F = ma), so the 100 kg skier needs twice the inward force of the 50 kg skier.' }
    ],
    explanation: 'Mass doesn’t appear in a = v²/R, so two skiers on the same line at the same speed have exactly the same centripetal acceleration. Mass does appear in F = ma: twice the mass needs twice the net inward force. The heavier skier isn’t turning “harder”; there’s just more of them to turn.'
  },
  {
    id: 'c5', number: 5, title: 'Design Your Turn', difficulty: 'advanced', concepts: ['trigonometry', 'quadratics', 'newton', 'modeling'],
    description: 'Hit a target radius inside speed and force limits. Many right answers.',
    scenario: `Design a turn with an idealized radius of ${C5_LIMITS.radius} m (±${C5_LIMITS.radiusTol} m), at a speed between ${C5_LIMITS.speedMin} and ${C5_LIMITS.speedMax} m/s, needing no more than ${C5_LIMITS.maxForce} N of inward force. Use any sidecut, edge angle, speed and mass.`,
    initialConfiguration: { sidecutRadius: 15, edgeAngle: 35, speed: 10, skierMass: 65 },
    limits: C5_LIMITS,
    objective: 'Meet all three constraints at once.',
    steps: [
      { type: 'predict', kind: 'c5-predict', question: {
        prompt: 'Which controls decide the turn radius in this model?',
        options: [
          { id: 'geo', text: 'Sidecut radius and edge angle', correct: true },
          { id: 'speedmass', text: 'Speed and mass', code: 'speed-sets-radius' },
          { id: 'anglespeed', text: 'Edge angle and speed', code: 'speed-sets-radius' },
          { id: 'all', text: 'All four', code: 'speed-sets-radius' }
        ] } },
      { type: 'run', mode: 'design', unlocked: ['sidecutRadius', 'edgeAngle', 'speed', 'skierMass'],
        constraints: [
          { key: 'turnRadius', min: C5_LIMITS.radius - C5_LIMITS.radiusTol, max: C5_LIMITS.radius + C5_LIMITS.radiusTol, label: `Radius ${C5_LIMITS.radius} m ± ${C5_LIMITS.radiusTol}`, unit: 'm' },
          { key: 'speed', min: C5_LIMITS.speedMin, max: C5_LIMITS.speedMax, label: `Speed ${C5_LIMITS.speedMin}–${C5_LIMITS.speedMax} m/s`, unit: 'm/s' },
          { key: 'inwardForce', max: C5_LIMITS.maxForce, label: `Force ≤ ${C5_LIMITS.maxForce} N`, unit: 'N' }
        ],
        objective: 'Set all four controls, then press Submit design. Hint: get the radius right first, then fit speed and mass to the force limit.' },
      { type: 'ask', kind: 'c5-math', dynamic: 'design', question: {
        type: 'fields', prompt: 'Show the maths for YOUR design: work out its turn radius and its required inward force from your own numbers.',
        // The answers are filled in from the student's submitted design (designQuestion below).
        hints: ['Radius: R = Rsc × cos θ, with your sidecut and edge angle.', 'Then a = v² ÷ R with your speed, and F = m × a with your mass.', 'Round R to 0.1 m and F to the nearest newton; small rounding differences are fine.'] } },
      { type: 'explain', kind: 'c5-explain', prompt: 'Explain how you chose your numbers. Which constraint did you solve first, and why?',
        model: 'Only sidecut and edge angle set the radius, so I picked a sidecut (say 20 m) and solved 10 = 20 cos θ: cos θ = 0.5, θ = 60°. Then the force limit: F = m v²/R ≤ 800 N with R = 10 means m v² ≤ 8000. At 10 m/s that’s m ≤ 80 kg, so 65 kg at 10 m/s works: a = 10 m/s², F = 650 N.' }
    ],
    explanation: 'There are many good designs because radius depends only on geometry (Rsc, θ) while force depends on mass, speed and radius together. Solving in that order turns a four-variable puzzle into two small ones: first R = Rsc cos θ, then m v²/R ≤ the force limit.'
  }
];

export const challengeById = id => CHALLENGES.find(c => c.id === id) || null;

// The question for Challenge 5's "show your maths" step, built from the
// student's own submitted design. Tolerances allow ordinary rounding.
export function designQuestion(step, design) {
  const r = carve(design);
  return { ...step.question, id: step.kind,
    fields: [
      { id: 'R', label: 'Turn radius R', unit: 'm', answer: r.turnRadius, tolerance: Math.max(0.06, r.turnRadius * 0.01) },
      { id: 'F', label: 'Inward force F', unit: 'N', answer: r.inwardForce, tolerance: Math.max(2, r.inwardForce * 0.015) }
    ],
    solution: `Your design: R = ${fmt(r.config.sidecutRadius, 1)} × cos ${fmt(r.config.edgeAngle, 1)}° = ${fmt(r.turnRadius, 2)} m. a = ${fmt(r.config.speed, 1)}² ÷ ${fmt(r.turnRadius, 2)} = ${fmt(r.centripetalAcceleration, 2)} m/s². F = ${fmt(r.config.skierMass, 0)} × ${fmt(r.centripetalAcceleration, 2)} = ${fmt(r.inwardForce, 0)} N.` };
}

// Check a run step. Returns { met, checks: [{ label, ok, value }] }.
export function evaluateRun(step, config, ran) {
  const r = carve(config);
  const val = k => (k === 'speed' ? r.config.speed : r[k]);
  if (step.mode === 'compare') {
    const checks = step.setups.map(s => ({ label: s.label, ok: !!(ran && ran[s.id]) }));
    return { met: checks.every(c => c.ok), checks };
  }
  if (step.mode === 'target') {
    const v = val(step.target.key);
    const ok = Math.abs(v - step.target.value) <= step.target.tol + 1e-9;
    return { met: ok, checks: [{ label: step.target.label, ok, value: v }] };
  }
  if (step.mode === 'design') {
    const checks = step.constraints.map(c => {
      const v = val(c.key);
      const ok = (c.min === undefined || v >= c.min - 1e-9) && (c.max === undefined || v <= c.max + 1e-9);
      return { label: c.label, ok, value: v, unit: c.unit, key: c.key };
    });
    return { met: checks.every(c => c.ok), checks };
  }
  return { met: false, checks: [] };
}

// Every graded question kind, for progress tracking (registered in the site's progress.sql).
export function questionKinds() {
  const out = [];
  for (const c of CHALLENGES) for (const s of c.steps) {
    if (s.type === 'predict' || s.type === 'ask' || (s.type === 'run' && s.mode !== 'compare')) {
      const kind = s.kind || (c.id + '-sim');
      out.push({ kind, challenge: c.id, type: s.type, concepts: c.concepts, difficulty: c.difficulty,
        title: `${c.title}: ${s.type === 'predict' ? 'prediction' : s.type === 'run' ? (s.mode === 'design' ? 'design' : 'simulator target') : 'question ' + kind.split('-').slice(1).join(' ')}` });
    }
  }
  return out;
}

// The run steps that are graded need a kind too: c2-sim, c5-design.
for (const c of CHALLENGES) for (const s of c.steps) if (s.type === 'run' && s.mode !== 'compare' && !s.kind) s.kind = c.id + (s.mode === 'design' ? '-design' : '-sim');

export { r1 };

// The misconceptions the challenges watch for, in plain words (for tutors).
export const MISCONCEPTIONS = {
  'bigger-is-tighter': 'Thought a bigger sidecut radius makes a tighter turn',
  'angle-only': 'Thought only the edge angle sets the turn radius',
  'sin-for-cos': 'Used sine where the model uses cosine',
  'no-cos': 'Left out the cos θ factor',
  'radians-mode': 'Calculator in radians instead of degrees',
  'ratio-not-angle': 'Stopped at cos θ instead of finding θ',
  'inverse': 'Treated a proportional relationship as inverse',
  'squared': 'Squared a relationship that is linear',
  'linear-speed': 'Treated acceleration as proportional to speed (not speed squared)',
  'unsquared': 'Forgot to square the speed',
  'doubled-factor': 'Doubled instead of squaring',
  'triples': 'Multiplied by three instead of squaring the factor of two',
  'radius-only': 'Thought speed doesn’t affect acceleration',
  'mass-irrelevant': 'Thought mass doesn’t affect the required force',
  'lighter-more': 'Thought a lighter skier needs more force',
  'mass-in-accel': 'Thought mass changes centripetal acceleration',
  'wrong-mass': 'Used the wrong skier’s mass',
  'force-is-accel': 'Confused force with acceleration',
  'speed-sets-radius': 'Thought speed or mass sets the turn radius in this model',
  'sign': 'Right size, wrong sign'
};
