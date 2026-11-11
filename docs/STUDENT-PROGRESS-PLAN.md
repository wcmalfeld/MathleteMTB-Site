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
- **Next: Phase 1c.** Gear Ratio Lab and Strava Showdown the same way,
  then Summit Expedition, then the two prediction games.

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
| 1c | Gear Ratio Lab, Strava Showdown, Summit Expedition, then Jump Lab and Physics Playground | Next |
| 2 | Student dashboard, weekly stats, skill performance, Review My Mistakes, goals, basic recommendations | |
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
- **Jump Lab / Physics Playground** are prediction challenges. A
  challenge maps to a question and "prediction within tolerance" to
  correct; confirm the mapping when reading their code in 1c.
- **Supabase plan.** Free projects pause after a week without activity
  and have no backups. Check before real student data lives there.
- **Minors' data.** Profiles hold a first name only; no student data in
  URLs or logs; private tutor notes (Phase 3) get an explicit visibility
  field and are never readable by students or parents by default.
