# Frame the Line: the MTB Film Studio

This is the Algebra 1 lab for Unit 4: Linear Equations and Functions. It was built from [PRDs/Algebra1/linearEquations_Functions.md](../PRDs/Algebra1/linearEquations_Functions.md).

- **Address:** `/learning-lab/frame-the-line/`, tracking id `frame-the-line`. It is a new lab, not an extension of Map the Line: slope-lab is the Unit 3 lab now, and the PRD wants a separate film identity.
- **Reuse:** it uses Map the Line's coordinate grid and point plotter, and the shared Algebra 1 workbench, prediction steps, tutor panel and report.
- **Curriculum:**
  - It covers all six Unit 4 topics and all 18 of their skills.
  - Its home topic is Writing Linear Equations.
  - Each topic page opens its own stage, for example "Opens at: Stage 3: Calculate Mid-Project Costs".
- **Time:** 45–55 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every value in section 30 is recomputed by the kit's engines and tested (`scripts/test-frame-the-line.mjs`). All of them are right:

| PRD item | Result |
|---|---|
| C = 420d + 1800 at d = 3 | 3060 |
| Slope 420 and point (3, 3060) | b = 1800 |
| Two points (1, 2220) and (5, 3900) | m = 420, b = 1800 |
| Table | 1800, 2220, 2640, 3060, 3480, 3900 |
| 2C − 840d = 3600 | C = 420d + 1800 |
| C − 3060 = 420(d − 3) | C = 420d + 1800 |
| E − 1200 = 150(h − 4) | E = 150h + 600 |
| S = 600 − 40h | intercepts (0, 600) and (15, 0) |
| y = 700 and x = 4 | horizontal (slope 0); vertical (undefined slope, not a function) |
| Domains and ranges | [0, 8] → [1800, 5160]; [0, 15] → [0, 600] |
| Function values | C(0) = 1800, C(2) = 2640, C(5) = 3900, C(8) = 5160, S(5) = 400, E(5) = 570 |

**One correction:** Stage 4, Activity 3 calls (300, 0) "incorrect" for 2h + S = 600. It is correct: 2(300) + 0 = 600. The lab teaches (300, 0) as the h-intercept and shows the substitution check.

**Disclaimers:**
- All money is "fictional classroom production credits shown in dollars".
- The storage model is labelled simplified.
- The riders (Jess Ortega, Kai Lindqvist, Remy Duval) and film concepts are fictional. The PRD's real-world inspirations (film companies and events) aren't named in the lab.
- There's no video editing and no uploads.

check-site enforces all of these.

## The experience

| Stage | What happens |
|---|---|
| Studio (board) | The student chooses one of three concepts: Utah desert, BC forest or slopestyle. Each has its own art and text; the maths is the same. They name the film and its rider. The **production dashboard** and **timeline** fill in as badges are earned. The **financial dashboard** shows the fixed-cost breakdown, the daily cost, C(planned days), the approved budget C(8) = $5,160 and what's left. It also shows storage S(planned hours). |
| 1 Plan the Production | The budget equation from a description (with expression tiles), from a slope and a point, from two points, from a table and from a graph. Then four description challenges, plus practice. |
| 2 Understand the Budget | m and b and what they mean. A prediction leads to the **budget explorer**, with sliders for daily cost, initial cost and days, and comparisons of two rates or two starts. Then rewriting into y = mx + b and the producer's challenge, plus practice. |
| 3 Calculate Mid-Project Costs | Point-slope form, which must be typed in point-slope form. Then distributing, converting and choosing a form, three department checkpoints, and the **point-slope builder**: fill the blanks, then convert. Plus practice. |
| 4 Build the Production Graph | Plot the budget from its intercept. Then the memory card's intercepts, standard-form intercepts, y = 700 and x = 4 (place any two points on the line), and an interpretation challenge. |
| 5 Manage the Production Limits | Domain [0, 8] and range [1800, 5160], then whole days as a set. Storage limits; open and closed endpoints; separate points; shared outputs; tables; and "not all real numbers". Then the **domain and range builder** (prorated or whole days) and a short written answer. Plus practice. |
| 6 Direct the Film | f(x) notation, C(3) as "C of 3" (not multiplication), and the S and E functions. Function or not, then the **vertical line test** on four graphs. Notation in context, and the **director's dashboard**: the student must calculate before the output is revealed. Plus practice. |
| Film Producer Certification | 12 questions, 2 per topic, over 4 rounds with different numbers. The pass mark is **10 of 12**. |
| Your MTB Film | The production board: "MY FILM: …", concept, rider, location and description. Then every production line, which fills in as each stage is completed. Then the graph with the planned day marked, the status, the badges and the project statement. |

The badges are Executive Producer, Budget Director, Production Coordinator, Graphing Editor, Production Manager and Film Director.

## Kit and shared changes

- **`lesson-kit/equation.js`** gained `lineOf` and `checkLine`, which grade a two-variable line.
  - A required form (slope-intercept or point-slope) is enforced.
  - The right line in the wrong form gets a message naming the form.
  - Traps and intercept, slope and sign diagnoses are reported.
- **`lesson-kit/interval.js`** is new. It reads interval notation or an inequality, and "all real numbers".
  - It flags open/closed mistakes, backwards intervals and all-reals answers.
- **`lesson-kit/ask.js`** has two new question types: `line` and `interval`.
- **`slope-lab/components/figures.js`:**
  - Grids can take `rect: true`, which gives separate cell widths and heights (days against dollars).
  - Tick labels thin out on dense axes.
- **`slope-lab/components/labs.js`:** the point plotter now snaps to grid crossings counted from where each axis starts. A budget axis that starts at $1,800 with $420 steps used to snap to multiples of 420 from zero. Map the Line's grids were unaffected.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`, which registers the lab's questions against the Unit 4 skills.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the reward activity and the `frame-the-line.final` assessment.

## Files and tests

```
learning-lab/frame-the-line/
  index.html, main.js       the page and its site connection (id "frame-the-line")
  frame-the-line.js         config, the six stage pages, certification, production board
  logic/film.js             the models (C, S, E), concepts, timeline, notes
  logic/questions.js        every question, practice sets, certification rounds
  logic/workbench.js        Math Workbench content
  components/labs.js        line plotter (graded), studio, explorers, builder, VLT, dashboard, board
  components/visuals.js     concept scenes and the opening art
  styles/frame.css          scoped under .ftl
```

```
node scripts/test-frame-the-line.mjs   # PRD section 30 and 31, every question, curriculum (59)
node scripts/check-site.mjs            # disclaimers, stage links on all six topic pages
```

The real-Chrome run-through passed **49/49**. It covered:
- choosing a concept and naming the film
- the financial dashboard
- every misconception trap tried
- the explorer, builder, vertical line test, domain builder and director's dashboard
- all six badges, and the studio evolving as they're earned
- passing at 10 of 12
- the production board and renaming the film
- the report and tutor mode
- phone width on every page

After the kit changes, Map the Line (39), Unit 1 (57), Unit 2 (46) and the 10-lab smoke test were re-run, along with every offline unit suite. All pass.
