# Pump Track Profile Lab

The Algebra 2 Polynomial Functions lab, built from
[PRDs/Algebra2/polynomialFunctions.md](../PRDs/Algebra2/polynomialFunctions.md).
Students analyse the side profile of a new pump track section: its rollers, dips and transitions.

- **Address:** `/learning-lab/pump-track-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 5: Polynomial Functions.
  - Its home is **Polynomial Graphs**. It's also listed on Polynomial Operations, Factoring Higher-Degree Polynomials, Roots and Zeros, and Remainder and Factor Theorems. It also counts toward Complex Solutions (conjugate pairs).
  - New skills:
    - Polynomial Graphs: recognising polynomials, degree and leading coefficient, sign intervals, and interpreting polynomial models
    - Polynomial Operations: expanding factored form
    - Roots and Zeros: connecting zeros and factors
- **Breadcrumb:** Classes → Algebra 2 → Polynomial Graphs → Pump Track Profile Lab.
- **Time:** 25–30 minutes. **Level:** intermediate to advanced.

Every number in the PRD was verified exactly. No corrections were needed:
- Flow Line A expands to 0.005x⁴ − 0.08x³ + 0.38x² − 0.48x, and Q = 200P = x⁴ − 16x³ + 76x² − 96x
- B + A = −0.005x³ + 0.05x² + 1
- the synthetic division row 1, −14, 48, 0 | 0
- Q(3) = 45 and P(3) = 0.225
- Q ÷ (x² − 8x) = x² − 8x + 12
- (x² + 1)(x − 2)(x − 6) = x⁴ − 8x³ + 13x² − 8x + 12
- the final F(x) = 0.002x³ − 0.024x² + 0.078x − 0.056, with G = 500F, x² − 11x + 28, G(2) = 10 and F(2) = 0.02

Disclaimer: the board, the decoder and the models file all say that every curve is a simplified mathematical profile, **not a pump track design or construction specification**. check-site makes sure all three still say it.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Pump Track Profile Lab”: rollers and dips over a reference line, a rider (animated unless reduced motion is on) and a profile-scan screen with the quartic. **Enter the lab**. |
| 1. Flow Line Decoder | Which expressions are polynomials. Flow Line A: degree, leading coefficient, end behavior. **End behavior explorer**: pick a degree and sign, predict, then reveal. Why the track doesn't climb forever past 8 m. Turning points (at most n − 1), and where the profile dips below the line. **Flow line decoder**: Standard, Factored, Graph and Features views over a side view drawn from the same model. Features shades the sign regions and labels each turning point. |
| 2. Shape the Trail | B(x) + A(x), where the x-terms cancel. **Combination studio**: toggle B, A and T, check any x, and a like-terms table whose T row fills in once answered. Subtraction with the distributed negative, and recovering A = T − B. Expand x(x − 8) · (x − 2)(x − 6) in stages. **Expansion workbench**: an area model with each cell revealed on tap, colour-coded by power. Degree rules, then a challenge expansion. |
| 3. Hidden Features | Q = 200P has the same zeros. Zeros 0, 2, 6, 8 and factor ↔ zero. Multiplicity on M(x) = 0.02(x − 1)(x − 3)²(x − 5): cross or touch. **Multiplicity explorer**: multiplicity 1 to 4 at x = 3. **Build the profile**: toggle zeros and set the scale until it matches Flow Line A. Rational Zero Theorem candidates, and a **zero tester**. Practice: 5 cubics (one with a = 2, so 1/2 is a zero), each with its own tester. |
| 4. Diagnostics Center | The missing-power zero first. **Synthetic division console** on x³ − 7x + 6 by four divisors: guided (one cell at a time) or independent (the whole row), with a named sign-slip message and a count of checks. Then Q ÷ (x − 2) by hand, the quotient, and factoring it. Remainder and Factor Theorems: Q(3), the meaning of the remainder, P(3). **Test a feature location**: k from 0 to 8, showing the synthetic row, remainder and point on the graph. Long division Q ÷ (x² − 8x). **Division workbench**: step through three divisions, including one with a polynomial remainder. The division algorithm. Practice: 5 divisions (exact, with a remainder, negative k, missing powers). |
| Extension | R(x) = (x² + 1)(x − 2)(x − 6): two real zeros on the graph, ±i, four in all (the Fundamental Theorem of Algebra), and conjugate pairs. |
| Final Track Analysis | 12 questions: **A** degree, leading coefficient, turning points, end behavior; **B** zeros and crossing; **C** standard form; **D** synthetic division by (x − r₁) and factoring the quotient; **E** G(test) and F(test). Pass mark **10 of 12** without the solution shown. 5 checked rounds; round 1 is the PRD's F(x). Each round has its own quotient. |
| Report | The PRD's 19 tracked skills (plus complex zeros). Stats include **independent solutions** and **synthetic divisions right**. Practice, not mastery. |

## The math

- `logic/poly.js` holds exact polynomial algebra. Coefficients are fractions (`lesson-kit/frac.js`), stored lowest power first, with zero coefficients kept so missing powers never get lost. It covers:
  - add, subtract, multiply, scale, exact evaluation (Horner), and building from roots with multiplicity
  - long division, with every step, checked by d·q + r = p
  - synthetic division, checked against the Remainder Theorem
  - end behavior, turning points, sign intervals, and Rational Zero candidates
  - standard and factored text, with decimals shown when they terminate
- `logic/models.js` holds Flow Line A, the multiplicity model, B and A, the complex-root model and every validated set.

No numbers are scattered across the UI.

Wrong options in the expression questions are built from specific mistakes. The tests evaluate every option against the true function, so a “wrong” option can't secretly be equivalent.

## Shared code

The fifth mission-board lab. It uses the kit's `missions.js` (with per-mission practice and `live()`), `plot.js` and `controls.js`. `show()` (decimal display of fractions) moved from the Trail Dynamics Lab into `lesson-kit/frac.js`, and both labs import it.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and the Final Track Analysis as an assessment

## Files and tests

```
learning-lab/pump-track-lab/
  index.html, main.js            the page and its connection to the site
  pump-track.js                  config + the four mission pages
  logic/poly.js                  exact polynomial algebra, division, features, text
  logic/models.js                Flow Line A, multiplicity model, profiles, validated sets
  logic/questions.js             every question, ideas, misconceptions, questionKinds()
  components/labs.js             the eleven interactives
  components/visuals.js          side-view profile with rider, opening art
  styles/pump-track.css          scoped under .ptl
```

```
node scripts/test-pump-track-lab.mjs   # engine, PRD numbers, sets, every question and option, curriculum (48)
node scripts/check-site.mjs            # all five mission labs; one shared Frac; the disclaimer
```

The real-Chrome run-through (38 checks) covered:
- every interactive
- traps
- the guided console's sign-slip message
- the builder's match
- passing at 10 of 12
- the report
- reload
- phone width on every page
- reduced motion
