# Mathlete MTB — Berm Lab
## The Science of Cornering
### Product Requirements Document (PRD)

**Product:** Mathlete MTB  
**Feature:** Berm Lab — The Science of Cornering  
**Priority:** Flagship interactive learning experience  
**Platform:** Mathlete MTB web application  
**Implementation:** Claude Code / Full-Stack Development  
**Primary Audience:** Middle school and high school students, particularly mountain bikers

---

# 1. Product Vision

Build an immersive, interactive mountain biking simulator that teaches students the mathematics and physics behind cornering.

Students should be able to manipulate a virtual berm, experiment with different riding lines, adjust their speed, change the berm angle, and explore how the physics of cornering changes with each decision.

The experience should make students feel like they are designing, testing, and optimizing their own mountain bike corners.

Instead of learning equations in isolation, students discover mathematical relationships by experimenting with something they already love.

### Core Learning Philosophy

**Use mountain biking as the context. Use mathematics as the medium. Teach students how to think.**

### Learning Outcomes

By completing Berm Lab, students should understand:

1. How corner radius influences centripetal acceleration.
2. Why speed has a squared relationship with centripetal acceleration.
3. How banking changes the forces acting on a rider through a corner.
4. How berm angle influences the grip demand required to maintain a turn.
5. How different riding lines change turn radius and cornering demands.
6. How rider and bike mass influence the forces involved in cornering.
7. How to use geometry, trigonometry, algebra, and graphs to analyze real-world mountain biking scenarios.

# 2. User Experience Overview

Berm Lab should feel like a combination of a mountain biking video game, a physics simulator, and an interactive mathematics laboratory.

The student enters a mountain bike trail environment featuring a large, visually engaging berm.

They can experiment with five primary variables:

- Corner radius / riding line.
- Riding speed.
- Berm banking angle.
- Rider and bike mass.
- Available tire-ground grip (an illustrative model setting).

Every adjustment should immediately update the simulation and mathematical outputs.

The core experience has four interconnected activities:

**EXPLORE:** Experiment freely with different cornering configurations.

**SIMULATE:** Watch a virtual mountain biker ride through the berm.

**ANALYZE:** Examine the geometry, forces, acceleration, and mathematical relationships.

**CHALLENGE:** Complete increasingly difficult cornering challenges using mathematical reasoning.

The simulator should always be the main attraction.

# 3. Main Interface and Layout

## 3.1 Main Screen

Create a polished, modern interface consistent with the existing Mathlete MTB design language.

The screen should have three primary regions.

### A. Simulation Canvas — Center

This is the visual centerpiece.

Display an animated mountain biker traveling through a bermed corner.

The student should be able to switch between two visualization perspectives:

**Top-Down View**
- Shows the entire corner.
- Displays the selected riding line.
- Shows the turn radius.
- Identifies corner entry, apex, and exit.
- Shows the direction of travel.
- Displays the center of the turn.
- Displays the inward acceleration vector.

**Berm Cross-Section View**
- Shows the berm's banking angle.
- Displays the bike and rider leaning through the turn.
- Shows the ground surface.
- Displays the normal force perpendicular to the berm.
- Shows the friction force along the surface.
- Shows gravity acting vertically downward.

The two perspectives must represent the same simulation configuration.

### B. Control Panel — Right Side

Create an interactive control panel with five primary variables.

Each control should include:
- Variable name.
- Slider.
- Numerical value.
- Unit.
- Short educational explanation.
- Immediate feedback.

### C. Analysis Panel — Bottom

Create an expandable analysis panel displaying:

- Turn radius.
- Centripetal acceleration.
- Required inward force.
- Modeled tire-grip demand.
- Available grip setting.
- Estimated lean angle.
- Idealized berm-matched speed.
- Interactive graphs.

The analysis panel should be expandable and collapsible.

Keep the simulation visually dominant.

# 4. Interactive Berm Builder

This is the primary interactive feature.

Students should be able to build and modify a hypothetical mountain bike corner.

## 4.1 Corner Radius / Riding Line

**Control:** Riding Line

Suggested corner radius range: 3–12 meters.

Default: 6 meters.

Provide three quick-selection presets:

- Tight Line: 4 meters.
- Middle Line: 6 meters.
- Wide Line: 8 meters.

Allow students to fine-tune the radius with a slider.

The top-down simulation should display all three potential riding lines simultaneously.

The selected line should be highlighted.

As the student switches lines:
- The trajectory updates.
- The turn radius changes.
- The centripetal acceleration updates.
- The estimated lean angle updates.
- The modeled grip demand updates.
- Relevant graphs update.

**Educational objective:**

Teach how geometric radius influences acceleration and the forces required to negotiate a corner.

Students should discover that a wider-radius line generally creates a lower centripetal acceleration at the same speed.

For the MVP, treat the selected riding line as a circular arc with a locally constant berm angle. The more advanced version can model how the berm profile changes across different lines.

## 4.2 Riding Speed

**Control:** Speed

Suggested range: 5–35 km/h.

Default: 22 km/h.

Display:
- Kilometers per hour.
- Meters per second.
- Optional miles per hour.

As speed increases:
- The bike animation moves faster.
- Centripetal acceleration increases.
- Required inward force increases.
- Modeled tire-grip demand increases.
- Estimated lean angle increases.
- The force vectors update.

The visualization should make the effect of speed immediately apparent.

**Educational objective:**

Teach quadratic relationships and proportional reasoning.

A key discovery should be that doubling speed quadruples centripetal acceleration when radius stays constant.

## 4.3 Berm Banking Angle

**Control:** Berm Angle

Suggested range: 0–45 degrees.

Default: 25 degrees.

The berm visualization must physically reflect the selected angle.

At zero degrees, the student sees a flat corner.

As the angle increases:
- The berm cross-section becomes steeper.
- The normal force vector changes direction.
- The inward component of the normal force increases.
- The modeled tire-grip demand changes.
- The idealized matched speed changes.

Display the current angle numerically.

Add a small cross-sectional diagram showing the relationship between the horizontal ground and the banked berm.

**Educational objective:**

Teach angles, trigonometry, force components, and the mathematics of banked curves.

Students should discover that a properly banked turn can provide part of the inward force necessary to follow a curved path.

## 4.4 Rider and Bike Mass

**Control:** Total Rider + Bike Mass

Suggested range: 35–120 kg.

Default: 80 kg.

The student changes the combined mass of the rider and bike.

As mass increases:
- Required net inward force increases.
- Normal force increases.
- Modeled friction force increases.
- Centripetal acceleration stays the same.
- Modeled required grip coefficient stays the same under the idealized model.

This is an important mathematical discovery.

Two riders following the same turn at the same speed do not require different centripetal acceleration simply because they have different masses. However, the heavier system requires greater force.

**Educational objective:**
- Newton's second law.
- Mass.
- Force.
- Proportional reasoning.

## 4.5 Available Tire Grip

**Control:** Available Grip

Suggested range: 0.2–0.8.

Default: 0.45.

This is an illustrative effective grip coefficient used by the educational model, not a measured tire-grip specification.

Students can increase or decrease the available grip setting.

The interface should provide simple descriptions such as:
- Lower modeled grip.
- Moderate modeled grip.
- Higher modeled grip.

As available grip changes:
- The grip-demand indicator updates.
- The model's ability to maintain the selected turning path updates.
- The simulation communicates whether the selected turn exceeds the modeled grip limit.

Use an informative traction indicator:

- Within modeled grip availability.
- Approaching modeled grip limit.
- Exceeds modeled grip availability.

Do not present these statuses as real-world predictions of safety or crash probability.

**Educational objective:**
- Variables and inequalities.
- Coefficients.
- Friction.
- Comparing available and required quantities.

# 5. Physics and Mathematical Engine

The physics engine must be implemented independently of the UI.

All numerical outputs, animations, and graphs must derive from one consistent calculation module.

The first version should use a simplified steady-state banked-turn model.

## 5.1 Centripetal Acceleration

Implement:

**a = v² / r**

Where:

- a = centripetal acceleration (m/s²).
- v = riding speed (m/s).
- r = horizontal radius of the selected riding line (m).

Example:

Speed = 8 m/s.

Corner radius = 6 meters.

a = 8² / 6

a = 10.67 m/s².

This is the net inward acceleration needed to follow the idealized circular path.

Display:
- m/s².
- Equivalent acceleration in g units.

The g equivalent is calculated by dividing acceleration by 9.81.

## 5.2 Required Net Inward Force

Implement:

**F = m × v² / r**

Where:

- F = required net inward force (Newtons).
- m = total rider and bike mass (kg).
- v = speed (m/s).
- r = corner radius (m).

Example:

Mass = 80 kg.

Speed = 8 m/s.

Radius = 6 meters.

F = 80 × 8² / 6

F = 853.3 Newtons.

Important distinction:

This is the total net inward force required for the turn. It is not necessarily the same as the sideways friction force at the tires because the berm's normal force also contributes to the inward force.

## 5.3 Required Lean Angle

For a simplified steady turn, implement:

**θ = arctan(v² / rg)**

Where:

- θ = idealized combined rider-bike lean angle measured from vertical.
- v = speed (m/s).
- r = corner radius (m).
- g = gravitational acceleration (9.81 m/s²).

Example:

Speed = 8 m/s.

Radius = 6 meters.

θ = arctan(64 / 58.86)

θ ≈ 47.4 degrees.

This is a simplified balance model. Actual mountain biking involves bike-body separation, rider positioning, tire deformation, and other effects that are not represented by this lean-angle calculation.

Display the result in degrees.

The cross-section visualization should reflect the idealized combined system lean rather than attempting to reproduce exact professional riding technique.

## 5.4 Banking Angle and Idealized Matched Speed

One of the most important educational features.

A banked corner can provide part of the inward force required to follow a curved path.

Under an idealized model with no lateral friction requirement, the speed that matches the banking angle is:

**v = √(r × g × tan(β))**

Where:

- v = idealized matched speed (m/s).
- r = horizontal turning radius (m).
- g = gravitational acceleration (9.81 m/s²).
- β = berm banking angle.

Example:

Radius = 6 meters.

Banking angle = 30 degrees.

v = √(6 × 9.81 × tan(30°))

v ≈ 5.84 m/s.

Convert to kilometers per hour:

v ≈ 21.0 km/h.

At this idealized matching speed, the required lateral friction force is zero.

The student should see the difference between:
- Current selected speed.
- Idealized matched speed.
- Current berm banking angle.

This should become an important part of the challenge system.

For a flat corner with a zero-degree bank, do not display a zero matched speed as a meaningful operating target. Instead explain that a flat corner relies entirely on lateral tire-ground friction for the idealized horizontal turning demand.

## 5.5 Modeled Tire-Grip Demand

This is the most interesting physics feature of Berm Lab.

Unlike a flat corner, a banked berm allows the normal force from the surface to contribute to centripetal acceleration.

We need to calculate how much friction is still required to maintain the selected circular path.

Define:

**q = v² / (rg)**

Where q is a dimensionless turning-demand ratio.

Let:

- β = berm angle in radians.
- m = combined rider and bike mass.
- N = normal force.
- f = signed friction force along the berm surface.

Assume:
- The outer edge of the berm is raised.
- The surface banks toward the center of the turn.
- The rider follows a constant-radius path.
- Speed and banking remain constant through the modeled turn.
- The system is in steady-state equilibrium in the vertical direction.

Calculate normal force:

**N = mg(cos β + q sin β)**

Calculate the signed friction force along the surface:

**f = mg(sin β − q cos β)**

For this convention, positive friction acts uphill along the berm surface, and negative friction acts downhill.

The required effective grip coefficient is:

**μ_required = |f| / N**

This can be expressed as:

**μ_required = |sin β − q cos β| / (cos β + q sin β)**

For a flat corner where β = 0:

**μ_required = v² / (rg)**

This gives students an extremely useful discovery.

At the idealized matched speed for a banked turn, the required lateral friction coefficient becomes zero.

At speeds above or below that matched speed, the model calculates a friction requirement.

Compare:

**Modeled Required Grip**

vs.

**Illustrative Available Grip**

If:

μ_required ≤ μ_available

The selected path is within the model's available grip assumption.

If:

μ_required > μ_available

The selected path exceeds the model's assumed grip limit.

Visualize this with a traction indicator and an explanatory message.

The simulation should never present the comparison as a definitive statement about whether a real rider can safely complete a turn.

## 5.6 Turn Distance and Duration

For the initial simulation, model the corner as a 180-degree circular arc.

Calculate:

**Arc Length = π × r**

**Turn Duration = (π × r) / v**

Display:
- Total arc distance.
- Estimated time through the corner.

Students can observe how different riding lines affect both distance and time.

These calculations assume constant speed and do not include braking, pedaling, or acceleration through the corner.

## 5.7 Physics Engine Requirements

Suggested structure:

`src/features/berm-lab/physics/`

Implement:

- `calculateCentripetalAcceleration()`
- `calculateNetInwardForce()`
- `calculateLeanAngle()`
- `calculateIdealMatchedSpeed()`
- `calculateNormalForce()`
- `calculateFrictionForce()`
- `calculateRequiredGrip()`
- `calculateGripMargin()`
- `calculateTurnDistance()`
- `calculateTurnDuration()`
- `convertUnits()`

Requirements:
- Use radians internally for trigonometric calculations.
- Use consistent SI units.
- Convert UI values before calculations.
- Prevent division by zero.
- Validate input ranges.
- Handle flat corners separately when calculating matched speed.
- Keep all displayed outputs synchronized.
- Add unit tests for every calculation.
- Keep calculations deterministic and independent of the animation frame rate.

# 6. Animated Berm Simulation

The simulation should make the mathematics visible.

## 6.1 Top-Down Animation

Create a top-down visualization of a 180-degree bermed corner.

Display:
- Entry point.
- Apex.
- Exit point.
- Three possible riding lines.
- Selected line.
- Turn center.
- Radius indicator.
- Direction of travel.
- Inward acceleration vector.
- Animated rider and bike.

When the student presses START TURN:
- The biker travels through the selected arc.
- The trajectory line gradually appears.
- Speed controls animation timing.
- The radius indicator remains visible.
- The current position is displayed.

Provide:
- Play.
- Pause.
- Restart.
- Animation speed control.
- Vector visibility toggle.

## 6.2 Berm Cross-Section Animation

Create a secondary perspective that shows the rider and bike negotiating the berm.

The visualization should display:
- Horizontal reference line.
- Berm surface angle.
- Combined system lean angle.
- Normal force arrow.
- Friction force arrow.
- Gravity vector.
- Current acceleration state.

As the student changes the berm angle or speed, the diagram updates.

The purpose is to visually demonstrate why banked surfaces alter the forces involved in turning.

## 6.3 Force Visualization

Allow students to toggle the following vectors:

**Velocity Vector**

Points tangent to the rider's trajectory.

**Centripetal Acceleration Vector**

Points toward the center of the corner.

**Net Inward Force**

Points toward the center of the turn.

**Normal Force**

Perpendicular to the berm surface.

**Gravity**

Always points vertically downward.

**Tire-Ground Friction**

Acts along the berm surface in the direction required by the simplified model.

Add hover explanations for every vector.

Avoid teaching centrifugal force as an additional real force in this ground-based reference frame. Explain that the outward sensation is associated with inertia, while the actual net acceleration is inward.

## 6.4 Model Limit Visualization

If the calculated grip demand exceeds the available model setting:

- Highlight the traction indicator.
- Display the intended line as a dashed trajectory.
- Explain that the simplified model cannot support the selected path under the chosen assumptions.

Do not create a simulated crash.

The goal is to explain the relationship between grip and cornering demand, not to predict real-world accidents.

# 7. Interactive Graph Lab

This is one of the most academically valuable parts of Berm Lab.

Students should be able to interact with graphs and directly connect them to what they see in the simulation.

## Graph 1 — Centripetal Acceleration vs. Speed

X-axis: Speed (m/s).

Y-axis: Centripetal acceleration (m/s²).

Formula:

a = v² / r

Display a quadratic curve.

Students should:
- Adjust the speed slider.
- See their current position on the graph.
- Observe how acceleration changes.
- Compare the effect of doubling and tripling speed.

Learning objective:

Understand quadratic relationships.

## Graph 2 — Required Grip vs. Berm Angle

X-axis: Berm angle (degrees).

Y-axis: Required effective grip coefficient.

Keep speed and radius constant.

Display the calculated relationship using the banked-turn model.

The graph should show the angle at which required lateral friction reaches its minimum.

Highlight the idealized matched banking angle:

β = arctan(v² / rg)

Students should see that the lowest theoretical grip demand occurs when the berm angle matches the speed and corner radius in this idealized model.

Learning objective:
- Trigonometry.
- Nonlinear functions.
- Mathematical optimization.

## Graph 3 — Required Grip vs. Corner Radius

X-axis: Corner radius (meters).

Y-axis: Required effective grip coefficient.

Keep speed and berm angle constant.

Students should discover how a larger turning radius generally decreases the modeled grip requirement for a fixed speed and bank angle.

Learning objective:
- Inverse relationships.
- Functions.
- Variables and constants.

## Graph 4 — Required Force vs. Rider and Bike Mass

X-axis: Combined mass (kg).

Y-axis: Required net inward force (N).

Formula:

F = mv² / r

Display a linear graph.

Students should see that doubling mass doubles the required inward force when speed and radius remain constant.

Learning objective:
- Linear relationships.
- Proportional reasoning.
- Newton's second law.

## Graph Interaction Requirements

All graphs should:
- Update automatically when their relevant variables change.
- Display axis labels and units.
- Display current numerical values.
- Support interactive tooltips.
- Show a highlighted current configuration.
- Allow students to reveal the associated equation.
- Connect graph points to the corresponding simulator state where practical.

# 8. Line Comparison Lab

This should be one of the most fun and distinctive features of Berm Lab.

Give students three different ways to ride through the exact same corner.

**TIGHT LINE**

A smaller horizontal turning radius.

**MIDDLE LINE**

A moderate turning radius.

**WIDE LINE**

A larger horizontal turning radius.

Allow students to compare all three simultaneously.

Display:
- Different trajectories.
- Different turning radii.
- Centripetal acceleration.
- Required inward force.
- Estimated turn duration.
- Modeled tire-grip demand.

Include a comparison table.

Example:

| Measurement | Tight | Middle | Wide |
|---|---:|---:|---:|
| Radius | 4 m | 6 m | 8 m |
| Speed | 22 km/h | 22 km/h | 22 km/h |
| Acceleration | Calculated | Calculated | Calculated |
| Grip demand | Calculated | Calculated | Calculated |
| Turn duration | Calculated | Calculated | Calculated |

The values must be generated dynamically from the physics engine.

Students should be able to predict which line creates the lowest cornering demand before running the comparison.

For the initial version, use the same local berm banking angle across the three lines. Explain that this is a simplified comparison. Future versions can model changing bank angle and berm geometry as the rider moves higher or lower on the berm.

# 9. Challenge Arena

This is what transforms Berm Lab from an interesting physics simulator into a genuine learning product.

Challenges should be progressively more difficult.

Each challenge should contain:

1. A real-world mountain biking scenario.
2. A mathematical problem.
3. A prediction question.
4. A simulation exercise.
5. A measurable objective.
6. An explanation of the mathematics.

Students should predict before running the simulation.

## Challenge 01 — Pick Your Line

**Difficulty:** Beginner.

**Concept:** Geometry and proportional reasoning.

Scenario:

You're approaching a large berm and have three possible riding lines.

- Tight: 4 meters.
- Middle: 6 meters.
- Wide: 8 meters.

All three lines are ridden at 22 km/h on the same modeled berm angle.

Question:

Which line produces the lowest centripetal acceleration?

Students must:
- Predict the answer.
- Select a line.
- Run the simulation.
- Compare all three acceleration values.
- Explain why the results are different.

## Challenge 02 — Speed Is Squared

**Difficulty:** Beginner.

**Concept:** Quadratic relationships.

Scenario:

You're riding a corner at 10 km/h.

You increase your speed to 20 km/h while maintaining the same corner radius.

Question:

What happens to centripetal acceleration?

Possible answers:
- It doubles.
- It triples.
- It quadruples.
- It stays the same.

Students must make a prediction before seeing the answer.

Afterward, show the equation and the corresponding graph.

## Challenge 03 — Find the Berm Sweet Spot

**Difficulty:** Intermediate.

**Concept:** Trigonometry and optimization.

Scenario:

You are designing a berm with a corner radius of 6 meters.

You want the banking angle to match a riding speed of 20 km/h under the idealized no-lateral-friction model.

Question:

What banking angle should the berm have?

Students must:
- Predict the answer.
- Manipulate the banking angle.
- Observe the grip-demand graph.
- Find the angle where modeled lateral grip demand reaches zero.
- Explain why that angle produces the result.

This is one of the most valuable activities in the lab.

## Challenge 04 — Flat Corner vs. Berm

**Difficulty:** Intermediate.

**Concept:** Force components and friction.

Scenario:

Two riders travel through corners with identical radii and speeds.

One corner is flat.

The other has a 30-degree banking angle.

Question:

Which corner requires more lateral tire-ground friction under the simplified model?

Students must:
- Run both simulations.
- Compare normal force and friction force.
- Analyze the force vectors.
- Explain how banking changes the force distribution.

## Challenge 05 — Does Weight Matter?

**Difficulty:** Intermediate.

**Concept:** Newton's second law.

Scenario:

Two riders enter the same berm at the same speed.

Rider A and bike: 70 kg.

Rider B and bike: 100 kg.

Question:

Does the heavier rider require more centripetal acceleration?

Does the heavier rider require more inward force?

Students must understand that:
- Acceleration remains the same.
- Required net inward force increases with mass.
- Required effective grip coefficient remains unchanged under the idealized model.

## Challenge 06 — The Perfect Berm

**Difficulty:** Advanced.

**Concept:** Algebra, trigonometry, physics, inequalities.

Scenario:

You are designing a hypothetical bike park corner.

Your constraints:
- Target speed: 25 km/h.
- Corner radius: 7 meters.
- Maximum berm angle: 45 degrees.
- Available effective grip: 0.4.

Your mission:

Find a banking angle that keeps modeled grip demand within the specified limit.

Students must:
- Interpret the problem.
- Use the simulator.
- Experiment with angles.
- Compare calculated grip requirements.
- Explain their final solution mathematically.

There may be multiple valid configurations.

Reward students for mathematically explaining their choices, not simply reaching the result.

# 10. Learning and Explanation System

Every mathematical variable should have an accompanying educational explanation.

Add contextual help icons next to each control and calculated output.

Example:

**What is centripetal acceleration?**

When an object moves in a circle, its direction continually changes.

Even when its speed remains constant, its velocity changes because velocity includes both speed and direction.

This means the object is accelerating toward the center of the circle.

In mountain biking, this helps explain why a rider needs an inward net force to negotiate a corner.

Another example:

**Why does a berm help you turn?**

A berm is a banked surface.

When a rider travels through a banked corner, the surface pushes perpendicular to itself.

Because the surface is tilted, some of that normal force points toward the center of the turn.

This means the berm can provide part of the inward force needed to follow a curved path.

Every explanation should contain:

- Plain-language definition.
- Mathematical equation.
- Visual diagram.
- Mountain biking connection.
- Optional advanced explanation.

## Integrated AI Math Coach

Where existing Mathlete AI infrastructure permits, add an interactive AI Math Coach.

The coach should have access to:
- Current simulator configuration.
- Calculated outputs.
- Current challenge.
- Student prediction.
- Previous attempts.
- Relevant mathematical concepts.

Example interaction:

Student:

"Why did the wide line make cornering easier?"

AI Coach:

"Great observation! Remember the equation a = v²/r.

Your speed stayed exactly the same, but your radius increased.

Because you're dividing by a larger number, your centripetal acceleration decreased.

Try switching between the tight and wide lines again. Can you predict what would happen if you doubled your speed?"

The coach should prioritize teaching and guided discovery.

It must not simply give away challenge answers.

The core experience must work without AI availability.

# 11. Student Progress and Organization Integration

Berm Lab should integrate into the existing Mathlete MTB student and organization architecture.

Save:
- Student ID.
- Organization ID.
- Simulator configurations.
- Completed challenges.
- Prediction accuracy.
- Challenge attempts.
- Hints requested.
- Concepts practiced.
- Time spent.
- Saved experiments.

Students should be able to save their favorite berm configuration.

Add a future tutor-facing experience where an instructor can:
- Assign specific challenges.
- Review student attempts.
- See which mathematical concepts are causing difficulty.
- Review saved simulator configurations.
- Use a student's experiments as the foundation for a tutoring session.

The simulator should be a standalone learning resource that also contributes to the larger Mathlete academic experience.

# 12. Suggested Component Architecture

Follow the existing Mathlete MTB architecture wherever possible.

Do not duplicate existing authentication, student profiles, organization systems, styling, or database infrastructure.

Suggested feature structure:

`src/features/berm-lab/`

```text
berm-lab/
├── components/
│   ├── BermLabPage
│   ├── BermSimulationCanvas
│   ├── TopDownCornerView
│   ├── BermCrossSection
│   ├── RiderVisualization
│   ├── RidingLineSelector
│   ├── CornerControlPanel
│   ├── BankingAngleControl
│   ├── SpeedControl
│   ├── MassControl
│   ├── GripControl
│   ├── SimulationControls
│   ├── ForceVectors
│   ├── ResultsPanel
│   ├── GraphLab
│   ├── LineComparison
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
│   ├── useBermSimulation
│   └── useBermProgress
│
├── data/
│   └── challenges
│
├── types/
│   └── bermLab
│
└── utils/
    └── simulationHelpers
```

### Technical Requirements

- Use SVG or Canvas for the initial simulation.
- Use a lightweight 2D/2.5D rendering approach.
- Reuse existing charting libraries.
- Keep the physics engine separate from the UI.
- Use deterministic simulation calculations.
- Avoid expensive calculations inside animation loops.
- Ensure all interactive controls are responsive.
- Make the experience accessible by keyboard.
- Use existing application styling and design tokens.

Do not introduce a separate application just to build Berm Lab.

# 13. Data Structures

Create reusable typed simulation configurations.

Example:

```typescript
interface BermConfiguration {
  cornerRadius: number;
  speed: number;
  bermAngle: number;
  totalMass: number;
  availableGrip: number;
  arcAngle: number;
}

interface BermResults {
  centripetalAcceleration: number;
  netInwardForce: number;
  leanAngle: number;
  idealMatchedSpeed: number | null;
  normalForce: number;
  frictionForce: number;
  requiredGrip: number;
  gripMargin: number;
  turnDistance: number;
  turnDuration: number;
}

interface BermChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  concepts: string[];
  initialConfiguration: BermConfiguration;
  objective: string;
  target: Record<string, number>;
}
```

Challenge definitions should be data-driven.

Adding new challenges should not require changing the underlying simulator calculations.

Ensure all data structures follow existing Mathlete naming, persistence, and organization conventions.

# 14. Acceptance Criteria

The feature is considered complete when all the following requirements are satisfied.

## Simulator

- Student can adjust all five variables.
- The simulation updates immediately.
- Three riding lines can be compared.
- The selected path is highlighted.
- Berm cross-section updates with banking angle.
- Play, pause, and restart work.
- Force vectors can be toggled.
- Model grip status is accurately represented.

## Mathematical Calculations

- Centripetal acceleration is calculated correctly.
- Net inward force is calculated correctly.
- Lean angle is calculated correctly under the stated model.
- Idealized matched speed is calculated correctly for banked turns.
- Normal and friction forces are calculated correctly.
- Required effective grip is calculated correctly.
- Flat-corner calculations are handled properly.
- Units are converted correctly.
- Invalid inputs and division-by-zero conditions are handled.
- All calculations pass unit tests.

## Graph Lab

- All four graphs render.
- Current configurations are highlighted.
- Graphs update when relevant variables change.
- Equations and units are correct.
- Comparison mode displays accurate dynamic values.

## Challenge Arena

- All six initial challenges are available.
- Prediction questions work.
- Answers are evaluated correctly.
- Hints and explanations are available.
- Progress is saved.
- Students can revisit completed challenges.

## User Experience

- Responsive interface works on desktop, tablet, and mobile.
- Visualizations remain smooth.
- Controls are accessible.
- Simulator works without the AI Math Coach.
- Numerical results, graphs, and animations remain synchronized.
- Educational model assumptions are clearly communicated.

# 15. Development Roadmap

Build the feature in independent, testable phases.

## Phase 1 — Physics Foundation

**Priority: Critical**

Implement:
- Physics calculations.
- Unit conversion system.
- Simulation configuration types.
- Result types.
- Unit tests.
- Validation and error handling.

Deliverable: A reliable, reusable educational physics engine.

## Phase 2 — Interactive Berm Simulator

**Priority: Critical**

Implement:
- Main interface.
- Top-down corner visualization.
- Animated mountain biker.
- Three riding lines.
- Corner-radius controls.
- Speed controls.
- Berm angle control.
- Mass control.
- Grip availability control.
- Live calculations.

Deliverable: A functional interactive berm simulation.

## Phase 3 — Force and Cross-Section Visualization

**Priority: High**

Implement:
- Berm cross-section.
- Normal force vector.
- Friction vector.
- Gravity vector.
- Velocity and acceleration vectors.
- Lean-angle visualization.
- Model grip indicator.

Deliverable: A visually understandable demonstration of the physics of cornering.

## Phase 4 — Graph Lab and Line Comparison

**Priority: High**

Implement:
- Acceleration vs. speed graph.
- Grip demand vs. berm angle graph.
- Grip demand vs. corner radius graph.
- Force vs. mass graph.
- Three-line comparison.

Deliverable: A comprehensive interactive math exploration environment.

## Phase 5 — Challenge Arena

**Priority: High**

Implement:
- Six initial challenges.
- Prediction questions.
- Challenge scoring.
- Hints.
- Explanations.
- Progress tracking.

Deliverable: A structured educational learning experience.

## Phase 6 — AI Coach and Student Integration

**Priority: Medium**

Implement:
- Existing Mathlete AI integration.
- Student progress persistence.
- Organization-aware assignments.
- Tutor-facing progress review.
- Saved experiments.

Deliverable: A complete learning experience integrated into Mathlete MTB.

# 16. Future Expansion Opportunities

The initial product should focus on a single bermed corner.

Once the core experience works exceptionally well, consider the following extensions.

### A. Flat Corner Lab

Introduce off-camber and flat turns.

Students compare:
- Flat surfaces.
- Banked surfaces.
- Different corner radii.
- Different speeds.
- Different grip settings.

### B. Berm Builder

Allow students to design an entire berm.

Students manipulate:
- Berm height.
- Trail width.
- Banking angle.
- Horizontal radius.
- Entry and exit transitions.

The simulator generates a visual representation of their design.

### C. Cornering Line Optimization

Create more advanced challenges involving:
- Entry points.
- Apex selection.
- Exit points.
- Tight vs. wide lines.
- Changing corner radii.
- Transition curves.

### D. Pump the Berm

An advanced future module could explore how riders use compression and extension through terrain transitions.

Students experiment with:
- Position along the berm.
- Timing of compression.
- Changes in normal force.
- Potential changes in speed.

This would introduce energy transfer, work, force, and power.

It should be built as a separate, more advanced physics model rather than pretending that the initial steady-state cornering simulator already models rider pumping.

# 17. Important Product Design Principles

**1. Make the trail the classroom.**

Students should see a mountain biking environment, not a conventional math worksheet.

**2. Simulation first, equations second.**

Students should experiment before being asked to understand the mathematical explanation.

**3. Make every variable meaningful.**

Every slider must demonstrate a genuine mathematical or physical relationship.

**4. Encourage predictions.**

Students should think about what will happen before running the simulation.

**5. Teach the why.**

The goal is understanding the relationships between variables, not memorizing equations.

**6. Reward experimentation.**

Students should receive recognition for making predictions, exploring different configurations, learning from incorrect answers, and explaining results.

**7. Preserve scientific honesty.**

This is an idealized educational model. Real mountain bike cornering includes many additional factors:

- Tire construction and deformation.
- Soil composition and moisture.
- Tire pressure.
- Suspension movement.
- Rider positioning.
- Bike-body separation.
- Braking and acceleration.
- Changing berm geometry.
- Variable lean and steering.
- Transient forces while entering and exiting turns.

Do not present simulated traction values as real-world tire grip measurements or riding safety recommendations.

# 18. Definition of Success

Berm Lab is successful when a student who loves mountain biking but struggles with mathematics can enter the simulation, experiment with different riding lines, and begin understanding the mathematics behind cornering.

A student should leave understanding:

- Why wider turns generally reduce centripetal acceleration.
- Why doubling speed quadruples centripetal acceleration.
- How berm banking changes the forces involved in cornering.
- Why a banked turn has an idealized speed at which lateral friction demand is minimized.
- Why heavier riders require more force even when their acceleration is unchanged.
- How mathematical graphs and equations explain what they see on the trail.

**The ultimate goal:**

A student opens Mathlete MTB because they love mountain biking, spends 15–20 minutes experimenting with Berm Lab, and leaves with a better understanding of geometry, algebra, trigonometry, and physics.

They didn't open the platform because they wanted to do math homework.

They opened it because they wanted to become a better rider and discovered that mathematics could help them understand the sport they love.

That is the Mathlete experience.