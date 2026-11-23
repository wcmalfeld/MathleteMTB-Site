# Lesson kit (Physics lessons)

`learning-lab/lesson-kit/` is the shared engine for the Physics lessons.
It holds everything that isn't specific to one lesson:
- the overview page
- section pages built from content blocks
- the navigation and the Explore / Apply / Engineer level switch
- questions with hints, feedback that names the mistake, and solutions
- the knowledge check, with retakes as new rounds
- the mastery or completion panel
- graphs, the shared drawings (a rider and labelled arrows) and progress

It was pulled out of the Newton's Laws lesson when the second lesson
arrived. A new lesson should only need content and its own interactives.

| File | What it does |
|---|---|
| `lesson.js` | `mountLesson(element, LESSON, opts)`: the shell. The block types and the `LESSON` shape are documented at the top. |
| `progress.js` | `createProgress({ lesson, … })`: answers, attempts, hints, first tries, rounds, written work, level, time, and `getData`/`setData` for activity state. Stored in localStorage as `mathlete-<lesson id>:v1:<student>`. |
| `ask.js`, `validate.js` | One question (choice, tick all that apply, number, several numbers, optional working box) and deterministic answer checking with traps. Numbers can be typed with units (%, mm, km/h, min, m, N, …). |
| `graph.js`, `draw.js`, `dom.js`, `format.js` | An interactive graph, the rider and arrows, DOM helpers (never `innerHTML`), and display rounding. |
| `lesson-kit.css` | The shared look. Everything is scoped under `.lsn` with an `ls-` prefix. |

## Adding a lesson

1. Make `learning-lab/<id>/` containing:
   - `index.html`, which loads the site's progress scripts, then `../lesson-kit/lesson-kit.css`, then the lesson's own CSS
   - `main.js`, which sends attempts as `<id>:<question>`
   - `<id>.js`, which builds the `LESSON` config and calls `mountLesson`
   - `logic/lesson.js` (content, `questionKinds()`, `mastery()`)
   - `components/`
   - `styles/`
   - a `package.json` with `"type": "module"`
2. Add it to `content/classes/activities.mjs` as `type: 'lesson'` with its
   home module, its ideas mapped to skills, and a `broadSkill`.
3. Set the module's `status` in `content/classes/physics.mjs`.
4. Run `node scripts/build-classes.mjs` and `node scripts/build-catalog.mjs`.
5. Add the lesson to the `LESSONS` list in `scripts/check-site.mjs`, and
   write `scripts/test-<id>.mjs`.
6. Re-run `supabase/curriculum.sql`, then `supabase/catalog.sql`.

Lessons using the kit:
- [Introduction to Physics](INTRO-TO-PHYSICS-LESSON.md) (Module 1)
- [Newton's Laws of Motion](NEWTONS-LAWS-LESSON.md) (Module 7)

Mission-board labs (Algebra 2) use `missions.js` (`mountMissions`) and `missions.css` (prefix `ms-`) instead of `mountLesson`. They also use:
- `controls.js`: slider, segmented control, status chip
- `plot.js`: any window, series, polygons, bands, lines, markers, dragging
- `frac.js`: exact fractions

`missions.js` supports:
- one practice set for the whole lab, or one per mission
- `ctx.live()` blocks, which redraw after an answer
- `summaryExtra` and `stats` hooks, for extra report figures

The mission-board labs:
- [Race-Day Workshop](RACE-DAY-WORKSHOP.md)
- [Ride Systems Lab](RIDE-SYSTEMS-LAB.md)
- [Bike Park Blueprint Lab](BIKE-PARK-BLUEPRINT-LAB.md)
- [Trail Dynamics Lab](TRAIL-DYNAMICS-LAB.md)

A change to the kit affects all six labs and lessons. Run every lab's browser run-through after changing `missions.js` or `missions.css`.
