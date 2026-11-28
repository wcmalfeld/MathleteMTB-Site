# Project Evolve: the MTB Innovation Lab

This is the Algebra 1 lab for Exponents and Exponential Relationships, built from [PRDs/Algebra1/EVOLVE.md](../PRDs/Algebra1/EVOLVE.md).

- **Address:** `/learning-lab/project-evolve/`, tracking id `project-evolve` (the PRD's proposed route).
- **Curriculum:**
  - It covers all four topics (Exponent Rules, Scientific Notation, Exponential Growth, Exponential Decay) and all 12 of their skills.
  - Its home topic is Exponent Rules.
  - Each topic page opens its own stage, for example "Opens at: Stage 2: Engineering Test Lab".
- **Time:** 35–50 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every example in section 27 is recomputed by the kit's exact engines and tested in `scripts/test-project-evolve.mjs`. All of them are right:

| PRD item | Result |
|---|---|
| x² × x³, x⁶/x², (x²)³ | x⁵, x⁴, x⁶ |
| (2x)³, (3a)² | 8x³, 9a² |
| 7⁰, 5⁻², 10⁻³, (x⁻²)³ | 1, 1/25, 0.001, 1/x⁶ |
| 200 × 28 × 60 × 60 | 20,160,000 = 2.016 × 10⁷ |
| 0.0000045, 0.00000072, 0.000012 | 4.5 × 10⁻⁶, 7.2 × 10⁻⁷, 1.2 × 10⁻⁵ |
| (3.0 × 10⁵)(2.0 × 10³) | 6.0 × 10⁸ |
| (2.016 × 10⁷)/(4.0 × 10²) | 5.04 × 10⁴ = 50,400 |
| 2 × (2.016 × 10⁷) | 4.032 × 10⁷ |
| N(t) = 500(1.20)ᵗ | 500, 600, 720, 864, 1036.8 (displayed as about 1,037 riders) |
| L(4) vs N(4) | 900 vs 1036.8 |
| V(t) = 6000(0.80)ᵗ | $6,000, $4,800, $3,840, $3,072, $2,457.60, $1,966.08 |
| $2,500 target | above at year 3, below at year 4, crossed between them |

No corrections were needed.

**Rules the lab keeps:**
- **No logarithms anywhere.** Targets are found by checking a table year by year (`firstPast`), and check-site enforces this.
- **Whole-number exponents only.**
- **0⁰ is refused.** The zero-exponent rule is taught for nonzero bases only, and 0⁰ is never treated as 1.
- **Exact display rounding.** Values stay exact inside the model and are rounded only for display, as with people and money.

**Disclaimers:**
- Northline Cycles, Project Switchback and every number are labelled fictional, illustrative classroom values.
- The test rig's 200 readings per second is labelled a fictional assumption.
- Growth is labelled "not guaranteed".
- The 20% depreciation is labelled "not a universal depreciation rate or a used-bike valuation forecast".
- The PRD's references to a real component maker are inspiration only and aren't named in the lab.
- The bike illustration is original.
- **Photos:** four photos from `assets/photos/EVOLVE/` set the scene: the CAD designer in Stage 1, the fork test rig and shock dyno in Stage 2, and a real race bike in Stage 3. They're captioned as real-world context. The race bike's caption says Project Switchback is fictional, so no photo stands in for the product. check-site checks this.

## The experience

| Part | What happens |
|---|---|
| Product dashboard (board) | The Project Switchback bike changes with the current phase: CAD wireframe, test rig, launch render, used-market tag. There's a project name and four phase cards that fill in with the student's results as each badge is earned. |
| 1 Prototype Design Lab (exponent rules) | The **CAD scaling lab**: a row, square or cube of unit cells built layer by layer, with number or letter edges. A prediction leads to the product rule and the **factor board** (product, quotient with cancelling factors, power of a power). Then the quotient rule, power of a power, power of a product, zero exponents (with 3x⁰ vs (3a)⁰, and why 0⁰ is excluded), and negative exponents with the **precision scale** (10³ down to 10⁻⁶, "still positive"). Then the design challenge (name the law), a written answer, and practice. |
| 2 Engineering Test Lab (scientific notation) | The **sensor reading counter**, with test hours and readings per second. Then tiny measurements, the **converter** (type any number and move the decimal to see unnormalized forms), multiplication, division and normalizing, and the **measurement comparison** on a powers-of-ten ruler (it warns when units don't match). Then a mixed challenge and practice. |
| 3 Product Launch (exponential growth) | The waitlist model and its factor 1.20 (not 0.20), the growth table, and a prediction leading to linear vs exponential in tables, equations, graphs and words. Then identifying initial value, factor and rate, writing a model from a description, the **launch growth tracker** (start, rate, months, linear comparison), and practice. |
| 4 The Used Market (exponential decay) | The retention factor 0.80 (not 0.20 or 1.20), the depreciation table, and linear vs exponential decay. Then the $2,500 target from the table (between years 3 and 4; first whole year 4; the midpoint isn't the exact crossing), the **resale value simulator** (start, rate, years, target, 10/15/20/25% comparison, linear toggle), the model's real-world limitations with a written answer, and practice. |
| MTB Product Innovation Certification | 12 questions, 3 per topic, over 4 rounds with new values. The pass mark is **10 of 12**. A short written answer is saved for the tutor. |
| Product Lifecycle Report | "‹NAME› — PRODUCT DEVELOPMENT REPORT", with the prototype expressions, test results, the launch model with its projections and graph, the used-market model with its table, graph and target estimate, the badges and the certification. |

The badges are Prototype Designer, Test Engineer, Product Launch Manager and Market Analyst. Passing the certification gives the title Certified MTB Product Innovation Engineer.

## Kit changes

- **`lesson-kit/powers.js` (new): single-term algebra.**
  - `mono()` reduces any product, quotient or power of one term to an exact coefficient times whole-number powers, refusing 0⁰, 0⁻ⁿ and division by zero.
  - `checkMonomial` grades simplified answers. Equal but unsimplified answers (x³x², (2x)³, x⁻⁶ when positive exponents are asked) are sent back with a reason instead of being marked wrong.
  - `fpow` refuses fractional exponents.
- **`lesson-kit/scinot.js` (new): scientific notation, exactly.**
  - It reads 2.016 × 10⁷, 2.016x10^7, 2.016e7 and 20,160,000.
  - It provides normalize, sciText and plainText.
  - `checkSci` diagnoses the wrong exponent sign, a decimal-place count that's off, an unnormalized coefficient, a wrong coefficient, and standard vs scientific form.
- **`lesson-kit/ask.js`:** new question types `monomial` and `sci`.
- **`lesson-kit/expr.js`:** reads superscript exponents (x⁵, 10⁻³, x¹²). ² and ³ behave exactly as before; a test guards this.
- **`lesson-kit/frac.js`:** fixed. Tiny decimals such as 0.00000072 used to read as 0, because the number printed as 7.2e-7. They are now exact, and everyday decimals are unchanged.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the reward activity and the `project-evolve.final` assessment.

## Files and tests

```
learning-lab/project-evolve/
  index.html, main.js       the page and its site connection (id "project-evolve")
  evolve.js                 config, the four stage pages, certification, report
  logic/product.js          the fictional product: test, waitlist, resale models (exact), notes, phases
  logic/questions.js        every question, practice sets, certification rounds
  logic/workbench.js        Math Workbench content
  components/labs.js        CAD lab, factor board, precision scale, test rig, converter, comparison, growth tracker, resale simulator, dashboard, report
  components/visuals.js     the original Switchback bike (four looks) and the opening art
  styles/evolve.css         scoped under .pev
```

```
node scripts/test-project-evolve.mjs   # PRD sections 27 and 28, kit engines, every question, curriculum (46)
node scripts/check-site.mjs            # disclaimers, no logarithms, 0⁰ refused, no eval, stage links on all four topic pages
```

The real-Chrome run-through passed **49/49**. It covered:
- the CAD lab and the factor board
- every misconception trap tried
- unsimplified answers being sent back
- the precision scale
- the test rig, the converter and the comparison (including mismatched units)
- the growth tracker and the resale simulator
- every stage badge
- the dashboard after a reload, and renaming the project
- passing at 10 of 12
- the lifecycle report
- the report buttons and tutor mode
- phone width on every page

After the kit changes, every lab's unit tests and the Uplift (52), Frame the Line (49), Map the Line (39), Unit 1 (57), Unit 2 (46) and 10-lab browser runs all pass.
