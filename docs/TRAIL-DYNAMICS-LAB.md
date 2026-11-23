# Trail Dynamics Lab

The Algebra 2 Quadratic Functions lab, built from
[PRDs/Algebra2/quadraticFunctions.md](../PRDs/Algebra2/quadraticFunctions.md).
Students analyse braking zones and jump lines for an enduro team.

- **Address:** `/learning-lab/trail-dynamics-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 4: Quadratic Functions.
  - Its home is **Quadratic Graphs**. It's also listed on Vertex Form, Completing the Square, Quadratic Formula and Complex Solutions.
  - It also counts toward Systems of Equations (linear–quadratic) and Complex Numbers (arithmetic).
  - New skills: recognising quadratics, converting forms, transformations, factoring and zeros, quadratic models, domain and range, the square root property, deriving the formula, and interpreting solutions.
- **Breadcrumb:** Classes → Algebra 2 → Quadratic Functions → Trail Dynamics Lab.
- **Time:** 20–25 minutes. **Level:** intermediate to advanced.

Every number in the PRD was verified exactly:
- the braking table and both factorings
- v = 30 (Model A), v = 30 (Model B) and v = 35 (final)
- every vertex, form and zero
- 5 and 15, 10 ± 5√2, Δ = 0 and Δ = −100, 10 ± 5i
- the final jump's (8, 3.2), 0 and 16, and 8 ± 2√6

No corrections were needed.

Two additions fill gaps in the PRD:
- **The landing ramp y = −0.5x + 10.** The PRD lists linear–quadratic systems as a skill, but its only example is a flat target line. The ramp meets the jump at x = 12.5 and x = 20.
- **The complex-number practice** from Module E is the optional extension.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Trail Dynamics Lab”: a braking zone, a jump with a rider in the air, and telemetry. **Enter the lab**. |
| 1. Brake Zone Lab | Reaction, braking and total distance. A prediction first, then the PRD's table, then D(v) = kv² + 0.25v. **Stopping distance simulator**: a downhill scene with the reaction and braking zones to scale, a speedometer, the readout table, the live equation and the A/B curves. **Coefficient explorer**: any k against Models A and B. Then 16.5 m run backwards (factor, reject −55), and the 21 m independent challenge with the formula. Practice: 5 more scenarios. |
| 2. Rebuild the Jump | J(x) = −0.04x² + 0.8x: vertex, zeros, range. **Jump equation decoder**: Standard, Vertex and Factored tabs highlight each form's features on the graph, beside a side-view jump. “Which form shows…” questions. **Jump profile tuner** for a, h and k: original vs new curve, vertex, axis, zeros or none, max or min, and the scene redrawn. Factoring and the zero-product property. **Factoring challenge**: 6 quadratics, some that don't factor over the integers, with zeros shown after answering. |
| 3. Landing Analyzer | 3 m by square roots. The **complete-the-square builder**: each step fills in as it's answered, over an unchanged graph. 2 m by the quadratic formula, exact (10 ± 5√2) and approximate, with an expandable derivation. Discriminants for 4 m and 5 m and the complex roots, then the **trajectory height analyzer**: a draggable target line, live Δ, intersection count, exact roots and the best method. Complex conjugates explained. **Landing ramp**, a linear–quadratic system with slope and intercept sliders. |
| Extension | i² = −1, powers of i, and adding, subtracting and multiplying complex numbers. (10 + 5i)(10 − 5i) = 125 ties back to x² − 20x + 125. |
| Final Course Analysis | 12 questions: **A** braking (standard form, speed, why reject); **B** a new jump (coefficients, axis, vertex, zeros, vertex form, factored form); **C** a landing height (equation, roots, exact form). Pass mark **10 of 12** without the solution shown. 5 checked rounds; each target height gives irrational roots. |
| Report | The PRD's 14 tracked skills (plus domain and range, linear–quadratic systems and complex arithmetic). Stats include **independent solutions**. Practice, not mastery. |

## The math

- `logic/quadratic.js` holds exact quadratic algebra, with coefficients as fractions (`lesson-kit/frac.js`):
  - roots that are rational, p ± q√n (square-free) or p ± qi, each verified by substitution (complex roots by sum and product)
  - standard, vertex and factored text, with decimals shown when they terminate (−0.04, not −1/25)
  - completing the square, the height equations scaled monic (x² − 20x + 50, exactly the PRD's), and line meets parabola
  - complex arithmetic
- `logic/models.js` holds one braking configuration, the jump, the ramp and every validated set.

No numbers are scattered across the UI.

Wrong options in the form and factoring questions are built from specific mistakes. The tests check each one is really wrong: every “form” option is evaluated against the true function, and every factor pair is expanded.

## Shared code

The fourth mission-board lab. It uses the kit's `missions.js` (with per-mission practice and `live()`), `plot.js` and `controls.js`. The fraction class moved from the Bike Park lab into `lesson-kit/frac.js`; both labs import it, and check-site makes sure there's only one copy.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and the Final Course Analysis as an assessment

## Files and tests

```
learning-lab/trail-dynamics-lab/
  index.html, main.js            the page and its connection to the site
  trail-dynamics.js              config + the three mission pages
  logic/quadratic.js             exact roots, forms, completing the square, systems, complex numbers
  logic/models.js                braking model, jump, ramp, validated sets
  logic/questions.js             every question, ideas, misconceptions, questionKinds()
  components/labs.js             the eight interactives
  components/visuals.js          braking scene, speedometer, side-view jump, opening art
  styles/trail-dynamics.css      scoped under .tdl
```

```
node scripts/test-trail-dynamics-lab.mjs   # engine, PRD numbers, sets, every question and option, curriculum (49)
node scripts/check-site.mjs                # all four mission labs; one shared Frac; no copied plotter
```

The real-Chrome run-through (29 checks) covered:
- every interactive
- traps
- the builder filling in
- the analyzer at 2, 4 and 5 m
- the ramp
- passing at 10 of 12
- the report
- reload
- phone width on every page
- reduced motion
