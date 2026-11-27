# The Dream Line Project

The first Algebra 1 lab, for Unit 1: Foundations of Algebra. It was built from
[PRDs/Algebra1/foundationsOfAlgebra.md](../PRDs/Algebra1/foundationsOfAlgebra.md).

Students design their own mountain bike park. They then use algebra to plan it, in four build stages:
- variables and expressions
- evaluating expressions
- the order of operations
- the properties of real numbers

- **Address:** `/learning-lab/dream-line-project/` (id `dream-line-project`, root class `.dlp`)
- **Curriculum:** Courses → Algebra 1 → Unit 1: Foundations of Algebra.
  - Its home topic is **Variables and Expressions**.
  - It's also listed on Evaluating Expressions, Order of Operations and Properties of Real Numbers.
  - It covers all twelve skills in the unit.
- **Time:** 35–50 minutes. **Level:** beginner to intermediate.
- **Separate from Trail Builder.** Trail Builder is about routing a trail network and is unchanged. This lab is about designing a park and planning its construction.

## Checking the PRD

Every number in the PRD was recomputed by the engine, and all of them are right:

| Expression | Result |
|---|---|
| 4(3) + 3(2) + 5 | 23 |
| 2400 + (−125.5) | 2274.5 |
| (3/4)(2.4) | 1.8 |
| 1.25 + 0.75 | 2 |
| 3(18 + 2²) + 12 | 78 |
| 5 + 3 × 4 | 17 |
| 48 ÷ 6 × 2 | 16 |
| 18 − 4 + 3 | 17 |
| 2[7 + (3²)] ÷ 4 | 8 |
| (18 + 6) ÷ 3 | 8 |
| 5(2 + 3) | 25 |
| 4(x + 2) when x = 3 | 20 |

The number classifications and the inventory steps (2² = 4, 18 + 4 = 22, 3 × 22 = 66, 66 + 12 = 78) are also as the PRD states. No corrections were needed.

The lab uses two conventions:
- Natural numbers start at 1. The lab says so, and check-site enforces it.
- Crew-hours are fictional classroom planning numbers, and the map is a concept sketch, not a scaled construction plan. Both are stated in the lab and enforced.

## How it's laid out

The lab runs on the lesson kit's mission-board shell. The PRD's persistent park interface lives on the **mission board**:
- the park studio: the canvas, the feature library and the build plan
- the tutor panel

Each stage page shows a compact view of the park. Stage 1's "Design your own line" step uses the same studio and edits the same park.

| Page | What happens |
|---|---|
| Opening | The PRD's text over an empty blueprint hillside, with **Start building**. |
| Board | The park studio and the tutor panel, followed by the stage cards. |
| Stage 1: Create the Blueprint | The construction brief, then the guided first term (4t) and the expression builder (blocks or typing). Expression anatomy: tick the variables, coefficients, constants and terms, then explore the blueprint view. Four builder's notes to translate, questions explaining the blueprint, and a short written answer with a sample response and a "tutor review" flag. Design your own line, with a prediction-first question (+8 hours), and practice with new builder's notes. |
| Stage 2: Plan the Build | Substitute first, then evaluate. A substitution-only answer is required before the total, and bars show where the hours go. Students also evaluate their own park's plan. Elevation with signed changes, with a vertical indicator. Fraction mapping with a section map. Decimals. Five **prediction-first challenges**, beginner to advanced, each followed by a worked solution with bars. |
| Stage 3: Organize the Materials | The inventory, with marker groups shown step by step. The **Shaper's Calculation Board**: six expressions where students pick the next operation. Wrong picks get a reason (higher priority first, left to right, inside the grouping, the fraction bar). Parentheses change everything (prediction first), the fraction bar challenge, and **Catch the crew's mistake** (five crew workings: find the first wrong line, then the fix). Practice with a new inventory sheet. |
| Stage 4: The Builder's Math Toolkit | Seven number cards and a live nested-set diagram. A properties workshop with a demo for each property (commutative, associative, identity, inverse, distributive, like terms), including non-examples. Rapid-fire property identification, a misuse to catch, and practice cards. |
| Final Algebra Certification | Ten new questions per round: 2 on variables and expressions, 3 on evaluating, 2 on the order of operations and 3 on properties. They mix numeric entry, expression building, matching, identification and error finding. Students pass with **8 of 10** without the solution shown. There are four checked rounds. |
| Extension: the finished park blueprint | Name the park, describe it (saved for the tutor), and see every feature, the expression, the totals and the badges. |
| Report | Accuracy for each of the four objectives. Independent answers (first try, no hints) are counted separately from answers after help and from solutions shown. Also: predictions, questions needing review, suggested next steps, the park, and the **Revisit a stage**, **Retry the certification** and **View my dream park** buttons. |

Each stage earns a badge: Blueprint Designer, Build Planner, Materials Manager, Master Shaper. Each badge lights a landmark on the map.

**Tutor mode.** These settings are on the board, apply per device, and never reset progress:
- require predictions, or not
- show or hide hints
- allow solutions at any time (they count as help)
- go to any challenge
- read the student's written responses

## The kit additions (reusable by future Algebra 1 labs)

**`lesson-kit/expr.js`** is a safe expression engine. Text is never run as code. It:
- tokenizes and parses input into a tree, with exact fractions throughout
- handles implicit multiplication, [ ] and { }, the symbols × · ÷ − and ², and friendly error messages
- offers `evaluate`, `toText`, `equivalent` (exact for polynomials), `isSimplified` and `sameShape` (whether a substitution has been written out)
- supports the order of operations one step at a time: `ready`, `reduce`, `whyNot`, `solveSteps`
- provides `checkExpression` for marking answers

**`ask.js`** has three additions:
- a new `expression` answer type, with optional blocks and a "Reads as" preview
- `inline` choices
- `revealAnytime`

**`missions.js`** has five additions, all optional, so the other labs are unchanged:
- `board.extra`
- `report.extra`
- `tutor(progress)`
- `ctx.refresh`

**`missions.css`** is now v=4, which this lab loads.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and makes the Final Algebra Certification an assessment

## Files and tests

```
learning-lab/dream-line-project/
  index.html, main.js       the page and its connection to the site
  dream-line.js             config, the four stage pages, tutor panel, report additions
  logic/park.js             features, environments, spots, the build-plan expression
  logic/numbers.js          number sets and property checks
  logic/questions.js        every question, practice sets, certification rounds, ideas, misconceptions
  logic/workbench.js        Math Workbench content (simple and advanced)
  components/park.js        park studio, compact park, finished blueprint, badges
  components/labs.js        workbench, prediction-first, calculation board, visualizers, demos
  components/visuals.js     feature icons, the map in three environments, opening art
  styles/dream-line.css     scoped under .dlp
```

```
node scripts/test-dream-line-project.mjs   # engine, PRD table, steps, sets, properties, park, every question, curriculum (64)
node scripts/check-site.mjs                # the nine mission labs; disclaimers; no eval in the engine
```

The real-Chrome run-through passed 57/57. It covered:
- placing features three ways (tap-to-add, pick and tap, drag-and-drop), plus keyboard place and remove
- the expression updates and highlighting, the environment choice, and the park surviving a reload
- expression traps and messages, and the blocks
- prediction gating
- every stage completing, with its badge and landmark
- the calculation board's wrong-pick reasons
- the demos
- passing at 8 of 10
- the report and the finished park
- tutor mode
- phone width on every page, and reduced motion

Because the kit changed, all eight other mission labs and the two physics lessons were smoke-tested in Chrome and pass, and all their offline suites still pass.
