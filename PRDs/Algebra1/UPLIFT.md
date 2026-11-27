# PRODUCT REQUIREMENTS DOCUMENT
# UPLIFT — THE ULTIMATE BIKE PARK OPERATIONS CHALLENGE
## Algebra 1 · Systems of Equations

**Platform:** Mathlete MTB  
**Product:** Interactive Educational Lab  
**Lab title:** Uplift  
**Subtitle:** Run the mountain. Solve the systems.  
**Course:** Algebra 1  
**Unit:** Systems of Equations  
**Proposed route:** `/learning-lab/uplift/`  
**Target audience:** Middle school and high school Algebra 1 students  
**Estimated completion:** 40–55 minutes  
**Experience type:** Interactive MTB bike park operations simulator

---

# PART I — PRODUCT VISION

## 1. The concept

The student has just been hired as the Director of Operations for a fictional world-class mountain bike destination.

The park is preparing for its biggest opening season yet.

They are responsible for managing the entire operation:
- Shuttle and uplift services.
- Bike rental fleet.
- Workshop inventory.
- Trail surface materials.
- Construction crew schedules.
- Rider logistics.

The park has a lot of moving parts, and the student must solve several complicated operational problems before opening day.

Many of these problems involve two unknown quantities that must satisfy two conditions simultaneously.

This is the perfect real-world setting for systems of equations.

### The central storyline

"You've been hired to run a mountain bike destination.

Your job is to get the mountain ready for its biggest season yet.

You'll need to compare shuttle pricing plans, organize the rental fleet, calculate workshop orders, manage trail construction and coordinate the operations team.

Every department has a different problem, and algebra is the key to solving them.

Can you get the mountain ready for opening day?"

## 2. Educational philosophy

The student should learn systems of equations by understanding why they are useful.

Do not simply present equations and ask students to solve them.

Instead:
1. Give the student an operational problem.
2. Introduce two unknown quantities.
3. Show the two conditions that must be satisfied.
4. Build the corresponding system.
5. Solve using the appropriate mathematical method.
6. Verify the answer in both equations.
7. Show how the answer solves the real-world problem.

The four stages should develop the student's understanding progressively.

## 3. Real-world MTB inspiration

Use authentic references from mountain bike destinations and operations.

Key inspiration:
- Blue Derby uplift shuttles.
- LAAX bike park and mountain transportation.
- Whistler-style lift-served bike parks.
- Professional bike rental and workshop operations.
- Trail construction material specifications.
- Professional trail crew production schedules.

These are inspiration for the simulation, not direct copies of commercial systems.

## 4. Learning objectives

The lab must teach all four Algebra 1 topics.

### Graphing Systems
- Solve systems by graphing.
- Recognize systems with one, no or infinitely many solutions.
- Interpret intersection points in context.

### Substitution
- Solve systems by substitution.
- Choose which variable to isolate.
- Substitute expressions correctly.
- Verify a solution in both equations.

### Elimination
- Solve systems using addition and subtraction.
- Multiply equations to align coefficients.
- Select an efficient elimination strategy.
- Choose between graphing, substitution and elimination.

### Applications of Systems
- Construct systems from written situations.
- Solve break-even and comparison problems.
- Solve mixture problems.
- Solve rate problems.

---

# PART II — THE MAIN EXPERIENCE

## 5. Opening screen

### Main title

# UPLIFT

**Run the mountain. Solve the systems.**

### Introduction

"Welcome to your new mountain bike destination.

You've been appointed Director of Operations, and the mountain is getting ready to open.

The shuttle service needs a pricing strategy. The rental fleet needs to be organized. The workshop needs supplies. The trail crew needs materials and a construction schedule.

You've got four major departments to get running.

Your job is to solve the problems, make the decisions and get this mountain ready for riders.

Let's open the mountain."

Primary CTA:

`ENTER OPERATIONS HQ`

## 6. Destination selection

Allow students to choose the visual environment for their fictional park.

Offer three options:

**A. Tasmania Rainforest**
- Inspired by Blue Derby.
- Rainforest trails.
- Remote shuttle operations.
- Scenic trailheads.
- Gravity riding atmosphere.

**B. Swiss Alpine Bike Park**
- Inspired by LAAX.
- Gondola and uplift infrastructure.
- Alpine terrain.
- Large bike park facilities.
- Modern resort aesthetic.

**C. British Columbia Gravity Park**
- Inspired by Whistler and Squamish.
- Dense forest.
- Downhill trails.
- Rental workshop.
- Shuttle hub.

These selections should change the environment imagery and presentation only.

The mathematical content and difficulty must remain the same.

## 7. Operations Headquarters

Create a persistent operations dashboard.

The student's main environment should resemble a professional bike park control center.

### Primary departments

**1. Uplift Operations**

Displays:
- Shuttle pricing plans.
- Number of rides.
- Cost comparisons.
- Shuttle package information.

**2. Rental Fleet**

Displays:
- Trail bikes.
- Downhill bikes.
- Rental inventory.
- Daily rental revenue.
- Fleet totals.

**3. Workshop**

Displays:
- Tire service kits.
- Brake pad sets.
- Workshop stock.
- Vendor invoices.
- Component unit prices.

**4. Trail Construction**

Displays:
- Trail material inventory.
- Soil stockpiles.
- Crew progress.
- Daily construction output.
- Project completion estimates.

### Shared interface

Include:
- Main mountain visual.
- Department navigation.
- Active mathematical challenge.
- Progress indicator.
- Math Workbench.
- Hint system.
- Operations summary.

The student should see their progress toward opening the park.

---

# PART III — THE FOUR LEARNING STAGES

# STAGE 01: THE UPLIFT SHOWDOWN
## Graphing Systems

## 8. Mission

The park is preparing to introduce its uplift service.

Riders need to choose between two shuttle packages, and the park needs to understand how each pricing model behaves.

The student must compare two pricing plans and identify where their costs are equal.

This is the ideal introduction to solving systems graphically.

## Activity 1 — Choose Your Uplift Plan

Introduce two fictional shuttle pricing options.

### Plan A: Pay As You Ride

- $12 initial booking fee.
- $8 for every additional shuttle ride.

Equation:

`C = 8r + 12`

### Plan B: Mountain Pass

- $36 initial pass fee.
- $4 for every additional shuttle ride.

Equation:

`C = 4r + 36`

Where:
- C = total cost in dollars.
- r = number of shuttle rides.

Ask:

"How many shuttle rides would make both plans cost exactly the same amount?"

Students should understand that the answer is the intersection of two lines.

## Activity 2 — The Live Pricing Graph

This is the signature interaction for Stage 01.

Build an interactive coordinate plane with:
- x-axis: number of shuttle rides.
- y-axis: total cost.

Graph:

`y = 8x + 12`

`y = 4x + 36`

The student should see two lines.

Highlight the intersection when both equations produce the same output.

Correct solution:

`8r + 12 = 4r + 36`

`4r = 24`

`r = 6`

Substitute:

`C = 8(6) + 12`

`C = 60`

Both plans cost $60 after six rides.

<box>Design the student-facing result as a break-even dashboard showing six rides and $60. The math should be demonstrated through the graph and the student's own interaction.</box>

Require the student to interpret:

"At six shuttle rides, both plans cost the same. Below or above six rides, one plan becomes more economical."

Teach students how to compare the equations and understand what the intersection represents.

**Important domain consideration:** Ride counts are nonnegative whole numbers. The graph may show continuous lines for mathematical understanding, but interpretations of actual shuttle usage must respect whole-number ride counts.

## Activity 3 — Explore the Pricing Plans

Give students two interactive sliders:
- Number of rides.
- Pricing plan.

When they change the number of rides:
- Both prices update.
- The graph updates.
- The cheaper option is highlighted.
- The break-even point remains visible.

Ask:
- Which plan is cheaper for three rides?
- Which plan is cheaper for ten rides?
- At what number of rides do they cost the same?
- What does the intersection mean?

Require a short explanation of why the intersection is the solution to the system.

## Activity 4 — One Solution, No Solution, Infinite Solutions

Students must understand all three possible outcomes of a system.

### A. One solution

Use the original pricing plans:

`y = 8x + 12`

`y = 4x + 36`

Two different slopes.

The lines intersect once.

There is one solution:

`(6,60)`.

### B. No solution

Introduce:

`y = 6x + 20`

`y = 6x + 30`

Both pricing plans increase at the same rate but start at different prices.

They are parallel.

There is no intersection.

There is no solution.

Explain why two parallel lines with different intercepts never become equal.

### C. Infinitely many solutions

Introduce two equivalent expressions:

`y = 8(x + 2)`

`y = 8x + 16`

Show that they are exactly the same relationship.

Their graphs lie directly on top of one another.

Every point on the line is a solution.

There are infinitely many solutions.

## Activity 5 — The Uplift Strategy Challenge

Give students several competing package options.

They must:
- Write both equations.
- Graph both relationships.
- Find the intersection.
- Identify the solution type.
- Determine which pricing option is cheaper at a selected number of rides.

Include new values in the question bank so students cannot rely on remembering the first example.

### Stage completion

Award:

`UPLIFT STRATEGIST` badge.

---

# STAGE 02: BUILD THE RENTAL FLEET
## Substitution

## 9. Mission

The rental department needs a fleet of bikes ready for opening day.

The park offers two categories:

- Trail bikes.
- Downhill bikes.

The student knows the total number of bikes in the fleet and the total expected rental revenue for one day.

They need to figure out how many bikes of each type the park should stock.

This creates a very natural substitution problem.

## Activity 1 — The Rental Fleet Inventory

The park has:

- 18 rental bikes in total.
- Trail bikes rent for $60 per day.
- Downhill bikes rent for $90 per day.
- A target of $1,260 in total daily rental revenue when every bike is rented.

Define:

- x = number of trail bikes.
- y = number of downhill bikes.

The equations are:

`x + y = 18`

`60x + 90y = 1260`

Ask:

"How many of each bike type should the rental department have?"

## Activity 2 — The Substitution Workshop

Visually show the first equation:

`x + y = 18`

Ask the student:

"Can you rearrange this equation to express one variable in terms of the other?"

Correct:

`x = 18 - y`

Now substitute into the second equation:

`60(18 - y) + 90y = 1260`

Simplify:

`1080 - 60y + 90y = 1260`

`30y = 180`

`y = 6`

Find x:

`x = 18 - 6`

`x = 12`

Final result:
- 12 trail bikes.
- 6 downhill bikes.

## Activity 3 — Verify the Fleet

Require students to check both original equations.

Equation 1:

`12 + 6 = 18`

Equation 2:

`60(12) + 90(6) = 1260`

Both are true.

Animate the fleet being arranged into two categories.

Show the daily revenue:
- Trail bike revenue: $720.
- Downhill bike revenue: $540.
- Total revenue: $1,260.

Explain that both original conditions must be satisfied.

## Activity 4 — Choose What to Substitute

Give students several systems where either variable could be isolated.

Example:

`x + 2y = 16`

`x = 4y - 2`

The student should recognize that the second equation already has x isolated.

Substitute:

`(4y - 2) + 2y = 16`

`6y - 2 = 16`

`6y = 18`

`y = 3`

`x = 10`

Additional examples should gradually include negative coefficients and fractional solutions.

## Activity 5 — Build the Rental Fleet Challenge

Present a new fleet problem:

A bike rental company stocks 20 bikes.

Trail bikes generate $50 per rental day and freeride bikes generate $80 per rental day.

The expected total revenue is $1,240 if every bike is rented.

Write:

`x + y = 20`

`50x + 80y = 1240`

Let students construct the system, choose a variable to isolate, substitute, solve and verify.

Correct answer:
- 12 trail bikes.
- 8 freeride bikes.

### Stage completion

Award:

`FLEET MANAGER` badge.

---

# STAGE 03: STOCK THE WORKSHOP
## Elimination

## 10. Mission

The park's bike workshop is preparing for opening day.

The mechanic needs to order tubeless service kits and brake pad sets.

The supplier has sent two different invoices containing different combinations of the same items.

The student must calculate the unknown unit prices.

This is an ideal application of elimination.

## Activity 1 — The Workshop Invoices

Define:

- x = price of one tubeless tire service kit.
- y = price of one brake pad pair.

The supplier sends two invoices.

Invoice A:
- Two tubeless service kits.
- Three brake pad pairs.
- Total: $310.

Equation:

`2x + 3y = 310`

Invoice B:
- Four tubeless service kits.
- Three brake pad pairs.
- Total: $470.

Equation:

`4x + 3y = 470`

Ask:

"Can you figure out the price of each item using both invoices?"

## Activity 2 — Eliminate the Brake Pad Variable

Show the equations vertically:

`2x + 3y = 310`

`4x + 3y = 470`

Highlight the matching `3y` terms.

Ask the student what happens if they subtract the first equation from the second.

Subtract:

`2x = 160`

Therefore:

`x = 80`

Now substitute into the first equation:

`2(80) + 3y = 310`

`160 + 3y = 310`

`3y = 150`

`y = 50`

Final answers:
- Tubeless service kit: $80.
- Brake pad pair: $50.

## Activity 3 — The Mechanic's Order Verification

Ask students to verify both invoices.

Invoice A:

`2(80) + 3(50) = 310`

Invoice B:

`4(80) + 3(50) = 470`

Both totals are correct.

Show the workshop inventory updating with the calculated prices.

## Activity 4 — When Coefficients Do Not Match

Now introduce a more advanced challenge.

Two different service orders are provided.

`3x + 2y = 260`

`2x + 3y = 240`

The coefficients do not initially line up.

The student must multiply equations to create matching terms.

Multiply the first equation by 3:

`9x + 6y = 780`

Multiply the second equation by -2:

`-4x - 6y = -480`

Add:

`5x = 300`

Therefore:

`x = 60`

Substitute back:

`3(60) + 2y = 260`

`180 + 2y = 260`

`y = 40`

Teach that elimination can require multiplying one or both equations before adding or subtracting.

## Activity 5 — Elimination or Substitution?

Present several different systems.

Students must choose which method they think is most efficient.

Examples:
- Matching coefficients.
- A variable already isolated.
- Equations containing simple integer coefficients.
- Systems with negative coefficients.
- Systems where graphing gives a clear intersection.

Do not require the same solution method for every problem.

Teach that multiple methods can lead to the same correct solution, but some are more efficient in particular situations.

### Stage completion

Award:

`WORKSHOP COMMANDER` badge.

---

# STAGE 04: RUN THE MOUNTAIN
## Applications of Systems of Equations

## 11. Mission

The entire mountain bike destination is approaching opening day.

The student now needs to solve several major operational problems using systems of equations.

This stage should combine the previous three methods and develop real-world mathematical modeling skills.

Build three main applications:
1. Trail surface mixture.
2. Trail crew production rates.
3. Uplift pricing and break-even analysis.

## Activity 1 — Mix the Perfect Dirt

This should be one of the most memorable activities in the lab.

Introduce a real-world connection to bike park construction.

Some pump-track construction specifications use a compacted surface mix containing 70% clay and 30% sand.

A published City of Davis pump-track construction specification includes this 70/30 mixture. It is a specific project specification, not a universal recommendation for every bike park.

The student has two fictional soil stockpiles:

**Stockpile A**
- 90% clay.
- 10% sand.

**Stockpile B**
- 50% clay.
- 50% sand.

The trail crew needs ten cubic yards of material containing 70% clay.

Question:

"How many cubic yards should be taken from each stockpile?"

Define:
- x = cubic yards from Stockpile A.
- y = cubic yards from Stockpile B.

Total material:

`x + y = 10`

Clay content:

`0.90x + 0.50y = 7`

Why 7?

Because 70% of ten cubic yards is seven cubic yards of clay.

Solve using substitution:

`y = 10 - x`

Substitute:

`0.90x + 0.50(10 - x) = 7`

`0.90x + 5 - 0.50x = 7`

`0.40x = 2`

`x = 5`

Therefore:

`y = 5`

Final mixture:
- Five cubic yards from Stockpile A.
- Five cubic yards from Stockpile B.

### Visual interaction: Dirt Mixing Station

Create an illustrated materials mixing interface.

Show:
- Stockpile A.
- Stockpile B.
- Mixing container.
- Final surface blend.

Allow students to adjust the quantities.

Display:
- Total cubic yards.
- Clay volume.
- Sand volume.
- Final percentage.
- Whether the requested mixture has been achieved.

The target is 70% clay and 30% sand for this particular fictional exercise.

The system should show why both the total-volume equation and the clay-content equation must be satisfied.

**Important:** These are instructional stockpile compositions and a simplified volume-based model. Real surface specifications, soil properties, compaction and drainage must be professionally assessed and approved. Do not present the classroom mixture as a universal trail-building formula.

## Activity 2 — The Trail Crew Showdown

Introduce a realistic construction planning challenge.

Two crews are working on the same planned trail segment.

Crew A:
- Has already completed 300 feet.
- Continues building at a modeled rate of 120 feet per day.

Crew B:
- Starts at zero.
- Builds at a modeled rate of 160 feet per day.

Question:

"When will Crew B catch up with Crew A?"

Define:
- t = days.
- D = total trail length completed.

Crew A:

`D = 300 + 120t`

Crew B:

`D = 160t`

Set equal:

`300 + 120t = 160t`

`300 = 40t`

`t = 7.5 days`

Calculate the completed distance:

`D = 160(7.5)`

`D = 1200 feet`

The two crews have completed 1,200 feet after 7.5 days.

Interpretation:
- Crew A started with a 300-foot lead.
- Crew B works faster.
- Crew B eventually catches up.

The fixed production rates are hypothetical instructional values. IMBA guidance reports broad daily production ranges for different crew sizes and emphasizes that terrain, soil, experience and trail type can significantly affect output.

### Visual interaction: Crew Progress Simulator

Create two animated progress bars.

The student adjusts the daily production rate of each crew.

The system updates:
- Total progress by day.
- Two progress lines.
- The intersection point.
- Time to catch up.
- Total feet completed.

Let students predict when Crew B will catch up before revealing the graph.

This should introduce a particularly clear relationship between two linear equations.

## Activity 3 — Uplift Break-Even Challenge

Bring back the shuttle service from Stage 01.

Present two different pricing models.

Plan A:

`C = 12 + 8r`

Plan B:

`C = 36 + 4r`

Ask:

"At how many rides will both plans cost the same?"

Students must solve:

`12 + 8r = 36 + 4r`

`4r = 24`

`r = 6`

Both cost $60.

Give new scenarios where:
- A fixed fee is higher but the per-ride rate is lower.
- One plan has a lower fixed fee but a higher per-use cost.
- Two plans have identical variable rates.
- Two equations represent the same pricing model.

Students should identify break-even points and compare the results.

## Activity 4 — The Operations Method Challenge

Give students a collection of new real-world problems.

Require them to determine:
1. What the two unknowns represent.
2. What the two equations should be.
3. Which solving method is most appropriate.
4. What the answer means.
5. Whether the answer satisfies both original equations.

Include:
- Rental fleet quantities.
- Component order prices.
- Trail material mixtures.
- Crew production rates.
- Uplift pricing.

The student should not be told which method to use initially.

This is where they demonstrate that they understand graphing, substitution and elimination as different strategies for solving systems.

### Stage completion

Award:

`MOUNTAIN OPERATIONS DIRECTOR` badge.

---

# PART IV — FINAL PROJECT

## 12. Opening Day Command Center

After all four stages, return the student to the Operations Headquarters.

They have now solved the major problems preventing the park from opening.

Build a final operations dashboard showing:

### Uplift Operations
- Selected shuttle plan.
- Break-even ride count.
- Cost comparison.

### Rental Fleet
- Number of trail bikes.
- Number of downhill bikes.
- Daily rental revenue.

### Workshop
- Component prices.
- Restock order.
- Verified invoices.

### Trail Construction
- Final soil stockpile quantities.
- Mixture percentage.
- Crew completion timelines.

### Operations Approval

The student must review all four departments and confirm that their calculations satisfy the original conditions.

Give them a final celebration screen:

**THE MOUNTAIN IS OPEN.**

"The shuttle fleet is ready. The rental bikes are stocked. The workshop is prepared. The trail crews have everything they need.

You've solved the systems, balanced the operation and gotten the mountain ready for riders."

Display all four achievement badges.

---

# PART V — FINAL CERTIFICATION

## 13. Mountain Operations Certification

Build a final assessment with 10 questions.

Suggested distribution:

| Topic | Questions |
|---|---:|
| Graphing Systems | 3 |
| Substitution | 2 |
| Elimination | 2 |
| Applications of Systems | 3 |

The assessment should require students to:
- Graph two linear equations.
- Identify a system's number of solutions.
- Interpret an intersection.
- Solve by substitution.
- Select which variable to isolate.
- Verify solutions in both equations.
- Solve by elimination.
- Scale equations before elimination.
- Construct a system from a written situation.
- Solve a mixture, rate or break-even problem.

Use different contexts and values from the guided activities.

Mix response types:
- Graphing.
- Numeric entry.
- Equation creation.
- Drag-and-drop transformations.
- Multiple choice.
- Short written explanations.

### Results screen

Show:
- Overall score.
- Accuracy by topic.
- First-attempt accuracy.
- Method-selection performance.
- Hints used.
- Independent problem solving.
- Misconceptions.
- Review recommendations.
- Four achievement badges.

Provide:
- `REVISIT A DEPARTMENT`
- `RETRY CERTIFICATION`
- `VIEW OPENING DAY DASHBOARD`

Award:

`CERTIFIED BIKE PARK OPERATIONS DIRECTOR`

---

# PART VI — SHARED LEARNING SYSTEMS

## 14. Prediction-first learning

Use prediction-first interactions where appropriate.

Examples:
- Where will two pricing lines intersect?
- Which rental fleet distribution satisfies both constraints?
- Which variable would be easiest to eliminate?
- How much of each soil stockpile is needed?
- When will the second crew catch the first?

Ask students to commit to a prediction before revealing the correct solution.

Do not overuse prediction requirements.

## 15. Explore Mode

Provide a free-play simulation.

Students should be able to:
- Adjust shuttle prices.
- Adjust fixed fees.
- Change per-ride costs.
- Change fleet sizes.
- Change rental rates.
- Modify inventory combinations.
- Adjust mixture compositions.
- Change crew production rates.

Both equations and visualizations should update where applicable.

Explore Mode should not penalize the student for experimentation.

## 16. Challenge Mode

Structured learning challenges should contain:
- An operational problem.
- Known quantities.
- Two unknown variables.
- A prompt to create the equations.
- A solving method.
- A final interpretation.

Difficulty should increase progressively.

Award points for:
- Correct equation setup.
- Correct solving steps.
- Correct final answer.
- Successful verification.
- Clear mathematical reasoning.

Do not award full mastery based exclusively on a guessed answer.

## 17. Math Workbench

Reuse the existing Mathlete Math Workbench.

### Simple mode

Show:
- What a system of equations is.
- The meaning of each variable.
- The two original equations.
- A plain-language explanation.
- A visual example.

### Advanced mode

Show:
- Both equations.
- Each algebraic transformation.
- Substitution or elimination steps.
- Graphical interpretation.
- Verification.
- Common errors.

The Math Workbench must update based on the active challenge.

## 18. Progressive hint system

Example:

System:

`x + y = 18`

`60x + 90y = 1260`

Hint 1:

"What do x and y represent? Look at the information you know about the total number of rental bikes."

Hint 2:

"Can you isolate x in the first equation?"

Hint 3:

"Substitute `18 - y` in place of x in the second equation."

Reveal:

`60(18 - y) + 90y = 1260`

Hints should progressively reveal the reasoning without immediately giving the answer.

## 19. Meaningful feedback

Correct response:

"Exactly! You found the number of each rental bike type that satisfies both the total fleet size and the daily revenue target."

Incorrect response:

"Not quite. Remember that the solution must make both equations true, not just one."

For elimination:

"Your goal is to create matching coefficients so that one variable disappears when you add or subtract the equations."

Feedback should focus on mathematical thinking.

## 20. Tutor Mode

Integrate existing Mathlete Tutor Mode.

Tutors should be able to:
- Open any department.
- Select a problem.
- Guide equation setup.
- Reveal hints.
- Hide solutions.
- Demonstrate alternative solving methods.
- Review student calculations.
- Review student explanations.

Preserve existing tutoring functionality.

## 21. Session reporting

At the end of each session report:
- Questions attempted.
- Questions correct.
- First-attempt accuracy.
- Accuracy by solving method.
- Equation setup accuracy.
- Verification accuracy.
- Hints used.
- Common misconceptions.
- Independent performance.
- Suggested review activities.

Use the existing Mathlete reporting architecture.

---

# PART VII — VISUAL AND INTERACTION DESIGN

## 22. Art direction

The interface should look like a modern mountain bike destination's operations headquarters.

Take inspiration from:
- Blue Derby shuttle hubs.
- LAAX mountain infrastructure.
- Bike rental workshops.
- Downhill trail facilities.
- Pump tracks.
- Trail construction depots.
- Professional MTB service departments.

Use the established Mathlete MTB brand.

### Stage environments

**Uplift Operations**
- Shuttle terminal.
- Riders loading bikes.
- Uplift pricing board.
- Cost comparison graph.

**Rental Fleet**
- Workshop with rows of bikes.
- Trail bike and downhill bike categories.
- Rental fleet inventory.
- Revenue dashboard.

**Workshop**
- Mechanic workbench.
- Component shelves.
- Service orders.
- Vendor invoices.

**Trail Construction**
- Dirt stockpiles.
- Trail crew.
- Material mixing station.
- Construction progress board.

### Visual interaction requirements

Use:
- Interactive equations.
- Graph intersections.
- Live-updating calculations.
- Inventory counters.
- Visual material mixing.
- Progress bars.
- Crew progress graphs.
- Animated system-solving steps.

Keep the mathematical content prominent and readable.

Use lightweight SVG and CSS interactions instead of unnecessarily complex 3D environments.

## 23. Graphing interface

The graphing engine is central to Stage 01 and should be reused elsewhere.

Support:
- Two simultaneous linear equations.
- Two different slopes.
- Different y-intercepts.
- Intersection detection.
- Parallel lines.
- Coincident lines.
- Coordinate reading.
- Dynamic line updates.
- Contextual axis labels.
- Restrictions for meaningful input values.

The student should be able to adjust system parameters and see the graphical solution change.

Do not rely on visual intersection alone for accuracy.

Calculate the algebraic intersection independently and use the graph as its representation.

## 24. Responsive design

Desktop:
- Operations headquarters.
- Main visual scene.
- Active challenge.
- Graph or application visualization.
- Math Workbench.

Mobile:
- Vertically stacked interface.
- Responsive graphs.
- Large touch targets.
- Tap-to-select interaction instead of mandatory drag-and-drop.
- Clear equations.
- Accessible Math Workbench.

Support keyboard navigation and accessible labels.

---

# PART VIII — TECHNICAL IMPLEMENTATION

## 25. Repository inspection

Before implementation, inspect the existing Mathlete MTB codebase.

Identify:
- Framework and route conventions.
- Existing graphing engine.
- Existing Math Workbench.
- Question-bank architecture.
- Feedback and hint systems.
- Progress persistence.
- Tutor Mode.
- Session reporting.
- Authentication and membership permissions.
- Previous algebra labs.

Reuse shared components.

Do not create a separate application.

Do not duplicate existing graphing or mathematical functionality.

Preserve existing course functionality.

## 26. Suggested component architecture

Adapt to the actual repository.

```text
Uplift/
│
├── UpliftApp
│
├── OperationsHQ/
│   ├── DestinationSelector
│   ├── OperationsDashboard
│   ├── DepartmentNavigation
│   └── OpeningDayProgress
│
├── Stage01_UpliftShowdown/
│   ├── ShuttlePricingPlans
│   ├── SystemsGraph
│   ├── IntersectionVisualizer
│   ├── SolutionClassifier
│   └── PricingChallenge
│
├── Stage02_RentalFleet/
│   ├── FleetInventory
│   ├── SubstitutionWorkbench
│   ├── RentalRevenue
│   └── FleetVerification
│
├── Stage03_Workshop/
│   ├── WorkshopInvoices
│   ├── EliminationWorkbench
│   ├── CoefficientScaler
│   └── MethodSelector
│
├── Stage04_RunTheMountain/
│   ├── SoilMixingStation
│   ├── CrewProgressSimulator
│   ├── RateProblemSolver
│   └── OperationsChallenge
│
├── Shared/
│   ├── MathWorkbench
│   ├── QuestionEngine
│   ├── HintSystem
│   ├── FeedbackPanel
│   ├── ProgressTracker
│   └── SessionReporter
│
└── Certification/
    ├── FinalAssessment
    ├── OperationsDashboard
    ├── AchievementBadges
    └── ResultsSummary
```

These are suggested component responsibilities rather than mandatory filenames.

## 27. Question-bank architecture

Keep question content separate from the UI.

Every question should support:
- Unique ID.
- Stage.
- Learning objective.
- Difficulty.
- MTB scenario.
- Variable definitions.
- First equation.
- Second equation.
- Correct solution.
- Accepted answer formats.
- Solution method.
- Step-by-step solution.
- Verification.
- Progressive hints.
- Misconception tags.
- Feedback.
- Units where applicable.

Support question generation using new coefficients and values, while retaining independently validated solutions.

## 28. Mathematical engine

All solving must be deterministic and testable.

Do not use JavaScript `eval()` on student-generated expressions.

Support:
- Linear equation parsing.
- Two-variable systems.
- Graphical solutions.
- Substitution.
- Elimination.
- Coefficient scaling.
- Equation verification.
- Mixture modeling.
- Constant-rate modeling.
- Break-even calculations.
- One-solution systems.
- No-solution systems.
- Infinitely-many-solution systems.

### System-solving logic

For two equations:

`a1x + b1y = c1`

`a2x + b2y = c2`

The solver should correctly distinguish:

**One solution:** The equations represent distinct intersecting lines.

**No solution:** The equations have the same slope but different intercepts.

**Infinitely many solutions:** Both equations represent the same line.

Do not interpret every failed numerical solve as automatically meaning no solution.

The classification should be based on the mathematical structure of the two equations.

### Verification

Every final answer must be substituted into both original equations.

Show the verification to students where appropriate.

For decimal or fractional solutions, use suitable precision or exact arithmetic.

### Graphing accuracy

Graph intersections must be derived mathematically, not approximated by screen pixels.

Keep the displayed graph coordinates consistent with the equation solver.

---

# PART IX — MATHEMATICAL QUALITY ASSURANCE

## 29. Required automated tests

Test every core example.

### Graphing systems

System 1:

`C = 8r + 12`

`C = 4r + 36`

Expected:
- r = 6.
- C = 60.
- One solution: (6,60).

System 2:

`y = 6x + 20`

`y = 6x + 30`

Expected:
- No solution.

System 3:

`y = 8(x + 2)`

`y = 8x + 16`

Expected:
- Infinitely many solutions.

### Substitution

`x + y = 18`

`60x + 90y = 1260`

Expected:
- x = 12.
- y = 6.

Verification:
- `12 + 6 = 18`.
- `60(12) + 90(6) = 1260`.

Test second fleet:

`x + y = 20`

`50x + 80y = 1240`

Expected:
- x = 12.
- y = 8.

### Elimination

System 1:

`2x + 3y = 310`

`4x + 3y = 470`

Expected:
- x = 80.
- y = 50.

System 2:

`3x + 2y = 260`

`2x + 3y = 240`

Expected:
- x = 60.
- y = 40.

Verify both equations in each case.

### Mixture

`x + y = 10`

`0.90x + 0.50y = 7`

Expected:
- x = 5.
- y = 5.
- Total volume = 10 cubic yards.
- Clay volume = 7 cubic yards.
- Final clay percentage = 70%.
- Final sand percentage = 30%.

### Rate

`D = 300 + 120t`

`D = 160t`

Expected:
- t = 7.5 days.
- D = 1200 feet.

### Break-even

`12 + 8r = 36 + 4r`

Expected:
- r = 6.
- Cost = $60.

## 30. Common misconception testing

Test specifically for:
- Confusing the x- and y-coordinates of an intersection.
- Assuming every system has a solution.
- Confusing no solution with infinitely many solutions.
- Finding an intersection without interpreting it.
- Isolating a variable incorrectly.
- Substituting an expression without parentheses.
- Solving only one equation instead of both.
- Failing to verify the solution in both equations.
- Adding equations when coefficients should first be aligned.
- Multiplying only one side of an equation when scaling.
- Changing signs incorrectly during subtraction.
- Mixing up mixture quantity and mixture concentration.
- Mixing up miles per hour and hours in rate problems.
- Interpreting a fractional number of bikes or packages without checking the context.

## 31. End-to-end testing

Test:
- Opening screen.
- Environment selection.
- Operations dashboard.
- Shuttle pricing graph.
- One/no/infinite-solution classification.
- Dynamic equation changes.
- Rental fleet system.
- Substitution workflow.
- Both-equation verification.
- Workshop invoices.
- Elimination workflow.
- Coefficient scaling.
- Method selection.
- Soil mixing visualization.
- Trail crew progress simulator.
- Rate problem.
- Progressive hints.
- Feedback.
- Stage progression.
- Tutor Mode.
- Session summary.
- Final certification.
- Progress persistence.
- Desktop and mobile responsiveness.
- Accessibility.

---

# PART X — DEVELOPMENT ROADMAP

## 32. Recommended implementation sequence

### Phase 1 — Repository and architecture

Inspect the existing Mathlete MTB codebase.

Build the main Uplift Operations HQ and four-stage navigation.

Establish reusable system-solving and graphing components.

### Phase 2 — Uplift Showdown

Build the pricing comparison graph.

Implement:
- Two-equation visualization.
- Intersection detection.
- One/no/infinite solution cases.
- Break-even interpretation.

Make this the polished visual centerpiece.

### Phase 3 — Rental Fleet

Build:
- Fleet inventory.
- Two-variable system setup.
- Substitution walkthrough.
- Solution checking.
- Dynamic fleet visualization.

### Phase 4 — Workshop

Build:
- Invoice visualization.
- Elimination.
- Coefficient scaling.
- Method selection.
- Parts inventory.

### Phase 5 — Run the Mountain

Build:
- Dirt mixture calculator.
- Trail crew progress graph.
- Rate comparison.
- Application problem engine.

### Phase 6 — Shared learning systems

Integrate:
- Math Workbench.
- Guided learning.
- Hints.
- Feedback.
- Tutor Mode.
- Progress tracking.
- Session reporting.

### Phase 7 — Certification and final project

Build the opening-day operations dashboard, final assessment, achievement badges and summary.

### Phase 8 — Testing and integration

Run mathematical tests.

Test all interactions on desktop and mobile.

Verify existing Mathlete functionality has not regressed.

---

# PART XI — COURSE INTEGRATION

## 33. Connect to the four Algebra 1 course pages

The lab must integrate with:

1. `/classes/algebra-1/graphing-systems/`
2. `/classes/algebra-1/substitution/`
3. `/classes/algebra-1/elimination/`
4. `/classes/algebra-1/applications-of-systems/`

Use existing Mathlete navigation and course-page patterns.

Where practical, each course page should link to its corresponding stage.

Preserve existing authentication, membership access, student progress and unrelated course content.

---

# PART XII — DEFINITION OF DONE

## 34. Release acceptance criteria

The lab is ready for release when:

- The student can enter Uplift Operations HQ.
- All four learning stages function.
- All three graphing system classifications are explained and interactive.
- Students can identify and interpret intersections.
- The shuttle comparison graph updates correctly.
- Students can solve systems by substitution.
- Students can check their solutions in both equations.
- Students can solve systems by elimination.
- Students can multiply equations to align coefficients.
- Students can choose an appropriate solving method.
- The soil mixture problem works.
- The trail crew rate problem works.
- Break-even and comparison problems are included.
- All mathematical examples pass automated tests.
- The Math Workbench works.
- Hints and feedback work.
- Explore and Challenge modes work.
- Tutor Mode works.
- Progress persistence works.
- Session reports work.
- Final certification works.
- The opening-day operations dashboard is complete.
- Desktop and mobile experiences function.
- Accessibility requirements are satisfied.

## 35. Non-goals and boundaries

This is an Algebra 1 educational simulation, not an actual bike park management or construction tool.

Do not:
- Use actual customer payment information.
- Integrate live commercial shuttle booking systems.
- Present fictional shuttle prices as real commercial pricing.
- Treat a particular pump-track soil specification as universal.
- Present fictional stockpile percentages as actual construction advice.
- Treat crew productivity as guaranteed daily output.
- Introduce advanced operational engineering unnecessarily.
- Duplicate existing Mathlete functionality.
- Prioritize visual effects over mathematical understanding.

All fictional prices, quantities and rates should be clearly labelled as instructional scenarios.

Use real MTB imagery and operational references to make the environment authentic.

---

# FINAL PRODUCT STANDARD

The student should finish Uplift having run an imaginary mountain bike destination from opening-day planning through its first operational decisions.

They should understand systems by comparing the two shuttle plans.

They should understand substitution by organizing the rental fleet.

They should understand elimination by solving the workshop invoices.

They should understand applications of systems by mixing materials, planning construction and solving real-world rate problems.

Most importantly, the student should understand that a system of equations finds the combination of values that satisfies two conditions at the same time.

**The ultimate goal: Make algebra feel like a skill that someone running a real mountain bike destination would actually need.**

Build something a young mountain biker would genuinely enjoy exploring, with mathematical quality that makes it a powerful Algebra 1 learning experience.