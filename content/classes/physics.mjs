// ============================================================
// CLASSES: Physics of the Ride (data only). From PRDs/collegePhysics.md.
//
//   Physics of the Ride (a pathway)
//     -> Course (Trail Physics, Trail Technology)
//       -> Unit (numbered 1–9 across both courses)
//         -> Module (a Classes topic) -> Skills (measurable objectives)
//
// The reference curriculum is CMU's Open Learning Initiative College
// Physics 1 and 2: 28 modules. Every module is listed here even before its
// lesson exists, with a content status (STATUSES below). Only 'published'
// modules are shown to students as finished lessons; the rest say plainly
// that the lesson is still coming.
//
// Same rules as curriculum.mjs: IDS ARE PERMANENT (progress is stored
// against skill ids). Module id = <course id>.<slug>; skill id =
// <module id>.<skill slug>. After editing, run
//   node scripts/build-classes.mjs
//
// Module fields (on top of the usual topic fields slug, title, desc, mtb,
// skills, prereq):
//   hook         the riding question the module starts from (PRD 6.1)
//   concepts     the physics concepts it covers
//   math         the key equations, as plain text
//   experiences  ids from LABS: the interactive activities it will use
//   category     'core' | 'engineering' | 'extension' (PRD 5), for content
//                developers; shown in docs/PHYSICS-ROADMAP.md, not to students
//   status       a key of STATUSES (PRD 11.2)
//   note         optional: what the model assumes, shown on the module page
// ============================================================

export const STATUSES = {
  planned: 'Planned',
  drafting: 'Content drafting',
  visuals: 'Visual development',
  interactive: 'Interactive activity development',
  assessment: 'Assessment development',
  review: 'Review',
  published: 'Published'
};

export const CATEGORIES = {
  core: 'Core MTB physics',
  engineering: 'Bike engineering',
  extension: 'Science extension'
};

export const PATHWAY = {
  id: 'physics-of-the-ride',
  slug: 'physics-of-the-ride',
  name: 'Physics of the Ride',
  card: 'A complete physics pathway taught through mountain biking: motion, jumps, cornering, energy, suspension and brakes, then the electricity, magnetism and optics inside modern bikes.',
  description: 'Physics of the Ride: a complete physics curriculum taught through mountain biking, from kinematics and projectile motion to circuits and optics. Two courses, nine units, 28 modules.',
  intro: 'Why does a bigger jump send you farther? Why does a wider line through a berm carry more speed? Where does your speed go when you brake? Start with the ride, make a prediction, then find the physics that explains it.',
  reference: 'Modelled on Carnegie Mellon University’s Open Learning Initiative College Physics 1 and 2.'
};

// The interactive activities the modules use (PRD 4 and 7). `flagship`
// marks the 23 labs of the PRD's lab library. `activity` names an entry in
// activities.mjs once a lab exists; the rest are planned.
export const LABS = [
  { id: 'bike-anatomy', name: 'The Physics of a Mountain Bike', desc: 'Select a part of the bike (wheels, tires, suspension, brakes, drivetrain or frame) and see the physics it runs on.' },
  { id: 'math-toolkit', name: 'MTB Math Toolkit', flagship: true, desc: 'A practice area used across every module: rearranging equations, unit conversions, ratios, right triangles, basic trig and reading graphs.' },
  { id: 'trail-measurement-lab', name: 'Trail Measurement Lab', desc: 'Pick a measurement task (a jump’s height, a timing-gate speed, a slope’s grade, suspension travel) and work with real-looking data, units and uncertainty.' },
  { id: 'trail-speed-lab', name: 'Trail Speed Lab', flagship: true, desc: 'Control a rider on a straight trail (start, speed, acceleration, braking) and watch live position-, velocity- and acceleration-time graphs.' },
  { id: 'vector-lab', name: 'Vector Lab', flagship: true, desc: 'Add, subtract and resolve vectors on a trail map, and find the resultant of a ride in two directions.' },
  { id: 'jump-lab', name: 'Jump Lab', flagship: true, activity: 'jump-lab', desc: 'Set the speed, angle and heights of a jump, predict the landing, send it, and check the projectile-motion maths.' },
  { id: 'force-lab', name: 'MTB Force Lab', flagship: true, desc: 'Adjust pedalling force, braking, rolling resistance, gravity and mass, and watch a live free-body diagram, net force and acceleration.' },
  { id: 'traction-lab', name: 'Traction Lab', flagship: true, desc: 'Explore friction between tire and trail with a simplified model: normal force, coefficient of friction, and where grip runs out.' },
  { id: 'incline-lab', name: 'Incline Lab', desc: 'Resolve the forces on a rider climbing or descending a slope.' },
  { id: 'suspension-lab', name: 'Suspension Lab', flagship: true, desc: 'Change spring stiffness, moving mass and initial compression, and watch an ideal spring-mass system oscillate; damping comes as a separate, advanced model.' },
  { id: 'berm-lab', name: 'Berm Lab', flagship: true, activity: 'berm-lab', desc: 'Pick a tight, middle or wide line, set the speed, bank the berm, and see the forces, lean and grip demand of a corner.' },
  { id: 'trail-energy-lab', name: 'Trail Energy Lab', flagship: true, desc: 'Shape a trail profile, set the start height, mass and speed, add losses, and watch potential, kinetic and elastic energy trade places.' },
  { id: 'power-lab', name: 'MTB Power Lab', flagship: true, desc: 'A virtual climb: set the masses, elevation gain, time and speeds, and calculate work, change in kinetic energy, average power and power-to-weight.' },
  { id: 'impact-lab', name: 'MTB Impact Lab', flagship: true, desc: 'A simplified collision model: the same change in momentum over different times, and what that does to the average force. Hypothetical scenarios only.' },
  { id: 'wheel-gear-lab', name: 'Wheel & Gear Lab', flagship: true, desc: 'Build a drivetrain (crank length, chainring, cog, wheel size, pedal torque) and see gear ratio, wheel torque, angular velocity and speed.' },
  { id: 'hydraulic-brake-lab', name: 'Hydraulic Brake Lab', flagship: true, desc: 'A simplified hydraulic brake: lever force, piston areas, fluid pressure and piston travel.' },
  { id: 'air-pressure-lab', name: 'Air & Pressure Lab', desc: 'Pressure and volume in tires and air springs.' },
  { id: 'wave-lab', name: 'Vibration & Wave Lab', flagship: true, desc: 'Change frequency, amplitude, wavelength and wave speed, and combine two waves to see interference.' },
  { id: 'brake-heat-lab', name: 'Brake Heat Lab', flagship: true, desc: 'Estimate how much a hypothetical rotor heats up when a rider brakes, with every assumption stated.' },
  { id: 'tire-pressure-lab', name: 'Tire Pressure Lab', desc: 'How gas temperature, pressure and volume are related in a tire.' },
  { id: 'emtb-anatomy', name: 'Anatomy of an Electric Mountain Bike', desc: 'Explore the motor, battery, controller, sensors, lights and computer, and how energy flows between them.' },
  { id: 'electric-charge-lab', name: 'Electric Charge Lab', desc: 'Place positive and negative charges and see the forces and electric field they make.' },
  { id: 'ebike-battery-lab', name: 'E-Bike Battery Lab', flagship: true, desc: 'Change a battery’s voltage and charge and see how electric potential and stored energy are related.' },
  { id: 'circuit-lab', name: 'Circuit Lab', flagship: true, desc: 'Set voltage and resistance and see the current, power and energy use; then build series and parallel bike-light circuits.' },
  { id: 'magnetic-motor-lab', name: 'Magnetic Motor Lab', flagship: true, desc: 'See how a magnetic field pushes on a current, and how that turns a motor.' },
  { id: 'generator-lab', name: 'Generator Lab', flagship: true, desc: 'Move a magnet through a coil; change its speed, the number of loops and the field strength, and watch the induced voltage.' },
  { id: 'wireless-lab', name: 'Wireless Technology Lab', flagship: true, desc: 'Explore the electromagnetic spectrum and the frequencies GPS, Bluetooth and bike sensors use.' },
  { id: 'light-lens-lab', name: 'Light & Lens Lab', flagship: true, desc: 'Trace rays through mirrors and lenses: reflection, refraction, focal points and images.' },
  { id: 'vision-lab', name: 'Vision Lab', flagship: true, desc: 'A simplified eye: change the lens shape and focal distance and see how an image forms. Physics only, not a vision test.' },
  { id: 'light-wave-lab', name: 'Light Wave Lab', flagship: true, desc: 'Interference, diffraction and polarization of light, including how polarized lenses cut glare.' }
];

const M = (slug, title, f) => ({ slug, title, status: 'planned', mtb: null, prereq: [], ...f });

export const PHYSICS_COURSES = [
  // ===================================================== TRAIL PHYSICS
  {
    id: 'phys1', slug: 'trail-physics', name: 'Trail Physics', order: 5, art: 'ride', subject: 'Physics', pathway: 'physics-of-the-ride',
    level: 'foundational', firstUnit: 1,
    subtitle: 'Mechanics & Energy',
    card: 'The mechanics of riding: motion, jumps, forces and cornering, energy and momentum, then rotation, fluids, suspension, waves and heat.',
    description: 'Trail Physics: the mechanics of mountain biking. Kinematics, vectors, projectile motion, Newton’s laws, friction, circular motion, energy, momentum, rotation, fluids, oscillations, waves and thermodynamics.',
    intro: 'The physics of riding itself. How a rider speeds up, flies off a jump, grips through a corner and stops, and how the bike’s wheels, brakes and suspension do their jobs.',
    concepts: ['Kinematics', 'Vectors', 'Projectile motion', 'Newton’s laws', 'Friction', 'Circular motion', 'Energy', 'Momentum', 'Rotation', 'Fluids', 'Oscillations', 'Waves', 'Heat'],
    units: [
      { slug: 'physics-foundations', title: 'Physics Foundations', desc: 'What physics is, the maths it runs on, and how to measure the world honestly.', topics: [
        M('introduction-to-physics', 'Introduction to Physics', {
          desc: 'What physics studies, how scientists build models and laws, and why a mountain bike is a physical system.',
          hook: 'What’s actually happening, physically, when you ride a bike down a trail?',
          mtb: 'A mountain bike is a system of interacting parts: wheels that rotate, tires that grip, springs that compress, brakes that turn motion into heat. Each part is a way into physics.',
          concepts: ['What physics studies', 'Scientific models', 'Laws and theories', 'Physical systems', 'Observation and evidence'],
          math: [],
          experiences: ['bike-anatomy'], category: 'core',
          skills: ['what-physics-studies: Describe what physics studies, with examples from riding',
            'models-and-laws: Tell an observation, a model, a law and a theory apart',
            'systems: Describe a mountain bike as a physical system of interacting parts',
            'physics-of-the-bike: Name the physics each part of a bike depends on']
        }),
        M('mathematics-review', 'Mathematics Review', {
          desc: 'The algebra, ratios, geometry and trigonometry that every later module uses, practised on riding problems.',
          hook: 'How steep is that climb, really?',
          mtb: 'Trail grade is rise over run; speed is distance over time; a jump’s height is a side of a right triangle. Riding is full of the maths physics needs.',
          concepts: ['Rearranging equations', 'Ratios and proportions', 'Right-triangle geometry', 'Sine, cosine and tangent', 'Reading graphs'],
          math: ['grade = rise ÷ run × 100%', 'speed = distance ÷ time', 'a² + b² = c²', 'sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj'],
          experiences: ['math-toolkit'], category: 'core',
          skills: ['rearrange-equations: Rearrange an equation to solve for any of its variables',
            'ratios-proportions: Use ratios and proportions in riding problems',
            'right-triangles: Find a missing side of a right triangle',
            'trig-ratios: Use sine, cosine and tangent to find sides and angles',
            'trail-grade: Calculate a trail’s grade from elevation change and horizontal distance',
            'read-graphs: Read and interpret a graph of a riding quantity']
        }),
        M('scientific-measurement', 'Scientific Measurement', {
          desc: 'SI units, conversions, scientific notation, significant figures and uncertainty: how to collect data and say how sure you are.',
          hook: 'Your GPS says 38 km/h. A timing gate says 35. Which one do you trust?',
          mtb: 'Riders measure everything: jump heights, split times, slope grade, suspension sag. Every measurement has an uncertainty, and different tools have different precision.',
          concepts: ['SI and derived units', 'Unit conversion', 'Scientific notation', 'Significant figures', 'Uncertainty', 'Estimation', 'Models and assumptions'],
          math: ['1 m/s = 3.6 km/h', 'percent uncertainty = (uncertainty ÷ measured value) × 100%'],
          experiences: ['trail-measurement-lab', 'math-toolkit'], category: 'core',
          skills: ['si-units: Use SI base and derived units',
            'unit-conversions: Convert between units, such as km/h, m/s and mph',
            'scientific-notation: Write and calculate with scientific notation',
            'significant-figures: Report a result with sensible significant figures',
            'uncertainty: Estimate a measurement’s uncertainty and percent uncertainty',
            'models-assumptions: Name a model’s assumptions and when they stop holding']
        })
      ] },
      { slug: 'understanding-motion', title: 'Understanding Motion', desc: 'Describe motion in one and two dimensions, from a rider on a straight trail to a rider in the air.', topics: [
        M('kinematics', 'Motion in One Dimension', {
          desc: 'Position, displacement, velocity and acceleration, and the graphs and equations that describe a rider on a straight trail.',
          hook: 'How far do you travel while you brake to a stop at the bottom of a descent?',
          mtb: 'Follow a rider along a straight trail: steady speed, speeding up, braking, stopping. Each one is a different shape on a position-time or velocity-time graph.',
          concepts: ['Position and displacement', 'Speed and velocity', 'Acceleration and deceleration', 'Free fall', 'Motion graphs', 'Average vs. instantaneous velocity'],
          math: ['v = Δx / Δt', 'a = Δv / Δt', 'x = x₀ + v₀t + ½at²'],
          experiences: ['trail-speed-lab'], category: 'core', prereq: ['phys1.mathematics-review'],
          skills: ['distance-displacement: Tell distance from displacement, and speed from velocity',
            'average-velocity: Calculate average velocity from a change in position',
            'acceleration: Calculate acceleration, including braking',
            'motion-equations: Use the constant-acceleration equations to predict position and speed',
            'motion-graphs: Read and sketch position-, velocity- and acceleration-time graphs',
            'free-fall: Describe free fall, with g ≈ 9.8 m/s²']
        }),
        M('vectors', 'Vectors', {
          desc: 'Quantities with a size and a direction: how to add them, split them into components and find a resultant.',
          hook: 'Ride 30 m east and then 40 m north. How far are you from where you started?',
          mtb: 'A rider can hold the same speed while changing direction, so speed alone isn’t enough. Velocity, acceleration, gravity and the forces on a bike all have directions.',
          concepts: ['Scalars and vectors', 'Magnitude and direction', 'Vector addition and subtraction', 'Components', 'Resultants'],
          math: ['R = √(Rx² + Ry²)', 'θ = arctan(Ry / Rx)', 'Ax = A cos θ, Ay = A sin θ'],
          experiences: ['vector-lab'], category: 'core', prereq: ['phys1.mathematics-review'],
          skills: ['scalars-vectors: Tell scalar and vector quantities apart',
            'add-vectors: Add and subtract vectors, by drawing and by components',
            'components: Resolve a vector into horizontal and vertical components',
            'resultant: Find a resultant’s magnitude and direction']
        }),
        M('projectile-motion', 'Projectile Motion', {
          desc: 'Motion in two dimensions: why horizontal and vertical motion are independent, and how to predict flight time, height and range.',
          hook: 'Why does a little more speed send you so much farther off a jump?',
          mtb: 'Once a rider leaves the lip of a jump, only gravity acts on them (in the ideal model). Horizontal speed stays the same, vertical speed changes steadily, and the path is a parabola.',
          concepts: ['Two-dimensional motion', 'Horizontal and vertical velocity', 'Independence of motion', 'Maximum height', 'Flight time', 'Range', 'Trajectory'],
          math: ['vx = v₀ cos θ', 'vy = v₀ sin θ', 'x(t) = x₀ + vx·t', 'y(t) = y₀ + vy·t − ½gt²'],
          experiences: ['jump-lab'], category: 'core', prereq: ['phys1.kinematics', 'phys1.vectors'],
          note: 'Jump Lab uses an idealized projectile model: no air resistance and no rider movement in the air.',
          skills: ['components: Split a takeoff velocity into horizontal and vertical components',
            'independence: Explain why horizontal and vertical motion are independent',
            'flight: Calculate flight time, maximum height and horizontal range',
            'predict-landing: Predict where a rider lands, using the trajectory equations',
            'launch-variables: Explain how takeoff speed and angle change a trajectory']
        })
      ] },
      { slug: 'forces-and-cornering', title: 'Forces & Cornering', desc: 'Newton’s laws, friction and springs, and the physics of turning.', topics: [
        M('newtons-laws', 'Newton’s Laws of Motion', {
          desc: 'Force, mass and inertia; Newton’s three laws; net force and free-body diagrams.',
          hook: 'Why does a heavier bike and rider take more force to get up to speed?',
          mtb: 'Pedalling pushes the bike forward, braking slows it, and the trail pushes back on the tires. Every change in a rider’s motion comes from an unbalanced force.',
          concepts: ['Force and mass', 'Inertia', 'Newton’s first, second and third laws', 'Net force', 'Balanced and unbalanced forces', 'Action and reaction'],
          math: ['F_net = ma'],
          experiences: ['force-lab'], category: 'core', prereq: ['phys1.kinematics', 'phys1.vectors'],
          skills: ['inertia: Explain inertia and Newton’s first law',
            'net-force: Combine forces to find the net force',
            'second-law: Use F_net = ma to find a force, mass or acceleration',
            'third-law: Identify action-reaction pairs, such as tire and trail',
            'free-body: Draw a free-body diagram for a rider and bike']
        }),
        M('applications-of-newtons-laws', 'Friction, Slopes and Springs', {
          desc: 'Newton’s laws at work: the normal force, static and kinetic friction, inclined planes, Hooke’s law and how materials deform.',
          hook: 'Why does a tire grip, and why does it suddenly let go?',
          mtb: 'Traction, braking, climbing and suspension are all applications of Newton’s laws: friction between rubber and dirt, gravity pulling along a slope, and springs pushing back when they compress.',
          concepts: ['Normal force', 'Gravity on an incline', 'Static and kinetic friction', 'Coefficient of friction', 'Hooke’s law', 'Stress and strain'],
          math: ['F_f ≤ μ_s N (static), F_f = μ_k N (kinetic)', 'F_s = −kx', 'on a slope: N = mg cos θ, along the slope: mg sin θ'],
          experiences: ['traction-lab', 'incline-lab', 'suspension-lab'], category: 'core', prereq: ['phys1.newtons-laws'],
          note: 'Friction coefficients in these labs are illustrative, not measured tire data.',
          skills: ['normal-force: Find the normal force, on flat ground and on a slope',
            'friction: Use the friction model F_f = μN for static and kinetic friction',
            'inclines: Split gravity into parts along and across a slope',
            'hookes-law: Use Hooke’s law for a spring',
            'stress-strain: Describe elastic deformation, stress and strain']
        }),
        M('uniform-circular-motion', 'Uniform Circular Motion', {
          desc: 'Turning: arc length, angular velocity, centripetal acceleration and force, and how a banked turn helps.',
          hook: 'Why does a wider line through a berm let you carry more speed?',
          mtb: 'Every corner is a piece of a circle. To turn, a rider needs an inward force, from tire friction and from the tilt of a berm, and how much depends on speed squared over the radius of the line.',
          concepts: ['Circular motion', 'Arc length and angular displacement', 'Angular velocity', 'Radius of curvature', 'Centripetal acceleration and force', 'Banking angles'],
          math: ['a_c = v² / r', 'F_c = mv² / r', 'ω = v / r', 'matched bank angle: tan β = v² / (rg)'],
          experiences: ['berm-lab'], category: 'core', prereq: ['phys1.applications-of-newtons-laws'],
          note: 'Berm Lab uses an idealized steady banked-turn model. Its grip numbers are illustrative, not riding advice.',
          skills: ['arc-length: Relate arc length, angle and radius',
            'angular-velocity: Relate angular velocity, speed and radius with ω = v/r',
            'centripetal-acceleration: Calculate centripetal acceleration with a = v²/r',
            'centripetal-force: Calculate the inward force a turn needs and identify what supplies it',
            'speed-and-radius: Explain how speed and radius change the demands of a corner',
            'banking: Explain how a banked turn supplies inward force, and find the matched bank angle']
        })
      ] },
      { slug: 'energy-and-momentum', title: 'Energy & Momentum', desc: 'Energy, work, power and momentum: the bookkeeping of a ride.', topics: [
        M('energy-and-gravitation', 'Energy and Gravitation', {
          desc: 'Kinetic, gravitational and elastic potential energy, conservation of mechanical energy, and Newton’s law of gravitation.',
          hook: 'Where does your speed come from when you drop into a descent?',
          mtb: 'At the top of a trail a rider has height; at the bottom, speed. Gravitational potential energy turns into kinetic energy, and some of it into heat and sound along the way.',
          concepts: ['Work', 'Kinetic energy', 'Gravitational potential energy', 'Elastic potential energy', 'Conservation of mechanical energy', 'Conservative forces', 'Gravitation'],
          math: ['KE = ½mv²', 'PE = mgh', 'PE_spring = ½kx²', 'KE₁ + PE₁ = KE₂ + PE₂ (no losses)', 'F = Gm₁m₂ / r²'],
          experiences: ['trail-energy-lab'], category: 'core', prereq: ['phys1.newtons-laws'],
          skills: ['kinetic-energy: Calculate kinetic energy',
            'potential-energy: Calculate gravitational potential energy',
            'conservation: Use conservation of mechanical energy to predict speed after a descent',
            'elastic-energy: Calculate the energy stored in a compressed spring',
            'energy-losses: Account for energy lost to friction and other non-conservative forces',
            'gravitation: Describe Newton’s law of gravitation and gravitational fields']
        }),
        M('work-and-power', 'Work and Power', {
          desc: 'Work, the work-energy theorem, power and efficiency: what it costs to ride a trail.',
          hook: 'How many watts does it take to get up the climb?',
          mtb: 'Climbing, accelerating out of a corner and pushing through rolling and air resistance all take work. Power is how fast you do it, and power-to-weight is why light riders climb well.',
          concepts: ['Mechanical work', 'Work-energy theorem', 'Power', 'Conservative and non-conservative forces', 'Energy efficiency'],
          math: ['W = Fd cos θ', 'W_net = ΔKE', 'P = W / t', 'P = mg·v_vertical (steady climb, no losses)'],
          experiences: ['power-lab'], category: 'core', prereq: ['phys1.energy-and-gravitation'],
          note: 'P = mg·v_vertical gives the power against gravity alone, for a steady climb; real climbing also fights rolling and air resistance.',
          skills: ['work: Calculate the work done by a force',
            'work-energy: Use the work-energy theorem',
            'power: Calculate average power, including climbing power',
            'power-to-weight: Compare riders using power-to-weight ratio',
            'efficiency: Calculate and interpret energy efficiency']
        }),
        M('momentum-and-collisions', 'Momentum and Collisions', {
          desc: 'Momentum, impulse and conservation of momentum, and why stretching out a collision lowers the average force.',
          hook: 'Why does bending your knees on a landing reduce the force you feel?',
          mtb: 'Landing a jump or hitting a root changes a rider’s momentum. The same change spread over a longer time needs a smaller average force: impulse = force × time.',
          concepts: ['Momentum', 'Impulse', 'Impulse-momentum theorem', 'Conservation of momentum', 'Elastic and inelastic collisions'],
          math: ['p = mv', 'J = Δp = F_avg Δt'],
          experiences: ['impact-lab'], category: 'core', prereq: ['phys1.newtons-laws'],
          note: 'The Impact Lab uses hypothetical scenarios to teach impulse. It isn’t a way to judge protective gear or predict injury.',
          skills: ['momentum: Calculate momentum',
            'impulse: Use the impulse-momentum theorem',
            'interaction-time: Explain why a longer interaction time means a smaller average force',
            'conservation: Use conservation of momentum in a collision',
            'collision-types: Tell elastic and inelastic collisions apart']
        })
      ] },
      { slug: 'bike-mechanics', title: 'Bike Mechanics', desc: 'The engineering of the bike: drivetrains and wheels, hydraulic brakes, and suspension.', topics: [
        M('rotational-dynamics', 'Rotational Dynamics', {
          desc: 'Angular velocity and acceleration, torque, moment of inertia, gear ratios and rotational energy.',
          hook: 'Why does the easiest gear make climbing feel lighter, but slower?',
          mtb: 'Cranks, chainrings, cassettes, wheels and brake rotors all rotate. Torque at the pedals becomes torque at the wheel, multiplied or divided by the gear ratio.',
          concepts: ['Angular displacement, velocity and acceleration', 'Torque', 'Moment of inertia', 'Rotational equilibrium', 'Rotational kinetic energy', 'Mechanical advantage'],
          math: ['τ = rF sin θ', 'ω = v / r', 'gear ratio = chainring teeth ÷ cog teeth', 'KE_rot = ½Iω²'],
          experiences: ['wheel-gear-lab'], category: 'engineering', prereq: ['phys1.uniform-circular-motion', 'phys1.work-and-power'],
          skills: ['angular-velocity: Relate angular velocity, linear speed and radius',
            'gear-ratio: Calculate a gear ratio and explain mechanical advantage',
            'drivetrain: Follow rotation from crank to wheel to find distance and speed',
            'torque: Calculate torque from a force and a lever arm',
            'moment-of-inertia: Explain moment of inertia and why wheel mass matters',
            'rotational-energy: Calculate rotational kinetic energy']
        }),
        M('fluids', 'Fluids', {
          desc: 'Density, pressure, Pascal’s principle and hydraulics, buoyancy, flow and air resistance.',
          hook: 'How does a light squeeze on a brake lever stop a whole bike and rider?',
          mtb: 'Hydraulic brakes pass pressure through fluid from a small lever piston to bigger caliper pistons. Suspension forks push oil through valves, and tires and air springs are pressurized gas.',
          concepts: ['Density', 'Pressure', 'Pascal’s principle', 'Hydraulic systems', 'Buoyancy', 'Continuity', 'Bernoulli’s principle', 'Fluid resistance'],
          math: ['P = F / A', 'ρ = m / V', 'F₂ = F₁ × (A₂ / A₁)', 'A₁v₁ = A₂v₂ (steady, incompressible flow)'],
          experiences: ['hydraulic-brake-lab', 'air-pressure-lab'], category: 'engineering', prereq: ['phys1.newtons-laws'],
          skills: ['density: Calculate density from mass and volume',
            'pressure: Calculate pressure from force and area',
            'pascal: Use Pascal’s principle to explain a hydraulic brake',
            'hydraulic-advantage: Calculate the force multiplication between pistons of different areas',
            'continuity: Use the continuity equation for steady flow',
            'bernoulli-drag: Describe Bernoulli’s principle and air resistance']
        }),
        M('oscillations', 'Oscillations', {
          desc: 'Restoring forces, simple harmonic motion, period and frequency, energy in a spring, and damping.',
          hook: 'Why does your fork bounce back after a hit, and how fast?',
          mtb: 'Suspension is a spring and a mass. Compress it and it pushes back; let go and it oscillates. Damping is what stops it bouncing forever.',
          concepts: ['Restoring force', 'Simple harmonic motion', 'Period and frequency', 'Spring energy', 'Damping', 'Pendulums'],
          math: ['F = −kx', 'T = 2π√(m / k)', 'f = 1 / T'],
          experiences: ['suspension-lab'], category: 'engineering', prereq: ['phys1.applications-of-newtons-laws', 'phys1.energy-and-gravitation'],
          note: 'The Suspension Lab starts with an ideal spring-mass model. Damping is a separate, advanced model with extra assumptions. Neither is a suspension setup guide.',
          skills: ['restoring-force: Describe a restoring force with Hooke’s law',
            'period-frequency: Calculate the period and frequency of a spring-mass system',
            'shm-graphs: Read displacement, velocity and acceleration graphs of simple harmonic motion',
            'energy-in-shm: Track spring and kinetic energy through an oscillation',
            'damping: Describe how damping changes an oscillation']
        })
      ] },
      { slug: 'waves-and-temperature', title: 'Waves & Temperature', desc: 'Vibrations, sound and waves, then heat, temperature and the laws of thermodynamics.', topics: [
        M('waves', 'Waves', {
          desc: 'Wave motion, wavelength, frequency and speed, superposition and interference, sound and resonance.',
          hook: 'What makes a bike buzz, rattle and hum on a rough trail?',
          mtb: 'Tires, frames and suspension vibrate, the ground passes vibrations into the bike, and a freehub or a passing rider makes sound: all waves carrying energy.',
          concepts: ['Transverse and longitudinal waves', 'Wavelength, frequency, amplitude, period', 'Wave speed', 'Superposition and interference', 'Sound', 'Resonance', 'Doppler effect'],
          math: ['v = fλ', 'T = 1 / f'],
          experiences: ['wave-lab'], category: 'extension', prereq: ['phys1.oscillations'],
          skills: ['wave-properties: Identify wavelength, frequency, amplitude and period',
            'wave-speed: Use v = fλ and T = 1/f',
            'wave-types: Tell transverse and longitudinal waves apart',
            'interference: Predict constructive and destructive interference',
            'sound: Describe sound as a wave, and resonance']
        }),
        M('thermodynamics', 'Thermodynamics', {
          desc: 'Temperature, heat and thermal energy, heat transfer, the ideal gas law and the first and second laws.',
          hook: 'Where does all your speed go when you brake down a long descent?',
          mtb: 'Braking turns kinetic energy into heat in the rotors and pads. Temperature also changes the pressure in tires and air shocks.',
          concepts: ['Temperature and temperature scales', 'Heat and thermal energy', 'Specific heat', 'Heat transfer', 'Ideal gas law', 'Internal energy', 'First and second laws'],
          math: ['Q = mcΔT', 'PV = nRT', 'ΔU = Q − W (Q = heat added to the system, W = work done by the system)'],
          experiences: ['brake-heat-lab', 'tire-pressure-lab'], category: 'engineering', prereq: ['phys1.energy-and-gravitation'],
          note: 'The Brake Heat Lab uses simplified energy-transfer assumptions (a hypothetical rotor and a chosen fraction of energy becoming heat) and states them.',
          skills: ['temperature-heat: Tell temperature, heat and thermal energy apart, and convert temperature scales',
            'specific-heat: Use Q = mcΔT',
            'braking-heat: Estimate a brake’s temperature rise from kinetic energy, stating the assumptions',
            'gas-law: Use the ideal gas law for a tire',
            'first-law: Apply the first law of thermodynamics with a stated sign convention',
            'second-law: Explain the second law and why no engine is 100% efficient']
        })
      ] }
    ]
  },

  // ================================================== TRAIL TECHNOLOGY
  {
    id: 'phys2', slug: 'trail-technology', name: 'Trail Technology', order: 6, art: 'spark', subject: 'Physics', pathway: 'physics-of-the-ride',
    level: 'advanced', firstUnit: 7,
    subtitle: 'Electricity, Magnetism & Optics',
    card: 'The physics inside modern bike technology: e-bike motors and batteries, circuits and lights, sensors and wireless, lenses and light.',
    description: 'Trail Technology: electricity, magnetism and optics through e-bike motors and batteries, circuits, sensors, wireless bike computers, lights and eyewear.',
    intro: 'An advanced enrichment course. The riding connection is the technology on and around the bike: motors, batteries, lights, sensors, GPS and lenses.',
    concepts: ['Charge', 'Voltage', 'Current', 'Circuits', 'Magnetism', 'Induction', 'Electromagnetic waves', 'Optics'],
    units: [
      { slug: 'electricity', title: 'Electricity', desc: 'Charge, voltage, current, resistance and circuits, through e-bike batteries and bike lights.', topics: [
        M('electric-mountain-bike', 'Introduction: The Electric Bike', {
          desc: 'How mechanics connects to the electrical systems on a modern bike.',
          hook: 'What turns a battery’s charge into a push up the climb?',
          mtb: 'An e-bike’s battery stores energy, its controller and motor turn it into torque at the wheel, and lights, sensors and computers run on the same electricity.',
          concepts: ['Electrical systems on a bike', 'Energy conversion', 'Mechanics and electricity'],
          math: [],
          experiences: ['emtb-anatomy'], category: 'engineering', prereq: ['phys1.work-and-power'],
          skills: ['systems: Identify the electrical systems on a modern bike',
            'energy-chain: Trace energy from battery to motor to wheel',
            'mechanics-to-electricity: Connect force, energy and power to their electrical versions']
        }),
        M('electric-charge-and-field', 'Electric Charge and Electric Field', {
          desc: 'Charge, conductors and insulators, Coulomb’s law and electric fields.',
          hook: 'Why does a jacket crackle when you pull it off after a cold, dry ride?',
          mtb: 'Static charge builds up when materials rub. Bikes use conductors for wiring and insulators to protect it.',
          concepts: ['Electric charge', 'Conservation of charge', 'Conductors and insulators', 'Electrostatic force', 'Electric fields', 'Charge distribution'],
          math: ['F = kq₁q₂ / r²', 'E = F / q'],
          experiences: ['electric-charge-lab'], category: 'engineering',
          skills: ['charge: Describe positive and negative charge, and conservation of charge',
            'conductors-insulators: Tell conductors and insulators apart',
            'coulombs-law: Use Coulomb’s law',
            'fields: Draw and interpret electric field lines']
        }),
        M('electric-potential', 'Electric Potential and Capacitors', {
          desc: 'Voltage as energy per charge, potential energy, equipotentials and capacitors.',
          hook: 'What does the 36 V on an e-bike battery actually mean?',
          mtb: 'A battery’s voltage tells you the energy each coulomb of charge carries. Its charge rating and voltage together set how much energy it stores.',
          concepts: ['Electric potential and potential energy', 'Voltage', 'Electric field strength', 'Equipotential surfaces', 'Capacitors', 'Energy in capacitors'],
          math: ['V = ΔPE / q', 'E = QV (energy, battery approximation)', 'C = Q / V', 'U = ½CV²'],
          experiences: ['ebike-battery-lab'], category: 'engineering', prereq: ['phys2.electric-charge-and-field'],
          skills: ['potential-difference: Explain voltage as energy per unit charge',
            'battery-energy: Calculate the energy a battery stores, in joules and watt-hours',
            'capacitors: Calculate capacitance and the energy a capacitor stores',
            'equipotentials: Interpret equipotential lines and field strength']
        }),
        M('current-resistance-ohms-law', 'Current, Resistance and Ohm’s Law', {
          desc: 'Current, resistance and resistivity, Ohm’s law, electrical power and heating, AC and DC.',
          hook: 'Why does a brighter bike light drain its battery faster?',
          mtb: 'Motor power, battery current, wiring thickness and light brightness all come down to voltage, current and resistance.',
          concepts: ['Electric current', 'Resistance and resistivity', 'Ohm’s law', 'Electrical power', 'Resistive heating', 'AC and DC'],
          math: ['I = Q / t', 'V = IR', 'P = VI', 'R = ρL / A'],
          experiences: ['circuit-lab'], category: 'engineering', prereq: ['phys2.electric-potential'],
          skills: ['current: Calculate current as charge per unit time',
            'ohms-law: Use Ohm’s law',
            'electric-power: Calculate electrical power and energy use',
            'resistivity: Explain how material, length and thickness set resistance',
            'ac-dc: Tell alternating and direct current apart']
        }),
        M('circuits-and-dc-instruments', 'Circuits and DC Instruments', {
          desc: 'Series and parallel circuits, voltage drops, internal resistance, meters and capacitors in circuits.',
          hook: 'If you wire two lights to one battery, does it matter how?',
          mtb: 'Lighting circuits, battery management systems, sensors and electronic shifting are all circuits. Series and parallel wiring behave very differently.',
          concepts: ['Series circuits', 'Parallel circuits', 'Voltage drop', 'Ammeters and voltmeters', 'Internal resistance', 'Circuit analysis', 'Capacitors in circuits'],
          math: ['series: R = R₁ + R₂ + …', 'parallel: 1/R = 1/R₁ + 1/R₂ + …', 'terminal voltage = emf − Ir'],
          experiences: ['circuit-lab'], category: 'engineering', prereq: ['phys2.current-resistance-ohms-law'],
          skills: ['series: Analyze a series circuit',
            'parallel: Analyze a parallel circuit',
            'internal-resistance: Explain a battery’s internal resistance and terminal voltage',
            'meters: Describe how to measure current and voltage',
            'rc-circuits: Describe how a capacitor charges and discharges in a circuit']
        })
      ] },
      { slug: 'magnetism-and-wireless', title: 'Magnetism & Wireless Technology', desc: 'Magnetic fields, motors and generators, and the electromagnetic waves behind GPS and wireless sensors.', topics: [
        M('magnetism', 'Magnetism', {
          desc: 'Magnetic poles and fields, the force on a moving charge and on a current, and how motors and sensors use it.',
          hook: 'How does a magnet on a spoke tell your bike computer how fast you’re going?',
          mtb: 'E-bike motors turn magnetic forces into torque. Wheel and speed sensors detect a passing magnet, some with Hall-effect chips.',
          concepts: ['Magnetic poles and domains', 'Magnetic fields', 'Force on a moving charge', 'Force on a current-carrying wire', 'Motors', 'Hall-effect sensors'],
          math: ['F = qvB sin θ', 'F = BIL sin θ'],
          experiences: ['magnetic-motor-lab'], category: 'engineering', prereq: ['phys2.current-resistance-ohms-law'],
          skills: ['magnetic-fields: Describe magnetic poles and field lines',
            'force-on-charge: Find the force on a moving charge in a magnetic field',
            'force-on-wire: Find the force on a current-carrying wire',
            'motors: Explain how an electric motor turns current into rotation',
            'sensors: Explain how a magnet and sensor measure wheel speed']
        }),
        M('electromagnetic-induction', 'Electromagnetic Induction', {
          desc: 'Magnetic flux, Faraday’s and Lenz’s laws, generators, eddy currents, transformers and AC.',
          hook: 'How does a dynamo hub make light just from riding?',
          mtb: 'A dynamo hub spins magnets past coils to light a bike. The same physics lets a motor work as a generator, and is behind magnetic braking.',
          concepts: ['Magnetic flux', 'Faraday’s law', 'Lenz’s law', 'Generators', 'Eddy currents', 'Transformers', 'AC circuits', 'Inductors'],
          math: ['Φ = BA cos θ', 'emf = −N ΔΦ / Δt'],
          experiences: ['generator-lab'], category: 'engineering', prereq: ['phys2.magnetism'],
          skills: ['flux: Calculate magnetic flux',
            'faradays-law: Use Faraday’s law to find an induced emf',
            'lenz: Use Lenz’s law to find the direction of an induced current',
            'generators: Explain how a generator or dynamo makes electricity',
            'transformers-ac: Describe transformers and AC']
        }),
        M('electromagnetic-waves', 'Electromagnetic Waves', {
          desc: 'Electromagnetic waves, the spectrum, frequency, wavelength and energy, and how they carry information.',
          hook: 'How does your bike computer know where you are on the mountain?',
          mtb: 'GPS, Bluetooth and wireless sensors all use radio waves: electromagnetic waves at frequencies chosen to carry information.',
          concepts: ['Electromagnetic waves', 'The electromagnetic spectrum', 'Frequency and wavelength', 'Energy', 'Radio waves', 'Colour'],
          math: ['c = fλ', 'c ≈ 3.0 × 10⁸ m/s'],
          experiences: ['wireless-lab'], category: 'extension', prereq: ['phys1.waves', 'phys2.electromagnetic-induction'],
          skills: ['spectrum: Place types of radiation on the electromagnetic spectrum',
            'speed-of-light: Use c = fλ',
            'wireless: Explain how radio waves carry signals for GPS and Bluetooth',
            'energy: Relate a wave’s frequency to the energy it carries']
        })
      ] },
      { slug: 'light-and-optics', title: 'Light & Optics', desc: 'Reflection, refraction and lenses, the eye, and light as a wave.', topics: [
        M('geometric-optics', 'Geometric Optics', {
          desc: 'Reflection, refraction and total internal reflection, mirrors and lenses, focal length, images and magnification.',
          hook: 'How does a bike light throw a beam far down the trail?',
          mtb: 'Bike lights shape their beams with reflectors and lenses, reflectors bounce light back to drivers, and action cameras focus the trail onto a sensor.',
          concepts: ['Reflection', 'Refraction and refractive index', 'Total internal reflection', 'Mirrors and lenses', 'Focal length', 'Images and magnification'],
          math: ['n₁ sin θ₁ = n₂ sin θ₂', '1/f = 1/d_o + 1/d_i', 'm = −d_i / d_o'],
          experiences: ['light-lens-lab'], category: 'extension', prereq: ['phys1.mathematics-review'],
          skills: ['reflection: Use the law of reflection',
            'refraction: Use Snell’s law',
            'total-internal-reflection: Explain total internal reflection',
            'thin-lens: Use the thin-lens equation to locate an image',
            'magnification: Calculate magnification']
        }),
        M('vision-and-optical-instruments', 'Vision and Optical Instruments', {
          desc: 'The eye as an optical system, accommodation, peripheral vision, corrective lenses and optical instruments.',
          hook: 'How do your eyes switch focus from a root right in front of you to the trail far ahead?',
          mtb: 'Riders read the trail with their eyes: focusing near and far, using peripheral vision, looking through eyewear and filming with cameras.',
          concepts: ['The eye as an optical system', 'Accommodation', 'Peripheral vision', 'Lens correction', 'Telescopes and microscopes', 'Optical aberrations'],
          math: ['P = 1 / f (lens power in dioptres)'],
          experiences: ['vision-lab'], category: 'extension', prereq: ['phys2.geometric-optics'],
          note: 'The Vision Lab teaches optics. It isn’t a vision test or a riding-safety assessment.',
          skills: ['eye-optics: Describe the eye as a lens system',
            'accommodation: Explain how the eye focuses near and far',
            'correction: Explain how corrective lenses work',
            'instruments: Describe how lenses combine in cameras and other instruments']
        }),
        M('wave-optics', 'Wave Optics', {
          desc: 'Light as a wave: interference, diffraction, polarization and thin films.',
          hook: 'Why do polarized lenses cut the glare off a wet trail?',
          mtb: 'Polarized and anti-reflective eyewear, the glare from wet rock, and the colours in a lens coating are all wave optics.',
          concepts: ['Wave nature of light', 'Huygens’s principle', 'Interference', 'Diffraction', 'Polarization', 'Thin-film interference'],
          math: ['double slit: d sin θ = mλ', 'I = I₀ cos² θ'],
          experiences: ['light-wave-lab'], category: 'extension', prereq: ['phys1.waves', 'phys2.geometric-optics'],
          skills: ['interference: Explain constructive and destructive interference of light',
            'diffraction: Describe diffraction patterns',
            'polarization: Explain polarization and how polarized lenses cut glare',
            'thin-film: Explain thin-film interference in lens coatings']
        })
      ] }
    ]
  }
];

// How every module is taught (PRD 6), shown on the Physics of the Ride page.
export const LESSON_STEPS = [
  ['Hook', 'Start with a riding question, not an equation.'],
  ['Predict', 'Say what you think will happen before you find out.'],
  ['Learn', 'The physics, its vocabulary and equations, in short sections.'],
  ['Experiment', 'Change the variables in a lab and watch what happens.'],
  ['Calculate', 'Worked riding problems: knowns, unknown, equation, units, meaning.'],
  ['Challenge', 'A concept question, a maths problem and a simulation challenge.'],
  ['Explain', 'Claim, evidence, reasoning: say what you found and why.']
];

// The three levels students can work at (PRD 9).
export const LEVELS_OF_WORK = [
  ['Explore', 'Visual explanations, demonstrations and guided predictions, with minimal equations.'],
  ['Apply', 'Algebra, unit conversions, graphs and multi-step problems: standard high school physics.'],
  ['Engineer', 'Multi-variable models, trigonometry, uncertainty, model assumptions and independent investigations.']
];
