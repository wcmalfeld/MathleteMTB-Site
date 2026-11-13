-- ============================================================
-- Mathlete MTB: student progress (run in Supabase -> SQL Editor,
-- AFTER supabase/setup.sql). Safe to re-run: every statement is
-- idempotent.
--
-- What this adds (Phase 1 of docs/STUDENT-PROGRESS-PLAN.md):
--   * profiles            - a name and a role (student / tutor / parent /
--                           admin) for each account.
--   * student_tutors      - which tutor works with which student.
--   * skills, questions,
--     question_skills     - the academic skill list, and one row per kind
--                           of question a game can ask, tagged with skills.
--   * game_sessions,
--     question_attempts   - what a student did. Attempts are never changed
--                           or deleted; every retry is a new row.
--   * review_items,
--     review_events       - the "Review My Mistakes" queue and the history
--                           of each item's status.
--   * record_attempt()    - the ONLY way an attempt gets saved. It takes
--                           the student from the signed-in session, never
--                           from what the browser sends.
--
-- Who can see what is decided HERE, on the server:
--   * a student reads only their own rows;
--   * a tutor reads only rows of students actively assigned to them;
--   * an admin reads every student's rows;
--   * nobody writes to these tables from the browser. Students save
--     attempts through record_attempt(); you manage accounts, roles and
--     assignments with scripts/admin.mjs (service role).
-- Everything also requires has_tool_access() (an active, unexpired
-- members row and a live session), so revoking an account cuts off its
-- progress data too.
-- ============================================================

-- 1. Profiles and roles ------------------------------------------
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'student'
                 check (role in ('student', 'tutor', 'parent', 'admin')),
  -- First name or nickname only; the email lives in auth.users.
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  grade_level  text check (grade_level is null or char_length(grade_level) <= 20),
  baseline     text check (baseline is null or char_length(baseline) <= 200),
  created_at   timestamptz not null default now()
);

-- Everyone who already has access becomes a student. Fix names and roles
-- afterwards with `node scripts/admin.mjs name ...` / `role ...`.
insert into public.profiles (user_id, display_name)
select m.user_id, left(split_part(m.email, '@', 1), 60)
from public.members m
on conflict (user_id) do nothing;

create table if not exists public.student_tutors (
  student_id uuid not null references public.profiles (user_id) on delete cascade,
  tutor_id   uuid not null references public.profiles (user_id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (student_id, tutor_id),
  check (student_id <> tutor_id)
);
create index if not exists student_tutors_tutor_idx on public.student_tutors (tutor_id) where active;

-- A link must join a student to a tutor (or admin), whoever creates it.
create or replace function public.student_tutors_check_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = new.student_id and p.role = 'student') then
    raise exception 'student_id must be an account with the student role.';
  end if;
  if not exists (select 1 from public.profiles p where p.user_id = new.tutor_id and p.role in ('tutor', 'admin')) then
    raise exception 'tutor_id must be an account with the tutor (or admin) role.';
  end if;
  return new;
end;
$$;
revoke all on function public.student_tutors_check_roles() from public;

drop trigger if exists student_tutors_check_roles on public.student_tutors;
create trigger student_tutors_check_roles
  before insert or update on public.student_tutors
  for each row execute function public.student_tutors_check_roles();

-- 2. Who am I, and whose records may I see? -----------------------
-- These run with the owner's rights so they can read profiles and
-- student_tutors regardless of row-level security; each one is still
-- limited to the signed-in user and requires has_tool_access().

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.user_id = auth.uid() and public.has_tool_access();
$$;

-- Students the signed-in tutor is assigned to (every student, for an admin).
create or replace function public.my_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.user_id
  from public.profiles me
  join public.profiles s on s.role = 'student'
  where me.user_id = auth.uid()
    and public.has_tool_access()
    and (
      me.role = 'admin'
      or (me.role = 'tutor' and exists (
            select 1 from public.student_tutors st
            where st.tutor_id = me.user_id and st.student_id = s.user_id and st.active))
    );
$$;

-- Tutors actively assigned to the signed-in student.
create or replace function public.my_tutor_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select st.tutor_id
  from public.student_tutors st
  where st.student_id = auth.uid() and st.active and public.has_tool_access();
$$;

revoke all on function public.my_role() from public, anon;
revoke all on function public.my_student_ids() from public, anon;
revoke all on function public.my_tutor_ids() from public, anon;
grant execute on function public.my_role() to authenticated;
grant execute on function public.my_student_ids() to authenticated;
grant execute on function public.my_tutor_ids() to authenticated;

alter table public.profiles enable row level security;
alter table public.student_tutors enable row level security;

drop policy if exists "Own profile, my students, my tutors" on public.profiles;
create policy "Own profile, my students, my tutors"
  on public.profiles for select
  to authenticated
  using (
    (select public.has_tool_access())
    and (user_id = (select auth.uid())
         or user_id in (select public.my_student_ids())
         or user_id in (select public.my_tutor_ids()))
  );

drop policy if exists "Own tutor links" on public.student_tutors;
create policy "Own tutor links"
  on public.student_tutors for select
  to authenticated
  using (
    (select public.has_tool_access())
    and (student_id = (select auth.uid())
         or (tutor_id = (select auth.uid()) and student_id in (select public.my_student_ids()))
         or (select public.my_role()) = 'admin')
  );

revoke all on public.profiles from anon, authenticated;
revoke all on public.student_tutors from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.student_tutors to authenticated;

-- 3. Skills and questions -----------------------------------------
-- One shared skill list for every game. To add a skill, add a row here
-- (or in the dashboard) and tag questions with it; nothing else changes.
create table if not exists public.skills (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  parent_id   text references public.skills (id),
  description text,
  sort_order  integer not null default 100,
  active      boolean not null default true
);

insert into public.skills (id, name, parent_id, sort_order) values
  ('arithmetic',         'Arithmetic',               null,      10),
  ('fractions',          'Fractions',                null,      20),
  ('decimals',           'Decimals',                 null,      30),
  ('ratios-proportions', 'Ratios and proportions',   null,      40),
  ('percentages',        'Percentages',              null,      50),
  ('pre-algebra',        'Pre-algebra',              null,      60),
  ('algebra',            'Algebra',                  null,      70),
  ('geometry',           'Geometry',                 null,      80),
  ('trigonometry',       'Trigonometry',             null,      90),
  ('statistics',         'Statistics',               null,     100),
  ('calculus',           'Calculus',                 null,     110),
  ('physics',            'Physics',                  null,     120),
  ('speed-velocity',     'Speed and velocity',       'physics', 130),
  ('forces-motion',      'Forces and motion',        'physics', 140)
on conflict (id) do nothing;

-- One row per KIND of question a game asks ("question template"), e.g.
-- 'trail-builder:grade'. Games make up the numbers each time; the exact
-- question a student saw is saved with each attempt (snapshot).
create table if not exists public.questions (
  id            text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+([._-][a-z0-9]+)*$'),
  game_id       text not null check (game_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null check (char_length(title) between 1 and 120),
  question_type text not null default 'numeric'
                  check (question_type in ('numeric', 'choice', 'text', 'prediction', 'other')),
  difficulty    text check (difficulty is null or difficulty in ('beginner', 'intermediate', 'advanced')),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (id like game_id || ':%')
);
create index if not exists questions_game_idx on public.questions (game_id);

create table if not exists public.question_skills (
  question_id text not null references public.questions (id) on delete cascade,
  skill_id    text not null references public.skills (id),
  primary key (question_id, skill_id)
);
create index if not exists question_skills_skill_idx on public.question_skills (skill_id);

alter table public.skills enable row level security;
alter table public.questions enable row level security;
alter table public.question_skills enable row level security;

drop policy if exists "Signed-in users can read skills" on public.skills;
create policy "Signed-in users can read skills" on public.skills for select to authenticated using (true);
drop policy if exists "Signed-in users can read questions" on public.questions;
create policy "Signed-in users can read questions" on public.questions for select to authenticated using (true);
drop policy if exists "Signed-in users can read question skills" on public.question_skills;
create policy "Signed-in users can read question skills" on public.question_skills for select to authenticated using (true);

revoke all on public.skills, public.questions, public.question_skills from anon, authenticated;
grant select on public.skills, public.questions, public.question_skills to authenticated;

-- The questions each game asks. Adding a game = adding its rows here and
-- re-running this file (docs/PROGRESS-TRACKING.md). Re-running updates
-- titles, types and difficulty, and adds new skill tags; to REMOVE a tag,
-- delete the row from question_skills in the dashboard as well.

-- Trail Builder (learning-lab/trail-builder/): one question per segment
-- bought, chosen by the course the student picked.
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('trail-builder:alg1-linear-model',        'trail-builder', 'Elevation along a segment with y = mx + b',        'numeric', 'intermediate'),
  ('trail-builder:alg1-inequality',          'trail-builder', 'Budget inequality: how many more segments',        'numeric', 'intermediate'),
  ('trail-builder:geo-unit-conversion',      'trail-builder', 'Bridge boards: feet to inches',                    'numeric', 'intermediate'),
  ('trail-builder:geo-arc-length',           'trail-builder', 'Arc length of a berm turn',                        'numeric', 'intermediate'),
  ('trail-builder:geo-pythagorean',          'trail-builder', 'Distance along a slope (Pythagorean theorem)',     'numeric', 'intermediate'),
  ('trail-builder:alg2-quadratic-roots',     'trail-builder', 'Air time: solve a quadratic for landing',          'numeric', 'intermediate'),
  ('trail-builder:alg2-quadratic-vertex',    'trail-builder', 'Peak height: vertex of a parabola',                'numeric', 'intermediate'),
  ('trail-builder:alg2-exponential',         'trail-builder', 'Exponential growth and decay',                     'numeric', 'intermediate'),
  ('trail-builder:alg2-logarithms',          'trail-builder', 'Solve an exponential with logarithms',             'numeric', 'intermediate'),
  ('trail-builder:precalc-sine-eval',        'trail-builder', 'Evaluate a sine model',                            'numeric', 'advanced'),
  ('trail-builder:precalc-banking-angle',    'trail-builder', 'Banking angle of a berm (inverse tangent)',        'numeric', 'advanced'),
  ('trail-builder:precalc-slope-angle',      'trail-builder', 'Slope angle from rise and run',                    'numeric', 'advanced'),
  ('trail-builder:stats-expected-value',     'trail-builder', 'Expected value of the ride die',                   'numeric', 'advanced'),
  ('trail-builder:stats-independent-events', 'trail-builder', 'Probability of independent events',                'numeric', 'advanced'),
  ('trail-builder:calc-derivative-slope',    'trail-builder', 'Slope of the trail profile (derivative)',          'numeric', 'advanced'),
  ('trail-builder:calc-velocity',            'trail-builder', 'Speed from a position function',                   'numeric', 'advanced'),
  ('trail-builder:calc-optimization',        'trail-builder', 'Maximum height using the derivative',              'numeric', 'advanced'),
  ('trail-builder:calc-integral',            'trail-builder', 'Total from a rate (definite integral)',            'numeric', 'advanced')
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('trail-builder:alg1-linear-model',        'algebra'),
  ('trail-builder:alg1-inequality',          'algebra'),
  ('trail-builder:geo-unit-conversion',      'ratios-proportions'),
  ('trail-builder:geo-arc-length',           'geometry'),
  ('trail-builder:geo-pythagorean',          'geometry'),
  ('trail-builder:alg2-quadratic-roots',     'algebra'),
  ('trail-builder:alg2-quadratic-vertex',    'algebra'),
  ('trail-builder:alg2-exponential',         'algebra'),
  ('trail-builder:alg2-exponential',         'percentages'),
  ('trail-builder:alg2-logarithms',          'algebra'),
  ('trail-builder:precalc-sine-eval',        'trigonometry'),
  ('trail-builder:precalc-banking-angle',    'trigonometry'),
  ('trail-builder:precalc-banking-angle',    'forces-motion'),
  ('trail-builder:precalc-slope-angle',      'trigonometry'),
  ('trail-builder:precalc-slope-angle',      'geometry'),
  ('trail-builder:stats-expected-value',     'statistics'),
  ('trail-builder:stats-independent-events', 'statistics'),
  ('trail-builder:calc-derivative-slope',    'calculus'),
  ('trail-builder:calc-velocity',            'calculus'),
  ('trail-builder:calc-velocity',            'speed-velocity'),
  ('trail-builder:calc-optimization',        'calculus'),
  ('trail-builder:calc-integral',            'calculus')
on conflict do nothing;

-- Gear Ratio Lab (learning-lab/gear-ratio-lab/): one course problem per
-- round, every cell of the lab sheet, and the tune-up time prediction.
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('gear-ratio-lab:alg1-inequality',         'gear-ratio-lab', 'Smallest cog that stays under the push limit',     'numeric',    'intermediate'),
  ('gear-ratio-lab:geo-circumference',       'gear-ratio-lab', 'Wheel circumference difference',                   'numeric',    'intermediate'),
  ('gear-ratio-lab:geo-gear-inches',         'gear-ratio-lab', 'Gear inches of a gear',                            'numeric',    'intermediate'),
  ('gear-ratio-lab:alg2-constraints',        'gear-ratio-lab', 'Largest chainring within every push limit',        'numeric',    'intermediate'),
  ('gear-ratio-lab:precalc-angular-speed',   'gear-ratio-lab', 'Wheel angular speed in radians per second',        'numeric',    'advanced'),
  ('gear-ratio-lab:stats-mean-percent-step', 'gear-ratio-lab', 'Mean percent jump across the cassette',            'numeric',    'advanced'),
  ('gear-ratio-lab:stats-percent-change',    'gear-ratio-lab', 'Percent change between two cogs',                  'numeric',    'advanced'),
  ('gear-ratio-lab:calc-related-rates',      'gear-ratio-lab', 'Acceleration from a changing cadence',             'numeric',    'advanced'),
  ('gear-ratio-lab:sheet-ratio',             'gear-ratio-lab', 'Lab sheet: gear ratio',                            'numeric',    'intermediate'),
  ('gear-ratio-lab:sheet-development',       'gear-ratio-lab', 'Lab sheet: distance per crank turn',               'numeric',    'intermediate'),
  ('gear-ratio-lab:sheet-speed',             'gear-ratio-lab', 'Lab sheet: speed from cadence and gear',           'numeric',    'intermediate'),
  ('gear-ratio-lab:sheet-time',              'gear-ratio-lab', 'Lab sheet: section time',                          'numeric',    'intermediate'),
  ('gear-ratio-lab:tune-prediction',         'gear-ratio-lab', 'Predict the race time after a tune-up',            'prediction', 'advanced')
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('gear-ratio-lab:alg1-inequality',         'algebra'),
  ('gear-ratio-lab:geo-circumference',       'geometry'),
  ('gear-ratio-lab:geo-gear-inches',         'geometry'),
  ('gear-ratio-lab:geo-gear-inches',         'ratios-proportions'),
  ('gear-ratio-lab:alg2-constraints',        'algebra'),
  ('gear-ratio-lab:precalc-angular-speed',   'trigonometry'),
  ('gear-ratio-lab:precalc-angular-speed',   'speed-velocity'),
  ('gear-ratio-lab:stats-mean-percent-step', 'statistics'),
  ('gear-ratio-lab:stats-mean-percent-step', 'percentages'),
  ('gear-ratio-lab:stats-percent-change',    'percentages'),
  ('gear-ratio-lab:calc-related-rates',      'calculus'),
  ('gear-ratio-lab:sheet-ratio',             'ratios-proportions'),
  ('gear-ratio-lab:sheet-development',       'geometry'),
  ('gear-ratio-lab:sheet-development',       'ratios-proportions'),
  ('gear-ratio-lab:sheet-speed',             'speed-velocity'),
  ('gear-ratio-lab:sheet-speed',             'ratios-proportions'),
  ('gear-ratio-lab:sheet-time',              'speed-velocity'),
  ('gear-ratio-lab:tune-prediction',         'speed-velocity'),
  ('gear-ratio-lab:tune-prediction',         'ratios-proportions')
on conflict do nothing;

-- Strava Showdown (learning-lab/strava-showdown/): one course problem per
-- round and every cell of the stat sheet. The podium picks and the graph
-- are not recorded.
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('strava-showdown:alg1-catch-up',            'strava-showdown', 'Catch-up time from two speeds (d = rt)',         'numeric', 'intermediate'),
  ('strava-showdown:geo-distance',             'strava-showdown', 'Straight-line distance on the trail map',        'numeric', 'intermediate'),
  ('strava-showdown:alg2-mean-of-rates',       'strava-showdown', 'Mean of split speeds vs. true average speed',    'numeric', 'intermediate'),
  ('strava-showdown:precalc-rate-of-change',   'strava-showdown', 'Average rate of change of distance',             'numeric', 'advanced'),
  ('strava-showdown:stats-standard-deviation', 'strava-showdown', 'Standard deviation of split times',              'numeric', 'advanced'),
  ('strava-showdown:stats-z-score',            'strava-showdown', 'z-score of a rider''s average speed',            'numeric', 'advanced'),
  ('strava-showdown:calc-integral',            'strava-showdown', 'Distance from a speed function (integral)',      'numeric', 'advanced'),
  ('strava-showdown:calc-mean-value',          'strava-showdown', 'Mean Value Theorem: when was average speed hit', 'numeric', 'advanced'),
  ('strava-showdown:sheet-avg-speed',          'strava-showdown', 'Stat sheet: average speed',                      'numeric', 'intermediate'),
  ('strava-showdown:sheet-climb-rate',         'strava-showdown', 'Stat sheet: climb rate',                         'numeric', 'intermediate'),
  ('strava-showdown:sheet-split-range',        'strava-showdown', 'Stat sheet: split range',                        'numeric', 'intermediate'),
  ('strava-showdown:sheet-fastest-split',      'strava-showdown', 'Stat sheet: fastest split speed',                'numeric', 'intermediate')
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('strava-showdown:alg1-catch-up',            'algebra'),
  ('strava-showdown:alg1-catch-up',            'speed-velocity'),
  ('strava-showdown:geo-distance',             'geometry'),
  ('strava-showdown:alg2-mean-of-rates',       'algebra'),
  ('strava-showdown:alg2-mean-of-rates',       'speed-velocity'),
  ('strava-showdown:precalc-rate-of-change',   'algebra'),
  ('strava-showdown:precalc-rate-of-change',   'speed-velocity'),
  ('strava-showdown:stats-standard-deviation', 'statistics'),
  ('strava-showdown:stats-z-score',            'statistics'),
  ('strava-showdown:calc-integral',            'calculus'),
  ('strava-showdown:calc-mean-value',          'calculus'),
  ('strava-showdown:sheet-avg-speed',          'speed-velocity'),
  ('strava-showdown:sheet-avg-speed',          'ratios-proportions'),
  ('strava-showdown:sheet-climb-rate',         'ratios-proportions'),
  ('strava-showdown:sheet-split-range',        'statistics'),
  ('strava-showdown:sheet-fastest-split',      'speed-velocity'),
  ('strava-showdown:sheet-fastest-split',      'ratios-proportions')
on conflict do nothing;

-- Summit Expedition (members-only, runs inside tool.html): one question
-- kind per skill; the level (1-3) the student chose is in each attempt's
-- snapshot, so no difficulty is set here. Only the climber picked under
-- "Save progress for" is recorded.
insert into public.questions (id, game_id, title, question_type) values
  ('summit-expedition:lin',             'summit-expedition', 'Algebra 1: Solving linear equations',               'other'),
  ('summit-expedition:slope',           'summit-expedition', 'Algebra 1: Slope and intercepts',                   'other'),
  ('summit-expedition:eval',            'summit-expedition', 'Algebra 1: Evaluating expressions',                 'other'),
  ('summit-expedition:exp',             'summit-expedition', 'Algebra 1: Exponent rules',                         'other'),
  ('summit-expedition:poly',            'summit-expedition', 'Algebra 1: Expanding polynomials',                  'other'),
  ('summit-expedition:factor',          'summit-expedition', 'Algebra 1: Solving quadratics by factoring',        'other'),
  ('summit-expedition:sys',             'summit-expedition', 'Algebra 1: Systems of equations',                   'other'),
  ('summit-expedition:pyth',            'summit-expedition', 'Geometry: Pythagorean theorem',                     'other'),
  ('summit-expedition:circle',          'summit-expedition', 'Geometry: Circles: area and arc length',            'other'),
  ('summit-expedition:logs',            'summit-expedition', 'Algebra 2: Evaluating logarithms',                  'other'),
  ('summit-expedition:expeq',           'summit-expedition', 'Algebra 2: Exponential equations',                  'other'),
  ('summit-expedition:logeq',           'summit-expedition', 'Algebra 2: Logarithmic equations',                  'other'),
  ('summit-expedition:comp',            'summit-expedition', 'Algebra 2: Function composition',                   'other'),
  ('summit-expedition:ratexp',          'summit-expedition', 'Algebra 2: Rational exponents',                     'other'),
  ('summit-expedition:disc',            'summit-expedition', 'Algebra 2: The discriminant',                       'other'),
  ('summit-expedition:unit',            'summit-expedition', 'Precalculus: Unit circle values',                   'other'),
  ('summit-expedition:rad',             'summit-expedition', 'Precalculus: Degrees and radians',                  'other'),
  ('summit-expedition:seq',             'summit-expedition', 'Precalculus: Sequences and series',                 'other'),
  ('summit-expedition:vertex',          'summit-expedition', 'Precalculus: Vertex of a parabola',                 'other'),
  ('summit-expedition:inverse',         'summit-expedition', 'Precalculus: Inverse functions',                    'other'),
  ('summit-expedition:limits',          'summit-expedition', 'Calculus: Limits',                                  'other'),
  ('summit-expedition:power',           'summit-expedition', 'Calculus: Power rule derivatives',                  'other'),
  ('summit-expedition:product',         'summit-expedition', 'Calculus: Product and quotient rules',              'other'),
  ('summit-expedition:chain',           'summit-expedition', 'Calculus: Chain rule',                              'other'),
  ('summit-expedition:derivpt',         'summit-expedition', 'Calculus: Derivative at a point',                   'other'),
  ('summit-expedition:integ',           'summit-expedition', 'Calculus: Indefinite integrals',                    'other'),
  ('summit-expedition:defint',          'summit-expedition', 'Calculus: Definite integrals',                      'other')
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type;

insert into public.question_skills (question_id, skill_id) values
  ('summit-expedition:lin',             'algebra'),
  ('summit-expedition:slope',           'algebra'),
  ('summit-expedition:eval',            'pre-algebra'),
  ('summit-expedition:eval',            'algebra'),
  ('summit-expedition:exp',             'algebra'),
  ('summit-expedition:poly',            'algebra'),
  ('summit-expedition:factor',          'algebra'),
  ('summit-expedition:sys',             'algebra'),
  ('summit-expedition:pyth',            'geometry'),
  ('summit-expedition:circle',          'geometry'),
  ('summit-expedition:logs',            'algebra'),
  ('summit-expedition:expeq',           'algebra'),
  ('summit-expedition:logeq',           'algebra'),
  ('summit-expedition:comp',            'algebra'),
  ('summit-expedition:ratexp',          'algebra'),
  ('summit-expedition:disc',            'algebra'),
  ('summit-expedition:unit',            'trigonometry'),
  ('summit-expedition:rad',             'trigonometry'),
  ('summit-expedition:seq',             'algebra'),
  ('summit-expedition:vertex',          'algebra'),
  ('summit-expedition:inverse',         'algebra'),
  ('summit-expedition:limits',          'calculus'),
  ('summit-expedition:power',           'calculus'),
  ('summit-expedition:product',         'calculus'),
  ('summit-expedition:chain',           'calculus'),
  ('summit-expedition:derivpt',         'calculus'),
  ('summit-expedition:integ',           'calculus'),
  ('summit-expedition:defint',          'calculus')
on conflict do nothing;

-- Jump Lab (learning-lab/jump-lab/): each mission is one question (every
-- "Send it" is an attempt), plus the multiple-choice prediction before a
-- mission and the "Predict, then test" questions in Explore.
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('jump-lab:clear-the-gap',         'jump-lab', 'Mission: Clear the Gap (choose the lip angle)',            'prediction', 'beginner'),
  ('jump-lab:minimum-speed',         'jump-lab', 'Mission: Minimum Speed (slowest speed that clears)',       'prediction', 'intermediate'),
  ('jump-lab:perfect-trajectory',    'jump-lab', 'Mission: The Perfect Trajectory (speed and angle)',        'prediction', 'advanced'),
  ('jump-lab:same-distance',         'jump-lab', 'Mission: Same Distance, Different Jumps',                  'prediction', 'advanced'),
  ('jump-lab:solve-before-jump',     'jump-lab', 'Mission: Solve Before You Jump (calculate the landing)',   'numeric',    'advanced'),
  ('jump-lab:mission-prediction',    'jump-lab', 'Prediction before a mission',                              'choice',     null),
  ('jump-lab:predict-speed-plus-20', 'jump-lab', 'Predict: 20% more speed and jump distance',                'choice',     null),
  ('jump-lab:predict-double-speed',  'jump-lab', 'Predict: double the speed and max height',                 'choice',     null),
  ('jump-lab:predict-angle-up-5',    'jump-lab', 'Predict: 5 degrees steeper and distance',                  'choice',     null),
  ('jump-lab:predict-drop-landing',  'jump-lab', 'Predict: lower landing and airtime',                       'choice',     null)
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('jump-lab:clear-the-gap',         'forces-motion'),
  ('jump-lab:minimum-speed',         'forces-motion'),
  ('jump-lab:minimum-speed',         'algebra'),
  ('jump-lab:perfect-trajectory',    'forces-motion'),
  ('jump-lab:perfect-trajectory',    'trigonometry'),
  ('jump-lab:same-distance',         'forces-motion'),
  ('jump-lab:same-distance',         'trigonometry'),
  ('jump-lab:solve-before-jump',     'forces-motion'),
  ('jump-lab:solve-before-jump',     'trigonometry'),
  ('jump-lab:solve-before-jump',     'algebra'),
  ('jump-lab:mission-prediction',    'forces-motion'),
  ('jump-lab:predict-speed-plus-20', 'forces-motion'),
  ('jump-lab:predict-speed-plus-20', 'speed-velocity'),
  ('jump-lab:predict-double-speed',  'forces-motion'),
  ('jump-lab:predict-double-speed',  'speed-velocity'),
  ('jump-lab:predict-angle-up-5',    'forces-motion'),
  ('jump-lab:predict-drop-landing',  'forces-motion')
on conflict do nothing;

-- MTB Physics Playground (learning-lab/physics-playground/, built from its
-- own repository; see scripts/import-playground.mjs): launch predictions,
-- the two in-challenge questions, and the "Try it without the simulation"
-- checks. Written explanations are not graded, so they are not recorded.
insert into public.questions (id, game_id, title, question_type, difficulty) values
  ('physics-playground:predict-outcome',    'physics-playground', 'Predict: short of, inside or beyond the target',      'choice',  null),
  ('physics-playground:predict-distance',   'physics-playground', 'Predict: farther or closer than the last launch',     'choice',  null),
  ('physics-playground:predict-airtime',    'physics-playground', 'Predict: longer or shorter in the air than last time', 'choice', null),
  ('physics-playground:q-compare-runs',     'physics-playground', 'Which setting caused the difference between two runs', 'choice', 'beginner'),
  ('physics-playground:q-angle-components', 'physics-playground', 'How a steeper angle changes vx and vy',               'choice',  'intermediate'),
  ('physics-playground:calc-vx-q',          'physics-playground', 'Calculate a horizontal velocity component',           'numeric', 'intermediate'),
  ('physics-playground:calc-vy-q',          'physics-playground', 'Calculate a vertical velocity component',             'numeric', 'intermediate'),
  ('physics-playground:compare-vy-q',       'physics-playground', 'Compare two riders'' vertical velocities',            'choice',  'intermediate'),
  ('physics-playground:height-time-q',      'physics-playground', 'Takeoff height and flight time',                      'choice',  'beginner'),
  ('physics-playground:graph-q',            'physics-playground', 'Read the landing distance from a trajectory graph',   'choice',  'beginner')
on conflict (id) do update
  set title = excluded.title, question_type = excluded.question_type, difficulty = excluded.difficulty;

insert into public.question_skills (question_id, skill_id) values
  ('physics-playground:predict-outcome',    'forces-motion'),
  ('physics-playground:predict-distance',   'forces-motion'),
  ('physics-playground:predict-airtime',    'forces-motion'),
  ('physics-playground:q-compare-runs',     'forces-motion'),
  ('physics-playground:q-angle-components', 'forces-motion'),
  ('physics-playground:q-angle-components', 'trigonometry'),
  ('physics-playground:calc-vx-q',          'trigonometry'),
  ('physics-playground:calc-vx-q',          'speed-velocity'),
  ('physics-playground:calc-vy-q',          'trigonometry'),
  ('physics-playground:calc-vy-q',          'speed-velocity'),
  ('physics-playground:compare-vy-q',       'trigonometry'),
  ('physics-playground:compare-vy-q',       'speed-velocity'),
  ('physics-playground:height-time-q',      'forces-motion'),
  ('physics-playground:graph-q',            'forces-motion'),
  ('physics-playground:graph-q',            'geometry')
on conflict do nothing;

-- 4. Sessions, attempts and the review queue ------------------------
create table if not exists public.game_sessions (
  id               uuid primary key,          -- made in the browser
  student_id       uuid not null references public.profiles (user_id) on delete cascade,
  game_id          text not null,
  started_at       timestamptz not null,
  last_activity_at timestamptz not null,
  ended_at         timestamptz,
  completed        boolean not null default false,
  attempt_count    integer not null default 0,
  metrics          jsonb
);
create index if not exists game_sessions_student_idx on public.game_sessions (student_id, started_at desc);

create table if not exists public.question_attempts (
  id              uuid primary key,           -- made in the browser; makes retries safe
  student_id      uuid not null references public.profiles (user_id) on delete cascade,
  game_id         text not null,
  question_id     text not null references public.questions (id),
  -- Identifies the exact question (template + its numbers), so retries of
  -- the same question line up and a new version counts as a new question.
  question_hash   text not null,
  game_session_id uuid references public.game_sessions (id) on delete set null,
  context         text not null default 'game' check (context in ('game', 'review', 'assignment')),
  snapshot        jsonb not null,             -- the question as the student saw it
  student_answer  text,
  correct_answer  text,
  is_correct      boolean not null,
  attempt_number  integer not null check (attempt_number >= 1),
  hints_used      integer not null default 0 check (hints_used >= 0),
  time_to_answer_ms integer check (time_to_answer_ms is null or time_to_answer_ms >= 0),
  occurred_at     timestamptz not null,       -- when it happened on the student's device
  created_at      timestamptz not null default now(),
  unique (student_id, question_id, question_hash, attempt_number)
);
-- The game's own name for a fixed question (e.g. a mission id), when it
-- sent one. Kept so a review attempt can be matched to the same question.
alter table public.question_attempts add column if not exists question_key text;
create index if not exists question_attempts_student_time_idx on public.question_attempts (student_id, occurred_at desc);
create index if not exists question_attempts_student_created_idx on public.question_attempts (student_id, created_at desc);
create index if not exists question_attempts_question_idx on public.question_attempts (question_id);
create index if not exists question_attempts_session_idx on public.question_attempts (game_session_id);

create table if not exists public.review_items (
  id                        uuid primary key default gen_random_uuid(),
  student_id                uuid not null references public.profiles (user_id) on delete cascade,
  game_id                   text not null,
  question_id               text not null references public.questions (id),
  question_hash             text not null,
  status                    text not null default 'needs_review'
                              check (status in ('needs_review', 'in_progress', 'corrected', 'mastered')),
  first_attempt_id          uuid not null references public.question_attempts (id) on delete cascade,
  latest_attempt_id         uuid not null references public.question_attempts (id) on delete cascade,
  last_incorrect_session_id uuid,
  incorrect_count           integer not null default 1,
  attempt_count             integer not null default 1,
  tutor_flag                boolean not null default false,
  first_incorrect_at        timestamptz not null,
  last_activity_at          timestamptz not null,
  -- One review item per student per exact question, however many times
  -- they miss it.
  unique (student_id, question_id, question_hash)
);
create index if not exists review_items_student_idx on public.review_items (student_id, status, last_activity_at desc);

-- Every status change, who made it and why. Never edited.
create table if not exists public.review_events (
  id             uuid primary key default gen_random_uuid(),
  review_item_id uuid not null references public.review_items (id) on delete cascade,
  student_id     uuid not null references public.profiles (user_id) on delete cascade,
  from_status    text,
  to_status      text not null,
  actor_id       uuid,
  actor_role     text,
  attempt_id     uuid references public.question_attempts (id) on delete set null,
  note           text check (note is null or char_length(note) <= 2000),
  created_at     timestamptz not null default now()
);
create index if not exists review_events_item_idx on public.review_events (review_item_id, created_at);

alter table public.game_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.review_items enable row level security;
alter table public.review_events enable row level security;

drop policy if exists "Own or assigned student's sessions" on public.game_sessions;
create policy "Own or assigned student's sessions"
  on public.game_sessions for select to authenticated
  using ((select public.has_tool_access())
         and (student_id = (select auth.uid()) or student_id in (select public.my_student_ids())));

drop policy if exists "Own or assigned student's attempts" on public.question_attempts;
create policy "Own or assigned student's attempts"
  on public.question_attempts for select to authenticated
  using ((select public.has_tool_access())
         and (student_id = (select auth.uid()) or student_id in (select public.my_student_ids())));

drop policy if exists "Own or assigned student's review items" on public.review_items;
create policy "Own or assigned student's review items"
  on public.review_items for select to authenticated
  using ((select public.has_tool_access())
         and (student_id = (select auth.uid()) or student_id in (select public.my_student_ids())));

drop policy if exists "Own or assigned student's review history" on public.review_events;
create policy "Own or assigned student's review history"
  on public.review_events for select to authenticated
  using ((select public.has_tool_access())
         and (student_id = (select auth.uid()) or student_id in (select public.my_student_ids())));

-- Read-only from the browser: no insert/update/delete for anyone but you.
revoke all on public.game_sessions, public.question_attempts,
              public.review_items, public.review_events from anon, authenticated;
grant select on public.game_sessions, public.question_attempts,
                public.review_items, public.review_events to authenticated;

-- 5. Saving an attempt ----------------------------------------------
-- Called by js/progress.js for every answer a signed-in student submits.
--   * The student is auth.uid(). There is no student parameter.
--   * p_attempt_id is made in the browser. Sending the same one twice
--     (a retry after a dropped connection) saves it once.
--   * attempt_number is counted here, not trusted from the browser.
--   * A wrong answer creates or updates the student's review item in the
--     same transaction. A right answer marks the item "corrected" only
--     if it came from the review page or from a later game session than
--     the last miss (typing in the answer the game just revealed doesn't
--     count). Nothing is ever marked "mastered" automatically.
-- Errors use PostgREST's PTxxx codes so the browser gets a real HTTP
-- status: 403 not allowed, 409 id clash, 422 bad input, 429 slow down.
create or replace function public.record_attempt(
  p_attempt_id     uuid,
  p_game_id        text,
  p_question_id    text,
  p_snapshot       jsonb,
  p_is_correct     boolean,
  p_student_answer text default null,
  p_correct_answer text default null,
  p_hints_used     integer default 0,
  p_time_ms        integer default null,
  p_session_id     uuid default null,
  p_context        text default 'game',
  p_client_time    timestamptz default null,
  p_question_key   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_existing public.question_attempts%rowtype;
  v_review   public.review_items%rowtype;
  v_session  public.game_sessions%rowtype;
  v_hash     text;
  v_n        integer;
  v_when     timestamptz;
  v_status   text;
  v_context  text := coalesce(p_context, 'game');
  v_has_item boolean;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account to save progress.';
  end if;
  if not exists (select 1 from public.profiles p where p.user_id = v_uid) then
    raise sqlstate 'PT403' using message = 'This account has no profile yet.';
  end if;

  if p_attempt_id is null or p_is_correct is null or p_game_id is null or p_question_id is null then
    raise sqlstate 'PT422' using message = 'attempt id, game, question and correctness are required.';
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' or octet_length(p_snapshot::text) > 20000 then
    raise sqlstate 'PT422' using message = 'snapshot must be a JSON object under 20 KB.';
  end if;
  if char_length(coalesce(p_student_answer, '')) > 1000 or char_length(coalesce(p_correct_answer, '')) > 1000
     or char_length(coalesce(p_question_key, '')) > 200 then
    raise sqlstate 'PT422' using message = 'answer or question key is too long.';
  end if;
  if v_context not in ('game', 'review', 'assignment') then
    raise sqlstate 'PT422' using message = 'unknown context.';
  end if;
  if not exists (select 1 from public.questions q
                 where q.id = p_question_id and q.game_id = p_game_id and q.active) then
    raise sqlstate 'PT422' using message = 'Unknown question for this game: ' || p_question_id;
  end if;

  -- Already saved? (a retry of the same submission)
  select * into v_existing from public.question_attempts a where a.id = p_attempt_id;
  if found then
    if v_existing.student_id <> v_uid then
      raise sqlstate 'PT409' using message = 'That attempt id is already in use.';
    end if;
    return jsonb_build_object('attempt_id', v_existing.id, 'attempt_number', v_existing.attempt_number, 'duplicate', true);
  end if;

  -- Flood protection: a person can't answer 90 questions a minute.
  if (select count(*) from public.question_attempts a
      where a.student_id = v_uid and a.created_at > now() - interval '1 minute') >= 90 then
    raise sqlstate 'PT429' using message = 'Too many attempts at once. Try again in a minute.';
  end if;

  v_hash := md5(p_question_id || ':' || coalesce(nullif(btrim(p_question_key), ''), p_snapshot::text));
  -- When it happened: the device's clock, but never in the future and
  -- never more than 14 days back (the offline queue's limit).
  v_when := least(now(), greatest(coalesce(p_client_time, now()), now() - interval '14 days'));

  -- One submission at a time per student per question, so attempt
  -- numbers can't collide.
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || v_hash, 0));

  if p_session_id is not null then
    insert into public.game_sessions (id, student_id, game_id, started_at, last_activity_at)
    values (p_session_id, v_uid, p_game_id, v_when, v_when)
    on conflict (id) do nothing;
    select * into v_session from public.game_sessions s where s.id = p_session_id for update;
    if v_session.student_id <> v_uid or v_session.game_id <> p_game_id then
      raise sqlstate 'PT403' using message = 'That game session belongs to someone else.';
    end if;
    update public.game_sessions s
       set started_at = least(s.started_at, v_when),
           last_activity_at = greatest(s.last_activity_at, v_when),
           attempt_count = s.attempt_count + 1
     where s.id = p_session_id;
  end if;

  select count(*) + 1 into v_n
  from public.question_attempts a
  where a.student_id = v_uid and a.question_id = p_question_id and a.question_hash = v_hash;

  begin
    insert into public.question_attempts
      (id, student_id, game_id, question_id, question_hash, question_key, game_session_id, context, snapshot,
       student_answer, correct_answer, is_correct, attempt_number, hints_used, time_to_answer_ms, occurred_at)
    values
      (p_attempt_id, v_uid, p_game_id, p_question_id, v_hash, nullif(btrim(p_question_key), ''), p_session_id, v_context, p_snapshot,
       p_student_answer, p_correct_answer, p_is_correct, v_n,
       least(greatest(coalesce(p_hints_used, 0), 0), 100),
       case when p_time_ms between 0 and 86400000 then p_time_ms end,
       v_when);
  exception when unique_violation then
    -- The same submission arrived twice at the same moment.
    select * into v_existing from public.question_attempts a where a.id = p_attempt_id and a.student_id = v_uid;
    if found then
      return jsonb_build_object('attempt_id', v_existing.id, 'attempt_number', v_existing.attempt_number, 'duplicate', true);
    end if;
    raise sqlstate 'PT409' using message = 'That attempt id is already in use.';
  end;

  -- Review queue
  select * into v_review from public.review_items r
  where r.student_id = v_uid and r.question_id = p_question_id and r.question_hash = v_hash
  for update;
  v_has_item := found;

  if not p_is_correct then
    if not v_has_item then
      insert into public.review_items
        (student_id, game_id, question_id, question_hash, status, first_attempt_id, latest_attempt_id,
         last_incorrect_session_id, incorrect_count, attempt_count, first_incorrect_at, last_activity_at)
      values
        (v_uid, p_game_id, p_question_id, v_hash, 'needs_review', p_attempt_id, p_attempt_id,
         p_session_id, 1, v_n, v_when, v_when)
      returning * into v_review;
      insert into public.review_events (review_item_id, student_id, from_status, to_status, actor_id, actor_role, attempt_id, note)
      values (v_review.id, v_uid, null, 'needs_review', v_uid, 'student', p_attempt_id, 'Answered incorrectly');
      v_status := 'needs_review';
    else
      v_status := case when v_review.status in ('corrected', 'mastered') then 'needs_review' else v_review.status end;
      update public.review_items r
         set status = v_status,
             latest_attempt_id = p_attempt_id,
             last_incorrect_session_id = p_session_id,
             incorrect_count = r.incorrect_count + 1,
             attempt_count = v_n,
             last_activity_at = greatest(r.last_activity_at, v_when)
       where r.id = v_review.id;
      if v_status <> v_review.status then
        insert into public.review_events (review_item_id, student_id, from_status, to_status, actor_id, actor_role, attempt_id, note)
        values (v_review.id, v_uid, v_review.status, v_status, v_uid, 'student', p_attempt_id, 'Missed again after being ' || v_review.status);
      end if;
    end if;
  elsif v_has_item then
    v_status := v_review.status;
    if v_review.status in ('needs_review', 'in_progress')
       and (v_context = 'review' or p_session_id is distinct from v_review.last_incorrect_session_id) then
      v_status := 'corrected';
    end if;
    update public.review_items r
       set status = v_status,
           latest_attempt_id = p_attempt_id,
           attempt_count = v_n,
           last_activity_at = greatest(r.last_activity_at, v_when)
     where r.id = v_review.id;
    if v_status <> v_review.status then
      insert into public.review_events (review_item_id, student_id, from_status, to_status, actor_id, actor_role, attempt_id, note)
      values (v_review.id, v_uid, v_review.status, v_status, v_uid, 'student', p_attempt_id,
              case when v_context = 'review' then 'Answered correctly in review' else 'Answered correctly in a later session' end);
    end if;
  end if;

  return jsonb_build_object('attempt_id', p_attempt_id, 'attempt_number', v_n, 'duplicate', false, 'review_status', v_status);
end;
$$;

-- Marks a game session finished (optional; games call it at a natural end).
create or replace function public.end_game_session(
  p_session_id uuid,
  p_completed  boolean default true,
  p_metrics    jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account to save progress.';
  end if;
  if p_metrics is not null and (jsonb_typeof(p_metrics) <> 'object' or octet_length(p_metrics::text) > 4000) then
    raise sqlstate 'PT422' using message = 'metrics must be a small JSON object.';
  end if;
  update public.game_sessions s
     set ended_at = coalesce(s.ended_at, now()),
         completed = s.completed or coalesce(p_completed, false),
         metrics = coalesce(p_metrics, s.metrics)
   where s.id = p_session_id and s.student_id = v_uid;
  return found;
end;
$$;

revoke all on function public.record_attempt(uuid, text, text, jsonb, boolean, text, text, integer, integer, uuid, text, timestamptz, text) from public, anon;
revoke all on function public.end_game_session(uuid, boolean, jsonb) from public, anon;
grant execute on function public.record_attempt(uuid, text, text, jsonb, boolean, text, text, integer, integer, uuid, text, timestamptz, text) to authenticated;
grant execute on function public.end_game_session(uuid, boolean, jsonb) to authenticated;

-- ============================================================
-- Phase 2: the student's own view of their progress
-- (dashboard.html, my-progress.html, review.html).
-- ============================================================

-- 6. Settings ---------------------------------------------------
-- The numbers the dashboards use, in one place. Change a value here (or
-- in the dashboard's table editor) and every page follows. Re-running
-- this file never overwrites a value you changed.
create table if not exists public.progress_settings (
  key   text primary key,
  value jsonb not null,
  note  text
);
insert into public.progress_settings (key, value, note) values
  ('timezone',           '"America/Denver"', 'Weeks start Monday 00:00 in this timezone.'),
  ('skill_window_days',  '30',   'Skill accuracy looks at this many days, and compares with the same number before.'),
  ('min_sample',         '5',    'Fewer first tries than this in the window shows "Not enough data".'),
  ('strong_at',          '0.8',  'First-try accuracy at or above this is "Strong".'),
  ('developing_at',      '0.6',  'At or above this (and below strong) is "Developing"; below is "Needs practice".'),
  ('active_gap_minutes', '10',   'Practice time counts gaps between answers up to this long.'),
  ('stale_days',         '14',   'A skill not practiced for this long is suggested as a refresher.')
on conflict (key) do nothing;

alter table public.progress_settings enable row level security;
drop policy if exists "Signed-in users can read settings" on public.progress_settings;
create policy "Signed-in users can read settings" on public.progress_settings for select to authenticated using (true);
revoke all on public.progress_settings from anon, authenticated;
grant select on public.progress_settings to authenticated;

create or replace function public.progress_setting(p_key text, p_default numeric)
returns numeric
language sql
stable
set search_path = ''
as $$
  select coalesce((select (s.value #>> '{}')::numeric from public.progress_settings s where s.key = p_key), p_default);
$$;
revoke all on function public.progress_setting(text, numeric) from public, anon;
grant execute on function public.progress_setting(text, numeric) to authenticated;

-- 7. First tries --------------------------------------------------
-- One row per question per play session: the student's FIRST try at it
-- in that session, plus whether they got there in the end. This is what
-- "questions attempted" and "first-attempt accuracy" count, so retries
-- never inflate the numbers and a fixed question met again in a later
-- session counts as a fresh first try. Attempts made on the review page
-- are left out (they are re-tries by definition). Attempts with no
-- session are grouped by day.
-- The view runs with the reader's own rights, so the row-level rules on
-- question_attempts apply to it unchanged.
create or replace view public.question_first_tries
with (security_invoker = true) as
select distinct on (a.student_id, a.question_id, a.question_hash,
                    coalesce(a.game_session_id::text, to_char(a.occurred_at at time zone 'UTC', 'YYYY-MM-DD')))
  a.student_id,
  a.game_id,
  a.question_id,
  a.question_hash,
  a.game_session_id,
  a.id          as attempt_id,
  a.occurred_at,
  a.is_correct  as first_correct,
  bool_or(a.is_correct) over w   as eventually_correct,
  max(a.hints_used) over w > 0   as used_hint,
  count(*) over w                as tries
from public.question_attempts a
where a.context <> 'review'
window w as (partition by a.student_id, a.question_id, a.question_hash,
                          coalesce(a.game_session_id::text, to_char(a.occurred_at at time zone 'UTC', 'YYYY-MM-DD')))
order by a.student_id, a.question_id, a.question_hash,
         coalesce(a.game_session_id::text, to_char(a.occurred_at at time zone 'UTC', 'YYYY-MM-DD')),
         a.occurred_at, a.attempt_number;

revoke all on public.question_first_tries from anon, authenticated;
grant select on public.question_first_tries to authenticated;

-- 8. The dashboard in one call -------------------------------------
-- Everything dashboard.html and my-progress.html show, as one JSON
-- document. With no argument it is the signed-in student's own; a tutor
-- passes one of their assigned students (anyone else is refused). It
-- runs with the caller's rights, so it can only ever read rows the
-- row-level rules already allow.
--   week             this week so far (and last week, for comparison)
--   skills           first-try accuracy per skill over the window, with
--                    the sample size and a plain status; "not_enough_data"
--                    below min_sample. These are practice indicators, not
--                    grades.
--   recent           the latest play sessions
--   review           how many missed questions are waiting
--   recommendations  rule-based next steps, most important first
create or replace function public.student_dashboard(p_student uuid default null)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_sid   uuid := coalesce(p_student, auth.uid());
  v_tz    text;
  v_week  timestamptz;
  v_win   integer := public.progress_setting('skill_window_days', 30);
  v_min   integer := public.progress_setting('min_sample', 5);
  v_strong numeric := public.progress_setting('strong_at', 0.8);
  v_dev    numeric := public.progress_setting('developing_at', 0.6);
  v_gap    numeric := public.progress_setting('active_gap_minutes', 10);
  v_stale  integer := public.progress_setting('stale_days', 14);
  v_student jsonb; v_weekj jsonb; v_prev jsonb; v_skills jsonb; v_recent jsonb; v_review jsonb;
  v_recs jsonb := '[]'::jsonb;
  v_waiting integer; v_minutes integer; v_sessions integer; v_completed integer;
  r record;
  v_used text[] := '{}';
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account.';
  end if;
  if v_sid <> v_uid and v_sid not in (select public.my_student_ids()) then
    raise sqlstate 'PT403' using message = 'That student is not assigned to you.';
  end if;

  v_tz := coalesce((select s.value #>> '{}' from public.progress_settings s where s.key = 'timezone'), 'America/Denver');
  v_week := date_trunc('week', now() at time zone v_tz) at time zone v_tz;

  select jsonb_build_object('display_name', p.display_name, 'grade_level', p.grade_level, 'since', p.created_at,
           'tutors', coalesce((select jsonb_agg(t.display_name order by t.display_name)
                               from public.student_tutors st join public.profiles t on t.user_id = st.tutor_id
                               where st.student_id = v_sid and st.active), '[]'::jsonb))
    into v_student
  from public.profiles p where p.user_id = v_sid;

  -- This week and last week
  select jsonb_build_object('questions', count(*), 'first_correct', count(*) filter (where f.first_correct),
           'eventually_correct', count(*) filter (where f.eventually_correct), 'with_hints', count(*) filter (where f.used_hint))
    into v_weekj
  from public.question_first_tries f where f.student_id = v_sid and f.occurred_at >= v_week;
  select jsonb_build_object('questions', count(*), 'first_correct', count(*) filter (where f.first_correct))
    into v_prev
  from public.question_first_tries f
  where f.student_id = v_sid and f.occurred_at >= v_week - interval '7 days' and f.occurred_at < v_week;

  select count(distinct a.game_session_id) into v_sessions
  from public.question_attempts a
  where a.student_id = v_sid and a.occurred_at >= v_week and a.game_session_id is not null;
  select count(*) into v_completed
  from public.game_sessions s where s.student_id = v_sid and s.completed and s.ended_at >= v_week;
  -- Practice time: only the gaps between one answer and the next in the
  -- same session, and only short ones. A tab left open counts for nothing.
  select coalesce(round(sum(extract(epoch from g.gap)) / 60), 0) into v_minutes
  from (select a.occurred_at - lag(a.occurred_at) over (partition by a.game_session_id order by a.occurred_at) as gap
        from public.question_attempts a
        where a.student_id = v_sid and a.occurred_at >= v_week and a.game_session_id is not null) g
  where g.gap <= make_interval(secs => v_gap * 60);
  select count(*) into v_waiting
  from public.review_items ri where ri.student_id = v_sid and ri.status in ('needs_review', 'in_progress');

  v_weekj := v_weekj || jsonb_build_object('start', v_week, 'sessions', v_sessions, 'completed', v_completed,
                                           'active_minutes', v_minutes, 'previous', v_prev);

  -- Skills
  with cur as (
    select qs.skill_id, count(*) n, count(*) filter (where f.first_correct) c, count(*) filter (where f.eventually_correct) e,
           count(*) filter (where f.used_hint) h, count(distinct f.question_hash) uq, count(distinct f.game_session_id) sess
    from public.question_first_tries f join public.question_skills qs on qs.question_id = f.question_id
    where f.student_id = v_sid and f.occurred_at >= now() - make_interval(days => v_win)
    group by qs.skill_id),
  prev as (
    select qs.skill_id, count(*) n, count(*) filter (where f.first_correct) c
    from public.question_first_tries f join public.question_skills qs on qs.question_id = f.question_id
    where f.student_id = v_sid and f.occurred_at >= now() - make_interval(days => 2 * v_win)
      and f.occurred_at < now() - make_interval(days => v_win)
    group by qs.skill_id),
  ever as (
    select qs.skill_id, count(*) n, max(f.occurred_at) last_at
    from public.question_first_tries f join public.question_skills qs on qs.question_id = f.question_id
    where f.student_id = v_sid
    group by qs.skill_id)
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'name', s.name, 'parent', s.parent_id,
           'n', coalesce(cur.n, 0), 'correct', coalesce(cur.c, 0), 'eventually_correct', coalesce(cur.e, 0),
           'with_hints', coalesce(cur.h, 0), 'questions', coalesce(cur.uq, 0), 'sessions', coalesce(cur.sess, 0),
           'prev_n', coalesce(prev.n, 0), 'prev_correct', coalesce(prev.c, 0),
           'total_n', ever.n, 'last_at', ever.last_at,
           'status', case when coalesce(cur.n, 0) < v_min then 'not_enough_data'
                          when cur.c::numeric / cur.n >= v_strong then 'strong'
                          when cur.c::numeric / cur.n >= v_dev then 'developing'
                          else 'needs_practice' end)
         order by s.sort_order), '[]'::jsonb)
    into v_skills
  from ever join public.skills s on s.id = ever.skill_id
  left join cur on cur.skill_id = s.id left join prev on prev.skill_id = s.id;

  -- Recent sessions
  select coalesce(jsonb_agg(x.j order by x.started_at desc), '[]'::jsonb) into v_recent
  from (select s.started_at,
               jsonb_build_object('id', s.id, 'game_id', s.game_id, 'started_at', s.started_at, 'last_activity_at', s.last_activity_at,
                 'completed', s.completed, 'metrics', s.metrics,
                 'questions', (select count(*) from public.question_first_tries f where f.game_session_id = s.id),
                 'first_correct', (select count(*) from public.question_first_tries f where f.game_session_id = s.id and f.first_correct)) as j
        from public.game_sessions s where s.student_id = v_sid
        order by s.started_at desc limit 8) x;

  select jsonb_build_object('waiting', v_waiting,
           'corrected', (select count(*) from public.review_items ri where ri.student_id = v_sid and ri.status in ('corrected', 'mastered')),
           'by_skill', coalesce((select jsonb_agg(jsonb_build_object('id', t.skill_id, 'name', t.name, 'count', t.n) order by t.n desc, t.name)
                                 from (select qs.skill_id, sk.name, count(*) n
                                       from public.review_items ri
                                       join public.question_skills qs on qs.question_id = ri.question_id
                                       join public.skills sk on sk.id = qs.skill_id
                                       where ri.student_id = v_sid and ri.status in ('needs_review', 'in_progress')
                                       group by qs.skill_id, sk.name) t), '[]'::jsonb))
    into v_review;

  -- Recommendations: simple rules, most important first, at most four.
  -- 1. Missed questions waiting.
  if v_waiting > 0 then
    v_recs := v_recs || jsonb_build_object('type', 'review', 'count', v_waiting,
                'skill_id', v_review #>> '{by_skill,0,id}', 'skill_name', v_review #>> '{by_skill,0,name}',
                'minutes', least(30, greatest(5, v_waiting * 3)));
  end if;
  -- 2. The weakest skill with enough data.
  for r in select e ->> 'id' id, e ->> 'name' name, (e ->> 'n')::int n, (e ->> 'correct')::int c
           from jsonb_array_elements(v_skills) e where e ->> 'status' = 'needs_practice'
           order by (e ->> 'correct')::numeric / (e ->> 'n')::numeric, (e ->> 'n')::int desc limit 1 loop
    v_recs := v_recs || jsonb_build_object('type', 'practice_skill', 'skill_id', r.id, 'skill_name', r.name, 'n', r.n, 'correct', r.c,
                'game_id', (select q.game_id from public.questions q join public.question_skills qs on qs.question_id = q.id
                            where qs.skill_id = r.id and q.active group by q.game_id order by count(*) desc, q.game_id limit 1));
    v_used := v_used || r.id;
  end loop;
  -- 3. A skill not practiced for a while.
  for r in select e ->> 'id' id, e ->> 'name' name, (e ->> 'last_at')::timestamptz last_at
           from jsonb_array_elements(v_skills) e
           where (e ->> 'last_at')::timestamptz < now() - make_interval(days => v_stale) and not (e ->> 'id' = any (v_used))
           order by (e ->> 'last_at')::timestamptz limit 1 loop
    v_recs := v_recs || jsonb_build_object('type', 'refresh_skill', 'skill_id', r.id, 'skill_name', r.name,
                'days', floor(extract(epoch from now() - r.last_at) / 86400),
                'game_id', (select q.game_id from public.questions q join public.question_skills qs on qs.question_id = q.id
                            where qs.skill_id = r.id and q.active group by q.game_id order by count(*) desc, q.game_id limit 1));
    v_used := v_used || r.id;
  end loop;
  -- 4. A strong skill: try something harder.
  for r in select e ->> 'id' id, e ->> 'name' name, (e ->> 'n')::int n, (e ->> 'correct')::int c
           from jsonb_array_elements(v_skills) e where e ->> 'status' = 'strong' and not (e ->> 'id' = any (v_used))
           order by (e ->> 'correct')::numeric / (e ->> 'n')::numeric desc, (e ->> 'n')::int desc limit 1 loop
    v_recs := v_recs || jsonb_build_object('type', 'level_up', 'skill_id', r.id, 'skill_name', r.name, 'n', r.n, 'correct', r.c,
                'game_id', (select q.game_id from public.questions q join public.question_skills qs on qs.question_id = q.id
                            where qs.skill_id = r.id and q.active
                            group by q.game_id order by count(*) filter (where q.difficulty = 'advanced') desc, count(*) desc, q.game_id limit 1));
  end loop;
  -- 5. Nothing yet this week (or nothing at all): just play.
  if (v_weekj ->> 'questions')::int = 0 then
    v_recs := v_recs || jsonb_build_object('type', 'play',
                'game_id', (select s.game_id from public.game_sessions s where s.student_id = v_sid order by s.started_at desc limit 1));
  end if;

  return jsonb_build_object(
    'student', v_student, 'week', v_weekj, 'skills', v_skills, 'recent', v_recent, 'review', v_review,
    'recommendations', (select coalesce(jsonb_agg(e), '[]'::jsonb) from (select e from jsonb_array_elements(v_recs) with ordinality t(e, i) order by i limit 4) z),
    'settings', jsonb_build_object('timezone', v_tz, 'window_days', v_win, 'min_sample', v_min, 'strong_at', v_strong, 'developing_at', v_dev),
    'generated_at', now());
end;
$$;
revoke all on function public.student_dashboard(uuid) from public, anon;
grant execute on function public.student_dashboard(uuid) to authenticated;

-- 9. Review My Mistakes ----------------------------------------------
-- A student opening a saved question: "needs review" becomes "in progress".
create or replace function public.start_review(p_review_item_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_item public.review_items%rowtype;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account.';
  end if;
  select * into v_item from public.review_items r where r.id = p_review_item_id and r.student_id = v_uid for update;
  if not found then
    raise sqlstate 'PT404' using message = 'No such review item.';
  end if;
  if v_item.status = 'needs_review' then
    update public.review_items r set status = 'in_progress', last_activity_at = now() where r.id = v_item.id;
    insert into public.review_events (review_item_id, student_id, from_status, to_status, actor_id, actor_role, note)
    values (v_item.id, v_uid, 'needs_review', 'in_progress', v_uid, 'student', 'Opened for review');
    return 'in_progress';
  end if;
  return v_item.status;
end;
$$;

-- A try at a saved question from the review page. The browser sends only
-- which review item, the answer and whether it was right; the question
-- itself (and so which question this counts toward) comes from the
-- student's own original attempt, here on the server. A right answer
-- marks the item "corrected" (never "mastered").
create or replace function public.record_review_attempt(
  p_attempt_id     uuid,
  p_review_item_id uuid,
  p_is_correct     boolean,
  p_student_answer text default null,
  p_hints_used     integer default 0,
  p_time_ms        integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_first public.question_attempts%rowtype;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account to save progress.';
  end if;
  select a.* into v_first
  from public.review_items r join public.question_attempts a on a.id = r.first_attempt_id
  where r.id = p_review_item_id and r.student_id = v_uid;
  if not found then
    raise sqlstate 'PT404' using message = 'No such review item.';
  end if;
  return public.record_attempt(
    p_attempt_id, v_first.game_id, v_first.question_id, v_first.snapshot, p_is_correct,
    p_student_answer, v_first.correct_answer, p_hints_used, p_time_ms,
    null, 'review', now(), v_first.question_key);
end;
$$;

revoke all on function public.start_review(uuid) from public, anon;
revoke all on function public.record_review_attempt(uuid, uuid, boolean, text, integer, integer) from public, anon;
grant execute on function public.start_review(uuid) to authenticated;
grant execute on function public.record_review_attempt(uuid, uuid, boolean, text, integer, integer) to authenticated;

-- 10. Goals ------------------------------------------------------------
-- Weekly learning goals, set by a tutor for a student or by a student
-- for themselves. Most kinds measure themselves from real activity since
-- the goal was set, so nobody ticks a box:
--   sessions     practice sessions (any game)
--   questions    questions attempted (first tries, so retries don't count)
--   corrections  missed questions corrected
--   skill        questions attempted in one skill
--   game         rounds of one game finished
--   custom       anything else in words; a tutor (or the student who set
--                it) marks it done
-- Nobody writes to this table from the browser: goals are made and
-- changed through save_goal() and set_goal_status(), which check who is
-- asking. A student can change only goals they set themselves; a tutor
-- can change any goal of a student assigned to them.
create table if not exists public.student_goals (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles (user_id) on delete cascade,
  created_by      uuid references public.profiles (user_id) on delete set null,
  created_by_role text not null default 'student' check (created_by_role in ('student', 'tutor', 'admin')),
  kind            text not null check (kind in ('sessions', 'questions', 'corrections', 'skill', 'game', 'custom')),
  title           text not null check (char_length(btrim(title)) between 1 and 140),
  target          integer check (target is null or target between 1 and 500),
  skill_id        text references public.skills (id),
  game_id         text,
  starts_at       timestamptz not null default now(),
  due_on          date,
  status          text not null default 'active' check (status in ('active', 'completed', 'archived')),
  completed_at    timestamptz,
  completed_by    uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check ((kind = 'custom') = (target is null)),
  check ((kind = 'skill') = (skill_id is not null)),
  check ((kind = 'game') = (game_id is not null))
);
create index if not exists student_goals_student_idx on public.student_goals (student_id, status, created_at desc);

alter table public.student_goals enable row level security;
drop policy if exists "Own or assigned student's goals" on public.student_goals;
create policy "Own or assigned student's goals"
  on public.student_goals for select to authenticated
  using ((select public.has_tool_access())
         and (student_id = (select auth.uid()) or student_id in (select public.my_student_ids())));
revoke all on public.student_goals from anon, authenticated;
grant select on public.student_goals to authenticated;

-- A student's goals with their progress, newest first. Goals that have
-- reached their target are marked completed as a side effect (that is
-- why this is not a plain view). No argument = the signed-in student's
-- own; a tutor passes an assigned student.
create or replace function public.student_goals(p_student uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_sid  uuid := coalesce(p_student, auth.uid());
  v_self boolean;
  v_tz   text;
  v_today date;
  g      public.student_goals%rowtype;
  v_progress integer;
  v_out  jsonb := '[]'::jsonb;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account.';
  end if;
  v_self := v_sid = v_uid;
  if not v_self and v_sid not in (select public.my_student_ids()) then
    raise sqlstate 'PT403' using message = 'That student is not assigned to you.';
  end if;
  v_tz := coalesce((select s.value #>> '{}' from public.progress_settings s where s.key = 'timezone'), 'America/Denver');
  v_today := (now() at time zone v_tz)::date;

  for g in select * from public.student_goals x
           where x.student_id = v_sid and x.status <> 'archived'
           order by (x.status = 'active') desc, x.created_at desc limit 50 loop
    v_progress := case g.kind
      when 'sessions' then (select count(distinct a.game_session_id) from public.question_attempts a
                            where a.student_id = v_sid and a.game_session_id is not null
                              and a.occurred_at >= g.starts_at and a.occurred_at <= coalesce(g.completed_at, now()))
      when 'questions' then (select count(*) from public.question_first_tries f
                             where f.student_id = v_sid and f.occurred_at >= g.starts_at and f.occurred_at <= coalesce(g.completed_at, now()))
      when 'skill' then (select count(*) from public.question_first_tries f
                         join public.question_skills qs on qs.question_id = f.question_id
                         where f.student_id = v_sid and qs.skill_id = g.skill_id
                           and f.occurred_at >= g.starts_at and f.occurred_at <= coalesce(g.completed_at, now()))
      when 'corrections' then (select count(distinct e.review_item_id) from public.review_events e
                               where e.student_id = v_sid and e.to_status = 'corrected'
                                 and e.created_at >= g.starts_at and e.created_at <= coalesce(g.completed_at, now()))
      when 'game' then (select count(*) from public.game_sessions s
                        where s.student_id = v_sid and s.game_id = g.game_id and s.completed
                          and s.ended_at >= g.starts_at and s.ended_at <= coalesce(g.completed_at, now()))
      else null end;

    if g.status = 'active' and g.kind <> 'custom' and v_progress >= g.target then
      update public.student_goals x set status = 'completed', completed_at = now(), updated_at = now() where x.id = g.id;
      g.status := 'completed'; g.completed_at := now();
    end if;

    v_out := v_out || jsonb_build_object(
      'id', g.id, 'kind', g.kind, 'title', g.title, 'target', g.target,
      'progress', case when g.kind = 'custom' then null else least(v_progress, g.target) end,
      'skill_id', g.skill_id, 'skill_name', (select sk.name from public.skills sk where sk.id = g.skill_id),
      'game_id', g.game_id, 'due_on', g.due_on, 'status', g.status,
      'past_due', g.status = 'active' and g.due_on is not null and g.due_on < v_today,
      'set_by', case when g.created_by = v_sid then 'student' else g.created_by_role end,
      'set_by_name', (select p.display_name from public.profiles p where p.user_id = g.created_by and g.created_by <> v_sid),
      -- what the person asking may do with it
      'can_edit', g.status = 'active' and (not v_self or g.created_by = v_uid),
      'can_complete', g.status = 'active' and g.kind = 'custom' and (not v_self or g.created_by = v_uid),
      'created_at', g.created_at, 'completed_at', g.completed_at);
  end loop;
  return v_out;
end;
$$;

-- Create a goal (p_goal_id null) or change one. A student may only make
-- goals for themselves and change goals they made; a tutor or admin may
-- do both for a student assigned to them.
create or replace function public.save_goal(
  p_kind     text,
  p_title    text,
  p_target   integer default null,
  p_skill_id text default null,
  p_game_id  text default null,
  p_due_on   date default null,
  p_student  uuid default null,
  p_goal_id  uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_sid  uuid := coalesce(p_student, auth.uid());
  v_role text;
  v_self boolean;
  v_goal public.student_goals%rowtype;
  v_id   uuid;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account.';
  end if;
  v_role := public.my_role();
  if v_role is null then
    raise sqlstate 'PT403' using message = 'This account has no profile yet.';
  end if;

  if p_goal_id is not null then
    select * into v_goal from public.student_goals x where x.id = p_goal_id for update;
    if not found then raise sqlstate 'PT404' using message = 'No such goal.'; end if;
    v_sid := v_goal.student_id;
  end if;
  v_self := v_sid = v_uid;
  if not v_self and v_sid not in (select public.my_student_ids()) then
    raise sqlstate 'PT403' using message = 'That student is not assigned to you.';
  end if;
  if v_self and v_role <> 'student' then
    raise sqlstate 'PT422' using message = 'Goals are for student accounts.';
  end if;
  if p_goal_id is not null and v_self and v_goal.created_by is distinct from v_uid then
    raise sqlstate 'PT403' using message = 'Only your tutor can change a goal they set.';
  end if;
  if p_goal_id is not null and v_goal.status <> 'active' then
    raise sqlstate 'PT422' using message = 'Only an active goal can be changed.';
  end if;

  if p_kind is null or p_kind not in ('sessions', 'questions', 'corrections', 'skill', 'game', 'custom') then
    raise sqlstate 'PT422' using message = 'Unknown kind of goal.';
  end if;
  if char_length(btrim(coalesce(p_title, ''))) not between 1 and 140 then
    raise sqlstate 'PT422' using message = 'Give the goal a short title (up to 140 characters).';
  end if;
  if p_kind = 'custom' then
    p_target := null;
  elsif p_target is null or p_target not between 1 and 500 then
    raise sqlstate 'PT422' using message = 'Set a target between 1 and 500.';
  end if;
  if p_kind = 'skill' then
    if not exists (select 1 from public.skills sk where sk.id = p_skill_id and sk.active) then
      raise sqlstate 'PT422' using message = 'Pick a skill.';
    end if;
  else p_skill_id := null; end if;
  if p_kind = 'game' then
    if not exists (select 1 from public.questions q where q.game_id = p_game_id and q.active) then
      raise sqlstate 'PT422' using message = 'Pick a game.';
    end if;
  else p_game_id := null; end if;
  if p_due_on is not null and (p_due_on < current_date - 1 or p_due_on > current_date + 366) then
    raise sqlstate 'PT422' using message = 'Pick a due date within the next year.';
  end if;

  if p_goal_id is not null then
    update public.student_goals x
       set kind = p_kind, title = btrim(p_title), target = p_target, skill_id = p_skill_id, game_id = p_game_id,
           due_on = p_due_on, updated_at = now()
     where x.id = p_goal_id;
    return p_goal_id;
  end if;

  if (select count(*) from public.student_goals x where x.student_id = v_sid and x.status = 'active') >= 12 then
    raise sqlstate 'PT422' using message = 'That is a lot of goals. Finish or remove one first (12 at most).';
  end if;
  insert into public.student_goals (student_id, created_by, created_by_role, kind, title, target, skill_id, game_id, due_on)
  values (v_sid, v_uid, case when v_self then 'student' else v_role end, p_kind, btrim(p_title), p_target, p_skill_id, p_game_id, p_due_on)
  returning id into v_id;
  return v_id;
end;
$$;

-- Mark a goal done ('completed': custom goals only; the others complete
-- themselves), remove it from the list ('archived'), or reopen it
-- ('active'). Same rule as save_goal for who may.
create or replace function public.set_goal_status(p_goal_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_goal public.student_goals%rowtype;
  v_self boolean;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in with an active account.';
  end if;
  if p_status is null or p_status not in ('active', 'completed', 'archived') then
    raise sqlstate 'PT422' using message = 'Unknown status.';
  end if;
  select * into v_goal from public.student_goals x where x.id = p_goal_id for update;
  if not found then raise sqlstate 'PT404' using message = 'No such goal.'; end if;
  v_self := v_goal.student_id = v_uid;
  if not v_self and v_goal.student_id not in (select public.my_student_ids()) then
    raise sqlstate 'PT404' using message = 'No such goal.';
  end if;
  if v_self and v_goal.created_by is distinct from v_uid then
    raise sqlstate 'PT403' using message = 'Only your tutor can change a goal they set.';
  end if;
  if p_status = 'completed' and v_goal.kind <> 'custom' then
    raise sqlstate 'PT422' using message = 'This goal completes itself when the target is reached.';
  end if;
  update public.student_goals x
     set status = p_status, updated_at = now(),
         completed_at = case when p_status = 'completed' then now() when p_status = 'active' then null else x.completed_at end,
         completed_by = case when p_status = 'completed' then v_uid when p_status = 'active' then null else x.completed_by end
   where x.id = p_goal_id;
  return p_status;
end;
$$;

revoke all on function public.student_goals(uuid) from public, anon;
revoke all on function public.save_goal(text, text, integer, text, text, date, uuid, uuid) from public, anon;
revoke all on function public.set_goal_status(uuid, text) from public, anon;
grant execute on function public.student_goals(uuid) to authenticated;
grant execute on function public.save_goal(text, text, integer, text, text, date, uuid, uuid) to authenticated;
grant execute on function public.set_goal_status(uuid, text) to authenticated;

