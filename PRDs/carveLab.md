# Mathlete Ski — Carve Lab
## Product Requirements Document (PRD)
**Product:** Mathlete Ski  
**Feature:** Carve Lab — The Science of Turning  
**Priority:** Flagship interactive learning experience  
**Primary audience:** Middle school and high school students, particularly students interested in skiing  
**Implementation:** Claude Code / Full-Stack Development

---

# 1. Product Vision

Build an immersive, interactive skiing physics simulator that teaches students the mathematics behind carving turns.

The experience should allow students to manipulate ski geometry, edge angles, skiing speed, and skier mass to understand how these variables influence turning radius, centripetal acceleration, and the forces involved in carving.

The primary objective is to make mathematics feel useful, intuitive, and exciting by connecting abstract academic concepts to something students already love: skiing.

**Core philosophy:**

Don't teach students an equation and then show them an example of skiing. Let them experiment with skiing first, then introduce the mathematics that explains what they just experienced.

### Core learning outcomes

By completing Carve Lab, students should understand:

1. How ski sidecut influences the shape of a turn.
2. How increasing edge angle affects turning radius.
3. How speed influences centripetal acceleration.
4. How skier mass influences the force required to make a turn.
5. How radius, velocity, and acceleration are mathematically related.
6. How to interpret graphs and use mathematical models to predict physical outcomes.

# 2. User Experience Overview

Carve Lab should feel like an interactive ski game combined with a physics laboratory.

Students enter a visually engaging ski environment where they can experiment with different skiing conditions.

The primary experience consists of four interconnected activities:

- **Explore:** Experiment freely with ski specifications and skiing variables.
- **Simulate:** Watch an animated skier perform turns based on selected variables.
- **Analyze:** Examine mathematical outputs, diagrams, and real-time graphs.
- **Challenge:** Solve progressively more difficult ski-related mathematical problems.

The simulator must be the central feature. Graphs, explanations, and challenges should enhance the experience rather than overwhelm it.

# 3. Main Interface and Layout

## 3.1 Main Screen

Create a polished, modern interface consistent with the existing Mathlete Ski brand and the visual language of Jump Lab.

The main interface should have three primary regions.

### A. Simulation Canvas — Center

This is the visual centerpiece.

Display:
- A skier on a snowy slope.
- An interactive top-down view of a carving turn.
- A visible curved path representing the skier's trajectory.
- The center of the turn.
- A radius indicator connecting the center to the trajectory.
- Direction arrows showing skier movement.
- An inward acceleration/force vector.
- A secondary ski cross-section illustrating the ski's edge angle.

The student should immediately understand that changing the variables changes the skier's path and the physics of the turn.

Use smooth animation and polished visual effects. Avoid making this look like a traditional school graph or spreadsheet.

### B. Control Panel — Right Side

A dedicated control panel allows students to manipulate their skiing variables.

Every control should have:
- A clear variable name.
- A slider.
- A numerical value.
- A unit of measurement.
- A short explanation.
- Immediate feedback when the value changes.

### C. Analysis Panel — Bottom

This region displays:
- Calculated turn radius.
- Centripetal acceleration.
- Required inward force.
- Lateral acceleration in multiples of gravity.
- Interactive mathematical graphs.
- Short explanations of the relationships between variables.

The analysis panel should be expandable and collapsible so the simulation remains visually dominant.

## 3.2 Responsive Design

Desktop is the primary experience.

On mobile:
- Simulation canvas appears first.
- Controls move below the canvas.
- Analysis graphs become vertically stacked.
- Controls remain touch-friendly.
- No horizontal overflow.

# 4. Interactive Ski Simulator

This is the core engineering component.

Students must be able to manipulate four variables.

## 4.1 Ski Sidecut Radius

**Control:** Sidecut Radius

Suggested range: 10–30 meters  
Default: 15 meters

Explain to students:

The sidecut is the curved shape along the edge of a ski. A ski with a smaller sidecut radius has a deeper curve, while a ski with a larger sidecut radius has a shallower curve.

Changing this value should immediately update the ski's visual geometry and the estimated turn radius.

Educational objective:
- Geometry
- Circles and radius
- Relationships between equipment design and physical behavior

## 4.2 Ski Edge Angle

**Control:** Edge Angle

Suggested range: 0–65 degrees  
Default: 35 degrees

Display a small secondary visualization showing a ski tilted onto its edge.

As the student increases the edge angle:
- The ski becomes more tilted.
- The idealized turning radius decreases.
- The trajectory becomes tighter.
- The turn-radius calculation updates.
- The graph marker moves accordingly.

Educational objective:
- Angles
- Trigonometry
- Cosine functions
- Nonlinear relationships

## 4.3 Skiing Speed

**Control:** Speed

Suggested range: 3–20 m/s  
Default: 10 m/s

Display speed in both meters per second and kilometers per hour, with an optional miles-per-hour display setting.

As speed increases:
- The skier animation moves faster.
- The calculated centripetal acceleration increases.
- The calculated inward force increases.
- The force vector becomes visually larger.
- Relevant graphs update.

This variable is particularly important because students should discover that doubling speed quadruples centripetal acceleration when radius stays constant.

Educational objective:
- Squared relationships
- Proportional reasoning
- Velocity
- Acceleration
- Functions and graphs

## 4.4 Skier Mass

**Control:** Skier Mass

Suggested range: 35–110 kg  
Default: 65 kg

As the student changes mass:
- Required inward force updates.
- Centripetal acceleration remains unchanged when speed and radius are constant.
- Force visualization changes.

This creates a valuable mathematical discovery:

A heavier skier requires more inward force to follow the same turn at the same speed, but their centripetal acceleration is unchanged.

Educational objective:
- Newton's second law
- Mass
- Force
- Independent and dependent variables

# 5. Physics and Mathematical Engine

The simulator must use a dedicated physics calculation module separate from the UI.

All displayed values must be derived from the same source of truth.

## 5.1 Idealized Carving Turn Radius

For the initial educational model, use:

**R = Rsc × cos(θ)**

Where:

- R = estimated turn radius (meters)
- Rsc = ski sidecut radius (meters)
- θ = edge angle (degrees)

The equation is an idealized geometric approximation of a carved turn on a rigid surface.

Example:

Sidecut radius = 16 meters  
Edge angle = 60 degrees

R = 16 × cos(60°)

R = 8 meters

The simulator should immediately update its trajectory visualization.

Important: This is not a complete real-world ski dynamics model. Actual turning radius is also affected by ski flex, loading, snow penetration, snow strength, ski construction, and skidding. Clearly communicate these assumptions in the educational explanation.

## 5.2 Centripetal Acceleration

Implement:

**a = v² / R**

Where:

- a = centripetal acceleration (m/s²)
- v = skiing speed (m/s)
- R = turn radius (m)

Example:

Speed = 10 m/s  
Turn radius = 8 meters

a = 10² / 8

a = 12.5 m/s²

Display the result in:
- m/s²
- g-force equivalent, calculated as a / 9.81

## 5.3 Required Inward Force

Implement:

**F = m × a**

Where:

- F = required net inward force (Newtons)
- m = skier mass (kg)
- a = centripetal acceleration (m/s²)

Example:

Mass = 65 kg  
Acceleration = 12.5 m/s²

F = 65 × 12.5

F = 812.5 Newtons

The force vector should point toward the center of the turn.

Clarify that this represents the idealized net inward force demand, not a complete model of the individual ski-snow contact forces.

## 5.4 Turn Duration

For an illustrative 180-degree circular turn at constant speed:

**Distance = π × R**

**Time = (π × R) / v**

Show:
- Turn distance.
- Estimated time to complete the turn.

This gives students another opportunity to explore relationships between distance, speed, and time.

## 5.5 Physics Engine Requirements

Create a reusable module with pure calculation functions.

Suggested structure:

`src/features/carve-lab/physics/`

- `calculateTurnRadius()`
- `calculateCentripetalAcceleration()`
- `calculateInwardForce()`
- `calculateGForce()`
- `calculateTurnDistance()`
- `calculateTurnDuration()`
- `convertUnits()`

Requirements:
- Use radians internally for trigonometric calculations where appropriate.
- Convert displayed angles from degrees.
- Prevent division by zero.
- Clamp controls to valid ranges.
- Use consistent units internally.
- Recalculate dependent values whenever an input changes.
- Add unit tests for all calculations.

# 6. Simulation Animation

The animation should make the mathematics visible.

## 6.1 Skier Movement

When the student presses START TURN:
- The skier begins moving along the calculated curved trajectory.
- Movement speed corresponds to the selected speed.
- The skier follows the estimated turn radius.
- A trajectory line gradually appears behind the skier.
- The current position is visible.
- Force and velocity vectors can be displayed.

Include:
- Play
- Pause
- Restart
- Animation speed control
- Optional vector visibility toggle

The animation should not require recalculating the entire simulation on every frame. Calculate the trajectory and physics state separately, then animate the skier along the resulting path.

## 6.2 Linked Turns

Add an additional animation showing the skier transitioning between left and right turns.

The student should see how a series of alternating curves forms an S-shaped skiing line.

For the initial version, linked turns can be visual approximations assembled from alternating circular arcs. Ensure smooth transitions between arcs.

The individual turn-radius calculations should remain consistent with the selected physics model.

## 6.3 Force Visualization

Allow students to toggle three vectors:

- Velocity: tangent to the skier's path.
- Centripetal acceleration: pointing toward the turn center.
- Required inward force: pointing toward the turn center.

Use visually distinct colors, labels, and arrow sizes.

Students should be able to pause the skier anywhere along the path and inspect the vectors at that position.

# 7. Interactive Graph Lab

This is one of the most important educational components.

Students must be able to see the relationships between variables rather than simply read their calculated results.

Build interactive graphs that update automatically when controls change.

## Graph 1: Turn Radius vs. Edge Angle

X-axis: Edge angle (degrees)

Y-axis: Estimated turn radius (meters)

Formula:

R = Rsc × cos(θ)

Display:
- A smooth curve.
- Current edge angle.
- Current turn radius.
- A highlighted current coordinate.
- Interactive tooltips.

Learning objective:

Students discover that increasing edge angle decreases the estimated turning radius, following a nonlinear cosine relationship.

## Graph 2: Centripetal Acceleration vs. Speed

X-axis: Speed (m/s)

Y-axis: Centripetal acceleration (m/s²)

Formula:

a = v² / R

Display a quadratic curve.

Allow students to move the speed slider and watch their position on the graph change.

Learning objective:

Students discover that doubling speed quadruples acceleration when radius is fixed.

## Graph 3: Required Inward Force vs. Speed

X-axis: Speed (m/s)

Y-axis: Force (N)

Formula:

F = mv² / R

Display a quadratic curve.

Learning objective:

Students understand how mass, speed, and turn radius collectively influence force.

## Graph 4: Compare Two Ski Setups

Provide a comparison mode where students can save two configurations.

Example:

**Setup A**
- Sidecut: 15 m
- Edge angle: 30°
- Speed: 8 m/s

**Setup B**
- Sidecut: 15 m
- Edge angle: 50°
- Speed: 8 m/s

Show:
- Both trajectories.
- Both turn radii.
- Both acceleration values.
- Both force values.

Students should be able to visually and mathematically compare the two scenarios.

This is particularly valuable for learning how changing one variable affects an entire system.

# 8. Challenge Arena

The challenge arena turns the simulator into an actual learning experience.

Students should not just experiment with sliders. They should have missions to complete.

Each challenge should contain:

1. A skiing-related scenario.
2. A mathematical problem.
3. A prediction question.
4. An interactive simulation.
5. A measurable objective.
6. A post-challenge explanation.

Students should be required to make a prediction before running a simulation.

## Challenge 01 — Sidecut Detective

**Difficulty:** Beginner  
**Concept:** Geometry and radius

Scenario:

You have two different pairs of skis.

Ski A has a sidecut radius of 12 meters.

Ski B has a sidecut radius of 24 meters.

Both skis are placed on the same edge angle.

Question:

Which ski will produce the tighter idealized carved turn?

Students must:
- Select their prediction.
- Run both configurations.
- Compare the resulting trajectories.
- Explain the difference.

## Challenge 02 — Edge Angle Experiment

**Difficulty:** Beginner  
**Concept:** Trigonometry

Scenario:

You're skiing on a pair of skis with a 16-meter sidecut radius.

Your objective is to produce an estimated turn radius of 12 meters.

Question:

What edge angle do you need?

Students manipulate the edge-angle slider until they achieve the target.

The challenge should reward understanding rather than blind trial and error.

## Challenge 03 — Speed Is Everything

**Difficulty:** Intermediate  
**Concept:** Quadratic relationships

Scenario:

You are carving a turn at 10 m/s.

Your speed doubles to 20 m/s while your turn radius stays the same.

Question:

What happens to centripetal acceleration?

Possible answers:
- It doubles.
- It triples.
- It quadruples.
- It stays the same.

Students must predict the result before using the simulator.

After the simulation, show the mathematical explanation.

## Challenge 04 — The Heavy Skier Experiment

**Difficulty:** Intermediate  
**Concept:** Newton's second law

Scenario:

Two skiers travel at the same speed and follow the same turn radius.

Skier A weighs 50 kg.

Skier B weighs 100 kg.

Question:

Which skier requires more inward force?

Students must recognize that acceleration remains constant while the required net inward force doubles.

## Challenge 05 — Design Your Turn

**Difficulty:** Advanced  
**Concept:** Algebra, trigonometry, physics

Scenario:

Design a ski configuration that achieves a specified turning radius while staying within the challenge's speed and force constraints.

Students must use:
- Sidecut radius.
- Edge angle.
- Speed.
- Mass.

Allow multiple valid answers.

Reward students who reach the target with a mathematically sound explanation.

## Challenge Progression

Challenges should become progressively more difficult.

Track:
- Completed challenges.
- Accuracy.
- Number of attempts.
- Hints used.
- Prediction accuracy.
- Concepts mastered.

Do not reward only successful simulations. Reward reasoning, experimentation, and improved understanding.

# 9. Learning and Explanation System

Every variable should have a corresponding educational explanation.

Add contextual help icons next to controls and calculated outputs.

Example:

**What is centripetal acceleration?**

When an object moves in a circular path, its velocity continually changes direction. This means it is accelerating toward the center of the circle.

Even when speed stays constant, the object is accelerating because its direction changes.

In skiing, this helps explain why a skier needs an inward force to follow a curved path.

Every explanation should include:
- A plain-language definition.
- The relevant equation.
- A visual example.
- A real-world skiing connection.
- An optional deeper explanation.

## Interactive Math Coach

If Mathlete's existing AI tutoring infrastructure is available, integrate an AI Math Coach.

The coach should understand:
- Current simulator settings.
- Calculated outputs.
- Current challenge.
- Student's selected answers.
- Previous attempts.
- Relevant mathematical concept.

Example interaction:

Student: "Why did my acceleration increase so much when I doubled my speed?"

Coach:

"Great question! Look at the equation a = v² / r.

Notice that speed is squared. That means doubling your speed doesn't just double acceleration. It multiplies acceleration by four.

Try testing it in the simulator. Keep your turn radius constant and double your speed."

The coach must encourage reasoning instead of immediately supplying challenge answers.

The core simulator and challenges must function without AI availability.

# 10. Student Progress Tracking

Carve Lab should be designed to connect with Mathlete's existing student and organization structure.

Save:
- Student ID.
- Organization ID where applicable.
- Simulator configurations.
- Challenge progress.
- Completed activities.
- Mathematical concepts practiced.
- Attempts and results.
- Time spent.
- Hints requested.

Allow students to save an interesting simulation and revisit it later.

Potential future capability:

A tutor can review a student's experiments and use them as the foundation for a virtual tutoring session.

# 11. Suggested Component Architecture

Adapt to the existing Mathlete Ski codebase and reuse its existing authentication, styling, routing, and data conventions.

Do not introduce a separate application or duplicate existing services.

Suggested feature structure:

`src/features/carve-lab/`

```text
carve-lab/
├── components/
│   ├── CarveLabPage
│   ├── SimulationCanvas
│   ├── SkiControlPanel
│   ├── SkiVisualization
│   ├── EdgeAngleDiagram
│   ├── TurnPath
│   ├── ForceVectors
│   ├── SimulationControls
│   ├── ResultsPanel
│   ├── GraphLab
│   ├── ChallengeArena
│   ├── ChallengeCard
│   ├── MathExplanation
│   └── MathCoach
│
├── physics/
│   ├── calculations
│   ├── units
│   └── physics.test
│
├── hooks/
│   ├── useCarveSimulation
│   └── useCarveProgress
│
├── data/
│   └── challenges
│
├── types/
│   └── carveLab
│
└── utils/
    └── simulationHelpers
```

This is a suggested organization, not a mandate to restructure existing application code.

## Technical Guidance

- Prefer SVG or Canvas for the initial 2D simulation.
- Reuse existing charting libraries where possible.
- Avoid introducing a heavyweight 3D dependency for the first version.
- Use a dedicated physics engine module.
- Keep calculations separate from visualization components.
- Make simulation state deterministic and reproducible.
- Debounce expensive graph rendering if needed, but maintain responsive slider feedback.
- Ensure all controls are accessible by keyboard.
- Use responsive design patterns from the existing application.

# 12. Data Structures

Create a reusable simulation configuration.

Example:

```typescript
interface CarveConfiguration {
  sidecutRadius: number;
  edgeAngle: number;
  speed: number;
  skierMass: number;
}

interface CarveResults {
  turnRadius: number;
  centripetalAcceleration: number;
  inwardForce: number;
  gForce: number;
  turnDistance: number;
  turnDuration: number;
}

interface CarveChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[];
  initialConfiguration: CarveConfiguration;
  objective: string;
  target: Record<string, number>;
}
```

Challenge definitions should be data-driven so new challenges can be added without changing simulator logic.

# 13. Acceptance Criteria

The feature is considered complete when all of the following work correctly.

### Simulator

- Student can adjust all four primary variables.
- All dependent calculations update immediately.
- Ski visual changes with sidecut and edge angle.
- Turn trajectory updates with configuration changes.
- Skier animation follows the displayed trajectory.
- Play, pause, and restart work correctly.
- Vector toggles work.

### Mathematical Calculations

- Turn radius uses the specified idealized cosine model.
- Centripetal acceleration uses v²/R.
- Required inward force uses ma.
- Units are displayed correctly.
- Zero-radius and invalid input cases are handled safely.
- All calculations pass unit tests.

### Graph Lab

- All four graph experiences render.
- Graphs update with input changes.
- Current values are highlighted.
- Axis labels and units are correct.
- Comparison mode supports two configurations.

### Challenge Arena

- All five initial challenges are accessible.
- Students must predict before running the designated challenges.
- Answers are evaluated correctly.
- Hints and explanations are available.
- Progress persists when the student returns.

### User Experience

- Interface is responsive.
- Animations are smooth.
- Controls are accessible.
- Reset returns the simulator to its original state.
- Simulator works without the AI coach.
- No calculation or graph contradicts the physics engine.

# 14. Development Roadmap

Build this in independent, testable phases.

## Phase 1 — Physics Foundation

Priority: Critical

Implement:
- Carving calculations.
- Unit conversions.
- Configuration and result types.
- Unit tests.
- Initial simulation state.

Deliverable: A validated educational calculation engine.

## Phase 2 — Interactive Carve Simulator

Priority: Critical

Implement:
- Main interface.
- Simulation canvas.
- Ski visualization.
- Four control sliders.
- Live numerical outputs.
- Animated skier.
- Curved trajectory.
- Force and velocity vectors.

Deliverable: A working interactive carving simulator.

## Phase 3 — Graph Lab

Priority: High

Implement:
- Turn radius vs. edge angle.
- Acceleration vs. speed.
- Force vs. speed.
- Two-configuration comparison.

Deliverable: A complete interactive physics exploration experience.

## Phase 4 — Challenge Arena

Priority: High

Implement:
- Five initial challenges.
- Prediction questions.
- Challenge evaluation.
- Contextual explanations.
- Hint system.
- Progress tracking.

Deliverable: A structured educational product rather than simply a simulator.

## Phase 5 — Math Coach and Student Integration

Priority: Medium

Implement:
- AI Math Coach integration where existing infrastructure permits.
- Student progress persistence.
- Organization-aware assignments.
- Tutor-facing progress visibility.

Deliverable: A learning tool integrated into the larger Mathlete platform.

# 15. Important Product Design Principles

These principles should guide every implementation decision.

**1. Simulation first, mathematics second.**

The skier and interactive environment should capture the student's attention. Equations should be introduced when they help explain what the student is seeing.

**2. Every control must have a learning purpose.**

Don't add sliders simply because they're entertaining. Every variable should demonstrate a mathematical or physical relationship.

**3. Make cause and effect immediate.**

When a student changes edge angle, the turn should visibly tighten. When they increase speed, the force visualization and numerical results should respond immediately.

**4. Encourage predictions.**

Students should think before interacting. Prediction questions are central to turning experimentation into learning.

**5. Teach understanding, not memorization.**

The desired outcome is not simply knowing that a = v²/r. It is understanding why this equation describes something happening while skiing.

**6. Preserve scientific honesty.**

Clearly distinguish idealized model predictions from actual skiing. Do not use the simulator to give real-world skiing safety recommendations.

# 16. Definition of Success

Carve Lab should be successful when a student who previously struggled with physics can interact with the simulator and begin explaining the science of turning in their own words.

A student should leave understanding why:
- Different ski designs produce different idealized turn radii.
- Edge angle changes the geometry of a turn.
- Speed has a squared relationship with centripetal acceleration.
- Mass changes required force.
- Graphs and equations describe the behavior of the skier they just watched.

**The ultimate goal:**

A student opens Carve Lab because they love skiing, spends time experimenting with their ideal ski setup, and leaves with a better understanding of geometry, trigonometry, algebra, and physics.

That is the Mathlete learning experience.