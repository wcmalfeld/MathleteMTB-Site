// Berm Lab: the Challenge Arena, as data (PRD 9 and 13).
// Adding a challenge = adding an object here; the arena reads these and never
// needs to change. Every answer is computed from the physics engine, never
// typed in, so a challenge can't disagree with the simulator.
//
// Steps, in order:
//   predict  a choice, answered once BEFORE the simulator unlocks
//   run      compare (run each listed setup) | target (hit a result) | design (meet every constraint)
//   ask      a maths question (choice, number or several numbers)
//   explain  a written explanation, saved (not graded), with a model answer
// Each graded step has a `kind`, saved to a student's account as
// "berm-lab:<kind>" (the site's database lists them in progress.sql).

import { berm, convertUnits, calculateMatchedBermAngle, bermAngleWindow, toDegrees, fmt } from './physics.js';

export const CONCEPTS = {
  geometry: 'Geometry: radius and riding lines',
  quadratics: 'Squared (quadratic) relationships',
  trigonometry: 'Trigonometry: tangent and inverse tangent',
  components: 'Force components and friction',
  newton: 'Newton’s second law (F = ma)',
  inequalities: 'Inequalities and design constraints'
};

const BASE = { cornerRadius: 6, speedKmh: 22, bermAngle: 25, totalMass: 80, availableGrip: 0.45 };
const at = o => ({ ...BASE, ...o });
const ms = kmh => convertUnits(kmh, 'km/h', 'm/s');

const C1 = [at({ cornerRadius: 4 }), at({ cornerRadius: 6 }), at({ cornerRadius: 8 })];
const C2 = [at({ speedKmh: 10 }), at({ speedKmh: 20 })];
const C3 = at({ speedKmh: 20, bermAngle: 10 });
const C4 = [at({ bermAngle: 0 }), at({ bermAngle: 30 })];
const C5 = [at({ totalMass: 70 }), at({ totalMass: 100 })];
const C6 = { cornerRadius: 7, speedKmh: 25, bermAngle: 0, totalMass: 80, availableGrip: 0.4 };
const C6_WINDOW = bermAngleWindow(ms(25), 7, 0.4, 45);

export const CHALLENGES = [
  {
    id: 'c1', number: 1, title: 'Pick Your Line', difficulty: 'beginner', concepts: ['geometry'],
    description: 'Three lines through one berm at the same speed. Which asks for the least?',
    scenario: 'You’re approaching a big berm with three possible lines: tight (4 m radius), middle (6 m) and wide (8 m). You ride all three at 22 km/h on the same 25° berm.',
    initialConfiguration: C1[1],
    objective: 'Ride all three lines and compare their centripetal accelerations.',
    steps: [
      { type: 'predict', kind: 'c1-predict', question: {
        prompt: 'Which line produces the lowest centripetal acceleration?',
        options: [
          { id: 'tight', text: 'The tight line (4 m)', code: 'tight-is-easier' },
          { id: 'middle', text: 'The middle line (6 m)' },
          { id: 'wide', text: 'The wide line (8 m)', correct: true },
          { id: 'same', text: 'All the same: same speed, same berm', code: 'radius-irrelevant' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'tight', label: 'Tight line · 4 m', config: C1[0] }, { id: 'middle', label: 'Middle line · 6 m', config: C1[1] }, { id: 'wide', label: 'Wide line · 8 m', config: C1[2] }],
        objective: 'Ride each line. All three are drawn on the same corner, to scale.' },
      { type: 'ask', kind: 'c1-accel', question: {
        type: 'number', prompt: `22 km/h is ${fmt(ms(22), 2)} m/s. What is the centripetal acceleration on the middle line (r = 6 m)? (to 0.01 m/s²)`,
        answer: berm(C1[1]).centripetalAcceleration, tolerance: 0.03, unit: 'm/s²',
        traps: [
          { value: 22 * 22 / 6, code: 'kmh-not-ms', message: 'That used 22 km/h directly. Convert to m/s first (÷ 3.6).' },
          { value: ms(22) / 6, code: 'unsquared', message: 'Square the speed first: a = v² ÷ r.' },
          { value: ms(22) * ms(22) * 6, code: 'times-r', message: 'Divide by the radius, don’t multiply: a = v² ÷ r.' }
        ],
        hints: ['Use a = v² ÷ r with v in m/s.', `v² = ${fmt(ms(22), 2)}² ≈ ${fmt(ms(22) ** 2, 2)}.`, `${fmt(ms(22) ** 2, 2)} ÷ 6 = ?`],
        solution: `a = v² ÷ r = ${fmt(ms(22), 3)}² ÷ 6 = ${fmt(berm(C1[1]).centripetalAcceleration, 2)} m/s². Tight: ${fmt(berm(C1[0]).centripetalAcceleration, 2)}. Wide: ${fmt(berm(C1[2]).centripetalAcceleration, 2)}.` } },
      { type: 'ask', kind: 'c1-ratio', question: {
        type: 'choice', prompt: 'The wide line’s radius is twice the tight line’s. At the same speed, how does the tight line’s acceleration compare with the wide line’s?',
        options: [
          { id: 'half', text: 'Half as big', code: 'inverse-flip' },
          { id: 'same', text: 'The same', code: 'radius-irrelevant' },
          { id: 'double', text: 'Twice as big', correct: true },
          { id: 'four', text: 'Four times as big', code: 'squared-radius' }
        ],
        hints: ['In a = v² ÷ r, the radius is on the bottom.', 'Halving what you divide by doubles the answer.'],
        solution: 'a = v²/r: with v the same, a is inversely proportional to r. The tight line has half the radius, so twice the acceleration (9.34 vs 4.67 m/s²).' } },
      { type: 'explain', kind: 'c1-explain', prompt: 'Explain why the wide line asks for less acceleration than the tight line.',
        model: 'Centripetal acceleration is a = v²/r. All three lines are ridden at the same speed, so only r changes. A bigger radius means dividing v² by a bigger number, so the acceleration is smaller: the wide line changes direction more gently. The trade-off is distance: the wide line is longer (πr), so it takes more time.' }
    ],
    explanation: 'At a fixed speed, a = v²/r is inversely proportional to the radius: double the radius, half the acceleration. Wider lines turn you more gently but cover more ground (πr), so they take longer. Riders trade off grip demand against distance every time they pick a line.'
  },
  {
    id: 'c2', number: 2, title: 'Speed Is Squared', difficulty: 'beginner', concepts: ['quadratics'],
    description: 'Ride the same corner at 10 km/h, then 20 km/h.',
    scenario: 'You ride a 6 m corner at 10 km/h. On the next lap you hit it at 20 km/h, on exactly the same line.',
    initialConfiguration: C2[0],
    objective: 'Ride the corner at both speeds and compare the accelerations.',
    steps: [
      { type: 'predict', kind: 'c2-predict', question: {
        prompt: 'When your speed doubles on the same corner, what happens to the centripetal acceleration?',
        options: [
          { id: 'double', text: 'It doubles', code: 'linear-speed' },
          { id: 'triple', text: 'It triples', code: 'triples' },
          { id: 'quad', text: 'It quadruples', correct: true },
          { id: 'same', text: 'It stays the same', code: 'radius-only' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'slow', label: '10 km/h', config: C2[0] }, { id: 'fast', label: '20 km/h', config: C2[1] }],
        objective: 'Ride the corner at 10 km/h, then at 20 km/h. Watch the acceleration arrow and the numbers.' },
      { type: 'ask', kind: 'c2-convert', question: {
        type: 'number', prompt: 'First, units: what is 20 km/h in metres per second? (to 0.01 m/s)',
        answer: ms(20), tolerance: 0.02, unit: 'm/s',
        traps: [{ value: 20 * 3.6, code: 'convert-wrong-way', message: 'That multiplied by 3.6. Going from km/h to m/s, divide by 3.6.' }],
        hints: ['1 km = 1000 m and 1 hour = 3600 s.', '20 km/h = 20 × 1000 ÷ 3600 m/s, which is the same as 20 ÷ 3.6.'],
        solution: `20 km/h = 20 × 1000 m ÷ 3600 s = 20 ÷ 3.6 = ${fmt(ms(20), 2)} m/s.` } },
      { type: 'ask', kind: 'c2-accel', question: {
        type: 'number', prompt: `At 10 km/h on the 6 m line, a = ${fmt(berm(C2[0]).centripetalAcceleration, 2)} m/s². What is a at 20 km/h? (to 0.01 m/s²)`,
        answer: berm(C2[1]).centripetalAcceleration, tolerance: 0.03, unit: 'm/s²',
        traps: [
          { value: 2 * berm(C2[0]).centripetalAcceleration, code: 'linear-speed', message: 'That’s double. Speed is squared in a = v²/r.' },
          { value: 400 / 6, code: 'kmh-not-ms', message: 'That used 20 km/h directly. Use 5.56 m/s.' }
        ],
        hints: ['Use your answer from the last question: v = 5.56 m/s.', 'a = 5.56² ÷ 6.', 'Or: twice the speed, so 2² = 4 times the acceleration.'],
        solution: `a = ${fmt(ms(20), 3)}² ÷ 6 = ${fmt(berm(C2[1]).centripetalAcceleration, 2)} m/s², which is 4 × ${fmt(berm(C2[0]).centripetalAcceleration, 2)}. Twice the speed, four times the acceleration.` } },
      { type: 'explain', kind: 'c2-explain', prompt: 'Why does doubling your speed more than double the acceleration?',
        model: 'In a = v²/r the speed is squared. Doubling v multiplies v² by 2² = 4, and the radius hasn’t changed, so the acceleration is four times as big. On the Graph Lab’s speed graph, the curve gets steeper and steeper.' }
    ],
    explanation: 'a = v²/r is quadratic in speed. Twice the speed means four times the acceleration; three times the speed, nine times. That’s why a corner that feels easy at trail pace can need far more grip when you come in hot.'
  },
  {
    id: 'c3', number: 3, title: 'Find the Berm Sweet Spot', difficulty: 'intermediate', concepts: ['trigonometry'],
    description: 'Bank a 6 m berm so that 20 km/h needs no sideways grip at all.',
    scenario: 'You’re designing a berm with a 6 m corner radius. You want its banking angle to match a riding speed of 20 km/h, so the model needs no lateral friction at that speed.',
    initialConfiguration: C3,
    objective: 'Find the berm angle where the modeled grip demand drops to zero.',
    steps: [
      { type: 'predict', kind: 'c3-predict', question: {
        prompt: 'Roughly what banking angle will match 20 km/h on a 6 m corner?',
        options: [
          { id: 'lt15', text: 'Less than 15°' },
          { id: '15-25', text: 'Between 15° and 25°' },
          { id: '25-35', text: 'Between 25° and 35°', correct: true },
          { id: 'gt35', text: 'More than 35°' }
        ] } },
      { type: 'ask', kind: 'c3-angle', question: {
        type: 'number', prompt: 'Calculate it: β = arctan(v² ÷ (r g)), with v = 5.56 m/s, r = 6 m and g = 9.81 m/s². (to 0.1°)',
        answer: calculateMatchedBermAngle(ms(20), 6), tolerance: 0.2, unit: '°',
        traps: [
          { value: (ms(20) ** 2) / (6 * 9.81), code: 'ratio-not-angle', message: 'That’s v²/(rg), the tangent of the angle. Now take the inverse tangent.' },
          { value: Math.atan((ms(20) ** 2) / (6 * 9.81)), code: 'radians-mode', message: 'That’s the angle in radians. Switch your calculator to degrees.' },
          { value: toDegrees(Math.atan(400 / (6 * 9.81))), code: 'kmh-not-ms', message: 'That used 20 km/h directly. Convert to m/s first.' }
        ],
        hints: ['First work out v² ÷ (r × g).', `v² = ${fmt(ms(20) ** 2, 2)}; r × g = 58.86; so tan β = ${fmt((ms(20) ** 2) / 58.86, 3)}.`, 'β = tan⁻¹ of that, with the calculator in degrees.'],
        solution: `tan β = v²/(rg) = ${fmt(ms(20) ** 2, 2)} ÷ 58.86 = ${fmt((ms(20) ** 2) / 58.86, 3)}, so β = tan⁻¹(${fmt((ms(20) ** 2) / 58.86, 3)}) ≈ ${fmt(calculateMatchedBermAngle(ms(20), 6), 1)}°.` } },
      { type: 'run', mode: 'target', unlocked: ['bermAngle'], target: { key: 'requiredGrip', value: 0, tol: 0.01, label: 'Grip demand ≈ 0 (≤ 0.01)' },
        objective: 'Now set the berm angle so the modeled grip demand is (almost) zero, and press Test this berm. Watch the friction arrow in the cross-section shrink.' },
      { type: 'explain', kind: 'c3-explain', prompt: 'Why does that particular angle need no sideways grip?',
        model: 'The berm pushes perpendicular to its surface. When it’s banked at the matched angle, that normal force, tipped toward the centre, provides exactly the inward force the turn needs (tan β = v²/rg) while its vertical part holds up the rider’s weight. Nothing is left for friction to do, so the grip demand is zero.' }
    ],
    explanation: 'A berm tilts the normal force toward the centre of the turn. At the matched angle, tan β = v²/(rg), the tilted normal force alone supplies the whole inward force and balances gravity, so the modeled friction is zero. It’s the same angle as the ideal lean: a matched berm meets the rider square-on.'
  },
  {
    id: 'c4', number: 4, title: 'Flat Corner vs. Berm', difficulty: 'intermediate', concepts: ['components'],
    description: 'Same speed, same radius. One flat, one banked 30°.',
    scenario: 'Two riders take corners with the same 6 m radius at the same 22 km/h. One corner is flat. The other is a berm banked at 30°.',
    initialConfiguration: C4[0],
    objective: 'Ride both corners and compare the normal force and friction force.',
    steps: [
      { type: 'predict', kind: 'c4-predict', question: {
        prompt: 'Which corner needs more lateral tire-ground friction, in the model?',
        options: [
          { id: 'flat', text: 'The flat corner', correct: true },
          { id: 'berm', text: 'The 30° berm', code: 'berm-more-friction' },
          { id: 'same', text: 'The same: same speed and radius', code: 'bank-irrelevant' }
        ] } },
      { type: 'run', mode: 'compare', view: 'section', setups: [{ id: 'flat', label: 'Flat corner · 0°', config: C4[0] }, { id: 'berm', label: 'Berm · 30°', config: C4[1] }],
        objective: 'Ride the flat corner, then the berm. The cross-section view shows the normal force (N), friction (f) and gravity (mg).' },
      { type: 'ask', kind: 'c4-flat', question: {
        type: 'number', prompt: 'On the flat corner, all the inward force must come from friction, so μ_required = v² ÷ (r g). What is it? (to 0.01)',
        answer: berm(C4[0]).requiredGrip, tolerance: 0.01, unit: '',
        traps: [{ value: berm(C4[0]).centripetalAcceleration, code: 'accel-not-ratio', message: 'That’s a = v²/r. Divide by g (9.81) as well to get the grip ratio.' }],
        hints: ['v = 22 km/h = 6.11 m/s.', 'v² ÷ (r × g) = 6.11² ÷ (6 × 9.81).'],
        solution: `μ = v²/(rg) = ${fmt(ms(22) ** 2, 2)} ÷ 58.86 = ${fmt(berm(C4[0]).requiredGrip, 3)}. On the 30° berm the model needs only ${fmt(berm(C4[1]).requiredGrip, 3)}.` } },
      { type: 'ask', kind: 'c4-source', question: {
        type: 'choice', prompt: 'On the 30° berm, where does most of the inward force come from?',
        options: [
          { id: 'normal', text: 'The normal force, tipped toward the centre by the bank', correct: true },
          { id: 'friction', text: 'Friction between the tires and the dirt', code: 'friction-only' },
          { id: 'gravity', text: 'Gravity pulling the rider down the berm', code: 'gravity-inward' },
          { id: 'centrifugal', text: 'Centrifugal force pushing the rider out', code: 'centrifugal' }
        ],
        hints: ['Look at the N arrow in the cross-section: which way does it lean?', 'Gravity points straight down; it has no sideways part.'],
        solution: `The berm pushes perpendicular to its surface. Tilted 30°, the normal force has an inward part, N sin β = ${fmt(berm(C4[1]).normalForce * Math.sin(Math.PI / 6), 0)} N, nearly all of the ${fmt(berm(C4[1]).netInwardForce, 0)} N needed. Friction does the little that’s left. (“Centrifugal force” is the feeling of your inertia, not a real outward force.)` } },
      { type: 'explain', kind: 'c4-explain', prompt: 'Explain how banking changes the job friction has to do.',
        model: `On a flat corner the ground pushes straight up, so all of the inward force has to come from sideways friction at the tires. On a berm the ground pushes perpendicular to the tilted surface, so part of that normal force points toward the centre. That leaves friction with much less to do: ${fmt(berm(C4[1]).requiredGrip, 2)} instead of ${fmt(berm(C4[0]).requiredGrip, 2)} in this model.` }
    ],
    explanation: 'Banking redistributes the forces. On the flat, the normal force is vertical and friction supplies the whole inward force (μ = v²/rg). On the berm, the normal force tilts inward and carries most of the turn. That’s why a good berm lets you hold speed through a corner that would need far more grip if it were flat.'
  },
  {
    id: 'c5', number: 5, title: 'Does Weight Matter?', difficulty: 'intermediate', concepts: ['newton'],
    description: 'Same berm, same speed, 70 kg vs. 100 kg.',
    scenario: 'Two riders hit the same 6 m, 25° berm at 22 km/h. Rider A and bike: 70 kg. Rider B and bike: 100 kg.',
    initialConfiguration: C5[0],
    objective: 'Ride both and compare acceleration, force and grip demand.',
    steps: [
      { type: 'predict', kind: 'c5-predict', question: {
        prompt: 'Compared with Rider A, what does the heavier Rider B need?',
        options: [
          { id: 'same-more', text: 'The same acceleration, but more inward force', correct: true },
          { id: 'more-more', text: 'More acceleration and more force', code: 'mass-in-accel' },
          { id: 'same-same', text: 'The same acceleration and the same force', code: 'mass-irrelevant' },
          { id: 'more-same', text: 'More acceleration, the same force', code: 'mass-in-accel' }
        ] } },
      { type: 'run', mode: 'compare', setups: [{ id: 'a', label: 'Rider A · 70 kg', config: C5[0] }, { id: 'b', label: 'Rider B · 100 kg', config: C5[1] }],
        objective: 'Ride Rider A, then Rider B. Compare the numbers in the table.' },
      { type: 'ask', kind: 'c5-force', question: {
        type: 'number', prompt: `Both accelerate at ${fmt(berm(C5[0]).centripetalAcceleration, 2)} m/s² toward the centre. What net inward force does Rider B (100 kg) need? (to the nearest newton)`,
        answer: berm(C5[1]).netInwardForce, tolerance: 1.5, unit: 'N',
        traps: [
          { value: berm(C5[0]).netInwardForce, code: 'wrong-mass', message: 'That’s Rider A’s force. Use 100 kg.' },
          { value: 100 * 9.81, code: 'weight-not-inward', message: 'That’s Rider B’s weight (mg). The inward force is m × a.' }
        ],
        hints: ['F = m × a.', `m = 100 kg, a = ${fmt(berm(C5[0]).centripetalAcceleration, 2)} m/s².`],
        solution: `F = 100 × ${fmt(berm(C5[1]).centripetalAcceleration, 3)} = ${fmt(berm(C5[1]).netInwardForce, 0)} N. Rider A: 70 × ${fmt(berm(C5[0]).centripetalAcceleration, 3)} = ${fmt(berm(C5[0]).netInwardForce, 0)} N.` } },
      { type: 'ask', kind: 'c5-grip', question: {
        type: 'choice', prompt: 'In the model, how does Rider B’s required grip coefficient compare with Rider A’s?',
        options: [
          { id: 'same', text: 'The same', correct: true },
          { id: 'more', text: 'Higher: more mass needs more grip', code: 'mass-in-grip' },
          { id: 'less', text: 'Lower: more weight presses the tires down', code: 'mass-in-grip' }
        ],
        hints: ['μ is a ratio: friction needed ÷ normal force.', 'Both the friction needed and the normal force scale with mass.'],
        solution: 'μ_required = |f| / N. Both f and N are proportional to m, so mass cancels: μ = |sin β − q cos β| / (cos β + q sin β) has no m in it. Heavier riders need more force, but the same grip coefficient.' } },
      { type: 'explain', kind: 'c5-explain', prompt: 'Explain how both riders can have the same acceleration and grip demand but need different forces.',
        model: 'Acceleration depends only on speed and radius (a = v²/r), so it’s the same for both. Force is mass times acceleration, so the 100 kg system needs 100/70 ≈ 1.43 times the force. The grip coefficient is a ratio of two forces that both grow with mass, so it doesn’t change.' }
    ],
    explanation: 'Mass isn’t in a = v²/r, so it doesn’t change the acceleration. It is in F = ma: more mass needs proportionally more force. And because friction needed and normal force both scale with mass, the modeled grip coefficient is the same for a light rider and a heavy one.'
  },
  {
    id: 'c6', number: 6, title: 'The Perfect Berm', difficulty: 'advanced', concepts: ['trigonometry', 'components', 'inequalities'],
    description: 'Design a bike-park berm that keeps grip demand under 0.4.',
    scenario: 'You’re designing a hypothetical bike-park corner. Target speed: 25 km/h. Corner radius: 7 m. Maximum berm angle: 45°. Available effective grip: 0.4.',
    initialConfiguration: C6,
    limits: { maxGrip: 0.4, maxAngle: 45, window: C6_WINDOW },
    objective: 'Find a banking angle that keeps the modeled grip demand within 0.4.',
    steps: [
      { type: 'predict', kind: 'c6-predict', question: {
        prompt: 'Before you build anything: would a flat (0°) corner keep the grip demand within 0.4 at 25 km/h on a 7 m radius?',
        options: [
          { id: 'yes', text: 'Yes, flat is fine', code: 'flat-enough' },
          { id: 'no', text: 'No, it needs some banking', correct: true },
          { id: 'cant', text: 'No angle up to 45° can do it', code: 'no-solution' }
        ] } },
      { type: 'run', mode: 'design', unlocked: ['bermAngle'],
        constraints: [
          { key: 'requiredGrip', max: 0.4, label: 'Grip demand ≤ 0.40', unit: '' },
          { key: 'bermAngle', max: 45, label: 'Berm angle ≤ 45°', unit: '°' }
        ],
        objective: 'Set the berm angle, then press Submit design. Any angle that meets both constraints works.' },
      { type: 'ask', kind: 'c6-math', dynamic: 'design', question: {
        type: 'fields', prompt: 'Show the maths for YOUR berm: the turning-demand ratio q = v² ÷ (r g), and the required grip μ for your angle.',
        hints: ['v = 25 km/h = 6.94 m/s; r g = 7 × 9.81 = 68.67.', 'μ = |sin β − q cos β| ÷ (cos β + q sin β), with your β.', 'Shortcut: μ = |tan(β − θ)|, where θ = tan⁻¹(q) is the matched angle.'] } },
      { type: 'ask', kind: 'c6-min', question: {
        type: 'number', prompt: 'What is the SMALLEST berm angle that keeps the grip demand at or below 0.4? (to 0.1°)',
        answer: C6_WINDOW.min, tolerance: 0.3, unit: '°',
        traps: [
          { value: C6_WINDOW.matched, code: 'matched-not-min', message: 'That’s the matched angle, where the demand is zero. How far below it can you go before μ reaches 0.4?' },
          { value: toDegrees(Math.atan(0.4)), code: 'window-not-angle', message: 'That’s tan⁻¹(0.4), the width of the allowed window. Subtract it from the matched angle.' }
        ],
        hints: ['Using μ = |tan(β − θ)|, the demand stays ≤ 0.4 while |β − θ| ≤ tan⁻¹(0.4).', `θ = tan⁻¹(q) ≈ ${fmt(C6_WINDOW.matched, 1)}°, and tan⁻¹(0.4) ≈ ${fmt(toDegrees(Math.atan(0.4)), 1)}°.`, 'The smallest angle is θ − tan⁻¹(0.4).'],
        solution: `μ = |tan(β − θ)| ≤ 0.4 ⇔ |β − θ| ≤ tan⁻¹(0.4) = ${fmt(toDegrees(Math.atan(0.4)), 1)}°. With θ = ${fmt(C6_WINDOW.matched, 1)}°: β from ${fmt(C6_WINDOW.min, 1)}° up to the 45° limit all work.` } },
      { type: 'explain', kind: 'c6-explain', prompt: 'Explain your design: which angle did you choose, and why does it work?',
        model: 'At 25 km/h on a 7 m radius, q = v²/(rg) ≈ 0.70, so the matched angle is about 35°. Grip demand is |tan(β − 35°)|, which stays under 0.4 as long as β is within about 21.8° of 35°. I chose 35°: the demand is nearly zero and it’s under the 45° limit. Anything from about 13.3° to 45° meets the constraints.' }
    ],
    explanation: `Grip demand is lowest at the matched angle and grows as the berm moves away from it in either direction (μ = |tan(β − θ)|). Turning “μ ≤ 0.4” into “|β − θ| ≤ tan⁻¹ 0.4” gives a whole window of good designs, here about ${fmt(C6_WINDOW.min, 1)}° to 45°. Engineers work like this: turn a constraint into an inequality, then solve for the range that satisfies it.`
  }
];

export const challengeById = id => CHALLENGES.find(c => c.id === id) || null;

// Challenge 6's "show your maths", built from the student's own design.
export function designQuestion(step, design) {
  const r = berm(design);
  return { ...step.question, id: step.kind,
    fields: [
      { id: 'q', label: 'Turning demand q', unit: '', answer: r.turnDemand, tolerance: 0.01 },
      { id: 'mu', label: 'Required grip μ', unit: '', answer: r.requiredGrip, tolerance: 0.01 }
    ],
    solution: `Your berm: q = ${fmt(r.speed, 3)}² ÷ (${fmt(r.turnRadius, 0)} × 9.81) = ${fmt(r.turnDemand, 3)}. With β = ${fmt(r.config.bermAngle, 1)}°: μ = |sin β − q cos β| ÷ (cos β + q sin β) = ${fmt(r.requiredGrip, 3)} (the same as |tan(${fmt(r.config.bermAngle, 1)}° − ${fmt(r.leanAngle, 1)}°)|).` };
}

// Check a run step. Returns { met, checks: [{ label, ok, value }] }.
export function evaluateRun(step, config, ran) {
  const r = berm(config);
  const val = k => (k in r.config ? r.config[k] : r[k]);
  if (step.mode === 'compare') {
    const checks = step.setups.map(s => ({ label: s.label, ok: !!(ran && ran[s.id]) }));
    return { met: checks.every(c => c.ok), checks };
  }
  if (step.mode === 'target') {
    const v = val(step.target.key);
    const ok = Math.abs(v - step.target.value) <= step.target.tol + 1e-9;
    return { met: ok, checks: [{ label: step.target.label, ok, value: v, key: step.target.key }] };
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

for (const c of CHALLENGES) for (const s of c.steps) if (s.type === 'run' && s.mode !== 'compare' && !s.kind) s.kind = c.id + (s.mode === 'design' ? '-design' : '-sim');

// Every graded question kind, for progress tracking (registered in the site's progress.sql).
export function questionKinds() {
  const out = [];
  for (const c of CHALLENGES) for (const s of c.steps) {
    if (s.type === 'predict' || s.type === 'ask' || (s.type === 'run' && s.mode !== 'compare')) {
      out.push({ kind: s.kind, challenge: c.id, type: s.type, concepts: c.concepts, difficulty: c.difficulty });
    }
  }
  return out;
}

// The misconceptions the challenges watch for, in plain words (for tutors).
export const MISCONCEPTIONS = {
  'tight-is-easier': 'Thought the tight line asks for less acceleration',
  'radius-irrelevant': 'Thought the radius doesn’t affect acceleration',
  'kmh-not-ms': 'Used km/h where the formula needs m/s',
  'unsquared': 'Forgot to square the speed',
  'times-r': 'Multiplied by the radius instead of dividing',
  'inverse-flip': 'Flipped an inverse relationship',
  'squared-radius': 'Treated the radius as squared',
  'linear-speed': 'Treated acceleration as proportional to speed (not speed squared)',
  'triples': 'Multiplied by three instead of squaring the factor of two',
  'radius-only': 'Thought speed doesn’t affect acceleration',
  'convert-wrong-way': 'Converted km/h to m/s the wrong way',
  'ratio-not-angle': 'Stopped at tan β instead of finding β',
  'radians-mode': 'Calculator in radians instead of degrees',
  'berm-more-friction': 'Thought banking increases the friction needed',
  'bank-irrelevant': 'Thought banking doesn’t change the forces',
  'accel-not-ratio': 'Gave the acceleration instead of the grip ratio',
  'friction-only': 'Thought friction supplies the inward force on a berm',
  'gravity-inward': 'Thought gravity supplies the inward force',
  'centrifugal': 'Treated centrifugal force as a real outward force',
  'mass-in-accel': 'Thought mass changes centripetal acceleration',
  'mass-irrelevant': 'Thought mass doesn’t affect the required force',
  'wrong-mass': 'Used the wrong rider’s mass',
  'weight-not-inward': 'Confused weight with the inward force',
  'mass-in-grip': 'Thought mass changes the required grip coefficient',
  'flat-enough': 'Thought a flat corner keeps grip demand low enough',
  'no-solution': 'Thought no berm angle could meet the constraint',
  'matched-not-min': 'Gave the matched angle instead of the smallest workable angle',
  'window-not-angle': 'Gave the window width instead of the smallest angle',
  'sign': 'Right size, wrong sign'
};
