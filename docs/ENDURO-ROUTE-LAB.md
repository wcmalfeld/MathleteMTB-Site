# Enduro Route Intelligence Lab

The Algebra 2 Rational and Radical Functions lab, built from
[PRDs/Algebra2/rationalFunctions.md](../PRDs/Algebra2/rationalFunctions.md).
Students analyse an enduro race course: stage timing with rational functions, then trail survey and wheel geometry with radicals.

- **Address:** `/learning-lab/enduro-route-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 6: Rational and Radical Functions.
  - Its home is **Graphing Rational Functions**. It's also listed on the unit's other four topics: Rational Expressions, Rational Equations, Radical Functions and Asymptotes.
  - It also counts toward Unit 1's Radical Equations (isolate and square, extraneous solutions, rational exponents) and Rational Equations (clearing denominators, excluded values).
  - New skills:
    - Graphing Rational Functions: evaluating, and algebraic vs contextual domain
    - Rational Equations: rational models
    - Radical Functions: evaluating, rational exponent form, simplifying radicals, interpreting radical models
- **Breadcrumb:** Classes → Algebra 2 → Graphing Rational Functions → Enduro Route Intelligence Lab.
- **Time:** 25–30 minutes. **Level:** intermediate to advanced.

## Changes from the PRD

Every number in the PRD was checked exactly. One was wrong, and one question was changed:

- **Final Challenge B's simplified numerator.** The PRD gives 5v² + 280v − 780. The correct numerator is **5v² + 275v − 900**: 5v(v − 5) + 180(v − 5) + 120v. The PRD's version gives 30.3 minutes at v = 15, not the 29 it states. The lab uses the correct one, and the tests check it.
- **Final Challenge A's target time.** The PRD asks for the speed that gives 26 minutes, straight after T(15) = 26, so the answer is just the given speed. Round 1 asks for 31 minutes instead (v = 12).

Everything else matched:
- the table 38, 28, 23, 20, and v = 20
- 22 minutes at v = 15, (8v² + 140v − 600)/(v² − 5v), 60(v − 10)/[v(v − 5)] = 2, 60/(v − 5), v/[2(v − 5)] = 0.75
- the hole at (5, 10), and 7v² − 125v + 300 = (v − 15)(7v − 20)
- 8√229 ≈ 121.06, 13.33%, h = ±22, r = −3 extraneous
- W(0.30) ≈ 0.199, x ≈ ±0.199, 2√(x − 3) + 1, ∛125 = 5

Disclaimer: the board, the models file and the profile studio say the models are fictional and **not race-pacing, trail-construction or bike-fit advice**. check-site makes sure they still do.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Enduro Route Intelligence Lab”: a GPS race computer with T(v), a stage on the hillside, a stopwatch, a survey triangle and a wheel. **Enter the lab**. |
| 1. Beat the Clock | A prediction first, then T(v) = 8 + 360/v, the hours-to-minutes conversion, T(18), and the PRD's table. **Race clock simulator**: speed slider, stage map with the rider, stopwatch, the two timing parts shown separately, and the graph. **Ride the stage** animates in proportion to stage time (instant with reduced motion). Doubling speed halves the stage time but not the total. Domain and range: algebraic vs contextual. Asymptotes. **Asymptote explorer**: D, t₀ and speed, with asymptote toggles. The 26-minute challenge. Practice: 5 more stages. |
| 2. Stage Timing Console | Flow 2 km at v, technical 1 km at v − 5, 8-minute transition. **Split-time simulator**: two section timers and the total. Common denominator and combining, step by step. Restrictions and asymptotes. **Rational graph analyzer**: full mathematical view vs race view (v > 5). Subtract, multiply and divide, each with its meaning in the race. **Workbench**: each operation's steps, with the original and simplified forms checked equal at any v. The missing GPS reading C(v) = (v² − 25)/(v − 5). **Find the missing point**: factor, cancel, keep the excluded input, plot the hole, and compare with an asymptote. Solving for 22 minutes, rejecting 20/7. **Target time finder**: any target, with both candidates on the graph and the rejected one on the middle branch. Independent challenge: 5 new courses with different distances and speed differences. |
| 3. Survey the Line | a² + b² = c², D(h) = √(14400 + h²), domain and range. **Trail survey simulator**: a to-scale triangle with tripods, h from −60 to 60, the exact radical and decimal, grade, and the mirror point at −h. 8√229 and 121.06, grade 13.33%. 122 m → h = ±22, both valid. The console warning √(r² + 16) = r − 2 → r = −3, extraneous. **Radical equation solver**: square, solve, list, check, for three equations (two-sign, extraneous, and one valid + one extraneous). Practice: 5 survey segments. |
| 4. Wheel Geometry | W(x) = √(0.36² − x²): radicand, domain, range, W(0.30). **Wheel geometry explorer**: a wheel with spokes and a coordinate overlay, in two modes: move a point, or find a height (both symmetric points). Transformations of a√(x − h) + k, reflections. **Radical profile studio**: √, ∛ or the wheel semicircle, with a, h, k (or R), the parent curve, and domain and range. The wheel's centre (h, k). Rational exponents, conversion practice (5), and the optional cube-root box. |
| Extension | The route data diagnostic: f, g and h's asymptotes and intercepts, a slant asymptote by division, and √x vs ∛x vs √(x + 4) − 2, each with a graph. |
| Final Route Analysis | 12 questions: **A** race timing (model, time, domain, asymptote, speed for a target); **B** two-section timing (numerator, restrictions, asymptote, time); **C** survey (exact radical, decimal, grade). Pass mark **10 of 12** without the solution shown. 5 checked rounds; round 1 is the PRD's course. |
| Report | The PRD's 23 tracked skills (plus inverse variation and slant asymptotes). Stats include **independent solutions** and **extraneous or rejected candidates caught**. Practice, not mastery. |

## The math

- `logic/rational.js` holds exact rational expressions: a numerator and denominator from the kit's polynomial engine (`lesson-kit/poly.js`). It covers:
  - add, subtract, multiply and divide
  - simplifying by polynomial GCD
  - rational roots with multiplicity
  - features: vertical, horizontal and slant asymptotes, holes, zeros and intercepts
  - text forms, with product denominators bracketed: 60(v − 10)/[v(v − 5)]
  - exact square-root simplification (√14656 = 8√229, √0.0396 = 0.06√11), nth roots, and rational powers

  **Excluded inputs survive cancelling.** After 60/v · v/(v − 5) simplifies to 60/(v − 5), it is still undefined at v = 0.
- `logic/models.js` holds every scenario and validated set.

No numbers are scattered across the UI.

The tests evaluate every expression option against the true function, so a “wrong” option can't secretly be equivalent.

## Shared code

The sixth mission-board lab. Two pieces moved into the kit so they aren't copied:
- **The polynomial engine:** `pump-track-lab/logic/poly.js` → `lesson-kit/poly.js`. The Pump Track file is now a one-line re-export.
- **`squareFree()`** (for simplifying square roots): from the Trail Dynamics Lab into `lesson-kit/frac.js`.

check-site makes sure each has only one copy.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and the Final Route Analysis as an assessment

## Files and tests

```
learning-lab/enduro-route-lab/
  index.html, main.js            the page and its connection to the site
  enduro-route.js                config + the four mission pages
  logic/rational.js              exact rational expressions, features, radicals, exponents
  logic/models.js                timing, split, calibration, survey, wheel, validated sets
  logic/questions.js             every question, ideas, misconceptions, questionKinds()
  components/labs.js             the thirteen interactives
  components/visuals.js          stage and split maps, survey triangle, wheel, opening art
  styles/enduro-route.css        scoped under .erl
```

```
node scripts/test-enduro-route-lab.mjs   # engine, PRD numbers (and the correction), sets, every question and option, curriculum (71)
node scripts/check-site.mjs              # all six mission labs; one shared Frac and poly; the disclaimer
```

The real-Chrome run-through (38 checks) covered:
- every interactive
- traps
- the stopwatch animation, and reduced motion
- the hole steps
- the extraneous checks
- passing at 10 of 12
- the report
- reload
- phone width on every page
