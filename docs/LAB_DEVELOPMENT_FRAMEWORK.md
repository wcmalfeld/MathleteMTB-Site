# Lab development framework

How Mathlete learning labs are built, taken from the first two (the Slope &
Linear Relationships Lab and the Jump Trajectory Lab). Follow this for the
next one; copy whichever of the two is closer.

## 1. Where it lives

`learning-lab/<lab-id>/`, its own address, static files, no build step:

```
index.html        the lab's page: fonts, its stylesheet, the site's progress
                  scripts (supabase-config, auth, progress), then main.js
main.js           the adapter: mount() + onAttempt → MathleteProgress, and a
                  back link to the Classes topic (?from=classes/...)
<lab>.js          mount(element, options): the module's only entry point
logic/            pure functions (math, checking, problems, progress)
content/          words and question data (if not generated in logic/)
components/       screens; build DOM with el()/svg(), never innerHTML
styles/<lab>.css  every rule under one root class (.slab, .jlab, …)
package.json      { "type": "module" } so Node tests can import the files
```

## 2. Rules that keep labs independent

- The module (everything except `index.html` and `main.js`) must not
  reference the site: no MathleteProgress, auth, Supabase, site CSS or nav.
  `check-site.mjs` enforces this per lab.
- One root class for all styles; nothing global.
- `mount()` works with no options: progress in localStorage, hash routing.
  Options: `studentId`, `storage` ('local' | 'memory' | {load, save}),
  `routing` ('hash' | 'memory'), `backLink`, `onAttempt`, `onProgress`,
  `onComplete`; the same events are dispatched on the element.

## 3. The math

- One model module. Every picture, number and answer derives from it; no
  component recomputes anything.
- Keep exact values (fractions) where the curriculum uses them; round only for
  display.
- A Node test re-derives every answer and checks generated problems across
  many seeds; traps (anticipated wrong answers) must never equal an answer.

## 4. Questions

- Types: choice, number, fields (several numbers), point(s) on a graph,
  written (saved, not graded).
- Each has: id (its "kind"), skills, prompt, answer(s), traps with a
  misconception code and a message, three progressive hints, a solution with
  its real-world meaning.
- The full solution is offered only after two tries or all hints. Input that
  can't be read is explained and not counted.
- No AI grading. No mastery claims: show practice, first-try results, hints.

## 5. Connecting to Classes and progress

1. Add the activity to `content/classes/activities.mjs` (`route`, `home`
   topic, `skills`, `tracking: { gameId, questions: { kind: [skill ids] } }`).
   A lab can export its kinds (see `questionKinds()` in the Jump Lab) so the
   mapping isn't duplicated.
2. `node scripts/build-classes.mjs` (pages + `supabase/curriculum.sql`).
3. The user re-runs `supabase/curriculum.sql` in the Supabase SQL Editor.
4. In `main.js`, send `questionId: '<gameId>:<kind>'` (lowercase), a stable
   `questionSnapshot` (prompt + answer: it identifies the question, so don't
   put per-attempt details in it) and a `questionKey` for generated numbers.

## 6. Accessibility and layout checklist

Keyboard for everything (graphs: arrow keys + Enter), labels on every
control, focus visible, shape + label as well as colour, reduced motion (no
autoplay; a non-animated way to explore), aria-live feedback, works at 390 px
with no sideways scroll, touch targets ≥ 44 px.

## 7. Tests to write

- `scripts/test-<lab>.mjs`: model, answers, generators, checking, progress.
- A real-Chrome run through as a student: every section, wrong and right
  answers, hints, points on graphs by mouse and keyboard, reload keeps
  progress, phone width, launch from Classes and back.
- Add the lab's isolation checks to `scripts/check-site.mjs`.
