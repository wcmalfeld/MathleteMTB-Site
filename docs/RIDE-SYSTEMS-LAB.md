# Ride Systems Lab

The first Algebra 2 Functions lab, built from
[PRDs/functionsLesson.md](../PRDs/functionsLesson.md). Students join a
mountain bike performance engineering team and explore functions through
a trail's elevation profile and a bike's drivetrain.

- **Address:** `/learning-lab/ride-systems-lab/`
- **Curriculum:** Classes → Algebra 2 → Unit 2: Functions.
  - Its home is **Function Notation**.
  - It's also listed on Domain and Range, Composite Functions, Transformations of Functions and Inverse Functions.
  - The PRD's combined topic ("Function Notation, Composition, Transformations, and Inverses") maps onto those five existing topics, so no new topic was added.
  - New skills on those topics:
    - input and output
    - reading graphs and tables
    - increasing and decreasing intervals
    - domain in context
    - composition order
    - the horizontal line test
    - restricting a domain
- **Breadcrumb:** Classes → Algebra 2 → Functions → Ride Systems Lab.
- **Time:** 20–25 minutes. **Level:** intermediate to advanced.

## The experience

| Page | What happens |
|---|---|
| Opening | “The Ride Systems Lab”, a drivetrain and telemetry panel, **Enter the lab**. |
| Mission board | Four stations with status. The final unlocks when all four are done. There's also the optional function mixer, the report and references. |
| 1. Read the Trail | The **Pine Ridge Enduro Stage** profile (simulated data). Module A: E(d) notation and the **GPS trail explorer** (draggable marker, telemetry, trail map). Module B: domain and range in the **domain and range explorer** (Domain, Range and Climbs & descents modes). Module C: increasing and decreasing intervals, maximum and minimum. Challenge: the horizontal line at 2,460 m. |
| 2. The Gearbox Lab | f(c) = 2c and g(w) = 0.138w in the **drivetrain simulator**: an animated crank, chainring, chain, sprocket and wheel; cadence, 30–36T chainring, 16–24T sprocket and circumference controls; a live function pipeline. Then composition S(c) = g(f(c)) = 0.276c, why the order matters, and the domain and range on 40–110 RPM. |
| 3. Transform the Trail | h(d) = E(d) − 2400 in the **trail transformation studio** (vertical shift, vertical scale, reflection, horizontal shift, horizontal scale; live equation, description and domain). Modules A–D cover each change. The challenge is to match the target 2h(d) + 40. |
| 4. Reverse the Ride | S⁻¹(v) = v ÷ 0.276 in the **work-backward calculator** (forward and reverse modes; it refuses inputs outside the model). Then one-to-one functions and the horizontal line test, and restricting the domain to 1–1.5 km in the **inverse trail explorer**: E⁻¹(y) = 1 + (y − 2430) ÷ 140, shown with a draggable horizontal line and the inverse graph on swapped axes. Last: f⁻¹ ≠ 1/f. |
| Extension | **Function mixer**: a boardwalk over a creek, combining functions as f + b, T − f, 3.281·T and b ÷ f (undefined at x = 30). |
| Engineer the Ride | 14 questions in four challenges, all from the PRD: **A** a new trail (input and output, evaluate, domain, range, increasing, decreasing); **B** 34T/17T, 2.30 m, 90 RPM → 24.84 km/h; **C** g = 2h + 30; **D** 27.6 km/h → 100 RPM, and why S can be inverted. Pass mark: **11 of 14 right without the solution shown**. A failed round offers a new one with a new trail, drivetrain and transformation (5 checked sets). |
| Report | The PRD's 12 tracked skills (plus input/output and combining functions): answered, first try, hints and solutions shown, with “worth more practice” flags. Also the mistakes that came up. Practice, not mastery. |

## The math

Everything is computed in `logic/models.js`, one model per mission:
- `makeProfile`: piecewise-linear evaluation, domain and range, runs, crossings (the horizontal line test), and an inverse on any one-to-one piece. The inverse is refused when the piece isn't one-to-one.
- `drivetrain`: G = F/R, f, g, S = g ∘ f, S⁻¹, and the model domain and range. Tooth counts and circumference are validated.
- `transform`: g(d) = a·h(b(d − c)) + k, with the new domain. a and b can't be 0.
- `crossing`: the function-operations extension.

Every graph, readout, question, answer and trap comes from these.

The final's number sets are validated by the tests:
- every trail climbs and descends, and has an extreme that isn't at an end
- every drivetrain gives speeds to 2 decimal places
- every target cadence differs from the given cadence

## Shared code

This is the second mission-board lab. Its shell is shared with the
[Race-Day Workshop](RACE-DAY-WORKSHOP.md) in the lesson kit:
- `lesson-kit/missions.js` and `missions.css`: the opening screen, mission board, mission header and footer, extension, final rounds and pass mark, completion and report. Classes use the `ms-` prefix.
- `lesson-kit/controls.js`: slider, segmented control and status chip.

Each lab is config plus its own mission pages and interactives. The Ride Systems Lab adds a small plotter, `components/plot.js`. The kit's graph always starts at zero and draws one curve, which doesn't suit elevations around 2,400 m with overlays.

## Progress

- `main.js` sends answers as `ride-systems-lab:<id>`. Final rounds send a key (`r<n>`).
- Passing ends the session as completed, which earns lab XP in `supabase/rewards.sql`. The final's 14 questions are also an assessment there.
- `content/classes/activities.mjs` maps each idea to Algebra 2 skills.

## Setting it up

In the Supabase SQL Editor, re-run these, each safe to re-run:
1. `supabase/curriculum.sql`: the new skills and the lab's question kinds. Answers won't save to accounts until this is run.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`

## Files and tests

```
learning-lab/ride-systems-lab/
  index.html, main.js        the page and its connection to the site
  ride-systems.js            config + the four mission pages (runs in lesson-kit/missions.js)
  logic/models.js            trail profiles, drivetrain, transformations, inverses, operations, final sets
  logic/questions.js         every question, ideas, misconceptions, questionKinds()
  components/labs.js         the seven interactives
  components/plot.js         the plotter (any window, bands, lines, markers, dragging)
  components/visuals.js      drivetrain drawing, trail map, opening art
  styles/ride-systems.css    scoped under .rsl
```

```
node scripts/test-ride-systems-lab.mjs   # PRD numbers, engines, sets, every question and round, progress, curriculum (70)
node scripts/check-site.mjs              # both mission labs: scoping, isolation, shared shell, kinds, placement, rewards
```

The real-Chrome run-through (32 checks) covered:
- every interactive and every mission
- wrong answers and the misconceptions they name
- the target match
- the restricted inverse
- passing at 11 of 14
- the report
- reload
- phone width on every page
- reduced motion
