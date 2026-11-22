# Rewards: Trail XP, streaks, levels, badges and the Trail Garage

Built from [PRDs/studentRewardsSystem.md](../PRDs/studentRewardsSystem.md).

## How it works

- **No tool had to change.** Every learning tool already saves answers with
  `record_attempt()` and finished sessions with `end_game_session()`
  (`supabase/progress.sql`). Triggers on those tables pass each real event to
  one function, `reward_award()` in `supabase/rewards.sql`, which decides the
  XP, writes the ledger (one row per student per event key, so repeats never
  pay twice), and updates the day, streak, level, badges and Garage, in the
  same transaction as the answer. A failure in rewards never blocks saving
  an answer.
- **The browser never sends XP.** It can only read its own rewards and choose a
  daily goal, its timezone and what to wear (`rewards_summary`, `rewards_feed`,
  `set_daily_goal`, `equip_reward`). Tables are read-only to the browser.
- **Celebrations:** after any save, `js/progress.js` loads `js/rewards-live.js`,
  which asks `rewards_feed()` what was just earned and shows a small
  non-blocking card (+XP with today’s progress, goal reached, level up, badge,
  Trail Shield). Wrong answers never show anything negative.
- **Pages:** `rewards.html` (new **Rewards** tab: rider card, streak and goal,
  week and month calendars, levels, XP history, badges, Trail Garage, learning
  stats) and a strip at the top of the dashboard.

## What earns XP (all in the `reward_config` table)

| Event | XP | Rule |
|---|---:|---|
| First correct answer to a problem | 5 / 7 / 10 | By the question’s difficulty (beginner / standard / advanced). Once per exact question (template + numbers); a new variant is a new problem. Capped at 250 problem XP a day. |
| Lab completed | 10 | Once per lab. Per-lab rule in `reward_activities` (a finished session with at least N answers, or N missions solved for Jump Lab). |
| Lesson completed | 20 | Once per lesson. Needs the lesson’s finished event **and** at least 12 different questions attempted. |
| Assessment completed | 5 | Once each, when every question in it has been attempted (`reward_assessments`: Slope Lab transfer challenge, the two physics knowledge checks). |
| Daily goal reached | +5 | Once a day; adds to lifetime XP, not to the goal. |

Daily goals: Casual 10, Regular 20 (default), Big 30. Changes apply from the
next day, once every 7 days. Local calendar days in the student’s timezone
(from their browser; America/Denver until then). Trail Shields: 1 to start,
max 2, +1 every 7-day streak; used automatically when exactly one day was
missed. Levels (`reward_levels`), badges (`reward_achievements`) and Garage
items (`reward_items`) are tables too.

Schools: a row in `reward_org_settings` can switch rewards off, set the
default goal or lock it (set in the SQL editor for now).

## Setting it up

Supabase SQL Editor, in order (each is safe to re-run):
`progress.sql` → `resources.sql` → `curriculum.sql` (now records each skill’s
unit) → `catalog.sql` → `teacher-curriculum.sql` → **`rewards.sql`**.
The first run of `rewards.sql` replays existing history quietly, so students
start with the XP, days and badges they’ve already earned. Then deploy.

## Changing the numbers

Edit the rows (Table Editor or SQL), e.g. `update public.reward_config set value = '8'
where key = 'xp_standard';`. Changes apply to new events; past awards stand.
Add a lab to rewards: a row in `reward_activities`. Add an assessment: a row
in `reward_assessments`.

## Limits worth knowing

- Correctness comes from the tools (they check answers in the browser), so
  the server can’t re-mark an answer. It does enforce first-solve-only, real
  question kinds, the rate limit (90 answers a minute), the daily problem-XP
  cap and the completion rules.
- Events are dated when the server receives them; answers saved offline and
  sent later count on the day they arrive.
- No class leaderboards (by design). Teacher views are future work; the data
  (ledger, days) is per student and organization, ready for it.

## Tests

```
node scripts/test-rewards.mjs   # PGlite: XP rules, streaks, shields, timezones, caps, security, history replay (55)
node scripts/check-site.mjs     # rewards locked down, hooked in, safe DOM, reduced motion
```
