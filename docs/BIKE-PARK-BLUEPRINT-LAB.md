# Bike Park Blueprint Lab

The first Algebra 2 Linear Systems and Matrices lab, built from
[PRDs/Algebra2/linearSystems_Matricies.md](../PRDs/Algebra2/linearSystems_Matricies.md).
Students design a bike park with a trail crew. Systems of equations give
the build plan; matrices organize it and price it.

- **Address:** `/learning-lab/bike-park-blueprint-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 3: Linear Systems and Matrices.
  - Its home is **Systems of Equations**. It's also listed on Three-Variable Systems, Matrix Operations and Applications of Matrices.
  - The PRD's topic name, “Systems of Equations and Matrix Applications”, spans those existing topics.
  - New skills:
    - writing a system
    - graphing, substitution and elimination
    - classifying systems
    - interpreting a solution
    - augmented matrices
    - row operations
    - matrix dimensions
- **Breadcrumb:** Classes → Algebra 2 → Linear Systems and Matrices → Bike Park Blueprint Lab.
- **Time:** 20–25 minutes. **Level:** intermediate to advanced.

## One correction to the PRD

Final Challenge B lists 3x + 4y + 5z = **25**, x + 2y + 3z = **13**, 2x + y + z = **9**
with the answer (1, 2, 3). Those totals actually solve to (3, −1, 4): −1 jumps,
not a buildable plan. The lab keeps the coefficients and uses totals
**26, 14, 7**. Then (1, 2, 3) is the unique answer, and it matches Challenge C's
Q = [1 2 3], so QM = [25 13 11] and QMC = $2,365 against the $2,400 budget,
exactly as the PRD says. `scripts/test-bike-park-blueprint-lab.mjs` checks both
facts. Every other number in the PRD was verified exactly:
- the solutions (2, 3) and (2, 3, 1)
- every elimination step
- A + B, S − U and 2(A + B)
- MC = [337 264 500] and QMC = $1,966
- det(A) = −4, the A⁻¹ entries, and A⁻¹B
- the optimizer's best total, P = 13

## The experience

| Page | What happens |
|---|---|
| Opening | “Bike Park Blueprint Lab”, a site-plan illustration (berms, jumps, rock gardens, an excavator, a resource-matrix panel), **Start building**. |
| 1. Trail Design Puzzle | 4x + 3y = 17 and 2x + y = 7. **Blueprint graph**: toggle the lines and the intersection, drag a plan point, and change the resource totals to practice. Then substitution and elimination (worked steps and questions), a check, and **Diagnose the blueprint**: three pairs, each graph shown after the answer. **Independent practice**: pick a method (graphing, substitution or elimination) for a new plan (5 checked sets). |
| 2. Build the Entire Park | The three-resource system. **Slice the planes** is a simple 3D idea: fixing z turns each plane into a line, and the three lines meet only at z = 1. Then the augmented matrix, the row-step questions, and the **matrix elimination console**. In guided mode it follows the PRD's route; in independent mode students do swap, scale (≠ 0) and add-a-multiple themselves, with undo. After each step the console explains it, confirms the solution set is unchanged, and spots upper-triangular, contradictory (0 = c) or redundant (0 = 0) rows. Practice: 6 systems, two each with one solution, none and infinitely many. |
| 3. Matrix Workshop | Dimensions and entries. A + B, S − U and k(A + B) as questions first, then the **inventory workbench**: select any entry to see its calculation. MC, QM and QMC as questions, then the **matrix cost calculator**: change quantities, prices or (in practice) the resource matrix, and see every row-by-column step and the dimension chain (1 × 3)(3 × 3)(3 × 1) → 1 × 1. Then non-commutativity, and the **dimension checker**. |
| 4. Matrix Solver | AX = B (A is Mᵀ: rows are equations, not features), det(A) and why A⁻¹AX = X. The **matrix equation solver** steps through AX, det, A⁻¹ (exact fractions, checked: A⁻¹A = I), X = A⁻¹B and verification. It includes a singular A (det 0) with two sets of totals, one dependent and one inconsistent: det = 0 doesn't by itself mean “no solution”. |
| Extension | **Park optimizer**: 4x + 3y ≤ 40, 2x + y ≤ 18, the shaded feasible region with whole-number plans, and the largest P = x + y (13). |
| Final Build Plan | 10 questions: **A** variables, solve, interpret, verify; **B** augmented matrix, solve, interpret; **C** QM, cost, budget. Pass mark: **8 of 10 right without the solution shown**. 5 checked rounds; budgets fit in some and not others. |
| Report | The PRD's 14 tracked skills (plus writing systems, interpreting, checking and optimization), with “worth more practice” flags. Stats include **row operations performed** and **systems solved**. Practice, not mastery. |

## The math

- `logic/matrix.js` holds exact fractions (`Frac`) and matrices:
  - add, sub and scale (dimensions enforced)
  - `mul`, row by column, which refuses incompatible sizes
  - det, and an inverse that's checked against I before it's returned, and is null when det = 0
  - row operations, which refuse ×0 and adding a row to itself
  - `analyse` and `classify`
- `logic/models.js` holds every scenario and number set, and the 2×2 solver (exact even for decimal totals).

There's no floating-point comparison anywhere: −3/4 stays −3/4.

The page layout never shows an answer before its question: tools that compute something come after the questions about it. The console confirms “same solution set” without printing the solution.

## Shared code (lesson kit)

The third mission-board lab. It uses:
- `missions.js`, which gained two things for this lab:
  - **per-mission practice sets**, so Missions 1 and 2 have their own
  - `ctx.live()`, blocks that redraw after an answer, for the diagnose graphs
- `summaryExtra` and `stats` hooks, for row operations
- `controls.js`
- `plot.js`, moved here from the Ride Systems Lab. It gained filled polygons and 2D dragging.

`missions.css` now holds the plot base styles and makes segmented controls wrap on phones.

## Progress

- `main.js` sends answers as `bike-park-blueprint-lab:<id>`. Practice and final rounds send keys.
- Passing ends the session as completed, with row operations and systems solved in the metrics. That earns lab XP.
- The final's 10 questions are an assessment in `supabase/rewards.sql`.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`

## Files and tests

```
learning-lab/bike-park-blueprint-lab/
  index.html, main.js          the page and its connection to the site
  blueprint.js                 config + the four mission pages (runs in lesson-kit/missions.js)
  logic/matrix.js              exact fractions, matrices, row operations, det, inverse, classification
  logic/models.js              scenarios, the 2×2 solver, costing, optimizer, validated sets
  logic/questions.js           every question, ideas, misconceptions, questionKinds()
  components/labs.js           the ten interactives
  components/matrix-view.js    matrix tables (bracketed, augmented bar, labels, selectable cells)
  components/visuals.js        opening art
  styles/blueprint.css         scoped under .bpl
```

```
node scripts/test-bike-park-blueprint-lab.mjs   # exact arithmetic, PRD numbers + correction, row ops, sets, every question, curriculum (66)
node scripts/check-site.mjs                     # all three mission labs; shared plotter not copied
```

The real-Chrome run-through (38 checks) covered:
- every interactive
- guided and independent elimination, including a refused ×0 and undo
- the cost calculator updating
- the singular systems
- the optimizer
- passing the final at 8 of 10
- the report stats
- reload
- the true 390 px phone width on every page
- reduced motion
