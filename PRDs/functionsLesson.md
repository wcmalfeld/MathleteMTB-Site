# PRD: MATHLETE MTB — ALGEBRA 2
# THE RIDE SYSTEMS LAB: FUNCTIONS

**Product:** Mathlete MTB  
**Feature:** The Ride Systems Lab  
**Course:** Algebra 2  
**Unit:** Functions  
**Topic:** Function Notation, Domain and Range, Composition, Transformations, and Inverse Functions  
**Activity Type:** Interactive Learning Lab / Simulation / Mission-Based Game  
**Target Audience:** High-school Algebra 2 students  
**Estimated Completion:** 20–25 minutes  
**Priority:** First flagship lesson for the Algebra 2 Functions unit

---

# 1. PRODUCT VISION

## The Big Idea

Build an interactive mountain biking engineering experience where students discover how mathematical functions describe the relationships between different parts of mountain biking.

The student becomes a mountain bike performance engineer.

Their job is to investigate how different inputs produce different outputs in a mountain bike system.

They will:
- Analyze the elevation profile of a mountain bike trail.
- Understand how pedal cadence affects wheel rotation and riding speed.
- Explore how different mathematical transformations change a trail profile.
- Work backward from a target speed to calculate the required pedaling cadence.
- Understand how a function can be reversed and why some relationships cannot be reversed without restricting their domain.

The central teaching principle:

**Functions connect inputs to outputs. Mountain biking is full of these relationships.**

This should be a highly visual and interactive learning experience.

Do not build a traditional math lesson with mountain biking pictures attached.

Build a virtual ride analysis laboratory where the student explores mathematical relationships through actual mountain biking scenarios.

---

# 2. CURRICULUM ALIGNMENT

Place this lesson within:

Classes → Algebra 2 → Unit 2: Functions → Function Notation, Composition, Transformations, and Inverses.

Follow the existing Mathlete MTB curriculum hierarchy and course IDs. Adjust unit numbering if the current course data uses a different sequence.

## Associated Skills

### Primary Skills

1. Understanding functions and input-output relationships.
2. Function notation.
3. Evaluating functions.
4. Identifying independent and dependent variables.
5. Understanding domain and range.
6. Interpreting functions from graphs and tables.
7. Composing functions.
8. Understanding how the order of composition affects results.
9. Function transformations.
10. Vertical and horizontal shifts.
11. Vertical and horizontal stretches and compressions.
12. Reflections of functions.
13. Finding inverse functions.
14. Restricting domains to create inverse functions.

### Additional Skills

15. Understanding one-to-one functions.
16. Using the horizontal line test.
17. Combining functions using arithmetic operations.
18. Interpreting function models in real-world scenarios.

## Learning Objectives

By completing this lesson, students should be able to:

- Explain what makes a mathematical relationship a function.
- Identify a function's input, output, domain, and range.
- Evaluate a function using equations, tables, and graphs.
- Construct functions from mountain biking scenarios.
- Understand how multiple functions can be composed.
- Explain how transformations affect the graph of a function.
- Find the inverse of a function.
- Understand why some functions must have their domains restricted before they can have inverse functions.
- Apply functions to solve realistic mountain biking problems.

## Standards Alignment

Use these as the primary reference points:

- HSF.IF.A.1: Understand functions and the relationship between domain and range.
- HSF.IF.A.2: Evaluate and interpret function notation.
- HSF.IF.B.4: Interpret important features of functions.
- HSF.IF.B.5: Relate domain to the graph and context.
- HSF.IF.C.7: Analyze functions using graphs.
- HSF.BF.A.1: Build functions that model relationships.
- HSF.BF.A.1.b: Combine functions using arithmetic operations.
- HSF.BF.A.1.c: Compose functions.
- HSF.BF.B.3: Identify the effects of function transformations.
- HSF.BF.B.4: Find inverse functions.

---

# 3. OVERALL EXPERIENCE DESIGN

## Theme

# THE RIDE SYSTEMS LAB

Subtitle:

"Every ride is a system of inputs, outputs, and relationships. Can you figure out how they all work?"

Opening scenario:

"You've joined a mountain bike performance engineering team.

Your team wants to understand how a bike, its gearing, and the trail work together.

From analyzing elevation changes to calculating riding speed, your job is to use mathematical functions to understand what's happening.

Ready to investigate?"

Display a stylized technical mountain bike workshop environment with:

- A mountain bike.
- Drivetrain close-up.
- Rear cassette and chainring.
- Digital performance displays.
- Trail elevation map.
- GPS computer.
- Mathematical telemetry.

Primary button:

**ENTER THE LAB**

## Mission Navigation

Display four mission stations:

1. Read the Trail.
2. The Gearbox Lab.
3. Transform the Trail.
4. Reverse the Ride.

Each mission should include:
- A short description.
- Relevant learning objectives.
- Completion status.
- Progress indicator.

A final mission should unlock when the four primary stations are complete.

Allow students to revisit all previous sections.

---

# 4. MISSION 1 — READ THE TRAIL

**Mathematical Focus:** Functions, notation, evaluating functions, domain, range, and graph interpretation.

**Estimated Time:** 5–6 minutes.

## The Scenario

"You've just downloaded the GPS data from a mountain bike trail.

The data shows how the elevation changes as the rider travels along the trail.

Your job is to analyze the route and understand the mathematical relationship between distance and elevation."

Display a mountain biking trail and a stylized GPS elevation profile.

Introduce:

**Input:** Distance traveled along the trail.

**Output:** Elevation at that distance.

Explain:

"A function is a mathematical relationship where each input has exactly one output."

For a defined trail, each distance along the route corresponds to one elevation.

## The Trail Dataset

Create a fictional trail named:

**Pine Ridge Enduro Stage**

Use the following sample GPS data:

| Distance along trail (km) | Elevation (m) |
|---:|---:|
| 0.0 | 2,400 |
| 0.5 | 2,460 |
| 1.0 | 2,430 |
| 1.5 | 2,500 |
| 2.0 | 2,480 |
| 2.5 | 2,550 |
| 3.0 | 2,520 |

These are illustrative simulated measurements, not real GPS data.

Build an interactive graph using this dataset.

Use piecewise-linear interpolation between sample points for visual exploration.

Clearly label the graph:
- X-axis: Distance along trail (km).
- Y-axis: Elevation above sea level (m).

### Learning Module A — Function Notation

Introduce:

\[
E(d)=\text{Elevation at distance }d
\]

Explain:
- E represents the elevation function.
- d represents the distance traveled.
- E(d) represents the elevation at a specific distance.

Example:

\[
E(1.5)=2500
\]

Interpretation:

"At 1.5 km along the trail, the rider is at an elevation of 2,500 meters."

### Interactive Component: GPS Trail Explorer

Build an interactive trail profile.

Students can drag a location marker along the trail.

When the marker moves:
- Update the distance traveled.
- Update the current elevation.
- Display the function notation.
- Highlight the corresponding point on the graph.
- Update a small marker on the illustrated trail.

Display:

| Trail telemetry | Current value |
|---|---|
| Distance | Dynamic |
| Elevation | Dynamic |
| Function value | E(d) |
| Elevation change from start | Dynamic |

Students should see the input-output relationship update immediately.

### Guided Questions

Ask:

"What is E(2.5)?"

Expected answer: 2,550 meters.

Then ask:

"What is the input in this function?"

Expected answer: Distance traveled.

"What is the output?"

Expected answer: Elevation.

"What would happen if we tried to assign two different elevations to the same trail distance?"

Explain why this would violate the definition of a function for this fixed trail profile.

### Learning Module B — Domain and Range

Explain:

"The domain is the set of all possible inputs. The range is the set of all possible outputs."

For the Pine Ridge trail:

Domain:

\[
0\leq d\leq3
\]

Range:

\[
2400\leq E(d)\leq2550
\]

Explain these results in terms of the physical trail.

The distance cannot be less than the starting point or greater than the finish.

The elevation values range between the lowest and highest points along the mapped course.

### Interactive Component: Domain and Range Explorer

Display the trail graph with two selectable overlays.

**Domain Mode**
- Highlight the horizontal input interval.
- Show minimum and maximum distances.
- Allow the student to select points along the horizontal axis.

**Range Mode**
- Highlight the vertical output interval.
- Show minimum and maximum elevations.
- Allow the student to select elevations.

Ask students to identify:
- Minimum distance.
- Maximum distance.
- Minimum elevation.
- Maximum elevation.

### Learning Module C — Function Behavior

Introduce:
- Increasing functions.
- Decreasing functions.
- Maximum values.
- Minimum values.

Use the trail profile to explain:

The trail increases in elevation from 0 to 0.5 km.

It decreases from 0.5 to 1.0 km.

It increases again from 1.0 to 1.5 km.

It continues through additional climbs and descents.

Allow students to highlight increasing and decreasing intervals.

### Additional Challenge — Is the Inverse a Function?

This introduces the concept of one-to-one functions.

Ask:

"If you knew someone's elevation on this trail, could you always determine exactly how far along the trail they were?"

Display the elevation graph.

Show a horizontal line at 2,460 meters.

The graph intersects this elevation at more than one distance.

Explain:

"Two different points on the trail can have the same elevation. Therefore, knowing elevation alone does not necessarily tell us the rider's exact location."

Introduce the horizontal line test.

This will prepare students for the inverse function mission later.

---

# 5. MISSION 2 — THE GEARBOX LAB

**Mathematical Focus:** Function composition, function notation, evaluating functions, and building functions from real-world relationships.

**Estimated Time:** 6–7 minutes.

This is the centerpiece of the entire lesson.

## The Scenario

"You're testing a mountain bike drivetrain.

You want to understand how the rider's pedaling cadence translates into actual wheel speed.

The drivetrain has multiple stages, and each stage has a mathematical relationship."

Display a close-up illustration of:

- Crank arms.
- Front chainring.
- Chain.
- Rear cassette.
- Rear wheel.
- Tire.

Explain:

"A rider pedals the crank. The chain transfers that rotation to the rear sprocket, which turns the rear wheel. The wheel then converts rotational movement into forward distance."

This is an excellent real-world example of function composition.

## The Mathematical Model

Create two separate functions.

### Function 1 — Cadence to Wheel Rotation

Let:

c = pedal cadence in revolutions per minute.

For the initial model:
- Front chainring: 32 teeth.
- Rear sprocket: 16 teeth.

Gear ratio:

\[
R=\frac{32}{16}=2
\]

Each revolution of the crank produces two rear-wheel revolutions under the simplified fixed-gear model.

Define:

\[
f(c)=2c
\]

Where f(c) represents rear-wheel revolutions per minute.

Example:

If cadence is 80 RPM:

\[
f(80)=2(80)=160
\]

The rear wheel rotates at 160 RPM.

### Function 2 — Wheel Rotation to Ground Speed

Use an illustrative measured wheel circumference of 2.30 meters.

The relationship is:

\[
g(w)=\frac{2.30\times60}{1000}w
\]

Simplify:

\[
g(w)=0.138w
\]

Where:
- w is rear-wheel RPM.
- g(w) is forward speed in km/h.

This is an idealized rolling model assuming no slipping.

### Function Composition

Now connect the functions.

\[
f(c)=2c
\]

\[
g(w)=0.138w
\]

The output of f becomes the input of g.

Therefore:

\[
(g\circ f)(c)=g(f(c))
\]

Substitute:

\[
g(f(c))=0.138(2c)
\]

\[
S(c)=0.276c
\]

The final function describes pedal cadence as an input and bike speed as an output.

For an 80 RPM cadence:

\[
S(80)=0.276(80)
\]

\[
S(80)=22.08\text{ km/h}
\]

The student has just combined two functions into one.

## Interactive Component: The Drivetrain Simulator

Build a dynamic mountain bike drivetrain simulation.

This should be a highly visual interactive experience.

### Visual Layout

Display:
- Animated crank.
- Front chainring.
- Moving chain.
- Rear sprocket.
- Rear wheel.
- Speed readout.

The student should be able to see the relationship between the different parts.

### Controls

Allow adjustment of:

1. Pedal cadence.
2. Front chainring tooth count, within a small predefined set.
3. Rear sprocket tooth count.
4. Wheel circumference.

For the initial learning example, use:
- 32T front chainring.
- 16T rear sprocket.
- 2.30m wheel circumference.
- 80 RPM cadence.

Offer rear sprocket selections such as 16T, 20T, and 24T.

Use appropriate units and realistic model constraints.

When the student changes cadence:
- The crank animation changes.
- The chainring rotates.
- Rear-wheel RPM updates.
- The wheel animation updates.
- Ground speed changes.

When the student changes gearing:
- The gear ratio updates.
- The functions update.
- The final speed updates.

When wheel circumference changes:
- Ground speed updates without changing wheel RPM.

### Function Pipeline

Display a clear visual flow:

Cadence → Gear Ratio → Wheel RPM → Wheel Circumference → Bike Speed.

For the primary lesson, distinguish the two function stages:
- Cadence to wheel RPM.
- Wheel RPM to bike speed.

Show the equations alongside the animation.

This pipeline must reinforce the meaning of composition.

### Learning Module A — Composition of Functions

Explain:

"Composition happens when the output of one function becomes the input of another function."

Use the drivetrain example.

Ask:

"If the pedals turn at 80 RPM, how fast does the rear wheel rotate?"

Then:

"If the wheel rotates at 160 RPM, what speed does the bike travel at?"

Finally:

"What is the bike speed function when we combine both stages?"

Require students to solve the composition.

### Learning Module B — Order Matters

Introduce:

\[
g(f(c))
\]

Explain why we first calculate wheel RPM, then use wheel RPM to calculate ground speed.

Show that:

\[
f(g(c))
\]

does not make sense in this model because the units produced by g are km/h, while f expects cadence in RPM.

The order of composition must follow the actual relationship between inputs and outputs.

### Domain and Range of the Composite Function

Use a practice range:

\[
40\leq c\leq110
\]

The corresponding speed function is:

\[
S(c)=0.276c
\]

The modeled speed range is:

\[
11.04\leq S(c)\leq30.36
\]

Explain why the model has a restricted domain.

The simulator should show the corresponding cadence and speed ranges.

### Optional Function Operations Extension

Create an optional activity called:

**Combine the Trail Layers**

Use:
- f(d): underlying terrain elevation.
- b(d): height of a raised trail structure above the underlying terrain.

Define:

\[
T(d)=f(d)+b(d)
\]

Explain that combining functions by addition can create a model of the actual riding surface elevation.

Use a simplified raised boardwalk scenario to show the relationship.

This introduces arithmetic operations with functions without distracting from the main composition lesson.

---

# 6. MISSION 3 — TRANSFORM THE TRAIL

**Mathematical Focus:** Function transformations, vertical and horizontal shifts, stretches, compressions, and reflections.

**Estimated Time:** 5–6 minutes.

## The Scenario

"Your trail mapping software lets you change how an elevation profile is displayed.

You can adjust the vertical scale, move the reference elevation, or stretch and compress the horizontal distance.

But what exactly happens to the mathematical function when you make these changes?"

Use the Pine Ridge elevation profile from Mission 1.

For this activity, define the relative elevation function:

\[
h(d)=E(d)-2400
\]

This expresses the elevation relative to the starting elevation.

Use:

\[
h(d)=[0,60,30,100,80,150,120]
\]

for the sampled distances from the original dataset.

Keep the actual trail data unchanged.

## Learning Module A — Vertical Shifts

Introduce:

\[
g(d)=h(d)+k
\]

Explain:

Adding a constant to the output moves the entire graph vertically.

In this trail mapping context, adding 2,400 meters converts relative elevation into elevation above sea level.

\[
E(d)=h(d)+2400
\]

Show the original and transformed graphs simultaneously.

Interactive control:

Allow students to change k.

The profile should move up and down.

Ask:

"What happens to the graph when we add 50 to the entire function?"

Expected understanding:

Every output increases by 50, while the overall shape remains unchanged.

## Learning Module B — Vertical Stretch and Compression

Introduce:

\[
g(d)=a h(d)
\]

Explain:

- If |a| is greater than 1, the graph stretches vertically.
- If 0 is less than |a| and |a| is less than 1, the graph compresses vertically.
- If a is negative, the graph also reflects across the horizontal axis.

Mountain biking connection:

"Imagine that you're adjusting the vertical exaggeration in your trail profile software. A larger vertical scale makes climbs and descents appear more pronounced, while a smaller scale flattens the visual representation."

Emphasize that this changes the display, not the actual mountain.

Interactive control:

Provide a vertical scale slider.

Example:

\[
g(d)=1.5h(d)
\]

Show the increased vertical variation.

## Learning Module C — Horizontal Stretch and Compression

Introduce:

\[
g(d)=h(kd)
\]

Explain:

- If k is greater than 1, the graph is compressed horizontally.
- If 0 is less than k and k is less than 1, the graph is stretched horizontally.

Use the trail map to show how the same elevation features appear closer together or farther apart when the horizontal distance scale changes.

Interactive control:

Provide a horizontal scale slider.

Display the original and transformed trail profiles.

Make the change in the input variable visible.

## Learning Module D — Horizontal Shifts

Introduce:

\[
g(d)=h(d-k)
\]

Explain:

This shifts the graph horizontally.

- h(d - k) moves the graph right.
- h(d + k) moves the graph left.

Use a trail section starting-point marker to create a visual explanation.

The mathematics changes the location of the graph relative to its distance origin.

Make clear that this is a mathematical coordinate transformation, not a claim that an actual trail has physically moved.

## Interactive Component: Trail Transformation Studio

Build an interactive transformation interface.

Display:
- Original trail graph.
- Transformed trail graph.
- Transformation equation.
- Transformation controls.

Controls should include:
- Vertical shift.
- Vertical scale.
- Horizontal shift.
- Horizontal scale.
- Optional reflection.

Allow students to adjust one transformation at a time and then combine multiple transformations.

Show the resulting function dynamically.

### Transformation Challenge

Give students a target transformed graph.

Ask them to change the controls until their graph matches the target.

Then ask them to identify the mathematical transformation.

Example:

"The trail profile is shifted upward by 40 meters and stretched vertically by a factor of 2."

The resulting transformation is:

\[
g(d)=2h(d)+40
\]

The visual graph should demonstrate both changes.

Students should have to understand what the equation does rather than blindly adjusting sliders.

---

# 7. MISSION 4 — REVERSE THE RIDE

**Mathematical Focus:** Inverse functions, one-to-one relationships, domain restrictions, and verification.

**Estimated Time:** 5–6 minutes.

## The Scenario

"So far, we've been using inputs to calculate outputs.

But what happens when you know the result and want to work backward?"

Example:

"You know the speed you want to ride at, but what pedal cadence do you need to achieve it?"

This introduces inverse functions through an intuitive mountain biking example.

## Learning Module A — Reverse the Drivetrain

Recall:

\[
S(c)=0.276c
\]

The speed function accepts cadence and returns bike speed.

Now introduce the inverse:

\[
S^{-1}(v)=\frac{v}{0.276}
\]

Explain that this function accepts speed and returns the required cadence under the same fixed-gear model.

Example:

The rider wants to travel at 22.08 km/h.

\[
S^{-1}(22.08)=\frac{22.08}{0.276}
\]

\[
S^{-1}(22.08)=80
\]

The required cadence is 80 RPM.

### Interactive Component: Work Backward Calculator

Provide two modes:

**Mode 1 — Forward**
- Student enters cadence.
- Simulator calculates speed.

**Mode 2 — Reverse**
- Student enters target speed.
- Simulator calculates required cadence.

Show the forward and inverse equations side by side.

Display the input and output roles changing.

### Learning Module B — One-to-One Functions

Explain that an inverse function exists as a function only when every output corresponds to exactly one input.

Introduce the horizontal line test.

Show a straight increasing speed-versus-cadence graph.

Any horizontal line intersects it once, so it is one-to-one over the modeled domain.

Now return to the trail elevation graph.

The entire trail profile is not one-to-one because the same elevation can occur at more than one distance.

Therefore, the full profile does not have an inverse that is a function.

### Learning Module C — Restricting the Domain

Show one steadily climbing section of the Pine Ridge trail.

From 1.0 km to 1.5 km:

- At 1.0 km, elevation is 2,430 m.
- At 1.5 km, elevation is 2,500 m.

Using linear interpolation between these sampled points:

\[
E(d)=2430+140(d-1)
\]

Restrict the domain:

\[
1\leq d\leq1.5
\]

Over this section, every elevation corresponds to exactly one distance.

Solve for d:

\[
E-2430=140(d-1)
\]

\[
d=1+\frac{E-2430}{140}
\]

This gives the inverse:

\[
E^{-1}(y)=1+\frac{y-2430}{140}
\]

where y represents elevation in meters.

Example:

At 2,460 meters:

\[
E^{-1}(2460)=1+\frac{30}{140}
\]

\[
E^{-1}(2460)\approx1.2143\text{ km}
\]

The rider reaches that elevation approximately 1.214 km along this restricted section.

### Interactive Component: Inverse Trail Explorer

Display a trail elevation graph.

Provide:
- Original function.
- Domain restriction control.
- Horizontal line test.
- Inverse relationship visualization.

Allow students to select a steadily increasing or decreasing section of the trail.

Show the resulting one-to-one domain.

The student should be able to observe how restricting the original function creates an inverse function.

Where practical, display the inverse graph as a reflection across y = x, with clearly swapped input and output labels and an explanation of the different units.

### Important Teaching Distinction

Explain:

\[
f^{-1}(x)\neq\frac{1}{f(x)}
\]

Inverse notation means reversing the function, not calculating its reciprocal.

Test this common misconception with a short challenge.

---

# 8. FINAL MISSION — RIDE SYSTEMS ENGINEER

After completing the four main missions, unlock the final challenge.

Title:

# ENGINEER THE RIDE

"You've learned how to model a trail, analyze a drivetrain, transform mathematical functions, and work backward from outputs.

Now it's time to put those skills together."

Create a multi-part independent assessment.

## Challenge A — Read the Trail

Give the student a new synthetic trail profile.

Include a data table and graph.

Ask:
1. Identify the function's input and output.
2. Evaluate the function at a specified distance.
3. Identify domain and range.
4. Identify an increasing interval.
5. Identify a decreasing interval.

## Challenge B — Build the Drivetrain Function

Give the student:

- Front chainring: 34 teeth.
- Rear sprocket: 17 teeth.
- Wheel circumference: 2.30 meters.
- Cadence: 90 RPM.

Ask:
1. Calculate the gear ratio.
2. Calculate rear-wheel RPM.
3. Build the speed function.
4. Calculate the resulting bike speed.

Work:

\[
R=\frac{34}{17}=2
\]

\[
f(c)=2c
\]

\[
g(w)=0.138w
\]

\[
S(c)=0.276c
\]

\[
S(90)=24.84\text{ km/h}
\]

## Challenge C — Transform the Profile

Give the student an original function h(d).

Ask them to construct:

\[
g(d)=2h(d)+30
\]

They should identify:
- Vertical stretch factor.
- Vertical shift.
- Effect on graph.

## Challenge D — Work Backward

Use:

\[
S(c)=0.276c
\]

Ask:

"What cadence is required to achieve 27.6 km/h?"

Expected answer:

\[
S^{-1}(27.6)=100\text{ RPM}
\]

Ask the student to explain why this function can be inverted within the given domain.

## Completion Screen

Display:

# RIDE SYSTEMS ENGINEER

"Congratulations! You've successfully analyzed a mountain bike's trail profile, explored drivetrain relationships, transformed mathematical models, and worked backward through inverse functions."

Show:
- Missions completed.
- Skills practiced.
- Questions answered.
- Independent challenge performance.
- Areas that may need further practice.

Record the activity's completion and student attempts.

---

# 9. OPTIONAL EXTENSION — THE FUNCTION MIXER

Create an optional exploration mode for students who finish early or want additional practice.

Title:

**Combine the Ride Data**

Use a pair of functions:

- f(d): Natural ground elevation.
- b(d): Height of a raised trail structure above the natural ground.

The complete riding surface can be modeled as:

\[
T(d)=f(d)+b(d)
\]

Display a trail profile and an elevated boardwalk crossing.

Allow students to change the structure height and see the combined function update.

Include additional optional examples of:
- Adding functions.
- Subtracting functions.
- Multiplying by a constant.
- Dividing functions where the denominator is nonzero.

Explain that the domain of the resulting function must account for the domains of both original functions, particularly when division is involved.

Do not let this extension distract from the four primary missions.

---

# 10. VISUAL DESIGN AND USER EXPERIENCE

## Design Direction

The experience should feel like a combination of:

- Professional mountain bike performance software.
- Trail mapping technology.
- Interactive drivetrain engineering.
- A modern educational simulation.

Use the existing Mathlete MTB brand identity.

Create a consistent visual environment across the four missions.

Visual elements should include:

- Detailed drivetrain imagery.
- Animated bike components.
- Trail elevation profiles.
- GPS telemetry.
- Digital performance displays.
- Interactive graph overlays.
- Transformation controls.
- Mission progress displays.

Avoid making the interface look like a conventional online textbook.

## Navigation

Persistent navigation:
- Mathlete MTB logo.
- Back to Algebra 2.
- Ride Systems Lab.
- Overall progress.
- Exit option.

Mission navigation:
- Read the Trail.
- The Gearbox Lab.
- Transform the Trail.
- Reverse the Ride.

Show a breadcrumb:

Classes → Algebra 2 → Functions → Ride Systems Lab.

## Graphing Requirements

Graphs must be accurate and interactive.

Students should be able to:
- Select points.
- Read coordinates.
- Observe input-output relationships.
- Compare original and transformed functions.
- Identify important graph features.
- Use horizontal and vertical line tests.

Use consistent colors for inputs, outputs, original functions, and transformed functions.

Always display units.

## Responsive Design

Support desktop, tablet, and mobile.

The drivetrain visualization should remain visually understandable on smaller screens.

Use vertically stacked controls when necessary.

All primary controls should support touch and keyboard interaction.

---

# 11. MATHEMATICAL ENGINE AND VALIDATION

All calculations must be performed through a consistent calculation layer.

The graph, visualizations, function displays, and assessments must use the same underlying data.

## Drivetrain Formula

Let:

- c = crank cadence in RPM.
- F = front chainring teeth.
- R = rear sprocket teeth.
- C = measured wheel circumference in meters.

Gear ratio:

\[
G=\frac{F}{R}
\]

Wheel RPM:

\[
W(c)=Gc
\]

Speed in km/h:

\[
V(W)=\frac{60C}{1000}W
\]

Composite speed function:

\[
S(c)=\frac{60CG}{1000}c
\]

For the primary example:

\[
F=32,\ R=16,\ C=2.30
\]

\[
S(c)=0.276c
\]

The 2.30-meter circumference is an illustrative measured value, not a universal assumption for mountain bike wheels.

## Trail Profile Data

Store the fictional trail data in a reusable data object.

Do not hardcode sample coordinates separately across components.

Use piecewise-linear interpolation between GPS samples.

Make clear that the profile is simulated and not actual surveyed trail data.

## Transformation Engine

Support:
- Vertical shifts.
- Horizontal shifts.
- Vertical scaling.
- Horizontal scaling.
- Reflections.

Preserve the original function and calculate each transformation dynamically.

Ensure the transformed domain is updated where appropriate.

## Inverse Engine

Support:
- Function inversion.
- Domain restriction.
- Inverse evaluation.
- Input-output reversal.
- One-to-one validation.
- Horizontal line test visualization.

Do not generate an inverse function if the original function is not one-to-one over the specified domain.

## Input Validation

- Cadence must be positive and within the simulation's configured range.
- Chainring and sprocket selections must be positive valid tooth counts.
- Wheel circumference must be positive.
- Trail distance must remain within the defined route.
- Inverse function inputs must lie within the inverse domain.
- Transformation inputs must be handled without undefined graph states.

---

# 12. QUESTION AND FEEDBACK ENGINE

Integrate the shared Mathlete MTB question and feedback architecture.

Use:
- Multiple choice.
- Numerical input.
- Graph identification.
- Function evaluation.
- Matching.
- Short written explanations.

Every question must connect to an associated mathematical skill.

## Progressive Hints

**Hint 1 — Concept**

Help the student recall the relevant relationship.

**Hint 2 — Method**

Identify what function, equation, or graph feature to use.

**Hint 3 — Guided Support**

Show the next logical mathematical step.

**Solution**

Display the complete calculation and explain what the answer means in the mountain biking scenario.

## Common Misconceptions to Track

Function basics:
- Confusing input and output.
- Treating function notation as multiplication.
- Misidentifying domain and range.
- Assuming every relation is a function.

Composition:
- Reversing the order of functions.
- Using an output with the wrong units.
- Treating composition as addition.

Transformations:
- Confusing vertical and horizontal shifts.
- Misinterpreting f(x + k) and f(x - k).
- Confusing horizontal stretches and compressions.
- Ignoring changes in domain.

Inverse functions:
- Confusing inverses with reciprocals.
- Assuming every function has an inverse.
- Forgetting to restrict the domain.
- Forgetting that domain and range swap.

Provide meaningful feedback and allow students to retry questions.

---

# 13. STUDENT PROGRESS INTEGRATION

Reuse the existing Mathlete MTB activity and progress infrastructure.

Track performance against these skills:

1. Function notation.
2. Evaluating functions.
3. Domain and range.
4. Graph interpretation.
5. Function composition.
6. Composition order.
7. Function transformations.
8. Horizontal transformations.
9. Vertical transformations.
10. Inverse functions.
11. One-to-one functions.
12. Domain restrictions.

Record:
- Activity start.
- Mission starts.
- Attempts.
- Correct answers.
- Incorrect answers.
- Hints requested.
- Completion.
- Independent challenge performance.
- Time spent.

Distinguish between activity completion and actual skill mastery.

Do not automatically mark a skill mastered simply because a student completed the lesson.

---

# 14. TECHNICAL ARCHITECTURE

Suggested reusable components:

**RideSystemsDashboard**
- Opening screen.
- Mission board.
- Progress.

**TrailExplorer**
- GPS dataset.
- Elevation graph.
- Input-output explorer.
- Domain and range visualization.

**DrivetrainSimulator**
- Chainring.
- Cassette.
- Chain animation.
- Cadence control.
- Wheel RPM.
- Speed calculator.

**FunctionComposer**
- Function pipeline.
- Input-output connections.
- Composite equation.
- Composition evaluation.

**TrailTransformationStudio**
- Original graph.
- Transformed graph.
- Transformation controls.
- Mathematical equation display.

**InverseExplorer**
- Forward function.
- Inverse function.
- Horizontal line test.
- Domain restriction.
- Input-output reversal.

**ChallengeEngine**
- Questions.
- Scoring.
- Feedback.
- Hints.
- Progression.

**ProgressTracker**
- Attempts.
- Performance.
- Curriculum skill associations.

These components are suggestions and should be adapted to existing Mathlete MTB architecture.

Do not introduce unnecessary dependencies or duplicate existing functionality.

Keep the mathematical logic separate from the visual rendering and question engine.

---

# 15. RESEARCH AND EDUCATIONAL REFERENCES

Use these materials to guide curriculum alignment and mathematical implementation.

**Official curriculum standards**

1. Common Core — Interpreting Functions:
https://www.thecorestandards.org/Math/Content/HSF/IF/

2. Common Core — Building Functions:
https://www.thecorestandards.org/Math/Content/HSF/BF/

3. College Board — Pre-AP Algebra 2, Unit 2: The Algebra of Functions:
https://pre-ap.collegeboard.org/media/pdf/Algebra-2-Units-3-and-4T.pdf

**Mathematical instructional references**

4. OpenStax — Functions and Function Notation:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-1-functions-and-function-notation

5. OpenStax — Domain and Range:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-2-domain-and-range

6. OpenStax — Composition of Functions:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-4-composition-of-functions

7. OpenStax — Transformation of Functions:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-5-transformation-of-functions

8. OpenStax — Inverse Functions:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/3-7-inverse-functions

9. Khan Academy — Algebra 2 Functions:
https://www.khanacademy.org/math/algebra2/alg-functions

**Mountain biking technical references**

10. Cycling UK — How Do You Measure Gears on a Bike?
https://www.cyclinguk.org/cycle-magazine/how-do-you-measure-gears-bike

11. Wahoo Fitness — Tire Size and Wheel Circumference:
https://support.wahoofitness.com/hc/en-us/articles/26243161988882-Tire-Size-Wheel-Circumference-Chart

Use the sources as references for instructional content and technical accuracy.

Create original educational explanations, scenarios, graphics, equations, and assessment problems.

---

# 16. IMPLEMENTATION PRIORITIES

Before developing:

1. Read the Mathlete MTB Lab Development Framework.
2. Audit the existing Classes and Algebra 2 curriculum.
3. Review the completed Race-Day Workshop and Jump Lab.
4. Inspect existing interactive graphs, sliders, simulations, and progress tracking.
5. Identify components that can be reused.
6. Confirm the curriculum IDs and activity routing.

Then implement in the following sequence:

**Phase 1: Ride Systems Lab introduction and mission dashboard.**

**Phase 2: Read the Trail — function notation, evaluation, domain, range, and graph interpretation.**

**Phase 3: The Gearbox Lab — function composition and drivetrain simulation.**

**Phase 4: Transform the Trail — interactive function transformations.**

**Phase 5: Reverse the Ride — inverse functions and domain restrictions.**

**Phase 6: Final Ride Systems Engineer challenge.**

**Phase 7: Optional function operations extension.**

**Phase 8: Progress integration, accessibility, responsiveness, and testing.**

Implement a functional end-to-end experience.

Do not stop at static visual mockups.

Test the mathematics independently from the interface.

Use a single authoritative source for each function's calculations.

---

# 17. ACCEPTANCE CRITERIA

- [ ] Lesson is integrated into Algebra 2 → Functions.
- [ ] Opening mission dashboard works.
- [ ] Trail elevation function is interactive.
- [ ] Students can evaluate functions using notation.
- [ ] Domain and range are correctly represented.
- [ ] Graph behavior is explained.
- [ ] Drivetrain simulator works.
- [ ] Function composition produces correct results.
- [ ] Changes in cadence and gearing update speed correctly.
- [ ] Composite function is mathematically correct.
- [ ] Transformation controls work.
- [ ] Original and transformed functions display accurately.
- [ ] Inverse function calculations work.
- [ ] Horizontal line test is implemented.
- [ ] Students can restrict a domain and construct an inverse.
- [ ] Final assessment evaluates all primary concepts.
- [ ] Feedback and hints work.
- [ ] Student progress integrates with existing infrastructure.
- [ ] Responsive layouts work.
- [ ] Keyboard accessibility is supported.
- [ ] Featured Tools and existing learning resources remain functional.

---

# FINAL PRODUCT PRINCIPLE

The Ride Systems Lab should establish that functions are not just abstract equations.

They are mathematical models of relationships.

A rider's cadence produces wheel rotation. Wheel rotation produces speed. Distance along a trail determines elevation. An inverse function allows us to work backward from the result.

The student should finish thinking:

"I didn't realize how many different ways functions describe the sport I love."

**Build an experience that makes Algebra 2 feel like mountain bike engineering.**