# PRD: MATHLETE MTB — ALGEBRA 2
# RACE-DAY WORKSHOP: EQUATIONS & INEQUALITIES

**Product:** Mathlete MTB  
**Feature:** Race-Day Workshop  
**Course:** Algebra 2  
**Unit:** Unit 1 — Equations and Inequalities  
**Topic:** Solving Equations and Modeling Constraints  
**Activity Type:** Interactive Learning Lab / Simulation / Mission-Based Game  
**Target Audience:** High-school Algebra 2 students  
**Estimated Completion:** 20–25 minutes  
**Priority:** First Algebra 2 flagship lesson

---

# 1. PRODUCT VISION

## The Big Idea

Build an interactive mountain biking race-preparation workshop where students learn Algebra 2 by taking on the responsibilities of a mountain bike race team's technical crew.

They have an upcoming enduro race to prepare for.

Before the rider can head out, the team needs to:

1. Calculate and evaluate the suspension setup.
2. Analyze race-stage timing and speed requirements.
3. Survey a section of terrain and calculate its elevation change.

Each task introduces a different type of equation or inequality.

The student must apply mathematical reasoning to complete the workshop.

This is not intended to look or feel like a traditional algebra worksheet.

It should feel like an interactive mountain biking workshop, complete with bike setup visuals, race telemetry, trail maps, interactive controls, and progressively challenging missions.

## Core Educational Philosophy

Students should discover that equations are tools for understanding and solving problems.

The mountain biking scenario should create a genuine reason to use the mathematics.

The activity should follow this progression:

**Real-world problem → Mathematical model → Experimentation → Equation solving → Interpretation → Independent challenge.**

The ultimate outcome is for students to understand not only how to solve an equation, but also why the solution matters.

---

# 2. CURRICULUM ALIGNMENT

Place the resource within:

Classes → Algebra 2 → Unit 1: Equations and Inequalities → Solving Equations and Modeling Constraints.

Associate the resource with the following skills:

### Primary Skills

1. Rearranging formulas.
2. Solving equations in one variable.
3. Solving absolute value equations.
4. Solving absolute value inequalities.
5. Solving compound inequalities.
6. Solving rational equations.
7. Solving radical equations.
8. Identifying and checking extraneous solutions.
9. Interpreting solutions in real-world situations.

### Optional Extension Skills

10. Solving quadratic equations with complex solutions.
11. Recognizing when an equation has no real-world solution.
12. Applying domain restrictions to mathematical models.

### Learning Objectives

By completing the lesson, students should be able to:

- Translate real-world scenarios into mathematical equations.
- Rearrange formulas to isolate an unknown variable.
- Solve equations and inequalities algebraically.
- Understand absolute value as distance from a target.
- Use compound inequalities and interval notation.
- Solve equations involving variables in denominators.
- Solve equations involving square roots.
- Substitute solutions into original equations to verify them.
- Determine whether an algebraic solution makes sense in its original context.

---

# 3. EXPERIENCE DESIGN

## Overall Theme

**RACE-DAY WORKSHOP**

Opening screen:

# YOUR RACE. YOUR SETUP. YOUR MATH.

"You've joined the technical crew for an upcoming enduro race. The rider is ready, the bike is almost dialed, and the stage is waiting.

But before the team heads out, there are a few problems to solve.

Your job: use mathematics to get the team race-ready."

Display a stylized mountain biking workshop environment.

Visual elements:
- Mountain bike on a work stand.
- Suspension components.
- Shock pump and mechanical tools.
- Race helmet and riding gear.
- A race-stage map.
- Digital telemetry displays.

Provide a prominent button:

**ENTER THE WORKSHOP**

## Mission Progression

Display a mission board containing three main stations:

1. Suspension Setup.
2. Race Timing.
3. Trail Survey.

Each mission should have a short description and a completion indicator.

Completing all three unlocks the final Race-Day Challenge.

Allow students to revisit completed missions.

Display an overall progress indicator throughout the experience.

---

# 4. MISSION 1 — DIAL IN YOUR SUSPENSION

**Mathematical Focus:** Rearranging formulas, equations, absolute value equations, and inequalities.

**Estimated Time:** 7–9 minutes.

**Importance:** This should be the centerpiece of the lesson.

## The Scenario

"You've got a new bike ready for race day, but the suspension setup needs to be checked.

The team's mechanic needs to measure suspension sag and determine whether the current setup falls within the specified range.

Can you calculate the correct measurements and verify the setup?"

Introduce the concept of sag.

Explanation:

"Sag is the amount your suspension compresses when you're sitting on the bike in your normal riding position. It is expressed as a percentage of the suspension's total travel."

Use an educational bike suspension illustration showing:

- Fully extended shock.
- Compressed shock.
- Total shock stroke.
- Sag measurement.
- Percentage of travel.

Make the difference between shock stroke and rear-wheel travel clear.

## The Real-World Data

Use a clearly identified example based on FOX's 2027 FLOAT shock documentation.

For this fictional bike:

- Total shock stroke: 60 mm.
- Specified sag range: 25–30%.

FOX specifies a 25–30% sag range for the referenced FLOAT shock. Actual suspension configurations and recommended settings vary, so the scenario must not be presented as a universal setting for every bike.

Link to the relevant manufacturer's documentation in the activity's optional reference section.

## Learning Module A — Solve the Sag Equation

Introduce:

\[
\text{Sag Percentage}=
\frac{\text{Measured Sag}}{\text{Total Shock Travel}}\times100
\]

Define:

- s = measured sag in millimeters.
- T = total shock stroke in millimeters.
- p = sag percentage.

Ask:

"If the shock has 60 mm of travel, how many millimeters of compression correspond to 25% sag?"

Display the equation:

\[
25=\frac{s}{60}\times100
\]

Guide students through the solution:

\[
0.25(60)=s
\]

\[
s=15\text{ mm}
\]

Then ask them to calculate the upper boundary:

\[
0.30(60)=18\text{ mm}
\]

**The acceptable mathematical range for this scenario is 15–18 mm.**

### Interactive Component: Sag Calculator

Build an interactive suspension setup simulator.

Display a stylized rear shock with an adjustable sag indicator.

Allow the student to change the measured sag using a slider.

Suggested range: 8–25 mm.

As they move the slider:
- The visual shock compression changes.
- The measured sag updates.
- The calculated sag percentage updates.
- A graphical indicator shows whether the measurement is within the specified range.
- The corresponding equation updates.

Display:

| Measurement | Live value |
|---|---|
| Total shock stroke | 60 mm |
| Measured sag | Dynamic |
| Sag percentage | Dynamic |
| Required range | 25–30% |
| Status | Within / Outside range |

Use a green zone for acceptable measurements and a contrasting warning treatment for measurements outside the range.

The student should be able to experiment before answering questions.

### Guided Question

"The mechanic measures 17 mm of sag.

What percentage of the total shock travel is being used?"

Solution:

\[
\frac{17}{60}\times100=28.33\%
\]

The measurement falls within the specified 25–30% range.

Explain why.

### Independent Challenge

Change the total shock stroke to 80 mm.

The target sag percentage remains 25–30% for this mathematical practice scenario.

Ask students to independently determine the allowable sag measurement range.

Expected answer:

\[
0.25(80)=20
\]

\[
0.30(80)=24
\]

Answer: 20–24 mm.

This tests whether students understand how to apply the equation with different values.

---

## Learning Module B — Absolute Value: How Far From the Target?

Title:

**"How Close Are You to the Perfect Setup?"**

Introduce a deeper mathematical idea.

Sometimes we aren't looking for one exact measurement. We want a result within an acceptable range of a target.

Explain absolute value as the distance between two numbers.

For this activity, use the midpoint of the manufacturer-specified range as a mathematical reference target.

The specified range is 25–30%.

The midpoint is:

\[
\frac{25+30}{2}=27.5\%
\]

The maximum allowed deviation from this midpoint is 2.5 percentage points.

This gives us the absolute value inequality:

\[
|p-27.5|\leq2.5
\]

Explain:

- p is the measured sag percentage.
- 27.5% is the midpoint of the allowed range.
- 2.5 is the maximum deviation from that midpoint.

Ask the student:

"What percentages are acceptable?"

Guide them through:

\[
-2.5\leq p-27.5\leq2.5
\]

Add 27.5 to each part:

\[
25\leq p\leq30
\]

This is the same acceptable range we calculated earlier.

Show the connection between:

- Absolute value equation.
- Absolute value inequality.
- Compound inequality.
- Number line.

### Interactive Component: The Tolerance Gauge

Build a horizontal interactive number line.

Display:
- Target: 27.5%.
- Lower boundary: 25%.
- Upper boundary: 30%.

Allow the student to drag a marker representing their measured sag percentage.

The gauge should immediately show:
- Distance from target.
- Absolute value deviation.
- Whether the measurement is acceptable.

Show a live expression:

\[
|p-27.5|=\text{calculated deviation}
\]

Then evaluate it against the 2.5 percentage-point tolerance.

### Practice Challenge

Give the student three measurements:

- 24%.
- 27%.
- 31%.

Ask which measurements satisfy the inequality.

The student must select all acceptable measurements.

Correct answer: 27% only.

Then change the challenge to:

\[
|p-27.5|=2.5
\]

Ask the student to find both boundary values.

Correct answers: 25% and 30%.

### Teaching Point

Emphasize that absolute value measures distance, not direction.

A measurement below the target and one above the target can have the same absolute deviation.

---

# 5. MISSION 2 — BEAT THE CLOCK

**Mathematical Focus:** Rational equations and inequalities.

**Estimated Time:** 5–6 minutes.

## The Scenario

"The team has entered an enduro race with a 4 km timed stage.

The rider needs to maintain an average speed of at least 16 km/h to achieve the team's target time.

The first section is complete.

Now the rider needs to figure out how fast they must ride the remaining section to meet the target."

Display a race-stage map divided into two sections.

### The Race Data

| Section | Distance | Average speed |
|---|---:|---:|
| Section 1 | 1 km | 12 km/h |
| Section 2 | 3 km | Unknown |

Overall target:
- Total distance: 4 km.
- Average speed: 16 km/h.

The question:

"What average speed must the rider maintain over the remaining 3 km to finish with an overall average speed of 16 km/h?"

## Learning Module A — Understand Average Speed

Introduce:

\[
\text{Average Speed}=
\frac{\text{Total Distance}}{\text{Total Time}}
\]

Calculate the required total time:

\[
t=\frac{4}{16}=0.25\text{ hours}
\]

Explain:

0.25 hours equals 15 minutes.

Calculate the time already spent:

\[
t_1=\frac{1}{12}\text{ hours}
\]

This equals 5 minutes.

The remaining time is:

\[
0.25-\frac{1}{12}=\frac{1}{6}
\]

The rider has 10 minutes remaining.

## Learning Module B — Solve the Rational Equation

Let v represent the average speed over the remaining 3 km.

Construct:

\[
\frac{1}{12}+\frac{3}{v}=\frac{4}{16}
\]

Guide the student through:

\[
\frac{1}{12}+\frac{3}{v}=\frac14
\]

Subtract 1/12 from each side:

\[
\frac{3}{v}=\frac16
\]

Multiply both sides by 6v, keeping the restriction v ≠ 0 in mind:

\[
18=v
\]

The required average speed is:

**18 km/h.**

Verify the answer:

- First section: 1 km at 12 km/h = 5 minutes.
- Second section: 3 km at 18 km/h = 10 minutes.
- Total: 4 km in 15 minutes.
- Average speed: 16 km/h.

### Interactive Component: Race Clock Simulator

Build a visually engaging race timing interface.

Show:
- A stylized trail-stage map.
- Two connected trail sections.
- A race timer.
- Distance completed.
- Speed for each section.
- Overall average speed.

Allow the student to manipulate the speed on the second section.

The simulator should update:
- Section completion time.
- Total time.
- Overall average speed.
- Whether the target was achieved.

Use the rider's progress along the two sections as a visual demonstration.

The mathematics should power the entire simulation.

### Learning Module C — Turn It Into an Inequality

Now introduce a slightly different race requirement.

"The rider doesn't need to finish in exactly 15 minutes. They just need to finish in 15 minutes or less."

Construct:

\[
\frac{1}{12}+\frac{3}{v}\leq\frac14
\]

Ask the student to solve it.

Since v represents a speed, the domain restriction is:

\[
v>0
\]

Subtract 1/12:

\[
\frac{3}{v}\leq\frac16
\]

Because v is positive, we can multiply both sides by v without reversing the inequality:

\[
18\leq v
\]

Therefore:

\[
v\geq18
\]

Explain the meaning:

"The rider must average at least 18 km/h over the second section to meet the target time."

### Independent Challenge

Give a new race scenario with different distances, speeds, and target times.

Students should:
1. Write the rational equation.
2. Solve for the missing speed.
3. Check their answer.
4. Interpret the result.

Use carefully selected values that produce clean, understandable answers.

---

# 6. MISSION 3 — READ THE TERRAIN

**Mathematical Focus:** Radical equations, square roots, domain restrictions, and checking solutions.

**Estimated Time:** 5–6 minutes.

## The Scenario

"The trail crew is mapping a new section of technical singletrack.

They have measured the horizontal distance between two reference points, as well as the straight-line distance along a simplified trail profile.

But they don't know the vertical elevation difference.

Your job is to calculate it."

Display a side-view trail profile.

Include:
- Horizontal distance.
- Vertical elevation change.
- Diagonal distance.
- A right triangle showing how the measurements relate.

### The Data

- Horizontal distance: 120 meters.
- Straight-line distance: 125 meters.
- Unknown signed vertical elevation change: h.

### Learning Module A — Build the Equation

Introduce the Pythagorean relationship:

\[
a^2+b^2=c^2
\]

Explain that the horizontal and vertical components form the legs of a right triangle, while the diagonal represents the straight-line distance.

Construct:

\[
\sqrt{120^2+h^2}=125
\]

Explain how this radical equation describes the terrain.

### Learning Module B — Solve the Radical Equation

Step 1: Square both sides.

\[
120^2+h^2=125^2
\]

Step 2: Simplify.

\[
14400+h^2=15625
\]

Step 3:

\[
h^2=1225
\]

Step 4: Take the square root.

\[
h=\pm35
\]

The possible signed elevation changes are:

- +35 meters: the destination is 35 meters higher.
- -35 meters: the destination is 35 meters lower.

Both satisfy the original equation because distance does not depend on direction.

This is an important interpretation lesson: the mathematical result must be interpreted in the context of what the variable represents.

### Interactive Component: Trail Survey Simulator

Display a simplified topographic or side-profile view.

The student should be able to adjust:
- Horizontal distance.
- Total straight-line distance.

The vertical elevation change should update using the radical equation.

Display:
- Triangle visualization.
- Measurement labels.
- Equation.
- Calculated elevation difference.

Include a toggle to switch between uphill and downhill interpretations.

### Learning Module C — Verify Your Solution

Teach students why they must substitute solutions back into the original equation.

Show:

\[
\sqrt{120^2+35^2}=125
\]

The equation checks out.

Do not simply tell students that the answer is correct. Show them how to verify it.

### Algebra Debugging Challenge: The Extraneous Solution

Introduce a separate, clearly labeled algebra-only practice problem.

"Your trail-mapping console has generated an equation. One of the calculated answers is a false solution. Can you find it?"

Use:

\[
\sqrt{q+9}=q-3
\]

Explain that q is a dimensionless practice variable, not a real suspension or trail measurement.

After squaring:

\[
q+9=(q-3)^2
\]

\[
q+9=q^2-6q+9
\]

\[
q(q-7)=0
\]

Possible answers:

\[
q=0,\quad q=7
\]

Now test both in the original equation.

For q = 0:

\[
\sqrt9= -3
\]

This is false.

For q = 7:

\[
\sqrt{16}=4
\]

This is true.

Therefore, q = 7 is the only valid solution.

Explain why the squaring process created a candidate that did not satisfy the original equation.

This mini-challenge should make checking solutions a fundamental habit.

---

# 7. OPTIONAL ADVANCED EXTENSION — WHEN THERE IS NO REAL SOLUTION

Include a small optional extension for students ready to explore complex solutions.

Title:

**"The Setup That Doesn't Exist"**

Display:

\[
x^2+16=0
\]

Ask the student to solve.

They discover:

\[
x^2=-16
\]

\[
x=\pm4i
\]

Explain:

"There is no real number that satisfies this equation. Complex numbers allow us to represent the algebraic solutions, even when no real-valued solution exists."

In the context of the workshop:

"The mathematical model has no real-valued setting that satisfies this particular equation."

Be explicit that imaginary numbers are not physical bike measurements.

This is an optional Algebra 2 extension, not a required part of the core workshop.

---

# 8. FINAL MISSION — RACE-DAY CERTIFICATION

Once all three missions are completed, unlock the final challenge.

The student is presented with a final race preparation briefing.

**The team is almost ready. Can you finish the calculations independently?**

Build a multi-part assessment with three sections.

## Challenge A — Suspension Setup

A different bike has a fictional shock stroke of 65 mm.

For the purposes of this scenario, use the same specified 25–30% sag range.

Ask the student to:

1. Calculate the minimum allowable sag.
2. Calculate the maximum allowable sag.
3. Write an absolute value inequality representing the acceptable range using its midpoint.
4. Evaluate a measured sag of 20.5 mm.

Correct values:

\[
0.25(65)=16.25
\]

\[
0.30(65)=19.5
\]

Acceptable range: 16.25–19.5 mm.

Midpoint:

\[
17.875\text{ mm}
\]

Tolerance:

\[
1.625\text{ mm}
\]

Inequality:

\[
|s-17.875|\leq1.625
\]

A measurement of 20.5 mm is outside the range.

## Challenge B — Race Timing

A rider completes the first 1.5 km of a 4.5 km stage at 15 km/h.

They need to achieve an overall average speed of 18 km/h.

Ask students to find the required average speed over the remaining 3 km.

Equation:

\[
\frac{1.5}{15}+\frac{3}{v}=\frac{4.5}{18}
\]

Solution:

\[
0.1+\frac3v=0.25
\]

\[
\frac3v=0.15
\]

\[
v=20\text{ km/h}
\]

## Challenge C — Trail Survey

A mapped trail segment has:
- Horizontal distance: 40 meters.
- Straight-line distance: 41 meters.

Find the possible signed vertical elevation changes.

\[
\sqrt{40^2+h^2}=41
\]

\[
h^2=1681-1600
\]

\[
h^2=81
\]

\[
h=\pm9
\]

Interpretation:
The destination is either 9 meters above or 9 meters below the starting elevation.

## Completion

Upon passing the final assessment, display:

# RACE-DAY READY

"Nice work. You've used Algebra 2 to solve suspension setup constraints, calculate race performance, and analyze mountain biking terrain."

Show:
- Missions completed.
- Skills practiced.
- Correct answers.
- Attempts.
- Final challenge score.

Record activity completion and the underlying performance data in the existing Mathlete MTB student progress system.

Do not automatically assign mastery based on passing one activity.

---

# 9. VISUAL DESIGN AND USER EXPERIENCE

This lesson should feel significantly different from a traditional school assignment.

## Visual Direction

Use the existing Mathlete MTB branding.

The aesthetic should resemble:
- A professional bike workshop.
- Enduro race team technology.
- Trail mapping software.
- A mountain biking performance dashboard.

Visual elements should include:
- Bike components.
- Suspension diagrams.
- Technical gauges.
- Race timing telemetry.
- Trail profiles.
- Topographic maps.
- Progress indicators.
- Mission cards.

Use subtle animations and interactive visualizations.

Avoid:
- Cartoonish school graphics.
- Excessive paragraphs.
- Generic worksheet layouts.
- Distracting animations.
- Unnecessary menus.

## Layout

Use a persistent top navigation containing:
- Mathlete MTB logo.
- Back to Algebra 2.
- Race-Day Workshop title.
- Progress indicator.
- Exit option.

Main content:
- Dominant interactive visualization.
- Short instructional content.
- Interactive controls.
- Mathematical working area.

On desktop, use a side-by-side layout for the visual simulation and instructional panel where practical.

On mobile, stack elements vertically and keep controls easy to access.

## Mathematics Presentation

Use readable mathematical notation.

Show equations dynamically as students manipulate inputs.

Allow students to open worked explanations instead of forcing them to read everything upfront.

Use color and labels consistently to communicate:
- Current inputs.
- Unknown variables.
- Valid ranges.
- Solutions.
- Incorrect candidate solutions.

---

# 10. FEEDBACK AND ASSESSMENT ENGINE

Every question should have meaningful instructional feedback.

Use a progressive hint system.

### Hint 1 — Direction

Give the student a conceptual clue without revealing the answer.

### Hint 2 — Relationship

Identify the formula, mathematical relationship, or operation they should consider.

### Hint 3 — Guided Step

Show the next step without completing the entire problem.

### Solution

Show the full working and explain why the answer makes sense in its MTB scenario.

## Common Misconceptions to Track

Suspension:
- Confusing sag percentage with millimeters.
- Multiplying instead of dividing.
- Misunderstanding the acceptable range.
- Confusing distance from target with direction from target.

Race timing:
- Averaging two speeds without considering the distances traveled.
- Confusing distance with time.
- Forgetting that speed must be positive.
- Ignoring the denominator restrictions in a rational equation.

Trail survey:
- Forgetting both positive and negative square roots.
- Confusing distance with signed elevation change.
- Failing to check solutions.
- Ignoring the physical meaning of the variable.

Give students an opportunity to correct their mistakes.

---

# 11. STUDENT PROGRESS INTEGRATION

Reuse existing Mathlete MTB infrastructure.

Associate each question with its corresponding curriculum skill.

Track:

- Activity started.
- Mission started.
- Question attempts.
- Correct answers.
- Incorrect answers.
- Hints requested.
- Independent solutions.
- Challenge completion.
- Total time.
- Activity completion.

Track performance separately for:

1. Formula rearrangement.
2. Absolute value equations.
3. Absolute value inequalities.
4. Rational equations.
5. Rational inequalities.
6. Radical equations.
7. Solution verification.
8. Domain restrictions.

The final student progress record should identify concepts that may need further practice.

---

# 12. TECHNICAL IMPLEMENTATION

## Required Components

Suggested components:

**RaceWorkshopDashboard**
- Opening screen.
- Mission board.
- Progress tracking.

**SuspensionSetupLab**
- Shock illustration.
- Sag calculator.
- Interactive sag slider.
- Tolerance gauge.
- Number line.

**RaceTimingLab**
- Trail-stage visualization.
- Speed controls.
- Race clock.
- Rational equation calculator.

**TrailSurveyLab**
- Trail profile.
- Right triangle visualization.
- Distance controls.
- Radical equation calculator.

**AlgebraDebugger**
- Solution checking.
- Extraneous candidate identification.

**ChallengeEngine**
- Question progression.
- Hints.
- Feedback.
- Scoring.

**ProgressTracker**
- Activity attempts.
- Skill associations.
- Completion status.

Adapt component boundaries to existing Mathlete MTB architecture.

Do not create duplicate graphing, input, question, or progress systems when existing components can be reused.

## Mathematical Logic

All simulations and calculations should derive from a single authoritative calculation layer per model.

Do not hardcode answers independently in the UI.

Implement input validation and explicitly define:
- Units.
- Variable domains.
- Denominator restrictions.
- Accepted numerical precision.
- Valid solution sets.

Randomized questions must use validated parameter sets so generated questions always have valid, verifiable answers.

---

# 13. RESEARCH AND SOURCE REFERENCES

Use these sources as educational and technical references when implementing the activity.

**Mountain biking technical references**

1. FOX — 2027 FLOAT Shock Owner's Manual, Setting Shock Air Pressure:
https://tech.ridefox.com/bike/owners-manuals/3172/sagsetup

2. REI — Mountain Bike Suspension Basics:
https://www.rei.com/learn/expert-advice/suspension.html

**Algebra and educational references**

3. Common Core — High School Algebra, Reasoning with Equations and Inequalities:
https://www.thecorestandards.org/Math/Content/HSA/REI/

4. Common Core — High School Algebra, Creating Equations:
https://www.thecorestandards.org/Math/Content/HSA/CED/

5. OpenStax — Other Types of Equations:
https://openstax.org/books/college-algebra-corequisite-support/pages/2-6-other-types-of-equations

6. OpenStax — Linear Inequalities and Absolute Value Inequalities:
https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-7-linear-inequalities-and-absolute-value-inequalities

7. Carnegie Learning — Algebra 2, Absolute Value Equations and Inequalities:
https://www.carnegielearning.com/shared/TX-SC/A2/A2_M01_T01_L05_Adapted_Virtual_TIG_Final.pdf

8. Khan Academy — Algebra 2:
https://www.khanacademy.org/math/algebra2

These resources inform the curriculum alignment, instructional sequencing, and technical context. Create original Mathlete MTB explanations, exercises, graphics, and questions.

---

# 14. IMPLEMENTATION PRIORITIES

Before building:

1. Read the Mathlete MTB Lab Development Framework.
2. Audit existing course, topic, activity, and progress infrastructure.
3. Inspect the existing Slope Lab and other interactive resources.
4. Identify reusable sliders, graphing tools, simulation components, and assessment functionality.
5. Confirm the Algebra 2 curriculum placement.

Then implement the activity in this order:

**Phase 1:** Race-Day Workshop introduction and mission navigation.

**Phase 2:** Suspension Setup Lab, including equations, absolute value, and inequalities.

**Phase 3:** Race Timing Lab, including rational equations and inequalities.

**Phase 4:** Trail Survey Lab, including radical equations and solution verification.

**Phase 5:** Final Race-Day Certification.

**Phase 6:** Optional complex-number extension.

**Phase 7:** Progress integration, accessibility, responsive design, and testing.

Implement a complete functional experience, not just a visual mockup.

---

# 15. ACCEPTANCE CRITERIA

- [ ] Activity appears in Algebra 2 → Equations and Inequalities.
- [ ] Opening workshop experience is functional.
- [ ] Students can navigate all three missions.
- [ ] Suspension sag calculator works.
- [ ] Suspension range is represented correctly.
- [ ] Absolute value equation and inequality are explained interactively.
- [ ] Race timing calculations are mathematically correct.
- [ ] Rational equation and inequality challenges work.
- [ ] Trail survey visualization works.
- [ ] Radical equation solutions are checked.
- [ ] Extraneous solution exercise works.
- [ ] Final challenge evaluates answers accurately.
- [ ] Student progress is recorded through existing infrastructure.
- [ ] Desktop and mobile layouts function.
- [ ] Existing Classes and Featured Tools remain intact.
- [ ] No misleading real-world suspension setup recommendations are presented.

---

# FINAL PRODUCT PRINCIPLE

The Race-Day Workshop must teach students that mathematics is a tool for solving real problems.

The student should finish thinking:

"I just used Algebra 2 to figure out suspension settings, calculate race speeds, and measure mountain biking terrain."

We want them to leave with more than a completed assignment.

We want them to have a different perspective on mathematics.

**That's the Mathlete MTB difference.**