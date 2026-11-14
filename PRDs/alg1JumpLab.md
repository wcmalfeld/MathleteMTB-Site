# PRD: MATHLETE MTB — THE JUMP LAB
## Interactive Quadratic Functions & Jump Trajectory Learning Experience

**Product:** Mathlete MTB  
**Feature:** The Jump Lab  
**Course:** Algebra 1  
**Curriculum Placement:** Unit 8 — Quadratic Equations and Functions  
**Topic:** Graphing Quadratics  
**Associated Skills:**
- Understanding quadratic functions.
- Recognizing parabolic graphs.
- Identifying vertices and maximum values.
- Understanding axes of symmetry.
- Identifying zeros and x-intercepts.
- Understanding the effect of coefficients on quadratic graphs.
- Interpreting quadratic equations in real-world scenarios.

**Activity Type:** Interactive Learning Lab / Simulation / Educational Game  
**Target Audience:** High-school students, particularly mountain bikers  
**Estimated Completion:** 15–20 minutes  
**Difficulty:** Beginner to Intermediate

---

# 1. PRODUCT VISION

## The Concept

Create an immersive, interactive mountain bike jump analysis experience where students learn quadratic functions by exploring the mathematics of jumping a mountain bike.

The student should feel like they are inside a virtual mountain bike jump-design laboratory.

They are presented with a simplified jump trajectory and asked to investigate questions such as:

- How high does the rider get?
- At what horizontal distance does the rider reach their maximum height?
- Where does the rider take off?
- Where does the rider land?
- What happens to the shape of the trajectory when we change the jump's dimensions?
- How can we describe this trajectory using a quadratic equation?

The objective is to help students develop an intuitive understanding of quadratic functions before, during, and after learning the associated algebra.

Students should not simply be told what a vertex, zero, or coefficient is.

They should discover what these mathematical features mean through experimentation.

## The Core Experience

Build an interactive jump simulation that connects a visual mountain biking scenario to a mathematical coordinate plane.

The student can manipulate the dimensions of a jump, watch the trajectory change, and see the corresponding quadratic equation update in real time.

As the experience progresses, the student learns how to interpret the graph and equation.

Eventually, they must reverse-engineer jump trajectories and complete independent challenges.

**The most important product principle: every mathematical concept should have a visible, interactive mountain biking representation.**

---

# 2. EDUCATIONAL OBJECTIVES

By the end of the experience, students should be able to:

### Objective 1: Understand Quadratic Functions

Recognize that quadratic functions produce parabolic graphs.

Understand why a simplified jump trajectory can be represented by a parabola.

### Objective 2: Understand the Vertex

Identify the vertex of a parabola.

Explain that, in the jump scenario, the vertex represents the rider's maximum height and the horizontal position at which that height occurs.

### Objective 3: Understand Zeros

Identify the zeros or x-intercepts of the quadratic function.

Explain that, in this simplified model, the zeros represent the takeoff and landing positions where the trajectory intersects the reference ground level.

### Objective 4: Understand the Axis of Symmetry

Identify the vertical line of symmetry passing through the vertex.

Understand why the modeled trajectory is symmetrical when takeoff and landing elevations are equal.

### Objective 5: Understand the Coefficient

Understand how changing the leading coefficient changes the width and curvature of a parabola.

Recognize that a negative leading coefficient creates a downward-opening parabola with a maximum.

### Objective 6: Connect Equations to Graphs

Understand the relationship between:

- Vertex form.
- Standard form.
- Factored form.

Students should be able to interpret each representation in the context of the jump.

### Objective 7: Apply Their Knowledge

Use the concepts above to solve unfamiliar jump trajectory problems independently.

---

# 3. MATHEMATICAL MODEL

This section is critical. Claude must implement the underlying mathematics accurately.

## The Simplified Jump Model

Represent a mountain bike jump using a parabolic trajectory.

For the initial experience, assume:

- The takeoff and landing points are at the same reference elevation.
- Horizontal distance is represented by x.
- Vertical height above the reference elevation is represented by y.
- The trajectory is a simplified mathematical model, not a physically complete prediction of actual rider flight.

We will use two primary variables:

**L = Horizontal jump distance**

The distance between the takeoff and landing points.

**H = Maximum jump height**

The maximum vertical height reached above the reference elevation.

The corresponding quadratic equation is:

\[
y=-\frac{4H}{L^2}\left(x-\frac{L}{2}\right)^2+H
\]

This equation is particularly useful because the vertex and intercepts have direct meaning in the jump scenario.

### Example

Suppose we have a modeled jump with:

- Horizontal distance: 12 meters.
- Maximum height: 3 meters.

The equation becomes:

\[
y=-\frac{1}{12}(x-6)^2+3
\]

The important mathematical features are:

| Feature | Mathematical result | Jump interpretation |
|---|---|---|
| Vertex | (6, 3) | Maximum height occurs 6 meters from takeoff at 3 meters high |
| Zeros | 0 and 12 | Takeoff and landing positions |
| Axis of symmetry | x = 6 | Vertical line through the maximum height |
| Leading coefficient | -1/12 | Controls the curvature of the parabola |
| Maximum value | 3 | Maximum modeled jump height |

### Three Equation Forms

The lab should show how this same jump can be represented in three different ways.

**1. Vertex Form**

\[
y=-\frac{1}{12}(x-6)^2+3
\]

This makes the vertex immediately visible.

Students should understand that vertex form makes it easy to identify the maximum height and horizontal location of the apex.

**2. Standard Form**

\[
y=-\frac{1}{12}x^2+x
\]

This makes the leading coefficient visible and helps students understand the general structure of quadratic functions.

\[
y=ax^2+bx+c
\]

**3. Factored Form**

\[
y=-\frac{1}{12}x(x-12)
\]

This makes the zeros immediately visible.

Students should recognize that the zeros identify the points at which the modeled trajectory crosses the ground-level reference line.

The lab should allow students to switch between these forms while the visual trajectory stays the same.

The educational opportunity here is showing students that three different equations can represent exactly the same jump.

---

# 4. USER EXPERIENCE AND ACTIVITY FLOW

The experience should be divided into six stages.

The student should progress naturally from observation to experimentation, explanation, practice, and independent application.

## STAGE 1: THE HOOK — "CAN YOU READ A JUMP?"

**Purpose:** Create curiosity and introduce the scenario.

### Opening Screen

Title:

# THE JUMP LAB

Subtitle:

"Every jump has a shape. Every shape has math behind it."

Visual concept:

Display a stylized mountain biking jump environment.

Show:
- A takeoff ramp.
- A gap.
- A landing transition.
- A rider traveling along a parabolic trajectory.
- A subtle coordinate grid overlay.

The rider should move along the trajectory as the page loads or when the student presses Play.

The presentation should feel like a simulation or a bike park design tool.

### Initial Question

Display:

"You're watching a rider hit a jump. They leave the takeoff at one elevation, rise into the air, and land at the same elevation on the other side."

"How could we use math to describe the shape of that flight?"

Ask:

**What shape do you think the rider's trajectory makes?**

Offer a few possible answers:
- Straight line.
- Circle.
- Parabola.
- Triangle.

Give immediate feedback.

Once the student selects an answer, explain that the simplified trajectory can be represented by a parabola.

Keep this opening short and engaging.

Button:

"ENTER THE LAB"

---

## STAGE 2: EXPLORE THE TRAJECTORY — THE INTERACTIVE JUMP SIMULATOR

<primary importance>

This is the centerpiece of the entire activity.

Build a large interactive simulation where students can manipulate a jump and see how the mathematical graph responds.

### Layout

The main workspace should have three visual elements:

**A. Jump Visualization**

Display a stylized side-profile mountain biking scene.

Include:
- Takeoff point.
- Landing point.
- Rider.
- Parabolic flight trajectory.
- Horizontal distance.
- Maximum vertical height.

**B. Coordinate Plane**

Display the same trajectory on a mathematical coordinate plane.

Include:
- Clearly labeled x-axis.
- Clearly labeled y-axis.
- Grid lines.
- Coordinate points.
- Parabolic curve.
- Ground-level reference line.

The trail/jump visualization and mathematical graph must represent the exact same underlying function.

Consider a linked visualization where interactions with one representation update the other.

**C. Control Panel**

Provide two primary controls:

1. Jump Distance (L)
2. Maximum Height (H)

Suggested initial values:

- L = 12 meters.
- H = 3 meters.

Suggested slider ranges:

- L: 6–24 meters.
- H: 1–6 meters.

These are illustrative simulation values, not recommended riding dimensions.

When the student changes either slider, immediately update:

- The parabolic trajectory.
- The rider's flight animation.
- The coordinate plane.
- The equation.
- The vertex.
- The zeros.
- The axis of symmetry.
- The maximum height.
- The horizontal range.

### Important Design Detail

The student should always be able to see the mathematical consequences of their changes.

For example:

When the student increases jump height while keeping horizontal distance constant:
- The peak becomes higher.
- The parabola becomes narrower.
- The leading coefficient becomes more negative in magnitude.
- The zeros stay at the same horizontal positions.

When the student increases horizontal distance while keeping height constant:
- The jump becomes wider.
- The peak moves farther to the right.
- The parabola becomes flatter.
- The leading coefficient's magnitude decreases.

These relationships are fundamental to the learning experience.

### Visual Telemetry Panel

Create a small dashboard displaying:

| Measurement | Value |
|---|---|
| Jump distance | 12 m |
| Maximum height | 3 m |
| Apex location | 6 m |
| Takeoff point | (0, 0) |
| Landing point | (12, 0) |
| Leading coefficient | -0.0833 |

Use live data generated from the mathematical model.

Do not hardcode calculated values.

### Play/Pause

Provide a button allowing the student to animate the rider traveling along the trajectory.

Additional optional interactions:
- Scrub through the jump using a horizontal slider.
- Display the rider's current coordinates.
- Pause at the apex.
- Show a vertical line through the vertex.

The animation should make the mathematical concepts easier to understand.

---

## STAGE 3: DISCOVER THE MATH — INTERACTIVE LEARNING MODULES

After the student has spent time exploring the simulation, introduce the mathematical concepts.

Do not simply place a wall of instructional text next to the simulator.

Use short, interactive teaching modules.

Each concept should include:

1. A short explanation.
2. A visual demonstration.
3. A guided interaction.
4. A comprehension question.

Allow the student to revisit previously completed concepts.

### MODULE A: THE PARABOLA

Title:

"Why does a jump make a parabola?"

Explanation:

"In Algebra, a quadratic function creates a graph called a parabola. A simplified mountain bike jump trajectory is a great example of this shape."

Highlight the curve on the graph.

Show the general quadratic equation:

\[
y=ax^2+bx+c
\]

Explain:
- x represents horizontal distance.
- y represents vertical height.
- a, b, and c are coefficients that affect the equation and graph.

Keep the explanation accessible.

Interactive task:

Ask the student to manipulate the jump distance and maximum height.

Question:

"What happens to the shape when the maximum height increases but the jump distance stays the same?"

Give feedback based on the student's answer.

### MODULE B: THE VERTEX — FINDING THE APEX

Title:

"Where does the rider reach maximum height?"

Highlight the vertex on the graph.

Display its coordinates.

Explain:

"The vertex is the highest or lowest point of a parabola. Because our modeled jump opens downward, the vertex represents the maximum height."

For the modeled jump:

\[
y=-\frac{1}{12}(x-6)^2+3
\]

The vertex is:

\[
(6,3)
\]

Interpretation:

The rider reaches a maximum modeled height of 3 meters at a horizontal distance of 6 meters from takeoff.

**Interactive challenge:**

Hide the vertex coordinates and ask the student to click or select the highest point on the graph.

Then ask:

"What is the maximum height?"

Require the student to interpret both coordinates.

Emphasize:

- The x-coordinate tells us where the maximum occurs.
- The y-coordinate tells us what the maximum value is.

### MODULE C: ZEROS — WHERE DOES THE RIDER LAND?

Title:

"Where does the trajectory meet the ground?"

Highlight both x-intercepts.

Explain:

"The zeros of a quadratic function are the x-values where the graph crosses the x-axis. In our simplified jump model, these represent the takeoff and landing positions."

For our example:

\[
y=-\frac{1}{12}x(x-12)
\]

Set y equal to zero:

\[
0=-\frac{1}{12}x(x-12)
\]

The zeros are:

\[
x=0 \quad \text{and} \quad x=12
\]

Interpretation:
- The rider takes off at x = 0.
- The rider lands at x = 12.

Interactive challenge:

Give the student a graph without labeled intercepts.

Ask them to identify where the trajectory intersects the x-axis.

Then ask what each point represents in the jump scenario.

### MODULE D: AXIS OF SYMMETRY

Title:

"The invisible line through every perfectly symmetrical jump"

Show a vertical line through the vertex.

Explain:

"The axis of symmetry divides a parabola into two mirrored halves."

For this modeled jump:

\[
x=6
\]

Demonstrate how corresponding points on either side of this line have the same height.

Example:
- At x = 3, height = 2.25 m.
- At x = 9, height = 2.25 m.

Interactive challenge:

Display a point on one side of the parabola and ask the student to identify the corresponding point on the other side.

### MODULE E: THE COEFFICIENT — WHAT MAKES A PARABOLA WIDE OR NARROW?

Title:

"Why do some jumps have a steeper arc than others?"

Introduce:

\[
y=ax^2+bx+c
\]

Focus on the leading coefficient a.

Explain:

- A negative a creates a downward-opening parabola.
- A positive a creates an upward-opening parabola.
- A larger absolute value of a produces a narrower parabola.
- A smaller absolute value of a produces a wider parabola.

Use the jump simulator to demonstrate this relationship.

Keep H and L visible so students can see how changing the jump's height and distance changes the coefficient.

Important teaching distinction:

The equation's coefficient is not an independently adjustable physical measurement in our primary jump model.

It is mathematically derived from H and L:

\[
a=-\frac{4H}{L^2}
\]

This is an excellent opportunity to show how mathematical variables relate to one another.

---

## STAGE 4: EQUATION DECODER — THREE WAYS TO DESCRIBE A JUMP

This should be one of the most valuable parts of the experience.

Students often struggle because they see different forms of quadratic equations and don't understand why they look different.

Use the jump to make that relationship intuitive.

### The Concept

Display the current jump and show an equation panel.

Provide three tabs:

- Vertex Form
- Standard Form
- Factored Form

When the student selects each tab, highlight the corresponding mathematical features on the graph.

**Vertex Form**

\[
y=a(x-h)^2+k
\]

Highlight the vertex.

Explain:
- h gives the horizontal location of the vertex.
- k gives the vertical location of the vertex.
- a controls the direction and curvature.

**Standard Form**

\[
y=ax^2+bx+c
\]

Highlight the leading coefficient and explain how the coefficients contribute to the graph.

For the equal-height takeoff and landing model, c = 0 because the takeoff point is at the origin.

**Factored Form**

\[
y=a(x-r_1)(x-r_2)
\]

Highlight both zeros.

Explain that the roots identify the horizontal locations where the graph crosses the x-axis.

### Interactive Equation Matching

Present three equations and ask the student to connect each representation to the correct mathematical feature.

Example:

Which form makes it easiest to identify:
- The maximum height?
- The landing position?
- The leading coefficient?

Give immediate feedback.

### Equation Translation Challenge

Show the same jump in one form and ask the student to identify information revealed by another.

Keep the student focused on understanding rather than requiring advanced algebraic transformations outside the intended learning objectives.

---

## STAGE 5: JUMP DESIGN CHALLENGES — APPLY WHAT YOU'VE LEARNED

This is where the experience becomes a game.

Create a series of progressively challenging missions.

Use a mission-based progression rather than a generic quiz.

The student should feel like they are solving problems as a member of a virtual jump-design team.

### CHALLENGE 1: FIND THE APEX

**Difficulty:** Beginner

Display a modeled jump.

Ask:

"The rider reaches maximum height at the vertex. What is the vertex?"

The student selects or enters its coordinates.

Assess:
- Correct x-coordinate.
- Correct y-coordinate.
- Understanding of the maximum value.

### CHALLENGE 2: LOCATE THE LANDING

**Difficulty:** Beginner

Display a trajectory.

Ask:

"Where does this modeled jump intersect the ground on the landing side?"

The student must identify the positive zero.

Require an explanation that this is an x-intercept.

### CHALLENGE 3: MATCH THE JUMP

**Difficulty:** Intermediate

Display three different parabolas.

Give the student a target jump profile.

Ask them to select the equation that corresponds to the target.

Use different values of a, H, and L.

Test understanding of how the coefficient and graph shape relate.

### CHALLENGE 4: CHANGE THE SHAPE

**Difficulty:** Intermediate

Display a baseline trajectory.

Give the student a new requirement:

"Keep the horizontal jump distance the same, but increase the maximum modeled height."

The student must adjust the controls to achieve the required outcome.

Then ask:

"What happened to the coefficient and the width of the parabola?"

### CHALLENGE 5: REVERSE-ENGINEER THE JUMP

**Difficulty:** Advanced

This is a particularly valuable challenge.

Show a jump trajectory with its equation hidden.

Give the student a few clues:
- The maximum height.
- The horizontal location of the apex.
- The landing distance.

Ask the student to reconstruct the quadratic equation.

Start by offering vertex form.

Eventually, introduce standard form and factored form.

Give partial credit for correct mathematical reasoning.

### CHALLENGE 6: THE FINAL JUMP BLUEPRINT

**Difficulty:** Advanced

The student receives a fictional jump-design brief.

Example:

"The design team has created a virtual jump with a horizontal range of 16 meters and a maximum modeled height of 4 meters."

Your job:

1. Determine the vertex.
2. Determine the zeros.
3. Identify the axis of symmetry.
4. Calculate the leading coefficient.
5. Write the quadratic equation in vertex form.
6. Explain what the important parts of the equation represent.

The student should complete the challenge independently.

This final challenge should draw from all the concepts introduced throughout the experience.

Important: Present this exclusively as a mathematical modeling challenge, not a recommendation for constructing or attempting a real jump.

---

# 5. INTERACTIVE DESIGN REQUIREMENTS

## Overall Layout

Create a polished, immersive application.

Suggested visual structure:

**Top Navigation**
- Mathlete MTB logo.
- Back to Algebra 1.
- Current activity name.
- Progress indicator.
- Exit/restart option.

**Main Experience**
- Primary simulation.
- Interactive coordinate plane.
- Control panel.
- Mathematical information panel.

**Learning Navigation**
- Overview.
- Explore.
- Learn.
- Equation Decoder.
- Challenges.

On smaller devices, reorganize the layout into vertically stacked sections.

The jump graph must remain the dominant visual element.

Avoid overcrowding the interface.

## Visual Direction

The experience should feel like a combination of:

- A mountain bike jump analysis tool.
- An interactive mathematics laboratory.
- A modern educational game.

Use:
- Dark, technical backgrounds where consistent with Mathlete's existing branding.
- High-contrast coordinate planes.
- Visually distinguishable graph elements.
- Smooth, purposeful animations.
- Clear data readouts.
- Mountain biking-inspired design details.

Do not make this look like a generic school website.

### Important Visual Details

Use color consistently for mathematical meaning.

For example:
- One color for the trajectory.
- One color for the vertex.
- Another for zeros.
- A different visual treatment for the axis of symmetry.

Provide labels and shapes in addition to colors so the visualization remains accessible.

The student should always know which mathematical feature is being highlighted.

### The Rider

Use a simple stylized rider silhouette or vector illustration.

Avoid spending excessive development time on a photorealistic rider.

The animation should be smooth and should move along the actual calculated trajectory.

When the student changes H or L, the visualization should update immediately.

---

# 6. MATHEMATICAL AND INTERACTION ENGINE

Build the simulation using one authoritative mathematical calculation layer.

The UI, graph, rider animation, equation display, telemetry, and assessment questions must all derive their values from the same model.

Do not independently calculate the trajectory in multiple components.

### Core Parameters

- L: Horizontal range.
- H: Maximum height.
- x: Horizontal position.
- y: Height above the reference elevation.

### Core Calculation

\[
a=-\frac{4H}{L^2}
\]

\[
y=a\left(x-\frac{L}{2}\right)^2+H
\]

### Derived Features

Vertex:

\[
\left(\frac{L}{2},H\right)
\]

Zeros:

\[
x=0,\quad x=L
\]

Axis of symmetry:

\[
x=\frac{L}{2}
\]

Maximum:

\[
y_{\max}=H
\]

Standard form:

\[
y=ax^2+\frac{4H}{L}x
\]

Factored form:

\[
y=a x(x-L)
\]

### Graph Requirements

- Draw the parabola using calculated values.
- Update the graph when H or L changes.
- Scale the graph appropriately to retain visual readability.
- Preserve correct coordinate proportions.
- Show axes and gridlines.
- Highlight mathematical features on demand.
- Support interactive point selection.
- Support a current-position indicator for the animated rider.

### Input Validation

- L must be greater than zero.
- H must be greater than zero.
- Avoid division-by-zero conditions.
- Clamp values to configured slider ranges.
- Handle numerical precision appropriately.
- Avoid displaying misleading rounded values in assessment answers.

The displayed equations should use exact fractions where practical and clear decimal representations otherwise.

Do not allow display rounding to alter the underlying mathematical calculations.

### Mathematical Constraints

The primary simulation assumes:
- Equal takeoff and landing elevations.
- A symmetrical trajectory.
- A downward-opening parabola.
- A restricted horizontal domain from x = 0 to x = L.

Do not extend the graph infinitely into the surrounding screen as though the entire parabola were the actual jump.

Students can later explore unrestricted quadratic functions in other Algebra 1 activities.

---

# 7. ASSESSMENT AND QUESTION ENGINE

Build a reusable question system for this activity.

Use a mixture of:

- Multiple-choice questions.
- Numerical input questions.
- Graph selection.
- Point identification.
- Equation matching.
- Short written explanations.

### Question Generation

Where possible, generate randomized mathematical problems from validated parameter sets.

Avoid generating random values that result in unnecessarily complicated calculations.

Create curated question templates that can use different values of H and L.

For every generated problem:
- Calculate the correct answer programmatically.
- Validate the answer before presenting it.
- Define accepted numerical tolerances explicitly where approximation is appropriate.
- Ensure the visual graph represents the same problem.
- Store the correct associated skill ID.

### Feedback System

Incorrect answers should trigger meaningful teaching feedback.

Use progressive hints:

**Hint 1:** Give the student a conceptual direction.

**Hint 2:** Identify the mathematical relationship they should consider.

**Hint 3:** Provide a guided next step.

**Solution:** Show the complete mathematical solution and explain its mountain biking meaning.

Do not immediately reveal answers.

Encourage a retry.

### Mistake Classification

Where possible, record common misconceptions:

- Confusing vertex coordinates.
- Mixing up horizontal distance and vertical height.
- Assuming the maximum occurs at a zero.
- Confusing zeros with the vertex.
- Misinterpreting the sign of the coefficient.
- Confusing the width of a parabola with its height.
- Misunderstanding the axis of symmetry.
- Confusing different equation forms.

This will become especially valuable for tutors reviewing student progress.

---

# 8. GAMIFICATION AND STUDENT ENGAGEMENT

The lab should feel rewarding without becoming distracting.

### Mission Progress

Display six challenge missions.

Students unlock the next mission as they demonstrate sufficient understanding of the previous concepts.

Allow students to revisit completed missions.

### Scoring

Use a straightforward scoring system based on:
- Correct answers.
- Independent completion.
- Hint usage.
- Challenge completion.

Do not reward students simply for clicking around or spending more time.

A student who solves a challenge independently should receive more credit than one who required the full solution.

### Replayability

Allow students to:
- Reset the jump.
- Experiment with different distances.
- Experiment with different heights.
- Compare trajectories.
- Replay challenges with different numbers.
- Repeat problems for additional practice.

### Optional Exploration Mode

After completing the core learning path, let students freely explore the simulation.

Remove the guided instruction and allow them to experiment.

Provide interesting prompts such as:

- Can you create a wider parabola without changing maximum height?
- Can you increase maximum height without changing the landing position?
- What happens to the vertex when the horizontal distance doubles?
- Can two different jumps have the same leading coefficient?

This mode is not required for completion but encourages deeper understanding.

---

# 9. STUDENT PROGRESS TRACKING

Integrate with the existing Mathlete MTB progress infrastructure.

Do not create a separate progress-tracking system if one already exists.

### Activity-Level Metrics

Record:
- Activity started.
- Activity completed.
- Time spent.
- Challenge attempts.
- Correct answers.
- Incorrect answers.
- Hints requested.
- Independent answers.
- Best performance.

### Skill-Level Metrics

Associate attempts with the following skills:

1. Recognizing quadratic functions.
2. Identifying vertices.
3. Interpreting maximum values.
4. Identifying zeros.
5. Understanding axes of symmetry.
6. Understanding coefficient effects.
7. Interpreting different equation forms.

### Example Student Progress Record

A student might demonstrate:

| Skill | Performance |
|---|---|
| Recognizing parabolas | Strong |
| Finding vertices | Strong |
| Finding zeros | Developing |
| Understanding symmetry | Strong |
| Interpreting coefficients | Needs practice |
| Equation forms | Developing |

Do not infer mastery from one correct answer.

Track performance across multiple questions and attempts.

The system should distinguish between:
- Practiced.
- Completed.
- Demonstrated understanding.
- Needs further practice.

Where the existing platform does not yet support this level of mastery classification, store the underlying attempt information without inventing a mastery result.

---

# 10. TECHNICAL ARCHITECTURE AND IMPLEMENTATION

This is an independent learning resource that will be integrated into the existing Mathlete MTB Classes section.

### Curriculum Placement

Classes → Algebra 1 → Unit 8: Quadratic Equations and Functions → Graphing Quadratics → The Jump Lab

### Routing

Give the activity its own standalone route.

Follow the existing application's routing conventions.

The topic page should link to the activity.

Preserve consistency with existing Mathlete MTB navigation.

### Component Architecture

Use reusable components where appropriate.

Suggested components:

**JumpSimulation**
- Main visual jump environment.
- Rider animation.
- Trajectory.

**QuadraticGraph**
- Coordinate plane.
- Parabola.
- Vertex.
- Zeros.
- Axis of symmetry.

**JumpControls**
- Horizontal distance slider.
- Maximum height slider.
- Reset controls.

**JumpTelemetry**
- Live mathematical measurements.
- Current coordinate data.

**EquationDisplay**
- Vertex form.
- Standard form.
- Factored form.

**LearningModule**
- Instructional content.
- Visual demonstrations.
- Interactive comprehension checks.

**ChallengeEngine**
- Challenge progression.
- Randomized questions.
- Answer evaluation.
- Hints.
- Feedback.

**ProgressTracker**
- Attempts.
- Completion.
- Performance.
- Skill associations.

These are suggested component boundaries. Claude should adapt them to the existing codebase rather than unnecessarily duplicate existing components.

### Separation of Concerns

Keep the following concerns separate:

1. Mathematical calculations.
2. Graph rendering.
3. Jump visualization.
4. Educational content.
5. Assessment logic.
6. Student progress persistence.

This will make the experience easier to maintain and allow future math labs to reuse the relevant infrastructure.

### Future Reusability

Although this is a standalone resource, build its underlying graphing and question components with future activities in mind.

Other potential uses:
- Algebra 1 slope and linear relationships.
- Algebra 1 systems of equations.
- Algebra 2 polynomial graphs.
- Precalculus trigonometric functions.
- Geometry coordinate-plane activities.

Do not overengineer a generic simulation engine for hypothetical future needs. Build reusable components where there is a clear current benefit.

---

# 11. ACCESSIBILITY AND RESPONSIVENESS

Requirements:

- Fully responsive on desktop, tablet, and mobile.
- Keyboard-accessible sliders and controls.
- Clear focus indicators.
- Accessible labels for controls.
- High-contrast mathematical graph elements.
- Do not rely exclusively on color.
- Reduced-motion support.
- Provide a non-animation-based method for exploring the trajectory.
- Make equations readable on small screens.
- Use accessible feedback announcements.
- Support touch interaction.

The core experience should not require a mouse or precision dragging.

---

# 12. SCOPE AND PRIORITIES

## MVP — Must Build

The initial release must include:

1. Jump Lab landing screen.
2. Interactive parabolic jump simulation.
3. Adjustable horizontal distance and maximum height.
4. Linked coordinate-plane graph.
5. Animated rider following the calculated trajectory.
6. Live mathematical telemetry.
7. Vertex identification and explanation.
8. Zero identification and explanation.
9. Axis of symmetry explanation.
10. Leading coefficient explanation.
11. Equation Decoder with three equation forms.
12. Six progressively challenging missions.
13. Hint and feedback system.
14. Completion tracking.
15. Curriculum integration.
16. Responsive design.

## Future Enhancements — Not Required for MVP

Keep these ideas in mind without allowing them to delay the first release:

- More realistic projectile motion modeling.
- Variable takeoff and landing elevations.
- Adjustable launch angle.
- Time-based physics modeling.
- Multiple simultaneous jump trajectories.
- Advanced jump comparison challenges.
- Student-created saved jump blueprints.
- Tutor dashboards with detailed misconception reports.
- Multiplayer jump-design competitions.
- More advanced Algebra 2 jump modeling.

Do not add complex physics simulation to the initial experience.

The goal is to teach quadratic functions, not develop a complete mountain biking physics simulator.

---

# 13. QUALITY ASSURANCE

Before declaring the activity complete, Claude must verify:

### Mathematics
- [ ] Mathematical model is correct.
- [ ] Vertex calculations are correct.
- [ ] Zeros are correct.
- [ ] Axis of symmetry is correct.
- [ ] Coefficient calculations are correct.
- [ ] All three equation forms are equivalent.
- [ ] Graph accurately reflects the equation.
- [ ] Units and coordinate conventions are consistent.

### Interaction
- [ ] Sliders work.
- [ ] Graph updates immediately.
- [ ] Rider animation follows the correct curve.
- [ ] Telemetry updates correctly.
- [ ] Equation tabs display correct forms.
- [ ] Challenges evaluate answers accurately.
- [ ] Hints work.
- [ ] Restart works.
- [ ] Student can revisit content.

### Learning Experience
- [ ] Opening experience is engaging.
- [ ] Concepts are explained clearly.
- [ ] Students can discover relationships through interaction.
- [ ] Feedback teaches rather than simply scores.
- [ ] Challenges progressively increase in difficulty.
- [ ] Final challenge tests independent understanding.

### Technical
- [ ] Correct curriculum placement.
- [ ] Standalone route works.
- [ ] Existing Mathlete MTB design conventions are respected.
- [ ] Existing navigation is preserved.
- [ ] Featured Tools remains functional.
- [ ] Student progress integrates with existing infrastructure.
- [ ] Desktop and mobile layouts work.
- [ ] Accessibility requirements are addressed.

---

# 14. IMPLEMENTATION INSTRUCTIONS FOR CLAUDE

Before beginning development:

1. Read `docs/LAB_DEVELOPMENT_FRAMEWORK.md`.
2. Audit the existing Mathlete MTB application.
3. Inspect the existing Slope & Linear Relationships Lab.
4. Review the Classes curriculum architecture.
5. Identify current activity and student-progress infrastructure.
6. Identify reusable graph, slider, visualization, and assessment components.

Then present a concise implementation plan.

Once the plan is established, implement the complete MVP.

Do not stop after creating a static mockup or a basic graph.

The actual interactive learning experience must function end-to-end.

### Important Implementation Priorities

**First:** Make the mathematical model correct.

**Second:** Make the jump simulation and graph work together.

**Third:** Build the educational progression.

**Fourth:** Build the challenge and feedback system.

**Fifth:** Connect student progress and polish the design.

Do not spend disproportionate time on decorative graphics while leaving learning interactions unfinished.

Test the mathematical model independently.

Verify the experience as a student would actually use it.

If an important feature cannot be implemented because of existing architectural limitations, document the limitation rather than silently removing functionality.

### Final Deliverable

Upon completion, provide:

- Summary of the experience.
- Route to access the Jump Lab.
- Curriculum location.
- Skills covered.
- Components created.
- Progress tracking implemented.
- Testing performed.
- Any outstanding limitations.

---

# 15. THE PRODUCT STANDARD

The Jump Lab should establish the quality standard for future Mathlete MTB learning experiences.

We want students to:

- See something they recognize from mountain biking.
- Become curious about the mathematics behind it.
- Experiment and discover relationships.
- Learn the formal mathematical language.
- Practice applying it independently.
- Leave with a deeper understanding than they had before.

The student should finish thinking:

**"I just learned how quadratic functions work by analyzing a mountain bike jump."**

That is the Mathlete MTB experience we are trying to create.