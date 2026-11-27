# The Dream Line Goes Pro

The Algebra 1 lab for Unit 2: Solving Equations and Inequalities. It was built from [PRDs/Algebra1/solvingEquationsandInequalities.md](../PRDs/Algebra1/solvingEquationsandInequalities.md). It continues [The Dream Line Project](DREAM-LINE-PROJECT.md): the student's park is now engineered, costed and approved.

- **Address:** `/learning-lab/dream-line-goes-pro/`. Its id is `dream-line-goes-pro` and its root classes are `.dgp .dlp`.
- **Curriculum:** Courses → Algebra 1 → Unit 2. Its home topic is One-Step Equations, and it covers all 16 skills in the unit's five topics.
- **Topic links:** each topic page opens the lab at its own stage and says so ("Opens at: Stage 3: The Design Showdown"). This uses the new optional `stages` field on an activity in `content/classes/activities.mjs`, which `build-classes.mjs` reads.
- **Time:** 40–55 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every value in section 30 was recomputed by the engine. One was wrong:
- **Corrected:** challenge 3 in Stage 2, `4(x + 3) + 2x = 38`, gives **x = 13/3**, not 3. The lab uses `4(x + 3) + 2x = 30`, which gives 3 and keeps the PRD's story.
- **Everything else is right:** 15, 24, 7, 24, 14, −6; 5, 3, 5, 8, 6; f = 6 (both 54); no solution; infinitely many. Also 0.3 h = 18 min, 18 km/h, 6%, 18 ft, 300 ft, 15 mm, 30% and 50 mm; and h ≤ 5, x ≤ 10, 4 ≤ x ≤ 10, x ≤ 8, x > 4 and R ≤ 24.

The lab states that its credits, grade limits and sag targets are fictional classroom values. The sag notes send students to their manufacturer's guidance, with FOX's setup guides linked. check-site enforces these disclaimers.

## Continuity with Unit 1

`logic/project.js` reads the student's Unit 1 park from that lab's saved progress but **never writes to it**. The park includes its name, environment and features. Unit 2 keeps its own progress record and its own additions: a project name, a summary and the approved plan.

Students who skipped Unit 1 get a starter park and a link to build their own. Doing Unit 1 isn't required.

The park map, the workbench, prediction-first steps, written answers, the tutor panel and the report blocks all come from the Unit 1 lab. The tutor panel and report blocks now live in `dream-line-project/components/shared.js`. So both units look and work the same, and there's one tutor interface.

## The experience

| Page | What happens |
|---|---|
| Opening | The PRD's text over an original slopestyle scene, with **Enter the engineering workshop**. |
| Board | The park project (carried forward or starter), the tutor panel, then the five stages. |
| 1: The Setup Garage | **Equation balance** for problems A–D, a negative coefficient and a fractional answer. Problem A is prediction-first. A wrong "one side only" move tips the scale. Students check the mechanic's work (with a substitution checker) and write and solve four equations from stories. The suspension setup challenge has a shock and O-ring diagram. There is practice too. |
| 2: The Build Crew | A budget equation, then the solver, with a budget tracker after. The materials calculator (with a packages visual) and the distributive workshop lead into the solver. Three planning challenges follow, two of which ask students to write the equation themselves, plus practice. |
| 3: The Design Showdown | A crossover prediction, then the live **comparison graph** (feature slider, both totals, the intersection) and the solver. Parallel proposals cover no solution, and the same plan written two ways covers infinitely many. Five comparison scenarios include a solution of 7.5, which doesn't fit a whole number of features. There is practice too. |
| 4: The Formula Garage | d = rt, with a trail-section tool. Trail grade: choose the unknown first, then use the profile, which shows horizontal run against the length along the trail. Suspension sag, with the shock diagram. The **Formula Rearrangement Studio**: pick a formula, a letter and each operation, with a numeric check. An engineering assessment practice set closes the stage. |
| 5: Park Operations | The budget inequality and its meter. **Sign reversal**: a prediction, a number-line demo of why −2 > −5, and the solver, where "keep the sign" is a trap. The **Number Line Studio**: build rays, intervals and OR regions, choosing open or closed ends. Compound inequalities, AND vs OR, and the trail-grade limit. The **approval dashboard** has five plans (B and E pass) and a custom plan that can be approved for the park. There is practice too. |
| Final Park Engineer Certification | 10 new questions, two per topic. They cover numeric answers with **working boxes**, a substitution check, building an equation, classifying no / one / infinitely many solutions, rearranging a formula (including new formulas), using it with units, an inequality that needs the sign reversed, and a number-line graph. Students pass with **8 of 10**, and there are four rounds. |
| Open your Dream Line | The engineered park: its stats, build plan, seven engineering results (ticked as they're earned), the approved plan, badges, and a project name and summary. |
| Report | Accuracy and attempts for each of the five topics; answers done independently vs with help; review items; misconceptions; and the **Revisit a stage**, **Retry certification** and **View my engineered park** buttons. |

The badges are Bike Mechanic, Build Engineer, Design Analyst, MTB Engineer and Park Manager.

**Tutor mode** is on the board. It lets a tutor:
- turn the prediction requirement on or off
- show or hide hints
- allow solutions at any time
- go to any challenge
- read written reasoning and working
- see a list of **incorrect responses to revisit**

## Kit additions (reusable)

**`lesson-kit/equation.js`** solves linear equations and inequalities in one variable, using expr.js with exact fractions. Text is never run as code. It provides:
- `parseRelation`, including compound inequalities like `36 ≤ 8x + 4 ≤ 84`
- `solve`, which returns one value, no solution, every value, a ray or an interval
- `sameSet`, `contains` and `setText`
- **the solver:** `start`, `moves` and `apply`. It works in order: distribute, combine, collect the variable, undo the constant, then undo the coefficient, reversing the sign for a negative. Each step also offers tempting wrong moves, each with a misconception code: one side only, the wrong inverse, dividing first, partial distribution, combining unlike terms, and not flipping.
- `checkEquation`, which requires the equation to be written from the story, in any letter and either way round
- `checkInequality`, which requires a solved form and gives no-flip, direction and open-closed feedback
- `relationAt`, for testing rearranged formulas

Other kit changes:
- **`expr.js`:** `parse(text, { keepCase: true })` keeps capital letters, for formulas like G = 100R/L.
- **`ask.js`:** new `equation` and `inequality` answer types, and previews that keep the student's letter case.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and makes the certification an assessment

## Files and tests

```
learning-lab/dream-line-goes-pro/
  index.html, main.js      the page (also loads ../dream-line-project/styles/dream-line.css) and its site connection
  goes-pro.js              config, the five stage pages, project, open-your-park, tutor and report wiring
  logic/project.js         reads the Unit 1 park (read-only), starter park, approval plans and conditions, disclaimers
  logic/formulas.js        the three formulas, every rearrangement, the studio's steps and wrong moves
  logic/questions.js       every question, practice sets, certification rounds, ideas, misconceptions
  logic/workbench.js       Math Workbench content
  components/labs.js       equation solver, number line, design showdown, formula tools, studio, approval board
  components/visuals.js    balance, rear shock, opening art
  styles/goes-pro.css      scoped under .dgp
```

```
node scripts/test-dream-line-goes-pro.mjs   # PRD tables, solver moves, misconceptions, formula equivalence, continuity, every question, curriculum (64)
node scripts/check-site.mjs                 # disclaimers, read-only Unit 1, no eval, stage links on all five topic pages
```

The real-Chrome run-through passed **46/46**. It covered:
- arriving directly and arriving with a Unit 1 park, without Unit 1's record changing
- balance tipping, typed equation feedback, the solver traps (partial distribution, no flip)
- the showdown crossing, parallel and identical cases
- the studio
- number-line open and closed endpoints, and OR regions
- the approval dashboard
- passing at 8 of 10
- the report and the finished park
- tutor mode
- phone width on every page

Because of the kit and shared-component changes, the Unit 1 run-through (57/57) and the smoke test of all other mission labs and lessons (10/10) were re-run, and both pass.
