# PRD: MATHLETE MTB — ALGEBRA 2
# BIKE PARK BLUEPRINT LAB: LINEAR SYSTEMS & MATRICES

**Product:** Mathlete MTB  
**Feature:** Bike Park Blueprint Lab  
**Course:** Algebra 2  
**Unit:** Linear Systems and Matrices  
**Activity Type:** Interactive Learning Lab / Simulation / Engineering Challenge  
**Target Audience:** High-school Algebra 2 students  
**Estimated Completion:** 20–25 minutes  
**Priority:** First flagship lesson for Linear Systems and Matrices

---

# 1. PRODUCT VISION

## The Big Idea

Create an interactive bike park development and trail-planning experience where students use systems of linear equations and matrices to design a mountain bike trail network.

The student becomes a mountain bike park designer working with a trail development crew.

They receive a fictional development site and a collection of construction resources.

Their job is to figure out how many trail features they can build while accounting for:
- Available crew hours.
- Machine hours.
- Soil and material requirements.
- Equipment inventory.
- Project costs.

They must solve two-variable and three-variable systems, represent those systems using matrices, perform matrix operations, and use matrix multiplication to calculate total resource requirements and project budgets.

The experience should feel like a combination of:
- A mountain bike park design simulator.
- A trail development planning tool.
- A mathematical engineering laboratory.

## Core Learning Philosophy

Students should discover that linear systems are useful when multiple relationships must be satisfied simultaneously.

Matrices are useful because they organize and manipulate large amounts of mathematical information efficiently.

Mountain bike trail development gives us a genuine scenario in which both concepts are useful.

The student should not simply be told how to solve a system.

They should encounter a development problem that requires them to figure out the unknown quantities.

**The central principle: Design the trail. Balance the resources. Solve the mathematics.**

---

# 2. CURRICULUM ALIGNMENT

Place the activity within:

Classes → Algebra 2 → Linear Systems and Matrices → Systems of Equations and Matrix Applications.

Use the existing Mathlete MTB curriculum IDs and routing conventions.

## Primary Mathematical Skills

1. Understanding systems of linear equations.
2. Graphing systems of equations.
3. Solving systems using substitution.
4. Solving systems using elimination.
5. Interpreting intersections of linear equations.
6. Identifying unique, infinite, and nonexistent solutions.
7. Solving systems of three equations with three variables.
8. Understanding matrices and matrix dimensions.
9. Constructing augmented matrices.
10. Performing elementary row operations.
11. Gaussian elimination.
12. Matrix addition and subtraction.
13. Scalar multiplication.
14. Matrix multiplication.
15. Representing systems using matrix equations.
16. Solving systems using inverse matrices.

## Learning Objectives

Students should be able to:

- Translate a real-world planning problem into a system of linear equations.
- Solve systems of two equations using multiple methods.
- Interpret a solution in a real-world context.
- Determine whether a system has one solution, no solution, or infinitely many solutions.
- Solve three-variable systems.
- Represent systems using augmented matrices.
- Understand how row operations preserve a system's solution.
- Perform basic matrix operations.
- Understand the dimensional requirements for matrix multiplication.
- Use matrix multiplication to calculate combined resource requirements.
- Represent a system as AX = B.
- Use an inverse matrix, when it exists, to solve a system.

## Standards Alignment

Use these standards as reference points:

- HSA.REI.C.5: Understand equivalent systems through elimination.
- HSA.REI.C.6: Solve systems of linear equations exactly and approximately.
- HSA.REI.C.8: Represent systems as matrix equations.
- HSA.REI.C.9: Use inverse matrices to solve systems.
- HSA.CED.A.2: Create equations representing relationships.
- HSA.CED.A.3: Model constraints and interpret viable solutions.

Also review local Algebra 2 curriculum expectations for matrix addition, subtraction, scalar multiplication, and multiplication.

---

# 3. OVERALL EXPERIENCE DESIGN

## Theme

# BIKE PARK BLUEPRINT LAB

Opening screen:

"Your mountain bike park has a new development zone.

The trail crew is ready to build a new section of park, but there's a problem.

You have limited construction resources, multiple types of trail features, and a fixed development budget.

Before construction begins, you need to figure out exactly what the crew can build.

Can you design the park?"

Display a stylized mountain biking trail-development environment.

Visual elements:
- Mountain bike park terrain map.
- Dirt jumps.
- Berms.
- Rock gardens.
- Trail construction equipment.
- Trail crew tools.
- Resource inventory.
- Construction blueprint.
- Digital planning dashboard.

Primary button:

**START BUILDING**

## Mission Dashboard

Display four mission stations:

1. The Trail Design Puzzle.
2. Build the Entire Park.
3. The Matrix Workshop.
4. The Matrix Solver.

Each should display:
- Description.
- Associated mathematical concepts.
- Completion status.
- Progress.

Completing all four unlocks the final mission.

Students should be able to revisit completed missions.

---

# 4. MISSION 1 — THE TRAIL DESIGN PUZZLE

**Mathematical Focus:** Two-variable linear systems, graphing, substitution, and elimination.

**Estimated Completion:** 5–6 minutes.

## The Scenario

"The crew has been given a section of land to develop into a small jump and berm zone.

There are two types of features they want to build:

- Berm sections.
- Jump features.

Each feature requires different amounts of labor and machine time.

You have to figure out how many of each feature can be built using exactly the available resources."

## Define the Variables

Let:

- x = number of berm modules.
- y = number of jump features.

For this simplified planning model, each feature has the following estimated resource requirements:

| Feature | Crew hours | Machine hours |
|---|---:|---:|
| Berm module | 4 | 2 |
| Jump feature | 3 | 1 |

Available resources:

- 17 crew hours.
- 7 machine hours.

These are fictional educational planning estimates, not construction standards or real contractor estimates.

## Build the System

Crew hours:

\[
4x+3y=17
\]

Machine hours:

\[
2x+y=7
\]

The complete system is:

\[
\begin{cases}
4x+3y=17\\
2x+y=7
\end{cases}
\]

The student's job is to solve for x and y.

Expected solution:

\[
x=2,\quad y=3
\]

Interpretation:

The park can build:
- 2 berm modules.
- 3 jump features.

## Learning Module A — Solve by Graphing

Build an interactive coordinate-plane graph.

Graph:

\[
4x+3y=17
\]

\[
2x+y=7
\]

Label:
- X-axis: Berm modules.
- Y-axis: Jump features.

The two lines should intersect at:

\[
(2,3)
\]

The intersection represents the combination of features that satisfies both resource equations.

### Interactive Component: Blueprint Graph

Students should be able to:
- View both equations.
- Toggle lines on and off.
- Select their intersection.
- See the corresponding x and y values.
- Adjust resource totals in practice scenarios.

Highlight the intersection and show the physical interpretation.

Ask:

"What does the intersection tell us about the trail development plan?"

Expected understanding:

It identifies the number of berms and jumps that satisfies both resource constraints simultaneously.

## Learning Module B — Solve by Substitution

Walk students through:

\[
2x+y=7
\]

Rearrange:

\[
y=7-2x
\]

Substitute into the first equation:

\[
4x+3(7-2x)=17
\]

\[
4x+21-6x=17
\]

\[
-2x=-4
\]

\[
x=2
\]

Then:

\[
y=7-2(2)=3
\]

Explain why substitution works: the expression for y can replace y in the other equation because they represent the same quantity.

## Learning Module C — Solve by Elimination

Start with:

\[
4x+3y=17
\]

\[
2x+y=7
\]

Multiply the second equation by -3:

\[
-6x-3y=-21
\]

Add the equations:

\[
-2x=-4
\]

\[
x=2
\]

Substitute to find:

\[
y=3
\]

Explain how eliminating y makes the system easier to solve.

### Interactive Practice

Allow students to select which method they want to use:
- Graphing.
- Substitution.
- Elimination.

Give them a new system with different values.

Ask them to solve and interpret the result.

## Learning Module D — When Does a Plan Have No Solution?

Introduce the three possible outcomes for systems of two linear equations:

1. One solution.
2. No solution.
3. Infinitely many solutions.

Use the graph to show the differences.

### Unique Solution

Two lines intersect once.

Interpretation:

There is one exact combination of features that satisfies both equations.

### No Solution

Introduce:

\[
4x+3y=17
\]

\[
8x+6y=36
\]

The second equation would simplify to:

\[
4x+3y=18
\]

These lines are parallel and do not intersect.

Interpretation:

The two equations describe conflicting resource requirements. No single plan satisfies both exact requirements.

### Infinite Solutions

Introduce:

\[
4x+3y=17
\]

\[
8x+6y=34
\]

The second equation is simply twice the first.

The two equations describe the same line.

There are infinitely many mathematical solutions before practical construction constraints are applied.

Interpretation:

The two resource equations provide redundant information and do not determine one unique build plan.

### Interactive Challenge: Diagnose the Blueprint

Give students three pairs of equations.

Ask them to classify each as:
- One solution.
- No solution.
- Infinite solutions.

Display the graph after their answer.

---

# 5. MISSION 2 — BUILD THE ENTIRE PARK

**Mathematical Focus:** Three-variable systems, elimination, augmented matrices, and Gaussian elimination.

**Estimated Completion:** 5–6 minutes.

## The Scenario

"The park has secured additional development space.

The new plan includes three types of trail features:

- Berm modules.
- Jump features.
- Rock garden sections.

Now three different construction resources need to be accounted for.

You need to determine exactly how many of each feature the crew can build."

## Define the Variables

Let:

- x = number of berm modules.
- y = number of jump features.
- z = number of rock garden sections.

### Resource Requirements

Use the following illustrative model:

| Feature | Crew hours | Machine hours | Soil loads |
|---|---:|---:|---:|
| Berm module | 4 | 2 | 1 |
| Jump feature | 3 | 1 | 2 |
| Rock garden | 5 | 3 | 2 |

Total available resources:

- 22 crew hours.
- 10 machine hours.
- 10 soil loads.

Again, these numbers are simplified simulation data, not actual trail-construction guidance.

## Construct the System

Crew hours:

\[
4x+3y+5z=22
\]

Machine hours:

\[
2x+y+3z=10
\]

Soil loads:

\[
x+2y+2z=10
\]

Complete system:

\[
\begin{cases}
4x+3y+5z=22\\
2x+y+3z=10\\
x+2y+2z=10
\end{cases}
\]

Expected solution:

\[
x=2,\quad y=3,\quad z=1
\]

Interpretation:

- 2 berm modules.
- 3 jump features.
- 1 rock garden section.

## Learning Module A — Understanding Three-Variable Systems

Explain:

"With three unknown quantities, we need enough independent equations to determine the values of all three variables."

Visualize the system as three planes intersecting in three-dimensional space.

Use a simple 3D visualization:
- Each plane represents one resource equation.
- Their common intersection represents the solution.
- Highlight the coordinate point (2, 3, 1).

Do not overload students with a complicated 3D visualization.

The focus is understanding that all three equations must be satisfied at once.

## Learning Module B — Gaussian Elimination

Introduce augmented matrices.

Show the original system:

\[
\left[
\begin{array}{ccc|c}
4&3&5&22\\
2&1&3&10\\
1&2&2&10
\end{array}
\right]
\]

Explain that each row represents one equation.

Each column represents:
- Coefficient of x.
- Coefficient of y.
- Coefficient of z.
- Constant term.

Demonstrate elementary row operations.

Initial matrix:

\[
\left[
\begin{array}{ccc|c}
4&3&5&22\\
2&1&3&10\\
1&2&2&10
\end{array}
\right]
\]

Swap the first and third rows:

\[
\left[
\begin{array}{ccc|c}
1&2&2&10\\
2&1&3&10\\
4&3&5&22
\end{array}
\right]
\]

Perform:

\[
R_2\rightarrow R_2-2R_1
\]

\[
R_3\rightarrow R_3-4R_1
\]

Result:

\[
\left[
\begin{array}{ccc|c}
1&2&2&10\\
0&-3&-1&-10\\
0&-5&-3&-18
\end{array}
\right]
\]

Then perform:

\[
R_3\rightarrow3R_3-5R_2
\]

Result:

\[
\left[
\begin{array}{ccc|c}
1&2&2&10\\
0&-3&-1&-10\\
0&0&-4&-4
\end{array}
\right]
\]

This gives:

\[
z=1
\]

Back-substitute:

\[
-3y-z=-10
\]

\[
y=3
\]

Then:

\[
x+2y+2z=10
\]

\[
x=2
\]

Final solution:

\[
(2,3,1)
\]

Explain that the same three equations have been transformed into an easier equivalent system.

## Interactive Component: The Matrix Elimination Console

Build an interactive augmented matrix.

Students should be able to perform:
- Row swaps.
- Multiplication of a row by a nonzero constant.
- Addition of a multiple of one row to another row.

Each operation should visually update the matrix.

Show a short explanation of the selected row operation.

After every operation:
- Display the updated augmented matrix.
- Explain what changed.
- Confirm that the system has retained the same solution set.

Include a step-by-step guided mode and an independent practice mode.

### Three-Variable Practice

Randomize a small set of validated three-variable systems with:
- Integer solutions.
- Unique solutions.
- No solutions.
- Infinitely many solutions.

For no-solution and infinite-solution cases, help students recognize contradictory or redundant rows after elimination.

---

# 6. MISSION 3 — THE MATRIX WORKSHOP

**Mathematical Focus:** Matrix notation, dimensions, entries, addition, subtraction, scalar multiplication, and matrix multiplication.

**Estimated Completion:** 5–6 minutes.

## The Scenario

"The park has multiple trail crews working in different sections.

They need an efficient way to keep track of equipment, materials, construction requirements, and project costs.

Instead of writing long lists of numbers, the crew uses matrices to organize the information."

Introduce the idea of a matrix:

"A matrix is a rectangular arrangement of numbers organized into rows and columns."

## Learning Module A — Read the Inventory Matrix

Create an inventory matrix for two trail crews.

Columns:
- Shovels.
- Rakes.
- Tampers.

Rows:
- Crew A.
- Crew B.

Example:

\[
A=
\begin{bmatrix}
4&6&2\\
3&5&1
\end{bmatrix}
\]

Explain:
- Matrix A has 2 rows and 3 columns.
- It is a 2 × 3 matrix.
- The first row represents Crew A.
- The second row represents Crew B.
- Each column represents a tool type.

Ask the student to identify specific entries.

Example:

How many rakes does Crew B have?

Answer: 5.

## Learning Module B — Matrix Addition

Two delivery trailers arrive with additional equipment.

Trailer 1:

\[
A=
\begin{bmatrix}
4&6&2\\
3&5&1
\end{bmatrix}
\]

Trailer 2:

\[
B=
\begin{bmatrix}
2&2&1\\
1&3&2
\end{bmatrix}
\]

Combine inventories:

\[
A+B=
\begin{bmatrix}
6&8&3\\
4&8&3
\end{bmatrix}
\]

Explain that corresponding entries are added.

Interactive task:

Allow students to select entries and combine them.

Show the inventory totals updating visually.

## Learning Module C — Matrix Subtraction

Now show the starting inventory and the tools used during construction.

Starting inventory:

\[
S=
\begin{bmatrix}
10&12&6\\
8&10&5
\end{bmatrix}
\]

Tools used:

\[
U=
\begin{bmatrix}
3&4&2\\
2&3&1
\end{bmatrix}
\]

Remaining inventory:

\[
S-U=
\begin{bmatrix}
7&8&4\\
6&7&4
\end{bmatrix}
\]

Explain that subtraction helps identify remaining quantities.

## Learning Module D — Scalar Multiplication

The park is planning two identical construction weekends.

Take the combined inventory matrix:

\[
A+B=
\begin{bmatrix}
6&8&3\\
4&8&3
\end{bmatrix}
\]

Multiply by 2:

\[
2(A+B)=
\begin{bmatrix}
12&16&6\\
8&16&6
\end{bmatrix}
\]

Explain that every entry is multiplied by the scalar.

Interactive challenge:

Allow the student to change the number of construction weekends.

Display how the required inventory changes.

## Learning Module E — Matrix Multiplication

This is the most important part of the Matrix Workshop.

Title:

**"How Much Will the Entire Park Cost?"**

Introduce the idea that a matrix can combine multiple types of quantities and resource costs in one operation.

Use the following resource matrix:

\[
M=
\begin{bmatrix}
4&2&1\\
3&1&2\\
5&3&2
\end{bmatrix}
\]

Rows represent:
1. Berm modules.
2. Jump features.
3. Rock gardens.

Columns represent:
1. Crew hours.
2. Machine hours.
3. Soil loads.

The resource cost vector is:

\[
C=
\begin{bmatrix}
28\\
90\\
45
\end{bmatrix}
\]

Where:
- Crew hour cost = $28.
- Machine hour cost = $90.
- Soil load cost = $45.

These are fictional cost assumptions for the educational simulation.

Multiply:

\[
MC=
\begin{bmatrix}
337\\
264\\
500
\end{bmatrix}
\]

Explain:

- A berm module has a modeled resource cost of $337.
- A jump feature has a modeled resource cost of $264.
- A rock garden has a modeled resource cost of $500.

Students should understand how each matrix row is multiplied by the cost vector.

### Calculate the Entire Park's Cost

The solved feature quantities are:

\[
Q=
\begin{bmatrix}
2&3&1
\end{bmatrix}
\]

Multiply by the resource matrix:

\[
QM=
\begin{bmatrix}
22&10&10
\end{bmatrix}
\]

This represents:
- 22 crew hours.
- 10 machine hours.
- 10 soil loads.

Now multiply by the unit cost vector:

\[
QMC=
\begin{bmatrix}
1966
\end{bmatrix}
\]

The total modeled project cost is:

**$1,966.**

Explain that matrix multiplication is allowing us to combine quantities and costs efficiently.

### Interactive Component: Matrix Cost Calculator

Build an interactive matrix calculator.

Allow students to:
- Adjust feature quantities.
- Change resource requirements in a practice scenario.
- Change unit costs.
- Watch the matrix multiplication update.
- See total crew hours, machine hours, soil loads, and total cost.

Display each multiplication step.

Show row-by-column calculations rather than simply displaying a result.

Include matrix dimensions and explain why the multiplication is valid.

Example:

\[
(1\times3)(3\times3)(3\times1)
\]

The final output is a 1 × 1 matrix containing the total cost.

### Important Mathematical Concepts

Teach:
- Matrix dimensions.
- Compatible dimensions for multiplication.
- Row-by-column multiplication.
- Why matrix multiplication is not generally commutative.
- How matrix multiplication can represent combined resource calculations.

Do not let the student simply enter values and receive a total. They need to understand how the matrix operation works.

---

# 7. MISSION 4 — THE MATRIX SOLVER

**Mathematical Focus:** Matrix equations, coefficient matrices, augmented matrices, inverse matrices, and solving systems.

**Estimated Completion:** 4–5 minutes.

## The Scenario

"The park's development plan now includes three different types of construction features and three resource constraints.

Instead of solving the equations individually, the lead engineer wants to represent the entire project using a matrix equation."

Return to the three-variable system from Mission 2.

\[
\begin{cases}
4x+3y+5z=22\\
2x+y+3z=10\\
x+2y+2z=10
\end{cases}
\]

## Learning Module A — Build the Matrix Equation

Introduce:

\[
AX=B
\]

Where:

Coefficient matrix:

\[
A=
\begin{bmatrix}
4&3&5\\
2&1&3\\
1&2&2
\end{bmatrix}
\]

Variable matrix:

\[
X=
\begin{bmatrix}
x\\
y\\
z
\end{bmatrix}
\]

Constant matrix:

\[
B=
\begin{bmatrix}
22\\
10\\
10
\end{bmatrix}
\]

Explain how multiplying A by X recreates the original system.

Show how the first row generates the crew-hours equation and how the second and third rows generate the other equations.

## Learning Module B — Solving Using an Inverse Matrix

Explain that if A has an inverse, then we can multiply both sides of:

\[
AX=B
\]

by the inverse matrix.

\[
A^{-1}AX=A^{-1}B
\]

Since:

\[
A^{-1}A=I
\]

we obtain:

\[
X=A^{-1}B
\]

Use this model to find the solution.

For the example matrix:

\[
\det(A)=-4
\]

Since the determinant is nonzero, the inverse exists.

The inverse is:

\[
A^{-1}=
\begin{bmatrix}
1&-1&-1\\
\frac14&-\frac34&\frac12\\
-\frac34&\frac54&\frac12
\end{bmatrix}
\]

Then:

\[
A^{-1}B=
\begin{bmatrix}
2\\
3\\
1
\end{bmatrix}
\]

Interpretation:

The park can build two berm modules, three jump features, and one rock garden section.

### Interactive Component: Matrix Equation Solver

Build a visual matrix-solving environment.

Display:
- Coefficient matrix.
- Variable vector.
- Constant vector.
- Inverse matrix where it exists.
- Solution vector.

Allow students to:
- Identify individual matrix dimensions.
- Select the correct matrix equation.
- Perform an inverse-matrix calculation in guided mode.
- Verify the resulting solution by substituting it into the original system.

Use technology-assisted matrix calculations where appropriate, especially for three-by-three systems.

Students should still understand what the inverse operation accomplishes.

## Important Teaching Point

Not every matrix has an inverse.

Explain that when the determinant is zero, an inverse matrix does not exist.

This does not automatically mean the original system has no solutions. The system may be inconsistent or dependent.

Include a short conceptual example to reinforce this distinction.

---

# 8. FINAL MISSION — OPEN THE BIKE PARK

Once the four main missions are complete, unlock the final assessment.

Title:

# THE FINAL BUILD PLAN

"The park is almost ready to open. You've been given one last development project.

This time, you're responsible for figuring out the build plan, solving the equations, and calculating the resources and estimated cost.

Can you put everything together?"

## Final Challenge A — Solve the Two-Variable Plan

A small trail zone contains two possible feature types.

- Berm modules.
- Jump features.

Use:

\[
4x+3y=17
\]

\[
2x+y=7
\]

Ask students to:
1. Identify the variables.
2. Solve using substitution or elimination.
3. Interpret the solution.
4. Verify both equations.

Expected result:

\[
x=2,\quad y=3
\]

## Final Challenge B — Solve the Full Park Plan

Give students a new three-variable system.

\[
3x+4y+5z=25
\]

\[
x+2y+3z=13
\]

\[
2x+y+z=9
\]

Ask them to:
1. Build the augmented matrix.
2. Perform row operations.
3. Solve the system.
4. Interpret the feature quantities.

Expected result:

\[
x=1,\quad y=2,\quad z=3
\]

## Final Challenge C — Calculate Project Resources and Cost

Use the original resource matrix:

\[
M=
\begin{bmatrix}
4&2&1\\
3&1&2\\
5&3&2
\end{bmatrix}
\]

Feature quantities:

\[
Q=
\begin{bmatrix}
1&2&3
\end{bmatrix}
\]

Calculate:

\[
QM=
\begin{bmatrix}
25&13&11
\end{bmatrix}
\]

The team needs:
- 25 crew hours.
- 13 machine hours.
- 11 soil loads.

Then calculate the total using the cost vector:

\[
C=
\begin{bmatrix}
28\\
90\\
45
\end{bmatrix}
\]

\[
QMC=2365
\]

The estimated modeled project cost is:

**$2,365.**

Assume a project budget of $2,400.

Ask the student:

"Does the project fit the budget?"

Expected answer:

Yes. The project has $35 remaining.

## Completion Screen

Display:

# PARK DESIGNER CERTIFIED

"You successfully planned a trail network, balanced construction resources, solved multi-variable systems, and used matrices to calculate your complete project requirements."

Show:
- Missions completed.
- Systems solved.
- Matrix operations completed.
- Final challenge performance.
- Skills demonstrated.
- Areas needing further practice.

Record progress in the existing Mathlete MTB student system.

Do not assign automatic mastery based solely on activity completion.

---

# 9. OPTIONAL EXTENSION — THE PARK OPTIMIZER

Build an optional extension for students who finish early or want more challenging problems.

Title:

**"Can You Build More With Less?"**

Introduce a simplified resource-constraint planning problem.

Let:
- x = berm modules.
- y = jump features.

Constraints:

\[
4x+3y\leq40
\]

\[
2x+y\leq18
\]

\[
x\geq0,\quad y\geq0
\]

Explain that these inequalities represent available resource limits.

Display the feasible region on a coordinate graph.

Allow students to explore different build plans.

Introduce the idea that not every mathematical solution is practically viable.

Feature quantities must be nonnegative whole numbers.

Optionally introduce a simple objective function, such as maximizing the total number of features:

\[
P=x+y
\]

Ask students to find the largest possible integer value of P while respecting the constraints.

This is an introductory bridge to linear programming.

Keep this extension optional and separate from the main lesson.

---

# 10. VISUAL DESIGN AND USER EXPERIENCE

## Design Direction

The experience should feel like a professional bike park development environment.

Think:
- Trail construction blueprints.
- Mountain bike park design software.
- Engineering dashboards.
- Resource planning interfaces.
- Technical trail maps.

Use the existing Mathlete MTB brand identity.

Visual elements:
- Trail layout illustrations.
- Berms and jumps.
- Rock gardens.
- Construction machinery.
- Shovels and rakes.
- Equipment inventories.
- Matrix displays.
- Coordinate graphs.
- Resource dashboards.

Avoid traditional worksheet layouts.

## Mission-Specific Visuals

**Mission 1: The Trail Design Puzzle**
- Two-dimensional trail blueprint.
- Berm and jump feature icons.
- Graph with two intersecting lines.

**Mission 2: Build the Entire Park**
- Three feature categories.
- Three resource indicators.
- Augmented matrix console.
- Three-plane intersection visualization.

**Mission 3: The Matrix Workshop**
- Equipment inventory cards.
- Matrix grids.
- Resource cost calculator.
- Animated row-by-column multiplication.

**Mission 4: The Matrix Solver**
- Technical matrix interface.
- Coefficient matrix.
- Variable vector.
- Inverse matrix.
- Solution vector.

## Navigation

Include:
- Mathlete MTB logo.
- Back to Algebra 2.
- Bike Park Blueprint Lab title.
- Overall progress.
- Exit option.

Breadcrumb:

Classes → Algebra 2 → Linear Systems and Matrices → Bike Park Blueprint Lab.

## Responsive Requirements

Support desktop, tablet, and mobile.

Matrix displays must remain legible on smaller screens.

Allow horizontal scrolling inside wide matrix displays when needed.

Interactive graphing and row-operation controls must work with touch and keyboard inputs.

---

# 11. MATHEMATICAL VALIDATION AND CALCULATION ENGINE

Use a single authoritative calculation layer for each mathematical model.

All equation displays, graph visualizations, matrix operations, assessment questions, and answer validation must use the same source of truth.

## Two-Variable System

\[
4x+3y=17
\]

\[
2x+y=7
\]

Expected solution: (2, 3).

## Three-Variable System

\[
4x+3y+5z=22
\]

\[
2x+y+3z=10
\]

\[
x+2y+2z=10
\]

Expected solution: (2, 3, 1).

Coefficient matrix determinant: -4.

The inverse matrix must be calculated and verified before use.

## Matrix Inventory Operations

Implement:
- Matrix dimensions.
- Entry access.
- Matrix addition.
- Matrix subtraction.
- Scalar multiplication.
- Matrix multiplication.

Enforce valid dimensions.

Matrix addition and subtraction require matching dimensions.

Matrix multiplication requires the number of columns in the first matrix to equal the number of rows in the second matrix.

Do not implement element-by-element multiplication as ordinary matrix multiplication.

## Resource Calculation

Feature resource matrix:

\[
M=
\begin{bmatrix}
4&2&1\\
3&1&2\\
5&3&2
\end{bmatrix}
\]

Cost vector:

\[
C=
\begin{bmatrix}
28\\
90\\
45
\end{bmatrix}
\]

Initial feature quantities:

\[
Q=
\begin{bmatrix}
2&3&1
\end{bmatrix}
\]

Expected:

\[
QM=[22,10,10]
\]

\[
QMC=1966
\]

All project prices and quantities are simulated educational assumptions.

## Input Validation

- Feature counts must be nonnegative.
- Physical feature quantities should normally be whole numbers.
- Resource amounts cannot be negative.
- Validate matrix dimensions.
- Handle incompatible products gracefully.
- Check zero determinants before attempting matrix inversion.
- Validate answers using the original systems.
- Avoid floating-point precision errors when comparing exact solutions.

For generalized randomized questions, choose parameter sets with independently verified solutions.

---

# 12. ASSESSMENT AND FEEDBACK ENGINE

Use the existing Mathlete MTB question and feedback framework.

Support:
- Multiple-choice questions.
- Numerical answers.
- Graph interpretation.
- Matrix entry identification.
- Row-operation tasks.
- Equation construction.
- Short written explanations.

## Progressive Hints

**Hint 1:** Give a conceptual direction.

**Hint 2:** Identify the method or mathematical relationship.

**Hint 3:** Provide the next guided step.

**Solution:** Show the full working and explain the meaning of the result.

## Common Misconceptions to Track

Systems:
- Solving only one equation instead of the full system.
- Incorrect substitution.
- Incorrect elimination.
- Misinterpreting the intersection.
- Confusing no solution with infinite solutions.

Three-variable systems:
- Losing signs during elimination.
- Incorrect row operations.
- Solving for the wrong variable.
- Not checking all three equations.

Matrices:
- Confusing rows and columns.
- Misidentifying matrix dimensions.
- Adding matrices of incompatible dimensions.
- Multiplying corresponding entries instead of performing row-by-column multiplication.
- Assuming matrix multiplication is commutative.
- Performing incorrect scalar multiplication.

Inverse matrices:
- Assuming every matrix has an inverse.
- Ignoring a zero determinant.
- Forgetting to verify the solution.

Record misconceptions using the associated curriculum skill identifiers where supported.

---

# 13. STUDENT PROGRESS INTEGRATION

Reuse existing Mathlete MTB student activity and progress infrastructure.

Track:

1. Solving systems by graphing.
2. Solving systems by substitution.
3. Solving systems by elimination.
4. Classifying systems.
5. Solving three-variable systems.
6. Gaussian elimination.
7. Augmented matrix construction.
8. Matrix addition and subtraction.
9. Scalar multiplication.
10. Matrix multiplication.
11. Matrix dimensions.
12. Matrix equations.
13. Inverse matrices.
14. Real-world matrix applications.

Record:
- Activity start.
- Mission start and completion.
- Attempts.
- Correct and incorrect answers.
- Hints requested.
- Row operations performed.
- Independent solutions.
- Challenge completion.
- Total time.

Distinguish between practicing a concept and demonstrating mastery.

---

# 14. TECHNICAL ARCHITECTURE

Suggested reusable components:

**BikeParkDashboard**
- Introduction.
- Mission navigation.
- Progress.

**TrailDesignPlanner**
- Trail features.
- Resource requirements.
- Two-variable system.

**SystemGraph**
- Equation plotting.
- Intersections.
- Unique, infinite, and no-solution examples.

**ThreeVariableSolver**
- Three-equation interface.
- Gaussian elimination.
- Solution verification.

**AugmentedMatrixEditor**
- Matrix display.
- Row operations.
- Guided and independent solving.

**MatrixWorkbench**
- Addition.
- Subtraction.
- Scalar multiplication.
- Multiplication.
- Matrix dimensions.

**ResourceCostCalculator**
- Resource matrix.
- Feature quantities.
- Cost vector.
- Total project cost.

**InverseMatrixSolver**
- Matrix equation.
- Determinant validation.
- Inverse calculation.
- Solution vector.

**ChallengeEngine**
- Questions.
- Hints.
- Feedback.
- Scoring.

**ProgressTracker**
- Attempts.
- Completion.
- Curriculum skill associations.

These are architectural suggestions, not requirements to duplicate components already present in Mathlete MTB.

Before development, inspect the existing Slope Lab, Jump Lab, Race-Day Workshop, and Ride Systems Lab. Reuse any suitable graph, slider, assessment, math-rendering, and progress components.

Keep mathematical calculations independent from visual presentation and student assessment.

---

# 15. RESEARCH AND EDUCATIONAL REFERENCES

Use the following sources to guide implementation.

## Curriculum Standards

1. Common Core — Reasoning with Equations and Inequalities:
https://www.thecorestandards.org/Math/Content/HSA/REI/

Relevant sections:
- HSA.REI.C.5
- HSA.REI.C.6
- HSA.REI.C.8
- HSA.REI.C.9

2. Common Core — Creating Equations:
https://www.thecorestandards.org/Math/Content/HSA/CED/

Relevant sections:
- HSA.CED.A.2
- HSA.CED.A.3

## Mathematics Instruction

3. OpenStax — Systems of Linear Equations in Three Variables:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/11-2-systems-of-linear-equations-three-variables

4. OpenStax — Solving Systems Using Matrices:
https://openstax.org/books/intermediate-algebra/pages/4-5-solve-systems-of-equations-using-matrices

5. OpenStax — Matrices and Matrix Operations:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/11-5-matrices-and-matrix-operations

## Mountain Bike Trail Design

6. IMBA — Trail Planning and Design:
https://www.imba.com/planning-design

Use this reference for mountain bike trail development context and feature terminology.

All lesson content, numerical scenarios, diagrams, questions, and simulations should be created originally for Mathlete MTB.

Do not reproduce third-party instructional materials.

---

# 16. IMPLEMENTATION PRIORITIES

Before development:

1. Read docs/LAB_DEVELOPMENT_FRAMEWORK.md.
2. Inspect the current Algebra 2 curriculum.
3. Audit existing Mathlete MTB lab implementations.
4. Identify reusable graphing, equation, matrix, and assessment components.
5. Confirm student progress and activity tracking architecture.
6. Confirm the correct curriculum placement and route.

Implement in this sequence:

**Phase 1:** Bike Park Blueprint Lab landing screen and mission dashboard.

**Phase 2:** Two-variable Trail Design Puzzle, including graphing, substitution, elimination, and solution classification.

**Phase 3:** Three-variable Build the Entire Park mission, including augmented matrices and Gaussian elimination.

**Phase 4:** Matrix Workshop, including matrix addition, subtraction, scalar multiplication, and multiplication.

**Phase 5:** Matrix Solver, including matrix equations and inverse matrices.

**Phase 6:** Final Open the Bike Park assessment.

**Phase 7:** Optional Park Optimizer extension.

**Phase 8:** Student progress, responsiveness, accessibility, and testing.

Implement complete functional experiences rather than static visual mockups.

Test all mathematical outputs independently.

---

# 17. ACCEPTANCE CRITERIA

- [ ] Lesson appears under Algebra 2 → Linear Systems and Matrices.
- [ ] Opening Bike Park Blueprint Lab experience works.
- [ ] Students can navigate all four missions.
- [ ] Two-variable system is correctly modeled and graphed.
- [ ] Graph intersection displays the correct solution.
- [ ] Substitution and elimination explanations work.
- [ ] Unique, infinite, and no-solution systems are differentiated.
- [ ] Three-variable system produces the correct solution.
- [ ] Augmented matrix is constructed correctly.
- [ ] Gaussian elimination row operations work.
- [ ] Matrix addition and subtraction work.
- [ ] Scalar multiplication works.
- [ ] Matrix multiplication works.
- [ ] Matrix dimensions are validated.
- [ ] Resource calculations produce correct results.
- [ ] Matrix equation is correctly represented.
- [ ] Inverse matrix calculations are verified.
- [ ] Final assessment works.
- [ ] Feedback and hints work.
- [ ] Student progress integrates with existing infrastructure.
- [ ] Responsive layouts work.
- [ ] Existing Featured Tools and Classes remain functional.

---

# FINAL PRODUCT PRINCIPLE

The Bike Park Blueprint Lab should demonstrate that mathematics helps us design, organize, and solve complex problems.

A student begins with a simple question:

"How many berms and jumps can we build?"

That question develops into:
- Systems of equations.
- Three-variable systems.
- Gaussian elimination.
- Matrix operations.
- Matrix multiplication.
- Inverse matrices.
- Real-world resource modeling.

The student finishes with a complete mathematical model of their bike park development project.

**The goal is to make students feel like they're learning the mathematics behind designing the mountain bike park of their dreams.**

That's the Mathlete MTB experience.