// Newton's Laws lesson: the content (PRDs/NewtonPhysicsLesson.md), as data.
// Sections are lists of blocks; components/blocks.js draws them. Questions
// are graded deterministically (logic/validate.js); each has a stable `id`
// that is also its question kind ("newtons-laws:<id>") in the student's
// account, and `ideas`, which content/classes/activities.mjs turns into
// curriculum skills. IDS ARE PERMANENT once students have answered them.
//
// Block types:
//   p        { text }                         a short paragraph
//   law      { name, text }                   the statement of a law
//   eq       { eq, where: [[sym, meaning]] }  an equation and its symbols
//   cards    { items: [{ h, text, mtb }] }    MTB connection cards
//   table    { head, rows }
//   example  { title, given, steps: [[label, text]], answer, meaning }
//   note     { kind: 'key' | 'myth', title, text }
//   level    { level: 'explore' | 'engineer', title, paras }   open by default at that level, folded otherwise
//   visual   { id }                           a picture (components/visuals.js)
//   activity { id }                           an interactive (components/activities.js)
//   ask      { q }                            one question from QUESTIONS

import { G, weight, acceleration, slopeParallel, slopePerpendicular, fmt } from './physics.js';

const ch = (id, text, correct, feedback, code) => ({ id, text, correct: !!correct, feedback, code });

// ------------------------------------------------------------ questions
export const QUESTIONS = {
  // ---- Section 1
  'forces-flat': { type: 'forces', scenario: 'flat-pedal', ideas: ['force-types', 'vector'],
    prompt: 'A rider is pedalling steadily along a flat trail. Pick every force that acts on the rider-bike system from outside it, and give each one its direction.' },
  'weight-calc': { type: 'number', ideas: ['weight'], prompt: 'A lighter rider and bike have a combined mass of 65 kg. What is their weight? (Use g = 9.81 m/s².)',
    answer: weight(65), tolerance: 0.2, unit: 'N', label: 'Weight W',
    traps: [{ value: 65, code: 'mass-not-weight', message: 'That’s the mass in kilograms. Weight is a force: multiply by g.' }, { value: 65 / G, code: 'divided', message: 'You divided by g. Weight is W = m × g.' }, { value: 650, code: 'g10', message: 'Close, but that uses g = 10. Use 9.81.' }],
    hints: ['Weight is the force of gravity: W = mg.', 'W = 65 × 9.81'], solution: 'W = mg = 65 kg × 9.81 m/s² = 637.65 N ≈ 637.7 N. Mass stays 65 kg anywhere; weight is the pull of gravity on it.' },
  'net-calc': { type: 'number', ideas: ['net'], prompt: 'Accelerating out of a corner, the ground pushes the bike forward with 260 N while air and rolling resistance push back with 90 N. What is the net force? (Forward is positive.)',
    answer: 170, tolerance: 0.5, unit: 'N', label: 'Net force',
    traps: [{ value: 350, code: 'added', message: 'You added them. They point in opposite directions, so subtract.' }, { value: -170, code: 'sign', message: 'Right size, wrong direction: forward is positive and the forward force is bigger.' }],
    hints: ['F_net = F_forward − F_backward', '260 − 90'], solution: 'F_net = 260 N − 90 N = 170 N forward. The forces don’t vanish; they partly cancel, and 170 N is what’s left over to accelerate the bike.' },
  'balanced': { type: 'choice', ideas: ['balanced'], prompt: 'Which rider has balanced forces along the trail?',
    options: [ch('a', 'A rider accelerating out of a berm', false, 'Accelerating means the velocity is changing, so the forces are unbalanced.'),
      ch('b', 'A rider cruising at a steady 20 km/h on a flat fire road', true, 'Steady speed in a straight line: zero acceleration, so the forces along the trail cancel.'),
      ch('c', 'A rider squeezing the brakes before a corner', false, 'Braking changes the velocity, so there’s a net force backward.'),
      ch('d', 'None of them: balanced means no forces at all', false, 'Balanced forces still exist; they just cancel. Every rider here has gravity and the normal force acting.', 'no-forces')],
    solution: 'Balanced forces add to zero, so there is no acceleration: the rider keeps the same speed in the same direction. The steady cruiser is the only one not speeding up, slowing down or turning.' },

  // ---- Section 2
  'inertia-predict': { type: 'choice', ideas: ['inertia'], prompt: 'The same 120 N net force pushes Rider A (60 kg with bike) and Rider B (100 kg with bike) from rest. Which system is harder to accelerate?',
    options: [ch('a', 'Rider A, 60 kg', false, 'Less mass means less inertia: A responds more to the same push.'), ch('b', 'Rider B, 100 kg', true, 'More mass, more inertia: B resists the change in motion more.'), ch('c', 'Neither: the same force gives the same result', false, 'Same force, different mass: the results differ.', 'same')],
    solution: 'Mass is the measure of inertia. B has more mass, so the same net force changes B’s motion less: A reaches 2 m/s², B only 1.2 m/s².' },
  'first-law-q1': { type: 'choice', ideas: ['first-law', 'balanced'], prompt: 'A mountain biker rides along a flat trail at a constant velocity. What must be true about the net external force on the rider-bike system?',
    options: [ch('a', 'It must point forward', false, 'A forward net force would speed the rider up. Constant velocity means no acceleration.', 'motion-needs-force'), ch('b', 'It must point backward', false, 'A backward net force would slow the rider down.'),
      ch('c', 'It must equal zero', true, 'Constant velocity means zero acceleration, so the net force is zero.'), ch('d', 'Gravity must equal zero', false, 'Gravity still pulls down; the normal force balances it.')],
    solution: 'Constant velocity means zero acceleration. By Newton’s first law, that only happens when the net external force is zero.' },
  'first-law-q2': { type: 'choice', ideas: ['inertia'], prompt: 'Two mountain bikes have different masses and the same net force acts on each. Which has greater inertia?',
    options: [ch('a', 'The lighter bike', false, 'Inertia goes with mass: the lighter bike has less.'), ch('b', 'The heavier bike', true, 'More mass, more inertia.'), ch('c', 'Both have equal inertia', false, 'Inertia depends on mass, not on the force acting.'), ch('d', 'Neither has inertia', false, 'Everything with mass has inertia.')],
    solution: 'Mass measures inertia, whatever the force. The heavier bike resists changes in its motion more.' },
  'coasting': { type: 'choice', ideas: ['first-law'], prompt: 'You stop pedalling on a flat trail and slowly roll to a stop. Why do you slow down?',
    options: [ch('a', 'Moving objects need a forward force to keep moving', false, 'That’s the most common misconception in physics. Without any net force, the bike would keep going at the same speed.', 'motion-needs-force'),
      ch('b', 'Rolling resistance and air drag give a net force backward', true, 'The resistive forces are no longer balanced by a forward push, so the net force points backward.'),
      ch('c', 'The bike runs out of inertia', false, 'Inertia isn’t used up; it depends only on mass.', 'inertia-used'),
      ch('d', 'Gravity pulls the bike backward', false, 'On flat ground gravity pulls straight down, not backward.')],
    solution: 'In an ideal world with no resistance you’d coast forever (first law). Real trails have rolling resistance and air drag; once you stop pedalling nothing balances them, so the net force points backward and you slow down.' },

  // ---- Section 3
  'accel-calc': { type: 'number', ideas: ['second-law'], prompt: 'A rider and bike have a combined mass of 90 kg. The net forward force is 225 N. What is the acceleration?',
    answer: acceleration(225, 90), tolerance: 0.02, unit: 'm/s²', label: 'Acceleration a',
    traps: [{ value: 225 * 90, code: 'multiplied', message: 'You multiplied. Rearrange F = ma to a = F ÷ m.' }, { value: 90 / 225, code: 'inverted', message: 'That’s m ÷ F, upside down. a = F ÷ m.' }],
    hints: ['Rearrange F_net = ma for a.', 'a = 225 ÷ 90'], solution: 'a = F_net ÷ m = 225 N ÷ 90 kg = 2.5 m/s². Every second, the rider gains 2.5 m/s.' },
  'brake-calc': { type: 'number', ideas: ['second-law', 'net'], prompt: 'Braking before a berm, a 70 kg rider-bike system has a net force of 280 N opposite its direction of travel. What is the acceleration along the direction of travel? (Include the sign.)',
    answer: -4, tolerance: 0.02, unit: 'm/s²', label: 'Acceleration a',
    traps: [{ value: 4, code: 'sign', message: 'Right size, but the force points backward, so the acceleration is negative.' }, { value: 280 * 70, code: 'multiplied', message: 'You multiplied. a = F ÷ m.' }],
    hints: ['Backward is negative: F_net = −280 N.', 'a = −280 ÷ 70'], solution: 'a = F_net ÷ m = −280 N ÷ 70 kg = −4 m/s². The minus sign says the rider is slowing: losing 4 m/s every second.' },
  'double-both': { type: 'choice', ideas: ['second-law'], prompt: 'Experiment C: you double the net force AND double the mass. What happens to the acceleration?',
    options: [ch('a', 'It doubles', false, 'Doubling the force alone would double it, but the doubled mass halves it again.'), ch('b', 'It stays the same', true, 'Twice the force on twice the mass: a = 2F ÷ 2m = F ÷ m.'), ch('c', 'It quadruples', false, 'The two changes work against each other.'), ch('d', 'It halves', false, 'Doubling the mass alone would halve it, but the force doubled too.')],
    solution: 'a = F ÷ m. Doubling both gives 2F ÷ 2m = F ÷ m: the same acceleration. Try it with the sliders.' },

  // ---- Section 4
  'pair-tire': { type: 'choice', ideas: ['third-law', 'pairs'], prompt: 'The driven rear tire grips the trail as you pedal. Which is the action-reaction pair?',
    options: [ch('a', 'Tire pushes backward on the ground; ground pushes forward on the tire', true, 'Equal size, opposite directions, acting on different objects.'),
      ch('b', 'Tire pushes forward on the ground; ground pushes forward on the tire', false, 'A pair always points in opposite directions.', 'same-direction'),
      ch('c', 'Tire pushes downward on the ground; ground pushes downward on the tire', false, 'Opposite directions again: if the tire pushes down, the ground pushes up. And this is a different pair, the vertical one.', 'same-direction')],
    solution: 'The tire pushes the ground backward; the ground pushes the tire forward with the same size of force. Only the second force acts on the bike, and it’s the force that drives you forward.' },
  'pair-landing': { type: 'choice', ideas: ['third-law', 'pairs'], prompt: 'Landing a jump, the tires push down on the landing with a large force. What does the landing do?',
    options: [ch('a', 'Pushes up on the tires with a force of the same size', true, 'That upward push is the normal force, and it’s what stops your fall.'),
      ch('b', 'Pushes up with a smaller force, because the ground doesn’t move', false, 'Third-law pairs are always equal in size, whatever moves.', 'smaller'),
      ch('c', 'Nothing: the ground just sits there', false, 'The ground pushes back; that’s what you feel through the bike.')],
    solution: 'Tires push down on the ground, the ground pushes up on the tires: equal and opposite. The ground hardly moves because Earth’s mass is enormous, not because its force is smaller.' },
  'pairs-cancel': { type: 'choice', ideas: ['pairs', 'fbd'], prompt: 'If the ground’s forward push on the tire is equal and opposite to the tire’s push on the ground, why doesn’t the bike just stay still?',
    options: [ch('a', 'The forces act on different objects, so they don’t cancel on the bike', true, 'Exactly: on the bike’s free-body diagram, only the ground’s push appears.'),
      ch('b', 'The ground’s force is slightly bigger', false, 'They are exactly equal: that’s the third law.', 'unequal'),
      ch('c', 'They do cancel; the bike moves because of the rider’s legs', false, 'The rider’s legs are inside the rider-bike system. The outside force that drives it is the ground’s push.', 'cancel')],
    solution: 'Forces only cancel when they act on the same object. One force of the pair acts on the ground, the other on the tire. Draw the bike on its own and only the forward push on the tire is there.' },

  // ---- Section 5
  'fbd-flat': { type: 'forces', scenario: 'flat-steady', ideas: ['fbd', 'force-types'], prompt: 'Flat trail, steady speed. Build the free-body diagram of the rider-bike system.' },
  'fbd-climb': { type: 'forces', scenario: 'climb', ideas: ['fbd', 'force-types', 'incline'], prompt: 'Climbing a hill and speeding up. Build the free-body diagram.' },
  'fbd-brake': { type: 'forces', scenario: 'brake', ideas: ['fbd', 'force-types'], prompt: 'Braking on a flat trail. Build the free-body diagram.' },
  'fbd-downhill': { type: 'forces', scenario: 'downhill', ideas: ['fbd', 'force-types', 'incline'], prompt: 'Coasting downhill and speeding up (no pedalling, no brakes). Build the free-body diagram.' },
  'fbd-net': { type: 'choice', ideas: ['fbd', 'net'], prompt: 'Which way does the net force point?', dynamic: true },
  'slope-components': { type: 'fields', ideas: ['incline'], prompt: 'An 80 kg rider-bike system is on a 10° climb. Split its weight into the part along the slope and the part into the slope.',
    fields: [{ id: 'par', label: 'Along the slope, mg sin θ', answer: slopeParallel(80, 10), tolerance: 0.3, unit: 'N',
      traps: [{ value: slopePerpendicular(80, 10), code: 'swapped', message: 'That’s the cos part. Along the slope uses sin θ.' }, { value: 80 * G, code: 'whole', message: 'That’s the whole weight. Only part of it acts along the slope.' }] },
      { id: 'perp', label: 'Into the slope, mg cos θ', answer: slopePerpendicular(80, 10), tolerance: 0.3, unit: 'N',
        traps: [{ value: slopeParallel(80, 10), code: 'swapped', message: 'That’s the sin part. Into the slope uses cos θ.' }] }],
    hints: ['mg = 80 × 9.81 = 784.8 N.', 'Along: 784.8 × sin 10°. Into: 784.8 × cos 10°.'],
    solution: `mg = 784.8 N. Along the slope: 784.8 × sin 10° ≈ ${fmt(slopeParallel(80, 10), 1)} N. Into the slope: 784.8 × cos 10° ≈ ${fmt(slopePerpendicular(80, 10), 1)} N, which the normal force balances. On a steeper trail sin θ grows, so more of your weight pulls you back down the hill.` },

  // ---- Section 6 (Force Lab experiments)
  'lab-steady': { type: 'choice', ideas: ['first-law', 'balanced'], prompt: 'Traction 40 N, resistance 40 N, flat trail: the net force is 0 N. Ride it. What happens to the rider’s velocity?',
    options: [ch('a', 'It stays the same', true, 'Zero net force, zero acceleration: the speed-time line is flat.'), ch('b', 'It slowly drops to zero', false, 'Only a net backward force would slow the rider. Here the forces cancel.', 'motion-needs-force'), ch('c', 'It keeps increasing', false, 'Increasing speed needs a net forward force.')],
    solution: 'With balanced forces the rider keeps the same velocity: Newton’s first law. Look at the speed trace: a flat line.' },
  'lab-coast': { type: 'choice', ideas: ['first-law', 'net'], prompt: 'Now set the traction to 0 N and ride. Why does the rider slow down?',
    options: [ch('a', 'Resistance gives a net force backward', true, 'F_net = −40 N, so a = −40 ÷ 80 = −0.5 m/s².'), ch('b', 'The rider has used up their inertia', false, 'Inertia isn’t used up.', 'inertia-used'), ch('c', 'With no traction there are no forces left', false, 'Resistance, gravity and the normal force are still there.')],
    solution: 'Take away the traction and the 40 N of resistance is unbalanced: a = −40 N ÷ 80 kg = −0.5 m/s².' },
  'lab-zero-climb': { type: 'task', ideas: ['balanced', 'incline', 'net'], prompt: 'Set the trail to a 6° climb, then adjust the traction (and anything else except the angle) until the net force is within 3 N of zero.' },
  'lab-accel': { type: 'number', ideas: ['second-law'], prompt: 'Flat trail, 80 kg, traction 200 N, resistance 40 N, no brakes. What acceleration does the lab show?',
    answer: acceleration(160, 80), tolerance: 0.02, unit: 'm/s²', label: 'Acceleration a',
    traps: [{ value: 200 / 80, code: 'ignored-resistance', message: 'That uses the traction alone. Subtract the resistance first to get the net force.' }],
    hints: ['F_net = 200 − 40.', 'a = 160 ÷ 80'], solution: 'F_net = 200 − 40 = 160 N, so a = 160 ÷ 80 = 2.0 m/s². Set it up in the lab to check.' },
  'lab-mass': { type: 'choice', ideas: ['second-law', 'inertia'], prompt: 'Keep traction 200 N and resistance 40 N, and change the mass from 80 kg to 100 kg. What happens to the acceleration?',
    options: [ch('a', 'It drops from 2.0 to 1.6 m/s²', true, 'Same 160 N on more mass: 160 ÷ 100 = 1.6 m/s².'), ch('b', 'It rises, because there’s more weight pushing', false, 'On flat ground weight acts down, not forward; more mass just means more inertia.', 'heavier-faster'), ch('c', 'It stays at 2.0 m/s²', false, 'The force is the same but the mass grew, so the acceleration falls.')],
    solution: 'a = F_net ÷ m = 160 ÷ 100 = 1.6 m/s². More mass, same net force, less acceleration: graph B shows the curve.' },
  'lab-pair': { type: 'choice', ideas: ['third-law', 'pairs'], prompt: 'With 180 N of traction, the tire pushes backward on the ground with 180 N. What force does the ground put on the tire?',
    options: [ch('a', '180 N forward', true, 'Equal size, opposite direction, on the other object.'), ch('b', 'Less than 180 N forward, because the bike moves', false, 'Pairs are always equal in size.', 'smaller'), ch('c', '180 N backward', false, 'The pair points the opposite way.', 'same-direction'), ch('d', 'None: the forces cancel', false, 'They act on different objects, so they can’t cancel.', 'cancel')],
    solution: 'The ground pushes the tire forward with 180 N. Switch between “on the tire” and “on the ground”: one arrow for each object, the same length.' },

  // ---- Section 7: knowledge check (PRD 10.1)
  'kc-1': { type: 'choice', check: true, ideas: ['first-law', 'balanced'], prompt: 'A mountain biker is travelling along a flat trail at a constant velocity. What is the net force on the rider-bike system?',
    options: [ch('a', 'It must equal the rider’s weight', false, 'Weight is balanced by the normal force; it isn’t the net force.'), ch('b', 'It must equal zero', true, 'Constant velocity, zero acceleration, zero net force.'), ch('c', 'It must point forward', false, 'A forward net force would speed the rider up.', 'motion-needs-force'), ch('d', 'It must point backward', false, 'A backward net force would slow the rider down.')],
    solution: 'Constant velocity means no acceleration, so by the first law the net force is zero.' },
  'kc-2': { type: 'choice', check: true, ideas: ['inertia'], prompt: 'Which system has greater inertia?',
    options: [ch('a', 'A 50 kg rider-bike system', false, 'Less mass, less inertia.'), ch('b', 'A 100 kg rider-bike system', true, 'Inertia is measured by mass.'), ch('c', 'Both have equal inertia', false, 'Their masses differ, so their inertia does.'), ch('d', 'Neither has inertia', false, 'Anything with mass has inertia.')],
    solution: 'Mass is the measure of inertia: the 100 kg system has more.' },
  'kc-3': { type: 'choice', check: true, ideas: ['second-law'], prompt: 'A rider-bike system has a mass of 75 kg. The net forward force is 150 N. What is the acceleration?',
    options: [ch('a', '0.5 m/s²', false, 'That’s 75 ÷ 150: upside down. a = F ÷ m.', 'inverted'), ch('b', '2 m/s²', true, 'a = 150 ÷ 75 = 2 m/s².'), ch('c', '5 m/s²', false, 'Check the division: 150 ÷ 75.'), ch('d', '11,250 m/s²', false, 'That’s F × m. Divide instead.', 'multiplied')],
    solution: 'a = F_net ÷ m = 150 N ÷ 75 kg = 2 m/s².' },
  'kc-4': { type: 'choice', check: true, ideas: ['second-law'], prompt: 'The net force on a mountain bike doubles while its mass stays the same. What happens to the acceleration?',
    options: [ch('a', 'It doubles', true, 'a is proportional to F at constant mass.'), ch('b', 'It halves', false, 'That would happen if the mass doubled.'), ch('c', 'It quadruples', false, 'a ∝ F, not F².'), ch('d', 'It remains the same', false, 'More net force on the same mass means more acceleration.')],
    solution: 'At constant mass, a = F ÷ m is proportional to F: double the force, double the acceleration.' },
  'kc-5': { type: 'choice', check: true, ideas: ['third-law', 'pairs'], prompt: 'When a driven tire pushes backward against the ground, what does the ground do?',
    options: [ch('a', 'Nothing', false, 'Every push has a partner push back.'), ch('b', 'Pushes forward against the tire', true, 'Equal and opposite, on the tire.'), ch('c', 'Pushes backward against the tire', false, 'The partner force points the opposite way.', 'same-direction'), ch('d', 'Reduces the bike’s mass', false, 'Forces don’t change mass.')],
    solution: 'The ground pushes forward on the tire with an equal force: the third law, and the force that drives the bike.' },
  'kc-6': { type: 'choice', check: true, ideas: ['fbd', 'balanced'], prompt: 'A rider is travelling on a flat trail at constant speed. Which statement about the forces is correct?',
    options: [ch('a', 'There are no forces acting', false, 'Gravity, the normal force, traction and resistance all act; they balance.', 'no-forces'), ch('b', 'Vertical forces and horizontal forces each balance', true, 'Gravity balances the normal force; traction balances resistance.'), ch('c', 'Gravity disappears', false, 'Gravity never switches off.'), ch('d', 'The normal force is greater than gravity', false, 'Then the rider would accelerate upward.')],
    solution: 'At constant speed on the flat, up balances down (N = mg) and forward balances backward (traction = resistance). Net force zero.' },
  'kc-7': { type: 'number', check: true, ideas: ['weight'], prompt: 'A rider and bike have a combined mass of 80 kg. Calculate their weight.',
    answer: weight(80), tolerance: 0.2, unit: 'N', label: 'Weight W',
    traps: [{ value: 80, code: 'mass-not-weight', message: 'That’s the mass. Weight is a force: W = mg.' }, { value: 800, code: 'g10', message: 'That uses g = 10. Use 9.81.' }],
    hints: ['W = mg'], solution: 'W = mg = 80 × 9.81 = 784.8 N.' },
  'kc-8': { type: 'fields', check: true, working: true, ideas: ['incline', 'net', 'second-law', 'reasoning'],
    prompt: 'A 75 kg rider-bike system accelerates uphill on a 5° slope. The tire-ground traction is 240 N and the opposing resistance is 45 N. Find the gravity component along the slope, the net force and the acceleration.',
    fields: [{ id: 'gpar', label: 'Gravity along the slope', answer: slopeParallel(75, 5), tolerance: 0.3, unit: 'N',
      traps: [{ value: slopePerpendicular(75, 5), code: 'swapped', message: 'That’s about the whole weight, mg cos θ (on a gentle slope cos θ is nearly 1). Along the slope uses mg sin θ.' }] },
      { id: 'net', label: 'Net force', answer: 240 - 45 - slopeParallel(75, 5), tolerance: 0.4, unit: 'N',
        traps: [{ value: 195, code: 'no-gravity', message: 'You left out gravity’s pull down the slope.' }, { value: 240 - slopeParallel(75, 5), code: 'no-resistance', message: 'You left out the resistance.' }] },
      { id: 'a', label: 'Acceleration', answer: (240 - 45 - slopeParallel(75, 5)) / 75, tolerance: 0.02, unit: 'm/s²',
        traps: [{ value: 195 / 75, code: 'no-gravity', message: 'That ignores gravity along the slope.' }, { value: 240 / 75, code: 'traction-only', message: 'Use the net force, not the traction alone.' }] }],
    hints: ['Fg∥ = mg sin θ = 75 × 9.81 × sin 5°.', 'F_net = 240 − 45 − Fg∥.', 'a = F_net ÷ 75.'],
    solution: `Fg∥ = 75 × 9.81 × sin 5° ≈ ${fmt(slopeParallel(75, 5), 1)} N. F_net = 240 − 45 − ${fmt(slopeParallel(75, 5), 1)} ≈ ${fmt(240 - 45 - slopeParallel(75, 5), 1)} N. a = ${fmt(240 - 45 - slopeParallel(75, 5), 1)} ÷ 75 ≈ ${fmt((240 - 45 - slopeParallel(75, 5)) / 75, 2)} m/s² uphill.` },

  // ---- Final challenge (PRD 10.2): Can You Accelerate Uphill?
  'final-fbd': { type: 'forces', scenario: 'final', ideas: ['fbd', 'force-types', 'incline'], prompt: 'Step 1–2: identify the forces and build the free-body diagram for the climb.' },
  'final-calc': { type: 'fields', working: true, ideas: ['incline', 'net', 'second-law', 'reasoning'],
    prompt: 'Steps 3–5: 85 kg, an 8° climb, 300 N of traction and 55 N of resistance. Calculate the gravity component along the slope, the net force and the acceleration.',
    fields: [{ id: 'gpar', label: 'Gravity along the slope', answer: slopeParallel(85, 8), tolerance: 0.4, unit: 'N',
      traps: [{ value: slopePerpendicular(85, 8), code: 'swapped', message: 'That’s close to the whole weight: mg cos θ, the part into the slope. Along the slope uses mg sin θ.' }] },
      { id: 'net', label: 'Net force', answer: 300 - 55 - slopeParallel(85, 8), tolerance: 0.5, unit: 'N',
        traps: [{ value: 245, code: 'no-gravity', message: 'Gravity along the slope is missing.' }, { value: 300 - slopeParallel(85, 8), code: 'no-resistance', message: 'The resistance is missing.' }] },
      { id: 'a', label: 'Acceleration', answer: (300 - 55 - slopeParallel(85, 8)) / 85, tolerance: 0.02, unit: 'm/s²',
        traps: [{ value: 245 / 85, code: 'no-gravity', message: 'That leaves out gravity along the slope.' }, { value: 300 / 85, code: 'traction-only', message: 'Use the net force.' }] }],
    hints: ['Fg∥ = 85 × 9.81 × sin 8°.', 'F_net = 300 − 55 − Fg∥.', 'a = F_net ÷ m.'],
    solution: `Fg∥ = 85 × 9.81 × sin 8° ≈ ${fmt(slopeParallel(85, 8), 1)} N. F_net = 300 − 55 − ${fmt(slopeParallel(85, 8), 1)} ≈ ${fmt(300 - 55 - slopeParallel(85, 8), 1)} N uphill. a = ${fmt(300 - 55 - slopeParallel(85, 8), 1)} ÷ 85 ≈ ${fmt((300 - 55 - slopeParallel(85, 8)) / 85, 2)} m/s². The rider gains about 1.5 m/s of speed every second while these forces last.` }
};

// The free-body scenarios. `choices` are the forces offered; `correct` maps
// each force that belongs to its direction. Directions: up, down, forward,
// backward (flat); perp, uphill, downhill (slope; down is always vertical).
export const FORCES = {
  gravity: { sym: 'Fg', name: 'Gravity', cls: 'g' },
  normal: { sym: 'FN', name: 'Normal force', cls: 'n' },
  traction: { sym: 'Ft', name: 'Tire-ground traction', cls: 't' },
  friction: { sym: 'Ff', name: 'Tire-ground friction', cls: 't' },
  braking: { sym: 'Fb', name: 'Braking friction', cls: 'b' },
  resistance: { sym: 'Fr', name: 'Air + rolling resistance', cls: 'r' },
  air: { sym: 'Fair', name: 'Air resistance', cls: 'r' },
  spring: { sym: 'Fs', name: 'Suspension spring force', cls: 'x' },
  magnetic: { sym: 'FB', name: 'Magnetic force', cls: 'x' },
  motion: { sym: 'Fm', name: '“Force of motion” that keeps it going', cls: 'x' },
  pedal: { sym: 'Fp', name: 'Rider’s push on the pedals', cls: 'x' }
};
const NOT = {
  spring: 'The suspension spring pushes between parts of the bike, inside the rider-bike system. Internal forces don’t go on its free-body diagram.',
  magnetic: 'No magnet is acting on the bike here.',
  motion: 'There’s no such force. A moving object keeps moving without one (the first law).',
  pedal: 'The rider pushing the pedals happens inside the rider-bike system. The outside force it produces is the ground’s push on the tire.',
  traction: 'Coasting means no pedalling, so the ground isn’t driving the tire forward.',
  braking: 'No brakes here.'
};
export const SCENARIOS = {
  'flat-pedal': { title: 'Pedalling on a flat trail', tilt: 0, choices: ['gravity', 'normal', 'friction', 'air', 'spring', 'magnetic'],
    correct: { gravity: 'down', normal: 'up', friction: 'forward', air: 'backward' }, dirs: ['up', 'down', 'forward', 'backward'],
    why: { gravity: 'Earth pulls the rider and bike down.', normal: 'The trail pushes up on the tires.', friction: 'While you pedal, the ground pushes the driven tire forward (static friction).', air: 'Air pushes back against your motion.' }, not: NOT },
  'flat-steady': { title: 'Flat trail, steady speed', tilt: 0, choices: ['gravity', 'normal', 'traction', 'resistance', 'motion', 'pedal'],
    correct: { gravity: 'down', normal: 'up', traction: 'forward', resistance: 'backward' }, dirs: ['up', 'down', 'forward', 'backward'],
    net: 'zero', why: { gravity: 'Down, always.', normal: 'Up from the flat trail.', traction: 'The ground drives the tire forward.', resistance: 'Air and rolling resistance oppose the motion.' }, not: NOT },
  climb: { title: 'Climbing and speeding up', tilt: 8, choices: ['gravity', 'normal', 'traction', 'resistance', 'motion', 'spring'],
    correct: { gravity: 'down', normal: 'perp', traction: 'uphill', resistance: 'downhill' }, dirs: ['down', 'perp', 'uphill', 'downhill'],
    net: 'uphill', why: { gravity: 'Straight down, not into the slope. Its part along the slope pulls you back.', normal: 'Perpendicular to the trail surface, not straight up.', traction: 'The ground drives the tire up the trail.', resistance: 'Opposes the motion, so it points down the trail.' }, not: NOT },
  brake: { title: 'Braking on a flat trail', tilt: 0, choices: ['gravity', 'normal', 'braking', 'air', 'motion', 'traction'],
    correct: { gravity: 'down', normal: 'up', braking: 'backward', air: 'backward' }, dirs: ['up', 'down', 'forward', 'backward'],
    net: 'backward', why: { gravity: 'Down.', normal: 'Up.', braking: 'The ground grips the slowed tires and pushes them backward.', air: 'Air still pushes back.' },
    not: { ...NOT, traction: 'While braking you aren’t pedalling, so there’s no forward drive.' } },
  downhill: { title: 'Coasting downhill', tilt: -8, choices: ['gravity', 'normal', 'resistance', 'traction', 'motion', 'spring'],
    correct: { gravity: 'down', normal: 'perp', resistance: 'uphill' }, dirs: ['down', 'perp', 'uphill', 'downhill'],
    net: 'downhill', why: { gravity: 'Straight down; part of it pulls you down the trail.', normal: 'Perpendicular to the slope.', resistance: 'Opposes the motion: back up the trail.' }, not: NOT },
  final: { title: 'The climbing trail: 85 kg, 8°', tilt: 8, choices: ['gravity', 'normal', 'traction', 'resistance', 'motion', 'pedal'],
    correct: { gravity: 'down', normal: 'perp', traction: 'uphill', resistance: 'downhill' }, dirs: ['down', 'perp', 'uphill', 'downhill'],
    why: { gravity: `Down: mg = ${fmt(85 * G, 1)} N.`, normal: 'Perpendicular to the slope.', traction: '300 N up the trail.', resistance: '55 N down the trail.' }, not: NOT }
};
export const DIR_TEXT = { up: '↑ up', down: '↓ straight down', forward: '→ forward', backward: '← backward', perp: 'perpendicular to the slope, outward', uphill: 'up the slope', downhill: 'down the slope' };
export const NET_TEXT = { zero: 'Zero: the forces balance', forward: 'Forward', backward: 'Backward', uphill: 'Up the slope', downhill: 'Down the slope' };

// Each question's kind -> the ideas it practises (for curriculum skills).
export function questionKinds() {
  return Object.fromEntries(Object.entries(QUESTIONS).map(([id, q]) => [id, q.ideas]));
}
export const CHECK_IDS = Object.keys(QUESTIONS).filter(id => QUESTIONS[id].check);

// ------------------------------------------------------------ sections
export const SECTIONS = [
  { id: 'forces', n: 1, title: 'What are forces?', minutes: 5, hook: 'What makes your mountain bike move?',
    graded: ['forces-flat', 'weight-calc', 'net-calc', 'balanced'],
    blocks: [
      { t: 'p', text: 'When you pedal, something makes the bike speed up. Pull the brakes and something slows it down. Hit a jump and something changes the direction you’re moving. Every one of those is a force.' },
      { t: 'law', name: 'Force', text: 'A force is an interaction that can change an object’s motion or change its shape. Forces have a size (magnitude) and a direction, so they are vector quantities. We measure them in newtons (N).' },
      { t: 'level', level: 'explore', title: 'In plain words', paras: ['A force is a push or a pull. It always has a direction: you can’t push “nowhere”.', 'One newton is about the weight of a small apple in your hand.'] },
      { t: 'level', level: 'engineer', title: 'Scalars and vectors', paras: ['A scalar has only a size: mass (80 kg), speed (5 m/s), time. A vector has a size and a direction: force, velocity, acceleration, displacement.', '1 N is the force that accelerates 1 kg at 1 m/s²: 1 N = 1 kg·m/s².'] },
      { t: 'table', head: ['Type of force', 'Where you meet it on the bike'], rows: [
        ['Applied force', 'You push on the pedals and the bars.'], ['Gravity', 'Earth pulls you and the bike toward the ground.'], ['Normal force', 'The trail pushes up against the tires.'],
        ['Friction', 'The tires grip the dirt to drive you forward or brake.'], ['Air resistance', 'Air pushes against you, most on fast descents.'], ['Spring force', 'The suspension pushes back when it compresses.'], ['Tension', 'A tight chain or brake cable carries force along it.']] },
      { t: 'note', kind: 'key', title: 'Not every force, every time', text: 'Which forces act depends on the situation. Coasting, there’s no drive from the tire; in the air off a jump, there’s no normal force at all.' },
      { t: 'activity', id: 'identify-forces' },
      { t: 'p', text: 'Mass and weight sound alike but are different things.' },
      { t: 'cards', items: [{ h: 'Mass (kg)', text: 'How much matter something has, and how hard it is to speed up or slow down (its inertia). The same everywhere, even on the Moon.' },
        { h: 'Weight (N)', text: 'The force of gravity on that mass. It’s a force, so it’s measured in newtons.' }] },
      { t: 'eq', eq: 'W = mg', where: [['W', 'weight (N)'], ['m', 'mass (kg)'], ['g', 'gravitational acceleration, 9.81 m/s²']] },
      { t: 'example', title: 'Worked example: weight', given: 'A rider and bike have a combined mass of 80 kg.', steps: [['Equation', 'W = mg'], ['Substitute', 'W = 80 × 9.81'], ['Calculate', 'W = 784.8 N']], answer: '784.8 N', meaning: 'A heavier rider-bike system feels a bigger pull of gravity. That matters for climbing, jumping, braking and suspension.' },
      { t: 'ask', q: 'weight-calc' },
      { t: 'p', text: 'Usually several forces act at once. What matters for the motion is the net force: all of them added together, with their directions.' },
      { t: 'eq', eq: 'F_net = F_forward − F_backward', where: [['F_net', 'net force, along one straight line (N)']] },
      { t: 'example', title: 'Worked example: net force', given: 'A rider has 200 N pushing forward and 50 N pushing back.', steps: [['Equation', 'F_net = F_forward − F_backward'], ['Substitute', 'F_net = 200 − 50'], ['Calculate', 'F_net = 150 N forward']], answer: '150 N forward', meaning: 'The net force is what decides the acceleration.' },
      { t: 'ask', q: 'net-calc' },
      { t: 'cards', items: [{ h: 'Balanced forces', text: 'Net force zero: no acceleration, so the velocity stays the same.', mtb: 'Cruising at a steady speed on flat ground.' },
        { h: 'Unbalanced forces', text: 'Net force not zero: the object accelerates in the direction of the net force.', mtb: 'Sprinting out of a corner (net forward), or braking (net backward).' }] },
      { t: 'note', kind: 'myth', title: 'Balanced doesn’t mean “no forces”', text: 'Balanced forces still exist. They cancel when you add them as vectors.' },
      { t: 'ask', q: 'balanced' }
    ] },
  { id: 'first-law', n: 2, title: 'Newton’s First Law: inertia', minutes: 7, hook: 'You stop pedalling at 20 km/h. Do you stop dead?',
    graded: ['inertia-predict', 'first-law-q1', 'first-law-q2', 'coasting'],
    blocks: [
      { t: 'p', text: 'Of course not: you keep rolling. Objects resist changes to their motion. Newton’s first law describes exactly that.' },
      { t: 'law', name: 'Newton’s First Law', text: 'An object stays at rest, or keeps moving at a constant velocity, unless a nonzero net external force acts on it.' },
      { t: 'p', text: 'That resistance to changes in motion is called inertia. Mass is the measure of inertia: the more mass, the harder it is to change the motion by the same amount.' },
      { t: 'visual', id: 'coast' },
      { t: 'cards', items: [
        { h: 'At rest', text: 'A bike parked on level ground stays put.', mtb: 'It doesn’t roll off by itself because the net force on it is zero.' },
        { h: 'Constant velocity', text: 'With zero net force a moving object keeps the same velocity.', mtb: 'Cruising on the flat, the forward and backward forces balance.' },
        { h: 'Inertia', text: 'Objects resist changes in motion.', mtb: 'At speed you can’t stop or swerve instantly: it takes a force, applied over time.' },
        { h: 'Mass and inertia', text: 'More mass, more inertia.', mtb: 'Under the same net force, a heavier rider-bike system accelerates less.' },
        { h: 'Braking', text: 'Slowing down needs an unbalanced force too.', mtb: 'Squeeze the brakes and the ground pushes back on the tires, changing your velocity.' }] },
      { t: 'activity', id: 'inertia' },
      { t: 'note', kind: 'myth', title: 'Why does the bike slow down when I stop pedalling?', text: 'Many people think a moving object needs a forward force to keep moving. It doesn’t: with no net force it would roll on forever. A real bike slows because rolling resistance and air drag push back, and once you stop pedalling nothing balances them. You pedal to balance resistance or to speed up, not to “keep moving”.' },
      { t: 'ask', q: 'coasting' },
      { t: 'level', level: 'engineer', title: 'Reference frames', paras: ['The first law holds in an inertial frame: one that isn’t itself accelerating. The trail is a good enough inertial frame for riding.', 'In a car that brakes hard you feel “thrown forward”. Nothing pushes you forward: your body keeps its velocity while the car slows. Same on a bike when the front brake bites.'] },
      { t: 'ask', q: 'first-law-q1' },
      { t: 'ask', q: 'first-law-q2' }
    ] },
  { id: 'second-law', n: 3, title: 'Newton’s Second Law: force and acceleration', minutes: 10, hook: 'Why does pushing harder on the pedals make you accelerate faster?',
    graded: ['accel-calc', 'brake-calc', 'double-both'],
    blocks: [
      { t: 'p', text: 'You’re climbing and decide to go. You push harder, and the bike speeds up. The second law says exactly how force, mass and acceleration are related.' },
      { t: 'law', name: 'Newton’s Second Law', text: 'An object’s acceleration is set by the net external force on it and its mass: the net force equals mass times acceleration.' },
      { t: 'eq', eq: 'F_net = ma', where: [['F_net', 'net external force (N)'], ['m', 'mass (kg)'], ['a', 'acceleration (m/s²)']] },
      { t: 'p', text: 'This is one of the most important relationships in the whole course.' },
      { t: 'cards', items: [
        { h: 'More force, more acceleration', text: 'At the same mass, acceleration goes up in proportion to the net force.', mtb: 'Push harder on the pedals and you jump forward faster.' },
        { h: 'More mass, less acceleration', text: 'With the same net force, more mass means less acceleration.', mtb: 'A heavier rider-bike system needs more force for the same kick.' },
        { h: 'Acceleration follows the net force', text: 'Acceleration always points the same way as the net force.', mtb: 'Braking: the net force points backward, so the acceleration does too.' }] },
      { t: 'example', title: 'Worked example: accelerating out of a corner', given: 'Combined mass 80 kg; net forward force 160 N.',
        steps: [['Known', 'm = 80 kg, F_net = 160 N'], ['Equation', 'F_net = ma'], ['Rearrange', 'a = F_net ÷ m'], ['Substitute', 'a = 160 ÷ 80'], ['Calculate', 'a = 2 m/s²']],
        answer: '2 m/s²', meaning: 'Every second the rider’s speed grows by 2 m/s, as long as the acceleration stays constant.' },
      { t: 'ask', q: 'accel-calc' },
      { t: 'example', title: 'Worked example: braking before a berm', given: '80 kg; net force 240 N opposite the direction of travel.',
        steps: [['Signs', 'Forward is positive, so F_net = −240 N'], ['Rearrange', 'a = F_net ÷ m'], ['Calculate', 'a = −240 ÷ 80 = −3 m/s²']],
        answer: '−3 m/s²', meaning: 'The minus sign means slowing down relative to the forward direction. More braking force, more deceleration.' },
      { t: 'ask', q: 'brake-calc' },
      { t: 'p', text: 'Climbing, several forces act along the trail at once: the drive from the tire, resistance, and the part of gravity pulling you back down the slope.' },
      { t: 'eq', eq: 'F_net = F_drive − F_resistance − mg sin θ', where: [['θ', 'the trail’s angle'], ['mg sin θ', 'gravity’s pull along the slope (Section 5)']] },
      { t: 'level', level: 'explore', title: 'In plain words', paras: ['Climbing, gravity is working against you. The steeper the trail, the more of your weight pulls you backward, so you need more push just to keep going.'] },
      { t: 'activity', id: 'accel-sliders' },
      { t: 'ask', q: 'double-both' },
      { t: 'level', level: 'engineer', title: 'Why F = ma isn’t just a definition', paras: ['F = ma makes a testable prediction: measure the net force and the mass separately, and the acceleration must be their ratio. Change either and the prediction changes.', 'It works in each direction separately: ΣFx = max and ΣFy = may. On the flat, the vertical forces balance (ay = 0) while the horizontal ones may not.'] }
    ] },
  { id: 'third-law', n: 4, title: 'Newton’s Third Law: action and reaction', minutes: 7, hook: 'What actually pushes your bike forward?',
    graded: ['pair-tire', 'pair-landing', 'pairs-cancel'],
    blocks: [
      { t: 'p', text: 'You push on the pedals, the chain turns the rear wheel, the tire grips the dirt. But something has to push the bike forward from outside. That’s the ground.' },
      { t: 'law', name: 'Newton’s Third Law', text: 'Whenever one object exerts a force on a second object, the second exerts a force of the same size in the opposite direction on the first.' },
      { t: 'note', kind: 'key', title: 'Two objects, two forces', text: 'Action-reaction forces act on different objects. That’s why they never cancel on one object’s free-body diagram.' },
      { t: 'activity', id: 'who-pushes' },
      { t: 'cards', items: [
        { h: 'Tire and ground', text: 'The driven tire pushes backward on the ground; the ground pushes forward on the tire.', mtb: 'That forward push is what accelerates you.' },
        { h: 'Jump takeoff', text: 'The bike pushes on the lip; the lip pushes back on the tires.', mtb: 'Part of the force system that launches you.' },
        { h: 'Landing', text: 'The tires push down on the landing; the landing pushes up on the tires.', mtb: 'That upward normal force stops your fall.' },
        { h: 'Braking', text: 'The braking tire pushes forward on the ground; the ground pushes back on the tire.', mtb: 'Braking happens through the tire-ground grip.' },
        { h: 'Pedalling', text: 'Your foot pushes the pedal down; the pedal pushes your foot up.', mtb: 'You feel the pedal push back, harder in a big gear.' }] },
      { t: 'ask', q: 'pair-tire' },
      { t: 'ask', q: 'pair-landing' },
      { t: 'note', kind: 'myth', title: 'Do action-reaction forces cancel?', text: 'No. The tire pushes backward on the ground; the ground pushes forward on the tire. Both are real, but only the second acts on the tire. Forces cancel only when they act on the same object.' },
      { t: 'ask', q: 'pairs-cancel' },
      { t: 'level', level: 'engineer', title: 'Then why doesn’t the Earth move?', paras: ['It does, a tiny bit. The ground pushes you forward with the same force you push it back, but a = F ÷ m and Earth’s mass is about 6 × 10²⁴ kg. Its acceleration is far too small to measure.'] }
    ] },
  { id: 'fbd', n: 5, title: 'Free-body diagrams', minutes: 8, hook: 'How do you find every force on a bike?',
    graded: ['fbd-flat', 'fbd-climb', 'fbd-brake', 'fbd-downhill', 'slope-components'],
    blocks: [
      { t: 'p', text: 'A free-body diagram draws one object (or system) on its own, with an arrow for every external force on it. Then the net force, and the acceleration, are easy to work out.' },
      { t: 'table', head: ['Force', 'Symbol', 'On the bike'], rows: [
        ['Gravity', 'Fg', 'Earth pulls the rider and bike straight down.'], ['Normal force', 'FN', 'The trail pushes perpendicular to its surface.'], ['Friction', 'Ff', 'The ground grips the tires to drive or brake.'],
        ['Air resistance', 'Fair', 'Air opposes your motion.'], ['Spring force', 'Fs', 'The suspension pushes back when compressed.'], ['Applied force', 'Fapp', 'An outside push, like a friend shoving you off.']] },
      { t: 'note', kind: 'key', title: 'Inside or outside the system?', text: 'Take the rider and bike as one system. Your feet on the pedals, the chain, the suspension spring: those forces act between parts of the system, so they’re internal and stay off the diagram. The outside force that drives you comes from the ground.' },
      { t: 'visual', id: 'fbd-flat' },
      { t: 'p', text: 'On a flat trail at constant speed, up balances down and forward balances backward: net force zero. Accelerating, the forward push is bigger; braking, the net force points backward.' },
      { t: 'visual', id: 'fbd-climb' },
      { t: 'p', text: 'On a slope, gravity still points straight down. Split it into two parts: one along the slope, pulling you back down the hill, and one into the slope, which the normal force balances.' },
      { t: 'eq', eq: 'Fg∥ = mg sin θ     Fg⊥ = mg cos θ', where: [['θ', 'the slope angle'], ['Fg∥', 'gravity along the slope'], ['Fg⊥', 'gravity into the slope (balanced by N)']] },
      { t: 'level', level: 'explore', title: 'In plain words', paras: ['Steeper trail, bigger sin θ: more of your weight drags you backward. That’s why steep climbs need so much more effort for the same speed.'] },
      { t: 'level', level: 'engineer', title: 'Why sin for along the slope?', paras: ['Tilt your axes so x runs along the slope. The angle between gravity and the y-axis (perpendicular to the slope) equals the slope angle θ, so gravity’s components are mg sin θ along x and mg cos θ along y.', 'At θ = 0 these give 0 and mg (flat ground); at θ = 90° they give mg and 0 (a vertical wall).'] },
      { t: 'ask', q: 'slope-components' },
      { t: 'activity', id: 'fbd-builder' }
    ] },
  { id: 'force-lab', n: 6, title: 'The MTB Force Lab', minutes: 15, hook: 'Change the forces, then ride.',
    graded: ['lab-steady', 'lab-coast', 'lab-zero-climb', 'lab-accel', 'lab-mass', 'lab-pair'],
    blocks: [
      { t: 'p', text: 'Set the forces on the rider-bike system and ride. The free-body diagram, the numbers and the graphs all come from the same equations: F_net = F_traction − F_braking − F_resistance − mg sin θ, and a = F_net ÷ m.' },
      { t: 'activity', id: 'force-lab' }
    ] },
  { id: 'check', n: 7, title: 'Knowledge check and final challenge', minutes: 8, hook: 'Can you accelerate uphill?',
    graded: [...CHECK_IDS, 'final-fbd', 'final-calc'],
    blocks: [{ t: 'activity', id: 'knowledge-check' }, { t: 'activity', id: 'final-challenge' }, { t: 'activity', id: 'mastery' }] }
];

export const OBJECTIVES = [
  'Define force and identify its units.', 'Explain the difference between mass and weight.', 'Identify scalar and vector quantities.', 'Explain balanced and unbalanced forces.',
  'Describe Newton’s First Law and inertia.', 'Explain how mass affects an object’s resistance to changes in motion.', 'Apply Newton’s Second Law to calculate acceleration, force or mass.',
  'Describe Newton’s Third Law using mountain biking examples.', 'Identify action-reaction force pairs.', 'Construct and interpret basic free-body diagrams.',
  'Identify gravity, normal force, friction and air resistance.', 'Calculate the net force on a mountain bike system.', 'Explain how forces change when riding on an incline.', 'Use mathematical evidence to explain a physical phenomenon.'
];

export const LEVELS = [
  { id: 'explore', name: 'Explore', text: 'Plain-language explanations open, every hint available. New to physics? Start here.' },
  { id: 'apply', name: 'Apply', text: 'The standard lesson: the laws, the equations and multi-step problems.' },
  { id: 'engineer', name: 'Engineer', text: 'Deeper explanations open: components, reference frames, model assumptions.' }
];
