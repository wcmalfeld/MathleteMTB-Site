# Slope & Linear Relationships Lab

A standalone learning module built from [SlopeRelationshipsLab.md](SlopeRelationshipsLab.md).
It lives in `learning-lab/slope-lab/` and depends on nothing else on the
site: no login, no site navigation, no shared styles.

- **Address:** `https://www.mathletemtb.com/learning-lab/slope-lab/`.
- **Where it's listed:** Classes → Algebra 1 → Linear Relationships → Slope
  and Rate of Change (and six related topics; see docs/CLASSES.md). Opened
  from a topic, it shows a link back to that topic.
- **Saving progress:** its page (`index.html` + `main.js`) loads the site's
  progress tracking, so a signed-in student's answers are saved as
  `slope-lab:<question id>` and count toward the curriculum skills in
  `content/classes/activities.mjs`. The module itself still knows nothing
  about the site.

## What's in it

| Section | What the student does |
|---|---|
| Introduction | "What makes a trail steep?": one screen, then *Explore slope*. |
| Learn (7 topics) | Rise and run (step-through on a to-scale trail), worked example (0.2, 20%, and why 20% is not 20°), four kinds of slope, slope from two points (worked, then pick your own points), slope from a graph (pick points on a line), slope from a table (and is it linear?), y = mx + b with sliders. |
| Explore | **Trail Designer** (called that because the Lab already has a game named Trail Builder): sliders and number boxes for start elevation, end elevation and run, feet or metres; rise, run, slope as a fraction and decimal, grade, angle and equation update instantly; a to-scale trail picture plus a labeled graph that warns when its axes use different scales. Six challenges and four prediction cards. |
| Practice | 24 questions, 8 per level (Foundations, Application, Challenge), with a suggested level. |
| Challenge | 8 transfer questions with no biking: two points, equations, tables, constant rate of change, graphing a line, undefined slope, a phone-plan rate, writing an equation. |
| My Progress | What was explored (activity) kept separate from how answers went (first try, after another try, solution shown, hints), skills that may need work, a suggested next step, and every question tried with the student's answers. It never claims mastery. |

Every question has an objective, a skill, progressive hints, feedback that
explains the idea (plus specific messages for common mistakes: run ÷ rise,
a percent given for a slope or the other way round, the wrong sign, the end
elevation used as the rise), and a full explanation once it's right or the
student asks to see it (offered after two tries or all hints).

## Files

```
learning-lab/slope-lab/
  index.html            standalone page (fonts + the module)
  main.js               mounts the lab with default options
  slope-lab.js          the public entry point: mount(element, options)
  logic/slope.js        all the math (rise, run, slope, grade, angle, lines, tables, units)
  logic/validate.js     answer checking (numbers, fractions, %, "undefined", choices, plotted points)
  logic/progress.js     progress tracking and storage
  logic/select.js       next question, suggested level, suggested next activity
  content/questions.js  the 32 questions (data only)
  content/lessons.js    lesson text, challenges, predictions (data only)
  components/*.js       the screens
  styles/slope-lab.css  every rule scoped under .slab
  package.json          only so Node can load the files as modules for tests
```

To change a question, edit `content/questions.js`, then run the tests: they
re-derive every answer from the question's own numbers, so a typo fails.

## Tests

```
nvm use 20
node scripts/test-slope-lab.mjs     # math, answer checking, every question, progress
node scripts/check-site.mjs         # includes: styles scoped, no site scripts, unlisted
```

## Embedding it elsewhere later

```js
import { mount } from '/learning-lab/slope-lab/slope-lab.js';
const lab = mount(document.getElementById('somewhere'), {
  studentId: 'abc',          // keeps each student's progress apart
  storage: 'local',          // 'local' (this browser) | 'memory' | { load(key), save(key, data) }
  routing: 'memory',         // 'hash' (default) or 'memory' when the host owns the URL
  onAttempt: record => {},   // each answer: question id, prompt, answer, right/wrong, attempt no., hints
  onProgress: summary => {},
  onComplete: summary => {}  // once: every Challenge question tried + one practice level tried
});
```

The same events fire on the element as `slopelab:attempt`,
`slopelab:progress` and `slopelab:complete`. `main.js` is the example
adapter: it passes `onAttempt` to `MathleteProgress` and adds a `backLink`.

If you add or remove a question, also update its objective in
`content/classes/activities.mjs` (check-site.mjs compares them), rebuild
Classes and re-run `supabase/curriculum.sql`.

## Progress storage

Kept in the browser under `mathlete-slope-lab:v1:<studentId or guest>`.
It survives refreshes and return visits on the same device. *My Progress →
Start over* clears it; *Reset this level* clears one level.
