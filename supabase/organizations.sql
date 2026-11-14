-- ============================================================
-- Mathlete: organizations and licensing (Multi-org PRD 1, with the
-- licensing tables of PRD 4). Run in Supabase -> SQL Editor AFTER
-- setup.sql and progress.sql (and before curriculum.sql). Safe to re-run:
-- every statement is idempotent and nothing existing is dropped.
--
-- What this adds:
--   * organizations              schools, academies… each one a workspace
--   * organization_memberships   person ↔ organization, with a role there:
--                                owner | admin | instructor | student
--   * platform_admins            Mathlete super admins (never assignable
--                                by an organization)
--   * plans, subscriptions       configurable plans and each organization's
--                                licence history (manual activation now;
--                                payment providers later)
--   * invitations                (used by PRD 2; here so seat counts are
--                                complete from the start)
--   * audit_events               who did what to which organization
--   * helper functions           org_role(), org_can_learn(), seat_usage()…
--   * organization_id on learning records (attempts, sessions, review items)
--
-- How access is decided (all on the server):
--   A person can LEARN in an organization when their membership is active,
--   the organization is active, and its licence is current (active or
--   trialing within its dates, or past due within the grace period).
--   Owners and admins can still MANAGE a pending, suspended or unlicensed
--   organization (to set it up or renew it); students and instructors can't
--   use it until it's active again. Archived organizations are hidden.
--   Nobody writes these tables from the browser: changes go through the
--   functions below, which check who is asking. scripts/admin.mjs calls the
--   same functions with the service role.
-- ============================================================

-- 0. Schema versions (which change files have been applied) ------------
create table if not exists public.schema_versions (
  name       text primary key,
  applied_at timestamptz not null default now()
);
alter table public.schema_versions enable row level security;
revoke all on public.schema_versions from anon, authenticated;

-- 1. Platform administrators --------------------------------------------
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  note       text
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;
-- The existing site admin becomes the first platform admin.
insert into public.platform_admins (user_id, note)
select p.user_id, 'from profiles.role = admin' from public.profiles p where p.role = 'admin'
on conflict (user_id) do nothing;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.has_live_session() and exists (select 1 from public.platform_admins a where a.user_id = auth.uid());
$$;
-- A platform admin signed in, or the service role (scripts/admin.mjs).
create or replace function public.is_platform_operator()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'service_role' or public.is_platform_admin();
$$;

-- 2. Organizations ---------------------------------------------------------
create table if not exists public.organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(btrim(name)) between 2 and 120),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60),
  org_type        text not null default 'school' check (org_type in ('school', 'sports_academy', 'tutoring', 'educational', 'other')),
  status          text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'archived')),
  logo_path       text,
  accent_color    text check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  welcome_message text check (welcome_message is null or char_length(welcome_message) <= 600),
  primary_contact uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            text not null check (role in ('owner', 'admin', 'instructor', 'student')),
  status          text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  joined_at       timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);
-- When the owner finished the getting-started steps (PRD 2.6). Null = not yet.
alter table public.organizations add column if not exists setup_completed_at timestamptz;

create index if not exists organization_memberships_user_idx on public.organization_memberships (user_id) where status = 'active';
create index if not exists organization_memberships_org_idx on public.organization_memberships (organization_id, role, status);

-- 3. Plans and subscriptions --------------------------------------------
-- Prices are set by Mathlete admins; nothing here invents one.
create table if not exists public.plans (
  id                 text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name               text not null,
  description        text,
  billing_interval   text not null default 'year' check (billing_interval in ('month', 'year', 'term', 'one_time', 'custom')),
  products           text[] not null default '{academics}',   -- e.g. academics; mtb-coaching is a separate product
  student_seat_limit integer check (student_seat_limit is null or student_seat_limit >= 0),
  instructor_limit   integer check (instructor_limit is null or instructor_limit >= 0),
  features           jsonb not null default '{}'::jsonb,
  price_cents        integer check (price_cents is null or price_cents >= 0),
  currency           text check (currency is null or currency ~ '^[A-Z]{3}$'),
  status             text not null default 'active' check (status in ('draft', 'active', 'retired')),
  version            integer not null default 1,
  effective_from     date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- One row per licence period. A plan change or renewal creates a new row;
-- the old one is ended with replaced_by, so history is never overwritten.
create table if not exists public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete restrict,
  plan_id          text not null references public.plans (id),
  status           text not null check (status in ('pending', 'trialing', 'active', 'past_due', 'suspended', 'canceled', 'expired')),
  starts_on        date not null,
  ends_on          date,
  billing_interval text not null,
  seat_allowance   integer not null check (seat_allowance >= 0),
  provider         text not null default 'manual' check (provider in ('manual', 'stripe')),
  provider_ref     text,
  metadata         jsonb not null default '{}'::jsonb,
  canceled_at      timestamptz,
  cancel_reason    text,
  replaced_by      uuid references public.subscriptions (id),
  created_by       uuid,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);
create index if not exists subscriptions_org_idx on public.subscriptions (organization_id, created_at desc);

create table if not exists public.platform_settings (
  key   text primary key,
  value jsonb not null,
  note  text
);
insert into public.platform_settings (key, value, note) values
  ('past_due_grace_days', '14', 'Days a past-due licence keeps working before access stops. 0 = none.')
on conflict (key) do nothing;

-- 4. Invitations (flows in PRD 2; seats count them from now) -------------
create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  email           text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role            text not null check (role in ('owner', 'admin', 'instructor', 'student')),
  invited_by      uuid,
  token_hash      text not null unique,
  expires_at      timestamptz not null,
  status          text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  accepted_at     timestamptz,
  accepted_by     uuid,
  first_name      text,
  last_name       text,
  created_at      timestamptz not null default now()
);
create index if not exists invitations_org_idx on public.invitations (organization_id, status);
create unique index if not exists invitations_one_pending_per_email on public.invitations (organization_id, lower(email)) where status = 'pending';

-- 5. Audit log ---------------------------------------------------------------
create table if not exists public.audit_events (
  id              bigint generated always as identity primary key,
  at              timestamptz not null default now(),
  actor_id        uuid,
  actor_kind      text not null,          -- platform_admin | service | owner | admin | instructor | student | system
  organization_id uuid references public.organizations (id) on delete set null,
  action          text not null,
  target_type     text,
  target_id       text,
  metadata        jsonb not null default '{}'::jsonb
);
create index if not exists audit_events_org_idx on public.audit_events (organization_id, at desc);

-- 6. Learning records belong to the organization they were made in --------
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'question_attempts_organization_fk') then
    alter table public.question_attempts add constraint question_attempts_organization_fk foreign key (organization_id) references public.organizations (id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_sessions_organization_fk') then
    alter table public.game_sessions add constraint game_sessions_organization_fk foreign key (organization_id) references public.organizations (id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_items_organization_fk') then
    alter table public.review_items add constraint review_items_organization_fk foreign key (organization_id) references public.organizations (id) on delete restrict;
  end if;
end $$;

-- 7. Access helpers ----------------------------------------------------------
-- The licence state of an organization today:
--   'active' | 'trialing' | 'grace' (past due, inside the grace period)
--   | 'none' (no current licence) | 'suspended' | 'expired'
create or replace function public.org_license_state(p_org uuid)
returns text language plpgsql stable security definer set search_path = '' as $$
declare
  s public.subscriptions%rowtype;
  v_today date := current_date;
  v_grace integer := coalesce((select (ps.value #>> '{}')::integer from public.platform_settings ps where ps.key = 'past_due_grace_days'), 0);
begin
  select * into s from public.subscriptions x
   where x.organization_id = p_org and x.replaced_by is null and x.status not in ('canceled')
   order by x.created_at desc limit 1;
  if not found then return 'none'; end if;
  if s.status = 'suspended' then return 'suspended'; end if;
  if s.status in ('expired') or (s.ends_on is not null and s.ends_on < v_today) then return 'expired'; end if;
  if s.starts_on > v_today or s.status = 'pending' then return 'none'; end if;
  if s.status = 'past_due' then
    return case when s.updated_at::date + v_grace >= v_today then 'grace' else 'suspended' end;
  end if;
  return s.status;   -- active | trialing
end;
$$;

create or replace function public.org_license_ok(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.org_license_state(p_org) in ('active', 'trialing', 'grace');
$$;

-- The caller's role in an organization, if their membership is active and
-- the organization isn't archived. (Used for MANAGING.)
create or replace function public.org_role(p_org uuid)
returns text language sql stable security definer set search_path = '' as $$
  select m.role
  from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.organization_id = p_org and m.user_id = auth.uid() and m.status = 'active'
    and o.status <> 'archived' and public.has_live_session();
$$;

-- Can the caller LEARN or TEACH in this organization right now?
create or replace function public.org_can_learn(p_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.org_role(p_org) is not null
     and exists (select 1 from public.organizations o where o.id = p_org and o.status = 'active')
     and public.org_license_ok(p_org);
$$;

-- Any organization the caller can learn in? (Used by has_tool_access().)
create or replace function public.has_org_learning_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.user_id = auth.uid() and m.status = 'active' and public.org_can_learn(m.organization_id));
$$;

-- The one organization to use when a student who has no direct account
-- doesn't say which (null if there are several or none).
create or replace function public.my_default_org()
returns uuid language sql stable security definer set search_path = '' as $$
  select case when count(*) = 1 then min(m.organization_id::text)::uuid end
  from public.organization_memberships m
  where m.user_id = auth.uid() and m.status = 'active' and public.org_can_learn(m.organization_id);
$$;

-- Organizations the caller manages (owner or admin), and their members.
create or replace function public.my_admin_org_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.organization_id from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = auth.uid() and m.status = 'active' and m.role in ('owner', 'admin') and o.status <> 'archived' and public.has_live_session();
$$;
create or replace function public.my_admin_org_member_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select distinct m.user_id from public.organization_memberships m
  where m.organization_id in (select public.my_admin_org_ids()) and m.status <> 'removed';
$$;

-- Seats: licensed, used by active students, reserved by pending student
-- invitations, and available.
create or replace function public.seat_usage(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_seats integer; v_active integer; v_pending integer;
begin
  select x.seat_allowance into v_seats from public.subscriptions x
   where x.organization_id = p_org and x.replaced_by is null and x.status not in ('canceled')
   order by x.created_at desc limit 1;
  select count(*) into v_active from public.organization_memberships m where m.organization_id = p_org and m.role = 'student' and m.status = 'active';
  select count(*) into v_pending from public.invitations i where i.organization_id = p_org and i.role = 'student' and i.status = 'pending' and i.expires_at > now();
  return jsonb_build_object('licensed', coalesce(v_seats, 0), 'active_students', v_active, 'pending_invitations', v_pending,
                            'available', greatest(coalesce(v_seats, 0) - v_active - v_pending, 0));
end;
$$;

create or replace function public.audit(p_org uuid, p_action text, p_target_type text, p_target_id text, p_meta jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_events (actor_id, actor_kind, organization_id, action, target_type, target_id, metadata)
  values (auth.uid(),
          case when coalesce(auth.jwt() ->> 'role', '') = 'service_role' then 'service'
               when exists (select 1 from public.platform_admins a where a.user_id = auth.uid()) then 'platform_admin'
               else coalesce((select m.role from public.organization_memberships m where m.organization_id = p_org and m.user_id = auth.uid()), 'system') end,
          p_org, p_action, p_target_type, p_target_id, coalesce(p_meta, '{}'::jsonb));
$$;

-- 8. Row-level security (read only; writes go through functions) -----------
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.platform_settings enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "Members see their organizations" on public.organizations;
create policy "Members see their organizations" on public.organizations for select to authenticated
  using (public.is_platform_admin() or public.org_role(id) is not null);
drop policy if exists "Own memberships; admins see their organization's" on public.organization_memberships;
create policy "Own memberships; admins see their organization's" on public.organization_memberships for select to authenticated
  using (public.is_platform_admin() or (user_id = (select auth.uid()) and public.has_live_session())
         or organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Active plans are visible to signed-in users" on public.plans;
create policy "Active plans are visible to signed-in users" on public.plans for select to authenticated
  using (public.is_platform_admin() or (status = 'active' and public.has_live_session()));
drop policy if exists "Owners and admins see their subscriptions" on public.subscriptions;
create policy "Owners and admins see their subscriptions" on public.subscriptions for select to authenticated
  using (public.is_platform_admin() or organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Owners and admins see their invitations" on public.invitations;
create policy "Owners and admins see their invitations" on public.invitations for select to authenticated
  using (public.is_platform_admin() or organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Owners see their audit trail" on public.audit_events;
create policy "Owners see their audit trail" on public.audit_events for select to authenticated
  using (public.is_platform_admin() or organization_id in (select public.my_admin_org_ids()));

revoke all on public.organizations, public.organization_memberships, public.plans, public.subscriptions,
              public.platform_settings, public.invitations, public.audit_events from anon, authenticated;
grant select on public.organizations, public.organization_memberships, public.plans, public.subscriptions,
                public.invitations, public.audit_events to authenticated;

-- Organization owners and admins see their organization's learning records
-- (only work done in that organization), and their members' names.
-- Instructors get class-based access in PRD 5.
drop policy if exists "Organization admins see work done in their organization" on public.question_attempts;
create policy "Organization admins see work done in their organization" on public.question_attempts for select to authenticated
  using (organization_id is not null and organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Organization admins see sessions in their organization" on public.game_sessions;
create policy "Organization admins see sessions in their organization" on public.game_sessions for select to authenticated
  using (organization_id is not null and organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Organization admins see review items from their organization" on public.review_items;
create policy "Organization admins see review items from their organization" on public.review_items for select to authenticated
  using (organization_id is not null and organization_id in (select public.my_admin_org_ids()));
drop policy if exists "Organization admins see their members' names" on public.profiles;
create policy "Organization admins see their members' names" on public.profiles for select to authenticated
  using (user_id in (select public.my_admin_org_member_ids()));

-- 9. What the browser asks for --------------------------------------------

-- The caller's organizations, for the "working in" switcher.
create or replace function public.my_organizations()
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', o.id, 'name', o.name, 'slug', o.slug, 'type', o.org_type, 'status', o.status, 'role', m.role,
           'license', public.org_license_state(o.id), 'can_learn', public.org_can_learn(o.id),
           'can_manage', m.role in ('owner', 'admin'), 'accent_color', o.accent_color, 'logo_path', o.logo_path)
           order by o.name), '[]'::jsonb)
  from public.organization_memberships m
  join public.organizations o on o.id = m.organization_id
  where m.user_id = auth.uid() and m.status = 'active' and o.status <> 'archived' and public.has_live_session();
$$;

-- An organization's overview (owners, admins, platform admins).
create or replace function public.organization_overview(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  o public.organizations%rowtype;
  s public.subscriptions%rowtype;
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  select * into o from public.organizations x where x.id = p_org;
  select * into s from public.subscriptions x where x.organization_id = p_org and x.replaced_by is null and x.status <> 'canceled' order by x.created_at desc limit 1;
  return jsonb_build_object(
    'organization', jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug, 'type', o.org_type, 'status', o.status,
                                       'welcome_message', o.welcome_message, 'accent_color', o.accent_color, 'setup_completed_at', o.setup_completed_at),
    'my_role', case when public.is_platform_operator() then coalesce(public.org_role(p_org), 'platform') else public.org_role(p_org) end,
    -- Getting started (PRD 2.6): each step done or not, from real data.
    'setup', jsonb_build_object(
      'details', o.welcome_message is not null,
      'owner', exists (select 1 from public.organization_memberships m where m.organization_id = p_org and m.role = 'owner' and m.status = 'active'),
      'license', public.org_license_ok(p_org),
      'instructors', exists (select 1 from public.organization_memberships m where m.organization_id = p_org and m.role in ('instructor', 'admin') and m.status = 'active')
                     or exists (select 1 from public.invitations i where i.organization_id = p_org and i.role in ('instructor', 'admin') and i.status in ('pending', 'accepted')),
      'students', exists (select 1 from public.organization_memberships m where m.organization_id = p_org and m.role = 'student' and m.status = 'active')
                  or exists (select 1 from public.invitations i where i.organization_id = p_org and i.role = 'student' and i.status in ('pending', 'accepted')),
      'completed_at', o.setup_completed_at),
    'license', jsonb_build_object('state', public.org_license_state(p_org), 'plan', s.plan_id, 'status', s.status, 'starts_on', s.starts_on, 'ends_on', s.ends_on),
    'seats', public.seat_usage(p_org),
    'counts', (select jsonb_object_agg(r.role, r.n) from (select m.role, count(*) n from public.organization_memberships m where m.organization_id = p_org and m.status = 'active' group by m.role) r),
    'admins', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'role', m.role, 'name', p.display_name) order by m.role, p.display_name)
                        from public.organization_memberships m left join public.profiles p on p.user_id = m.user_id
                        where m.organization_id = p_org and m.status = 'active' and m.role in ('owner', 'admin')), '[]'::jsonb),
    'recent', coalesce((select jsonb_agg(jsonb_build_object('at', a.at, 'action', a.action, 'actor', a.actor_kind, 'target', a.target_type) order by a.at desc)
                        from (select * from public.audit_events a where a.organization_id = p_org order by a.at desc limit 10) a), '[]'::jsonb));
end;
$$;

-- 10. Managing organizations (platform operators) ----------------------------
create or replace function public.create_organization(p_name text, p_slug text, p_type text default 'school', p_status text default 'pending')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins can create organizations.'; end if;
  if p_status not in ('pending', 'active') then raise sqlstate 'PT422' using message = 'A new organization starts pending or active.'; end if;
  begin
    insert into public.organizations (name, slug, org_type, status) values (btrim(p_name), lower(btrim(p_slug)), p_type, p_status) returning id into v_id;
  exception
    when unique_violation then raise sqlstate 'PT409' using message = 'That slug is already taken.';
    when check_violation then raise sqlstate 'PT422' using message = 'Check the name (2–120 characters), the slug (lowercase words joined by hyphens) and the type.';
  end;
  perform public.audit(v_id, 'organization.created', 'organization', v_id::text, jsonb_build_object('name', p_name, 'slug', p_slug, 'type', p_type, 'status', p_status));
  return v_id;
end;
$$;

-- pending → active; active ↔ suspended; anything → archived (archiving keeps
-- every record; an organization with history is never deleted).
create or replace function public.set_organization_status(p_org uuid, p_status text, p_reason text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare v_old text;
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins can change an organization''s status.'; end if;
  if p_status not in ('pending', 'active', 'suspended', 'archived') then raise sqlstate 'PT422' using message = 'Unknown status.'; end if;
  select o.status into v_old from public.organizations o where o.id = p_org for update;
  if not found then raise sqlstate 'PT404' using message = 'No such organization.'; end if;
  update public.organizations o set status = p_status, updated_at = now() where o.id = p_org;
  perform public.audit(p_org, 'organization.status_changed', 'organization', p_org::text, jsonb_build_object('from', v_old, 'to', p_status, 'reason', p_reason));
  return p_status;
end;
$$;

-- Add an existing account to an organization (invitations, for people who
-- don't have an account yet, come in PRD 2). Students take a seat.
create or replace function public.add_member(p_org uuid, p_user uuid, p_role text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_my text := coalesce(public.org_role(p_org), '');   -- '' = no role (never null: null would slip past the checks)
  v_id uuid; v_old public.organization_memberships%rowtype; v_seats jsonb;
begin
  if not (public.is_platform_operator() or v_my in ('owner', 'admin')) then raise sqlstate 'PT403' using message = 'You don''t manage that organization.'; end if;
  if p_role not in ('owner', 'admin', 'instructor', 'student') then raise sqlstate 'PT422' using message = 'Unknown role.'; end if;
  if p_role in ('owner', 'admin') and not (public.is_platform_operator() or v_my = 'owner') then raise sqlstate 'PT403' using message = 'Only the owner can add owners or admins.'; end if;
  if not exists (select 1 from auth.users u where u.id = p_user) then raise sqlstate 'PT404' using message = 'No such account.'; end if;
  if exists (select 1 from public.organizations o where o.id = p_org and o.status = 'archived') then raise sqlstate 'PT422' using message = 'That organization is archived.'; end if;
  -- Seats are checked under a lock, so two additions can't both take the last seat.
  perform 1 from public.organizations o where o.id = p_org for update;
  select * into v_old from public.organization_memberships m where m.organization_id = p_org and m.user_id = p_user;
  if p_role = 'student' and not (found and v_old.status = 'active' and v_old.role = 'student') then
    v_seats := public.seat_usage(p_org);
    if (v_seats ->> 'available')::integer < 1 then raise sqlstate 'PT422' using message = 'No student seats available on this organization''s licence.'; end if;
  end if;
  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (p_org, p_user, p_role, 'active')
  on conflict (organization_id, user_id) do update set role = excluded.role, status = 'active', updated_at = now()
  returning id into v_id;
  perform public.audit(p_org, case when v_old.id is null then 'member.added' else 'member.reactivated' end, 'membership', v_id::text,
                       jsonb_build_object('role', p_role, 'previous_status', v_old.status, 'previous_role', v_old.role));
  return v_id;
end;
$$;

-- Change a member's role or status. Suspending or removing keeps every
-- record and releases a student's seat; the person's account is untouched.
create or replace function public.update_member(p_org uuid, p_user uuid, p_role text default null, p_status text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_my text := coalesce(public.org_role(p_org), '');   -- '' = no role (never null: null would slip past the checks)
  m public.organization_memberships%rowtype;
  v_role text; v_status text;
begin
  if not (public.is_platform_operator() or v_my in ('owner', 'admin')) then raise sqlstate 'PT403' using message = 'You don''t manage that organization.'; end if;
  perform 1 from public.organizations o where o.id = p_org for update;
  select * into m from public.organization_memberships x where x.organization_id = p_org and x.user_id = p_user for update;
  if not found then raise sqlstate 'PT404' using message = 'Not a member of that organization.'; end if;
  v_role := coalesce(p_role, m.role); v_status := coalesce(p_status, m.status);
  if v_role not in ('owner', 'admin', 'instructor', 'student') or v_status not in ('active', 'suspended', 'removed', 'invited') then raise sqlstate 'PT422' using message = 'Unknown role or status.'; end if;
  -- Only the owner (or Mathlete) touches owners and admins.
  if (m.role in ('owner', 'admin') or v_role in ('owner', 'admin')) and not (public.is_platform_operator() or v_my = 'owner') then
    raise sqlstate 'PT403' using message = 'Only the owner can change owners or admins.';
  end if;
  -- An organization keeps at least one active owner.
  if m.role = 'owner' and m.status = 'active' and (v_role <> 'owner' or v_status <> 'active')
     and (select count(*) from public.organization_memberships x where x.organization_id = p_org and x.role = 'owner' and x.status = 'active') <= 1 then
    raise sqlstate 'PT422' using message = 'An organization needs at least one owner. Add another owner first.';
  end if;
  -- Becoming an active student needs a seat.
  if v_role = 'student' and v_status = 'active' and not (m.role = 'student' and m.status = 'active')
     and (public.seat_usage(p_org) ->> 'available')::integer < 1 then
    raise sqlstate 'PT422' using message = 'No student seats available on this organization''s licence.';
  end if;
  update public.organization_memberships x set role = v_role, status = v_status, updated_at = now() where x.id = m.id;
  perform public.audit(p_org, 'member.updated', 'membership', m.id::text,
                       jsonb_build_object('from_role', m.role, 'to_role', v_role, 'from_status', m.status, 'to_status', v_status));
  return v_status;
end;
$$;

-- 11. Plans and licences (platform operators) --------------------------------
create or replace function public.save_plan(p_id text, p_name text, p_seat_limit integer default null, p_interval text default 'year',
                                            p_description text default null, p_price_cents integer default null, p_currency text default null,
                                            p_products text[] default '{academics}', p_status text default 'active')
returns text language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins manage plans.'; end if;
  insert into public.plans (id, name, description, billing_interval, student_seat_limit, price_cents, currency, products, status, effective_from)
  values (p_id, p_name, p_description, p_interval, p_seat_limit, p_price_cents, p_currency, coalesce(p_products, '{academics}'), p_status, current_date)
  on conflict (id) do update set name = excluded.name, description = excluded.description, billing_interval = excluded.billing_interval,
    student_seat_limit = excluded.student_seat_limit, price_cents = excluded.price_cents, currency = excluded.currency,
    products = excluded.products, status = excluded.status, version = public.plans.version + 1, updated_at = now();
  perform public.audit(null, 'plan.saved', 'plan', p_id, jsonb_build_object('name', p_name, 'seat_limit', p_seat_limit, 'status', p_status));
  return p_id;
end;
$$;

-- Manually activate a licence: a real subscription record. Any current
-- licence is ended (kept in history) and points to the new one.
create or replace function public.activate_license(p_org uuid, p_plan text, p_seats integer, p_starts date, p_ends date,
                                                   p_status text default 'active', p_note text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_plan public.plans%rowtype; v_used integer;
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins activate licences.'; end if;
  select * into v_plan from public.plans p where p.id = p_plan and p.status = 'active';
  if not found then raise sqlstate 'PT422' using message = 'No active plan with that id.'; end if;
  if p_status not in ('active', 'trialing', 'pending') then raise sqlstate 'PT422' using message = 'A licence starts active, trialing or pending.'; end if;
  if p_seats is null or p_seats < 0 or (v_plan.student_seat_limit is not null and p_seats > v_plan.student_seat_limit) then
    raise sqlstate 'PT422' using message = 'Seats must be 0 or more, and within the plan''s limit.';
  end if;
  if p_starts is null or (p_ends is not null and p_ends < p_starts) then raise sqlstate 'PT422' using message = 'Check the start and end dates.'; end if;
  perform 1 from public.organizations o where o.id = p_org for update;
  if not found then raise sqlstate 'PT404' using message = 'No such organization.'; end if;
  -- Seat policy: a new licence can't have fewer seats than students already active.
  select count(*) into v_used from public.organization_memberships m where m.organization_id = p_org and m.role = 'student' and m.status = 'active';
  if p_seats < v_used then raise sqlstate 'PT422' using message = format('%s students are active; the licence needs at least that many seats (suspend or remove students first).', v_used); end if;
  insert into public.subscriptions (organization_id, plan_id, status, starts_on, ends_on, billing_interval, seat_allowance, provider, metadata, created_by)
  values (p_org, p_plan, p_status, p_starts, p_ends, v_plan.billing_interval, p_seats, 'manual', jsonb_build_object('note', p_note, 'plan_version', v_plan.version), auth.uid())
  returning id into v_id;
  update public.subscriptions x set replaced_by = v_id, updated_at = now(),
         status = case when x.status in ('active', 'trialing', 'past_due', 'pending', 'suspended') then 'canceled' else x.status end,
         canceled_at = coalesce(x.canceled_at, now()), cancel_reason = coalesce(x.cancel_reason, 'replaced by a new licence')
   where x.organization_id = p_org and x.id <> v_id and x.replaced_by is null;
  perform public.audit(p_org, 'subscription.activated', 'subscription', v_id::text,
                       jsonb_build_object('plan', p_plan, 'seats', p_seats, 'starts_on', p_starts, 'ends_on', p_ends, 'status', p_status, 'note', p_note));
  return v_id;
end;
$$;

-- Allowed licence transitions. Canceled and expired are final (renew by
-- activating a new licence).
create or replace function public.set_subscription_status(p_subscription uuid, p_status text, p_reason text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare s public.subscriptions%rowtype; v_ok boolean;
begin
  if not public.is_platform_operator() then raise sqlstate 'PT403' using message = 'Only Mathlete platform admins change licences.'; end if;
  select * into s from public.subscriptions x where x.id = p_subscription for update;
  if not found then raise sqlstate 'PT404' using message = 'No such licence.'; end if;
  v_ok := (s.status, p_status) in (
    ('pending', 'trialing'), ('pending', 'active'), ('pending', 'canceled'),
    ('trialing', 'active'), ('trialing', 'past_due'), ('trialing', 'suspended'), ('trialing', 'canceled'), ('trialing', 'expired'),
    ('active', 'past_due'), ('active', 'suspended'), ('active', 'canceled'), ('active', 'expired'),
    ('past_due', 'active'), ('past_due', 'suspended'), ('past_due', 'canceled'), ('past_due', 'expired'),
    ('suspended', 'active'), ('suspended', 'canceled'), ('suspended', 'expired'));
  if not v_ok then raise sqlstate 'PT422' using message = format('A licence can''t go from %s to %s.', s.status, p_status); end if;
  update public.subscriptions x set status = p_status, updated_at = now(),
         canceled_at = case when p_status = 'canceled' then now() else x.canceled_at end,
         cancel_reason = case when p_status = 'canceled' then p_reason else x.cancel_reason end
   where x.id = p_subscription;
  perform public.audit(s.organization_id, 'subscription.status_changed', 'subscription', s.id::text, jsonb_build_object('from', s.status, 'to', p_status, 'reason', p_reason));
  return p_status;
end;
$$;

-- 11b. Invitations and member management (PRD 2) --------------------------
-- An invitation is a random 64-character token sent to one email address.
-- Only its SHA-256 hash is stored; the token itself is returned once, to
-- whoever created it (the invite Edge Function, which emails it, or the
-- admin page, which shows a link to copy). It works once, for that email
-- address, until it expires (platform_settings.invitation_days, default 7).
-- A pending STUDENT invitation reserves a seat until it is accepted,
-- revoked or expires.
insert into public.platform_settings (key, value, note) values
  ('invitation_days', '7', 'Days an invitation link stays valid.')
on conflict (key) do nothing;

create or replace function public.invitation_hash(p_token text)
returns text language sql immutable set search_path = '' as $$
  select encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
$$;

-- Mark invitations whose time is up as expired (keeps seat counts honest
-- for anyone reading the table; seat_usage() already ignores them).
create or replace function public.expire_invitations(p_org uuid)
returns void language sql security definer set search_path = '' as $$
  update public.invitations i set status = 'expired' where i.organization_id = p_org and i.status = 'pending' and i.expires_at <= now();
$$;

-- Create (or re-send) an invitation. Returns { id, token, expires_at, resent }.
create or replace function public.create_invitation(p_org uuid, p_email text, p_role text, p_first text default null, p_last text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_my    text := coalesce(public.org_role(p_org), '');
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_prev  public.invitations%rowtype;
  v_mem   public.organization_memberships%rowtype;
  v_token text;
  v_id    uuid;
  v_exp   timestamptz;
  v_days  integer := coalesce((select (ps.value #>> '{}')::integer from public.platform_settings ps where ps.key = 'invitation_days'), 7);
  v_avail integer;
begin
  if not (public.is_platform_operator() or v_my in ('owner', 'admin')) then raise sqlstate 'PT403' using message = 'You don''t manage that organization.'; end if;
  if p_role not in ('owner', 'admin', 'instructor', 'student') then raise sqlstate 'PT422' using message = 'Unknown role.'; end if;
  if p_role in ('owner', 'admin') and not (public.is_platform_operator() or v_my = 'owner') then raise sqlstate 'PT403' using message = 'Only the owner can invite owners or admins.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254 then raise sqlstate 'PT422' using message = 'That doesn''t look like an email address.'; end if;
  if char_length(coalesce(p_first, '')) > 60 or char_length(coalesce(p_last, '')) > 60 then raise sqlstate 'PT422' using message = 'Names can be up to 60 characters.'; end if;
  perform 1 from public.organizations o where o.id = p_org and o.status <> 'archived' for update;
  if not found then raise sqlstate 'PT404' using message = 'No such organization.'; end if;
  perform public.expire_invitations(p_org);
  -- Already in the organization?
  select m.* into v_mem from public.organization_memberships m join auth.users u on u.id = m.user_id
   where m.organization_id = p_org and lower(u.email) = v_email;
  if found and v_mem.status = 'active' then raise sqlstate 'PT409' using message = 'That person is already a member.'; end if;
  if found and v_mem.status = 'suspended' then raise sqlstate 'PT409' using message = 'That person''s membership is suspended. Reactivate it instead of inviting them.'; end if;
  -- A pending invitation to the same address is replaced (a re-send).
  select * into v_prev from public.invitations i where i.organization_id = p_org and lower(i.email) = v_email and i.status = 'pending';
  if p_role = 'student' then
    v_avail := (public.seat_usage(p_org) ->> 'available')::integer + case when v_prev.id is not null and v_prev.role = 'student' then 1 else 0 end;
    if v_avail < 1 then raise sqlstate 'PT422' using message = 'No student seats available on this organization''s licence.'; end if;
  end if;
  if v_prev.id is not null then update public.invitations i set status = 'revoked' where i.id = v_prev.id; end if;
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_exp := now() + make_interval(days => v_days);
  insert into public.invitations (organization_id, email, role, invited_by, token_hash, expires_at, first_name, last_name)
  values (p_org, v_email, p_role, auth.uid(), public.invitation_hash(v_token), v_exp, nullif(btrim(p_first), ''), nullif(btrim(p_last), ''))
  returning id into v_id;
  -- The audit keeps the role, never the token (and not the address).
  perform public.audit(p_org, case when v_prev.id is null then 'member.invited' else 'member.reinvited' end, 'invitation', v_id::text, jsonb_build_object('role', p_role));
  return jsonb_build_object('id', v_id, 'token', v_token, 'expires_at', v_exp, 'resent', v_prev.id is not null);
end;
$$;

create or replace function public.revoke_invitation(p_invitation uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare i public.invitations%rowtype; v_my text;
begin
  select * into i from public.invitations x where x.id = p_invitation for update;
  if not found then raise sqlstate 'PT404' using message = 'No such invitation.'; end if;
  v_my := coalesce(public.org_role(i.organization_id), '');
  if not (public.is_platform_operator() or v_my in ('owner', 'admin')) then raise sqlstate 'PT404' using message = 'No such invitation.'; end if;
  if i.role in ('owner', 'admin') and not (public.is_platform_operator() or v_my = 'owner') then raise sqlstate 'PT403' using message = 'Only the owner can revoke owner or admin invitations.'; end if;
  if i.status <> 'pending' then return i.status; end if;
  update public.invitations x set status = 'revoked' where x.id = p_invitation;
  perform public.audit(i.organization_id, 'member.invitation_revoked', 'invitation', i.id::text, jsonb_build_object('role', i.role));
  return 'revoked';
end;
$$;

-- What the invitation page shows before anyone signs in (needs the token).
create or replace function public.invitation_preview(p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare i public.invitations%rowtype; o public.organizations%rowtype;
begin
  select * into i from public.invitations x where x.token_hash = public.invitation_hash(p_token);
  if not found then return jsonb_build_object('status', 'not_found'); end if;
  select * into o from public.organizations x where x.id = i.organization_id;
  return jsonb_build_object(
    'status', case when i.status = 'pending' and i.expires_at <= now() then 'expired' when o.status = 'archived' then 'revoked' else i.status end,
    'organization', o.name, 'role', i.role, 'email', i.email, 'first_name', i.first_name, 'expires_at', i.expires_at,
    'account_exists', exists (select 1 from auth.users u where lower(u.email) = lower(i.email)));
end;
$$;

-- Accepting, for a given account (internal: the two functions below call it).
create or replace function public.accept_invitation_as(p_token text, p_user uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  i public.invitations%rowtype; o public.organizations%rowtype; v_email text; v_id uuid;
begin
  select * into i from public.invitations x where x.token_hash = public.invitation_hash(p_token) for update;
  if not found then raise sqlstate 'PT404' using message = 'That invitation link isn''t valid.'; end if;
  if i.status = 'pending' and i.expires_at <= now() then
    update public.invitations x set status = 'expired' where x.id = i.id;
    raise sqlstate 'PT422' using message = 'This invitation has expired. Ask for a new one.';
  end if;
  if i.status <> 'pending' then raise sqlstate 'PT422' using message = 'This invitation has already been used or was withdrawn.'; end if;
  select * into o from public.organizations x where x.id = i.organization_id for update;
  if o.status = 'archived' then raise sqlstate 'PT422' using message = 'This organization is no longer on Mathlete.'; end if;
  select lower(u.email) into v_email from auth.users u where u.id = p_user;
  if v_email is distinct from lower(i.email) then
    raise sqlstate 'PT403' using message = format('This invitation was sent to %s. Sign in with that email address to accept it.', i.email);
  end if;
  -- Everyone needs a profile (a first name for dashboards).
  insert into public.profiles (user_id, display_name)
  values (p_user, left(coalesce(i.first_name, split_part(i.email, '@', 1)), 60))
  on conflict (user_id) do nothing;
  -- The invitation already reserved a student's seat, so no second check.
  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (i.organization_id, p_user, i.role, 'active')
  on conflict (organization_id, user_id) do update set role = excluded.role, status = 'active', updated_at = now()
  returning id into v_id;
  update public.invitations x set status = 'accepted', accepted_at = now(), accepted_by = p_user where x.id = i.id;
  insert into public.audit_events (actor_id, actor_kind, organization_id, action, target_type, target_id, metadata)
  values (p_user, i.role, i.organization_id, 'member.joined', 'membership', v_id::text, jsonb_build_object('role', i.role, 'invitation', i.id));
  return jsonb_build_object('organization_id', o.id, 'organization', o.name, 'role', i.role, 'organization_status', o.status);
end;
$$;

-- A signed-in person accepts an invitation sent to their address.
create or replace function public.accept_invitation(p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not public.has_live_session() then raise sqlstate 'PT403' using message = 'Sign in first.'; end if;
  return public.accept_invitation_as(p_token, auth.uid());
end;
$$;

-- The join Edge Function: it has just created the account for the invited
-- address, and accepts on its behalf. Service role only.
create or replace function public.accept_invitation_new_user(p_token text, p_user uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then raise sqlstate 'PT403' using message = 'Not allowed.'; end if;
  return public.accept_invitation_as(p_token, p_user);
end;
$$;

-- Members and invitations, for the organization's Members page.
create or replace function public.org_members(p_org uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  perform public.expire_invitations(p_org);
  return jsonb_build_object(
    'members', coalesce((select jsonb_agg(jsonb_build_object('user_id', m.user_id, 'name', p.display_name, 'email', u.email, 'role', m.role,
                                 'status', m.status, 'joined_at', m.joined_at, 'updated_at', m.updated_at, 'is_me', m.user_id = auth.uid())
                                 order by m.status = 'removed', m.role, lower(coalesce(p.display_name, u.email)))
                          from public.organization_memberships m join auth.users u on u.id = m.user_id
                          left join public.profiles p on p.user_id = m.user_id
                          where m.organization_id = p_org), '[]'::jsonb),
    'invitations', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'email', i.email, 'role', i.role, 'status', i.status, 'first_name', i.first_name,
                                 'last_name', i.last_name, 'expires_at', i.expires_at, 'created_at', i.created_at,
                                 'invited_by', (select p.display_name from public.profiles p where p.user_id = i.invited_by)) order by i.created_at desc)
                              from public.invitations i where i.organization_id = p_org and (i.status = 'pending' or i.created_at > now() - interval '30 days')), '[]'::jsonb),
    'seats', public.seat_usage(p_org));
end;
$$;

-- For the CSV preview: is each address already a member or invited?
create or replace function public.check_invitees(p_org uuid, p_emails text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then
    raise sqlstate 'PT403' using message = 'You don''t manage that organization.';
  end if;
  if cardinality(p_emails) > 500 then raise sqlstate 'PT422' using message = 'Up to 500 addresses at a time.'; end if;
  return coalesce((select jsonb_object_agg(e.email,
      case when exists (select 1 from public.organization_memberships m join auth.users u on u.id = m.user_id
                        where m.organization_id = p_org and lower(u.email) = e.email and m.status in ('active', 'suspended')) then 'member'
           when exists (select 1 from public.invitations i where i.organization_id = p_org and lower(i.email) = e.email and i.status = 'pending' and i.expires_at > now()) then 'invited'
           else 'new' end)
    from (select distinct lower(btrim(x)) email from unnest(p_emails) x where btrim(coalesce(x, '')) <> '') e), '{}'::jsonb);
end;
$$;

-- Organization settings an owner or admin may change (branding comes in PRD 3).
create or replace function public.update_organization_settings(p_org uuid, p_name text default null, p_welcome text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare o public.organizations%rowtype;
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then raise sqlstate 'PT403' using message = 'You don''t manage that organization.'; end if;
  select * into o from public.organizations x where x.id = p_org for update;
  if p_name is not null and char_length(btrim(p_name)) not between 2 and 120 then raise sqlstate 'PT422' using message = 'The name needs 2 to 120 characters.'; end if;
  if p_welcome is not null and char_length(p_welcome) > 600 then raise sqlstate 'PT422' using message = 'Keep the welcome message under 600 characters.'; end if;
  update public.organizations x set name = coalesce(nullif(btrim(p_name), ''), x.name),
         welcome_message = case when p_welcome is null then x.welcome_message else nullif(btrim(p_welcome), '') end, updated_at = now()
   where x.id = p_org;
  perform public.audit(p_org, 'organization.settings_updated', 'organization', p_org::text,
                       jsonb_build_object('name_changed', p_name is not null and btrim(p_name) <> o.name, 'welcome_changed', p_welcome is not null));
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.complete_setup(p_org uuid)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v timestamptz;
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') in ('owner', 'admin')) then raise sqlstate 'PT403' using message = 'You don''t manage that organization.'; end if;
  update public.organizations o set setup_completed_at = coalesce(o.setup_completed_at, now()), updated_at = now() where o.id = p_org returning o.setup_completed_at into v;
  perform public.audit(p_org, 'organization.setup_completed', 'organization', p_org::text, '{}'::jsonb);
  return v;
end;
$$;

-- The licence and its history: the owner (billing may be owner-only) and Mathlete.
create or replace function public.org_subscription(p_org uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not (public.is_platform_operator() or coalesce(public.org_role(p_org), '') = 'owner') then
    raise sqlstate 'PT403' using message = 'Only the organization''s owner can see its subscription.';
  end if;
  return jsonb_build_object('state', public.org_license_state(p_org), 'seats', public.seat_usage(p_org),
    'history', coalesce((select jsonb_agg(jsonb_build_object('plan', s.plan_id, 'plan_name', (select p.name from public.plans p where p.id = s.plan_id),
                          'status', s.status, 'starts_on', s.starts_on, 'ends_on', s.ends_on, 'seats', s.seat_allowance, 'interval', s.billing_interval,
                          'current', s.replaced_by is null, 'created_at', s.created_at, 'cancel_reason', s.cancel_reason) order by s.created_at desc)
                         from public.subscriptions s where s.organization_id = p_org), '[]'::jsonb));
end;
$$;

revoke all on function public.invitation_hash(text), public.expire_invitations(uuid), public.accept_invitation_as(text, uuid) from public, anon, authenticated;
revoke all on function public.create_invitation(uuid, text, text, text, text), public.revoke_invitation(uuid), public.accept_invitation(text),
  public.accept_invitation_new_user(text, uuid), public.org_members(uuid), public.check_invitees(uuid, text[]),
  public.update_organization_settings(uuid, text, text), public.complete_setup(uuid), public.org_subscription(uuid), public.invitation_preview(text) from public, anon;
grant execute on function public.create_invitation(uuid, text, text, text, text), public.revoke_invitation(uuid), public.accept_invitation(text),
  public.org_members(uuid), public.check_invitees(uuid, text[]), public.update_organization_settings(uuid, text, text), public.complete_setup(uuid),
  public.org_subscription(uuid) to authenticated, service_role;
grant execute on function public.accept_invitation_new_user(text, uuid) to service_role;
-- The invitation page is opened before signing in: anyone holding the link may preview it.
grant execute on function public.invitation_preview(text) to anon, authenticated, service_role;

-- 12. Who may call what -----------------------------------------------------
revoke all on function public.is_platform_admin(), public.is_platform_operator(), public.org_license_state(uuid), public.org_license_ok(uuid),
  public.org_role(uuid), public.org_can_learn(uuid), public.has_org_learning_access(), public.my_default_org(), public.my_admin_org_ids(),
  public.my_admin_org_member_ids(), public.seat_usage(uuid), public.audit(uuid, text, text, text, jsonb), public.my_organizations(),
  public.organization_overview(uuid), public.create_organization(text, text, text, text), public.set_organization_status(uuid, text, text),
  public.add_member(uuid, uuid, text), public.update_member(uuid, uuid, text, text),
  public.save_plan(text, text, integer, text, text, integer, text, text[], text),
  public.activate_license(uuid, text, integer, date, date, text, text), public.set_subscription_status(uuid, text, text) from public, anon;
-- Helpers used by RLS and the page code:
grant execute on function public.is_platform_admin(), public.org_license_state(uuid), public.org_license_ok(uuid), public.org_role(uuid),
  public.org_can_learn(uuid), public.has_org_learning_access(), public.my_default_org(), public.my_admin_org_ids(), public.my_admin_org_member_ids(),
  public.my_organizations(), public.organization_overview(uuid), public.add_member(uuid, uuid, text), public.update_member(uuid, uuid, text, text),
  public.is_platform_operator(), public.create_organization(text, text, text, text), public.set_organization_status(uuid, text, text),
  public.save_plan(text, text, integer, text, text, integer, text, text[], text),
  public.activate_license(uuid, text, integer, date, date, text, text), public.set_subscription_status(uuid, text, text) to authenticated, service_role;
grant execute on function public.seat_usage(uuid) to service_role;
-- audit() is internal: only the functions above call it.

insert into public.schema_versions (name) values ('organizations-v1'), ('organizations-v2-invitations') on conflict (name) do nothing;
