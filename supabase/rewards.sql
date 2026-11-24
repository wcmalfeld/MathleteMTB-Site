-- ============================================================
-- TRAIL XP, STREAKS, LEVELS, ACHIEVEMENTS AND THE TRAIL GARAGE
-- (PRDs/studentRewardsSystem.md; reference: docs/REWARDS.md)
--
-- Run in the Supabase SQL Editor AFTER setup.sql, progress.sql,
-- organizations.sql, resources.sql and curriculum.sql. Safe to re-run.
--
-- How it works
--   * Nothing new is asked of the learning tools. Every tool already saves
--     answers through record_attempt() and finished sessions through
--     end_game_session() (progress.sql). Triggers on those two tables send
--     each real learning event to ONE function, reward_award(), which
--     decides the XP from the rules below, records it in the ledger with an
--     idempotency key (so a repeat never pays twice), updates the day, the
--     streak, the level, achievements and unlocked items, all in the same
--     database transaction as the answer itself.
--   * The browser never sends XP. It can only read its own rewards and
--     choose a daily goal, its timezone and what to wear in the Garage.
--   * A failure in the rewards code can never stop an answer being saved:
--     the triggers catch and log it.
--   * Every number (XP values, goals, caps, shields, levels, badge
--     thresholds) is a row in a table here, not code.
--
-- Running this file the first time also replays existing history, so
-- students who have already practised start with the XP they earned.
-- ============================================================

-- 1. Configuration ---------------------------------------------------------------
create table if not exists public.reward_config (
  key   text primary key,
  value jsonb not null,
  note  text
);
insert into public.reward_config (key, value, note) values
  ('xp_beginner',          '5',  'A first correct answer to an easy (beginner) problem.'),
  ('xp_standard',          '7',  'A first correct answer to a standard problem (intermediate, or no difficulty set).'),
  ('xp_challenge',         '10', 'A first correct answer to a challenge (advanced) problem.'),
  ('xp_lesson',            '20', 'Completing a lesson (once per lesson).'),
  ('xp_lab',               '10', 'Completing an interactive lab (once per lab).'),
  ('xp_assessment',        '5',  'Completing a designated assessment (once each).'),
  ('xp_daily_bonus',       '5',  'Bonus for reaching the daily goal (once a day; doesn''t count toward the goal).'),
  ('max_problem_xp_per_day', '250', 'Problem XP stops counting for the day after this (anti-farming; a normal day is far below it).'),
  ('goals',                '{"casual": {"name": "Casual Ride", "xp": 10, "desc": "A little math every day"}, "regular": {"name": "Regular Ride", "xp": 20, "desc": "A consistent daily practice habit"}, "big": {"name": "Big Ride", "xp": 30, "desc": "A more intensive daily challenge"}}', 'The daily goals students choose from.'),
  ('default_goal',         '"regular"', 'Goal for new students (an organization can override it).'),
  ('goal_change_days',     '7',  'A student can change their goal once every this many days; it applies from the next day.'),
  ('shields_start',        '1',  'Trail Shields a new student starts with.'),
  ('shields_max',          '2',  'Most Trail Shields a student can hold.'),
  ('shield_every',         '7',  'A shield is earned at every streak of this many days.'),
  ('comeback_days',        '7',  'Days away that make a return count as a comeback.'),
  ('default_timezone',     '"America/Denver"', 'Until a student''s browser reports its timezone.'),
  ('assessment_qualifies', 'true', 'Does assessment-completion XP count toward the daily goal?')
on conflict (key) do nothing;

create or replace function public.reward_cfg(p_key text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select c.value from public.reward_config c where c.key = p_key;
$$;
create or replace function public.reward_cfg_int(p_key text, p_default integer)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce((select (c.value #>> '{}')::integer from public.reward_config c where c.key = p_key), p_default);
$$;

-- How each activity counts as "completed". kind: lab | lesson.
--   completion 'session': its own "finished" event (end_game_session), with
--      at least min_attempts answers in that session (and, for lessons,
--      at least min_questions different questions attempted overall).
--   completion 'solved': solving min_solved different questions (for tools
--      that don't send a finished event, like Jump Lab's missions).
create table if not exists public.reward_activities (
  game_id       text primary key,
  name          text not null,
  kind          text not null check (kind in ('lab', 'lesson')),
  course_id     text,
  completion    text not null default 'session' check (completion in ('session', 'solved')),
  min_attempts  integer not null default 3,
  min_questions integer not null default 0,
  min_solved    integer not null default 0,
  active        boolean not null default true
);
insert into public.reward_activities (game_id, name, kind, course_id, completion, min_attempts, min_questions, min_solved) values
  ('slope-lab',           'Slope & Linear Relationships Lab', 'lab',    'alg1',  'session', 5, 0, 0),
  ('jump-trajectory-lab', 'Jump Trajectory Lab',              'lab',    'alg1',  'session', 3, 0, 0),
  ('race-day-workshop',   'Race-Day Workshop',                'lab',    'alg2',  'session', 5, 0, 0),
  ('ride-systems-lab',    'Ride Systems Lab',                 'lab',    'alg2',  'session', 5, 0, 0),
  ('bike-park-blueprint-lab', 'Bike Park Blueprint Lab',      'lab',    'alg2',  'session', 5, 0, 0),
  ('trail-dynamics-lab',  'Trail Dynamics Lab',               'lab',    'alg2',  'session', 5, 0, 0),
  ('pump-track-lab',      'Pump Track Profile Lab',           'lab',    'alg2',  'session', 5, 0, 0),
  ('enduro-route-lab',    'Enduro Route Intelligence Lab',    'lab',    'alg2',  'session', 5, 0, 0),
  ('suspension-systems-lab', 'Suspension & Systems Lab',      'lab',    'alg2',  'session', 5, 0, 0),
  ('jump-lab',            'Jump Lab',                         'lab',    'phys1', 'solved',  0, 0, 3),
  ('berm-lab',            'Berm Lab',                         'lab',    'phys1', 'session', 3, 0, 0),
  ('carve-lab',           'Carve Lab',                        'lab',    null,    'session', 3, 0, 0),
  ('gear-ratio-lab',      'Gear Ratio Lab',                   'lab',    null,    'session', 3, 0, 0),
  ('trail-builder',       'Trail Builder',                    'lab',    null,    'session', 3, 0, 0),
  ('strava-showdown',     'Strava Showdown',                  'lab',    null,    'session', 3, 0, 0),
  ('physics-playground',  'MTB Physics Playground',           'lab',    null,    'solved',  0, 0, 3),
  ('summit-expedition',   'Summit Expedition',                'lab',    null,    'session', 3, 0, 0),
  ('intro-to-physics',    'Introduction to Physics',          'lesson', 'phys1', 'session', 1, 12, 0),
  ('newtons-laws',        'Newton’s Laws of Motion',          'lesson', 'phys1', 'session', 1, 12, 0)
on conflict (game_id) do nothing;

-- Designated assessments: completed when every listed question has been attempted.
create table if not exists public.reward_assessments (
  id            text primary key,
  game_id       text not null,
  name          text not null,
  question_ids  text[] not null,
  active        boolean not null default true
);
insert into public.reward_assessments (id, game_id, name, question_ids) values
  ('slope-lab.transfer', 'slope-lab', 'Slope Lab: Transfer Challenge', array['slope-lab:t1','slope-lab:t2','slope-lab:t3','slope-lab:t4','slope-lab:t5','slope-lab:t6','slope-lab:t7','slope-lab:t8']),
  ('intro-to-physics.kc', 'intro-to-physics', 'Introduction to Physics: Knowledge Check', array['intro-to-physics:kc-1','intro-to-physics:kc-2','intro-to-physics:kc-3','intro-to-physics:kc-4','intro-to-physics:kc-5','intro-to-physics:kc-6','intro-to-physics:kc-7','intro-to-physics:kc-8']),
  ('newtons-laws.kc', 'newtons-laws', 'Newton’s Laws: Knowledge Check', array['newtons-laws:kc-1','newtons-laws:kc-2','newtons-laws:kc-3','newtons-laws:kc-4','newtons-laws:kc-5','newtons-laws:kc-6','newtons-laws:kc-7','newtons-laws:kc-8']),
  ('race-day-workshop.final', 'race-day-workshop', 'Race-Day Workshop: Race-Day Certification', array['race-day-workshop:final-a-min','race-day-workshop:final-a-max','race-day-workshop:final-a-abs','race-day-workshop:final-a-eval','race-day-workshop:final-b-speed','race-day-workshop:final-c-elev']),
  ('ride-systems-lab.final', 'ride-systems-lab', 'Ride Systems Lab: Engineer the Ride', array['ride-systems-lab:fa-input','ride-systems-lab:fa-eval','ride-systems-lab:fa-domain','ride-systems-lab:fa-range','ride-systems-lab:fa-inc','ride-systems-lab:fa-dec','ride-systems-lab:fb-ratio','ride-systems-lab:fb-wheel','ride-systems-lab:fb-k','ride-systems-lab:fb-speed','ride-systems-lab:fc-parts','ride-systems-lab:fc-effect','ride-systems-lab:fd-cadence','ride-systems-lab:fd-why']),
  ('bike-park-blueprint-lab.final', 'bike-park-blueprint-lab', 'Bike Park Blueprint Lab: The Final Build Plan', array['bike-park-blueprint-lab:fa-vars','bike-park-blueprint-lab:fa-solve','bike-park-blueprint-lab:fa-meaning','bike-park-blueprint-lab:fa-verify','bike-park-blueprint-lab:fb-aug','bike-park-blueprint-lab:fb-solve','bike-park-blueprint-lab:fb-meaning','bike-park-blueprint-lab:fc-qm','bike-park-blueprint-lab:fc-cost','bike-park-blueprint-lab:fc-budget']),
  ('trail-dynamics-lab.final', 'trail-dynamics-lab', 'Trail Dynamics Lab: The Final Course Analysis', array['trail-dynamics-lab:fa-eq','trail-dynamics-lab:fa-v','trail-dynamics-lab:fa-reject','trail-dynamics-lab:fb-abc','trail-dynamics-lab:fb-axis','trail-dynamics-lab:fb-vertex','trail-dynamics-lab:fb-zeros','trail-dynamics-lab:fb-vform','trail-dynamics-lab:fb-fform','trail-dynamics-lab:fc-eq','trail-dynamics-lab:fc-roots','trail-dynamics-lab:fc-exact']),
  ('pump-track-lab.final', 'pump-track-lab', 'Pump Track Profile Lab: The Final Track Analysis', array['pump-track-lab:fa-degree','pump-track-lab:fa-lead','pump-track-lab:fa-turn','pump-track-lab:fa-end','pump-track-lab:fb-zeros','pump-track-lab:fb-cross','pump-track-lab:fc-expand','pump-track-lab:fc-const','pump-track-lab:fd-synth','pump-track-lab:fd-factor','pump-track-lab:fe-g','pump-track-lab:fe-f']),
  ('enduro-route-lab.final', 'enduro-route-lab', 'Enduro Route Intelligence Lab: The Final Route Analysis', array['enduro-route-lab:fa-model','enduro-route-lab:fa-time','enduro-route-lab:fa-domain','enduro-route-lab:fa-ha','enduro-route-lab:fa-speed','enduro-route-lab:fb-num','enduro-route-lab:fb-restrict','enduro-route-lab:fb-ha','enduro-route-lab:fb-time','enduro-route-lab:fc-exact','enduro-route-lab:fc-dist','enduro-route-lab:fc-grade']),
  ('suspension-systems-lab.final', 'suspension-systems-lab', 'Suspension & Systems Lab: The Final Engineering Report', array['suspension-systems-lab:fa-model','suspension-systems-lab:fa-at','suspension-systems-lab:fa-cycle','suspension-systems-lab:fb-model','suspension-systems-lab:fb-at','suspension-systems-lab:fb-w','suspension-systems-lab:fb-linear','suspension-systems-lab:fc-exp','suspension-systems-lab:fc-n','suspension-systems-lab:fc-10db','suspension-systems-lab:fd-t','suspension-systems-lab:fd-why'])
on conflict (id) do nothing;

-- The Slope Lab's question ids carry their level (f = foundations, a =
-- application, c = challenge, t = transfer). Only fills blanks.
update public.questions set difficulty = case
    when id ~ '^slope-lab:f' then 'beginner' when id ~ '^slope-lab:c' then 'advanced' else 'intermediate' end
 where game_id = 'slope-lab' and difficulty is null;

-- Rider levels.
create table if not exists public.reward_levels (
  level       integer primary key check (level >= 1),
  title       text not null,
  xp_required integer not null check (xp_required >= 0)
);
insert into public.reward_levels (level, title, xp_required) values
  (1, 'New Rider', 0), (2, 'Trail Scout', 100), (3, 'Trail Rider', 250), (4, 'Trail Explorer', 500),
  (5, 'Trail Shredder', 850), (6, 'Trail Adventurer', 1300), (7, 'Trail Pro', 1900),
  (8, 'Trail Champion', 2600), (9, 'Trail Legend', 3500), (10, 'Mathlete Legend', 4600)
on conflict (level) do nothing;

-- Achievements. metric: what is counted (see reward_metrics()); threshold:
-- how much is needed. 'event' badges are awarded by a specific moment.
create table if not exists public.reward_achievements (
  id          text primary key,
  name        text not null,
  description text not null,
  category    text not null check (category in ('streak', 'problems', 'lessons', 'exploration', 'persistence')),
  metric      text not null,
  threshold   integer not null default 1,
  icon        text not null default 'badge',
  sort_order  integer not null default 100,
  active      boolean not null default true
);
insert into public.reward_achievements (id, name, description, category, metric, threshold, icon, sort_order) values
  ('first-lap',          'First Lap',           'Complete your first daily goal.',                      'streak', 'streak_best', 1,   'flame', 10),
  ('building-momentum',  'Building Momentum',   'Reach a 3-day streak.',                                'streak', 'streak_best', 3,   'flame', 11),
  ('trail-regular',      'Trail Regular',       'Reach a 7-day streak.',                                'streak', 'streak_best', 7,   'flame', 12),
  ('weekend-warrior',    'Weekend Warrior',     'Reach a 14-day streak.',                               'streak', 'streak_best', 14,  'flame', 13),
  ('mountain-machine',   'Mountain Machine',    'Reach a 30-day streak.',                               'streak', 'streak_best', 30,  'flame', 14),
  ('trail-master',       'Trail Master',        'Reach a 60-day streak.',                               'streak', 'streak_best', 60,  'flame', 15),
  ('legendary-rider',    'Legendary Rider',     'Reach a 100-day streak.',                              'streak', 'streak_best', 100, 'flame', 16),
  ('first-climb',        'First Climb',         'Solve your first problem.',                            'problems', 'problems', 1,   'peak', 20),
  ('problem-solver',     'Problem Solver',      'Solve 25 problems.',                                   'problems', 'problems', 25,  'peak', 21),
  ('mathlete',           'Mathlete',            'Solve 100 problems.',                                  'problems', 'problems', 100, 'peak', 22),
  ('math-machine',       'Math Machine',        'Solve 250 problems.',                                  'problems', 'problems', 250, 'peak', 23),
  ('mathematical-legend','Mathematical Legend', 'Solve 500 problems.',                                  'problems', 'problems', 500, 'peak', 24),
  ('first-lesson',       'First Lesson',        'Complete your first lesson.',                          'lessons', 'lessons', 1,   'book', 30),
  ('getting-after-it',   'Getting After It',    'Complete 10 lessons.',                                 'lessons', 'lessons', 10,  'book', 31),
  ('curriculum-explorer','Curriculum Explorer', 'Complete 25 lessons.',                                 'lessons', 'lessons', 25,  'book', 32),
  ('dedicated-student',  'Dedicated Student',   'Complete 50 lessons.',                                 'lessons', 'lessons', 50,  'book', 33),
  ('academic-shredder',  'Academic Shredder',   'Complete 100 lessons.',                                'lessons', 'lessons', 100, 'book', 34),
  ('trail-explorer-badge','Trail Explorer',     'Practise in three different units.',                   'exploration', 'units_practiced', 3, 'map', 40),
  ('course-conqueror',   'Course Conqueror',    'Solve a problem for every skill Mathlete covers in a unit.', 'exploration', 'units_completed', 1, 'map', 41),
  ('all-mountain-rider', 'All-Mountain Rider',  'Complete lessons or labs in three different courses.', 'exploration', 'courses', 3, 'map', 42),
  ('lab-rat',            'Lab Rat',             'Complete five interactive MTB labs.',                  'exploration', 'labs', 5, 'flask', 43),
  ('comeback-rider',     'Comeback Rider',      'Come back to practise after seven days away.',         'persistence', 'event', 1, 'arrow', 50),
  ('never-give-up',      'Never Give Up',       'Solve a challenge problem you’d missed before.',       'persistence', 'event', 1, 'arrow', 51),
  ('mastery-rider',      'Mastery Rider',       'Get 4 of your last 5 first tries right on a skill.',   'persistence', 'mastery', 1, 'star', 52),
  ('consistency-champion','Consistency Champion','Reach your daily goal on five days in one week.',     'persistence', 'week_goals', 5, 'calendar', 53)
on conflict (id) do nothing;

-- The Trail Garage: cosmetic items, unlocked by level (or a badge).
-- type: avatar | jersey | frame | background | title | badge | theme
create table if not exists public.reward_items (
  id                 text primary key,
  name               text not null,
  type               text not null check (type in ('avatar', 'jersey', 'frame', 'background', 'title', 'badge', 'theme')),
  description        text not null,
  unlock_level       integer,
  unlock_achievement text references public.reward_achievements (id),
  asset              jsonb not null default '{}',
  sort_order         integer not null default 100,
  active             boolean not null default true
);
insert into public.reward_items (id, name, type, description, unlock_level, unlock_achievement, asset, sort_order) values
  ('avatar-rider',     'Rider',               'avatar',     'Your starting rider.',                         1, null, '{"style": "rider"}', 1),
  ('jersey-moss',      'Moss jersey',         'jersey',     'The classic Mathlete green.',                  1, null, '{"color": "#8DBA74"}', 2),
  ('frame-basic',      'Rider frame',         'frame',      'A clean frame for your profile card.',         2, null, '{"style": "basic"}', 3),
  ('avatar-helmet',    'Full-face helmet',    'avatar',     'Your rider, ready for the descent.',           3, null, '{"style": "helmet"}', 4),
  ('bg-trail-map',     'Trail map',           'background', 'Contour lines behind your card.',              4, null, '{"style": "contours"}', 5),
  ('jersey-blaze',     'Blaze jersey',        'jersey',     'Trail-marker orange.',                         5, null, '{"color": "#E36A40"}', 6),
  ('jersey-chalk',     'Chalk jersey',        'jersey',     'Chalkboard blue.',                             5, null, '{"color": "#86B6D4"}', 7),
  ('title-line-chooser','Line Chooser',       'title',      'A rider title to show under your name.',       6, null, '{"text": "Line Chooser"}', 8),
  ('frame-pro',        'Pro frame',           'frame',      'A premium gold-edged frame.',                  7, null, '{"style": "pro"}', 9),
  ('badge-champion',   'Championship badge',  'badge',      'A championship plate for your card.',          8, null, '{"style": "champion"}', 10),
  ('bg-legendary',     'Legendary ridge',     'background', 'A mountain-range skyline at dusk.',            9, null, '{"style": "ridge"}', 11),
  ('theme-mathlete',   'Mathlete Legend theme','theme',     'The exclusive Mathlete Legend look.',         10, null, '{"style": "legend"}', 12),
  ('badge-streak-30',  'Thirty-day flame',    'badge',      'Earned with a 30-day streak.',              null, 'mountain-machine', '{"style": "flame"}', 13)
on conflict (id) do nothing;

-- Organizations can switch rewards off, set the default goal, and lock it.
create table if not exists public.reward_org_settings (
  organization_id   uuid primary key references public.organizations (id) on delete cascade,
  enabled           boolean not null default true,
  default_goal      text,
  allow_goal_change boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- 2. Student records ----------------------------------------------------------------
create table if not exists public.reward_profiles (
  user_id          uuid primary key references public.profiles (user_id) on delete cascade,
  organization_id  uuid,
  lifetime_xp      integer not null default 0 check (lifetime_xp >= 0),
  level            integer not null default 1,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_goal_date   date,
  last_active_date date,
  shields          integer not null default 0,
  goal             text not null default 'regular',
  pending_goal     text,
  pending_from     date,
  goal_changed_on  date,
  timezone         text not null default 'America/Denver',
  timezone_set     boolean not null default false,
  equipped         jsonb not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- The ledger: the authoritative record of every XP award.
create table if not exists public.reward_ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (user_id) on delete cascade,
  organization_id uuid,
  event_type      text not null check (event_type in ('problem', 'lesson', 'lab', 'assessment', 'daily_bonus')),
  source_id       text not null,
  xp              integer not null check (xp >= 0),
  qualifying_xp   integer not null check (qualifying_xp >= 0),
  local_date      date not null,
  awarded_at      timestamptz not null default now(),
  idempotency_key text not null,
  metadata        jsonb not null default '{}',
  unique (user_id, idempotency_key)
);
create index if not exists reward_ledger_user_time_idx on public.reward_ledger (user_id, awarded_at desc);
create index if not exists reward_ledger_user_date_idx on public.reward_ledger (user_id, local_date);

create table if not exists public.reward_days (
  user_id        uuid not null references public.profiles (user_id) on delete cascade,
  local_date     date not null,
  qualifying_xp  integer not null default 0,
  bonus_xp       integer not null default 0,
  problem_xp     integer not null default 0,
  goal_target    integer not null,
  goal_completed boolean not null default false,
  completed_at   timestamptz,
  shield_used    boolean not null default false,   -- a missed day covered by a Trail Shield
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (user_id, local_date)
);

create table if not exists public.reward_user_achievements (
  user_id        uuid not null references public.profiles (user_id) on delete cascade,
  achievement_id text not null references public.reward_achievements (id),
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create table if not exists public.reward_user_items (
  user_id     uuid not null references public.profiles (user_id) on delete cascade,
  item_id     text not null references public.reward_items (id),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
-- What to celebrate in the browser (+XP, goal reached, level up, badge…).
create table if not exists public.reward_notices (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (user_id) on delete cascade,
  kind       text not null,
  payload    jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists reward_notices_user_idx on public.reward_notices (user_id, id);

-- Row-level security: a student reads only their own rows; nobody writes
-- directly (everything goes through the functions below).
do $$
declare t text;
begin
  foreach t in array array['reward_profiles', 'reward_ledger', 'reward_days', 'reward_user_achievements', 'reward_user_items', 'reward_notices'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Students read their own rewards" on public.%I', t);
    execute format('create policy "Students read their own rewards" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
  foreach t in array array['reward_config', 'reward_activities', 'reward_assessments', 'reward_levels', 'reward_achievements', 'reward_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Signed-in people read reward rules" on public.%I', t);
    execute format('create policy "Signed-in people read reward rules" on public.%I for select to authenticated using (true)', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
alter table public.reward_org_settings enable row level security;
revoke all on public.reward_org_settings from anon, authenticated;

-- 3. Helpers -----------------------------------------------------------------------
create or replace function public.reward_level_for(p_xp integer)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(max(l.level), 1) from public.reward_levels l where l.xp_required <= p_xp;
$$;

create or replace function public.reward_goal_xp(p_goal text)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce((public.reward_cfg('goals') -> p_goal ->> 'xp')::integer,
                  (public.reward_cfg('goals') -> 'regular' ->> 'xp')::integer, 20);
$$;

create or replace function public.reward_notice(p_user uuid, p_kind text, p_payload jsonb, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not coalesce(p_quiet, false) then
    insert into public.reward_notices (user_id, kind, payload) values (p_user, p_kind, coalesce(p_payload, '{}'));
  end if;
end;
$$;

-- Make sure a student has a reward profile (and their starting shield/items).
create or replace function public.reward_ensure_profile(p_user uuid, p_org uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_goal text;
begin
  if exists (select 1 from public.reward_profiles r where r.user_id = p_user) then return; end if;
  if not exists (select 1 from public.profiles p where p.user_id = p_user) then return; end if;
  select s.default_goal into v_goal from public.reward_org_settings s where s.organization_id = p_org;
  v_goal := coalesce(v_goal, public.reward_cfg('default_goal') #>> '{}', 'regular');
  insert into public.reward_profiles (user_id, organization_id, goal, shields, timezone)
  values (p_user, p_org, v_goal, public.reward_cfg_int('shields_start', 1),
          coalesce(public.reward_cfg('default_timezone') #>> '{}', 'America/Denver'))
  on conflict (user_id) do nothing;
  insert into public.reward_user_items (user_id, item_id)
  select p_user, i.id from public.reward_items i where i.active and i.unlock_level = 1
  on conflict do nothing;
  update public.reward_profiles r
     set equipped = (select coalesce(jsonb_object_agg(i.type, i.id), '{}') from public.reward_items i
                     where i.active and i.unlock_level = 1)
   where r.user_id = p_user and r.equipped = '{}';
end;
$$;

-- Add XP (never negative), handle level-ups and level-unlocked items.
create or replace function public.reward_grant_xp(p_user uuid, p_xp integer, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old integer; v_new integer; v_xp integer; l record;
begin
  if coalesce(p_xp, 0) <= 0 then return; end if;
  update public.reward_profiles r set lifetime_xp = r.lifetime_xp + p_xp, updated_at = now()
   where r.user_id = p_user returning r.level, r.lifetime_xp into v_old, v_xp;
  v_new := public.reward_level_for(v_xp);
  if v_new > v_old then
    update public.reward_profiles r set level = v_new where r.user_id = p_user;
    for l in select * from public.reward_levels x where x.level > v_old and x.level <= v_new order by x.level loop
      perform public.reward_notice(p_user, 'level', jsonb_build_object('level', l.level, 'title', l.title,
        'items', (select coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name, 'type', i.type)), '[]')
                  from public.reward_items i where i.active and i.unlock_level = l.level)), p_quiet);
    end loop;
    insert into public.reward_user_items (user_id, item_id)
    select p_user, i.id from public.reward_items i where i.active and i.unlock_level <= v_new
    on conflict do nothing;
  end if;
end;
$$;

-- What each badge counts, for one student (also shown as progress).
create or replace function public.reward_metrics(p_user uuid, p_date date)
returns jsonb language sql stable security definer set search_path = '' as $$
  with solved as (
    select distinct l.metadata ->> 'question_id' as qid from public.reward_ledger l
     where l.user_id = p_user and l.event_type = 'problem'
  ),
  solved_skills as (
    select distinct cs.id skill_id, cs.unit_id from solved s
      join public.curriculum_question_skills qs on qs.question_id = s.qid
      join public.curriculum_skills cs on cs.id = qs.skill_id and cs.active
  ),
  coverable as (
    select distinct cs.id skill_id, cs.unit_id from public.curriculum_skills cs
      join public.curriculum_question_skills qs on qs.skill_id = cs.id
      join public.questions q on q.id = qs.question_id and q.active
     where cs.active and cs.unit_id is not null
  ),
  units_done as (
    select c.unit_id from coverable c left join solved_skills s on s.skill_id = c.skill_id
     group by c.unit_id having count(*) = count(s.skill_id)
  ),
  firsts as (
    select qs.skill_id, a.is_correct, row_number() over (partition by qs.skill_id order by a.created_at desc) rn
      from public.question_attempts a
      join public.curriculum_question_skills qs on qs.question_id = a.question_id
     where a.student_id = p_user and a.attempt_number = 1
  ),
  week as (
    select count(*) n from public.reward_days d
     where d.user_id = p_user and d.goal_completed
       and d.local_date >= p_date - ((extract(isodow from p_date)::int) - 1)
       and d.local_date <= p_date - ((extract(isodow from p_date)::int) - 1) + 6
  )
  select jsonb_build_object(
    'streak_best', coalesce((select r.longest_streak from public.reward_profiles r where r.user_id = p_user), 0),
    'problems',    (select count(*) from public.reward_ledger l where l.user_id = p_user and l.event_type = 'problem'),
    'lessons',     (select count(*) from public.reward_ledger l where l.user_id = p_user and l.event_type = 'lesson'),
    'labs',        (select count(*) from public.reward_ledger l where l.user_id = p_user and l.event_type = 'lab'),
    'units_practiced', (select count(distinct unit_id) from solved_skills where unit_id is not null),
    'units_completed', (select count(*) from units_done),
    'courses',     (select count(distinct a.course_id) from public.reward_ledger l
                      join public.reward_activities a on a.game_id = l.source_id
                     where l.user_id = p_user and l.event_type in ('lesson', 'lab') and a.course_id is not null),
    'mastery',     (select count(*) from (select f.skill_id from firsts f where f.rn <= 5 group by f.skill_id
                                          having count(*) >= 5 and count(*) filter (where f.is_correct) >= 4) m),
    'week_goals',  (select n from week)
  );
$$;

create or replace function public.reward_unlock(p_user uuid, p_achievement text, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.reward_achievements%rowtype;
begin
  select * into a from public.reward_achievements x where x.id = p_achievement and x.active;
  if not found then return; end if;
  insert into public.reward_user_achievements (user_id, achievement_id) values (p_user, p_achievement)
  on conflict do nothing;
  if found then
    perform public.reward_notice(p_user, 'achievement', jsonb_build_object('id', a.id, 'name', a.name, 'description', a.description, 'icon', a.icon, 'category', a.category), p_quiet);
    insert into public.reward_user_items (user_id, item_id)
    select p_user, i.id from public.reward_items i where i.active and i.unlock_achievement = p_achievement
    on conflict do nothing;
  end if;
end;
$$;

create or replace function public.reward_check_achievements(p_user uuid, p_date date, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare m jsonb := public.reward_metrics(p_user, p_date); a record;
begin
  for a in select x.* from public.reward_achievements x
            where x.active and x.metric <> 'event'
              and not exists (select 1 from public.reward_user_achievements u where u.user_id = p_user and u.achievement_id = x.id)
  loop
    if coalesce((m ->> a.metric)::integer, 0) >= a.threshold then
      perform public.reward_unlock(p_user, a.id, p_quiet);
    end if;
  end loop;
end;
$$;

-- The goal that applies on a given local day (a pending change starts then).
create or replace function public.reward_goal_on(p_user uuid, p_date date)
returns integer language plpgsql security definer set search_path = '' as $$
declare r public.reward_profiles%rowtype;
begin
  select * into r from public.reward_profiles x where x.user_id = p_user;
  if r.pending_goal is not null and p_date >= r.pending_from then
    update public.reward_profiles x set goal = r.pending_goal, pending_goal = null, pending_from = null where x.user_id = p_user;
    r.goal := r.pending_goal;
  end if;
  return public.reward_goal_xp(r.goal);
end;
$$;

-- A day's goal was just reached: extend (or restart) the streak, using a
-- Trail Shield automatically if exactly one day was missed.
drop function if exists public.reward_goal_reached(uuid, date, uuid, boolean);
create or replace function public.reward_goal_reached(p_user uuid, p_date date, p_org uuid, p_quiet boolean, p_at timestamptz default now())
returns void language plpgsql security definer set search_path = '' as $$
declare r public.reward_profiles%rowtype; v_streak integer; v_shielded boolean := false; v_every integer; v_bonus integer;
begin
  select * into r from public.reward_profiles x where x.user_id = p_user for update;
  if r.last_goal_date = p_date then return; end if;
  if r.last_goal_date = p_date - 1 then
    v_streak := r.current_streak + 1;
  elsif r.last_goal_date = p_date - 2 and r.shields > 0 and r.current_streak > 0 then
    v_streak := r.current_streak + 1;
    v_shielded := true;
    insert into public.reward_days (user_id, local_date, goal_target, shield_used)
    values (p_user, p_date - 1, public.reward_goal_xp(r.goal), true)
    on conflict (user_id, local_date) do update set shield_used = true, updated_at = now();
  else
    v_streak := 1;
  end if;
  update public.reward_profiles x
     set current_streak = v_streak,
         longest_streak = greatest(x.longest_streak, v_streak),
         last_goal_date = p_date,
         shields = x.shields - case when v_shielded then 1 else 0 end,
         updated_at = now()
   where x.user_id = p_user;
  if v_shielded then
    perform public.reward_notice(p_user, 'shield_used', jsonb_build_object('date', p_date - 1, 'streak', v_streak), p_quiet);
  end if;
  v_every := public.reward_cfg_int('shield_every', 7);
  if v_every > 0 and v_streak % v_every = 0 then
    update public.reward_profiles x set shields = least(public.reward_cfg_int('shields_max', 2), x.shields + 1)
     where x.user_id = p_user and x.shields < public.reward_cfg_int('shields_max', 2);
    if found then perform public.reward_notice(p_user, 'shield_earned', jsonb_build_object('streak', v_streak), p_quiet); end if;
  end if;
  -- The once-a-day bonus: lifetime XP, but not toward the goal.
  v_bonus := public.reward_cfg_int('xp_daily_bonus', 5);
  insert into public.reward_ledger (user_id, organization_id, event_type, source_id, xp, qualifying_xp, local_date, awarded_at, idempotency_key)
  values (p_user, p_org, 'daily_bonus', p_date::text, v_bonus, 0, p_date, coalesce(p_at, now()), 'daily_bonus:' || p_date::text)
  on conflict (user_id, idempotency_key) do nothing;
  if found then
    update public.reward_days d set bonus_xp = d.bonus_xp + v_bonus where d.user_id = p_user and d.local_date = p_date;
    perform public.reward_grant_xp(p_user, v_bonus, p_quiet);
  end if;
  perform public.reward_notice(p_user, 'goal', jsonb_build_object('date', p_date, 'streak', v_streak, 'bonus', v_bonus), p_quiet);
end;
$$;

-- 4. THE award function: every XP award goes through here ------------------
-- Returns the XP awarded, or -1 if this event was already rewarded.
create or replace function public.reward_award(
  p_user uuid, p_org uuid, p_type text, p_source text, p_xp integer,
  p_at timestamptz, p_meta jsonb, p_quiet boolean
)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  r       public.reward_profiles%rowtype;
  v_date  date;
  v_xp    integer := greatest(coalesce(p_xp, 0), 0);
  v_qual  boolean;
  v_day   public.reward_days%rowtype;
  v_cap   integer;
  v_target integer;
begin
  if p_user is null then return -1; end if;
  if p_org is not null and exists (select 1 from public.reward_org_settings s where s.organization_id = p_org and not s.enabled) then
    return -1;
  end if;
  perform public.reward_ensure_profile(p_user, p_org);
  select * into r from public.reward_profiles x where x.user_id = p_user for update;
  if not found then return -1; end if;
  v_date := (coalesce(p_at, now()) at time zone r.timezone)::date;
  v_qual := p_type in ('problem', 'lesson', 'lab')
            or (p_type = 'assessment' and coalesce((public.reward_cfg('assessment_qualifies') #>> '{}')::boolean, true));

  -- The day, created with the goal that applies to it.
  v_target := public.reward_goal_on(p_user, v_date);
  insert into public.reward_days (user_id, local_date, goal_target) values (p_user, v_date, v_target)
  on conflict (user_id, local_date) do nothing;
  select * into v_day from public.reward_days d where d.user_id = p_user and d.local_date = v_date for update;

  -- Daily ceiling on problem XP (anti-farming).
  if p_type = 'problem' then
    v_cap := public.reward_cfg_int('max_problem_xp_per_day', 250);
    v_xp := least(v_xp, greatest(v_cap - v_day.problem_xp, 0));
  end if;

  insert into public.reward_ledger (user_id, organization_id, event_type, source_id, xp, qualifying_xp, local_date, awarded_at, idempotency_key, metadata)
  values (p_user, p_org, p_type, p_source, v_xp, case when v_qual then v_xp else 0 end, v_date, coalesce(p_at, now()),
          p_type || ':' || p_source, coalesce(p_meta, '{}'))
  on conflict (user_id, idempotency_key) do nothing;
  if not found then return -1; end if;

  -- Coming back after a long break.
  if r.last_active_date is not null and v_date - r.last_active_date >= public.reward_cfg_int('comeback_days', 7) then
    perform public.reward_unlock(p_user, 'comeback-rider', p_quiet);
  end if;
  update public.reward_profiles x set last_active_date = greatest(coalesce(x.last_active_date, v_date), v_date) where x.user_id = p_user;

  update public.reward_days d
     set qualifying_xp = d.qualifying_xp + case when v_qual then v_xp else 0 end,
         problem_xp = d.problem_xp + case when p_type = 'problem' then v_xp else 0 end,
         updated_at = now()
   where d.user_id = p_user and d.local_date = v_date
   returning * into v_day;

  perform public.reward_grant_xp(p_user, v_xp, p_quiet);
  if v_xp > 0 then
    perform public.reward_notice(p_user, 'xp', jsonb_build_object('type', p_type, 'xp', v_xp, 'name', p_meta ->> 'name',
      'today', v_day.qualifying_xp, 'target', v_day.goal_target), p_quiet);
  end if;

  if not v_day.goal_completed and v_day.qualifying_xp >= v_day.goal_target then
    update public.reward_days d set goal_completed = true, completed_at = coalesce(p_at, now())
     where d.user_id = p_user and d.local_date = v_date;
    perform public.reward_goal_reached(p_user, v_date, p_org, p_quiet, coalesce(p_at, now()));
  end if;

  perform public.reward_check_achievements(p_user, v_date, p_quiet);
  return v_xp;
end;
$$;

-- 5. From learning events to awards ------------------------------------------------
-- A lab or lesson completion check (called after answers and after sessions end).
create or replace function public.reward_check_completion(p_user uuid, p_org uuid, p_game text, p_session uuid, p_at timestamptz, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.reward_activities%rowtype; v_ok boolean := false; v_n integer;
begin
  select * into a from public.reward_activities x where x.game_id = p_game and x.active;
  if not found then return; end if;
  if exists (select 1 from public.reward_ledger l where l.user_id = p_user and l.idempotency_key = a.kind || ':' || p_game) then return; end if;
  if a.completion = 'solved' then
    select count(distinct l.metadata ->> 'question_id') into v_n from public.reward_ledger l
     where l.user_id = p_user and l.event_type = 'problem' and l.metadata ->> 'game_id' = p_game;
    v_ok := v_n >= a.min_solved;
  else
    -- A finished session with real answers in it.
    v_ok := exists (select 1 from public.game_sessions s
                     where s.student_id = p_user and s.game_id = p_game and s.completed
                       and s.attempt_count >= a.min_attempts);
    if v_ok and a.min_questions > 0 then
      select count(distinct q.question_id) into v_n from public.question_attempts q where q.student_id = p_user and q.game_id = p_game;
      v_ok := v_n >= a.min_questions;
    end if;
  end if;
  if v_ok then
    perform public.reward_award(p_user, p_org, a.kind, p_game,
      public.reward_cfg_int(case when a.kind = 'lesson' then 'xp_lesson' else 'xp_lab' end, 10),
      p_at, jsonb_build_object('name', a.name, 'game_id', p_game), p_quiet);
  end if;
end;
$$;

-- One saved answer.
create or replace function public.reward_from_attempt(t public.question_attempts, p_quiet boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_diff text; v_xp integer; v_name text; x record;
begin
  if t.is_correct then
    -- First correct answer to this exact question (template + its numbers).
    if not exists (select 1 from public.question_attempts o
                    where o.student_id = t.student_id and o.question_id = t.question_id and o.question_hash = t.question_hash
                      and o.is_correct and o.id <> t.id and o.created_at <= t.created_at) then
      select q.difficulty, q.title into v_diff, v_name from public.questions q where q.id = t.question_id;
      v_xp := public.reward_cfg_int(case v_diff when 'beginner' then 'xp_beginner' when 'advanced' then 'xp_challenge' else 'xp_standard' end, 7);
      perform public.reward_award(t.student_id, t.organization_id, 'problem', t.question_id || ':' || t.question_hash, v_xp,
        t.created_at, jsonb_build_object('question_id', t.question_id, 'game_id', t.game_id, 'difficulty', coalesce(v_diff, 'standard'),
                                         'hints', t.hints_used, 'attempt', t.attempt_number), p_quiet);
      -- Never give up: a challenge problem solved after missing it.
      if v_diff = 'advanced' and t.attempt_number > 1 then
        perform public.reward_unlock(t.student_id, 'never-give-up', p_quiet);
      end if;
    end if;
  end if;
  -- Assessments this question belongs to: complete once every question is attempted.
  for x in select s.* from public.reward_assessments s where s.active and t.question_id = any (s.question_ids) loop
    if (select count(distinct q.question_id) from public.question_attempts q
         where q.student_id = t.student_id and q.question_id = any (x.question_ids)) = cardinality(x.question_ids) then
      perform public.reward_award(t.student_id, t.organization_id, 'assessment', x.id, public.reward_cfg_int('xp_assessment', 5),
        t.created_at, jsonb_build_object('name', x.name, 'game_id', x.game_id), p_quiet);
    end if;
  end loop;
  perform public.reward_check_completion(t.student_id, t.organization_id, t.game_id, t.game_session_id, t.created_at, p_quiet);
end;
$$;

create or replace function public.reward_attempt_trigger()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  begin
    perform public.reward_from_attempt(new, false);
  exception when others then
    raise warning 'rewards: attempt % not rewarded: %', new.id, sqlerrm;
  end;
  return null;
end;
$$;
drop trigger if exists reward_on_attempt on public.question_attempts;
create trigger reward_on_attempt after insert on public.question_attempts
  for each row execute function public.reward_attempt_trigger();

create or replace function public.reward_session_trigger()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.completed and not coalesce(old.completed, false) then
    begin
      perform public.reward_check_completion(new.student_id, new.organization_id, new.game_id, new.id, coalesce(new.ended_at, now()), false);
    exception when others then
      raise warning 'rewards: session % not rewarded: %', new.id, sqlerrm;
    end;
  end if;
  return null;
end;
$$;
drop trigger if exists reward_on_session on public.game_sessions;
create trigger reward_on_session after update of completed on public.game_sessions
  for each row execute function public.reward_session_trigger();

-- 6. What the student pages call --------------------------------------------------
-- The whole rewards picture for the signed-in student. p_timezone: the
-- browser's IANA timezone, adopted the first time (and when it changes;
-- past days keep the dates they were recorded on).
create or replace function public.rewards_summary(p_timezone text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  r public.reward_profiles%rowtype;
  v_today date; v_streak integer; v_state text; v_target integer; v_lvl record; v_next record;
  v_org uuid; v_allow boolean := true; v_week_start date;
begin
  if v_uid is null or not public.has_tool_access() then
    raise sqlstate 'PT403' using message = 'Sign in to see your rewards.';
  end if;
  if to_regprocedure('public.my_default_org()') is not null then v_org := public.my_default_org(); end if;
  perform public.reward_ensure_profile(v_uid, v_org);
  if p_timezone is not null and exists (select 1 from pg_catalog.pg_timezone_names z where z.name = p_timezone) then
    update public.reward_profiles x set timezone = p_timezone, timezone_set = true where x.user_id = v_uid and x.timezone <> p_timezone;
  end if;
  select * into r from public.reward_profiles x where x.user_id = v_uid;
  if not found then raise sqlstate 'PT403' using message = 'This account has no student profile.'; end if;
  v_today := (now() at time zone r.timezone)::date;
  v_target := public.reward_goal_on(v_uid, v_today);
  select * into r from public.reward_profiles x where x.user_id = v_uid;
  select coalesce(s.allow_goal_change, true) into v_allow from public.reward_org_settings s where s.organization_id = coalesce(r.organization_id, v_org);
  v_allow := coalesce(v_allow, true);

  -- The streak as it stands today: a missed day only "breaks" it once the
  -- day after it has also passed with no way to protect it.
  if r.last_goal_date >= v_today - 1 then v_streak := r.current_streak; v_state := case when r.last_goal_date = v_today then 'done' else 'alive' end;
  elsif r.last_goal_date = v_today - 2 and r.shields > 0 and r.current_streak > 0 then v_streak := r.current_streak; v_state := 'protectable';
  else v_streak := 0; v_state := case when r.longest_streak > 0 then 'reset' else 'new' end;
  end if;

  select * into v_lvl from public.reward_levels l where l.level = r.level;
  select * into v_next from public.reward_levels l where l.level = r.level + 1;
  v_week_start := v_today - ((extract(isodow from v_today)::int) - 1);

  return jsonb_build_object(
    'today', v_today, 'timezone', r.timezone,
    'xp', r.lifetime_xp,
    'level', jsonb_build_object('level', r.level, 'title', v_lvl.title, 'from', v_lvl.xp_required,
                                'next', case when v_next.level is null then null else jsonb_build_object('level', v_next.level, 'title', v_next.title, 'at', v_next.xp_required) end),
    'levels', (select jsonb_agg(jsonb_build_object('level', l.level, 'title', l.title, 'at', l.xp_required) order by l.level) from public.reward_levels l),
    'streak', jsonb_build_object('current', v_streak, 'longest', r.longest_streak, 'state', v_state, 'shields', r.shields,
                                 'shields_max', public.reward_cfg_int('shields_max', 2), 'shield_every', public.reward_cfg_int('shield_every', 7),
                                 'next_milestone', (select min(a.threshold) from public.reward_achievements a where a.active and a.metric = 'streak_best' and a.threshold > v_streak)),
    'goal', jsonb_build_object('id', r.goal, 'xp', v_target, 'pending', r.pending_goal, 'pending_from', r.pending_from,
                               'options', public.reward_cfg('goals'), 'can_change', v_allow and (r.goal_changed_on is null or v_today - r.goal_changed_on >= public.reward_cfg_int('goal_change_days', 7)),
                               'locked', not v_allow,
                               'next_change', case when r.goal_changed_on is null then null else r.goal_changed_on + public.reward_cfg_int('goal_change_days', 7) end),
    'day', (select jsonb_build_object('qualifying', coalesce(d.qualifying_xp, 0), 'bonus', coalesce(d.bonus_xp, 0), 'done', coalesce(d.goal_completed, false))
              from (select 1) one left join public.reward_days d on d.user_id = v_uid and d.local_date = v_today),
    'xp_today', (select coalesce(sum(l.xp), 0) from public.reward_ledger l where l.user_id = v_uid and l.local_date = v_today),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('date', d.local_date, 'xp', d.qualifying_xp, 'target', d.goal_target,
                                       'done', d.goal_completed, 'shield', d.shield_used) order by d.local_date), '[]')
               from public.reward_days d where d.user_id = v_uid and d.local_date >= least(v_week_start, date_trunc('month', v_today)::date - 7)),
    'week_start', v_week_start,
    'recent', (select coalesce(jsonb_agg(x order by x.at desc), '[]') from (
                 select jsonb_build_object('type', l.event_type, 'xp', l.xp, 'name', coalesce(l.metadata ->> 'name', q.title), 'at', l.awarded_at) x, l.awarded_at at
                   from public.reward_ledger l left join public.questions q on q.id = l.metadata ->> 'question_id'
                  where l.user_id = v_uid order by l.awarded_at desc limit 12) x),
    'achievements', (select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'description', a.description, 'category', a.category,
                                      'icon', a.icon, 'metric', a.metric, 'threshold', a.threshold, 'unlocked_at', u.unlocked_at) order by a.sort_order)
                       from public.reward_achievements a left join public.reward_user_achievements u on u.achievement_id = a.id and u.user_id = v_uid
                      where a.active),
    'metrics', public.reward_metrics(v_uid, v_today),
    'items', (select jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name, 'type', i.type, 'description', i.description,
                               'unlock_level', i.unlock_level, 'unlock_achievement', i.unlock_achievement, 'asset', i.asset,
                               'unlocked_at', u.unlocked_at) order by i.sort_order)
                from public.reward_items i left join public.reward_user_items u on u.item_id = i.id and u.user_id = v_uid where i.active),
    'equipped', r.equipped,
    'stats', jsonb_build_object(
      'problems', (select count(*) from public.reward_ledger l where l.user_id = v_uid and l.event_type = 'problem'),
      'lessons', (select count(*) from public.reward_ledger l where l.user_id = v_uid and l.event_type = 'lesson'),
      'labs', (select count(*) from public.reward_ledger l where l.user_id = v_uid and l.event_type = 'lab'),
      'assessments', (select count(*) from public.reward_ledger l where l.user_id = v_uid and l.event_type = 'assessment'),
      'goal_days', (select count(*) from public.reward_days d where d.user_id = v_uid and d.goal_completed)),
    'last_notice', (select coalesce(max(n.id), 0) from public.reward_notices n where n.user_id = v_uid)
  );
end;
$$;

-- New things to celebrate since the browser last looked (for toasts).
create or replace function public.rewards_feed(p_after bigint default 0)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'notices', coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'kind', n.kind, 'payload', n.payload, 'at', n.created_at) order by n.id)
                         from (select * from public.reward_notices x where x.user_id = auth.uid() and x.id > coalesce(p_after, 0)
                                 and x.created_at > now() - interval '1 day' order by x.id limit 20) n), '[]'),
    'last', (select coalesce(max(x.id), 0) from public.reward_notices x where x.user_id = auth.uid()),
    'xp', (select r.lifetime_xp from public.reward_profiles r where r.user_id = auth.uid()));
$$;

-- Choose a daily goal: applies from tomorrow, at most once a week.
create or replace function public.set_daily_goal(p_goal text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); r public.reward_profiles%rowtype; v_today date; v_allow boolean;
begin
  if v_uid is null or not public.has_tool_access() then raise sqlstate 'PT403' using message = 'Sign in first.'; end if;
  if public.reward_cfg('goals') -> p_goal is null then raise sqlstate 'PT422' using message = 'Unknown goal.'; end if;
  select * into r from public.reward_profiles x where x.user_id = v_uid for update;
  if not found then raise sqlstate 'PT422' using message = 'Open your rewards page first.'; end if;
  select s.allow_goal_change into v_allow from public.reward_org_settings s where s.organization_id = r.organization_id;
  if v_allow = false then raise sqlstate 'PT403' using message = 'Your school sets the daily goal.'; end if;
  v_today := (now() at time zone r.timezone)::date;
  if r.goal_changed_on is not null and v_today - r.goal_changed_on < public.reward_cfg_int('goal_change_days', 7) then
    raise sqlstate 'PT422' using message = 'You can change your goal again on ' || to_char(r.goal_changed_on + public.reward_cfg_int('goal_change_days', 7), 'Mon DD') || '.';
  end if;
  if p_goal = coalesce(r.pending_goal, r.goal) then return jsonb_build_object('goal', p_goal, 'from', r.pending_from); end if;
  -- A brand-new rider (no practice yet) can pick their goal for today.
  if r.last_active_date is null then
    update public.reward_profiles x set goal = p_goal, pending_goal = null, pending_from = null, goal_changed_on = v_today where x.user_id = v_uid;
    update public.reward_days d set goal_target = public.reward_goal_xp(p_goal) where d.user_id = v_uid and d.local_date = v_today and not d.goal_completed;
    return jsonb_build_object('goal', p_goal, 'from', v_today);
  end if;
  update public.reward_profiles x set pending_goal = p_goal, pending_from = v_today + 1, goal_changed_on = v_today where x.user_id = v_uid;
  return jsonb_build_object('goal', p_goal, 'from', v_today + 1);
end;
$$;

-- Wear (or take off) an unlocked item.
create or replace function public.equip_reward(p_item text, p_on boolean default true)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); i public.reward_items%rowtype; v jsonb;
begin
  if v_uid is null or not public.has_tool_access() then raise sqlstate 'PT403' using message = 'Sign in first.'; end if;
  select * into i from public.reward_items x where x.id = p_item and x.active;
  if not found then raise sqlstate 'PT422' using message = 'Unknown item.'; end if;
  if not exists (select 1 from public.reward_user_items u where u.user_id = v_uid and u.item_id = p_item) then
    raise sqlstate 'PT403' using message = 'You haven’t unlocked that yet.';
  end if;
  update public.reward_profiles x
     set equipped = case when coalesce(p_on, true) then x.equipped || jsonb_build_object(i.type, i.id)
                         when x.equipped ->> i.type = i.id then x.equipped - i.type else x.equipped end,
         updated_at = now()
   where x.user_id = v_uid returning x.equipped into v;
  return v;
end;
$$;

-- Lock everything down: internal functions for the server only.
revoke all on function public.reward_cfg(text), public.reward_cfg_int(text, integer), public.reward_level_for(integer), public.reward_goal_xp(text),
  public.reward_notice(uuid, text, jsonb, boolean), public.reward_ensure_profile(uuid, uuid), public.reward_grant_xp(uuid, integer, boolean),
  public.reward_metrics(uuid, date), public.reward_unlock(uuid, text, boolean), public.reward_check_achievements(uuid, date, boolean),
  public.reward_goal_on(uuid, date), public.reward_goal_reached(uuid, date, uuid, boolean, timestamptz),
  public.reward_award(uuid, uuid, text, text, integer, timestamptz, jsonb, boolean),
  public.reward_check_completion(uuid, uuid, text, uuid, timestamptz, boolean), public.reward_from_attempt(public.question_attempts, boolean),
  public.reward_attempt_trigger(), public.reward_session_trigger() from public, anon, authenticated;
revoke all on function public.rewards_summary(text), public.rewards_feed(bigint), public.set_daily_goal(text), public.equip_reward(text, boolean) from public, anon;
grant execute on function public.rewards_summary(text), public.rewards_feed(bigint), public.set_daily_goal(text), public.equip_reward(text, boolean) to authenticated;

-- 7. Existing history (runs once) ---------------------------------------------------
-- Replays every saved answer and finished session in time order, quietly
-- (no celebrations), so XP, days, streaks and badges match what students
-- have already done.
do $$
declare e record;
begin
  if exists (select 1 from public.reward_config c where c.key = 'history_replayed') then return; end if;
  for e in
    select 'a' kind, a.id, a.created_at at from public.question_attempts a
    union all
    select 's', s.id, coalesce(s.ended_at, s.last_activity_at) from public.game_sessions s where s.completed
    order by at, kind
  loop
    begin
      if e.kind = 'a' then
        perform public.reward_from_attempt(a, true) from public.question_attempts a where a.id = e.id;
      else
        perform public.reward_check_completion(s.student_id, s.organization_id, s.game_id, s.id, e.at, true) from public.game_sessions s where s.id = e.id;
      end if;
    exception when others then
      raise warning 'rewards history: % % skipped: %', e.kind, e.id, sqlerrm;
    end;
  end loop;
  insert into public.reward_config (key, value, note) values ('history_replayed', to_jsonb(now()::text), 'Existing history was turned into XP on this date.');
end $$;
