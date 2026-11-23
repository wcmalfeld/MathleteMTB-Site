# PRD: MATHLETE MTB — ALGEBRA 2
# THE TRAIL DYNAMICS LAB: QUADRATIC FUNCTIONS

**Product:** Mathlete MTB  
**Feature:** Trail Dynamics Lab  
**Course:** Algebra 2  
**Unit:** Quadratic Functions  
**Activity Type:** Interactive Learning Lab / Simulation / Engineering Challenge  
**Target Audience:** High-school Algebra 2 students, particularly mountain bikers  
**Estimated Completion:** 20–25 minutes  
**Priority:** Flagship Algebra 2 quadratic functions lesson

---

# 1. PRODUCT VISION

## The Big Idea

Create an interactive mountain bike performance engineering experience where students learn advanced quadratic functions through braking distance analysis and jump trajectory modeling.

The student becomes a mountain bike performance engineer responsible for analyzing a fictional enduro course.

They need to understand:
- How speed affects stopping distance.
- How braking conditions change mathematical models.
- How quadratic equations describe jump trajectories.
- How to convert quadratic equations into different forms.
- How to determine maximum and minimum values.
- How to solve quadratic equations using different algebraic methods.
- How to interpret the discriminant.
- How to understand complex solutions in mathematical models.

The experience should go beyond introductory Algebra 1 concepts.

Students should learn to manipulate and solve quadratic functions rather than simply identify a parabola.

## Core Philosophy

Quadratic functions aren't just equations that create U-shaped graphs.

They allow us to model relationships where one variable changes at a rate that itself changes.

Mountain biking provides some excellent examples:
- Braking distance increases quadratically with speed under a simplified fixed-deceleration model.
- A modeled jump trajectory follows a parabolic curve.
- Jump height, horizontal position, and trajectory shape can be represented using quadratic functions.
- Different forms of an equation reveal different information about the same physical scenario.

The goal is to help students understand the mathematics through experimentation and problem-solving.

**The student should feel like they're analyzing and engineering mountain bike performance, not completing a traditional math worksheet.**

---

# 2. CURRICULUM ALIGNMENT

Place the activity within:

Classes → Algebra 2 → Quadratic Functions → Trail Dynamics Lab.

Use existing Mathlete MTB curriculum IDs and routing conventions.

## Associated Mathematical Skills

### Quadratic Functions
1. Identifying characteristics of parabolas.
2. Standard form of quadratic functions.
3. Vertex form.
4. Factored or intercept form.
5. Identifying zeros and intercepts.
6. Finding vertices and axes of symmetry.
7. Maximum and minimum values.
8. Domain and range.
9. Increasing and decreasing intervals.
10. Quadratic transformations.
11. Comparing quadratic functions.

### Solving Quadratic Equations
12. Square root property.
13. Factoring.
14. Zero-product property.
15. Completing the square.
16. Quadratic formula.
17. Deriving the quadratic formula.
18. Discriminant.
19. Real and complex solutions.
20. Interpreting solutions in context.

### Applications
21. Creating quadratic models.
22. Interpreting quadratic functions.
23. Solving quadratic equations in real-world scenarios.
24. Solving systems consisting of a linear and quadratic equation.

## Learning Objectives

By the end of the activity, students should be able to:

- Recognize and interpret quadratic functions.
- Identify the vertex, axis of symmetry, zeros, and intercepts.
- Understand how coefficients affect a parabola.
- Convert between standard, vertex, and factored forms.
- Use factoring to determine zeros.
- Complete the square to rewrite quadratic functions.
- Solve quadratic equations using multiple methods.
- Use the quadratic formula when other methods are inconvenient.
- Use the discriminant to predict the number and type of solutions.
- Interpret complex solutions.
- Apply quadratic functions to realistic mountain biking scenarios.

## Curriculum Standards

Align with:

- HSF.IF.C.7.A: Graph quadratic functions and show intercepts, maxima, and minima.
- HSF.IF.C.8.A: Use factoring and completing the square to reveal zeros, extreme values, and symmetry.
- HSF.IF.C.9: Compare properties of quadratic functions represented in different ways.
- HSF.BF.B.3: Identify the effects of function transformations.
- HSA.REI.B.4: Solve quadratic equations using factoring, square roots, completing the square, and the quadratic formula.
- HSA.REI.C.7: Solve systems involving a linear and quadratic equation.
- HSN.CN.A.1: Understand complex numbers.
- HSN.CN.A.2: Add, subtract, and multiply complex numbers.
- HSN.CN.C.7: Solve quadratic equations with complex solutions.

---

# 3. OVERALL EXPERIENCE DESIGN

## Theme

# THE TRAIL DYNAMICS LAB

Opening screen:

"You're joining the mountain bike performance team for an upcoming enduro event.

Before race day, the team needs to analyze two important parts of the course:

1. The braking zones, where speed and stopping distance must be understood.
2. The jump lines, where mathematical models help describe the rider's trajectory.

Your job is to investigate the mathematics behind both.

Can you become the team's Trail Dynamics Engineer?"

### Opening Visual

Show:
- A mountain bike descending a trail.
- A braking zone approaching a corner.
- A dirt jump with a rider in the air.
- A technical data display.
- Speed and distance telemetry.
- A mathematical graph overlay.

Primary button:

**ENTER THE LAB**

## Mission Dashboard

Display three primary mission stations:

1. The Brake Zone Lab.
2. Rebuild the Jump.
3. The Landing Analyzer.

The final mission unlocks after completion.

Each mission should display:
- Description.
- Concepts being taught.
- Completion status.
- Progress indicator.

Allow students to revisit completed missions.

---

# 4. MISSION 1 — THE BRAKE ZONE LAB

**Mathematical Focus:** Quadratic relationships, function modeling, graphs, coefficients, transformations, and solving quadratic equations.

**Estimated Completion:** 6–7 minutes.

This is the first major interaction of the lesson.

## The Scenario

"You're analyzing a section of technical downhill trail.

The rider approaches a corner at different speeds. Your team needs to understand how speed affects the distance required to stop.

Can you figure out why a small increase in speed can create a much larger increase in stopping distance?"

Introduce the distinction between:

**Reaction Distance**

The distance traveled during the assumed time before braking begins.

**Braking Distance**

The distance traveled after braking begins.

**Total Stopping Distance**

The sum of reaction distance and braking distance.

Explain that actual mountain bike stopping performance depends on factors including terrain, traction, slope, tires, braking technique, and rider response.

This activity uses a simplified mathematical model for educational purposes, not a real-world riding recommendation.

## The Mathematical Model

Use the following variables:

- v = initial speed in kilometers per hour.
- t = modeled reaction time in seconds.
- D = total stopping distance in meters.

For this educational scenario, assume a reaction interval of 0.9 seconds.

Reaction distance:

\[
R(v)=\frac{0.9}{3.6}v
\]

Simplify:

\[
R(v)=0.25v
\]

Braking distance is modeled using a quadratic relationship:

\[
B(v)=kv^2
\]

Here k is a hypothetical model coefficient representing a fixed set of braking conditions.

The total stopping distance is:

\[
D(v)=R(v)+B(v)
\]

Therefore:

\[
D(v)=kv^2+0.25v
\]

Introduce two fictional simulation models.

**Model A:**

\[
D_A(v)=0.01v^2+0.25v
\]

**Model B:**

\[
D_B(v)=0.015v^2+0.25v
\]

These coefficients are selected for the learning simulation. They are not empirical measurements of particular mountain bike tires, trail surfaces, or braking systems.

## Learning Module A — Discover the Quadratic Relationship

Before showing the equations, ask students:

"What do you think happens to stopping distance when riding speed doubles?"

Possible answers:
- Stopping distance doubles.
- Stopping distance triples.
- Stopping distance increases by a different amount.

Display a table.

| Speed | Model A stopping distance | Model B stopping distance |
|---:|---:|---:|
| 0 km/h | 0 m | 0 m |
| 20 km/h | 9 m | 11 m |
| 30 km/h | 16.5 m | 21 m |
| 40 km/h | 26 m | 34 m |

Ask students to observe how the distances change.

Explain:

"The braking portion of the stopping distance increases with the square of speed in this simplified model. The total stopping distance also includes a linear reaction-distance component."

Highlight:

\[
B(v)=kv^2
\]

If speed doubles:

\[
B(2v)=k(2v)^2
\]

\[
B(2v)=4kv^2
\]

Therefore, modeled braking distance becomes four times as large.

This is the first major mathematical discovery.

## Interactive Component: Stopping Distance Simulator

Build a visually engaging downhill braking simulator.

### Visual Environment

Display:
- A mountain bike traveling downhill.
- A marked braking zone.
- A distance measurement line.
- A digital speed readout.
- A stopping-distance indicator.
- A mathematical graph.

### Controls

Add a speed slider.

Suggested domain:

\[
0\leq v\leq40
\]

The slider represents speed in km/h.

Allow the student to switch between Model A and Model B.

When the student adjusts speed:
- The speedometer updates.
- Reaction distance updates.
- Braking distance updates.
- Total stopping distance updates.
- Graph position updates.
- The visualization indicates the modeled stopping zone.

Display:

| Measurement | Value |
|---|---|
| Initial speed | Dynamic |
| Reaction distance | Dynamic |
| Braking distance | Dynamic |
| Total stopping distance | Dynamic |
| Model | A or B |

Show the calculation:

\[
D(v)=kv^2+0.25v
\]

Let students experiment with changing speed before introducing the formal mathematical explanation.

Do not use this simulation to recommend real riding speeds or stopping distances.

## Learning Module B — Understand the Coefficient

Introduce:

\[
B(v)=kv^2
\]

Explain:
- k controls the quadratic model's vertical scaling.
- A larger k produces greater modeled braking distance at the same speed.
- A smaller k produces less modeled braking distance at the same speed.

Compare:

\[
B_A(v)=0.01v^2
\]

\[
B_B(v)=0.015v^2
\]

Show both graphs.

Ask:

"Which model has the greater braking distance at 30 km/h?"

Expected answer: Model B.

Ask:

"What happens to the graph when k increases?"

Expected understanding: The parabola becomes steeper in the positive-speed domain.

Make clear that this is a comparison of simulated model parameters, not a universal claim about specific real trail surfaces.

## Learning Module C — Solve the Stopping Distance Equation

Now introduce a reverse problem.

"The rider's braking-zone analysis identifies a modeled total stopping distance of 16.5 meters under Model A.

What initial speed produces that result?"

Construct:

\[
0.01v^2+0.25v=16.5
\]

Multiply by 100:

\[
v^2+25v-1650=0
\]

Factor:

\[
(v+55)(v-30)=0
\]

Solutions:

\[
v=-55,\quad v=30
\]

Explain that a negative speed is outside the physical domain of this model.

Therefore:

\[
v=30\text{ km/h}
\]

This demonstrates why solving an equation and interpreting its solutions are two different tasks.

## Independent Challenge

Give students a new available stopping distance of 21 meters under Model B.

Ask them to calculate the initial speed.

Expected equation:

\[
0.015v^2+0.25v=21
\]

Multiply by 200:

\[
3v^2+50v-4200=0
\]

Use the quadratic formula.

The valid nonnegative solution is:

\[
v=30
\]

The second solution is negative and must be rejected in this context.

Give students feedback on:
- Forming the equation.
- Identifying coefficients.
- Applying the quadratic formula.
- Selecting a physically meaningful mathematical solution.

---

# 5. MISSION 2 — REBUILD THE JUMP

**Mathematical Focus:** Quadratic forms, graph features, transformations, factoring, and completing the square.

**Estimated Completion:** 6–7 minutes.

This mission builds directly on the Algebra 1 Jump Lab.

Important: Do not rebuild the existing introductory Jump Lab.

This should be an Algebra 2 progression that assumes students have previously encountered parabolas and basic jump trajectories.

The new experience focuses on understanding how different algebraic forms reveal different features and how to convert between them.

## The Scenario

"The performance team has collected measurements from a fictional jump simulation.

You have the trajectory data, but the original mathematical equation is missing.

Your job is to reconstruct the equation, identify the most important features, and understand how the different forms describe the same jump."

## The Jump Model

Define:

- x = horizontal distance from takeoff in meters.
- J(x) = modeled height relative to the reference ground level in meters.

Use the following quadratic:

\[
J(x)=-0.04x^2+0.8x
\]

Use the model only over:

\[
0\leq x\leq20
\]

The simulated takeoff and landing reference elevations are equal.

The trajectory is a simplified parabolic model, not a complete physical prediction of rider flight.

### Key Features

Vertex:

\[
(10,4)
\]

Axis of symmetry:

\[
x=10
\]

Zeros:

\[
x=0,\quad x=20
\]

Maximum modeled height:

\[
4\text{ meters}
\]

Horizontal range:

\[
20\text{ meters}
\]

Domain:

\[
[0,20]
\]

Range:

\[
[0,4]
\]

Display these measurements on an interactive graph.

## Learning Module A — Three Ways to Describe the Same Jump

Introduce the three important forms of a quadratic function.

### Standard Form

\[
J(x)=ax^2+bx+c
\]

For the jump:

\[
J(x)=-0.04x^2+0.8x
\]

Explain:
- a controls the opening direction and curvature.
- b contributes to the location of the axis of symmetry.
- c is the y-intercept.

### Vertex Form

\[
J(x)=a(x-h)^2+k
\]

For the jump:

\[
J(x)=-0.04(x-10)^2+4
\]

Explain:
- h identifies the horizontal location of the vertex.
- k identifies the vertical location of the vertex.
- a controls the opening direction and width.

### Factored Form

\[
J(x)=a(x-r_1)(x-r_2)
\]

For the jump:

\[
J(x)=-0.04x(x-20)
\]

Explain:
- r1 and r2 are the zeros.
- The zeros indicate the locations where the trajectory intersects the reference elevation.

## Interactive Component: Jump Equation Decoder

Create a large graph with the jump trajectory.

Below or beside the graph, display three selectable tabs:

1. Standard Form.
2. Vertex Form.
3. Factored Form.

When a student selects a form:
- Highlight the associated mathematical features.
- Display the equation.
- Explain what information can be read directly from it.
- Identify which parts of the graph correspond to the equation's values.

Make the connection between mathematical notation and the visual jump explicit.

### Guided Challenge

Ask:

"Which form would you use if you wanted to know the maximum height immediately?"

Answer: Vertex form.

"Which form would you use if you wanted to identify where the jump starts and ends?"

Answer: Factored form.

"Which form provides the general expanded equation?"

Answer: Standard form.

## Learning Module B — Transform the Jump

Introduce the parent quadratic function:

\[
f(x)=x^2
\]

Explain how transformations change the graph.

Use:

\[
g(x)=a(x-h)^2+k
\]

Demonstrate:

- Horizontal shifts.
- Vertical shifts.
- Vertical stretches.
- Vertical compressions.
- Reflections.

### Interactive Component: Jump Profile Tuner

Create a controllable quadratic graph.

Provide three primary controls:

- a: curvature and direction.
- h: horizontal shift.
- k: vertical shift.

Start with:

\[
g(x)=-0.04(x-10)^2+4
\]

When students adjust a parameter:
- Update the parabola.
- Update vertex coordinates.
- Update the axis of symmetry.
- Update zeros when they exist.
- Update maximum or minimum.
- Display the new equation.

Show the original and modified curves together for comparison.

Use a simplified visual jump illustration synchronized with the graph.

Explain that these are mathematical model transformations, not recommendations for changing physical jump geometry or attempting different jumps.

## Learning Module C — Factor the Jump

Introduce:

\[
J(x)=-0.04x^2+0.8x
\]

Factor out the common factor:

\[
J(x)=-0.04x(x-20)
\]

Explain that factored form reveals the zeros immediately.

Set:

\[
J(x)=0
\]

\[
-0.04x(x-20)=0
\]

Using the zero-product property:

\[
x=0\quad\text{or}\quad x=20
\]

Interpret these as the takeoff and landing intersections in the simplified model.

### Interactive Challenge

Display an equation in standard form.

Ask the student to factor it.

After they submit their answer, highlight the resulting zeros on the trajectory graph.

Include some examples that factor easily and some that do not factor over the integers.

---

# 6. MISSION 3 — THE LANDING ANALYZER

**Mathematical Focus:** Square root property, factoring, completing the square, quadratic formula, discriminant, complex roots, and linear-quadratic systems.

**Estimated Completion:** 7–8 minutes.

This is the most algebraically important mission.

The student will use the same jump model to solve different mathematical questions.

The visual environment should make each solution type easy to interpret.

## The Scenario

"The team wants to analyze the rider's modeled trajectory at different heights.

Where does the trajectory reach 2 meters?

What about 3 meters?

Does it ever reach 5 meters?

Your job is to calculate the answers and use the graph to verify your work."

Start with:

\[
J(x)=-0.04(x-10)^2+4
\]

## Learning Module A — Solve Using Square Roots

Question:

"At what horizontal positions does the rider reach 3 meters?"

Construct:

\[
-0.04(x-10)^2+4=3
\]

Subtract 4:

\[
-0.04(x-10)^2=-1
\]

Divide:

\[
(x-10)^2=25
\]

Take square roots:

\[
x-10=\pm5
\]

Solutions:

\[
x=5,\quad x=15
\]

Interpretation:

The simulated rider reaches 3 meters at two different horizontal positions.

Highlight both positions on the graph.

## Learning Module B — Complete the Square

Now start with standard form:

\[
J(x)=-0.04x^2+0.8x
\]

Show the conversion into vertex form.

Factor out the leading coefficient from the variable terms:

\[
J(x)=-0.04(x^2-20x)
\]

Complete the square inside the parentheses:

\[
x^2-20x=(x-10)^2-100
\]

Substitute:

\[
J(x)=-0.04[(x-10)^2-100]
\]

Simplify:

\[
J(x)=-0.04(x-10)^2+4
\]

The vertex is now visible.

### Interactive Component: Complete-the-Square Builder

Display a guided algebra workspace.

Allow the student to fill in the missing terms.

Guide them through:
1. Factoring out the leading coefficient.
2. Identifying the coefficient of x.
3. Taking half of that coefficient.
4. Squaring the result.
5. Creating a perfect-square trinomial.
6. Simplifying to vertex form.

Show the graph updating as each step is completed.

### Why This Matters

Explain that completing the square changes the way a quadratic is written without changing its mathematical graph.

It reveals the vertex and allows students to solve equations using the square root property.

## Learning Module C — The Quadratic Formula

Introduce a trajectory problem that does not factor easily.

Question:

"At what horizontal positions does the modeled jump reach a height of 2 meters?"

Construct:

\[
-0.04x^2+0.8x=2
\]

Move everything to one side:

\[
-0.04x^2+0.8x-2=0
\]

Multiply by -25:

\[
x^2-20x+50=0
\]

Explain that this equation does not factor cleanly using integer factors.

Introduce:

\[
x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
\]

Identify:
- a = 1.
- b = -20.
- c = 50.

Substitute:

\[
x=\frac{20\pm\sqrt{400-200}}{2}
\]

\[
x=\frac{20\pm\sqrt{200}}{2}
\]

Simplify:

\[
x=10\pm5\sqrt2
\]

Approximate:

\[
x\approx2.93,\quad x\approx17.07
\]

Show both intersections on the graph.

### Understanding the Formula

Provide an optional expandable explanation showing how the quadratic formula is derived by completing the square.

Use the general equation:

\[
ax^2+bx+c=0
\]

Divide by a:

\[
x^2+\frac ba x=-\frac ca
\]

Add the required square term:

\[
\left(x+\frac{b}{2a}\right)^2
=
\frac{b^2-4ac}{4a^2}
\]

Then take square roots and solve for x to obtain the quadratic formula.

The student should understand that the quadratic formula is derived from completing the square, not an unrelated formula they simply have to memorize.

## Learning Module D — The Discriminant

Title:

**"Will the Trajectory Reach That Height?"**

Introduce:

\[
\Delta=b^2-4ac
\]

Explain the three outcomes:

| Discriminant | Number of real solutions |
|---|---|
| Positive | Two distinct real solutions |
| Zero | One repeated real solution |
| Negative | No real solutions |

Use the existing jump trajectory.

### Scenario 1 — Two Intersections

Set target height:

\[
J(x)=3
\]

The quadratic has two real solutions:

\[
x=5,\quad x=15
\]

Show the horizontal line intersecting the parabola twice.

### Scenario 2 — One Intersection

Set target height:

\[
J(x)=4
\]

Equation:

\[
-0.04x^2+0.8x-4=0
\]

Multiply by -25:

\[
x^2-20x+100=0
\]

Factor:

\[
(x-10)^2=0
\]

Discriminant:

\[
\Delta=400-400=0
\]

Single repeated solution:

\[
x=10
\]

The horizontal line touches the parabola at its vertex.

### Scenario 3 — No Real Intersections

Set target height:

\[
J(x)=5
\]

Equation:

\[
-0.04x^2+0.8x-5=0
\]

Multiply by -25:

\[
x^2-20x+125=0
\]

Discriminant:

\[
\Delta=400-500=-100
\]

Quadratic formula:

\[
x=10\pm5i
\]

There are no real horizontal positions where the modeled trajectory reaches 5 meters.

Explain that the complex roots are valid algebraic solutions, but they do not represent actual horizontal positions on the real trail.

### Interactive Component: Trajectory Height Analyzer

Build an interactive graph with:

- A quadratic trajectory.
- An adjustable horizontal target-height line.
- Display of the intersection points.
- Automatic calculation of the discriminant.
- A real-time count of real intersections.

Allow students to drag the target-height line.

When moved:
- The discriminant updates.
- The number of real intersections updates.
- Intersection points appear or disappear.
- The quadratic equation updates.
- The solution method is displayed.

The student should physically see the connection between the discriminant and the graph.

This should be one of the most visually effective features of the entire lesson.

## Learning Module E — Complex Number Extension

Introduce the meaning of imaginary and complex solutions.

Explain:

\[
i^2=-1
\]

For the 5-meter target-height equation:

\[
x=10\pm5i
\]

The complex solutions are conjugates.

These aren't physical distances. They represent mathematical solutions outside the real-number coordinate plane.

Include a short optional practice section on:
- Identifying imaginary numbers.
- Adding complex numbers.
- Subtracting complex numbers.
- Multiplying complex numbers.
- Simplifying powers of i.

Do not force artificial mountain biking interpretations onto abstract complex-number arithmetic.

Use the lesson's technical engineering context as the introduction, then explain the mathematics directly.

---

# 7. FINAL MISSION — TRAIL DYNAMICS ENGINEER

After completing the three main missions, unlock the final challenge.

Title:

# THE FINAL COURSE ANALYSIS

"You've analyzed braking distances, reconstructed a jump trajectory, and investigated different quadratic solutions.

Now the team needs you to complete the final performance report."

Create three independent challenge sections.

## Challenge A — Braking Analysis

Use:

\[
D(v)=0.01v^2+0.25v
\]

The modeled stopping distance is 21 meters.

Ask the student to:
1. Construct the equation.
2. Write it in standard form.
3. Solve using the quadratic formula or factoring where appropriate.
4. Identify the valid nonnegative solution.
5. Explain why the other mathematical solution is not meaningful in this model.

Expected equation:

\[
0.01v^2+0.25v=21
\]

\[
v^2+25v-2100=0
\]

\[
(v+60)(v-35)=0
\]

\[
v=35
\]

The valid modeled speed is 35 km/h.

Make clear that this is an exercise using simulated data, not a real riding recommendation.

## Challenge B — Reconstruct the Jump

Provide a new fictional trajectory:

\[
J(x)=-0.05x^2+0.8x
\]

Ask students to:
1. Identify the coefficients.
2. Find the axis of symmetry.
3. Find the vertex.
4. Determine the zeros.
5. Write the equation in vertex form.
6. Write the equation in factored form.

Expected results:

Vertex:

\[
(8,3.2)
\]

Axis of symmetry:

\[
x=8
\]

Zeros:

\[
x=0,\quad x=16
\]

Vertex form:

\[
J(x)=-0.05(x-8)^2+3.2
\]

Factored form:

\[
J(x)=-0.05x(x-16)
\]

## Challenge C — Diagnose the Landing Height

Use the new jump model.

Ask:

"At what horizontal positions does the modeled trajectory reach 2 meters?"

Equation:

\[
-0.05x^2+0.8x=2
\]

Multiply by -20:

\[
x^2-16x+40=0
\]

Use the quadratic formula:

\[
x=\frac{16\pm\sqrt{256-160}}{2}
\]

\[
x=\frac{16\pm\sqrt{96}}{2}
\]

\[
x=8\pm2\sqrt6
\]

Approximate solutions:

\[
x\approx3.10,\quad x\approx12.90
\]

Ask students to verify the results graphically.

## Completion Screen

Display:

# TRAIL DYNAMICS ENGINEER

"You've completed the performance analysis.

You've used quadratic functions to investigate stopping distances, reconstruct mountain bike jump trajectories, and solve complex mathematical problems."

Show:
- Missions completed.
- Mathematical skills practiced.
- Challenge attempts.
- Correct answers.
- Independent solutions.
- Areas needing additional practice.

Save the student's results using existing Mathlete MTB progress infrastructure.

Do not automatically assign mastery solely on activity completion.

---

# 8. VISUAL DESIGN AND USER EXPERIENCE

## Overall Aesthetic

The experience should feel like a mountain bike performance analysis tool.

Think:
- Enduro race telemetry.
- Technical downhill trail analysis.
- Jump trajectory software.
- Digital speed and braking displays.
- Performance engineering dashboards.

Use existing Mathlete MTB branding and components.

## Mission-Specific Visuals

**The Brake Zone Lab**
- Downhill trail scene.
- Speedometer.
- Stopping-distance visualization.
- Braking zone markers.
- Graphs comparing braking models.

**Rebuild the Jump**
- Side-view jump illustration.
- Rider trajectory.
- Coordinate plane.
- Highlighted vertex, zeros, and axis of symmetry.
- Equation decoder.

**The Landing Analyzer**
- Interactive trajectory graph.
- Adjustable target-height line.
- Intersection markers.
- Mathematical working panel.
- Discriminant readout.

## Graphing Standards

- Mathematical graphs must accurately represent the functions.
- Units must be clearly labeled.
- Coordinate proportions must be preserved.
- Use visually distinguishable features for roots, vertices, and target lines.
- Allow students to explore graphs without losing their place in the lesson.
- Avoid visual clutter.

## Responsive Design

Support desktop, tablet, and mobile.

The graph should remain the dominant element.

Stack controls below the graph on smaller devices.

Support sliders, keyboard controls, and touch interactions.

Respect reduced-motion settings.

---

# 9. ASSESSMENT AND FEEDBACK

Reuse the established Mathlete MTB assessment architecture.

Support:
- Multiple-choice questions.
- Numerical entry.
- Equation construction.
- Graph interpretation.
- Factoring exercises.
- Formula substitution.
- Discriminant classification.
- Short written explanations.

## Progressive Hints

**Hint 1 — Conceptual**

Give the student a conceptual reminder.

**Hint 2 — Method**

Identify the algebraic process they should consider.

**Hint 3 — Guided Step**

Show the next operation.

**Solution**

Show the entire mathematical solution with an explanation of what it means in the scenario.

## Common Misconceptions to Track

Quadratic functions:
- Confusing standard and vertex forms.
- Misreading negative signs in vertex form.
- Misidentifying the vertex.
- Confusing roots with the vertex.
- Misinterpreting transformations.
- Forgetting the real-world domain restrictions.

Factoring:
- Incorrect signs.
- Incorrect factor pairs.
- Forgetting the zero-product property.

Completing the square:
- Forgetting to divide by the leading coefficient.
- Incorrectly taking half the coefficient of x.
- Forgetting to square the half-coefficient.
- Incorrectly managing constants.

Quadratic formula:
- Misidentifying a, b, and c.
- Forgetting parentheses around negative coefficients.
- Incorrectly calculating the discriminant.
- Making errors with radicals.

Complex solutions:
- Treating a negative discriminant as proof that the equation has no mathematical solutions.
- Misunderstanding i.
- Incorrectly simplifying imaginary numbers.

Use these categories to associate incorrect attempts with the appropriate mathematical skill.

---

# 10. STUDENT PROGRESS INTEGRATION

Use existing Mathlete MTB activity progress infrastructure.

Track performance for:

1. Quadratic function recognition.
2. Identifying graph features.
3. Standard form.
4. Vertex form.
5. Factored form.
6. Graph transformations.
7. Factoring quadratics.
8. Completing the square.
9. Square root property.
10. Quadratic formula.
11. Discriminant.
12. Complex solutions.
13. Quadratic modeling.
14. Interpreting solutions in context.

Record:
- Activity started.
- Mission started.
- Attempt count.
- Correct answers.
- Incorrect answers.
- Hints requested.
- Completion status.
- Independent challenge results.
- Time spent.

Distinguish between participation, performance, and demonstrated skill understanding.

---

# 11. MATHEMATICAL ENGINE AND TECHNICAL REQUIREMENTS

The application must use a single authoritative mathematical calculation layer.

The graph, visual simulation, displayed equations, challenges, and answer validation must all use the same mathematical source.

## Braking Distance Model

Model A:

\[
D_A(v)=0.01v^2+0.25v
\]

Model B:

\[
D_B(v)=0.015v^2+0.25v
\]

Domain:

\[
0\leq v\leq40
\]

Units:
- Input: km/h.
- Output: meters.

Reaction interval: 0.9 seconds, as a fixed simulation assumption.

All parameters should be editable through the internal model configuration, not scattered across UI components.

## Jump Model

Primary model:

\[
J(x)=-0.04x^2+0.8x
\]

Domain:

\[
0\leq x\leq20
\]

Units:
- x: horizontal distance in meters.
- J(x): height relative to the reference ground level in meters.

Equivalent forms:

Standard:

\[
J(x)=-0.04x^2+0.8x
\]

Vertex:

\[
J(x)=-0.04(x-10)^2+4
\]

Factored:

\[
J(x)=-0.04x(x-20)
\]

All derived features must be computed from the function or its validated coefficients.

## Equation Solver

Support:
- Factoring.
- Square root property.
- Completing the square.
- Quadratic formula.
- Discriminant calculation.
- Real and complex roots.

Use exact symbolic values where practical.

Use numerical approximations only when appropriate, with clearly defined precision.

## Validation Requirements

- Verify all equation conversions.
- Verify all roots by substitution.
- Verify all graph intersection points.
- Confirm discriminant classifications.
- Confirm complex roots are mathematically correct.
- Handle zero and negative coefficients appropriately.
- Prevent division by zero.
- Restrict scenario values to valid domains.
- Ensure displayed rounding does not affect answer evaluation.

Randomized assessments must use verified question parameters.

---

# 12. TECHNICAL ARCHITECTURE

Suggested components:

**TrailDynamicsDashboard**
- Opening experience.
- Mission board.
- Progress.

**BrakeZoneSimulator**
- Speed controls.
- Stopping-distance models.
- Live calculations.
- Graph comparisons.

**QuadraticGraph**
- Parabola rendering.
- Coordinate plane.
- Roots and vertex.
- Target-height line.

**JumpProfileTuner**
- Function transformations.
- Adjustable coefficients.
- Visual jump representation.

**EquationDecoder**
- Standard form.
- Vertex form.
- Factored form.
- Equation conversion.

**QuadraticSolver**
- Factoring.
- Completing the square.
- Quadratic formula.
- Solution verification.

**LandingAnalyzer**
- Target-height controls.
- Discriminant.
- Intersections.
- Complex solutions.

**ChallengeEngine**
- Question generation.
- Answer validation.
- Hints.
- Feedback.
- Scoring.

**ProgressTracker**
- Student attempts.
- Skill associations.
- Completion.

These are proposed component boundaries.

Inspect existing Mathlete MTB code before implementing them. Reuse the existing Jump Lab graphing capabilities, math-rendering tools, sliders, and assessment infrastructure where appropriate.

Do not duplicate functionality or introduce unnecessary dependencies.

---

# 13. RESEARCH AND EDUCATIONAL REFERENCES

Use the following resources when developing the educational content.

## Algebra 2 Curriculum

1. Common Core — Solving Quadratic Equations:
https://www.thecorestandards.org/Math/Content/HSA/REI/

Relevant standard: HSA.REI.B.4.

2. Common Core — Interpreting Functions:
https://www.thecorestandards.org/Math/Content/HSF/IF/

Relevant standards: HSF.IF.B.4, HSF.IF.C.7, HSF.IF.C.8, HSF.IF.C.9.

3. OpenStax — Quadratic Functions:
https://openstax.org/books/college-algebra/pages/5-1-quadratic-functions

4. OpenStax — Completing the Square and Quadratic Formula:
https://openstax.org/books/intermediate-algebra-2e/pages/9-2-solve-quadratic-equations-by-completing-the-square

https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula

5. Fishtank Learning — Algebra 2 Quadratics Curriculum:
https://www.fishtanklearning.org/curriculum/math/algebra-2/quadratics/

## Quadratic Modeling and Braking

6. New Zealand Ministry of Education — Quadratics in Context:
https://newzealandcurriculum.tahurangi.education.govt.nz/quadratics-in-context/5637187368.p

Particularly useful sections:
- Quadratic relationships.
- Braking distance models.
- Reaction distance.
- Total stopping distance.
- Effects of changing model conditions.

## Mountain Biking Context

7. British Cycling — Braking Tips for Cycling:
https://www.britishcycling.org.uk/knowledge/bike-kit/get-started/article/20250911-Braking-tips-for-cycling-0

Use this to understand the importance of terrain, surface, and braking technique.

All scenarios, graphics, exercises, and explanations should be original Mathlete MTB content.

Do not reproduce third-party educational material.

---

# 14. IMPLEMENTATION PRIORITIES

Before development:

1. Read docs/LAB_DEVELOPMENT_FRAMEWORK.md.
2. Audit the existing Algebra 2 curriculum and routing.
3. Inspect the existing Algebra 1 Jump Lab.
4. Review the previous Algebra 2 Race-Day Workshop.
5. Identify reusable graphing, equation, visualization, and assessment components.
6. Confirm student progress infrastructure.

Build in this sequence:

**Phase 1:** Trail Dynamics Lab opening experience and mission dashboard.

**Phase 2:** Brake Zone Lab, including quadratic stopping-distance models and simulator.

**Phase 3:** Rebuild the Jump, including quadratic forms, graph features, and transformations.

**Phase 4:** Landing Analyzer, including square roots, factoring, completing the square, and the quadratic formula.

**Phase 5:** Discriminant and complex-solution visualization.

**Phase 6:** Final Trail Dynamics Engineer challenge.

**Phase 7:** Progress integration, responsive design, accessibility, and testing.

Complete the actual learning interactions, not just the visual design.

Verify the mathematical calculations independently.

---

# 15. ACCEPTANCE CRITERIA

- [ ] Activity appears under Algebra 2 → Quadratic Functions.
- [ ] Opening experience and mission navigation work.
- [ ] Brake Zone Simulator works.
- [ ] Reaction and braking distances are distinguished.
- [ ] Both braking models calculate correctly.
- [ ] Graphs update with changes in speed.
- [ ] Jump trajectory visualization works.
- [ ] Standard, vertex, and factored forms are equivalent.
- [ ] Vertex, zeros, and axis of symmetry are correct.
- [ ] Transformation controls work.
- [ ] Factoring exercises work.
- [ ] Completing-the-square activity works.
- [ ] Square root property exercises work.
- [ ] Quadratic formula calculations work.
- [ ] Discriminant outcomes are represented correctly.
- [ ] Complex solutions are explained.
- [ ] Landing Analyzer updates correctly.
- [ ] Final assessment evaluates mathematical understanding.
- [ ] Student progress integrates with existing infrastructure.
- [ ] Desktop and mobile layouts work.
- [ ] Accessibility requirements are addressed.
- [ ] Existing Mathlete MTB resources remain functional.

---

# FINAL PRODUCT PRINCIPLE

The Trail Dynamics Lab should show students that quadratic functions are powerful mathematical tools for understanding relationships that change nonlinearly.

The student starts by exploring how speed affects stopping distance.

They then use different quadratic equations to reconstruct and analyze a jump trajectory.

Finally, they solve increasingly complex mathematical problems and learn how the number and type of solutions are connected to the graph.

The student should finish thinking:

"I understand why quadratic functions work, how to use them, and how they describe things I actually experience when mountain biking."

**Make this the Algebra 2 quadratic learning experience that students remember.**