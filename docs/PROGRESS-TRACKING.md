# Progress tracking: how it works

Reference for the student-progress system (plan and status:
`docs/STUDENT-PROGRESS-PLAN.md`). Member access itself is in
`docs/ACCESS.md`; this builds on it.

## Turning it on

1. Supabase → SQL Editor → paste `supabase/progress.sql` → Run. It needs
   `supabase/setup.sql` to have been run first, and is safe to run again.
   Everyone who already has access gets a student profile.
2. `node scripts/test-progress.mjs` (Node 18+, `.env` filled in). It
   makes throwaway accounts, checks every rule below against the real
   server, then deletes them.
3. Set names and roles (next section).

## People: students, tutors, admins

| Task | Command |
|---|---|
| See every account's role and who tutors whom | `node scripts/admin.mjs roster` |
| Set the first name shown on dashboards | `node scripts/admin.mjs name student@example.com Noah` |
| Make an account a tutor (or `student`, `admin`) | `node scripts/admin.mjs role tutor@example.com tutor` |
| Let a tutor see a student's progress | `node scripts/admin.mjs assign student@example.com tutor@example.com` |
| Take that away (immediate, deletes nothing) | `node scripts/admin.mjs unassign student@example.com tutor@example.com` |

`invite` and `create` make a student profile automatically. A new tutor
is: `invite`, then `role ... tutor`, then `assign` for each student. To
see every student yourself, make your own account an `admin`.

Profiles hold a first name only. The email stays in Supabase Auth.

## Who can see and change what

All of this is enforced in the database (`supabase/progress.sql`), not
by the pages.

| Who | Can read | Can change |
|---|---|---|
| Logged-out visitor | Nothing | Nothing. Games still work; nothing is saved. |
| Student | Their own profile, attempts, sessions, review items; their tutors' names; the skill and question lists | Nothing directly. Their answers are saved through `record_attempt()`. |
| Tutor | The same, for students actively assigned to them | Nothing yet (review actions and notes arrive in Phase 3) |
| Admin | Every student's records | Nothing from the browser |
| You, with `scripts/admin.mjs` | Everything | Everything |

A revoked or expired account, or a logged-out session, loses all of it
at once, because every rule also requires `has_tool_access()`.

## Tables

| Table | One row per | Notes |
|---|---|---|
| `profiles` | account | `role`, `display_name`, optional `grade_level`, `baseline` |
| `student_tutors` | student–tutor pair | `active`; many tutors per student and many students per tutor |
| `skills` | academic skill | `parent_id` for sub-skills (Speed and velocity is under Physics) |
| `questions` | kind of question a game asks | id is `<game-id>:<kind>`, e.g. `trail-builder:grade` |
| `question_skills` | question–skill tag | a question can carry several skills |
| `game_sessions` | time a student played a game | created by the first saved attempt |
| `question_attempts` | submitted answer | never edited or deleted; holds the snapshot of the question |
| `review_items` | missed question per student | status: `needs_review`, `in_progress`, `corrected`, `mastered` |
| `review_events` | review status change | who, when, why |

Deleting an account in Supabase deletes all of its rows in these tables.
Revoking keeps them.

## Adding tracking to a game

The game must be served from this site (same origin as the login): its
page is `learning-lab/<tool-id>/index.html`, and its `url` in
`js/tools-config.js` is `https://www.mathletemtb.com/learning-lab/<tool-id>/`.
Trail Builder is the worked example. `node scripts/check-site.mjs` checks
the page exists, loads the scripts in order, and has its questions
registered.

**1. Register its questions** in `supabase/progress.sql` (add to the
file, then run it), one row per kind of question plus its skill tags:

```sql
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('trail-builder:grade', 'trail-builder', 'Trail grade from rise and run', 'numeric', 'intermediate')
on conflict (id) do update set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('trail-builder:grade', 'geometry'),
  ('trail-builder:grade', 'ratios-proportions')
on conflict do nothing;
```

`game_id` is the tool's id in `js/tools-config.js`. An attempt for a
question that isn't registered is rejected (the game is unaffected).

**2. Load the scripts** in the game's page, in this order (paths
relative to the page):

```html
<script src="../../js/supabase-config.js"></script>
<script src="../../js/auth.js"></script>
<script src="../../js/progress.js"></script>
```

A private tool (loaded by `tool.html` into an iframe) doesn't load them
itself; it uses the player page's copy: `var MP = window.parent.MathleteProgress;`
(Summit Expedition is the example). After changing a private tool, upload
it again with `node scripts/admin.mjs upload ...`. If several people take
turns on one screen, record only the one the account belongs to, and let
them say which player that is.

**3. Call it where the game checks an answer:**

```js
var session = MathleteProgress.startSession();   // once, when play starts

MathleteProgress.recordQuestionAttempt({
  gameId: 'trail-builder',
  questionId: 'trail-builder:grade',
  questionSnapshot: {                // exactly what the student saw
    prompt: q.prompt, unit: q.unit, answer: q.answer, tolerance: q.tol,
    explanation: q.ref, hint: q.hint
  },
  studentAnswer: raw,
  correctAnswer: q.answer,
  isCorrect: ok,
  hintsUsed: hintsShown,
  timeToAnswer: seconds,             // leave out if not measured reliably
  gameSessionId: session
});
```

It returns at once and never throws, so the game needs no error
handling around it. Don't `await` it before showing feedback.

Rules for the snapshot:

- Include everything needed to show the question again: prompt, numbers,
  answer choices, correct answer, explanation.
- Send **the same snapshot for every try at the same question.** It is
  how retries are matched up. Don't include things that change between
  tries (try counts, feedback text, timestamps). Build it from the
  question's fixed fields rather than passing the game's whole object.
- For a fixed challenge with a natural id, pass `questionKey:
  'challenge-3'` and retries are matched on that instead.
- Under 20 KB.

The game does **not** send who the student is, the attempt number, or
skill tags. The server works those out.

Optional: `MathleteProgress.endSession(session, { metrics: { score: 8 } })`
at a natural finish.

Worksheets (a grid of answers checked together, as in Gear Ratio Lab and
Strava Showdown): record each cell as its own question, and only when it
is checked with a value it hasn't been checked with before, so pressing
Check twice doesn't double-count. If the game has an answer key, send
`hintsUsed: 1` for cells checked after it was opened.

**4. Test:** play signed out (nothing breaks, the "log in to save" note
appears once), then signed in, and check the rows with
`node scripts/admin.mjs` or the Supabase table view.

## Updating the MTB Physics Playground

The Playground is a React app in its own repository. Its tracking code is
`src/progress.tsx` there; it reports to `window.MathleteProgress` when the
app runs on this site and does nothing anywhere else. To publish a new
version:

1. In the Playground folder: `npm run build`
2. In this folder: `node scripts/import-playground.mjs /path/to/mtb-physics/dist`
3. `node scripts/check-site.mjs`, then commit and push this site.

The import replaces `learning-lab/physics-playground/` and adds the three
site scripts to its `index.html`. Don't edit that folder by hand. If you
add a new kind of question to `src/progress.tsx`, register it in
`supabase/progress.sql` and add it to the list in `scripts/check-site.mjs`.

## What happens to an attempt

1. `js/progress.js` gives it an id and puts it on a waiting list in the
   browser, labelled with the signed-in student.
2. It is sent to `record_attempt()`. If the connection is down it stays
   on the list and is retried (5 s, doubling up to 5 min, and whenever
   the tab or connection comes back), for up to 14 days.
3. The server saves it once, however many times it arrives.
4. Attempts waiting from one student are never sent under another
   student's login on a shared computer.

## Review queue rules

- A wrong answer creates the student's review item for that exact
  question, or adds to it. One item per question, however many misses.
- A right answer marks it **corrected** only when it comes from the
  review page, or from a later game session than the last miss. (Games
  reveal the answer after two tries; typing it in doesn't count.)
- Missing a corrected question again reopens it.
- Nothing becomes **mastered** automatically.
- Every change is logged in `review_events`.

## The student pages

| Page | Shows | Reads |
|---|---|---|
| `dashboard.html` | This week, next steps, skills, recent sessions | `student_dashboard()` |
| `my-progress.html` | Skills in detail; every answer, 25 at a time | `student_dashboard()`, `question_attempts` |
| `review.html` | Saved missed questions; try one again | `review_items`, `question_attempts`, `start_review()`, `record_review_attempt()` |
| `goals.html` | Goals with measured progress; set a goal | `student_goals()`, `save_goal()`, `set_goal_status()` |

Shared code is `js/student.js`; the look is `css/student.css`. Text from
the database is always put on the page as plain text, never as HTML
(`check-site.mjs` checks this).

### How the numbers are worked out

- **A question counts once per play session.** The view
  `question_first_tries` keeps the first try at each question in each
  session. "Questions attempted" counts those rows, so retries never
  inflate it, and a fixed question met again in a later session is a
  fresh first try. Tries made on the review page are left out.
- **First-try accuracy** = first tries that were right ÷ first tries.
  **Right in the end** = questions answered correctly at some point in
  that session.
- **This week** starts Monday 00:00 in the `timezone` setting.
- **Practice time** adds up only the gaps between one answer and the
  next in the same session, and only gaps up to `active_gap_minutes`.
  Leaving a tab open adds nothing; a single answer adds nothing.
- **Skill status** looks at the last `skill_window_days`. Fewer than
  `min_sample` first tries shows "Not enough data" and no percentage.
  Otherwise `strong_at` or more is Strong, `developing_at` or more is
  Developing, below that Needs practice. A question tagged with two
  skills counts once in each. The pages say these are practice
  indicators, not grades.
- **Next steps** are fixed rules, in this order, at most four: saved
  mistakes waiting; the weakest skill that needs practice; a skill not
  practiced for `stale_days`; a strong skill to push further; and, if
  nothing has been done this week, "play a round". Each links straight
  to the review page or a game.

### Changing a threshold

Edit the row in `progress_settings` (Supabase → Table Editor). It takes
effect at once and re-running `progress.sql` won't overwrite it.

| key | default | meaning |
|---|---|---|
| `timezone` | America/Denver | where the week starts |
| `skill_window_days` | 30 | how far back skills look (and the comparison period before) |
| `min_sample` | 5 | first tries needed before a skill gets a percentage |
| `strong_at` / `developing_at` | 0.8 / 0.6 | status cut-offs |
| `active_gap_minutes` | 10 | longest gap that counts as practice time |
| `stale_days` | 14 | when a skill is suggested as a refresher |

### Review My Mistakes

- Opening a saved question marks it **In progress**.
- The page can re-ask questions that are a number, multiple choice, or
  Summit Expedition's typed math (it loads math.js and MathJax only
  then, and checks answers the way the game does). Missions that only
  make sense in the simulator link back to the game.
- A wrong try gives the question's hint; a second wrong try shows the
  answer and working and locks that question until the page is reloaded,
  so the answer can't simply be typed back in.
- The browser sends only the review item, the answer and right/wrong.
  `record_review_attempt()` takes the question from the student's own
  original attempt on the server, so a review try always counts toward
  the right question. A right one marks it **Corrected**.
- Order "Most important first": tutor-flagged, missed more than once, in
  a skill that needs practice, never retried, missed in the last week.

### Goals

| Kind | Counts, since the goal was set |
|---|---|
| `sessions` | practice sessions with at least one answer |
| `questions` | questions attempted (first tries; retries and review tries don't count) |
| `corrections` | missed questions that became Corrected |
| `skill` | questions attempted in one skill |
| `game` | rounds of one game finished |
| `custom` | nothing: it is a goal in words, marked done by hand |

- Measured goals complete themselves when the target is reached (the
  next time anyone looks at the goals). Nothing that happened before the
  goal was set counts, and nothing after it is done changes it.
- A student can set, remove and (for goals in words) finish **their own**
  goals. A goal set by a tutor can only be changed by a tutor; the
  student sees who set it. At most 12 active goals per student.
- A goal past its date is flagged "Past due"; it still counts progress.
- Until the tutor dashboard exists, set a goal for a student from the
  terminal:

  | Task | Command |
  |---|---|
  | Three practice sessions by Sunday | `node scripts/admin.mjs goal student@example.com sessions 3` |
  | Correct five mistakes by a date | `node scripts/admin.mjs goal student@example.com corrections 5 2026-11-22` |
  | A goal in words | `node scripts/admin.mjs goal student@example.com custom Explain slope out loud` |
  | See a student's goals | `node scripts/admin.mjs goals student@example.com` |

  Skill and game goals, and marking a goal in words done, come with the
  tutor dashboard (for now: the `student_goals` table in Supabase).

## Adding or changing skills

Add a row to the `insert into public.skills` list in
`supabase/progress.sql` and run the file. Tag questions with it in
`question_skills`. Rename a skill by changing its `name`; keep its `id`.
Dashboards read this list, so nothing else needs editing.

## Limits to know about

- Games grade answers in the browser, so a student could save made-up
  attempts to their own account. They can never write to another
  account, or edit or delete anything already saved.
- More than 90 attempts a minute from one account are refused until the
  minute passes (the script retries them).
- Time on the student's device is used for when an attempt happened,
  limited to between 14 days ago and now.
