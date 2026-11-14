# MTB Coaching

> **Hidden for now (2026-11-12).** Everything below is built and tested but
> switched off: nothing links to the Riding pages, and `js/coaching.js` sends
> anyone who opens one to the dashboard. `supabase/coaching.sql` has not been
> run. To switch it on:
> 1. Run `supabase/coaching.sql` in the Supabase SQL Editor, then `node scripts/test-coaching.mjs`.
> 2. In `js/coaching.js`, set `COACHING_ENABLED = true`.
> 3. Add the nav link after "My Dashboard" on every page (and in `scripts/build-lab.mjs`):
>    `<li data-auth-show="member" hidden><a href="coaching.html">My Riding</a></li>`,
>    and consider renaming "My Dashboard" to "My Learning" and the academic "My Goals" to "Practice Goals".

How the riding side of Mathlete works: what riders see, who can see what,
and how to run it. The product spec is
[athletics_and_coachingPRD.md](athletics_and_coachingPRD.md); this is the
first slice of it.

## Two products, one account

Mathlete has two separate areas for signed-in students:

| | Learning (academics) | Riding (MTB Coaching) |
|---|---|---|
| Nav link | My Learning | My Riding |
| Pages | dashboard, my-progress, review, goals (Practice Goals) | coaching (Coaching Dashboard), riding-goals (My Goals), training (My Training) |
| Database file | `supabase/progress.sql` | `supabase/coaching.sql` |
| Adults | tutors (`assign`) | coaches (`coach-assign`) |

They share the account, the members row and the profile (name and role).
Nothing else crosses over:

- A tutor sees no riding records, and a coach sees no academic ones. To
  give someone both, assign them both ways.
- Riding progress is never turned into an academic score, or the other
  way round, and there is no combined score.
- The Learning pages call only academic database functions and the
  Riding pages only coaching ones; `scripts/check-site.mjs` checks this.

## What riders get (this release)

- **Coaching Dashboard**: this week's rides and time on the bike, what's
  next on the plan, their nearest goals, recent rides and their coaches
  (with specialties).
- **My Goals**: goals from a big long-term dream down to this week
  (big goal, next 3 months, this month, this week). Each goal can have a
  riding area, a target date, why it matters, a starting point, what it
  looks like when they get there, and a list of steps to tick. A smaller
  goal can be "part of" a bigger one. Goals are never marked achieved
  automatically; the rider (or coach) decides.
- **My Training**: the plan (things to practise, each for so many
  sessions, optionally for a goal) and the ride log. A log entry has the
  day, kind of riding, place, minutes, areas worked on and four short
  prompts: what did you practise, one thing you improved, what challenged
  you, what to try next time. Logging an entry against a plan item
  counts toward it; reaching the number of sessions ticks it off.

Not in this release: video uploads, coach feedback on entries, check-ins,
coaching sessions, the skill library and progression statuses, rider
profile, and a coach-facing page. Coaches are set up and can add to
plans with the admin script (below); the coach page comes with the tutor
dashboard work.

## Who can do what

Decided by the database (`supabase/coaching.sql`), not the browser:

| | Rider (own records) | Their coach | Other coaches, tutors, other riders | Admin |
|---|---|---|---|---|
| See goals, plan, log | yes | yes | no | yes |
| Set and change goals and steps | yes | yes | no | yes |
| Add to the plan | yes | yes | no | yes |
| Change or remove a plan item | only ones they added | yes | no | yes |
| Tick off or skip a plan item | yes | yes | no | yes |
| Write the ride log | yes | no (read only) | no | no |

Unassigning a coach or revoking an account cuts access at once. Nobody
writes the tables directly; everything goes through the functions.

## Running it

**Switch it on (once, and after any change to the file):** in Supabase,
SQL Editor, paste all of `supabase/coaching.sql` and Run. It needs
`setup.sql` and `progress.sql` to have been run first. Then in the
terminal:

```
nvm use 20
node scripts/test-coaching.mjs
```

That uses throwaway accounts and deletes them afterwards.

**People** (terminal, from the site folder):

```
node scripts/admin.mjs invite sam@example.com          # a new coach gets an account like anyone else
node scripts/admin.mjs role sam@example.com coach      # coach-only account (a tutor who also coaches keeps "tutor")
node scripts/admin.mjs name sam@example.com Sam
node scripts/admin.mjs coach sam@example.com jumping tricks
node scripts/admin.mjs coach-assign rider@example.com sam@example.com
node scripts/admin.mjs coaches                         # every coach, specialties, riders
node scripts/admin.mjs ride-plan rider@example.com 2 Two airbag sessions: 360 rotations
node scripts/admin.mjs coach-unassign rider@example.com sam@example.com
node scripts/admin.mjs coach sam@example.com off
```

Specialties are riding areas: `fundamentals cornering technical jumping
tricks downhill racing fitness mindset`. The same list tags goals, plan
items and log entries. To add an area, insert a row in `riding_areas`
(id, name, sort_order); nothing else changes.

Every student account can use the Riding pages, with or without a coach.
A tutor, coach or admin account opening them is told they're for rider
accounts.

## Tables

| Table | One row per |
|---|---|
| `riding_areas` | riding area (seeded; editable) |
| `coaches` | coach: specialties, short bio, active |
| `athlete_coaches` | coach-to-rider link (active / not) |
| `athlete_goals` | goal: horizon, area, title, why, starting point, outcome, target date, parent goal, status (active / paused / achieved / archived), who set it |
| `athlete_goal_steps` | step toward a goal, ticked or not |
| `training_items` | plan item: what, details, sessions target, due date, goal, area, status (planned / done / skipped / archived), who set it |
| `training_logs` | ride / practice log entry |

Functions the pages use: `coaching_home` (everything a page shows, in one
call), `coaching_logs` (older log entries, 25 at a time),
`save_athlete_goal`, `set_athlete_goal_status`, `save_goal_step`,
`set_goal_step`, `save_training_item`, `set_training_item_status`,
`save_training_log`, `delete_training_log`. Each one checks who is asking
through `coaching_access()`.

## Safeguards for minors

- Only a first name is stored; the log asks for a place in free text,
  never GPS or anything automatic.
- There is no messaging. Coaches add to plans and goals; written coach
  feedback comes later as notes attached to records, not chat.
- No photos or video yet. When video arrives it needs a private storage
  bucket, guardian consent and access limited to the rider and their
  assigned coach.
- Before riders follow coach progressions for risky skills (drops,
  rotations), the riding curriculum in `riding/` needs review by a
  qualified coach, and you'll want waivers and guardian consent in place.
