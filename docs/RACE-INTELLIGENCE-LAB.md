# Enduro Race Intelligence Lab

The Algebra 2 Probability and Statistics lab, built from
[PRDs/Algebra2/probAndStats.md](../PRDs/Algebra2/probAndStats.md).
Students analyse simulated enduro race data across four areas:
- race-day probability
- rider consistency and the normal model
- sampling and margin of error
- a randomized experiment

- **Address:** `/learning-lab/race-intelligence-lab/` (id `race-intelligence-lab`, so it can't be confused with the Enduro **Route** Intelligence Lab, `enduro-route-lab`)
- **Curriculum:** Classes → Algebra 2 → Unit 9: Probability and Statistics.
  - Its home is **Statistical Analysis**. It's also listed on Probability, Conditional Probability, and Combinations and Permutations.
  - New skills:
    - Probability: sample spaces, mutually exclusive events, the addition rule, the multiplication rule
    - Conditional Probability: joint and marginal frequencies
    - Statistical Analysis: center and spread, the empirical rule, percentiles, populations and samples, sampling distributions and standard error, study design, randomization tests, evaluating claims
- **Breadcrumb:** Classes → Algebra 2 → Statistical Analysis → Enduro Race Intelligence Lab.
- **Time:** 30–35 minutes. **Level:** intermediate to advanced.

## Checking the PRD

Every number in the PRD was recomputed:
- the table probabilities 0.62, 0.60, 0.42, 0.80, 0.70, 0.50, 0.372
- σ ≈ 4.90 and 11.17, with means and medians of 180
- the empirical-rule ranges
- z = −1 at the 15.9th percentile, z = 2 at the 97.7th, z = −1.5 at the 6.7th
- SE ≈ 0.098, 0.049 and 0.0485, ME ≈ 0.095, 52.5%–71.5%
- the experiment means 7.4 and 9.4
- 56 and 336

No corrections were needed.

**The p-value is computed, not hardcoded**, as the PRD requires. A seeded (2026) randomization test with 50,000 shuffles gives **p ≈ 0.0035**, matching the PRD's reference ≈ 0.0033 within simulation error (other seeds give 0.0032–0.0036). check-site fails if a p-value literal appears in the lab's question or page code. The tests check the reference value, reproducibility, and that identical groups give a high p.

Data integrity:
- Every data set is labelled simulated.
- The probability mission says association isn't causation, and there is a question on it.
- Nothing is presented as riding, weather, equipment or trail advice.

check-site enforces each of these.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Enduro Race Intelligence Lab”: a finish line, a timing scoreboard, the two-way table and a bell curve. **Enter the analytics lab**. |
| 1. Race-Day Probability | The simulated table (200 attempts). Sample space, “and”, “or”, complement, joint. **Race outcome explorer**: a grid with one dot per attempt; click any cell, total, “A or B” or “not A” to highlight those attempts. Switch between counts, joint, marginal and conditional views. Mutually exclusive pairs; P(Wet) by complement. The addition rule (0.80). Conditional probability (0.70 vs 0.50), and the **conditional probability filter**: bars for the restricted sample space, a live formula, and a probability tree that shows branch × branch = joint. Independence two ways (0.70 vs 0.62; 0.372 vs 0.42), and why association isn't cause. Independent card draws (1/6) with a seeded **card simulator** (experimental vs theoretical). Practice: 5 more tables, one independent. |
| 2. Who's Actually Fast? | Two crews with the same center. Range, σ (population; the sample SD is a named trap), and which crew is more consistent. **Consistency analyzer**: dot plots or histograms, a summary table (mean, median, range, IQR, σ), and a practice crew with spread and outlier sliders. Mean vs median with an outlier. When a normal model fits; 68% and 95% ranges, with the **bell curve** (±1, 2, 3 SD or a custom band, areas from the normal CDF). z-scores and percentiles: a time percentile isn't a ranking. **Percentile calculator**. The 204 s challenge. Practice: 5 more models. |
| 3. The Rider Sample Lab | Population vs sample. **Survey simulator**: 1,000 riders as dots, seeded random samples of 25–200, the sample's p̂, recent samples, and the hidden population revealed on request. p̂ = 0.62 isn't exact. SE for n = 25 and 100, and why it halves; the **sampling distribution** of 1,000 seeded samples (mean, simulated SD vs the formula). SE with p̂, ME, the interval, larger samples, no certainty, SD vs SE; the **margin of error explorer**. Random vs convenience surveys, and a **bias demo**. Practice: 5 more surveys. |
| 4. The Race Strategy Experiment | Survey vs observational study vs experiment, and why randomize. Means, difference, and the **treatment comparison** dot plots. “Does it prove it?” The null hypothesis. **Treatment shuffle simulator**: shuffle once to see one split, then run to 1,000, 10,000 or 50,000. The histogram builds from the same seeded sequence, so 50,000 gives the reference p. Interpreting p (not the probability the null is true), practical vs statistical significance, and the conclusion. Practice: 5 study-design scenarios (type, and whether it supports cause). |
| Extension | Who's making the podium? C(8, 3) = 56, P(8, 3) = 336, 1/336, and a **podium counter** for any n and r (a uniform model, not a prediction). |
| Final Race Intelligence Report | 14 questions: **A** race probability (P(target), P(dry), both conditionals, independence, union, causation); **B** z-score and percentile; **C** SE, interval, effect of sample size; **D** experiment difference, p-value conclusion, why randomize. Pass mark **12 of 14** without the solution shown. 5 checked rounds; round 1 is the PRD's report. Across rounds one table is exactly independent, and two experiments are *not* significant (p ≈ 0.42 and 0.11), so the right answer follows the computed p. |
| Report | The PRD's 31 tracked skills (plus counting). Stats include **independent solutions** and **randomization shuffles run**. Practice, not mastery. |

## The math

`logic/stats.js` is the single engine:
- two-way tables with exact fractions (`lesson-kit/frac.js`): joint, marginal, conditional, union, independence
- mean, median, range, quartiles (median of halves), population and sample SD, histograms
- the normal CDF (series and continued fraction, accurate to about 1e-12), pdf, and z-scores
- SE, ME and intervals
- a seeded generator (mulberry32), simple random samples without replacement, sampling distributions, and the two-sided permutation test
- C(n, r) and P(n, r)

Permutation tests are cached per data set. `logic/models.js` holds one data source per scenario and every validated set.

## Setting it up

Re-run in the Supabase SQL Editor:
1. `supabase/curriculum.sql`. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds lab XP and the Final Race Intelligence Report as an assessment

## Files and tests

```
learning-lab/race-intelligence-lab/
  index.html, main.js            the page and its connection to the site
  race-intelligence.js           config + the four mission pages
  logic/stats.js                 the probability and statistics engine
  logic/models.js                race table, crews, normal model, survey, experiment, validated sets
  logic/questions.js             every question, ideas, misconceptions, questionKinds(), cached tests
  components/labs.js             the thirteen interactives
  components/visuals.js          dot grids, probability tree, dot plots, opening art
  styles/race-intelligence.css   scoped under .ril
```

```
node scripts/test-race-intelligence-lab.mjs   # engine, PRD numbers, the reference p-value, sets, every question, curriculum (54)
node scripts/check-site.mjs                   # all eight mission labs; simulated-data labels; no hardcoded p-values
```

The real-Chrome run-through (39 checks) covered:
- every interactive
- traps
- the dot-grid highlighting
- the conditional filter
- seeded sampling
- the 50,000-shuffle p-value shown on the page matching the engine
- passing at 12 of 14
- the report
- reload
- phone width on every page
- reduced motion
