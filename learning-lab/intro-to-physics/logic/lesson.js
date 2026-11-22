// Introduction to Physics (Trail Physics, Unit 1, Module 1): the content,
// as data. From PRDs/introToPhysicsLesson.md. Runs in the lesson kit
// (learning-lab/lesson-kit/), which explains the block types.
//
// Every graded item has a stable `id` that is also its question kind
// ("intro-to-physics:<id>") in the student's account, and `ideas`, which
// content/classes/activities.mjs turns into curriculum skills.
// IDS ARE PERMANENT once students have answered them.
//
// No equations are tested here: this lesson is about what physics studies
// and how physicists investigate. The maths comes in later modules.

const ch = (id, text, correct, feedback, code) => ({ id, text, correct: !!correct, feedback, code });

// ------------------------------------------------------------ the scene
// Find the Physics (PRD 4.3): eight hotspots on the trail picture.
// x, y are percentages of the picture (components/scene.js draws it).
export const HOTSPOTS = [
  { id: 'mountain', label: 'The mountain', x: 13, y: 14, concept: 'Energy',
    q: 'How does elevation give you energy?', text: 'Up high, you and your bike have gravitational potential energy. Ride down and some of it becomes speed.', module: 'Module 10: Energy and Gravitation' },
  { id: 'rider', label: 'The rider', x: 41, y: 37, concept: 'Matter and mass',
    q: 'How does mass change how fast you can speed up?', text: 'More mass takes more force to speed up or slow down. Physicists call that inertia.', module: 'Module 7: Newton’s Laws' },
  { id: 'front-wheel', label: 'Front wheel', x: 50, y: 73, concept: 'Rotation',
    q: 'Why does a spinning wheel keep spinning?', text: 'A rotating wheel resists changes to its spin, just as a moving bike resists changes to its motion.', module: 'Module 13: Rotational Dynamics' },
  { id: 'tires', label: 'Tires', x: 24, y: 86, concept: 'Friction',
    q: 'How does a tire grip the dirt?', text: 'Friction between rubber and trail lets the tire push on the ground, and the ground push back to drive you forward.', module: 'Module 8: Friction, Slopes and Springs' },
  { id: 'suspension', label: 'Suspension fork', x: 46, y: 60, concept: 'Springs and oscillations',
    q: 'How does a spring soak up a hit?', text: 'Compressing a spring stores energy. Let go and it pushes back, and can bounce.', module: 'Module 15: Oscillations' },
  { id: 'brakes', label: 'Brakes', x: 27, y: 71, concept: 'Friction and heat',
    q: 'How does braking change your motion?', text: 'Brake pads grip the rotor. Your motion slows, and its energy becomes heat.', module: 'Module 17: Thermodynamics' },
  { id: 'berm', label: 'The berm', x: 66, y: 58, concept: 'Circular motion',
    q: 'Why do you lean into a corner?', text: 'Turning needs a push toward the centre of the turn. Leaning and a banked berm help supply it.', module: 'Module 9: Uniform Circular Motion' },
  { id: 'jump', label: 'The jump', x: 85, y: 50, concept: 'Projectile motion',
    q: 'Why does a rider follow a curve through the air?', text: 'Once you leave the lip, gravity pulls you down while you keep moving forward: the path is a curve called a parabola.', module: 'Module 6: Projectile Motion' }
];

// One Ride, Seven Physics Lessons (PRD 5.2). x is a percentage along the trail picture.
export const STAGES = [
  { id: 'top', n: 1, title: 'Starting at the top', x: 7, happening: 'You and your bike are stopped at the top of the mountain.',
    concepts: ['Gravitational potential energy', 'Mass', 'Gravity', 'Equilibrium'],
    mtb: 'Being high up gives the rider-bike system gravitational potential energy compared with anywhere lower down. Stopped, the forces on you balance.',
    investigate: 'How much higher would you need to start to reach twice the speed at the bottom?' },
  { id: 'start', n: 2, title: 'Starting to move', x: 20, happening: 'You start pedalling and roll forward.',
    concepts: ['Applied force', 'Newton’s laws', 'Acceleration', 'Friction'],
    mtb: 'Your push on the pedals turns the rear wheel, and the ground’s push on the tire gives the forward force that speeds you up.',
    investigate: 'Does a heavier rider need a harder push to get going at the same rate?' },
  { id: 'descend', n: 3, title: 'Descending the trail', x: 36, happening: 'You gain speed as you head downhill.',
    concepts: ['Potential energy', 'Kinetic energy', 'Energy transformation', 'Air resistance'],
    mtb: 'Height turns into speed: gravitational potential energy becomes kinetic energy, and some is lost to heat, sound and air resistance.',
    investigate: 'Why doesn’t all of your height turn into speed?' },
  { id: 'berm', n: 4, title: 'Entering a berm', x: 52, happening: 'You lean into the turn and follow a curved path.',
    concepts: ['Circular motion', 'Centripetal acceleration', 'Friction', 'Geometry'],
    mtb: 'Following a curve needs an acceleration toward the centre of the turn. The tire-ground push and the banked berm supply it.',
    investigate: 'Why does a wider line through the berm let you carry more speed?' },
  { id: 'jump', n: 5, title: 'Approaching a jump', x: 67, happening: 'You compress into the takeoff and launch into the air.',
    concepts: ['Force', 'Elastic energy', 'Projectile motion', 'Gravity'],
    mtb: 'The bike pushes on the lip, the lip pushes back, then in the simple model you fly as a projectile with only gravity acting.',
    investigate: 'What happens to your distance if you hit the lip a little faster?' },
  { id: 'land', n: 6, title: 'Landing', x: 80, happening: 'Your tires hit the landing and your suspension compresses.',
    concepts: ['Momentum', 'Impulse', 'Spring forces', 'Energy transfer'],
    mtb: 'The ground pushes on the tires and changes your motion; the suspension stores some of the energy and gives it back.',
    investigate: 'Why does a longer, smoother landing feel softer?' },
  { id: 'brake', n: 7, title: 'Braking', x: 93, happening: 'You squeeze the brakes before the next corner.',
    concepts: ['Friction', 'Deceleration', 'Energy transformation', 'Thermal energy'],
    mtb: 'Braking forces slow the bike, and its kinetic energy becomes heat in the rotors and pads.',
    investigate: 'Where does all that speed actually go when you brake?' }
];

// Classify the Physics (PRD 6.5). fits = categories that clearly apply;
// also = defensible extras (accepted, with a note).
export const CATEGORIES = { matter: 'Matter', energy: 'Energy', motion: 'Motion', interaction: 'Interaction' };
export const CLASSIFY = {
  'classify-fork': { scenario: 'A rider’s suspension fork compresses as the front wheel lands.', fits: ['matter', 'energy', 'motion', 'interaction'], also: [],
    why: { matter: 'The fork, its spring and its oil are matter with properties that decide how it behaves.', energy: 'The spring stores elastic energy as it compresses.', motion: 'Parts of the fork move: it gets shorter.', interaction: 'The ground pushes on the wheel, and the wheel on the fork.' } },
  'classify-descent': { scenario: 'A rider travels down a steep hill and gains speed.', fits: ['motion', 'energy', 'interaction'], also: ['matter'],
    why: { motion: 'Speed and position are changing.', energy: 'Height (potential energy) is becoming speed (kinetic energy).', interaction: 'Gravity and the trail act on the rider and bike.', matter: 'True, the rider and bike are matter, but it isn’t what this scenario is about.' } },
  'classify-tire': { scenario: 'A tire pushes against the trail.', fits: ['matter', 'interaction'], also: ['motion'],
    why: { matter: 'Rubber and dirt are matter with different properties: soft, grippy, loose.', interaction: 'The tire pushes the trail and the trail pushes back.', motion: 'If the bike is rolling, there’s motion too, but the push itself is an interaction.' } },
  'classify-brakes': { scenario: 'The brake rotor gets hot on a long descent.', fits: ['energy', 'interaction', 'matter'], also: ['motion'],
    why: { energy: 'The bike’s kinetic energy becomes thermal energy.', interaction: 'The pads grip the rotor.', matter: 'The rotor and pads are matter that heats up.', motion: 'The bike slows, so motion changes too.' } },
  'classify-berm': { scenario: 'A rider leans into a berm and changes direction.', fits: ['motion', 'interaction'], also: ['energy'],
    why: { motion: 'The direction of travel changes.', interaction: 'The berm and tires push the rider toward the centre of the turn.', energy: 'The rider’s speed may barely change, so energy isn’t the main idea here.' } }
};

// Choose Your System (PRD 7.3). required = must be in the system;
// optional = fine either way; everything else is the surroundings.
export const SYSTEMS = {
  'system-fork': { question: 'You’re studying how a suspension fork compresses when the bike lands a jump.',
    objects: { fork: 'Fork legs (stanchions and lowers)', spring: 'Fork spring', damper: 'Fork damper oil', wheel: 'Front wheel', rider: 'Rider', frame: 'Frame', trail: 'Landing', air: 'Air' },
    required: ['fork', 'spring', 'damper'], optional: ['wheel'],
    outside: 'From outside the system: the landing pushes up on the wheel and the wheel on the fork; the rider and frame push down from above. The fork squeezes between the two.',
    notes: { wheel: 'The wheel could go either way. Leaving it out means its push on the fork is an outside force.', rider: 'The rider pushes down through the bars, but isn’t what you’re studying.', frame: 'The frame holds the fork but doesn’t compress with it.', trail: 'The landing is what pushes on the wheel: surroundings.', air: 'Air barely matters to how the fork compresses.' } },
  'system-rider': { question: 'You’re studying how gravity affects the rider and bike together on a descent.',
    objects: { rider: 'Rider', bike: 'Bike', trail: 'Trail', earth: 'Earth', air: 'Air', trees: 'Trees beside the trail' },
    required: ['rider', 'bike'], optional: [],
    outside: 'From outside the system: Earth pulls the rider and bike down (gravity), the trail pushes up and grips the tires, and the air pushes back.',
    notes: { trail: 'The trail interacts with the system from outside.', earth: 'Earth’s gravity is the outside pull you’re studying.', air: 'Air pushes on the system from outside.', trees: 'The trees don’t interact with the rider here (we hope).' } },
  'system-tire': { question: 'You’re studying how the tire grips the trail.',
    objects: { tire: 'Tire', rim: 'Wheel rim', trail: 'Trail surface', rider: 'Rider', air: 'Air' },
    required: ['tire'], optional: ['rim'],
    outside: 'From outside the system: the trail surface pushes up on the tire and grips it sideways and along the trail; the rim presses down on it if it’s left out.',
    notes: { rim: 'Including the rim is fine; leaving it out makes its push on the tire an outside force.', trail: 'The trail is the surface the tire grips: surroundings.', rider: 'The rider’s weight reaches the tire through the bike, from outside.', air: 'Air inside the tire matters to pressure, but the outside air isn’t part of this question.' } }
};

// Real world vs. physics model (PRD 7.6).
export const MODEL_FACTORS = [
  ['drag', 'Aerodynamic drag', true], ['body', 'Rider body movement', true], ['suspension', 'Suspension movement', true], ['wheels', 'Wheel rotation', true],
  ['gravity', 'Gravity', false], ['velocity', 'Initial velocity', false], ['horizontal', 'Horizontal motion', false]
];

// Observation, explanation or prediction? (PRD 8.4)
export const STATEMENTS = [
  ['s1', 'The fork gets shorter when the front wheel hits the bump.', 'observation'],
  ['s2', 'The ground pushes up on the wheel, and that compresses the fork’s spring.', 'explanation'],
  ['s3', 'A bigger bump at the same speed will compress the fork further.', 'prediction'],
  ['s4', 'My GPS showed 32 km/h at the bottom of the descent.', 'observation'],
  ['s5', 'The bike speeds up downhill because part of gravity pulls it along the slope.', 'explanation'],
  ['s6', 'If I don’t brake on the steeper section, I’ll be going faster at the bottom.', 'prediction']
];
export const STATEMENT_KINDS = { observation: 'Observation', explanation: 'Explanation', prediction: 'Prediction' };

// Design Your Own MTB Experiment (PRD 8.5).
export const DESIGN = {
  question: 'What happens to a mountain bike’s acceleration when the trail gets steeper?',
  iv: [['angle', 'Trail angle', true], ['accel', 'Acceleration', false], ['mass', 'Rider and bike mass', false], ['pressure', 'Tire pressure', false]],
  dv: [['accel', 'Acceleration', true], ['angle', 'Trail angle', false], ['surface', 'Trail surface', false], ['mass', 'Rider and bike mass', false]],
  controls: [['mass', 'Rider and bike mass', true], ['speed', 'Starting speed', true], ['surface', 'Trail surface', true], ['distance', 'Distance travelled', true], ['pressure', 'Tire pressure', true],
    ['angle', 'Trail angle', false], ['accel', 'Acceleration', false]],
  predictions: [['up', 'Acceleration increases as the trail gets steeper', true], ['down', 'Acceleration decreases as the trail gets steeper', false], ['same', 'Steepness makes no difference', false]]
};

// The branches of physics (PRD 9). labs: ids from Physics’ lab library
// (content/classes/physics.mjs); LIVE says where the live ones are.
export const BRANCHES = [
  { id: 'mechanics', name: 'Mechanics', studies: 'Motion, forces and how objects behave.', mtb: ['Accelerating down a trail', 'Newton’s laws', 'Jump trajectories', 'Cornering', 'Momentum', 'Suspension'],
    q: 'Why does a heavier rider need more force to speed up?', labs: [['trail-speed-lab', 'Trail Speed Lab'], ['jump-lab', 'Jump Lab'], ['berm-lab', 'Berm Lab'], ['force-lab', 'MTB Force Lab'], ['impact-lab', 'MTB Impact Lab']] },
  { id: 'energy', name: 'Energy & thermodynamics', studies: 'Energy, work, power, heat, and how energy moves.', mtb: ['Descending a mountain', 'Climbing', 'Braking', 'Suspension energy', 'Heat from friction'],
    q: 'How many watts does it take to get up a climb?', labs: [['trail-energy-lab', 'Trail Energy Lab'], ['power-lab', 'MTB Power Lab'], ['brake-heat-lab', 'Brake Heat Lab']] },
  { id: 'rotation', name: 'Rotational mechanics', studies: 'Things that spin, and the forces and torques that turn them.', mtb: ['Wheels', 'Cranks and chainrings', 'Cassettes', 'Brake rotors', 'The drivetrain'],
    q: 'Why does an easy gear make climbing feel lighter but slower?', labs: [['wheel-gear-lab', 'Wheel & Gear Lab']] },
  { id: 'fluids', name: 'Fluid mechanics', studies: 'Liquids and gases: pressure and flow.', mtb: ['Hydraulic brakes', 'Suspension oil', 'Air springs', 'Tire pressure', 'Air resistance'],
    q: 'How does a light squeeze on a lever stop a whole bike?', labs: [['hydraulic-brake-lab', 'Hydraulic Brake Lab']] },
  { id: 'waves', name: 'Waves & oscillations', studies: 'Repeating motion, vibration and waves.', mtb: ['Suspension bouncing', 'Vibration through the bike', 'Resonance', 'The sound of a bike'],
    q: 'Why does a fork bounce back, and how fast?', labs: [['suspension-lab', 'Suspension Lab'], ['wave-lab', 'Vibration & Wave Lab']] },
  { id: 'em', name: 'Electricity & magnetism', studies: 'Charges, circuits, magnetic fields and electromagnetism.', mtb: ['E-bike motors', 'Batteries', 'Speed sensors', 'Bike lights', 'Wireless bike computers'],
    q: 'How does a magnet on a spoke measure your speed?', labs: [['ebike-battery-lab', 'E-Bike Battery Lab'], ['circuit-lab', 'Circuit Lab'], ['magnetic-motor-lab', 'Magnetic Motor Lab'], ['generator-lab', 'Generator Lab']] },
  { id: 'optics', name: 'Optics', studies: 'Light, and how it meets materials, lenses and eyes.', mtb: ['Eyewear', 'Bike lights', 'Reflectors', 'Lenses', 'Action cameras'],
    q: 'Why do polarized lenses cut glare off a wet trail?', labs: [['light-lens-lab', 'Light & Lens Lab'], ['vision-lab', 'Vision Lab'], ['light-wave-lab', 'Light Wave Lab']] }
];
// Live labs, relative to this lesson (check-site.mjs keeps this in step with physics.mjs).
export const LIVE = { 'jump-lab': '../jump-lab/', 'berm-lab': '../berm-lab/', 'force-lab': '../newtons-laws/#force-lab' };

// Physics Detective (PRD 11): pick at least one concept for each stage.
export const DETECTIVE_STAGES = [
  { id: 'descend', title: 'Descending', options: [['pe-ke', 'Potential energy becoming kinetic energy', true], ['gravity', 'Gravity', true], ['air', 'Air resistance', true], ['optics', 'Reflection of light', false]] },
  { id: 'accelerate', title: 'Accelerating', options: [['force', 'Forces and Newton’s laws', true], ['friction', 'Tire-ground friction', true], ['magnet', 'Magnetism', false], ['mass', 'Mass and inertia', true]] },
  { id: 'corner', title: 'Cornering', options: [['circular', 'Circular motion', true], ['friction', 'Friction', true], ['sound', 'Sound waves', false], ['lean', 'Leaning and force components', true]] },
  { id: 'jump', title: 'Jumping', options: [['projectile', 'Projectile motion', true], ['gravity', 'Gravity', true], ['circuits', 'Electric circuits', false], ['spring', 'Suspension and spring energy', true]] },
  { id: 'brake', title: 'Braking', options: [['friction', 'Friction', true], ['heat', 'Energy becoming heat', true], ['decel', 'Deceleration', true], ['light', 'Light waves', false]] }
];
export const DETECTIVE_PARTS = [
  ['identify', 'Part A · Identify', 'Name three physical phenomena happening during your ride.'],
  ['investigate', 'Part B · Investigate', 'Choose one and write a scientific question about it.'],
  ['predict', 'Part C · Predict', 'What would happen if you changed one variable?'],
  ['explain', 'Part D · Explain', 'Which physics concepts could explain your prediction?'],
  ['reflect', 'Part E · Reflect', 'Why might learning physics help you understand mountain biking?']
];
// Words that show a physics idea is being used (for encouraging feedback only).
export const CONCEPT_WORDS = ['force', 'gravity', 'energy', 'potential', 'kinetic', 'friction', 'mass', 'inertia', 'acceleration', 'accelerate', 'speed', 'velocity', 'momentum', 'spring', 'heat', 'thermal',
  'projectile', 'circular', 'centripetal', 'pressure', 'drag', 'air resistance', 'newton', 'motion', 'traction', 'angle', 'slope', 'grip', 'rotation', 'torque', 'wave', 'vibration'];

// ------------------------------------------------------------ questions
export const QUESTIONS = {
  // Section 1
  'find-physics': { type: 'task', ideas: ['physics-of-the-bike'], prompt: 'Find the Physics: explore all eight spots on the trail.' },
  'what-is-physics-quick': { type: 'choice', ideas: ['what-physics'], prompt: 'Which of these is a question physics can answer?',
    options: [ch('a', 'Why does a bike slow down when you stop pedalling?', true, 'Yes: it’s about motion and forces, so physics can explain and predict it.'),
      ch('b', 'Which trail is the most fun?', false, 'That’s a matter of opinion, not something you can measure and test.', 'opinion'),
      ch('c', 'What colour helmet looks best?', false, 'A question of taste: physics studies how the physical world behaves.', 'opinion')],
    solution: 'Physics answers questions about matter, energy, motion and interactions that we can observe, measure and test. Opinions and preferences aren’t physics.' },
  // Section 2
  'ride-stages': { type: 'task', ideas: ['physics-of-the-bike', 'phenomena'], prompt: 'One Ride, Seven Physics Lessons: open all seven stages.' },
  'ride-projectile': { type: 'choice', ideas: ['phenomena'], prompt: 'At which stage of the ride does projectile motion matter most?',
    options: [ch('a', 'Starting at the top', false, 'Stopped at the top, nothing is flying yet.'), ch('b', 'Approaching a jump and flying off it', true, 'Off the lip, gravity curves your path through the air: projectile motion.'),
      ch('c', 'Braking', false, 'Braking is about friction and slowing down, with both wheels on the ground.')],
    solution: 'A projectile is something moving through the air with gravity acting on it. That’s you, after the lip of a jump.' },
  'ride-energy': { type: 'choice', ideas: ['matter-energy', 'phenomena'], prompt: 'Where in the ride does height turn into speed?',
    options: [ch('a', 'Descending the trail', true, 'Going down, gravitational potential energy becomes kinetic energy.'), ch('b', 'Braking', false, 'Braking turns speed into heat, not height into speed.'),
      ch('c', 'Starting at the top', false, 'At the top you have the height, but you aren’t moving yet.')],
    solution: 'Descending turns gravitational potential energy (height) into kinetic energy (speed), with some lost as heat and sound.' },
  // Section 3
  ...Object.fromEntries(Object.keys(CLASSIFY).map(id => [id, { type: 'classify', ideas: ['matter-energy'], prompt: CLASSIFY[id].scenario }])),
  // Section 4
  ...Object.fromEntries(Object.keys(SYSTEMS).map(id => [id, { type: 'system', ideas: ['systems'], prompt: SYSTEMS[id].question }])),
  'model-simplify': { type: 'multi', ideas: ['models'], prompt: 'Which factors did the simplified model leave out to make the jump easier to study?' },
  'model-why': { type: 'choice', ideas: ['models'], prompt: 'Jump Lab ignores air resistance. Is that a mistake?',
    options: [ch('a', 'Yes: a model should include everything', false, 'A model that includes everything is as complicated as the real world, and no easier to understand.', 'perfect-model'),
      ch('b', 'No: it’s a choice that makes the problem manageable, and we should know when it matters', true, 'Exactly: every model simplifies. The skill is knowing what was left out and when it starts to matter.'),
      ch('c', 'No: air resistance doesn’t exist on a bike', false, 'It does: you feel it on every fast descent. The model chooses to leave it out.')],
    solution: 'Simplifying assumptions aren’t mistakes. They’re decisions that make a problem manageable. A good physicist knows what a model leaves out, and when that starts to matter (a big, fast jump has more drag than a small one).' },
  // Section 5
  'obs-sort': { type: 'sort', ideas: ['observation-explanation'], prompt: 'Sort each statement: observation, explanation or prediction?' },
  'hypothesis-prediction': { type: 'choice', ideas: ['investigation'], prompt: 'Which one is a hypothesis rather than a prediction?',
    options: [ch('a', 'A steeper trail makes a bike speed up faster because more of gravity pulls along the slope.', true, 'A hypothesis is a testable idea that includes a reason: “because…”.'),
      ch('b', 'If I double the slope angle, I’ll reach the bottom sooner.', false, 'That’s a prediction: what you expect to observe if your idea is right.', 'prediction'),
      ch('c', 'The bike went faster on the steeper trail.', false, 'That’s an observation: something you saw or measured.', 'observation')],
    solution: 'A hypothesis proposes an explanation you can test. A prediction says what you’ll observe if the hypothesis is right. An observation is what actually happened.' },
  'design-experiment': { type: 'design', ideas: ['investigation'], prompt: DESIGN.question },
  // Section 6
  'branches': { type: 'task', ideas: ['branches'], prompt: 'Explore all seven branches of physics.' },
  'branch-match': { type: 'choice', ideas: ['branches'], prompt: 'Which branch of physics explains why a suspension fork bounces back after a hit?',
    options: [ch('a', 'Optics', false, 'Optics is about light.'), ch('b', 'Waves & oscillations', true, 'A spring and a mass bouncing is an oscillation.'), ch('c', 'Electricity & magnetism', false, 'There’s no circuit in a coil-sprung fork.'), ch('d', 'Fluid mechanics', false, 'Close: the damper oil is fluid mechanics, but the bounce itself is an oscillation.', 'close')],
    solution: 'Bouncing back and forth is an oscillation. (The oil that slows the bounce down is fluid mechanics: real systems often involve more than one branch.)' },
  // Section 7: the PRD’s knowledge check
  'kc-1': { type: 'choice', check: true, ideas: ['what-physics'], prompt: 'Which statement best describes physics?',
    options: [ch('a', 'The study of living organisms', false, 'That’s biology.'), ch('b', 'The study of matter, energy, motion and interactions', true, 'That’s physics: how the physical world behaves.'), ch('c', 'The study of historical events', false, 'That’s history.'), ch('d', 'The study of chemical reactions only', false, 'That’s chemistry, and physics covers much more than reactions.')],
    solution: 'Physics helps us understand how the physical world behaves, from moving objects to energy and interactions.' },
  'kc-2': { type: 'choice', check: true, ideas: ['phenomena'], prompt: 'Which of the following is an example of physics?',
    options: [ch('a', 'A bike accelerating downhill', true, 'Acceleration is a physical phenomenon: velocity changing.'), ch('b', 'A rider choosing a favourite trail', false, 'A preference, not a physical phenomenon.', 'opinion'), ch('c', 'A rider choosing a helmet colour', false, 'A choice of taste.', 'opinion'), ch('d', 'A rider deciding where to meet friends', false, 'A plan, not physics.', 'opinion')],
    solution: 'Acceleration is a physical phenomenon involving changes in velocity.' },
  'kc-3': { type: 'choice', check: true, ideas: ['matter-energy'], prompt: 'A rider travels from the top of a mountain toward a lower point. Which statement best describes the energy involved?',
    options: [ch('a', 'Energy disappears as the rider descends', false, 'Energy is never destroyed: it changes form.', 'energy-lost'), ch('b', 'Gravitational potential energy can become kinetic energy and other forms', true, 'Height becomes speed, plus some heat and sound.'),
      ch('c', 'The rider creates energy from nothing', false, 'Energy can’t be created from nothing.'), ch('d', 'Gravity stops acting once the bike moves', false, 'Gravity acts the whole way down.')],
    solution: 'As the rider descends, gravitational potential energy is transformed into kinetic energy and other forms such as heat and sound. The total is conserved.' },
  'kc-4': { type: 'choice', check: true, ideas: ['systems'], prompt: 'A physicist wants to study how a suspension fork compresses. What is an example of a possible system?',
    options: [ch('a', 'The entire mountain range', false, 'Far too much: choose only what the question is about.'), ch('b', 'The suspension fork and its relevant components', true, 'The system is what you choose to study.'), ch('c', 'The weather forecast', false, 'Not a physical object involved here.'), ch('d', 'A different bicycle on another trail', false, 'That bike isn’t part of this question.')],
    solution: 'A physical system is the object or collection of objects selected for investigation: here, the fork and its parts.' },
  'kc-5': { type: 'choice', check: true, ideas: ['models'], prompt: 'Why do physicists use models?',
    options: [ch('a', 'To make every calculation unnecessarily complicated', false, 'Models do the opposite: they simplify.'), ch('b', 'To represent and investigate real-world systems using simplified descriptions', true, 'Simplify, understand, predict, and know the limits.'),
      ch('c', 'To avoid making observations', false, 'Models are tested against observations.'), ch('d', 'To guarantee every prediction is perfectly accurate', false, 'No model is perfect: each has limitations.', 'perfect-model')],
    solution: 'Models are simplified representations that help explain and predict real-world behaviour. Every model has limits.' },
  'kc-6': { type: 'choice', check: true, ideas: ['investigation'], prompt: 'You want to find out how slope steepness affects mountain bike acceleration. What is the independent variable?',
    options: [ch('a', 'Rider mass', false, 'Mass should be kept the same: a controlled variable.', 'control'), ch('b', 'Trail angle', true, 'You change the angle on purpose.'), ch('c', 'Acceleration', false, 'That’s what you measure: the dependent variable.', 'dependent'), ch('d', 'Starting speed', false, 'Keep that the same: a controlled variable.', 'control')],
    solution: 'The independent variable is the one you change on purpose: the trail angle. Acceleration is what you measure (dependent); mass and starting speed are kept the same (controlled).' },
  'kc-7': { type: 'choice', check: true, ideas: ['observation-explanation'], prompt: 'You watch a suspension fork compress when a bike lands. Which statement is an observation rather than an explanation?',
    options: [ch('a', 'The suspension spring stores elastic potential energy', false, 'That explains what’s happening using a physics idea.', 'explanation'), ch('b', 'The landing forces cause the compression', false, 'That’s an explanation: it gives a cause.', 'explanation'),
      ch('c', 'The fork becomes shorter as it compresses', true, 'You can see and measure it: an observation.'), ch('d', 'The suspension responds because of Newton’s laws', false, 'That’s an explanation using a physical principle.', 'explanation')],
    solution: 'An observation is what you can see or measure (the fork gets shorter). Explanations interpret it using physics (forces, energy, Newton’s laws).' },
  'kc-8': { type: 'choice', check: true, ideas: ['branches'], prompt: 'Which branch of physics helps explain how hydraulic mountain bike brakes work?',
    options: [ch('a', 'Optics', false, 'Optics is about light.'), ch('b', 'Fluid mechanics', true, 'Hydraulic brakes push pressure through fluid.'), ch('c', 'Astronomy', false, 'Astronomy studies space.'), ch('d', 'Wave optics', false, 'That’s light as a wave.')],
    solution: 'Hydraulic brakes transmit pressure through brake fluid: fluid mechanics.' },
  // Final challenge
  'detective-stages': { type: 'detective', ideas: ['phenomena', 'physics-of-the-bike'], prompt: 'Physics Detective: identify at least one physics concept at each stage of your ride.' },
  'detective-writeup': { type: 'writeup', ideas: ['investigation', 'phenomena'], prompt: 'Physics Detective: identify, investigate, predict, explain and reflect.' }
};
export const CHECK_IDS = Object.keys(QUESTIONS).filter(id => QUESTIONS[id].check);
export function questionKinds() { return Object.fromEntries(Object.entries(QUESTIONS).map(([id, q]) => [id, q.ideas])); }

// ------------------------------------------------------------ sections
export const SECTIONS = [
  { id: 'what-is-physics', n: 1, title: 'What is physics?', minutes: 5, hook: 'Have you ever wondered why your mountain bike does the things it does?',
    graded: ['find-physics', 'what-is-physics-quick'],
    blocks: [
      { t: 'p', text: 'Why does your bike speed up when you pedal, and slow down when you stop? Why do you lean into a corner? Why does your fork squash on a landing? Why does a rock feel so different at 10 km/h than at 30?' },
      { t: 'p', text: 'They sound unrelated, but they have something in common: physics explains all of them.' },
      { t: 'law', name: 'Physics', text: 'Physics is the branch of science that studies matter, energy, motion, forces and the interactions that explain how the physical world works.' },
      { t: 'p', text: 'It lets us understand and predict how things behave, from the smallest particles to whole galaxies. And you don’t need to look far for examples: your mountain bike is an entire physics laboratory.' },
      { t: 'level', level: 'explore', title: 'In plain words', paras: ['Physics asks how and why things move, push, heat up, bounce and change.', 'If you can see it, measure it and test it, physics can probably say something about it.'] },
      { t: 'cards', items: [
        { h: 'Matter', text: 'Anything that has mass and takes up space.', list: ['Your bike', 'Your body', 'The trail', 'Rocks, trees, water, air'], mtb: 'Frame, tires, suspension and dirt are all matter, each with different properties.' },
        { h: 'Energy', text: 'What lets a system make changes happen: speed things up, heat them, lift them.', list: ['Kinetic', 'Gravitational potential', 'Elastic potential', 'Thermal', 'Electrical'], mtb: 'At the top of a mountain you have potential energy; riding down, some of it becomes speed.' },
        { h: 'Motion', text: 'How an object’s position changes over time.', list: ['A bike speeding up', 'A wheel spinning', 'A rider in the air', 'A fork compressing'], mtb: 'On every trail your position, speed and direction keep changing.' },
        { h: 'Interactions', text: 'Objects act on each other: forces, energy transfer, changes in motion.', list: ['Tires and ground', 'Brakes and wheels', 'Spring and bike', 'Gravity and rider'], mtb: 'Your bike is always interacting with the ground, the air, gravity and its own parts.' }] },
      { t: 'activity', id: 'find-physics' },
      { t: 'ask', q: 'what-is-physics-quick' }
    ] },
  { id: 'the-ride', n: 2, title: 'The physics of a ride', minutes: 7, hook: 'How many physics lessons fit into one run down the mountain?',
    graded: ['ride-stages', 'ride-projectile', 'ride-energy'],
    blocks: [
      { t: 'p', text: 'Picture the top of the mountain. You point the bike down the trail and go. Within seconds you speed up, your tires bite the dirt, you lean through a berm, fly off a jump, land, and brake before the next corner.' },
      { t: 'p', text: 'Every one of those moments is physics, and several ideas are at work at the same time. Click each stage of the ride.' },
      { t: 'activity', id: 'ride-journey' },
      { t: 'note', kind: 'key', title: 'It’s all connected', text: 'The same few ideas (energy, forces, motion) keep showing up at every stage. The rest of the course takes them one at a time, then puts them back together.' },
      { t: 'ask', q: 'ride-projectile' },
      { t: 'ask', q: 'ride-energy' }
    ] },
  { id: 'four-ideas', n: 3, title: 'Matter, energy, motion and interactions', navTitle: 'Matter, energy, motion…', minutes: 6, hook: 'How do physicists sort out what’s going on?',
    graded: Object.keys(CLASSIFY),
    blocks: [
      { t: 'cards', items: [
        { h: 'Matter has properties', text: 'Mass, volume, density, shape and what it’s made of decide how an object behaves.', mtb: 'A carbon and an aluminium frame behave differently; the air in a fork is matter too; loam and rock grip differently.' },
        { h: 'Energy moves and changes form', text: 'Potential, kinetic, elastic, thermal, chemical. Energy is transferred and transformed, but the total is conserved.', mtb: 'Your body turns food (chemical energy) into pedalling; descending turns height into speed; springs store energy; brakes turn speed into heat.' },
        { h: 'Motion can be described', text: 'Position, distance, speed, direction, velocity and acceleration.', mtb: 'Riding changes your position; speeding up changes your velocity; cornering changes your direction; wheels spin as you roll.' },
        { h: 'Nothing acts alone', text: 'Objects interact with their surroundings.', mtb: 'When a tire pushes on the ground, the ground pushes back on the tire. That pair is the key to traction (you’ll meet it again in Newton’s third law).' }] },
      { t: 'level', level: 'engineer', title: 'Energy is conserved, so where does it go?', paras: ['On a descent the total energy stays the same, but not all of it ends up as speed. Some heats the tires, brakes and air; some becomes sound.', 'Those “losses” are energy changing into forms that aren’t useful for going faster. You’ll account for them in the Energy and Work modules.'] },
      { t: 'activity', id: 'classify' }
    ] },
  { id: 'systems-models', n: 4, title: 'Systems and models', minutes: 6, hook: 'How do physicists make a complicated situation simple enough to understand?',
    graded: [...Object.keys(SYSTEMS), 'model-simplify', 'model-why'],
    blocks: [
      { t: 'law', name: 'Physical system', text: 'A physical system is the object or collection of objects we choose to study. The surroundings are everything outside it that can interact with it.' },
      { t: 'visual', id: 'system' },
      { t: 'p', text: 'Where you draw the line around the system depends on the question you’re asking. Study the rider and bike together, and the trail, air and Earth are the surroundings. Study only the fork, and even the rider becomes part of the surroundings.' },
      { t: 'activity', id: 'choose-system' },
      { t: 'law', name: 'Scientific model', text: 'A model is a simplified representation of a real system that helps explain or predict how it behaves.' },
      { t: 'cards', items: [
        { h: 'Visual', text: 'A trail map is a model of a real trail.' }, { h: 'Diagram', text: 'A free-body diagram shows the forces on a rider.' },
        { h: 'Mathematical', text: 'An equation predicts how a rider speeds up.' }, { h: 'Computer', text: 'Jump Lab, Berm Lab and the MTB Force Lab are models you can run.' }] },
      { t: 'p', text: 'The real world is complicated: a bike has flexing parts, changing forces and constant interactions. So physicists keep the variables that matter and make simplifying assumptions about the rest. Jump Lab treats you as a projectile after the lip: forward motion plus gravity, no air drag, no body movement. It doesn’t describe every detail of a real jump, but it explains the important relationships.' },
      { t: 'note', kind: 'key', title: 'Every model has limits', text: 'Ask of any model: what does it explain, what does it assume, what does it leave out, and when might it become less accurate?' },
      { t: 'activity', id: 'model-compare' },
      { t: 'ask', q: 'model-why' },
      { t: 'level', level: 'engineer', title: 'When does a model break?', paras: ['Leaving out drag is fine at dirt-jump speeds but worse on a big, fast step-down, where air resistance grows with speed squared.', 'A good test of a model: compare its prediction with a measurement. If they disagree by more than your measurement uncertainty, one of your assumptions matters.'] }
    ] },
  { id: 'investigating', n: 5, title: 'How scientists investigate', minutes: 8, hook: 'Does a bike really go faster down a steeper trail? How would you find out?',
    graded: ['obs-sort', 'hypothesis-prediction', 'design-experiment'],
    blocks: [
      { t: 'p', text: 'You could guess. Or you could change the trail angle, measure what happens, and do it again. Physicists investigate systematically: ask, propose, predict, test, analyze and improve.' },
      { t: 'visual', id: 'workflow' },
      { t: 'example', kicker: 'One investigation, step by step', title: 'Trail steepness and speed', plain: true, steps: [
        ['Ask a question', 'How does trail steepness affect how fast a bike gains speed?'],
        ['Form a hypothesis', 'A steeper trail makes the bike gain speed faster, because more of gravity pulls along the slope.'],
        ['Make a prediction', 'If I increase the slope and keep everything else the same, the acceleration will go up.'],
        ['Design an experiment', 'Decide what to change, what to measure and what to keep the same.'],
        ['Collect evidence', 'Record the trail angle, starting speed, speed after a fixed distance, and time taken.'],
        ['Analyze results', 'Look for a pattern. Does it match the prediction? Could measurement error explain any surprises?'],
        ['Draw a conclusion', 'Say what you found and whether it supports the hypothesis. Then improve the model or test again.']] },
      { t: 'note', kind: 'key', title: 'Not a straight line', text: 'Real science loops back: results often send you back to a better question or a better experiment.' },
      { t: 'cards', items: [
        { h: 'Independent variable', text: 'What you change on purpose.', mtb: 'The trail angle.' },
        { h: 'Dependent variable', text: 'What you measure.', mtb: 'The acceleration.' },
        { h: 'Controlled variables', text: 'Everything you keep the same so the comparison is fair.', mtb: 'Rider and bike mass, starting speed, trail surface, distance, tire pressure.' }] },
      { t: 'p', text: 'Observations are what you see or measure. Explanations use physics to say why. Predictions say what you expect next.' },
      { t: 'activity', id: 'obs-sort' },
      { t: 'ask', q: 'hypothesis-prediction' },
      { t: 'level', level: 'engineer', title: 'Observation or inference?', paras: ['“The fork got shorter” is an observation. “The spring stored energy” is an inference: you didn’t see energy, you reasoned about it from a model.', 'Every measurement also has uncertainty: a stopwatch, a GPS and a timing gate all disagree a little. Module 3 deals with that properly.'] },
      { t: 'activity', id: 'design-experiment' }
    ] },
  { id: 'branches', n: 6, title: 'The branches of physics', minutes: 5, hook: 'Where does everything you’ll study fit?',
    graded: ['branches', 'branch-match'],
    blocks: [
      { t: 'p', text: 'Physics is a big subject, so it’s split into branches that each study a different kind of phenomenon. Every one of them shows up on, or inside, a mountain bike.' },
      { t: 'activity', id: 'branch-map' },
      { t: 'ask', q: 'branch-match' },
      { t: 'p', text: 'And the language all of them share is mathematics. Equations let physicists describe a relationship precisely and predict what will happen. That’s where the next module, the Mathematics Review, picks up.' }
    ] },
  { id: 'check', n: 7, title: 'Knowledge check and final challenge', navTitle: 'Check and challenge', minutes: 7, hook: 'Become a physics detective.',
    graded: [...CHECK_IDS, 'detective-stages', 'detective-writeup'],
    blocks: [{ t: 'activity', id: 'knowledge-check' }, { t: 'activity', id: 'physics-detective' }, { t: 'activity', id: 'mastery' }] }
];

export const OBJECTIVES = [
  'Define physics and explain what it studies.', 'Identify examples of physics in everyday mountain biking.', 'Tell matter, energy, motion and interactions apart.',
  'Identify the physical phenomena happening during a ride.', 'Explain what a physical system is and how it interacts with its surroundings.', 'Explain what a scientific model is and why physicists use models.',
  'Tell observations, explanations and predictions apart.', 'Describe the basic process of a scientific investigation.', 'Identify independent, dependent and controlled variables.',
  'Explain how experiments and evidence help us understand the world.', 'Name the major branches of physics and connect them to mountain biking.', 'Appreciate how mathematics describes physical phenomena.'
];
export const LEVELS = [
  { id: 'explore', name: 'Explore', text: 'Plain-language explanations open. New to physics? Start here.' },
  { id: 'apply', name: 'Apply', text: 'The standard lesson: systems, models, variables and investigations.' },
  { id: 'engineer', name: 'Engineer', text: 'Deeper explanations open: model limits, inference, uncertainty.' }
];

// ------------------------------------------------------------ completion (PRD 14)
export const PASS_CHECK = 0.7;   // at least 70% on the knowledge check
export function mastery(P) {
  const best = P.bestCheck(), s = SECTIONS.map(x => P.sectionState(x.id));
  const criteria = [
    { id: 'sections', label: 'All seven sections complete', met: s.every(x => x.complete), detail: `${s.filter(x => x.complete).length} of 7`, review: [] },
    { id: 'ride', label: 'The ride explored: all seven stages', met: P.done('ride-stages'), review: ['the-ride'] },
    { id: 'check', label: 'At least 70% on the knowledge check (right first try)', met: !!best && best.right / best.total >= PASS_CHECK,
      detail: best ? `Best: ${best.right} of ${best.total}` : 'Not finished yet', review: ['what-is-physics', 'systems-models', 'investigating'] },
    { id: 'detective', label: 'The Physics Detective challenge complete', met: P.done('detective-stages') && P.done('detective-writeup'), review: ['the-ride'] }
  ];
  return { mastered: criteria.every(c => c.met), criteria, best };
}
