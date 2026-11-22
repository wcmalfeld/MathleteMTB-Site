# Introduction to Physics lesson (Mathlete MTB)

Built from `PRDs/introToPhysicsLesson.md`: phases 1–4, plus the
student-progress part of phase 5. It lives at
`learning-lab/intro-to-physics/` and is the lesson for **Classes → Physics →
Trail Physics → Unit 1 → Module 1**. It runs in the
[lesson kit](LESSON-KIT.md). It's public, and a signed-in student's answers
and written investigation are saved to their account.

Module 1's status is `review`, so its page says "Lesson in review". To
publish it, set `status: 'published'` on `introduction-to-physics` in
`content/classes/physics.mjs` and rebuild.

## What's in it

| Section | What students do |
|---|---|
| 1. What is physics? | The definition, then matter, energy, motion and interactions, each with MTB examples. **Find the Physics:** an illustrated trail with 8 hotspots (mountain, rider, front wheel, tires, fork, brakes, berm, jump); each opens a question, a short explanation and the module where it's studied. |
| 2. The physics of a ride | **One ride, seven physics lessons:** a trail profile with 7 stages. The rider marker rides to each stage, which shows what's happening, its concepts, the MTB link and a question to investigate. All seven together appear at the end. |
| 3. Matter, energy, motion, interactions | The four ideas in depth. **Classify the physics:** 5 scenarios. More than one category can be right; picks that don't fit are explained. |
| 4. Systems and models | Systems and surroundings, with a diagram. **Choose your system:** 3 questions, with objects sorted live into System and Surroundings. Then what models are, their limits, and **Real world vs. model**, where students pick what the projectile model leaves out. |
| 5. How scientists investigate | The 7-step loop, an investigation worked step by step, and the three kinds of variable. **Observation, explanation or prediction?** sorts 6 statements. **Design your own experiment:** independent and dependent variables, 3+ controls, a hypothesis, a prediction and a method, checked and saved. |
| 6. Branches of physics | **The physics universe of MTB:** a map of 7 branches, each with what it studies, MTB examples, a question, and its labs, linked when live. |
| 7. Check and challenge | The PRD's 8 questions, with retakes. **Become a physics detective:** concepts for 5 ride stages, then written Parts A–E with encouraging, deterministic tips. The completion panel follows. |

Explore and Engineer panels appear throughout; the level picks which start
open. The lesson tests no equations; maths starts in Module 2.

**Completing the lesson (PRD 14)** takes all four of:
1. All seven sections complete.
2. All seven ride stages explored.
3. At least 70% (6 of 8) right first try in one knowledge-check round.
4. The Physics Detective done: the stages and all five written parts.

## Saving progress

- **On the student's device:** localStorage, through the kit.
- **Signed in:** answers are recorded as `intro-to-physics:<id>` (25
  kinds). The kinds are registered by `curriculum.sql` under the `physics`
  skill and linked to Module 1's skills.
- **The written investigation** (Parts A–E) is sent as the answer to
  `intro-to-physics:detective-writeup`, so a tutor can read it in the
  student's history.

## Setup

Re-run `supabase/curriculum.sql`, then `supabase/catalog.sql`.

## Tests

- `node scripts/test-intro-to-physics.mjs` runs 80 checks: the content
  against the PRD, every grader, write-up feedback, completion rules and
  progress.
- `node scripts/check-site.mjs` covers the kit and both lessons: scoping,
  independence, kinds matching `curriculum.sql`, the Module 1 link, and that
  the branch map's live labs match the lab library.

## Not built (yet)

- **A tutor review screen and assigning the lesson:** these come with
  classes and assignments.
- **The course dashboard showing lessons complete:** the Classes pages show
  the module's state from skills, not the lesson's own completion.
