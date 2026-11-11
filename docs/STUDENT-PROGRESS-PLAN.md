# Student Progress & Tutoring: assessment and plan

Phase 0 deliverable for `docs/StudentProgressPRD.md`. Audit date:
2026-11-10, against `main` at `4b452a5`. How the finished parts work is
in `docs/PROGRESS-TRACKING.md`; this file is the plan and the log.

## Progress

- **2026-11-10, Phase 1a live.** Database schema, roles, tutor–student
  links, the skill list, `record_attempt()`, the review queue, the
  browser tracking script (`js/progress.js`), admin commands and a live
  permission test. `supabase/progress.sql` has been run on the real
  project and `node scripts/test-progress.mjs` passes 39/39.
- **2026-11-10, Phase 1b built (not yet deployed).** Trail Builder now
  lives at `learning-lab/trail-builder/` and reports every checked answer
  (18 question kinds, registered in `supabase/progress.sql`). The site
  links to the new address. Checked in a simulated browser: all 18 kinds
  reachable and registered, misses/hints/sessions recorded correctly,
  and the game plays through with the tracking script missing.
  **To finish:** re-run `supabase/progress.sql` (adds the questions),
  deploy, play one round signed in and confirm the rows appear, then
  replace the old `wcmalfeld.github.io/TrailBuilder_Math/` copy with a
  redirect page.
- **2026-11-10, Phase 1c part 1 built (not yet deployed).** Gear Ratio
  Lab (`learning-lab/gear-ratio-lab/`, 13 question kinds) and Strava
  Showdown (`learning-lab/strava-showdown/`, 12 kinds) moved in and
  tracked the same way. Besides the one course problem per round, every
  worksheet cell is recorded as its own question (only when checked with
  a new value; flagged if the answer key had been opened), and Gear Ratio
  Lab's tune-up prediction counts as correct within 5%. Strava
  Showdown's podium picks and graph are not recorded. Same finishing
  steps as Trail Builder; the old copies are
  `wcmalfeld.github.io/GearRatioLab_LearningTool/` and
  `.../StravaShowdown_LearningTool/`.
- **2026-11-10, Phase 1c part 2 built (not yet deployed).**
  - *Summit Expedition* (27 question kinds, one per skill). `tool.html`
    now loads `js/progress.js` and the tool uses the player page's copy.
    Up to four people share the screen, so the setup screen has a "Save
    progress for" choice (default: the first climber; "Nobody" is an
    option) and only that climber's answers are recorded. Tutor "Mark
    correct" after a miss adds a correct attempt labelled as such. The
    changed file is `private-tools/summit-expedition/index.html`
    (git-ignored); it goes live with
    `node scripts/admin.mjs upload private-tools/summit-expedition/index.html summit-expedition/index.html`.
  - *Jump Lab* (`learning-lab/jump-lab/`, 10 kinds): each mission is one
    question and every "Send it" an attempt; the multiple-choice
    prediction before a mission and the Explore "Predict, then test"
    questions are recorded too. The site copy is the built
    `dist/jump-lab.html` with tracking added by hand, so the `src/` in
    the old JumpLab_MTB folder no longer matches it.
- **2026-11-10, MTB Physics Playground built (not yet deployed).**
  Decision: it keeps its own repository (`wcmalfeld/mtb-physics`, a React
  app) and its build is copied into `learning-lab/physics-playground/`
  with `node scripts/import-playground.mjs <path-to-dist>`. Tracking lives
  in that repo as `src/progress.tsx` plus one line in `src/App.tsx` (not
  yet committed there). 10 question kinds: launch predictions, the two
  in-challenge questions, and the "Try it without the simulation" checks.
  The Send It and Race labs' predictions and all written explanations are
  not recorded. The build in this repo was made from that repo's last
  commit plus the tracking, without its uncommitted work in progress.
- **2026-11-10, end-to-end check passed.** In real Chrome, signed in as a
  throwaway student against the real project: Trail Builder, Gear Ratio
  Lab, Strava Showdown and Jump Lab answers arrive in the database with
  the right student, attempt numbers, hints, review item and session;
  nothing is saved after logging out. (Physics Playground was skipped:
  its questions weren't on the server yet. Summit Expedition can't be
  tested this way until the new file is uploaded.)
- **2026-11-11, Phase 2 part 1 built (not yet deployed).** The student's
  own pages: `dashboard.html` (this week, next steps, skills, recent
  activity), `my-progress.html` (skills in detail, every answer, a page
  at a time) and `review.html` (Review My Mistakes, with a retry on the
  page). After logging in, students land on the dashboard; "My Dashboard"
  is in the main nav for signed-in members. New in the database:
  `progress_settings`, the `question_first_tries` view,
  `student_dashboard()`, `start_review()`, `record_review_attempt()` and
  a `question_key` column. Details in `docs/PROGRESS-TRACKING.md`.
  Checked locally: 31 database checks and 44 checks of the three pages
  in real Chrome with a made-up student. **To switch on:** re-run
  `supabase/progress.sql`, run `node scripts/test-progress.mjs`, deploy.
  - *First-try accuracy* is the first try at a question within a play
    session (the Phase 2 note above), from the view.
  - *Retry on the review page* works for number, multiple-choice and
    Summit Expedition's typed-math questions. Jump Lab missions (and the
    Gear Ratio Lab tune-up prediction) link back to the game.
  - *Not built yet:* student goals; "practice a similar question" is a
    link to the game, not a generated twin.
- **Next: Phase 2 part 2.** Student goals (table, progress from real
  activity, a My Goals page; tutors create them in Phase 3, the admin
  script until then).
- **Open: playing on the tutor's computer.** Attempts go to whoever is
  logged in. A student playing on a tutor's login is recorded as the
  tutor. Recording on behalf of an assigned student belongs with the
  tutor tools in Phase 3.

### Note for Phase 2 (statistics)

`attempt_number` counts every try a student has ever made at one exact
question. Some Trail Builder questions are fixed (the Algebra II jump
questions never change their numbers), so a student meets them again in
later rounds as attempt 3, 4, ... "First-attempt accuracy" on the
dashboards should therefore mean the first try at a question **within a
play session**, worked out from `game_session_id`, not `attempt_number = 1`.

## Decisions (2026-11-10)

| # | Decision |
|---|---|
| 1 | **Accounts stay invite-only.** "Register" means accepting an invite and choosing a password. No open sign-up for minors. |
| 2 | **Built for multiple tutors from the start.** A tutor sees only students actively assigned to them; an admin sees every student. |
| 3 | **Games move into this repo** under `/learning-lab/<id>/` so they share the site's login. Students lose progress saved in their browser by the old github.io copies, once. |
| 4 | **Account, role and assignment management stays in `scripts/admin.mjs`** for now; no admin screens. |

## What exists today

| Area | State |
|---|---|
| Site | Hand-written static HTML + vanilla JS on GitHub Pages. No framework, no build step, no server. |
| Backend | Supabase: Auth (invite-only) and Postgres with row-level security. Before this work: `members` and `inquiries` only. No roles, no progress data. |
| Auth in the browser | `js/auth.js` (`window.MathleteAuth`): session in localStorage on `www.mathletemtb.com`. |
| Games | Five public games on `wcmalfeld.github.io` (a different origin, so they can't see the login). Summit Expedition is private, loaded by `tool.html` into a same-origin `srcdoc` iframe. |
| How games ask questions | Trail Builder (`makeQuestion`/`checkAnswer`), Gear Ratio Lab and Strava Showdown (`makeTask`/`checkTask`): one generated question object (prompt, answer, tolerance, unit, hint, reference) and one check function each. Summit Expedition: generated questions with LaTeX, numeric and multiple choice. Jump Lab and Physics Playground: predict-then-test challenges, not question/answer (not yet read in detail). |
| Progress today | Each game saves to its own localStorage. Nothing is shared or tied to an account. |
| Design system | Light "field notes" theme (`css/site.css`) for parent-facing pages, dark Lab theme (`css/lab.css`) for the Lab and tools. |
| Tests | `scripts/check-site.mjs` (offline), `scripts/test-access.mjs` (live access checks). |

## Architecture

There is no server to add, so "backend" means Postgres: tables with
row-level security, and functions for anything that must not be trusted
to the browser.

- **Identity.** `profiles` (role + first name) beside the existing
  `members` (access on/off). `student_tutors` links students to tutors,
  many-to-many. Every policy also requires `has_tool_access()`, so
  revoking an account cuts off its progress data too.
- **Writing.** Browsers have no insert/update/delete on any progress
  table. The only way in is `record_attempt()`, which takes the student
  from the session, dedupes on a browser-made attempt id, counts the
  attempt number itself, and updates the review queue in the same
  transaction.
- **Question identity.** `questions` holds one row per *kind* of question
  (`trail-builder:grade`), tagged with skills in `question_skills`. Each
  attempt stores a snapshot of the exact question shown. Retries of the
  same generated question line up by a hash of that snapshot.
- **Skills come from the server**, by joining through `question_skills`,
  not from what the game sends. Retagging a question fixes its history.
- **Tracking script.** `js/progress.js`: one call per answer, queued in
  localStorage and retried, silent for anonymous players apart from a
  one-time "log in to save your progress" note.
- **Dashboards (Phases 2–3).** Static pages reading SQL views. Stats are
  computed in SQL; thresholds live in one settings table. Reporting
  weeks use one fixed timezone (America/Denver).

### Where this differs from the PRD's illustration

| PRD example | Here | Why |
|---|---|---|
| `studentId` passed by the game | Not accepted; the server uses the session | "Must not associate an attempt with the wrong student" |
| `attemptNumber` passed by the game | Counted on the server | Can't be wrong or forged, survives reloads |
| `skillIds` passed by the game | Looked up from the question's tags | One taxonomy, retaggable, nothing hardcoded in games |
| Admin screens | Command-line commands | Matches how members are managed today |

## Phases

| Phase | Scope | State |
|---|---|---|
| 0 | Audit and this plan | Done |
| 1a | Schema, roles, `record_attempt`, `js/progress.js`, admin commands, permission tests | Done |
| 1b | Trail Builder moved in-repo and tracked (proof of concept); redirect page on the old address | Built; needs SQL re-run, deploy, redirect |
| 1c | Gear Ratio Lab, Strava Showdown, Summit Expedition, then Jump Lab and Physics Playground | All built; needs SQL re-run, deploy, Summit upload |
| 2 | Student dashboard, weekly stats, skill performance, Review My Mistakes, goals, basic recommendations | Built except goals; needs SQL re-run and deploy |
| 3 | Tutor dashboard: student list, profiles, review management, notes, session records | |
| 4 | Session briefs, assignment builder, student assignments, reflections | |
| 5 | Mastery refinements, parent reports, parent accounts | |

Later phases add their own tables (goals, assignments, tutor notes,
tutoring sessions, reflections, parent links) in the same file style.

## Risks and limits

- **Answers are graded in the browser.** A determined student could save
  fake attempts to their own account (never to anyone else's). Fine for
  tutoring; not for anything high-stakes.
- **"Practice similar questions"** needs each game to open on a given
  question kind (`?practice=<kind>`). Review v1 re-asks the saved
  original; similar-question practice follows per game.
- **Moving games** changes their origin: browser-saved progress from the
  old copies is lost once.
- **Jump Lab missions are solved by trial.** A mission missed and then
  landed in the same visit stays "needs review" until it is landed again
  in a later visit, like any other question. At most five such items.
- **Supabase plan.** Free projects pause after a week without activity
  and have no backups. Check before real student data lives there.
- **Minors' data.** Profiles hold a first name only; no student data in
  URLs or logs; private tutor notes (Phase 3) get an explicit visibility
  field and are never readable by students or parents by default.
