# Teacher Curriculum (lesson plan library)

Built from [PRDs/lessonPlanLibrary.md](../PRDs/lessonPlanLibrary.md). Ready-to-teach lesson
plans for Algebra 1, Geometry, Algebra 2 and Precalculus, organised
**Course → Quarter → Unit → Topic → Lesson**, at `/teacher-curriculum/`.

## Where it lives

| What | Where | Public? |
|---|---|---|
| Courses, units, topics | `content/classes/` (the same curriculum students see in Classes) | yes |
| Which units fall in which quarter, current quarter, tool registry | `content/teacher-curriculum/quarters.mjs` | yes |
| Lesson rules (what every plan must contain) and the public / student / teacher split | `content/teacher-curriculum/schema.mjs` | yes |
| **Lesson plans** (with answer keys) | `private-content/lesson-plans/<course>/*.mjs` | **no** (git-ignored) |
| Each lesson’s public overview (generated) | `content/teacher-curriculum/lessons.json` | yes |
| Pages (generated) | `teacher-curriculum/…` | yes |
| Full plans, readable only by teachers | Supabase table `teacher_lessons` (`supabase/teacher-curriculum.sql`) | no |
| Renderer, math notation, graphs | `js/teacher-curriculum/`, `css/teacher-curriculum.css` | yes |

The repository is public, so answer keys never go in it. **Back up
`private-content/` somewhere private** (for example a private GitHub repo
or a cloud drive): it is the only copy of the lesson sources.

## Who sees what

- Everyone: the landing page, course pages, and each lesson’s overview
  (objectives, essential question, MTB connection, activity and its launch link).
- Teachers: the full plan. A teacher is a platform admin, a direct account
  with role `tutor` or `admin`, or an owner/admin/instructor of an
  organization whose licence includes `feature.teacher-curriculum` and has it
  switched on. Students never are. The database decides (`is_teacher()`);
  the page only asks `teacher_lesson(id)`, which returns nothing to anyone else.
- Lessons with status `review` are visible only to platform admins.

## Setting it up (once)

1. Supabase SQL Editor: re-run `supabase/catalog.sql` (adds the Teacher
   Curriculum catalog row), then run `supabase/teacher-curriculum.sql`.
   Run order is now … → curriculum → catalog → teacher-curriculum.
2. Terminal, in the site folder: `node scripts/admin.mjs lessons-upload`
3. Schools: WCA’s `pilot` plan includes everything, so its instructors get
   access. A new plan needs `node scripts/admin.mjs plan-resources <plan> add feature.teacher-curriculum`.
4. Push to deploy the pages.

## Changing or adding lessons

1. Edit or add a file in `private-content/lesson-plans/<course>/`. A lesson’s
   `id` is its Classes topic id (e.g. `alg1.slope-and-rate-of-change`).
2. `node scripts/build-teacher-curriculum.mjs` — fails with a clear message
   if a lesson breaks a rule (missing section, too few problems, an answer
   missing, bad math markup, unknown tool, stage minutes not adding up…).
3. `node scripts/admin.mjs lessons-upload` (only changed lessons are sent).
4. Commit the regenerated pages and `lessons.json`; never the sources.

Moving units between quarters, or confirming a school’s own sequence:
edit `quarters.mjs` (`confirmed: true` removes the “Proposed sequence” note),
then rebuild. `CURRENT_QUARTER` sets which quarter pages open on.

### Lesson format

Each lesson has: `title`, `hook`, `minutes`, `status`, `standards`,
`summary`, `objectives`, `question`, `vocab`, `foundation` (blocks: `p`,
`formula`, `graph`, `example`, `note`, `list`, `table`, `steps`), `mtb`
(`text`, `pairs`, `assumptions`), `stages` (minutes must add up), `activity`
(`kind`: tool | lab | classroom | problem; `tool` id from `TOOLS` for the
first two; teacher/student steps, questions and expected answers), `guided`,
`practice` (levels concept → standard → mtb → challenge), `exit` (3–5),
and `resources` (notes, misconceptions, support, extend, ell, challenge).

Math is written `$…$` in a small LaTeX-like notation (`\\frac{a}{b}`,
`x^2`, `\\sqrt{}`, `\\theta`, …; see the top of `js/teacher-curriculum/math.js`).
In JS strings double every backslash; the build rejects single ones.
Graphs and diagrams are data (see the top of `js/teacher-curriculum/graph.js`).

## Features

Quarter tabs (open on the current quarter; the address follows), expandable
units, breadcrumbs, previous/next lesson, a sticky section list, answers
hidden behind “Show” toggles, **Student view** (hides teacher-only material
for projecting), **class length** (rescales stage timings), **Print lesson
plan** (opens every solution) and **Print student worksheet** (practice and
exit ticket only, with writing lines). Labs open in a new tab, and the Slope
and Jump Trajectory labs link back to the lesson.

## Current content

Quarter 2 of all four courses: 41 complete lessons (Algebra 1: 12, Geometry: 11,
Algebra 2: 9, Precalculus: 9). Other quarters show their topics as “Lesson plan
planned”. The quarter sequence is a **proposed** pacing, labelled as such.

## Tests

```
node scripts/test-teacher-curriculum.mjs   # notation, figures, lesson rules, answer split; + database access with PGlite
node scripts/check-site.mjs                # pages up to date, every current-quarter topic has a lesson, no answers in public files
```
