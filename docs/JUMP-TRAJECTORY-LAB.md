# Jump Trajectory Lab

Quadratic functions from a mountain bike jump. Built from
[PRDs/alg1JumpLab.md](../PRDs/alg1JumpLab.md) (where it's called "The Jump
Lab"; renamed because the Lab already has a different game called Jump Lab,
which is untouched).

- **Address:** `/learning-lab/jump-trajectory-lab/`
- **Curriculum:** Classes → Algebra 1 → Unit 8: Quadratic Equations and
  Functions → Graphing Quadratics (its home), also listed on Vertex and Axis
  of Symmetry, Factoring Quadratics (solving), and Applications of Quadratic
  Functions.
- **Time:** 15–20 minutes. **Level:** beginner to intermediate.

## The experience

| Section | What happens |
|---|---|
| Overview | "Every jump has a shape. Every shape has math behind it." A rider flies the jump; the student guesses the shape (line, circle, parabola, triangle) and gets feedback. |
| Explore | The simulator: jump scene and coordinate plane side by side, sliders + number boxes for L (6–24 m) and H (1–6 m), live telemetry, live vertex form, a "what changed" sentence after every change, the previous jump as a faint outline, Play / Jump to apex / pause-at-apex, and a position slider to step the rider along without animation. Free-exploration prompts underneath. |
| Learn | Modules A–E (parabola, vertex, zeros, axis of symmetry, coefficient): explanation, demonstration, guided interaction, comprehension check. B and C ask the student to click points on an unlabeled graph. |
| Equation Decoder | One jump in vertex / standard / factored form with tabs that highlight what each shows (on the equation and the graph); "which form makes it easiest" matching; two translation questions. |
| Challenges | Six missions (find the apex, locate the landing, match the jump, change the shape, reverse-engineer in all three forms, final blueprint with a written explanation). They unlock in order and can be replayed with new numbers. |

## The math (one model)

`logic/quadratic.js` → `jumpModel(L, H)`:
a = −4H/L², vertex (L/2, H), zeros 0 and L, axis x = L/2,
standard form y = ax² + (4H/L)x, factored form y = a·x(x − L), domain 0 ≤ x ≤ L.
Coefficients are exact fractions (−1/12, not −0.0833…); decimals are only for
display. The scene, graph, rider, telemetry, equations and every question's
answer come from this one function.

## Questions and feedback

- Generated problems (`logic/problems.js`) are built from the model; the
  random ones draw from 16 jumps with tidy coefficients (a = −1/n).
- Every question has three progressive hints; the full solution is offered
  only after two tries or all hints. Unreadable input isn't counted.
- Misconceptions recognised: swapped vertex coordinates, distance vs height,
  maximum at a zero, zero vs vertex, coefficient sign, width vs height, axis
  confusion, form confusion.
- Scoring per mission: 3 = solved on the first try of every step with no
  hints; 2 = solved with help; 0 = solution shown (the next mission still
  unlocks). Best score per mission is kept across replays. Max 18.

## Progress

- In the browser (always), and to the student's account when signed in:
  the page's `main.js` sends each answer as `jump-trajectory-lab:<kind>`
  with a question key for the jump's numbers. `content/classes/activities.mjs`
  maps each kind to curriculum skills; `supabase/curriculum.sql` (generated)
  registers them. **Re-run `supabase/curriculum.sql` in Supabase** to switch
  this on.
- Completion (all six missions) is reported as a finished session.
- Tracked locally: start, completion, active time (gaps between actions,
  ignoring idle gaps over 2 minutes), attempts, right/wrong, hints, independent
  answers, best score per mission, misconception codes, written explanations.

## Limitations

- **Misconception codes are kept in the browser only.** The server's
  attempt record has no field for them yet; the wrong answers themselves are
  saved, so a tutor view could re-derive them later.
- **Written explanations aren't graded** (no AI grading, by design). They're
  saved in the browser and the student compares with a model answer.
- No skill "mastery" is shown anywhere: practice counts only.

## Files and tests

```
learning-lab/jump-trajectory-lab/
  index.html, main.js           the page and its connection to the site
  jump-lab.js                   mount(): shell, routing, overview, explore
  logic/quadratic.js            the model and the three forms
  logic/problems.js             questions, modules, decoder, missions, questionKinds()
  logic/validate.js             answer reading, checks, misconceptions
  logic/progress.js             progress, scoring, time
  components/                   graph, scene, simulator, ask (question widget), learn, decoder, missions
  styles/jump-lab.css           scoped under .jlab
```

```
node scripts/test-jump-lab.mjs      # model, forms, every generated problem, checking, progress
node scripts/check-site.mjs         # isolation, curriculum placement, Classes up to date
```
