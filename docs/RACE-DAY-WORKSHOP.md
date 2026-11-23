# Race-Day Workshop

The first Algebra 2 lab, built from
[PRDs/equationsAndInequalities.md](../PRDs/equationsAndInequalities.md).
Students join an enduro race team's technical crew and solve three
race-prep problems with equations and inequalities.

- **Address:** `/learning-lab/race-day-workshop/`
- **Curriculum:** Classes → Algebra 2 → Unit 1: Equations and Inequalities →
  **Solving Equations and Modeling Constraints**. This topic is new: it's the
  unit's first topic and the workshop's home. The workshop is also listed on
  the topics whose skills it practises:
  - Linear Equations Review
  - Absolute Value Equations
  - Radical Equations
  - Rational Equations
  - Complex Numbers
  - Complex Solutions
  - Rational Equations (Unit 6)
- **Time:** 20–25 minutes. **Level:** intermediate to advanced.

## The experience

| Page | What happens |
|---|---|
| Opening | “Your race. Your setup. Your math.”, an enduro rider photo and an **Enter the workshop** button. |
| Mission board | Three mission cards, each with its status. The final card stays locked until all three missions are done. An overall progress bar, the optional extension, the report, and references (FOX, REI, Common Core, OpenStax). Missions can be revisited. |
| Mission 1: Suspension Setup | What sag is (with a photo of sag being measured on a shock), and shock stroke vs wheel travel. **Module A:** rearrange p = s ÷ T × 100, the **sag calculator**, 15 and 18 mm, 17 mm → 28.3%, then the 80 mm independent challenge (20–24 mm). **Module B:** midpoint 27.5%, tolerance 2.5, \|p − 27.5\| ≤ 2.5, the **tolerance gauge**, the three readings (only 27%), the boundaries 25 and 30, distance vs direction, and the compound inequality and interval. The sag calculator has a 60/80 mm stroke switch and an 8–25 mm slider, a live shock drawing (fully extended vs sagged, with an o-ring), a 0–50% bar, a readout table and a live equation. The tolerance gauge is a draggable number line (with a slider for the keyboard) showing \|p − 27.5\| live. |
| Mission 2: Race Timing | Race data table. **Module A:** time allowed (15 min) and time used (5 min); why averaging 12 and v is wrong. The **race clock**: a stage map, rider, race timer, time budget bar and section-2 speed slider. **Module B:** 1/12 + 3/v = 4/16 → v = 18, then the check. **Module C:** the ≤ version, why v > 0 lets you multiply, and v ≥ 18. **Independent challenge:** a new stage (model, solve, check, interpret), with a **New race scenario** button. |
| Mission 3: Trail Survey | **Module A:** √(120² + h²) = 125 and the **trail survey simulator** (horizontal and straight-line sliders, uphill/downhill toggle, live working). It shows “no real solution” when the straight line is shorter than the horizontal. **Module B:** h = ±35 and why both count. **Module C:** verify. **Debugging challenge:** √(q + 9) = q − 3, the candidates 0 and 7, a **candidate checker** that tests each in the original equation, and why squaring created q = 0. |
| Extension (optional) | “The setup that doesn’t exist”: x² + 16 = 0 → ±4i, and why imaginary numbers aren't settings. Not needed for completion. |
| Race-Day Certification | Unlocked by the three missions. The PRD's challenges: **A** (65 mm stroke: 16.25, 19.5, \|s − 17.875\| ≤ 1.625, and 20.5 mm is outside), **B** (v = 20 km/h), **C** (h = ±9). Pass mark: **5 of 6 right without the solution shown**. Passing shows **Race-day ready** with stats. A failed round offers a new round with different, checked numbers. |
| Report | Missions done, final score, correct answers, attempts, first tries, hints and time. A table of the PRD's eight tracked areas (plus the other ideas): answered, first try, hints and solutions shown. Each idea is marked “worth more practice” when a solution was needed or fewer than half were right first time. Also the mistakes that came up. It says practice, not mastery. |

## The math (one model per mission)

All maths lives in `logic/models.js`:
- `sagReading(s, T)`, `sagWindow(T)`
- `raceStage`, `raceRun`
- `survey(a, c)`, `surveyCheck`
- `radicalCandidates`, `radicalTest`
- `complexRoots`

Every picture, readout, question, answer and trap is computed from these;
nothing is typed in twice.

Units and domains are stated at the top of the file:
- T > 0
- speeds > 0, and v ≠ 0 in denominators
- c ≥ a for a real elevation change

The generated numbers come from validated sets:
- `RACE_PRACTICE` and `FINAL_SETS`
- Each set has whole-minute times and whole-number answers.
- The two sections always take different times. When they take equal times, averaging the speeds happens to work, which would hide the misconception.
- The test re-derives every set.

## Questions and feedback

The questions are built in `logic/questions.js`. Each one has:
- three progressive hints (direction, relationship, next step)
- a solution that says what the answer means on the bike
- traps: anticipated wrong answers, each with a misconception code and a message

That's 30 misconceptions in all, including:
- % vs mm and the missing ÷ 100
- distance vs direction
- averaging speeds
- hours vs minutes
- the flipped inequality
- the missing negative root
- not checking a candidate

The full solution is offered only after two tries or all the hints.

Single-answer options appear in a fixed order that varies by question, so the correct one isn't always first.

The questions use the lesson kit's question widget. It gained two things for this lab:
- a **tick all that apply** type (`multi`), for the 24 / 27 / 31% question
- reading answers typed with units (%, mm, km/h, min)

The two Physics lessons are unaffected; their tests still pass.

## Progress

- **In the browser:** progress is always kept here, using the kit's `createProgress` with the missions as sections. It covers:
  - activity start and missions visited
  - every attempt, right and wrong
  - hints and solutions shown
  - first-try answers
  - misconception codes
  - simulator settings
  - the practice scenario and final round
  - certification and time
- **Signed in:** `main.js` also sends every answer as `race-day-workshop:<id>`.
  - Practice scenarios (`v<n>`) and final rounds (`r<n>`) send a question key, so new numbers count as new questions.
  - Passing the certification ends the session as completed, with the score in its metrics.
- **Curriculum:** each question lists the ideas it practises. `content/classes/activities.mjs` maps those ideas to Algebra 2 skills in four topics:
  - the new topic
  - Linear Equations Review
  - Absolute Value Equations
  - Rational and Radical Equations
  - plus Complex Numbers for the extension
- **Rewards:** `supabase/rewards.sql` gives lab XP when the certification is passed (a completed session). The final's six questions count as an assessment.
- **No mastery claims:** passing once doesn't assign mastery. The report says what's worth more practice.

## Setting it up

In the Supabase SQL Editor, re-run (each is safe to re-run):
1. `supabase/curriculum.sql`: the new topic's skills and the workshop's question kinds. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`: the resource catalog entry.
3. `supabase/rewards.sql`: the XP rule and the assessment. Run it after the first two.

## Files and tests

```
learning-lab/race-day-workshop/
  index.html, main.js        the page and its connection to the site
  workshop.js                mount(): shell, routing, board, missions, final, report
  logic/models.js            the maths and the validated number sets
  logic/questions.js         every question, ideas, misconceptions, questionKinds()
  components/labs.js         sag calculator, tolerance gauge, race clock, survey, debugger
  components/visuals.js      SVG drawings (shock, gauge, stage map, triangle)
  images/                    enduro-rider.jpg (opening), measuring-sag.jpg (Mission 1); web-sized copies of
                             assets/photos/MyContent/raceDayWorkshop_Lab/, no metadata
  styles/race-day-workshop.css   scoped under .rdw (loaded after lesson-kit.css)
```

```
node scripts/test-race-day-workshop.mjs   # models, PRD numbers, every set, every question, checking, progress, curriculum (92)
node scripts/check-site.mjs               # isolation, scoping, safe DOM, kinds registered, placement, rewards rows
```

The real-Chrome run-through (30 checks) covered:
- every mission
- wrong answers, traps, hints and solutions
- tick-all
- the sliders
- passing the final at 5 of 6
- the report
- reload
- phone width (390 px) on every page
- reduced motion
