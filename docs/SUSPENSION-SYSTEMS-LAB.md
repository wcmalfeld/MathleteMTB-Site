# Suspension & Systems Lab

The Algebra 2 Exponential and Logarithmic Functions lab, built from
[PRDs/Algebra2/exp_logFunctions.md](../PRDs/Algebra2/exp_logFunctions.md).
Students investigate three systems:
- a suspension's decaying rebound
- a trail festival's growing registrations
- an event's sound levels in decibels

- **Address:** `/learning-lab/suspension-systems-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 7: Exponential and Logarithmic Functions.
  - Its home is **Exponential Growth and Decay**. It's also listed on the unit's other four topics: Exponential Functions, Logarithms, Logarithmic Properties and Applications.
  - It also counts toward Sequences and Series: Geometric Sequences and Series.
  - New skills:
    - Exponential Functions: domain, range and asymptote; continuous models
    - Exponential Growth and Decay: growth and decay factors; solving for time
    - Logarithms: common and natural logs; logs as inverses; log domain
    - Applications: sound levels
    - Geometric Sequences: recursive rules
- **Breadcrumb:** Classes → Algebra 2 → Exponential Growth and Decay → Suspension & Systems Lab.
- **Time:** 20–25 minutes. **Level:** intermediate to advanced.

## Changes from the PRD

Every number in the PRD was recomputed. One was wrong:

- **Final Challenge B's time to 250 registrations.** The PRD gives w ≈ 3.61. The correct value is ln(250/150) ÷ ln(1.15) ≈ **3.66** (3.655). At 3.61 weeks the model gives about 248.4, not 250. The interpretation still holds: the target is first reached in week 4. The lab uses 3.66, and the tests check it.

Everything else matched:
- the amplitude table, k ≈ 0.8616, t ≈ 2.55 s, n ≈ 5.10, cycle 6
- the registration table, w ≈ 5.03, week 6, S₅ = 744.16
- 40/50/70/80 dB, 3.1623 × 10⁻⁵ W/m², log₃ 20 ≈ 2.727
- 5.7624 mm, n ≥ 5.83, R(4) ≈ 262.35, 10⁻⁴ W/m², t ≈ 1.99 s, k = ln 1.2 ≈ 0.1823

Disclaimer: the board says all three models are simplified. That covers:
- an envelope, not a full model of a real shock, and not suspension settings
- fictional, short-term registrations, not a forecast
- fictional sound readings, not a safety assessment

The simulators repeat it. check-site makes sure each one still does.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Suspension & Systems Lab”: rebound telemetry with the decaying oscillation and its envelope, a rear shock, a registration chart and a sound meter. **Enter the lab**. |
| 1. Tune the Bounce (the signature mission) | **Briefing:** spring, damper, compression, rebound, oscillation and amplitude, with the simplified-model note. **The model:** Aₙ = 18(0.65)ⁿ: keep 65%, lose 35%, A₃, the table, and why the differences aren't constant. **Exponential vs linear:** Lₙ = 18 − 6.3n goes negative by cycle 3, with tables of differences and ratios. **Suspension decay simulator:** a stylised shock with its spring, the oscillation inside its upper and lower envelopes, peak markers turning green below the threshold, the threshold band, and telemetry. Controls for A₀, r, cycles and threshold. **Hit a bump** animates it; the time slider is the static view (reduced motion jumps straight to the end). **Geometric sequences:** first term, ratio, decay % and A₆, recursive vs explicit, and the **sequence explorer**. **Transformation studio** for a·b^(x − h) + k. **Base e:** k = −ln(0.65)/0.5 and A(1.5) = A₃, with the **cycle-vs-time** views agreeing at every peak. **Settling time:** t ≈ 2.55 s, n ≈ 5.10, cycle 6, and the **settling calculator**. Practice: 5 more shocks. |
| 2. Grow the Ride | Factor 1.20, R(3), the table, and 20% vs 20 riders. **Event growth simulator:** a capacity bar toward 300 (flagged when over), exponential vs linear curves and table, and the weeks outside the 0–6 planning window shaded. Week 6: 299 vs 220, and why not to extrapolate. Solving for 250 → 5.03 weeks, week 6, with the **growth target calculator**. Practice: 5 more events. |
| 3. Decode the Sound | log₁₀ 1000, the ratio 10⁷, 70 dB, the locations table, and +10 dB = ×10. **Decibel analyzer:** a meter, a slider for I = 10ⁿ, location presets, the log graph, and a second source showing that intensities add (80 + 80 → 83.01 dB). Exponential ⇄ log form, rearranging for I, and the **conversion tool** (bases 10, 2, e). Product, quotient and power properties, the false “log of a sum”, and two equal sources (73.01 dB). log vs ln, log₂ 32, log₃ 20, and the **logarithm workbench** (each property and change of base, both sides computed). Log domain, then solving 75 dB. Practice: 5 more readings, each also compared with the 40 dB zone. |
| Extension | Advanced engineering bench: continuous growth k = ln 1.2, log transformations with a **log studio** (and the parent's inverse), and geometric vs arithmetic series (744.16 vs 700). |
| Final Engineering Report | 12 questions: **A** suspension (model, A(4), cycles to threshold); **B** event growth (model, R(4), time to target, linear comparison); **C** sound (exponential form, intensity, what +10 dB means); **D** ln reversal (time, and why logs are needed). Pass mark **10 of 12** without the solution shown. 5 checked rounds; round 1 is the PRD's report. |
| Report | The PRD's 28 tracked skills (plus geometric series). Stats include **independent solutions** and **equations solved with logarithms**. Practice, not mastery. |

## The math

- `logic/expo.js` is the single calculation layer:
  - terms, explicit and recursive rules, linear comparison
  - continuous rates, and solving a·bˣ = target and a·e^(−kt) = target
  - the first whole step past a target, robust at whole numbers
  - finite series
  - logs with exact integers for exact powers (log₂ 32 = 5, not 4.999…)
  - sound level and intensity, combining sources by intensity
  - scientific notation and display formatting
- `logic/models.js` holds the three scenarios and every validated set. k is kept at full precision, so the continuous envelope passes exactly through every discrete peak.

Answers are full-precision floats checked with tolerances. Display rounding never affects marking.

The tests evaluate every model option against the true function.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and the Final Engineering Report as an assessment

## Files and tests

```
learning-lab/suspension-systems-lab/
  index.html, main.js            the page and its connection to the site
  suspension.js                  config + the three mission pages
  logic/expo.js                  the exponential/log calculation layer
  logic/models.js                suspension, growth and sound scenarios, validated sets
  logic/questions.js             every question, ideas, misconceptions, questionKinds()
  components/labs.js             the twelve interactives
  components/visuals.js          rear shock, decibel meter, capacity bar, opening art
  styles/suspension.css          scoped under .ssl
```

```
node scripts/test-suspension-systems-lab.mjs   # calculation layer, PRD numbers (and the correction), sets, every question and option, curriculum (48)
node scripts/check-site.mjs                    # all seven mission labs; the disclaimers
```

The real-Chrome run-through (39 checks) covered:
- every interactive, including the animation and its reduced-motion behaviour
- traps
- the capacity warning
- combining two sources
- passing at 10 of 12
- the report
- reload
- phone width on every page
