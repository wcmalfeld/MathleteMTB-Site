# Newton's Laws of Motion lesson (Mathlete MTB)

Built from `PRDs/NewtonPhysicsLesson.md`, phases 1–5 plus most of phase 6.
It lives at `learning-lab/newtons-laws/` and is the lesson for **Classes →
Physics → Trail Physics → Unit 3 → Module 7**. It's public (no account
needed); a signed-in student's answers are saved to their account.

The module's status in `content/classes/physics.mjs` is `review`, so the
module page says "Lesson in review". To publish it, set
`status: 'published'` on `newtons-laws` and run `node scripts/build-classes.mjs`.

It's built like the labs: a standalone module (only `index.html` and
`main.js` touch the site), a root class of `.nlab`, and the same question,
graph and progress patterns as Berm Lab.

## What's in it

| Section | What students do |
|---|---|
| Overview | The opening questions, the 7 sections with time and progress, the level picker, the 14 objectives, the mastery criteria. |
| 1. What are forces? | Force and its unit, the force types on a bike, mass vs. weight (W = mg), net force, balanced vs. unbalanced. **Identify the forces:** tick forces and give directions, and the free-body diagram draws itself. |
| 2. First law | Inertia, the five MTB cases, "why does the bike slow down when I stop pedalling?". **Inertia experiment:** predict, then race a 60 kg and a 100 kg rider under the same push. |
| 3. Second law | F_net = ma, the three relationships, worked corner-exit and braking examples, climbing. **What makes you accelerate?** Mass and force sliders, a live graph, experiments A, B and C. |
| 4. Third law | Action-reaction pairs on different objects, five MTB cases, the "do they cancel?" misconception. **Who pushes who?** An animated tire with the pair, pedalling or landing. |
| 5. Free-body diagrams | The force table, internal vs. external forces, flat and climb diagrams, mg sin θ and mg cos θ. **Diagram builder:** flat, climb, braking and downhill, each followed by "which way is the net force?". |
| 6. MTB Force Lab | Flat, uphill and braking presets; mass 45–120 kg, traction 0–350 N, braking 0–300 N, resistance 0–120 N, angle −10° to +15°. An animated rider (leans with acceleration), live outputs and working, a to-scale free-body diagram, a speed-time trace, the tire-ground pair with an on-tire / on-ground toggle, graph A (a vs. F) and graph B (a vs. m, click to set the mass), saved experiments, and the three experiments from PRD 9.5. |
| 7. Check and final challenge | The PRD's 8 questions (Q8 takes written working); retakes are new rounds. **Can you accelerate uphill?** Build the diagram, calculate Fg∥, F_net and a, verify against the Force Lab model, then claim–evidence–reasoning. The mastery panel shows the 4 criteria and what to review. |

**Levels (PRD 11).** Explore, Apply and Engineer all show the same lesson.
Each section has "In plain words" (Explore) and "Go deeper" (Engineer)
panels; the chosen level decides which start open.

**Mastery (PRD 13).** All four criteria must be met:
1. At least 7 of 8 right first try in one round of the knowledge check.
2. The final challenge's diagram and calculation, both done without the
   solution shown.
3. An action-reaction pair identified correctly.
4. A free-body diagram with its net-force direction right.

## The physics

`logic/physics.js`, SI units throughout:
- W = mg
- F_net = F_traction − F_braking − F_resistance − mg sin θ
- a = F_net ÷ m (never divides by zero)
- N = mg cos θ

The ride advances in fixed 1/60 s steps, so it's deterministic. A stopped
rider stays put rather than rolling backward, and speed is capped at
25 m/s. Each ride starts at 18 km/h.

## Saving progress

- **On the student's device** (localStorage `mathlete-newtons-laws:v1`):
  sections, every answer with its attempts and hints, written working,
  saved experiments, the level and time spent.
- **Signed in:** each answer is also recorded as `newtons-laws:<id>`, with
  36 kinds. The question kinds are registered by `supabase/curriculum.sql`
  under the `forces-motion` skill and linked to Module 7's skills.
  Knowledge-check rounds and free-body scenarios send a question key, so a
  retake counts as a new first try. Finishing every section closes the
  session with the mastery result.

## Setup

Re-run `supabase/curriculum.sql`, then `supabase/catalog.sql`, in the
Supabase SQL Editor. Until then the lesson works, but signed-in answers
aren't saved.

## Tests

- `node scripts/test-newtons-laws.mjs` runs 91 checks: the PRD's worked
  examples, the model, the ride, every answer, traps, free-body grading,
  progress, retakes and mastery.
- `node scripts/check-site.mjs` covers scoping, independence, that the kinds
  match curriculum.sql, and the Module 7 link.

## Not built (yet)

- **Tutor review screen and assigning the lesson:** these come with classes
  and assignments. Tutors already see the answers, including working and
  explanations, in a student's attempt history.
- **Saved experiments across devices:** they're kept in one browser.
- **Drag-and-drop vectors:** the PRD calls this a later enhancement; v1 uses
  tick-and-choose arrows.
