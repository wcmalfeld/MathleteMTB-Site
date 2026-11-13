# PRD: Mathlete MTB — Curriculum-Based Classes Platform

**Project:** Mathlete MTB  
**Feature:** Classes & Curriculum-Based Learning  
**Implementation:** Claude Code  
**Priority:** High  
**Approach:** Incremental development of the existing Mathlete MTB website

---

# 1. Project Overview

## Objective

Transform Mathlete MTB from a collection of standalone educational tools into a curriculum-aligned mountain biking math learning platform.

Introduce a new primary website section called **Classes**.

Students should be able to:

1. Select the math course they are currently taking.
2. Browse the curriculum for that specific course.
3. Select a unit, topic, or skill they are currently studying.
4. Access mountain-bike-themed learning labs, interactive activities, simulations, and games that teach and reinforce that exact mathematical concept.
5. Practice the concept, receive feedback, and develop mastery.

The goal is to connect traditional high-school mathematics curriculum with practical mountain biking scenarios.

Instead of learning slope through generic textbook problems, students might calculate the gradient of a downhill trail, compare two jump trajectories, or analyze elevation changes across a trail.

The math must remain academically accurate and aligned with the actual curriculum. Mountain biking is the context through which students learn, not a replacement for the mathematics.

## Core Philosophy

**Learn the math. Ride the math. Understand why it matters.**

Every learning experience should answer three questions:

- What mathematical concept am I learning?
- How does this concept relate to mountain biking?
- Can I apply this mathematical concept to solve a problem?

The platform should feel like an interactive mountain biking learning environment rather than a traditional online textbook.

---

# 2. Existing Website Requirements

Before implementing anything, Claude must audit the existing Mathlete MTB website.

This is an incremental expansion, NOT a complete redesign.

### Preserve existing functionality

- Keep the current Featured Tools section.
- Preserve all existing featured tools and their functionality.
- Preserve the existing visual identity, branding, typography, colors, and overall design language.
- Preserve existing authentication, student accounts, progress tracking, and data structures where applicable.
- Do not break existing navigation or URLs.
- Reuse existing components and infrastructure whenever possible.

### New functionality

Introduce Classes as a new primary navigation section alongside Featured Tools.

The two sections should serve different purposes:

**Featured Tools**
- Standalone educational experiences.
- Interactive mountain biking math and physics tools.
- Independent activities that don't necessarily belong to a specific course.

**Classes**
- Structured, curriculum-aligned learning.
- Organized by high-school math course.
- Each course contains units, topics, skills, and corresponding activities.
- Designed to support what students are currently learning in school.

These sections should coexist rather than compete.

---

# 3. Classes — Main Navigation and Landing Page

Create a new Classes landing page.

### Navigation

Add a prominent Classes link to the existing website navigation.

### Classes landing page

Display four initial courses:

1. Algebra 1
2. Algebra 2
3. Geometry
4. Precalculus

Each course should have its own visual course card.

Each card should include:

- Course name.
- Brief course description.
- Relevant mathematical concepts.
- Mountain biking-inspired visual.
- Number of available learning activities.
- Student progress indicator, when progress tracking is available.
- Button/link to enter the course.

Suggested descriptions:

**Algebra 1**

Explore equations, variables, functions, graphs, and linear relationships through trail gradients, speed, distance, elevation, and riding scenarios.

**Algebra 2**

Explore advanced algebra, quadratic functions, polynomials, exponential relationships, and mathematical modeling through jump trajectories, suspension behavior, speed, and performance data.

**Geometry**

Explore angles, triangles, circles, transformations, area, volume, and spatial reasoning through bike design, trail construction, jump shapes, and mountain bike geometry.

**Precalculus**

Explore advanced functions, trigonometry, periodic behavior, vectors, and mathematical modeling through jumps, trail profiles, rotational movement, and mountain biking physics.

### Design requirements

- Visually engaging.
- Clean, modern, intuitive.
- Mountain biking-inspired without becoming visually cluttered.
- Easy to understand for high-school students.
- Responsive across desktop, tablet, and mobile.
- Use the existing Mathlete MTB design system.

---

# 4. Curriculum Architecture

This is one of the most important parts of the project.

The Classes section needs a consistent organizational hierarchy that can accommodate hundreds of learning resources over time.

Use the following hierarchy:

**Classes → Course → Unit → Topic → Skill → Learning Activity**

Example:

Algebra 1
- Unit 1: Foundations of Algebra
  - Topic: Variables and Expressions
    - Skill: Evaluating expressions
    - Skill: Simplifying expressions
    - Activities and labs
  - Topic: Equations
    - Skill: Solving one-step equations
    - Skill: Solving multi-step equations
    - Activities and labs

- Unit 2: Linear Relationships
  - Topic: Coordinate Plane
    - Skill: Plotting ordered pairs
    - Skill: Understanding the axes
  - Topic: Slope and Rate of Change
    - Skill: Calculating slope
    - Skill: Understanding positive and negative slope
    - Skill: Interpreting slope in real-world scenarios
    - Skill: Understanding linear relationships
    - Activity: Slope & Linear Relationships Lab

- Unit 3: Linear Equations
  - Topic: Writing Linear Equations
  - Topic: Graphing Linear Equations
  - Topic: Systems of Linear Equations

Continue this structure throughout each course.

## Curriculum flexibility

Use a common US high-school mathematics curriculum as the initial organizational foundation.

Curriculum sequences can vary between schools, districts, and textbooks.

Therefore:

- Make units and topics configurable.
- Avoid hardcoding curriculum content into individual page components.
- Give each topic and skill a unique identifier.
- Allow activities to be associated with one or multiple skills.
- Allow topics and activities to be added, reordered, or expanded later.
- Avoid building the architecture around one particular textbook.

The architecture should support future curriculum expansion without requiring significant changes to the application.

---

# 5. Initial Course Curriculum

Create the following initial course structures.

These are the starting curriculum categories. They should be populated as navigable sections even when an individual learning activity has not yet been developed.

## A. Algebra 1

**Course description:** Learn the fundamentals of algebra through real-world mountain biking problems involving speed, elevation, distance, jumps, and trail design.

Suggested curriculum:

**Unit 1: Foundations of Algebra**
- Variables and Expressions
- Evaluating Expressions
- Order of Operations
- Properties of Real Numbers

**Unit 2: Solving Equations and Inequalities**
- One-Step Equations
- Multi-Step Equations
- Variables on Both Sides
- Literal Equations
- Inequalities

**Unit 3: Linear Relationships**
- Coordinate Plane
- Graphing Ordered Pairs
- Slope and Rate of Change
- Positive and Negative Slope
- Linear Relationships
- Proportional Relationships

**Unit 4: Linear Equations and Functions**
- Writing Linear Equations
- Slope-Intercept Form
- Point-Slope Form
- Graphing Linear Equations
- Domain and Range
- Function Notation

**Unit 5: Systems of Equations**
- Graphing Systems
- Substitution
- Elimination
- Applications of Systems

**Unit 6: Exponents and Exponential Relationships**
- Exponent Rules
- Scientific Notation
- Exponential Growth
- Exponential Decay

**Unit 7: Polynomials and Factoring**
- Adding and Subtracting Polynomials
- Multiplying Polynomials
- Factoring Expressions
- Factoring Quadratics

**Unit 8: Quadratic Equations and Functions**
- Graphing Quadratics
- Vertex and Axis of Symmetry
- Factoring Quadratics
- Quadratic Formula
- Applications of Quadratic Functions

**Unit 9: Data and Statistics**
- Data Representation
- Scatter Plots
- Correlation
- Lines of Best Fit

### Existing Activity Placement

The previously developed **Slope & Linear Relationships Lab** must be integrated into:

Algebra 1 → Unit 3: Linear Relationships → Slope and Rate of Change.

This is an existing independent learning resource.

Do not rebuild it from scratch.

Audit the existing implementation and integrate it into the new curriculum structure while preserving its functionality, design, and learning interactions.

It should appear as an available activity under the appropriate topic.

If the existing lab is currently accessible through a standalone route, preserve that route and link the curriculum entry to the existing resource.

This activity will serve as the first example of how future curriculum-specific labs should be organized and presented.

---

## B. Algebra 2

**Course description:** Build on Algebra 1 by exploring more advanced equations, functions, polynomials, and mathematical relationships.

Suggested curriculum:

**Unit 1: Equations and Inequalities**
- Linear Equations Review
- Absolute Value Equations
- Complex Numbers
- Radical Equations
- Rational Equations

**Unit 2: Functions**
- Function Notation
- Domain and Range
- Transformations of Functions
- Inverse Functions
- Composite Functions

**Unit 3: Linear Systems and Matrices**
- Systems of Equations
- Three-Variable Systems
- Matrix Operations
- Applications of Matrices

**Unit 4: Quadratic Functions**
- Quadratic Graphs
- Vertex Form
- Completing the Square
- Quadratic Formula
- Complex Solutions

**Unit 5: Polynomial Functions**
- Polynomial Operations
- Polynomial Graphs
- Factoring Higher-Degree Polynomials
- Roots and Zeros
- Remainder and Factor Theorems

**Unit 6: Rational and Radical Functions**
- Rational Expressions
- Rational Equations
- Radical Functions
- Graphing Rational Functions
- Asymptotes

**Unit 7: Exponential and Logarithmic Functions**
- Exponential Functions
- Exponential Growth and Decay
- Logarithms
- Logarithmic Properties
- Applications

**Unit 8: Sequences and Series**
- Arithmetic Sequences
- Geometric Sequences
- Series
- Summation Notation

**Unit 9: Probability and Statistics**
- Probability
- Conditional Probability
- Combinations and Permutations
- Statistical Analysis

---

## C. Geometry

**Course description:** Discover how geometry explains mountain bike design, trail construction, angles, jumps, distances, and three-dimensional objects.

Suggested curriculum:

**Unit 1: Foundations of Geometry**
- Points, Lines, and Planes
- Segments and Angles
- Angle Relationships
- Parallel and Perpendicular Lines

**Unit 2: Reasoning and Proof**
- Logical Reasoning
- Conditional Statements
- Geometric Proofs
- Congruence Statements

**Unit 3: Triangles**
- Triangle Classification
- Triangle Angle Relationships
- Triangle Congruence
- Similar Triangles
- Pythagorean Theorem
- Special Right Triangles

**Unit 4: Quadrilaterals and Polygons**
- Properties of Quadrilaterals
- Parallelograms
- Rectangles and Rhombuses
- Regular Polygons
- Interior and Exterior Angles

**Unit 5: Transformations**
- Translations
- Reflections
- Rotations
- Dilations
- Symmetry

**Unit 6: Similarity and Scale**
- Scale Factors
- Proportional Reasoning
- Similar Figures
- Scale Drawings

**Unit 7: Circles**
- Circumference
- Area of Circles
- Arc Length
- Central and Inscribed Angles
- Tangents and Secants

**Unit 8: Area and Volume**
- Area of Two-Dimensional Figures
- Surface Area
- Volume
- Composite Figures
- Three-Dimensional Geometry

**Unit 9: Coordinate Geometry**
- Distance Formula
- Midpoint Formula
- Slope Review
- Equations of Lines
- Coordinate Proofs

---

## D. Precalculus

**Course description:** Explore advanced mathematical relationships, trigonometry, functions, and mathematical modeling through the physics and geometry of mountain biking.

Suggested curriculum:

**Unit 1: Advanced Functions**
- Function Transformations
- Polynomial Functions
- Rational Functions
- Inverse Functions
- Composition of Functions

**Unit 2: Polynomial and Rational Functions**
- Polynomial Behavior
- Roots and Zeros
- End Behavior
- Rational Functions
- Asymptotes

**Unit 3: Exponential and Logarithmic Functions**
- Exponential Models
- Logarithmic Models
- Logarithmic Properties
- Applications

**Unit 4: Trigonometry**
- Degrees and Radians
- Unit Circle
- Sine, Cosine, and Tangent
- Right Triangle Trigonometry
- Trigonometric Identities

**Unit 5: Trigonometric Functions**
- Graphing Sine and Cosine
- Periodic Functions
- Amplitude and Period
- Phase Shifts
- Inverse Trigonometric Functions

**Unit 6: Trigonometric Applications**
- Law of Sines
- Law of Cosines
- Solving Triangles
- Bearings and Angles
- Applications of Trigonometry

**Unit 7: Vectors**
- Vector Components
- Vector Magnitude
- Vector Addition
- Direction and Velocity

**Unit 8: Parametric and Polar Functions**
- Parametric Equations
- Parametric Graphs
- Polar Coordinates
- Polar Graphs

**Unit 9: Sequences, Series, and Limits**
- Arithmetic and Geometric Sequences
- Series
- Mathematical Limits
- Introduction to Calculus Concepts

---

# 6. Course Navigation and User Experience

When a student enters a course, they should see a structured curriculum dashboard.

Example:

Algebra 1

Course introduction:
"Explore Algebra 1 through the world of mountain biking. Learn how equations, graphs, and mathematical relationships help explain speed, elevation, jumps, and trail design."

Below the introduction, display the curriculum units.

Each unit should be expandable or clickable.

Example:

**Unit 3: Linear Relationships**

Topics:
- Coordinate Plane
- Slope and Rate of Change
- Linear Relationships
- Proportional Relationships

Each topic should display:
- Topic name.
- Brief description.
- Associated mathematical skills.
- Number of available activities.
- Student completion status.

When a student selects a topic, open its topic page.

## Topic page

Each topic should contain:

1. Topic introduction.
2. Learning objectives.
3. Mountain biking connection.
4. Available learning activities.
5. Available practice problems, if applicable.
6. Student progress and mastery information, if available.

Example:

**Slope and Rate of Change**

What you'll learn:
- Understand slope as a rate of change.
- Calculate slope using two points.
- Interpret positive and negative slope.
- Understand slope in real-world scenarios.

Mountain biking connection:

"Every trail has a gradient. When you're riding downhill, you're experiencing negative elevation change over horizontal distance. Understanding slope helps us describe just how steep a trail really is."

Available activity:

Slope & Linear Relationships Lab

[Launch Lab]

---

# 7. Learning Activity Architecture

The learning activities are the most important part of Mathlete MTB.

We want to build a reusable framework that allows new activities to be created and connected to specific curriculum topics.

Activities should be modular and independent of the course navigation system.

For example, the Slope & Linear Relationships Lab should remain a standalone learning resource that can be accessed through Algebra 1.

This separation is important because the same activity could eventually be linked to multiple courses or topics.

## Activity types

Support the following activity categories:

**1. Interactive Labs**
- Manipulatable variables.
- Interactive graphs.
- Simulations.
- Real-time visual feedback.
- Experimentation.

**2. Guided Learning Activities**
- Step-by-step explanations.
- Visual demonstrations.
- Interactive examples.
- Guided practice.

**3. Games**
- Challenge-based learning.
- Scoring and progression.
- Timed or untimed challenges.
- Difficulty progression.

**4. Practice Problems**
- Curriculum-aligned questions.
- Multiple-choice and numerical answers.
- Written problem solving.
- Immediate feedback.
- Hints and explanations.

Do not attempt to build all four activity types immediately. Establish the architecture to support them, then add individual activities incrementally.

## Standard activity structure

Every activity should support:

- Activity title.
- Associated course.
- Associated unit.
- Associated topic.
- Associated mathematical skills.
- Learning objectives.
- Estimated completion time.
- Difficulty level.
- Introduction and instructions.
- Interactive learning environment.
- Practice or challenge component.
- Feedback and explanations.
- Completion status.

Where applicable, activities should also record student attempts, incorrect answers, hints used, and improvement over time.

## Learning quality requirements

Activities must teach the actual mathematical concept rather than simply decorate generic math questions with mountain biking images.

For example:

Weak implementation:
"Calculate 5 + 7. Imagine you're riding a mountain bike."

Strong implementation:
"A trail drops 120 feet over a horizontal distance of 600 feet. Calculate its gradient and explain what the result means for a rider."

The mathematical scenario should be integral to the problem.

---

# 8. Student Progress and Future Tracking

The new Classes section should be built with student progress tracking in mind.

If existing student progress infrastructure is available, reuse it.

If not, create a clean data structure that supports future integration.

Track progress at the following levels:

- Course.
- Unit.
- Topic.
- Skill.
- Individual activity.

Potential tracked metrics:

- Activities completed.
- Problems attempted.
- Correct answers.
- Incorrect answers.
- Accuracy.
- Hints used.
- Time spent.
- Skill mastery.

A student should eventually be able to revisit a topic and see how they are improving.

Importantly, activity attempts should be associated with the underlying mathematical skill IDs, not just the activity itself.

This will allow future activities to contribute to the same skill's progress.

For example, if a student practices slope in three different mountain biking labs, their progress should contribute to their overall understanding of slope.

Do not build a complicated student analytics dashboard as part of this initial project. Establish the data architecture and connect it to existing tracking functionality where possible.

---

# 9. Content and Curriculum Data Architecture

Avoid hardcoding course structures into frontend components.

Create a structured, reusable curriculum data model.

Suggested conceptual entities:

**Course**
- id
- name
- description
- slug
- display_order

**Unit**
- id
- course_id
- title
- description
- display_order

**Topic**
- id
- unit_id
- title
- description
- display_order

**Skill**
- id
- topic_id
- title
- description
- learning_objectives
- prerequisites

**Activity**
- id
- title
- description
- activity_type
- route
- difficulty
- estimated_duration
- status

**ActivitySkill**
- activity_id
- skill_id

**StudentActivityAttempt**
- student_id
- activity_id
- skill_id
- attempt_data
- score
- completed_at

These are conceptual models, not requirements to create an entirely new database if equivalent structures already exist.

Claude should audit the existing application and adapt these concepts to the current technology stack.

Important requirements:

- Stable identifiers.
- Reusable activity components.
- Course-independent activity routes.
- Many-to-many relationships between activities and skills.
- Ability to add new courses and topics without changing the core architecture.
- Compatibility with existing student accounts and progress tracking.

---

# 10. Visual Design Direction

The Classes experience should feel like an extension of Mathlete MTB.

Think:

- Modern educational platform.
- Mountain biking culture.
- Interactive and exploratory.
- Visually engaging.
- Easy to navigate.
- Designed for high-school students.

Avoid making it look like a traditional school learning management system.

Use mountain biking-inspired imagery and language throughout the experience.

However, prioritize clarity and usability over decoration.

Students should always understand:
- What class they're in.
- What unit they're studying.
- What topic they're working on.
- What they can learn or practice next.

Include breadcrumb navigation:

Classes → Algebra 1 → Linear Relationships → Slope and Rate of Change

Make it easy to navigate back to the course or topic.

---

# 11. Technical Implementation Instructions

Before writing code:

1. Audit the existing Mathlete MTB codebase.
2. Identify the current frontend framework, routing, styling system, database, and authentication architecture.
3. Locate the previously developed Slope & Linear Relationships Lab.
4. Identify existing student progress and activity tracking functionality.
5. Identify reusable UI components.
6. Present a concise implementation plan before making substantial changes.

Do not assume a particular technology stack.

Do not replace working infrastructure simply to accommodate this feature.

## Implementation phases

**Phase 1: Classes foundation**
- Add Classes to navigation.
- Create the Classes landing page.
- Create four course cards.
- Implement course routing.

**Phase 2: Curriculum structure**
- Implement the Course → Unit → Topic → Skill hierarchy.
- Populate all four initial course structures.
- Create expandable unit and topic navigation.
- Build reusable topic pages.
- Implement breadcrumbs.

**Phase 3: Activity integration**
- Integrate the existing Slope & Linear Relationships Lab.
- Place it in Algebra 1 → Unit 3 → Slope and Rate of Change.
- Preserve its existing standalone route and functionality.
- Create reusable activity cards and activity metadata structures.

**Phase 4: Progress infrastructure**
- Reuse existing student progress functionality.
- Connect activity completion and attempts to curriculum skills.
- Ensure the architecture supports future mastery tracking.

**Phase 5: Testing and refinement**
- Test all navigation.
- Test responsive layouts.
- Test all course and topic routes.
- Verify that existing Featured Tools still work.
- Verify that the Slope Lab works from both its existing standalone route and its new curriculum location.
- Check for broken links and empty states.

---

# 12. Scope Boundaries

The goal of this implementation is to build the Classes infrastructure and populate the initial curriculum.

Do NOT attempt to create a complete collection of interactive activities for every topic yet.

For topics without activities:

- Display the topic.
- Display its mathematical skills.
- Provide a clear empty state indicating that learning activities are being developed.
- Do not create fake activity cards or imply that unavailable resources exist.

The Slope & Linear Relationships Lab is the first fully integrated activity.

Future activities will be developed individually and connected to the relevant curriculum topics.

Do not modify the existing Featured Tools section beyond the necessary navigation integration.

Do not redesign the entire website.

---

# 13. Acceptance Criteria

The implementation is complete when:

- [ ] Classes appears in the primary website navigation.
- [ ] Featured Tools remains intact and functional.
- [ ] Classes landing page displays Algebra 1, Algebra 2, Geometry, and Precalculus.
- [ ] Each course has its own navigable course page.
- [ ] Each course contains the specified curriculum units.
- [ ] Each unit contains its corresponding topics.
- [ ] Topics display their associated mathematical skills.
- [ ] Students can navigate from course to unit to topic.
- [ ] Breadcrumb navigation works.
- [ ] The curriculum hierarchy is data-driven rather than hardcoded into individual page components.
- [ ] Activities can be connected to multiple mathematical skills.
- [ ] The existing Slope & Linear Relationships Lab is integrated into Algebra 1 → Unit 3 → Slope and Rate of Change.
- [ ] The existing Slope Lab retains its original functionality and standalone route.
- [ ] The system is prepared for additional learning activities.
- [ ] The system is prepared for student progress tracking.
- [ ] Mobile and desktop layouts function correctly.
- [ ] Existing website functionality remains intact.

---

# 14. Long-Term Vision

This project establishes the foundation for Mathlete MTB to become a comprehensive alternative learning environment for students who connect better with hands-on, visual, and interest-driven learning.

The long-term experience should look like this:

A student logs in.

They select Algebra 1.

They see their current unit: Linear Relationships.

They select Slope and Rate of Change.

They launch an interactive mountain biking lab.

They experiment with trail gradients, calculate slope, receive feedback, and complete challenges.

Their attempts are saved.

Their tutor can eventually review what they practiced, which skills they understand, and where they're struggling.

The student is no longer simply completing math homework.

They're learning mathematics through something they genuinely enjoy.

**The ultimate objective: Build a library of exceptional, curriculum-aligned mountain biking learning experiences, one mathematical concept at a time.**