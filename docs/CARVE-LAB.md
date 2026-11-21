# Carve Lab (Mathlete Ski)

From `PRDs/carveLab.md`. The first Mathlete Ski learning tool: the science of
carving a turn. Phases 1–4 of the PRD are built, plus the student-progress
part of Phase 5.

- **Address:** `learning-lab/carve-lab/`
- **Listed in:** Mathlete Ski → **Tuning Bench**, and featured on the Ski home
  page. It replaces the two planned Tuning Bench tools, "Sidecut & Turn Radius"
  and "Edge Angle Workshop".
- **Access:** public; no account needed.
- **Signed-in students:** answers are also saved to their account.

## What's in it

| Section | What students do |
|---|---|
| **Simulator** | Four controls (sidecut radius 10–30 m, edge angle 0–65°, speed 3–20 m/s, mass 35–110 kg), each with a slider, a typed value, units, a short explanation, a `?` explanation and live "what just changed" feedback. A top-down slope at true scale (10 px = 1 m) with the turn, its centre, radius, direction chevrons, the skier, and velocity / acceleration / force arrows. Insets: the ski from above (sidecut depth) and end-on (edge angle). Play, pause, restart, animation speed, one turn or linked S-turns, vector toggles, zoom to fit, and a scrubber to stop anywhere. |
| **Analysis** (collapsible) | Turn radius, centripetal acceleration, lateral g, required inward force and the 180° turn's distance and time, each with the equation worked through. Graph Lab: radius vs. edge angle, acceleration vs. speed (with ½v and 2v marked), force vs. speed; hover or arrow keys to read, click or Enter to set. Compare two setups (A/B on the slope, on the graphs and in a table with B ÷ A). Saved setups. |
| **Challenge Arena** | Five challenges from the PRD: Sidecut Detective, Edge Angle Experiment, Speed Is Everything, The Heavy Skier Experiment, Design Your Turn. Each: scenario → prediction locked in before the simulator unlocks → experiment → maths questions (hints, mistake-specific feedback, solution only after a real try) → written explanation with a model answer → what it means. Tracks completed, reasoning points, prediction accuracy, first-try accuracy, hints, simulator tries, concepts mastered. |
| **The Model** | The three equations, every explanation (definition, equation, picture, skiing connection, deeper dive), and what the model leaves out. States it isn't ski advice. |

## The maths

One engine, `logic/physics.js`; everything on screen comes from it:
R = Rsc × cos θ, a = v²/R, F = ma, g = a/9.81, distance πR, time πR/v.
Radians inside, degrees only at the edges. Division by zero and out-of-range
input are handled (tested). The path (`logic/simulation.js`) is built once per
setup; animation only moves the skier along it.

## Files

```
learning-lab/carve-lab/
  index.html, main.js      the page, and the adapter to student accounts
  carve-lab.js             mount(): nav, routing, the three sections
  logic/                   physics, simulation, challenges (data), validate,
                           progress (this browser), explain (help text)
  components/              scene, sim, controls, analysis, graph, arena,
                           ask, help, visuals, dom
  styles/carve-lab.css     everything scoped under .clab
```

Adding a challenge means adding an object to `logic/challenges.js`. If it adds
graded steps, also add their kinds to `supabase/progress.sql`; `check-site`
fails if the two lists differ.

## Saving progress

- **Everyone:** progress, settings, saved setups and the A/B slots are kept in
  the browser.
- **Signed-in students:** each graded step is also sent to their account as
  `carve-lab:<kind>` (15 kinds: predictions, maths questions, the C2 target
  run, the C5 design). It then shows in the dashboards and in Review My
  Mistakes like any other lab.
- **School students:** their work counts for their school if its plan includes
  `carve-lab`. WCA's pilot plan includes everything.

## Setup (once)

In the Supabase **SQL Editor**, re-run these, in this order:

1. `supabase/progress.sql` registers the 15 question kinds.
2. `supabase/catalog.sql` adds `carve-lab` to the resource catalog. It also
   marks the two planned Tuning Bench tools it replaces as retired.

Until then the lab works fully, but signed-in answers aren't saved to accounts.

## Tests

```
node scripts/test-carve-lab.mjs     # 83 checks: engine (PRD examples), units, bad input,
                                    # path geometry, every challenge answer, checking, progress
node scripts/check-site.mjs         # isolation, scoping, kinds match progress.sql, listings
```

A real-Chrome run-through (simulator, graphs, compare, help, every challenge
type, reload, phone width) passed 58/58 before release.

## Not built (yet)

- **AI Math Coach:** the site has no AI tutoring service to connect to. The
  lab works fully without it, as the PRD requires.
- **Saved setups on every device:** they're kept in one browser for now.
  Sharing them across devices needs a small database table.
- **Organization assignments and a tutor view of a student's experiments:**
  tutors see answers through the existing dashboards, but not saved setups.
  Both come with the multi-org plan's classes and assignments (Step 5).
