# PRD: Mathlete MTB — Teacher Lesson Plan Library

**Project:** Mathlete MTB  
**Feature:** Teacher Curriculum & Lesson Plan Library  
**Target audience:** Teachers and academic instructors at World Class Academy and other Mathlete MTB partner organizations  
**Development approach:** Integrate into the existing Mathlete MTB application. Do not rebuild existing functionality.

---

# 1. Project Overview

## Objective

Build a beautiful, intuitive, teacher-facing section of the existing Mathlete MTB website where teachers can access complete, professionally designed lesson plans for every class and topic in their quarterly mathematics curriculum.

The goal is to make Mathlete MTB a comprehensive teaching companion that helps teachers deliver engaging, relevant, curriculum-aligned mathematics instruction.

Every lesson plan must incorporate a mountain biking connection. This can be accomplished through:

- An existing interactive Mathlete MTB learning tool.
- A Mathlete MTB virtual lab or simulation.
- An MTB-related mathematical activity.
- A real-world mountain biking scenario.
- MTB-based practice problems or data analysis.
- A combination of the above.

**Every single lesson must contain at least one meaningful MTB-related teaching component.** MTB integration should reinforce the mathematical objective rather than feel like an unrelated activity added to the lesson.

The platform should give teachers everything they need to confidently teach a lesson without spending hours preparing materials.

## Core philosophy

Mathlete MTB should make it easier for teachers to teach mathematics in a way that students actually want to learn.

We are not replacing traditional mathematics instruction. We are providing teachers with a structured curriculum, engaging applications, interactive learning tools, ready-to-use activities, and professionally developed teaching resources.

---

# 2. Initial Scope: Courses and Curriculum

The initial teacher curriculum should support the following courses:

1. Algebra 1
2. Geometry
3. Algebra 2
4. Precalculus

The architecture must allow additional courses to be added in the future.

## Curriculum hierarchy

Organize the entire section around this hierarchy:

**Course → Quarter → Unit → Topic → Lesson Plan**

Example:

Algebra 1  
→ Quarter 1  
→ Linear Relationships  
→ Understanding Slope  
→ Complete Lesson Plan

Each course should have four quarterly sections (Quarter 1, Quarter 2, Quarter 3, Quarter 4).

Each quarter contains its respective units, topics, and individual lesson plans.

Teachers must be able to navigate this hierarchy easily and understand where every lesson fits within the broader academic curriculum.

Do not hardcode lesson content directly into individual UI components. The curriculum should be driven by structured data so that lessons, topics, units, and courses can be updated without redesigning the interface.

---

# 3. Teacher Dashboard and Navigation

Create a new dedicated section within the existing Mathlete MTB website called:

**Teacher Curriculum**

This should be accessible from the existing site navigation or teacher dashboard.

Before implementing, inspect the existing navigation, authentication system, organization structure, and teacher-facing pages. Integrate the new section into the current architecture.

Do not introduce a second login system or duplicate existing functionality.

## Teacher Curriculum landing page

The landing page should display the available mathematics courses in an attractive, organized layout.

Each course should be represented by a visually appealing course card.

Each card should include:

- Course name.
- Brief course description.
- Appropriate course icon or visual.
- Number of available units or lessons.
- A clear indication of the current quarter.
- A button or clickable area to explore the curriculum.

Suggested layout:

**TEACHER CURRICULUM**

*Your complete mathematics teaching companion.*

[Algebra 1] [Geometry]  
[Algebra 2] [Precalculus]

Keep the interface clean and uncluttered. Avoid making the dashboard feel like a complicated school administration system.

Use Mathlete MTB's existing design language, typography, color palette, and branding.

## Course landing page

When a teacher selects a course, they should arrive at a dedicated course curriculum page.

Example: Algebra 1

Display:

- Course title and description.
- Quarter navigation.
- Units within each quarter.
- Individual lessons within each unit.
- Lesson duration, where available.
- Lesson completion or planning status.
- Clear indicators for available lesson resources.

Quarter navigation should be simple and intuitive.

Example:

[Quarter 1] [Quarter 2] [Quarter 3] [Quarter 4]

Selecting a quarter displays the units and corresponding lessons for that quarter.

Organize lessons into expandable units or another intuitive navigation format.

Teachers should be able to find any lesson in a few clicks.

---

# 4. The Lesson Plan Experience

This is the most important component of the entire feature.

Every individual lesson should open into a beautifully formatted, professionally designed lesson workspace.

The layout should feel like an exceptional digital textbook combined with a modern teaching guide.

It must be visually engaging while remaining practical and easy to use during an actual class.

Do not simply display a long wall of text.

Use clear section headings, visual hierarchy, mathematical notation, diagrams, images, interactive activities, and appropriately spaced content.

## Standard lesson plan structure

Every lesson must follow a consistent framework.

### Section 1: Lesson Header

Display:

- Lesson title.
- Course.
- Quarter.
- Unit.
- Topic.
- Estimated duration.
- Recommended grade level, where applicable.

Include an engaging image or visual associated with the MTB application when appropriate.

Example:

**UNDERSTANDING SLOPE**

*How steep is the trail?*

Algebra 1 | Quarter 2 | Linear Relationships

Estimated duration: 50 minutes

### Section 2: Learning Objectives

Clearly identify what students should understand and be able to do by the end of the lesson.

Objectives should be measurable and written in student-friendly language.

Example:

By the end of this lesson, students will be able to:

- Define slope as a measure of change.
- Calculate slope using two coordinate points.
- Interpret positive, negative, zero, and undefined slopes.
- Apply the concept of slope to real-world situations.

### Section 3: Essential Question

Give teachers a central question that can introduce and guide the lesson.

Example:

*How can mathematics help us understand how steep a mountain bike trail is?*

### Section 4: Mathematical Foundation

Explain the actual mathematics being taught.

Include:

- Key vocabulary.
- Relevant mathematical formulas.
- Mathematical concepts.
- Definitions.
- Worked examples.
- Diagrams and graphs when appropriate.

Mathematical instruction must be accurate, comprehensive, and aligned with the course and topic.

MTB applications must never replace the actual academic instruction.

### Section 5: MTB Connection — Real-World Relevance

Every lesson must include an explicit MTB-related connection.

Explain how the mathematical concept applies to mountain biking.

This section should communicate why the mathematics matters and give students an opportunity to connect abstract ideas to something tangible.

Examples:

| Math concept | MTB application |
|---|---|
| Slope | Trail steepness and elevation profiles |
| Quadratic functions | Mountain bike jump trajectories |
| Ratios | Gear ratios and suspension setup |
| Geometry | Bicycle frame geometry |
| Trigonometry | Ramp angles and trail gradients |
| Statistics | Analyzing ride performance data |
| Vectors | Direction and velocity of a rider |
| Exponential functions | Modeling changes in relationships over time |
| Area and volume | Designing trail features and calculating dimensions |
| Linear functions | Distance, time, and riding speed |

The MTB connection should be directly relevant to the lesson's mathematical objective.

### Section 6: Teacher Instruction — Step-by-Step Lesson Delivery

Provide a structured teaching guide.

Break the lesson into logical teaching stages.

For each stage, provide:

- What the teacher should introduce.
- What the teacher should explain.
- Suggested questions to ask students.
- What students should do.
- Any mathematical examples or demonstrations.
- Expected student understanding.

Where appropriate, include suggested teaching durations.

Example:

**Introduction — 5 minutes**

Introduce the idea of trail steepness. Ask students how they would determine which of two trails is steeper.

**Concept introduction — 10 minutes**

Introduce rise over run and the slope equation.

**MTB activity — 15 minutes**

Students investigate different trail profiles using the Mathlete MTB slope tool.

**Guided practice — 10 minutes**

Work through mathematical examples as a class.

**Independent practice — 10 minutes**

Students solve problems independently and complete an exit question.

The durations should be adjustable to fit different classroom schedules.

### Section 7: Mathlete MTB Interactive Activity or Lab

This is a required section of every lesson.

Each lesson must include at least one MTB-based learning activity.

Prioritize existing Mathlete MTB tools, labs, and interactive simulations.

When a relevant existing tool is available, embed or link directly to it within the lesson plan.

The experience should be seamless: teachers should not have to search around the website to find the relevant activity.

Every activity must include:

- Activity title.
- Learning objective.
- Connection to the mathematical concept.
- Materials or technology required.
- Teacher instructions.
- Student instructions.
- Questions students should investigate.
- Expected learning outcomes.

If an existing interactive Mathlete tool does not exist for a specific lesson, develop an MTB-related activity that can be completed through a simulation, diagram, worksheet, class discussion, or real-world problem.

Do not invent non-existent tool URLs or create broken links.

Mark the activity type clearly:

- Interactive Mathlete Tool
- Mathlete MTB Lab
- MTB Classroom Activity
- MTB Problem-Based Exercise

Examples:

**Linear Relationships:** Trail Slope Explorer.

**Quadratic Functions:** Mountain Bike Jump Lab.

**Geometry:** Bicycle Frame Geometry Investigation.

**Trigonometry:** Ramp Angle and Trail Gradient Lab.

**Statistics:** Analyze Mountain Bike Ride Data.

**Vectors:** Rider Velocity and Direction Lab.

The activity should be a meaningful part of the lesson, not just an optional decorative feature.

### Section 8: Guided Practice

Provide several worked mathematical examples.

Begin with straightforward problems and gradually introduce more challenging examples.

Include a mixture of traditional math problems and MTB-related applications.

Each problem should include:

- The question.
- The relevant mathematical concept.
- A step-by-step solution.
- The correct answer.

Provide solutions in a teacher-accessible format.

### Section 9: Independent Student Practice

Provide a set of problems students can complete independently.

Include:

- Basic conceptual questions.
- Standard curriculum-aligned problems.
- MTB application problems.
- More challenging extension questions.

Problems should increase in difficulty.

Do not make every question MTB-themed. Students must also demonstrate that they can apply mathematics to conventional problems.

### Section 10: Assessment and Exit Ticket

Every lesson should include a brief assessment to check student understanding.

Include approximately 3–5 questions.

Assess the actual mathematical learning objectives, not just whether students enjoyed the MTB activity.

Include answers and explanations in the teacher resources.

### Section 11: Teacher Resources

Provide a dedicated resource section containing:

- Complete answer key.
- Worked solutions.
- Teaching notes.
- Common student misconceptions.
- Suggested differentiation strategies.
- Printable student worksheet, where applicable.
- Additional challenge questions.

Answer keys should be easily accessible to teachers and not inadvertently displayed in the student-facing experience.

---

# 5. Visual Design Requirements

Visual quality is a major priority.

The lesson plans should feel professionally designed, visually interesting, and significantly better organized than a typical collection of online worksheets.

## Design direction

Use the existing Mathlete MTB website aesthetic as the foundation.

Preserve the existing branding, navigation style, typography, and color scheme.

Enhance the presentation through:

- Beautifully organized content sections.
- Large, clear lesson titles.
- Consistent typography.
- Carefully selected MTB imagery.
- High-quality mathematical diagrams.
- Clearly displayed formulas.
- Attractive activity cards.
- Visual separation between teacher instructions and student activities.
- Consistent spacing and alignment.

Avoid unnecessary animations, excessive colors, clutter, or oversized dashboard elements.

Prioritize readability and usability.

## Visual components

Develop reusable UI components for:

1. Lesson header.
2. Learning objective cards.
3. Essential question section.
4. Mathematical explanation blocks.
5. Formula and worked-example blocks.
6. MTB connection cards.
7. Interactive activity launch cards.
8. Teacher instruction timeline.
9. Practice question blocks.
10. Expandable answer explanations.
11. Assessment cards.
12. Printable resource cards.

These components should be reused across all courses and lessons to ensure visual consistency.

## Responsive design

The experience must work well on:

- Desktop computers.
- Laptops.
- Tablets.

Desktop should be the primary design target because teachers will likely use the platform while preparing and delivering lessons.

The lesson plan should also remain readable and navigable on smaller screens.

---

# 6. Teacher and Student Views

Build the content architecture so that teacher and student experiences can eventually use the same underlying lesson content while displaying different information.

For the initial implementation, prioritize the teacher-facing experience.

However, structure the lesson data to support separate teacher and student views.

**Teacher view:**

- Teaching instructions.
- Learning objectives.
- Lesson timing.
- Answer keys.
- Worked solutions.
- Common misconceptions.
- Additional teaching resources.

**Student view:**

- Essential question.
- Mathematical explanations.
- MTB activities.
- Guided and independent practice.
- Interactive tools.
- Assessments.

Teacher-only content must be clearly distinguished and protected from student access.

---

# 7. Curriculum Content Architecture

Build the lesson library using a reusable, structured data model.

Suggested conceptual structure:

Course
- Course ID
- Course name
- Course description
- Grade level

Quarter
- Quarter ID
- Quarter number
- Course ID
- Quarter description
- Display order

Unit
- Unit ID
- Quarter ID
- Unit name
- Description
- Display order

Topic
- Topic ID
- Unit ID
- Topic name
- Description
- Display order

Lesson
- Lesson ID
- Topic ID
- Lesson title
- Lesson description
- Estimated duration
- Learning objectives
- Essential question
- Mathematical content
- MTB connection
- Teacher instructions
- MTB activity
- Guided practice
- Independent practice
- Assessment
- Teacher resources
- Relevant standards
- Display order
- Publication status

Use appropriate structured fields or reusable content blocks rather than storing the entire lesson as one unstructured text field.

Support mathematical notation and properly formatted equations.

Allow activity content to reference existing Mathlete MTB tools through stable tool IDs or routes wherever possible.

Do not duplicate existing tool functionality.

---

# 8. Content Quality Requirements

Consistency and mathematical accuracy are essential.

Every published lesson must meet the following requirements:

1. It must align with the topic's intended mathematical learning objectives.
2. It must include at least one meaningful MTB connection.
3. It must include a real teaching activity, not simply an MTB-themed paragraph.
4. It must explain the mathematics accurately.
5. It must include guided and independent practice.
6. It must include an assessment.
7. It must provide a teacher answer key.
8. It must be usable by a teacher without extensive additional preparation.

MTB examples must be appropriate to the mathematical difficulty of the course.

For example, Algebra 1 students should not be required to understand advanced physics in order to complete a lesson about slope.

Where a lesson uses theoretical MTB data or simplified physics models, clearly communicate the assumptions being made.

Do not imply that a simplified educational model is a complete representation of real-world mountain biking physics.

---

# 9. Initial Curriculum Population

Build the architecture to support all four courses and all four quarters.

For the initial release:

- Create the course pages for Algebra 1, Geometry, Algebra 2, and Precalculus.
- Create the quarterly navigation for each course.
- Populate the actual active-quarter curriculum for all four courses.
- Organize every topic within its appropriate unit.
- Provide a complete lesson plan for every topic included in the active quarter.
- Ensure every lesson includes its own MTB application, activity, or lab.
- Ensure existing Mathlete MTB tools are linked to the appropriate lessons.

Do not populate the entire four-year/annual curriculum with generic placeholder lessons just to make the website appear complete.

Where the existing application or supplied curriculum does not contain the current quarterly sequence, create a reasonable proposed course sequence based on established high-school mathematics content and make it configurable.

Clearly distinguish proposed curriculum content from confirmed school-specific curriculum.

Content must be developed at a level that teachers could genuinely use, not merely short descriptions or empty lesson templates.

---

# 10. Navigation and Teacher Usability

Make the lesson experience intuitive.

Teachers should be able to:

- Open Teacher Curriculum.
- Select a course.
- Select a quarter.
- Expand a unit.
- Select an individual topic.
- Open the complete lesson.
- Launch the relevant MTB activity.
- Return to the lesson without losing their place.

Include clear breadcrumbs at the top of each lesson.

Example:

Teacher Curriculum / Algebra 1 / Quarter 2 / Linear Relationships / Understanding Slope

Provide a previous lesson and next lesson navigation option.

Include a print-friendly version of every lesson.

The print layout should remove unnecessary navigation and preserve mathematical equations, activity instructions, and student exercises.

---

# 11. Future-Proofing

Do not build features that are unnecessary for the initial release, but ensure the architecture can support these future additions:

- Teacher-editable lesson plans.
- Save My Version functionality.
- Assignment distribution to students.
- Student lesson completion tracking.
- Classroom performance analytics.
- Automated recommendations for student review.
- Custom quarterly curriculum schedules.
- Teacher-created activities.
- Organization-specific curriculum customization.
- AI-assisted lesson generation and customization.

The initial implementation should focus on an excellent curriculum browser and complete lesson experience.

Do not let future features delay the core release.

---

# 12. Technical Implementation Instructions for Claude Code

Before making changes:

1. Inspect the existing Mathlete MTB repository and understand its current architecture.
2. Identify the current frontend framework, backend, database, routing, and styling system.
3. Inspect the existing authentication and organization/teacher access model.
4. Review existing Mathlete MTB tools, activities, and labs.
5. Identify which components can be reused.
6. Review the existing website's visual design and navigation.

Then prepare and implement the feature within the current architecture.

### Important implementation constraints

- Do not rebuild the existing website.
- Do not replace existing learning tools.
- Do not break existing authentication or organization access.
- Do not duplicate existing course or tool functionality.
- Reuse existing design components wherever appropriate.
- Use reusable components for course, quarter, unit, topic, and lesson navigation.
- Keep lesson content separate from UI presentation.
- Ensure course and lesson content can be expanded through structured data.
- Preserve existing Mathlete MTB functionality.
- Ensure teacher-only materials are protected by the appropriate access controls.
- Use the existing site's routing conventions.
- Build a maintainable system rather than hardcoding each lesson as a separate page.

If an architectural decision depends on an existing feature, inspect that feature and integrate with it instead of assuming how it works.

---

# 13. Suggested Development Milestones

Implement the feature in the following order.

### Milestone 1: Teacher Curriculum Landing Page

Build the new Teacher Curriculum navigation entry and landing page.

Display the four courses with an attractive course-card layout.

### Milestone 2: Curriculum Navigation

Build course pages, quarterly navigation, expandable units, and topic lists.

Ensure the hierarchy is data-driven.

### Milestone 3: Reusable Lesson Plan Template

Build the complete lesson workspace and all reusable lesson components.

Create one fully developed sample lesson to validate the presentation.

Recommended first lesson: Algebra 1 — Understanding Slope — How Steep Is the Trail?

This lesson should demonstrate mathematical instruction, a relevant MTB application, a Mathlete MTB interactive activity or lab, guided practice, independent practice, assessment, and teacher resources.

### Milestone 4: Populate the Active Quarter

Develop complete lesson content for every topic in the active quarter of all four courses.

Prioritize quality, usability, and accurate mathematical instruction.

Ensure every lesson contains a meaningful MTB component.

### Milestone 5: Navigation and Print Experience

Implement breadcrumbs, previous/next lesson navigation, and print-friendly formatting.

### Milestone 6: Quality Assurance

Test the entire teacher experience.

Verify that:

- Every course opens correctly.
- All four quarters appear.
- Units and topics display in the right order.
- Every published topic has a complete lesson plan.
- Every lesson includes an MTB-related component.
- Existing Mathlete tools open correctly.
- All equations render properly.
- Answer keys are accessible to teachers.
- The lesson layout works on desktop and tablet.
- Printing produces a readable lesson document.
- Existing website functionality remains intact.

---

# 14. Definition of Done

The initial release is complete when a teacher can:

1. Navigate to the new Teacher Curriculum section.
2. Select Algebra 1, Geometry, Algebra 2, or Precalculus.
3. Navigate to the appropriate quarter.
4. Browse the units and topics in that quarter.
5. Open a complete, professionally formatted lesson plan for every topic in the active quarter.
6. Understand exactly what the lesson teaches and how to deliver it.
7. Teach the mathematical concept using a meaningful MTB application.
8. Launch a relevant Mathlete MTB tool or activity directly from the lesson.
9. Access guided practice, independent practice, assessment questions, and answer keys.
10. Print the lesson for classroom use.

**The most important measure of success: A teacher should be able to open Mathlete MTB, select tomorrow's lesson, and have practically everything they need to teach it.**

---

# Final Product Direction

Build this as a core part of the Mathlete MTB platform, not as a standalone collection of lesson-plan webpages.

The course structure, curriculum navigation, lesson templates, and activities should all work together as one cohesive teacher experience.

We want a beautiful, structured, and scalable teaching resource that helps schools deliver an engaging mathematics curriculum through mountain biking.

**Every mathematical topic deserves a meaningful connection to the real world. With Mathlete MTB, that connection starts on the trail.**