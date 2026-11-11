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
      (id, student_id, game_id, question_id, question_hash, game_session_id, context, snapshot,
       student_answer, correct_answer, is_correct, attempt_number, hints_used, time_to_answer_ms, occurred_at)
    values
      (p_attempt_id, v_uid, p_game_id, p_question_id, v_hash, p_session_id, v_context, p_snapshot,
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
