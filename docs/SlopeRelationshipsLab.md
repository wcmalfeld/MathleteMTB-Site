# PRD: Mathlete — Slope & Linear Relationships Lab

**Product:** Mathlete  
**Module:** Slope & Linear Relationships Lab  
**Version:** V1  
**Development:** Claude Code  
**Status:** Ready for implementation  
**Type:** Independent, self-contained educational web application

---

# 1. Product Overview

## 1.1 Vision

Create an interactive mathematics learning experience that teaches high-school students slope and linear relationships through mountain biking, trail design, elevation, and other familiar real-world scenarios.

The goal is to help students understand abstract mathematical concepts by connecting them to something tangible and interesting.

Rather than presenting students with a collection of equations and practice questions, the application should let them manipulate variables, observe relationships, experiment with scenarios, make predictions, and apply what they've learned.

The experience should gradually transition from visual and interactive exploration to independent mathematical problem-solving.

**Core educational philosophy:**

Connect interest to understanding. Connect understanding to practice. Connect practice to independent problem-solving.

## 1.2 Product Objectives

The application must:

1. Teach the mathematical meaning of slope.
2. Help students understand rise and run.
3. Demonstrate how slope represents a rate of change.
4. Teach students to calculate slope from graphs, tables, and coordinate pairs.
5. Introduce linear equations and slope-intercept form.
6. Connect slope and linear relationships to mountain biking and trail design.
7. Give students an interactive environment to experiment with mathematical relationships.
8. Provide guided explanations and progressive hints.
9. Offer progressively challenging practice problems.
10. Assess whether students can apply the concept without relying on the MTB context.

## 1.3 Standalone Architecture Requirement

This must be developed as an independent resource.

It must not depend on:
- The Mathlete student dashboard.
- Mathlete user authentication.
- Existing course enrollment systems.
- A global Mathlete curriculum database.
- The academic tutor portal.
- The MTB coaching platform.
- Other learning labs.
- Existing platform-wide navigation.

The module should be fully usable as its own page or application.

It should have its own:
- Components.
- Styling.
- Learning content.
- Interactive logic.
- Question bank.
- Answer validation.
- Session progress.
- Completion summary.

Build it so that it can eventually be embedded into another application or linked from an existing Mathlete page without requiring a rewrite.

Avoid global CSS changes that could affect other areas of the website.

If the existing repository is being used, isolate this functionality in its own module, route, or feature directory.

Do not change the site's main navigation or decide where the resource belongs.

---

# 2. Target Audience

Primary audience:

High-school students, particularly Algebra I students, who:
- Struggle to understand abstract mathematical concepts.
- Learn better through visual or interactive experiences.
- Have difficulty connecting equations to real situations.
- Need additional practice.
- Benefit from breaking complicated concepts into smaller steps.

Secondary audience:
- Students who want additional practice.
- Tutors looking for an engaging way to teach slope.
- Parents looking for educational resources.

The interface should be accessible to students who are not especially confident in mathematics.

Avoid assuming students already understand mathematical vocabulary.

---

# 3. Overall Learning Experience

The application should follow this instructional sequence:

1. Discover the concept.
2. Understand the mathematics.
3. Explore interactively.
4. Practice with guidance.
5. Solve independently.
6. Apply the concept outside the MTB context.
7. Review what was learned.

Each stage should feel like a continuation of the same learning experience.

Students should be able to move between stages without losing their progress.

The experience should feel engaging and exploratory rather than like completing a traditional online worksheet.

## 3.1 Suggested Navigation

Create a simple module-specific navigation structure.

- Introduction
- Learn
- Explore
- Practice
- Challenge
- My Progress

Use a visible progress indicator so students understand where they are.

Do not make students complete every stage in a rigid order. Allow them to revisit explanations and return to previously completed activities.

---

# 4. Module Introduction

Create an engaging introductory screen.

Suggested headline:

**What makes a trail steep?**

Supporting text:

"Every trail tells a mathematical story. Whether you're climbing uphill, descending a mountain, or comparing two different trail sections, you're working with slope."

Use an attractive mountain biking visual showing a trail with a distinct elevation profile.

Introduce the central question:

"How can we describe how steep something is mathematically?"

Provide a prominent action:

**Explore Slope**

The introduction should take less than a minute to understand.

Do not begin with a long mathematical explanation.

---

# 5. Learning Section: Understanding Slope

Build an instructional experience that explains the concept of slope visually and mathematically.

## 5.1 Introduce Rise and Run

Display a simplified mountain bike trail profile.

Clearly distinguish:

**Rise:** The vertical change in elevation.

**Run:** The horizontal distance traveled.

Introduce:

\[
\text{Slope}=\frac{\text{Rise}}{\text{Run}}
\]

Explain that slope measures how much something changes vertically for a given horizontal change.

Use an animated or interactive diagram to show:
- Starting point.
- Ending point.
- Vertical rise or fall.
- Horizontal run.
- Trail direction.
- Resulting slope.

Students should be able to visually identify the rise and run before being asked to calculate them.

## 5.2 Worked Example

Use the following example:

A mountain bike trail gains 120 feet of elevation over 600 feet of horizontal distance.

Calculate its slope.

\[
m=\frac{120}{600}=0.2
\]

As a percentage grade:

\[
0.2\times100=20\%
\]

Explain:

- The decimal slope is 0.2.
- The percentage grade is 20%.
- This means the trail gains 20 feet vertically for every 100 feet horizontally, assuming a constant grade.

Explicitly distinguish slope and percentage grade from angle measured in degrees.

A 20% grade is not a 20-degree angle.

Where relevant, show that the equivalent angle is approximately 11.3 degrees.

## 5.3 Different Types of Slope

Teach:

- Positive slope.
- Negative slope.
- Zero slope.
- Undefined slope.

Connect these to recognizable scenarios:

| Mathematical concept | Example |
|---|---|
| Positive slope | Trail gaining elevation |
| Negative slope | Trail descending |
| Zero slope | Flat trail |
| Undefined slope | Vertical line |

Use clear visual diagrams.

For mountain biking examples, explain that the coordinate direction determines whether a descending trail has positive or negative mathematical slope.

---

# 6. Interactive Experience: Trail Builder

This is the centerpiece of V1.

Build an interactive trail-design environment.

The student should be able to manipulate a trail's elevation and horizontal distance and immediately see how the resulting slope changes.

## 6.1 Main Interface

Display a large interactive side-profile trail diagram.

The interface should include adjustable controls for:

- Starting elevation.
- Ending elevation.
- Horizontal distance.
- Trail direction, where appropriate.

Display the mathematical results beside the visualization.

Include:

- Rise.
- Run.
- Decimal slope.
- Percentage grade.
- A corresponding mathematical equation.

Example:

Student selects:
- Starting elevation: 1,000 feet.
- Ending elevation: 1,120 feet.
- Horizontal distance: 600 feet.

The system calculates:

\[
\text{Rise}=1120-1000=120
\]

\[
m=\frac{120}{600}=0.2
\]

\[
\text{Grade}=20\%
\]

The trail drawing should update immediately when the student adjusts the controls.

Allow both slider interaction and direct numerical input.

Include sensible minimum and maximum values.

Support metric and imperial units, with a consistent unit system used within each calculation.

## 6.2 Visual Graph

Display the same relationship on a coordinate graph.

Use:
- Horizontal axis for distance.
- Vertical axis for elevation.
- Clearly labeled points.
- A line connecting the points.
- Grid lines and readable scales.

Allow students to compare the visual trail profile with its algebraic representation.

An important requirement: the coordinate graph must maintain correctly labeled axis scales. Do not visually imply that the physical trail angle is the mathematical angle unless the scales support that interpretation.

For a constant-grade trail, represent the relationship as:

\[
y=mx+b
\]

Where:
- \(x\) represents horizontal distance.
- \(y\) represents elevation.
- \(m\) represents slope.
- \(b\) represents starting elevation relative to the selected vertical datum.

Explain that this is an idealized constant-grade model. Real trails frequently have changing grades and do not follow one straight line.

## 6.3 Interactive Challenges

Build several small challenges.

**Challenge 1: Create a 10% grade**

Allow the student to manipulate distance and elevation until they create the requested grade.

**Challenge 2: Create a 20% grade**

Ask the student to predict what needs to change before adjusting the controls.

**Challenge 3: Compare two trails**

Display two different trail profiles.

Ask which one has the steeper grade and why.

**Challenge 4: Keep the elevation, change the distance**

Maintain a fixed elevation gain while changing horizontal distance.

Ask the student to observe how the slope changes.

**Challenge 5: Keep the distance, change the elevation**

Maintain a fixed horizontal distance while adjusting elevation gain.

Ask the student to explain the relationship.

**Challenge 6: Build your own trail**

Give the student a target grade and allow them to design a trail that achieves it.

Provide feedback based on the mathematical relationship, not simply whether they completed the interaction.

## 6.4 Prediction Mode

Before calculating an answer, occasionally ask students to predict the result.

Example:

"A trail gains 100 feet over 500 feet of horizontal distance. What would happen to the slope if we kept the same elevation gain but reduced the horizontal distance to 250 feet?"

Allow the student to select:
- It becomes steeper.
- It becomes less steep.
- It stays the same.

Then show the calculation.

Prediction encourages students to reason about the relationship before relying on computation.

---

# 7. Learning Section: Slope from Different Representations

After students understand the MTB-based representation, introduce different ways slope is expressed in school mathematics.

## 7.1 Slope from Two Points

Teach:

\[
m=\frac{y_2-y_1}{x_2-x_1}
\]

Use a coordinate graph with two highlighted points.

Walk students through:

1. Identifying the first point.
2. Identifying the second point.
3. Calculating the change in y.
4. Calculating the change in x.
5. Dividing the two quantities.

Show how this relates to rise and run.

Provide worked examples.

## 7.2 Slope from a Graph

Show different lines on a coordinate plane.

Ask students to:
- Identify two points.
- Calculate rise.
- Calculate run.
- Determine slope.
- Classify the slope as positive, negative, zero, or undefined.

Allow the student to select two points on an interactive graph where practical.

## 7.3 Slope from a Table

Display tables of x and y values.

Teach students to calculate the change in y relative to the change in x.

Example:

| Distance (x) | Elevation (y) |
|---:|---:|
| 0 | 1,000 |
| 100 | 1,020 |
| 200 | 1,040 |
| 300 | 1,060 |

Explain that the elevation increases by 20 feet for every 100 feet of horizontal distance.

The slope is:

\[
m=\frac{20}{100}=0.2
\]

Give students opportunities to identify whether a table represents a linear relationship.

## 7.4 Slope-Intercept Form

Introduce:

\[
y=mx+b
\]

Explain each part:

- \(m\) is the slope.
- \(b\) is the y-intercept.

Use a trail elevation example.

For a trail starting at 1,000 feet and rising at a constant grade of 0.2:

\[
y=0.2x+1000
\]

Explain what happens to elevation as horizontal distance changes.

Allow students to change the slope and intercept and observe how the line moves.

Cover:
- Identifying slope from an equation.
- Identifying the y-intercept.
- Writing a linear equation from a graph.
- Understanding what the equation represents.

---

# 8. Practice Engine

Create a structured practice experience with questions linked to the concepts taught in the module.

The questions must not all be multiple choice.

Support:
- Multiple choice.
- Numeric entry.
- Identifying slope from a graph.
- Identifying rise and run.
- Interpreting an equation.
- Calculating slope from two coordinates.
- Completing a table.
- Real-world application.

## 8.1 Difficulty Levels

**Level 1: Foundations**

- Identify rise and run.
- Recognize positive and negative slope.
- Calculate simple slopes.
- Understand percentage grade.

**Level 2: Application**

- Calculate slope from two points.
- Interpret slope from tables.
- Identify slope from a graph.
- Solve percentage-grade problems.
- Interpret linear equations.

**Level 3: Challenge**

- Write equations from contextual information.
- Compare multiple linear relationships.
- Solve multi-step problems.
- Interpret units and rate of change.
- Apply slope to unfamiliar scenarios.

Allow students to select difficulty.

Also provide recommendations based on previous results.

## 8.2 Feedback System

Every question must have:

- Correct answer.
- Explanation.
- Validation logic.
- Optional hints.
- Difficulty.
- Associated learning objective.

When a student gets something wrong, explain the relevant concept rather than simply displaying the correct answer.

Example:

"You correctly identified the elevation change. Remember that slope compares this vertical change with horizontal distance, not the length of the trail surface."

Allow another attempt.

## 8.3 Progressive Hints

Example question:

A trail gains 90 feet of elevation over 450 feet of horizontal distance. What is its percentage grade?

Hint 1:
Which two quantities do we need to compare?

Hint 2:
Remember that slope is rise divided by run.

Hint 3:
Divide 90 by 450.

Hint 4:
Convert the decimal into a percentage.

Do not automatically display the complete solution when the first hint is requested.

Track the number of hints used.

---

# 9. Transfer Challenge: Mathematics Without MTB

This section is extremely important.

The student must demonstrate that they understand the academic concept independently of the sports context.

Present school-style problems without references to mountain biking.

Examples:

- Calculate the slope between two coordinate points.
- Identify the slope of a line from its equation.
- Interpret a linear relationship from a table.
- Determine whether a function represents a constant rate of change.
- Graph a linear equation.
- Solve a real-world rate-of-change problem unrelated to sports.

The objective is to test whether the student can transfer the underlying knowledge to unfamiliar contexts.

Do not make this section feel like a completely unrelated test. Explain that the mathematics they learned through trail design applies to many areas of life.

---

# 10. Question Bank and Content Architecture

Keep learning content separate from presentation components.

Questions should be stored in structured data rather than being hard-coded into individual screens.

Each question should contain:

- Unique ID.
- Learning objective.
- Skill.
- Difficulty.
- Question type.
- Question text.
- Optional diagram or graph configuration.
- Correct answer.
- Validation method.
- Explanation.
- Progressive hints.
- Optional contextual representation.

Ensure all answers are mathematically validated.

For V1, create a minimum of 24 carefully validated questions:
- 8 foundational.
- 8 application.
- 8 challenge.

Distribute the questions across different learning objectives and answer formats.

Include both MTB-contextualized questions and context-free transfer problems.

Use deterministic validation wherever possible.

For numeric answers:
- Handle decimal precision.
- Check units where appropriate.
- Distinguish decimal slope from percentage grade.
- Avoid accepting ambiguous representations.

Do not depend on AI-generated answers or unchecked model grading.

---

# 11. Progress Tracking

This application must work without Mathlete account integration.

For V1, implement self-contained session progress.

Track:
- Completed activities.
- Questions attempted.
- Questions answered correctly.
- Questions requiring additional attempts.
- Hints requested.
- Challenge completion.
- Transfer challenge performance.
- Completion date.

Preserve recent progress across refreshes and return visits where practical.

Use local browser storage for standalone persistence in V1.

Do not require a backend or authentication system.

Structure the progress service behind a clean interface so that an external application can integrate persistent student accounts in the future.

Keep the original question and answer data available for review.

## 11.1 Completion Summary

At the end of the module, display:

- Concepts explored.
- Practice completed.
- Questions answered correctly.
- Areas that may need more work.
- Transfer challenge results.
- Suggested next learning activity.

Use encouraging language.

Do not tell students they have mastered slope based on one short practice session.

Distinguish activity completion from demonstrated understanding.

---

# 12. Design and User Experience

The experience should feel like an engaging interactive learning product rather than a traditional school worksheet.

Visual direction:

- Mathlete's MTB-inspired identity.
- Strong visual representation of elevation and trail design.
- Clear mathematical notation.
- Interactive graphing.
- Smooth transitions.
- Modern, responsive layouts.
- Simple controls.
- Readable typography.

Avoid:
- Excessive gamification.
- Distracting animations.
- Unnecessary sound effects.
- Timed tests by default.
- Overly complicated controls.
- Long blocks of explanatory text.
- Unnecessary account or navigation requirements.

Students should be able to explore without fear of making mistakes.

## 12.1 Responsive Design

Support:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

On mobile, ensure that:
- Sliders are usable.
- Numerical inputs are accessible.
- Graphs remain readable.
- Equations do not overflow.
- Practice questions are easy to navigate.

## 12.2 Accessibility

Support:
- Keyboard navigation.
- Accessible labels.
- Sufficient contrast.
- Screen-reader-friendly descriptions.
- Non-color-dependent graph indicators.
- Reduced motion preferences.
- Clear textual equivalents for important visual information.

---

# 13. Technical Architecture

Develop the resource as a self-contained feature.

Recommended conceptual structure:

slope-linear-lab/
- components/
  - Introduction
  - SlopeExplanation
  - TrailBuilder
  - CoordinateGraph
  - WorkedExample
  - GuidedPractice
  - PracticeSession
  - TransferChallenge
  - ProgressSummary
- content/
  - lessons
  - problems
  - hints
  - solutions
- logic/
  - slopeCalculations
  - answerValidation
  - questionSelection
  - progressTracking
- types/
  - learningContent
  - question
  - attempt
  - progress
- styles/
- index / entry point

Adapt the actual structure to the existing repository's framework.

Do not introduce an unnecessary second framework.

## 13.1 Mathematical Calculation Logic

Keep mathematical calculation logic separate from UI components.

Implement reusable functions for:

- Calculating rise.
- Calculating run.
- Calculating slope.
- Calculating percentage grade.
- Calculating angle from slope where needed.
- Finding slope between two points.
- Evaluating a linear equation.
- Generating coordinate relationships.

Handle:
- Division by zero.
- Undefined slope.
- Negative slope.
- Floating-point precision.
- Unit consistency.
- Invalid inputs.

Use tested calculation functions rather than duplicating mathematical logic across components.

## 13.2 Future Integration Interface

The module must be independent but integration-ready.

Expose a small interface for a future host application to:

- Launch the module.
- Optionally provide a student identifier.
- Receive module completion.
- Receive progress summaries.
- Receive relevant attempt records.
- Control whether progress is stored locally or sent to an external service.

The application must continue working when no external integration is provided.

Use a clean adapter or callback approach rather than coupling the module to Mathlete's global data structures.

Do not build actual Mathlete-wide integration in V1.

---

# 14. Testing and Validation

Before delivery, test all mathematical functionality independently.

Important calculation cases:

**Positive slope**

Rise 120, run 600:

Slope = 0.2

Grade = 20%

**Negative slope**

Rise -100, run 500:

Slope = -0.2

**Zero slope**

Rise 0, run 500:

Slope = 0

**Undefined slope**

Rise 100, run 0:

Slope is undefined.

**Two-point calculation**

Points (2, 4) and (6, 12):

\[
m=\frac{12-4}{6-2}=2
\]

**Linear equation**

\[
y=3x+5
\]

At x = 4:

y = 17.

Verify that:
- Slider adjustments update calculations.
- Numeric inputs validate correctly.
- The graph matches the mathematical values.
- Percentage grades are calculated correctly.
- Undefined slope is handled without errors.
- Hints appear in the correct sequence.
- Correct and incorrect answers produce appropriate feedback.
- Progress survives browser refreshes.
- Transfer questions are properly evaluated.
- Mobile screens function correctly.

---

# 15. Explicitly Out of Scope

Do not build:
- Complete Mathlete student dashboard.
- Mathlete authentication.
- Student account management.
- Tutor dashboard.
- Academic tutoring scheduling.
- MTB Coaching platform.
- Ski, surf, or climbing versions.
- Complete Algebra I course.
- AI chatbot.
- AI-generated question bank.
- School management integrations.
- 3D trail simulation.
- Full physics simulation.

These are separate future projects.

The objective is one complete, self-contained educational experience.

---

# 16. Definition of Done

A student who has never used Mathlete must be able to open this resource and independently:

1. Understand the introductory concept of slope.
2. Identify rise and run.
3. Experiment with elevation and distance in Trail Builder.
4. Understand decimal slope and percentage grade.
5. Calculate slope from two coordinates.
6. Read slope from a graph.
7. Understand a linear equation.
8. Complete guided practice.
9. Solve independent questions.
10. Complete a context-free transfer challenge.
11. Review their learning summary.
12. Return later and continue their progress.

The application must work as a standalone resource without depending on other Mathlete functionality.

**Success means the student leaves understanding something they previously found difficult.**

Do not optimize for the number of interactions or the visual complexity of the application.

Build an experience that makes mathematics genuinely understandable.

---

# Final Development Instruction

Inspect the existing repository and determine the cleanest way to implement this as an independent resource.

Do not alter the main Mathlete navigation or decide where the tool belongs.

Prioritize mathematical accuracy, educational effectiveness, a polished interactive experience, and clean separation from the rest of the application.

Build this resource so it can be deployed independently or integrated into Mathlete later without significant architectural changes.