# Classes

Curriculum-aligned learning, built from
[PRDs/curriculumBasedClassesUpdate.md](../PRDs/curriculumBasedClassesUpdate.md).
Classes sits next to the Lab (the standalone tools on the home page) in the
main nav. The Lab is unchanged.

**Classes → Course → Unit → Topic → Skill**, with **activities** linked to skills.

| Page | Address |
|---|---|
| Classes (the four courses) | `/classes/` |
| A course: units, expandable, with their topics | `/classes/algebra-1/` (units open from `#unit-slug`) |
| A topic: objectives, MTB connection, activities, progress | `/classes/algebra-1/slope-and-rate-of-change/` |

Four courses (Algebra 1, Algebra 2, Geometry, Precalculus), 36 units, 168
topics and 506 skills, exactly as listed in the PRD. One activity so far:
the Slope & Linear Relationships Lab, at its own address
(`/learning-lab/slope-lab/`), shown on Algebra 1 → Linear Relationships →
Slope and Rate of Change and on six related topics (including Geometry →
Slope Review). Topics without activities say so plainly; there are no
placeholder cards.

## How it's built

Same pattern as the Lab pages: the content is data, a script turns it into
plain HTML that's committed, and the site check fails if the two drift.

```
content/classes/curriculum.mjs   courses, units, topics, skills (data only)
content/classes/activities.mjs   activities and the skills they practise
content/classes/model.mjs        loads both, checks ids and references
scripts/build-classes.mjs        writes classes/**/index.html and supabase/curriculum.sql
css/classes.css, js/classes.js   look, and a signed-in student's progress
```

After any change to the content:

```
nvm use 20
node scripts/build-classes.mjs
node scripts/check-site.mjs
```

## Ids are permanent

Progress is stored against skill ids, so:

- **Never change an id** (a topic's `slug`, a skill's slug before the `:`).
  Change the title instead.
- Topic id = `<course>.<topic slug>`; skill id = `<topic id>.<skill slug>`,
  e.g. `alg1.slope-and-rate-of-change.calculate-two-points`.
- Ids don't include unit numbers, so units and topics can be reordered or
  moved between units freely.
- The topic slug is also its address, so changing it would break links.

## Adding things

- **A topic:** add a `T(slug, title, desc, mtb, skills)` line to the right
  unit in `curriculum.mjs`. Leave `mtb` as `null` rather than inventing a
  mountain biking connection that isn't real.
- **A course:** add an object to `COURSES` with its units; give it a card
  `art` (one of `climb`, `jump`, `frame`, `wheel`, or add a drawing in
  `build-classes.mjs`).
- **An activity:** add it to `activities.mjs` with its `route` and the
  `skills` it practises. It then appears on every topic that has one of
  those skills. To count its answers toward skill progress, give it a
  `tracking` block (game id + each question kind → skills), make the game
  call `MathleteProgress.recordQuestionAttempt` with question ids
  `<gameId>:<kind>`, rebuild, and run the new `supabase/curriculum.sql`.

## Progress

- `supabase/curriculum.sql` (generated) adds `curriculum_skills`,
  `curriculum_question_skills` (which question practises which skills) and
  `curriculum_progress()`, and registers the Slope Lab's 32 questions.
  **Run it in the Supabase SQL Editor after progress.sql**, and again
  whenever it changes.
- Attempts are linked to skill ids through their question, so any number
  of activities can add to the same skill.
- Signed-in students see, per skill, how many questions they've answered
  and how many were right first time; per topic, how many skills they've
  practised; per course, how many topics they've started. It's practice,
  never "mastery". Guests see the pages as they are, with a log-in prompt
  on topics that have activities.
- Slope Lab answers also appear on the student dashboard (under Algebra)
  and in Review My Mistakes, like any other game.
