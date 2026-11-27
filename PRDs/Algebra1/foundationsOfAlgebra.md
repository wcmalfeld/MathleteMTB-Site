# PRODUCT REQUIREMENTS DOCUMENT
# THE DREAM LINE PROJECT
### Algebra 1 — Unit 1: Foundations of Algebra

**Platform:** Mathlete MTB  
**Product:** Interactive Educational Lab  
**Proposed name:** The Dream Line Project  
**Category:** Algebra / Mountain Bike Park Design / Slopestyle / Freeride  
**Proposed route:** `/learning-lab/dream-line-project/`  
**Audience:** Middle school and high school Algebra 1 students  
**Estimated completion:** 35–50 minutes  
**Learning objectives:** Variables and Expressions, Evaluating Expressions, Order of Operations, Properties of Real Numbers.

---

# PART I — PRODUCT VISION

## 1. The concept

The student becomes a professional mountain bike park designer and trail builder.

They have been given an undeveloped piece of land and the opportunity to create their dream MTB playground.

Their vision is to build an incredible progression park that combines:
- Dirt jumping.
- Slopestyle.
- Freeride.
- Flow trails.
- Berms and rollers.
- Wooden features and wall rides.
- Beginner, intermediate and expert riding zones.

Their job is to design the park, plan the construction, organize materials, calculate resources and present a finished park blueprint.

Throughout the project, they encounter mathematical challenges that must be solved to advance.

**Educational philosophy:** The math should be necessary to accomplish the mission. Students should not feel like they are completing unrelated worksheets disguised with mountain bike terminology.

## 2. Product differentiation

Mathlete already has a Trail Builder tool that focuses on trail routing, client requirements, elevation targets and mathematical problems associated with individual trail segments.

The Dream Line Project must be a distinct experience.

Trail Builder is about designing a trail network.

Dream Line Project is about creating a slopestyle/freeride bike park and organizing its design and construction.

Reuse common interaction patterns and shared components where appropriate, but do not duplicate Trail Builder or modify its existing functionality.

## 3. Primary learning outcomes

By completing the lab, students should be able to:

**Variables and Expressions**
- Translate written descriptions into algebraic expressions.
- Identify variables, coefficients, constants and terms.
- Explain what an expression represents in a real-world situation.

**Evaluating Expressions**
- Substitute values for variables.
- Evaluate expressions containing integers, negatives, fractions and decimals.
- Evaluate practical formulas and interpret their results.

**Order of Operations**
- Apply the order of operations correctly.
- Simplify expressions containing parentheses, brackets, exponents and fraction bars.
- Identify and correct incorrect calculations.

**Properties of Real Numbers**
- Classify numbers as natural, whole, integer, rational and irrational.
- Identify and apply commutative, associative, identity, inverse and distributive properties.
- Use mathematical properties to rewrite and simplify expressions.
- Understand how like terms can be combined.

---

# PART II — THE MAIN APPLICATION

## 4. Opening experience: The empty canvas

When the student launches the lab, show an immersive introduction.

### Opening screen

**Headline: THE DREAM LINE PROJECT**

"Every mountain biker has imagined their dream jump park. Now you get to build yours.

You've been given a piece of land, a construction crew and a blank canvas.

Your mission is to create the ultimate mountain bike playground. You'll need to design the features, organize the materials and use mathematics to bring your vision to life.

Let's get shaping."

Show an illustrated landscape with an empty park-design area.

Primary CTA: `START BUILDING`

### Park customization

Allow the student to choose one of three visual environments:

1. Forest Jump Park — a woodland dirt-jump and slopestyle compound.
2. Alpine Freeride Zone — a mountainous freeride setting.
3. Backyard Compound — a personal progression and dirt-jump park.

These choices change the visual presentation only. All three use the same curriculum, mathematics and challenge structure.

Keep customization simple. Do not let it distract from the learning objectives.

## 5. Main application layout

Create a persistent park-building interface.

### Primary sections

**A. Park Design Canvas**

A top-down illustrated map showing the land where the student will place features.

Provide:
- Empty design zones.
- Existing terrain/background.
- Feature placement.
- Selected feature highlighting.
- Feature removal.
- Visual park progression.

Features should be represented through attractive illustrated icons or small SVG illustrations.

**B. Feature Library**

An expandable feature selection panel.

Include:
- Tabletop jump.
- Hip jump.
- Step-up.
- Step-down.
- Roller.
- Berm.
- Wooden wall ride.
- Drop feature.
- Pump track section.

Every feature should include:
- Illustration.
- Name.
- Short description.
- Feature category.
- Fictional classroom planning resource requirement.

**C. Build Plan**

A persistent panel showing:
- Selected feature counts.
- Current variables.
- Resource expressions.
- Calculated totals when appropriate.
- Current stage progress.

**D. Challenge Panel**

Displays the active mathematical problem, context, response input, hints and feedback.

**E. Math Workbench**

A collapsible or adjacent learning panel displaying the mathematical concepts and step-by-step calculations relevant to the current challenge.

### Important design principle

The map should be visually engaging, but the expressions and their meanings must remain highly readable.

Use a polished 2D illustrated or SVG environment. Avoid resource-heavy 3D environments that add complexity without improving learning.

The map is a conceptual park-design illustration, not a scaled engineering drawing.

Feature placement must work through both drag-and-drop and tap-to-add interactions. Mobile users must not need drag-and-drop to complete the lab.

---

# PART III — LEARNING STAGES

# STAGE 01: CREATE THE BLUEPRINT
## Variables and Expressions

### Learning mission

The student is the lead designer. Before the park can be built, they need to develop a blueprint and estimate the resources needed.

Introduce a construction brief.

"Your build crew has been hired to create a new park. Each feature requires a certain amount of crew time. The team needs to estimate how much time the park will take to build."

### Core concept

Suppose:
- Each tabletop requires 4 simulated crew-hours.
- Each berm requires 3 simulated crew-hours.
- Initial site preparation requires 5 crew-hours.

Define:
- `t` = number of tabletops.
- `b` = number of berms.
- `H` = total estimated crew-hours.

The expression is:

`H = 4t + 3b + 5`

Clearly explain that these are fictional classroom planning estimates, not actual construction standards.

### Activity 1 — Build the expression

Present the written scenario:

"Every tabletop requires four hours of shaping. Every berm requires three hours. Preparing the site takes five additional hours."

Ask:

"How could we represent the total build time without knowing how many tabletops and berms we will build?"

Provide interactive building blocks:
- 4
- 3
- 5
- t
- b
- +
- −
- ×
- Parentheses

Students assemble:

`4t + 3b + 5`

Start with a guided version and then provide independent expression-building challenges.

**Feedback:**

When students select `4t`, explain:

"Correct! There are t tabletops, and each one requires 4 hours. Multiplying the number of tabletops by 4 gives us the total tabletop shaping time."

For incorrect answers, provide conceptual hints before revealing the solution.

### Activity 2 — Expression anatomy

Display:

`H = 4t + 3b + 5`

Make each section interactive.

Students select:
- Variables.
- Coefficients.
- Constants.
- Terms.

Correct classifications:

| Component | Answer |
|---|---|
| Variables | t and b |
| Coefficients | 4 and 3 |
| Constant | 5 |
| Terms | 4t, 3b and 5 |

Animate the selected component in the blueprint and show its real-world meaning.

Students must understand:
- Variables represent quantities that can change.
- Coefficients multiply variables.
- Constants are fixed values.
- Terms are the separate parts of an expression, separated by addition or subtraction.

### Activity 3 — Translate the builder's notes

Present new descriptions and require the student to create expressions.

Examples:

1. Every wooden feature requires six planning units and there are w wooden features. Expression: `6w`.

2. Each jump requires 4 shaping units and each berm requires 3 shaping units. Expression: `4j + 3b`.

3. Each of n construction kits contains 2 flags and 3 markers. Expression: `5n`.

4. Every feature requires 4 planning units, and the site preparation requires 8 additional units. Expression: `4f + 8`.

Use a mixture of selection-based and manually constructed answers.

### Activity 4 — Explain the blueprint

Give the student a completed expression and ask questions:

- What does the variable represent?
- Why is there a coefficient?
- What does the constant tell us?
- What happens when the number of features increases?
- Which parts of the expression represent fixed and changing quantities?

Include short-answer explanations with sample responses and a tutor-review option.

### Activity 5 — Design Your Own Line

Now allow the student to add features to the visual park canvas.

Every time a feature is added:
- Update the feature count.
- Update the corresponding variable.
- Update the algebraic expression.
- Visually highlight the changed term.

Let the student see the relationship between their creative choices and the algebraic model.

**Stage completion:** Earn the `BLUEPRINT DESIGNER` badge.

---

# STAGE 02: PLAN THE BUILD
## Evaluating Expressions

### Learning mission

The blueprint is finished. Now the construction crew needs to know exactly how many resources are required.

The student must replace variables with actual values and calculate the results.

### Activity 1 — Calculate the construction plan

Return to the expression:

`H = 4t + 3b + 5`

The student has chosen:
- 3 tabletops.
- 2 berms.

Ask the student to substitute the values.

`H = 4(3) + 3(2) + 5`

Correct result:

`H = 23 crew-hours`

Present this as a step-by-step interactive substitution problem.

Show the individual resource requirements visually:
- Tabletop shaping: 12 hours.
- Berm shaping: 6 hours.
- Site preparation: 5 hours.

Total: 23 hours.

Make sure the student enters the substituted expression before entering the final answer.

### Activity 2 — Elevation mapping

Introduce a simplified elevation profile for the park.

The starting location is 2,400 feet above sea level. A mapped section descends 125.5 feet.

Use:

`Ef = Ei + ΔE`

Where:
- `Ef` = final elevation.
- `Ei` = initial elevation.
- `ΔE` = signed elevation change.

Substitute:

`Ef = 2400 + (-125.5)`

Correct answer: `2274.5 feet`.

Visualize this with a vertical elevation indicator.

Then provide additional problems involving positive and negative elevation changes.

Teach explicitly that:
- Positive values can represent elevation gains.
- Negative values can represent elevation losses.
- Adding a negative value means subtracting that amount.

### Activity 3 — Mapping fractions

The student has mapped 3/4 of a planned 2.4-mile park trail network.

Use:

`D = (3/4)L`

Substitute:

`D = (3/4)(2.4)`

Correct answer: `1.8 miles`.

Visually highlight three of four sections of the trail map.

Introduce additional fraction substitution problems.

### Activity 4 — Decimal measurements

Introduce additional practical measurements that use decimals.

Example:

A planned trail connection is 1.25 miles long. The new connector adds 0.75 miles.

`D = 1.25 + 0.75`

Answer: `2 miles`.

Create multiple problems in which the student substitutes and evaluates decimals.

### Activity 5 — Prediction and evaluation challenges

Provide a challenge sequence with increasing difficulty.

| Difficulty | Skill |
|---|---|
| Beginner | Substitute whole numbers. |
| Intermediate | Evaluate decimal expressions. |
| Intermediate | Evaluate expressions with fractions. |
| Advanced | Evaluate expressions with negative values. |
| Advanced | Evaluate multi-variable real-world formulas. |

Each challenge must use a prediction-first interaction:

1. Present the scenario.
2. Ask the student to predict the answer.
3. Lock in the prediction.
4. Allow them to substitute the values.
5. Enter the calculated result.
6. Reveal the visualization and worked solution.

**Stage completion:** Earn the `BUILD PLANNER` badge.

---

# STAGE 03: ORGANIZE THE MATERIALS
## Order of Operations

### Learning mission

The park is getting closer to completion. Your team has prepared its inventory requirements, but the calculations are mixed up.

The student becomes the construction inventory manager.

They need to calculate the correct material quantities and catch mistakes in the crew's calculations.

### Activity 1 — The inventory calculation

Introduce this scenario:

The park has three separate feature zones.

Each zone needs:
- 18 standard boundary markers.
- A square 2-by-2 arrangement of four feature markers.

There are also 12 extra perimeter markers shared across the entire park.

The expression:

`M = 3(18 + 2²) + 12`

The student must simplify the expression.

Correct steps:

1. Exponents: `2² = 4`.
2. Parentheses: `18 + 4 = 22`.
3. Multiplication: `3 × 22 = 66`.
4. Addition: `66 + 12 = 78`.

Correct answer: 78 markers.

Visually display the marker groups as they are calculated.

Use this to teach:
- Grouping symbols first.
- Exponents.
- Multiplication and division.
- Addition and subtraction.

### Activity 2 — The Shaper's Calculation Board

Create an interactive expression simplifier.

Show an expression with each operation individually selectable.

The student selects the operation that should be completed next.

Required challenge examples:

| Expression | Correct answer |
|---|---:|
| `5 + 3 × 4` | 17 |
| `48 ÷ 6 × 2` | 16 |
| `18 - 4 + 3` | 17 |
| `2[7 + (3²)] ÷ 4` | 8 |
| `(18 + 6) ÷ 3` | 8 |
| `3(18 + 2²) + 12` | 78 |

Every operation should be visually highlighted as it is simplified.

Use a clear left-to-right explanation for operations with equal priority.

### Activity 3 — Parentheses change everything

Show two calculations:

`3(6 + 2)`

And:

`3 × 6 + 2`

The student predicts the answers, then evaluates both.

Correct results:
- First expression: 24.
- Second expression: 20.

Explain how grouping changes the result.

Provide additional variations involving parentheses and brackets.

### Activity 4 — Fraction bar challenge

Introduce the fraction bar as another grouping symbol.

For example:

A supply order contains 18 standard markers and 6 additional markers. Divide the complete quantity equally among three park zones.

Show:

`(18 + 6) / 3`

Or:

`(18 + 6) ÷ 3`

Correct answer: 8.

Visually show the numerator grouping and division.

Require students to identify which part of the fraction is treated as the numerator and which as the denominator.

### Activity 5 — Catch the Crew's Mistake

This should be one of the most engaging activities in the stage.

Create a collection of incorrect calculations written by fictional construction crew members.

Example:

Question:

`48 ÷ 6 × 2`

The crew calculates:

`48 ÷ 12 = 4`

Ask the student:

"Where did the crew go wrong?"

Correct reasoning:

Multiplication and division share priority, so work from left to right.

`48 ÷ 6 = 8`

`8 × 2 = 16`

Additional examples:
- Treating addition and subtraction as though addition always comes first.
- Ignoring parentheses.
- Incorrect exponent calculations.
- Ignoring the grouping created by fraction bars.

Let students select the first incorrect line and explain the correction.

**Stage completion:** Earn the `MATERIALS MANAGER` badge.

---

# STAGE 04: THE BUILDER'S MATH TOOLKIT
## Properties of Real Numbers

### Learning mission

The park is nearly complete.

Before finishing the project, the student needs to understand how different number systems work and how mathematical properties can make complex calculations simpler.

This stage has two distinct learning areas.

## Activity 1 — The Number Sorting Challenge

Create an interactive number classification experience.

Introduce these categories:
- Natural numbers.
- Whole numbers.
- Integers.
- Rational numbers.
- Irrational numbers.

Use a visual nested number-set diagram:

Natural ⊂ Whole ⊂ Integers ⊂ Rational ⊂ Real.

Irrational numbers are also real numbers but are not rational.

**Number cards:**

| Card | Park context | Classification |
|---|---|---|
| 6 | Six jump features | Natural, whole, integer, rational |
| 0 | Zero extra materials needed | Whole, integer, rational |
| -4 | Four feet of signed elevation change | Integer, rational |
| 2.5 | A mapped trail measurement | Rational |
| 3/4 | A fraction of the park completed | Rational |
| π | Wheel circumference constant | Irrational |
| √2 | Diagonal of a unit square on a park map | Irrational |

Explicitly state that this lab uses the convention that natural numbers start at 1.

For each card:
1. Student selects applicable classifications.
2. Correct classifications are shown in the number-set diagram.
3. Explain why the number belongs to each set.
4. Provide a quick follow-up question.

Do not just ask students to memorize category names. Help them understand the relationship between the sets.

## Activity 2 — The Properties Workshop

Create an interactive equipment workshop where the student learns how to rearrange, regroup and simplify mathematical expressions.

Each property should have its own illustrated interactive experience.

### A. Commutative Property

Explain that the order of numbers can change when adding or multiplying without changing the result.

Example:

`4 + 6 = 6 + 4`

Park context:

Four equipment bundles plus six equipment bundles produce the same total regardless of the order.

Also demonstrate multiplication:

`4 × 6 = 6 × 4`

Include a non-example:

`8 - 3 ≠ 3 - 8`

Teach when the property does and does not apply.

### B. Associative Property

Explain that numbers can be grouped differently when adding or multiplying.

Example:

`(2 + 3) + 4 = 2 + (3 + 4)`

Park context:

The student has three piles of equipment. They can combine the first two piles before adding the third, or combine the last two first.

Show the two groupings visually.

Include multiplication examples as well as addition.

Include subtraction and division non-examples.

### C. Identity Property

Introduce additive and multiplicative identity.

Additive:

`8 + 0 = 8`

Multiplicative:

`8 × 1 = 8`

Explain why adding zero or multiplying by one does not change the original quantity.

Use equipment counts as the visual examples.

### D. Inverse Property

Cover both additive and multiplicative inverses.

Additive inverse:

`7 + (-7) = 0`

Multiplicative inverse:

`4 × (1/4) = 1`

Explain that a nonzero number multiplied by its reciprocal equals one.

For the park context, use equal and opposite elevation changes for additive inverses, and reciprocal quantity calculations for multiplicative inverses.

Clearly state that zero does not have a multiplicative inverse.

### E. Distributive Property

This is a particularly useful concept for the workshop activity.

Introduce:

`5(2 + 3)`

Explain that five builders each need two flags and three markers.

The student can calculate:

`5(5) = 25`

Or distribute:

`5(2) + 5(3)`

`10 + 15 = 25`

Animate the equipment being distributed across five construction kits.

Then introduce variables:

`4(x + 2) = 4x + 8`

Explain how multiplication distributes across everything inside the parentheses.

### F. Combining Like Terms

Build on the distributive and expression concepts.

Example:

`3t + 2t = 5t`

Park context:

Three planned tabletops plus two additional tabletops results in five tabletops.

Then show:

`3t + 2b`

Explain why these cannot simply be combined into `5tb` or `5t`.

Students should distinguish between terms with matching variables and terms representing different quantities.

## Activity 3 — Identify the Property

Create a rapid-fire classification game.

Show mathematical expressions and ask students to identify the property.

Examples:

- `7 + 3 = 3 + 7`
- `(2 + 4) + 5 = 2 + (4 + 5)`
- `9 + 0 = 9`
- `8 + (-8) = 0`
- `3(4 + 2) = 3(4) + 3(2)`
- `6 × 1 = 6`

Include incorrect applications as distractors.

### Stage completion

Earn the `MASTER SHAPER` badge.

---

# PART IV — FINAL PROJECT AND CERTIFICATION

## 6. The Finished Park Blueprint

After completing all four stages, return the student to their park-design canvas.

Show their completed park, all selected features and their resource calculations.

The student should see the finished creation as a reward for the mathematical work they completed.

Display:
- Park name.
- Selected environment.
- Feature count.
- Build-plan expression.
- Calculated resource totals.
- Completed learning stages.
- Four achievement badges.

Provide an opportunity to name the park and write a short description.

For example:

"My Dream Line Park has three tabletops, two berms and a wooden wall ride. My construction plan uses algebra to estimate the total crew-hours required."

This written summary reinforces mathematical interpretation.

## 7. Final Algebra Certification

Create a final assessment of 8–10 questions.

It should include new examples rather than simply repeating the stage questions.

Suggested distribution:

| Topic | Number of questions |
|---|---:|
| Variables and Expressions | 2 |
| Evaluating Expressions | 2–3 |
| Order of Operations | 2 |
| Properties of Real Numbers | 2–3 |

Require students to demonstrate:
- Expression creation.
- Variable identification.
- Substitution.
- Negative, decimal and fractional evaluation.
- Correct order of operations.
- Error identification.
- Number classification.
- Mathematical property identification and application.

Include numeric-entry, expression-building, matching and short-explanation question types.

### Results screen

Show:
- Overall assessment score.
- Accuracy by learning objective.
- First-attempt accuracy.
- Hints used.
- Questions answered independently.
- Questions needing additional practice.
- Completed badges.
- Final park blueprint.

Distinguish independent mastery from answers completed after significant help.

Provide buttons:
- `REVISIT A STAGE`
- `RETRY THE CERTIFICATION`
- `VIEW MY DREAM PARK`

---

# PART V — LEARNING SYSTEMS

## 8. Prediction-first interactions

Follow the conventions of Mathlete's existing educational labs.

Whenever appropriate, require students to predict the outcome before revealing the simulation.

Example:

"The construction crew is adding two new tabletops. Will the total estimated crew time increase by 4 hours, 8 hours or 12 hours?"

The student commits to a prediction.

Then the system reveals the updated expression and calculations.

Do not use prediction requirements on every single exercise. Use them where they reinforce the learning objective.

## 9. Hint system

Use progressive hints.

Example:

Problem: `4t + 3b + 5`

Hint 1: "Look at how many different types of features are in the park."

Hint 2: "The letter t represents the number of tabletops."

Hint 3: "Each tabletop requires four planning units. How could you represent four times t?"

Reveal:

`4t + 3b + 5`

Hints must teach rather than simply reveal answers.

Incorrect responses should trigger helpful feedback and allow another attempt.

## 10. Math Workbench

Provide a dedicated Math Workbench following existing Mathlete conventions.

It should appear alongside the interactive experience, not in a completely separate learning page.

### Simple mode

Show:
- Concept definition.
- Plain-language explanation.
- Formula or expression.
- Explanation of variables.
- A worked example.
- A connection to the park-design activity.

### Advanced mode

Show:
- Full algebraic expression.
- Substituted values.
- Step-by-step calculations.
- Relevant properties.
- Explanation of common errors.

The workbench should update based on the active challenge.

Avoid overwhelming beginners with every concept at once.

## 11. Difficulty progression

Every stage should gradually increase in difficulty.

Use three levels:

**Beginner**
- Guided examples.
- Whole numbers.
- One-variable expressions.
- Simple calculations.
- Multiple-choice support.

**Intermediate**
- Multiple variables.
- Decimals and fractions.
- Mixed operations.
- More complicated grouping.
- Independent expression creation.

**Advanced**
- Multi-step questions.
- Negative values.
- More complex expressions.
- Error correction.
- Explanation and justification.

Challenge progression should be driven by learning, not speed.

## 12. Tutor Mode

Maintain compatibility with existing Mathlete Tutor Mode.

Tutor should be able to:
- Select any stage.
- Choose individual challenges.
- Enable or disable prediction requirements.
- Show or hide hints.
- Reveal solutions.
- Review the student's written responses.
- Guide the experience without resetting progress.

Use the existing Tutor Mode conventions and session-reporting systems wherever possible.

## 13. Session summary

At the end of a session, generate a report.

Include:
- Questions attempted.
- Correct and incorrect answers.
- Accuracy by subtopic.
- Hints used.
- Concepts demonstrated independently.
- Common misconceptions.
- Questions requiring review.
- Suggested next activities.

Do not equate a correct guess with demonstrated mastery.

Preserve existing Mathlete student-data and privacy conventions.

---

# PART VI — UI AND VISUAL DESIGN

## 14. Art direction

The lab should feel like a premium MTB park-design experience.

The design should reflect:
- Slopestyle and freeride culture.
- MTB dirt-jump parks.
- Trail-building workshops.
- Blueprint design.
- Creative park construction.

Use the established Mathlete MTB brand system and existing site design language.

### Visual environments

**The Design Canvas**

An attractive illustrated hillside with a large open area for park features.

**The Shaper's Workshop**

Tools, construction materials and resource panels.

**The Inventory Station**

Equipment bins, supply lists and calculation boards.

**The Number Workshop**

Number cards, sorting areas and mathematical property demonstrations.

**The Finished Park**

A celebratory view of the student's completed design.

### Interaction design

Use:
- SVG illustrations.
- Animated equipment.
- Dynamic expressions.
- Feature placement.
- Highlighted mathematical terms.
- Interactive sliders where appropriate.
- Numerical input.
- Step-by-step calculations.
- Visual feedback for correct and incorrect answers.

Do not overuse animation or distracting effects.

The objective is a visually engaging educational tool, not a game that sacrifices teaching quality.

## 15. Responsive design

Desktop:
- Park canvas as the primary visual.
- Feature library and build-plan panel.
- Challenge panel and Math Workbench alongside or below the canvas.

Mobile:
- Stack the park canvas, feature library and challenge area.
- Use touch-friendly feature selection.
- Keep expressions readable.
- Provide tap-to-add and tap-to-remove functionality.
- Avoid requiring horizontal scrolling.
- Ensure the Math Workbench remains accessible.

Support keyboard navigation and accessible labels.

---

# PART VII — TECHNICAL REQUIREMENTS

## 16. Repository inspection

Before building anything, inspect the existing Mathlete MTB codebase.

Specifically inspect:
- Current application architecture.
- Existing route conventions.
- Jump Lab.
- Trail Builder.
- Berm Lab.
- Gear Ratio Lab.
- Shared Math Workbench components.
- Challenge and question systems.
- Hint systems.
- Tutor Mode.
- Session summaries.
- Authentication and membership access.
- Shared styling and UI components.

The current Mathlete labs already use prediction-first activities, interactive simulations, workbenches, progressive challenges and session reports. Reuse those patterns wherever possible.

Do not create a separate application or introduce unnecessary dependencies.

## 17. Suggested component architecture

Adapt the architecture to the current repository.

Suggested structure:

```text
DreamLineProject/
│
├── DreamLineApp
│
├── DesignCanvas/
│   ├── ParkMap
│   ├── FeatureLibrary
│   ├── FeaturePlacement
│   ├── FeatureCard
│   └── BuildPlan
│
├── Stage01_Blueprint/
│   ├── ExpressionBuilder
│   ├── ExpressionAnatomy
│   ├── DescriptionTranslator
│   └── InteractiveBlueprint
│
├── Stage02_BuildPlanner/
│   ├── SubstitutionWorkbench
│   ├── ElevationVisualizer
│   ├── FractionMapper
│   └── DecimalChallenges
│
├── Stage03_Materials/
│   ├── OrderOfOperations
│   ├── ExpressionSimplifier
│   ├── GroupingChallenge
│   └── ErrorDetection
│
├── Stage04_NumberToolkit/
│   ├── NumberSetVisualizer
│   ├── NumberSorting
│   ├── PropertyWorkshop
│   └── LikeTerms
│
├── Shared/
│   ├── MathWorkbench
│   ├── QuestionEngine
│   ├── HintSystem
│   ├── FeedbackPanel
│   ├── ProgressTracker
│   └── StageNavigation
│
└── Certification/
    ├── FinalAssessment
    ├── ParkSummary
    └── SessionReport
```

These are suggested responsibilities, not mandatory filenames.

## 18. Question bank architecture

Store educational content separately from presentation components.

Every question should support:
- Unique ID.
- Stage.
- Learning objective.
- Difficulty.
- Scenario.
- Prompt.
- Mathematical expression.
- Correct answer.
- Accepted answer formats.
- Worked solution.
- Progressive hints.
- Misconception tags.
- Optional visual reference.
- Answer type.
- Explanation of the real-world context.

Ensure the question engine is reusable for future Algebra 1 labs.

Avoid embedding large amounts of educational content directly inside UI components.

## 19. Mathematical calculation engine

All mathematical results must be deterministic and testable.

Requirements:
- Support addition, subtraction, multiplication and division.
- Support parentheses and brackets.
- Support exponents.
- Support decimals, fractions and negative numbers.
- Correctly implement operator precedence.
- Support variable substitution.
- Support numerical simplification.
- Support mathematical equivalence where appropriate.

Do not use JavaScript `eval()` to evaluate student expressions.

Use a safe expression parser or structured mathematical representation.

Ensure fractions and decimals are handled with appropriate numerical precision.

## 20. State and persistence

Track:
- Current stage.
- Completed stages.
- Park selections.
- Feature counts.
- Challenge attempts.
- Correct answers.
- Hints used.
- Stage badges.
- Certification result.

Use existing Mathlete state and persistence patterns. Do not create a second, competing system for student progress.

Preserve student progress when navigating between stages or returning to the lab according to existing platform conventions.

## 21. Performance

- Avoid excessive re-renders when adding features.
- Keep visualizations lightweight.
- Avoid unnecessary third-party packages.
- Ensure smooth interactions on standard laptops and mobile devices.
- Lazy-load large visual assets where appropriate.
- Avoid dependencies on external image services at runtime.

---

# PART VIII — MATHEMATICAL QUALITY ASSURANCE

## 22. Automated tests

Create calculation tests for the core mathematical examples.

| Test | Expected result |
|---|---:|
| `4(3) + 3(2) + 5` | 23 |
| `2400 + (-125.5)` | 2274.5 |
| `(3/4)(2.4)` | 1.8 |
| `1.25 + 0.75` | 2 |
| `3(18 + 2²) + 12` | 78 |
| `5 + 3 × 4` | 17 |
| `48 ÷ 6 × 2` | 16 |
| `18 - 4 + 3` | 17 |
| `2[7 + (3²)] ÷ 4` | 8 |
| `(18 + 6) ÷ 3` | 8 |
| `5(2 + 3)` | 25 |
| `4(x + 2)` when `x = 3` | 20 |

Verify number classifications:
- 6 belongs to natural, whole, integer and rational sets.
- 0 belongs to whole, integer and rational sets.
- -4 belongs to integer and rational sets.
- 2.5 and 3/4 are rational.
- π and √2 are irrational.

Verify:
- Commutative property.
- Associative property.
- Identity property.
- Additive inverse.
- Multiplicative inverse.
- Distributive property.
- Combining like terms.

Check non-examples to ensure that students are not taught incorrect mathematical rules.

## 23. User experience testing

Test all of the following:

- Opening screen and environment customization.
- Feature placement and removal.
- Expression updates.
- Expression-building interactions.
- Substitution and evaluation.
- Negative numbers.
- Fractions and decimals.
- Parentheses and exponents.
- Fraction bar interpretation.
- Number classification.
- Property identification.
- Progressive hints.
- Feedback and retries.
- Stage progression.
- Stage replay.
- Final assessment.
- Certification.
- Tutor Mode.
- Session reporting.
- Mobile responsiveness.
- Keyboard accessibility.

---

# PART IX — DEVELOPMENT PLAN

## 24. Recommended build sequence

### Phase 1 — Research and architecture

Inspect the repository, identify existing components and patterns, and establish the main application layout.

Do not begin by building every interaction separately.

### Phase 2 — Park Design Canvas

Build the empty park, environment options, feature library, feature placement and dynamic feature counts.

This should be the visual foundation for the experience.

### Phase 3 — Stage 01 and Stage 02

Implement the expression-building experience and substitution challenges.

Validate that the park canvas and the mathematical expressions are connected.

### Phase 4 — Stage 03 and Stage 04

Implement the inventory/order-of-operations activities and number/property workshops.

### Phase 5 — Shared learning systems

Integrate:
- Math Workbench.
- Hint progression.
- Challenge engine.
- Progress.
- Tutor Mode.
- Session reporting.

Reuse existing Mathlete components.

### Phase 6 — Certification and polish

Build the final assessment, completed park display, badges, responsive behavior and complete testing suite.

### Implementation instructions

Work in logical, testable increments.

After each phase:
- Run the application.
- Verify the interactions.
- Test the mathematical results.
- Check responsiveness.
- Fix regressions before continuing.

Do not replace working existing functionality simply to make the new lab easier to implement.

---

# PART X — DEFINITION OF DONE

## 25. Release acceptance criteria

The lab is ready for release when:

1. The student can enter the Dream Line experience and begin designing a park.
2. The student can choose a park environment.
3. The student can add and remove different MTB features.
4. Feature selection updates the corresponding design counts and expressions.
5. All four Algebra 1 subtopics have functional educational activities.
6. The student can complete challenges using different response formats.
7. All mathematical explanations are accurate.
8. Every stage includes progressive hints and meaningful feedback.
9. The Math Workbench supports the active challenge.
10. Students can complete the final certification.
11. The finished park blueprint is displayed.
12. Progress and session summaries work.
13. Tutor Mode works with the experience.
14. The lab functions on mobile and desktop.
15. The lab integrates into the existing Algebra 1 course.
16. Existing Mathlete tools and functionality remain intact.

## 26. Non-goals and boundaries

This is an Algebra 1 learning experience, not a professional trail-building or engineering tool.

Do not:
- Turn the experience into a racing game.
- Introduce advanced physics or trigonometry unnecessarily.
- Teach real-world jump construction dimensions or safety specifications.
- Present fictional crew-hour estimates as actual industry standards.
- Make the park map a scaled construction plan.
- Overcomplicate the park editor.
- Reward speed at the expense of understanding.
- Build unnecessary features unrelated to the four learning objectives.

Use realistic MTB terminology and visuals, but keep the mathematics accessible.

---

# FINAL PRODUCT STANDARD

The student should finish The Dream Line Project having created something they are genuinely excited about.

They should understand variables because they used them to describe their park.

They should understand evaluating expressions because they used actual park quantities in their calculations.

They should understand order of operations because they organized the construction inventory.

They should understand mathematical properties because they used them to simplify the builder's calculations.

**The ultimate goal is for students to forget they are doing a worksheet and realize they're learning the mathematics that helps them bring their dream mountain bike park to life.**

Build something that makes a student excited to come back and learn the next unit of Algebra 1.