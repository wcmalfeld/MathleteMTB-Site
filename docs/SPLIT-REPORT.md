# The Split Report: the MTB Race Intelligence Lab

This is the Algebra 1 lab for Data and Statistics, the last unit of Algebra 1. It was built from [PRDs/Algebra1/raceIntelLag.md](../PRDs/Algebra1/raceIntelLag.md).

- **Address:** `/learning-lab/split-report/`, tracking id `split-report`.
  - The Algebra 2 lab already uses `race-intelligence-lab`, so this lab has its own id.
- **Curriculum:**
  - It covers all four topics (Data Representation, Scatter Plots, Correlation, Lines of Best Fit) and all 12 of their skills.
  - Its home topic is Data Representation.
  - Each topic page opens its own mission, as the PRD's four routes ask.
- **Time:** 45–55 minutes. **Level:** beginner to advanced.

## The story

The student is a junior Race Intelligence Analyst at **Northstar Gravity Racing**, a fictional downhill team. Performance Director Kai Rowe gives them four missions, and they finish with a printable Race Intelligence Report.

## Checking the PRD

Every number in section 13 is recomputed by the kit's statistics engine and checked in `scripts/test-split-report.mjs`. All of them are right, and no corrections were needed.

| PRD item | Result |
|---|---|
| Rider A: mean, median, range, Q1, Q3, IQR | 64, 64, 4, 63, 65, 2 |
| Rider B: mean, median, range, Q1, Q3, IQR | 65, 63.5, 18, 60, 69.5, 9.5 |
| Histogram (58–62, 63–67, 68–72, 73–77) | A: 1, 7, 0, 0. B: 3, 3, 1, 1 |
| r, all ten riders / without Rider 8 | −0.807 / −0.972 |
| Least-squares line | ŷ = 78.4 − 1.4x (exact) |
| Predictions at 6, 8 and 11 laps | 70, 67.2, 63 (11 is flagged as an extrapolation) |
| Residuals | the whole table, including −3 at 6 laps and +7.8 for Rider 8 |

**How the numbers are made:**
- Quartiles always use the median of halves.
- No coefficient is typed in. r, the line, every prediction and every residual are computed from the data shown, and check-site enforces this.
- The correlation explorer's points are generated from a seeded engine and mix two exactly uncorrelated lists, so the r shown is always computed from its own points.
- The practice and certification datasets were picked so the least-squares slope and intercept come out to exactly one decimal. That means the equation students see is the true line, and the tests check it.

**Disclaimers:**
- All data is fictional instructional data, not UCI, Crankworx or athlete results.
- Times are in seconds, and lower is faster.
- An association is not proof that practice causes faster times.
- The model can't reliably predict real race results.
- Mathlete isn't affiliated with the UCI, Crankworx, ChronoRace or Gravity Lab. They're named only as real-world examples and career links.
- Simulations are labelled as simulations.
- An outlier is flagged for investigation, never deleted or treated as proof of what happened.

check-site enforces all of these.

## The experience

| Part | What happens |
|---|---|
| Race room (board) | Team identity, the director's briefing, four mission badges, a timing tower (sortable, with animated numerals), and five career spotlights. |
| 1 The Consistency Audit | A timing board for Riders A and B (each alone or both together). Predict first, then choose a display. Then: the **dot plot** (repeated times stack; select a dot to see its run; an explore copy to add or remove runs), the **histogram builder** (three valid bin setups and two invalid ones, which are refused with the reason), the **median and quartile stepper**, and side-by-side **box plots** with selectable parts. Then the performance decision, two challenge questions and a sentence-frame recommendation. |
| 2 The Pattern Scan | The graded **scatter plot builder**: tap or type points, which snap to whole numbers. Correct points are confirmed and their table rows tick. Wrong ones are flagged and can be moved by tapping or with the arrow keys. Selecting a point highlights its row, and the complete graph can be revealed after. Then reading the pattern, why the dots aren't joined, and the **outlier investigation** (hide or show Rider 8; flag it, don't delete it). |
| 3 Signal or Noise? | The **correlation explorer**: six relationships, each with a direction and strength prediction before r is revealed, plus a slider to generate your own with r hidden or shown. Then Northstar's r, the **sensitivity experiment** (−0.81 becomes −0.97), causation, "what else could be happening?", the headline rewrite, and the sports-scientist career card with the research links. |
| 4 Race-Day Forecast | The **line-fitting tool** (drag or use sliders; a residual overlay; reveal the least-squares line; compare total squared miss). Then the slope and intercept, the **prediction tool** (the observed range is shaded and extrapolation is flagged), residuals, the **residual visualizer** (solid lines with + and dashed lines with −, so colour is never the only signal), the forecast challenge and the six-part **race briefing**. |
| Race Intelligence Analyst Certification | 12 questions (3 + 3 + 2 + 4) over 4 rounds of new fictional data. The pass mark is **10 of 12**, and there's a short written answer. |
| Race Intelligence Report | A printable report: the consistency table and box plots, scatter plot, r values, model, prediction and residual, the student's written conclusions and briefing, and a certificate (analyst name, module, completion date, score, badges). |

**Badges:**
- Consistency Auditor, Pattern Hunter, Signal Detective and Race-Day Forecaster.
- The PRD gave Mission 4 the same award as the whole module, so Mission 4's badge has its own name.
- Passing gives **Certified Race Intelligence Analyst**.

The session report counts center, spread, causation and outlier, and residual and model slips.

## Kit changes

- **`lesson-kit/stats.js` (new):**
  - Mean, median, quartiles (median of halves), IQR and summaries.
  - Tallies, histograms, whole-number bins and bin validation.
  - Pearson r, least-squares regression, predictions, residuals, total squared miss and extrapolation.
  - Seeded generated relationships.
- **The Algebra 2 Enduro Race Intelligence Lab:** it now imports its descriptive statistics from the kit, so the statistics code lives in one place. Its 54 tests still pass.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the reward activity and the `split-report.final` assessment.

## Files and tests

```
learning-lab/split-report/
  index.html, main.js       the page and its site connection (id "split-report")
  split-report.js           config, the four mission pages, certification, report
  logic/data.js             the fictional team and every dataset (PRD field names)
  logic/questions.js        every question, computed from the data; practice; certification
  logic/workbench.js        Math Workbench content
  components/charts.js      dot plot, histogram, box plot, scatter (on the kit plotter)
  components/labs.js        timing board, dot plot, histogram builder, stepper, box plots, scatter builder, outlier lab
  components/forecast.js    correlation explorer, r experiment, careers, line fitter, prediction tool, residuals, briefing
  components/room.js        race room, timing tower, Race Intelligence Report
  components/visuals.js     the opening race-room art
  styles/split-report.css   scoped under .spr
```

```
node scripts/test-split-report.mjs   # PRD answer keys, stats engine, explorer, every question, datasets, curriculum (42)
node scripts/check-site.mjs          # disclaimers, no hardcoded r, stage links on all four topic pages
```

The real-Chrome run-through passed **61/61**. It covered every interactive, the misconception feedback, the four badges, a reload, passing at 10 of 12, the report, the tutor panel, reduced motion, and phone width on every page.
