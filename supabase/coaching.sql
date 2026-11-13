-- ============================================================
-- Mathlete MTB: MTB Coaching (run in Supabase -> SQL Editor, AFTER
-- supabase/setup.sql and supabase/progress.sql). Safe to re-run: every
-- statement is idempotent.
--
-- MTB Coaching is a separate module from Academics. It shares accounts
-- (auth, members, profiles) and nothing else:
--   * coaches          - who coaches, and what they specialise in.
--   * athlete_coaches  - which coach works with which rider. This is NOT
--                        student_tutors: a tutor sees nothing here, and a
--                        coach sees nothing in the academic tables.
--   * riding_areas     - the riding areas goals, plans, logs and coach
--                        specialties are tagged with.
--   * athlete_goals,
--     athlete_goal_steps - a rider's goals (big goal down to this week)
--                        and the steps toward each.
--   * training_items   - the training plan: things to practise, set by
--                        the rider or their coach.
--   * training_logs    - the ride / practice log, with short reflections.
--
-- Who can see what is decided HERE:
--   * a rider (student account) sees and changes their own records;
--   * a coach sees and changes records of riders actively assigned to
--     them (scripts/admin.mjs coach-assign);
--   * an admin sees every rider's records;
--   * nobody writes to these tables directly: every change goes through
--     the functions below, which check who is asking.
-- Everything also requires has_tool_access(), like the rest of the site.
-- ============================================================

-- 1. Coach role ------------------------------------------------------
-- A coach-only account gets the 'coach' role. Someone who tutors and
-- coaches keeps the 'tutor' role and also gets a coaches row.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('student', 'tutor', 'parent', 'admin', 'coach'));

-- 2. Riding areas -----------------------------------------------------
create table if not exists public.riding_areas (
  id         text primary key check (id ~ '^[a-z][a-z0-9_]{1,30}$'),
  name       text not null,
  sort_order integer not null default 0,
  active     boolean not null default true
);
insert into public.riding_areas (id, name, sort_order) values
  ('fundamentals', 'Bike handling & fundamentals', 10),
  ('cornering',    'Cornering',                    20),
  ('technical',    'Technical terrain',            30),
  ('jumping',      'Jumping',                      40),
  ('tricks',       'Tricks',                       50),
  ('downhill',     'Downhill speed',               60),
  ('racing',       'Race craft',                   70),
  ('fitness',      'Fitness & strength',           80),
  ('mindset',      'Confidence & mindset',         90)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

alter table public.riding_areas enable row level security;
drop policy if exists "Members read riding areas" on public.riding_areas;
create policy "Members read riding areas" on public.riding_areas
  for select to authenticated using ((select public.has_tool_access()));
revoke all on public.riding_areas from anon, authenticated;
grant select on public.riding_areas to authenticated;

-- True when every id in p_ids is an active riding area.
create or replace function public.riding_areas_valid(p_ids text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(bool_and(exists (select 1 from public.riding_areas a where a.id = x and a.active)), true)
  from unnest(coalesce(p_ids, '{}'::text[])) x;
$$;
revoke all on function public.riding_areas_valid(text[]) from public, anon, authenticated;

-- 3. Coaches and their riders ---------------------------------------
create table if not exists public.coaches (
  user_id     uuid primary key references public.profiles (user_id) on delete cascade,
  specialties text[] not null default '{}',
  bio         text check (bio is null or char_length(bio) <= 400),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.athlete_coaches (
  athlete_id uuid not null references public.profiles (user_id) on delete cascade,
  coach_id   uuid not null references public.coaches (user_id) on delete cascade,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (athlete_id, coach_id),
  check (athlete_id <> coach_id)
);
create index if not exists athlete_coaches_coach_idx on public.athlete_coaches (coach_id) where active;

create or replace function public.coaches_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = new.user_id and p.role in ('coach', 'tutor', 'admin')) then
    raise exception 'A coach must be an account with the coach, tutor or admin role.';
  end if;
  if not public.riding_areas_valid(new.specialties) then
    raise exception 'Unknown specialty. Use riding area ids: %', (select string_agg(a.id, ', ' order by a.sort_order) from public.riding_areas a);
  end if;
  return new;
end;
$$;
revoke all on function public.coaches_check() from public;
drop trigger if exists coaches_check on public.coaches;
create trigger coaches_check before insert or update on public.coaches
  for each row execute function public.coaches_check();

create or replace function public.athlete_coaches_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles p where p.user_id = new.athlete_id and p.role = 'student') then
    raise exception 'athlete_id must be an account with the student role.';
  end if;
  return new;
end;
$$;
revoke all on function public.athlete_coaches_check() from public;
drop trigger if exists athlete_coaches_check on public.athlete_coaches;
create trigger athlete_coaches_check before insert or update on public.athlete_coaches
  for each row execute function public.athlete_coaches_check();

-- Riders the signed-in coach is assigned to (every student, for an admin).
create or replace function public.my_athlete_ids()
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
      or exists (
        select 1 from public.athlete_coaches ac
        join public.coaches c on c.user_id = ac.coach_id and c.active
        where ac.coach_id = me.user_id and ac.athlete_id = s.user_id and ac.active)
    );
$$;

-- Coaches actively assigned to the signed-in rider.
create or replace function public.my_coach_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ac.coach_id
  from public.athlete_coaches ac
  join public.coaches c on c.user_id = ac.coach_id and c.active
  where ac.athlete_id = auth.uid() and ac.active and public.has_tool_access();
$$;

revoke all on function public.my_athlete_ids() from public, anon;
revoke all on function public.my_coach_ids() from public, anon;
grant execute on function public.my_athlete_ids() to authenticated;
grant execute on function public.my_coach_ids() to authenticated;

-- How the signed-in person relates to a rider's coaching records:
-- 'athlete' (their own), 'coach', 'admin', or null (no access).
create or replace function public.coaching_access(p_athlete uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null or p_athlete is null or not public.has_tool_access() then null
    when p_athlete = auth.uid() then
      case when (select p.role from public.profiles p where p.user_id = auth.uid()) = 'student' then 'athlete' end
    when p_athlete in (select public.my_athlete_ids()) then
      case when public.my_role() = 'admin' then 'admin' else 'coach' end
  end;
$$;
revoke all on function public.coaching_access(uuid) from public, anon, authenticated;

alter table public.coaches enable row level security;
alter table public.athlete_coaches enable row level security;

-- Riders see their coaches' names, and coaches their riders'. (This adds
-- to the academic profiles policy; policies are combined with OR.)
drop policy if exists "My riders, my coaches" on public.profiles;
create policy "My riders, my coaches" on public.profiles
  for select to authenticated
  using ((select public.has_tool_access())
         and (user_id in (select public.my_athlete_ids()) or user_id in (select public.my_coach_ids())));

drop policy if exists "Own coach row, my coaches" on public.coaches;
create policy "Own coach row, my coaches" on public.coaches
  for select to authenticated
  using ((select public.has_tool_access())
         and (user_id = (select auth.uid()) or user_id in (select public.my_coach_ids()) or (select public.my_role()) = 'admin'));

drop policy if exists "Own coach links" on public.athlete_coaches;
create policy "Own coach links" on public.athlete_coaches
  for select to authenticated
  using ((select public.has_tool_access())
         and (athlete_id = (select auth.uid())
              or (coach_id = (select auth.uid()) and athlete_id in (select public.my_athlete_ids()))
              or (select public.my_role()) = 'admin'));

revoke all on public.coaches from anon, authenticated;
revoke all on public.athlete_coaches from anon, authenticated;
grant select on public.coaches to authenticated;
grant select on public.athlete_coaches to authenticated;

-- 4. Goals --------------------------------------------------------------
-- horizon: 'dream' (a big, long-term goal), 'quarter' (next 3 months),
-- 'month', 'week'. A goal can support a bigger one (parent_id).
-- Riders own their goals; their coach can help shape them, so both may
-- change any of the rider's goals. Nothing here is ever marked achieved
-- automatically.
create table if not exists public.athlete_goals (
  id              uuid primary key default gen_random_uuid(),
  athlete_id      uuid not null references public.profiles (user_id) on delete cascade,
  parent_id       uuid references public.athlete_goals (id) on delete set null,
  horizon         text not null check (horizon in ('dream', 'quarter', 'month', 'week')),
  area_id         text references public.riding_areas (id),
  title           text not null check (char_length(btrim(title)) between 1 and 140),
  why             text check (why is null or char_length(why) <= 600),
  starting_point  text check (starting_point is null or char_length(starting_point) <= 600),
  target_outcome  text check (target_outcome is null or char_length(target_outcome) <= 600),
  target_date     date,
  status          text not null default 'active' check (status in ('active', 'achieved', 'paused', 'archived')),
  achieved_at     timestamptz,
  created_by      uuid references public.profiles (user_id) on delete set null,
  created_by_role text not null default 'athlete' check (created_by_role in ('athlete', 'coach', 'admin')),
  updated_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);
create index if not exists athlete_goals_athlete_idx on public.athlete_goals (athlete_id, status, created_at desc);

-- Milestones and next actions: short steps with a tick.
create table if not exists public.athlete_goal_steps (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.athlete_goals (id) on delete cascade,
  athlete_id uuid not null references public.profiles (user_id) on delete cascade,
  title      text not null check (char_length(btrim(title)) between 1 and 140),
  sort_order integer not null default 0,
  done_at    timestamptz,
  done_by    uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists athlete_goal_steps_goal_idx on public.athlete_goal_steps (goal_id, sort_order, created_at);

-- 5. Training plan and log --------------------------------------------
-- A plan item is something to practise, optionally for a goal. It is
-- done when the rider logs it sessions_target times, or ticks it off.
create table if not exists public.training_items (
  id              uuid primary key default gen_random_uuid(),
  athlete_id      uuid not null references public.profiles (user_id) on delete cascade,
  goal_id         uuid references public.athlete_goals (id) on delete set null,
  area_id         text references public.riding_areas (id),
  title           text not null check (char_length(btrim(title)) between 1 and 140),
  details         text check (details is null or char_length(details) <= 1000),
  sessions_target integer not null default 1 check (sessions_target between 1 and 14),
  due_on          date,
  status          text not null default 'planned' check (status in ('planned', 'done', 'skipped', 'archived')),
  done_at         timestamptz,
  created_by      uuid references public.profiles (user_id) on delete set null,
  created_by_role text not null default 'athlete' check (created_by_role in ('athlete', 'coach', 'admin')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists training_items_athlete_idx on public.training_items (athlete_id, status, created_at desc);

create table if not exists public.training_logs (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles (user_id) on delete cascade,
  rode_on     date not null,
  riding_type text not null check (riding_type in ('trail', 'bike_park', 'pump_track', 'dirt_jumps', 'skills', 'race', 'other')),
  location    text check (location is null or char_length(location) <= 80),
  minutes     integer check (minutes is null or minutes between 1 and 720),
  area_ids    text[] not null default '{}',
  item_id     uuid references public.training_items (id) on delete set null,
  goal_id     uuid references public.athlete_goals (id) on delete set null,
  practiced   text check (practiced is null or char_length(practiced) <= 1000),
  improved    text check (improved is null or char_length(improved) <= 500),
  challenge   text check (challenge is null or char_length(challenge) <= 500),
  next_time   text check (next_time is null or char_length(next_time) <= 500),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists training_logs_athlete_idx on public.training_logs (athlete_id, rode_on desc, created_at desc);
create index if not exists training_logs_item_idx on public.training_logs (item_id) where item_id is not null;

-- Read access: the rider, their coaches, admins. No direct writes.
alter table public.athlete_goals enable row level security;
alter table public.athlete_goal_steps enable row level security;
alter table public.training_items enable row level security;
alter table public.training_logs enable row level security;

drop policy if exists "Own or coached rider's goals" on public.athlete_goals;
create policy "Own or coached rider's goals" on public.athlete_goals for select to authenticated
  using ((select public.has_tool_access()) and (athlete_id = (select auth.uid()) or athlete_id in (select public.my_athlete_ids())));
drop policy if exists "Own or coached rider's goal steps" on public.athlete_goal_steps;
create policy "Own or coached rider's goal steps" on public.athlete_goal_steps for select to authenticated
  using ((select public.has_tool_access()) and (athlete_id = (select auth.uid()) or athlete_id in (select public.my_athlete_ids())));
drop policy if exists "Own or coached rider's plan" on public.training_items;
create policy "Own or coached rider's plan" on public.training_items for select to authenticated
  using ((select public.has_tool_access()) and (athlete_id = (select auth.uid()) or athlete_id in (select public.my_athlete_ids())));
drop policy if exists "Own or coached rider's log" on public.training_logs;
create policy "Own or coached rider's log" on public.training_logs for select to authenticated
  using ((select public.has_tool_access()) and (athlete_id = (select auth.uid()) or athlete_id in (select public.my_athlete_ids())));

revoke all on public.athlete_goals, public.athlete_goal_steps, public.training_items, public.training_logs from anon, authenticated;
grant select on public.athlete_goals, public.athlete_goal_steps, public.training_items, public.training_logs to authenticated;

-- 6. Reading: one call per page ----------------------------------------

-- The rider's local "today" (same time zone as the academic numbers).
create or replace function public.coaching_today()
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone coalesce(
    (select s.value #>> '{}' from public.progress_settings s where s.key = 'timezone'), 'America/Denver'))::date;
$$;
revoke all on function public.coaching_today() from public, anon, authenticated;

-- One log entry as the pages show it.
create or replace function public.training_log_json(l public.training_logs)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', l.id, 'rode_on', l.rode_on, 'riding_type', l.riding_type, 'location', l.location, 'minutes', l.minutes,
    'area_ids', to_jsonb(l.area_ids),
    'areas', coalesce((select jsonb_agg(a.name order by a.sort_order) from public.riding_areas a where a.id = any (l.area_ids)), '[]'::jsonb),
    'item_id', l.item_id, 'item_title', (select i.title from public.training_items i where i.id = l.item_id),
    'goal_id', l.goal_id, 'goal_title', (select g.title from public.athlete_goals g where g.id = l.goal_id),
    'practiced', l.practiced, 'improved', l.improved, 'challenge', l.challenge, 'next_time', l.next_time,
    'created_at', l.created_at);
$$;
revoke all on function public.training_log_json(public.training_logs) from public, anon, authenticated;

-- Everything the three coaching pages show, for the signed-in rider (no
-- argument) or for a rider the signed-in coach is assigned to.
create or replace function public.coaching_home(p_athlete uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_aid   uuid := coalesce(p_athlete, auth.uid());
  v_who   text;
  v_today date;
  v_week  date;
  v_goals jsonb;
  v_plan  jsonb;
  v_logs  jsonb;
begin
  v_who := public.coaching_access(v_aid);
  if v_who is null then
    if v_uid is not null and v_aid = v_uid and public.has_tool_access() then
      raise sqlstate 'PT422' using message = 'MTB Coaching is for rider (student) accounts.';
    end if;
    raise sqlstate 'PT403' using message = 'You do not have access to that rider.';
  end if;
  v_today := public.coaching_today();
  v_week := date_trunc('week', v_today)::date;   -- Monday

  select coalesce(jsonb_agg(x.j order by x.h, x.st, x.created_at desc), '[]'::jsonb) into v_goals
  from (
    select g.created_at,
           array_position(array['dream', 'quarter', 'month', 'week'], g.horizon) h,
           case g.status when 'active' then 0 when 'paused' then 1 else 2 end st,
           jsonb_build_object(
             'id', g.id, 'parent_id', g.parent_id, 'horizon', g.horizon,
             'area_id', g.area_id, 'area_name', (select a.name from public.riding_areas a where a.id = g.area_id),
             'title', g.title, 'why', g.why, 'starting_point', g.starting_point, 'target_outcome', g.target_outcome,
             'target_date', g.target_date, 'status', g.status, 'achieved_at', g.achieved_at,
             'past_due', g.status = 'active' and g.target_date is not null and g.target_date < v_today,
             'set_by', case when g.created_by = v_aid then 'athlete' else g.created_by_role end,
             'set_by_name', (select p.display_name from public.profiles p where p.user_id = g.created_by and g.created_by <> v_aid),
             'steps', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'title', s.title, 'done_at', s.done_at) order by s.sort_order, s.created_at)
                                from public.athlete_goal_steps s where s.goal_id = g.id), '[]'::jsonb),
             'rides', (select count(*) from public.training_logs l where l.goal_id = g.id),
             'last_ride', (select max(l.rode_on) from public.training_logs l where l.goal_id = g.id),
             'created_at', g.created_at) j
    from public.athlete_goals g
    where g.athlete_id = v_aid
      and (g.status in ('active', 'paused') or (g.status = 'achieved' and g.achieved_at > now() - interval '180 days'))
    limit 80
  ) x;

  select coalesce(jsonb_agg(x.j order by x.st, x.due nulls last, x.created_at), '[]'::jsonb) into v_plan
  from (
    select i.created_at, i.due_on due, case i.status when 'planned' then 0 else 1 end st,
           jsonb_build_object(
             'id', i.id, 'title', i.title, 'details', i.details,
             'goal_id', i.goal_id, 'goal_title', (select g.title from public.athlete_goals g where g.id = i.goal_id),
             'area_id', i.area_id, 'area_name', (select a.name from public.riding_areas a where a.id = i.area_id),
             'sessions_target', i.sessions_target,
             'sessions_done', (select count(*) from public.training_logs l where l.item_id = i.id),
             'due_on', i.due_on, 'status', i.status, 'done_at', i.done_at,
             'past_due', i.status = 'planned' and i.due_on is not null and i.due_on < v_today,
             'set_by', case when i.created_by = v_aid then 'athlete' else i.created_by_role end,
             'set_by_name', (select p.display_name from public.profiles p where p.user_id = i.created_by and i.created_by <> v_aid),
             'can_edit', i.status = 'planned' and (v_who <> 'athlete' or i.created_by = v_uid),
             'created_at', i.created_at) j
    from public.training_items i
    where i.athlete_id = v_aid
      and (i.status = 'planned' or (i.status in ('done', 'skipped') and coalesce(i.done_at, i.updated_at) > now() - interval '30 days'))
    limit 80
  ) x;

  select coalesce(jsonb_agg(public.training_log_json(l) order by l.rode_on desc, l.created_at desc), '[]'::jsonb) into v_logs
  from public.training_logs l
  where l.id in (select t.id from public.training_logs t where t.athlete_id = v_aid order by t.rode_on desc, t.created_at desc limit 10);

  return jsonb_build_object(
    'athlete', (select jsonb_build_object('id', p.user_id, 'display_name', p.display_name) from public.profiles p where p.user_id = v_aid),
    'viewer', v_who,
    'coaches', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', c.user_id, 'name', p.display_name, 'bio', c.bio,
               'specialties', coalesce((select jsonb_agg(a.name order by a.sort_order) from public.riding_areas a where a.id = any (c.specialties)), '[]'::jsonb))
             order by ac.created_at)
      from public.athlete_coaches ac
      join public.coaches c on c.user_id = ac.coach_id and c.active
      join public.profiles p on p.user_id = c.user_id
      where ac.athlete_id = v_aid and ac.active), '[]'::jsonb),
    'areas', (select coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name) order by a.sort_order), '[]'::jsonb)
              from public.riding_areas a where a.active),
    'goals', v_goals,
    'plan', v_plan,
    'logs', v_logs,
    'log_count', (select count(*) from public.training_logs l where l.athlete_id = v_aid),
    'week', jsonb_build_object(
      'start', v_week,
      'rides', (select count(*) from public.training_logs l where l.athlete_id = v_aid and l.rode_on >= v_week),
      'minutes', (select coalesce(sum(l.minutes), 0) from public.training_logs l where l.athlete_id = v_aid and l.rode_on >= v_week),
      'last_week_rides', (select count(*) from public.training_logs l where l.athlete_id = v_aid and l.rode_on >= v_week - 7 and l.rode_on < v_week)),
    'today', v_today,
    'generated_at', now());
end;
$$;

-- The log, 25 entries at a time, newest first.
create or replace function public.coaching_logs(p_athlete uuid default null, p_offset integer default 0)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_aid uuid := coalesce(p_athlete, auth.uid());
  v_out jsonb;
  v_n   integer;
begin
  if public.coaching_access(v_aid) is null then
    raise sqlstate 'PT403' using message = 'You do not have access to that rider.';
  end if;
  select coalesce(jsonb_agg(public.training_log_json(l) order by l.rode_on desc, l.created_at desc), '[]'::jsonb), count(*) into v_out, v_n
  from public.training_logs l
  where l.id in (select t.id from public.training_logs t where t.athlete_id = v_aid
                 order by t.rode_on desc, t.created_at desc offset greatest(coalesce(p_offset, 0), 0) limit 26);
  if v_n > 25 then v_out := v_out - 25; end if;
  return jsonb_build_object('logs', v_out, 'has_more', v_n > 25);
end;
$$;

-- 7. Changing goals -----------------------------------------------------

-- Create a goal (p_goal_id null) or change one.
create or replace function public.save_athlete_goal(
  p_title          text,
  p_horizon        text,
  p_area_id        text default null,
  p_why            text default null,
  p_starting_point text default null,
  p_target_outcome text default null,
  p_target_date    date default null,
  p_parent_id      uuid default null,
  p_athlete        uuid default null,
  p_goal_id        uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_aid  uuid := coalesce(p_athlete, auth.uid());
  v_who  text;
  v_goal public.athlete_goals%rowtype;
  v_id   uuid;
begin
  if p_goal_id is not null then
    select * into v_goal from public.athlete_goals g where g.id = p_goal_id for update;
    if not found then raise sqlstate 'PT404' using message = 'No such goal.'; end if;
    v_aid := v_goal.athlete_id;
  end if;
  v_who := public.coaching_access(v_aid);
  if v_who is null then
    if p_goal_id is not null then raise sqlstate 'PT404' using message = 'No such goal.'; end if;
    raise sqlstate 'PT403' using message = 'You can set goals for yourself or a rider you coach.';
  end if;
  if p_goal_id is not null and v_goal.status = 'archived' then
    raise sqlstate 'PT422' using message = 'That goal was removed.';
  end if;

  p_title := btrim(coalesce(p_title, ''));
  if char_length(p_title) not between 1 and 140 then
    raise sqlstate 'PT422' using message = 'Give the goal a short title (up to 140 characters).';
  end if;
  if p_horizon is null or p_horizon not in ('dream', 'quarter', 'month', 'week') then
    raise sqlstate 'PT422' using message = 'Pick how far ahead this goal is.';
  end if;
  if p_area_id is not null and not public.riding_areas_valid(array[p_area_id]) then
    raise sqlstate 'PT422' using message = 'Unknown riding area.';
  end if;
  p_why := nullif(btrim(coalesce(p_why, '')), '');
  p_starting_point := nullif(btrim(coalesce(p_starting_point, '')), '');
  p_target_outcome := nullif(btrim(coalesce(p_target_outcome, '')), '');
  if char_length(p_why) > 600 or char_length(p_starting_point) > 600 or char_length(p_target_outcome) > 600 then
    raise sqlstate 'PT422' using message = 'Keep each answer under 600 characters.';
  end if;
  -- (an unchanged date may stay in the past when editing)
  if p_target_date is not null and p_target_date is distinct from v_goal.target_date and (p_target_date < public.coaching_today() - 1 or p_target_date > public.coaching_today() + 3660) then
    raise sqlstate 'PT422' using message = 'Pick a target date from today on (up to ten years ahead).';
  end if;
  if p_parent_id is not null then
    if not exists (select 1 from public.athlete_goals g where g.id = p_parent_id and g.athlete_id = v_aid and g.status <> 'archived') then
      raise sqlstate 'PT422' using message = 'The bigger goal must be one of this rider''s goals.';
    end if;
    -- no loops: the new parent may not be this goal or sit underneath it
    if p_goal_id is not null and exists (
         with recursive up(id, parent_id) as (
           select g.id, g.parent_id from public.athlete_goals g where g.id = p_parent_id
           union all
           select g.id, g.parent_id from public.athlete_goals g join up on g.id = up.parent_id)
         select 1 from up where up.id = p_goal_id) then
      raise sqlstate 'PT422' using message = 'A goal cannot support itself.';
    end if;
  end if;

  if p_goal_id is not null then
    update public.athlete_goals g
       set title = p_title, horizon = p_horizon, area_id = p_area_id, why = p_why, starting_point = p_starting_point,
           target_outcome = p_target_outcome, target_date = p_target_date, parent_id = p_parent_id,
           updated_by = v_uid, updated_at = now()
     where g.id = p_goal_id;
    return p_goal_id;
  end if;

  if (select count(*) from public.athlete_goals g where g.athlete_id = v_aid and g.status in ('active', 'paused')) >= 20 then
    raise sqlstate 'PT422' using message = 'That is a lot of goals. Finish, pause or remove one first (20 at most).';
  end if;
  insert into public.athlete_goals (athlete_id, parent_id, horizon, area_id, title, why, starting_point, target_outcome,
                                    target_date, created_by, created_by_role, updated_by)
  values (v_aid, p_parent_id, p_horizon, p_area_id, p_title, p_why, p_starting_point, p_target_outcome,
          p_target_date, v_uid, v_who, v_uid)
  returning id into v_id;
  return v_id;
end;
$$;

-- active / achieved / paused / archived (removed). Rider or coach.
create or replace function public.set_athlete_goal_status(p_goal_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_goal public.athlete_goals%rowtype;
begin
  if p_status is null or p_status not in ('active', 'achieved', 'paused', 'archived') then
    raise sqlstate 'PT422' using message = 'Unknown status.';
  end if;
  select * into v_goal from public.athlete_goals g where g.id = p_goal_id for update;
  if not found or public.coaching_access(v_goal.athlete_id) is null then
    raise sqlstate 'PT404' using message = 'No such goal.';
  end if;
  update public.athlete_goals g
     set status = p_status, updated_by = auth.uid(), updated_at = now(),
         achieved_at = case when p_status = 'achieved' then coalesce(g.achieved_at, now()) when p_status = 'active' then null else g.achieved_at end
   where g.id = p_goal_id;
  return p_status;
end;
$$;

-- Add a step to a goal (p_step_id null) or rename one.
create or replace function public.save_goal_step(p_goal_id uuid, p_title text, p_step_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_goal public.athlete_goals%rowtype;
  v_id   uuid;
begin
  select * into v_goal from public.athlete_goals g where g.id = p_goal_id;
  if not found or public.coaching_access(v_goal.athlete_id) is null then
    raise sqlstate 'PT404' using message = 'No such goal.';
  end if;
  p_title := btrim(coalesce(p_title, ''));
  if char_length(p_title) not between 1 and 140 then
    raise sqlstate 'PT422' using message = 'Write the step in a few words (up to 140 characters).';
  end if;
  if p_step_id is not null then
    update public.athlete_goal_steps s set title = p_title where s.id = p_step_id and s.goal_id = p_goal_id returning s.id into v_id;
    if v_id is null then raise sqlstate 'PT404' using message = 'No such step.'; end if;
    return v_id;
  end if;
  if (select count(*) from public.athlete_goal_steps s where s.goal_id = p_goal_id) >= 20 then
    raise sqlstate 'PT422' using message = 'A goal can have 20 steps at most.';
  end if;
  insert into public.athlete_goal_steps (goal_id, athlete_id, title, sort_order, created_by)
  values (p_goal_id, v_goal.athlete_id, p_title,
          coalesce((select max(s.sort_order) from public.athlete_goal_steps s where s.goal_id = p_goal_id), 0) + 1, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

-- Tick a step (p_done true), untick it, or remove it (p_done null).
create or replace function public.set_goal_step(p_step_id uuid, p_done boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_step public.athlete_goal_steps%rowtype;
begin
  select * into v_step from public.athlete_goal_steps s where s.id = p_step_id;
  if not found or public.coaching_access(v_step.athlete_id) is null then
    raise sqlstate 'PT404' using message = 'No such step.';
  end if;
  if p_done is null then
    delete from public.athlete_goal_steps s where s.id = p_step_id;
    return null;
  end if;
  update public.athlete_goal_steps s
     set done_at = case when p_done then coalesce(s.done_at, now()) end,
         done_by = case when p_done then coalesce(s.done_by, auth.uid()) end
   where s.id = p_step_id;
  return p_done;
end;
$$;

-- 8. Changing the plan and the log ---------------------------------------

-- Add a plan item (p_item_id null) or change one. A rider can change the
-- items they added; items from their coach are the coach's to change.
create or replace function public.save_training_item(
  p_title           text,
  p_details         text default null,
  p_goal_id         uuid default null,
  p_area_id         text default null,
  p_sessions_target integer default 1,
  p_due_on          date default null,
  p_athlete         uuid default null,
  p_item_id         uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_aid  uuid := coalesce(p_athlete, auth.uid());
  v_who  text;
  v_item public.training_items%rowtype;
  v_id   uuid;
begin
  if p_item_id is not null then
    select * into v_item from public.training_items i where i.id = p_item_id for update;
    if not found then raise sqlstate 'PT404' using message = 'No such plan item.'; end if;
    v_aid := v_item.athlete_id;
  end if;
  v_who := public.coaching_access(v_aid);
  if v_who is null then
    if p_item_id is not null then raise sqlstate 'PT404' using message = 'No such plan item.'; end if;
    raise sqlstate 'PT403' using message = 'You can plan for yourself or a rider you coach.';
  end if;
  if p_item_id is not null then
    if v_who = 'athlete' and v_item.created_by is distinct from v_uid then
      raise sqlstate 'PT403' using message = 'Only your coach can change something they planned.';
    end if;
    if v_item.status <> 'planned' then
      raise sqlstate 'PT422' using message = 'Only a planned item can be changed.';
    end if;
  end if;

  p_title := btrim(coalesce(p_title, ''));
  if char_length(p_title) not between 1 and 140 then
    raise sqlstate 'PT422' using message = 'Say what to practise in a few words (up to 140 characters).';
  end if;
  p_details := nullif(btrim(coalesce(p_details, '')), '');
  if char_length(p_details) > 1000 then
    raise sqlstate 'PT422' using message = 'Keep the details under 1000 characters.';
  end if;
  p_sessions_target := coalesce(p_sessions_target, 1);
  if p_sessions_target not between 1 and 14 then
    raise sqlstate 'PT422' using message = 'Pick 1 to 14 sessions.';
  end if;
  if p_goal_id is not null and not exists (select 1 from public.athlete_goals g where g.id = p_goal_id and g.athlete_id = v_aid and g.status <> 'archived') then
    raise sqlstate 'PT422' using message = 'That goal is not one of this rider''s goals.';
  end if;
  if p_area_id is not null and not public.riding_areas_valid(array[p_area_id]) then
    raise sqlstate 'PT422' using message = 'Unknown riding area.';
  end if;
  if p_due_on is not null and p_due_on is distinct from v_item.due_on and (p_due_on < public.coaching_today() - 1 or p_due_on > public.coaching_today() + 366) then
    raise sqlstate 'PT422' using message = 'Pick a date within the next year.';
  end if;

  if p_item_id is not null then
    update public.training_items i
       set title = p_title, details = p_details, goal_id = p_goal_id, area_id = p_area_id,
           sessions_target = p_sessions_target, due_on = p_due_on, updated_at = now()
     where i.id = p_item_id;
    return p_item_id;
  end if;
  if (select count(*) from public.training_items i where i.athlete_id = v_aid and i.status = 'planned') >= 30 then
    raise sqlstate 'PT422' using message = 'The plan is full (30 items). Tick off or remove something first.';
  end if;
  insert into public.training_items (athlete_id, goal_id, area_id, title, details, sessions_target, due_on, created_by, created_by_role)
  values (v_aid, p_goal_id, p_area_id, p_title, p_details, p_sessions_target, p_due_on, v_uid, v_who)
  returning id into v_id;
  return v_id;
end;
$$;

-- planned / done / skipped / archived (removed). A rider can tick off or
-- skip anything on their plan, but remove only what they added.
create or replace function public.set_training_item_status(p_item_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.training_items%rowtype;
  v_who  text;
begin
  if p_status is null or p_status not in ('planned', 'done', 'skipped', 'archived') then
    raise sqlstate 'PT422' using message = 'Unknown status.';
  end if;
  select * into v_item from public.training_items i where i.id = p_item_id for update;
  v_who := case when found then public.coaching_access(v_item.athlete_id) end;
  if v_who is null then raise sqlstate 'PT404' using message = 'No such plan item.'; end if;
  if p_status = 'archived' and v_who = 'athlete' and v_item.created_by is distinct from auth.uid() then
    raise sqlstate 'PT403' using message = 'Only your coach can remove something they planned. You can skip it.';
  end if;
  update public.training_items i
     set status = p_status, updated_at = now(),
         done_at = case when p_status in ('done', 'skipped') then now() when p_status = 'planned' then null else i.done_at end
   where i.id = p_item_id;
  return p_status;
end;
$$;

-- Log a ride or practice (p_log_id null) or change an entry. Only the
-- rider writes their own log; a coach reads it.
create or replace function public.save_training_log(
  p_rode_on     date,
  p_riding_type text,
  p_location    text default null,
  p_minutes     integer default null,
  p_area_ids    text[] default '{}',
  p_item_id     uuid default null,
  p_goal_id     uuid default null,
  p_practiced   text default null,
  p_improved    text default null,
  p_challenge   text default null,
  p_next_time   text default null,
  p_log_id      uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date;
  v_item  public.training_items%rowtype;
  v_id    uuid;
begin
  if public.coaching_access(v_uid) is distinct from 'athlete' then
    raise sqlstate 'PT403' using message = 'Only a rider can write in their own training log.';
  end if;
  if p_log_id is not null and not exists (select 1 from public.training_logs l where l.id = p_log_id and l.athlete_id = v_uid) then
    raise sqlstate 'PT404' using message = 'No such log entry.';
  end if;
  v_today := public.coaching_today();
  if p_rode_on is null or p_rode_on > v_today + 1 or p_rode_on < v_today - 366 then
    raise sqlstate 'PT422' using message = 'Pick the day you rode (within the last year).';
  end if;
  if p_riding_type is null or p_riding_type not in ('trail', 'bike_park', 'pump_track', 'dirt_jumps', 'skills', 'race', 'other') then
    raise sqlstate 'PT422' using message = 'Pick what kind of riding it was.';
  end if;
  p_location := nullif(btrim(coalesce(p_location, '')), '');
  p_practiced := nullif(btrim(coalesce(p_practiced, '')), '');
  p_improved := nullif(btrim(coalesce(p_improved, '')), '');
  p_challenge := nullif(btrim(coalesce(p_challenge, '')), '');
  p_next_time := nullif(btrim(coalesce(p_next_time, '')), '');
  if char_length(p_location) > 80 then raise sqlstate 'PT422' using message = 'Keep the place under 80 characters.'; end if;
  if char_length(p_practiced) > 1000 or char_length(p_improved) > 500 or char_length(p_challenge) > 500 or char_length(p_next_time) > 500 then
    raise sqlstate 'PT422' using message = 'One of the answers is too long.';
  end if;
  if coalesce(p_practiced, p_improved, p_challenge, p_next_time) is null then
    raise sqlstate 'PT422' using message = 'Write at least a few words about what you practised.';
  end if;
  if p_minutes is not null and p_minutes not between 1 and 720 then
    raise sqlstate 'PT422' using message = 'Minutes should be between 1 and 720.';
  end if;
  p_area_ids := coalesce(p_area_ids, '{}');
  if cardinality(p_area_ids) > 9 or not public.riding_areas_valid(p_area_ids) then
    raise sqlstate 'PT422' using message = 'Unknown riding area.';
  end if;
  if p_item_id is not null then
    select * into v_item from public.training_items i where i.id = p_item_id and i.athlete_id = v_uid and i.status <> 'archived';
    if not found then raise sqlstate 'PT422' using message = 'That is not on your plan.'; end if;
    p_goal_id := coalesce(p_goal_id, v_item.goal_id);
  end if;
  if p_goal_id is not null and not exists (select 1 from public.athlete_goals g where g.id = p_goal_id and g.athlete_id = v_uid and g.status <> 'archived') then
    raise sqlstate 'PT422' using message = 'That is not one of your goals.';
  end if;

  if p_log_id is not null then
    update public.training_logs l
       set rode_on = p_rode_on, riding_type = p_riding_type, location = p_location, minutes = p_minutes,
           area_ids = p_area_ids, item_id = p_item_id, goal_id = p_goal_id, practiced = p_practiced,
           improved = p_improved, challenge = p_challenge, next_time = p_next_time, updated_at = now()
     where l.id = p_log_id;
    v_id := p_log_id;
  else
    if (select count(*) from public.training_logs l where l.athlete_id = v_uid and l.created_at > now() - interval '1 day') >= 20 then
      raise sqlstate 'PT429' using message = 'That is a lot of entries for one day. Try again tomorrow.';
    end if;
    insert into public.training_logs (athlete_id, rode_on, riding_type, location, minutes, area_ids, item_id, goal_id,
                                      practiced, improved, challenge, next_time)
    values (v_uid, p_rode_on, p_riding_type, p_location, p_minutes, p_area_ids, p_item_id, p_goal_id,
            p_practiced, p_improved, p_challenge, p_next_time)
    returning id into v_id;
  end if;

  -- Logging a planned item enough times ticks it off.
  if p_item_id is not null and v_item.status = 'planned'
     and (select count(*) from public.training_logs l where l.item_id = p_item_id) >= v_item.sessions_target then
    update public.training_items i set status = 'done', done_at = now(), updated_at = now() where i.id = p_item_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.delete_training_log(p_log_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.coaching_access(auth.uid()) is distinct from 'athlete' then
    raise sqlstate 'PT403' using message = 'Only a rider can change their own training log.';
  end if;
  delete from public.training_logs l where l.id = p_log_id and l.athlete_id = auth.uid();
  if not found then raise sqlstate 'PT404' using message = 'No such log entry.'; end if;
  return true;
end;
$$;

-- 9. Who may call what ---------------------------------------------------
revoke all on function public.coaching_home(uuid) from public, anon;
revoke all on function public.coaching_logs(uuid, integer) from public, anon;
revoke all on function public.save_athlete_goal(text, text, text, text, text, text, date, uuid, uuid, uuid) from public, anon;
revoke all on function public.set_athlete_goal_status(uuid, text) from public, anon;
revoke all on function public.save_goal_step(uuid, text, uuid) from public, anon;
revoke all on function public.set_goal_step(uuid, boolean) from public, anon;
revoke all on function public.save_training_item(text, text, uuid, text, integer, date, uuid, uuid) from public, anon;
revoke all on function public.set_training_item_status(uuid, text) from public, anon;
revoke all on function public.save_training_log(date, text, text, integer, text[], uuid, uuid, text, text, text, text, uuid) from public, anon;
revoke all on function public.delete_training_log(uuid) from public, anon;
grant execute on function public.coaching_home(uuid) to authenticated;
grant execute on function public.coaching_logs(uuid, integer) to authenticated;
grant execute on function public.save_athlete_goal(text, text, text, text, text, text, date, uuid, uuid, uuid) to authenticated;
grant execute on function public.set_athlete_goal_status(uuid, text) to authenticated;
grant execute on function public.save_goal_step(uuid, text, uuid) to authenticated;
grant execute on function public.set_goal_step(uuid, boolean) to authenticated;
grant execute on function public.save_training_item(text, text, uuid, text, integer, date, uuid, uuid) to authenticated;
grant execute on function public.set_training_item_status(uuid, text) to authenticated;
grant execute on function public.save_training_log(date, text, text, integer, text[], uuid, uuid, text, text, text, text, uuid) to authenticated;
grant execute on function public.delete_training_log(uuid) to authenticated;
