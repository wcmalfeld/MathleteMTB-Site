# PRODUCT REQUIREMENTS DOCUMENT
# MAP THE LINE — THE MTB RIDE DATA LAB
## Algebra 1 · Unit 3: Linear Relationships

**Platform:** Mathlete MTB  
**Product:** Interactive Educational Lab  
**Lab title:** Map the Line  
**Subtitle:** Read the terrain. Plot the ride. Understand the data.  
**Course:** Algebra 1  
**Unit:** Unit 3 — Linear Relationships  
**Target audience:** Middle school and high school Algebra 1 students  
**Estimated completion:** 40–55 minutes  
**Experience type:** Interactive MTB trail mapping, elevation analysis and ride telemetry simulator  
**Existing related lab:** `/learning-lab/slope-lab/`

---

# PART I — PRODUCT VISION

## 1. The concept

The student becomes a professional MTB trail mapper and ride data analyst.

They have been hired to map and analyze an exciting mountain bike trail network, inspired by some of the world's most iconic mountain biking destinations.

Their mission is to:
- Scout a mountain using coordinate maps.
- Identify trail features and plot their locations.
- Create elevation profiles using ordered pairs.
- Calculate trail gradients and rates of change.
- Understand positive, negative, zero and undefined slopes.
- Analyze rider speed and elevation data.
- Recognize linear and proportional relationships.
- Build a final ride analysis report.

The experience should draw inspiration from:
- Whistler Mountain Bike Park.
- UCI downhill World Cup courses.
- Freeride and slopestyle trail networks.
- Pump tracks.
- GPS mapping and MTB telemetry.

The central educational idea:

**Mountain biking produces data everywhere. Maps, elevation profiles, speed readings and trail gradients are all ways of representing mathematical relationships.**

The student learns to understand and use that data.

## 2. Important implementation decision: extend the existing Slope Lab

The existing Mathlete MTB course pages advertise a Slope & Linear Relationships Lab at:

`/learning-lab/slope-lab/`

It already includes a Trail Designer, slope calculations, graphing, tables, `y = mx + b`, three practice levels and transfer challenges.

Before building anything, inspect that existing lab thoroughly.

The goal is to create a cohesive Unit 3 learning experience that includes all six subtopics, not a competing second slope lab.

Recommended approach:

- Reuse the existing Trail Designer where appropriate.
- Preserve useful existing slope activities.
- Expand the application to include coordinate-plane exploration, ordered-pair graphing and proportional relationships.
- Improve integration between the six topics.
- Preserve existing routes, progress, authentication and member functionality.
- Avoid duplicating existing components or educational material.

The final product should feel like one complete, interconnected educational lab.

## 3. Educational objectives

The lab must teach all six Algebra 1 topics.

### A. Coordinate Plane
- Identify x-axis, y-axis and origin.
- Understand the four quadrants.
- Read the coordinates of a point.
- Interpret graphs with different axis scales.

### B. Graphing Ordered Pairs
- Plot ordered pairs.
- Graph tables of values.
- Read coordinates from graphs.
- Describe patterns in plotted points.

### C. Slope and Rate of Change
- Understand slope as rise over run.
- Calculate slope using two points.
- Interpret positive and negative slope.
- Connect slope to mountain bike trail grade.

### D. Positive and Negative Slope
- Identify positive slope.
- Identify negative slope.
- Identify zero slope.
- Understand why vertical lines have undefined slope.
- Relate each type of slope to trail profiles.

### E. Linear Relationships
- Recognize constant rates of change.
- Determine whether a table represents a linear relationship.
- Connect tables, graphs, equations and written descriptions.
- Understand slope as a constant rate of change.

### F. Proportional Relationships
- Understand relationships of the form `y = kx`.
- Calculate the constant of proportionality.
- Determine whether a relationship is proportional.
- Understand why proportional relationships pass through the origin.
- Write and use proportional equations.

---

# PART II — THE MAIN EXPERIENCE

## 4. Opening screen

### Headline

# MAP THE LINE

**Read the terrain. Plot the ride. Understand the data.**

### Introduction

"Every great mountain bike ride tells a story.

A trail map shows where you're going. An elevation profile reveals the climbs and descents. Speed and distance data tell you how you're riding.

You've been hired as a mountain bike ride analyst. Your mission is to map a new riding network, investigate its terrain and understand what the data reveals.

Grab your map, fire up the GPS and let's find the line."

Primary CTA:

`START EXPLORING`

## 5. Overall experience design

Create six connected stages.

| Stage | Environment | Learning objective |
|---|---|---|
| 01 | Scout the Mountain | Coordinate Plane |
| 02 | Plot Your Line | Graphing Ordered Pairs |
| 03 | Measure the Grade | Slope and Rate of Change |
| 04 | Read the Terrain | Positive and Negative Slope |
| 05 | Analyze Rider Data | Linear Relationships |
| 06 | Find Your Flow | Proportional Relationships |

The student progresses through one connected trail-mapping mission.

Each stage should have:
- A unique visual environment.
- An introduction explaining the mission.
- Interactive activities.
- Guided instruction.
- Independent challenges.
- Progressive hints.
- Feedback.
- Stage completion and rewards.

Allow completed stages to be revisited.

Do not introduce arbitrary time limits or speed-based scoring that compromises understanding.

## 6. The three primary visualization environments

The entire lab should be built around three interconnected visual tools.

### A. The Mountain Map

An overhead, illustrated topographic map containing:
- Trailhead.
- Trail network.
- Jump features.
- Berms.
- Rock gardens.
- Pump track.
- Viewpoints.
- Workshop.
- Finish area.

Overlay an interactive coordinate grid.

This is the primary learning environment for coordinate planes and ordered pairs.

### B. The Trail Profile

A side-view elevation profile showing:
- Horizontal distance.
- Elevation.
- Uphill sections.
- Downhill sections.
- Flat sections.
- Trail landmarks.

This is the primary learning environment for slope and rate of change.

### C. The Ride Data Dashboard

A modern MTB GPS/telemetry interface showing:
- Elapsed time.
- Distance traveled.
- Average speed.
- Elevation.
- Trail progress.
- Data tables.
- Graphs.
- Mathematical relationships.

This is the primary learning environment for linear and proportional relationships.

The three views should connect to each other.

When a student selects a feature on the map, highlight the corresponding point on the trail profile where appropriate.

When a student selects a portion of the profile, highlight the corresponding trail section on the map.

Do not create three separate applications.

---

# PART III — STAGE IMPLEMENTATION

# STAGE 01: SCOUT THE MOUNTAIN
## Coordinate Plane

### 7. Mission

The student becomes a professional trail mapper.

They have received a topographic map of a new mountain bike destination. Their task is to identify the location of different trail features and understand how the coordinate system organizes the mountain.

### Activity 1 — Explore the Coordinate System

Introduce an overhead mountain map with an interactive Cartesian grid.

The student should be able to see:
- Horizontal x-axis.
- Vertical y-axis.
- Origin `(0,0)`.
- Four quadrants.
- Positive and negative coordinates.

Make the origin the central trailhead or mountain hub.

Introduce the quadrants through park locations.

| Location | Coordinates | Quadrant |
|---|---|---|
| Tabletop jump zone | (3, 2) | I |
| Northern overlook | (-4, 3) | II |
| Pump track | (-3, -2) | III |
| Workshop | (4, -3) | IV |
| Main trailhead | (0, 0) | Origin |

These are illustrative map coordinates, not actual geographical coordinates.

Students should be able to click each feature to see its coordinates.

### Activity 2 — The Four Quadrant Challenge

Explain the coordinate signs:

| Quadrant | x | y |
|---|---|---|
| I | Positive | Positive |
| II | Negative | Positive |
| III | Negative | Negative |
| IV | Positive | Negative |

Create an interactive challenge.

Present a feature location such as:

`(-3, 4)`

Ask:

"Where is this feature relative to the origin?"

The student selects:
- Left or right.
- Up or down.
- Correct quadrant.

Animate the point moving onto the map.

Reverse the activity by highlighting a feature and asking the student to identify its coordinates.

Include points lying directly on the axes and at the origin.

Teach that points on the axes are not members of any quadrant.

### Activity 3 — GPS Coordinate Finder

Display a set of MTB locations.

The student must read and identify their ordered pairs.

Include:
- Trailhead.
- Jump line.
- Berm section.
- Rock garden.
- Viewpoint.
- Pump track.
- Finish area.

Make the student identify x first and y second.

Include distractors that reverse the coordinate order.

### Activity 4 — Different Map Scales

This activity is essential because students must learn to read graphs whose axes use different scales.

Show a map where:
- Each horizontal grid interval represents 20 meters.
- Each vertical grid interval represents 5 meters.

A feature located three horizontal intervals right and two vertical intervals up has coordinates:

`(60, 10)`

Students should understand that they must read each axis according to its own scale.

Include:
- Different tick intervals.
- Positive and negative values.
- Axis labels.
- Scale indicators.
- Coordinate reading challenges.

Do not assume that one grid interval represents the same physical distance on both axes.

### Activity 5 — Scout the Mountain Challenge

Present an unfinished topographic map.

Ask the student to place four different park features in their correct locations using provided ordered pairs.

Then ask them to identify the quadrant containing each feature.

The final challenge should combine:
- Map interpretation.
- Coordinate identification.
- Different axis scales.
- Quadrant knowledge.

### Stage completion

Award:

`TRAIL SCOUT` badge.

---

# STAGE 02: PLOT YOUR LINE
## Graphing Ordered Pairs

### 8. Mission

The student has collected GPS and elevation readings from a fictional mountain bike ride.

Their job is to plot the data and reconstruct the route's elevation profile.

Introduce a dedicated graphing interface.

### Activity 1 — From GPS Readings to a Map

Give the student a table of trail landmarks.

| Feature | x | y |
|---|---:|---:|
| Trailhead | 0 | 0 |
| Berm | 2 | 3 |
| Tabletop | 4 | 5 |
| Rock Garden | 6 | 2 |
| Finish | 8 | -1 |

The student must plot each coordinate.

Use interactive point placement:
- Click an empty location on the coordinate plane.
- Or enter the coordinate directly.
- The point snaps to the appropriate grid intersection.

Once correct, show the relevant trail feature at that location.

### Activity 2 — Build the Elevation Profile

Introduce a different graph.

For this graph:
- x represents horizontal distance from the beginning of the route, in meters.
- y represents elevation above sea level, in meters.

Use the following fictional trail dataset:

| Horizontal distance (m) | Elevation (m) |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1210 |
| 300 | 1215 |
| 400 | 1215 |
| 500 | 1210 |
| 600 | 1205 |

The student must plot each ordered pair:

`(0,1200)`, `(100,1205)`, `(200,1210)`, `(300,1215)`, `(400,1215)`, `(500,1210)`, `(600,1205)`.

Connect the points to reveal the trail profile.

Visually highlight:
- Climb.
- Flat section.
- Descent.

**Important:** Explicitly label this as a fictional educational trail profile.

### Activity 3 — Read the Graph

Display a completed graph.

Ask the student:
- What is the elevation at 200 meters?
- At what distance does the highest point occur?
- Where does the flat section begin?
- Where does the descent begin?
- What is the finishing elevation?
- How far along the route is the highest point?

Students should click the graph and read coordinates.

### Activity 4 — Describe the Pattern

Give students tables with different patterns.

Example A:

| x | y |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1210 |
| 300 | 1215 |

Example B:

| x | y |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1211 |
| 300 | 1215 |

Ask students what patterns they observe.

Do not fully teach slope or linearity in this stage. Introduce the idea of observing how quantities change, then develop it in subsequent stages.

### Activity 5 — Reconstruct the Missing Waypoint

Remove one point from a plotted trail profile.

Give the student a table with an incomplete value.

They must read the neighboring information or use the supplied graph to identify the missing coordinate.

This teaches relationships between tables and graphs without jumping ahead to formal slope calculations.

### Stage completion

Award:

`GPS MAPPER` badge.

---

# STAGE 03: MEASURE THE GRADE
## Slope and Rate of Change

### 9. Mission

The student is now the technical trail analyst.

They must measure how steep different sections of the mountain are and determine how much elevation changes for every unit of horizontal distance.

This stage should be highly visual and interactive.

### Activity 1 — What Is Slope?

Show a side-view trail profile.

Highlight two points.

Explain:

**Slope tells us how much one quantity changes for each unit of change in another quantity.**

Formula:

`m = (y2 - y1) / (x2 - x1)`

Explain:
- Change in y = rise.
- Change in x = run.
- Slope = rise divided by run.

Use the same coordinate system throughout this stage:
- x = horizontal distance.
- y = elevation.

### Activity 2 — Calculate an Uphill Grade

Use the fictional trail dataset.

Start:

`(0, 1200)`

Finish:

`(300, 1215)`

The student calculates:

`m = (1215 - 1200) / (300 - 0)`

`m = 15 / 300`

`m = 0.05`

Convert to percentage grade:

`0.05 × 100 = 5%`

Interpretation:

For every 100 meters of horizontal distance, elevation increases by 5 meters on this constant-grade section.

Create a visual showing:
- 15 meters of rise.
- 300 meters of horizontal run.
- A clearly highlighted slope triangle.
- The resulting grade.

### Activity 3 — Calculate a Downhill Grade

Use:

`(400, 1215)`

and:

`(600, 1205)`

Calculate:

`m = (1205 - 1215) / (600 - 400)`

`m = -10 / 200`

`m = -0.05`

The signed slope is -0.05, or -5%.

Explain that the negative sign represents decreasing elevation as horizontal distance increases.

When describing trail steepness as a grade magnitude, people may report 5% downhill. Keep the distinction between signed mathematical slope and unsigned steepness explicit.

### Activity 4 — The Rise Over Run Visualizer

This should be a signature interaction in the lab.

Create an interactive triangle connecting two plotted points.

Students can:
- Drag either point.
- Adjust the elevation change.
- Adjust horizontal distance.
- Observe rise and run update.
- Watch the slope calculation update.
- See the percentage grade.

Display all calculations live.

Use a prediction-first prompt:

"If the elevation increases by 10 meters but the horizontal distance doubles, what happens to the slope?"

Allow the student to predict before showing the calculation.

### Activity 5 — Calculate Slope From Different Representations

Present:
- Two plotted points.
- A table.
- A graph.
- A written trail scenario.

The student calculates the same slope using different representations.

Example table:

| Distance | Elevation |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |

Slope:

`(1205 - 1200) / (100 - 0) = 0.05`

Give additional problems at increasing difficulty.

### Activity 6 — Real-World Grade Challenge

Use a hypothetical trail connector.

It rises 12 meters over a horizontal run of 240 meters.

Find the grade.

`m = 12 / 240 = 0.05`

Answer: 5%.

Then ask:

"What would the slope be if the same elevation change occurred over only 120 meters?"

Answer:

`12 / 120 = 0.10 = 10%`

Explain that the same elevation gain over a shorter horizontal distance creates a steeper slope.

These are educational calculations, not professional trail-building standards.

### Stage completion

Award:

`GRADE ANALYST` badge.

---

# STAGE 04: READ THE TERRAIN
## Positive and Negative Slope

### 10. Mission

The student becomes a terrain analyst.

Their task is to inspect different trail profiles and classify the direction of each line.

Create a four-part interactive experience.

### Activity 1 — Positive Slope

Show a line rising from left to right.

MTB context:
- Climbing fire road.
- Uphill connector.
- Rising trail profile.

Explain:

When elevation increases as horizontal distance increases, slope is positive.

Example:

`(0, 1200)` to `(100, 1205)`

`m = 5 / 100 = 0.05`

Answer: Positive slope.

### Activity 2 — Negative Slope

Show a line falling from left to right.

MTB context:
- Downhill section.
- Descent.
- Falling elevation profile.

Example:

`(100, 1210)` to `(200, 1205)`

`m = -5 / 100 = -0.05`

Answer: Negative slope.

### Activity 3 — Zero Slope

Show a horizontal line.

MTB context:
- Flat connector.
- Level trail segment.
- Flat portion of a route.

Example:

`(200, 1210)` to `(300, 1210)`

`m = 0 / 100 = 0`

Answer: Zero slope.

### Activity 4 — Undefined Slope

Show a vertical line on the coordinate plane.

The x-coordinate remains the same while y changes.

Example:

`(200, 1210)` to `(200, 1220)`

The denominator becomes:

`200 - 200 = 0`

Slope would require division by zero, so it is undefined.

Make this visually distinct.

Explain that an undefined mathematical slope describes a vertical line on a graph. It must not be interpreted as a recommendation or representation of an actual rideable vertical trail.

### Activity 5 — Classify the Trail

Give students a sequence of trail profile images and graphs.

They must select:
- Positive.
- Negative.
- Zero.
- Undefined.

Include examples where the line is steep or shallow to reinforce that direction determines the sign, not the steepness.

### Activity 6 — Can You Explain It?

Ask students to explain:

"Why does the elevation profile of a descending trail have negative slope when distance increases from left to right?"

Provide a sample explanation and short-answer feedback.

### Stage completion

Award:

`TERRAIN READER` badge.

---

# STAGE 05: ANALYZE RIDER DATA
## Linear Relationships

### 11. Mission

The student becomes a mountain bike performance analyst.

They've collected GPS readings and telemetry from different riding sessions.

Their job is to determine whether the data shows a constant rate of change and identify the mathematical relationships.

Use a premium MTB telemetry dashboard.

### Activity 1 — What Makes a Relationship Linear?

Introduce a simplified fire-road climb.

The rider starts at an elevation of 1,200 meters and gains 5 meters for every 100 meters of horizontal distance.

Present:

| Horizontal distance (m) | Elevation (m) |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1210 |
| 300 | 1215 |

Ask:

"What happens to elevation every time horizontal distance increases by 100 meters?"

Answer: It increases by 5 meters.

Explain that the rate of change is constant.

Therefore, the relationship is linear.

### Activity 2 — Find the Constant Rate of Change

For equal horizontal distance intervals, calculate the changes in elevation.

`+5, +5, +5`

The first differences are constant.

Introduce:

`m = change in y / change in x`

`m = 5 / 100 = 0.05`

Build the graph.

Then introduce the equation:

`y = 1200 + 0.05x`

Where:
- x = horizontal distance.
- y = elevation.

Explain that the starting elevation is 1,200 meters and the rate of change is 0.05 meters per horizontal meter.

### Activity 3 — Linear or Not Linear?

Create an interactive challenge with several tables.

**Example A — Constant grade climb**

| x | y |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1210 |
| 300 | 1215 |

Differences: +5, +5, +5.

Linear.

**Example B — Changing grade**

| x | y |
|---:|---:|
| 0 | 1200 |
| 100 | 1205 |
| 200 | 1211 |
| 300 | 1215 |

Differences: +5, +6, +4.

Not linear.

**Example C — Steady speed**

| Time (min) | Distance (m) |
|---:|---:|
| 0 | 0 |
| 1 | 240 |
| 2 | 480 |
| 3 | 720 |
| 4 | 960 |

Differences: +240, +240, +240, +240.

Linear.

**Example D — Variable pump-track speed**

| Time (min) | Distance (m) |
|---:|---:|
| 0 | 0 |
| 1 | 160 |
| 2 | 380 |
| 3 | 530 |
| 4 | 790 |

Differences: +160, +220, +150, +260.

Not linear.

Make the student classify each relationship and explain why.

**Important teaching point:** Check first differences only when x-values are equally spaced. For unequal x-intervals, students should compare the rate of change between points instead.

### Activity 4 — Connect Words, Tables, Graphs and Equations

Present one constant-rate MTB scenario in four different representations.

**Words:**

A rider travels 240 meters every minute at a constant speed, starting at zero distance.

**Table:**

| Time (min) | Distance (m) |
|---:|---:|
| 0 | 0 |
| 1 | 240 |
| 2 | 480 |
| 3 | 720 |

**Graph:**

A straight line through the origin.

**Equation:**

`d = 240t`

Students must match the correct representations.

Then reverse the interaction:
- Show a graph and ask for its table.
- Show a table and ask for its equation.
- Show an equation and ask for a written description.

### Activity 5 — The Trail Profile Designer

Allow students to construct a fictional trail profile.

They select:
- Starting elevation.
- Horizontal distance.
- Elevation change.

The application generates the corresponding graph.

Then ask:

"Does this section have a constant rate of change?"

Allow students to adjust the points and watch what happens to the linearity of the graph.

Keep the distinction between an ideal constant-grade segment and a real trail with changing terrain.

### Stage completion

Award:

`RIDE DATA ANALYST` badge.

---

# STAGE 06: FIND YOUR FLOW
## Proportional Relationships

### 12. Mission

The student is now analyzing rider performance.

They need to understand how quantities relate when one grows at a constant ratio to another.

This stage should use distance, time and steady riding pace as the central MTB connection.

### Activity 1 — The Constant Pace Challenge

Introduce a rider traveling at a constant speed.

The rider travels 240 meters per minute.

Use:

`d = 240t`

Where:
- d = distance in meters.
- t = elapsed time in minutes.
- 240 = constant of proportionality.

Display:

| Time (min) | Distance (m) |
|---:|---:|
| 0 | 0 |
| 1 | 240 |
| 2 | 480 |
| 3 | 720 |
| 4 | 960 |

Ask:

"What is the relationship between time and distance?"

The student should identify:

`d = 240t`

### Activity 2 — Find the Constant of Proportionality

Introduce:

`y = kx`

Explain that k is the constant of proportionality.

Using the MTB example:

`d = 240t`

Therefore:

`k = 240`

Its units are meters per minute.

Require students to calculate k using a table.

For example:

`k = y / x`

`k = 480 / 2`

`k = 240`

Include multiple examples and ask students to verify that the ratio remains constant.

### Activity 3 — Does It Pass Through the Origin?

Display several graphs.

Some lines pass through `(0,0)` and others do not.

Students must decide which relationships are proportional.

Explain:

A proportional relationship:
- Has the form `y = kx`.
- Has a constant ratio `y/x` for nonzero x.
- Has a graph that passes through the origin.
- Starts at zero when the input quantity is zero.

A relationship can be linear without being proportional.

### Activity 4 — Linear vs Proportional

This is an essential conceptual challenge.

Compare two MTB relationships.

**Relationship A: Constant rider speed**

`d = 240t`

Distance starts at zero.

The graph passes through the origin.

This is proportional.

**Relationship B: Elevation along a steady-grade trail**

`e = 1200 + 0.05x`

Where:
- x = horizontal distance in meters.
- e = elevation in meters.

The rider starts at 1,200 meters above sea level.

The rate of elevation gain is constant, so the relationship is linear.

However, it does not pass through the origin.

It is not proportional.

Explain the difference clearly:

**All proportional relationships are linear, but not all linear relationships are proportional.**

Create an interactive comparison showing:
- Graph A passes through the origin.
- Graph B has a nonzero y-intercept.

### Activity 5 — Write Your Own Proportional Equation

Give students new scenarios.

Example:

A rider travels at a constant 180 meters per minute.

Write:

`d = 180t`

Calculate the distance after:
- 1 minute.
- 2 minutes.
- 5 minutes.

Answers:
- 180 m.
- 360 m.
- 900 m.

Then reverse the challenge.

Given a table of values, calculate k and construct the equation.

### Activity 6 — The Flow Challenge

Create a final comparison involving multiple riders.

Show three hypothetical rider profiles:

| Rider | Time (min) | Distance (m) |
|---|---:|---:|
| A | 1 | 200 |
| A | 2 | 400 |
| A | 3 | 600 |
| B | 1 | 240 |
| B | 2 | 480 |
| B | 3 | 720 |
| C | 1 | 180 |
| C | 2 | 390 |
| C | 3 | 630 |

Ask:
- Which rider has a proportional relationship between time and distance?
- What is each rider's constant speed?
- Which rider's data does not maintain a constant ratio?
- Which rider has the greatest rate of change?

Interpretation:
- Rider A: proportional, k = 200 m/min.
- Rider B: proportional, k = 240 m/min.
- Rider C: not proportional because the ratio changes.

These are fictional controlled data examples, not real rider performance records.

### Stage completion

Award:

`FLOW MASTER` badge.

---

# PART IV — FINAL PROJECT

## 13. The Ultimate Ride Analysis Challenge

After completing all six stages, give students a final project.

They have been commissioned to map and analyze a new MTB trail network.

The project requires them to create a complete ride analysis report.

### Task 1 — Map the trail network

Give the student a blank coordinate plane with the origin at the trailhead.

Ask them to plot:
- Trailhead.
- Jump zone.
- Berm section.
- Viewpoint.
- Pump track.
- Finish location.

Require use of all four quadrants where appropriate.

### Task 2 — Create an elevation profile

Give the student a set of ordered pairs showing distance and elevation.

Require them to graph each point and connect the trail profile.

### Task 3 — Calculate trail gradients

Select three trail sections.

Require calculation of:
- Positive slope.
- Negative slope.
- Zero slope.

Provide a separate mathematical vertical-line example for undefined slope.

### Task 4 — Identify linear relationships

Give students tables from different ride scenarios.

They must:
- Identify which relationships are linear.
- Calculate rates of change.
- Match tables to graphs.
- Write equations.
- Explain the meaning of slope and intercept.

### Task 5 — Identify proportional relationships

Provide:
- A constant-speed rider dataset.
- A constant-grade elevation dataset.
- A variable-speed pump-track dataset.

Ask students to identify which are proportional, which are linear but not proportional, and which are not linear.

### Final deliverable

Display a completed **RIDE DATA REPORT**.

Include:
- Park map with plotted waypoints.
- Ordered-pair table.
- Elevation profile.
- Calculated trail slopes.
- Linear relationships.
- Proportionality constant.
- Final interpretation.

Make the finished report visually impressive and clearly tied to the student's work.

---

# PART V — SHARED LEARNING SYSTEMS

## 14. Guided learning

Every stage should follow the same learning sequence:

1. Introduce an MTB situation.
2. Explain the mathematical concept.
3. Demonstrate a worked example.
4. Let the student interact with the visualization.
5. Present guided practice.
6. Provide independent challenges.
7. Show feedback and explanations.
8. Unlock the next level.

Avoid presenting a wall of text.

Use short explanations followed by meaningful interactions.

## 15. Explore Mode

Provide an environment where the student can experiment freely.

Examples:
- Move a point around a map.
- Change axis scales.
- Add waypoints.
- Adjust trail elevation.
- Change horizontal distance.
- Observe how slope changes.
- Change rider speed.
- Watch the distance graph update.

Explore Mode should allow mistakes without penalty.

## 16. Challenge Mode

Use structured questions with:
- Specific learning objectives.
- Increasing difficulty.
- Point-based rewards.
- First-attempt accuracy.
- Progressive hints.
- Meaningful explanations.

Avoid speed-based scoring.

Correct explanations and independent problem-solving should be rewarded.

## 17. Math Workbench

Integrate the existing Mathlete Math Workbench.

### Simple mode

Show:
- Definition.
- Plain-language explanation.
- Relevant formula.
- Explanation of variables.
- Worked example.
- MTB context.

### Advanced mode

Show:
- Mathematical relationship.
- Coordinates.
- Calculations.
- Rate of change.
- Graph interpretation.
- Common mistakes.

The workbench should update dynamically based on the active topic and question.

## 18. Progressive hints

Example for slope:

Problem:

Find the slope between `(0, 1200)` and `(300, 1215)`.

Hint 1:

"Remember that slope describes how much y changes for every unit of change in x."

Hint 2:

"Subtract the y-values to find the vertical change."

Hint 3:

"Subtract the x-values to find the horizontal change."

Reveal:

`m = 15 / 300 = 0.05`

Feedback should teach the underlying concept.

Allow retries without locking students out.

## 19. Tutor Mode

Preserve the existing Mathlete Tutor Mode.

The instructor should be able to:
- Open any of the six stages.
- Select individual activities.
- Enable or disable hints.
- Reveal worked examples.
- Guide graphing interactions.
- Review student calculations.
- Review student explanations.
- Revisit incorrect answers.

Do not create a competing tutoring interface.

## 20. Session summary

Generate a summary that includes:
- Questions attempted.
- Questions correct.
- Accuracy by subtopic.
- Graphing accuracy.
- Slope calculation accuracy.
- Linear versus nonlinear classification.
- Proportionality identification accuracy.
- Hints used.
- Common misconceptions.
- Concepts demonstrated independently.
- Recommended areas to revisit.

Preserve existing Mathlete reporting and student progress functionality.

---

# PART VI — VISUAL DESIGN

## 21. Art direction

The visual experience should look like a high-quality MTB trail mapping and ride analysis platform.

Think:
- Trailforks-style trail maps.
- Professional GPS ride dashboards.
- Downhill course maps.
- Elevation profiles.
- Topographic maps.
- Pump track layouts.
- Trail builder survey tools.

Use these as inspiration, not direct copies of proprietary interfaces.

### Main design elements

**Mountain Map**
- Topographic background.
- Trail routes.
- Feature icons.
- Coordinate grid.
- Trailhead and finish markers.

**Elevation Profile**
- Shaded elevation area.
- Distance axis.
- Elevation axis.
- Trail landmarks.
- Climb and descent highlights.

**Telemetry Dashboard**
- Rider distance.
- Elapsed time.
- Average speed.
- Elevation.
- Data tables.
- Interactive graphs.

**Slope Visualizer**
- Rise/run triangle.
- Two coordinate points.
- Dynamic calculation.
- Percentage grade display.

**Linear Relationship Studio**
- Graph.
- Table.
- Equation.
- Written context.
- Constant-rate indicator.

**Proportionality Explorer**
- Ratio calculator.
- Origin marker.
- Graph comparison.
- Constant of proportionality.

## 22. Image and animation requirements

Use attractive MTB imagery and custom illustrations where possible.

Include:
- Forest downhill trails.
- Slopestyle jump lines.
- Freeride landscapes.
- Pump tracks.
- Trail markers.
- GPS devices.
- Trail profile graphics.

Use lightweight SVG and CSS animations for mathematical interactions.

Examples:
- A point moving onto the coordinate plane.
- A trail profile being drawn.
- A slope triangle appearing.
- A graph line extending.
- A GPS trace being revealed.
- A rider progress marker moving across a trail.

Avoid using heavy 3D environments.

Visualizations should reinforce the learning rather than distract from it.

## 23. Responsive design

Desktop:
- Large graph/map canvas.
- Challenge panel.
- Math Workbench.
- Stage navigation.

Mobile:
- Stack the graph and challenge vertically.
- Use touch-friendly point placement.
- Make the axes and values readable.
- Provide tap-to-plot alternatives.
- Prevent horizontal overflow.
- Keep Math Workbench accessible.

Support keyboard navigation and accessible text labels.

---

# PART VII — TECHNICAL IMPLEMENTATION

## 24. Repository reconnaissance

Before writing code:

1. Inspect the existing `/learning-lab/slope-lab/` implementation.
2. Inspect the Trail Designer and its current capabilities.
3. Review existing graphing and coordinate components.
4. Review the Math Workbench.
5. Review question-bank architecture.
6. Review challenge progression, hints and feedback.
7. Review Tutor Mode.
8. Review session reporting.
9. Review student progress persistence.
10. Review existing course routes and member permissions.

Determine which parts of the existing slope lab can be extended.

Preserve useful existing activities.

Do not replace functioning components without a clear reason.

The final lab should feel like a natural expansion of Mathlete's educational platform.

## 25. Suggested component architecture

Adapt this architecture to the actual repository.

```text
MapTheLine/
│
├── MapTheLineApp
│
├── MountainMap/
│   ├── TopographicMap
│   ├── CoordinateGrid
│   ├── QuadrantVisualizer
│   ├── MapScale
│   ├── Waypoint
│   └── FeatureMarkers
│
├── GraphingStudio/
│   ├── CoordinatePlane
│   ├── OrderedPairPlotter
│   ├── TableOfValues
│   ├── GraphReader
│   └── PatternExplorer
│
├── TrailProfile/
│   ├── ElevationProfile
│   ├── TrailSectionSelector
│   ├── SlopeCalculator
│   ├── RiseRunTriangle
│   └── GradeVisualizer
│
├── SlopeClassification/
│   ├── PositiveSlope
│   ├── NegativeSlope
│   ├── ZeroSlope
│   ├── UndefinedSlope
│   └── SlopeChallenge
│
├── LinearRelationships/
│   ├── LinearDataTable
│   ├── ConstantRateCalculator
│   ├── LinearityChecker
│   ├── EquationBuilder
│   └── RepresentationMatcher
│
├── ProportionalRelationships/
│   ├── ProportionalityCalculator
│   ├── OriginChecker
│   ├── RatioExplorer
│   └── LinearVsProportional
│
├── RideDashboard/
│   ├── RideTelemetry
│   ├── DistanceTimeChart
│   ├── ElevationData
│   └── RideReport
│
└── Shared/
    ├── MathWorkbench
    ├── QuestionEngine
    ├── HintSystem
    ├── FeedbackPanel
    ├── ProgressTracker
    ├── TutorMode
    └── SessionSummary
```

These are proposed component responsibilities, not mandatory filenames.

Reuse existing Mathlete components wherever possible.

## 26. Mathematical calculation system

Use deterministic mathematical calculations.

Do not use JavaScript `eval()` on student-generated mathematical expressions.

Support:
- Ordered-pair coordinates.
- Positive and negative coordinates.
- Different axis scales.
- Slope calculations.
- Percentage grade.
- Constant rates of change.
- Linear equations.
- Proportional equations.
- Ratio calculations.
- Table-to-graph transformations.

For slope:

`m = (y2 - y1) / (x2 - x1)`

Handle:
- Positive values.
- Negative values.
- Zero slope.
- Undefined slope when `x2 - x1 = 0`.

Do not return infinity as a valid numerical slope for a vertical line.

For grade:

`grade percentage = slope × 100`

Only use this conversion when the vertical and horizontal measurements use the same distance units.

For proportional relationships:

`k = y / x`

Ensure x is nonzero when calculating the ratio. Check the complete relationship, including whether it passes through the origin, rather than testing only one pair.

## 27. Graphing engine

Use the existing graphing solution where possible.

The graphing engine must support:
- Four quadrants.
- Positive and negative coordinates.
- Variable axis scales.
- Custom tick intervals.
- Ordered-pair plotting.
- Point selection.
- Tables of values.
- Connected data points.
- Straight-line graphs.
- Elevation profiles.
- Line comparison.
- Graph interpretation.

Make the graph accessible and responsive.

Ensure the displayed grid scaling never changes the actual numerical result of a calculation.

The mathematical slope must use coordinate values, not pixel distance.

## 28. Question bank architecture

Keep educational content separate from UI components.

Every question should support:
- Unique ID.
- Stage.
- Learning objective.
- Difficulty.
- MTB scenario.
- Question prompt.
- Coordinate or data table where applicable.
- Correct answer.
- Accepted input formats.
- Worked solution.
- Progressive hints.
- Misconception tags.
- Feedback.
- Graph or visualization configuration.

This structure should be reusable for future Algebra 1 and Algebra 2 labs.

## 29. State and persistence

Track:
- Current stage.
- Completed stages.
- Waypoints plotted.
- Graphing attempts.
- Correct answers.
- Slope calculations.
- Hint usage.
- Completed challenges.
- Proportionality results.
- Certification score.
- Student ride analysis report.

Use existing Mathlete progress-persistence systems.

Do not introduce unnecessary database migrations.

Students should retain progress when leaving and returning to the lab.

---

# PART VIII — MATHEMATICAL QUALITY ASSURANCE

## 30. Required numerical tests

Build automated tests for the examples in this document.

### Coordinate plane

| Point | Correct quadrant |
|---|---|
| (3, 2) | I |
| (-4, 3) | II |
| (-3, -2) | III |
| (4, -3) | IV |
| (0, 0) | Origin |

Different axis scales:
- x grid interval = 20 meters.
- y grid interval = 5 meters.
- Three x intervals right and two y intervals up = `(60, 10)` meters.

### Trail profile

| Point | Expected coordinate |
|---|---|
| Trail start | (0, 1200) |
| Climb 1 | (100, 1205) |
| Climb 2 | (200, 1210) |
| Highest point | (300, 1215) |
| Flat section end | (400, 1215) |
| Descent 1 | (500, 1210) |
| Finish | (600, 1205) |

### Slope calculations

| Section | Expected result |
|---|---|
| (0,1200) to (300,1215) | +0.05 / +5% |
| (300,1215) to (400,1215) | 0 |
| (400,1215) to (600,1205) | -0.05 / -5% |
| (200,1210) to (200,1220) | Undefined |

### Linear relationships

| Dataset | Expected classification |
|---|---|
| Elevation: 1200, 1205, 1210, 1215 at 100m intervals | Linear |
| Elevation: 1200, 1205, 1211, 1215 at 100m intervals | Nonlinear |
| Distance: 0, 240, 480, 720, 960 at 1-minute intervals | Linear and proportional |
| Pump-track distance: 0, 160, 380, 530, 790 at 1-minute intervals | Nonlinear |

### Proportional relationships

Test:

`d = 240t`

- At t = 0, d = 0.
- At t = 1, d = 240.
- At t = 2, d = 480.
- At t = 3, d = 720.
- Constant of proportionality = 240 meters per minute.
- Graph passes through the origin.

Test:

`e = 1200 + 0.05x`

- Linear relationship.
- Constant rate of change = 0.05.
- y-intercept = 1200.
- Not proportional because it does not pass through the origin.

## 31. Common misconception testing

Explicitly test:
- Reversing x and y coordinates.
- Confusing quadrants.
- Forgetting that points on axes are not in quadrants.
- Counting graph intervals without reading the axis scales.
- Using pixel distances instead of coordinate values.
- Reversing the slope numerator.
- Dividing by zero for a vertical line.
- Confusing negative slope with negative elevation.
- Treating every downhill section as having the same slope.
- Assuming real trail profiles are always linear.
- Assuming every linear relationship is proportional.
- Forgetting that proportional relationships pass through the origin.
- Calculating y/x when x equals zero.
- Confusing slope with percentage grade without converting to a percentage.
- Using elevation along the actual trail surface as though it were horizontal run.

## 32. End-to-end testing

Test:
- Opening screen.
- Stage progression.
- Coordinate map.
- Quadrant interactions.
- Different axis scales.
- Waypoint placement.
- Ordered-pair plotting.
- Table-to-graph conversion.
- Trail elevation profile.
- Rise/run visualization.
- Slope calculations.
- Positive, negative, zero and undefined slope.
- Linearity classification.
- Constant rate of change.
- Proportionality.
- Graph-to-equation conversion.
- Progressive hints.
- Feedback and retries.
- Final project.
- Certification.
- Tutor Mode.
- Session reporting.
- Progress persistence.
- Mobile responsiveness.
- Accessibility.

---

# PART IX — DEVELOPMENT ROADMAP

## 33. Recommended implementation sequence

### Phase 1 — Inspect and establish the architecture

Inspect the existing Slope & Linear Relationships Lab and Trail Designer.

Determine which existing functionality can be extended.

Establish the unified six-stage architecture.

### Phase 2 — Build the Mountain Map and Graphing Studio

Implement:
- Coordinate plane.
- Four quadrants.
- Different axis scales.
- Mountain Map.
- Waypoint plotting.
- Ordered-pair tables.

Validate graphing accuracy.

### Phase 3 — Build the Trail Profile and Slope Visualizer

Implement:
- Elevation profile.
- Trail section selection.
- Rise/run triangle.
- Slope calculations.
- Percentage grade.
- Positive, negative, zero and undefined slope interactions.

### Phase 4 — Build the Linear Relationships Studio

Implement:
- Constant-rate calculations.
- Linear versus nonlinear classification.
- Tables, graphs and equations.
- Written scenario matching.
- `y = mx + b` connections.

### Phase 5 — Build the Proportional Relationships Explorer

Implement:
- `y = kx`.
- Constant ratio calculations.
- Origin checks.
- Linear versus proportional comparisons.
- Rider distance/time examples.

### Phase 6 — Integrate shared Mathlete systems

Integrate:
- Math Workbench.
- Challenge progression.
- Hints.
- Feedback.
- Tutor Mode.
- Progress tracking.
- Session reporting.

### Phase 7 — Final project and certification

Implement the Ride Data Report, final assessment, badges and course-page integration.

### Phase 8 — Testing and polish

Run all mathematical tests.

Test mobile and desktop.

Verify the existing slope lab has not regressed.

---

# PART X — COURSE INTEGRATION

## 34. Connect to all six Algebra 1 Unit 3 pages

The lab must integrate with:

1. `/classes/algebra-1/coordinate-plane/`
2. `/classes/algebra-1/graphing-ordered-pairs/`
3. `/classes/algebra-1/slope-and-rate-of-change/`
4. `/classes/algebra-1/positive-and-negative-slope/`
5. `/classes/algebra-1/linear-relationships/`
6. `/classes/algebra-1/proportional-relationships/`

Use established Mathlete course-page conventions.

Where practical, a student should be able to open the specific stage associated with a course topic directly from its corresponding page.

Do not rewrite unrelated course content.

Preserve existing membership permissions and navigation.

---

# PART XI — DEFINITION OF DONE

## 35. Release acceptance criteria

The lab is ready for release when:

- All six topics have functional interactive activities.
- The Mountain Map displays an accurate coordinate plane.
- Students can identify axes, origin and four quadrants.
- Different axis scales are supported.
- Students can plot ordered pairs.
- Students can graph tables of values.
- Students can interpret elevation profiles.
- Students can calculate slope between two points.
- Students understand percentage grade.
- Positive, negative, zero and undefined slopes are correctly explained.
- Students can classify linear and nonlinear tables.
- Tables, graphs, equations and words are connected.
- Students understand constant rates of change.
- Students can identify proportional relationships.
- Students can calculate and interpret k.
- Students understand the difference between linear and proportional relationships.
- The final Ride Data Report works.
- Math Workbench functions.
- Hints and feedback function.
- Tutor Mode functions.
- Session summaries work.
- Student progress persists.
- All mathematical examples pass automated tests.
- Existing Mathlete slope functionality is preserved.
- The six course pages link appropriately to the lab.
- Mobile and desktop experiences work.
- Accessibility requirements are met.

## 36. Non-goals and educational boundaries

This is an Algebra 1 learning experience, not a professional GPS navigation, trail-surveying or trail-engineering platform.

Do not:
- Require students to share their real location.
- Collect real GPS tracking data.
- Use private rider telemetry.
- Present fictional trail profiles as actual trail measurements.
- Present simplified grade calculations as professional trail-design standards.
- Suggest that real-world trail profiles are perfectly linear.
- Treat an undefined mathematical slope as a real rideable vertical trail.
- Build an unnecessary live mapping integration.
- Duplicate the existing Trail Designer or Gear Ratio Lab.
- Add advanced mathematical concepts that distract from the six curriculum objectives.

Use fictional, clearly labelled datasets for the educational activities.

Authentic MTB imagery and genuine course-map references can be used as inspiration, but all numerical examples should be controlled and independently validated.

---

# FINAL PRODUCT STANDARD

The student should finish Map the Line having developed a much deeper understanding of the mathematics hidden in mountain biking.

They should understand the coordinate plane because they mapped a mountain.

They should understand ordered pairs because they plotted trail features and GPS waypoints.

They should understand slope because they calculated the rise and run of a trail.

They should understand positive and negative slope because they interpreted climbs, descents and flat terrain.

They should understand linear relationships because they analyzed constant elevation changes and rider speed.

They should understand proportional relationships because they discovered how distance increases with time at a constant speed.

**The ultimate goal is for a student to look at an MTB trail map, GPS screen or elevation profile and recognize the algebra happening in the real world.**

Build something that makes mathematics feel like another tool in their riding toolkit.